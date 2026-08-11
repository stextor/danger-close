#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Danger Close — release verification · v5.23
#
# PROVENANCE: originally authored 2026-08-11 for v5.22 by transcribing the steps
# actually executed in that session. Rolled forward to v5.23 from that file
# (md5 3e608e13a4365f814e35788317bdbbfa), which was supplied by the maintainer —
# it is NOT in project knowledge, so a session working from knowledge alone
# cannot produce it. ADD IT TO KNOWLEDGE with this release.
#
# v5.23 changes: version pair and both expected md5s rolled forward; t19 added
# to the feature loop; the cross-version Withdrawal DOM diff added as step 4b,
# because for this release THAT is the proof the hoist changed nothing — the
# pre-existing suite does not discriminate on Engine D (OPERATIONS §B2).
#
# Every command below was run and its result recorded in the release notes.
#
# Usage:  ./VERIFY.sh /path/to/workdir
#   workdir must contain:  v522.jsx  v523.jsx  DangerClose.jsx(=v523)  qa/
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

PRIOR=v522
CURR=v523
EXPECT_SRC_MD5=bce4bd537a498df5b489ea5702e3eb44
EXPECT_BUILT_MD5=0a14dc285936c0f84440554893cf3086

say() { printf "\n\033[1m== %s ==\033[0m\n" "$*"; }
die() { printf "\n\033[31mFAIL: %s\033[0m\n" "$*" >&2; exit 1; }

# ── 0. Freshness: the source under test is the one the release claims ────────
say "0. Source identity"
GOT=$(md5sum "${CURR}.jsx" | cut -d' ' -f1)
[ "$GOT" = "$EXPECT_SRC_MD5" ] || die "${CURR}.jsx is $GOT, expected $EXPECT_SRC_MD5"
cmp -s "${CURR}.jsx" DangerClose.jsx || die "DangerClose.jsx != ${CURR}.jsx (t8 reads the canonical copy)"
echo "  OK  ${CURR}.jsx = $GOT, and DangerClose.jsx is identical to it"

# ── 1. Suite dependencies ───────────────────────────────────────────────────
say "1. Dependencies"
npm i esbuild react react-dom d3 xlsx mammoth jsdom >/dev/null 2>&1
echo "  OK  installed"

# ── 2. Testable modules + DOM bundles (both legs) ────────────────────────────
say "2. Build test artifacts"
./qa/mk_testable.sh "$PRIOR"
./qa/mk_testable.sh "$CURR"
for v in "$PRIOR" "$CURR"; do
  npx esbuild "qa/dom_entry_${v}.jsx" --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile="qa/dom_${v}.cjs" --log-level=error
done
cp "qa/app_${CURR}.mjs" qa/app_testable.mjs      # t7/t8 input
cp "qa/dom_${CURR}.cjs" qa/dom_bundle.cjs        # t9 input
echo "  OK  app_*.mjs, dom_*.cjs, and the feature-suite inputs built"

# ── 3. The three legs ───────────────────────────────────────────────────────
say "3. Baseline legs + parity"
( cd qa && ./run_all.sh "$PRIOR" )
( cd qa && ./run_all.sh "$CURR" )
( cd qa && ./run_all.sh parity "$PRIOR" "$CURR" )

# ── 4. Feature suites ───────────────────────────────────────────────────────
say "4. Feature suites"
cd qa
for t in t7_accrual t8_invariant t9_dom_smoke t11_survivor_rmd t12_engineD_survivor \
         t13_engineC_irmaa t14_cross_engine_survivor t15_engineA_death_filing \
         t16_roth_ladder_filing t17_engineC_exact t18_engineB_exact t19_engineD_exact; do
  timeout 900 node "${t}.mjs" | tail -1
done
cd ..

# ── 4b. Cross-version Withdrawal DOM diff — THE PROOF FOR v5.23 ─────────────
# OPERATIONS §B2: a green suite is not evidence of coverage. A +10% inflation
# perturbation inside Engine D moves totalDrawn by $50,320 and the ENTIRE
# pre-existing suite stays green — t4 (90) and t12 (23, named engineD_survivor)
# both pass. So "the suite is green" does NOT prove the hoist changed nothing.
# This does: it renders the Withdrawal tab on BOTH builds and diffs the text.
say "4b. Withdrawal tab, cross-version DOM diff"
( cd qa && timeout 900 node domdiff_withdrawal.mjs | tail -6 )

# ── 5. The built artifact — built, then EXERCISED ───────────────────────────
# OPERATIONS §N: a green source suite says NOTHING about the built file, and
# §N1's mount-name gotcha means the config MUST land as vite.config.js with the
# dot or Vite silently ignores it and emits a non-self-contained dist/.
# Build in its OWN folder: sharing this one mixes esbuild versions.
say "5. Built artifact"
BUILD=$(mktemp -d)
mkdir -p "$BUILD/src" "$BUILD/qa"
cp src/index.html src/main.jsx "$BUILD/src/" 2>/dev/null || {
  echo "  SKIP — scaffold (src/index.html, src/main.jsx, vite.config.js, package.json) not in this"
  echo "         workdir. Build separately per OPERATIONS §N3a, then: node qa/smoke_built.mjs <file>"
  BUILD=""
}
if [ -n "$BUILD" ]; then
  cp "${CURR}.jsx" "$BUILD/src/DangerClose.jsx"
  cp vite.config.js package.json "$BUILD/"
  cp qa/smoke_built.mjs "$BUILD/qa/"
  ( cd "$BUILD" && npm install >/dev/null 2>&1 && npm install --no-save jsdom >/dev/null 2>&1 \
      && npx vite build >/dev/null 2>&1 )
  GOTB=$(md5sum "$BUILD/dist/index.html" | cut -d' ' -f1)
  [ "$GOTB" = "$EXPECT_BUILT_MD5" ] \
    && echo "  OK  built index.html = $GOTB (byte-identical to the published artifact)" \
    || echo "  NOTE built index.html = $GOTB, expected $EXPECT_BUILT_MD5 — check toolchain versions
       before treating this as a defect; there is no committed lockfile (OPERATIONS §N3a)"
  ( cd "$BUILD" && node qa/smoke_built.mjs )
  rm -rf "$BUILD"
fi

say "DONE"
cat <<'EOF'
Expected totals for v5.23 — compare against the output above:

  baseline current leg  382  (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115)
  parity                  8  strict, no INTENDED_DIFFS
  feature               380  (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40
                              t14 33 · t15 11 · t16 24 · t17 63 · t18 47 · t19 13)
  ----------------------------------------------------------------------------
  TOTAL                 770  = 757 pre-existing (IDENTICAL figures) + 13 new t19
  built artifact         16  qa/smoke_built.mjs
  withdrawal DOM diff     4  qa/domdiff_withdrawal.mjs (cross-version; step 4b)

Any figure that differs is a finding, not a rounding difference. The prior leg
re-runs at 382 as frozen history.
EOF
