# SCOPE — v6.22 · D-53: a new plan keeps the example's master prompt (and the example's other fallbacks)

**FULFILLED 2026-10-20 — built as v6.22** (§7). **Decided the same day — all seven (a), as recommended; DC-8 added and decided at the build.** Steve's answers: DC-1 *"Facts + clear"*; DC-2 to DC-5 *"All as
recommended"*; DC-6 *"Pay none, say so"*; DC-7 *"Refuse the backup"*; DC-8 *"Close it"*. The scope is repo-only (`docs/`) and ships in the v6.22
package.

Steve, 2026-10-20, choosing the next build: *"let's go with d-53"*.

This is a **MODELLING** release. For the plans it reaches, the engines' inputs change: dates of birth, retirement year, life
expectancies, the state, and (DC-6) income a plan never entered. The example's figures must not move, and §0.8 measures that they do
not. METHODOLOGY changes; it records D-53 as open (its D-50 section).

**Built against v6.21.**
- Clone: a fresh full clone of `origin/main` at `a3ff6e2`.
- Hashes: source `f7802df1f14f52b0c2ca59ca898b0e9a`, built page `bbd56368ab21aee1b95b55c4aec94af1`. Both equal the manifest and the
  newest CHANGELOG provenance line, and the pooled source hashes the same (verified after the v6.21 upload, this session).
- Line numbers: every one below is a v6.21 line, printed by `qa/tools/census.cjs` or by an acorn walk over the source
  (`s622/tools/members.cjs`, `<object>.<field>` reads and writes; session-only).
- Runs use the run folder built from the v6.21 package (`v621.jsx` hashing `f7802df1…`).
- Free names: the tag `v622` (`vercensus.cjs v622 qa` gives 0 judgement points; the `.py` suites' `KNOWN_VERSIONS` end at `v621`),
  the suite name `t85`, and the register IDs D-55 and D-56.

---

## 0 · Premise (verified at v6.21, not assumed)

### 0.1 · The mechanism — wider than the register says

The register (MissingFeatures D-53) describes the state: a new plan that chooses no state is taxed as the example's Florida. The
mechanism is broader, and the state is one of ten facts it carries.

- `MASTER_PROMPT` starts as the example's demo prompt (`let MASTER_PROMPT = DEFAULT_MASTER_PROMPT`, L511; 277 lines, 14,865
  characters).
- The loader replaces it **only when handed a non-empty string** (L4178). `saveToStorage` writes the prompt key **only when it is
  non-empty** (L4357). A plan that arrives without a prompt therefore keeps whichever prompt was held before it, in memory and in
  storage.
- **The example's household facts exist only in that prompt.** `DEFAULT_PORTFOLIO` (L528) has no date-of-birth, retirement-year,
  life-expectancy, state or home field. Every reader falls back to the prompt:
  - `buildPlanTimeline` (L807–870): the dates of birth, target retirement year, life expectancies, and the state's name and rate. Each
    comes from the plan's field when set, else is parsed from the prompt (`_parseDOB`, `_parseTargetRetireYear`,
    `_parseLifeExpectancy`, `_parseStateTaxRate`, `_parseStateName`, L725–770). Two of those parsers return a default when nothing
    matches rather than "not found": 2029 and 90.
  - My Data (L13048–13064): the form starts the same facts from the timeline, and reads home value, mortgage balance and rate by
    regex on the prompt.
  - The Ranking tab (L9550–9567): the same home regexes; home equity feeds the net-worth band.
  - Ask AI (L7176): the system prompt **begins with** `${MASTER_PROMPT}`. The Ask AI panel shows that text to the user (L12799–12801:
    *"your saved master prompt plus the live plan context"*).

One precedent guard exists: the loader does not parse Social Security or a pension from the demo prompt (`_promptIsDemoOnly`,
L4209–4211). Nothing else is guarded.

**Measured, rendered** (v6.21 DOM bundle; empty storage → *Start Fresh* → My Data → *Save & Apply*; `probe622/p3.mjs`, reproduced
by the reviewer):

| step | what the plan has |
|---|---|
| after Start Fresh | timeline: born 1964-01 and 1966-01, retiring 2029, planning to 80 and 87, state "Florida" at 0% — **every one the example's**. The held prompt is the demo; no prompt key is stored |
| My Data opens | date of birth 1964-01-01 and 1966-01-01; retirement 2029; life expectancy 80 and 87; home 450000, mortgage 120000 at 4.25 |
| one Save & Apply | all ten stored as the plan's own fields (`dobA "1964-01-01"` … `stateName "Florida"`, `homeValue 450000` …). The regenerated prompt reads *"Spouse A born 1964-01-01 … State: Florida (income tax 0% flat) … home: $450,000 value"* |

- After that save the facts are the plan's data, indistinguishable from typed ones. An **Export** taken before any save does the same,
  because it is built from the pre-filled form (L13479).
- The state name has no input of its own: My Data's state control is a select (*"— manual (flat rate below) —"* plus the state list)
  and a rate box (L13652–13672). So the inherited "Florida" is not visible to retype. It changes only when a state is chosen.
- **Ask AI — read, not run.** For such a plan the system prompt, and the panel's preview of it, begins with the example's 277-line
  briefing (its goals, its Future Home, its Runs A–C) until a Save & Apply regenerates it.

**Which paths reach it** — the 8 `applyLoadedData` and 7 `saveToStorage` call sites:

| path | prompt passed | held prompt after | stored prompt key after |
|---|---|---|---|
| Start Fresh (L4628–4629) | `""` | unchanged | not written — an old key survives |
| guided setup from the landing screen (L4662–4663) | none | unchanged | not written |
| guided setup from My Data (L14271 → `handleApplyData`, L14504–14505) | none | **the current plan's own prompt** | not written |
| Restore backup (L4646–4647) / Import (L14512–14513), a backup without `masterPrompt` | `undefined` | unchanged | not written |
| page load, a stored plan with no prompt key (L4343) | `null` | the demo (module start) | — |
| My Data's Save & Apply (L13396 → L14504–14505) | `genAIContext()` | regenerated from the form | written |
| *Load sample data* (`handleLoadSample`, L14525–14532) | sets the demo itself (L14529), then `useDefaults` | the demo | **the demo** (L14532) |
| landing *Use example data* (`applyAndContinue(true)`, L4572, L4598) | `useDefaults`; does **not** set the demo | whatever is held (the demo, at the landing) | `saveToStorage({})` writes only the meta key |

- **At the landing screen the held prompt is always the demo.** That covers a first visit, the screen after *Clear all data*, an
  unreadable stored plan, and a rolled-back load. So Start Fresh and the landing guided setup always inherit the example.
- Every plan those two saved at v6.21 or earlier has no prompt key. It reloads with the demo on every visit, until a Save & Apply
  bakes the facts in.

**The previous plan's own prompt** is a second case.
- Measured at function level (`probe622/p2.mjs`): a plan loaded with its own prompt (Oregon 8.75%, born 1968, retiring 2031, planning
  to 92), then Start Fresh's call verbatim. The "blank" plan reads 1968 / 2031 / 92 / Oregon, and the prompt is kept.
- In the interface the guided setup run from My Data reaches it. Its button says it *"build[s] a fresh plan from scratch — replaces
  the current one"*. Importing a backup that has no prompt reaches it too.
- Start Fresh reaches it only from the unreadable-stored-plan screen. There the old prompt key also survives Start Fresh's *"This
  erases your currently saved plan"* confirm (read, not run).

**The guided setup inherits less.** It writes the dates of birth, retirement year and life expectancies itself (L4441–4443). It
inherits the state when its state step is skipped: `stateName: ""`, so the timeline falls back (L828; measured at the v6.21 review).
It inherits the home figures, because it writes no home field.

### 0.2 · Sibling — Social Security and the pension fall back to the example's amounts, and the warning hangs on the prompt

Two places hand a plan the example's income.
- **The loader's inserts** (L4234–4249). A plan whose `incomeSources` has no `ssA`, `ssB` or `pension` block gets literal blocks:
  $3,300 (claim age 67), $1,300 (claim age 63; married only) and $400 a month, each flagged `isDefault: true`.
- **The getters** (L646–657). `getSSA`, `getSSB` and `getPension` fall back with `?? DEFAULT_PORTFOLIO.incomeSources.….planned`
  (`.amount` for the pension) when a block exists but its amount is missing.

The red banner *"⚠ WARNING — USING EXAMPLE NUMBERS, NOT YOUR DATA"* (L7470–7495) lists the inserted fields. It fires only when
`_hadPromptToParse = !!_promptForSS` (L4232, L4250–4253) and the income is not from the form.

Measured (`probe622/p4.mjs`; reviewer's `rv/p_lit.mjs`, re-run here):
- blocks present, amounts missing → 3300 / 1300 / 400, no banner;
- `incomeSources: {}`, not from the form → 3300 / 1300 / 400, banner lists all three — **only because the demo prompt is held**;
- no `incomeSources`, from the form → 3300 / 1300 / 400, no banner.

So **DC-1's own fix would silence the banner** while the example's income is still paid: with no prompt held, `_promptForSS` is
empty. And `_promptIsDemoOnly` becomes always false.

Start Fresh, the guided setup and My Data always write the blocks and amounts, so only a hand-made, partial or very old backup reaches
this. **Optimistic (income the plan does not have); low reach, high effect.**

### 0.3 · Sibling — an expense table is carried over the same way

The loader assigns `if (expenses) EXPENSES = expenses` (L4172). `readBackupText` requires only `portfolio`, and `validateLoadedPlan`
accepts `expenses == null`.

Measured (reviewer's `rv/p_exp.mjs`, re-run here): a load without expenses keeps the table already held. At the landing screen that is
the example's 35 rows, the same object. Otherwise it is the previous plan's table. `saveToStorage` then writes no expense key, so a
reload reads the example's table again.

Only a hand-made backup reaches this: Export always writes `expenses`. **Direction depends on the plan; low.**

### 0.4 · Sibling — the no-state and 0%-state wording

- **The Taxes tab footnote (L11200).** With the state rate at 0 it reads: *"`{state}` has no state income tax, so the State column
  is $0 by design — change the master prompt's state line to model a taxed state."* There is no master prompt to change. The Field
  Manual §09 says *"You no longer write or upload it"*, and the landing screen's file statuses are `useState`s with no setter
  (L4553–4554). For a plan with no state, `{state}` is the default *"your state"* (L6326). The same default gives the column labels
  *"STATE (your)"* (L11182) and *"State (your state)"* (L11343).
- **The Roth tab's rules box (L10755–10761)** has its own no-state wording, *"No state income tax (the plan's flat state rate is
  0%)"*. Its comment *"the example's Florida comes from there"* (L10758) goes stale with this release.

### 0.5 · Sibling — the Field Manual describes the master prompt as it is not

§09 (`DOCS_HTML`, L4738) says the app builds the master prompt *"automatically from your My Data entries … each time you ask a
question"*. It says an older backup's prompt is *"loaded for continuity but the live context is always regenerated"*.

What actually happens: the summary (`genAIContext()`) is written at Save & Apply and Export only. A plan that was never saved sends
whatever prompt is held, which today is the example's. The live context (`ctx`, L7149–7175) is the part rebuilt at each question.

### 0.6 · Register sweep by mechanism (OPERATIONS §K2)

Searched `docs/FlawsToFix-*`, `docs/ARCHITECTUREIssues.md`, `docs/MissingFeatures.md` and its archive. The terms were *master
prompt*, `MASTER_PROMPT`, *demo prompt*, *Start Fresh*, *wizard*, *home value*, *placeholder*, *example*, `isDefault`, and the
`_parse*` names.

- **D-53** — closes.
- **D-50** (closed at v6.21, *"Narrowed: a new plan that chooses no state still reads Florida … (D-53)"*) — the narrowing lifts. Its
  row is corrected.
- **FlawsToFix-v5_69-Phase1 A-6** (an imported `masterPrompt` heads Ask AI; mitigated at v5.71 by a type check and a length cap) —
  unchanged; an imported prompt still heads Ask AI by design. `t37` A6-4 and A6-6 pin that a non-string prompt is rejected *"— the
  previous value stands"* (L350, L354). Under DC-1 (a) it is rejected and the plan then has **none** (§0.7).
- **ARCHITECTUREIssues (j)** — lists `startFresh` and the guided setup's save path as *"not examined"* by the v5.69 audit. This scope
  examines their prompt, income and expense handling only; the item stays.
- **METHODOLOGY** (its D-50 section, *"Its sibling, found at the build (D-53, open)"*) — corrected.
- **New, filed by this release (not fixed):**
  - **D-55** — Ask AI's ground rules reach only the example (DC-4).
  - **D-56** — example-valued defaults that remain:
    - the as-of date *"2026-04-18"* when a plan has none (`_asOfToYM`, L803);
    - Spouse B's claim age 63 when none is set (L831);
    - the 2029 retirement placeholder;
    - the Roth tab's *"Roth 401K 5-year rule: satisfied / Roth IRA 5-year clock: started (example)"*, shown to every plan
      (L10762–10763).

No other item.

### 0.7 · Measured blast radius of each fix shape on the existing suite

Each candidate shape was built as a throwaway variant of v6.21 and run through the full suite (`runsuite.sh v620 v621`, with the
variant as the v621 leg). These runs measure scope only. None of this code ships; the build is written fresh from the decisions.

| variant | what it does | suite (GRAND, incl. tooling) |
|---|---|---|
| v6.21 itself | — | 8,353 passed, 0 failed |
| **A — clear only** | the loader sets the prompt to `""` when handed none, except `useDefaults` | **8,220 passed, 133 failed** — 36 legs of 22 suites (t13, t16–t19, t25, t28, t29, t37, t40, t42, t43, t58, t70–t72, t75, t76, t81–t84) |
| **B — facts + readers** | `DEFAULT_PORTFOLIO` carries the ten facts; the timeline, My Data and Ranking ignore the demo prompt | 8,353 passed, 0 failed |
| **AB — both** | A and B together | 8,351 passed, **2 failed** — `t37` A6-4 and A6-6, the intended change (§0.6) |

- A's failures are fixtures that load a copy of the example without its prompt and expect its timeline. For example, t13 expects the
  first death in 2044 and gets 2043.
- The recommended shape, DC-1 (a) = **A + facts**, changes no reader, so it sits between A and AB. Its readers still parse a held
  prompt. Every fixture failing under A loads a copy of `DEFAULT_PORTFOLIO`, which under (a) carries the fields, and a field wins
  over the prompt in every reader. So its result is expected to equal AB's; the build measures it.
- ⚠ The three variant runs went concurrently, and t2 writes its fingerprint to a fixed `/tmp` path, so their parity lines are not
  relied on. §0.8 checks the example separately.

### 0.8 · The example under the facts-on-`DEFAULT_PORTFOLIO` shape — measured unmoved

Checked on the AB variant against v6.21 itself. It is the stricter test: its readers cannot parse the demo prompt, so every example
fact has to come from the new fields.

- **Engines.** I ran `t2_engines.mjs` once per build under distinct tags (`v621r`, `v622x`). All ten fingerprints are
  **byte-identical** (`c89be293…` both): `mc`, `extMC`, `stress`, `roth`, `rothCurrentEstate`, `rothAca`, `rothOther`, `ssTable`,
  `stateTax`, `inflation`.
- **Rendered** (`probe622/p5.mjs`: *Use example data*, then My Data, Ranking, Taxes and Roth):
  - The timeline has the same values; only its key order differs (a parsed date is `{month, day, year}`, a field `{year, month,
    day}`).
  - The getters read 3300 / 1300 / 400.
  - My Data's 394 input values are identical except the backup filename's timestamp. The Ranking tab's net worth is $1.98M. The
    equity regex's $330,000 equals value minus mortgage, so deriving it changes nothing.
  - The four tabs' text is identical except the retirement-date cards' live success rates. Those come from an **unseeded** Monte
    Carlo and differ between two runs of v6.21 itself (99.8% vs 99.7%), so §3 C masks them.

### 0.9 · Limits and consequences, stated

- **A backup whose `masterPrompt` is the demo text** — restored or imported — keeps it, and the plan reads the example's facts from it
  wherever its own fields are missing. The prompt alone cannot tell this apart from an example stored before v6.22 (§3 A-8 needs that
  to keep working). Export writes `genAIContext()` (L13479), not the demo text, so only an old backup carries it.
  ⚠ *Superseded at the build (§7, DC-8):* this limit was wider than stated — a stored prompt KEY holding the demo text beside another
  plan's holdings was reachable in-app at v6.21 — and Steve decided to close it: the demo text is taken only with the example's holdings.
- **Stored plans that were never saved through My Data change figures on their next load.** These are Start Fresh or guided-setup
  plans from v6.21 or earlier with no prompt key:

  | fact | before | after |
  |---|---|---|
  | dates of birth (Start Fresh only) | 1964-01 / 1966-01 | the placeholders 1963-09 / 1966-03 |
  | life expectancies (Start Fresh only) | 80 / 87 | 90 / 90 |
  | state | "Florida" | none (both at 0%, so the tax is the same) |
  | Ranking home | the example's | the flagged 500,000 / 150,000 / 4.0 fallback |

  The longer horizon is the conservative direction. §1, the CHANGELOG and METHODOLOGY say so, and §3 A-7 pins it.
- **Plans already saved** with the example's facts keep them: they are now the plan's own fields. DC-5 is about telling the user.

---

## 1 · What changes (if every decision goes as recommended)

1. **The example describes itself.** `DEFAULT_PORTFOLIO` gains the ten facts its prompt states. These are exactly what the parsers
   read today, so none of the example's figures move (§0.8):
   - `dobA "1964-01-01"`, `dobB "1966-01-01"`
   - `retireYear 2029`
   - `lifeExpA 80`, `lifeExpB 87`
   - `stateName "Florida"`, `stateTaxRate 0`
   - `homeValue 450000`, `mortgageBal 120000`, `mortgageRate 4.25`
2. **A plan that arrives without a prompt has none.**
   - The loader sets the prompt to `""` whenever it is handed no usable string. The example's path (`useDefaults`) is the exception,
     and it now **sets the demo itself**, so the landing *Use example data* no longer depends on what is held.
   - Storage keeps what memory keeps. Every caller that loads a plan passes the loader's result: a string is written, `""` deletes
     the key, and an omitted argument leaves the key alone. So *Use example data* over an unreadable stored plan does not touch its
     prompt key.
   - This covers Start Fresh, both guided-setup routes, a backup or import without a prompt, and a page load of a stored plan with no
     prompt key (§0.9).
3. **A new plan's My Data shows what is not entered** (DC-2).
4. **A plan with no state says so** on the Taxes and Roth tabs and in My Data (DC-3). No wording points at a master prompt any more.
5. **Ask AI and the Field Manual** (DC-4).
   - A new plan's Ask AI carries its live context only, as every plan saved from My Data already does.
   - §09 says what is actually sent.
   - D-55 is filed.
6. **Plans already saved with the example's facts get a notice** (DC-5). Nothing in the plan changes.
7. **A plan that has no income figures is paid none, and is told so** (DC-6).
8. **A backup with no expense table is refused** (DC-7).

## 2 · Census of what the build touches (v6.21 lines)

| site | lines | change |
|---|---|---|
| `DEFAULT_PORTFOLIO` | L528 | + the ten fact fields (DC-1) |
| loader prompt assignment | L4178 | not `useDefaults` and no usable string → `""`; `useDefaults` → `DEFAULT_MASTER_PROMPT` (DC-1) |
| `saveToStorage` | L4357 | string → set; `""` → delete; omitted → untouched (DC-1) |
| `startFresh`, landing `onDone`, `restoreBackup` | L4629, L4663, L4647 | pass the loader's prompt (DC-1) |
| `handleApplyData`, `handleImportData`, `handleLoadSample` | L14505, L14513, L14532 | pass the loader's prompt (DC-1) |
| `applyAndContinue` | L4572, L4598 | unchanged; the loader now sets the demo for it; `saveToStorage({})` leaves the prompt key |
| `loadFromStorage` | L4341–4343 | unchanged; `null` reaches the loader's new branch |
| `_parseTargetRetireYear`, `_parseLifeExpectancy` | L734–750 | return `null` when nothing matches; the caller applies 2029 / 90 (DC-2) |
| `buildPlanTimeline` | L807–870 | + a record of which facts are placeholders (no field and no match); values unchanged (DC-2) |
| My Data form defaults | L13048–13052 | a placeholder date of birth or retirement year starts blank; + the DC-2 notice |
| My Data state control | L13652–13672 | + the no-state line (DC-3) |
| Taxes tab | L6326, L11182, L11200, L11343 | no-state and 0%-state wording and labels (DC-3) |
| Roth tab rules box | L10755–10761 | no-state wording aligned; stale comment L10758 (DC-3) |
| Field Manual §09 | `DOCS_HTML`, L4738 | what Ask AI is sent (DC-4); quote-free anchors |
| My Data | new | the DC-5 notice |
| `getSSA` / `getSSB` / `getPension` | L646–657 | `?? 0` (DC-6) |
| loader income inserts and banner | L4232–4258, L7470–7495 | inserted amounts 0 (still `isDefault`); banner keyed on `isDefault`, not on a prompt; reworded (DC-6) |
| `readBackupText` / `validateLoadedPlan` | L3931–3966 | a backup with no `expenses` list is refused (DC-7) |
| version sites | four | v6.22 |

**Not touched:**
- the timeline's fallback order and placeholder values (L818–828);
- the Ranking tab's regexes and its flagged fallback (L9550–9567);
- `aiSystemPrompt` (L7149–7177);
- `extractNamesFromDocx` (runs only on a passed prompt, L4187);
- `_promptIsDemoOnly` (L4209) — always false after DC-1. It is kept as a guard, and the build records it.

## 3 · Tests the release ships with

A new suite, **`t85_prompt_carryover.mjs`**, has two legs. The v6.21 leg pins each defect as `[KNOWN DEFECT 2026-10-20, D-53]` (or
the sibling's register ID), so the fix flips it.

"The example's distinguishing facts" below means: born 1964-01 and 1966-01, planning to 80 and 87, "Florida", and the home trio
450,000 / 120,000 / 4.25. The 2029 and 0% values are excluded because the placeholders share them.

**A — the loader (engine level)**
- A-1: Start Fresh's call holds no prompt and none of the distinguishing facts, and the timeline marks the dates of birth and the
  retirement year as placeholders.
- A-2: the landing guided setup's call does the same.
- A-3: after a plan with its own prompt (Oregon, 1968, home $610K), the My Data guided setup's call clears it. None of the old plan's
  state or home reaches the new one.
- A-4: Restore and Import of a backup without `masterPrompt` clear it.
- A-5: a load with a prompt keeps it, truncated at 20,000 characters.
- A-6: both example paths — *Load sample data* (L14531) and the landing *Use example data* (L4572) — hold the demo, the latter even
  when something else was held.
- A-7: a page load of a stored Start Fresh plan with no prompt key holds no prompt. Its facts are the placeholders (1963-09 /
  1966-03, 90 / 90, no state), as §0.9 states.
- A-8: a page load of an example stored before v6.22 (its portfolio has no fact fields; its demo prompt is stored) still has every
  distinguishing fact. This is the no-migration claim.
- A-9: storage holds the loader's result. A non-string prompt leaves no key, and an over-cap prompt is stored truncated.

**B — extinction (AST)**
- B-1: the loader's prompt assignment has a branch writing `""` and a `useDefaults` branch writing `DEFAULT_MASTER_PROMPT`. The rule
  is asserted at the loader, not per call site, because L4572 passes a variable.
- B-2: `saveToStorage` deletes the prompt key for `""` and does nothing for an omitted argument. Every plan-loading caller passes the
  loader's prompt.
- B-3: every parser and home regex **matches** on `DEFAULT_MASTER_PROMPT` (non-null after the null-on-no-match change), and each
  match equals the matching `DEFAULT_PORTFOLIO` field, computed live.
- B-4: no getter and no loader insert reads `DEFAULT_PORTFOLIO` or a literal example amount (DC-6).

**C — the example unmoved**
- C-1: the timeline's values are deep-equal, v6.21 to v6.22, excluding the new placeholder record.
- C-2: t2's ten engine fingerprints are identical. The parity leg declares **no** intended engine change.
- C-3: the Ranking tab's home value, mortgage, equity and net worth are identical.
- C-4: My Data's starting values are identical.
- C-5: the withdrawal table is identical (domdiff, v6.21 → v6.22).
- Throughout: the unseeded live success rates are masked.

**D — rendered**
- D-1: a first visit, then Start Fresh. None of the distinguishing facts appears in the timeline or My Data. The dates and retirement
  year are blank, and the DC-2 notice is shown.
- D-2: Save & Apply with them blank stores none of the distinguishing facts. After a reload they are still blank and the notice
  still shows.
- D-3: no-state wording. With no state chosen, the Taxes footnote and labels, the Roth rules box and My Data's state line read the
  DC-3 wording. The example's footnote no longer mentions a master prompt. A manual non-zero rate with no state name does **not**
  read "charges no state income tax".
- D-4: with an unreadable stored plan whose prompt key holds a prompt, Start Fresh leaves no key.
- D-5: the DC-5 notice.
  - It shows on a saved plan with its own holdings that carries one of the example's groups, and names the group.
  - It does not show on the example, or on a plan with its own facts.
  - It changes nothing stored.
- D-6: with an unreadable stored plan, the landing *Use example data* leaves its prompt key alone.
- D-7: a Start Fresh plan's Ask AI preview (L12801) does not begin with the demo prompt.

**E — income (DC-6)**
- E-1: blocks present but no amounts → 0 / 0 / 0.
- E-2: blocks absent, not from the form, no prompt → 0 / 0 / 0, flagged, with the banner naming them.
- E-3: blocks absent and from the form → 0 / 0 / 0, flagged.
- E-4: the example still gets 3300 / 1300 / 400 and no banner.

**F — expenses (DC-7)**
- F-1: Restore and Import of a backup with no `expenses` are refused with the plain message. Nothing is loaded or stored.
- F-2: a backup with `expenses: []` is accepted, as it is today.

**Existing suites.** `t37` A6-4 and A6-6 change their expectation: a non-string prompt is still rejected, and the plan then has none.
Any other churn is as §0.7 measured; the build reports the actual figure.

**Controls.** `controls_v622_prompt.py` takes each fix out in turn and confirms the suite fails.

## 4 · Out of scope

- **The timeline's placeholders themselves** (born 1963-09 / 1966-03, retiring 2029, planning to 90). They remain the engines' values
  until a fact is entered. DC-2 stops My Data presenting them as entered.
- **The Ranking tab's invented home fallback** (500,000 / 150,000 / 4.0). It is flagged on screen (`_fb`). A cleared plan now shows
  it, flagged, instead of the example's home.
- **D-56**, filed (§0.6): the as-of date, Spouse B's claim age 63, the 2029 placeholder, and the Roth tab's 5-year lines.
- **D-55**, filed (DC-4).
- **`handleReload` and `STATE_CARRYOVER`** (L14451–14466, L637, L4575–4583). `DangerCloseMain` receives the handler as
  `onReloadData: _onReloadData` and never calls it (census: one hit, the destructuring), so the "Load New Data" path and its
  carry-over are dead.
- **The landing screen's file statuses** (L4553–4554), likewise dead. Both are recorded for ARCHITECTUREIssues, not removed here.
- **A-6**: an imported prompt still heads Ask AI.
- **D-52** and **D-54**.

## 5 · Decisions for Steve

**DC-1 — The fix's shape.**
- **(a) The example's facts move onto `DEFAULT_PORTFOLIO`, and a load without a prompt clears it (recommended).**
  - The example becomes self-describing; its engines are measured byte-identical (§0.8).
  - A plan that is not the example no longer holds the demo prompt, so no reader can take the example's facts from it. The one
    limit is a restored backup that carries the demo text (§0.9).
  - A stored example from before v6.22 still reads its prompt, so no migration is needed.
  - Expected suite effect: AB's (8,351 / 2, the 2 intended).
- **(b) Clear only.** The facts stay in the demo prompt. Measured: 133 existing checks in 22 suites fail (§0.7), because their
  fixtures load a copy of the example without its prompt. The example is the example only while its prompt rides along.
- **(c) Readers only.** The timeline, My Data and Ranking ignore the demo prompt, and the facts move. Measured: suite green (variant
  B). But it leaves the demo briefing heading a new plan's Ask AI and a previous plan's own prompt surviving a fresh build. An example
  stored before v6.22 would also lose its facts without a migration.

**DC-2 — What a new plan's My Data shows for facts not yet entered.**
- **(a) Blank, with a notice (recommended).**
  - A date-of-birth or retirement-year field whose value is only a placeholder — no field and no match in the plan's own prompt —
    starts blank. "No match" matters: after one save, every plan's prompt says *"born ?"*.
  - A fact parsed from a plan's own older prompt still shows.
  - A notice lists what is not entered and what the model uses meanwhile (1963-09 / 1966-03, 2029; one person for a single
    household). Life expectancy still starts at 90 as a visible value, and the notice names it if it was not entered.
  - Saving with fields blank leaves them unentered, and the notice stays.
- **(b) As today.** My Data pre-fills the placeholders, and a Save & Apply stores them as the plan's own: the same silent invention
  as the example's facts, with different numbers.

**DC-3 — A plan with no state.** "No state" means no state code, no state name, and a rate of 0.
- **(a) Say so everywhere it is shown (recommended).**
  - The Taxes footnote, the Roth rules box and My Data's state control read *"No state chosen — the model charges no state income
    tax. Choose your state in My Data to model it."*
  - The Taxes labels read *"STATE"* rather than *"STATE (your)"*.
  - A named 0% state reads *"… choose a different state in My Data to model a taxed state."*
  - A manual non-zero rate with no name keeps the Roth tab's existing *"A flat x% state tax…"* form.
  - The master-prompt sentence goes for every plan, the example included (wording only).
- **(b) Only remove the stale master-prompt sentence.**

**DC-4 — Ask AI for a plan that is not the example.**
- **(a) Nothing extra in code; correct the Field Manual; file D-55 (recommended).** A new plan sends its live context only, as every
  plan saved from My Data already does. §09 is corrected: the plan summary is written at Save & Apply, the live context at each
  question, and a plan never saved sends only the live context.

  Found at the scope: the demo prompt's *Section 1 — ground rules* (*"Educational Only: … do NOT recommend target asset allocations
  or specific securities"*) reaches only the example. A plan saved from My Data sends `genAIContext()` plus the live context, whose one
  guard is the asset-mix line's *"descriptive — do not recommend allocation changes"*. So today a Start Fresh plan gets those rules
  by accident. Under (a) it loses them, ending where My Data plans already are. Filed as **D-55** for its own scope.
- **(b) In this release, every plan gets Section 1's rules** ahead of its context. This changes every plan's Ask AI and needs its own
  wording review.

**DC-5 — Plans already saved with the example's facts** (a Save & Apply or Export after Start Fresh or the guided setup, v6.21 or
earlier).
- **(a) A notice in My Data (recommended).**
  - It shows when a plan whose **holdings are not the example's** (its positions differ from `DEFAULT_PORTFOLIO`'s tickers and
    balances) carries any of the example's groups:
    - both dates of birth 1964-01-01 and 1966-01-01 with life expectancies 80 and 87;
    - the home trio 450,000 / 120,000 / 4.25%;
    - "Florida" with no state chosen.
  - It names the groups and says they may have come from the example rather than been entered. It changes nothing, and it goes away
    when the facts no longer match.
  - Holdings rather than names, because the guided setup and the loader both write *"Spouse A" / "Spouse B"* for blank names (L4440,
    L4194).
  - Known misses: a plan that kept the example's holdings, and a partial match within a group.
- **(b) No notice** — the CHANGELOG says it.

**DC-6 — Income a plan never entered.**
- **(a) None, and say so (recommended).** The getters fall back to 0. The loader's inserted blocks carry 0, still flagged
  `isDefault`. The banner keys on the flag, not on a prompt being present, and is reworded: *"No Social Security / pension figures
  were found in this plan, so the model pays none — enter them in My Data."* This is the conservative direction.
- **(b) Keep the example's amounts, key the banner on the flag.** The warning survives DC-1, but the income is still invented.
- **(c) Register only.** Under DC-1 the banner then goes silent while the example's income is paid.

**DC-7 — A backup with no expense table.**
- **(a) Refuse it (recommended).** Restore and Import reject it with *"This backup has no expense table."* Export always writes one,
  and an empty list is still accepted.
- **(b) Load it with an empty table and a notice.** No spending: optimistic.
- **(c) Register only.**

**DC-8 — The demo text beside holdings that are not the example's** *(found by the build's independent review, after the decisions;
asked and answered 2026-10-20).* At v6.21 My Data's *Load sample data* stored the demo prompt key; a following guided setup, or an import
without a prompt, left it there, so v6.22 as first built still reloaded it beside the new plan — Florida and the $450,000 home, no notice.
- **(a) Close it (recommended).** A loaded prompt that is exactly the demo text, arriving with holdings that are not the example's, is not
  taken; a stored key of that kind is dropped. The example, a stored example and an example backup (the example's holdings) are unchanged.
- **(b) Disclose only.**

Steve: *"Close it"* — (a).

## 6 · Review record

**2026-10-20, independent review** (a separate agent, given the draft and the v6.21 source, not the work that produced them). It
re-ran p2, p3, p4 and p5 and reproduced every §0 figure. It confirmed 21 line citations, and that no other `??`/`||` `DEFAULT_`
fallback reaches a plan that is not the example.

Its findings, and what changed:

1. **Minor citation errors.** The file statuses' lines, the timeline's end line, and the prompt's length (277 lines, not 260) — fixed.
2. **The §0.1 table conflated the two example paths.** The landing *Use example data* stores no prompt and does not set the demo —
   fixed; the loader now sets it (DC-1, A-6).
3. **Serious: DC-1 would silence the income-fallback banner** (the loader's literal $3,300 / $1,300 / $400 inserts, flagged only
   when a prompt was held). This was missed. DC-6 is widened to the inserts and the banner (§0.2).
4. **The expense table carries over by the same mechanism** — added as §0.3 and DC-7.
5. **Other example-valued fallbacks** — filed as D-56.
6. **DC-3 missed the Roth tab's no-state wording and the Taxes labels** — added.
7. **The Field Manual §09 is wrong about the prompt** — added (§0.5, DC-4).
8. **"Delete the key when no prompt" would fire on *Use example data* over an unreadable stored plan** — redesigned as three-state,
   with callers passing the loader's result (D-6).
9. **Storage kept the raw argument, not the loader's result** (a rejected object could be stored and reloaded) — fixed by the same
   change (A-9).
10. **Stored plans change figures on their next load without saying so** — stated in §0.9 and pinned by A-7.
11. **DC-2 needs "placeholder" to mean "nothing matched"**, since the parsers return 2029 / 90 on no match — the parsers now return
    `null`. The DC-3 condition and single-household wording are defined.
12. **A-1, A-2, D-1, D-2 and C-1 could not pass as written** (the timeline holds 7 of the 10 facts; 2029 and 0% coincide with the
    placeholders; key order differs) — re-specified against the distinguishing facts and value equality.
13. **B-1 and B-3 would miss cases** — B-1 asserts at the loader; B-3 asserts each regex matched.
14. **Missing tests** — added: E-2/E-3, D-6, A-9, D-7, the Roth wording in D-3, the reload in D-2, and both paths in A-6.
15. **DC-1's terms did not match the variants measured** — §0.7 now names the recommended shape (A + facts) and argues from AB.
16. **DC-5's names heuristic excluded the likeliest plans** — it now keys on holdings, and the Export bake-in path is named.

## 7 · Build record

**FULFILLED 2026-10-20 — built as v6.22.** Source `88d476c346ecb76bfe522487eb1b582e`, built page `5aaca5ba443a94faa4a8582ebd6d96b0`
(`smoke_built` 22/22). Built against v6.21 as §0 states; every decision (a), and DC-8 (a) decided at the build.

**As built, against §1–§3.**
- **DC-1.** `DEFAULT_PORTFOLIO` carries the ten facts. The loader writes the prompt on every path: `DEFAULT_MASTER_PROMPT` for
  `useDefaults`, a string cut at the cap, or `""`. `saveToStorage` is three-state; the six plan-loading callers pass `MASTER_PROMPT`
  after the load; `applyAndContinue`'s `saveToStorage({})` leaves the key. The name extraction and the Social Security parse read the
  loader's result, not the raw argument (`_promptForSS` was `masterPrompt || MASTER_PROMPT`; `_promptIsDemoOnly` is kept as a guard that
  can no longer fire).
- **DC-2.** `_parseTargetRetireYear` and `_parseLifeExpectancy` return `null` on no match; the timeline applies 2029 / 90 and records
  `_placeholder`. My Data starts a placeholder date or retirement year blank, and the notice (read from the form) names each with the
  placeholder in brackets.
- **DC-3.** `NO_STATE_CHOSEN_MSG`, one sentence for the Taxes footnote and the Roth rules box; the Taxes labels drop "(your)"; My Data's
  line shows only with no code, no name and no rate. The review found three more sentences pointing at a master prompt — the Roth tab's
  header ("State tax per master prompt"), the Survivor tab ("per the master prompt") and Ask AI's preview ("your saved master prompt") —
  all reworded; and the Taxes description for a manual rate with no state name reads "a flat rate, no state named".
- **DC-4.** No code. The Field Manual §09 says what is sent; §04 (the banner) and §13 (a new bullet) say what changed.
- **DC-5.** The notice keys on holdings, through one function `holdsExampleHoldings` that DC-8 shares.
- **DC-6.** Getters `?? 0`; inserts carry 0, flagged; a flagged block a past load stored is zeroed; the banner keys on the flag and is
  reworded. ⚠ The first build also moved the inserted Spouse B block's claim age 63 → 67, which §4 had put out of scope (D-56); the review
  caught it and it was reverted.
- **DC-7.** `readBackupText` refuses a backup with no `expenses` list (`IMPORT_NO_EXPENSES_MSG`), so Restore and Import both do.
- **DC-8** (decided at the build). A loaded prompt that is exactly the demo text with holdings that are not the example's is not taken, and
  `loadFromStorage` drops such a stored key.

**Tests.** `t85` as §3, plus A-10 (a non-string prompt leaves none), A-11 / A-11b / A-12 (DC-8), and D-6 as specified. ⚠ Three harness
lessons, each fixed before the run counted: the DOM bundle keeps one module across renders, so the landing's *Use example data* was tested
first (in the app it is only reached on a fresh page); the v6.21 leg's held prompt depends on order, so A-7 runs after the example; and D-7
was moved before the first Save & Apply so its v6.21 pin is real, not `true`. Existing suites: `t37` A6-4 / A6-6 move as §3 said; **`t20`**
had declared `incomeSources: {}` and so had run since v5.37 on the example's inserted income — DC-6 made that $0, and the fixture now
states the same amounts (every `t20` figure unchanged on both legs); `t33` PINS gains `v622` (unchanged, confirmed by running); `t1` / `t4`
version strings by hand (the registrar widened their ternaries to "v6.21"); `t29` gains the `demo_prompt` census row (§K1: on the example
the held prompt is its own, so a leak cannot be seen there) and C-prompt-1; `t84` G-3's name. **Measured blast radius** of the as-built
shape: as AB's (§0.7), plus `t20`.

**Controls.** `qa/tools/controls_v622_prompt.py`: C0–C23 (the review asked for `getSSB`, `getPension` and DC-8 to be covered: C21–C23).

**Review** (an agent that had not seen the work, 2026-10-20): 18 findings. Confirmed the loader, storage, fields, parsers, notices,
no-state sites, income, the refusal, the Field Manual and the version sites, and the registrar's tags. **Fixed from it:** DC-8 (asked and
decided); the Spouse B claim age reverted; the three master-prompt sentences; the manual-rate description; the DC-5 sentence for a plan begun
from the example; stale comments at the Social Security parse and the banner; METHODOLOGY's "rendered tabs identical" (the 0% footnote's
wording changed on purpose); D-56's wording; E-32's severity; `t85` D-7's name; `t84` G-3's.

