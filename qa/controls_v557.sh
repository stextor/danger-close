#!/bin/bash
# controls_v557.sh — §B2 negative controls for the v5.57 Social Security offset.
# Each control reverts ONE property of the release and asserts the suite FAILS.
# A control that does not fire is the finding (OPERATIONS §B2), not a reason to adjust it.
#
# Rebuilds EVERY artifact a named suite consumes before running it — the v5.43-era trap where
# only app_<tag>.mjs was rebuilt and t24 read a clean dom bundle produced four FALSE verdicts.
cd "$(dirname "$0")"
SRC=v557.jsx
BAK=/tmp/v557.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v557 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v557.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v557.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v557.mjs qa/app_testable.mjs
  cp qa/dom_v557.cjs qa/dom_bundle.cjs
  cp $SRC DangerClose.jsx; cp $SRC qa/DangerClose.jsx
  # every artifact must be NEWER than the source it was built from, or no verdict is earned
  for a in qa/app_v557.mjs qa/dom_v557.cjs qa/app_testable.mjs qa/dom_bundle.cjs qa/DangerClose.jsx; do
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
rebuild && run C0 "t10_taxcases.mjs:v557" "t1_units.mjs:v557"
cp $BAK $SRC

control "C1 . the Kentucky rate reverted to 4% (the whole release)" "
s=open('$SRC').read()
a='rate: 0.035'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'rate: 0.04'))" \
  "t10_taxcases.mjs:v557"

control "C2 . rate corrected but the NOTE left without the year (the drift class)" "
s=open('$SRC').read()
a='. Rate is 3.5% effective 2026 (HB 1, 2025 — KRS 141.020); Kentucky can cut it again by annual trigger, so check the year'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,''))" \
  "t10_taxcases.mjs:v557"

control "C3 . Delaware pushed to the HB 108 figure that is NOT law" "
s=open('$SRC').read()
a='excl65: 12500'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'excl65: 25000'))" \
  "t10_taxcases.mjs:v557"

control "C4 . DE military-pension disclosure removed (decision D-4)" "
s=open('$SRC').read()
a='. United States military pensions are excluded under a separate and more generous rule that is not modelled either'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,''))" \
  "t10_taxcases.mjs:v557"

control "C5 . one version site left at v5.56 (app footer)" "
s=open('$SRC').read()
a='DANGER CLOSE v5.57 \u2502 Not financial advice'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'DANGER CLOSE v5.56 \u2502 Not financial advice'))" \
  "t1_units.mjs:v557"

echo ""; echo "=== restoring pristine source and artifacts ==="
cp $BAK $SRC
rebuild && echo "restored: $(md5sum $SRC | awk '{print $1}')"
