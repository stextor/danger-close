# SCOPE — written claims that never expire: the served page, and the status line

| Field | Value |
|---|---|
| Status | **SCOPE ONLY — NO BUILD.** Four decisions open in §7. Nothing in this document has been built, and §7 must be resolved before anything is |
| Written | 2026-08-28 |
| Against | **v5.53** · `src/DangerClose.jsx` md5 `12a007ed8e57a391acba67b799eb5a2f` · built `index.html` md5 `c99fd1fe27998e1dff2aa192c7e48ea2` · repo HEAD `b825fa5` |
| Freshness (§A/§A2) | Run this session. Manifest = pool = committed tree on the source. **Suite drift found** — see §2 |
| Supersedes | the "§F live-page gap" framing in `SESSION_BRIEF_v5_54_hygiene.md` §3, which scoped half of this |

---

## 1 · Premise — two problems that are one problem

The session brief scoped the live-page gap alone. Working through the doc-hygiene sweep in the same
session surfaced its twin, and they should not be built as two gates.

**Problem A — the served page.** §F verifies the *committed tree*. Nothing verifies what is
*actually served*. Not hypothetical: verified this session by walking the commit history.

```
commit 66db033  "v5.53 — the Roth ladder's IRMAA MAGI counts dividends"
  src/DangerClose.jsx  ->  40fd122d557a4fb00653c3e4384e1650   (that is v5.52's source)
commit b825fa5  "v5.53"
  src/DangerClose.jsx  ->  12a007ed8e57a391acba67b799eb5a2f   (v5.53's source)
```

For the span between those commits the repo carried a release titled v5.53 whose source was v5.52 —
the built artifact went up ahead of the source. Provenance was closed later, and the tree is
self-consistent now, but nothing detected the window while it was open.

**Problem B — the status line.** A scope's status is written by the session that drafts it and read
by every session after; nothing makes it expire. §I records the 2026-08-26 sweep: nine scopes with
live-looking status lines, **seven already shipped, two of them saying DO NOT PROCEED about shipped
work.** By v5.53 — twenty-odd releases later — **twelve** had drifted again, including one reading
**BUILD GATE OPEN** about work shipped at v5.24. The 2026-08-28 sweep retired eight (see the
`RETIRED 2026-08-28` blocks). A third drift is already scheduled; only its date is unknown.

**Why one problem.** Both are a written claim with no expiry, checked by nothing:

| | The claim | Written by | Falsified by | Detected by |
|---|---|---|---|---|
| A | "v5.53 shipped, source md5 `12a007…`" (CHANGELOG provenance line) | the release | an upload that lands out of order, or Pages trailing | nothing |
| B | "BUILD AUTHORISED" (scope status line) | the drafting session | the release that builds it | nothing |

⚠ **The constraint that shapes the whole design.** §I warns **four separate times** against building
a release gate nothing cross-references — `VERIFY.sh` is the fourth, and it sat at the repo root
calling itself release verification while eleven releases stale and referenced by nothing. Two new
gates would be two new candidates to become the fifth. **Whatever is built here must be named in
§I's checklist and run by something that already runs**, or it should not be built.

## 2 · Site census

**Verified this session, by command.**

| Site | State |
|---|---|
| `qa/runsuite.sh` | 32 suites invoked; `t32` added at v5.53. The thing that "already runs" |
| `qa/tools/package_check.mjs` | modes `app-release\|ops`, fails closed to `app-release`. Runs on every package per §L |
| `OPERATIONS.md` §F | ship-verification ritual — verifies the committed tree only |
| `OPERATIONS.md` §I | release checklist; the list any new check must be named in |
| `docs/SCOPE_*.md` | 24 files. 16 now carry a retirement marker; 4 are genuinely open; `SCOPE_STANDING_AUDIT.md` is not a build scope (§K) |
| `CHANGELOG.md` provenance line | present from v5.12 forward; the only durable record of what a version was |

⚠ **Pool drift found during the freshness check, and it is evidence for this scope, not an aside.**
The v5.53 pool refresh rolled the *source* and skipped the *suite*: ten test files in the pool are
v5.52-era copies, and **`t32_ladder_dividend.mjs` — the only suite that witnesses the v5.53
release — was absent from the pool entirely.** The 2026-08-28 doc-hygiene package fixes the pool.
The general point stands: **a refresh that half-happens looks exactly like one that fully
happened.** That is Problem A's shape applied to the knowledge pool rather than to Pages.

## 3 · What a session can and cannot reach

**Printed this session:**

```
https://stextor.github.io/danger-close/          -> HTTP 403   (not in the egress allowlist)
https://raw.githubusercontent.com/…/index.html   -> HTTP 200
```

**A session cannot fetch the served page.** Any design assuming otherwise fails at build time.

## 4 · Options for Problem A (the served page)

| | Route | Proves | Weakness |
|---|---|---|---|
| **A1** | Session-side over `raw.githubusercontent.com` — fetch the committed `index.html` by an independent path, hash it, compare to the manifest's built md5 | the *committed* artifact matches what the release claims, over a path that is not the clone | does **not** prove what Pages serves; Pages can trail a commit |
| **A2** | Maintainer-side one-liner — Steve hashes the served page and compares to the CHANGELOG provenance line | the **true served bytes**. The only route that does | a gate nobody is forced to run — this project's oldest failure |
| **A3** | Add `stextor.github.io` to the sandbox allowlist | a session checks directly | changes Steve's environment, not the repo. **Not to be built on session initiative** |

**Recommendation: A1 + A2**, with the doc saying plainly which proves what. A1 as the automated
check; A2 as the honest final word. A1 would catch the `66db033` window; neither is a substitute for
the other, and pretending A1 proves the served page would be worse than not having it.

## 5 · Options for Problem B (the status line)

| | Route | Cost | Weakness |
|---|---|---|---|
| **B1** | A suite check that fails when a `SCOPE_*.md` has no retirement marker **and** its named version has a CHANGELOG entry | small; runs every suite run | ⚠ **the test is unsound** — see §6. It would have retired the v5.34 scope with a false history |
| **B2** | A suite check that fails only on scopes with no marker at all, listing them for a human to judge | small; runs every suite run | reports, does not decide. Noisy while 4 scopes are legitimately open — needs an explicit allowlist of open scopes, which itself can go stale |
| **B3** | A §I checklist line only — sweep at each ship, no automation | free | this is what already exists, and it stopped happening twice |

**Recommendation: B2**, with the open-scope allowlist held *in the check* rather than in a document,
so that adding a scope without classifying it fails loudly. B1 is tempting and should be refused.

## 6 · ⚠ The trap this scope exists to name

The obvious automation for Problem B is: *if the scope names a version and that version shipped,
retire it.* **That test is unsound, and its first row demonstrates it.**

`SCOPE_CAPGAINS_ENGINE_v5_34.md` names v5.34; `## v5.34` is in the CHANGELOG. But v5.34 **narrowed
mid-build** — its entry says the capital-gains engine work *"is backed out and held for v5.35"* —
and the work re-landed at **v5.36**. B1 would have marked that scope "built at v5.34" and written a
false history into the record, automatically and at every ship.

The sound test is the expensive one: **read what the release actually shipped and compare it to what
the scope proposed.** That is what the 2026-08-28 sweep did, and it is why B2 reports rather than
decides. Any automation here can find *candidates*; it cannot resolve them.

## 7 · DECISIONS — ALL OPEN, for Steve

| | Decision | Options | Recommendation |
|---|---|---|---|
| **D-1** | Problem A route | A1 · A2 · A3 · combinations | **A1 + A2.** Do not build A3 on session initiative |
| **D-2** | Problem B route | B1 · B2 · B3 · none | **B2.** Refuse B1 — §6 |
| **D-3** | Where the checks live | inside `runsuite.sh` (runs every suite run) · inside `package_check.mjs` (runs every package) · a new script | **`package_check.mjs`** for A1, since it already takes a clone and already runs on every package; **`runsuite.sh`** for B2. **No new script** — that is how `VERIFY.sh` happened |
| **D-4** | Whether to build both halves at once | both · A only · B only · neither yet | **Both, in one release.** They are one failure class, and a release that fixes half of it will read as having fixed it |

**Nothing builds until §7 is resolved.** If a session finds evidence contradicting §1 or §2, stop and
report rather than adapting.

## 8 · Out of scope

- Changing what Pages serves, the publish flow, or the upload path (§L covers the upload traps).
- Reviving `VERIFY.sh` in any form, including by rolling its version pair forward — §I forbids it
  explicitly and this scope is the reason the temptation recurs.
- Retiring the four genuinely-open scopes (`SCOPE_STATE_FIXTURES`, `SCOPE_v5_40_disclosures_and_mechanics`,
  `SCOPE_FIX_tidyup_six`) or `SCOPE_STANDING_AUDIT` (not a build scope).
- The pool's scope-storage inversion — see the doc-hygiene package's `README-FIRST.md`, finding 4.

## 9 · Honesty statement

Every figure, hash, HTTP status and file state above was printed by a command on 2026-08-28 (§A0).
The commit hashes in §1 came from `git log` and `git show` against a fresh clone at HEAD `b825fa5`.
No count or state in this document was carried over from `SESSION_BRIEF_v5_54_hygiene.md`; where this
scope and that brief agree, it is because both were checked, and where they disagree, the brief's
errors are named in the doc-hygiene package's `README-FIRST.md`.
