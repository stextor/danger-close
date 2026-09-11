# SCOPE — B-3: Ask AI must never send without a key or a local model on a self-hosted copy

| | |
|---|---|
| Status | **BUILDABLE — all three decisions APPROVED 2026-09-11 (§5):** D-B3-1 (a) the app only · D-B3-2 (a) a disabled, relabelled button · D-B3-3 (b) CHANGELOG, a Field Manual sentence and a short public note after v5.70 is live. *(Prior status: DRAFT, awaiting decisions.)* |
| Measured against | **v5.69**, source `76a35ba283ed5153ff257106e7ccfc10`, built `index.html` `86703918db247e3284752f0f1cc1f6d5`, `src/main.jsx` `d9eca7b469a3fb7ec1c5325fd4bf8145`, repo HEAD `4bbf89e` (the Phase 1 audit package — verified after upload: `package_check` 44 passed, 1 failed, `D-1` only), pool 128 files, no duplicate names |
| Parent finding | `docs/FlawsToFix-v5_69-Phase1.md` **B-3** (MEDIUM, undisclosed) |
| Target release | **v5.70** |
| Kind | **A privacy guard.** No engine, tax or modelling change: `METHODOLOGY.md` does not change, and MC parity must stay 10/10 (OPERATIONS §E) |

⚠ **Every figure and line number below must be RE-MEASURED against whatever is shipped when the build starts.**
Line numbers are parser output at v5.69 and will drift. If the premise fails to reproduce — the probe sees no keyless
request on the build's prior leg, or the guard does not close it — **STOP and report** rather than adapting.

---

## 0 · Findings this scope records before anything else

Each was found by command this session. None is a decision; the decisions are in §5.

- **F-1 · The Field Manual contradicts the defect, not just omits it.** §10's table *"Exactly what an Ask AI call
  transmits — the complete list"* gives the destination as *"api.anthropic.com over HTTPS — or, if you've configured
  a Local Model, your-machine/v1/chat/completions"*. For a self-hosted copy with neither configured, the request went
  to the page's own host. The guard makes that sentence true again.
- **F-2 · The `/anthropic` rewrite cannot produce a working answer anywhere.** A POST to
  `https://api.anthropic.com/v1/messages` with no key (empty body, no user data) returned **401** on 2026-09-11. The
  dev-server proxy (`vite.config.js` L16–26) injects no key, so the comment calling it a way to *"reach Anthropic
  without a user key while developing locally"* describes a request that can only fail. In production the rewrite
  only misroutes.
- **F-3 · B-3 is as old as the repository.** The first commit, `f8e21ce` (2026-08-01), carries the same
  `(!IS_CLAUDE_ARTIFACT && localApiKey)` headers ternary (L3791–3792 there) and a byte-identical `src/main.jsx`. Every
  standalone build has had it.
- **F-4 · A button-only fix would leave the leak open.** EXECUTE's `disabled` rule (L11687) ignores the key, and
  Enter in the query box calls `askAI` directly (L11664). The refusal must live inside `askAI`.
- **F-5 · One error hint becomes wrong advice after the guard.** `askAI`'s network-error branch (L6090) appends
  *"…paste a [key]…"* whenever `!IS_CLAUDE_ARTIFACT && !localApiKey`. Once the guard exists, that state reaches the
  branch only on the **local-model** route, where the hint is wrong.
- **F-6 · `qa/smoke_built.mjs` L145 asserts the built app CONTAINS the rewrite** —
  `ck("Anthropic fetch wrapper installed by the bootstrap", /\/anthropic/.test(html))`. Harmless under D-B3-1 (a); an
  OPERATIONS §B2 lock under (b).
- **F-7 · No release-gate suite has ever exercised the self-hosted Ask AI branch.** The shared jsdom environment
  exposes no `location`, so `IS_CLAUDE_ARTIFACT` fails closed to `true` and the DOM suites run the claude.ai branch.
  `validation/byok_test.jsx` does test the keyed and artifact branches, but it has no keyless case and is not part of
  the release gate (OPERATIONS §B). `t4` L308 checks only that "EXECUTE" renders on the Ask AI tab.
- **F-8 · A correction to the Phase 1 audit's Section E note.** OPERATIONS §N3a records `jsdom`'s absence from
  `package.json` as **deliberate** (installed `--no-save` in the build folder). The note's description of what
  `qa/mk_runfolder.sh` does to a run folder stands, but it should have cited §N3a. Annotated in that document in this
  scope's ops package (2026-09-11).

---

## 1 · Premise, measured

**Reproduced by the audit** (`qa/tools/probe_ai_route.mjs`): on `https://stextor.github.io/danger-close/` with no key,
the Anthropic request — the full 16,530-character AI context — resolved to
`https://stextor.github.io/anthropic/v1/messages`; with a saved key it resolved to `api.anthropic.com` with `x-api-key`.

**The proposed guard, measured on a scratch copy** (`/tmp/b3run`, session-only, never shipped). A five-line refusal was
inserted at the top of `askAI`, immediately before `const _validFiles = …`, firing when
`!IS_CLAUDE_ARTIFACT && !localApiKey && !(localLLM && localLLM.url)`. The DOM leg was rebuilt, and the committed probe
was run. The local-model row used a session-only variant of the probe whose only change seeds `local_llm_v1` instead of
`api_key_v1`.

| Build | Configuration | Requests | Resolved destination |
|---|---|---|---|
| v5.69, unpatched | no key, no local model | 1 | `https://stextor.github.io/anthropic/v1/messages` — the leak (negative control) |
| scratch + guard | no key, no local model | **0** over 25 attempts | — |
| scratch + guard | saved key | 1 | `https://api.anthropic.com/v1/messages`, headers include `x-api-key` |
| scratch + guard | local model `http://localhost:11434/v1` | 1 | `http://localhost:11434/v1/chat/completions`, `Content-Type` only |

**One guard in one function closes the reproduced path, and both configured routes keep working.** Not measured: the
built artifact with the real `main.jsx`, and a real browser.

---

## 2 · Site census (v5.69 — re-resolve at build)

| Site | Where | Change |
|---|---|---|
| The refusal | `askAI` (starts L6003), after the offline check, before `_validFiles` | **new** — refuse, add one thread notice, return. The user's typed question stays in the box |
| `askAI`'s dependency list | L6094 | none — it already lists `localApiKey`, `offlineMode` and `localLLM` |
| Network-error hint | L6090 | add `&& !(localLLM && localLLM.url)` to its condition (F-5) |
| EXECUTE button | L11687 (`disabled`), L11688 (label) | D-B3-2 |
| Enter handler | L11664 | none — the refusal covers it |
| Key panel copy | L11568, L11580, L11596–11597 | none, unless D-B3-2 asks for a sentence |
| Field Manual §10 | inside `DOCS_HTML` (the one-line blob, L3844) | D-B3-3 — one sentence; edit with quote-free anchors |
| `src/main.jsx` | L52–69 | **only under D-B3-1 (b)** |
| `vite.config.js` | L16–26 | only under D-B3-1 (b), optional |
| `qa/smoke_built.mjs` | L145 | new behaviour check (§3); under (b) its presence check must also be replaced |
| Version | footer, DATA LOAD header, Field Manual callsign, Field Manual footer | v5.70 |
| Suite version registration | the suites `vercensus.cjs` names | v570 |

---

## 3 · Tests this ships with

**`qa/t36_ai_route.mjs` — new, runs on both legs.** DOM bundle, with `location` exposed on a self-hosted URL and a
recording `fetch`. It tests the app's own behaviour, without `main.jsx`.

- **R-1 · extinction invariant.** Self-hosted, with no key and no local model: pressing EXECUTE, and pressing Enter in the
  query box, make **zero** requests; the notice appears; the typed question is still in the box. On the **v569 leg** a
  dated pre-fix pin asserts exactly one keyless request instead (OPERATIONS §D), so each leg asserts its own truth.
- **R-2 · control:** a saved key → exactly one request, to `https://api.anthropic.com/v1/messages`, with `x-api-key`.
  Both legs.
- **R-3 · control:** a local model → exactly one request, to its `/chat/completions`, without `x-api-key`. Both legs.
- **R-4 · control:** the claude.ai branch (no `location` exposed) → one request to `api.anthropic.com` without a key.
  Both legs. The artifact path does not change.
- **R-5:** offline mode → zero requests. Both legs — existing behaviour, pinned because it shares the refusal's shape.
- **Negative controls (§B2)** in `qa/tools/controls_v570_b3.*`, against scratch copies of v5.70 only:
  - delete the guard → R-1 fires;
  - narrow it to `!localApiKey` → R-3 fires;
  - drop its `IS_CLAUDE_ARTIFACT` term → R-4 fires.

  A control that does not fire is itself a finding.

**`qa/smoke_built.mjs` — the built artifact, with the real `main.jsx`.** Using the existing `beforeParse` fetch stub on
`https://localhost/`, drive Ask AI with no key and assert **no request at all**. This is the only test that sees the app and
the bootstrap together. Under D-B3-1 (b), L145's text-presence check is replaced by a behaviour check.

**Field Manual lock (D-B3-3):** a presence assertion on the new sentence, with a note that it becomes a lock the day a
release falsifies it (§B2).

**Release gate:** the full two-leg suite green, MC parity 10/10, and `smoke_built` against the packaged `index.html`.

---

## 4 · Explicitly out of scope

- **A-3** (the draft autosave) — the next scope.
- A-1's host-caution hardening; A-2, A-4, A-5, A-6.
- The claude.ai branch, and anything a keyed or local-model request contains.
- The attachment-read nuance under positive finding 5.
- Giving the shared jsdom environment `location` or `FileReader` for the other suites.
- Pinning harness dependencies.
- Extending `validation/byok_test.jsx`.

Public communication is decision D-B3-3, not build work.

---

## 5 · Decisions for Steve

**D-B3-1 · Where the fix lives. — ✅ APPROVED 2026-09-11: (a), the app only.**
- **(a) The app only — RECOMMENDED.** One refusal in `askAI`, plus the hint condition. No build input changes, and
  the §N3a scaffold check runs exactly as it does today. The rewrite stays in `main.jsx`, unreachable by anything the app
  sends outside claude.ai. The one exception is the rare fail-closed case: a non-file page with no hostname, which the app
  treats as claude.ai. `smoke_built`'s new behaviour check watches the built composition either way.
- **(b) Also remove the rewrite from `main.jsx`**, and the dev proxy with it. That retires a mechanism that can never
  succeed (F-2) and closes the fail-closed case. The costs:
  - it edits the build input with the worst history in this project (OPERATIONS §N2);
  - L145 becomes a lock to rewrite;
  - §N3a's scaffold check must rebuild v5.69 with **v5.69's** `main.jsx` from git, not the new one.

*Recommendation: (a) in v5.70; (b) later as its own small release, so a bootstrap change is verified on its own.*

**D-B3-2 · What a self-hosted user without a key sees. — ✅ APPROVED 2026-09-11: (a), with the wording as proposed.**
- **(a) RECOMMENDED:** the button is disabled and relabelled *"🔑 Add your API key to use Ask AI"* (sentence case,
  per the label convention). If Enter is pressed, one line appears: *"Nothing was sent — add your API key above, or set
  up a Local Model."*
- **(b)** EXECUTE unchanged; pressing it shows that line.

Both keep the refusal inside `askAI`.

**D-B3-3 · Disclosure. — ✅ APPROVED 2026-09-11: (b).**
- **(a) RECOMMENDED — and required by the project's rules in some form.** The v5.70 CHANGELOG states plainly what
  earlier standalone builds did. Pressing Ask AI with neither a key nor a local model sent the plan context — names,
  balances, income, Social Security, simulation results, the question and any attachments — to the site's own address,
  which on the live site is GitHub Pages. The request then failed, and what GitHub does with such a request is not known.
  §10 of the Field Manual gains one sentence: *"With neither a key nor a Local Model set, Ask AI sends nothing."*
- **(b)** (a), plus a short, candid note wherever you announce releases.

*Recommendation: (a) certainly; (b) yes, one sentence, if you post release notes anyway.*

**Wording constraints for all three disclosures** — they keep every claim inside what was measured:
- **Name the live site as the verified case**: the self-hosted branch on an `https://` GitHub Pages origin, reproduced
  in the harness. A copy **opened as a downloaded file** takes a different path: a `file:` page gets no rewrite, so the
  keyless request heads for `api.anthropic.com`, which returns 401 without a key. That path was **traced in the source,
  not tested** — including whether a browser sends the body at all from a `file:` page — so the disclosures make no
  claim about it. A copy hosted at some other address would have sent to that address (source-traced).
- **Do not state what GitHub returned or keeps.** Neither was measured.
- **What was sent:** the AI context — names, balances, income, Social Security and simulation results — and the typed
  question. Measured on the example household: 16,530 characters carrying the household name and the system prompt.
  Attachments ride in the same body (source-traced).
- **Since when:** every standalone build published from this repository. The send path and the rewrite are both in its
  first commit (2026-08-01); when the live site first served that build was not established.
- **Timing:** the public note goes out after v5.70 is live, not before.

**Starting draft of the public note**, to be finalised in Steve's voice at the build. It drops the chat draft's
*"where the request failed"*, because GitHub's response was not measured:

> Heads-up with v5.70: until now, if you pressed Ask AI on the live site without saving your own API key, the app sent
> your plan summary to the site's own GitHub Pages address instead of stopping. That summary included names, balances,
> income, Social Security, results, your question and any attachments. It shouldn't have happened, and the Field Manual
> said it couldn't. v5.70 blocks it: with no key or local model set, Ask AI now sends nothing. No API key was involved,
> so there's nothing to change on your end. I don't know whether GitHub keeps anything from a request like that.

---

## 6 · Status and what happens next

- **2026-09-11 — decisions approved** (§5). This scope ships as its own ops package, with its `package_check` I-2
  OPEN-allowlist entry and F-8's annotation, so the decisions are on record before any code is written.
- **Next — the v5.70 build, against this scope:**
  1. OPERATIONS §A freshness check. Re-measure §1 on the build's legs, and STOP if it does not reproduce.
  2. The refusal in `askAI`, the hint condition (F-5), the button's disabled state and label, and the Enter notice
     (D-B3-2).
  3. The Field Manual sentence (D-B3-3), edited with quote-free anchors inside the one-line blob.
  4. `t36_ai_route.mjs`, its negative controls and the `smoke_built` behaviour check (§3); register `v570` across the
     suites.
  5. The version bump at the four in-app sites. Build `index.html` per OPERATIONS §N3a, rebuilding v5.69
     byte-identically first.
  6. The v5.70 CHANGELOG entry carries the disclosure within the constraints above. `METHODOLOGY.md` does not change.
  7. The release package closes this scope, all in the same package: a retirement marker in its first twelve lines,
     its allowlist entry removed, and its manifest hash row deleted (D-3 leaves retired scopes unrowed).
  8. After v5.70 is live: the public note, finalised in Steve's voice.
- **A build check to carry:** whether `.ai-btn` text follows the skin's capitalisation, so the new sentence-case label
  renders like its neighbours.

---

