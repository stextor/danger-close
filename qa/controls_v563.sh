#!/bin/bash
# controls_v563.sh — §B2 negative controls for the v5.63 earned-only-FICA fix.
# SCOPE_ROTH_FICA_OTHERORD.md §5.
#
# Each control reverts ONE thing the release ships and requires t33 to FAIL. A control that does
# NOT fire is the finding (§B2) — investigate the check, never soften the control.
#
# ⚠ THE CONTROLS THAT MATTER ARE C2a AND C2b, SEPARATELY. The engine has TWO FICA sites — the main
# path and `_estSaleGain`'s own copy — and a fix applied to only one of them is the easiest possible
# partial ship. The single source edit (annualWork's `kind` filter) corrects both at once, which is
# exactly why a control that reverts them TOGETHER proves nothing about either. C2a and C2b
# simulate the two half-fixes by pushing the unfiltered total back into one site at a time.
#
# ⚠ C1 is also the proof the stop report asked for: it restores the shipped v5.62 behaviour into
# the v5.63 source and requires the new extinction invariant to fail. The v5.63 leg of t33 asserts
# the fixed behaviour; the v5.62 leg asserts the defect. Neither is a demonstration on its own.
#
# ⚠ ANCHOR ON WHOLE LINES. `kind: "work", tax: "ordinary" }));` appears TWICE in the source — once
# here and once in the Taxes engine's own split, which this release must not touch.

cd "$(dirname "$0")/.."   # run-folder ROOT
SRC=v563.jsx
BAK=/tmp/v563.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v563 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  cp $SRC DangerClose.jsx
  return 0
}

expect () {   # $1 label, $2 min failures, $3 human note
  local n="$1" want="$2" note="$3"
  echo "   ── $n"
  local out fl
  out=$(cd qa && timeout 900 node t33_roth_stream_fica.mjs v563 2>&1)
  fl=$(echo "$out" | grep -oE '[0-9]+ failed' | awk '{s+=$1} END {print s+0}')
  [ -z "$fl" ] && fl=0
  # Print the failing assertion NAMES. A control firing for its OWN reasons reads exactly like one
  # that works; reading them is the only way to tell the two apart. An earlier version of this
  # script piped run() through `tail -1` for the count and threw the names away — the count alone
  # cannot distinguish "group E broke" from "everything broke", which is the whole point of C2a.
  echo "$out" | grep '✗' | sed 's/^/       /'
  if [ "$fl" -ge "$want" ]; then echo "     ✓ CONTROL FIRED ($fl failed, needed ≥$want) — $note"
  else echo "     ✗✗ CONTROL DID NOT FIRE ($fl failed, needed ≥$want). THIS IS THE FINDING — $note"; fi
  cp $BAK $SRC; rebuild
}

restore_and_verify () {
  cp $BAK $SRC; rebuild
  local out; out=$(cd qa && node t33_roth_stream_fica.mjs v563 2>&1)
  echo "   baseline restored: $(echo "$out" | grep -oE '[0-9]+ passed, [0-9]+ failed')"
}

echo "controls_v563 — negative controls, v5.63 earned-only FICA"
echo "   pristine baseline first:"
rebuild; restore_and_verify

# ── C1 · the whole fix: annualWork stops filtering, so non-work income is `work` again ──
echo
echo "C1 · revert the earned-only filter (restores shipped v5.62 behaviour)"
python3 - <<'EOF'
import re,io
p="v563.jsx"; s=open(p,encoding="utf-8").read()
old='const annualWork = yr => spouseBWorkTaper(yr, P.retireYr) + Math.round(streamsAnnualAt(yr, { kind: "work", tax: "ordinary" }));'
new='const annualWork = yr => spouseBWorkTaper(yr, P.retireYr) + Math.round(streamsAnnualAt(yr, { tax: "ordinary" }));'
assert s.count(old)==1, "C1 anchor not unique: %d" % s.count(old)
open(p,"w",encoding="utf-8").write(s.replace(old,new))
EOF
rebuild
expect "C1" 6 "rental income is charged FICA again; the extinction invariant must break"

# ── C2a · half-fix: the MAIN path is correct, the ACA sale sub-engine is not ──
echo
echo "C2a · push the unfiltered total back into _estSaleGain's FICA only (site L4015)"
python3 - <<'EOF'
p="v563.jsx"; s=open(p,encoding="utf-8").read()
old='const ficaC = work > 0 ? Math.min(work, infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * 0.062 + work * 0.0145 : 0;'
new='const ficaC = (work + otherOrd) > 0 ? Math.min((work + otherOrd), infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * 0.062 + (work + otherOrd) * 0.0145 : 0;'
assert s.count(old)==1, "C2a anchor not unique: %d" % s.count(old)
open(p,"w",encoding="utf-8").write(s.replace(old,new))
EOF
rebuild
expect "C2a" 1 "group E (ACA bridge) must break while C and D stay green — the partial-fix case"

# ── C2b · the mirror half-fix: the sale path is correct, the MAIN path is not ──
echo
echo "C2b · push the unfiltered total back into the main FICA only (site L4134)"
python3 - <<'EOF'
p="v563.jsx"; s=open(p,encoding="utf-8").read()
old='const fica = work > 0 ? Math.min(work, infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * 0.062 + work * 0.0145 : 0;'
new='const fica = (work + otherOrd) > 0 ? Math.min((work + otherOrd), infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * 0.062 + (work + otherOrd) * 0.0145 : 0;'
assert s.count(old)==1, "C2b anchor not unique: %d" % s.count(old)
open(p,"w",encoding="utf-8").write(s.replace(old,new))
EOF
rebuild
expect "C2b" 4 "the main-path extinction invariant must break"

# ── C3 · the state-base decomposition, main call site ──
# The fix must leave the STATE base unchanged: `work` lost otherOrd, so the call site adds it back.
# Dropping that addition under-taxes the state layer without touching FICA.
echo
echo "C3 · revert the main state base to bare \`work\` (drops otherOrd from the state layer)"
python3 - <<'EOF'
p="v563.jsx"; s=open(p,encoding="utf-8").read()
old='retIncome: rmd + conv, pen: pen, work: work + otherOrd, capGains: qdcg,'
new='retIncome: rmd + conv, pen: pen, work: work, capGains: qdcg,'
assert s.count(old)==1, "C3 anchor not unique: %d" % s.count(old)
open(p,"w",encoding="utf-8").write(s.replace(old,new))
EOF
rebuild
expect "C3" 1 "the exact-FICA delta must break — the delta would carry lost state tax as well"

# ── C4 · the state-base decomposition, ACA sale sub-engine ──
echo
echo "C4 · revert the sale-path state base to bare \`work\`"
python3 - <<'EOF'
p="v563.jsx"; s=open(p,encoding="utf-8").read()
old='retIncome: rmd + c, pen: pen, work: work + otherOrd, capGains: qdcgC,'
new='retIncome: rmd + c, pen: pen, work: work, capGains: qdcgC,'
assert s.count(old)==1, "C4 anchor not unique: %d" % s.count(old)
open(p,"w",encoding="utf-8").write(s.replace(old,new))
EOF
rebuild
expect "C4" 1 "group E must break — the sale path's state base is a separate site"

echo
echo "── restoring pristine source ──"
restore_and_verify
