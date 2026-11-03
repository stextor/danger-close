# SCOPE — D-64 and D-70: the opening balances

☑ **RETIRED — FULFILLED AT v6.43 (2026-11-03).** Steve: *"all recommended"* — DD-1 to DD-9 all (a) (§5). Build record in §7. Scoped on v6.42 (source
`940e1f02e59e9acb631957464ce643b3`, repo `80a48ee`). Reviewed once, independently (§6); every finding was checked against the source
and folded in. Repo-only (`docs/`); it ships in the release package that builds it.

Steve, 2026-11-03: *"Let's do your recommendation, option 1"* — D-64, with D-70 if the scope confirmed they share a fix site. They do:
`retireStartBalances` is where both start (§0.3).

**In one paragraph.** The Withdrawal tab (Engine D) starts its retirement accounts from today's holdings, but takes the Traditional share
and the RMDs from balances that include the contributions still to come before retirement. So the two "views of the same money" add up to
more than the money: 106.8% on the example, 134.2% on a plan retiring twelve years out, 168.4% on a plan whose holdings are small beside
its contributions. The balance is short by every planned contribution; What Breaks and Backtest start short the same way. Separately, a
single plan whose holdings are still stored under spouse B (a married plan switched to Single) has that money counted as spouse B's, and
no engine takes an RMD for spouse B on a single plan. One choke point, `retireStartBalances`, feeds both. The fix puts the contributions
into the opening balances wherever the model starts at retirement, and counts every row of a single plan as the one person's.

## 0 · Premise (verified at v6.42, not assumed)

Every figure here was printed by a probe in this session against the v6.42 module (`qa/app_v642.mjs`, built from `940e1f02…`) or a
prototype built from that source with only the change described, and the review reproduced the load-bearing ones with its own probes.
Probes are session scratch (`s643/p1.mjs`–`p3.mjs`; the review's `s643/rv/r1.mjs`–`r7.mjs`).

### 0.1 · D-64 reproduces, and is wider than registered

Engine D (`computeWithdrawalPlan`) seeds its four buckets from today's holdings (L6492–6495):

```
const _b1Init = PORTFOLIO.bucketActuals[1] * PORTFOLIO.total401k;      // … _b4Init the same
let tradFrac = _t401kInit > 0 ? _rsbW.posTrad / _t401kInit : 0;        // L6555; _rsbW = retireStartBalances(retireYear)
let rothFrac = _t401kInit > 0 ? (_rothInit - _rothOth) / _t401kInit : 0;   // L6556
```

`posTrad` and `rothInit` come from `retireStartBalances`, which adds the planned-contribution accrual (`contribAccrual`); `total401k`
does not. After the carry to the retirement year (v6.30), the buckets hold today's holdings at inflation and nothing for the
contributions, while the two shares are each taken over that smaller total.

| Plan (probe `p2`, BASE, $0 slider) | Accrual (face) | Opening buckets* | Traditional + Roth share |
|---|---|---|---|
| Example (retires 2029) | $102,600 | $1,626,709 | 0.8584 + 0.2100 = **1.068** |
| Example, both born six years later, retiring 2035 | $307,800 | $1,904,214 | **1.205** |
| Example, both born twelve years later, retiring 2041 | $513,000 | $2,179,511 | **1.342** |
| `otherIra` fixture (holdings 20% of the example's) | $102,600 | $325,342 | **1.342** |
| `capBinds` fixture (holdings 10%) | $102,600 | $162,671 | **1.684** |

\* after the pre-retirement one-time rows (v6.35: $28,000 on the 2035 plan, $68,000 on the 2041 plan; none on the others) and the carry.

The register's 1.068 and 1.274 were measured at v6.29, before v6.30's carry; at v6.42 the example reproduces 1.068 and the
twelve-years-out plan reads 1.342. The two fixtures were not in the register.

**What the share error does, measured.** The register left the share half *"undetermined"*. On the example the buckets' Traditional
notional (buckets × share) is $1,396,367 against the true $1,387,700 at retirement, and the Roth notional is exact ($341,609): the
inflated share roughly offsets the missing balance, so the RMDs were about right and the **balance** was short. Measured (prototype
`p643a` against v6.42):

| Plan, $0 slider unless noted | End balance v6.42 → fix | Runs out | Lifetime tax, today's $ (MC schedule) |
|---|---|---|---|
| Example | $1,833,424 → $2,066,038 | never | $180,578 → $180,515 |
| Example, $70K slider | $1,833,236 → $2,067,608 | never | $201,203 → $200,652 |
| Example retiring 2035 | $2,171,627 → $2,869,720 | never | $202,083 → $201,703 |
| Example retiring 2041 | $2,368,058 → $3,531,926 | never | $218,855 → $217,291 |
| `band` fixture | $0 → $0 | 2052 → 2053 | $136,183 → $140,338 |
| `capBinds` fixture | $0 → $0 | 2031 → 2033 | $15,427 → $18,795 |
| `otherIra` fixture, $70K | $1,050,201 → $1,286,621 | never | $193,832 → $198,290 |

Tax moves both ways and by little on most plans; the balance moves on every plan still contributing. All 22 households at both slider
settings are in `s643/out_v642.jsonl` / `out_p643a.jsonl`.

**Engine D is not alone.** What Breaks (L12946) and Backtest (L12715) both start from `PORTFOLIO.household` less the pre-retirement
one-time rows (v6.35), with no accrual. The register named What Breaks; Backtest is found at this scope. On the example that is $102,600
at face, $94,608 in today's dollars (÷ 1.0844728, the carry to 2029), on a $1,647,000 start: 5.7%.

**What the documents say, against the code.**
- METHODOLOGY's *Contribution accrual (v5.10)* says the accrual seeds *"the Withdrawal schedule … and What-Breaks"* and is *"added, per
  bucket"*, and counts *"nine consumer sites"*. What is false is the balance: the accrual has reached the Withdrawal schedule since v5.10
  only through the shares (so its RMDs and the ordinary part of its draws), and What Breaks only through its tax (Engine A's, then the
  Monte Carlo's schedule from v6.36) — never as money to spend. The census counts eight calls (§2).
- My Data's accrual readout (L15216): *"added to retirement-start balances in the Roth, Taxes, IRMAA, and Withdrawal projections"* —
  untrue of the Withdrawal balance.
- The Field Manual says *"today's balances reach retirement at inflation (planned contributions at their face value)"* of *"every tax
  engine"* — true of Engines A–C; silent on Engine D. The Withdrawal tab says *"the schedule starts from today's balances carried to
  {year}"* — true, which is the defect.
- The Withdrawal tab's *Holdings, by sleeve* card (L10953) prints *"Starting Traditional $1288K / Roth $315K"* on the example: today's
  holdings plus the contributions at face, uncarried — neither today's holdings ($1,185K / $315K) nor the schedule's opening.

### 0.2 · D-70 reproduces

The married example switched to Single in a probe, its holdings and Other accounts left `owner: "B"` (as My Data's Save & Apply leaves
them — `buildPortfolio` rewrites only stream and pension owners on a single plan, L14101, L14117, L14178): `retireStartBalances` puts
$206,000 of Traditional ($199,000 RMD-bearing) and $115,000 of Roth under spouse B, and Engines A–D take no RMD for spouse B on a single
plan. Against the same plan with every owner A (v6.42):

*Corrected at the build:* the draft gave spouse B's Traditional here as $218,600 ($211,600 RMD-bearing). That is the married
example's figure, which includes spouse B's planned contributions; on a single plan no contribution accrues to spouse B, and the figure is
$206,000 ($199,000). t107 D-1 pins the corrected figure. The RMD and tax rows below were probed on the single plan and stand.

| | Owners left B | Owners A | |
|---|---|---|---|
| Withdrawal lifetime RMDs, $0 slider | $262,395 | $305,824 | −$43,429 |
| Taxes-tab lifetime tax (MC schedule, today's $), $0 | $155,610 | $159,263 | −$3,653 |
| Roth tab, Engine A, $70K: lifetime tax + IRMAA | $152,112 | $168,115 | −$16,003 |
| Roth tab, estate after heir income tax | $1,830,314 | $1,827,171 | +$3,143 |

Optimistic, as registered. With the fix the two plans are **identical** on every figure probed (v6.42 + D-70 alone, and with D-64), and
Ask AI already describes such money as the one person's (`aiPlanFacts`, L2914), so the engines come to agree with it.

### 0.3 · One choke point

`retireStartBalances` is the only engine-side reader of a holding's or an Other account's owner (census of `owner`: 9 reads inside it; the
rest are My Data, the loader's back-fill, `aiPlanFacts`, streams and the pension, which `getPensionOwner` already makes single-safe).
Engines A, B and C and the Roth ladder read it through `carryStartBalances`; Engine D reads it directly. The accrual enters there too
(`contribAccrual`, called nowhere else), and its parts are on the return since v6.30 (`accTradA/B`, `accRothA/B`). So D-70 is one rule
inside it, and D-64 is a change to how Engine D, What Breaks and Backtest use what it already returns.

### 0.4 · What else moves

Engine D's draws reach every tax engine through `withdrawalPlanSeries`: the Taxes tab (Engine B), the IRMAA tab (Engine C), the Roth
tab's strategy engine (Engine A), and the Monte Carlo's tax schedule (`mcIncomeTaxSchedule`), which both Monte Carlo engines, What Breaks
and the Income tab's tax card read. Through the Monte Carlo's results it reaches the Dashboard, Grade, Ranking, Guardrails, Stress and Ask
AI's success rates. The changes are small (the tax table above), but they are not zero, so:
- **MC parity is not 10/10 for this release:** `mc`, `extMC` and `stress` differ (measured, §2) by the schedule's change. `t2` needs an
  intended-difference entry for the pair, as v5.14 and v6.20 had.
- **The Roth tab's best cell moves on some plans** (probe `p3`, the tab's own grid and objectives). On the default objective (*max estate
  after heir income tax*) it moves on three of the 21 plans measured (the example and 20 others; unchanged on the example; re-measured at the final build, the same moves — the draft counted 20, before the single plan with rows under B was added): `otherIra` ($140K → $150K a year),
  `selfEmployedFloor` ($130K → $140K) and the plan retiring 2041 (UNDER IRMAA → $200K). On *min lifetime tax + IRMAA* it moves on six: the
  example ($10K → $0; the two cells $459 apart) and the two home-move fixtures that equal it here, `band`, `stateProgressive` and `rmd73`. Engine A's own balances already carry the
  accrual; only its draw series changes. That is D-68's territory, reported and not changed.

The Monte Carlo is otherwise untouched: it starts from today's household and adds contributions quarter by quarter, with growth. It is
not the same money as the accrual: it also adds HSA contributions (L3095), which the accrual excludes by the v5.10 rule.

### 0.5 · Three edges the prototype does not handle (found by the review)

1. **A pre-retirement one-time row larger than today's money.** Engine D charges the row (gain pool, then buckets, floored at zero)
   *before* the contributions arrive, so the part above today's money is never charged. Harmless at v6.42 (the contributions were not in
   the buckets); with the fix, on a `capBinds`-shaped plan with a $250,000 row in 2028, about $79K is never charged and the buckets open
   at $102,600. The Monte Carlo spends the row from one total that includes the contributions. → DD-6.
2. **Spouse B retiring after A.** `contribAccrual` runs B's contributions to B's own retirement year, but Engine D starts at A's. With
   `retireYearB` 2034 on the example the accrual is $123,600, $21,000 of it for 2030–2034, all of it opening in 2029 and growing from then:
   the optimistic direction. Engines A–C already treat their balances this way. → DD-7. (Related, pre-existing: the Monte Carlo tab's
   *"from {retireYear} onward the model is drawdown-only (no salary or contributions)"*, L12377, is false when B retires later.)
3. **Bucket weights that do not sum to 1.** `contribBucketWeights` normalises a set allocation, but its fallback is `bucketActuals` as
   stored, which the loader renormalises only below 0.95, over buckets 1–4. With {.1, .3, .57, 0} the shares sum to 1.031 on the
   prototype; with a backup row in a bucket outside 1–4, 1.188. → the fallback becomes the opening buckets' own mix (§1.1).

The prototype also runs its block on every plan; the scope requires it not to run when there is no accrual (§1.1). Measured by the
review: a plan with every contribution at 0 is **not** bit-identical to v6.42 on the prototype (`rothFrac` 0.20999999999999996 against
0.21). The §2 suite run used that prototype; see the note there.

## 1 · What changes (the recommended shape: DD-1 (a) to DD-9 (a))

### 1.1 · Engine D's opening balances carry the contributions (D-64)

After the pre-retirement one-time rows and the carry (both unchanged), and **only when there is an accrual** (`accT !== 0 || accR !== 0`;
otherwise nothing runs, so the plan is bit-identical to v6.42):
- the accrual — Traditional and Roth, at face value (the v5.10 rule, v6.30's DU-7 (a)), never below 0 — is added to the buckets, split by
  the contribution mix when one is set (`contribBucketWeights`, normalised), else by the opening buckets' own mix (each bucket ÷ their
  total; that is today's mix on a clean plan and sums to 1 by construction), else, if the buckets are empty, to bucket 1 (DD-1);
- with DD-7 (a), spouse B's part stops at A's retirement year for this purpose (B's contributions after it are left out of Engine D's
  opening; disclosed);
- with DD-6 (a), any part of a pre-retirement one-time row that today's money could not cover is then charged pro rata against the
  buckets, contributions included;
- the shares are taken over the new total: Traditional share × buckets = the holdings' Traditional at retirement + the Traditional
  accrual; Roth likewise; spouse B's part of the Traditional (`_fracB`, which splits the RMD) = B's carried holdings' Traditional + B's
  accrual, over the Traditional total (at v6.42, a ratio of uncarried amounts).

On the example, by hand: carry 1.0844728 (2026 → 2029, BASE); buckets $1,500,000 × 1.0844728 + $102,600 = **$1,729,309**; Traditional
$1,185,000 × 1.0844728 + $102,600 = $1,387,700, share **0.802459**; Roth $341,609, share **0.197541**; sum 1 (every holding there is
split). The prototype prints the same to the dollar and to six places.

**The invariant this gives** (§3 §B): Engine D's opening Traditional — buckets × share, plus the Priority-1 pool's ordinary part — equals
Engine C's carried opening Traditional less the Traditional part of the D-44 bucket charge, to the cent; the Roth likewise, with the
pool's Other-account Roth (`othRoth`, carried) added; and the two shares sum to at most 1. (The first draft said "at most the holdings'
own split fraction"; false — contributions raise the split part, and the review measured 0.431 against a 0.395 bound on an unsplit plan.)

### 1.2 · What Breaks and Backtest start from the same money (D-64, DD-2)

Both projectors run in today's dollars from the retirement year. They start from **max(0, today's household + the accrual in today's
dollars − the pre-retirement one-time rows)** — the accrual deflated by the carry factor, as What Breaks already deflates a fixed pension;
the order inside the max is DD-6 (a)'s. One module-level helper gives the figure to both tabs, so it is testable at the engine (OPERATIONS
§M) and the two tabs cannot drift apart. With DD-7 (a) it takes B's contributions to A's retirement year, as Engine D does. Their asset
weights stay today's mix (§4).

### 1.3 · A single plan's money is the one person's (D-70, DD-3)

Inside `retireStartBalances`, when the plan is single, every holding and Other account counts as spouse A's, whatever owner it stores.
The stored owner is not changed, so a plan switched back to married keeps its split. One rule, one site: it reaches Engines A–D, the Roth
ladder and its RMD cards. Married plans are unchanged. The `aiPlanFacts` header comment that describes D-70 (L2900–2902) is updated.

### 1.4 · The copy

- **Withdrawal tab.**
  - The units note (L10867): *"the schedule starts from today's balances carried to {year} at that inflation"* gains *"plus the
    contributions planned before then, at their face value"*; the D-44 sentence beside it (L10866) is reworded for DD-6 (a).
  - The *Holdings, by sleeve* card (L10953) shows the schedule's own opening Traditional and Roth at the retirement year and says they are
    in that year's dollars (DD-8 (a)).
- **Backtest**, *Why the survival rate is high* (L12867): the start names the planned contributions when there are any.
- **What Breaks**, its basis line (L13088, *"… of today's portfolio"*): the same.
- **My Data**: the accrual readout (L15216) lists the Withdrawal schedule, What Breaks and Backtest, and drops *"The Monte Carlo … is
  unchanged"* in favour of what is true (it models the same contributions quarter by quarter, with growth, and HSA too). The contribution-
  split notes (the *Contrib split %* tooltip, L14708; *WHERE CONTRIBUTIONS LAND*, L15251–15253) say the split now also places the
  contributions in the Withdrawal schedule's opening, not only the Monte Carlo's.
- **Monte Carlo tab**: L12377's *"drawdown-only (no salary or contributions)"* — corrected for a spouse retiring later (it is false today).
- **Field Manual**: the Withdrawal Strategy entry (*"this schedule, Backtest and What Breaks start from today's holdings less those
  rows"*) and the units sentence (*"every tax engine … planned contributions at their face value"*) cover all four starting points and
  DD-6/DD-7's rules; §13 a v6.43 note (what was wrong, measured on the example and a plan retiring later; that tax, IRMAA, the Monte
  Carlo's figures and the Roth tab's best cell can move); the four version sites. The v6.30 and v6.35 §13 notes are history and unchanged.
- **METHODOLOGY**: *Contribution accrual* made true (eight calls; the consumer list re-derived), a v6.43 section with the measurements,
  DD-6's and DD-7's rules, and D-70's rule beside the ownership note.

### 1.5 · The registers

MissingFeatures **D-64 closed** (wider than registered: Backtest; the share past 1.6 on small-holdings plans; the sleeve card) and **D-70
closed**. Filed under DD-9 (a): Engines A–C front-load a later-retiring spouse's contributions (DD-7's other half); a single plan's streams
stored under B are dropped (`streamsMonthlyAt`); the Monte Carlo adds spouse B's contributions on a single plan restored from a backup
(`spouseBMonthly`, L3096, not gated on `single`).

## 2 · Site census (v6.42, by AST)

**The source** (`census.cjs`; `strhits.cjs` for strings — it executes its pattern and splits `DOCS_HTML` into sentences):

| Question | Answer |
|---|---|
| Calls of `retireStartBalances` | 8: Engine C (L6223), Engine D (L6454), Engine B (L7132), the Roth solve (L7561), the ladder (L11075, L11278), the strategy table (L11632), the CURRENT row (L11782) |
| Calls of `contribAccrual` | 1, inside `retireStartBalances` |
| Engine-side reads of a holding's or Other account's `owner` | `retireStartBalances` only (9 reads); the rest are My Data, the loader, `aiPlanFacts`, streams, the pension |
| Starts from `PORTFOLIO.household` | both Monte Carlo engines (with contributions, unchanged); Backtest (L12715); What Breaks (L12946) |
| Divides spending by `PORTFOLIO.household` (today's money as the base) | the Income tab's implied SWR (L9245), the Social Security tab's % SWR (L9803), the Dashboard's draw sentence (L12292) — today's basis, out of scope (§4) |
| Engine D's bucket seed | L6492–6495; shares L6555–6556; `_fracB` L6463; the one-time charge L6568–6573; `_opening` L6579 |
| Copy naming the start or the accrual's reach | L10866, L10867, L10953 (Withdrawal); L12867 (Backtest); L13088 (What Breaks); L12377 (Monte Carlo); L14708, L15216, L15251–15253 (My Data); the Field Manual's Withdrawal Strategy entry and units sentence; METHODOLOGY *Contribution accrual* |

**The suite** — measured, not inferred. The prototype `p643b` (D-64 + D-70 as first drafted: no guard, no DD-6 or DD-7, `bucketActuals`
fallback) was installed as the v6.42 leg of a copy of the packaged v6.42 run folder and the whole suite run, except the three browser
suites (`t45`, `t47`, `t48`: they read the built page, not rebuilt for this). Every red is listed. ⚠ **Because the prototype has no guard,
a red that is a bit-identity check on a plan with no contributions may go green in the build; every other red will stay.** The build
re-measures.

**Result (log `s643/proto_suite.log`): GRAND 10,817 passed, 66 failed** — 63 app checks in 16 suite runs (12 suites), 3 tooling (`domdiff`). Every
v6.41-leg run was green, as it must be. No suite died.

| Suite (v6.42 leg = the prototype) | Red | What it holds, and what the build does |
|---|---|---|
| `parity` (`t2 compare`) | 3 | `mc`, `extMC`, `stress` differ — the Monte Carlo pays the changed tax schedule. An intended-difference entry for `v642 → v643`, each key attributed (§0.4) |
| `t19` | 3 | its "mixed pool" lifetime-MAGI pins (engine = its ledger, but the pinned literal moved). Re-derive from the ledger at v6.43, history kept |
| `t40` | 8 | Engine D's lifetime ordinary draw and RMD (A1, A3), Engine B/C RMD (A3, B3), and four federal-tax pins against its oracle (E1–E4) — E1–E4 print the oracle's figure to the dollar here, so the build must read what else they compare before re-pinning |
| `t42` | 2 | the married case's lifetime draws and the Monte Carlo's planned path |
| `t58` | 1 | North Carolina's lifetime-draw pin |
| `t71` ×3 legs (plain, `-spend617`, `-table620`) | 4 + 3 + 3 | **its independent Engine D oracle (`v608`) does not model the accrual** — up to $2,796 a year apart. The oracle is extended to carry the contributions into the buckets (independently of the app, from the holdings and `contribAccrual`'s rule), then must reproduce both legs; D-4's cap figure re-derived |
| `t72` ×3 legs | 10 + 9 + 9 | the same for its `v609` oracle (Roth money under Other accounts), plus its A-3 RMD and B-2 gain pins |
| `t94` | 2 | D-2/D-3 pinned Engine A ≠ Engine C on the single example; on the prototype the two now agree ($12,080). Re-measure; D-68 note |
| `t98` | 2 | C-1b/C-1c, the D-44 opening state by hand: the buckets now carry the accrual. Re-derive with DD-6 |
| `t100` | 2 | What Breaks' estimate on the example ($8,048 → $8,026 a year) and the rendered figure. Re-pin |
| `t103` | 1 | F-1, bit-identity to v6.41's module — runs only in a v641 → v642 folder; prints a skip in a v642 → v643 folder. **Not a re-gate** |
| `t106` | 1 | E-3, every tab's text identical to v6.41 — the same: a v641 → v642-folder check. **Not a re-gate** |
| `domdiff` (tooling) | 3 | the Withdrawal, Taxes and IRMAA tables move. Re-point to `v642 → v643` with an arm bounding the moving tables, as v6.28/v6.29 did |

So 61 app checks to re-gate in 10 suites (63 less the two folder-specific ones), plus `domdiff`'s 3, and two Engine D oracles (`t71`, `t72`) to extend. That is the bulk of the build after the
engine change itself. The browser suites were not run; `t45`'s layout checks read no engine figure, but the Withdrawal tab's text moves,
so they run at the build as always.

`vercensus.cjs` and the usual registration (`v643`) are on top of this, as every release.

## 3 · Tests

New suite **`t107_opening_balances.mjs`**, both legs; the v6.42 leg pins each defect as `[KNOWN DEFECT 2026-11-03, D-64 — flips at v6.43]`
or `[…, D-70 …]`.

- **§A, the source by AST.** Engine D's buckets take the accrual from `retireStartBalances`' `acc*` fields (`contribAccrual` still called
  once); the bucket split reads `contribBucketWeights` with the opening-mix fallback; the block is guarded on the accrual; What Breaks and
  Backtest take their start from the one helper; `retireStartBalances` reads the plan's single flag before any owner test; no other
  engine-side owner read.
- **§B, the extinction invariant.** On every fixture household, the example and the example retiring 2035 and 2041, a fixture with an
  **unsplit** holding (new — no fixture holds one, so the invariant would otherwise pass without testing it), one with B retiring after A,
  one with a one-time row larger than today's money, at $0 / $70K / $250K and BASE / BULL: §1.1's invariant to the cent, and the shares
  summing to at most 1.
- **§C, hand pins.** The example: opening buckets $1,729,309, shares 0.802459 / 0.197541, typed in the suite from the holdings, the
  contributions and the carry (recomputed from the scenario table, `units_v630.mjs`'s way); spouse B's RMD share; the 2041 plan; DD-6's and
  DD-7's cases by hand.
- **§D, D-70.** A single plan with every row stored under B equals the same plan with owners A — Engines A–D, the ladder's RMD cards, the
  Monte Carlo's schedule, What Breaks' tax — bit for bit.
- **§E, nothing else moves.** Married and single plans with **no planned contributions**, and plans already retired, bit-identical to
  v6.42's module (when the run folder holds it) across Engines A–D, the bridge, the schedule and both seeded Monte Carlo engines.
- **§F, What Breaks and Backtest.** The helper against hand figures (the example: $1,741,608); the rendered start on both tabs.
- **§G, the copy.** Every §1.4 site rendered on the example (contributions) and a retired plan (none), the sleeve card's figures against
  `_opening`; the Field Manual's entries and §13 note; METHODOLOGY (current leg).

Plus: the re-gates in §2, each with its reason; `t2`'s intended-difference entry for `v642 → v643` (`mc`, `extMC`, `stress`, and any key
the build finds, each attributed); the boundary census row **`single_b_owned`** (ON when a single plan holds a row stored under B; the
example is clear — the defect was invisible on it, OPERATIONS §K1). Controls `qa/tools/controls_v643_opening.py`: revert each piece
separately (the buckets without the accrual; the shares over the old base; `_fracB` uncarried; the guard removed; the weight fallback;
DD-6's charge; DD-7's cap; What Breaks only; Backtest only; the single rule); each must fire.

## 4 · Out of scope (recorded)

- **The three `household`-based rates** (§2): the Income tab's implied SWR, the Social Security tab's % SWR and the Dashboard's draw
  sentence divide retirement spending by today's money. They read no engine and do not move. Same class (the start without the
  contributions); today's basis is a defensible reading for a rate, so they are recorded, not changed.
- **What Breaks' and Backtest's asset weights** stay today's mix; with the contributions in, the true mix drifts toward the contribution
  allocation, as the Monte Carlo models. Small.
- **A holding with no Traditional/Roth split** (`trad + roth < balance`) leaves the shares below 1, by design (D-69's reading: taxable
  money). Unchanged; now tested (§3 §B).
- **The Roth tab's strategy engine** (D-68) is not touched; its best cell can move because its draw series does (§0.4).
- **The Monte Carlo's HSA contributions** stay in the Monte Carlo only, by the v5.10 rule.
- **A stored bucket mix that does not sum to 1** (`bucketActuals`, possible only from a hand-edited or old backup) leaves Engine D's
  shares summing to more or less than 1 even with no contributions. Found at the build; not this release's defect. t107 §B states its
  invariant over the stored mix's own sum, so it neither hides nor trips on it. Recorded, not changed.

## 5 · Decisions for Steve

**DD-1 · Where the contributions go among Engine D's four buckets (cash, bonds, equities, hedges).**
- **(a) By your contribution mix (My Data's *Contrib split %*), as the Monte Carlo already does; with no mix set, by today's mix.**
  *Recommended:* the Withdrawal schedule and the Monte Carlo then start from the same mix. On the example the contributions go 30% bonds /
  70% equities rather than today's 10 / 30 / 60. *The trade-off:* from v6.43, changing *Contrib split %* moves the Withdrawal schedule, the
  Taxes and IRMAA tabs and possibly the Roth tab's best cell (through the bridge); through v6.42 it moved only the Monte Carlo.
- (b) Always by today's mix. Simpler; the split keeps affecting the Monte Carlo only.

**DD-2 · What Breaks and Backtest.**
- **(a) Both start from today's holdings plus the planned contributions (in today's dollars), through one shared helper.** *Recommended.*
- (b) What Breaks only, as registered; Backtest says it leaves them out.
- (c) Neither; both tabs say so.

**DD-3 · D-70's shape.**
- **(a) In the engines: on a single plan every account counts as yours, whatever owner it stores; nothing stored changes.** *Recommended:*
  one place, every tab, and a plan switched back to married gets its split back.
- (b) Rewrite the stored owners to you at Save & Apply and on load, as My Data already does for income streams and the pension.
- (c) Both.

**DD-4 · Version and order.**
- **(a) This is v6.43 if it ships before the IRS publishes the 2027 figures; the tax release becomes v6.44. If the IRS publishes
  mid-build, the tax release goes first, as at v6.42.** *Recommended.*
- (b) Hold this until after the tax release.

**DD-5 · Telling users their figures moved.**
- **(a) The Field Manual's release note only, as v6.30 and v6.36 did.** *Recommended:* nothing a user stored changes; every figure is
  recomputed on load.
- (b) A one-time notice on the Withdrawal tab for plans with contributions.

**DD-6 · A one-time expense before retirement that is bigger than the money you have today.**
- **(a) Charge it in full: what today's money cannot cover comes out of the contributions too.** *Recommended:* the whole expense is paid,
  as the Monte Carlo pays it.
- (b) Keep v6.35's order (today's money only) and say that any excess is not charged. With the contributions now in the opening balance,
  the excess would simply vanish.

**DD-7 · A spouse who retires after the other.**
- **(a) The Withdrawal schedule, What Breaks and Backtest count the later spouse's contributions only up to the first retirement; the
  rest are left out, and the tabs say so.** *Recommended:* the conservative direction. Today the later contributions would sit in the
  opening balance and earn returns for years before they are made. The tax engines keep their current treatment (the contributions in from
  the start), filed as a new item.
- (b) Count them all from the start, as the tax engines do; disclosed.
- (c) Add them in the years they are made. Most accurate; a larger change to Engine D, What Breaks and Backtest.

**DD-8 · The Withdrawal tab's "Holdings, by sleeve" card.** It prints *"Starting Traditional $1288K / Roth $315K"* on the example —
today's holdings plus the contributions, not grown, which matches nothing else on the tab.
- **(a) Show the schedule's own opening at retirement ($1,388K / $342K on the example), labelled as that year's dollars.** *Recommended.*
- (b) Show today's holdings plus the contributions, labelled as such.

**DD-9 · Three related things found here.**
- **(a) File them, not fix them now:** the tax engines front-load a later spouse's contributions (DD-7); on a single plan, income streams
  stored under spouse B are dropped; and the Monte Carlo adds spouse B's contributions on a single plan restored from a backup. All three
  are reachable only in narrow cases (the last two only from a backup not saved through My Data). *Recommended.*
- (b) Fold them into this release.

## 6 · Review

One independent reader (2026-11-03), given the source, this scope's draft and the prototype, not the probes' conclusions; findings in
`s643/REVIEW_D64_D70.md` (session-only). **2 must-fix, 10 should-fix, 7 nits; all checked against the source and taken.** It reproduced
every load-bearing figure: the buckets before and after, both shares, the What Breaks start, the four share sums, D-70's RMDs and the
two plans' identity, the eight calls and the owner census.

- **Must-fix.** §1.1's invariant was false (the "holdings' own fraction" bound) and §3 §B would have tested it on no fixture that could
  break it — restated, and an unsplit fixture added. The *Holdings, by sleeve* card was missing — now §0.1, §1.4, DD-8.
- **Should-fix.** The one-time excess (DD-6), B's later contributions (DD-7), the guard missing from the prototype and its effect on the
  §2 suite run (noted there), weights that need not sum to 1 (the fallback rule), My Data's and the Monte Carlo tab's copy, the three
  `household`-based rates (§4), the list of what else moves (§0.4), DD-2's overstatement (the Monte Carlo is not the same money: HSA),
  missing decisions (DD-6 to DD-9 and DD-1's trade-off), and §3 §D's impossible bit-identity claim (now §E, no-contribution plans).
- **Nits.** §3 §B's cases now carry one-time rows, so the invariant is stated net of the D-44 charge and with the pool's Roth; the owner
  read count (9, not 7); §0.1's "false since v5.10" narrowed to the balance; What Breaks' anchor (L13088); the `aiPlanFacts` comment; a
  negative contribution (the accrual clamped at 0); the edge cases it found clean (an empty target bucket, Roth contributions, a bonus, B
  retiring before A, a retired plan).

## 7 · Build record (v6.43, 2026-11-03)

**Decisions.** Steve, 2026-11-03: *"all recommended"* — DD-1 to DD-9 all (a). No decision was reopened. DD-4: no IRS TY2027 publication
was found on 2026-11-03, so this is v6.43 and the tax release v6.44 (its scope's tenth renumbering box).

**7.1 · What was built.** §1 as written, with these differences from the draft:
- The contribution mix is read through a new `contribAllocationWeights` (the set mix, normalised, or null); `contribBucketWeights` keeps
  its Monte Carlo fallback unchanged (`t107` E-2), and Engine D falls back to the opening buckets' own mix, then cash.
- The helper is `retireStartTodayParts` / `retireStartToday`, with `retireStartNote` giving both tabs the same words.
- DD-7's disclosure: a helper `laterBLeftOut` says when a later spouse's contributions are left out, and the three tabs and the Monte Carlo
  tab's exception print only then (the build review's findings 6–8).
- The guard runs on a contribution of either kind (§7.3, finding 1).

**7.2 · The suite census, measured.** §2 named ten suites to re-gate from a prototype with no copy changes and no guard. The build's first
full run (browser suites skipped) was GRAND 10,868 passed, 86 failed: the ten named suites, plus checks §2 could not see in eight (six of them suites it did not name at all) — `t8` (a constructor
regex window), `t81` E-5/E-8 (Backtest and What Breaks on the example), `t91` C-13 and `t92` B-8d (the sleeve card and What Breaks' copy),
`t98` C-6–C-6f (the copy), `t100` C-8, `t105` C-1b and `t106` D-1/D-4 (the §13 note order and the version sites). `t103` F-1 and `t106` E-3
skipped in the v642 → v643 folder as §2 said. `t71` D-4's cap no longer binds in 2035 on the example (the buckets leave $273,185); D-4b now
holds the binding cap in the years it binds. Every re-gate is listed in the CHANGELOG.

**7.3 · The build review** (an agent that had not seen the build; the workspace diff and the built modules; 2026-11-03). **2 must-fix,
3 should-fix, 3 notes.** Each checked against the source or by my own probe, and taken:
1. *Must-fix — the shares stayed wrong on a plan already retired whose spouse still contributes.* The guard read the capped accrual,
   which is 0 there, while the shares from `retireStartBalances` counted spouse B's later contributions. Reproduced: retired 2026, B at
   $2,000 a month to 2029 / 2032 / 2036 — shares 1.048 / 1.096 / 1.160 on v6.42 and the first v6.43 build; 1.000 after the fix. The
   guard now also runs when `retireStartBalances` counted a contribution (`_accRaw`); `t107` §B's `retiredLaterB`, A-4, control K14.
2. *Must-fix — control K3 could not run* (its target ended in a `}` on the next line in the source). Fixed; every target counted once.
3. *Should-fix — DD-6's remainder.* Engine D never draws the pool's IRA, annuity or HSA for a pre-retirement row, so a row larger than
   the after-tax money and the holdings together is partly uncharged there, while What Breaks and Backtest charge the whole household.
   Reproduced: holdings cut to 10% ($150,000), a $300,000 row in 2028 — Engine D opens with $136,644, the helper's start × the carry is
   $99,347 (about $37,000 apart; the same on v6.42). **Disclosed and filed (MissingFeatures D-74), not changed**: drawing an IRA or annuity
   for the row raises how that draw is taxed, a decision this scope did not put to Steve. §13 and METHODOLOGY say so.
4. *Should-fix — the release notes understated What Breaks and Backtest.* §13 and METHODOLOGY now give their moves.
5. *Should-fix — §3's "What Breaks only" control was missing.* K13 added (it can fire only on A-5: the rendered text names the note, not the
   figure, which `t92` and `t98` read).
6–8. *Notes* — DD-7 not disclosed on What Breaks and Backtest; the units note and the spouse-B clauses printed where they did not apply;
   the Monte Carlo's *"until 2034"* meant through 2033. All three fixed (`t107` F-10, F-11, F-13, F-14; control K15).
The review reproduced $1,729,309, the shares, `_fracB` and $1,741,608 by hand, found no other engine-side owner reader, and confirmed the
Field Manual's "about 107%" and "about $230,000". It could not reproduce METHODOLOGY's lifetime-tax figures with its own deflation; I
re-measured them from Engine B's rows deflated by the plan's dollar factor: $180,578 → $180,515 ($0) and $201,203 → $200,652 ($70,000), as
written.

**7.4 · Measured again at the final build.** The Roth tab's best cell on 21 plans (the draft said 20; a single plan with rows stored under B
was added to the probe after): the same three moves on the default objective and six on the lowest-tax one.

**7.5 · Counts and controls.** From the packaged copies (a fresh clone of `80a48ee` with `github/` laid over it; `mk_runfolder.sh v642 v643`): GRAND **11,553 passed,
0 failed** — 11,426 app checks across 105 app suites (6,279 current-leg, 4,664 on v6.42, 235 + 238 in the attribution runs, parity 10/10
with `mc`, `extMC`, `stress` intended), tooling 127. `smoke_built` 22 of 22 on the packaged page. `controls_v643_opening.py` on a copy of
that folder: 16 of 16. Source `0709eb9a…` · built `a8b1a139…` (built twice, byte-identical). The candidate the review read
(`ea62a8d0…` / `96cb548f…`) was not shipped.
