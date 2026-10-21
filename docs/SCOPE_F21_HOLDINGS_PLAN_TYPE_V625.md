# SCOPE — v6.25 · F-21: the holdings table's plan type gets its own column

**FULFILLED at v6.25 (2026-10-21; build record §6). DECIDED 2026-10-21 — DC-1 (a) *"Own column"*.** A presentation release: no figure, engine or stored field changes, so METHODOLOGY
does not change. Built against **v6.24** (source `2ff32ac0792535e62510afe3d881b5fb`, repo `64d3126`). Repo-only (`docs/`).

Steve, 2026-10-21, with a screenshot of My Data: *"under the My data tab in the retirement, the fields don't line up (or it confusing what
ticker the tax type belongs to. They don't line up"*.

## 0 · Premise (verified at v6.24)

My Data's **Retirement holdings** table (`MyDataEditor`, the `rows.map` under *RETIREMENT HOLDINGS (401k / IRA)*) has eleven columns and one
control per cell — except the **Tax type** cell, which holds two dropdowns stacked: the tax type and, under it for any row holding
Traditional dollars, the **plan type** (added at v5.91, D-12 phase 1; `aria-label="Plan type of the Traditional dollars"`). Every other cell's
single control sits centred in the double-height row, and rows have no divider, so:
- the spacing between the two dropdowns of one row is about the spacing between rows (Steve's screenshot, top to top in screenshot pixels:
  53 within a pair, 56 between pairs; in Chromium at 1440 px, 32 and 34 CSS px), so the lower dropdown reads as belonging to the next ticker;
- the plan-type dropdown has no column header — nothing on screen names it;
- a Roth row has one dropdown, so its row is shorter than its neighbours'.

**A sibling in the same table, found measuring it in Chromium (v6.24 built page, 1440 px).** The footer's *Total annual fees →* label
spans **9** columns, but only **8** stand before *$/yr fee*. So the fee total ($652 on the example) sat under *Contrib split %*, the
contribution total (100 % ✓) under the delete column, and a fourth footer cell ran past the last header (to x = 1403 against a table whose
header ended at 1097). It has been so since the footer was written; it is the same complaint — things in this table do not line up.

## 1 · What changes

- **A *Plan type* column** after *Tax type*, headed, carrying `PLAN_TYPE_HELP` as its title. Its cell holds the plan-type dropdown for a row
  with Traditional dollars, and a dash (title: *"A Roth holding has no Traditional dollars, so no plan type"*) for a Roth row. The dropdown
  keeps its `aria-label`, options, value and handler — only its cell moves.
- **The Tax type cell holds one dropdown.**
- **A thin divider** under each row (`1px solid var(--line)`), as the preview Steve chose showed.
- The table's minimum width grows by the new column's 120 px (880 → 1000); the table already scrolls inside its own box on a narrow screen.
- **The footer's span stays 9**, which with the new column is the nine columns before *$/yr fee*: each total now sits under its own
  column. Taken as part of DC-1 — it is the same complaint, in the same table, and one number.
- The four version sites read v6.25. Field Manual §13 gains one sentence.

## 2 · Census (parser, v6.24)

- **App:** the plan-type dropdown is rendered at one site in this table (L13922) and one in the Other-accounts card (L14051, a per-account
  grid row in which it spans the full row — not ambiguous, out of scope). No Field Manual, note or help text says where the dropdown sits
  (`PLAN_TYPE_HELP`, `PLAN_TYPE_NOTE` and the Field Manual's two plan-type passages describe what it is, not where).
- **Suite:** every suite that touches a holdings dropdown finds it by its options (`t56` `planSels`: a select offering `employer`) or its
  label, never by position; nothing reads the holdings table by cell index. Expected to move: nothing. The full run is the check.

## 3 · Tests

New suite **`t88_holdings_columns.mjs`**, both legs, on the example, with one of its rows switched to Roth in the editor:
- every body row has as many cells as the header has columns;
- no cell holds more than one control (`select`, `input`), and the plan-type dropdown sits in the column headed *Plan type*;
- a Roth row's *Plan type* cell holds no dropdown and shows a dash; switched back to Traditional, the dropdown returns in its column with
  the plan type it had (added at the build's review);
- choosing a plan type in the new column and pressing Save & Apply stores it (the handler moved with the cell);
- the footer: its label spans exactly the columns before *$/yr fee*, and its row has as many columns as the header (the sibling);
- the Field Manual sentence.
The v6.24 leg pins the stacked cell as a dated `[KNOWN DEFECT]`. **Chromium on the built page** (session evidence, before and after, at 1440 px): every
holdings row the same height. Controls: the dropdown put back under the tax type, the header removed, the footer span back off by one.

## 4 · Out of scope

The Other-accounts card (above); column widths other than the new one; the phone layout beyond the table's existing scroll (`t45`, `t48` run).

## 5 · Decisions

**DC-1 · How to separate the two dropdowns.** (a) **Recommended, chosen.** Plan type in its own column. (b) Keep them stacked; add dividers,
tighten the pair and top-align the row.

## 6 · Build record

Built as **v6.25**: source `d7df32a9a3091fc550eb1a56646c4270`, built `index.html` `a5d234feb1be2a58c584a72e14acd348` (vite 5.4.21,
`npm ci`; v6.24 rebuilt byte-identically to `8663f198…`), `smoke_built` 22/22.

**Chromium, the built page, 1440 px, the example's five holdings** (session evidence; jsdom does no layout):

| | v6.24 | v6.25 |
|---|---|---|
| header columns | 11 | 12 |
| cells per row | 11 | 12 |
| controls in the Tax type cell | 2 on every row | 1 |
| row heights | 66–67 px | 35–36 px |
| footer columns (colSpans summed) | 12 | 12 |
| fee total ($652) under | *Contrib split %* (973–1059) | *$/yr fee* (1159–1260) |
| contribution total (100 % ✓) under | the delete column | *Contrib split %* |
| last footer cell ends at | x = 1403, header ends at 1097 | x = 1403, header ends at 1403 |

At 390 px the page still does not scroll sideways; the table scrolls inside its own box (`t45` green on the v6.25 page).

**Tests.** `t88`: 19 on v6.25, 15 on the v6.24 leg (`A-1`, `A-3`, `A-6`, `A-7` pinned as `[KNOWN DEFECT 2026-10-21, F-21]`). The full
suite is green with no other count moved; the release's CHANGELOG entry carries the totals. Controls
(`qa/tools/controls_v625_columns.py`, repo-only): the dropdown back under the tax type, the header removed, the footer one column too wide,
no divider, the Roth cell empty, the handler dropped, the Field Manual sentence removed, and the unmutated run — 8 of 8 as expected.

## 7 · Review

The build was reviewed by an agent that had not seen it: no blocker, three should-fix, three notes — all taken.
- This scope said the v6.24 table had twelve columns; it had eleven (twelve from v6.25).
- `t88`'s header pointed to this section before it was written.
- Nothing tested a Roth row made Traditional again: `B-00`/`B-2b` now do, and control C6 fires `B-2b`.
- The v6.24 leg did not pin the footer's extra column: `A-7` now does.
- §3 said "a plan with a Roth row"; the Roth row is made in the editor. Reworded.
- §0's 53/56 were top-to-top distances in screenshot pixels, not gaps. Reworded, with the CSS figures.

The review confirmed by parser and in Chromium: the cell counts on both builds and both branches; each total's column; that the dropdown's
value, label, title, options and handler are unchanged; that nothing else in the app or the Field Manual says where the dropdown sits; the
four version sites; and that every other `qa/` change is version registration (288 hunks across 73 files).

