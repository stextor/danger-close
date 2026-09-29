# SCOPE — the Roth comparator sees the spending draw (D-7), with D-4 measured and disclosed

**ACTIVE — decisions H-1 to H-4 (§6) open; build after they are answered.** Target **v5.84**, built from **v5.83** (source
`47beecf81eb45bd6faea899fa093dd81`, built `index.html` `9f39232ee73b0d46f25933302dcf7474`, repo `d5be743`). **A modelling
release**: Engine A's figures change, so METHODOLOGY changes and the CHANGELOG discloses every moved headline.

This document is also the **measurement record** for D-7 and D-4 (2026-09-29). There is no separate findings file on purpose: one
set of numbers, in the document that acts on them.

---

## 1 · Premise — measured, not assumed

**The finding** (`FlawsToFix-v5_73-Phase2.md`, filed at v5.74; METHODOLOGY "The Taxes tab and the drawdown", item 4): Engine A —
`runRothStrategies`, the Roth tab's strategy comparator and solver — forms its ordinary base as `pen + work + otherOrd + rmd`
(source L4398) with **no spending draw**. v5.74 (C-8) put the draw into Engines B and C; Engine A was excluded on the reasoning that
"a draw common to both sides largely cancels", recorded as unmeasured.

**How it was measured.** A scratch copy of v5.83's testable module (`qa/app_v583.jsx` + the shim) with two switchable hooks in
Engine A — add a per-year draw to the ordinary base; also subtract it from the traditional balance pro rata (as Engine B does,
L5882–5885) — and logging at the three conversion-cap lines. Engines driven directly (OPERATIONS §M: A, B and D are module-level,
so **dollar-exact**, not the ±$500 DOM ceiling). Households: the shipped example plus the 10 one-change households of
`qa/tools/fixture/households.mjs`, loaded through `applyLoadedData` exactly as `t29` does. Engine A's input object is a **replica**
of the Roth tab's (L10097–10116) at the UI defaults (taxable funding, 0 % embedded gain, 2.0 % yield, $70,000/yr). The draw series
is **the one Engine B receives**: `withdrawalPlanSeries({ retireYear, rothAmount: 70000, scenarioPreset }).ordDrawByYr`.
**Inertness verified first:** with the hooks off, all 11 households reproduced the shipped module exactly (A and B).

**D-7 · the draw does not cancel.** Four of Engine A's six strategies SIZE the conversion from this base (fill 12 / 22 / 24 %, stay
under IRMAA), so an omitted draw leaves them believing the bracket has room it does not — it changes how much is converted, not
only the tax on it. Example household (lifetime draw in Engine B's series **$313,356**), estate advantage over NO CONVERSIONS:

| Strategy | v5.83 | draw in the tax base | … and out of the balance |
|---|---|---|---|
| Fill 12 % | $218,720 (converts $1.20M) | **$150,518** (converts $0.99M) | $121,545 |
| Fill 22 % | $23,915 | **−$25,782** — the sign flips | $129,698 |
| Stay under IRMAA | $63,468 | **$884** | $154,237 |
| Your slider ($70K) | $125,753 | $112,736 | $100,237 |

**The top strategy by estate** — tax base only: unchanged (Fill 12 %) in 10 of 11 households; **the single filer's becomes NO
CONVERSIONS**. Base and balance: it changes in **8 of 11**. ⚠ The balance counterfactual applies ONE draw series (Engine D's plan
at the slider amount) identically to every strategy; a strategy converting far more than the slider would draw differently. Read
it as a direction, not a figure — and that approximation is what H-1 and H-2 decide whether to ship.

**D-4 · the conversion caps.** Engine B and C cap a conversion at `tradBal − max(rmd, qcd)` (L5774, L4977), Engine D at
`tradNotional_boy − rmd` (L5260). The slider runs $0–$400,000 in $5,000 steps.
- **At the default $70,000 no cap binds** in any engine for any of the 11 households; B and D convert identical totals.
- **At $150,000 and $250,000 the caps bind** (B 1–7 years, D 2–8) and B and D's lifetime conversions differ by **≈ $90,000–
  $181,000**. With QCD $0 the formula difference never decides a year — **the gap is D-9**, the decided difference in growth
  (Engine B 4.500 % flat, Engine D scenario-derived), which makes D exhaust the account sooner. With a $20,000 QCD the `qcd` term
  does decide 2–4 years in several households.
- So D-4 binds only well above the default, and mostly through a decision already made. **Proposed: disclose, do not fix** (H-4).

## 2 · The change

- **A · Engine A accepts the draw** as an optional input, `P.ordDrawByYr` (default `{}`), exactly as Engine B accepts
  `ordDrawByYr`: added to the ordinary base (L4398) and — if H-1 (a) — subtracted from the traditional balances pro rata by the
  post-RMD pools, as Engine B does. **An absent series leaves Engine A byte-for-byte as v5.83**, so every suite that calls it with
  its own input object keeps its pins; only the app's callers opt in.
- **B · The app's four callers pass the series** (H-3): the comparator (L10117), the solver grid (L6069), the solver's current
  row (L10280), and the stress solver's tax estimate (L11425). Each obtains it from `withdrawalPlanSeries` at the slider amount — the
  same bridge Engines B and C already use (H-2).
- **C · Disclosures.** METHODOLOGY "The Taxes tab and the drawdown" item 4 (the "largely cancels" sentence) is rewritten to the
  measured result and the approximation; §7 (Roth conversion modeling) gains the draw; D-4 is disclosed there with §1's figures.
  The CHANGELOG states every headline that moved on the example household, including any change of the solver's winner.
  `FlawsToFix-v5_73-Phase2.md` D-7 → fixed, D-4 → measured and disclosed.

## 3 · Site census (v5.83, AST)

- **Engine A**: `runRothStrategies` L4233–4838; base L4398; balance update L4790–4791.
- **App callers (4)**: L6069 (`rothSolve`, the solver grid behind the ranked "winner" and the slider's rank), L10117 (the
  comparator table), L10280 (the solver's current-slider row), L11425 (the stress-threshold solver's `estAnnualTax` — uses the
  current strategy's `totTax`; adding the draw's tax raises it, **the conservative direction**, and moves those thresholds).
- **Suites calling Engine A directly (13 files):** `t2`, `t3`, `t8`, `t10`, `t15`, `t18`, `t20`, `t22`, `t33`, `t41`, `t43`, `t44`,
  `probe_withhold_gain` — all build their own input object, so with an optional `ordDrawByYr` **none should move**; the build proves
  it with the full suite unchanged apart from new tests.
- **Suites naming strategy labels** (`t19`, `t40`, `t42`) and those reading the Roth tab's DOM (`t13`, `t14`, `t16`, `t23`–`t28`) are
  checked at build by `literal_census.cjs` and the run: a moved rendered figure there is **expected** only on the comparator/solver
  and is enumerated in the build record, never adjusted silently.

## 4 · Tests (written and run FIRST, against v5.83, where they must fail)

A new suite (`t49_engineA_draw.mjs`, dollar-exact at the engine):
- **Inert when absent:** Engine A with no `ordDrawByYr` equals v5.83 for every fixture household (the pins of 13 suites stay whole).
- **Cross-engine agreement:** for the fixed "current" strategy, Engine A's per-year draw term equals Engine B's `ordDraw_y`, and its
  ordinary base agrees with Engine B's on the terms `t18` case 10 already compares (B's taxable RMD is `rmdTax_y`, which can
  differ from A's `rmd` by the annuity-exempt share — the build states which terms are compared, and why).
- **Hand-verified:** one household-year computed independently to the dollar (base, the fill-12 % conversion it permits, the tax).
- **Extinction (AST):** every app call of `runRothStrategies` passes `ordDrawByYr`; Engine A's base expression includes the draw.
- **The solver's winner on the example household** is pinned at whatever the build computes, with the CHANGELOG saying what it was.
Negative controls in `controls_v584_*.py`: drop the draw from one caller; drop it from the base; drop it from the balance (if H-1 a).

## 5 · Out of scope

Per-strategy draws (Engine A would need its own spending model); fixing D-4 or reversing D-9; the Taxes tab's own figures (already
include the draw since v5.74); anything state-tax (D-19 follows this).

## 6 · Open decisions for Steve

**H-1 · What the draw does inside Engine A.** (a) **Taxed AND taken out of the traditional balance** — the same rule Engine B has
used since v5.74, so the comparator stops assuming money that was spent is still growing; (b) taxed only — smaller change, but
the comparator keeps overstating the traditional balance by the lifetime draw. **Recommend (a)**: one rule for every engine.

**H-2 · Which draw.** (a) **Engine D's plan at the slider amount**, the series Engines B and C already receive — one bridge, already
tested by `t40`; (b) a per-strategy draw — each strategy's own spending path, which Engine A cannot compute today (out of scope).
**Recommend (a)**, disclosed as an approximation that is exact for the slider's own strategy.

**H-3 · Which callers.** (a) **All four**, including the stress solver's tax estimate — every place the app asks Engine A a
question gets the same answer; (b) the Roth tab only. **Recommend (a)**; the stress thresholds move in the conservative direction.

**H-4 · D-4.** (a) **Disclose in METHODOLOGY with §1's figures, no fix** — it binds only well above the default and mostly
through D-9, a decided difference; (b) align the cap formulas now. **Recommend (a).**
