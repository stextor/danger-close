# SCOPE — v6.28 · F-23 and F-24: the app describes the model, it does not tell the user what to do

**FULFILLED at v6.28 (2026-10-22; build record §7).** **DECIDED 2026-10-21 — all eight as recommended:** DF-1 (a) *"Real cost, weights as points"*, DF-3 and DF-4 (a) *"Both as recommended"*,
DF-5 (a) *"Keep the examples"*, DF-2, DF-6, DF-7 and DF-8 (a) *"All as recommended"*. Steve, 2026-10-21: *"go"* (F-23 with F-24), then, on
the census below, *"Directives + F-24 (Recommended)"*. That choice sets the size: every financial directive, clear and borderline, recast as
what the model computes or assumes; F-24; and the false statements about the model found while doing it. The editorial claims and the
unchecked model-behaviour claims the census found are **filed, not fixed** (§4, a new UsabilityFlaws **F-25**).

Scoped against **v6.27** (source `32b34771da6e55edc80a71519bbe01aa`, built `deac8c16f4238d8b8519f656e5c646ff`, repo `310b134`). At the §A
check (2026-10-21) the pool's `DangerClose-v6_27.jsx` hashed to the manifest's md5, the manifest and the CHANGELOG both named v6.27, and a
fresh clone carried the same source and page. Repo-only (`docs/`). Planned as a **presentation release**: no engine, figure, grade or stored
field changes. **Displayed figures that change:** F-24's *"Lost ~X GPA points"* (DF-1), the Withdrawal tab's Priority-1 *"Years active"*
year (DF-7), and the Grade tab's rough RMD estimate, which is removed (DF-8); the Income Floor drag's dollar figure under DF-2. No grade
moves. Line numbers are v6.27's. An independent agent reviewed the scope before Steve saw it (§6).

## 0 · Premise (verified at v6.27)

### 0.1 What the registers say

- **UsabilityFlaws F-23** (filed at v6.27 from the F-22 scope's §K2 sweep, which said it was not exhaustive). It names four surfaces: the
  Withdrawal tab's Step 7, the Guardrails tab's *ACTION:* lines, three Exit Plan items, and the plan-events list's Roth instructions.
- **UsabilityFlaws F-24** (filed at v6.27 by the build review). It names:
  - the Grade tab's *"Lost ~X GPA points"*, which divides by 100 where the weights sum to 78;
  - Income Floor's editorial drag and its omission of income streams;
  - the Estate drag's unsourced legal claims;
  - *"Strong base-case performance"*;
  - the LTC test matching a long-term-disability row;
  - Tax Efficiency's rough RMD estimate.
- **§K2 sweep** of `UsabilityFlaws.md`, `MissingFeatures.md`, `ARCHITECTUREIssues.md` and `FlawsToFix-*` for the mechanisms touched: Exit
  Plan, Step 7, *boost Roth*, harvesting, *excluded from MAGI*, *Recommendation:*, the strategy comparison, *ACTION REQUIRED*, `lossPts`,
  *GPA points*, Income Floor, *optimizer*. Only F-23 and F-24 register any of them. MissingFeatures D-56 (the literal grades) is adjacent and
  unchanged.

**The premise holds. F-23 is about ten times wider than registered.**

### 0.2 The census — method

Every piece of user-facing text was extracted by parser, not grep (`f28tools/texts.cjs`, an acorn + acorn-jsx walk):
- string literals, template-literal parts and JSX text, with their line and enclosing function;
- the Field Manual (`DOCS_HTML`, L4836), converted to text by jsdom rather than by a regex strip (the lossy-decode trap,
  MissingFeatures v5.48 errata) and split into block elements with their section.

That gave 13,177 pieces. Of them, **1,889 prose pieces** were read (six or more words; the demo briefing, the AI ground rules and the Verify
tab's check labels left out). Each was tagged with the tab it renders on, from the `activeTab === "…"` ranges.

They were read twice:
- **Four independent readers** each classified a quarter: D = financial directive, E = editorial or unsourced claim, V = a specific claim
  about the model worth checking. They flagged 279 entries.
- **Two further readers** re-read the app's tabs (the first 1,212 pieces) for directives and normative steering only.

Then:
- I read every entry flagged D or D? against the source and adjudicated it: §1 changes it, or §4 says why it stays. The review counted
  91 such entries where this line first said 84; the eleven it found undispositioned are in §4.
- A second pass over the **short** pieces (under six words) for normative words found two the readers could not see, because they had been
  filtered out: the Roth tab's *"Target bracket: 22% (ideal) or 24% (ceiling)"* (L10819) and the Withdrawal tab's *"Recommendation:"*
  label (L10297).
- Together the six readers flagged **283 entries**. An entry can carry more than one tag; the tags are 39 D, 52 D?, 102 E and 151 V.
  The tags are model output. §1 is the adjudicated directive list.

### 0.3 False statements about the model, checked in the source

The census tagged 151 entries V. **These eight were checked**, because they sit in or beside the copy this release rewrites, or because the
census message to Steve named them. Each is false at v6.27:

| # | Where | Says | The code |
|---|---|---|---|
| V-1 | SS tab, *Critical considerations* (L9113) | *"Medicare IRMAA not affected by SS claiming age (SS excluded from MAGI)"* | Engine C's MAGI is `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y + ordDraw_y` (L5753): taxable Social Security is in it, as the law has it (MAGI = AGI + tax-exempt interest; AGI includes taxable benefits). So the claim age moves MAGI in the years benefits are paid. |
| V-2 | Guardrails tab, header (L10001) and the upper box (L10019); `GUARDRAILS` comment (L1049) | *"Increase spending 5% or boost Roth conversions"* / *"redirect to Roth conversions"* | Both Monte Carlo engines raise spending 5% at the upper rail (`spendingAdj *= (1 + GUARDRAILS.raisePct)`, L2831, L3079). No engine changes a conversion. |
| V-3 | Withdrawal tab, Step 6 (L10217) | *"when equities are up substantially, gains are harvested to replenish the cash and bond sleeves"* | No engine harvests or rebalances into the sleeves: no such operation exists in `computeWithdrawalPlan` (L5828–6408) or either Monte Carlo engine. Engine D draws from the buckets B1 → B4 and grows each at its own rate. |
| V-4 | Withdrawal tab, Step 7 (L10218) | *"Execute planned Roth conversion … to fill 22% bracket. Pay conversion taxes from Taxable account"* | Engine D converts the **slider amount** each year from the retirement year to the ladder's end (`Math.min(rothAmount, _bucketConvCap)`, L6170), not a bracket fill. It pays **no** conversion tax: the conversion *"shifts character, not totals"* (comment, L6022). The tax is on the Taxes tab. The same tab's Conv column says it is the slider. |
| V-5 | Withdrawal tab, Step 8 (L10219) | *"Apply Guyton-Klinger guardrails: if EOY portfolio < 80% of plan, cut discretionary spending 10% next year"* | Engine D, the schedule this panel describes, applies no guardrail (`GUARDRAILS` is read only by the two Monte Carlo engines and the displays: L2828, L3078, L7094, L7411, L9449, L12689). The Monte Carlo multiplies the **whole** monthly expense by 0.90 (`spendingAdj`, L2810, L3026), and again at each later breach, not a "discretionary" part. |
| V-6 | Withdrawal tab, Priority 1 (L10177) | *"Years active: {retireYear} → ~{retireYear + 3} (until depleted)"* | A fixed three years for every plan. The schedule knows the year the Priority-1 pool reaches $0. |
| V-7 | Stress tab, scenario cards (L12587) | the hedge sleeve is *"harvested into depressed equities when triggered"* | No engine moves money between sleeves. The Monte Carlo grows one balance at the holdings' mix, which drifts only with contributions (L2796–2800). |
| V-8 | Grade tab, Sequence Protection drag (L9395) | cash and bonds are *"the buffer that determines whether a poor early-retirement sequence would force selling equities at a loss"* | The Monte Carlo, which sets the success rate, draws from the whole balance at its mix, never sleeve by sleeve. Engine D draws B1 → B4, but no figure on the Grade tab comes from it. |

Found by the scope's review and confirmed in the source:

| # | Where | Says | The code |
|---|---|---|---|
| V-9 | Withdrawal tab, Section B (L10163–10205) and the Field Manual's Withdrawal entry (id 1565) | Priority 2 Traditional, then Priority 3 Roth; *"The bucketed portfolio then follows in Taxable → Traditional → Roth order"*; *"higher-tax assets get preserved when possible"* | Engine D holds Traditional and Roth as **ratios inside each bucket**, not pools (comment, L5924–5930). A bucket draw takes them in proportion: `tradDraw = _spendFromBuckets * tradFrac` (L6205), and `tradAmt`/`rothAmt` both fall by `otherDraw × frac` (L6219–6220). The order is the Priority-1 pool, then B1 cash → B2 bonds → B3 equity → B4 hedge (L6069–6073), Traditional and Roth pro rata within each. |
| V-10 | Stress tab, scenario cards (L12586, L12607) | *"defensive response runs entirely through cash and bond reserves"*; *"Reserve defense: Cash+bonds … years of expenses without selling equities"* | The Stress tab runs the Monte Carlo, which draws from one balance at the holdings' mix (V-7, V-8). |
| V-11 | Dashboard (L11602) | *"Guardrails trim spending ~10% … — the Withdrawal tab shows the year-by-year schedule"* | The schedule applies no guardrail (V-5). |
| V-12 | SS tab, the survivor-benefit card (L8952–8955) | *"When {nA} dies, {nB} receives the higher of her own benefit or {nA}'s. {nA} is the higher earner — his claiming age directly sets {nB}'s survivor income floor."* | The card is gated only on a couple (`!_single`). It states that A is the higher earner on **every** couple, whichever check is larger. The pronouns are typed; the plan has no sex field. |

**A figure found by the review, filed, not fixed (F-25):** the gap draw. The Grade tab's Income Floor drag computes
`m × (POST_MONTHLY_EARLY − getSSB() − getPension())` (L9378–9379). The Income tab's own gap card (L8347–8348) subtracts streams that the Grade's
drag ignores. Both subtract **spouse B's** Social Security for the whole gap, even when B claims after A (the `couple` fixture: B in 2034-06,
A's gap 2031-01 to 2032-06). Both figures are displayed, and they disagree. Fixing them changes displayed figures, so it is its own release
(DF-2 keeps this release from repeating it).

Two more are true but mean different things in different engines, and are stated precisely where this release touches them:
- The Income tab's *"sourced from cash and bond holdings first"* (L8575) is true of Engine D after the Priority-1 pool, and not of the
  Monte Carlo.
- `GUARDRAILS`'s source comment (L1047–1050).

**Not checked, and filed (F-25):** the rest of the V-tagged entries. Several are plausibly false. Examples:
- the IRMAA tab's *"the Single thresholds, which are half these figures"* (the top tiers are $500,000 and $750,000);
- *"Roth conversions have no withholding"* (L2481), against the Exit Plan's own *"elect federal withholding on IRA distributions"*;
- the Field Manual's *"Switch to BEAR"* (the presets are named otherwise);
- a 2032 / 2033 trust-fund year disagreement in the Field Manual.

They are listed in §4 so F-25 starts from a census and not from nothing.

### 0.4 F-24, measured

- **"Lost ~X GPA points"** is `(4 − gpa) × weight / 100` (L9557), and the weights sum to **78**. Rendered on the example (v6.27, from `t90`'s
  seeded dump):
  - MC A 4.0, Income Floor B 3.0, Sequence A 4.0, LTC C+ 2.3, Tax B+ 3.3, Cost A 4.0, Guardrail B- 2.7, Diversification B+ 3.3, Estate D 1.0.
  - Shown: Estate **0.24**, LTC **0.17**, Income Floor **0.10**.
  - Their real cost to the overall GPA, by hand (÷ 78): Estate 3.0 × 8 / 78 = **0.308**, LTC 1.7 × 10 / 78 = **0.218**, Income Floor
    1.0 × 10 / 78 = **0.128**. The six shortfalls sum to 64.5 / 78 = **0.827** = 4.00 − 3.173, the overall GPA (3.17 rendered).
  - The *"Weight: 20%"* chips and the list's *"20%"* column sum to 78%.
- **Income Floor** counts Social Security and the pension only (`totalIncome = spouseBSS + pension + spouseASS`, L9300). The `couple`
  fixture's $1,200 rental appears in neither its *"covers N%"* nor its dollar figure. Its drag says the gap *"requires ~$XK accelerated
  portfolio draw at peak sequence risk"* (L9380).
- **Estate Readiness drag** (L9474) states legal effects as fact: *"an incapacity forces a court guardianship"*, *"stale beneficiary
  designations override the will entirely"*. The fully-done branches judge: *"survivors have what they need"*, *"not urgent"*.
- **Monte Carlo drag** (L9364): *"Strong base-case performance"* at ≥ 90% is evaluative, and the rate is not a base case. Between 88% and
  90% the grade is B+ (3.3), so the label reads **STATUS** while the sentence reads *"Fewer than 90%…"* (the label follows `gpa >= 3.3`,
  L9547; the sentence follows `successRate >= 0.90`).
- **The LTC test** `/ltc|long.?term/i` (L9355, the Grade tab; L11921, the Monte Carlo tab's LTC card) matches *"Long-term disability"*.
  Text only on both tabs: `_hasLTCrow` and `hasLTCprem` choose a sentence and feed no figure. Two copies live in the suite: `boundaries.mjs`
  L406 (`ltc_row`) and `t29` L254 (control C-ltc). The F-24 entry and the source comment at L9353 call the second app copy "the Stress
  tab's"; it is the Monte Carlo tab's (L11624–11957).
- **The STATUS / DRAG label** follows `gpa >= 3.3` (L9547) on every category, so a B+ row prints its drag as *"STATUS:"*. The rendered cases:
  - Monte Carlo at 88–90%: `single` 88.1%, `couple+LTC` 89.2%;
  - Income Floor at B+: `couple`, *"STATUS: 17-month SS income gap requires…"*;
  - Estate Readiness can grade A- with survivor-critical items open.
- **Tax Efficiency's RMD estimate** (L9417–9422) grows the **household's** Traditional balance over the **ladder's** length and divides by
  **spouse A's** divisor. It is labelled rough. No grade reads it.

### 0.5 Boundary census (OPERATIONS §K1)

`ltc_row` (v6.27) is ON for the example, which carries *"Long-Term Care (Hybrid)"*. The disability false positive is invisible there, and
in every fixture: none carries a disability row. Under the maintenance rule a row is added: **`ltc_disability`** (§3, E).

Everything else here is visible on the example:
- Steps 6–8, the guardrail boxes and the Exit Plan render on every plan.
- The GPA figure is wrong on every plan.

## 1 · What changes — the adjudicated list

The *"#"* numbers are the census piece ids (`f28tools/rows.json`). Every item keeps its logistics: dates, deadlines, where and how to file,
what to ask HR, *"confirm with…"*. What goes is the instruction to make a particular **financial** choice, and the judgement attached to it.
What replaces it says what the model does or assumes, or which tab compares the choices.

### 1.1 Plan-events list and alarm strip (`computePlanEvents`, L2340–2520)

| # | Now | Change |
|---|---|---|
| 65 | Roth: *"Convert the planned amount … before Dec 31 … Pay the tax from the taxable account. December = last call …"*; `when`: *"execute {yr} conversion by Dec 31"* | Stated as a conditional deadline: the model converts the slider amount each ladder year; a conversion counts for the year it is completed, so a conversion for {yr} must be done by Dec 31; conversion income sets Medicare premiums two years later (IRMAA tab). No tax-source instruction. The chip and strip wording is **DF-6** |
| 68 | first RMD: *"usually better to take it in {yr}"* | the fact only: deferring to Apr 1 puts two RMDs in one tax year |
| 87 | ACA: *"coordinate the conversion amount (Roth tab) with the subsidy cliff"* | *"Roth conversions raise MAGI; once a benchmark premium is entered, the Roth tab's strategy table shows the subsidy each strategy loses"* |
| 70 | SS filing: *"the survivor-benefit analysis there shows what delaying protects"* | *"…shows what each claim age pays a survivor"* |
| 93 | annual review: *"check actual spending vs the guardrails (Guardrails tab)"* (that tab shows no actual spending) | *"compare your actual balance with the Guardrails tab's bands"* |

### 1.2 Checklist items (L3308–3349)

| # | Now | Change |
|---|---|---|
| 135, 137 | *"Consider whether an irrevocable trust fits …"*; When: *"If your estate is large or you have specific protection goals"* | What it is and who decides: an irrevocable trust (used for asset protection, estate-tax and Medicaid planning); whether one fits is a question for an estate attorney |
| 106 | revocable trust When: *"…if probate avoidance or incapacity planning matters to you"* | the same treatment |
| 99 | *"Claiming early permanently reduces both"* | *"…reduces the monthly benefit and a survivor's, for life"*: precise; the lifetime total depends on longevity |

The checklist's other *"why"* sentences carry legal claims (for example *"Beneficiary designations OVERRIDE your will"*). Those are E-class
and filed (F-25). The checklist is the user's own estate to-do list, so its items stay as tasks.

### 1.3 Exit Plan tab (L7797–7958) — **DF-4**

The tab is the strongest instance:
- its header calls it *"How to actually retire"*;
- its phases issue moves: *"Elect the pension's joint-&-survivor option"*, *"Build 1–2 years of spending into a … money-market"*,
  *"Withdrawal order, generally: taxable first → tax-deferred → Roth last"*, *"Often the highest-value move in the whole transition"*;
- its *LANDMINE* lines direct when to retire: *"Don't give notice until it isn't"*, *"Do NOT submit your notice until…"*;
- its own footer says *"This is logistics — not financial, tax, or legal advice"*.

Census items: 261, 262, 266, 267, 269, 270, 271, 273, 275, 279, 280, 281, 282, 283, 284, 291, and the header.

Under DF-4 (a), each phase keeps:
- its dated logistics (Medicare enrolment and the Part B penalty, COBRA's 18 months, SSA's 4-month lead, the HR checklist, RMDs mandatory
  from {age});
- a *"Decisions in this step — and what the model assumes"* list in place of the directives. For example:
  - pension, for a couple with a pension only: *"the model continues the pension in full to a survivor (a joint-and-survivor election); the
    election is made with the plan administrator"*;
  - claim ages: *"the model uses the ages in My Data; the SS tab compares each"*;
  - withdrawals: *"the Withdrawal tab's schedule draws Other accounts, then cash, bonds, equities"*;
  - Roth window: *"the Roth tab compares conversion amounts in {start}–{end}"*.

The *LANDMINE* boxes keep the facts (an uninsured gap; COBRA's limit; RMDs) and lose the instructions. The fee-only planner line becomes the
footer's existing *"confirm with … a fee-only fiduciary planner / CPA"*.

Census check: `t4` signs the tab with *"CONFIRM THE MONEY WORKS"*, *"LOCK IN HEALTH COVERAGE"* and *"LANDMINE"* (L306). These are gated per
leg if any changes (§3).

### 1.4 Income tab (L8456–8578)

| # | Now | Change |
|---|---|---|
| 359 | *"This is the single largest income risk. Each year delayed eliminates 12 months of gap exposure."* | the mechanics only: the gap runs {m} months from retirement to {A}'s claim; the model draws it from the portfolio |
| 379 + L8577 | *"…in this model, sourced from cash and bond holdings first"*; *"The critical vulnerability … at the worst possible time"* | where each engine draws: the Withdrawal schedule after the Other accounts, cash, then bonds, then equities; the Monte Carlo from the whole portfolio at its mix. The editorial clause goes. The gap figure is unchanged (filed, §0.3) |

### 1.5 Social Security tab (L8586–9289)

| # | Now | Change |
|---|---|---|
| V-1 | *"Medicare IRMAA not affected by SS claiming age (SS excluded from MAGI)"* | corrected: taxable Social Security is in MAGI, so the claim date changes MAGI in the years benefits are paid. The IRMAA tab follows the claim dates in My Data (Engine C, L5609); this tab's slider is a what-if and does not move it |
| L8953–8955 | *"SURVIVOR BENEFIT — THE #1 OPTIMIZATION LEVER"*; *"{nA} is the higher earner — his … her"* | *"SURVIVOR BENEFIT"*; the sentence names the plan's actual higher check (the larger FRA benefit, as the couple's-twist card already computes: `isLowerEarner = fraB <= fraA`, L9143), in both directions, with names, not pronouns (V-12) |
| 474, 476, 478 | *"which is why the standard analysis leans toward the lower earner claiming earlier"*; *"The survivor-protection logic that usually argues for the primary earner delaying"* | the facts the paragraph already computes (whose record pays to which death, the breakeven against the projected first death), without the appeal to "standard analysis" |
| 480 | *"HOUSEHOLD LIFETIME OPTIMIZER (WHAT-IF)"* | *"HOUSEHOLD LIFETIME COMPARISON (WHAT-IF)"*; the grid already marks *"the model's best cell"* |
| 396 | *"the best cell and your current plan both recompute"* | *"the model's best cell…"* (the convention) |

### 1.6 Grade tab — F-24 (L9290–9590) — **DF-1, DF-2, DF-8**

- **The figure (DF-1).** `lossPts = (4 − gpa) × weight / Σweight`: each category's real cost to the overall GPA. They then sum, over all nine,
  to exactly 4 − GPA. Weights show as points (*"Weight: 20 of 78"*, and *"20"* in the list), not percents. **The cut-off moves with it,
  stated in raw points:** a category shows when `(4 − gpa) × weight > 5`, which is v6.27's `> 0.05` at ÷ 100 exactly. Kept on the new
  figure, a B Cost Structure (5.0 raw: 0.05 at ÷ 100, excluded; 0.064 at ÷ 78) would start to show. Under this rule the same categories show
  on every plan, and only the figure changes. On the example the top three are unchanged (Estate 0.31, LTC 0.22, Income Floor 0.13).
- **The STATUS / DRAG label:** *"STATUS:"* only at a GPA of 4.0, otherwise *"DRAG:"*, so that a sentence explaining lost points is labelled as
  one on every row (§0.4).
- **Monte Carlo** drag: one sentence on every plan, no threshold: *"{rate}% of paths end above $800K. This rate comes from the 6-year Monte
  Carlo, which carries no long-term-care event; the 30-year Monte Carlo and the Stress tab model one."* That ends the STATUS / DRAG mismatch
  and keeps `t90` B-4's phrase.
- **Income Floor (DF-2).** The drag states the gap in months, with no dollar figure: *"{m} months between retirement and {A}'s Social Security;
  the Income tab's gap card shows the draw."* That avoids repeating the gap figure filed in §0.3. The evidence says the floor counts Social
  Security and the pension only; the Income tab's floor also counts income streams.
- **Sequence Protection (V-8):** *"{y} years of expenses sit in cash and bonds; the grade reads this figure."*
- **Cost Structure:** *"No drag — …"* becomes *"Graded A: the blended cost is under 0.20% a year."* (the grade's own threshold).
- **Estate Readiness:**
  - open items: lists them and says what the grade counts (survivor-critical items 70%, the rest 30%), with no legal claims;
  - all done: *"Every checklist item is marked done."*;
  - critical done: *"Every survivor-critical item is marked done; N others are open."*
- **The LTC test**, one module-level function both tabs call (`isLTCLabel`): `/\bltc|long[\s\-–—]?term[\s\-–—]?care/i`.
  - It still matches *"Long-Term Care (Hybrid)"*, *"LTC premium"*, *"LTCI premium"*, *"LTCi"* and an en-dashed *"Long–term care"*.
  - It no longer matches *"Long-term disability"*.
  - The review found the first draft's pattern dropped three of those.
  - `boundaries.mjs` and `t29` call the leg's own function through the shim where it exists (v6.28), and keep their copy of the old pattern
    for the v6.27 leg.
  - The comment at L9353 is corrected (the Monte Carlo tab, not Stress).
- **Tax Efficiency RMD estimate (DF-8)** — see §5.

No category's grade or GPA expression changes. `t90` B-8 compares every plan's grades with the v6.27 leg's under one seed.

### 1.7 Guardrails tab (L9998–10060)

| # | Now | Change |
|---|---|---|
| 583 | *"Lower guardrail (80%) → cut spending 10%. Upper guardrail (120%) → increase 5% or redirect to Roth conversions."* | *"The Monte Carlo's rule, checked once a year: below 80% of the planned path it cuts monthly spending 10%, and above 120% it raises it 5%, each change compounding on the last."* (The check falls every fourth quarter from the as-of date, L2826, L3076, so not always at a year-end.) (V-2; the figures read from `GUARDRAILS`) |
| 586, 588, 590 | *"ACTION: Cut next year spending by 10%"* / *"ACTION: Continue as planned"* / *"ACTION: Increase spending 5% or boost Roth conversions"* | *"MODEL: cuts next year's spending 10%"* / *"MODEL: spending unchanged (inflation-adjusted)"* / *"MODEL: raises next year's spending 5%"* |
| chips L10033–10035 | *"⚠ CUT SPENDING"* / *"▲ CAN INCREASE"* / *"✓ ON TRACK"* | *"⚠ BELOW LOWER BAND"* / *"▲ ABOVE UPPER BAND"* / *"✓ WITHIN BANDS"* |
| 595 | *"The spending cut rule (10% reduction) prevents the spiral from accelerating, buying time for equities to recover."* | removed. The paragraph keeps what the columns are |
| L1049 | source comment *"(or Roth convert)"* | corrected |

`t4` signs the tab with *"GUYTON-KLINGER"*, *"80%"* and *"120%"*. All three stay.

### 1.8 Withdrawal tab (L10062–10312) — **DF-3**

- **Section B (account priority) — V-9.** The three cards claim an order the engine does not have. They become the order it does have:
  1. **the Priority-1 pool** (Other accounts and the emergency fund);
  2. **the bucketed holdings**, cash → bonds → equities → hedges, with **Traditional and Roth drawn in proportion** within each bucket;
  3. RMDs from where they sit.

  Each card keeps its balances, tax treatment and RMD facts. Also:
  - the *"Why first / second / last"* lines go;
  - *"Fill 12%/22% brackets opportunistically"*, *"Best inheritance vehicle"* and *"Reserve for … Tap only when…"* go;
  - the header's *"higher-tax assets get preserved when possible"* goes.

  *"Years active: → ~{retireYear+3}"* follows DF-7.
- **The order of operations (Steps 1–8)** is rewritten as what `computeWithdrawalPlan` does each year:
  1. income (Social Security, pension, streams, the example's built-in work);
  2. each spouse's RMD at their own age, from where it lives;
  3. the shortfall;
  4. the Priority-1 pool, then cash, bonds, equities, hedges, Traditional and Roth in proportion;
  5. the conversion: the slider amount, {retireYear}–{end};
  6. **no income tax of any kind is paid in this schedule** — on draws, RMDs, gains or conversions; the Taxes tab computes it;
  7. no guardrails in this schedule (the Monte Carlo applies them).

  Steps 6–8's false claims go (V-3, V-4, V-5). The heading keeps *"ORDER OF OPERATIONS"* (`t4`).
- **Section C (three-strategy comparison, L10225–10300):**
  - uncomputed ratings (*"Strongest"*, *"Lowest"*, *"High — …"*);
  - *"Best when"* suitability rows;
  - *"Heirs inherit mostly Roth (best …)"*;
  - *"Three viable withdrawal philosophies"*;
  - a **"Recommendation:"** box: *"Most retirees blend cash-first … The schedule in Section A above models exactly this blend."*
    Section A models no guardrails and no bracket fill (V-4, V-5).

  DF-3 decides its fate.

### 1.9 Roth tab (L10313–11154)

| # | Now | Change |
|---|---|---|
| L10819 | *"Target bracket: 22% (ideal) or 24% (ceiling)"* | what the ladder card computes. The card's *"Tax source: Emergency fund, …"* line is checked at the build: corrected if it misdescribes the engine, else kept |
| 744, 755, 756 | *"The classic guideline says pay from outside money…"*; *"'Pay the tax from outside money' is the standard advice"*; *"…doesn't kill the conversion case"* | what each funding choice puts in the Roth, and that Steps 3–4 compare them on the plan's figures |
| 745 | *"the 'widow's penalty' this ladder exists to convert ahead of"* | *"…the 'widow's penalty': Single brackets on a survivor's income"* |
| 777 | *"…worked examples of why paying conversion tax from retirement assets … costs real money"* | *"…worked examples of what each funding choice costs"* (follows DF-5) |

### 1.10 IRMAA tab (L11448–11543)

| # | Now | Change |
|---|---|---|
| 924 | *"…a common way retirees manage these cliffs"* | removed |
| 950 | *"trim the Roth slider if you want to stay under"* | *"the Roth slider sets the conversion amount, which is most of the MAGI in conversion years"*. Checked at the build: the second clause is said only if it holds on the plan, else dropped |

### 1.11 Survivor tab (L12482–12490)

1143–1145: *"This is a strong argument for front-loading Roth conversions while both spouses are alive and filing jointly — exactly the
strategy on your Roth tab. Converting now, at MFJ rates, shields the survivor…"* becomes *"The Roth tab's comparator includes the survivor's Single years in each
strategy's lifetime tax, so its figures show what conversions change there."* The review found the first draft's *"runs conversions in the
years you both file jointly"* false: `runRothStrategies` converts through each spouse's ladder end (L5126–5127), past a first death that
comes earlier.

### 1.12 Stress tab (L12587)

V-7 and V-10: the hedge sentence and the two cash-and-bond sentences (L12586, L12607) state what the model does. Each sleeve's return is
drawn per scenario and the Monte Carlo draws from the whole balance at its mix; nothing is moved between sleeves. The cash-and-bond years
figure stays, as a fact about the holdings.

### 1.12a Dashboard (L11602)

V-11: *"Guardrails trim spending ~10% if the balance falls to 80% of plan — the Withdrawal tab shows the year-by-year schedule"* becomes:
the Monte Carlo's rule (from `GUARDRAILS`), the Withdrawal tab's schedule, and that the schedule applies no guardrail.

### 1.13 The Field Manual (`DOCS_HTML`)

| # | Section | Change |
|---|---|---|
| 1569–1579 | **"⚠ PAY CONVERSION TAX FROM OUTSIDE FUNDS — NOT FROM RETIREMENT ASSETS"** with Examples 1–3, *"never really means never"*, *"Rule of thumb: under 59½, never withhold"*, and Example 3's *"avoid withholding specifically: pay the tax from current cash flow via estimated payments"* and *"size conversions so the reduced benefit still clears the bar"* | **DF-5** |
| 1563 | Guardrails entry: *"Cut spending if…; raise it if…"* | the Monte Carlo's rule, as on the tab |
| 1565 | Withdrawal Strategy entry: *"a 3-strategy comparison"*, *"The bucketed portfolio then follows in Taxable → Traditional → Roth order, with an 8-step order-of-operations"* | the engine's order (V-9), DF-3 and the rewritten steps |
| 1594 | Exit Plan entry: *"a sequence of moves … landmines to avoid"* | follows DF-4 |
| 1610 | Survivor entry: *"Argues for front-loading Roth conversions"* | as on the tab |
| 1554, 1521 | *"Claiming-age optimizer"* (SS entry), *"drives the claiming optimizer"* (Controls) | *"comparison"* |
| 1581; L14197, L14262 (My Data) | *"the Roth optimizer"*, *"the SS optimizer"* | *"the Roth tab's comparator"*, *"the SS tab's comparison"*. The *What's new* history line (*"the Roth solve-for optimizer"*) is history and goes on the lint's allow-list |
| glossary | *"Guyton-Klinger Guardrails — Dynamic spending rules: cut if the portfolio falls…, raise at an upper band"* | the rule, as the model applies it |
| 1723, 1725 | HSA: *"The safe move: stop contributing at least six months before…"*; *"so don't lean on it right at your cutoff"* | the rule and its consequence: contributions inside the six-month retroactive window become excess contributions; the last-month rule's testing period |
| 1624 | Events: *"green = action window open (go)"* | follows DF-6 |
| §13 | — | a v6.28 entry first, as each release has |

### 1.14 METHODOLOGY §9

It says the schedule's sequencing and *"Guyton-Klinger–style guardrails at 80%/120% … with spending adjustments on breach"* in one sentence,
and that *"The comparison table presents … strategies descriptively"*. Corrected:
- the guardrails are the Monte Carlo's, raising spending 5% and never touching conversions;
- the schedule applies none and pays no income tax;
- it draws Traditional and Roth in proportion within each bucket (V-9);
- the comparison table follows DF-3.

That is a corrected description, not a modelling change: no engine changes.

## 2 · Site census (code this touches)

| Site | Lines (v6.27) | Change |
|---|---|---|
| `GUARDRAILS` comment | L1047–1050 | comment only |
| `computePlanEvents` — Roth, RMD, ACA and SS items | L2340–2460 | `instructions` and `when` strings; DF-6 |
| Checklist items `trust`, `irrtrust`, `ss` (ids are stored keys; unchanged) | L3308, L3315, L3347 | `what`, `when` strings |
| `DOCS_HTML` | L4836 | the §1.13 sections |
| Alarm strip / Events chips | L7693, L7756–7770, L7802 | DF-6 |
| Exit Plan tab | L7797–7958 | DF-4 |
| Income tab | L8460, L8575–8577 | sentences |
| SS tab | L9113, L9189–9191, L9249, L8652 | sentences, one heading |
| Grade tab | L9355, L9364, L9380, L9395, L9417–9422, L9440, L9474, L9515, L9537, L9547, L9557 | figure (DF-1), drags, LTC test |
| Guardrails tab | L10001–10060 | sentences, chips |
| Withdrawal tab | L10159–10300 | Section B (V-9), steps, Section C (DF-3) |
| Dashboard | L11602 | sentence (V-11) |
| Stress tab | L12586, L12607 | sentences (V-10) |
| SS tab heading | L8953–8954 | heading, pronouns (V-12) |
| My Data | L14197, L14262 | *"optimizer"* |
| `isLTCLabel` | new, module level | the shared LTC test |
| Roth tab | L10819–10822, L10860–10861, L10965 | sentences |
| IRMAA tab | L11466, L11531 | sentences |
| Monte Carlo tab's LTC card | L11921 | the LTC test |
| Survivor tab | L12486–12487 | sentence |
| Stress tab | L12587 | sentence |
| Version sites | footer, DATA LOAD, Field Manual callsign and footer | v6.28 |

**No engine function changes:**
- `runMonteCarlo`, `runExtendedMC`, `computeWithdrawalPlan` (L5828–6346), `computeTaxPlan`, `computeIrmaaPlan`, `runRothStrategies`;
- the grade and GPA expressions and `weightedGPA`.

The build proves it: `t2` parity 10/10 with no intended difference, `t33` PINS unchanged, and `t90` B-8.

## 3 · Tests

**New suite `t91_directives.mjs`, both legs.** The v6.27 leg pins each defect as `[KNOWN DEFECT 2026-10-21, F-23]` or `[…, F-24]`.

- **A — extinction, on RENDERED text.** The review simulated the first draft — an AST walk of every string, sentence-start verbs only — on
  v6.27. It found 87 hits, most of them noise: SVG `"fill"` attributes, the strategy name *"FILL 12% BRACKET"*, nouns like *"Draw Need"*.
  And it missed the removed directives that do not start a sentence with a listed verb (*"Don't give notice"*, *"trim the Roth slider"*,
  *"coordinate the conversion amount"*, *"→ cut spending"*). So the lint reads what a user reads:
  - every tab's text from the DOM walk, on the example and the `couple` fixture;
  - the Field Manual's text.

  It splits on . ! ? ; : → and line breaks, and fails a sentence that:
  - starts with a financial-choice verb: *convert, pay the tax, elect, build, cut, raise, increase, fill, tap, withdraw, draw, execute,
    consider, roll, claim at, delay, buy, sell, rebalance, harvest, reserve, avoid, start, coordinate, trim, don't, do not*; or
  - contains *ideal, optimal, optimizer, optimization lever, recommended, Recommendation:, the safe move, standard advice, classic guideline,
    usually better, argues for, highest-value, ACTION:*, outside the convention *"the model's best cell"*.

  A named allow-list in the file lets through logistics and history (§13's quotations of removed copy, *What's new*), each entry with its
  reason. The allow-list is measured at the build against v6.27's hits; every v6.27 hit is either on it or in §1. A test-side extinction
  list of the exact removed phrases runs too, so a restored phrase fails even if the lint's patterns change.
- **B — F-24, rendered on `t90`'s five plans (seeded, as t90):**
  - each **rendered** *"Lost ~X"* equals (4 − that category's rendered GPA) × w / 78 to 0.005;
  - the categories shown are exactly those with (4 − gpa) × w > 5, largest first (the same set as v6.27's rule; checked on both legs);
  - the label is *"STATUS:"* only at 4.0;
  - weights read *"of 78"*;
  - the MC sentence on every plan: `single` (88.1%), `couple+LTC` (89.2%), `couple` (90.1%) and `low` all read it, labelled *"DRAG:"* below 4.0;
  - Income Floor's disclosure on the `couple` plan, which has a stream, and no dollar figure in its drag;
  - the Estate drag carries no *"guardianship"* / *"override the will"*;
  - the LTC test: a plan with *"Long-term disability"* reads *"No LTC / long-term-care line"* on the Grade and Monte Carlo tabs, and the
    example still reads that it has one.
- **C — rendered tabs, the example and the `couple` fixture:**
  - Guardrails (no *ACTION:*, no *Roth*, the chips);
  - Withdrawal: the steps; Priority 1's year equals the schedule's first year with the pool at $0, computed from `computeWithdrawalPlan`
    in the same run; Section C per DF-3;
  - Exit Plan per DF-4;
  - Events: the Roth item per DF-6, with the clock set inside a ladder year in a child process, as `t78` does;
  - SS (V-1), Survivor, IRMAA, Roth, Stress, Income.
- **D — the model, so the new text cannot drift from it:**
  - the guardrail rule's figures are `GUARDRAILS`' own (read live);
  - the steps name Engine D's order, checked by AST in `computeWithdrawalPlan` (the bucket draw order B1 → B4; no `GUARDRAILS` read; no
    conversion tax);
  - the SS sentence is checked against Engine C's MAGI terms by AST (`ssTaxable` in `magi`).
- **E — census:** `boundaries.mjs` gains `ltc_disability`, and `t29` gains its row and control. `ltc_row` and C-ltc read the leg's own
  `isLTCLabel` where it exists, so the census cannot disagree with the app.
- **F — the Field Manual and METHODOLOGY §9.**

**Existing suites, by census (§B1; `strhits.cjs` over `qa/` for every changed phrase, `pystr.py` over the three Python suites):**
- `t4` L306 signs the Exit Plan with *"CONFIRM THE MONEY WORKS"*, *"LOCK IN HEALTH COVERAGE"* and *"LANDMINE"*. Gated per leg if DF-4
  changes them. L102 (*"ORDER OF OPERATIONS"*, *"Traditional"*) and L101 (Guardrails) stay. L478–479 (the Withdrawal entry's *"Priority 1
  is everything you entered under Other accounts"*) stays.
- `t78` reads the strip's *"ACTION REQUIRED"* / *"ACTION WINDOW OPEN"* for the plan review and the tax notice, and B-3 asserts that only the
  `tax` event carries `notice` on all 72 dates. Unchanged under DF-6 (a). Under (b) the Roth event needs its own flag, not `notice`.
- **`domdiff_withdrawal.mjs`** (every run, `runsuite.sh` L392) asserts the Withdrawal tab is byte-identical across the pair (L315). The
  scope's first draft missed it. It gains a v627 → v628 arm:
  - Section B, the steps, Section C and the Priority-1 year are masked, each mask bound to a count;
  - **the Section A schedule must stay byte-identical**, which is the best witness that no schedule figure moved;
  - the Taxes and IRMAA tables stay identical.
- **`t90` B-8 is pinned to `"v626"` (L289).** In a v627 → v628 folder its v6.28 leg would spawn a v6.26 leg that is not there, and fail. It
  is the same prior-pinned shape as `t89` A-7, which this suite's own release repaired. Repaired: the prior is the tag before the current one
  in `KNOWN_VERSIONS`, with a designed, printed skip where that leg is absent. **Owned** — I wrote B-8 at v6.27 one week after repairing A-7.
  `t90`'s B-4 phrase and its *"Weight:"* reader stay valid under DF-1.
- `t45` and `t48` render every tab at 390 / 820 / 1440 px and in all 13 skins. The changed blocks must fit and keep the 11 px floor.
- `v628` registered by the AST registrar; `t1`'s and `t4`'s value maps by hand; `t33` PINS (unchanged), `t45`, `t47` and `t48`.

**Controls `qa/tools/controls_v628_directives.py` (repo-only).** Each plants one defect back:
- each restored directive (one per surface);
- the ÷ 100;
- *"boost Roth"*;
- Step 7's tax line;
- Section C's *"Recommendation:"*;
- V-1;
- the old LTC test;
- an allow-list entry used to hide a new directive;
- a Field Manual rule of thumb;
- and the unmutated run.

## 4 · Out of scope — filed as UsabilityFlaws **F-25**

- **The E-tagged entries (102), less those §1 rewrites.** Examples:
  - the checklist's legal *"why"* sentences;
  - *"Knowing this term exists already puts you ahead of most peers"* (Ranking);
  - *"Congress has always acted before a cut landed"*;
  - unsourced market history (*"no 20-year stretch has ever…"*);
  - *"The single biggest lever"*;
  - the Monte Carlo tab's *"another tool might show 95%, Danger Close may show ~78%"*;
  - *"A Health Savings Account is the most tax-advantaged account there is"*.
- **The V-tagged entries (151), less V-1 to V-8.** The census's V list, with the four likely-false ones in §0.3. To be checked one by one,
  the V-1 to V-8 way.
- **Logistics left as they are:** the Events tab's Part D comparison, HSA stop dates, the estimated-tax schedule, the API-key spending cap.
  They are logistics, not financial choices. Two are flagged in F-25 for their facts: *"Roth conversions have no withholding"*, and the
  Ask AI starter question *"How much can I safely spend each year?"* (addressed to the AI, which v6.26's rules govern).
- **The demo briefing's** directive voice (v6.26 DC-3: left, overridden by the ground rules).
- **D-56's literal grades** (unchanged).
- **Census entries tagged D?, left as they are, each for a reason:**
  - 1228, 1646, 1662: an API-key spending cap — account hygiene, not a plan choice;
  - 1379: how to read the ACA field;
  - 1549: data entry — expense rows that run for life;
  - 1581: the Taxes entry — only its *"optimizer"* changes (§1.13);
  - 1618, 1624: entries describing the checklist and events;
  - 1804: correcting a data entry;
  - 1812: the glossary's beneficiary-designation upkeep — administrative;
  - 1824: the glossary's crossover age — a definition. Its *"Living past it favors delaying"* is filed under E.
- **The gap-draw figure** (§0.3), filed.

The census itself is kept: `docs/F25_CENSUS_V627.tsv` (repo-only, all 283 flagged entries with id, line, tab, tags and text; the readers' notes are summarised in §0.3 and §4), so F-25's
scope starts from it.

## 5 · Decisions for Steve

- **DF-1 · "Lost ~X GPA points".**
  - (a) **Recommended.** Divide by the weights' sum (78), so each figure is the category's real cost to the overall GPA and they add to
    4 − GPA. Weights shown as points (*"20 of 78"*).
  - (b) Also ÷ 78, but show the weights as their share of 78 (26%, 13%, 10%, 6%), rounded so they may not add to exactly 100%.
- **DF-2 · Income Floor: what its text says, and its numbers.**
  - (a) **Recommended.** Text only: the evidence says the floor counts Social Security and the pension only, and the Income tab's also counts
    streams. The drag gives the gap in months and points to the Income tab's gap card, with no dollar figure (§1.6). No grade or figure
    moves. Counting streams, and fixing the gap figure both tabs share (§0.3), go to F-25 with D-57, its nearest relative.
  - (b) Count active streams in the Grade's floor, as the Income tab does. Income Floor's grade moves for plans with streams, and so does
    the overall grade.
  - (c) Keep v6.27's dollar figure in the drag, reworded. It repeats the gap figure the review found wrong.
- **DF-3 · Withdrawal tab's Section C (three-strategy comparison and its "Recommendation:").**
  - (a) **Recommended.** Remove it, replaced by two sentences: what the Section A schedule models, and that the Roth slider sets its
    conversion size (the Roth tab compares sizes).
  - (b) Keep the table as neutral descriptions: strip the ratings, *"Best when"* and the recommendation.
- **DF-4 · Exit Plan tab.**
  - (a) **Recommended.** Keep the dated logistics. Recast the financial choices as *"Decisions in this step — and what the model assumes"*,
    and the *LANDMINE* boxes as facts. Retitle the header *"Exit plan — the dates and paperwork"* (keeping the phase titles `t4` signs, where
    they are logistics).
  - (b) Remove the choice items, logistics only.
- **DF-5 · The Field Manual's "PAY CONVERSION TAX FROM OUTSIDE FUNDS" section.** Its arithmetic checks by hand:
  100,000 × 1.045²⁰ = 241,171; 76,000 → 183,290; the kept $24,000 → 52,799 after 15% on the gain; a $5,082 difference; plus the 10% on
  $24,000 and its lost growth → ≈ $10,870.
  - (a) **Recommended.** Keep the three worked examples, retitled *"Paying conversion tax: outside funds or withholding — what each
    costs"*. Remove the rules of thumb, *"never"* and *"prefer"*. Example 3's *"conversions still beat doing nothing for the example
    household"* is measured at the build or removed.
  - (b) Cut the section.
- **DF-6 · The Roth conversion alarm.**
  - (a) **Recommended.** Keep it on the Events tab and the strip, retitled as a conditional deadline (*"Roth conversion — if converting for
    {yr}, by Dec 31"*). The generic chips stay, so in December the strip reads *"⚠ ACTION REQUIRED: Roth conversion — if converting for
    {yr}, by Dec 31"*, and the Exit Plan's live status chip reads the same.
  - (b) Keep it on the Events tab only, behind a new flag (not `notice`, which `t78` B-3 reserves for the tax notice). It no longer raises the
    app-wide strip, because a conversion is a choice, not an obligation.
  - (c) In addition to (a) or (b): raise the conversion alarm and the estimated-tax alarm only when the Roth slider is above $0. Today both
    fire in ladder years at $0. That needs the slider passed into `computePlanEvents`, and the event count the Field Manual states
    (*"sixteen"*) becomes plan-dependent.
- **DF-7 · Priority 1's "Years active".**
  - (a) **Recommended.** The schedule's own year, worded for its edges:
    - *"drawn first; it reaches $0 in {yr}"*;
    - *"$0 at retirement"*;
    - *"not exhausted by {horizon}"*;
    - and, because unspent RMD cash refills the pool (L6185), *"first reaches $0 in {yr}; unspent RMD cash refills it later"* where that
      happens.
  - (b) Remove the line.
- **DF-8 · Tax Efficiency's rough RMD estimate.**
  - (a) **Recommended.** Remove the dollar estimate. Keep each spouse's RMD start age and point to the Roth tab's RMD cards, which compute
    it per person.
  - (b) Compute it properly: each spouse's balance to their own start year, at their own divisor.

## 6 · Review

An agent that had not seen this work reviewed the scope against the v6.27 source and the suite (2026-10-21).

**Findings:** 2 blockers, 12 should-fix and 7 notes. All are taken above.

**The two blockers:**
- **V-9.** The Withdrawal tab's Traditional-then-Roth order, which the first draft would have restated as *"the model's order"*, is not the
  engine's.
- **The Income Floor dollar figure.** It was the recommended DF-2 text, and it is computed differently from the Income tab's and is wrong for
  a household whose spouse B claims late.

**Should-fix, taken:**
- the Survivor replacement was untrue when a first death precedes the ladder's end;
- DF-1 would change which drags show (the cut-off is now in raw points);
- the LTC pattern dropped three labels the old one matched, and two suite copies were missing;
- missed copy: *"#1 OPTIMIZATION LEVER"*, the remaining *"optimizer"*s, Example 3, the glossary's guardrails, event 93, the Dashboard's
  V-11;
- the Stress tab's V-10;
- `domdiff_withdrawal` would have failed;
- DF-6's costs and option (c);
- the lint, rebuilt on rendered text after its simulation found 87 hits on v6.27, mostly noise, and missed most removed phrases;
- two §3 B checks: one tested nothing, the other said "if reachable" of a fixture that already exists;
- the ACA sentence said more than the tab shows;
- wrong ids and line numbers;
- the STATUS / DRAG mismatch is on every row, not only Monte Carlo's.

**Notes, taken:** the guardrail check's timing, Step 5's tax wording, which claim date the IRMAA tab reads, DF-7's edges, DF-1 (b) restated
fairly, DF-2's register home, DF-4's pension gating, the D/D? count (84 → 91, eleven dispositioned in §4), and the LTC comment's tab name.

**What the review confirmed:**
- the hash;
- the census counts;
- V-1 to V-8;
- §0.4's arithmetic (0.24 / 0.17 / 0.10 → 0.308 / 0.218 / 0.128; 64.5 / 78 = 0.827);
- the $800K threshold;
- DF-5's arithmetic;
- the Exit Plan's pension assumption against `runExtendedMC`;
- `t4`'s signatures, `t90`'s readers, and B-8's `"v626"` pin;
- that no other suite pins the changed copy.

⚠ **Owned.**
1. The first draft's Section B rewrite would have replaced a directive with a false description of the engine: Roth *"drawn last, after
   Traditional"*. That is the error v6.27 owned in its equity sentence, made again in this scope.
2. Its recommended DF-2 text quoted a figure without checking how it is computed.
3. Its short-piece pass missed *"#1 OPTIMIZATION LEVER"*.
4. Its suite census missed `domdiff_withdrawal`.

All four were found by the review.

## 7 · Build record (v6.28)

Built as decided against v6.27 (`32b34771…`); shipped as source `6ff3561e3dd23d50b5fce16ad8c76704`, built `b51ca85f4caf683326c77c2e70143a4c`. CHANGELOG v6.28 carries the full
record; the differences from §1 and §3 are recorded here, because a scope is read later as the plan.

- **DF-5:** Example 3's *"conversions still beat doing nothing for the example household"* was removed, not measured.
- **§3's tests, as built (`t91`):**
  - the lint reads **three** plans (the example, `couple` and `single`), not two, and every allowed hit is named in the file with its reason;
    A-4 and A-4b were added so the allow-list cannot go stale or become a catch-all (control C29). The §13 history exception is structural
    (a release entry, or a sentence opening *"Through v6.2x"*), not an allow-list entry. A narrowly worded allow entry *can* hide a directive;
    adding one is a reviewed decision, by design;
  - Priority 1's year is checked against the **rendered** schedule (the first row that draws a sleeve), not a second `computeWithdrawalPlan`
    call, so the check reads what the user reads; `t91` C-2 gates it on the example's own retirement year (re-seeding the example a second
    time in one process rendered the previous plan's schedule — seen at the build);
  - the Events items are read from the app module in a child process on fixed dates, not under a faked clock;
  - §B runs on six plans: `t90`'s five and a couple with a *"Long-term disability"* row; a seventh, a couple whose spouse B has the larger
    benefit, renders the SS tab for V-12.
- **The build review** (an agent that had not seen the build; 8 blockers, 11 minor, all checked in the source). Taken, and pinned by `t91`
  C-13 to C-13f and A-1c:
  1. the holdings card's *Starting Traditional* counted Other-account Traditional and Annuity money already in Priority 1 (`_tradInit`); it
     now prints `posTrad`, returned as `_posTradW`;
  2. the Exit Plan's conversion years *"after retirement and before RMDs"* — a couple's window runs to the second spouse's RMDs;
  3. the Exit Plan's income floor left out income streams;
  4. *"a smaller survivor benefit"* for either spouse's claim — only the larger benefit's claim age sets it (Exit Plan, checklist);
  5. the SS filing event's *"and a survivor"* on single plans;
  6. couple wording on single plans (the trust item's *"both of you"*, two Withdrawal RMD lines);
  7. the COBRA sentence, now conditional on a gap over 18 months;
  8. the in-app Events legend's *"go"* / *"prepare"* (the Field Manual's legend had been changed, the app's not).

  Minor, taken: *"timing & optimization"*; the conversion wording at a $0 slider and *"changes no balance's total"*; the Roth tab's Step 2
  note on where the tax comes from; the IRMAA sentence's conversion years; the Events window from the target year; the survivor card's
  *"unless the claim ages reverse the order"*; the grade list's weight (*"20/78"*, its column widened 30 → 40 px); METHODOLOGY §9's second
  paragraph. Found while fixing them: the Field Manual figure's *"convert at low brackets"* and its legend's *"(prepare)"*.
  Not taken (filed in UsabilityFlaws **F-25**): the *DRAG* label on sentences the grade does not read; *"CONFIRM THE MONEY WORKS"*;
  *"Roth conversions have no withholding"*; the editorial *"requires a CPA"* and *"the main lever"*; and two pre-existing false statements
  outside the diff (the Backtest tab's MC description; *"Medicare-eligible at retirement"*).
- **Existing suites.** The first full run (on the pre-review build) found `t4`'s Field Manual check red: it pinned the Withdrawal entry's
  *"Taxable → Traditional → Roth"* order, which this release corrects (V-9). A parser census then ran every string literal and executable
  regex in `qa/` against both sources (a string or pattern present in v6.27 and absent in v6.28): it found `t86` G-7's *"Roth optimizer"*
  too, and nothing else outside `t90`, `t91` and `domdiff`'s v6.27-side checks. Both re-gated.
- **Counts:** 8,908 app checks across 90 app suites, 0 failed, 0 DIED; MC parity 10/10; GRAND 9,040. `t91` 71 current, 28 on the v6.27 leg; controls 30 of 30.
