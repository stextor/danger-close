#!/bin/bash
# controls_v565.sh — NEGATIVE CONTROLS for the v5.65 Connecticut populate release.
# OPERATIONS §B2: a green suite is not evidence of coverage. Each control breaks ONE thing in
# Connecticut's rule row, rebuilds, and asserts t35 FAILS. A control that does not fire is the
# finding — do NOT adjust the control until it fires; work out what the suite is blind to.
#
# ⚠ THESE TARGET THE STATE ROW, NOT THE EVALUATOR. controls_v564.sh already breaks the evaluator
# against t34. This file exists because a populate release can be wrong in ways the evaluator is
# entirely correct about: a transcribed threshold, a dropped comparator, a missing age key.
#
# Usage: bash qa/controls_v565.sh   (run from the run-folder root; restores the source afterwards)
set -u
cd "$(dirname "$0")/.."
cp v565.jsx /tmp/ctl565_orig.jsx
run_ctl () {  # $1 label, $2 old, $3 new
  python3 - "$2" "$3" <<'PY'
import sys
s=open('v565.jsx').read()
old,new=sys.argv[1],sys.argv[2]
assert s.count(old)==1, f"control anchor not unique: {old!r} x{s.count(old)}"
open('v565.jsx','w').write(s.replace(old,new))
PY
  if [ $? -ne 0 ]; then echo "  ANCHOR FAILED: $1"; cp /tmp/ctl565_orig.jsx v565.jsx; return; fi
  ./qa/mk_testable.sh v565 >/dev/null 2>&1
  if node qa/t35_state_populate.mjs v565 >/tmp/ctl565.log 2>&1; then
    echo "  ✗ DID NOT FIRE: $1   <-- t35 is blind to this. That is the finding."
  else
    echo "  ✓ fired ($(grep -c '✗' /tmp/ctl565.log) checks): $1"
  fi
  cp /tmp/ctl565_orig.jsx v565.jsx
}
echo "== v5.65 negative controls (Connecticut's row) =="

# THE COMPARATOR. Connecticut is the only one of the five that is exclusive at the band top; this
# is the control that proves the §C threshold pins are load-bearing rather than decorative.
run_ctl "comparator: flip CT to 'lte' — the boundary at \$150,000 grants 2.5% instead of nothing" \
  'unit: "household", cmp: "lt"' 'unit: "household", cmp: "lte"'

# THE AGE KEY. Without exclAge the engine defaults _floor to 65 and denies the exemption to every
# under-65 household — the pessimistic failure this release exists to remove, and the one the
# handoff's premise got wrong.
run_ctl "age: drop exclAge, so the engine's default 65 floor silently reappears" \
  'excl65: 0, exclAge: 0,' 'excl65: 0,'

# THE BASE. `agi` includes federally-taxable Social Security; `agiExSS` does not. B-7 is the case
# that discriminates them.
run_ctl "base: switch CT to agiExSS, dropping taxable SS from the measure" \
  'kind: "bands", base: "agi"' 'kind: "bands", base: "agiExSS"'

# THE UNIT. Connecticut is per RETURN. Per-person would double the exemption for every couple.
run_ctl "unit: make CT per-person instead of per-return" \
  'base: "agi", unit: "household"' 'base: "agi", unit: "person"'

# A TRANSCRIBED THRESHOLD. One digit in one row of one column.
run_ctl "table: mistype the joint 40% threshold as \$125,000" \
  '{ upTo: 115000, pct: 0.55 }, { upTo: 120000, pct: 0.40 }' \
  '{ upTo: 115000, pct: 0.55 }, { upTo: 125000, pct: 0.40 }'

# A TRANSCRIBED FACTOR.
run_ctl "table: mistype the joint band-8 factor as 0.5 instead of 0.05" \
  '{ upTo: 140000, pct: 0.05 }' '{ upTo: 140000, pct: 0.5 }'

# THE SINGLE COLUMN. A build that populated only the joint table would pass every MFJ case.
run_ctl "table: point the single column at the joint thresholds" \
  '{ upTo: 75000, pct: 1 }' '{ upTo: 100000, pct: 1 }'

# THE TERMINAL ZERO ROW. Removing it relies on the evaluator's no-matching-row fallthrough; it
# must still grant zero, so this control is expected NOT to change any figure — it is here to
# record that the tenth row is presentational, matching the statute's ten, not load-bearing.
run_ctl "table: delete the terminal 'and up -> 0' joint row (no FIGURE moves; A-2's row count is what catches it)" \
  '{ upTo: 150000, pct: 0.025 },
        { upTo: Infinity, pct: 0 },' '{ upTo: 150000, pct: 0.025 },'

# THE SCALAR. `excl65` is unread once exclTest is present; writing a dollar figure into it is the
# obvious wrong repair, and A-8 exists to catch it.
run_ctl "scalar: write a dollar figure into CT's excl65 beside the table" \
  'excl65: 0, exclAge: 0,' 'excl65: 50000, exclAge: 0,'

# THE DISCLOSURE. §D locks the note against going stale, in both directions.
run_ctl "note: restore the old 'not modeled' wording the release falsified" \
  'pension/IRA exemption phased on federal AGI' 'pension/IRA exemptions income-limited (not modeled), phased on federal AGI'

run_ctl "note: drop the dividend/interest omission disclosure" \
  'but NOT dividends or interest' 'and dividends and interest'

cp /tmp/ctl565_orig.jsx v565.jsx
./qa/mk_testable.sh v565 >/dev/null 2>&1
echo "source restored; rebuild verified"
