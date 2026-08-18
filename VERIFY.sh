#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Danger Close — release verification · v5.37 (2026-08-16)
#
# v5.38 changes: pair and both md5s rolled forward (v537 -> v538); domdiff default
# re-pointed in the same release. Executable modes matter: run scripts via bash if a
# pool round-trip stripped +x (found the hard way at v5.38 — a stripped bit made every
# negative control silently test the clean build).
# v5.37 changes: pair and both md5s rolled forward (v536 -> v537). The DOM diff's
# Taxes/IRMAA sections FLIPPED from figure-region divergence to STRICT IDENTITY —
# v5.37 cannot reach Engines B/C (census: taxOrd is write-only into MAGI), so
# identity is the strongest true claim, and it still catches a dead call site
# (verified: C10/C11 run against the identity form each fail exactly one check).
# Control C13 added: the ordinary-growth line reverted must fire t19(1)/t20(2).
#
# PROVENANCE: originally authored 2026-08-11 for v5.22 by transcribing the steps
# actually executed in that session. Rolled forward to v5.23 from that file
# (md5 3e608e13a4365f814e35788317bdbbfa), which was supplied by the maintainer —
# it is NOT in project knowledge, so a session working from knowledge alone
# cannot produce it. ADD IT TO KNOWLEDGE with this release.
#
# v5.33 changes: version pair and both expected md5s rolled forward. t22's prior
# default is rolled v531 -> v532 as its header instructed — but NOT by itself:
# group F's "acaFloorYrs is NEW" is a claim about the v5.31 -> v5.32 transition and
# is FALSE against a v5.32 prior, so it is now gated on the prior tag. t22 holds at
# 64 either way. The rotation forced this: v5.31 leaves project knowledge at v5.33,
# so app_v531.mjs can no longer be built from knowledge alone.
#
# v5.33 is a STORAGE-ONLY release: one field, one clamped accessor, one schema
# default, and the My Data control that sets it. NO engine reads any of it. Parity
# must therefore be 9/9 strict AND every figure identical — if parity moves, something
# reads the field, which contradicts the whole premise. STOP rather than adapting.
#
# ⚠ ORDERING TRAP, hit 2026-08-13: `run_all.sh parity` reads
# /tmp/t2_<prior>_fingerprint.json, which only exists after the PRIOR leg's t2 has
# run. Step 3 runs the legs before parity, so the script is fine — but a session
# running parity first sees ENOENT and reads it as a defect. It is not.
#
# ⚠ HARNESS SETUP, recorded 2026-08-13: after mk_testable.sh, NINE suites die at
# module load unless three copies are in place. Step 2 does the first two; the
# third is the run-folder-root `DangerClose.jsx` the usage line above requires
# (t8 and t19 read it directly).
#
# v5.25 changes: version pair and both expected md5s rolled forward; t20 joins
# step 4; step 4b's domdiff is now STRICT IDENTITY (9 checks, up from 8) because
# v5.25 rewords nothing on the Withdrawal tab — the v5.24 excision was removed
# rather than carried forward by habit. v5.25 touches no engine, so the claim is
# that all 787 pre-existing checks return identical figures, and the 85 new ones
# are t20 (61) plus t4 (+16), t5 (+5) and t6 (+3).
#
# NOTE, added v5.24 and EXECUTED at v5.25: step 5 rebuilds the CURRENT version
# only. Before trusting a new built md5, rebuild the PRIOR version first and
# confirm it reproduces its published hash. Done at v5.25 — v5.24 rebuilt to
# d959019388994da4e25f153f220d7593 byte-for-byte, which is what distinguishes
# 'the scaffold is complete' from 'the hash looks plausible'. Still worth
# automating; still done by hand.
#
# TRAP, recorded at v5.25: `npm i <pkg>` PRUNES anything absent from
# package.json, so installing harness deps one at a time silently uninstalls the
# previous ones. Step 1 installs them together; if you add one later, use
# --no-save (which also keeps the scaffold package.json byte-identical, §N3a).
#
# Every command below was run and its result recorded in the release notes.
#
# Usage:  ./VERIFY.sh /path/to/workdir
#    workdir must contain:  v537.jsx  v538.jsx  DangerClose.jsx(=v538)  qa/
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

PRIOR=v537
CURR=v538
EXPECT_SRC_MD5=b8d12481b55cd2ed05c6c6f14e2f41d9
EXPECT_BUILT_MD5=d547810a4e2c4beb97008481d7bbbfef

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
# acorn/acorn-jsx/acorn-walk added v5.31: qa/tools/*.cjs require them, so t21 dies at module
# load without them. They were missing from this line through v5.30.
npm i esbuild react react-dom d3 xlsx mammoth jsdom acorn acorn-jsx acorn-walk >/dev/null 2>&1
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
         t16_roth_ladder_filing t17_engineC_exact t18_engineB_exact t19_engineD_exact \
         t20_other_taxtype t21_tools; do
  timeout 900 node "${t}.mjs" | tail -1
done
# t22 takes the PRIOR tag explicitly — its committed default is still v532, one release
# unrolled. Group F reads the prior leg's bundle, so a wrong tag fails at module load.
timeout 900 node t22_aca_floor.mjs "$PRIOR" | tail -1
cd ..

# ── 4b. Cross-version Withdrawal DOM diff — THE PROOF FOR v5.23 ─────────────
# OPERATIONS §B2: a green suite is not evidence of coverage. A +10% inflation
# perturbation inside Engine D moves totalDrawn by $50,320 and the ENTIRE
# pre-existing suite stays green — t4 (90) and t12 (23, named engineD_survivor)
# both pass. So "the suite is green" does NOT prove the hoist changed nothing.
# This does: it renders the Withdrawal tab on BOTH builds and diffs the text.
say "4b. Tax-bearing tabs, cross-version DOM diff"
( cd qa && timeout 900 node domdiff_withdrawal.mjs "$PRIOR" "$CURR" | tail -6 )

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
Expected totals for v5.37 — compare against the output above:

  baseline current leg  600  (t1 94 · t2 18 · t3 36 · t4 210 · t5 58 · t6 21 · t10 163)
  parity                  9  strict, no INTENDED_DIFFS
  feature               660  (t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42
                              t14 44 · t15 11 · t16 24 · t17 74 · t18 67 · t19 65
                              t20 100 · t22 77)
  ----------------------------------------------------------------------------
  APP TOTAL            1269
  prior leg (v5.36)     600  counted SEPARATELY (replays at its shipped figure)
  tooling (t21)          50  counted SEPARATELY
  built artifact         16  qa/smoke_built.mjs
  tax-tab DOM diff       29  qa/domdiff_withdrawal.mjs — see below

v5.37 grows Engine D's ordinary sub-pool (E-15 fixed): one line, taxOrd =
min(taxable − taxGainPool, taxOrd × (1 + growth.tax)). The edit is write-only
into MAGI (AST census), so Engines A, B and C are byte-identical to v5.36 and
parity must be 9/9 STRICT. ALL THREE tax-bearing tabs must render BYTE-IDENTICAL
across the pair: Taxes and IRMAA because their capGain_y inputs cannot move, and
the Withdrawal tab because — measured, not assumed — lifetime MAGI rises $3,333
on the example household but never crosses a bracket edge, so the bracket column
(the only MAGI-derived render) holds. The release's divergence witness therefore
lives at the ENGINE level: t19's exact MAGI pin ($3,162,820, was $3,132,746) and
t20's exact excess pin ($724,266, was $600,000), both derived by an independent
simulator BEFORE the engine was edited and matched to six decimals.

THE IDENTITY CHECKS STILL WITNESS THE CALL SITES. A dead Engine B/C call site on
either leg desynchronizes that leg's figures from the other's and fails the
identity check loudly — verified by running C10/C11 against this form (each
fails exactly its one intended check, with the gains visibly missing from the
dead leg in the diff output). The figure regions stay anchored PAST every piece
of v5.36 copy (E-20).

THIRTEEN NEGATIVE CONTROLS, all firing: C1–C9, C12 and the new C13 in
qa/controls.sh (patches embedded), C10/C11 on the DOM identity witnesses. C13
reverts the v5.37 growth line: the fingerprint moves (the pension-trad
household's MAGI drops) and t19(1) + t20(2) fire — the $724,266 pin, the E-15
extinction (excess must EXCEED the opening balance), and the MAGI pin.

FIXTURE NOTE (E-17, closed this release): t20 and t7 now declare the household
they run (dob strings 1964-01-01/1966-01-01, measured value-identical to the
object-dob runs they replace). t20 E2's exacts are REGIME-BOUND to full pool
exhaustion — if those dobs or balances ever change, re-derive; do not carry.

BUILT MD5 — the scaffold was proven before the new hash was trusted: v5.36 was
rebuilt from its own unmodified source and reproduced c6d7474725d150a616a8ee8d389e8c72
byte-for-byte, then the identical toolchain built v5.37. The binding check on a
built artifact is still smoke_built.mjs at 16/16, not the hash.
EOF
