# SCOPE — a phone's first screen shows the plan, not just the chrome (F-12: the tab menu and a collapsible plan summary)

**FULFILLED — shipped in v5.81.** Design direction A + B; D-1 to D-4 all as recommended (§6). See §8. Retained as the record. Target **v5.81**, built from **v5.80** (source `7a04dadb86bdef6534bdc03a1d87e8d8`, built `index.html`
`a7394fad7c58dfccc2ddce86ac6dd0c9`, repo `6425a53`). A presentation release: no engine changes; parity pinned; METHODOLOGY
unchanged. **Carries the dated line recording Steve's 2026-09-28 decision that the 24 release-pinned control scripts stay out
of the pool (repo copies kept)**, closing the "Steve's call" wording in the second ops entry of 2026-09-28.

---

## 1 · Premise — measured on the live v5.80 build

Real Chromium, 390×844 (mobile, touch), disclaimer gate dismissed the way that releases its scroll lock (asserted), example
data loaded:

| Block | y | Height |
|---|---|---|
| Header (title, portfolio value, date) | 0–216 | 216 |
| Retirement-date cards | 216–429 | 213 |
| Allocation strip | 429–511 | 82 |
| "Example data mode" banner (example data only) | 521–697 | 176 |
| **Tab grid, 26 tabs** | 697–919 | **222** |
| Notice line | 929–1005 | 76 |
| **Selected tab's content begins** | **1005** | — |

The content begins **below the first screen** (844) — worse than the audit's v5.73 figure, because v5.79's fix lets the
retirement cards wrap. With a user's own data (no banner) it begins near 829, at the bottom edge.

## 2 · The change (phones only — desktop and tablet unchanged, verified element by element as at v5.79)

- **A · The tab grid becomes one "current tab ▾" menu** below the breakpoint (D-1): every tab Simple Mode currently shows,
  the active one selected. About 180 px saved.
- **B · The retirement cards and allocation strip go behind a "Plan summary ▸" toggle**, collapsed by default, whose closed
  line still shows the selected retirement date and its success rate (D-3). About 250 px saved.
- **Expected:** content begins near **y ≈ 380** with a user's own data (≈ 560 in example mode, whose banner stays).
- **Mechanism:** the app's first real breakpoint (the audit's F-1: `@media` appears only inside the Field Manual). Phone-only
  elements are rendered with a class the global style block shows only below the breakpoint, and hidden elements have no box
  — so desktop and tablet layouts are identical by construction, and verified by the element-by-element signature anyway.

## 3 · Site census (v5.80)

| Site | What | Note |
|---|---|---|
| L6709–6722 | the tab grid: an **inline** list of tab ids, an inline label map, a Simple Mode filter, and the click handler | **the click handler guards unsaved My Data edits** (`MYDATA_DIRTY` → `setLeaveTarget`) |
| L6590–6620 | the retirement-date cards (`rbtn`) | the selected card's date and success rate feed B's closed line |
| L6624–6640 | the allocation strip | |
| L6551 | the global style block (`.tab`, `.dc-scrollx`) | where the breakpoint rules go |

**Both findings shape the design.** The phone menu must go through the **same guarded handler**, or it becomes a way to lose
unsaved My Data edits; and the tab list, labels and Simple Mode filter must be **one shared list** read by the grid and the menu
— a second copy is the duplicated-rule pattern that let C-4 survive (v5.77).

## 4 · Tests — `t47_phone_first_screen.py` (Chromium, built page, like `t45`)

- At 390×844: the tab grid has no box; the menu exists, lists exactly the tabs Simple Mode shows (both modes), and choosing a
  tab switches to it; the summary starts collapsed with the date and success rate visible; opening it shows the cards; the
  selected tab's content begins **above y = 450** with the user's own data (measured, then pinned).
- **The guard:** with unsaved My Data edits, choosing another tab from the menu raises the same leave prompt as the grid.
- At 820 and 1440: no phone-only element has a box; the tab grid and cards are visible; `t45`'s no-sideways-scroll checks hold.
- **Structural (source):** one tab list and one label map, read by both controls; one tab-selection function.
- The element-by-element desktop/tablet signature against v5.80 is run at the build and recorded (as at v5.79).
- **Negative controls:** menu bypasses the guard; menu keeps its own tab list (Simple Mode desync); breakpoint rule removed
  (phone reverts to the grid); the summary starts open.

## 5 · Folded in

The dated decision line (header). The OPERATIONS note that `vercensus.cjs` cannot see `.py` suites (registration by hand).

## 6 · Open decisions for Steve

**D-1 · Where "phone" begins.** (a) **Below 600 px wide** — every phone in portrait; tablets (≥ 768) and desktops unaffected;
or (b) below 820 px, which would also catch small tablets. **Recommend (a).**

**D-2 · The menu's form.** (a) **The browser's own drop-down (`<select>`)** — the phone's native picker, accessible, no new
code to maintain; or (b) a custom button that opens a styled list. **Recommend (a):** it is what a phone does best.

**D-3 · The summary's closed line.** (a) **Shows the selected retirement date and its success rate** ("Plan: retire Jan 2029
· 99.8% ▸"), so the headline stays visible; or (b) just "Plan summary ▸". **Recommend (a).**

**D-4 · Does the summary remember being opened?** (a) **No — collapsed on every visit**, simplest; or (b) remembered per
browser like the scenario preset. **Recommend (a):** the point is a clean first screen; one tap opens it.

## 7 · Out of scope

Compacting the header (option C); the example-data banner; F-3/F-4 (text size, touch targets); C-13; the manifest history.

## 8 · Build record (v5.81)

- **Result, measured on the built page at 390×844:** the selected tab's content begins at **y = 613** in example mode (v5.80:
  1005), about 437 without the example banner; the summary line reads "PLAN: RETIRE JAN 1, 2029 · 99.8% ▸". Desktop and
  tablet: **0 of 52 tab-views changed** against v5.80, element by element; the only new box is the summary's wrapper.
- **Order:** the code was written before `t47`. This scope has no build-order section, but test-first is the order every recent
  scope spelled out and the project's practice; `t47` was then run against v5.80's page, where its v5.81 claims fail — it
  discriminates — but the order was wrong. (Reported at the time as "the scope's build order", which this scope does not have.)
- **`t47`'s first S-1 was a false positive:** it counted a prefix of the tab list, and `SIMPLE_TABS` begins with the same three
  tabs. It now compares the complete list taken from `TAB_IDS`' own definition; control M3 plants a complete second copy.
- **The CSS edit landed between a rule and its comment** (the v5.79 `select` note ended up after the new `@media` block); the
  AST literal census caught it through `domdiff`'s pair-gated regex. Restored, proven to move only comments.
- **`t45` clicked the hidden tab grid on a phone** and timed out: it now moves between tabs through the phone menu there.
- **`mk_runfolder.sh`'s third argument** was typed as an output folder twice in a day and refused as "prior source not found";
  a third argument not ending in `.jsx` is now the output folder (control F).

