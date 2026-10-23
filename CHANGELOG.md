# Changelog

## v6.30 — one dollar unit and one inflation clock for the tax engines (D-60)

**A modeling release.** Every tax engine changes how it states and projects dollars, so the Taxes, IRMAA, Roth and Withdrawal tabs, the
Monte Carlo and What Breaks all move. The scope is `docs/SCOPE_D60_DOLLAR_UNITS_V630.md` (repo-only, fulfilled; build record §7). Steve,
*"D-60"*; on the scope, *"All as recommended"* — DU-1 to DU-9, all (a). Built on v6.29 (source `2b1c24f1…`). METHODOLOGY's new section
*One dollar unit and one inflation clock for the tax engines (v6.30)* is the full account.

**What was wrong (v6.29, measured at the scope).**
- **Mixed units.** Engines A (Roth), B (Taxes) and C (IRMAA) held Social Security, the pension, income streams and dividends flat in today's
  dollars and took Engine D's draw deflated to today's dollars, while their RMDs came off balances growing in nominal dollars, realized gains
  arrived undeflated, and brackets and IRMAA tiers grew 2% a year. A Taxes-tab row was in neither today's dollars nor its own year's.
  Holding Social Security flat while §86's thresholds — which the law never indexes — stood still in effect indexed those thresholds at full
  inflation: optimistic exactly where §86 binds.
- **Two clocks.** The Monte Carlo and the thresholds priced from the as-of date; Engine D (the Withdrawal tab), the bridge's deflator and
  What Breaks from the retirement year. On Engine D a fixed pension was worth more than it pays, its balances could not see the years
  before retirement, and a taxable account's pre-retirement inflation gain was never taxed.
- **One rate for two indexes.** A fixed 2% stood in for both C-CPI-U (the brackets' index in law) and CPI-U (IRMAA's and the poverty line's),
  declared twice (ARCHITECTUREIssues E-9).

**Owned — v6.29 measured its own finding partially.** v6.29's description of D-60 (its scope, METHODOLOGY, the Taxes tab, the Field Manual's
inflation map, MissingFeatures) quoted a units-consistent schedule that grew **only Social Security**. With every unit fixed (same 2% index,
same clock), the shipped rows read as each year's dollars ran low by **$97,925** ($0 slider) and **$72,837** ($70,000), not $70,823 and
$40,664; read as today's dollars high by $16,878 and $891, not $34,510 and $24,562; and at $70,000 the Monte Carlo's charge was **not**
measurably pessimistic (95.43% → 95.40%), where the app said 0.6–0.8 points. Every sentence quoting those figures is gone; METHODOLOGY keeps
a dated paragraph with the corrected ones.

**What changed (DU-1 to DU-9).**
- **One clock** (DU-1): every engine prices from the as-of year. Spending, Social Security and COLA'd streams grow from today; a pension, a
  stream without COLA, the conversion slider, the example's built-in part-time work (DU-9) and a QCD are the dollars paid that year.
- **One unit:** Engines A–D compute each year in that year's own dollars; the bridge (`withdrawalPlanSeries`) passes Engine D's draw and gain
  through unchanged.
- **Balances** (DU-7): today's holdings reach retirement at the plan's inflation in every engine — no real growth — with **cost basis left
  nominal**, so the inflation a taxable holding gains before retirement is a realized gain when sold, and **the planned-contribution accrual
  at face value** (the v5.10 rule), through one helper, `carryStartBalances`.
- **Rates by statute** (DU-3), from one place and no literal: the bracket family (brackets, standard deduction and its age-65 extra, LTCG
  breakpoints, AMT figures, the QCD limit) at the plan's inflation less 0.25 point (`chainedCpiRate`, C-CPI-U — §1(f)(3), cited by §63(c)(4),
  §1(j)(5)(C), §55(d)(4)(B), §408(d)(8)(G)); IRMAA tiers and the poverty line at the plan's inflation (`cpiuRate`, CPI-U — 42 U.S.C.
  §1395r(i)(5)(A), §9902(2)); the Social Security wage base at the plan's inflation (`inflateWageBase`; the law uses the wage index, §430(b) —
  slightly optimistic, disclosed). §86, NIIT, Additional Medicare and the OBBBA deduction stay fixed, as in law; state figures stay as each
  statute states them (DU-4 — Georgia's exclusion is a fixed $65,000). `TAX_INDEX_RATE`, `IRMAA_INDEX_RATE` and `ACA_CONSTS.fplInflProxy`
  are gone. Each U.S.C. citation was read on uscode.house.gov or Cornell LII at the build.
- **IRMAA surcharges** grow with the plan's inflation to their premium year (DU-5). Projected tiers stay unrounded (DU-6, C-13).
- **Displays** (DU-2): the Withdrawal, Taxes and IRMAA tabs' and the Roth ladder's rows are each year's own dollars and say so; every
  lifetime total also shows today's dollars (the Taxes tab's cards, the IRMAA total, the Withdrawal tab's *Total withdrawn* and *Roth
  converted*, the ladder's *Total conversion* and *Total tax cost*); the Roth tab's strategy table is in today's dollars and says so. My
  Data's pension field, the conversion slider and the QCD modeler say what kind of dollars they hold. The Verify tab's IRMAA checks compute their expected values from the scenario table and the statute rate written out.
- **The Monte Carlo** (`mcIncomeTaxSchedule`) is handed each year's tax in today's dollars (`totalTaxToday`) and grows it with each path's
  inflation as before; **What Breaks** reads Engine A's tax in today's dollars and values a fixed pension at its real worth at retirement
  (and, in its last-year draw-rate line, at its real worth in that year).
- **Copy:** the sentences the scope's copy census listed (§2.5) — the mixed units, the 2% proxy, v6.29's both-readings text — are replaced
  with what the code does; `t93` §J holds eleven of the old phrases extinct and five new ones present, by AST over every string. The Field
  Manual's inflation map and §13 say it. The four version sites read v6.30.

**What it moved — measured at the build** (v6.29 against v6.30, module-level; Monte Carlo 30 years, 3,000 paths, the same seeds within each
row). After the build review's accrual fix (below); before it the build reproduced the scope's prototype to within $2 on all six households.

| Example household | Taxes tab, lifetime | Monte Carlo 30 yr, > $500K | Engine D end, today's $ |
|---|---|---|---|
| BULL-LEANING (default), $70,000 slider | $213,670 → **$201,181** today's $ ($272,791 each year's) | 95.43% → 95.60% | −0.87% |
| BULL-LEANING, $0 | $212,552 → **$185,807** ($294,215) | 95.00% → 95.63% | −0.91% |
| BASE, $70,000 | $216,230 → **$201,203** ($280,629) | 85.73% → 86.47% | −1.53% |
| BASE, $0 | $213,779 → **$180,578** ($296,084) | 84.67% → 86.63% | −1.50% |

Lifetime tax in today's dollars **fell** on the example, the scaled Georgia and New York households, the single filer and (by $1,702) a late
retiree, and **rose** for a modest Ohio couple with a pension and a COLA rental ($161,018 → $175,551, whose 30-year success fell 79.33% →
78.23%). IRMAA rose where it applies (single filer $9,780 → $12,080 in today's dollars; New York ×3 $41,580 → $43,880). Engine D's end balance
fell on every household (−0.09% to −3.14%), most for the household furthest from retirement. The 6-year headline moved within its run-to-run
noise: that run takes no seed, and repeated runs of one build differ by about ±0.2 point. The direction depends on the
household; METHODOLOGY says why.

**Found by the build review, fixed — the planned-contribution accrual was carried with the holdings.** The first build multiplied each
engine's opening balances (`retireStartBalances`, which includes the accrual) by the carry factor, so a plan's future contributions were
also inflated to retirement — against DU-7 (a) (*"keeps the v5.10 rule for accrued contributions"*) and against the METHODOLOGY text drafted
for this release. The scope's prototype did the same, so its figures and every oracle built from them agreed, and the suite could not see it.
On a plan retiring twelve years out it overstated the opening Traditional balance by $143,808 in 2038's dollars, and it turned that plan's
lifetime tax from falling ($235,040) to rising ($251,374). Fixed to the decision as written — one helper, `carryStartBalances`, carries the
holdings and adds the accrual at face, re-taking the annuity and employer shares; the oracles corrected (`units_v630.mjs` `carryHold`, `t23`,
`t24`, `t25`, `t26`, `t28`, `t70`, `sim_ledger`); `t93` §O, H-10, control U11. *Steve: this follows DU-7 (a) as worded; if you meant the
accrual to be carried too, that is a one-line change and a re-decision.*

**Found at the build, fixed.**
- **The wage base was indexed at the chained (bracket) rate** — the first implementation sent it through `inflateTaxConst`, against DU-3 (a).
  The payroll-tax suites' law oracles (`t77`, `t79`) caught it; it now has its own helper, `inflateWageBase`, at CPI-U; `t93` A-4b and
  control U8 keep it there. The Field Manual says the modeled cap runs slightly low.
- **`t92`'s rental fixture was never taxed.** Its expense rows used field names the app does not read and its stream's tax type `"taxable"`
  matched neither value the engines test, so the rent counted as income but was never taxed. Fixed (`cat`/`start`/`end`/`freq`, tax
  `"ordinary"`); the comment owns it.
- **The build's own census of the scope's §3 found tests missing** — the Monte Carlo against Engine B within a computed compounding gap,
  statute oracles for the NIIT's unindexed threshold and the IRMAA tiers, What Breaks' rendered estimate. Added to `t93` (§M, §N, §W) with
  controls U9 and U10. The build review then showed by mutation that Engine C's streams and Engine A's Social Security could be held flat
  without `t93` noticing: added D-7 (Engine C's MAGI equals Engine B's every year), F-5/F-6 (Engine A through a new read-only per-year seam,
  `incomeByYr`), I-2 (Engine A's opening taxable balance carried, its basis not), H-11 (no unindexed figure reaches an inflator; control U12),
  and a tighter M-2.
- **Smaller, from the review:** Engine A's dividend base subtracted today's HSA from a carried balance (now carried too); the Field Manual's
  Withdrawal section still said spending was *"inflated from the retirement year"* and its FAQ that every stream is in today's dollars
  (corrected); the Roth rules box and the comparator stated units differently (made consistent); What Breaks' last-year draw-rate line
  priced the fixed pension at its retirement-year worth (optimistic; now that year's); a stale Verify label and comment.

**Filed, not fixed:** MissingFeatures **D-64** — Engine D's balances do not carry the contribution accrual its Traditional share counts (on
a plan retiring twelve years out the shares sum to 1.274); What Breaks starts from the same balance. **Closed:** MissingFeatures **D-60**;
ARCHITECTUREIssues **E-9**. **Narrowed:** E-22 (the four indexation lambdas delegate to one helper). **Noted:** E-23 (`fplInflProxy` gone).
FlawsToFix **C-13**'s reason re-worded (the proxy it cited is gone; still open).

**Limitations, stated.** The wage base at prices, not wages (optimistic); state figures fixed (overstates tax where a state indexes —
conservative); projected tiers and brackets unrounded (C-13); Part B premium growth not modeled beyond inflation; the 2026 ACA
applicable-percentage table held; the Monte Carlo scales the whole schedule, unindexed thresholds included, by each path's inflation; the MC
compounds by quarter from the as-of month and the engines by year, so they agree to the year, not the quarter; the 0.25-point gap is fixed
under every preset. The scope measured the Roth tab's best cell on its prototype (a near-tie that changed on three of six households); the
build did not re-measure that ranking beyond the suites' pins.

**Tests.** New suite **`t93_dollar_units.mjs`**, both legs; the v6.29 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-22, D-60]`.
- **§A** the rates, written out independently (C-CPI-U = i − 0.25, CPI-U = i, the wage base at CPI-U, the top IRMAA tier frozen through 2027,
  the poverty line, the Roth projection's brackets); **§B** Engine B's units input by input; **§C the extinction invariant** — with every
  indexed rate forced to the plan's inflation through a test seam, a household of real income pays the same tax in today's dollars every
  year, to $2; **§D** one clock in Engines B and D by hand and in Engine C through its MAGI, and at the two-clock boundary (retiring in the as-of year)
  Engine D is v6.29's to the cent; **§E** the Monte Carlo's schedule to the cent; **§F** Engine A's today's-dollar fields and its own income
  units through the per-year seam; **§G** surcharges to the premium year; **§H** the
  source by AST (no `1.02`; the carry moves the gain pool and never the basis; the carry in one helper; the bridge holds no inflation
  arithmetic; no unindexed figure reaches an inflator; What Breaks); **§I** basis (Engine A's opening balance carried, its basis not); **§J** copy; **§K** an ACA household under the 400% cliff; **§L** the rendered tabs, including the Withdrawal tab's
  today's-dollar totals (exact), the ladder's (bounded) and the input labels; **§M** the Monte Carlo's quarterly
  charges against Engine B within each year's computed compounding gap; **§N** statute oracles — the NIIT's unindexed $250,000/$200,000 on the
  New York ×3 household and the IRMAA tiers at CPI-U on the single filer, to the dollar; **§O** Engine B's and C's opening Traditional
  balances against raw holdings and contributions — the accrual at face (Engine A's and the ladder's go through the same helper, held there
  by H-10 and pinned by the recursions in `t23`–`t28` and `t70`); **§W** What Breaks' rendered estimate. F-1 to F-4 and M-1 are restatement-consistency
  checks, true by construction; the scope §7 lists what §3 promised and remains untested.

`t93` runs **97** current and **53** on the v6.29 leg.

**Re-gated, each moved figure re-derived — never pasted.** Every suite that pins a figure from Engines A–D, the Monte Carlo, What Breaks or
the Verify tab's IRMAA rows re-derives it on the v6.30 leg from an independent model, keeping its v6.29 assertion on the v6.29 leg:
- **Oracles built or extended for this:** `qa/tools/fed_oracle_v630.mjs` (new — federal tax, LTCG, MAGI and §86 per Engine B row, to the
  cent; `t40`, `t42`, `t43`); `qa/tools/sim_ledger.mjs`'s v6.30 mode (the drawdown ledger in carried units; `t22`), checked by
  `qa/tools/validate_v630.mjs` (new; 169/0 on six households, and its v5.38 mode still reproduces every old pin); `qa/units_v630.mjs` (new —
  the unit facts the suites' models share, read from the scenario table, never the app's helpers); an Engine C replica (`t25`); ladder
  recursions in carried units, the accrual at face (`t23`, `t24`, `t26`, `t28`, `t70`); `t19`'s ledger seeded in carried units with MAGI by the §86 statute
  function; independent pool walks (`t20`, `t71`, `t72`).
- **Re-gated suites:** `t1` (S-5, S-8 and S-9 read the one carry helper and the carried HSA), `t2` (the v629→v630 parity diff: the three Monte Carlo keys and Engine A's four, by design), `t8` (STEP-1 and the
  per-person seed checks read the seed through the carry helper), `t10`, `t13`–`t20`, `t22`–`t26`, `t28`, `t29` (B-21 to B-24 for the four new census rows;
  `boundaries.mjs`' payroll row at the plan's rate), `t32`, `t33`, `t35`, `t40`–`t44`, `t56`, `t58`,
  `t60`, `t70`–`t72`, `t75`–`t77`, `t79`, `t81`, `t83`, `t92` (the DF-7 sentences now absent; METHODOLOGY's v6.30 text; the fixture fix).
  `v630` registered across the suites; `t33` PINS v630 measured (below).
- **Re-pinned by measurement, where no independent model reaches** (each listed so it can be re-derived later): `t33` E-3 738 → 753, E-4
  60,035 → 60,062, F-3 50 → 68 (fixture $10,000 → $14,000 a month: at $10,000 no tier is crossed in v6.30 units), G-1 noStream 155,661 →
  206,189 (a Georgia, 2052-death, streams household outside the ledger's scope; F-2/F-4 re-made as derived — the IRMAA delta is one tier step
  × persons × (1+i)^(premium year − 2026)); `t40` A1 Engine D lifetime draw 393,327 → 433,413, A3 lifetime RMD B 1,281,806 → 1,332,039 and D
  981,936 → 1,057,891, B3 Engine C RMD = A3 B, C0 no-portfolio gains residue 2,153.87 → 14,631.36, C1 checksum 5,185,167.5373 →
  7,255,030.8304 (main leg; on the v6.18 and v6.21 attribution legs those five are skipped with a printed line — the legs reproduced old
  tables, which the units end — and every derived check runs); `t42` D-2 married lifetime draws 1,567,766 → 1,703,565, D-4 the planned path
  2,083,910 → 2,084,618 (main leg); `t58` B-NC lifetime draw 350,148 → 433,413 (= `t40` A1); `t76` E-2a the crossover 2061 → 2059 — age 95/93
  at a $10,000 slider ($5,000 no longer recovers on the v6.17 table).
- **`t58`'s NY 2031 row on the v6.17 table** is +$2.76 against the per-person relief: $102.72 of B's annuity money sits outside New York's
  relief, so (15,000 + 537 + 481 + 102.72 − 16,050) × 3.9% = $2.76 — derived from the engine's per-person record and accepted as a
  relief-reach row on v6.30.
- **`domdiff_withdrawal`** gains a v629 → v630 arm: the same year rows render, every Expenses cell is v6.29's × (1+i)^(retirement − as-of) to
  the $K rounding, the units sentence on v6.30 only; the Taxes and IRMAA tables differ with the same rows.
- **`boundaries.mjs`** gains the four rows the scope named (OPERATIONS §K1): the two-clock coincidence, an NIIT year, an IRMAA year and an
  ACA subsidy year under the cliff; on the example the clock row is clear (it retires three years after its as-of year) and the other three are ON (31 of 36 rows ON).

**Counts**, from the full suite run from the packaged copies:
- **9,423 app checks across 92 app suites, 0 failed, 0 DIED**;
- MC parity 10/10 — the v6.29 → v6.30 pair moves seven fingerprints by design (the three Monte Carlo keys and Engine A's four), declared in
  `t2`'s intended differences, and every other key is byte-identical;
- tooling: `t21` 64, `domdiff` 40, `sets` 12 + 12;
- GRAND **9,561**.

Against v6.29, the current-leg changes are `t93`, new (97); `t29` 104 → 112 (B-21 to B-24); `t10` 358 → 361, `t43` 38 → 41, `t13` 53 → 55 and
`t42` 34 → 36 (cases derived on the v6.30 leg); `t1`, `t16`, `t23`, `t25`, `t40`, `t75` and `t92` one more each. Every other current-leg count is
unchanged, the re-gated suites included. The v6.29 leg counts 3,834. The two attribution runs — v6.18's spending table (eight suites) and v6.21's (seven) — count 234 and 237; in
them `t40` and `t42` count 29 and 33 (they skip the measured v6.30 exacts, each printed) and `t43` 41, `t75` 47 (one more than v6.29's each).
Together 5,118 + 3,834 + 234 + 237 = 9,423.

Controls: `qa/tools/controls_v630_dollar_units.py` on a copy of that packaged run folder — 13 of 13 as expected (U0 silent, U1–U12 each firing), every file restored and hash-checked. Each control puts one removed defect back:
a flat Social Security in Engine B, a deflating bridge, Engine D on the retirement clock, an inflated basis, `1.02` in the helper, a flat
surcharge in Engine C, a fixed-rate poverty line, the wage base at the chained rate, the Monte Carlo handed each year's own figure, What
Breaks on the each-year total, the contribution accrual carried, an indexed NIIT threshold.

**The build review** (an agent that had not seen the build, given the source, the tests, the documents and the scope) found **1 blocker,
3 should-fix and 10 notes**; every one was taken or answered (scope §7). The blocker — the contribution accrual carried with the holdings —
is above. The should-fix items: Field Manual sentences untrue of v6.30 (corrected, and today's-dollar companions added to the four lifetime
totals that had none); tests the scope promised and the build had not shipped, shown by mutation (D-7, F-5/F-6, I-2, H-11, a tighter M-2);
dollar inputs that did not name their kind (the conversion slider and the QCD modeler). A second pass by the same reviewer, on the fixes,
found no blocker and one should-fix — the new today's-dollar totals and labels had no test (added, `t93` L-7 to L-9) — and notes, taken:
the Field Manual's Withdrawal section said Backtest and What Breaks read the table "the same way" (each has its own price path), the
ladder's total read *"9-YR"* for a ladder of any length (now its own count of years), and two wordings here (the headline's noise; what §O
covers). Noted and disclosed, not changed: a retirement year
already past deflates today's holdings; What Breaks and the steady-state draw line read a fixed pension two ways (neither a tax figure).

**Owned, in the build.** The first controls run's U3 named a variable outside Engine D's scope, so it crashed the suite instead of testing it
(fixed and re-run); a first explanation of `t58`'s New York row was wrong (the suite's comment first said a per-person cap; corrected to the
annuity money outside New York's relief); and a draft of the per-suite note mis-counted the attribution legs' skips (corrected from the log). Both packaged
runs — before and after the reviewer's second pass — were green on their first pass.

**Provenance.** Source `f2d3f578492279eac501eef6bdda058f` · built `index.html` `3d013b092b612442b35e2ec02163010d` (vite 5.4.21, `npm ci`; the immediately-prior v6.29 rebuilt byte-identically
to `ce3605af…`) · `smoke_built` 22/22.

## v6.29 — what the app says about its own model, checked (F-25)

**A presentation release with display computations and a METHODOLOGY correction.** No engine, no figure the engines compute, no grade and
no stored field changes (every engine, `stateTaxAnnual`'s arithmetic, `SCENARIOS`, `TAX_CONSTS` and `GUARDRAILS` are token-identical to
v6.28 with comments removed; MC parity 10/10). Displayed figures that change by decision: the Income tab's gap draw, the mortgage what-if's
return and sentence, Field Manual Example 2, and the Stress tab's recovery sentence (DF-2); six new Verify checks (72 → 78, DF-5 (b)); a
spouse-B RMD event (DF-6); the Exit Plan's dates in months (DF-10). The scope is `docs/SCOPE_F25_MODEL_CLAIMS_V629.md` (repo-only,
fulfilled; its ledger `docs/F25_LEDGER_V628.tsv`). Steve, *"Let's continue with F-25"*; on the scope, *"All as recommended"* — DF-1 to DF-11
(a), DF-5 (b). Built on v6.28 (source `6ff3561e…`).

**What was wrong (v6.28).** F-25 filed the v6.27 census's editorial and unchecked model claims. Re-resolved on v6.28 and read by two
independent readers per entry against the code, 326 rows: **93 FALSE or PARTLY** (4 figures, 48 misleading, 47 imprecise), 16 editorial,
40 claims about the world. Among them:
- **Verdicts typed once and printed for every plan:** the Stress tab's *"Median portfolio recovers to pre-crash levels by Year 4–5"* (on
  the example the median does not regain its pre-crash level within the run under BULL or BASE; about ten years under HISTORICAL); the
  Backtest's *"almost no historical sequence breaks the plan"*; What Breaks' *"demands far worse than the worst of history"* and *"expect
  these edges to be far away"*, printed for a plan failing at its baseline — with history figures the app's own 1928–2025 table contradicts
  (worst decade 1999–2008 at −3.8%/yr real, not 2000–09 at −3.4%; weakest 20 years +0.6%, not "~+2%"; 98 years, not "150+").
- **The presets:** the Field Manual and Dashboard named BASE as the conservative default (it has been BULL-LEANING since v5.80), and told
  history-seekers to switch to the preset they were on (HISTORICAL is the history preset).
- **What success means:** *"your savings lasted"* (the headline is the 6-year run ending above $800,000); the Backtest called the 30-year
  run "the MC headline"; the header called it "the planned path".
- **What Ask AI sends:** the privacy lists omitted the plan description (birth dates, plan-to ages, state, home, mortgage, home-move cash,
  streams) and the last 12 messages; *"nothing leaves this browser"* (the page loads its fonts; Ask AI sends a summary).
- **Where an input reaches:** the scenario (*"every tab re-runs"*), streams (*"in every simulation"*), the home-move cash, the SS trust-fund
  cut and the Roth slider each named the wrong tabs.
- **The Verify tab** promised *"every statutory constant"* while the six AMT figures were unchecked (E-23).
- **Four figures:** the gap draw (B's Social Security subtracted for the whole gap), the mortgage what-if (Bull's ~4.5% for every preset;
  a negative number before "pts lower"), Example 2 ($10,900 on a different method from Example 1's), the Stress recovery.
- **The model, described wrongly in the Field Manual:** the regime draw "captures streaks" (each year is independent); variance "comes
  mostly from regime-switching" (for a balanced mix the noise supplies more); an unclassified account "defaults to Traditional" (Taxable —
  the optimistic direction); the ladder's MAGI misses "one term" (two); a missing income figure "uses an example value" ($0); and more.
- **The dollar units:** the app called its 2% bracket indexing "the conservative direction". Measured, the tax engines mix units, and the
  direction depends on the reading — below.
- **Law and published figures:** *"Roth conversions have no withholding"*; QCDs *"never appear on your tax return"*; a ≈1.5% index yield;
  the ACA *"Nov 1 – Jan 15 each year"* and *"often $10,000–$25,000"*; the SS *"legal default"* and *"$810-per-$1,000"*; LTC statistics from a
  2005 study; a $5 rate-limit rule and *"¾ of a word"*; Fannie and Freddie as Treasury-level credit; Bengen's result understated.

**What changed.**
- **Every confirmed row reworded** to what the code does (DF-1 (a)); the editorial superlatives removed with their facts kept (DF-3 (a));
  the world claims checked against primary sources or published research and corrected, comparisons with other tools removed (DF-4 (a)).
- **Computed, not typed:** the Stress recovery (`stressRecovery`: the last snapshot before the crash year, the trough in the forced years and
  the one after, the first snapshot back); the Backtest's survival note, shown only at ≥ 90% and naming what it leaves out; What Breaks'
  history comparison from `HISTORICAL_RETURNS` (`historicalWorstRealWindow`, `historicalCumReturn`), shown only when the break-point is below
  the weakest 20-year window, and its four items when the plan fails at its own return; the presets' expected returns
  (`presetExpectedRealEquity`, `presetExpectedPortfolioReturn`) in every in-app sentence that names a preset.
- **The figures:** the gap draw pays B from B's claim month (and the phase table agrees); the mortgage what-if quotes the active preset and
  keys its sentence to the sign; Example 2 states Example 1's method ($10,400); the Stress recovery above.
- **Verify:** six AMT checks against Rev. Proc. 2025-32 and §55(d)(4); the promise names what is checked and what is not (DF-5 (b), E-23
  noted). **Events:** spouse B's RMD event (`"rmdB"`, couples), estimated-tax dates in every retirement year, the withholding sentence
  corrected (W-4R, W-4V). **Exit Plan:** each spouse's coverage gap from their own retirement, in months; the SS gap in months; the
  conversion window from the selected year; the first phase renamed *"CHECK THE NUMBERS THIS PLAN RESTS ON"* (DF-11); the RMD line per
  person. **Grade:** *NOTE:* on the lines the grade does not read (the three fixed grades, Income Floor's months).
- **The dollar units (DF-7 (a)):** the Taxes tab, the Roth tab's rules box, the Field Manual and METHODOLOGY say both directions: read as
  each year's own dollars the Taxes tab's rows run **low** ($40,664 at the $70,000 slider on the example, $70,823 at $0); the Monte Carlo,
  which grows the schedule again, charges slightly **more** than a units-consistent tax (30-year success 0.6–0.8 points low). The units fix
  is filed (MissingFeatures **D-60**).
- **Found at the build, fixed:** the CT, NJ, NY, RI and VA notes and METHODOLOGY said the state base carries no dividends or interest — it
  carries the taxable yield at every call; `t35` had locked the false disclosure (D-2/D-3, D-10/D-11, D-18/D-19, re-gated). The Stress
  scenario cards, What Breaks' 1929–32 figure, the Survivor tab's draw sentence, the Dashboard's crash card.
- §13 records the change; the four version sites read v6.29.

**The build review** (an agent that had not seen the build) found **2 blockers, 12 should-fix and 15 notes**; all blockers and should-fix
items were taken, and ten of the notes (scope §7). The blockers: the new gap description named a "Spouse B" on single plans, and the suite
had not yet run on the final source.

**Filed, not fixed:** MissingFeatures **D-60** (the units fix), **D-61** (QCD eligibility after a death, Engines B and C), **D-62** (STAY
UNDER IRMAA's own sale can cross the cliff), **D-63** (the Dashboard's crash card compares unlike runs); D-57 widened to the home-move cash
(its gap-draw note closed); UsabilityFlaws **F-26** (claims the census did not reach: the Stress tab's other cards, the token estimates, the
Roth ladder table's start year, the ACA status line, the Backtest's "1966", and the repo README's "every statutory constant" and stale
counts).

**Tests.** New suite **`t92`**, both legs; the v6.28 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-22, F-25]`.
- **§A:** extinction of 53 replaced phrases across every string (AI-addressed texts and §13's release entries excepted); no typed preset
  name in an in-app sentence; DF-9's pin (`DEFAULT_SCENARIO_PRESET === "bull"` with the Field Manual's typed mentions); the Verify count, and
  **each AMT key proved checked by mutation** (doubling it turns a check red).
- **§B:** the history helpers against windows computed in the suite from the table, and the Field Manual's typed figures against them; the
  preset returns; the Stress recovery against an independent reading of four runs (two presets, retiring 10 and 16 years later) and its dates
  (pre-crash before the crash year, trough in the forced years); rendered — the Stress sentence, the Backtest note above and below 90%, What
  Breaks on the example and on a plan failing at its own return, the MC and Dashboard preset lines, the Verify tab.
- **§C:** the gap draw against month loops on three couples (B after, inside and at the gap) and a single plan; the phase table; the
  mortgage sentence's return and sign; Example 2 by hand. **§D:** the events (17 for a couple, 13 single; `rmdB`; estimated tax); the Exit
  Plan's months on a couple whose B retires later and whose A turns 65 after retiring. **§E:** privacy parity — the request's parts by AST
  against the landing, My Data and Field Manual lists. **§F:** the Field Manual's corrected descriptions, the inflation and noise figures
  against the code, and METHODOLOGY's measurement.

`t92` runs **144** current and **86** on the v6.28 leg.

**Existing suites:** `boundaries.mjs` gains `ss_claim_after_gap` (OPERATIONS §K1: the example's B claims at the gap's start, so the gap fix
cannot be seen on it); `t29` gains B-20 and the `claim` fixture's flip (101 → 104). Re-gated for the copy this release corrects, each with
its reason at the site: `t1` (Verify count 72 → 78), `t4` (the Exit Plan's title, the Taxable/HSA sentence, the accrual readout), `t35`
(the dividend locks), `t78` F-1b (16 → 17 events), `t83` I-1 and I-6, `t86` G-5, `t90` B-5c, `t91` B-4, B-6, C-8, C-13b and the lint's
inflation allowance. `v629` registered by the AST registrar (393 extensions) with `t1`'s and `t4`'s version ternaries by hand, `t33` PINS
(unchanged, confirmed by running) and `t45`, `t47`, `t48` by hand; `shim.txt` exposes the five helpers and `DEFAULT_SCENARIO_PRESET`.
`domdiff_withdrawal` gains a v628 → v629 arm: the header chip, the RMD clause, the Tax line and Step 6, each masked by an old/new pattern
pair bound to one hit on its own side and none on the other; the schedule and everything else byte-identical (32 → 36 on this pair).

**Counts**, from the full suite run from the packaged copies:
- **9,187 app checks across 91 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 36, `sets` 12 + 12;
- GRAND **9,321**.

Against v6.28, the current-leg changes are `t92`, new (144), and `t29` 101 → 104; every other current-leg count is unchanged, the re-gated
suites included. On the prior leg `t91` reads 71 where it read 28, because the prior leg is now v6.28, which carries the rules it pins;
`t92`'s v6.28 leg adds 86 and `t29`'s prior leg 3. Together, 8,908 + 279 = 9,187.

Controls: `qa/tools/controls_v629_model_claims.py` on a copy of that packaged run folder — 20 of 20 as expected, every file restored.

**Owned.** The first counted run from the packaged copies had one red, in tooling: `domdiff`'s Withdrawal tab was not byte-identical
v6.28 → v6.29, because this release changes four of its phrases and the tool had no arm for the pair. The arm was added and the whole suite
re-run from a fresh run folder built from the packaged copies; the counts above are that run's. In the build, the Field Manual's §13
entry was first written with a raw newline inside the one-line string, which broke the parse (caught by the build, fixed); the first
census missed the VA and RI dividend notes (caught by the build's own re-census, fixed with the other three); and the first
`stressRecovery` took the pre-crash peak inside the crash year (redefined before any figure shipped).

**Provenance.** Source `2b1c24f145c10e5d5e2b8abfdf3a9db8` · built `index.html` `ce3605afdbafaa292bed443988f6ea33` (vite 5.4.21, `npm ci`; the immediately-prior v6.28 rebuilt byte-identically to
`b51ca85f…`) · `smoke_built` 22/22.

## v6.28 — the app describes the model, it does not direct (F-23, F-24)

**A presentation release with a METHODOLOGY correction.** No engine, no figure the engines compute, no grade and no stored field changes.
Three displayed figures change by decision: the Grade tab's *"Lost ~X GPA points"* (DF-1), the Withdrawal tab's Priority-1 year (DF-7), and
its holdings card's *Starting Traditional* (the build review). One is removed: the Grade tab's rough RMD estimate (DF-8). METHODOLOGY §9 is
corrected. The scope is `docs/SCOPE_F23_F24_DIRECTIVES_V628.md` (repo-only, fulfilled). Steve, *"go"* (F-23 with F-24); on the census,
*"Directives + F-24 (Recommended)"*; then all eight decisions as recommended: DF-1 (a) *"Real cost, weights as points"*, DF-3 and DF-4 (a),
DF-5 (a) *"Keep the examples"*, DF-2, DF-6, DF-7 and DF-8 (a). Built on v6.27 (source `32b34771…`).

**What was wrong (v6.27).** F-23 named four places where the app told the household what to do. **It was about ten times wider.**
A parser census of every user-facing string and the Field Manual (13,177 pieces; 1,889 prose pieces read by six independent readers)
flagged 283 entries: 39 directives, 52 borderline, 102 editorial claims and 151 specific claims about the model. Every directive and
borderline entry was adjudicated against the source. Among them:
- the Guardrails tab's three *"ACTION:"* lines, one of them *"Increase spending 5% or boost Roth conversions"*;
- the Withdrawal tab's eight steps (*"Execute planned Roth conversion … to fill 22% bracket. Pay conversion taxes from Taxable account"*),
  its *"Fill 12%/22% brackets opportunistically"* and *"Tap only when…"*, and a three-strategy comparison closed by a *"Recommendation:"*;
- the Exit Plan's *"Elect the pension's joint-&-survivor option"*, *"Build 1–2 years of spending into…"*, *"Don't give notice until it isn't"*
  and *"Often the highest-value move in the whole transition"*;
- the Events tab's *"Convert the planned amount … Pay the tax from the taxable account"* and *"usually better to take it in…"*;
- the SS tab's *"SURVIVOR BENEFIT — THE #1 OPTIMIZATION LEVER"* and *"HOUSEHOLD LIFETIME OPTIMIZER"*;
- the Roth tab's *"22% (ideal) or 24% (ceiling)"*, *"The classic guideline says"* and *"the standard advice"*;
- the Field Manual's Survivor entry, *"Argues for front-loading Roth conversions"*;
- the Stress tab's *"Reserve defense"*, the checklist's *"Consider whether an irrevocable trust fits"*;
- the Field Manual's *"PAY CONVERSION TAX FROM OUTSIDE FUNDS — NOT FROM RETIREMENT ASSETS"* and *"The safe move"*.

**Twelve sentences were false about the model** (scope §0.3, V-1 to V-12, each checked in the source):
- No engine changes a Roth conversion at a guardrail band (V-2).
- The Withdrawal tab's schedule (Engine D) harvests nothing (V-3), converts the slider's amount rather than filling a bracket and pays no
  conversion tax (V-4), applies no guardrail (V-5; the Monte Carlo engines do, on the whole monthly expense), and draws Traditional and Roth
  **in proportion within each sleeve**, not Traditional then Roth (V-9). Its Priority-1 *"Years active"* was a fixed three years (V-6).
- No engine moves money between sleeves; the Monte Carlo draws from one balance at the holdings' mix (V-7, V-8, V-10).
- The Dashboard sent guardrail readers to a schedule that applies none (V-11).
- The SS tab said Social Security is *"excluded from MAGI"*; taxable benefits are in IRMAA's MAGI, in law and in Engine C (V-1).
- The SS tab's survivor card told every couple that spouse A is the higher earner, with typed pronouns (V-12).
METHODOLOGY §9 said the schedule applied the guardrails and presented the strategy comparison.

F-24 (the Grade tab, filed by the v6.27 build review): *"Lost ~X GPA points"* divided by 100 where the weights sum to 78, so every figure
read 22% low (the example's Estate Readiness read 0.24; its real cost is 3 × 8 / 78 = 0.31); the *"Weight: 20%"* chips summed to 78%;
Income Floor's drag was editorial and quoted a gap figure computed differently from the Income tab's; the Estate drag stated legal effects
as fact; and the LTC test, `/ltc|long.?term/i`, also matched a *"Long-term disability"* row.

**What changed.**
- **Directives** are recast as what the model computes or assumes, the choice left to the household. The Guardrails tab gives the Monte
  Carlo's rule from `GUARDRAILS` itself and *"MODEL: cuts / unchanged / raises"*; its status chips read the band. The Withdrawal tab's
  subtitle is *"The order it draws from │ What the schedule models"*; its cards describe Priority 1 (*"Drawn first: reaches $0 in {year}"*,
  the schedule's own year, with the $0 and refill edges — DF-7), the holdings (by sleeve, Traditional and Roth in proportion), and
  conversions and tax; its seven steps say what the schedule does, including *"this schedule pays no income tax"* and *"Guardrails: this
  schedule applies none"*; Section C, the comparison, is replaced by *"what this schedule models"* (DF-3). The Exit Plan is *"Exit plan —
  the dates and paperwork"*: its logistics stay, its choices say what the model assumes, and the pension item appears only for a couple with
  a pension (DF-4). The Events tab's alarm is *"Roth conversion deadline (if converting this year)"* (DF-6). The Field Manual's conversion-tax
  section is *"Paying conversion tax: outside funds or withholding — what each costs"*, its three worked examples kept and its rules of
  thumb removed (DF-5); Example 3's *"conversions still beat doing nothing"* is removed, not measured.
- **The false statements** are corrected where they stood, in the app and the Field Manual. The SS survivor card names the spouse with the
  larger benefit at full retirement age, by name, in either direction.
- **The Grade tab** (DF-1, DF-2, DF-8): lost points ÷ 78, so they add to 4 − GPA; weights as *"20 of 78"*; the cut-off in raw points, so the
  same drags show as at v6.27; *STATUS* only at GPA 4.0; Income Floor says it counts Social Security and the pension, not streams, and its
  drag gives months, with no dollar figure; the Estate drag makes no legal claim; the Monte Carlo sentence names its engine; Tax Efficiency
  gives each spouse's RMD start age, with no estimate. **One LTC test, `isLTCLabel`**, serves the Grade and Monte Carlo tabs and matches care
  labels only.
- **METHODOLOGY §9** says the schedule computes no income tax and applies no guardrails, and that the guardrails are the Monte Carlo's.
- §13 records the change; the four version sites read v6.28.

**The build review** (an agent that had not seen the build; scope §7) found **eight more blockers and eleven minor points**. Taken:
- the Withdrawal tab's new holdings card printed *Starting Traditional* from a total that also counts the Traditional and Annuity money
  entered under Other accounts, which Priority 1 already shows (the example: $111K in both cards); it now prints the holdings' own;
- the Exit Plan's income line left out income streams; its conversion years were said to end *"before RMDs"* (a couple's window runs to the
  second spouse's); its COBRA sentence said 18 months *"cannot span this gap"* whatever the gap's length;
- *"Claiming earlier gives … a smaller survivor benefit"* is true only of the larger benefit (the survivor keeps the larger check), in the
  Exit Plan and the checklist;
- survivor and couple wording on single plans (the SS filing event, the trust item, two Withdrawal lines);
- the in-app Events legend still read *"GREEN — window open: go"*; it now matches the Field Manual's;
- *"Social security timing & optimization"*; the Roth tab's Step 2 note on where the tax comes from with no outside money (the model pays
  from Roth, then Traditional); the IRMAA sentence's *"each year's MAGI"* (conversion years only); the conversion wording at a $0 slider;
  the Events item's window, now *"from the target retirement year"*; the survivor card's *"unless the claim ages reverse the order"*; the
  grade list's bare weight number (now *"20/78"*); METHODOLOGY §9's second paragraph;
- one more found while fixing those: the Field Manual figure's *"convert at low brackets"*.
The review's remaining points are filed in **F-25**.

**Filed, not fixed — UsabilityFlaws F-25:** the census's editorial claims and its unchecked model claims (`docs/F25_CENSUS_V627.tsv`,
repo-only), the gap-draw figure (with MissingFeatures D-57), and the review's remaining points: the Backtest tab's *"the MC headline success
is 'ended above $500K' … charges LTC shocks"* (false); *"Medicare-eligible at retirement"* for a birthday later in the retirement year;
*"Roth conversions have no withholding"*; the Events and Exit Plan windows from the target year where the schedule uses the selected one;
the *DRAG* label on sentences the grade does not read; the *"CONFIRM THE MONEY WORKS"* title.

**What it moved.** No figure the engines compute and no grade. `t90` B-8 renders five plans on both builds under one seed and finds every
grade equal; `domdiff_withdrawal` finds the schedule table byte-identical across the pair with only Section B, the steps and Section C
masked; MC parity 10/10 with no intended difference; `t33` PINS unchanged.

**Tests.** New suite **`t91`**, run on both legs; the v6.27 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-21, F-23]` or `[…, F-24]`.
- **§D, by AST — the model the new copy states:** `GUARDRAILS`' figures read live; both Monte Carlo engines read `GUARDRAILS` and `spendingAdj`, Engine D
  neither; Engine D converts `Math.min(rothAmount, …)` and draws Traditional by `tradFrac`; Engine C's `magi` includes `ssTaxable`; `isLTCLabel`
  matches care labels and not *"Long-term disability"*, and the v6.27 pattern is gone.
- **§A:** extinction of the 37 removed phrases across every string in the source (the AI-addressed texts and §13's release entries
  excepted) and of the first draft's three false sentences; a **directive lint on rendered text** — 24 tabs on three plans and the Field
  Manual by section — against a named allow-list, each entry with its reason, every entry used (A-4) and none a catch-all (A-4b).
- **§B, the Grade tab on six plans:** *"N of 78"*; every rendered *"Lost ~X"* = (4 − rendered GPA) × w / 78; the drags shown (v6.27's set);
  STATUS only at 4.0; the Monte Carlo, Income Floor and Estate copy; the disability row on the Grade and Monte Carlo tabs.
- **§C, rendered:** Guardrails, Withdrawal (Priority 1's year against the rendered schedule; the holdings card; the steps), Exit Plan (and a
  single plan), SS (V-1; V-12 on a couple whose spouse B has the larger benefit), Survivor, IRMAA, Stress, Income, Dashboard, Roth,
  Checklist, the build review's fixes (C-13 to C-13f), and the Events items from the app module in a child process on fixed dates.
- **§F:** the Field Manual's entries, §13's v6.28 entry first, and METHODOLOGY §9.

`t91` runs **71** current and **28** on the v6.27 leg.

**Existing suites:**
- `boundaries.mjs` gains `ltc_disability` (OPERATIONS §K1: the example has no long-term row that is not care, so the false match could not
  be seen on it), and `ltc_row` reads the leg's own `isLTCLabel` where it exists; `t29` gains B-19 and two controls (97 → 101).
- `t90` B-8's prior leg is the tag before the current one, with a printed skip by design where that leg is absent (owned below).
- `domdiff_withdrawal` gains a v627 → v628 arm: the subtitle and the Section B–C span masked, each bound to one hit a side and shown to have
  changed; the schedule table and everything else byte-identical (32 → 34).
- Re-gated for the copy this release corrects, each with its reason at the site: `t4` (the Field Manual's Withdrawal order, V-9), `t72`
  E-0/E-2 (the Roth figure now on the holdings card), `t86` G-7, E-3 and E-7c (*"optimizer"*; the rewritten Step 1); `t19`'s engine
  contract gains `_posTradW` and a check that a named IRA does not move it (71 → 72).
- `v628` registered by the AST registrar (175 gate extensions, 211 ladder entries, two map arms); `t33` PINS (unchanged, confirmed by
  running), `t45`, `t47` and `t48` by hand; `shim.txt` exposes `isLTCLabel`.

**Counts**, from the full suite run from the packaged copies:
- **8,908 app checks across 90 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 34, `sets` 12 + 12;
- GRAND **9,040**.

Against v6.27, the current-leg changes are `t91`, new (71), `t29` 97 → 101 and `t19` 71 → 72. On the prior leg `t90` reads 40, because B-8
takes its designed skip there.

**Controls.** `qa/tools/controls_v628_directives.py` (repo-only): **30 of 30 as expected**, each planting one defect back — an *ACTION:*
band; *"boost Roth"*; a guardrail figure typed as a literal; weights as percents; ÷ 100; a fourth drag; STATUS below 4.0; the v6.27 LTC
pattern; Income Floor's dollar figure; Estate's legal claim; the survivor card naming A on every couple; V-1; Priority 1's year off by two;
Roth drawn last; Step 7 cutting spending; a single plan told of joint-and-survivor; the pension directive; the Events item's tax line;
§13's entry; METHODOLOGY §9; the Field Manual's guardrail figures; Engine D reading `GUARDRAILS`; a new directive on the IRMAA tab; the
Roth tab's *"ideal"*; the holdings card's double count; the unconditional COBRA sentence; the Events legend's *"go"*; a single plan's
survivor wording; a catch-all allow-list entry hiding a planted directive (`t91` itself mutated); and the unmutated run. Every file was
restored and hash-checked. The counted run is on a copy of the packaged run folder, uninterrupted. (An earlier run on the workspace's
folder was cut by a container restart during C19, which left C19's mutant in that copy; a resumed run started on it before its md5 gave it
away, was stopped, and re-ran from a restored, hash-checked copy — also all as expected.)

⚠ **Owned.**
1. The scope's first draft would have restated the Withdrawal tab's Traditional-then-Roth order as *"the model's order"*; it is not the
   engine's (V-9). Found by the scope's review.
2. The scope's recommended Income Floor text quoted a gap figure without checking how it is computed. Found by the scope's review.
3. The scope's short-piece pass missed *"#1 OPTIMIZATION LEVER"*, and its suite census missed `domdiff_withdrawal`. Found by the scope's review.
4. **`t90` B-8, written at v6.27, pinned its prior leg to `"v626"`** — the prior-pinned shape v6.27 repaired in `t89` A-7 the same week.
   Found at this scope; B-8 now takes the tag before the current one, with a designed skip where that leg is absent.
5. **The first build carried eight new false or misleading sentences** that the build review found: among them a holdings figure counting
   Other-account money twice, an income floor without streams, conversion years said to end before RMDs, and couple wording on single plans.
   Each was copy this release wrote or rewrote. They are fixed and pinned (`t91` C-13 to C-13f, A-1c).
6. **Suites that pinned the copy this release corrects were found by running them, not by census.** The first full run (on the
   pre-review build) found `t4`'s Field Manual check red: it pinned the Withdrawal entry's *"Taxable → Traditional → Roth"* order (V-9). A
   parser census of every string and regex in `qa/` against both **sources** then found `t86` G-7 (*"Roth optimizer"*). It could not see
   rendered-text checks (a pattern like `Starting balance: \$([\d,]+)K` matches no source), and a second census against the example's
   **rendered** tabs found `t86` E-3 and could not see E-7c, a check made on another plan (found by running `t86`). The second full run found
   `t72` E-0/E-2 reading the old Roth card and `t19`'s engine contract missing the new `_posTradW` key. All re-gated or extended, each with
   its reason, before the counted run.

**Provenance.** Source `6ff3561e3dd23d50b5fce16ad8c76704` · built `index.html` `b51ca85f4caf683326c77c2e70143a4c` (vite 5.4.21, `npm ci`; the immediately-prior v6.27 rebuilt byte-identically to
`deac8c16…`) · `smoke_built` 22/22.

## v6.27 — the Grade tab reports the model's grading, not actions (F-22)

**A presentation release.** No figure, engine, grade or stored field changes, and METHODOLOGY is unchanged. The scope is
`docs/SCOPE_F22_GRADE_FINDINGS_V627.md` (repo-only, fulfilled). Steve, *"go F-22"*; then all five decisions as recommended: DG-1 (a) *"Remove
it"*, DG-2 (a) *"Label them, keep"*, DG-3 (a) *"Fix all now"*, DG-4 (a) and DG-5 (a) *"Both as recommended"*. Built on v6.26 (source `6173cbba…`).

**What was wrong (v6.26, rendered in jsdom from the packaged bundle).** The Grade tab's *"PATH TO {grade} — RECOMMENDED ACTIONS"* printed
directives, and none of its numbers was something the model computes:
- *"Secure hybrid LTC insurance policy for both spouses"* (+0.20) on any plan without an LTC expense row, single plans included. The LTC grade
  is a literal C+, so no policy could move it, and an LTC premium row can in fact *lower* the grade: more spending, less sequence protection
  (the couple fixture, 2.99 → 2.94).
- *"Execute Roth conversion ladder … (fill 22% bracket each year)"* (+0.05) on every plan, against a Tax Efficiency grade that is a literal B+.
- *"Complete N survivor-critical estate items … toward an A"* (+0.10). Rendered with the example's seven items done, the real lift is
  **+0.21** (3.17 → 3.38), and Estate Readiness reaches **B**, not A. By hand: 2.0 × 8 / 78 = 0.205.
- *"Projected MC success"* was the current rate plus 3–5 points, never simulated. On the example it read *"~95–97%, From 100%"*, an
  "improvement" below the current figure.
- *"Remaining risk to A"* described a grade no ladder on the tab can award.

The category text stated things false for most plans:
- *"Hybrid LTC insurance active"* on every plan, for which the app has no field. v6.11 removed the same claim from Ranking, and v6.26 from Ask AI.
- The LTC and Monte Carlo drags blamed *"Monte Carlo failures"* on an LTC shock. The tab's success rate is the 6-year `runMonteCarlo`, which
  carries no LTC event; only the 30-year engine and the Stress tests read the LTC constants (parser census).
- *"Roth conversion plan: 2029–2040"* whatever the slider.
- *"Conversion plan is well-designed"*.
- The example household's *"International intentionally reduced … will revert when conditions warrant"*.
- An invented *"dining frequency"* range.
- An unsourced *"better than most advisor-managed portfolios"*.
- *"for both spouses"* to single plans.

Three grades are literals: LTC C+, Tax Efficiency B+ and Diversification B+, 20 of 78 weight points. Guardrail Readiness counts only rows
labelled exactly *"golf"* and *"Amazon"*. Together they cap **every plan at B+** (277.5 / 78 = 3.56), and the tab said none of it. The Field
Manual's Grade entry described *"a radar chart"* (none exists), listed "portfolio size" (not a category) and omitted three real categories.
**Wider than registered.** F-22 named two directives; the scope's census, rendering and independent review found the rest.

**What changed.**
- **The panel is gone** (DG-1): the actions, Current → Projected, the GPA lift, *Projected MC success* and *Remaining risk to A*, and the
  code behind them (`improvements`, `gpaLift`, `projectedGPA`, `projGrade`, `projColor`). *Top grade drags* stays, computed as before. The equity
  share stays as a fact, saying what is graded: *"The equity share is not graded on its own; Sequence Protection reads the cash-and-bond share."*
- **Labels** (DG-2). The three literal grades carry *"Fixed in this build — not computed from your plan"*, and Guardrail Readiness *"Graded from
  two fixed expense labels"*. The grade list and *Top grade drags* mark them † and ‡, with a footnote. Under the overall grade: *"Highest any plan can score here: B+"*.
  Weights and grades are unchanged.
- **Copy** (DG-3, no grade changes):
  - the LTC evidence says whether an LTC / long-term-care row is in the plan's expenses (the Stress tab's own test, `/ltc|long.?term/i`) and
    that the app has no policy field;
  - both drags say this rate's 6-year Monte Carlo carries no long-term-care event and the 30-year Monte Carlo and Stress tab model one,
    *"for each spouse"* only for a couple;
  - Tax Efficiency names the plan's own Roth slider from the selected retirement year (or *"no conversions modeled"* at $0) and drops the
    judgment;
  - Diversification drops the example's sentence;
  - Guardrail states its rule (a plan without the two labels grades B-) and drops the invented range and the stale *AMX* sentence (no such
    row exists);
  - Cost Structure drops the unsourced comparison and the share-class nudge;
  - Sequence Protection names hedge holdings only when there are some: through v6.26 every plan without them read *"Hedge holdings add $0K
    convexity"*, which now sat beside *"No hedge positions held"*.
- **The Field Manual's Grade entry** is rewritten to the tab as built (DG-4). §13 records the change, and the four version sites read v6.27.

**Found while building.** The example's own golf row is *"Golf (monthly)"*, which the anchored `/^golf$/i` does not match, so even on the
example only its *Amazon* row counts. The scope's *"the example's labels"* was half right; the shipped copy names the labels exactly.

**Filed, not fixed** (DG-5):
- UsabilityFlaws **F-23**: directive copy on other tabs, found by the scope's register sweep and its review. It covers the Withdrawal tab's
  Step 7 (which also contradicts that tab's own note on the Conv column), the Guardrails tab's *ACTION:* lines, three Exit Plan items, and the
  plan-events list's Roth instructions. Its scope starts with a full census.
- UsabilityFlaws **F-24**: the Grade tab's remaining copy, found by the build review. *Top grade drags*' *"Lost ~X GPA points"* divides by
  100 where the weights sum to 78, so every figure is understated by 22%; fixing it changes a displayed figure, so it is Steve's call. Also
  Income Floor's editorial wording and its omission of income streams, the Estate drag's unsourced legal claims, *"Strong base-case
  performance"*, and the LTC test matching a long-term-disability row.
- MissingFeatures **D-56** is widened: computing the literal grades, or dropping them from the weighting, is open.

**What it moved.** No figure and no grade. `t90` B-8 renders five plans on both builds under the same seed and finds every overall grade, GPA
and category grade equal. MC parity 10/10 with no intended difference; `t33` PINS for v6.27 equal v6.26's.

**Tests.** New suite **`t90`**, run on both legs. The v6.26 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-21, F-22]`.
`Math.random` is seeded before the bundle loads and re-seeded per plan (t11's trap).
- **§A, by AST, against the Grade render:**
  - none of the panel's identifiers or strings remains, and none of the false or example-only sentences;
  - the nine categories and their top GPAs are read from the source;
  - **extinction:** a category whose grade or GPA is a literal, or that can take only one GPA however it is written (a property, a spread or a
    declaration), must carry `fixed: true`, and only Guardrail Readiness carries `labelKeyed`;
  - the Roth line's $0 branch, and its years from `retireYear`;
  - the ceiling: each category's top GPA is read from the source, then put through the overall ladder, which `t90` restates.
- **§B, rendered on five plans** (the example; a couple, a single plan and the couple with an LTC row, each saved; and a plan below 90%
  success, gated so the Monte Carlo drag's branch actually renders):
  - no panel; the LTC evidence follows the row; no spouse for the single plan; no LTC blame;
  - the labels, footnote and ceiling, which must equal the source-derived one;
  - the equity sentence, the Roth slider line from the tab's own retirement year, the marks in *Top grade drags*, and no hedge sentence for a
    plan without hedges;
  - each overall GPA equals its nine rendered category GPAs weight-averaged;
  - the three literals render at their v6.26 values;
  - **B-8:** the v6.27 leg spawns the v6.26 leg with `--dump` and compares every plan's grades.
- **§C, the Field Manual:** no radar, every category named, the fixed grades, the label rule and the ceiling, and §13's entry first.

`t90` runs **46** current and **22** on the v6.26 leg.

**Existing suites:**
- `boundaries.mjs` gains two census rows (OPERATIONS §K1), both ON for the example:
  - `ltc_row`: the example carries an LTC row, so the no-row directive never showed on it;
  - `cut_rows`: it carries an *Amazon* row, so the $0 cut pool a plan without one shows cannot be seen on it (the grade is B- either way
    there).
- `t29` gains B-17, B-18 and two controls, each row clearing when its labels leave the table.
- `v627` is registered by an AST registrar: 175 gate extensions, 209 ladder entries, and an arm prepended to each of `t1`'s and `t4`'s version
  maps. None sat under `&&`, so none needed wrapping. `t33` PINS (unchanged) and `t45`, `t47` and `t48` are registered by hand. `vercensus`
  for v627 equals v626's (71 files, 177 gated, 1 keyed; 209 ladder, `t89`'s command-line default left at v626).
- **`t89` A-7 repaired** (a v6.26 suite). It compared the demo briefing with `../v625.jsx`, which only a v625 → v626 run folder holds, so it
  went red on **both** legs the moment the folder rolled to v626 → v627 (the first full run: 8,910 passed, 2 failed). It now pins v6.25's
  briefing md5, `0ace40a1…`, computed from commit `0859894`; v6.26's and v6.27's equal it. A parser search found no other suite that names a
  specific prior source file.
- No other assertion changes meaning: the census found no suite that reads the panel, its copy or the Grade entry. `t4`'s tab signature
  stands, and `t45` and `t48` render the new label and footnote at every width and in every skin.

**Counts**, from the full suite run from the packaged copies:
- **8,782 app checks across 89 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 32, `sets` 12 + 12;
- GRAND **8,912**.

Against v6.26, the current-leg changes are `t90`, new (46), and `t29` 91 → 97. On the prior leg `t89` reads 43 where it read 34,
because the prior leg is now v6.26, which carries the rules it pins.

**Controls.** `qa/tools/controls_v627_grade.py` (repo-only): **21 of 21 as expected**, each planting one defect back:
- the panel's identifier and header;
- the LTC policy sentence;
- the Monte Carlo drag's LTC blame;
- `fixed: true` removed from one literal grade, and `labelKeyed` from Guardrail;
- a category the Field Manual stops naming;
- *"both spouses"* for a single plan;
- the ceiling line removed;
- the radar chart back;
- §13's entry removed;
- a hidden +0.05 on the overall GPA;
- the conversion-plan claim back;
- a literal grade changed;
- the equity sentence pointing at *"the actions above"*;
- the Roth line's $0 branch reworded, or its years from the target year again;
- a grade hardcoded through a spread (the build review's mutant);
- *Top grade drags* losing its marks;
- the *"$0K convexity"* sentence back;
- the Field Manual's guardrail sentence hedged again;
- the unmutated run.

Every file was restored and hash-checked.

**Independent reviews.**
- **The scope** was reviewed before Steve saw it: no blocker; nine should-fix findings and six notes, all taken. Among them:
  - the suite census missed `t45` and `t48`;
  - the below-90% Monte Carlo drag was never rendered by any planned fixture;
  - a cross-leg grade comparison was unmeasurable without seeding;
  - an LTC row lowers the grade rather than merely failing to raise it;
  - the B+ ceiling;
  - OPERATIONS §K1's maintenance rule had not been applied;
  - more directive siblings existed (now F-23).
- **The build** was reviewed by an agent that had not seen it: no blocker; six should-fix findings and eight notes.
  - **Taken:**
    - the first build's equity sentence, *"Allocation is not graded"*, was false (Sequence Protection reads the cash-and-bond share);
    - *Top grade drags* showed the fixed LTC grade as the plan's weakness with no mark;
    - the Roth line's years came from the target, not the selected, retirement year;
    - `t90` A-6 could be dodged by a grade hardcoded through a spread — now A-6b, and control C16 is the review's mutant;
    - the $0 Roth branch was untested — A-9;
    - the guardrail's *"whenever a cut is needed"* (it always is), in the app and the Field Manual;
    - the *"$0K convexity"* sentence contradicting the new *"No hedge positions held"* (a note, taken because it was a contradiction on the
      same card);
    - this entry's wording on the ceiling, the LTC row and *"computed"*.
  - **Filed as F-24:** the understated *"Lost ~X GPA points"* and the remaining copy.
  - **What the review confirmed:** no grade can move (the grade and GPA expressions and `weightedGPA` are untouched, and B-8's dumps are
    equal on all five plans); the ceiling; the LTC shock figures and *"for each spouse"*; the 6-year engine and its $800K test; the anchored
    labels; the Field Manual's weights and grades; and that none of the old sentences renders.

⚠ **Owned.**
1. The scope's first draft said t4 is the only suite that renders the Grade tab. `t45` and `t48` do too. Found by the scope's review.
2. The first build's equity sentence, *"Allocation is not graded — the model takes it as held"*, replaced a directive with a false statement.
   Found by the build review.
3. **`t89` A-7, written at v6.26, could only pass in a v625 → v626 run folder.** It passed at its own ship and broke at the next, the
   prior-pinned shape OPERATIONS warns about. Found by this release's first full run, and repaired above.
4. The scope and the first build's copy called *"golf"* and *"Amazon"* *"the example's labels"*. The example's golf row does not match.
   Found while building, by reading the example's expense table; the copy names the labels exactly.

**Provenance.** Source `32b34771da6e55edc80a71519bbe01aa` · built `index.html` `deac8c16f4238d8b8519f656e5c646ff` (vite 5.4.21, `npm ci`; the immediately-prior v6.26 rebuilt byte-identically to
`23407af9…`) · `smoke_built` 22/22.

## v6.26 — Ask AI's ground rules reach every plan (D-55)

**Not a modelling release.** No figure, engine or stored field changes. METHODOLOGY changes in one place only: §11's list of what Ask AI
sends, which said *"nothing else"* and is now complete. The scope is `docs/SCOPE_D55_AI_GROUND_RULES_V626.md` (repo-only, fulfilled).
Steve, *"go D-55"*; then all six decisions as recommended: DC-1 (a) *"Every plan"*, DC-2 (a) *"No directives"*, DC-3 (a) *"Leave it, header
wins"*, DC-4 to DC-6 (a). Built on v6.25 (source `d7df32a9…`).

**What was wrong (v6.25, measured in Chromium on the built page).** Ask AI's system text was the plan's briefing plus a live context. The
only ground rules any request carried were the demo briefing's Section 1 (*"Educational Only … do NOT recommend target asset allocations or
specific securities"*). So the unsaved example had them (16,166 characters sent), and every other plan had none:
- the example after one Save & Apply (2,087 characters);
- Start Fresh, before a save (1,258) and after (1,912);
- the guided setup, and a backup with or without its own text.

The one guard left was a clause on the asset-mix line. That is wider than the register's wording, which named only plans saved from My Data.

Siblings in the same text:
- the live context's header said it *"supersedes Section 2 balances"*, a section only the demo has;
- it told every plan it held *"Hybrid LTC insurance per master prompt"*, which the app has no field for;
- it stated the pension's joint-and-survivor option as the plan's election, when it is the model's assumption;
- it sent a single household a spouse;
- it gave each retirement year's *"success"* without saying it means ending above $800K;
- it gave the Roth conversion years with no amount, so a plan at $0 was told it converts.

**What changed.**
- **A fixed ground-rules header** (`AI_GROUND_RULES`) goes first in the system text with every question, on every route: Anthropic with a
  key, claude.ai without one, and a Local Model. It says it takes precedence over what follows and that answers are educational only, with
  no financial directives. Results are to be described as *"the model's best cell"* and the decision left to the user. It also says the
  assistant is not an adviser, must use the figures given and invent none, and must say which year a tax figure applies to.
- It is added at send time and **stored nowhere** — not in the plan, a draft, the conversation or a backup. No saved data changes, and a
  backup cannot remove it.
- **The demo briefing is byte-identical** (DC-3). Its older *"Senior Portfolio Manager … fiduciary"* voice and its *"Run Section 6"*
  plan requests are overridden by the header's precedence line. On the example, such a request now comes back as trade-offs.
- **The live context** says *"supersedes any balances stated above"*. The LTC sentence is gone. The pension is *"(the model continues it
  in full to a survivor)"*, and a single household has no survivor clause. A single household is named alone, with no spouse B income. Each
  success rate reads *"success (ends above $800K)"*. The Roth line names the slider amount the results ran at, or says there are no
  conversions at $0.
- **Copy.** The Ask AI tab's *EXACTLY WHAT'S SENT* sentence names the ground rules. The Field Manual's master-prompt section names them, as
  instructions a model can still ignore. §10's table gains a row for them. The cost passage is re-measured (below), and §13 records the
  change. METHODOLOGY §11 lists everything Ask AI sends. The four version sites read v6.26.

**What it moved.** No figure: MC parity 10/10 with no intended difference, and `t33` PINS for v6.26 equal v6.25's. What one question
sends grew by the header's 1,263 characters. Measured as `t66` counts it (request characters ÷ 4):
| Plan | v6.25 | v6.26 |
|---|---|---|
| The example | ≈ 4,137 | ≈ 4,480 |
| A plan entered and saved | ≈ 564 | ≈ 907 |
| The same plan, unsaved | ≈ 350 | ≈ 691 |

So the Field Manual's *"roughly 1,000 to 5,000 tokens"* was already wrong at its lower end for every real plan. It now reads *"roughly 600
to 1,500 tokens for a plan you entered yourself, and about 4,500 for the example's longer sample briefing"*. The 1,500 upper end is a margin
for longer plans, not a measurement, and characters ÷ 4 is an estimate, not a tokenizer. The pinned *"about one to five cents"* still holds.

**Found and filed, not fixed:** UsabilityFlaws **F-22**. The Grade tab's *"PATH TO {grade} — RECOMMENDED ACTIONS"* tells the user to *"Secure
hybrid LTC insurance policy for both spouses"* (on any plan whose expense table names no LTC row) and to *"Execute Roth conversion ladder …
(fill 22% bracket each year)"* (on every plan). Those are the app's own directives, which Ask AI is now told not to give. It needs its own scope.

**Tests.** New suite **`t89`**, run on both legs. The v6.25 leg pins the absence and each sibling as dated `[KNOWN DEFECT 2026-10-21, D-55]`.
- **§A, by AST:**
  - the header is a module-level string;
  - `aiSystemPrompt`'s own return starts with it, and is the only place it is read;
  - exactly two model `fetch` calls exist, both sending `aiSystemPrompt`;
  - the header's wording;
  - the demo briefing equals v6.25's byte for byte.
- **§B, rendered — every way into a plan:** the example as loaded, after LOAD SAMPLE DATA, and saved; Start Fresh before and after a save; a
  stored plan with no prompt; a backup with its own text; a backup without one. In each, the rules come first, once, then the plan's text.
  The stored summary and an exported backup carry none, and v6.22's demo-text rule still holds.
- **§C, the request,** through a recording `fetch`: Anthropic with a key, and a follow-up (the conversation does not repeat the rules); a
  Local Model; the claude.ai route, in a child process.
- **§D:** the live context's lines.
- **§E:** the copy, and the cost passage against measured request sizes for a saved, a single, a blank and an unsaved plan, and the example.

`t89` runs **43** current and **34** on the v6.25 leg. It cannot show that a model obeys the rules; no live model is called.

**Existing suites:**
- `t85` D-7 compared the start of a Start Fresh preview with the demo's. With the rules first, that half would always pass. It now compares
  what follows the rules, and also requires the live context to follow.
- `t66` E-7 is gated: on v6.26 it holds the example's request to the new *"about 4,500"* (4,000–5,000), and `t89` E-6 holds the entered-plan
  range.
- `v626` is registered by the registrar (383 sites) and by hand: `t1` and `t4` get their own value-map arms, `t33` PINS (unchanged), and
  `t45`, `t47`, `t48`.

**Counts**, from the full suite run from the packaged copies:
- **8,693 app checks across 88 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 32, `sets` 12 + 12;
- GRAND **8,823**.

Against v6.25, no existing suite's current-leg count moved, `t66` and `t85` included. On the prior leg `t88` reads 19 where it read 15, because
the prior leg is now v6.25, which carries the column it pins.

**Controls.** `qa/tools/controls_v626_ai_rules.py` (repo-only): **19 of 19 as expected**, each planting one defect back:
- the rules dropped from the Anthropic request, or from a Local Model's;
- the rules sent twice, or written into the stored summary;
- the precedence line removed;
- the old *Section 2* header, the LTC sentence, the survivor option as fact, a spouse for a single household, a single household's pension
  given a survivor, the success threshold dropped, the Roth amount dropped;
- each disclosure removed (the Ask AI tab, the master-prompt section, §10's row, §13, the cost range, METHODOLOGY §11);
- the unmutated run.

Every file was restored and hash-checked.

**Independent reviews.**
- **The scope** was reviewed before Steve saw it: no blocker; ten findings, all taken. Among them were the Grade tab's directives (F-22), the
  example's directive sections, the cost passage's false lower end, two more `t66` pins and the weakened `t85` D-7, and the live context's
  stated facts (DC-6).
- **The build** was reviewed by an agent that had not seen it: no blocker; three should-fix and five notes, all taken or recorded:
  - the Field Manual stated what the model *does*, where it can only say what the model is *told* — reworded;
  - a single household's pension still had a survivor — removed, pinned (D-4) and controlled (C16);
  - the live context's *"success="* and Roth line stated figures without their meaning — fixed (D-6, D-7, C17, C18);
  - `t89` B-9 could pass with no preview, and A-7 with no v6.25 source — both tightened;
  - the controls lacked two disclosures — added (C14, C15);
  - METHODOLOGY §11's *"nothing else"* still omitted the conversation and the briefing's other forms — rewritten;
  - the ÷ 4 token figure is unverified against a tokenizer — recorded above.

  Two checks the review named still have no control of their own: `t89` D-5 (a couple named as two) and E-7 (the example's cost figure).
- **What the review confirmed:** the two senders and nothing else; that the header is stored nowhere; that the preview equals what is sent,
  byte for byte, on three plans; that the single flag cannot go stale after a save; the four version sites; and that every other `qa/`
  change is version registration.

⚠ **Owned.**
1. The scope's first draft said a no-directives rule is *"the rule the app already follows"*. The Grade tab does not follow it (F-22). Found
   by the scope's review.
2. The first build's Field Manual sentence said the assistant *is* educational and *is not* an adviser — claims about a model's behaviour
   that no test can make. Found by the build's review.

**Provenance.** Source `6173cbbacee22df0896fd41351ce1314` · built `index.html` `23407af94f3b82197e7ddf1f09840264` (vite 5.4.21, `npm ci`; the immediately-prior v6.25 rebuilt byte-identically to
`a5d234fe…`) · `smoke_built` 22/22.

## v6.25 — My Data's holdings table gives plan type its own column (F-21)

**A PRESENTATION release.** No figure, engine or stored field changes, so METHODOLOGY does not change. The scope is
`docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md` (repo-only, fulfilled). Steve, with a screenshot of My Data: *"under the My data tab in the
retirement, the fields don't line up (or it confusing what ticker the tax type belongs to. They don't line up"*; then DC-1 (a) *"Own
column"*. Built on v6.24 (source `2ff32ac0…`).

**What was wrong (v6.24, measured in Chromium on the built page at 1440 px).** My Data's *Retirement holdings* table had eleven columns.
Its Tax type cell held two dropdowns stacked: the tax type and, for a row with Traditional dollars, the plan type (added at v5.91). The
second had no column header, and rows had no divider. The spacing between a row's two dropdowns was about the spacing between rows (32 and
34 CSS px, top to top), so the plan type read as the next ticker's.

A sibling in the same table, found measuring it: the footer's *Total annual fees →* spanned nine columns where eight stood before
*$/yr fee*. So the fee total ($652 on the example) sat under *Contrib split %*, the contribution total under the delete column, and a
fourth footer cell ran past the table's last column (to x = 1403 against a header ending at 1097). It had been so since the footer was
written.

**What changed.**
- **A *Plan type* column** after *Tax type*, headed, with the plan-type help as its tooltip. It holds the plan-type dropdown for a row with
  Traditional dollars and a dash for a Roth row. The dropdown's label, options, value and handler are unchanged; only its cell moved.
- **One control per cell**, and **a divider under each row**. Rows are one line high: 66–67 px → 35–36 px in Chromium.
- **The footer's span stays nine**, which with the new column is the nine columns before *$/yr fee*: each total sits under its own column.
- The table's minimum width grows by the new column (880 → 1000 px); on a narrow screen it already scrolls inside its own box.
- **Field Manual §13** records the change. **The four version sites** read v6.25.

**What it moved.** No figure. `t2` parity 10/10 with no intended difference; `t33` PINS for v6.25 equal v6.24's, confirmed by running.

**Tests.** New suite **`t88`**, run on both legs, by structure (jsdom does no layout):
- **§A, on the example:** a *Plan type* column after *Tax type*; every row as many cells as the header; no cell with more than one control;
  the plan-type dropdown in its column on every row; a divider under each row; the footer's label spanning exactly the columns before
  *$/yr fee*, each total under its own column, and the footer as wide as the header.
- **§B:** a row switched to Roth has no dropdown and shows a dash; switched back to Traditional, its dropdown returns in its column with the
  plan type it had. A plan type chosen in the new column is stored by Save & Apply and shown on return.
- **§E:** the Field Manual sentence, read by AST.

`t88` runs **19** current and **15** on the v6.24 leg, which pins the stacked cell, the missing header and the footer one column too wide
as dated `[KNOWN DEFECT 2026-10-21, F-21]` checks. Row heights are a layout fact: measured in Chromium at the build (scope §6).

**Counts**, from the full suite run from the packaged copies:
- **8,612 app checks across 87 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 32, `sets` 12 + 12;
- GRAND **8,742**.

**Existing suites.** `v625` is registered by the registrar (381 sites) and by hand: `t1` and `t4` get their own value-map arms, `t33` PINS
(unchanged), and `t45`, `t47`, `t48`. No existing suite's current-leg count moved. On the prior leg `t87` reads 73 where it read 43, because the prior leg is now
v6.24, which carries the fix it pins. Every suite that touches a holdings dropdown finds it by its
options or its label, never by position (the scope's census).

**Controls.** `qa/tools/controls_v625_columns.py` (repo-only): **8 of 8 as expected**, each planting one defect back — the dropdown back
under the tax type, the header removed, the footer one column too wide, no divider, the Roth cell empty, the handler dropped, the Field
Manual sentence removed — and the unmutated run. Every file was restored and hash-checked.

**Independent review.** The build was reviewed by an agent that had not seen it: no blocker; three should-fix and three notes, all taken
(scope §7). Two were tests: nothing checked a Roth row made Traditional again (now `B-00`/`B-2b`; control C6 fires it), and the v6.24 leg
did not pin the footer's extra column (now `A-7`). The rest were the scope's wording. The review confirmed by parser and in Chromium the cell
counts on both builds and both branches, each total's column, the unchanged dropdown, that nothing else in the app or Field Manual says
where the dropdown sits, the four version sites, and that every other `qa/` change is version registration.

⚠ **Owned.** The scope's first draft said the v6.24 table had twelve columns; it had eleven. Found by the review.

**Provenance.** Source `d7df32a9a3091fc550eb1a56646c4270` · built `index.html` `a5d234feb1be2a58c584a72e14acd348` (vite 5.4.21, `npm ci`;
the immediately-prior v6.24 rebuilt byte-identically to `8663f198…`) · `smoke_built` 22/22.

## v6.24 — My Data keeps each expense row's months (D-52); the leave dialog's save saves (D-59)

**A MODELLING release.** METHODOLOGY gains *My Data keeps each expense row's months (v6.24)*; its v6.21 D-52 bullet is closed and corrected.
The scope is `docs/SCOPE_D52_EXPENSE_MONTHS_V624.md` (repo-only, fulfilled). Steve, *"Let's do D-52."*, then all five decisions as
recommended: DC-1 (a) *"Show them"*, DC-2 (a) *"Split at retirement"*, DC-3 (a) *"Split + end at horizon"*, DC-4 (c) and DC-5 (a). On
D-59, found at the build: *"Fix it in v6.24"*. Built on v6.23 (source `a683637e…`).

**What was wrong (v6.23, measured by driving the real Save & Apply).** Every engine reads the expense table to the month. My Data's editor
read each row's year only. `buildExpenses` wrote a monthly row back as January–December and a one-time row as June. It did this on every
Save & Apply, every draft and every Export Backup, edited or not.

One unedited save of the example re-dated 31 of its 35 rows:
- 2029 paid for both homes all year: table spending $126,280 → $157,720 (2028 $81,300 → $85,800, 2034 $93,040 → $96,240).
- With the portfolio held fixed, the Withdrawal tab's end balance fell $89,825.
- The post-retirement monthly figure rose from $8,170 to $10,810.

A guided-setup table saved in My Data doubled its retirement-year spending ($81,000 → $162,000). The loss cannot be undone: a second save
changes nothing more, and no exported backup keeps the months. The save also dropped each row's notes.

Two siblings:
- the editor's *Before retirement* default ran through December of the retirement year, but the model retires on 1 January;
- the guided setup split its rows at June/July and stopped spending in 2079 (D-54).

**What changed.**
- **The editor shows and keeps months (DC-1 (a)).** A month selector sits beside each year, one for a one-time row. A row opens with its
  stored months and is written back with them. Every other field passes through, notes and unknown fields included. An unedited save,
  draft or export stores each well-formed row as it loaded: an unedited date is written back verbatim (`"2029"` and `"2026-03-15"`
  included), and an unedited numeric amount keeps its cents. METHODOLOGY lists what is still normalised. One item applies to well-formed
  rows too: a one-time row's phase follows its date (no engine reads it). A text amount becomes a number.
- **The defaults split at the retirement date (DC-2 (a)).** *Before retirement* ends in December of the year before the retirement year;
  *After retirement* starts in January of it. Both read the editor's live retirement-year field.
- **The guided setup (DC-3 (a))** splits at the retirement date and runs its second row to the plan's horizon. A plan retiring this year
  gets one row. D-54 is closed for new wizard plans.
- **Plans already saved (DC-4 (c))** keep their re-dated rows. The editor's footnote now always carries a line telling a plan saved before
  v6.24 to check its months. Older guided-setup plans are told they still split at June and stop in 2079, there and in Field Manual §13.
- **A half-typed retirement year** (outside 1900–2200) no longer drives the *When* defaults; the saved plan's year does.
- **Amounts (DC-5 (a))** typed or converted in the editor are whole dollars a month, as before, and the footnote says so. The footnote
  also says where a one-time cost is charged: the Monte Carlo in its quarter, the year-by-year tabs in its year.
- **The Field Manual's** My Data table says what is kept, and §13 records the change.
- **The four version sites** read v6.24.

**D-59 — found at the build, fixed (Steve's decision).** The unsaved-edits dialog's **SAVE & APPLY, THEN LEAVE** saved nothing from v5.9.2
to v6.23. It switched tabs, then called the editor's save 40 ms later. By then the editor had unmounted and unregistered the save. Confirmed
in Chromium on the live v6.23 page: the tab's own Save & Apply stored an edit; the dialog's button stored nothing, and the dashboard kept the
old plan. The button now saves in its own handler, after setting the remembered tab to the target. The Field Manual §13 says so.

**What it moved.** **The example as it loads: no figure.** No engine changed: `t2` parity 10/10 with no intended difference, and the
Withdrawal tab is byte-identical in `domdiff`. An unedited save now stores the table exactly as loaded (`t87` A-1, A-8). §B restates that
at the engine level, with the portfolio held fixed. On the example and the wizard table it compares, bit for bit:
- `tableYearExpense` for 2026–2075;
- Engine D's schedule;
- the Monte Carlo's tax schedule;
- both seeded Monte Carlo engines;
- the headline monthly figures and the *after the payments end* figure.

A row added from v6.24 with *Before retirement* costs twelve months less in the retirement year — they were a double count, so this is
optimistic only against v6.23. A wizard plan built from v6.24 moves by six months of its pre/post difference in the retirement year, either
way, and it spends after 2079, which is conservative.

**Found and filed, not fixed:** MissingFeatures **D-58**. An unedited Save & Apply also stores spouse A's pre-tax contribution from the
per-paycheck fields; the example's $2,500 a month becomes $0. This is conservative, and disclosed since v5.10. **D-56** is extended: a blank
year falls back to today's year. OPERATIONS **§C4** gains two traps: an unedited save is not a no-op on the portfolio, and a DOM remount does
not reset the plan.

**Tests.** New suite **`t87`**, run on both legs. The v6.23 leg pins each defect as a dated `[KNOWN DEFECT]`; D-59 has its own tag.
- **§A, the round trip**, through the real controls:
  - on the example: Save & Apply and a second save, Export Backup, the draft autosave, and the draft's restore;
  - on every fixture household: Save & Apply;
  - the v6.21 car rows: their dates;
  - a backup with cents, notes and an unknown field: Save & Apply and the leave dialog's save, which also lands on the chosen tab;
  - the wizard's v6.23 table;
  - by name: the edge rows the editor normalises, and dates it cannot have written (`"2029"`, `"2029-4"`, a day, a text amount);
  - the stored Ask AI EXPENSES line.
- **§B, nothing moves.** The engines before and after an unedited save, as listed under *What it moved*.
- **§C, edits:** year and month edits, every *When* default, the live retirement year (and a half-typed one), a plan retiring this year,
  and the preview read by month.
- **§D, the guided setup** driven through its screens: the default, a horizon past 2079, single, and retiring this year.
- **§E, rendered and by AST:** the footnote (with its older-plan and older-wizard lines), the header, the selectors, the preview; no date
  template in `buildExpenses`; no year slice in the editor; the Field Manual and METHODOLOGY.

**Counts**, from the full suite run from the packaged copies:
- **8,548 app checks across 86 app suites, 0 failed, 0 DIED**;
- MC parity 10/10, with no intended difference;
- tooling: `t21` 64, `domdiff` 32, `sets` 12 + 12;
- GRAND **8,678**.

`t87` runs **73** current and **43** on the v6.23 leg. It ends with `A-9c`/`A-9d`, which pin the leave handler's order by AST.

**Existing suites.** `v624` is registered by the registrar (378 sites) and by hand: `t1` and `t4` get their own value-map arms, `t33` PINS
(unchanged, confirmed by running), and `t45`, `t47`, `t48`. `t84` G-11 flips from its June pin to March, as the scope said it would. Nothing
else moved:
- the ten suites that press Save & Apply are green with unchanged counts;
- the layout suites `t45` (390 px) and `t48` (24 px targets) are green on the new selectors;
- `t86` runs 44 on both legs, down from 58: its v6.22 → v6.23 pair sections take their designed, printed skip in a v6.23 → v6.24 run folder;
- `domdiff` runs 32, down from 35: its v622 → v623 mask arm no longer applies.

**Controls.** `qa/tools/controls_v624_months.py` (repo-only): **26 of 26 as expected**, each planting one defect back:
- the January–December write, the June write, a year-only load;
- the selectors hidden, the pass-through removed;
- each old default and each old wizard boundary;
- Export Backup, the draft and its restore through the old builder;
- an unedited amount rounded, a text amount kept, a stored date losing its year, verbatim dates removed, a half-typed retirement year;
- the preview by whole year;
- each new disclosure sentence removed;
- the leave dialog's old timer, and the remembered tab not set;
- the unmutated run.

Every file was restored and hash-checked. One control (C17) was MISSED on the first full run; that is owned item 3.

**Independent reviews.** The scope was reviewed before Steve saw it: 13 findings, all taken. Among them was the portfolio move
behind D-58, so §B holds the portfolio fixed.

The build was reviewed by an agent that had not seen it: 15 findings, no blocker, all taken or recorded (scope §7). Three were code:
- a stored date with no two-digit month (`"2029"`, `"2029-4"`) lost its year on save — now every unedited date is written back verbatim;
- a text amount was kept as text — now saved as the number;
- a half-typed retirement year drove the defaults.

The rest:
- one test (A-4b) could not see a re-dating, and control C1 reported it MISSED — it now compares with the table as loaded;
- older wizard plans were said to be disclosed and were not — now they are;
- the draft's restore and the month-aware preview were untested — now tested;
- four undocumented normalisations — two removed, two stated;
- the docs' coverage claims were reworded to what runs;
- copy and cosmetics.

Two items are recorded, not fixed: the wizard with a cleared retirement year (with D-56), and the leave path if a save were rejected
(D-59's residual, unreachable in practice).

The review confirmed by parser:
- the three `buildExpenses` callers;
- that no remaining path builds a date from the year alone;
- the sibling census (0 deferred reads of an unregistered channel on v6.24);
- the four version sites;
- the −$89,825, by its own re-dating against the v6.23 module.

⚠ **Owned.**
1. The scope's first draft said an unedited save "moves nothing". It also moves the portfolio (D-58); found by its review.
2. Three ships (v6.21, v6.22, v6.23) each added a `TESTING.md` per-suite line and moved none, so the page held six where it keeps three. The
   four oldest move to the archive now. The archive's manifest row had also stopped at v6.07's line; corrected.
3. The first D-59 fix saved and then landed back on My Data. `t87` passed it, because it checked only the stored table. A Chromium check of
   the built page found it. The harness cannot see it either (jsdom flushes the effect that records the tab), so A-9d pins the handler's
   order by AST, with control C17.

**Provenance.** Source `2ff32ac0792535e62510afe3d881b5fb` · built `index.html` `8663f198ed4ff2c8153fe3414be1a097` (vite 5.4.21, `npm ci`;
the immediately-prior v6.23 rebuilt byte-identically to `34455a91…`) · `smoke_built` 22/22.

## v6.23 — the built-in part-time work for spouse B is the example's alone (D-49)

**A MODELLING release** — METHODOLOGY gains *Built-in work is the example's alone (v6.23)*. `docs/SCOPE_D49_WORK_TAPER_V623.md` (repo-only,
fulfilled): Steve, *"yes"* (to scoping D-49), then DC-1 *"Example only"*, DC-2 *"Notice until saved"*, DC-3 *"Never"*, DC-4 *"Fix all now"* —
all (a). Built on v6.22 (source `88d476c3…`).

**What was wrong (v6.22, measured).** `spouseBWorkTaper` pays $20,000, $18,000 and $15,000 of spouse-B wages in the retirement year and the
two after, and its one test was *no income streams* — so every such plan was paid them: Start Fresh, the guided setup, a backup, and single
plans, which have no spouse B. Its comments said "EXAMPLE-DATA ONLY". The example's spouse B does work (its demo prompt says so); on any
other plan the wages were income nobody entered. The Withdrawal tab (Engine D) spent them as cash — optimistic: its end balance $89K–$164K
higher across four households and two presets. Engines A, B and C and the Roth tab's ladder taxed them (A and B with payroll tax), the
Monte Carlo (from v6.20) paid their tax without receiving them, and What-Breaks paid it through Engine A — conservative: about $7,000
(married) or $7,500 (single) of tax in the three wage years. On a single plan the Roth tab's best cell moved from *fill the 12% bracket*
to *no conversions*, a near-tie either way. **Siblings, same family:** the Withdrawal tab's Step 1 told every plan it takes "Spouse B work
income"; the Taxes tab named every job row, any owner, "spouse B's earned income"; MissingFeatures said Engines A–D "credit" the wages
(only D does); METHODOLOGY said streams reach What-Breaks (they reach neither it nor Backtest — D-57) and that the Roth ladder's
earned-income term is narrower than Engine C's (it is the same sum).

**What changed.**
- **The wages reach the example only (DC-1 (a)).** `builtinWorkApplies()` — no streams, married, the example's holdings (the rule v6.22 uses
  for the example's text) — is the taper's first statement; the six engine reads are unchanged. It is read on each call, not cached, because
  a load or `setPortfolio` replaces the plan (measured cost negligible).
- **A single plan gets none (DC-3 (a)),** the example made single included.
- **A plan saved before v6.23 that loses them is told so (DC-2 (a))** on My Data and the Monte Carlo tab, with how to enter work; the Monte
  Carlo's notice says what that tab lost — the tax on wages it never paid in. `workRowsV623: true`, written by the example, Start Fresh, the
  guided setup and Save & Apply, ends it; adding a job row in My Data's draft hides it at once. Nothing in the plan changes until it is saved.
- **The wording (DC-4 (a)):** the Taxes tab's line *Earned income (job rows)* (on the example *…and the example's built-in work*); the
  Withdrawal tab's Step 1 *other income (income streams)* (on the example *…and the example's built-in work*) and its Work-column note; My
  Data's streams note (which also no longer says streams reach every projection); the Field Manual's limitations entry, Monte Carlo entry,
  streams answer (Backtest and What Breaks named as the exceptions) and D-10 sentence; METHODOLOGY's streams paragraph, D-10 residual,
  payroll section and v6.20 bullet; the source comments; the four version sites.

**What it moved.** **The example: no figure** — all ten `t2` fingerprints byte-identical (parity 10/10, no intended difference
declared); every engine, the bridge, the tax schedule, the Roth strategies and both Monte Carlo engines bit-identical (`t86` §B); its
Withdrawal, Taxes and IRMAA tables figure-identical (`domdiff`, with the wording masked). Its wording changes on the Withdrawal tab, the
Taxes tab, My Data and in the Field Manual. **Every other plan with no streams** loses the wages, exactly as v6.22 with a $0 stream
(`t86` §C, every engine bit for bit): the Withdrawal tab's end balance falls, tax in the wage years falls, the Monte Carlo rises slightly.

**Found and filed, not fixed:** MissingFeatures **D-57** — Backtest and What-Breaks credit no income stream (conservative). **D-49**'s
residual, now the example's alone: its wages are built in, the Monte Carlo pays their tax without crediting them, and the Income tab holds a
stream's first-month amount for a whole phase. UsabilityFlaws **F-20** — the Income tab's stream list scrolls sideways at 390 px for a plan
with streams (`t45` runs on the example, which has none). OPERATIONS **§C4** — `t2` and `t6` write `/tmp` files keyed by tag alone, so two
full suites at once corrupt parity (seen at the scope: 10/10 reported where 3/10 was true).

**Tests.** New suite **`t86`** — **58** on v6.23, **25** on v6.22 (that leg pins each defect as a dated `[KNOWN DEFECT]`). §A who is paid,
by execution and AST (the rule's three tests; the taper's only gate; six call sites; the marker's four writers, each named; the loader's
flag). §B the example across the pair at two presets and three sliders, both Monte Carlo engines seeded. §C seven other plans on v6.23 equal
v6.22 with a $0 stream. §D single plans. §F the fixture households, married and single. §E rendered: the notices (Start Fresh, single,
ended by a draft job row and by Save & Apply, absent on the example, Start Fresh and a plan with a stream), the Roth ladder's MAGI (the
sixth read, which only a render reaches), every wording site. §G the Field Manual and METHODOLOGY.
**Existing suites, each change attributed.** ⚠ Five fixtures ran on the taper without saying so — an empty `incomeStreams: []` switched it
ON — and moved when it stopped reaching them. The married ones **declare the wages they ran on** as job rows (`qa/tools/example_work_rows.mjs`,
v6.22's DC-6 precedent), so every figure stays on both legs: `t20` (E2's exact $724,266), `t40` §C (its C0 residual now reads Engine D's
`workAll_y`, where rows land), `t71`'s IRA households (D-1 to D-3). The single ones are **re-pinned**: `t16` case 2 — the single filer's
tax is now compared with married figures on the same MAGI (2029: $6.6K shown against $4.4K; it was `> $9K`, a figure that carried the
wages); `t43` F-3 / F-4, controls that move once — 2030 $81,701.22 → $78,594.39 and 2039 $104,896.41 → $104,055.33 (and on each
attribution table), each equal to v6.22's with a $0 stream on all three tables, every Engine C row. `t83` I-8 and `t84` H-2 read the new
Field Manual sentences on v6.23. `t29` gains the `example_work` census row (OPERATIONS §K1: on the example the wages are its own, so a leak
could not be seen there; 88 → 91), and its payroll row reads the app's own taper — exported on both legs, so **the v6.22 leg's payroll row
now reads that leg's own rule too** (single plans included; the structural copy it replaces left them out; both legs green).
`domdiff` gains a v622 → v623 arm (Step 1, the Work-column note and the Taxes label masked, each exactly once; every figure identical).
`t33` PINS gains `v623` (unchanged, confirmed by running).
Controls `qa/tools/controls_v623_work.py` (repo-only): **27 of 27 as expected** — the rule without its holdings or single test, the taper on v6.22's
test, the loader's flag never set, ignoring the marker or read from the example, either notice never shown or shown on the example, the
notice kept after a draft job row, the old Monte Carlo wording, the marker missing from each of its four writers, each old wording back, and
the unmutated run; every file restored and hash-checked.

**Independent reviews.** The scope was reviewed before Steve saw it (18 findings, all taken — among them the recommendation's change from
visible rows to the example only, after the review showed the rows moving the example's Income tab and its phone layout). The build was
reviewed by an agent that had not seen it (12 findings, no blocker, all taken): the Monte Carlo notice said that tab lost work income when it
only ever paid the tax; METHODOLOGY stated a prototype's "26 tabs identical" as the release's and carried the scope's wrong range; the D-10
correction left "the last two terms" and a stale heading; four wording sites the scope missed (the streams answer, My Data's streams note, the
Work-column note, Step 1 omitting the example's own work); `t86` reached neither the ladder nor each marker writer by name; the My Data
notice outlived a draft job row; and smaller items. It confirmed by parser the six reads and the one gate, the four version sites, the Field
Manual's changed sentences, and every save, load and Export path.

⚠ **Owned.** (1) The scope's summary range for the Withdrawal tab, $94K–$163K, was wrong; its own table gives $89K–$164K (corrected in the
scope's §7 and METHODOLOGY). (2) The first build's Monte Carlo notice told a plan its Monte Carlo figures had lost work income; they had only
lost a tax, and rise. (3) The scope measured two prototypes' suites in parallel, and parity read the other's fingerprint (10/10 reported,
3/10 true); re-run alone, and now a rule (§C4).

**Registered:** `v623` by AST (370 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand.
`runsuite.sh` runs `t86` on both legs.

**Suite, run from the packaged copies:** **8,427 app checks across 85 app suites** (the eight `-spend617` and seven `-table620` attribution runs included), 0 failed, 0 DIED; MC parity 10/10 (no intended difference); tooling `t21` 64, `domdiff` 35, `sets` 12 + 12; **GRAND 8,560**. Per-suite counts are `TESTING.md`'s v6.23 line; against v6.22's line the counts that moved are `t29` 88 → 91 (the `example_work` row), `t85` 53 → 50 (its §C, the v6.21 → v6.22 pair, takes its designed skip in a run folder without the v6.21 source, as `t84`'s did at v6.22) and `t86` is new (58; 25 on the v6.22 leg); every other current-leg count is unchanged — the five moved fixtures keep their counts. `domdiff` 32 → 35 (the v622 → v623 arm's three mask checks).

**Limitations, disclosed** (METHODOLOGY *Simplifications, stated*; Field Manual): the example is recognised by its holdings; the example's
wages are still built in and not credited by the Monte Carlo, the Income tab, Backtest or What-Breaks (D-49's residual); D-57.

**Provenance.** v6.23 · source `a683637e75ce6816cd9a077644534542` · built `index.html` `34455a918eb2c65bb2d34841fcedafbf` · `smoke_built` 22/22. Suite run from the packaged copies (`mk_runfolder.sh v622 v623` on a fresh clone of `c870873` with the package applied): 8,427 app checks across 85 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 35, `sets` 12 + 12 — GRAND 8,560. Controls 27 of 27 on a copy of a run folder built from the workspace, whose files equal the package's byte for byte; every file restored and hash-checked.

## v6.22 — a new plan keeps no one else's facts: the example's master prompt, income and expense table (D-53)

**A MODELLING release** — METHODOLOGY gains *A plan's facts are its own (v6.22)*. `docs/SCOPE_D53_PROMPT_V622.md` (repo-only, fulfilled):
Steve, *"let's go with d-53"*, then DC-1 *"Facts + clear"*, DC-2 to DC-5 *"All as recommended"*, DC-6 *"Pay none, say so"*, DC-7 *"Refuse
the backup"* — all (a); DC-8, found by the build's review, *"Close it"* — (a). Built on v6.21 (source `f7802df1…`).

**What was wrong (v6.21, measured).** The register said a new plan with no state was taxed as the example's Florida. It was wider. The
example household's facts — both dates of birth, its plan-to ages (80, 87), its retirement year, Florida at 0%, its home ($450,000, a
$120,000 mortgage at 4.25%) — lived only in its master prompt, and every reader fell back to the master prompt: the plan timeline, My Data's
starting values, the Ranking tab's home and net worth, and Ask AI, whose system prompt begins with it. A load that brought no prompt kept the
one already held — the example's at the landing screen. So a Start Fresh plan was the example's household in every timeline fact and its
home; a guided-setup plan took its Florida (state step skipped) and its home; one Save & Apply stored them as the plan's own, and the state
name has no input to retype. The guided setup run from My Data, or a backup without a prompt, kept the previous plan's prompt the same way
(measured: an Oregon plan, then a blank load, read Oregon), and Start Fresh over an unreadable stored plan left its prompt key behind.
**Siblings, same mechanism:** a plan with no Social Security or pension figure was paid the example's $3,300, $1,300 and $400 a month, the
warning banner firing only while a prompt was held (so the fix above would have silenced it); a backup with no expense table kept the table
already held (the example's 35 rows at the landing screen).

**What changed.**
- **The example describes itself (DC-1 (a)).** `DEFAULT_PORTFOLIO` carries the ten facts as fields, each equal to what the app's own parsers
  read from the demo prompt (`t85` B-3 computes them live).
- **A load without a prompt holds none**, the example's own path holds the demo (set by the loader, not left to what was held), and
  storage keeps what memory keeps: the six plan-loading callers pass the loader's result, `""` deletes the key, an omitted argument leaves it.
  The name extraction and the Social Security parse read the loader's result too.
- **DC-8:** the example's own text arriving with holdings that are not the example's — a key v6.21 could leave in storage after *Load sample
  data* then the guided setup or an import, or an old backup — is not taken, and a stored key of that kind is dropped.
- **My Data names what is not entered (DC-2).** A placeholder date of birth or retirement year starts blank, and a notice says what the
  model uses meanwhile: born September 1963 / March 1966, retiring 2029, planning to 90 (the timeline's placeholders, not the example's).
- **No state, said plainly (DC-3)** on the Taxes tab (footnote and labels), the Roth tab's rules box and My Data's state control. No sentence
  points at a master prompt any more — the 0% footnote, the Roth header, the Survivor tab and Ask AI's preview were reworded.
- **The Field Manual (DC-4)** says what Ask AI is sent (§09), what the banner now means (§04), and what changed (§13). The finding that the
  demo prompt's ground rules reach only the example is filed as D-55.
- **A plan saved earlier with the example's facts is told so (DC-5)** in My Data — dates and plan-to ages, home, or Florida with no state
  chosen — when its holdings are not the example's. Nothing is changed.
- **Income a plan never entered is paid $0 (DC-6)**, named by the banner whether or not a prompt is held; a flagged block a past load stored
  is zeroed.
- **A backup with no expense table is refused (DC-7)** with a plain message; an empty table is accepted.

**What it moved.** **The example: nothing** — all ten `t2` fingerprints byte-identical (parity 10/10, no intended difference declared), the
Withdrawal tab byte-identical and the Taxes and IRMAA year-tables figure-identical (`domdiff`), its My Data, Ranking and Roth values
unchanged; the one change on its tabs is the 0% footnote's wording. A plan saved through My Data: nothing (it keeps what it stored; DC-5
names example facts). A Start Fresh or guided-setup plan from v6.21 or earlier never saved through My Data, on its next load: a Start Fresh
plan's dates of birth become the placeholders and its plan-to ages 90 / 90 (from 80 / 87 — a longer horizon, the conservative direction);
either loses Florida for no state (0% both ways); the Ranking tab's home becomes its flagged fallback. A plan missing an income figure (a
hand-made or old backup) is paid less.

**Found and filed, not fixed** (MissingFeatures): **D-55** — Ask AI's ground rules (*"Educational Only … do NOT recommend target asset
allocations or specific securities"*) reach only the example. **D-56** — example-valued defaults that remain: the as-of date when a plan has
none, Spouse B's claim age 63, the 2029 placeholder, the Roth tab's 5-year-rule lines. `ARCHITECTUREIssues.md` **E-32** — two dead load
paths (`handleReload` with `STATE_CARRYOVER`; the landing screen's file statuses).

**Tests.** New suite **`t85`** — **53** on v6.22, **48** on v6.21 (that leg pins each defect as a dated `[KNOWN DEFECT]`).
§A the loader: Start Fresh, both guided-setup routes, a backup without a prompt, a prompt cut at the cap, both example paths, a non-string
prompt, DC-8. §B by AST: the loader writes the prompt on every path, `saveToStorage` deletes for `""` and every plan-loading caller passes
`MASTER_PROMPT`, the ten fields equal the parsers' reading of the demo prompt (each parser asserted to match), no getter or insert reads the
example's income. §C the pair: the example's timeline, income and prompt the same at both. §D rendered: a first visit and Start Fresh (My
Data blank, the notice, Save & Apply storing none of the example's facts, a reload), the no-state wording on three tabs and a manual rate,
Ask AI's preview before any save, a stored Start Fresh plan reloading with placeholders, a pre-v6.22 example still whole (no migration), an
unreadable stored plan under Start Fresh and *Use example data*, the DC-5 notice, DC-8 from storage, the income banner, backups (a non-string
and an over-long prompt, no expense table, an empty one). §E income: blocks without amounts, absent, absent from the form, flagged and
stored, and the example.
**Existing suites.** `t37` A6-4 / A6-6: a non-string prompt is still rejected, and the plan then holds none (it was the previous plan's).
⚠ **`t20`** had declared `incomeSources: {}` since v5.37 and so ran on the example's inserted income without saying so; DC-6 made that $0,
and the fixture now states the same amounts — every `t20` figure unchanged on both legs. `t29` gains the `demo_prompt` census row (OPERATIONS
§K1: on the example the held prompt is its own, so a leak cannot be seen there; ON on both legs) and C-prompt-1; `t33` PINS gains `v622`
(unchanged, confirmed by running); `t84` G-3's name. `t84`'s §B/§C (the v6.20 → v6.21 pair) take their designed skip in a run folder without
the v6.20 source, as `t83`'s did at v6.21: 51 on both legs (63 → 51).
Controls `qa/tools/controls_v622_prompt.py` (repo-only): **24 of 24 as expected** — the loader's old rule, the example's path not setting the demo,
the key never deleted, Import storing the raw argument, a field drifting from the demo prompt, a parser defaulting again, My Data pre-filling
a placeholder, either notice never shown or shown on the example, each no-state sentence back, each income getter and insert back on the
example, flagged blocks not zeroed, the banner keyed on a prompt, a backup without expenses accepted, the guided setup's save omitting the
prompt, DC-8 off, and the unmutated run; every file restored and hash-checked.

**Independent reviews.** The scope was reviewed before Steve saw it (22 findings, recorded as 16 in its §6, all taken: the income banner DC-1 would have silenced,
the expense carry-over, the wording sites, the storage design, tests that could not have passed as written). The build was reviewed by an
agent that had not seen it (18 findings): it confirmed the loader, storage, fields, parsers, notices, income, the refusal, the Field Manual,
the four version sites and the registrar's tags, and found **DC-8** (asked and decided), the inserted Spouse B block's claim age moved
63 → 67 against the scope's own out-of-scope list (reverted), three more master-prompt sentences, and stale comments and names — all fixed.

⚠ **Owned.** (1) The scope's §0.9 said only an old backup could carry the demo text beside another plan; a stored key could, reachable in
the app at v6.21 — the build's review found it, and DC-8 closes it. (2) The first build changed the inserted Spouse B block's claim age, which
the scope had put out of scope; reverted. (3) `t85`'s first draft read the example after other plans in the same module, which the app never
does (the landing's *Use example data* is only reached on a fresh page), and its D-7 pin on the v6.21 leg was `true`; both fixed before the
run counted.

**Registered:** `v622` by AST (366 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand.
`runsuite.sh` runs `t85` on both legs.

**Suite, run from the packaged copies:** **8,339 app checks across 84 app suites** (the eight `-spend617` and seven `-table620` attribution runs included), 0 failed, 0 DIED; MC parity 10/10 (no intended difference); tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 8,469**. Per-suite counts are `TESTING.md`'s v6.22 line; against v6.21's line the counts that moved are `t29` 85 → 88 (the `demo_prompt` row), `t84` 63 → 51 (the designed skip above) and `t85` is new (53; 48 on the v6.21 leg); every other current-leg count is unchanged. `domdiff` 41 → 32: its v6.20 → v6.21 arm does not apply to this pair, and on v6.21 → v6.22 every compared table is identical.

**Limitations, disclosed** (METHODOLOGY *Simplifications, stated*; Field Manual): the placeholders remain the engines' values until a fact is
entered; the example is recognised by its holdings; D-55 and D-56 above.

**Provenance.** v6.22 · source `88d476c346ecb76bfe522487eb1b582e` · built `index.html` `5aaca5ba443a94faa4a8582ebd6d96b0` · `smoke_built` 22/22. Suite run from the packaged copies
(`mk_runfolder.sh v621 v622` on a clone with the package applied): 8,339 app checks across 84 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 — GRAND 8,469.
Controls 24 of 24 on a copy of that run folder, every file restored and hash-checked. `package_check` on the package, a fresh clone, the workspace and the live pool: every pre-upload check
green (J-1, J-2, K-4 and K-6 wait for the upload); against a simulated post-upload pool and a clone carrying the commit and the mode fix, green
except H-1 to H-3, which fetch the live repo. `package_check_controls` (pre-ship clone, simulated post-upload pool, the prior clone set, an ops
package for P15): 66 behaved as designed, 0 did not, 1 skipped (P58–P61 need a handover package).

## v6.21 — a car is an expense row; the plan's own "after the payments end" figure, Stress benchmark and state line (D-42, D-43, D-47, D-50)

**A MODELLING release** — METHODOLOGY gains *Cars are expense rows (v6.21)*. `docs/SCOPE_D42_CAR_V621.md` (repo-only, fulfilled): Steve,
*"D-42+D-43, add D-47/D-50 (Recommended)"*, then DC-1 *"Expense rows"*, DC-2 *"Add visible rows"*, DC-3 *"No car rows"*, DC-4 to DC-7 *"All
as recommended"* — all (a). Built on v6.20 (source `8db22499…`).

**What was wrong (v6.20, measured).** The 30-year Monte Carlo bought **every** plan a $40,000 car (today's dollars, grown with the path's
inflation) in the March quarter of retirement years 8, 16, 24 and 32 — `AUTO_REPLACE_COST`, switched on in run C (with and without LTC
shocks), run D, four of the seven stress runs and the mortgage what-if — whatever the plan's expense table said (D-42). It was not in the
planned path the guardrails steer by, so each car year pushed every path down against a line that did not move; the 6-year runs, three stress
runs and Engines A–D never saw it; a household that entered its cars as expenses paid twice where it did. The Field Manual called it "a fixed
example schedule". Six displays on the Income and Social Security tabs subtracted the example's $400 car payment from every plan's spending
("Post-car shortfall", "car paid off") (D-43). The Stress tab's 30-year table measured the median against `household × 1.04^years`, a
benchmark that ignores withdrawals, and marked the example's median LOW in most later years under the preset a first visit opens on (D-47).
The mortgage what-if told every plan its interest "isn't deductible for you (standard deduction + no FL income tax)", and the Roth tab's rules
box said "Florida — no state income tax" to every plan (D-50).

**What changed.**
- **A car is a one-time row in the expense table (DC-1 (a)).** The constant and the `autoReplace` option (sixteen sites) are deleted; every
  engine charges a car only if the table holds one — the Monte Carlo in its quarter, inflated, on the planned path too; Engine D, Backtest and
  What Breaks in its year; the Taxes, IRMAA and Roth tabs through Engine D's draws. The example's table gains four rows, *"Replacement car"*,
  $40,000, March 2037, 2045, 2053 and 2061 (its retirement years 8, 16, 24, 32). Start Fresh and the wizard add none (DC-3).
- **A plan saved before v6.21 keeps the old schedule as visible rows (DC-2 (a)).** Loaded with its table and without the new `carRowsV621`
  field, it gains *"Replacement car (added by v6.21 — the model's old fixed schedule)"* rows from its own retirement year, from its as-of
  month through the as-of year + 35, in a new array; nothing is written until Save & Apply, which stores the table and the field. My Data and
  the Monte Carlo tab say which rows were added, that they now count on every tab, and that deleting them is the user's call.
- **The "after the payments end" figure is read from the table (D-43, DC-4 (a)).** The monthly total the month after the last monthly row
  running at the "after spouse B's Medicare" month that ends before the plan's last year; labelled with the row's name ("after Car Payment
  ends") or "after N payments end"; left out when there is no such row or nothing is spent after them. On the example: $7,620 from May 2034 —
  v6.20's figure.
- **The Stress tab's *Planned* column is the engine's own planned path (D-47, DC-5 (a))**, with the guardrails' own bands in the headers.
- **No Florida sentence for every plan (D-50, DC-6 (a)).** The mortgage what-if states the model's rule (no itemized deductions, so no
  offset); the Roth tab's line names the plan's state as the Taxes tab does — a state chosen in My Data, or else the plan's named flat rate.
- **The Field Manual** (honest limits, the Monte Carlo entry) says cars are rows and what changed; its spouse-B taper sentence is corrected
  (DC-7: any income stream turns the taper off — D-49).
- **What it moved** (3,000 paths, the same seeds; success above $500K | above $800K | median end, run C's shape): the example under
  BULL-LEANING 95.3% → 95.1% · 91.0% → 90.6% · $2,112K → $2,048K; under BASE 85.0% → 84.5% · 74.4% → 73.9%. A plan with no car in its table
  reads higher than v6.20 read it (BASE 85.0% → 88.6% above $500K). The example's other tabs see a car for the first time: the Withdrawal tab
  spends $49,657 more in 2037 (40,000 × 1.0274^8), its 2053 balance is $268,904 lower, lifetime tax $1,993 higher; no IRMAA surcharge
  appears. The 6-year runs do not move (no car falls in them). Full table in METHODOLOGY.

**Found at the build and filed, not fixed** (each outside the scope; MissingFeatures):
- **D-52** — My Data's editor keeps a row's years only: Save & Apply stores a monthly row January–December and a one-time row in June, so the
  first save re-dates the added cars (March → June) and widens the example's Car Payment to January 2029 – December 2034. Pinned in `t84`
  G-11 as a dated `[KNOWN DEFECT]`.
- **D-53** — Start Fresh, and the wizard with the state skipped, keep the example's master prompt, so a new plan that chooses no state is
  taxed as Florida (0%) and its Taxes and Roth tabs say Florida. It narrows D-50's closure. The scope's §0 had read this and not run it; the
  build ran it.
- **D-54** — the wizard ends its living-expense row in December 2079; a plan whose horizon runs past 2079 spends nothing in its last years.

**Tests.** New suite **`t84`** — **63** on v6.21, **21** on v6.20 (that leg pins the old car, the $400, the 1.04 column and
the Florida sentences as dated `[KNOWN DEFECT]` checks). §A by AST: the constant and option are gone, the rows are data, nothing subtracts
$400, no `1.04` power, the Stress table reads `plannedPath` and `GUARDRAILS`, the marker written at exactly four sites. §B: v6.21 on the
example equals v6.20 run on the same table with its own car switched off — both Monte Carlo engines and Engine D, bit for bit — and the
planned path pays the car. §C, the attribution: on v6.20's table (the four rows removed) v6.21 reproduces v6.20's Engines A–D, the bridge
and the Monte Carlo tax schedule bit for bit on four households, and Engine D's 2037 spending moves by exactly 40,000 × 1.0274^8 — computed
by hand. §D, the migration: rows and dates (from the plan's own retirement year), the already-retired and February/late-as-of edges, a plan with
the field and a load without a table gaining nothing, duplicates, the table passed in untouched.
§E: the D-43 rule against an independent oracle on the example, a single plan, a later horizon and six edge tables. §F: the Stress
benchmark (under BULL-LEANING the old column marks the median low in ≥ 10 years, the engine's path in none). §G rendered: the Income, Social
Security, Roth, Monte Carlo and Stress tabs; Georgia and a named flat-rate state; an old plan's notices, Save & Apply, the notices gone.
§H: the Field Manual and METHODOLOGY.
**Re-pins, each attributed** — the suite's `<suite>-v621-table620` runs (`DC_V620_TABLE=1`: the example's table without its four car
rows) reproduce every v6.20 figure: `t40` (A1, the Engines B–D lifetime RMD, A5, the W row), `t42` D-2/D-3, `t43` F-4, `t58` B-NC, `t71`
D-2/D-3, `t72` A-3/B-2, `t81` E-5 (Backtest's 1966 start $1.43M → $1.21M) and E-8 (What Breaks 1.40× → 1.35×). `t11`, `t12`, `t19` and
`t20`, whose subject is not spending, run on v6.20's table; `qa/tools/v617_spending.mjs` marks the portfolios it loads so the migration
cannot add cars to v6.17's table (it did, at first, and `t20` caught it). `t81` C2-1 and `t83` E-5/E-6 read the example's 2029 rows and the
new engine options. **Parity:** `t2` `INTENDED_DIFFS` gains `"v620→v621": ["extMC", "stress"]`; the six-year `mc` and the seven non-Monte
Carlo keys identical. `domdiff` gains a v620 → v621 arm: on the Withdrawal tab every schedule row before 2037 is byte-identical and every
row from 2037 is masked on both sides (the masked rows must differ, 2037's among them), with the two summary figures and the footer's count of
expense lines (31 → 35) set aside exactly; on the Taxes and IRMAA tabs every row before 2037 is byte-identical and 2037's differs. `t29`
gains the `car_rows` census row. `t48` G-1 found the one-time list's category column clipping "Transportation" on the new rows: widened to
the monthly rows' 110 px.
Controls `qa/tools/controls_v621_car.py` (repo-only): **17 of 17 as expected** — a car of the model's own restored, the rows out of the planned path,
a row charged uninflated, the migration a year short / from the as-of year / appending to the table passed in / ignoring the field, either
notice never shown, the D-43 figure back on `− 400` or ignoring the horizon, the Stress column back on 1.04 or its bands typed, the Florida
sentence restored, Save & Apply not writing the field, the Roth line ignoring the plan's named state, and the unmutated run; every file
restored and hash-checked. Their first run found two checks blind to their defect — `t84` B-4 (the planned path's car could be missing
while the car's tax still moved the path) and A-7 (the *Planned* cell back on `1.04` while `_pp` stayed declared); both were strengthened
and the controls re-run.

**Independent review** before shipping, by an agent that had not seen the work. Confirmed the extinctions, the migration's edges and that no
new plan migrates, the engine identity, METHODOLOGY's figures, D-43, D-47 and the four version sites. **Fixed from its findings:** the Roth
line's Florida for new plans (filed as D-53, D-50 narrowed); the My Data notice claimed the added rows "keep this plan's figures where they
were" — they now move every tab, and it says so; a $0 "after the payments end" figure (D-54); "2 payments ends"; the new figure not
restored when a load is rejected; over-claiming check names; METHODOLOGY's IRMAA sentence ("does not move" → no surcharge appears), its list
of runs and its D-43 sentence; D-52 widened to monthly rows; two controls added.

⚠ **Owned.** (1) The scope's hand figure for the 2037 car, **$49,656**, was a truncation of $49,656.54 — **$49,657** to the dollar; the
scope's own review confirmed it without catching the rounding, and `t84` C-3's first draft pinned it. Found when C-3 failed on its first
run; the pin is now computed by hand from the rate and the years, and the scope and METHODOLOGY are corrected. (2) The scope's DC-6 wording
for a plan with no state chosen rested on an incomplete premise — the example chooses none either; its Florida comes from its master prompt
— and as written would have stopped the example's Roth line naming the state the model taxes it in. The build followed DC-6's intent (the
line says what the Taxes tab says) and records the change in the scope's §7. (3) `t84` §G's first draft read the stored plan after "Use
example data", which stores none; it now writes the plan from the live one.

**Registered:** `v621` by AST (352 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS (unchanged, confirmed by running) and the three
Python suites by hand; `t2` `INTENDED_DIFFS`. The shim exports `POST_PAYMENTS`, `postPaymentsWhat`, `postPaymentsEnd`, `CAR_SCHEDULE_V620`,
`GUARDRAILS` and, for the prior leg, `AUTO_REPLACE_COST` (guarded). `runsuite.sh` runs `t84` on both legs and the seven `-table620`
attribution runs.

**Suite, run from the packaged copies:** **8,214 app checks across 83 app suites** (the eight `-spend617` and seven `-table620` attribution
runs included), 0 failed, 0 DIED; MC parity 10/10 (`extMC` and `stress` intended); tooling `t21` 64, `domdiff` 41, `sets` 12 + 12;
**GRAND 8,353**. Per-suite counts are `TESTING.md`'s v6.21 line; against v6.20's line the counts that moved are `t29` 82 → 85 (the
`car_rows` census row), `t83` 95 → 62 (§H and §R, the v6.19 → v6.20 pair, take their designed skip in a run folder without the v6.19
source — as `t82` did at v6.20) and `t84` is new (63; 21 on the v6.20 leg); every other current-leg count is unchanged. The run was
repeated after the controls strengthened `t84` B-4 and A-7, with the same counts.

**Limitations, disclosed** (METHODOLOGY *Simplifications, stated*; Field Manual): rows sit on calendar dates and do not follow the
retirement-year buttons; Engine D inflates a row from the retirement year, the Monte Carlo from the as-of date, so the same row reads
differently in each; no car financing is modelled; D-52, D-53 and D-54 above.

**Provenance.** v6.21 · source `f7802df1f14f52b0c2ca59ca898b0e9a` · built `index.html` `bbd56368ab21aee1b95b55c4aec94af1` · `smoke_built` 22/22. Suite run from the packaged copies
(`mk_runfolder.sh v620 v621` on a clone with the package applied): 8,214 app checks across 83 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 41, `sets` 12 + 12 — GRAND 8,353.
`package_check` on the zip, a fresh clone, the workspace and the live pool: every pre-upload check green (J-1, J-2, K-4 and K-6 wait for
the upload); against a simulated post-upload pool and a clone carrying the commit, green except H-1 to H-3, which fetch the live repo.
`package_check_controls` (pre-ship clone, simulated post-upload pool, the prior clone set): 66 behaved as designed, 0 did not, 1 skipped
(P58–P61 need a handover package). Run against the clone carrying the commit, P17 does not fire — that clone already holds the file the
control removes, so the omission it plants cannot be seen there; it is a pre-upload control, and fires pre-upload.

## ops 2026-10-19 (second) — every qa/ file leaves project knowledge

**KIND: ops** — documents and tooling; **v6.20 stays current** (source `8db224990e86ddcbe2180f96b6a52889`, built `2a0b45ea9c1425752ff8918862e15202`).
No app source, suite logic or figure changes. The morning's trim left the meter at **1,816,951 of 2,000,000** (142 files); about half of it
was test and harness code that no session could run from the pool. `docs/SCOPE_UNPOOL_QA_CODE.md` (repo-only, now FULFILLED): Steve took
DC-1 to DC-4 as recommended, all (a) — every `qa/` file leaves, the hash table is archived, chat-only sessions accept losing the test files,
and it ships now, before v6.21.

**What changed.**
- **126 files leave the pool** — every pooled file under `qa/`: the 83 suites, `runsuite.sh`, `mk_runfolder.sh`, the harness and shim, the
  DOM entry, the fixtures, the oracles, the tools, `package_check` and its controls. 2,737,596 characters. **Pool 142 → 16**: the source,
  eleven documents and the four build-scaffold files. Each leaving file is declared `RETIRE:` in the package's manifest.
- **The manifest's test and harness hash table** moved verbatim to `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md` (repo-only); a new
  *Pooled file hashes* section keeps the ten pooled files' rows and the D-5 count block. Forty-five rows elsewhere that name a departing
  file are marked repo-only (K-12's vocabulary).
- **Every departing file's description** (118 hash-row descriptions: 83 suites, 35 harness and tool files) moved verbatim to `TESTING.md`,
  *Every suite and harness file* — see the correction below.
- **OPERATIONS:** §A2 (the suite comes from a full clone; the fallback table covers pooled files only), §G (*qa/ is repo-only*), §C4 (the
  traps and rules that lived only in suite comments), §L (`knowledge/` carries no `qa/` file), and the rotation notes (no dom entry is pooled).
- **`package_check`:** **B-4** fails a package that ships a `qa/` file to `knowledge/`; **J-6** fails a post-upload pool that still holds one
  (pre-ship, every one still there must be declared `RETIRE:`). A name is a qa file when every repo path with its basename lies under `qa/`,
  plus the dom-entry family and the two renamed pool names. J-4 (exactly one dom entry) is retired. K-12 reads *Pooled file hashes*. The OPEN
  allowlist entry for the scope is removed, as its own expiry note required.
- **`package_check_controls.sh`:** P76 and P77 (B-4 fires on a suite and on a dom entry in `knowledge/`), P78 (B-4 stays silent on
  `README.md`, `package.json` and `index.html`, which also exist outside `qa/`); P71 re-pointed from J-4 to J-6; P32 and P33 retargeted to
  the files that remain, and P43 to P32's derived row; P44/P45 and P72 retired, each printing its reason (no `.py` file and no renamed file
  can be pooled now).
  `controls_manifest_rows.py`: C2's target (it named `sel_census.cjs`) is derived from the pool.

**The trace (OPERATIONS §G, for code).** The author read the open-thread keyword hits in all 126 files; **six independent readers then read
every file in full** and checked each candidate against the sixteen documents that stay. Their findings: the traps and standing rules that
no pooled document carried (Social Security through `.planned`, not `.amount`; `setPortfolio` does not rebuild the timeline; jsdom has no
`location`; `t10`'s cent tolerance makes a rate a boolean; `runsuite.sh` never runs an unlisted suite; `t31`'s literal METHODOLOGY keys; and
more) are **OPERATIONS §C4**; ten open threads and a list of stale statements are **`ARCHITECTUREIssues.md` E-31** (among them two TY2026
state bracket schedules read from a draft and from preliminary rates, and an oracle frozen at v5.69's Rhode Island model); `TESTING.md`'s run note
saying `t11`–`t16` and `t22` take no argument — the code says otherwise — is corrected. The hash table's own prose was traced line by line.

⚠ **Owned — a false premise in the scope, caught before the build.** The scope's DC-3 (a) said `TESTING.md` "describes every suite". It
does not: its per-suite table stops at `t30`, and `t31`–`t83` were described only in the hash table DC-2 archives. An independent reader
found it; the build stopped and asked; Steve chose to move the descriptions to `TESTING.md` verbatim. The question quoted about 39,000
characters for the suites; with the 35 harness and tool rows (several carried rules nothing else held) it is about 53,000. The scope's §0
also called the hash table a "test-hash table" while it held ten pooled files' rows (and decision D-3, a rule still in force, now restated
beside them), and missed seven controls that drew targets from pooled qa files — six in `package_check_controls.sh` (P43 among them, found running the
controls) and C2 of `controls_manifest_rows.py`, which the package's independent review found failing; all were corrected before the package
was cut, and its §6 records them.

**Estimated effect:** about 2.75 million characters out of the pool, net — roughly 91% → 41–46% of the cap (the unit per character varies
with content; the figure after upload is read from the listing).

**Verified by:** results in the package's `MANIFEST.txt`.

## ops 2026-10-19 — project knowledge trimmed (the fourth time); a scope for un-pooling the test code

**KIND: ops** — documents and one tool line; **v6.20 stays current** (source `8db224990e86ddcbe2180f96b6a52889`, built `2a0b45ea9c1425752ff8918862e15202`).
No app source, suite or figure changes. The project-knowledge meter read **1,920,823 of 2,000,000** after v6.20 (142 files). Steve: *"Let's fix
the size of the project knowledge pool"*, then *"Archive now, scope the big move"*.

**The moves** — each verbatim into a **new** repo-only archive with a §0 trace, each reassembling the committed file byte for byte (OPERATIONS §G):
- **CHANGELOG:** v6.00–v6.15, with the four ops entries between them, to `docs/CHANGELOG_ARCHIVE_v6_00_to_v6_15.md`; the pooled file holds
  v6.16 onward. 155,350 bytes.
- **TESTING.md:** the per-release write-ups to v5.40 (51 paragraphs from its opening section) to `docs/TESTING_ARCHIVE_release_notes_to_v5_40.md`.
  42,574 bytes.
- **The manifest:** the superseded ship notes and delete-first lists from v6.19 back to v6.04 to `docs/MANIFEST_ARCHIVE_notes_and_lists_v6_04_to_v6_19.md`.
  74,225 bytes.
- **MissingFeatures.md:** the write-ups of the 28 items closed or fixed by v6.20 to `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`; each keeps
  its index row. 64,456 bytes. Selected by the index's status column — a first pass by heading would have taken D-37, D-39 and D-44, whose
  headings say "DISCLOSED" — and never an ID the register's "Open, in this file" line names: D-18 is FIXED but recurs every tax year, so its
  write-up stays. Both caught before anything was cut.

**The trace.** Every line in the text leaving that reads as open was read in context. **Eight threads had no other pooled record.** The
author's trace found one — `t38`'s storage check (I-6) that failed once under load at the v6.15 build, its suspected cause never confirmed —
re-homed in `TESTING.md`, *Known gate defects*. ⚠ **An independent second read found the other seven before the package was cut**, and they
are `ARCHITECTUREIssues.md` **E-30**: D-12's re-homed residuals; the checklist's 401(k)-to-IRA rollover tip against Rhode Island's modification;
**AI-6, which model Ask AI uses — Steve's decision, open since v6.02**; the household with no holdings, never examined; the Ranking tab's
"the crowd you actually belong to"; v5.38's sales' gain outside NIIT and the state module (not re-verified at v6.20); and `t14`'s presence
checks. The same read found the CHANGELOG archive without a real §0 trace (added), a premise in the scope below overstated (corrected), and
dangling "see the box at D-n" pointers (now naming the archive). Each archive's §0 records what went where.

**Estimated effect:** about 319,000 characters out of the pool, net (the moves take about 337,000 bytes; the pointers, E-30 and this entry add some back) — roughly 96% → 90.5% of the cap (the listing's unit is about 0.345 per
character on this pool; the figure after upload is read from the listing). That buys a few releases, no more: half the pool is test and
harness code.

**The big move, scoped:** `docs/SCOPE_UNPOOL_QA_CODE.md` (repo-only; **decisions open**, DC-1 to DC-4) — every `qa/` file repo-only, the pool
keeping the source, the documents and the build scaffold (~43% of the cap). No build can run from the pool already: `mk_runfolder.sh` needs the
repo's tree (`src/`, `qa/qa-baseline/`, `qa/tools/fixture/`), which the flat pool does not have. `package_check`'s OPEN allowlist gains the scope, with its expiry stated.

**Verified by:** results in the package's `MANIFEST.txt`.

## v6.20 — the Monte Carlo pays the Taxes tab's tax, and charges one-time expenses in the quarter they fall (D-40, D-44, D-45)

**A MODELLING release** — METHODOLOGY gains *The Monte Carlo pays the Taxes tab's tax (v6.20)*. `docs/SCOPE_D40_MC_TAX_V620.md` (repo-only,
fulfilled): Steve, *"let's do D-40, making the Monte Carlo pay the Taxes tab's tax. And fold in D-44 and D-45"*, then *"Let's continue with
your recommendations"* on its ten decisions — all (a), the first being to fix the quarter calendar first (v6.19). Built on v6.19's calendar.

**What was wrong (v6.19, measured).** The only income tax either Monte Carlo engine charged was a flat **$4,000 a quarter**
(`ROTH_TAX_DRAG_Q`), never inflated, through the Roth ladder's last year — whatever the plan converted or owed — and **nothing after it**, RMD
years included (D-40). On the example that is $192,000 nominal over 2029–2040 against the Taxes tab's $214,590 in today's dollars over
2029–2053; for a larger household it is far wider (the example's holdings ×1.6 in Georgia: $369K), and the conversion slider never reached
the Monte Carlo at all. The
Income tab showed it as "Roth conversion tax drag · ~$16K/yr · $4K/quarter modeled in MC sim". Both engines read the expense table at each
quarter's last month, so **a one-time row dated in any other month was never charged** (D-45 — the example's April 2029 golf cart and closing
costs, $28,000), one that was charged was charged in today's dollars beside inflated monthly rows (D-44, the Monte Carlo half), and a monthly
row starting or ending inside a quarter was counted for the whole quarter. **Optimistic for most plans.**

**What changed (DC-1 to DC-9, all (a)).**
- **One tax schedule** (`mcIncomeTaxSchedule`): the Taxes tab's `totalTax` — federal, capital gains, NIIT, AMT, payroll tax on job income and
  state — year by year, computed exactly as the Taxes tab computes it, at the **live conversion slider, QCD and dividend yield** (DC-1) and the
  selected preset. Both engines pay a quarter of each retirement year's tax, **grown with each path's inflation** (DC-3 — conservative: the
  parts from nominal RMDs and gains are grown twice), and the last row's tax past the schedule's end (DC-4). Nothing before retirement. The
  flat drag is deleted. IRMAA is not added (DC-2).
- **One quarter read** (`mcQuarterSeries`), built once per run: one-time rows summed over the quarter's months — charged once, in the quarter
  that contains their month, grown with inflation (D-45, D-44) — and monthly rows averaged over them, so a row counts only its own months
  (DC-6). A year's four quarters add up to `tableYearExpense`, the year Engine D, Backtest and What-Breaks spend.
- **Moving the slider, QCD or yield re-runs the 6-year runs** about 300 ms after the control settles, on any tab (the header shows "…"
  meanwhile); the 30-year runs, the stress set and the mortgage what-if re-run when their tabs are next opened. The engines take
  `opts.taxInputs` or a precomputed `opts.taxSchedule`; `runExtendedMC` returns its planned path.
- **What the user reads.** The Income tab's card is "Income tax the Monte Carlo pays" — the schedule's first year at the slider's value. The
  Monte Carlo tab and the Field Manual (Monte Carlo entry, dated v6.20) say what the tax is, that it is the same on every path, what it leaves
  out, and how one-time expenses are charged; the Withdrawal entry and Backtest's comparison say what the Monte Carlo does from v6.20.
  What-Breaks names the engine its tax estimate comes from (the Roth tab's strategy engine — it said "the Taxes engine"), no longer says it
  "does not model taxes", and no longer credits the Monte Carlo with IRMAA (DC-8). No in-app notice (DC-9).
- **It moved the Monte Carlo's figures, downward on every household measured** (v6.19 → v6.20, 3,000 paths, the same seeds; a 6-year
  success rate already near 100% can read the same): 30-year success
  above $500K under BULL-LEANING, the preset a first visit opens on, 0.7 to 4.0 points lower — the example 96.8% → 95.3%, median $2,299K →
  $2,118K; above $800K under BASE 1.9 to 8.9 points lower — the example 80.3% → 74.4%. The 6-year figures move least. The slider now matters:
  the example reads 94.9% at $0 and 94.3% at $150K. Engines A–D (the Withdrawal, Taxes, IRMAA and Roth tabs) do not move.
- **Faster:** each run reads the expense table once instead of once a quarter on every path — the three 6-year runs take 0.32× v6.19's time.

**Tests.** New suite **`t83`** — **95** on v6.20, **15** on v6.19 (that leg pins the old behaviour as dated `[KNOWN DEFECT]`
checks: the flat drag, an April row never charged, a June row charged uninflated, the Income card's $4K, the Field Manual's and What-Breaks'
sentences). §A: the schedule equals the Taxes tab's row **exactly**, every year, on every fixture household, BASE and BULL, sliders $0 / $70K /
$150K, QCD and yield set. §B: both planned paths move by the compounded tax series to 1e-6, with a **hand pin** of the example's first two
retirement quarters computed independently in exact decimal arithmetic and matched to the cent (from the engine's 2029 row, so it checks the
inflate-and-grow arithmetic). *Owned:* the first draft of these pins, and of the new `t42` D-4 figure, was written before measuring and
was wrong ($12,935.95 for the 2029 row; $2,076,914); the suite caught both on its first run, and the pins were then computed by hand and
checked against the engine — not copied from it. §C: a $10,000 one-time row in every month of a
pre-retirement and a retired year is charged once, in its own quarter, × that quarter's inflator — exact on both planned paths; a row dated
before the as-of month is never charged. §D: four quarters add to `tableYearExpense`. §E by AST: the drag is gone, neither engine reads the
table except through `mcQuarterSeries`, and every subtraction from the portfolio in either engine is one of seven named outflows. §F: the tail,
the timing, stochastic longevity. §G: the slider, the state and the QCD move it; tax type and plan type do not with the schedule held fixed —
and do, with a control, when it is computed from the plan. §H: Engines B, C and D bit-identical, and **an ORACLE MODULE built from the v6.19
source with the drag at $0 is bit-identical to v6.20 with a zero schedule** on a quarter-aligned table — both engines, the stress set, every
household for the engines and the example and single household for the stress set: the release changes the tax, the one-time rows and the
quarter read, and nothing else; by AST, every engine call in the app carries the live schedule and the effects re-run on it. §R: the re-pin's
attribution, every step exact (the quarter read derived, not only measured). §I rendered (the slider moves the card). §J: METHODOLOGY.
**Parity:** `t2`'s `INTENDED_DIFFS` gains `"v619→v620": ["mc", "extMC", "stress"]`; the seven non-Monte-Carlo keys identical.
**Re-pin, with its attribution:** `t42` D-4, the married example's 6-year planned path, $2,128,443 → **$2,083,910** — five steps, each exact
on the planned path, in the same run (`t83` R): the drag +$56,285; v6.19's charge of the April rows $0; the monthly quarter read −$375; the
one-time rows −$34,995; the tax −$65,449.
**Restated on their new footing** (premise false by design — the Monte Carlo now reads Engine B, which reads tax type, state, plan type and
the claim month): `t20`'s guards that the Monte Carlo and stress set do not move when tax types are permuted, `t56` F-1 / F-3's Monte Carlo
median and `t82` G-1 / G-2 — each now with the tax schedule held fixed, `t20` with the converse (computed from the plan, they move) asserted.
`t81` C2-2 flips to fixed (D-45) and its C2-3 control is retired for `t83` C; `t81` E-6 and F-1 read the new Backtest and Field Manual copy.
`domdiff` gains a v619 → v620 arm masking the header's and retirement cards' Monte Carlo figures, each mask bound to a count, and asserting the
header's success rate differs.
Controls `qa/tools/controls_v620_mctax.py` (repo-only): **13 of 13 as expected** — the flat drag back at one site, the tax or the one-time rows
not inflated, the one-time or monthly read back at the quarter's last month, the engines or the app ignoring the slider, the tail charged as
zero, federal tax only in the schedule, the tax put in pre-retirement quarters, a 30-year run called without the schedule, the slider out
of the effect's dependencies, and the unmutated run; every file restored and hash-checked. **Independent review** before shipping, by an
agent that had not seen the work: its findings are fixed in this release — a control that could not fire (the engines also gate the tax on
retirement, so a schedule leaking into pre-retirement quarters changed no output; `t83` F-6 now checks the quarter read itself), no check on
the app's 30-year wiring (`t83` E-6, E-7, controls C11, C12), the Income card naming the live slider beside the last run's figure, two
overstated ranges in METHODOLOGY, and the hand-pin slip above.
**Tooling:** `package_check`'s OPEN allowlist entry for `SCOPE_D40_MC_TAX_V620.md` is removed in this package, which marks the scope FULFILLED —
the two halves its expiry note required. **`package_check` B-2 strengthened:** it caught a built page in `knowledge/` only by byte comparison
with this package's own built page, so a different built page (the prior release's) passed; `package_check_controls` P48 plants exactly that,
ran on an app release for the first time here (until now it was skipped without a pool) and went NOT CAUGHT. B-2 now also applies its
size-free content marker (an inlined script bundle) whenever a `knowledge/index.html` ships. Changed after the suite run; `t21` re-run on the
changed file: 64 passed, 0 failed; `package_check_controls` against this package with a simulated post-upload pool: 65 behaved as designed, 0
did not, 2 skipped (P15 and P58–P61 need an ops or handover package — not this kind).
**Registered:** `v620` by AST (345 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand. The shim
exports the schedule and quarter-read functions, `ROTH_TAX_DRAG_Q` (for the prior leg), `BASE_GROWTH`, `getMonthlyExpense` and
`getOneTimeExpenses` (guarded).

**Suite, run from the packaged copies:** **7,871 app checks across 82 app suites** (the eight `-spend617` attribution runs included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 37, `sets` 12 + 12; **GRAND 8,006**. Against v6.19's line the counts that moved are `t20` 100 → 102 (the restated guard's converse, two checks), `t81` 78 → 77 (C2-3 retired for `t83` C) and `t82` 105 → 59 (§C, §D, §H and J-3, the v6.18 → v6.19 pair, take their designed skip in a run folder without the v6.18 source — as `t81` did at v6.19), and `t83` is new. Every skip line read: each is a designed pair-pinned skip (`t65`, `t70`–`t72`, `t75`–`t83`), and `t83` takes none on the v6.20 leg (its four on the v6.19 leg are by design: no schedule there, no pair, no METHODOLOGY of its own). Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v619 v620` from a fresh clone of `21dd782` carrying the package as cut (79 files); the documentation was finished after the run (`CHANGELOG.md`, `TESTING.md`, its archive, `PROJECT_KNOWLEDGE_INDEX.md` and the scope's status line and build record — a run folder holds the source, `METHODOLOGY.md` and the built page, and `METHODOLOGY.md` was final). Source `8db224990e86ddcbe2180f96b6a52889` · built `2a0b45ea9c1425752ff8918862e15202` (`smoke_built` 22 passed, 0 failed); v6.19 rebuilt first from its own source to its published `d9e0df42…`.

**Limitations, disclosed:**
- The tax does not follow the path: one schedule, from the plan's own draws and life expectancies, is paid on every path — a path that cuts
  spending at a guardrail, draws more after a crash, or loses a spouse early pays the same tax.
- The Social Security cut toggle is not in the tax (it is computed on the full scheduled benefit); IRMAA is not in it (D-51); the home-move
  cash is not in Engines A–D (D-39).
- For a plan with no income streams, the Taxes tab taxes built-in part-time wages for spouse B, which the Monte Carlo does not credit —
  conservative, $14,479 on the example (D-49, filed for its own release).
- An expense row for income tax would be charged twice; the Field Manual says so.
- The Withdrawal tab still never sees a one-time row dated before the retirement year (D-44, narrowed).
- What-Breaks' tax is still the Roth tab's strategy engine's lifetime tax averaged per year.

**Registered:** D-40 and D-45 closed; D-44 narrowed to its Withdrawal half; D-49 (the spouse-B work taper), D-50 (the mortgage what-if's
Florida sentence) and D-51 (IRMAA not in the Monte Carlo) opened; D-47's entry corrected (it was not in this release's scope; the planned
path its fix needs is now returned).

## v6.19 — the Monte Carlo's quarter calendar (D-46)

**A MODELLING release** — METHODOLOGY gains *The Monte Carlo's calendar*. `docs/SCOPE_D46_MC_CALENDAR_V619.md` (repo-only, fulfilled). Found while
scoping D-40 (`docs/SCOPE_D40_MC_TAX_V620.md`, repo-only): Steve chose to fix the calendar first, in its own release (that scope's DC-0), and
then *"Let's continue with your recommendations"* on this scope's eight decisions — all (a). D-40, D-44 and D-45 follow as v6.20 on this
calendar.

**What was wrong (v6.18, measured).** Both Monte Carlo engines turned a quarter number into a date with one formula — quarter 0 was "June of
the as-of year" for every plan — and read the expense table, the one-time rows, the ladder's end, the trust-fund year and the income streams
at that date. But they decided when things happened by two other rules. The 6-year engine placed retirement and the claims at
`round(months from the as-of month ÷ 3)`: right for every event only with an as-of date in May (in April — the example's month — while no
event fell in a quarter's last month); for a plan saved in October it read its first retired quarters at September and December 2028, and the
setup wizard's plans (as of 1 January, June claims) had both claims a quarter late. The 30-year engine (runs A–D, the stress set, the
Dashboard, the mortgage what-if) counted quarters from **January** of the as-of year and never read the as-of month: its figures were
identical for every as-of date in a year, and for an April–June as-of date it retired, and paid each claim, a quarter late. The year 2026 was
typed into run A's length and label, the chart axis, the Stress tab's table and the longevity draws' current ages; the run headers said runs B
and C start at retirement (they start at the as-of date). **Optimistic for most plans' 30-year figures.** Never registered; filed as D-46 and
closed.

**What changed (DC-1 to DC-8, all (a)).**
- **One calendar** (`mcQuarterOf`, `mcQuarterDate`): quarter 0 is the calendar quarter containing the as-of date, each quarter is dated by its
  own year and last month, and an event falls in the quarter containing its date — retirement, spouse B's retirement and both claims, in both
  engines; `buildRetireOptions` and `buildPlanTimeline` use it. The two old quarter rules and five timeline fields nothing read are gone.
- **The first quarter counts only the months from the as-of month** (DC-2): contributions and the bonus, spending, income, the inflation step
  and the return scale by 3/3, 2/3 or 1/3. **A claim pays from its own month** (DC-3). The bonus falls in the January–March quarter.
- **The stress set's forced years are calendar years** (DC-4): "a crisis in the first year of retirement" covers the retirement year's four
  quarters; the random regime is still drawn every fourth quarter, forced or not, and ordinary runs are untouched.
- **A plan saved after it retired gets no home-move cash** (DC-8) — its balance already holds it; the two engines used to disagree.
- **The year comes from the plan.** Run A runs to the retirement quarter (`runExtendedMC` takes `totalQuarters`, records a final snapshot and
  annualizes over the real length); the chart axis, the Stress table and the longevity ages use the as-of year.
- **What the user reads.** The run headers and the tab's summary give the spans the runs model ("2026–2036 (10 years from your as-of date)");
  run A reads "2 yr 9 mo" on the example; run C's trajectory table, the Stress tab's table and the Guardrails tab's yearly table label each
  row with its quarter's true date ("Mar 2029 ◀ RETIRE"); the retirement cards count the Social Security gap in months; the Monte Carlo tab
  and the Field Manual (Monte Carlo entry, dated v6.19) say how the calendar works. No notice (DC-6). The Stress tab's `1.04^years`
  benchmark is filed for v6.20 (DC-5, D-47); runs B and C keep their spans from the as-of date (DC-7).
- **On the example** (as of 2026-04-18, January events) the 6-year run is **bit-identical**; the 30-year engine moves only by its four event
  quarters — 30-year success above $800K 81.0% → 80.3%, median $1,609K → $1,565K (BASE, at the scope). A plan saved in November moves to
  78.0% / $1,487K.

**Tests.** New suite **`t82`** — **105** on v6.19, **16** on v6.18 (that leg pins what is observable from outside as dated
`[KNOWN DEFECT]` checks: the as-of month ignored, the retirement balance stepping by quarters, the claim month rounded, the cash for a plan
already retired, the old label formula and the five 2026 sites). §A: the calendar against an **independent oracle written from dates** for an
as-of date in every month of two years and every event month, and `RETIRE_OPTIONS` and the timeline through the app. §B by AST: the old label
formula, the old quarter rules, the unread fields and the literal 2026 are gone from the machinery; both engines date, scale and pay through
the calendar. §C across v6.18 → v6.19: the 6-year engine bit-identical on every April household with first-month events, and a March claim as
the control that it discriminates. §D: the 30-year engine **bit-identical to an ORACLE MODULE built from the v6.18 source with its four event
quarters one earlier** (the `t80` §A builder) — runs B and C, stochastic longevity, sustained LTC and the mortgage what-if. §E: forced years
traced quarter by quarter (`runExtendedMC`'s test-only `regimeTrace`). §F, §G: the first quarter and a mid-quarter claim exact on the planned
path. §H: Engines B, C and D bit-identical. §I (the extinction): the planned balance at retirement falls every month by no more than a month's
contributions and return, for as-of dates across 2026–2027. §J: run A's length and average return, and 2027's longevity ages against the oracle
with 2027 in the age line. §L: no home-move cash for a plan already retired. §K rendered.
**Parity:** `t2`'s `INTENDED_DIFFS` gains `"v618→v619": ["extMC", "stress"]` — **`mc` identical**, and the seven non-Monte-Carlo keys identical.
**Re-pins:** none — no Monte Carlo pin moved (`t42` D-4, the 6-year planned path, held). `t33`'s PINS gain a `v619` entry equal to v6.18's (its Roth fixtures read no quarter).
Controls `qa/tools/controls_v619_calendar.py` (repo-only): **11 of 11 as expected** — the old label formula at one site, the 30-year retirement quarter from
January, a claim a quarter late, `round` back in the retirement options, the first-quarter and claim shares removed, 2026 back in the age line,
forced years by year-from-start, the cash for a plan already retired, the bonus on `q % 4 === 3`, and the unmutated run; every file restored
and hash-checked.
**Tooling:** `package_check`'s OPEN allowlist gains `SCOPE_D40_MC_TAX_V620.md` — decided and unbuilt, shipped here so Steve's ten decisions are on record; it expires at the v6.20 build, which must mark the scope FULFILLED and remove the entry together. I-2 named the scope on the first check of this package, as designed. Changed after the suite run; `t21` re-run on the changed file: 64 passed, 0 failed.
**Registered:** `v619` by AST (342 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand. The shim exports
the calendar functions, `RETIRE_OPTIONS`, `applyScenarioProbs` and `PROB_PRESETS` (guarded).

**Suite, run from the packaged copies:** **7,763 app checks across 81 app suites** (the eight `-spend617` attribution runs, 236 checks, included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 36, `sets` 12 + 12; **GRAND 7,897**. Against v6.18's line the counts that moved are `t81` 130 → 78 (§D, the v6.17 → v6.18 differential, takes its designed skip in a run folder without the v6.17 source) and, in tooling, `domdiff` 44 → 36 (v6.18's pair carried the v617 → v618 arm's masks; this pair's arm has four), and `t82` is new. Every skip line read: each is a designed pair-pinned skip, and `t82` takes none on the v6.19 leg. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v618 v619` from a fresh clone of `386bb87` carrying the package as cut (78 files); the documentation and the allowlist entry above were finished after the run (`CHANGELOG.md`, `TESTING.md`, its archive, `PROJECT_KNOWLEDGE_INDEX.md` and the two scopes' status lines — a run folder holds the source, `METHODOLOGY.md` and the built page, and `METHODOLOGY.md` was final). Source `35d3dcb436b7ad801b6c9588d5429cb0` · built `d9e0df4297fce9946417db5b9b322ee3` (`smoke_built` 22 passed, 0 failed); v6.18 rebuilt first from its own source to its published `d228f1d3…`.

**Limitations, disclosed:**
- Quarters stay the unit: an as-of date on the 28th counts its whole month, and the first quarter's return is scaled linearly.
- My Data dates a plan in UTC, so an evening save in the Americas on a quarter's last day falls in the next quarter (D-48).
- The Monte Carlo still reads one month per quarter for the expense table and charges a one-time row only in a quarter's (now true) last month
  (D-45, with D-40 and D-44 at v6.20). Its income tax is still the flat $4,000 a quarter during the ladder (D-40).
- The Stress tab's 30-year table compares the median with `household × 1.04^years`, which ignores withdrawals (D-47).

**Registered:** D-46 filed and closed; D-47 and D-48 opened; D-45's entry notes the true quarter-end months.

## ops 2026-10-18 — the v6.18 entry's provenance line

**KIND: ops** — documentation only; **v6.18 stays current** (source `208bf89d1bd83fc55d430f2eec60d202`, built `d228f1d3391231406848d2647cb97fec`). No app source, suite or figure changes.

The v6.18 entry shipped without its provenance line — the source and built-page md5s that end each release's suite line (OPERATIONS §G, from
v5.12) and that `package_check` H-1 and H-2 compare with the files the live site serves. So the post-ship check could not run them: it reported
50 passed, 0 failed and **H-1 skipped** ("the newest CHANGELOG entry carries 0 md5s"). Owned: the suite record was rewritten after the review's
corrections and the line was not carried into it; the simulated post-upload check before shipping skipped H-1 the same way, and its skip line
went unread because only the failure count was checked. A skipped check is not a passed one (`package_check` says so on every run). This entry adds the line to v6.18's suite record,
marked as added; `PROJECT_KNOWLEDGE_INDEX.md` rolls its CHANGELOG hash row. Verified by `package_check` on this package, and after the upload
with all four arguments (H-1 and H-2 must then pass, not skip).

## v6.18 — the Withdrawal tab spends the expense table at the plan's own dates, year by year (D-41)

**A MODELLING release** — METHODOLOGY gains *The Withdrawal tab spends the expense table year by year*. `docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md`
(repo-only, fulfilled). Steve, on the findings note `docs/FINDINGS-v6_17-fixed-plan-figures.md` (F-2): *"go"* to scope it first; then *"go"* on the
scope's six decisions as recommended.

**What was wrong (v6.17, measured).** The Withdrawal tab (Engine D), Backtest and What-Breaks spent the expense table as it stood in **June
2029** before spouse B's Medicare year and **June 2031** after it — the example household's dates, typed into the code — for every plan. So a plan on
any other calendar spent the wrong rows: the example with every date moved three years later spent $6,700 a month (a month that still held its
current home's costs and none of its retirement rows) where its own table says $8,170, then $8,020 — **$401K less lifetime spending and a $734K
higher ending portfolio** than its own table, read year by year, gives. A row ending after June 2031 was charged for life (the example's car
payment), one starting later never, and one-time rows never arrived. The Taxes, IRMAA and Roth tabs took Engine D's draws through the bridge,
so they inherited it. The Monte Carlo was not affected — it reads the table itself, once a quarter. Never registered; filed as D-41 and closed.

**What changed (DC-1 to DC-6, all (a)).**
- **One read of the table.** `tableYearExpense(yr, survivorFromYr)` sums a calendar year's own months for every monthly row (times the survivor
  factor from the first death) plus that year's one-time rows (no survivor factor). Engine D inflates it from the retirement year as before;
  Backtest and What-Breaks read it too, so the three agree (DC-1, DC-2, DC-4).
- **The example moves too, and the reasons are visible.** 2029 spends **$126,280** — the current home's costs through March, the retirement rows
  from April, and the $28,000 of one-time rows (the golf cart and the closing costs); from May 2034 the $400 car payment is gone. Its ending
  portfolio rises $109K; its lifetime federal tax as the Taxes tab first opens falls $598 ($210,898 → $210,300, `t40` E2) and on the as-is reading
  $2,576 (E1); the Roth tab's best strategy is unchanged.
- **The display figures follow the plan's dates (DC-3).** The "pre-retirement", "post-retirement" and "after spouse B's Medicare" spending quoted
  in eleven places take their month from the plan's timeline by one rule — the later of the event's month, June of that year, and the as-of
  month. On the example that is 2026-06, 2029-06 and 2031-06, so **no example display figure moves**; a plan on another calendar now sees its own.
- **The retirement-year buttons (DC-5)** keep the table on its calendar dates: retiring a year early spends the pre-retirement rows until the table
  ends them, as the Monte Carlo already did.
- **What the user reads.** The Withdrawal tab's schedule note says where its spending comes from, and that a one-time row dated before retirement
  is not in the schedule; the Field Manual's Withdrawal Strategy entry says the same, dated v6.18, and says when the Monte Carlo charges a
  one-time row (D-45, below); Backtest's comparison sentence no longer says the backtest omits one-time expenses (it now spends them — found
  rendering the tab at the build) and says when the Monte Carlo charges one. No in-app notice (DC-6): no saved data changes.

⚠ **Owned — a premise error in the scope, found before ship.** The scope's §0.1 (and the v6.17 findings note) said the Monte Carlo subtracts
one-time rows "when they fall". An independent review of this release found it does not: both engines read the table once a quarter, at the
quarter's last month, and the one-time match is exact — so a row dated in any other month is never charged. The example's April 2029 golf cart
and closing costs ($28,000) have never reached the Monte Carlo (measured: byte-identical output with and without them). The first draft of this
release's copy repeated the false premise ("the Monte Carlo takes it from the portfolio when it falls") on the Withdrawal tab, in the Field
Manual and in Backtest's sentence; all three were corrected before the package was cut, `t81` E-1, E-6 and F-1 now assert the corrected text,
and §C2 pins the Monte Carlo's behaviour as a dated `[KNOWN DEFECT]`. The Monte Carlo itself is unchanged (the scope kept it bit-identical);
filed as **D-45**. The v6.17 home-move note's "closing costs … are already counted" is untrue for the example's April row in the Monte Carlo
for the same reason (recorded under D-45, not changed).

**Tests.** New suite **`t81`** — **130** on v6.18, **40** on v6.17 (that leg pins the snapshots as dated `[KNOWN DEFECT]` checks). §A:
Engine D's spending against an **independent oracle** (its own month loop over the EXPENSES rows, its own survivor year and inflator) to the
cent on the example, every fixture household, the same plan moved 3 and 6 years later, a single plan, spouse B on Medicare before retirement, a
survivor case, a stress table and both retirement-year buttons; hand pins ($126,280; 2034's four car months; the survivor year); the function
unit-tested 2026–2060. §B by AST: no typed `"YYYY-MM"` reaches either table reader; Engine D, Backtest and What-Breaks share the one read; no
engine A–C, the bridge or the Monte Carlo reads a snapshot; Backtest and What-Breaks read the year they are called for (B-6b). §C: the example's three display figures identical on both legs; the shifted plan
reads its own; the rule's edge cases; a recompute without a timeline rebuild still uses the plan's dates. §D across v6.17 → v6.18: both Monte
Carlo engines bit-identical on every household; a flat table (rows changing only in January of the retirement or Medicare year, no one-time rows)
moves nothing — bit for bit single, to 1e-6 for a couple (the survivor factor is applied in a different order); the example's spending moves in
exactly the years the oracle says. §C2: D-45 pinned on both legs (the April rows never reach either Monte Carlo engine; dated June they do). §E rendered: the Withdrawal tab's 2029 cell ($126K) and sentence, Backtest, What Breaks, the Expenses headers.
§F: the copy and METHODOLOGY.
**Attribution of every moved figure.** The change moved 38 pinned checks in ten suites at the probe. Each was re-pinned **with its attribution in the
same run**: `qa/tools/v617_spending.mjs` writes v6.17's two snapshots as an expense table, and v6.18 fed that table reproduces v6.17's Engine D on
every household, every field, to 1e-6 (`t81` D-4). `t40`, `t42`, `t43`, `t58`, `t71`, `t72` and `t75` now run a second time on the v6.18 leg with
that table (`runsuite.sh`'s **"-spend617"** lines) and **every v6.17 figure comes out exactly**; the normal v6.18 run carries the new figures (two hand
re-derivations: `t42`'s 2035 spending and federal tax, `t75`'s 2032 worksheet). `t19`'s mixed pool does the same inline. Two fixtures whose subject is
not spending — `t19`'s RMD-sourcing household (it needs a spending need in every RMD year, which the example's table read year by year no longer
gives it after the car is paid off) and `t20`'s tax-type block (its exacts hold only while the pool exhausts in the horizon) — now run on v6.17's
spending as a table, which keeps every figure they derived. `t14`'s death-guard check follows the survivor guard into `tableYearExpense`.
`domdiff_withdrawal` gains a v617 → v618 arm: the spending sentence set aside, the schedule and its two summary figures masked, everything
else byte-identical, the masked text different and 2029's cell $98K → $126K; the Taxes and IRMAA tables differ with the same rows and shape.
`t2`'s parity needs no entry and stayed 10 of 10 identical — its witness that the Monte Carlo did not move.
Controls `qa/tools/controls_v618_spend.py` (repo-only): **11 of 11** — Engine D back on the snapshots (also turns the DOM diff's mask check red),
one-time rows dropped, the survivor factor on one-time rows, one-time rows uninflated, a snapshot date typed back, Backtest and What-Breaks back on
the snapshots, inflation from the as-of year, the snapshots from a stale timeline, the survivor guard weakened, and the unmutated run; every file
restored and hash-checked.
**Registered:** `v618` by AST (329 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand; `suitetext.cjs` found
no typed "v6.17" in a SETUP check. The shim exports `tableYearExpense`, `recomputeDerivedExpenses` and the snapshots (guarded).
**`t80` §A now skips by design** in a run folder without the v6.16 source (any pair after v6.16 → v6.17); it ran at the v6.17 ship. `t80` reads
28 on each leg here.

**Suite, run from the packaged copies:** **7,656 app checks across 80 app suites** (the eight `-spend617` attribution runs, 236 checks, included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 44, `sets` 12 + 12; **GRAND 7,798**. Against v6.17's line the counts that moved are `t14` 47 → 48, `t19` 68 → 71 and `t80` 42 → 28, and `t81` is new. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v617 v618` from a fresh clone of `52fe385` carrying the package as cut (81 files); the documentation was finished after the run (no suite reads it but `METHODOLOGY.md`, which was final). An earlier pass on a first cut was stopped and discarded when the review's copy corrections changed the source. Source `208bf89d1bd83fc55d430f2eec60d202` · built `d228f1d3391231406848d2647cb97fec` (`smoke_built` 22 passed, 0 failed); v6.17 rebuilt first from its own source to its published `067c8740…`. *(This provenance line was missing from the entry as shipped and was added on 2026-10-18 by the ops entry above.)*

**Limitations, disclosed:**
- The inflation base is unchanged: Engine D inflates from the retirement year and starts from today's balances without growth (the v5.10 house rule).
- A one-time row dated before the retirement year is not in the Withdrawal tab's schedule (D-44).
- The Monte Carlo charges a one-time row only when it is dated in March, June, September or December — the example's April rows never reach
  it (D-45, found at this build, not changed).
- The Monte Carlo subtracts one-time rows in today's dollars while it inflates the monthly rows — optimistic, small, not changed here (D-44).
- The Monte Carlo samples one month per quarter; the Withdrawal tab, Backtest and What-Breaks sum all twelve.
- Every plan not on the example's calendar sees its Withdrawal, Taxes, IRMAA and Roth figures move — usually toward less money left.

**Registered:** D-40 to D-43 filed from the findings note (D-41 closed here); D-44 and D-45 opened.

## v6.17 — the cash from a home move is a My Data field, not a fixed $130,000 added to every plan (D-38)

**A MODELLING release** — METHODOLOGY gains *Cash from a home move*. `docs/SCOPE_D38_HOME_SALE_CASH_V617.md` (repo-only, fulfilled). Steve,
after a question about another chat's advice: *"Let's make the home-sale cash a field in My Data rather than a number in the code"*; then
*"go"* on the scope's five decisions as recommended.

**What was wrong (v6.16, measured).** `HOME_SALE_PROCEEDS = 130000` was added to the portfolio in the retirement quarter by both Monte Carlo
engines for **every** plan — the example, a plan built with Start Fresh or the guided wizard, an imported backup — whether or not anyone
was moving. No input set it, and only one Events card mentioned it ("the plan books $130K"). The figure is the net of a home move (sell,
pay off, buy the next home in cash), so for many households it is 0 or negative. On the example household the $130,000 is worth 6.3
points of 30-year success (81.1% against 74.8% at $0) and about $250,000 of median 30-year balance; on a smaller household (holdings at
40%) the 6-year headline was 64.8% at +$130,000 and 39.2% at $0. It had never been registered; it is filed as D-38 and closed here.

**What changed (DC-1 to DC-5, all (a)).**
- **The field.** My Data's home row gains **"Cash from your home move at retirement $"** (`PORTFOLIO.homeMoveCash`), a signed figure: what
  is left after selling the current home (its mortgage and selling costs paid) and paying cash for the next one; **negative** if the next
  one costs more; **0** if not moving. Its note says so, says closing costs already in the expenses are counted there, says the sale is
  treated as tax-free, and shows today's equity from Home value and Mortgage balance as a starting point (DC-1).
- **One accessor.** `homeMoveCash()` replaces the constant at all five model sites — each Monte Carlo engine's planned path and simulated
  paths, and the Events card — clamping to ±$10,000,000 and reading anything unparseable as 0. The mortgage what-if adds its principal on
  top, as before.
- **Plans without the field** (DC-2, DC-3). A plan or backup saved before v6.17 reads **$0** — the conservative reading — and My Data and the
  Monte Carlo tab show a notice ("Earlier versions added $130,000 to every plan at retirement; this plan now assumes $0…") until Save & Apply
  writes the field. Start Fresh and the wizard start at $0 with no notice. **The example keeps $130,000**, so none of its figures move.
- **What the user reads.** The Monte Carlo tab names the figure ("added to / taken from the portfolio in 2029", or "no home move"); the
  mortgage what-if says both columns start from it; the Events card names it, or drops the clause at $0; the Ask AI context gains a HOME
  MOVE line; the Field Manual's Monte Carlo entry and My Data table describe it, with its history.
- **Not changed, disclosed** (DC-4, DC-5): only the Monte Carlo, Stress and Dashboard figures include the cash — the Withdrawal, Taxes, IRMAA
  and Roth tabs do not (**D-39**, opened); it arrives in the retirement quarter; the sale is treated as tax-free (26 U.S.C. §121 excludes up
  to $250,000, $500,000 joint, when the ownership and use tests are met; a larger gain is not taxed here).

**Tests.** New suite **`t80`** — **42** on v6.17, **22** on v6.16 (that leg pins the constant as dated `[KNOWN DEFECT]` checks).
§A builds **oracle modules at test time** — the v6.16 source in the run folder with the constant set to X, compiled the way `mk_testable.sh`
compiles a leg — and for X = +$130,000, $0, −$105,000 and +$250,000 the field reproduces both Monte Carlo engines and the mortgage what-if
**bit for bit**, with a control that the oracle itself moves with X. By AST: `HOME_SALE_PROCEEDS` exists nowhere; no 130000 literal outside
the example and the state tax tables; the accessor is read at exactly the five model sites and by no engine A–D; Start Fresh and the wizard
build their plan at 0; the accessor clamps and defaults (B). Across v6.16 → v6.17: on the example, Engines A–D, the bridge and every Monte
Carlo figure are bit-identical; at $0, −$105,000 and +$250,000, and with the field missing, Engines A–D and the bridge are bit-identical (C).
A hand pin: the planned path at $0 sits 130,000 × 1.01125 = $131,462.50 below the example's in the first retirement quarter and ×1.01125
each quarter after; the Events card at +$130,000, −$105,000 and $0 (D). Rendered: the field and its note on the example; −105,000 typed with
a comma is saved; the Monte Carlo line; Export Backup and its Ask AI line; the clamp and a non-number on save; Import; an old plan at 0 with
the notice on both tabs, gone after Save & Apply; an old backup imported through My Data (E). The copy, METHODOLOGY, and the extinction of
"the plan books" (F).
**Census:** `tools/boundaries.mjs` gains a `home_move` row (§K1: the example's figure equals the old constant, so the field and the constant
cannot be told apart there), with a fixture that clears it (−$105,000) and one at $0 that must clear as well; `t29` asserts both.
Controls `qa/tools/controls_v617_home.py` (repo-only): **9 of 9** — the constant restored at one site, the sign flipped, the field lost on save,
a missing field read as 130,000, the clamp removed, the notice never shown, the example's figure changed, the Events clause kept at $0, and the
unmutated run; every file restored and hash-checked.
⚠ **Owned — one control's prediction was wrong.** I expected the sign-flip control to turn `t80` A-1 and D-1 red; it turned B-6 and the
rendered E-4, E-5 and E-9 red instead, and left A-1 and D-1 green. The loader clamps a stored value in place *through the accessor*, so a
flip applied at load and again at read cancels in the engines on a freshly loaded plan — the defect shows in the stored and displayed
value. The control catches it; its expected list now names B-6 and E-4, with the reason in the file.
⚠ **Owned — the first package check failed.** `t80` built its oracle modules as files in the run folder's `qa/` and left them there;
`package_check` G-2 (every new hand-written file under `qa/` is in the package) found the eight files. `t80` now deletes each oracle's files
once it has loaded the module. The packaged suite run and the controls were then repeated in full on the corrected package (below).
**Registered:** `v617` by AST (322 sites), with `t1`'s and `t4`'s version-string arms, `t33`'s PINS (no Roth figure moves, so v6.16's values)
and the three Python suites by hand, before the first full run; `suitetext.cjs` found no typed "v6.16" in any SETUP check (the `t78` D-2a
lesson). The test shim exports `homeMoveCash` (guarded).

**Where the build departed from the scope, recorded in its §7:** Start Fresh and the guided wizard needed `homeMoveCash: 0` written into their
new plans (the scope said neither needed an edit) — without it a brand-new plan would have shown the "earlier versions" notice. The field is
not written into a plan that lacks it at load, so a backup restored from the landing page keeps its notice until the user saves.

**Suite, run from the packaged copies:** **7,254 app checks across 79 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,384**. Against v6.16's line, the counts that moved are `t29` 78 → 82 (the `home_move` row) and `t79` 116 → 69 (its v6.15 → v6.16 differential takes its designed skip on this pair), and `t80` is new; every other current-leg count is unchanged. Run from the PACKAGED copies, twice, each in one pass: a run folder built by `mk_runfolder.sh v616 v617` from a fresh clone of `8e54a6a` carrying the package as first cut (78 files), then — after the G-2 fix to `t80` above — one carrying the corrected package (80 files, each overlay compared byte for byte with the build workspace); the two runs gave identical per-suite counts. The documentation was finished after the second run, and every file outside `CHANGELOG.md`, the manifest and the scope is byte-identical to what ran. v6.16 resolved from history (commit `13b281a`). The controls were repeated on a copy of the second run folder: 9 of 9. Source `dc8a4d5f5796b11d88007024b1ecaca7` · built `067c87404e92339a1de9ece815d6151e` (`smoke_built` 22 passed, 0 failed); v6.16 rebuilt first from its own source to its published `765cd89f…`. The first full run (the build workspace) was green as well: GRAND 7,384, 0 failed.

**Limitations, disclosed:**
- Only the Monte Carlo figures include the home-move cash (D-39); the Withdrawal tab's pool starts without it.
- The cash arrives in the retirement quarter; a move at another time is not modelled.
- The sale is treated as tax-free; a gain above the §121 exclusion, or a sale that fails its tests, is not taxed here.
- A plan saved before v6.17 reads $0 until its owner enters a figure — its Monte Carlo figures fall, and the notice says why.

## v6.16 — self-employment tax: a self-employed job row pays both halves, on 92.35% of the profit (D-36)

**A MODELLING release** — METHODOLOGY changes (*Payroll tax on job income* gains a self-employment subsection; its simplifications are
rewritten). `docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md` (repo-only, fulfilled). Steve: *"yes"* to scoping D-36 — the only open item whose error
made plans look better than they are — then *"go"* on the scope's six decisions as recommended.

**What was wrong (v6.15, measured).** Every job row was taxed as a paycheck — the employee's 7.65% — so a self-employed person's payroll tax
was understated by about half. Disclosed since v6.14 (Taxes tab, My Data, Field Manual, METHODOLOGY), not modelled. On the example household
plus $60,000 a year of consulting for five years, v6.15 charged $4,590.00 a year where the law charges $8,477.73: **$19,438.65 too little
tax over the five years**, and a larger estate than the plan can expect.

**What changed (DC-1 to DC-6, all (a)).**
- **The input.** My Data's Type dropdown offers **"Job — employee (W-2)"** and **"Job — self-employed (1099)"** in place of "Job
  (part/full-time)". Both store `kind: "work"`, so every site keyed on a job row keeps working; the second adds `selfEmployed: true`, which the
  editor, Save & Apply, Export Backup and Import carry. **A row saved before v6.16 has no field and stays an employee** — its figures do not
  move, and the job-row note asks the user to pick the type (DC-3, DC-4). The Income tab and the Ask AI context call such a row self-employed.
- **The rule** (26 U.S.C. §1401, §1402), in the one helper, `payrollTax`, which keeps its three call sites (Engine A twice, Engine B once):
  net earnings are 92.35% of the profit; nothing is owed if a person's net earnings are under **$400** (`SE_MIN_NET`, statutory, unindexed,
  with a new Verify-tab check — the count goes 71 → 72); Social Security 12.4% on net earnings up to the base **the same person's wages
  leave**; Medicare 2.9% on all of it; the 0.9% on the household's wages **plus** net earnings above $200,000 / $250,000. A joint row is split
  equally while both spouses live (DC-6). `workEarners` now returns each person's wages and profit apart (`{ w, se }`), through one new
  `streamsMonthlyAt` filter no other caller passes. No self-employment rate is typed: all derive from the employee-side constants.
- **Not taken, disclosed** (DC-2, DC-5; filed as **D-37**): the deduction for half the self-employment tax (§164(f)) and the QBI deduction
  (§199A). Both make income tax run a little high — conservative. Taking §164(f) properly lowers AGI and every MAGI, which reaches the IRMAA,
  Withdrawal and Roth-ladder engines too; that is its own release.
- **The copy.** The Taxes tab's method note, My Data's streams and job-row notes, and the Field Manual's streams entry state the rule and the two
  simplifications; the three "not modelled … understated" sentences are gone.

**Measured** (example household plus job rows in the first five plan years, Engine B; year-2029 payroll tax, v6.15 → v6.16, and the five-year change,
which is the whole change in lifetime total tax):

| Household | 2029 | 5 years |
|---|---|---|
| A self-employed $60,000 | $4,590.00 → $8,477.73 | +$19,438.65 |
| A self-employed $30,000 + B employee $40,000 | $5,355.00 → $7,298.87 | +$9,719.32 |
| A employee $150,000 + A self-employed $60,000 | $15,184.16 → $18,760.21 | +$19,374.64 |
| A self-employed $250,000 | $15,764.16 → $30,973.69 | +$78,524.54 |
| Single, A self-employed $120,000 | $9,180.00 → $16,955.46 | +$38,877.30 |
| A self-employed $430 a year (net $397.11, under the floor) | $32.90 → $0.00 | −$164.48 |
| Example household; any household with employee rows only | bit-identical | $0 |

Engine A (the strategy comparison) on the $60,000 household: every strategy pays $19,329–$19,439 more and leaves an estate $53,299–$53,602
smaller. The IRMAA and Withdrawal engines, the bridge series and both Monte Carlo engines are bit-identical on every household tested.

**Tests.** New suite **`t79`** — **116** on v6.16, **60** on v6.15 (that leg pins v6.15's rule as dated `[KNOWN DEFECT]` checks).
An oracle typed from §1401/§1402 reproduces Engine B's payroll tax to the cent in every job year on thirteen households — including a joint-owned
self-employed row and a survivor who crosses from joint to Single mid-business, where the 0.9% on net earnings appears exactly at the crossing —
and matches only its own leg's rule (A). By AST: still three `payrollTax` call sites; no 0.124, 0.029, 0.153 or 0.9235 literal outside the
historical-returns table; the floor read from `SE_MIN_NET`, no 400 typed in the helper (B). Across v6.15 → v6.16: Engines C and D, the bridge
series and both Monte Carlo engines bit-identical on all thirteen; Engines A and B bit-identical on the three without a self-employed row;
Engine B's total tax moves by its payroll change and nothing else; Engine A's no-conversion strategy moves by exactly Engine B's change on four
households and, on the rest, the same way and by no more (C — see the correction below). Five hand pins to the cent, worked in the file:
$8,477.73, $18,760.21, $16,694.74 (no Social Security room left after a $200,000 paycheck; the 0.9% on wages plus net earnings), $31,251.57 (a
single filer's 0.9% on net earnings) and $0 under the floor (D). The input rendered: both job types offered; an old row reads as an employee;
choosing self-employed and pressing Save & Apply stores the field and moves the applied plan's tax; reopening shows it; the Income tab labels
it; Export Backup carries it (and the Ask AI context names it); switching back clears it; Import restores it (E). The copy, the extinction of
the three old sentences, and METHODOLOGY (F).
**Census:** `tools/boundaries.mjs` gains a `self_employed` row (§K1: the example household has no self-employed row, so D-36 was invisible
there), with a fixture that clears it and one under the $400 floor that must not; `t29` asserts both and gates the row's flip to v6.16.
Controls `qa/tools/controls_v616_se.py` (repo-only): **9 of 9** — the 92.35% factor dropped, the $400 floor dropped, the base not reduced by
wages, the 0.9% ignoring net earnings, a joint row given wholly to A, the field lost on save, a stray `0.124`, the old disclosure restored, and
the unmutated run; every file restored and hash-checked.
**Re-gated:** `t77` B-3 (the Verify tab's payroll category has six checks on v6.16, the new one citing §1402(b)(2)) and E-4 (on v6.16 it asserts
the old "owes both halves" disclosure is gone); `t78` D-2a derives the built page's version from the newest source in the run folder (below).
`t78` and `t77` keep their v6.14 → v6.15 / v6.13 → v6.14 differentials as designed skips on this pair (`t78` 42 → 36 on the current leg). `v616` registered by AST (314 sites); `t1`'s and `t4`'s version-string and Verify-count arms,
`t33`'s PINS (no pinned household has a self-employed row, so v6.15's values) and the three Python suites by hand, **before** the first full run,
as v6.15's CHANGELOG requires.
⚠ **Owned — one version string my pre-run review missed.** `t78` D-2a, a SETUP check, asserted the run folder's built page "names v6.15" —
a typed version string, not a tag, so the registrar could not see it. The first full run went red on it on both legs (`t78` 35 + 1 failed
per leg; nothing else red). It now derives the version from the newest source beside it, and fails against v6.15's page in a v6.16 run
folder (checked). Nothing shipped wrong.

⚠ **Owned — a test claim in the scope was too strong.** The scope's §3 C said Engine A's no-conversion strategy moves by *exactly* Engine B's
payroll change. Measured, that holds on four households (to the dollar) but not on five others: Engine A carries balances forward, so the extra
tax leaves less invested, and later IRMAA, survivor-year tax and NIIT fall a little (on the joint-owned $300,000 household, $74,573 against
$96,160.50). In the first plan year every strategy's tax moves by exactly Engine B's figure on every household (instrumented session-only, not a
suite check). `t79` C-4 asserts the exact form on the four and the measured bound on the rest; the scope's §7 records it. The scope's §0.3 had
already measured the wider Engine A range at $250,000, so the "exactly" was a drafting error, not a changed premise. Separately, the scope's §3 D
named "the 0.9% on $250,000 of self-employment" as a pin; on a joint return $250,000 of profit is $230,875 of net earnings, under the
threshold, so that pin is taken on a single filer instead ($31,251.57).

**Suite, run from the packaged copies:** **7,220 app checks across 78 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,350**. Against v6.15's line, the counts that moved are `t29` 73 → 78 (the `self_employed` row) and `t78` 42 → 36 (its v6.14 → v6.15 differential takes its designed skip on this pair), and `t79` is new; every other current-leg count is unchanged. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v615 v616` from a fresh clone of `7ee5470` carrying the package as first cut (76 files, each overlay compared byte for byte with the build workspace; the documentation was finished after the run, and every file outside `CHANGELOG.md`, `TESTING.md`, the TESTING archive, the manifest and the scope is byte-identical to what ran), v6.15 resolved from history (commit `cbe2eb2`). While it ran, the repo gained `b47769a` (the scope's draft, byte-identical to the copy the run held); the package is based on `b47769a`. Source `dfc07ee74ad9dd52c0925f54bee0a682` · built `765cd89f6c5d97a937f2fa2e7405ee64` (`smoke_built` 22 passed, 0 failed); v6.15 rebuilt first from its own source to its published `38f51c21…`. The first full run (the build workspace) was green except `t78` D-2a on both legs — owned above.

**Limitations, disclosed:**
- The §164(f) and §199A deductions are not taken (D-37): a self-employed household's income tax runs high, and its AGI and MAGI do not drop
  by half the self-employment tax.
- A job row's amount is read as the year's net profit; losses, the optional methods on Schedule SE, and Social Security credits earned by
  self-employment are not modelled.
- A plan saved before v6.16 keeps every job row as an employee until the user changes its type.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v6.00 to v6.15 in `docs/CHANGELOG_ARCHIVE_v6_00_to_v6_15.md` (2026-10-19); v5.75 to v5.99 in `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` (2026-10-11); v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`
(2026-09-28); v5.59 and earlier in `docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
