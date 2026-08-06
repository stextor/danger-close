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
`./run_all.sh v592` · `./run_all.sh v510` · `./run_all.sh parity`
Counts at this writing: v5.9.2 234 · v5.10 246 · parity 8 (all green).

## Two hard-won environment facts (encoded in the suites, do not "simplify" away)
- **Seed Math.random BEFORE importing the app bundle.** d3-random captures Math.random at
  module load; a post-import override silently leaves the MC's noise draws on the real RNG
  and destroys determinism.
- The CJS DOM bundle runs in Node scope: stub `globalThis.URL.createObjectURL`, not just
  `window.URL`, or the backup-export capture never fires.

## KNOWN DEFECT pins
Three dated pins (t3 ACA cliff funding-sale MAGI; t5 Clear All Data leaves the API key and
skips the landing return; t6 phantom Spouse-B card for single filers) assert TODAY'S buggy
behavior so the defects stay visible. When each is fixed, flip its pin — the fix is then
self-verifying. Details in CHANGELOG v5.10.
