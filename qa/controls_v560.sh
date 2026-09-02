#!/bin/bash
# controls_v560.sh — §B2 negative controls for the v5.60 Rhode Island / Wisconsin age-floor release.
# SCOPE_EXCL_AGE_RI_WI.md §5(e). Seven controls plus the C0 comment-only null control.
#
# Each control reverts ONE thing the release ships and asserts the suite FAILS. A control that does
# NOT fire is the finding (OPERATIONS §B2), not a reason to adjust it. And a control that fires is
# only worth something once its failure has been READ — v5.59's first C4 anchored on `excl65: 24000`
# and patched COLORADO, reporting one confident failure that had nothing to do with Wisconsin.
# ⚠ ANCHOR ON THE STATE ENTRY, never on a bare `exclAge:` / `excl65:` string.
#
# C8 is the one this release exists for: it narrows the widened L658 matcher back to its v5.55 range
# and proves the widening is load-bearing rather than decorative.
#
# Rebuilds EVERY artifact a named suite consumes before running it — the v5.43-era trap where only
# app_<tag>.mjs was rebuilt and t24 read a clean dom bundle produced four FALSE verdicts.
cd "$(dirname "$0")/.."   # run-folder ROOT: sources live here, suites under qa/
SRC=v560.jsx
BAK=/tmp/v560.pristine.jsx
SUITE=/tmp/t10_v560.pristine.mjs
cp $SRC $BAK
cp qa/t10_taxcases.mjs $SUITE

rebuild () {
  bash qa/mk_testable.sh v560 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v560.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v560.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v560.mjs qa/app_testable.mjs
  cp qa/dom_v560.cjs qa/dom_bundle.cjs
  cp $SRC DangerClose.jsx; cp $SRC qa/DangerClose.jsx
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
    # print the failing assertion NAMES — a control that fires for its own reasons reads
    # exactly like a check that works, and the only way to tell them apart is to read it.
    [ "$fl" != "0" ] && echo "$out" | grep -E '^\s+✗' | head -6 | cut -c1-150
  done
  # EXPECT=none inverts the verdict: for a null control, firing nothing is the PASS. Without
  # this the C0 line read "THIS IS THE FINDING" on a correct run, which is a control that
  # reports its own success as a failure — the same class of defect these controls hunt.
  if [ "${EXPECT:-fail}" = "none" ]; then
    if [ "$tot" -gt 0 ]; then echo "   *** FIRED — THIS IS THE FINDING (a null control must not fire) ***"
    else echo "   *** correctly silent ***"; fi
  else
    if [ "$tot" -gt 0 ]; then echo "   *** CAUGHT *** ($tot failures)"
    else echo "   *** NOT CAUGHT — THIS IS THE FINDING ***"; fi
  fi
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
rebuild && EXPECT=none run C0 "t10_taxcases.mjs:v560" "t1_units.mjs:v560" "t31_disclosure_parity.mjs:v560"
cp $BAK $SRC

control "C1 . RI exclAge REMOVED, note intact (expect t10: identity, 66/66, 68/66, membership, note-vs-code)" "
s=open('$SRC').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1
a='excl65: 50000, exclAge: 67,'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'excl65: 50000,'))" \
  "t10_taxcases.mjs:v560"

control "C2 . WI exclAge REMOVED, note intact (expect t10: identity, 66/66, 68/66, membership, note-vs-code)" "
s=open('$SRC').read()
k='WI: { name: \"Wisconsin\"'; assert s.count(k)==1
a='excl65: 24000, exclAge: 67,'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'excl65: 24000,'))" \
  "t10_taxcases.mjs:v560"

control "C3 . RI exclAge set to 65 rather than removed — the SILENT form of the same defect" "
s=open('$SRC').read()
a='excl65: 50000, exclAge: 67,'
assert s.count(a)==1, s.count(a)
open('$SRC','w').write(s.replace(a,'excl65: 50000, exclAge: 65,'))" \
  "t10_taxcases.mjs:v560"

control "C4 . RI note reverted to its v5.59 'from 65 / optimistic otherwise' clause, exclAge intact" "
s=open('$SRC').read()
a='applies the \$50,000 from age 67, the full retirement age the statute requires, to all retirement income — it still ignores the cliff and the IRA distinction, so conservative under the cliff and optimistic above it'
assert s.count(a)==1, s.count(a)
b='applies the \$50,000 from 65 to all retirement income, ignoring the cliff — mixed direction: conservative under the cliff past 67, optimistic otherwise'
open('$SRC','w').write(s.replace(a,b))" \
  "t10_taxcases.mjs:v560" "t31_disclosure_parity.mjs:v560"

control "C5 . WI note reverted to its v5.59 'applies it from 65 — optimistic' clause, exclAge intact" "
s=open('$SRC').read()
a='the model applies it from age 67, as the statute requires'
assert s.count(a)==1, s.count(a)
b='the model applies it from 65 — optimistic in the 65-66 window, matches the statute from 67'
open('$SRC','w').write(s.replace(a,b))" \
  "t10_taxcases.mjs:v560" "t31_disclosure_parity.mjs:v560"

control "C6 . RI note drops 'from age 67' for the v5.59 phrasing — invisible to the L658 matcher (finding 2)" "
s=open('$SRC').read()
a='applies the \$50,000 from age 67, the full retirement age the statute requires, to'
assert s.count(a)==1, s.count(a)
b='applies the \$50,000, which the statute allows only at full retirement age (67), to'
open('$SRC','w').write(s.replace(a,b))" \
  "t10_taxcases.mjs:v560"

control "C7 . one version site left at v5.59 (app footer) — expect t1 STATIC" "
s=open('$SRC').read()
a='DANGER CLOSE v5.60 \u2502 Not financial advice'
assert s.count(a)==1
open('$SRC','w').write(s.replace(a,'DANGER CLOSE v5.59 \u2502 Not financial advice'))" \
  "t1_units.mjs:v560"

# ── C8 · the SUITE control, not a source control ──────────────────────────────────────────
# Narrow the widened L658 matcher back to its v5.55 range. The prior leg's pin must then FAIL,
# because the pre-fix WI note stops being visible to it. This is what proves the widening is
# load-bearing: without it the invariant passes on both legs and asserts nothing about 67.
echo ""; echo "── C8 . L658 matcher narrowed back to (5\\d|6[0-4]) — expect the v5.59 leg pin to FAIL"
cp $BAK $SRC
python3 -c "
s=open('qa/t10_taxcases.mjs').read()
a='const _AGE_NOTE = /\\\\bfrom age (5\\\\d|6[0-46-9]|7\\\\d)\\\\b|\\\\b(5\\\\d|6[0-46-9]|7\\\\d)\\\\+/;'
assert s.count(a)==1, s.count(a)
b='const _AGE_NOTE = /\\\\bfrom age (5\\\\d|6[0-4])\\\\b|\\\\b(5\\\\d|6[0-4])\\\\+/;'
open('qa/t10_taxcases.mjs','w').write(s.replace(a,b))" \
  && rebuild && run C8 "t10_taxcases.mjs:v559" "t10_taxcases.mjs:v560"
cp $SUITE qa/t10_taxcases.mjs

echo ""; echo "=== restoring pristine source, suite and artifacts ==="
cp $BAK $SRC
cp $SUITE qa/t10_taxcases.mjs
rebuild && echo "restored source: $(md5sum $SRC | awk '{print $1}')"
echo "restored suite : $(md5sum qa/t10_taxcases.mjs | awk '{print $1}')"
