# Changelog

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

## v6.15 — the Events tab speaks to users only: no Google Drive, no maintainer chores, and the strip never hides the user's own reminders

**A PRESENTATION release** — no engine, constant or figure moves, so METHODOLOGY does not change (MC parity unchanged).
`docs/SCOPE_EVENTS_USER_FACING_V615.md` (repo-only, fulfilled). Steve: *"I don't want my users to have to use google drive"*; then all
four recommendations, and *"Go"* on the scope's five decisions as recommended.

**What was wrong (v6.14, measured).**
- **Google Drive in the app.** Two Events cards told every user to use a Google Drive folder: the tax card (to fetch a prepared block of
  constants) and the backup card (to store the quarterly export).
- **The maintainer's chores, shown to every user.** Three of the eighteen events were the maintainer's work — paste new tax constants into
  `src/DangerClose.jsx`, append last year's returns to `HISTORICAL_RETURNS`, refresh the Ranking tab's survey tables. The paste-in
  workflow also contradicted this project's own rule that every refresh is a scoped, tested release.
- **They hid the user's own reminders.** The colored strip above every tab names only the most urgent tier. On the example household
  it read "GETTING CLOSE: Annual tax-data refresh" all October 2026; on 5 January 2027 it would have read "⚠ ACTION REQUIRED: Annual tax-data refresh"
  — and that red alarm hid the user's open annual plan review (green), quarterly backup and SSA record check (yellow). The ⌛ STALE DATA
  strip already says the figures are old, so the same news appeared twice and the user's real reminders not at all.
- **A finding from the same read: "your plan survives the swap" was not always true.** The STALE strip and two Field Manual passages said
  the plan carries over to a fresh copy of the file because it "lives in your browser, not the file"; the backup card said the opposite
  ("no automatic persistence"). The plan is saved in the browser's `localStorage` (`src/main.jsx`), which belongs to one web address —
  so moving between the website and a saved copy of the file opens a blank form. Nothing was destroyed (the old copy still holds the
  plan), but the user was told nothing would be lost. Whether two saved files share storage depends on the browser; this release does
  not claim it either way.

**What changed (DC-1 to DC-5, all (a)).**
- **The tax card is a notice** — "Tax figures in this copy (2026)": "current for 2026" until October; then "2027 figures publish Oct–Nov;
  an updated version follows by January" with a countdown (TRACKING — there is nothing for a user to prepare); red from January 1 of a
  year past the figures'. Its instructions: reload stextor.github.io/danger-close, or download a fresh copy; export a backup first, and
  Import Backup if the plan doesn't appear. It carries `notice: true`, and **the strip ignores notices** — the tier rule moved out of the
  JSX into one small function, `alertStripEvents`; when the figures are out of date the ⌛ STALE DATA strip is the one alarm (DC-1, DC-2).
  "By January" is kept (DC-5): if an update is late, the STALE strip announces it on January 1 regardless.
- **The backtest-data and peer-benchmark events are gone.** The Events tab now has sixteen events for a two-person household. The annual
  plan review's instructions point at the tax-figures notice instead of the removed events.
- **The backup card:** the app saves the plan in this browser only; the exported JSON is the durable copy; keep it somewhere private —
  "your Documents folder, a personal cloud drive, or a USB stick", the export dialog's own words.
- **The STALE DATA strip** loses "nothing is lost" and the maintainer sentence; it says to export first, and that Import Backup brings
  the plan across (DC-4).
- **The Field Manual:** the Events entry (sixteen events; the notice is the one exception to the strip), the Ranking entry (a later
  version carries the 2028 survey), the "Two kinds" table and the freshness paragraph (export, get the current build, Import Backup if
  the plan doesn't appear), and the maintainer sentence removed.
- **The maintainer's refresh cycles moved out of the app** into a new subsection of OPERATIONS §I, *Annual data refreshes* (DC-3): the
  three cycles, their primary sources, and the rule that each is a scoped release, never a paste. The reminders are Claude scheduled tasks
  on the maintainer's account (research-only, no Drive): tax figures every Nov 15, the returns row every Jan 20, the 2028 SCF once on
  2029-10-22.

**Tests.** New suite **`t78`** — **42** on v6.15, **21** on v6.14 (that leg pins v6.14's defects as dated `[KNOWN DEFECT]`
checks). On the first and fifteenth of every month 2026–2028 (72 dates): v6.15's events are v6.14's minus the two chores, in order, and
the thirteen untouched events are field-for-field identical across the pair; the backup and review cards keep every field but their
instructions (A). The notice's states and words on five dates; never green or yellow; the only event marked a notice; no source names,
paste or Drive in its instructions (B). The strip: on 5 January 2027 it is the user's own plan review; it never returns the notice; and
on every date it is exactly v6.14's rule over v6.14's events minus the three removed — then **rendered** in a child process with the clock
set to 2027-01-05 before the module loads, where it reads "▶ ACTION WINDOW OPEN: Annual plan review" beside the ⌛ STALE DATA strip and its
new sentence (C). Extinction: "Google Drive" nowhere in the source's text (AST, Field Manual included) or the built page; no swap or
persistence claim anywhere (D). The backup card and the export dialog share their wording (E). The Field Manual's event count is tied to
the real count (F).
Controls `qa/tools/controls_v615_events.py` (repo-only): **9 of 9** — Drive back in the backup card, the strip ignoring `notice` removed,
the backtest chore restored, "eighteen" restored, the notice made yellow in October, the STALE strip's old sentence restored, the plan
review's window moved to February (a non-text change), the Ranking sentence restored, and the unmutated run; every file restored and
hash-checked.
**Re-gated:** `t73` §E asserts the peer alarm's absence on v6.15 (one check in place of three); `domdiff` sets the action banner and the
STALE strip aside for the v6.14 → v6.15 pair only, with two checks that the v6.15 side names neither the tax notice nor the maintainer
workflow. The test shim exports `alertStripEvents` (guarded). `v615` registered by AST (314 sites), with `t1`'s and `t4`'s version-string
arms, `t33`'s PINS (no engine moved, so v6.14's values) and the three Python suites by hand. ⚠ **Owned:** I ran the first full suite
before reviewing the registrar's work. The registrar had folded `v615` into `t1`'s and `t4`'s `"v6.14"` version arm (`t1` failed on the four
version strings, `t4` on its badge), and I had not added `t33`'s PINS entry (it stopped with its designed FATAL). All three were fixed
before the packaged run below. Nothing shipped wrong, but the §B2 review is meant to come first; v6.14's CHANGELOG records the same
registrar trap for the Verify count.

**Suite, run from the packaged copies:** **7,027 app checks across 77 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 34, `sets` 12 + 12; **GRAND 7,159**. Against v6.14's line, the counts that moved are `t73` 56 → 54 (§E: one absence check in place of three) and `t77` 54 → 38 (its §C, the v6.13 → v6.14 differential, takes its designed skip on this pair), and `t78` is new; every other current-leg count is unchanged. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v614 v615` from a fresh clone of `a9e0a79` carrying the package as first cut (73 files, each overlay compared byte for byte with the build workspace; the documentation was finished after the run, and every file outside `CHANGELOG.md`, `TESTING.md`, the TESTING archive, the manifest and the scope is byte-identical to what ran), v6.14 resolved from history (commit `ec5f16c`). Source `a9520db52dc06aa380714c8a2a5c7514` · built `38f51c212390ec41669fb9fb8246f024` (`smoke_built` 22 passed, 0 failed); v6.14 rebuilt first from its own source to its published `2eeb7650…`.

⚠ **One intermittent failure, observed and not fixed.** The first packaged run, which I ran while the controls were rebuilding the app in
parallel, failed one check: `t38` I-6 on the v6.15 leg ("a file one byte over 5 MB is refused, storage unchanged"). The refusal message
was right; the whole-storage snapshot differed. `t38` then passed 206 of 206 on five reruns of that leg, and the whole suite passed in
the clean run recorded above, with nothing else running. The source diff touches neither import nor
storage. The likely cause is a storage write still pending from the previous case's remount, landing late under load — I have not
confirmed it. The check is unchanged; a harness fix that waits for writes to settle is left for a later release.

**Limitations, disclosed:**
- Whether two saved copies of the file share the browser's storage depends on the browser and is not tested; the app now says to export
  first and Import Backup if the plan does not appear, rather than promising either way.
- The returns row and the peer tables no longer have an in-app alarm; their vintages are in the Field Manual's *Data vintages* table, and
  their refresh is the maintainer's (OPERATIONS §I).
- `t78` C-4 renders the strip on a set clock in a child process; every other date-dependent check passes its date in.

## v6.14 — payroll tax on job income follows the law: the 0.9% Additional Medicare Tax, and the wage cap per earner

**A MODELLING release** (METHODOLOGY gains a section; MC parity unchanged). `docs/SCOPE_D17_PAYROLL_TAX_V614.md` (repo-only, fulfilled).
Steve took all six recommendations: "Use your recommendations for the decisions on §5."

**What was wrong (v6.13, measured).** Every payroll site — Engine A (the strategy comparison) twice, Engine B (the Taxes tab) once — took
min(household wages, wage base) × 6.2% + wages × 1.45%. Two errors, both taking too little tax:
- **D-17 (registered):** no 0.9% Additional Medicare Tax on household wages above $200,000 Single / $250,000 joint (26 U.S.C. §3101(b)(2);
  the thresholds are not indexed — IRS Instructions for Form 8959). $450 a year at $300,000.
- **C-14 (new, found by the scope's mechanism sweep, OPERATIONS §K2):** the Social Security wage base capped the **household's** job
  income, but §3121(a)(1) caps each **person's**. Two $150,000 earners were taxed on $195,792.88 of Social Security wages in 2029 where the
  law taxes $300,000 — **$6,460.84 short that year**, $29,827 over five. Two $120,000 earners: $11,227.
Neither reached the example household (no job stream; B's built-in taper peaks at $20,000), so the boundary census gains a row.

**What changed (DC-1 to DC-6, all (a)).**
- **One helper, `payrollTax`**, called at all three sites: Social Security 6.2% per earner up to the year's base, Medicare 1.45% on all of
  it, 0.9% on the household's wages above $200,000 / $250,000 on the year's filing status (joint through the year of the first death,
  Single from the next). Fixing both errors together (DC-1); modelling the 0.9%, not only disclosing it (DC-2).
- **Who earned it:** B's taper is B's; a job row is its owner's; a job row owned jointly is split equally — the conservative reading (DC-3).
  `streamsMonthlyAt` gains an `owner` filter for it.
- **The rates live in `TAX_CONSTS`** with five Verify-tab checks citing §3101 and Form 8959 (DC-4): the Verify tab now reports 71 checks.
  E-23 narrows (payroll is out of it; NIIT and AMT remain).
- **Self-employment is disclosed, not modelled** (DC-5): job income is taxed as wages, the employee's half — said in the Taxes tab's
  method note, My Data's job-row note, the Field Manual and METHODOLOGY; filed as **D-36**.
- The Taxes tab's FICA line carries the 0.9% (DC-6); its description and method note say so.

**Measured (v6.13 → v6.14, the example plus job rows in the first five plan years).** One $300,000 job: Taxes tab +$2,250; the comparison's
"current" strategy +$2,250 of tax, −$6,205 of estate. Two $150,000 jobs: **+$32,077** and −$88,757. Two $120,000 jobs: +$11,227 and
−$31,262. A single household's $250,000 job: +$2,250. A $300,000 job owned jointly: +$32,077 (split, so each half is under the base).
**Did not move:** the example household and two $60,000 jobs, in every engine; the IRMAA tab (Engine C), the Withdrawal tab (Engine D),
the bridge series and both Monte Carlo engines on every household — none carries payroll tax (asserted, `t77` §C).

**Also in this package.** **E-23** narrowed; **D-36** opened (disclosed); **D-17** closed; **C-14** filed and fixed. One slip of mine is
owned in the scope's §6a: its §0.3 hand check wrote the 2029 base as $195,793.10 and v6.13's figure as $16,489.17; the base is
$195,792.88 (184,500 × 1.02³) and the figure $16,489.16. The law's $23,400.00 is unaffected. `t77` pins the corrected cents.

**Tests.** New suite **`t77`** — **54** on v6.14, **38** on v6.13 (that leg pins v6.13's rule as dated `[KNOWN DEFECT]` checks): an
oracle with its own rates and thresholds typed from the statute and its own per-person attribution from the household's rows reproduces
Engine B's FICA to the cent, every year, on nine households (the scope's seven, a survivor crossing joint → Single mid-job, and one person
holding two jobs — one cap, not two), each leg by its own rule and not the other's (A); by AST, `payrollTax` is called at exactly the three
sites and **no 0.062, 0.0145 or 0.009 literal survives outside `TAX_CONSTS`** (B); across the pair, Engines C and D and the bridge are
bit-identical everywhere, every engine is bit-identical where no threshold is reached, and Engine A's "current" strategy moves by exactly
Engine B's payroll difference (C); the hand pin, $23,400.00 / $16,489.16 (D); the copy and the rendered Taxes tab's FICA line (E).
Controls `qa/tools/controls_v614_payroll.py` (repo-only): **10 of 10** — the household cap back, the 0.9% dropped, the threshold indexed,
the joint threshold in Single years, a joint row given to A, a stray `0.0145` in Engine A, Engine A kept on the old rule, the oracle's
attribution dropped (a test mutant), the method-note clause removed, and the unmutated run; every file restored and hash-checked.
**Re-gated:** `t1` and `t4` count 71 Verify checks on v6.14 (66 before) — hand-gated, since the registrar would have folded v6.14 into the
66 group. `t29` gains the census row `payroll` (B-11). `v614` registered by AST (310 sites), with `t1`'s and `t4`'s version arms, `t33`'s
PINS (neither of its households reaches a payroll rule) and the three Python suites by hand. **`t76` reads 27 on both legs** (29 / 23 at v6.13): its §D, the v6.12 → v6.13 text-only differential, takes its designed
skip on this pair, and its v6.13 leg now runs the post-fix sections. App total reconciled from v6.13's 6,884: + 92 (`t77`) + 4 (`t29`, both
legs) + 2 (`t76`: 52 → 54) = 6,982; tooling unchanged; GRAND 7,014 → 7,112.

**Suite, run from the packaged copies:** **6,982 app checks across 76 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,112**. Against v6.13's line, the counts that moved are `t29` 71 → 73 and `t76` 29 → 27, and `t77` is new; every other current-leg count is unchanged. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v613 v614` from a fresh clone of `6560c2d` carrying exactly the packaged changes (76 files, each overlay compared byte for byte with the build workspace), v6.13 resolved from history (commit `756dc76`). Source `57e4fca1dee821325c99a2334b4ecc60` · built `2eeb765099fd121c8764c464265c3190` (`smoke_built` 22 passed, 0 failed); v6.13 rebuilt first from its own source to its published `6afe2ab9…`.

**Limitations, disclosed:**
- Self-employment tax is not modelled (D-36): a self-employed person's payroll tax is understated.
- The wage base is indexed 2%/yr from 2026; SSA indexes it to average wages, usually faster, so later-year caps likely run a little low
  (slightly optimistic; reset at each annual refresh).
- Withholding rules and the credit for excess Social Security withheld by two employers are timing, not liability, and are not modelled.
- A job row owned jointly is split equally between the spouses; enter it under its earner for an exact figure.

## v6.13 — the Roth tab's break-even card says what it measures; C-9 closed on evidence; the age-65 deduction read at source

**A PRESENTATION release** — user-facing text, one code comment and the version; **no code moved** (`t76` §D: the v6.12 and v6.13 syntax
trees are equal once text is set aside). METHODOLOGY changes anyway, because its crossover section misdescribed the measure.
`docs/SCOPE_C11_CROSSOVER_LABEL_V613.md` (repo-only, fulfilled). Steve took all six recommendations: "please continue and use your
recommendations on any decisions that need to be made."

**C-11 (open since the v5.73 audit).** The break-even card compares your conversion strategy with NO CONVERSIONS on the total of every
account at **face value** — Traditional dollars counted before the income tax still owed on them — deliberately, so that it answers the cash
question "when does the tax I paid come back?" (verified at v5.28). Its "recovered" sentence, the Field Manual's Roth entry and METHODOLOGY all
called that total "after-tax wealth"; METHODOLOGY's next paragraph said "deliberately uses FACE VALUE". Now all three say what it is: "your
account total — every balance at face value, so Traditional dollars count before the tax still owed on them". The measure did not change
(DC-1 (a)) and the card's header stays (DC-2 (a)). **Why not switch to an after-tax count — measured at the scope:** counting Traditional
dollars at 88%, 78% or 76% of face moved the crossover earlier or left it unchanged in all 36 cells measured (the example at six slider amounts,
the example with both spouses to 100 at three, `t10`'s fixture at three), and its answer is set by the rate chosen — on the example at
$30,000 a year, 12% says the conversion never pays back and 22% says it is ahead from the first year, the paper gain the face-value method
exists to avoid. So face value is the conservative direction; METHODOLOGY now says so with the argument, and the Field Manual in one clause
(DC-3 (a)). **The sentence never showed on the example household:** there the card reads "Does not break even within the plan" at every
slider position measured, $5,000 to $200,000; with both spouses living to 100 at $5,000 it shows the recovered outcome (2062). That
boundary joins the census (OPERATIONS §K1: row `crossover`, `t29` B-10).

**The §63(f) deduction, read at source.** Rev. Proc. 2025-32 §4.14(3), read from irs.gov: $1,650 for a married filer, $2,050 unmarried and not
a surviving spouse — both equal to the app's constants (the survivor files Single, so $2,050 is right in widowed years). v6.12's last limitation
said the constant "was not re-read" that release; it had in fact been verified in the v5.73 audit's register (`FlawsToFix` L104), which that
entry missed — a resolution line now sits beneath it (DC-4 (a)). **One finding from the same read:** the same additional amount goes to a
**blind** filer, and the app has no input for blindness, so a blind filer's federal tax is overstated (the conservative direction). It was
disclosed nowhere for the federal return; METHODOLOGY and the Field Manual's list of simplifications now say so (DC-5 (a)). Not modelled: a
new input for an uncommon case.

**C-9 — fixed at v6.07, now on the record.** The register's C-9 (the annuity's exclusion from the RMD base fixed at retirement start, so RMDs
crept up as the pool drained) was fixed by v6.07's D-33, which carries the annuity dollars — but D-33 did not cite the ID, so the register
said OPEN. Re-measured at the scope on the example plus a $100,000 non-qualified annuity for A, no draws: v6.06 (built from history) gives
+$257 (2040) … +$4,543 (2050), +$41,217 lifetime; v6.12 is identical to the cent in every year, in Engines B and C, with conversions at $0 and
$70,000, and in Engine A the annuity rides to the horizon at the growth rate and adds no tax. The register row, the summary row and the body
are corrected; **E-25** in `ARCHITECTUREIssues.md` closes (its last class is C-9's). This is the second time running a fix closed an item
without naming it (C-10 at v6.09), so **OPERATIONS gains §K2**: at scope time, sweep the registers for the mechanism, not only the ID (DC-6 (a)).

**Tests.** New suite **`t76`** — **29** on v6.13, **23** on v6.12 (that leg pins v6.12's copy as dated `[KNOWN DEFECT]` checks): by AST,
"after-tax wealth" is extinct in every string, template and JSX text and the three new texts are present, with a guard for `t31`'s "Roth
break-even" control (A); METHODOLOGY's section, direction paragraph and the blind disclosure (B, post-fix legs); **C-9's extinction** — with no
draws a $100,000 annuity changes no RMD in Engine B or C, to the cent, every year, at $0 and $70,000 of conversions, and in Engine A rides to
the horizon at the growth rate read from the source and adds no tax (C, both legs); v6.12 → v6.13 moved text only — the syntax trees equal
with text set aside, and a control that unmasked they differ in exactly four texts (D, this pair only); the rendered card — the example's
"does not break even", the recovered outcome and its sentence on a both-to-100 household, the METHOD line — and the census row held to the
rendered card on two households, because that row is a second copy of the card's inputs and the scope's own first probe got those inputs
wrong (it left out the example's ACA premium and used the base scenario) (E). Controls `qa/tools/controls_v613_c11.py` (repo-only): **11 of
11** — the card's and the manual's old sentences, "Roth break-even" dropped from the manual, METHODOLOGY's old sentence, v6.06's fixed
annuity share in Engines B, C and A, `rothCrossover`'s recovery test changed, the census row's ACA input dropped, the blind item removed, and
the unmutated run; every file restored and hash-checked. **Re-gated:** `t29` gains the `crossover` row check and B-10 (69 → 71).
`domdiff` runs this pair at strict identity on all three tax-bearing tabs (the v6.11 → v6.12 Bracket mask is pair-gated and off) (34 →
32). `v613` registered by AST (312 sites), with `t1`'s and `t4`'s version arms, `t33`'s PINS (Engine A cannot move) and the three Python
suites by hand. **`t75` reads 46 on both legs** (50 on v6.12's current leg, 45 on its prior): its §C, the v6.11 → v6.12
differential, needs the v6.11 module and takes its designed skip on this pair — printed, as `t70`'s §D did at v6.08. App total reconciled
from v6.12's 6,831: + 52 (`t76`) + 4 (`t29`, both legs) − 3 (`t75`: 95 → 92) = 6,884; tooling `domdiff` 34 → 32; GRAND 6,963 → 7,014.

**Suite, run from the packaged copies:** **6,884 app checks across 75 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 7,014**. Against v6.12's line, the counts that moved are `t29` 69 → 71 and `t75` 50 → 46, and `t76` is new; every other current-leg count is unchanged. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v612 v613` from a fresh clone of `30fcd8d` carrying exactly the packaged changes (75 files, each overlay compared byte for byte with the build workspace), v6.12 resolved from history (commit `47d6854`). Source `b08609bd6bf158ae5c035d9fc87297a4` · built `6afe2ab916e2e5443b4fa4a04175688f` (`smoke_built` 22 passed, 0 failed); v6.12 rebuilt first from its own source to its published `bc19a24e…`.

**Limitations, disclosed:**
- The crossover's measure is unchanged: face value, the cash question. The heirs' tax advantage of Roth is the ESTATE ranking's subject, as before.
- The 36-cell after-tax measurement was a scope finding on a session-only copy of the engine instrumented to publish Traditional balances;
  it is not a shipped assertion (publishing that balance would be an engine change, OPERATIONS §M).
- The §63(f) blind amount is disclosed, not modelled.
- Why the example household never breaks even was not re-examined: the deficit is the conversion tax compounded, and the technique was
  verified at v5.28 (AUDIT_2D).

## v6.12 — the Withdrawal tab's Bracket column taxes Social Security by the IRS worksheet, on the household's own return

**A MODELLING release whose reach is one displayed column** (METHODOLOGY gains a section; MC parity unchanged). `docs/SCOPE_C5_ENGINE_D_SS86_V612.md`
(repo-only, fulfilled). The finding is **C-5** in `docs/FlawsToFix-v5_73-Phase2.md`, open since the v5.73 audit. Steve took all four
recommendations: "Let's use your recommendations for decisions §5."

**What was wrong (v6.11, measured).** Engine D — the Withdrawal tab's year-by-year schedule — figured its Bracket column from a flat 85% of
Social Security in every year, on the 2026 **joint** table and standard deduction for every household (a single household and a widowed
survivor included), never indexed against the schedule's nominal income, with no age-65 deduction, capped at 32%, with realized gain inside
the rate's input. Every other engine has called the shared §86 helper since v5.77. On five measured households the column was wrong in **73
of 98 years, in both directions**: too high in married years (the example shows 12% where the correct figure is 10% in 2031–2036, and 22%
for 12% in 2042–2043; a modest couple living on Social Security showed 10–12% in twelve years in which its taxable income is below the
deduction), and too low in single and survivor years (the example made single read 12% in all sixteen years against a correct 22%; the
example's survivor read 12% for 22% in 2045–2047, so the widow's penalty never appeared on this tab). Nothing disclosed it, and My Data
told a single household its taxes "use Single brackets". Hand-verified to the dollar on the worksheet for 2032 (joint: taxable SS
$24,993.39, not $50,883.47; 10%) and 2045 (survivor, Single: $51,873.68, the cap binding; 22%).

**What changed (decisions DC-1 to DC-4, all (a)):**
- **Engine D files by the year** — joint through the year of the first death, Single from the next (IRS Pub. 501), as Engines A, B and C
  do — and **taxes Social Security with `taxableSS86`**, provisional income including the year's realized gain.
- **Its table, standard deduction and age-65 extra come from `projectBracketsAt`**, the Roth tab's projection, indexed 2%/yr; Engine D holds
  no bracket figure of its own. **The rate is read on ordinary taxable income** (DC-1): gain still counts toward §86 and MAGI, but it is
  taxed at capital-gains rates on the Taxes tab. No OBBBA senior bonus (DC-2), as on the Roth tab. 35% and 37% can show.
- **Display only, and asserted so:** every balance, draw, RMD, conversion and gain in the schedule, the series the Taxes and IRMAA tabs
  import, and Engines B and C are bit-identical to v6.11 on ten households at two conversion amounts. Engine D's MAGI changes (it carries
  the worksheet's taxable Social Security); nothing outside this column reads it. Each row now publishes `ssTaxable`, Engine B's name for
  the same figure.
- **The table says what the column is** (DC-3): one sentence under the schedule's note.
- **Three sentences that misstated the rule elsewhere** (DC-4): the IRMAA tab's footnote said "the simplified 85%-of-SS assumption" (false
  since v5.77); the Taxes tab's said "Federal brackets are MFJ" (false in single and widowed years); the Roth tab's assumptions said "85%
  taxable when provisional income > $44K". Each now states the rule the engines apply.

**Also in this package.** **C-10** (a Roth IRA under Other accounts realizing gains) was fixed at v6.09 by D-35 without that scope citing the
ID; the register row is corrected, and **E-22** / **E-25** in `ARCHITECTUREIssues.md` updated. **OPERATIONS §C** gains a harness trap found
writing `t75`: the DOM bundle carries its own copy of the app module, so a rendered table must be compared against `window.__g`, not the
ESM module the suite imported — `t75`'s E-1 setup check caught a first draft comparing a 25-row table with a 16-row fixture.

**Tests.** New suite **`t75`** — **50** on v6.12, **45** on v6.11 (that leg pins v6.11's column as dated `[KNOWN DEFECT]` checks): an
independent oracle — its own worksheet, its own Rev. Proc. 2025-32 tables, its own indexing and filing rule — reproduces `ssTaxable` and
MAGI to the cent and the bracket in every year of ten households (the five measured, the slider's default conversion, survivor A, a
survivor under 65, a big-gain brokerage, a 35%-band single), and each leg is reproduced by its own rule set and not by the other's (A);
the hand-verified pins (B); v6.11 → v6.12 bit-identity of everything but the column (C); by AST, Engine D calls the helper and the
projection, reads no bracket constant, and **no `× 0.85` product survives outside `taxableSS86`** (D); the rendered Withdrawal table cell by
cell, the new sentence and the three corrected ones (E). Controls `qa/tools/controls_v612_c5.py` (repo-only): **11 of 11** — ten planted
defects (flat 85% back, the joint table always, the death year filed Single, indexing dropped, the age-65 extra dropped, gain back in the
rate's input, a private `× 0.85` in Engine C, the oracle's filing switch dropped, the 32% cap back, the sentence removed) and the unmutated
run, each turning its named checks red, every file restored and hash-checked. **Re-gated:** `t14` — Engine D gained a filing concept, so its
death-guard check MOVED as the suite's own note required: Engine D joins `filingEngines`, and its window must hold exactly one `>` against
the death year (the filing switch) and both `>=` guards; a weakened guard still fails (controlled by hand: 2 red) (44 → 47). `t19`'s
source checks read `_ordOtherD` and the MAGI line together, and its mixed-pool lifetime MAGI moves $3,191,209 → $2,960,678, with a second
check decomposing the whole move into Social Security (67 → 68). `t20`'s "ordinary income" subtracts the row's own `ssTaxable`, its
original meaning (unchanged count). `t40` A1's residual subtracts each leg's own taxable SS (gated per leg; unchanged count). `t43` E-2 adds
Engine D as a helper caller, gated per leg (37 → 38). `domdiff` masks the Bracket cells for this pair only, counted on both sides,
with two checks that the mask bit and the cells moved (32 → 34). `v612` registered by AST (306 sites; `t1`'s `verStr` and `t4`'s `_badge` skipped, because they select a value), with the three Python suites,
`t1`'s and `t4`'s version arms and `t33`'s PINS by hand (Engine A cannot move). The boundary census does not grow: the defect was not
hidden by the example household (OPERATIONS §K1).

**Suite, run from the packaged copies:** **6,831 app checks across 74 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 34, `sets` 12 + 12; **GRAND 6,963**. Against v6.11's line, the counts that moved are `t14` 44 → 47, `t19` 67 → 68, `t43` 37 → 38, and `t75` is new; every other current-leg count is unchanged. The app total reconciles with v6.11's 6,712: + 95 (`t75`, both legs) + 6 (`t14` +3, `t19` +1, `t43` +1 on each leg) + 18 (`t74`'s prior leg is now v6.11 — 34 checks where v6.10's leg ran 16) = 6,831. Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v611 v612` from a fresh clone of `8e5133a` carrying exactly the packaged changes (72 files, each overlay compared byte for byte with the build workspace; every changed suite's run-folder copy 66 of 66 identical), v6.11 resolved from history (commit `8e5133a`). Source `fc8d2a5f98a1f68314a57214db845426` · built `bc19a24e446ab595ea8975f6fe4191a4` (`smoke_built` 22 passed, 0 failed); v6.11 rebuilt first from its own source to its published `ff3c5d7e…`.

**Limitations, disclosed:**
- The column is the federal marginal rate only; state tax is on the Taxes tab.
- Thresholds rise 2%/yr while the schedule's income rises with the scenario's inflation (about 2.7%), so some bracket creep remains — the
  conservative direction, as in every engine (METHODOLOGY §6).
- The temporary OBBBA senior deduction (2025–2028) is not applied in this column, as on the Roth tab; the Taxes tab applies it. For a
  household retiring in 2029 or later it never applies.
- Worksheet lines 4 and 6 (tax-exempt interest, adjustments) are not modelled, as in every engine. Qualifying-surviving-spouse filing is not
  modelled (the app has no dependants).
- The age-65 additional deduction ($1,650 / $2,050) is the app's own 2026 constant; it was not re-read against Rev. Proc. 2025-32 in this
  release's sessions (the two summaries consulted do not carry it). The brackets, standard deductions and §86 amounts were.
  *Resolved at v6.13 (2026-10-15):* read against Rev. Proc. 2025-32 §4.14(3) itself — $1,650 married, $2,050 unmarried — and equal. It had
  also been verified in the v5.73 audit's register (`docs/FlawsToFix-v5_73-Phase2.md`, the constants table), which this entry missed.

## v6.11 — the Ranking tab's headline is the net-worth band, and the tab stops claiming what it does not measure

**A PRESENTATION release** — no engine reads anything it changes; MC parity unchanged. METHODOLOGY gains a short section (what is ranked
and what is not), because v6.10's section said the headline problem was left open. `docs/SCOPE_F19R_RANKING_HEADLINE.md` (repo-only,
fulfilled). The finding is `docs/UsabilityFlaws.md` **F-19r**, filed at v6.10. Steve took all six recommendations: "Let's use your
recommendations for the decisions on §4."

**What was wrong (v6.10, measured with the Monte Carlo re-run for each household).** The headline "Overall tier: TOP N% of Americans age …"
and the Bottom Line's "you would rank in the top N by virtually every dimension" were the plain average of nine row tiers. Five were fixed
strings (Debt Load TOP 20%, Roth Strategy TOP 10%, Healthcare Planning TOP 5%, Housing Equity TOP 15%, Planning Sophistication TOP 5%), two
came from thresholds on the household's own figures, and two from the SCF — so every possible household read **between TOP 9% and TOP 18%**
(all 72 reachable combinations enumerated). A $20,000 portfolio with no home, about the 2nd percentile of net worth, read **TOP 18%**, "an
exceptionally strong position … a structural one", "You have all three", "fewer than 10% of your peers possess" and "ACA bridge + Medicare
+ hybrid LTC"; the example household read TOP 14%.

**What changed on the tab (decisions DF-0 to DF-5, all (a)):**
- **The headline is the net-worth band** against U.S. families 55–64, labelled "Net worth position … of U.S. families age 55–64 (Fed SCF
  2025)". Nothing else moves it: two households at the same $2.00M net worth, one at 100% Monte Carlo success and one at 0%, now read the
  same TOP 25% (v6.10: TOP 13% and TOP 17%). The nine-way average is gone (DF-1). **The example household's headline moves from TOP 14%
  to TOP 25%** — its net-worth band — the conservative direction.
- **Net Worth gains its median band** (`nwCuts.p50`, already in the table): below the median it reads "Below the median" instead of TOP 50%.
  **Portfolio Size loses its floor:** at or below the 90th percentile of financial assets it reads "Below the top 10%" instead of TOP 25%
  (DF-4). No new data.
- **Four rows are no longer ranked** — Retirement Readiness, Debt Load, Income Replacement, Housing Equity show the household's own figure
  beside a survey figure, with "—" for tier and ratio. **Three rows are removed** — Roth Strategy, Healthcare Planning and Planning
  Sophistication described every household with facts the app does not know (DF-2). Housing Equity no longer says "cash-purchase plan".
- **Figures, not verdicts** (DF-3): the header gives the national net-worth percentile and the portfolio multiple; the "Planning advantage"
  block is removed; the Bottom Line states the net-worth position, the percentile, the multiple and the household's guaranteed income beside
  the average award; the affluent card states one verdict and the percentile, drops "you're around the middle" and "pointing to the upper
  end of that range", and shows "below entry" rather than a 0th percentile among a group the household is not in. One national percentile,
  computed once, feeds the header, the affluent card and the Bottom Line.
- **"Nx avg SS" is gone** (DF-5): it divided a couple's combined Social Security and pension by one retired worker's average award. The two
  figures are shown side by side, labelled. The MC success card says EBRI's 47% is a different measure.
- **The table's subtitle** says which rows are ranked; its column header reads "Survey figure" (was "Peer benchmark (age 62)"). **The Field
  Manual's Ranking entry** says which two rows are ranked and names the four that are not.

**The scope's own errors, corrected while building.** §3 proposed "Peer benchmark (ages 55–64)" as the column header; the EBRI and SSA
figures in that column are not 55–64 figures, so it reads "Survey figure". And F-19's filed measurement (TOP 15% at $20,000) was taken
without re-running the Monte Carlo; the real figure is TOP 18% (recorded in UsabilityFlaws and the scope §0b).

**Also in this package.** **F-19 was used twice** (the v5.39 skins finding and this one); the census now calls them F-19s and F-19r and gives
F-19s the row it never had (DF-0 (a)); shipped entries keep the bare number. **OPERATIONS §C** gains the trap that mis-measured F-19:
`applyLoadedData` does not re-run the Monte Carlo.

**Tests.** New suite **`t74`** — **34** on v6.11, **16** on v6.10 (that leg pins v6.10's behaviour as dated `[KNOWN DEFECT]` checks): the
render's structure by AST — six rows, every assigned "TOP N%" literal is the net-worth band or Portfolio Size's tier, the four unranked rows
carry "—", nothing averages the rows (A); the headline follows net worth and nothing else, behind a **setup check (B-1)** that the Monte
Carlo really re-ran for two households that must differ (B); every net-worth cut-off — p50, p75, p90, p95 — priced exactly at it and $1
above on both the headline and the row, and the portfolio floor (C); the copy for a 2nd-percentile household carries none of seventeen
verdicts or unmeasured claims, the Bottom Line states the headline's position, one national percentile in three places, one verdict on the
affluent card, the table's rows and header (D); the Field Manual (E). `t73` C-3 gated per leg (the Portfolio Size floor) and its row reader
taught the two below-band labels. Controls `qa/tools/controls_v611_ranking.py` (repo-only): **9 of 9** — eight planted defects (the average
back, a fixed row tier back, the praise back, the median band dropped, the portfolio floor back, the Field Manual sentence back, the test
skipping its Monte Carlo re-run, a second affluent verdict) and the unmutated run, each turning its named checks red. `v611` registered by
AST (303 sites), with the three Python suites, `t1`'s and `t4`'s version arms and `t33`'s PINS by hand; `domdiff`'s v6.10 banner set-aside
was left pair-specific on purpose (on v6.10 → v6.11 both sides show the same banner). The boundary census does not grow — the defect was not a
household condition (OPERATIONS §K1).

**Suite, run from the packaged copies:** **6,712 app checks across 73 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12; **GRAND 6,842**. Every current-leg count equals v6.10's but the new `t74`; the v6.10 leg equals v6.10's own counts but `t74` (16, pinning v6.10's behaviour). Run from the PACKAGED copies in one pass: a run folder built by `mk_runfolder.sh v610 v611` from a fresh clone of `1a64be5` carrying exactly the packaged changes (68 files, each overlay compared byte for byte with the build workspace; every changed suite's run-folder copy 60 of 60 identical), v6.10 resolved from history (commit `89963eb`). Source `35f3c6560cf8da1b984de77e07a4cf8b` · built `ff3c5d7ee91595a4f4634a4aa56f4103` (`smoke_built` 22 passed, 0 failed); v6.10 rebuilt first from its own source to its published `93ff44d5…`.

**Limitations, disclosed:**
- The national percentile is interpolated between the SCF cut-offs (log-linear above the median, linear below), so between them it is
  approximate; the tab says "about".
- The four unranked rows still show survey figures that measure different things (EBRI's share of workers on track, the mean debt of
  families holding any); each is now labelled as such, and none is ranked or turned into a ratio.
- The EBRI, AALTCI and Roth-plan percentages in "The broader context" are carried from v6.09, unverified, as before.
- "Which benchmark?" still calls Empower's engaged savers "the crowd you actually belong to"; it is outside this scope's sites and is left
  as it was.

## v6.10 — the Ranking tab's peer benchmarks move to the 2025 Survey of Consumer Finances, computed from the Fed's microdata

**A DATA AND PRESENTATION release** — no engine reads these figures; METHODOLOGY gains a section saying where each comes from.
`docs/SCOPE_PEER_DATA_SCF2025_V610.md` (repo-only, fulfilled). The Events tab's alarm "Peer-benchmark data refresh (Ranking tab)" opened
this month; Steve: "Can you download and apply the data refresh mentioned here?" — and he took all four recommendations (DD-1 (a) the
SCF figures plus Empower; DD-2 (a) compute the portfolio tiers; DD-3 (a) relabel the Social Security figure; DD-4 (a) record the headline
problem as its own finding).

**The data.** The Fed released the 2025 SCF on 2026-10-09. The session's network cannot reach federalreserve.gov, so Steve attached the
Summary Extract Public Data (`scfp2025excel.zip`, md5 `c938318c…`: 4,360 families × 5 implicates). The new `qa/tools/peer_scf.py`
computes every SCF figure from it: all five implicates pooled with the extract's weight (`WGT = X42001/5`, the Fed's own convention),
families whose reference person is 55–64. **It checks itself before it prints anything:** its median and mean net worth for ages 55–64
must agree with the Fed's published Bulletin figures within 2% (internal vs public data). Measured: **$411.3K vs $411.9K (−0.14%), and
$1,871.0K vs $1,878.0K (−0.37%)**; the mean retirement savings, $670,248, matches the Bulletin's $670.2K. Its output is
`docs/PEER_SCF2025_figures.txt`, so the figures can be re-derived instead of trusted.

**What changed on the tab.**
- **One table.** Every peer figure lives in one module-level table, `PEER_BENCHMARKS`, beside `PEER_DATA_SCF_YEAR` (now **2025**).
  Through v6.09 the net-worth cut-offs were typed at three sites, two figures were repeated inline in prose, and the survey year was typed
  as text at three sites. **Proved separately, before any 2025 figure existed:** staged with v6.09's own values, the Ranking and Events
  tabs rendered identically to v6.09 on twelve households chosen to straddle every cut-off.
- **The 2025 figures** (2025 dollars): median / mean net worth $411,340 / $1,871,019; tier cut-offs at the 75th, 90th and 95th
  percentiles **$1.42M, $3.46M, $7.55M** (v6.09: $780K, $1.9M, $3.2M); the affluent band's "typical affluent", now defined as the 87.5th
  percentile, $2.93M (v6.09: $1.55M, no recorded definition); retirement savings median / mean $239,000 / $670,248; debt $101,000 /
  $197,305; under $100K saved **61%** (v6.09: 40%); mortgage at 60+ 33%.
- **Portfolio-size tiers from data (DD-2):** the 90th and 95th percentiles of 55–64 families' financial assets, **$1.95M and $4.93M**,
  replace an unsourced $800K and $1.5M.
- **Social Security, relabelled (DD-3):** "Avg Social Security at 62: ~$2,000" was SSA's all-ages average under an at-62 label. It now
  reads "Avg Social Security award (SSA, 2024)" at **$2,036** (Annual Statistical Supplement 2025, Table 6.B3; awards reduced for early
  claiming average $1,620), and the cards compare with "avg SS award" rather than an "SS-only retiree".
- **Empower** to its September 2026 figures ($1,080,916 / $463,328 for savers in their 50s, $1,247,718 in their 60s).
- **The Field Manual** names the 2025 survey and the next one (2028, publishing ~fall 2029) in the Ranking entry and the vintage table,
  and no longer calls the figures "hand-entered approximations".
- **The alarm clears:** the Events tab now reads "next refresh: 2028 SCF, publishes ~Oct 2029".

**The v6.09 cut-offs were far below the 2025 ones, and their source is unknown.** Three years of growth does not explain it — the
Bulletin's mean for the group rose 9.5% in real terms. The same 2025 extract gives **all-ages** cut-offs of $813K (75th) and $2.54M (90th),
so the old figures are consistent with an all-ages table read as the 55–64 one. **Not confirmed:** that needs the 2022 extract, which the
build did not have. **Direction — conservative:** on the example household net worth falls from TOP 10% to TOP 25%, portfolio size from
TOP 5% to TOP 25%, its national percentile from about the 90th to the 81st, and the headline from TOP 11% to TOP 14%.

**Recorded, not fixed (DD-4):** the headline "TOP N%" averages nine dimension tiers and eight have no peer data behind them — five are fixed
strings. `docs/UsabilityFlaws.md` **F-19**, for its own scope.

**Tests.** New suite **`t73`** — **56** on v6.10, **31** on v6.09 (that leg pins what v6.09 shows): the table's values against
`peer_scf.py`'s output and the Empower and SSA publications (A); one table, by AST — the Ranking render's only six-figure literals are the
home fallbacks and the $M divisor, and no table dollar figure is typed anywhere else (B); every tier cut-off priced from both sides on the
rendered tab, exactly at it and $1 above (C); the vintage copy, the relabel and the Field Manual (D); the alarm in October 2026 and January
2027 (E). **Before this release nothing in the suite asserted a Ranking-tab figure.** Controls `qa/tools/controls_v610_peer.py`
(repo-only): **9 of 9** — eight planted defects and the unmutated run, each turning its named checks red. The suite and its controls were first
exercised on a dry-run build carrying deliberately synthetic figures (never shipped). **Existing suites:** `t72`'s §D differential takes its
designed skip on this pair (19 on both legs). `domdiff` sets aside the shell's action banner for this pair only: it names the most urgent
open event on the run date, and on 2026-10-13 that is the peer alarm on v6.09 but not on v6.10 (32). The shim exports
`PEER_BENCHMARKS`, `PEER_DATA_SCF_YEAR` and `computePlanEvents`, guarded. `t33`'s PINS carried. `v610` registered by AST, the three Python
suites, `t1`'s and `t4`'s version arms and `t33`'s PINS by hand. The boundary census does not grow — the stale figures were not a household
condition (OPERATIONS §K1).

**Also in this package — the manifest names the Vite config correctly.** Found at the v6.09 verification: its row said `vite_config.js`
and claimed the pool flattens the inner dot. The pool holds `vite.config.js`, as every Projects listing since 2026-10-08 shows; the mangled
name was an old session mount's (OPERATIONS §G). `package_check` K-8 and K-12 could not see it because every post-ship check since then ran
against a local pool copy that kept the mount's name — **the v6.09 verification included**, which reported K-8 and K-12 green. Corrected in
three places.

**Suite, run from the packaged copies:** 6,637 app checks across **72 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,767**. Every current-leg count equals v6.09's but `t72` (19 on both legs: its §D differential needs the v6.08 module, absent on this pair, and takes its designed skip) and the new `t73`; the v6.09 leg equals v6.09's own counts but `t72` (the same skip) and `t73` (31, pinning v6.09's state). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v609 v610 from the build workspace — a full clone of ab6f1b8 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.09 resolved from history, commit 2f25660) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6545, half B GRAND 222; none DIED. Source `1b41119b4e8d217a35956de42c09d4eb` · built `93ff44d52b126d3431687a1c51e69f3e` (`smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- Peer figures are in 2025 dollars and are not indexed, so they sit about a year of inflation behind a plan stated in today's dollars
  (the optimistic direction for the user's rank, slightly).
- The extract is the Fed's **public** data; its figures differ slightly from the Bulletin's internal-data ones (measured above).
- The EBRI "on track" and "nothing saved", AALTCI LTC and Roth-plan percentages are carried from v6.09 and were **not** re-verified; no
  primary source for EBRI's 47% was located.
- The Portfolio Size tier still reads TOP 25% below the 90th percentile, even far below the 75th; it is part of F-19.

## v6.09 — D-35: a Roth IRA entered under Other accounts is counted once in the Withdrawal tab, as Roth money

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md` (repo-only, fulfilled). Steve: "Let's build D-35" — and
he took both recommendations: fix both halves together, and show each dollar once on the Withdrawal tab.

**What was wrong.** Engine D (`computeWithdrawalPlan`, the Withdrawal tab — whose spending-draw and realized-gain series Engines A, B and C read)
holds every Other account in its Priority-1 pool, and counted a Roth IRA there **twice** (parser census; found scoping v6.08):
- **as brokerage:** the pool's gains-bearing part took out ordinary and HSA money but not Roth money, so the Roth IRA's growth was booked as
  capital gain when spent — wrong in law (a qualified Roth distribution is not income, 26 U.S.C. §408A(d)(1)) — and the gain reached the Taxes
  and IRMAA tabs; the conservative direction;
- **inside the buckets' Roth share** (`_rothInit / _t401kInit`, with `_rothInit` holding every Roth dollar), so the buckets' Traditional share
  and every bucket RMD were understated; the optimistic direction.
The tab showed it twice too: in the Priority-1 card's starting balance and again in the Roth card's. Engines A, B and C were already right.

**What changed.** The Roth money sits in the pool's tax-free remainder (with the HSA money and, since v6.08, converted IRA money), so spending it
realizes nothing; the buckets' Roth share is the holdings' Roth only, as their Traditional share has been since v5.26. `retireStartBalances`
returns the Other-account Roth total (`othRoth`) so Engine D reads one figure. The Roth card shows the holdings' Roth money; the Priority-1 card
says a Roth IRA entered under Other accounts sits there, is spent tax-free with no RMD, and is counted there only. METHODOLOGY gains a section, a
line in the tax-type list and the v6.08 section's cross-reference.

**The check that it is right:** a Roth IRA under Other accounts and the same money as brokerage sit in the same pool and differ only in tax
character, so their buckets must be identical — and from v6.09 they are, year by year (`t72` §A). **A household with no Roth IRA under Other
accounts does not move** (the example household holds none): Engines B, C and D and the Roth tab's strategies bit-identical for the example at $0
and $70,000, its single-filer variant, its brokerage twin and an IRA-heavy household. The Monte Carlo does not read Engine D.

**Measured** (engines at module level; the shipped source): on the example household plus Roth IRAs under Other accounts, at $70,000 a year unless stated — with $200,000 of Roth IRA, the Withdrawal tab's lifetime RMD $343,192 → $470,488 (exactly its brokerage twin's), realized gain $29,227 → $2,777 (the example's own brokerage), the Taxes tab's lifetime tax $215,825 → $215,702; with no conversion, lifetime RMD $1,067,582 → $1,199,313 and tax $227,145 → $227,019. With $500,000 of Roth IRAs: lifetime RMD $266,326 → $558,790, realized gain $196,853 → $4,909, lifetime tax $221,644 → $213,744. A single filer with $200,000: lifetime tax $220,145 → $221,830, lifetime IRMAA $3,450 → $1,150.

**Direction — both ways.** The Withdrawal tab's RMD and MAGI rise (the optimistic half goes) and the phantom gain on Roth money goes (the
conservative half). The Taxes and IRMAA tabs move a little either way: less gain arrives, and a higher bucket Traditional share makes each
spending draw from the buckets more ordinary.

**Tests.** New suite **`t72`** — **29** on v6.09, **17** on v6.08 (that leg pins the defect): the brokerage twin (identical buckets, RMD,
pool and ordinary draw, every year, at two sliders); no gain on an all-Roth pool and a dollar-exact pin on the $500,000 fixture; t71's oracle
extended to hold Roth money out, with the Roth total summed from the portfolio rows — it reproduces each leg to the cent under that leg's rules on
eight household × slider runs (RMD, conversion, pool, ordinary draw, the buckets' Traditional share, the gain and the gains part) and misses the
other leg's by more than $1,000; v6.08 → v6.09 bit-identity for five households that must not move; the two cards in the DOM. Controls
`qa/tools/controls_v609_engine_d_roth.py` (repo-only): **6 of 6** — five planted defects, each turning its named checks red.
**Before this release no check reached this path**: the whole suite passed unchanged against the prototype. **Existing suites:** `t71`'s §E
(the v6.07 → v6.08 differential) takes its designed skip on this pair — 26 on both legs; `domdiff`'s byte-identity check sets aside
exactly the new Priority-1 sentence for this pair only — 32. **The boundary census grows (OPERATIONS §K1):** `oth_roth` (a Roth IRA
under Other accounts) reads ON for the example household — the condition that hid this — with a fixture clearing it; `t29` 69 on both
legs. `t33`'s PINS carried. `v609` registered by AST, the three Python suites, `t1`'s and `t4`'s version arms and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,558 app checks across **71 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,688**. Every current-leg count equals v6.08's but `t29` (69 on both legs: the new census row), `t71` (26 on both legs: §E's v6.07 differential takes its designed skip on this pair) and the new `t72`; the v6.08 leg equals v6.08's own counts but `t29`, `t71` and `t72` (17, pinning the defect). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v608 v609 from the build workspace — a full clone of c76c385 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.08 resolved from history, commit b6eb255) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6466, half B GRAND 222; none DIED. Source `a32ef4531f4b46e18d26ad9accd8a00a` · built `df3d3e7e71df9690ba7183b5411bf653` (`smoke_built` 22 passed, 0 failed).

**Found at the final run, fixed before the figures above:** `t19` asserts the exact set of names Engine D returns (the contract with the
Withdrawal tab's JSX), and the Roth card's new `_rothOth` made it 18 where it pinned 17 — one red check. The scope's prototype run had the engine
change but not the card, so it could not see this. The contract now names `_rothOth` (67 checks, as at v6.08), and half A was re-run whole on
the corrected file; half B had completed green and reads only the built page.

**Limitations, disclosed:**
- The Priority-1 pool — a Roth IRA under Other accounts included — is still spent first, the opposite of the usual advice to spend Roth money
  last; the draw order has not changed since v5.26 (the conservative direction: Traditional money grows longer).
- Every Roth dollar is treated as a qualified distribution; the five-year rule and withdrawals before 59½ are not modelled, here or for the
  holdings' Roth money.
- A household with no holdings at all (load heals `total401k` to the whole household) is still not examined.

## v6.08 — D-34: the Withdrawal tab converts a Traditional IRA entered under Other accounts, and carries it as an account

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md` (repo-only, fulfilled). Steve: "Let's do D-34" — and he
took every recommendation on the four decisions: bucket money first, then the IRA; fix the IRA's RMD tracker in the same release; file the Roth
finding separately; one sentence on the Withdrawal tab plus METHODOLOGY.

**What was wrong.** Engine D (`computeWithdrawalPlan`, the Withdrawal tab — and the spending-draw series Engines A, B and C read) holds a Traditional
IRA entered under Other accounts in its Priority-1 pool. Three things about it, all found or confirmed by parser census and measured:
- **The conversion (D-34 as filed, and a third term).** Its cap was the buckets' pre-tax money less the year's whole RMD, figured before the draws: the
  RMD it subtracted included the IRA's, which never leaves the buckets; it ignored the year's bucket spending draw, so where the slider outran the
  buckets it converted money already spent (one year, $1,486–$3,180, at sliders of $150,000 and up on the example household — `tradAmt`'s floor hid
  it); and the IRA itself was never converted, though Engines B and C convert it.
- **The IRA's RMD tracker never grew** — no growth site at all (`taxRmdA`/`taxRmdB`: init, the RMD read, the shrink). An RMD is figured on the IRA's
  prior year-end balance (Treas. Reg. §1.408-8(b)(2)), so this understated it: the optimistic direction. Not on record anywhere before this scope.
- **The IRA's RMD left it pro rata** across the whole pool's draw instead of whole, so where the pool also held brokerage, HSA or annuity money the
  IRA gave up less than its RMD.

**What changed.** The conversion is figured after the year's draws: the buckets' pre-tax money left after their own RMD and the Traditional share of
the year's spending draw first, then the IRA's RMD-bearing money left after its RMD and draw. An RMD is never converted (§1.408A-4, Q&A-6); annuity
money is never in the IRA's figure, so never converted (D-33). Converted IRA money leaves the ordinary and RMD-bearing figures and stays in the pool
as tax-free money; no balance moves. The IRA's figure grows at the pool's rate inside its ordinary money, and its RMD leaves it whole — the two rules
the ordinary figure has followed since v5.36. The Withdrawal tab says where a conversion comes from in one sentence (the order is the model's
assumption, and the conservative one); METHODOLOGY gains a section and two cross-references. Each schedule row publishes `convSleeve_y` and
`rmdSleeve_y` (the IRA's parts of `conv_y` and `rmd_y`) for the tests and the boundary census; no figure reads them.

**The example household does not move** at $0 or $70,000 — Engines B, C and D and the Roth tab's strategies bit-identical, field by field — because
its $104,000 of Other-account IRAs is spent as Priority-1 money long before RMD age and its buckets cover the slider. At $150,000 and up one year's
Withdrawal-tab conversion falls by what that year's spending draw had taken ($105,857 → $103,185 in 2035 at $200,000); the Taxes, IRMAA and Roth tabs
do not move. The Monte Carlo does not read Engine D.

**Measured** (engines at module level; the shipped source): on a household with $150,000 of holdings, a $900,000 rollover IRA under Other accounts and $300,000 of cash — with no conversion, the Withdrawal tab's lifetime RMD $430,216 → $653,901 and the Taxes tab's lifetime tax $144,301 → $132,864; at $70,000 a year the Withdrawal tab converts $840,000 where it converted $50,000, and the Taxes tab's lifetime tax $157,906 → $143,437. A second household (holdings at 20 %, IRAs of $700,000 and $200,000, a $100,000 annuity): with no conversion lifetime RMD $576,672 → $792,387 and lifetime tax $171,559 → $161,009; at $70,000 converted $247,783 → $840,000 and lifetime tax $193,967 → $173,733. IRMAA unchanged on both.

**Direction — two ways, and the second is a correction.** The Withdrawal tab's RMD and MAGI rise where the IRA reaches RMD age unconverted. The Taxes
tab's lifetime tax falls on such households because Engines B and C already converted the IRA themselves while the draw series Engine D handed them
still taxed it as ordinary money — on the first household above at $70,000, in twelve years Engine B's own Traditional balance was $0 at the start of
the year while it still charged $137,056 of imported ordinary draws; with the fix, none.

**Tests.** New suite **`t71`** — **40** on v6.08, **21** on v6.07 (that leg pins the defects): an oracle re-implements the pool's
trackers, the RMD, the conversion, the ordinary draw and the buckets' Traditional share year by year with its own divisors and start ages, in both
rule sets — it reproduces each leg to the cent under that leg's rules on ten household × slider runs and misses the other leg's by more than $1,000;
five extinction invariants over six households × four sliders (never more than is left, never short while money remains, an all-annuity pool converts
nothing, RMD-bearing ≤ ordinary, nothing after the window); five dollar-exact pins that flip; v6.07 → v6.08 bit-identity for the households that must
not move (Engines B, C, D and the strategies); the Withdrawal tab's sentence and its "Roth converted" card in the DOM. Controls
`qa/tools/controls_v608_engine_d_ira.py` (repo-only): **10 of 10** — nine planted defects, each turning its named check red.
**Existing suites:** `t19`'s ledger gains v6.08's tracker rules and a check that it reproduces the IRA's RMD every year, and its mixed-pool MAGI pin
moves $3,162,820 → $3,191,209 — all of it the RMD (+$28,389.02 in both; `othOrdDraw` unchanged, now pinned) — 67 checks; `t70` F-2 gated per leg
(Engine D's cap expression), and its §D differential takes its designed skip on this pair (it needs `app_v606.mjs`) — 33 on both legs, as `t69`'s
did at v6.07; `domdiff`'s byte-identity check sets aside exactly the new sentence for this pair only — 32 (the v6.06 → v6.07 branches no longer
run). **The boundary census grows (OPERATIONS §K1):** `oth_ira_rmd` (an Other-account IRA reaching an RMD in Engine D) and `d_conv_cap` (the
Withdrawal tab's cap binding at the opening slider) both read ON for the example household — the two conditions that hid these defects — with a
fixture clearing each; `t29` 66 on both legs. `t33`'s PINS carried (its P passes no draw series). `v608` registered by AST, the three Python
suites, `t1`'s and `t4`'s version arms and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,515 app checks across **70 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,645**. Every current-leg count equals v6.07's (with `t13` at 53 from the ops package) but `t19` (67: the ledger reproduces the Other-account IRA's RMD, and `othOrdDraw` is pinned), `t29` (66 on both legs: the two new census rows), `t70` (33 on both legs: §D's v6.06 differential takes its designed skip on this pair) and the new `t71`; the v6.07 leg equals v6.07's own counts but `t29`, `t70` and `t71` (21, pinning the defects). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v607 v608 from the build workspace — a full clone of e01db32 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.07 resolved from history, commit 4cb6859) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6423, half B GRAND 222; none DIED. Source `a739b64a9228ab4fd69fa8226552497b` · built `2e869c23540b8f8e851f714cb0c7ef2b` (`smoke_built` 22 passed, 0 failed).

**Found at the build, fixed before the final run:**
- The first controls run missed two: reverting "the IRA's RMD comes off bucket money" moved no total, because the IRA now tops up any shortfall —
  `t71` D-5 asserts where the 2039 conversion came from (all bucket money), and it fires; and "the converted IRA stays RMD-bearing" fires on the
  second household, not the first, whose IRA is converted away before RMD age (the control's expectation was wrong, not the coverage).
- A third — `tradAmt` taking the whole conversion instead of its bucket part — is an **equivalent mutant**: the IRA converts only in a year whose
  bucket conversion took the whole bucket cap, so the Traditional fraction becomes 0 on either expression. Dropped from the controls and recorded in
  the script; the source keeps the expression that says what is meant.
- D-5's fixture had to be found by a sweep: the cap can bind through the IRA's RMD only in an RMD year inside the ladder window (2039–2040 here) with
  bucket money between the slider and the slider plus the RMD.
- **The Roth finding is filed as D-35, not D-36** as the scope draft and the decision question named it — D-35 was the next free ID; corrected.
- **The first run of half A was interrupted** — the session's shell was killed while it stood at `t56` (an environment interruption: no suite
  had failed). Half A was re-run whole from the same run folder, every changed file first re-checked against the workspace; the figures above are
  the re-run's. Half B had completed and was not re-run.
- **Found at the ship rehearsal, fixed in this package: `package_check_controls.sh` P75 reported a FINDING that was the control's own.**
  P74/P75 (added by the ops package of 2026-10-12) start from the newest manifest and assumed that was the ops package's whenever one was given;
  here the app package is newer, and the ops manifest — naming `DangerClose-v6_07.jsx` and `dom_entry_v607.jsx` after their rotation — made K-12
  red before any row was planted. They now start from the first manifest (app package, ops package, clone) on which an unmutated K-12 is green
  against the pool given, and report a FINDING if none is. Both phases re-run after the fix.

**Limitations, disclosed:**
- The order between bucket money and the IRA is the model's assumption; Engine D converts on the household's single ladder window, not each spouse's.
- **Found while scoping, not changed — filed as `MissingFeatures.md` D-35:** a Roth IRA entered under Other accounts is counted twice in Engine D —
  as gains-bearing brokerage in the pool and inside the buckets' Roth share (measured: $200,000 of it understates lifetime RMD by about $127,000 against
  the same money as brokerage, and books $29,227 of capital gain on Roth money).
- A household with no holdings at all is healed at load to `total401k` = its whole household, so Engine D holds every dollar in the buckets — seen
  while building fixtures and **not examined**; every fixture here carries holdings.

## ops 2026-10-12 — E-29 (b), (c), (g) and (i): `t13`'s counterfactual, E-1b through the manifest, K-12, the locked harness

**KIND: ops** — one suite, three QA tools, the harness lock and documents; **v6.07 stays current** (source `ee557028aba1dfb1acb5bb647f6c5630`, built `5b444023ed72ebca40c9d0443b2ddf05`). No app
source and no figure changes. `docs/SCOPE_E29_BCGI_OPS.md` (repo-only, fulfilled). Steve: "let's do the E-29 housekeeping package for items (b),
(c), (g) and (i)" — D-34 kept out (it changes Engine D; its own release) — and he took every recommendation on the four decisions.

- **(b) `t13` measured more than its name said.** Its survivor check reads the year-over-year MAGI drop at the first death in $K, ±$4K of
  85 % of the smaller SS check — and that drop also carries the RMD change from rolling the decedent's IRA to the survivor, plus a year's
  drift. New §E runs both cases through Engine C: the death effect (the same year, with no death against with it) equals the SS term plus
  the rollover's RMD change **to the cent** — case 1 (A dies) $17,082.82 = $13,260.00 + $3,822.82, case 2 (B dies) $12,653.31 = $13,260.00 − $606.69 — the SS term
  equals 85 % of the smaller check to the cent (the household is past §86 convergence), the RMD term's sign follows the survivor's age, and
  each engine run is tied to the DOM's death-year row. The DOM check keeps its band, renamed to what it reads; its comment no longer calls
  §86's 85 % "the engine's flat approximation". **`t13` 42 → 53.**
- **(c) `package_check` E-1b could not see four pool files.** It matched a `knowledge/` file to the repo by basename, so a file renamed for
  the flat pool (`tools_fixture.jsx`, `qa-baseline-README.md`) was skipped without a word and a multi-path one (`README.md`, `index.html`)
  with one. It now resolves those through the manifest's hash-row path cell, and names anything still unresolved. `qa-baseline-README.md`
  gained the hash row it needed — its pool copy verified byte-identical to `qa/qa-baseline/README.md` first. Controls P72, P73.
- **(g) K-12, the manifest → pool direction for every row.** Nothing checked a row without a hash that names a file no longer in the
  pool. K-12 requires every row of the manifest's three indexing sections to name a pool file or say `repo-only` (or `in neither the repo
  nor the pool`). **50 rows carried no such word** and are marked — 47 repo-only, and three scope files that were never committed
  (`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`, `SCOPE_FIX_irmaa_indexation_v5_13.md`, `SCOPE_FIX_roth_tab_filing_status_v5_14.md`).
  None deleted. The ID E-29 proposed, `K-10`, is taken (and `K-11`). Controls P74, P75. OPERATIONS §I documents the rule.
- **(i) The suite's harness is locked.** `mk_runfolder.sh` installed `jsdom`, `esbuild`, the acorn packages and the app's packages with no
  versions, so every run folder resolved them fresh (the run folder did not even use the app's own resolution: `mammoth` 1.13.0 against
  the app lock's 1.8.x). New `qa/harness/package.json` + `package-lock.json` pin the whole tree — the 184 packages v6.07's suite ran green
  on, entry for entry — and `mk_runfolder.sh` installs it with `npm ci`. `controls_runfolder_prior.sh` gains G (the run folder's tree is the
  lock) and H (a harness `package.json` out of step with its lock is refused): **8 passed, 0 failed**. The app's own build files
  are untouched; the built page's md5 is unchanged.

E-29 now holds (a), (h) and (j). OPERATIONS §B, §B2a, §I, §N3a and the E-1b notes updated; `ARCHITECTUREIssues.md` E-29 marks the four fixed.

**Suite, run from the packaged copies:** 6,442 app checks across **69 app suites**, 0 failed, 0 DIED (v6.07's 6,431, plus `t13`'s eleven);
MC parity 10/10; tooling `t21` 64, `domdiff` 37, `sets` 12 + 12; **GRAND 6,577**. Every count equals
v6.07's but `t13`. Run from the PACKAGED copies as two concurrent halves (the v5.87 method): run folders built by the PACKAGED mk_runfolder.sh v606 v607 — so installed from the packaged harness lock — from the workspace, a full clone of a7de0b9 carrying exactly the packaged changes, each changed suite and tool hash-checked against its run-folder copy. Half A GRAND 6355, half B GRAND 222; none DIED.

**Limitations, disclosed:** `t13` §E's RMD term is read off Engine C's own rows — the independent half is the SS term; K-12's vocabulary is two
phrases, so a row must use one of them; the harness lock pins what v6.07 ran on, and moving a version is a deliberate change with a full run.

## v6.07 — D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md` (repo-only, fulfilled). Steve: "let's do D-33" — E-29 kept for
separate builds — and he took every recommendation on the four decisions.

**What was wrong.** The Other-accounts type *Annuity* (a commercial, non-qualified contract) rides inside each person's Traditional pool as a share, and
through v6.06 the share was constant. Engines A (the strategy comparison), B (the Taxes tab) and C (the IRMAA tab), and the Roth tab's ladder, capped a
Roth conversion at the whole pool and B and C capped a QCD there too — so annuity money was converted and given away, which the law does not allow
(26 U.S.C. §408A(c)(5)(A), (e)(1) and (d)(3)(B) with §402(c)(8)(B): a Roth accepts a rollover only from an eligible retirement plan, and a §72 annuity
is not one; §408(d)(8)(B): a QCD comes only from an IRA). Less visibly, every RMD and conversion left the pool pro rata with the share held fixed,
draining annuity dollars the law never touches, so the model understated the annuity and overstated every later RMD — the related defect the census
found. The ladder also counted annuity money in its own RMD (open since v5.44).

**What changed.** The annuity dollars are carried. A conversion and a QCD are capped at the non-annuity balance; the RMD, any QCD above it and the
conversion leave non-annuity dollars only (in B and C split between the spouses by each one's non-annuity balance after the RMD); the spending draw is
unchanged — pro rata at the year's share; the share is re-taken every year on what is left. The state attribution gives a conversion no annuity money.
The ladder carries each spouse's annuity dollars: its cap, its own RMD and the with-conversion card use the balance less them. **Engine D (the
Withdrawal tab) and the Monte Carlo are untouched** — Engine D held the annuity in the Priority-1 pool all along (its function is byte-identical by AST).
**A household with no annuity is untouched:** every changed expression reduces to v6.06's operand for operand, and t70 re-checks that bit for bit.
The Field Manual says so in one sentence; METHODOLOGY gains a section and two cross-references.

**Measured** (scratch probe on the staged engines; the shipped source differs from it only by the Field Manual sentence): on the Taxes tab as it opens ($70,000 a year of conversions, 2 % yield, the plan's spending draws), the example plan ($7,000 of annuity, spouse B): lifetime RMD $573,803 → $569,505, total tax $215,911 → $215,219, conversions and IRMAA unchanged; the Roth tab's with-conversion RMD cards A $44,991 → $44,842 and B $3,178 → $2,962, so "Combined RMDs reduced by" rises $365. With B's annuity at $150,000: lifetime RMD −$85,295, total tax −$12,415, conversions unchanged. With a pool 96 % annuity: Engines B and C convert $88,717 instead of $280,000, Engine A's "current" strategy $104,067 instead of $452,949.

**Direction — not one way.** Ending the RMD drain lowers RMDs and the tax on them, so tax figures improve for a household holding an annuity: the model
had been forcing annuity money out through RMDs the law does not require. Ending impossible conversions lowers tax now and what reaches the Roth, so the
strategy comparison's estate figures move both ways (on the suite's Other-accounts household "current" rises $21,838 and the highest falls $43,880).

**Tests.** New suite **`t70`** — **36** on v6.07, **33** on v6.06 (that leg pins the defect by the same methods): the attribution;
an all-annuity pool converts and gives $0 in Engines A, B and C; Engines B and C's RMD and conversion every year to the dollar against an independent
recursion seeded from the `retireStartBalances` primitives (two households), with the v6.06 rule reproduced on the prior leg; Engine A's RMD path the
same way; v6.06 → v6.07 bit-identical for sixteen annuity-free runs of Engines B, C and D; the Roth tab's with-conversion cards to the dollar against an
independent ladder recursion on two households, and the ladder table's own RMD on the second; the four D-33 expressions by source text. Controls
`qa/tools/controls_v607_annuity_conv.py` (repo-only): **15 of 15** — fourteen planted defects, each turning its named checks red.
**Existing pins moved by the example's $7,000 annuity, each re-gated per leg with its figure and reason (never loosened):** `t1` S-2 and S-8 (the
ladder RMD and card expressions); `t23` B-1 and `t26` C-1, E-6, E-7, E-10 (the cards — E-10's "A unmoved" control now names the $149 move and why);
`t24` (its statute model carries the annuity); `t25` §B, C-1 (Engine C's MAGI 2039–2043, one for one past §86 convergence and ×1.85 inside it), and E-3/E-4,
which now measure the v5.47 HSA fix as an in-build difference because D-33 moved the absolute figures under them; `t40` A3, A5, B3, E1, E2, E4; `t42`
D-3; `t57` A5 inverted (a conversion carries no annuity). `t56` F-2 compares to the cent on v6.07 legs: Engine B's per-leg conversion split adds terms in
another order and Pennsylvania's 2042 state tax moved by 2 × 10⁻¹³ dollars. Parity declares `rothOther` (the only fingerprint holding an annuity) as moving;
the nine others are byte-identical. `domdiff` gains bounded v6.06 → v6.07 branches (figures differ, rows the same, every moved figure one $K step).
`t33`'s PINS carried (its P holds no annuity). `v607` registered by AST, the three Python suites and `t33`'s PINS by hand. The literal census of every
suite string and regex against the new source and METHODOLOGY: only the checks named here change outcome.

**Suite, run from the packaged copies:** 6,431 app checks across **69 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 37, `sets` 12 + 12; **GRAND 6,566**. Every current-leg count equals v6.06's but `t1` (181: S-8's v6.07 branch pins the carried annuity in two checks where v6.06's pinned the static share in one), `t69` (15 on both legs: its group B, the v6.05 → v6.06 differential, runs only in a folder holding the v6.05 module — by design, and it prints so) and the new `t70`; the v6.06 leg equals v6.06's own counts, `t69` and `t70` aside (33, pinning the defect). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v606 v607 from the build workspace — a full clone of 9edbffd carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.06 resolved from history, commit 9232406) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6344, half B GRAND 222; none DIED. Source `ee557028aba1dfb1acb5bb647f6c5630` · built `5b444023ed72ebca40c9d0443b2ddf05` (`smoke_built` 22 passed, 0 failed).

**Found at the build, fixed before the final run:** the first controls run missed one — reverting the ladder's own RMD on spouse A's annuity moved no
card, because A's conversion window has closed by A's first RMD year. `t70` gained E-5, which reads the ladder table's MAGI, and the control fires on it. METHODOLOGY's new section was reworded while the first full run was under way (three sentences; no check reads them — the literal census), so half A
was stopped and re-run whole on the final text; half B reads only the built page.

**Limitations, disclosed:**
- Engine A taxes the spending draw without draining it (v5.84), so in that engine the annuity share moves with RMDs and conversions only.
- The QCD cap still admits employer-plan dollars, which in law must reach an IRA first.
- The annuity's after-tax basis is still taxed as ordinary income; the draw order is unchanged.
- **Found while scoping, not changed — filed as `MissingFeatures.md` D-34:** Engine D converts bucket money only, so a Traditional IRA entered under
  Other accounts is never converted there, and its cap subtracts the Other-accounts RMD from bucket money.

## v6.06 — D-28 widened: a commercial annuity gets no retirement relief in the thirteen states whose law gives it none; Maryland's pension exclusion no longer reaches IRA money

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D28_ANNUITY_RELIEF_V606.md` (repo-only, fulfilled). Steve: "start on D-28", then, asked how wide, "census
all states first"; he took every recommendation on the four decisions.

**What was wrong.** The Other-accounts type *Annuity* is a non-qualified annuity — bought outside an employer plan or IRA. Through v6.05 its withdrawals and
conversions could use every state's retirement relief. D-28 suspected Pennsylvania. A census of all 25 taxing states that give retirement relief, read at
primary sources (the scope's §0.2 cites each; each of the thirteen affected states re-read by the build session itself), found the relief does not reach it in **thirteen**:
- **Arkansas, Delaware, Illinois, Iowa, Maine, Maryland, New York, Oklahoma, Pennsylvania and Wisconsin** limit their relief to employer plans and IRAs.
  Pennsylvania taxes it as interest income at any age (2025 PA-40 instructions, Code 7D); Iowa's rule names "nonqualified annuities"; New York's
  instructions name "an annuity contract purchased with your own funds".
- **Colorado and Michigan** admit it only once it pays out for life, which the model cannot tell from withdrawals — taken as not qualifying (conservative).
- **Mississippi**'s regulation speaks of annuities from a "retirement system or plan" and does not say whether a privately bought contract is one — the
  conservative reading is taken.
- In the other twelve (Alabama, Connecticut, Georgia, Kentucky, Louisiana, New Jersey, Rhode Island, and Montana, New Mexico, South Carolina's 65+ deduction,
  Virginia and West Virginia, whose relief is against any income) it qualifies, and nothing changes. Alabama's law is unclear too; its revenue department's
  own form routes all pension and annuity income into the exclusion, so it stays covered (Steve's decision).
- **Maryland's pension exclusion reaches no IRA money either** (Tax-Gen. §10-209) — disclosed as "not modelled" until now; modelled from this release.

**What changed.** Those thirteen rows carry a new field, `reliefKinds` — the categories their relief reaches; with the per-person split every in-app call
passes, the exclusion or exemption is netted against that eligible income only, at household level as before. Without the split nothing changes. Every
affected note says what the law admits; METHODOLOGY gains a section; the Field Manual names the thirteen. **Every change raises tax or leaves it unchanged.**

**Measured** (scratch probe, v6.05 → v6.06, Engine B): with $70,000 a year of Roth conversions (the Taxes tab), the example plan's lifetime state tax rises in Illinois $1,557 → $1,609, Michigan $986 → $1,030 and Pennsylvania $1,627 → $1,757, and in Maryland $75,530 → $101,679 (its IRA money and the annuity); with the annuity raised to $150,000, Illinois +$1,011, Michigan +$868, Pennsylvania +$2,530, Maryland +$29,224. In the ten other affected states the figure does not move for these households: their exclusion is capped, and the plan's other retirement income already fills the cap. Without conversions only Maryland moves ($108,536 → $120,031): Engine B reaches annuity money through conversions and draws, never through RMDs, and the example plan draws none (checked in Pennsylvania: no draw or conversion year without the slider). The calculator over every jurisdiction and a household grid: 3,264 calls over 51 jurisdictions, rows without the field byte-identical, 238 paying more, all in the thirteen — no call pays less.

**Found while measuring, not changed:** both engines take a Roth conversion pro rata from the Traditional pool, annuity money included, although a
non-qualified annuity cannot be converted. Filed as `MissingFeatures.md` **D-33**.

**Tests.** New suite **`t69`** — **19** on v6.06, **10** on v6.05 (that leg pins the absence of the field and Maryland's old note):
Pennsylvania hand cases to the cent (70/70 with $20,000 of annuity and $10,000 of IRA: **$614.00**, $0.00 at v6.05); v6.05 → v6.06 over every
jurisdiction — rows without the field byte-identical, none falls, the thirteen move, and each affected call equals the **v6.05 calculator** with its
excluded categories moved to `work`, to the cent; the classification of all 25 relief states (a state that gains relief later must decide its annuity
treatment), the field, the notes and the Field Manual derived from the table; all three call sites pass the per-person split (AST). Controls
`qa/tools/controls_v606_annuity.py` (repo-only): **7 of 7**. `t33`'s PINS carried (its household is in Georgia). `v606` registered by AST, the three Python
suites and `t33`'s PINS by hand. The literal census of every suite string and regex against the new source and METHODOLOGY: no existing check changes outcome.

**Suite, run from the packaged copies:** 6,360 app checks across **68 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,490**. Every current-leg count equals v6.05's, the new `t69` aside; the v6.05 leg equals v6.05's own counts, `t69` aside (10, pinning the absence of the field). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v605 v606 from the build workspace — a full clone of a3d0da6 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.05 resolved from history, commit 11c1d13) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6268, half B GRAND 222; none DIED. Source `a5ac49a570a2e776a26ad64536420566` · built `fa02504f34989cb2054de3f5d9e9138f` (`smoke_built` 22 passed, 0 failed).

**Found at the build, fixed before the final run:** `t67`'s group D (v6.02 → v6.03) was skipped only when `app_v604.mjs` sat in the run folder — true in
the two folders built since v6.04 and false in a v6.05 → v6.06 folder, where its D-0 then failed on both legs. The skip now holds on every leg but
v6.03's, the only one whose folder can hold `app_v602.mjs`; `t67` reads 118 on both legs, as at v6.05. An AST census of every version-pinned module test
in the suite found no other of that shape.

**Limitations, disclosed:**
- An annuity paid for life would qualify in Colorado and Michigan; the model has no payout field, so it never does.
- Mississippi's treatment is the conservative reading of an unclear rule.
- The annuity's after-tax basis is still taxed (the federal simplification METHODOLOGY discloses), so in Pennsylvania the taxable interest is overstated too.
- The exclusion stays netted at household level: no state applies a per-person own-income cap it did not already (RI, WV).
- Conversions still draw annuity money (D-33).

## v6.05 — the Field Manual counts six income-limited exclusions and no longer says Rhode Island's is applied to IRA money; stale lines in it and METHODOLOGY corrected

**A TEXT-ONLY release** — no figure moves; no engine, table or note changes. `docs/SCOPE_V605_RI_FIELD_MANUAL.md` (repo-only, fulfilled). Closes four of
`ARCHITECTUREIssues.md` E-29's eleven threads: Steve asked for (e) to be fixed in a small release with (f) folded in (2026-10-12), and decided (d) and (k).

**What was wrong.** Two Field Manual sentences — the two Rhode Island sentences v5.69 rewrote — were false against the v6.04 source:
- They counted **five** exclusions known to be income-limited in law. The table holds six: Maine joined the list at v5.72 and has been conditioned on
  income since v5.73, which the Field Manual itself says elsewhere ("Maine's income phaseout is modelled from v5.73").
- The second said Rhode Island's $50,000 exclusion *"is still applied to IRA money the statute does not cover"*. That stopped being true at v5.95
  (D-12): Rhode Island's exclusion reaches only each person's own pension, annuity and employer-plan income, and all three in-app calls of the state
  calculator take that per-person path (AST census). Through the v6.04 calculator, a 70/70 couple with $30,000 of IRA money and $30,000 of 401(k) money
  leaves $30,000 taxable in Rhode Island — the IRA money.
- **A third Field Manual passage, found at this release's own re-read** (a search of the tree for every phrasing it retires): the state-age paragraph
  carried METHODOLOGY's (f) sentence word for word — *"Thirteen of the nineteen states remain unverified"* — and said *"One threshold remains deliberately
  NOT applied: South Carolina's under-65 tier"*, though Georgia's $35,000 at 62–64 has been disclosed as not modelled in its note since v5.87.
- **Why the second survived v5.95:** `t35` RI-7 asserted the IRA clause on every leg from v5.69 — a test that checks a disclosure is present turns into
  a lock once the disclosure goes false (OPERATIONS §B2). v5.95 changed the behaviour and left the lock and the sentence in place.

**What changed.**
- **Field Manual** (both sentences): *six* exclusions; the list gains *Maine at v5.73*; Rhode Island's exclusion *"from v5.95, reaches only each
  person's own pension, annuity and employer-plan income — never IRA money, which the statute does not cover"*. The state-age paragraph: *two*
  thresholds are deliberately not applied (South Carolina's under-65 tier and Georgia's $35,000 at 62–64), and *"Since v5.86 every exclusion state's
  figure has been read against a primary source"*, naming the two that start earlier in law than the model applies — Arkansas and New York, both applied
  from 65 (conservative).
- **METHODOLOGY**, each correction annotated where it stands: (f) the sentence *"Thirteen of the nineteen exclusion states remain unverified"*, false since
  its own v5.86 update, rewritten; and three lines of the same kind found while checking (e) — the income-conditioning section's *"Five states"*
  (Maine is the sixth), the v5.69 Rhode Island paragraph's *"four things remain unmodelled"* (three are modelled from v5.95; the fourth, dividend and
  interest income in the measure, stands), and the *Not modeled* list's *"Rhode Island's IRA distinction and per-person cap"* (modelled from v5.95; the
  item now names what is still unmodelled for Rhode Island, and the conditioned-state list adds Maine).
- **E-29** — (d) **closed by decision**: the v5.69 Roth best-cell move stays disclosed, unpinned. (k) **closed by decision**: an unsaved My Data draft
  survives a rejected import, as `t38` I-5 pins. (e) and (f) **fixed**. Open: (a), (b), (c), (g), (h), (i), (j).

**Tests.** `t35` RI-7 is inverted and gated per build (OPERATIONS §B2): on v6.05 it asserts the new wording; the v6.04 leg keeps the old one. New on
v6.05: **RI-8** (extinction) the IRA over-grant sentence is gone; **RI-9** (extinction) every Field Manual count of *exclusions known to be
income-limited in law* equals, as a word, the number of `STATE_RULES` rows marked `incomeLimitedInLaw` — derived from the table, so the next state marked
fails until the manual says so; **RI-10** every state with an income test is named in the list. On the v6.04 leg **RI-9 [KNOWN STALE]** pins the old
count. `t35` 114 → **117** on v6.05, **115** on v6.04. `t52` (current leg only) gains **F-1** (extinction) the "thirteen of
nineteen" sentence is gone, **F-2** both unapplied lower tiers are named, **F-3** every state whose note applies it from 65 although the law starts earlier
is named in the Field Manual — derived from the notes; 34 → **37**. Controls `qa/tools/controls_v605_fm.py` (repo-only): **9 of 9** —
the old sentence restored, the Taxes-tab count alone reverted, Maine dropped from the list, the IRA clause restored, a seventh row marked income-limited
(which also turns `t35` D-7 and D-8 red), the old state-age paragraph restored, New York dropped from it, and the unmutated runs of both suites. Every suite literal, string and regex, was evaluated against the old and new source and
METHODOLOGY (§B1a): only the new and inverted `t35` and `t52` matchers change outcome, besides the version strings. `t33`'s PINS carried unchanged; `v605` registered by AST,
the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,329 app checks across **67 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,459**. Every current-leg count equals v6.04's except `t35`
(114 → 117), `t52` (34 → 37) and `t68` (49 → 45: its group D compares v6.03 with v6.04 and needs `app_v603.mjs`, so it reports itself
not run in a v6.04 → v6.05 folder, as `t66`'s and `t67`'s do in theirs). The v6.04 leg equals v6.04's own counts except `t35` (115) and `t68`
(45), for the same reasons. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v604 v605 from the build workspace — a full clone of 16dcba4 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.04 resolved from history, commit a923332) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6237, half B GRAND 222; none DIED. Source `f230ffbbd4f2773f7816769bb726d975` · built `1c3d9f3a83bcdd6c09fe99fc574b5085` (v6.04 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Three QA-tool fixes, found at this ship.** *First, owned here:* `package_check_controls.sh` ran P56/P57 (the pre-upload K-1–K-3 controls) only for a package whose
`CHANGELOG.md` has a `## v5` heading. The ops package of 2026-10-11 (second) — mine — archived v5.75–v5.99 to the repo, leaving none, so this package's
first controls run SKIPPED both with *"is not an app release (it ships no source)"*. The pattern is now `^## v[0-9]`; with it both run (results in the
package's `MANIFEST.txt`). OPERATIONS §G records it beside the two v5-only patterns fixed the day before. *Second:* `package_check`'s provenance check H-1/H-2 read the newest
CHANGELOG entry up to the next `## v` heading, so after ops packages it also read their `## ops` entries, which quote the build they leave current.
In this package's post-upload rehearsal (GitHub still served v6.04) H-1 and H-2 passed on v6.04's md5s quoted by the 2026-10-11 ops entries, and
their controls P20/P21 could not fire. The window now ends at the next heading of any kind (OPERATIONS §I). *Third, owned here:* `controls_manifest_rows.py`'s B1 demonstration, whose
target I made derived on 2026-10-11 (the pool's dom entry with a hash row), found none before the upload of a release that rotates the dom entry, and
reported a FINDING about itself; it now falls back to another pool file whose row the manifest also names elsewhere. None of the three is part of the suite.

**Limitations, disclosed:** none new — no figure moved. Rhode Island's AGI measure still omits dividend and interest income (the state's note and
METHODOLOGY say so).

## ops 2026-10-11 (third) — the manifest's history to the repo; six documents un-pooled; their open threads re-homed

**KIND: ops** — documents and one QA tool; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite or figure changes; one tool fix (the last bullet). Steps 5–6 of the cleanup plan of 2026-10-11, after its steps 1–4 (the second ops package).
**328,402 bytes net out of the pool; the pool goes 131 → 125 files.**

**First, the trace (OPERATIONS §G).** Before anything left the pool, every open-sounding line in the text leaving — the manifest's
superseded ship notes, its old delete-first lists, and the six documents below — was read in context, and all 60 register IDs it cites
were checked for a pooled record. The full trace is §0 of the new archive file. In short:
- **Nine open threads had no other pooled record** and are re-homed as `ARCHITECTUREIssues.md` **E-29**: `main.jsx`'s `/anthropic`
  rewrite (D-B3-1 (b), never scoped); `t13`'s survivor check measuring more than its name; `E-1b`'s silent skip of renamed pool files;
  the manifest → pool check for unhashed rows, proposed as `K-10` and never built (the ID was later reused for another check); A-2's
  last bullet (imported checklists are not shape-checked); the suite's unpinned harness dependencies; Phase 1's "not examined, therefore
  not cleared" list; and two items for Steve — the v5.69 Roth best-cell move (disclosed, unpinned, no decision recorded) and a request to
  read two v5.69 Field Manual sentences. Two more were found while tracing: METHODOLOGY's "thirteen of nineteen unverified" beside its own
  v5.86 update, and a v5.72 behaviour change (a draft survives a rejected import) flagged for the maintainer and never acknowledged.
- **Six standing traps lived only in the leaving text** and are carried verbatim to OPERATIONS: §B2a (unreachable fixtures make
  assertions vacuous; three fixtures cannot see v5.47's item 5; `t13` is not `t14`; `t10`'s labels overlap; the DOM bundle is sloppy-mode
  CommonJS where the build is a strict ES module) and §I (a truncated hash is not a hash).
- ⚠ **The first pass missed four of these** (the `K-10` proposal, the checklist shape check, the harness dependencies, the CommonJS trap)
  and wrote two wrong statuses into the trace. **An independent second read by a separate agent found them**; all were fixed before
  the package was cut. The method is in the trace's last paragraph.
- Everything else is resolved, with evidence in the trace, or already held by a pooled register.

**Then the moves.**
- **The manifest's superseded ship notes** (v6.03 back to v5.42, 82,546 bytes) and **its delete-first lists** (v6.03 back to v5.31,
  129,298 bytes) moved verbatim to `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`, repo only, with a pointer at each cut. The
  manifest keeps the v6.04 note and the lists from v6.04 on.
- **Six documents un-pooled** (137,409 bytes; each stays in the repo): `FlawsToFix-v5_69-Phase1.md`, `AUDIT_STATE_EXCL65_ROUND3.md`,
  `AUDIT_STATE_EXCL65_ROUND4.md`, `AUDIT_STATE_INCOME_BASES_ROUND5.md` (its row's "three findings still open" was stale — all four are
  resolved), `BUILD_BRIEF_v5_49.md`, and `controls_source.sh` (it reverts fixes in the v5.47 source, so no session can run it from the pool).
- **`MissingFeatures.md`** opens with a census of every D item at v6.04, like the other registers' (some statuses re-checked against the
  source by parser); closed items' headings now carry their status, IDs unchanged. **D-20 is closed** — v6.02 and v6.04 took the
  federal deductions Montana starts from. D-11 is narrowed to New Mexico's unestablished age floor and two disclosed Rhode Island points.
- ⚠ **Correction to the second ops package of 2026-10-11.** It said it removed the hash rows' "rolled at" trail "from every row"; eleven
  rows written in another shape (the trail before the description) kept theirs. Removed here (9,285 bytes; file/hash pairs unchanged,
  asserted); OPERATIONS §I's sentence corrected.
- ⚠ **`controls_manifest_rows.py`'s B1 had been demonstrating nothing since 2026-09-10.** B1 (a demonstration, not a control) deletes a
  pool file's hash row to show that K-9 stays green while the file is named elsewhere. Its target was the literal `dom_entry_v566.jsx`,
  whose hash row left the manifest at the v5.68 rotation; from then on it deleted a retirement-list line of that name and still
  reported success. Archiving that line made its anchor fail, which is how it was seen. B1 now derives its target — the pool's dom
  entry with a hash row — and requires the file's other mentions to survive the edit.

**Verified by:** the archive reassembles the committed manifest byte for byte; the hash table's file/hash pairs compared before and after
(the four hashed rows of un-pooled files aside); `package_check` and `package_check_controls.sh` on this package, and `row_census.cjs`,
`controls_manifest_rows.py` and `controls_runfolder_prior.sh` re-run, since they read the manifest — results in the package's `MANIFEST.txt`.
No suite reads any of these documents (AST census of `qa/`: one tool, `lits_p1.cjs`, names `FlawsToFix` in a pattern it prints, and reads nothing).

## ops 2026-10-11 (second) — project knowledge trimmed: old CHANGELOG and TESTING history to the repo, the hash rows' roll trail removed

**KIND: ops** — documents only; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite, tool or figure changes. The project-knowledge meter read 1,752,756 of 2,000,000. Steps 1–4 of the cleanup plan agreed the same day:

- **CHANGELOG:** every entry from v5.75 through v5.99, with the ops entries between them, moved verbatim to `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md`
  (repo only, the third such archive). The pooled file holds v6.00 onward. 141,930 bytes out of the pool.
- **TESTING.md:** the per-suite count lines from v6.01 back to v5.53 (40, with two historical notes among them) moved verbatim to
  `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (repo only); the newest three stay. 56,471 bytes.
- **The manifest's hash rows:** the `**rolled at …** (was `…`).` trail removed from every row (1408 phrases, 61,027 bytes). Each row keeps
  its current hash and description, and the 126 rows are unchanged in file and hash (asserted). Past values are in the manifest's git
  history; OPERATIONS §I now says a roll replaces the hash without appending a trail.
- **`VERIFY.sh` and `ASSESSMENT_HEIR_RATE.md`** had already been removed from the pool by hand earlier the same day (the listing went 133 → 131). Their
  rows now say so; both stay in the repo. No open item in either (searched for open-decision wording before they were proposed: none).

**Not in this package:** the manifest's old delete-first lists and superseded ship notes, and the six documents that carry open-item wording (steps 5–6
of the plan), which wait for each open item to be traced to a live register (OPERATIONS §G).

**Verified by:** both archives byte-compared with the removed blocks (each pooled file plus its archive body reassembles the committed file exactly);
the hash table's file/hash pairs compared before and after; `package_check` and `package_check_controls.sh` on this package (results in its
`MANIFEST.txt`); `row_census.cjs`, `controls_manifest_rows.py` and `controls_runfolder_prior.sh` re-run, since they read the manifest.

## ops 2026-10-11 — `package_check_controls.sh` could not see a v6 source: P8 and P10 run again

**KIND: ops** — tooling and documents only; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite or figure changes. Verified by `package_check_controls.sh` before and after the change, on the v6.04 package (below), and by
`package_check` and the controls on this package (its `MANIFEST.txt`).

**What was wrong.** `qa/tools/package_check_controls.sh` found a package's source with `ls knowledge/DangerClose-v5_*.jsx`. A `v5_*` pattern cannot
match a `v6_` name, so from v6.00 the script found no source and **skipped P8** (a third `.jsx` rides along — `B-3`) **and P10** (the versioned source
differs from the canonical one — `E-2`), printing *"this package ships no versioned .jsx"*. Found at the v6.04 ship by reading that SKIPPED line. The same
script's P68–P71 tidy a pool copy down to one source before planting each defect, with `glob("…/DangerClose-v5_*.jsx")` and `glob("…/dom_entry_v5*.jsx")`:
on a v6 pool that tidy-up removed nothing. It was harmless where it is normally run (a post-upload pool already holds one source), but on a pool still
holding two, each control would have been "caught" by a baseline already red — the case the tidy-up exists for. v6.00 widened this script's manifest
arithmetic for the new major and missed these patterns (OPERATIONS §G now records it). **The four patterns now read any single-digit major** (`v[0-9]_*`),
as `package_check.mjs`'s own pattern does (`DangerClose-v\d_\d+.jsx`).

**Census, not a list.** An AST walk over every string, template and regex literal in the 145 JavaScript files under `qa/` found one other hit: `E-2`'s
printed label in `package_check.mjs` (*"knowledge/DangerClose-v5_*.jsx == …"*) — label text only, its check already version-agnostic; corrected to
`vN_NN`. A text search of the shell and Python tooling (acorn cannot parse them) found, beyond the four patterns: release-pinned `controls_v5NN_*` scripts
(historical by design, §G), comments, and planted file names (P8's `DangerClose-v5_00.jsx`, P68–P71's `v5_01` / `v5_02` / `dom_entry_v501`), which still
match the checks' version-agnostic patterns and are left. OPERATIONS §L's two sentences naming `DangerClose-v5_*.jsx` now read `vN_NN`.

**Evidence** (`package_check_controls.sh` against the v6.04 package):
- **Before**, the shipped script, post-upload clone and a pool folder: 58 behaved as designed, 1 did not, 3 skipped — **P8/P10 skipped**; the miss is P17,
  which by design fires only against the pre-upload tree (OPERATIONS §I).
- **After**, post-upload clone, pool and `PRIOR_CLONE`: **60 behaved, 1 did not (P17, as above), 2 skipped**; pre-upload clone: **34 behaved, 0 did not,
  10 skipped** (the pool-dependent and handover controls). **P8 caught by `B-3` and P10 by `E-2` in both runs**; P17 fires pre-upload and P48 post-upload.
  The remaining skips are P15 (needs an ops package — run on this one, recorded in its `MANIFEST.txt`) and P58–P61 (need a handover package; none exists).
- **The tidy-up directly:** on a pool copy holding two sources and two dom entries, the old snippet left all four; the new one leaves the current pair.
- **The pool folder** is not the real pool — this session has none mounted (OPERATIONS §I). It was rebuilt from the v6.04 clone through the manifest's
  repo-path rows (133 files, `vite.config.js` under its mount name `vite_config.js`); `package_check` against it with all four arguments: **52 passed,
  0 failed, 0 skipped**, the green baseline that makes the pool controls' results meaningful.

**No scope document** — a judgement, stated: a pattern fix with no decision open; its premise, census and evidence are this entry.

## v6.04 — D-31 and D-29: deducting federal income tax (AL, MO, OR), the federal senior deduction in six states, Missouri's capital-gains subtraction

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D31_D29_V604.md` (repo-only, fulfilled). Steve: "start the v6.04 scope on D-31 plus D-29."

**What changed.** Through v6.03 the state calculator was given neither the model year nor any federal tax figure, so no state could take a deduction that
depends on either (conservative, disclosed). **From v6.04 all three call sites pass the year, the year's federal income tax and its NIIT, and Engine B its
realized gains**, and nine rows take what their laws allow, each read at its primary source on 2026-10-11 (the scope's §0.2 cites each):
- **Alabama** deducts the year's federal income tax in full, the net investment income tax included (Code of Ala. §40-18-15(c); the 2025 worksheet).
- **Missouri** deducts 35 % / 25 % / 15 % / 5 % / none of it as Missouri AGI passes $25,000 / $50,000 / $100,000 / $125,000, at most $5,000 single /
  $10,000 joint (RSMo 143.171), and **subtracts 100 % of realized capital gains from TY2025** (RSMo 143.121.3(14), D-29) — qualified dividends stay taxed,
  and the gains leave the base before the percentage is measured.
- **Oregon** subtracts it up to $8,500 (the 2025 cap, held), less in $5,000 / $10,000 steps of federal AGI from $125,000 single / $250,000 joint, nothing
  from $145,000 / $290,000 (ORS 316.695; OR-40 Table 4).
- **The federal senior deduction** ($6,000 each 65 or older, 2025–2028, less 6 % of MAGI above $75,000 / $150,000 — IRC §151(d)(5)(C)) is taken in the six
  states whose returns carry it: Colorado, Iowa, Montana and North Dakota (they start from federal taxable income), Idaho (conformity, HB 559) and Arizona
  (its own subtraction, A.R.S. §43-1022(35)). Its figures are read from the federal block (`OBBBA_CONSTS`), not copied, and it ends with the federal sunset.

The evaluator `stateDeductions` gains three fields — `years`, `of: "fedtax"` and `cap` — and Missouri's row a field `gainsExempt`; the data stays
declarative. A caller that passes none of the new arguments gets v6.03's figure byte for byte. "Federal income tax" is what the model computes of Form 1040
line 22: regular tax on ordinary income, the capital-gains-rate tax and AMT (Alabama adds NIIT). Only the nine rows move, all downward.

**Measured** (v6.03 → v6.04, a scratch probe, not shipped): the Taxes tab's lifetime state tax on the example plan with each state selected, no conversions —
AL $67,983 → $57,518 · MO $48,310 → $47,276 · OR $124,104 → $114,915; the other 48 jurisdictions and "none" are byte-identical (the example plan's tax years start at its 2029 retirement, after the senior deduction ends —
its filers, born 1964 and 1966, are under 65 until then — so the six senior-deduction states do not move for it). A 65+ household (an $80,000 pension, born 1958 and 1959): AL $86,285 → $81,338 · MO $57,232 → $56,534 · OR $152,945 → $144,286 · MT $47,401 → $45,709 (2026–2028: $4,678 → $2,986) · ID $48,285 → $46,377 · AZ $33,096 → $32,196; North Dakota, Colorado and Iowa do not move
for it (they already tax that household's income at zero before the deduction), nor does any state outside the nine. Engine A on the example plan: no
strategy's lifetime tax rises in any state, and the estate-best strategy changes in none. Engines C and D compute no state tax. **MC parity 10/10,
unchanged** — no fingerprint is priced in the nine.

**Not taken or approximated, each disclosed in its note and in METHODOLOGY:**
- The federal tax is the model's own figure for Form 1040 line 22: the model computes no federal credits, so none is subtracted.
- Oregon's cap is held at the 2025 $8,500: Oregon's 2026 withholding formulas use $8,750, but the same publication's text says $8,500, so the 2026 return
  figure is unconfirmed — the lower one is kept (conservative).
- Missouri's percentage table runs on Missouri AGI, as the MO-1040 administers it, where the statute says "Missouri gross income".
- The District of Columbia's senior deduction is not taken (its 2025 law disallows it; 2026 is unsettled) — conservative.
- The refunds of deducted federal tax that Alabama and Oregon tax as income are not modelled (the model has none).
- Engine A takes the state senior deduction from its own MAGI although its federal calculation omits the bonus (that solver decision stands). Alabama,
  Missouri and Oregon read Engine A's federal tax as Engine A computes it — in 2026–2028 slightly higher than Engine B's for a 65+ household, so their
  deduction there is slightly larger.
- Missouri's gains subtraction reaches only realized gains, which Engine B passes; Engine A realizes none (it passes dividends alone).

**Correction, owned here.** The scope's first draft said Alabama's deduction sits at §40-18-15(c), "not the (a)(2) this project's notes cite". No project
file cites (a)(2): the subsection came from my own research brief, and the research pass found the text at (c). Corrected in the scope (§0.2, §6).

**Tests.** New suite **`t68`** — **49** on v6.04, **5** on v6.03 (that leg pins the absence of the arguments, fields and
components): the nine rows' components equal to the sources, the senior component read from `OBBBA_CONSTS` and carried by exactly the six, only AL / MO / OR
an `of: "fedtax"` component, only Missouri `gainsExempt` — an extinction that every component is well formed; the edges (Missouri's and Oregon's bands to
the dollar, the joint doubling, the senior window at 2024 / 2025 and 2028 / 2029, its phase-out, one filer 65+ against two, Alabama with and without NIIT,
Missouri's gains floored at zero with dividends taxed); 15 hand cases to the cent computed independently in Decimal (e.g. Alabama single 50 at $40,000 with
$3,000 of federal tax: **$1,610.00**; Missouri single 66 at $24,000 with $1,000: **$104.88**; Oregon single 66 at $124,999 / $125,000 with $20,000:
**$9,521.60 / $9,670.44**; Montana joint 66/66 at $100,000 in 2027 / 2029: **$2,467.50 / $3,031.50**); v6.03 → v6.04 over every jurisdiction, a household
grid, the years 2026–2030 and a band sweep for Missouri, Oregon and Alabama, 25,818 calls (without the new arguments byte-identical to v6.03; with them the
nine equal the independent implementation, `qa/d30_ref.mjs` extended, on 4,650 calls and the other rows are byte-identical on 21,168; none pays more and
1,726 pay less); Engine B's state senior deduction equal to its own federal bonus year by year in each of the six; the three call sites' arguments by AST; the
Field Manual and notes held to the code. Controls `qa/tools/controls_v604_feddeduct.py` (repo-only): **8 of 8**. **Derived checks gated per build** (v6.02
DD-14): `t64` (the `deduct` census allows Missouri's `gainsExempt`), `t65` (Alabama's note), `t66` and `t67` (each keeps to its own components — the
federal-tax and senior components are `t68`'s — and their "not taken" claims for the nine are retired on the v6.04 leg, `t68` holding the new wording);
`t33`'s PINS carried unchanged (its household is in Georgia). `v604` registered by AST, the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,293 app checks across **67 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,423**. Every current-leg count equals v6.03's except the new `t68`,
`t66` (191 → 186: its five "not taken" checks for AL, MO, OR, MT and ND retire, `t68` A-7 holding the new wording) and `t67` (123 → 118:
its two for CO and ID retire, and its group D, which needs `app_v602.mjs`, reports itself not run in a v6.03 → v6.04 folder). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v603 v604 from a full clone of 3540e4f with the github/ files overlaid (v6.03 resolved from history, commit 12a4428), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6201, half B GRAND 222; none DIED. Source `8226b20b62334074606993d411bb0fb1` ·
built `71f4ada6ac4923075f9f1d1a576c2293` (v6.03 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The federal tax deducted is the model's, with no federal credits subtracted; Alabama's and Oregon's recapture of refunded federal tax is not modelled.
- Oregon's cap held at its 2025 figure; Missouri's table on Missouri AGI; DC's senior deduction not taken — each conservative or as administered.
- Ohio's retirement income and joint filing credits and Utah's retirement credit are still not taken (D-32); low-income and property-tax credits are not
  taken; itemized deductions are not modelled.
- Engine A's federal figure still omits the senior bonus (its recorded solver decision); the state layer takes it in both engines.

## v6.03 — D-30 batch 2: the flat-rate states' deductions, exemptions and personal credits; D-30 closes

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D30_DEDUCTIONS_V603.md` (repo-only, fulfilled). Steve: "start the v6.03 scope".

**What changed.** Through v6.02 the fifteen flat-rate states were taxed from the first dollar of their base — no standard deduction, exemption or personal
credit (conservative, disclosed). **From v6.03 the fourteen whose law has any take them**, each read at its primary source on 2026-10-10 (the scope's §0.2
table cites each): Arizona's standard deduction ($15,750 / $31,500) and $2,100 for each filer 65 or older; Colorado's and Iowa's federal standard deduction
(both start from federal taxable income; $16,100 / $32,200 and $2,050 / $1,650 for each filer 65 or older), Colorado's cut to $12,000 / $16,000 at federal AGI
of $300,000 or more (Proposition FF, "equal to or exceeding" as the statute says — the 2025 form says "exceeds"), Iowa's $40 exemption credits and $20 for each
filer 65 or older; Georgia's $15,000 / $30,000 (HB 463); Idaho's $15,750 / $31,500 with $2,000 / $1,600 for each filer 65 or older and its $155 grocery credit;
Illinois's $2,925 exemptions and $1,000 for each filer 65 or older, none above federal AGI of $250,000 / $500,000; Indiana's $1,000 exemptions, $1,000 more
for each filer 65 or older and $500 more each below federal AGI of $40,000; Kentucky's one $3,360 deduction per return and $40 credit for each filer 65 or
older; Louisiana's $12,500 / $25,000; Massachusetts' $4,400 exemptions and $700 for each filer 65 or older; Michigan's $5,900 exemptions; North Carolina's
$12,750 / $25,500; Ohio's exemptions by modified-AGI band ($2,400 / $2,150 / $1,900, none from $500,000), its $20 exemption credits and $50 senior citizen
credit; Utah's taxpayer tax credit (6 % of the federal standard deduction, less 1.3 % of Utah taxable income above $18,213 / $36,426). **Pennsylvania's law
has none**, and its note says so. **Idaho's zero band** ($4,811 / $9,622) and **Ohio's 2026 schedule** (no tax on a base of $26,050 or less, $332 plus
2.75 % above it — the statute's step, kept) are modelled as schedules; Ohio's step is a new row field, `notch`, read only with a schedule. The v6.02 evaluator
serves every row; its `tiers` shape now reads a single/joint start (Utah's) — numbers pass through unchanged, so the 27 batch-1 rows are byte-identical. Five
held at their 2025 figures (Arizona's, Idaho's and Louisiana's deductions, Ohio's exemptions, Utah's phase-out base), each at or below its later value.

**Measured** (v6.02 → v6.03, a scratch probe, not shipped): the Taxes tab's lifetime state tax on the example plan with each state selected, no conversions —
every one of the fourteen falls, and Pennsylvania, the other 36 jurisdictions and "none" are byte-identical: AZ $45,462 → $27,415 · CO $65,430 → $42,563 · GA $19,881 → $10,133 · ID $96,379 → $48,206 · IL $3,174 → $1,645 · IN $53,645 → $51,285 · IA $2,437 → $0 · KY $28,135 → $24,985 · LA $40,225 → $28,234 · MA $90,923 → $80,538 · MI $16,590 → $12,592 · NC $72,557 → $51,699 · OH $50,008 → $36,901 · UT $99,516 → $78,178. Engine A on the same plan: no strategy's
lifetime tax rises in any state, and the estate-best strategy changes in none. Engines C and D compute no state tax. **MC parity 10/10, one declared
diff:** the `stateTax` fingerprint is a Georgia call and moves $6,487 → $4,990 (= ($260,000 − 2 × $65,000 − $30,000) × 4.99 %), declared in `INTENDED_DIFFS`
as `v602→v603`; the nine other keys are byte-identical (the Engine A fingerprints carry no state).

**Display.** My Data's model line for a flat-rate row read "N% effective rate (an approximation)" — wrong for every row it reached since v6.01, when every
progressive state moved to its schedule. It now reads "N% flat rate", adds "· deductions and exemptions taken" for the fourteen, and a state without an income
tax reads "no state income tax" (it read "0.00% …"). The AI context line says "N% flat, after its deductions and exemptions". The Taxes tab's footer called
the state module "effective-rate approximations" and now names each state's own rate or schedule after its deductions. The Field Manual's "the flat-rate states
take none yet" (two places) and its two sentences giving every flat-rate state one rate are replaced with what is and is not taken, and Idaho's and Ohio's schedules.

**Not taken, each conservative and disclosed in its note:** the federal senior deduction (2025–2028) that reaches Arizona (its own subtraction), Colorado and
Iowa (through federal taxable income) and Idaho (conformity, HB 559) — added to **D-31**; Ohio's retirement income credit (at most $200) and joint filing credit,
and Utah's retirement credit (filers born in 1952 or earlier) — they need measures the calculator lacks (**D-32**, opened); low-income and property-tax
credits (Georgia's low income credit, Iowa's low-income exemption, Kentucky's family size credit, Indiana's unified credit, Arizona's family and property tax
credits, Pennsylvania's Tax Forgiveness, Massachusetts' circuit breaker and limited-income credits); Michigan's deduction for filers born before 1946. Idaho's
grocery credit is refundable in law and taken here against tax only. **D-30 closes:** every state's standard deduction, exemptions and personal credits are taken.

**Correction, owned here.** v6.02's CHANGELOG entry and the D-30 entry in MissingFeatures called Georgia "the example household's state". It is not: the
example plan files in Florida ("State: Florida (no income tax)"). Georgia is the parity fingerprint's state and `t33`'s household's. This release's scope
repeated the claim in its first draft; it is corrected there (§0.1) and in MissingFeatures.

**Tests.** New suite **`t67`** — **123** on v6.03, **6** on v6.02 (that leg pins the absence of all of it): the fourteen rows' components equal to
the sources, dated, well formed — an extinction: exactly 41 rows carry `deduct` (the 27 and the 14), only Ohio a `notch`, Pennsylvania none; every note names
what is taken and what is not, and every age it names; the edges (Colorado at $299,999 / $300,000, Illinois's and Indiana's cliffs, Ohio's bands, credits and
$26,050 step, Idaho's band, Utah's credit, Kentucky's one deduction, the `tiers` pick); 39 hand cases to the cent computed independently in Decimal (e.g.
Ohio single 50 at $28,451: **$312.03** — the step; Colorado joint 66/64 at $300,000: **$12,496.00**; Utah joint 66/66 at $80,000: **$1,996.46**); v6.02 → v6.03
over every jurisdiction, 22,572 calls (with the fifteen's additions removed, byte-identical to v6.02; with them, the fourteen equal the independent
implementation, `qa/d30_ref.mjs` extended with `D30F`, on the calculator's own measures, and the other 37 rows are byte-identical); the display and the Field
Manual held to the code. Controls `qa/tools/controls_v603_deduct.py` (repo-only): **11 of 11**. **Derived pins gated per build** (DD-14 — each keeps its base and,
on the v6.03 leg, expects that base after the state's deductions, schedule and credits, priced by `qa/d30_ref.mjs` on the calculator's record of the very call;
labels say so): `t10` (§2E — AZ, CO, KY; IL's hand case), `t50` (CO, UT), `t51` (the dated-figure census, 41 rows / 102 figures; Louisiana's cases; the display),
`t52` (GA, IA; the display finder), `t53` (the display finder), `t55` (IA, MI), `t58` (North Carolina's lifetime draw Δ, now the sum of its per-year hand
marginals), `t59` (IA; Georgia's survivor years), `t60` (GA, MI), `t61` (GA), `t63` (ID, IN, OH), `t64` (GA, the display, the `deduct` census), `t65` (the
schedule census with Idaho and Ohio, GA, the display, the Field Manual's lists) and `t66` (its group-wide checks keep to the 27; its group D reports itself not run
in a v6.02 → v6.03 folder). **Measured pins** (the household is in Georgia; second-order engine figures, measured at the build as v5.97's were): `t33`
`noStream` 173,836 → 155,661, and its E-3 / E-4 / F-2 / F-3 deltas 739 → 738, 60,036 → 60,035, 2,300 → 560, 48 → 50. `v603` registered by AST (93 array entries, 83
OR-gates, two version arms; one site reviewed by hand and left — `t66`'s v6.01 → v6.02 group), the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,135 app checks across **66 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,265**. Every current-leg count equals v6.02's except the new `t67` and `t66`
(194 → 191: its group D, which needs `app_v601.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v602 v603 from a full clone of 7af5fbb with the github/ files overlaid (v6.02 resolved from history, commit a7bbdb5), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6043, half B GRAND 222; none DIED. Source `bba6256a1380feae47809094ac667ffd` · built `7acea8cda30fe596ad986935eefa611e` (v6.02 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The federal senior deduction (AZ, CO, ID, IA; and MT, ND from v6.02) and federal-tax deductions (AL, MO, OR) are not taken (D-31); Ohio's retirement income
  and joint filing credits and Utah's retirement credit are not taken (D-32); low-income and property-tax credits are not taken; itemized deductions are not
  modelled — each conservative.
- Credits are nonrefundable: Idaho's grocery credit (refundable in law) is understated for a household whose Idaho tax is below it.
- Ohio's credits are tested on the state base, the model's Ohio AGI; Ohio's modified AGI adds back a business-income deduction the model does not have.
- Arizona, Idaho, Louisiana, Ohio (exemptions) and Utah (phase-out base) hold 2025 figures — each conservative.
- The calculator has no dependents: exemptions count the filers only.

## v6.02 — Ask AI's answers no longer cut off; D-30 batch 1: the 27 progressive states' deductions, exemptions and personal credits

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D30_DEDUCTIONS_V602.md` (repo-only, fulfilled). Steve: "one thing I've noticed in ASK AI, the
response field seems not to be long (big) enough. Some of the answers given out get's cutoff. Can you fix this along with D-30?"

**Ask AI.** The box was never the limit: the transcript shows the whole returned text. **The request was** — both routes (Anthropic and Local Model) asked
the model for at most 1,000 tokens, about 750 words, so a longer answer was cut off mid-sentence, and the app never read the API's stop reason, so a cut-off
answer looked finished. From v6.02:
- **The cap is 4,096 tokens on both routes** (one constant, `AI_MAX_TOKENS`) — roughly 3,000 words.
- **A cut-off is said, never silent:** when the API reports `stop_reason: "max_tokens"` (a Local Model, `finish_reason: "length"`) the answer is shown with
  a notice that it reached the length limit — type *continue* for the rest. The notice is kept apart from the answer, so the conversation memory re-sends
  the answer alone and the model can carry on from it.
- **The timeout is 120 seconds** (was 45; a longer answer takes longer), and the timeout message and the Field Manual's error table say so.
- **The default master prompt's note** ("~1000 token cap") now says answers may run to about 4,000 tokens, most far shorter. A master prompt restored from an
  older backup keeps its own wording (disclosed in the Field Manual).
- **The cost sentence is corrected.** The Field Manual said a question costs "well under a cent". Measured on the example plan, one question sends
  16,603 characters (about 4,150 tokens); at the Claude Sonnet 4.6 prices Anthropic listed in October 2026 ($3 per million input tokens, $15 per million
  output) a typical question costs about one to five cents, and a full-length answer adds about six. The BYOK section and the glossary now say so.
- The model is unchanged (`claude-sonnet-4-6`); a newer, cheaper Sonnet is listed — Steve's call (scope AI-6).

**D-30 batch 1.** Through v6.01 no state's standard deduction, personal exemption or personal credit was taken — every state taxed income from the first
dollar (conservative, disclosed). **From v6.02 the 27 progressive states take them**, each figure read at its primary source on 2026-10-09 (the scope's §0.2
table cites each): standard deductions — flat (NY, VA, MS, NE, HI, KS, OR, VT, DC, DE, AR per person), sliding (Wisconsin), phased out (Alabama's $25/$175
per $500, Maine's linear phase-out, Minnesota's 3 % / 10 %, Rhode Island's 20 % steps, South Carolina's new Income Adjusted Deduction) or the federal one
(MO, MT, ND, NM), with their 65-and-over additions; personal exemptions (incl. Connecticut's $1,000-per-$1,000 phase-out, Maryland's AGI table, Maine's and
Rhode Island's phase-outs, New Mexico's low- and middle-income exemption, Oklahoma's 65+ exemption at low AGI); and personal credits (Arkansas, California's
exemption credits with their phase-out, Delaware, Nebraska, Oregon's exemption credit, Connecticut's Table E credit decimal, Maryland's senior credit at its
reduced schedule). **The order is the forms':** state AGI − deductions = taxable income; the schedule (and Arkansas's high-income table, and Maryland's
county tax) on taxable income; New York's recapture fraction and Connecticut's added amounts on AGI, as their statutes measure them; then the credits,
nonrefundable, against the state tax (Maryland's senior credit not against the county tax). One field, `deduct` (a list of components), one evaluator
(`stateDeductions`), six phase shapes. Six states hold their latest published figures, TY2025 (AR, CA, DC, MD, OR, VT — each at or below its 2026 value).

**Measured** (v6.01 → v6.02): the Taxes tab's lifetime state tax on the example household, no conversions — every one of the 27 falls and the other 24
jurisdictions and "none" are byte-identical: AL $77,583 → $67,983 · AR $50,830 → $44,724 · CA $72,258 → $52,405 · CT $70,199 → $65,467 · DE $66,614 →
$50,491 · DC $118,735 → $71,432 · HI $97,191 → $73,135 · KS $98,216 → $67,430 · ME $70,129 → $40,873 · MD $107,711 → $81,984 · MN $140,098 → $95,880 ·
MS $991 → $0 · MO $80,952 → $48,310 · MT $119,556 → $82,773 · NE $71,599 → $46,547 · NJ $13,388 → $12,495 · NM $87,978 → $58,278 · NY $54,969 → $43,598 ·
ND $9,526 → $6,114 · OK $55,476 → $45,182 · OR $146,037 → $124,104 · RI $85,823 → $59,370 · SC $46,676 → $38,244 · VT $114,827 → $84,832 · VA $80,326 →
$61,805 · WV $62,920 → $59,641 · WI $45,957 → $33,863. **The direction is one way** (optimistic relative to v6.01, and each figure now nearer the law). The
Roth comparator's strategy tax falls in every changed run; **its estate-best cell changes in 3 of 81 cells tested** (27 states × three households: a B-dies
household in MD, ND and RI). Engines C and D compute no state tax; MC parity 10/10 with **no** declared diff (its state fingerprint is a Georgia call).

**Not taken, each conservative and disclosed in its note:** the federal income tax that Alabama, Missouri and Oregon let a return deduct, and the federal
senior deduction (2025–2028) that flows into Montana and North Dakota — both need inputs the calculator is not given (**D-31**, opened); low-income
refundable credits and rebates (HI, ME, NM, NY, OK, WV — each gone well below a retiree's income); Arkansas's "65 Special" credit (it excludes those taking the
retirement exemption the model applies); itemized deductions (no state's are modelled); and the fifteen flat-rate states' deductions — **D-30 batch 2, v6.03**
(Georgia is among them, the example household's state and the parity fingerprint's, so batch 2 re-baselines both on its own).

**Display.** My Data's model line adds "· deductions and exemptions taken" for each of the 27 and dates the figures ("deductions 2026"; "2025" for the six
held); the AI context line adds "after its deductions and exemptions"; the Field Manual's "no state's standard deduction or personal exemption is taken" is
replaced by what is and is not taken, in the Taxes entry and the methodology entry; each of the 27 notes says what it takes and what it does not.

**Tests.** New suite **`t66`** — **194** on v6.02, **54** on v6.01 (that leg pins the absence of `deduct`, the 1,000-token request, the silent
cut-off and the 45-second timeout): the 27 rows' components equal to the sources, dated, well formed (an extinction: exactly the 27 carry `deduct`); every
note names what is taken and what is not, and every age it names is one a component applies; the six phase shapes at their edges (Alabama's full $500
steps, Connecticut's "or fraction" and Table E rows, California's $6 steps, Maine's four-place ratio, Minnesota's cap, Maryland's table and senior-credit
bands, the Oklahoma and Oregon cliffs, Rhode Island's 20 % steps, South Carolina's $10 rounding, Wisconsin's slide, New Mexico's rate); 37 hand cases to the
cent computed independently in Decimal (e.g. Virginia single 66, $50,000 of wages: **$2,014.90**, was $2,617.50; Maryland joint 67/66 at $99,999:
**$5,031.87**); v6.01 → v6.02 over every jurisdiction, 22,032 calls (with `deduct` removed, byte-identical to v6.01; with it, the 27 equal an
independent implementation, `qa/d30_ref.mjs`, on the calculator's own measures, and the other 24 are byte-identical); Ask AI through the DOM with a
recording stub (both routes ask for 4,096; a `max_tokens` / `length` stop shows the notice and a finished one does not; the conversation memory re-sends the
answer without it; a timeout says 120 s; the AST holds every `max_tokens` and the timer to the constants); the Field Manual's cost, cap and timeout lines
held to the constants and the arithmetic; the display. A test seam `_onDetail` (no engine passes it) reports the calculator's measures. Controls
`qa/tools/controls_v602_deduct.py` (repo-only): **12 of 12**. **Derived pins gated per build** (DD-14 — each keeps its base and, on the v6.02 leg, expects that
base after the state's deductions and credits, priced by `qa/d30_ref.mjs` on the calculator's record of the very call; a different base fails; labels say
so): `t10` (§2E — through the TB / TB2 wrappers, and 15 difference, extinction and invariant pins gated one by one), `t35` (CT §B, §C by the record's base, RI-4), `t39` (ME, MT), `t50` (CT, MN, NM, RI, VT),
`t51` (the dated-figure census, 33 rows / 86 figures; six Maine cases; NJ; the display), `t52` (NY, AR, OK), `t53` (the exclusion-onset probe lifts `deduct`),
`t54` (WV, MD, ME; §X by the record), `t55` (MS), `t58` (CA, NY, RI), `t59` (RI, MS, WV), `t60` (ME), `t61` (OK), `t64` (§C, §E) and `t65` (§A-9, B-AR, §C, §E;
its group D reports itself not run in a v6.01 → v6.02 folder). `v602` registered by AST (77 array entries, 83 OR-gates, two version arms; no manual
site), the three Python suites and `t33`'s PINS by hand (unchanged: its household is in Georgia); the shim exports the evaluator and the Ask AI constants.

**Suite, run from the packaged copies:** 5,872 app checks across **65 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,002**. Every current-leg count equals v6.01's except the new `t66` and `t65`
(103 → 102: its group D, which needs `app_v600.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v601 v602 from a full clone of 9b531a1 with the github/ files overlaid (v6.01 resolved from history, commit 1c2674e), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5780, half B GRAND 222; none DIED. Source `d76dddc6381041c987fc5c87b8edad53` · built `16a4a850e5a10582b91eb98ea9b32ce5` (v6.01 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The fifteen flat-rate states take no deduction yet (D-30 batch 2, v6.03); federal-tax deductions (AL, MO, OR) and the federal senior deduction (MT, ND) are
  not taken (D-31); low-income refundable credits are not taken; itemized deductions are not modelled — each conservative.
- Maryland's senior credit is taken at its reduced schedule (the full one applies only in a year the revenue trigger does not fire; TY2026's status is
  unpublished); AR, CA, DC, MD, OR and VT hold their 2025 figures — each conservative.
- The calculator has no dependents: exemptions count the filers only (the model's household has no dependents).
- Ask AI: an answer can still reach the 4,096-token limit — it now says so; the cost figures are October 2026's list prices for the model the app names.

## v6.01 — D-22 option 3, batch 2: the seventeen remaining progressive states on their own schedules; D-22 closes

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D22_BRACKETS_V601.md` (repo-only, fulfilled). v6.00 put ten states on their own bracket
schedules and left seventeen progressive rows on one rate each — a top rate (KS, MO, MT), a rate below the top (AL, CT, DC, DE, HI, ME, MD's "state+county",
ND, NE, NM, RI, VT) or a stale one (AR 3.9 %, WV 4.82 %). Steve: "Let's do the next batch for D-22." **All seventeen are now on their own schedules, each read
at its primary source on 2026-10-09** — with this release every taxing row is either on its own schedule or is one of the fifteen flat-rate states, and
`t65` asserts it:
- **Alabama** 2 / 4 / 5 % (§40-18-5) · **Delaware** 0 %–6.6 %, one schedule (30 Del. C. §1102(a)(14)) · **District of Columbia** 4 %–10.75 %, one schedule
  (§47-1806.03(a)(11)) · **Kansas** 5.2 / 5.58 % (K.S.A. 79-32,110; no 2026 cut, KDOR Notice 25-06) · **Missouri** 0 %–4.7 % in $1,348 bands (RSMo 143.011;
  2026 thresholds from the DOR's withholding formula) · **Montana** 4.7 / 5.65 % (HB 337) · **Nebraska** 2.46 %–4.55 % (LB 754; the DOR's 2026 schedule is a
  draft) · **New Mexico** 1.5 %–5.9 % (Laws 2024 ch. 67 — its top rate was 1 point above the row's 4.9 %) · **North Dakota** 0 / 1.95 / 2.5 % with a 0 % band to
  $49,575 single / $82,800 joint (Form ND-1ES 2026) · **Vermont** 3.35 %–8.75 % (2026 preliminary rates, IN-114) · **West Virginia** 2.11 %–4.58 %, one schedule
  (§11-21-4j, SB 392 of 2026, a 5 % cut retroactive to 1 January).
- **Arkansas** 0 %–3.7 % (Act 1 of the 2026 First Extraordinary Session — the top rate fell from 3.9 %), **with its high-income table**: above $94,700 of net
  income the law taxes all of it at 2 % on the first $4,700 and 3.7 % above, less a bracket adjustment of $290 that falls $10 per $100 to nothing above
  $97,600 — all modelled (new field `upper`).
- **Connecticut** 2 %–6.99 % (§12-700(a)(10)) **with the 2 % bracket's phase-out and the three benefit-recapture amounts** — whole dollars per $5,000 (or
  $10,000) of Connecticut AGI "or fraction thereof", up to $3,400 single / $6,800 joint — all modelled (new field `stepAdds`), on the state base.
- **Maryland** 2 %–6.5 % (§10-105, as amended in 2025) **plus the county income tax on the same base, at the highest county rate, 3.30 %** (the row used to be
  "state + county effective" at 7.5 %; new field `local`), **plus the 2 % tax on net capital gain when federal AGI exceeds $350,000** (from 2025; new field
  `cgSurtax`, measured on the calculator's existing federal-AGI measure).
- **Maine** 5.8 %–7.15 % **plus the new 2 % surcharge above $1,000,000 single / $1,500,000 joint** (36 M.R.S. §5111(7)) — a fourth bracket, top 9.15 %.
- **Hawaii** 1.4 %–11 % (the 2026 schedule) **plus the 13 % bracket Act 24 of 2026 adds from 2027 above $500,000 single / $1,000,000 joint**, and **Rhode
  Island** 3.75 %–5.99 % (ADV 2025-22) **plus the surtax the FY2027 budget imposes above $1,000,000 — 1 % in 2027, 2 % in 2028, 3 % from 2029 — taken at
  3 %**: each is applied in every year. At every income the result is at or above every schedule those acts enact for 2027–2029 (asserted to $3M), so it is
  a conservative stand-in for a model with no year dimension; holding 2026 alone would have understated tax from 2027 above the new lines.

**How.** Each row carries `brackets` and `rate` = its top rate, as at v6.00 (Maryland's `rate` is 6.5 % + 3.3 % = 9.8 %). Three new fields, each on exactly
one row (asserted): `upper` (Arkansas), `stepAdds` (Connecticut), `local` and `cgSurtax` (Maryland). My Data's line reads the schedule's own top rate and
adds Maryland's county clause ("the state's own brackets, 2.00% to 6.50%, plus a 3.30% county tax"); the AI context line likewise. The Field Manual's Taxes
entry now lists every progressive state on its own schedule and names the added rules; its "for the other progressive states one rate stands in" clause
is gone; the methodology entry follows; "skips county/city taxes" now excepts Maryland's.

**Measured** (v6.00 → v6.01): the Taxes tab's lifetime state tax on the example household, no conversions — **AL $71,301 → $77,583 (up)**, AR $61,794 →
$50,830, CT $75,553 → $70,199, DE $72,014 → $66,614, **DC $118,200 → $118,735 (up)**, HI $122,746 → $97,191, KS $101,470 → $98,216, ME $78,212 → $70,129,
**MD $101,478 → $107,711 (up)**, MO $85,468 → $80,952, MT $133,967 → $119,556, NE $94,560 → $71,599, NM $103,949 → $87,978, ND $36,369 → $9,526, RI $107,214 →
$85,823, VT $159,468 → $114,827, WV $85,801 → $62,920; the other 34 jurisdictions and "none" byte-identical. **Direction is mixed by design:** most households
pay less (the one rates overstated the low brackets); Alabama (4.5 % → 5 % on nearly all income), DC (its 8.5 % bracket) and Maryland (the explicit 3.30 %
county rate) pay more, and so do high incomes in Hawaii, Rhode Island, Maine, New Mexico and Connecticut. **The Roth comparator's best-by-estate cell
changes in 4 of the 51 cells tested** (seventeen states × three households: an early widow in RI; a B-dies household in AR, DE and VT). Engines C and D
compute no state tax; MC parity 10/10 with **no** declared diff (its state fingerprint is a Georgia call).

**Decisions taken on recommendation** (scope §1): BR2-1 the same field; BR2-2 Arkansas's table exactly; BR2-3 Connecticut's adds exactly; BR2-4 Maryland's
county tax at the highest rate (3.30 %, not the 3.20 % most Marylanders pay — overstates by 0.10–1.05 points of the base below 3.30 %, disclosed); BR2-5
Maryland's capital-gains tax; BR2-6 Maine's surcharge as a bracket; BR2-7 Hawaii's and Rhode Island's enacted later top brackets applied in every year;
BR2-8 later lower schedules (MT, NE 2027; triggered cuts) not applied; BR2-9 one schedule on a couple's combined income where the law lets spouses compute
separately (AR, DE, MO); BR2-10 Missouri's capital-gains subtraction left for its own release (D-29).

**Tests.** New suite **`t65`** — **103** on v6.01, **54** on v6.00 (that leg pins the one rates): each schedule and new field equals its
source; **the D-22 extinction** (no taxing row lacks a schedule unless it is a flat-rate state); every note states its top rate for its year, its own
brackets and its simplification; the notes' claims about later schedules (HI, MT, NE, RI) and Vermont's minimum tax held to the code; the printed bases
(to the cent for CT, DC, KS, NM, ND, NE, RI, WV and Arkansas's DFA constants; within $1 for HI, ME and VT, which print whole dollars); 46 hand cases to the
cent computed independently from the printed tables (e.g. Alabama single, $50,000 of wages: **$2,460.00**, was $2,250.00; Arkansas at $94,750, inside the
adjustment band: **$3,135.85**; Maryland single, $120,000: **$9,657.50**, was $9,000.00; North Dakota joint, $400,000: **$6,708.73**, was $8,000.00);
a v6.00 → v6.01 comparison over every jurisdiction and 192 households (byte-identical outside the seventeen; inside, equal to an independent
implementation on v6.00's base); the display and the Field Manual. Controls `qa/tools/controls_v601_brackets.py` (repo-only): **13 of 13**. **Derived pins
gated per build** (their base kept, the schedule figure computed in the suite and labelled; sites counted by AST): `t10` 42 (AL, DE, MD, ME, MT, NM, RI),
`t35` (CT §B 14, §C by inverting the schedule; RI-4), `t39` 14 (ME, MT), `t50` 14 (CT, NM, RI, VT), `t51` (the dated-figure census, 33 rows / 59 figures;
six Maine cases; the display), `t52` (AR), `t54` (WV, MD, ME; §X by inversion), `t58` (RI), `t59` (RI, WV), `t60` (ME), `t61` (the rate-claim set, now every
taxing row), and v6.00's own `t64` (its A-1, A-5, D, E-1, E-5, E-6 and E-8 on a v6.01 leg; its group D needs `app_v599.mjs` and reports itself not run in a
v6.00 → v6.01 folder). `v601` registered by AST (64 array entries, 83 OR-gates, two version arms; no manual site), the three Python suites and `t33`'s PINS
by hand (unchanged: its household is in Georgia).

**Suite, run from the packaged copies:** 5,579 app checks across **64 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 5,709**. Every current-leg count equals v6.00's except the new `t65` and
`t64` (65 → 62: two of its v6.00-only checks, E-6 and E-8, are gated to that leg, and its group D, which needs `app_v599.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v600 v601 from a full clone of c00822f with the github/ files overlaid (v6.00 resolved from history, commit b800ca1), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5487, half B GRAND 222; none DIED. Source `b7eb4dcb32795a35c5026953a5a31b68` · built `55cae3ab526d114eaaa89a6d890d8a8e`
(v6.00 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- No state standard deduction, personal exemption or credit is taken in any state, nor Alabama's deduction of federal income tax (conservative) — now **D-30**,
  the recommended next release.
- Missouri exempts capital gains from 2025 (HB 594); the model taxes them (conservative) — **D-29**.
- Hawaii's 7.25 % capital-gains cap, Montana's 3 % / 4.1 % capital-gains rates, North Dakota's 40 % and New Mexico's $2,500 capital-gains deductions and
  Vermont's capital-gains exclusion are not modelled (conservative).
- Maryland's county tax is the highest county's (3.30 %); Arkansas, Delaware and Missouri tax a couple on one schedule where the law lets spouses compute
  separately; later lower schedules (MT, NE 2027) and triggered cuts (KS, MO, WV) are not applied — each conservative.
- Hawaii's and Rhode Island's later top brackets are applied in 2026 too (conservative before they start); Nebraska's 2026 schedule is the DOR's draft
  and Vermont's the Department's preliminary table, both computed by statute from published indexes.
- Flat-rate rows still read "X% effective rate (an approximation)" in My Data — a label, not a figure; left for a presentation release.

## v6.00 — D-22 option 3, batch 1: ten states taxed on their own bracket schedules

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D22_BRACKETS_V600.md` (repo-only, fulfilled). Through v5.99 every state was taxed at ONE rate on
its whole base — a statutory flat rate where the state has one, and elsewhere a top rate (Oklahoma) or an "effective" rate of the model's own making
(California 6 %, New York 6 %, New Jersey 5.5 %, Oregon 8 %, Minnesota 6.8 %, Wisconsin 5.3 %, South Carolina 6 %). After v5.99 Steve chose option 3:
the progressive states' real schedules, read from the law, in batches. **This is the first batch — ten states, each schedule re-read at its primary
source on 2026-10-09:**
- **California** — Schedules X / Y, 1 %–12.3 %, the **TY2025** table (TY2026 not published; the 2026 Form 540-ES says to use the 2025 table), plus the 1 %
  Behavioral Health Services Tax on taxable income over $1,000,000 at every filing status (R&TC §17041, §17043): top rate 13.3 %.
- **Minnesota** 5.35 %–9.85 % (TY2026, MN DOR) · **Mississippi** 0 % on the first $10,000, 4 % above · **New Jersey** N.J.S.A. 54A:2-1, separate single
  and joint tables, 1.4 %–10.75 % · **Oklahoma** 0 / 2.5 / 3.5 / 4.5 % (HB 2764; the top-rate convention of v5.97 retires) · **Oregon** 4.75 %–9.9 %
  (OR-ESTIMATE 2026) · **South Carolina** 1.99 % and 5.21 % for every status (Act 110 of 2026, H.4216 — its $15,000 age-65 deduction stands; §12-6-1170 is
  unamended) · **Virginia** 2 %–5.75 %, one schedule for every status (§58.1-320) · **Wisconsin** 3.5 %–7.65 % (2026 Form 1-ES).
- **New York** 3.9 %–10.9 % (Form IT-2105-I, 2026) **with its tax-benefit recapture**: above New York AGI of $107,650 the first worksheet moves the tax
  toward a flat 5.9 % single / 5.4 % joint on all taxable income over $50,000 — modelled exactly, four-place fraction and all; above $215,400 single /
  $161,550 joint the later worksheets' end point (the bracket's own rate on all of it) is taken at once, where the law phases it in (conservative).

**How.** A row may now carry `brackets: { single, joint }`; the calculator taxes it on its schedule — single or joint by the return's status, so a
survivor files on the single schedule — applied to the same base the flat rate saw. `rate` stays, equal to the top rate (asserted), so every reader of
it keeps working. My Data's line reads "the state's own brackets, L% to T%" with "brackets YYYY" among its dated figures; the AI context line says the
same. The Field Manual's three sentences that said effective rates stand in for progressive brackets now name the ten states, and say that no
state's standard deduction or personal exemption is taken anywhere.

**Measured** (v5.99 → v6.00): the Taxes tab's lifetime state tax on the example household, no conversions — California **$109,108 → $72,258**, Minnesota
**$151,642 → $140,098**, Mississippi **$2,565 → $991**, New Jersey **$26,360 → $13,388**, New York **$65,747 → $54,969**, Oklahoma **$64,281 → $55,476**,
**Oregon $145,477 → $146,037 (up)**, South Carolina **$74,510 → $46,676**, Virginia **$86,431 → $80,326**, Wisconsin **$56,266 → $45,957**; the other 42
jurisdictions byte-identical. **Direction is mixed by design:** the effective rates overstated the lower brackets, so most households fall; the high
single-schedule incomes in California, Oregon and New York rise. **The Roth comparator's best-by-estate cell changes in 5 of the 30 cells tested** (ten
states × three households: an early widow in MN and NJ; a B-dies household in CA, SC and WI) — with a graduated schedule a conversion's state cost
depends on the bracket it fills, which one rate could not see. Engines C and D compute no state tax; MC parity 10/10 with **no** declared diff (its
state fingerprint is a Georgia call).

**v6.00, not v5.100.** The suites compare version tags as strings and sort pool files lexically, so `v5100` would sort below `v599`. Thirteen tooling
patterns that assumed a major of 5 now read any single-digit major (`mk_runfolder.sh`, `smoke_built`, `t9`, `domdiff_withdrawal`, `vergates`, `vercensus`,
`vercensus_list`, `package_check`, `package_check_controls.sh`); OPERATIONS §G records the rule. The pool's source is `DangerClose-v6_00.jsx`.

**Decisions taken on recommendation** (scope §1): BR-1 the field; BR-2 `rate` = the top rate; BR-3 no state standard deductions or exemptions yet
(conservative — recommended as a follow-up); BR-4 schedules held at their latest year; BR-5 New York's recapture; BR-6 Mississippi one band per return;
BR-7 Virginia one schedule; BR-8 South Carolina's SCIAD not taken; BR-9 New Jersey's 50 cents; BR-13 the batch; BR-14 the version number.

**Tests.** New suite **`t64`** — **65** on v6.00, **34** on v5.99 (that leg pins the single rates): each schedule equals its source
and is dated; an extinction check over every row with a schedule (ascending, rates never fall, last row open, top rate = `rate`); each schedule against
the state's PRINTED table (to the cent for WI, OK, NJ and SC; within 2 cents for CA and $1 for NY and OR, which round their bases); hand cases to the cent computed
independently from the printed tables (e.g. California single at 66 with $60,000: **$2,184.05**, was $3,600.00; Oklahoma single at 66 with $50,000:
**$1,585.25**, was $1,800.00; New York single with $120,000: **$6,652.11** inside the recapture's phase-in); a v5.99 → v6.00 comparison over every
jurisdiction and a grid of households (byte-identical outside the ten; inside, equal to an independent schedule on v5.99's base); the display and the
Field Manual, each clause held to its code fact. Controls `qa/tools/controls_v600_brackets.py` (repo-only): **11 of 11**. **Derived pins gated per build**
(their base kept, the bracket leg's figure computed in the suite and labelled): `t10` (Mississippi, New Jersey, Virginia, Wisconsin — the NJ residual
block now asserts the flat-rate error is ZERO), `t50` (MN), `t51` (dated-figure census, NJ), `t52` (NY, OK), `t53` (its line selector), `t55` and `t59`
(MS), `t58` (CA, NY), `t61` (OK, the rate-claim set), `t63` (MS's note). `v600` registered by AST (52 array entries, 83 OR-gates, two version arms; one
manual site, `t63`'s single-build group C, left single-build by design), the three Python suites and `t33`'s PINS by hand (173,836, measured).

**Suite, run from the packaged copies:** 5,395 app checks across **63 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 5,525**. Every current-leg count equals v5.99's except the new `t64` and
`t63` (18 → 9: its group C compares v5.99 with v5.98 and runs on the v5.99 leg only). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v599 v600 from a full clone of 5c90d85 with the github/ files overlaid (v5.99 resolved from history, commit f7ce172), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5303, half B GRAND 222; none DIED. Source `d535e13e865e9592e41f93f4359328f0` · built `3e02a42fac6f6281d7c0b17ab77cdcbd` (v5.99 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- No state standard deduction, personal exemption or exemption credit is taken in any state (conservative).
- Schedules are held at their latest published year (California's TY2025) for every later year; indexing is not applied (conservative).
- New York: the later recapture worksheets' phase-in is not modelled (conservative); NYC tax is not modelled.
- Mississippi's per-spouse band on a combined return, Virginia's Filing Status 4 and $259 spouse adjustment, and South Carolina's SCIAD are not modelled
  (conservative); New Jersey's joint $70,000–$80,000 band is 50 cents below the statute (immaterial; in its note).
- Seventeen progressive rows still use one rate (AL, AR, CT, DE, DC, HI, KS, ME, MD, MO, MT, NE, NM, ND, RI, VT, WV) — D-22 stays open for them.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v5.75 to v5.99 in `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` (2026-10-11); v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`
(2026-09-28); v5.59 and earlier in `docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
