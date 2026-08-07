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
forward each ship. As of v5.10.1 the pair is **v5.10 → v5.10.1**.

There is no permanent floor: the MC-parity guardrail (`t2 compare`, 8/8) proves release over
release that the engines haven't drifted across each boundary, which is what a fixed old
baseline would otherwise be guarding.

## Setup (from a folder containing v510.jsx, v5101.jsx and DangerClose.jsx next to qa/)
`DangerClose.jsx` is the canonical current source (t8 reads it directly); `v5101.jsx` is a
copy of it, and `v510.jsx` is the prior release, recoverable from its git tag.

1. `npm i esbuild react react-dom d3 xlsx mammoth jsdom`
2. `./mk_testable.sh v510 && ./mk_testable.sh v5101` (splices shim.txt, builds qa/app_*.mjs)
3. Build DOM bundles, for each of v510 / v5101:
   `npx esbuild qa/dom_entry_<ver>.jsx --bundle --format=cjs --platform=browser --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_<ver>.cjs`
   where `dom_entry_<ver>.jsx` imports `{ __g }` from `./app_<ver>.jsx` and exposes
   `window.__mount` / `window.__g`.

If `mk_testable.sh` lost its executable bit in transit, run `chmod +x qa/qa-baseline/*.sh`
or invoke it as `bash qa/qa-baseline/mk_testable.sh`.

## Running
`./run_all.sh v510` · `./run_all.sh v5101` · `./run_all.sh parity`

Counts at the v5.10.1 ship: v5.10 246 · **v5.10.1 248** · parity 8 (v5.10 → v5.10.1) — all
green. With the feature suites (t7 37 · t8 27 · t9 14), **334 checks verify the build**.
Override the parity pair with `node t2_engines.mjs compare <prior> <current>`.

### Retired legs
The **v5.9.2 leg (234 checks) is retired history** — it is no longer part of the active pair.
The suites still understand the version tag, and `dom_entry_v592.jsx` is kept for it, but
`v592.jsx` is intentionally not committed (it is a local-only file the maintainer supplies).
To run that leg, place `v592.jsx` in the run-folder root yourself, then
`./mk_testable.sh v592 && ./run_all.sh v592`. A v592-leg failure straight after a clone almost
always means that file is missing, not a real regression.

## Feature suites (t7–t9, in qa/ one level up)
Their build inputs are derived from the current leg's artifacts:
`cp app_v5101.mjs app_testable.mjs` (t7/t8) and `cp dom_v5101.cjs dom_bundle.cjs` (t9) —
`dom_entry_v5101.jsx` additionally exposes `window.__test` for t9 (baseline suites ignore it),
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
for single filers) and **flipped at v5.10.1**: the current leg asserts the fixed behavior as
positive assertions, while frozen prior legs keep the dated pins as pre-fix history — every
leg green and honest. Details in CHANGELOG v5.10 / v5.10.1. The pattern stands for future
defects: pin today's wrong behavior with a date, flip when fixed.
