# SCOPE — an income-conditioning field for state exclusions (D-11 (c))

| | |
|---|---|
| Status | **DECISIONS RESOLVED 2026-09-02 — all seven as recommended. NOT yet buildable: D-7 puts a narrow ROUND5 audit first, and D-2 depends on its answer.** Next artifact is `AUDIT_STATE_INCOME_BASES_ROUND5.md`, not code. |
| Premise measured against | shipped **v5.60**, source `23877f903a14ba43dd707a43d98b0df4`, clone `33f699d`, 2026-09-02 |
| Parent findings | `MissingFeatures.md` **D-11 (c)** · `AUDIT_STATE_EXCL65_ROUND4.md` §2a, §2b, §4 · `AUDIT_STATE_EXCL65_ROUND3.md` §4 |
| Kind | **Data-model feature.** Engine code changes. This is not a rule-table edit. |

---

## 1 · Why this exists, and why it is not another state release

Five states' exclusions and two states' Social Security treatment are conditioned in law on income,
and the data model cannot hold a condition. `excl65` is a scalar and `persons65` is a count, so every
income-limited provision is currently applied **unconditionally**.

The consequence is that the app grants households a break the statute denies them:

| state | statute conditions on | what the model does | direction |
|---|---|---|---|
| **NM** | nine-band step, **$0 above $51,000** AGI (MFJ), never indexed since 1987 | grants $8,000 per person always | optimistic, and for the target household the provision **does not exist** |
| **RI** | hard AGI cliff, TY2025 $133,500 MFJ / $107,000 single | grants $50,000 per person always | optimistic above the cliff |
| **VA** | income-limited age deduction | applied unconditionally | optimistic above the limit |
| **NJ** | income-limited pension exclusion | applied unconditionally | optimistic above the limit |
| **CT** | income-limited pension/IRA exemptions | **not modelled at all**, and says so | — |

**The maintainer's instruction of 2026-09-02 governs this work**: state tax rules are not assumptions,
so the project's conservative-direction tiebreaker does not apply to them. Where the statute is
knowable and the model can express it, model it. Where the model *cannot* express it, the answer is
to make the model able — not to pick a scalar and lean it pessimistic. That is what this scope is
for, and it is why "ship New Mexico as a disclosed scalar" is not the recommendation.

Note what the table shows: **the existing simplifications run optimistic, not conservative.** The
conservative default was never load-bearing here, so nothing shipped needs unwinding — but the
excuse "it is disclosed and the app leans pessimistic anyway" was never available either.

---

## 2 · Premise — measured, not assumed

### 2.1 `stateTaxAnnual` has exactly three call sites, in three engines

AST census against v5.60 (`census.cjs v560.jsx stateTaxAnnual`) — 4 hits, one definition and three
calls:

| line | enclosing | notes |
|---|---|---|
| **1114** | *definition* | `function stateTaxAnnual({ code, fallbackRate, retIncome, pen, work, capGains, ssTaxableFed, ssGrossA, ssGrossB, ageA, ageB, single, persons65 })` |
| **3996** | `_estSaleGain` ← `run` ← `runRothStrategies` | the gross-up mirror |
| **4114** | `run` ← `runRothStrategies` | the Roth ladder engine |
| **5265** | `computeTaxPlan` | the main tax plan |

**The three call sites do not pass the same fields.** L3996 and L4114 fold pension and work into
`retIncome` (`Math.max(0, taxableOrd - ssT)`) and pass no `pen` or `work` at all; L5265 passes
`retIncome: rmdTax_y + conv_y`, `pen: pen_y`, `work: work_y + otherOrd_y` separately. Any income
measure built inside `stateTaxAnnual` from its own arguments must therefore be proven to **sum to
the same thing** across all three, or the app answers one statutory question three ways.

### 2.2 ⚠ THE FINDING — the app already carries FOUR different MAGI definitions, and nothing compares them

This is the premise fact that changes the shape of the work, and it was not in D-11 (c).

| line | context | definition |
|---|---|---|
| 4102 | Roth ladder engine | `grossOrd + qdcg` |
| 4491 | `computeIrmaaPlan` | `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| 4952 | `computeWithdrawalPlan` | `taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y` |
| 9047 | a render block | `pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder` |

**No suite asserts these agree.** Eighteen suite files mention `magi`; none contains a parity,
equality or agreement assertion across engines. `METHODOLOGY.md` already documents one divergence in
its own words — the ladder's MAGI omits dividend income and realized capital gains that the IRMAA
engine includes — and calls it "a separate and larger correction."

**Why this matters here more than it did before.** v5.43 closed exactly this class for §86: the app
was "answering one statutory question two ways depending on which tab was open," and the fix shipped
with an invariant reading *term sets equal, values equal, with no carve-out*. Hanging a state
income threshold off the nearest available MAGI would recreate that defect on a new statute — a
household would qualify for New Mexico's exemption on one tab and not on another.

**So the hard part of this feature is not the `STATE_RULES` field. It is defining ONE state-income
measure and proving all three call sites compute it identically.** The field is the easy half.

### 2.3 What `STATE_RULES` can hold today

51 entries, flat objects of scalars: `name`, `rate`, `ss`, `retExempt`, `excl65`, `exclAge`, `note`.
`exclAge` (added v5.55, extended v5.60) is the precedent for an optional per-state field and is read
in exactly one place. Nothing in the table is nested, so a band table would be the first
non-scalar value — see §7 D-3 for whether that matters to the whole-table assertions.

### 2.4 What was NOT established, stated plainly

- **Which income base each statute actually names.** New Mexico's § 7-2-5.2 and Rhode Island's
  cliff both key off adjusted gross income, but Virginia's is "adjusted federal adjusted gross
  income" and **New Jersey's gross income excludes Social Security entirely**. These were not
  re-read for this scope. A single measure is an approximation whose size is unmeasured.
- **Whether New Mexico's stepped table interacts with its graduated rate schedule** — carried
  unresolved from ROUND4 §3.
- **Rhode Island's TY2026 indexed thresholds** (ADV 2025-22) — located but never read. TY2025 is
  still the only verified pair.
- **Connecticut, New Jersey and Virginia's current figures** were not verified for this scope at all.
- **How often any threshold actually binds** — see §6, which is why that is the first deliverable.

---

## 3 · Site census — what the build would touch

| site | what |
|---|---|
| `stateTaxAnnual` L1114 | signature gains an income measure or its components; `_floor` logic gains a band lookup |
| call sites L3996 / L4114 / L5265 | each must supply whatever the measure needs, identically |
| `STATE_RULES` | new optional field on NM, RI, VA, NJ (+ CT if it stops being unmodelled) |
| notes for those states | every one currently discloses the limitation as unmodelled; all must be rewritten |
| `t10` §2E | the whole-table assertions, the F-6 guarded set (currently 4: NJ, NM, RI, VA), the note-vs-code invariant |
| `t29` L212 | the F-6 matcher — states leaving the guarded set is the *point* of this release |
| `t31` | disclosure-parity keys for any figure that becomes real |
| `METHODOLOGY.md` | mandatory; plus the state-tax paragraph the maintainer's rule needs stated explicitly |

---

## 4 · Explicitly OUT of scope

- **The `ss: 0.5` blend across the eight partial-SS states.** It is the same defect class — no
  statute contains a 50% — and it is the natural *next* release. Bundling it destroys attribution
  for both. The field should be designed so Social Security can use it later (§7 D-4).
- **Fixing the four-way MAGI divergence** (§2.2). Contained rather than fixed, if D-1 resolves to a
  self-contained measure. Recorded as its own finding either way.
- **Re-auditing CT, NJ, VA figures**, and the nine of nineteen exclusion states still unchecked.
- **Any state's rate, `retExempt`, or `exclAge`.**
- **RI's IRA-versus-employer-plan distinction.** Different problem: the statute is known and the
  *household's facts* are not. It needs an input, not a threshold.

---

## 5 · Tests this would ship with

- Hand-computed cells for each populated state **on both sides of every threshold**, and — for New
  Mexico — inside at least three of the nine bands, since a cliff implementation would pass a
  two-sided test and fail a band.
- **A cross-engine parity invariant**: the same household priced through all three call sites yields
  the same state-income measure and the same state tax. This is the guardrail §2.2 says is missing,
  and it is the single most valuable test in the release.
- Boundary pins **at** each threshold (at, one dollar below, one dollar above) — cliffs are exactly
  where an off-by-one hides.
- An extinction invariant: **no state whose note claims an income limit may carry an unconditional
  exclusion**, the generalisation of the v5.60 note-vs-code check.
- Negative controls that revert each new field and each threshold, per §B2, **read individually**.

---

## 6 · First deliverable is a measurement, not code

Before any decision below is answerable, one number is needed: **how often does each threshold
actually bind for the households this app models?**

⚠ **This cannot be measured from the existing fixtures.** `qa/tools/fixture/households.mjs` holds
boundary-clearing variants of one shipped example household — each built to sit on or clear exactly
one named boundary — so counting them says nothing about a population. And **the engines compute no
AGI-like state income at all**, so there is currently nothing to compare a threshold against.

The measurement therefore needs a purpose-built set of households spanning plausible spending and
portfolio levels, and it needs the income measure from D-1 to exist first. That is not a detour:
**defining the measure is the first step of the feature and of the measurement alike**, which is why
shipping New Mexico as a scalar is not meaningfully cheaper than doing this properly.

---

## 7 · Decisions — RESOLVED 2026-09-02, all as recommended

> Maintainer approved all seven on 2026-09-02. Recorded verbatim below with the resolution on each.
> **The build is still gated**: D-7 requires the ROUND5 audit first, and D-2 cannot be answered until
> ROUND5 establishes New Jersey's income base.

**D-1 · Where does the state income measure come from?**
(a) reuse the nearest existing MAGI at each call site — cheapest, and bakes §2.2's divergence into a
new statute; (b) compute it **inside `stateTaxAnnual`** from the arguments it already receives —
identical by construction, no new plumbing, but §2.1 shows the three call sites pass different field
sets and the sums must be proven equal; (c) compute one measure upstream and thread it through all
three engines — most correct, most invasive.
**Recommendation: (b)**, with the §5 cross-engine parity invariant as the proof obligation. It is the
only option that cannot silently diverge, because there is only one expression.

**D-2 · One income base, or per-state bases?**
Each statute names a different base, and New Jersey's genuinely excludes Social Security.
**Recommendation: one base now**, with the divergence disclosed per state in its note and NJ flagged
explicitly — *provided* §6's measurement shows the approximation is small. If NJ's base moves it
across its threshold in normal years, NJ stays unmodelled rather than modelled wrongly.

**D-3 · Cliff-only shape, or a general band table?**
RI, VA and NJ are cliffs; New Mexico is nine bands. A cliff-only field would need migrating later.
**Recommendation: a general shape** — an ordered list of `{ upTo, amount }` — with a cliff expressed
as two rows. Costs little more now and avoids a second migration. ⚠ This would be the first
non-scalar value in `STATE_RULES`; the whole-table assertions in `t10` must be checked against it
before building, not after.

**D-4 · Design for Social Security now, or later?**
**Recommendation: design for it, use it later.** The SS cliffs are the same shape, so the field
should be able to express them — but populating them belongs to the `ss: 0.5` release, out of scope
here per §4.

**D-5 · What about the four-way MAGI divergence itself?**
**Recommendation: do not fix it in this release, but log it as a finding in its own right and add
the cross-engine parity invariant for the *state* measure only.** If D-1 resolves to (b), state tax
is insulated from the divergence and the two problems stay separable. It should get its own scope.

**D-6 · Does this release change any state's output before all five are populated?**
**Recommendation: no.** An unpopulated state behaves exactly as it does today. That makes the field
shippable independently of the state-by-state corrections, and each state then becomes a small,
attributable release of its own.

**D-7 · Does a ROUND5 audit come first?**
§2.4 lists four unverified statutory facts, and D-2 depends on one of them.
**Recommendation: a narrow ROUND5 covering only the income BASE and thresholds for NM, RI, VA, NJ, CT
— not a full re-audit.** Building the field against unverified bases is how a correct mechanism ends
up carrying wrong numbers.

---

## 8 · Build record

*(empty — this scope has not been built)*
