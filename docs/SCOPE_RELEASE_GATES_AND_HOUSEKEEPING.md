# SCOPE — the release gates that did not fire (D-1 first), with the pool and trap housekeeping

| | |
|---|---|
| Status | **OPEN — AWAITING DECISIONS IN §5. DO NOT BUILD YET.** Written 2026-09-14. |
| Measured against | **v5.71**, source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html` `e1bd283b638cdab74941804708987bb2`, repo HEAD `0a028fd`, pool 133 files, no drift |
| Parent findings | **D-1's completeness gap** and **B-2's name match**, both found at the v5.71 ship (2026-09-14); `docs/STATUS_2026_09_11_b3_live_verification.md` **F-2** and **F-4**; `package_check.mjs`'s stale §H comment; two harness/registry traps hit during the v5.71 build |
| Target release | An **ops package** (`KIND: ops`) — no app source change, no version bump. See D-6 |
| Kind | **QA tooling and documentation.** No engine, tax, state or modelling change: `METHODOLOGY.md` does not change, the app source is untouched, and the app suite's totals must not move |

⚠ **Every line number and hash below is parser or command output at v5.71 and must be RE-MEASURED when the
build starts.** The A-3 scope's Phase 1 numbers were twelve lines stale by the time it was written; expect the
same here.

---

## 1 · Premise, measured

### The finding that motivates this scope

**At the v5.71 ship, 17 files were uploaded to the repo root instead of `qa/`, leaving a `qa/` tree that could
not test its own release — and `package_check` scored 44 passed, 2 failed, with both failures documented as
expected.** Nothing in the tool said anything was wrong. The defect was found by comparing the package against
the repo by hand.

What landed wrong: `qa/runsuite.sh`, `qa/smoke_built.mjs` and `qa/t23`–`qa/t37` flattened to the root.
`qa/qa-baseline/*` and `qa/tools/*` — one level deeper — landed correctly. The committed `qa/` therefore still
held the v5.70 suite: `grep -c t37_mydata_draft qa/runsuite.sh` returned **0**, and `grep -c '"v571"'` returned
**0** for each of `qa/t33`, `qa/t31` and `qa/t24`.

### D-1 — the gate that should have caught it (`qa/tools/package_check.mjs` L191-199)

```js
const unchanged = [], changed = [];
for (const f of ghFiles) {
  const r = join(CLONE, f);
  if (existsSync(r) && md5(r) === md5(join(GH, f))) unchanged.push(f); else changed.push(f);
}
ck("D-1: every file in github/ actually differs from the committed tree",
  unchanged.length === 0, `unchanged: ${unchanged.join(", ")}`);
```

D-1 asserts **`unchanged.length === 0`**, which is the correct pre-ship question. OPERATIONS §I records that
**`D-1` red post-ship is the expected complement**, so a session reading a post-ship run is told to expect
exactly what a broken upload also produces. Post-ship the true assertion is the mirror — **`changed.length === 0`,
every packaged file has landed** — and it is asserted nowhere.

⚠ **The number is already computed and already printed. It is simply not a check.** L215:

```js
console.log(`     (informational: ${changed.length} changed/new files in github/)`);
```

Measured three ways at the v5.71 ship:

| Run | `changed` | What it means |
|---|---|---|
| Pre-ship, against pristine clone `e192583` | **33** | all 33 packaged files differ — correct |
| Post-ship, after the **flattened** upload | **17** | 17 files never reached their repo path — **the defect** |
| Post-ship, after the corrected upload | **0** | everything landed |

A one-line assertion on a number the tool already has would have turned a silent 44/46 into a red gate naming
all 17 files. **This is the whole of D-1 in this scope.**

### B-2 — a false positive that makes a correct package read DO NOT SEND (L124-127)

```js
const knIndex = knFiles.filter(f => f === "index.html");
ck("B-2: no built index.html in knowledge/ (it is output, not input — §G)", knIndex.length === 0);
```

Matched on **filename only**. The pool's `index.html` is `src/index.html`, the **Vite entry template** — the
manifest's own row says so and records that it was *restored to the pool on 2026-08-20 after being found absent*.
Measured: pool `index.html` **5,029 bytes**; the built artifact **1,428,589 bytes** — a factor of ~284.
B-2 fires on any package that ships the template to the pool, which v5.71 had to do because F-3 changed it.
It landed in the v5.71 `DO NOT SEND` list, with the reasoning written into that package's README-FIRST.

### F-2 — nothing detects a file that should have LEFT the pool

`ck("J-…")` at L660-669 is the whole of section J's pool coverage: **J-1** every `knowledge/` file reached the
pool, **J-2** none landed stale, **J-3** exactly two source legs, **J-4** exactly two dom entries. J-3 and J-4
cover the two *rotation* classes only. A grep for any assertion of pool **absence** outside those returns
nothing. K-9 requires every pool file to be *named* in the manifest, so a lingering file that still carries a row
passes. A document retired from the repo but left in the pool is therefore invisible to every gate.

### F-4 — a control script that cannot be run as documented

```
$ git ls-files -s qa/tools/controls_v570_b3.sh
100644 … qa/tools/controls_v570_b3.sh
```

Committed non-executable, so `./qa/tools/controls_v570_b3.sh` fails and it must be invoked as `bash …`. It is
the **only** `.sh` in `qa/tools/` at `100644`; v5.71's `controls_v571_draft.sh` landed correctly at `100755`
because README-FIRST declared the hazard. ⚠ Also at `100644`, and **not** part of F-4 as originally written:
`controls_manifest_rows.py`, `controls_v566_nm.py`, `controls_v568_va.py`, `controls_v569_ri.py`,
`oracle_nm.py`, `oracle_ri.py`, `oracle_va.py`. Whether `.py` files should be executable is a separate question
— see D-4.

### The stale §H comment (L429-433)

> *"a session cannot reach stextor.github.io (403 — not in the egress allowlist)"*

**False as of 2026-09-14.** This session fetched `https://stextor.github.io/danger-close/` directly: HTTP 200,
1,429,130 bytes, md5 `e1bd283b638cdab74941804708987bb2` — byte-identical to the shipped artifact — and ran
`smoke_built` against those served bytes, 22 passed 0 failed. The comment's *conclusion* (H proves what the repo
holds, not what Pages serves) remains true and must be kept; only the stated reason is wrong. See D-5.

### Two traps for OPERATIONS, both hit during the v5.71 build

1. **`globalThis` vs `window` for `FileReader` (§C).** The app does a bare `new FileReader()`, which the bundle
   resolves on **`globalThis`**; jsdom installs `FileReader` on **`window`** only. Stubbing `window.FileReader`
   leaves the import path unreachable and the whole test group **vacuous** — it "passes" on the prior leg for
   the wrong reason. `t37`'s IM group stubs `globalThis` and carries a setup check so it cannot go vacuous
   silently.
2. **A third version-registry shape `vercensus` cannot sweep (§I).** §I records `t33`'s identifier-keyed `PINS`.
   Two more were hit at v5.71: **`t31`'s `ORDER`** (L275 at v5.70) — a version ladder **not named
   `KNOWN_VERSIONS`**, where `ORDER.indexOf(VER)` returns `-1` for an unregistered tag and silently scores every
   disclosure key as pre-fix, running the KNOWN-DEFECT branch instead of PARITY — and **`t24`'s `_k`**, an
   OR-chain that *terminates in a ternary*, which a sweep keyed on `VER === "vNNN"` followed by `?` will skip.
   All three fail closed, which is the only reason they were cheap.

## 2 · Site census (v5.71 — re-resolve at build)

| Site | What changes |
|---|---|
| `qa/tools/package_check.mjs` L191-215 | D-1's assertion and the informational line (D-1, D-2) |
| `qa/tools/package_check.mjs` L124-127 | B-2's predicate (D-3) |
| `qa/tools/package_check.mjs` L660-669 | section J, if F-2 gains a gate (D-3) |
| `qa/tools/package_check.mjs` L429-433 | the §H comment (D-5) |
| `qa/tools/package_check_controls.sh` | new controls; highest existing is **P45**, so new ones are P46+ |
| `qa/tools/controls_v570_b3.sh` | mode `100644` → `100755` (D-4) |
| `OPERATIONS.md` §C | the `globalThis`/`FileReader` trap |
| `OPERATIONS.md` §I | `t31`'s `ORDER` and `t24`'s `_k` beside `t33`'s `PINS` |
| `OPERATIONS.md` §I | the post-ship reading of `D-1`, if D-1 changes |
| `PROJECT_KNOWLEDGE_INDEX.md` | rows for every file this package changes |
| `CHANGELOG.md` | a `## ops YYYY-MM-DD —` entry, per §L |

⚠ **`package_check.mjs` is a file this package edits, so its own manifest row must be rolled AFTER the edit**
(§I: editing a file after computing its row pins the pre-edit hash).

## 3 · Tests this ships with

This package changes **gates**, not the app, so its tests are **negative controls** — a gate with no control is
the thing §B2 exists to prevent, and P32 is the precedent for a control that reported CAUGHT spuriously.

| Control | Mutation | Must fire |
|---|---|---|
| **P46** | post-ship package with one `github/` file removed from the clone's tree (simulating a file that never landed) | the new D-1 completeness check |
| **P47** | the **exact v5.71 defect**: a package whose `github/qa/*` files are absent from the committed tree while `qa/qa-baseline/*` and `qa/tools/*` are present | the new D-1 completeness check, naming ≥17 files |
| **P48** | a package shipping the **genuinely built** `index.html` in `knowledge/` | B-2 (must STILL fire — the repair must not defeat it) |
| **P49** | a package shipping `src/index.html` as `knowledge/index.html` | B-2 must **NOT** fire (the false positive is gone) |
| **P50** | (only if F-2 gains a gate) a pool holding a file the package declares retired | the new J check |

⚠ **P48 and P49 are a pair and must both be run.** Repairing B-2 by deleting it would make P49 pass and P48
fail; the pair is what forces a repair that still catches the real error.

⚠ **A control that does not fire is the finding.** At v5.71 two of seven controls did not fire on their first
run and both were gaps in the *test*, not bad controls — `t37` grew from 39 to 43 checks as a result. Do not
adjust a control to make it pass.

**Also required, and not a control:** run the full app suite both legs and confirm the total is **unchanged at
3,647 app checks** (`t21` 50, `domdiff` 32 tooling; GRAND 3,729). This package must not move it. A moved total
means the package touched more than it claims.

## 4 · Explicitly out of scope

- **Any app source change.** `src/DangerClose.jsx` and `src/index.html` are untouched; no version bump, no
  rebuild, no `smoke_built` re-run against a new artifact.
- **A-2, A-4, A-5** — the remaining import-path findings. Their own scope.
- **`SCOPE_STATE_SET_SELECTOR.md`** and **item B of `SCOPE_HOUSEKEEPING_THREE.md`** — open, unrelated.
- **`D-B3-1 (b)`** — removing `main.jsx`'s rewrite and the dev proxy. Its own small release; it changes app
  behaviour and this package does not.
- **Making `package_check` fetch GitHub Pages.** Even though a session *can* now reach it (see §1), turning H
  into a live-serving check is a design change with its own failure modes. D-5 covers the comment only.
- **Rowing the `controls_v*.sh` set**, and **removing the two legacy rows** for `controls_v559.sh` and
  `controls_v560.sh` that contradict the manifest's own D-3 rule. Noted at the v5.71 ship, deliberately not
  acted on. If it is done it should be a decision, not a side effect.
- **Retiring or deleting any document.** §G's three-place rule and its pre-deletion check for unresolved
  decisions apply; nothing here needs it.

## 5 · Open decisions — ANSWER BEFORE BUILDING

### D-1 · How does `package_check` know whether it is pre-ship or post-ship?

The tool is invoked identically in both phases, so the complement assertion needs a phase.

- **(a) Infer it from `K-2`** — manifest's Current source md5 == the committed `src/DangerClose.jsx`. False
  pre-ship, true post-ship, by construction. No new argument, nothing to forget. ⚠ It couples D to K, and an
  **ops package** changes no source, so K-2 is true in *both* phases for one — meaning an ops package would be
  judged post-ship always, and its D-1 complement would fire pre-ship. Needs an ops carve-out.
- **(b) An explicit `--post-ship` flag.** Unambiguous and works for ops packages. ⚠ It can be forgotten, and a
  forgotten flag reads as a clean pre-ship run — the same class of silent-skip as passing the pool third, which
  §I records as nearly producing a false green at v5.66.
- **(c) Assert BOTH complements unconditionally and let one always be red**, with the run's shape read as a
  whole: pre-ship exactly D-1a red, post-ship exactly D-1b red. ⚠ Guarantees a red on every run forever, which
  is how "expect it red" became unreadable in the first place.

**Recommendation: (a), with an explicit ops carve-out keyed on `KIND: ops`.** It cannot be forgotten, which is
the property that matters most here — this defect survived *because* a human had to remember what to expect.

### D-2 · What does the post-ship check assert, exactly?

- **(a) `changed.length === 0`**, listing every file that did not land.
- **(b)** as (a), plus assert the count equals `ghFiles.length` so a truncated `github/` cannot pass.

**Recommendation: (b).** It is the same edit and closes the adjacent hole.

### D-3 · How is B-2 repaired, and does F-2 get a gate in this package?

B-2: **(a)** size threshold (template ~5 KB, artifact ~1.4 MB); **(b)** content marker — the built artifact
contains an inlined `<script>` with the bundle, the template does not; **(c)** compare `knowledge/index.html`
against `github/index.html` and fail only if they are the same bytes.

**Recommendation: (c), falling back to (b).** (c) states the real rule — *the pool copy must not be the built
artifact* — without a magic number that goes stale as the bundle grows.

F-2: **(a)** add a J check driven by an explicit "should be absent from the pool" list in `README-FIRST.md`;
**(b)** defer F-2 to its own scope.

**Recommendation: (b), defer.** F-2 needs a declaration mechanism that does not exist yet, and inventing one
inside a package whose headline fix is a one-line assertion risks the headline fix. ⚠ If deferred, say so in the
CHANGELOG entry so the next session does not read the omission as an oversight.

### D-4 · Does F-4 cover the `.py` files too?

`controls_v570_b3.sh` at `100644` is unambiguous — it is documented as runnable with `./`. Seven `.py` files are
also `100644`.

- **(a)** Fix the `.sh` only; leave `.py` alone — they are invoked as `python3 …` throughout.
- **(b)** Fix both.

**Recommendation: (a).** No document claims the `.py` files are directly executable, and changing them invents
an obligation. ⚠ Record in the CHANGELOG that they were *considered and left*, so this is not re-found as a bug.

### D-5 · The §H comment

- **(a)** Correct the reason, keep the conclusion: a session **can** reach Pages, but H still proves only what
  the repo holds, and the maintainer-side check in OPERATIONS §I remains the authority for served bytes.
- **(b)** As (a), and additionally record the v5.71 measurement (live bytes byte-identical to the shipped
  artifact; `smoke_built` 22/22 against them) as evidence that a served-bytes check is now *possible*, without
  building one.

**Recommendation: (b).** The evidence is cheap to record and is what a future scope for that check would need.

### D-6 · One package or two?

- **(a)** One ops package: gates, controls, the mode fix, both OPERATIONS traps, manifest, CHANGELOG.
- **(b)** Split: gates+controls first, documentation second.

**Recommendation: (a), one ops package.** The OPERATIONS §I text about how to read a post-ship run **must**
change in the same package as D-1, or the documentation and the gate disagree — which is the exact drift the
project instructions call a finding.

## 6 · Order of work, once decisions are answered

1. **Re-measure §1 and §2** against whatever is current. Use the parser, never a grep.
2. **Write P47 first** — the exact v5.71 defect — and watch it **fail to be caught** by the current D-1. A
   control that cannot demonstrate the defect means the premise did not reproduce: **STOP and report.**
3. D-1's completeness assertion, then B-2's repair.
4. P46, P48, P49. **P48 and P49 as a pair.**
5. The `controls_v570_b3.sh` mode fix.
6. OPERATIONS §C (the `FileReader` trap) and §I (`ORDER`, `_k`, and the post-ship D-1 reading).
7. Full app suite, both legs, from the packaged copies — **the total must still be 3,647**.
8. Manifest rows for every changed file, `package_check.mjs`'s row rolled **after** its edit; `row_census.cjs`
   after any row-expression change.
9. Package per §L as **`KIND: ops`** with an **unversioned** outer folder `danger-close-<slug>`, a CHANGELOG
   `## ops` entry, and a delete-first list. Run `package_check` on it — **all four positionals, pool fourth** —
   and again after upload.

⚠ **An ops package's expected red set differs from an app release's.** §I records that for an ops package
`K-1`–`K-3` are green in both phases and **`D-1` goes red post-ship instead**. If D-1 changes, that sentence in
§I changes with it — step 6 and step 9 are the same obligation seen twice.
