# SCOPE — A-3: the My Data draft autosave has never saved (with A-6 and F-3)

| | |
|---|---|
| Status | **OPEN — DECIDED AND BUILDABLE.** Written 2026-09-12; all six §5 decisions approved the same day (the recommendation in each case — see §5). Nothing here is built. |
| Measured against | **v5.70**, source `df3e5d7599277ae1bb1afc216d318baf`, built `index.html` `372d066cf4fc7115ebdae9fc9d6f35d1`, `src/main.jsx` `d9eca7b469a3fb7ec1c5325fd4bf8145`, `src/index.html` `52ef2be3080352df6198ee3b8c3507ad`, repo HEAD `d8c6aaa`, pool 130 files, no duplicate names |
| Parent findings | `docs/FlawsToFix-v5_69-Phase1.md` **A-3** (MEDIUM, undisclosed) and **A-6** (LOW); `docs/STATUS_2026_09_11_b3_live_verification.md` **F-3** (the first-open notice) and **F-1** (two vacuous `smoke_built` checks, riding as D-2 of that record) |
| Target release | **v5.71** |
| Kind | **A correctness and disclosure fix on the storage and import path.** No engine, tax or modelling change: `METHODOLOGY.md` does not change, and MC parity must stay 10/10 (OPERATIONS §E). It **does** change `src/index.html`, so it is a scaffold change: version bump and rebuild, and §N3a's scaffold check rebuilds v5.70 with **v5.70's** `src/index.html` from git, not the new one |

⚠ **Every figure and line number below is parser output at v5.70 and must be RE-MEASURED when the build starts.**
If the premise fails to reproduce — the probe writes a draft on the prior leg, or the fix does not make one appear —
**STOP and report** rather than adapting.

---

## 0 · Findings this scope records before anything else

**(a) Fixing A-3 re-opens a privacy hole unless the wipe path is fixed in the same change. This is the most
important sentence in this document.** `clearStorage` (L3483) deletes exactly the keys in `STORAGE_KEYS` (L2556,
fourteen of them, listed by hand and read in full). **`MYDATA_DRAFT_KEY` (L11780, `"danger_close:mydata_draft_v1"`) is
not one of them.** The v5.9.1 pre-release leak review found precisely this and installed a draft deletion inside
`performClearAll` — which is call site 7 below, and has never executed. Today that is harmless, because no draft has
ever been written. **The moment A-3 is fixed, drafts become real, and "permanently delete everything" leaves a
complete plan recoverable from the restore banner on a shared machine** — the exact scenario the v5.9.1 review was run
to prevent. A fix that repairs the eight call sites and stops there ships a new privacy defect on top of a closed one.

**(b) The suite has ZERO coverage of the draft feature — measured, including regex literals.** An AST walk over every
`t*.mjs` collecting `Literal` (string **and** regex), `TemplateElement` and `JSXText` nodes finds **no** node matching
`/draft/i`, and **no** node matching `/(remove|get|set)Item/i`. All 48 `/draft/i` hits under `qa/` are inside generated
bundles (`app_*`, `dom_*`, `dom_bundle.cjs`) — that is the app's own text, not an assertion about it. ⚠ The first pass
of this census used a string-only walk and would have missed a regex assertion entirely; the re-run with regex literals
included is the one quoted here (OPERATIONS §B1 — a grep cannot execute a regex, and neither can a walk that ignores
`n.regex`). **`VERIFICATION_REPORT.md`'s v5.9.1 entry states the clear-path fix was "guarded by a new t1 assertion that
the clear handler removes the draft key." No such assertion exists today.** Whether it was dropped in a later rewrite
or never took this form is not established; what is measured is that nothing asserts it now.

**(c) Three functions in the app have never run.** `restoreDraft` (L12149), `discardDraft` (L12156) and the recovery
banner (L12280–12286, including its `RESTORE & APPLY DRAFT` and `DISCARD DRAFT` buttons) are reachable only when
`draftInfo` is set, which happens only when the mount effect reads a draft, which has never succeeded. This is
unexercised code being switched on, not merely repaired — and `restoreDraft` calls `onImport`, which commits and
remounts. It needs tests of its own, not coverage inherited from the write path.

**(d) A-6's mitigation is real but narrow, and this scope does not widen it.** The next Save & Apply regenerates the
prompt from the form, so an imported `masterPrompt` is transient — for a user who saves before asking. A user who
imports a shared backup and asks a question first gets an answer steered by that file's author.

## 1 · Premise, measured

**A-3.** The app's storage API — `src/main.jsx` L19–43, installed when `window.storage` is absent, which is the live
site — exposes **`get`, `set`, `delete`, `list`, all async**, and `get` **throws** when the key is missing (the
artifact contract; `qa/smoke_built.mjs` asserts the throw). The draft code calls **`getItem`, `setItem`,
`removeItem`, all sync**. Every call therefore raises a `TypeError` into an empty `catch`. Eight sites, resolved by
`census.cjs` against v5.70 (v5.69's numbers in the Phase 1 finding are all **+12** from these):

| # | Call | Line | Enclosing | Guarded by `window.storage &&` | In a `try` |
|---|---|---|---|---|---|
| 1 | `removeItem` | L12130 | `handleSave` | yes | yes |
| 2 | `getItem` | L12137 | the on-mount banner effect (L12135) | yes | yes |
| 3 | `setItem` | L12145 | the 2-second debounced autosave (L12144, inside L12142) | yes | yes |
| 4 | `getItem` | L12151 | `restoreDraft` | **no** | yes |
| 5 | `removeItem` | L12152 | `restoreDraft` | **no** | yes (same block) |
| 6 | `removeItem` | L12156 | `discardDraft` | **no** | yes |
| 7 | `removeItem` | L12163 | `performClearAll` | yes | yes |
| 8 | `removeItem` | L12262 | `handleImportFile` (L12253) | yes | yes |

The `&&` guard is not protection: `window.storage` **exists**, so the guard passes and the missing method throws one
step later. All eight are inside `MyDataEditor` (L11782). `MYDATA_DRAFT_KEY` is L11780.

**What the user is told, and where it is false** (AST walk, v5.70):

| Line | Text | Status |
|---|---|---|
| L6304 | *"Discarding keeps the auto-saved draft, so you can still restore this work on your next visit."* | **FALSE, and it is the harmful one** — it appears in the leave dialog, next to the DISCARD & LEAVE button, at the moment the user decides |
| L12289 | *"● Unsaved changes (a draft auto-saves every few seconds)"* | **FALSE** — the dirty chip |
| L12282–12284 | the recovery banner and its two buttons | unreachable (§0 (c)) |
| L3835, L12300, L12304 | *"…auto-saves privately in this browser"*, *"Your plan auto-saves…"* | **TRUE of a saved plan**; not part of the defect. Review for confusion, do not "fix" |

The Field Manual says nothing about drafts, so nothing contradicts the promise anywhere a user could read it.

**A-6.** `applyLoadedData` (L3240) takes `masterPrompt` and at **L3336** does `if (masterPrompt) MASTER_PROMPT =
masterPrompt;` — no type check, no length cap. Both restore paths reach it: `restoreBackup` (L3753) and
`handleImportData` (L13125). `saveToStorage` persists it under `STORAGE_KEYS.prompt`; `loadFromStorage` (L3465)
reloads it on every visit; and the Ask AI system prompt **begins with** `${MASTER_PROMPT}` (L6000). A non-string
value is assigned as-is and later template-interpolated.

**F-3.** `src/index.html` **L21**, inside the first-open disclaimer gate (plain inline script, independent of React):
*"Your inputs stay in **your own browser**. Nothing is uploaded or seen by anyone else."* — unconditional. The Field
Manual qualifies the same claim twice: its intro (*"Nothing is uploaded to any server except the calls you explicitly
send from the Ask AI tab"*) and §10's destination row. The gate is what a first-time user reads; the Field Manual is
what they might read later.

## 2 · Site census (v5.70 — re-resolve at build)

| Area | Sites |
|---|---|
| Draft storage calls | 8 (table in §1) |
| Draft key definition | L11780 |
| `STORAGE_KEYS` map | L2556 (14 keys) |
| Wipe path | `clearStorage` L3483; `handleReload` L13074; `handleClearAllData` L13093; `performClearAll` L12159 |
| Unexercised draft UI | `restoreDraft` L12149, `discardDraft` L12156, banner L12280–12286 |
| Draft copy | L6304, L12289 (+ L3835, L12300, L12304 to review, not change) |
| A-6 | assignment L3336; consumers L631, L6000, L8301, L11815; persistence L3465 (`loadFromStorage`), `saveToStorage` `STORAGE_KEYS.prompt`; entry points L3753, L13125 |
| F-3 | `src/index.html` L21 |
| Suite | **no existing site** — §0 (b) |

## 3 · Tests this ships with

**A new per-leg suite, `t37_mydata_draft.mjs`, running on BOTH legs**, the `t36` shape: the v5.70 leg **pins the
defect** (no draft is ever written; the banner never appears) and the v5.71 leg asserts the fix. A prior leg that
cannot demonstrate the defect means the premise did not reproduce — STOP (§0).

It must assert, at minimum:
1. **Write:** editing a field and waiting past the debounce leaves a draft under `danger_close:mydata_draft_v1`, whose
   payload parses and carries `portfolio` and `expenses`. *(Prior leg: nothing is written.)*
2. **Read:** a draft present at mount surfaces the recovery banner with its timestamp. *(Prior leg: no banner.)*
3. **Restore:** `RESTORE & APPLY DRAFT` commits the drafted values and **deletes the draft** — the first test this
   function has ever had.
4. **Discard:** `DISCARD DRAFT` deletes the draft and dismisses the banner without committing.
5. **Save clears it:** `handleSave` deletes the draft, so a saved plan leaves no recoverable copy.
6. **⚠ The wipe:** after Clear All Data, the draft key is **gone** — §0 (a). This is the extinction invariant of this
   release; it must fail on any build where the wipe path does not cover the draft key.
7. **Import clears it:** `handleImportFile` deletes the draft.
8. **The promise matches reality:** whatever the chip and the leave dialog say about a draft is asserted against the
   state that actually determines whether one exists (D-2/D-3 decide the mechanism; the assertion exists either way).

**`t5_storage.mjs`** gains the draft key if D-1 (a) is taken — its existing loop over `STORAGE_KEYS` then covers the
wipe automatically, which is the reason to prefer (a).

**A-6:** assertions that a non-string `masterPrompt` is rejected and an over-long one is capped, and that the Ask AI
system prompt does not carry the rejected value. Placement decided at build: `t5` if it reads as storage/import, a
`t37` group if it reads as import-path behaviour.

**F-3:** `t1`'s STATIC group already asserts in-app strings; the gate lives in `src/index.html`, which the app suites
do not read, so **`qa/smoke_built.mjs` is the right home** — it reads the built artifact, where the gate is present.
Assert the new wording is in the gate and the old sentence is gone.

**F-1 rides along, suite-only:** `smoke_built.mjs` L67 becomes a read of `#root`, not `body`. Its negative control is
recorded: load the relocated file with scripts **disabled** and require the notice and version checks to **fail** —
today they pass on a page where nothing rendered.

**Negative controls** (`qa/tools/controls_v571_draft.sh`, §B2): C0 unmutated green; one control per property — the
write deleted, the wipe's draft coverage removed, the restore's delete removed, the A-6 type check narrowed, the F-3
wording reverted. **A control that does not fire is the finding, not something to adjust until it does.**

## 4 · Explicitly out of scope

- **A-2** (import clamps: a non-numeric birth year survives; fields added since v5.9.1 are unclamped), **A-4** (a
  malformed backup half-applies silently) and **A-5** (an inherited skin name blanks the app). Same audit, same import
  path, all still open — but each is its own change, and bundling three more would make one release unreviewable.
- **D-B3-1 (b)** — removing `main.jsx`'s rewrite and the dev proxy. Deliberately its own small release.
- The Section C business of whether imported figures are *evaluated* sanely.
- Any change to `METHODOLOGY.md`. Nothing here touches modelling.
- The public note about B-3, which is Steve's and independent of this release.

## 5 · Decisions — ANSWERED 2026-09-12

**All six were approved as recommended.** The recommendation text is left exactly as written so that what was approved
is legible, and the alternatives are kept so a later reader can see what was weighed rather than only what won.


✅ **D-A3-1 · How the wipe covers the draft (§0 (a)) — the one that must not be got wrong.**
- **(a) RECOMMENDED: add the draft key to `STORAGE_KEYS`** and delete the now-redundant call at site 7. `clearStorage`
  then covers it by construction, and `t5`'s existing loop over the key map covers *that* — so the guard comes free and
  a future key cannot drift out of the wipe, which is the failure mode the v5.10.2 comment at `clearStorage` was
  written about. ⚠ At build, verify no other code iterates `STORAGE_KEYS` in a way this changes — in particular that
  the export payload is built explicitly (it is: `{app, version, exportedAt, portfolio, expenses, masterPrompt,
  checklist, skin}`) so a draft can never ride into a backup file.
- **(b)** Keep the key separate and repair site 7. Smaller diff, but it leaves the wipe's correctness resting on one
  hand-written call that has already been wrong once — for five releases, silently.

✅ **D-A3-2 · How loud is a failed draft write?** The whole finding is that an empty `catch` hid a dead feature for
five releases, so "silent" is the thing on trial.
- **(a) RECOMMENDED: the UI stops promising what it has not observed.** A successful write sets a flag; the chip reads
  *"● Unsaved changes (draft saved HH:MM)"* when the flag is set and *"● Unsaved changes"* alone when it is not. No
  error dialog, no new failure mode for the user to interpret — but the app becomes structurally unable to claim a
  draft it does not have, which is exactly what went wrong here and matches the conservative-direction default.
- **(b)** Keep it silent and simply correct the copy to a general promise. Less code; restores the possibility of the
  same class of silence.
- **(c)** Surface a visible warning when a write fails. Loudest, and most likely to alarm a user about something they
  cannot act on.

✅ **D-A3-3 · The leave dialog (L6304).** With (a) above, the sentence can be conditional on the flag. Without it, it
must be unconditional and weaker.
- **(a) RECOMMENDED, pairs with D-A3-2 (a):** *"Discarding keeps the auto-saved draft, so you can still restore this
  work on your next visit."* shown only when a draft is confirmed saved; otherwise *"Discarding loses these edits."*
- **(b)** One unconditional sentence that promises nothing: *"Discarding loses these edits unless a draft was saved."*
  Honest, and vaguer than a user deciding in that moment deserves.

✅ **D-A3-4 · A-6's guard.** Recommendation: reject a non-string, and cap the length.
- **(a) RECOMMENDED:** accept only a string, cap at **20,000 characters** (roughly 5,000 tokens — comfortably above
  any real customisation, far below a payload that would dominate a context window), truncate rather than reject so a
  legitimate long prompt is not silently lost, and note the cap in the Field Manual's §10 table. **APPROVED 2026-09-12 at 20,000.** ⚠ Recorded
  plainly: that number is a judgement, not a measurement. No real user's prompt length was sampled, and it is a round
  figure reasoned from token arithmetic alone. It is cheap to change — one constant and one test — and it should be
  revised the moment anyone has a real distribution to point at. Do not let a later reader mistake it for a derived
  value.
- **(b)** Do not import `masterPrompt` from a backup at all; always regenerate. Closes the finding completely and
  loses the user's own customisation on restore of their own file.
- **(c)** Disclose only. Cheapest; leaves a shared file steering the assistant.

✅ **D-A3-5 · The F-3 wording.** Yours; the gate is the first thing a user reads and the sentence should survive
scrutiny.
- **(a) RECOMMENDED:** *"Your inputs stay in **your own browser** — nothing is uploaded, except what you deliberately
  send from the Ask AI tab."* One clause added; matches the Field Manual's intro almost word for word.
- **(b)** *"Your inputs stay in **your own browser**. Nothing is uploaded or seen by anyone else unless you use Ask
  AI."* Shorter, slightly weaker on what "use" means.
- **(c)** Leave it and rely on the Field Manual. Not recommended: the gate is read by everyone, §10 by few, and the
  gate's sentence is the one that is wrong.

✅ **D-A3-6 · Release shape.** *Recommendation: one release, v5.71.* A-3, A-6 and F-3 all change user-facing behaviour or
copy and all need one version bump and one rebuild between them; splitting costs three ship cycles for one diff. If
you would rather see A-3 alone, say so and A-6 and F-3 move to v5.72 — the scope is written so either works.

### Decisions as taken (2026-09-12)

| | Decision | Taken |
|---|---|---|
| D-A3-1 | how the wipe covers the draft | **(a)** the draft key joins `STORAGE_KEYS`; site 7's hand-written call is deleted as redundant |
| D-A3-2 | how loud a failed draft write is | **(a)** a flag set on a successful write drives the chip |
| D-A3-3 | the leave dialog's sentence | **(a)** conditional on that same flag |
| D-A3-4 | A-6's guard | **(a)** string-only, truncate at **20,000 characters** — ⚠ a judgement, not a measurement |
| D-A3-5 | the first-open gate wording | **(a)** *"Your inputs stay in **your own browser** — nothing is uploaded, except what you deliberately send from the Ask AI tab."* |
| D-A3-6 | release shape | **one release, v5.71** |

## 6 · Status and what happens next

**Buildable.** All six decisions were answered on 2026-09-12, the day the scope was written. The build order is: re-measure §1 and §2 against whatever is current → write `t37` and
watch it **fail on the v5.70 leg in the right way** → fix the eight sites and the wipe path → A-6 → F-3 → the four
version sites → `vercensus.cjs`, **plus `t33`'s `PINS` entry by hand** (identifier-keyed; invisible to `vercensus`,
and missed at both v5.66 and v5.70 — OPERATIONS §I) → full suite → rebuild and `smoke_built` → package per §L.

⚠ **Expect the prior leg to be noisy.** `t37` runs against a v5.70 leg in which the feature is dead, so most of its
assertions are gated to the current leg and the prior leg's job is to pin the defect. Gate per leg, never soften.
