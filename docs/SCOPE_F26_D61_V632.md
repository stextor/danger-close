# SCOPE — F-26: claims the F-25 census did not reach · D-61: QCD eligibility after a death (target v6.32)

| Field | Value |
|---|---|
| Build scoped against | **v6.31** · `src/DangerClose.jsx` md5 `d729d028d26f4c5b73996099dae4fd2f` · built `index.html` `7a52c128fa0c77029a63114f4db320f8` · repo `7ebd0e7` (full clone) |
| Freshness (§A) | Pool source = manifest Current = clone = `d729d028…`, checked 2026-10-25 after the v6.31 upload: the 16 pool files byte-identical to the package and the clone; `package_check` post-upload 54 passed, 0 failed, 0 skipped; Pages serves `7a52c128…` |
| Register items | UsabilityFlaws **F-26** (filed v6.29; its token-count item addressed at v6.31) and **F-15b** (NIT, the Stress table's *"Success (>$1,500K)"*, folded in under DF-1). MissingFeatures **D-61** (filed v6.29). Files **F-27** (§0.8 — the example's sample briefing repeats the Stress tab's old figures; out of scope by v6.26's decision DC-3) |
| Version | **v6.32**, tag `v632` — free: `vercensus.cjs v632` over `qa/`, `qa/qa-baseline/`, `qa/tools/` reports 0 files, 0 ladder entries, 0 gated expressions; no `.py` suite names it; no `dom_entry_v632.jsx` in history |
| Status | **FULFILLED — shipped as v6.32 (2026-10-25).** Decisions answered 2026-10-25, all (a) (§5). Scope reviewed once (§6); the build reviewed once (§7), every finding taken. Retired at the ship: read it as the record of what was decided and built, not as open work |
| Measurements | Session-only probes, never shipped: `d61.mjs` / `d61row.mjs` against the v6.31 module and a prototype module (`v632p`: DF-7 (a) applied to Engines B and C, nothing else); `f26dom.mjs` rendering the Stress and Backtest tabs from the v6.31 DOM bundle. Run folder: the packaged v6.31 run folder |

Steve, 2026-10-25: *"I agree, write the scope for v6.32 (F-26 plus D-61), with the decisions laid out for you before I build anything."*

---

## 0 · Premise — verified against v6.31

Every claim below was read in the v6.31 source (line numbers are v6.31's) or rendered; string sites were found by an acorn walk over every
string literal, template element and JSX text (`strs.cjs`), identifier sites by `census.cjs`.

### 0.1 F-26 (a): the Stress tab's cards say things the engine does not do

The stress set is `runStressTests` (L3284–3371). Rendered on the example household, on the example made single, and on the example with the
two Social Security benefits swapped (`f26dom.mjs`):

**Scenario 3, LTC events (L12877).** *"{A} needs assisted living at 78 ($150–300K). {B} at 82 ($150–300K). Combined shock: $300K–$600K over
4–10 years."* What `runExtendedMC` does (L3178–3183): one charge per person, drawn uniformly from $150,000–$300,000 in today's dollars and
grown with the path's inflation, in June of the year A turns 78 and the year B turns 82 — only if that person is alive then, only inside the
30-year run, and **for a single plan only A's**. So:
- *"Combined shock … over 4–10 years"* is false: two one-quarter charges, not a cost spread over years; the gap between them is the plan's own
  (on the example (1966 + 82) − (1964 + 78) = 6 years), and the "4–10" has no source in the code.
- *"needs assisted living"* states a care need as fact; the model charges a cost.
- On the example made single the card still names **"Spouse B at 82"** — a person the plan does not have and the engine does not charge.

**Scenario 4, LTC marathon (L12886).** *"{A} 2 years, {B} 4 years"* — for a single plan the engine charges no B care (L3191, `!_single`); the
card still names Spouse B.

**Sequence card, the early-death half (L12908–12917).** The run is `spouseADies70` (L3323): A dies in A's 70th-birthday year, B dies at B's
plan-to age (mortality on, deterministic), and LTC shocks **are on**.
- *"{B} must sustain for 20+ years alone"* — on the example itself A dies in 2034 and B in 1966 + 87 = 2053: **19 years**, not 20+. The
  figure is typed; the plan's own number is computable.
- *"Survivor SS benefit = {A}'s FRA + DRCs accrued"* — the engine computes no FRA or delayed-retirement credit; after the first death the
  survivor keeps **the larger of the two claimed benefits** (L3159–3161, `Math.max(ssA_q, ssB_q)`). The v6.28 V-12 shape (assume A is the
  larger earner and dies first), on another tab.
- The income line *"survivor SS (${getSSA()}+) + pension …"* always prints **A's** benefit. With the two benefits swapped it rendered
  **$1,300** where the engine pays the survivor **$3,300**. The trailing "+" means nothing a reader can use.
- On the example made single the card reads *"Spouse A dies at 70 (2034): Spouse B must sustain for 20+ years alone"* and gives *"Spouse B's
  income after Spouse A's death"* — for a household of one.
- A plan whose spouse A is already past 70 at the as-of date gets a death year in the past; the engine then runs B alone from the first
  quarter (`calYear >= _dyA`), and the card announces a future death.
- The card does not say the run includes the LTC shocks.
- **If B's plan-to year comes before A's 70th birthday year, B dies first** — only A's death is overridden (`deathYearA`, L3325); B still dies at
  `dobB.year + lifeExpB` (L3081). Then A is the survivor, not B, and "B alone" is false; a naive "years alone" figure goes negative (the
  D-61 household B 1954 / A 1964 gives 2028 − 2034 = −6). Found by the review.
- The income line's total leaves out income streams, which the engine adds (`streamsMonthlyAt`, L3165), and prints today's dollars before
  the Social Security trust-fund cut the engine applies when that toggle is on (`ssDepletionFactor`, L3162).

**Three more sentences on the same cards** (found by the review): *"Limit of this model: one bounded early shock"* (L12880) — a couple gets two
charges; *"one SS check"* (L12886, and the Field Manual's Stress entry: *"one Social Security check has already stopped"*) — false during
A's two care years when A is the first to die, since care precedes each death; *"The worst timing"* (L12902) — an unchecked superlative.

**The same false claim on the Social Security tab** (found by the review). v6.28's V-12 fixed the survivor sentence above the claiming grid
(L9205), but the grid beneath it still assumes spouse A has the larger benefit: `survivorSelected = selectedBenefit` (L9016, *"if Spouse A
claimed at selected age"*), the *"CLAIM 62 / FRA / 70 … {B} gets /mo"* cells computed from `spouseAFRA` (L9210–9217), and *"At selected
age …: {B}'s survivor benefit = $…"* (L9222). When B's own benefit is the larger, the survivor keeps it — the engine's rule (L3161) — so
these cells understate what B keeps and name the wrong survivor amount.

**The comparison table's headers (L12799–12804).** *"Tech −40%, Yr 1"* — the forced crisis year is US stocks −35%, international −40%
(`SCENARIOS.crisis`, L1011), then a forced recession year; *"6-8% infl, 3yr"* — the stagflation regime is 6.5% (`SCENARIOS.stagflation`);
*"$150-300K × 2"* — ×1 for a single plan; *"2y+4y pre-death"* — 2y for a single plan. v6.29 corrected the two scenario cards from
`SCENARIOS` and missed these four headers. **F-15b**: the row label *"Success (>$1,500K)"* beside sibling labels in $M.

### 0.2 F-26 (b): the Roth tab's ladder starts at the target year; the engines convert from the selected one

`PLAN_TIMELINE.rothLadderStart = targetRetireYear` (L904). The Roth tab's ladder table, its heading *"ROTH CONVERSION STRATEGY — {start}–{end}"*
(L10890), its *"Total conversion (N yr)"* card (L10915), *"BRACKET UTILIZATION — {year}"* (L10955) and its RMD cards (L10780–10814) all read
`rothLadderStart`. The strategy comparison on the **same tab** runs Engine A from the **selected** retirement year (`retireYr: retireYear`,
L7112 and L11113), as Engines B and C do. The app opens on the target year (`useState(PLAN_TIMELINE.targetRetireYear)`, L6991), so the two
agree until the user selects *−1 YEAR* or *+1 YEAR* (`buildRetireOptions`, offsets −1/0/+1); then the ladder shows conversions in a year the
strategies do not convert in, or omits one they do. The Exit Plan (v6.29) and the Grade tab (v6.27, `t90` A-10) already use the selected
year; the Events tab's conversion item uses the target year and says so (L2444).

Two more readers of `rothLadderStart` (found by the review): **Ask AI's live context** (L7486) tells the model *"Roth conversions
{rothLadderStart}–{rothLadderEnd} … (the Roth slider these results ran at)"* — at ±1 year the results ran from the selected year, so this is
wrong **today**, whatever DF-3 decides. And **METHODOLOGY** L1688 and L1764 say the ladder keys the built-in work taper to *"the plan's own
retirement year (`rothLadderStart`)"*, which DF-3 (a) would make false.

### 0.3 F-26 (c): the Events tab's ACA status line prints one year's dates for every year

`computePlanEvents` item 10 (L2547–2560) prints *"open enrollment: Nov 1 – Jan 15 (coverage for {year})"*, *"open enrollment starts Nov 1"*
and *"next open enrollment: Nov 1"* for every year. Its instructions (L2559) already say the dates were checked for 2027 coverage and can
change. **Why it matters now:** a 2025 federal rule moved HealthCare.gov's close to December 15 from 2027 coverage; a secondary source
(read 2026-10-25) reports that provision vacated in *City of Columbus v. Kennedy* (D. Md., June 2026), the government's appeal pending, and
CMS confirming January 15, 2027 for HealthCare.gov states. So the window for 2028 coverage is genuinely unknown today. **Read at the primary source on 2026-10-25:** HealthCare.gov's glossary gives
*"The yearly period (November 1 – January 15) when people can enroll in a Marketplace health insurance plan"*, naming no coverage year — so
v6.31's live text (2027 coverage: Nov 1 – Jan 15) agrees with HealthCare.gov today; the court record was not read. The build re-reads both
before writing any date.

### 0.4 F-26 (d): the Backtest's "worst start year" is a typed world claim beside a computed one

L12348: *"1966 is generally considered the worst real start year in US history — stagflation gutted balanced portfolios for a decade."*
L12266 labels the row *"1966 — Stagflation decade (worst US start)"*; L12270 *"1982 — Start of secular bull (best case)"*. The same tab already
computes the plan's own worst start year from the app's 1928–2025 data (`worstSeq`, L12260; the *"Worst start year"* card, L12314). On the
three households rendered the card says **1966** — so the sentence agrees with this plan — but it is plan-dependent (the sweep runs this
plan's spending and mix), and *"generally considered"* and *"best case"* are claims the app does not check. Two more sites assume 1966 is this plan's worst (found by the review): the chart
heading *"Real balance path — 1966 retiree (the stress case)"* (L12371) and the Field Manual's Backtest entry, *"A 1966 real-balance chart
shows the worst-case grind."*

**And the card's own "worst" is ill-defined for a failing plan.** `worstSeq` (L12260) keeps the lowest real end balance with a strict `<`, so
when several starts deplete (all end at $0) it keeps the **earliest start year that depleted**, not the one that ran out soonest. Invisible on
the example (no start depletes; its card reads 1966, ending $1.21M real, rendered 2026-10-25 — the figure `t81` E-5 pins).

### 0.5 F-26 (e): the repo's README (the GitHub front page, pooled)

`README.md` (pool md5 `eec58396…`, unchanged since 2026-08-07). Statements false or stale against v6.31, each checked:
1. *"no data leaves your machine"* (tagline) — Ask AI sends a plan summary when used, and the page loads Google Fonts; v6.29 corrected the same
   in-app claim.
2. *"Other income streams … flowing through every engine"* — Backtest and What Breaks credit none (MissingFeatures D-57).
3. *"Withdrawal sequencing and guardrails — spending rules that adapt to portfolio performance"* — the Withdrawal schedule applies no
   guardrail; the guardrails are the Monte Carlo's (v6.28, V-5).
4. *"A note on the numbers"* — *"lower … than mainstream retirement calculators … often by 10 to 20 points … ~78%"* (v6.29 removed comparisons
   with other tools in-app); *"The BASE scenario prior is intentionally more pessimistic than the 1926–present historical record … Switch the
   scenario prior to BULL-LEANING"* — the app opens on BULL-LEANING (since v5.80), and its data is 1928–2025.
5. *"The Verify tab re-runs every statutory constant the math depends on"* — the v6.29 promise the app itself now replaces with what is
   checked and what is spot-checked (IRMAA, the RMD table) or not checked (inline NIIT and AMT rates).
6. *"562 checks … click through all 26 tabs"* — 9,640 app checks at v6.31 (TESTING.md). A typed count goes stale; point to TESTING.md.
7. *"~11,200 lines"* — 14,966 at v6.31.
8. The repository table omits `qa/` and `docs/`, and calls `validation/` the runnable verification suite — it is the older constants suite,
   not the release gate (OPERATIONS §B).
9. *"Ask AI … using a key you supply"* — on claude.ai it uses the platform with no key; and it sends more than "a plan summary and your typed
   question" (the ground rules, the live context, the recent conversation, attachments — v6.26 METHODOLOGY §11).
10. *"npm install"* — the lockfile is a build input; `npm ci` reproduces the published build (OPERATIONS §N3a).
11. *"Gompertz survival modeling"* — deaths are at the entered plan-to ages by default; Gompertz is the optional stochastic-longevity toggle.

The build reads every other factual sentence in it against the source too; this list is what the scope checked.

### 0.6 D-61: QCD eligibility after a death

**Confirmed in source.** Two sites decide how many people may make a qualified charitable distribution (QCD) in a year — `census.cjs` finds
`_qcdPersons` twice (definition and use) and `_qcdPersonsI` twice, nowhere else; Engine A, Engine D and the Roth ladder model no QCD:
- **Engine B** (L6797): `effSingle ? (Math.max(ageA, ageB) >= 71 ? 1 : 0) : (ageA >= 71) + (ageB >= 71)`. In widowed years after the death year
  (`effSingle` true) it counts one person and tests the **older** age — the deceased's included, since `ageA`/`ageB` keep counting after a death.
- **Engine C** (L5911): `_singleI ? (ageA >= 71 ? 1 : 0) : (ageA >= 71) + (ageB >= 71)`. `_singleI` is false in a married plan's widowed years,
  so it counts **both** spouses, each by their own age, for the whole horizon.
- In the death year itself both engines count both spouses.
- A plan single from the start is right in both: the timeline mirrors spouse B on A (L881–882), so `Math.max(ageA, ageB)` is A's age.

In law the individual must be 70½ when the QCD is made, and the cap ($111,000 in 2026, indexed by SECURE 2.0 §307) is per individual, a
spouse filing jointly having their own (26 U.S.C. §408(d)(8), as summarised by CRS IF11377, 2026-01-15; the subparagraphs are read at the
build). After a spousal rollover the survivor is the only owner — and from an inherited IRA it is the beneficiary's age that counts
(IRS Pub. 590-B, to be read at the build). Either way the survivor's own age governs. Both engines roll the decedent's Traditional balance into the survivor's in the death year
(`widowed = yr >= _deathYr1`). Two errors follow, both optimistic:
1. **A survivor under 71 is let give from the IRA on the deceased's age** (both engines).
2. **A survivor is given two caps** (Engine C) — binds only when the QCD exceeds one indexed cap.

**Measured** (prototype `v632p` = DF-7 (a): from the death year the survivor alone, on the survivor's age; lifetime tax in today's dollars,
Engine B; the example's holdings with the dates of birth and plan-to ages changed; QCD as stated, conversions $70,000):

| Household | First death | QCD years that change | Lifetime QCD | Lifetime tax (today's $) |
|---|---|---|---|---|
| The example, QCD $20,000 | 2044 (B is 78) | none | $380,000 → $380,000 | $147,750 → $147,750 |
| The example, QCD $150,000 | 2044 | none (one indexed cap ≈ $159K by then) | $1,280,965 → same | $99,139 → same |
| A 1958 dies at 76 (2034), B 1966; QCD $20,000 | 2034 (B is 68) | 2034–2036 (3) | $560,000 → $500,000 | $174,260 → $182,314 |
| A 1955 dies at 75 (2030), B 1962; QCD $30,000 | 2030 (B is 68) | 2030–2032 (3) | $780,000 → $690,000 | $151,628 → $166,734 |
| A 1955 dies at 72 (2027, before retiring), B 1966; QCD $20,000 | 2027 (B is 61) | 2029–2036 (8) | $560,000 → $400,000 | $206,430 → $231,658 |
| B 1954 dies at 74 (2028), A 1964; QCD $25,000 | 2028 (A is 64) | 2029–2034 (6) | $700,000 → $550,000 | $179,772 → $206,024 |

Engine C's QCD moved in exactly the same years as Engine B's on every household, and no IRMAA surcharge moved on these households. The
example household **cannot show it** (QCD defaults to $0, and its survivor is 78 at the first death) — a §K1 row (§3). The Monte Carlo moves
for these plans through its tax schedule (Engines B and C), and for no plan with QCD $0.

Year by year on the 2034 household: the v6.31 rows give $20,000 of QCD in 2034, 2035 and 2036 while the survivor is 68–70; the prototype gives
$0 there and $20,000 again from 2037, when the survivor turns 71. In those years the survivor has no RMD (75 is the start age), so the year's
tax does not move; the lifetime tax rises later, as RMDs fall on the $60,000 that is no longer given away. The QCD is a what-if slider: the
model does not give the money another way.

**Two more sentences** (found by the review): the IRMAA tab's *"…from the year each person turns 71"* (L11676–11682), and the Taxes tab's
*"2026 cap: $111K per eligible person (222K here)"* (L11432), which reads as two caps for the whole horizon.

**Already disclosed** on the Taxes tab's QCD line (L11430): *"survivor years are approximated — the Taxes tab tests the older spouse's age, the
deceased's included, and the IRMAA tab still allows both spouses' caps"*. Neither METHODOLOGY nor the Field Manual describes QCD eligibility
after a death.

**Run against the suite:** with the prototype built as the v6.31 leg, `t17`, `t18`, `t40`, `t41`, `t57`, `t70`, `t83`, `t93` and `t94` — every
suite that passes a non-zero QCD or reads survivor years (AST: `qcdAnnual` properties whose value is not the literal 0) — stayed green with
unchanged counts. **No existing suite can see D-61**; the build needs its own tests. ⚠ Engines B and C give the same QCD as each other on
v6.31 for all five households of the table — the two-cap error needs a QCD above one indexed cap in widowed years — so a "B equals C" check
alone would pass on v6.31 there; only the sixth household (§3 §A) and the independent figure catch it.

### 0.7 Boundary census (OPERATIONS §K1), on the example

`boundaries.mjs` on v6.31: 32 of 37 rows ON. Neither defect class here has a row, and both are invisible on the example: its survivor is
already 71+ at the first death and its QCD is $0 (D-61); its spouse A has the larger benefit (the Stress card's survivor-check sentence). The
build adds both rows (§3).

### 0.8 Found by the review, kept out: the example's sample briefing (filed as **F-27**)

The example household's Ask AI briefing (`DEFAULT_MASTER_PROMPT`, L457–473) describes the stress scenarios with the old figures: *"Tech/AI
-40/-50%"*, *"Inflation 6–8% for 3 yrs … bonds -10/-15%"*, *"Spouse A assisted living at 78"*. It is the example's live AI context. **It is out
of this scope on purpose:** v6.26's decision DC-3 kept the briefing byte-identical and `t89` A-7 pins its md5 (v6.25's,
`0ace40a186f95e0ec594910418001b90`); since v6.26 the ground-rules header goes first and tells the model the briefing's figures may be
superseded by the live context. Changing it is a re-decision of DC-3, so it is filed for Steve rather than folded in.

---

## 1 · What changes (if the decisions are taken as recommended)

**F-26**
- **The Stress tab** (DF-1, DF-2): the LTC-events card states what the engine charges — one cost of $150,000–$300,000 in today's dollars,
  grown with inflation, in the year A turns 78 (the year), and for a couple in the year B turns 82 (the year), each only if that person is
  alive then and the year is inside the run — with the gap between them computed, and no "combined over 4–10 years". The marathon card names
  only the people the plan has; *"one bounded early shock"*, *"one SS check"* and *"The worst timing"* say what the model does. The early-death half of the sequence card computes its own years ("{B} is alone for {n} years in this run"),
  says the survivor keeps the larger of the two benefits and prints that amount, with the income streams the engine adds and a note when the
  trust-fund cut is on, says the run includes the LTC charges, handles a spouse A already past 70 (the run starts with B alone) and a B whose
  plan-to year comes first (A is the survivor), and for a single plan says the run ends at A's death and labels its success rate as what is
  left then. The four column headers come from
  `SCENARIOS` and the plan's household; *"Success (>$1,500K)"* reads *"Success (>$1.5M)"* (F-15b).
- **The Social Security tab's survivor grid** (DF-8): each cell is what the survivor keeps — the larger of the deceased's benefit at that
  claim age and the survivor's own — as the engine pays it.
- **Ask AI's live context** names the conversion years the results ran at (from the selected year) — a correction in any case.
- **The Roth tab's ladder** (DF-3): starts at the selected retirement year — the table, its heading, the conversion total, the bracket card
  and the RMD cards — so it converts in the same years as the strategy comparison beside it. At the target year (the year the app opens on)
  every figure is v6.31's. METHODOLOGY's two sentences on the ladder's taper year are corrected.
- **The Events tab's ACA line** (DF-5): prints the open-enrollment dates only for the coverage year they were checked for, and for any other
  year says the dates are set each fall and points to HealthCare.gov or the state's marketplace.
- **The Backtest** (DF-4): "worst" is defined — the start that runs out soonest, or if none runs out the lowest real end balance — and the
  card uses it; the header sentence names that year; the row labels drop *"worst US start"* and *"best case"* for what each year was; the
  1966 chart and the Field Manual describe 1966 as one hard start, not necessarily this plan's worst.
- **README** (DF-6): every stale claim in §0.5 rewritten to what the code does, with no typed check count (it points to TESTING.md).

**D-61** (DF-7)
- From the year of the first death, Engines B and C count **one** person for the QCD cap, and that person is the survivor, on the survivor's
  own age. Married years before the death and single plans are unchanged.
- The Taxes tab's QCD line says the survivor alone may give, from age 71 in the model, and its *"(222K here)"* says two caps only while both
  spouses live; the IRMAA tab's *"each person"* sentence says the same; METHODOLOGY gains a short *QCDs after a death (v6.32)*
  section; the Field Manual's Taxes entry and its honest-limits QCD line say the same.

**Both:** the Field Manual's Stress entry gains one sentence on single plans; §13 records the release; the four version sites read v6.32.
METHODOLOGY changes (D-61 is a modelling change).

## 2 · Site census

**Source** (v6.31 lines; acorn walk and `census.cjs`):

| Site | Lines | Item |
|---|---|---|
| Stress comparison headers and row label | L12799–12804, L12811 | DF-1 |
| Scenario 3 (LTC events) card | L12877 | DF-1, DF-2 |
| Scenario 3's limit line | L12880 | DF-1 |
| Scenario 4 (LTC marathon) card | L12886 | DF-1, DF-2 |
| Sequence card: *"The worst timing"*; the early-death half and its income line | L12902, L12908–12917 | DF-1, DF-2 |
| SS tab survivor grid | L9016, L9210–9217, L9222 | DF-8 |
| Ask AI live context, conversion years | L7486 | (correction) |
| Roth ladder: seed, carry factor, loop, heading, total, bracket card, RMD cards | L10578, L10597, L10611, L10633–10646, L10686, L10780–10814, L10890, L10915, L10955 | DF-3 |
| Events item 10 (ACA) | L2547–2560 | DF-5 |
| Backtest: `worstSeq`, named-year labels, header sentence, 1966 chart heading | L12260, L12266, L12270, L12348, L12371 | DF-4 |
| Engine B QCD persons | L6797 | DF-7 |
| Engine C QCD persons | L5911 | DF-7 |
| Taxes tab QCD line and cap note | L11430, L11432 | DF-7 |
| IRMAA tab QCD sentence | L11676–11682 | DF-7 |
| METHODOLOGY: the ladder's taper year | L1688, L1764 | DF-3 |
| Field Manual (`DOCS_HTML`, L4990): Stress entry (incl. *"one Social Security check has already stopped"*); Backtest entry (*"worst-case grind"*); Taxes entry's QCD sentence; honest-limits QCD line; §13 | blob offsets ~92,539–94,709, ~88,714, ~75,483, ~133,335 | all |
| Version sites ×4 | — | — |

**Suites that read what changes** (AST over every literal and regex in `qa/`, `qa/qa-baseline/`, `qa/tools/`; the regexes are executed
against the new copy at the build, which a mention census cannot do):
- **Must stay true:** `t4` signs the Stress tab with *"LTC MARATHON"* (L304) and the Backtest with *"1966"* and *"1929"* (L301) — both kept. `t92` L515 requires the ACA event to point at HealthCare.gov — kept. `t81` E-4 reads `/Worst start year\s*(\d{4})\s*ended …/`
  (L418) — the card is unchanged. `t92` holds *"Typical LTC events run $300–600K"* and *"Inflation 6–8% for 3 consecutive years"* extinct
  (L198, L201) — the new copy uses neither. `t91`'s directive lint and `t92` A-2 (no typed preset name outside the Field Manual and
  `PROB_PRESETS`) run over the new copy.
- **Re-gated under DF-3 (a):** `t1` STRUCT S-5 pins `rothLadderStart` three times — `const yrs = Math.max(0, yr - tl.rothLadderStart);` (L687),
  `const _rsbC = retireStartBalances(tl.rothLadderStart);` (L694) and `planDollarFactor(tl.rothLadderStart, tl.asOfYear)` (L705) — and `t8` STEP-1 pins
  *"STEP-1 and ladder share the rothLadderStart anchor"* (L46, L67). Both become the selected year on v6.32, v6.31's pin kept on its leg.
  `t23`–`t28`, `t32`, `t70` and `t93` §L render the ladder only at the target year, so their figures cannot move (they also cannot witness
  DF-3 — §3 does).
- **D-61:** none (§0.6, measured).
- **Registration:** `v632` across the suites (the AST registrar), `t1`/`t4` value maps and `t33` PINS by hand, the three `.py` suites by hand.
  `boundaries.mjs` gains two rows (§3).

## 3 · Tests (new suite `t95_f26_d61.mjs`, both legs; the v6.31 leg pins each defect as `[KNOWN DEFECT 2026-10-25, F-26]` / `[…, D-61]`)

- **§A D-61, engine level, on six households** (the five of §0.6 and one where the QCD exceeds one indexed cap in widowed years with both
  spouses past 71 at the death): every year's `qcd_y` in Engines B and C equals an independent figure — `min(QCD, persons × the indexed cap,
  the non-annuity Traditional balance)`, persons counted by the suite from the dates of birth, plan-to ages and DF-7's rule, never from the
  engine; Engines B and C give the same `qcd_y` every year (the extinction invariant: the two engines cannot drift apart on eligibility
  again — but this check alone passes on v6.31 for the five households of §0.6, so the sixth household and the independent figure are what
  catch the defect); married years before the death and a single plan unchanged against v6.31's module to the cent; a tie (both spouses'
  plan-to years equal — the engines then treat A as the survivor); a hand pin of one year (the 2034 household: $0 in 2034–2036, $20,000
  from 2037). By AST: one eligibility expression per engine, each reading the survivor's age.
- **§B the Stress tab, rendered** on five plans — the example, the example made single, the benefits swapped, a plan whose spouse A is past
  70 at the as-of date, and a plan whose spouse B's plan-to year comes before A's 70th — with the stress set re-run after each load (§C's trap):
  the years alone equal min(B's death year, the run's end) − max(A's 70th-birthday year, the as-of year), and the B-first plan names A as the
  survivor; the sentence says the run includes the LTC charges; the income line equals the engine's survivor check plus pension plus streams;
  a single plan's success label names what is left at A's death; the survivor check printed equals `max(getSSA(), getSSB())`; a single plan names one person and no
  survivor; the LTC years and the inside-the-run test; the four headers equal `SCENARIOS`' figures; extinct by AST over every string:
  *"Combined shock"*, *"20+ years alone"*, *"FRA + DRCs accrued"*, *"Tech −40%"*, *"6-8% infl"*, *"needs assisted living"*,
  *"Success (>$1,500K)"*, *"one bounded early shock"*, *"The worst timing"*.
- **§B2 the SS tab's survivor grid** on the example and the benefits-swapped plan: each cell equals max(the deceased's benefit at that claim
  age, the survivor's own), computed in the suite from the plan's benefit table.
- **§C the Roth ladder (DF-3):** with *+1 YEAR* and *−1 YEAR* selected, the heading and the first ladder row name the selected year and the
  ladder's figures equal an independent ladder recursion started there (the recursion `t23`/`t24` already carry, given the start year); with the
  target year selected the tab is byte-identical to the v6.31 leg's (a child-process comparison, as `t90` B-8 does); a plan whose +1 year is
  past the conversion window shows no conversion years; Ask AI's context names the selected year's window at ±1.
- **§D the Backtest:** on a plan where several starts deplete, the card names the start that runs out soonest (computed in the suite from the
  tab's own sweep rule); the header sentence's year equals the card on three plans; *"generally considered"*, *"worst US start"*,
  *"best case"* and *"(the stress case)"* extinct.
- **§E the Events tab** (child process, fixed clocks): November 2026 prints the checked dates for 2027 coverage; November 2027, October 2027 and
  March 2027 (the three branches of L2555–2557) print no date for 2028 coverage and name HealthCare.gov.
- **§F README:** the eleven claims of §0.5 extinct, and no typed check count. ⚠ The run folder does not carry `README.md` today;
  `mk_runfolder.sh` gains one line copying it, as it copies `METHODOLOGY.md`.
- **§G copy:** the Taxes tab's QCD line, the Field Manual's Stress, Taxes and honest-limits sentences and §13's v6.32 entry, METHODOLOGY's
  new section.
- **Census:** `boundaries.mjs` gains `qcd_survivor` (ON when no first death leaves a survivor under 71, or the QCD is $0 — ON for the example)
  and `survivor_benefit_b` (ON when spouse A's benefit is the larger — ON for the example); `t29` asserts both and a fixture that clears each.
- **Controls** `qa/tools/controls_v632_f26_d61.py`: the old eligibility in Engine B, in Engine C, the death year counted twice, the survivor's age
  replaced by the older one; each Stress sentence back; the survivor check back to A's; the years-alone figure without its B-first branch;
  single wording back; the SS tab's grid back on A's benefit; the ladder back on the target year; Ask AI's conversion years back on the target
  year; `worstSeq` back to its strict-`<` tie-break; the ACA dates for every year; the Backtest sentence typed again; each README claim back; the QCD disclosure removed; METHODOLOGY's
  heading changed; and the unmutated run.

MC parity (`t2`) needs no intended difference: its fingerprints run with QCD $0 and at the target year.

## 4 · Out of scope

- **D-65** (the first two premium years) and **D-66** (Engines A and C disagree on IRMAA) — v6.31's filings, each a scope of its own.
- **The LTC shock's fixed ages (78/82) and costs**, and the marathon's fixed 2y/4y — the model is unchanged; only the copy says what it does.
- **The survivor benefit's RIB-LIM floor** (not modelled, disclosed on the Survivor tab) — unchanged.
- **The QCD's 70½ rule as the year of 71** (conservative, disclosed) and **the death-year timing** of a decedent's own QCD — unchanged except as
  DF-7 decides.
- **The Events tab's conversion item**, which dates the window from the target year and says so (v6.29).
- **E-26** (an exported backup does not name its build), **F-20**, **D-57** — not this release.
- **The example's sample briefing** (§0.8, filed as F-27) — pinned by decision DC-3 and `t89` A-7.
- **The comparison table's one $1.5M threshold across 15-, 30- and 35-year runs** (L3221) — the label is corrected, the measure is not.
- **The Stress tab's risk-metrics card** (Sharpe and Sortino at a fixed 4% T-bill proxy, the 1–99 "risk number") — not flagged by F-26 and not
  re-read here; noted for a later pass.

## 5 · Decisions for Steve

**Answered 2026-10-25 — Steve: *"all as recommended"*. DF-1 to DF-8, all (a).** The options below are kept as written.

**DF-1 · The Stress tab's sentences (LTC events, the early-death half, the four headers, F-15b's label).**
(a) **Recommended:** reword each to what the engine charges, computed for the plan — the ages and years, the gap between the two charges, the
years alone, the survivor keeps the larger check (printed), the run includes the LTC charges; headers from `SCENARIOS`.
(b) Remove the prose and keep only the figures.
(c) Leave them.
*Trade-off:* (a) is more copy to hold true, which is why §3 pins each computed figure to the engine — including the two edge cases the review
found (A already past 70; B's plan-to year before A's 70th); (b) loses the explanation a reader needs to know what the scenario is.

**DF-2 · Single plans on the Stress tab.**
(a) **Recommended:** the LTC cards and headers name one person and one charge; the early-death half says the plan ends at A's death in that
year, and its success rate is labelled as what is left then.
(b) Hide the early-death half for a single plan.
*Trade-off:* (b) is simpler, but the run is still meaningful for one person (an early death and the estate it leaves).

**DF-3 · The Roth ladder's start year.**
(a) **Recommended:** the ladder follows the selected retirement year, like the strategy comparison beside it. Nothing moves at the year the app
opens on; `t1` S-5 and `t8` STEP-1 are re-gated; a selected year past the conversion window shows "no conversion years" as the Exit Plan does.
(b) Keep the target year and label it (*"from your planned retirement year, {T}, whatever year is selected above"*).
(c) Leave it.
*Trade-off:* (a) touches the component-inline ladder (its seed and carry factor take the selected year), so the build proves the target year
byte-identical and the other two against a recursion; (b) costs nothing in the suite and leaves two answers on one tab.

**DF-4 · The Backtest's 1966 and 1982 claims.**
(a) **Recommended:** define "worst" (the start that runs out soonest; if none does, the lowest real end balance) for the card and use it in the
header sentence; the labels say what each year was (*"1966 — stagflation decade"*, *"1982 — start of the 1982–1999 bull market"*) and the
1966 chart is *"Real balance path — a 1966 retiree"*, with no superlative. On the example the card's year and figure do not move (no start
depletes; 1966 is its worst).
(b) Keep the sentence and cite a published source for 1966 (Bengen 1994), read at the build.
(c) Leave it.
*Trade-off:* (a) can never disagree with the card above it; (b) keeps a sentence about history that is true of most plans but not checked
against this one.

**DF-5 · The Events tab's ACA dates.**
(a) **Recommended:** print the checked dates only for the coverage year they were checked for (2027, re-read at the build from HealthCare.gov
and CMS); otherwise "set each fall — see HealthCare.gov or your state's marketplace".
(b) Drop the dates from the status line entirely.
*Trade-off:* (a) needs the November refresh to add the next year's dates (it would join the tax-figure refresh); (b) never goes stale but
tells this November's user less.

**DF-6 · The README.**
(a) **Recommended:** rewrite every stale claim in §0.5 to what the code does; no typed check count (point to TESTING.md and the CHANGELOG);
list `qa/` and `docs/`.
(b) Fix only the three items F-26 named (*"every statutory constant"*, *"562 checks"*, *"all 26 tabs"*).
*Trade-off:* (a) touches more of the front page and is read by the independent review; (b) leaves eight known-false statements on the page
a reviewer reads first.

**DF-7 · D-61: who may make a QCD after a death.**
(a) **Recommended:** from the year of the first death, the survivor alone, on the survivor's own age, with one cap — the year the engines
already roll the IRA over. Conservative.
(b) The death year counts both spouses (the deceased may have given before dying); the survivor alone from the next year.
(c) Leave it; keep the Taxes tab's disclosure.
*Trade-off:* (a) can under-count a QCD the deceased made early in the death year; (b) can over-count one they did not live to make. They
differ only in the death year, and (b) was not measured. Against v6.31, option (a) raised lifetime tax by $0–$26,252 on the measured
households (§0.6) — every change upward, the conservative direction.

**DF-8 · The Social Security tab's survivor grid** (found by the review — the V-12 claim's last site).
(a) **Recommended:** each cell shows what the survivor keeps, the larger of the deceased's benefit at that claim age and the survivor's own,
matching the engine; the sentence beneath names that figure.
(b) Leave the grid, add a note that it assumes spouse A has the larger benefit.
(c) File it for later.
*Trade-off:* (a) changes displayed figures on the SS tab for couples whose spouse B has the larger benefit (none on the example); (b) keeps a
grid that is wrong for those couples and says so.

## 6 · Review

An agent that had not seen the scope's drafting read it against the v6.31 source, the registers, the suites and the prototype (2026-10-25). It
confirmed every line number and engine fact in §0, the QCD census (2 + 2), the README claims, and reproduced all six rows of §0.6 by
re-running the probe. **2 blockers, 7 should-fix, 6 notes — every one checked in the source and taken:**
- **Blockers.** DF-3's census missed Ask AI's context (L7486, wrong today), METHODOLOGY L1688/L1764 and two of `t1` S-5's three pins (L694,
  L705) — added to §0.2, §1, §2. The rewritten early-death sentence would have broken when B's plan-to year comes before A's 70th (A is then the
  survivor; the naive figure goes negative) — added to §0.1, §1, §3 with its own fixture.
- **Should-fix.** The SS tab's survivor grid carries the same claim (now DF-8); the Backtest's 1966 chart heading and Field Manual line, and
  `worstSeq`'s tie-break for depleting plans (DF-4); the income line's missing streams and trust-fund note; three more sentences on the same
  cards (L12880, L12886 and the Field Manual, L12902); the sample briefing (§0.8, kept out and filed); two QCD sentences (L11432, L11676–11682);
  test gaps — the ACA October and other-month branches, a past-the-window ladder fixture, the LTC-charges assertion, and that "B equals C"
  alone cannot catch the two-cap error.
- **Notes.** DF-7's trade-off sentence mixed two comparisons (rewritten); the law is from a CRS summary (said where the rule is stated); the
  live ACA text is affected now if wrong (HealthCare.gov read the same day — it agrees); the header's "files nothing new" (corrected); a single
  plan's success label (DF-2); `t4` L301 and `t92` L515 added to §2; a tie fixture added to §A; the $1.5M threshold across run lengths noted
  in §4.

## 7 · Build record (v6.32, 2026-10-25)

Built against v6.31 (`d729d028…`, repo `7ebd0e7`), all decisions (a). What the build did that this scope did not say, or did differently:
- **Found by the build itself.** The first draft's single-plan limit line read *"one charge, each in a single quarter"* (reworded); the marathon card's no-charge note said *"outside this 35-year
  run"* for care years that were before retirement (reworded to *"do not fall in retirement inside this 35-year run"*). The Roth tab's RMD cards
  read an empty ladder as a $0 balance (a 100% "reduction") when the selected year is past the window — handled in `balAt`/`annAt` rather than in
  the card expression, so `t1` STRUCT S-8's exact-text pins on the card lines hold unchanged (the first draft edited those lines and S-8 went red).
  The LTC ages (78, 82) and the marathon's years (2, 4) became named constants (`LTC_SHOCK_AGE_A/B`, `STRESS_MARATHON_YEARS`), read by the engine
  and the cards — the same values, MC parity unchanged.
- **Found by the build review** (an agent that had not seen the build; no blocker, 7 should-fix, notes — every one checked and taken):
  (1) from an April–June as-of date the run's last quarter is January–March, so a June charge in that year is after the run — the card called it
  *"before the plan starts"*; the reason is now read from the quarter, and years alone are counted in whole calendar years (`t95` S-3 and two
  May-as-of fixtures); (2) the survivor sentence was printed when no one is alone (a tie, both deaths before the start) — now only when someone is
  (`t95` B-8 on a rendered tie); (3) the Field Manual's LTC DISTRIBUTION section kept *"one Social Security check already gone"*, *"the worst
  possible moment"* and *"one event per spouse"* — reworded; (4) the Roth RMD cards read the ladder's LAST row when a person's first RMD comes
  before the ladder's first row (a selected year after that person's own window — reachable at +1; the same pattern existed at v6.31 for a
  target year past spouse A's window) — fixed in `balAt`/`annAt` (`t95` C-6); (5) the README's *"A tampered or stale copy fails the checks"*
  overclaimed — reworded to what the Verify tab can catch; (6) the tests do less than §3 promised (below); (7) this status line. Also from its
  notes: an early death after the run's end (a spouse A under about 40) now says the run never reaches it; METHODOLOGY's citation names what was
  read.
- **The tests, against §3.** §C's *"independent ladder recursion"* at ±1 was not written: `t95` checks the heading, the year count, the RMD card's
  no-conversion figure re-derived with the app's own seed helpers at the selected year, the past-window plan, the review's per-person case, and
  byte-identity at the target year (two child processes); no ladder row is checked at ±1. §D's "computed from the tab's own sweep rule" is a
  property check against the named-year table (the sweep is component-inline). The controls cover four Stress sentences and three README claims
  by mutation, not each one; every replaced Stress phrase and README claim is held extinct by `t95` B-1 and F-1.
- **The law at the build.** §408(d)(8)(B)(ii)'s age condition was read in the statute text; the per-individual limit from CRS IF11377 and an IRS
  news release. IRS Pub. 590-B could not be fetched from the session and was not read. HealthCare.gov read 2026-10-25: *"November 1 – January 15
  each year"*, with 2027's plans previewed before November 1.
