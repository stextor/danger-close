# SCOPE — v6.21 · D-42, D-43, D-47, D-50: the example's car, its $400 payment, the Stress tab's benchmark, and Florida

**FULFILLED 2026-10-19 — built as v6.21** (§7). Decided the same day — all seven decisions (a), as recommended (Steve: DC-1 *"Expense
rows"*, DC-2 *"Add visible rows"*, DC-3 *"No car rows"*, DC-4 to DC-7 *"All as recommended"*). Repo-only (`docs/`); it ships in the v6.21
package.

Steve, 2026-10-19, choosing the next build: *"D-42+D-43, add D-47/D-50 (Recommended)"*. That is the order agreed at v6.18 (D-41, then
D-40, then D-42 and D-43 together), with two small display items folded in.

This is a **MODELLING** release if DC-1 is (a) or (b), so METHODOLOGY changes. D-43, D-47 and D-50 are display only.

**Built against v6.20.** Fresh full clone of `origin/main` at `5b1e6ba` (v6.20 plus the two ops packages of 2026-10-19). Source
`8db224990e86ddcbe2180f96b6a52889`, built page `2a0b45ea9c1425752ff8918862e15202`, both equal to the manifest and the newest CHANGELOG
provenance line; the pooled source hashes the same. Every line number below is a v6.20 line, printed this session by `qa/tools/census.cjs` or
by an acorn walk over the source (`s621/cen.cjs`, session-only). Figures are from the run folder built for the 2026-10-19 package
(`mk_runfolder.sh v619 v620`, its `v620.jsx` hashing `8db22499…`), 3,000 paths, seed 11, BASE and BULL-LEANING presets. The harness
reproduces v6.20's published figures: the example's 30-year success above $800K under BASE reads **74.4%** and above $500K under BULL-LEANING
**95.3%**, the two numbers in v6.20's CHANGELOG entry.

The tag `v621` is free: `vercensus.cjs v621 qa` reports 0 sites; the three `.py` suites' `KNOWN_VERSIONS` end at `v620`;
`git log -- qa/qa-baseline/dom_entry_v621.jsx` is empty. The suite name `t84` is free.

---

## 0 · Premise (verified at v6.20, not assumed)

### 0.1 · D-42 — a $40,000 car every 8 years, on every plan

- **One constant.** `const AUTO_REPLACE_COST = 40000;` (L1246, "car replacement every 8 years in retirement, today's $").
- **One charge site** (`census.cjs AUTO_REPLACE_COST`: 2 hits, the declaration and the charge). `runExtendedMC` L2980–2982:
  `if (autoReplace && retired && yearFromRetire > 0 && yearFromRetire % 8 === 0 && calMonth === "03") portfolio -= AUTO_REPLACE_COST * inflationCum;`
  So the car is bought in the January–March quarter of retirement years 8, 16 and 24 (2037, 2045, 2053 for the example) — and 32, where a
  35-year run reaches it. `runMonteCarlo` (the 6-year headline) never charges it. It is keyed to the **selected** retirement year, so the
  retirement-year buttons move it.
- **Which runs charge it** (`census.cjs autoReplace`: 16 source sites). The option defaults to `true` (L2773). Run C, its no-shock twin
  and run D (L6855–6861), the mortgage what-if (L6882) and four of the seven stress runs (LTC event, LTC marathon, spouse A dies at 70, the
  base 30-year — L3060–3088) charge it. Runs A and B (L6852–6853) and the AI-bubble, stagflation and sequence stress runs set it `false`.
- **Every plan.** No input sets it: the example, a Start Fresh or wizard plan, an imported backup.
- **⚠ Found while scoping — the guardrail benchmark omits it.** `runExtendedMC`'s deterministic planned path (L2819–2849, the reference
  the guardrails compare each path against, L2988–2992) subtracts the home-move cash, the mortgage, spending, tax and one-time rows — **not**
  the car. Each car year pushes every path down against a benchmark that did not move, so the cut guardrail fires more often than the plan
  itself warrants. Not registered anywhere; recorded here.
- **The double count** (D-42 as filed). A household that enters car purchases in its expense table pays twice: once through the table (from
  v6.20 the Monte Carlo charges one-time rows, inflated, in their own quarter) and once through this constant.
- **The Withdrawal, Taxes, IRMAA and Roth tabs never see the car** (Engines A–D have no reference to it). The example's own table has a
  car *payment* (L67: $400 a month, April 2029 to April 2034) but no replacement.
- **Disclosed** in one Field Manual bullet (*"Auto-replacement is a fixed example schedule and won't match every household"*, DOCS @132,667),
  the Stress tab's guardrail note (L12548, *"with mortality + auto-replacement"*) and the mortgage what-if on the Monte Carlo tab (L11545,
  *"the realistic 30-yr run (LTC + mortality + auto-replacement)"*). METHODOLOGY mentions it once, in passing (*"the car every 8 years"*,
  L2696). My Data and the runs' headers say nothing. The demo master prompt (`DEFAULT_MASTER_PROMPT`, from L201) describes the example's
  cars twice in its own words (L282 *"new/used car every 7–10 years"*, L350 *"~$40,000 every 8 yrs"*); it is the example's text and sent to
  Ask AI as such.
- **Measured** (v6.20, the example, LTC shocks on, 30 years; success above $500K | above $800K | median end):

  | Preset | As shipped (car on) | No car | Car as $40,000 one-time rows in the table (2037, 2045, 2053; a 2061 row falls outside 30 years), constant off |
  |---|---|---|---|
  | BASE | 85.0% · 74.4% · $1,392K | 88.6% · 79.3% · $1,527K | 84.5% · 73.9% · $1,353K |
  | BULL-LEANING | 95.3% · 91.0% · $2,112K | 96.6% · 93.2% · $2,234K | 95.1% · 90.6% · $2,048K |

  The independent review re-ran it with another seed (23): BASE 84.8 · 73.7 · $1,432K → 88.5 · 78.6 · $1,562K → 84.5 · 73.0 · $1,389K;
  BULL-LEANING 95.3 · 90.4 → 96.8 · 93.0 → 95.3 · 90.2. Direction and size hold. The third column is a little below the first for two
  reasons: the rows also enter the planned path (the guardrail item above), and they reach Engine D, whose draws feed the tax schedule the
  Monte Carlo pays (2037's tax $10,466 → $12,656; 2045 $5,147 → $6,692; 2053 $6,185 → $6,711) — that part alone is about 0.1 point. As table rows, the car reaches **Engine D**: the example's Withdrawal schedule
  spends +$49,657 in 2037, +$61,644 in 2045, +$76,526 in 2053 (the $40,000 inflated from the retirement year by Engine D's own rule), MAGI
  rises $22,660 in 2037, and the 2053 ending portfolio is **$260,293 lower**. So option (a) moves the example's Withdrawal, Taxes, IRMAA and
  Roth figures, where (b) moves only Monte Carlo figures.
- **Direction today:** conservative for a household that does not buy cars on that schedule; double-counted (more conservative still) for
  one that enters its cars; and, on the tabs that never see it, optimistic for one that does buy them and has not entered them.

### 0.2 · D-43 — the example's $400 car payment, subtracted from every plan

- **Six sites, on two tabs** (acorn: `BinaryExpression` `−` with literal `400`). ⚠ The register says *four*, on the Income tab; it is six:
  - **Income tab:** L8188 `postCarDraw = annualDraw(POST_MONTHLY_FULL - 400, …)`; L8271 card *"Monthly Shortfall (car paid off)"*; L8395
    *"Post-car draw"*; L8412 *"After the car payment ends, the shortfall drops to …"*.
  - **Social Security tab:** L8883 and L8885, card *"Post-car shortfall"* (L8881) and its percentage of the portfolio.
- `POST_MONTHLY_FULL` is the table at the plan's "after spouse B's Medicare" month (v6.18, `_snapshotMonth`: 2031-06 on the example). For
  the example the $400 is right: its car payment runs to April 2034, so the table from May 2034 is exactly `POST_MONTHLY_FULL − 400`. For
  every other plan the $400 is an invented reduction — **optimistic, display only**. A plan with no car payment is told its spending falls
  $400 when a car it does not have is paid off.
- `t6` (L127) pins the Social Security tab card's single-filer branch by source text, so D-43 touches it.
- **Example check** (run): the table is $8,020 a month at 2031-06 and 2034-04 and $7,620 at 2034-05; the Car Payment row is the only monthly
  row running at 2031-06 that ends before the horizon, so the rule proposed in DC-4 (a) gives today's figure exactly.

### 0.3 · D-47 — the Stress tab's "planned" column ignores withdrawals

- **One site.** L12560 `const planned = PORTFOLIO.household * Math.pow(1.04, yi);` in the Stress tab's *30-YEAR GUARDRAIL BOUNDARIES —
  PLANNED GLIDE PATH* table; *Lower (80%)* and *Upper (120%)* are ±20% of it, and the median cell is coloured by whether it falls between.
  (The only other `1.04` in the source, L13097, is the lifetime-fees projection — a different figure, out of scope.)
- METHODOLOGY carries it as a limitation bullet (L2655, filed at v6.19); it closes with the fix.
- `runExtendedMC` has returned its own planned path since v6.20 (L3037, *"the tests read it; nothing in the app does"*). Snapshot `yi` is
  the end of quarter `4·yi − 1` (`mcSnapshotDate`), which is `plannedPath[4·yi]`.
- **Measured** (the stress set's base 30-year configuration — autoReplace on, LTC off — at 3,000 paths; the tab runs 5,000): under
  **BULL-LEANING** — the preset a first visit opens on — the 4%-a-year benchmark marks the median **below the lower band in 16 of the 31
  yearly snapshots** (the table shows every second one) (from year 16, by year 30 $5,342K planned against a
  $2,983K median), while the engine's own planned path marks **none**. Under BASE: 20 of 31 against 15 of 31 — so with the fix, a BASE
  reader still sees LOW from about year 16, and that is the honest reading (the review: seed 42 at 5,000 paths, BULL 15 vs 0, BASE 21 vs
  14). Today the table tells a first-visit user the plan falls off its glide path, against a path the engines stopped using.

### 0.4 · D-50 — the mortgage what-if speaks to Florida

- **One sentence**, L11606: *"Mortgage interest isn't deductible for you (standard deduction + no FL income tax), so there's no tax
  offset."* Shown to every plan that slides the mortgage principal above $0.
- **A sibling the register does not have** (found by the review, confirmed): the Roth tab's *Tax rules applied* box says *"Florida — no
  state income tax"* (L10697), unconditionally, for every plan — though the Roth engine charges the plan's own state. Same class; folded
  into DC-6.
- **What the model actually does:** no itemized deductions anywhere (D-4; the Field Manual says *"no state's itemized deductions are
  modelled (conservative)"*), and both arms of the what-if pay the same tax schedule. So the true statement is about the model, not about
  Florida or about the user: no engine deducts mortgage interest.

### 0.5 · Register sweep by mechanism (OPERATIONS §K2)

Searched `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `FlawsToFix-v5_73-Phase2.md` and `UsabilityFlaws.md` for `AUTO_REPLACE`,
`autoReplace`, "car", "auto-replacement", `POST_MONTHLY_FULL`, `1.04`, "glide path", "FL income tax" and "mortgage interest". Hits:
D-42, D-43, D-47, D-50 (this scope), D-4 (itemizing — D-50's wording leans on it; not changed). Nothing else names these mechanisms.

⚠ **The sweep searched the registers, not the source, for "Florida"** — which is how L10697 (§0.4) was missed until the review. Searched
the source afterwards by node over every line under 150,000 characters: the other Florida mentions are the demo master prompt (L232, L249,
L367 — the example's own description) and a parser comment (L730).

**Findings outside the scope, filed so they are not lost:**
- The auto-replacement `<li>` in the Field Manual goes on, in its second sentence: *"The old fixed part-time-work taper now applies only to
  the demo data — entering your own income streams … replaces it entirely."* D-49 (v6.20) measured that the taper applies to **every plan
  with no income streams**, single plans included, and the review confirmed it (`spouseBWorkTaper` L2204–2207; Engine D's `work_y` reads
  20,000 / 18,000 / 15,000 on such a plan and 0 once any stream, even a rental, is added). The sentence is false for such a plan. Proposed:
  correct it in the same edit, saying "any income stream", and annotate D-49. **DC-7.**
- The review read (not run) that Start Fresh passes an empty master prompt, which the loader ignores (L4148), so a fresh plan may keep the
  demo prompt — Florida, the example's cars — as its Ask AI context. There is a `_promptIsDemoOnly` check at L4179 that may handle it.
  **Not verified here**; the build checks it and files it if real.

---

## 1 · What changes (if every decision goes as recommended)

1. **D-42 (DC-1 (a)).** `AUTO_REPLACE_COST` and the `autoReplace` option are deleted. The example's expense table gains four one-time rows,
   *"Replacement car"*, $40,000, dated March 2037, 2045, 2053 and 2061 (the example's retirement years 8, 16, 24, 32). Every engine charges
   a car only if the plan's table holds one — the Monte Carlo through `mcQuarterSeries` (so the planned path pays it too), Engine D,
   Backtest and What-Breaks through `tableYearExpense`, and Engines A–C through Engine D's draws. The double count and the guardrail mismatch
   both end.
2. **Saved plans (DC-2).** A plan saved before v6.21 has no car rows. As recommended, the four rows are **added** to it at load, labelled
   *"Replacement car (added by v6.21 — the model's old fixed schedule)"* and dated from that plan's own retirement year, with a notice on My
   Data and the Monte Carlo tab saying what was added and that deleting them is the user's call. Written to storage only on Save & Apply (the
   v6.17 pattern). A marker field identifies a plan that has been through this (the build names it; `homeMoveCash`'s presence was v6.17's).
3. **New plans (DC-3).** Start Fresh and the wizard add no car rows.
4. **D-43 (DC-4 (a)).** The six sites read a figure from the plan's table instead of subtracting $400: the table's monthly total the month
   after the last monthly row that is running at the `POST_MONTHLY_FULL` month and ends before the plan's horizon. The label names it
   (*"after Car Payment ends (Apr 2034)"*; *"after 3 payments end (…)"* when several do). No such row → the two cards and the sentence are
   not shown. On the example the figure is identical to today's.
5. **D-47 (DC-5 (a)).** *Planned* reads `base30.plannedPath[4·yi]`; the bands stay ±20% (the guardrails' own `lowerPct`/`upperPct`, read
   from `GUARDRAILS` rather than typed). The note says the planned path is the engine's own, with spending, tax and one-time rows.
6. **D-50 (DC-6 (a)).** *"The model gives mortgage interest no tax deduction — it takes the standard deduction and does not model itemizing
   — so there's no tax offset."* No state named. The Roth tab's *"Florida — no state income tax"* line names the plan's own state.
7. **Copy.** The Field Manual bullet, the Stress tab note, the Monte Carlo tab (where its other cash flows are named, v6.17's line) and
   METHODOLOGY say cars are expense rows; the Field Manual's Monte Carlo entry is dated v6.21.

## 2 · Census of what the build touches (v6.20 lines)

| Item | Sites |
|---|---|
| `AUTO_REPLACE_COST` | L1246 (declaration), L2981 (charge) |
| `autoReplace` | L2773 (option), L2980 (gate), L3049, L3055, L3060, L3069, L3075, L3082, L3088 (stress set), L6852–6861 (runs A–D), L6882 (mortgage what-if) |
| Example expense table | L67 area (`DEFAULT_EXPENSES`) — four rows added |
| D-43 subtractions | L8188, L8271, L8395, L8412 (Income tab), L8883, L8885 (SS tab); labels L8271, L8393, L8411, L8881 |
| D-47 | L12560 (and its bands L12561–12562), the note L12548 |
| D-50 | L11606; the Roth tab's Florida line L10697 |
| Copy | Field Manual @132,667 (the auto-replacement `<li>`, and its taper sentence, DC-7); the mortgage what-if L11545; the Stress note L12548; METHODOLOGY L2696, the D-47 limitation bullet L2655, and a new paragraph. The demo master prompt's car lines (L282, L350) describe the example, which keeps its cars — unchanged |
| Load path (DC-2) | `applyLoadedDataUnchecked` (L3965 onward, beside v6.17's `homeMoveCash` handling) and the My Data / Monte Carlo notices |
| Suites (acorn over `qa/`) | `autoReplace` in `t80` (2), `t81` (2), `t82` (11), `t83` (10); `AUTO_REPLACE_COST` in `t83` E (an AST extinction list of the seven named outflows); "Post-car" in `t6` L127 and `t81` (3); the example's car-payment row is `t83` D-2's setup (L247); the guardrail table title in `t82` L418. `t2`'s parity fingerprint runs `runExtendedMC` with the default (car on) |

## 3 · Tests the release ships with

New suite **`t84`**, both legs (the v6.20 leg pins today's behaviour as dated `[KNOWN DEFECT]` checks):
- **A · the car is data.** By AST: `AUTO_REPLACE_COST` and `autoReplace` exist nowhere; neither Monte Carlo engine nor Engine D holds a
  `40000` literal (the source has many elsewhere — the state tax tables, the IRMAA headroom colour — so a file-wide test would fail on day
  one); no `− 400` against a spending figure; no `Math.pow(1.04` in the Stress tab. Every subtraction from a Monte Carlo path is one of the named
  outflows (`t83` E's list, less the car).
- **B · the oracle.** An ORACLE MODULE built from the v6.20 source (the `t80` §A builder) with the car moved to the one-time position and into
  the planned path, every run honouring it, must match v6.21 with the four rows on the example — both engines, the stress set, the mortgage
  what-if — to 1e-6 (the order of subtraction inside a quarter changes, so not bit for bit; the build states which). And v6.21 on a table
  with **no** car rows must be bit-identical to v6.20 with `autoReplace: false` in every run.
- **C · the attribution.** v6.21 fed v6.20's expense table (no car rows) reproduces v6.20's Engines A–D, the bridge and the Taxes, IRMAA and
  Roth figures **bit for bit** — so every re-pinned Engine D figure is the car, by the `-spend617` pattern (a second run of the re-pinned
  suites on v6.20's table, where every v6.20 figure must come out exactly). Engine D's 2037 row against a hand computation.
- **D · saved plans (DC-2).** An old plan gains exactly the four labelled rows, dated from its own retirement year; the notice shows on both
  tabs; nothing is written until Save & Apply; after it the notice is gone; a plan with the marker gains nothing; Start Fresh and the wizard
  gain nothing; an imported old backup through My Data behaves the same (rendered). **A plan already retired:** its first added row can fall
  inside the 6-year window (so the 6-year headline moves where no car was ever charged), and a row dated before the as-of date is never
  charged — the test pins both, and the notice says which rows were added.
- **E · D-43.** The rule against an oracle over every fixture household and five edge tables (no ending row; two ending rows; a row ending
  after the horizon; a single plan; a plan whose payment ends before the Medicare month); the example's six figures identical across the pair;
  rendered on both tabs; `t6`'s pin re-pointed.
- **F · D-47.** The rendered *Planned* cell equals `plannedPath[4·yi]` for every shown row; the bands read `GUARDRAILS`; the example under
  BULL-LEANING shows no LOW row (the extinction of the old reading).
- **G · D-50, the copy, METHODOLOGY** (and `t31`'s keys if a limitation sentence moves).
- **Parity:** `t2`'s `INTENDED_DIFFS` gains `"v620→v621"` — `extMC` and `stress` (the car is in the fingerprinted runs), `mc` identical
  (no car falls in 6 years); the seven non-Monte-Carlo keys identical. Re-pins with attribution: `t40`, `t42`, `t43`, `t58`, `t71`, `t72`,
  `t75`, `t76`, `t81` and any other suite reading the example's Engine D past 2036 — found by running the suite, each re-pin attributed by C.
- **Census:** `tools/boundaries.mjs` gains a `car_rows` row (§K1: the example and the fixed schedule cannot be told apart in the Monte Carlo).
- **Controls** `qa/tools/controls_v621_car.py` (repo-only): the constant restored at one site; the rows out of the planned path; a row
  charged uninflated; the migration adding three rows, or dating them from the as-of year; the notice never shown; the D-43 rule falling back
  to `− 400`; the Stress table back on `1.04`; the bands typed; the Florida sentence restored; and the unmutated run.

## 4 · Out of scope

- **D-39** (the home-move cash outside Engines A–D), **D-44** (a one-time row before retirement never reaches the Withdrawal tab — the four
  car rows all fall after it), **D-49** (the spouse-B taper itself; only its false Field Manual sentence, DC-7), **D-51**, **D-4**.
- Any car **financing** model (a loan for the replacement car): a user can enter one as monthly rows.
- The lifetime-fees projection's 4% (L13097).
- Engine D's inflation base (it inflates from the retirement year, the v5.10 house rule) — the reason the same $40,000 row reads $49,657 in
  Engine D's 2037 and a different figure in each Monte Carlo path.

## 5 · Decisions for Steve

**DC-1 · How the car is modelled.**
- **(a) Recommended — the car becomes expense rows.** The example's table carries four $40,000 one-time rows; the constant and the
  `autoReplace` switch go; every engine charges exactly the plan's table. Ends the double count and the guardrail mismatch, and the
  Withdrawal, Taxes, IRMAA and Roth tabs finally see the example's cars — so **the example's figures move on those tabs** (Engine D's 2053
  ending portfolio −$260K) and the 30-year Monte Carlo moves a little (BASE above $800K 74.4% → 73.9%). Runs that skipped the car (runs A and
  B, three stress runs) now charge whatever rows fall in their window — on the example, the AI-bubble, stagflation and sequence runs (15
  years, to 2041) gain the 2037 car. And the car stops following the retirement-year buttons: today it is bought 8 years after whichever
  year is selected; as rows it stays on its dates (as the rest of the table has since v6.18) — disclosed.
- **(b)** A My Data field — car cost and years between cars, 0 = none — read by the 30-year Monte Carlo only, as now, with the planned path
  fixed to include it. Smaller release; the other tabs still never see a car (a new disclosed gap, D-39's shape), and a household that
  enters cars must remember to zero the field.
- **(c)** Keep the constant; disclose it on My Data and the Monte Carlo tab. Fixes nothing but the silence.

**DC-2 · Plans saved before v6.21** *(only under (a); it changes users' data, so it is yours)*.
- **(a) Recommended — add the old schedule as visible rows.** Four rows, labelled as added by v6.21, dated from the plan's own retirement
  year, with a notice; the user deletes them if they don't buy cars that way. Conservative: the Monte Carlo figures barely move (the 30-year
  ones dip slightly, the planned-path effect), and the other tabs now charge the cars, so they fall.
- **(b)** Add nothing; a notice says the fixed car is gone and how to add one. The plan's 30-year Monte Carlo figures **rise** (BASE above
  $800K: 74.4% → 79.3% on the example's holdings) — optimistic, and stated in the notice.

**DC-3 · New plans** (Start Fresh, the wizard). **(a) Recommended:** no car rows; the user enters their own (as v6.17 did for the home-move
cash). **(b)** Start them with the four rows too.

**DC-4 · D-43, the "after the car is paid off" figures.**
- **(a) Recommended — read it from the table:** the monthly total after the last payment row running at the Medicare month ends (rule in §1
  item 4), labelled with that row; hidden when there is none. Example identical.
- **(b)** Delete the two figures and the sentence on both tabs.

**DC-5 · D-47, the Stress tab's "Planned" column.** **(a) Recommended:** the engine's own planned path, bands ±20% from `GUARDRAILS`.
**(b)** Drop *Planned*, *Lower* and *Upper*; show the median with its percentile bands only.

**DC-6 · D-50, the Florida sentences.** **(a) Recommended:** the mortgage what-if states the model's rule (no itemizing, so no offset), no
state named; the Roth tab's *Tax rules applied* line names the plan's own state and how it is taxed (or is dropped if that cannot be said
in one line). **(b)** Keep state-specific clauses, generated from the plan's state, in both places.

**DC-7 · The taper sentence in the Field Manual.** **(a) Recommended:** correct it in this release to what D-49 measured (every plan with no
income streams — any stream, a rental included, turns it off — gets the spouse-B taper) and annotate D-49. **(b)** Leave it for D-49's own
release; file it in the register now.

## 6 · Review record

An independent agent that had not seen this scope being written re-checked §0, §2 and §3 against the v6.20 source and by running the
engines (2026-10-19). **Confirmed:** every measured figure (the car table to the cell at seed 11; Engine D's deltas to the dollar; the D-47
counts; the D-43 identity), the planned path's missing car, the four-of-seven stress runs, the `plannedPath[4·yi]` mapping, the six D-43
sites, the 6-year window holding no example car, the parity claim (`runRothStrategies` estates identical with and without car rows), and
the suite census. **Corrected here from its findings:** three copy sites the census missed (L11545, the demo prompt's car lines, METHODOLOGY
L2655) and one sibling of D-50 (L10697); test A's `40000` premise (false — the literal appears all over the state tables); the migration's
already-retired edge; the retirement-year buttons; the taper sentence's location; the column-3 explanation; one line number (L3037).

## 7 · Build record

**Built 2026-10-19 as v6.21** on the clone at `5b1e6ba` (v6.20, source `8db22499…`). Source `f7802df1f14f52b0c2ca59ca898b0e9a`, built page `bbd56368ab21aee1b95b55c4aec94af1`. Every
decision as §5 recommended; §1 as written, with the deviations below, each found by running something and each recorded where it lives.

**What was built.** §1 items 1–7: the constant, the option and its sixteen sites deleted; the example's four rows; the migration
(`carRowsV621`, `CAR_SCHEDULE_V620`, `_carRowsAdded`) and its two notices; the marker written by `DEFAULT_PORTFOLIO`, Start Fresh, the
wizard and My Data's save; `POST_PAYMENTS` / `postPaymentsWhat` / `postPaymentsEnd` and the six D-43 sites; the Stress table on
`plannedPath[4·yi]` and `GUARDRAILS`; the D-50 sentence and the Roth state line; the Field Manual's honest-limits bullet, its Monte Carlo
paragraph and the taper sentence; the version at four sites. METHODOLOGY *Cars are expense rows (v6.21)*; MissingFeatures D-42, D-43, D-47,
D-50 closed.

**Deviations from this scope, and why.**
- **The Roth state line (DC-6).** §1 item 6 said a plan with no state chosen reads *"State tax at the plan's flat rate (no state chosen in My
  Data)"*. Running it showed the premise behind that wording was incomplete: the example chooses no state either — its Florida comes from its
  master prompt's state line, through the plan timeline, which is where the Taxes tab and the engines read it. As scoped, the example's line
  would have stopped naming Florida although the model taxes it as Florida. Built instead: a chosen state reads `STATE_RULES`; otherwise the
  line names what the Taxes tab names (the timeline's state and flat rate). Within DC-6's intent (the line follows the plan); reported to
  Steve with the release. `t84` G-3, G-7, G-7b; control C14.
- **D-50's sibling is only narrowed (D-53, new).** §0's read-not-run note was run: Start Fresh, and the wizard with the state skipped, keep the
  example's master prompt, so a new plan that chooses no state is taxed as Florida and now reads Florida on the Roth tab too — as on the
  Taxes tab. Filed as **D-53** (open), not fixed here: the fix is in the loader, outside this scope.
- **D-43's rule gains one clause.** A table that spends nothing after the ending rows has no "after the payments end" figure (null, not
  $0) — the independent review's case of a guided-wizard plan whose living-expense row ends in 2079, before a long horizon. That end date
  is itself filed as **D-54** (open, optimistic, rare). The labels read "… ends" / "N payments end". `t84` E-5, E-6.
- **My Data re-dates rows (D-52, new).** `t84` G-11 found Save & Apply stores the added cars in June, not March: the editor keeps a row's
  years only (monthly rows January–December, one-time rows June). Pre-existing, outside this scope; filed and pinned as a dated
  `[KNOWN DEFECT]` in G-11.
- **The one-time list's category column** went from 90 px to 110 px (the monthly rows' width): `t48` G-1 found "Transportation" clipped on
  the example's new rows.
- **The hand pin was a truncation.** §0 and the first METHODOLOGY draft said Engine D spends **$49,656** more in 2037; 40,000 × 1.0274^8 =
  49,656.54, which is **$49,657** to the dollar (the review in §6 confirmed the figure without catching the rounding). `t84` C-3 now
  computes it by hand from the rate and the years and caught nothing else; §0 and METHODOLOGY are corrected.

**Tests.** `t84` — 63 on v6.21, 21 on v6.20 (that leg pins the old behaviour as dated `[KNOWN DEFECT]` checks). Re-pins
with attribution (`P42`, and a `<suite>-v621-table620` run of each on the example's table without its four rows, which must reproduce every
v6.20 figure — it does): `t40`, `t42`, `t43`, `t58`, `t71`, `t72`, `t81` (E-5 Backtest 1966 $1.43M → $1.21M; E-8 What Breaks 1.40× →
1.35×). `t11`, `t12`, `t19`, `t20` run on v6.20's table (their subject is not spending); `qa/tools/v617_spending.mjs` marks every portfolio
it loads, so the migration cannot add cars to v6.17's table. `t81` C2-1 reads the example's 2029 rows only. `t83` E-5/E-6 gated.
`domdiff` gains a v620 → v621 arm: Withdrawal rows from 2037 masked on both sides (rows before 2037 byte-identical), the summary figures
and the footer's count of expense lines (31 → 35) set aside exactly; Taxes and IRMAA rows before 2037 byte-identical and 2037's row
differs. `t29` gains the `car_rows` census row. `t2` `INTENDED_DIFFS` `"v620→v621": ["extMC", "stress"]`. `t33`'s v6.21 pin confirmed
unchanged by running. Full suite from the packaged copies: 8,214 app checks across 83 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 41, `sets` 12 + 12 — GRAND 8,353.

**Controls** (`qa/tools/controls_v621_car.py`, repo-only): 17 of 17 as expected. Their first run found two checks that could not see their
defect, both strengthened before the package: `t84` B-4 passed with the one-time rows taken out of the planned path, because Engine D's
extra 2037 draw raises that year's tax and moves the path from the same quarter by itself — it now requires the drop to be at least the
$40,000 row (C2); A-7 passed with the *Planned* cell back on `1.04`, because it checked only that `_pp` was declared — it now checks the
cell reads it (C10).

**Not built from §3, and why.** §F's rendered checks (the *Planned* cell equals `plannedPath[4·yi]` on screen; no LOW row rendered): the
Stress tab draws its own random paths, so its cells cannot be matched to a module run; the wiring is asserted by AST (`t84` A-4, A-7, each
with a control that fires) and the counts at module level (F-1). §D's backup-import path: `handleImportData` and `restoreBackup` call the
same `applyLoadedData` that §D drives at module level and G-8 drives through storage; no separate UI test. §E's oracle runs on the example,
a single plan, a later-horizon plan and six edge tables, not every fixture household.

**Independent review of the build** (an agent that had not seen it, 2026-10-19, before the package was cut). Confirmed: no leftover of the
constant, option or old copy anywhere in the source (acorn walk, the Field Manual string included); the migration on old, marked, retired,
single, table-less and empty-table plans, and that no constructor of a new plan migrates; Engine D and the 35-year Monte Carlo bit-identical
to v6.20 with its car off, with and without the rows; METHODOLOGY's figures ($49,657; the 2053 balance −$268,904; lifetime tax +$1,993);
D-43 on the example; the Stress mapping; the D-50 sentence; DC-7 against `spouseBWorkTaper`; the four version sites; every control target
unique. **Fixed from its findings:** the Roth line's Florida for new plans (filed D-53, D-50 narrowed); the My Data notice said the rows
"keep this plan's figures where they were" (they move every tab now — reworded, and it says saving dates them June); the $0 D-43 figure
(D-54); "2 payments ends"; `POST_PAYMENTS` not restored when a load is rejected; a stale engine comment; over-claiming check names (`t84`
F-2, G-4; `t6`'s "Post-car"); `t33`'s provisional note; METHODOLOGY's IRMAA sentence, its run list and its D-43 sentence; D-52 widened to
monthly rows; controls C15 (a row charged uninflated) and C16 (the My Data notice).
