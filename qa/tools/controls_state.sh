#!/bin/bash
# controls_state.sh — NEGATIVE CONTROLS for the state-census split (2026-08-28; REPAIRED 2026-09-10).
#
# usage:  bash qa/tools/controls_state.sh <run-folder> <version-tag>
#         e.g. bash qa/tools/controls_state.sh /tmp/run v568
#         <run-folder> is the flat folder qa/mk_runfolder.sh builds, with <tag>.jsx at its root and
#         qa/app_<tag>.mjs built. It is COPIED, never mutated in place.
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
# ⚠ REPAIRED 2026-09-10 — IT HAD STOPPED BEING ABLE TO RUN, AND ONE CONTROL HAD STOPPED BEING ABLE
#   TO FIRE, AND NOTHING SAID SO. (1) It was hardwired to the `v553` leg, which no run folder built by
#   mk_runfolder.sh contains. (2) S2's sed anchored on New Jersey fixture text; the fixture moved to
#   Virginia at v5.67 and to Rhode Island at v5.68, so the sed matched nothing and S2 would have run
#   an UNMUTATED t29 — reporting "did not fire" at best, and never the true cause. The repair:
#   the tag is an argument; S2 finds the fixture's state from the file instead of naming one; and
#   EVERY mutation is now checked to have changed its target (`applied`), because a mutation that
#   silently does not apply reads exactly like a check that fails to fire. S0, a null control, proves
#   the baseline is green first — a control run against an already-red suite measures nothing
#   (the P29 lesson, OPERATIONS §I).
#
# ⚠ COVERAGE, so nobody retires this as redundant: F-6a/F-6b/F-6c and F-7 are ALSO controlled by
#   qa/tools/controls_v568_va.py (T1–T6). S1 (F-5), S3 (F-8), S4 (F-6's empty-set guard) and S5
#   (section C's flip re-derivation) exist ONLY here.
#
# ⚠ S4 REBUILDS THE APP from a patched copy of <tag>.jsx. It is the slowest control and the one
# most worth keeping: without F-6, `state_excl_limited` could match zero states and every
# assertion about it would pass vacuously. Whenever a check passes, ask what it would have taken to fail.
set -u
RUN="${1:?usage: controls_state.sh <run-folder> <version-tag>}"
VER="${2:?usage: controls_state.sh <run-folder> <version-tag>   (e.g. v568 — no default, on purpose)}"
RUN="$(cd "$RUN" && pwd)"
[ -f "$RUN/$VER.jsx" ] && [ -f "$RUN/qa/app_$VER.mjs" ] || { echo "FATAL: $RUN has no $VER.jsx or qa/app_$VER.mjs — build the run folder for $VER first"; exit 2; }
SCRATCH="${TMPDIR:-/tmp}/nc29"
HH="$SCRATCH/qa/tools/fixture/households.mjs"
PASS=0; MISS=0

# node_modules is SYMLINKED, not copied: the copy is the slow part and nothing here mutates it.
prep () { rm -rf "$SCRATCH"; mkdir -p "$SCRATCH"
          ( cd "$RUN" && tar --exclude=./node_modules -cf - . ) | ( cd "$SCRATCH" && tar -xf - )
          ln -s "$RUN/node_modules" "$SCRATCH/node_modules"; }
run  () { ( cd "$SCRATCH"/qa && node t29_boundaries.mjs "$VER" 2>&1 ); }
sum  () { md5sum "$1" | cut -d' ' -f1; }
applied () {  # $1 label, $2 file, $3 md5 before — a mutation that changed nothing is a MISS, not a pass
  if [ "$(sum "$2")" = "$3" ]; then MISS=$((MISS+1)); printf "  ✗ MUTATION DID NOT APPLY  %s — its anchor has drifted; this is a FINDING\n" "$1"; return 1; fi; }
want () {  # $1 label, $2 assertion id
  local out; out=$(run)
  if echo "$out" | grep -q "✗ $2"; then PASS=$((PASS+1)); printf "  ✓ FIRED  %-8s %s\n" "$2" "$1"
  else MISS=$((MISS+1)); printf "  ✗ DID NOT FIRE  %-8s %s\n" "$2" "$1"
       echo "$out" | grep -E "✗" | head -2 | sed 's/^/         also-red: /'; fi
}

echo "NEGATIVE CONTROLS — state census split ($VER)"

prep
# S0: NULL CONTROL. No mutation: t29 must be fully green, or every control below is uninterpretable.
out=$(run); if echo "$out" | grep -q "✗"; then
  echo "  ✗ S0 BASELINE IS RED — controls cannot distinguish their own mutation from it. Aborting."; echo "$out" | grep "✗" | head -3; exit 1
else PASS=$((PASS+1)); echo "  ✓ SILENT   S0 no mutation — t29 green, as required"; fi

prep
# S1: hardcode a state code in the census, the exact drift F-5 exists to stop.
b=$(sum "$SCRATCH"/qa/tools/boundaries.mjs)
sed -i 's|const LIMIT_NOTE = |const _HARDCODED = ["NJ"]; const LIMIT_NOTE = |' "$SCRATCH"/qa/tools/boundaries.mjs
applied "S1" "$SCRATCH"/qa/tools/boundaries.mjs "$b" && want "S1 a state code is written into the census source" "F-5"

prep
# S2: the D-3c fixture loses its state code, so the row it exists to light goes dark. The state is
# READ from the stateExclCliff block, never named here — naming it is what broke this control twice.
b=$(sum "$HH")
HH="$HH" python3 - <<'PY'
import io, os, re, sys
p = os.environ["HH"]; t = io.open(p, encoding="utf-8").read()
i = t.index("stateExclCliff:"); j = t.find("\n  },", i)
blk = t[i:j]; m = re.findall(r'P\.stateCode = "[A-Z]{2}"; ', blk)
if len(m) != 1: sys.exit(0)          # leave the file unchanged; `applied` reports the drift
io.open(p, "w", encoding="utf-8").write(t[:i] + blk.replace(m[0], "", 1) + t[j:])
PY
applied "S2" "$HH" "$b" && want "S2 stateExclCliff loses its stateCode" "F-7"

prep
# S3: the legacy fixture is given a REAL state code, collapsing the distinction the split makes.
b=$(sum "$HH")
sed -i 's|P.stateTaxRate = 0.05; P.stateName = "Test State"; P.stateCode = "TS";|P.stateTaxRate = 0.05; P.stateName = "New York"; P.stateCode = "NY";|' "$HH"
applied "S3" "$HH" "$b" && want "S3 the legacy fixture uses a real STATE_RULES key" "F-8"

prep
# S4: THE EMPTY-SET CONTROL. Strip every income-limit note from STATE_RULES and rebuild, so no
# state matches and `state_excl_limited` can never read ON. Without F-6 every assertion about
# that row would pass vacuously — green from an empty set.
b=$(sum "$SCRATCH/$VER.jsx")
sed -i 's/INCOME-LIMITED/UNCONDITIONAL/g; s/income-limited/unconditional/g; s/income limit/no limit/g' "$SCRATCH/$VER.jsx"
if applied "S4" "$SCRATCH/$VER.jsx" "$b"; then
  ( cd "$SCRATCH" && bash qa/mk_testable.sh "$VER" >/dev/null 2>&1 ) || { MISS=$((MISS+1)); echo "  ✗ S4 REBUILD FAILED"; }
  want "S4 no STATE_RULES entry flags an income limit (empty-set guard)" "F-6"
fi

prep
# S5: the reverse direction — a fixture that declares a flip it does not produce must be caught
# by section C, not silently accepted.
b=$(sum "$HH")
HH="$HH" python3 - <<'PY'
import io, os
p = os.environ["HH"]; t = io.open(p, encoding="utf-8").read()
t = t.replace('    flips: ["state_code"],\n    apply: P => {\n      P.stateCode = "NY";',
              '    flips: ["state_code","income_streams"],\n    apply: P => {\n      P.stateCode = "NY";', 1)
io.open(p, "w", encoding="utf-8").write(t)
PY
applied "S5" "$HH" "$b" && want "S5 a fixture declares a flip it does not produce" "C-stateProgressive/income_streams"

rm -rf "$SCRATCH"
echo
echo "CONTROLS: $PASS met expectation (S0 silent + fired), $MISS did not"
[ "$MISS" -gt 0 ] && { echo "  A control that does not fire is a FINDING — investigate the check, never soften it."; exit 1; }
exit 0
