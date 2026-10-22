# SCOPE — v6.27 · F-22: the Grade tab reports the model's findings, not actions

**FULFILLED at v6.27 (2026-10-21; build record §7).** **DECIDED 2026-10-21 — all five as recommended:** DG-1 (a) *"Remove it"*, DG-2 (a) *"Label them, keep"*, DG-3 (a) *"Fix all now"*,
DG-4 (a) and DG-5 (a) *"Both as recommended"*. Steve, 2026-10-21: *"go F-22"*. Scoped against **v6.26** (source `6173cbbacee22df0896fd41351ce1314`, repo `27961be`). At the §A check
(2026-10-21) the pool, a full clone and the workspace matched file for file. Repo-only (`docs/`). Planned as a presentation release: no change to
engines, figures or stored fields, and under DG-2 (a) no overall grade moves. Line numbers are v6.26's. An independent agent reviewed the scope
before Steve saw it (§6).

## 0 · Premise (verified at v6.26)

### 0.1 What the register says

UsabilityFlaws **F-22** (filed at v6.26 from the D-55 scope's review) says the Grade tab's *"PATH TO {grade} — RECOMMENDED ACTIONS"* tells the
user to *"Secure hybrid LTC insurance policy for both spouses"* and *"Execute Roth conversion ladder … (fill 22% bracket each year)"*. The
app's rule is that it reports what the model computes and never gives advice, and from v6.26 Ask AI is told the same. **The premise holds, and the
problem is wider than the register says** (§0.3). F-22's candidate fix was to tie the Roth line to the Roth tab's best cell. Under DG-1 (a) that
fix is **superseded**, because the line goes away.

### 0.2 Measured — jsdom, the packaged v6.26 bundle (built from `6173cbba…`)

The Grade tab was rendered for three plans:
- **the example**, unsaved;
- **a couple and a single plan**, both from t89's fixtures, each saved once with Save & Apply. Before that save, a seeded fixture shows `NaN` and
  `Infinity` in two categories. The values go away after the save, so they are a fixture artifact and not a finding.

The Monte Carlo is unseeded (`Math.random`, L2781), so a plan's success rate and grade wobble between runs. The review measured the couple at
91.4% in one run and 91.8% in another.

| Plan | Overall | Panel shows | Projected |
|---|---|---|---|
| Example (has an LTC expense row) | **B**, GPA 3.17 | Roth ladder (+0.05); 7 estate items (+0.10) | B → **B+**, plus *"Projected MC success ~95–97%, From 100%"* |
| Couple (Ann & Bo, Ohio, no LTC row), saved | **B-**, GPA 2.99 | **LTC policy "for both spouses" (+0.20)**; Roth (+0.05); estate (+0.10) | B- → **B+** (+0.35) |
| Single (Ann), saved | **B-**, GPA 2.96 *(the review's measurement)* | **LTC policy "for both spouses"**; Roth; estate | *"~94–96%, From 91%"* |

On every plan the LTC category says *"Evidence: Hybrid LTC insurance active."* That includes plans with no LTC row and the single plan.

**Hand-verified, then rendered.** With the example's 7 survivor-critical checklist items marked done:
- Estate Readiness goes from D (1.0) to **B (3.0)**: 0.7 × 7/7 + 0.3 × 0/10 = 0.70, and every score in [0.6, 0.8) maps to 3.0.
- The overall GPA goes from **3.17 to 3.38**: 2.0 × 8/78 = 0.205 by hand, and 3.38 rendered.

The panel promises *"+0.10 … lifts Estate Readiness toward an A"*. The real lift is twice that, and it reaches B, not A.

### 0.3 What is wrong, item by item (source, v6.26)

**A. The panel (L9476–9641) prints advice and invents its numbers.**

1. **Directives.** `improvements` (L9480–9496) builds up to three actions:
   - *"Secure hybrid LTC insurance policy for both spouses"* (L9486). It shows when no expense row matches `/ltc|long.term/`, single plans included.
   - *"Execute Roth conversion ladder {start}–{end} (fill 22% bracket each year)"* (L9490). It shows on every plan, whatever the slider.
   - *"Complete N survivor-critical estate item(s)"* (L9492).

   The panel's other text:
   - the header *"PATH TO {grade} — RECOMMENDED ACTIONS"* (L9590);
   - Current → Projected (L9594, L9598);
   - *Gpa lift* (L9602);
   - difficulty tags *"MED (underwriting)"*, *"LOW (calendar)"* and *"MED (attorney)"*.
2. **None of the three lifts is what the model does.**
   - The LTC / Tail Risk grade is a literal **C+** (L9395) and Tax Efficiency a literal **B+** (L9401). Nothing the user does can earn the
     promised +0.20 or +0.05.
   - Adding an LTC premium row **lowers** the grade. Measured by the review on the couple, twice: 2.99 without the row, 2.94 with it. The premium
     raises spending, so Sequence Protection falls from A- to B+ (4.2 → 3.9 years) and the success rate drops.
   - The estate lift is understated (§0.2).
3. **"Projected MC success"** (L9631–9635) is `min(95, current + 3)` to `min(97, current + 5)` (L9633). No simulation is run. On the example it
   projects **95–97% "From 100%"**, an improvement lower than the current figure.
4. **The projected-grade ladder** (L9500–9504) has no grade below B-, so any projection under 3.0 is labelled B-, even one that is a C+ on the
   overall ladder.
5. **"Remaining risk to A"** (L9636–9640) says *"Full A requires LTC managed AND a benign market sequence in years 1–3"*. No plan can reach an
   A, or even an A- (C below).

**B. The category text states things that are false for most plans, or that only fit the example.**

6. **LTC evidence, L9396.**
   - *"Hybrid LTC insurance active"* shows on every plan. The app has no LTC policy field. The Ranking tab dropped the same claim at v6.11
     (comment, L9735–9738). Ask AI's context dropped it at v6.26 (D-55, DC-6).
   - The second sentence repeats it: *"all tail risk runs through the LTC policy and cash/bond reserves."*
7. **The LTC and Monte Carlo drags blame failures on an LTC shock that this success rate does not contain.**
   - L9397: *"LTC insurance is a meaningful post-retirement insurance expense. Combined LTC shock ($300K–$600K for both spouses) remains a top
     driver of Monte Carlo failures."*
   - L9360, the MC drag, shown only when success is below 90%: *"LTC shock scenarios pull left tail below threshold."*
   - L9486, the panel: *"Eliminates #1 MC failure driver"*.

   The Grade tab's rate is `current.successRate` (L9302, from L7055). It comes from the 6-year `runMonteCarlo` (L2705–2839; 24 quarters,
   L1019; called at L6984; success means ending above $800,000, L6987). Parser census: the engines read `LTC_SHOCK_MIN`, `LTC_SHOCK_RANGE`,
   `LTC_CARE_ANNUAL` and `LTC_CARE_ESCALATOR` only in `runExtendedMC` (L2961, L3057–3065) and `runStressTests` (L3156). L11964 and L12690
   also read `LTC_CARE_ANNUAL`, but only to display it. `runMonteCarlo` carries no LTC event. *"For both spouses"* also shows on single plans.
8. **Tax Efficiency.**
   - L9406: *"Roth conversion plan: {start}–{end}"* shows on every plan, whatever the slider. D-55 fixed the same claim in Ask AI: a plan at $0
     is not told it converts.
   - L9414: *"Conversion plan is well-designed but N years of execution risk"* is a judgment of every plan.
9. **Diversification status, L9454.** *"International intentionally reduced for geographic concentration risk; will revert when conditions
   warrant"* is the example household's own decision, shown to every plan. It appears even on the example, which holds two international funds.
10. **Guardrail Readiness, L9435–9449, is graded from expense rows labelled *golf* and *Amazon*, which are the example's labels.** *AMX* appears only
    in the text.
    - On any other plan the cut pool is $0, so the category is in effect a **fixed B-** whenever a cut is needed. The saved couple reads
      *"Realistic cut pool is golf ($0) + Amazon ($0) … Thin margin for a 10% cut ($600/mo needed)"*.
    - The *"+ dining frequency ≈ pool–pool×1.4"* range (L9447) is invented.
11. **Cost Structure, L9431–9432.**
    - *"better than most advisor-managed portfolios"* has no source.
    - *"check the Positions tab's $/yr fee column for the priciest funds and cheaper share classes"* nudges a fund choice.

**C. Fixed grades, and the ceiling they create.**
- Three grades are literals, so **20 of the 78 weight points** are the same for every plan: LTC / Tail Risk C+ (weight 10), Tax Efficiency B+
  (5) and Diversification B+ (5).
- Guardrail Readiness is a fourth in practice for any plan without the example's labels, which makes **25 of 78**.
- Income Floor and Guardrail top out at 3.3. The highest overall GPA any plan can reach is therefore **277.5 / 78 = 3.56, a B+**. The ladder
  offers A- at 3.7, and the panel's title comment is *"Path to A-"*. **No user can reach the top two grades the tab displays.** The tab says none
  of this.

**D. The Field Manual's Grade entry (DOCS_HTML, L4836)** says *"A radar chart across weighted dimensions (portfolio size, income floor,
sequence buffer, LTC/tail risk, tax efficiency, diversification, estate readiness)"*.
- The tab draws bars; a parser census finds no `Radar`, `RadarChart` or `PolarGrid` anywhere in the source.
- "Portfolio size" is not a category.
- Three real categories are missing: Monte Carlo Success, Cost Structure and Guardrail Readiness.
- The entry mentions neither the panel, the fixed grades nor the ceiling.

**What is right and stays.**
- *"Top grade drags — where points are lost"* (L9560–9585) is computed from the category grades.
- The computed categories read the plan: Monte Carlo, Income Floor, Sequence Protection, Cost Structure's grade and Estate Readiness.
- The equity-share box states a fact (`bucketActuals[3]`).
- The Estate drag's *"Complete these on the Checklist tab"* points to a feature of the app, which the v6.26 ground rules allow.

### 0.4 Who it reaches, and what the example hides

It reaches every user who opens the Grade tab. **The example hides the worst lines**:
- It has an LTC expense row, so the LTC directive and its +0.20 never appear.
- It has golf and Amazon rows, so the Guardrail grade reads a real pool.

A review done on the example sees neither problem. This is the boundary pattern in OPERATIONS §K1. Under its maintenance rule this release
adds both boundaries to the census (§3).

## 1 · What changes (as recommended)

> *As built (v6.27), five details below differ — the guardrail labels' wording, the equity sentence, the Roth years, the marks in *Top
> grade drags* and the hedge sentence. §7 records each; read it before taking this section as the description of the shipped tab.*

- **The panel goes** (DG-1 (a)).
  - Removed: the header, the actions, Current → Projected, *Gpa lift*, *Projected MC success* and *Remaining risk to A*.
  - Deleted from the code: `improvements`, `gpaLift`, `projectedGPA`, `projGrade` and `projColor`.
  - *Top grade drags* stays. The equity-share box stays, with its sentence changed to say that allocation is not graded and is taken as held.
- **Fixed grades are labelled** (DG-2 (a)).
  - Each fixed category gains `fixed: true`, and the grade list and category detail show *"fixed in this build — not computed from your plan"*.
  - Guardrail Readiness gets the same treatment, worded as keyed to example labels, if DG-2 (a) includes it.
  - Under the overall grade, the tab states the ceiling: *"the highest grade this scoring can give any plan is B+"*.
  - Weights and grades are unchanged.
- **Category copy is corrected** (DG-3 (a)). This is copy only; no grade changes.
  - **6:** the LTC evidence uses the Stress tab's existing condition (`hasLTCprem`, defined at L11978 with `/ltc|long.?term/`; the Grade tab's
    regex `/ltc|long.term/` is aligned to it). It says whether an LTC / long-term-care row is in the plan's expenses and claims no policy.
  - **7:** the MC and LTC drags say that the 6-year Monte Carlo behind this rate carries no LTC event, and that the 30-year Monte Carlo and the
    Stress tab do. *"both spouses"* shows only for a couple.
  - **8:** the Roth line names the plan's own slider amount, or says no conversions; "well-designed" is dropped.
  - **9:** the example's sentence is dropped; the status states what the category counts.
  - **10:** the drag states the rule it applies (rows labelled *golf* and *Amazon* are the cut pool), and the invented dining range is dropped.
  - **11:** the unsourced comparison and the share-class nudge are dropped. The fee figure stays, and the drag points to the Positions tab's fee
    column as a place to read.
- **The Field Manual's Grade entry is rewritten** (DG-4 (a)) to match the tab as built:
  - bars, with the nine categories and their weights;
  - which grades are fixed or keyed to example labels, and the B+ ceiling;
  - that the success rate is the 6-year Monte Carlo's;
  - that the tab reports the model's grading, not a plan of action.

  §13 records the change, and the four version sites read v6.27.
- **No METHODOLOGY change** under DG-2 (a): no modelling changes, and METHODOLOGY mentions the Grade tab only in passing (L2545).

## 2 · Census (parser, v6.26)

**App.** Tools: acorn with a generic walk over every string literal, template quasi, JSX text node and comment; `census.cjs`; `funcmap.cjs`.
- `improvements`: 3 AST hits, all in the Grade render (L9480, L9499, L9608).
- The panel's copy sits at L9486, L9490, L9492, L9590, L9594, L9598, L9602, L9628, L9632, L9634 and L9637–9638.
- *Hybrid LTC insurance*: L9396 only.
- *fill 22%*: also at L5575 and L6925 (the Roth strategy labels, correct and untouched) and at L10275 (a sibling, §4).
- *radar*: only the Grade entry.
- Nothing outside the Grade render reads the panel's values: not Ask AI's context (L7247–7280), the exports or the Ranking tab.

**Suite.** The same AST walk over all 150 `qa/**/*.mjs` files, plus Python's `ast` over the committed `qa/**/*.py`.
- `t4_dom.mjs` L99, the *grade* tab signature *"ESTATE READINESS"*, stays true.
- `t45_phone_layout.py` (L79–87) clicks every tab at three widths and asserts scroll width. `t48_legibility_targets.py` (L240–262) checks text
  of at least 11 px and AA contrast on every tab in 13 skins. Both cover this tab. The new label and the ceiling line must pass `t48`.
- `t89` L322 and `controls_v626_ai_rules.py` L41 cover *Hybrid LTC insurance* in **Ask AI's** context, and `t74` L166–177 covers it on the
  **Ranking** tab. None of them is affected.
- `t29` pins the `boundaries.mjs` row ids (L85). New rows change it.
- No suite reads `improvements`, `gpaLift`, the panel's copy, the projected figures or the Field Manual's Grade entry. **The panel is untested
  today.**

## 3 · Tests

**New suite `t90_grade_findings.mjs`**, run on both legs. The v6.26 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-21, F-22]`.
`Math.random` is seeded **before the bundle is imported** (t11's TRAP 1), so a leg's grades are repeatable.

**§A, by AST, against the Grade render.**
- None of the deleted identifiers remains.
- None of the panel's strings remains (the full list in §2).
- None of the false sentences remains:
  - *Hybrid LTC insurance active*
  - *runs through the LTC policy*
  - *top driver of Monte Carlo failures*
  - *LTC shock scenarios pull left tail*
  - *well-designed*
  - *intentionally reduced*
  - *Realistic cut pool*
  - *dining frequency*
  - *advisor-managed*
  - *share classes*
  - *Remaining risk to A*
- **Extinction invariant:** every category object, including the IIFE-built ones, whose `grade` **or** `gpa` is a literal carries `fixed: true`.
  A hardcoded grade cannot come back unlabelled.

**§B, rendered**, on five plans:
- the example;
- the couple without an LTC row, saved;
- the single plan, saved;
- the couple with an LTC row added;
- **a plan below 90% success**, so the MC drag's branch actually renders.

Checks:
- No directive panel and no *Projected* figure.
- The LTC evidence follows the row.
- *both spouses* is absent on the single plan.
- Neither drag blames this rate's failures on LTC.
- The fixed labels and the ceiling line show.
- *Top grade drags* is still present.
- **No grade moves.** Each plan's overall GPA equals Σ(rendered category GPA × weight) / 78. Each fixed category shows its v6.26 grade.

**§C, Field Manual.**
- The Grade entry has no *radar*.
- It names every category in `categories`, read from the source by AST.
- It names the fixed ones, the guardrail rule and the B+ ceiling.
- §13 carries the v6.27 line.

**Boundary census (OPERATIONS §K1).** `boundaries.mjs` gains two rows: *an LTC expense row present* and *golf / Amazon rows present*. Both are ON
for the example. `t29`'s id list (L85) gains both.

**Existing suites.** `t29` changes as above. `t4`, `t45` and `t48` must stay green, with no edits expected.

**Controls** (repo-only, `qa/tools/controls_v627_grade.py`), one mutation each:
- the panel restored;
- the LTC sentence restored;
- the MC drag's LTC claim restored;
- one `fixed: true` removed;
- a category added without a Field Manual mention;
- *both spouses* shown to a single plan;
- the ceiling line removed;
- the unmutated run.

⚠ **What no test can show:** whether the copy that remains reads as advice to a person. Before release, an agent that has not seen the build reads
the rendered tab once (the D-55 pattern).

## 4 · Out of scope (filed, not fixed)

- **Computing the fixed grades, or dropping them from the weighting** (DG-2 (b)/(c)), together with the guardrail rule keyed to example labels.
  This is the same family as MissingFeatures **D-56** (example values shown to every plan). Recommended: file it as a new **D-56 sub-item**
  rather than open a fresh F number.
- **Directive copy on other tabs**, proposed as **F-23**. The §K2 sweep found these; it was not exhaustive, so F-23 starts with its own full sweep.
  - **Withdrawal tab, L10275:** *"Step 7: Execute planned Roth conversion … to fill 22% bracket. Pay conversion taxes from Taxable account,
    NOT from retirement assets."* The same tab says its Conv column is *"the annual Roth conversion amount set by the slider on the Roth tab"*
    (L10170), so this step also misdescribes the model.
  - **Guardrails tab, L10066–10076:** the *"ACTION: …"* lines. *"or boost Roth conversions"* was not checked against the engine.
  - **Exit Plan tab:**
    - L7855: *"Elect the pension's joint-&-survivor option in writing with the plan administrator."*
    - L7863: *"Build 1–2 years of spending into a brokerage money-market / T-bills …"*
    - L7865: *"… Often the highest-value move in the whole transition."*
  - **The plan-events list, `computePlanEvents` L2345–2347:** *"execute {yr} conversion by Dec 31"* and *"Convert the planned amount … Pay
    the tax from the taxable account."*
- Grading choices that are not part of F-22:
  - the Income Floor ladder's B- floor;
  - the $800,000 success threshold;
  - the checklist's 70/30 weighting;
  - Sequence Protection reading LTC premium rows as spending, which is correct modelling.

## 5 · Decisions for Steve

**DG-1 · The "Recommended actions" panel.**
- (a) **Recommended.** Remove it: the actions, Current → Projected, the GPA lift, *Projected MC success* and *Remaining risk to A*. *Top grade
  drags* already shows where points are lost, from computed grades.
- (b) Replace it with a computed *"What moves the grade"* that lists only effects the model actually computes. Today that is the estate items
  alone; on the example it would read *"+0.21, B → B+"*. This needs the grade logic pulled into a function so it can be re-run, which means
  more code and more tests.
- (c) Reword it in place and keep the lifts. **Not recommended:** none of the three lifts is what the model does.

**DG-2 · The fixed grades and the ceiling.** LTC is C+, Tax Efficiency B+ and Diversification B+ (20 of 78 weight points). Guardrail is in
practice B- for any non-example plan (5 more).
- (a) **Recommended.** Keep them in the overall grade, label all four (Guardrail worded as keyed to example labels), state the B+ ceiling, and
  file computing them. No user's grade moves.
- (b) Drop the three literals from the overall grade now. The letter changes depend on the plan: the example goes **B → B+** (3.17 → 3.30, just
  over the 3.30 cutoff), the single plan **B- → B** (2.96 → 3.01), and the ceiling rises to 3.82 (A- reachable). Any plan whose computed
  categories average above 2.80 moves up, which is the optimistic direction, against the project's conservative default.
- (c) Compute them. That is a new modelling scope.

**DG-3 · The false and example-specific sentences** (items 6–11).
- (a) **Recommended.** Fix all of them in this release, copy only.
- (b) Fix only items 6 and 7 (the claimed policy and the claimed LTC driver) and file the rest.

**DG-4 · The Field Manual's Grade entry.**
- (a) **Recommended.** Rewrite it to match the tab (§1), including the ceiling.
- (b) Correct only the radar sentence.

**DG-5 · Directive copy on other tabs** (§4's list).
- (a) **Recommended.** File it as F-23, starting with a full sweep, and fix it in its own scope.
- (b) Fold the Withdrawal tab's Step 7 into v6.27, since it contradicts its own tab.

## 6 · Review

An agent that had not seen the scope written reviewed it before Steve saw it. It found **no blocker**, nine should-fix findings and six notes,
**all taken**:
- **The suite census was wrong.** `t45` and `t48` also render this tab; `t74` covers Ranking's LTC claim; `t29` pins the boundary rows.
- **The test plan had three holes.**
  - The MC drag only renders below 90%, and every fixture sat above it, so its check would have passed without testing anything.
  - Its sentences were missing from §A.
  - "Grades equal the v6.26 leg's" could not be measured across processes and would have been flaky: the Monte Carlo is unseeded, and the couple
    measured 91.4% then 91.8% against the 92% A- cutoff.
- **False copy was missing from items 6–11:** the second LTC sentence, the Roth plan years, the dining range and Cost Structure's two lines.
- **An overstatement:** an LTC row does not merely fail to raise the grade; it lowers it.
- **The B+ ceiling:** 277.5 / 78.
- **The OPERATIONS §K1 maintenance rule** had not been applied.
- **The §K2 sweep:** D-56 is the same family; F-22's Roth-best-cell fix is superseded; more directive siblings exist (Exit Plan, plan events).
- **Smaller corrections:** the single plan's grade (2.96); an unreachable 2.40 example in item 4, which was replaced; AMX is text only;
  `hasLTCprem` is defined at L11978, not L12003; `LTC_CARE_ANNUAL` has two display reads; the panel copy list was incomplete.

The review confirmed:
- every §0.3 line number;
- that `runMonteCarlo` carries no LTC event;
- the literal grades;
- the projected-MC formula and the example's *"From 100%"*;
- the example's B 3.17 and the couple's B- 2.99, both re-rendered;
- the estate lift by hand;
- that nothing else consumes the panel's values;
- the Field Manual text, and METHODOLOGY's single mention.

The author spot-checked:
- `Math.random` at L2781;
- t11's seeding trap;
- `t29`'s id list at L85;
- `hasLTCprem` at L11978;
- the Exit Plan and plan-events lines.

## 7 · Build record (v6.27)

Built as decided against v6.26 (`6173cbba…`); shipped as source `32b34771da6e55edc80a71519bbe01aa`, built `deac8c16f4238d8b8519f656e5c646ff`. CHANGELOG v6.27 carries the full record; the
differences from §1 and §3 are recorded here, because a scope is read later as the plan.

- **The labels' wording.** §0.3 item 10 and §1 said Guardrail Readiness reads *"the example's labels"*. The example's golf row is *"Golf
  (monthly)"*, which the anchored `/^golf$/i` does not match, so only its *Amazon* row counts. The shipped copy says *"labelled exactly
  'golf' and 'Amazon'"* and the tag *"Graded from two fixed expense labels"*. Found while building, by reading the example's table.
- **The build review** (no blocker; six should-fix, eight notes) changed five things §1 had specified or missed:
  - the equity sentence (§1's *"allocation is not graded"* is false — Sequence Protection reads the cash-and-bond share);
  - *Top grade drags* carries the † / ‡ marks;
  - the Roth line's years start at the selected `retireYear`, not `rothLadderStart`;
  - the guardrail's *"whenever a cut is needed"* is dropped (the cut is always above $0);
  - *"Hedge holdings add $0K convexity"* shows only with hedges (it contradicted the new *"No hedge positions held"*).

  `t90` gained A-6b (a grade hardcoded through a spread), A-9/A-10 (the Roth line), B-12 and B-13; the controls gained C15–C20. The
  review's remaining notes are **UsabilityFlaws F-24** (filed), including *"Lost ~X GPA points"* understated by 22% — a displayed figure,
  left for Steve.
- **`cut_rows`** hides the $0-pool text, not a grade: the example grades B- either way (its $400 is short of the cut). Its note says so.
- **Counts:** 8,782 app checks across 89 app suites, 0 failed, 0 DIED; MC parity 10/10; GRAND 8,912. `t90` 46 current, 22 on the v6.26 leg; controls 21 of 21. The first full run found `t89` A-7 (a v6.26 suite) red on both legs — it read `../v625.jsx`, which a rolled run folder lacks; repaired to an md5 pin (CHANGELOG v6.27).
