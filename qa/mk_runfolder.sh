#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════════════
# mk_runfolder.sh — build a runnable suite folder from a repo clone. ADOPTED v5.68.
#
# WHY THIS IS A SCRIPT AND NOT A PARAGRAPH.
#   The suite does not run from a bare clone: the repo stores t1-t6 under `qa/qa-baseline/` and
#   t7-t35 under `qa/`, while the harness runs from a FLAT folder with every suite together in one
#   `qa/`. That shape was recorded in prose (OPERATIONS §B "Run layout gotcha", and the checklist in
#   `qa/qa-baseline/README.md`) and was STILL diagnosed from scratch twice:
#     v5.66 — ten feature suites reported `0 passed, 0 failed`. An empty set reads as green.
#     v5.67 — six suites reported DIED, and the diagnosis took a large share of that session.
#   A rule with no way to execute it is how §I's hash-row obligation rotted for eleven releases.
#   This file is the executable half; the prose stays where it is and points here.
#
# EVERY FAILURE IS LOUD. The entire defect class this script exists to close is silence that reads
# as green, so a missing input aborts with a named reason rather than producing a folder that runs
# nine suites and skips six.
#
# USAGE
#   ./qa/mk_runfolder.sh <prior-tag> <cur-tag> <prior-source.jsx> [outdir]
#     ./qa/mk_runfolder.sh v566 v567 ~/pool/DangerClose-v5_66.jsx /tmp/run
#   Run from the root of a clone. Tags are the suites' own (v566, v567 — no dots, no "v5.67").
#
# ⚠ THE PRIOR SOURCE IS NOT IN THE REPO. The tree carries exactly one source, `src/DangerClose.jsx`,
#   which is the CURRENT build. The prior leg's `.jsx` comes from the knowledge pool (or from
#   archaeology on the commit that shipped it — this repo has NO TAGS, see qa-baseline/README.md).
#   Hence the third argument. It is required, and it is checked, because the two-leg comparison IS
#   the regression suite and a run folder without it is not a run folder.
#
# ⚠ ONE `npm install`, NOT SEVERAL. A later `npm install <one-package> --no-save` PRUNED `jsdom`
#   mid-session at v5.67 and killed six suites a SECOND time in the same day. Every dependency the
#   suite and the parser toolkit need is on the single line below; do not add to it incrementally.
#
# WHAT IT DOES NOT DO. It does not run the suite (use `qa/runsuite.sh <prior> <cur>` from the run
# folder's `qa/`), it does not build `index.html` (§N), and it asserts nothing — it is setup, and it
# is counted in no release's check total.
# ═══════════════════════════════════════════════════════════════════════════════════════════════
set -euo pipefail

die () { echo "mk_runfolder: FATAL — $*" >&2; exit 1; }
say () { printf '  %s\n' "$*"; }

# ── arguments ────────────────────────────────────────────────────────────────────────────────
[ $# -ge 3 ] || die "usage: ./qa/mk_runfolder.sh <prior-tag> <cur-tag> <prior-source.jsx> [outdir]"
PRIOR="$1"; CUR="$2"; PRIOR_SRC="$3"; OUT="${4:-/tmp/run}"

for t in "$PRIOR" "$CUR"; do
  case "$t" in
    v[0-9]*) : ;;
    *) die "tag '$t' is not a suite tag. The suites want v566 / v567 — no dots, no 'v5.67'." ;;
  esac
done
[ "$PRIOR" != "$CUR" ] || die "prior and current tags are both '$CUR' — the parity leg compares two builds."

# ── the clone we are building from ───────────────────────────────────────────────────────────
REPO="$(cd "$(dirname "$0")/.." && pwd)"
say "repo:   $REPO"
[ -f "$REPO/src/DangerClose.jsx" ] || die "no src/DangerClose.jsx under $REPO — run this from a clone's root."
[ -d "$REPO/qa/qa-baseline" ]      || die "no qa/qa-baseline/ under $REPO — this is not the danger-close tree."
[ -d "$REPO/qa/tools/fixture" ]    || die "no qa/tools/fixture/ under $REPO."
[ -f "$REPO/METHODOLOGY.md" ]      || die "no METHODOLOGY.md at the repo root — t31 reads it and fails closed."

[ -f "$PRIOR_SRC" ] || die "prior source '$PRIOR_SRC' not found.
    The repo carries ONE source (the current build). The prior leg's .jsx comes from the knowledge
    pool. Without it there is no prior leg, no parity leg, and no regression suite."

# The DOM parity leg needs BOTH entry shims, and they are per-release files.
for t in "$PRIOR" "$CUR"; do
  [ -f "$REPO/qa/qa-baseline/dom_entry_$t.jsx" ] \
    || die "qa/qa-baseline/dom_entry_$t.jsx is missing — the DOM leg for $t cannot be bundled."
done

# ── assemble ─────────────────────────────────────────────────────────────────────────────────
say "out:    $OUT"
rm -rf "$OUT"; mkdir -p "$OUT/qa"

cp "$REPO/src/DangerClose.jsx" "$OUT/$CUR.jsx"
cp "$PRIOR_SRC"                "$OUT/$PRIOR.jsx"
# t8 reads ../DangerClose.jsx directly — the untagged canonical name, at the run-folder ROOT.
cp "$REPO/src/DangerClose.jsx" "$OUT/DangerClose.jsx"
# t31 is the first suite to read METHODOLOGY.md, and exits loudly rather than skipping without it.
cp "$REPO/METHODOLOGY.md"      "$OUT/METHODOLOGY.md"
cp "$REPO/package.json"        "$OUT/package.json"

# FLATTEN: feature suites and the runner from qa/, then t1-t6 and the harness from qa/qa-baseline/
# on top. A bare `cp qa/*.mjs` gets t7-t35 and MISSES EVERY BASELINE SUITE — t1-t6 are not in qa/.
cp "$REPO"/qa/*.mjs "$REPO"/qa/*.sh "$OUT/qa/"
cp -R "$REPO/qa/tools" "$OUT/qa/tools"          # ⚠ tools/fixture/, NOT a flat copy — see below
cp "$REPO"/qa/qa-baseline/*.mjs "$REPO"/qa/qa-baseline/*.sh "$REPO/qa/qa-baseline/shim.txt" "$OUT/qa/"
cp "$REPO/qa/qa-baseline/dom_entry_$PRIOR.jsx" "$REPO/qa/qa-baseline/dom_entry_$CUR.jsx" "$OUT/qa/"
chmod +x "$OUT"/qa/*.sh
say "assembled $(ls "$OUT/qa" | wc -l | tr -d ' ') files into $OUT/qa"

# ⚠ t29 resolves its census tool and fixtures from tools/ OR flat, preferring tools/. A copy placed
#   flat in qa/ therefore LOOKS applied and is not — t29 silently keeps using tools/. The recursive
#   copy above is what makes that safe; this is the assertion that it happened.
[ -f "$OUT/qa/tools/fixture/households.mjs" ] || die "qa/tools/fixture/households.mjs did not land — t29's fixtures resolve from tools/ first."

# ── dependencies: ONE install ────────────────────────────────────────────────────────────────
say "npm install (single call — see the header)"
( cd "$OUT" && npm install esbuild react react-dom d3 xlsx mammoth jsdom acorn acorn-jsx acorn-walk \
    --no-audit --no-fund --silent ) || die "npm install failed."
for m in jsdom acorn acorn-jsx acorn-walk esbuild react react-dom d3 xlsx mammoth; do
  [ -d "$OUT/node_modules/$m" ] || die "'$m' is not installed after npm install. Do NOT repair this with a second
    'npm install <pkg> --no-save' — that is what pruned jsdom and killed six suites at v5.67."
done

# ── build both legs ──────────────────────────────────────────────────────────────────────────
cd "$OUT"
for t in "$PRIOR" "$CUR"; do
  ./qa/mk_testable.sh "$t" >/dev/null || die "mk_testable.sh failed for $t."
  [ -f "qa/app_$t.mjs" ] || die "qa/app_$t.mjs was not produced for $t."
  npx esbuild "qa/dom_entry_$t.jsx" --bundle --format=cjs --platform=browser \
      --loader:.jsx=jsx --jsx=automatic --outfile="qa/dom_$t.cjs" --log-level=error \
      || die "esbuild failed bundling the DOM leg for $t."
  say "built qa/app_$t.mjs + qa/dom_$t.cjs"
done

# ── the two untagged aliases, which are the actual v5.66 defect ──────────────────────────────
# t7 and the run-once feature suites import the UNTAGGED name; t9, t11-t14 and t16 require the
# untagged CJS bundle and DIE without it. Deriving app_testable.mjs and forgetting dom_bundle.cjs
# is exactly half the setup, and is what produced v5.66's nine setup failures.
cp "qa/app_$CUR.mjs" qa/app_testable.mjs
cp "qa/dom_$CUR.cjs" qa/dom_bundle.cjs
say "aliased app_testable.mjs + dom_bundle.cjs from the $CUR leg"

# ── self-check: every input the suite reaches for, asserted present ──────────────────────────
missing=0
for f in "$CUR.jsx" "$PRIOR.jsx" DangerClose.jsx METHODOLOGY.md \
         "qa/app_$CUR.mjs" "qa/app_$PRIOR.mjs" "qa/dom_$CUR.cjs" "qa/dom_$PRIOR.cjs" \
         qa/app_testable.mjs qa/dom_bundle.cjs qa/runsuite.sh qa/env_dom.mjs \
         qa/t1_units.mjs qa/t6_single.mjs qa/t35_state_populate.mjs \
         qa/tools/fixture/households.mjs qa/tools/boundaries.mjs; do
  [ -e "$f" ] || { echo "  MISSING: $f" >&2; missing=$((missing+1)); }
done
[ "$missing" -eq 0 ] || die "$missing required input(s) absent — see above. This folder would run PARTIALLY GREEN."

cat <<EOF

  run folder ready: $OUT
    cd $OUT/qa && ./runsuite.sh $PRIOR $CUR

  ⚠ Arguments that are NOT version tags (qa/qa-baseline/README.md):
      t11-t16  take a MODULE PATH, not a tag. Run them with NO argument.
      t22      takes the PRIOR tag ($PRIOR), not the current one.
      t34      is current-leg only by construction; t35 runs on both legs.
    runsuite.sh already encodes all of this. Use it rather than a hand-rolled loop — a hand-rolled
    loop is what produced v5.66's ten silent suites.
EOF
