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
risk, since a crisis quarter would simply be averaged away by the next boom quarter. The "years" here
are counted from the plan's as-of date. The stress tests' *forced* years are calendar years instead
(from v6.19): a forced regime replaces the drawn one quarter by quarter through that calendar year, so
"a crisis in the first year of retirement" covers the four quarters of the retirement year; the random
draw still happens every fourth quarter, forced or not (*The Monte Carlo's calendar*, below).

Why: single-Gaussian Monte Carlo understates fat tails and the correlation between returns and
inflation. A mixture of regimes produces left tails and return/inflation relationships closer to
history without pretending to forecast.

Design decisions worth knowing:

- **Arithmetic-vs-geometric discipline.** Regime returns are calibrated so the simulation's
  compound growth matches the intended CAGR — avoiding the common error of feeding arithmetic
  average returns into a volatile simulation, which double-counts variance drag.
- **A conservative default prior — BULL-LEANING since v5.80.** The scenario weights a run uses come
  from the Scenario Probability Stress presets. Through v5.79 every visit started on **BASE**
  (45/20/15/10/7/3: expected equity return 3.1% nominal, 0.4% real). From v5.80 a first visit starts
  on **BULL-LEANING** (35/40/10/8/5/2: 5.2% nominal, 2.6% real), and a user's own choice is
  remembered in their browser. Bull-leaning was chosen because it keeps history's *frequency of bad
  years* — 10% of simulated years below −10%, against 12% in the 1928–2025 record — while lifting
  Base's very low average. It still sits about 5 points below history's average, so the default
  remains the conservative choice; the HISTORICAL preset matches history's average only by making
  bad years about four times rarer than they were, which is the risk this tool exists to test.
  Success rates typically read lower than tools calibrated to raw history — by roughly 10–20
  points under BASE (the figure this document gave before v5.80); by less under BULL-LEANING, not
  re-measured across households. On the example household the displayed success rate moves only
  from 99.6% to 99.8% (it is well funded); its median balance 25 years out, from $1.96M to $2.11M.
  The Backtest tab shows any plan against actual history side by side.
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
- **Income tax and the expense table** (v6.20). Every run pays, in each year of retirement, the income tax the Taxes tab computes for
  that year, grown with the run's own inflation, and reads the expense table over each quarter's months — see *The Monte Carlo pays the
  Taxes tab's tax (v6.20)* at the end of this document. Through v6.19 its only income tax was a flat $4,000 a quarter during the
  conversion ladder.

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

Annual projection applying, per year, in that year's own dollars: 2026 brackets and standard deductions (Rev. Proc. 2025-32,
incl. OBBBA changes) indexed at the plan's inflation less 0.25 point, the chained CPI the law indexes them by (v6.30; ~2%/yr through
v6.29 — *One dollar unit and one inflation clock for the tax engines*); Social Security taxation via the provisional-income test
(85%-cap tiers); LTCG/qualified-dividend stacking on top of ordinary income, **capped at taxable
income (v5.75)**; NIIT (3.8%,
statutorily unindexed thresholds); a simplified AMT check (standard-deduction add-back method);
FICA on earned income only — Social Security per earner up to the wage base, Medicare uncapped, and the
0.9% Additional Medicare Tax, and on a self-employed job row self-employment tax, both halves (see *Payroll tax on job income*, v6.14, v6.16); RMDs from the Uniform Lifetime Table at the SECURE 2.0 start age;
Roth conversions with bracket/IRMAA interaction; and QCDs (2026 cap $111,000/person, indexed —
excluded from income and MAGI, counting toward the RMD, with the gifted dollars actually leaving
the Traditional balance; from the year of the first projected death only the survivor gives, on the survivor's own age, with one
cap — *QCDs after a death (v6.32)*).

Known simplifications: the provisional-income thresholds are handled in simplified tiers; AMT is
a screen, not a full Form 6251; itemized deductions are not modeled (standard deduction assumed); the temporary OBBBA senior bonus deduction (up to $6,000/person 65+, 2025–2028) IS modeled here, phased out at 6% of MAGI above $75,000 single / $150,000 married filing jointly against a MAGI proxy of gross ordinary income plus qualified dividends and capital gains — those four figures are statutory and unindexed, and the Roth conversion ladder deliberately does not model it (§7), so the two tabs differ for any ladder year at or before 2028. **From v5.31 those figures live in a named `OBBBA_CONSTS` block and are checked by the Verify tab against OBBBA (P.L. 119-21 §70103) on every load** — through v5.30 they were inline literals inside the tax engine, which no staleness mechanism could see, so the Verify tab rendered green on constants it had never checked. The deduction is fused to its statutory sunset: the engine applies it only for tax years through 2028. **That fuse fails safe in the conservative direction.** If the provision expires as written the model is correct; if Congress extends it, the model omits the deduction and therefore *overstates* tax, making the plan look slightly worse — the direction this project picks whenever an assumption must be chosen. The genuinely harmful direction, continuing to apply an expired deduction, is the one the fuse makes impossible. One consequence is worth naming because it touches recommendation-shaped output: an extension would overstate tax in conversion years, which feeds the Roth bracket-fill solver and would make conversions look slightly *less* attractive than they are;
future law is "current law, inflated."

## 6. State tax module (v5.5)

Replaces the former single flat rate with a **51-jurisdiction rules table** (50 states + DC),
2026 vintage. Per state: an *effective flat approximation* of the (often progressive) schedule
for a typical retiree — *from v6.00 ten states, and from v6.01 every progressive state (27), are taxed on their own bracket schedules instead (§ v6.00 and § v6.01 below); the fifteen flat-rate states keep their one rate, Idaho with its zero band and Ohio on its own 2026 schedule from v6.03 (§ v6.03 below)*; Social Security treatment (43 jurisdictions none; the eight partial states
— CO, CT, MN, MT, NM, RI, UT, VT — approximated as taxing half the federally-taxable portion,
since their income thresholds exempt most retirees; WV's phase-out completed for 2026);
full retirement-income exemptions (IL, MS, PA, IA, MI post-phase-in, plus the nine
no-income-tax states — **applied at every age**: `retExempt` carries no age gate. *(Corrected at v5.87, D-23: this list read
"IA 55+" until then, which described Iowa's law, not the model. The model applies Iowa's and Pennsylvania's exemptions below the
law's ages — 55, and 59½ or the plan's own retirement age — which understates tax for a younger retiree: the **optimistic**
direction. Both notes now say so; making the model age-aware is D-24, which re-reads all fourteen `retExempt` rows.)*); and major 65+ retirement-income exclusions where they exist (e.g., GA
$65K/person, KY $31,110, NY $20K, NJ a $100K HOUSEHOLD cap at 62+ (not per-person), VA $12K, SC $15K, DE $12.5K). **Which of these have been checked against a primary source, and what was found, is recorded in `AUDIT_STATE_EXCL65_NOTES.md` — this section routes there rather than restating it, because a verification claim expires and a dated audit does not.**

**Income conditioning: the machinery exists as of v5.64, and all five states are populated —
Connecticut (v5.65), New Mexico (v5.66), New Jersey (v5.67), Virginia (v5.68) and Rhode Island (v5.69).** Five states condition their exclusion on income in
law — New Mexico, Rhode Island,
Virginia, New Jersey and Connecticut. *(Updated v6.05: six from v5.72 — Maine's pension deduction is income-limited in law from
TY2025, joined the list at v5.72 and is conditioned from v5.73; see *Maine's phaseout and Montana's corrections (v5.73)* in §11. This section records
how the first five converted.)* v5.64 added the mechanism: an income measure computed inside
the state engine, two bases (`agi`, and `agiExSS` — which is Virginia's AFAGI exactly and
approximates New Jersey's gross income), and an optional per-state field holding either a band table
or a continuous taper. The statutes are recorded in `docs/FINDINGS-v5_63-state-statutes.md`, read
against primary sources rather than secondary guides. The five convert **one release at a time**,
each with its own hand-computed test cells, so that a wrong figure is attributable to one state's
table rather than to the shared machinery.

**Connecticut is populated as of v5.65, and it moved in the OPTIMISTIC direction** — the one this
model is most reluctant to move in, which is why it converted first and alone. Connecticut was not
like the other four: they grant an unconditional exclusion the statute limits by income, while
Connecticut granted **nothing at all**, because the data model had no way to express a phase-out and
a zero was the pessimistic placeholder. So a Connecticut household was over-taxed by this model, and
correcting it makes plans look better. The exemption is now the TY2026 phase-out schedule from Form
CT-1040ES (Rev. 01/26): 100% of pension and IRA income below $100,000 of federal AGI for a joint
return ($75,000 single), stepping down through eight bands to nothing at $150,000 and above
($100,000 single). It is applied **per return, not per person**, and there is **no age test at all** —
Connecticut conditions on income alone.

**New Mexico is populated as of v5.66, and it moves in the CONSERVATIVE direction — figures go
down for affected households.** New Mexico is the first of the four states whose unconditional
exclusion was making plans look better than the statute allows, so this is the release where that
optimism starts being paid back. The model granted a flat $8,000 per person 65 or older at **every
income level**; NMSA 1978 § 7-2-5.2 steps that exemption down $1,000 per band and reaches **$0 above
$51,000 of federal AGI on a joint return, $28,500 single**. A retired couple with $60,000 of
retirement income in New Mexico was under-taxed by this model by $784 a year; that household now
pays the statutory figure. The exemption is **per qualifying individual**, the age floor is **65**
(the statute's own, and the engine's default), and the band tops are **inclusive** — at exactly
$30,000 of joint AGI the full $8,000 each still applies.

Two limitations are disclosed rather than buried. The table **has not been indexed since Laws 1987,
ch. 264, § 6**, so it is a 1987 schedule applied to 2026 income and it bites far more households
than it did when written; the model reproduces the statute as it stands rather than inflating it.
And the statute also grants the exemption to **blind individuals at any age**, which this model has
no way to express — a blind New Mexico claimant under 65 is modelled as receiving nothing, which
overstates their state tax.

**New Jersey is populated as of v5.67. It moves in the CONSERVATIVE direction for the households
that were most wrong, and it is the first populate release to ALSO move one figure the other way.**

The model granted **$75,000 per person, unconditionally, from age 65**. N.J.S.A. § 54A:6-10 grants a
**household** exclusion, not a per-person one, and conditions it on New Jersey gross income: the full
amount (up to $100,000 joint, $75,000 single) at or below $100,000, then **50%** of the payments
received up to $125,000, **25%** up to $150,000, and **nothing above $150,000**. A retired couple
above $150,000 was excluding $150,000 where the statute allows none — under-taxed by this model by
**$8,250 a year**, the largest single-state error the module has carried. Tier tops are **inclusive**:
at exactly $125,000 of gross income the 50% tier still applies. The percentages are of the **payments
received**, not of income and not of the tier-1 cap.

**The optimistic half, stated rather than buried.** The statute's age floor is **62**, and this model
had refused to apply it — because with a per-person $75,000 amount, granting it at 62 would have
handed a 62–64 couple $150,000 against a $100,000 statutory cap, making the estimate worse rather
than better. That reasoning was about the broken cap, and it expired with this table. The floor is
now modelled, so a household aged 62–64 receives an exclusion this model previously denied them and
their estimated New Jersey tax **falls**. This is the first income-conditioning release to make any
figure look better rather than worse, and it is recorded here because a release that reported only
the half that looks rigorous would be describing itself inaccurately.

Three limitations are disclosed rather than buried. **Married-filing-separately has its own lower
column** ($50,000 / 25% / 12.5%) which this model cannot express, because it models single and joint
only. **Eligibility on the basis of disability at any age** is a separate statutory route with no
input to express it, so a disabled New Jersey claimant under 62 is modelled as receiving nothing,
which overstates their state tax. And New Jersey's income measure here **excludes Social Security**,
which New Jersey does not tax — correct — but like every measure in this module it carries no
dividend or interest income, so a household whose income is materially dividend-driven sits lower on
the tier table than the statute would put it, which is optimistic.

**Virginia is populated as of v5.68, and it moves in the CONSERVATIVE direction only.** The model
granted **$12,000 per person 65 or older at every income level**. Va. Code § 58.1-322.03(5)(b)
reduces the deduction **$1 for every $1** that adjusted federal AGI exceeds **$50,000 single /
$75,000 married**, so it is gone at $62,000 for a single filer, $87,000 for a couple with one
qualifying spouse, and $99,000 for a couple with two. A couple both 65 or older with $80,000 of
retirement income was under-taxed by this model by **$287.50 a year**, and a couple at $99,000 or
above by **$1,380.00** — both now pay the statutory figure. Swept against the previous release across
20,050 households, no Virginia household's estimated tax goes down.

**The reduction is taken ONCE for a couple, against their combined maximum — not once per spouse.**
The statute's text does not settle this; the Form 760 Age Deduction Worksheet does, by combining
married taxpayers' income on one line, computing the excess once, and subtracting it from the
combined maximum. The difference matters only inside the phase-out with both spouses qualifying,
which is exactly where a per-spouse reading would be wrong by as much as $690.00 a year (at $87,000, where it has just extinguished) while
agreeing with the statute everywhere else. Virginia is also the first state in this module expressed
as a **continuous taper** rather than a band table, so it has no band-top comparator to choose: at
exactly $75,000 the excess is zero and the full deduction applies, which is what "exceeds" requires.
The income measure is Virginia's AFAGI **exactly** — federal AGI without Social Security — apart from
the dividend and interest income the model never carries, so the deduction is slightly **overstated**
for households with taxable investment income. Two statutory routes are not modelled and are stated
rather than dropped: taxpayers born on or before 1 January 1939 take the $12,000 with no income test
(age 87 or older in 2026, outside this model's frame), and the deduction cannot be combined with
Virginia's Disability Income subtraction.

**All five are conditioned as of v5.69 — Rhode Island, the last, is a cliff.** Rhode Island's $50,000 pension/401k
exclusion per person (R.I. Gen. Laws § 44-30-12(c)(9), from full retirement age, 67) is now a two-row `bands` table on federal
AGI: the full amount while AGI is **less than** $133,750 joint / $107,000 single, and nothing at or above it. **The comparator is
exclusive** — the statute and ADV 2025-22 say *less than* / *below*; only the Division's retirement guide says "or less", in
the same table that misprints $133,500 — so a couple at exactly $133,750 loses the exclusion. The thresholds are the **TY2025**
pair; Rhode Island publishes a year in arrears and the TY2026 pair is expected in November 2026, which will be a constants
refresh. **Measured before shipping over 34,992 households, tax rose for 14,843 and fell for none; the largest rise is
$5,000.00 a year**, a both-67+ couple with $100,000 of qualifying income at or above the cliff. Four things remain unmodelled
and are stated in the state's note, **each of which overstates the exclusion**: IRA distributions, which the statute excludes
and the model cannot tell from 401(k) money (no input carries account type — `MissingFeatures.md` D-12); the cap of each
person's $50,000 at that person's own pension income, and the rule that only a spouse at full retirement age counts (the engine
sees household totals only); and dividend and interest income, which the measure does not carry. *(Updated v6.05: the first three are
modelled from v5.95 — Rhode Island's exclusion reaches only each person's own pension, annuity and employer-plan income, from that person's
full retirement age, and never IRA money; see the v5.95 D-12 Phase 3 note below. The fourth stands, and the state's note says so.)* Separately, the model still
taxes half of federally taxable Social Security at every income, which overstates Rhode Island tax under the cliff and
understates it above — the Social Security modification is part of the eight-state partial-SS approximation, a release of its own. *(From v5.73 that approximation covers seven states: Montana taxes Social Security exactly as the federal return does — below.)* *(Superseded at v5.85 — see "Social Security in the seven states follows each state's law".)*

**The cliff reaches the Roth comparison.** Because a conversion can push federal AGI across Rhode Island's cliff, the
conversion strategy the model scores best can change. Measured at the v5.69 build on four Rhode Island households: the best
cell was unchanged for three and **changed for one** — with $2M of traditional money the model's best cell moved from
*fill the 12% bracket* to the *current slider* strategy, with modelled lifetime tax $107,757 higher on the v5.68 winner. That is
the model's best cell under its own assumptions, not a recommendation.

Two properties of the measure are stated here rather than discovered later. **It carries the taxable
account's yield** — the model's one figure for dividends and interest, taxed together — because every
in-app call of the state engine passes it in `capGains` (Engine A `qdcgC`/`qdcg` = the year's dividends;
Engine B `qdcg_y` = gains + dividends). *(Corrected at v6.29, F-25: from v5.65 this paragraph, the
engine's comment and the Connecticut, New Jersey, New York, Rhode Island and Virginia notes said the
measure carried no dividend or interest income and disclosed an optimistic error from it. The code
never had that omission; the notes and `t35`'s locks were changed with this paragraph.)* And **the band comparator is a
per-state property, not a convention**: four of the five statutes are inclusive at the top of a band
while Connecticut is exclusive, so at exactly $150,000 of federal AGI a Connecticut couple's pension
exemption is zero rather than 2.5%. New Mexico is one of the inclusive four — its tables read "not
over," so exactly $30,000 of joint AGI takes the $8,000 row, not the $7,000 one.

**The age at which an exclusion starts is modelled per state (v5.55), not assumed to be 65.**
`STATE_RULES.exclAge` carries a state's own floor and is absent for the states that use 65.
Five are set: **Kentucky and Connecticut attach no age test in law** (verified against KY DOR
Schedule M, and for Connecticut against Form CT-1040ES, whose schedule conditions on income alone),
**Delaware's starts at 60** (30 Del. C. §1106), and as of v5.60 **Rhode Island's and Wisconsin's
start at 67**, the full retirement age both statutes require. Before v5.55 every state was gated on a hardcoded
65, which withheld a real statutory exclusion from households below that age and so **overstated**
state tax — the conservative direction, which is why it went unnoticed. One known threshold is
deliberately **not** applied: South Carolina's under-65 tier, which is a second amount rather than an
earlier start, and is stated in its own state note. *(v5.87: Georgia's $35,000 at 62–64 is the same shape — a second, smaller
amount before 65 — and is likewise not applied; its note said so only from v5.87.)* *(⚠ Corrected at v5.68: until then this sentence
also named New Jersey's 62 as unapplied. v5.67 applied it, as the income-conditioning section above
says, and this line was left contradicting that section for one release.)* **D-18 has since read every exclusion state's figure against a
primary source (v5.86, below).** *(⚠ Corrected at v6.05: from v5.86 to v6.04 this sentence still read "Thirteen of the nineteen exclusion
states remain unverified, so more thresholds may differ from 65 than are modelled here", directly before the update that made it false.)* *(Updated v5.86: D-18 read every exclusion state's figure against a
primary source. Two start earlier in law than modelled — Arkansas (IRAs from 59½, employer plans at any age) and New York (59½) —
and both are applied from 65, which overstates their tax: the conservative direction. See *State dollar figures carry their tax year (v5.86)*.)*
*(Updated v5.87, D-23: the notes now say so. A census of every note against the age the model applies (`exclAge ?? 65`, or any
age for `retExempt`) found six that misdescribed it: New York and Georgia named ages the model does not apply (conservative),
Iowa and Pennsylvania named ages the model ignores (optimistic — above), and Arkansas and Oklahoma named none. All six now state
the model's age and, where the primary source was read at the build, the law's; Oklahoma's own age condition was not settled from
a primary source, so its note claims none. Nothing modelled moved. `qa/t52_age_start_notes.mjs` holds every note to the model's
age. **Not covered:** My Data's generated summary still reads "65+ exclusion" for every row, which misstates Delaware (60),
Kentucky (any age), Rhode Island and Wisconsin (67) — D-25.)*
*(Fixed v5.88, D-25: the summary now names the age the engine applies — "from 60", "from 67", "at any age" — by the engine's own
rule, and the exact dollar figure rather than a rounded "$NK", four of which rounded up. `qa/t53_mydata_summary_age.mjs` holds all eighteen rows.)*

One shared calculator serves the Taxes engine, the Roth strategy comparator, and the Withdrawal
engine.

⚠ **Corrected at v5.62. Until then this paragraph read "… so the three can never disagree", and
that was false.** They shared the calculator but not the ARGUMENTS. Through v5.61 the two Roth call
sites passed `retIncome: max(0, taxableOrd − ssT)`, which is (a) net of the FEDERAL standard
deduction — a deduction this section explicitly lists as not modelled, and the wrong jurisdiction's
in any case — and (b) undecomposed, so wage income was folded into `retIncome` and collected the
state RETIREMENT-income exclusion. In the five states that exempt retirement income entirely
(IL, MI, MS, IA, PA) that exempted the household's wages outright. **The three engines disagreed in
all 42 taxing jurisdictions**, by up to **$2,656/yr** on an ordinary household, always in the same
direction: the Roth engines under-taxed, so conversion and break-even output was **optimistic**
against the Taxes tab. v5.62 makes all three pass gross components. **What guarantees agreement is
not the shared calculator but the argument shape**, and that shape is now asserted — `t8` checks
every call site at the source, `t10` §2E checks the behaviour.

⚠ **The residual this paragraph disclosed at v5.62 is WITHDRAWN at v5.63, because it was not
there.** The v5.62 text read: *"`otherOrd` — non-work ordinary income such as rental or annuity
streams — is computed only in the Taxes engine. The Roth engines' income base is `pen + work + rmd`
and never carries it, so for a household with such income the engines still differ."* Measured by
execution at the v5.63 build, `streamsAnnualAt` was already handing the Roth comparator the SAME
ordinary total either way — the gap the disclosure described did not exist for the state layer, and
the suite pin that claimed to hold it open asserted only that adding money to a taxed base changes
the tax. Both are gone: the pin is retired (t10 §2E) and this is the correction. A user who read the
v5.62 text should know it was withdrawn rather than quietly deleted.

⚠ **What WAS wrong, and is fixed at v5.63, is a different thing entirely: FICA.** The Roth
comparator folded every ordinary stream into `work` and charged 7.65% payroll tax on the total — so
rental, annuity and royalty income was charged FICA it has never been subject to, at both of the
engine's two FICA sites. The Taxes engine has always split earned from unearned income for exactly
this reason. Because that tax is real money in the comparison, **it changed which conversion
strategy scored best on `estate`, the field the Roth tab ranks on**; flips were found at 36 points
of a 336-household grid, the smallest shipped top-two gap among them $301, concentrated in single
filers. That is an existence result on a grid this project chose — it is not a prevalence, and no
percentage should be read off it. Selecting no state preserves the legacy flat-rate
behavior exactly (backward compatible with every existing backup).

**This is an approximation layer and is labeled as such in the UI.** Not modeled: *(progressive
state brackets ARE modelled from v6.01 — every progressive state is on its own schedule)*, county/city income taxes (IN, NYC and city taxes
not; Maryland's county tax is taken at the highest county rate, 3.30 %, from v6.01), the dividend and interest income Rhode Island's AGI measure omits (⚠ *corrected at v6.05: until then this item read "Rhode Island's IRA distinction and per-person cap", false from v5.95, which modelled both (D-12) — the exclusion reaches only each person's own pension, annuity and employer-plan income*; **its AGI cliff is applied as of v5.69**, exclusive, on the TY2025 thresholds — Connecticut, New Mexico, New Jersey, Virginia, Rhode Island and Maine are conditioned as of v5.65, v5.66, v5.67, v5.68, v5.69 and v5.73; ⚠ *corrected at v5.69: this clause listed Rhode Island's cliff as approximated as unconditional*; ⚠ *this clause was stale and is corrected at v5.62: v5.60 DID apply RI's and WI's full-retirement-age (67) floors, as stated above — the contradiction stood within this one document for two releases*; ⚠ *corrected again at v5.68: it listed NJ and VA as unconditional, false from v5.67 and v5.68 respectively* — **Virginia's $12K age deduction tapers $1 for every $1 of adjusted federal AGI above $50K single/$75K married, and is applied that way, once per couple, as of v5.68**), SC's under-65 tier (disclosed, not applied; *NJ's 62 floor stood beside it here as unapplied until v5.68, although v5.67 applied it*), **Colorado's shared $24K cap between Social Security and pension — a cap the two share rather than one reducing the other, which overstates Colorado's exclusion and understates its state tax**. Maryland's and Maine's exclusions, which are reduced by Social Security received dollar-for-dollar, ARE applied as of v5.56 (§12), itemized
deductions and the few state credits that need a measure the calculator lacks *(every state's standard deduction, exemptions and personal credits are taken — the 27 progressive states from v6.02, the flat-rate states from v6.03; Pennsylvania's law has none)*, pension-source distinctions (AL/HI DB exemptions), and WA's
capital-gains excise. Verify your state.

## 7. Roth conversion modeling

**The comparator sees the spending draw (v5.84).** Engine A — the strategy comparator, the solve-for grid, the grid's
current-slider row and the stress solver's tax estimate — now includes the household's ordinary spending draw from
Traditional in its ordinary base, per year: the series Engines B and C have used since v5.74, taken from the withdrawal plan
at the slider's conversion amount (exact for the slider's own strategy, an approximation for the others). It is **taxed, not
drained** (see "The Taxes tab and the drawdown", item 4). On the example household the Fill-12 % strategy's estate advantage
falls $218,720 → $150,518, Fill-22 % turns negative, Stay-under-IRMAA falls to $884; the solver's winner stays Fill 12 %; the
stress solver's tax estimate rises (the conservative direction).

**The conversion caps differ between engines (D-4), measured, not fixed.** Engines B and C cap a conversion at
`tradBal − max(RMD, QCD)`, Engine D at `tradNotional − RMD`. At the default $70,000/yr no cap binds in any engine on the 11
fixture households. At $150,000–$250,000/yr the caps bind and the Taxes tab and the Withdrawal plan convert different
lifetime totals — ≈ $90,000–$181,000 — mostly because Engine D's balance grows at its scenario rate (D-9, a decided
difference) and runs out sooner; with a QCD the cap formula itself decides 2–4 years. *(Both caps have moved since, and the gap
above was not re-measured: from v6.07 Engines B and C cap at the **non-annuity** balance less max(RMD, QCD); from v6.08 Engine D caps at the
bucket pre-tax money left after its own RMD and the year's spending draw, then converts a Traditional IRA entered under Other accounts —
see "Engine D converts an IRA entered under Other accounts" at the end of this paper.)*

**Who the age-65 deductions belong to, and an unused deduction against gains (v5.75).** Two
corrections, both in the taxpayer-unfavourable direction — the model now reports MORE tax in the
first case and LESS in the second, and both match the statute.

*The survivor's age.* The §63(f) additional standard deduction and the OBBBA senior bonus belong to
the individuals **on the return**. On a joint return each spouse is counted by their own age; on a
single return only the **filer** counts. Through v5.74 a single return took the older of the two
stored birth dates, so a surviving spouse under 65 received the 65+ deductions through the deceased
spouse's age, and a single household whose spouse-B birth date was still on file could receive them
through a person not on the return. On a household whose first death leaves a survivor aged 62, the
understatement was $976 in that year and roughly $260/yr after it, on $50,000 of pension income.
Sources: 26 U.S.C. §63(f); IRS Pub. 501 (2025), "Death of spouse"; and the 2025 Form 1040
instructions, Schedule 1-A Part V, "Death of a taxpayer in 2025", which gives the bonus the same
rule. **Disclosed approximation (unchanged by this release):** the model holds birth *years*, not
death dates, and treats the death year as a joint return in which the decedent is counted by
calendar-year age. The statute counts a decedent as 65 only if they reached 65 *on or before the
date of death*, so for a decedent whose birthday falls after their death date in the death year,
the model grants one deduction the return is not entitled to — a single-year, one-deduction
overstatement of the deduction, in the optimistic direction, in the death year only.

*An unused deduction against preferential income.* 26 U.S.C. §1(h)(1) applies the preferential
rates to net capital gain **"or, if less, taxable income"**, and the IRS's Qualified Dividends and
Capital Gain Tax Worksheet implements that by measuring the gains against taxable income *after*
the deduction. Through v5.74 the model stacked gains on ordinary income floored at zero, so a
deduction that ordinary income did not use was simply lost rather than absorbing the gains. A single
filer with no ordinary income and $60,000 of qualified dividends was charged $1,583; the correct
figure is $0. The correction is applied on the regular **and** the AMT path: applying it to only one
does not remove the overcharge, it re-routes it into AMT (measured at build: $1,583 of pure AMT on
the same case).

**Standard deduction on the Roth tab (v5.20).** The conversion-ladder projection now applies the
§63(f) age-65 additional standard deduction — $1,650 per spouse MFJ, $2,050 single for 2026, indexed
— through the same shared helper Engines A and B use. Before v5.20 it applied the base deduction
only, so it overstated the tax on conversions made at 65+ and disagreed with the strategy comparator
directly below it on the same tab. Separately, and deliberately, neither the ladder nor the
comparator models the OBBBA $6,000 bonus senior deduction (tax years 2025–2028): it expires before
typical conversion windows, and modelling it would make the bracket-fill solver circular, since the
deduction depends on MAGI which depends on the conversion being solved for. The Taxes tab does model
it, so the two tabs differ for any ladder year at or before 2028.

**The §63(f) amount for a blind filer is not modelled (disclosed v6.13).** The same additional
standard deduction goes to a filer who is blind — $1,650 per spouse joint, $2,050 single for 2026
(Rev. Proc. 2025-32 §4.14(3)), adding to the age amount for a filer who is both — and the app has no
input for blindness, so a blind filer's federal deduction is understated and the tax overstated (the
conservative direction). The Field Manual's list of simplifications says so. The age amounts
themselves were read against Rev. Proc. 2025-32 §4.14(3) at the v6.13 scope and are equal.

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

**A single household is never paid spouse B's Social Security (v5.76).** Social Security retirement
benefits belong to the worker who earned them, and a single household has no spouse B. The ladder's
explicit test above was one of twelve such tests; thirteen other reads of spouse B's benefit had
none. The one that mattered most was the Withdrawal plan, which paid the stored benefit as income.
Through v5.74's draw bridge that understated the Taxes tab's tax too, and both Monte Carlo loops
paid it as well. Worse, when a single household's plan file had **no** spouse-B section — the natural
shape of such a file — the loader filled in the example household's $1,300/month as a default. On
the example household made single, the plan paid **$308,076** of spouse-B benefits that do not exist:
the ending portfolio read $427,269 high, lifetime federal tax $38,916 low, and the Monte Carlo median
ending balance $61,158 high. **Every error ran optimistic.**

Since v5.76 the rule lives in one place, `getSSB()`, which returns zero for a single household, and a
single household's plan with no spouse-B section loads with zero. A spouse-B figure that is **stored**
in a single household's file is left in the file, because switching the plan back to married should
restore it, but no calculation uses it, and the app says so in one line while it is present. Both
in-app ways of making a household single already cleared the figure on save; the route was loading a
plan file. The stress tests were never affected: their one unguarded read is tested for single where
it is used.

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
so both sites are scheduled together. *(Both closed: the cards at v5.47 — "The Roth tab's RMD cards no longer count annuity money"
below — and the ladder's own distribution at v6.07, which carries each spouse's annuity dollars — "Annuity money is never converted"
at the end of this paper.)*

**§86 is one rule, in one place, for every engine (v5.77).** Taxable Social Security is computed by a
single function written line for line from the IRS Social Security Benefits Worksheet (2025 Form 1040
instructions, lines 6a and 6b), and every engine calls it: the Roth-strategy comparator, the Taxes
tab, the IRMAA tab and the Roth tab's year table — and, from v6.12, the Withdrawal tab's Bracket column,
which until then took a flat 85% of benefits (see *The Withdrawal tab's Bracket column*, v6.12). Each passes the filing status for the year it is
taxing — joint, or single once a survivor files alone — and the function chooses the §86(c) amounts
from that. The worksheet's **line 14** is the half-benefits limb of §86(a)(2)(A): above the adjusted
base amount, the portion carried up from the lower tier is the smaller of half the benefits and half
of the capped excess. Adjustments to income (worksheet line 6) and tax-exempt interest (line 4) are
not modelled, and neither are lump-sum elections or repayments (§86(d)–(e)).

Through v5.76 the same rule was written out four times, and the duplication is how two defects
survived. v5.45 fixed a pair of mirror-image errors in two of the copies — the Taxes tab dropped line
14 in its upper tier, and the Roth tab capped its middle tier at 85% rather than half of benefits
(bounded at $2,463 and $2,468 joint, $1,838 and $1,850 single) — but the Roth-strategy comparator
carried its own copy of the Taxes tab's error, and v5.45 did not reach it. v5.77 corrects it. It
**overstated** taxable Social Security, so it ran in the **conservative** direction, and only for a
year with small benefits (under $12,000 joint, $9,000 single) and provisional income above the
adjusted base: on a single retiree born 1958 with $6,000 of benefits and a $32,000 pension in 2026,
$150 of federal tax. The same release corrects the IRMAA engine, whose formula was right but which
took the **joint** amounts for a household single from the start — it keyed them on the flag that
marks a married household's widowed years. That ran in the **optimistic** direction: on a single
retiree with $60,000 of benefits and a $62,500 pension it understated MAGI by $3,775 and hid a $1,150
IRMAA surcharge. Neither correction moves the shipped example household, which is married and has no
year of benefits small enough for line 14 to bind; that was measured across all seven Roth
strategies, not inferred. Until v5.77 this document also said the half-benefits cap was still
"scheduled" in the Taxes tab and in the Roth tab's middle tier; both had shipped at v5.45.

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
  grow at the plan's inflation, the CPI-U that 42 U.S.C. §9902(2) revises them by — v6.30; through v6.29 a 2%/yr proxy
  shared with the tax brackets). The ENHANCED regime uses the actual
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
- **The top tier begins AT its threshold (v5.78).** 42 U.S.C. §1395r(i)(3)(C) makes tiers 1–4 "not
  more than" their upper amount but the top tier "at least" $500,000 ($750,000 joint), so a MAGI of
  exactly that threshold pays the top surcharge. Through v5.77 every engine used "not more than" for
  the top tier too and billed that MAGI one tier low — **$580 per person per year optimistic**, for a
  household sitting exactly on the line (finding C-1). Tier selection is now one shared helper, as
  threshold computation already was, and the IRMAA tab's headroom from tier 4 is one dollar less than
  the gap, because adding the full gap reaches the top tier. Projected thresholds are **not** rounded
  to the nearest $1,000 as the statute rounds CMS's published figures; projecting them at the plan's
  assumed inflation (CPI-U, as §1395r(i)(5)(A) indexes them — v6.30; a 2%/yr proxy through v6.29) is a far larger
  uncertainty than the rounding (recorded as C-13).

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

The Withdrawal tab's schedule (Engine D, `computeWithdrawalPlan`) draws the first-priority pool
(taxable, HSA and everything entered under Other accounts) first, then the retirement buckets in
sleeve order (cash → bonds → equity → hedge), with Traditional and Roth money drawn **in
proportion within each sleeve**. RMDs are forced Traditional withdrawals from each spouse's own
start age. The Roth slider's amount is converted each ladder year, capped at the Traditional money
the buckets and convertible accounts hold. The schedule computes **no income tax** — on draws,
RMDs, gains or conversions; the Taxes tab figures the tax from these draws — and it applies **no
guardrails**.

**The guardrails are the Monte Carlo's (corrected at v6.28).** Through v6.27 this section said the
schedule applied Guyton-Klinger guardrails; it applies none. The guardrails (80%/120% of the planned
path; below the lower band monthly spending is cut 10%, above the upper band it is raised 5%, each
change compounding, checked once a year) are applied by the 6-year and 30-year Monte Carlo engines
only. The section also pointed to a comparison of cash-first, tax-optimized and fixed-real
strategies. That was a descriptive table on the Withdrawal tab, closed by a "Recommendation" to blend
the three, which said the schedule modelled that blend. The schedule draws in the one order above
and converts the slider's amount; it models no strategy choice. The table was removed at v6.28. The
Guardrails tab shows the bands and what the Monte Carlo does at each; no engine changes a Roth
conversion in response to a band.

**Where the RMD comes from (v5.35).** Through v5.34 this section's RMD sentence was true of the tax
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
modified; exports are explicit JSON. The optional Ask AI call transmits — from v6.26, first — the
app's fixed ground rules (the same text for every plan: educational only, no financial directives;
it carries nothing about the user), the plan's briefing (the structured plan summary written at
Save & Apply — names, ages, state, balances/mix, SS/pension — or the example's sample briefing, or
a backup's own text of up to 20,000 characters), the live context with headline results, the
typed question, the conversation's last 12 messages, and any explicitly attached files — nothing
else — to the Anthropic API, authenticated by the platform
inside claude.ai or by a user-supplied key (browser-storage only, never in files or backups) when
self-hosted. Two v5.5 additions: a persisted **Offline Mode** toggle hard-disables Ask AI entirely
(fully air-gapped operation), and self-hosted copies can route Ask AI to a **local OpenAI-compatible
endpoint** (Ollama / LM Studio) so the summary never leaves the user's machine — text-only, with a
documented quality trade-off versus the hosted model. The manual's §10 carries the complete
transmitted/not-transmitted table. Since v5.10.1, **Clear All Data honors the manual's promise
in full**: confirming the wipe deletes every storage key — plan, preferences, and the API key
(credentials never survive a wipe) — and returns the app to the landing screen; previously the
button overwrote the plan with a blank one and left the key and preferences in browser storage.

**Input bounds on every load (v5.72).** A plan — restored from a backup, or read back from browser
storage — is checked for shape before it replaces the one in memory, and a load that fails part-way
restores everything it touched. A backup with more than **500 rows in any list** or larger than
**5 MB** is refused whole, never truncated. Values the model cannot sensibly take are pulled into
range and **listed on My Data**, never silently:
- **birth year** to 1900 – current year (the stored `YYYY-MM[-DD]` text is rewritten); a birth date
  that cannot be parsed at all is dropped, and the timeline falls back exactly as before;
- **Social Security claim age** to 62–70 (a 0 or blank still means "use the default");
- **income-stream start/end years** to 1900–9999 — a range that cannot change any figure;
- **retirement year** to 1950 – 60 years out and **life expectancy** to 50–120 (unchanged since
  v5.9.1, now reported).

*Which figures move:* only those of a plan that carried an impossible value — a birth year of 9999, a
claim age of 55 or 80. Any plan entered through the app's own forms is unchanged. Through v5.71 the
birth-year limit never fired: it read a number out of a field stored as text. The limits are
recorded as limits; this is input validation, not a change to any engine.


### Maine's phaseout and Montana's corrections (v5.73)

**Maine — the pension-deduction phaseout is modelled.** 36 M.R.S. §5122(2)(M-3), from TY2025: each
person's deduction under M-2(1)(a) — $48,216 at v5.73 ($49,824 from v5.86, TY2026), already reduced dollar-for-dollar by the Social Security
that person received — is reduced by itself times *(federal AGI − applicable amount) ÷ $100,000*, the
fraction floored at 0 and capped at 1. Applicable amounts are **$250,000 joint** and **$125,000 single**, so
the deduction is gone at **$350,000** and **$225,000**. The order matters and is the statute's: offset
first, then phaseout. A household at $300,000 joint with $30,000 and $20,000 of Social Security keeps
**$23,216** (half of $18,216 + $28,216) on v5.73's figures; applying the phaseout first would leave $4,108. At v5.86's $49,824 the
same household keeps **$24,824** (half of $19,824 + $29,824), and phaseout-first would leave $4,912.
- *Measure:* the model's state AGI — retirement, pension, other ordinary income, gains and federally
  taxable Social Security, and the taxable account's yield (dividends and interest, taxed together).
  *(v6.29, F-25: this said the measure carried no dividends or interest and was optimistic for it; every
  call of the state engine passes the yield, so it does.)*
- *Figures:* TY2025 throughout at v5.73 ($48,216 and both thresholds). Maine indexes the thresholds after 2025. *(Superseded
  at v5.86: the cap is $49,824, TY2026; the thresholds stay TY2025 because Maine had not published TY2026's — see *State dollar figures carry their tax year (v5.86)*.)*
- *Still not modelled:* head-of-household and separate-filer thresholds (the model files joint or single),
  military retirement pay (which the statute does not phase out), Railroad Retirement, and **the absence of
  an age-65 test** — Maine's deduction is not limited to people 65 and over, but the model applies it from
  65, which **understates** it for a Maine retiree drawing retirement income earlier.

**Montana — two corrections.** Since TY2024 Montana starts from federal taxable income, so:
- **Social Security is taxed exactly as it is federally.** The model had taxed half of the federally
  taxable amount, a description of the pre-2024 law. That **understated** Montana tax for any household
  with Social Security; it now taxes the whole federally taxable amount (`ss` 0.5 → 1).
- **The 65+ subtraction is $5,660 per person for TY2025** (Montana DOR, 2025 Form 2, line 6), not the
  statutory base of $5,500. That lowers Montana tax by about **$9 a year per person 65+**.
- *Still approximate:* Montana has **two ordinary-income brackets**; the model uses one flat rate
  (a filed lead, not verified in this release). The subtraction reduces **all** income in law, but only
  retirement income in the model, which is pessimistic for a household with little retirement income.
  Montana's base also reflects the temporary federal senior deduction (2025–2028); the model does not start
  from federal taxable income, so it does not reflect that deduction.

*Which figures move:* Maine households above the thresholds pay **more** Maine tax; Montana households with
Social Security pay **more** Montana tax; Montana households with anyone 65+ pay about $9 a person **less**.
No other state changes. The seven remaining partial-SS states (CO, CT, MN, NM, RI, UT, VT) keep the
half-rate approximation, and whether each still matches its post-reform law is a filed lead. *(Superseded at v5.85 — see "Social Security in the seven states follows each state's law".)*

## 12. Validation & known limitations

The `validation/` folder contains: statutory-constant checks (brackets, IRMAA tiers, QCD cap,
RMD table, state-rules sanity) with citations; the Gompertz median check; and headless behavioral
suites (26-tab render sweep; QCD reduces lifetime tax and MAGI; income-fallback banner fires on
legacy data and stays silent on honest zeros; BYOK key handling per environment; iOS share-sheet
export paths; state-module ordering test TX=IL < GA < CA; solve-for grid; MC toggle effects).

Not yet done, in honesty: **independent professional (CPA/EA/actuary) review** — the single
most valuable outstanding validation, and the reason the trust case remains self-referential;
golden-file cross-validation against Pralana/ProjectionLab on identical inputs; a few state credits that need
measures the calculator lacks (D-32; every state's own deductions are taken from v6.03, and those it takes from the federal return from v6.04); ACA premium-subsidy modeling; and stochastic
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
treatment. Streams flow through every engine but two — planned trajectory, both Monte Carlo engines,
the withdrawal schedule, the tax engine (job rows also pay payroll tax — an employee row as wages, per earner up to the
wage base, with the Additional Medicare Tax; a self-employed row self-employment tax, both halves; see *Payroll tax on job income*, v6.14, v6.16), IRMAA MAGI, and the Roth optimizer. **Backtest and What-Breaks credit no stream** (corrected
at v6.23; through v6.22 this paragraph listed What-Breaks among the engines): their income is Social Security and the pension, so a
plan's rental or job income never lowers their draws, while What-Breaks' tax does include the streams' tax (through v6.35 the Roth
tab's strategy engine's; from v6.36 the Monte Carlo's schedule, *What Breaks pays the Monte Carlo's tax*, v6.36). Conservative; MissingFeatures **D-57**. Entering any stream replaces the built-in part-time taper, which from v6.23
only the example household carries (*Built-in work is the example's alone*, v6.23), and the old negative-expense-row workaround is superseded (moving such rows
into the module lets the tax engines see the income). **From v5.63 the Roth optimizer charges FICA
on job rows only, as the tax engine always has.** Through v5.62 it charged payroll tax on every
ordinary stream, rental and annuity included; §6 sets out what that moved. One consequence of the
correction is worth naming because it is second-order and runs against intuition: a smaller tax
bill leaves a larger taxable balance, which pays more dividends, which raises MAGI — so on a
household sitting near an IRMAA threshold the surcharge can RISE even though lifetime tax falls.
Measured on one such household the Medicare surcharge moved **+$2,300** while lifetime tax fell;
on another it moved **−$1,740**. The direction is not fixed, and this release does not claim IRMAA
or NIIT are untouched. Remaining honest limits of the module:
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
- **Neither, and never a capital gain:** Roth. *(The Withdrawal tab's engine has treated it so only from v6.09 — before it, Engine D held a
  Roth IRA under Other accounts as brokerage and counted it in the buckets' Roth share too; see "A Roth IRA under Other accounts is counted
  once" at the end of this paper.)*

A **non-qualified annuity** is the reason those are two questions rather than one. It is taxed like
pre-tax money but carries no RMD; recording it as Traditional (which v5.25 did, and disclosed as an
approximation) would manufacture a legal obligation the owner does not have and force money out
early. It therefore has its own type. The residual approximation is that an annuity is part
after-tax basis, which a single label cannot express — Annuity treats all of it as ordinary income,
the pessimistic direction. *(Its state treatment differs by state from v6.06 — see the v6.06 D-28 note in the state-tax section. From v6.07 it is never converted, given by QCD or drawn by an RMD — see "Annuity money is never converted" at the end of this paper.)* A **qualified** annuity held inside an IRA does have an RMD, and the
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
the first year the strategy's account total — every balance at face value, Traditional dollars
before the tax still owed on them — catches the baseline.

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

**Direction (v6.13).** Face value makes the crossover arrive no earlier than any after-tax count
would. A fixed conversion only ever leaves the strategy holding less Traditional money than the
baseline: the gap starts at the converted amount, every later year carries it forward through the
same growth and the same RMD divisor, and the spending draw takes the same dollars from both
paths, so the gap never turns negative — and deducting any tax rate from Traditional balances can
only shrink the strategy's shortfall. Measured at the v6.13 scope on a session-only copy of the
engine instrumented to publish its Traditional balances (its wealth series identical to the
shipped one, with the card's own inputs): on the example household at six slider amounts, the
example with both spouses living to 100 at three, and `t10`'s fixture at three, counting
Traditional dollars at 88%, 78% or 76% of face moved the crossover earlier or left it unchanged in
all 36 cells. It also showed why the after-tax count is not used: its answer is set by the rate
chosen. On the example at $30,000 a year, a 12% rate says the conversion never pays back and a 22%
rate says it is ahead from the first year — the paper gain described above. That measurement is
a scope finding, not a shipped assertion. Through v6.12 this section, the card and the Field Manual
called the measure "after-tax wealth" (C-11); the wording, not the measure, changed at v6.13.

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
model projects for the years it projects. *(Corrected at v6.31: this said the omission is conservative without qualification. The
work-stoppage case reassesses the first two premium years after retirement, and those the model does not charge at all — MissingFeatures
**D-65**, and* The Monte Carlo pays IRMAA (v6.31) *below — so for them the model reads low, not high.) (From v6.35 those two years are
charged when My Data states the last working years' MAGI — see* STAY UNDER IRMAA, the last working years, and one-time rows before
retirement (v6.35) *below; left blank, they still are not.)*

**Where the engines still legitimately differ.** From v6.30 they no longer differ in dollar basis: every engine COLA-indexes
Social Security from the as-of year and computes each year in that year's own dollars (*One dollar unit and one inflation clock for
the tax engines*, v6.30). Through v6.29 Engines B (Taxes) and C (IRMAA) held Social Security flat in today's dollars while inflating
brackets and thresholds — a mixed dollar basis, described here through v6.28 as a deliberate bracket-creep conservatism — and Engine
D (Withdrawal) COLA-indexed it. All model the same survivor transition in the same year and keep the same check; the cross-engine
test suite asserts the timing and the rule, and from v6.30 the figures too.

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

**"No growth" means no *real* growth (v6.30).** The rule above is about accrued contributions, and it is unchanged: they enter at face
value. The balances held today are a different question once the engines run on one clock from the as-of year: Engine D carries them
to retirement at the plan's inflation — the same real value on the retirement date, no real return — with their cost basis left at
its nominal amount, so the inflation is a gain when a taxable holding is sold. Through v6.29 Engine D priced from the retirement year,
where "no growth" in nominal dollars already meant no real growth; carrying the balances keeps that meaning on the new clock. Not
carrying them would have cost every plan (1 + i)^(years to retirement) of real value before retirement — measured at the v6.30 scope as
a 13.6% lower end balance on the example and 49.6% on a plan retiring twelve years out — which no other part of the app assumes.

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
app. Spouse A's pre-tax contribution is entered as three per-paycheck amounts — the employee's
own, the employer match and any employer supplemental — and a pay frequency; the bonus lump has
its own deferral and match percentages. *(Corrected at v6.34: this sentence said there was no
employer-match field and that a match could be folded into a pre-tax monthly amount; the form
has had both employer fields since the first published source, and spouse A has no pre-tax monthly field.)* The
402(g) elective-deferral limit is a soft warning with a Verify-tab citation — the model does not
enforce it, because catch-up eligibility and plan specifics are outside its knowledge. It counts
spouse A's own paycheck deferral, A's Roth and the bonus deferral; while a stored pre-tax figure
is in use (no paycheck breakdown, or one the plan is not using) it counts no paycheck deferral —
the stored figure has no employee/employer split — and says so (v6.34).

**Migration.** Plans predating v5.10 carry only the old combined monthly amounts. On load
they map to 100% pre-tax (the historically correct reading — the old fields fed a pre-tax
engine), and a one-time notice in My Data says so; saving writes the explicit split. Through
v6.33 the form's Person-A pre-tax amount was the per-paycheck rollup alone, so a plan holding
only a monthly total and no per-paycheck detail showed $0 there — and one Save & Apply, draft or
Export Backup stored the $0. From v6.34 the form shows and keeps the stored figure until the
paycheck row is edited (*My Data keeps spouse A's stored pre-tax contribution (v6.34)*, below).

## The Taxes tab and the drawdown (v5.74)

Through v5.73 the Taxes tab and the IRMAA tab projected a household that never spent any of its
pre-tax money. Engine B's `ordinaryIncome` had no spending-draw term, and its Traditional balance
moved only for RMDs, QCD excess and conversions — so the balance compounded at a flat 4.5% through
the whole pre-RMD period while the Withdrawal plan was drawing that same money down to pay for
groceries. The tab's own summary sentence said the opposite, calling itself "your projected tax
life as-is". This was recorded as C-8 (defect), E-21 (two parallel projections of one household)
and D-14 (the missing feature is a shared drawdown).

**What v5.74 changes.** Engine D owns the drawdown and now publishes the two ordinary-income terms
a spending withdrawal creates — `tradDraw` (pre-tax bucket draws) and `othOrdDraw` (the ordinary
share of a taxable-sleeve sale) — plus their sum as `ordDraw_y`. The Taxes and IRMAA tabs build a
year-keyed series from the selected scenario's schedule, exactly as they already did for realized
capital gains since v5.36, and hand it to Engines B and C. Both tabs build it through ONE shared
function, `withdrawalPlanSeries`, rather than each walking the schedule itself, so the units
conversion below exists in exactly one place and the two tabs cannot come to read different households. Both tabs now tell the user in their
own words that realized capital gains and the ordinary income your spending withdrawals create
both arrive from the Withdrawal plan rather than from anything set on the tab itself. Each engine uses it twice: as ordinary
income, and as an outflow that leaves the Traditional balance so later RMDs are not computed on
money the plan has already spent. **One drawdown, three consumers** — the precedent v5.32 set for
gains, extended to draws, and the reason a second drawdown was not written into Engine B.

**Measured on the shipped example household** (joint, retire 2029, horizon 2053, base scenario), on
the tab's own *as-is* reading — the one its explainer describes: no Roth conversions, no QCDs, and the
taxable yield at its 2.0% default: lifetime federal tax falls from **$244,040 to $208,730**, a
**−$35,309 (−14.5%)** correction, and lifetime RMDs in the Taxes tab fall from **$1,625,926 to
$1,321,030** against the Withdrawal plan's own $1,021,349. **As the tab first opens** — with the Roth
slider's default $70,000 a year of conversions — the same correction *raises* lifetime federal tax, from
**$210,051 to $211,591 (+$1,540, +0.7%)**: the conversions already drain most of the Traditional balance
the old tab over-counted RMDs on, so taxing the spending draws slightly outweighs the smaller RMD
correction. So the direction depends on the conversion setting, and neither reading is the whole story:
the defect was **mis-timing**. On the as-is reading the tab taxed nothing in the seven gap years
2032–2038 (now $9,575 of federal tax between them) and then overstated the late-year RMDs by more than
that. *Two further bases are pinned in `t40` and are not views a user meets:* the scope's acceptance
figure, with no realized gains passed ($244,040 → **$208,416**), and every input at zero, the yield too
($244,040 → $208,445). ⚠ *Corrected before v5.74 shipped:* a draft of this section called the
$208,445 figure "as the Taxes tab renders it". It is not; `t40` section E now pins both real views and
ties "first open" to the source's own defaults. The seven gap years are hand-verified to the cent
against an independent Rev. Proc. 2025-32 / §86 computation on the scope's basis ($9,316). On the IRMAA
tab the same draws move MAGI in every one of the 25 projected years, up in the drawing years and down in
the RMD years, with peak MAGI falling from $175,224 to $149,657 on the as-is reading (and from $165,803
to $161,948 at first open); on this household no IRMAA tier is crossed either way, so the lifetime
surcharge stays $0, but a higher-income household will see the tier assignment move.

**The detail panel now adds up.** The Taxes tab's per-year breakdown lists "Gross taxable income by
source" above its "Gross taxable" total. It had never listed every term of that total: dividends and
interest (the taxable-yield estimate) and other ordinary income were counted but not shown, and v5.74's
spending draw would have joined them — on the example household the 2029 sources summed to $108K under a
$152K total. From v5.74 the list itemizes all nine terms, and `t40` section D derives the term set from
the engine itself, so a term added to the total later cannot go unlisted without failing a test.

### The five approximations this release ships with, each with its direction

1. **Units — the draw is restated in today's dollars; the RMD is not.** *(Superseded at v6.30: every engine computes each year in
   that year's own dollars and the bridge hands Engine D's draw on unchanged — One dollar unit and one inflation clock for the tax
   engines. The paragraph is kept as the record of v5.74–v6.29.)* Engine D is nominal (it
   COLAs Social Security and inflates expenses); Engine B deliberately holds Social Security and
   pension flat in today's dollars while inflating brackets 2%/yr, which its own comment calls its
   bracket-creep conservatism (v6.29: read as each year's own dollars its rows run low, not high — *The
   dollar basis — measured, both readings (v6.29)*). The imported draw is therefore divided by the cumulative inflator at
   the call site, so it sits in the same units as the income beside it. **The RMD term is imported
   as Engine D computes it.** Deflating that as well was measured at $74,541 of lifetime tax — more
   than the whole defect — because Engine B's RMD comes off a balance compounding at a nominal 4.5%,
   so deflating its replacement would make it *more* real than the term it replaces. Direction:
   mixing conventions at all is a known approximation; the back half runs slightly pessimistic.
2. **Growth — the Taxes tab keeps its own 4.5%.** Engine B recomputes the Traditional balance from
   Engine D's draws at `BASE_GROWTH`, rather than adopting Engine D's scenario-derived per-bucket
   weighting (3.518% on base). Importing Engine D's balance path wholesale would have inherited its
   growth assumption silently — a further $42,146 of lifetime federal tax, and a modeling change
   nobody asked for bundled into a defect fix. Five projections in the file grow Traditional money
   at a flat rate; reconciling all five is a separate question (E-22), not this release's.
3. **QCDs diverge, by construction.** The QCD lever is Engine B's alone — Engine D has no QCD
   concept — so gifted dollars never leave the Withdrawal plan's portfolio. Setting the QCD slider
   above $0 makes the Taxes tab and the Withdrawal plan disagree by the gifted amount. Disclosed
   in-app rather than modeled.
4. **Engine A (the Roth comparator) — measured at v5.84, and it did NOT cancel.** Until v5.84 its ordinary base had
   the same gap, excused as "largely cancels" between strategies. Measured (`docs/SCOPE_ROTH_COMPARATOR_DRAW.md`): four
   strategies SIZE the conversion from this base, so the omission let them fill bracket room the household's spending
   had already used. **v5.84 taxes the draw in Engine A** (the same series, all four callers). It does **not** drain it
   from Engine A's balances: that needs each strategy's own spending path, which Engine A cannot compute, and one shared
   series drained from every strategy decided the solver's winner by its own approximation (measured). So Engine A's
   Traditional balance still omits spending — the same overstatement in every strategy — disclosed in the Field Manual;
   follow-up **D-7b**.
5. **The draws follow the selected Monte Carlo scenario**, as the gains already did. Lifetime
   ordinary draw on the example household is $352,485 base, $660,662 bear, $352,386 bull — so the
   Taxes tab's headline figure now moves when the scenario picker moves. That is correct, and new.

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
income streams, while `spouseBWork` is one spouse's. *(Corrected at v6.23: that sentence was wrong when checked at v6.22. The
ladder's `spouseBWork` is the built-in taper plus every ordinary stream — the same sum as Engine C's `work_y`. Through v6.31 the one
difference was the year the taper is keyed to — the ladder's was the plan's target retirement year, Engine C's the retirement year the
buttons select; from v6.32 the ladder starts at the selected year too (*QCDs after a death*, below, records the release), so the two terms
are identical.)* v5.41 closed the RMD term only; the comment it
left in the source says Engine C "has always carried its `rmdTax_y` term; this render block did
not, and the two disagreed." They still disagree, in two more terms (dividends and realized gains; v5.53 closed dividends, below).

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

### One term still differs, and it is disclosed (two were listed through v6.22)

- **`capGain_y`** — realized capital gains, left out by the decision above.
- **`work_y` vs `spouseBWork`** — listed here through v6.22 as narrower: "Engine C counts the household's other income streams; the
  ladder counts one spouse's earned income." Corrected at v6.23 — the two are the same sum (the taper plus every ordinary stream). Through
  v6.31 they differed in the year the taper is keyed to (the target year on the ladder, the selected one in Engine C); from v6.32 both use
  the selected year.

`capGain_y` can only add to MAGI, so the residual error remains **optimistic**, and the Roth tab's figure
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
indexed to the Social Security maximum). *(Maine's is $49,824 from v5.86, TY2026 — see *State dollar figures carry their tax year (v5.86)*.)* Both were verified against the states' own revenue
authorities. Correcting the caps in the same release means the direction reported above is the net
of both changes, not of the offset alone.

### What is still not modelled, and is disclosed rather than fixed

- **Railroad Retirement**, which both statutes name alongside Social Security. The model has no
  Railroad Retirement concept at all.
- **Maine's income phaseout** above $125,000 single / $250,000 MFJ. ✓ **Modelled from v5.73** — see
  *Maine's phaseout and Montana's corrections (v5.73)* below.
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

## Two state exclusion amounts were a legislative cycle stale (v5.59)

`AUDIT_STATE_EXCL65_ROUND4.md` (§2b, §2c) found that two `STATE_RULES` entries carried a real
provision at a superseded amount. Both figures move toward the statute; nothing else in the module
changes, and no engine code moves. Direction for a household that qualifies under the statute:
**conservative → less conservative**, because the model was granting less relief than the law allows.

### Rhode Island's pension and annuity modification is $50,000 per person from TY2025

**R.I. Gen. Laws § 44-30-12(c)(9)**, as amended by **P.L. 2024, ch. 117, art. 6, § 21**, steps the
modification from $15,000 (TY2017–22) to $20,000 (TY2023–24) to **$50,000 for tax years beginning on
or after 1 January 2025**. The model carried $20,000 — a full legislative cycle stale. The modelled
amount is now the **$50,000 pension/401k exclusion** per qualifying person. The per-person reading of
a joint return's cap rests on the Division of Taxation's *Retirement Income Tax Guide* (Pub. 2026-01)
rather than on the statute alone, so no dollar figure is asserted for the couple cap.

Four statutory conditions were unmodelled at v5.59 and are named in the state's note. **The first
of them — the requirement of full retirement age, 67 for anyone born 1960 or later — is modelled as
of v5.60** (see below). The rest remain: it is gated by a **hard AGI cliff** (TY2025: **$133,750 MFJ / $107,000 single**, indexed annually
— TY2026 is not published until November 2026) which the model ignored until **v5.69, when it became modelled as an exclusive cliff**; **IRA distributions do not qualify** (only Form 1040
line 5b income does) and the model has no IRA-vs-employer-plan distinction; and the Social Security
modification carries the same two gates and removes all federally-taxable SS where it applies, while
the model taxes half.

**On the MFJ threshold figure, corrected at v5.61.** Through v5.60 the note and this document gave
the TY2025 MFJ threshold as **$133,500**, taken from the Division of Taxation's own *Retirement
Income Tax Guide* (PUB 2026-01, February 2026), which states it nine times. That figure is wrong,
and Rhode Island's other publication has it right: **ADV 2025-22 (3 November 2025) gives $133,750**.
The statute settles which to follow without reference to either document's authority. R.I. Gen. Laws
§ 44-30-12(c)(8) sets base-tax-year-2000 amounts of $80,000 (single/HoH/MFS) and $100,000 (MFJ/QW)
and adjusts **both by one cost-of-living factor**, so the two thresholds cannot stand in different
ratios to their bases beyond a rounding step. TY2024 confirms the mechanism exactly:
$104,200 ÷ $80,000 = $130,250 ÷ $100,000 = 1.3025. Against the verified TY2025 single figure of
$107,000, $133,500 would imply an MFJ ratio of 1.3350 versus the single's 1.3375 — a gap of 0.0025,
about four times larger than any rounding step can produce. **The admissible MFJ value is $133,750 or
$133,800; $133,500 is not admissible.** The app follows ADV 2025-22 and cites it in the note, because
a user checking the app against Rhode Island's filing-season guide will otherwise find a mismatch and
reasonably conclude the app is wrong. **No computed output changed** — the cliff is not modelled, so
no code path reads this figure. It is a disclosure correction that nonetheless ships to users.

The sign of the error therefore depended, at v5.59, on which side of the cliff a household
sat, whether both spouses had reached 67, and what kind of account the money was in. **With the age
gate modelled from v5.60 the age term drops out**, leaving two: conservative under the cliff with
employer-plan money, optimistic above it or on IRA money. Rhode Island also enacted, in
its 2026 session, the removal of the age threshold from the SS modification for TY2027+ (HB 7127
Sub A, Art. 6 § 5); it is recorded here and not modelled.

### Wisconsin's exclusion is $24,000 at 67+ with no income test

**Wis. Stat. § 71.05(6)(b)54m.**, created by **2025 Wis. Act 15**, allows **$24,000 at 67+** ($48,000
for a joint return where both have reached 67) with **no income limit**. The model carried the older
$5,000 provision, which required 65+ and federal AGI under $15,000 single / $30,000 married. The
modelled amount is now the **$24,000 retirement-income exclusion** per person. At v5.59 the 67 floor was not
modelled: the amount applied from 65, so a 65–66 household was granted an exclusion the statute
denies — optimistic for those two years, exact from 67. **v5.60 models the floor, and Wisconsin's
treatment of this provision is now exact at every age.** Wisconsin's statute was carried
from `AUDIT_STATE_EXCL65_ROUND3.md` §2b and not re-read for this release.

Because the provision is not income-tested, Wisconsin's note no longer says "income-limited", and it
therefore **leaves the suite's income-limited guarded set** (t29 F-6), which goes from five members
to four (NJ, NM, RI, VA) by wording alone; the assertion itself is untouched. Rhode Island stays in
the set because its AGI cliff is an income limit.

### The Rhode Island and Wisconsin exclusions start at 67, not 65 (v5.60)

Both statutes gate on **full retirement age**, and the model gated both on its default of 65. **R.I.
Gen. Laws § 44-30-12(c)(9)** ties the modification to *"the age used for calculating full or
unreduced Social Security retirement benefits"* — **67** for anyone born 1960 or later — and **Wis.
Stat. § 71.05(6)(b)54m.** reads *"67 or over"*. Each state's entry now carries `exclAge: 67`, and the
floor is compared **per person**, so one spouse past 67 and one below receives one exclusion rather
than two or none. Neither statute was re-read for this release; both are carried from
`AUDIT_STATE_EXCL65_ROUND4.md` §2b and §2c.

**The direction is conservative**, and this was the last optimistic error in either state. A 65- or
66-year-old household had been granted an exclusion the statute denies — and v5.59 made that larger
by correcting the amounts it was granting two years early. For a couple at 66 with $80,000 of
retirement income, Rhode Island tax rises from $1,020 to $5,020; the equivalent Wisconsin couple on
$60,000 rises from $636 to $3,180. Households where both spouses have reached 67 are unchanged.

**No figure moved and no engine code changed.** `exclAge` already existed — it was introduced at
v5.55 for Kentucky and Delaware — and is read in exactly one place, so this is two properties in the
rule table. What it does *not* fix is everything else Rhode Island's statute conditions on: the AGI
cliff and the IRA-versus-employer-plan distinction both need a data-model field the engines do not
carry, and `MissingFeatures.md` **D-11 (c)** scopes those once across states rather than per state. *(v5.69: the cliff is
modelled through `exclTest`; the IRA distinction still needs an input and is `MissingFeatures.md` **D-12**.)*

### What did not move, and why

New Mexico was untouched **through v5.65** (its own pass, disclosure-first — ROUND4 §6 D-C); that
pass was taken at **v5.66**, which populated its income-conditioned exemption — see the income-conditioning
section above. No `exclAge` moved for
either state **in v5.59**: a gate change alongside a figure change cannot be attributed if a
downstream figure moves. That deferral was spent at **v5.60**, which set both gates and moved no
figure — see the section below. The eight-state `ss: 0.5` blend is unchanged. `MissingFeatures.md` D-11 records the group *(Superseded at v5.85 — see "Social Security in the seven states follows each state's law".)*
these three states form — a modelled figure that is right on one side of a statutory gate and wrong
on the other — as distinct from the D-3c optimistic class (NJ, VA).

## Social Security in the seven states follows each state's law (v5.85)

Until v5.85 seven states — CO, CT, MN, NM, RI, UT, VT — taxed `ss: 0.5`, half of federally taxable Social Security, for every
household. Each state conditions it on income and/or age, so that single factor was wrong in both directions. Each now carries an
`ssRule`, evaluated every year from the state layer's AGI measure (retirement income + pension + work + gains + taxable SS), the
filing status and each spouse's age; taxable SS is split between spouses by gross benefit (`docs/SCOPE_SS_STATES.md`):

- **Colorado** — 65+ subtract all taxable SS; 55–64 all of it at AGI ≤ $75,000 single / $95,000 joint, else up to $20,000. The SS
  subtraction **consumes** the $24,000 pension cap (`ssSharesCap`), so on the example household Colorado's lifetime tax RISES
  ($50,558 → $60,200): the old model gave both in full, which its own note said overstated the exclusion.
- **Connecticut** — none taxed below $75,000 / $100,000 AGI; above, at most 25 % of total benefits (not applied if gross is unknown).
- **Minnesota** — the simplified subtraction (TY2026: $86,410 / $110,780), −10 % per $4,000 above; the alternative method (≤ $5,840)
  is **not modeled** — conservative.
- **New Mexico** — none taxed at AGI ≤ $100,000 / $150,000; a cliff. **Rhode Island** — none taxed at full retirement age (67 here)
  and AGI < $107,000 / $133,750 (the TY2025 figures; TY2026 unpublished at the build — conservative), per spouse; a cliff.
- **Utah** — a credit of the rate × taxable SS, less $0.025 per dollar of AGI over $54,000 / $90,000; nonrefundable. Utah's rate is
  4.45 % from 2026 (S.B. 60).
- **Vermont** — none taxed at AGI ≤ $55,000 / $70,000, then proportionally over $10,000 (2025 Act 71; not indexed). The example
  household sits above the line, so Vermont taxes all of it: lifetime $135,505 → $159,160 — the largest optimistic error removed.

**Approximations kept:** the AGI measure omits tax-exempt interest (Utah's MAGI adds it); head-of-household and married-filing-
separately thresholds are not modeled (the app has single and joint); Colorado's 55–64 pension subtraction is not modeled; the
count-only path (callers without ages) treats its 65+ count as the age — conservative for Rhode Island's 67. Thresholds are the
latest published and fixed; indexing belongs to D-18. *(v5.86 dates each of these figures; see *State dollar figures carry their tax year (v5.86)*.)*


## State dollar figures carry their tax year (v5.86)

Until v5.86 nothing in the state table said which tax year a dollar figure came from, and My Data headlined every state
"Model (2026 approx)" while three notes (ME, MT, RI) said their figures were 2025. Every dollar-bearing figure now carries the
tax year it was verified for against a primary source — `years` on each of the 23 rows that hold one, keyed by the field that
holds it (`excl65`, `exclTest`, `ssRule`; 31 figures in all) — and My Data shows those years instead of the blanket label
(`docs/SCOPE_D18_STATE_FIGURES.md`).

- **What a displayed year means.** The tax year the figure was checked for. A figure whose current-year value was unpublished
  when this build was made keeps its latest published year and says so: **Maine's phase-out thresholds** ($125,000 / $250,000,
  TY2025; Maine indexes them), **Montana's** 65+ subtraction ($5,660, TY2025; the Department of Revenue sets each year's figure by
  1 November, MCA 15-30-2120(7)) and **all of Rhode Island's** (TY2025; Rhode Island publishes a year in arrears). Every other
  figure is TY2026.
- **Rates carry no year.** The 42 nonzero effective rates were not re-read in this release (filed as D-22), and a displayed year
  is a claim, so My Data calls the rate an approximation and dates only what was verified.
- **Maine's cap: $48,216 → $49,824** (TY2026), the Social Security maximum at full retirement age on 1 January 2026 (Maine Revenue
  Services, 2026 Form 1040ES-ME, line 2). Everything that derives from it moves with it: the Social Security offset starts from
  the higher figure and the phase-out scales the higher result.
- **Louisiana's exemption: $6,000 → $12,324** (TY2026). Act 11 of the 2024 Third Extraordinary Session doubled it to $12,000 from
  TY2025 and indexes it to CPI-U from 2026 (R.S. 47:44.1); the model had never picked up the doubling. The TY2026 amount is the
  Department of Revenue's own statement, in the fiscal statement of its proposed rule for LAC 61:I.1311 (Louisiana Register,
  20 June 2026) — no separately posted figure was found. It covers pension, annuity **and IRA** distributions.
  ⚠ **An approximation this change enlarges:** Louisiana allows each person the exemption only against that person's own
  retirement income; the model nets each qualifying person's amount against the household's. For a couple where one spouse
  receives most of the retirement income, that overstates the exemption — and doubling the amount doubles the overstatement. The
  same household-level netting applies to every per-person exclusion in the table; Louisiana's note now says so.
- **South Carolina's note corrected.** It gave the under-65 retirement deduction as $10,000; it is $3,000 (the $10,000 applies at
  65+, where the $15,000 senior deduction absorbs it). The modelled $15,000 at 65+ was right and is unchanged.
- **The Field Manual** described the whole state module as "2026 approximations" in two places; both now say rates are
  approximate and each dollar figure is dated in My Data.
- **What was read and did not change** (scope §1b, §3b): AL, AR, CO, CT (all 20 bands), DE, GA, KY, MD, MN, NJ, NM (all 18
  bands, TRD's 2025 instructions), NY, OK, RI, UT, VA, VT, WI, WV. Bills that would have changed KY, AL, MD and DE did not pass.
- **Nothing here moves the example household.** It has no state selected, so it takes the flat-rate fallback (OPERATIONS §K1). The evidence
  is `qa/t51_state_figure_years.mjs`: fixture households in Maine, Louisiana and New Jersey, each computed by hand to the dollar,
  including New Jersey's inclusive boundary at exactly $100,000.

**Found and recorded, not changed here:** West Virginia's $8,000 is not additive to its Social Security modification — the state
gives the higher of the two — so the model is optimistic by up to $8,000 per person per year (D-21, its own release). Georgia's
65+ amount rises to $70,000 in TY2027. Arkansas and New York allow their exclusions earlier than the model's 65 (see the
age-threshold paragraph above).

*(Fixed v5.89, D-21 — `docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md`. W. Va. Code §11-21-12(c)(9)(ii), read 2026-10-01, limits each PERSON's
$8,000 to $8,000 minus that person's other modifications, of which the (c)(8) Social Security modification is the SS "included in
federal adjusted gross income" — taxable SS. `stateTaxAnnual` now applies exactly that per person (`seniorVsTaxableSS`), splitting the
household's taxable SS by each spouse's gross benefit as the v5.85 SS layer already does; a caller without ages gets the household form,
which is never more generous. The law's other offsetting modifications — the first $2,000 of WV public or federal pensions, police and
fire pensions, military retirement, U.S. obligation interest — are not modelled (no account type: D-12), which leaves a WV public
pensioner slightly optimistic; military retirement's own exemption is not modelled either (conservative). Measured on v5.88, a single
66-year-old with $30,000 of IRA income and $20,400 of taxable SS was under-taxed $385.60. `qa/t54_wv_senior_modification.mjs`.)*

*(v5.90, D-24 — `docs/SCOPE_D24_RETEXEMPT_AGE.md`. The "retirement income exempt" rows now carry the law's age gates where the law has
one: Iowa from 55 (Iowa DOR), Pennsylvania and Mississippi from 60 for withdrawals and conversions — 59½ in whole years, conservative —
with pensions in payment exempt at any age, as their employer-plan tests are the plan's own (PA DOR rev-636 and PA-40 instructions;
MS DOR regulation Ch. 07). Without per-person retirement income (D-12) a joint return is exempt only when both spouses qualify, which
over-taxes a couple whose older spouse owns the account (conservative). Michigan has no age test from TY2026 but its deduction is capped
per return at the private-retirement maximum (Treasury RAB 2026-1); the model applies TY2025's $65,897 / $131,794, the latest published,
which is conservative. Illinois includes early distributions (IDOR Publication 120) and is unchanged. Oklahoma stays at 65: its
regulation states no age in its general rule but the statute was not read. `qa/t55_retexempt_age.mjs`.)*

*(v5.94, D-26 — `docs/SCOPE_D26_STATE_TAX_DRAW.md`. The Traditional dollars a plan draws for spending are retirement income to the state
module, as they are ordinary income to the federal engine: both engines that compute state tax now pass them in `retIncome`, where they take
the state's retirement exemption, 65+ exclusion and income tests exactly as an RMD or a conversion does. From the draw bridges — v5.74 on the
Taxes tab, v5.84 in the Roth comparator — until this release the state module received none of them, so state tax was understated in every
draw year in which the state would have taxed those dollars (on the example household in North Carolina, $313,303 of lifetime draw and $12,501 of
state tax; in Georgia, none, because its exclusion absorbed the draw). Whole-plan totals partly
hid it, because draws also shrink later RMDs. Engines C and D compute no state tax and are unchanged. `qa/t58_state_draw.mjs`.)*

*(v5.95, D-12 Phase 3 — `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` §10. Five states apply their retirement rules per person, from the per-person,
per-plan-type split the engines carry (`attributeRetIncome`): Rhode Island excludes each qualifying person's own pension, annuity and
employer-plan income up to $50,000 — IRA income does not qualify; Iowa exempts each person's retirement income from that person's 55th year;
Pennsylvania and Mississippi exempt IRA income per owner from 60 (the law's 59½ in whole years) and employer-plan and pension income at any
age, the plan's own conditions treated as met; West Virginia's $8,000 is capped at each person's own retirement income, since wages and
investment income have no owner in the model. Without the split (any direct caller) every rule keeps the household path. After a death the
calculator reads the SURVIVOR's slot — age, benefit and income; through v5.94 the Taxes tab passed the late spouse's age when the
second-named spouse survived. `qa/t59_per_person_state.mjs`.)*

*(v5.96, D-27 — `docs/SCOPE_D27_ENGINE_A_SURVIVOR_STATE.md`. The Roth comparator files a surviving spouse's state return as it files the federal
one — jointly for the death year, single after (IRS Pub. 501) — with the late spouse's age blanked and the survivor's benefit in the survivor's
slot, as the Taxes tab has since v5.95. Through v5.95 it taxed the survivor as a couple at state level: the late spouse's 65+ exclusion and the
joint thresholds, bands, cliffs and caps, which understated state tax in survivor years (on the example household in Maine, $35,853 of lifetime
state tax under no conversions) and, in a handful of measured cases, changed the strategy the Roth tab ranks best by estate. `qa/t60_engineA_survivor_state.mjs`.)*

*(v5.97, D-22 for two states — `docs/SCOPE_D22_GA_OK_RATES.md`. Georgia's rate is 4.99 % for TY2026 (O.C.G.A. §48-7-20(a.1), HB 463, retroactive to
1 January 2026; flat, so exact) and Oklahoma's 4.5 % (HB 2764, 68 O.S. §2355), each read at a primary source; the model had 5.19 % and 4.75 %, both
conservative. Oklahoma keeps the row's top-rate convention, which overstates tax against its new three-bracket schedule by $214.75 single / $429.50 joint
a year on a base above the top threshold. Both rates are held for every later year, as every state's is; Georgia's step-down from 2027 and its $70,000
exclusion from 2027 are not applied (conservative). The other 40 rates remain unread (D-22). `qa/t61_ga_ok_rates.mjs`.)*

*(v5.99, D-22 batch 1 — `docs/SCOPE_D22_FLAT_RATES_V599.md`. The thirteen flat-rate states were read at primary sources for TY2026: AZ 2.5 %, CO 4.4 % (no TABOR
reduction for 2026), IL 4.95 %, IA 3.8 %, LA 3 %, MA 5 %, MI 4.25 %, MS 4 %, NC 3.99 % and PA 3.07 % matched; **Idaho 5.3 %** (was 5.695 %), **Indiana 2.95 %**
(was 3.0 %) and **Ohio 2.75 %** (was 3.1 %) were stale and conservative. Ohio's law is $332 plus 2.75 % above $26,050; the row keeps the top rate, which
overstates by $384.38 a year above that line. Zero bands (OH, MS, ID) are taxed and 2027's scheduled cuts (IN, MS, NC) not applied — conservative, and
said in each note. The remaining rows are mostly progressive and need a rate convention before they are read. `qa/t63_flat_rates.mjs`.)*

*(v6.00, D-22 option 3, batch 1 — `docs/SCOPE_D22_BRACKETS_V600.md`. **Ten states are taxed on their own bracket schedules**, each read at its primary
source: CA (Schedules X/Y **TY2025** — TY2026 unpublished — plus the 1 % Behavioral Health Services Tax over $1,000,000), MN, MS (0 % on the first $10,000),
NJ, NY, OK, OR, SC (Act 110 of 2026), VA (one schedule for every status) and WI, single or joint by the return's status (a survivor files single), on the
same base the flat rate saw. `rate` stays equal to the top rate. **New York's tax-benefit recapture is modelled:** above New York AGI of $107,650 the first
worksheet's phase-in toward a flat 5.9 % single / 5.4 % joint on all taxable income, exactly; above $215,400 single / $161,550 joint the later worksheets'
end point at once (the law phases it in — conservative). The AGI measure is the state base, net of the pension exclusion and Social Security as New York's
is. **Not modelled, each conservative:** any state standard deduction, personal exemption or exemption credit; indexing the schedules forward;
Mississippi's per-spouse band on a combined return; Virginia's Filing Status 4 and spouse adjustment; South Carolina's SCIAD. New Jersey's statute is 50
cents above its own arithmetic in one joint band, not modelled. Seventeen progressive rows keep one rate (D-22). `qa/t64_state_brackets.mjs`.)*

*(v6.01, D-22 option 3, batch 2 — `docs/SCOPE_D22_BRACKETS_V601.md`. **The other seventeen progressive states are taxed on their own schedules**, each
read at its primary source for TY2026: AL, AR, CT, DC, DE, HI, KS, MD, ME, MO, MT, ND, NE, NM, RI, VT, WV — single or joint by the return's status, one
schedule where the law has one (AR, DC, DE, MO, RI, WV). **D-22 closes:** every taxing row is on its own schedule or is one of the fifteen flat-rate
states (`t65` A-7). Added rules, each exact: **Arkansas's** table above $94,700 of net income (2 % on $4,700, 3.7 % on the rest, less the bracket
adjustment from $290 at $94,701 to nothing above $97,600); **Connecticut's** 2 %-bracket phase-out and three recapture amounts, per $5,000 (single) or
$10,000 (joint) of Connecticut AGI "or fraction thereof" — the AGI measure is the state base, which is after the pension and Social Security
subtractions as Connecticut AGI is; **Maryland's** county income tax on the same base at the highest county rate, 3.30 % (conservative for every county
below it), and its 2 % tax on all net capital gain when federal AGI exceeds $350,000 (from 2025), measured on the calculator's federal-AGI measure;
**Maine's** 2 % surcharge above $1,000,000 / $1,500,000 as a fourth bracket. **Enacted later top brackets are applied in every year:** Hawaii's 13 % above
$500,000 / $1,000,000 (Act 24 of 2026, from 2027) and Rhode Island's surtax above $1,000,000 at its 2029+ 3 % (FY2027 budget, 1 % / 2 % / 3 % in 2027 /
2028 / 2029+); at every income the result is at or above every schedule those acts enact (`t65` A-12), so in a model with no year dimension it is the
conservative stand-in. **Not modelled, each conservative:** state standard deductions, exemptions and credits and Alabama's deduction of federal income tax
(D-30); Missouri's 100 % capital-gains subtraction from 2025 (D-29); Hawaii's 7.25 % capital-gains cap, Montana's capital-gains rates, North Dakota's 40 %
and New Mexico's $2,500 gains deductions, Vermont's gains exclusion; per-spouse computation where the law allows it (AR, DE, MO); later lower schedules (MT,
NE 2027) and triggered cuts (KS, MO, WV); indexing. Vermont's 3 % minimum tax on AGI over $150,000 cannot bind in the model (`t65` A-13).
`qa/t65_state_brackets_b2.mjs`.)*

*(v6.02, D-30 batch 1 — `docs/SCOPE_D30_DEDUCTIONS_V602.md`. **The 27 progressive states take their standard deductions, personal exemptions and personal
credits**, each read at its primary source (TY2026; TY2025 where 2026 was unpublished — AR, CA, DC, MD, OR, VT — each at or below its later value). The
order is the forms': the state base (after the retirement exclusions, as before) less the deductions and exemptions is taxable income, floored at zero; the
schedule, Arkansas's high-income table and Maryland's county tax run on taxable income; New York's recapture fraction and Connecticut's added amounts on the
base (its AGI), as their statutes measure them; Connecticut's Table E credit decimal, then the dollar credits, reduce the state tax and cannot take it below
zero (Maryland's senior credit is not allowed against its county tax). Each row's `deduct` lists its components — a per-return, per-filer or per-filer-at-an-age
amount, single or joint, with an optional phase on the state base or the calculator's federal-AGI measure by one of six shapes (steps, linear, rate, tiers,
table, cliff), each the statute's own arithmetic: Alabama's $25/$175 per full $500 above $25,500; Connecticut's $1,000 per $1,000 "or fraction"; California's
$6 per credit per $2,500 "or fraction"; Maine's linear phase-out with its four-place ratio over the deduction including its 65+ addition; Minnesota's 3 % and
10 % at most 80 %; Maryland's exemption table and its senior credit at the reduced schedule ($1,000 / $500 single; $1,750 / $875 joint both 65+; $1,000 / $500
one); Oklahoma's 65+ exemption at federal AGI of $15,000 / $25,000 or less; Oregon's exemption credit at $100,000 / $200,000 or less; Rhode Island's 20 % per
$7,450 "or fraction" above $261,000; South Carolina's Income Adjusted Deduction with its reduction rounded down to $10; Wisconsin's sliding deduction; New
Mexico's low- and middle-income exemption. **Not modelled, each conservative:** the flat-rate states' deductions (D-30 batch 2); the federal income tax Alabama,
Missouri and Oregon let a return deduct, and the federal senior deduction Montana and North Dakota inherit (D-31 — the calculator is given neither);
low-income refundable credits; itemized deductions; dependents. `qa/t66_deductions_askai.mjs`, with an independent implementation in `qa/d30_ref.mjs`.)*

*(v6.03, D-30 batch 2 — `docs/SCOPE_D30_DEDUCTIONS_V603.md`. **The fourteen flat-rate states whose law has a standard deduction, exemption or personal
credit take them** (Pennsylvania's has none), each read at its primary source (TY2026; TY2025 where 2026 was unpublished — Arizona's, Idaho's and
Louisiana's deductions, Ohio's exemptions, Utah's phase-out base — each at or below its later value, or, for Utah's base, making the credit smaller), in the
order and with the evaluator of v6.02: Arizona's standard deduction and $2,100 for each filer 65 or older; Colorado's and Iowa's federal standard deduction
(both start from federal taxable income), Colorado's cut to $12,000 / $16,000 at federal AGI of $300,000 or more (the Proposition FF addback — the statute's
"equal to or exceeding", which the 2025 form words as "exceeds"), Iowa's $40 exemption credits and $20 for each filer 65 or older; Georgia's $15,000 /
$30,000; Idaho's deduction, its $155 grocery credit and its zero band; Illinois's $2,925 exemptions and $1,000 for each filer 65 or older, none above federal
AGI of $250,000 / $500,000; Indiana's $1,000 exemptions, $1,000 more for each filer 65 or older and $500 more each below federal AGI of $40,000;
Kentucky's one $3,360 deduction per return and $40 credit for each filer 65 or older; Louisiana's $12,500 / $25,000; Massachusetts' $4,400 exemptions and
$700 for each filer 65 or older; Michigan's $5,900 exemptions; North Carolina's $12,750 / $25,500; Ohio's exemptions by modified-AGI band, its $20 exemption
credits and $50 senior citizen credit (their "modified AGI less exemptions" tests converted exactly to modified-AGI thresholds within the band each falls
in), and its 2026 schedule — no tax on a base of $26,050 or less, $332 plus 2.75 % above it, the statute's step kept; Utah's taxpayer tax credit, 6 % of
the federal standard deduction less 1.3 % of Utah taxable income above $18,213 / $36,426. Credits stay nonrefundable (Idaho's grocery credit is refundable
in law — understated here for a household whose Idaho tax is below it). **Not modelled, each conservative:** the federal senior deduction that reaches
Arizona, Colorado, Idaho and Iowa (D-31); Ohio's retirement income and joint filing credits and Utah's retirement credit (D-32); low-income and
property-tax credits (Massachusetts' senior circuit breaker among them); itemized deductions; dependents. `qa/t67_deductions_flat.mjs`, with the
independent implementation extended in `qa/d30_ref.mjs`.)*

*(v6.04, D-31 and D-29 — `docs/SCOPE_D31_D29_V604.md`. **The deductions a state takes from the federal return are taken.** The calculator is given the
model year, the year's federal income tax (the regular tax on ordinary income, the capital-gains-rate tax and AMT — what the model computes of Form 1040
line 22; it computes no credits), the year's net investment income tax, and the realized-gain part of its capital gains, by all three call sites (Engine A's
year and its cliff-solver estimate, Engine B's year); a caller passing none gets the v6.03 figure. **Alabama** deducts the federal income tax and the NIIT in
full (§40-18-15(c); the 2025 worksheet). **Missouri** deducts 35 % / 25 % / 15 % / 5 % / none of it as Missouri AGI passes $25,000 / $50,000 / $100,000 /
$125,000, at most $5,000 single / $10,000 joint (RSMo 143.171 — measured on Missouri AGI as the MO-1040 does, where the statute says gross income), and from
TY2025 subtracts 100 % of realized capital gains (RSMo 143.121.3(14)) — qualified dividends stay taxed, and the gains leave the base before the percentage is
measured. **Oregon** subtracts it up to $8,500 (the 2025 cap, held), less in $5,000 / $10,000 steps of federal AGI from $125,000 single / $250,000 joint,
nothing from $145,000 / $290,000 (ORS 316.695; OR-40 Table 4). **The federal senior deduction** ($6,000 each 65 or older, 2025–2028, less 6 % of MAGI above
$75,000 / $150,000 — IRC §151(d)(5)(C)) is taken in the six states whose returns carry it: Colorado, Iowa, Montana and North Dakota through federal taxable
income, Idaho by conformity (HB 559), Arizona by its own subtraction (A.R.S. §43-1022(35)); its figures are the federal block's (`OBBBA_CONSTS`), its phase-out
runs on the calculator's federal-AGI measure, which equals Engine B's MAGI, and Engine B's state figure equals its federal bonus year by year (`t68` E-2).
Engine A takes the state senior deduction from its own post-conversion MAGI although its federal calculation omits the bonus (that solver decision stands);
Alabama, Missouri and Oregon read Engine A's federal tax as Engine A computes it — in 2026–2028 slightly higher than Engine B's for a 65+ household, so their
deduction there is slightly larger. **Not modelled:** the District of Columbia's senior deduction (unsettled law; conservative); the refunds Alabama and
Oregon recapture (the model has none); Oregon's 2026 cap (unconfirmed; the 2025 one is lower). `qa/t68_fed_deductions.mjs`, with the independent
implementation extended in `qa/d30_ref.mjs`.)*

*(v6.06, D-28 widened — `docs/SCOPE_D28_ANNUITY_RELIEF_V606.md`. **A commercial (non-qualified) annuity gets no retirement relief where the law gives
it none.** The Other-accounts type *Annuity* is a contract bought outside an employer plan or IRA. Through v6.05 its withdrawals could use every state's
retirement relief. Read at primary sources state by state (the scope's §0.2 cites each), the relief reaches it in twelve of the 25 taxing states that give
any (Alabama, Connecticut, Georgia, Kentucky, Louisiana, New Jersey, Rhode Island, and — because their relief is against any income — Montana, New
Mexico, South Carolina's 65+ deduction, Virginia and West Virginia) and not in thirteen: **Arkansas, Delaware, Illinois, Iowa, Maine, Maryland, New York,
Oklahoma, Pennsylvania and Wisconsin** limit theirs to employer plans and IRAs (Pennsylvania taxes it as interest income at any age; Iowa's rule names
"nonqualified annuities"; New York's names "an annuity contract purchased with your own funds"); **Colorado and Michigan** admit it only once it pays out
for life, which the model cannot tell from withdrawals, so it is taken as not qualifying (conservative); and **Mississippi**'s regulation speaks of
annuities from a "retirement system or plan" without saying whether a privately bought contract is one, so the conservative reading is taken. Those rows
carry `reliefKinds`, the categories their relief reaches, and with the per-person split (every in-app call) the exclusion or exemption is netted against
that eligible income only — at household level, as before; no new per-person cap. **Maryland's pension exclusion reaches no IRA money either**
(Tax-Gen. §10-209: plans an employer established, qualified under §401(a), §403 or §457(b)), disclosed as not modelled until now and modelled from v6.06.
Every change raises tax or leaves it unchanged. Where an exclusion is capped, the annuity rarely moves the figure: other retirement income usually fills the
cap, and Engine B reaches annuity money only through conversions and draws, never through RMDs, which carry none. ⚠ *Found while measuring, not changed:*
both engines take a Roth conversion pro rata from the Traditional pool, annuity money included, although a non-qualified annuity cannot be converted —
filed as `MissingFeatures.md` D-33 *(fixed at v6.07 — see the next section)*. `qa/t69_annuity_relief.mjs`.)*

## Annuity money is never converted, given by QCD or drawn by an RMD (v6.07)

*(v6.07, D-33 — `docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md`; `qa/t70_annuity_conversion.mjs`.)*

**The law.** A Roth IRA accepts a rollover only from another Roth IRA, a 529 plan, or an *eligible retirement plan* (26 U.S.C. §408A(c)(5)(A),
(e)(1)); §408A(d)(3)(B) takes that term from §402(c)(8)(B), which lists IRAs, individual retirement annuities, qualified trusts, §403(a) and §403(b)
annuities and governmental §457(b) plans. A commercial (non-qualified, §72) annuity is none of them, so it **cannot be converted**. A qualified
charitable distribution is "any distribution from an individual retirement plan" (§408(d)(8)(B)), so it cannot make a **QCD** either. And it carries
**no RMD**, which the model has known since v5.26.

**What the model did through v6.06.** The Other-accounts type *Annuity* rides inside each person's Traditional pool as a share, and the share was
**constant**. Engines A (the strategy comparison), B (the Taxes tab) and C (the IRMAA tab) and the Roth tab's ladder capped a conversion at the whole
pool, and B and C capped a QCD there too; so annuity money was converted and given away. Less visibly, every RMD and every conversion left the pool pro rata,
annuity included, and with the share held fixed that drained annuity dollars the law never touches — understating what the annuity was worth and
overstating every later RMD. The ladder also counted annuity money in its own RMD (open since v5.44).

**What it does now.** The annuity dollars are carried. A conversion and a QCD are capped at the **non-annuity** balance (the RMD base each engine
already computed); the RMD, any QCD above it and the conversion leave non-annuity dollars only — in Engines B and C split between the spouses by each
one's non-annuity balance after the RMD; the **spending draw is unchanged**: it takes annuity money in proportion to what is left, which is what the
state attribution has always reported for a draw. The share is re-taken every year on the dollars that remain (the same dollar-invariant rescale the
first-death merge has used since v5.26). The state attribution gives a conversion no annuity money. The Roth tab's ladder carries each spouse's
annuity dollars: its conversion cap and its own RMD use the balance less them, and the with-conversion RMD card subtracts them; the no-conversion card
keeps its static share, which is exact there (nothing leaves the account before RMD age). **Engine D — the Withdrawal tab and everything that reads it —
was never affected**: there the annuity sits in the Priority-1 pool and the conversion is bucket money only. *(Through v6.07. From v6.08 Engine D
also converts a Traditional IRA entered under Other accounts, after the bucket money — and still never annuity money; see the next section.)*

**A household with no annuity is untouched** — every changed expression reduces to v6.06's operand for operand, and fourteen state and QCD
combinations of two annuity-free households were bit-identical in Engines A, B and C when measured at the build. `t70` §D re-checks sixteen such
runs of Engines B, C and D against v6.06 on every suite run.

**Measured** (Taxes tab as it opens: $70,000/yr conversions, 2 % yield, the plan's spending draws). *The example household* ($7,000 of annuity, spouse
B): lifetime RMD $573,803 → $569,505, total tax $215,911 → $215,219, conversions unchanged; IRMAA unchanged ($0). The Roth tab's with-conversion RMD
cards move A $44,991 → $44,842 and B $3,178 → $2,962 — A holds no annuity, but B's smaller convertible balance moves more of each year's conversion
onto A — so "Combined RMDs reduced by" rises $365. *The same household with B's annuity at $150,000*: lifetime RMD falls $85,295 and total tax $12,415;
conversions are unchanged because $70,000 still fits the non-annuity balance. *A pool that is almost all annuity* (96 %): Engines B and C convert $88,717
where they converted $280,000, and Engine A's "current" strategy $104,067 where it converted $452,949.

**Direction — not one way.** Removing the RMD drain lowers RMDs and the tax on them, so the tax figures improve for a household holding an annuity: the
model had been forcing annuity money out through RMDs the law does not require. Removing impossible conversions lowers the tax paid now **and** what
reaches the Roth, so where conversions were large a strategy's estate figure can fall (the highest estate on the suite's Other-accounts household fell
$43,880) while others rise. Neither direction was chosen; both follow from the law.

**What is still approximate.** Engine A taxes the spending draw without draining it (v5.84), so in that engine the annuity share moves with RMDs and
conversions only. The QCD cap admits employer-plan dollars, which in law must reach an IRA first (the attribution already sends a QCD to IRA dollars
first). The annuity's after-tax basis is still taxed as ordinary income (the pessimistic simplification above). The draw order is unchanged.

## Engine D converts an IRA entered under Other accounts, and carries it as an account (v6.08)

*(v6.08, D-34 — `docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md`; `qa/t71_engine_d_other_ira.mjs`.)*

Engine D is the Withdrawal tab. Its spending-draw series is also what Engines A, B and C read for the ordinary income a spending withdrawal creates
(v5.74, v5.84), so what it does with an IRA reaches the Roth, Taxes and IRMAA tabs too. Since v5.26 a Traditional IRA entered under Other accounts
sits in Engine D's Priority-1 pool — spent first — tracked as ordinary money and as RMD-bearing money.

**The law.** An RMD cannot be converted, and the year's first dollars out of the IRA are the RMD (Treas. Reg. §1.408A-4, Q&A-6). A conversion is
income in the year converted (Q&A-7). An IRA's RMD is figured on its balance at the end of the year before (§1.408-8(b)(2)) — so on a balance that
includes the account's growth. Which account a person converts from is their choice; no rule orders it.

**What the model did through v6.07.** Three things, all about that IRA.
- *The conversion.* Engine D capped it at the buckets' pre-tax money less the year's whole RMD, figured before the year's draws. The RMD it
  subtracted included the IRA's, which never comes out of the buckets; it ignored the bucket spending draw later in the year, so where the slider
  outran the buckets it converted money already spent; and it never converted the IRA at all, though Engines B and C convert it.
- *The IRA's balance for its RMD never grew.* The pool grew, and so did its ordinary money (v5.37), but the RMD-bearing figure had no growth line,
  so the IRA's RMD was figured on its opening balance less withdrawals. That is the optimistic direction.
- *The IRA's RMD left it pro rata.* The year's RMD came out of the RMD-bearing figure in proportion to the whole pool's draw, so where the pool also
  held brokerage, HSA or annuity money the IRA gave up less than its RMD and its next RMD was figured on dollars already distributed.

**What it does now.** The conversion is figured after the year's draws: first the buckets' pre-tax money left after their own RMD and the
Traditional share of the year's spending draw from them; then the IRA's RMD-bearing money left after its RMD and its share of the spending draw.
Annuity money is never in that figure, so it is never converted (D-33). Converted IRA dollars stop being ordinary and RMD-bearing and stay in the
pool as tax-free money — the remainder HSA money already sits in — so spending them later is untaxed; no balance moves, because a conversion changes
what the money is, not how much there is. The IRA's RMD-bearing figure grows at the pool's rate, held inside the pool's ordinary money, and its RMD
leaves it whole while only the spending draw leaves it pro rata — the two rules the ordinary figure has followed since v5.36. The Withdrawal tab says
in one sentence where a conversion comes from.

**The order is an assumption, and it is the conservative one.** Bucket money first, then the IRA. Keeping the IRA as ordinary money longer means
more of the early spending draws — which come out of the Priority-1 pool first — are taxed. Converting from both in proportion was prototyped and
measured: it moves the example household at the opening slider; this order does not.

**A household whose IRA under Other accounts is gone before RMD age and whose buckets cover the slider is untouched** — the example household at
$0 and $70,000 is bit-identical in Engines B, C and D and in the Roth tab's strategies, and `t71` §E re-checks that against v6.07 on every suite run.
Its $104,000 of Other-account IRAs is spent as Priority-1 money long before its first RMD year. At sliders of $150,000 and above one year's
conversion falls by the money that year's spending draw had already taken ($105,857 → $103,185 in 2035 at $200,000); the Taxes, IRMAA and Roth tabs
do not move, because Engine D's conversion is not part of the series they read.

**Measured** on a household holding $150,000 of holdings, a $900,000 rollover IRA under Other accounts and $300,000 of cash. With no conversion: the
Withdrawal tab's lifetime RMD $430,216 → $653,901; the Taxes tab's lifetime tax $144,301 → $132,864. At $70,000 a year: the Withdrawal tab converts
$840,000 where it converted $50,000; the Taxes tab's lifetime tax $157,906 → $143,437.

**Direction — two ways, and the second is a correction.** On the Withdrawal tab the IRA's RMD and MAGI rise where it reaches RMD age unconverted (the
conservative direction). On the Taxes and IRMAA tabs lifetime tax falls: those engines already converted this IRA themselves, but the spending draw
Engine D handed them still treated it as ordinary money, so some dollars were taxed twice — on the household above at $70,000, in twelve years Engine
B's own Traditional balance was $0 at the start of the year while it still charged $137,056 of imported ordinary draws.

**What is still approximate.** The order between bucket money and the IRA is the model's. Engine D converts on one household ladder window, not each
spouse's. A Roth IRA entered under Other accounts is still counted twice in Engine D — as brokerage money in the pool and inside the buckets' Roth
share — which is filed as `MissingFeatures.md` D-35 and was not changed here. *(Fixed at v6.09 — see the next section.)*

## A Roth IRA under Other accounts is counted once in the Withdrawal tab, as Roth money (v6.09)

*(v6.09, D-35 — `docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md`; `qa/t72_engine_d_other_roth.mjs`.)*

**The law.** A qualified distribution from a Roth IRA is not income at all (26 U.S.C. §408A(d)(1)), so spending one realizes neither ordinary
income nor a capital gain; and a Roth IRA carries no required distribution in its owner's life (§408A(c)(4)).

**What the model did through v6.08.** Engines A, B and C were right: they count Roth money entered under Other accounts in each person's Roth
balance and keep it out of their taxable balance. Engine D — the Withdrawal tab, whose spending-draw and realized-gain series the other three also
read — holds every Other account in its Priority-1 pool, and counted a Roth IRA there **twice**:
- as **brokerage**: the pool's gains-bearing part took out ordinary and HSA money but not Roth money, so the Roth IRA's growth was booked as
  capital gain when it was spent, and that gain reached the Taxes and IRMAA tabs — the conservative direction, and wrong in law;
- inside the **buckets' Roth share**, which was figured on every Roth dollar the household holds although the buckets hold only the holdings'
  money — so their Traditional share, and every bucket RMD, was understated: the optimistic direction.

The Withdrawal tab showed the double count as well: the Roth IRA was in the Priority-1 card's starting balance and again in the Roth card's.

**What it does now.** The Roth money sits in the pool's tax-free remainder, with the HSA money and (since v6.08) converted IRA money, so spending it
is untaxed and realizes nothing; the buckets' Roth share is the holdings' Roth money only, as their Traditional share has been the holdings'
Traditional money only since v5.26. The Roth card shows the holdings' Roth money; the Priority-1 card says a Roth IRA entered under Other accounts
sits there, is spent tax-free, carries no RMD, and is counted there only.

**The check that it is right.** A Roth IRA under Other accounts and the same money entered as brokerage sit in the same pool and differ only in tax
character, so their buckets must be identical. From v6.09 they are, year by year (`t72` §A): on the example household plus $200,000 of either, the
lifetime RMD at $70,000 a year is $470,488 for both — it was $343,192 for the Roth IRA. Only the brokerage realizes a gain.

**A household with no Roth IRA under Other accounts is untouched** — the example household (which holds none) at $0 and $70,000, its single-filer
variant, the same household with brokerage in place of the Roth IRA, and an IRA-heavy household are bit-identical in Engines B, C and D and in the
Roth tab's strategies, and `t72` §D re-checks that against v6.08 on every suite run.

**Measured** (the example household plus Roth IRAs under Other accounts; $70,000 a year unless stated). *$200,000 of Roth IRA:* lifetime RMD $343,192
→ $470,488, realized gain $29,227 → $2,777 (the example's own brokerage), the Taxes tab's lifetime tax $215,825 → $215,702. *$500,000 of Roth IRAs:*
lifetime RMD $266,326 → $558,790, realized gain $196,853 → $4,909, lifetime tax $221,644 → $213,744. *A single filer with $200,000:* lifetime tax
$220,145 → $221,830, lifetime IRMAA $3,450 → $1,150.

**Direction — both ways.** The Withdrawal tab's RMD and MAGI rise (the optimistic half goes); phantom capital gain on Roth money disappears (the
conservative half goes). The Taxes and IRMAA tabs move a little either way, through the two series they import: less gain arrives, and a higher
bucket Traditional share makes each spending draw from the buckets more ordinary.

**What is still approximate.** The Priority-1 pool — a Roth IRA under Other accounts included — is still spent first, the opposite of the usual
advice to spend Roth money last; the draw order has not changed since v5.26, and spending tax-free money first leaves Traditional money growing
longer, the conservative direction. Every Roth dollar is treated as a qualified distribution: the five-year rule and withdrawals before 59½ are not
modelled, here or for the holdings' Roth money.

## The Ranking tab's peer figures, and where each comes from (v6.10)

*Not a modelling change — no engine reads these figures. Recorded here because the tab now states that its survey figures are computed,
and this is where a reader looks for how.*

**One table.** Every peer figure the Ranking tab shows or ranks against is in one module-level table, `PEER_BENCHMARKS`, beside
`PEER_DATA_SCF_YEAR`. Through v6.09 the net-worth cut-offs were typed at three sites, two figures were repeated inline in prose and the
survey year was typed as text at three sites; `t73` §B holds the table to being the only copy.

**The Federal Reserve's Survey of Consumer Finances (2025).** Computed by `qa/tools/peer_scf.py` from the Fed's Summary Extract Public Data
(`scfp2025excel.zip`, released 2026-10-09). The weight is the extract's `WGT`, which the Fed's own summary-variable macro defines as
`X42001/5` "so totals estimated on the 5 implicates jointly are correct", so every figure is computed on all five implicates **pooled**. The
population is families whose reference person is 55–64 (`AGECL` 4), except the mortgage share, which is families whose reference person is
60 or older. A weighted percentile is the smallest value whose cumulative weight reaches that share. Dollars are 2025 dollars, as the survey
publishes them; they are not indexed to today, so peers sit one year of inflation behind a plan stated in today's dollars.

| Figure | Definition | 2025 |
|---|---|---|
| Median / mean net worth | `NETWORTH` | $411,340 / $1,871,019 |
| Net-worth cut-offs — tiers and the affluent proxy | weighted 75th, 87.5th, 90th, 95th percentiles of `NETWORTH` | $1,416,200 · $2,925,250 · $3,457,640 · $7,545,000 |
| Portfolio-size cut-offs | weighted 90th, 95th percentiles of financial assets, `FIN` | $1,950,000 · $4,928,350 |
| Retirement savings, median / mean | `RETQLIQ`, families holding any (`HRETQLIQ` = 1) | $239,000 / $670,248 |
| Household debt, median / mean | `DEBT`, families holding any (`HDEBT` = 1) | $101,000 / $197,305 |
| Under $100K saved | share of ALL 55–64 families with `RETQLIQ` < $100,000 | 61% |
| Mortgage at 60+ | share of families 60+ with `NH_MORT` > 0 | 33% |

**The check.** Before it prints, the script requires its median and mean net worth for ages 55–64 to agree with the Fed's published figures
(the 2025 Bulletin's Table 2, $411.9K and $1,878.0K) within 2%. The Bulletin uses the Fed's internal data and the extract is the public
data, so exact equality is not expected. Measured: **−0.14% and −0.37%**. The mean retirement savings, $670,248, also matches the Bulletin's
$670.2K for families with an IRA or a DC plan.

**The v6.09 cut-offs were far below these, and their source is unknown.** v6.09 tiered net worth at $780K, $1.9M and $3.2M as the 75th,
90th and 95th percentiles for ages 55–64; the 2025 figures are $1.42M, $3.46M and $7.55M. Three years of growth does not explain that gap:
the Bulletin's mean for the group rose 9.5% in real terms, from $1,714.7K to $1,878.0K. The same 2025 extract gives **all-ages** cut-offs of
$813K at the 75th percentile and $2.54M at the 90th, so the old figures are consistent with an all-ages table read as the 55–64 one. **That is
not confirmed:** confirming it needs the 2022 extract, which was not available to the build. Either way, the effect of the refresh is in
the **conservative direction**: on the example household, net worth falls from TOP 10% to TOP 25%, portfolio size from TOP 5% to TOP 25%,
and the headline from TOP 11% to TOP 14%.

**The other sources.** Empower's engaged-saver balances are its September 2026 figures (a self-selected platform sample, not a population
statistic). The Social Security figure is SSA's average monthly retired-worker award in 2024 across all claiming ages, $2,036 (Annual
Statistical Supplement 2025, Table 6.B3). Through v6.09 this was $2,000 labelled "at 62"; awards reduced for early retirement, as every claim
at 62 is, average $1,620. The EBRI, AALTCI and Roth-plan percentages are carried unchanged and were not re-verified.

**What the refresh did not fix — fixed at v6.11.** Through v6.10 the tab's headline "TOP N%" averaged nine dimension tiers, and eight of
them had no peer data behind them (`docs/UsabilityFlaws.md` F-19r). See the next section.

## The Ranking tab ranks only what has a peer distribution (v6.11)

**Two quantities are ranked, both against the SCF figures above:** net worth (portfolio plus home equity) in bands at the 50th, 75th, 90th and
95th percentiles of families 55–64, and the investable portfolio against the 90th and 95th percentiles of their financial assets. **The
headline is the net-worth band**, labelled with its population and survey; below the median it says "Below the median". The portfolio row
reads "Below the top 10%" under the 90th percentile, because the derivation has no lower cut-off for financial assets.

**The other rows are not ranked.** Retirement readiness (the model's own Monte Carlo success rate), income replacement, debt and housing
equity each show the household's own figure beside a survey figure that measures something different — EBRI's share of workers on track,
SSA's average award per retired worker, the mean debt of families holding any, the share of families 60+ with a mortgage — with no tier and
no ratio. Three rows that stated facts the app cannot know about a household (a Roth plan, long-term-care cover, a planning framework) were
removed.

**What v6.10 did.** The headline was the plain average of nine row tiers; five were fixed strings ("TOP 20%", "TOP 10%", "TOP 5%", "TOP 15%",
"TOP 5%") and two came from thresholds on the household's own figures, so every possible household read between TOP 9% and TOP 18%
(all 72 reachable combinations enumerated). Measured with the Monte Carlo re-run: a $20,000 portfolio with no home — about the 2nd
percentile of net worth — read **TOP 18%** and "an exceptionally strong position"; the example household read TOP 14%. The copy around the
headline ("by virtually every dimension", "You have all three", "fewer than 10% of your peers possess") rendered for every household.

**The national percentile** the header, the affluent card and the Bottom Line quote is one figure, computed once: log-linear between the
cut-offs and linear below the median, so it is approximate between them. It is the same interpolation v6.10 used on the affluent card.
Nothing in this section is read by an engine.

## The Withdrawal tab's Bracket column is figured on the household's own return (v6.12)

**What the column is.** The federal marginal rate on the year's ordinary income, in the Withdrawal tab's year-by-year schedule (Engine D).
It is a display: no dollar figure is computed from it, and nothing that sets a balance or feeds another tab reads it.

**How it is figured, from v6.12.**
- *Social Security* is taxed by the shared §86 helper, the IRS worksheet that every other engine has used since v5.77. Provisional income
  is every ordinary term in the year — pension, work, ordinary income streams, RMDs, Traditional spending draws, the Other-account ordinary
  draw, conversions — plus the year's realized capital gain, as §86 requires.
- *Filing status* follows the year: joint while both spouses are alive, through the year of the first death; Single from the year after
  (IRS Pub. 501). A single household files Single in every year. These are the same years Engines A, B and C use.
- *The table and the deduction* come from the Roth tab's year-by-year projection: the 2026 table for the year's filing status (Rev. Proc.
  2025-32), the standard deduction plus the age-65 additional deduction for each person 65 or older on the return (on a Single return, the
  filer only), both indexed at the plan's inflation less 0.25 point (the chained CPI, §1(f)(3) and §63(c)(4); v6.30 — 2%/yr through
  v6.29). The temporary OBBBA senior deduction (2025–2028) is not applied, as on the Roth tab.
- *The rate* is read on ordinary taxable income: Social Security as taxed, plus the ordinary terms, less the deduction. Realized gain counts
  toward the §86 test and is part of the year's MAGI, but it is taxed at capital-gains rates on the Taxes tab, not at this rate. All seven
  bands can show.

**What it did through v6.11.** 85% of benefits in every year, whatever the household's other income; the 2026 joint table and standard
deduction for every household and every year, a single household and a widowed survivor included; never indexed against the schedule's
nominal income; no age-65 deduction; capped at 32%; realized gain inside the rate's input. Measured at the scope on five households (base
scenario, no conversions): the column was wrong in 73 of 98 years. In married years it read too high (the example shows 12% where the
correct figure is 10% in 2031–2036, and 22% for 12% in 2042–2043; a modest couple living on Social Security showed 10–12% in twelve years
in which its taxable income is below the deduction). In single and survivor years it read too low: the example made single showed 12% in
all sixteen years against a correct 22%, and the example's survivor showed 12% for 22% in 2045–2047, so the widow's penalty the other tabs
describe never appeared on this one.

**What did not change.** Every balance, draw, RMD, conversion and gain in the schedule, the series the Taxes and IRMAA tabs import, and
every other tab: asserted bit-identical to v6.11 on ten households at two conversion amounts (`t75` §C). The schedule's MAGI changes,
because it carries the worksheet's taxable Social Security; nothing outside this column reads Engine D's MAGI.

**Approximations kept.** Thresholds rise at the plan's inflation less 0.25 point, as the chained CPI does against the CPI the schedule's
income grows by, so a quarter-point of bracket creep a year remains — the law's own, not the model's. Through v6.29 they rose 2%/yr
against income rising 2.5–2.7%, and the column compared retirement-clock income with thresholds indexed from the as-of year; from v6.30
both run on the as-of clock (*One dollar unit and one inflation clock for the tax engines*). State tax is not in this column. Worksheet lines 4
and 6 (tax-exempt interest, adjustments) are not modelled, as in every engine.

## Payroll tax on job income (v6.14; self-employment from v6.16)

**The rule.** An employee's job income — a job row of type "Job — employee (W-2)" under Other income streams, or the built-in part-time
taper for spouse B (from v6.23 the example household's alone; through v6.22 any plan's when no stream was entered) — is taxed as **wages**, the employee's half, in the Taxes tab (Engine B) and the Roth strategy comparison (Engine A, in its tax
and in its sale-gain estimate). One shared helper, `payrollTax`, applies 26 U.S.C. §3101 and §3121(a)(1):
- **Social Security, 6.2%, on each earner's wages up to the year's wage base.** The cap is per person: two spouses each earning $150,000
  each pay on all of it. The 2026 base is $184,500 (SSA), projected at the plan's inflation (v6.30; 2%/yr through v6.29). The law
  indexes it by the national average wage index (42 U.S.C. §430(b)), not by a price index — see the simplifications below.
- **Medicare, 1.45%, on all wages.**
- **The Additional Medicare Tax, 0.9%, on the household's wages above $200,000 (Single) or $250,000 (joint).** The thresholds are
  statutory and **not indexed** (IRS, Instructions for Form 8959), so a fixed nominal income crosses them more easily over time, as with
  NIIT. The filing status is the year's: joint through the year of the first death, Single from the next.
- **Who earned it.** B's taper is B's; a job row is its owner's; a job row owned jointly is split equally between the spouses — the
  conservative reading, since a split can only raise the capped Social Security tax. With one person (a single household, or after the
  first death) every dollar is that person's; a deceased owner's row has already stopped.
- The rates and thresholds live in `TAX_CONSTS` and each has a Verify-tab check citing the statute.

**Self-employment (v6.16, D-36).** A job row of type **"Job — self-employed (1099)"** (stored as `kind: "work"` with
`selfEmployed: true`) pays **self-employment tax** in place of the employee's half, through the same helper and the same three call sites:
- **Net earnings are 92.35% of the profit** — the profit less half of the 12.4% and 2.9% rates (26 U.S.C. §1402(a)(12)). The row's amount
  is read as the year's net profit; a stream is never negative, so losses are not modelled.
- **Nothing is owed if a person's net earnings are under $400** (§1402(b)(2)); the floor is statutory and unindexed (`SE_MIN_NET`, with a
  Verify-tab check).
- **Social Security, 12.4%, on net earnings up to the wage base *minus that person's wages*** (§1401(a), §1402(b)(1)): a person with a
  paycheck and a side business shares one base between them, earner by earner. **Medicare, 2.9%, on all net earnings** (§1401(b)(1)).
- **The 0.9% falls on the household's wages plus net earnings** above $200,000 (Single) or $250,000 (joint) — §1401(b)(2) reduces the
  self-employment threshold by the wages, which comes to the same thing.
- **Who earned it** follows the wage rule: the owner's, a joint row split equally while both spouses live, everything the survivor's after.
  A row saved before v6.16 has no field and stays an employee, so its figures do not move; My Data's note asks the user to choose.
- Every rate is derived from the employee-side constants (2 × 6.2%, 2 × 1.45%, 1 − 7.65%); no self-employment rate is typed anywhere.

**Measured at v6.16** (the example household plus job rows in the first five plan years, 2029–2033; Engine B, v6.15 → v6.16; year-2029 payroll
tax and the five-year change, which is also the change in lifetime total tax — nothing else in Engine B moves):

| Household | 2029 payroll tax | 5-year change |
|---|---|---|
| A self-employed $60,000 | $4,590.00 → **$8,477.73** (55,410 × 15.3%) | +$19,438.65 |
| A self-employed $30,000 + B employee $40,000 | $5,355.00 → $7,298.87 | +$9,719.32 |
| A employee $150,000 + A self-employed $60,000 | $15,184.16 → **$18,760.21** (the base shared with the paycheck) | +$19,374.64 |
| A self-employed $250,000 | $15,764.16 → $30,973.69 | +$78,524.54 |
| Single, A self-employed $120,000 | $9,180.00 → $16,955.46 | +$38,877.30 |
| A self-employed $430 a year (net $397.11, under the floor) | $32.90 → $0.00 | −$164.48 |
| The example household; any household with employee rows only | unchanged, bit-identical | $0 |

In the Roth strategy comparison (Engine A) the $60,000 household's strategies pay $19,329–$19,439 more tax and leave estates $53,299–$53,602
smaller. Engine A carries balances forward, so where the extra tax leaves enough less invested to lower later IRMAA, survivor-year tax or
NIIT, its lifetime change is smaller than Engine B's (the $250,000 household: +$75,125 against +$78,525 for the no-conversion strategy;
in the first plan year every strategy moves by exactly Engine B's figure). The direction for anyone self-employed above the floor is up —
an optimism corrected. The one figure that falls is a self-employed row under the $400 floor, which the law does not tax.

**What it did through v6.13.** Every site took min(household wages, base) × 6.2% + wages × 1.45%: **one** wage-base cap for the whole
household, and **no** 0.9% — both errors taking too little tax (register items C-14 and D-17). Measured at the v6.14 scope on the
example plus job rows in the first five plan years: one $300,000 job, +$2,250 of tax over the five years (the 0.9%); two $150,000 jobs,
**+$32,077** (+$29,827 of it the per-earner cap: in 2029 the household was taxed on $195,793 of Social Security wages where the law taxes
$300,000), lowering the comparison's estate at the default slider by $88,757; two $120,000 jobs, +$11,227; a single household's
$250,000 job, +$2,250 (above $200,000). Two $60,000 jobs, and the example household itself (whose built-in work peaks at $20,000), do not move.

**What did not change.** The IRMAA, Withdrawal and Monte Carlo engines carry no payroll tax and are bit-identical (v6.14, and again at
v6.16 on every household tested); the Roth tab's ladder has none either. Rental, annuity and other ordinary streams still pay no payroll
tax (v5.63). *(From v6.20 the Monte Carlo pays the Taxes tab's tax, payroll tax on job income included — see* The Monte Carlo pays the
Taxes tab's tax (v6.20) *at the end of this document.)*

**Simplifications, stated.** Two self-employment deductions are **not taken** (MissingFeatures D-37), both conservative — income tax
runs high: the **deduction for half the self-employment tax** (26 U.S.C. §164(f), taken above the line, so it would also lower AGI and every
MAGI built on it — IRMAA, the ACA subsidy, the Social Security worksheet and state AGI; on $60,000 of profit it is $4,238.87, worth about
$509–$933 of federal tax a year at 12–22%), and the **qualified business income deduction** (§199A, up to 20% of a sole proprietor's net
profit, limited for service businesses above the thresholds). Taking §164(f) correctly means changing MAGI in the IRMAA, Withdrawal and
Roth-ladder engines too, or the tabs would disagree — a wider release. Net losses, the optional methods on Schedule SE, and Social Security
credits earned by self-employment are not modelled. The wage base is projected at the plan's inflation (v6.30; 2%/yr through v6.29); SSA indexes
it to the national average wage index (42 U.S.C. §430(b)), which has usually risen faster than prices, so later-year caps likely run a little
low — slightly optimistic, and reset at each annual refresh. It is the one indexed figure the model projects at a rate it knows to be off
in a known direction; there is no wage assumption in the model to project it by. Employer
withholding rules and the credit for excess Social Security withheld by two employers are timing, not liability, and are not modelled.

## Cash from a home move (v6.17)

**The rule.** The Monte Carlo engines (`runMonteCarlo` and `runExtendedMC` — the Monte Carlo, Stress and Dashboard figures and the Future
Home mortgage what-if) add one figure to the portfolio in the quarter the plan retires: the **cash from a home move**, the My Data field
*Cash from your home move at retirement* (`PORTFOLIO.homeMoveCash`). It is a net: what is left after selling the current home, paying off
its mortgage and the selling costs, and paying cash for the next one. It is **negative** when the next home costs more (cash is taken from
the portfolio) and **0** when there is no move. The mortgage what-if adds its borrowed principal on top of it and draws the payment. The
next home's other costs stay where they were — rows in the expense table (closing costs as a one-time row, so they are not subtracted in
the field as well). One accessor, `homeMoveCash()`, reads the field at all five model sites (each engine's planned path and simulated
paths, and the Events retirement card); a value is clamped to ±$10,000,000 and anything unparseable reads 0.

**What it did through v6.16 (D-38).** The figure was a constant, `HOME_SALE_PROCEEDS = 130000`, added to **every** plan — the example, a
blank plan, an imported backup — whether or not anyone was moving, and no text but one Events card mentioned it. That was optimistic for
every household not moving, and for every household whose next home costs more than the old one nets. Measured at the v6.17 scope on the
example household (4,000 paths, one random seed for every row; the 6-year headline and the 30-year run with a long-term-care shock and
deaths at life expectancy):

| Cash from a home move | 6-year: above $800K | 6-year median | 30-year: above $800K | 30-year ruin | 30-year median |
|---|---|---|---|---|---|
| +$130,000 (every plan through v6.16) | 99.3% | $1,977K | 81.1% | 2.2% | $1,604K |
| $0 (no move) | 99.2% | $1,851K | 74.8% | 3.4% | $1,352K |
| −$105,000 | 98.5% | $1,720K | 67.6% | 4.7% | $1,151K |

On a smaller household (the example's holdings at 40%) the 6-year headline falls from 64.8% at +$130,000 to 39.2% at $0.

**Plans that have no field.** The example keeps $130,000, so none of its figures move (DC-3). A plan built with Start Fresh or the guided
wizard starts at $0. A plan or backup saved before v6.17 reads **$0** — the conservative reading, since the $130,000 was never the user's
choice — and My Data and the Monte Carlo tab say so until the next Save & Apply writes the field (DC-2).

**What did not change.** Engines A (the Roth strategy comparison), B (Taxes), C (IRMAA) and D (Withdrawal), the drawdown bridge series and
the Roth tab's ladder never read the figure; they are bit-identical across v6.16 → v6.17 on every household tested, with the field at
+$130,000, $0, −$105,000, +$250,000 or missing.

**Simplifications, stated.**
- **Only the Monte Carlo figures include it** (DC-4). The Withdrawal tab's schedule, and the Taxes, IRMAA and Roth tabs, do not see the cash —
  so a large positive figure is in the Monte Carlo's portfolio but not in the Withdrawal tab's pool (MissingFeatures **D-39**).
- **It arrives in the retirement quarter** (DC-5); a move years before or after retirement is not modelled.
- **The sale is treated as tax-free.** 26 U.S.C. §121 excludes the gain on a principal residence up to $250,000 ($500,000 on a joint return)
  when the ownership and use tests (two of the last five years) are met; a gain above that, or a sale that fails them, is not taxed here —
  optimistic, and rare for the mainstream couple this app models.
- **Nothing is derived from Home value and Mortgage balance.** Those fields still feed the Ranking tab and the Ask AI context; My Data shows
  today's equity from them only as a starting point for the field.

## The Withdrawal tab spends the expense table year by year (v6.18)

**The rule.** Engine D (the Withdrawal tab), Backtest and What-Breaks spend one function, `tableYearExpense(yr, survivorFromYr)`: for a
calendar year, the sum of every monthly row over the months it runs that year, times the survivor factor (0.75) from the first death on,
plus that year's one-time rows (no survivor factor — a one-time row is a specific purchase). The amount is in the table's own dollars
(today's); Engine D inflates it at the scenario's expected inflation — from the retirement year through v6.29, from the as-of year since
v6.30 (D-60) — Backtest by each historical sequence's
inflation, What-Breaks at its own rate. Backtest applies no survivor factor, as before. The two Monte Carlo engines read the same table
once a quarter — `getMonthlyExpense` and `getOneTimeExpenses` at the quarter's last month (March, June, September, December) — and did not
change; so they charge a one-time row only when it is dated in one of those months (MissingFeatures **D-45**, below). *(As of v6.18. From
v6.20 both engines read every month of the quarter and charge a one-time row in its own quarter, inflated — the two bullets marked
"Closed at v6.20" below.)*

So, for the example household: 2029 is **$126,280** — $98,280 of monthly rows for the months they run (the current home's costs through
March, the retirement rows from April) plus $28,000 of one-time rows (the golf cart and the closing costs); from May 2034 the $400 car
payment is gone. The retirement-year buttons keep the table on its calendar dates: retiring a year early spends the pre-retirement rows
until the table ends them, as the Monte Carlo already did for that button.

**The display figures.** The "pre-retirement", "post-retirement" and "after spouse B's Medicare" spending quoted in eleven places (the header,
the Expenses, Income, SS, Grade, Ranking, Backtest, What-Breaks, Survivor and Stress tabs, and the Ask AI context) are the table at one month
each, taken from the plan's own timeline by one rule: **the later of the event's month, June of the event's year, and the as-of month.**
Pre-retirement's event is the as-of date; post-retirement's is the retirement date; the Medicare figure's is the later of spouse B's Medicare
date and the retirement date (spouse A's for a single plan, as Engine D uses). On the example the rule gives 2026-06, 2029-06 and 2031-06,
so none of its figures moved. No engine reads these three figures.

**What it did through v6.17 (D-41).** All three engines spent two of those figures for life — the table at **June 2029** before spouse B's
Medicare year and at **June 2031** after it — and the two months were the example household's, typed into the code. So:
1. a plan on any other calendar spent the wrong rows: retiring in 2032, the June 2029 table still held the current home's mortgage, taxes,
   HOA, utilities and insurance, and none of the retirement rows;
2. a row ending after June 2031 was charged for life (the example's car payment), and one starting later was never charged;
3. one-time rows never reached them.
The Taxes, IRMAA and Roth tabs inherited it: they take Engine D's draws through the bridge (`withdrawalPlanSeries`).

Measured at the v6.18 scope (Engine D, the $70,000 conversion slider, base scenario):

| Household | Read | First-year spending | Lifetime spending | Ending portfolio | Taxes tab lifetime tax |
|---|---|---|---|---|---|
| Example (retires 2029) | v6.17 | $98K | $2,986K | $1,868K | $215K |
| | year by year | $126K | $2,893K | $1,977K | $215K |
| Every date 3 years later (retires 2032) | v6.17 | $80K | $2,492K | $2,711K | $219K |
| | year by year | $126K | $2,893K | $1,977K | $223K |

The second household is the same plan on a later calendar. Through v6.17 it spent $401K less and ended $734K richer than its own table,
read year by year, says it should — and $494K less / $843K richer than v6.17 itself gave the same plan on the example's dates — **optimistic**, for anyone retiring after the example whose pre-retirement rows end at retirement, which is how My Data
asks for them. On the example itself the change is mixed: the one-time rows are conservative to include, the car payment's end optimistic.

**How the moved figures are attributed.** Every pinned figure the change moved (38 checks in ten suites at the probe) was re-pinned only
with its attribution in the same run: `qa/tools/v617_spending.mjs` writes v6.17's two figures as an expense table — the June 2029 amount
until spouse B's Medicare year, the June 2031 amount from it, no one-time rows — and v6.18 fed that table reproduces v6.17's Engine D on
every household tested, every field, to 1e-6 (t81 D-4). The suites that pin Engine D figures run a second time on the v6.18 leg with that
table (the "-spend617" lines in `runsuite.sh`), and every v6.17 figure comes out exactly; so each move is the spending read and nothing
else. A table that changes only in January of the retirement year or of spouse B's Medicare year, with no one-time rows, moves nothing
across v6.17 → v6.18 (t81 D-2). The survivor years agree to the last bits of a double rather than bit for bit, because v6.17 applied the
survivor factor after inflating and v6.18 before.

**Simplifications, stated.**
- **The inflation base is unchanged** *(true at v6.18; changed at v6.30)*. Engine D inflated spending and Social Security from the retirement
  year (the pension flat) and started from today's balances without growth. From v6.30 it prices from the as-of year, as the Monte Carlo
  does, and carries today's balances to retirement at the plan's inflation — the same real value, so v6.18's reading of "no growth" is kept
  (*One dollar unit and one inflation clock for the tax engines*; the contribution-accrual section's *no real growth* note).
- **Closed at v6.35** *(D-44)*. **A one-time row dated before the retirement year was not in the Withdrawal tab's schedule** (it starts at
  retirement, from today's balances), nor in Backtest's or What Breaks'. From v6.35 all three start from today's holdings less those rows
  (*STAY UNDER IRMAA, the last working years, and one-time rows before retirement (v6.35)*). MissingFeatures **D-44**.
- **Closed at v6.20** *(D-44, the Monte Carlo half)*. **The Monte Carlo subtracted one-time rows in today's dollars** while it inflated
  the monthly rows — optimistic by the inflation to that date, small. From v6.20 both engines grow a one-time row with the run's
  inflation, like the monthly rows beside it (*The Monte Carlo pays the Taxes tab's tax (v6.20)*).
- **Closed at v6.20** *(D-45, and the monthly read)*. **The Monte Carlo sampled one month per quarter** — the quarter's last — and Engine
  D, Backtest and What-Breaks sum all twelve. From v6.20 both engines read every month of the quarter (a one-time row is charged in the quarter
  that contains its month; a monthly row counts its own months), and a year's four quarters add up to `tableYearExpense` (t83 D). What it did
  through v6.19, as recorded at v6.18: a monthly
  row that starts or ends inside a quarter is counted for a few more or fewer months there; and **a one-time row dated in any other month
  is never charged** by the Monte Carlo — the example's April 2029 golf cart and closing costs ($28,000) never reach it (measured: both
  engines byte-identical with or without them; dated June they move both). A row added in My Data is dated June, so it is charged; rows
  from the example, a spreadsheet import or a hand-edited backup may not be. Found at the v6.18 build; the v6.18 scope's premise had said
  the Monte Carlo charges one-time rows "when they fall". Optimistic for the Monte Carlo; not changed here. MissingFeatures **D-45**; the
  Field Manual says so.

## The Monte Carlo's calendar (v6.19)

**The rule.** Both Monte Carlo engines (`runMonteCarlo`, the 6-year chart; `runExtendedMC`, runs A–D, the stress set, the Dashboard and the
mortgage what-if) step one quarter at a time from the plan's as-of date, on **one calendar**: quarter 0 is the calendar quarter that
contains the as-of date, quarter *q* the *q*-th calendar quarter after it, and each quarter is dated by its own year and last month (March,
June, September, December) — the date at which the engines read the expense table and the one-time rows, compare with the Roth ladder's
end and the mortality years, and pass to the Social Security trust-fund factor and the income streams. An event falls in the quarter that
contains its date: retirement and spouse B's retirement (always 1 January), and each Social Security claim. Two refinements, both exact to
the month: **the first quarter counts only the months from the as-of month on** — contributions and the bonus, spending, income, the
inflation step and the quarter's return are all scaled by 3/3, 2/3 or 1/3 (the as-of month counts in full; the return, noise included, is
scaled linearly); and **a claim pays from its own month** — a November claim is paid two of its quarter's three months. The bonus is paid in
the January–March quarter of each working year. A plan whose retirement date falls before its as-of quarter gets no home-move cash (the
balance on the as-of date already holds it); one saved in its retirement quarter gets it in quarter 0. Runs B and C cover ten and thirty
years **from the as-of date**; run A runs to the retirement quarter.

**What it did through v6.18 (D-46).** Both engines dated quarter *q* as `as-of year + ⌊(q+1)/4⌋`, month `((q+1) mod 4)·3 + 3` — quarter 0
was "June of the as-of year" for every plan — while deciding when things happened by two other rules:
- `runMonteCarlo` placed events at `round(months from the as-of month ÷ 3)`. Its labels were right only for an as-of date in April–June,
  and `round` disagrees with the calendar for some months: with an as-of date in a quarter's first month, an event in a quarter's last month
  landed a quarter late; with an as-of date in a quarter's last month, an event in a quarter's first month landed a quarter early. It was
  right for every event only with an as-of date in May — and in April, the example's month, while no event fell in a quarter's last month.
  The setup wizard builds as-of 1 January with both claims in June: both claims a quarter late, under labels a quarter late.
- `runExtendedMC` placed events at quarters counted from **January** of the as-of year and never read the as-of month — so its figures were
  identical for every as-of date in the same year, and for an April–June as-of date it retired, and paid each claim, one quarter late.
- The year 2026 was typed into the machinery: run A's length and label, the chart's axis, the Stress tab's 30-year table, and the current
  ages stochastic longevity starts from. The run headers said runs B and C start at retirement; they start at the as-of date.

For a January 2029 retirement:

| As-of date | 6-year engine: retires in the quarter it labels | 30-year engine: retires in the quarter it labels | Right |
|---|---|---|---|
| 2026-01-15 | June 2029 | June 2029 | Jan–Mar 2029 |
| 2026-04-18 (the example) | March 2029 ✓ | June 2029 | Jan–Mar 2029 |
| 2026-06-15 | December 2028 | June 2029 | Jan–Mar 2029 |
| 2026-07-15 | December 2028 | June 2029 | Jan–Mar 2029 |
| 2026-10-18 | September 2028 | June 2029 | Jan–Mar 2029 |
| 2027-01-15 | June 2029 | June 2029 | Jan–Mar 2029 |

**What it moved** (measured at the scope on a session-only prototype; BASE, 3,000 paths, run C's shape):

| Household | 6-yr median | 30-yr >$800K | 30-yr median |
|---|---|---|---|
| Example (as of 2026-04-18) | $1,990K → $1,990K (bit-identical) | 81.0% → 80.3% | $1,609K → $1,565K |
| Example, as of 2026-06-15 | $1,968K → $1,971K | 81.0% → 79.3% | $1,609K → $1,540K |
| Example, as of 2026-10-18 | $1,947K → $1,939K | 81.0% → 78.4% | $1,609K → $1,500K |
| Example, as of 2026-11-20 | $1,947K → $1,932K | 81.0% → 78.0% | $1,609K → $1,487K |
| Single, as of 2026-10-18 | $1,876K → $1,868K | 86.6% → 84.9% | $1,503K → $1,414K |

The 30-year figures were **optimistic** for most plans — the engine accumulated a quarter or more longer than the plan does — and more so the
later in the year a plan was saved. The 6-year figures barely move and, on the example, not at all.

**How the change is attributed.** On the example's April as-of date with January events, the 6-year engine is bit-identical across v6.18 →
v6.19 (`t82` C), and the 30-year engine is bit-identical to a module built from the v6.18 source with its four event quarters — retirement,
spouse B's retirement and the two claims — each one earlier (`t82` D, on every April household with first-month claims): that is the whole
of its move there. Away from that shape, the calendar is checked against an oracle written from dates for an as-of date in every month of two
years and every event month (`t82` A), and the planned balance at retirement is shown to change smoothly with the as-of date (`t82` I) —
which v6.18's did not, stepping by a quarter in some months and not at all in others.

**Simplifications, stated.**
- **Quarters stay the unit.** An as-of date on the 28th counts its whole month; nothing is stepped monthly.
- **The first quarter's return is scaled linearly** (the regime return and its noise times the share), not compounded by the month.
- **My Data's as-of date is the UTC date of saving**, so an evening save in the Americas on a quarter's last day falls in the next quarter
  (MissingFeatures, filed at v6.19).
- **Closed at v6.20** *(D-45)*. **The Monte Carlo still read one month per quarter** for the expense table and charged a one-time row only if it
  was dated in a quarter's last month — the quarter's true last month from v6.19 (D-45; fixed at v6.20 with D-40 and D-44).
- **Closed at v6.21** *(D-47)*. **The Stress tab's 30-year table** compared the median with `household × 1.04^years`, a benchmark that ignored
  withdrawals (filed at v6.19); from v6.21 its Planned column is the engine's own planned path (*Cars are expense rows (v6.21)*).

## The Monte Carlo pays the Taxes tab's tax (v6.20)

**The rule.** Both Monte Carlo engines pay one income-tax schedule — `mcIncomeTaxSchedule`, the Taxes tab's `totalTax` (federal, capital
gains, NIIT, AMT, payroll tax on job income and state) for each year of the plan, computed exactly as the Taxes tab computes it: Engine D's
bridge (`withdrawalPlanSeries`) into Engine B (`computeTaxPlan`), at the **live conversion slider, QCD and dividend-yield settings** and the
selected scenario preset. In each retirement quarter an engine subtracts a quarter of that calendar year's tax, **times the quarter's
inflator** — the planned inflation on the planned path, the path's own cumulative inflation on a simulated path — times the share of the
quarter the plan lives through (a part first quarter pays a twelfth of the year's tax per counted month). Nothing is charged before
retirement (pre-retirement income tax is withheld from pay, and the contributions the engines add are net of it). A year after the
schedule's last row — a survivor who outlives the plan's horizon under stochastic longevity — pays the last row's tax, inflated; a retired
year before the first row pays nothing. The app computes the schedule once per retirement year whenever the slider, QCD, yield or preset
changes, so the 6-year runs re-run about 300 ms after the control settles, on whatever tab is open (the header's success rate is on every
tab and shows "…" meanwhile), and the 30-year runs, the stress set and the mortgage what-if re-run when their tabs are next opened. The
slider is not saved, so every visit starts at $70,000, as the Taxes tab does. A caller that passes no inputs gets the Taxes tab's opening
values under BASE — the weights the scenarios hold when the app loads.

**The expense table, by the quarter (D-44, D-45).** One read, built once per run (`mcQuarterSeries`), for both engines: a quarter's
**one-time** rows are the sum over its counted months — so a row is charged once, in the quarter that contains its month, whatever the month
— grown with the quarter's inflator like the monthly rows; its **monthly** rows are the mean of its counted months, so a row that starts or
ends inside a quarter counts only its own months. A year's four quarters add up to `tableYearExpense`, the year Engine D, Backtest and
What-Breaks spend (t83 D). One-time rows are still charged before and after retirement, with no guardrail adjustment and no survivor factor
(Engine D's rule for them).

**What it did through v6.19.** The only income tax either engine charged was `ROTH_TAX_DRAG_Q`: a flat **$4,000 a quarter**, never inflated,
in each retirement quarter through the Roth ladder's last year, whatever the plan converted or owed — and nothing after the ladder, RMD years
included (D-40). On the example that is 48 quarters, $192,000 in nominal dollars over 2029–2040, against the Taxes tab's $214,590 in today's
dollars over 2029–2053 at the $70,000 slider under BASE. The Income tab showed it as "Roth conversion tax drag · ~$16K/yr · $4K/quarter
modeled in MC sim". Both engines read the expense table at each quarter's last month, so a one-time row dated in any other month was never
charged (D-45 — the example's April 2029 golf cart and closing costs, $28,000, never reached either engine), one that was charged was charged
in today's dollars (D-44), and a monthly row starting or ending inside a quarter was counted for the whole quarter.

**The dollar basis (v6.20–v6.29) — superseded at v6.30.** Through v6.29 Engine B held Social Security, the pension and income streams in
today's dollars, took Engine D's draws deflated to today's dollars and inflated its brackets, while its RMDs and realized gains were
nominal. v6.20 called a row's tax "to that approximation, in today's dollars" and charged it, grown with each path's inflation, as the
conservative reading (DC-3 (a)). v6.29 measured two readings and said both in the app — but its benchmark grew **only Social Security**,
so its figures were too small: with every unit made consistent at the same 2% index and clock, the shipped rows read as each year's own
dollars ran low by $97,925 at a $0 slider and $72,837 at $70,000 (v6.29 said $70,823 and $40,664), and read as today's dollars high by
$16,878 and $891 (it said $34,510 and $24,562); at $70,000 the Monte Carlo's charge was not measurably pessimistic (95.43% → 95.40%
above $500K, where v6.29 said 0.6–0.8 points). Those sentences are gone from the app. From v6.30 every engine computes each year in its
own dollars and the Monte Carlo is handed each year's tax in today's dollars (*One dollar unit and one inflation clock for the tax
engines*); the mechanism below — schedule × the path's inflation × the quarter's fraction — is unchanged.

**What it moved** (measured at the v6.20 build: the shipped v6.19 against v6.20, 3,000 paths, the same seeds per row; run C's shape — 30
years, deaths at life expectancy, one LTC shock, the car every 8 years (v6.20's fixed schedule — from v6.21 the example's car rows, *Cars are
expense rows*); the tax at each row's slider):

| Household (BULL-LEANING, the preset a first visit opens on) | Taxes tab tax, today's $ | 6-yr median | 30-yr >$500K | 30-yr median |
|---|---|---|---|---|
| Example (no state income tax) | $212K | $2,140K → $2,096K | 96.8% → 95.3% | $2,299K → $2,118K |
| Example in Georgia | $217K | $2,140K → $2,089K | 96.8% → 95.2% | $2,299K → $2,104K |
| Example, holdings ×1.6, Georgia | $369K | $3,326K → $3,273K | 99.7% → 99.0% | $5,002K → $4,467K |
| Example, holdings ×0.6 | $142K | $1,354K → $1,307K | 55.3% → 51.3% | $564K → $515K |
| Example, slider at $0 | $210K | $2,140K → $2,138K | 96.8% → 94.9% | $2,299K → $2,196K |
| Example, slider at $150K | $267K | $2,140K → $2,027K | 96.8% → 94.3% | $2,299K → $1,912K |
| Example, every date 3 years later | $220K | $2,525K → $2,523K | 98.2% → 97.4% | $3,077K → $2,824K |
| Example as a single household | $244K | $2,078K → $1,997K | 98.4% → 97.2% | $1,854K → $1,601K |

| Household (BASE) | 30-yr >$800K | 30-yr median |
|---|---|---|
| Example | 80.3% → 74.4% | $1,565K → $1,392K |
| Example, holdings ×1.6, Georgia | 97.0% → 92.6% | $3,509K → $3,030K |
| Example, holdings ×0.6 | 15.4% → 13.5% | $286K → $250K |
| Example as a single household | 86.3% → 77.9% | $1,466K → $1,234K |
| Example in Georgia | 80.3% → 74.2% | $1,565K → $1,381K |
| Example, slider at $0 | 80.3% → 74.1% | $1,565K → $1,428K |
| Example, slider at $150K | 80.3% → 71.4% | $1,565K → $1,265K |
| Example, every date 3 years later | 84.8% → 80.4% | $2,037K → $1,800K |

Every household tested reads lower: 0.7 to 4.0 points of 30-year success above $500K under BULL-LEANING, 1.9 to 8.9 points above $800K
under BASE. The 6-year figures barely move where the retirement years fall mostly after the run's 24 quarters; the 30-year figures carry the
change, because the flat figure stopped at the ladder's end and the Taxes tab's tax does not. **The slider now matters**: at $0 and $150K
v6.19 read identically (it never saw the slider); v6.20 reads 94.9% and 94.3%, medians $2,196K and $1,912K — conversions move tax earlier,
where it compounds against the portfolio longer, and at $150K the Taxes tab owes $57K more in total. The scope's measurements, on v6.18's
calendar, had the same direction and a slightly smaller range (0.7 to 3.4 points; 2.6 to 7.2).

**How the change is attributed.** On a table whose rows have integer amounts, start and end on quarter boundaries and carry no one-time
rows, v6.20 with an all-zero schedule is **bit-identical** to a module built from the v6.19 source with `ROTH_TAX_DRAG_Q = 0` — both
engines (runs B and C, stochastic longevity, sustained LTC, the mortgage what-if) on every fixture household, and all seven stress runs on
the example and the single household (t83 H): the release changes the tax, the one-time rows and the quarter read, and nothing else. Each of those is then exact on the
deterministic planned paths: the tax as its compounded series (t83 B, with a hand pin of the example's first two retirement quarters to the
cent), a one-time row in every month of two years as one charge in its own quarter (t83 C). Engines A, B, C and D are bit-identical across
v6.19 → v6.20 (t83 H, t2). The one pinned Monte Carlo figure that moved — t42 D-4, the married example's 6-year planned path, $2,128,443 →
$2,083,910 — is re-pinned with a five-step attribution in the same run, each step exact (t83 R): the drag removed **+$56,285**, the April
rows still uncharged by v6.19 **$0**, the monthly quarter read **−$375**, the one-time rows **−$34,995**, the tax **−$65,449**. With the
schedule held fixed, permuting the Other accounts' tax types or setting every plan type to "employer" in Rhode Island moves no Monte Carlo
figure (t83 G, t20, t56); computed from the plan, both move it, because both move Engine B.

**Runtime.** Building the schedule takes a few milliseconds, and each run now reads the expense table once instead of once per quarter of
every path: measured at the build, the three 6-year runs (10,000 paths) take 0.32× v6.19's time and one 30-year run 0.47×.

**Simplifications, stated.**
- **The tax does not follow the path.** One deterministic schedule, from the plan's own draws and its life expectancies, is paid on every
  path. A path that cuts spending at a guardrail, draws more after a crash, loses a spouse early (the stress set's "dies at 70") or lives
  longer under stochastic longevity pays the same tax; its filing status is the schedule's. Computing Engine B per path would be 10,000 tax
  runs per run; not proposed.
- **The Social Security cut toggle** reaches the Monte Carlo's income but neither Engine B nor the Engine D draws it taxes, so with the toggle
  on the tax is computed on the full scheduled benefit and on draws that assume it — direction mixed, small.
- **IRMAA is not in it** (DC-2 (a)): a Medicare premium surcharge, shown on the IRMAA tab — $0 on the example and on the ×1.6 household;
  $21,880 on the example at a $250,000 slider (BASE; measured at the build). Optimistic for high-income plans. MissingFeatures **D-51**.
  **Closed at v6.31** (*The Monte Carlo pays IRMAA*, below): the schedule now carries Engine C's surcharges in their premium years.
- **The built-in part-time work for spouse B** (`spouseBWorkTaper`: $20,000, $18,000 and $15,000 of spouse-B wages in retirement years 0–2
  — from v6.23 for the example household alone; at this release, for every plan with no income streams) is taxed by Engine B, so it is in
  the schedule, but neither Monte Carlo engine credits it as income — conservative by $14,479 on the example (BASE, $70K): $7,037 of tax in
  2029–2031 and $7,442 through Engine D's draws later (measured at the build: the schedule with and without a zero-amount income stream,
  which switches the taper off). The taper itself — every such plan, single ones included, got the example's spouse-B wages in four engines
  — was corrected at v6.23 (*Built-in work is the example's alone*); what remains is about the example alone. MissingFeatures **D-49**.
- **An expense row for income tax would be charged twice** — the simulation now pays the tax itself. The Field Manual says so.
- **The home-move cash** is not in Engines A–D (D-39), so not in the tax either; consistent with the Taxes tab.
- **D-44's Withdrawal half** was left open here (DC-5 (a)): a one-time row dated before the retirement year was not in the Withdrawal tab's
  schedule. Closed at v6.35, with Backtest and What Breaks, which had the same gap (*STAY UNDER IRMAA, the last working years, and one-time
  rows before retirement (v6.35)*).
- **What-Breaks' tax** stays the Roth tab's strategy engine's lifetime tax averaged per year (it is a deterministic projector); its copy now
  names that engine, where it said "the Taxes engine", and no longer says it does not model taxes. From v6.31 it adds that engine's IRMAA (`totIrmaaToday`).
  *(Superseded at v6.36: What Breaks averages this section's schedule instead — “What Breaks pays the Monte Carlo's tax” (v6.36).)*

## Cars are expense rows (v6.21)

**The rule.** A car is a one-time row in the plan's expense table, like any other one-time expense. The Monte Carlo charges it in the quarter
that holds its month, grown with the path's inflation, and its planned path — the line the guardrails steer by — pays it too
(`mcQuarterSeries`, v6.20); the Withdrawal tab spends it in its year through `tableYearExpense`, so Backtest, What-Breaks and, through Engine
D's draws, the Taxes, IRMAA and Roth tabs see it as well. The example's table carries four rows — "Replacement car", $40,000 in today's
dollars, March 2037, 2045, 2053 and 2061 (its retirement years 8, 16, 24 and 32). A new plan (Start Fresh, the guided wizard) starts with none.

**What it did through v6.20 (D-42).** `AUTO_REPLACE_COST = 40000`: the 30-year runs whose `autoReplace` option was on (run C with and without
LTC shocks, run D, four of the seven stress runs, the mortgage what-if) took $40,000 × the path's inflation in the March quarter of retirement years 8, 16, 24 and 32, on
**every** plan, whatever its table said. It was not in the planned path the guardrails compare against, so each car year pushed every path
down against a benchmark that did not move. The 6-year runs, runs A and B, three stress runs and Engines A–D never saw it, and a household that
entered its cars as expenses paid twice in the runs that did. Disclosed only as "a fixed example schedule".

**A plan saved before v6.21 (DC-2 (a)).** A plan loaded with its expense table and without the `carRowsV621` field — every plan saved before
v6.21 — keeps the old schedule as visible rows: "Replacement car (added by v6.21 — the model's old fixed schedule)", $40,000, one-time, in
March of each eighth year after its own retirement year, from its as-of month through its as-of year + 35 (the longest run). My Data and the
Monte Carlo tab say which rows were added. Nothing is written until Save & Apply, which stores the table and the field; a row already present
is not added twice. The conservative reading: such a plan keeps paying for its cars, now on every tab.

**What it moved** (measured at the v6.21 build, v6.20 against v6.21, 3,000 paths, the same seeds per row; run C's shape — 30 years, deaths at
life expectancy, one LTC shock; success above $500K | above $800K | median end):

| Household | Preset | v6.20 → v6.21 |
|---|---|---|
| Example (the car now in its table) | BULL-LEANING | 95.3% → 95.1% · 91.0% → 90.6% · $2,112K → $2,048K |
| Example | BASE | 85.0% → 84.5% · 74.4% → 73.9% · $1,392K → $1,353K |
| Example as a single household | BULL-LEANING | 97.2% → 97.0% · 90.3% → 90.1% · $1,601K → $1,575K |
| Example, holdings ×1.6 | BASE | 96.5% → 96.5% · 93.5% → 93.3% · $3,229K → $3,202K |
| A plan saved from v6.21 with no car in its table | BULL-LEANING | 95.3% → 96.6% · 91.0% → 93.2% · $2,112K → $2,234K |
| The same | BASE | 85.0% → 88.6% · 74.4% → 79.3% · $1,392K → $1,527K |

The example's Monte Carlo moves a little — the planned path now pays the car, so the guardrails no longer cut spending against a line that
ignored it, and Engine D's draws, which the tax schedule is built from, now include it. Its other tabs move more, because they see a car for the
first time: on the example (BULL-LEANING, $70K slider) the Withdrawal tab spends $40,000 × its own inflator more in each car year ($49,657 in
2037), its 2053 balance is $268,904 lower, and the Taxes tab's lifetime tax is $1,993 higher; no IRMAA surcharge appears (MAGI rises, but stays under the first tier). A plan without car rows
reads higher than v6.20 read it, by about what its fixed car cost.

**How the change is attributed.** v6.21 on the example equals v6.20 run on the same table with its own car switched off, bit for bit — both
Monte Carlo engines and Engine D (`t84` B): the engine did not change, the table did. And v6.21 on v6.20's table (the four rows removed)
reproduces v6.20's Engines A, B, C and D, the bridge and the Monte Carlo's tax schedule bit for bit on four households (`t84` C), so every
re-pinned figure in the suite is the four rows.

**Three display fixes in the same release.** *The figure after the payments end (D-43):* six displays on the Income and Social Security tabs
subtracted the example's $400 car payment from every plan's spending; they now read the table — the monthly total the month after the last
monthly row that is running at the "after spouse B's Medicare" month and ends before the plan's last year (on the example, $7,620 from May
2034, after the Car Payment — the same figure as before); with no such row, or nothing spent after them, the figure is not
shown. *The Stress tab's planned column (D-47):*
it was `household × 1.04^years`; it is now the engine's own planned path, with the guardrails' own ±20% bands. Under BULL-LEANING the old
column marked the example's median below its lower band in most later years, the engine's path in none; under BASE the median still falls
below the band from about year 16, which is the honest reading. *Florida (D-50):* the mortgage what-if said mortgage interest "isn't
deductible for you (standard deduction + no FL income tax)" to every plan; it now states the model's rule (no itemized deductions are
modelled, so no offset). The Roth tab's rules box said "Florida — no state income tax" to every plan; it now names the plan's state as the Taxes tab does — the
state chosen in My Data, or else the plan's named flat rate (the example chooses no state; its Florida, at 0%, is its master prompt's state
line, so the example's line reads as before).

**Simplifications, stated.**
- **The rows sit on calendar dates.** The retirement-year buttons used to move the fixed car with the selected year; rows stay where they are,
  as the rest of the table has since v6.18.
- **Engine D inflated a row from the retirement year, the Monte Carlo from the as-of date** (true at v6.21; one clock from v6.30, D-60 — Engine D
  now inflates from the as-of year too, so the same $40,000 row is $40,000 × (1 + i)^(2037 − as-of) in Engine D's 2037, and the Monte Carlo's
  paths scatter around it).
- **A car loan** is the user's to enter as monthly rows; no financing is modelled.
- **Saving re-dated rows to whole years (D-52, closed at v6.24).** My Data's editor kept a row's years only: Save & Apply stored a monthly row
  from January to December and a one-time row in June. The first save moved an older plan's added cars from March to June of the same year — no
  change in Engine D, Backtest or What Breaks, which read the year; one quarter later in the Monte Carlo — and widened the example's Car
  Payment from April 2029 – April 2034 to January 2029 – December 2034. *(Wider than this bullet said, measured at v6.24: the save re-dated
  31 of the example's 35 rows and made 2029 pay for both homes, and the draft and Export Backup did the same — see* My Data keeps each
  expense row's months (v6.24) *at the end of this document.)*
- **Its sibling, found at the build (D-53; closed at v6.22, next section).** A new plan that chose no state kept the example's master prompt
  and was taxed as its Florida; the Roth tab's line said what the Taxes tab said, so for such a plan it said Florida too.

## A plan's facts are its own (v6.22)

**What was wrong (v6.21, measured).** The example household's facts — both dates of birth (1 January 1964 and 1966), its plan-to ages (80
and 87), its retirement year (2029), Florida at 0%, and its home ($450,000 with a $120,000 mortgage at 4.25%) — lived only in its master
prompt, the sample briefing Ask AI sends. Every reader fell back to the master prompt for a fact a plan did not carry: the plan timeline
(dates of birth, retirement year, plan-to ages, the state), My Data's starting values, the Ranking tab's home and net worth. And a load
that brought no master prompt kept the one already held — the example's at the landing screen. So a plan begun with Start Fresh was the
example's household in all five timeline facts and its home; one begun with the guided setup, which writes its own dates, was the
example's Florida when its state step was skipped, and its home. One Save & Apply stored them as the plan's own. The guided setup run from
My Data, or a backup without a prompt, kept the previous plan's prompt the same way (measured: a plan with its own Oregon prompt, then a
blank load, read Oregon). Two siblings: a plan with no Social Security or pension figure was paid the example's $3,300, $1,300 and $400 a
month, and a backup with no expense table kept the table already held.

**What changed.**
- **The example describes itself.** `DEFAULT_PORTFOLIO` carries the ten facts as fields, each equal to what the parsers read from the demo
  prompt (a test computes them live). The example's figures do not move: all ten of `t2`'s engine fingerprints are byte-identical at v6.21
  and v6.22, its Withdrawal tab is byte-identical and its Taxes and IRMAA year-tables figure-identical (`domdiff`), and its My Data, Ranking
  and Roth values are unchanged; the one deliberate change on its tabs is wording (the Taxes tab's 0% footnote, DC-3).
- **A load without a master prompt holds none**, and storage drops the key to match. The example's own path holds the demo. The example's
  own text arriving beside holdings that are not the example's — a key v6.21 could leave in storage after *Load sample data* and then the
  guided setup or an import without a prompt, or an old backup — is not taken either (DC-8, decided at the build), and a stored key of that
  kind is dropped.
- **Placeholders are named, not presented as facts.** A plan with no date of birth, retirement year or plan-to age is modelled on the
  timeline's placeholders — born September 1963 (and March 1966), retiring in 2029, planning to age 90 — which predate this release and are
  not the example's. From v6.22 My Data shows those fields blank and says what the model is using until they are entered. A plan with no
  state is modelled with no state income tax, and the Taxes tab, the Roth tab's rules box and My Data say so.
- **Income a plan never entered is not paid.** A missing Social Security or pension figure is $0 (it was the example's), and the banner
  names it whether or not a master prompt is held.
- **A backup with no expense table is refused**, as a file that cannot be read is.

**What moves.** The example: nothing. A plan saved through My Data: nothing — it stored its facts, including any it took from the example,
and My Data now names example facts a plan carries (both dates of birth with both plan-to ages, the home, or Florida with no state chosen)
when its holdings are not the example's. A Start Fresh or guided-setup plan from v6.21 or earlier that was never saved through My Data
changes on its next load: a Start Fresh plan's dates of birth become the placeholders and its plan-to ages 90 and 90 (from 80 and 87) — a
longer horizon, so more years to fund (the conservative direction); either plan loses Florida for no state (0% both ways, so no tax moves);
the Ranking tab's home becomes its flagged fallback. A plan with a missing income figure — reachable only by a hand-made or old backup — is
paid less, and every figure that reads income falls.

**Simplifications, stated.**
- **The placeholders remain the engines' values** until the user enters a fact; My Data names them.
- **Example-valued defaults that remain (D-56):** the as-of date when a plan has none, Spouse B's claim age 63 when none is set, the 2029
  placeholder, and the Roth tab's 5-year-rule lines.
- **The example is recognised by its holdings** (tickers and balances). A plan that carries the example's demo text and exactly the
  example's holdings is read as the example, and its facts come from that text where its own fields are missing — which is right for the
  example, and for anything else would need a plan that kept the example's holdings to the dollar.
- **Ask AI's ground rules reach only the example (D-55).** A plan's Ask AI sends its plan summary (from its last Save & Apply) and the
  live context; a plan never saved sends the live context alone.

## Built-in work is the example's alone (v6.23)

**What was wrong (v6.22, measured).** `spouseBWorkTaper` pays $20,000, $18,000 and $15,000 of spouse-B wages in the retirement year and
the two after. Its one test was *no income streams*, so every such plan was paid them — Start Fresh, the guided setup, a backup, and single
plans, which have no spouse B. The example's spouse B does work (its demo prompt says so), so on the example the wages are its own; on any
other plan they were income the user never entered. The Withdrawal tab (Engine D) spent them as cash; Engines A, B and C and the Roth tab's
ladder taxed them (Engines A and B with payroll tax); the Monte Carlo, from v6.20, paid their tax without receiving them; What-Breaks paid their
tax through Engine A. The direction was split by tab: the Withdrawal tab optimistic by $53,000 of income, everything that taxes them
conservative. Measured on v6.22 with the wages switched off by a $0 stream — which is exactly what v6.23 does to such a plan (`t86` §C
proves the two bit-identical, every engine and both Monte Carlo engines): on the example's own figures used as another plan's, the
Withdrawal tab's end balance falls $89K–$164K across four households and two presets, the Taxes tab's lifetime tax falls by about
$7,000 (married) or $7,500 (single) in the three wage years — the wages' income tax plus $1,530, $1,377 and $1,148 of payroll tax — and
the Monte Carlo's success rates rise slightly. IRMAA does not move on any of the four. On a single plan the Roth tab's best cell moves from
*fill the 12% bracket* to *no conversions*, a near-tie either way ($264 one way, $658 the other, on about $2.8M) — the model's best cell
under its own assumptions, not a recommendation.

**What changed.**
- **The taper pays only the example** (`builtinWorkApplies`): a plan that holds the example's holdings (tickers and balances, the rule
  v6.22 uses for the example's text), is married and has no income streams. It is read on every call, not cached, because a load or
  Save & Apply replaces the plan; the six engine reads are unchanged. A single plan is paid none, the example made single included — as
  v5.76 already did for spouse B's Social Security.
- **A plan saved before v6.23 that loses the wages is told so**, on My Data and the Monte Carlo tab, with how to enter work (a job row, with
  the existing buttons). A new field, `workRowsV623: true`, written by the example, Start Fresh, the guided setup and Save & Apply, ends the
  notice; nothing in the plan changes until the user saves.
- **The wording.** The Taxes tab's line reads *Earned income (job rows)* — it is every job row, any owner, which v6.22 called spouse B's
  earnings — and on the example *Earned income (job rows and the example's built-in work)*. The Withdrawal tab's Step 1 reads *Social
  Security + pension + other income (income streams)*, and on the example *(income streams and the example's built-in work)*; its
  Work-column note names the example's built-in work on the example. My Data and the Field Manual say the built-in work is the example's
  alone. The Monte Carlo tab's notice says what that tab lost: the tax on wages it never paid in (its figures rise slightly).
- **Two sentences that were false are corrected:** the streams paragraph listed What-Breaks among the engines that credit streams (it
  credits none — D-57; the Field Manual's streams answer and My Data's streams note said streams reach every engine or projection, and now
  name Backtest and What Breaks as the exceptions), and the Roth ladder's earned-income term was described as narrower than Engine C's (it is the same sum —
  *The Roth tab's IRMAA MAGI is narrower than Engine C's*, v5.52).

**What moves.** The example: no figure — every engine, the bridge, the tax schedule, the Roth strategies and both Monte Carlo engines are
bit-identical to v6.22 (`t86` §B), and its Withdrawal, Taxes and IRMAA tables render the same figures (`domdiff`). Its wording changes on
the Withdrawal tab (Step 1 and the Work-column note), the Taxes tab (the earned-income label), My Data (the streams note) and in the Field
Manual. (At the scope, a prototype with this rule and v6.22's wording rendered all 26 tabs identically.) Every other plan
with no income streams loses the wages: the figures above, in the directions above.

**Simplifications, stated.**
- **The example is recognised by its holdings.** A plan that kept the example's holdings to the dollar and changed anything else is read as
  the example and keeps the wages.
- **The example's wages are still built in** and not visible as rows. The Monte Carlo, the Income tab, Backtest and What-Breaks do not
  credit them, and the Monte Carlo pays their tax: conservative by $14,479 on the example (measured at v6.20, above). Moving them into
  visible rows needs a phase rule for the Income tab and a fix for its phone layout — its own release. MissingFeatures **D-49**.
- **Backtest and What-Breaks credit no income stream** (MissingFeatures **D-57**) — conservative.

## My Data keeps each expense row's months (v6.24)

**What was wrong (v6.23, measured).** Every engine reads the expense table to the month (`tableYearExpense`, `getMonthlyExpense`, the Monte
Carlo's quarter read). My Data's editor did not: it opened each row with its **year** only and wrote it back as January–December (a monthly
row) or June (a one-time row). Every Save & Apply, every draft and every backup exported from My Data did this, edited or not. One unedited
save of the example moved 31 of its 35 rows: the current home's costs ran to December 2029 and the next home's from January, so **2029 paid
for both homes all year** ($126,280 → $157,720 of table spending, in today's dollars); primary Medicare started in January 2028; the Car
Payment ran January 2029 – December 2034; the one-time rows and the v6.21 cars moved to June. With the portfolio held fixed, the Withdrawal
tab's end balance fell $89,825 and the post-retirement monthly figure the header, Dashboard, Income tab and Ask AI quote rose from $8,170 to
$10,810. A guided-setup plan (its rows split at June/July of the retirement year) ran both rows through that whole year: its retirement-year
spending doubled. The loss was one-time and cannot be undone: the months are not in a saved table, and no backup exported from My Data keeps
them. Mostly conservative (more months of spending); optimistic for a one-time row dated January–May (charged later by the Monte Carlo)
and a negative-amount row. Two siblings: the editor's *Before retirement* default ran through December of the retirement year — the model
retires on **1 January** (`buildPlanTimeline`) — so a table built in My Data paid its pre-retirement rows for the first twelve months of
retirement as well; and the guided setup paid six months of pre-retirement living costs after retiring and stopped spending in December 2079
(D-54).

**What changed.**
- **The editor shows and keeps months.** Each row has a month selector beside each year (one for a one-time row); a row opens with its stored
  months and is written back with them, every other field passing through (`note`, any unknown field). An unedited save, draft or export
  stores each well-formed row as it loaded: an unedited date is written back verbatim (a stored `"2029"` or `"2026-03-15"` included), and
  an unedited numeric amount keeps its cents. The two exceptions are in the next bullet.
- **What is still normalised**, for rows the editor cannot otherwise show: a blank label is named, a missing category is "Other", a missing
  phase is "both", a row with no amount and no label is dropped, a missing start or end is filled (January of this year; December of the
  horizon year — so a row that was never charged starts being charged, the conservative reading). Two apply to well-formed rows too: a
  one-time row's phase follows its date (no engine reads `phase`), and the retired category name "Future Home Life" is saved as
  "Retirement Life". A `deductible` key is written only when the row had one or the box is ticked. An amount typed or converted in the
  editor, or stored as text, is saved as the nearest whole dollar a month (an annual $1,000 is $83 a month, $996 a year).
- **The defaults split at the retirement date.** *Before retirement* runs from January of this year to December of the year before the
  retirement year; *After retirement* from January of the retirement year; both read the editor's own retirement-year field, so a change
  made in the same session counts. A plan already at or past its retirement year has no time before it: the default is the one month
  before retirement, shown. "Retirement" is the household's date (spouse A's), as everywhere in the model.
- **The guided setup** splits its two living-expense rows at the retirement date and runs the second to the plan's horizon — the later
  spouse's plan-to year. A plan retiring this year gets one row.

**What moves.** The example as it loads: nothing — no engine changed, and every engine, both Monte Carlo engines and every tab are identical
to v6.23. After a save the expense table no longer moves anything. A row added from v6.24 with *Before retirement* costs twelve months less in
the retirement year (they were a double count). A wizard plan built from v6.24 moves by six months of its pre/post difference in the
retirement year, either way; its post-retirement monthly figure is its post amount; and it spends after 2079.

**Simplifications, stated.**
- **A plan saved before v6.24 keeps the dates it was given** — January to December, one-time costs in June. The editor's footnote says to
  check them; nothing can tell a re-dated table from one entered in whole years. Plans the guided setup built before v6.24 keep their June
  split and their 2079 end.
- **An unedited Save & Apply also moves the plan's as-of date to today** (intended; its UTC date is D-48). Through v6.33 it also took
  spouse A's pre-tax contribution from the per-paycheck fields, so a plan holding only a monthly total stored $0 — MissingFeatures **D-58**,
  closed at v6.34 (*My Data keeps spouse A's stored pre-tax contribution (v6.34)*, below).
- **A blank year falls back to today's year**, not the plan's as-of year (D-56). A retirement-year field that is not a year (blank, or
  half-typed) falls back to the saved plan's for the *When* defaults. The horizon the defaults use is the saved plan's: a date of birth or
  plan-to age changed in the same session counts from the next save.


## One dollar unit and one inflation clock for the tax engines (v6.30)

**What was wrong (v6.29, measured at the scope — `docs/SCOPE_D60_DOLLAR_UNITS_V630.md`).** Engines A (the Roth tab), B (Taxes) and C (IRMAA)
held Social Security, the pension, income streams and taxable-account dividends flat in today's dollars and took Engine D's spending draw
deflated to today's dollars, while their RMDs came off balances growing in nominal dollars, Engine D's realized gains arrived undeflated,
and their brackets, deductions and IRMAA tiers grew 2% a year. A row of the Taxes tab was therefore in neither today's dollars nor its own
year's. Two clocks ran beside each other: the Monte Carlo, the Guardrails table and the engines' thresholds priced from the as-of date;
Engine D (the Withdrawal tab), the bridge's deflator and What Breaks priced from the retirement year — so on Engine D a $900 pension in a
plan retiring in five years was worth $900 × (1 + i)^5, and its balances could not see the years before retirement. And one fixed 2% stood
in for two indexes the law names separately. Holding Social Security flat in today's dollars while the §86 thresholds, which the law never
indexes, sat still in effect indexed those thresholds at full inflation: **optimistic exactly where §86 binds.** v6.29 had described
this finding with a benchmark that grew only Social Security; its figures were too small (*The Monte Carlo pays the Taxes tab's tax*,
above, gives the corrected ones).

**What changed (DU-1 to DU-9, all as recommended).**
- **One clock.** Every engine prices each year from the as-of year, as the Monte Carlo already did: spending, Social Security and COLA'd
  streams grow from today at the plan's inflation, *i* — the probability-weighted inflation of the active preset (about 2.5% under the
  default BULL-LEANING prior, 2.7% under BASE). A pension, a stream without COLA, the conversion slider, the example's built-in part-time
  work and a QCD are the dollars paid in that year (DU-9: the built-in work is a fixed amount, the conservative reading).
  *(v6.33: the one clock is for dollars, not for the published tables. Through v6.32 the engines also indexed the 2026 tables from the
  as-of year, which for a plan dated after 2026 left every threshold short; from v6.33 each table indexes from its own year — The tables
  index from their own year (v6.33), below.)*
- **One unit.** Engines A, B, C and D compute each year in that year's own dollars. The bridge hands Engine D's draw and gain on unchanged
  (`withdrawalPlanSeries` holds no inflation arithmetic).
- **Today's balances reach retirement at inflation** (DU-7 (a)): every engine (A, B, C and D) carries them by
  (1 + i)^(retirement − as-of) — the same real value, no real return, so the contribution-accrual section's *no growth* keeps its meaning
  — and leave **cost basis at its nominal amount**, so the inflation a taxable holding gains before retirement is a realized gain when it
  is sold. (The retirement clock priced today's basis as if it were at retirement and omitted that gain.) **The planned-contribution
  accrual is not carried:** it is added at face value, the v5.10 rule (*Contribution accrual*, above), so only today's holdings grow with
  inflation before retirement. One helper, `carryStartBalances`, does this for every engine and the Roth ladder. *(The first v6.30 build
  carried the accrual with the holdings — against DU-7 (a), and in the scope's prototype too, so its oracles agreed; the build review found
  it. On a plan retiring twelve years out that overstated the opening Traditional balance by $143,808 in 2038's dollars under the default prior — $410,400 of accrual × (1.02535¹² − 1).)*
- **The rates follow the statutes** (DU-3 (a)), read from one helper, never a literal:

| Figure | Projected at | The law (read on uscode.house.gov and Cornell LII at the v6.30 build) |
|---|---|---|
| Brackets, standard deduction and its age-65 extra, capital-gains breakpoints, AMT exemptions and phase-outs, the QCD limit | *i* − 0.25 point (`chainedCpiRate`) | the §1(f)(3) cost-of-living adjustment, which uses C-CPI-U (§1(f)(6)(A)); cited by §63(c)(4) and (c)(7)(B), §1(j)(5)(C), §55(d)(4)(B), §408(d)(8)(G). The 0.25 point is CBO's measured long-run gap (Budget Options, 12 December 2024) |
| IRMAA tiers (the top tier frozen through 2027) | *i* (`cpiuRate`) | CPI-U, 12 months ending August (42 U.S.C. §1395r(i)(5)(A), (C)) |
| The poverty line past its last published year (the ACA subsidy) | *i* | CPI-U (42 U.S.C. §9902(2)) |
| The Social Security wage base | *i* (`inflateWageBase`) | the national average wage index (42 U.S.C. §430(b)) — see the simplifications |
| §86 thresholds, the NIIT's, the Additional Medicare Tax's, the OBBBA senior deduction | fixed | not indexed in law |
| State figures (DU-4 (a)) | fixed, as each statute states them | e.g. Georgia's $65,000 exclusion is a fixed figure in O.C.G.A. §48-7-27(a)(5)(A) |

- **IRMAA surcharges** grow with *i* to their **premium** year (`irmaaYr` = the MAGI year + 2) — their 2026 value in today's dollars (DU-5 (a)).
  *(From v6.33 they grow from their table's year, not the as-of year — so a surcharge keeps its 2026 value in 2026's dollars; for a plan dated
  2026 that is today's dollars, as before.)*
- **What the tables show** (DU-2 (a)). The Withdrawal, Taxes and IRMAA tabs' year rows are each year's own dollars, and say so. The Taxes
  tab's lifetime cards and the IRMAA tab's total are also given in today's dollars (each row ÷ (1 + i)^(year − as-of), summed). The Roth tab's
  strategy table is in today's dollars throughout: each year's tax restated at the plan's inflation, each ending balance divided by the
  inflation to the last plan year — so its ranking by estate is the ranking in either unit.
- **The Monte Carlo and What Breaks** are handed each year's tax in today's dollars (`mcIncomeTaxSchedule` keeps `totalTaxToday`) and grow it
  with each path's inflation exactly as before; the charge is unchanged — the schedule × the path's inflation × the quarter's fraction.
  What Breaks reads Engine A's tax in today's dollars (from v6.36 the Monte Carlo's schedule, also in today's dollars) and, being a
  real-terms projection from retirement, values a fixed pension at its real worth then (the pension ÷ (1 + i)^(retirement − as-of)).

**What it moved — measured at the v6.30 build** (the shipped v6.29 against the v6.30 build, both as modules; the Monte Carlo is the 30-year
run, 3,000 paths, the same seeds within each row; Engine D's end balance in today's dollars on each build's own clock). Before the build
review's accrual fix (above) these reproduced the scope's prototype to within $2 on every household; the figures here are after it.

| Example household | Taxes tab, lifetime, today's $ (each year's $) | Monte Carlo, 30 years, above $500K / $800K | Engine D end, today's $ |
|---|---|---|---|
| BULL-LEANING, $70,000 slider | $213,670 → **$201,181** ($272,791) | 95.43% / 90.93% → 95.60% / 91.40% | $1,649,938 → $1,635,600 (−0.87%) |
| BULL-LEANING, $0 | $212,552 → **$185,807** ($294,215) | 95.00% / 90.73% → 95.63% / 91.53% | −0.91% |
| BASE, $70,000 | $216,230 → **$201,203** ($280,629) | 85.73% / 75.03% → 86.47% / 75.87% | $897,296 → $883,589 (−1.53%) |
| BASE, $0 | $213,779 → **$180,578** ($296,084) | 84.67% / 74.70% → 86.63% / 76.57% | −1.50% |

| Household (BULL-LEANING, $70,000) | Taxes tab, today's $ | IRMAA, today's $ (years) | Monte Carlo, 30 years, above $500K | Engine D end |
|---|---|---|---|---|
| The example, balances × 1.6, Georgia | $367,909 → $324,602 | $0 → $0 | 99.33% → 99.37% | −0.20% |
| The example, balances × 3, New York | $1,040,557 → $781,537 | $41,580 (9) → $43,880 (10) | 99.73% → 99.90% | −0.09% |
| The example, single | $236,175 → $228,767 | $9,780 (7) → $12,080 (9) | 97.10% → 97.13% | −0.45% |
| The example, every date nine years later (retires 2038) | $236,742 → $235,040 | $0 → $0 | 99.57% → 99.57% | −3.14% |
| A couple retiring 2031: $72,000/yr spending, $900 pension, a COLA rental, Ohio | $161,018 → **$175,551** | $0 → $0 | 79.33% → **78.23%** | −0.91% |

**Which way it runs: both, by household.** Lifetime tax in today's dollars falls for the example, the scaled households, the single filer
and (by $1,702) the late retiree, and rises for the Ohio couple. *(The scope's prototype, and the first build, showed the late retiree's
rising — to $251,374 — because they carried its twelve years of planned contributions to retirement at inflation; see the balances bullet.)* Three things pull: indexing the bracket family nearer inflation lowers it (most of the change on the
example); counting an RMD in its own year's dollars rather than beside today's-dollar income lowers it most for an RMD-heavy household;
and the unindexed thresholds raise it — a household whose Social Security now grows past §86's fixed thresholds has more of it taxed every
year. The Monte Carlo moved by up to two points, up on most runs and down 1.10 on the Ohio couple. Engine D's end balance fell on every
household, most for the household furthest from retirement, which now realizes the gain inflation creates before it retires. The 6-year
headline moved within its run-to-run noise — that run takes no seed, and repeated runs of one build differ by about ±0.2 point, as much as
the measured moves. The scope
also measured the Roth tab's best cell on the prototype: a near-tie on most households that changed on three of six, each time between
cells within 1.5% of each other in estate — which is why the app says *"the model's best cell"* and nothing stronger. The build did not
re-measure that ranking beyond the suites' pins.

**Simplifications, stated, each with its direction.**
- **The wage base at prices, not wages.** The law indexes it by average wages, which usually outpace prices, so the modelled cap runs a
  little low and the payroll tax on a high earner a little low — **optimistic**, disclosed in the Field Manual. (The first v6.30 build
  indexed it at the chained rate, against DU-3 (a); the payroll-tax suites' law oracles caught it before release.)
- **State figures fixed.** True for fixed exclusions such as Georgia's; it **overstates** tax in states that index their brackets — the
  conservative direction (DU-4 (a)). A per-state indexing flag is its own release.
- **Projected IRMAA tiers and brackets are not rounded** to $1,000 and $50 as the statutes round them (FlawsToFix **C-13**, DU-6 (a)). A tier
  ten years out at an assumed inflation is far less certain than the rounding.
- **Part B premiums** set the IRMAA surcharges; the model grows them with the plan's inflation. Whether premiums outrun it is not modelled.
- **The ACA applicable-percentage table** is re-indexed each year by the IRS; the model holds the 2026 table.
- **The Monte Carlo scales the whole tax schedule by each path's inflation**, so on a high-inflation path the unindexed thresholds rise too
  (DC-3 (a), unchanged).
- **Quarterly and annual compounding.** The Monte Carlo compounds from the as-of month by quarter, the deterministic engines from the as-of
  year by year; they agree to the year, not the quarter.
- **The C-CPI-U gap is a fixed 0.25 point** under every preset; history has varied around it.
- **A plan whose retirement year is already past** (the app allows it): the carry factor is then below 1, so today's holdings are
  deflated to the retirement year — the same real value, as through v6.29, but undisclosed in the app and not separately tested.
- **What Breaks values a fixed pension at its real worth on the retirement date** (it projects in real terms from there); the Income and
  Monte Carlo tabs' steady-state draw line still quotes the pension at face. Neither is a tax figure.
- **Not D-60's mechanism, found by its scope and filed** (MissingFeatures **D-64**): Engine D's balances do not carry the planned-contribution
  accrual, while its Traditional share does — on a plan far from retirement the share passes 100%; What Breaks starts from the same balance.

**Tests.** `t93_dollar_units.mjs`, both legs (the v6.29 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-22, D-60]`): the rates,
written out independently of the helpers; Engine B's units input by input; **the extinction invariant** — with every indexed rate forced to
the plan's inflation through a test seam, a household of real income pays the same tax in today's dollars every year, to $2, which no
mixed unit survives; one clock in each engine — B and D against hand figures, C through its MAGI (equal to B's every year on a household
with a pension, a fixed annuity and a COLA rental), A through a read-only per-year seam (its Social Security, pension and streams) — and at
the two-clock boundary (retiring in the as-of year) Engine D is v6.29's to the cent; the Monte Carlo's schedule to the cent and its
quarterly charges against Engine B; IRMAA surcharges to the premium year; statute oracles for the NIIT's unindexed threshold and the
IRMAA tiers; Engine B's and C's opening balances against raw holdings and contributions (the accrual at face value — Engine A's and the
ladder's through the one helper, pinned by AST and by the ladder and Engine A recursions in `t23`–`t28` and `t70`) and the basis left
nominal; What Breaks' rendered estimate; the Withdrawal tab's and the ladder's today's-dollar totals and the input labels; the source by AST (no `1.02`; the carry in one helper; the gain pool carried and never the basis; the bridge
holds no inflation arithmetic; no unindexed figure reaches an inflator); copy; an ACA household under the 400% cliff; the rendered tabs.
Moved figures elsewhere were re-derived by independent oracles — a federal-tax oracle to the cent on every Engine B row
(`qa/tools/fed_oracle_v630.mjs`), the drawdown ledger in a v6.30 mode (`qa/tools/sim_ledger.mjs`, checked by `qa/tools/validate_v630.mjs`),
an Engine C replica, ladder recursions — and the few no oracle reaches were re-pinned by measurement and listed in the CHANGELOG.
`qa/tools/controls_v630_dollar_units.py` puts each removed defect back and shows its check turn red.

## The Monte Carlo pays IRMAA (v6.31)

**What was wrong (v6.30, measured at the scope — `docs/SCOPE_D51_AI6_V631.md`).** The yearly schedule both Monte Carlo engines pay
(`mcIncomeTaxSchedule`, *The Monte Carlo pays the Taxes tab's tax*, above) was the Taxes tab's income tax alone. The Medicare surcharges the
IRMAA tab projects were paid by no simulation, and What Breaks' tax estimate — Engine A's lifetime `totTaxToday` spread over the plan's years —
left out Engine A's own `totIrmaaToday`, which it computes beside the tax and keeps apart. Both were disclosed (MissingFeatures **D-51**):
optimistic for any plan whose income crosses a tier. The example at its opening $70,000 slider crosses none, which is why the gap could not be
seen on it.

**What changed (DS-1 to DS-5, all as recommended).**
- **The schedule adds Engine C's surcharge in its premium year** (DS-1 (a)). Engine C's row for MAGI year *y* bills its surcharge in *y* + 2
  (`irmaaYr`, the two-year lookback); its `surchargeToday` — the 2026 surcharge for the tier, × the people on Medicare in the premium year,
  in today's dollars — is added to the Taxes tab's row for that premium year. The schedule keeps its two parts beside the total (`taxByYr`,
  `irmaaByYr`), and the Monte Carlo grows the total with each path's inflation as before.
- **The edges** (DS-2 (a)): nothing before retirement (Engine C starts at the retirement year); a premium year dated after the plan's last year
  is not charged; and the tail — what a survivor who outlives the horizon pays under stochastic longevity — repeats the last year's total,
  income tax plus that year's surcharge.
- **What Breaks adds Engine A's IRMAA** (DS-3 (a)): its estimate is (`totTaxToday` + `totIrmaaToday`) ÷ the plan's years. *(Superseded at
  v6.36: What Breaks averages the Monte Carlo's schedule instead — “What Breaks pays the Monte Carlo's tax” (v6.36).)*
- **The Income tab's card** keeps the first year's income tax and adds a line for the first surcharge year, its amount and the number of
  years (DS-4 (a)); the Monte Carlo, Backtest and What Breaks tabs and the Field Manual say what the simulation now pays.

**Measured at the build** (30-year runs, 3,000 paths, seeded, with and without the surcharges on the same paths; the 6-year headline runs are
unseedable and not quoted):

| Household | Surcharges paid, today's $ (years) | Above $800K, BULL-LEANING | Median ending, BULL-LEANING | Above $500K, BASE | Median ending, BASE |
|---|---|---|---|---|---|
| The example, $70,000 slider | $0 | 91.27% → 91.27% | $1,963K → $1,963K | 80.50% → 80.50% | $1,188K → $1,188K |
| The example, $250,000 slider | $24,180 (6) | 85.87% → 84.77% | $1,675K → $1,619K | 75.13% → 74.03% | $1,038K → $983K |
| The example made single, $70,000 | $12,080 (9) | 90.87% → 90.87% | $1,523K → $1,496K | 91.53% → 91.53% | $1,206K → $1,188K |
| New York, every balance ×3, $70,000 | $34,640 (8) BULL; $32,340 (7) BASE | 100% → 100% | $10,290K → $10,231K | 100% → 100% | $6,303K → $6,261K |

The surcharges are small beside the draws, so success rates move by about a point at most; the median moves by up to 5.3% (the example at
$250,000 under BASE). The example as it opens is unchanged.

**Simplifications, stated, each with its direction.**
- **The first two premium years after retirement carried no surcharge anywhere** (MissingFeatures **D-65**, filed at this build; from v6.35
  charged when My Data states the last working years' MAGI, below). They are set by the last two working years' income, which no engine
  projects: Engines A and C start at the retirement year. A household whose working income was above a tier pays more than the model shows
  in those two years — **optimistic**, and still so from v6.35 when the field is left blank. Form SSA-44 lets a new retiree ask SSA to
  reassess them on current income (work stoppage is one of eight qualifying events; a Roth conversion is not). The IRMAA tab said through
  v6.30 that these years "err high"; that sentence was false and is replaced, and the tab, the Monte Carlo tab and the Field Manual say so.
- **The surcharges do not follow the path**, like the income tax: one schedule from the plan's own draws and life expectancies, paid on
  every path. A path that spends less after a crash pays the same surcharges.
- **Engine A and Engine C do not agree on every household** (MissingFeatures **D-66**, filed at this build). What Breaks reads Engine A, the
  Monte Carlo Engine C (DS-3 (a)), and the two engines project income differently, so on some households they charge different surcharges.
  Measured at the build (lifetime, today's dollars): equal on the example at $70,000 ($0) and at $250,000 ($24,180); the single example under
  BASE, Engine A $10,930 against Engine C's $12,080; New York ×3 under BASE, Engine A $50,270 against Engine C's $32,340 inside the horizon
  ($41,580 counting two premium years after it); the example at a $0 slider under BULL-LEANING, Engine A $8,050 against Engine C's $0. The
  difference reaches What Breaks' estimate by its yearly average — on the largest of these, about $720 a year What Breaks' line and the Field
  Manual say its IRMAA can differ from the IRMAA tab's. *(Closed at v6.36 for What Breaks, which now reads the Monte Carlo's schedule; the
  cause, and a tax gap larger than this IRMAA one, are in “What Breaks pays the Monte Carlo's tax” (v6.36). Engine A still differs; that is
  MissingFeatures D-68, on the Roth tab.)*
- **Premiums dated after the horizon are not charged**; under stochastic longevity a survivor who lives on pays the last year's total
  instead, so a surcharge that starts after the horizon is missed — optimistic, and small.
- **The surcharge is the 2026 table in today's dollars** (*One dollar unit*, above): Part B and D premiums grow with the plan's inflation,
  not with Medicare's own cost growth.

**Tests.** `t94_mc_irmaa_ai.mjs`, both legs (the v6.30 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-24, D-51]`): on five households
the schedule's tax part is Engine B's row and its surcharge part is Engine C's row moved to the premium year, exactly, with the edges and the
tail (read on New York ×3, whose horizon year carries a surcharge); the planned paths of both engines move by the compounded surcharges and
nothing else, with a hand pin of the example's first premium quarter at $250,000 ($1,669.23, from $2,880 × 2 people, 2.74% inflation and
4.5% growth, in exact decimal arithmetic); **the extinction invariant** — with the surcharge table forced to zero, every household's schedule
is v6.30's to the cent, and restored it differs exactly in the premium years that carry a surcharge; What Breaks' rendered estimate against
Engine A; Engine A beside Engine C (D-66, the disagreement pinned); the source by AST; the Income card, the Monte Carlo and IRMAA tabs; and
the replaced sentences, extinct across every string. `qa/tools/controls_v631_mc_irmaa_ai.py` puts each removed defect back and shows its
check turn red. (The same release moved Ask AI to Claude Opus 4.8 at medium effort — a presentation change, recorded in the CHANGELOG, not a
modeling one.)

## QCDs after a death (v6.32)

**What was wrong (v6.31, measured at the scope — `docs/SCOPE_F26_D61_V632.md` §0.6).** Two engines model a qualified charitable distribution
(QCD), and both decided who could give after the first death wrongly. Engine B (`computeTaxPlan`, the Taxes tab and the Monte Carlo's tax
schedule) counted, in widowed years, one person on the **older** of the two ages — the deceased's included, since the ages keep counting after a
death — and in the death year itself both spouses. Engine C (`computeIrmaaPlan`, the IRMAA tab and the schedule's surcharges) counted **both**
spouses, each on their own age, for the whole horizon. So a survivor under 71 gave from the IRA on the dead spouse's age, and Engine C gave a
survivor two caps. Both errors are optimistic. The Taxes tab disclosed them as an approximation (MissingFeatures **D-61**). Engines A and D and
the Roth tab's ladder model no QCD.

**The rule in law.** The individual for whose benefit the IRA is maintained must have attained age 70½ when the distribution is made, and the
annual limit applies per individual — a spouse filing jointly has their own (26 U.S.C. §408(d)(8): the age condition read in the statute's
definition, §408(d)(8)(B)(ii), and the per-individual limit as summarised by the Congressional Research Service, IF11377, 2026-01-15; the IRS
news release *Reminder to IRA owners age 70½ or over: Qualified charitable distributions…* states the per-spouse limit for a married couple.
IRS Pub. 590-B was not read at this build — its page could not be fetched from the session). After a spousal rollover the survivor is the only owner, so
the survivor's own age governs. The model keeps its existing conservative proxy for 70½: the calendar year a person turns 71.

**What changed (DF-7 (a)).** From the year of the first projected death — the year both engines already roll the decedent's Traditional
balance into the survivor's (`widowed`) — both engines count **one** person, the survivor, on the survivor's own age, with one cap:
`_qcdPersons = single ? (A ≥ 71) : widowed ? (survivor's age ≥ 71) : (A ≥ 71) + (B ≥ 71)`. Married years before the death and plans single
from the start are unchanged. The survivor is the spouse whose plan-to year is later (a tie leaves spouse A, the rule every engine already uses).

**Measured at the build** (Engine B, lifetime tax in today's dollars; the example's holdings with the dates of birth and plan-to ages changed;
conversions $70,000):

| Household | First death | QCD years that change | Lifetime QCD | Lifetime tax (today's $) |
|---|---|---|---|---|
| The example, QCD $20,000 | 2044 (B is 78) | none | $380,000 → $380,000 | $147,750 → $147,750 |
| A 1958 dies at 76 (2034), B 1966; QCD $20,000 | 2034 (B is 68) | 2034–2036 | $560,000 → $500,000 | $174,260 → $182,314 |
| A 1955 dies at 75 (2030), B 1962; QCD $30,000 | 2030 (B is 68) | 2030–2032 | $780,000 → $690,000 | $151,628 → $166,734 |
| A 1955 dies at 72 (2027, before retiring), B 1966; QCD $20,000 | 2027 (B is 61) | 2029–2036 | $560,000 → $400,000 | $206,430 → $231,658 |
| B 1954 dies at 74 (2028), A 1964; QCD $25,000 | 2028 (A is 64) | 2029–2034 | $700,000 → $550,000 | $179,772 → $206,024 |

Engine C's QCD moved in the same years on every household. In the years the QCD stops the survivor has no RMD yet, so that year's tax does
not move; the lifetime tax rises later, as RMDs fall on the dollars no longer given away. The example cannot show any of this: its QCD slider
opens at $0 and its survivor is 78 at the first death (the boundary census row `qcd_survivor`).

**Simplifications, stated, each with its direction.**
- **The death year counts the survivor alone** (DF-7 (a) rather than (b)). A deceased spouse could have made a QCD earlier in the year of death;
  the model does not count it — **conservative**.
- **70½ is modelled as the year of 71** — unchanged, conservative.
- **The QCD is a what-if amount**, the same every year; the model does not give the money some other way in the years it cannot be a QCD.

**Tests.** `t95_f26_d61.mjs` §A, both legs (the v6.31 leg pins the old rule as a dated `[KNOWN DEFECT 2026-10-25, D-61]`): on nine households —
the five above, one where the QCD exceeds one indexed cap after the death, a tie, and two single plans — every year's QCD in Engines B and C
equals `min(QCD, persons × the indexed cap)` with the persons counted in the suite from the dates of birth and plan-to ages; the two engines
agree every year (**the extinction invariant**); every year before the first death, and every year of a single plan, is v6.31's to the cent; a
hand pin of the 2034 household; the four lifetime-tax figures above; and the source by AST (one eligibility expression per engine, each reading
the survivor's age). `qa/tools/controls_v632_f26_d61.py` puts each removed defect back and shows its check turn red.

The same release (v6.32) also changed presentation: the Stress, Social Security, Roth, Events and Backtest tabs now state what the model computes
for the plan (UsabilityFlaws F-26), and the Roth tab's conversion ladder starts at the selected retirement year, like the strategy table beside it,
so its built-in work taper is keyed to the same year as Engine C's (above). Those are recorded in the CHANGELOG; the ladder's figures move only
when −1 or +1 YEAR is selected — at the retirement year the app opens on they are v6.31's.

## The tables index from their own year (v6.33)

**What was wrong (v6.32, measured at the scope — `docs/SCOPE_TY2027_REFRESH_V633_V634.md` §0.3; MissingFeatures D-67).** The published figures
— the federal brackets, standard deduction and its age-65 extra, capital-gains breakpoints, AMT figures and QCD limit (IRS Rev. Proc. 2025-32,
*for taxable years beginning in 2026*), the IRMAA tiers and surcharges (CMS, for the 2026 premium year) and the Social Security wage base (SSA,
for 2026) — are each a year's figures. Every engine indexed them from the **plan's as-of year** instead: `inflateTaxConst(base, yr, asOfYr)` and
its four siblings at 18 call sites, and the IRMAA surcharge grown with the dollar clock, `SUR × (1 + i)^(premium year − as-of)`, at three more.
For a plan dated 2026 the two bases are the same number, which is why no test saw it — every fixture was dated 2026. For a plan dated 2027 every
year was priced with one year of indexing missing: thresholds about one year's inflation low, so tax read high — and the surcharges, grown from
2027 rather than 2026, one year's inflation low. For a plan dated 2025, the reverse. Every plan becomes "dated 2027" on 1 January.

**The rule.** A published figure belongs to the year it was published for, whatever date the plan carries. Each table now carries its year,
and a year reads (DT-2 (a)):

- **its own table**, when one is held;
- **the newest held table before it, indexed forward from that table's year** — every year after the newest table, at the rates of *One dollar
  unit and one inflation clock* (above): *i* − 0.25 point for the §1(f)(3) family, *i* for the IRMAA tiers, surcharges and the wage base;
- **the oldest table deflated from its year**, for a year before every held table — what v6.32 did for such a row on a plan dated 2026. Such
  rows belong to a plan dated before 2026 or to one already retired (a 2024 retirement year on a plan dated 2026 has 2024 and 2025 rows).
  *(The scope's DT-2 (a) first said "as it stands, no deflation", on two premises the build review found false: that only a plan dated before
  2026 reaches such a row, and that v6.32 did not deflate there. It did, for every already-retired plan. Steve, 2026-10-27: "Deflate before
  2026" — so every plan dated 2026, retired or not, prices to the bit what it did.)*

The IRMAA top tier keeps its statutory carve-out unchanged: frozen at $500,000 / $750,000 through 2027 and indexed from that frozen base after
(BBA-2018 §53114), whatever table it is read from. The NIIT, §86, Additional Medicare and OBBBA senior-deduction figures are not indexed in
law and do not change.

**What changed.**
- **Year-keyed tables.** `FED_TABLES` (the federal family; `TAX_CONSTS` is its 2026 entry), `IRMAA_TABLES` (by premium year; `IRMAA_CONSTS` is
  2026's), `WAGE_BASE_TABLES`, and the ACA applicable-percentage table keyed by coverage year (`tableCurrentByCoverageYear`, DT-3 (a)). One
  rule picks a table for any year, `heldTableYear`. In v6.33 each holds 2026 alone, so no figure changes; v6.34 adds 2027.
- **The five helpers lose their base-year parameter.** `inflateTaxConst(base, yr)`, `inflateWageBase(base, yr)` (through `wageBaseFor(yr)`),
  `seniorExtraFor(filingSingle, ageA, ageB, yr, filerIsA)`, `irmaaThresholdFor(upper, isTopTier, premiumYr)` and
  `irmaaTierFor(magi, uppers, premiumYr)` each index from the table held for the year they are given, so no caller can pass the as-of year
  again. A surcharge comes from one helper, `irmaaSurchargeFor(tier, persons, premiumYr)`, grown from its table's year. The engines read
  their figures per year — `taxFactsFor(filingSingle, yr)` gives that year's table and its year; without a year it gives only the statutory
  figures, so a call that forgets the year cannot quietly read 2026's table.
- **`TAX_CONSTANTS_YEAR`** — the year the staleness strip and Docs §13 report — is the newest federal table's year, read from the table
  (DT-8 (a)). The Events tab's tax notice names each family's year when they differ (CMS publishes after the IRS, so for a few weeks a copy can
  hold next year's federal figures and this year's IRMAA tiers); the strip keys on the federal year alone.
- **The dollar clock is unchanged.** `planDollarFactor(yr, asOfYr)` turns the plan's today's dollars into year `yr`'s and still runs from the
  as-of year (D-60): it is the plan's own clock, not a published table.

**What it moved — measured at the build** (the shipped v6.32 against v6.33, both as modules; the example with only its as-of date changed, as
the Taxes and IRMAA tabs open — the drawdown series under the opening scenario passed in, as both tabs pass it; lifetime totals in today's
dollars):

| The example dated | Conversions | Lifetime tax | IRMAA |
|---|---|---|---|
| 2026-04-18 (as shipped), or any date in 2026 | $70,000 / $250,000 | unchanged / unchanged | unchanged / unchanged |
| 2025-06-15 | $70,000 / $250,000 | **+$4,416** / **+$3,440** | $0 / **−$645** |
| 2027-01-15 | $70,000 / $250,000 | **−$4,109** / **−$3,306** | $0 / **+$600** |
| 2028-01-15 | $70,000 / $250,000 | **−$7,773** / **−$6,034** | $0 / **+$1,215** |

Dated 2027 or later, every threshold rises by the indexing that was missing, so tax falls. IRMAA moves the other way here: the surcharges
now grow from 2026 too, and where a year's MAGI stays in the same tier the larger surcharge outweighs the higher threshold. Dated 2025 the
reverse on both. *(The scope's §0.3 measured these without the drawdown series the tabs pass in — −$4,026 / −$3,806 and IRMAA −$3,082 for 2027
— and so had IRMAA's direction backwards; the build review found it, and the table above is from the tabs' own call.)* The Withdrawal tab's Bracket column and the Roth
tab's ladder read `projectBracketsAt`, which moves the same way — its 2030 figures for a joint return with one spouse 65 or older:

| `projectBracketsAt(2030)`, v6.32, plan dated | Standard deduction | 12% bracket top | IRMAA tier-1 threshold (2032 premium) |
|---|---|---|---|
| 2025 | $38,280 | $113,990 | $263,411 |
| 2026 (and every date from v6.33) | $37,350 | $111,221 | $256,386 |
| 2027 | $36,442 | $108,519 | $249,548 |

**Nothing moves for a plan dated 2026** — Engines A to D, the bridge, the Monte Carlo's tax schedule, both seeded Monte Carlo engines, the
Verify checks and the rendered Roth ladder are bit-identical, v6.32 → v6.33, on the example and six more plans dated 2026, one of them
already retired (`t96` §C).

**Two drawings of the brackets (UsabilityFlaws F-28).** The Taxes tab's bracket-by-bracket panel drew the selected year against Engine B's
`brackets2026` — the 2026 table at the filing status of the plan's **last** year — through Engine B's as-of `inflate`. On a plan that ends
with a survivor every joint year was drawn against Single bounds: on the example's opening view, 2029's $144,646 of taxable income, in the 22%
bracket, was drawn with about $31K in 24%. The Roth tab's BRACKET UTILIZATION bar drew the first ladder year's income against the 2026 table
unindexed, so it ran ahead of the "headroom to 24%" printed beside it (found by the build review). Each now reads its year's own table and
filing status. No engine figure moved; only the drawings did.

**Simplifications, stated, each with its direction.**
- **A year before every held table is the oldest table deflated** (DT-2, revised) — today, 2026's figures deflated to 2025 or 2024. That is
  not the year's real figure (OBBBA reset several by more than inflation; 2024's real joint standard deduction was $29,200 against the
  deflated $30,654) — the real 2024 and 2025 tables are not held. Deductions and brackets read slightly high on such a row (**optimistic**, small), exactly as through v6.32.
- **A year after the newest table is the newest indexed forward**, at the plan's rates — not the figure the IRS, CMS or SSA will publish. The
  difference shows each autumn, when a year's real figures replace its projection (v6.34 for 2027).
- **The ACA applicable-percentage table is held as published**, never indexed: the IRS re-sets it each year by §36B(b)(3)(A)(ii)'s premium-growth
  adjustment, which the model does not project, so the newest published table stands for every coverage year after it (as through v6.32).

**Tests.** `t96_table_year.mjs`, both legs (the v6.32 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-26, D-67]` or
`[KNOWN DEFECT 2026-10-27, F-28]`): §A the source by AST — no helper takes a base year, no call passes an as-of year, no surcharge is grown by
the dollar clock, no engine reads an indexed figure from the 2026 table directly, `TAX_CONSTANTS_YEAR` read from the table, the ACA table keyed
by coverage year, the panel's table; §B **the extinction invariant** — one household dated 2025, 2026, 2027 and 2028 with every other input
fixed in nominal dollars gives the same standard deduction, §63(f) extra, ordinary, capital-gains and minimum tax, payroll tax, QCD, IRMAA
tier, surcharge and threshold in Engines A, B and C and `projectBracketsAt` in all four runs (on v6.32 each moves), and a MAGI placed between
the as-of-indexed and the table-indexed tier-1 threshold is billed the same tier in every run; §B2 the Roth tab's rendered IRMAA threshold,
dated 2026 and 2027, against $218,000 × (1 + *i*)^(premium year − 2026); §C nothing moves for a plan dated 2026; §D Engine B against the
statute oracle with its base year typed as the table's, and this section's measured moves; §E the copy; §F the two drawings. `t29` gains the boundary row `asof_table_year` (the example
is ON: dated in its table's year). `qa/tools/controls_v633_table_year.py` puts each removed defect back and shows its check turn red.

## My Data keeps spouse A's stored pre-tax contribution (v6.34)

**What was wrong (v6.33, measured at the scope — `docs/SCOPE_D58_CONTRIB_SAVE_V634.md` §0; MissingFeatures D-58).** Spouse A's pre-tax
contribution has no field of its own in My Data: the form derives it from three per-paycheck amounts and a pay frequency, and through v6.33
it read nothing else. A plan holding a stored monthly figure with no paycheck breakdown — the example's $2,500 a month, or a backup written
outside My Data — therefore showed $0 for spouse A (*Pre-tax monthly $0/mo*; *Projected added by retirement: Spouse A $0K Trad*) while every
engine accrued the stored figure, and one unedited Save & Apply, draft or Export Backup stored the $0. On the example (as-of date held), spouse
A's Traditional balance at retirement fell $90,000 (12 × $2,500 × 3 years); the 30-year Monte Carlo above $500K went 95.37% → 94.43% under
BULL-LEANING and 85.13% → 82.63% under BASE; lifetime tax in today's dollars $197,987 → $185,192. My Data has written the paycheck
breakdown since the first commit, so a plan saved or exported through My Data in any version was never affected: the stored figure was
that breakdown's rollup. Spouse B's two fields, spouse A's Roth and the bonus lump are direct entries and were never affected either.

**What changed.** One rule (`effectivePreTaxA`) gives the form's figure. Once the paycheck row has been edited in the session — any of the
three amounts, a typed 0, or the pay frequency — it is the rollup, saved rounded as before. Otherwise it is the rollup when the breakdown's
rounded rollup equals the stored figure within $0.50 (a plan saved in My Data: nothing changes), and the stored figure, cents kept, when it
does not. The *Pre-tax monthly* and *Annual total* figures, the accrual readout, the *WHERE CONTRIBUTIONS LAND* total and what Save & Apply,
the draft and Export Backup write all read that figure, so an unedited save stores the contribution figures as loaded (a stored figure
within $0.50 of a breakdown's rollup is that rollup, rounded; the save's other normalisations — the as-of date, the paycheck row written as
0 where blank, contribution percentages rounded to 0.1% — are unchanged). A sentence under the paycheck row names the stored figure and how to replace it;
where a breakdown is present and disagrees, it gives both. A plan whose paycheck row is all zero beside a stored figure (every such plan My
Data saves) opens with the row blank, so a typed 0 there counts as an edit. While the stored figure is in use, the 402(g) check counts A's
Roth and the bonus deferral but no paycheck deferral, and says so. No engine changed.

**Simplifications, stated.** A plan saved in My Data before v6.34 keeps what it saved — a $0 written by the old rule cannot be told from a
real $0, and no notice is shown (decision DC-3 (c)): nobody using My Data saw a non-zero figure for spouse A that a save then removed,
because the form showed $0 first. The as-of date still moves to today on every save (D-48). A negative stored figure (possible only in a
hand-made backup; the loader does not clamp it) is now shown and kept as it loaded, where v6.33 zeroed it on the first save.

**Tests.** `qa/t97_contrib_save.mjs`, both legs (the v6.33 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-27, D-58]`): the round trip
through the real controls — Export Backup, Save & Apply, the draft and its restore — on the example, a backup with cents and a single plan;
plans with a breakdown, a disagreeing one and a frequency change; the extinction invariant (after an unedited save, with the as-of date held,
the engines and both seeded Monte Carlo engines are bit-identical to the plan as loaded); edits; the 402(g) sentence; one rule read by every
display site; the copy. `qa/tools/controls_v634_contrib.py` puts each removed defect back and shows its check turn red.

## STAY UNDER IRMAA, the last working years, and one-time rows before retirement (v6.35)

Three corrections, scoped together (`docs/SCOPE_D62_D65_D44_V635.md`; decisions of 2026-10-28, all as recommended). D-65 and D-44 made
plans look better than they are; D-62 did not — its cost was always charged — but a strategy did not do what its name says.

**STAY UNDER IRMAA (D-62).** The strategy solved each year's conversion so that the year's income landed on the first IRMAA threshold of
the premium year two years out, with two errors. *Cause 1:* the year's tax is then paid by selling from the brokerage, and that sale's
realized gain (and, on an ACA bridge year, the ACA-premium sale's) goes into the lookback MAGI the surcharge reads — the solve left it out.
It happens at a declared gain of 0%: Engine A carries the brokerage to retirement at inflation but not its basis (v6.30). *Cause 2:* the
answer was rounded to the nearest dollar, and a solve landing exactly on the threshold could round up and cross it by cents — which costs
a full tier. Measured at the scope on v6.34: every one of the 17 fixtures crossed in 1 to 8 conversion years; the example at the shipped
defaults in 6 of 10 (4 of them by under a dollar), by up to $2,916; with the tax withheld from the conversion every crossing was under a
dollar, and on `t3`'s household those two crossings cost $3,986. From v6.35 the strategy takes the **largest whole-dollar conversion**
whose estimated lookback MAGI is at least `IRMAA_SOLVER_MARGIN` ($500, a constant of its own, not the ACA strategy's) under the cliff,
found by bisection. The estimate is the ACA strategy's (`_estSaleGain`, v5.10.1 onward), lifted to year scope unchanged in body and
shared; the ACA strategy is bit-identical. Why a search and not the ACA strategy's fixed point: on a bridge year the estimate jumps where a
candidate crosses the ACA cliff, and a fixed point there cycles with period 2 (found at the scope's review: 53 of 192 single-filer ACA
households of 3–4). A bisection needs only that the acceptable conversions form one range: the estimate almost always rises with the
conversion, and where it falls — a candidate lifting MAGI over the ACA 100%-of-FPL floor, so a subsidy appears and the ACA-premium sale
shrinks — it is far below any IRMAA threshold (once in 624 tested year-grids, $209,459 under the target; the scope had said it never
falls, and the build stopped on finding it — decided 2026-10-28). Why the estimate makes **four** ACA subsidy evaluations for this strategy (the ACA strategy keeps its three): the
engine evaluates the subsidy once before its 3-pass loop and sells for the loss its last pass leaves, so a 3-pass estimate stopped one step
short — up to $14 of MAGI near the ACA cliff. The search can settle just under the ACA cliff, where that gap flipped the subsidy, forced
the sale and put the lookback MAGI $20,000–$49,000 over the IRMAA cliff on single filers in an ACA household of 3 (found at the build; a
first fix there — a second, unscoped margin — was withdrawn at the build review, which found this cause). With four the estimate equals
the engine's figure to the cent. Effect on the strategy row at the defaults: the example's STAY UNDER IRMAA pays $0 of IRMAA in today's
dollars, against $13,800 on v6.34, converts $822 more in today's dollars over the plan and leaves an estate $19,817 higher; `t3`'s
household, $10,645 → $0. Every other strategy is unchanged.

*Simplifications, stated:* the strategy stays under the first cliff only; it does not weigh whether a higher tier would pay. And the
Monte Carlo charges a retirement-year premium, like that year's tax, for the retirement quarters only — a mid-year retiree's first working-
year premium is charged in part (the example retires in January).

**The last working years (D-65).** Medicare sets a year's premium from the MAGI of two years before (SSA POMS HI 01101.010: adjusted gross
income, Form 1040 line 11, plus tax-exempt interest, line 2a), so the first two premium years after retirement are set by the last two
working years, which no engine projects. Through v6.34 they carried no surcharge anywhere. From v6.35 My Data takes one optional figure,
*Household MAGI in your last working years* (`workMagi`, today's dollars; read through `workMagi()`, which clamps it — blank, text and
negative read 0; ceiling $10,000,000), used for both tax years before the retirement year: a year after the as-of year is carried forward at
the plan's inflation (`workMagiFor`); a year at or before it is taken as entered — its return is filed, or nearly, and is in its own year's
dollars (DW-4 (a)). Engine A seeds its lookback with the two years (every P builder passes it; a P object without it, as in every engine
test, seeds nothing); Engine C prepends two rows for them, marked `working`, scored and billed by the same rule as every other row; the
Monte Carlo bills every Engine C row in its premium year, so it pays them too. When the field is set it is charged in full (DW-2 (a)); Form
SSA-44 (work stoppage is a qualifying event) can remove it, and the IRMAA tab still says so. Measured on the example's calendar (A on
Medicare in both premium years, B not): $250,000 entered → $2,300 over the two years in today's dollars; $300,000 → $5,760; $400,000 →
$9,240; $600,000 → $12,720; a couple both on Medicare pays twice that.

*Simplifications, stated:* one figure for both years (DW-1 (a)); the plan's filing status for both. **Blank is still optimistic** for a
household whose working income was above a tier — so when the field is blank, someone is on Medicare in the retirement year or the next,
and the salaries My Data holds, carried to the first lookback year as the field would be, sit above the first premium year's threshold for
the plan's filing status, the IRMAA tab and My Data say so in one line (DW-5 (b)); the flag changes no figure (salaries are gross pay, not
MAGI). The example states no working MAGI and holds no salaries: nothing moves on it.

**One-time rows before retirement (D-44).** Three engines start at the retirement date from today's holdings and spend the expense table
from there: Engine D (the Withdrawal tab), Backtest and What Breaks. Through v6.34 none of them charged a one-time row dated between today
and the retirement year; the two Monte Carlo engines, which run from the as-of month, always did. From v6.35 one helper,
`preRetireOneTime(retireYear)`, sums the one-time rows from the as-of month through December of the year before the selected retirement
year, in today's dollars (rows before the as-of month are history). Backtest and What Breaks start from `household` less that sum
(clamped at 0; both run in today's prices). Engine D takes it before its carry to the retirement year: first from the after-tax,
gain-bearing part of its first pool (`taxGainPool`, with its basis scaled pro rata so the gain share is unchanged), then from the buckets
pro rata — Traditional and Roth money in their own shares — never from the pool's Traditional IRA, annuity, HSA or Roth money; `tradFrac`
and `rothFrac` are unchanged. Engines A, B and C keep their own after-tax pool (it sets dividends and pays conversion tax); they move
through Engine D's draws (the gains bridge and `ordDrawByYr`). Measured: a $30,000 row in May 2027 on the example takes all $21,000 of its
after-tax brokerage and $9,000 from the buckets; the example itself is unchanged at its planned year, and at the **+1 YEAR** button (2030)
its April 2029 golf cart and closing costs ($28,000) now come out of the start — the Withdrawal tab's end balance $2,098,139 → $2,021,124.

*Simplification, stated:* no tax is charged on money taken from the buckets before retirement (the model does not project working years),
the same simplification the Monte Carlo makes by spending the row from one total; a household that pays such a purchase from salary keeps
more than the model shows.

**Tests.** `qa/t98_irmaa_onetime.mjs`, both legs (the v6.34 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-28, …]`): §A the
solver's invariants in all 996 conversion years of 56 households, the strategy's and the optimizer's UNDER IRMAA cell's — under the cliff less $500, the largest such conversion, the estimate
equal to the engine, the acceptable conversions one range on every year-grid, the single-filer bridge households under — every other strategy bit-identical
to v6.34, one year by hand, the margin its own, the copy; §B blank bit-identical to v6.34 on the example and every fixture, the working years
by hand in Engine A and Engine C, the tier edge, A and C agreeing, the Monte Carlo's schedule, every P builder by AST, the round trip through
the real controls, the copy on four surfaces and the Field Manual, the flag, Ask AI's line; §C Engine D's opening state by hand, which rows
count, the overflow, the example at +1 YEAR on the three tabs, the Monte Carlo unchanged, the bridge, the copy. `t29` gains the boundary rows
`pre_retire_once` and `work_magi` (the example is ON for both). `qa/tools/controls_v635_irmaa_onetime.py` puts each removed defect back and
shows its check turn red.

## What Breaks pays the Monte Carlo's tax (v6.36)

One correction (`docs/SCOPE_D66_WHATBREAKS_TAX.md`; decisions of 2026-10-28, all as recommended). MissingFeatures **D-66**, wider than
registered.

**What was wrong.** What Breaks charged a yearly tax averaged from Engine A, the Roth tab's strategy engine: its current-slider row's
`totTaxToday + totIrmaaToday` over the plan's years (v6.31, DS-3 (a)). The Monte Carlo charged `mcIncomeTaxSchedule`: Engine B's
`totalTaxToday` each year, plus Engine C's `surchargeToday` in each premium year inside the horizon. The two stress views disagreed. D-66
registered the IRMAA half (about $720 a year at most); the income-tax half, from the same cause, was larger. Measured at the scope on v6.35
(yearly, today's dollars, yield 2%, QCD $0):

| Household | What Breaks (Engine A) | The Monte Carlo's schedule | Difference |
|---|---|---|---|
| Example $70K BASE | $10,528 | $8,048 | +$2,480 |
| Example $250K BASE | $13,352 | $12,241 | +$1,111 |
| Single $70K BASE | $16,284 | $14,931 | +$1,352 |
| New York ×3 $70K BASE | $38,441 | $31,526 | +$6,915 |
| Example $0 BULL-LEANING | $10,533 | $7,432 | +$3,101 |

Across the 102 fixture cases (17 households × BASE/BULL × $0/$70K/$250K) Engine A's figure was above the schedule in 100 and below in 2;
IRMAA alone differed in 44 (Engine A higher in 40).

**Why Engine A differs.** Three simplifications, measured at the scope by switching each to Engine C's treatment in a scratch copy:
1. **It taxes the spending draw from Traditional but never drains it** (v5.84, disclosed in the Field Manual; FlawsToFix Phase 2 D-7b). Its
   Traditional balance and so its RMDs run high once RMDs start: on the example at $70K, $1,443,115 against Engine C's $991,330 at the start
   of 2039, and an RMD of $49,327 against $33,853.
2. **Its dividend base is its own taxable pool,** which pays the conversion tax, then receives every gross RMD and is never spent. Its
   dividend is $0 from 2031, once the pool has been emptied paying the conversion tax, and $19,110 by 2053 on the example, where Engine C's (today's taxable balance grown with
   inflation) is $455–$871. Not disclosed before this release.
3. **It ends each spouse's conversions at that spouse's own ladder year,** where Engine C uses the household's. Not disclosed before this
   release.

With 1 and 2 replaced, Engine A's IRMAA equals Engine C's on every registered household and on 99 of the 102 fixture cases; the other three
are cause 3. Its income tax lands within $389 of Engine B on the example, but −$18,541 to +$6,638 lifetime across the fixtures; that
residual is not fully decomposed. The growth rate is not a cause (both 4.5%), and the persons billed, the filing status and the tier tables
agree.

**What changed.** A module-level helper, `whatBreaksAnnualTax(retireYear, horizonYr, inputs)`, averages the Monte Carlo's own schedule
(`mcTaxForYear` over What Breaks' years) at the Monte Carlo's four inputs — the slider, the QCD, the dividend yield and the scenario
(DB-2 (a)). What Breaks charges that average each year, grown with the projection's inflation as before (DB-3 (a): the average, not each
year's figure). The two stress views now charge one projection. Engines A, B, C and D do not change; the Roth tab does not move.

**Effect, rendered** (the example, the page's default slider and settings; shipped → v6.36):
- under BASE: the estimate $10,528 → $8,048 a year; spending headroom 1.20× → 1.25×; the shock absorbed $0.50M → $0.55M; the return
  break-point −2.2% and the crash years (1) unchanged;
- under BULL-LEANING (the page's default prior): headroom 1.35× unchanged; the shock $0.85M → $0.90M.

**Direction: optimistic on most plans.** The project's default is the conservative direction when an assumption must be picked. This is not
an assumption being picked: What Breaks was high because Engine A keeps money the household has already spent, and none of the three
causes is a margin anyone chose. On two fixture cases (`rmd73` at $250K) the same causes made it low, and those two now rise.

**Social Security cut.** Engine A applies the trust-fund cut (`ssDepletionFactor`); Engines B and C, and so the schedule, keep scheduled
benefits. So under a cut What Breaks' estimate no longer falls with the cut. On the example with a 78% cut from 2033 it was $9,315 (Engine
A, cut) and is $8,048 (the schedule, either way). The Field Manual's cut paragraph lost its What Breaks exception.

**Simplifications, stated.**
- The average spreads the conversion years' tax across the plan. Charging each year's figure moves the break-points both ways (measured at
  the scope; not adopted).
- The QCD lowers What Breaks' tax as it lowers the Monte Carlo's, and the gift itself is not charged in either (*The Taxes tab and the
  drawdown*, item 3).
- The Roth tab's figures still come from Engine A and run high on most plans (MissingFeatures **D-68**, filed at this release).
