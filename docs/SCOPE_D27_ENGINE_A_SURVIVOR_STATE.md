# SCOPE — D-27 · The Roth comparator files the survivor's state return as a couple (v5.96)

**FULFILLED — shipped as v5.96 (2026-10-08).** Repo-only. §7 is the build record.

*(Superseded status line, retained:)* **READY — 2026-10-08.** Steve decided the order on 2026-10-08: D-27 next, as v5.96. Under his standing instruction every decision
below carries a recommendation the build takes and records. **Stop only where §5's conditions fire.**

## 0 · Premise (verified against v5.95, not assumed)

Freshness (OPERATIONS §A): repo `110cd45`, full clone; source `b8f7039c0720248edf0aa0b8fc72c71d` = repo = pool (hashed through the
Projects tool, 2026-10-08) = CHANGELOG newest; built `7d27099415c9dcccdf0b1a04dc176b19`. The pool lists 123 entries (Projects listing).

- **AST census:** three `stateTaxAnnual` calls — `runRothStrategies` ×2 (the ACA sale-gain estimate and the year's tax) and
  `computeTaxPlan` ×1. Engine B was fixed for survivor years at v5.95 (P3-S); **both Engine A calls still pass `single: !!P.single`**
  and both spouses' ages (`yr − dobAYr`, `yr − dobBYr`) in every year, and the gross SS as held (the larger benefit in whichever slot
  held it).
- Engine A already computes everything the state call needs: `widowed`, `filingSingleA` (single from the year AFTER the death,
  IRS Pub. 501), `effSingle = P.single || filingSingleA`, and `survivorIsA` — and passes `effSingle` to every FEDERAL rule
  (`taxFactsFor`, `taxableSS86`, the AMT figures, the IRMAA cap).
- **Consequence:** in single-filing survivor years the state layer taxes the survivor as a couple: joint thresholds, bands, cliffs and
  caps; a 65+ exclusion for the late spouse; joint `retCap` (Michigan). Its per-person slots are right (the decedent is attributed
  nothing), so v5.95's per-person rules are unaffected.
- **Measured** (a scratch patch, not shipped; Engine A `totTax` per strategy, v5.95 vs patched, 51 jurisdictions):
  - example household (A dies 2044): 59 strategy runs rise, **0 fall**; the no-conversion strategy rises in 17 states — ME +$35,853,
    MD +$27,553, GA +$27,050, MI +$22,061, WI +$11,534, NY +$10,878; the estate-best strategy changes in **0** jurisdictions;
  - H1 (A dies 2027; B survives at 61; $50,000 pension): 134 rise, 0 fall; ME +$101,729, MD +$91,357, GA +$73,042; estate-best
    changes in **2** (CT fill12 → fill22, MN irmaa1 → fill12);
  - H2 (B, the larger benefit, dies 2030; A survives): 134 rise, 0 fall; estate-best changes in **4** (KY, MN, RI, WI: irmaa1 → fill22).
  - Every move is in survivor years (`widowTax` moves by the same amount); the death year, filed jointly, does not move.
  **Direction: optimistic before, conservative after.**

## 1 · Change (each item records its decision)

| ID | Decision | Recommendation (taken) |
|---|---|---|
| D27-1 | Filing status at both Engine A state calls | **`single: !!effSingle`** — the federal filing status Engine A already uses: joint for the death year, single after (Pub. 501). |
| D27-2 | Ages in single survivor years | Blank the decedent's age; the calculator's v5.95 swap moves a surviving B into A's slot (P3-S, unchanged). |
| D27-3 | Gross SS in single survivor years | The survivor's slot holds the household total (the larger benefit; the other is 0), as Engine B since v5.95. |
| D27-4 | The ACA sale-gain estimate (the first call) | The same three changes — it estimates the same year's state tax. |
| D27-5 | Disclosure | CHANGELOG (the understatement and the ranking changes), METHODOLOGY, Field Manual dated line, MissingFeatures D-27 closed. |

## 2 · Site census

Source: the two Engine A `stateTaxAnnual` argument lists; the Field Manual (one dated sentence); four version sites.
Suite: `v596` beside `v595`; `t33`'s PINS by measurement; the Python suites by hand; `dom_entry_v596.jsx`. Existing suites that read
Engine A's state tax in survivor years re-gated per leg with hand-verified values, if any move.

## 3 · Tests

New **`t60`**, both legs (v5.95 pins the defect): the two call sites' arguments by a runtime recorder (single, ages, gross SS) in
survivor years for both survivors; Engine A's per-year state tax for a hand-built survivor household hand-computed to the dollar in
GA, ME and MI (rate × base with the single exclusion / offset / cap); the death year unchanged; Engines B, C and D byte-identical to
v5.95; no Engine A strategy's tax falls; an AST guard that both Engine A calls pass `effSingle`. Controls
`qa/tools/controls_v596_survivor_state.py` (repo-only), each shown to fire.

## 4 · Out of scope

Qualifying-surviving-spouse years (D-16). Engine A's undrained draw (v5.84). The death-year approximation (calendar age). State rates (D-22).

## 5 · Stop conditions

Any federal figure moves; Engines B, C or D move; MC parity is not 10/10; an Engine A strategy's tax falls; a move outside survivor years.

## 6 · Status

READY. Destination: repo `docs/` only (repo-only from birth; fulfilled by v5.96).

## 7 · Build record (v5.96, 2026-10-08)

- **Source** `2431abbb17ab7c21bd6cc73b84decd41` (7 anchors, each once on v5.95); reproduces the §0 scratch measurement exactly. **Built** `11bbf9af0ea25c03f8009c7e57e0b792` (v5.95 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — federal and Engines B/C/D unchanged; MC parity 10/10; no Engine A strategy falls; every move in survivor years.
- **`t60`** 19 (v5.96) / 15 (v5.95). **Controls 9 of 9** (two runs; K1's predicted witnesses corrected). Shape-of-argument tests fixed: `t8`, `t57` C5/C7b.
- **Suite:** 5,227 app checks, 59 suites, 0 failed, 0 DIED; GRAND 5,357. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v595 v596 from a full clone of 110cd45 with the github/ files overlaid (v5.95 resolved from history, commit caf29a1), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5135, half B GRAND 222; none DIED.
