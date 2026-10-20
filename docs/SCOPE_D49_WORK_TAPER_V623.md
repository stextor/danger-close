# SCOPE — v6.23 · D-49: the built-in part-time work for spouse B

**FULFILLED — built and shipped at v6.23 (2026-10-20); §7 is the build record.** **DECIDED 2026-10-20 — all four (a), as recommended.** Steve's answers: DC-1 *"Example only"*; DC-2 *"Notice until saved"*;
DC-3 *"Never"*; DC-4 *"Fix all now"*. Repo-only (`docs/`); it ships in the v6.23 package.

Steve, 2026-10-20, choosing the next build: *"yes"* (to *"Want me to scope D-49?"*).

This is a **MODELLING** release. Every plan with no income streams that is not the example loses an income it never entered, and its
figures move. Under the recommended shape the example's figures do not move: all 26 tabs render identically (§0.5). METHODOLOGY changes.

**Built against v6.22.**
- Clone: a fresh full clone of `origin/main` at `c870873`. The package check passes 54 of 54 against that clone and the live pool, and all
  85 committed files equal the v6.22 package byte for byte.
- Hashes: source `88d476c346ecb76bfe522487eb1b582e`, built page `5aaca5ba443a94faa4a8582ebd6d96b0`. The pooled source hashes the same, and
  every pooled file equals its committed counterpart (diffed this session).
- Line numbers: every one below is a v6.22 line, printed by `qa/tools/census.cjs` or read from the file this session.
- Runs: the v6.22 run folder the release was verified in (`v622.jsx` hashing `88d476c3…`), copied to scratch folders. §0.6's three prototypes
  are further copies; they are session-only and were never committed.
- Free names: the tag `v623` (`vercensus.cjs v623 qa` gives 0 judgement points), the suite name `t86`, and the register IDs D-57 and the next
  UsabilityFlaws ID.

---

## 0 · Premise (verified at v6.22, not assumed)

### 0.1 · The mechanism

`spouseBWorkTaper(yr, retireYr)` (L2269) returns $20,000 in the plan's retirement year, $18,000 in the next and $15,000 in the one after
(`k === 0 / 1 / 2`, L2272), and $0 otherwise. Its only condition is `getIncomeStreams().length > 0` (L2270): **any** plan with no income
stream gets it, and it does not test `single`. Its comments (L2224–2227; L675–676) say it is *"EXAMPLE-DATA ONLY"* and *"stays in effect
for the demo household"*. It is not limited to the example.

It is read at six sites:

| Line | Site | What the wages do there |
|---|---|---|
| L4927 | Engine A, `runRothStrategies` → `annualWork` | ordinary income — taxed |
| L5024 | Engine A, the year loop → `workEarners(…)` | payroll tax (B's paycheck; the whole amount on a single plan) |
| L5621 → L5652 | Engine C, `computeIrmaaPlan` → `work_y` | MAGI |
| L5863 → L5948 | Engine D, `computeWithdrawalPlan` → `work_y` → `guaranteed` (L5957) | **cash in**: the year's draw falls by the wages |
| L6463 → L6520, L6630 | Engine B, `computeTaxPlan` → `work_y`, `fica` | ordinary income and payroll tax |
| L10488 | the Roth tab's year table → `spouseBWork` | MAGI, provisional income, gross taxable |

**Readers by reach, not by name** (found by the scope's review, then confirmed):
- **The draw bridge.** Engines A, B and C import Engine D's spending draws through `withdrawalPlanSeries`. Because Engine D's draw is lower in
  the wage years, those engines also see less draw income there.
- **What-Breaks** takes Engine A's *current* strategy's `totTax` (L12251–12253), so it pays tax on the wages. It never credits any income
  stream as cash; its income is Social Security and the pension only (§0.4).
- **The Monte Carlo** pays Engine B's tax schedule from v6.20 (`mcIncomeTaxSchedule`), so it pays tax on wages it never receives. Neither
  Monte Carlo engine, Backtest or the Income tab reads the taper.

**Who gets it** (read from the source this session):
- **The example.** `DEFAULT_PORTFOLIO` (L528) has no `incomeStreams` key. Its demo prompt says spouse B works *"2–3 yrs at $15K–$20K"*
  (L286, L370), so for the example the wages are its own fact.
- **Start Fresh** (L4661) builds a plan with no `incomeStreams`, so the taper is on.
- **The guided setup** (`GuidedWizard`, L4454; its `build`, L4475) writes no `incomeStreams` and asks nothing about work, so the taper is on,
  single plans included.
- **A backup or stored plan** with no streams.
- **My Data** saves only rows with an amount above 0 (L13322), so a plan saved with no real stream keeps the taper.

**Correction to the register.** MissingFeatures D-49 says the wages are *"credited and taxed"* by Engines A, B, C and D. Measured (§0.5),
only Engine D credits them as cash. Engines A, B and C have no spending model, so for them the wages are taxed income plus MAGI, plus the
bridge effect above. Removing them **raises** every Engine A strategy's estate. The release corrects the register.

### 0.2 · What the user is told

- **The Field Manual** says it in four places (read in the raw `DOCS_HTML` string):
  - §13: *"The built-in part-time work for spouse B — $20,000, $18,000 and $15,000 of wages in the first three retirement years — applies to
    every plan with no income streams, single plans included; entering any income stream … turns it off."*
  - The Monte Carlo entry: *"…the Taxes tab also taxes built-in part-time wages for spouse B … which the simulation does not credit as
    income — conservative."*
  - The §14 streams FAQ: *"Entering any stream replaces the built-in example part-time schedule."*
  - The D-10 sentence: *"the ladder reads one spouse's earned income where the IRMAA engine reads the household's other income streams"*.
    This one is false at v6.22 (§0.3).
- **METHODOLOGY** says it in the streams paragraph (L1035–1038: *"Streams flow through every engine — … what-breaks …"* — false for
  What-Breaks, §0.4 — and *"replaces the built-in example part-time taper"*), in *Payroll tax on job income* (L2404–2413), at L2456
  (*"whose taper peaks at $20,000"*), in the v6.20 simplification bullet (L2753–2756), and in its D-10 residual (L1645–1647, L1720–1721),
  which is false (§0.3).
- **In the app:**
  - **My Data** says nothing about it. A Start Fresh plan's streams card reads *"No income streams yet — most households can skip this"*
    (L14197) while the model pays its spouse B $53,000. The note under the card (L14206) says *"Entering any stream here replaces the
    built-in example part-time-work schedule."*
  - **The Withdrawal tab** tells every plan, single ones included: *"Step 1: Take Social Security + pension + Spouse B work income —
    guaranteed floor."* (L10216).
  - **The Taxes tab's detail panel** labels the wages `${nameB} earned income` (L11345), so a single plan sees wages for a spouse B it does
    not have.

### 0.3 · Sibling — two descriptions of the earned-income term are wrong

- **The Taxes tab's label.** Engine B's `work_y` is the taper **plus every job row, any owner** (`workStream_y`, L6518–6520). The Taxes
  tab's detail panel calls that sum `${nameB} earned income` (L11345), so a spouse A job row is shown as spouse B's earnings. Display only.
- **The D-10 residual.** The Roth tab's `spouseBWork` (L10488) is the taper plus **every ordinary stream** — the same sum as Engine C's
  `work_y` (L5652). The one difference is the year the taper is keyed to. The ladder keys it to `rothLadderStart`, which is the plan's own
  retirement year (L858). Engine C keys it to the retirement year selected by the buttons. METHODOLOGY (L1645–1647, L1720–1721) and the
  Field Manual still say the ladder reads *"one spouse's earned income"*, narrower than Engine C. At v6.22 the two terms are identical at the
  plan's own retirement year.

### 0.4 · Siblings found while measuring — filed, not fixed

- **Backtest and What-Breaks never credit an income stream** (new **D-57**). Backtest's `guaranteed` is Social Security plus the pension
  (the block at L11957); What-Breaks reads `annualSSGuar` and `annualPenGuar` and no stream (its calls listed from the block at L12176). A
  plan's rental or job income therefore never lowers either tab's draws. That is conservative. What-Breaks also pays tax on that income
  through Engine A. METHODOLOGY L1035 says streams reach What-Breaks.
- **The Income tab holds a stream's amount for a whole phase** (filed under D-49's residual). Its phase table (L8221 on; `_stAt`, L8234,
  read at L8255, L8269, L8281, L8294, L8297 and twice at L8521) counts the streams active in each phase's first month for the **whole**
  phase, and its last phase runs to the plan's end. So a stream that ends inside a phase is counted after it ends. Measured on the
  prototype in §0.6 that gives the example a steady-state shortfall of $1,770/mo where the right figure is $3,020/mo.
- **The Income tab's stream list scrolls sideways on a phone** (a new UsabilityFlaws entry). Measured: `t45` on the prototype in §0.6, whose
  Income tab renders the stream list every v6.22 plan with streams renders, reads *"the page does not scroll sideways at 390 px
  (scrollWidth 510 vs 390)"*. `t45` never sees it at v6.22 because the example has no streams.
- **Two run folders running the suite at once corrupt each other's results.** `t2` writes its fingerprints to `/tmp/t2_<tag>_fingerprint.json`
  (and `t6` writes `/tmp/t6_demo_<tag>.json`), keyed by tag only. Running two prototypes in parallel this session made one parity result
  read the other's fingerprint (10/10 reported where 3/10 is true, re-run alone). This is for OPERATIONS §C4.

### 0.5 · Measured — what the wages move

v6.22, run C's shape (30 years, deaths at life expectancy, one LTC shock), 3,000 paths per arm with the same seeds, the $70,000 slider.
*Taper off* is made by adding one $0 stream, which turns the taper off and adds nothing (the suite's standing neutraliser). That is exactly
what the fix does to a plan that is not the example. "Withdrawal end" is Engine D's last `portfolioTotal`. "Best cell" is Engine A's
highest estate.

**A plan that is not the example** — the example's own figures used as if they were another plan's, then scaled and made single:

| Household | Preset | Taxes tab lifetime tax | Withdrawal end | Best cell (estate) | 30-yr > $500K · > $800K · median |
|---|---|---|---|---|---|
| The example's figures | BULL | $213,670 → $199,250 | $3,009K → $2,863K | fill12 $4,531K → $4,550K | 95.4% → 95.6% · 90.9% → 91.4% · $2,106K → $2,140K |
| | BASE | $216,230 → $201,421 | $1,717K → $1,583K | fill12 $4,526K → $4,547K | 85.7% → 86.4% · 75.0% → 75.9% · $1,408K → $1,437K |
| The same, single | BULL | $247,082 → $236,175 | $1,907K → $1,807K | fill12 $2,801K → none $2,817K | 97.0% → 97.1% · 90.9% → 91.2% · $1,610K → $1,628K |
| | BASE | $247,352 → $236,047 | $1,337K → $1,243K | fill12 → none | 92.0% → 92.2% · 78.3% → 79.0% · $1,239K → $1,257K |
| Holdings × 0.6 | BULL | $141,402 → $127,193 | $844K → $681K | fill12 $2,871K → $2,891K | 32.2% → 35.0% · 14.9% → 17.4% · $293K → $327K |
| | BASE | $140,585 → $127,909 | $201K → $81K | fill12 | 17.2% → 18.7% · 6.4% → 7.3% · $91K → $122K |
| Holdings × 0.6, single | BULL | $193,805 → $183,862 | $498K → $392K | fill12 | 22.6% → 24.7% · 7.7% → 8.4% · $276K → $295K |
| | BASE | $191,704 → $181,849 | $214K → $125K | fill12 | 11.5% → 12.7% · 3.3% → 3.7% · $172K → $187K |

The tax in the three wage years falls by about $7,000 on a married plan (BASE $50,330 → $43,294) and about $7,500 on a single plan (BASE
$79,373 → $71,821). That is the wages' income tax plus $1,530, $1,377 and $1,148 of payroll tax (Engine B's `fica`, read per year). IRMAA
does not move on any of the four.

**The direction is split by tab:**
- **The Withdrawal tab was optimistic.** It spent $53,000 the plan never earns, and that ends $94K–$163K higher. *(Corrected at the build: $89K–$164K — §7.)*
- **The Taxes, IRMAA and Roth tabs, What-Breaks and the Monte Carlo were conservative.** They taxed income that does not exist, and the Monte
  Carlo paid that tax without receiving the wages.
- **On a single plan the Roth tab's best cell changes** from *fill the 12% bracket* to *no conversions*. It is a near-tie either way: fill12
  leads by $264 with the wages, and *no conversions* leads by $658 without them, on about $2.8M. It is the model's best cell under its own
  assumptions, not a recommendation.

**The example under each shape of DC-1:**
- **(a) Limit the wages to the example** (prototype `pt623b`). All 26 tabs render **identically** to v6.22. Each tab was captured on both
  builds with one seeded random stream and the text diffed, and no tab differs.
- **(b) Move the example's wages into three visible income-stream rows and delete the taper** (prototypes `pt623`, exact amounts, and
  `pt623a2`, $1,667 / $1,500 / $1,250 a month with Engine D's stream terms rebuilt so no row is counted twice).
  - Engines B and C, the tax schedule and the Roth comparison are identical at exact amounts. $1,667 moves 2029 by $4: lifetime tax
    $216,229.52 → $216,230.64, as measured by the review.
  - The Monte Carlo now receives the wages. BULL 95.4% → 96.0% · 90.9% → 92.2% · $2,106K → $2,238K; BASE 85.7% → 87.6% · 75.0% → 77.5% ·
    $1,408K → $1,511K. The header's 6-year figure moves 99.8% → 99.9%.
  - The Income tab moves throughout. Phase 1's income goes $1,700 → $3,367/mo, its draw $6,470 → $4,803/mo, the gap cost $155,280 →
    $115,272, and the steady state $3,020 → $1,770/mo. The last two are wrong (§0.4); fixing them needs a new rule for the phase table.
  - My Data and Ask AI's context list the rows, and the Income tab gains a stream list and six timeline events.
  - The rows sit on calendar years, so the retirement-year buttons no longer move them. At a 2030 retirement, Engine D differs by up to
    $48,104 in a year, Engine B by $15,000 and Engine C by $10,730 (measured).
- **(c) Delete the taper and give the example nothing.** The example moves like the first two rows of the table above, and loses income its
  own description says it has.

### 0.6 · Measured blast radius on the existing suite

Each prototype was run through the full suite (`runsuite.sh v621 v622`) in its own copy of the run folder. Version strings were not moved.
`pt623a2` was also built into a page so the Python suites ran on it; the others' Python suites ran on v6.22's page. Parity was re-run alone
for the two prototypes that had run side by side (§0.4).

| Prototype | Result | What fails |
|---|---|---|
| **`pt623b` — DC-1 (a), the wages limited to the example** | **26 failed**, in 11 suite runs; parity 10/10; `domdiff` 32/32 | Only fixtures that are not the example by holdings and ran on the taper without saying so: `t16` case 2 (a single filer, 1); `t20` the annuity pin (1); `t40` C0/C1 (a fixture with its positions stripped, 3 × three runs); `t43` F-3/F-4 (the example made single, which loses the wages correctly, 2 × three runs); `t71` D-1–D-3 (its IRA households, 3 × three runs) |
| `pt623` — DC-1 (b), exact amounts | 80 failed | the 26 above in other forms, plus the example's Monte Carlo (parity `mc`, `extMC`, `stress`; `t42` D-4; `domdiff`), `t10`, `t22`, `t33` and parity `rothAca`/`rothOther` fixtures, `t29`'s stream rows, and `t40`/`t75` tests that read Engine D's `work_y` as job income |
| `pt623a2` — DC-1 (b), $1,667 and Engine D rebuilt | 107 failed (100 in the run, plus 7 parity keys on re-running alone) | as above, plus every dollar-exact example pin that the $4 reaches (`t19`, `t25`, `t40` A3/A5, `t58`, `t72`, `t83`'s hand pins), and `t45`'s Income tab at 390 px (§0.4) |

Under (a), the fix for the failing fixtures is the one v6.22 used for `t20`: each married fixture states the wages it ran on, as rows with
exact amounts, so every pinned figure stays. Measured: rows at 20000/12, 1500 and 1250 a month equal the taper in Engines B and C, the tax
schedule and Engine D's totals; only Engine D's `work_y` field differs (field by field). Each single fixture (`t16` case 2, `t43` §F) is
re-pinned instead, with the attribution in §3 §C. Writing rows into a single plan would re-encode the very wages being removed, and a
single plan drops B-owned rows anyway (`streamsMonthlyAt`, L697).

### 0.7 · Register sweep by mechanism (OPERATIONS §K2)

Searched `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `FlawsToFix-*.md`, `UsabilityFlaws.md`, METHODOLOGY, OPERATIONS and TESTING for
`taper`, `spouseBWorkTaper`, `spouseBWork`, `part-time` and the neutralising `monthly: 0` stream:
- **MissingFeatures D-49** — this item. Under (a) it narrows to the example. Its *"credited"* wording is corrected (§0.1).
- **MissingFeatures D-10**'s residual (2), the narrower earned-income term, is false at v6.22 (§0.3) and is corrected in the same edit.
- **`FlawsToFix-v5_10_2-Phase2A.md`** L73–75 records the taper as a harness trap (the `monthly: 0` neutraliser). Under (a) it stays true for
  the example and stops applying to other households.
- **The project instruction** *"engine tests must neutralize global income streams"* and OPERATIONS §C's matching trap still hold under
  (a). Under (b) they would change meaning, because a fixture cloned from the example would inherit three rows.
- No other item names the mechanism.

### 0.8 · Limits and consequences, stated

- **A plan that is not the example and enters no stream loses $53,000 of income it never chose.** Its Withdrawal-tab figures fall, and its
  tax figures and Monte Carlo rise. DC-2 decides how the user is told.
- **"The example" means the example's holdings, married, with no streams** (`holdsExampleHoldings`, L1330, from v6.22, which compares
  positions only). A plan that kept the example's holdings to the dollar and edited anything else is read as the example and keeps the
  wages. That is the same rule v6.22 uses for the example's text.
- **Under (a) the example still carries a built-in income.** The Monte Carlo, the Income tab, Backtest and What-Breaks do not credit it, and
  the Monte Carlo pays its tax: $14,479 on the example, measured at v6.20 and recorded in METHODOLOGY. This is D-49's residual, now about
  the example alone and disclosed as such. The way to close it is (b) with a new phase rule for the Income tab and a fix for its phone
  layout, as its own release.

---

## 1 · What changes (if every decision goes as recommended)

1. **The wages reach the example only** (DC-1 (a)). The taper pays only a plan that holds the example's holdings, is married and has no
   streams. That is worked out once per load and on Save & Apply into one flag, not with a `JSON.stringify` of the positions on every
   engine year; the six reads stay as they are.
2. **A single plan gets none** (DC-3 (a)), the example made single included, as v5.76 already does for spouse B's Social Security.
3. **Any other plan with no streams and no marker sees a My Data notice** (DC-2 (a)). It says:
   - that through v6.22 every plan without income streams was paid $20,000, $18,000 and $15,000 of spouse-B wages in its retirement year and
     the next two, single plans included;
   - that this plan now has none;
   - how to enter work: a job row, with the existing *"+ … works after retirement"* buttons (L14200–14201).

   A single plan's notice says *"…wages for a spouse B this plan does not have"*. The notice also shows on the Monte Carlo tab, as the v6.17
   and v6.21 notices do. A new field, `workRowsV623: true`, ends it. `DEFAULT_PORTFOLIO` carries it, and Start Fresh, the guided setup and
   `buildPortfolio` write it — the four sites that carry `carRowsV621` (L555, L4504, L4679, L13292). `buildPortfolio` also feeds My Data's
   draft and Export, so an Export taken from My Data carries the marker; the user has seen the notice by then.
4. **The wording** (DC-4 (a)):
   - The Taxes tab's line reads *"Earned income (job rows)"*. Under (a) the example's line keeps the wages, so for the example it reads
     *"Earned income (job rows and the example's built-in work)"*.
   - The Withdrawal tab's Step 1 reads *"Social Security + pension + other income"*.
   - My Data's note at L14206 says the built-in work applies only to the example.
   - The Field Manual's four sentences and METHODOLOGY's passages are rewritten. That includes the two false ones: What-Breaks in the streams
     paragraph, and the D-10 residual.
5. **The comments** at L675–676, L2224–2227, L5862, L5953–5955 and L10485 are corrected.
6. **The four version sites.**
7. **The registers:**
   - MissingFeatures: D-49 narrowed to the example, with its wording corrected; D-10 residual (2) corrected; D-57 opened (Backtest and
     What-Breaks credit no stream).
   - UsabilityFlaws: one new entry (the Income tab's stream list at 390 px).
   - OPERATIONS §C4: the shared `/tmp` files.

---

## 2 · Census of what the build touches (v6.22 lines)

| Area | Sites |
|---|---|
| The taper | L2269–2273 (one condition added); the flag set in `applyLoadedDataUnchecked` (L4030) and on Save & Apply |
| Marker | L555, L4504, L4679, L13292 (the `carRowsV621` sites) |
| Notice | My Data's streams card (L14197 region) and the Monte Carlo tab, beside the v6.21 car notice |
| Wording | L10216 (Withdrawal Step 1), L11345 (Taxes tab label), L14206 (My Data note), the raw `DOCS_HTML` at four sentences (quote-free anchors, OPERATIONS §C0) |
| Comments | L675–676, L2224–2227, L5862, L5953–5955, L10485 |
| Version | the four in-app sites |

The six reads (§0.1) and every engine are unchanged.

---

## 3 · Tests the release ships with

**New suite `t86_builtin_work.mjs`** (both legs; the v6.22 leg pins each defect as a dated `[KNOWN DEFECT]`):
- **§A the rule, by AST and by execution.** The taper's condition reads the example flag and the plan's single status; the flag is set only
  where §2 says.
- **§B the example is unmoved.** v6.23 equals v6.22 on the example — Engines A to D, the bridge, the tax schedule, the Roth tab's ladder and
  both Monte Carlo engines, bit for bit, at three sliders and both presets.
- **§C every other plan equals v6.22 with the taper off.** v6.23 equals v6.22 run with a $0 stream on: the example's figures as another
  plan, single and married, holdings × 0.6, a Start Fresh plan and a guided-setup plan — every engine, bit for bit. This is the attribution
  for every re-pinned figure.
- **§D single.** No engine credits or taxes a spouse-B wage on any single plan with no streams, the example made single included.
- **§E rendered.** The notice: on a stored Start Fresh plan, ended by Save & Apply (which writes the marker); the single wording; none on the
  example, on Start Fresh or the guided setup, or on a plan with a stream. The wording sites of §1 item 4. The Field Manual and METHODOLOGY
  sentences.
- **§F the extinction.** No plan whose holdings are not the example's, or that is single, receives built-in wages, swept over the fixture
  households.

**Existing suites** (the 26 failures of §0.6), each change attributed in the CHANGELOG:
- **Married fixtures** — `t20`'s annuity household, `t40` C0/C1, `t71`'s IRA households: each states the wages it ran on, as rows with exact
  amounts. Every pinned figure stays.
- **Single fixtures** — `t16` case 2, `t43` §F: re-pinned with §C's attribution. `t43` F-3/F-4 are *controls* that must stay unchanged, so
  they are re-pinned and their comment says why they move once.
- **`t29`** gains an `example_work` census row (OPERATIONS §K1's maintenance rule). It is ON on the example and clear on a fixture whose
  holdings differ, because the defect was invisible on the example.

**Controls** `qa/tools/controls_v623_work.py`:
- the condition without the holdings test, or without the single test;
- the flag never set, or set from the wrong plan after a load;
- the notice never shown, or shown on the example;
- the marker not written by one of its four writers;
- each old wording restored;
- the unmutated run.

---

## 4 · Out of scope

- **Moving the example's wages into visible rows** (DC-1 (b)). It needs a new rule for the Income tab's phases, a fix for the stream list's
  phone layout, and a decision about rows and the retirement-year buttons (§0.5). That is D-49's residual, for its own release.
- **D-57** (Backtest and What-Breaks credit no stream) and **the Income tab's phone layout**. Filed here, each for its own release.
- **A work question in the guided setup** — a new input; My Data has the buttons.
- **MissingFeatures D-54, D-55 and D-56.**
- **Splitting the Taxes tab's earned income by person.** DC-4 relabels the line; it does not itemize it.

---

## 5 · Decisions for Steve

**DC-1 · What becomes of the built-in wages.**
- **(a) Keep them for the example only. *Recommended.*** This fixes every real plan, and the example renders identically on all 26 tabs. The
  suite needs 26 fixture edits, each with an exact attribution. What stays is the example's own inconsistency (the Monte Carlo pays tax on
  wages it never receives there), disclosed and filed.
- **(b) Move the example's wages into three visible rows and delete the taper.** This is cleaner for the example, because the example then
  describes itself and the Monte Carlo receives the wages. But the example's Monte Carlo and Income-tab figures move, the Income tab needs a
  new phase rule first, its phone layout breaks, and about 107 checks move.
- **(c) Delete the taper and give the example nothing.** The example loses income its own description says it has.

**DC-2 · How a plan that is not the example, with no streams, is told.**
- **(a) A notice on My Data and the Monte Carlo tab, ended by Save & Apply (a marker). *Recommended.*** Its figures change on its next load,
  and the notice says why and how to enter work.
- **(b) Give it the old wages as visible rows** (like v6.21's car rows). Engines A to D keep their figures, but the Monte Carlo rises, and
  every Start Fresh and guided-setup plan keeps $53,000 of income its owner never entered. That is the optimistic reading.
- **(c) Change it silently.**

**DC-3 · A single plan.**
- **(a) None, the example made single included. *Recommended*** — a single plan has no spouse B, the v5.76 rule.
- **(b) Keep it for a single plan with the example's holdings.**

**DC-4 · The wording:** the Taxes tab's label, the Withdrawal tab's Step 1, My Data's note, the Field Manual's four sentences and METHODOLOGY's
passages (two of which are false today).
- **(a) Fix all of them in this release. *Recommended.***
- **(b) Fix only the sentences about the taper.**

---

## 6 · Review record

**Independent review, before Steve saw the decisions** — an agent that had not seen the work, 2026-10-20. It confirmed the six reads by AST,
24 line citations, the 80-failure arithmetic, and §0.5's figures (re-run at 1,000 paths: tax $216,230 → $201,421, Withdrawal end $1,717K →
$1,583K, fill12 $4,526K → $4,547K, single fill12 → none). Its 18 findings, and what the scope did with each:

| # | Finding | Taken |
|---|---|---|
| 1 | Under rows the example's Income tab moves throughout, not just the steady state — the Income tab never read the taper | §0.5 states every move; it is one of the reasons DC-1's recommendation changed to (a) |
| 2 | The blast radius had been measured at exact amounts, not the recommended $1,667 | re-measured (`pt623a2`, 107 failures); §0.6 |
| 3 | `t40` C0 and `t22` were misclassified; adding rows to fixtures that inherit the example's rows would double them; `t43` F would re-encode the defect | §0.6 rewritten; under (a) single fixtures are re-pinned, not given rows |
| 4 | The D-10 residual is false today; a fourth Field Manual sentence and METHODOLOGY L2456 were missed | §0.2, §0.3, DC-4 |
| 5 | The Withdrawal tab's Step 1 mentions spouse B's work to every plan | §0.2, DC-4 |
| 6 | What-Breaks taxes the wages through Engine A and credits no stream; the draw bridge reaches Engines A–C | §0.1, §0.4 (D-57) |
| 7 | Rows were dated 2029–2031 whatever the plan's retirement year; the retirement-year cards move | §0.5; out of scope with (b) |
| 8 | Engine D's redefinition was underspecified (tax-free job rows) | moot under (a); recorded for (b)'s own release |
| 9 | §3's §B could not pass as written (Engine D's `work_y`); §A's literal check undefined | §3 rewritten for (a) |
| 10 | The Income-tab phase rule was not well defined (seven reads, `_gapMoNet`) | out of scope with (b); the seven reads are recorded in §0.4 |
| 11 | The marker has four sites, not three; `buildPortfolio` feeds the draft and Export | §1 item 3, §2 |
| 12 | Save & Apply re-owns B rows to A on a single plan | moot under (a) (no rows are written) |
| 13 | The Python suites were unmeasured | `pt623a2` built into a page; `t45` fails on the Income tab (§0.4) |
| 14 | The single best-cell change is a near-tie | §0.5 gives both margins |
| 15 | "first three years after", a doubled comment citation, a figure with no preset | corrected |
| 16 | Silent choices: COLA, the hard-coded name, the notice wording, the Monte Carlo tab | the notice's wording and tabs in §1 item 3; the rest moot under (a) |
| 17 | The sweep skipped OPERATIONS, TESTING and the project instruction on neutralising streams | §0.7 |
| 18 | Spouse B dying before 2031 | moot under (a) (the taper never stopped at a death; unchanged) |

## 7 · Build record

Built 2026-10-20 on v6.22 (`88d476c3…`) as v6.23. Every decision as §5 recorded it. The suite's counts and the provenance hashes are the
CHANGELOG's v6.23 entry; this section records what the build found and where it departed from the scope.

**What was built, against §1.**
1. `builtinWorkApplies()` (no streams, not single, the example's holdings) gates `spouseBWorkTaper` as its first statement; the six reads are
   unchanged (AST: six call sites, one gate — `t86` A-9, A-10).
2. Single plans are paid none (`t86` §D, both legs).
3. The loader sets `_builtinWorkDropped` ("joint" / "single" / null) for a plan with no `workRowsV623`, no streams, that the rule does not pay;
   the notice shows on My Data and the Monte Carlo tab; `workRowsV623: true` is written by DEFAULT_PORTFOLIO, the guided setup, Start Fresh
   and `buildPortfolio` (`t86` A-11, A-12, A-13, A-14, §E).
4. The wording of §1 item 4, plus the sites the build's review found (below).
5. The comments of §1 item 5; the four version sites.
6. The registers of §1 item 7: MissingFeatures D-49 narrowed (its "credited" wording corrected), D-10 residual (2) corrected, D-57 opened;
   UsabilityFlaws **F-20**; OPERATIONS §C4. `FlawsToFix-v5_10_2-Phase2A.md`'s neutraliser note annotated (§0.7).

**Departures, each stated.**
- **The rule is read live, not cached.** §1 item 1 said "worked out once per load and on Save & Apply into one flag". `setPortfolio` and every
  load replace `PORTFOLIO`, so a cached flag could go stale between a swap and its next read; `builtinWorkApplies()` is called on each read
  instead. Measured: 20 runs of Engines B, C, D and the tax schedule took 53 ms on v6.22 and 49 ms on v6.23 (the review measured ~30 ms per
  20,000 calls) — negligible. The loader's `_builtinWorkDropped` is a flag for the notice only, recomputed on every load.
- **The single notice's wording.** §1 item 3 drafted *"…wages for a spouse B this plan does not have"*; built: *"This plan has no spouse B, and
  it is paid none now."*
- **Step 1's wording.** §1 item 4 said *"Social Security + pension + other income"*; built, after the review: *"other income (income
  streams)"*, and on the example *"(income streams and the example's built-in work)"* — the floor includes the example's built-in work.
- **The My Data notice also ends when a stream is added to the draft** (before Save & Apply), because it says the plan has no work income.
  Found by the review.
- **Fixture rows live in one helper**, `qa/tools/example_work_rows.mjs`, used by `t20`, `t40` and `t71`. `t40` C0's residual now reads Engine
  D's `workAll_y` (the taper plus job rows), because the rows land there rather than in `work_y` — the one field §0.6 said would differ.
- **Siblings the scope did not list** (found by the build's run or review): `t83` I-8 and `t84` H-2 pinned the old Field Manual sentences
  (gated on v6.23); `domdiff` needed a v622 → v623 arm (Step 1, the Work-column note and the Taxes label masked, every figure identical);
  `t29`'s payroll census row computed the taper structurally and now reads the app's own function (exported to `__g` on both legs, so the
  v6.22 leg's row also reads that leg's own rule from v6.23); the Monte Carlo notice, the Work-column note, the Field Manual's streams FAQ,
  My Data's streams note and the Field Manual's D-10 closing sentence (below).

**Corrections to this scope.**
- **§0.5: the Withdrawal tab's end balance falls $89K–$164K, not $94K–$163K.** The table in §0.5 itself shows $214K → $125K ($89K) for
  holdings × 0.6, single, BASE; the summary sentence was wrong. Re-measured at the build's review (unrounded: 146, 133, 100, 94, 164, 120,
  107, 89 $K).
- **§0.5's "all 26 tabs render identically" was a prototype with v6.22's wording.** The shipped example's figures are identical; its wording
  changes on four surfaces (METHODOLOGY says so).

**Independent build review** — an agent that had not seen the work, 2026-10-20. No blocker. Twelve findings, all taken:

| # | Finding | Done |
|---|---|---|
| 1 | The Monte Carlo notice said the tab's figures lost work income; the Monte Carlo never credited it — it paid its tax, so its figures rise | reworded: the tax on wages it never paid in is gone (`t86` E-8, control C23) |
| 2 | METHODOLOGY stated the prototype's "26 tabs identical" as v6.23's | corrected (figures identical; wording on four surfaces) |
| 3 | $94K–$163K should be $89K–$164K | METHODOLOGY corrected; this scope's correction above |
| 4 | The D-10 correction left "the last two terms" in the Field Manual and a stale heading in METHODOLOGY | Field Manual: "Leaving the last term out was a measured decision at v5.53"; heading and sentence corrected |
| 5 | Unlisted wording: the streams FAQ and My Data's note said streams reach every engine; the Work-column note; Step 1 left out the example's own work | all four corrected (`t86` E-3, E-7c, G-7; controls C24–C26) |
| 6 | `t86` never rendered the ladder (the sixth read) or the guided setup; a moved marker kept the count at 4; G-6 depended on a line wrap | E-14 renders the Roth ladder on both legs; A-12 names each writer once; G-6 whitespace-tolerant; C12/C13 now also fire A-12 |
| 7 | The My Data notice stayed after a job row was added to the draft | gated on the draft's streams (`t86` E-6b, control C22) |
| 8 | `boundaries.mjs`'s fallback comment was wrong, and the v6.22 leg's payroll row changed silently | comment corrected; disclosed in the CHANGELOG |
| 9 | This scope was not yet in the workspace's `docs/` | shipped in the package |
| 10 | OPERATIONS §C4's rule was broader than its evidence | narrowed to full suites and `t2` / `t6` |
| 11 | "told so in My Data" omitted the Monte Carlo tab; a `t43` label's history | both corrected |
| 12 | `t86` D-1 read the example's retirement year for every household | reads each household's own |

The review confirmed by parser the six reads and the one gate, no other copy of the wage figures, the four version sites, that the Field
Manual changed in only the intended sentences, the fixture rows' equivalence, the 2026 MFJ brackets behind `t16`'s re-pin, and every save,
load and Export path carrying or recomputing the marker.
