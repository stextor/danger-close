#!/bin/bash
# controls_v564.sh — NEGATIVE CONTROLS for the v5.64 income-conditioning evaluator.
# OPERATIONS §B2: a green suite is not evidence of coverage. Each control breaks ONE thing in the
# source, rebuilds, and asserts t34 FAILS. A control that does not fire is the finding.
# Usage: bash qa/controls_v564.sh   (run from the run-folder root; restores the source afterwards)
set -u
cd "$(dirname "$0")/.."
cp v564.jsx /tmp/ctl_orig.jsx
run_ctl () {  # $1 label, $2 sed-style python replace pair
  python3 - "$2" "$3" <<'PY'
import sys
s=open('v564.jsx').read()
old,new=sys.argv[1],sys.argv[2]
assert s.count(old)==1, f"control anchor not unique: {old!r} x{s.count(old)}"
open('v564.jsx','w').write(s.replace(old,new))
PY
  if [ $? -ne 0 ]; then echo "  ANCHOR FAILED: $1"; cp /tmp/ctl_orig.jsx v564.jsx; return; fi
  ./qa/mk_testable.sh v564 >/dev/null 2>&1
  if node qa/t34_income_conditioning.mjs v564 >/tmp/ctl.log 2>&1; then
    echo "  ✗ DID NOT FIRE: $1   <-- t34 is blind to this. That is the finding."
  else
    echo "  ✓ fired ($(grep -c '✗' /tmp/ctl.log) checks): $1"
  fi
  cp /tmp/ctl_orig.jsx v564.jsx
}
echo "== v5.64 negative controls =="
run_ctl "comparator: force every table to 'lte' (Connecticut's boundary)" \
  't.cmp === "lt" ? m < rw.upTo : m <= rw.upTo' 'm <= rw.upTo'
run_ctl "comparator: force every table to 'lt' (the four inclusive statutes)" \
  't.cmp === "lt" ? m < rw.upTo : m <= rw.upTo' 'm < rw.upTo'
run_ctl "taper: subtract the excess PER SPOUSE instead of once (the Virginia factor-of-two)" \
  'Math.max(0, (t.perPerson || 0) * _qual - Math.max(0, m - thr))' \
  'Math.max(0, ((t.perPerson || 0) - Math.max(0, m - thr)) * _qual)'
run_ctl "base: make agiExSS include taxable SS (collapse the two bases into one)" \
  '(base === "agiExSS" ? 0 : ssTaxableFed)' 'ssTaxableFed'
run_ctl "base: drop capGains from the measure" \
  'retIncome + pen + work + capGains + (base' 'retIncome + pen + work + 0 * capGains + (base'
run_ctl "unit: apply a household cap per person" \
  '(t.unit === "household") ? (_qual > 0 ? per : 0) : per * _qual' 'per * _qual'
run_ctl "unit: apply a per-person amount once" \
  '(t.unit === "household") ? (_qual > 0 ? per : 0) : per * _qual' '(_qual > 0 ? per : 0)'
run_ctl "age floor: ignore it, so everyone qualifies" \
  '((ageA !== null && ageA >= _floor) ? 1 : 0)' '((ageA !== null) ? 1 : 0)'
run_ctl "malformed table: fall back to the scalar instead of granting zero" \
  'if (t.kind !== "bands") return 0;' 'if (t.kind !== "bands") return excl;'
run_ctl "wiring: compute exclFinal but never use it" \
  'Math.max(0, retIncome + pen - exclFinal)' 'Math.max(0, retIncome + pen - excl)'
./qa/mk_testable.sh v564 >/dev/null 2>&1
echo "source restored: $(md5sum v564.jsx | cut -d' ' -f1)"
