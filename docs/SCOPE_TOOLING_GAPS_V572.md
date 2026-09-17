# SCOPE — four tooling gaps found at the v5.72 ship

| | |
|---|---|
| Status | ☑ **RETIRED — FULFILLED 2026-09-15 in the ops package that adds it (D-6); §7 is the build record. All six decisions taken as recommended.** |
| Build under scope | **v5.72** — source `2b88134b4b1f014364262d479fb4e8a3`, built `index.html` `4f035dc5644d91476888a9fb9fdc1f5b`, repo `e29a741` |
| Kind | **ops** — no app source change, **no version bump**. Tooling, its tests, and the documents that describe it |
| Destination of this file | `docs/` **and** the pool. Recommended (D-6): it ships *built and retired* in the same ops package, so it never needs an I-2 allowlist entry |

## 1 · Premise — measured 2026-09-15, not recalled

Every item below was re-read in the tool's source at the repo HEAD above, and the first three were run.

1. **`vercensus.cjs` misses identifier-keyed version maps.** It visits string `Literal` nodes only
   (`walk.simple(ast, { Literal(n) { if (n.value !== CUR) … } })`). `t33`'s `PINS` is keyed `v572: {…}` — an
   `Identifier`. Run at v5.72: `t33 ladder: 1 gated: 1`, i.e. the `KNOWN_VERSIONS` entry and one gate; the
   `PINS` entry is not counted. That entry has been missed at **v5.66, v5.70 and v5.72**; each time `t33` failed
   closed (DIED), which is the only reason it was cheap.
   - ⚠ **`OPERATIONS.md` §C (the "four shapes" table, L744–749) overstates the gap.** It says the sweep also
     misses `t31`'s `ORDER` ladder and the ternary-test OR-chains in `t24`/`t28`. **Measured, it does not:**
     `t31` counts 2 ladder + 4 gated = its 6 `"v572"` literals; `t24` 1 + 3 = 4; `t28` 1 + 2 = 3. It counts every
     literal equal to the tag, whatever array or expression holds it. **Only the map shape is invisible.** The
     table's cautions about *how to extend* each shape remain true and stay.
2. **`package_check` K-1…K-3 read the manifest as shipped but the tree as committed.** Pre-upload, the clone
   still holds the prior release, so on a correct app-release package all three are red by construction.
   `OPERATIONS.md` L855–875 already records this, calls the split "real and unscoped", and forbids *softening*
   the checks; L913–916 records its cost: control **P29** (a stale manifest) cannot fire against an app release
   because K-1 is already red. **This scope is that unscoped item.**
3. **`package_check` G-1 does not know `handover/`.** For a `KIND: handover` package carrying the workbench
   source in `handover/`, G-1 reports `DangerClose.jsx -> src/DangerClose.jsx` as missing from `github/`
   (measured on the session-1 handover: 38 passed, 1 failed pre-upload; 47 passed, 1 failed post-upload).
   The workbench is *meant* to stay out of `src/` until it ships.
4. **`mk_runfolder.sh` drifts the run folder's `package.json` and `package-lock.json`.** It runs one
   `npm install <packages>` **without** `--no-save` (L101), which rewrites both. G-1 then correctly names them;
   they were reverted by hand at both v5.72 package checks. The header (L30) explains why a *second*,
   `--no-save` install is forbidden: it pruned `jsdom` at v5.67. **Not in `FlawsToFix` or any scope yet.**

## 2 · Site census (by reading the source at `e29a741`)

| Item | File | Sites |
|---|---|---|
| 1 | `qa/tools/vercensus.cjs` | the `walk.simple` visitor and the summary lines |
| 1 | `qa/tools/vercensus_list.cjs` | its per-site listing (same blindness) |
| 1 | `docs/OPERATIONS.md` | the four-shapes table, L744–749 |
| 2 | `qa/tools/package_check.mjs` | K-1…K-3, one block (~L1016–1030) |
| 2 | `docs/OPERATIONS.md` | L855–875 and L913–916, rewritten to describe the new behaviour |
| 3 | `qa/tools/package_check.mjs` | G-1, one loop (~L525–537) |
| 4 | `qa/mk_runfolder.sh` (mode **100755**, kept) | after the install at L101 |
| tests | `qa/t21_tools.mjs`, `qa/tools/package_check_controls.sh` (100755, kept) | new cases below |
| records | `CHANGELOG.md` (ops entry), `TESTING.md` (t21 count), `PROJECT_KNOWLEDGE_INDEX.md` (rows) | — |

`vercensus`, `package_check` and `mk_runfolder` are named across many historical scopes and CHANGELOG entries.
Those are records of past runs and are **not** edited.

## 3 · The fixes

1. **`vercensus`** also visits `Property` nodes whose key is the tag (identifier or string) and reports them
   on a **third line, "keyed registry entries (a judgement)"**, counted in the total. A map entry is a
   judgement, not a mechanical edit: someone must decide its *values* (D-2). `vercensus_list` lists them.
2. **K-1…K-3 read the tree as the package leaves it**: for `CHANGELOG.md`, `src/DangerClose.jsx` and
   `index.html`, the package's `github/` copy if present, else the clone. **Nothing is softened.** A stale
   manifest is still red pre-upload (the package's own new source disagrees with it), post-upload behaviour is
   unchanged (the two copies are identical), and an ops package still reads the clone. The detail line names
   which copy was read.
3. **G-1, under `KIND: handover` only**, accepts a differing `DangerClose.jsx` when a file under `handover/`
   has the **same md5**. Matched by content, never by name. Any other kind is unchanged.
4. **`mk_runfolder.sh`**, after its single install, copies the committed `package.json` and
   `package-lock.json` back over the rewritten ones, then checks the two are byte-identical and `die`s if not.
   `node_modules` is untouched, so no package is pruned.

## 4 · Tests, and a negative control for each

| Item | Test | Negative control (the fix reverted must turn it red) |
|---|---|---|
| 1 | `t21`: `vercensus` on a temporary directory with one of each shape — array ladder, `===` gate, ternary-test chain, **identifier-keyed map, string-keyed map**, and a comment and a template literal that must not count. Exact counts per line | drop the `Property` visitor → the map cases read 0 |
| 2 | `package_check_controls.sh`: the real v5.72 package against the **v5.71** clone (pre-upload shape) → K-1…K-3 **green**; the same package with its manifest's Current table rolled back → K-1…K-3 **red**. **P29 must now fire against an app release** | restore clone-only reads → the correct package goes red again |
| 3 | `package_check_controls.sh`: the session-1 handover → G-1 green; that package with one byte of the workbench changed → G-1 red; the same package relabelled `KIND: ops` → G-1 red | remove the handover arm → the first case goes red |
| 4 | `mk_runfolder.sh` self-check: after the install, the two files equal the repo's, or it dies | remove the copy-back → the self-check dies, naming both files |

Then a **full suite run** (because `mk_runfolder.sh` builds every run folder), `package_check` on the ops
package, and the post-upload four-argument run.

## 5 · Out of scope

- Automating any gate judgement, or shipping a bump script. `vercensus` keeps asserting nothing.
- J-1, J-2, K-4 and K-6, which read the **pool** and are red pre-upload for the same by-construction reason.
  They are not needed once K-1…K-3 are fixed, and the post-upload run still covers them.
- Rewriting historical documents that describe the old behaviour.
- The Maine and Montana work (option 2); that gets its own scope next.

## 6 · Decisions for Steve

| # | Question | Recommendation |
|---|---|---|
| **D-1** | Include item 4 (`mk_runfolder`'s drifting `package.json`), which no register records yet? | **Yes.** It bit both v5.72 checks, and the fix is four lines plus a self-check |
| **D-2** | Count map entries as a **judgement** (a new line, in the total) rather than as mechanical ladder entries? | **Yes.** Each needs its values decided — `PINS` needed "does any figure move?" |
| **D-3** | K-1…K-3: read the package's copy first (§3.2), rather than splitting them into "skip pre-upload / run post-upload"? | **Read the package's copy.** A skip would blind the pre-upload run to a stale manifest; this keeps it sighted and gives P29 back its teeth |
| **D-4** | G-1's handover allowance: by content (md5) and for `KIND: handover` only? | **Yes.** A name-based allowance would let any file called `*WORKBENCH*` through |
| **D-5** | Correct `OPERATIONS.md`'s four-shapes table to say only the map shape is invisible, keeping its extension cautions? | **Yes.** It is a document that disagrees with a measurement |
| **D-6** | Ship this scope **built and retired** in the same ops package, rather than as a scope-only package first? | **Yes.** It is small, no app code changes, and it avoids an I-2 allowlist entry that would live for one package |

## 7 · Build record (2026-09-15) — every figure from command output

**Decisions:** D-1…D-6 all taken as recommended. No app source changed; v5.72 stays current.

| Item | Built | Test | Negative control |
|---|---|---|---|
| 1 | `vercensus.cjs` and `vercensus_list.cjs` visit non-computed `Property` keys; a third line, **keyed registry entries (a judgement)**, counts in the total. At v5.72 `t33` now reads `keyed: 1` and the total **88 → 89** | `t21` gains a shape directory (ladder ×2, gate, ternary-test chain, identifier-keyed map, string-keyed map, five decoys): **t21 56 → 64, 0 failed** | the v5.72 `vercensus.cjs` restored → **61 passed, 3 failed** (both map cases and the summary) |
| 2 | K-1…K-3 read the package's `github/` copy first, else the clone; each detail line names the copy | `package_check_controls.sh` **P56** (correct app release, prior clone → K quiet) | **P57** (manifest not rolled, prior clone → K-1 fires). The v5.72 `package_check` on the same prior clone reds K-1…K-3 on the correct package |
| 3 | G-1 accepts a differing `DangerClose.jsx` only under `KIND: handover` and only if a file under `handover/` has the same md5 | **P58** (the session-1 handover → G-1 quiet), **P61** (workbench renamed → still quiet: by content) | **P59** (one byte of drift → fires), **P60** (same package as `KIND: ops` → fires) |
| 4 | `mk_runfolder.sh` restores the committed `package.json`/`package-lock.json` after its single install, and dies if they still differ | a run folder built with it: both files byte-identical to the repo | copy-back removed in a throwaway copy → both files differ, and both are named |

**Diff scope, checked:** `package_check.mjs` changes only in G-1 (L530–550) and K (L1015–1051); B-2 is untouched.

**The control harness, run in both phases** (v5.72 package; `PRIOR_CLONE` = repo `5fe06a9`, `HANDOVER_PKG` =
the session-1 handover, pool = the live pool): **54 behaved as designed in each run, and each run missed
exactly one control — the other phase's.** `P17` (E-1b) fires only against the prior clone; `P48` (B-2)
only against the post-upload clone. Both tools, old and new, behave identically on `P17`. That split
predates this scope; it is recorded in `OPERATIONS.md` (run the harness twice), **not fixed here**. `P15`
skipped in both (no ops package passed).

**`OPERATIONS.md`:** the four-shapes table corrected (D-5); the K-1…K-3 paragraphs rewritten for the new
behaviour, with the old text's history kept; the run-twice note added.
