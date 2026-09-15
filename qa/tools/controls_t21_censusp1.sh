#!/usr/bin/env bash
# controls_t21_censusp1.sh — negative controls for t21 Section F (census_p1 pin + disclosure guard).
#
# WHY. §B2: a green check is not coverage. Section F adds six checks; every one of them has to be
# shown to FAIL on a deliberate mutation, or it is decoration. Section F is unusual in that it
# deliberately asserts a GAP — F-6 says the fixture answers zero to all fifteen of census_p1's
# questions — so its control runs in the opposite direction from the others: it ADDS surface
# content to the fixture and requires F-6 to go red.
#
# ⚠ THIS SCRIPT NEVER EDITS A CANONICAL FILE. Each mutant is written to a throwaway copy from a
# pristine read and the copy is removed afterwards, because the v5.66 control run died between
# applying a mutation and restoring it and poisoned the baseline for every later control.
#
# usage: ./controls_t21_censusp1.sh <run-folder>      (a folder holding qa/ with tools/ under it)
set -u
RUN="${1:-.}"
QA="$RUN/qa"; TOOLS="$QA/tools"; FIX="$TOOLS/fixture/fixture.jsx"; P1="$TOOLS/census_p1.cjs"
[ -f "$QA/t21_tools.mjs" ] || { echo "no t21_tools.mjs under $QA"; exit 2; }
[ -f "$P1" ] || { echo "no census_p1.cjs under $TOOLS"; exit 2; }

BEFORE_P1=$(md5sum "$P1" | cut -d' ' -f1)
BEFORE_FIX=$(md5sum "$FIX" | cut -d' ' -f1)
echo "pristine census_p1.cjs md5 : $BEFORE_P1"
echo "pristine fixture.jsx  md5 : $BEFORE_FIX"
echo

fired=0; silent=0
# $1 label · $2 the check name that must turn red · run t21 and look for a FAILURE line naming it
expect_red () {
  local label="$1" want="$2"
  local out; out=$(cd "$RUN" && node qa/t21_tools.mjs 2>&1)
  if echo "$out" | grep -q "✗ ${want}"; then
    echo "  ✓ FIRES  — $label  (red: ${want})"; fired=$((fired+1))
  else
    echo "  ✗ SILENT — $label  (expected ${want} to fail)"; silent=$((silent+1))
  fi
}
restore () { cp "$1.pristine" "$1"; rm -f "$1.pristine"; }

# ── C1 · the tool bails. F-1 must fire. ───────────────────────────────────────
echo "C1 · census_p1 exits 1 before printing (what f6_probe and state_rows do on this fixture)"
cp "$P1" "$P1.pristine"
sed -i 's|^const lineCount =|process.exit(1);\nconst lineCount =|' "$P1"
expect_red "tool bails" "census_p1 RUNS against the fixture"
restore "$P1"

# ── C2 · revert the wc -l correction of 2026-09-11. F-2 AND F-3 must fire. ────
echo "C2 · the split(\"\\n\").length off-by-one is reverted — the EXTINCTION pin"
cp "$P1" "$P1.pristine"
sed -i 's|const lineCount = src.endsWith("\\n") ? lines.length - 1 : lines.length;|const lineCount = lines.length;|' "$P1"
expect_red "off-by-one back (F-2)" "reports 75 lines"
expect_red "off-by-one back (F-3)" "does NOT report 76"
restore "$P1"

# ── C3 · the self-check stops being inert. F-4 must fire. ─────────────────────
echo "C3 · the self-check list is populated for every subject, not just DangerClose.jsx"
cp "$P1" "$P1.pristine"
sed -i 's|const must = file.endsWith("DangerClose.jsx") ? \[|const must = true ? [|' "$P1"
expect_red "self-check no longer 0/0" "self-check reports 0/0"
restore "$P1"

# ── C4 · a question is dropped. F-5 must fire. ────────────────────────────────
echo "C4 · one of the fifteen questions is removed"
cp "$P1" "$P1.pristine"
sed -i '/"JSON.parse": { call: \["JSON.parse"\] },/d' "$P1"
expect_red "fourteen questions, not fifteen" "asks fifteen questions"
restore "$P1"

# ── C5 · THE OPPOSITE DIRECTION. The fixture gains surface content. F-6 must fire. ──
# This is the control that matters most: F-6 asserts a GAP, and a gap-assertion that cannot be
# falsified is the vacuous pass this whole section was written to avoid.
echo "C5 · the fixture gains ONE storage call — the disclosure guard must go red"
cp "$FIX" "$FIX.pristine"
printf '\nconst _ctl = window.storage.getItem("x");   // CONTROL ONLY — removed by this script\n' >> "$FIX"
expect_red "fixture now reaches census_p1" "DISCLOSURE GUARD"
restore "$FIX"

echo
AFTER_P1=$(md5sum "$P1" | cut -d' ' -f1)
AFTER_FIX=$(md5sum "$FIX" | cut -d' ' -f1)
echo "restored census_p1.cjs md5 : $AFTER_P1"
echo "restored fixture.jsx  md5 : $AFTER_FIX"
[ "$BEFORE_P1" = "$AFTER_P1" ] && [ "$BEFORE_FIX" = "$AFTER_FIX" ] \
  && echo "RESTORE OK — both canonical files are byte-identical to the pristine read" \
  || { echo "⚠ RESTORE FAILED — do not trust any result above"; exit 3; }

echo
echo "CONTROLS: $fired fired, $silent silent"
[ "$silent" -eq 0 ] && echo "every Section F check is discriminating" || echo "⚠ a silent control IS THE FINDING (§B2) — do not weaken the control"
exit $([ "$silent" -eq 0 ] && echo 0 || echo 1)
