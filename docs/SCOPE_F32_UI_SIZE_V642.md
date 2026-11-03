# SCOPE — F-32 · the phone layout follows UI SIZE (and F-33, phones narrower than 360 px)

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.42 (2026-11-02).** Review §8, build record §9. Steve chose DH-1 to DH-4 as recommended (§7); one deviation from DH-2's wording is owned in §8 (the Verify tables fit by breaking a long citation rather than scrolling). |
| Build scoped against | **v6.41** · source `src/DangerClose.jsx` md5 `0f20b07de191cccbea077efb7cc1e11b` · built `index.html` `a8862af237917897bc14145e9f3a415f` · repo `ad722dc` |
| Freshness | 2026-11-02, this session: `package_check` 54/0 with all four arguments after Steve's upload; §F clone diff clean; the live site serves `a8862af2…`. |
| Kind | A **presentation** release: which layout the app picks at each width, and the narrow-layout rules for about 25 sites on about 15 tabs. No engine, table, stored field or computed figure changes. |
| Register | Fixes **UsabilityFlaws F-32** (UI SIZE and the phone layout do not meet). Under DH-1 (a), (b) or (c) it also fixes **F-33** (phones narrower than 360 px at UI SIZE 100%), because the same rules cover it (§0.5). |
| Version | **v6.42**; the 2027 tax figures become **v6.43** (DH-4). |

---

## 0 · Premise — measured in Chromium on the built v6.41 page, not read

Every figure comes from scratch probes run this session (`f32/probe.py`, `boxes2.py`, `wide.py`, `loader.py`; they assert nothing) on the shipped
v6.41 page (`a8862af2…`) and on a prototype of the fix, **p1** (`s642/proto1.py` applied to the v6.41 source; page `ef130522…`; scratch, never
shipped). The overlap detector is **`t45` §S's own `PAGE_OVERLAP`**, read from `qa/t45_phone_layout.py` at run time. `Math.random` is seeded
before load, so both pages draw the same Monte Carlo. UI SIZE is set through its stored key before load. Plan: the example as it opens. The
Grade tab's one pair is the known false positive (the large letter's glyph box) and is left out of every count here.

**0.1 · The mechanism (source, parser census §1).** UI SIZE (Skins tab: 100 / 115 / 130 / 150%) is a CSS `zoom` on the app's root
(`zoom: (uiScale || 100) / 100`, L8064; the data-load screen's wrapper L15536 the same). The phone layout switches on the **window's**
width: one `@media (max-width: 599px)` block (L8088–L8107: the tab menu, the plan summary, and the phone classes of v5.81, v6.38, v6.40 and
v6.41) and one `@media (max-width: 699px)` rule (the Roth calendar, v6.41). A zoom does not change the window's width, so at 150% in a 600 px
window the app lays out in 400 px of room with the desktop layout. The room the layout gets — call it the **layout width** — is the window's
width ÷ UI SIZE.

**0.2 · Zoomed windows 600 px and wider: v6.41 overlaps; p1 removes every one.** All 26 tabs, pairs summed (tabs with any):

| UI SIZE / window | 600 | 700 | 800 | 900 | 1024 |
|---|---|---|---|---|---|
| 115% — v6.41 | 2 (1: Expenses) | 0 | 0 | 0 | — |
| 130% — v6.41 | 13 (3: My Data 2, Expenses 4, Income 7) | 2 (Expenses) | 0 | 0 | — |
| 150% — v6.41 | 52 (6: My Data 8, Expenses 4, Income 27, SS 10, Roth 1, Taxes 2) | 12 (3) | 2 (Expenses) | 0 | 0 |
| **every UI SIZE — p1** | **0** | **0** | **0** | **0** | **0** |

At 600 px and 150% the layout width is 400, so p1 gives the window the phone layout — which v6.38–v6.41 already made clean at 390 px.

**0.3 · Phones: p1 changes nothing there, because the window is already under 600 px. What remains is the narrower room.**

| Phone | 100% | 115% | 130% | 150% |
|---|---|---|---|---|
| 430 px | 430 | 374 | 331 | 287 |
| 390 px | 390 | 339 | 300 | **260** |
| 360 px | 360 | 313 | 277 | **240** |
| 320 px | 320 | 278 | 246 | 213 |

Layout width (px) by phone and UI SIZE. On v6.41 and on p1 alike, 26 tabs at 390 px:

| UI SIZE at 390 px | Pairs | Tabs overlapping | Pages wider than the window |
|---|---|---|---|
| 115% | 2 (Monte Carlo) | 1 | 1 (Verify 411) |
| 130% | 129 (Guardrails 1, Withdrawal 3, Monte Carlo 121, Survivor 4) | 4 | 4 (Dashboard 409, Ranking 395, Checklist 402, Verify 465) |
| 150% | 163 (My Data 1, Ranking 4, Guardrails 4, Withdrawal 7, Roth 5, IRMAA 1, Monte Carlo 133, Survivor 8) | 8 | 8 (My Data 445, Dashboard 472, Trajectory 396, SS 432, Ranking 426, Roth 404, Checklist 465, Verify 537) |

(Grade, the false positive's tab, is also 401 / 453 / 522 px wide at 115 / 130 / 150%.)

**0.4 · So F-32's remaining work is the layout at 240–340 px.** Measured on p1 at UI SIZE 100% in windows of 240, 260, 300 and 340 px (the
same room a zoomed phone gets; the build measures the zoomed phones themselves). Pairs, then how far the page runs past the window:

| Tab | 240 | 260 | 300 | 340 |
|---|---|---|---|---|
| My Data | 2 · +58 | 1 · +38 | 0 | 0 |
| Dashboard | +75 | +55 | +15 | 0 |
| Trajectory | +24 | +4 | 0 | 0 |
| Social Security | +48 | +28 | 0 | 0 |
| Grade | +108 | +88 | +48 | +8 |
| Ranking | 4 · +37 | 4 · +24 | +4 | 0 |
| Guardrails | 8 | 4 | 1 | 0 |
| Withdrawal | 7 | 7 | 3 | 0 |
| Roth | 16 · +15 | 3 · +9 | 0 | 0 |
| IRMAA | 1 · +7 | 1 | 0 | 0 |
| Monte Carlo | 140 | 133 | 121 | 1 |
| Survivor | 12 | 8 | 4 | 0 |
| Stress | 2 | 0 | 0 | 0 |
| Checklist | +71 | +51 | +11 | 0 |
| Ask AI | +6 | 0 | 0 | 0 |
| Verify | +118 | +98 | +58 | +18 |

The other ten tabs: 0 and no sideways scroll at every one of these widths.

**Overprinting sites** (each pair grouped by the grid that lays it out, at 240 px):

| Site | Tab · what | Grid | Pairs at 240 |
|---|---|---|---|
| N1 | Monte Carlo · percentile table (*"Year / 10TH / 25TH / Median…"*) | `repeat(6, minmax(0, 1fr))` | 126 |
| N2 | Monte Carlo · LTC results (*"Median end (with LTC)"*) | `repeat(4, …)` (v6.41's C1 reaches only below 600) | 7 |
| N3 | Monte Carlo · regime weights (*"BASE 35%…"*) | `repeat(6, …)` | 5 |
| N4 | Monte Carlo · mortgage row | `minmax(0, 1fr) 80px 80px` | 2 |
| N5 | Roth · RMD cards | `repeat(3, …)` | 16 |
| N6 | Survivor · *"Monthly income before / after"* | `repeat(4, …)` | 12 |
| N7 | Guardrails · lower / normal / upper cards | `repeat(3, …)` | 8 |
| N8 | Withdrawal · *"Years modeled / Total withdrawn"* | `repeat(4, …)` | 7 |
| N9 | Ranking · *"SAVINGS BENCHMARKS"* | two `minmax` columns | 4 |
| N10 | My Data · household totals (v6.41's `dc-two-phone`) | two columns at 240 | 2 |
| N11 | Stress · scenario cards | `repeat(2, …)` | 2 |
| N12 | IRMAA · *"Lifetime IRMAA surcharges"* | `repeat(3, …)` | 1 |

**Sites that widen the page** (the element that runs furthest past the window, at 240 px):

| Site | Tab · what | Why |
|---|---|---|
| W1 | Verify · the `validation/check_constants.mjs` path, and the constants table (its citation column) | an unbreakable string; a table with no scroll box |
| W2 | Grade · the page | not located by the probe (it reports no element past the edge); the large letter's `200px minmax(0, 1fr)` grid is the suspect — to be traced at the build |
| W3 | Dashboard · the four answer cards | `flex: 1 1 260px; min-width: 240px`, plus padding |
| W4 | Checklist · item rows | a flex row that does not wrap |
| W5 | Social Security · the claim-age slider rows | `justify-content: flex-end` with fixed spans |
| W6 | My Data · *"Embedded gain"* box; *"Roth share"* | `width: 220px` |
| W7 | Ranking · net-worth card; the two monthly figures | `min-width: 200px`; spans that will not break |
| W8 | Trajectory · chart legend | a flex row that does not wrap |
| W9 | Roth · the ACA regime toggle | `inline-flex` buttons (*"ENHANCED EXTENDED (8.5% cap)"*) |
| W10 | Ask AI · the question box | `flex: 1 1 220px; min-width: 180px` in a padded row |

**0.5 · F-33 is the same work.** F-33 (v6.41) records, at UI SIZE 100%: Monte Carlo 3 pairs at 320 px, 1 at 340; Grade 348 px and Verify 358
px wide. Those are N1 and W1–W2 above at 320–340 px of room. Any floor at or below 320 px (DH-1 (a)–(c)) closes F-33.

**0.6 · Measured and not affected.**
- **The data-load screen** (zoomed too, no phone rules but `.dc-tap44`): 0 pairs and no sideways scroll at 320, 360, 390 and 600 px, each at
  100 / 115 / 130 / 150%.
- **The Field Manual** is an iframe; its own `@media (max-width: 760px)` already reads the room the iframe has, which is the layout width.
- **The Monte Carlo chart** sizes itself from `clientWidth` (L7695), the layout width, already.

**0.7 · Who it reaches.** Anyone who sets UI SIZE above 100%: on a phone (every phone, from 115%), and in a desktop window up to 800 px wide
at 150% (700 at 130%, 600 at 115%). And anyone on a phone narrower than 360 px.

## 1 · Census (parser, this session)

**The app source** (`s642/wcensus.cjs`, acorn + acorn-jsx: every member read of `innerWidth`, `outerWidth`, `matchMedia`, `clientWidth`,
`visualViewport`, `devicePixelRatio`; every string or template literal holding `@media` or a `zoom:` declaration; every `zoom` property):
- `zoom` — two: L8064 (the app root) and L15536 (the data-load wrapper).
- `@media` — three: `(max-width: 599px)` and `(max-width: 699px)` in the app stylesheet (one template literal at L8065); `(max-width: 760px)`
  inside `DOCS_HTML` (the Field Manual iframe, §0.6).
- Window readers — none. One `clientWidth` (the Monte Carlo chart, §0.6).
- `src/index.html` holds one more: `@media (max-width: 599px) { #dc-dg-accept, .dc-tap44 { min-height: 44px; } }` (the disclaimer's button and
  the 44 px targets; DH-3).

**The phone rules** p1 moves from the window to the layout width (all of the 599 px block, and the 699 px rule):
`.dc-phone-only`, `.dc-tabgrid`, `.dc-plansum:not(.open)` (v5.81); `.dc-stack-phone`, `.dc-two-phone`, `.dc-streamrow` and its three child
rules (v6.38); `.dc-cards-phone` (v6.40); `.dc-wrap-phone`, `.dc-export-phone`, `.dc-export-phone > input` (v6.41); `.dc-cards-sub700` (v6.41,
the 699 px rule). Outside both, unchanged: `.dc-phone-only { display: none }`, `.dc-streamrow { flex-wrap: wrap }`, `.dc-scrollx` and its
floor.

**The sites §0.4 lists** — N1–N12, W1–W10 — each gets a line number and its template from the AST walk at the build (as F-30's §1 did),
before any edit.

**Suites that read what this changes** (string and template literals in `qa/`: acorn for `.mjs`, Python's `ast` for `.py`):
- **Read the 599 px block or the 699 px rule by its text, so must be re-gated for v6.42:** `t102` (L74, L78: the Income rules' block),
  `t104` (L123, L127: A-0, A-1), `t105` (L123–L139: A-0, A-1, A-1b). Each keeps its check on earlier legs.
- **Pin the zoom by its text:** `t30` D-1 (`zoom:\s*\(uiScale \|\| 100\) \/ 100`). The fix keeps that declaration as it is.
- **Read phone behaviour in a browser, which must still pass:** `t45` (S-8–S-10, including UI SIZE 130% on a phone), `t47` (`.dc-phone-only`),
  `t48` (the phone summary's button), `domdiff_withdrawal` (skips `.dc-phone-only`).
- **Historic controls** (`controls_v579`, `v581`, `v582`, `v638`, `v640`, `v641`) mutate the 599 px block's text; they ran against their own
  builds and are not re-run.
- **Missed by this census, found by the first full packaged run:** `t62` A-3 (a fact for §13's Trajectory-chart sentence: no `"resize"` literal in
  the source). The census searched for the media queries, the phone classes and UI SIZE, not for `resize`. Re-gated at the build (§9).

## 2 · Register sweep (§K2) — by mechanism

Searched `UsabilityFlaws.md`, `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `FlawsToFix-v5_73-Phase2.md` and `METHODOLOGY.md` for `zoom`,
UI SIZE, `max-width`, *phone*, *narrow*, *overprint*:
- **F-32** — this item. Its candidate fix (*"a class set from the window width and UI SIZE together"*) is §3.1.
- **F-33** — closes with DH-1 (a)–(c) (§0.5).
- **F-10** (FIXED v5.39) — documented UI SIZE; nothing to change.
- **F-30** (FIXED v6.41) — its build review's note (four two-column Social Security grids cramped at 360 px) is a candidate for §3.2's narrow
  rules; measured again at the build.
- Nothing in MissingFeatures, ARCHITECTUREIssues, FlawsToFix or METHODOLOGY touches this mechanism.

## 3 · The fix — prototyped (§3.1) and planned (§3.2)

**3.1 · The layout follows the layout width (p1, measured).**
- A small function computes the layout width from `window.innerWidth` and UI SIZE, and gives the app's zoomed root a class: **`dc-narrow`**
  below 600 px of room, **`dc-sub700w`** below 700. A `resize` listener (which also fires on rotation) and a change of UI SIZE recompute it.
- Every rule of the 599 px block is rewritten as `.dc-narrow <selector>`, and the 699 px rule as `.dc-sub700w .dc-cards-sub700`. Nothing
  else in the stylesheet moves.
- At desktop widths the root carries no `class` attribute at all (not an empty one), so the rendered DOM the DOM suites compare is unchanged.
- **Measured on p1:** at UI SIZE 100%, every text box on all 26 tabs identical to v6.41's at 390, 599, 600, 699, 700 and 1024 px (156 of 156
  tab-widths; the footer's version string excluded) — so the class switches exactly where the media queries did. With UI SIZE above 100%,
  windows 600 px and wider: 0 pairs everywhere measured (§0.2).
- **Disclosed:** under the *browser's* own zoom (Ctrl +), the window's width is fractional; the class compares that fraction where the media
  query compared whole pixels, so at the boundary the switch may land up to a pixel apart. The first paint before React mounts is unchanged
  (the data-load screen; §0.6).
- Considered and not taken: CSS container queries (they need `container-type` on an ancestor, which changes how that box sizes; and how a
  zoom meets a container query is not settled across browsers).

**3.2 · The narrow layout (under DH-1).** A second class, **`dc-xs`**, below 360 px of room. Every new rule lives under `.dc-xs`, so a phone
360 px or wider at UI SIZE 100% keeps v6.41's layout box for box (checked at the build at 360, 375, 390, 430 and 599 px). The plan per site:
- **Overprinting grids (N2–N12):** two to a row or one above another under `.dc-xs` (classes like v6.38's, scoped to `.dc-xs`).
- **The two tables (N1, W1's table) — DH-2:** inside a scroll box (`dc-scrollx`) with a floor that fits them, as the app's other wide tables
  have scrolled since v5.79. The floor is chosen at or below each table's width at 360 px, so nothing at 360 px and up moves.
- **Page-wideners (W1–W10):** unbreakable strings may break (`overflow-wrap: anywhere`); fixed widths and minimums lifted under `.dc-xs`;
  flex rows wrap under `.dc-xs`. W2 (Grade) is traced first.
- **Below the floor** (DH-1 (a): under 240 px of room — a 320 px phone at 150%): not designed for; the page may scroll sideways, and §13 says
  so.

**3.3 · The 44 px targets stay on the window's width (DH-3).** `.dc-tap44` makes five controls 44 px tall below a 600 px window, for a
finger. A zoom already makes them larger on screen (44 px at 150% is 66 px), and a zoomed desktop window is not touched with a finger, so the
rule keeps reading the window. It lives in `src/index.html` (the data-load screen has no app stylesheet) and does not change.

**3.4 · Field Manual §13.** A v6.42 note; the *"Designed for a desktop browser"* item's UI SIZE sentence rewritten (the phone layout now follows
UI SIZE; what is supported; what remains below the floor); F-33's clause removed under DH-1 (a)–(c). The four version sites read v6.42.

## 4 · Tests

- **New suite `t106_ui_size_layout.mjs`, both legs** (the v6.41 leg pins each defect as `[KNOWN DEFECT 2026-11-02, F-32 — flips at v6.42]`):
  - **§A, the source (AST):** the layout-width function and hook exist, read `innerWidth` and `uiScale`, and set the class on the zoomed root;
    the thresholds are 600, 700 and the DH-1 floor; **extinction:** no `@media (max-width: 599px)` or `(max-width: 699px)` in the app stylesheet,
    and every rule that was in the 599 px block exists once under `.dc-narrow`; every new rule sits only under `.dc-xs`; each site N1–N12,
    W1–W10 carries its class or its box.
  - **§B, the class (jsdom):** set `innerWidth` and UI SIZE, render, read the root's class — at 100% the switch at 599 / 600 and 699 / 700; at
    150% at 899 / 900 and 1049 / 1050; the floor; a `resize` updates it; desktop roots carry no `class` attribute.
  - **§C, the Field Manual:** the v6.42 note and the rewritten sentence.
- **`t45` gains S-11 (Chromium, seeded):** all 26 tabs at 0 pairs (but the Grade false positive) and no sideways scroll at UI SIZE 115 / 130 /
  150% on 360, 390 and 430 px phones and in 600 and 700 px windows; at 100% in 320 and 340 px windows (F-33); the tab menu, not the grid, at
  150% in a 600 px window; box-for-box at 100% is not a suite check (it is done at the build, §3.1–3.2).
- **Re-gated for v≥642:** `t102`, `t104`, `t105` read the phone rules from the `.dc-narrow` rules instead of the 599 px block (their checks
  unchanged otherwise).
- **Registered:** `v642` by the AST registration; by hand `t33` PINS, `t93`'s Engine D reference, `t103`'s prior-leg map, `t45`/`t47`/`t48`.
- **Controls:** `qa/tools/controls_v642_ui_size.py` — at least: the class dropped from the root; a rule left in a 599 px block; the threshold
  off by UI SIZE (window width used); the `resize` listener removed; one N or W site's class removed; the §13 note removed.

## 5 · Filed or closed by this scope

- **F-32 → FIXED** at v6.42, down to the DH-1 floor.
- **F-33 → FIXED** under DH-1 (a)–(c).
- Nothing new filed yet; anything the build finds below the floor is recorded on F-32's row, not filed separately.

## 6 · Out of scope

Real-device testing (Chromium's mobile emulation only, as every phone release); the browser's own zoom beyond §3.1's boundary note; layout
widths below the DH-1 floor; the Field Manual's layout (§0.6); any change to what UI SIZE offers (100 / 115 / 130 / 150%) unless DH-1 (d) is
chosen; the 2027 tax figures (DH-4).

## 7 · Decisions — Steve's, 2026-11-02: all four as recommended (DH-1 (a), DH-2 (a), DH-3 (a), DH-4 (a))

| # | Question | Options | Recommended |
|---|---|---|---|
| **DH-1** | The narrowest room the layout must handle | (a) **240 px** — every phone 360 px or wider at every UI SIZE, and F-33 · (b) 260 px — a 390 px phone at 150%, a 360 px phone up to 130% · (c) 300 px — phones at up to 130%; 150% on a phone stays disclosed · (d) cap UI SIZE on narrow screens so the room never drops below 360 px — fewest changes, but UI SIZE then does almost nothing on a phone | **(a)**: the sites are the same at 240 and 260 (§0.4), so the extra cost is small, and it is the only option that covers every common phone at every size |
| **DH-2** | The two big tables in little room (Monte Carlo's percentile table, Verify's constants table) | (a) scroll sideways inside their own box, as the app's other wide tables do · (b) reflow into fewer columns | **(a)**: a table that keeps its columns reads the same at every size |
| **DH-3** | The 44 px tap targets | (a) keep them on the window's width (finger size; a zoom already enlarges them) · (b) move them with the layout | **(a)** |
| **DH-4** | Release order | (a) F-32 is v6.42; the 2027 tax figures become v6.43 (the IRS's 2027 figures appeared not yet published as of late October; the 15 December deadline stands) · (b) the tax figures first | **(a)**, with the tax release taking priority the moment the figures are out |

## 8 · The independent build review (2026-11-02) — what it found, and what changed

An agent given the code, both built pages, this scope and the tests — not the build's account — reproduced the candidate source from
`s642/edit.py` and its page from a clean build, then measured. Five should-fix findings and three nits; none was a blocker.

| # | Finding | Severity | Disposition |
|---|---|---|---|
| R1 | The three tables' 300 px floors (§3.2's plan: "at or below each table's width at 360 px") were wider than their boxes: about 285 px at 357–359 px of room. On a 412 px phone at 115% (the most common Android width), all three scrolled where v6.41 showed them in full, and the percentile table hid most of its 90th-percentile column. The overlap detector clips text to its box, so it cannot see this (v6.41's one-time list had the same blind spot) | should-fix | The percentile table's cells give up 4 px a side under `.dc-xs` (`dc-tight-xs`) and its floor is 280 px (no cell overflows from 280; measured 200–310 in 10 px steps); the IRMAA tiers 240 px; the Verify tables need no floor — their text may break (`dc-break-xs` on the table), so they fit at every room down to 240 px and never scroll. At 412 px / 115% none of the three scrolls; `t45` S-11 checks it, and the controls K13, K19 and P4 plant the old floors |
| R2 | Two controls named checks that could not fire: K10 (B-3 read only 360 px) and K14 (it replaced only the note's heading) | should-fix | B-3 also reads 350 px at 100%; K10 expects B-1, B-3 and C-4; K14 removes the whole note |
| R3 | `t106` A-8 counted classes rather than pinning sites, and the extinction check its comment promised was not written: the reviewer moved `dc-two-xs` from the Survivor cards to a Taxes grid and `t106` stayed green | should-fix | A-8 finds each of the 42 sites by an anchor inside it (a label, a handler, or its exact opening tag), and no element carries an `-xs` class unpinned. The comment now says why there is no source-level extinction check (which grids overprint below 360 px depends on their text; `t45` S-11 measures it). Control K20 plants the reviewer's move |
| R4 | `t106` §E failed once under load: it read the Monte Carlo tab while the mortgage what-if was still "Recalculating both scenarios…" | should-fix | The dump waits until nothing is re-running and two reads agree. The same timing showed the build that panel's **results grid** had never been measured: it renders after the tab opens, after the build's sweeps had read the tab, and overprinted at 240 px of room. It stacks under `.dc-xs` now (N18), and the probes and `t45` wait for it |
| R5 | `t45` S-11 ran 6 cases where §4 promised about 17 | should-fix | S-11 now runs all 26 tabs at 360/150, 390/130, 320/130 (the Field Manual's other bound), 412/115 and 430/115 (374 px of room: the phone layout without `dc-xs`), 320/100 and 600/150, and six tabs on the stream plan; the rest of §4's list (115–150% on each phone, 700 px windows, 340/100) was measured at the build (§9), not by the suite — one `t45` run is already about 20 minutes |
| R6 | `window.innerWidth` is not the media query's width on a phone whose page already scrolls sideways (327 against 320 at 320 px / 150%), so there the class can flip on the next resize | nit | Disclosed (CHANGELOG): inside the supported range no page scrolls sideways. `matchMedia` with thresholds scaled by UI SIZE would give exact parity; not taken in this release |
| R7 | The class was set in `useEffect`, after paint, so for one frame a new UI SIZE showed with the old layout | nit | `useLayoutEffect` |
| R8 | The release documents were not yet written | nit | Written after the packaged run |

The review found clean: every change in the diff accounted for by `edit.py`; the phone block mapped one to one onto `.dc-narrow`; the rise in
specificity (one class to two) changing no winner; nothing under `.dc-xs` reaching 360 px of room; `src/index.html` and `main.jsx` unchanged;
`t106`, `t102`, `t104` and `t105` on both legs; box-for-box at 100% at 393 and 650 px on six tabs; all 26 tabs at 320/130, 390/150, 360/150 on
the x5 plan, 412/130 on a single plan, 360/115 on the stream plan, 900/150 and 850/150; pinch zoom leaving the class alone; §13's text.

**One deviation from DH-2's wording, owned.** DH-2 (a) was *"scroll in its own box"* for the Monte Carlo and Verify tables. The percentile
table and the IRMAA tiers do. The Verify check tables keep their columns too, but fit by letting a long citation break mid-word instead of
scrolling 36–155 px: with their scroll box they hid part of the citation column on every narrow phone, including the 412 px / 115% case the
review found. Their scroll box stays as the fallback. Told to Steve with the release.

## 9 · Build record (v6.42, 2026-11-02)

**9.1 · What shipped.** Source `940e1f02e59e9acb631957464ce643b3`, built `index.html` `7c817209095ce6db7f065c815761b38e` (vite 5.4.21, the `npm ci`
toolchain; built twice, byte-identical; the review rebuilt its own candidate's page byte-identically on another `node_modules` tree). Made by
`s642/edit.py` (session scratch) from the v6.41 source: it asserts the v6.41 md5, then every edit asserts its old text once on its v6.41 line;
the three table floors are its arguments (280 / 0 / 240 px). Its code is p1's mechanism (§3.1), the `dc-xs` tier and its 42 sites (§3.2,
§9.2), the JSX notes, the four version sites and §13. Candidates the review or the sweeps read and that never shipped: `f3058745…` (the
review's), and the builds between.

**9.2 · Sites beyond §0.4's list, each found by measurement and pinned in `t106` A-8.** N13 the IRMAA tier table (360 px / 150%: *"Standard"*
over *"$0"*); N14–N16 three two-column Social Security grids (F-30's review note; the page 2 px too wide at 360 / 150%); N17 My Data's two
asset-class card rows (the x5 plan at 360 / 150%); N18 the Monte Carlo mortgage what-if's results (§8 R4); W11 the Social Security trust-fund
buttons (360 / 150%); W4 the Checklist's text column and inputs (one more element than planned). Grade (W2) was the letter's
`200px minmax(0, 1fr)` grid, as suspected: it stacks.

**9.3 · Measured on the final build** (`f32/probe.py`, `t45` §S's detector, seeded; the Monte Carlo tab read once nothing is recalculating).
- All 26 tabs, 0 pairs but the Grade false positive and no sideways scroll, 286 tab-cases: 360 and 390 px at 150%; 412 and 393 at 115%; 320 at
  130%; 340 at 100%; 600 and 700 px windows at 150%; 360 / 150% on the x5, single and stream plans.
- The build's earlier sweep of the same code but the last four fixes (494 tab-cases: 360 / 390 / 430 at 115–150%, 320 at 100–130%, 340 at
  100%, 600 / 700 at 150%, four plans) found only the x5 plan's asset-class cards (fixed, N17) and missed N18 (§8 R4).
- At UI SIZE 100%: every text box on all 26 tabs identical to v6.41's at 360, 375, 390, 430, 599, 600, 699, 700, 1024 and 1440 px (260 of 260
  tab-widths; the footer's version excluded).
- The three DH-2 boxes at 240–359 px of room and on 412 / 393 / 375 px phones at 115%: no box scrolls from about 354 px of room up; none of
  the 13 Verify tables scrolls at any room.
- The measured page is `12805b65…`; the shipped page differs from it only in §13's text (one clause of the v6.42 note; `diff` of the two
  sources: line 5306, `DOCS_HTML`, alone), so these hold for it.
- The data-load screen: 0 pairs and no sideways scroll at 320 / 360 / 390 / 600 px at every UI SIZE (it carries no phone rules).

**9.4 · The first packaged runs.** The first was stopped when `t45` reported DIED (rc=124): with S-11 it runs about 25 minutes, past
`runsuite.sh`'s 900 s for every suite; `t45` alone now gets 3,600 s, and alone it passed 446 of 446 in 24 min 44 s. The second, on a re-cut
package, finished **11,462 passed, 1 failed**: `t62` A-3 (§1's census had missed it — a fact for §13's Trajectory sentence, *no "resize"
literal in the source*); re-gated to leave out `useLayoutWidthClass`'s literals and to check that the chart's effect does not depend on the
layout class. The third run, below, is on the package as shipped.

**9.5 · The suite, from the packaged copies** (a run folder built by `mk_runfolder.sh v641 v642` from a clone of `ad722dc` carrying the
package's `github/` files as cut): **11,343 app checks across 104 app suites, 0 failed, 0 DIED** — 6,240 current-leg, 4,622 prior-leg (v6.41),
234 and 237 in the two attribution runs, MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; GRAND 11,463. `t106` 36 (8 on the
v6.41 leg); `t45` 446 (225 at v6.41); `t105` 36 (its §B skips after v6.41's run, as designed). `smoke_built` 22 of 22 on the packaged page.

**9.6 · Controls.** `qa/tools/controls_v642_ui_size.py` on a whole copy of the run folder: C0 silent; K1–K20 each turning their named `t106`
checks red; P2–P4 turning `t45` S-11 red; every file restored and hash-checked. The first P1 (the root's class prop removed) made `t45` die in
S-9 — every phone loses its tab menu, and a click times out on a tab bar a phone no longer shows — so S-11 never ran and the control counted as
missed (24 of 25). It was replaced by a defect only S-11 can see (the built page's layout width ignoring UI SIZE) and run alone on the same
copy: it fires (50 checks red, S-11 and S-10). **25 of 25 as expected.** The control script changed after the suite run; no suite runs it.
