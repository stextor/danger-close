# SCOPE — the Roth tab's omitted dividend and capital-gain terms

**Status: ⚫ SUPERSEDED 2026-08-27 by `SCOPE_D10_MODELLING_v5_53.md`. Do not build from this
document.** Its four decisions are resolved there, against v5.52. Retained as the record of what
was believed at v5.41 — and because three of its premises did not survive re-measurement:

- **§6 D-3 is dead.** v5.47 took the HSA out of the dividend base at all three engine sites and
  `t1` STRUCT S-9 pins it. There is no overstatement left to copy or fix.
- **§6 D-2's "$630" was the GAINS half only**, read as the whole omission. Re-measured at v5.52:
  gains contribute **$342 across the ladder**, dividends **$4,200** — the total is $4,542, 7× the
  figure this document reasons from.
- **The precision-ceiling note points at the wrong layer.** The effect is below the ±$500 DOM
  ceiling, so dollar assertions belong at the ENGINE, where they are exact — not at the rendered
  figure, where this document put them.

Every line citation below is v5.41's and has moved. Re-resolved in the successor's §2.

| Field | Value |
|---|---|
| Written | 2026-08-21 |
| Target | v5.42 |
| Base source | `src/DangerClose.jsx` md5 **`18152190e9b699529642ae2983b3ae2c`** (v5.41, current) |
| Kind | Modelling fix. `src/` change · version bump · new extinction invariants · METHODOLOGY update |
| Predecessor | v5.41, which closed the RMD term in the same block |

Every claim below was verified against that source in the scoping session — AST census, not grep,
and measured against the running app, not read and judged plausible. Line numbers are v5.41's and
must be re-found with `qa/tools/funcmap.cjs` before editing.

---

## 1. Premise

The Roth tab's conversion-ladder loop (`<anon>@8719`, the loop body around **L8880–8900**) computes
MAGI as:

```
magi = pension + spouseBWork + taxableSS + conv_y + rmd_y
```

Engine C (`computeIrmaaPlan@4272`, **L4399**) computes the same quantity as:

```
magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y
```

After v5.41 closed the RMD term, **the difference between the two expressions is exactly
`div_y + capGain_y` and nothing else.** This release closes that gap and the tab's two MAGI
computations become term-for-term identical.

Both terms belong in MAGI: dividends and realized capital gains are in AGI, and IRMAA MAGI is AGI
plus tax-exempt interest (42 U.S.C. §1395r(i)(4)(A)). Both also belong in the §86 provisional-income
base for the same reason the RMD did.

**Census (`qa/tools/census.cjs`, AST):**

| Identifier | Hits | Where |
|---|---|---|
| `div_y` | 18 sites | `runRothStrategies@3683` (13), `computeIrmaaPlan@4272` (2), `computeTaxPlan@4902` (3). **Zero in `<anon>@8719`** |
| `capGain_y` | 7 sites | `computeIrmaaPlan` (2), `computeWithdrawalPlan@4454` (3), two feed sites at L9494 / L9777. **Zero in `<anon>@8719`** |
| `gainByYr` | 4 sites | parameter of `computeIrmaaPlan` and `computeTaxPlan`; supplied at L9500 and L9779. **Zero in `<anon>@8719`** |

## 2. What makes this harder than v5.41, and it is not the plumbing

The RMD was pure ordinary income, so it went into three expressions and the work was finding them.
**Dividends and long-term gains split**, and that is the whole difficulty:

- they **are** in MAGI and in the §86 provisional base;
- they are **not** ordinary income, so they must not enter the ordinary-bracket walk.

The ladder's tax is a plain ordinary-bracket loop over `taxableIncome = grossTaxable − stdDed`
(**L8896–8914**) with **no preferential-rate path at all**. The engine, by contrast, keeps
`qdcg_y = capGains_y + div_y` out of `grossOrdinary` and taxes it through a dedicated capital-gains
helper (**L5100, L5165–5170**).

So adding these terms to `grossTaxable` the way v5.41 added `rmd_y` would **tax qualified dividends
and LTCG at ordinary rates** — a new defect, in the *non*-conservative direction for the reported
marginal rate and in the conservative direction for tax. That is decision **D-1**, and it is the one
that decides the size of this release.

## 3. Measured effect — smaller than expected on the shipped household

Example household, slider at its $70,000 default, `taxYield` at its 2.0% default (**L5283**):

| Term | Per year | Note |
|---|---|---|
| Dividends, base as Engine C computes it | **$720** | $36,000 sleeve × 2% |
| Dividends, base excluding HSA | **$420** | $21,000 × 2% |
| Realized gains (Engine D, `scenarioPreset: "base"`) | **$0** in 9 of 12 ladder years | $295 in 2030, $220 in 2031, $115 in 2032 — **$630 across the entire ladder** |

Against a ladder MAGI of $121,720 that is roughly **0.35%**. **This release does not move the example
household's IRMAA verdict, and the scope should not pretend otherwise.**

Where it does matter is a household with a large taxable sleeve: the term scales linearly with the
sleeve, so a $1,000,000 taxable balance throws $20,000 a year of MAGI the tab currently cannot see.
That is the audience, and the CHANGELOG should say so plainly rather than implying the example
household changes.

**The honest framing:** this release is worth building because it closes the last term-set gap
between the tab and the engine and makes the structural invariant assertable as an equality — not
because it moves the shipped numbers much.

## 4. A defect found while scoping — the dividend base includes the HSA

`taxableInitAll()` = `taxableInitFromPositions()` + `otherTaxableInit()`, and `otherTaxableInit()`
counts any other-account whose `taxType` is `"taxable"` **or `"hsa"`**.

On the example household `taxableInitAll()` is **$36,000**, of which **$15,000 is the HSA** — 42% of
the base. An HSA throws no taxable dividend, so **Engine C's `div_y` is overstated by $300/yr on the
shipped household, a 71% overstatement** of the correct $420.

This is not new and not introduced here; it is inherited by anything that copies the expression.
Note that `qa/tools/derive_rmd_expectations.mjs` used **$21,000** — the HSA-excluded base — which is
why its dividend figure was $420. **The tool had this right and Engine C has it wrong.**

Decision **D-3** below. Whichever way it goes, it must be decided *before* the ladder copies the
expression, or the tab inherits a known-wrong base and the new equality invariant pins it in place.

## 5. Sites this touches

| Site | Line (v5.41, re-find) | Change |
|---|---|---|
| ladder loop, §86 base | L8877 `nonSSincome` | `+ div_y + capGain_y` |
| ladder loop, MAGI | L8890 `magi` | `+ div_y + capGain_y` |
| ladder loop, ordinary income | L8895 `grossTaxable` | **per D-1** — probably NOT these terms |
| ladder loop, preferential rate | new | **per D-1** |
| the gain source | new | **per D-2** — `gainByYr` is not in scope of this closure |
| the dividend base | new | **per D-3** |
| `t1` STRUCT S-2 | `qa/qa-baseline/t1_units.mjs` | extend the pinned term set; **see §7** |
| version strings ×4 | footer, DATA LOAD, Field Manual callsign + footer | v5.41 → v5.42 |

## 6. Open decisions — Steve

**D-1 (load-bearing) — how are these terms taxed in the ladder table?**

- **(a) MAGI and §86 only.** Add to `nonSSincome` and `magi`, leave `grossTaxable` alone. The IRMAA
  and Social Security figures become correct; the tax and marginal-rate columns keep ignoring
  dividends entirely, which is what they do today. Smallest change, no new defect, and the tab's
  `magi` becomes term-identical to Engine C's. **Recommended.**
- **(b) Full preferential-rate treatment.** Add a capital-gains bracket path to the ladder mirroring
  `computeTaxPlan`'s. Correct, and much larger — it means a second bracket walk, the 0/15/20%
  thresholds, and their interaction with the ordinary stack.
- **(c) Add to `grossTaxable`.** Rejected on the evidence: taxes preferential income at ordinary
  rates. Listed only so it is on the record as considered.

I recommend **(a)**, and that (b) be its own release if the tax column is ever to be trusted for
these terms. Splitting them keeps this release to one idea, the way v5.41's D-4 did.

**D-2 — where do realized gains come from?** `gainByYr` is built at L9494 / L9777 by running
`computeWithdrawalPlan` and harvesting `capGain_y`, both **outside** this closure (`<anon>@8719` ends
at L9485). Options: (a) hoist the map so the ladder can read it; (b) run `computeWithdrawalPlan`
inside the block; (c) **ship dividends only and leave gains out**, given the measured contribution is
$630 across the whole ladder. Option (b) adds a scenario-dependent engine call inside a render path,
which is a performance and determinism question, not just a wiring one.

**D-3 — the HSA in the dividend base.** (a) Copy Engine C's expression as-is, keeping the tab and the
engine consistent and both wrong; (b) fix it at the shared helper, which changes Engine C, Engine
`computeTaxPlan` and every consumer — a bigger blast radius and its own release; (c) fix it only in
the new ladder term, which makes the tab and the engine disagree by $300/yr and **breaks the equality
invariant this release exists to make assertable**. I lean (a) here plus (b) as its own scope, so
this release stays one idea — but (a) means knowingly propagating an overstatement, and that is
Steve's call, not mine.

**D-4 — does `div_y` decay?** Engine C holds the base constant at `taxableInitAll()` for the whole
plan (**L4395**), while `runRothStrategies` tracks a decaying `taxBal` (**L3826**). The two disagree
by construction. Constant is the conservative choice (higher MAGI for longer) and matches the engine
this release is being reconciled to. Recommend constant; flag the disagreement in METHODOLOGY.

## 7. Tests it ships with

1. **`t1` STRUCT S-2 extended** — the Roth-tab `magi` term set becomes
   `{pension, spouseBWork, taxableSS, conv_y, rmd_y, div_y, capGain_y}`, gated per leg
   (OPERATIONS §B2), with v5.41 and v5.40 continuing to assert their own sets.
2. **A NEW structural invariant, the one worth having: term-set equality.** With the gap closed, S-2
   can assert that the Roth tab's `magi` term set and Engine C's are **the same set modulo the
   accessor renames** (`pension`↔`pen_y`, `spouseBWork`↔`work_y`, `taxableSS`↔`ssTaxable`,
   `rmd_y`↔`rmdTax_y`). This is the assertion that would have caught both the RMD defect and this
   one, and it cannot be written until this release lands. **It is the main reason to build it.**
3. **Dollar assertions on the tail** — per §3, and see the ceiling note below.
4. **Non-dividend years unmoved**, the v5.41 pattern: whatever this release does not claim to change
   must be pinned as unchanged.
5. **Negative controls, mandatory** — perturb each term, the base, and the gain source; each control
   must fire. If one does not, that is the finding.

**Precision ceiling (OPERATIONS §M).** The ladder is still a component-inline engine: MAGI reads from
the DOM at `Math.round(x/1000)`, so **±$500**. Unlike v5.41, where the effect was ~$45,000 and the
ceiling was irrelevant, **here the effect is $420–$720 a year — inside the noise floor.** A rendered
K-figure cannot distinguish $121,720 from $122,140.

**This is a blocking test-design problem, not a caveat.** Either the block is hoisted to module level
first (§M requires hoist and export to be separate releases, so that is a prior release), or the
assertions are written against a synthetic household with a taxable sleeve large enough to clear the
ceiling — say $1,000,000, giving $20,000/yr. The second is cheaper and I recommend it, but it must be
decided during the build, not discovered during it.

## 8. Out of scope

The preferential-rate tax path if D-1 lands on (a) · fixing the HSA base at the shared helper if D-3
lands on (a) · the §86 cliff at L8841–8844 · Engine B's omitted ½-benefits cap · spouse B's ungated
SS at L8822 · `_perRmd` seeding from `tradInitB` rather than `rmdInitB` · `_perRmd`'s `noConv` basis ·
Engine C itself, which is the comparison reference and must not be edited.

The last five belong in one tidy-up scope. That scope is now six items and is arguably the better
next release if budget is short — every item is small, conservative in direction, and independent.

## 9. Also due, unrelated to this scope

`controls.sh` is pinned at **v5.38** and cannot run against the current pair; re-point it in whichever
session next needs negative controls, which on this plan is the next one. `t15` still defaults to tag
`v514` and dies if run bare. `census.cjs` still double-reports object-shorthand positions
(over-reports, safe). `t8`'s call-site check is a **text regex** that counts comments — see the v5.41
status report, finding 3.
