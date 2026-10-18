# SCOPE — v6.19 · D-46: the Monte Carlo's quarter calendar

**FULFILLED — shipped as v6.19, 2026-10-18.** Steve: *"Let's continue with your recommendations"* — all eight decisions (a). Build record in §7.
Repo-only.

Steve, 2026-10-18, on `docs/SCOPE_D40_MC_TAX_V620.md` (DC-0): *"Let's continue with your recommendations"* — the quarter calendar is fixed
first, in its own release, and D-40 / D-44 / D-45 follow as v6.20 on top of it.

This is a **MODELLING** release, so METHODOLOGY changes. It reaches the two Monte Carlo engines, the place their quarter numbers come
from (`buildPlanTimeline`, `buildRetireOptions`), the stress set's forced years, and the displays that turn a quarter into a date (the
Monte Carlo chart's axis, the run headers, run C's trajectory table, the Guardrails tab's yearly table, the Stress tab's 30-year table).
**Engines A–D are not touched** — they work in whole calendar years and never read a quarter (§3 H proves it). **On the example household
the 6-year run does not move at all**; runs A, B, C and D, the stress set and the mortgage what-if do.

**Built against v6.18.** A fresh clone of `origin/main` at `386bb87`; source `208bf89d1bd83fc55d430f2eec60d202`, built page
`d228f1d3391231406848d2647cb97fec` (checked again before this scope: unchanged). Line numbers are v6.18's, from `census.cjs` and two small
AST walkers (quarter arithmetic, `% 4` and `/ 4`; the literal `2026`; session-only). Measurements use a **session-only prototype** (the v6.18
source with the calendar behind a switch; never shipped). It implements DC-1 (a) and the contribution-and-return half of DC-2 (a); it does
**not** implement DC-3, the rest of DC-2, DC-4's forced years or the displays — none of which any measured household reaches (every one
has January claims, is not yet retired, and the stress set is not in §0.2). Its control: with the switch set to v6.18's behaviour it
reproduces `runMonteCarlo`, `runExtendedMC` and `runStressTests` **bit for bit** (md5 of the full output, same seeds). Register ID: D-46.

**This draft was reviewed before it reached Steve** by an independent agent that had not seen the work. It found that the first draft
described `runMonteCarlo`'s quarter rule too broadly (corrected in §0.1), three missed display sites (run C's trajectory table, the run
headers, the Monte Carlo tab's run summary), an undecided half of DC-4 (how forced years and random regimes coexist — now decided in §1.4),
that the first draft's Guardrails-table change would have shown cut/raise verdicts in quarters where the engine does not check (§1.6 now
keeps the engine's quarters), engine changes run A needs, gaps in DC-2 (the bonus, inflation, volatility), an unaddressed case (retirement
before the as-of quarter, now DC-8), a test that could not hold as written (§3 I), census slips, and a disagreement with the v6.20 scope
(corrected there). Its oracle module and probes confirmed §3 C and §3 D are achievable.

---

## 0 · Premise (verified at v6.18, not assumed)

### 0.1 · How the two engines number their quarters

Both engines step a quarter at a time from the plan's as-of date (`PORTFOLIO.asOf`; the starting balance is the balance on that date).
Each turns its quarter number `q` into a date with **one formula** — `calYear = asOfYear + ⌊(q+1)/4⌋`, `calMonth = ((q+1) % 4)·3 + 3`
(`runMonteCarlo` L2568–2569 and L2603–2604; `runExtendedMC` L2751–2752 and L2800–2802) — so quarter 0 is always "June of the as-of year".
That date is what the engines read the expense table and the one-time rows at, compare with the ladder's end and the mortality years,
pass to the Social Security trust-fund factor and the income streams, and test for the LTC shock (June) and the car (March). **But the two
engines decide when things happen by two other rules:**

- **`runMonteCarlo` counts events from the as-of month, rounded.** `buildRetireOptions` puts retirement (L863) and spouse B's retirement
  (L881) at `round(months from the as-of month to the event ÷ 3)` (`_ymToQuarterFromAsOf`, L673–677); `buildPlanTimeline` does the same for
  both claims (L732–733). The bonus is paid when `q % 4 === 3` (L2556).
- **`runExtendedMC` counts events from January of the as-of year.** Retirement at `(retireYear − asOfYear) × 4` (L2716), spouse B's at the
  same rule (L2722), the claims at `⌊months from January of the as-of year ÷ 3⌋` (L2720–2721) — the as-of **month** is never read (nothing
  else in `runExtendedMC` reads it either: from `PLAN_TIMELINE` it reads only the as-of year, the claim dates, spouse B's retirement year,
  the birth dates, life expectancies and the ladder's end). The bonus is paid when `q % 4 === 3` (L2734). Its own comment, and
  `_ymToCalQuarter` (L679, "used by runExtendedMC convention" — called only to fill two timeline fields nothing reads), describe quarter 0
  as January–March.

Worked through for a January 2029 retirement (session-only probe; recomputed independently by the reviewer):

| As-of date | `runMonteCarlo`: retires at q | which it labels | `runExtendedMC`: retires at q | which it labels | The right quarter |
|---|---|---|---|---|---|
| 2026-01-15 | 12 | **June 2029** | 12 | **June 2029** | Jan–Mar 2029 |
| 2026-04-18 (the example) | 11 | March 2029 ✓ | 12 | **June 2029** | Jan–Mar 2029 |
| 2026-06-15 | 10 | **December 2028** | 12 | **June 2029** | Jan–Mar 2029 |
| 2026-07-15 | 10 | **December 2028** | 12 | **June 2029** | Jan–Mar 2029 |
| 2026-10-18 | 9 | **September 2028** | 12 | **June 2029** | Jan–Mar 2029 |
| 2027-01-15 | 8 | **June 2029** | 8 | **June 2029** | Jan–Mar 2029 |

- **`runExtendedMC` — every plan.** For an April–June as-of date it retires one quarter late (twelve quarters after the start, where the
  plan says eleven), and every claim is one quarter late the same way: the example's spouse A claims January 2031 and is first paid in the
  quarter labelled June 2031. For a January–March as-of date its quarter numbers are right and its labels one quarter late; from July both
  are off — its events land two (July–September) or three (October–December) quarters late against the start. Because it ignores the as-of
  month, **its figures are identical for every as-of date in the same year** (measured: January, April, July and October 2026 all give
  81.0% / $1,609K, BASE) — a plan saved in October accumulates for the same three years as one saved in January.
- **`runMonteCarlo` — two separate errors.** Its **labels** are right only for an as-of date in April–June. Its **event quarters** follow
  `round`, which agrees with the calendar quarter only some of the time: for an as-of date in a quarter's first month (January, April, July,
  October), an event in a quarter's **last** month lands one quarter **late**; in a quarter's middle month (February, May, August,
  November), every event lands right; in a quarter's last month (March, June, September, December), an event in a quarter's **first** month
  lands one quarter **early** — which is why the June row above retires in the December 2028 quarter. So `runMonteCarlo` is right for every
  plan only with an as-of date in May; with April (the example), only while no event falls in March, June, September or December. **The
  setup wizard builds exactly the wrong shape:** as-of 1 January (L4306) and both birth dates in June (L4307), so both claims fall in June —
  a quarter late, with labels a quarter late too.
- **The as-of date moves.** My Data sets it to the day of saving (L13049, a UTC date); the setup wizard to 1 January (L4306); Start Fresh to
  today (L4479). So the example (as of 2026-04-18, January events) is close to the one shape that hides all of this — OPERATIONS §K1's
  pattern.

**The year 2026, typed in, in the same machinery** (AST, literal `2026`): `runExtendedMC`'s current ages for stochastic longevity (L2785,
`2026 − birth year`); run A's length (L6769, `retireYear − 2026` years) and its label (L11601); the Monte Carlo chart's axis (L6951,
`2026 + ⌊(i+1)/4⌋`); the Stress tab's 30-year table (L12462, `2026 + yi`). From January 2027 a plan saved in My Data has a 2027 as-of
date: run A then runs a year past retirement, the axis and the table are a year off, and longevity draws start from last year's ages.
(`_asOfToYM`'s fallback of 2026-04 for a missing date, L687, is a default, not this defect.)

**Displays that turn a quarter or a snapshot into a date by their own rule:**
- the Guardrails tab's yearly table (L7158–7175) takes the quarters with `q % 4 === 3` — the quarters where the engine checks its guardrails
  (L2657) — calls each "December of" its year and reads the expense table there, but the engine labels those quarters March; so on the
  example each row shows the balance at the end of March beside December's spending, and the table's "cut spending / can increase" verdicts
  (around L9836) mirror the engine's check on that row;
- **run C's trajectory table** (L11654–11665) labels annual snapshot `yi` as `asOfYear + yi` and puts "◀ RETIRE" and the LTC markers on
  those rows — a snapshot is taken every fourth quarter **from the as-of date**, so on the example "2029" is the balance at the end of March
  2029;
- **the run headers say the runs start at retirement; they start at the as-of date.** "RUN B: EARLY DECADE · 2029–2039" and "RUN C: FULL
  30-YEAR · 2029–2059" (L11602–11603), and the tab's summary "Early Decade (2029–2039), Full 30yr (2029–2059)" (L11439): both runs are
  `runExtendedMC(retireYear, 10 | 30, …)`, ten or thirty years **from the as-of date** — run B on the example is 2026–2036, three of its ten
  years before retirement;
- the retirement cards' "N-month gap before Social Security" (L865–866) is `(claim quarter − retirement quarter) × 3`.

**Retirement before the as-of quarter** (a plan saved after it retired, or the "−1 YEAR" card of a plan retiring next year): v6.18's
`runExtendedMC` puts retirement at quarter 0 for any as-of date in the retirement year and adds the home-move cash there — even for a plan
saved in October that retired in January, whose balance already holds it; v6.18's `runMonteCarlo` gives such a plan a negative retirement
quarter and never adds it. The two engines already disagree (DC-8).

**Not part of the request, found here** (§4, §6): the Stress tab's 30-year table compares the Monte Carlo median with a "planned" figure of
`household × 1.04^years` (L12463) — the benchmark the engines' own comment (L2742–2745) says was replaced because it ignores withdrawals.

### 0.2 · Measured

The prototype (see the header for what it implements). 3,000 paths, fixed seeds per row; 30-year figures are run C's shape (deaths at life
expectancy, one LTC shock, the car every 8 years).

**BASE** (the findings note's preset; v6.18's example reproduces 81.0% / $1,609K):

| Household | 6-yr median: v6.18 → fix | 30-yr >$500K: v6.18 → fix | 30-yr >$800K: v6.18 → fix | 30-yr median: v6.18 → fix |
|---|---|---|---|---|
| Example (as of 2026-04-18) | $1,990K → **$1,990K (bit-identical)** | 89.1% → 88.9% | 81.0% → 80.3% | $1,609K → $1,565K |
| Example, as of 2026-01-15 | $2,015K → $2,015K | 89.1% → 89.2% | 81.0% → 80.0% | $1,609K → $1,616K |
| Example, as of 2026-06-15 | $1,968K → $1,971K | 89.1% → 88.3% | 81.0% → 79.3% | $1,609K → $1,540K |
| Example, as of 2026-07-15 | $1,968K → $1,965K | 89.1% → 88.5% | 81.0% → 79.2% | $1,609K → $1,547K |
| Example, as of 2026-10-18 | $1,947K → $1,939K | 89.1% → 87.6% | 81.0% → 78.4% | $1,609K → $1,500K |
| Example, as of 2026-11-20 | $1,947K → $1,932K | 89.1% → 87.1% | 81.0% → 78.0% | $1,609K → $1,487K |
| Example, as of 2027-01-15 | $1,912K → $1,912K | 87.1% → 87.2% | 77.8% → 76.9% | $1,455K → $1,460K |
| Every date 3 years later, as of 2026-04-18 | $2,367K → $2,367K | 91.6% → 91.6% | 85.1% → 84.8% | $2,071K → $2,037K |
| Single household (as of 2026-04-18) | $1,928K → $1,928K | 94.9% → 94.6% | 86.6% → 86.3% | $1,503K → $1,466K |
| Single, as of 2026-10-18 | $1,876K → $1,868K | 94.9% → 94.7% | 86.6% → 84.9% | $1,503K → $1,414K |

**BULL-LEANING** (what a first visit opens on), 30-yr >$500K and median: example 97.1% → 96.8%, $2,372K → $2,299K; as of 2026-10-18
97.1% → 96.4%, $2,372K → $2,192K; single as of 2026-10-18 98.5% → 98.0%, $1,904K → $1,776K; the 6-year example median $2,140K → $2,140K.

What the tables say:
- **The 30-year figures read lower for most plans** — they were optimistic, because `runExtendedMC` accumulated a quarter or more longer
  than the plan does and ignored how much of the year had gone. Generally, the later in the year a plan was saved, the larger the move
  (saved in November: median −$122K; June −$69K, July −$62K). An as-of date in January–March moves its median least (its quarter numbers
  were right; only its labels move).
- **The 6-year figures barely move**, and not at all on the example: for these households (January events, as-of dates in a quarter's first
  month or in November) `round` already gave the calendar quarter, so the fix there is the labels.
- **v6.18's 30-year figure did not depend on the as-of month at all; the fix's does** — under common random numbers, January → April →
  July → October 2026 steps the median by −$51K, −$18K and −$47K: the accumulation time the plan no longer has, plus where the plan's dates
  now fall against the table.
- **The first quarter (DC-2):** an as-of date in a quarter's first month (the example's April 18) changes nothing. As of 2026-06-15,
  counting only the one month left in that quarter reads 79.3% / $1,540K; counting the whole quarter, 80.3% / $1,565K (as if saved 1 April).
- **Regime years (DC-4):** making every simulated year a calendar year re-sequences every path — the example's 6-year median $1,990K →
  $1,969K and its 30-year figures 79.3% / $1,577K instead of 80.3% / $1,565K: sampling, not a model change. Keeping the random regimes on
  years from the as-of date leaves the example's 6-year run bit-identical.

### 0.3 · What the change does to the existing suite (probe, not the build)

The v6.18 packaged suite (`runsuite.sh v617 v618`) with the prototype — DC-1 (a) and the contribution-and-return half of DC-2 (a) —
built into the v6.18 slot of a copy of the packaged run folder. 2026-10-18. **GRAND 7,772 passed, 26 failed** (all app; tooling green),
no suite DIED. Every red is the change:

| Suite | Red | Why |
|---|---|---|
| parity | 2 of 10 | `extMC` and `stress` — the intended difference; **`mc` identical**, as are the other seven keys |
| `t81` | 24 | D-1, "both Monte Carlo engines bit-identical across the pair", on the example and 23 other households — a probe artifact: the candidate sat in the v6.18 slot; in a v6.18 → v6.19 run folder §D skips by design (it needs `app_v617.mjs`) |

Nothing else moved: `t42` D-4 (the 6-year planned path) held, as did every DOM suite reading Monte Carlo figures (`t4`, `t6`, `t46`,
`t74`), `t20`, `t56`, `t79`, `t80` and `domdiff`. The suite has **no check that would have caught the calendar defect**: the assertions that
run the Monte Carlo either use the example's April as-of date and January events, or (`t7`, `t8`, as of 15 January) check contribution
totals, which the calendar does not change. That is why §3 A sweeps all 144 month pairs and §3 I sweeps the
as-of date. *(The display changes, DC-3 and DC-4's forced years are not in the prototype; the build's own probe covers them.)*

### 0.4 · Register sweep (OPERATIONS §K2)

Searched `docs/FlawsToFix-*`, `docs/ARCHITECTUREIssues.md`, `docs/MissingFeatures.md`, `docs/UsabilityFlaws.md` and METHODOLOGY for
"quarter", "as-of" / `asOf`, `retireQ`, `retireQuarter`, `_ymToQuarterFromAsOf`, `_ymToCalQuarter`, "calendar quarter", "2026". **Nothing
registered**: the hits are test-harness notes on `asOfYr` and the home-move entry's "in the retirement quarter". METHODOLOGY's regime text
(L22–27: "draws a regime once per simulated year and applies it to all four quarters") stays true for ordinary runs under DC-4 (a) and
gains a sentence for the stress set's forced years. Closes nothing else; **changes** D-45's reach for plans not saved in April–June (which
months count as a quarter's last moves with the labels — D-45 itself is fixed in v6.20).

---

## 1 · The change (recommended options)

### 1.1 · One quarter calendar (DC-1 (a))

One module-level function replaces the label formula at all four engine sites and both event rules:
- **Quarter 0 is the calendar quarter that contains the as-of date**; quarter `q` is the `q`-th calendar quarter after it. Its date is that
  quarter's own year and last month (03, 06, 09, 12): `cq = q + asOfQuarter`, where `asOfQuarter` is 0–3 (January–March = 0).
- **An event falls in the quarter that contains its date**: `(year − asOfYear) × 4 + ⌊(month − 1) / 3⌋ − asOfQuarter`. Retirement and
  spouse B's retirement (always 1 January) and both claims, in **both** engines; `buildRetireOptions` and `buildPlanTimeline` take their
  quarters from it. `_ymToQuarterFromAsOf` and `_ymToCalQuarter` are removed, and with them the timeline fields nothing reads (`census.cjs`:
  defined and returned only) — `retireQ`, `medicareAQuarter`, `medicareBQuarter` (L731, L734–735, L756) and `retireQ_cal`, `ssAQuarter_cal`
  (L738–739, L757).
- **The bonus is paid in the January–March quarter** of each working year (it was `q % 4 === 3` — the same quarter for an April–June as-of
  date, a different one otherwise).
- On the example (as of April, every event in January) the labels and `runMonteCarlo`'s event quarters are exactly v6.18's, so its 6-year
  run is bit-identical; `runExtendedMC` moves only by its four event quarters (one earlier each) — §3 D proves both against an oracle.

### 1.2 · The first quarter (DC-2 (a))

When the as-of date is part-way through its quarter, everything in quarter 0 is scaled to the months left in it, **counting the as-of
month** (first month of a quarter: 3/3, nothing changes — the example; second month: 2/3; third: 1/3): contributions **and the bonus**,
spending, income, the inflation step and the quarter's return (the whole return, noise included, scaled linearly — a stated simplification).
Day-level proration is not attempted.

### 1.3 · A claim in the middle of a quarter (DC-3 (a))

The claim quarter pays Social Security for the months from the claim month to the quarter's end (a November claim: two of three months),
not the whole quarter. Every claim on the example is in January, so the example does not move.

### 1.4 · Regime years and the stress tests' forced years (DC-4 (a))

The random regimes keep their years from the as-of date: one draw every fourth quarter, **always** — including inside a forced window, so a
stress run consumes the same random numbers as an unforced run with the same seed. The stress set's forced years (`runStressTests`
L2966–2994, keyed by `retireOffset = retireYear − asOfYear`; looked up at L2809–2812) become **calendar years**, applied quarter by quarter:
inside a forced year the forced regime replaces the drawn one; outside it the most recent draw applies. So "crisis in the first year of
retirement" covers the four quarters of the retirement year, starting in the retirement quarter. METHODOLOGY's regime paragraph gains a
sentence saying so.

### 1.5 · The year and the runs, from the plan

- `2026` gives way to the plan's as-of year at L2785 (current ages for stochastic longevity), L6951 (the chart axis, which also takes the
  as-of quarter: "Now", then each quarter's own name) and L12462 (the Stress table's years).
- **Run A** runs to the retirement quarter, not a whole number of years. `runExtendedMC` gains a quarter count in place of `totalYears × 4`
  (an option; the other callers are unchanged), records a final snapshot at its last quarter, and reports run A's average return over its
  real length; the run cards' "Time Horizon" row (L11634) and run A's label (L11601) read the plan's dates.
- **Run B and run C keep their spans** (ten and thirty years from the as-of date — DC-7 (a)), and their headers (L11602–11603) and the tab's
  summary (L11439) say so: "2026–2036", "2026–2056" on the example.

### 1.6 · The displays

- **The Guardrails tab's yearly table** keeps the quarters the engine checks (every fourth from the as-of date) and labels each with its
  true date — "end of March 2027" on the example — reading the expense table at that quarter, so its verdicts stay the engine's.
- **Run C's trajectory table** labels each snapshot with its true date (the end of the quarter it was taken in); "◀ RETIRE" marks the first
  snapshot on or after retirement, and the LTC markers the snapshot in whose year the shock falls.
- **The retirement cards' gap** is counted in months from the two dates.

### 1.7 · What the user reads

- **Monte Carlo tab and Field Manual (Monte Carlo entry):** one paragraph — the simulation steps calendar quarters from your as-of date;
  the first quarter counts only the months left in it; retirement and each claim start in the month the plan says; runs B and C cover ten
  and thirty years from your as-of date. METHODOLOGY: a new section, *The Monte Carlo's calendar (v6.19)*, with §0.1's table, §0.2's
  measurements, and what the change moved.
- **Disclosed:** My Data's as-of date is the UTC date of saving (L13049), so an evening save in the Americas on a quarter's last day falls
  in the next quarter (filed, §6).
- No notice (DC-6 (a)).

### 1.8 · The version

v6.19 at the four in-app sites; the registrar for the suites' version lists.

---

## 2 · Site census (v6.18 lines; re-run at the build and recorded in §7)

### 2.1 · App

| What | Sites |
|---|---|
| The label formula (AST: `(q + 1) % 4`, `⌊(q + 1) / 4⌋`) | `runMonteCarlo` L2568–2569, L2603–2604; `runExtendedMC` L2751–2752, L2800–2802; chart axis L6951 (as `i`); Guardrails table L7160 |
| Quarter-of-the-year tests (`q % 4`) | bonus L2556 (`runMonteCarlo`), L2734 (`runExtendedMC`); regimes L2610, L2809–2810; guardrail checks L2657, L2912 (unchanged); annual snapshots L2848, L2919; Guardrails table L7159 |
| Event quarters | `_ymToQuarterFromAsOf` L673 (8 AST hits: L731–735, L863, L881); `_ymToCalQuarter` L679 (3: L738–739); `runExtendedMC` L2716, L2720–2722; `retireQuarter` 15 hits, `spouseRetireQuarter` 3, `ssAQuarter` / `ssBQuarter` 4 each, `totalQuarters` 5; unread timeline fields L731, L734–735, L738–739, L756–757 |
| Forced years | `runStressTests` L2966–2994 (`retireOffset`); `runExtendedMC` L2809–2812 |
| Run length and snapshots | `runExtendedMC` `totalQ` L2714, snapshots L2848, L2919, `avgReturn` L2948–2951; run A L6769 |
| Literal `2026` in the Monte Carlo machinery | L2785, L6769, L6951, L11601, L12462 (the other `2026` literals are tax and rule years, L914–L2076, not this) |
| Labels compared with event dates | LTC shock `calMonth === "06"` L2890–2891; car `calMonth === "03"` L2904; care windows and mortality by `calYear` L2844–2845, L2898–2900 — unchanged code, now on true dates |
| Home-move cash at retirement | `runMonteCarlo` L2574, L2635; `runExtendedMC` L2756, L2851 (DC-8) |
| Displays | chart axis L6950–6952; tab summary L11439; run cards L11601–11603, "Time Horizon" L11634; run C table L11654–11665; Guardrails table L7152–7175 and its verdicts ~L9836; retirement cards' gap L864–866; Stress table L12461–12463 |

### 2.2 · Suites

Reach the Monte Carlo engines directly (`idsites.cjs`): `t2`, `t20`, `t42`, `t56`, `t79`, `t80`, `t81` (lines in the v6.20 scope's §2.2);
read Monte Carlo figures through the DOM: `t4`, `t6`, `t46`, `t74`. §0.3 records which move.

---

## 3 · Tests — new `qa/t82_mc_calendar.mjs`, both legs (v6.18 prior, v6.19 current)

*(The v6.20 scope's suite becomes `t83`.)*

**A. The calendar, against an independent oracle.** For an as-of date in each of the twelve months (two days each, two years): quarter 0's
label is the quarter containing the as-of date; each later quarter's label is the next calendar quarter; an event in each of the twelve
months of a later year lands in the quarter containing it — all 144 as-of-month × event-month pairs, the ones where v6.18's `round`
disagreed included; retirement on 1 January lands in that year's January–March quarter. The oracle is written in the test from dates, not
from the app's formula.

**B. One rule, everywhere (AST).** No `(q + 1) % 4` or `Math.floor((q + 1) / 4)` remains in either engine, the chart axis or the Guardrails
table; no literal `2026` in either engine, run A, the chart axis or the Stress table; both engines, `buildRetireOptions` and
`buildPlanTimeline` reach the one calendar function; `_ymToQuarterFromAsOf`, `_ymToCalQuarter` and the five unread timeline fields are gone.

**C. The example's 6-year run does not move.** `runMonteCarlo` on the example — every path and the planned path — bit-identical v6.18 →
v6.19 (same seeds), and the same for the single and +3-year households and every fixture with an April as-of date and no event in March,
June, September or December. (A plan with such an event moves — a March claim, measured by the reviewer — and §3 A covers it.)

**D. `runExtendedMC` moves by its four event quarters and nothing else** on the example and the households of C: an oracle module built
from the v6.18 source with `retireQ`, `spouseRetireQ` and both claim quarters each one less (the `t80` §A builder) is bit-identical to
v6.19 — run B, run C, stochastic longevity, sustained LTC, the mortgage what-if (the reviewer built this oracle and confirmed it).

**E. The stress set's forced years** begin in the retirement quarter and cover the retirement year's four quarters, and the forced runs draw
the same random numbers as an unforced run with the same seed. Measured through a test-only option that returns each path's quarter-by-
quarter regime (decided at the build if a cleaner instrument exists; recorded in §7).

**F. The first quarter.** On `runMonteCarlo`'s planned path, an as-of date in a quarter's second (third) month scales the first quarter's
contributions, bonus, inflation step and growth by exactly 2/3 (1/3) — equal, to 1e-6, to an oracle in the test applying §1.2's rule.

**G. Mid-quarter claims.** A claim in each month of a quarter pays 3, 2 or 1 months in its first quarter, exact on the planned path.

**H. What must not move.** Engines A–D bit-identical v6.18 → v6.19 on the example and every fixture (`t2`'s seven non-Monte-Carlo
fingerprints, plus B, C and D rows).

**I. Smooth in the as-of date (the extinction).** On a household with no bonus and no pre-retirement one-time rows, for as-of dates on the
1st of each month from January 2026 to December 2027, `runMonteCarlo`'s planned balance at retirement falls with every month by no more
than one month's contributions and return — no step of a quarter or a year, which v6.18 shows (§0.1's table). With a bonus, the only
larger step is exactly one year's bonus, where the as-of date passes March.

**J. The year from the plan.** On the example moved to an as-of date in April 2027: run A ends at the retirement quarter and records its
balance there; the chart axis starts at the as-of quarter; the Stress table's years start at 2027; stochastic longevity's current ages are
2027's — against §3 D's oracle with `2026` also replaced.

**K. Rendered.** The chart axis on plans as of April and October; the run headers, the tab summary and the "Time Horizon" row; run C's
table labels and markers; the Guardrails table's dates and verdicts; the retirement cards' gap in months; the Monte Carlo tab's paragraph.

**L. Retirement before the as-of quarter (DC-8).** A plan saved after it retired: neither engine adds the home-move cash; one saved in its
retirement quarter: both add it at quarter 0.

**Parity.** `t2`'s `INTENDED_DIFFS` gains `"v618→v619"` for the keys §0.3 shows move.

**Re-pins** only with attribution: each moved figure reproduced by §3 D's oracle (the four quarters) or §3 E's instrument (the forced
years) in the same run.

**Controls** — `qa/tools/controls_v619_calendar.py` (repo-only): the label formula restored at one site; `runExtendedMC`'s retirement
quarter restored; one claim quarter restored; `round` restored in `buildRetireOptions`; the first-quarter scale removed; the claim
proration removed; `2026` restored at one site; the forced years keyed by year-from-start again; the home-move cash added before the as-of
quarter. Each must turn named checks red; every file restored and hash-checked.

---

## 4 · Out of scope, and stop conditions

**Out of scope, disclosed:**
- **D-40, D-44, D-45** — v6.20, on this calendar (`docs/SCOPE_D40_MC_TAX_V620.md`, which adopts §1.2 and §1.3 for its tax and expense
  reads). Until then the Monte Carlo still reads one month per quarter and charges a one-time row only if it is dated in a quarter's last
  month — now the quarter's true last month.
- **The Stress tab's "planned" benchmark** (`household × 1.04^years`, L12463): filed (§6), to ride with v6.20, where `runExtendedMC` starts
  returning its planned path.
- **Run B and run C measured from retirement** instead of from the as-of date (DC-7 (b)) — a different question, filed if you want it.
- **Day-level timing** (an as-of date on the 28th counts its whole month) and **monthly stepping** — quarters stay the unit.
- **The UTC as-of date** (§1.7) — filed.
- **Engines A–D** count whole calendar years from the retirement year and are untouched.

**STOP and report if:**
- the example's `runMonteCarlo` output moves at all (§3 C);
- §3 D's oracle differential is not bit-identical;
- any Engine A–D figure, or a `t2` fingerprint other than the Monte Carlo keys, moves;
- a suite outside §0.3's list goes red for a reason the calendar does not explain;
- a display needs more than its date rule changed;
- run A's quarter count needs more of `runExtendedMC` than the option, the final snapshot and its average return.

---

## 5 · Decisions for Steve

**DC-1 · Which quarters.**
(a) **Calendar quarters, starting with the one that contains the as-of date** — both engines, every date and event on it. The example's
6-year run is unchanged; the labels stay the familiar quarter names.
(b) Three-month blocks counted from the as-of month. Exact for the first quarter without proration, but quarters then straddle calendar
years — awkward for the year-by-year tax and expense reads v6.20 adds — and every label changes.
**Recommend (a).**

**DC-2 · The first quarter, when the as-of date is part-way through it.**
(a) **Count only the months left, including the as-of month** — every flow, the bonus, inflation and the return; conservative; the example
(April 18) is unchanged.
(b) Count the whole quarter — up to two months of contributions and growth the plan does not have (as of June 15: 80.3% / $1,565K against
(a)'s 79.3% / $1,540K, BASE).
**Recommend (a).**

**DC-3 · A Social Security claim in the middle of a quarter.**
(a) **Pay from the claim month** (one, two or three months of the first quarter).
(b) Pay the whole quarter — up to two months of benefit early, optimistic.
(c) Start with the next quarter — up to two months late, conservative.
**Recommend (a)** — exact at no cost. No effect on the example (January claims); the wizard's June claims become exact.

**DC-4 · Regime years.**
(a) **Keep the random regimes on years from the as-of date, always drawn; apply the stress set's forced years by calendar year, quarter by
quarter.** The example's 6-year run stays bit-identical; "the first year of retirement" means the retirement year.
(b) Make every simulated year a calendar year (a short first year). One convention, but every path re-sequences and every figure moves by
sampling — the example's 6-year median $1,990K → $1,969K for no modelling reason.
**Recommend (a).**

**DC-5 · The Stress tab's "planned" benchmark** (§0.1, last paragraph).
(a) **File it, and fix it with v6.20** (where the 30-year engine returns its planned path).
(b) Fix it here.
**Recommend (a)** — it is a display with its own question (what "planned" should mean there), and this release is about dates.

**DC-6 · Telling users their figures moved.**
(a) **No in-app notice** — no saved data changes; the CHANGELOG, Field Manual and METHODOLOGY say what changed.
(b) A one-time notice on the Monte Carlo tab.
**Recommend (a).** The example's 6-year figures do not move and its 30-year figures move by under a point; plans saved later in a year,
and wizard plans, move more, mostly down.

**DC-7 · Runs B and C start at the as-of date, but their headers say retirement.**
(a) **Correct the headers** to the spans the runs model ("2026–2036", "2026–2056" on the example).
(b) Make the runs start at retirement (ten and thirty years of retirement) — changes what the Monte Carlo tab's headline measures; its
own decision.
**Recommend (a)**, and file (b) if you want the question kept open.

**DC-8 · A plan whose retirement is before its as-of quarter.**
(a) **Neither engine adds the home-move cash** — the balance on the as-of date already holds it; a plan saved in its retirement quarter
still gets it at quarter 0. Ends the two engines' disagreement in the conservative direction.
(b) Always add it at quarter 0 when the retirement year is the as-of year (today's 30-year behaviour; double-counts for a plan saved after
the move).
**Recommend (a).**

---

## 6 · Register housekeeping at ship

`MissingFeatures.md`: **D-46** filed and closed by this release (the Monte Carlo's quarter calendar, the year 2026 in its machinery, and
the run headers). New, with the next free IDs: the Stress tab's `household × 1.04^years` benchmark (open, display; to ride with v6.20); My
Data's UTC as-of date (open, low); run B and C measured from retirement (only if DC-7 (b) is wanted). The four items the v6.20 scope found
(the built-in spouse-B work taper, What-Breaks' sentences, the mortgage what-if's Florida sentence, IRMAA not in the Monte Carlo) are filed
at v6.20's ship as that scope says — or here, if you would rather have them on the register now.

---

## 7 · Build record

**Built against v6.18** (`208bf89d…` / built `d228f1d3…`, origin/main `386bb87`, unchanged since the scope).
**v6.19:** source `35d3dcb436b7ad801b6c9588d5429cb0`, built `index.html` `d9e0df4297fce9946417db5b9b322ee3`; `smoke_built` 22 of 22. Decisions: DC-1 to DC-8 all **(a)**. Edit script
`v619_source.py` (session), every anchor asserted unique.

**Census at the build (`census.cjs`, the two AST walkers).** No `(q + 1) % 4` / `⌊(q + 1) / 4⌋` formula remains; no literal 2026 in the Monte Carlo
machinery (the one left in a function is `_asOfToYM`'s fallback). The calendar is six module-level functions beside the old rules' place —
`mcAsOfQuarter`, `mcQuarterOf`, `mcQuarterDate`, `mcQuarterFrac`, `mcPaidShare`, `mcSnapshotDate` — and `MC_QUARTER_MONTH`. `_ymToQuarterFromAsOf`,
`_ymToCalQuarter` and the timeline fields `retireQ`, `medicareAQuarter`, `medicareBQuarter`, `retireQ_cal`, `ssAQuarter_cal` are gone (a census of
the suite found no reader). Version: four sites; registrar 342 sites; `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites
by hand. The shim exports the calendar functions, `RETIRE_OPTIONS`, `applyScenarioProbs` and `PROB_PRESETS` (guarded).

**Tests.** `t82`: **105** checks on v6.19, **16** on v6.18. Controls `qa/tools/controls_v619_calendar.py` **11 of 11 as expected**, files restored and hash-checked. Full suite from the packaged
copies: **7,763 app checks across 81 suites, 0 failed, 0 DIED**; MC parity 10 of 10; tooling `t21` 64, `domdiff` 36 (v6.18's pair carried 44: its v617 → v618 arm had more masks than this pair's four), `sets` 12 + 12 — GRAND **7,897 passed, 0 failed**. Every skip line read: each is a designed pair-pinned skip (`t65`, `t70`, `t71`, `t72`, `t75`, `t76`, `t77`, `t78`, `t79`, `t80`, `t81`; `t81` §D and `t80` §A/§C stand down without their own pair's source), and `t82`'s three on the v6.18 leg (C, D, H run on the current leg only); `t82` takes none on v6.19. `smoke_built` against the packaged `index.html`: 22 of 22.

**What the first full run on the build turned red** (a dev run folder, before the registrations): `t1` 4 and `t4` 1 (the version strings — the
registrar widened `VER === "v618"` beside them, which is wrong for a version label; fixed by hand), `t33` DIED (no PINS entry for `v619`; its Roth
fixtures read no quarter, so v6.18's pin was copied), `t45`, `t47`, `t48` (their own version lists), `t78` D-2a on both legs (that folder still held
v6.18's built page), and `domdiff` 1 — below. **No Monte Carlo pin moved:** `t42` D-4 (the 6-year planned path) held, as §0.3's probe said, and
parity read 10 of 10 with the `"v618→v619": ["extMC", "stress"]` entry.

**Where the build departed from the scope, owned.**
- **`domdiff` needed a v618 → v619 arm the scope did not foresee.** The Withdrawal tab's capture includes the header's success rate and the three
  retirement cards' success rates and medians, and they differed (98.7% → 99.1% on the planned year) although the 6-year engine is bit-identical
  given the same random numbers (`t82` C). The harness draws every simulation from ONE seeded stream, and the app opens on the Dashboard, whose
  30-year runs and stress set run first; v6.19 changes how many numbers they consume (run A 11 quarters, not 12; the stress set draws every
  fourth quarter even inside a forced year), so the 6-year runs read a shifted stream. **Measured, not argued:** v6.19 rebuilt with v6.18's
  run A length and draw-skipping renders the tab byte-identical to v6.18 (DOM DIFF 32 of 32); the arm masks exactly those figures for this pair,
  and each mask must bite exactly as often as stated.
- **`runExtendedMC` gained a test-only option, `regimeTrace`** — §3 E's instrument, decided at the build as the scope allowed: an array that
  receives path 0's regime name each quarter. It changes nothing when absent.
- **§1.7's MC-tab sentence names the as-of quarter as "Q2 2026"**, not a month — a first draft read "Jun quarter of 2026".
- **`t82` B-1 passed vacuously in its first draft:** its matcher read acorn's source range for `(q + 1)`, which excludes the parentheses, so it
  never matched. Found when the v6.18 leg's pin of the same matcher went red; fixed, and the v6.18 leg now counts the formula at 11 sites. The
  first draft of B-2's v6.18 pin also counted the five 2026 sites as five literals; there are six (two on the current-age line).
- **The first controls run** reported `restored: NO` with every control firing: its run-folder copy symlinked `node_modules`, so a rebuilt DOM
  bundle carried different path comments (`../r619/node_modules/…`) — a rebuild of the untouched source gave the same bytes. The recorded run
  above used a full copy.

