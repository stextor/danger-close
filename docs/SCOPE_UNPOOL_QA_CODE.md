# SCOPE — un-pool the test and harness code (project knowledge keeps the source, the documents and the build scaffold)

**FULFILLED 2026-10-19** — built the same day by the second ops package (`danger-close-ops-2026-10-19-unpool-qa`); build record §6.
Steve took DC-1 to DC-4 as recommended, all (a). ⚠ **One premise was false and was corrected before the build** (§6): DC-3 (a) assumed
`TESTING.md` describes every suite; it stopped at `t30`. Steve then chose to move every departing file's description to `TESTING.md`.
*(Drafted 2026-10-19 as OPEN, decisions DC-1 to DC-4 for Steve.)* An ops change: no app source, suite logic or figure changes; `package_check`,
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
⚠ *Corrected at the build: the premise of (a) — "`TESTING.md` (pooled) describes every suite" — was false (§6). Steve chose to move every
departing file's description, verbatim, to a per-file index in `TESTING.md`, which is (b) without new prose.*

**DC-4 · When.** (a) **Its own ops package, before v6.21** — the pool then has room for the next release. (b) Fold it into v6.21.
**Recommend (a):** a release should not carry a 125-file delete list beside its own changes.

## 6 · Build record

**Built 2026-10-19 against v6.20** (source `8db224990e86ddcbe2180f96b6a52889`, built `2a0b45ea9c1425752ff8918862e15202`), on the tree at
`26e33be` with the pool as the listing showed it after the morning's trim (142 files, 1,816,951 of 2,000,000; every pooled file byte-identical
to the clone).

**Decisions:** DC-1 (a), DC-2 (a), DC-3 (a), DC-4 (a) — Steve, 2026-10-19, *"Recommended"* on all four.

**What left.** 126 files — every pooled file whose repo path is under `qa/` (§1 estimated ~125): 2,737,596 characters. The pool keeps 16:
the source, eleven documents (CHANGELOG, METHODOLOGY, TESTING, README, OPERATIONS, the manifest, ARCHITECTUREIssues, MissingFeatures,
UsabilityFlaws, FlawsToFix-v5_73-Phase2, SCOPE_STANDING_AUDIT) and the four scaffold files.

**Premises corrected at the build — owned.**
1. **§5 DC-3's premise was false.** It said `TESTING.md` "describes every suite"; its per-suite table stops at `t30`, and `t31`–`t83` were
   described only in the hash table DC-2 archives. An independent reader found it; the build stopped and asked. Steve: *"Move them to
   TESTING"* — every departing file's hash-row description (118: 83 suites, 35 harness and tool files) moved verbatim to `TESTING.md`,
   *Every suite and harness file*. That is about 53,000 characters back into the pool, not the ~39,000 quoted for the suites alone: the 35
   tool rows came too, because several carried rules nothing else held (`runsuite.sh`'s tally, `t45`'s fail-never-skip, `t41`'s AMT guard).
2. **§0 called it a "test-hash table"; it also held the rows of ten files that stay pooled** (six documents, four scaffold files), which
   K-8 checks and E-1b uses to resolve `index.html` and `README.md`. Those rows were kept, verbatim, in a new *Pooled file hashes* section with
   the D-5 count block (which `row_census.cjs` reads); the rest of the section moved verbatim to `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md`.
3. **§0's list of readers missed seven controls** that drew targets from pooled qa files: in `package_check_controls.sh`, P32 and P33
   (selectors widened to the files that remain), P43 (named `t1_units.mjs`'s row; now P32's derived row — found running the controls), P44/P45 (retired: no `.py` file can be pooled), P71 (re-pointed from J-4 to J-6), P72
   (retired: no renamed pool file remains); and **C2 of `controls_manifest_rows.py`**, which named `sel_census.cjs` and failed against the
   post-upload pool ("anchor did not match") — found by the package's independent review, now derived from the pool. §4's stop condition
   reads "any check … found to read a pooled qa file": these are controls choosing targets, retargeted like P32/P33, not gates whose
   meaning depended on the pool, so the build continued and records it here.
4. **Decision D-3 (which pooled files carry a hash row) is a rule in force** and was in the archived section; it is restated in the
   manifest's *Pooled file hashes* (review finding).

**The §G trace (§1 item 7).** The author read the keyword hits in all 126 files' comments; six independent readers then read every file in
full (about 455,000 characters each) and checked each candidate against the sixteen staying documents. Forty-odd orphans: the traps and
standing rules went to OPERATIONS **§C4**, the open threads to `ARCHITECTUREIssues.md` **E-31** (ten, and a list of stale statements);
one contradiction was fixed in place (`TESTING.md`'s run notes said `t11`–`t16` take no argument). The hash table's prose was traced too:
its open threads are E-31 (d) and (f), and (c) came from a row. The readers found nothing that needed a decision before the move.

**Tooling.** `package_check`: **B-4** (no `qa/` file in `knowledge/`), **J-6** (no `qa/` file in the pool post-ship; pre-ship, every one
still there declared `RETIRE:`), J-4 retired, K-12 reads *Pooled file hashes*, the OPEN-allowlist entry for this scope removed.
`package_check_controls.sh`: P76–P78 new, P71 re-pointed, P32/P33/P43 retargeted, P44/P45 and P72 retired with their reasons printed.
`controls_manifest_rows.py`: C2's target derived from the pool.

**Independent review of the package, before it was cut:** six findings it rated high (C2 above; D-3; live manifest lines still describing
pooled qa files; eight rows pointing to a description in the wrong place; two stale line citations and a wrong `t15` claim in §C4; the
verification not yet recorded) and the medium and low ones, all fixed in the package.

**Verification:** the package's `MANIFEST.txt` and the CHANGELOG entry carry the results.
