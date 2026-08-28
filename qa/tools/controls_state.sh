#!/bin/bash
# controls_state.sh — NEGATIVE CONTROLS for the state-census split (2026-08-28).
#
# usage:  bash qa/tools/controls_state.sh <run-folder>
#         where <run-folder> is the flat working folder built per qa/qa-baseline/README.md,
#         with app_testable.mjs already built. It is COPIED, never mutated in place.
#
# WHAT THIS IS FOR. Each control breaks exactly ONE thing and requires the matching t29
# assertion to go RED. A check that has never been observed failing is not evidence
# (OPERATIONS §B2) — it is a check that might be asserting nothing at all.
#
# WHY IT EXISTS SEPARATELY FROM t29. t29 §C re-derives the FLIP assertions from each fixture's
# declared `flips` on every run, so those are self-testing. F-5 through F-8 are not: they are
# property pins, and nothing re-derives them.
#   ⚠ These controls were LEFT OUT of the release that added F-5..F-8, on the reasoning that
#   §C already re-derived them. That reasoning covers S5 ONLY. A valid argument about one
#   control was generalised to five, and for one release there was no durable evidence that
#   four of the seven new assertions could fail. Recorded here so the shortcut is not retaken.
#
# ⚠ S4 REBUILDS THE APP from a patched copy of v553.jsx. It is the slowest control and the one
# most worth keeping: without F-6, `state_excl_limited` could match zero states and every
# assertion about it would pass vacuously. This release cycle hit green-from-an-empty-set THREE
# separate times. Whenever a check passes, ask what it would have taken to fail.
set -u
RUN="${1:?usage: controls_state.sh <run-folder>   (the flat working folder, per qa-baseline/README.md)}"
SCRATCH="${TMPDIR:-/tmp}/nc29"
PASS=0; MISS=0

prep () { rm -rf "$SCRATCH"; cp -r "$RUN" "$SCRATCH"; }
run  () { ( cd "$SCRATCH"/qa && node t29_boundaries.mjs v553 2>&1 ); }
want () {  # $1 label, $2 assertion id
  local out; out=$(run)
  if echo "$out" | grep -q "✗ $2"; then PASS=$((PASS+1)); printf "  ✓ FIRED  %-8s %s\n" "$2" "$1"
  else MISS=$((MISS+1)); printf "  ✗ DID NOT FIRE  %-8s %s\n" "$2" "$1"
       echo "$out" | grep -E "✗" | head -2 | sed 's/^/         also-red: /'; fi
}

echo "NEGATIVE CONTROLS — state census split"

prep
# S1: hardcode a state code in the census, the exact drift F-5 exists to stop.
sed -i 's|const LIMIT_NOTE = |const _HARDCODED = ["NJ"]; const LIMIT_NOTE = |' "$SCRATCH"/qa/tools/boundaries.mjs
want "S1 a state code is written into the census source" "F-5"

prep
# S2: the D-3c fixture loses its state code, so the row it exists to light goes dark.
sed -i 's|P.stateCode = "NJ"; P.stateName = "New Jersey";|P.stateName = "New Jersey";|' \
  "$SCRATCH"/qa/tools/fixture/households.mjs
want "S2 stateExclCliff loses its stateCode" "F-7"

prep
# S3: the legacy fixture is given a REAL state code, collapsing the distinction the split makes.
sed -i 's|P.stateTaxRate = 0.05; P.stateName = "Test State"; P.stateCode = "TS";|P.stateTaxRate = 0.05; P.stateName = "New York"; P.stateCode = "NY";|' \
  "$SCRATCH"/qa/tools/fixture/households.mjs
want "S3 the legacy fixture uses a real STATE_RULES key" "F-8"

prep
# S4: THE EMPTY-SET CONTROL. Strip every income-limit note from STATE_RULES and rebuild, so no
# state matches and `state_excl_limited` can never read ON. Without F-6 every assertion about
# that row would pass vacuously — green from an empty set, which this session found twice in its
# own tooling. This control costs a rebuild; it is worth it.
sed -i 's/INCOME-LIMITED/UNCONDITIONAL/g; s/income-limited/unconditional/g; s/income limit/no limit/g' \
  "$SCRATCH"/v553.jsx
( cd "$SCRATCH" && bash qa/mk_testable.sh v553 >/dev/null 2>&1 && cp qa/app_v553.mjs qa/app_testable.mjs )
want "S4 no STATE_RULES entry flags an income limit (empty-set guard)" "F-6"

prep
# S5: the reverse direction — a fixture that declares a flip it does not produce must be caught
# by section C, not silently accepted.
sed -i 's|flips: \["state_code"\],\n|flips: ["state_code","income_streams"],|' "$SCRATCH"/qa/tools/fixture/households.mjs
python3 - <<'PY'
import io
p="/tmp/nc29/qa/tools/fixture/households.mjs"
t=io.open(p,encoding="utf-8").read()
t=t.replace('    flips: ["state_code"],\n    apply: P => {\n      P.stateCode = "NY";',
            '    flips: ["state_code","income_streams"],\n    apply: P => {\n      P.stateCode = "NY";',1)
io.open(p,"w",encoding="utf-8").write(t)
PY
want "S5 a fixture declares a flip it does not produce" "C-stateProgressive/income_streams"

rm -rf "$SCRATCH"
echo
echo "CONTROLS: $PASS fired, $MISS did not"
[ "$MISS" -gt 0 ] && { echo "  A control that does not fire is a FINDING — investigate the check, never soften it."; exit 1; }
exit 0
