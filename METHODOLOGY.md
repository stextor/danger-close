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
$65K/person, KY $31,110, NY $20K, NJ a $100K HOUSEHOLD cap at 62+ (not per-person), VA $12K, SC $15K, DE $12.5K). **Which of these have been checked against a primary source, and what was found, is recorded in `AUDIT_STATE_EXCL65_NOTES.md` — this section routes there rather than restating it, because a verification claim expires and a dated audit does not.**

**The age at which an exclusion starts is modelled per state (v5.55), not assumed to be 65.**
`STATE_RULES.exclAge` carries a state's own floor and is absent for the 47 states that use 65.
Two are set: **Kentucky attaches no age test in law** (verified against KY DOR Schedule M) and
**Delaware's starts at 60** (30 Del. C. §1106). Before v5.55 every state was gated on a hardcoded
65, which withheld a real statutory exclusion from households below that age and so **overstated**
state tax — the conservative direction, which is why it went unnoticed. Two known thresholds are
deliberately **not** applied: New Jersey's 62, because NJ's cap is a household amount and applying
the age alone would grant a 62-64 couple more exclusion than the statute allows; and South
Carolina's under-65 tier, which is a second amount rather than an earlier start. Both are stated in
their own state notes. **Thirteen of the nineteen exclusion states remain unverified, so more
thresholds may differ from 65 than are modelled here.**

One shared calculator serves the Taxes engine, the Roth strategy comparator, and the Withdrawal
engine, so the three can never disagree. Selecting no state preserves the legacy flat-rate
behavior exactly (backward compatible with every existing backup).

**This is an approximation layer and is labeled as such in the UI.** Not modeled: progressive
state brackets (effective rate instead), county/city income taxes (IN, MD partially folded, NYC
not), income limits on several exclusions (NJ, VA, RI approximated as unconditional — **Virginia's $12K age deduction in fact tapers $1 for every $1 of adjusted federal AGI above $50K single/$75K married, so applying it in full overstates the deduction and understates Virginia's state tax**), NJ's 62 age floor and SC's under-65 tier (both disclosed, neither applied), **Colorado's shared $24K cap between Social Security and pension — a cap the two share rather than one reducing the other, which overstates Colorado's exclusion and understates its state tax**. Maryland's and Maine's exclusions, which are reduced by Social Security received dollar-for-dollar, ARE applied as of v5.56 (§12), state
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

**Each spouse's Social Security starts when that spouse claims it (v5.46).** The conversion-ladder
projection gates spouse B's benefit on B's own claim date, as it has always gated spouse A's.
Through v5.45 B's benefit was added to the ladder's Social Security total in **every** projected
year regardless of when B claimed, so for any household where B claims after the ladder begins the
tab credited benefits that had not started — phantom income in the pre-claim years. Because Social
Security enters the §86 provisional-income base, the error compounded the same way the omitted RMD
term did in v5.41, but in the opposite direction: it raised provisional income, which raised the
taxable share of benefits, which raised MAGI a second time, along with tax, marginal rate and
apparent IRMAA exposure.

The claim year itself is credited **pro rata by calendar month** — benefits from the claim month
through December — which is the treatment spouse A already received, and the reason the correction
is not simply a whole-year switch. For a single filer the term is zero by an explicit test rather
than by inference from missing data: the claim date is constructed for both spouses whether or not
a second spouse exists, so a stored spouse-B benefit surviving in a restored backup would otherwise
still reach the ladder.

**This correction lowers the figures the tab reports**, which is unusual here and worth stating
plainly: removing income the household does not yet have reduces provisional income, taxable Social
Security, MAGI, tax and marginal rate, and widens apparent conversion headroom. It is not a
conservative adjustment in the sense the rest of this document uses — it is a factual one, and the
direction follows from the fact rather than from a choice. **It is worth $0 on the shipped example
household**, whose spouse B claims in January of the ladder's first year, so no figure in the
example data moves; the effect appears only where B claims later. On a household delaying B to 70
with the ladder starting seven years earlier, MAGI falls by $22,950 in each pre-claim year.

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

**The IRMAA engine applies §86 too, as of v5.43.** Through v5.42 it did not: it treated 85% of
benefits as taxable regardless of provisional income, so below roughly $92,000 of provisional income
it and the Roth tab disagreed by up to $46,920 — the app answering one statutory question two ways
depending on which tab was open. That divergence is now closed. Both use the same phase-in and draw
their thresholds from the same source, so an invariant comparing them reads *term sets equal, values
equal*, with no carve-out.

On the shipped household the correction moves three of twenty-five projection years, lowering MAGI by
$4,830–$8,256 and raising the reported headroom to the next IRMAA threshold by the same amounts. It
changes no IRMAA tier and no surcharge. Like the v5.42 correction it runs in the **optimistic**
direction, and for the same reason: this was not a conservative assumption but a statute the model
had not implemented.

**Known limits, unchanged by this release.** The ladder's MAGI still omits dividend income and
realized capital gains, which the IRMAA engine includes; those are a separate and larger correction.
The RMD basis on this tab is each spouse's whole Traditional balance rather than the RMD-bearing
portion of it, so a non-qualified annuity balance entered under Other accounts contributes to the
modelled distribution although it carries none.

**The no-conversion counterfactual grows from the ladder's first year (v5.44).** The RMD cards
compare "if you convert" against "if you never convert". The second projection seeds its balance at
the ladder's start year — planned contributions and all — and through v5.43 grew it with an exponent
counted from the *current* year instead, compounding the gap between those dates twice. On the
example household that inflated the no-conversion RMD by 14.1% ($102,205 against $89,562), and since
that figure feeds the "Combined RMDs reduced by" line, it **overstated what conversions achieve**.
The correction runs in the conservative direction, unlike the two releases before it. Its size is not
a constant: it is (ladder start − current year) years of growth, so it shrinks as retirement
approaches and differs between households.

**Annuity money is still inside this tab's RMD basis (not fixed at v5.44).** A non-qualified annuity
carries no required distribution. Every engine excludes it from the RMD base; the Roth tab does not,
in two places — the no-conversion card's seed and the ladder's own per-spouse distribution. Worth
$483/yr on the example household. Left standing deliberately: correcting one site and not the other
would put the tab's two RMD projections on disagreeing bases, the defect v5.41 was built to remove,
so both sites are scheduled together.

**§86(a)(1)'s half-benefits cap is applied in both places as of v5.45.** The statute caps the
includible amount at half the benefits; the taxable-income engine dropped that cap in its upper tier
and the Roth tab capped at 85% in its middle tier — mirror images, each correct where the other was
wrong. Both overstated, bounded at $2,463 and $2,468 joint ($1,838 / $1,850 single), and both were
confined to households with benefits under $12,000 joint or $9,000 single, above which the overall
85% cap binds first. **The two bands were contiguous at the adjusted base amount**, so a household
with small benefits and rising income crossed from one defect straight into the other; fixing either
alone would have left a discontinuity at that threshold, which is why they shipped together.

The remaining tidy-up items are narrow, both overstating, and both scheduled to ship together rather
than piecemeal, because they are one defect in two places: the taxable-income engine omits the
½-benefits cap in its own phase-in, and the **middle** §86 tier on this tab also remains uncorrected, and was found during the v5.42 work
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
  IRMAA, NIIT, widow-year tax, ending balances, and **estate after heir income tax**
  (heirs' Traditional taxed at an assumed 22%). That figure deducts an heir *income* tax and
  nothing else — **no estate or inheritance tax, federal or state**; see §12. It was called
  "after-tax estate" before v5.50, which asserted a deduction the model never made.
- **Solve-for grid (v5.5):** sweeps annual conversion amounts $0–$200K in $10K steps plus the
  four policy strategies (25 cells) and ranks all cells against a user-chosen objective — max
  **estate after heir income tax** (the default), min lifetime tax+IRMAA, or min widow-year
  tax. Deterministic single-path
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
  the estate figure reflect it). The no-conversion row loses $0 by construction. Timing
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
distribution. (⚠ Those are v5.6-era figures, and `VERIFICATION_REPORT.md` is a frozen
record ending at v5.9.2 — for current suite counts read `CHANGELOG.md`.)

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

**No estate tax or inheritance tax is modeled — federal or state (disclosed at v5.50).** The
strategy comparator and the solve-for grid rank on an estate figure computed as
`taxable + Roth A + Roth B + (Traditional A + Traditional B) × (1 − HEIR_RATE)`. `HEIR_RATE`
(0.22) is an assumed heir **income** tax on drawing down an inherited Traditional balance.

**`HEIR_RATE` itself is an assumption with no statutory source, and it is disclosed as one
from v5.51.** It
lives beside `BASE_GROWTH` rather than in `TAX_CONSTS`, because that block holds official figures
verified against primary sources and this number is not one. No derivation for 0.22 is recorded
anywhere; it matches the federal 22% bracket and was most likely taken from it.

Measured against this build's own 2026 brackets, over the SECURE-Act ten-year drawdown that a
non-spouse heir of a post-RBD decedent faces (annual distributions required, per the July 2024 final
regulations), the effective federal rate on an inherited balance stacked on the heir's own income
runs roughly **13%-31%, median about 24%** across mainstream heir incomes — above 0.22 in 17 of 21
scenarios tested. Adding the heir's **state** income tax, which this figure excludes entirely, moves
a heir at $150,000 joint income from 22.1% to about 27% at a typical 5% state rate. *(Bracket-derived
figures, 2026; they drift as brackets are indexed, which is why the app itself quotes no range.)*

**Direction is split.** Too low a rate credits the Traditional balance too generously, so the estate
figure reads **optimistic** — the same direction as the unmodelled estate tax above, compounding in
the same number. It also under-credits Roth conversion, biasing the *ranking* the cautious way; that
half is the safer error and was left alone.

The value was **deliberately not changed** at v5.51. Substituting one undocumented number for another
moves every comparator figure without making any of them true, and pushes the ranking toward more
conversion — the direction with real consequences for a user who acts on it. It is disclosed on both
user surfaces and pinned by `t1` instead. Making it user-settable is the real fix and is scoped
separately. It is
not an estate tax and not an inheritance tax, and it touches the Traditional terms only — taxable
and Roth balances pass through whole. No transfer tax of any kind is deducted at any point.

This matters more than it looks, for two reasons. First, that estate figure is the **default
ranking objective**, so a household that never opens the objective selector is ranked on it.
Second, a number of states levy estate or inheritance tax at exemption thresholds well below the
federal one, and several of those exemptions have no spousal portability, which makes couples —
this tool's primary audience — the exposed case rather than the protected one.

The direction is **optimistic**: for an affected household the modeled estate is larger than
reality, and so is the apparent benefit of any strategy ranked on it. Optimistic is the wrong way
for a deliberately pessimistic tool to be wrong, which is why it is disclosed on both user-facing
surfaces rather than left to this document. Modeling the tax itself is out of scope — the
thresholds, exemptions, portability rules and rate ladders differ by jurisdiction and are indexed
differently — and it is an estate attorney's question, not a drawdown stress-tester's. Specific
thresholds are deliberately **not** quoted here or in the app: a figure quoted is a figure that
goes stale, and this project has spent real time repairing documents that went stale exactly that
way.

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
modeled. There are **eight** enumerated events and **the list is closed** (20 CFR 418.1205):
marriage, divorce or annulment, death of a spouse, **work stoppage**, work reduction, loss of
income-producing property, loss of pension income, and an employer settlement payment. Work
stoppage or reduction is the trigger that applies to most newly retired households. **A Roth
conversion, a realized capital gain or a home sale is not among them**, so a surcharge this app
shows from a conversion cannot be appealed away — though a one-off spike leaves the lookback on
its own after two years. A household that files one may pay less than the
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

## Two bases the Roth tab and the dividend estimate had wrong (v5.47)

Two corrections that are small in dollars and worth stating precisely, because both are about
**which balance a rule is allowed to read** — the recurring failure mode in this codebase, and the
one that produced the v5.41 divergence and the v5.44 span defect before it.

### The HSA is out of the dividend base — but not out of the spendable pool

`otherTaxableInit()` deliberately lumps `taxable` and `hsa` together as spendable after-tax cash.
That is decision C-4 and it is right: seven call sites depend on it, and "what can be spent, and
what can carry a capital gain" is the question it answers. It is the wrong input to a *taxable
dividend*. A qualified HSA withdrawal is tax-free, so those dollars cannot throw off a dividend
that lands in MAGI. Engine D reached this conclusion at v5.36 and held the HSA out of its
gains-bearing pool (`_gainPoolInit`, citing $36,000 against a true $21,000 on the shipped example);
the three dividend expressions — one each in Engines A, B and C — are the consumer that never got
the same treatment.

v5.47 fixes it **at the three consumers, not in the shared helper**, so the spendable view and the
capital-gain view keep their own correct answer and no new API surface is added: `othHsa` was
already in scope at all three sites. It is subtracted as an **amount, not a share**, unlike the
annuity rule below. The reason is that gross RMDs land in this pool and are fully taxable, so its
taxable fraction *rises* over time; a fixed share would hold out a growing amount and understate
dividends. The amount is both closer to the model and the conservative of the two.

Measured on the shipped example household: dividends fall $720 → $420, so MAGI falls **$300/yr**.
`taxableOrdinary` and federal tax are byte-identical — these dividends sit in the 0% long-term
capital-gains bracket, so **this moves MAGI, and therefore IRMAA and ACA exposure, not federal
tax**. Where a year sits inside §86's upper-tier phase-in the effect compounds to $555, because
$300 less provisional income also removes $255 of includible Social Security.

### The Roth tab's RMD cards no longer count annuity money

A non-qualified annuity is taxed as ordinary income when it is spent but carries **no required
distribution**, so it must not sit in an RMD basis. Every engine has excluded it as
`trad × (1 − annShare)` since v5.26. The Roth conversion tab's two RMD cards did not.

The correction applies the share to **both halves** — the no-conversion counterfactual and the
with-conversion figure — rather than reseeding the counterfactual from `rmdInit*`. Reseeding would
have been the smaller edit and the wrong one: it fixes the no-conversion half while the
with-conversion half keeps reading the ladder's own Traditional balances, leaving two halves of one
quantity on different bases. That is precisely the failure v5.41 removed, when two projections of
the Traditional balance drifted $48,712 apart. The two `*Trad` fields stay on the full Traditional
basis deliberately: they are the balance, not the distribution, and annuity money is genuinely part
of it.

On the shipped example household, spouse B's cards fall $15,070 → $14,587 (no conversion) and
$3,283 → $3,178 (with conversion). Spouse A holds no annuity — `annShareA` is exactly 0 — and both
of A's cards are unchanged to the dollar, which is the built-in negative control for the fix.

### Direction — it is not one-directional, and the tab's headline moves the *unfavourable* way

Both corrections remove overstated income, so headline figures improve. But within the annuity fix
the direction splits: RMDs fall, which looks better, while the tab's "Combined RMDs reduced by"
line falls $41,288 → $40,910 — meaning **conversions now look slightly less effective than the tab
previously claimed**. And the HSA fix moves MAGI without moving federal tax on this household. A
single sentence claiming this release makes the plan look better would be wrong on all three
counts.

## The Roth tab's IRMAA MAGI is narrower than Engine C's (v5.52)

The app computes an IRMAA MAGI in two places, renders both under the label MAGI, and until v5.52
said nothing about the fact that they are different figures.

**Engine C** (`computeIrmaaPlan`, which drives the IRMAA Cliff tab) carries **seven** terms:

```
ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y
```

**The Roth conversion ladder's per-year render block** carries **five**:

```
pension + spouseBWork + taxableSS + conv_y + rmd_y
```

Term by term, the ladder **omits dividends and realized capital gains** — `div_y` and `capGain_y` —
and its earned-income term is narrower again: Engine C's `work_y` covers the household's other
income streams, while `spouseBWork` is one spouse's. v5.41 closed the RMD term only; the comment it
left in the source says Engine C "has always carried its `rmdTax_y` term; this render block did
not, and the two disagreed." They still disagree, in two more terms.

### The consequence, measured

The ladder table's `IRMAA?` column renders a per-year verdict — a warning glyph and the premium
year, or a tick and the premium year — from `triggersIrmaa`, which compares the **narrow** figure
to the threshold. So the verdict inherits the omission.

On a taxable-heavy household, **8 of 8 ladder years render the wrong verdict**: a tick in a year a
surcharge is in fact due. On the shipped example household the understatement runs about **$45,000**
in each of the two years after RMDs begin — enough to matter, not enough to change the tier the
table displays, which is why it is invisible without measuring it.

### Direction

**Optimistic.** Both omitted terms are additive, so leaving them out can only push MAGI down, only
push the verdict toward the tick, and only make the conversion plan look safer than it is. That is
this project's wrong way to be wrong, and it is why the divergence is disclosed now rather than
waiting for the fix.

### What v5.52 did and did not do

v5.52 is **disclosure only**. No engine changed and no computed figure moved — MC parity 10/10 and
the cross-version DOM diff's STRICT branch at 32 are the mechanical form of that claim. The Roth
tab's IRMAA verdict is still wrong for a taxable-heavy household; it is now labelled as narrower
rather than presented as the same figure the IRMAA tab shows. Reconciling the two expressions is a
separate, scoped, not-yet-built change.


## The Roth ladder's IRMAA MAGI carries dividends (v5.53)

v5.52 disclosed that the app computed an IRMAA MAGI in two places under one label. v5.53 closes the
term that mattered: the ladder's IRMAA MAGI now **counts the taxable sleeve's dividends**, as
Engine C always has. The Roth conversion ladder's per-year block now carries

```
pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder
```

where `_divLadder` mirrors Engine C's expression exactly, **including the v5.47 HSA holdout** — a
qualified HSA withdrawal is tax-free, so those dollars cannot throw off a taxable dividend:

```
Math.round(Math.max(0, taxableInitAll() - (_rsbL.othHsa || 0)) * (taxYield / 100))
```

### Why dividends and not the other two terms

Measured at v5.52, engine-exact, on three households:

| Household | omitted per year | across the ladder | wrong IRMAA verdicts |
|---|---|---|---|
| The shipped example, at the app's default 2.0% yield | mean $454, max $762 | $4,542 | 0 of 10 |
| A $1.5M brokerage sleeve at 2% | mean $30,454 | $304,542 | 0 of 10 |
| The same sleeve with MAGI beside the tier-1 threshold | mean $30,420 | $304,200 | **5 of 10** |

**Dividends were essentially the whole effect.** Realized capital gains contributed **$342 across ten
ladder years** on the example household and nothing at all on the two constructed ones. Reading them
out of the withdrawal plan means hoisting a series out of a closure it is currently built outside of,
which is real plumbing for a figure that cannot move an IRMAA tier. They are deliberately left out,
and the app says so.

**Size and harm are unrelated, and that is the useful finding.** The $1.5M-brokerage household
carried an omission of about a quarter of its MAGI and every verdict it rendered was still right,
because its distance to the next cliff ran $98,000–$127,000. The near-cliff household carried the
same omission and read tier 0 in five years where it was actually in tier 1 — failing to warn about
$11,500 of surcharge. What decides whether the omission reaches a user is proximity to a threshold.

### Two terms still differ, and both are disclosed

- **`capGain_y`** — realized capital gains, left out by the decision above.
- **`work_y` vs `spouseBWork`** — Engine C counts the household's other income streams; the ladder
  counts one spouse's earned income. Narrower, untouched by this release.

Both can only add to MAGI, so the residual error remains **optimistic**, and the Roth tab's figure
remains slightly below the IRMAA tab's. The IRMAA tab is the fuller figure.

### One disagreement disclosed rather than reconciled

The dividend base is held **constant** for the whole plan, at `taxableInitAll()`, matching Engine C.
`runRothStrategies` instead tracks a **decaying** `taxBal` as the sleeve is spent down. The two
disagree by construction. Constant is the conservative choice — a higher MAGI held for longer — and
matching Engine C is what makes the two figures comparable at all, which is the point of this
release. Reconciling them is not attempted here.

## The Social Security offset on state 65+ exclusions (v5.56)

Maryland and Maine both reduce their 65+ retirement-income exclusion **dollar-for-dollar by the
Social Security the taxpayer actually received**. Through v5.55 the model applied neither reduction,
granted each qualifying spouse the full cap, and disclosed the gap.
As of v5.56, **Maryland's and Maine's dollar-for-dollar reductions are modelled**.

### The exclusion is now per person, because a count cannot express the offset

The previous rule was `cap × (number of qualifying spouses)`. That form cannot carry the offset at
all: the reduction is a property of an individual's own benefit, and each person's exclusion floors
at zero independently. Two households with identical total Social Security and identical qualifying
counts get different answers, and the old expression had no way to say so. Maryland, both spouses
65, $120,000 of retirement income:

| Social Security A / B | exclusion | state tax |
|---|---|---|
| $10,000 / $50,000 | $30,600 + $0 | **$6,705.00** |
| $30,000 / $30,000 | $10,600 + $10,600 | **$7,410.00** |

The second household's larger spouse-B offset is capped by that spouse's own $40,600, so the excess
$9,400 of the first household's spouse B is not available to shelter spouse A. Both figures were
hand-computed before the engine was changed and matched to the dollar.

### The offset uses gross benefits, not the federally taxable part

Maine's statute counts taxable **and** nontaxable benefits; Maryland's counts all Social Security
received. The engine therefore takes `ssGrossA` / `ssGrossB` — the received amounts — not
`ssTaxableFed`, which is at most 85% and frequently far less. Using the taxable portion would
under-apply the offset and leave the model **optimistic**, which is the wrong direction.

### Direction: figures move UP

This release **raises** estimated state tax for affected Maryland and Maine households. The previous
treatment granted an exclusion the statutes do not, which overstated the exclusion and understated
the tax.

### Two modelled amounts were stale and were corrected in the same release

Maryland's modelled cap moved **$36,200 → $40,600** (2026) and Maine's **$35,000 → $48,216** (2025,
indexed to the Social Security maximum). Both were verified against the states' own revenue
authorities. Correcting the caps in the same release means the direction reported above is the net
of both changes, not of the offset alone.

### What is still not modelled, and is disclosed rather than fixed

- **Railroad Retirement**, which both statutes name alongside Social Security. The model has no
  Railroad Retirement concept at all.
- **Maine's income phaseout** above $125,000 single / $250,000 MFJ.
- **Colorado's shared $24,000 cap**, which covers Social Security and pension together rather than
  reducing one by the other. It is a different mechanism and is deliberately out of scope; Colorado
  carries no offset flag.

All three are stated in the affected states' notes and in Field Manual §13.

### The legacy call path

A caller that supplies only a count of qualifying people, and no ages, cannot supply per-person
Social Security, so no offset is applied on that path. It returns the unoffset exclusion **at the
corrected cap** — the cap fix reaches it, the offset does not. That is asserted explicitly rather
than left to be inferred.

## Two state figures re-checked against the legislatures (v5.57)

Both were flagged **UNRESOLVED** in `AUDIT_STATE_EXCL65_ROUND2.md`, which recorded no verdict on
either. Both are now settled against primary sources, and they resolved in opposite directions.

### Kentucky's rate was stale. It is 3.5% for 2026.

**HB 1 of the 2025 Regular Session**, signed by the Governor on 6 February 2025 (Acts Ch. 1),
amended **KRS 141.020** to reduce the individual income tax rate **from four percent to 3.5 percent
for taxable years beginning on or after January 1, 2026**. The model carried `0.04`.

The audit could not resolve this because the Kentucky Department of Revenue's own Individual Income
Tax page still read *four (4) percent*. The audit noted that page also still cited the Internal
Revenue Code as of 31 December 2024 and guessed it had not been updated for TY2026. That guess was
right: the department's page was stale and the statute was not. **A revenue department's summary
page is a secondary source. The enacting act is the primary one.**

**Direction: figures move DOWN.** Charging 4% where the law says 3.5% overstated Kentucky state tax
by an eighth. Conservative, and wrong — the same shape as the v5.55 Kentucky age gate, and resolved
the same way: correct beats conservative, by explicit decision rather than by default.

Kentucky's rate can fall again. HB 1 continues an annual trigger process under which the General
Assembly may cut the rate for TY2027 and onward, toward zero. **The modelled rate therefore carries
its effective year and its enacting act in the state's own note**, so the next reader can see the
vintage without re-deriving it, and a test asserts that the note and the constant agree.

### Delaware's $12,500 is correct. The bill that would have doubled it is not law.

**HB 108 of the 153rd General Assembly** would have raised the personal income tax pension exclusion
from $12,500 to $25,000. The audit called it *the single largest proportional error found in either
audit round* — **if enacted**. It was not enacted. The Delaware General Assembly's own record shows
it introduced on 8 April 2025, assigned to House Revenue & Finance, and never moved: no chapter
number, no effective date, and empty amendment, committee-report, roll-call and action histories.

**Nothing in the model changes for Delaware.** The figure is pinned, with a note recording why, so a
future session does not "correct" it toward a bill that never passed.

### One Delaware thing that is disclosed rather than modelled

Delaware excludes **United States military pensions** under a separate and more generous rule than
the general 60+ exclusion this model uses. The model has no military-pension concept at all. The
state's note now says so. **No amount is asserted**: separate legislation phasing those figures in
was not resolved against its enacting record, and an unverified number is worse than an
acknowledged gap.
