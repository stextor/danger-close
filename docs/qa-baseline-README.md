# Danger Close — regression baseline (t1–t6) + harness

The original t1–t6 harness was lost with its build-session sandboxes; this suite replaces it
and lives in the repo so that can never happen again.

## Methodology
Authored fresh, then **proven green against pristine v5.9.2** (md5 a1f0d4a76565c63494628e957c66ff91)
before being pointed at later builds — so "green" means "matches the shipped baseline," not
"matches the author's guesses." Version-conditional expectations are marked by version.
DOM signature strings were grounded against a captured DOM (cap_tabs.mjs), not guessed.

## The active comparison pair (re-baselined every release)
The suite compares the **immediately-prior release** to the **current release**, and rolls
forward each ship. As of v5.10.2 the pair is **v5.10.1 → v5.10.2**.

There is no permanent floor: the MC-parity guardrail (`t2 compare`, 9/9 since the E-15 addendum) proves release over
release that the engines haven't drifted across each boundary, which is what a fixed old
baseline would otherwise be guarding.

## Setup (from a folder containing v5101.jsx, v5102.jsx and DangerClose.jsx next to qa/)
`DangerClose.jsx` is the canonical current source (t8 reads it directly); `v5102.jsx` is a
copy of it, and `v5101.jsx` is the prior release, recoverable from its git tag.

1. `npm i esbuild react react-dom d3 xlsx mammoth jsdom`
2. `./mk_testable.sh v5101 && ./mk_testable.sh v5102` (splices shim.txt, builds qa/app_*.mjs)
3. Build DOM bundles, for each of v5101 / v5102:
   `npx esbuild qa/dom_entry_<ver>.jsx --bundle --format=cjs --platform=browser --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_<ver>.cjs`
   where `dom_entry_<ver>.jsx` imports `{ __g }` from `./app_<ver>.jsx` and exposes
   `window.__mount` / `window.__g`.

If `mk_testable.sh` lost its executable bit in transit, run `chmod +x qa/qa-baseline/*.sh`
or invoke it as `bash qa/qa-baseline/mk_testable.sh`.

## Running
`./run_all.sh v5101` · `./run_all.sh v5102` · `./run_all.sh parity`

Counts at the v5.10.2 ship: v5.10.1 254 · **v5.10.2 267** · parity 8 (v5.10.1 → v5.10.2) — all
green. With the feature suites (t7 37 · t8 27 · t9 14), **353 checks verify the build**.
(Frozen-leg counts rose from the published 248/246: the suite grew at v5.10.2 — two t1
version-site assertions on every leg, and in t5 the all-keys seed check plus three dated
pre-fix pins for the B-2 wipe defect.)
Override the parity pair with `node t2_engines.mjs compare <prior> <current>`.

### Retired legs
The **v5.10 leg (252 checks under the current suites) and v5.9.2 leg (234) are retired history** — it is no longer part of the active pair.
The suites still understand both version tags, and their `dom_entry_*.jsx` files are kept, but
`v510.jsx` and `v592.jsx` are intentionally not committed (local-only files the maintainer
supplies — v510 recoverable from its git tag). To run a retired leg, place its `.jsx` in the
run-folder root yourself, then `./mk_testable.sh <tag> && ./run_all.sh <tag>`. A retired-leg
failure straight after a clone almost always means that file is missing, not a real regression.

## Feature suites (t7–t9, in qa/ one level up)
Their build inputs are derived from the current leg's artifacts:
`cp app_v5102.mjs app_testable.mjs` (t7/t8) and `cp dom_v5102.cjs dom_bundle.cjs` (t9) —

**t31 needs `METHODOLOGY.md` at the run-folder root (added v5.49).** It is the first suite to read
that file, so the flat run folder never had to carry it. t31 exits loudly if it is missing rather than
skipping — a skipped check that reports green is the exact defect t31 exists to prevent. Also note
`cp <current>.jsx DangerClose.jsx` at the run-folder root (t8, t14, t16, t19, t22), and that **t19 must
be run from `qa/`** — it opens `../DangerClose.jsx`, a path relative to the working directory.

`dom_entry_v5102.jsx` additionally exposes `window.__test` for t9 (baseline suites ignore it),
and `shim.txt` exports `__test` alongside `__g` (guarded, so older splices still load).
t8 also reads `../DangerClose.jsx`, the canonical current source, from the run-folder root.

## Portability (fixed at v5.10.1)
`mk_testable.sh` and t6's subprocess previously hardcoded absolute paths from the original
build session and would fail anywhere else — including the clean-clone ship verification.
Both now resolve relative to their own location, so the suite runs from a fresh clone.

## Two hard-won environment facts (encoded in the suites, do not "simplify" away)
- **Seed Math.random BEFORE importing the app bundle.** d3-random captures Math.random at
  module load; a post-import override silently leaves the MC's noise draws on the real RNG
  and destroys determinism.
- The CJS DOM bundle runs in Node scope: stub `globalThis.URL.createObjectURL`, not just
  `window.URL`, or the backup-export capture never fires.

## KNOWN DEFECT pins
Three dated pins were opened at the v5.10 baseline rebuild (t3 ACA cliff funding-sale MAGI;
t5 Clear All Data leaves the API key and skips the landing return; t6 phantom Spouse-B card
for single filers) and **flipped at v5.10.1**. A fourth was pinned and fixed at **v5.10.2**
(audit Finding B-2, found 2026-08-07): `clearStorage()` deleted only 10 of the 13 STORAGE_KEYS,
leaving `checklist` (third-party contact PII + notes), `simple`, and `ssCut` behind after
"delete everything." The current leg asserts the fixed behavior — for B-2, as a **loop over
the STORAGE_KEYS map** (every key seeded before the wipe, every key asserted absent after,
and the seeded contact PII proven gone from all surviving storage), so a wipe list that
drifts out of sync with the key map fails loudly forever. Frozen prior legs keep every dated
pin as pre-fix history — every leg green and honest. Details in CHANGELOG v5.10 / v5.10.1 /
v5.10.2. The pattern stands for future defects: pin today's wrong behavior with a date, flip
when fixed.
