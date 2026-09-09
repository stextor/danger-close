#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════════════
# controls_v568_runfolder.sh — negative controls for `qa/mk_runfolder.sh`. ADOPTED v5.68.
#
# WHAT IT PROVES. The defect class `mk_runfolder.sh` closes is SILENCE THAT READS AS GREEN: a run
# folder missing one input runs most of the suite and skips the rest. So the script is only worth
# anything if the absences it guards against are actually loud. Each control removes exactly one
# input from a PRISTINE copy of a good run folder and asserts the suite says so.
#
# ⚠ A CONTROL THAT DOES NOT FIRE IS THE FINDING. If a mutant runs green, the input it removed was
# never load-bearing and this script's claim about it is wrong — report that, do not adjust the
# expectation until it matches.
#
# DRIFT-SAFE: every mutant is rebuilt from `$GOOD`, never mutated in place, so control N+1 cannot
# inherit control N's damage. (Pattern: qa/tools/controls_manifest_rows.py.)
#
# USAGE
#   ./qa/mk_runfolder.sh v566 v567 <prior.jsx> /tmp/run     # build the good folder first
#   ./qa/tools/controls_v568_runfolder.sh /tmp/run v566 v567
#
# ASSERTS NOTHING IN THE APP. Counted in no release's check total (OPERATIONS §B1).
# ═══════════════════════════════════════════════════════════════════════════════════════════════
set -uo pipefail

GOOD="${1:?usage: controls_v568_runfolder.sh <good-run-folder> <prior-tag> <cur-tag>}"
PRIOR="${2:?prior tag}"; CUR="${3:?current tag}"
[ -f "$GOOD/qa/dom_bundle.cjs" ] || { echo "FATAL: $GOOD is not a built run folder (no qa/dom_bundle.cjs)."; exit 2; }

MUT=/tmp/ctl_mutant
pass=0; fail=0
ok ()   { pass=$((pass+1)); printf '  \xe2\x9c\x93 %s\n' "$*"; }
bad ()  { fail=$((fail+1)); printf '  \xe2\x9c\x97 %s\n' "$*"; }

# Rebuild the mutant from pristine. node_modules is symlinked, not copied — it is the one part no
# control touches, and copying 149 packages six times is the difference between a minute and ten.
pristine () {
  rm -rf "$MUT"; mkdir -p "$MUT"
  ( cd "$GOOD" && tar cf - --exclude=node_modules . ) | ( cd "$MUT" && tar xf - )
  ln -s "$GOOD/node_modules" "$MUT/node_modules"
}

# Run one suite in the mutant and classify: DIED (no total printed, non-zero rc) / GREEN / RED.
verdict () {  # $1 = suite file, $2.. = args
  local f="$1"; shift
  local out rc
  out=$( cd "$MUT/qa" && timeout 300 node "$f" "$@" 2>&1 ); rc=$?
  if ! echo "$out" | grep -qE '[0-9]+ passed'; then echo "DIED(rc=$rc)"
  elif echo "$out" | grep -qE '[1-9][0-9]* failed'; then echo "RED"
  else echo "GREEN"; fi
}

echo "controls_v568_runfolder — good folder: $GOOD"
echo

# ── C-1 · the alias that cost v5.66 nine setup failures ──────────────────────────────────────
# t9, t11-t14 and t16 require the UNTAGGED CJS bundle. Deriving app_testable.mjs and forgetting
# dom_bundle.cjs is half the setup, and the half that was missed.
echo "C-1: qa/dom_bundle.cjs removed — the six suites that require it must DIE, not report 0/0"
pristine; rm -f "$MUT/qa/dom_bundle.cjs"
for s in t9_dom_smoke t11_survivor_rmd t12_engineD_survivor t13_engineC_irmaa t14_cross_engine_survivor t16_roth_ladder_filing; do
  v=$(verdict "$s.mjs")
  case "$v" in DIED*) ok "C-1 $s: $v" ;; *) bad "C-1 $s: $v — CONTROL DID NOT FIRE; this suite does not need dom_bundle.cjs" ;; esac
done
echo

# ── C-1a · and the runner must SAY so, rather than tallying an empty set as green ─────────────
# runsuite.sh prints DIED exactly when a suite emits no "N passed" line AND exits non-zero. That
# condition is asserted directly here rather than by running the whole two-leg suite: the runner's
# rule is three lines of shell, and re-running 3,377 checks to observe it is not a better control.
echo "C-1a: the dead suites meet runsuite.sh's DIED condition (no total printed AND rc != 0)"
for s in t9_dom_smoke t11_survivor_rmd t16_roth_ladder_filing; do
  out=$( cd "$MUT/qa" && timeout 300 node "$s.mjs" 2>&1 ); rc=$?
  if [ $rc -ne 0 ] && ! echo "$out" | grep -qE '[0-9]+ (passed|failed)'; then
    ok "C-1a $s: no total printed, rc=$rc → runner prints DIED"
  else
    bad "C-1a $s: rc=$rc and a total WAS printed — this would tally as 0/0 and read as green"
  fi
done
echo

# ── C-2 · the other alias ────────────────────────────────────────────────────────────────────
echo "C-2: qa/app_testable.mjs removed — t7 must DIE"
pristine; rm -f "$MUT/qa/app_testable.mjs"
v=$(verdict t7_accrual.mjs); case "$v" in DIED*) ok "C-2 t7: $v" ;; *) bad "C-2 t7: $v — CONTROL DID NOT FIRE" ;; esac
echo

# ── C-3 · the untagged source at the run-folder ROOT ─────────────────────────────────────────
echo "C-3: <root>/DangerClose.jsx removed — t8 reads it directly and must DIE"
pristine; rm -f "$MUT/DangerClose.jsx"
v=$(verdict t8_invariant.mjs); case "$v" in DIED*|RED) ok "C-3 t8: $v" ;; *) bad "C-3 t8: $v — CONTROL DID NOT FIRE" ;; esac
echo

# ── C-4 · the file t31 fails CLOSED on ───────────────────────────────────────────────────────
# t31 is the only suite that reads METHODOLOGY.md. It is designed to exit loudly rather than skip,
# because a skipped check that reports green is the exact defect t31 exists to prevent.
echo "C-4: <root>/METHODOLOGY.md removed — t31 must fail CLOSED, never green"
pristine; rm -f "$MUT/METHODOLOGY.md"
v=$(verdict t31_disclosure_parity.mjs "$CUR")
case "$v" in GREEN) bad "C-4 t31: GREEN — CONTROL DID NOT FIRE; t31 skipped rather than failing closed" ;; *) ok "C-4 t31: $v" ;; esac
echo

# ── C-5 · the fixture path that LOOKS applied when it is not ─────────────────────────────────
# t29 prefers tools/fixture/ and falls back to flat. A copy placed flat while tools/ still holds a
# stale one is invisible; removing BOTH is the only way to show the resolution is real.
echo "C-5: qa/tools/fixture/households.mjs removed — t29 must report the absence, not pass vacuously"
pristine; rm -f "$MUT/qa/tools/fixture/households.mjs" "$MUT/qa/households.mjs"
v=$(verdict t29_boundaries.mjs "$CUR")
case "$v" in GREEN) bad "C-5 t29: GREEN — CONTROL DID NOT FIRE" ;; *) ok "C-5 t29: $v" ;; esac
echo

# ── C-6 · the script's own inputs are checked, not assumed ───────────────────────────────────
echo "C-6: mk_runfolder.sh aborts loudly on bad input rather than building a partial folder"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
for probe in "missing prior source:$PRIOR:$CUR:/tmp/definitely_not_here.jsx" \
             "dotted tag:v5.66:$CUR:/mnt/project/DangerClose-v5_66.jsx" \
             "same tag twice:$CUR:$CUR:/mnt/project/DangerClose-v5_66.jsx"; do
  label=${probe%%:*}; rest=${probe#*:}
  a=${rest%%:*}; rest=${rest#*:}; b=${rest%%:*}; c=${rest#*:}
  out=$( cd "$REPO" && ./qa/mk_runfolder.sh "$a" "$b" "$c" /tmp/ctl_should_not_exist 2>&1 ); rc=$?
  if [ $rc -ne 0 ] && echo "$out" | grep -q "FATAL"; then ok "C-6 $label: aborted (rc=$rc)"
  else bad "C-6 $label: rc=$rc, no FATAL — CONTROL DID NOT FIRE"; fi
done
rm -rf /tmp/ctl_should_not_exist
echo

# ── C-7 · the positive leg: the unmutated folder is green ────────────────────────────────────
# Without this the controls above prove only that things break, not that the recipe works.
echo "C-7: the PRISTINE folder runs the same six suites green"
pristine
for s in t9_dom_smoke t11_survivor_rmd t12_engineD_survivor t13_engineC_irmaa t14_cross_engine_survivor t16_roth_ladder_filing; do
  v=$(verdict "$s.mjs")
  case "$v" in GREEN) ok "C-7 $s: GREEN" ;; *) bad "C-7 $s: $v — the recipe itself is wrong" ;; esac
done

rm -rf "$MUT"
echo
echo "controls_v568_runfolder: $pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
