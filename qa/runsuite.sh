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
    # ⚠ v5.72: a death is COUNTED as a failure. Until then it was tallied "0 0", so the GRAND line below read
    #   "0 failed" while a suite lay dead above it — found when t33-v572 died on a missing PINS entry and the
    #   total still read green. The per-line DIED was right; the one line people read was not.
    echo "0 1 DIED" >> "$TMP/tally.txt"
  else
    printf "%-22s %5s passed %5s failed\n" "$label" "$p" "$f"
    echo "$p $f" >> "$TMP/tally.txt"
  fi
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
# t32 (v5.53) is the ONLY suite that witnesses the ladder-dividend release at the engine layer.
# The DOM diff reports "nothing moved" for it by construction (it is blind to the Roth tab), so a
# runner that stops at t31 would report this release green without executing anything that can see it.
tally "t32-$PRIOR" node t32_ladder_dividend.mjs "$PRIOR"
tally "t32-$CUR"   node t32_ladder_dividend.mjs "$CUR"
# t33 (v5.63) carries the suite's FIRST stream-bearing fixtures. Every other fixture sets
# incomeStreams to 0 or [], so nothing else in this runner can reach the Roth comparator's
# FICA path at all. Both legs: the prior leg asserts the defect, the current leg the fix.
tally "t33-$PRIOR" node t33_roth_stream_fica.mjs "$PRIOR"
tally "t33-$CUR"   node t33_roth_stream_fica.mjs "$CUR"
# t34 (v5.64) is CURRENT-LEG ONLY by construction: it tests machinery that does not exist on any
# earlier build, so running it against the prior leg would fail for the right reason and report as
# a regression. Its own KNOWN_VERSIONS guard refuses any other tag.
tally "t34-$CUR"   node t34_income_conditioning.mjs "$CUR"
# t35 (v5.65) runs on BOTH legs by construction. The prior leg carries Connecticut UNPOPULATED and
# asserts the pre-fix figures; the current leg asserts the populated ones. A current-leg-only suite
# could not show that anything moved, which is the whole claim of a populate release.
tally "t35-$PRIOR" node t35_state_populate.mjs "$PRIOR"
tally "t35-$CUR"   node t35_state_populate.mjs "$CUR"
# t36 (v5.70) runs on BOTH legs: the prior leg pins B-3's keyless send, the current leg asserts it extinct.
tally "t36-$PRIOR" node t36_ai_route.mjs "$PRIOR"
tally "t36-$CUR"   node t36_ai_route.mjs "$CUR"

# t37 (v5.71) runs on BOTH legs: the prior leg pins A-3 (the draft autosave has never saved) and
# A-6 (an imported masterPrompt is assigned unchecked); the current leg asserts both fixed, and
# carries this release's EXTINCTION INVARIANT — after Clear All Data the draft key is gone.
tally "t37-$PRIOR" node t37_mydata_draft.mjs "$PRIOR"
tally "t37-$CUR"   node t37_mydata_draft.mjs "$CUR"

# t38 (v5.72) runs on BOTH legs: the prior leg pins the import defects (A-2, A-4, A-5) and the inert birth-year
# clamp; the current leg asserts each extinct. It is in the APP total. About two minutes per leg.
tally "t38-$PRIOR" node t38_import_hardening.mjs "$PRIOR"
tally "t38-$CUR"   node t38_import_hardening.mjs "$CUR"

# t39 (v5.73) runs on BOTH legs: the prior leg pins Maine's unphased deduction and Montana's $5,500 and
# half-taxed SS; the current leg carries the hand-computed cells. It is in the APP total.
tally "t39-$PRIOR" node t39_me_mt.mjs "$PRIOR"
tally "t39-$CUR"   node t39_me_mt.mjs "$CUR"

# t40 (v5.74) runs on BOTH legs: the prior leg pins C-8 (the Taxes and IRMAA tabs never saw the drawdown —
# $0 federal tax in 2032-2038, lifetime RMD $1,625,926); the current leg asserts the draw agreement, the D-9
# pinned divergence and the hand-verified gap years. It is the suite's FIRST cross-tab test (E-25): every
# other suite drives one engine. It is in the APP total. Its negative controls are qa/tools/controls_v574_c8.py.
tally "t40-$PRIOR" node t40_cross_tab_agreement.mjs "$PRIOR"
tally "t40-$CUR"   node t40_cross_tab_agreement.mjs "$CUR"
# t41 (v5.75) runs on BOTH legs by construction: the prior leg PINS the survivor-age and unused-
# deduction defects as dated known defects, the current leg asserts the statutory figures. A
# current-leg-only run could not show that anything moved. ⚠ It was written and left UNWIRED at the
# v5.75 build — the full suite reported 4,320 green with 39 checks that never executed. Nothing in
# the runner fails when a suite file exists but is not listed here; only this line makes it run.
tally "t41-$PRIOR" node t41_survivor_age_gains.mjs "$PRIOR"
tally "t41-$CUR"   node t41_survivor_age_gains.mjs "$CUR"
# t42 (v5.76) runs on BOTH legs: the v5.75 leg pins C-7 (a single household paid spouse B's Social
# Security) as a dated known defect; the current leg asserts every output equals the zeroed-benefit
# case to the dollar, sweeps the stored figure, and renders the D-2 note. Wired AT BUILD this time.
tally "t42-$PRIOR" node t42_single_spouse_b_ss.mjs "$PRIOR"
tally "t42-$CUR"   node t42_single_spouse_b_ss.mjs "$CUR"
# t43 (v5.77) runs on BOTH legs: the v5.76 leg pins C-4 (Engine A drops worksheet line 14) and §1f (Engine C
# taxes a single household on the joint thresholds) as dated known defects, and the four private copies of
# §86; the current leg asserts the shared helper against two independent oracles, Engines A, B and C
# against the worksheet, the IRMAA consequence, and the parser-level extinction check. Wired AT BUILD.
tally "t43-$PRIOR" node t43_ss86_one_rule.mjs "$PRIOR"
tally "t43-$CUR"   node t43_ss86_one_rule.mjs "$CUR"
echo "== TOOLING (not counted in APP TOTAL) =="
tally "t21" node t21_tools.mjs
tally "domdiff" node domdiff_withdrawal.mjs "$PRIOR" "$CUR"
# state_sets_check (2026-09-15, SCOPE_STATE_SET_SELECTOR stage 1) is TOOLING: it asserts the suite's shared
# income-limited list, its drift guard, and that f6_probe agrees with t29 F-6. Both legs; no app figure.
tally "sets-$PRIOR" node state_sets_check.mjs "$PRIOR"
tally "sets-$CUR"   node state_sets_check.mjs "$CUR"
echo
awk '{p+=$1; f+=$2; if ($3=="DIED") d++} END {printf "GRAND (incl tooling): %d passed, %d failed%s\n", p, f, (d ? sprintf(" — %d suite(s) DIED, each counted as one failure", d) : "")}' "$TMP/tally.txt"
echo "logs: $TMP"
