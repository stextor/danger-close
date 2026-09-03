#!/bin/bash
# controls_v562.sh — §B2 negative controls for the v5.62 cross-engine state-tax argument fix.
# SCOPE_ENGINE_STATE_PARITY.md §5.
#
# Each control reverts ONE thing the release ships and requires the suite to FAIL. A control that
# does NOT fire is the finding (§B2) — investigate the check, never soften the control.
#
# ⚠ THE CONTROL THAT MATTERS IS C1a/C1b, SEPARATELY. The defect had TWO parts and a partial fix
# would be easy to ship: (a) the federal standard deduction netted off a state base, and (b) `work`
# folded into `retIncome` so wages collected the state RETIREMENT exclusion. Reverting them
# together proves nothing about either. They are reverted independently here.
#
# ⚠ ANCHOR ON THE CALL SITE, never on a bare `retIncome:` string — the DEFINITION carries
# `retIncome = 0` and two other call sites carry `retIncome:` legitimately.
cd "$(dirname "$0")/.."   # run-folder ROOT
SRC=v562.jsx
BAK=/tmp/v562.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v562 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v562.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v562.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v562.mjs qa/app_testable.mjs
  cp qa/dom_v562.cjs qa/dom_bundle.cjs
  cp $SRC DangerClose.jsx; cp $SRC qa/DangerClose.jsx 2>/dev/null
  return 0
}

run () {
  local label="$1"; shift
  local tot=0
  for spec in "$@"; do
    local f="${spec%%:*}" a="${spec##*:}"
    [ "$f" = "$a" ] && a=""
    local out; out=$(cd qa && timeout 900 node "$f" $a 2>&1)
    local fl
    if [[ "$f" == t10* ]]; then fl=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+')
    else fl=$(echo "$out" | grep -oE '[0-9]+ failed' | awk '{s+=$1} END {print s+0}'); fi
    [ -z "$fl" ] && fl=0
    tot=$((tot+fl))
    printf "     %-26s %-6s %s failed\n" "$f" "${a:-—}" "$fl"
    # print the failing assertion NAMES. A control firing for its OWN reasons reads exactly like
    # one that works; the only way to tell them apart is to read it. v5.59's first C4 anchored on
    # `excl65: 24000` and patched COLORADO, reporting a confident failure about Wisconsin.
    [ "$fl" != "0" ] && echo "$out" | grep -E '^\s+✗' | head -4 | cut -c1-155
  done
  if [ "${EXPECT:-fail}" = "none" ]; then
    if [ "$tot" -gt 0 ]; then echo "   *** FIRED — THIS IS THE FINDING (a null control must not fire) ***"
    else echo "   *** correctly silent ***"; fi
  else
    if [ "$tot" -gt 0 ]; then echo "   *** CAUGHT *** ($tot failures)"
    else echo "   *** NOT CAUGHT — THIS IS THE FINDING ***"; fi
  fi
}

control () {
  local name="$1" patch="$2"; shift 2
  echo ""; echo "── $name"
  cp $BAK $SRC
  python3 -c "$patch" || { echo "   PATCH DID NOT APPLY — control is invalid"; cp $BAK $SRC; return; }
  rebuild || { cp $BAK $SRC; return; }
  run "$name" "$@"
  cp $BAK $SRC
}

echo "=== C0 · comment-only edit. MUST NOT fire, or every verdict below is a rubber stamp ==="
cp $BAK $SRC
python3 -c "
s=open('$SRC').read()
a='// v5.62: GROSS components \u2014 see the engine-C call site above for why.'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'// v5.62 (C0 control comment): GROSS components \u2014 see engine C above.'))"
rebuild && EXPECT=none run C0 "t8_invariant.mjs:t8_invariant.mjs" "t10_taxcases.mjs:v562" "t1_units.mjs:v562"
cp $BAK $SRC

control "C1a . engine B reverted to the POST-DEDUCTION figure only (expect t8's netted extinction)" "
s=open('$SRC').read()
a='        retIncome: rmd + conv, pen: pen, work: work, capGains: qdcg,'
assert s.count(a)==1, 'engine B call site: %d' % s.count(a)
open('$SRC','w').write(s.replace(a,'        retIncome: Math.max(0, taxableOrd - ssT), capGains: qdcg,'))" \
  "t8_invariant.mjs:t8_invariant.mjs"

control "C1b . engine C keeps gross totals but FOLDS work into retIncome \u2014 the partial fix (expect t8's decomposition extinction)" "
s=open('$SRC').read()
a='                  retIncome: rmd + c, pen: pen, work: work, capGains: qdcgC,'
assert s.count(a)==1, 'engine C call site: %d' % s.count(a)
open('$SRC','w').write(s.replace(a,'                  retIncome: rmd + c + pen + work, capGains: qdcgC,'))" \
  "t8_invariant.mjs:t8_invariant.mjs"

control "C2 . a FOURTH call site is added (expect t8's site-count check \u2014 it would otherwise be unguarded)" "
s=open('$SRC').read()
a='  const fica = work > 0 ?'
assert s.count(a)==1
inj='  const _ctl = stateTaxAnnual({ code: null, fallbackRate: 0, retIncome: 1 });\n'
open('$SRC','w').write(s.replace(a, inj + a))" \
  "t8_invariant.mjs:t8_invariant.mjs"

control "C3 . the exclusion is applied to WORK as well as retirement income (expect t10 \u00a72E retExempt + spill)" "
s=open('$SRC').read()
a='  return r.rate * (retBase + Math.max(0, work) + ssBase + Math.max(0, capGains));'
assert s.count(a)==1, 'return line: %d' % s.count(a)
open('$SRC','w').write(s.replace(a,'  return r.rate * (Math.max(0, retBase + Math.max(0, work) - 0) + ssBase + Math.max(0, capGains)) - (r.retExempt ? r.rate * Math.max(0, work) : 0);'))" \
  "t10_taxcases.mjs:v562"

control "C4 . one of the four in-app version sites left at v5.61 (expect t1 STATIC)" "
s=open('$SRC').read()
a='DATA LOAD \u2502 v5.62'
assert s.count(a)==1, 'DATA LOAD header: %d' % s.count(a)
open('$SRC','w').write(s.replace(a,'DATA LOAD \u2502 v5.61'))" \
  "t1_units.mjs:v562"

cp $BAK $SRC
rebuild >/dev/null 2>&1
echo ""
echo "=== artifacts restored to pristine v5.62 ==="
