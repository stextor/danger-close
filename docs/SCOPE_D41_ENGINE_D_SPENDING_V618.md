# SCOPE — v6.18 · D-41: the Withdrawal tab spends the expense table at the plan's own dates, year by year

**FULFILLED — shipped as v6.18, 2026-10-18.** Steve: *"go"* — all six decisions (a), as recommended. Build record in §7 (it records one
premise error, owned). Repo-only.

Steve, 2026-10-17, on the findings note `docs/FINDINGS-v6_17-fixed-plan-figures.md` (F-2): *"go"* — scope the Withdrawal tab fix first.

This is a **MODELLING** release, so METHODOLOGY changes. By census (§2) it reaches Engine D (the Withdrawal tab) and, through the bridge,
the Taxes, IRMAA and Roth tabs; Backtest and What-Breaks if DC-4 says so; and the display figures that quote "pre-/post-retirement
spending" in eleven places. **Both Monte Carlo engines are untouched**, and the release must prove they do not move (§3 D).

**Built against v6.17.** A fresh clone of `origin/main` at `52fe385` (v6.17 plus its chmod). Source `dc8a4d5f5796b11d88007024b1ecaca7`, built
page `067c87404e92339a1de9ece815d6151e` — the release verified on 2026-10-17. Line numbers are v6.17's, from `census.cjs`. Measurements use
a **session-only prototype** (v6.17 with Engine D's spending function replaced by a year-by-year read; never shipped). Register ID: the
findings note reserved D-40 to D-43 for F-1 to F-4, so F-2 is **D-41**.

---

## 0 · Premise (verified at v6.17, not assumed)

### 0.1 · What the app does today

- **Three snapshots of the expense table, taken on the example's calendar.** `PRE_MONTHLY`, `POST_MONTHLY_EARLY` and `POST_MONTHLY_FULL` are
  `getMonthlyExpense("2026-06")`, `("2029-06")` and `("2031-06")` — $6,700, $8,170 and $8,020 on the example — declared at L90–92 and recomputed at L96–98 by
  `recomputeDerivedExpenses()`. The three dates are the example household's "now", its retirement and spouse B's Medicare year,
  typed in. `getMonthlyExpense` skips one-time rows (L77); `getOneTimeExpenses` (L83) is the only reader of those.
- **Engine D spends two of them for life.** `computeWithdrawalPlan`'s `annualExpense` (L5652):
  `yr < medicareB.year ? POST_MONTHLY_EARLY : POST_MONTHLY_FULL`, times 12, times `_wInflator(yr)`, times the survivor factor from the
  first death. So, for every plan:
  1. a plan whose dates are not the example's spends the table **as it stood in June 2029 and June 2031** — for someone retiring in 2032,
     a month that still holds their current home's costs and none of their retirement rows;
  2. a row that ends after June 2031 is charged for life (the example's $400 car payment ends April 2034);
  3. a row that starts after June 2031 is never charged;
  4. one-time rows (the example's $20,000 golf cart and $8,000 closing costs, April 2029) never reach Engine D.
- **The Monte Carlo does not do this.** `runMonteCarlo` (L2547, L2557, L2609, L2621) and `runExtendedMC` (L2732, L2740, L2826, L2854) read
  the table at each quarter's own month (`getMonthlyExpense(dateStr)`) and subtract `getOneTimeExpenses(dateStr)` when it falls *(⚠ WRONG —
  corrected at the build, §7: the quarter's month is its LAST, and a one-time row in any other month is never charged; D-45)*. So the
  Monte Carlo and the Withdrawal tab disagree about spending for every plan except the example, and slightly for the example too.
- **Engines A, B and C inherit Engine D's error.** The bridge `withdrawalPlanSeries` (L6129) passes Engine D's draws to the Taxes tab
  (L10934), the IRMAA tab (L11225), What-Breaks (L12009) and the Roth tab and its solver (L6659, L10692, L10840). Engine A taxes that draw
  (v5.84, D-7) without draining it.
- **Backtest and What-Breaks have their own copy of the same rule.** Backtest's `baseMonthly` (L11737–11740) and What-Breaks' (L11959–11963,
  with the survivor factor) pick EARLY or FULL by spouse B's Medicare year, exactly as Engine D does.
- **The retirement-year buttons.** The Withdrawal tab offers the planned year and one year either side (`buildRetireOptions`, L822). Engine D
  is called with the chosen year; the snapshots do not move with it, so under v6.17 every button spends the same two figures.
- **Nothing discloses it.** `textsites.cjs` finds no sentence in the app or the Field Manual saying where the Withdrawal tab's spending
  comes from, and METHODOLOGY has no section on it (its §9 describes sequencing, not the spending figure).
- **The comment above the snapshots is stale.** L88–89 say "Defaults: $7,047 pre-retire, $8,313 post-retire (matches spreadsheet)"; the
  example's figures are now $6,700, $8,170 and $8,020.

### 0.2 · Measured (Engine D, the $70,000 conversion slider, base scenario)

The example household, then the same household with every date moved later — both birth dates, both retirement years, and every row's
start and end, except open-ended rows — so the plan is the same plan, just on a later calendar.

| Household | Read | First-year spending | Lifetime spending | Lifetime draws | Ending portfolio | Taxes tab lifetime tax | Roth tab, best strategy: tax / estate |
|---|---|---|---|---|---|---|---|
| Example (retires 2029) | v6.17 snapshots | $98K | $2,986K | $1,213K | $1,868K (2053) | $215K | $256K / $4,535K |
| | year by year | **$126K** (incl. $28K one-time) | **$2,893K** | $1,120K | **$1,977K** | $215K | $256K / $4,540K |
| Every date +3 years (retires 2032) | v6.17 snapshots | **$80K** | $2,492K | $772K | $2,711K | $219K | $240K / $4,870K |
| | year by year | $126K | $2,893K | $1,120K | $1,977K | $223K | $263K / $4,819K |
| Every date +6 years (retires 2035) | v6.17 snapshots | — | — | — | $2,711K | $227K | — |
| | year by year | — | — | — | $1,977K | $231K | — |

- **The shifted household is the defect.** At +3 years the Withdrawal tab spends $6,700 a month (the June 2029 table) where the table at
  the plan's own dates says $8,170, then $8,020: **$401K less lifetime spending and a $734K higher ending portfolio** than the same plan on
  the example's calendar. Year by year, the +3 and +6 households give the example's own figures, as they should. The Roth tab's best
  strategy is the same one (fill to 12%) under both reads; its tax rises $23K and its estate falls $51K at +3 years.
- **The example moves too, less.** The year-by-year read adds the two one-time rows in 2029 (+$28,000) and stops the car payment after April
  2034 (−$400 a month thereafter): lifetime spending −$93K, ending portfolio **+$109K**. Its Taxes and IRMAA totals do not move at this
  rounding ($215K, $51K).
- **The retirement-year buttons on the example:**

  | Button | Read | First three years | Lifetime spending | Ending portfolio |
  |---|---|---|---|---|
  | −1 year (2028) | v6.17 | $98K, $101K, $103K | $3,166K | $1,695K |
  | | year by year | **$81K, $130K**, $103K | $3,054K | $1,848K |
  | Planned (2029) | v6.17 | $98K, $101K, $102K | $2,986K | $1,868K |
  | | year by year | **$126K**, $101K, $102K | $2,893K | $1,977K |
  | +1 year (2030) | v6.17 | $98K, $99K, $102K | $2,811K | $1,993K |
  | | year by year | $98K, $99K, $102K | $2,693K | **$2,174K** |

  Year by year, retiring a year early spends the table's pre-retirement costs in 2028 and the current home's last quarter plus the move
  in 2029 — what the table says, and what the Monte Carlo already does for that button. Retiring a year late puts the April 2029 one-time
  rows before retirement, where Engine D (which starts from today's balances) never sees them — see §4.
- **Direction: optimistic** for anyone retiring after the example whose pre-retirement rows end at retirement, which is how My Data asks for
  them; **mixed** on the example (one-time rows conservative to include, the car ending optimistic to honour).

### 0.3 · What the change does to the existing suite (probe, not the build)

The prototype — Engine D's read only; not DC-3 or DC-4 — was registered as `v618` in a session copy of the v6.17 run folder and run through
37 suites — those that call Engine D or its bridge, `t1`–`t10`, and the DOM diff — and the parity compare. **38 checks in 10 suites went red, every one a figure
that pins Engine D's output or something computed from it on the example's table:**

| Suite | Red | What they pin |
|---|---|---|
| `t40_cross_tab_agreement` | 12 | the example's lifetime draws, RMDs, federal tax, gap-year tax, IRMAA peak MAGI; C1's "identical on both legs" row sum |
| `t19_engineD_exact` | 5 | the mixed-pool household's lifetime gain, MAGI, RMD and a precondition |
| `t20_other_taxtype` | 4 | the annuity/Traditional fixtures (they call Engine D at retirement 2027 on the example's table) |
| `t42_single_spouse_b_ss` | 4 | 2035's spending (the car payment is over by then), its tax, and two married totals |
| `t43_ss86_one_rule` | 3 | two years' MAGI held as controls, and a single-household MAGI |
| `t71_engine_d_other_ira` | 3 | lifetime RMDs and one conversion amount |
| `t72_engine_d_other_roth` | 2 | a lifetime RMD and a realized gain |
| `domdiff_withdrawal` | 3 | its identity arms for the Withdrawal, Taxes and IRMAA tabs |
| `t58_state_draw` | 1 | North Carolina's lifetime draw |
| `t75_engine_d_ss86` | 1 | 2032's taxable Social Security |

Green on the prototype: `t1`–`t10`, `t12`–`t14`, `t17`, `t18`, `t29`, `t44`, `t49`, `t56`, `t57`, `t60`, `t61`, `t63`, `t70`, `t77`, `t79`, `t80`, and
**parity 10 of 10 identical** — `t2` has no Engine D fingerprint, its Engine A fingerprints are hand-built without the draw, and its three
Monte Carlo keys did not move. So **no `INTENDED_DIFFS` entry is needed**, and `t2`'s identity is a witness that the Monte Carlo is untouched.
The other suites were not run on the prototype; the build runs everything.

### 0.4 · Register sweep (OPERATIONS §K2)

`POST_MONTHLY`, `PRE_MONTHLY`, `getMonthlyExpense`, "one-time", "snapshot", "2029-06", "2031-06" across `MissingFeatures.md`, every
`FlawsToFix-*`, `ARCHITECTUREIssues.md`, `UsabilityFlaws.md` and METHODOLOGY: **nothing registered** about the spending figure (hits are the
QCD's one-time election D-5, the MC's quarterly snapshots, and v6.17's closing-costs sentence). Only the findings note names it.

---

## 1 · The change (recommended options)

### 1.1 · Engine D reads the table year by year (DC-1 (a), DC-2 (a))

One module-level function beside `getOneTimeExpenses` — working name `tableYearExpense(yr, survivorFromYr)` — returns a calendar year's
spending **in the table's own (today's) dollars**: the sum of `getMonthlyExpense` over that year's twelve months, times
`SURVIVOR_SPEND_FACTOR` from `survivorFromYr` on, plus the sum of `getOneTimeExpenses` over the same months (no survivor factor — a one-time
row is a specific purchase). Engine D's `annualExpense` becomes `tableYearExpense(yr, _deathYr1D) × _wInflator(yr)`. Its inflation is
unchanged (§4).

### 1.2 · Backtest and What-Breaks read it the same way (DC-4 (a))

Backtest's `baseMonthly(k) × 12` (L11761) and What-Breaks' (L11971, L12035, L12048, with its survivor year `_deathYr1W`) become the same
function. Each keeps its own inflation path. So the four engines that spend through retirement — both Monte Carlos, Engine D, Backtest
and What-Breaks — read the table at the year it describes. (The Monte Carlo samples one month per quarter; the others sum all twelve.
Disclosed, not changed.)

### 1.3 · The display figures follow the plan's dates (DC-3 (a))

The three snapshots stay — eleven places quote them as "pre-retirement", "post-retirement" and "after spouse B's Medicare" spending — but
`recomputeDerivedExpenses()` takes their dates from the plan's timeline, by one rule: **the later of the event's month, June of the event's
year, and the as-of month.** PRE's event is the as-of date; EARLY's is the retirement date (January of the planned year); FULL's is the
later of spouse B's Medicare date and the retirement date (a single plan's Medicare date is spouse A's, as Engine D already uses).

On the example the rule gives **2026-06, 2029-06 and 2031-06 — today's three dates — so no display figure on the example moves.** On the
+3 household it gives 2026-06, 2032-06 and 2034-06 ($8,170, $8,020). `recomputeDerivedExpenses` builds the timeline itself
(`buildPlanTimeline()`), so it is right at all five call sites, including the three reset paths (L14262, L14281, L14330) that swap the plan
without rebuilding `PLAN_TIMELINE`. The module-level initial values move to just after `PLAN_TIMELINE` is first built (L741); the build
confirms the module still loads before that point.

### 1.4 · What the user reads

- The Withdrawal tab gains one sentence under its schedule: spending is the expense table at each year's own dates — monthly rows for the
  months they run, one-time rows in their year — inflated from the retirement year; a one-time row dated before retirement is not in this
  schedule.
- The Field Manual's Withdrawal entry says the same, dated v6.18, with one clause on what earlier versions did.
- METHODOLOGY gains **"The Withdrawal tab spends the expense table year by year (v6.18)"**: the defect, the rule, the display-date rule, the
  measurements in §0.2, and the limitations in §4.
- The stale L88–89 comment is corrected.
- **No in-app notice** (DC-6 (a)). No saved data changes; the figures change because the model is corrected, and the CHANGELOG and
  Field Manual say so.

### 1.5 · The version

v6.18 at the four in-app sites (footer, DATA LOAD header, Field Manual callsign and footer). The test shim exports the three snapshots
and the new function, guarded.

---

## 2 · Site census (v6.17 lines; re-run at the build and recorded in §7)

### 2.1 · App

| What | Sites | Change |
|---|---|---|
| Snapshot definitions and recompute | L90–92, L93–98 | dates from the timeline (1.3); initial values after L741 |
| `applyLoadedData` save and restore | L3839, L3846 | none (they copy whatever the values are) |
| Engine D `annualExpense` | L5652 | the year-by-year read (1.1) |
| Backtest `baseMonthly` | L11737–11740, used at L11761 | the year-by-year read (1.2) |
| What-Breaks `baseMonthly` | L11959–11963, used at L11971, L12035, L12048 | the year-by-year read, with its survivor year (1.2) |
| Display reads of the snapshots | L7008 (Ask AI), L7215 (header), L7853, L7879 (Expenses), L8033–8298 (Income), L8713, L8769, L8771 (SS), L9023, L9096, L9162 (Grade), L9406 (Ranking), L11861 (Backtest steady state), L12050 (What-Breaks), L12142 (Survivor), L12354, L12364 (Stress) | none — they follow 1.3 |
| Monte Carlo table reads | L2547, L2557, L2609, L2621, L2732, L2740, L2826, L2854 | **none** |
| Other table reads | L7136, L11325 (each reads the table at its own date) | none |
| Copy | Withdrawal tab; Field Manual (in `DOCS_HTML`, quote-free anchors) | 1.4 |
| Version | four sites | v6.18 |

Census counts: the three snapshot names have 56 AST hits (7 + 18 + 31, definitions included); `getMonthlyExpense` 13; `getOneTimeExpenses` 5;
`recomputeDerivedExpenses` 5. F-4's `− 400` sites (L8076, L8159, L8282–8283, L8298) are in the Income tab's list and are **not** changed (§4).

### 2.2 · Suites

- **Re-pinned per leg:** the 38 checks in §0.3, plus whatever the full run finds. Each v6.18 figure is accepted only when the movement is
  attributable to spending alone: the household's spending series equals `t81`'s independent oracle, and the same household on a *flat
  table* (§3 D) is unchanged. The v6.17 leg keeps its figure. Every re-pin names D-41 and the measured delta, the way D-33's did.
- **`domdiff_withdrawal`:** a v6.17 → v6.18 arm — intended difference, bounded: the schedule, Taxes and IRMAA tables differ; every
  disclosure arm holds; the new sentence is present on v6.18 only.
- **`t2`:** no entry; its identity is a witness (§0.3).
- **Registration:** `v618` by `register_v611.cjs` and the hand-registered sites, before the first full run; `suitetext.cjs` for any typed
  "v6.17" in a SETUP check.

---

## 3 · Tests — new `qa/t81_engine_d_spending.mjs`, both legs (v6.17 prior, v6.18 current)

**A. The oracle (independent).** For each household, the test recomputes every year's spending from `EXPENSES` itself — its own month loop,
its own one-time sum, its own survivor year and inflator, no app function — and compares Engine D's `exp_y` **to the cent**. Households: the
example; every fixture in `tools/fixture/households.mjs`; the example shifted +3 and +6 years; a single household; one whose spouse B
reaches Medicare before retirement; a survivor case; and a table built to stress the rule (a one-time row mid-year, a row ending mid-year,
a row starting after the Medicare year). Hand pins on the example: **2029 = $126,280** ($98,280 of monthly rows for the months they run,
plus $28,000 one-time); 2034 carries the car payment for four months, not twelve; in the survivor year the factor applies to the monthly
part only. On the v6.17 leg the same oracle disagrees, pinned as dated `[KNOWN DEFECT]` checks (the +3 household's first year: $80,400
against $126,280).

**B. Extinction (AST).** No string literal of the form `YYYY-MM` is an argument to `getMonthlyExpense` or `getOneTimeExpenses` anywhere; Engine
D's spending reads none of the three snapshots; Engine D, Backtest and What-Breaks all call the one function; no engine A–D reads a snapshot.

**C. The display figures follow the plan.** On the example, all three are **identical to v6.17's** (the rule reproduces 2026-06 / 2029-06 /
2031-06). The +3 household gives its own June 2032 and June 2034 figures; the Medicare-before-retirement and single households follow the
rule; a plan swapped by each of the three reset paths recomputes against its own dates.

**D. What must not move.**
1. Both Monte Carlo engines, bit for bit across v6.17 → v6.18, on the example and every fixture (with `t2`'s parity as a second witness).
2. A *flat-table* household — no one-time rows, and every row changing only in January of the retirement year or of spouse B's Medicare year
   — gives bit-identical Engine D schedules, bridge series and Engine A–C results on both legs: the negative control that only the read
   changed.
3. On the example, the per-year change in Engine D's spending is exactly the oracle's difference (2029's one-time rows, the car payment
   from May 2034), and no other year moves.

**E. Rendered.** The Withdrawal tab on the example shows 2029's spending with the one-time rows in it, and the new sentence; Backtest and
What-Breaks on the +3 household move in the stated direction across the legs; the Expenses tab header on the example is unchanged.

**F. Copy.** The Field Manual and METHODOLOGY sections exist and name v6.18; the stale "Defaults: $7,047 … $8,313" comment is gone.

**Controls** — `qa/tools/controls_v618_spend.py` (repo-only), each mutation must turn named checks red, then every file restored and
hash-checked: Engine D back on the snapshots; one-time rows dropped; the survivor factor applied to one-time rows; one-time rows uninflated;
a snapshot date typed back in; Backtest bypassing the function; What-Breaks bypassing it; inflation from the as-of year instead of
retirement; the unmutated run.

---

## 4 · Out of scope, and stop conditions

**Out of scope, disclosed:**
- **The inflation base.** Engine D inflates spending, Social Security and pensions from the retirement year and starts from today's balances
  without growth — the v5.10 "nominal dollars, no growth" house rule (METHODOLOGY, retirement-start snapshot). Inflating only the
  spending from today would break that convention, so it is not touched. (The prototype measured it; it was dropped for that reason.)
- **One-time rows dated before retirement** are not in the Withdrawal tab (it starts at retirement from today's balances); the Monte Carlo
  takes them from the portfolio when they fall. Disclosed in the new sentence.
- **The Monte Carlo subtracts one-time rows in today's dollars** (L2557, L2621, L2740, L2854) while it inflates monthly rows — optimistic by the
  inflation to that date, small. Filed as **D-44**, not changed (it would move every Monte Carlo figure; it belongs with F-1).
- **The Monte Carlo samples one month per quarter**; the others now sum twelve. A row that starts or ends inside a quarter is counted
  differently by a few months. Disclosed in METHODOLOGY.
- **F-1** (the Monte Carlo's flat tax), **F-3** (the $40,000 car), **F-4** (the Income tab's `− 400`) — their own releases.
- **D-39** (the Withdrawal, Taxes, IRMAA and Roth tabs ignore the home-move cash) — open, unchanged.

**STOP and report if:**
- either Monte Carlo engine, or any of `t2`'s ten fingerprints, moves;
- any display snapshot on the example moves;
- the flat-table household moves in any engine;
- Engine D's spending differs from the oracle on any household;
- a suite outside §0.3's list goes red for a reason that is not spending (and is not explained by DC-3 or DC-4);
- the snapshots cannot be computed from the timeline without reordering module initialisation beyond moving their first assignment.

---

## 5 · Decisions for Steve

**DC-1 · How the Withdrawal tab reads the expense table.**
(a) **Year by year** — each year's own months and one-time rows, the way the Monte Carlo reads it. Fixes all four effects in §0.1.
(b) Keep two figures, but take them at the plan's own retirement and Medicare dates. Fixes the shifted-calendar error only; rows that end
or start later in retirement, and one-time rows, stay wrong.
**Recommend (a).**

**DC-2 · One-time rows in the Withdrawal tab.**
(a) **Included in their year, inflated like monthly rows, without the survivor factor.**
(b) Included in today's dollars, matching the Monte Carlo's current (optimistic) treatment.
(c) Left out, disclosed.
**Recommend (a)** — conservative, and consistent within Engine D. The Monte Carlo's treatment is filed as D-44.

**DC-3 · The "pre-/post-retirement spending" figures quoted in eleven places.**
(a) **Follow the plan's dates** by the rule in §1.3 — the example's figures do not move; a plan on another calendar sees its own.
(b) Leave them on the example's dates — display only, but a shifted plan's Expenses tab header and Income tab disagree with its
Withdrawal tab.
**Recommend (a).**

**DC-4 · Backtest and What-Breaks.**
(a) **Read the table the same way**, through the one function, so the tabs agree.
(b) Leave them on EARLY/FULL (which follow DC-3's dates) and register the remainder.
**Recommend (a).** Their figures move with Engine D's; §3 E checks the direction.

**DC-5 · The retirement-year buttons (−1 year / +1 year).**
(a) **The table stays on its calendar dates** — retiring a year early spends the pre-retirement rows until they end, as the Monte Carlo
already does for that button (§0.2's table).
(b) Shift every row with the button — a different model from the Monte Carlo's, and a larger change.
**Recommend (a).**

**DC-6 · Telling users their figures moved.**
(a) **No in-app notice** — no saved data changes; the CHANGELOG, Field Manual and METHODOLOGY say what changed and why.
(b) A one-time notice on the Withdrawal tab for plans saved before v6.18.
**Recommend (a).** Every plan on a calendar other than the example's sees its Withdrawal, Taxes, IRMAA and Roth figures move — usually
toward less money left.

---

## 6 · Register housekeeping at ship

In `MissingFeatures.md`: **D-40** (F-1, the Monte Carlo's flat tax — open), **D-41** (F-2 — opened and closed by this release), **D-42** (F-3,
the fixed car schedule — open), **D-43** (F-4, the Income tab's `− 400` — open), **D-44** (the Monte Carlo's one-time rows in today's dollars;
the Withdrawal tab's pre-retirement one-time rows — open, optimistic, small). The findings note rides in this release's zip at
`docs/FINDINGS-v6_17-fixed-plan-figures.md`, with a line pointing to this scope.

## 7 · Build record

**Built against v6.17** (`dc8a4d5f…` / built `067c8740…`); the v6.17 page was rebuilt first and reproduced `067c87404e92339a1de9ece815d6151e`.
**v6.18:** source `208bf89d1bd83fc55d430f2eec60d202`, built `index.html` `d228f1d3391231406848d2647cb97fec`; `smoke_built` 22 of 22. Decisions: DC-1 to DC-6 all **(a)**.

**Census at the build (v6.18 lines, `census.cjs`).** `tableYearExpense`: defined L94, read at L5684 (Engine D), L11766 (Backtest), L11987
(What-Breaks). `_snapshotMonth` L111, used L125–127 by `recomputeDerivedExpenses` (L119), which is called at L771 (module, right after the first
`PLAN_TIMELINE`), L4182 (load) and the three resets L14286, L14305, L14354. The three snapshots: 7 + 15 + 28 = 50 AST hits (56 at v6.17 — the
three engine reads gone, each name's declaration and recompute assignment kept); no engine reads one. Version: four sites; registrar 329 sites.
The shim exports `tableYearExpense`, `recomputeDerivedExpenses` and the snapshots (guarded).

**Tests.** `t81`: 130 on v6.18, 40 on v6.17. Controls `qa/tools/controls_v618_spend.py` 11 of 11, files restored and hash-checked. Full suite from the packaged
copies: **7,656 app checks across 80 app suites** (the eight `-spend617` attribution runs, 236 checks, included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 44, `sets` 12 + 12; **GRAND 7,798**. Against v6.17's line the counts that moved are `t14` 47 → 48, `t19` 68 → 71 and `t80` 42 → 28, and `t81` is new. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v617 v618` from a fresh clone of `52fe385` carrying the package as cut (81 files); the documentation was finished after the run (no suite reads it but `METHODOLOGY.md`, which was final). An earlier pass on a first cut was stopped and discarded when the review's copy corrections changed the source.

**Re-pins (each with its attribution: the suite's v6.17 figure reproduced exactly on v6.17's spending written as a table,
`qa/tools/v617_spending.mjs`, validated by `t81` D-4).** The first full run on the build had **39 red checks that rode on spending** in eleven
suites, not §0.3's 38 in ten: `t40` 12, `t19` 5, `t20` 4, `t42` 4, `t43` 3, `t71` 3, `domdiff` 3, `t72` 2, `t58` 1, `t75` 1, `t76` 1 (the probe
never ran `t76` — its recovered crossover moved 2062 → 2061 because Engine A taxes the bridge's draw), plus `t14` 1 (structural: the survivor guard
moved into `tableYearExpense`; the probe's hook had left the old line in place). Also red and not spending: four built-page checks (`t45`, `t47`,
`t48`, `t78`; that run folder still held v6.17's page) and `t80` A-0 (its v6.16 oracle source is not in a v6.17 → v6.18 folder; §A now skips by
design there). Per-leg re-pins with the `-spend617` second run: `t40`, `t42` (2035 re-derived by hand), `t43`, `t58`, `t71`, `t72`, `t75` (2032's
worksheet re-derived by hand), `t76`. Inline: `t19`'s mixed pool. Moved onto v6.17's spending as a table, because their subject is not spending:
`t19`'s RMD-sourcing household (it needs a spending need in every RMD year) and `t20`'s tax-type block (its exacts hold only while the pool
exhausts in the horizon). `domdiff` gains a v617 → v618 arm.

**STOP conditions.** None of §4's met: both Monte Carlo engines and all ten `t2` fingerprints bit-identical; the example's display figures
unchanged; the flat table moves nothing; Engine D equals the oracle on every household; every red check outside §0.3's list was explained above.

**Where the build departed from the scope, owned.**
- **A premise error in §0.1, found before ship by an independent review of the release.** §0.1 (and the v6.17 findings note) said the Monte
  Carlo subtracts one-time rows "when they fall". Both engines read the table once a quarter, at the quarter's LAST month, and the one-time
  match is exact, so a one-time row dated in any other month is never charged — the example's April 2029 rows ($28,000) have never reached the
  Monte Carlo (measured: byte-identical output with and without them; dated June they move both engines). It does not change what this release
  builds — Engine D, Backtest and What-Breaks are right, and §4 keeps the Monte Carlo bit-identical — but the first draft of the copy repeated
  the error ("the Monte Carlo takes it from the portfolio when it falls") on the Withdrawal tab, in the Field Manual and in Backtest's sentence.
  All three were corrected before the package was cut; the Field Manual now discloses the Monte Carlo's behaviour; `t81` §C2 pins it as a dated
  `[KNOWN DEFECT]` (with a control that the same rows dated June do move it). Filed as **D-45** (low–medium, optimistic), with the v6.17
  home-move note's "closing costs … are already counted" recorded there as untrue for the example's April row. The same review found
  METHODOLOGY's first draft saying Engine D inflates the pension (it is flat), and the "$401K / $734K" comparison worded against the wrong
  baseline; both corrected.
- **§3 E** said Backtest and What-Breaks would be checked on the +3 household across the legs. They are checked on the example on each leg
  (`t81` E-5, E-8: measured values, not independent — their engines are inline and reachable only through the DOM), plus an AST check that each
  reads the year it is called for (B-6b, added after the review).
- **§1.4's Backtest sentence** was not in the census: rendering the tab showed it claimed the backtest omits one-time expenses, false from v6.18.
  Corrected.
- **The Withdrawal tab's new sentence** first rendered "spent.Expenses" (no space after the preceding text); fixed with a JSX space.
- **Not changed, noted:** the Expenses tab's label "→ $FULL (after <spouse B's Medicare month>)" still names the Medicare month when Medicare
  comes before retirement, where FULL is now taken at the retirement date (EARLY = FULL there). Display only.


---

**Destination:** repo `docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md` (repo-only, like every SCOPE). It can ride in the v6.18 zip rather than be
uploaded now. **Not pooled.**
