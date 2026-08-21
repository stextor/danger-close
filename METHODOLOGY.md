# Danger Close — Methodology White Paper (v5.7)

This document explains how every engine in Danger Close works, what it assumes, where those
assumptions come from, and — just as important — where the model simplifies reality. It exists
so that anyone (including a skeptical CPA, actuary, or fellow engineer) can audit the approach
without reading 9,000 lines of source. Companion material: the `validation/` folder contains a
runnable suite that checks the statutory constants against their sources and exercises the app
headlessly.

**Standing disclaimer:** Danger Close is an educational modeling tool built by a hobbyist with
no financial credentials. It renders no investment advice, recommends no securities, and every
output should be verified independently before any real-world action.

---

## 1. Monte Carlo engine (regime-switching mixture)

Rather than the classical Gaussian Monte Carlo (draw returns from a single normal distribution
defined by mean and standard deviation), Danger Close samples each year from one of **six
probability-weighted economic regimes** (e.g., expansion, recession, crisis, stagflation,
recovery, boom), each with its own return/inflation characteristics per asset class. The regime
is held for the year, then re-drawn: the engine steps quarterly, but draws a regime once per
simulated year and applies it to all four quarters (a separate quarterly noise term, 4% vol and
10% in crisis, varies returns *within* the year around the regime's mean). Holding the regime for
a full year is deliberate — the regime parameters are calibrated as annual outcomes, and
redrawing quarterly shrank regime variance roughly fourfold and largely erased sequence-of-returns
risk, since a crisis quarter would simply be averaged away by the next boom quarter.

Why: single-Gaussian Monte Carlo understates fat tails and the correlation between returns and
inflation. A mixture of regimes produces left tails and return/inflation relationships closer to
history without pretending to forecast.

Design decisions worth knowing:

- **Arithmetic-vs-geometric discipline.** Regime returns are calibrated so the simulation's
  compound growth matches the intended CAGR — avoiding the common error of feeding arithmetic
  average returns into a volatile simulation, which double-counts variance drag.
- **Conservative BASE prior.** The BASE scenario set is deliberately more pessimistic than the
  1926– historical record. Success rates will read roughly 10–20 points lower than tools
  calibrated to raw history. This is a choice, not a bug: the tool's job is stress-testing, and
  an optimistic prior defeats that purpose. The Backtest tab exists precisely so users can see
  the same plan against actual history side by side.
- **Asset-class weights are the user's own.** The engine consumes the four descriptive sleeve
  weights (cash / bonds / equity / hedge) derived from the user's actual holdings. It never
  imposes a target allocation.
- **Seeded common-random-numbers.** A/B comparisons (e.g., insured vs uninsured LTC) can share
  one PRNG seed so the difference between runs is signal, not sampling noise.
- **Years are drawn independently — no multi-year persistence.** Each simulated year's regime is
  sampled without reference to the year before it, so the model has no transition matrix and no
  memory. Real economies autocorrelate: recessions cluster, 2000–2002 delivered three consecutive
  losing years, and downturns are often followed by mean-reverting recoveries. The engine
  reproduces clustering *within* a year (all four quarters share one regime) but not *across*
  years, which makes a sustained multi-year grind somewhat less likely in simulation than the
  historical record suggests. This is a known simplification, and it is the main reason the
  **Backtest tab** (real 1929/1966/2000/2008 sequences, which carry genuine serial correlation)
  and the forced-scenario **Stress** paths exist: they cover the blind spot this assumption
  creates. A Markov regime-switching model with an estimated transition matrix would be the
  principled fix and is a candidate for future work.
- 10,000 iterations per run by default.

## 2. Historical backtest

Rolling-start backtests against S&P 500 total return, 10-year Treasury, 3-month T-bill, and CPI
from **1871 forward** (Damodaran/NYU Stern return series + BLS CPI; public data). The user's
current asset mix is held constant with annual rebalancing. Purpose: a reality anchor for the
deliberately conservative Monte Carlo prior.

## 3. Mortality

Two modes:

- **Deterministic (default).** Each spouse dies at the life expectancy the user entered. Simple,
  transparent, and conservative in one specific way: both spouses reach their full horizons on
  every path, maximizing joint drawdown years.
- **Stochastic (toggle, Monte Carlo tab).** Each iteration samples each spouse's death age from
  a **Gompertz survival curve anchored so the user's entered life expectancy is the median** of
  their personal distribution. Dispersion b ≈ 9 years matches SSA period-table shape at
  retirement ages; sampled ages are capped at 105. Closed-form inverse-CDF:

  ```
  S(t | x) = exp( e^{(x−m)/b} · (1 − e^{t/b}) )
  t = b · ln( 1 − ln U / e^{(x−m)/b} ),   m = x + b · ln( (e^{t_med/b} − 1) / ln 2 )
  ```

  Anchoring to the *user's* number (rather than population tables) deliberately preserves their
  own health/family-history judgment while making the tails real. Validation: 50,001-sample
  inverse-CDF sweep reproduces the anchored median exactly (see `validation/`).
- On first death, household spending scales by the survivor factor and Social Security collapses
  to the survivor benefit; sustained-LTC care windows anchor to each path's own death timing.

Known simplification: mortality between spouses is sampled independently (no broken-heart
correlation), and no explicit healthy/impaired state model.

## 4. Long-term care

Two models, user-selectable on the Monte Carlo tab:

- **Single-shock (default).** One $150K–$300K (uniform) event per spouse at fixed trigger ages.
  Captures the *median* experience; deliberately mild in the tail.
- **Sustained-care distribution (toggle).** Per iteration, each spouse draws a paid-care duration
  — 45% none, with a tail to 8 years (shape follows ASPE/Urban Institute LTSS research) — at
  ~$120K/year in today's dollars, escalating 1.5%/yr *above* general inflation, anchored to the
  final years before that path's death. Internal audit: similar expected cost to the single
  shock, but ruins ~15% of paths where the single-shock model ruins ~0.2% — the entire point is
  the duration tail, which lands when the portfolio is smallest and the survivor is down to one
  Social Security check.

## 5. Federal tax engine

Annual projection applying, per year: 2026 brackets and standard deductions (Rev. Proc. 2025-32,
incl. OBBBA changes) inflated ~2%/yr; Social Security taxation via the provisional-income test
(85%-cap tiers); LTCG/qualified-dividend stacking on top of ordinary income; NIIT (3.8%,
statutorily unindexed thresholds); a simplified AMT check (standard-deduction add-back method);
FICA on earned income only; RMDs from the Uniform Lifetime Table at the SECURE 2.0 start age;
Roth conversions with bracket/IRMAA interaction; and QCDs (2026 cap $111,000/person, indexed —
excluded from income and MAGI, counting toward the RMD, with the gifted dollars actually leaving
the Traditional balance).

Known simplifications: the provisional-income thresholds are handled in simplified tiers; AMT is
a screen, not a full Form 6251; itemized deductions are not modeled (standard deduction assumed); the temporary OBBBA senior bonus deduction (up to $6,000/person 65+, 2025–2028) IS modeled here, phased out at 6% of MAGI above $75,000 single / $150,000 married filing jointly against a MAGI proxy of gross ordinary income plus qualified dividends and capital gains — those four figures are statutory and unindexed, and the Roth conversion ladder deliberately does not model it (§7), so the two tabs differ for any ladder year at or before 2028. **From v5.31 those figures live in a named `OBBBA_CONSTS` block and are checked by the Verify tab against OBBBA (P.L. 119-21 §70103) on every load** — through v5.30 they were inline literals inside the tax engine, which no staleness mechanism could see, so the Verify tab rendered green on constants it had never checked. The deduction is fused to its statutory sunset: the engine applies it only for tax years through 2028. **That fuse fails safe in the conservative direction.** If the provision expires as written the model is correct; if Congress extends it, the model omits the deduction and therefore *overstates* tax, making the plan look slightly worse — the direction this project picks whenever an assumption must be chosen. The genuinely harmful direction, continuing to apply an expired deduction, is the one the fuse makes impossible. One consequence is worth naming because it touches recommendation-shaped output: an extension would overstate tax in conversion years, which feeds the Roth bracket-fill solver and would make conversions look slightly *less* attractive than they are;
future law is "current law, inflated."

## 6. State tax module (v5.5)

Replaces the former single flat rate with a **51-jurisdiction rules table** (50 states + DC),
2026 vintage. Per state: an *effective flat approximation* of the (often progressive) schedule
for a typical retiree; Social Security treatment (43 jurisdictions none; the eight partial states
— CO, CT, MN, MT, NM, RI, UT, VT — approximated as taxing half the federally-taxable portion,
since their income thresholds exempt most retirees; WV's phase-out completed for 2026);
full retirement-income exemptions (IL, MS, PA, IA 55+, MI post-phase-in, plus the nine
no-income-tax states); and major 65+ retirement-income exclusions where they exist (e.g., GA
$65K/person, KY $31,110, NY $20K, NJ up to $75K income-limited, VA $12K, SC $15K, DE $12.5K).

One shared calculator serves the Taxes engine, the Roth strategy comparator, and the Withdrawal
engine, so the three can never disagree. Selecting no state preserves the legacy flat-rate
behavior exactly (backward compatible with every existing backup).

**This is an approximation layer and is labeled as such in the UI.** Not modeled: progressive
state brackets (effective rate instead), county/city income taxes (IN, MD partially folded, NYC
not), income limits on several exclusions (NJ, VA, RI approximated as unconditional), state
standard deductions/credits, pension-source distinctions (AL/HI DB exemptions), and WA's
capital-gains excise. Verify your state.

## 7. Roth conversion modeling

**Standard deduction on the Roth tab (v5.20).** The conversion-ladder projection now applies the
§63(f) age-65 additional standard deduction — $1,650 per spouse MFJ, $2,050 single for 2026, indexed
— through the same shared helper Engines A and B use. Before v5.20 it applied the base deduction
only, so it overstated the tax on conversions made at 65+ and disagreed with the strategy comparator
directly below it on the same tab. Separately, and deliberately, neither the ladder nor the
comparator models the OBBBA $6,000 bonus senior deduction (tax years 2025–2028): it expires before
typical conversion windows, and modelling it would make the bracket-fill solver circular, since the
deduction depends on MAGI which depends on the conversion being solved for. The Taxes tab does model
it, so the two tabs differ for any ladder year at or before 2028.

**Required minimum distributions in the ladder table (v5.41).** The conversion-ladder projection
now includes each spouse's required minimum distribution in the years the ladder overlaps their RMD
window. Through v5.40 it omitted the term entirely, so for any household whose ladder runs past its
RMD age the tab understated MAGI, taxable income, tax, marginal rate and 24%-bracket headroom in
exactly those years — on the shipped example household by $44,991 in 2039 and $46,902 in 2040, a 37%
understatement of MAGI, in the direction that flattered the plan.

The distribution is computed on the **prior 31 December balance** divided by the Uniform Lifetime
Table divisor for the age attained in the distribution year (IRS Pub. 590-B App. B Table III),
with the applicable age set by SECURE 2.0 §107 (73 for births 1951–1959, 75 for 1960 and later)
through the same shared `rmdDivisor` / `rmdStartAge` helpers every other engine uses. Dividing the
*grown* balance instead — the natural mistake, since the loop grows before it converts — inflates
every distribution by one year's growth and is silent: nothing throws and the figures stay
plausible. That basis is asserted directly rather than inferred from the divisor.

An RMD is ordinary income, so the term enters three expressions and not one: the IRMAA MAGI figure
(42 U.S.C. §1395r(i)(4)(A) — AGI plus tax-exempt interest, and a required distribution is a taxable
IRA distribution), the §86 provisional-income base that sets the taxable share of Social Security,
and gross taxable income. Omitting it from the §86 base understated taxable Social Security, which
understated MAGI a second time; **the two omissions compounded**, which is why the correction is
larger than the distribution alone in households whose provisional income sits near a threshold.

**One Traditional balance, not two (v5.41).** The tab previously carried two independent projections
of the same quantity: the ladder table grew the balance and then subtracted the conversion, while
the RMD cards below it subtracted the conversion and then grew. Both were rendered. The difference
compounds at conversion × growth per year and reached $48,712 — 3.78% — by 2040 on the example
household. The ladder table's grow-then-convert projection is now the single source and the cards
read it. Where the two disagreed, the retained one is the conservative choice: the higher balance
yields the larger required distribution, so the correction raises the RMD figures the tab reports.

Two consequences follow mechanically. The distribution now **leaves the account**, so the projected
Traditional balance falls faster once RMDs begin — without this the money would enter income while
the balance carried on as though it had never been withdrawn, replacing one inconsistency with
another. And the modelled conversion is **capped at the balance remaining after the distribution is
taken**, matching the rule the IRMAA engine already applied; measured across the full slider range
this cap changes lifetime conversions by at most $252 in the worst configuration found and by $0 on
every household measured, so it was adopted for consistency between engines rather than for its
effect. Each spouse's conversion is drawn only from within their own ladder window — the window
ending the year before that person's RMDs begin — which is the split the RMD cards already used.

**Social Security is phased in under §86, not stepped (v5.42).** Above the adjusted base amount
($44,000 married filing jointly, $34,000 single) the includible share of benefits is
`min( 0.85 × benefits, 0.85 × (provisional − adjusted base) + min( para1, ½(adjusted base − base) ) )`,
where `para1 = min( ½ × benefits, ½ × (provisional − base) )` per §86(a)(1). Through v5.41 this tab
took the upper tier as a **cliff** — it assigned the full 85% of benefits the moment provisional
income crossed the adjusted base, skipping the phase-in entirely. The two expressions converge only
once the 85%-of-benefits cap binds, at provisional income of about $92,141 on the example household;
below that the cliff overstated the taxable share, by up to 5.3× and by as much as $38,030 of MAGI in
a single year. Both thresholds are selected by filing status per year, so a survivor's years use the
single-filer pair.

**This correction runs in the OPTIMISTIC direction**, which is unusual here and is stated plainly for
that reason: MAGI, taxable income, tax, marginal rate, bracket headroom and IRMAA risk all fall for
affected households. The convention elsewhere in this document — pick the conservative assumption
when one must be chosen — applies to *assumptions*. This was not an assumption but a misreading of a
statute, and the statute governs.

**The tab is now more correct than the engine it reconciles to.** The IRMAA engine does not implement
§86 at all: it treats 85% of benefits as taxable regardless of provisional income. Below provisional
income of roughly $92,000 that engine and this tab therefore disagree, by up to $46,920. The
disagreement is real, documented, and deliberately left standing: correcting the engine is an engine
change with its own regression surface, and it is sequenced with the taxable-income work rather than
carried on the back of a render-block fix. Any future invariant comparing the two must be phrased as
*the term sets are equal, the values may differ*.

**Known limits, unchanged by this release.** The ladder's MAGI still omits dividend income and
realized capital gains, which the IRMAA engine includes; those are a separate and larger correction.
The RMD basis on this tab is each spouse's whole Traditional balance rather than the RMD-bearing
portion of it, so a non-qualified annuity balance entered under Other accounts contributes to the
modelled distribution although it carries none.

The **middle** §86 tier on this tab also remains uncorrected, and was found during the v5.42 work
rather than being previously known. Between the base and adjusted base amounts the statute caps the
includible amount at ½ of benefits; this tab caps it at 85%. It can only bite where provisional
income falls inside that band *and* total benefits are small — under $12,000 joint, under $9,000
single — because above that the overall 85% cap binds first. Swept across the whole band the
overstatement is bounded at **$2,468** joint and **$1,850** single, and it is $0 on the example
household. It is the same defect class as the omitted ½-benefits cap in the taxable-income engine and
is scheduled with it. All three of these simplifications run in the conservative direction — they
overstate income — and all are recorded here rather than corrected silently.

- **Strategy comparator:** six named policies (none / fill-12% / fill-22% / fill-24% / stay-under-
  IRMAA / current plan) run through the full deterministic projection; reports lifetime tax,
  IRMAA, NIIT, widow-year tax, ending balances, and after-tax estate (heirs' Traditional taxed at
  an assumed 22%).
- **Solve-for grid (v5.5):** sweeps annual conversion amounts $0–$200K in $10K steps plus the
  four policy strategies (25 cells) and ranks all cells against a user-chosen objective — max
  after-tax estate, min lifetime tax+IRMAA, or min widow-year tax. Deterministic single-path
  (fixed growth, current law). Framed deliberately as "the model's best cell under these
  assumptions," not a directive: sequence risk, future law, and personal factors live outside
  the grid.

### 7b. ACA premium subsidy (v5.7)

For households retiring before Medicare, the strategy comparator charges every conversion
policy for the marketplace subsidy it destroys during bridge years — the years between
retirement and each spouse's 65th birthday.

- **Law modeled (current law, 2026+):** the ARPA/IRA enhanced credits expired 2025-12-31,
  restoring the original §36B structure: eligibility between 100% and 400% of the **prior
  calendar year's** federal poverty guideline, with a hard cliff — one dollar of MAGI past
  400% and the credit is zero. Subsidy = max(0, benchmark silver premium − applicable% ×
  MAGI), with the applicable percentage interpolated linearly inside statutory bands.
- **Primary sources, fetched and verified at build time:** the 2026 Applicable Percentage
  Table from IRS Rev. Proc. 2025-25 (2.10% flat below 133% FPL; 3.14→4.19 to 150%;
  4.19→6.60 to 200%; 6.60→8.44 to 250%; 8.44→9.96 to 300%; 9.96 flat to and *including*
  400%); FPL from the HHS/ASPE poverty guidelines (2025: $15,650 + $5,500/person; 2026:
  $15,960 + $5,680/person — so coverage years 2026 and 2027 use real vintages; later years
  index at the same 2%/yr proxy as the tax brackets). The ENHANCED regime uses the actual
  ARPA table from Rev. Proc. 2021-36 (0% below 150% FPL sliding to an 8.5% cap, no cliff),
  not a flat 8.5% approximation.
- **ACA MAGI ≠ IRMAA MAGI:** the engine recombines components per §36B — AGI-side income
  *plus the untaxed portion of Social Security*. A household living mostly on SS can sit
  on the wrong side of the cliff while its taxable income looks harmless; the test suite
  includes a case where the cliff is crossed at an $8,601 conversion where taxable-income
  math would have said $32,601.
- **Accounting:** a hidden zero-conversion baseline runs first; each strategy's per-year
  subsidy is subtracted from the baseline's, the difference accumulates as **ACA SUB LOST**
  and is charged against the taxable balance in the year incurred (so ending balances and
  the after-tax estate reflect it). The no-conversion row loses $0 by construction. Timing
  is same-year (no lookback — unlike IRMAA).
- **STAY UNDER ACA CLIFF solver:** bridge years convert up to 400% × FPL − other ACA MAGI −
  a $500 safety margin (full SS counts, so no taxability fixed point is needed); post-
  Medicare years fill the 24% bracket. Hidden under the ENHANCED regime, where no cliff
  exists. A $0 bridge-year conversion is reported as the finding it is.
  **Since v5.10.1 the solver also nets out its own funding-sale gains:** when the
  conversion tax is paid by selling appreciated brokerage, the sale's realized gains land
  in ACA MAGI, so the solver estimates the year's full tax bill at the candidate
  conversion (mirroring the engine's own tax math), grosses the sale up exactly as the
  funding model does, and subtracts the implied gain from the cliff headroom — a small
  fixed-point iteration, so the *post-sale* MAGI lands at cliff − margin rather than the
  pre-sale MAGI. Before this, the strategy converted to the cliff and its own funding sale
  pushed the household over it (full subsidy forfeit).

  **v5.34 corrects three things about that solver, and retracts a statement made here.**

  - *The gain fraction is now the EFFECTIVE one, not the declared one.* The declared share
    describes only the OPENING basis; under the v5.34 basis tracker the pool accrues gain
    from growth whatever that opening was, so a household that declared 0 still realizes
    gain on sale. The v5.10.1 guard read the *declared* fraction. That was consistent while
    the funding sale read the same declared fraction, and became wrong the moment the
    tracker landed: the guard then treated the shipped default of 0 as "no gain ever" and
    skipped the contraction while the sale went on realizing gain. Measured against the
    pre-fix v5.34 build on the ACA-bridge household, **$39,454 of subsidy fell to $23,828
    with two bridge years forfeited** — from the strategy built to avoid exactly that. The
    guard now asks what actually holds: is there gain in the pool, and is there a pool.
  - *Withholding is no longer excluded, and the previous claim here was wrong.* This
    passage used to state that "withholding and gain-free funding were already correct and
    are unchanged." **That is retracted.** Under withholding the conversion absorbs only
    min(conversion, tax due), so a residual bill still reaches the brokerage; and after the
    change below, the subsidy-replacement sale is a real taxable-pool sale in every funding
    mode. Measured, the declared gain share moves the outcome under withholding on **v5.33
    as well** — so this was a pre-existing error in the documentation, which v5.34's work
    exposed rather than created.
  - *The subsidy the conversion destroys is itself paid by selling, and that sale's gain is
    now in ACA MAGI too.* Without this the solver left headroom for the funding sale and
    was then pushed over the cliff by the premium sale — the identical failure one step
    later. It is a bounded three-pass contraction mirroring the one the ACA block runs.

  **One implementation note, because it is a departure worth stating.** Folding the
  premium sale into the estimate makes that estimate *discontinuous* in the conversion
  amount: the subsidy is a cliff, so the loss jumps the instant a candidate crosses it
  (measured jump $6,481 on the bridge household in 2027). The fixed-point loop then
  oscillates with period 2 and returns whichever phase its pass count lands on. The
  estimator therefore prices the subsidy at the solver's **target** (cliff − margin) rather
  than at the candidate. This removes the discontinuity from the *search path* without
  moving the *answer*: at the converged conversion, MAGI is at or below the target by
  construction, so the clamp is inactive there — verified inactive at the answer in every
  year of four measured households — and where no conversion can get under the cliff the
  conversion is already pinned to 0 or to the available headroom, which the clamp cannot
  change because the estimated gain is never negative.

  **Fixed at v5.38** (previously "disclosed, not fixed"): the subsidy-replacement sale is
  now treated like the funding sale end to end. The sale grosses up fixed-point for the
  long-term capital-gains tax its own gain owes (gains stack on the year's ordinary income,
  dividends, and the funding sale's gain, in that order); the gain's tax is charged; and
  the gain enters the IRMAA two-year lookback alongside the funding sale's — so a sale at
  62–63 can surface as a Medicare surcharge at 64–65+. Households whose gains fall inside
  the 0% long-term bracket see no change even though the gain is realized — measured to be
  the common case at modest conversion sizes. One asymmetry this release deliberately does
  **not** address, recorded as its own finding: **neither** sale's gain reaches NIIT or the
  state-tax module's capital-gains input — only dividend income does. That is optimistic
  where it binds (large gains on high-MAGI households, or gains in a taxed state), and it
  is stated here rather than left silent.

  The gain share remains one blended figure, now *tracked* rather than fixed at the
  declared value: still no per-lot selection, loss harvesting, or wash-sale logic (out of
  scope, as documented).
- **Assumptions:** benchmark premium is user-supplied (it varies ~3× by county and age and
  cannot be checked by the model); premiums grow at household inflation + 2 points (medical
  trend has historically outrun CPI — plain inflation would understate losses, the
  anti-conservative direction); when one spouse has reached Medicare, half the household
  premium is assumed (prorated by heads); a widowed survivor is assumed to be the younger
  spouse (maximizing bridge exposure — conservative). Household size for FPL defaults to
  the plan's household; users with marketplace dependents can override it.
- **Not modeled, stated in-app:** below 100% FPL the model shows $0 and defers to Medicaid —
  **in both law scenarios (v5.32; through v5.31 the enhanced branch applied no floor at all and
  paid the full benchmark premium down to zero income)**. That $0 is a PLACEHOLDER for coverage
  this model does not price, not a computed result, and the two are visually identical: above the
  400% cliff $0 is what the statute gives you, below the 100% floor $0 is what this app says when
  Medicaid is what actually governs. From v5.32 the engine records which bridge years fall below
  the floor, and at what depth, and the Roth strategy table names them and excludes them from its
  improvement claim. **The discontinuity itself is unchanged**: one dollar of MAGI across the line
  still moves the modelled subsidy by nearly a whole benchmark premium, and a change that lifts a
  household back over the floor will still read as an improvement of that size. v5.32 makes that
  artifact visible and excludable; it does not remove it. Also not modeled: Alaska/Hawaii
  guidelines; cost-sharing reductions, silver loading, and plan choice. The law-scenario toggle
  (CURRENT LAW vs ENHANCED EXTENDED) is a user-owned stress choice, mirroring the Social Security
  depletion scenario — never a forecast.
- **Scope (v1):** subsidy math is confined to the Roth strategy comparison. Expense rows
  remain exactly what the user entered — the in-app note by the premium field ("enter your
  GROSS premium here; keep your expense rows as what you actually pay") is what prevents
  double-counting, and extending subsidy awareness into the trajectory/MC engines is a
  deliberately separate future decision.
- **Verification:** 8 new checks on the in-app Verify tab (53 total), each citing its
  source; engine behavior hand-verified to the dollar in the Node suite (mid-scale subsidy,
  cliff ±$1, the SS add-back case, proration, premium-path compounding, solver landing,
  ENHANCED-regime interpolation, $0-premium inertness, and old-backup import defaults).

## 8. IRMAA

2026 tiers per CMS with the statutory **2-year MAGI lookback** modeled explicitly.

**On the surcharge figures.** The tier *thresholds* are the CMS 2026 figures exactly. The per-person
combined Part B + Part D *surcharge* amounts are carried as **approximate annual values, rounded to
the nearest $10** — within **$5/person/year** of the CMS-exact figure at every tier (the source
labels them approximate at the constant, and `t17` asserts that $5 bound against the published
monthly Part B and Part D amounts, so the rounding cannot quietly widen). Worst case on a 25-year
projection for a couple at the top tier is roughly $240 of lifetime surcharge, in a mixed direction.
This paragraph is new at v5.18: the rounding was already disclosed in the source and recorded by the
Phase 2B audit, but this page said "2026 tiers per CMS" without qualification, which claimed more
precision than the constants carry. Roth
conversions and QCDs both flow through (conversions raise MAGI two years out; QCDs lower it).
Cliff behavior is preserved — one dollar over a threshold applies the full tier surcharge.

**Threshold indexation (corrected v5.14).** Two rules govern how the tier boundaries move, and both
were wrong before v5.14:

- **Thresholds belong to the PREMIUM year, not the income year.** CMS applies the *premium* year's
  table to MAGI from two years earlier — the lookback shifts the income, not the table. Through
  v5.13 both engines shifted both, under-indexing every boundary by two years (~3.9%) and
  **over-charging**. At premium year 2046 the first Single boundary was modeled at $155,679 where
  the law puts it at $161,968.
- **The top tier is frozen.** BBA-2018 §53114 created the $500,000 / $750,000 tier and froze it
  through **2027**, indexing it by CPI-U only from **2028**, off that frozen base. Through v5.13 the
  engines inflated it every year like the others. The Verify tab had labelled it "top tier fixed by
  law" since v5.7 — a claim the arithmetic contradicted; it is now asserted rather than printed.

Both rules now live in **one shared module-level helper**, called by every site that needs an IRMAA
threshold. They were previously copied into four separate loops across two engines, which is how
both defects survived three releases — and how a fifth copy drifted to a different inflation rate
entirely (recorded separately as finding C-2B-3, not yet fixed).

From
v5.13 the planner also models the first death: the survivor keeps only the larger Social Security
benefit, is scored against the Single thresholds from the year after the death, and is charged for
one person rather than two. See the survivor section below for why all three ship together and for
the year each takes effect.

## 9. Withdrawal sequencing & guardrails

Cash-first sleeve sequencing (cash → bonds → equity → hedge), RMDs treated as forced Traditional
withdrawals, and Guyton-Klinger–style guardrails at 80%/120% of the planned balance path with
spending adjustments on breach. The comparison table presents cash-first, tax-optimized, and
fixed-real strategies descriptively.

**Where the RMD comes from (v5.35).** Through v5.34 the sentence above was true of the tax
*treatment* and false of the *sourcing*: the engine folded the RMD into a single withdrawal need and
satisfied the whole of it from the taxable sleeve first, then returned the unspent part to the same
pool. Balance-neutral, and therefore invisible for many releases — but an RMD is a distribution from
the retirement account and cannot be met by selling brokerage.

From v5.35 the required amount is decomposed by **where the money actually sits**, using the same
arithmetic that produces it, so the parts sum back to the cent:

- the share resting on the Traditional buckets is drawn from B1 → B4 in sleeve order;
- the share resting on a **named IRA entered under Other accounts** is drawn from that account,
  which has lived in the first-priority pool since v5.26;
- the spending need is then whatever the distribution did not already cover, and only that part
  reaches the taxable sleeve.

Unspent required cash still lands in the taxable account, as before. It arrives **already taxed**,
so it dilutes that pool's ordinary-income share rather than adding to it.

**Two consequences for figures, in opposite directions, both disclosed in the app.** Ending balances
*fall* on affected households, because money that used to keep compounding in the tax-deferred
sleeve now sits in a slower-growing taxable one — the plan looks slightly worse, which is the
conservative direction. And `Total withdrawn` *falls*, because it had been counting the same cash
twice as it round-tripped out and back.

**Each required dollar now reaches MAGI exactly once.** It had been counted twice — once as the
distribution, and again through the draw that funded it — because the same Other-accounts money was
tracked both as ordinary income and as the subset carrying a required distribution. The
overstatement was conservative at first and turned optimistic later, as the pool's ordinary
character was spent on paper while its balance stood untouched.

**Stated approximations that remain.** `Total withdrawn` counts every dollar that leaves an account,
including required cash the plan never needed to spend — it is a distribution total, not a measure
of spending, and the Withdrawal tab says so. A draw from the first-priority pool is still taxed in
proportion to what that pool holds rather than by draining one type before another, and that
proportion is measured before the required distribution takes its own fully-ordinary slice; whether
it should be recomputed on the remainder is an open question, not a settled simplification. Engine D
still applies no tax to balances.

## 10. Other engines, briefly

Survivor modeling (filing-status switch to single, one SS check, survivor spending factor, widow
tax squeeze) — implemented per engine, with the coverage table in the survivor section below rather
than claimed uniformly here; ACA bridge with subsidy-cliff awareness pre-Medicare; HSA contribution cutoff at
Medicare enrollment (with the 6-month lookback); reverse stress solver ("What Breaks"); event/
deadline calendar; estate-readiness checklist.

## 10b. v5.6 additions (summary)

Since the sections above were first written, the model gained: a **conversion-tax funding
model** for Roth conversions (a sale creating no taxable profit — cash, money markets, or a
low-growth account — vs an appreciated-brokerage sale — with a
fixed-point gross-up so each sale covers the capital-gains tax it creates, LTCG stacking on
the year's income, and realized gains feeding MAGI for the two-year IRMAA lookback — vs
withholding from the conversion itself, where only the net reaches the Roth; 59½+ assumed,
one blended gain fraction — tracked, not fixed at the declared opening share — with no
per-lot logic by design); **spousal Social Security analytics**
(per-spouse breakeven cards including the couple's-horizon correction — the lower earner's
record pays only until the first death — plus an 81-combination joint claiming grid with
survivor step-up, undiscounted today's dollars, spousal top-ups not modeled); a **guided
first-run wizard** that synthesizes a three-position portfolio and two-phase expense
schedule through the same apply/persist pipeline as every other load path; **Simple Mode**
(a persisted six-tab view); a **Dashboard** summarizing Monte Carlo success, spending vs
guaranteed income, and sequence-stress results; and removal of the FICO peer dimension
(fed no engine; defaulted to a fabricated 800). The validation suite (§12) grew to 48
checks asserting every statutory constant against IRS Rev. Proc. 2025-32, CMS, SSA, and
IRS Pub. 590-B. (The in-app Verify tab currently runs 45 such checks in the merged build.)
Beyond the in-app suite, the merged build was verified by four external Node/jsdom suites —
318 checks total — covering constants and accessors, the seeded Monte Carlo engines under
common-random-number A/B comparisons, the Roth engine against hand-computed tax cases exact
to the dollar, and a full 26-tab DOM render sweep; see VERIFICATION_REPORT.md in the
distribution.

Two further v5.6 engines deserve their own description:

**Social Security trust-fund depletion scenario.** Social Security is mostly pay-as-you-go:
current payroll taxes fund current benefits, with a trust-fund reserve covering the gap since
roughly 2021. Reserve depletion is not insolvency — incoming taxes continue to fund a fraction
of scheduled benefits. Per the 2026 Trustees Report (released 2026-06-09), the OASI retirement
fund alone is projected to deplete in late 2032, with roughly 78% of scheduled benefits payable
thereafter absent new legislation; combining OASI with the (solvent) DI fund would extend full
benefits to Q3 2034 and then pay roughly 83%, but the funds are legally separate and combining
them requires an act of Congress. The model exposes this as a user-controlled scenario:
`SS_HAIRCUT {on, year, pct}` with a `ssDepletionFactor(calendarYear)` multiplier applied at
every point Social Security income is computed — all three quarterly simulation paths, the
deterministic trajectory, the Roth engine's annual benefit helpers, and the household lifetime
totals inside the spousal claiming grid. Because the multiplier is applied to the benefit itself
rather than to a display value, second-order effects follow automatically: reduced benefits mean
less taxable Social Security, which changes provisional-income taxation, marginal rates on
conversions, and IRMAA exposure. Presets cover both Trustees figures plus a custom year and
percentage; the setting persists and invalidates cached simulations. Benefit tables and breakeven
cards deliberately continue to display *scheduled* (pre-cut) amounts so that statutory law and
user scenario remain visually distinguishable. This is scenario arithmetic, not a forecast:
Congress has historically acted before a scheduled reduction took effect, and the model takes no
position on whether it will again.

**Live verification suite (Verify tab).** The Node suite in `validation/` proves a *build*
correct at authoring time; the Verify tab proves a *copy* correct at run time. On each visit it
re-executes 62 assertions against the running instance's actual constants — federal bracket edges
for both filing statuses, standard and senior deductions, LTCG breakpoints, NIIT thresholds,
Social Security provisional-income thresholds and wage base, IRMAA tiers and the derived combined
Part B+D surcharges, the QCD cap, Uniform Lifetime Table divisors, SECURE 2.0 start ages,
the four OBBBA senior-bonus figures and their dated 2028 sunset (added v5.31), and
state-module invariants — each displayed with its actual value and primary-source citation. Two
further checks are statistical rather than declarative: they draw 4,000 fresh Gompertz samples and
confirm the sampled median matches the anchored life expectancy and that the age cap holds. Any
failure replaces the summary with an explicit do-not-trust warning. In a person-to-person
distribution model this doubles as corruption and tamper detection: a modified copy fails visibly
in the hands of whoever holds it.

## 11. Data architecture & privacy

All computation is client-side. Data lives in browser storage only; the HTML/JSX file is never
modified; exports are explicit JSON. The optional Ask AI call transmits a structured plan summary
(names, ages, state, balances/mix, SS/pension, headline results), the typed question, and any
explicitly attached files — nothing else — to the Anthropic API, authenticated by the platform
inside claude.ai or by a user-supplied key (browser-storage only, never in files or backups) when
self-hosted. Two v5.5 additions: a persisted **Offline Mode** toggle hard-disables Ask AI entirely
(fully air-gapped operation), and self-hosted copies can route Ask AI to a **local OpenAI-compatible
endpoint** (Ollama / LM Studio) so the summary never leaves the user's machine — text-only, with a
documented quality trade-off versus the hosted model. The manual's §10 carries the complete
transmitted/not-transmitted table. Since v5.10.1, **Clear All Data honors the manual's promise
in full**: confirming the wipe deletes every storage key — plan, preferences, and the API key
(credentials never survive a wipe) — and returns the app to the landing screen; previously the
button overwrote the plan with a blank one and left the key and preferences in browser storage.

## 12. Validation & known limitations

The `validation/` folder contains: statutory-constant checks (brackets, IRMAA tiers, QCD cap,
RMD table, state-rules sanity) with citations; the Gompertz median check; and headless behavioral
suites (26-tab render sweep; QCD reduces lifetime tax and MAGI; income-fallback banner fires on
legacy data and stays silent on honest zeros; BYOK key handling per environment; iOS share-sheet
export paths; state-module ordering test TX=IL < GA < CA; solve-for grid; MC toggle effects).

Not yet done, in honesty: **independent professional (CPA/EA/actuary) review** — the single
most valuable outstanding validation, and the reason the trust case remains self-referential;
golden-file cross-validation against Pralana/ProjectionLab on identical inputs; state progressive
brackets (the state layer uses effective rates); ACA premium-subsidy modeling; and stochastic
health-state modeling.

A gap called out in earlier revisions is now closed: **other income streams are a first-class
module.** Each stream (rental / job / annuity / other) carries a monthly amount in today's
dollars, an inclusive start/end-year window, an owner (either spouse or joint — an owner's
stream ends at that person's projected or sampled death), a COLA flag, and taxable vs tax-free
treatment. Streams flow through every engine — planned trajectory, both Monte Carlo engines,
what-breaks, the withdrawal schedule, the tax engine (job rows also pay FICA up to the wage
base), IRMAA MAGI, and the Roth optimizer. Entering any stream replaces the built-in example
part-time taper, and the old negative-expense-row workaround is superseded (moving such rows
into the module lets the tax engines see the income). Remaining honest limits of the module:
one amount per stream (no per-year schedules), annual granularity on the window, and no
state-specific treatment beyond the state layer's ordinary handling. These are the known
edges of the map.

**Resolved at v5.26 — Other accounts are classified and taxed (was disclosed at v5.24).**
Through v5.25, Engine D derived its first-priority pot as `household − total401k`, so **every account
entered under Other accounts landed in it** — including any the user named as a Rollover IRA,
Traditional IRA, annuity or state plan — and the whole pot was treated as already-taxed brokerage
principal. Draws never entered MAGI, growth was never taxed, and none of it reached the balance RMDs
are computed on. On the shipped example household that was $147,000, of which $111,000 (76%) is not
already-taxed money. The direction mattered: it made a plan look **better** than it is, the wrong way
for a deliberately pessimistic tool to be wrong. v5.24 stopped the app denying it; v5.25 recorded the
classification without using it; **v5.26 uses it.**

Each Other account carries a tax type — Taxable, Traditional, Roth, HSA, or Annuity. Two facts are
tracked separately, because they have different answers:

- **Taxed as ordinary income when spent:** Traditional and Annuity.
- **Subject to a required minimum distribution:** Traditional only.

A **non-qualified annuity** is the reason those are two questions rather than one. It is taxed like
pre-tax money but carries no RMD; recording it as Traditional (which v5.25 did, and disclosed as an
approximation) would manufacture a legal obligation the owner does not have and force money out
early. It therefore has its own type. The residual approximation is that an annuity is part
after-tax basis, which a single label cannot express — Annuity treats all of it as ordinary income,
the pessimistic direction. A **qualified** annuity held inside an IRA does have an RMD, and the
name-inference will mis-classify one; the field is user-correctable for exactly that reason, and any
row it re-classifies is named in the review notice.

**What did not change.** The draw order: Other accounts are still spent first, and this release
deliberately did not revisit that. **HSA balances remain outside the tax split** — spent as
already-taxed cash — consistent with the contribution-accrual treatment adopted at v5.10; that is a
simplification, and HSA money is tax-free only for qualified medical costs. The Monte Carlo is
untouched: it reads `household` and the bucket weights, neither of which classification affects,
which is why cross-version engine parity remains strict through this release.

**One stated simplification in Engine D.** Because the money physically sits in the first-priority
pot rather than in the bucketed portfolio, a draw from that pot is taxed **in proportion** to what
the pool holds, rather than by draining one tax type before another. A consequence worth stating:
since Other accounts are spent early and RMDs begin at 73+, most of this money is gone before any RMD
applies, so the RMD effect inside Engine D is small — the larger effect lands in the Roth, Taxes and
IRMAA engines, which read the retirement-start basis. Ownership drives whose RMD age applies, so
Traditional, Roth and Annuity rows cannot be held jointly; migration promotes such a row to person A
and says so.

Two related notes, so the limitation is not read wider than it is. First, Engine D's MAGI expression
correctly **excludes** taxable-brokerage withdrawals: such a draw is mostly return of basis, and only
realized gain is income. Adding the whole draw to MAGI would tax returned principal at ordinary
rates. Engine B applied the same simplification **through v5.35** (realized capital gains defaulted to $0
unless a sale was modeled), so the two engines were consistent here. **From v5.36 that is no longer
true and this parenthetical is historical:** the drawdown realizes gains on ordinary spending from
the taxable sleeve, Engine B consumes them, and both the Taxes tab and the IRMAA lookback see them —
see "Capital gains in the drawdown, and where they are taxed (v5.36)" below. The classification
argument in this section is unaffected and still current. The defect is the classification feeding MAGI,
not MAGI itself. Second, the phrase "taxable (non-retirement) sleeve" still appears on the Taxes tab
and in code comments; there it describes a different quantity — the part of a bucketed position that
is neither Roth nor Traditional — and is accurate.

**Fixed during merge verification (previously present in all v5.6 builds):** after the second
death in `runExtendedMC`, the engine pushed a portfolio snapshot every *quarter* while living
years snapshot annually — inflating path lengths, stretching the post-death time axis, and,
under stochastic longevity (where death times differ per path), producing ragged arrays whose
percentile bands read `undefined` in the tail. The dead-path branch now snapshots only at
year boundaries, so every path is uniformly `1 + totalYears` entries regardless of death
timing; headline success/ruin rates were never affected (they read the final element).



## Roth break-even: the wealth-crossover method (v5.7.1)

Earlier builds estimated break-even as (conversion tax paid) ÷ (annual RMD tax saved at an
assumed flat 24%), undiscounted. That construction erred optimistic in three independent ways
(no time value, no opportunity cost on the tax paid, an assumed rather than computed marginal
rate) and is retired. The replacement runs BOTH the chosen strategy and a no-conversion
baseline through the full deterministic engine — actual brackets per year, SS taxation, NIIT,
AMT, state tax, the IRMAA two-year lookback, and ACA subsidies when configured — and reports
the first year the strategy's after-tax wealth catches the baseline.

Two properties fall out of the construction rather than being assumed. Discounting is implicit:
comparing same-year wealth is mathematically equivalent to discounting cash flows at the
portfolio's own growth rate under the active scenario prior. Opportunity cost is mechanical:
conversion-tax dollars actually leave the modeled taxable balance and stop compounding.

The crossover deliberately uses FACE VALUE, not the heir-discounted estate metric. Under the
estate metric, moving a dollar from Traditional (credited at 1 − heir rate) to Roth (credited
at par) manufactures an instant paper gain that masks the conversion tax — reporting every
conversion as paying off immediately. Face value answers the cash question ("when does the tax
I paid come back?"); the heirs'-tax advantage of Roth remains fully captured by the strategy
table's ESTATE ranking, and the card says which question it is answering. Four outcomes are
distinguished: recovered after a deficit (deepest shortfall shown), never behind (conversions
under the standard deduction cost ≈$0 — common before Social Security starts), never recovers
within the plan (real for large conversions with little outside money, where the tax is paid
from the Roth itself), and no measurable difference.

## Per-spouse ownership (v5.8)

Every retirement holding carries an owner. This is not cosmetic: three pieces of law are
per-person and were previously modeled at the household level.

**RMDs run as two streams.** Each spouse's required distributions begin at that person's own
SECURE 2.0 age (73 for 1951–59 births, 75 for 1960+) on that person's own balance, using the
Uniform Lifetime divisor at that person's age each year. The prior model applied Spouse A's
age to the pooled balance — overstating early RMDs and understating the conversion window for
mixed-age couples.

**Conversions are per-person.** A conversion moves money from one person's Traditional into
THAT SAME PERSON'S Roth — there is no such thing as a spousal conversion, and the model no
longer implies one. Each spouse's dollars are convertible only inside that spouse's own window
(retirement through the year before their own RMDs); the household ladder therefore runs to
the LATER of the two windows.

**Solver allocation is a stated representation choice.** When a household-level solver (fill a
bracket, stay under IRMAA, stay under the ACA cliff) picks a total conversion, the amount is
split between spouses in proportion to each person's convertible headroom, capped by it.
Proportional allocation is neutral plumbing, not advice: per-spouse sequencing (for example,
draining the older spouse's account first to shrink the nearer RMD) can be superior in specific
situations and is deliberately NOT optimized. If it is ever added, it will appear as a visible,
comparable strategy in the comparator — never as a silent default.

**Survivor treatment.** On the first death the decedent's retirement accounts roll to the
survivor (the standard spousal election; alternatives such as inherited-IRA treatment are not
modeled), and the survivor's own RMD age governs the merged balance thereafter. Jointly held
taxable accounts simply continue. Taxes and IRMAA remain household-level throughout, which is
correct for married-filing-jointly.

**Which engines implement the above — corrected at v5.11.** This section described the
per-spouse model as though every engine followed it. That was true of the Roth strategy engine
from v5.8, but **not** of the Taxes-tab schedule or the IRMAA planner: through v5.10.2 both held
a single pooled Traditional balance and keyed its RMD to Person A's age unconditionally, so
post-death years computed distributions on the *deceased* spouse's age, and pre-death years
started the younger spouse's RMDs at the *older* spouse's start age. The direction of the
resulting error depended on which spouse was younger — conservative when Person A was the older,
**non-conservative when Person A was the younger** (understating RMD, tax, and therefore
overstating plan survival). **As of v5.11 all three engines implement the per-spouse model
described above**: per-person balances, spousal rollover into the survivor at first death, and
RMDs on each person's own age and own SECURE 2.0 start age. The Withdrawal tab remains the
stated approximation described in the next section.

**Which engines model the first death (corrected through v5.11-v5.13).** Survivor modeling is not
uniform across the app, and this section previously described it as though it were. As of v5.13
every engine in the table models the first death; the table is kept rather than deleted because it
is the record of which release closed which gap.

| Engine | One SS check | Filing switches | Survivor spending | RMD on survivor's age |
|---|---|---|---|---|
| Survivor tab, Monte Carlo, What-Breaks | yes | yes | yes | yes |
| Roth strategy comparator | yes | yes (corrected v5.14) | n/a | yes (since v5.8) |
| Roth **ladder table** (separate from the comparator) | n/a | yes (v5.15) | n/a | n/a |
| Taxes tab | yes | yes (corrected v5.12) | n/a | yes (since v5.11) |
| Withdrawal tab | yes (v5.12) | n/a | yes (v5.12) | yes |
| IRMAA planner | yes (v5.13) | yes (v5.13) | n/a | yes (since v5.11) |

**The year of death (v5.12 for the Taxes tab, v5.13 for IRMAA, v5.14 for the Roth comparator).**
Two things happen at different times, and every engine with a filing concept now separates them —
that qualification matters, because v5.12 and v5.13 stated this generally while the Roth strategy
comparator was still switching a year early (finding C-2C-6, fixed at v5.14). Correcting two engines
and not the third had, for two releases, left the same household filed two different ways in the same
year depending on which tab was open. The **death event** takes effect in the year of death: the survivor drops to the larger of
the two Social Security benefits, and the decedent's retirement accounts roll to the survivor.
**Filing status** changes the year *after*: under IRS Pub. 501 the surviving spouse is treated as
married for the entire year of death and may generally file jointly for it, with Single beginning
the following year. (Qualifying Surviving Spouse extends joint rates further but requires a
dependent child, which this app's population generally lacks, so it is not modeled.) Through
v5.11 the model filed Single for the whole death year — a simplification that over-taxed that one
year, disclosed at the time and **corrected at v5.12**.

**Two stated simplifications that remain.** First, **Social Security drops to a single check for
the whole year of death**, where the deceased's benefit actually runs through the month of death;
a full year at the single check slightly overstates the loss — conservative. Second, the
**survivor benefit is modeled as the larger of the two actual checks**. The RIB-LIM / Widow's
Limit (20 CFR 404.410(c); SSA POMS GN 00615.320) provides that where the deceased claimed before
their full retirement age, the survivor receives the larger of the deceased's actual benefit or
82.5% of the deceased's PIA. Only the first branch is modeled, so where the higher earner claimed
early the survivor's benefit can be understated — again conservative.

**Survivor spending (v5.12).** The Withdrawal tab previously applied the full joint spending level
for the entire post-death stretch. It now uses the shared `SURVIVOR_SPEND_FACTOR` (75%), the same
constant the Survivor tab, Monte Carlo, and What-Breaks use, so the tabs agree. Combined with the
Social Security correction above, survivor-year draw need on the example household falls rather
than rises across the death boundary; the two errors it replaces ran in opposite directions and
partially cancelled, which is why the tab appeared plausible while both were present.

**IRMAA and the first death (v5.13).** Through v5.12 the IRMAA planner did not model the first
death beyond the RMD basis corrected at v5.11. It had three separate omissions, and they did not
share a direction:

| Omission | Effect on the surcharge | Direction |
|---|---|---|
| Both Social Security checks paid for the full horizon | MAGI overstated by the smaller check | conservative |
| Married thresholds retained for a survivor | tier boundary too high by $109,000 at tier 1 | **non-conservative** |
| The deceased spouse still counted per person | surcharge multiplied by two instead of one | conservative |

The threshold omission dominates the Social Security one by roughly eight to one, so the net effect
understated survivor surcharges. **All three are corrected together at v5.13, and that pairing is
not tidiness.** Correcting the thresholds alone would have moved survivors into higher tiers while
still charging both of them — roughly doubling the surcharge, and worse than the defect it
replaced.

Three details of the correction are worth stating, because they are not all keyed to the same year:

- **The Social Security drop is a death-event change** and applies from the year of death, matching
  the Taxes engine.
- **The threshold switch is a filing-status change** and applies from the year *after* the death,
  because IRMAA is assessed against the tax return it is scoring and Pub. 501 permits a joint
  return for the year of death itself.
- **The per-person count follows the premium year, not the income year.** IRMAA is billed two years
  after the income it is based on, so the number of people charged is the number alive when the
  premium is actually paid. A row whose "Affects" year falls after the death therefore charges one
  person even if both spouses were alive in the income year. The tab discloses this beneath the
  year-by-year table rather than leaving the apparent inconsistency unexplained.

**A limitation that remains.** Social Security's life-changing-event redetermination (form SSA-44) — which lets a household ask
SSA to reassess IRMAA on more current income rather than on the two-year-old return — is not
modeled. The enumerated events include **work stoppage or reduction, the trigger that applies to
most newly retired households**, as well as death of a spouse, marriage, divorce and loss of a
pension. A household that files one may pay less than the
model projects, so the omission is conservative.

**Where the engines still legitimately differ.** Engines B (Taxes) and C (IRMAA) hold Social
Security flat in today's dollars while inflating brackets and thresholds — the deliberate
bracket-creep conservatism described in §5. Engine D (Withdrawal) COLA-indexes it. All three model
the same survivor transition in the same year and keep the same check; they simply do not share a
dollar basis, and the cross-engine test suite asserts the timing and the rule rather than a single
figure.

**Where federal tax facts live (v5.16).** Every filing-status-dependent federal figure — brackets,
standard deduction, the age-65 extra, LTCG brackets, the NIIT threshold, both AMT figures and both
Social Security provisional-income thresholds — is defined once and read by all four tax engines
through a single accessor. Before v5.16 each was written out separately at two to four sites per fact,
which is the mechanism behind findings F-2B-1, F-2B-2, C-2B-3 and D-2D-2: one fact in many places,
free to drift. **Which facts are inflated is deliberately NOT part of that accessor** — NIIT and the
Social Security thresholds are statutory and unindexed while brackets, deductions and AMT figures are
indexed, and that distinction is exactly what F-2B-2 turned on.

**The Roth tab holds two tax engines, and until v5.15 only one of them worked (finding C-2B-3).**
The conversion-ladder table carries its own arithmetic, separate from the shared Roth engine that
powers the strategy comparator below it on the same screen. Through v5.14 that private arithmetic
hardcoded the **married** standard deduction, brackets, Social Security provisional thresholds and
IRMAA cliff, with no single-filer branch — so a single filer was shown married figures on every row:
about half the correct deduction subtracted, the remainder taxed at brackets twice as wide. On the
example household forced to single, 2029 federal tax rose 72% when this was corrected. It also
inflated its IRMAA threshold at 3%/yr where every other threshold in the app uses 2% — overstating
the cliff by 21.5% by 2046 — while the tab's own assumptions box claimed 2%. Both errors ran the same
direction: they made conversions look cheaper and cliff crossings rarer than they are.

v5.15 derives every one of those constants from the household's filing status, routes the IRMAA
threshold through the shared helper, and switches survivor years to Single the year after the first
death. **The underlying duplication remains**: the ladder still computes its own tax rather than
calling the shared engine. Consolidating them is the recorded intended direction, deliberately not
bundled into a correctness fix.

**What "widow-year tax" counts (v5.14).** The Roth solve-for grid offers *minimise widow-year tax* as
a ranking objective. It accumulates tax across **every year the survivor is alone, including the year
of death itself** — even though that year is now filed jointly and therefore carries no widow's
penalty. The objective is the survivor's burden, not the penalty's duration. Stated here because the
two readings give different rankings and the label alone does not distinguish them.

**Migration.** Backups predating v5.8 carry no owner. On import, retirement rows default to
Person A — the pre-v5.8 model — and a one-time notice in My Data asks for review; other
accounts use their names as hints and default to Joint. Saving writes explicit owners.

## One stated approximation: the Withdrawal tab's schedule view (v5.8.1)

The Withdrawal tab's year-by-year schedule uses a fraction-of-pool accounting model. Its RMD
timing is per-person — each spouse's slice starts at that person's own age — but the owner
shares are held at their INITIAL proportions for the life of the schedule, whereas the Roth
strategy engine reallocates dynamically as conversions deplete one spouse's balance faster
than the other's. The approximation affects the split, not the timing, and is stated here and
in the source rather than implied away. The strategy comparator and solve-for grid, which
drive conversion decisions, use the fully dynamic per-person engine.

## Contribution accrual (v5.10)

**What it does.** For a household still working, the retirement-start balances that seed the
Roth ladder, the strategy comparator, the solve-for grid, the Withdrawal schedule, the Taxes
schedule, the IRMAA planner, and What-Breaks previously equaled TODAY'S positions — every
future contribution between now and the retirement date was silently ignored, understating
the Traditional and Roth pools those engines start from. v5.10 adds the missing dollars: four
monthly fields (pre-tax and Roth, per spouse) accrue from the as-of year to each person's stop
year and are added, per bucket and per owner, to the retirement-start snapshot.

**Nominal dollars, no growth — a stated house rule, not an oversight.** Accrued contributions
are summed at face value: `12 x monthly x years` (plus the bonus-deferral lump for Person A),
with no return applied. Two reasons. First, double-counting: the Monte Carlo already grows
contributions along every simulated path; a deterministic growth assumption inside the
snapshot would bake market return into inputs the MC then grows again. Second, the
conservative house rule that governs every judgment call in this app — where an assumption
must be picked, pick the direction that makes the plan look slightly worse. Undercounting
future growth on contributions understates the starting pools, which understates conversion
headroom and overstates depletion risk. The error is bounded and one-sided.

**Stop years.** Person A accrues to the selected retirement year — the same year the engines
being seeded start from, so the snapshot and the engine agree by construction. Person B
accrues to the household timeline's own `targetRetireYearB`, the identical field the Monte
Carlo's accumulation phase already uses for B's contribution stop — one source of truth, not
a parallel definition.

**One choke point.** All nine consumer sites call a single constructor
(`retireStartBalances`) that reduces positions per owner and adds the accrual per bucket. No
tab computes its own accrual, and the source invariant is greppable: raw Traditional/Roth
position reduces exist only inside the constructor. The one whitelisted exception is the My
Data readout, which previews the accrual from UNSAVED form state by design (its formula
mirrors the helper exactly and is pinned by test).

**Monte Carlo and Trajectory are deliberately unchanged.** They consume the SUM of the split
fields through mirror fields (`monthly401k`, `spouseBMonthly`) that are recomputed on every
load and save — so the MC's inputs are byte-identical to v5.9.2 for a migrated plan, and a
v5.10 backup opened in v5.9.x still reads finite totals. Parity is asserted by test, not
assumed.

**Exclusions and limits, stated plainly.** HSA contributions are excluded from the accrual on
purpose — the HSA is not part of the Traditional/Roth conversion arithmetic these engines
run, and its Medicare-linked contribution cutoff has its own machinery. Working-year taxation
of the contributions themselves is not modeled (the model still taxes nothing before
retirement). Roth 401(k) and Roth IRA money share one Roth bucket, as everywhere else in the
app. There is no employer-match field beyond the existing bonus-deferral machinery; matches
can be folded into the pre-tax monthly amount by hand. The 402(g) elective-deferral limit is
a soft warning with a Verify-tab citation — the model does not enforce it, because catch-up
eligibility and plan specifics are outside its knowledge.

**Migration.** Plans predating v5.10 carry only the old combined monthly amounts. On load
they map to 100% pre-tax (the historically correct reading — the old fields fed a pre-tax
engine), and a one-time notice in My Data says so; saving writes the explicit split. One
pre-existing behavior carried forward unchanged: the form's Person-A pre-tax amount derives
from the per-paycheck entry machinery (v5.9.1), so a plan holding only a monthly total and no
per-paycheck detail shows $0 in that rollup until the paycheck fields are entered — true in
v5.9.2, true now, and now visible in the accrual readout rather than silent.

## Capital gains in the drawdown, and where they are taxed (v5.36)

**What changed.** Through v5.35 the model recorded an embedded-gain share (My Data, added v5.33) and
did nothing with it: the Taxes tab carried a hardcoded `$0` of realized gains, disclosed as such, and
IRMAA MAGI never saw a gain. From v5.36 the drawdown realizes gains and the two tax engines consume
them. Three pieces, in the direction the money flows:

**1 · The gains-bearing sub-pool (Engine D).** The taxable sleeve is heterogeneous: brokerage money
can carry embedded gain; balances entered under Other accounts as Traditional or annuity are taxed
as ordinary income on the way out, and HSA money is spent tax-free — neither can also produce
capital gains. So the engine tracks the brokerage portion as its own balance (`taxGainPool`) with
its own cost basis (`gainBasis`), opened as `max(0, taxable − ordinary − HSA)` with the user's
declared share setting the opening basis split. It grows with the pool, is depleted by sales in
proportion to its share of the post-RMD pool, and is never touched by the sleeve RMD — an RMD is a
distribution, not a sale. A pool with nothing gains-bearing in it holds `taxGainPool === 0` forever
and cannot realize a cent; this is structural, not numerical, and it is what replaced an earlier
inference that misbooked 39.7% of an all-ordinary pool as gain over 33 years. Hand-verified: a fully
independent 25-year forward simulation, never re-synced to engine state, reproduces `taxable` and
the per-year gain with zero error, lifetime gain $215,216 against the engine's $215,216.

**2 · The declared share is the OPENING basis, not a fixed rate.** Growth adds balance to the
sub-pool and no basis, so a plan saved at the default share of 0 still accrues — and later realizes —
gain. This is disclosed in-app ("if your numbers moved at v5.36, that is why"). Two recorded
modelling decisions, both taken in the conservative direction: **unspent RMD cash joins the
gains-bearing pool at full cost basis** (it lands in the brokerage account, so its future growth is
a capital gain; entering without basis would tax the same dollar twice, and treating it as
permanently gain-free would be the optimism this app does not take); and gains attach to the
spending sale only, never to the sleeve RMD leg.

**3 · Consumption (Engines B and C).** Realized gains are computed once, by the drawdown, and passed
into the Taxes and IRMAA engines as a year-keyed series built at the call site from the *selected
scenario's* schedule — never recomputed inside those engines, because the drawdown's gain depends
on the scenario preset, which the tax engines do not take: an internal call would show base-case
gains under a stress scenario. In Engine B the gains join qualified dividends at preferential rates
and count as net investment income for NIIT; in Engine C they enter IRMAA MAGI dollar-for-dollar.
Both parameters default to empty, so direct callers and every pre-v5.36 behavior are unchanged.

**Disclosed limitations, with their directions.** (a) *Found during this release and fixed in it*:
Engine B's provisional-income proxy omitted realized gains, which IRC §86 includes — dormant while
gains were hardcoded $0, it would have gone live with the wiring. It now feeds `qdcg_y` into the
§86 test; `t18` pins the fix exactly (a $100K gain drives the taxable share of SS to precisely the
85% statutory cap on a phase-in household) and control C12 reverts it and fires. (b) **Fixed at
v5.37** — through v5.36, growth on Other-account **ordinary** money was never recognised as ordinary
income at all (`taxOrd` did not grow): a $600,000 IRA yielded exactly $600,000 of lifetime ordinary
income however much it compounded — an optimism, measured exactly by `t20`, recorded as E-15, and
extinguished by v5.37 (see the ordinary-growth section below; the same $600,000 IRA now recognises
$724,266 on the test household, the balance plus its growth, and `t20` asserts the excess EXCEEDS
the opening balance so the omission cannot silently return). (c) One blended share and one blended
basis for the whole brokerage pool — no per-lot selection, no loss harvesting, all long-term.

## Ordinary-income growth in the Priority-1 pool (v5.37)

Through v5.36, Engine D's taxable sleeve tracked its ordinary-character balance (`taxOrd` — the
Traditional and Annuity money a household holds under Other accounts) as an opening value that was
depleted by spending and the sleeve's RMD but **never grown**. The consequence, disclosed as
limitation (b) above and recorded as E-15: a $600,000 IRA in that pool recognised exactly $600,000
of lifetime ordinary income no matter how much it compounded before it was spent — every dollar of
growth escaped income tax entirely, an optimism in the one place this app promises pessimism.

v5.37 grows the ordinary sub-pool at the sleeve's own growth rate, in the same step and the same
idiom as the gains-bearing sub-pool: `taxOrd = min(taxable − taxGainPool, taxOrd × (1 + g))`. Three
design choices, each deliberate. **One growth line, not a new ledger** — the verified attribution
machinery (the ordinary fraction, the sale split) is untouched, so every figure that moved at v5.37
moved for exactly one reason. **Ordered caps** — the gains pool keeps its existing cap against the
whole pool and ordinary caps against the residual, so `taxOrd + taxGainPool ≤ taxable` holds every
simulated year by construction; the HSA share is the untaxed remainder (its exclusion is a
disclosed simplification, unchanged). The cap's binding year would be locally optimistic and is
therefore watched, not assumed away: `t19` re-derives the whole ledger independently every run and
reports any year the cap binds — measured at ship, it binds zero years, because **the growth rate
is the sleeve's own** (`growth.tax`): these dollars live in the taxable pool and already compound
at that rate, so both sub-pools grow in lockstep and conservation holds with no squeeze.

Measured effects at ship, all derived by an independent simulator (its own IRS Pub 590-B divisor
table) before the engine was edited and matched by the engine to six decimals: the `t20` test
household's lifetime ordinary excess moved from exactly the $600,000 balance to $724,266 (the
balance plus $124,266 of growth recognised on the way out); the `t19` mixed household's lifetime
MAGI rose $30,074 while its realized capital gain was unchanged to the microdollar (the edit cannot
reach the gains side — `taxOrd` feeds MAGI and nothing else, verified by AST census). Engines A, B
and C are byte-identical at this release; the Taxes and IRMAA tabs cannot move. What can move for a
user is Engine D's per-year MAGI and therefore the Withdrawal tab's bracket column, when the added
ordinary income crosses a bracket edge — in the conservative direction, taxes higher, never lower.
Traditional and Annuity rows still recognise identical lifetime ordinary income (both grow, both
are taxed once on the way out; the RMD changes when, not whether — asserted exactly by `t20`, a
property of households whose pool exhausts within the plan horizon).
