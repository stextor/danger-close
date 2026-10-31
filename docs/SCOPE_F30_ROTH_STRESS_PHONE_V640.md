# SCOPE — F-30 (first part) · The Roth and Stress tabs on a phone

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.40 (2026-10-31).** Build record §9 (the independent build review's fifteen findings, §9.2). Decided: DF-1 to DF-7 all as recommended (Steve, 2026-10-30: *"As proposed"*, *"Fix 115–130%, file the rest"*, *"Leave as is, note it"*, *"Yes — v6.40; tax → v6.41"*). |
| Build scoped against | **v6.39** · source `src/DangerClose.jsx` md5 `5a948ff4ca43908c8fdffe948780519b` · built `index.html` `f8df7ca2f6d70871bbf7ea6cb87f2a52` · repo `e3c748c` |
| Freshness | Pool source `DangerClose-v6_39.jsx` = manifest = newest CHANGELOG entry; all 16 pool documents equal the clone at `e3c748c` (2026-10-30, this session). `package_check` 54/0 post-upload; §F clone diff clean. |
| Kind | A **presentation** release: the Roth and Stress tabs' layout on narrow screens, and one Field Manual sentence. No engine, table, stored field or word on either tab changes; no figure moves. |
| Register | Fixes **UsabilityFlaws F-30** for the Roth and Stress tabs (100 of its 124 overlapping pairs on the example at 390 px). F-30 stays **open** for My Data, Social Security, Expenses and Taxes, whose cause this scope traces (§5). Files **F-31** and **F-32** (§5), and corrects F-8's census row (§2). §K2 sweep: §2. |
| Review | An independent review (a reviewer given the scope and the sources, not this session's reasoning) re-ran the measurements and found ten problems with the first draft; §8 lists them and what changed. |
| Version | Proposed **v6.40**; the 2027 tax figures become **v6.41** (DF-7). |

---

## 0 · Premise — measured in Chromium on the built v6.39 page, not read

Every figure here comes from scratch probes run this session against the shipped page (`b639/runpk639/index.html`, `f8df7ca2…`) and against
a prototype of the fix built from the v6.39 source (`f30/build`, made by `f30/proto2.py`: source `2a2b9154…`, page `1459593f…`; scratch, never
shipped). The probes (`f30/probe.py`, `zprobe_mine.py`, `boxes.py`, `shots.py`; they assert nothing) use **`t45` §S's own overlap detector**,
read from `qa/t45_phone_layout.py` at run time: pairs of visible text boxes from different elements overlapping by more than 3 px each way,
each box clipped to every scrolling box around it. Plans: the example as it opens; `qa/tools/fixture/f20_streams_plan.json` (the example with
four income streams); that plan made single (as `t6` makes one); that plan with no ACA premium (the Roth comparator then has one column
fewer — checked: both render the six-column comparator); that plan with every balance ×5 (wider figures). UI SIZE is set through its stored
key (`ui_scale_v1`) before the page loads.

**0.1 · F-30 as registered — reproduced.** Roth **70**, Stress **30** at 390 px on the example; Stress **1** at 600 and at 640; neither tab
from 680 up. The other four F-30 tabs unchanged from the register: My Data 8, Social Security 10, Expenses 4, Taxes 2 (and the Grade tab's one
known false positive, its large letter's glyph box). 70 + 30 = 100 of the register's 124.

**0.2 · Wider than registered: every phone width, every plan, and every UI SIZE above 100%.** F-30 was measured at 390 px and UI SIZE 100%.

| Example, pairs, UI SIZE 100% | 360 | 375 | 390 | 414 | 430 | 480 | 540 | 599 | 600 | 640 | 680+ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Roth | 77 | 73 | 70 | 49 | 36 | 12 | 12 | 0 | 0 | 0 | 0 |
| Stress | 43 | 41 | 30 | 30 | 16 | 3 | 2 | 1 | 1 | 1 | 0 |

At 390: the stream plan Roth 72 / Stress 29; single 50 / 29; no ACA 67 / 29; ×5 balances 80 / 30.

UI SIZE (the Skins tab's 100/115/130/150% setting) is a CSS `zoom` on the whole app, while the phone layout switches on the **window's** width
(`@media (max-width: 599px)`), so a zoomed window gets the tablet layout in less room than a phone has:

| Example, Roth / Stress pairs | 390 | 600 | 800 | 1024 | 1440 |
|---|---|---|---|---|---|
| UI SIZE 115% | 87 / 55 | 12 / 2 | 0 / 0 | 0 / 0 | 0 / 0 |
| UI SIZE 130% | 177 / 139 | 23 / 15 | 0 / 1 | 0 / 0 | 0 / 0 |
| UI SIZE 150% | 270 / 195 | 71 / 32 | 14 / 4 | 2 / 2 | 2 / 2 |

(The 2 / 2 at 1024 and 1440 are the page header's *"Success rate"* and its figure, not either tab — and not overprinting: the 30 px figure's
line box touches the label by design, and the detector's 3 px threshold, in screen pixels, is crossed under 150% zoom; a screenshot at 1024 / 150%
is clean, and `t45`'s Income check has left that box out since v6.38. *Corrected at the build (§9.2): this note first called it an overprint.*)
At 150% on a 390 px phone the page itself scrolls sideways (404 and 421 px) — on v6.39 as shipped; so does the Stress tab at 130% (395 against
390, found by the build review).

**0.3 · Six layout sites, one cause.** Grouping every overlapping pair by the grid that lays it out (parser census of the two renders, §1):

| Site | Grid (`gridTemplateColumns`) | Pairs at 390 (example) | What prints over what |
|---|---|---|---|
| **R1** Roth · IRMAA lookback calendar | `repeat(9, minmax(0, 1fr))` | 40 | nine year cards a row, 29 px each: *"CONVERT"* over *"CONVERT"*, years over years (screenshot read: unreadable) |
| **R2** Roth · strategy comparator | `1.5fr repeat(7, minmax(0, 1fr))`, or `repeat(6, …)` with no ACA column | 29 | every figure column, 28 px each: *"$1496K"* over *"$329K"* |
| **R3** Roth · constraints & rules box | `minmax(0, 1fr) minmax(0, 1fr)` | 1 | *"(10/12/22/24/32/35/37%)"*, which cannot break, over the next column |
| **S1** Stress · scenario table | `150px repeat(6, minmax(0, 1fr))` | 30 | the column heads and every figure row, 28 px a column; at 600–640 px *"STAGFLATION"* (about 79 px of text in a 59 px cell) over *"SEQUENCE RISK"* |
| **S2** Stress · portfolio risk report | `repeat(4, minmax(0, 1fr))` | 0 (1 at 360) | *"Std Deviation:"* over *"Sortino Ratio:"*; at 390 its text also runs past the tiles' borders, which the detector does not count (screenshot read) |
| **S3** Stress · 30-year guardrail table | `repeat(5, minmax(0, 1fr))` | 0 (1 at 360) | *"Planned"* over *"Upper ("* |

**The cause is one change, and it is the fix for something else.** v5.79 (F-11, `5c2c2ac`) stopped every tab scrolling sideways on a phone
by rewriting each grid's `1fr` track as `minmax(0, 1fr)` (`git log -S` finds all six templates entering at that commit, and its diff removes
the `1fr` forms). A `1fr` track cannot shrink below its content, so before v5.79 these grids widened the page; a `minmax(0, 1fr)` track can
shrink to nothing, so since v5.79 they squeeze their text into columns narrower than the text and it spills over its neighbours. Where v5.79
also put a grid in its `dc-scrollx` box (the box scrolls; its child gets a minimum width, 600 px unless a table sets `--dc-floor`), it did not
overprint; these six were not. **R1 sits inside an `overflowX: "auto"` box already**, but a box whose child has no minimum width never scrolls.

**0.4 · Who it reaches.** Everyone who opens the Roth or Stress tab on a phone held upright (below 600 px); the Stress tab on a phone held
sideways or a small tablet (600–679 px); and anyone using a UI SIZE above 100% in a window narrower than about 800 px (1024 at 150%).

## 1 · Site census (parser, this session)

An AST walk of the two tab renders (`activeTab === "roth"` L10960–L11820, `activeTab === "stress"` L13211–L13477; `f30/census.cjs`, acorn
and acorn-jsx) lists every `gridTemplateColumns` in them — **8 on Roth, 5 on Stress**. The review confirmed no helper or component defined
outside those two expressions renders into either tab, and each tab has one such expression.

| Line | Template | Measured | In this release |
|---|---|---|---|
| L11360 | `repeat(4, minmax(0, 1fr))` (parameters box) | in a `dc-scrollx` box since v5.79 — no overlap | no |
| L11383 | nine fixed px tracks (year-by-year table) | in an `overflowX: auto` box with `minWidth: 650` — no overlap | no |
| L11442 | `repeat(3, minmax(0, 1fr))` (RMD cards) | no overlap at UI SIZE 100–130%; overprints at 150% on a phone (F-32) | no |
| L11464 | `minmax(0, 1fr) minmax(0, 1fr)` | **R3** | yes |
| L11502 | `repeat(9, minmax(0, 1fr))` | **R1** | yes |
| L11678 | `_hasAca ? "1.5fr repeat(7, …)" : "1.5fr repeat(6, …)"` | **R2** (both variants measured) | yes |
| L11787, L11801 | `repeat(auto-fill, minmax(118px, 1fr))` | tracks never under 118 px — no overlap | no |
| L13228 | `repeat(4, minmax(0, 1fr))` | **S2** | yes |
| L13263 | `150px repeat(6, minmax(0, 1fr))` | **S1** | yes |
| L13320, L13388 | `repeat(2, minmax(0, 1fr))` and `minmax(0, 1fr) minmax(0, 1fr)` (scenario and sequence cards) | no overlap at any width, plan or UI SIZE measured | no |
| L13444 | `repeat(5, minmax(0, 1fr))` | **S3** | yes |

Also edited: the stylesheet's v5.81 phone block (`@media (max-width: 599px)`, L8088) gains **one** rule; `DOCS_HTML` §13's *"Designed for a
desktop browser"* item, one sentence (§3.3); a §13 v6.40 note; the four version sites.

**Suites that read what this changes** (parser census of string and template literals in `qa/` — acorn for `.mjs`, Python's `ast` for `.py`
— and the review's own sweep):
- **Re-gated:** `t102` E-2 pins the §13 sentence word for word; `t102` A-2 counts exactly one element each carrying `dc-stack-phone` and
  `dc-two-phone`, which §3 reuses (from v6.40 it counts the Income tab's by their own grid).
- **Registered for v640:** `t45`'s `KNOWN_VERSIONS` and its hand-widened `POSTF20` list, `t102`'s `POST`, `t4`'s signature list, and every
  other registry, by the usual AST registration plus the hand edits it cannot see (OPERATIONS §G, the four registry shapes).
- **Read, unaffected (each must still pass):** `t62` A-1 and `t48` X-10 read other clauses of the same §13 item; `t1` *EXT F-2/F-8* counts the
  two `repeat(9, minmax(0, 1fr))` grids and at least eleven `overflowX: "auto"` boxes (§3 removes neither); `t30` C-1/C-2; `t96` B2 and `t4`
  read the calendar's and the tabs' text, which does not change; `t102` A-1, A-1b and F-2.

## 2 · Register sweep (§K2) — by mechanism, not by ID

Searched `UsabilityFlaws.md`, `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `FlawsToFix-v5_73-Phase2.md` and `METHODOLOGY.md` for the
mechanism (`minmax(0`, `dc-scrollx`, *overprint*, *print over*, the calendar, the scenario table, UI SIZE):
- **F-30** — this item; it said *"The cause on each tab was not traced"*. Traced here for all six tabs (§5).
- **F-8** — its census row reads *"FIXED v5.40 · grids wrapped, later `repeat(9, minmax(0, 1fr))`"*. The second clause is the v5.79 change,
  and it turned the Social Security tab's 9-column claiming grids from overflowing into **overprinting** (8 of that tab's 10 pairs, §5). The
  row should say so; the fix stays with F-30's Social Security part.
- **F-11p** (FIXED v5.79) — the source of the mechanism. Its fix stands at UI SIZE 100% except on the Income tab at 600–625 px (F-31) and
  at 150% on a phone (F-32).
- **F-10** (FIXED v5.39) — documented UI SIZE; nothing recorded how it meets the phone layout. F-32.
- Nothing in MissingFeatures, ARCHITECTUREIssues, FlawsToFix or METHODOLOGY touches this mechanism.

## 3 · The fix — prototyped and measured

Two tools the app already has:
- **reflow on a phone** — a class whose rule exists only inside the v5.81 phone block (as v6.38's `dc-stack-phone` and `dc-two-phone`
  do), so it cannot act at 600 px and up; and
- **a minimum width inside a box that scrolls** — v5.79's `dc-scrollx` (the minimum set per table with `--dc-floor`), so a table keeps its
  columns and its box, not the page, scrolls. A minimum width acts **at every window width**: it engages only where the grid would be
  narrower than it — on a phone, and in a window that UI SIZE has narrowed — and nowhere else.

| Site | Proposed | Why |
|---|---|---|
| R1 calendar | **on a phone, as many year cards a row as fit at 84 px or more** (`dc-cards-phone`, the one new phone rule: `repeat(auto-fill, minmax(84px, 1fr))`, minimum width lifted); **a 500 px minimum at every width**, in the box it already sits in | three a row on a phone at 100% (screenshot read: clear), two where UI SIZE leaves less room; the minimum makes a zoomed window scroll the calendar rather than print it over itself. 500 px is the calendar's width at a 600 px window and UI SIZE 100%, so it does not engage there or wider |
| R2 comparator | **a `dc-scrollx` box with a 490 px minimum, at every width** | a comparison across strategies needs its columns lined up. 490 px is under the comparator's own width at a 600 px window (about 500 px; a 520 px minimum engaged there and moved its boxes — measured, then lowered) |
| R3 rules box | **stacks on a phone** (`dc-stack-phone`, reused) | two columns of prose |
| S1 scenario table | **a `dc-scrollx` box with a 720 px minimum, at every width** — so it scrolls on every phone and on screens from 600 to about 793 px at 100% | at a 600 px minimum the 75 px columns still put *"STAGFLATION"* over *"SEQUENCE RISK"* (measured: 1 pair at 390–640); at 720 every heading fits whole (DF-2) |
| S2 risk report | **two a row on a phone** (`dc-two-phone`, reused) | four tiles; two a row also ends the text running past their borders |
| S3 guardrail table | **a `dc-scrollx` box with a 290 px minimum, at every width** *(360 px as first built — §9.2)* | overprints only below about 375 px; 290 px is its width at a 390 px window, the narrowest at which no heading touches the next by even half a pixel (measured with and without the web fonts), so it scrolls only below 390 px |

What a box that scrolls loses: the first column (strategy names, metric names) scrolls away with the rest; nothing stays pinned, and no
hint says the box scrolls — the column cut off at its edge is the cue, as in v5.79's 14 `dc-scrollx` boxes (parser count; none has a hint).
DF-6.

**3.1 · Measured on the prototype (`1459593f…`).** Overlapping pairs on Roth and Stress, UI SIZE 100%: **0** at 360, 375, 390,
414, 430, 480, 540, 599, 600, 640, 680 and 768 px on the example, and at 360, 390 and 600 on the stream, single, no-ACA and ×5 plans. UI SIZE
115% and 130%: **0** at 390, 600, 800, 1024 and 1440 px (v6.39: up to 177 and 139, §0.2). UI SIZE 150%: Stress 2 at every width (the page
header, F-32); Roth 2 plus 5 at 390 (the RMD cards, L11442) and 2 plus 1 at 600 (the rules box, whose stacking is phone-only) — v6.39: 270 and 71.
No page scrolls sideways at any of these except at 150% on a 390 px phone (404 px, as on v6.39; F-32). All 26 tabs at 390 and 600 px: only
Roth and Stress change (My Data 8, Social Security 10, Expenses 4, Taxes 2 and the Grade false positive at 390; the Expenses label and the
Grade false positive at 600 — as on v6.39). Screenshots read at 390: the calendar three years a row, clear; the comparator and the scenario
table each scroll within their box.

**3.2 · Desktop and tablet at UI SIZE 100% — measured, `Math.random` seeded so both pages draw the same Monte Carlo.** Every text box on the two
tabs (position and size), v6.39 against the prototype, on the example:
- **Roth: all 501 boxes identical at 600, 640, 680, 768, 800, 820, 1024 and 1440 px.** The phone rules cannot act there, and the two
  minimum widths (R1 500, R2 490) are at or under the widths those grids already have at a 600 px window.
- **Stress: all 263 boxes identical at 800, 820, 1024 and 1440 px.** At 600, 640 and 680 the scenario table's boxes differ (it is now 720 px
  wide inside a box that scrolls; its heading row is 84 px tall, was 112–126); every box above it is identical, and every box below it moves
  up by one constant amount (42 px at 600 and 640, 28 at 680) with its x, width and height unchanged. At 768 only the table's 42 boxes
  differ.

**3.3 · The Field Manual (§13's *"Designed for a desktop browser"* item).** Now: *"On a phone some figures still print over their neighbours:
the Roth tab’s IRMAA calendar, the Stress tab’s scenario table, and parts of the My Data, Social Security, Expenses and Taxes tabs (v6.38: the
Income tab’s were fixed). A screen 680 px wide or more (a desktop, or a tablet held sideways) shows them apart, except that a long category
name on the Expenses tab can run under its item at any width."* Its second sentence is already false at a UI SIZE above 100% (§0.2).
Proposed: *"On a phone some figures still print over their neighbours on parts of the My Data, Social Security, Expenses and Taxes tabs
(v6.38: the Income tab’s were fixed; v6.40: the Roth and Stress tabs’). At UI SIZE 100% a screen 600 px wide or more shows them apart, except
that a long category name on the Expenses tab can run under its item at any width. A larger UI SIZE gives the page less room, as a smaller
screen would, but the phone layout follows the window's width, not UI SIZE: with a large UI SIZE in a narrow window some figures overlap, and
on a phone at 150% the page can scroll sideways. Between 600 and 625 px the Income tab can scroll sideways when an income stream has a long
label."* (F-31: the bullet's *"the page itself no longer scrolls sideways"* is not quite true until F-31 is fixed, so it is disclosed.) Plus a §13 v6.40 note: on a phone the Roth calendar shows as many years a row as fit; the
comparator and the Stress tab's two tables scroll within their boxes on narrow screens; the desktop layout is unchanged. (Measured on the
prototype, all 26 tabs at 600 and 640 px, UI SIZE 100%: only the Expenses label and the Grade false positive remain.)

## 4 · Tests

- **`t45` (Chromium, current leg)** §S gains, from v6.40 (earlier builds print a skip line): Roth and Stress hold **zero** overlapping pairs
  at 360, 390 and 430 px on the example and on the stream plan, at 600 and 640 px on the example, and at UI SIZE 130% at 390, 600 and 800 px
  on the example; the page does not scroll sideways in any of these (the existing L- and S-3 checks cover 100%).
- **New `t104_roth_stress_phone.mjs` (jsdom, both legs; the v6.39 leg pins each defect as `[KNOWN DEFECT 2026-10-30, F-30 — flips at
  v6.40]`).**
  - **§A by AST.** The one new rule exists only inside the phone block, once, and says what it does (`auto-fill`, `84px`, the minimum lifted).
    Each site carries its class, or is the **direct child** of a `dc-scrollx` box whose `--dc-floor` is the one decided (R2 490, S1 720, S3
    360), or carries its own `minWidth` (R1 500). **EXTINCTION:** in the two tab renders, every grid whose template — `repeat()` expanded, both
    branches of a conditional read — has **two or more** tracks that can shrink to zero (`minmax(0, …)`) must (i) be the direct child of a
    `dc-scrollx` box (its `> *` rule sets the minimum on the direct child only), (ii) carry a `minWidth` of its own, (iii) carry one of the
    phone classes, or (iv) be on a named list with its reason — the seven sites §1 leaves alone (L11360, L11383, L11442, L11787, L11801,
    L13320, L13388), each named with what keeps it apart. An `overflowX: auto` parent alone does not count (R1's did not stop it). A new
    shrinking grid added to either tab without one of these fails.
  - **§B rendered text.** On the example, the single plan and the no-ACA plan, the two tabs' rendered text is **identical** to v6.39's — both
    legs with `Math.random` seeded the same way before load and the tabs visited in the same order (`domdiff_withdrawal.mjs`'s rule), the
    v6.39 leg dumped in a child process. If the run folder has no v6.39 bundle the check **fails**, it does not skip: the release's claim that
    no word or figure moves rests on it.
  - **§C** §13's new sentence and its v6.40 note.
- **Re-gated:** `t102` A-2 and E-2 (§1).
- **Controls:** `qa/tools/controls_v640_phone.py` — each fix reverted alone (each class removed; each box or minimum removed; S1's minimum at
  600; R2's at 520; the new rule moved outside the phone block; the rule's `min-width: 0` dropped), each naming the check that must go red
  (`t104` §A, and `t45` against a copy of the built page for the layout ones, which is how `controls_v638_income.py` did it).
- **Census:** no boundary row — F-30 is visible on the example. The plans the example does not reach (no ACA column; a single plan) are in
  `t104` §B, and were measured for layout here.
- The full suite from the packaged copies; parity 10/10 (no engine changes).

**Not reached, stated:** the box comparison at 600–1440 px (§3.2) is done at the build, not by a suite (no suite holds two built pages);
widths and UI SIZEs other than those listed; real phones (Chromium's mobile emulation only).

## 5 · Filed by this scope

**F-30's other four tabs — the cause, traced.** The same grouping on all 26 tabs at 390 (§0.1): every remaining pair is in a grid of
`minmax(0, …)` tracks from v5.79 — **My Data 8** (`repeat(4, …)` ×3, four `minmax(0, 1fr)` columns ×4, `140px` + three ×1); **Social Security
10** (the 9-column claiming grids ×8, the F-8 grids; `repeat(3, …)` ×2); **Expenses 4** (`repeat(4, …)`); **Taxes 2** (`repeat(6, …)`). The
same two tools should fix them; each tab still needs its own measurement, because whether to reflow or scroll depends on what the grid holds.
The Expenses label that runs under its item at every width is not one of these grids (it overprints on desktop too); its cause was not
traced. **Recorded on F-30, not built here** (DF-4).

**F-31 (new) · The Income tab widens the page at 600–625 px on a plan with a long income-stream label.** Found by this scope's review on v6.39
as shipped: the stream plan's Income tab is 626 px wide at windows of 600 and 620 px (660 is fine), because v6.38's stream-row wrapping lives
in the phone block and stops at 599 px; the row's amount (*"$12,500/mo"*) is what crosses the edge. `t45` checks the stream plan at 390 only.
**Low** (a 26 px band, a long label). Filed, not fixed (DF-4); disclosed in §3.3's sentence.

**F-32 (new) · UI SIZE and the phone layout.** UI SIZE is a CSS zoom on the whole app; the phone layout (v5.81, v6.38 and this release's
rules) switches on the window's width. So a larger UI SIZE in a narrow window gets the tablet layout in less room than a phone has (§0.2), and on
a phone at 150% the page scrolls sideways (404 and 421 px at 390 on v6.39). *(As first written this paragraph also said the page header's
"Success rate" prints over its figure at 150%; it does not — a detector false positive, §0.2 and §9.2.)* This release's minimum widths remove the Roth and Stress overlaps at 115% and 130% everywhere
measured; at 150%, the RMD cards (L11442) on a phone and the rules box at 600 px still overlap (§3.1). **Medium** for users who need the larger size (UI SIZE exists for them), and undisclosed until §3.3. A real fix
makes the phone layout follow the zoomed width (for example a class set from the window width and UI SIZE together), which reaches every
phone rule in the app — its own release.

## 6 · Out of scope

The four tabs in §5 (DF-4); F-31 and F-32 beyond what §3 does (DF-4, DF-5); the Expenses label at desktop widths; pinned first columns or a
scroll hint (DF-6); the 44 px touch-target guideline (F-3, disclosed); F-30's lead about the SS tab's *"Shortfall after Car Payment ends"* card
(a figure, not a layout); any engine.

## 7 · Decisions for Steve

| # | Decision | Options | Recommended |
|---|---|---|---|
| **DF-1** | How the three Roth sites change | (a) as §3: on a phone the calendar shows as many years a row as fit, the rules box stacks; the calendar (500 px) and the comparator (490 px) get a minimum width so a narrow or zoomed window scrolls them; at UI SIZE 100% the tab is unchanged from 600 px up (measured) · (b) all three only scroll inside their boxes (simpler; the calendar becomes a strip to swipe) | **(a)** |
| **DF-2** | The Stress scenario table between 600 and about 793 px (phones held sideways, small tablets, an iPad upright at 768) | (a) scroll inside its box below 720 px, so every heading fits whole — the table also changes on those screens (measured: only the table, §3.2) · (b) phone-only, and leave the one 600–679 px overlap, disclosed · (c) let the headings break mid-word (*"STAGFLATI-ON"*) at every width | **(a)** |
| **DF-3** | The two small Stress sites that overprint only below about 375 px (risk report, guardrail table) | (a) fix them here · (b) leave them | **(a)** — the same tab and the same release |
| **DF-4** | My Data, Social Security, Expenses, Taxes, and F-31 | (a) keep F-30 open for the four tabs with the traced cause, file F-31, and fix them in the next phone release · (b) all now | **(a)** — Roth and Stress first, as you asked, ahead of the 15 December tax deadline |
| **DF-5** | UI SIZE (F-32) | (a) this release's minimum widths (they fix Roth and Stress at 115% and 130%), file F-32 for the rest, and say in §13 that the phone layout follows the window, not UI SIZE · (b) phone-only fixes, F-32 filed · (c) make the whole phone layout follow UI SIZE now (every phone rule in the app — a larger release) | **(a)** |
| **DF-6** | What scrolls away in a scroll box | (a) as the 14 boxes v5.79 made: nothing pinned, no hint · (b) pin the first column (the strategy and metric names) of the comparator and the scenario table, phone and zoomed windows — new behaviour to test in all 13 skins | **(a)**, and record (b) as an option for the next phone release |
| **DF-7** | Version | (a) v6.40; the 2027 tax figures become v6.41 (suite stays `t99`; deadline unchanged) · (b) other | **(a)** |

## 8 · The independent review (2026-10-30) — what it found, and what changed

1. **UI SIZE was missing**, and it breaks a phone-only fix (§0.2). → Minimum widths at every width for R1, R2, S1, S3; F-32 filed; §13 says it.
   Re-measured (§3.1).
2. *"The strategy names stay at the left"* was false: nothing is pinned. → Reworded; DF-6.
3. The extinction check was under-specified (four tracks missed R3; "a box that floors it" must mean the direct child of `dc-scrollx`; expand
   `repeat()` and both branches; the unchanged sites are **seven**, not eight). → §4 rewritten.
4. The first prototype added three phone rules, not two. → The design changed: one new phone rule now, and §4 pins it and its minimum.
5. *"101 of its 124"* → **100** (70 + 30).
6. The Income tab widens the page at 600–625 px on the stream plan, on v6.39 as shipped. → F-31 filed; the 26-tab check at 600 had run on the
   example only.
7. §B text identity must seed both legs alike and fail, not skip, without the v6.39 bundle. → §4.
8. More suites than `t102` touch this: version registries and two readers of the same §13 item. → §1.
9. Some §3.1 figures were read from an output written before the final prototype build. → Every §3.1 and §3.2 figure is now from runs against
   the final prototype (`1459593f…`).
10. The edit script's comments labelled R2 and R3 the wrong way round (scratch only).

Verified by the review as stated: all hashes; both tab line ranges and the 8 + 5 sites; the grouping of pairs by grid at 390 and 360; the §0.2
cells it re-ran; the six-column comparator on the single and no-ACA plans; the `git log -S` claim; the 14 `dc-scrollx` boxes; the first
prototype's measurements and box comparison.

## 9 · Build record (v6.40, 2026-10-31)

**9.1 · What was built.** Source `src/DangerClose.jsx` md5 `99f7f8f150bcd8db89a282fe2e2dfe63`, from v6.39's `5a948ff4…` (the six sites of §3,
the one phone rule, the §13 note and sentence, the four version sites), then the review fixes of §9.2. Built `index.html`
`53d30398041e26cd9ba6d84a8073651d` (vite 5.4.21; `package-lock.json` unchanged). The first build (`6b6cd883…` / `8d3ffcf1…`) was never shipped;
it is what the independent build review read.

**9.2 · The independent build review (2026-10-31)** — a reviewer given the code, the two built pages and this scope, not this session's
account. It re-measured §0–§3 (every v6.39 figure in §0.1–§0.2 reproduced exactly; every §3.1 and §3.2 figure confirmed, with the fallback
fonts and again with the app's real web fonts served locally) and found no blocker. What it found, and what changed:
1. **`t104` §B would fail every later run** (a later run folder holds no v6.39 bundle). → §B is required when the run folder's newest leg is
   v640, and prints a skip in any later one.
2. **Control K3 expected the wrong check** (removing the calendar's class leaves its 500 px minimum, which rightly still protects it; 18 of
   19). → K3 expects A-3a only; K16 removes class and minimum together and expects A-6 too.
3. **S3's 360 px minimum made the guardrail table scroll on most phones**, below 460 px, though it fits from 375 (at 390 it hid
   *"MC MEDIAN"*). §3's *"scrolls only where it must"* was false of 360. → **290 px**: the table's width at a 390 px window, the narrowest at which
   no heading touches the next by even half a pixel (measured on v6.39 at 360–400 px in 5 px steps, with and without the web fonts:
   strict-threshold pairs end at 390 / 385). DF-3 (a) as decided — fix it here, scrolling only where it must — is what 290 delivers.
4. **The header's *"Success rate"* "overprint" is a detector false positive** (§0.2, F-32). → Corrected in §0.2 and §5.
5. **`t45` S-9 passed only because the web fonts don't load here.** With them, that header pair appears at every width. → S-9 reads the page
   less the heading box (`PAGE_OVERLAP`), after a check that the box holds only the heading. Measured with the real fonts on the final page:
   0 pairs on both tabs in every S-9 case and at 768 / 1024 and UI SIZE 115% (the whole-page read: 2, the header pair, everywhere).
6. **`t104` A-6 counted `minWidth: 0` as protection.** → A minimum counts from 200 px, and a `--dc-floor`, if set, from 200 px. Controls K17
   (`minWidth: 0`) and K18 (a `0px` floor).
7. **The calendar's *"CONVERT"* labels run past their cards at 600 px and up** (screenshot, real fonts). Measured on the final page with the
   fonts: past the card's edge at every window from 600 to 680 px (9.1 px at 612, 1.5 at 680, 0.4 at 690, none from 700), and into the next
   card's label below about 612. Unchanged from v6.39 (R1 is identical there), and below the detector's 3 px. → **Disclosed** in §13's
   sentence (*"below about 690 px the Roth tab's IRMAA calendar's "CONVERT" labels can run past their cards"*) and on F-30; not fixed,
   because a fix changes the 600–690 px desktop layout — left for Steve with the next phone release.
8. **R1's minimum has no margin where a classic scrollbar takes room** (Windows): there the calendar and comparator minimums engage up to
   about 620 px and the scenario table's up to about 810, and those boxes scroll by a few pixels. No overprint. → §13's note says *"about 810
   where the browser's scrollbar takes room"* and *"Otherwise the desktop layout is unchanged"*; §3.2's box comparison is for overlay
   scrollbars (headless Chromium, phones, macOS by default).
9. **`t45`'s version gate was a hand-widened list** that would turn S-9 into a silent skip if missed. → Both §S gates compare version
   numbers; OPERATIONS §G records why for `.py` suites.
10. **S-9 never checked that UI SIZE took effect.** → Each zoomed case first reads the app's zoom.
11. `t104`'s header said `t45` measures 360–640 px; its exemption list holds three of §1's seven unchanged sites. → Header corrected; the
    other four need no exemption (one sits in a `dc-scrollx` box, three have no shrinking track), now said in the header.
12. A-5's hard grid count fires before A-6 on any new grid. Accepted (K12 fires both).
13. S1's bottom margin moved from the grid to its new wrapper (needed: a margin inside the scrolling box would add to its height). Recorded.
14. On v6.39 at UI SIZE 130% the Stress tab made a 390 px page scroll sideways (395 px), which §0.2 omitted. → §0.2 and F-32; v6.40 fixes it.
15. The scenario table matches v6.39 from a 795 px window (*"about 790"* stands).

**9.3 · Other departures from §3–§4.**
- **§13's sentence** gained the *"CONVERT"* clause (item 7), and the note the scrollbar parenthesis and *"Otherwise"* (item 8). `t104` C-1/C-2
  and `t102` E-2 pin the built wording.
- **`t45` S-9** reads the page less the heading box (item 5) and adds a heading check and three zoom checks: 22 + 4 = 26 checks.
- The scope's §1 said `t45`'s `POSTF20` is a list registered by hand; from v6.40 it is a comparison (item 9).

**9.4 · Measured on the final build** (`53d30398…`):
- `t45` on the dev run: 150 passed, 0 failed (S-9 26 of 26).
- `t104`: v6.39 leg 16 / 0, v6.40 leg 26 / 0 (§B identical on all six texts).
- `t102`: 43 / 0 on both legs.
- The guardrail table at UI SIZE 100%: unchanged from v6.39 at 390 px and wider; it scrolls by up to 30 px below 390.

**9.5 · The packaged run** (a run folder built by `mk_runfolder.sh v639 v640` from a clone of `e3c748c` carrying the package's `github/`
files): **10,937 app checks across 102 app suites, 0 failed, 0 DIED** — 5,880 current-leg, 4,576 prior-leg, 234 + 237 attribution, MC parity
10/10; tooling 120; GRAND 11,057. `t104` 26 / 16, `t45` 150, `t102` 43 / 43. Controls on a copy of that folder: **23 of 23** (C0, K1–K18, P1–P4).
`smoke_built` 22 / 22 on the packaged page. v6.39 rebuilt byte-identically (`f8df7ca2…`) on the same toolchain. Box comparison of the final page
against v6.39 (seeded): Roth identical at 600–1440 px but the footer's version; Stress identical from 800 px; at 600–768 the scenario table's
boxes, as §3.2.
