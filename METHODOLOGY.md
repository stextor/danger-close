# Danger Close — Methodology White Paper (v5.6)

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
a screen, not a full Form 6251; itemized deductions are not modeled (standard deduction assumed); the temporary OBBBA senior bonus deduction (up to $6K/person 65+, 2025–2028, income-phased) is deliberately omitted — a conservative simplification for a provision that expires mid-plan;
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

## 8. IRMAA

2026 tiers per CMS with the statutory **2-year MAGI lookback** modeled explicitly. Roth
conversions and QCDs both flow through (conversions raise MAGI two years out; QCDs lower it).
Cliff behavior is preserved — one dollar over a threshold applies the full tier surcharge.

## 9. Withdrawal sequencing & guardrails

Cash-first sleeve sequencing (cash → bonds → equity → hedge), RMDs treated as forced Traditional
withdrawals, and Guyton-Klinger–style guardrails at 80%/120% of the planned balance path with
spending adjustments on breach. The comparison table presents cash-first, tax-optimized, and
fixed-real strategies descriptively.

## 10. Other engines, briefly

Survivor modeling (filing-status switch to single, one SS check, survivor spending factor, widow
tax squeeze); ACA bridge with subsidy-cliff awareness pre-Medicare; HSA contribution cutoff at
Medicare enrollment (with the 6-month lookback); reverse stress solver ("What Breaks"); event/
deadline calendar; estate-readiness checklist.

## 10b. v5.6 additions (summary)

Since the sections above were first written, the model gained: a **conversion-tax funding
model** for Roth conversions (a sale creating no taxable profit — cash, money markets, or a
low-growth account — vs an appreciated-brokerage sale — with a
fixed-point gross-up so each sale covers the capital-gains tax it creates, LTCG stacking on
the year's income, and realized gains feeding MAGI for the two-year IRMAA lookback — vs
withholding from the conversion itself, where only the net reaches the Roth; 59½+ assumed,
one blended gain fraction, no per-lot logic by design); **spousal Social Security analytics**
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
re-executes 45 assertions against the running instance's actual constants — federal bracket edges
for both filing statuses, standard and senior deductions, LTCG breakpoints, NIIT thresholds,
Social Security provisional-income thresholds and wage base, IRMAA tiers and the derived combined
Part B+D surcharges, the QCD cap, Uniform Lifetime Table divisors, SECURE 2.0 start ages, and
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
transmitted/not-transmitted table.

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

**Fixed during merge verification (previously present in all v5.6 builds):** after the second
death in `runExtendedMC`, the engine pushed a portfolio snapshot every *quarter* while living
years snapshot annually — inflating path lengths, stretching the post-death time axis, and,
under stochastic longevity (where death times differ per path), producing ragged arrays whose
percentile bands read `undefined` in the tail. The dead-path branch now snapshots only at
year boundaries, so every path is uniformly `1 + totalYears` entries regardless of death
timing; headline success/ruin rates were never affected (they read the final element).

