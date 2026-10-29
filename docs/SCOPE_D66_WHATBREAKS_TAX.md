# SCOPE — D-66: What Breaks and the Monte Carlo charge different tax and IRMAA

**FULFILLED — shipped as v6.36 (2026-10-28).** Built as scoped, with the copy and tests the build review added; the build record is §7.

**DECIDED 2026-10-28 — all five as recommended** (Steve: *"Let's use your recommendations on the decisions"*): DB-1 (a), DB-2 (a),
DB-3 (a), DB-4 (a), DB-5 (a). Builds as **v6.36** (tag `v636`): on 2026-10-28 none of the three 2027 sources had published, so DB-5 (a)
gives this release the number and the 2027 refresh becomes v6.37. Reviewed once (§6); every finding was checked against engine output and
taken. Repo-only (`docs/`); it ships in the v6.36 package.

Steve, 2026-10-28: *"D-66"*, picked from the candidates offered while the 2027 tax figures are unpublished.

**What I found:**
- **The fix does not need the cause, but most of the cause is located.** What Breaks reads the Roth tab's strategy engine (Engine A). The
  Monte Carlo reads the Taxes tab's tax (Engine B) and the IRMAA tab's surcharges (Engine C). Engine A differs from them in at least three
  ways:
  1. it taxes the household's spending draw from Traditional but never takes it out of the balance (disclosed since v5.84);
  2. it figures dividends on its own taxable pool, which pays the conversion tax, then collects every RMD and is never spent
     (not disclosed);
  3. it ends each spouse's conversions at that spouse's own ladder year, where Engine C uses one household year (not disclosed).

  With the first two replaced by Engine C's treatment (scratch copy), Engine A's IRMAA equals Engine C's:
  - on all five registered households, to the dollar;
  - on 99 of 102 fixture cases. The three left are the third difference (§0.2).

  Its income tax does not close as neatly: it lands within $389 of Engine B on the example, but between −$18,541 and +$6,638 lifetime
  across the fixtures. What remains is not fully decomposed here (D-68's scope, §1.3).
- **D-66 is wider than registered.** The same differences make Engine A's *income tax* high, and What Breaks reads that too. The tax gap
  is larger than the IRMAA gap: **$2,480 a year of estimated tax on the example at the defaults**, where the IRMAA gap is $0 (§0.3).
- **Two corrections to the register.**
  - One household it did not list also disagrees: the example at a $0 slider under BASE, Engine A $5,750 against Engine C $0.
  - *"Direction varies"* stays true, but it is lopsided. Counting tax and IRMAA together, What Breaks' estimate is above the Monte Carlo's
    on 100 of 102 fixture cases and below on 2.
- **The recommended fix mostly moves What Breaks in the optimistic direction.** It reads the Monte Carlo's own tax schedule. On the example
  under BASE:
  - the estimate falls from $10,528 to $8,048 a year;
  - spending headroom rises from 1.20× to 1.25×;
  - the shock absorbed rises from $0.50M to $0.55M.

  (§0.4.) The current figure is high because of three simplifications, one of them disclosed. It is not a margin anyone chose, and on two
  fixture cases it is low. DB-1 sets out the choice.

This is a **model release** for What Breaks only. Engines A, B, C and D do not change. The Monte Carlo, the Roth tab, and the Taxes, IRMAA
and Withdrawal tabs do not change. METHODOLOGY changes.

**Built against v6.35.**
- Clone: a full clone of `origin/main` at `59b8dc4` (`git fetch` 2026-10-28: still the head).
  - It passed the post-upload check today: `package_check` 55 passed, 0 failed, 0 skipped, against the live pool.
  - The §F clone diff was clean: 103 of 103 files identical.
- Hashes: source `853e311ab5704c5d722e439f6ccd590c` (repo, pool and run folder agree), built page `1f5a4cb514d71e0c2a7bf02c18561b0f`.
- The pool still lists the 16 documents verified after the v6.35 upload; nothing has been added since.
- Line numbers: v6.35, printed by the census probes below or read from the file this session.

**Probes (all session-only, never committed):**
- **Unmodified module:** `p2.mjs`, `p6.mjs`, `thr.mjs`; and the review's `p8.mjs` (direction across the fixtures).
- **Instrumented module copy** (`app_d66.mjs`): `p3.mjs`, `p4.mjs`, `p5.mjs`; and the review's `p9.mjs` and `p10.mjs`. The copy is
  changed in two ways:
  - Recording lines: two in Engine A, one in Engine C. They push each year's figures to a global array and change nothing.
  - Three switches in Engine A, each off unless a probe sets `globalThis.__V`:
    - drain the spending draw from Traditional;
    - Engine C's dividend base;
    - Engine D's sale gains in the lookback.

    With every switch off the copy reproduces the shipped totals exactly.

    The dividend switch is Engine C's formula exactly. The drain switch is close to Engine C's, not identical: it splits the draw by
    start-of-year leg balance where Engine C uses the post-RMD split, and it leaves the annuity share alone.
- **SS cut (§0.5):** the review's `p11.mjs`, on a module copy that adds one setter for the trust-fund cut.
- **Rendered What Breaks:** `wb.mjs`, the review's `wb4.mjs` and its three-mode copy `wb5.mjs` render What Breaks from an instrumented copy
  of the DOM bundle (`dom_d66.cjs`).
  - A global switch makes the copy's estimate take the Monte Carlo's schedule, averaged or year by year.
  - With the switch off it is the shipped bundle.
  - `wb4.mjs` and `wb5.mjs` set the prior by clicking the preset on the Monte Carlo tab. `wb.mjs` did not, and its "BASE" rows were wrong
    (§6, M1).
- **Census:** `census.cjs`, `ids.cjs`, `docs.cjs` and `qacensus.cjs`, and the review's `mycensus.cjs`, walk the source's and the suite's AST
  and literals. `docs.cjs` evaluates the `DOCS_HTML` literal and strips its tags; its `@` offsets are match positions in that text.

**Free names:**
- The suite name `t100`: no `qa/t100*` exists in the clone or in its history.
- `t99` stays promised to the 2027 tax refresh, whichever ships first (§1.4).

---

## 0 · Premise (verified at v6.35, not assumed)

### 0.1 · The registered figures reproduce

What Breaks charges Engine A's `(totTaxToday + totIrmaaToday) ÷ planYears` (L12853). The Monte Carlo charges `mcIncomeTaxSchedule`: Engine
B's `totalTaxToday`, plus Engine C's `surchargeToday` in each premium year inside the horizon (L135–150).

The households are `t94`'s set, built the same way, plus one more:
- taxable yield 2%;
- QCD $0;
- the slider as listed.

Lifetime IRMAA, today's dollars:

| Household | Engine A | Engine C, inside the horizon | Engine C, in all | Register |
|---|---|---|---|---|
| Example, $70K, BASE | $0 | $0 | $0 | equal ✓ |
| Example, $250K, BASE | $24,180 | $24,180 | $24,180 | equal ✓ |
| Example made single, $70K, BASE | $10,930 | $12,080 | $12,080 | ✓ |
| New York ×3, $70K, BASE | $50,270 | $32,340 | $41,580 | ✓ |
| Example, $0, BULL-LEANING | $8,050 | $0 | $0 | ✓ |
| **Example, $0, BASE** *(not registered)* | **$5,750** | **$0** | **$0** | — |

"In all" counts two premium years after the horizon. Neither stress view charges those years.

### 0.2 · Where the two engines part, and why

Engine A publishes no per-year IRMAA, so the instrumented copy records it. Its per-year MAGI (the `magiByYr` seam) is set beside Engine
C's rows.

**On the example at $70K the conversion years agree to within about $700 a year:** −$581 to +$677 from 2029 to 2038. The ladder runs to
2040, and RMDs start in 2039.
- In 2029–30 the gap is mostly the funding sale's gain: Engine A's own sale ($1,737 in 2029) against Engine D's ($1,060). The dividends
  are equal in 2029 ($455).
- From 2031 it is the dividend. Engine A's taxable pool has been emptied paying the conversion tax, so its dividend is $0. Engine C's
  dividend is today's taxable balance grown with inflation: $481–$581 in 2031–38.

This closeness does not hold everywhere: New York ×3 differs by −$4,925 in 2037, and the example at $250K by $254,272 in 2035 (Engine A
converts in 2035; Engine C's Traditional is empty).

**From the first RMD they part.**
- Engine A never takes the spending draw out of Traditional. At the start of 2039 the example's Traditional balance is $1,443,115 in
  Engine A against $991,330 in Engine C. So the 2039 RMD is $49,327 against $33,853.
- Engine A's taxable pool then receives every gross RMD and spends none of it. Its dividend reaches $19,110 by 2053, against Engine C's
  $871.
- On the example at $70K the MAGI gap reaches $65,358 (2052) without crossing a tier. On New York ×3 it reaches $141,318 (2053) and crosses
  tiers from 2039.

**The single household is a near-miss at a threshold.**
- Every premium year is billed the same, except 2038 (MAGI year 2036).
- In 2036 Engine A's MAGI is $150,302 and Engine C's is $150,852. The 2038 single tier-1 threshold is about $150,765, between them.
- So Engine C bills $1,591 for 2038 and Engine A nothing. In today's dollars that is the $1,150 gap.
- The $550 is the dividend.

**Counterfactual: each simplification replaced by Engine C's treatment** (the instrumented copy's three switches). Lifetime IRMAA, today's
dollars, current-slider row:

| Household | A as shipped | + drain | + dividend | + Engine D's gains | drain + dividend | Engine C, inside the horizon |
|---|---|---|---|---|---|---|
| Example $70K BASE | $0 | $0 | $0 | $0 | $0 | $0 |
| Example $250K BASE | $24,180 | $24,180 | $24,180 | $24,180 | $24,180 | $24,180 |
| Single $70K BASE | $10,930 | $10,930 | **$12,080** | $10,930 | **$12,080** | $12,080 |
| New York ×3 $70K BASE | $50,270 | $37,560 | $40,420 | $47,380 | **$32,340** | $32,340 |
| Example $0 BULL-LEANING | $8,050 | **$0** | **$0** | $6,900 | **$0** | $0 |

**Across the fixture households** (`qa/tools/fixture/households.mjs`, 17 households × BASE/BULL × $0/$70K/$250K, 102 cases, `p9.mjs`),
drain plus dividend leaves three IRMAA gaps:

| Case | Engine A, drain + dividend | Engine C, inside the horizon |
|---|---|---|
| `months`, $250K, BASE | $20,720 | $24,180 |
| `rmd73`, $250K, BASE | $26,540 | $31,100 |
| `rmd73`, $250K, BULL | $26,540 | $31,100 |

Those three are the third difference: the ladder end.
- Engine A ends each spouse's conversions at that spouse's own year (`ladderEndA`, `ladderEndB`). Engine C uses the household's
  `_ladderEnd`.
- On `rmd73` the spouses' years are 2030 and 2040, and the household's is 2040 (`p10.mjs`).
- Engine A converts $250K in 2029–31, stops for 2032–37 while spouse A's money is closed to conversion, then converts again in 2038–40.
- Engine C converts every year from 2029 until Traditional is empty in 2034.

What else agrees:
- The growth rate is not a cause: Engine A's `GROWTH` is `BASE_GROWTH` = 0.045 (L1455, L5322), the same as Engine C's hard-coded 1.045
  (L6278).
- The persons billed, the filing status and the premium year's table agree. On the single household every year was compared directly.
  Elsewhere the totals match to the dollar wherever the three differences are removed, which they could not if any of these differed in a
  year that carries a surcharge.

**Engine A's income tax only partly follows.**
- On the example at $70K, drain plus dividend takes Engine A's lifetime tax from $263,208 to $201,592, against Engine B's $201,203.
- Elsewhere the residual is wider:
  - single −$3,789;
  - New York ×3 +$14,757;
  - example $0 BULL +$2,509;
  - across the 102 fixture cases, −$18,541 to +$6,638.
- The ladder end explains `rmd73`'s large negative residuals. The rest is not decomposed here.

**The drain is the only one of the three that is disclosed.**
- At v5.84 Engine A began taxing the draw. It does not drain it, because each strategy would need its own spending path, and one shared
  series drained from every strategy *"decided the solver's winner by its own approximation"* (METHODOLOGY, *The Taxes tab and the
  drawdown*, item 4).
- It was filed as follow-up **D-7b** in `FlawsToFix-v5_73-Phase2.md`, where it is still **OPEN, disclosed**.
- The Field Manual's Roth entry says *"every strategy keeps the same overstated Traditional balance, which a later release addresses"*.
- It was never entered in MissingFeatures; that register's own D-7 is an unrelated item (state estate tax).
- Nothing discloses the dividend base or the ladder end. On New York ×3 the dividend base alone moves Engine A's IRMAA from $50,270 to
  $40,420.

### 0.3 · What What Breaks charges, against the Monte Carlo

Module runs with the same inputs: yield 2%, QCD $0. The years run from retirement through the later life expectancy. What Breaks'
`planYears` equals the schedule's year count on every household.

| Household | What Breaks today: A's tax + IRMAA ÷ years | The Monte Carlo's schedule ÷ years | Difference a year |
|---|---|---|---|
| Example $70K BASE | $10,528 | $8,048 | +$2,480 |
| Example $250K BASE | $13,352 | $12,241 | +$1,111 |
| Single $70K BASE | $16,284 | $14,931 | +$1,352 |
| New York ×3 $70K BASE | $38,441 | $31,526 | +$6,915 |
| Example $0 BULL-LEANING | $10,533 | $7,432 | +$3,101 |
| Example $0 BASE | $10,130 | $7,223 | +$2,907 |
| Example $70K BEAR-LEANING | $10,189 | $7,806 | +$2,383 |

**Across the 102 fixture cases** (`p8.mjs`):
- What Breaks is above the schedule in 100 and below in 2: `rmd73` at $250K, −$248 a year under BASE and −$104 under BULL.
- IRMAA alone differs in 44 cases: Engine A higher in 40, lower in 4.

The register sized D-66 at "about $720 a year at most" (the IRMAA part on New York ×3). The tax part is up to ten times that.

### 0.4 · What the fix moves on screen

Rendered on the v6.35 DOM bundle (`wb4.mjs`; the prior set by its preset button, and the page's header label checked). The shipped
bundle is set beside the copy that reads the Monte Carlo's schedule, averaged (DB-1 (a), DB-3 (a)). Each cell reads shipped → schedule.

| Plan | Estimate a year | Spending headroom | Shock absorbed | Return break-point | Crash years |
|---|---|---|---|---|---|
| Example, BASE | $10,528 → $8,048 | 1.20× → 1.25× | $0.50M → $0.55M | −2.2% → −2.2% | 1 → 1 |
| Single, BASE | $16,284 → $14,931 | 1.30× → 1.35× | $0.55M → $0.55M | −4.2% → −4.2% | 1 → 1 |
| New York ×3, BASE | $38,441 → $31,526 | 2.50× → 2.55× | $3.0M → $3.0M | −6.7% → −7.2% | 4 → 4 |
| Example, BULL-LEANING (the page's default) | $10,549 → $8,047 | 1.35× → 1.35× | $0.85M → $0.90M | −2.3% → −2.3% | 2 → 2 |
| Single, BULL-LEANING | $16,521 → $15,053 | 1.40× → 1.45× | $0.80M → $0.80M | −3.8% → −4.3% | 1 → 2 |
| New York ×3, BULL-LEANING | $39,852 → $32,647 | 2.85× → 2.95× | $3.0M → $3.0M | −6.8% → −7.3% | 4 → 5 |

The estimates equal §0.3's to the dollar, because the page runs the same slider, yield and QCD.

**Direction: optimistic on these plans, and on 100 of 102 fixture cases.** Under the project's default (*"make the plan look slightly
worse"*) that needs stating, and DB-1 states it. The case for it:
- What Breaks is high because Engine A keeps money in Traditional and in its taxable pool that the household has already spent, and
  because of the ladder end.
- One of those three is disclosed as an overstatement. None of them is a margin anyone chose.
- On two fixture cases the same differences make What Breaks *low*, so keeping them is not a reliable margin either.
- The Monte Carlo, the app's primary figure, already pays the Taxes and IRMAA tabs' figures. Two stress views that disagree by $2,480 a
  year on the default plan is the defect.

### 0.5 · One more difference What Breaks inherits from Engine A: the Social Security cut

By AST, `ssDepletionFactor` is called in:
- `runRothStrategies` (L5357–5358);
- both Monte Carlo engines (`runMonteCarlo`, `runExtendedMC`);
- the SS tab (L9820–9821).

It is not called in `computeTaxPlan`, `computeIrmaaPlan`, `computeWithdrawalPlan` or `mcIncomeTaxSchedule`.

So under a trust-fund cut, What Breaks' tax estimate falls with the cut today, while the Monte Carlo's tax does not. The Field Manual says
so (*"…and so does What Breaks, except for the tax estimate it takes from the Roth engine"*).

Under DB-1 (a) the estimate no longer moves with the cut. It keeps scheduled benefits, like every figure the cut does not recompute. With a
78% cut from 2033 (`p11.mjs`):

| Household | Today, no cut | Today, cut | After the fix, either way |
|---|---|---|---|
| Example $70K | $10,528 | $9,315 | $8,048 |
| Single $70K | $16,284 | $14,968 | $14,931 |
| New York ×3 $70K | $38,441 | $36,701 | $31,526 |

So under a cut the fix still lowers the estimate, by less than it does without one. The Field Manual's exception goes, and its trust-fund
FAQ (@138358) gains What Breaks' tax among the figures that keep scheduled benefits.

---

## 1 · What changes (the recommended shape: DB-1 (a), DB-2 (a), DB-3 (a), DB-4 (a), DB-5 (a))

### 1.1 · What Breaks reads the Monte Carlo's schedule

- **A new module-level helper**, `whatBreaksAnnualTax(retireYear, horizonYr, inputs)`:
  - it calls `mcIncomeTaxSchedule(retireYear, inputs)`;
  - it sums `mcTaxForYear(schedule, y)` for each year from `retireYear` to `horizonYr`, and divides by the count;
  - it returns that average, and the schedule's own tax and IRMAA parts, for the copy and the tests.
- **What Breaks calls it** with exactly the Monte Carlo's four inputs: `{ rothAmount, qcdAnnual, taxYield, scenarioPreset }` (DB-2).
  - This replaces the `_pTax` object, the `runRothStrategies` call and the expression at L12853: the body of the `try` at L12836–12854.
  - `let estAnnualTax = 13000` (L12835) and the empty `catch` stay, as the fallback if the helper throws.
- **It is module-level for two reasons:**
  - The tests compare it to the dollar.
  - `t83` E-6 asserts exactly three `mcIncomeTaxSchedule` calls inside `DangerCloseMain`. A call written inline in What Breaks would make
    it four.
- **It is exported on `__g` via the shim.** OPERATIONS §M keeps a hoist and its export in separate releases. That rule is for moving
  existing inline code, where green cannot tell "unchanged" from "fitted".
  - This is a new five-line function, and the test's oracle does not read it. The oracle is Engine B's rows plus Engine C's rows, summed
    independently (§3 B).
  - The review agreed, with one caveat, which stands: the oracle restates the same specification (premium years inside the horizon), so it
    would share an error in that specification.
- **Why a call and not `simData[retireYear].taxSchedule`:** that object is filled asynchronously after the Monte Carlo runs, so What Breaks
  would render a fallback first. The same function with the same four inputs gives the same schedule; §3 A checks the inputs by AST.
- **What Breaks no longer runs Engine A.** `runRothStrategies` keeps three callers, all on the Roth tab: the solve-for grid (L7467), the
  comparator (L11479) and the grid's slider row (L11645).

### 1.2 · The copy

- **What Breaks' basis line (L12942).**
  - It currently reads *"~$XK/yr average from the Roth tab's strategy engine, incl. Roth-conversion taxes and IRMAA surcharges … that engine
    projects its own income, so on some plans its IRMAA differs from the IRMAA tab's"*.
  - It becomes the Monte Carlo's tax, named once: the Taxes tab's income tax and the IRMAA tab's surcharges at the current settings,
    averaged over the plan's years.
  - The D-65 clause about the first two premium years stays. `t98` B-8c and B-8e pin both of its forms (blank, and entered), so the
    rewording keeps them word for word or re-gates them.
- **What Breaks' footer (L12954):** *"Its taxes are a yearly average from the Roth tab's strategy engine"* → the same source, named the
  same way.
- **The Field Manual** (`DOCS_HTML`, quote-free anchors; offsets are positions in the tag-stripped text):
  - the What Breaks entry (paragraph from @68246): the engine named, and the *"projects income its own way … in either direction"* clause
    removed. Its D-65 phrase, which `t98` B-8g pins, stays word for word;
  - the Social Security cut paragraph (sentence from @35923): *"…and so does What Breaks, except for the tax estimate it takes from the Roth
    engine"* → *"…and so does What Breaks"*;
  - the trust-fund FAQ (@138358): What Breaks' tax added to what keeps scheduled benefits;
  - one new what's-new note for this release.

  These stay true and are left alone:
  - @23048 (the slider: "What Breaks reads it for its tax estimate");
  - @56301 and @65201 (D-65's two years, "the Monte Carlo and What Breaks charge them");
  - the income-streams notes (@126479, @139518, L8395, L14948);
  - the IRMAA tab's L12107 and L12109;
  - the dated v6.31 and v6.35 history notes (@111988, @115893, @116178).
- **The four version sites** (OPERATIONS §C; `t1` STATIC).

### 1.3 · The registers

- **MissingFeatures D-66 → CLOSED.** The note records the cause as far as located, and the wider-than-registered tax part.
- **New D-68** (DB-4): Engine A's absolute tax and IRMAA differ from Engines B and C.
  - It carries `FlawsToFix-v5_73-Phase2.md`'s D-7b into the register, and adds the two undisclosed differences: the dividend base and the
    per-spouse ladder end.
  - It carries §0.2's figures and the undecomposed tax residual.
  - Low–Med. Mostly high (conservative), not always (§0.3). After this release it affects the Roth tab only.
  - D-68's own scope must measure the ranking of strategies. v5.84 found that draining one shared series moved the solver's winner.
- **METHODOLOGY:**
  - a new section, *What Breaks pays the Monte Carlo's tax*, with §0's measurements;
  - closed or superseded in place, each a statement that becomes false:
    - L3223, the v6.31 bullet *"Engine A and Engine C do not agree on every household"*;
    - L2832, *"What-Breaks' tax stays the Roth tab's strategy engine's"*;
    - L3105–3107, *"What Breaks reads Engine A's tax in today's dollars"*;
    - L1063, *"What-Breaks' tax — the Roth tab's strategy engine's — does include…"*. The neighbouring *"**Backtest and What-Breaks
      credit no stream**"* (L1061) stays word for word, because `t86` G-6 requires it;
  - L1526 (*"all four callers"*) is v5.84 history and is left as written.
- **CHANGELOG:** the entry, with the optimistic direction and the two exceptions stated (§0.4).

### 1.4 · Version and order (DB-5)

- **Steve's stated order** is in the v6.35 scope's header and the 2027 refresh's: *"Release after that (v6.36): the 2027 tax figures, the
  moment the IRS and CMS have published"*.
- **DV-1** is the trigger for the figures to take an earlier number. It is not a rule that lets a model release take theirs.
- **So building D-66 before the figures asks Steve to revise that order.** DB-5 asks.
- **Where the figures stand.** The refresh (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, OPEN, v6.36, suite `t99`) still waits on three
  sources:
  - the IRS TY2027 revenue procedure;
  - the §402(g) notice;
  - CMS's 2027 IRMAA figures.

  On 2026-10-28 a search found only third-party projections of the 2027 brackets.
- **If D-66 goes first, as v6.36,** the refresh renumbers to v6.37 in this package, the third time:
  - its header box and its §1, §3 and §7.4 headings;
  - tag `v636` → `v637`;
  - `qa/tools/package_check.mjs`'s OPEN-allowlist comment (L869–874, *"EXPIRES AT THE v6.36 BUILD"*).

  Its suite name stays **`t99`**. This release's suite is **`t100`** either way, so no suite file is renamed.
- **The deadline still outranks it.** If all three sources are out before this release reaches its build review, the refresh keeps
  v6.36 and this becomes v6.37 (DV-1's spirit).

---

## 2 · Site census (v6.35, by AST; the review's independent census agrees)

| Site | Lines | What | Change |
|---|---|---|---|
| What Breaks' estimate | L12835 (`let estAnnualTax = 13000`), `try` L12836 – `catch` L12854 | `_pTax`; `runRothStrategies(_pTax)` (L12850); `(totTaxToday + totIrmaaToday) / planYears` (L12853) | the `try` body → `whatBreaksAnnualTax(...)` |
| `estAnnualTax` readers | L12810, L12879 (the two projectors), L12942 (copy) | `estAnnualTax * cumInf` in both projectors | unchanged (DB-3 (a)) |
| `runRothStrategies` callers | L7467, L11479, L11645, **L12850** | four | L12850 removed; three remain |
| `.totIrmaaToday` / `.totTaxToday` readers | L11579, L11630, L11681, L11696 (Roth tab), **L12853** | | L12853 removed |
| `mcIncomeTaxSchedule` callers | L200 (in `mcResolveTaxSchedule`), L7522, L7544, L7576 | the Monte Carlo | + one, in the new module-level helper |
| `qcdAnnual`, `taxYield`, `scenarioPreset`, `rothAmount` | `DangerCloseMain` state (L7328, L7398, L7400, L7401), in scope at L12847 | | read by the new call |
| What Breaks copy | L12942, L12954 | §1.2 | reworded |
| `DOCS_HTML` | L5219: @35923, @68246, @138358 | §1.2 | reworded; one note added |
| Module | a new top-level function beside `mcIncomeTaxSchedule` | | new |
| `shim.txt` | `__g` | | exports the helper |

Not touched:
- Engines A, B, C and D;
- `mcIncomeTaxSchedule`;
- both Monte Carlo engines;
- `withdrawalPlanSeries`.

The Monte Carlo parity fingerprint (OPERATIONS §E) must therefore come out unchanged.

**What reads What Breaks' outputs:** nothing outside the tab. They are locals of the tab's render. No Ask AI, Dashboard or export path
reads them (review, checked).

**Suite sites that read What Breaks' tax, its copy, or Engine A's callers** (literals and identifiers by AST; the review's census adds
three):

| Suite | Checks | Why it moves |
|---|---|---|
| `t49` | **X-2** (L114–117) | asserts exactly **four** app calls of `runRothStrategies`; three after this release. **Will fail; re-gated.** *(found by the review)* |
| `t83` | I-7, I-10 | match *"average from the Roth tab's strategy engine"* in the page and the Field Manual |
| `t83` | E-6 | asserts three `mcIncomeTaxSchedule` calls inside `DangerCloseMain`. Holds because the helper is module-level (§1.1) |
| `t93` | H-7, W-1 | H-7 is a source regex on L12853's expression; W-1 reads the estimate as Engine A's |
| `t94` | D-4, D-5 | D-4: the estimate as Engine A's. D-5: the *"its IRMAA differs"* clause |
| `t94` | D-1, D-2 | Engine A against Engine C; still true. Relabelled as Roth-tab facts (D-68), not What Breaks facts |
| `t98` | B-8c, B-8e, B-8g | What Breaks' and the Field Manual entry's D-65 wording, blank and entered; kept word for word or re-gated *(B-8e, B-8g found by the review)* |
| `t81` | E-8 | What Breaks' spending headroom on the example at the DOM default, BULL-LEANING: 1.35× before and after (§0.4); expected to hold |
| `t93` W-0, `t94` D-3 | setup | stay green |
| `t92` | B-8 | the history sentence; carries no break-point figure; holds |
| `t4`, `t6`, `t91` | the rendered tab | no tax figure pinned |

The suite census was taken over the run folder's `qa/`, byte-identical to the clone's. The build re-runs it on the edited source.

---

## 3 · Tests

A new suite, **`t100_whatbreaks_tax.mjs`**, runs on both legs. On the v6.35 leg each new behavior is a dated
`[KNOWN DEFECT 2026-10-28, D-66 — flips at v6.3x]` check, as `t98` did.

- **A · the source, by AST:**
  - What Breaks' estimate is the helper's return value, called with exactly the identifier set the Monte Carlo passes (`rothAmount`,
    `qcdAnnual`, `taxYield`, `scenarioPreset`) and the same `retireYear`;
  - the helper is module-level and calls `mcIncomeTaxSchedule` and no engine directly;
  - `runRothStrategies` has three callers, none in What Breaks;
  - no `.totIrmaaToday` or `.totTaxToday` is read outside the Roth tab.
- **B · the extinction invariant: What Breaks pays the Monte Carlo's tax.**
  - The households: every fixture household; the six in §0.1; and one each with QCD above $0, a trust-fund cut, `workMagi` entered, a
    survivor plan, and a plan retiring this year. Each runs under BASE and BULL-LEANING, at $0, $70K and $250K.
  - In every case the helper's average equals, to the cent, an independent sum:
    - Engine B's `totalTaxToday` for each year from retirement to the horizon;
    - plus Engine C's `surchargeToday` for each premium year in that range;
    - divided by the year count.

    The sum reads `computeTaxPlan` and `computeIrmaaPlan` directly, not the schedule.
  - What Breaks' IRMAA part equals Engine C's inside the horizon in every case. That is D-66's own claim; on the v6.35 leg it is pinned as
    the defect, on the cases where it differs.
- **C · what is rendered:**
  - on the example, the single example and New York ×3, What Breaks prints `~$${Math.round(helper / 1000)}K/yr`;
  - the basis line and footer name the Taxes tab's tax and the IRMAA tab's surcharges;
  - *"Roth tab's strategy engine"* and *"its IRMAA differs"* are absent from What Breaks and from the Field Manual's What Breaks entry;
  - the Social Security cut paragraph's exception is gone;
  - the D-65 phrases `t98` pins are present.
- **D · what does not move:**
  - Engine A's current-slider rows are bit-identical across the two legs on every §B household, so the Roth tab is untouched;
  - the Monte Carlo parity fingerprint and `t94`'s §A schedule checks hold unchanged.
- **E · the effect, pinned through the DOM.** What Breaks' projector is component-inline (OPERATIONS §M), so its four answers are reachable
  only as rendered. On the example under BASE, with the prior set by its button and the header label checked, they are pinned as measured
  at the build. §0.4's are the expected values.

Re-gated: the §2 suite rows. Controls: a `qa/tools/controls_<tag>_whatbreaks.py`, an independent Python recomputation of §B's sum on the
example and the single example from the engines' published rows, as `controls_v635` did. *(Built differently, §7.5: like `controls_v635`,
it is a set of negative mutation controls — each puts one defect back and names the check that must go red. The draft's description of
`controls_v635` was wrong.)*

---

## 4 · Out of scope (recorded)

- **Making Engine A agree with Engines B and C (D-68, new).** That means:
  - draining the draw;
  - the dividend base;
  - the per-spouse ladder end against the household's (which engine is right is itself a question);
  - the undecomposed tax residual.

  It would fix the Roth tab's absolute figures, but it changes every strategy's figures and may change the solver's winner. It needs its
  own scope.
- **Charging What Breaks each year's tax instead of the average (DB-3 (b)).** Measured (`wb5.mjs`, priors set by button), the direction is
  not one way:
  - Return break-point, under BASE:
    - example −2.2% (average) → −2.7% (year by year);
    - single −4.2% → −4.7%;
    - New York ×3 −7.2% → −6.7%.
  - Return break-point, under BULL-LEANING: example −2.3% → −2.8%, New York ×3 −7.3% → −6.8%.
  - Spending headroom: single under BASE 1.35× → 1.30×, New York ×3 2.55× → 2.60×.
  - It is a change to What Breaks' projector, not to where its tax comes from.
- **The Roth tab's current-slider row against the IRMAA and Taxes tabs.** It still shows Engine A's figures; on the example at $0 under
  BASE that is $5,750 of IRMAA against the IRMAA tab's $0. The Roth tab says *"pair any candidate with the Monte Carlo and IRMAA tabs before
  acting"*, and the Field Manual discloses the drain. This is D-68.
- **Engine C's hard-coded 1.045 Traditional growth** (ARCHITECTUREIssues E-22).
- **A QCD's gift never leaving the portfolio** (METHODOLOGY, *The Taxes tab and the drawdown*, item 3). Under DB-2 (a) What Breaks inherits
  the Monte Carlo's handling.
- **What Breaks crediting no income stream** (D-57). Unchanged: its tax includes the streams' tax, as Engine A's already did.

---

## 5 · Decisions for Steve

**DB-1 · What should What Breaks' tax estimate read?**
- **(a) Recommended: the Monte Carlo's schedule, the Taxes tab's tax plus the IRMAA tab's surcharges** (§1.1).
  - The two stress views then charge one projection, and D-66 closes. The engines do not change, and the Roth tab does not move.
  - What Breaks' estimate falls $1,100–$6,900 a year on the plans in §0.3. Its answers move a step in the plan's favour on most of them
    (§0.4); on two fixture cases the estimate rises.
  - That is mostly the optimistic direction. It removes three simplifications, one of them disclosed as an overstatement and two not
    disclosed at all. It does not relax a margin anyone chose.
- (b) The Monte Carlo's IRMAA only, keeping Engine A's income tax.
  - It closes D-66 exactly as registered.
  - It leaves the larger tax gap: $2,480 a year on the example at the defaults.
  - What Breaks would charge tax and IRMAA from two engines that disagree about the same household's income.
- (c) Leave What Breaks as it is. Restate D-66 with the located causes and the tax gap, disclose the dividend base and the ladder end, and
  add a per-year IRMAA seam to Engine A for the tests. Nothing changes for a user.
- (d) Fix Engine A instead, so every reader of Engine A comes into line. This is the root fix, but it is D-68's scope: it moves every Roth
  strategy, possibly the solver's winner, and its tax residual is not yet understood. Not recommended inside this release.

*Considered and not offered:* reading the schedule and adding a fixed margin to keep What Breaks conservative. No figure for such a margin
follows from the evidence, and an unexplained margin is what this fix removes.

**DB-2 · What Breaks' inputs to the schedule**
- **(a) Recommended: exactly the Monte Carlo's**: the slider, the QCD, the dividend yield and the scenario. One schedule, the same figure.
  A QCD then lowers What Breaks' tax as it lowers the Monte Carlo's, with the same disclosed caveat (the gift itself is not charged).
- (b) The same, with QCD held at $0. Conservative when a QCD is set, but What Breaks and the Monte Carlo would disagree again on exactly
  those plans.

**DB-3 · Average or year by year**
- **(a) Recommended: keep the yearly average**, now of the Monte Carlo's schedule. This release changes where the tax comes from, not how
  the projector spends it.
- (b) Charge each year's figure. More faithful to timing, but measured in both directions (§4), and a change to the projector's own model.
  If wanted, file it.

**DB-4 · Enter Engine A's differences in the register**
- **(a) Recommended: file them as MissingFeatures D-68** (Low–Med; mostly conservative; Roth tab).
  - It carries FlawsToFix Phase 2's D-7b, plus the dividend base and the per-spouse ladder end that this scope found, with §0.2's
    measurements.
  - D-7b has lived only in a v5.73 audit document, and the Field Manual has promised since v5.84 that *"a later release addresses"* it.
- (b) Leave D-7b in `FlawsToFix-v5_73-Phase2.md`, cite it from D-66's closing note, and record the other two differences in METHODOLOGY
  only.

**DB-5 · Order and version**
- **(a) Recommended: build it now, as the next number.** That is v6.36 if it reaches its build review before the IRS revenue procedure,
  the §402(g) notice and CMS's 2027 figures are all out.
  - This revises your stated order (§1.4), so it is your call.
  - The 2027 refresh then becomes v6.37, renumbered in this package at the sites §1.4 lists. Its suite stays `t99`; this one is `t100`.
  - The release is small and could be built now; the refresh cannot. If the sources all publish first, the refresh keeps v6.36.
- (b) Keep your order: the 2027 figures are v6.36, and this waits as v6.37. No renumbering, but a finished fix waits on a calendar it does
  not depend on.

---

## 6 · Review

An agent that had not seen the draft reviewed it against the v6.35 source.
- It re-ran the probes and wrote its own: `p7`–`p13`, `wb2`–`wb4`, `mycensus.cjs` and `docsall.cjs`, in a scratch folder.
- It took its own AST census of the source and the suite.
- It edited no file outside that folder, and did not run the suite.

Every finding below was re-run or re-read before it was taken.

**Must-fix (all three taken):**

| # | Finding | Checked | Taken in |
|---|---|---|---|
| M1 | §0.4's "BASE" rows were rendered under the page's default BULL-LEANING prior: the probe set the module's weights but never the page's preset, so they were a mix. The stated reason for the gap ("the page's own settings") was false. The §4 per-year figures and the `t81` E-8 note rested on the same runs. | `wb4.mjs` re-run: the header reads BASE, the estimates equal §0.3 to the dollar, and the answers differ from the draft's | §0.4 table replaced; §4 re-measured (`wb5.mjs`); §2's `t81` row; §3 E. **My error:** I did not check the page's header label. |
| M2 | "Drain plus dividend closes every gap exactly" and "nothing else is needed" are false on the fixtures: three IRMAA gaps remain, from the per-spouse ladder end. The tax residual is −$18,541 to +$6,638. | `p9.mjs` and `p10.mjs` re-run: 102 cases, 3 gaps; `rmd73`'s conversion years printed | Summary, §0.2, §1.3 (D-68), §4, DB-1, DB-4 |
| M3 | `t49` X-2 asserts four `runRothStrategies` callers; this release leaves three. Missing from §2. | `t49` L114–117 read | §2 |

**Should-fix (all taken):**
- **S1 (§0.5's direction under a cut was backwards).** The fix lowers the estimate under a cut too, by less. `p11.mjs` re-run. → §0.5
  table.
- **S2 ("the same two simplifications explain the tax" rested on one household).** → §0.2.
- **S3 ("higher on every household" fails on two fixture cases).** `p8.mjs` re-run: 100 above, 2 below; IRMAA 40 higher, 4 lower. →
  summary, §0.3, DB-1, DB-4.
- **S4 (the argument credited the Field Manual with disclosing more than it does).** Only the drain is disclosed. → §0.2, §0.4, DB-1.
- **S5 ("within about $500" and "the difference is the dividend" overgeneralised).** In 2029–30 the gap is the sale gain. → §0.2.
- **S6 (METHODOLOGY statements missed: L1063, L3105–3107; `t86` G-6's constraint at L1061).** → §1.3.
- **S7 (§1.4 put D-66 "under DV-1's rule"; it revises Steve's stated order. The renumbering sites were not listed).** → §1.4, DB-5.
- **S8 (`t98` B-8e and B-8g missing).** → §1.2, §2.

**Notes:**
- **N1 (§M argument holds; the oracle shares the specification; the four answers are DOM-only).** → §1.1, §3 E.
- **N2 (`t83` E-6 requires the helper to be module-level).** → §1.1, §2.
- **N3 (strings that stay true but were not listed; the trust-fund FAQ becomes incomplete; offsets are match positions).** → §1.2.
- **N4 (line ranges).** → §1.1, §2.
- **N5 (`p2.mjs`'s tier column used the married table for the single plan).** The single-household claims rest on `p3.mjs`'s direct
  comparison, which is correct. Recorded; no text depended on the wrong column.
- **N6 (the drain switch approximates Engine C's split).** → the probe notes above.
- **N7 (no option keeps an explicit margin).** Considered → DB-1's closing note.

**Verified correct by the review:**
- every cell of §0.1 and §0.3;
- §0.2's per-year figures and its counterfactual table;
- the growth constants;
- the AST census of callers, readers and state;
- the `ssDepletionFactor` callers;
- that nothing else consumes What Breaks' outputs;
- the quoted Field Manual, METHODOLOGY and register text;
- that D-68 and `t100` are free.

---

## 7 · Build record (v6.36)

Built 2026-10-28 on v6.35 (`853e311a…`, clone `59b8dc4`), in a workspace cloned from that commit.

### 7.1 · As scoped

- **Source.** `whatBreaksAnnualTax(retireYear, horizonYr, inputs)`, a new top-level function beside `mcTaxForYear`. What Breaks' `try`
  body calls it with `_retireYr`, `_horizonYr` and `{ rothAmount, qcdAnnual, taxYield, scenarioPreset }`; `let estAnnualTax = 13000` and
  the empty `catch` stay.
- **Copy.** The basis line, the footer, the Field Manual's What Breaks entry, its cut paragraph and the trust-fund FAQ (§1.2), a §13 note,
  and the four version sites.
- **Unchanged.** `runRothStrategies` keeps the Roth tab's three callers. Engines A–D, `mcIncomeTaxSchedule` and both Monte Carlo engines are
  byte-identical, and the Monte Carlo parity fingerprint came out unchanged (`parity` 10/10, `t2` compare green with no intended
  differences).
- **The shim** exports the helper on `__g` (guarded).
- **Registers.** MissingFeatures D-66 closed and D-68 filed; D-57's row and write-up name the new source of What Breaks' tax;
  `FlawsToFix-v5_73-Phase2.md`'s D-7b points to D-68. METHODOLOGY's section, and four passages closed or marked superseded (§1.3).
- **The 2027 refresh** renumbered to v6.37 at the sites §1.4 lists; its suite stays `t99`.
- **No boundary-census row** (OPERATIONS §K1): the defect showed on the example at the defaults ($2,480 a year), so no boundary hid it.
- **One test promised by §3 was added late:** the Social Security cut, at the build review (§7.2).

### 7.2 · Found at the build, and at the build review

**At the build:**

- **`t8` was missing from §2's suite census.** It counts the call sites of `retireStartBalances` and `taxableInitAll` with a regex over the
  comment-stripped source; What Breaks' Engine A builder held one of each. Its counts are re-gated (9 → 8, 8 → 7), measured.
- **`t57` D4 was missing too.** It requires at least four object literals that build an Engine A P (`pen` with `stateCode`); three remain.
  Gated by version.
- **`t81` E-8's attribution run moved.** On v6.20's table (`DC_V620_TABLE=1`) What Breaks' headroom on the example is 1.45× from v6.36
  (1.40× through v6.35). On the example's own table it stays 1.35×. Gated by version; measured.
- **`t98` cannot run its v6.34 differentials in a v635 → v636 folder**, which builds no v6.34 module. A-2 failed its setup check, and the
  suite died in §C on the v6.35 leg. The seven differential checks (A-2, A-2b, B-1, B-1b, C-3b, C-4, C-5) are now required only on the
  v6.35 leg of a v634 → v635 folder, and print a skip line otherwise, as `t93` and `t96` do. `t98`'s B-6 counts the P builders: three from
  v6.36.
- **`t93` and `t94` read the estimate with a regex ending in "K/yr average"**, which the new copy no longer has. Both now read "K/yr"
  alone; W-0 and D-3 are setup checks and stayed setup checks.
- **`t94` D-4/D-5:** a dangling `else` would have run the v6.30 pin on the v6.36 leg; caught by reading the edit, before any run.
- **`t94` G-11** read the Field Manual's old *"including Roth-conversion taxes and, from v6.31, IRMAA surcharges"*; re-gated to the new
  phrase on the v6.36 leg.
- **So §2's census was wrong in five places**, not one: `t8` and `t57` D4 were missing; `t93` W-0 and `t94` D-3, which §2 said "stay green",
  failed on the regex; `t81` E-8's v6.20-table run, "expected to hold", moved; `t98` B-6 and its differentials were not anticipated; `t94`
  G-11 was missing. All were found by the first full run (19 failures across `t8`, `t49`, `t57`, `t81`, `t83`, `t93`, `t94`, `t98`) and are
  re-gated as above; `t49` X-2 and `t83` I-7/I-10 were in §2.

**At the build review** (an agent that had not seen the build, reviewing the workspace diff and the run folder; no blockers; every finding
checked and taken):
- **The Social Security cut had no test.** §3 B promised a trust-fund-cut case; the shim exports no setter for the cut, and the build dropped
  it without recording it. `t100` C-10 now renders What Breaks on the example under BASE, clicks the SS tab's *2033 → 78%* preset, and
  reads it again: $8K and 1.25× both times on v6.36; on v6.35 the estimate falls $11K → $9K (pinned). Control K15.
- **`t98` B-1b was skipped with the differentials** although it reads only its own leg's module; moved out of the block, so `t98` drops six
  checks outside a v634 → v635 folder, not seven.
- **The dividend wording** in METHODOLOGY and D-68 said "$0 in the conversion years"; the dividends are equal in 2029 and Engine A's is $0
  from 2031. Corrected.
- **The Roth comparator said it used the *"same tax engine as the Taxes tab"*,** which D-68 contradicts. It now says the rules are the
  Taxes tab's and the income projection its own, running high on most plans (`t100` A-8, control K16).
- **The Field Manual's range** said What Breaks ran "$1,000 to $7,000 a year" above the Monte Carlo's on most plans; New York ×3 reaches
  $8,164 at $0. Now "$1,000 to $8,000".
- **"At the defaults" means BASE** throughout the documents; the page opens on BULL-LEANING, where the example's gap is $2,502. Said so
  where it is quoted.
- **Labels and markers:** `t100` A-2, A-3, A-5 and A-6 now check what their labels say (the helper's own parameters; `_retireYr` is
  `retireYear`; every Engine A caller and total read on the Roth tab); `t94` §D's header and D-1 name the Roth tab's engine; `t98` B-8g's
  label; METHODOLOGY's v6.31 *"What Breaks adds Engine A's IRMAA"* marked superseded, and two markers' nested italics fixed; `TESTING.md`'s
  `t94` row.
- **Noted, not changed:** `t1`'s STATIC count of `retireStartBalances(` mentions passes on 11 (≥ 10), two of them in comments; `t93` W-0 and
  `t94` D-3 still assert Engine A facts as setup; `_srcW` in What Breaks is unused (since before this release); the helper's two parts
  exclude `mcTaxForYear`'s tail, which never applies while the schedule spans the horizon (`t100` B-0).

### 7.3 · Measured

On the v6.36 build, every figure in §0.3 and §0.4 reproduced:
- `t100` B-4: the example at $70,000 under BASE is $8,048.13 a year, against Engine A's $10,528.32.
- `t100` C-5: the three plans render $8K, $15K and $32K, which are the helper's $8,048, $14,931 and $31,526.
- `t100` C-8: on the example under BASE, the four answers are 1.25×, $0.55M, −2.2% and 1.
- `t100` B-1: of 138 cases, 134 move by more than $100 a year, and Engine A sits below the schedule in 2.

### 7.4 · Counts

From the full suite run from the packaged copies (a run folder built by `mk_runfolder.sh v635 v636` from a clone of `59b8dc4` carrying the
package's code files), green on its first run: **10,472 app checks across 98 app suites, 0 failed, 0 DIED**; parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; GRAND **10,592**. Current leg 5,619 (`t100` 27 new; `t98` 72 → 66), the v6.35 leg 4,372 (`t100` 11), the
attribution runs 234 and 237. The dev run before the review (GRAND 10,557 passed, 19 failed) is the one §7.2 describes.

### 7.5 · Controls

`qa/tools/controls_v636_whatbreaks.py` on a whole copy of the packaged run folder: **17 of 17 as expected** — C0 silent; K1–K16 each turn
their named check red (What Breaks on Engine A's estimate; the helper without its surcharges, over one year too many, starting two years
late, or applying the Social Security cut; QCD $0 or a fixed slider handed to the schedule; Engine A or the schedule perturbed; each piece
of copy back to v6.35's, the Roth comparator's sentence included; METHODOLOGY's section removed). Every file restored and hash-checked. The
first run, on the dev folder before the review, was 15 of 15; K15 and K16 came with `t100` C-10 and A-8.
