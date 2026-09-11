# FlawsToFix — Standing Code Audit, Phase 1 re-run (Sections A + B) at v5.69 · the import and storage path

| Field | Value |
|---|---|
| Build under audit | **v5.69** · `src/DangerClose.jsx` md5 `76a35ba283ed5153ff257106e7ccfc10` · 13,164 lines (`wc -l`) |
| Built `index.html` | `86703918db247e3284752f0f1cc1f6d5` |
| Bootstrap | `src/main.jsx` md5 `d9eca7b469a3fb7ec1c5325fd4bf8145` |
| Repo commit | `fffa6d6` ("v5.69") |
| Prior build (second leg) | v5.68 · `561fc39b5bdae7c6d83698f352c436b3` (pool copy) |
| Date | 2026-09-11 (two sittings, one conversation) |
| Governing document | `SCOPE_STANDING_AUDIT.md` §§A, B and its standing methodology requirements |
| Previous Phase 1 | `FlawsToFix-v5_10_1-Phase1.md` (v5.10.1, 2026-08-07) — annotated, not rewritten |
| Kind | Audit — **findings only. No source change, no fix, no version bump.** |

Every count, hash, line number and runtime result below was printed by a command in this audit's
session (OPERATIONS §A0). Line numbers are v5.69 addresses and **will drift**: re-resolve with
`qa/tools/funcmap.cjs` / `census.cjs` before acting on one. Where a line was counted from a printed range
rather than printed by a parser, it says so.

---

## Summary

**Two MEDIUM findings, both undisclosed, both confirmed at runtime with a positive control; three LOW
findings; A-2 still open.** Nothing found gives a remote party control of anything, and the
two highest-stakes vectors Phase 1 cleared at v5.10.1 — the API key's destination and household data
riding in URLs — still hold.

| ID | Severity | Exposure | Status | One line |
|---|---|---|---|---|
| **A-3** | **MEDIUM** | user-side (creator: reputational) | CONFIRMED, runtime + positive control; undisclosed | The My Data draft autosave has **never saved anything**; the app promises it does, and the leave dialog tells users discarding is safe because of it |
| **B-3** | **MEDIUM** | user-side PII; creator's hosting origin receives it | CONFIRMED in the harness + positive control; undisclosed | On a self-hosted copy with no saved API key, **Ask AI POSTs the full plan context to the page's own host** (`https://stextor.github.io/anthropic/v1/messages` on the live site) |
| A-4 | LOW | user-side | CONFIRMED, runtime | A malformed backup imported from **My Data** fails **silently** — the plan is half-replaced in memory, nothing is saved, nothing is said |
| A-5 | LOW | user-side | CONFIRMED, runtime | A backup whose `skin` is an inherited object name (`"constructor"`) passes the skin check and **blanks the whole app** until reload |
| A-6 | LOW | user-side | CONFIRMED (persistence) + source-traced (use) | An imported backup's `masterPrompt` is persisted and becomes the **head of every Ask AI system prompt** |
| A-2 | LOW | user-side | **STILL OPEN** — now reproduced | No integrity validation on imported backups; no row-count bound (20,000 holdings exhausted the harness heap on both import paths) |
| A-1 | LOW | user-side, by design | HOLDS; premise **confirmed at runtime** | A backup cannot plant a local-model URL |
| B-1 | INFO | disclosed | not re-verified | — |
| B-2 | (MEDIUM, fixed v5.10.2) | — | **HOLDS FIXED** | 13 keys, 13 deletes |

A separate **process finding** from the freshness check (not an app defect): the knowledge pool's
`PROJECT_KNOWLEDGE_INDEX.md` was the **v5.68** manifest — see *Freshness check*.

---

## Freshness check (OPERATIONS §A, §A2)

- Clone `fffa6d6`: `src/DangerClose.jsx` == pool `DangerClose-v5_69.jsx` (`76a35ba2…`); built `index.html` `86703918…`;
  `src/main.jsx` == pool `main.jsx` (`d9eca7b4…`); `CHANGELOG.md` identical on both sides, newest entry v5.69.
- Pool: **128 files, no duplicate names.** Matched **pool → repo by content: 126 identical**, 2 differ:
  - `DangerClose-v5_68.jsx` — expected: the prior leg is pool-only by design.
  - **`PROJECT_KNOWLEDGE_INDEX.md` — STALE.** Pool copy `8adf0676b503febf4cab13195b33e92f` names **v5.68** in its
    Current-build table and has **0** lines mentioning v5.69; the repo copy `21a63bf7252c4bd83eb47982c135d951` has 45;
    142 lines differ. The v5.69 manifest never reached the pool. Source, suites, OPERATIONS.md and CHANGELOG all
    matched, so this audit worked from the clone — but a session anchoring on the pool manifest would have taken
    v5.68 as current, which is §G's "worst possible document to have a stale twin of." **This package ships the
    manifest, which replaces the pool copy.**
- **Not done:** the reverse direction (repo files the manifest says belong in the pool).
- Tools trusted: `t21` **50 passed, 0 failed** in the run folder (§B1 — a parser result is a finding only while `t21` is green).
- Run folder: `qa/mk_runfolder.sh v568 v569 <pool v5.68 source> /tmp/run`, exit 0.

---

## Method — what was run, and the controls that make it mean something

| Instrument | Answers | Control |
|---|---|---|
| `qa/tools/census.cjs`, `funcmap.cjs` | site counts and function ranges | `t21` 50/0 |
| **`qa/tools/census_p1.cjs`** (new) | the widened surface census (storage, network, sinks, iframe, download/blob, clipboard, URL, JSX attributes, `JSON.parse`, merges). Walks **every** node key, so it cannot inherit `acorn-walk`'s `walk.full` blind spot on non-computed properties — the blind spot that hid the draft's `setItem` | self-check 4/4 against known sites; 129,532 AST nodes |
| **`qa/tools/lits_p1.cjs`** (new) | Field Manual *value* search; app copy; every suite string and regex literal, **with every regex executed** against the draft copy (§B1a); which files read CHANGELOG / the manifest | self-check against a known `t4` literal; 152 files, **0 parse failures** |
| **`qa/tools/probe_mydata_draft.mjs`** (new) | A-3 at runtime | positive control: a scratch shim with sync methods — **fired** |
| **`qa/tools/probe_import_hostile.mjs`** (new) | A-2, A-4, A-5, A-6 and PF3/A-1 premises through **both real import paths** | positive control: a valid backup must import — it **caught a harness trap on its first run** (below) and then **fired** on both paths |
| **`qa/tools/probe_ai_route.mjs`** (new) | B-3 at runtime, with `src/main.jsx` L52–69 transcribed verbatim over a recording stub | positive control: a saved key must reach `api.anthropic.com` with `x-api-key` — **did not fire twice** (probe errors, below), then **fired** |
| Blobless clone of history (830 commits) | how long A-3 has existed | — |

**Harness traps found by the controls — recorded because the next session will hit them:**

1. **`FileReader` is not a global in the DOM harness.** The CJS bundle runs in Node scope, so the app's bare
   `FileReader` resolves to Node's global, which does not exist: `handleImportFile` dies with `ReferenceError` and a
   **valid** backup "fails". The import probe's positive control failed on its first run for exactly this reason.
   `env_dom.mjs` defines no `FileReader`, and `census.cjs` finds `FileReader` in **no** suite file — so **no suite
   drives the My Data import handler through a file, or can while green.**
2. **`location` is not a global in the DOM harness either**, so `IS_CLAUDE_ARTIFACT` (L2578) **fails closed to
   `true`** and the harness runs the claude.ai branch. The live site runs the other branch. `probe_ai_route.mjs`
   reconfigures the page URL and exposes `location`; whether any individual suite does the same was **not censused**.
3. **The DOM bundle is CommonJS (sloppy mode); the shipped build is an ES module (strict).** A write to a property
   of a primitive is silently ignored in the harness and throws in the browser, so the *first* throw inside
   `applyLoadedData` can come earlier in the real app than in the probe. The outcome class reported in A-4 —
   a throw before `saveToStorage` — is the same either way.
4. **The first `button.ai-btn` on Ask AI is "📎 ATTACH FILE"**, not Send ("▶ EXECUTE"); and a query typed before the
   tab settles never reaches React state. Both made `probe_ai_route.mjs` blind until its key-mode control fired.

---

## Re-verification of every v5.10.1 finding and positive finding, at v5.69

| v5.10.1 item | At v5.69 | Evidence |
|---|---|---|
| **A-1** Local model endpoint receives household context (LOW, by design) | **HOLDS as described.** Its decisive premise — *an imported backup cannot plant the URL* — is now **confirmed at runtime**: a backup carrying `localLLM`, `apikey`, `offline` and the literal storage-key names at top level and inside `portfolio` left `api_key_v1`, `local_llm_v1` and `offline_v1` **absent** on **both** import paths. `STORAGE_KEYS.localLLM` is written only by `saveLocalLLM` (L5573–5579); no host restriction at L6031. The smuggled fields persist inside `portfolio_v1` as inert data (`census.cjs localLLM`: every read is React state or the storage key) | probe `key-smuggle` ×2; census |
| **A-2** No integrity validation on imported backups (LOW) | **STILL OPEN**, and now **reproduced** — see the A-2 section, A-4 and A-5. The v5.9.1 clamps exist and held | `applyLoadedData` (L3240–3450) read in full; probes |
| **B-1** Plaintext browser storage (INFO, disclosed) | **Not re-verified** — the Field Manual §10/§11 text was not re-read | — |
| **B-2** Clear All Data left three keys (MEDIUM) | **HOLDS FIXED.** `STORAGE_KEYS` (L2556) has 13 keys; `clearStorage` (L3483–3505) makes 13 `.storage.delete` calls, one per key (read). ⚠ The draft key is **outside** `STORAGE_KEYS` and is deleted by `performClearAll` through the broken sync call (L12151) — harmless today **only because no draft is ever written** (A-3) | read; `census_p1` |
| **PF1** The API key has one destination, a literal | **HOLDS.** Literal at the send site (L6046). Runtime: with a saved key the request resolved to `https://api.anthropic.com/v1/messages` with `x-api-key`, and `main.jsx`'s wrapper passes keyed requests through. ⚠ The **keyless** request is redirected — **B-3** | `probe_ai_route.mjs key` |
| **PF2** The artifact/self-hosted split is enforced at the header level | **HOLDS.** Headers are `(!IS_CLAUDE_ARTIFACT && localApiKey) ? {…x-api-key…} : {Content-Type}`; the key load effect and `saveApiKey` return early inside the artifact; `IS_CLAUDE_ARTIFACT` fails closed (L2578–2584) | read |
| **PF3** The key is excluded from backups by construction | **Import side CONFIRMED at runtime** (above). **Export side not re-read this session**; `t5` Phase B asserts it (assertion text read; `t5` not run) | probe; `t5` source |
| **PF4** No URL-parameter surface | **HOLDS.** The only `location` reads are `protocol` and `hostname` inside `IS_CLAUDE_ARTIFACT` (L2580–2582); zero `URLSearchParams`, `pushState`, `replaceState`, `.hash`, `.search`, `window.open`, `postMessage` | `census_p1` |
| **PF5** The AI request is bounded on every axis | **HOLDS**: `max_tokens: 1000` on both routes; history `.slice(-12)`; 5 MB per file checked **before** reading; text capped at 100,000 characters; attachments `.slice(0, 8)`; 45,000 ms abort; offline mode returns before any fetch. Two nuances, neither a finding: the 8-file cap is applied **after** every selected file is read (`Promise.all` over the whole selection) — a self-inflicted memory cost only; and `MASTER_PROMPT` is unbounded and sent whole on every request (see A-6) | read (`handleAiFiles` L5937–5964 region, `askAI` L6003) |

---

## FINDING A-3 — The My Data draft autosave never saves (MEDIUM · user-side · CONFIRMED · undisclosed)

**What.** v5.9.1 shipped an unsaved-edits guard in four layers and called the fourth — *a draft auto-saves every
few seconds to separate storage, restorable on the next visit* — the real fix for silently lost My Data edits. The
draft code calls **`window.storage.getItem`, `setItem` and `removeItem`**. The storage the app actually runs on
exposes **only** async `get`, `set`, `delete` and `list`. Every draft call sits in an empty `catch`, so each call
throws a swallowed `TypeError`: **no draft is ever written, the recovery banner can never appear, and nothing
reports it.**

**Where (v5.69).** Eight calls, all inside `MyDataEditor` (L11770–12996), resolved by `census.cjs`:

| Call | Line | Enclosing function |
|---|---|---|
| `removeItem` | L12118 | `handleSave` (L12117) — *missed by the session brief's table* |
| `getItem` | L12125 | the on-mount banner effect (L12123) |
| `setItem` | L12133 | the 2-second debounced autosave (L12132, inside L12130) |
| `getItem` + `removeItem` | L12139, L12140 | `restoreDraft` (L12137) |
| `removeItem` | L12144 | `discardDraft` |
| `removeItem` | L12151 | `performClearAll` (L12147) — the v5.9.1 leak-review fix |
| `removeItem` | L12250 | `handleImportFile` (L12241–12259) |

The key is `MYDATA_DRAFT_KEY = "danger_close:mydata_draft_v1"` (L11768). The storage contract is `src/main.jsx`
L15–43 (installed when no `window.storage` exists — the live site).

**What the user is told** (`lits_p1.cjs`): the dirty chip, L12277 — *"● Unsaved changes (a draft auto-saves every
few seconds)"*; the leave dialog, L6292 — *"Discarding keeps the auto-saved draft, so you can still restore this
work on your next visit."*; and the recovery banner's RESTORE & APPLY DRAFT / DISCARD DRAFT buttons (L12271, L12272),
which are unreachable. **L6292 is the harmful sentence**: it tells a user that choosing DISCARD & LEAVE is safe.
The Field Manual says nothing about drafts (0 matches in the `DOCS_HTML` value, 149,299 UTF-16 units), so the
promise is not contradicted anywhere a user could read. Related copy a fix should review, not itself a finding:
L3835, L12288 and L12292 say the plan "auto-saves", which is true of a *saved* plan only.

**Runtime reproduction** (`probe_mydata_draft.mjs`, run folder, real storage contract):

| | v5.69 `contract` | v5.69 **positive control** (scratch shim + sync methods) |
|---|---|---|
| Edit "Spouse A" → "Spouse A1"; chip shows its auto-save promise | yes | yes |
| Draft key present after a 2,600 ms real-timer wait | **no** | yes — parses, carries `ts`, `portfolio`, `expenses` and the edited value |
| Leave dialog shows "Discarding keeps the auto-saved draft"; DISCARD & LEAVE | yes | yes — draft survives |
| Next visit (unmount, remount, open My Data): recovery banner | **no** | yes |
| Field on the next visit | **"Spouse A" — the edit is gone** | "Spouse A"; RESTORE & APPLY DRAFT → **"Spouse A1"**, draft removed, banner gone |

The `traced` mode (a read-only Proxy over the same contract) recorded the app looking up `setItem` during the wait,
and over the run `getItem`, `removeItem` and `setItem` — all absent. **The v5.68 leg gives identical results in both
modes.** The control proves two things: the harness can see a draft when one exists, and the rest of the v5.9.1
design works — only the API mismatch breaks it.

**How long.** `src/main.jsx` has **one** commit in the repository's history (`f8e21ce`, "Initial commit",
2026-08-01), and that blob's md5 equals today's file. The v5.9.1 commit `3ed819c` (2026-08-05) already contains the
same 2 `getItem` / 1 `setItem` / 5 `removeItem` calls (`census.cjs` on the source read out of that commit). **So in
the self-hosted build the draft has never worked, from the release that introduced it to this one.** That span is
source-traced; the runtime reproduction covers v5.68 and v5.69.

**claude.ai's native storage — not primary-sourced.** Anthropic's help-center article on artifacts describes
persistent storage (published artifacts only, text-only, personal or shared, 20 MB) but does not list method names.
The async `get`/`set`/`delete`/`list` shape is corroborated by third-party guides and by the artifact-authoring
guidance supplied to Claude in claude.ai sessions, not by a public primary reference. **The finding does not depend
on it**: the live site runs `main.jsx`'s shim.

**Suspected cause.** The draft was written against the Web Storage API (`localStorage`'s sync method names) while
the app's persistence layer is the artifact-shaped async API; the empty `catch` blocks converted the resulting
`TypeError` into silence; and no test ever read storage for a draft.

**Why no test caught it.** `t4`'s "Unsaved-edits leave guard" block asserts the chip text, the dialog and DISCARD &
LEAVE, and never reads storage or remounts. The `t5`/`t6` shims expose only the four async methods. `lits_p1.cjs`:
**zero** string literals and **zero** regex sources in `qa/` or `validation/` name the draft or the sync methods.
`VERIFICATION_REPORT.md`'s v5.9.1 leak review describes *"a new t1 assertion that the clear handler removes the
draft key"*; **no such assertion exists at v5.69**, and whether it ever did was not established.

**What any fix must respect** (constraints, not a design):
- **All eight calls move together, and Clear All Data is proven at runtime.** `performClearAll` deletes the draft
  through the same broken call (L12151). A fix that repairs the *write* alone would bring back the exact leak the
  v5.9.1 review caught: a "permanently deleted" plan offered back by the restore banner on a shared machine.
- The real API is **async**, and `get` **throws** on a missing key.
- **Never add sync methods to the `t5`/`t6` shims or to `main.jsx`** to make the draft work in tests — that masks the
  defect (the probe's control shim exists only inside the probe).
- Drafts must stay out of backups, and still die on Save, import and Clear All Data.
- L6292 and L12277 are false today. `lits_p1.cjs` found **no suite matcher that locks them** — the only two regexes
  that match the draft copy do so incidentally (`t4` L799 `/SAVE\s*&\s*APPLY/i`, `validation/smoke_entry.jsx` L54).

**Severity: MEDIUM (proposed).** Silent loss of user work behind an explicit, false in-app promise, live since
v5.9.1. Bounded: it loses *unsaved* edits only, and the other guard layers still work (the chip and the leave dialog
were observed at runtime; the `beforeunload` prompt was not tested). **User-side; creator-side exposure is
reputational.** **Undisclosed.**

---

## FINDING B-3 — Keyless Ask AI on a self-hosted copy sends the plan to the page's own host (MEDIUM · user-side PII · CONFIRMED in harness · undisclosed)

> **⚠ FIXED at v5.70 (2026-09-11)** — `docs/SCOPE_B3_KEYLESS_AI_ROUTE.md`, retired with its build record. *Annotation only;
> the finding below is as written at v5.69.*

**What.** Outside claude.ai with no saved API key and no local model, Ask AI's ▶ EXECUTE button is **enabled**, and
pressing it sends the Anthropic request **with no key header**. `src/main.jsx` (L52–69) rewrites any
`https://api.anthropic.com` request that lacks `x-api-key` to the same-origin path `/anthropic`. That rewrite exists
for the Vite dev server, whose proxy forwards `/anthropic` to Anthropic (`vite.config.js` L19–23) — but it is
compiled into the production build and active on any http(s) origin. **On the live site the request goes to
`https://stextor.github.io/anthropic/v1/messages`, carrying the full AI context.**

**Runtime** (`probe_ai_route.mjs`; page reconfigured to `https://stextor.github.io/danger-close/`; `main.jsx` L52–69
transcribed verbatim over a recording stub that answers 405; **nothing was sent to any network**):

| | `key` (positive control) | `nokey` (the live site's default) |
|---|---|---|
| Requested | `https://api.anthropic.com/v1/messages` | `/anthropic/v1/messages` |
| Resolved | `https://api.anthropic.com/v1/messages` | **`https://stextor.github.io/anthropic/v1/messages`** |
| Headers | `Content-Type`, `x-api-key`, `anthropic-version`, `anthropic-dangerous-direct-browser-access` | `Content-Type` only |
| Body | 16,530 characters; carries the household name and the system prompt | **the same 16,530 characters** |
| User sees | the stub's 405 as `⚠ SYSTEM ERROR [405]` | the same |

The system prompt is `MASTER_PROMPT` followed by the plan context — names, balances, income, Social Security and
simulation results — and any attached images, PDFs or text files ride in the same body.

**What the user is told.** The panel reads *"🔑 LOCAL API KEY — REQUIRED TO USE ASK AI IN THIS SELF-HOSTED COPY"* and
*"This copy runs outside claude.ai, so Ask AI needs your own Anthropic API key…"*; with a key saved it reads *"sent
only to api.anthropic.com"*. Nothing says that pressing EXECUTE **without** a key transmits the plan to the site's
host. `main.jsx`'s own comment expects the call simply to fail on a static host ("so Ask AI requires a user key").
It does fail — after the body has been sent.

**Where.** `askAI` (L6003): `_useLocal` (L6027), the Anthropic `fetch` (L6046) and its headers ternary immediately
after; the EXECUTE button (L11687), whose `disabled` condition does not consider the key; `src/main.jsx` L52–69.

**Not established.** What GitHub Pages does with a POST body to that path (status, logging, retention) — deliberately
not tested, since the test would itself be the leak, and `github.io` is outside this environment's network allowlist.
Behaviour in a real browser, rather than jsdom with the wrapper transcribed. Forks hosted elsewhere send to whoever
operates *that* origin, which may log bodies.

**Suspected cause.** A dev-server convenience (the `/anthropic` proxy rewrite) shipped in the production bootstrap,
and `askAI` has no guard for "self-hosted, no key, no local model".

**Severity: MEDIUM (proposed).** Household PII leaves the device to an undisclosed destination on a single, likely
click by a first-time visitor on the live site. The recipient is the site's hosting provider rather than an
attacker, and TLS protects it in transit. **User-side; the creator's hosting origin is the recipient.**
**Undisclosed.**

---

## FINDING A-4 — A malformed backup imported from My Data fails silently, half-applied (LOW · user-side · CONFIRMED)

**What.** `handleImportFile` (L12241) calls `onImport(…)` inside a synchronous `try`; `onImport` is
`handleImportData` (L13112), which is **`async`**. When `applyLoadedData` throws, the throw becomes a **rejected
promise nobody observes**: the `catch` that shows *"Couldn't read that file…"* never runs, `saveToStorage` never
runs, and the remount and notice never happen. And `applyLoadedData` replaces the module-level plan **before** it
validates anything (its first statement, L3241, `if (portfolio) PORTFOLIO = portfolio;`), so the session is left
running on a half-applied plan.

**Runtime** (`probe_import_hostile.mjs`, My Data path, after the example plan is saved):

| Backup | Thrown (unobserved) | Message shown | In memory after | Stored plan | Next visit |
|---|---|---|---|---|---|
| `portfolio: "x"` | `…reading 'ssA'` | **none** | the string `"x"` | prior plan, intact | recovers |
| `positions: [null]` | `…reading 'owner'` | **none** | the hostile object | intact | recovers |
| `otherAccounts: [null]` | `…reading 'taxType'` | **none** | the hostile object | intact | recovers |
| `expenses: [null, "x", …]` | `…reading 'freq'` | **none** | the hostile object | intact | recovers |

**The landing-screen path handles the same files better, not well**: `restoreBackup` (L3746–3760) awaits the apply
inside its own `try`, so it shows *"Restore failed — Cannot read properties of …"* — a raw engine error — and it
too leaves the in-memory plan replaced until the page reloads.

**Suspected cause.** A sync `try` around an async handler, and replace-then-validate ordering in `applyLoadedData`.

**Severity: LOW.** No persistent damage was observed and a reload recovers, but on the My Data path the user is told
nothing, and until they reload, tabs compute from a plan they never saw. User-side.

---

## FINDING A-5 — An inherited skin name blanks the entire app (LOW · user-side · CONFIRMED)

**What.** Both restore handlers accept an imported skin when `SKINS[name]` is truthy — `handleImportData`
(`if (importedSkin && SKINS[importedSkin])`, L13118) and `handleLoaded` (L13098) (both lines counted from a printed
range). A name inherited from `Object.prototype` passes. With `"skin": "constructor"`, `skinVars` throws (*"Cannot
read properties of undefined (reading 'bg')"*), and because the app has **no error boundary** (`census.cjs`: 0
`getDerivedStateFromError`, 0 `componentDidCatch`) the whole tree unmounts: **0 tabs, empty page**, on **both**
import paths. The imported plan was already saved; the skin was not persisted (`skin_v1` absent); a reload recovers.

**Not tested:** other inherited names (`toString`, `valueOf`, `hasOwnProperty`, `__proto__`, …) — expected to behave
the same, not run.

**Suspected cause.** A truthiness lookup on a plain object literal instead of an own-property check.

**Severity: LOW.** Needs a doctored file; session-only; no data loss. User-side.

---

## FINDING A-6 — An imported `masterPrompt` persists and heads every Ask AI system prompt (LOW · user-side · CONFIRMED persistence, use source-traced)

**What.** Both restore handlers pass the backup's `masterPrompt` to `applyLoadedData`, which installs it as
`MASTER_PROMPT` with no type or length check; `saveToStorage` writes it (`STORAGE_KEYS.prompt`, L3478); every visit
reloads it (`loadFromStorage`, L3459); and `aiSystemPrompt` **begins with `${MASTER_PROMPT}`**. Runtime: after
importing a backup whose `masterPrompt` carries a marker instruction, `master_prompt_v1` holds it.

**Mitigation (source-traced, not run).** The next Save & Apply regenerates the prompt from the form
(`handleSave` → `genAIContext()` → `handleApplyData`), overwriting it. A user who imports someone else's backup and
asks the AI a question before saving gets an answer steered by that file's author.

**Severity: LOW.** The model has no tools here and its answer is rendered as text; the realistic harm is misleading
guidance from a shared file, plus an unbounded prompt sent whole on every request to the user's own key. User-side.

---

## A-2 re-verified at v5.69 — still open, now reproduced

`applyLoadedData` (L3240–3450) was read in full; `inferOtherTaxType` (L3227–3238); both handlers; `loadFromStorage`,
`saveToStorage`, `clearStorage`. The only checks are the handlers' `data && data.portfolio`, the v5.9.1 clamps, and
schema defaults.

- **The v5.9.1 clamps exist and held** (block near the top of `applyLoadedData`, ≈L3258–3264, counted): retire year to
  [1950, this year + 60], else deleted; life expectancies to [50, 120], else deleted; birth year to [1900, this year] —
  **but a non-numeric birth year is left in place** (no `else`). Runtime: `retireYear 99999`, `lifeExpA 1e9`,
  `lifeExpB −5`, `dobA.year "abc"` imported with no error and no hang.
- **Fields added since v5.9.1 are not clamped**, and the ones probed did not hang: income-stream years of ±1e9 and
  a Social Security claim age of 1e9 imported with no error and no hang. Their figures were not evaluated
  (Section C's business).
- **No row-count bound.** A backup with **20,000 holdings** (2,726,324 characters) **exhausted the harness's Node
  heap** — `FATAL ERROR … JavaScript heap out of memory`, exit 134 — after 98 s on the My Data path and 108 s on the
  landing path. On the landing path the imported file **was already in storage** and the app shell had rendered
  before the abort, so a browser that stalls on such a plan would load it again on every visit. **This is a jsdom
  measurement, not a browser one**: it establishes that nothing bounds the row count, not that a real tab crashes.
- **`__proto__` keys pollute nothing.** `__proto__` at the backup's top level, inside `portfolio`, `bucketActuals`,
  `contributions` and a holding: `({}).polluted` and the jsdom realm's `Object.prototype.polluted` stayed
  `undefined` on both paths. `JSON.parse` makes such keys own data properties, the file uses object spread (which
  copies them as data) and `census.cjs` finds **0** `Object.assign`.
- **An imported checklist is replaced wholesale and persisted with no shape check** (`typeof === "object"` only):
  object-valued `done`/`notes`/`contact` were stored. Rendering with a **real** item id was **inconclusive** — the
  probe's id discovery found none, so the payload used a non-existent id.

---

## T3 — the widened surface census (`census_p1.cjs` at v5.69)

The census that preceded this audit matched storage calls by the method names `get`/`set`/`delete`/`list` and missed
`getItem`/`setItem`/`removeItem` entirely. Widened once:

| Question | v5.69 |
|---|---|
| Sync Web Storage method names on `window.storage` | **8** — all A-3 |
| Async `window.storage` contract calls | 41, across `loadFromStorage`, `saveToStorage`, `clearStorage`, `GuidedWizard`, `DangerCloseMain` and `DangerClose` |
| `localStorage` / `sessionStorage` / `indexedDB` / `caches` / `cookie` in the app | **0** (the only `localStorage` use is `main.jsx`'s shim) |
| Network primitives | **2** `fetch` (L6034 local model, L6046 Anthropic); 0 `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `Worker`; 0 dynamic `import()`. ⚠ `main.jsx` wraps `window.fetch` — B-3 |
| `createElement` of script/link/img/iframe/form | 0; `createElement("a")` ×2 — download anchors (L6660, L12232) |
| HTML/code sinks | **0** `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`, `eval`, `Function`; 0 string-bodied timers. The single `.write` is the File System Access stream in `handleExport` (L12199) |
| iframes | **1** (L6668): `srcDoc={DOCS_HTML.replace("</body>", DOCS_NAV_SCRIPT + "</body>")}` (L6670) — both module constants (L3844, L3847), no user data. No `sandbox` attribute (hardening note only) |
| Download / file APIs | `Blob` L6658, L12183; `createObjectURL` L6659, L12231; `showSaveFilePicker` L12192, L12194; `FileReader` L5943 (Ask AI attachments) and L12245 (import); the landing restore uses `File.text()` |
| Clipboard | **0** |
| URL / navigation | `location` ×3, all inside `IS_CLAUDE_ARTIFACT` (L2580–2582) |
| JSX `href` / `src` / `target` / `action` attributes | **0** |
| `JSON.parse` | **9**: L3461, L3462, L3751, L5565, L5679, L12126, L12139, L12248, L13042 |
| `console.*` | **1** (L3468) |
| `Object.assign` | **0**; object spreads 61 |

**Corrections to the session brief, all by parser:** eight sync draft calls, not seven; **two** backup import paths
(`DataLoader.restoreBackup` L3746 as well as `handleImportFile` L12241), not one; `applyLoadedData` has **eight**
callers.

---

## Section E notes — recorded for the next Phase 3 pass, not findings here

- **No error boundary** anywhere in the app: any render-time throw blanks the page (A-5 is one instance).
- **No suite drives either import handler through a real file**, and the shared jsdom environment defines neither
  `FileReader` nor `location` — so the DOM suites also exercise the claude.ai branch, not the live site's.
- `t5` Phase E tests restore behaviour by calling `applyLoadedData` directly, bypassing both handlers.
- **The suite's own harness dependencies are not pinned in the committed tree.** `jsdom`, `acorn`, `acorn-jsx`,
  `acorn-walk` and the `esbuild` that bundles the DOM legs are absent from `package.json`, so `qa/mk_runfolder.sh`'s single
  `npm install` resolves them on the day and **saves** them into the run folder: on 2026-09-11 that added `jsdom ^30.0.1`
  and `esbuild ^0.28.2` (the committed lock carries `esbuild` 0.21.5), moved `mammoth` `^1.8.0` → `^1.12.2`, and changed
  1,360 lockfile lines. Two sessions can therefore run the suite on different jsdom versions, and `package_check` `G-1`
  reports both files for any package verified in such a folder (it did for this one; the two setup files were restored
  from the clone before the re-run, and neither ships). OPERATIONS §B's warning that a second `--no-save` install pruned
  `jsdom` means the remedy needs a scope, not a flag.
  ⚠ **Annotated 2026-09-11 (`SCOPE_B3_KEYLESS_AI_ROUTE.md` F-8).** OPERATIONS §N3a records `jsdom`'s absence from
  `package.json` as **deliberate** — it is installed `--no-save` in the build folder. The description above of what
  `qa/mk_runfolder.sh` does to a run folder stands; this note should have cited §N3a.

---

## Scope and honesty statement

**Examined directly:** the freshness check (pool → repo); `applyLoadedData`, `inferOtherTaxType`, `handleImportFile`,
`restoreBackup`, `handleImportData`, `handleLoaded`, `loadFromStorage`, `saveToStorage`, `clearStorage`,
`STORAGE_KEYS`; the draft code and its copy; the Ask AI send path, attachment reader and key effects; `src/main.jsx`;
`vite.config.js`'s proxy lines; the widened census above; the Field Manual's text value; every suite literal and regex;
fourteen backup shapes on the My Data path and seven on the landing path; both Ask AI routes; `main.jsx`'s and the
v5.9.1 source's history.

**Not examined, and therefore not cleared:**
- `GuidedWizard`'s save path (L3536–3573, L3766–3771), `startFresh`, and `applyAndContinue`'s file-status branches.
- The export payload (PF3's export side); B-1's Field Manual §10/§11 wording.
- Checklist rendering with a real item id; inherited skin names other than `"constructor"`.
- Anything in a real browser — the 20,000-row case and B-3 in particular; GitHub Pages' handling of the keyless POST.
- claude.ai's native storage method list from a primary source.
- The reverse direction of §A2; whether any individual suite sets a `location` global; the history of the `t1`
  draft assertion `VERIFICATION_REPORT.md` describes.
- **The full regression suite was not run** in this audit. It changes no app, suite or harness file.

**Errors made in this audit, owned:**
- The import probe's first positive-control run **failed from a harness trap** (bare `FileReader`); caught by the
  control, fixed in the probe, re-run green.
- `probe_ai_route.mjs` was **blind twice** — it clicked ATTACH FILE instead of EXECUTE, then typed before the tab
  settled — caught because its key-mode control did not fire; fixed without touching the expectation.
- The first version of `census_p1.cjs` counted React `.key` properties as Web Storage calls (16 of 24 hits) and
  reported 13,165 lines where `wc -l` reports 13,164. Both were corrected before this document; the shipped tool is the
  corrected one.

---

## Decisions for Steve — each with a recommendation

1. **A-3's severity, and whether its fix is scoped next.** *Recommend MEDIUM, and yes — a small scope.* The leave
   dialog is actively telling people discarding is safe. The scope's first constraint is the Clear All Data path
   (above).
2. **B-3's severity, and its order.** *Recommend MEDIUM, and scope it before or together with A-3.* It is the only
   finding where household data leaves the device, it is live for any visitor who presses EXECUTE without a key, and
   it is undisclosed.
3. **A-4, A-5, A-6 and A-2.** *Recommend one later import-hardening scope at LOW*, not urgent: no persistent damage was
   observed, and each needs a malformed or doctored file.
4. **Where this document lives.** §G and the 2026-09-04 H-2 decision make a completed audit **repo-only**, with a
   carve-out for an audit a live scope cites. *Recommend repo-only now (`docs/`), and adding it to the pool on the day
   a scope for A-3 or B-3 opens, until that scope retires.*
5. **The five new tools.** *Recommend repo-only in `qa/tools/`*, matching the existing measurement probes: they
   assert nothing and count toward no total. A fix scope for A-3 or B-3 would reuse its probe as the negative control.

---

## Carried from the previous session — NOT examined here, recorded so they are not lost

Re-derive before acting on any of them.

- **Roth best-cell pin (v5.69).** One of four Rhode Island households measured changed its best Roth cell
  (`fill12` → `current`). Disclosed in CHANGELOG and METHODOLOGY; no assertion pins it. Open; the recommendation
  given was *leave it disclosed, unpinned*.
- **v5.69 Field Manual wording** — Steve was asked to read the two rewritten state sentences.
- **Pool pruning — deferred by Steve on 2026-09-10.** The analysis lived only in that chat: four history files
  qualify under H-2 as written; twelve retired scopes plus `BUILD_BRIEF_v5_49.md` are a class H-2 never decided;
  six of the seventeen carry manifest hash rows, so the manifest must change before any delete or K-8 goes red.
