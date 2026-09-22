# SCOPE — package_check checks the two declarations a package relies on

| | |
|---|---|
| Status | ☑ **RETIRED — FULFILLED 2026-09-22 in the ops package that adds it (D-5); §6 is the build record. All five decisions taken as recommended, approved by Steve 2026-09-22.** |
| Build under scope | **v5.74** — source `1ff04dee1b43b20880a8500ab9645f02`, built `index.html` `4e7532a4670f667d3ad53c580f278d7f`, repo `d0b9305` |
| Kind | ops — tooling and documents only; no app source, no version bump |

## 1 · Premise (verified against source, 2026-09-22)

Two misses at the v5.74 ship. Both were omissions **in the package**, not defects in the tools:

- **No `RETIRE:` line.** The package's own manifest listed `SCOPE_TAXES_DRAWDOWN.md` as *"un-pooled — delete, do not
  re-upload"*, but `MANIFEST.txt` carried no `RETIRE: SCOPE_TAXES_DRAWDOWN.md`. `J-5` confirms a retirement only for a
  declared name, so it printed *"no RETIRE: lines in MANIFEST — nothing leaves the pool"*. The scope stayed in the pool
  (124 files against the manifest's 123) and was found by counting files by hand. **Nothing gated it.**
- **No `chmod` line.** `qa/tools/controls_v574_c8.py` was new and began with a shebang; `COMMIT_MESSAGE.txt` carried no
  `git update-index --chmod=+x` line for it — the convention `package_check`'s G-3 notes and OPERATIONS §L already
  record. `G-3a` reads only tracked files, so it could not see the file before upload; after upload it went red, and the
  fix took a follow-up commit (`d0b9305`).

⚠ **This was first framed, in chat, as two MISSING checks, and that was wrong.** Reading the source showed `J-5` and the
chmod convention already exist. The real gap is narrower: nothing checks, **before upload**, that a package made the
declarations those rely on. A third item raised at the same time — README-FIRST asking for "one commit" — was the
session's own wording, not a project rule; several commits are fine, and it needs nothing.

## 2 · Site census

- `qa/tools/package_check.mjs` — section C (new **C-7** after C-6) and G-3 (new **G-3c** after G-3b). Ids checked free
  first: C-1…C-6 and G-3a/G-3b existed.
- `qa/tools/package_check_controls.sh` — new **P62–P65** and a totals line, before the final exit.
- `docs/OPERATIONS.md` — §L's `J-5` paragraph, its upload/modes paragraph, and the `PRIOR_CLONE`/`HANDOVER_PKG` line.
- `PROJECT_KNOWLEDGE_INDEX.md` — the rolled rows, this scope's row, the retirement block.
- **No app source and no suite:** no file in `qa/*.mjs` or `qa/qa-baseline/*.mjs` references `package_check`.

## 3 · The checks

- **C-7.** Rows in the retirement block(s) **new to this package** — heading lines absent from the committed manifest —
  that leave **without a replacement** (no `knowledge/` copy; rotation legs excluded) must each have a `RETIRE:` line in
  `MANIFEST.txt`. Informational when nothing is judged; skipped, and said so, with no committed manifest to compare.
- **G-3c.** Every `github/` file not tracked in the clone whose first line starts `#!` must be named on a
  `git update-index --chmod=+x` line in `COMMIT_MESSAGE.txt`. Informational when there is none.

## 4 · Tests

- **Historical witness.** The v5.74 package against its prior clone (`ef52957`): `C-7` names `SCOPE_TAXES_DRAWDOWN.md`
  (1 judged) and `G-3c` names `qa/tools/controls_v574_c8.py` (1 new). Against the post-upload clone (`d0b9305`): both
  informational.
- **Controls P62–P65**: P62 plants an undeclared retirement (C-7 must fire); P63 declares it (must be silent, and must
  show it judged); P64 plants a new shebang file (G-3c must fire); P65 adds its chmod line (silent, judged). Each is
  judged by check id **and** planted name, so all four stay valid against any package and either clone.

## 5 · Decisions (taken as recommended; approved 2026-09-22)

- **D-1** Rotation legs are excluded from C-7: `J-3`/`J-4` own them, and two gates doing one job drift apart.
- **D-2** "This package's block" means headings absent from the committed manifest. Post-ship none is new and C-7 says
  so; `J-5` does the post-ship half.
- **D-3** G-3c is pre-upload by construction — post-ship the file is tracked and `G-3a` applies — and the declaration
  lives in `COMMIT_MESSAGE.txt`, the existing convention.
- **D-4** The controls judge by id and planted name; the harness's shared id pattern cannot read `G-3c` and is left alone.
- **D-5** Written, built and retired in one ops package, repo-only — the precedent of `SCOPE_TOOLING_GAPS_V572.md`.

**Out of scope:** `J-5` itself; a reverse check that every `RETIRE:` line appears in a retirement block; any single-commit
rule; the shared id pattern.

## 6 · Build record

- **Harness, post-upload clone** (`d0b9305`; `PRIOR_CLONE=ef52957`; pool given): 54 behaved as designed, 1 did not, 2
  skipped. The miss is `P17`, which fires only before upload (§I records it); the skips are `P15` (no ops package given)
  and `P58`–`P61` (no unpacked `KIND: handover` package). **P62–P65 all behaved.**
- **Harness, prior clone:** first run (ops package given, so `P15` runs): 54 behaved as designed, 2 did not, 1 skipped.
  One miss was `P48`, which fires only after upload (§I). **The other was a real finding, `P55`:** `C-7`'s first failure
  text read *"undeclared, so J-5 cannot see them"*, and `P55`'s silent half judges by the substring `J-5` in any failing
  line, so `C-7` correctly firing on the real v5.74 omission tripped it. Against the post-upload clone `C-7` is quiet,
  which is why the first phase missed it. **The wording changed; the check did not.**
- **Re-run in both phases with the final `package_check`:** post-upload clone 55 behaved as designed, 1 did not (`P17`),
  1 skipped (`P58`–`P61`); prior clone 55, 1 (`P48`), 1 (`P58`–`P61`). Each phase's one miss is the other phase's
  control, as §I records. `P15`, `P55` and `P62`–`P65` behaved in both.
