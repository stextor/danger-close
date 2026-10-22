# SCOPE — F-25: what the app says about its own model (target v6.29)

| Field | Value |
|---|---|
| Build scoped against | **v6.28** · `src/DangerClose.jsx` md5 `6ff3561e3dd23d50b5fce16ad8c76704` · built `index.html` `b51ca85f4caf683326c77c2e70143a4c` · repo `64dc251` (full clone) |
| Freshness (§A) | Pool source = manifest Current = clone = `6ff3561e…`; the 16 pool files were byte-checked against the package and the clone on 2026-10-22 (post-upload verification of v6.28) |
| Register item | UsabilityFlaws **F-25** (filed at v6.28) |
| Status | **FULFILLED — shipped as v6.29** (§7). Decided 2026-10-22, all eleven as recommended (§5); reviewed once (§6); build reviewed once (§7). |
| Ledger | `docs/F25_LEDGER_V628.tsv` (repo-only): 326 rows — the 181 surviving census entries and all 145 new v6.28 prose pieces — each with its v6.28 text, the reader's verdict, the verifier's check and impact, the finding, the code read, the proposed fix, and the review's corrections |

Steve, 2026-10-22: *"Let's continue with F-25"*. On the scope: *"All as recommended"* — DF-1 (a), DF-2 (a), DF-3 (a), DF-4 (a), DF-5 (b), DF-6 (a), DF-7 (a), DF-8 (a),
DF-9 (a), DF-10 (a), DF-11 (a).

---

## 0 · Premise — verified against v6.28

### 0.1 What F-25 registered, re-resolved

F-25 filed the v6.27 census's editorial (E) and model (V) entries that v6.28 did not rewrite, the gap-draw figure, and eight points the
v6.28 build review left. The census (`docs/F25_CENSUS_V627.tsv`, 283 entries) was written against v6.27, so every entry was re-resolved
against v6.28 **by parser**: the same AST extractor that built it (`texts.cjs`: string literals, template parts, JSX text, and the Field
Manual converted to text by jsdom), run on both sources. It reproduces the v6.27 extraction byte for byte, so the comparison is like for like.

| At v6.28 | Entries |
|---|---|
| Text unchanged | 173 |
| Reworded by v6.28 (≥ 0.6 similarity to a v6.28 piece) | 26 |
| Gone — rewritten or removed by v6.28 | 84 |

**F-25's working set is the 181 surviving entries carrying E or V** (138 V-tagged, 43 E only). v6.28's own new prose had never been
checked the same way, so its **145 new prose pieces** (six words or more, absent from v6.27) were added. The eight build-review points are
all still in the source (*"Medicare-eligible at retirement"* L7819; *"Roth conversions have no withholding"* L2487; *"CONFIRM THE MONEY
WORKS"* L7833; *"unless the claim ages reverse the order"* L8963; *"from the target retirement year"* L2353, L7871; *DRAG:* L9557; the
Withdrawal tab's spouse-A-only RMD line; the Backtest's *"ended above $500K … charges LTC shocks"* L12049).

### 0.2 Method

- **Seven readers**, each given a batch and the same brief: judge what the text says against what the code does, quote the code, and
  never call a claim about law or the world true or false (verdict WORLD instead). Verdicts: TRUE, FALSE, PARTLY, WORLD, EDITORIAL,
  NOT-A-CLAIM, CANNOT-TELL.
- **Two verifiers** then tried to refute every FALSE and PARTLY call by re-reading the code without trusting the readers' quotes or line
  numbers, and graded each one's impact: FIGURE (a displayed number is wrong), MISLEADS (a reader would believe something false about the
  model), NIT (imprecise, harmless).
- I re-read the code behind every FALSE call myself (the default preset, the headline's $800K test, the Backtest sentence, the regime draw,
  `inferOtherTaxType`, the ladder's MAGI against Engine C's, the expense-horizon alarm, the Verify tab's checks).
- **An independent review** (§6) re-checked §0, re-measured §0.4, and sampled 26 TRUE rows: 20 held, 6 did not (corrected in the ledger).

| Working set (181) | TRUE | FALSE | PARTLY | WORLD | EDITORIAL | CANNOT-TELL |
|---|---|---|---|---|---|---|
| Readers | 62 | 15 | 60 | 28 | 15 | 1 |
| After the review | 56 | 15 | 66 | 28 | 15 | 1 |

New v6.28 prose (145 pieces): 90 TRUE, 21 PARTLY, 21 NOT-A-CLAIM, 12 WORLD, 1 EDITORIAL; **no FALSE and no directive**.

**Verification of the 93 FALSE/PARTLY calls: 85 confirmed, 8 corrected, 0 refuted.** The corrections narrowed or widened a reader's
reasoning; none overturned a call. Impact: **4 FIGURE, 45 MISLEADS, 44 NIT**; the review adds 6 rows (3 MISLEADS, 3 NIT).

**The premise holds and F-25 is wider than registered** in one direction: several wrong statements are not editorial at all, but
descriptions of the model that the model contradicts — and four are displayed figures.

### 0.3 What is wrong, by theme (FIGURE and MISLEADS; every row is in the ledger)

**A. The scenario presets.** The default prior has been **BULL-LEANING** since v5.80 (`DEFAULT_SCENARIO_PRESET = "bull"`, L992), and the
preset built to match history's average is **HISTORICAL** (L983–984). The Field Manual still tells users the low default comes from BASE
and to *"switch to BULL-LEANING for history-like assumptions"* — the preset they are already on, which the code places about 5 points below
history (L986–991): FAQ rows 1793, 1794; the Modeling Approach (1527); §13 (1747). The Dashboard says *"Remember: the BASE prior is
deliberately conservative"* (L11536). The Backtest's comparison note names *"your conservative BASE scenario"* (1071).

**B. What "success" means.** The Field Manual's opening defines a 90% success rate as *"your savings lasted"* (1479). The headline is the
6-year Monte Carlo's share of paths **ending above $800,000** (`v > 800000`, L6993); running out is the separate ruin rate. The Backtest
calls the 30-year run's test (*"ended above $500K"*, with LTC shocks) *"the MC headline"* (1071, L12047–12051). The header and two other
sentences call the headline *"the planned path"* (214, 1181), the name of the Guardrails tab's flat-4.5% reference path.

**C. What leaves the browser, and what Ask AI receives.** *"Nothing leaves this browser"* (guided setup, 161); the landing and My Data
privacy text's list of what is sent (188, 1275 — it omits names, birth dates and plan-to ages, state, home value and mortgage, home-move
cash, income streams and the last 12 messages, which the generated plan summary and the request carry); *"Full context on your plan"* (1614
— the AI gets a one-paragraph summary); the request's re-sent history (1211); offline mode and the Google Fonts request (1214); *"DATA ·
LOCAL"* (1468). No figure, but these are the app's privacy promise.

**D. Where an input reaches.** Several sentences name the tabs an input moves and get the list wrong:
- *"Every tab re-runs against the model you choose"* (215): the Backtest never does; Roth, Taxes and IRMAA follow the scenario's draws but
  grow balances at a flat 4.5%.
- income streams *"in every simulation"* (366, 1604): Backtest and What Breaks ignore them (D-57).
- the home-move cash (1310): it reaches every Monte Carlo-built figure, Trajectory, Guardrails, Grade, Ranking and the header too, and not
  Backtest or What Breaks.
- the SS trust-fund cut *"every simulation"* (1555, 1769): only the Monte Carlo runs, the Roth engine and the claiming grid.
- the Roth slider *"drives four tabs"* (1520): through the tax each Monte Carlo path pays it moves six more.
- the Guardrails tab's planned path is *"base-case returns"* (593): it is a flat 4.5% (`BASE_GROWTH`) for every mix and preset.
- the Taxes tab *"computes it from these draws"* (v6.28 pieces 95, 103): it takes the schedule's draws and gains but its own RMDs and
  conversions.
- Engine B's figures are *"in today's dollars"* (375): only to its documented approximation (§0.4).

**E. Fixed verdicts printed for every plan.** Text written once and shown whatever the plan computes:
- the Stress tab's *"Median portfolio recovers to pre-crash levels by Year 4–5"* (1159, **FIGURE**). On the example it never does: under
  BULL and BASE the median does not regain its pre-crash level within the run; under HISTORICAL it takes about ten years (two probes, two
  seeds, three presets).
- the Backtest's *"Why the survival rate is so high … almost no historical sequence breaks the plan"* (1076), rendered unconditionally.
- What Breaks' *"demands far worse than the worst of history"* and *"expect these edges to be far away"* (1099, 1106), printed for any
  break-point, including a plan that fails at its baseline. Its history figures are also wrong against the app's own data (J).
- the Roth tab's *"likely pushes into 24%+ and triggers IRMAA"* (731), and *"STAY UNDER IRMAA"* with no caveat that its own tax-paying sale
  can push MAGI over the cliff (777 — §0.4).
- the break-even card's causal story behind *"never behind"* (785).

**F. The Verify tab's promise** (252, 1622): *"Every statutory constant the math depends on is asserted against its primary source … a
tampered file fails loudly."* The Verify tab runs **72** checks (counted by calling `buildVerificationChecks`). None is an AMT check: the six
AMT figures in `TAX_CONSTS` (`SGL_AMT_EXEMPT` 90,100, `MFJ_AMT_EXEMPT` 140,200, the two phase-out starts, `AMT_PHASE_RATE` 0.50,
`AMT_28_BREAK` 244,500, L1092–1094) are asserted nowhere, and the AMT rates 0.26/0.28 and the NIIT rate 0.038 are inline literals in the
engines (L6663, L6675 and their twins) — **ARCHITECTUREIssues E-23**, open. Two IRMAA thresholds per filing status are checked, 8 of 29 RMD
divisors, 4 state facts. The expected values sit in the same function, so a deliberate edit to both passes. The longevity check runs on a
fixed seed (`rs = 12345`), so it re-runs rather than re-samples.

**G. Field Manual descriptions of the model that the code contradicts.**
- the regime draw *"captures"* streaks of good and bad years (1524): each year's regime is drawn independently (L2786–2790, L2984–2989); no
  year reads the last.
- *"variance comes mostly from regime-switching"*, the noise *"small"* (1523): on the example's mix regime switching is about a third of
  yearly variance (readers' computation; re-measured at the build).
- §13 simplification (5): an unrecognised account name *"defaults to Traditional"* (1746). It defaults to **Taxable**
  (`inferOtherTaxType`, L3964) — the optimistic direction, the opposite of what the sentence discloses.
- the Roth ladder's MAGI is missing *"one term"*, realized gains (1749). It is missing two: the gains and the Traditional dollars the
  withdrawal plan spends each year (`ordDraw_y`, in Engine C's MAGI since v5.74, L5759; absent from the ladder's, L10455).
- the FAQ's *"an example value was substituted"* (1790): since v6.22 a missing income figure is paid $0, and the banner says so.
- the expense-horizon alarm fires *"if any"* for-life row stops early (1549): only when the latest-ending recurring row does (L2520–2533).
- *"Inflation assumptions — one"* (1529): its LTC escalator applies to sustained care only, and the regime is drawn yearly, not quarterly.
  Its bracket-growth sentence is §0.4's question.
- the LTC entries (1538, 1613): paid care is *"usually zero"* (it is zero 45% of the time, L2004); the LTC Marathon has *"a similar total"*
  to the single shocks (six care-years at $120K against a $450K mean for the two shocks; readers' figures, re-measured at the build) — a
  code comment at L1977–1981 says the same.
- the IRMAA entry's *"these years err high"* (1586): premium years priced off working-year MAGI are not projected at all.
- the Taxes entry (1581): its stacked bar omits draws, other ordinary income and dividends, and its four numbered steps describe the Roth tab.
- the Survivor entry (1610): the premature-death case's Single years are taxed nowhere.
- the Dashboard crash card (1542): it compares a 15-year, no-mortality run with a 30-year run with mortality.
- the Ranking entry (1562): the SCF savings figures cover only families holding retirement accounts — and the tab labels them *"All
  Americans"* (L9931–9932).
- the Events entry (1624, v6.28 piece 140): *"a live alarm for every dated obligation"*, each pointing at *"the authoritative source"*.
  Spouse B has no RMD event (L2363 is A's only, key `"rmd"`), and the Roth, RMD and both HSA events cite no source.

**H. Figures.**
- **The Income tab's gap-draw figure** (v6.28 piece 50, and the Grade tab's pointer to it, piece 70): it subtracts spouse B's Social
  Security for every month of A's gap (L8353–8354), even when B claims later. Engine D and the Monte Carlo pay B from B's claim month.
  Registered in F-25 and D-57. Invisible on the example (B claims in January 2029, the retirement month).
- **The mortgage what-if** (1011): its *"~4.5% return"* matches the Bull preset only, and its *"lower success"* sentence is keyed to the
  median, so it can print a negative number before *"pts lower"* (L11651–11653).
- **Field Manual Example 2's "$10,900"** (v6.28 piece 135): it grows the penalty money inside a Roth where Example 1 grows it in a taxable
  account after capital-gains tax; on Example 1's method it is about $10,400. Both are defensible; the text must say which.
- the Stress recovery sentence (E above).

**I. Exit plan and Events details** (v6.28 pieces 18–20, 22, 41; the build-review points): the COBRA and *"retirement to Medicare"* years
use the household retirement year for spouse B too (`tl.targetRetireYearB` is ignored); the Social Security gap is counted in calendar
years; estimated-tax events are dated only in conversion years; *"Medicare-eligible at retirement"* for a birthday later in the year;
*"Roth conversions have no withholding"*; the conversion window from the target year where the schedule uses the selected one; *"CONFIRM
THE MONEY WORKS"* (a verdict the model does not give); the Grade tab's *DRAG* label on sentences the grade does not read; the Withdrawal
tab's RMD line naming spouse A only.

**J. Editorial (16) and world (40) claims.** The 16 editorial ones are superlatives and judgements: *"the single most useful document"*,
*"the main lever"*, *"usually outweighs"*, *"always correct"*, *"ahead of most peers"*, *"the hardest-to-price risk"*, *"a defensible
stand-in"*, *"the crowd you actually belong to"*, *"more honest"*, *"manageable"*, *"one of the most under-modeled risks"*, *"the most
tax-advantaged account there is"*, *"genuinely low-risk"*, *"drives most of the app's reassuring results"*, and two more. The 40 world
claims (28 census entries, 12 new pieces) are statements of law (deadlines, caps, the 70½ rule, Medicare enrollment), market history, the
literature (Bengen, Pfau, Kitces), other tools' outputs (*"another tool might show 95%"*), the Trustees' dates and care-cost statistics.
**Some market-history claims can be checked against the app's own data and fail** (review item 8, from `HISTORICAL_RETURNS`, 1928–2025):
What Breaks' *"the worst rolling decade (2000–09) was about −3.4%/yr real"* — the app's worst is 1999–2008 at −3.78%; *"the weakest 20-year
windows … still earned ~+2%/yr"* — from 1929 it is +0.63%; and *"150+ years of data"* — the app holds 98.

### 0.4 Found beyond the copy — model questions, measured or read, filed not fixed

1. **Engine B mixes dollar units, and the app describes the result with one word, "conservative", that is true of one reading and false
   of another.** Engine B (`computeTaxPlan`) indexes brackets, the standard deduction and the LTCG and AMT figures 2%/yr from the as-of year
   (L6457), takes RMDs off a balance growing at a nominal 4.5%, and holds Social Security (L6511–6512), the pension and income streams flat
   in today's dollars — it even deflates the spending draws it takes from Engine D to today's dollars (`withdrawalPlanSeries`, L6396–6404).
   The app calls this *"slow bracket growth overstates taxes, the conservative direction"* (Taxes tab, L11144; the Roth tab's rules box,
   L10752; the Field Manual, 1529; METHODOLOGY L1312–1314, L1476–1479, and the v6.20 section *"The dollar basis — the conservative reading
   (DC-3 (a))"*). The narrow mechanism is true — 2% indexing against ~2.5–2.7% inflation raises tax. But the whole result depends on how the
   figure is read. **Measured by the review and reproduced** (a copy of the v6.28 testable module with only Engine B's `annualSSA` /
   `annualSSB` grown at the plan's own inflation, 2.535% under the default BULL-LEANING prior applied with `applyScenarioProbs`; the draw
   bridge as the Taxes tab calls it; draws left nominal in the benchmark; the example, retiring 2029):

   | Slider | Taxes tab total, as shipped | Units-consistent, nominal | Read as each year's dollars | Read as today's dollars | Monte Carlo charges (shipped × inflation) |
   |---|---|---|---|---|---|
   | $0 | $212,552 | $283,375 | **$70,823 low** | $34,510 high | **$62,400 more** than the nominal benchmark |
   | $70,000 | $213,670 | $254,334 | **$40,664 low** | $24,562 high | **$38,358 more** |

   - **The Taxes, IRMAA and Roth tabs' rows** are shown year by year with brackets *"indexed 2%/yr from 2026"*, which reads as each year's
     own dollars — and in that reading they run **low**.
   - **The Monte Carlo and What Breaks** treat the schedule as today's dollars and grow it with inflation again (`mcTaxCharge`, L169;
     `estAnnualTax * cumInf`, L12164, L12228), so the part from nominal RMDs is grown twice and they charge **more** than a
     units-consistent tax. Run with the same seeds, a units-consistent schedule **raises** 30-year success (above $500K) from 94.83% to
     95.67% at a $0 slider and 95.15% to 95.73% at $70,000; the 6-year headline moves 99.70% → 99.78% and not at all. **The success
     rates are very slightly pessimistic, as METHODOLOGY's DC-3 (a) says.**
   - Two inflation clocks also differ: Engine D inflates from the retirement year, Engine B and the Monte Carlo from the as-of year.

   **This release can only describe it honestly (DF-7).** Making the units consistent is a modelling change to Engines A, B and C **and**
   to the Monte Carlo's and What Breaks' re-inflation, together — fixing one without the other doubles the Social-Security tax in the Monte
   Carlo. Its own scope.
2. **QCD eligibility after a death.** Engine C counts both spouses toward the QCD cap for the whole horizon of a married household, the
   deceased included (`_qcdPersonsI`, L5725: `_singleI` is false in widowed years). Engine B, in widowed years, tests
   `Math.max(ageA, ageB) >= 71`, so the deceased's age can qualify a younger survivor (L6602 — the C-3 shape). Only for a plan with a QCD
   set. Read by two readers, the review and me; not measured.
3. **STAY UNDER IRMAA can cross the cliff it targets.** It fills to the cliff before the year's tax-paying sale, whose realized gain is then
   added to MAGI (777). The ACA strategy allows for its own sale. Read and confirmed by two readers; not measured.
4. **The example's built-in spouse-B work** is taxed by the Monte Carlo's schedule but not counted as income by it or by the Income tab
   (v6.28 piece 123) — D-49's residual, already registered.
5. **Backtest and What Breaks ignore income streams and the home-move cash** — D-57 (streams), widened.

### 0.5 Boundary census (OPERATIONS §K1)

The gap-draw figure (H) is invisible on the example: its spouse B claims in the retirement month. With the fix, `boundaries.mjs` gains
`ss_claim_after_gap` — **ON** when B's claim falls at or before the start of A's gap, as on the example (the behaviour cannot be seen there);
**cleared** by the census fixture `claim` in `qa/tools/fixture/households.mjs` (spouse B delays to 70). The DOM fixture `couple` in
`t90`/`t91` (B claims 2034-06, after A's gap ends 2032-06) is the rendered witness. The spouse-B RMD event (G) is visible on every couple.
The Stress recovery sentence is wrong on the example itself.

---

## 1 · What changes (if the decisions are taken as recommended)

**Every MISLEADS and NIT row is reworded** to what the code does, at the site the ledger names, using the verifier's fix unless §5 says
otherwise. Most are a sentence. Where the honest sentence depends on the plan, the text is computed or gated instead of typed:

- **Stress recovery (1159):** computed from the run's own median. The run (`runExtendedMC(retireYear, 15, …)`) starts at the as-of date
  and forces the crash at `retireOffset` = retire year − as-of year, so the window after the crash is 15 − `retireOffset` years (12 on the
  example). "Pre-crash level" is the median at index `retireOffset`. The sentence reads *"…recovers to its pre-crash level N years after the
  crash"* or *"…is still X% below it after N years"*; with no crash in the run (`retireOffset ≥ 15`) it is not shown.
- **Backtest survival block (1076):** shown only when the survival rate is high (the bucket the tab already computes), naming what the rate
  leaves out (streams, one-time rows, tax). The comparison note (1071) compares with the **30-year** run (above $500K, with LTC shocks) and
  says the header's rate is the 6-year one above $800K; it names the active preset.
- **What Breaks (1099, 1106):** the history comparison computed from `HISTORICAL_RETURNS` (DF-4), shown only when the break-point is below
  history's worst; the withdrawal rate named for what it is (the last plan year's, before tax).
- **Roth tab (731, 777, 785):** the *"24%+ and IRMAA"* line keyed to the plan's own ladder; STAY UNDER IRMAA says its sale's gain can lift
  MAGI; the break-even card states the computed test.
- **Presets (A):** every in-app sentence that names the default reads `DEFAULT_SCENARIO_PRESET`; history-seekers are pointed at HISTORICAL.
  The Field Manual is a static string, so its mentions stay typed and are pinned (DF-9).
- **Privacy text (C):** lists what the request actually sends; a parity test holds the list to the request (§3).
- **Field Manual (G):** each wrong description rewritten; §13's simplification (5) states the Taxable default and its optimistic direction.
- **The dollar-units sentences (DF-7):** the Taxes tab (L11144), the Roth tab's rules box (L10752), the Field Manual (1529) and METHODOLOGY
  (L1312–1314, L1476–1479, the DC-3 (a) section) state the mixed units and both directions, with the measurement.

**Figures (DF-2):**
- **Gap draw:** spouse B's benefit is subtracted from B's claim month on, as Engine D pays it. The Income tab's figure moves for any couple
  whose B claims after A's gap starts; the example's does not.
- **Mortgage what-if:** the return quoted from the active preset's own expected return; the sentence keyed to the success change, with the
  sign handled.
- **Example 2:** recomputed with its method stated (where the penalty money would otherwise have grown).

**Verify tab (DF-5):** six AMT checks against Rev. Proc. 2025-32 §4.10 (the values Phase 2 read at that source); the promise reworded to
name what is checked and what is not (the inline AMT and NIIT rates, E-23), and *"re-runs"* for the seeded longevity check. 72 → 78 checks.

**Events (DF-6):** a spouse-B RMD event under its own key (`"rmdB"` — `"rmd"` is read by `t91` L455 and keyed by `alertStripEvents`), built
like A's from B's own start age, couples only; the Field Manual's count (16 → 17 on the example) and source claims corrected.

**Exit plan and labels (DF-10, DF-11).**

**Editorial and world claims (DF-3, DF-4).**

**No engine changes.** Engines A–D and both Monte Carlo engines are untouched; parity 10/10 with no intended difference. The figures are
display computations.

## 2 · Site census

- **App source:** the ledger's FALSE/PARTLY rows, 16 EDITORIAL and the WORLD rows DF-4 changes, each at its v6.28 line (the Field Manual's at
  L4842 with an anchor). 41 of the 93 verified FALSE/PARTLY rows are in the Field Manual.
- **METHODOLOGY:** L1312–1314, L1476–1479, the DC-3 (a) section (L2715–2720), and the Monte Carlo section's regime sentence.
- **Suites that pin the copy this release changes** — a parser census of every string and regex literal in `qa/` (9,578 strings of 12
  characters or more, 1,891 regexes; comments excluded; regexes **executed** against each affected text, §B1a). Candidates to read at the
  build, each re-gated per leg (§B2) or left as it is:
  - `t83` L554 and `t81` L410 — the Backtest comparison sentence (1071);
  - `t4` L54 (*"nothing leaves this browser"*), L306 (`sig("exit plan", ["CONFIRM THE MONEY WORKS", …])`), L311 (*"IRS Rev. Proc"*, the Verify
    text), L491 (*"Other accounts are taxed by type, with five simplifications"*); L189 and `t1` L280–387 (the estate disclosure — WORLD,
    probably unchanged);
  - `t76` L170, L221 (*"never fall behind"*, the break-even card);
  - `t31` L386 (*"charges every surcharge in full"*, a disclosure-parity key — 1586);
  - `t91` L339–340 (B-4: *STATUS* only at GPA 4.0, *DRAG* otherwise), L345 (splits on *"DRAG:"*), L440–442 (the COBRA sentence), L445
    (C-13d: no *survivor / both of you / each spouse* on a single plan's Events, Withdrawal and Exit Plan — the new RMD wording must be gated
    to couples), L455 (`find(e => e.key === "rmd")`), L475, L478;
  - `t90` L246 (`/both spouses|each spouse/`);
  - `t78` L193, L247, L258 (the Events entry's wording) and **F-1b, L251: `EQ(…, n, POST ? 16 : 18)`** — a numeric pin a string census
    cannot see; DF-6 makes the example's count 17;
  - `t86` L256 (the streams note); `t73` L164; `t66` L390–443 (the Ask AI cost passage — WORLD);
  - `t46` and `t74` read *"BULL-LEANING"* as a preset label, not this copy — unaffected.
  The Verify count is pinned in `t1` and `t4` (their Verify-count arms).
  ⚠ **What this census cannot see:** numeric pins (one found by reading, F-1b), checks made on rendered text, and checks made on another
  plan (the v6.28 lesson). A pattern matching more than three affected texts was first filtered out as generic; two live locks (C-13d, `t90`
  L246) were among them, so the build reads the unfiltered list for every changed text. The build runs the suite on the prototype before the
  counted run, and a rendered census of the changed tabs on the example and the `couple` and `single` fixtures.

## 3 · Tests

New suite **`t92`**, both legs; the v6.28 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-22, F-25]`.
- **§A, extinction by AST:** every replaced sentence gone from every string in the source (the AI-addressed texts and §13's release entries
  excepted); no typed preset name in an **in-app** sentence that names the default (it reads `DEFAULT_SCENARIO_PRESET`); the Field Manual's
  typed mentions pinned to `DEFAULT_SCENARIO_PRESET === "bull"`, so changing the default fails until they are rewritten (DF-9); the Verify
  checks cover every key of `TAX_CONSTS` whose name carries `AMT`.
- **§B, the computed sentences, rendered:** the Stress recovery against the run's own median series — on the example, a fixture whose median
  recovers, and a plan retiring 10 years out (a short post-crash window) — under two presets; the Backtest block absent below the threshold
  and present above it; What Breaks' history sentence absent for a plan failing at its baseline and its figures equal to those computed from
  `HISTORICAL_RETURNS`.
- **§C, the figures:** the gap draw against an independent month loop on the `couple` fixture (B claims after A's gap) and on the example
  (unchanged); the mortgage what-if's return equal to the active preset's, and a plan where the loan improves success reads no *"lower"* and
  no negative number before *"pts"*; Example 2's figure by hand on its stated method.
- **§D, Events and Exit plan:** the spouse-B RMD event under key `"rmdB"` on a couple, from B's start age, absent on a single plan, A's
  `"rmd"` unchanged; the count the Field Manual states equal to the events computed; B's COBRA and Medicare years from B's own retirement
  year on a couple whose B retires later; the Social Security gap in months.
- **§E, privacy parity:** every part the Ask AI request carries (taken from the request the existing Ask AI suites build, `t66`/`t89`, not a
  hand list) is named in the landing, My Data and Field Manual lists, and every item those lists name is sent.
- **§F, the Field Manual and METHODOLOGY:** each corrected description present, read from the raw string (never a decoded copy), the
  dollar-units sentences included.
- **Census:** `boundaries.mjs` gains `ss_claim_after_gap` (§0.5); `t29` its row (ON for the example) and a control (cleared by `claim`).
- **Controls:** one per class — a sentence restored, a computed sentence hard-coded again, the gap draw back on the whole gap, an AMT check
  removed, B's RMD event dropped or keyed `"rmd"`, the privacy list missing one part, the mortgage sign bug back, a units sentence restored —
  plus the unmutated run.

## 4 · Out of scope — filed

- **The units model fix** (§0.4 item 1): one dollar frame in Engines A, B and C, and the Monte Carlo's and What Breaks' re-inflation, in one
  scope, stating which inflation clock it uses. Moves the Taxes tab's total up and the success rates slightly up. A new MissingFeatures item.
- **QCD eligibility after a death** in Engines B and C (§0.4 item 2), and **STAY UNDER IRMAA's own sale** (item 3): model defects, filed
  for their own release.
- **E-23** (the inline AMT and NIIT rates): unchanged unless DF-5 (c).
- **D-57** (Backtest and What Breaks ignore streams; widened to the home-move cash), **D-49's** residual: unchanged.
- **The Dashboard crash card's unlike comparison** (1542): reworded here; aligning the runs is a model change.
- **CANNOT-TELL 1487** (where the claude.ai host keeps artifact storage): reworded to say what the code does and that the host decides.
- **The 56 entries and 90 new v6.28 pieces this pass leaves TRUE**, and the 21 NOT-A-CLAIM pieces: no change.

## 5 · Decisions for Steve

**DF-1 · How much this release fixes.**
(a) **Recommended:** every confirmed FALSE and PARTLY row — 4 figures, 48 misleading, 47 imprecise — in one release, v6.29. The imprecise
ones sit in the same sentences and paragraphs as the others, and leaving a known-imprecise sentence costs a second pass over the same copy.
If the build runs short, the app's tabs ship first and the Field Manual and METHODOLOGY follow (the honest partial state).
(b) The 52 FIGURE and MISLEADS rows only; the rest filed.
(c) Two releases from the start: the app's tabs, then the Field Manual and METHODOLOGY.

**DF-2 · The four figures** (gap draw, mortgage what-if, Example 2, Stress recovery).
(a) **Recommended:** fix all four here — each is a display computation, no engine moves, and three show on the example.
(b) Reword so each says what it computes, and file the computations.

**DF-3 · The 16 editorial claims.**
(a) **Recommended:** remove the superlatives and judgements, keep the facts in the same sentence (*"the single biggest lever"* → *"the slider
moves …"*).
(b) Keep them, attributed (*"in this model's view"*).

**DF-4 · The 40 world claims** (law, market history, the literature, other tools, care statistics).
(a) **Recommended:** **market history** is checked against the app's own `HISTORICAL_RETURNS` and computed from it or removed (three are
already wrong — §0.3 J); **statements of law or a published figure** (deadlines, caps, the Trustees' dates, care-cost ranges — about 25)
are checked against their primary source at the build and corrected or removed; **comparisons with other tools' outputs** are removed
unless a source is cited; **literature attributions** keep their citation.
(b) Only the market-history check against the app's data; leave the rest (the app's rule is about what the model computes).
(c) Leave all 40.

**DF-5 · The Verify tab.**
(a) Add the six AMT checks, and move the AMT and NIIT rates into `TAX_CONSTS` with checks — closes E-23; an engine refactor with no figure
change, proven by parity.
(b) **Recommended:** add the six AMT checks and reword the promise to name what is checked and what is not (the inline rates, E-23 left open).
No engine is touched.
(c) Reword only.

**DF-6 · Spouse B's RMD deadline.**
(a) **Recommended:** add the event (the model already computes B's RMDs; it is a dated obligation the Events tab says it lists). The
example's event count goes 16 → 17.
(b) Reword the Field Manual to *"spouse A's RMD"*.

**DF-7 · The dollar-units finding** (§0.4 item 1). In plain terms: the Taxes tab's lifetime total runs **low** if you read its rows as
future dollars ($40,664 low at the first-open $70,000 slider, $70,823 at $0); the success rates are very slightly **pessimistic** (0.6–0.8
points on the 30-year run). Nothing makes the headline optimistic.
(a) **Recommended:** say so where the app now says only "conservative" — the Taxes tab, the Roth tab's rules box, the Field Manual and
METHODOLOGY each state that income is held in today's dollars against indexed brackets, which way that runs for the Taxes tab's rows and for
the Monte Carlo, with the measurement — and file the units fix as its own scope.
(b) Leave the wording as it is and move the whole question to the units scope.

**DF-8 · The two model defects in §0.4 items 2–3 and the Dashboard comparison.**
(a) **Recommended:** file them; reword any sentence that claims the opposite.
(b) Fix them here.

**DF-9 · The Field Manual's typed preset names.** The Field Manual is one static string and cannot read `DEFAULT_SCENARIO_PRESET`.
(a) **Recommended:** keep its mentions typed and pin them to the constant in `t92`, so changing the default fails until the manual is
rewritten.
(b) Template the Field Manual so it reads the constant.

**DF-10 · Exit plan computations.** Spouse B's COBRA and Medicare years from B's own retirement year (`tl.targetRetireYearB`), the Social
Security gap in months, estimated-tax dates in every retirement year with taxable withdrawals, the Medicare sentence by birthday, the
withholding sentence corrected, and the conversion window from the selected year.
(a) **Recommended:** fix them here — display computations, as DF-2.
(b) Reword so each says what it computes; file the computations.

**DF-11 · Two labels filed at v6.28.** *"CONFIRM THE MONEY WORKS"* (the Exit Plan's first phase) and the Grade tab's *DRAG:* on sentences
the grade does not read.
(a) **Recommended:** rename the phase to what it holds (e.g. *"Check the numbers this plan rests on"*), and label sentences the grade does
not read *NOTE:* rather than *DRAG:*.
(b) Leave both.

---

## 6 · Review

The scope was reviewed by an agent that had not seen its writing (`f25/REVIEW.md`, session-only): **1 blocker, 12 should-fix, 8 notes,
all taken.**
- **Blocker:** the first draft's §0.4 item 1 said holding Social Security flat *understates* tax and that the Monte Carlo *inherits the
  understatement*, and DF-7 (a) would have written that into METHODOLOGY. The direction depends on the units the figure is read in, and the
  Monte Carlo's error runs the other way (it re-inflates the schedule — METHODOLOGY's DC-3 (a), which the draft never engaged). §0.4 and
  DF-7 are rewritten on the review's measurement, which I reproduced.
- **Should-fix, taken:** the draft's measurement did not reproduce (below); the census row named a fixture `t29` cannot read and had ON
  backwards; the preset test could not pass on the Field Manual (DF-9); the Exit plan changes and the two v6.28 labels had no decision
  (DF-10, DF-11) and their pins were missing; the census missed a numeric pin (`t78` F-1b) and filtered out two live locks; DF-5 still left
  *"every"* false and did not cite E-23; three market-history claims fail against the app's own data (DF-4 (a)); six TRUE rows were not
  TRUE (the ledger's *review* column); the Stress sentence used the wrong window; no privacy parity test; no mortgage sign test; DF-7 was
  not in plain terms.
- **Notes, taken:** the ledger now holds all 145 new pieces; the two inflation clocks are in §0.4; the Backtest compares with the 30-year
  run; Example 2's method; the readers' variance share and LTC figures are re-measured at the build; DF-1 names the partial-state order.

⚠ **Owned.**
1. **The first draft's §0.4 item 1 had the direction wrong for the Monte Carlo and stated it as fact for every reader**, without engaging
   the METHODOLOGY section that had already decided the question. Found by the review.
2. **Its measurement was wrong twice over.** The first probe patched `annualSSA` in Engine D as well as Engine B, because the same line
   appears in both and I patched by text, not by function; the second ran with the module's scenario weights still at BASE (2.74%
   inflation), not the default BULL-LEANING (2.535%). The figures in §0.4 are the review's, reproduced from its probe, which patches only
   Engine B and applies the preset.

---

## 7 · Build record (v6.29)

**Built** on v6.28 (`6ff3561e…`). Source `2b1c24f1…`; built `index.html` `ce3605af…`; `smoke_built` 22/22. Engines A–D, both Monte
Carlo engines, `stateTaxAnnual`'s arithmetic, `SCENARIOS`, `TAX_CONSTS` and `GUARDRAILS` are **token-identical** to v6.28 with comments
removed (the build review's acorn comparison); MC parity 10/10.

**How the edits were made.** Four agents that had not written the scope drafted the copy edits from the ledger against the source
(`{id, old, new, note}`, each `old` unique), three more checked the world claims at primary sources (IRS, CMS, SSA, HHS/ASPE, the 2026
Trustees Report, statute text, and the published research named where no primary source exists). I read every drafted edit against the
code before applying it (104 edits, then 34 world-claim edits, all unique-anchor applied and parse-checked), and wrote the computed pieces
and the figures myself.

**Departures from §1, each deliberate:**
- **731** (the Roth tab's *"likely pushes into 24%+ and triggers IRMAA"*) is reworded conditionally and points at the comparator's NO
  CONVERSIONS row instead of being *"keyed to the plan's own ladder"*: the card renders before the comparator's result exists.
- **The Stress recovery's definition** changed at the build review (§7 below): the pre-crash level is the last snapshot dated before the
  crash year and the trough is searched in the forced years and the one after, not the scope's *"median at index `retireOffset`"*, which on
  the example is a snapshot taken inside the crash year.
- **DF-10's estimated-tax dates** run in every retirement year, not only years *"with taxable withdrawals"*: every retirement year in the
  model carries income tax, and the instructions say a payment is owed only if withholding does not cover it.
- **The Events tab's Roth item** keeps the target year (it says so); the Exit Plan's line uses the selected year, as the engines do, and
  says where the Events item differs.

**Found at the build, outside the ledger, fixed in the same cards:** the Stress tab's two scenario descriptions and its 7% inflation; What
Breaks' *"1929–32 ≈−80%"*; the Survivor tab's *"draw rises"* (percentages, not the draw); the CT, NJ, NY, RI and VA notes' and METHODOLOGY's
*"no dividend or interest income"* (`t35` D-2/D-3, D-10/D-11, D-18/D-19 had locked a false disclosure; every call passes the taxable
yield); the Dashboard's crash card; the header tooltip's tool comparison; the Ranking tab's *"all Americans"* average; Income Floor's line
(*NOTE:*, the grade does not read it). **Filed, not fixed:** UsabilityFlaws **F-26**.

**The build review** (an agent that had not seen the build; `f25/BUILD_REVIEW.md`, session-only) found **2 blockers, 12 should-fix, 15
notes**. Taken: the single-plan gap description named a spouse B (blocker 1); the suite had not run on the final source (blocker 2 — the
counted run is from the final hash and the packaged copies); What Breaks' three other verdicts on a plan failing at its own return; the
Income tab's phase table subtracting B's check for the whole first phase; the Verify promise's *"capital-gains figures"* and its
incomplete *"Not checked"* list; the §13 entry's *"every sentence"*; the remaining *"tools built on historical averages"*, the FAQ title and
*"Riskalyze-style"*; METHODOLOGY's two dividend passages; the Stress recovery definition; the tooltip's *"~9% nominal"*; the LTC *"never
need … at all"* (ASPE measures a need serious enough to require LTSS); the Ranking *"~25%"* and *"average 55–64"* labels; `t92`'s single,
split-branch and phase-table cases, `\bstate\b`, a semantic recovery check and pins of the inflation and noise figures to the code; the
Exit Plan's window when the selected year passes the last conversion year; and notes 17, 19, 20, 21, 22, 23, 24, 25, 26 and 29. Left: note
18 (the Historical branch keeps the "may look low" banner title), 27 (the Taxes tab's typed example figures — filed with D-60) and 28 (the
Guardrail Readiness line's annual rows — F-26).

⚠ **Owned at the build.**
1. **The census missed sentences.** The F-25 census flagged pieces by tag; sentences in the same cards that it had not flagged (the Stress
   scenario cards, the state notes' dividend claim, which a suite locked) were found only because the build was editing beside them. A
   census by tag is a sampling, not a read; F-26 holds what remains.
2. **My first `stressRecovery` was wrong in two ways** (its "peak" was taken inside the crash year on the example, and its trough was the
   whole run's minimum), and `t92` B-4 re-implemented the same definition, so it could not see either. Found by the build review; B-4e now
   asserts the dates.
3. **My first gap fix printed "before Spouse B's Social Security starts" on single plans**; `t92` had tested couples only. Found by the
   build review.

4. **The first counted run from the packaged copies had one red, in tooling:** `domdiff_withdrawal` had no arm for v6.28 → v6.29, and this
   build changes four Withdrawal-tab phrases (the header chip, the RMD clause, the Tax line, Step 6). The census of what the release
   changed had been made against the suites' assertions, not against the tooling's byte-identity claim. The arm was added (each mask bound
   to one hit on its own side and none on the other) and the whole suite re-run from a fresh packaged run folder: 9,187 app checks, 0
   failed; GRAND 9,321.
