# Danger Close — rebuilt regression baseline (2026-08-06)

The original t1–t6 harness (597 checks) was lost with its build-session sandboxes; this
suite replaces it and is designed to live in the repo so that can never happen again.

## Methodology
Authored fresh, then **proven green against pristine v5.9.2** (md5 a1f0d4a76565c63494628e957c66ff91)
before being pointed at v5.10 — so "green" means "matches the shipped baseline," not
"matches the author's guesses." Version-conditional expectations are marked V510/V592.
DOM signature strings were grounded against a captured v5.9.2 DOM (cap_tabs.mjs), not guessed.

## Setup (from a folder containing v592.jsx and v510.jsx next to qa/)
1. `npm i esbuild react react-dom d3 xlsx mammoth jsdom`
2. `./mk_testable.sh v592 && ./mk_testable.sh v510` (splices shim.txt, builds qa/app_*.mjs)
3. Build DOM bundles: `esbuild qa/dom_entry_<ver>.jsx --bundle --format=cjs --platform=browser --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_<ver>.cjs`
   where dom_entry_<ver>.jsx imports `{ __g }` from `./app_<ver>.jsx` and exposes `window.__mount` / `window.__g`.

## Running
`./run_all.sh v592` · `./run_all.sh v510` · `./run_all.sh v5101` · `./run_all.sh parity`
Counts at the v5.10.1 ship: v5.9.2 234 · v5.10 246 · **v5.10.1 248** · parity 8 (v5.10 → v5.10.1) — all green.
The suite re-baselines each release: parity compares the immediately-prior release to the
current one (override with `node t2_engines.mjs compare <prior> <current>`).

## Feature suites (t7–t9, in qa/ one level up)
Their build inputs are derived from the current leg's artifacts:
`cp app_v5101.mjs app_testable.mjs` (t7/t8) and `cp dom_v5101.cjs dom_bundle.cjs` (t9) —
`dom_entry_v5101.jsx` additionally exposes `window.__test` for t9 (baseline suites ignore it),
and `shim.txt` now exports `__test` alongside `__g` (guarded, so v5.9.2 splices still load).
t8 also reads `../DangerClose.jsx`, the canonical current source, from the run-folder root.

## Portability (fixed at v5.10.1)
`mk_testable.sh` and t6's subprocess previously hardcoded absolute paths from the original
build session and would fail anywhere else (including a clean-clone ship verification); both
now resolve relative to their own location. Run everything from a folder holding the version
`.jsx` files (v592/v510/v5101) plus `DangerClose.jsx` next to `qa/`.

## Two hard-won environment facts (encoded in the suites, do not "simplify" away)
- **Seed Math.random BEFORE importing the app bundle.** d3-random captures Math.random at
  module load; a post-import override silently leaves the MC's noise draws on the real RNG
  and destroys determinism.
- The CJS DOM bundle runs in Node scope: stub `globalThis.URL.createObjectURL`, not just
  `window.URL`, or the backup-export capture never fires.

## KNOWN DEFECT pins
Three dated pins were opened at the v5.10 baseline rebuild (t3 ACA cliff funding-sale MAGI;
t5 Clear All Data leaves the API key and skips the landing return; t6 phantom Spouse-B card
for single filers) and **flipped at v5.10.1**: the current (v5101) leg asserts the fixed
behavior as positive assertions, while the frozen v592/v510 legs keep the dated pins as
pre-fix history — every leg green and honest. Details in CHANGELOG v5.10 / v5.10.1. The
pattern stands for future defects: pin today's wrong behavior with a date, flip when fixed.
