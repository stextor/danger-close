# SCOPE — v6.20 · D-40, D-44, D-45: the Monte Carlo pays the Taxes tab's tax, and charges one-time expenses in the quarter they fall, inflated

**DECIDED — 2026-10-18; to be built as v6.20, after the calendar release.** Steve: *"Let's continue with your recommendations"* — all ten
decisions as recommended: DC-0 (a) (the quarter calendar is fixed first, in its own release — `docs/SCOPE_D46_MC_CALENDAR_V619.md`), DC-1
to DC-9 (a). Drafted as a v6.19 scope; renumbered v6.20 by DC-0. Before the build, §0.2 and §0.3 are re-measured on the calendar release's
build, and §2's line numbers re-run. **The calendar shipped as v6.19 on 2026-10-18** (source `35d3dcb4…`); this scope starts from it.
Repo-only.

Steve, 2026-10-18: *"let's do D-40, making the Monte Carlo pay the Taxes tab's tax. And fold in D-44 and D-45."*

⚠ **Read §0.1's last part and DC-0 first.** Measuring for this scope turned up a defect underneath it: **the Monte Carlo's quarter
calendar is wrong.** The 30-year engine starts every plan's retirement, and its Social Security, one quarter late. The 6-year engine
attaches dates to its quarters as if every plan's as-of date were in April–June. The tax this scope adds is looked up by calendar year,
and the one-time fix places a row by its month — both on that calendar. DC-0 asks whether to fix the calendar first, in its own release
(recommended; this scope would then be built as v6.20, re-measured on that build), or inside this one.

This is a **MODELLING** release, so METHODOLOGY changes. By census (§2) it reaches the two Monte Carlo engines and everything that reads
them: the header's success rate and plan-summary line and the three retirement-year cards (on every tab), the Monte Carlo tab (runs A–D,
the mortgage what-if), the Dashboard, the Stress tab, Guardrails, Grade, Ranking and the Ask AI context. It also changes the Income tab's
"Roth conversion tax drag" card and some copy. **Engines A–D (the Roth, Taxes, IRMAA and Withdrawal tabs) are not touched**, and the
release must prove they do not move (§3 H).

**Built against v6.18.** A fresh clone of `origin/main` at `386bb87` (v6.18, its chmod and the ops provenance commit). Source
`208bf89d1bd83fc55d430f2eec60d202`, built page `d228f1d3391231406848d2647cb97fec` — the release verified on 2026-10-18. Line numbers are
v6.18's, from `census.cjs` (run with `NODE_PATH` pointing at the run folder's `node_modules`). Measurements use a **session-only prototype**
(the v6.18 source with a switch at the four tax sites, the four one-time reads and the four monthly reads; never shipped). Its control:
with the switch set to v6.18's behaviour it reproduces both Monte Carlo engines **bit for bit** (same seeds, md5 of the full output).

**This draft was reviewed before it reached Steve** by an independent agent that had not seen the work, against the source and the
measurement logs. It found one premise gap (the calendar, now §0.1 and DC-0), a wrong description of when the Monte Carlo re-runs, five
readers of the Monte Carlo missing from the census, two copy sites, a rationale that contradicted the measurements (DC-9), a re-pin plan
that could not be completed, four tests that would not work as written, and a dozen wrong line numbers and small claims. All are corrected
below; one of its claims (a Field Manual "Controls" sentence) could not be located in the source and was not acted on.

⚠ **A harness trap met while measuring, recorded so the build does not repeat it.** `d3.randomNormal` captures `Math.random` when the
module loads. A probe that replaces `Math.random` *after* importing the app gets an unseeded `runMonteCarlo`; the first control run here
failed for exactly that reason. Install a wrapper before the import (`let src = …; Math.random = () => src();`) and reseed by swapping
`src`, as `t81` does. (`runExtendedMC` is unaffected: it takes `rng`.)

---

## 0 · Premise (verified at v6.18, not assumed)

### 0.1 · What the app does today

**The tax (D-40).** `ROTH_TAX_DRAG_Q = 4000` (L1169) is subtracted once a quarter in retirement, through `PLAN_TIMELINE.rothLadderEnd`, at
four sites: `runMonteCarlo` L2585 (planned path) and L2648 (paths), `runExtendedMC` L2768 (planned path) and L2877 (paths). It is a
**nominal** $4,000 — never inflated — whatever the plan converts or owes, and nothing is charged after the ladder, RMD years included. The
spending draw (`netDraw`, L2583 / L2646 / L2767 / L2875) has no tax term. So it is the only income tax either engine charges. The
Income tab shows it as **"Roth conversion tax drag · ~$16K/yr · $4K/quarter modeled in MC sim"** (L8313–8315). On the example, run C
charges it in 47 quarters (April 2029 – December 2040, below): **$188K**, not the 12 × $16K the card implies.

**The one-time rows (D-44, D-45).** Both engines read the expense table once a quarter at `dateStr = ${calYear}-${calMonth}`, where
`calMonth = ((q + 1) % 4) * 3 + 3` — always 03, 06, 09 or 12. `getOneTimeExpenses` (L83) matches the month **exactly**, and is called at
L2587, L2651, L2770 and L2884. So:
- **D-45:** a one-time row dated in any other month is never charged. The example's golf cart and closing costs (April 2029, $28,000)
  never reach the Monte Carlo — measured at v6.18 and pinned by `t81` C2 as a dated `[KNOWN DEFECT]`.
- **D-44 (Monte Carlo half):** a row that is charged is charged in **today's dollars**, while the monthly rows beside it are multiplied by
  `plannedInfl` / `inflationCum`.
- **The monthly rows** are read at the same month and multiplied by 3 (L2577 / L2639 / L2762 / L2856), so a row that starts or ends
  inside a quarter is counted for whole quarters. On the example three rows do: "Homeowners (Current Home)" (ends April 2029), "Medicare
  — primary" (starts November 2028) and the car payment (ends April 2034). Disclosed in METHODOLOGY since v6.18; not registered.

**Where the runs happen, and who reads them.** `runMonteCarlo` (L2536) has one caller, L6748, which runs it for **each of the three
retirement-year buttons** (24 quarters, 10,000 paths) inside an effect on `[scenarioPreset, ssCut]` (L6739–6761) with **no tab check** —
it runs whatever tab is open. `runExtendedMC` (L2689) has 14 callers: seven in `runStressTests` (L2967–3007), five in the extended effect
(L6769–6778, cached per `_mcKey` (L6725) = retirement year | longevity | LTC | SS cut, on `[activeTab, extendedSim, extRunning, retireYear,
mcLongevity, mcLtcDist]`, and only while the Monte Carlo, Stress or Dashboard tab is open) and two in the mortgage what-if (L6803–6804, on
`[activeTab, retireYear, vmPrincipal, vmRate, vmTerm, scenarioPreset]`). Readers of the results (`simData`, `extendedSim`, `stressData`,
`vmResult`):
- **on every tab:** the header's success rate (L7248–7250, showing "…" while `simRunning`), the plan-summary line (L7263) and the three
  retirement-year cards (L7270);
- the Monte Carlo tab, the Dashboard (L11343), the Stress tab (L12287);
- **Guardrails** — its table (L7151–7175) reads the planned path and the percentiles;
- **Grade** (L9051) and **Ranking** (L9436) read the success rate;
- the Ask AI context (L7010).

**The Taxes tab's tax.** `computeTaxPlan` (L6175) over the Engine D bridge `withdrawalPlanSeries` (L6156), called by the Taxes tab at
L10962–10968 with the live `rothAmount` (state, L6625: `useState(70000)`; its only setter is the Roth tab slider at L10497; **not saved**),
`qcdAnnual` (L6628), `taxYield` (L6627) and `scenarioPreset`. A row's `totalTax` (L6481) is federal + capital gains + NIIT + AMT + FICA on
job income + state. Its rows run from the retirement year to the second death at the plan's life expectancies, and file Single from the
year after the first.
- **Dollar basis — mixed, and already documented.** Engine B holds Social Security, the pension and income streams in today's dollars,
  takes Engine D's draws deflated to today's dollars at the call site, and inflates brackets 2% a year; the RMD term and the realized gains
  (`gainByYr`, L6160) arrive nominal. METHODOLOGY: *Where the engines still legitimately differ*, and approximation 1 of *The Taxes tab and
  the drawdown*. So a row's `totalTax` is, to that approximation, **in today's dollars** — which is how What-Breaks already uses an
  engine's tax: Engine A's "current"-strategy lifetime tax, averaged per year, **times its own cumulative inflation** (L12036, L11995,
  L12059).
- **Engine B does not apply the Social Security cut toggle** (`ssDepletionFactor` is read by both Monte Carlo engines, Engine A and the SS
  tab's grid, not by Engine B or Engine D — `census.cjs`).

**Found at this scope, not part of the request** (each is in §4, §5 or §6):
1. **The Monte Carlo's quarter calendar** (DC-0). Both engines label quarter `q` with the date `${asOfYear + ⌊(q+1)/4⌋}-${((q+1)%4)·3+3}`
   — quarter 0 is "June of the as-of year" — and read the expense table, the one-time rows, the ladder's end, the Social Security trust-fund
   year and the income streams by that label.
   ⚠ *Corrected 2026-10-18, before Steve read it:* the two sub-bullets that stood here described the defect too loosely — they said
   `runExtendedMC` retires a quarter late "for every plan" (true against the start date for an April–June as-of date; for January–March its
   quarter numbers are right and its labels late, and from July its events are two or three quarters late), and that `runMonteCarlo`'s labels
   are its only error (its `round` rule also misplaces events by a quarter for some as-of and event months). **The authoritative account,
   reviewed, is `docs/SCOPE_D46_MC_CALENDAR_V619.md` §0.1**, the calendar release this scope now follows. The measurement that stood here
   (the example, BASE: 81.0% → 80.3% above $800K, median $1,609K → $1,565K, with retirement and both claims one quarter earlier) is the
   same as that scope's.
   - **What it does to this scope:** the tax would be looked up by those labels, so `runExtendedMC` would charge the retirement year's tax
     for three quarters (≈ $5,100 of the example's 2029 row under BULL, today's dollars, never charged), and `runMonteCarlo` with a late-year as-of
     date would meet retired quarters labelled before Engine B's first row (no tax row exists for 2028). D-45's fix ("the quarter that
     contains the row's month") would place rows by labels that are up to two quarters wrong. And §3 D's identity (the four quarters of a
     year add to `tableYearExpense`) would hold while the engines still skip or double-read months around retirement.
   - Not registered (prose sweep: nothing on the as-of month, `retireQuarter` or `retireQ`).
2. **The built-in part-time work for spouse B.** `spouseBWorkTaper` (L2128) gives every plan with no income streams $20,000, $18,000 and
   $15,000 of spouse-B wages in retirement years 0–2. Engines A, B, C and D credit and tax it (L4738 and L4835, L5432, L5674, L6274; FICA at
   L6441; and the Roth tab's ladder table, L10290). **Neither Monte Carlo engine credits it** (it is not in `streamsMonthlyAt`). It has no
   single-household test: a single plan with no streams is taxed on a spouse B's wages (measured: $20,000 / $18,000 / $15,000 of `work_y`
   and $1,530 / $1,377 / $1,148 of FICA). Not registered (one mention as a test-harness neutralizer in `FlawsToFix-v5_10_2-Phase2A.md`;
   METHODOLOGY describes it as a feature). On the example (BASE) it adds **$7,037** of tax in 2029–2031 and $7,442 of knock-on tax later,
   through Engine D's draws — $14,479 in all.
3. **What-Breaks contradicts itself.** Its projector adds estimated taxes (L11995, L12059) and the tab says so (L12112: "Modeled in the
   outflow: spending + estimated taxes … average from the Taxes engine"), but the note at L12125 says "It does not model taxes … for those,
   see the Monte Carlo". The estimate comes from Engine A (the Roth tab's strategy engine), not the Taxes engine — at L12112 and in the Field
   Manual. The Field Manual's entry also says "Not modeled: recurring long-term care, IRMAA surcharges, and market sequence — the Monte Carlo
   tab covers that"; the Monte Carlo does not cover IRMAA (and will not under DC-2 (a)).
4. **The mortgage what-if speaks to Florida.** L11517, shown to every plan: "Mortgage interest isn't deductible for you (standard deduction +
   no FL income tax)". The example's state, typed in.

### 0.2 · Measured — on v6.18's calendar

⚠ These are measured **on the calendar of §0.1 item 1**. If DC-0 (a) is chosen they are re-measured on the calendar release's build
before this scope is built; their direction and rough size are what this draft can vouch for, not their last digit.

The prototype, 3,000 paths, fixed seeds per row (the same seeds for every variant of a household). "Taxes tab" is Engine B's lifetime
`totalTax` at the $70,000 slider, in today's dollars. Each Monte Carlo figure is run C's shape (30 years, deaths at life expectancy, one LTC
shock, the car every 8 years). **"Candidate"** is every recommended option together: the Taxes tab's tax, inflated (DC-3 (a)); one-time rows
over the whole quarter, inflated (D-44, D-45); monthly rows over the whole quarter (DC-6 (a)).

**BULL-LEANING — the preset a first visit opens on:**

| Household | Taxes tab tax (ladder / after) | Run C's tax today | 30-yr success (>$500K): v6.18 → candidate | 30-yr median: v6.18 → candidate |
|---|---|---|---|---|
| Example (no state income tax) | $212K ($154K / $58K) | $188K, nominal, 2029 Q2 – 2040 | 97.1% → 95.5% | $2,372K → $2,188K |
| Example in Georgia | $217K | $188K | 97.1% → 95.4% | $2,372K → $2,172K |
| Example, holdings ×1.6, Georgia | $369K ($172K / $197K) | $188K | 99.8% → 99.1% | $5,060K → $4,544K |
| Example, holdings ×0.6 | $142K ($142K / $0) | $188K | 60.2% → 56.8% | $624K → $577K |
| Example, slider at $0 | $210K ($40K / $171K) | $188K | 97.1% → 95.1% | $2,372K → $2,257K |
| Example, slider at $150K | $267K ($267K / $0) | $188K | 97.1% → 94.6% | $2,372K → $1,996K |
| Example, every date 3 years later | $220K | $188K | 98.1% → 97.3% | $3,149K → $2,901K |
| Example as a single household | $244K | $156K (ladder ends 2038) | 98.5% → 97.5% | $1,904K → $1,654K |

**BASE — the preset the v6.17 findings note measured on** (its "today" figures reproduce exactly: 81.0% above $800K, median $1,609K):

| Household | 30-yr >$800K: v6.18 → D-40 alone → D-44/45 alone → candidate | 30-yr median, same four |
|---|---|---|
| Example | 81.0% → 76.9% → 79.8% → 75.3% | $1,609K → $1,490K → $1,543K → $1,429K |
| Example, holdings ×1.6, Georgia | 96.9% → 93.1% → 96.7% → 92.8% | $3,555K → $3,143K → $3,490K → $3,076K |
| Example, holdings ×0.6 | 18.1% → 19.7% → 14.8% → 15.5% | $323K → $351K → $267K → $289K |
| Example as a single household | 86.6% → 80.9% → 85.7% → 79.4% | $1,503K → $1,324K → $1,454K → $1,273K |

What the tables say:
- **Every household tested reads lower under the candidate**, in both presets — by 0.7 to 3.4 points above $500K under BULL, and 2.6 to
  7.2 points above $800K under BASE. The only rise is the ×0.6 household under D-40 alone (the Taxes tab owes it $142K, less than the
  flat figure charged); with D-44/45 added it reads lower too.
- **The 6-year chart barely moves** (the example's 6-year median $2,140K → $2,096K under BULL); the 30-year figures carry the change,
  because the flat figure stopped at 2040 and the Taxes tab's tax does not.
- **The slider now matters.** At $0 and $150K the v6.18 Monte Carlo reads identically (it never saw the slider); the candidate reads
  95.1% and 94.6%, medians $2,257K and $1,996K. Conversions move tax earlier, where it compounds against the portfolio longer — and at
  $150K the Taxes tab also owes $57K more in total ($267K against $210K).
- **Inflating the tax is most of D-40's move (DC-3).** On the BASE example the candidate reads 75.3% / $1,431K with the tax inflated and
  79.4% / $1,543K with Engine B's figure charged as it stands. Under BULL: 95.5% / $2,190K against 96.5% / $2,314K. (These four runs
  are without DC-6's quarter read for monthly rows, which moves each by $2K or less.)
- **D-44 and D-45 together move the example's median by $73K** (BULL $2,372K → $2,299K): the $28,000 of April 2029 rows, now charged
  and grown to 2029 dollars, and the return they would have earned from then to the run's end (30 years from the as-of year: 2056).
- **The quarter read for monthly rows (DC-6) moves the example by $2K or less.**
- **IRMAA** (Engine C) is **$0** on the example and on the ×1.6 household; $21,880 on the example at a $250,000 slider; $24,190 at ×2.5
  holdings and $41,440 at ×2.5 with a $250,000 slider (DC-2).
- **Beyond Engine B's last row** (stochastic longevity, a survivor outliving the plan's horizon), BASE, 35 years: carrying the last row
  forward reads 89.5% above $500K, charging nothing reads 90.5% (DC-4).
- **Runtime.** The prototype runs the three `runMonteCarlo` calls in 1.17 s against v6.18's 0.61 s (10,000 paths), and one 30-year
  `runExtendedMC` in 2.52 s against 1.27 s. The prototype looks its switch up on `globalThis` every quarter of every path, which is most of
  that; the build precomputes the quarter series once per run (§1.2). Computing the schedule itself takes 2.6 ms. §4 makes the build's
  runtime a stop condition.

### 0.3 · What the change does to the existing suite (probe, not the build)

The v6.18 packaged suite (`runsuite.sh v617 v618`), with the candidate — every recommended option, schedule inputs fixed at $70K / $0 /
2% / BASE — built into the v6.18 slot of a copy of the packaged run folder. 2026-10-18. **GRAND 7,764 passed, 34 failed** (app 33,
tooling 1), no suite DIED. Every red is the change:

| Suite | Red | Why |
|---|---|---|
| parity | 3 of 10 | `mc`, `extMC`, `stress` — the intended difference (§3); the other seven keys identical, so Engine A's four fingerprints, `ssTable`, `stateTax` and `inflation` did not move |
| `t20` | 2 | the guards that the Monte Carlo and Stress engines do **not** move when every tax type is permuted — premise false by design (§2.2) |
| `t42` | 1, and 1 in its `-spend617` run | D-4: the married example's 6-year planned path, **$2,128,443 → $2,083,910** (−$44,533). Split by the reviewer with the prototype: one-time rows −$34,994, the monthly quarter read −$375, the tax −$9,163 |
| `t81` | 26 | C2-2, the D-45 `[KNOWN DEFECT]` — **flips: fixed**; C2-3, its control ("the same rows dated June move both engines") — April and June are now the same quarter and charge identically, so it is replaced by `t82` C; and 24 × D-1, "both Monte Carlo engines bit-identical across the pair" — a probe artifact: the candidate sat in the v6.18 slot, and in a v6.18 → v6.19 run folder §D skips by design (it needs `app_v617.mjs`) |
| `domdiff` (tooling) | 1 | the header's success rate (the Monte Carlo's) is in the captured Withdrawal tab; the v618 → v619 arm lists it as intended |

**Green where red might have been expected:** `t56` F-1 / F-3 (a plan-type change moves state tax "and nothing else", the Monte Carlo
median included) held in Rhode Island and Pennsylvania — because the median it reads is the 6-year run, which ends before those states'
plan-type rules reach this household. A horizon, not a rule, so `t82` G restates it with the schedule held fixed. `t79` and `t80` stayed
green: their Monte Carlo checks are pair-bound (`t79`, constants) or planned-path differences in a field Engine B does not read (`t80` D,
the home-move cash). The DOM suites that read Monte Carlo figures through thresholds (`t4`, `t6`, `t46`, `t74`) held. *(A calendar fix
under DC-0 would move all of these again; its own scope probes them.)*

### 0.4 · Register sweep (OPERATIONS §K2)

Searched `docs/FlawsToFix-*`, `docs/ARCHITECTUREIssues.md`, `docs/MissingFeatures.md`, `docs/UsabilityFlaws.md` and METHODOLOGY for the
mechanisms — `ROTH_TAX_DRAG`, "tax drag", `getOneTimeExpenses`, "one-time", "quarter's last", "Monte Carlo" with "tax", `retireQuarter`,
`retireQ`, "as-of", `spouseBWorkTaper`, "part-time", "does not model taxes", "FL income tax", "bracket creep", "dollar basis".
- **Closes:** D-40, D-45; D-44's Monte Carlo half (its Withdrawal half stays open unless DC-5 (b)).
- **Changes:** METHODOLOGY's v6.18 section *The Withdrawal tab spends the expense table year by year* — its last two simplifications (the
  Monte Carlo's one-time rows in today's dollars, and its one-month-per-quarter read) become history.
- **Touches, does not close:** E-22 (one statute, many copies) — unaffected: the Monte Carlo calls Engine B, it does not copy it.
  `FlawsToFix-v5_73-Phase2.md` L495 ("Monte Carlo, backtest, guardrails and What-Breaks … were not separately validated") — narrowed for
  the Monte Carlo's tax and one-time rows by `t82`.
- **Not registered, found here:** the four items at the end of §0.1. §6 files them.

---

## 1 · The change (recommended options)

### 1.1 · One schedule: the Taxes tab's tax, year by year

A new module-level function, beside `tableYearExpense`:

`mcIncomeTaxSchedule(retireYear, { rothAmount, qcdAnnual, taxYield, scenarioPreset })` → `{ byYr: { [yr]: totalTax }, lastYr, last }`

It calls `withdrawalPlanSeries` and `computeTaxPlan` **exactly as the Taxes tab does** (L10962–10968) and keeps each row's `totalTax`. The
inputs default to `{ 70000, 0, 2.0, "base" }`. The preset default is BASE, not the BULL a first visit opens on (L840, L6555), because BASE is
what `SCENARIOS` holds when the module loads, so a caller that never applies a preset runs the Monte Carlo and its schedule on the same
weights. The app always passes its own state.

### 1.2 · Both engines pay it, and read the table by the quarter

Per quarter, through one shared helper so the four sites cannot drift apart (the v6.18 pattern):
- **Tax** (D-40, DC-1 to DC-4): in each retirement quarter, `byYr[calYear] / 4 × the quarter's inflator` — `plannedInfl` on the planned
  paths, `inflationCum` on the simulated paths. A year past `lastYr` charges `last` (DC-4); a retired quarter dated before the first row
  charges nothing (it can only arise from the calendar defect, §0.1 item 1, and disappears with DC-0's fix). Nothing before retirement
  (pre-retirement income tax is withheld from pay; the contributions the engines add are net of it, as today). `ROTH_TAX_DRAG_Q` is
  deleted.
- **One-time rows** (D-44, D-45): the sum of `getOneTimeExpenses` over the quarter's **three** months, × the inflator. As today, they are
  charged before and after retirement, without the guardrail adjustment or the survivor factor (Engine D's rule for one-time rows).
- **Monthly rows** (DC-6 (a)): the quarter's **mean** month — the three months' `getMonthlyExpense` summed and divided by 3 — in the place of
  the last month, keeping v6.18's expression shape (`mean × inflator × adjustments`, then `× 3` in the draw), so a table whose rows are
  constant across each quarter reproduces v6.18 bit for bit (§3 H). The guardrail adjustment and the survivor factor apply as today.
- **On v6.19's calendar** (`docs/SCOPE_D46_MC_CALENDAR_V619.md` §1.2–1.3): in a part first quarter the tax, the one-time rows and the
  monthly read count only the months from the as-of month on — so a one-time row dated before the as-of date is never charged — and the
  tax is charged per month (`byYr[year] / 12` for each month of the quarter that is counted). Re-measured at the build.
- **The engines take the inputs explicitly:** `runMonteCarlo(retireYear, iterations, opts = {})` gains an `opts`; `runExtendedMC` and
  `runStressTests(retireYear, opts)` pass `opts.taxInputs` through. `opts.taxSchedule` (a precomputed `byYr`) is accepted in its place, so
  the app computes each retirement year's schedule once per run, and so tests can hold the schedule fixed (§3 G). Each run builds its
  per-quarter tax and expense series once, before the path loop. `runExtendedMC` returns its planned path alongside its statistics (for
  §3 B; nothing in the app reads it).

### 1.3 · The app

- Every caller passes `{ rothAmount, qcdAnnual, taxYield, scenarioPreset }` from state (16 call sites: 1 + 14 + 1, §2.1).
- **When the slider, QCD or yield moves (DC-1 (a)):** the three inputs join the main effect's dependencies, so the three 6-year runs re-run
  **about 300 ms after the control settles, on whatever tab is open** — they have to, because the header's success rate is on every tab.
  The header shows "…" for that time (0.6 s at v6.18 on this machine). The extended and stress caches are cleared (not keyed by the inputs
  — a key per slider position would keep every run in memory) and re-run, as today, only when the Monte Carlo, Stress or Dashboard tab is
  next open. The mortgage what-if's dependencies gain the three inputs (it runs only on the Monte Carlo tab).

### 1.4 · What the user reads

- **Income tab:** the "Roth conversion tax drag · ~$16K/yr · $4K/quarter modeled in MC sim" card becomes the Monte Carlo's own figure —
  label "Income tax the Monte Carlo pays", value the first retirement year's tax from the schedule (today's dollars), and the line "the
  Taxes tab's tax, year by year, at the $70K conversion slider" (the slider's live value).
- **Monte Carlo tab:** one sentence beside the home-move line (L11440, `data-dc-home-move-mc`): every run pays, each year of retirement,
  the income tax the Taxes tab computes at the current conversion slider, QCD and dividend-yield settings, grown with each path's
  inflation; one-time expenses are charged in the quarter they fall, grown the same way.
- **Field Manual, Monte Carlo entry:** a paragraph — what the tax is, that it is the same on every path (it does not follow a path's own
  draws, guardrail cuts or death timing), the IRMAA and SS-cut omissions, the inflation reading, and the one-time rows.
- **Removed, because they become false:** the D-45/D-44 disclosure in the Field Manual's Withdrawal entry ("The Monte Carlo reads the table
  once a quarter … in today's dollars"), Backtest's parenthesis ("the MC charges one only when it is dated in March, June, September or
  December", L11880–11881) and its "Roth-conversion tax drag" wording. The v6.17 home-move note ("closing costs … are already counted",
  L13517) **becomes true** and stays.
- **What-Breaks (DC-8 (a)):** L12125's "It does not model taxes" is corrected; L12112 and the Field Manual name the engine the estimate
  comes from (the Roth tab's strategy engine); the Field Manual's "the Monte Carlo tab covers that" no longer claims IRMAA.
- **METHODOLOGY:** a new section, *The Monte Carlo pays the Taxes tab's tax (v6.19)* — the rule, the inflation reading and its direction,
  the omissions, the measurements in §0.2, how the moved figures are attributed; and the v6.18 section's two Monte Carlo simplifications
  marked closed.

### 1.5 · The version

v6.19 at the four in-app sites (v6.20 if DC-0 (a)); the registrar (`register_v611.cjs`) for the suites' version lists.

---

## 2 · Site census (v6.18 lines; re-run at the build and recorded in §7)

### 2.1 · App

| What | Sites (`census.cjs`) |
|---|---|
| `ROTH_TAX_DRAG_Q` | 5 AST hits: L1169 (declaration); L2585, L2648 (`runMonteCarlo`); L2768, L2877 (`runExtendedMC`) |
| `getOneTimeExpenses` | 6: L83 (definition); L99 (`tableYearExpense`, unchanged); L2587, L2651, L2770, L2884 (the four Monte Carlo reads) |
| `getMonthlyExpense` in the engines | L2577, L2639 (`runMonteCarlo`); L2762, L2856 (`runExtendedMC`) |
| `runMonteCarlo` | 2: L2536; L6748 |
| `runExtendedMC` | 15: the definition L2689 and 14 callers — L2967, L2973, L2979, L2987, L2993, L3001, L3007 (`runStressTests`); L6769, L6770, L6771, L6774, L6778; L6803, L6804 |
| `runStressTests` | 2: L2964; L6781 |
| Effects to re-key | L6739 (main MC, deps L6761); L6765 (extended + stress, deps L6787; `_mcKey` L6725); L6795 (mortgage what-if, deps L6815) |
| Readers (unchanged code, moved figures) | header L7248–7250, L7263; retirement-year cards L7270; Guardrails L7151–7175; Grade L9051; Ranking L9436; Ask AI L7010; Dashboard L11343; Stress L12287 |
| Copy | Income card L8313–8315; Monte Carlo tab L11438–11441; Backtest L11880–11881; What-Breaks L12112, L12125; `DOCS_HTML` (L4602) Monte Carlo, Withdrawal and What-Breaks entries; My Data home-move note L13517 (no change) |

`computeTaxPlan` (2 hits: L6175, L10968) and `withdrawalPlanSeries` (7: L6156 and six callers) are called, not changed.

### 2.2 · Suites (`idsites.cjs`, `suitetext.cjs` over the packaged v6.18 suite)

Reach the Monte Carlo engines directly: `t2` (the parity fingerprints `mc`, `extMC`, `stress`), `t20` (L335–336), `t42` (L86–87), `t56`
(L124), `t79` (L209–210), `t80` (L67–69, L189), `t81` (L270–271, L289–290); `t1` reads `computePercentiles` only. Read Monte Carlo
figures through the DOM: `t4`, `t6`, `t46`, `t74`. Copy matchers on text this release changes: `t81` L390–391 (Backtest's sentence); `t80`
L319, L324 (the home-move note — unchanged, still matches).

**Assertions whose premise this release makes false, by design** (§3 G restates each): `t20`'s guards that the Monte Carlo and Stress
engines do **not** move when the Other accounts' tax types are permuted ("reads household and bucketActuals, not taxType") — from v6.19 they
read Engine B, which reads tax type; `t56` F-1 / F-3, which require a plan-type change to move state tax **and nothing else**, the Monte
Carlo median included — from v6.19 state tax is in the Monte Carlo's tax (the probe kept them green only through the 6-year horizon, §0.3).

---

## 3 · Tests — new `qa/t82_mc_tax.mjs`, both legs (v6.18 prior, v6.19 current)

**A. The schedule is the Taxes tab's.** `mcIncomeTaxSchedule(...).byYr[yr]` equals `computeTaxPlan(...)` row `totalTax` for every year,
exactly, on the example and every fixture, the single and +3-year households, at sliders $0 / $70K / $150K, QCD and yield set, under BASE
and BULL. The default inputs are `{ 70000, 0, 2.0, "base" }` (asserted, and that `SCENARIOS` holds BASE weights at load).

**B. The planned paths, exactly.** Both planned paths are deterministic and neither applies a guardrail. With the schedule injected and then
injected as zeros, the difference at every quarter equals the compounded tax series — each retirement quarter's `byYr[y] / 4 × plannedInfl`,
grown at `BASE_GROWTH / 4` to that quarter — to 1e-6 while neither path floors (the `t80` D-2 method; `runExtendedMC`'s planned path floors
every quarter, `runMonteCarlo`'s only in the copy it records). **Hand pin:** the example's first two retirement quarters, computed by hand
from the 2029 row and `plannedInfl`, to the cent.

**C. One-time rows (D-45 extinction, D-44).** A $10,000 one-time row placed in each of the twelve months of a retirement year, and of a
pre-retirement year after the as-of year, is charged **once**, in the quarter that contains its month, × that
quarter's inflator — exact, by the planned-path difference. Rows dated April, May and June of one year charge identically. In the as-of year, a row dated before the as-of month is never charged (v6.19's first-quarter rule). `t81` C2-2's
`[KNOWN DEFECT]` flips to fixed; its C2-3 control (April vs June) is retired in favour of this section.

**D. The quarter read (DC-6).** For every retirement year, the four quarters' monthly sums add to `tableYearExpense`'s monthly part and their
one-time sums to its one-time part (survivor factor off). This proves the read, **not** that the engines spend every month of retirement
— that depends on the calendar (§0.1 item 1), which DC-0 (a) fixes and tests in its own release.

**E. Extinction (AST).** The identifier `ROTH_TAX_DRAG_Q` does not exist; neither engine calls `getOneTimeExpenses` or `getMonthlyExpense`
except through the quarter helper; the tax helper is reached at all four former drag sites; and every subtraction from `planned`,
`_planned` or `portfolio` inside either engine is one of a named list — the draw, the tax helper, the one-time helper, the mortgage
payment, the LTC shock and care terms, the car — so a new outflow cannot be added unnoticed.

**F. Tail and timing.** Past `lastYr` the charge is `last` × the inflator (DC-4); before retirement nothing is charged; a household whose
paths outlive the schedule under stochastic longevity is charged in every year it is alive.

**G. What it now reads, and what it still must not.** Positive controls: the Monte Carlo differs between sliders $0 and $150K, and between
Georgia and no state tax (both engines); between QCD $0 and $10,000 on `runExtendedMC` and `runStressTests` only (on the example the QCD
first changes Engine B's tax in 2039, after the 6-year run ends). Restated guards: **with the schedule held fixed** (`opts.taxSchedule`),
permuting every Other account's tax type moves neither Monte Carlo engine nor `runStressTests` (`t20`'s guard, on its new footing), and a
plan-type change moves no Monte Carlo figure (`t56` F-1 / F-3's Monte Carlo half). `t20` and `t56` themselves are edited to say this.

**H. What must not move.** Engines A, B, C and D bit-identical v6.18 → v6.19 on the example and every fixture (`t2`'s seven other
fingerprints, plus B, C and D rows). **The oracle differential:** a module built from the v6.18 source with `ROTH_TAX_DRAG_Q = 0` (the
`t80` §A builder), against v6.19 with an all-zero injected schedule, on a table whose rows have **integer** amounts, start and end on
quarter boundaries and carry no one-time rows — both engines and `runStressTests` **bit-identical**. That proves the release changes the tax,
the one-time rows and the quarter read, and nothing else.

**I. Rendered.** The Income tab's card shows the schedule's first-year figure at the slider's value and moves when the slider moves; the
Monte Carlo tab's sentence; the Field Manual paragraph; Backtest's and the Withdrawal entry's removed sentences are gone (`t81` L390–391
updated); What-Breaks' corrected sentences (DC-8).

**J. Copy.** METHODOLOGY's new section names the version; the v6.18 section's two Monte Carlo simplifications are marked closed.

**Parity.** `t2`'s `INTENDED_DIFFS` gains `"v618→v619": ["mc", "extMC", "stress"]`; the other seven keys must stay byte-identical.

**Re-pins, with attribution.** Every pinned Monte Carlo figure that moves (the probe found one: `t42` D-4's planned path, §0.3) is
re-pinned only with a three-step attribution in the same run, each step exact on the planned path: (1) the v6.18 oracle with the drag at 0
against v6.19 with a zero schedule and the example's one-time rows removed — equal to the v6.18 figure plus the drag's own compounded
series (computable, since the drag is a constant); (2) restoring the one-time rows — the difference equals §3 C's compounded charge;
(3) the real schedule — the difference equals §3 B's compounded tax. The monthly quarter read is step 1's only other term ($375 on `t42`
D-4, measured) and is pinned with it. A seeded median that moves (none found) gets the same three steps by difference, not exactly.

**Controls** — `qa/tools/controls_v619_mctax.py` (repo-only). Each mutation must turn named checks red, then every file is restored and
hash-checked: the flat drag restored at one site; the tax not inflated; the one-time rows not inflated; the one-time read back to the last
month; the monthly read back to the last month; the slider ignored (inputs hard-coded); the tail charged as zero; the schedule taken from
Engine A instead of Engine B.

---

## 4 · Out of scope, and stop conditions

**Out of scope, disclosed** (Field Manual and METHODOLOGY):
- **The calendar** (§0.1 item 1), if DC-0 (b): filed and disclosed, and this release's tax and one-time rows are placed by its labels.
- **The tax does not follow the path.** One deterministic schedule, from the plan's own draws, is charged on every path. A path that cuts
  spending at a guardrail, or draws more after a crash, pays the same tax; so does a path in the early-death stress test (`spouseADies70`)
  or under stochastic longevity, whose filing status the schedule takes from the plan's life expectancies. Computing Engine B per path is
  10,000 tax runs per run; it is not proposed.
- **The Social Security cut toggle** reaches the Monte Carlo's income but neither Engine B nor the Engine D draws it taxes, so with the
  toggle on the tax is computed on the full scheduled benefit and on draws that assume it — direction mixed, small.
- **IRMAA** is not in the Monte Carlo (DC-2 (a)). It is a Medicare premium surcharge on the IRMAA tab, $0 on the example.
- **The built-in spouse-B work** (§0.1 item 2): the Monte Carlo will pay the Taxes tab's tax on wages it does not credit — up to $14,479 on
  the example (BASE): $7,037 directly in 2029–2031 and $7,442 through Engine D's draws; conservative (DC-7 (a)). The taper itself is filed
  for its own release.
- **D-44's Withdrawal half** (a one-time row dated before the retirement year is not in the Withdrawal tab) — open, disclosed (DC-5 (a)).
- **D-39** (the home-move cash is not in Engines A–D) — so it is not in the Monte Carlo's tax either; consistent with the Taxes tab.
- **D-42, D-43** (the car and the Income tab's `− 400`) — their own release. **What-Breaks' tax** stays Engine A's average (it is a
  deterministic projector; making it Engine B's would be a separate change).
- **The mortgage what-if's Florida sentence** (§0.1 item 4) — filed, not fixed here.

**STOP and report if:**
- any Engine A–D figure, or any of `t2`'s seven non-Monte-Carlo fingerprints, moves;
- the schedule differs from the Taxes tab's rows anywhere (§3 A);
- §3 H's oracle differential is not bit-identical;
- a suite outside §0.3's list goes red for a reason the change does not explain;
- a 6-year re-run on the example (the three retirement years, as after a slider change) takes more than 1.5 × v6.18's time in the same
  environment, or the first extended run more than 1.5 × (measured both, recorded);
- re-running on the slider proves to need more than the effect and cache changes in §1.3.

---

## 5 · Decisions for Steve

**DC-0 · The Monte Carlo's quarter calendar (§0.1 item 1) — and so, the order of work.**
(a) **Fix the calendar first, in its own release** (scope next; this scope is then built as v6.20, its §0.2 and §0.3 re-measured on that
build). One quarter calendar for both engines, taken from the as-of date, with retirement, the claims and every table read on the dates
the plan states. It moves every Monte Carlo figure for every plan by itself, so its own release can attribute that move cleanly — the
reason the findings note put D-41 before D-40.
(b) Fix it inside this release — one move instead of two, but three changes to every Monte Carlo figure attributed in one run.
(c) Build this scope on today's calendar, file the calendar, and disclose it.
**Recommend (a).** On the example the 30-year engine's lag alone is worth 0.7 points and $44K of median (optimistic); for a plan saved in
October the 6-year engine reads its retirement rows half a year early.

**DC-1 · Which conversion level the Monte Carlo's tax uses.**
(a) **The live slider** — and the Taxes tab's QCD and dividend-yield settings — so the Monte Carlo always pays exactly what the Taxes tab
shows. The 6-year runs re-run about 300 ms after a change settles, on any tab (the header's success rate shows "…" meanwhile); the
30-year runs when their tabs are next opened. The slider is not saved, so every visit starts at $70K, as the Taxes tab does.
(b) A fixed $70,000, $0 QCD, 2% yield — the opening values — whatever the slider says. Simpler, no re-runs; the Monte Carlo and the Taxes
tab disagree as soon as the slider moves.
(c) A new saved My Data field, "planned annual Roth conversion", read by the Monte Carlo (and offered to the slider as its starting value).
Durable, but a second control for one quantity.
**Recommend (a).**

**DC-2 · Which tax.**
(a) **The Taxes tab's total** — federal, capital gains, NIIT, AMT, FICA on job income, state.
(b) Federal income tax only.
(c) (a) plus the IRMAA tab's surcharges (Engine C) — conservative; $0 on the example, up to $41K lifetime in §0.2's largest case.
**Recommend (a)** — it is what "the Taxes tab's tax" means, and IRMAA is a premium, shown on its own tab. Filed as a register item so
the omission stays visible (§6). Choose (c) if you want the more conservative figure now.

**DC-3 · Dollars.** Engine B's tax is (to its documented approximation) in today's dollars.
(a) **Grow it with each path's inflation** — the way the Monte Carlo grows spending and Social Security, and the way What-Breaks already
grows its engine tax. Conservative: the parts of Engine B's tax that come from nominal inputs (the RMDs and the realized gains) are grown
twice.
(b) Charge Engine B's figures as they stand — optimistic: tax on later years' income is understated by the inflation to that year.
**Recommend (a).** This is most of the move: on the BASE example 75.3% / $1,431K with (a), 79.4% / $1,543K with (b) (§0.2).

**DC-4 · Years after the schedule's last row** (a survivor who outlives the plan's horizon under stochastic longevity).
(a) **Charge the last row's tax** (grown with inflation) — conservative.
(b) Charge nothing.
**Recommend (a).** BASE, 35 years: 89.5% with (a), 90.5% with (b).

**DC-5 · D-44's other half: the Withdrawal tab never sees a one-time row dated before the retirement year.**
(a) **Leave it disclosed** (it is, since v6.18), for its own release. Fixing it means taking the row out of the balances the Withdrawal
tab starts from (`retireStartBalances`), which Engines A, B, C and D all share — a change to four engines' starting point in a release
that is meant to leave them untouched.
(b) Fold it in.
**Recommend (a).**

**DC-6 · Monthly rows over the whole quarter too.**
(a) **Yes** — the same three-month read as the one-time rows, so a row starting or ending inside a quarter is counted for its own months.
$2K or less on the example's median.
(b) One-time rows only; keep the last month × 3 for monthly rows (disclosed, as today).
**Recommend (a).**

**DC-7 · The built-in spouse-B work** (§0.1 item 2). The Taxes tab taxes it; the Monte Carlo does not credit it.
(a) **Pay the Taxes tab's tax as it is, and file the taper for its own release** — conservative by up to $14,479 on the example (BASE);
the taper's real problem (every plan without income streams, single ones included, gets the example's spouse-B wages in four engines) is
bigger than this release.
(b) Have the Monte Carlo credit the taper too, so the two agree — spreads a figure that should not be there into a fifth engine.
(c) Compute the Monte Carlo's schedule without the taper — then the Monte Carlo's tax is no longer the Taxes tab's.
**Recommend (a).**

**DC-8 · What-Breaks' sentences** (§0.1 item 3).
(a) **Correct them here** — L12125's "does not model taxes", L12112's and the Field Manual's "from the Taxes engine", and the Field
Manual's claim that the Monte Carlo covers IRMAA — since this release is about the Monte Carlo's tax and those sentences send readers to it.
(b) File them for later.
**Recommend (a).**

**DC-9 · Telling users their figures moved.**
(a) **No in-app notice** — no saved data changes; the CHANGELOG, Field Manual and METHODOLOGY say what changed and why (as v6.18).
(b) A one-time notice on the Monte Carlo tab for plans saved before this release.
**Recommend (a).** Every plan tested reads lower — about one to three points of 30-year success above $500K under BULL, more above
$800K — and the slider now moves the Monte Carlo, which a reader of the Monte Carlo tab sees in its new sentence.

---

## 6 · Register housekeeping at ship

In `MissingFeatures.md`: **D-40** and **D-45** closed by this release; **D-44** narrowed to its Withdrawal half (closed if DC-5 (b)). New,
with the next free IDs: the Monte Carlo's quarter calendar (§0.1 item 1 — filed now whatever DC-0 says, so it is on the record before
either release; closed by the calendar release if DC-0 (a)); the built-in spouse-B work taper in Engines A–D and not the Monte Carlo
(item 2 — open, either direction by engine); the mortgage what-if's Florida sentence (item 4 — open, display only); IRMAA not in the
Monte Carlo (if DC-2 (a) — open, optimistic for high-income plans); What-Breaks' sentences (item 3) only if DC-8 (b). The v6.18 scope and
the findings note need no change (both already point forward to this work).

---

## 7 · Build record

*(Filled at the build: the census re-run at the build's lines, every re-pin with its attribution, departures from this scope.)*
