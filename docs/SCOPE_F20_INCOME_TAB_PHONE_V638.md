# SCOPE — F-20 · The Income tab on a phone, and what it says when income covers spending

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.38 (2026-10-29).** DF-1 to DF-6 taken as recommended (Steve, 2026-10-29: *"Whole tab"*, *"Fix both"*, *"File F-30 + disclose"*, *"v6.38; tax → v6.39"*); §8 is the build record |
| Build scoped against | **v6.37** · source `src/DangerClose.jsx` md5 `0b63ca625d314237720d17252f9445d3` · built `index.html` `bbe3987fdb9af1a8eef43bc5b1bf1f8b` · repo `e72757d` |
| Freshness | Pool source `DangerClose-v6_37.jsx` = manifest = clone; all 16 pool documents byte-identical to the clone (2026-10-29, this session). `package_check` 54/0 post-upload; §F clone diff clean. |
| Kind | A **presentation** release, the Income tab only (plus one Field Manual sentence). No engine, table or stored field changes; no figure moves on the example. |
| Register | Closes **UsabilityFlaws F-20**, wider than registered (§0). Files **F-30** (§5). §K2 sweep: §2. |
| Version | Proposed **v6.38**; the 2027 tax figures become **v6.39** (DF-6). |

---

## 0 · Premise — measured in Chromium on the built v6.37 page, not read

All figures below are from scratch probes run this session against `post637/index.html` (`bbe3987f…`): `s638/probe_f20.py`,
`probe_neg.py`, `proto_f20.py`, `measure_c.py`, `overlap_all.py`, `income_overlap.py`, `rects.py` (scratch; asserts nothing). The plans
are the example's saved portfolio with income streams added (`b637/seed65.json`, spouse A at 65), and the example as it opens.

**0.1 · F-20 as registered — reproduced.** With income streams, the Income tab is the **only one of 26 tabs** that scrolls sideways at
390 px:

| Plan | Income tab `scrollWidth` at 390 | other tabs |
|---|---|---|
| three streams (rental with a long label, a 1099 job, an annuity) | **504** | all 25 fit |
| one stream labelled "Rental" | **449** | all 25 fit |
| three streams + a 46-character label | **627** | — |
| one stream with a 43-character unbroken label | **604** | — |
| no streams | fits | all fit |

At 820 and 1440 every stream row sits on one line and fits. **Cause** (source, the Income tab's render, `<anon>@8860 <
DangerCloseMain@7339`): each row is one flex line whose label is `minWidth: 170, flexShrink: 0`, date range `minWidth: 96, flexShrink: 0`,
description `flex: 1` (minimum width = its longest word) and amount — five fixed-ish widths and three 10 px gaps on a ~286 px line. The
timeline card directly above had the same pattern and was fixed at v5.79 (`min(170px, 40%)`, comment *"F-11"*); the stream list was not.
`t45` never sees it because it runs on the example, which has no streams (`boundaries.mjs`: `income_streams` **ON** — *"NONE — the
income-stream paths are unexercised"*).

**0.2 · Wider than registered (1): the Income tab's text collides on a phone for every plan, the example included.** `t45` measures
whether the page scrolls sideways; text that spills into the next card does not widen the page, so nothing has looked. Counting pairs of
visible text boxes that overlap by more than 3 px (SVG and collapsed panels excluded; clipping applied), the Income tab at 390 has **29**
on the example as it opens, 24 and 22 on the stream plans. Seen in screenshots: in the three-card *Income sources* grid
(`minmax(0, 1fr)` × 3, 96 px each at 390), *"$1,300/mo"* prints over *"62%"*, *"$36,240/yr from portfolio"* runs into the gap card,
*"$155,280"* spills out of its box; and each phase card's five-column figure row (`repeat(5, minmax(0, 1fr))`) prints *"/mo"* over the
next column.

**0.3 · Wider than registered (2): a negative shortfall printed raw.** When a plan's steady-state income is above its spending, six
places print the difference unguarded (parser census of `_steadyInc`, `census.cjs`: L9031, L9032, L9151, L9156, L9175, L9176). Rendered
on the three-stream plan:

- Key income metrics: *"Monthly Shortfall (steady state) **-$-1,302**"* and *"Monthly Shortfall (after Car Payment ends) **-$-1,702**"*;
- the summary cards: *"Steady-state draw $0/yr · **$-1,302/mo shortfall × 12**"*, *"Draw after Car Payment ends $0/yr · **$-1,702/mo
  shortfall × 12**, from May 2034"*;
- the floor assessment: *"…covers 116% of expenses. The **$-1,302/mo shortfall comes from portfolio withdrawals** …"* and *"the shortfall
  is $-1,702/mo, a 0.0% withdrawal rate"*.

The yearly draws beside them are already floored at $0 (`annualDraw` takes `Math.max(0, …)`), and the phase cards already print `$0`
(L9130) — the sentences are the defect, not the figures. A rendered text search of all 26 tabs on that plan and on a $9,000-a-month
rental plan found `$-` on **the Income tab only**. Reachable without streams too (a pension or Social Security above spending).

**0.4 · Wider than registered (3): "Income Coverage (pre-Spouse A SS)".** L9030 computes `(spouseBSS + pension) / POST_MONTHLY_EARLY`:
spouse B's benefit whether or not B has claimed, no income stream, and shown even when there is no period before spouse A's Social
Security. Rendered on the three-stream plan (spouse A claims at retirement, so *"No gap at this retire date"* two cards over):
*"Income Coverage (pre-Spouse A SS) **21%** · $1,700 of $8,170/mo"* — with $1,200 + $2,500 of streams running then. The gap card beside
it has counted B from B's claim month and streams at retirement since v6.29 (F-25, DF-2). Read from source; the B-after-retirement case
is not rendered here (the fixture to show it is in §4). **On the example it reads the same either way** (B claims in January of the
retirement year; no streams): 21%, $1,700 of $8,170.

---

## 1 · Site census (parser, `census.cjs`, v6.37)

| Site | What changes |
|---|---|
| App stylesheet, the v5.81 phone block (`@media (max-width: 599px)`, L8019) | three phone-only rules (DF-1) |
| Income render, the three-card grid (L9002) | a class |
| the stream row (L9081–L9085) | a class on the row and three of its spans |
| each phase card's figure row (L9127) | a class |
| Key income metrics (L9030–L9032) | the coverage metric (DF-4); the two shortfall values (DF-3) |
| summary cards (L9151, L9156) | the shortfall lines (DF-3) |
| floor assessment (L9175, L9176) | the two shortfall sentences (DF-3) |
| `DOCS_HTML` §13, *"Designed for a desktop browser"* item | one clause (DF-5) |
| four version sites | v6.38 |

`_steadyInc` has 13 AST hits, all inside the Income render; `steadyStateDraw` 3, `postPayDraw` 4, `_incStreams` 5 — no reader outside the
tab. No engine reads anything this release touches.

**Copy locks** (every string, template and regex literal in `qa/`, parsed, executed against the copy in scope): `t84` G-1 pins
*"Monthly Shortfall (after Car Payment ends)"*, *"Draw after Car Payment ends"* and *"From May 2034, after Car Payment ends, the shortfall
is"* on the example — whose shortfall is positive, so that copy stays. `t48` X-10 and `t62` A-0/A-1 read the §13 item; adding a clause
keeps them green. No other lock.

## 2 · Register sweep (§K2) — by mechanism, not by ID

Searched `docs/FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md`, `UsabilityFlaws.md` for *stream list*, *minWidth: 170*,
*shortfall*, *Income Coverage*, *coverage (pre*, *Income floor*. Hits: **F-20** (this), **MissingFeatures D-49** (names F-20 as a
precondition for moving the example's built-in work into visible rows — this release discharges that precondition; D-49's other one, the
Income tab's phase rule for streams, stays), **D-43** (closed; the *"after the payments end"* wording this release keeps). The negative
shortfall, the coverage metric and the collisions are in no register.

## 3 · The fix

**DF-1 · Where the phone layout lives — measured, three shapes.**

| Shape | 390 px | 820 / 1440 px |
|---|---|---|
| **(A)** the v5.79 timeline pattern on the stream row (label `min(170px, 40%)`, shrinkable) | fits — but the description collapses to **0 px wide**, one character per line (350–504 px tall). Unreadable | unchanged |
| **(B)** wrap each row below 600 px | fits on short labels; **still 627 px** with a long label | unchanged |
| **(C)** wrap always, description `flex: 1 1 160px` | fits on all four plans | identical on the plans measured, but not by construction |
| **(D) — recommended:** C's rules, plus a one-column card grid and a two-column phase row, **only inside the v5.81 phone block** | fits on all four plans; Income-tab collisions **29 → 0** on the example, 24 → 0 and 22 → 0 on the stream plans | **identical by construction**, and measured: all 193 element boxes on the example and all 223 on the three-stream plan, at 820 and at 1440, equal v6.37's |

(D) is what v5.81 established: *"phone-only elements have NO box at 600 px and up, so desktop and tablet layouts are identical by
construction."* Prototype built and measured this session (`s638/pbuild`, `fc483d8b…` then the phase-row rule added). On a phone each
stream row reads: label (and date range when they fit) on the first line, description and amount on the next, amount at the right.

**DF-3 · Wording when income covers spending (proposed; the build may tighten it).** Each of the six sites prints the shortfall when it is
positive, exactly as now, and otherwise:
- Key metrics: value **$0**; sub *"income exceeds spending by $1,302/mo"*.
- Summary cards: *"$0/yr"* (as now); sub *"income exceeds spending by $1,302/mo"* (the after-payments card keeps *", from May 2034"*).
- Floor assessment: *"…covers 116% of expenses — $1,302/mo more than they cost, on this tab's figures, so there is no shortfall to draw."*;
  after the payments end, *"…income exceeds spending by $1,702/mo."* No claim about what the model does with the surplus (not verified;
  out of scope).

**DF-4 · The coverage metric (proposed).** Label *"Income coverage (before {A}'s Social Security)"*; income at the retirement month by
the gap card's own rule — the pension, the streams active then, spouse B only if B has claimed by then; when there is no gap, value
**—** and sub *"no gap: {A}'s Social Security is flowing at retirement"*. On the example: 21%, $1,700 of $8,170 (unchanged).

## 4 · Tests

- **`t45` (Chromium, current leg)** gains a stream plan (three streams, a long label, an unbroken label): every tab at 390 does not scroll
  sideways; **no overlapping text on the Income tab at 390** on the example and on the stream plan (the census detector, §0.2, as a
  check); at 820 and 1440 each stream row's cells share one line.
- **New `t102_income_tab.mjs` (jsdom, both legs; the v6.37 leg pins each defect as `[KNOWN DEFECT 2026-10-29, F-20 — flips at v6.38]`).**
  §A by source: the three phone rules exist only inside the `max-width: 599px` block; the classes sit on the grid, the row and its spans,
  the phase row. §B on the example: the Income tab's rendered text is **byte-identical** to v6.37's (v6.38 leg, against `dom_v637.cjs`) — *as built: identical
  but for one restored space, §8.2*.
  §C plans whose income covers spending (streams; a pension above spending, no streams; the boundary at exactly equal): no `$-` anywhere
  on the tab, each of the six sites in its covered form with the surplus computed in the suite. §D the coverage metric on: the example;
  B claiming after retirement; streams at retirement; no gap. §E the Field Manual clause.
- **Census:** `boundaries.mjs` row `income_covers_spend` (ON when steady-state income is below spending — the example is ON); `t29` B-33,
  C-f20-1 (a plan above spending clears it). `income_streams` already exists and stays ON for the example.
- **Controls:** `qa/tools/controls_v638_income.py`, each reverting one fix (a rule moved outside the phone block; each class removed; each
  of the six guards; the coverage rule) and naming the check that must go red.
- The full suite, run from the packaged copies; parity 10/10 (no engine changes).

**Not reached, stated:** `t45` checks collisions on the Income tab only (DF-5); the 820 and 1440 boxes are compared with v6.37 at the
build, not by a suite (no suite holds two built pages).

## 5 · F-30 · Text overprints itself on a phone on six more tabs — to be filed (DF-5)

The same detector over all 26 tabs of the example as it opens at 390 px (pairs of overlapping visible text boxes; the Grade tab's one hit
is the large letter's glyph box, a false positive):

| Tab | Pairs at 390 | Seen |
|---|---|---|
| Roth | 70 | the IRMAA lookback calendar: *"CONVERT"* over *"CONVERT"*, years over years — unreadable |
| Stress | 30 | the scenario table's column heads and every figure row |
| Income | 28 | §0.2 — fixed here |
| My Data | 21 | the household totals row (*"$1,647,000"* over *"$1,500,000"*), the Traditional/Roth class cards |
| Social Security | 10 | the claiming-age grids and the survivor cards |
| Expenses | 4 | a figure over its label |
| Taxes | 2 | the lifetime-tax tiles |

At 820 and 1440: **Expenses 1** (the category *"Transportation"* runs under *"Car Payment"* — real, seen at 1440) and My Data 1 at 820
(not inspected).

> ⚠ **Corrected at the build (§8.3).** This census's detector clipped a text box to its ancestors' boxes but not to its own element's, so
> the hidden lines of a scrolling `<pre>` counted: **My Data is 8 at 390, not 21**, and its 820 hit was that `<pre>` (seen: nothing
> overlaps). Re-measured on v6.38 with `t45` §S's detector (which clips at the element): Roth 70, Stress 30, Social Security 10, My Data 8,
> Expenses 4, Taxes 2, Income **0**; at 600 and 640 px Stress 1 and Expenses 1; from 680 px Expenses 1 only (the Grade hit is the glyph
> box at every width). Field Manual §13 says *"On a phone the page itself no longer scrolls sideways (v5.79)"* and nothing about overprinting —
so for these tabs it is an **undisclosed** simplification, which the project's rule does not allow to stand silently.

## 6 · Out of scope

The other six tabs' collisions (F-30, DF-5); the Income tab's phase rule for streams (D-49); what the model does with a surplus; any
engine; the 44 px touch-target guideline (F-3, disclosed).

## 7 · Decisions for Steve

| | Question | Options | Recommendation |
|---|---|---|---|
| **DF-1** | How to fix the stream list | (a) shape D — phone-only rules, desktop identical by construction · (b) shape C inline | **(a)** |
| **DF-2** | The Income tab's other phone collisions (the three cards, the phase rows) | (a) fix with F-20 — same tab, same rule block · (b) F-20 only | **(a)** |
| **DF-3** | The negative shortfall (six sites) | (a) fix here with the §3 wording · (b) file it | **(a)** — it reaches every plan whose income covers spending, and two of the six sentences say something false |
| **DF-4** | The *pre-Spouse A SS* coverage metric | (a) fix here (§3) · (b) file it | **(a)** — the card beside it already uses the rule |
| **DF-5** | The six other tabs (F-30) | (a) file F-30 with the §5 census, disclose it in §13 now, and guard only the Income tab · (b) fix all six now (a larger release, each tab its own cause) · (c) file only | **(a)** — it keeps this release small ahead of the 15 December tax deadline, and ends the non-disclosure today |
| **DF-6** | Version | (a) v6.38; the 2027 tax figures become v6.39 (suite stays `t99`; deadline unchanged) · (b) other | **(a)** |

## 8 · Build record (2026-10-29)

**8.1 · Built as decided.** Source `0b63ca62…` → final md5 in the CHANGELOG's provenance line. DF-1/DF-2: six rules inside the v5.81 phone
block (`.dc-stack-phone`, `.dc-two-phone`, `.dc-streamrow` and its three child rules) and classes on the three-card grid, the phase figure
row, the stream row and three of its spans. DF-3: `_shortSteady`, `_shortPost`, `_coveredBy`; the six sites guarded. DF-4: `_preAInc`, with
*"—"* and *"no gap: …"* when there is none, and *"at retirement; {B}'s SS from {month}"* when B claims inside the gap. DF-5: §13's v6.38 note
and the desktop item's sentence. DF-6: v6.38; the TY2027 scope renumbered a fifth time (v6.39).

**8.2 · Departures from the scope's words, each recorded.**
- **DF-4's label was not adopted.** The scope proposed *"Income coverage (before {A}'s Social Security)"*; the build kept *"Income Coverage
  (pre-{A} SS)"* so the example's tab reads as before (the value and sub-line carry the change). `t102` D-1 pins the kept label.
- **One space restored.** Wrapping the floor sentence in an expression first dropped the space before *"The"*; restoring it showed the
  next sentence had run on since v6.21 (*"mix.From May 2034"*, `git log -S`). Both are spaced; against v6.37 the example's Income tab
  differs by that one space, and its floor paragraph reflows by a line at 820 (text, not layout). `t102` B-3, B-4.
- **Desktop identity was proved against a build with the phone rules deleted**, not against v6.37 (whose text differs by §8.2's space and
  §8.4's wording): every Income-tab box at 820 and 1440 on the example and the three-stream plan is identical with or without the rules.
  The independent review compared every element box on all 26 tabs at 820 and 1440 with v6.37: outside the Income tab only the footer's
  version text differs.

**8.3 · The scope's census was wrong in one figure** (My Data 21 → 8) — the detector's own-element clip; corrected in §5 above, in F-30
and in the Field Manual's list (which never quoted a number).

**8.4 · Found by the independent build review, and fixed (Steve, 2026-10-29: *"Fix in v6.38"*).**
- **The new "no shortfall" sentences were untrue when a counted stream ends.** The after-payments figure reused the streams running at the
  last Medicare month: on `t45`'s fixture *"From May 2034 … income exceeds spending by $14,180/mo"* counted consulting that ended in 2032.
  From v6.38 that figure counts the streams running on the date the payments end (`_ppInc`); the floor names the first counted stream that
  ends (*"The figures above count Consulting, which ends in 2032; after that this tab's income is lower."*) and says *"at that point there is
  no shortfall"*. The after-payments figure moves for plans whose streams change between the two dates (pre-existing since v6.21).
- **Three more sentences claimed a draw of $0 from the portfolio:** the gap card (*"the model draws it from the portfolio"*), the first
  phase's note (*"Maximum vulnerability — portfolio covers the shortfall."*) and the floor's gap sentence; and the coverage metric was red
  above 100%. Each now follows the figure.
- **"$0" ran into its sub-line** (*"$0income exceeds…"*): the key-metric row has a 10 px gap.
- **Cents.** A plan carrying cents printed *"-$3,019.6"*, *"$36,235.2/yr"*, *"$155,270.4"*: the differences, the yearly draws, the gap's
  monthly figures and the phase cards' figures are rounded to the dollar. Income as entered still prints as entered.
- **The Field Manual's width claim** (*"A tablet or desktop screen shows them apart"*): the Stress table still overprints at 600–640 px;
  measured clear from 680 px (Expenses' label aside). The sentence now says *"A screen 680 px wide or more (a desktop, or a tablet held
  sideways)"*. And *"nothing moves on a tablet or a desktop"* became *"the tablet and desktop layout is unchanged"* (§8.2's reflow is text).
- **Recorded, not changed:** the phase bars (22 px, `overflow: hidden`) clip a wrapped label at 390 on the example (*"INCOME $1,700"*) —
  clipping, not overprinting, so `t45` §S cannot see it; filed with F-30. The SS tab's *"Shortfall after Car Payment ends"* card counts no
  income stream at all (its expression has no stream term — read in the source while checking §8.4's first item, not rendered) — a
  different rule from the Income tab's; filed with F-30's note as a lead.

**8.5 · Tests as built.** `t102` (both legs): v6.37 26, v6.38 44 at the build's final run (counts in the CHANGELOG are the packaged run's).
`t45` §S: 36 checks (88 → 124). `t29`: B-33, C-f20-1. Controls: `qa/tools/controls_v638_income.py` — 22 source controls and 3 page
controls (results in the CHANGELOG). A phone rule leaking to 600 px and up moves no measured box on the fixture plans, so `t45` S-7 cannot
see a leak; `t102` A-1b holds it by source (K1).
