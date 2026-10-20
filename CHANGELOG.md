# Changelog

## v6.22 — a new plan keeps no one else's facts: the example's master prompt, income and expense table (D-53)

**A MODELLING release** — METHODOLOGY gains *A plan's facts are its own (v6.22)*. `docs/SCOPE_D53_PROMPT_V622.md` (repo-only, fulfilled):
Steve, *"let's go with d-53"*, then DC-1 *"Facts + clear"*, DC-2 to DC-5 *"All as recommended"*, DC-6 *"Pay none, say so"*, DC-7 *"Refuse
the backup"* — all (a); DC-8, found by the build's review, *"Close it"* — (a). Built on v6.21 (source `f7802df1…`).

**What was wrong (v6.21, measured).** The register said a new plan with no state was taxed as the example's Florida. It was wider. The
example household's facts — both dates of birth, its plan-to ages (80, 87), its retirement year, Florida at 0%, its home ($450,000, a
$120,000 mortgage at 4.25%) — lived only in its master prompt, and every reader fell back to the master prompt: the plan timeline, My Data's
starting values, the Ranking tab's home and net worth, and Ask AI, whose system prompt begins with it. A load that brought no prompt kept the
one already held — the example's at the landing screen. So a Start Fresh plan was the example's household in every timeline fact and its
home; a guided-setup plan took its Florida (state step skipped) and its home; one Save & Apply stored them as the plan's own, and the state
name has no input to retype. The guided setup run from My Data, or a backup without a prompt, kept the previous plan's prompt the same way
(measured: an Oregon plan, then a blank load, read Oregon), and Start Fresh over an unreadable stored plan left its prompt key behind.
**Siblings, same mechanism:** a plan with no Social Security or pension figure was paid the example's $3,300, $1,300 and $400 a month, the
warning banner firing only while a prompt was held (so the fix above would have silenced it); a backup with no expense table kept the table
already held (the example's 35 rows at the landing screen).

**What changed.**
- **The example describes itself (DC-1 (a)).** `DEFAULT_PORTFOLIO` carries the ten facts as fields, each equal to what the app's own parsers
  read from the demo prompt (`t85` B-3 computes them live).
- **A load without a prompt holds none**, the example's own path holds the demo (set by the loader, not left to what was held), and
  storage keeps what memory keeps: the six plan-loading callers pass the loader's result, `""` deletes the key, an omitted argument leaves it.
  The name extraction and the Social Security parse read the loader's result too.
- **DC-8:** the example's own text arriving with holdings that are not the example's — a key v6.21 could leave in storage after *Load sample
  data* then the guided setup or an import, or an old backup — is not taken, and a stored key of that kind is dropped.
- **My Data names what is not entered (DC-2).** A placeholder date of birth or retirement year starts blank, and a notice says what the
  model uses meanwhile: born September 1963 / March 1966, retiring 2029, planning to 90 (the timeline's placeholders, not the example's).
- **No state, said plainly (DC-3)** on the Taxes tab (footnote and labels), the Roth tab's rules box and My Data's state control. No sentence
  points at a master prompt any more — the 0% footnote, the Roth header, the Survivor tab and Ask AI's preview were reworded.
- **The Field Manual (DC-4)** says what Ask AI is sent (§09), what the banner now means (§04), and what changed (§13). The finding that the
  demo prompt's ground rules reach only the example is filed as D-55.
- **A plan saved earlier with the example's facts is told so (DC-5)** in My Data — dates and plan-to ages, home, or Florida with no state
  chosen — when its holdings are not the example's. Nothing is changed.
- **Income a plan never entered is paid $0 (DC-6)**, named by the banner whether or not a prompt is held; a flagged block a past load stored
  is zeroed.
- **A backup with no expense table is refused (DC-7)** with a plain message; an empty table is accepted.

**What it moved.** **The example: nothing** — all ten `t2` fingerprints byte-identical (parity 10/10, no intended difference declared), the
Withdrawal tab byte-identical and the Taxes and IRMAA year-tables figure-identical (`domdiff`), its My Data, Ranking and Roth values
unchanged; the one change on its tabs is the 0% footnote's wording. A plan saved through My Data: nothing (it keeps what it stored; DC-5
names example facts). A Start Fresh or guided-setup plan from v6.21 or earlier never saved through My Data, on its next load: a Start Fresh
plan's dates of birth become the placeholders and its plan-to ages 90 / 90 (from 80 / 87 — a longer horizon, the conservative direction);
either loses Florida for no state (0% both ways); the Ranking tab's home becomes its flagged fallback. A plan missing an income figure (a
hand-made or old backup) is paid less.

**Found and filed, not fixed** (MissingFeatures): **D-55** — Ask AI's ground rules (*"Educational Only … do NOT recommend target asset
allocations or specific securities"*) reach only the example. **D-56** — example-valued defaults that remain: the as-of date when a plan has
none, Spouse B's claim age 63, the 2029 placeholder, the Roth tab's 5-year-rule lines. `ARCHITECTUREIssues.md` **E-32** — two dead load
paths (`handleReload` with `STATE_CARRYOVER`; the landing screen's file statuses).

**Tests.** New suite **`t85`** — **53** on v6.22, **48** on v6.21 (that leg pins each defect as a dated `[KNOWN DEFECT]`).
§A the loader: Start Fresh, both guided-setup routes, a backup without a prompt, a prompt cut at the cap, both example paths, a non-string
prompt, DC-8. §B by AST: the loader writes the prompt on every path, `saveToStorage` deletes for `""` and every plan-loading caller passes
`MASTER_PROMPT`, the ten fields equal the parsers' reading of the demo prompt (each parser asserted to match), no getter or insert reads the
example's income. §C the pair: the example's timeline, income and prompt the same at both. §D rendered: a first visit and Start Fresh (My
Data blank, the notice, Save & Apply storing none of the example's facts, a reload), the no-state wording on three tabs and a manual rate,
Ask AI's preview before any save, a stored Start Fresh plan reloading with placeholders, a pre-v6.22 example still whole (no migration), an
unreadable stored plan under Start Fresh and *Use example data*, the DC-5 notice, DC-8 from storage, the income banner, backups (a non-string
and an over-long prompt, no expense table, an empty one). §E income: blocks without amounts, absent, absent from the form, flagged and
stored, and the example.
**Existing suites.** `t37` A6-4 / A6-6: a non-string prompt is still rejected, and the plan then holds none (it was the previous plan's).
⚠ **`t20`** had declared `incomeSources: {}` since v5.37 and so ran on the example's inserted income without saying so; DC-6 made that $0,
and the fixture now states the same amounts — every `t20` figure unchanged on both legs. `t29` gains the `demo_prompt` census row (OPERATIONS
§K1: on the example the held prompt is its own, so a leak cannot be seen there; ON on both legs) and C-prompt-1; `t33` PINS gains `v622`
(unchanged, confirmed by running); `t84` G-3's name. `t84`'s §B/§C (the v6.20 → v6.21 pair) take their designed skip in a run folder without
the v6.20 source, as `t83`'s did at v6.21: 51 on both legs (63 → 51).
Controls `qa/tools/controls_v622_prompt.py` (repo-only): **24 of 24 as expected** — the loader's old rule, the example's path not setting the demo,
the key never deleted, Import storing the raw argument, a field drifting from the demo prompt, a parser defaulting again, My Data pre-filling
a placeholder, either notice never shown or shown on the example, each no-state sentence back, each income getter and insert back on the
example, flagged blocks not zeroed, the banner keyed on a prompt, a backup without expenses accepted, the guided setup's save omitting the
prompt, DC-8 off, and the unmutated run; every file restored and hash-checked.

**Independent reviews.** The scope was reviewed before Steve saw it (22 findings, recorded as 16 in its §6, all taken: the income banner DC-1 would have silenced,
the expense carry-over, the wording sites, the storage design, tests that could not have passed as written). The build was reviewed by an
agent that had not seen it (18 findings): it confirmed the loader, storage, fields, parsers, notices, income, the refusal, the Field Manual,
the four version sites and the registrar's tags, and found **DC-8** (asked and decided), the inserted Spouse B block's claim age moved
63 → 67 against the scope's own out-of-scope list (reverted), three more master-prompt sentences, and stale comments and names — all fixed.

⚠ **Owned.** (1) The scope's §0.9 said only an old backup could carry the demo text beside another plan; a stored key could, reachable in
the app at v6.21 — the build's review found it, and DC-8 closes it. (2) The first build changed the inserted Spouse B block's claim age, which
the scope had put out of scope; reverted. (3) `t85`'s first draft read the example after other plans in the same module, which the app never
does (the landing's *Use example data* is only reached on a fresh page), and its D-7 pin on the v6.21 leg was `true`; both fixed before the
run counted.

**Registered:** `v622` by AST (366 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand.
`runsuite.sh` runs `t85` on both legs.

**Suite, run from the packaged copies:** **8,339 app checks across 84 app suites** (the eight `-spend617` and seven `-table620` attribution runs included), 0 failed, 0 DIED; MC parity 10/10 (no intended difference); tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 8,469**. Per-suite counts are `TESTING.md`'s v6.22 line; against v6.21's line the counts that moved are `t29` 85 → 88 (the `demo_prompt` row), `t84` 63 → 51 (the designed skip above) and `t85` is new (53; 48 on the v6.21 leg); every other current-leg count is unchanged. `domdiff` 41 → 32: its v6.20 → v6.21 arm does not apply to this pair, and on v6.21 → v6.22 every compared table is identical.

**Limitations, disclosed** (METHODOLOGY *Simplifications, stated*; Field Manual): the placeholders remain the engines' values until a fact is
entered; the example is recognised by its holdings; D-55 and D-56 above.

**Provenance.** v6.22 · source `88d476c346ecb76bfe522487eb1b582e` · built `index.html` `5aaca5ba443a94faa4a8582ebd6d96b0` · `smoke_built` 22/22. Suite run from the packaged copies
(`mk_runfolder.sh v621 v622` on a clone with the package applied): 8,339 app checks across 84 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 — GRAND 8,469.
Controls 24 of 24 on a copy of that run folder, every file restored and hash-checked. `package_check` on the package, a fresh clone, the workspace and the live pool: every pre-upload check
green (J-1, J-2, K-4 and K-6 wait for the upload); against a simulated post-upload pool and a clone carrying the commit and the mode fix, green
except H-1 to H-3, which fetch the live repo. `package_check_controls` (pre-ship clone, simulated post-upload pool, the prior clone set, an ops
package for P15): 66 behaved as designed, 0 did not, 1 skipped (P58–P61 need a handover package).

## v6.21 — a car is an expense row; the plan's own "after the payments end" figure, Stress benchmark and state line (D-42, D-43, D-47, D-50)

**A MODELLING release** — METHODOLOGY gains *Cars are expense rows (v6.21)*. `docs/SCOPE_D42_CAR_V621.md` (repo-only, fulfilled): Steve,
*"D-42+D-43, add D-47/D-50 (Recommended)"*, then DC-1 *"Expense rows"*, DC-2 *"Add visible rows"*, DC-3 *"No car rows"*, DC-4 to DC-7 *"All
as recommended"* — all (a). Built on v6.20 (source `8db22499…`).

**What was wrong (v6.20, measured).** The 30-year Monte Carlo bought **every** plan a $40,000 car (today's dollars, grown with the path's
inflation) in the March quarter of retirement years 8, 16, 24 and 32 — `AUTO_REPLACE_COST`, switched on in run C (with and without LTC
shocks), run D, four of the seven stress runs and the mortgage what-if — whatever the plan's expense table said (D-42). It was not in the
planned path the guardrails steer by, so each car year pushed every path down against a line that did not move; the 6-year runs, three stress
runs and Engines A–D never saw it; a household that entered its cars as expenses paid twice where it did. The Field Manual called it "a fixed
example schedule". Six displays on the Income and Social Security tabs subtracted the example's $400 car payment from every plan's spending
("Post-car shortfall", "car paid off") (D-43). The Stress tab's 30-year table measured the median against `household × 1.04^years`, a
benchmark that ignores withdrawals, and marked the example's median LOW in most later years under the preset a first visit opens on (D-47).
The mortgage what-if told every plan its interest "isn't deductible for you (standard deduction + no FL income tax)", and the Roth tab's rules
box said "Florida — no state income tax" to every plan (D-50).

**What changed.**
- **A car is a one-time row in the expense table (DC-1 (a)).** The constant and the `autoReplace` option (sixteen sites) are deleted; every
  engine charges a car only if the table holds one — the Monte Carlo in its quarter, inflated, on the planned path too; Engine D, Backtest and
  What Breaks in its year; the Taxes, IRMAA and Roth tabs through Engine D's draws. The example's table gains four rows, *"Replacement car"*,
  $40,000, March 2037, 2045, 2053 and 2061 (its retirement years 8, 16, 24, 32). Start Fresh and the wizard add none (DC-3).
- **A plan saved before v6.21 keeps the old schedule as visible rows (DC-2 (a)).** Loaded with its table and without the new `carRowsV621`
  field, it gains *"Replacement car (added by v6.21 — the model's old fixed schedule)"* rows from its own retirement year, from its as-of
  month through the as-of year + 35, in a new array; nothing is written until Save & Apply, which stores the table and the field. My Data and
  the Monte Carlo tab say which rows were added, that they now count on every tab, and that deleting them is the user's call.
- **The "after the payments end" figure is read from the table (D-43, DC-4 (a)).** The monthly total the month after the last monthly row
  running at the "after spouse B's Medicare" month that ends before the plan's last year; labelled with the row's name ("after Car Payment
  ends") or "after N payments end"; left out when there is no such row or nothing is spent after them. On the example: $7,620 from May 2034 —
  v6.20's figure.
- **The Stress tab's *Planned* column is the engine's own planned path (D-47, DC-5 (a))**, with the guardrails' own bands in the headers.
- **No Florida sentence for every plan (D-50, DC-6 (a)).** The mortgage what-if states the model's rule (no itemized deductions, so no
  offset); the Roth tab's line names the plan's state as the Taxes tab does — a state chosen in My Data, or else the plan's named flat rate.
- **The Field Manual** (honest limits, the Monte Carlo entry) says cars are rows and what changed; its spouse-B taper sentence is corrected
  (DC-7: any income stream turns the taper off — D-49).
- **What it moved** (3,000 paths, the same seeds; success above $500K | above $800K | median end, run C's shape): the example under
  BULL-LEANING 95.3% → 95.1% · 91.0% → 90.6% · $2,112K → $2,048K; under BASE 85.0% → 84.5% · 74.4% → 73.9%. A plan with no car in its table
  reads higher than v6.20 read it (BASE 85.0% → 88.6% above $500K). The example's other tabs see a car for the first time: the Withdrawal tab
  spends $49,657 more in 2037 (40,000 × 1.0274^8), its 2053 balance is $268,904 lower, lifetime tax $1,993 higher; no IRMAA surcharge
  appears. The 6-year runs do not move (no car falls in them). Full table in METHODOLOGY.

**Found at the build and filed, not fixed** (each outside the scope; MissingFeatures):
- **D-52** — My Data's editor keeps a row's years only: Save & Apply stores a monthly row January–December and a one-time row in June, so the
  first save re-dates the added cars (March → June) and widens the example's Car Payment to January 2029 – December 2034. Pinned in `t84`
  G-11 as a dated `[KNOWN DEFECT]`.
- **D-53** — Start Fresh, and the wizard with the state skipped, keep the example's master prompt, so a new plan that chooses no state is
  taxed as Florida (0%) and its Taxes and Roth tabs say Florida. It narrows D-50's closure. The scope's §0 had read this and not run it; the
  build ran it.
- **D-54** — the wizard ends its living-expense row in December 2079; a plan whose horizon runs past 2079 spends nothing in its last years.

**Tests.** New suite **`t84`** — **63** on v6.21, **21** on v6.20 (that leg pins the old car, the $400, the 1.04 column and
the Florida sentences as dated `[KNOWN DEFECT]` checks). §A by AST: the constant and option are gone, the rows are data, nothing subtracts
$400, no `1.04` power, the Stress table reads `plannedPath` and `GUARDRAILS`, the marker written at exactly four sites. §B: v6.21 on the
example equals v6.20 run on the same table with its own car switched off — both Monte Carlo engines and Engine D, bit for bit — and the
planned path pays the car. §C, the attribution: on v6.20's table (the four rows removed) v6.21 reproduces v6.20's Engines A–D, the bridge
and the Monte Carlo tax schedule bit for bit on four households, and Engine D's 2037 spending moves by exactly 40,000 × 1.0274^8 — computed
by hand. §D, the migration: rows and dates (from the plan's own retirement year), the already-retired and February/late-as-of edges, a plan with
the field and a load without a table gaining nothing, duplicates, the table passed in untouched.
§E: the D-43 rule against an independent oracle on the example, a single plan, a later horizon and six edge tables. §F: the Stress
benchmark (under BULL-LEANING the old column marks the median low in ≥ 10 years, the engine's path in none). §G rendered: the Income, Social
Security, Roth, Monte Carlo and Stress tabs; Georgia and a named flat-rate state; an old plan's notices, Save & Apply, the notices gone.
§H: the Field Manual and METHODOLOGY.
**Re-pins, each attributed** — the suite's `<suite>-v621-table620` runs (`DC_V620_TABLE=1`: the example's table without its four car
rows) reproduce every v6.20 figure: `t40` (A1, the Engines B–D lifetime RMD, A5, the W row), `t42` D-2/D-3, `t43` F-4, `t58` B-NC, `t71`
D-2/D-3, `t72` A-3/B-2, `t81` E-5 (Backtest's 1966 start $1.43M → $1.21M) and E-8 (What Breaks 1.40× → 1.35×). `t11`, `t12`, `t19` and
`t20`, whose subject is not spending, run on v6.20's table; `qa/tools/v617_spending.mjs` marks the portfolios it loads so the migration
cannot add cars to v6.17's table (it did, at first, and `t20` caught it). `t81` C2-1 and `t83` E-5/E-6 read the example's 2029 rows and the
new engine options. **Parity:** `t2` `INTENDED_DIFFS` gains `"v620→v621": ["extMC", "stress"]`; the six-year `mc` and the seven non-Monte
Carlo keys identical. `domdiff` gains a v620 → v621 arm: on the Withdrawal tab every schedule row before 2037 is byte-identical and every
row from 2037 is masked on both sides (the masked rows must differ, 2037's among them), with the two summary figures and the footer's count of
expense lines (31 → 35) set aside exactly; on the Taxes and IRMAA tabs every row before 2037 is byte-identical and 2037's differs. `t29`
gains the `car_rows` census row. `t48` G-1 found the one-time list's category column clipping "Transportation" on the new rows: widened to
the monthly rows' 110 px.
Controls `qa/tools/controls_v621_car.py` (repo-only): **17 of 17 as expected** — a car of the model's own restored, the rows out of the planned path,
a row charged uninflated, the migration a year short / from the as-of year / appending to the table passed in / ignoring the field, either
notice never shown, the D-43 figure back on `− 400` or ignoring the horizon, the Stress column back on 1.04 or its bands typed, the Florida
sentence restored, Save & Apply not writing the field, the Roth line ignoring the plan's named state, and the unmutated run; every file
restored and hash-checked. Their first run found two checks blind to their defect — `t84` B-4 (the planned path's car could be missing
while the car's tax still moved the path) and A-7 (the *Planned* cell back on `1.04` while `_pp` stayed declared); both were strengthened
and the controls re-run.

**Independent review** before shipping, by an agent that had not seen the work. Confirmed the extinctions, the migration's edges and that no
new plan migrates, the engine identity, METHODOLOGY's figures, D-43, D-47 and the four version sites. **Fixed from its findings:** the Roth
line's Florida for new plans (filed as D-53, D-50 narrowed); the My Data notice claimed the added rows "keep this plan's figures where they
were" — they now move every tab, and it says so; a $0 "after the payments end" figure (D-54); "2 payments ends"; the new figure not
restored when a load is rejected; over-claiming check names; METHODOLOGY's IRMAA sentence ("does not move" → no surcharge appears), its list
of runs and its D-43 sentence; D-52 widened to monthly rows; two controls added.

⚠ **Owned.** (1) The scope's hand figure for the 2037 car, **$49,656**, was a truncation of $49,656.54 — **$49,657** to the dollar; the
scope's own review confirmed it without catching the rounding, and `t84` C-3's first draft pinned it. Found when C-3 failed on its first
run; the pin is now computed by hand from the rate and the years, and the scope and METHODOLOGY are corrected. (2) The scope's DC-6 wording
for a plan with no state chosen rested on an incomplete premise — the example chooses none either; its Florida comes from its master prompt
— and as written would have stopped the example's Roth line naming the state the model taxes it in. The build followed DC-6's intent (the
line says what the Taxes tab says) and records the change in the scope's §7. (3) `t84` §G's first draft read the stored plan after "Use
example data", which stores none; it now writes the plan from the live one.

**Registered:** `v621` by AST (352 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS (unchanged, confirmed by running) and the three
Python suites by hand; `t2` `INTENDED_DIFFS`. The shim exports `POST_PAYMENTS`, `postPaymentsWhat`, `postPaymentsEnd`, `CAR_SCHEDULE_V620`,
`GUARDRAILS` and, for the prior leg, `AUTO_REPLACE_COST` (guarded). `runsuite.sh` runs `t84` on both legs and the seven `-table620`
attribution runs.

**Suite, run from the packaged copies:** **8,214 app checks across 83 app suites** (the eight `-spend617` and seven `-table620` attribution
runs included), 0 failed, 0 DIED; MC parity 10/10 (`extMC` and `stress` intended); tooling `t21` 64, `domdiff` 41, `sets` 12 + 12;
**GRAND 8,353**. Per-suite counts are `TESTING.md`'s v6.21 line; against v6.20's line the counts that moved are `t29` 82 → 85 (the
`car_rows` census row), `t83` 95 → 62 (§H and §R, the v6.19 → v6.20 pair, take their designed skip in a run folder without the v6.19
source — as `t82` did at v6.20) and `t84` is new (63; 21 on the v6.20 leg); every other current-leg count is unchanged. The run was
repeated after the controls strengthened `t84` B-4 and A-7, with the same counts.

**Limitations, disclosed** (METHODOLOGY *Simplifications, stated*; Field Manual): rows sit on calendar dates and do not follow the
retirement-year buttons; Engine D inflates a row from the retirement year, the Monte Carlo from the as-of date, so the same row reads
differently in each; no car financing is modelled; D-52, D-53 and D-54 above.

**Provenance.** v6.21 · source `f7802df1f14f52b0c2ca59ca898b0e9a` · built `index.html` `bbd56368ab21aee1b95b55c4aec94af1` · `smoke_built` 22/22. Suite run from the packaged copies
(`mk_runfolder.sh v620 v621` on a clone with the package applied): 8,214 app checks across 83 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 41, `sets` 12 + 12 — GRAND 8,353.
`package_check` on the zip, a fresh clone, the workspace and the live pool: every pre-upload check green (J-1, J-2, K-4 and K-6 wait for
the upload); against a simulated post-upload pool and a clone carrying the commit, green except H-1 to H-3, which fetch the live repo.
`package_check_controls` (pre-ship clone, simulated post-upload pool, the prior clone set): 66 behaved as designed, 0 did not, 1 skipped
(P58–P61 need a handover package). Run against the clone carrying the commit, P17 does not fire — that clone already holds the file the
control removes, so the omission it plants cannot be seen there; it is a pre-upload control, and fires pre-upload.

## ops 2026-10-19 (second) — every qa/ file leaves project knowledge

**KIND: ops** — documents and tooling; **v6.20 stays current** (source `8db224990e86ddcbe2180f96b6a52889`, built `2a0b45ea9c1425752ff8918862e15202`).
No app source, suite logic or figure changes. The morning's trim left the meter at **1,816,951 of 2,000,000** (142 files); about half of it
was test and harness code that no session could run from the pool. `docs/SCOPE_UNPOOL_QA_CODE.md` (repo-only, now FULFILLED): Steve took
DC-1 to DC-4 as recommended, all (a) — every `qa/` file leaves, the hash table is archived, chat-only sessions accept losing the test files,
and it ships now, before v6.21.

**What changed.**
- **126 files leave the pool** — every pooled file under `qa/`: the 83 suites, `runsuite.sh`, `mk_runfolder.sh`, the harness and shim, the
  DOM entry, the fixtures, the oracles, the tools, `package_check` and its controls. 2,737,596 characters. **Pool 142 → 16**: the source,
  eleven documents and the four build-scaffold files. Each leaving file is declared `RETIRE:` in the package's manifest.
- **The manifest's test and harness hash table** moved verbatim to `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md` (repo-only); a new
  *Pooled file hashes* section keeps the ten pooled files' rows and the D-5 count block. Forty-five rows elsewhere that name a departing
  file are marked repo-only (K-12's vocabulary).
- **Every departing file's description** (118 hash-row descriptions: 83 suites, 35 harness and tool files) moved verbatim to `TESTING.md`,
  *Every suite and harness file* — see the correction below.
- **OPERATIONS:** §A2 (the suite comes from a full clone; the fallback table covers pooled files only), §G (*qa/ is repo-only*), §C4 (the
  traps and rules that lived only in suite comments), §L (`knowledge/` carries no `qa/` file), and the rotation notes (no dom entry is pooled).
- **`package_check`:** **B-4** fails a package that ships a `qa/` file to `knowledge/`; **J-6** fails a post-upload pool that still holds one
  (pre-ship, every one still there must be declared `RETIRE:`). A name is a qa file when every repo path with its basename lies under `qa/`,
  plus the dom-entry family and the two renamed pool names. J-4 (exactly one dom entry) is retired. K-12 reads *Pooled file hashes*. The OPEN
  allowlist entry for the scope is removed, as its own expiry note required.
- **`package_check_controls.sh`:** P76 and P77 (B-4 fires on a suite and on a dom entry in `knowledge/`), P78 (B-4 stays silent on
  `README.md`, `package.json` and `index.html`, which also exist outside `qa/`); P71 re-pointed from J-4 to J-6; P32 and P33 retargeted to
  the files that remain, and P43 to P32's derived row; P44/P45 and P72 retired, each printing its reason (no `.py` file and no renamed file
  can be pooled now).
  `controls_manifest_rows.py`: C2's target (it named `sel_census.cjs`) is derived from the pool.

**The trace (OPERATIONS §G, for code).** The author read the open-thread keyword hits in all 126 files; **six independent readers then read
every file in full** and checked each candidate against the sixteen documents that stay. Their findings: the traps and standing rules that
no pooled document carried (Social Security through `.planned`, not `.amount`; `setPortfolio` does not rebuild the timeline; jsdom has no
`location`; `t10`'s cent tolerance makes a rate a boolean; `runsuite.sh` never runs an unlisted suite; `t31`'s literal METHODOLOGY keys; and
more) are **OPERATIONS §C4**; ten open threads and a list of stale statements are **`ARCHITECTUREIssues.md` E-31** (among them two TY2026
state bracket schedules read from a draft and from preliminary rates, and an oracle frozen at v5.69's Rhode Island model); `TESTING.md`'s run note
saying `t11`–`t16` and `t22` take no argument — the code says otherwise — is corrected. The hash table's own prose was traced line by line.

⚠ **Owned — a false premise in the scope, caught before the build.** The scope's DC-3 (a) said `TESTING.md` "describes every suite". It
does not: its per-suite table stops at `t30`, and `t31`–`t83` were described only in the hash table DC-2 archives. An independent reader
found it; the build stopped and asked; Steve chose to move the descriptions to `TESTING.md` verbatim. The question quoted about 39,000
characters for the suites; with the 35 harness and tool rows (several carried rules nothing else held) it is about 53,000. The scope's §0
also called the hash table a "test-hash table" while it held ten pooled files' rows (and decision D-3, a rule still in force, now restated
beside them), and missed seven controls that drew targets from pooled qa files — six in `package_check_controls.sh` (P43 among them, found running the
controls) and C2 of `controls_manifest_rows.py`, which the package's independent review found failing; all were corrected before the package
was cut, and its §6 records them.

**Estimated effect:** about 2.75 million characters out of the pool, net — roughly 91% → 41–46% of the cap (the unit per character varies
with content; the figure after upload is read from the listing).

**Verified by:** results in the package's `MANIFEST.txt`.

## ops 2026-10-19 — project knowledge trimmed (the fourth time); a scope for un-pooling the test code

**KIND: ops** — documents and one tool line; **v6.20 stays current** (source `8db224990e86ddcbe2180f96b6a52889`, built `2a0b45ea9c1425752ff8918862e15202`).
No app source, suite or figure changes. The project-knowledge meter read **1,920,823 of 2,000,000** after v6.20 (142 files). Steve: *"Let's fix
the size of the project knowledge pool"*, then *"Archive now, scope the big move"*.

**The moves** — each verbatim into a **new** repo-only archive with a §0 trace, each reassembling the committed file byte for byte (OPERATIONS §G):
- **CHANGELOG:** v6.00–v6.15, with the four ops entries between them, to `docs/CHANGELOG_ARCHIVE_v6_00_to_v6_15.md`; the pooled file holds
  v6.16 onward. 155,350 bytes.
- **TESTING.md:** the per-release write-ups to v5.40 (51 paragraphs from its opening section) to `docs/TESTING_ARCHIVE_release_notes_to_v5_40.md`.
  42,574 bytes.
- **The manifest:** the superseded ship notes and delete-first lists from v6.19 back to v6.04 to `docs/MANIFEST_ARCHIVE_notes_and_lists_v6_04_to_v6_19.md`.
  74,225 bytes.
- **MissingFeatures.md:** the write-ups of the 28 items closed or fixed by v6.20 to `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`; each keeps
  its index row. 64,456 bytes. Selected by the index's status column — a first pass by heading would have taken D-37, D-39 and D-44, whose
  headings say "DISCLOSED" — and never an ID the register's "Open, in this file" line names: D-18 is FIXED but recurs every tax year, so its
  write-up stays. Both caught before anything was cut.

**The trace.** Every line in the text leaving that reads as open was read in context. **Eight threads had no other pooled record.** The
author's trace found one — `t38`'s storage check (I-6) that failed once under load at the v6.15 build, its suspected cause never confirmed —
re-homed in `TESTING.md`, *Known gate defects*. ⚠ **An independent second read found the other seven before the package was cut**, and they
are `ARCHITECTUREIssues.md` **E-30**: D-12's re-homed residuals; the checklist's 401(k)-to-IRA rollover tip against Rhode Island's modification;
**AI-6, which model Ask AI uses — Steve's decision, open since v6.02**; the household with no holdings, never examined; the Ranking tab's
"the crowd you actually belong to"; v5.38's sales' gain outside NIIT and the state module (not re-verified at v6.20); and `t14`'s presence
checks. The same read found the CHANGELOG archive without a real §0 trace (added), a premise in the scope below overstated (corrected), and
dangling "see the box at D-n" pointers (now naming the archive). Each archive's §0 records what went where.

**Estimated effect:** about 319,000 characters out of the pool, net (the moves take about 337,000 bytes; the pointers, E-30 and this entry add some back) — roughly 96% → 90.5% of the cap (the listing's unit is about 0.345 per
character on this pool; the figure after upload is read from the listing). That buys a few releases, no more: half the pool is test and
harness code.

**The big move, scoped:** `docs/SCOPE_UNPOOL_QA_CODE.md` (repo-only; **decisions open**, DC-1 to DC-4) — every `qa/` file repo-only, the pool
keeping the source, the documents and the build scaffold (~43% of the cap). No build can run from the pool already: `mk_runfolder.sh` needs the
repo's tree (`src/`, `qa/qa-baseline/`, `qa/tools/fixture/`), which the flat pool does not have. `package_check`'s OPEN allowlist gains the scope, with its expiry stated.

**Verified by:** results in the package's `MANIFEST.txt`.

## v6.20 — the Monte Carlo pays the Taxes tab's tax, and charges one-time expenses in the quarter they fall (D-40, D-44, D-45)

**A MODELLING release** — METHODOLOGY gains *The Monte Carlo pays the Taxes tab's tax (v6.20)*. `docs/SCOPE_D40_MC_TAX_V620.md` (repo-only,
fulfilled): Steve, *"let's do D-40, making the Monte Carlo pay the Taxes tab's tax. And fold in D-44 and D-45"*, then *"Let's continue with
your recommendations"* on its ten decisions — all (a), the first being to fix the quarter calendar first (v6.19). Built on v6.19's calendar.

**What was wrong (v6.19, measured).** The only income tax either Monte Carlo engine charged was a flat **$4,000 a quarter**
(`ROTH_TAX_DRAG_Q`), never inflated, through the Roth ladder's last year — whatever the plan converted or owed — and **nothing after it**, RMD
years included (D-40). On the example that is $192,000 nominal over 2029–2040 against the Taxes tab's $214,590 in today's dollars over
2029–2053; for a larger household it is far wider (the example's holdings ×1.6 in Georgia: $369K), and the conversion slider never reached
the Monte Carlo at all. The
Income tab showed it as "Roth conversion tax drag · ~$16K/yr · $4K/quarter modeled in MC sim". Both engines read the expense table at each
quarter's last month, so **a one-time row dated in any other month was never charged** (D-45 — the example's April 2029 golf cart and closing
costs, $28,000), one that was charged was charged in today's dollars beside inflated monthly rows (D-44, the Monte Carlo half), and a monthly
row starting or ending inside a quarter was counted for the whole quarter. **Optimistic for most plans.**

**What changed (DC-1 to DC-9, all (a)).**
- **One tax schedule** (`mcIncomeTaxSchedule`): the Taxes tab's `totalTax` — federal, capital gains, NIIT, AMT, payroll tax on job income and
  state — year by year, computed exactly as the Taxes tab computes it, at the **live conversion slider, QCD and dividend yield** (DC-1) and the
  selected preset. Both engines pay a quarter of each retirement year's tax, **grown with each path's inflation** (DC-3 — conservative: the
  parts from nominal RMDs and gains are grown twice), and the last row's tax past the schedule's end (DC-4). Nothing before retirement. The
  flat drag is deleted. IRMAA is not added (DC-2).
- **One quarter read** (`mcQuarterSeries`), built once per run: one-time rows summed over the quarter's months — charged once, in the quarter
  that contains their month, grown with inflation (D-45, D-44) — and monthly rows averaged over them, so a row counts only its own months
  (DC-6). A year's four quarters add up to `tableYearExpense`, the year Engine D, Backtest and What-Breaks spend.
- **Moving the slider, QCD or yield re-runs the 6-year runs** about 300 ms after the control settles, on any tab (the header shows "…"
  meanwhile); the 30-year runs, the stress set and the mortgage what-if re-run when their tabs are next opened. The engines take
  `opts.taxInputs` or a precomputed `opts.taxSchedule`; `runExtendedMC` returns its planned path.
- **What the user reads.** The Income tab's card is "Income tax the Monte Carlo pays" — the schedule's first year at the slider's value. The
  Monte Carlo tab and the Field Manual (Monte Carlo entry, dated v6.20) say what the tax is, that it is the same on every path, what it leaves
  out, and how one-time expenses are charged; the Withdrawal entry and Backtest's comparison say what the Monte Carlo does from v6.20.
  What-Breaks names the engine its tax estimate comes from (the Roth tab's strategy engine — it said "the Taxes engine"), no longer says it
  "does not model taxes", and no longer credits the Monte Carlo with IRMAA (DC-8). No in-app notice (DC-9).
- **It moved the Monte Carlo's figures, downward on every household measured** (v6.19 → v6.20, 3,000 paths, the same seeds; a 6-year
  success rate already near 100% can read the same): 30-year success
  above $500K under BULL-LEANING, the preset a first visit opens on, 0.7 to 4.0 points lower — the example 96.8% → 95.3%, median $2,299K →
  $2,118K; above $800K under BASE 1.9 to 8.9 points lower — the example 80.3% → 74.4%. The 6-year figures move least. The slider now matters:
  the example reads 94.9% at $0 and 94.3% at $150K. Engines A–D (the Withdrawal, Taxes, IRMAA and Roth tabs) do not move.
- **Faster:** each run reads the expense table once instead of once a quarter on every path — the three 6-year runs take 0.32× v6.19's time.

**Tests.** New suite **`t83`** — **95** on v6.20, **15** on v6.19 (that leg pins the old behaviour as dated `[KNOWN DEFECT]`
checks: the flat drag, an April row never charged, a June row charged uninflated, the Income card's $4K, the Field Manual's and What-Breaks'
sentences). §A: the schedule equals the Taxes tab's row **exactly**, every year, on every fixture household, BASE and BULL, sliders $0 / $70K /
$150K, QCD and yield set. §B: both planned paths move by the compounded tax series to 1e-6, with a **hand pin** of the example's first two
retirement quarters computed independently in exact decimal arithmetic and matched to the cent (from the engine's 2029 row, so it checks the
inflate-and-grow arithmetic). *Owned:* the first draft of these pins, and of the new `t42` D-4 figure, was written before measuring and
was wrong ($12,935.95 for the 2029 row; $2,076,914); the suite caught both on its first run, and the pins were then computed by hand and
checked against the engine — not copied from it. §C: a $10,000 one-time row in every month of a
pre-retirement and a retired year is charged once, in its own quarter, × that quarter's inflator — exact on both planned paths; a row dated
before the as-of month is never charged. §D: four quarters add to `tableYearExpense`. §E by AST: the drag is gone, neither engine reads the
table except through `mcQuarterSeries`, and every subtraction from the portfolio in either engine is one of seven named outflows. §F: the tail,
the timing, stochastic longevity. §G: the slider, the state and the QCD move it; tax type and plan type do not with the schedule held fixed —
and do, with a control, when it is computed from the plan. §H: Engines B, C and D bit-identical, and **an ORACLE MODULE built from the v6.19
source with the drag at $0 is bit-identical to v6.20 with a zero schedule** on a quarter-aligned table — both engines, the stress set, every
household for the engines and the example and single household for the stress set: the release changes the tax, the one-time rows and the
quarter read, and nothing else; by AST, every engine call in the app carries the live schedule and the effects re-run on it. §R: the re-pin's
attribution, every step exact (the quarter read derived, not only measured). §I rendered (the slider moves the card). §J: METHODOLOGY.
**Parity:** `t2`'s `INTENDED_DIFFS` gains `"v619→v620": ["mc", "extMC", "stress"]`; the seven non-Monte-Carlo keys identical.
**Re-pin, with its attribution:** `t42` D-4, the married example's 6-year planned path, $2,128,443 → **$2,083,910** — five steps, each exact
on the planned path, in the same run (`t83` R): the drag +$56,285; v6.19's charge of the April rows $0; the monthly quarter read −$375; the
one-time rows −$34,995; the tax −$65,449.
**Restated on their new footing** (premise false by design — the Monte Carlo now reads Engine B, which reads tax type, state, plan type and
the claim month): `t20`'s guards that the Monte Carlo and stress set do not move when tax types are permuted, `t56` F-1 / F-3's Monte Carlo
median and `t82` G-1 / G-2 — each now with the tax schedule held fixed, `t20` with the converse (computed from the plan, they move) asserted.
`t81` C2-2 flips to fixed (D-45) and its C2-3 control is retired for `t83` C; `t81` E-6 and F-1 read the new Backtest and Field Manual copy.
`domdiff` gains a v619 → v620 arm masking the header's and retirement cards' Monte Carlo figures, each mask bound to a count, and asserting the
header's success rate differs.
Controls `qa/tools/controls_v620_mctax.py` (repo-only): **13 of 13 as expected** — the flat drag back at one site, the tax or the one-time rows
not inflated, the one-time or monthly read back at the quarter's last month, the engines or the app ignoring the slider, the tail charged as
zero, federal tax only in the schedule, the tax put in pre-retirement quarters, a 30-year run called without the schedule, the slider out
of the effect's dependencies, and the unmutated run; every file restored and hash-checked. **Independent review** before shipping, by an
agent that had not seen the work: its findings are fixed in this release — a control that could not fire (the engines also gate the tax on
retirement, so a schedule leaking into pre-retirement quarters changed no output; `t83` F-6 now checks the quarter read itself), no check on
the app's 30-year wiring (`t83` E-6, E-7, controls C11, C12), the Income card naming the live slider beside the last run's figure, two
overstated ranges in METHODOLOGY, and the hand-pin slip above.
**Tooling:** `package_check`'s OPEN allowlist entry for `SCOPE_D40_MC_TAX_V620.md` is removed in this package, which marks the scope FULFILLED —
the two halves its expiry note required. **`package_check` B-2 strengthened:** it caught a built page in `knowledge/` only by byte comparison
with this package's own built page, so a different built page (the prior release's) passed; `package_check_controls` P48 plants exactly that,
ran on an app release for the first time here (until now it was skipped without a pool) and went NOT CAUGHT. B-2 now also applies its
size-free content marker (an inlined script bundle) whenever a `knowledge/index.html` ships. Changed after the suite run; `t21` re-run on the
changed file: 64 passed, 0 failed; `package_check_controls` against this package with a simulated post-upload pool: 65 behaved as designed, 0
did not, 2 skipped (P15 and P58–P61 need an ops or handover package — not this kind).
**Registered:** `v620` by AST (345 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand. The shim
exports the schedule and quarter-read functions, `ROTH_TAX_DRAG_Q` (for the prior leg), `BASE_GROWTH`, `getMonthlyExpense` and
`getOneTimeExpenses` (guarded).

**Suite, run from the packaged copies:** **7,871 app checks across 82 app suites** (the eight `-spend617` attribution runs included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 37, `sets` 12 + 12; **GRAND 8,006**. Against v6.19's line the counts that moved are `t20` 100 → 102 (the restated guard's converse, two checks), `t81` 78 → 77 (C2-3 retired for `t83` C) and `t82` 105 → 59 (§C, §D, §H and J-3, the v6.18 → v6.19 pair, take their designed skip in a run folder without the v6.18 source — as `t81` did at v6.19), and `t83` is new. Every skip line read: each is a designed pair-pinned skip (`t65`, `t70`–`t72`, `t75`–`t83`), and `t83` takes none on the v6.20 leg (its four on the v6.19 leg are by design: no schedule there, no pair, no METHODOLOGY of its own). Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v619 v620` from a fresh clone of `21dd782` carrying the package as cut (79 files); the documentation was finished after the run (`CHANGELOG.md`, `TESTING.md`, its archive, `PROJECT_KNOWLEDGE_INDEX.md` and the scope's status line and build record — a run folder holds the source, `METHODOLOGY.md` and the built page, and `METHODOLOGY.md` was final). Source `8db224990e86ddcbe2180f96b6a52889` · built `2a0b45ea9c1425752ff8918862e15202` (`smoke_built` 22 passed, 0 failed); v6.19 rebuilt first from its own source to its published `d9e0df42…`.

**Limitations, disclosed:**
- The tax does not follow the path: one schedule, from the plan's own draws and life expectancies, is paid on every path — a path that cuts
  spending at a guardrail, draws more after a crash, or loses a spouse early pays the same tax.
- The Social Security cut toggle is not in the tax (it is computed on the full scheduled benefit); IRMAA is not in it (D-51); the home-move
  cash is not in Engines A–D (D-39).
- For a plan with no income streams, the Taxes tab taxes built-in part-time wages for spouse B, which the Monte Carlo does not credit —
  conservative, $14,479 on the example (D-49, filed for its own release).
- An expense row for income tax would be charged twice; the Field Manual says so.
- The Withdrawal tab still never sees a one-time row dated before the retirement year (D-44, narrowed).
- What-Breaks' tax is still the Roth tab's strategy engine's lifetime tax averaged per year.

**Registered:** D-40 and D-45 closed; D-44 narrowed to its Withdrawal half; D-49 (the spouse-B work taper), D-50 (the mortgage what-if's
Florida sentence) and D-51 (IRMAA not in the Monte Carlo) opened; D-47's entry corrected (it was not in this release's scope; the planned
path its fix needs is now returned).

## v6.19 — the Monte Carlo's quarter calendar (D-46)

**A MODELLING release** — METHODOLOGY gains *The Monte Carlo's calendar*. `docs/SCOPE_D46_MC_CALENDAR_V619.md` (repo-only, fulfilled). Found while
scoping D-40 (`docs/SCOPE_D40_MC_TAX_V620.md`, repo-only): Steve chose to fix the calendar first, in its own release (that scope's DC-0), and
then *"Let's continue with your recommendations"* on this scope's eight decisions — all (a). D-40, D-44 and D-45 follow as v6.20 on this
calendar.

**What was wrong (v6.18, measured).** Both Monte Carlo engines turned a quarter number into a date with one formula — quarter 0 was "June of
the as-of year" for every plan — and read the expense table, the one-time rows, the ladder's end, the trust-fund year and the income streams
at that date. But they decided when things happened by two other rules. The 6-year engine placed retirement and the claims at
`round(months from the as-of month ÷ 3)`: right for every event only with an as-of date in May (in April — the example's month — while no
event fell in a quarter's last month); for a plan saved in October it read its first retired quarters at September and December 2028, and the
setup wizard's plans (as of 1 January, June claims) had both claims a quarter late. The 30-year engine (runs A–D, the stress set, the
Dashboard, the mortgage what-if) counted quarters from **January** of the as-of year and never read the as-of month: its figures were
identical for every as-of date in a year, and for an April–June as-of date it retired, and paid each claim, a quarter late. The year 2026 was
typed into run A's length and label, the chart axis, the Stress tab's table and the longevity draws' current ages; the run headers said runs B
and C start at retirement (they start at the as-of date). **Optimistic for most plans' 30-year figures.** Never registered; filed as D-46 and
closed.

**What changed (DC-1 to DC-8, all (a)).**
- **One calendar** (`mcQuarterOf`, `mcQuarterDate`): quarter 0 is the calendar quarter containing the as-of date, each quarter is dated by its
  own year and last month, and an event falls in the quarter containing its date — retirement, spouse B's retirement and both claims, in both
  engines; `buildRetireOptions` and `buildPlanTimeline` use it. The two old quarter rules and five timeline fields nothing read are gone.
- **The first quarter counts only the months from the as-of month** (DC-2): contributions and the bonus, spending, income, the inflation step
  and the return scale by 3/3, 2/3 or 1/3. **A claim pays from its own month** (DC-3). The bonus falls in the January–March quarter.
- **The stress set's forced years are calendar years** (DC-4): "a crisis in the first year of retirement" covers the retirement year's four
  quarters; the random regime is still drawn every fourth quarter, forced or not, and ordinary runs are untouched.
- **A plan saved after it retired gets no home-move cash** (DC-8) — its balance already holds it; the two engines used to disagree.
- **The year comes from the plan.** Run A runs to the retirement quarter (`runExtendedMC` takes `totalQuarters`, records a final snapshot and
  annualizes over the real length); the chart axis, the Stress table and the longevity ages use the as-of year.
- **What the user reads.** The run headers and the tab's summary give the spans the runs model ("2026–2036 (10 years from your as-of date)");
  run A reads "2 yr 9 mo" on the example; run C's trajectory table, the Stress tab's table and the Guardrails tab's yearly table label each
  row with its quarter's true date ("Mar 2029 ◀ RETIRE"); the retirement cards count the Social Security gap in months; the Monte Carlo tab
  and the Field Manual (Monte Carlo entry, dated v6.19) say how the calendar works. No notice (DC-6). The Stress tab's `1.04^years`
  benchmark is filed for v6.20 (DC-5, D-47); runs B and C keep their spans from the as-of date (DC-7).
- **On the example** (as of 2026-04-18, January events) the 6-year run is **bit-identical**; the 30-year engine moves only by its four event
  quarters — 30-year success above $800K 81.0% → 80.3%, median $1,609K → $1,565K (BASE, at the scope). A plan saved in November moves to
  78.0% / $1,487K.

**Tests.** New suite **`t82`** — **105** on v6.19, **16** on v6.18 (that leg pins what is observable from outside as dated
`[KNOWN DEFECT]` checks: the as-of month ignored, the retirement balance stepping by quarters, the claim month rounded, the cash for a plan
already retired, the old label formula and the five 2026 sites). §A: the calendar against an **independent oracle written from dates** for an
as-of date in every month of two years and every event month, and `RETIRE_OPTIONS` and the timeline through the app. §B by AST: the old label
formula, the old quarter rules, the unread fields and the literal 2026 are gone from the machinery; both engines date, scale and pay through
the calendar. §C across v6.18 → v6.19: the 6-year engine bit-identical on every April household with first-month events, and a March claim as
the control that it discriminates. §D: the 30-year engine **bit-identical to an ORACLE MODULE built from the v6.18 source with its four event
quarters one earlier** (the `t80` §A builder) — runs B and C, stochastic longevity, sustained LTC and the mortgage what-if. §E: forced years
traced quarter by quarter (`runExtendedMC`'s test-only `regimeTrace`). §F, §G: the first quarter and a mid-quarter claim exact on the planned
path. §H: Engines B, C and D bit-identical. §I (the extinction): the planned balance at retirement falls every month by no more than a month's
contributions and return, for as-of dates across 2026–2027. §J: run A's length and average return, and 2027's longevity ages against the oracle
with 2027 in the age line. §L: no home-move cash for a plan already retired. §K rendered.
**Parity:** `t2`'s `INTENDED_DIFFS` gains `"v618→v619": ["extMC", "stress"]` — **`mc` identical**, and the seven non-Monte-Carlo keys identical.
**Re-pins:** none — no Monte Carlo pin moved (`t42` D-4, the 6-year planned path, held). `t33`'s PINS gain a `v619` entry equal to v6.18's (its Roth fixtures read no quarter).
Controls `qa/tools/controls_v619_calendar.py` (repo-only): **11 of 11 as expected** — the old label formula at one site, the 30-year retirement quarter from
January, a claim a quarter late, `round` back in the retirement options, the first-quarter and claim shares removed, 2026 back in the age line,
forced years by year-from-start, the cash for a plan already retired, the bonus on `q % 4 === 3`, and the unmutated run; every file restored
and hash-checked.
**Tooling:** `package_check`'s OPEN allowlist gains `SCOPE_D40_MC_TAX_V620.md` — decided and unbuilt, shipped here so Steve's ten decisions are on record; it expires at the v6.20 build, which must mark the scope FULFILLED and remove the entry together. I-2 named the scope on the first check of this package, as designed. Changed after the suite run; `t21` re-run on the changed file: 64 passed, 0 failed.
**Registered:** `v619` by AST (342 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand. The shim exports
the calendar functions, `RETIRE_OPTIONS`, `applyScenarioProbs` and `PROB_PRESETS` (guarded).

**Suite, run from the packaged copies:** **7,763 app checks across 81 app suites** (the eight `-spend617` attribution runs, 236 checks, included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 36, `sets` 12 + 12; **GRAND 7,897**. Against v6.18's line the counts that moved are `t81` 130 → 78 (§D, the v6.17 → v6.18 differential, takes its designed skip in a run folder without the v6.17 source) and, in tooling, `domdiff` 44 → 36 (v6.18's pair carried the v617 → v618 arm's masks; this pair's arm has four), and `t82` is new. Every skip line read: each is a designed pair-pinned skip, and `t82` takes none on the v6.19 leg. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v618 v619` from a fresh clone of `386bb87` carrying the package as cut (78 files); the documentation and the allowlist entry above were finished after the run (`CHANGELOG.md`, `TESTING.md`, its archive, `PROJECT_KNOWLEDGE_INDEX.md` and the two scopes' status lines — a run folder holds the source, `METHODOLOGY.md` and the built page, and `METHODOLOGY.md` was final). Source `35d3dcb436b7ad801b6c9588d5429cb0` · built `d9e0df4297fce9946417db5b9b322ee3` (`smoke_built` 22 passed, 0 failed); v6.18 rebuilt first from its own source to its published `d228f1d3…`.

**Limitations, disclosed:**
- Quarters stay the unit: an as-of date on the 28th counts its whole month, and the first quarter's return is scaled linearly.
- My Data dates a plan in UTC, so an evening save in the Americas on a quarter's last day falls in the next quarter (D-48).
- The Monte Carlo still reads one month per quarter for the expense table and charges a one-time row only in a quarter's (now true) last month
  (D-45, with D-40 and D-44 at v6.20). Its income tax is still the flat $4,000 a quarter during the ladder (D-40).
- The Stress tab's 30-year table compares the median with `household × 1.04^years`, which ignores withdrawals (D-47).

**Registered:** D-46 filed and closed; D-47 and D-48 opened; D-45's entry notes the true quarter-end months.

## ops 2026-10-18 — the v6.18 entry's provenance line

**KIND: ops** — documentation only; **v6.18 stays current** (source `208bf89d1bd83fc55d430f2eec60d202`, built `d228f1d3391231406848d2647cb97fec`). No app source, suite or figure changes.

The v6.18 entry shipped without its provenance line — the source and built-page md5s that end each release's suite line (OPERATIONS §G, from
v5.12) and that `package_check` H-1 and H-2 compare with the files the live site serves. So the post-ship check could not run them: it reported
50 passed, 0 failed and **H-1 skipped** ("the newest CHANGELOG entry carries 0 md5s"). Owned: the suite record was rewritten after the review's
corrections and the line was not carried into it; the simulated post-upload check before shipping skipped H-1 the same way, and its skip line
went unread because only the failure count was checked. A skipped check is not a passed one (`package_check` says so on every run). This entry adds the line to v6.18's suite record,
marked as added; `PROJECT_KNOWLEDGE_INDEX.md` rolls its CHANGELOG hash row. Verified by `package_check` on this package, and after the upload
with all four arguments (H-1 and H-2 must then pass, not skip).

## v6.18 — the Withdrawal tab spends the expense table at the plan's own dates, year by year (D-41)

**A MODELLING release** — METHODOLOGY gains *The Withdrawal tab spends the expense table year by year*. `docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md`
(repo-only, fulfilled). Steve, on the findings note `docs/FINDINGS-v6_17-fixed-plan-figures.md` (F-2): *"go"* to scope it first; then *"go"* on the
scope's six decisions as recommended.

**What was wrong (v6.17, measured).** The Withdrawal tab (Engine D), Backtest and What-Breaks spent the expense table as it stood in **June
2029** before spouse B's Medicare year and **June 2031** after it — the example household's dates, typed into the code — for every plan. So a plan on
any other calendar spent the wrong rows: the example with every date moved three years later spent $6,700 a month (a month that still held its
current home's costs and none of its retirement rows) where its own table says $8,170, then $8,020 — **$401K less lifetime spending and a $734K
higher ending portfolio** than its own table, read year by year, gives. A row ending after June 2031 was charged for life (the example's car
payment), one starting later never, and one-time rows never arrived. The Taxes, IRMAA and Roth tabs took Engine D's draws through the bridge,
so they inherited it. The Monte Carlo was not affected — it reads the table itself, once a quarter. Never registered; filed as D-41 and closed.

**What changed (DC-1 to DC-6, all (a)).**
- **One read of the table.** `tableYearExpense(yr, survivorFromYr)` sums a calendar year's own months for every monthly row (times the survivor
  factor from the first death) plus that year's one-time rows (no survivor factor). Engine D inflates it from the retirement year as before;
  Backtest and What-Breaks read it too, so the three agree (DC-1, DC-2, DC-4).
- **The example moves too, and the reasons are visible.** 2029 spends **$126,280** — the current home's costs through March, the retirement rows
  from April, and the $28,000 of one-time rows (the golf cart and the closing costs); from May 2034 the $400 car payment is gone. Its ending
  portfolio rises $109K; its lifetime federal tax as the Taxes tab first opens falls $598 ($210,898 → $210,300, `t40` E2) and on the as-is reading
  $2,576 (E1); the Roth tab's best strategy is unchanged.
- **The display figures follow the plan's dates (DC-3).** The "pre-retirement", "post-retirement" and "after spouse B's Medicare" spending quoted
  in eleven places take their month from the plan's timeline by one rule — the later of the event's month, June of that year, and the as-of
  month. On the example that is 2026-06, 2029-06 and 2031-06, so **no example display figure moves**; a plan on another calendar now sees its own.
- **The retirement-year buttons (DC-5)** keep the table on its calendar dates: retiring a year early spends the pre-retirement rows until the table
  ends them, as the Monte Carlo already did.
- **What the user reads.** The Withdrawal tab's schedule note says where its spending comes from, and that a one-time row dated before retirement
  is not in the schedule; the Field Manual's Withdrawal Strategy entry says the same, dated v6.18, and says when the Monte Carlo charges a
  one-time row (D-45, below); Backtest's comparison sentence no longer says the backtest omits one-time expenses (it now spends them — found
  rendering the tab at the build) and says when the Monte Carlo charges one. No in-app notice (DC-6): no saved data changes.

⚠ **Owned — a premise error in the scope, found before ship.** The scope's §0.1 (and the v6.17 findings note) said the Monte Carlo subtracts
one-time rows "when they fall". An independent review of this release found it does not: both engines read the table once a quarter, at the
quarter's last month, and the one-time match is exact — so a row dated in any other month is never charged. The example's April 2029 golf cart
and closing costs ($28,000) have never reached the Monte Carlo (measured: byte-identical output with and without them). The first draft of this
release's copy repeated the false premise ("the Monte Carlo takes it from the portfolio when it falls") on the Withdrawal tab, in the Field
Manual and in Backtest's sentence; all three were corrected before the package was cut, `t81` E-1, E-6 and F-1 now assert the corrected text,
and §C2 pins the Monte Carlo's behaviour as a dated `[KNOWN DEFECT]`. The Monte Carlo itself is unchanged (the scope kept it bit-identical);
filed as **D-45**. The v6.17 home-move note's "closing costs … are already counted" is untrue for the example's April row in the Monte Carlo
for the same reason (recorded under D-45, not changed).

**Tests.** New suite **`t81`** — **130** on v6.18, **40** on v6.17 (that leg pins the snapshots as dated `[KNOWN DEFECT]` checks). §A:
Engine D's spending against an **independent oracle** (its own month loop over the EXPENSES rows, its own survivor year and inflator) to the
cent on the example, every fixture household, the same plan moved 3 and 6 years later, a single plan, spouse B on Medicare before retirement, a
survivor case, a stress table and both retirement-year buttons; hand pins ($126,280; 2034's four car months; the survivor year); the function
unit-tested 2026–2060. §B by AST: no typed `"YYYY-MM"` reaches either table reader; Engine D, Backtest and What-Breaks share the one read; no
engine A–C, the bridge or the Monte Carlo reads a snapshot; Backtest and What-Breaks read the year they are called for (B-6b). §C: the example's three display figures identical on both legs; the shifted plan
reads its own; the rule's edge cases; a recompute without a timeline rebuild still uses the plan's dates. §D across v6.17 → v6.18: both Monte
Carlo engines bit-identical on every household; a flat table (rows changing only in January of the retirement or Medicare year, no one-time rows)
moves nothing — bit for bit single, to 1e-6 for a couple (the survivor factor is applied in a different order); the example's spending moves in
exactly the years the oracle says. §C2: D-45 pinned on both legs (the April rows never reach either Monte Carlo engine; dated June they do). §E rendered: the Withdrawal tab's 2029 cell ($126K) and sentence, Backtest, What Breaks, the Expenses headers.
§F: the copy and METHODOLOGY.
**Attribution of every moved figure.** The change moved 38 pinned checks in ten suites at the probe. Each was re-pinned **with its attribution in the
same run**: `qa/tools/v617_spending.mjs` writes v6.17's two snapshots as an expense table, and v6.18 fed that table reproduces v6.17's Engine D on
every household, every field, to 1e-6 (`t81` D-4). `t40`, `t42`, `t43`, `t58`, `t71`, `t72` and `t75` now run a second time on the v6.18 leg with
that table (`runsuite.sh`'s **"-spend617"** lines) and **every v6.17 figure comes out exactly**; the normal v6.18 run carries the new figures (two hand
re-derivations: `t42`'s 2035 spending and federal tax, `t75`'s 2032 worksheet). `t19`'s mixed pool does the same inline. Two fixtures whose subject is
not spending — `t19`'s RMD-sourcing household (it needs a spending need in every RMD year, which the example's table read year by year no longer
gives it after the car is paid off) and `t20`'s tax-type block (its exacts hold only while the pool exhausts in the horizon) — now run on v6.17's
spending as a table, which keeps every figure they derived. `t14`'s death-guard check follows the survivor guard into `tableYearExpense`.
`domdiff_withdrawal` gains a v617 → v618 arm: the spending sentence set aside, the schedule and its two summary figures masked, everything
else byte-identical, the masked text different and 2029's cell $98K → $126K; the Taxes and IRMAA tables differ with the same rows and shape.
`t2`'s parity needs no entry and stayed 10 of 10 identical — its witness that the Monte Carlo did not move.
Controls `qa/tools/controls_v618_spend.py` (repo-only): **11 of 11** — Engine D back on the snapshots (also turns the DOM diff's mask check red),
one-time rows dropped, the survivor factor on one-time rows, one-time rows uninflated, a snapshot date typed back, Backtest and What-Breaks back on
the snapshots, inflation from the as-of year, the snapshots from a stale timeline, the survivor guard weakened, and the unmutated run; every file
restored and hash-checked.
**Registered:** `v618` by AST (329 sites), `t1`'s and `t4`'s version strings, `t33`'s PINS and the three Python suites by hand; `suitetext.cjs` found
no typed "v6.17" in a SETUP check. The shim exports `tableYearExpense`, `recomputeDerivedExpenses` and the snapshots (guarded).
**`t80` §A now skips by design** in a run folder without the v6.16 source (any pair after v6.16 → v6.17); it ran at the v6.17 ship. `t80` reads
28 on each leg here.

**Suite, run from the packaged copies:** **7,656 app checks across 80 app suites** (the eight `-spend617` attribution runs, 236 checks, included), 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 44, `sets` 12 + 12; **GRAND 7,798**. Against v6.17's line the counts that moved are `t14` 47 → 48, `t19` 68 → 71 and `t80` 42 → 28, and `t81` is new. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v617 v618` from a fresh clone of `52fe385` carrying the package as cut (81 files); the documentation was finished after the run (no suite reads it but `METHODOLOGY.md`, which was final). An earlier pass on a first cut was stopped and discarded when the review's copy corrections changed the source. Source `208bf89d1bd83fc55d430f2eec60d202` · built `d228f1d3391231406848d2647cb97fec` (`smoke_built` 22 passed, 0 failed); v6.17 rebuilt first from its own source to its published `067c8740…`. *(This provenance line was missing from the entry as shipped and was added on 2026-10-18 by the ops entry above.)*

**Limitations, disclosed:**
- The inflation base is unchanged: Engine D inflates from the retirement year and starts from today's balances without growth (the v5.10 house rule).
- A one-time row dated before the retirement year is not in the Withdrawal tab's schedule (D-44).
- The Monte Carlo charges a one-time row only when it is dated in March, June, September or December — the example's April rows never reach
  it (D-45, found at this build, not changed).
- The Monte Carlo subtracts one-time rows in today's dollars while it inflates the monthly rows — optimistic, small, not changed here (D-44).
- The Monte Carlo samples one month per quarter; the Withdrawal tab, Backtest and What-Breaks sum all twelve.
- Every plan not on the example's calendar sees its Withdrawal, Taxes, IRMAA and Roth figures move — usually toward less money left.

**Registered:** D-40 to D-43 filed from the findings note (D-41 closed here); D-44 and D-45 opened.

## v6.17 — the cash from a home move is a My Data field, not a fixed $130,000 added to every plan (D-38)

**A MODELLING release** — METHODOLOGY gains *Cash from a home move*. `docs/SCOPE_D38_HOME_SALE_CASH_V617.md` (repo-only, fulfilled). Steve,
after a question about another chat's advice: *"Let's make the home-sale cash a field in My Data rather than a number in the code"*; then
*"go"* on the scope's five decisions as recommended.

**What was wrong (v6.16, measured).** `HOME_SALE_PROCEEDS = 130000` was added to the portfolio in the retirement quarter by both Monte Carlo
engines for **every** plan — the example, a plan built with Start Fresh or the guided wizard, an imported backup — whether or not anyone
was moving. No input set it, and only one Events card mentioned it ("the plan books $130K"). The figure is the net of a home move (sell,
pay off, buy the next home in cash), so for many households it is 0 or negative. On the example household the $130,000 is worth 6.3
points of 30-year success (81.1% against 74.8% at $0) and about $250,000 of median 30-year balance; on a smaller household (holdings at
40%) the 6-year headline was 64.8% at +$130,000 and 39.2% at $0. It had never been registered; it is filed as D-38 and closed here.

**What changed (DC-1 to DC-5, all (a)).**
- **The field.** My Data's home row gains **"Cash from your home move at retirement $"** (`PORTFOLIO.homeMoveCash`), a signed figure: what
  is left after selling the current home (its mortgage and selling costs paid) and paying cash for the next one; **negative** if the next
  one costs more; **0** if not moving. Its note says so, says closing costs already in the expenses are counted there, says the sale is
  treated as tax-free, and shows today's equity from Home value and Mortgage balance as a starting point (DC-1).
- **One accessor.** `homeMoveCash()` replaces the constant at all five model sites — each Monte Carlo engine's planned path and simulated
  paths, and the Events card — clamping to ±$10,000,000 and reading anything unparseable as 0. The mortgage what-if adds its principal on
  top, as before.
- **Plans without the field** (DC-2, DC-3). A plan or backup saved before v6.17 reads **$0** — the conservative reading — and My Data and the
  Monte Carlo tab show a notice ("Earlier versions added $130,000 to every plan at retirement; this plan now assumes $0…") until Save & Apply
  writes the field. Start Fresh and the wizard start at $0 with no notice. **The example keeps $130,000**, so none of its figures move.
- **What the user reads.** The Monte Carlo tab names the figure ("added to / taken from the portfolio in 2029", or "no home move"); the
  mortgage what-if says both columns start from it; the Events card names it, or drops the clause at $0; the Ask AI context gains a HOME
  MOVE line; the Field Manual's Monte Carlo entry and My Data table describe it, with its history.
- **Not changed, disclosed** (DC-4, DC-5): only the Monte Carlo, Stress and Dashboard figures include the cash — the Withdrawal, Taxes, IRMAA
  and Roth tabs do not (**D-39**, opened); it arrives in the retirement quarter; the sale is treated as tax-free (26 U.S.C. §121 excludes up
  to $250,000, $500,000 joint, when the ownership and use tests are met; a larger gain is not taxed here).

**Tests.** New suite **`t80`** — **42** on v6.17, **22** on v6.16 (that leg pins the constant as dated `[KNOWN DEFECT]` checks).
§A builds **oracle modules at test time** — the v6.16 source in the run folder with the constant set to X, compiled the way `mk_testable.sh`
compiles a leg — and for X = +$130,000, $0, −$105,000 and +$250,000 the field reproduces both Monte Carlo engines and the mortgage what-if
**bit for bit**, with a control that the oracle itself moves with X. By AST: `HOME_SALE_PROCEEDS` exists nowhere; no 130000 literal outside
the example and the state tax tables; the accessor is read at exactly the five model sites and by no engine A–D; Start Fresh and the wizard
build their plan at 0; the accessor clamps and defaults (B). Across v6.16 → v6.17: on the example, Engines A–D, the bridge and every Monte
Carlo figure are bit-identical; at $0, −$105,000 and +$250,000, and with the field missing, Engines A–D and the bridge are bit-identical (C).
A hand pin: the planned path at $0 sits 130,000 × 1.01125 = $131,462.50 below the example's in the first retirement quarter and ×1.01125
each quarter after; the Events card at +$130,000, −$105,000 and $0 (D). Rendered: the field and its note on the example; −105,000 typed with
a comma is saved; the Monte Carlo line; Export Backup and its Ask AI line; the clamp and a non-number on save; Import; an old plan at 0 with
the notice on both tabs, gone after Save & Apply; an old backup imported through My Data (E). The copy, METHODOLOGY, and the extinction of
"the plan books" (F).
**Census:** `tools/boundaries.mjs` gains a `home_move` row (§K1: the example's figure equals the old constant, so the field and the constant
cannot be told apart there), with a fixture that clears it (−$105,000) and one at $0 that must clear as well; `t29` asserts both.
Controls `qa/tools/controls_v617_home.py` (repo-only): **9 of 9** — the constant restored at one site, the sign flipped, the field lost on save,
a missing field read as 130,000, the clamp removed, the notice never shown, the example's figure changed, the Events clause kept at $0, and the
unmutated run; every file restored and hash-checked.
⚠ **Owned — one control's prediction was wrong.** I expected the sign-flip control to turn `t80` A-1 and D-1 red; it turned B-6 and the
rendered E-4, E-5 and E-9 red instead, and left A-1 and D-1 green. The loader clamps a stored value in place *through the accessor*, so a
flip applied at load and again at read cancels in the engines on a freshly loaded plan — the defect shows in the stored and displayed
value. The control catches it; its expected list now names B-6 and E-4, with the reason in the file.
⚠ **Owned — the first package check failed.** `t80` built its oracle modules as files in the run folder's `qa/` and left them there;
`package_check` G-2 (every new hand-written file under `qa/` is in the package) found the eight files. `t80` now deletes each oracle's files
once it has loaded the module. The packaged suite run and the controls were then repeated in full on the corrected package (below).
**Registered:** `v617` by AST (322 sites), with `t1`'s and `t4`'s version-string arms, `t33`'s PINS (no Roth figure moves, so v6.16's values)
and the three Python suites by hand, before the first full run; `suitetext.cjs` found no typed "v6.16" in any SETUP check (the `t78` D-2a
lesson). The test shim exports `homeMoveCash` (guarded).

**Where the build departed from the scope, recorded in its §7:** Start Fresh and the guided wizard needed `homeMoveCash: 0` written into their
new plans (the scope said neither needed an edit) — without it a brand-new plan would have shown the "earlier versions" notice. The field is
not written into a plan that lacks it at load, so a backup restored from the landing page keeps its notice until the user saves.

**Suite, run from the packaged copies:** **7,254 app checks across 79 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,384**. Against v6.16's line, the counts that moved are `t29` 78 → 82 (the `home_move` row) and `t79` 116 → 69 (its v6.15 → v6.16 differential takes its designed skip on this pair), and `t80` is new; every other current-leg count is unchanged. Run from the PACKAGED copies, twice, each in one pass: a run folder built by `mk_runfolder.sh v616 v617` from a fresh clone of `8e54a6a` carrying the package as first cut (78 files), then — after the G-2 fix to `t80` above — one carrying the corrected package (80 files, each overlay compared byte for byte with the build workspace); the two runs gave identical per-suite counts. The documentation was finished after the second run, and every file outside `CHANGELOG.md`, the manifest and the scope is byte-identical to what ran. v6.16 resolved from history (commit `13b281a`). The controls were repeated on a copy of the second run folder: 9 of 9. Source `dc8a4d5f5796b11d88007024b1ecaca7` · built `067c87404e92339a1de9ece815d6151e` (`smoke_built` 22 passed, 0 failed); v6.16 rebuilt first from its own source to its published `765cd89f…`. The first full run (the build workspace) was green as well: GRAND 7,384, 0 failed.

**Limitations, disclosed:**
- Only the Monte Carlo figures include the home-move cash (D-39); the Withdrawal tab's pool starts without it.
- The cash arrives in the retirement quarter; a move at another time is not modelled.
- The sale is treated as tax-free; a gain above the §121 exclusion, or a sale that fails its tests, is not taxed here.
- A plan saved before v6.17 reads $0 until its owner enters a figure — its Monte Carlo figures fall, and the notice says why.

## v6.16 — self-employment tax: a self-employed job row pays both halves, on 92.35% of the profit (D-36)

**A MODELLING release** — METHODOLOGY changes (*Payroll tax on job income* gains a self-employment subsection; its simplifications are
rewritten). `docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md` (repo-only, fulfilled). Steve: *"yes"* to scoping D-36 — the only open item whose error
made plans look better than they are — then *"go"* on the scope's six decisions as recommended.

**What was wrong (v6.15, measured).** Every job row was taxed as a paycheck — the employee's 7.65% — so a self-employed person's payroll tax
was understated by about half. Disclosed since v6.14 (Taxes tab, My Data, Field Manual, METHODOLOGY), not modelled. On the example household
plus $60,000 a year of consulting for five years, v6.15 charged $4,590.00 a year where the law charges $8,477.73: **$19,438.65 too little
tax over the five years**, and a larger estate than the plan can expect.

**What changed (DC-1 to DC-6, all (a)).**
- **The input.** My Data's Type dropdown offers **"Job — employee (W-2)"** and **"Job — self-employed (1099)"** in place of "Job
  (part/full-time)". Both store `kind: "work"`, so every site keyed on a job row keeps working; the second adds `selfEmployed: true`, which the
  editor, Save & Apply, Export Backup and Import carry. **A row saved before v6.16 has no field and stays an employee** — its figures do not
  move, and the job-row note asks the user to pick the type (DC-3, DC-4). The Income tab and the Ask AI context call such a row self-employed.
- **The rule** (26 U.S.C. §1401, §1402), in the one helper, `payrollTax`, which keeps its three call sites (Engine A twice, Engine B once):
  net earnings are 92.35% of the profit; nothing is owed if a person's net earnings are under **$400** (`SE_MIN_NET`, statutory, unindexed,
  with a new Verify-tab check — the count goes 71 → 72); Social Security 12.4% on net earnings up to the base **the same person's wages
  leave**; Medicare 2.9% on all of it; the 0.9% on the household's wages **plus** net earnings above $200,000 / $250,000. A joint row is split
  equally while both spouses live (DC-6). `workEarners` now returns each person's wages and profit apart (`{ w, se }`), through one new
  `streamsMonthlyAt` filter no other caller passes. No self-employment rate is typed: all derive from the employee-side constants.
- **Not taken, disclosed** (DC-2, DC-5; filed as **D-37**): the deduction for half the self-employment tax (§164(f)) and the QBI deduction
  (§199A). Both make income tax run a little high — conservative. Taking §164(f) properly lowers AGI and every MAGI, which reaches the IRMAA,
  Withdrawal and Roth-ladder engines too; that is its own release.
- **The copy.** The Taxes tab's method note, My Data's streams and job-row notes, and the Field Manual's streams entry state the rule and the two
  simplifications; the three "not modelled … understated" sentences are gone.

**Measured** (example household plus job rows in the first five plan years, Engine B; year-2029 payroll tax, v6.15 → v6.16, and the five-year change,
which is the whole change in lifetime total tax):

| Household | 2029 | 5 years |
|---|---|---|
| A self-employed $60,000 | $4,590.00 → $8,477.73 | +$19,438.65 |
| A self-employed $30,000 + B employee $40,000 | $5,355.00 → $7,298.87 | +$9,719.32 |
| A employee $150,000 + A self-employed $60,000 | $15,184.16 → $18,760.21 | +$19,374.64 |
| A self-employed $250,000 | $15,764.16 → $30,973.69 | +$78,524.54 |
| Single, A self-employed $120,000 | $9,180.00 → $16,955.46 | +$38,877.30 |
| A self-employed $430 a year (net $397.11, under the floor) | $32.90 → $0.00 | −$164.48 |
| Example household; any household with employee rows only | bit-identical | $0 |

Engine A (the strategy comparison) on the $60,000 household: every strategy pays $19,329–$19,439 more and leaves an estate $53,299–$53,602
smaller. The IRMAA and Withdrawal engines, the bridge series and both Monte Carlo engines are bit-identical on every household tested.

**Tests.** New suite **`t79`** — **116** on v6.16, **60** on v6.15 (that leg pins v6.15's rule as dated `[KNOWN DEFECT]` checks).
An oracle typed from §1401/§1402 reproduces Engine B's payroll tax to the cent in every job year on thirteen households — including a joint-owned
self-employed row and a survivor who crosses from joint to Single mid-business, where the 0.9% on net earnings appears exactly at the crossing —
and matches only its own leg's rule (A). By AST: still three `payrollTax` call sites; no 0.124, 0.029, 0.153 or 0.9235 literal outside the
historical-returns table; the floor read from `SE_MIN_NET`, no 400 typed in the helper (B). Across v6.15 → v6.16: Engines C and D, the bridge
series and both Monte Carlo engines bit-identical on all thirteen; Engines A and B bit-identical on the three without a self-employed row;
Engine B's total tax moves by its payroll change and nothing else; Engine A's no-conversion strategy moves by exactly Engine B's change on four
households and, on the rest, the same way and by no more (C — see the correction below). Five hand pins to the cent, worked in the file:
$8,477.73, $18,760.21, $16,694.74 (no Social Security room left after a $200,000 paycheck; the 0.9% on wages plus net earnings), $31,251.57 (a
single filer's 0.9% on net earnings) and $0 under the floor (D). The input rendered: both job types offered; an old row reads as an employee;
choosing self-employed and pressing Save & Apply stores the field and moves the applied plan's tax; reopening shows it; the Income tab labels
it; Export Backup carries it (and the Ask AI context names it); switching back clears it; Import restores it (E). The copy, the extinction of
the three old sentences, and METHODOLOGY (F).
**Census:** `tools/boundaries.mjs` gains a `self_employed` row (§K1: the example household has no self-employed row, so D-36 was invisible
there), with a fixture that clears it and one under the $400 floor that must not; `t29` asserts both and gates the row's flip to v6.16.
Controls `qa/tools/controls_v616_se.py` (repo-only): **9 of 9** — the 92.35% factor dropped, the $400 floor dropped, the base not reduced by
wages, the 0.9% ignoring net earnings, a joint row given wholly to A, the field lost on save, a stray `0.124`, the old disclosure restored, and
the unmutated run; every file restored and hash-checked.
**Re-gated:** `t77` B-3 (the Verify tab's payroll category has six checks on v6.16, the new one citing §1402(b)(2)) and E-4 (on v6.16 it asserts
the old "owes both halves" disclosure is gone); `t78` D-2a derives the built page's version from the newest source in the run folder (below).
`t78` and `t77` keep their v6.14 → v6.15 / v6.13 → v6.14 differentials as designed skips on this pair (`t78` 42 → 36 on the current leg). `v616` registered by AST (314 sites); `t1`'s and `t4`'s version-string and Verify-count arms,
`t33`'s PINS (no pinned household has a self-employed row, so v6.15's values) and the three Python suites by hand, **before** the first full run,
as v6.15's CHANGELOG requires.
⚠ **Owned — one version string my pre-run review missed.** `t78` D-2a, a SETUP check, asserted the run folder's built page "names v6.15" —
a typed version string, not a tag, so the registrar could not see it. The first full run went red on it on both legs (`t78` 35 + 1 failed
per leg; nothing else red). It now derives the version from the newest source beside it, and fails against v6.15's page in a v6.16 run
folder (checked). Nothing shipped wrong.

⚠ **Owned — a test claim in the scope was too strong.** The scope's §3 C said Engine A's no-conversion strategy moves by *exactly* Engine B's
payroll change. Measured, that holds on four households (to the dollar) but not on five others: Engine A carries balances forward, so the extra
tax leaves less invested, and later IRMAA, survivor-year tax and NIIT fall a little (on the joint-owned $300,000 household, $74,573 against
$96,160.50). In the first plan year every strategy's tax moves by exactly Engine B's figure on every household (instrumented session-only, not a
suite check). `t79` C-4 asserts the exact form on the four and the measured bound on the rest; the scope's §7 records it. The scope's §0.3 had
already measured the wider Engine A range at $250,000, so the "exactly" was a drafting error, not a changed premise. Separately, the scope's §3 D
named "the 0.9% on $250,000 of self-employment" as a pin; on a joint return $250,000 of profit is $230,875 of net earnings, under the
threshold, so that pin is taken on a single filer instead ($31,251.57).

**Suite, run from the packaged copies:** **7,220 app checks across 78 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,350**. Against v6.15's line, the counts that moved are `t29` 73 → 78 (the `self_employed` row) and `t78` 42 → 36 (its v6.14 → v6.15 differential takes its designed skip on this pair), and `t79` is new; every other current-leg count is unchanged. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v615 v616` from a fresh clone of `7ee5470` carrying the package as first cut (76 files, each overlay compared byte for byte with the build workspace; the documentation was finished after the run, and every file outside `CHANGELOG.md`, `TESTING.md`, the TESTING archive, the manifest and the scope is byte-identical to what ran), v6.15 resolved from history (commit `cbe2eb2`). While it ran, the repo gained `b47769a` (the scope's draft, byte-identical to the copy the run held); the package is based on `b47769a`. Source `dfc07ee74ad9dd52c0925f54bee0a682` · built `765cd89f6c5d97a937f2fa2e7405ee64` (`smoke_built` 22 passed, 0 failed); v6.15 rebuilt first from its own source to its published `38f51c21…`. The first full run (the build workspace) was green except `t78` D-2a on both legs — owned above.

**Limitations, disclosed:**
- The §164(f) and §199A deductions are not taken (D-37): a self-employed household's income tax runs high, and its AGI and MAGI do not drop
  by half the self-employment tax.
- A job row's amount is read as the year's net profit; losses, the optional methods on Schedule SE, and Social Security credits earned by
  self-employment are not modelled.
- A plan saved before v6.16 keeps every job row as an employee until the user changes its type.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v6.00 to v6.15 in `docs/CHANGELOG_ARCHIVE_v6_00_to_v6_15.md` (2026-10-19); v5.75 to v5.99 in `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` (2026-10-11); v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`
(2026-09-28); v5.59 and earlier in `docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
