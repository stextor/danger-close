# SCOPE — F-29 · The SS tab's claim-age explorer starts at the plan, and compares against the plan

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.37 (2026-10-29).** DS-1 to DS-5 taken as recommended (Steve: *"yes, do the five recommendations for me"*); DS-6 added at the build and taken as recommended (Steve: *"Fold into F-29"*). §7 is the build record. |
| Build scoped against | **v6.36** · source `src/DangerClose.jsx` md5 `9c470b5a6e7571dd44c80d2e83e35133` · built `index.html` `ee554293faaee8a2716459daf697e2c8` · repo `10efc40` |
| Freshness | Pool source `DangerClose-v6_36.jsx` md5 = manifest = clone (`package_check` 54/0 post-upload, 2026-10-29; §F clone diff clean) |
| Kind | A **presentation** release: one tab's what-if section. No engine moves; no figure outside the SS tab moves. |
| Register | Files **UsabilityFlaws F-29** (§8 below is its text). §K2 sweep: no register item covers it (§2). |
| Reported by | the maintainer, from his own plan (2026-10-29) |

---

## 0 · Premise — verified by rendering, not by reading

**The report.** On the SS tab, *Social security timing & claiming ages*, the card for spouse A read **"SS @ age 67"** while My Data
holds spouse A's claim age as **65**. Spouse B's card read 63, matching My Data.

**The cause (source, v6.36).** `DangerCloseMain` holds two slider states:

```js
const [spouseAClaimAge, setSpouseAClaimAge] = useState(67);                                              // L7419
const [spouseBClaimAge, setSpouseBClaimAge] = useState(() => PORTFOLIO.incomeSources?.ssB?.plannedAge || 67); // L7420
```

Spouse A's slider starts at a literal 67 for every plan; spouse B's starts at the plan's claim age. Both have stood since the first commit
(`f8e21ce`, `git log -S`). A plan change remounts `DangerCloseMain` (`key={remountKey}`, L15421), so B's initializer re-reads each plan;
A's never reads one. **No engine reads either slider** (§1): every other tab, the Monte Carlo included, uses `plannedAge` (L923).

**Measured** (`probe_f29.mjs`, scratch, the v6.36 DOM bundle, the example's holdings and expenses, spouse A's benefit table built by
`genSSTable` as My Data builds it; logs `b636/probe_f29.log`, `b636/probe_f29_more.log`):

| Plan (spouse A) | A slider opens at | A card | "Portfolio draw delta vs FRA" card | Draw table's deltas | "Monthly income gain (permanent)" |
|---|---|---|---|---|---|
| example — 67, $3,300 | 67 | $3,300 | BASELINE | none | $0 |
| **65, $3,322** (the report) | **67** | **$3,833** | **+$80K** | +$46K, +$46K (2029–30) | **$0** |
| 62, $2,600 | 67 | $3,714 | +$156K | +$45K, +$45K | $0 |
| 70, $4,600 | 67 | $3,710 | −$134K | −$45K × 3 (2031–33) | $0 |
| single, 64, $2,900 | 67 | $3,625 | +$104K | +$44K, +$44K | $0 |
| B planned 67 ($2,028), A 65 | B 67 · A **67** | $3,833 | +$80K | +$46K, +$46K | $0 |

**So the report is the visible half of a wider defect.** Three more things are wrong whenever spouse A's planned age is not 67, and all
three are invisible on the example, whose spouse A plans 67:

1. **The comparison has no single baseline.** The delta card compares the slider with **the plan** — `getSSA() × months` between the
   planned and the selected claim month (L9372–9386). The draw table's *"DRAW (FRA)"* column pays **the FRA amount from the plan's claim
   date** (`spouseASSfra = yr >= _tlSS.ssA_date.year ? spouseAFRA : 0`, L9592–9599) — a benefit nobody receives: on the reported plan,
   $3,833 a month from age 65. So the card and the table beside it disagree: **+$80K against +$92K** on the reported plan, **+$104K against
   +$88K** on the single plan, **+$156K against +$90K** at 62.
2. **The "permanent" card compares with FRA, not the plan.** *"Monthly income gain (permanent)"* is `selectedBenefit − spouseAFRA` — so it
   reads **$0** at the slider's opening position on every plan, while moving the reported plan from 65 to 67 adds **$511 a month for life**
   ($3,833 − $3,322), and moving the 70 plan to 67 loses $890.
3. **The card counts months before retirement; the table does not.** At 62 the card's +$156K is 60 months × $2,600, from 2026 — three
   years before the plan retires (2029); the table starts at retirement. The table also ends at retirement + 8, which a delay to 70 can
   pass for a younger spouse (not measured; read from L9595).

**And one sibling in the same panel.** The *"Shortfall after … ends"* card subtracts spouse B's benefit **at her age in the retirement
year** (`spouseBActual`, L9324–9327, L9654), not her plan or her slider. With B planning 67 ($2,028) and 63 at retirement, the card used
$1,521 — derived, not read: on every plan probed the printed shortfall plus the benefits and pension it subtracts comes to the same
$7,620 a month (e.g. the example: 2,620 + 1,300 + 400 + 3,300), and 7,620 − 1,521 − 400 − 3,833 = 1,866, the printed value. Her own
claim at 67 would have given 7,620 − 2,028 − 400 − 3,833 = $1,359.

**What is right and stays.** The benefit-by-age arithmetic (`ssBenefit`, SSA's 5/9 %, 5/12 % and 2/3 % monthly rates from FRA); the
breakeven section, which compares the slider with FRA and says so (*"AGE x vs FRA (67)"*); the survivor grid (F-26, `t95` B2); the 81-cell
claiming grid; the explorer notice (*"they only change the analysis shown on this SS tab"*), which is true.

**Severity: low–medium, display only, both directions.** The tab opens on a choice the plan did not make and, for any plan not claiming at
67, reports its cost against a baseline that does not exist. On the reported plan the opening screen says delaying to 67 costs $80K of
extra draws and gains nothing permanent. Engines, the Monte Carlo and every other tab are unaffected.

## 1 · Site census (parser — `qa/tools/census.cjs`, v6.36 source)

| Identifier | AST hits | Lines | Note |
|---|---|---|---|
| `spouseAClaimAge` | 30 | 7419, 9315–9333, 9377, 9381, 9401–9405, 9428–9430, 9474, 9509–9537, 9575–9580, 9587, 9614, 9622 | all inside the SS tab's render (`<anon>@9259`) except the state |
| `setSpouseAClaimAge` | 2 | 7419, 9402 | the state and the slider |
| `spouseBClaimAge` | 13 | 7420, 9317, 9411–9415, 9435–9437, 9602, 9674 | |
| `drawDelta` | 17 | 9376–9385 (computed), 9456–9461 (card), 9639–9640 (window card) | |
| `spouseAFRA` | 17 | 9266 (def), 9273, 9298–9299, 9364, 9552–9562, 9599, 9646–9649 | 9599 is the table's hybrid; 9646–9649 the "permanent" card |
| `fraClaimMonth`, `_ssAYrFRA` | 3, 2 | 9372–9384; 9592, 9599 | both are the **plan's** claim date despite the name |

No slider identifier is read outside the SS tab's render function. **Suite** (a text search, to be repeated with `qa/tools/copylock.cjs`
at the build, §B1a): four suites click the SS tab — `t6` (single filer, couple machinery absent), `t84` G-2 (the shortfall card's label),
`t95` B2 (survivor grid and sentence, on the example and the example with the benefits swapped — both plan spouse A at 67) and `t100`
C-10 (trust-fund preset). None asserts the slider's position, the delta cards or the draw table. `t4`'s signature for the tab is
`TRUST-FUND DEPLETION`, `BREAKEVEN`.

**Boundary census (§K1).** No row covers it; the example plans spouse A at 67, so every figure above is $0-different there. The release
adds one (§4).

## 2 · Register sweep (§K2) — searched for the mechanism, not an ID

`docs/UsabilityFlaws.md`, `docs/MissingFeatures.md`, `docs/ARCHITECTUREIssues.md`, `docs/FlawsToFix-v5_73-Phase2.md`, searched for
*claim-age slider*, `spouseAClaimAge`, `spouseBClaimAge`, *what-if explorer*, *draw delta*, *SS tab*: **no item covers the slider's
start, the baseline or the shortfall card.** Related, not changed: F-26 (survivor grid, fixed v6.32), D-56 (example-valued defaults —
spouse B's default claim age 63 when none is set, L4718; unchanged here). Found while reading, **not in scope**, recorded in §6.

## 3 · Proposed change — and the decisions it needs

**DS-1 · Where spouse A's slider starts.**
- **(a) At spouse A's claim age from My Data, as spouse B's already does** (`PORTFOLIO.incomeSources?.ssA?.plannedAge || 67`). *Recommended.*
- (b) At 67 for both sliders (B changed to match). Consistent, but both open on a choice the plan did not make.

**DS-2 · What the draw comparison measures against.**
- **(a) The plan.** One baseline for the delta card, the draw table and the permanent card: spouse A claims at the planned age at the
  tab's own benefit for that age. At the slider's opening position every delta is $0 and the cards say the slider matches the plan;
  moved, they show what the change does *to this plan*. Labels change from *"vs FRA"* to *"vs your plan (age 65)"*; the table's
  *"DRAW (FRA)"* column becomes *"DRAW (PLAN, AGE 65)"*. The breakeven section keeps FRA as its reference and its label. *Recommended* —
  it answers the question a user moving the slider is asking.
- (b) FRA everywhere: baseline = claims at 67 at the FRA amount, labelled as such; the delta card changed to match. Also consistent;
  answers "how does this age compare with FRA", which the breakeven section already answers.

**DS-3 · How the delta is counted.**
- **(a) One computation, month by month, from the retirement month until both compared claims have started (at least retirement + 8
  years); the table shows each year's sum and the card shows the table's total.** Benefits before retirement are outside the window and
  the tab says so (*"from retirement; a claim before retirement doesn't change portfolio draws here"*). *Recommended* — the card can no
  longer disagree with the table, and nothing is counted that the table doesn't show.
- (b) Keep the card's month count from the claim date, the table annual — the disagreement stays.

**DS-4 · The shortfall card's spouse-B benefit.**
- **(a) Spouse B's benefit at her slider's age, paid only if she has claimed by the shortfall's month** — the same rule the draw table
  already uses for her (*"Spouse B follows HER what-if slider here too"*, L9601). *Recommended.*
- (b) Unchanged — her benefit at her retirement-year age, whatever she plans.

**DS-5 · Which release.** None of the three TY2027 sources is confirmed published as of this scope (not re-checked here — the build
session checks it first, §A0).
- **(a) Build it next as v6.37; the 2027 figures become v6.38** (the `docs/SCOPE_TY2027_REFRESH_V633_V634.md` renumbering, a fourth time).
  If the TY2027 sources are all out when the build starts, swap: 2027 first, this second. The 15 December deadline (DT-7) outranks this
  release either way. *Recommended* — it is small, display-only, and does not touch the tax tables the 2027 release edits.
- (b) Fold it into the 2027 release — one version, but it mixes a presentation fix with a data refresh, which this project keeps apart.
- (c) After the 2027 release.

**DS-6 · Spouse B's "Modeled" age and the note (added at the build, 2026-10-29).** Found while building DS-4: spouse B's grid tagged her
age in the retirement year *"Modeled"*, though the engines pay her from her planned age, and when the two differed a note told the user the
Monte Carlo *"understates Spouse B's income … success rates slightly conservative"* — false (rendered on the example with spouse B planned at
62: tag on 63, note claiming $100/mo). Same code as DS-4 (`spouseBActual`), invisible on the example and on the reported plan.
- **(a) Fold into F-29: tag her planned age, remove the note.** *Recommended; Steve: "Fold into F-29".*
- (b) File it separately.

## 4 · Tests it ships with

New suite **`t101_ss_slider_start.mjs`**, both legs; the v6.36 leg pins the defect as dated `[KNOWN DEFECT 2026-10-29, F-29]` checks.

- **§A by AST:** spouse A's slider state's initializer reads `incomeSources.ssA.plannedAge` (the same shape as B's); no `useState(67)`
  for a claim age; one baseline expression feeds the delta card, the draw table and the permanent card (DS-2, DS-3); the shortfall card
  reads spouse B's slider (DS-4).
- **§B rendered, on six plans:** the example (A 67); A at 62, 65 ($3,322 — the reported plan), 70; a single plan at 64; a couple with B
  planning 67. Each: both sliders open at the plan's ages; the cards at the opening position show the planned benefits, every delta $0,
  the matching-plan wording; the survivor card the larger of the two planned benefits.
- **§C moved, hand-computed:** the reported plan's slider driven to 67 (the native setter, as `t24` does): A card $3,833; the delta equal
  to 24 months × $3,322 = $79,728 from 2029-01 if A's birth month is January (computed in the suite from the plan, not typed); the
  permanent card +$511 / mo; the table's per-year deltas summing to the card (**the extinction check for two baselines**, run on every
  plan at every slider position 62–70); a claim before retirement contributing $0; a delay past retirement + 8 extending the window.
- **§D unmoved:** Engines A–D, the Monte Carlo's schedule and both seeded Monte Carlo engines bit-identical to v6.36 (no engine reads the
  sliders); MC parity 10/10 (expected and blind — nothing in the parity fixtures reaches the tab).
- **§E copy:** the cards' and table's labels; the Field Manual's *SS Claim-Age slider* entry says where each slider starts and what the
  draw comparison is measured against, and §13 carries a v6.37 note.
- **Boundary census:** a new `boundaries.mjs` row, `ss_claim_a_planned_67` — ON when spouse A's planned claim age is 67 (the slider's
  old opening position equals the plan, so the defect cannot be seen); the example is ON (`t29` B-31), a fixture at 65 clears it
  (`t29` C-f29-1).
- **Controls** `qa/tools/controls_v637_ss_slider.py`: put back `useState(67)`; the FRA-amount-at-plan-date baseline; the card's own month
  count; the permanent card against FRA; the shortfall card's retirement-age B; each label; the Field Manual sentence. Each must fire.
- **Re-gate:** whatever `copylock.cjs` finds pinning the old SS-tab copy; `t84` G-2 is expected to hold (the card's label is unchanged).

**Not reached, stated:** the 81-cell claiming grid and the survivor grid are not re-verified beyond `t95` B2 (unchanged code). No
browser layout check is needed unless DS-2's longer labels wrap at 390 px; `t45` runs on the example only, so the build checks the
reported plan at 390 px in Chromium once.

## 5 · Out of scope

- Any engine, and how the Monte Carlo pays Social Security (it uses `plannedAge`, correctly).
- Making the sliders edit the plan — the notice says they don't, by design.
- The survivor rule for an early claimer (RIB-LIM, 82.5 % of PIA): a disclosed simplification (METHODOLOGY's survivor section),
  unchanged.
- The breakeven section's FRA reference.
- METHODOLOGY: no modelling changes, so no section (project convention); the Field Manual carries the copy.

## 6 · Found while scoping — not changed, recorded

- **The tab recomputes every age's benefit from the FRA figure; the engines use the plan's own figure.** For a plan written by My Data
  the two agree (`genSSTable`'s factors are SSA's rates, to four places). For the example — a table with SSA-statement figures — they do
  not: spouse B at 63 is $1,350 on the tab's cards and $1,300 in the plan the engines pay; spouse A at 62 is $2,310 against $2,200.
  Low; display. Recommend adding it to F-29's record as a known difference and filing it if wanted; not fixed here.
- **`spouseBFRAest` falls back to a typed $1,944** when the plan's table has no age-67 entry (L9268). Whether any married plan can
  reach it (a statement listing 66 and 8 months instead of 67, say) was not measured. Belongs with D-56 (example-valued defaults).

## 7 · Build record

### 7.1 What was built (v6.37 — the shipped source and built hashes are in the CHANGELOG's provenance line)

- **DS-1:** both sliders open at `ssTabClaimAge(who)`, a module-level rule: the plan's claim age, rounded, clamped to 62–70, falling back as
  `PLAN_TIMELINE` does (67 for spouse A, 63 for spouse B).
- **DS-2, DS-3:** one monthly series (month index = year × 12 + month) from the retirement month: spouse A at the planned age and the tab's
  own benefit for it, against the slider; spouse B at her slider in both columns. The table's rows are each year's sum and run until both of
  spouse A's compared claims have started (at least retirement + 8); the top card and the *"Total extra draw"* card show the series' total
  **until spouse A's later claim** — see 7.3 for this reading of DS-3; the permanent card is the slider's benefit less the planned one.
- **DS-4:** the shortfall card (and its SWR line, one figure) counts each check once it has started by the shortfall's month, at the
  sliders' ages.
- **DS-6:** spouse B's grid tags `ssTabClaimAge("B")` *"Modeled"*; the note is gone.
- **Copy:** the cards and table name spouse A (*"Spouse A's slider = your plan (age 65)"*, *"DRAW (SPOUSE A AT PLAN, 65)"*, *"Total extra draw
  (until Spouse A's later claim)"*, and for a couple *"Spouse B's check follows Spouse B's slider in both columns"*); the Field Manual's slider
  entry and a §13 note.

### 7.2 The build review (independent agent, unanchored) — five should-fix, four nits, all taken

1. *"Plan"* and *"both claims"* were ambiguous once spouse B's slider moved (B is on both sides) — the copy now names spouse A, and the delay
   card says spouse B's check follows her slider in both columns.
2. DS-3's reading (7.3) was not recorded — recorded here.
3. **A new crash path:** spouse A's initializer took `plannedAge` as stored; a backup carrying 65.5 (the import clamps the range, not the
   type) would make the tab's age lookup return nothing and throw into the app-wide error screen. One rule, `ssTabClaimAge`, now rounds and
   clamps for both sliders and both planned ages; `t101` B-8 renders 65.4 and the string "65"; control K14.
4. The example's shortfall card now reads $2,570 against the Income tab's $2,620 — the §6 table-vs-formula difference, which v6.36's
   retirement-age lookup happened to hide on the example. **Not changed** (it is DS-4 as decided, and a fix is the §6 question); recorded
   in F-29 and the CHANGELOG, and offered to Steve as a follow-up.
5. The §13 note overclaimed (*"it does not"* — the tab still, correctly, says the spousal top-up is not modelled): it now says the Monte
   Carlo pays that spouse from the claim age in My Data.
6. (nit) Spouse B's fallback age is now the engines' 63, not 67 — the same rule as (3).
7. (nit) Four things the build did beyond the scope's words, all display-only, now recorded: a single household's table no longer counts the
   placeholder spouse B's check ($1,944/mo from spouse A's 67th year — `t101` C-13, control K10); the shortfall card's "once started" rule
   applies to spouse A too (DS-4 named B; one rule for both checks); the table's SS columns show the December check; the window counts from
   January of the retirement year (the model retires on 1 January).
8. (nit) The SWR line now reads the same figure as the shortfall card (`t101` B-6 reads it); the *"both start by retirement"* line is checked
   (B-7). §D still skips, with a printed line, outside a v636 → v637 folder (as `t100`'s does). Control K9 plants the note's words rather
   than restoring the note — kept, recorded as weak.

### 7.3 DS-3, as built — a reading of the scope's words

DS-3 (a) said *"the table shows each year's sum and the card shows the table's total"*, and §4 *"the table's per-year deltas summing to the
card"*. The table also shows the years after both of spouse A's claims have started, where the permanent difference continues (on the
reported plan 65 → 67: +$40K, +$40K, then −$6K a year). Summing every row would make the card's figure depend on where the table happens to
stop. The build therefore gives the card the series' total **until spouse A's later claim** — what the card has always been labelled
(*"Extra draw during delay period"*) and what §4's own worked figure ($79,728 = 24 × $3,322) assumes — and names its window on screen
(*"vs your plan, Jan 2029 to Dec 2030"*). The card and the table remain one computation; `t101` C-9 holds each row and the card to a model
computed in the suite on 72 plan × position cells.

### 7.4 Measured

- On the reported plan (spouse A 65, $3,322), v6.37 opens at 65, BASELINE, every delta —; moved to 67: *"+$80K"*, *"+$79,728"* until spouse
  A's later claim (Jan 2029 to Dec 2030), *"+$511/mo"* permanent. v6.36 showed +$80K beside a table summing to +$92K and $0 permanent.
- Suite and controls: see the CHANGELOG entry (counts parsed from the run from the packaged copies).

## 8 · Register text — UsabilityFlaws F-29 (as drafted at the scope; the filed entry, written at the build, supersedes it)

> **F-29 · The SS tab's claim-age explorer opens at 67 for spouse A and compares against a baseline that doesn't exist — LOW–MED
> (honesty of an output)** — filed 2026-10-29, OPEN. Spouse A's slider starts at a literal 67 (spouse B's at her plan); the delta card
> compares with the plan, the draw table with the FRA amount paid from the plan's date, and the permanent card with FRA. On a plan
> claiming at 65 ($3,322) the tab opened on *"+$80K"* of extra draws and *"$0"* permanent gain, beside a table summing to +$92K; moving
> 65 → 67 is +$511 a month. The shortfall card takes spouse B's benefit at her retirement-year age. Invisible on the example (spouse A
> plans 67). Display only. `docs/SCOPE_F29_SS_SLIDER_START.md`.
