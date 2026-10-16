# SCOPE — v6.15 · The Events tab speaks to users only: no Google Drive, no maintainer chores

**FULFILLED — shipped as v6.15, 2026-10-16.** Steve: *"Go"* — all five decisions as recommended, (a). Repo-only. §7 records the build.

This is a **PRESENTATION** release. No engine, no constant and no figure moves, so METHODOLOGY does not change. What changes is the
Events tab, the alert strip above every tab that the Events tab drives, the ⌛ STALE DATA strip, and the Field Manual text that describes
them.

Steve, 2026-10-16: *"I don't want the "events" tab to use google drive anymore … I don't want my users to have to use google drive"*,
then *"Let's do your recommendations"*. The four recommendations he approved:

1. Turn the tax-refresh event into a notice for users. It says this copy's tax figures are for 2026, that the 2027 figures arrive in an
   updated version by January, and that the user should reload stextor.github.io/danger-close or download a fresh copy. It carries no
   source-code or Drive instructions.
2. Remove the backtest-data and peer-benchmark maintainer events from the app.
3. Reword the backup event to neutral advice (a Documents folder, a personal cloud drive or a USB stick), with no Drive folder.
4. Keep Steve's own reminders outside the app, as Claude scheduled tasks that need no Drive. That is not app work, so it is not part of
   this scope. §4 records how it was done.

**Built against v6.14.** I made a fresh clone of `origin/main`. `git ls-remote` gives `4dc875f`, which is v6.14 plus its chmod, and the
tree is clean. The source is `57e4fca1dee821325c99a2334b4ecc60` and the built `index.html` is `2eeb765099fd121c8764c464265c3190`. Both
equal the v6.14 release as verified on 2026-10-16. The tag `v615` is free: `vercensus.cjs v615 qa src` finds 0 sites. Every line number
below is a v6.14 line in `src/DangerClose.jsx`, found with the parser tools:

- `textsites.cjs` for app text, including the one-line Field Manual;
- `suitetext.cjs` for suite literals;
- a new `idsites.cjs` for suite identifiers and member properties. It is session-only. acorn-walk skips non-computed member properties,
  so the tool checks them explicitly; its first version missed `X.computePlanEvents` for exactly that reason.

---

## 0 · Premise (verified at v6.14, not assumed)

### 0.1 · Where Google Drive appears

The only Google Drive text in the app is at two sites, both instructions on Events cards (`textsites.cjs 'Google Drive|Drive folder'`):

| Line | Event | Text |
|---|---|---|
| L2101 | `tax` | "A scheduled cloud agent runs Nov 15 and saves a prepared TAX_CONSTS / IRMAA_CONSTS block to the Google Drive "Danger Close" folder. Paste it into … src/DangerClose.jsx, bump TAX_CONSTANTS_YEAR, and this alarm clears. …" |
| L2277 | `backup` | "… Export one and drop it in the Google Drive "Danger Close" folder each quarter …" |

No repo document mentions Drive. A prose search of every `.md` in the clone finds the phrase only in the built `index.html`, which is
the app itself.

### 0.2 · Every user sees the maintainer's chores, and in January they hide the user's own

The Events list (`computePlanEvents`, L2078) holds three events that are the maintainer's work, not the user's:

- **`tax`** (L2093–2102): paste new constants into the source.
- **`hist`** (L2104–2113): append last year's returns to `HISTORICAL_RETURNS`.
- **`peer`** (L2203–2215): refresh the Ranking tab's survey tables.

The alert strip above every tab (L7377–7393) shows the most urgent tier among **all** events. It names only that tier's events.

I measured the strip with a session-only probe that called the shipped v6.14 module's `computePlanEvents` on the example household
(two people, 18 events) and applied the strip's own tier rule:

| Date | Strip on v6.14 | The user's own events that day |
|---|---|---|
| 2026-10-16 (today) | ◔ GETTING CLOSE: Annual tax-data refresh | none open |
| 2026-11-20 | ▶ ACTION WINDOW OPEN: Annual tax-data refresh | none open |
| 2027-01-05 | ⚠ ACTION REQUIRED: Annual tax-data refresh | **review green, backup yellow, SSA check yellow** — all hidden |
| 2027-02-01 | ⚠ ACTION REQUIRED: Annual tax-data refresh · Backtest data: append last year's returns | none open |

So today every user is told something is "getting close" that they cannot act on. In January they get an **ACTION REQUIRED** telling
them to edit a source file. Because the strip names only the top tier, that red alarm also **hides** the user's own open items:

- the annual plan review (green);
- the quarterly backup (yellow);
- the SSA record check (yellow).

In January the ⌛ STALE DATA strip (L7362–7370) already fires as well, so the same news appears twice and the user's real reminders not
at all. That is the defect this release fixes, beyond the Drive wording.

### 0.3 · The maintainer workflow the app carried was already wrong

The tax card's paste-in workflow contradicts the project's own rules. A pasted block would turn about eight suites red, because they carry
the 2026 figures as their reference values. Every refresh has to be a scoped, tested, packaged release. The research instructions written
for the Nov 15 scheduled task on 2026-10-16 already say so.

The same is true of the backtest append (`HISTORICAL_RETURNS` feeds the backtest suites) and the peer refresh. v6.10 was a full scoped
release. Its trigger was this very alarm going green (`docs/SCOPE_PEER_DATA_SCF2025_V610.md` line 8).

Removing the alarms therefore removes Steve's trigger. Recommendation 4 replaces it, outside the app (§4).

**No repo document holds the refresh cycles.** `docs/OPERATIONS.md` has no section on the annual tax, January returns or triennial SCF
refresh. A prose search for `Damodaran`, `HISTORICAL_RETURNS`, `TAX_CONSTANTS_YEAR` and `refresh cycle` finds nothing in OPERATIONS,
README or METHODOLOGY. Today the in-app text is the only written record, which is why DC-3 asks where it moves.

### 0.4 · A finding from the same read: "your plan survives the swap" is not always true

The STALE strip, the tax card's replacement and the Field Manual all tell the user to get a fresh copy of the app. Four sites promise that
the plan carries over because "it lives in your browser, not the file":

- L7368, the STALE strip: "Your plan data lives in this browser, not the file, so nothing is lost (Export Backup first as insurance)."
- Field Manual @≈134113, the "Two kinds" table: "your plan survives the swap — it lives in your browser, not the file."
- Field Manual @≈137487, the freshness paragraph: "your data lives in the browser, not the file, so swapping the file loses nothing."
- L2277, the backup card: "In a plain browser this app has no automatic persistence." This one goes the other way: it says the browser
  saves nothing.

**What the code does** (`src/main.jsx` L15–42): the plan is saved through `window.storage`. In a normal browser, `main.jsx` provides that
as a `localStorage` shim under the prefix `dc:`. `localStorage` belongs to one **origin**. The website (`https://stextor.github.io`) and
a saved file (`file://…`) are different origins, so a user who moves between them does **not** take the plan along.

Whether two saved files share storage depends on the browser. I have not tested that, and the release will not claim it either way.
Nothing is destroyed, because the old copy still holds the plan. But the user opens the new copy to a blank form after being told
nothing is lost. And the backup card's "no automatic persistence" is false, because the browser does save the plan.

The update path this release adds would repeat the first claim, so DC-4 asks to correct all four sites now. Each correction is
conservative: export first, and Import Backup if the plan does not appear. The Field Manual already describes that path
(@≈137487: "download the current build and Import Backup").

---

## 1 · The change (recommended options)

### 1.1 · The tax card becomes a notice (recommendations 1, DC-1 (a), DC-2 (a))

The card stays as key `tax`, so the Exit Plan tab's `evKeys` are unaffected: they name only `retire`, `roth`, `rmd` and `esttax`
(L7524–7560). The card carries a new field, `notice: true`.

- **Title:** `Tax figures in this copy (${TAX_CONSTANTS_YEAR})`.
- **States:**
  - **`red`** once the figures are out of date (`TAX_CONSTANTS_YEAR < nowY`). `when` reads: `out of date: these are
    ${TAX_CONSTANTS_YEAR} figures and it is now ${nowY}`.
  - **`future`** (TRACKING) from October to December of the figures' year. `when` reads: `${TAX_CONSTANTS_YEAR + 1} figures publish
    Oct–Nov; an updated version follows by January`, with a countdown to January.
  - **`future`** otherwise. `when` reads: `current for ${TAX_CONSTANTS_YEAR}`, with no countdown.
  - It has **no `green` or `yellow` state**, because there is nothing for the user to prepare or do until the update exists.
- **Instructions** (one text for all states):

  > This copy's federal tax and Medicare (IRMAA) figures are for ${TAX_CONSTANTS_YEAR}. Each year's new figures are published in the
  > fall (IRS late October, SSA October, CMS November) and arrive in an updated version of the app by January. If you use the app at
  > stextor.github.io/danger-close, reloading the page picks up the update. If you saved a copy of the file, download a fresh one from
  > that page and open it instead. Export a backup from the My Data tab first: your plan is saved in this browser, and a different copy
  > of the app may not see it. Import Backup on the My Data tab brings it back.

- **The strip ignores notices** (DC-1 (a)). The tier rule moves out of the JSX into one small pure function, `alertStripEvents(evs)`. It
  returns `{ tier, hits }` from the events whose `notice` is not set, and the strip renders from it. The strip's appearance, words and
  click-through stay the same. When the figures are out of date, the ⌛ STALE DATA strip remains the single app-wide alarm (DC-1).

### 1.2 · `hist` and `peer` are removed (recommendation 2)

Both blocks are deleted: L2104–2113 and L2203–2215. `HISTORICAL_RETURNS`, `PEER_DATA_SCF_YEAR`, `delta` and `mIdx` all have other
callers and stay. The section comments are renumbered.

The **annual plan review** card's instructions (L2296) end: "This is also when the new tax constants and historical-returns row land —
see those events above." That sentence becomes: "This is also when an updated version with the new year's tax figures is due — see the
tax-figures notice."

### 1.3 · The backup card (recommendation 3, DC-4 (a))

> The app saves your plan in this browser only, so clearing browser data, another browser or another copy of the app won't have it. The
> JSON exported from the My Data tab is the durable copy. Export one each quarter (and after any significant edit) and keep it somewhere
> private: your Documents folder, a personal cloud drive, or a USB stick. That way the worst-case loss stays small.

"Documents folder, a personal cloud drive, or a USB stick" is the export dialog's own wording (L≈14048), so the two now agree.

### 1.4 · The ⌛ STALE DATA strip (DC-3 (a), DC-4 (a))

Two sentences go:

- "Your plan data lives in this browser, not the file, so nothing is lost (Export Backup first as insurance)."
- "Maintaining the file yourself? The Events tab's tax-refresh alarm has the constant-update workflow."

One sentence takes their place: "Export Backup first: your plan is saved in this browser, and the new copy may not see it — Import Backup
on the My Data tab brings it across."

The rest of the strip, its colors and its click-through stay as they are.

### 1.5 · The Field Manual (DOCS_HTML, L4535; edits use quote-free anchors)

| Site | Now | Becomes |
|---|---|---|
| Ranking entry (@≈55900) | "…the 2028 survey publishes ~fall 2029, when the Events tab flags these benchmarks as due for a refresh." | "…the 2028 survey publishes ~fall 2029, and a later version of the app will carry it." |
| Events entry (@≈89550) | "(eighteen for a two-person household — several are per-spouse) — the annual tax-constant refresh, the backtest-data append, Roth-conversion …, the peer-benchmark refresh behind the Ranking tab (the Fed SCF is triennial), quarterly backup nudges, …" | "(sixteen for a two-person household — several are per-spouse) — a notice of which year's tax figures this copy carries, Roth-conversion …, quarterly backup nudges, …". A sentence follows the strip sentence: "The tax-figures notice is the one exception: it never raises that strip, because when the figures are out of date the ⌛ STALE DATA strip already says so." |
| "Two kinds" table (@≈134113) | "…open it in place of the old one: your plan survives the swap — it lives in your browser, not the file. Export a backup first as cheap insurance." | "…open it in place of the old one. Export a backup first: your plan is saved in your browser, and the new copy may not see it (a saved file and the website never share one) — Import Backup on the My Data tab brings it across." |
| Plain-English box (@≈135052) | "…If you maintain it yourself, the Events tab's tax-refresh alarm carries the update workflow." | The sentence is deleted. |
| Three-layer paragraph (@≈136760) | "(1) the Events tab carries a live alarm for each refresh cycle (tax constants, backtest append, SCF release) with paste-in instructions and the authoritative source for each;" … "The update path is deliberately simple: download the current build and Import Backup — your data lives in the browser, not the file, so swapping the file loses nothing." | "(1) the Events tab carries a notice of which year's tax figures this copy uses and when the next update is due;" … "The update path is deliberately simple: export a backup, get the current build, and Import Backup if your plan doesn't appear." |

"Sixteen" is not a hand count. It is 18 minus the 2 events removed, and t78 ties the word to `computePlanEvents(example).length` (§3 F-1),
so it cannot drift again.

The "Two kinds" table's first column ("quarterly backup nudges, the January plan review") and the Data-vintages table (vintages and
cadences) stay correct and are unchanged.

### 1.6 · Version bump to v6.15

- **App:** the four in-app sites, by the registrar.
- **Suites:** `vercensus.cjs v614 qa` prices the bump at 217 judgement points (72 gated expressions; the rest are keyed registries). The
  bump goes through `register_v611.cjs` with **one** `--skip=` argument holding a comma list, because v6.13 showed the tool silently
  ignores any extra `--skip`. Each gate is decided per §B2, never extended blindly.

---

## 2 · Site census (v6.14 lines; re-run at the build and recorded in §7)

### 2.1 · App

| # | Site | Change |
|---|---|---|
| A1 | L2093–2102, `tax` event | rewritten as the notice (§1.1); adds `notice: true` |
| A2 | L2104–2113, `hist` event | deleted |
| A3 | L2203–2215, `peer` event | deleted |
| A4 | L2270–2278, `backup` event | instructions reworded (§1.3); state logic unchanged |
| A5 | L2296, `review` instructions | last sentence (§1.2) |
| A6 | L7362–7370, STALE strip | two sentences become one (§1.4) |
| A7 | L7377–7393, alert strip | tier rule moves to `alertStripEvents` (new, beside `computePlanEvents`); output unchanged for non-notice events |
| A8 | L4535, Field Manual | five edits (§1.5) |
| A9 | four version sites | v6.14 → v6.15 |

Things that do not change, by census:

- The Events tab's card renderer (L7440–7485), its legend and its footer.
- The Exit Plan's `evByKey` (L7491). It reads only `retire`, `roth`, `rmd` and `esttax`.
- `HISTORICAL_RETURNS`, `PEER_DATA_SCF_YEAR`, `DATA_STALE_YEARS` and `TAX_CONSTANTS_YEAR`.

`computePlanEvents` has three callers: L7378, L7443 and L7491.

### 2.2 · Suites

| Suite | Why | Change |
|---|---|---|
| `t73_peer_benchmarks.mjs` §E (L192–204) | Calls `X.computePlanEvents`, finds key `peer` and asserts its states. This is the only suite that calls the function (`idsites.cjs`). | Gated: E-1 to E-3 run on legs where the event exists. On v6.15 one check takes their place: "E-0 the peer alarm is gone (v6.15)". |
| `domdiff_withdrawal.mjs` L192–197 | Its capture includes the alert strip, whose text depends on the **run date**. On 2026-10-16 v6.14 shows "GETTING CLOSE: Annual tax-data refresh" and v6.15 shows nothing. | A v614→v615 pair mask, modelled on `_p610`, sets the strip line aside on both sides. Two checks follow it: the v6.15 side never names the tax notice, and the mask really did bite or was a no-op. The STALE strip is set aside the same way for this pair (a no-op until January). |
| t1, t4 and every version-registered suite | the bump | registrar (§1.6) |
| t45, t47, t48 (Python, built page) | footer version | rebuild `index.html` before the full run (the v6.14 trap) |

`suitetext.cjs` found no other suite literal for any text this release changes. The search was:

```
Google Drive | tax-data refresh | Backtest data | Peer-benchmark | Export a plan backup | STALE DATA | Events tab | eighteen | survives the swap | not the file
```

### 2.3 · Registers

§K2 sweep: no register item mentions Google Drive, the Events tab or the alert strip. The §0.4 finding has no register ID and is fixed in
this release, so the CHANGELOG records it as a finding fixed, with no new register row.

---

## 3 · Tests — new `qa/t78_events_user_facing.mjs`, both legs (v6.14 prior, v6.15 current)

Every date is passed in. The suite must not depend on the day it runs.

### A · The event list

- **A-1.** On the example household, v6.15's keys are v6.14's minus `hist` and `peer`, in the same order. Checked on the first and the
  15th of every month, 2026 to 2028 (72 dates).
- **A-2.** **Nothing else moved.** For every other key except `tax`, `backup` and `review`, the fields `{state, when, countdown,
  instructions}` are identical across the two legs on every date in A-1. The current leg loads the prior module from the run folder.
- **A-3.** `backup` and `review` keep their v6.14 `state`, `when` and `countdown` on every date. Only their instructions change.

### B · The tax notice

- **B-1.** The notice's state and `when` on these dates:

  | Date | State | `when` |
  |---|---|---|
  | 2026-03-01 | future | "current for 2026" |
  | 2026-10-16 | future | publish/January text, countdown |
  | 2026-11-20 | future | publish/January text, countdown |
  | 2026-12-31 | future | publish/January text, countdown |
  | 2027-01-05 | red | out-of-date text |

- **B-2.** The notice is never `green` or `yellow` on any A-1 date.
- **B-3.** `notice === true`, and no other event carries it.
- **B-4.** The instructions name `stextor.github.io/danger-close`, "Export a backup" and "Import Backup". They carry none of these:
  `src/`, `TAX_CONSTS`, `IRMAA_CONSTS`, `HISTORICAL_RETURNS`, `paste`, `Drive`.

### C · The alert strip

- **C-1.** `alertStripEvents` on 2027-01-05 (v6.15): the tier is `green`, and the hits are the annual plan review. The **prior-leg
  pin** applies the same rule inline to v6.14's events and gets `red` with the tax-data refresh. That shows the defect in §0.2.
- **C-2.** On every A-1 date, `alertStripEvents` never returns the notice.
- **C-3.** On every A-1 date, it gives exactly what v6.14's inline rule gives once `tax`, `hist` and `peer` are dropped. The strip is
  otherwise unchanged.
- **C-4 (DOM, child process with the clock set to 2027-01-05 before the module loads).**
  - The rendered strip reads "▶ ACTION WINDOW OPEN: Annual plan review".
  - The ⌛ STALE DATA strip renders.
  - Its text has the Import Backup sentence and has no "Maintaining the file".
  - If setting the clock cannot be done cleanly, C-4 falls back to an AST check of the strip's JSX text. §7 records which one was used.

### D · Extinction

- **D-1.** No string, template or JSX text anywhere in the source contains "Google Drive" (any case). The search runs over the AST and
  includes the Field Manual.
- **D-2.** The built `index.html` contains no "Google Drive" (current leg).
- **D-3.** No event's instructions, on any A-1 date, mention `src/DangerClose.jsx` or a source constant name.
- **D-4.** No app text contains "survives the swap", "lives in your browser, not the file" or "no automatic persistence".

### E · Wording agreement

- **E-1.** The backup card and the export dialog share the phrase "your Documents folder, a personal cloud drive, or a USB stick".

### F · The Field Manual

- **F-1.** The Events entry's count word equals `computePlanEvents(example).length` on a date without the conditional
  expense-horizon event, read as a number. It is "sixteen" on v6.15 and "eighteen" on v6.14 (the prior-leg pin).
- **F-2.** The Ranking entry no longer says the Events tab flags the benchmarks.
- **F-3.** The three-layer paragraph no longer says "paste-in instructions" and names the notice.
- **F-4.** The "If you maintain it yourself" sentence is gone.

### Negative controls — `qa/tools/controls_v615_events.py`

The script follows the v6.13 and v6.14 pattern: mutate, build, run t78, restore, then hash-check. Each planted defect must turn its named
checks red.

| Control | Planted defect | Checks that must turn red |
|---|---|---|
| K0 | none (unmutated) | none: t78 passes |
| K1 | Drive restored in the backup card | D-1, E-1 |
| K2 | the strip ignores `notice` | C-1, C-2 |
| K3 | the `hist` block restored | A-1 |
| K4 | the Field Manual says "eighteen" | F-1 |
| K5 | the notice turns yellow in October | B-1, B-2 |
| K6 | the old STALE sentence restored | C-4 / D-4 |
| K7 | a non-text change: the `review` state's January month becomes February | A-3 |

K7 proves A-2 and A-3 catch more than wording.

---

## 4 · Out of scope, and stop conditions

- **No figures change.** The 2027 tax figures, the 2026 returns row and any survey data each come in their own scoped release when
  published.
- **Every other event** is unchanged. A-2 and A-3 prove it.
- **The Data-vintages table** keeps its vintages and cadences, which stay true.
- **Whether two saved files share storage** in a given browser is not tested, and nothing in the app will claim either way (§0.4).
- **Recommendation 4 is not app work.** It is done as Claude scheduled tasks, delivered into each task's own session with email and push
  notifications and no Drive. All three were created on 2026-10-16. Each is research-only, runs with automatic approval, and stops early
  if the repo is already refreshed.

  | Task | Schedule | First run |
  |---|---|---|
  | "Danger Close — yearly tax figures research" | every Nov 15, 8:54 ET | 2026-11-15 |
  | "Danger Close — January returns row research" | every Jan 20, 8:53 ET | 2027-01-20 |
  | "Danger Close — 2028 SCF peer data check" | once | 2029-10-22 |

  The older Nov 15, 2026 task, "Danger Close — 2027 tax constants prep", still saves to Drive and does the same job this year. It is
  Steve's to keep, edit or delete.

**STOP and report rather than adapt if:**

- a suite other than those in §2.2 turns red;
- the DOM render of any tab other than the strip changes on the v614→v615 pair;
- `computePlanEvents` turns out to have another caller.

---

## 5 · Decisions for Steve

**DC-1 · Does the tax notice ever raise the app-wide strip?**
- **(a) Never.** When the figures are out of date the ⌛ STALE DATA strip is the one alarm, and the Events strip stays free for the
  user's own items. **Recommended.** It fixes §0.2's hiding, and the STALE strip is louder anyway: it cannot be dismissed and turns red in
  the second year.
- (b) Only when out of date, as ACTION REQUIRED. This keeps the duplicate and the January hiding.
- (c) As now.

**DC-2 · What the notice shows from October to December.**
- **(a) TRACKING (dim)** with the "publish Oct–Nov; an updated version follows by January" text and a countdown. **Recommended.**
  Yellow means "prepare", and a user has nothing to prepare.
- (b) Yellow on the Events tab only (still kept out of the strip).

**DC-3 · Where the maintainer's refresh workflow lives once it leaves the app.**
- **(a) A short subsection inside OPERATIONS §I** (release mechanics), titled "Annual data refreshes". It covers the three cycles
  (tax figures each November, the returns row each January, the SCF triennially, next ~October 2029), each one's primary sources, and
  the rule that every refresh is a scoped release, never a paste. It points to the scheduled tasks as the reminders, and it adds no new
  top-level letter, so the "§A–§N" references in the project instructions and the manifest stay true. **Recommended.**
- (b) A new OPERATIONS §O. The project instructions and the manifest would both need editing.
- (c) Nowhere. The scheduled tasks' own text is the record. That is the weakest option, because tasks can be deleted.

**DC-4 · The "your plan survives the swap" claim (§0.4).**
- **(a) Correct all four sites in this release** with the conservative wording in §1.3–§1.5 (export first, and Import Backup if the
  plan doesn't appear). **Recommended.** The new notice would otherwise repeat a claim the code shows is false for website↔file moves.
- (b) Write the new notice correctly and leave the three older sites for a later release.

**DC-5 · The promise "by January".**
- **(a) Keep it**, as approved. The STALE strip fires on January 1 regardless, so a late update is still announced. **Recommended.**
- (b) Soften it to "an updated version follows once the figures are published".

---

## 6 · Release records

The CHANGELOG entry covers the following:

- the presentation change;
- the §0.2 hiding defect;
- the §0.4 finding;
- the test counts, per suite, taken from suite output;
- the limitation that the strip test in C-4 runs on a set clock.

METHODOLOGY does not change, because no modelling changes. If DC-3 (a) is chosen, OPERATIONS §I gains its subsection. TESTING gains t78
and the controls. The knowledge pool is refreshed per §G.

---

## 7 · Build record

**Built 2026-10-16 against v6.14** (clone at `a9e0a79` — v6.14 plus this scope, the only change since `4dc875f`; source `57e4fca1…`
unchanged). Source `a9520db52dc06aa380714c8a2a5c7514`; built `index.html` `38f51c212390ec41669fb9fb8246f024` (`smoke_built` 22 of 22; the four version strings once each, no `v6.14`, no
`<script src>`, no "Google Drive"). v6.14 was rebuilt first from its own source and reproduced its published `2eeb7650…` byte for byte.

**Census re-run on v6.15 (`census.cjs`, `textsites.cjs`, `idsites.cjs`).**
- `computePlanEvents` L2078; callers L7367 (the strip, through `alertStripEvents`), L7430 (the Events tab), L7478 (the Exit Plan's
  `evByKey`) — three, as §2.1 said. `alertStripEvents` L2302, one caller (L7367).
- The tax notice L2093–2105; backup L2255; review L2274. `hist` and `peer` gone; the section comments renumbered 1–15.
- `textsites` for `Google Drive|Drive folder|survives the swap|in your browser, not|in this browser, not|no automatic persistence|
  Maintaining the file|tax-refresh alarm|paste-in|Events tab flags|eighteen|Backtest data|Peer-benchmark|tax-data refresh` over the
  v6.15 source: **0 sites**.
- Suites: `computePlanEvents` is called by `t73` and `t78` only; `alertStripEvents` by `t78` only.

**Registration.** `register_v611.cjs qa v614 v615`: 314 automatic sites, 2 manual (`t77`'s default tag and its differential pair, both
left as they are). By hand: `t1`'s and `t4`'s version-string arms (the registrar folded `v615` into `"v6.14"`), `t33`'s PINS (v6.14's
values; no engine moved), the three Python suites' `KNOWN_VERSIONS`, `t73`'s new `NOPEER` gate, `domdiff`'s `_p615` mask, and the shim's
guarded `alertStripEvents` export. ⚠ The first two and `t33` were caught by a preliminary full run, not by review beforehand — owned in
the CHANGELOG.

**C-4 used the child process with a set clock**, not the AST fallback: the DOM bundle loads under a fixed `Date` (2027-01-05, 12:00)
and the rendered strip and STALE strip are read from the page.

**Where the build differs from §2–§3 as written.**
- `t78` carries §3's checks plus setup checks (0-1, 0-2, A-0, C-0, D-2a, E-0, F-0), and B-1f, B-4c, A-3b, C-2b, F-5 and F-6.
- `domdiff`'s second check is "the v6.15 STALE strip carries no maintainer workflow" rather than §2.2's "the mask bit or was a no-op".
  A bite-or-no-op check is true by construction; the identity check after the mask is what proves nothing else moved.
- The controls add K8 (the Ranking sentence restored → F-2) to §3's seven.

**Controls** `qa/tools/controls_v615_events.py`: **9 of 9** as expected, files restored and hash-checked. Every control fired its named
checks; the extra reds are the expected neighbours (K2 also C-3 and C-4c; K3 also A-2, D-3, F-1 and F-1b; K5 also B-1c and B-1d; K7 also
C-1, C-3 and C-4c).

**Suite, from the packaged copies:** **7,027 app checks across 77 app suites**, 0 failed, 0 DIED; MC parity 10/10; GRAND **7,159** (`t78` 42 / 21; `t73` 54). A first packaged run, made while the controls were rebuilding in parallel, failed `t38` I-6 once on the v6.15 leg (storage snapshot); `t38` passed on five reruns and in the clean run above — disclosed in the CHANGELOG, not changed here.

---

**Destination:** repo `docs/SCOPE_EVENTS_USER_FACING_V615.md`. **Not pooled** (OPERATIONS §G: scope documents are repo-only).
