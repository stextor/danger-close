# SCOPE — the pool keeps ONE source; the prior build comes from the repo's history by its recorded md5

**FULFILLED — shipped in the ops package of 2026-09-28 (second).** D-1 to D-4 all as recommended (§6). See §8. Retained as the record. A **tooling/ops** change: no app change
(v5.80 stays current, source `7a04dadb86bdef6534bdc03a1d87e8d8`). Repo `db370d5`; pool **111 files, 5.2 MB** after the ops
package of 2026-09-28 (verified post-upload: `package_check` 49 / 0 / 0, J-5 confirms the 24 retirements).

---

## 1 · Premise — measured

- **The pool keeps two full copies of the app source** — current and prior, 1.3 MB each, **about half the pool** — because
  `mk_runfolder.sh` takes the prior build's source as a file path, and the only place a session had it was the pool
  (L20–78: *"The prior leg's .jsx comes from the knowledge pool"*).
- **The prior source is always in the repo's history, and the manifest already records its md5** (the Prior build table).
  Measured on a fresh clone: it is **not shallow**; walking `git log -- src/DangerClose.jsx` for the manifest's prior md5
  (`b06841a0…`) found it **2 commits back, in 71 ms, byte-identical** to the pool's `DangerClose-v5_79.jsx`.
- So the prior leg can be **resolved from the repo by md5** and refused on any mismatch — which is stronger than today's
  path argument, which accepts whatever file it is handed.

**Saving: ~1.3 MB now (5.2 MB → ~3.9 MB), and one fewer 1.3 MB file per release forever.**

## 2 · Site census

| Site | Today | Change |
|---|---|---|
| `qa/mk_runfolder.sh` (L20–78) | 3rd argument = prior source path (from the pool) | Default: resolve the prior from git by the manifest's Prior md5; refuse a shallow clone, a missing md5, or no match. D-1 on keeping the path form |
| `package_check` **J-3** (L983–985) | "the pool holds exactly **two** source legs (a rotation is TWO deletes)" | **exactly one** — the Current table's |
| `package_check` **J-4** (L987) | "exactly two dom entries" | D-2 |
| `package_check` **K-4 / K-5** (L1121–1133) | both tables' sources are pool files with matching md5s | Current: unchanged. Prior: **resolved in the clone's history** by md5 (a new check, needs the clone argument) |
| `package_check` **K-6** (L1134–1137) | "the pool's two legs ARE the two the tables name" | the pool's one leg IS the Current table's |
| `package_check_controls.sh` | **no control names J-3, J-4, K-4, K-5 or K-6** | a coverage gap this change must close: one FIRE control per changed check |
| Manifest Prior table | "Source file in knowledge: `DangerClose-v5_79.jsx`" | "*repo history — commit `<hash>`, found by md5*" |
| OPERATIONS §A (freshness), §G (storage), §L (rotation, packaging) | describe the "versioned-source pair" and a two-delete rotation | one source in the pool; the prior read with `git show <commit>:src/DangerClose.jsx`; a rotation deletes ONE source |

Rotation logic keyed on the `DangerClose-v5_NN.jsx` name (L161, L243, L470, L510, L526) is unaffected: it asks whether a file
IS a source, not how many there are. Verified at the build by running every package through the changed checks.

## 3 · Tests

- **`mk_runfolder.sh`'s git mode, with negative controls:** resolves the right prior (byte-compared); **refuses** a shallow clone,
  a manifest md5 present in no commit, and a manifest with no Prior table — each by exit code and message, never silently
  falling back.
- **`package_check`:** the changed checks green on a real package pre- and post-ship; **FIRE controls** in
  `package_check_controls.sh` for J-3 (a second source left in the pool), K-6 (the pool's leg is not the Current table's), and
  the new prior-in-history check (a Prior md5 that no commit holds).
- The full app suite from a run folder built in git mode, compared line for line with the last run: the prior leg is the same
  bytes, so every count must be identical.

## 4 · What a session does differently

- **Building:** `./qa/mk_runfolder.sh v580 v581` — no third argument; it prints the commit it resolved the prior from.
- **Reading the prior source:** `git show <commit>:src/DangerClose.jsx` (the commit is in the manifest's Prior table).
- **Releasing:** the pool rotation deletes **one** file (the outgoing current source becomes history, not a pool file).

## 5 · Folded in

Nothing else. The manifest's superseded history (~130 KB, 30 open-item mentions to trace) stays a separate, later piece.

## 6 · Open decisions for Steve

**D-1 · Keep the path form as a fallback?** (a) **Git by default; a path still accepted but verified against the manifest's
Prior md5 and refused on mismatch** — so a session without history (GitHub unreachable) can still work from an uploaded
file; or (b) git only. **Recommend (a):** the md5 check makes the fallback exactly as safe as the git path.

**D-2 · The prior dom entry.** `dom_entry_vNNN.jsx` files are ~1 KB; `mk_runfolder.sh` takes them from the repo, not the pool.
(a) **The pool keeps only the current one too** (J-4 → exactly one) — one rule, "one leg in the pool"; or (b) keep two.
**Recommend (a)** for consistency; the space saved is negligible either way.

**D-3 · When the prior source leaves the pool.** (a) **In this package** — `DangerClose-v5_79.jsx` (and, with D-2 a,
`dom_entry_v579.jsx`) retired now, declared `RETIRE:`; or (b) at the next app release. **Recommend (a):** the 1.3 MB is
the point, and the checks that would object are the ones this package changes.

**D-4 · Package kind.** An **ops package** (no app change, no version bump) carrying the tool changes, their tests and
controls, and the OPERATIONS/manifest edits. **Recommend** yes.

## 7 · Out of scope

The manifest's history archive; un-pooling the test suites (1.2 MB — sessions read them from the pool as working context);
F-12, F-3/F-4, C-13.

## 8 · Build record

- **The lookup goes by version, not by table.** Mid-build the prior leg is the release still in the manifest's CURRENT table;
  after the roll it is in the PRIOR table. `mk_runfolder.sh` maps the prior tag to its version (v580 → v5.80) and takes the md5
  from whichever table names it — the scope's "the manifest's Prior md5" would have failed every build.
- **Measured:** resolved v5.79 from commit `5c2c2ac`, byte-exact; a wrong file, an unrecorded version and a shallow clone were
  each refused (the first attempt at the shallow case passed the output folder as the prior file — refused as a file, never
  reaching the shallow check; re-run correctly). These five cases are `controls_runfolder_prior.sh`.
- **P68–P71 build the post-upload pool state first**, because before the upload the pool still holds two sources and J-3/K-6
  are red at baseline — a control planting a second source would have been "caught" by a check already failing.
- **A contradiction found in OPERATIONS:** "What does NOT rotate" (2026-09-03) still said the pool keeps every `controls_v*.sh`,
  which the previous ops package overrode without seeing it. Reconciled in the text; reported to Steve.

