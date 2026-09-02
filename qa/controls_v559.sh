#!/bin/bash
# controls_v559.sh — §B2 negative controls for the v5.59 Rhode Island / Wisconsin stale-figure release.
# SCOPE_EXCL65_STALE_RI_WI.md §5(d). Six controls plus the C0 comment-only null control.
# ⚠ Scope §5(d) expected control 1 (constant reverted, note intact) to fail the t31 RI key. A t31
# key reads PROSE and cannot see STATE_RULES.excl65, so that expectation was impossible by
# construction; the constant is caught by t10 §2E (boolean identity + hand case). Recorded in §8.
# ⚠ C4's first edition anchored on `excl65: 24000, note: "` and patched COLORADO (also 24000): 1 failure,
#   the wrong one, and the WI key untouched — a control failing for its own reasons. Anchors now key
#   on the state entry. Read every failure before believing it.
# Each control reverts ONE property of the release and asserts the suite FAILS.
# A control that does not fire is the finding (OPERATIONS §B2), not a reason to adjust it.
#
# Rebuilds EVERY artifact a named suite consumes before running it — the v5.43-era trap where
# only app_<tag>.mjs was rebuilt and t24 read a clean dom bundle produced four FALSE verdicts.
cd "$(dirname "$0")/.."   # run-folder ROOT: sources live here, suites under qa/ (v5.57 edition cd-ed into qa/ and could not find the source)
SRC=v559.jsx
BAK=/tmp/v559.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v559 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v559.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v559.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v559.mjs qa/app_testable.mjs
  cp qa/dom_v559.cjs qa/dom_bundle.cjs
  cp $SRC DangerClose.jsx; cp $SRC qa/DangerClose.jsx
  # every artifact must be NEWER than the source it was built from, or no verdict is earned
  for a in qa/app_v559.mjs qa/dom_v559.cjs qa/app_testable.mjs qa/dom_bundle.cjs qa/DangerClose.jsx; do
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
rebuild && run C0 "t10_taxcases.mjs:v559" "t1_units.mjs:v559" "t31_disclosure_parity.mjs:v559"
cp $BAK $SRC

control "C1 . RI constant reverted to 20000, note intact (expect t10 only: identity + hand case + note-vs-constant)" "
s=open('$SRC').read()
a='excl65: 50000, note: \"SS and a \$50,000 pension/401k'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'excl65: 20000, note: \"SS and a \$50,000 pension/401k'))" \
  "t10_taxcases.mjs:v559" "t31_disclosure_parity.mjs:v559"

control "C2 . WI constant reverted to 5000, note intact (expect t10 only)" "
s=open('$SRC').read()
a='excl65: 24000, note: \"\$24,000 retirement-income exclusion'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'excl65: 5000, note: \"\$24,000 retirement-income exclusion'))" \
  "t10_taxcases.mjs:v559" "t31_disclosure_parity.mjs:v559"

control "C3 . RI note reverted to the v5.58 string, constant intact (expect t31 RI key + t10 note checks)" "
s=open('$SRC').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1
i=s.index('excl65: 50000, note: \"', s.index(k)); j=s.index('\"', i+len('excl65: 50000, note: \"'))
old=s[i:j+1]; assert s.count(old)==1 and 'pension/401k exclusion per person' in old
open('$SRC','w').write(s.replace(old,'excl65: 50000, note: \"SS + \$20K pension/401k exclusions income-limited\"'))" \
  "t10_taxcases.mjs:v559" "t31_disclosure_parity.mjs:v559"

control "C4 . WI note reverted to the v5.58 string, constant intact (expect t31 WI key + t10 note checks; F-6 set back to 5)" "
s=open('$SRC').read()
k='WI: { name: \"Wisconsin\"'; assert s.count(k)==1
i=s.index('excl65: 24000, note: \"', s.index(k)); j=s.index('\"', i+len('excl65: 24000, note: \"'))
old=s[i:j+1]; assert s.count(old)==1 and 'retirement-income exclusion per person' in old
open('$SRC','w').write(s.replace(old,'excl65: 24000, note: \"\$5K retirement exclusion (income-limited)\"'))" \
  "t10_taxcases.mjs:v559" "t31_disclosure_parity.mjs:v559"

control "C5 . RI note keeps the figure but drops the FRA/IRA/cliff disclosure (the v5.26 half-edit class)" "
s=open('$SRC').read()
a='; the exclusion also requires full retirement age (67) and does not cover IRA distributions'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,''))" \
  "t10_taxcases.mjs:v559"

control "C6 . WI note phrased 'no income limit' — true sentence, wrong F-6 membership (the D-F trap)" "
s=open('$SRC').read()
a='not income-tested;'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'no income limit;'))" \
  "t10_taxcases.mjs:v559"

control "C7 . one version site left at v5.58 (app footer)" "
s=open('$SRC').read()
a='DANGER CLOSE v5.59 \u2502 Not financial advice'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'DANGER CLOSE v5.58 \u2502 Not financial advice'))" \
  "t1_units.mjs:v559"

echo ""; echo "=== restoring pristine source and artifacts ==="
cp $BAK $SRC
rebuild && echo "restored: $(md5sum $SRC | awk '{print $1}')"
