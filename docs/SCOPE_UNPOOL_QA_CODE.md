# SCOPE — un-pool the test and harness code (project knowledge keeps the source, the documents and the build scaffold)

**OPEN — drafted 2026-10-19, decisions DC-1 to DC-4 for Steve.** An ops change: no app source, suite logic or figure changes; `package_check`,
its controls, OPERATIONS and the manifest change. Repo-only. Steve, 2026-10-19: *"Let's fix the size of the project knowledge pool"* — then
chose *"Archive now, scope the big move"*: the archive half shipped as the ops package of 2026-10-19; this is the big move.

---

## 0 · Premise (measured 2026-10-19, after v6.20 shipped)

- **The pool is near its cap.** The Projects listing reported `knowledge_size` **1,920,823 of 2,000,000** with 142 files after v6.20. The
  listing does not name the unit; it is about 0.345 per character across this pool (5,564,522 characters), so the estimates below scale by
  characters — an approximation, since code and prose may count differently.
- **Where it goes** (characters, from the post-ship pool assembled for `package_check`): the app source 1,428,374 (26%, must stay — §G keeps
  exactly one); **the 83 suites `t1`–`t83` 2,257,684 (41%)**; **42 other qa files** — tools, harness, oracles, fixtures, `package_check` and its
  controls — about 462,000 (8%); twelve documents 1,399,868 (25%); the four-file build scaffold 9,457.
- **The archive package of 2026-10-19 recovers about 319,000 characters, net** (estimate: ~90.5% of the cap after it). A release adds roughly
  25–35 thousand units (`t83` alone is ~20 thousand), so that buys about three to five releases.
- **No build can run from the pool.** `qa/mk_runfolder.sh` (the only supported way to build a run folder since v5.68) is run from the root
  of a clone and reads the repo's tree — `src/`, `qa/qa-baseline/`, `qa/tools/fixture/` — which the flat pool does not have. Its prior leg
  comes from git history (it refuses a shallow clone in that mode) or from a `.jsx` passed in and checked by md5; the prior source has not been
  pooled since 2026-09-28. Every session that runs the suite therefore already works from a clone, where every qa file is present and current.
  *(Corrected before this scope shipped: the first draft said the tool refuses a shallow clone outright.)* The pooled copies are read for three
  things only: §A2's freshness comparison (pool vs clone — which exists *because* pooled copies drift), the manifest's 114,000-character
  test-hash table (§A2's fallback "when there is no network", while `mk_runfolder.sh` cannot run without the network anyway), and reading a
  test in a chat-only session with no clone.
- **What reads the pooled qa files** (`package_check.mjs`, by check ID): **E-1** (both-destination files identical), **E-1b** (a knowledge/
  file that differs from the repo also ships to github/), **F-2** (every replaced pool file named for deletion), **J-1 / J-2** (every
  knowledge/ file reached the pool, none stale), **J-4** (exactly one `dom_entry`), **K-8** (hashed manifest rows match the pool), **K-9**
  (every pool file named in the manifest), **K-12** (every manifest row names a pool file or says repo-only). `package_check_controls.sh`
  plants defects into pooled qa files for several of these. OPERATIONS §A2, §G and §L describe the pooled suite; `PROJECT_KNOWLEDGE_INDEX.md`
  carries the hash table and ~120 rows; the project instructions name the baseline suites (`t1`–`t6`, *"t1's STATIC checks"*) but not
  where they live — a sentence to check at the build. **J-5** (a `RETIRE:`-declared file has left the pool) matters for a 125-file delete list.

## 1 · The change (recommended options)

1. **What leaves the pool (DC-1 (a)):** every file from `qa/` — the 83 suites, `shim.txt`, `runsuite.sh`, `mk_runfolder.sh`, `env_dom.mjs`,
   the fixtures, the tools (`package_check.mjs` and its controls included), the oracles and probes, and the `dom_entry_*` shim. About
   2,720,000 characters (~940 thousand units): the pool would go from ~90% to **~43%** of its cap. **Stays:** the source, the twelve
   documents, the four scaffold files.
2. **§L packaging:** a release's `knowledge/` half holds the source and the documents it changes; every qa file ships in `github/` only.
   One rotation leg goes away (`dom_entry_*`).
3. **`package_check`:** J-4 retires (no dom entry in the pool); a new check **B-4** fails a package that ships any `qa/` file to
   `knowledge/`; E-1b, F-2, K-8, K-9 and K-12 keep working on what remains; the manifest's hash table and its K-8 rows go (DC-2).
4. **OPERATIONS:** §A2's freshness check becomes "hash the source; the suite is current in the clone by construction"; §G's pool list and
   §L's packaging rules are rewritten; the traps that only made sense for pooled tests are marked historical, not deleted.
5. **The manifest:** the *Test and harness file hashes* section moves verbatim to a repo-only archive (DC-2 (a)); qa rows that remain are
   marked *repo-only* in one edit (K-12's vocabulary).
6. **One ops package, delete-first:** its delete list names all ~125 files, each declared with a `RETIRE:` line for J-5; the post-upload
   check counts the pool from the listing.
7. **The §G trace, for code.** Open threads also live in suite comments — `t14`'s *"Recorded rather than fixed"* presence checks (now
   `ARCHITECTUREIssues.md` E-30 (g)), `t19`'s CONTRACT note. Before anything leaves, every qa file's comments are read for open threads and
   standing rules, each re-homed to a pooled register or OPERATIONS in the same package, and the trace gets an independent second read (the
   2026-10-11 and 2026-10-19 trims each needed one).

## 2 · Tests and controls

- `package_check_controls.sh` gains a control for B-4 (a suite planted in `knowledge/` must fire) and loses the controls that planted
  into pooled qa files (each retired with its reason, not deleted silently); every remaining control must still behave as designed.
- `t21` (the tools suite) re-run; `controls_manifest_rows.py` and `row_census.cjs` re-run, since they read the manifest.
- The full suite is **not** affected (no suite reads the pool) — run once from the packaged copies anyway, as §L requires for any package
  that touches `qa/`.
- Post-upload: `package_check` with all four arguments; the pool listing must show only source, documents and scaffold.

## 3 · Out of scope

The app source and every figure; the suites' logic; the documents' content beyond the rules that describe the pool; whether `METHODOLOGY.md`
or `OPERATIONS.md` should themselves be split (each is large but read on every build).

## 4 · Stop conditions

STOP and report if any check other than those named in §0 is found to read a pooled qa file; if the §1 item 7 trace finds an open thread
that cannot be re-homed without a decision; if `package_check_controls.sh` cannot be made
to behave as designed without weakening a check; or if a chat-only workflow Steve relies on is found to need pooled tests (DC-3).

## 5 · Decisions for Steve

**DC-1 · What leaves.** (a) **All qa code** — suites, tools, harness (~43% after). (b) The 83 suites only; the 42 tools and harness files stay
(~51%). (c) Only suites whose release pair is three or more releases old (~60–70%, and a rule to apply every release).
**Recommend (a):** one rule ("qa/ is repo-only"), the biggest saving, and the tools are no more readable from the pool than the suites are
runnable from it.

**DC-2 · The manifest's test-hash table** (114,000 characters). (a) **Archive it verbatim** (repo-only) and drop K-8's qa rows — the
clone is the authority for qa files. (b) Keep it, every row marked repo-only.
**Recommend (a):** a hash table for files the pool no longer holds is the drift §A2 was written to catch.

**DC-3 · Chat-only sessions** (claude.ai with the project, no clone) lose the ability to open a test file. (a) **Accept it**: `TESTING.md`
(pooled) describes every suite, and the repo is public for the rest. (b) Add a pooled one-line-per-suite index to `TESTING.md` first.
**Recommend (a)**, with (b) worth doing if you often ask about tests outside a build session — you would know better than I would.

**DC-4 · When.** (a) **Its own ops package, before v6.21** — the pool then has room for the next release. (b) Fold it into v6.21.
**Recommend (a):** a release should not carry a 125-file delete list beside its own changes.

## 6 · Build record

*(Filled at the build.)*
