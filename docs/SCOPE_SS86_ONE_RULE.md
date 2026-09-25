# SCOPE — Engine A's §86 upper tier (C-4), one §86 rule for every engine, and METHODOLOGY's §86 passage (D-1)

**FULFILLED — shipped in v5.77 (2026-09-25).** Every item in §4–§5 and all five decisions were built; see §9 for what the
build found that this document did not say. Retained in the repo as the record. **Decisions RESOLVED 2026-09-24 — D-1 to D-5 all adopted as recommended (§7). Buildable.** Step 1 found two things §3
did not expect (§1e, §1f); D-5 brings §1f into this release. **Resume at step 2** — see §8's step-1 status note. Built against **v5.76**, source `66b0dd944333a53f4cc00a54b9e3d618`. Findings C-4 and
D-1 in `docs/FlawsToFix-v5_73-Phase2.md`.

## 1 · Premise — verified on v5.76 by execution, not recalled

**1a. The defect reproduces exactly.** Engine A's `ssTaxF` (L4195) computes the upper tier as
`min(0.85 × ss, 0.5 × min(prov − t1, t2 − t1) + 0.85 × (prov − t2))` — word for word the expression Engine B's own v5.45
comment records as the defect it fixed. The audit's probe (`audit_c4.mjs`, pointed at v5.76; single filer born 1958,
2026, deductions $16,100 + $2,050):

| SS / pension | Engine A tax | §86-correct | Overstatement |
|---|---|---|---|
| 6,000 / 32,000 | 2,026 | **1,876.00** (taxable SS 3,850) | **+150** |
| 8,000 / 31,000 | 1,936 | **1,876.00** (4,850) | **+60** |
| 6,000 / 34,000 (control: 85% cap binds) | 2,266 | 2,266.00 | 0 |
| 24,000 / 40,000 (control: large benefits) | 4,750 | 4,750.00 | 0 |

**Hand check of the first row, from the statute** (not from the probe's own formula): provisional income 32,000 + ½ ×
6,000 = 35,000. §86(a)(1): lesser of ½ × 6,000 = 3,000 and ½ × (35,000 − 25,000) = 5,000 → 3,000. §86(a)(2): 85% ×
(35,000 − 34,000) = 850, plus the lesser of 3,000 and ½ × (34,000 − 25,000) = 4,500 → 3,000; total 3,850, under 85% ×
6,000 = 5,100. Tax: 32,000 + 3,850 − 18,150 = 17,700 → 1,240 + 12% × 5,300 = **$1,876**. Engine A uses 5,100 → $2,026.

**1b. The example household is unaffected — measured, not inferred.** The Roth tab's exact engine input for the example
household was captured from a rendered session (a session-only instrumented build) and fed to v5.76 and to a
session-only copy with Engine A corrected. **All seven strategies' `totTax` and `widowTax` are identical.** Consistent
with the arithmetic: the dropped limb binds only when a year's benefits are under $9,000 (single) / $12,000 (joint), and
the example's smallest benefit year is spouse B alone at $15,600 (claims in January, so no small pro-rated claim year).

**1c. Who is affected.** A household with **small annual benefits** in some year *and* provisional income above the
adjusted base: a low-earning single retiree; a year in which only a small benefit is in payment; a claim late in the
year, whose claim year is pro-rated by month. Direction **pessimistic** (Engine A overstates taxable SS and tax), bounded
at $1,838 (single) / $2,463 (joint) of taxable SS per year. It affects only the Roth tab's comparisons (Engine A).

**1d. D-1 reproduces.** METHODOLOGY's §86 passage says the half-benefits cap "is applied in both places as of v5.45",
then a later paragraph still says the engine's cap and the Roth tab's middle tier "remain uncorrected… scheduled to ship
together" — pre-v5.45 text never removed. Neither paragraph mentions Engine A. (Line numbers to be re-read at build.)

**1e. Found at build step 1 — `t24` §D tests a copy of dead code, not the app.** The Roth tab's middle tier carries a
comment "[KNOWN DEFECT — found 2026-08-21, pinned not fixed, see t24 §D]", but the code beneath it has used the statutory
½-of-benefits cap since v5.45 — the comment is stale. `t24` §D asserts the defect against `midApp`, a formula
"transcribed from v5.41/v5.42 source", so it has passed on every build since v5.45 while testing nothing the app runs,
and its own "FLIP THIS PIN WHEN FIXED" could never trigger. *Inside D-1's shape:* once the tab calls the shared helper,
§D is rewritten to test the real function and flipped, and the stale source comment removed.

**1f. Found at build step 1 — Engine C taxes a SINGLE household's Social Security with the JOINT thresholds.**
Executed on a 160-cell grid against the IRS worksheet (lines 1–18, written independently in the probe): **Engine B agrees
on all 160 cells, to the cent; Engine C disagrees on 55**, by up to $7,000 of taxable SS. Cause, L4881/L4942:
`filingSingleI = !_singleI && yr > _deathYr1` is true only in a *married* household's widowed years, and Engine C takes
its §86 thresholds from `taxFactsFor(filingSingleI)` — so a household single from the start gets $32,000/$44,000
instead of $25,000/$34,000. Its IRMAA **tier table** is right (L4836 builds it from the single constants); only the §86
thresholds are wrong. §3 recorded Engine C as correct because its *formula* is; the audit read it and did not execute it.

**Effect — optimistic, IRMAA tab only:** single retiree, $60,000 SS, $62,500 pension (2026): v5.76 MAGI $109,725, no
surcharge; corrected MAGI **$113,500**, tier 1, **$1,150** lifetime IRMAA. A session-only copy with
`taxFactsFor(_singleI || filingSingleI)` matched the worksheet's MAGI in every case tried. Married households are
unaffected (they file jointly until the year after a death, when `filingSingleI` is already right). **This is a new
finding, not C-4, and it contradicts §3's premise — so the build stopped here for decision D-5.**

## 2 · The law — primary sources

- **26 U.S.C. §86(a)** (uscode.house.gov, laws in effect July 7, 2026). (a)(1): the lesser of ½ of benefits or ½ of the
  excess of provisional income over the base amount. (a)(2), above the adjusted base: the lesser of **(A)** 85% of the
  excess over the adjusted base **plus the lesser of the (a)(1) amount or ½ × (adjusted base − base)**, and **(B)** 85% of
  benefits. §86(c): base $25,000 / $32,000, adjusted base $34,000 / $44,000 — statutory, unindexed.
- **2025 Form 1040 instructions, Social Security Benefits Worksheet — Lines 6a and 6b.** Line 14 is "the smaller of line 2
  or line 13" — line 2 is ½ of benefits, line 13 is ½ of the excess capped at $9,000 / $12,000 (lines 10–12). **Line 14 is
  precisely the limb Engine A drops.** Line 18: the smaller of line 16 and 85% of benefits.

## 3 · Site census — parser output on v5.76, not greps

The §86 thresholds reach code only through `taxFactsFor` (`ssThr1`/`ssThr2`, L941). `census.cjs ssThr2 --kind=prop` —
**four live implementations of the same rule**:

| Site | Line | Form | Status |
|---|---|---|---|
| Engine A `ssTaxF` | L4195 (reads t1/t2 at L4298); called L4359, L4369, L4426 | drops the ½-benefits limb | **C-4** |
| Engine C, inline | L4952–4954 (thresholds L4942) | formula correct (`_para1`); **thresholds wrong for a single household** | executed at step 1 — **§1f, fixed by D-5** |
| Engine B `taxableSSPortion` | L5630 (thresholds L5580, L5692) | correct since v5.45 | executed |
| Roth tab display | L9606 | correct since v5.45 (both tiers); stale "KNOWN DEFECT" comment above it | reachable only via the DOM until it calls the helper — **§1e** |

Engine D's flat 85% (L5360-area) is finding **C-5** — a display column — and is out of scope. **Four copies of one rule is
why C-4 survived:** v5.45's census named two places, and its fix reached the copies it named.

## 4 · The fix — options in §7; the recommended shape

- **One module-level helper**, `taxableSS86(ssBenefits, otherIncome, t1, t2)`, written from the IRS worksheet's lines, and
  **all four sites call it**: Engine A, B, C and the Roth tab. Engine A is corrected by the substitution; for B, C and the
  tab the substitution must change **nothing**, which the tests prove to the cent.
- **METHODOLOGY:** replace the contradictory passage with one accurate description — one rule, one helper, every engine
  that uses it — and cite §86 and the worksheet's line 14.

## 5 · Tests

- **`t43` (new, both legs).** Engine A's worked cases: the v5.76 leg pins +$150 / +$60 as dated known defects; the new leg
  asserts the §86 figures to the dollar, controls unchanged.
- **Oracle sweep:** an independent implementation of the IRS worksheet (lines 1–18, written in the test) against the
  helper over a grid of benefits × other income × filing status, crossing every border (base, adjusted base, the
  $9,000/$12,000 cap, the 85% cap) — to the cent.
- **Engine C, single household (D-5):** Engine C's taxable SS (MAGI minus the household's other income, in a household
  whose only other income is pension) must equal the worksheet on every cell of the grid, single **and** joint; the v5.76
  leg pins the 55-cell divergence as a dated known defect; one IRMAA case pinned to the dollar ($60,000 SS / $62,500
  pension: tier 1, $1,150 lifetime on v5.77; tier 0, $0 on v5.76).
- **`t24` §D rewritten (§1e):** test the shared helper, not the `midApp` transcription; flip its pins to the statutory
  behaviour as its own header instructs, and delete the stale "KNOWN DEFECT" comment in the Roth tab's source.
- **Four-site agreement:** Engine A, Engine B and Engine C each compute taxable SS for the same household-years and must
  agree with each other and with the oracle; the Roth tab's figure is checked where the harness reaches it.
- **Extinction (structural, by parser):** no function other than the helper reads `ssThr1`/`ssThr2` — run through the
  project's own `census.cjs`, so a fifth private copy fails the suite.
- **Example household unchanged:** the full suite's Roth-tab pins (`t3`, `t16`, `t23`–`t28`) must not move; `domdiff`
  identical.
- **Negative controls:** drop the ½-benefits limb from the helper (sweep and worked cases fire); give Engine C a private
  defective copy (agreement and the structural check fire); remove the 85% cap (the cap-binding control fires); **restore
  Engine C's `taxFactsFor(filingSingleI)` (the D-5 single-household cells and the IRMAA pin fire).**

## 6 · Out of scope

C-5 (Engine D's flat-85% display column and its joint-only bracket); state treatment of Social Security; lump-sum
elections and repayments (§86(d)–(e)); C-10, C-1, C-9, C-11; other duplicated rules beyond §86 (Phase 3's architecture
review).

## 7 · Decisions — all ADOPTED as recommended, 2026-09-24

- ✅ **D-1 · How much to change.** (a) fix Engine A's one line only; (b) one shared helper for all four sites.
  *Recommended: (b).* It is a larger edit, but the duplication is the cause, not a side issue: v5.45 fixed the copies it
  found and left one. With (a), a future §86 change still has four places to reach. The added risk is controlled by the
  four-site agreement test and the unchanged Roth-tab pins.
- ✅ **D-2 · METHODOLOGY.** Replace the contradictory §86 passage with one accurate description naming every engine.
  *Recommended: yes.*
- ✅ **D-3 · Audit record.** Annotate C-4 and D-1 as fixed in `docs/FlawsToFix-v5_73-Phase2.md`. *Recommended: yes.*
- ✅ **D-4 · Disclosure.** CHANGELOG states plainly that the example household does not move and who does.
  *Recommended: yes.*

- ✅ **D-5 · The Engine C finding (§1f) — ADOPTED (a), 2026-09-24.** (a) Fix it in v5.77: pass the household's actual filing status
  (`_singleI || filingSingleI`) where Engine C calls the shared helper, pin it with `t43`'s grid (Engine C must agree with
  the worksheet on every cell) and a control, and record it as a new audit finding; (b) leave Engine C's thresholds as they
  are, keep v5.77 to C-4/D-1 as scoped, and scope §1f separately. *Recommended: (a).* It is one expression at a site this
  release already rewrites, it runs **optimistic** (it can hide an IRMAA surcharge), and the grid test built for C-4
  catches it for free — shipping the shared helper while Engine C still feeds it the wrong thresholds would leave the
  helper's agreement test knowingly red, or knowingly weakened.

## 8 · Build order (once §7 is resolved)

1. ~~Reproduce §1 on v5.76; execute Engine C's and the Roth tab's §86 on the oracle grid.~~ **DONE 2026-09-24**, with
   `qa/tools/scope_ss86/ss86_worksheet_grid.mjs`: C-4 reproduced (+$150/+$60, hand-checked from the statute); example
   household unaffected in all seven strategies (captured Roth-tab input, `rothP_example_v576.json`); Engine B 160/160
   agree; Engine C 55/160 disagree (§1f); `t24` §D found testing a transcription (§1e). *Not yet done:* the Roth tab's
   §86 was **read** (correct since v5.45), not executed — it becomes directly testable at step 2, once it calls the
   helper. A session-only corrected copy of Engine C matched the worksheet in five spot cases and the IRMAA search;
   **the full 160-cell grid on a fixed Engine C is step 2's first check.**
2. The helper; route all four sites through it; re-run §1 (Engine A must reach the law, the others must not move).
3. `t43`, the oracle sweep, the structural check, the controls; hand checks.
4. Registration (the sweep tool first, plus the three shapes it cannot see); full suite; `domdiff` identical.
5. METHODOLOGY, CHANGELOG, audit annotations.
6. Version bump to v5.77, build, suite and controls from the packaged copies, package check.
7. Record §1f as a new audit finding (next free ID in `docs/FlawsToFix-v5_73-Phase2.md`) alongside the C-4/D-1 annotations.

## 9 · Build record (v5.77) — where the build departed from this document, and why

- **The helper takes the filing status, not the thresholds** — `taxableSS86(ssBenefits, otherIncome, filingSingle)`,
  reading `ssThr1`/`ssThr2` from `taxFactsFor` itself. §4's signature `(ss, other, t1, t2)` and §5's extinction check
  ("no function other than the helper reads `ssThr1`/`ssThr2`") could not both hold: with §4's signature every caller
  reads the thresholds to pass them. D-5's adopted wording already said "pass the household's actual filing status";
  each caller still chooses the status for its own year, which is the property the handover asked to keep.
- **§3 under-counted Engine A.** `ssTaxF` had **five** call sites, not three: L4526 (a conversion solver) and L4546 —
  the line that actually taxes the year. The fix was at the definition, so nothing changed; the census is corrected here.
- **§5 "the Roth tab's figure is checked where the harness reaches it"** is met by `t24` (DOM-driven, five slider
  positions × twelve years against `statute86`) plus `t43` E-2 (the tab calls the helper) and `t1` STRUCT S-3.
- **`t1` carried 16 source-text assertions on the deleted per-site §86 text** (STRUCT S-3, S-4, S-6), found by an AST
  census of every string and regex literal in the suite executed against both builds. Gated per leg; each block gains a
  v5.77 arm on the helper call, and S-6 gains the Engine A C-4 pin `t1` never had.
- **Engine A's line-14 region is narrow** — from the adjusted base to where the 85% cap takes over, about 0.41 × benefits
  wide in provisional income. A pension grid in round steps reached it in two cells; `t43` C-5 places 70 cells inside it.
  66 of the 70 are wrong on v5.76; the other four overstate taxable SS by exactly $5.00, which rounds away in the tax.
- **§1f reaches the shipped example made single**: Engine C's MAGI rises in eight years (exactly $7,000 in 2032–2038,
  hand-derived as 0.85 × 10,000 − 1,500), with no surcharge change — and `t6` and `t42`, which both run that household,
  stayed green on both legs. `t43` §F pins it.
- **Floating point.** The helper evaluates the same operations in the same order as Engines B and C and the tab, so the
  consolidation is byte-identical wherever line 14 does not bind: MC parity 10/10, `domdiff` 32/32, the example household
  identical in all seven Roth strategies.
- **The `t24` §D rewrite was first lost, and a control found it.** It was copied into the run folder in a command line
  `/bin/sh` rejected, so the copy never ran and the original §D was registered, packaged into the build tree and run.
  Control M5 (the helper's middle tier re-capped at 85%) fired nothing in `t24`; the cause was the missing file, not the
  suite. §D is now gated on the version, not on the helper's presence, so a v5.77+ build without it fails loudly.
- **Negative controls** (`qa/tools/controls_v577_ss86.py`): M1 line 14 dropped; M2 a private copy in Engine C; M3 the 85%
  cap removed; M4 Engine C back on the widowed-years flag; M5 the pre-v5.45 middle-tier cap — each fires its named checks
  (M5 reproduces the historical $2,468 / $1,850 bounds exactly); M0 unmutated passes.
- **§K1 boundary census: no new row needed.** Run on the example household, `filing` reads "the single path is unexercised"
  (C-12) and `ssA_band` / `ssB_band` read OUTSIDE the THR2 − THR1 band (C-4's line 14 binds only inside it). Both blind
  spots were already in the census; the band row, written for v5.45's middle tier, covers the upper tier's line 14 too.

