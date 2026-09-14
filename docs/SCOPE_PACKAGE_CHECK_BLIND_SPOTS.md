# SCOPE — the three things `package_check` cannot see, because they are not file contents

| | |
|---|---|
| Status | **OPEN — DECISIONS REQUIRED. Nothing here is built.** Six decisions in §5 need answering before any build starts. |
| Measured against | **v5.71**, source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html` `e1bd283b638cdab74941804708987bb2`, repo HEAD **`00f8dc4`**, 339 tracked files, pool 134, no drift |
| Parent findings | **D-7** (the extra-path gate, deferred 2026-09-14 with a named reason), **F-2** (nothing detects a file that should have LEFT the pool), and the **F-4 mode finding** from `SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` §10 |
| Target release | An **ops package** (`KIND: ops`) — no app source change, no version bump. See D-6 |
| Kind | **QA tooling.** No engine, tax, state or modelling change: `METHODOLOGY.md` does not change and the app suite's totals must not move |

⚠ **Every figure below is command output at HEAD `00f8dc4` and must be RE-MEASURED when the build
starts.** The three preceding scopes each had at least one stale anchor by the time they were built.

---

## 1 · Premise, measured

### The shape the three share

`package_check` verifies **file contents, inside the package**. Each of these three defects is
invisible to it for the same structural reason, and each has been found by hand or not at all:

| | The defect | Why no gate sees it |
|---|---|---|
| **B-1** | a file committed at an **extra** path, as well as its real one | every packaged file *did* land, so `changed` is 0 and D-1 passes clean |
| **B-2** | a file that should have **left** the pool but is still there | J-1..J-4 assert presence and rotation only; K-9 passes any file that still carries a row |
| **B-3** | a wrong **file mode** | `md5` is content-only; `statSync` is used for `isDirectory()` and `.size` and nothing else |

**B-3 has already shipped once as a silent miss.** The 2026-09-14 ops package scored `package_check`
**45 passed, 0 failed** against a tree in which F-4 — one of the five fixes that package named — was
not actually applied. The gate was not wrong; it has no mode awareness. But a green run over-reported
what shipped, which is the property this project treats as worse than a red one.

### ⚠ B-1's premise has CHANGED, and this is the finding that makes this scope cheap

`OPERATIONS.md` §C defers the extra-path gate on the grounds that *"a first census of this ran to 68
candidates of which 64 were false positives"*, because `index.html` and `README.md` are multi-path by
design. **That census asked about BASENAMES. Asking about CONTENT instead gives a clean gate with a
zero baseline.** Measured at `00f8dc4`:

| Question | Result on the current tree |
|---|---|
| **(A) duplicate CONTENT** — two tracked paths holding byte-identical bytes | **0 groups** |
| **(B) shared BASENAME** — two tracked paths with the same filename | **2 names**: `README.md` (3 paths), `index.html` (2 paths) — both differing content, both by design |

**The v5.68 defect was duplicate CONTENT**: §C records the six `qa/qa-baseline/` files as committed at
the root *"byte-identical to them"*. Simulated against the current tree by re-committing five of those
six at the root, a content check names all five and nothing else:

```
## (A) DUPLICATE CONTENT — byte-identical pairs: 5 group(s)
   1d6f30e0  qa/qa-baseline/t1_units.mjs  ==  t1_units.mjs
   2998abd2  qa/qa-baseline/t3_roth.mjs   ==  t3_roth.mjs
   …
```

**Zero false positives on the clean tree, five true positives on the defect.** The 68/64 problem was
an artifact of the question, not a property of the repo. ⚠ **§C's deferral reason is therefore stale
and must be corrected in whichever package builds this** — it is the fourth time in this project a
*reason* has rotted while the *entry* stayed correct, and §C's own text is where that pattern is
recorded.

### B-2, measured

Pool holds **134** files. Exactly **one** has no byte-identical counterpart in the repo:
`DangerClose-v5_70.jsx`, the prior leg, which is absent from the tree **by design** (the repo carries
one source; §A2 records this). **No orphan is currently present**, so this gate would ship green and
would need a deliberate control to prove it can fire at all — §B2's empty-set problem.

### B-3, measured — and a candidate rule that actually holds

| Set | Modes |
|---|---|
| `qa/tools/*.sh` (6) | all `100755`, all `#!/bin/bash` |
| `qa/tools/*.py` (7) | all `100644` — but **four carry `#!/usr/bin/env python3`** |
| `qa/tools/*.mjs`, `*.cjs` | `100644`, **no shebangs at all** — invoked as `node x.mjs` |

**Candidate rule: a tracked file with a shebang carries the executable bit.** Tested both directions
at `00f8dc4`:

- **reverse — every `100755` file has a shebang: 0 counterexamples.**
- **forward — 4 violations**, all `.py`: `controls_manifest_rows.py`, `controls_v566_nm.py`,
  `controls_v568_va.py`, `oracle_ri.py`.

⚠ **This weakens decision D-4's stated rationale.** D-4 left the seven `.py` files at `100644` because
*"no document claims the `.py` files are directly executable."* **Four of them make exactly that claim,
in their own first line.** The decision may still be right — a shebang is a hint, not a contract, and
they are invoked as `python3 …` throughout — but it was taken on a premise that measurement does not
support, and D-1 below re-opens it deliberately rather than inheriting it.

### A fourth thing, found while measuring, not yet a blind spot in the list

`package_check` **E-1b** matches knowledge files to the repo by basename and skips any name with more
than one candidate (`if (cands.length !== 1) continue;`). At `00f8dc4` that is **2 names**, and the
pool holds both: `README.md` and `index.html`. **E-1b is currently switched off for both**, silently,
exactly as §C describes for the v5.68 window — except that here it is the permanent, by-design state
rather than a transient defect. See **D-5**.

## 2 · Site census (HEAD `00f8dc4` — re-resolve at build)

| Site | What changes |
|---|---|
| `qa/tools/package_check.mjs` — new section | the three new gates (naming: see D-4) |
| `qa/tools/package_check.mjs` E-1b, L305-306 at the last build | only if D-5 says repair it |
| `qa/tools/package_check_controls.sh` | new controls; **highest existing is `P49`**, so new ones are **P50+** |
| `qa/tools/controls_manifest_rows.py` and three others | mode only, and only if D-1 says so |
| `OPERATIONS.md` §C | the stale 68/64 deferral reason (**required**, see §1) |
| `OPERATIONS.md` §I | the expected red set, if any new gate is red by construction in a phase |
| `PROJECT_KNOWLEDGE_INDEX.md`, `CHANGELOG.md` | rows for every changed file; a `## ops` entry |

⚠ **`package_check.mjs` is the file this package edits AND the tool that verifies it.** Its manifest
row rolls **after** the edit (§I); a mutation control mutates a copy, never the tool in use.

## 3 · Tests this ships with

Negative controls, per §B2. **A control that does not fire is the finding.**

| Control | Mutation | Must fire |
|---|---|---|
| **P50** | the **v5.68 shape**: a tracked file re-committed byte-identically at the repo root | the duplicate-content gate, naming the pair |
| **P51** | `README.md` / `index.html` left exactly as they are | the gate must stay **SILENT** — the pair for P50, and what proves the content formulation beats the basename one |
| **P52** | a pool file that no longer exists in the repo and is not declared | the pool-orphan gate |
| **P53** | `DangerClose-v5_70.jsx` — the legitimate prior leg | must stay **SILENT** (the pair for P52) |
| **P54** | a shebang-carrying file at `100644` | the mode gate |
| **P55** | the `.mjs`/`.cjs` tools, no shebang, `100644` | must stay **SILENT** (the pair for P54) |

⚠ **Every gate here ships as a PAIR.** All three have a **zero or near-zero baseline**, which means a
gate that never fires and a gate that is deleted are indistinguishable from their green runs alone.
That is the P48/P49 lesson one level up, and it is the whole reason the silent halves are listed as
controls rather than assumed.

⚠ **The mode controls cannot use the `run` helper**, which copies the package with `cp -r`; mode
preservation through the copy must be asserted by the control itself or it is measuring `cp`.

**Also required:** full app suite both legs, total **unchanged**. Re-measure the current figure at
build rather than carrying 3,647 forward.

## 4 · Explicitly out of scope

- **Any app source change.** No version bump, no rebuild, no `smoke_built` re-run.
- **Making `package_check` fetch GitHub Pages** — still D-5 of the previous scope, still a design change.
- **Rowing the `controls_v*.sh` set** and the two legacy `controls_v559`/`v560` rows that contradict
  the manifest's own D-3 rule. Noted at three successive ships, deliberately not acted on.
- **A-2, A-4, A-5**, `SCOPE_STATE_SET_SELECTOR.md`, item B of `SCOPE_HOUSEKEEPING_THREE.md`,
  **`D-B3-1 (b)`** — all open, all unrelated.

## 5 · Open decisions — ANSWER BEFORE BUILDING

### D-1 · What is the mode rule, and does this package apply it retroactively?

- **(a) Shebang ⇒ executable.** Measured: holds in reverse with 0 counterexamples, 4 forward
  violations. Fixes the 4 `.py` files. ⚠ Reverses the reasoning of the previous scope's D-4.
- **(b) Extension ⇒ executable (`.sh` only).** 0 files to fix; the gate asserts the status quo.
  ⚠ Cannot express "this Python file is meant to be run directly", which four files assert of themselves.
- **(c) An explicit allowlist in the tool.** Unambiguous, and one more list that can rot.

**Recommendation: (a), and fix the four.** It is the only rule measurement supports, the remediation
set is four `git update-index` calls, and a rule derived from the tree is harder to rot than a list.
⚠ If (a) is taken, the previous scope's D-4 is **superseded, not contradicted** — say so in the
CHANGELOG, because "considered and left" is already recorded there as a decision.

### D-2 · Does the duplicate-content gate read the TREE or the PACKAGE?

- **(a) The whole committed tree, post-ship.** Catches the v5.68 shape whoever caused it, including
  a defect that predates the package. ⚠ 339 files, so it hashes the tree — cheap, but it is a
  tree-health check living in a package tool.
- **(b) Only paths the package touches.** Narrower and faster; misses an extra copy of a file this
  package did not ship, which is exactly how v5.68 went unseen for its whole window.

**Recommendation: (a).** The defect's defining property is that the *extra* path is one nobody was
looking at. A gate scoped to what the package touched cannot see it by construction.

### D-3 · How does a package declare that a pool file should be GONE?

F-2 has no declaration mechanism, which is why it was deferred twice.

- **(a) A `Delete from pool:` block in `README-FIRST.md`**, parsed like the existing delete-first list.
  Reuses a section every package already writes. ⚠ The existing list means *"delete then re-upload"*;
  this means *"delete and do not replace"*. **Two different meanings in one section is how the
  `index.html` name confusion started.**
- **(b) A distinct `RETIRE:` line in `MANIFEST.txt`.** Unambiguous, one more format to learn.
- **(c) Derive it: a pool file with no repo counterpart and no manifest row is an orphan.** Nothing to
  declare at all. ⚠ K-9 requires every pool file to carry a row, so under (c) the two rules interlock
  and a retirement means editing both — which is the three-place rule §G already states.

**Recommendation: (b).** (a) overloads a section whose existing meaning is load-bearing, and (c)
couples two gates so that a K-9 repair could silently satisfy this one. ⚠ **`DangerClose-v5_70.jsx`
must be exempt under whichever is chosen** — it is the prior leg and legitimately repo-absent.

### D-4 · What are the new gates called?

They do not fit A–K. A new section is needed, and the obvious letter is taken.

- **(a) Section `L`.** Next letter. ⚠ Collides with `OPERATIONS.md` **§L**, which is the packaging
  section this tool exists to enforce — "L-1 failed" would be ambiguous in every future report.
- **(b) Section `M`**, skipping L, with a comment saying why.
- **(c) Extend the existing sections**: duplicate content → `D`, pool orphan → `J`, modes → `G`.

**Recommendation: (c).** Each gate already belongs to a section by subject: `D` is the tree diff, `J`
is the pool, `G` is the workspace-vs-tree comparison where modes are observable. It adds no new
letter and no new ambiguity. ⚠ It does mean three sections' check-counts move, so §I's expected-red
prose must be re-read for each.

### D-5 · Is `E-1b`'s multi-candidate skip repaired here, or left?

`E-1b` is switched off for `README.md` and `index.html` today — by design, but silently.

- **(a) Repair it**: disambiguate multi-candidate names by content or by the manifest's repo-path
  column, which is the map §A2 already points at.
- **(b) Make it LOUD but leave the logic**: print which names were skipped, so a reader knows the gate
  did not cover them.
- **(c) Leave it entirely; its own scope.**

**Recommendation: (b) in this package, (a) in its own.** The silence is the defect that matters — §C
records E-1b being blind to six files for a whole release with nothing printed. Making it loud is a
three-line change and closes the dangerous half; rewriting the matcher is a real change to a gate
nothing currently controls, and it deserves its own controls.

### D-6 · One package or three?

- **(a) One ops package**, all three gates plus their controls.
- **(b) Three**, one per gate.
- **(c) Two**: the mode gate (cheapest, and the one that already shipped as a silent miss) first, the
  other two after.

**Recommendation: (a).** The three share a premise, a census and a §C correction; splitting means
writing the §C fix once and re-deriving the census three times. ⚠ But this is the decision most worth
overriding if the session budget is uncertain — **(c)** banks the measured, four-file mode fix
immediately, and the previous scope is the precedent for a package whose headline fix was one
assertion and which stayed buildable because it was not widened.

## 6 · Order of work, once decisions are answered

1. **Re-measure §1 entirely.** All of it is command output and all of it can move. Parser, never a grep.
2. **Write `P50` and `P51` first** and watch P50 fail to be caught by the current tool. If it *is*
   caught, the premise did not reproduce: **STOP and report.**
3. The duplicate-content gate, then the pool-orphan gate, then the mode gate — each with **both**
   halves of its control pair before moving on.
4. The four `.py` mode fixes, if D-1 (a). ⚠ **They cannot ship as packaged files** — the content does
   not change, so D-1 would fire on them as `unchanged`, and §L records that replacing a tracked file
   preserves its mode. They are `git update-index --chmod=+x` lines in `COMMIT_MESSAGE.txt`, exactly
   as `controls_v570_b3.sh` was. **The new mode gate is what finally verifies they happened** — which
   is the first time any of this has been checkable.
5. `OPERATIONS.md` §C's stale 68/64 reason (**required**), and §I if any expected red set moves.
6. Full app suite, both legs, from the packaged copies. Total unchanged.
7. Manifest rows; `package_check.mjs`'s **after** its edit; `CHANGELOG.md`'s **last**.
8. Package per §L as `KIND: ops`, `package_check` with all four positionals, pool fourth, **and again
   after upload** — the run that will, for the first time, be able to confirm step 4 landed.

⚠ **This scope needs an `I-2` OPEN-allowlist entry in `package_check.mjs`, shipped in the SAME package
as the scope itself.** I-2 reads the tree as the package leaves it, so a scope arriving without its
entry fires red in the run that ships it. That has now happened once and been recorded; it should not
happen twice. The entry names its own expiry — *the build that retires this scope, which removes the
entry and marks the scope RETIRED with a build record, both halves in one package.* Nothing can detect
a missed removal: I-3 fires only on an entry naming a file that is **gone**. A person removes it.
