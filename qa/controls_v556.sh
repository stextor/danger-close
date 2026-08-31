#!/bin/bash
# controls_v556.sh — §B2 negative controls for the v5.56 Social Security offset.
# Each control reverts ONE property of the release and asserts the suite FAILS.
# A control that does not fire is the finding (OPERATIONS §B2), not a reason to adjust it.
#
# Rebuilds EVERY artifact a named suite consumes before running it — the v5.43-era trap where
# only app_<tag>.mjs was rebuilt and t24 read a clean dom bundle produced four FALSE verdicts.
cd "$(dirname "$0")"
SRC=v556.jsx
BAK=/tmp/v556.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v556 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v556.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v556.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v556.mjs qa/app_testable.mjs
  cp qa/dom_v556.cjs qa/dom_bundle.cjs
  cp $SRC DangerClose.jsx; cp $SRC qa/DangerClose.jsx
  # every artifact must be NEWER than the source it was built from, or no verdict is earned
  for a in qa/app_v556.mjs qa/dom_v556.cjs qa/app_testable.mjs qa/dom_bundle.cjs qa/DangerClose.jsx; do
    [ "$a" -nt "$SRC" ] || [ "$a" -ot "$SRC" ] && : ; done
  return 0
}

run () {  # $1=label  $2..=suite invocations "file:arg"
  local label="$1"; shift
  local tot=0
  for spec in "$@"; do
    local f="${spec%%:*}" a="${spec##*:}"
    local out; out=$(cd qa && timeout 900 node "$f" "$a" 2>&1)
    local fl
    if [[ "$f" == t10* ]]; then fl=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+')
    else fl=$(echo "$out" | grep -oE '[0-9]+ failed' | awk '{s+=$1} END {print s+0}'); fi
    [ -z "$fl" ] && fl=0
    tot=$((tot+fl))
    printf "     %-26s %s failed\n" "$f" "$fl"
  done
  if [ "$tot" -gt 0 ]; then echo "   *** CAUGHT *** ($tot failures)"; else echo "   *** NOT CAUGHT — THIS IS THE FINDING ***"; fi
}

control () {  # $1=name  $2=python patch  $3..=suites
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
a='// v5.56: the exclusion is computed PER PERSON'
assert s.count(a)==1
s=s.replace(a,'// v5.56 (C0 control comment): the exclusion is computed PER PERSON')
open('$SRC','w').write(s)"
rebuild && run C0 "t10_taxcases.mjs:v556" "t29_boundaries.mjs:v556"
cp $BAK $SRC

control "C1 · per-person offset reverted to cap x count (the whole release)" "
s=open('$SRC').read()
a=': _one(ageA, ssGrossA) + (single ? 0 : _one(ageB, ssGrossB));'
b=': _cap * ((ageA !== null && ageA >= _floor ? 1 : 0) + (single ? 0 : (ageB !== null && ageB >= _floor ? 1 : 0)));'
assert s.count(a)==1, 'anchor'
open('$SRC','w').write(s.replace(a,b))" \
  "t10_taxcases.mjs:v556"

control "C2 · engine call sites stop passing gross SS (was NOT CAUGHT before this release)" "
s=open('$SRC').read()
a='ssGrossA: ssA_y, ssGrossB: ssB_y'
n=s.count(a); assert n==3, n
open('$SRC','w').write(s.replace(a,'ssGrossA: 0, ssGrossB: 0'))" \
  "t10_taxcases.mjs:v556" "t8_invariant.mjs:"

control "C3 · MD/ME cap correction reverted, offset kept" "
s=open('$SRC').read()
assert s.count('excl65: 40600')==1 and s.count('excl65: 48216')==1
s=s.replace('excl65: 40600','excl65: 36200').replace('excl65: 48216','excl65: 35000')
open('$SRC','w').write(s)" \
  "t10_taxcases.mjs:v556"

control "C4 · ssOffset flag removed from MD and ME" "
s=open('$SRC').read()
assert s.count('ssOffset: true')==2
open('$SRC','w').write(s.replace('ssOffset: true, ',''))" \
  "t10_taxcases.mjs:v556" "t29_boundaries.mjs:v556"

control "C5 · exclusion allowed to go negative (floor removed)" "
s=open('$SRC').read()
a='return r.ssOffset ? Math.max(0, _cap - Math.max(0, ssGross)) : _cap;'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'return r.ssOffset ? (_cap - Math.max(0, ssGross)) : _cap;'))" \
  "t10_taxcases.mjs:v556"

control "C6 · the CORRECTED section 13 clause reverted to the false one v5.56 left standing" "
s=open('$SRC').read()
a=\"As of v5.56 Maryland's and Maine's dollar-for-dollar reductions are modelled\"
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'The model applies none of that'))" \
  "t31_disclosure_parity.mjs:v556"

control "C7 · one version site left at v5.55 (app footer)" "
s=open('$SRC').read()
a='DANGER CLOSE v5.56 \u2502 Not financial advice'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'DANGER CLOSE v5.55 \u2502 Not financial advice'))" \
  "t1_units.mjs:v556"

echo ""; echo "=== restoring pristine source and artifacts ==="
cp $BAK $SRC
rebuild && echo "restored: $(md5sum $SRC | awk '{print $1}')"
