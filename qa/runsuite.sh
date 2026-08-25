#!/bin/bash
# Suite runner (adopted into the repo at v5.36 — was session scratch). Parses "N passed, M failed" out of each suite's own output and
# totals from THAT — never from a remembered figure (project instructions: totals are
# computed from suite output). Not a shipped file; scratch tooling for this session.
# usage: ./runsuite.sh <prior> <current>   e.g. ./runsuite.sh v535 v536
cd "$(dirname "$0")"
PRIOR=${1:-v536}; CUR=${2:-v537}
TMP=$(mktemp -d)
tally () {  # $1 label, $2... command
  local label="$1"; shift
  local out rc; out=$(timeout 900 "$@" 2>&1); rc=$?
  echo "$out" > "$TMP/$label.log"
  local p f
  p=$(echo "$out" | grep -oE '[0-9]+ passed' | awk '{s+=$1} END {print s+0}')
  f=$(echo "$out" | grep -oE '[0-9]+ failed' | awk '{s+=$1} END {print s+0}')
  # t10 prints per-PHASE lines AND a total line; take the total line only.
  case "$label" in t10-*)
    p=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+')
    f=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+') ;;
  esac
  # A dead suite prints no "N passed" line at all and would tally as 0/0 — which reads
  # as green if you only count failures (OPERATIONS §B2, learned three times). Say DIED.
  if [ "$p" = "0" ] && [ "$f" = "0" ] && [ $rc -ne 0 ]; then
    printf "%-22s DIED (rc=%s) — see %s\n" "$label" "$rc" "$TMP/$label.log"
  else
    printf "%-22s %5s passed %5s failed\n" "$label" "$p" "$f"
  fi
  echo "$p $f" >> "$TMP/tally.txt"
}
: > "$TMP/tally.txt"
echo "== BOTH LEGS =="
for V in "$PRIOR" "$CUR"; do
  for t in t1_units t2_engines t3_roth t4_dom t5_storage t6_single t10_taxcases; do
    tally "${t%%_*}-$V" node "$t.mjs" "$V"
  done
done
echo "== PARITY =="
tally "parity" node t2_engines.mjs compare "$PRIOR" "$CUR"
echo "== FEATURE =="
for t in t7_accrual t8_invariant t9_dom_smoke t11_survivor_rmd t12_engineD_survivor \
         t13_engineC_irmaa t14_cross_engine_survivor t15_engineA_death_filing \
         t16_roth_ladder_filing t17_engineC_exact t18_engineB_exact t19_engineD_exact \
         t20_other_taxtype; do
  tally "${t%%_*}" node "$t.mjs"
done
tally "t22" node t22_aca_floor.mjs "$PRIOR"
tally "t23-$PRIOR" node t23_roth_ladder_rmd.mjs "$PRIOR"
tally "t23-$CUR"   node t23_roth_ladder_rmd.mjs "$CUR"
tally "t24-$PRIOR" node t24_ss86_phasein.mjs "$PRIOR"
tally "t24-$CUR"   node t24_ss86_phasein.mjs "$CUR"
tally "t25-$PRIOR" node t25_engineC_ss86.mjs "$PRIOR"
tally "t25-$CUR"   node t25_engineC_ss86.mjs "$CUR"
tally "t26-$PRIOR" node t26_noconv_span.mjs "$PRIOR"
tally "t26-$CUR"   node t26_noconv_span.mjs "$CUR"
tally "t27-$PRIOR" node t27_half_cap.mjs "$PRIOR"
tally "t27-$CUR"   node t27_half_cap.mjs "$CUR"
tally "t28-$PRIOR" node t28_ssB_claim_gate.mjs "$PRIOR"
tally "t28-$CUR"   node t28_ssB_claim_gate.mjs "$CUR"
# t29/t30/t31 were absent from this runner until v5.49 — three suites the project could not see.
tally "t29-$PRIOR" node t29_boundaries.mjs "$PRIOR"
tally "t29-$CUR"   node t29_boundaries.mjs "$CUR"
tally "t30-$PRIOR" node t30_legible.mjs "$PRIOR"
tally "t30-$CUR"   node t30_legible.mjs "$CUR"
tally "t31-$PRIOR" node t31_disclosure_parity.mjs "$PRIOR"
tally "t31-$CUR"   node t31_disclosure_parity.mjs "$CUR"
echo "== TOOLING (not counted in APP TOTAL) =="
tally "t21" node t21_tools.mjs
tally "domdiff" node domdiff_withdrawal.mjs "$PRIOR" "$CUR"
echo
awk '{p+=$1; f+=$2} END {printf "GRAND (incl tooling): %d passed, %d failed\n", p, f}' "$TMP/tally.txt"
echo "logs: $TMP"
