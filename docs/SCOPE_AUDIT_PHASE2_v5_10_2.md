# SCOPE OF WORK — Standing Code Audit, Phase 2 (Section C)

**Status:** APPROVED — all five decisions resolved by Steve, 2026-08-07 (§7). Execution may begin with
sub-phase 2A.

| Field | Value |
|---|---|
| Build under audit | **v5.10.2** |
| Source | `DangerClose-v5_10_2.jsx` · md5 `7ddda3585abb9dc2c40fa4fbfc46967a` |
| Comparison baseline (prior) | v5.10.1 · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc` |
| Freshness check | PASSED this session — both hashes match `PROJECT_KNOWLEDGE_INDEX.md`; manifest version agrees with `CHANGELOG.md` |
| Phase | 2 of 4 (Section C — numerical validation to within one dollar) |
| Predecessor | `FlawsToFix-v5_10_1-Phase1.md` (Sections A + B, run against v5.10.1) |
| Governing spec | `SCOPE_STANDING_AUDIT.md` |

All line numbers below are **canonical `DangerClose-v5_10_2.jsx` line numbers**, each read from the
source in this session. None are recalled.

---

## 1. Premise (verified against source, not assumed)

Section C asks for seven things. What actually exists in this build, verified:

| Section C asks for | What the source actually contains | Verified at |
|---|---|---|
| Federal + state tax, single **and** MFJ | **Two independent tax implementations**, not one. The Taxes-tab engine and the Roth strategy comparator each compute federal ordinary tax, LTCG stacking, NIIT, AMT, SS taxability, FICA, state, and IRMAA from the same constants but in separate code | Roth comparator `runRothStrategies()` L3303–3620; Taxes-tab engine L8040–8260 |
| IRMAA border cases | Two tier-lookup implementations, differently written | Taxes/IRMAA tab `tierForMagi` L8558; Roth comparator inline lookup L3551–3557 |
| Roth break-even accounting | Wealth-crossover computed by running both policies through the full 30-year engine | Roth tab, crossover card; method note L7855 |
| Proper CPI indexation of brackets + IRMAA | Three separate `Math.pow(1.02, …)` helpers, one per engine | L3311 (`infl`), L8061 (`inflate`, Taxes), L8548 (`inflate`, IRMAA), L7392 (`inflator`, Roth tab) |
| Improper indexation of unindexed thresholds | NIIT is explicitly **not** inflated (L8213, comment says so). SS provisional thresholds are read raw from `TAX_CONSTS` each year (L8143–8144) | L8213, L8143 |
| First-spouse death handling | Spousal rollover of TDAs, filing-status flip, SS survivor step-down all present in both engines | Roth: L3375–3386; Taxes: L8138–8146 |
| All tracked accounts accounted for | Positions carry `trad` / `roth` / implicit taxable remainder; plus other accounts, income streams, contribution accrual | `retireStartBalances()` L1440; taxable sleeve derivation L8568 |

**Premise conclusion:** Section C is executable against this build, and the work is *larger* than the
audit spec's "budget a full session" estimate, because of the two-engine structure. Every case must be
computed by hand once and then compared against **two** engines, and a disagreement between them is
itself a class of finding that Section C does not anticipate.

### 1.1 Premise observations found while scoping — candidates, NOT findings

These were noticed while establishing the census. Each is *verified as present in the source* but
**not yet adjudicated** — proving or dismissing them is Phase 2 work, and each needs hand arithmetic
against primary sources before it can be called a defect. They are recorded here so the phase starts
with concrete targets rather than a blank page.

1. **Top IRMAA tier is inflated, though it is statutorily fixed.** `IRMAA_CONSTS.SGL[4] = 500000`
   and `MFJ[4] = 750000` (L811–812). The app's own Verify tab labels this line
   *"top tier fixed by law"* (L1079). Both engines nonetheless pass every tier through the 2%/yr
   inflator — Taxes/IRMAA tab L8560, Roth comparator L3555. If the top threshold is indeed unindexed
   in law, this is exactly the "improper inflation of statutorily unindexed thresholds" case Section C
   asks about, and it errs in the **non**-conservative direction (a fixed threshold modeled as rising
   understates top-tier surcharges). Must be checked against CMS/statute before being called a defect.

2. **IRMAA thresholds are indexed to the MAGI year, not the premium year.** The surcharge paid in
   year *Y* is set by *Y*'s thresholds applied to *Y−2*'s MAGI. Both engines instead compare a
   year-*Y* MAGI against year-*Y*-indexed thresholds (Taxes/IRMAA L8595 pairs `magi` and `yr`;
   Roth comparator L3555 pairs `lookM` and `yr − 2`). The two engines agree with each other, so this
   is not a cross-engine divergence — but both may be off by two years of indexation (~4%) in the
   conservative direction. No disclosure of this offset was located during the census. Needs a
   deliberate ruling: correct it, or disclose it as a stated simplification.

3. **The OBBBA senior bonus deduction is modeled, but two of three in-app disclosures say it isn't.**
   The Taxes-tab engine implements it in full — $6,000/person 65+, tax years ≤2028, phasing out at 6%
   of MAGI over $75K/$150K (L8191–8201). The Roth comparator deliberately omits it, with the reason
   given in a code comment (L3400–3402). But the Taxes-tab header text says it **is** modeled (L8299),
   the Taxes-tab footnote on the same tab says it is **not** (L8527), and Field Manual §13 lists it
   under "NOT modeled." At most one of those can be right. This is a disclosure defect rather than an
   arithmetic one, but it lands squarely in Section C's remit because a user cannot verify a number
   whose modeling status the app describes three different ways.

4. **Two engines, one law.** Beyond item 3, no systematic comparison of the Roth comparator against
   the Taxes-tab engine has ever been performed. They share constants but not code. Any case where
   they disagree on the same household-year is a finding unless the divergence is both documented in
   code *and* disclosed to the user.

---

## 2. Site census — the code Phase 2 touches

Read-only. Phase 2 produces documents and (pending §7.2) test files; it changes no app source.

### Shared constants and helpers
| Site | Lines | Role in Phase 2 |
|---|---|---|
| `TAX_CONSTS` | 781–807 | Every federal figure under test; single source of truth |
| `IRMAA_CONSTS` | 810–814 | Tier thresholds + per-person surcharges |
| `STATE_RULES` (51 jurisdictions) | 847–899 | State approximation layer |
| `stateTaxAnnual()` | 907–924 | The one shared state calculator — used by all three consuming engines |
| `rmdDivisor()` | 1135 | Uniform Lifetime Table, ages 72–100 + floor |
| `rmdStartAge()` | 486–492 | SECURE 2.0 age 73/75 by birth year |
| `buildVerificationChecks()` | 1053–1120 | The 54 in-app constant assertions — overlaps Phase 2's inputs (see §5) |
| `ACA_CONSTS` + `acaSubsidyAnnual()` | ~995–1048 | Already hand-verified at v5.7/v5.10.1 (TESTING.md) — see §6 |

### Engine A — Roth strategy comparator
| Site | Lines |
|---|---|
| `runRothStrategies()` entry, constant destructure | 3303–3312 |
| `infl()` bracket inflator | 3311 |
| `fedTaxF()` / `ltcgF()` | 3314–3325 |
| Widow flip, SS step-down, spousal rollover | 3375–3386 |
| Deduction assembly (senior extras; bonus deliberately omitted) | 3396–3403 |
| Policy solvers (bracket fill, IRMAA cap, ACA cliff) | 3410–3500 |
| NIIT / AMT / state / FICA / IRMAA assembly | 3520–3560 |

### Engine B — Taxes tab
| Site | Lines |
|---|---|
| Constants, filing-status locals, `inflate()` | 8045–8061 |
| `fedOrdinaryTax()` / `marginalBracket()` / `ltcgTax()` | 8063–8100 |
| SS provisional-income taxability | 8100–8110 |
| Widow flip + SS step-down | 8138–8146 |
| Deductions incl. OBBBA senior bonus | 8185–8201 |
| NIIT | 8208–8213 |
| AMT (simplified) | 8215–8240 |
| Total assembly + row emit | 8243–8258 |
| User-facing method disclosures | 8299, 8527 |

### Engine C — IRMAA tab
| Site | Lines |
|---|---|
| `inflate()`, tier construction, `tierForMagi()` | 8548–8563 |
| MAGI construction + 2-year lookback | 8565–8602 |

### Survivor / first-death surface
| Site | Lines |
|---|---|
| Roth engine survivor block | 3375–3386 |
| Taxes engine survivor block | 8138–8146 |
| `SURVIVOR_SPEND_FACTOR` | 966 |
| Survivor tab | (to be censused at 2C — not needed before then) |

### Account-completeness surface
| Site | Lines |
|---|---|
| `retireStartBalances()` | 1440–1450 |
| `contribAccrual()` | 1417–1439 |
| Taxable sleeve derivation (balance − roth − trad) | 8568 |
| `getIncomeStreams()` / `streamsAnnualAt()` | 451–483 |

**Excluded from all greps and edits:** `DOCS_HTML`, canonical line **3213** (one line, ~200KB). The
census above was produced against a docs-stripped working copy with line numbers converted back to
canonical and each one re-read from the canonical file to confirm.

---

## 3. Method (how "to within one dollar" is satisfied)

Per the audit's standing methodology, reading code and judging it plausible does **not** satisfy
Section C. Every case follows this sequence, in this order:

1. **Fetch the governing figure from the primary source** (IRS Rev. Proc. 2025-32 for 2026 brackets and
   deductions; Rev. Proc. 2025-25 for ACA applicable percentages; CMS for IRMAA; SSA for the wage base
   and survivor rules; IRC §1411 for NIIT; IRS Pub. 590-B for the RMD table). Cite it.
2. **Compute the expected figure by hand** from that source, in writing, before looking at engine output.
3. **Construct the case as an explicit `P` object** — hand-built inputs, never the demo household
   (the t3 pattern). `asOfYr` is mandatory; omitting it silently NaNs every tax figure.
4. **Neutralize global income streams** so the case tests what it claims to test.
5. **Run both applicable engines** and compare to the hand figure and to each other.
6. **Record the delta.** Zero → the case passes. Non-zero → finding, with the suspected cause traced to
   a line.

**Border discipline:** for every threshold under test, the case set includes the exact boundary,
one dollar below, and one dollar above. Thresholds in scope: each federal bracket top (7 per status),
the LTCG 0%/15% and 15%/20% breaks, NIIT $200K/$250K, SS provisional tier 1 and tier 2, all five IRMAA
tier boundaries, the OBBBA bonus phase-out start and its exhaustion point, RMD start ages 73/75, and
the ACA 400% cliff (already done — §6).

**Adjudication rule:** a simplification disclosed in-app *and* in METHODOLOGY is a limitation, not a
defect, and is recorded as such. An undisclosed one is a defect. Where disclosures conflict with each
other (premise observation 3), the finding is the conflict.

---

## 4. Sub-phases and their contents

Section C does not fit one session. Splitting it is the point of this scope. Proposed split, each
sub-phase self-contained and independently reportable:

| Sub-phase | Contents | Est. |
|---|---|---|
| **2A — Federal core** | Ordinary brackets both statuses; standard deduction + age-65 extras + OBBBA bonus; LTCG stacking on ordinary income; NIIT; SS provisional-income taxability. Both engines, cross-compared. All borders ±$1. | 1 full session, possibly 1½ |
| **2B — IRMAA + indexation discipline** | All five tier borders ±$1; per-person surcharge; the 2-year lookback pairing; and a systematic audit of *which* constants receive the 2% inflator and which must not — covering premise observations 1 and 2. | 1 session |
| **2C — First-spouse death** | TDA spousal rollover; RMD age governance after rollover; filing-status flip year; SS survivor benefit (including whether early-claim reductions carry to the survivor); survivor spending factor. Both engines. | 1 session |
| **2D — Roth break-even + account completeness** | Whether the wealth-crossover is defensible financial accounting (discounting, opportunity cost of conversion tax, face-value vs heir-discounted comparison); and whether every tracked account and income stream reaches every engine. | 1 session |
| **2E — State tax** | Both statuses across a representative sample of the 51 jurisdictions: a no-tax state, a flat state, a `retExempt` state, an `excl65` state, and one of the eight partial-SS states. Tests whether the code implements the *documented approximation* correctly — not whether the approximation matches real law, which is already disclosed. | ½ session |

**Confirmed order: 2A → 2B → 2C → 2D → 2E** (decision D-1, §7). 2A establishes the case-construction
harness every later sub-phase reuses, and the largest share of Section C's surface lives there.

---

## 5. Deliverables

Per sub-phase:

- **`FlawsToFix-v5_10_2-Phase2<x>.md`** — findings in the standing format (what · where · suspected
  cause · severity · creator-side vs user-side), pinned to version + hash, following the Phase 1
  document's shape.
- **A hand-computation appendix** inside that document: every case, its primary-source citation, the
  hand arithmetic, and the engine output side by side — so a reader can re-derive any figure without
  trusting the summary. This is the artifact that makes "to the dollar" auditable rather than asserted.
- **`qa/t10_taxcases.mjs`** — the same cases as permanent, dollar-exact assertions, authored during
  each sub-phase and appended to across sub-phases (decision D-2, §7). Held in the deliverables tree
  and **not shipped as its own release**; it rides with the next release that has an independent reason
  to exist, at which point TESTING.md's counts change with it.

At the end of Phase 2 (after 2E), a short roll-up naming which of Section C's seven bullets were
satisfied, which were partially satisfied, and which remain — written to the honesty standard in the
audit spec's methodology item 6.

---

## 6. Explicitly out of scope

- **Sections D, E, F.** D and E follow from C's findings (Phase 3); F is independent (Phase 4).
- **ACA subsidy arithmetic.** Already hand-verified from primary sources at v5.7 and re-verified at
  v5.10.1/v5.10.2 (TESTING.md, the published case table). Phase 2 re-checks it only where an ACA figure
  feeds a case under test — e.g. the cliff strategy's effect on MAGI — not the subsidy formula itself.
- **Constant re-verification wholesale.** The Verify tab already asserts 54 statutory constants live,
  and t1 runs those checks headless. Phase 2 spot-checks roughly five of them against primary sources
  to confirm the Verify tab is not merely self-consistent, then treats the rest as given and tests the
  **formulas** that consume them. Section C is about arithmetic, not about the constant table.
- **The Backtest tab.** It models no taxes by design and is disclosed as such.
- **Any source change.** Phase 2 finds and documents; it does not fix. Fixes are scoped separately,
  per release, with their own tests — the B-2 → v5.10.2 path is the template.
- **Simulation engines (Monte Carlo / stress / extended MC).** Their statistical properties are t2's
  job; Section C is deterministic tax arithmetic.

---

## 7. Decisions — RESOLVED (Steve, 2026-08-07)

All five were put as open decisions with a stated recommendation; all five recommendations were
accepted. They are recorded here as binding for the whole of Phase 2, so a later session does not
relitigate them. Each carries the reasoning, not just the ruling, and — where there was a real
counter-argument — what was given up by choosing this way.

---

### D-1 · Sub-phase order: **2A → 2B → 2C → 2D → 2E**

**Decision:** run the sub-phases in the order listed in §4, starting with 2A (federal core).

**Why.** 2A holds the largest share of Section C's surface — brackets both statuses, deductions,
LTCG stacking, NIIT, SS taxability — and every later sub-phase needs the same apparatus built first:
explicit hand-built `P` objects with `asOfYr` set and global income streams neutralized. Building that
in 2A means 2B–2E reuse it rather than rebuilding it. Starting elsewhere builds the same harness and
still leaves 2A owed.

**What this gives up.** Two of the three premise observations in §1.1 live in 2B, so the two IRMAA
indexation questions wait one sub-phase longer than they would under a 2B-first order. Accepted:
they are candidates, not confirmed defects, and neither is user-facing-urgent.

---

### D-2 · The hand-computed cases become a permanent test file — but do not ship alone

**Decision:** author `qa/t10_taxcases.mjs` during each sub-phase, carrying every hand-computed case as
a dollar-exact assertion. Do **not** cut a release for it. It rides with the next release that has an
independent reason to exist; TESTING.md's per-suite counts change at that point, not before.

**Why (the test file).** Every Section C case is, by construction, a figure computed from primary law
and asserted to the dollar — the exact material the suite is made of. Left in a markdown appendix, a
case is a claim nobody re-runs, and the next release can silently break it. In `t10` it is a standing
extinction invariant. Cost is roughly 20% more time per sub-phase.

**Why (not its own release).** A release exists to change the app. A test-only release would bump the
version at all four in-app sites, change TESTING.md's counts, and force a knowledge rotation while
changing nothing a user experiences. It would also blur the standing rule that the audit is **not** a
release gate — a release ships on its own scope plus a green suite, and the audit is a separate,
deeper pass. Holding `t10` keeps that boundary clean.

**Operational consequence.** Between sub-phases, `t10` lives in the deliverables tree and is run
manually alongside the suite. It does not enter the published count until it ships. Any release cut
during Phase 2 states its counts without `t10` and is correct to do so.

---

### D-3 · A cross-engine disagreement is a defect unless documented **and** disclosed

**Decision:** where the Roth strategy comparator and the Taxes-tab engine produce different figures for
the same household-year, that is a finding — **unless** the divergence is both (a) documented in a code
comment naming the reason, and (b) disclosed to the user somewhere they would plausibly look. Failing
either test makes it a finding. Failing only (b) makes it a disclosure defect rather than an arithmetic
one, and is recorded with that distinction.

**Why.** Premise observation 3 is the argument in miniature. The code comment at L3400–3402 is
exemplary: it states that the Roth engine omits the OBBBA senior bonus and gives two real reasons (the
provision expires before typical conversion windows; including it would make the bracket-fill solver
circular). That is a defensible modeling choice, correctly recorded for a maintainer. But a user
comparing the Roth tab's numbers against the Taxes tab's sees two different answers for the same year,
with three mutually contradictory statements in the app about whether the deduction exists at all.
Documentation-in-code protects the maintainer; disclosure protects the user. Section C requires both,
because the app's entire premise is that a skeptical reader can check its numbers.

---

### D-4 · Both IRMAA indexation questions are adjudicated together in 2B; any fix is one release

**Decision:** premise observations 1 (top tier inflated though statutorily fixed) and 2 (thresholds
indexed to the MAGI year rather than the premium year) are ruled on together in sub-phase 2B. If either
proves out, the fix is scoped as a single small release covering both.

**Why.** They are the same mechanism — which constants the 2%/yr inflator is permitted to touch — and
they are fixed at the same small number of sites (L8560, L3555, and the tier construction above each).
One fix site, run once against the MC-parity guardrail, is far easier to hold at 8/8 than two separate
releases each risking engine drift. Splitting them doubles the parity exposure for no gain.

**Noted asymmetry, which does not change the decision but will shape the fix.** The two err in
opposite directions. Modeling a statutorily fixed top threshold as rising makes the plan look
**better** than it should — against the standing design default of choosing the conservative direction.
The two-year indexation offset runs the other way and makes the plan look slightly **worse**, which is
the direction the design default would choose anyway. So one may resolve as a defect and the other as
an undisclosed-but-acceptable simplification needing only a disclosure. That determination is 2B's
arithmetic to make, not this scope's.

---

### D-5 · 2E tests five state archetypes plus Steve's own state

**Decision:** sub-phase 2E verifies `stateTaxAnnual()` against one jurisdiction of each archetype — a
no-tax state, a flat-rate state, a `retExempt` state, an `excl65` state, and one of the eight partial-SS
states — plus Steve's own state of residence if it is not already among the five.

**Why.** `stateTaxAnnual()` (L907–924) is one function with five behavioral branches; the archetypes
exercise every branch. Testing all 51 jurisdictions would consume a session to re-confirm the same five
code paths with different constants. The archetypes prove the code does what the docs say; Steve's own
state proves the number he would personally act on.

**Scope boundary restated.** 2E asks whether the code implements the *documented approximation*
correctly. Whether an effective flat rate is a good stand-in for a progressive state schedule is
already a disclosed limitation (Field Manual §13, the state module's own header comment at L836–846),
and is therefore not a defect. A state whose modeled treatment contradicts its own `note` string
**is** a defect.

---

## 8. Honesty statement

This scope was written after a source census of v5.10.2 performed in this session. Every line number
cited was read from the canonical file; none is recalled. No arithmetic has been performed yet — the
premise observations in §1.1 are structural findings about *what the code does*, not claims about
whether the resulting numbers are wrong. Proving them either way is Phase 2's job, and doing so
requires the primary-source arithmetic this document commits to.

If a sub-phase's session budget cannot complete its case set to the dollar, the deliverable will say
so explicitly and list what remains, rather than presenting a thin pass as complete.

The five decisions in §7 were resolved on 2026-08-07 and are binding for the remainder of Phase 2. If
mid-phase evidence contradicts one of them — for instance, if 2A shows the two engines diverge so
widely that D-3's adjudication rule produces an unmanageable finding count — the correct response is to
STOP and report, not to reinterpret the decision silently.
