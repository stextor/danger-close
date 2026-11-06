# SCOPE — D-77: SSA's spousal benefit, paid by every projection

☑ **RETIRED — FULFILLED AT v6.47 (2026-11-05).** Steve: *"Let's continue with your recommendations"* — DL-1 to DL-7 (a) (§5) — and, on
DL-5, *"D-77 now as v6.47"* (the IRS had published its 2027 figures; CMS and the §402(g) limit had not). Reviewed once, independently,
before the decisions (§6); the build reviewed once more (§7). Scoped on v6.46 (source `c3c74790…`, repo `845cf57`; the pool, the clone and
the live site verified identical on 2026-11-05 at the v6.46 upload check). Repo-only (`docs/`); it ships in the release package that builds it.

Steve, 2026-11-05: *"D-77"*.

**In one paragraph.** When one spouse's own Social Security is less than half the other's benefit at full retirement age, SSA pays the
smaller earner a top-up on the other's record — the *excess spouse's benefit* — once the other has filed. No projection in the app pays it.
Every engine pays each spouse their own planned benefit and nothing more, so a couple where one spouse has little or no record of their own
reads short by up to half the other's benefit a month for every year both are alive. The Social Security tab says so in a warning, for spouse B
only (F-36). The size is not small: on the example with spouse B's benefit removed, SSA would pay her **about $1,386 a month from January 2031**
(today's dollars; the prototype, which counted her months to 67 a month long, paid $1,375 — §0.4), and with it the 30-year Monte Carlo's success above $500K moves **77% → 85%** and the Withdrawal tab ends **$1,480,888 →
$2,008,585**. The example itself does not reach it (half of spouse A's $3,300 is $1,650, below spouse B's own $1,800), and neither do the 17
fixture households. Several suites do build a spouse with no benefit (§0.5), but none compares what any engine pays that spouse with what SSA
would — which is why nothing has caught it. The recommended fix is one module-level helper, written from SSA's
rules, that every engine adds to the Social Security it already pays, in both directions; the Social Security tab shows it, and the warning
is replaced by the figure.

---

## 0 · Premise (verified at v6.46, not assumed)

### 0.1 · What SSA pays (primary sources, read 2026-11-05)

| Rule | Source |
|---|---|
| A spouse's benefit is at most one-half of the worker's full-retirement-age amount (PIA) | ssa.gov Benefits Planner, *Benefits for your spouse* (applying7); POMS RS 00615.201 B (*"The unreduced spouse's benefit is 50% of the NH's unreduced PIA"*) |
| The worker must be receiving retirement (or disability) benefits, and the spouse must be 62 or older (or caring for a child) | ssa.gov applying7 (*"you are receiving retirement or disability benefits"*); ssa.gov blog 2024-07-11 (*"Your spouse must be receiving benefits for you to get benefits on their work record"*, *"62 years of age or older"*); the divorced-spouse exception does not apply to a current spouse |
| A spouse entitled to their own retirement benefit is paid their own first; the spouse's benefit is the **excess** — the unreduced spouse's benefit less their own PIA — and nothing when their own PIA is at least half the worker's | ssa.gov applying7 (*"we will pay that amount first … an additional amount … so that the combination of benefits equals that higher amount"*); POMS RS 00615.250 (*"Subtract the unreduced RIB PIA from the Unreduced spouse benefit. This is the excess spouse benefit"*; no entitlement when own PIA *"equals or exceeds one-half"*) |
| The excess is reduced **25/36 of 1% a month** for each of the first 36 months before full retirement age and **5/12 of 1%** for each month beyond: `× (144 − m)/144`, or `× (180 − (m − 36))/240` past 36 | POMS RS 00615.201 B; SSA Handbook §724; ssa.gov/oact/quickcalc/spouse.html (*"as little as 32.5 percent of the worker's primary insurance amount"* at 62) |
| Deemed filing: anyone born on or after 2 January 1954 who files for one benefit is filed for both | POMS GN 00204.035; ssa.gov applying7 |
| Delayed credits on the spouse's own benefit do not raise the total: the combined amount is computed without them, and the spouse's part is the combined amount less the own benefit with credits — that is, the excess less the delayed-credit amount | POMS RS 00615.694 A (*"combined payment amount is computed without consideration of the DRCs"*; the DRCs *"are then added to the RIB and that amount is subtracted"*) |
| A spouse's benefit itself earns no delayed credits: they accrue to an *old-age* (own) benefit | 42 U.S.C. §402(w) (the increase is to the old-age insurance benefit); POMS RS 00615.694 describes DRCs on the RIB only. *(The statute's page was not fetched this session — the build reads it before the helper is written.)* |
| A person reaches an age on the day before the birthday, so someone born on the 1st reaches 67 in the month before their birth month | 20 CFR 404.102 (*"You reach a particular age on the day before your birthday"*) |
| The Government Pension Offset no longer applies, from January 2024 | ssa.gov FAQ KA-02041 (the Social Security Fairness Act; *"December 2023 is the last month that the WEP and GPO will apply"*) |

**Consequences for the model, each from the rows above.** The top-up for spouse S on worker W's record is
`max(0, ½ × PIA_W − PIA_S)`, reduced by S's months before 67 at the month it starts; it starts at the **later of S's own claim and W's claim**
(deemed filing makes S's claim the spousal filing; W must have filed); it never earns delayed credits; if S's own benefit carries delayed
credits, the delayed-credit amount offsets it (in the app, where a spouse has one claim age, that amount is `own − PIA_S` when the claim is after
67 and nothing otherwise; floored at 0). Months before 67 are counted by SSA's attained-age rule (born on the 1st: 67 is reached a month early). The worker's own claim age does not change it (it is a share of the PIA,
not of the worker's benefit). It ends at the worker's death, where the existing survivor rule takes over.

**The survivor rule needs no change** (shown, not assumed). Every engine pays the survivor the larger of the two claimed benefits. With the
top-up folded into S's figure, S's total is at most `max(own with credits, ½ × PIA_W)`; W's own claimed benefit is at least 70% of PIA_W
(claimed at 62) — so the larger of the two is the same with or without the top-up, whichever spouse dies first, **for every whole month or
quarter after the death**. In the death's own period an engine that annualises a partial year or quarter (Engines B and D's death year, the
Monte Carlo's death quarter, What Breaks' `_bigSS`) can pick a slightly different maximum, once — not measured; bounded by one partial period's top-up.

### 0.2 · No projection pays it (the census, §2)

Every engine takes each spouse's Social Security from `getSSA()` / `getSSB()` — the planned amount at the planned age — from
`PLAN_TIMELINE.ssA_date` / `ssB_date`. Neither reads the other spouse's record. Measured on v6.46 (the example with spouse B's benefit
removed, BASE, $70,000): Engine B's `ssB_y` is $0 in every year; Engine D's schedule pays spouse B nothing. METHODOLOGY says *"spousal
top-ups not modeled"* (the claiming-grid paragraph, and the v6.46 section); the Field Manual's claiming-grid entry says the same; the Social
Security tab's warning says it for spouse B.

### 0.3 · Who it reaches

Any married plan in which one spouse's PIA is below half the other's: a spouse who did not work for pay, worked part-time or under a
non-covered pension (GPO no longer cuts it), or stopped early. On the app's own inputs: the guided setup or My Data with a spouse's benefit at
$0 or small; Start Fresh (both spouses `planned: 0`); a backup with an empty spouse block (the loader inserts `planned: 0, isDefault: true` —
a placeholder for a figure the plan never carried, which DL-7 asks about). **A $0 is ambiguous:** My Data and the guided setup save a blank
amount as 0, so "no record of her own" and "not entered" look the same, except for the loader's flagged placeholder. **The example is not reached** (½ × $3,300 =
$1,650 < $1,800), **nor are the 17 fixture households** (measured: the top-up is $0 for both spouses on each), **nor a single plan**.

### 0.4 · The prototype (scratch copy of v6.46, measured 2026-11-05)

A helper, `spousalTopUp(who)`, written from §0.1, added to the Social Security paid in five engines, seven paths (both Monte Carlo engines — their
planned paths and their runs — and Engines B, C and D; not yet Engine A, the Roth ladder, Backtest or What Breaks). PIA from v6.46's `ssFraOf` (the
age-67 table figure, else the planned amount carried back to 67). **It counted months to 67 from the birth month, not by 20 CFR 404.102** —
the example's spouses are born on the 1st, so for spouse B it counted one month too many (the review found it; §6). The top-up it computed,
checked by hand, and the figure SSA's rule gives, which the build pays:

| Plan (the example with …) | Prototype | By SSA's rule | Working |
|---|---|---|---|
| spouse B's benefit removed (claim age 63, the field's value) | B $1,375/mo from Jan 2031 | **B $1,386/mo from Jan 2031** | ½ × 3,300 − 0 = 1,650; starts when A files (Jan 2031); B (born 1 Jan 1966) reaches 67 in Dec 2032: 23 months early, × 121/144 = 1,386.46 (the prototype counted 24: × 120/144) |
| … and B's claim age 67 | B $1,650/mo from Jan 2033 | **the same** | starts at B's own filing (Jan 2033, after her FRA month): unreduced |
| B's PIA $1,000, claiming $750 at 63 | B $542/mo from Jan 2031 | **B $546/mo from Jan 2031** | ½ × 3,300 − 1,000 = 650; × 121/144 = 546.18 |
| B's PIA $1,000, claiming $1,240 at 70 | B $410/mo from Jan 2036 | **the same** | 650, unreduced, less B's $240 of delayed credits (RS 00615.694); B's total $1,650 = ½ × 3,300 |
| spouse A's benefit removed | A $900/mo from Jan 2031 | **the same** | ½ × 1,800 − 0; A files Jan 2031, after B (Jan 2029), past A's FRA month (Dec 2030): unreduced |
| the example as it is | none | none | ½ × 3,300 = 1,650 < 1,800 |

What it moves — measured with the prototype's month count, so the first and third rows read about $11 and $4 a month low against the build (BASE, $70,000 slider; lifetime tax in today's dollars from Engine B; Engine D's end balance; Monte Carlo seeded, 4,000 runs;
v6.46 → prototype):

| Plan | Lifetime tax | Withdrawal tab, end | 30-yr success >$500K / >$800K | 6-yr >$800K |
|---|---|---|---|---|
| the example | $200,652 → **unchanged** | $2,067,608 → **unchanged** | 85% / 75% → **unchanged** | 99.25% → **unchanged** |
| B's benefit removed | $178,140 → $197,759 | $1,480,888 → $2,008,585 | 77% / 61% → 85% / 74% | 99.08% → 99.13% |
| … B's claim age 67 | $178,140 → $196,594 | $1,480,888 → $2,009,141 | 77% / 61% → 84% / 73% | 99.08% → 99.08% |
| B's PIA $1,000 at 63 | $191,285 → $198,901 | $1,813,975 → $2,026,723 | 83% / 70% → 85% / 74% | 99.17% → 99.20% |
| B's PIA $1,000 at 70 | $186,983 → $189,955 | $1,760,472 → $1,854,717 | 81% / 68% → 82% / 69% | 99.08% → 99.08% |
| A's benefit removed | $148,408 → $161,023 | $304,477 → $633,345 | 36% / 19% → 56% / 36% | 99.08% → 99.10% |

Tax rises because the top-up is Social Security, taxed by the §86 worksheet like the rest. **Direction: optimistic against v6.46 — on
purpose.** v6.46 is conservative here by an amount SSA pays as of right; the design default (*make the plan look slightly worse*) is for an
assumption that must be picked, and paying the top-up to a spouse whose record is known to be small is not one: SSA pays it to a current spouse aged 62 or more once the other is receiving benefits (ssa.gov, *Do you qualify for Social Security spouse's benefits?*, 2024-07-11). Whether a **$0** means a small record or a figure never
entered *is* an assumption — DL-7.

### 0.5 · The suite against the prototype (full `runsuite.sh v645 v646`, the prototype as the v6.46 leg, 2026-11-05)

**GRAND 11,795 passed, 6 failed; MC parity 10/10** — none an engine regression: five are a suite's own household reaching the top-up, and
one is a count:

| Suite | Red | Why |
|---|---|---|
| `t25` F-B-2, G-2 | 2 | its §F fixture (t27's: spouse A $587.50 a month, spouse B **$0**) now pays spouse B a top-up, so Engine C's includible Social Security is above the oracle's, which counts own benefits only. The fixture is there for its §86 band; the re-gate either gives B a benefit of her own at half A's, or adds the top-up to the oracle |
| `t43` C-4 (×3: the run and its two attribution runs) | 3 | Engine A against the §86 worksheet on 40 cells. The worksheet is fed Engine B's `ssTotal`, which now carries spouse B's top-up; Engine A's cells run on a `P` the suite builds by hand (`ssA: ss/12`, `ssB: 0`, no top-up field — `t43` L128–L132). **It will not clear when Engine A carries the top-up** (the review corrected this scope's first reading): Engine A gets the top-up only from its three builders, so `t43` needs its own re-gate — the worksheet given own benefits only, or the suite's `P` given the top-up |
| `t110` A-3 | 1 | not a household: it counts `ssFraOf` calls (7), and the helper adds three |

**What this does not cover:** the prototype left out Engine A, the Roth ladder, Backtest, What Breaks and every display. Suites built on
those may move at the build — `t110` §C and §E certainly (its no-benefit shapes reach a top-up once the tab shows it), and any of the 35 suites
that build their own Social Security shapes (an AST census of `qa/`: `t6`, `t13`, `t16`–`t20`, `t25`, `t27`–`t29`, `t38`, `t41`–`t44`, `t59`,
`t68`, `t85`, `t86`, `t89`–`t93`, `t96`, `t97`, `t101`–`t105`, `t107`, `t108`, `t110`). The build runs the full suite before its first
re-gate and lists every one.

### 0.6 · The class, and the registers (OPERATIONS §K2)

D-77 (MissingFeatures) is this item; F-36 (UsabilityFlaws) is the warning's one-sidedness and its two neighbours — on a plan where spouse B
has no benefit the claiming grid's *"the model's best cell"* names B at 62 (every B column ties at $0), and with both spouses at $0 the
survivor sentence says spouse A has the larger benefit. Modelling the top-up in both directions removes the warning's reason to exist (DL-3).
**It does not close the grid neighbour** (the review): the top-up starts at the later of the two filings, so for a spouse with no benefit every
claim age up to the other's filing gives the same top-up, and those cells still tie — the first, B at 62, still wins. DL-3 asks. No other
register item is about the spousal benefit (searched: MissingFeatures, UsabilityFlaws, ARCHITECTUREIssues, the FlawsToFix files, METHODOLOGY;
`docs/FlawsToFix-v5_10_2-Phase2C.md` mentions it in passing, to say a survivor finding does not concern it).

---

## 1 · What changes (the recommended shape: DL-1 to DL-7 (a))

### 1.1 · One rule, module-level (DL-1 (a))

`spousalTopUpFor({ piaW, piaS, ownS, dobS, ymS, ymW })` — pure, from §0.1: the excess `½ × piaW − piaS` (0 if not positive), reduced for
S's months before 67 at `max(ymS, ymW)` — 67 reached in the month before the birth month for a birthday on the 1st (20 CFR 404.102) — less
S's delayed-credit amount (`ownS − piaS` when S's claim is after 67 and that is positive; nothing otherwise), floored at 0, rounded to the
dollar; returns `{ monthly, ym }`. And `spousalTopUp(who)`, the plan's: PIAs from `ssFraOf`, `ownS` from `getSSA()` / `getSSB()`, the dates
from `PLAN_TIMELINE` (whose dates of birth carry the day); 0 on a single plan, when either spouse's date is missing, and on the loader's
placeholder block (DL-7 (a)). The Social Security tab calls the pure one at its slider ages.

### 1.2 · Every projection pays it, in both directions (DL-1 (a))

At each site that pays a spouse's Social Security (§2, *money*), the top-up is added to that spouse's own figure **by that site's own month
rule** — from its month where the site pays from the claim month (the Monte Carlo's `mcPaidShare`, Engines B and D, the Roth ladder), from
its year where the site pays whole years (Engine C, Backtest) — so each engine's existing convention holds and only the amount changes. COLA,
the trust-fund depletion cut, the §86 worksheet, IRMAA's MAGI and the state Social Security rules all apply to it as to the rest, because it
reaches them as Social Security. Engine A takes it as two new fields on its `P` (`topA`, `topB`, each `{ monthly, yr, mo }`), passed by its
three builders; **a `P` without them pays no top-up** (about 35 suites and tools build Engine A's `P` by hand — `t15`, `t43` among them — and
must not break or turn NaN, the `asOfYr` trap again). The survivor rule is unchanged (§0.1). The Taxes, Withdrawal and IRMAA tables' Social
Security columns (*"SS (gross benefit)"*, Taxes tab L12270–L12271) show it inside the spouse's figure — still a gross benefit; the tab's
note says what it includes.

### 1.3 · The spouse's claim date (DL-2 (a))

The spousal filing is the spouse's own claim date — the claim age My Data holds for that spouse, which it shows and saves whether or not the
spouse has a benefit of their own. A spouse with none files at that age; the top-up starts then or when the other spouse files, whichever is
later. (Through v6.46 that age moved nothing for a spouse with no benefit; from this release it is money, so the Social Security tab's line
says which age it used — DL-3.) D-56's placeholder claim age (63, on the loader's inserted spouse-B block) pays nothing under DL-7 (a).

### 1.4 · The Social Security tab (DL-3 (a))

- Each spouse's card shows the top-up as its own line under the spouse's own benefit — *"+ $1,386/mo spousal benefit on {nA}'s record from Jan
  2031 (when {nA} files)"* — at the sliders' ages, and the card's total; the combined income, the shortfall card and the draw table include it.
- The *"SPOUSAL BENEFIT NOT MODELED"* warning is replaced by one sentence stating the modelled top-up, for whichever spouse receives it — F-36
  closed — and nothing when neither does.
- The claiming grid and the breakeven cards include it at each cell's ages (it depends on both ages, through its start date). Three pieces of
  copy shown on every plan, the example included, change (a parser search of the tab's text for *spousal*; the review found the second and
  third): the grid's *"Honest limits"* line (L10217) loses *"spousal top-up benefits … not modeled"*; the breakeven note (L10128,
  *"spousal top-up benefits … are not modeled and can favor earlier claiming"*) is rewritten; and the line under spouse B's table (L10021,
  *"{nB}'s spousal benefit (50% of {nA}'s FRA …) is above / at or below … so SSA would pay the spousal amount instead"*) — spouse-B-only and
  inexact (SSA pays own plus excess) — is replaced by the rule, for whichever spouse it applies to.
- The v6.46 sentence for a spouse with no benefit (*"This plan holds no Social Security benefit for {nB}, so every projection pays {nB} no
  Social Security."*) becomes false where a top-up is paid; it reads *"… no Social Security of {nB}'s own; {nB}'s spousal benefit on {nA}'s
  record is shown above"* when one is, and as v6.46 when none is.
- F-36's survivor-sentence neighbour (both spouses at $0) is fixed in passing: the sentence is not shown when neither has a benefit.
- F-36's grid neighbour (a no-benefit spouse's columns tie up to the other's filing, and the first — 62 — wins) is not closed by the top-up
  (§0.6); DL-3 asks whether to add a tie rule.

### 1.5 · Every other figure that adds up Social Security (DL-4 (a))

The Income tab (its gap, its phases, its events), the Dashboard's income floor, the Grade tab's Income Floor and the Ranking tab's income
replacement, the Survivor tab's joint figure, the Stress cards and Ask AI's live context (its total income, L8095–L8098) count the top-up as
Social Security from its month; the Exit Plan's Social Security lines (dates only today) gain the top-up's start; the Events list gains *"{nB}'s spousal benefit begins"* in the month it starts. One rule: *Social Security* means own
benefit plus top-up, everywhere a figure is summed.

### 1.6 · The copy

Field Manual: the claiming-grid entry's *"spousal top-up benefits not modeled"* replaced; a §13 note (v6.47); the Social Security entry gains
the rule in one paragraph, and says the retirement earnings test is not modelled (§4). METHODOLOGY: a new section, *SSA's spousal benefit (v6.47)*, with §0.1's sources, and the claiming-grid paragraph's
*"spousal top-ups not modeled"* corrected. The version sites.

### 1.7 · The registers

MissingFeatures **D-77 closed**; UsabilityFlaws **F-36 closed** for the warning and the survivor sentence, its grid neighbour closed or left
open by DL-3; D-56 notes that its claim-age-63 placeholder pays no top-up (DL-7); anything this release finds and does not fix, filed.

---

## 2 · Site census (v6.46, by AST — `census2.cjs`, every `getSSA()` / `getSSB()` / `ssFraOf()` call and every `.ssA_date` / `.ssB_date` / `P.ssA…` read, by function and tab)

**Money — each pays a spouse's Social Security into a projection (11 engine paths):**

| Engine | Where (v6.46) | Month rule |
|---|---|---|
| Monte Carlo, 6-year — planned path | `runMonteCarlo` L3242, L3244 | `mcPaidShare` from the claim month |
| Monte Carlo, 6-year — runs | `runMonteCarlo` L3303, L3305 | `mcPaidShare` |
| Monte Carlo, 30-year — planned path | `runExtendedMC` L3422, L3424 | `mcPaidShare` |
| Monte Carlo, 30-year — runs (with the survivor rule) | `runExtendedMC` L3519–L3529 (`ssHousehold`, L3526–L3529) | `mcPaidShare` |
| Engine A (Roth strategies) | `runRothStrategies` `annualSSA` / `annualSSB` L5553–L5554, fed by three builders (L7740 `rothSolve`, L11837, L11987) | claim month |
| Engine C (IRMAA) | `computeIrmaaPlan` L6282–L6286, `annualSSA/B` L6349–L6350 | whole year from the claim year |
| Engine D (Withdrawal) | `computeWithdrawalPlan` L6550–L6556, `annualSSA/B` L6622–L6623, its survivor lines L6772–L6775 | claim month |
| Engine B (Taxes; and the Monte Carlo's tax schedule and What Breaks' tax through it) | `computeTaxPlan` L7210–L7216, `annualSSA/B` L7300–L7301 | claim month |
| The Roth ladder (component) | Roth tab L11324–L11333 (partial months), L11363–L11368 | claim month |
| Backtest (component) | L12917–L12938, L12964 | whole year |
| What Breaks (component) | L13155–L13175 (the survivor's larger check, L13162), its guaranteed income L13193, L13252 | claim month |

**Figures that sum Social Security (display):** the Income tab (L9174–L9502: the gap, its phases, its events list); the Social Security tab
(L9571–L10176: the cards, combined income, shortfall, draw table, survivor card and grid, warning, breakeven, claiming grid — the seven
`ssFraOf` reads v6.46 unified); the Grade tab (L10230); the Ranking tab (L10562); the Dashboard (L12502, L12547); the Survivor tab
(L13337–L13414); the Stress tab (L13705); Ask AI's live context (L8095–L8098 sum the amounts; L8107–L8108 dates); the Taxes, Withdrawal and
IRMAA tables, which print the engines' Social Security (Taxes L12270–L12271). Dates only, no amount: the Exit Plan (L8686–L8782),
`computePlanEvents` (L2653–L2785), `buildRetireOptions` (L1115), `stressPlanFacts` and `runStressTests` (through `runExtendedMC`). The review's
own census (callers of `ssCola`, `ssDepletionFactor`, `mcPaidShare`, `runRothStrategies`, `ssTabClaimAge`, and every direct `.ssA` / `.ssB`
read) found no money path missing.

---

## 3 · Tests

### 3.1 · `t111_spousal.mjs` (new, both legs)

- **§A, the source by AST.** One helper pair, module-level; every money site of §2 reads the plan's top-up (a census — a new site that pays
  Social Security without it turns red: **the extinction check**); the SS tab calls the pure helper; no `0.5 *` / `/ 2` on a PIA outside it;
  the v6.46 warning's text gone. The v6.46 leg pins the absence as `[KNOWN DEFECT 2026-11-05, D-77 — flips at v6.47]`.
- **§B, the helper against an oracle written in the suite from §0.1** (not from the helper), on a grid sized to run in seconds: PIA pairs
  $0–$4,000 by $250 each side (289), each spouse's claim at every whole age 62–70 plus two odd months (11 × 11), dates of birth on the 1st
  and the 15th of January and July, own claimed early, at 67 and at 70 — about 420,000 cases; every month 62–70 on a smaller PIA set; the
  POMS RS 00615.250 example ($1,000 unreduced, $400 PIA → $600 excess); 32.5% of the PIA at 62 with no own benefit; the 20 CFR 404.102
  month on a birthday on the 1st. (RS 00615.694's own example — a RIB both reduced and carrying credits — cannot be stated with one claim
  age; the delayed-credit offset is checked on claims after 67.)
- **§C, the twin-plan invariant (the release's guarantee).** Plan 1: spouse B with no benefit, claiming at the month A claims, at or after
  67 — a top-up of exactly ½ × PIA_A, unreduced, from A's month. Plan 2: spouse B with her own benefit of ½ × PIA_A at 67 from the same month —
  no top-up. **Every projection must be bit-identical between the two**: both Monte Carlo engines (planned paths and seeded runs), Engines A,
  B, C and D, the Monte Carlo's tax schedule, What Breaks' tax, and the rendered Roth ladder, Backtest and What Breaks. An engine that misses
  the top-up — or taxes it as anything but Social Security — breaks the twin. Run on the example's dates and two others (A younger; a July
  birth month), and in the mirror (A with none). Built with an even PIA_A, so ½ × PIA_A is a whole dollar.
  **Twin 2 (the start date and the reduction; the review: twin 1 cannot see them):** Plan 1, spouse B with no benefit claiming **before** A
  (B at 63, A at 67) — a reduced top-up from A's month. Plan 2, spouse B with a table whose age-67 figure is ½ × PIA_A (so no top-up) and
  whose figure at her age in A's month is that reduced amount, claimed in A's month. Every projection bit-identical again. A site that pays
  from B's own claim date instead of the top-up's, or applies no reduction, breaks it.
- **§D, nothing moves where nothing is owed.** The example and every fixture household (no top-up, §0.3) bit-identical to v6.46 across the
  engines of §C, and their rendered tabs identical to v6.46's text **except** the Social Security tab's three copy changes of §1.4 (the
  comparison masks exactly those, each bound to one hit a side), the version sites and the Field Manual (v6.46's modules and bundle in the
  run folder).
- **§E, hand pins.** §0.4's five top-ups by SSA's rule ($1,386, $1,650, $546, $410, $900) and their start months; Engine B's 2031 `ssB_y` on
  the first (1,386 × 12 × the year's dollar factor); Engine D's first top-up year; the Monte Carlo's planned path in the start quarter by exactly the top-up × the paid share.
- **§F, the Social Security tab** on §0.4's shapes, against oracles from the plan's fields at the sliders' ages (t110's harness: each plan
  loaded from storage into a fresh mount): each card's own and top-up lines, combined income, the shortfall, the replaced warning, the
  replaced sentence; a cell of the claiming grid; F-36's neighbours. **§G, the other figures of §1.5** on the first shape, and **§H, the copy.**

### 3.2 · Re-gates (to be confirmed by the full run at the build)

`t110` (A-3's count; its noSSB, zeroTable, missingB, smallA and noSSA shapes reach a top-up: its oracles, the sentence and the warning change
on the new leg); `t25` (§F's fixture); `t43` C-4 (§0.5: its hand-built `P`); `t29` (B-41 and C-d56-1 to C-d56-3 assert the
`spousal_warning` row §3.3 retires); every other suite the build's first full run turns red; `t2`'s parity stays 10/10 *with no intended difference* on its three fixtures (none reaches the top-up).

### 3.3 · Boundary census (§K1)

Row `spousal_topup` — ON when neither spouse's PIA is below half the other's (the example: ON — *"½ × A $1,650 ≤ B $1,800; ½ × B $900 ≤ A
$3,300"*), the boundary that hid D-77 for every fixture. `t29` B-row on the example; C-rows clearing it each way (B's benefit removed; A's).
v6.46's `spousal_warning` row is retired with the warning, or re-pointed to the new row.

### 3.4 · Controls

`qa/tools/controls_v647_spousal.py`: each money site's addition removed in turn (§A and §C must fire for each); the reduction factor's two
branches swapped; the start date taken as the spouse's own claim only (ignoring the worker's); the delayed-credit offset dropped; the top-up
taxed as an income stream rather than Social Security; the attained-age month dropped (birth month counted as written); the placeholder
rule dropped (DL-7); the tab's line removed; the warning restored; C0. Each site-removal control must fire twin 1 and twin 2 both.

---

## 4 · Out of scope (recorded)

- **The retirement earnings test** — a spouse claiming before 67 while working has benefits withheld. Not modelled for anyone's own benefit
  either; disclosed with this release.
- **Full retirement ages below 67** — the app fixes 67 for everyone (disclosed). For a spouse born 1955–1959 (FRA 66 and 2–10 months) the
  reduction months run a few long — conservative; but for a worker born then, the age-67 figure `ssFraOf` reads carries up to 10 months of
  delayed credits (up to about 6.7%), so ½ × PIA_W and the top-up run up to that much high — optimistic. Few plans starting in 2026 have a
  spouse under 70 born before 1960; disclosed both ways.
- **The family maximum** — *"generally … about 150 to 180 percent"* of the worker's full benefit (ssa.gov FAQ KA-02107); a worker at 100% and one spouse at 50% does not pass it. Children's benefits are not modelled.
- **Divorced spouses, any marriage-length condition, child-in-care spouse's benefits, disability, born before 2 January 1954 (restricted
  application).** None is an input the app has.
- **SSA's rounding** to the dime at each step; the model rounds the top-up to the dollar once.
- **The tab's claiming advice** — the grid scores each cell with the top-up; it does not search for strategies (e.g. a spouse filing early for
  their own benefit to start the spousal one) beyond the 81 cells.

---

## 5 · Decisions for Steve

**DL-1 · Model it?**
(a) **Recommended.** Every projection pays the top-up, in both directions, from one helper written from SSA's rules (§1.1–§1.2). It makes an
existing output — every figure built on Social Security — more correct for a mainstream couple, which is the product-boundary test's *build it*.
(b) Spouse B only (F-36 stays open, and a plan where spouse A is the one with no record stays short).
(c) Don't model it; keep the warning, extended to both spouses.

**DL-2 · When does a spouse with little or no benefit of their own file?**
(a) **Recommended.** At the claim age My Data holds for them (the field is shown and saved for every spouse, whatever the amount), the
top-up starting then or when the other spouse files, whichever is later. The tab says which age it used, and My Data says, when a spouse has
a top-up, that their claim age now sets it.
(b) Ignore the field for a spouse with no own benefit: always from the later of 67 and the other's filing (unreduced). Simple, but overrides a
field the user can set.
**Which is conservative: neither, cleanly.** On the example with spouse B's benefit removed (prototype, BASE, $70,000), claim age 63 under (a)
gives 30-year success 85% / 74%, the Withdrawal tab's end $2,008,585 and lifetime tax $197,759; (b)'s 67 gives 84% / 73%, $2,009,141 and
$196,594 — a smaller check sooner against a larger one later. (a) is recommended because it is the plan's own input, not because it is
the conservative one.

**DL-3 · The Social Security tab** (§1.4).
(a) **Recommended.** Show the top-up on each card as its own line, include it in every figure on the tab at the sliders' ages (the claiming
grid and breakeven too), replace the warning with the modelled figure and the three pieces of copy §1.4 names, and fix F-36's survivor
sentence. **And the grid's ties** (F-36's other neighbour, which the top-up does not close): when cells tie on the grid's score, name the
latest claim age among them as *"the model's best cell"*, and say the cells tie — a no-benefit spouse's top-up is the same at every claim age
up to the other's filing, so a later claim gives up nothing.
(b) As (a) without the tie rule: the grid keeps naming the first tied cell, and F-36's grid neighbour stays open.
(c) Show it on the cards and the totals only; leave the claiming grid and breakeven on own benefits, with their notes kept.

**DL-4 · Every other figure that sums Social Security** (§1.5).
(a) **Recommended.** All of them, and an Events item.
(b) The engines and the Social Security tab only; the Income, Dashboard, Grade, Ranking, Survivor and Stress figures say *"own benefits"*.

**DL-5 · Release number.**
(a) **Recommended.** This is **v6.47**, built now; the 2027 tax figures become **v6.48** (the TY2027 scope renumbered a fourteenth time), unless
the IRS publishes its 2027 figures before this build starts — then they go first and this is v6.48. (DT-7's 15 December holds.)
(b) Wait: the 2027 figures first as v6.47 whenever the IRS publishes; this after.
*Revised by Steve before the build (2026-11-05):* the IRS published its TY2027 revenue procedure (Rev. Proc. 2026-35) that day, which under
(a) would have put the 2027 figures first; but CMS's 2027 IRMAA figures and the 2027 §402(g) limit were not yet published, so the figures
could not ship complete. Steve: *"D-77 now as v6.47"* — this is v6.47, the 2027 figures v6.48; if CMS publishes while this build is far
from done, pause and ship the figures first (it did not arise). §7 records it.

**DL-6 · Size.** This is a larger release than v6.45 or v6.46: eleven engine paths, the Social Security tab's figures and about ten other
display sites, and one new suite with two twin-plan checks.
(a) **Recommended.** One release — splitting it leaves the tab and the engines disagreeing in between.
(b) Two: the engines and the Social Security tab first; the other displays (§1.5) next.

**DL-7 · A spouse whose benefit reads $0 — no record, or never entered?** (the review: this is an assumption, and this scope first treated it
as fact)
A $0 can mean a spouse with no record of their own — the case D-77 is mostly about — or a figure nobody entered: My Data and the guided
setup save a blank amount as 0, Start Fresh begins both spouses at 0, and the loader inserts a flagged placeholder (`isDefault: true`,
claim age 63) for a backup with no spouse-B block. Paying the top-up on a figure never entered adds up to half the other spouse's benefit a
month of income the plan never claimed — the optimistic direction.
(a) **Recommended.** No top-up on the loader's flagged placeholder (the app already tells the user it filled that block). Any amount a person
saved — My Data, the guided setup — is taken as entered, $0 included, and the top-up is paid on it; wherever one is paid, My Data and the
Social Security tab say it is paid **because {name}'s own benefit is entered as $X**, so a blank left by mistake is visible where it is
corrected. Optimistic only for a user who left a real benefit blank and does not read that line.
(b) Pay it only when the spouse's own benefit is above $0. Conservative, but a spouse with no record of their own — the commonest case —
gets nothing, which keeps D-77 open for exactly the couples it is about.
(c) Pay it on every $0, the placeholder included, and disclose it. The most optimistic.

---

## 6 · Review (2026-11-05)

One independent reviewer, read-only, no suite runs, who had not seen the scope's drafting. It reproduced every figure in §0.4 (all six rows
to the digit, by re-running the measurement on v6.46 and on the prototype), the five top-ups by hand, Engine B's 2031 figure (1,375 × 12 ×
1.144716 = 18,887.82), the no-top-up claim on the example and the 17 fixture households, the suite log, and every census line number. It
checked POMS RS 00615.250, RS 00615.694, GN 00204.035 and ssa.gov's spouse calculator page itself; four other pages timed out on its side
(the scope's author had fetched three of them — RS 00615.201, applying7, KA-02041 — and the 2024 blog; 42 U.S.C. §402(w) was fetched by
neither, and is marked so in §0.1). Findings, each checked and acted on:

1. **Must-fix — $0 treated as "no record", the loader's placeholder included, without a decision.** Real (`isDefault: true`, L4898). DL-7 added;
   §0.3 and §0.4's direction paragraph corrected.
2. **`t43` C-4 will not clear when Engine A carries the top-up** — its `P` is built by hand (L128–L132). §0.5 corrected; `t43` is a re-gate.
   And a `P` without the new fields must pay no top-up (§1.2).
3. **The twin plan could not see the start date or the reduction** (B claimed in A's month, at 67). Twin 2 added (§3.1 §C); the controls must
   fire both.
4. **§B's RS 00615.694 example contradicted the helper**, and §B's grid (370 million cases) could not run. The delayed-credit rule restated
   as POMS states it, the example dropped with the reason, the grid sized.
5. **§D (the example's tabs bit-identical) contradicted §1.4**, which changes copy shown on every plan; and the copy census missed two lines
   (L10128, L10021). §1.4 names all three; §D masks exactly them.
6. **The headline said no suite has a no-benefit spouse.** Several do (`t25`/`t27` §F, `t43`, `t110`, `t29` C-d56-1). Reworded.
7. **F-36's grid neighbour is not closed by the top-up.** §0.6, §1.4 and §1.7 corrected; DL-3 offers a tie rule.
8. **DL-2 did not say which option is conservative.** It is neither, cleanly; measured and said.
9. **The month count ignored SSA's attained-age rule** (born on the 1st: 67 a month early) — the prototype's $1,375 is $1,386 by SSA's rule,
   $542 is $546. Verified against 20 CFR 404.102 (fetched); the helper counts by it, §0.4 shows both, §E pins SSA's figures.
10. Notes, each acted on: the FRA-before-67 approximation is optimistic on the worker's side (§4, now two-sided); the survivor argument holds
    in whole periods, not in the death's own period (§0.1); census lines added (L3526–L3529, L6772–L6775, L13193, L13252, L11324–L11333) and
    the Taxes, Withdrawal and IRMAA tables named (§2, §1.2); count slips (five engines / seven paths; 11 paths; §0.5 / §0.6 order; `t110` A-3
    is a count, not a household; FlawsToFix Phase 2C mentions the benefit in passing); `t29` added to the re-gates.

**One note of the review's was itself wrong, and the scope keeps the site:** it listed Ask AI (L8095–L8108) as reading no Social Security
amount; L8095–L8098 sum `getSSA()`, `getSSB()` and the pension into `_aiTotalIncome`, which the live context sends. Ask AI stays in §1.5.

## 7 · Build record (v6.47, 2026-11-05)

Built on v6.46 (`c3c74790…`, repo `845cf57`) in a full clone. **DL-5 was revised by Steve before the build** (*"D-77 now as v6.47"*): the IRS
published its TY2027 revenue procedure (Rev. Proc. 2026-35) the same day, but CMS's 2027 IRMAA figures and the 2027 §402(g) limit were not
yet published, so the 2027 figures could not ship complete — this is v6.47 and they are v6.48 (the TY2027 scope renumbered a fourteenth time;
`package_check`'s OPEN entry rolled). Steve's condition — if CMS publishes while this build is far from done, pause and ship the figures first
— did not arise.

**Built as scoped.** §1.1's rule (`spousalTopUpFor`, `spousalTopUp`, with one guard `_spousalOff` for a single plan and the loader's
placeholder, after `ssFraOf`), and helpers for the displays (`spousalTopUpAtAges` — the tab's, at given ages — `spousalTopUpsAt`,
`spousalTopUpsSteady`, `spousalTopUpYear`, `spousalTopUpFields`, `spousalEligible`); every money path of §2 by its own month rule, Engine A
through `P.topA` / `P.topB` with its three builders spreading them (a `P` without them pays none — `t15`, `t43` and the other hand-built
`P`s pass unchanged); §1.4's tab (each card's line, the totals, the draw table, the modelled sentence in place of the warning for whichever
spouse it reaches, the three copy changes, the no-benefit sentence, the survivor sentence, the grid at each cell's ages and its tie rule);
§1.5's displays; My Data's line (DL-7 (a), DL-2 (a)); §1.6's copy; the four version sites; `t111` (both legs), the shared oracle
`qa/tools/spousal_oracle.mjs`, `controls_v647_spousal.py`; the census row `spousal_topup` (v6.46's `spousal_warning` re-pointed) with `t29`
B-41, C-d56-1 to -3 and the new C-d77-1; the re-gates; the registers (§1.7).

**Where the build departed from this scope — each recorded here.**
1. **The breakeven cards and the per-spouse benefit-by-age tables stay on each spouse's own record** (DL-3 (a) said *"the claiming grid and
   breakeven too"*). Each card compares two claim ages of one spouse's own benefit; the top-up depends on both spouses' ages and on the
   later filing, and earns no delayed credits, so it has no place in a one-spouse, own-record comparison. The grid — which scores both ages
   jointly — carries it, and the cards say so: spouse B's card's note (one of the three copy changes) on every plan, spouse A's breakeven note
   only where a top-up is owed (so the example's copy is unchanged).
2. **42 U.S.C. §402(w) was not read.** Its page's permission request timed out at the build. 20 CFR 404.313 was read instead and states the
   rule the helper needs: delayed credits increase *"your old-age benefit"* (§404.313(a), (d)) and *"We do not use your delayed retirement
   credits to increase the benefits of other family members"* (§404.313(e)(2)).
3. **The rule multiplies before it divides** (`excess × (144 − m) / 144`), so a top-up that is exactly a half-dollar is computed exactly and
   rounds up; `t111`'s oracle does the reduction in integers. Written that way after the oracle was drafted, before any run.
4. **§3.1 §E's Monte Carlo pin** (*"the planned path in the start quarter by exactly the top-up × the paid share"*) **is replaced** by the
   twins: the Monte Carlo's planned path also carries the Taxes tab's tax for the year, which the top-up moves, so no single quarter moves by
   exactly the top-up. Instead both Monte Carlo engines — the planned path and 300 seeded runs — are bit-identical across all seven twins.
5. **A display the census did not see.** Backtest's high-survival line (*"Social Security and the pension (≈ $51K/yr once both SS checks
   flow)"*) sums the tab's own `_ssA + _ssB`; §2's census, keyed to `getSSA()` / `getSSB()` reads, counted the read but not the sum. `t111`'s
   rendered twins found it ($51K where the twin with an own benefit read $71K); fixed. `t111` A-3 now counts the spousal additions per path,
   so a sum without one in a path that has one elsewhere is caught by the twins, and one removed is caught by A-3. And one display the census
   did see but §1.5 did not name: the trust-fund scenario's readout of each check (the Social Security tab's top panel) — included.
6. **"The Events list"** (§1.5) is the Income tab's household income-event list, which gains *"{name}'s spousal benefit begins"*. The Events
   tab's Social Security filing windows are unchanged: the spousal benefit needs no filing of its own (deemed filing), and the Exit Plan's
   line says when it starts.
7. **Engine D's Social Security is in the year's dollars**, as Engine B's (the scope's note *"no `_kY`"* described its sum, not its units);
   `t111` E-7 pins Engine D's 2031 figure equal to Engine B's.
8. **After a death the engines' "larger of the two checks" now sees the top-up inside the spouse's figure** (the Monte Carlo's runs and
   Engine D's survivor years take the larger of the two spouses' Social Security). This changes nothing while the worker's own check is at
   least 70% of their PIA — any claim from 62 at SSA's factors — because the spouse's own check and top-up together are at most half that
   PIA (or the spouse's own, when larger). Recorded in the code and METHODOLOGY; a plan whose entered planned amount is far below its own
   table (an inconsistent entry) could see a survivor figure that includes a top-up.
9. **`t111`'s controls' switches**: `T111_SECTIONS` runs only the named sections and `T111_CONTROLS_SKIP_DDOM` skips §D's rendered comparison
   (two thirds of a run) — for `controls_v647_spousal.py` only; `runsuite.sh` sets neither.
10. **§D renders fifteen tabs on the example and the seventeen fixture households** (the cards' text — the page's `.card` elements, so the
    header's Monte Carlo medians are outside it), against v6.46's dumped in a child process; the Social Security tab with exactly the three
    copy masks of §1.4, each bound to one hit a side.
11. **§3.1 §B's grid** is 289 PIA pairs × 11 claim months each side × 4 dates of birth × 3 own benefits = 419,628 cases; §B adds every month
    62–70 on four PIA pairs, two of them odd (the half-dollar), and 32.5% at 62 on a date of birth of 2 January (60 months: 62 throughout
    January, POMS RS 00201.001; 67 on 1 January, 20 CFR 404.102). **Owned:** B-4's first draft used a birthday on the 1st and January — 59
    months, $654, which is what SSA pays — and the build then "fixed" it to December 2027 on the wrong premise that someone born on the 1st is 62 in
    the month before; the build review found it (SSA pays someone born on the 1st or 2nd from the birth month at 62). The rule was right
    throughout; the test's input and comment were wrong. The review's finding also exposed **D-78** (filed): the app pays every claim at 62
    from the birth month, where SSA pays from the first month the claimant is 62 throughout — the month after, for anyone born after the 2nd.
12. **The born-on-the-1st month is granted only for a day the plan holds** (the build review). The guided setup saves a date of birth as
    `YYYY-06`, and a plan with none reads a fallback; both read as the 1st, which granted one fewer month of reduction to a day nobody entered
    (about 0.7% of the excess — optimistic). `_ssDobS` passes the day only when the plan's own field carries one. `t111` E-10.
13. **The build review's other fixes.** The tab's *"none is owed"* line was shown beside the loader's placeholder (a $0 spouse B against A's
    $3,300 — false); it now shows only where both spouses hold a benefit and neither is below half the other's (`t111` F-8). The modelled
    sentence's reason for *"none at these claim ages"* named delayed credits where the amount had only rounded to $0. *"It stops at the first
    death"* is said of SSA, and METHODOLOGY states where the engines' larger-of-two-checks rule can differ (a partial period after a death; an
    inconsistent entry) and that Backtest and the Roth ladder, which model no death, pay the top-up to the plan's end as they pay both own
    checks. The draw card's *"{name}'s check follows {name}'s slider in both columns"* now says the spousal part starts at the other's filing in
    each; the permanent-gain card says the spousal part lasts only while both are alive; the Taxes tab's *"with spousal"* label is not shown in
    widowed years. A seventh twin (2c: spouse A's top-up reduced and starting after A's own filing) closes the review's test gap, with control
    K30. G-3's Dashboard check reads the floor sentence, not a bare figure.
15. **Engine D's phase label** (the Withdrawal tab's colour) turned *"income-active"* at spouse A's filing year even when A has no benefit of
    their own and the top-up starts a year later — found by twin 2c, the only engine difference across the seven twins. It now turns at the
    year A's Social Security first pays. A label, not money.
16. **A harness race in `t45`, found by the packaged run.** `t45` failed eight checks in the packaged run, and in an earlier run on v6.46's
    page under the v6.47 tag: S-11's 360 px / UI SIZE 150% stream-plan case opened on the DATA LOAD screen, so every check after it measured an
    empty page. A probe reproduced it on both builds' pages (one load in six on v6.47's, one in nine on v6.46's): the harness writes the plan
    into storage while the app's no-data screen is mounted, and on some loads the two keys are gone after the reload (the cause — the page's
    first-run handling or the browser — not traced). The same script on v6.47's page passed 446 of 446 in a clean folder, and v6.46's page
    446 of 446. `t45`'s `open_plan` now writes, reloads and confirms the plan loaded, and on a miss writes and reloads again (up to four
    times); `t45` was then rerun alone in the packaged run folder with the fixed script (446 passed, 0 failed). Repo-only; no app code is involved.
14. **Not done from the review, recorded.** The Ranking tab's income replacement, the Survivor tab's joint figure and the trust-fund readout
    have no rendered value check; they are held by `t111` A-3's census (each path's spousal call counted). A future path that reads
    `incomeSources.ssX.planned` directly, not through `getSSA()` / `getSSB()`, would pass A-2's census.

**Re-gates.** `t1` (S-7: the Roth ladder's Social Security lines carry the top-up), `t6` (the shortfall's one rule now carries spouse B's top-up, gated by the single flag), `t25` §F and §G (their spouse B has no benefit of her own, so from v6.47 she is paid the top-up — the statute's oracle adds it; the fixture is unchanged), `t43` C-4 (Engine A's figure is the worksheet on what its hand-built P pays, which carries no spousal fields), `t101` (its plans reach a top-up — the reported plan's spouse A at $3,833 against spouse B's $1,800 — so its oracle adds it and §C's hand pins are restated: e.g. 24 × ($3,322 + $82) = $81,696), `t110` (the cards, totals, the replaced warning and sentence, A-3's count) and `t29` (B-41, C-d56-1 to -3 re-pointed to `spousal_topup`; C-d77-1 new)

**Measured** (BASE, $70,000 a year of conversions; against v6.46 `c3c74790`; Monte Carlo 4,000 seeded runs): §0.4's two shapes, final —
spouse B's benefit removed: lifetime tax $178,140 → $197,907, the Withdrawal tab's end $1,480,888 → $2,012,969, 30-year success 77% → 85%
(above $800,000 61% → 74%); spouse A's removed: end $304,477 → $633,345, success 36% → 56%. The prototype's figures (§0.4, $1,375) differ by
the 20 CFR 404.102 month the prototype lacked ($1,386).

**Suite.** Run from the packaged copies (a fresh clone of `845cf57` with `github/` laid over it; `mk_runfolder.sh v646 v647`; `runsuite.sh v646 v647`): **11,773 app checks across 109 app suites**, GRAND **11,893**, 0 failed, 0 DIED — after `t45`'s harness fix and its rerun alone in that folder (item 16; the first pass read 11,891 passed, 8 failed, all eight `t45`). Per-suite figures are on `TESTING.md`'s v6.47 line; `smoke_built` 22 of 22 on the packaged `index.html`.

**Controls.** `qa/tools/controls_v647_spousal.py` on a copy of that run folder: **31 of 31 as expected** (C0 silent; K1–K30 each fire their named checks), every file restored and hash-checked. In the first pass K1, K2 and K10 named checks that cannot see them (the 6-year Monte Carlo ends before the 2033 twins; Backtest's sums are not helper calls, so A-3 does not count them) while turning the other twins red; their lists were corrected and the three rerun.

**Build review.** The scope was reviewed once before Steve decided (scope §6: 1 must-fix, 5 further findings, notes). The build was reviewed by an agent that had not seen it, read-only, with no suite runs: **2 must-fix, 5 should-fix, 4 notes**, each checked and acted on (scope §7): the *"none is owed"* line beside the placeholder; *"it stops at the first death"* stated without its conditions (Backtest and the Roth ladder model no death); `t111` B-4's false premise (and from it D-78); a date of birth without its day read as the 1st; the draw cards' copy; the Taxes label in widowed years; a twin for spouse A's reduced top-up (2c, control K30) and a tighter Dashboard check; the note's reason for *"none"*; *"every tab"* in METHODOLOGY. Two it raised are recorded, not fixed: no rendered value check on the Ranking, Survivor and trust-fund figures (held by `t111` A-3), and a future path that reads the planned amount without `getSSA()`/`getSSB()` would pass A-2. It reproduced the five top-ups by hand, the lifetime tax and the ending balances from both builds' modules; it did not run the Monte Carlo.
