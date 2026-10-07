# SCOPE — D-26 · State tax counts the spending draw (v5.94)

**FULFILLED — shipped as v5.94 (2026-10-06).** Repo-only from the ship (OPERATIONS §G). §7 is the build record.

*(Superseded status line, retained:)* **READY — 2026-10-06.** Steve decided the order on 2026-10-06: D-26 ships as its own release, v5.94, between D-12 Phase 2 (v5.93) and
Phase 3 (v5.95), so Phase 3's per-person rules are not built on an incomplete base. Under Steve's standing instruction (2026-10-02)
every decision below carries a recommendation the build takes and records. **Stop only where §5's conditions fire.**

⚠ **Owned at the build:** this document was written after the source edits were first staged, not before — the ground rule is scope
first. The premise and census below were measured before any edit; the edits were then checked against this document (§7).

## 0 · Premise (verified against v5.93, not assumed)

Freshness (OPERATIONS §A): repo `9bc7f52`; all 122 pool files match committed content; source `e60a09711b5c1451d144a208bd82991b` =
pool = manifest = CHANGELOG newest; built `b7ebd28e9f0d1abf063068dd438a35e1`.

- **Three** `stateTaxAnnual` call sites by AST (not "each engine"): `runRothStrategies` ×2 (the sale-gain estimate `_estSaleGain`, and
  the year's tax) and `computeTaxPlan` ×1. Engines C (IRMAA) and D (Withdrawal) compute no state tax.
- Engine A's federal base is `base = pen + work + otherOrd + rmd + draw_y` (v5.84); both its state calls pass `retIncome: rmd + c` /
  `rmd + conv`. Engine B's `ordinaryIncome` includes `ordDraw_y` (v5.74); its state call passes `retIncome: rmdTax_y + conv_y`.
- `stateTaxAnnual` reads `retIncome` in: the retirement exemption (`retExempt`, with v5.90's age gate and cap), the 65+ exclusion
  (`excl65`, per person), the income tests (`exclTest` measure and qualifying income), the Social Security rules' income measure
  (`ssRule`), and the legacy flat-rate path. That is exactly the treatment a state gives a Traditional IRA or employer-plan distribution.
- **Measured** (v5.93 vs a v5.94 with only the fix, example household, Engine B): federal tax byte-identical in every state; lifetime
  state tax up NC $12,501 (= $313,303 × 3.99 %), VA $8,491, CA $18,798, MN $21,305, WV $14,793, NY $3,517, MD $5,736, CO $4,734,
  RI $4,451; unchanged where the exemption or exclusion absorbs the draw (GA, PA, IL, NJ) and with no state. Engine A, one-year
  household, $10,000: v5.93 draw +$1,200 everywhere (federal only); v5.94 draw = pension in NC (+$1,599), VA (+$1,775), CA (+$1,800).

- **Measured on the full fix** (`probe_equiv` retargeted, 23 households: 11 jurisdictions × {example, employer plans + B-owned pension}
  + a single filer): Engines C and D **byte-identical**; Engine B moves exactly three row fields (`stateTax`, `totalTax`, `effRate`) —
  392 year-rows rise, **0 fall**, federal tax moved in **0**; Engine A `totTax` rises in 70 strategy runs, falls in **0**, unchanged in
  68; the estate-best strategy changes in **0** households. ⚠ A first per-year Engine A check read a field that engine does not expose
  and returned 0/0 — vacuous; it was replaced by the `totTax` comparison above. Engine A has no per-year state output.

## 1 · Change (each item records its decision)

| ID | Decision | Recommendation (taken) |
|---|---|---|
| D26-1 | Which slot the draw enters | **`retIncome`** — it is an IRA/plan distribution and takes the state's retirement treatment. `work` would deny every exclusion (pessimistic and wrong in law); a new slot would need every rule taught it. |
| D26-2 | `attributeRetIncome` (D-12 Phase 2) | **Fold the draw into the income split** so the split keeps summing to `retIncome` (`t57` C2 asserts this at runtime at all three sites); **keep `draw` as an of-which record**, documented as already included. Supersedes P2-6. |
| D26-3 | Disclosure | A dated Field Manual line in the state-limitations paragraph; CHANGELOG states the understatement since v5.74 / v5.84; METHODOLOGY entry. No in-app banner. |
| D26-4 | `t57` on the prior leg | **Both legs** from v5.94 (v5.93 has the function); A7/A9 gated per build (OPERATIONS §B2). |
| D26-5 | Engine A's undrained draw (v5.84 design) | Unchanged; the pro-rata leg attribution (D12-D) carries over. Out of scope. |

## 2 · Site census (AST: `calls.cjs`, `strwalk.cjs`, `register_tag2.cjs`)

Source: the three `retIncome` arguments; `attributeRetIncome` (one line + comments); the Field Manual (one sentence, quote-free anchor
inside `DOCS_HTML`); the four version sites (`strwalk "5.93"`: exactly four string sites). **No in-app copy states the draw is
excluded** (`strwalk` for "draw" × "state": none) — D-26 was never disclosed, so no §B2 presence-lock is falsified.
Suite: `v594` beside `v593` — 40 array entries, 77 `||` gates, 2 version arms, 0 manual; `t33` PINS (an object key, by hand from
measurement); `t45`/`t47`/`t48` by hand; `dom_entry_v594.jsx`.

## 3 · Tests

New **`t58_state_draw.mjs`**, both legs, the v5.93 leg pinning the defect:
- **A · Engine A extinction grid** — every `STATE_RULES` jurisdiction plus the legacy path, single and joint, age 70: $10,000 as a draw
  costs exactly what $10,000 of pension costs. v5.93: pinned unequal in every jurisdiction where the pension is taxed.
- **B · Engine B to the dollar** — the example household, per draw year, hand-computed in the test from hardcoded rates and statute
  figures (not read back from `STATE_RULES`, which is asserted first): NC and CA (flat, no exclusion), GA (the exclusion absorbs).
- **C · Nothing else moves** — federal tax and every non-state row field byte-identical to v5.93; Engines C and D byte-identical.
- **D · AST extinction** — every `stateTaxAnnual` call in `runRothStrategies` and `computeTaxPlan` names the draw in `retIncome`.
- **E · Disclosure** — the Field Manual line present on v5.94, absent on v5.93.
Existing suites with exact state figures on draw households are re-gated per leg with hand-verified values; `t57` A7/A9 gated.
Controls: `qa/tools/controls_v594_state_draw.py` (repo-only), each shown to fire.

## 4 · Out of scope

Per-person state rules (D-12 Phase 3, v5.95). Early-distribution treatment beyond each state's existing age floor. Engine A's
undrained draw. State rates (D-22). Any change to Engines C or D.

## 5 · Stop conditions

- Any **federal** figure, or any Engine C/D output, moves.
- MC parity is not 10/10.
- An Engine B year's state tax **falls** (nothing feeds back in that engine, so adding income can only raise it). Engine A feeds tax
  back into balances, so a later year there could in principle move either way; its lifetime `totTax` falling is reported, not a stop.

## 6 · Status

READY. Destination: repo `docs/SCOPE_D26_STATE_TAX_DRAW.md`; it is fulfilled by v5.94 and retires to repo-only at the ship (§G).

## 7 · Build record (v5.94, 2026-10-06)

- **Source** `47090df091940165dc32356b56ada760` (stage script, 11 anchors, each counted once on the v5.93 original before anything was written); **built** `b3d8b7ead5553ac97036e80e7a820dc1` (v5.93
  rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions (§5):** none fired — federal and Engines C/D unchanged, MC parity 10/10, no Engine B year falls, Engine A never falls.
- **`t58`** 16 (v5.94) / 11 (v5.93). **Controls 11 of 11.** Two `t58` design errors found by running it, both fixed (CHANGELOG).
- **Suite:** 5,151 app checks, 57 suites, 0 failed, 0 DIED; GRAND 5,281. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v593 v594 from a full clone of 9bc7f52 with the github/ files overlaid (v5.93 resolved from history, commit 2a4bfa6), each running the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). Half A GRAND 5059, half B GRAND 222; none DIED.
