# FINDINGS — v6.17 · fixed figures that every plan inherits from the example household

> **Status at v6.18 (2026-10-18):** filed as MissingFeatures **D-40** (F-1), **D-41** (F-2 — fixed in v6.18, `docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md`),
> **D-42** (F-3) and **D-43** (F-4). Steve chose the order recommended in §5.
> ⚠ **Correction (owned, found at the v6.18 build by an independent review):** F-2 below says the Monte Carlo reads the table quarter by
> quarter and so agrees with the plan's dates. Its monthly rows, yes; but it reads one-time rows only at each quarter's LAST month, with an
> exact match, so a one-time row dated in any other month is never charged — the example's April 2029 rows never reach it. Filed as **D-45**.

**2026-10-17. Findings only — no code changed.** Repo-only. Written while scoping the two constants Steve approved ("Yes" to measuring
`ROTH_TAX_DRAG_Q` and `AUTO_REPLACE_COST`). The measurement changed the picture enough that the scope waits for a decision on order (§5).

**Built against v6.17** — a fresh clone at `52fe385` (v6.17 plus its chmod), source `dc8a4d5f5796b11d88007024b1ecaca7`, built page
`067c87404e92339a1de9ece815d6151e`. Line numbers are v6.17's, from `census.cjs`. Measurements use a **session-only prototype** (the v6.17
source with a hook on the two constants; never shipped), the example household and variants of it, 3,000 paths, one random seed per row.
§K2 register sweep: `ROTH_TAX_DRAG`, `AUTO_REPLACE`, "tax drag", "car replacement", `POST_MONTHLY`, `getMonthlyExpense`, "2029-06",
"2031-06" in `FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md`, `UsabilityFlaws.md` and METHODOLOGY — **nothing registered**.

---

## F-1 · The Monte Carlo's only income tax is a flat $16,000 a year during the Roth ladder

`ROTH_TAX_DRAG_Q = 4000` (L1139) is subtracted every quarter of retirement up to the ladder's end — L2555 and L2618 (`runMonteCarlo`),
L2738 and L2847 (`runExtendedMC`) — on every plan, whatever it converts. Its comment calls it the "conversion-tax drag", but **it is the
only income tax either Monte Carlo engine charges**: their spending draw is expenses minus Social Security, pension and streams (L2550s),
with no tax term, and after the ladder ends nothing is charged — including on RMDs. The Income tab shows it as "~$16K/yr … $4K/quarter
modeled in MC sim" (L8286). Nothing says the Monte Carlo is otherwise untaxed.

Measured against the Taxes tab's own tax (Engine B, the $70,000 slider, the base scenario's draws), by household:

| Household | MC's tax today (lifetime) | Taxes tab's total tax | 30-yr success: today → if the MC paid the Taxes tab's tax | 30-yr median |
|---|---|---|---|---|
| Example (Florida) | $192K, all in 2029–2040 | $215K ($151K in the ladder, $64K after) | 81.0% → 80.6% | $1,609K → $1,603K |
| Example in Georgia | $192K | $220K | 81.0% → 80.5% | $1,609K → $1,596K |
| Example, holdings ×1.6, Georgia | $192K | **$368K** ($200K after the ladder) | **96.9% → 95.2%** | **$3,555K → $3,387K** |
| Example, holdings ×0.6 | $192K | $139K | 18.1% → 23.5% | $323K → $408K |

**Direction: either way.** The flat figure is close to the example's own tax — it looks calibrated to it — so the example barely moves.
It is **optimistic** for a larger or state-taxed household (the ×1.6 Georgia row: $176K of tax never charged, median $168K high) and
**conservative** for a smaller one or one that does not convert. With no tax at all the example would read 87.2%, so the term matters.

**Candidate fix:** the Monte Carlo pays the tax the Taxes tab computes, year by year, at the plan's conversion setting — a deterministic
schedule like today's, but the plan's own (the last row of each table above). Two things to settle in the scope: the Monte Carlo would
then depend on the Roth slider (it does not today), and Engine B's tax is computed on Engine D's draws — which is F-2.

## F-2 · The Withdrawal tab spends the expense table as it stood on the example's dates (June 2029 and June 2031)

`PRE_MONTHLY`, `POST_MONTHLY_EARLY` and `POST_MONTHLY_FULL` (L90–98, recomputed at L96–98) are the expense table summed at **fixed
calendar months — "2026-06", "2029-06", "2031-06"** — the example's "now", its retirement and spouse B's Medicare year. Engine D's
`annualExpense` (L5652) spends `POST_MONTHLY_EARLY` before spouse B's Medicare year and `POST_MONTHLY_FULL` after, inflated, for life.
The three names have 56 AST hits between them (definitions included), among them the Income tab (L8059–8298) and the Ask AI context (L7008). The Monte Carlo,
by contrast, reads the table quarter by quarter (`getMonthlyExpense(dateStr)`), so the tabs disagree whenever the plan's dates are not
the example's.

Measured: the example household with every date moved **3 years later** (retiring 2032 instead of 2029). Engine D spends **$6,700/month**
— the June 2029 table, which still holds the current home's mortgage, property tax, HOA, utilities, cable, homeowners and the
two-car insurance, and none of the retirement rows that start in 2032 — where the table at the plan's own dates says **$8,170 and
$8,020**. That is **$16,000–$18,000 a year too little spending, optimistic**, in the Withdrawal tab and in the Taxes and IRMAA tabs, which
take their draws from it through the bridge. The same at 6 years later.

Two smaller effects of the same snapshot, on the example itself: a row that ends after June 2031 is charged for life (the example's
$400/month car payment, which ends in April 2034 — conservative), and one-time rows (the golf cart, closing costs) never reach Engine D.

**Direction: optimistic** for anyone retiring after April 2029 whose pre-retirement rows end at retirement — which is how My Data asks
people to enter them. **Candidate fix:** Engine D reads the table year by year as the Monte Carlo does, and the derived figures follow
the plan's own retirement and Medicare dates.

## F-3 · A $40,000 car every 8 years, on every plan

`AUTO_REPLACE_COST = 40000` (L1140) is spent in the March of retirement years 8, 16 and 24 by `runExtendedMC` (L2874–2875) whenever the
run has auto-replacement on — Runs C and D, the Stress and Dashboard figures and the mortgage what-if. It is disclosed: the Field
Manual's limitations call it "a fixed example schedule". Measured on the example: 30-year success **81.0%** with it, **84.8%** without;
median **$1,609K** against **$1,759K**. **Direction: conservative** — but a household that enters its car purchases in the expense table
pays twice, and one that is not buying cars pays anyway. **Candidate fix:** a My Data field (cost and interval, 0 = none), the example
keeping $40,000 / 8 years, like v6.17's home-move cash.

## F-4 · The Income tab subtracts the example's $400 car payment from every plan

The Income tab's "Post-car draw" and "Monthly shortfall (car paid off)" are `POST_MONTHLY_FULL − 400` (L8076, L8159, L8282, L8298): the
example's car payment, typed in. A plan with no car payment sees its shortfall understated by $400 a month there. Display only; no engine
reads it. Small, but the same defect class, and it reads F-2's snapshot.

---

## 5 · Recommended order (decision for Steve)

1. **F-2 first — the Withdrawal tab's spending follows the plan's own dates.** It is the optimistic one with the widest reach (every
   household not retiring on the example's dates; the Withdrawal, Taxes and IRMAA tabs), and F-1's fix is built on Engine B's tax,
   which is computed on Engine D's draws — fixing F-1 first would carry F-2's error into the Monte Carlo.
2. **F-1 next — the Monte Carlo pays the Taxes tab's tax.** Either direction by household; a modelling release with a real decision
   about tying the Monte Carlo to the Roth slider.
3. **F-3 and F-4 together** — a small release, conservative in direction, following v6.17's pattern.

Each would be its own scope, with the measurements above re-run against the build it starts from. **At the next release**, F-1 to F-4 are
filed in `MissingFeatures.md` (next free IDs D-40 to D-43) whether or not they are fixed in it, so they cannot be lost.

---

**Destination:** repo `docs/FINDINGS-v6_17-fixed-plan-figures.md` (findings, like `docs/FINDINGS-v5_63-state-statutes.md`); **not pooled**.
It can also ride in the next release's zip instead of being uploaded now.
