#!/bin/bash
# controls_v561.sh — §B2 negative controls for the v5.61 Rhode Island threshold correction.
# SCOPE_RI_THRESHOLD_CORRECTION.md §5. Five controls plus the C0 comment-only null control.
#
# Each control reverts ONE thing the release ships and asserts the suite FAILS. A control that does
# NOT fire is the finding (OPERATIONS §B2), not a reason to adjust it. And a control that fires is
# only worth something once its failure has been READ — v5.59's first C4 anchored on `excl65: 24000`
# and patched COLORADO, reporting one confident failure that had nothing to do with Wisconsin.
# ⚠ ANCHOR ON THE STATE ENTRY, never on a bare `133,750` / `133,500` string. That the corrected
#   figure happens to be unique in the source today is a coincidence, not a property to rely on.
#
# C1 is the one this release exists for: it reverts the figure and proves the [FIXED v5.61]
# assertion can fail. An assertion that cannot fail is the defect this project has caught in its
# own tests twice.
# C4 is the one the scope did NOT ask for: it proves the gated split is a SPLIT rather than an
# inversion, by asserting the frozen v5.60 leg still fails when its own pre-fix pin is falsified.
#
# Rebuilds EVERY artifact a named suite consumes before running it — the v5.43-era trap where only
# app_<tag>.mjs was rebuilt and t24 read a clean dom bundle produced four FALSE verdicts.
cd "$(dirname "$0")/.."   # run-folder ROOT: sources live here, suites under qa/
SRC=v561.jsx
BAK=/tmp/v561.pristine.jsx
cp $SRC $BAK

rebuild () {
  bash qa/mk_testable.sh v561 >/dev/null 2>&1 || { echo "   BUILD FAILED"; return 1; }
  npx esbuild qa/dom_entry_v561.jsx --bundle --format=cjs --platform=browser \
    --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v561.cjs --log-level=error >/dev/null 2>&1 \
    || { echo "   BUNDLE FAILED"; return 1; }
  cp qa/app_v561.mjs qa/app_testable.mjs
  cp qa/dom_v561.cjs qa/dom_bundle.cjs
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
    printf "     %-26s %-6s %s failed\n" "$f" "$a" "$fl"
    # print the failing assertion NAMES — a control that fires for its own reasons reads
    # exactly like a check that works, and the only way to tell them apart is to read it.
    [ "$fl" != "0" ] && echo "$out" | grep -E '^\s+✗' | head -6 | cut -c1-160
  done
  # EXPECT=none inverts the verdict: for a null control, firing nothing is the PASS.
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
rebuild && EXPECT=none run C0 "t10_taxcases.mjs:v561" "t1_units.mjs:v561" "t31_disclosure_parity.mjs:v561"
cp $BAK $SRC

control "C1 . the RI threshold reverted to \$133,500 (expect t10: [FIXED v5.61] AND [EXTINCTION v5.61])" "
s=open('$SRC').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1, 'RI entry anchor: %d' % s.count(k)
i=s.index(k); j=s.index('\n', i)          # confine the patch to the RI entry's own line
a='(TY2025: \$133,750 MFJ/\$107,000 single, per ADV 2025-22)'
assert s.count(a,i,j)==1, 'threshold in RI entry: %d' % s.count(a,i,j)
open('$SRC','w').write(s[:i]+s[i:j].replace(a,'(TY2025: \$133,500 MFJ/\$107,000 single)')+s[j:])" \
  "t10_taxcases.mjs:v561"

# ⚠ C2 came back NOT CAUGHT on its first run and that verdict was CORRECT — nothing pinned the
#   citation. The remedy was a new assertion, not a relabelled control (OPERATIONS §B2: do not
#   adjust the control until the check has been proved innocent; this one was guilty).
control "C2 . the citation dropped but the figure kept (expect t10: the ADV 2025-22 pin)" "
s=open('$SRC').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1
i=s.index(k); j=s.index('\n', i)
a='\$133,750 MFJ/\$107,000 single, per ADV 2025-22'
assert s.count(a,i,j)==1
open('$SRC','w').write(s[:i]+s[i:j].replace(a,'\$133,750 MFJ/\$107,000 single')+s[j:])" \
  "t10_taxcases.mjs:v561"

# ⚠ C3: t10 fires, t29 does NOT, and t29's silence is CORRECT BY CONSTRUCTION — F-6 asserts
#   `length > 0` and the guarded set only drops 4 -> 3 (NJ, NM, VA survive). That is the documented
#   near-miss (§B1a): F-6 cannot see a one-member shrink, which is precisely why t10 carries the
#   by-decision pin naming RI explicitly. Do not "fix" t29 here; the pin is the coverage.
control "C3 . RI's note reworded off the F-6 income-limited matcher (expect t10 by-decision pin; t29 silent by construction)" "
s=open('$SRC').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1
i=s.index(k); j=s.index('\n', i)
a='are income-limited in law by a hard AGI cliff'
assert s.count(a,i,j)==1
open('$SRC','w').write(s[:i]+s[i:j].replace(a,'are capped in law by a hard AGI cliff')+s[j:])" \
  "t10_taxcases.mjs:v561" "t29_boundaries.mjs:v561"

control "C4 . one of the four in-app version sites left at v5.60 (expect t1 STATIC)" "
s=open('$SRC').read()
a='DATA LOAD \u2502 v5.61'
assert s.count(a)==1, 'DATA LOAD header: %d' % s.count(a)
open('$SRC','w').write(s.replace(a,'DATA LOAD \u2502 v5.60'))" \
  "t1_units.mjs:v561"

echo ""
echo "── C5 . the SPLIT is a split, not an inversion: falsify the pre-v5.61 pin ON THE FROZEN LEG"
echo "   (v5.60 legitimately carries \$133,500; if its own branch cannot fail, the else-arm is a"
echo "    rubber stamp and the v5.27 defect is back in a new costume)"
cp v560.jsx /tmp/v560.pristine.jsx
python3 -c "
s=open('v560.jsx').read()
k='RI: { name: \"Rhode Island\"'; assert s.count(k)==1
i=s.index(k); j=s.index('\n', i)
a='(TY2025: \$133,500 MFJ/\$107,000 single)'
assert s.count(a,i,j)==1
open('v560.jsx','w').write(s[:i]+s[i:j].replace(a,'(TY2025: \$133,750 MFJ/\$107,000 single)')+s[j:])"
bash qa/mk_testable.sh v560 >/dev/null 2>&1
run C5 "t10_taxcases.mjs:v560"
cp /tmp/v560.pristine.jsx v560.jsx
bash qa/mk_testable.sh v560 >/dev/null 2>&1

# restore every artifact to the pristine v5.61 state
cp $BAK $SRC
rebuild >/dev/null 2>&1
echo ""
echo "=== artifacts restored to pristine v5.61 ==="
