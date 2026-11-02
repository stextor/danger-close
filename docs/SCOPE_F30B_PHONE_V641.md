# SCOPE — F-30 (second part) · My Data, Social Security, Expenses and Taxes on a phone; F-31; the Roth calendar's labels

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v6.41 (2026-10-31).** Review §8, build record §9. Decisions DG-1 to DG-9 (§7) were taken as this scope recommends, under Steve's standing instruction for this release (2026-10-31: *"Let's do F-30 part two now. for any decisions, use your recommendations"*). None was put to him one by one. |
| Build scoped against | **v6.40** · source `src/DangerClose.jsx` md5 `99f7f8f150bcd8db89a282fe2e2dfe63` · built `index.html` `53d30398041e26cd9ba6d84a8073651d` · repo `efcac38` |
| Freshness | Pool source `DangerClose-v6_40.jsx` = manifest = newest CHANGELOG entry; all 16 pool documents equal the clone at `efcac38` (2026-10-31, this session). `package_check` 54/0 post-upload (four arguments); §F clone diff clean; the live site serves `53d30398…`. |
| Kind | A **presentation** release: layout on narrow screens on five tabs (plus one grid each on Withdrawal and Monte Carlo, §0.5), the Expenses tab's category column at every width, and the Field Manual. No engine, table, stored field or word on any tab changes; no figure moves. |
| Register | Fixes the rest of **UsabilityFlaws F-30** (My Data, Social Security, Expenses, Taxes; and two grids F-30 did not list, found at 360 px, §0.5), **F-31**, and the Roth calendar's *"CONVERT"* labels that v6.40 disclosed. **F-32** stays open and is widened by this scope's census (§5). |
| Version | **v6.41**; the 2027 tax figures become **v6.42** (DG-8). |

---

## 0 · Premise — measured in Chromium on the built v6.40 page, not read

Every figure here comes from scratch probes run this session (`f30c/probe.py`, `boxes2.py`, `erow.py`, `wide.py`, `wiz.py`, and
`f30b/convert.py` for the calendar's labels; they assert nothing) against the shipped v6.40 page (`w640/index.html`, `53d30398…`) and against
prototypes of the fix built from the v6.40 source by `f30c/edit_proto.py` (the last, **p4**: scratch, never shipped). The probes use **`t45`
§S's own detector**, read from `qa/t45_phone_layout.py` at run time — `PAGE_OVERLAP`, which leaves out the page header's box (v6.40's build
review): pairs of visible text boxes from different elements overlapping by more than 3 px each way, each box clipped to every scrolling box
around it. `Math.random` is seeded before load, so both pages draw the same Monte Carlo. Plans: the example as it opens;
`qa/tools/fixture/f20_streams_plan.json` (four income streams, one with a long label); that plan made single; that plan with no ACA
premium; that plan with every balance ×5. UI SIZE is set through its stored key (`ui_scale_v1`) before load.

**0.1 · F-30 as registered — reproduced.** At 390 px on the example: My Data **8**, Social Security **10**, Expenses **4**, Taxes **2** (v6.40's
§13 and register). The Grade tab's one pair is the known false positive (the large letter's glyph box, `200px minmax(0, 1fr)`).

**0.2 · Wider than registered: every phone width, and every UI SIZE above 100%.**

| Example, pairs (page width where wider than the window) | 360 | 390 | 430 | 480 | 540 | 599 | 600–1440 |
|---|---|---|---|---|---|---|---|
| My Data | 12 (368 px) | 8 | 3 | 1 | 0 | 0 | 0 |
| Social Security | 19 | 10 | 8 | 0 | 0 | 0 | 0 |
| Expenses | 18 | 4 | 3 | 3 | 3 | 1 | **1 at every width** (§0.4) |
| Taxes | 4 | 2 | 0 | 0 | 0 | 0 | 0 |

| Example, UI SIZE, pairs (page width) | My Data | Social Security | Expenses | Taxes | Income |
|---|---|---|---|---|---|
| 115% at 390 | 14 (417) | 20 | 28 | 8 | 0 |
| 130% at 390 | 28 (473) | 34 | 31 (392) | 26 | 0 |
| 150% at 390 | 41 (544) | 36 (432) | 48 (453) | 46 (407) | 0 |
| 130% at 600 | 2 | 0 | 4 | 0 | 7 |
| 150% at 600 | 8 | 10 | 4 | 2 | 27 |

**0.3 · Every site, one cause — the same as v6.40's.** Grouping each pair by the grid that lays it out (parser census, §1):

| Site | Where | Grid | Pairs at 360 / 390 | What prints over what |
|---|---|---|---|---|
| **M1** | My Data · household totals | `repeat(4, minmax(0, 1fr))` | 4 / 3 | *"1,647,000"* over its *"$"* |
| **M2** | My Data · asset-class cards (×2: retirement and other holdings) | four `minmax(0, 1fr)` | 4 / 4 | *"$150,000"* over *"Trad"* |
| **M3** | My Data · Social Security amount / claim age (per spouse) | `minmax(0, 1fr) 90px` | 2 / 0 | *"Monthly $ at claim age"* over *"Claim age"* |
| **M4** | My Data · paycheck row | `140px` + three `minmax(0, 1fr)` | 2 / 1 | *"Your contribution $"* over *"Employer match $"* |
| **M5** | My Data · the page 8 px too wide at 360 | the export row (`inline-flex`, an input that will not shrink) and two flex rows that do not wrap | — | the page scrolls sideways |
| **M6** | My Data · four more rows of three or four columns (birth dates, retirement year, the four-column row, the bonus row, spouse B's row) | `minmax(0, 1fr)` ×3–4 | 0 / 0 at 100%; 9 pairs at 130%, 9 at 150% (390 px) | the same squeeze when UI SIZE narrows the page |
| **S1** | Social Security · the claiming grids (F-8's) | `repeat(9, minmax(0, 1fr))` in an `overflowX: auto` box | 16 / 8 | *"$1,260"* over its *"$"*, age over age |
| **S2** | Social Security · survivor cards | `repeat(3, minmax(0, 1fr))` | 3 / 2 | *"$2,310"* over *"CLAIM FRA (67)"* |
| **S3** | Social Security · a second `repeat(3)` row | `repeat(3, minmax(0, 1fr))` | 0 / 0 at 100%; 1 pair at 130% and 150% (390 px) | *"Monthly income gain"* over *"Car Payment ends"* |
| **E1** | Expenses · *"drops off / changes"* delta | `repeat(4, minmax(0, 1fr))` | 10 / 4 | *"/mo"* over *"Retirement Life"* |
| **E2** | Expenses · one-time list | `110px minmax(0, 1fr) 80px 65px` (`erow`) | 8 / 0 (4 at 385) | *"Replacement car"* over *"$"* |
| **E3** | Expenses · the two monthly lists' category column | `85px minmax(0, 1fr) 70px` | 0 / 0 on a phone; **1 at every width 600–1440** | *"Transportation"*, wider than the 85 px column, under *"Car Payment"* (§0.4) |
| **T1** | Taxes · lifetime tiles | `repeat(6, minmax(0, 1fr))` | 3 / 2 | *"TOTAL LIFETIME TAX"* over *"FEDERAL INCOME"* |
| **T2** | Taxes · income by source | `repeat(3, minmax(0, 1fr))` | 1 / 0 | *"K"* over *"marginal bracket."* |

**The cause is v6.40's: v5.79 (F-11p, `5c2c2ac`)** rewrote each grid's `1fr` track as `minmax(0, 1fr)`, so the columns shrink below their
text. S1 sits in an `overflowX: auto` box already, but its child has no minimum width, so the box never scrolls (as R1 on the Roth tab did).
E3 is not v5.79's: a fixed 85 px column overflows whatever the next track is, and `git log -S` finds `85px 1fr 70px` in the initial commit.
v6.21's comment on the one-time list says its 110 px column is *"as on the monthly rows above"*; the monthly rows were never 110 px (v6.21 widened
only the one-time list). From v6.41 the comment is true.

**0.4 · The three items v6.40 disclosed instead of fixing.**
- **The Expenses label (E3), at every width.** One pair on the example at 600, 640, … 1440 px — every width measured from 600 up.
- **The Roth calendar's *"CONVERT"* labels** (v6.40 §9.2, recorded on F-30). With the web fonts loaded (`rev640/fonts.css`, the four
  families served locally — the sandbox cannot reach Google Fonts), at UI SIZE 100% on v6.40 every one of the 12 labels runs past its card at 600–680 px (by up to 10.4 px at 600, 1.5 at 680), and at 600 px ten run into the next card's label; at 690 px the overrun is 0.4 px, and from 700 px none. The box comparison cannot see this (the
  labels are text in one element per card), so `convert.py` measures the label's own text range against its card.
- **F-31 — the Income tab widens the page at 600–625 px** on a plan with a long income-stream label. Reproduced: the stream plan's Income tab
  is **626 px** wide at a 600 px window (the no-ACA and ×5 plans the same; the single plan not). v6.38's stream-row wrapping lives in the phone
  block, so at 600 px it stops.

**0.5 · Two grids F-30 did not list — found at 360 px by this scope's all-tab sweep.** F-30 was measured at 390 px. On v6.40 at 360 px:
- **Withdrawal (W1):** Section B's three priority cards (`repeat(3, minmax(0, 1fr))`, L10879) are about 90 px each, and the uppercase,
  letter-spaced *"ROTH CONVERSIONS AND TAX"* cannot break, so the page is **363 px** wide (the stream plan the same). 375 px and up: fits.
- **Monte Carlo (C1):** the LTC panel's four figures (`repeat(4, minmax(0, 1fr))`, L12635): **2 pairs** (*"Insurance covers"* over
  *"Remaining out-of-pocket"*). 375 px and up: 0.

Both are on v6.40 as shipped (measured), both reach every phone 360 px wide, and both are the same cause.

**0.6 · Who it reaches.** Everyone who opens My Data, Social Security, Expenses or Taxes on a phone held upright; on the Expenses tab, everyone
at every width (E3); on the Roth tab, windows 600–690 px wide (the labels); on the Income tab, plans with a long stream label at 600–625 px;
phones 360 px wide on Withdrawal and Monte Carlo; and anyone with UI SIZE above 100% on a phone.

## 1 · Site census (parser, this session)

An AST walk (`f30c/census.cjs`, acorn and acorn-jsx) of the renders — My Data (`function MyDataEditor`, L13866–L15330), Social Security
(`activeTab === "ss"`, four expressions: L9287, L9364, L9832, L9912), Expenses (L8745–L8937), Taxes (L11830–L12126) and Income (L8940–L9283) —
lists every `gridTemplateColumns`: **5 on Expenses, 3 on Income, 10 on Social Security, 3 on Taxes, 16 on My Data**. My Data also renders
one component, `GuidedWizard` (L4961–L5117; six grids of two or three `minmax(0, 1fr)` columns), measured separately (§3.1).

| Line | Template | Measured on v6.40 | In this release |
|---|---|---|---|
| **Expenses** L8789 | `minmax(0, 1fr) minmax(0, 1fr)` | in a `dc-scrollx` box since v5.79 | no |
| L8799, L8825 | `85px minmax(0, 1fr) 70px` | **E3** | yes |
| L8852 | `110px minmax(0, 1fr) 80px 65px` | **E2** | yes |
| L8893 | `repeat(4, minmax(0, 1fr))` | **E1** | yes |
| **Income** L9100, L9225 | three / five `minmax(0, 1fr)` | `dc-stack-phone` / `dc-two-phone` since v6.38 | no |
| L9238 | `repeat(4, minmax(0, 1fr))` | in a `dc-scrollx` box | no |
| (the stream rows, L9179) | flex, `dc-streamrow` | **F-31** | yes |
| **Social Security** L9539, L9580 | `repeat(3 or 5, …)`; five fixed + `repeat(5, …)` | in `dc-scrollx` boxes | no |
| L9618, L9626, L9802, L9865 | two `minmax(0, 1fr)` | 0 at every width, plan and UI SIZE measured | no (named in `t105`) |
| L9667 | `repeat(3, minmax(0, 1fr))` | **S2** | yes |
| L9714 | six fixed px tracks | in an `overflowX: auto` box; fixed tracks do not shrink | no |
| L9737 | `repeat(3, minmax(0, 1fr))` | **S3** | yes |
| L9774 | `repeat(9, minmax(0, 1fr))` | **S1** | yes |
| **Taxes** L11900 | `repeat(6, minmax(0, 1fr))` | **T1** | yes |
| L11946 | eleven fixed px tracks | in an `overflowX: auto` box | no |
| L12009 | `repeat(3, minmax(0, 1fr))` | **T2** | yes |
| **My Data** L14507 | `repeat(4,minmax(0, 1fr))` | **M1** | yes |
| L14536, L14952, L15072 | one or two `minmax(0, 1fr)` | 0 measured | no (named in `t105`) |
| L14579, L14585 | three or four `minmax(0, 1fr)` | **M6** | yes |
| L14604 | four `minmax(0, 1fr)` | **M6** | yes |
| L14749, L15212 | four `minmax(0, 1fr)` | **M2** | yes |
| L14796 | `minmax(0, 1fr) 116px 78px 118px 30px` | one shrinking track; 0 measured | no |
| L14955, L14964 | `minmax(0, 1fr) 90px` | **M3** | yes |
| L15092 | `140px` + three | **M4** | yes |
| L15116 | two `minmax(0, 1fr)` | 0 measured | no (named in `t105`) |
| L15122 | `1.2fr minmax(0, 1fr) minmax(0, 1fr) 1.2fr` | **M6** | yes |
| L15132 | two or three `minmax(0, 1fr)` | **M6** | yes |
| (flex) L14515, L15104 | fee row; paycheck totals | **M5** | yes |
| (inline-flex) L15252 | export row | **M5** | yes |
| **Roth** L11507 | `repeat(9, minmax(0, 1fr))` + `dc-cards-phone`, `minWidth: 500` (v6.40) | the labels (§0.4) | yes |
| **Withdrawal** L10879 | `repeat(3, minmax(0, 1fr))` | **W1** | yes |
| **Monte Carlo** L12635 | `repeat(4, minmax(0, 1fr))` | **C1** | yes |

Also edited: the stylesheet's phone block (`@media (max-width: 599px)`, L8088) gains three rules; two rules outside it (§3); `DOCS_HTML` §13's
*"Designed for a desktop browser"* item and the v6.40 note's last sentence (§3.3); a §13 v6.41 note; the four version sites.

**Suites that read what this changes** (parser census of string and template literals in `qa/`: acorn for `.mjs`, Python's `ast` for `.py`):
- **Re-gated:** `t104` A-3a pins R1's `minWidth: 500` and its one class; `t104` C-1/C-2/C-3 pin the §13 sentence and the v6.40 note; `t102`
  E-2 pins the §13 sentence. Each is gated on the version, earlier legs keeping their check.
- **Registered for v641:** the usual AST registration, and by hand `t103`'s prior-leg map, `t93`'s Engine D reference, `t33` PINS (unchanged
  figures), and `t45`/`t47`/`t48`'s version lists (OPERATIONS §G).
- **Read, unaffected (each must still pass):** `t1` *EXT F-2/F-8* (counts the two `repeat(9, minmax(0, 1fr))` grids, which stay, and at least
  eleven `overflowX: "auto"` boxes, none removed); `t102` A-1/A-2 (count the Income tab's classes by their own grid); `t104` §A's R1 class
  check (a class list containing `dc-cards-phone` still passes it — to be confirmed at the build); every suite reading the four tabs' text.

## 2 · Register sweep (§K2) — by mechanism

Searched `UsabilityFlaws.md`, `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `FlawsToFix-v5_73-Phase2.md` and `METHODOLOGY.md` for the
mechanism (`minmax(0`, `dc-scrollx`, *overprint*, *print over*, the claiming grid, the category column, UI SIZE, *stream*):
- **F-30** — this item; it traced the cause on these four tabs at v6.40. The Expenses label it called *"not one of these grids; cause not
  traced"* is traced here (E3: a fixed 85 px column since the initial commit, against the one-time list's 110 since v6.21).
- **F-8** — its row says v5.79 turned the claiming grids from overflowing into overprinting (corrected at v6.40); S1 fixes that.
- **F-31** — fixed here (§3).
- **F-32** — stays open; this scope's 26-tab sweep at UI SIZE 115–150% on a phone widens what it records (§5).
- Nothing in MissingFeatures, ARCHITECTUREIssues, FlawsToFix or METHODOLOGY touches this mechanism.

## 3 · The fix — prototyped and measured

v6.40's two tools — **reflow on a phone** (a class whose rule lives only inside the phone block) and **a minimum width inside a box that
scrolls** (`dc-scrollx`) — plus a third, for flex rows: **wrap on a phone**.

| Site | Change | Why |
|---|---|---|
| M1, M2, M4, M6 | `dc-two-phone` (reused) | four columns of label-and-figure become two |
| M3 | `dc-stack-phone` (reused) | two inputs of one row become one above the other |
| M5 | new phone rules: `.dc-wrap-phone { flex-wrap: wrap !important; }` on the two flex rows; `.dc-export-phone` (`max-width: 100%`, its input `min-width: 0; flex-shrink: 1`) on the export row | the page no longer widens at 360 |
| S1 | `dc-cards-phone` (v6.40's rule, reused: as many cards a row as fit at 84 px or more) | the claiming grid is nine age cards; on a phone three or four a row, as the Roth calendar since v6.40. No minimum width: at 600 px and up the grid is unchanged (measured: no pair at UI SIZE 100% from 600, nor 115% or 130% at 600) |
| S2, S3 | `dc-stack-phone` | three cards with a figure and a sentence each |
| E1 | `dc-stack-phone` | four groups of item rows |
| E2 | a `dc-scrollx` box around the one-time list, `--dc-floor: 296px` *(316 px as first built — §8 B2)* | the rows are a table (category, item, amount, year): they keep their columns and scroll below 390 px. 316 px is the row's width at a 390 px window, the narrowest with no pair (measured with and without the web fonts: 4 pairs at 385, 8 at 360–380 on v6.40); the floor is 296 px because it sets the row's content width and `.erow` adds 10 px of padding each side |
| E3 | the monthly lists' category column `85px` → `110px`, at every width; the date line under each item `paddingLeft` 95 → 120 *(added at the build — §8 S1)* | the one-time list's 110 px (v6.21's own comment); *"Transportation"* fits. The date line's 95 px indent was the old column plus 10 |
| T1 | `dc-two-phone` | six tiles, three rows of two |
| T2 | `dc-stack-phone` | three columns of prose |
| F-31 | `.dc-streamrow { flex-wrap: wrap; }` at every width (outside the phone block; the phone block's own rules for the row's parts stay) | a row too long for its line wraps instead of widening the page; a row that fits does not change |
| Roth R1 | the calendar's class list gains `dc-cards-sub700` (a rule in `@media (max-width: 699px)`: the phone's card layout); its `minWidth` 500 → 600 | below 700 px the calendar shows as many years a row as fit at 84 px, so *"CONVERT"* sits inside its card; the 600 px minimum (the card layout lifts it below 700) keeps a zoomed window at 700 px and up scrolling the calendar rather than squeezing it |
| W1 | `dc-stack-phone` | three cards of prose |
| C1 | `dc-two-phone` | four figures, two a row |

**3.1 · Measured on the prototype (p4).** Overlapping pairs, UI SIZE 100%:
- **All 26 tabs: no pair but the Grade tab's false positive, and no page wider than its window,** at 360, 375, 390, 414, 430, 480, 540, 599,
  600, 640, 700, 768, 820, 1024, 1280 and 1440 px on the example; at 360, 390 and 600 on the stream plan; at 390 on the single, no-ACA and ×5
  plans. (390, 600 and 1024 on the example and 390 on the stream plan were measured on the prototype before W1 and C1 were added, p3; the two
  differ only in those two phone-only classes.) The four F-30 tabs, Income and Roth also at 360 on the single, no-ACA and ×5 plans (p3).
- **F-31:** the stream plan's Income tab fits at 600, 610, 620, 626, 640 and 700 px (v6.40: 626 px wide at 600 and 620).
- **The Roth calendar's labels**, with the web fonts: no label past its card and none into its neighbour at 600, 612, 620, 640, 660, 680, 690, 700, 720 and 1024 px (the card layout at 600–690, six cards a row at 640; the nine columns from 700).
- **UI SIZE on a phone (390 px), all 26 tabs** — the four F-30 tabs and Income go to 0 pairs with no sideways scroll at 115% and 130%; at
  150%, 0 pairs except My Data's 1, and the My Data and Social Security pages still 445 and 432 px wide (F-32); the other tabs are unchanged from v6.40 except Withdrawal and Monte Carlo, where W1 and C1 also act (Withdrawal
  4 → 0 at 115% and 6 → 3 at 130%, its page 401 / 420 → 390 px; Monte Carlo 6 → 2 at 115%, 125 → 121 at 130%):

  | 390 px, pairs (page width) | v6.40 115% | p4 115% | v6.40 130% | p4 130% | v6.40 150% | p4 150% |
  |---|---|---|---|---|---|---|
  | My Data | 14 (417) | 0 | 28 (473) | 0 | 41 (544) | 1 (445) |
  | Social Security | 20 | 0 | 34 | 0 | 36 (432) | 0 (432) |
  | Expenses | 28 | 0 | 31 (392) | 0 | 48 (453) | 0 |
  | Taxes | 8 | 0 | 26 | 0 | 46 (407) | 0 |
  | Withdrawal | 4 (401) | 0 | 6 (420) | 3 | 26 (444) | 26 (444) |
  | Monte Carlo | 6 | 2 | 125 | 121 | 146 (392) | 146 (392) |
  | Guardrails / Survivor / Ranking | 0 / 0 / 0 | 0 / 0 / 0 | 1 / 4 / 0 (395) | 1 / 4 / 0 (395) | 4 / 8 / 4 (426) | 4 / 8 / 4 (426) |
  | Dashboard / Checklist / Grade / Verify (page width only) | 390 / 390 / 401 / 411 | 390 / 390 / 401 / 411 | 409 / 402 / 453 / 465 | the same | 472 / 465 / 522 / 537 | the same |

  The Social Security page at 150% stays 432 px wide: not one of this release's grids (F-32).
- **UI SIZE in a window 600 px wide or more** (F-32, unchanged in kind): at 115% / 600 px, Expenses 2 pairs; at 130% / 600 px, My Data 2,
  Expenses 4, Income 7 (v6.40: 2, 4, 7). The phone rules cannot act at 600 px, by design.
- **The Guided Setup wizard** (My Data's `GuidedWizard`), steps 0–5 at 360 and 390 px: no pair inside the wizard. (The only pairs are the
  sticky *"Unsaved changes"* bar, `position: sticky`, over the page scrolling beneath it — by design.)

**3.2 · Desktop and tablet at UI SIZE 100% — every text box (position and size), v6.40 against the prototype, `Math.random` seeded alike.**
- **My Data (417 boxes), Social Security (479), Taxes (491), Income (190), Withdrawal (421), Monte Carlo (450): identical** at every width
  measured from 600 to 1440 px (600, 640, 680, 699, 700, 768, 800, 1024, 1440 for the first four; 600, 700, 820, 1024, 1440 for the last two).
- **Roth (501): identical from 700 px** with overlay scrollbars (a phone's or a Mac's). At 600–699 the calendar is in its card layout (254 boxes
  differ: the calendar and everything below it). Where the browser's scrollbar takes room (Windows), the calendar's 600 px minimum engages in
  windows up to about 716 px and its box scrolls by the scrollbar's width; at UI SIZE 115% in an 800 px window it scrolls by 4 px (§8 N3).
- **Income on the stream plan (223): identical from 680 px.** At 600–670 the stream rows wrap (60 boxes differ): on v6.40 the long label was
  squeezed into a 43 px column 98 px tall, and at 600–625 it pushed the page wider.
- **Expenses (311): differs at every width** — E3, decided (DG-3). The monthly lists' category column is 25 px wider and their item column 25 px
  narrower, so an item name that filled its line wraps once more (*"Mortgage (Current Home)"* at 600 px: two lines → three) and a category name
  that wrapped no longer does (*"Retirement Life"* at 1024 and 1440: two lines → one). Rows below move by multiples of 7 px (one line is 14 px;
  some differences are a half line where two columns' heights meet). At 1440 the tab is 28 px shorter; at 600 it is longer. On a phone the
  same 25 px comes out of the item column (about 140 → 115 px at 360), so items wrap to more lines and the tab is longer (3382 → 3698 px at
  360, measured by the build review). The date line under each item moves with the column (§8 S1).

**3.3 · The Field Manual.**
- **§13 *"Designed for a desktop browser"* item.** Now: *"On a phone some figures still print over their neighbours on parts of the My Data,
  Social Security, Expenses and Taxes tabs (v6.38: the Income tab’s were fixed; v6.40: the Roth and Stress tabs’). At UI SIZE 100% a screen
  600 px wide or more shows them apart, except that a long category name on the Expenses tab can run under its item at any width, and below
  about 690 px the Roth tab’s IRMAA calendar’s “CONVERT” labels can run past their cards. A larger UI SIZE gives the page less room, as a
  smaller screen would, but the phone layout follows the window’s width, not UI SIZE: with a large UI SIZE in a narrow window some figures
  overlap, and on a phone at 150% the page can scroll sideways. Between 600 and 625 px the Income tab can scroll sideways when an income stream
  has a long label."*
  - Its last clause of the UI SIZE sentence is **false as shipped**: on v6.40 the page scrolls sideways on a phone at 115% (Grade, Verify)
    and at 130% (eight tabs), not only at 150% (§3.1's table, v6.40 columns). v6.40 measured UI SIZE on all 26 tabs only at 100%. Owned here;
    corrected.
  - Proposed *(as shipped, after §8 S2; the first build said "on a phone or on a wider screen", false below 360 px)*: *"At UI SIZE 100% no tab
    prints figures over their neighbours on a screen 360 px wide or more (v6.38, v6.40 and v6.41 fixed the tabs that did); on a narrower phone a
    few figures on the Monte Carlo tab still do, and the Grade and Verify tabs scroll sideways a little. A larger UI SIZE gives the page less room, as a smaller screen would, but the phone layout follows the window’s width,
    not UI SIZE: with a UI SIZE above 100% some figures overlap in a narrow window — on a phone, most on the Monte Carlo tab — and on a phone
    some tabs scroll sideways."*
- **The v6.40 note's last sentence** — *"Four other tabs still overprint on a phone (the desktop item below)."* — becomes false at v6.41.
  Proposed: *"Four other tabs still overprinted on a phone; v6.41 fixed them."*
- **A §13 v6.41 note**: on a phone the My Data, Social Security, Expenses and Taxes tabs no longer print figures over each other (two-a-row
  and stacked fields, the claiming grid as cards, the one-time list scrolling in its box below about 390 px); nor do one Withdrawal and one
  Monte Carlo panel on the narrowest phones; the Expenses category column is wider at every width; the Roth calendar shows its cards below
  700 px so its labels fit; an income stream's row wraps at any width when it does not fit; nothing else on a desktop moves, and no figure.

## 4 · Tests

- **New `t105_f30b_phone.mjs` (jsdom, both legs; the v6.40 leg pins each defect as `[KNOWN DEFECT 2026-10-31, F-30 — flips at v6.41]`).**
  - **§A by AST.** The three new phone rules sit only inside the phone block, once each, and say what they do; `dc-cards-sub700` sits in a
    `max-width: 699px` block and only there; `.dc-streamrow { flex-wrap: wrap }` sits outside every media block. Each site carries its class
    (M1–M6, S1–S3, E1, T1, T2, W1, C1); E2's rows are the direct children of a `dc-scrollx` box whose `--dc-floor` is `296px`; E3's two
    templates start `110px`; R1 carries both classes and `minWidth: 600`. **EXTINCTION:** in the five renders (My Data, Social Security,
    Expenses, Taxes, Income), every grid whose template — `repeat()` expanded, both branches of a conditional read — has **two or more**
    tracks that can shrink to zero must be the direct child of a `dc-scrollx` box with a floor of at least 200 px, carry a `minWidth` of at
    least 200 px, carry a phone class, or be on the named list with its reason (SS L9618, L9626, L9802, L9865; My Data L14536, L14952,
    L15072, L15116 — two-column grids measured clean at every width, plan and UI SIZE). An `overflowX: auto` parent alone does not count. A
    new shrinking grid on these tabs without one of these fails.
  - **§B rendered text.** On the example, the single plan and the no-ACA plan, the five tabs' text (and Withdrawal's and Monte Carlo's) is
    identical to v6.40's, both legs seeded alike, the v6.40 leg dumped in a child process — required in the v6.40 → v6.41 run, a printed skip
    in any later one (v6.40's rule).
  - **§C** §13's sentence, the v6.40 note's corrected sentence and the v6.41 note.
- **`t45` §S-10 (Chromium, from v6.41; `_vnum(VER) >= 641`):** the four F-30 tabs and Income at zero pairs with no sideways page scroll at
  360, 390 and 430 px on the example and the stream plan, at 600 and 640 px, and at UI SIZE 130% at 390 (each case first checking the zoom
  took effect); Withdrawal and Monte Carlo at 360; Expenses at 600, 1024 and 1440 (E3); the Roth calendar's per-row card count at 640 and
  700 px (cards at 640, nine at 700); F-31: the stream plan's Income at 600, 610 and 620 px with no sideways scroll. *(Added at the build,
  after §8: the one-time list's box scrolls at 360 and not at 390 or 393 px (B2); S-10 seeds `Math.random` (N6).)*
- **Re-gated:** `t104` A-3a (R1's minimum 600 and its class list), C-1/C-2/C-3 (§13); `t102` E-2 (§13).
- **Controls:** `qa/tools/controls_v641_phone.py` — each fix reverted alone (each class removed; E2's box removed and its floor at 200 px
  and at 0; E3 back to 85 px; each new rule moved outside the phone block, or `.dc-streamrow` moved into it; R1's minimum back to 500 and
  its `dc-cards-sub700` removed), each naming the check that must go red (`t105` §A; `t45` against a copy of the built page for the layout
  ones).
- The full suite from the packaged copies; parity 10/10 (no engine change).

**Not reached, stated:** the box comparison (§3.2) is done at the build, not by a suite; widths and UI SIZEs other than those listed;
real phones (Chromium's mobile emulation only); skins other than the default for the layout probes (the classes change only `grid-template-columns`
and `flex-wrap`, which no skin sets).

## 5 · Filed by this scope

**F-32 widened.** At UI SIZE above 100% on a phone, v6.40 recorded the Roth and Stress tabs and *"the page scrolls sideways at 150%"*. The
26-tab sweep here (§3.1's table) finds, on v6.40 and unchanged by this release except where §3 reaches: the **Monte Carlo** tab overlapping
heavily at 130% and 150% (125 and 146 pairs at 390 px — its percentile table, `repeat(6, minmax(0, 1fr))`, and its LTC results grid);
Withdrawal, Guardrails, Survivor and Ranking overlapping at 130–150%; and the page scrolling sideways on Grade and Verify from 115%, and on
Dashboard, Checklist and Ranking at 130%. A real fix makes every phone rule follow the zoomed width — its own release, and the recommended
next phone release.

## 6 · Out of scope

F-32 beyond what §3 does (DG-7): the Monte Carlo percentile table at UI SIZE above 100%, the page widths in §5, and zoomed windows 600 px and
wider. Pinned first columns or a scroll hint in the new scroll box (v6.40's DF-6). The 44 px touch-target guideline (F-3). Any engine.

## 7 · Decisions — taken as recommended, under Steve's instruction

| # | Decision | Options | Taken |
|---|---|---|---|
| **DG-1** | My Data | (a) the phone classes (two-a-row, stacked, wrapping rows; the export row shrinks) · (b) put each grid in a scroll box | **(a)** — these are form fields; scrolling a form sideways is worse than reflowing it |
| **DG-2** | Social Security | (a) the claiming grid as cards on a phone (as the Roth calendar), the two card rows stacked · (b) the claiming grid in a scroll box | **(a)** |
| **DG-3** | Expenses | (a) the delta stacks on a phone; the one-time list scrolls in its box below 390 px (a 296 px floor, 316 with the row's padding); the category column 110 px at every width — fixes the desktop label, and moves the tab's boxes at every width · (b) as (a) but leave the 85 px column and disclose the label | **(a)** |
| **DG-4** | Taxes | (a) tiles two a row, the three columns stacked · (b) scroll box | **(a)** |
| **DG-5** | F-31 | (a) stream rows wrap at every width when they do not fit (a row that fits does not change; measured identical from 680 px on the stream plan) · (b) move the phone block's breakpoint for this row to 699 px | **(a)** |
| **DG-6** | The Roth calendar's labels | (a) the card layout below 700 px, minimum 600 above · (b) a wider minimum (about 690 px) so the calendar scrolls at 600–690 · (c) leave, disclosed | **(a)** — the phone's layout already reads well; a calendar that scrolls on a tablet does not |
| **DG-7** | UI SIZE | (a) fixed for these tabs on a phone at 115–130% (the classes do it); zoomed windows of 600 px and up, and other tabs, stay F-32, widened and disclosed · (b) make the phone layout follow UI SIZE now | **(a)** |
| **DG-8** | Version | (a) v6.41; the 2027 tax figures become v6.42 (suite stays `t99`; 15 December deadline unchanged) | **(a)** |
| **DG-9** | The two grids found at 360 px (§0.5) | (a) fix here with the phone classes (no desktop box moves — measured) · (b) file under F-30 for later | **(a)** — the release's goal is every phone width |

## 8 · The independent build review (2026-10-31) — what it found, and what changed

A reviewer given the scope, both sources, both built pages and the tests — not this session's reasoning — re-measured in Chromium with the
web fonts served locally and `Math.random` seeded, read screenshots at 360 and 390 px, diffed both sources (the `DOCS_HTML` string by
extracting it), and tried the claims at widths and plans this scope did not. It read the first build (source `69ad33e8…`, page `9f5de995…`;
never shipped). **What held:** every changed line matches §1/§3 (71 outside `DOCS_HTML`; inside it only the callsign, footer, the §13 item, the
v6.41 note and the v6.40 note's last sentence); all 26 tabs box-for-box at 640, 700 and 1280 px identical but Expenses (disclosed) and Roth at
640 (disclosed); S-10's cases at 0 pairs with the web fonts (so S-10 does not repeat S-9's font-dependent failure); the four tabs at 0 pairs
at 375 px on the stream, single, no-ACA and ×5 plans; every tab at 360 and 1100 px; the Report skin at 360/390/1024 (v6.40: up to 10 pairs);
the calendar's labels at 600–1024 px and at 800/1024 under UI SIZE 115–150%; `t105` 55/0 with §B; the 28 source controls firing.

| # | Finding | Severity | What changed |
|---|---|---|---|
| **B1** | `t45` S-10 set a module-level `ok = <bool>`, which replaced the suite's pass counter `ok`: the run printed *"8 passed"* for about 220 checks. Failures were still counted, so only the tally lied | blocker | the counters are `_N_PASS` and `bad`; S-10's locals are `found` and `cal_ok`; the count is taken from the re-run |
| **B2** | E2's 316 px floor sets the row's **content** width; `.erow` adds 10 px of padding each side, so rows were 336 px and the list scrolled up to about 410 px, hiding 10 px of the year at 390 and 7 at 393. §3's premise was the bordered width. The overlap detector clips text to its box, so nothing saw it | blocker | `--dc-floor: 296px` (box 316 = row 316 at 390; 0 pairs at 360–393, measured by the reviewer and again here); `t105` A-4a pins 296 and `.erow`'s padding; `t45` S-10 checks the box scrolls at 360 and not at 390 or 393; controls K29 and P9 |
| **S1** | E3 left the date line under each monthly item at `paddingLeft: 95` (the old 85 px column + 10): on every screen it now started 15 px inside the category column | should-fix | 120 px (110 + 10); measured at 360, 375, 390, 480 and 600 px (0 pairs, no page wider, though the line is `nowrap`) |
| **S2** | the new §13 sentence (*"no tab prints figures over their neighbours, on a phone or on a wider screen"*) had no lower bound, and is false below 360 px: Monte Carlo 3 pairs at 320, 1 at 340; Grade 348 and Verify 358 px wide — all as on v6.40 | should-fix | bounded at 360 px, naming what remains below it; measured here at 320, 340 and 355 (Monte Carlo 3 / 1 / 0; Grade fits from 348, Verify from 358); filed as **F-33** |
| N1 | `t104`'s `B_PRIOR` comment was pushed onto the end of the new `F30B` comment by the scripted edit | nit | restored |
| N2 | `t45`'s comment still said only the Income tab is held to zero | nit | rewritten |
| N3 | the calendar's 600 px minimum scrolls its box by a few px at UI SIZE 115% / 800 px, and by a classic scrollbar's width in 700–716 px windows | nit | disclosed (§3.2, CHANGELOG) |
| N4 | E3 also narrows the item column on a phone (about 140 → 115 px at 360): the Expenses tab at 360 grows 3382 → 3698 px | nit | disclosed (§3.2) |
| N5 | four exempt two-column Social Security grids are clean but cramped at 360 px | nit | recorded on F-30 as a candidate for F-32's release |
| N6 | S-10 did not seed `Math.random`, so its Monte Carlo figures varied run to run | nit | S-10 seeds it (an init script, `open_plan(…, seed=True)`) |
| N7 | §3.3 proposed an em dash; the shipped item uses " - " as the rest of that item does (`t105` C-3 pins it) | nit | recorded here |

## 9 · Build record (v6.41, 2026-10-31)

**9.1 · What shipped.** Source `0f20b07de191cccbea077efb7cc1e11b`, built `index.html` `a8862af237917897bc14145e9f3a415f` (vite 5.4.21, the `npm ci`
toolchain; built twice, byte-identical; v6.40 rebuilt from its own source byte-identically to `53d30398…` on the same toolchain). Made by
`s641/build_src641.py` (session scratch) from the v6.40 source: every edit asserts its old text once on its v6.40 line. Its code is p4's (§3.1)
plus §8's B2 and S1, the comments, the four version sites and the Field Manual. The first build (`69ad33e8…` / `9f5de995…`), which the review
read, was never shipped.

**9.2 · The review's findings** — §8. Two blockers and two should-fix items were fixed before the packaged run; the nits fixed or disclosed.

**9.3 · Measured on the shipped page after §8.** Below 360 px (S2): Monte Carlo 3 / 1 / 0 pairs at 320 / 340 / 355 px, Grade 348 and Verify
358 px wide at 320–355 — the sentence and F-33 say so. The Expenses tab at 360, 375, 390, 480 and 600 px on the example, and 390 on the stream
plan: 0 pairs and no page wider than its window with the date line at 120 px. `t45` S-10 (225 passed on the development run, against 150 at
v6.40) holds the rest, including the one-time list's box at 360 / 390 / 393. The respin touched only the Expenses tab's layout (the floor, the
date line) and the Docs tab's text, so the review's box comparison of the other 24 tabs at 640, 700 and 1280 px stands.

**9.4 · Controls.** `qa/tools/controls_v641_phone.py` on a whole copy of the run folder: **36 of 36 as expected** — C0 silent; K1–K29 each turning
their named `t105` checks red (K25, a word on the Expenses tab, also turns B-0 red, whose sanity check reads that word); P1–P5 and P9 each
mutating a copy of the built page and turning `t45` S-10 red; every file restored and hash-checked. The first start of the run read *"C0 BAD"*
(`t105` A-1 red on what should have been the unmutated source) and was stopped; on a fresh copy of the run folder C0 passed alone and then in
the full run. Its cause was not established; the counted run is the fresh one. Three page controls drafted for the My Data, Monte Carlo and
Withdrawal classes (P6–P8) were dropped before the run: one `t45` run is about 15 minutes, their mechanism is P2's, and K6, K16 and K17 hold
the classes in the source.

**9.5 · The suite, from the packaged copies** (a run folder built by `mk_runfolder.sh v640 v641` from a clone of `efcac38` carrying the
package's `github/` files as cut): **11,090 app checks across 103 app suites, 0 failed, 0 DIED** — 6,002 current-leg, 4,607 prior-leg (v6.40),
234 and 237 in the two attribution runs, MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; GRAND 11,210. `t105` 55 (29 on the
v6.40 leg); `t45` 225 (150 at v6.40); `t104` 18 (its §B skips after v6.40's run, as designed). `smoke_built` 22 of 22 on the packaged page.
