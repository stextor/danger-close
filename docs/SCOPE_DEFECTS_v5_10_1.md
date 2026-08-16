# Danger Close — v5.10.1 scope (defect-fix release)

**Type:** patch release · defect fixes only, no new features
**Base:** v5.10 (`src/DangerClose.jsx` md5 `204d8e64be7ed07813c01476b8761647`)
**Regression baseline:** v5.9.2 (`a1f0d4a76565c63494628e957c66ff91`)
**Author:** Steve T. (stextor) · hobby project, single-file browser app

---

## 0. Why this release exists

The rebuilt t1–t6 regression baseline (shipped in `qa/qa-baseline/` with v5.10) found
**three pre-existing defects**. All three are present *identically* in v5.9.2 and v5.10,
so none is a v5.10 regression — they predate the contribution-accrual work and were simply
never caught before, because the original t1–t6 suite had been lost. Each is already pinned
by a dated `[KNOWN DEFECT]` test that asserts today's (wrong) behavior and is written to
flip to green the moment the defect is fixed.

**This release fixes those three and nothing else.** No new capability, no model changes
beyond what each fix strictly requires. The contribution-accrual feature shipped in v5.10 is
done and is out of scope here except as a thing the regression suite must keep green.

Priority order below is deliberate: **D1 (privacy) is P0**, then D2, then D3.

---

## 1. Defect D1 [P0] — Clear All Data does not wipe the API key or return to landing

### Severity: P0 — broken privacy promise

This is the highest priority in the release. Danger Close's entire pitch is "your data
never leaves this browser," and the Docs make an explicit, testable promise that Clear All
Data wipes everything **including the stored API key**. It does not. On a shared or public
machine, a user who clicks "delete everything" to protect themselves leaves their
`sk-ant-…` credential sitting in browser storage. That is exactly the failure the feature
exists to prevent.

### Current (buggy) behavior
- The **CLEAR ALL DATA** button's handler, `performClearAll` (around line 10381), removes the
  My Data draft and then overwrites the plan with a blank one via `onApply(blank, [], "")`.
  It **never calls `clearStorage()`**.
- `clearStorage()` (around line 2773) is the function that *does* delete the API key
  (`STORAGE_KEYS.apikey`, comment: "credentials never survive a wipe") along with skin,
  uiScale, offline, localLLM, etc. But it is only wired to `handleReload` (line ~11191),
  **not** to the Clear All Data button.
- Consequence 1: the API key (and skin/offline/localLLM prefs) **survive** "delete everything."
- Consequence 2: because a blank plan is written back to `portfolio_v1` rather than the keys
  being deleted, the app does **not** return to the landing screen on the next mount — it
  reopens into a blank-but-present plan. Docs §03 and §11 both state it returns to landing.

### Docs promises being violated (these are the acceptance spec)
- §10: "…the app's own **Clear All Data** all wipe the key (Clear All Data does so
  deliberately)."
- §10 table row: "FORGET KEY removes it instantly; **Clear All Data wipes it too.**"
- §03 / §11: "**Clear All Data** … wipes the browser cache and **returns you to the landing
  screen.**"

### Fix
In `performClearAll`, **await `clearStorage()`** as part of the wipe, so the button's
behavior matches `handleReload`'s and matches the docs. The blank-plan write is either
removed (preferred — let the fresh-boot path show the landing screen) or kept only if
`clearStorage()` still runs first and the landing-screen return is preserved. The intended
end state after confirming "Yes, delete everything":
1. `portfolio_v1`, `expenses_v1`, `prompt/master_prompt_v1`, `meta_v1`, the My Data draft,
   **and `apikey`**, plus skin/uiScale/offline/localLLM/acaRegime, are all deleted.
2. The app is back on the landing screen (Guided Setup / Start Fresh / Restore / Use Example).

Keep the existing in-UI confirmation dialog ("DELETE YOUR ENTIRE PLAN?" → "Yes, delete
everything") exactly as is — the defect is in what the confirm handler does, not in the
confirmation flow.

### Test pin that verifies the fix
`qa/qa-baseline/t5_storage.mjs`, Phase D. Two pins currently assert the bug:
- `D [KNOWN DEFECT]: API key SURVIVES Clear All Data (docs promise a wipe — fix pending)`
- `D [KNOWN DEFECT]: no return to landing screen (blank plan stays cached — fix pending)`

**When fixed, flip both:** the key must be *absent* from stored keys after the wipe, and the
landing screen must be present. Rename them from `[KNOWN DEFECT]` to normal assertions
(e.g. `D: Clear All Data wipes the API key` / `D: Clear All Data returns to the landing
screen`). t5 must stay green on both v5.10.1 and — importantly — must be *updated in place*
so the pin reflects the new contract; the v5.9.2 leg will then show this defect as the pre-fix
state (that's expected and fine — v5.9.2 is frozen history, we don't backport).

---

## 2. Defect D2 — ACA cliff solver ignores MAGI created by its own funding sale

### Severity: high — silently wrong strategy output on a headline feature

The **STAY UNDER ACA CLIFF** strategy exists to convert *up to* the ACA subsidy cliff and no
further, preserving a subsidy often worth $10–25K/yr. When the conversion tax is funded by
selling **appreciated brokerage** (`convTaxFunding: "taxable"` with `taxableGainFrac > 0`),
the sale realizes capital gains that land in ACA MAGI — and the solver does not leave room
for them. It converts right up to the cliff, then its own funding sale pushes the household
*over* the cliff, forfeiting the **entire** subsidy. The strategy produces the exact outcome
it was built to avoid, and presents it as the "safe" row.

Measured on the t3 fixture: full forfeit of **$54,719** with appreciated-sale funding, versus
a partial loss of **$18,888** under gain-free funding — a ~$36K swing hidden inside a strategy
labeled "stay under the cliff."

### Root cause (exact location)
- The cliff solve is at **lines 3424–3426**:
  ```
  const cliff = ACA_CONSTS.cliffMult * acaFplFor(yr, acaSize);
  conv = Math.max(0, Math.min(cliff - (base + div_y + ss) - ACA_CONSTS.solverMargin, headroomTrad));
  ```
  It subtracts the known MAGI components (ordinary base, dividends, full SS) and a fixed
  `solverMargin`, but **not** the capital gains its funding sale will realize on `conv`.
- The funding-sale gains *are* computed correctly — later, at **lines 3507–3523** — where a
  fixed-point gross-up adds the realized gain `g` into `magiHist[yr]`. But that happens
  *after* the cliff solve has already chosen `conv`, so the solver never sees it. The two
  pieces of MAGI accounting don't talk to each other.

### Fix (intended approach — implementer's discretion on the exact form)
Make the cliff solver account for the MAGI its own funding sale will add, so the *post-sale*
MAGI lands under the cliff rather than the *pre-sale* MAGI. Because the gain is itself a
function of the conversion size (bigger conversion → bigger tax → bigger sale → bigger gain),
this is a small fixed-point/iterative solve, mirroring the gross-up already at 3507–3523:
- Only applies when `ACA_REGIME === "current"` **and** funding is a gains-realizing sale
  (`convTaxFunding === "taxable"` and `taxableGainFrac > 0`). Under `withhold` or gain-free
  funding the current formula is already correct — do not change those paths.
- Iterate: solve `conv` against the cliff, estimate the funding-sale gain that `conv` implies
  (reuse the existing gross-up math so the two agree), subtract that gain from the cliff
  headroom, re-solve. A few passes converge (same pattern as the existing solver loops).
- Preserve the existing `solverMargin` behavior and the existing "$0 in a bridge year is the
  finding, not a bug" case (when even a gain-free conversion of $1 clears the cliff, the
  solver correctly returns 0 — keep that).
- The reported `acaSubByYr` for the cliff strategy should then show a **preserved partial
  subsidy** under appreciated-sale funding, matching what gain-free funding already achieves,
  rather than all-zeros / full forfeit.

### Honest-limits note to carry in METHODOLOGY
This makes the cliff solver self-consistent with the funding model; it does not add per-lot
gain selection, loss harvesting, or wash-sale logic (all still out of scope, as documented).
The gain share remains one blended figure. Update the METHODOLOGY ACA section to state that
the cliff solver now nets out its own funding-sale gains.

### Test pin that verifies the fix
`qa/qa-baseline/t3_roth.mjs`, ACA section. The current pin asserts the bug:
- `ACA [KNOWN DEFECT]: appreciated-sale funding pushes the cliff solver over its own cliff
  (full forfeit — fix pending)` — asserts `acaSubByYr` is all-zeros and the loss exceeds the
  gain-free case.

**When fixed, flip it:** under appreciated-sale funding the cliff strategy must now preserve a
partial subsidy (`Object.values(gainy.acaSubByYr).some(v => v > 0)`) and its `totAcaLoss` must
be **at or below** the naive slider's — i.e. it beats a cliff-crossing conversion instead of
matching it. Keep the adjacent gain-free-funding assertions (they should stay green
unchanged). Rename from `[KNOWN DEFECT]`.

---

## 3. Defect D3 — phantom Spouse B card on the SS tab for single filers

### Severity: medium — confusing/incorrect display; engines are already correct

A single-filer household (`single: true`) sees a full **"SPOUSE B — BENEFIT BY CLAIMING AGE"**
card on the SS tab, showing a benefit table for a spouse who does not exist. The number is not
even zero — it is **invented** by the spousal-top-up derivation (50% of Spouse A's FRA) applied
against an empty $0 record and a placeholder DOB. The engines are already correct: the Monte
Carlo and Roth engines model B at $0, and the SS tab itself prints a note reading roughly
"MC simulation models Spouse B at $0/mo (age 67 claim)…" directly below the phantom card —
the tab literally contradicts itself on screen.

So this is purely a **display-gating** bug: a couples-only section isn't gated on `single`.

### Fix
Gate the SS tab's Spouse-B sections on the household's `single` flag (the timeline's
`tl.single` / `PLAN_TIMELINE.single`), so that for a single filer:
- the "SPOUSE B — BENEFIT BY CLAIMING AGE" card is not rendered,
- the Spouse-B breakeven card is not rendered,
- the "born ~Sep 19XX │ FRA…" placeholder line for B is not rendered,
- and the self-contradicting "MC models Spouse B at $0" note is unnecessary and can go with it.

Do **not** touch the engines — they are correct. This is a pure conditional-render change on
the SS tab's B blocks. Verify the couples path is unchanged (the B card must still render for a
two-person household).

### Test pin that verifies the fix
`qa/qa-baseline/t6_single.mjs`, SS section. Two pins currently assert the bug:
- `SS [KNOWN DEFECT]: phantom Spouse-B claiming card renders for a single household (fix pending)`
- `SS [KNOWN DEFECT]: engine honestly models the phantom at $0 while the card shows a derived benefit`

**When fixed, flip the first:** for a single filer the SS tab must **not** contain
`SPOUSE B — BENEFIT BY CLAIMING AGE`. The second pin (engine models B at $0) can be kept as a
positive assertion or retired — the engine behavior it documents is correct and unchanged;
simplest is to keep a single assertion that no phantom B card renders while B stays $0 in the
model. Rename from `[KNOWN DEFECT]`. The existing t4 couples-path DOM walk must stay green
(B card still present for couples).

---

## 4. Out of scope (stated so the boundary is enforceable)

- **No new features.** Contribution accrual (v5.10) is complete; working-year taxation
  ("Option B") remains a possible **v5.11+**, not this release.
- **No engine/model changes** beyond the minimal MAGI-consistency fix D2 strictly needs.
  MC parity with v5.9.2/v5.10 must remain byte-identical (t2 compare stays 8/8) — none of the
  three fixes touches the MC engine, so this should hold automatically; if it doesn't, a fix
  has overreached.
- **No backport to v5.9.2.** That build is frozen history and the comparison baseline; its
  legs will continue to show these three as pre-fix state. That is expected.
- **No per-lot cap-gains modeling, loss harvesting, or wash-sale logic** (D2 stays a blended,
  self-consistent approximation).
- **No changes to the Clear All Data confirmation UX** (D1 fixes the handler, not the dialog).

---

## 5. Acceptance criteria (the whole release, in one checklist)

1. **D1 fixed:** `performClearAll` awaits `clearStorage()`; after "Yes, delete everything,"
   `apikey` (and skin/uiScale/offline/localLLM/acaRegime) are gone from storage and the app is
   on the landing screen. t5 Phase-D pins flipped to green and de-`[KNOWN DEFECT]`-ed.
2. **D2 fixed:** the ACA cliff solver nets out its own funding-sale gains under
   appreciated-sale funding; the cliff strategy preserves partial subsidy and beats a
   cliff-crossing slider on forfeited subsidy. t3 ACA pin flipped and de-`[KNOWN DEFECT]`-ed.
3. **D3 fixed:** no Spouse-B card/breakeven/DOB line on the SS tab for single filers; couples
   path unchanged. t6 SS pin flipped and de-`[KNOWN DEFECT]`-ed.
4. **Whole suite green on v5.10.1:** t1–t6 (baseline) + t7–t9 (feature) + t2 parity 8/8, run
   from the committed repo tree. Target counts: the three flipped pins now pass as positive
   assertions; totals unchanged in shape (roughly t1 62 · t2 15 · t3 35 · t4 90 · t5 27 ·
   t6 17 + parity 8 + t7 37 · t8 27 · t9 14, with the three pins now green-by-fix rather than
   green-by-documenting-the-bug).
5. **No new failures anywhere**, and the v5.9.2 baseline leg still behaves as frozen history.

---

## 6. Release mechanics after the three fixes land

These are the same steps every Danger Close release runs; listed so nothing is missed:

1. **Bump the version string** to `v5.10.1` in the source — the field-manual callsign
   (`// FIELD MANUAL · v5.10.1 · PUBLIC BUILD`) and the end-of-manual footer
   (`DANGER CLOSE v5.10.1 · …`). (t1's STATIC checks assert these strings, so they'll fail
   until bumped — that's the reminder.)
2. **CHANGELOG:** add a `## v5.10.1` entry at the top describing the three fixes, noting each
   was a pre-existing defect (not a v5.10 regression) found by the rebuilt baseline, and that
   each fix is verified by its now-passing former-pin test.
3. **METHODOLOGY:** update the ACA section for D2 (cliff solver now nets its own funding-sale
   gains); a one-line note for D1 (Clear All Data wipes credentials — restate the promise now
   that it's true); optionally a line for D3.
4. **Docs (DOCS_HTML in-source):** no change needed for D1 (the docs already promised the
   correct behavior — the code now matches). Light touch only if any wording referenced the
   buggy behavior.
5. **Rebuild `index.html`** from the fixed source via the Vite single-file scaffold; verify it
   carries `v5.10.1` and is self-contained (except the intentional Google Fonts link).
6. **Re-run the full suite from a clean clone** of the pushed tree to confirm green, exactly
   as done for the v5.10 ship-verification.
7. **Refresh project knowledge** once, with the final v5.10.1 state: `DangerClose.jsx`,
   `CHANGELOG.md`, `METHODOLOGY.md`, and the updated t3/t5/t6 (whose pins are now assertions).
   This is also the moment to retire `SCOPE_CONTRIB_ACCRUAL_v5_10.md` from knowledge if not
   already done, and to retire this scope (`SCOPE_DEFECTS_v5_10_1.md`) once the release ships.
8. **Tag / release** on GitHub as `v5.10.1`.

---

*Prepared 2026-08-06. The three defects, their exact source locations, and their self-verifying
test pins were established by the rebuilt t1–t6 regression baseline that shipped with v5.10.*
