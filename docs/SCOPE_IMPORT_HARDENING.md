# SCOPE — import hardening (A-2, A-4, A-5), with SCOPE_STATE_SET_SELECTOR stage 2 folded into the same release

| | |
|---|---|
| Status | **OPEN — SESSION 1 BUILT AS A WORKBENCH 2026-09-15 (§9), NOT SHIPPED; SESSION 2 OWED.** H-1…H-5 and the stream/claim-age half of H-6 are built, with `t38` and one negative control per fix, **without a version bump** (D-6). ⚠ **One NEW decision is open: D-10 (§7a)** — the birth-year half of H-6 rests on a premise the build found false. On `package_check`'s I-2 allowlist |
| Premise verified against | **v5.71 source `9e79b92f9eb91e86489cb6b80caa33c3`, repo `1cbf23b`** — every figure below is command output from 2026-09-15 |
| Owed by | `FlawsToFix-v5_69-Phase1.md` (A-2, A-4, A-5, recommended there as one later import-hardening scope) and `SCOPE_STATE_SET_SELECTOR.md` §7.6 (stage 2 waits for a release that already bumps the version) |
| Target | **v5.72** — an app release: source change, version bump, rebuild, `smoke_built` |
| Direction | Import robustness moves **no figure**. Stage 2 moves **no figure** unless D-8 adds a state to the list (it still moves no figure — it moves only which assertions are true) |

**Product boundary.** Restoring a backup is an existing feature; this makes it behave correctly on bad input. Build it.

---

## 1 · The premise, re-measured at v5.71

The §A freshness check passed first: HEAD `1cbf23b`, source md5 identical in repo and pool, pool 123 files.
The audit measured these findings at **v5.69**; all three were **re-run against v5.71** with
`qa/tools/probe_import_hostile.mjs`, on **both** import paths — My Data → *Import backup*
(`handleImportFile` → `handleImportData`) and the landing screen's restore (`restoreBackup` → `handleLoaded`).
**The positive control (`valid`) imports on both paths**, so the other cases mean something.

| Case | My Data path | Landing path |
|---|---|---|
| `portfolio: "x"` | **no message**; unobserved rejection *(reading 'ssA')*; memory holds the string `"x"`; stored plan = prior plan | *"Restore failed — Cannot read properties of undefined (reading 'ssA')"*; memory holds `"x"`; nothing stored |
| `positions: [null]` | **no message**; unobserved rejection *(reading 'owner')*; memory replaced; stored = prior | raw engine error shown; memory replaced; nothing stored |
| `otherAccounts: [null]` | **no message**; rejection *(reading 'taxType')*; memory replaced; stored = prior | raw engine error shown; memory replaced |
| `expenses` malformed | **no message**; rejection *(reading 'freq')*; memory replaced; stored = prior | raw engine error shown; memory replaced |
| `skin: "constructor"` | **page empty — 0 tabs, body length 0**; plan already stored; `skin_v1` unset; next visit recovers | same failure (window error *reading 'bg'*); plan stored |
| absurd years | imports, no hang (v5.9.1 clamps hold) | same |
| **20,000 holdings** | **Node heap exhausted** (FATAL, out of memory) | **same** |

⚠ **The 20,000-row result is a jsdom measurement, not a browser one.** It establishes that nothing bounds the
row count, not that a real tab crashes.

⚠ **An error of mine, corrected before it shipped.** My first summary of this table read the landing path as
leaving memory *intact*. The script parsed the memory line printed **before** the import. The raw block shows
the plan replaced after it, which is what the audit said.

### Source, read at v5.71 (`funcmap.cjs`, `census.cjs`; line numbers move every release)

- **A-4 · two causes, both still present.**
  - `handleImportFile` (L12327–12345) calls `onImport(…)` inside a *synchronous* `try`. `onImport` is
    `handleImportData` (L13201–13210), which is `async`, so a throw inside it is an unobserved rejection and the
    `catch` that sets the message never runs.
  - `applyLoadedData` (L3255–3470) opens with `if (portfolio) PORTFOLIO = portfolio;`. **It replaces before it
    validates.**
- **A-5 · THREE truthy gates, not the two the audit named.** `census.cjs SKINS` finds `SKINS[x]` used as a
  gate at **L13095** (the page-load read of the *stored* skin), **L13187** (`handleLoaded`) and **L13207**
  (`handleImportData`). **`skinVars` (L3936) has the same defect as a fallback**: `SKINS[skinKey] || SKINS.default`
  lets `SKINS.constructor` (a function, truthy) through, then `S.tokens` is undefined.
  - **No error boundary:** `getDerivedStateFromError` 0 hits, `componentDidCatch` 0 hits.
- **A-2 · still open.** The v5.9.1 clamps are unchanged. A non-numeric birth year is still left in place (no
  `else`). Nothing bounds a list's length.

### ⚠ The ordering defect reaches every load path, not only the two import paths

`census.cjs applyLoadedData` finds **eight callers**:

| Caller | Line | Path |
|---|---|---|
| `loadFromStorage` | L3485 | every page load, from stored data |
| `applyAndContinue` | L3710 | landing screen, spreadsheet/docx |
| `startFresh` | L3764 | blank plan |
| `restoreBackup` | L3779 | landing restore (A-4) |
| `GuidedWizard` `onDone` | L3795 | wizard |
| `handleApplyData` | L13194 | My Data Save & Apply |
| `handleImportData` | L13202 | My Data import (A-4) |
| `handleLoadSample` | L13221 | sample plan |

Any change to replace-then-validate changes all eight.

**Source-traced, NOT run:** `loadFromStorage` catches a throw from `applyLoadedData` and returns `false`, by which
time `PORTFOLIO` has already been replaced. A corrupted *stored* plan would therefore leave the session on the
landing screen with the corrupt plan in memory. The build must run this, not assume it.

## 2 · Stage 2 of SCOPE_STATE_SET_SELECTOR, re-measured

- `vercensus.cjs v571 qa qa/tools qa/qa-baseline`: **20 files, 21 ladder entries, 65 gated expressions — 86 judgement
  points**, unchanged by the stage-1 package (`state_sets_check.mjs` carries no ladder, by design).
  ⚠ Run with **no directory arguments** it prints **0** — a vacuous zero. Always pass the directories.
- **Shape of stage 2.** `STATE_RULES` rows gain `incomeLimitedInLaw: true`. `qa/tools/state_sets.cjs` derives
  `IN_LAW` from that field on the leg's rules; the hand-typed list survives only as `state_sets_check` S-1's
  literal (where a second copy **is** the assertion). **Gated per leg**: legs before v5.72 have no field and must
  keep the hand list.
- **The stage-1 blind spot this closes:** removing CT or NJ from the list was invisible (both carry
  `excl65 = 0`). Once the list is data, S-1 compares data to the statute list and catches it.

### ⚠ Maine is income-limited in law, and is not in the list (read 2026-09-15, primary source)

**Maine Revenue Services' summary of 2025 enacted legislation:** from **TY2025** the pension income deduction phases
out above federal AGI of **$125,000 single / MFS, $187,500 HoH, $250,000 MFJ**, inflation-adjusted after 2025 —
**36 M.R.S. §5122(2)(M-3), P.L. 2025, c. 388, Pt. H**.
- **v5.71 models Maine at `excl65` $48,216 with no `exclTest`.** The note discloses that the phaseout is not modelled.
- So **Maine is exactly an "unconverted" state**: income-limited in law, applied unconditionally in the model. That is
  **optimistic** for a household above the threshold.
- ⚠ **The phaseout RATE was not in that summary and was not read.** Nothing below may assume it.
- The stage-1 drift guard could not see Maine because its note does not use the phrase. This is the limitation
  stage 1 disclosed, now with a concrete instance.

**Montana is correctly outside the list.** MCA 15-30-2120(3)(g) grants each taxpayer 65+ a subtraction with **no
income test**. The note's "income-based exemption" refers to Social Security's federal treatment.
- ⚠ **Lead, NOT verified:** a secondary source (a tax-software blog) says the subtraction is inflation-indexed to
  **$5,660** for 2025, while v5.71 carries **$5,500**. Not a primary source — **out of scope** (§6); recorded so it
  is not lost.

## 3 · What the build changes

| # | Change | Sites (v5.71) |
|---|---|---|
| **H-1** | **Validate before replacing** (D-1): build and check the candidate plan, and assign `PORTFOLIO` only when it passes; restore the prior plan on any throw | `applyLoadedData` L3255, and its eight callers' error handling |
| **H-2** | **Await the My Data import** so its `catch` runs; one plain message on failure, on both paths (D-2) | `handleImportFile` L12327, `handleImportData` L13201, `restoreBackup` L3772 |
| **H-3** | **Own-property skin checks** at all three gates, plus `skinVars`'s fallback | L13095, L13187, L13207, L3937 |
| **H-4** | **A top-level error boundary** (D-3) | the app root |
| **H-5** | **Bound list lengths and file size** (D-4); **reject** the file rather than truncate it | the two import handlers, before parse and before apply |
| **H-6** | **Clamp the fields added since v5.9.1** and delete a non-numeric birth year, like its neighbours (D-5) | the clamp block in `applyLoadedData` |
| **S-2** | **Stage 2**: `incomeLimitedInLaw` on the in-law rows; the suite derives its list from it (D-7, D-8) | `STATE_RULES`; `qa/tools/state_sets.cjs`; `state_sets_check.mjs` |
| **V** | **v5.72 bump**: four in-app sites, 20 files / 21 ladder entries / 65 gated expressions, new `dom_entry_v572.jsx`, rebuild, `smoke_built`, pool rotation | per `vercensus.cjs` |

### 3a · D-4, measured (2026-09-15, v5.71, jsdom, My Data path)

`probe_import_hostile.mjs <tag> rows mydata` with `ROWS=<n> LIST=<list>`. "Settled" is the probe's own figure
from dispatch to a quiet page, and **includes about 1.1 s of fixed waits**; the real-size positive control
(`valid`) settled in 4.6 s under load.

| Rows | positions only | all four lists (positions, other accounts, streams, expenses) | all-four payload |
|---|---|---|---|
| 100 | 3,347 ms | 4,620 ms | 49 KB |
| 500 | 6,016 ms | 15,311 ms | 239 KB |
| 1,000 | 9,526 ms | 33,958 ms | 476 KB |
| 2,000 | 15,883 ms | 73,543 ms | 951 KB |

Growth is close to linear with no cliff, and every run rendered all 26 tabs. **Chosen: 500 rows per list and
5 MB — the starting guess, confirmed.** 500 is far above any real household, and a file with every list at
500 is a quarter of a megabyte, so 5 MB bounds the parse without ever refusing a real backup. The caps are
`IMPORT_MAX_ROWS` and `IMPORT_MAX_BYTES`; a file over either is **rejected**, never truncated. ⚠ These are jsdom
timings; a browser was not measured.

## 4 · Tests this ships with

A new suite, **`t38_import_hardening.mjs`**, runs on **both legs**. The prior leg pins each defect as
`[KNOWN DEFECT pre-v5.72]`; the current leg asserts it extinct.
⚠ It must set `globalThis.FileReader = window.FileReader`. `env_dom.mjs` defines none, and without it a **valid**
backup "fails" — the trap `probe_import_hostile.mjs` found through its own positive control.

1. **EXTINCTION — a rejected import changes nothing.** For each hostile case, on each path:
   - the stored plan is byte-identical to before;
   - the in-memory plan equals the prior plan;
   - a message is shown, and it is not a raw engine error.
2. **The positive control** — a valid backup imports on both paths. Without it, (1) passes on a broken importer.
3. **Every inherited name** — `constructor`, `toString`, `valueOf`, `hasOwnProperty`, `__proto__` — through
   **each** of the three gates **and** `skinVars`. The audit ran only `constructor`.
4. **The error boundary** renders its fallback on a forced render throw, and does **not** clear stored data.
5. **Bounds:** a file one row over each cap is rejected with storage unchanged; a file **at** each cap imports
   (§B2 — only the pin at the boundary discriminates).
6. **Clamps:** each new clamp at its bounds and one past them; a non-numeric birth year is removed.
7. **The load path:** a corrupted stored plan leaves memory at defaults, not at the corrupt plan. This is the
   source-traced claim of §1, which must be **run** before it is asserted.
8. **Stage 2:**
   - the list is derived from the field on v5.72 and from the hand list before;
   - S-1 still equals the statute list;
   - `t29` F-6 and `t35` D-8 are gated per D-8's outcome.
9. **Negative controls**, one per fix, **each reverted separately**. H-1 has two halves: reverting only the
   ordering, and reverting only the rollback, must each turn something red. The shape follows
   `controls_state_sets.py`: sabotage in a throwaway copy, and print the watched md5s before and after.

**What stays expected-blind:** MC parity 10/10. The parity fixtures never import a file.

## 5 · The version bump is priced, not assumed

This scope does **not** call the bump "four in-app sites." `vercensus.cjs` prices it at **86 judgement
points**, before `t38` adds its own ladder. Three earlier scopes under-priced a bump by roughly a factor of
sixty; this line exists so that is not a fourth.

## 6 · Explicitly out of scope

- **A-6** (imported `masterPrompt`) — fixed at v5.71, pinned by `t37`.
- **The checklist shape check** (A-2's last bullet). Rendering with a real item id was **inconclusive** at v5.69 and
  was not re-run. It needs its own probe first.
- **Populating Maine** — pricing its phaseout needs §5122(2)(M-3) read in full. It would be its own populate scope,
  like CT, NJ, NM, VA and RI.
- **Montana's $5,500 vs $5,660** (§2). Unverified, and it would move figures (METHODOLOGY). File it separately.
- **Performance tuning** of large but legal plans. H-5 bounds the input; it does not make big plans fast.
- **Browser-side measurement of the heap failure.** The jsdom figure is disclosed as jsdom's.

## 7 · Decisions — ALL TAKEN 2026-09-15

**The maintainer approved every recommendation below, as written** (*"go with your recommendations"*). The
**Recommendation** column is therefore the decision.

Two of them still leave work for the build:
- **D-4's numbers are chosen by measurement during the build**, not now. The build records the measurement and
  the caps it picks, in this document, before shipping.
- **D-8's Maine populate is a separate future scope.** v5.72 only adds Maine to the list.


| # | Question | Options | Recommendation — **DECIDED** |
|---|---|---|---|
| **D-1** | How does `applyLoadedData` stop replacing before validating? | (a) validate a candidate first, assign only on success; (b) snapshot and roll back on any throw; (c) both | **(c).** (a) is the fix; (b) catches what (a)'s checks don't foresee. Both are cheap, and each gets its own control |
| **D-2** | What does a failed import say? | (a) keep the landing path's raw engine error; (b) one plain message on both paths, e.g. *"That file couldn't be restored. Your saved plan was not changed."* | **(b).** The raw error means nothing to a user, and the second sentence is the thing they need to know — H-1 is what makes it true |
| **D-3** | Add a top-level error boundary? It is a new, user-visible failure screen | (a) no; (b) yes: a short message, a **Reload** button, and nothing that deletes data | **(b).** A blank page is the worst failure the app has. ⚠ **Must never offer to clear data on its own** — that decision stays with the user in My Data |
| **D-4** | What caps, and what happens over them? | caps per list (holdings, other accounts, expenses, income streams) plus a file-size cap; **reject** or **truncate** | **Reject**, never truncate — silent truncation is exactly the undisclosed simplification the project forbids. **Numbers: decide after the build measures** import time at 100 / 500 / 1,000 / 2,000 rows. My starting guess is 500 per list and 5 MB, which is far above any real household |
| **D-5** | Clamp the newer fields? | stream years, Social Security claim age; delete a non-numeric birth year | **Yes**, same pattern as v5.9.1. Claim age to 62–70. **Say so** in the import notice when anything was adjusted, rather than silently |
| **D-6** | Split the release across sessions? | one session / a planned handover | **Plan the handover.** Six fixes, a new both-leg suite, controls, stage 2 and an 86-point bump will not fit one session to standard. Suggested cut: session 1 builds H-1…H-6 with `t38` and controls **without** bumping; session 2 does S-2, the bump, rebuild and ship |
| **D-7** | Fold stage 2 into this release? | yes / no | **Yes.** That is the reason for pairing: the 86 points get paid once |
| **D-8** | Does Maine join the in-law list at stage 2? | (a) yes — the unconverted set becomes {ME}, `t29` F-6 and `t35` D-8 **re-invert** to non-empty guards gated at v572, and ME waits for its own populate scope; (b) no — keep five and file ME as a finding | **(a).** The list is meant to be the statutory fact, and Maine is one. An empty set that is empty only because Maine is missing is the vacuous green §B2 warns about. The app's note already discloses the gap, so no user-facing copy has to change |
| **D-9** | Montana's figure lead | check it in this release / file it | **File it.** It moves a figure, so it belongs in a modelling release with METHODOLOGY, not in a robustness one |

## 7a · A decision the build opened (2026-09-15, session 1)

| # | Question | Options | Recommendation — **OPEN** |
|---|---|---|---|
| **D-10** | The v5.9.1 birth-year clamp reads `PORTFOLIO.dobA.year`, but by `census.cjs dobA` the field is only ever **written as a string** (wizard `"YYYY-06"`, My Data `"YYYY-MM-DD"`), so the clamp **can never fire** — and H-6's "delete a non-numeric birth year, like its neighbours" would add an `else` to dead code. `probe_import_hostile`'s `years-absurd` never tested it either (it built `dobA` with `Object.assign({}, <string>, …)`). **Measured on v5.71:** `"9999-01-01"` reaches the timeline as year 9999 (Social Security in 10066); `"9999-01-01"` and `"0001-01-01"` import and render with no hang and no error | (a) clamp the **year inside the string** to 1900–this year, and delete a string `_ymd` cannot parse; (b) leave it and record the limitation; (c) delete the dead clamp only | **(a).** Deleting an unparseable string moves no figure (the timeline already falls back when `_ymd` returns null); the year clamp moves figures only for impossible years, and is reported through the same D-5 notice. **Not built** — the STOP rule forbids adapting a premise silently. `t38` Y-1/Y-2 pin the current behaviour on both legs and must be re-gated, not deleted, when this is decided |

## 8 · Budget, stated

Two sessions, per D-6. The honest failure mode is a release that bumps the version with half the hardening
done. D-6's cut avoids that by keeping the bump in the session that ships.

## 9 · Session 1 record (2026-09-15) — workbench, not shipped

**Built against v5.71 `9e79b92f…`; the workbench source is `e8194934…` (§ stop report for every file and md5).**
No version bump, no `STATE_RULES` change, no rebuild. Session 2 owes S-2, V, D-10's build if taken, and the
runner line for `t38`.

- **H-1.** `validateLoadedPlan` (shape only) runs before anything is assigned; the body is now
  `applyLoadedDataUnchecked`, and `applyLoadedData` snapshots every binding it writes and restores all of them
  on any throw — **in place** when no new plan was passed, so the live object keeps its identity. The page-load
  path is **run, not assumed**: on v5.71 a stored plan with `positions: [null]` lands on the landing screen with
  **the rejected plan in memory** and Start Fresh overwriting it **without asking** (`t38` L-1/L-4 pins). Now
  memory stays at the defaults, the landing screen says why, and Start Fresh asks.
- **H-2.** The My Data handler awaits `onImport`; both paths use the D-2 wording. ⚠ **Behaviour change beyond
  the letter of the scope:** an unsaved My Data draft is now dropped only **after** an import succeeds. v5.71
  dropped it before, so a rejected file cost the user their edits. `t37` IM-1 (a valid import drops the draft)
  still holds.
- **H-3.** One predicate, `isSkinKey`, at all three gates and in `skinVars`.
- **H-4.** `AppErrorBoundary` wraps the root: a message, a **Reload** button, no data control; it still
  reports to `console.error`. ⚠ jsdom cannot observe the navigation, so `t38` B-6 asserts only that pressing
  Reload changes no data.
- **H-5.** §3a.
- **H-6.** Stream years 1900–9999 (figure-neutral; `t38` C-3); claim age 62–70 with `0`/`""` left alone
  (the wizard stores 0 for an empty box and every reader treats it as "default"). Every adjustment —
  **including the old v5.9.1 clamps, which were silent** — is recorded in `_importAdjusted` and shown on My
  Data. **Birth year: D-10.**
- **§B1a pass** (AST, regexes executed against the old and new copy): no existing suite asserts the removed
  wording. The one reader that did, `probe_import_hostile.mjs`'s error matcher, would have printed
  `importErr=null` for a correct v5.72 rejection; it is updated.
- **A harness defect caught while writing `t38`:** an `uncaughtException` handler that only recorded errors
  turned a crashed suite into a silent 0/0 (§B2). `t38` now prints DIED and exits non-zero.
