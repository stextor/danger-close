# SCOPE — v6.24 · D-52: My Data keeps each expense row's months

**FULFILLED at v6.24 (2026-10-20). DECIDED 2026-10-20 — all five as recommended:** DC-1 (a) *"Show them"*; DC-2 (a) *"Split at retirement"*; DC-3 (a) *"Split + end at
horizon"*; DC-4 (c) and DC-5 (a) *"Both as recommended"*. Reviewed (§6). Built as v6.24 (§7); D-59 was found and fixed at the build (§8). Repo-only (`docs/`); it ships in the v6.24 package.

Steve, 2026-10-20, choosing the next build: *"Let's do D-52."*

This is a **data-handling release with one modelling default** (DC-2, DC-3). No engine changes: the engines already read each row to the
month. What changes is what My Data writes when it saves, drafts or exports, and the dates it gives a new row. METHODOLOGY changes (its
v6.21 D-52 bullet, and the defaults if DC-2/DC-3 are taken).

**Built against v6.23.**
- Clone: a fresh full clone of `origin/main` at `0ed4e4a`. That afternoon's post-upload check passed `package_check` 54 of 54 against the live
  pool, and the 90 committed files equal the v6.23 package byte for byte.
- Hashes: source `a683637e75ce6816cd9a077644534542`, built page `34455a918eb2c65bb2d34841fcedafbf`. The pooled source hashes the same.
- Line numbers: every one below is a v6.23 line, printed by `qa/tools/census.cjs` or read from the file this session.
- Runs: the v6.23 run folder the release was verified in (packaged copies), copied to scratch. The probes `p52_probe.mjs` and `p52_new.mjs`
  are session-only; they drive the real DOM bundle and were never committed.
- Free names: the tag `v624` (`vercensus.cjs v624` gives 0 judgement points; no `dom_entry_v624.jsx` in history; no `.py` suite names it),
  and the suite name `t87`.

---

## 0 · Premise (verified at v6.23, not assumed)

### 0.1 · The mechanism

My Data's expense table is one editor, `MyDataEditor` (L13100). When it opens, each stored row becomes an editor row with **years only**
(L13211–13222): `startYr`, `endYr` and `oneYr` are `parseInt(e.start.slice(0, 4))` and the like. The month is never read.

`buildExpenses` (L13392–13403) writes them back:
- a monthly row as `start: "${startYr}-01"`, `end: "${endYr}-12"` (L13402);
- a one-time row as `start: end: "${oneYr}-06"` (L13396);
- the monthly amount as `Math.round(...)` (L13402), so an annual entry ÷ 12 loses its cents;
- only the fields `cat, label, amount, freq, start, end, deductible, phase`, so any other field (`note`) is dropped.

`buildExpenses` has **three callers** (census): Save & Apply (`handleSave`, L13479), the draft autosave (L13501), and **Export Backup**
(`handleExport`, L13561). The register named only Save & Apply. **Exporting a backup from My Data re-dates the rows in the file even
without a save.**

Two more paths reach it and inherit whatever it does: the leave-dialog's Save (`MYDATA_SAVE`, L7626) and `restoreDraft` (L13518), which
commits a draft `buildExpenses` wrote.

No other code writes the expense table from the UI. `EXPENSES` is assigned only by the loader (`applyLoadedDataUnchecked`, L4215, and the
v6.21 car migration, L4365), restored by its rollback (L4027), mutated in place by the category migration (L207), and reset by L14584,
L14603 and L14652. The spreadsheet import (`_parseSpreadsheet`, L3717) keeps months. (Review, §6, items 2 and 10.)

### 0.2 · What one save does — measured by driving the real Save & Apply

`p52_probe.mjs`: mount the DOM bundle, *Use example data*, My Data, press Save & Apply with **nothing edited**, read storage.

**The example:** 31 of its 35 rows change.
- Every row is dated to the month: the current home's costs end **2029-03**, the next home's start **2029-04**, primary Medicare starts
  **2028-11**, the Car Payment runs **2029-04 → 2034-04**, the golf cart and closing costs are **2029-04**, the four cars **March**.
- After the save: the current home's rows end **2029-12** and the next home's start **2029-01**, so **2029 pays for both homes all year**.
  Medicare starts **2028-01**. The Car Payment runs **2029-01 → 2034-12**. The one-time rows move to **June**. Three `note` fields are gone.
- A second save changes nothing: the first save is a **one-time, irreversible** loss. The months survive only in the original source — the
  example (reload it), a spreadsheet, a wizard re-run — because Export Backup re-dates too, so **no backup exported from My Data keeps them**.
  A pending v6.23 draft carries re-dated rows into v6.24 (same storage key).

⚠ **An unedited save changes the portfolio too, and that is not this scope.** Comparing the example's stored portfolio after the save with
the one it loaded: `asOf` moves from 2026-04-18 to today (2026-10-20), and spouse A's pre-tax contribution `contribPreTaxA` drops from $2,500
to $0 a month (`buildPortfolio` L13326 takes it from the per-paycheck rollup, L13241, which the example leaves blank — disclosed in
METHODOLOGY's contribution-accrual section). So the example's figures in the table below are measured **with the portfolio held fixed**
(the loaded one, before and after); the wizard table's use the saved portfolio both times. Any test that "an unedited save moves nothing"
must hold the portfolio fixed, or it measures these too. (Review item 1.)

**The wizard's table:** `GuidedWizard` (L4506–4507) writes its pre-retirement living-expense row to `{retirement year}-06` and its
post-retirement row from `-07`. After one save both run the whole retirement year: that year pays both, twelve months each.

**What it moves** (v6.23, BASE unless stated; the same seeds before and after; table years in today's dollars):

| | Before the save | After one save |
|---|---|---|
| **Example** · table spending 2028 / 2029 / 2034 | $81,300 / $126,280 / $93,040 | $85,800 / **$157,720** / $96,240 |
| the post-retirement monthly figure (the table at June 2029 — the header, Dashboard, Income, Ask AI and others quote it) | $8,170 | **$10,810** |
| the D-43 "after the payments end" month | May 2034 | January 2035 (the Car Payment now ends December 2034) |
| Withdrawal tab (Engine D) lifetime spending · end portfolio | $3,080,809 · $1,716,664 | $3,115,912 · **$1,626,840** (−$89,825) |
| Taxes tab lifetime tax (as it opens) | $216,230 | $216,444 |
| 30-year Monte Carlo, 2,000 paths, BASE: >$500K · >$800K · median | 84.2% · 73.4% · $1,331,795 | 82.7% · 71.0% · $1,259,132 |
| the same, BULL-LEANING | 95.0% · 90.0% · $1,996,412 | 94.3% · 88.7% · $1,898,710 |
| **A wizard table** ($7,000 pre / $6,500 post a month, on the example's holdings) · retirement-year spending | $81,000 | **$162,000** |
| its post-retirement monthly figure (June 2029) | $7,000 — already the *pre*-retirement amount, from the June/July split | $13,500 |
| its Withdrawal tab end portfolio | $2,830,511 | $2,611,157 (−$219,354) |
| its 30-year Monte Carlo, BASE: >$800K · median | 82.5% · $1,850,052 | 79.8% · $1,667,576 |

**Direction: mostly conservative** — a save adds months of spending (the Car Payment's longer run included), and a loaded monthly row with
no start or end, never charged (L84 compares against `undefined`), starts being charged. **Optimistic pieces:** a one-time row dated
January–May is charged later in the Monte Carlo; an annual amount rounds to whole dollars a month ($1,000 → $996 a year); and a row entered
as a negative amount (income as a negative expense, which the editor warns against at L14064 but does not stop) is widened too. **Who it reaches:** every plan
that came from somewhere other than My Data's own editor — the example, the guided setup, a backup or import, the v6.21 car rows — the first
time it is saved or exported from My Data. A table built entirely in My Data is already whole-year, so a save does not move it again; but see
§0.3.

### 0.3 · A sibling: the editor's own defaults overlap the retirement year

The model retires on **1 January** of the retirement year (`buildPlanTimeline`, L868: `retireDate = { year, month: 1 }`). The editor's
default spans (`defaultSpan`, L13379–13381) are "Before retirement" = [this year, retirement year] and "After retirement" = [retirement year,
horizon]. Stored at whole years, a new "Before retirement" row runs to **December of the retirement year**. Driven in the DOM
(`p52_new.mjs`): a $100 row added as *Before retirement* is stored `2026-01 → 2029-12`; one added as *After retirement* `2029-01 → 2053-12`.
So **a table built from scratch in My Data pays its pre-retirement rows for the first twelve months of retirement**, alongside the
post-retirement ones. Never registered.

The wizard has the same shape at half the size: its split at June/July (§0.2) pays six months of pre-retirement living costs after a 1
January retirement. And its post row ends in **2079-12**, which is MissingFeatures **D-54** (a plan whose horizon runs past 2079 spends
nothing in its last years) — the same two lines.

### 0.4 · Smaller things the same function does

- `Math.round` on the monthly amount: a $1,000 annual row is stored as $83 a month ($996 a year).
- `note` is dropped. Nothing in the app reads an expense row's `note` (census: the one `.note` read in a render, L8481, is a phase card's,
  not a row's), so this loses data without changing a figure.
- `buildExpenses` also normalises (review item 4): it recomputes a one-time row's `phase` from its year; defaults a missing `phase` to
  "both"; a blank label to "Expense" / "One-time expense"; `freq` to `once` or `monthly`; a null amount to 0; drops a row with no amount
  and no label; and fills a missing start or end. A row entered as *Annual* reopens as *Monthly* (its stored amount is already ÷ 12).
- `_retYr` and `_horizonEndYr` (L13375–13376) come from `PLAN_TIMELINE` — the last **saved** plan — while the editor has its own live
  retirement-year field (L13132). A user who changes the retirement year in My Data and then picks *Before retirement* gets the old year.
  The one-time `phase` (L13396) has the same staleness. (Review item 6.)
- `monthlyAt` (L13406) is more than the preview: it feeds `genAIContext`'s EXPENSES line (L13461), which Save and Export store.
- A row with a blank year falls back to **today's** year (`_asOfYrMD = new Date().getFullYear()`, L13377), not the plan's as-of year. Recorded,
  not proposed (it is MissingFeatures D-56's family).

### 0.5 · What the copy says

The editor's footnote (L14118): *"'When' auto-fills the year range …; you can fine-tune the start–end years. … One-time costs apply in the year
you set."* The Field Manual's My Data entry **overclaims**: it promises *"frequency (monthly / annual / one-time), start and end dates"*;
the editor keeps years only, and an Annual row reopens as Monthly. (Review item 12.) METHODOLOGY's v6.21 section discloses D-52 (*"Saving re-dates rows to whole years (D-52,
open)"*), and MissingFeatures D-52 records it — with the example's Car Payment as the instance. **Neither knew about the two homes in 2029,
the wizard, Export Backup, or §0.3.**

---

## 1 · What changes (the recommended shape)

1. **The editor shows and keeps months (DC-1 (a)).** The *Years* column becomes *From – to*: a month selector beside each year (one for a
   one-time row). A row opens with its stored months; `buildExpenses` writes them back. Saving, drafting or exporting an unedited table stores
   each well-formed row **exactly as loaded**, every field included (`note` and any unknown field pass through). The normalisations of §0.4
   stay for rows the editor cannot otherwise represent, and are stated: a blank label is named, a missing `phase` is "both", a row with no
   amount and no label is dropped, a missing start or end is filled (the conservative reading — the row starts being charged). A one-time
   row's `phase` is still derived from its date.
2. **New rows and the *When* selector use the plan's retirement date (DC-2 (a)), read from the editor's own retirement-year field** (falling
   back to the timeline), so a change made in the same session counts. *Before retirement*: January of this year → December of the year before
   retirement. *After retirement*: January of the retirement year → December of the horizon year. *Throughout*: unchanged. A new one-time row:
   June of the retirement year, as now, now visible. "Retirement" is the household's date — spouse A's, which is what the model's retirement
   date is; a spouse B who retires later is not a second boundary. **Edge:** if the retirement year is this year or earlier, there is no
   time before retirement; *Before retirement* then defaults to the single month before the retirement date (December of the year before),
   which no engine charges once the plan is past it — the editor shows it, so the user sees why.
3. **The wizard splits at the retirement date and ends at the plan's horizon (DC-3 (a)).** Pre: January of the as-of year → December of the
   year before retirement (omitted if that is before the as-of month); post: January of the retirement year → December of the later spouse's
   plan-to year (`by + le`, A's for a single plan). **D-54 closes for plans the wizard builds from v6.24 on**; plans it already built keep
   their 2079 end, and the same disclosure as DC-4 says so.
4. **Amounts (DC-5 (a)):** whole dollars a month, as now, and said so in the footnote (an annual amount is stored as the nearest whole dollar a
   month). Cents would need six display sites reformatted (L7247, L7455, L8093, L8105, L8119, L8131 print amounts unformatted) and would
   end the integer amounts the Monte Carlo's quarter read relies on for its exact equivalence (comment at L141).
5. **Plans already saved (DC-4 (c)):** nothing can be restored — the months are not in the data. One permanent line in the editor's footnote
   (*"A plan saved before v6.24 stored every row as January–December and one-time rows as June — check the months"*), the same in the Field
   Manual §13, and the CHANGELOG.
6. **The copy:** the editor's footnote and column header; the Field Manual's My Data entry (its *"start and end dates"* becomes true; months,
   and what a save stores) and §13 (what changed, the line above); METHODOLOGY's v6.21 D-52 bullet closed and the new defaults stated;
   MissingFeatures D-52 closed and D-54 closed for new wizard plans. The four version sites.

**What moves.** **The example as it loads: nothing** — no engine changes, so every engine, both Monte Carlo engines and every tab are identical
to v6.23. **After a save, the expense table no longer moves anything** (§0.2's right-hand column stops happening); the portfolio's own
save behaviour (§0.2's ⚠ — the as-of date, the contribution rollup) is unchanged and out of scope. **A row added with *Before retirement*
from v6.24 on** ends a year earlier — the retirement year's spending falls (it was overstated). **A wizard plan built from v6.24 on** moves by
six months of its pre/post difference in the retirement year, either way; its post-retirement monthly figure becomes its post amount (the
example wizard table: $7,000 → $6,500); and it no longer stops spending after 2079.

---

## 2 · Site census (v6.23, `census.cjs`)

| Site | Line | Change |
|---|---|---|
| editor row construction | L13211–13222 | read months (`startMo`, `endMo`, `oneMo`); keep the source row (`_src`) for pass-through |
| `_retYr`, `_horizonEndYr`, `defaultSpan`, `updateExp`, `addExp` | L13375–13389 | spans as months from the editor's live retirement year (DC-2) |
| `buildExpenses` | L13392–13403 | write months; start from the source row's fields; normalisations as §1.1 |
| `monthlyAt` (preview and `genAIContext`'s EXPENSES line, L13461) | L13406–13413 | month-aware, at June of the year (the display rule, L184–213) |
| the table's header and *When* / *Years* cells | L14066–14107 | month selectors; widths (the table scrolls in its own box, `minWidth` 820) |
| the footnote | L14118 | copy |
| `GuidedWizard`'s two rows | L4506–4507 | DC-3 |
| callers of `buildExpenses`, and the two paths through them | L13479, L13501, L13561; L7626, L13518 | unchanged (they inherit the fix) |
| Field Manual (`DOCS_HTML`) | My Data entry, §13 | copy |

No engine, loader or storage key changes. The stored row's shape is unchanged (`"YYYY-MM"` strings, fields as loaded), so a v6.24 backup's
table opens in v6.23 (whose own save will re-date it, as now).

---

## 3 · Tests

**New suite `t87_expense_months.mjs`** — both legs; the v6.23 leg pins each defect as a dated `[KNOWN DEFECT]`.
- **A · the round trip (the extinction).** Drive the real Save & Apply, the leave-dialog Save, the draft autosave and restore, and Export
  Backup on: the example; every fixture table (`qa/tools/fixture/households.mjs`); the wizard's table; a table with the v6.21 car rows; a
  backup with notes and an unknown field. Each well-formed row is stored **field for field** as loaded, and a second save is identical. Edge
  rows (blank label, missing phase or dates, no amount) are stored as §1.1 says, each asserted by name.
- **B · nothing moves (held fixed).** With the **loaded portfolio** held fixed, the table before and after an unedited save gives
  bit-identical `tableYearExpense` for every year 2026–2075, Engine D's schedule, the tax schedule, both seeded Monte Carlo engines, the three
  headline monthly figures and the D-43 figure — on the example and the wizard table. On the v6.23 leg the same comparison reproduces §0.2's
  moves (pinned).
- **C · edits.** Changing a year keeps the month; changing a month keeps the year; *When* sets the DC-2 spans; changing the retirement year
  in the editor and then *When* uses the new year (same session); a retirement year this year or earlier; *Add expense* and a new one-time row.
- **D · the wizard.** Split at the retirement date, ends at the horizon, on a plan whose horizon is past 2079 and one before it; a single plan;
  a retirement year at or before the as-of year.
- **E · rendered and structural.** The selectors show the stored months; the preview and the Ask AI EXPENSES line; the footnote, including
  the pre-v6.24 line; the Field Manual sentences. By AST: no `-01`/`-12`/`-06` literal builds a date in `buildExpenses`, and no editor row is
  built from a four-character slice alone.

**Existing suites.** Ten press Save & Apply (`t4`, `t5`, `t8`, `t37`, `t56`, `t79`, `t80`, `t84`, `t85`, `t86`; AST census of regex and
string literals). Each that reads a figure or the stored table after a save is re-checked. One is known to flip: `t84` G-11 pins the June
re-dating as `[KNOWN DEFECT 2026-10-19, D-52]` and will read March. **Attribution for any figure that moves:** on v6.24, loading the table
v6.23's save produced (with the same portfolio) reproduces v6.23's post-save figure exactly — so the move is the re-dating and nothing else.
**Layout:** `t45` (no sideways scroll at 390 px) and `t48` (24 px targets) re-run on the new selectors.

**Parity:** `t2` 10/10, no intended difference. `domdiff`: the Withdrawal, Taxes and IRMAA tables identical on the example (not saved there).

**Controls** (`qa/tools/controls_v624_months.py`, repo-only): write -01/-12 again; write June again; read the year only on load; drop the
month selector; pass-through removed; *Before retirement* back to the retirement year; the boundary from the saved timeline instead of the
editor's field; the wizard back to June/July or to 2079; Export, the draft or the leave-dialog on the old builder; the footnote line removed;
the unmutated run.

**§K1 census:** not needed — the defect is visible on the example (on a save), and `t87` A and B run on the example.

---

## 4 · Out of scope (recorded)

- **The portfolio's own save behaviour** (§0.2's ⚠): the as-of date set to today, and `contribPreTaxA` taken from the per-paycheck rollup
  ($2,500 → $0 on the example). The second is disclosed in METHODOLOGY; whether an unedited save should zero it is a question for its own
  scope. **Filed as a finding, not fixed.**
- **The example's own story:** its rows move house in April 2029 while the model retires on 1 January 2029, so January–March 2029 is retired
  but still pays the current home (and not the next). That is the example's data; unchanged.
- **The retirement month** is always January (L868). A retirement-month input is its own release.
- **A blank year falls back to today's year** (§0.4) — added to D-56's list, not fixed.
- **Cents** (DC-5 (b)) and **detecting re-dated tables** (DC-4 (b)) — declined unless chosen.
- **The Income tab** (F-20) and D-49's residual — untouched.

---

## 5 · Decisions for Steve

**DC-1 · How the editor keeps months.**
(a) **Recommended.** Show them: a month selector beside each year. What you see is what is stored. *Direction:* none by itself — it stops a
save adding spending (§0.2), so saved plans read a little better than they would have; it makes them correct.
(b) Keep them hidden: carry each row's stored months, still showing years only. Smaller, but a row reading "2029–2034" would run April to
April with nothing on screen saying so — a silent simplification.
(c) Leave untouched rows alone (rows you edit are still re-dated to whole years).

**DC-2 · Defaults for a new row and the *When* selector** (§0.3).
(a) **Recommended.** *Before retirement* ends December of the year before retirement; *After retirement* starts at the retirement date; both
from the editor's live retirement year. *Direction:* optimistic against today — a new pre-retirement row costs twelve months less in the
retirement year — but today's twelve months are a double count.
(b) Keep today's spans (they overlap the retirement year by twelve months), now visible as months.

**DC-3 · The wizard's two rows** (§0.3).
(a) **Recommended.** Split at the retirement date and end at the plan's horizon (D-54 closed for new wizard plans). *Direction:* either way
in the retirement year (six months of the pre/post difference); conservative after 2079 (spending that was missing is charged).
(b) Split at the retirement date; leave the 2079 end.
(c) Leave both.

**DC-4 · Plans already saved.**
(a) Nothing in the app; the CHANGELOG and Field Manual §13 say so.
(b) A one-time My Data notice on tables that look re-dated. It cannot tell a re-dated table from one entered in whole years, so it would
fire on every plan built in My Data.
(c) **Recommended.** (a), plus one permanent line in the editor's footnote telling a plan saved before v6.24 to check its months. Cheap,
visible where the months are, and never wrong.

**DC-5 · Amounts.**
(a) **Recommended.** Whole dollars a month, as now, disclosed in the footnote. *Direction:* either way, at most $6 a year per annual row.
(b) Store to the cent and reformat the six display sites (§1.4). It ends the integer amounts the Monte Carlo's exact-equivalence note rests on.

---

## 6 · Review

An independent agent that had not seen this scope reviewed the first draft against the v6.23 source (2026-10-20). It confirmed every line
number and code quote, the three callers and the absence of any other writer, every §0.2 figure (rerunning both probes; the tables came out
byte-identical), the irreversibility, the 1 January retirement date, that no engine reads a row's `phase`, `note` or `deductible`, and that the
v6.21 car migration cannot be tripped by a re-dated table. It made 13 findings, all taken:
1. An unedited save also changes the portfolio (as-of date; `contribPreTaxA` $2,500 → $0), so the first draft's test B and "nothing moves"
   claim could not hold — restated with the portfolio held fixed (§0.2 ⚠, §1, §3 B, §4). *Confirmed this session by reading the stored
   portfolio.*
2. The headline monthly figures and D-43 were missing — added (§0.2). *Confirmed: $8,170 → $10,810; wizard $7,000 → $13,500.*
3. The direction list misfiled the Car Payment and missed three pieces — corrected (§0.2).
4. `buildExpenses`' other normalisations were unlisted, so "field for field" would have failed or quietly narrowed — listed and decided (§0.4, §1.1, §3 A).
5. Cents would need six display sites and break the integer-amount note — DC-5 reframed.
6. The retirement year in the editor is the saved plan's, not the live field's — DC-2 reads the live field (§0.4, §1.2, §3 C).
7. Edge cases (retirement this year or earlier; spouse B later; the wizard's as-of start) — specified (§1.2, §1.3, §3 C–D).
8. "Closes D-54" overclaimed — narrowed to new wizard plans (§1.3, DC-3).
9. Each decision now states its direction; DC-4 gained (c).
10. L4027 and L207 added to §0.1.
11. Irreversibility sharpened: no exported backup keeps the months; v6.23 drafts carry re-dated rows (§0.2).
12. The Field Manual overclaims "start and end dates" — added (§0.5, §1.6).
13. `monthlyAt` feeds the Ask AI EXPENSES line; layout suites `t45` and `t48` — added (§0.4, §2, §3).

---

## 7 · Build record (v6.24, 2026-10-20)

**Built as decided.** All five decisions are as recommended. The premise held: nothing at the build contradicted §0, and the shape is §1.
- **Source:** `7efbd69b…` before the build review, **`2ff32ac0792535e62510afe3d881b5fb`** after it.
- **Built page:** `8663f198ed4ff2c8153fe3414be1a097` (vite 5.4.21, `npm ci`; v6.23 rebuilt byte-identically to `34455a91…` on the same tree).
- **`smoke_built`:** 22/22.

**Delivered differently from §3, stated.**
- §3 A's "every fixture table": the fixture households (`qa/tools/fixture/households.mjs`) carry no expense table of their own — `build()`
  copies the example's portfolio and overrides one thing. So A-10 runs Save & Apply on each household with the example's table. None of
  them changes the retirement year, so the normalisation that reads it (a one-time row's phase) is covered by A-7e, not by A-10.
- §3 A's paths: Export Backup, the draft and its restore run on the example; the leave dialog on the backup table; the second save on the
  example. The car rows are checked by their dates only.
- §3 B's v6.23 leg pins the table spending, the headline figure and that Engine D's schedule moves. It does not pin the −$89,825 or the
  Monte Carlo moves, which §0.2 measured and the build review re-measured independently ($1,716,664.29 → $1,626,839.79).
- §3's "leave-dialog Save" found D-59 (§8).

**The build review** was done by an agent that had not seen the build (2026-10-20). No blocker. Its 15 findings, and what was done:
1. A stored date with no two-digit month (`"2029"`, `"2029-4"`) lost its year on save. **Fixed:** `_ymOf` keeps the year, and an unedited
   date is now written back verbatim (`_keepDate`) — a day (`"2026-03-15"`) included, which finding 9 raised. Tested by A-7g, controls C19
   and C20.
2. A text amount (`"100"`) was kept as text, and the engines add it as text. **Fixed:** only a finite number is kept; text is saved as the
   number. Tested by A-7h, control C21.
3. A-4b compared the draft with the table just saved, so control C1 reported MISSED. **Fixed:** it compares with the table as loaded.
4. Older wizard plans were said to be disclosed in the footnote and Field Manual; neither said so. **Fixed:** a footnote sentence and a §13
   clause. Tested by E-1b and E-8, controls C23 and C24.
5. The CHANGELOG claimed a manifest correction not yet made. **Made** at packaging (the archive's row).
6. TESTING, the CHANGELOG and `t87`'s header overclaimed which paths run on which tables, and `t87` said the fixtures vary the retirement
   year. **Reworded** to what runs. The draft's restore was not driven; it is now (A-4c/A-4d, control C25).
7. The month-aware preview was untested. **Tested:** C-11/C-11b (a July row is not in June's figure), control C18.
8. §B adds no evidence on v6.24 beyond A-1/A-8. **Stated** as such in TESTING and the CHANGELOG.
9. Normalisations no document stated: a missing `deductible` key was added, a day cut off, *Future Home Life* renamed, a one-time row's
   phase overwritten. **Fixed** the first two (verbatim dates; no `deductible` key unless the row had one or the box is ticked). **Stated**
   the other two in METHODOLOGY and the code comment; no engine reads `phase`.
10. A half-typed retirement year (`"203"`) drove the defaults. **Fixed:** outside 1900–2200 the saved plan's year is used. Tested by C-12,
    control C22. The horizon the defaults use is the saved plan's: **stated** in METHODOLOGY, and recorded with D-56.
11. The wizard with its retirement-year field cleared stores `"0-01"`. It is charged from now, as v6.23's `"-07"` was. **Recorded** with
    D-56, not fixed.
12. If the leave dialog's save were rejected, the draft would already be gone. Not reachable with the editor's own output. **Recorded** as
    D-59's residual.
13. Two copy points. **Fixed:** the footnote no longer says a one-time cost is "charged in the month you set" (the year-by-year tabs charge
    it in its year), and D-59 no longer says the user was "told" the work was saved.
14. Three cosmetic points (an archive table row, `t33`'s comments, `runsuite.sh`'s t87 comment). **Fixed.**
15. The suite counts came from an older `t87`. **Re-run** on the final files (the CHANGELOG's figures).

The source changed after the review, so the review's verified items were re-checked where the change reached them: the D-59 probe in
Chromium, `smoke_built`, the full suite, the controls, and the packaged copies.

**Verified.**
- **The suite from the packaged copies:** 8,548 app checks across 86 app suites, 0 failed, 0 DIED; MC parity 10/10; GRAND 8,678. `t87`
  runs 73, and 43 on the v6.23 leg. Of the counts that moved, `t86` 58 → 44 is its designed pair skip, and `domdiff` 35 → 32 is its v6.23
  arm retiring.
- **Controls** (`qa/tools/controls_v624_months.py`): 26 of 26. C17 was MISSED on the first full run (§8) and was re-aimed at A-9d.
- **Chromium on the built page:** the leave dialog saves and lands on the dashboard; with the draft landed first, the save clears it.

---

## 8 · Addendum — D-59, found at the build: the leave dialog's save saved nothing

**What was found.** §3 A asked for the leave dialog's Save to be driven. Writing that check (`t87` A-9) found the button
**SAVE & APPLY, THEN LEAVE** stores nothing. Its handler ran `setActiveTab(t)` and then, in a 40 ms timer, `MYDATA_SAVE()`. Changing tabs
unmounts `MyDataEditor` (`{activeTab === "mydata" && <MyDataEditor …/>}`), and the editor's effect cleanup sets `MYDATA_SAVE = null`, so the
timer found nothing to call. Both lines date from v5.9.2 (`git log -S`). Nothing in the suite had pressed this button; `t4`'s GUARD checks
press **DISCARD & LEAVE**.

**Verified on the shipped page, not the harness.** Chromium (Playwright) on the live v6.23 `index.html` (md5 `34455a91…`), the example
loaded, one expense label edited:
- the tab's own Save & Apply stored the edit, and My Data showed it on return (the control);
- the dialog's button stored nothing: no portfolio or expense key was written, the dashboard kept the old plan, and the edit was gone on
  return;
- with the draft autosave landed first (3.5 s after typing), the edit came back only through the recovery banner.

Same result on the v6.24 build before the fix.

**Decision.** Steve, 2026-10-20: *"Fix it in v6.24 (Recommended)"*. The other option was to file it and fix it later.

**The fix.** One line. The handler now:
1. sets the remembered tab to the target (`onTabChange(t)`);
2. calls `MYDATA_SAVE()` at once;
3. closes the dialog and switches tabs.

Step 1 was not in the first fix. A save remounts the app on the remembered tab (`lastTab`), and the effect that records a tab change runs
after the remount is queued. So the first fix saved, then landed back on My Data. ⚠ **Owned:** `t87` passed that build, because A-9
checked only the stored table. The Chromium check of the built page found it (`active tab: MY DATA`). A-9d and control C17 now pin the order. A-9d is an AST check — the remembered tab is set, then
`MYDATA_SAVE` is called in the handler, not in a timer. A behavioural check cannot do it in the harness: jsdom's `act()` flushes the effect
that records the tab before the remount, so A-9b (the landing) passed on the first fix too, and C17 aimed at it was MISSED. Chromium on the
built page is the behavioural evidence; no browser suite drives this dialog.

Re-checked in Chromium on the final build:
- the edit is stored and the app lands on the dashboard;
- with the draft landed first, the save clears it: no recovery banner on return.

**What ships with it.**
- `t87` A-9 on both legs (the v6.23 leg pins *"stores NOTHING"* with its own date tag), A-9b (the landing tab, as jsdom sees it), A-9c/A-9d (the handler's order, by AST) and E-8b (the Field
  Manual sentence).
- Controls C15 (the old timer restored, A-9 red), C17 (the remembered tab not set, A-9d red) and C16 (the sentence removed, E-8b red).
- A MissingFeatures row and write-up (D-59, filed and closed).
- A Field Manual §13 sentence and a CHANGELOG line.

METHODOLOGY is unchanged: nothing modelled moves.

**Siblings: a parser census, not a reading.** A session probe parsed the source with acorn. It found every top-level `let` that some
function sets to `null` — a registered channel that an unmount unregisters. There are three: `POST_PAYMENTS`, `MYDATA_SAVE` and
`STATE_CARRYOVER`, read at 28 sites in all. It then checked whether any read sits inside a deferred callback (`setTimeout`,
`setInterval`, `requestAnimationFrame`, `queueMicrotask` or a `.then`):
- v6.23: **2 of 28** — both `MYDATA_SAVE` at L7626, the defect;
- v6.24: **0 of 28**.

`MYDATA_DIRTY` is reset to `false`, not `null`, so it is outside this census. It is read at the moment of the click, by the tab guard.
