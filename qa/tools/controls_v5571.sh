#!/bin/bash
# Negative controls for the checks ADDED at v5.57.1 (OPERATIONS §B2).
# Each perturbs ONE condition in a scratch copy and requires the new check to FAIL.
# A control that does not fire is the finding, not a reason to adjust it.
# usage: controls_v5571.sh <app-release-pkg-zip-or-dir> <clone-dir>
set -u
PC="$(cd "$(dirname "$0")" && pwd)/package_check.mjs"
PKG="$1"; CLONE="$2"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
if [ -f "$PKG" ]; then unzip -q "$PKG" -d "$T/base"; else cp -r "$PKG" "$T/base"; fi
BASE=$(find "$T/base" -maxdepth 1 -mindepth 1 -type d | head -1)

fire () { # $1 label  $2 check-id  $3 dir  [$4 pool]
  local out; out=$(node "$PC" "$3" "$CLONE" "${5:-}" "${4:-}" 2>&1)
  if echo "$out" | grep -q "✗ $2"; then echo "   *** CAUGHT *** $1"
  else echo "   *** NOT CAUGHT — THIS IS THE FINDING *** $1"; fi
}

echo "== N0 · unperturbed: the new checks must be SILENT, or every verdict below is a rubber stamp =="
# a realistic pool holds the CURRENT and the PRIOR leg — J-3/J-4 assert exactly that, so a
# fixture with one leg makes them fire correctly and tells us nothing. Synthesize the prior leg.
mkpool () { mkdir -p "$1"; cp "$BASE"/knowledge/* "$1"/
  cp "$1"/DangerClose-v5_57.jsx "$1"/DangerClose-v5_56.jsx
  cp "$1"/dom_entry_v557.jsx    "$1"/dom_entry_v556.jsx; }
POOL0="$T/pool0"; mkpool "$POOL0"
out=$(node "$PC" "$BASE" "$CLONE" "" "$POOL0" 2>&1)
for c in G-2 J-1 J-2 J-3 J-4; do
  echo "$out" | grep -q "✗ $c" && echo "   N0 FAILURE: $c fired on a clean package" || echo "   ok  $c silent"
done

echo; echo "== N1 · J-1: a knowledge/ file never reached the pool (the v5.57 case, 3 tools) =="
P1="$T/p1"; mkpool "$P1"; rm -f "$P1"/vergates.cjs "$P1"/lits.cjs
fire "J-1 absent-from-pool" "J-1" "$BASE" "$P1"

echo; echo "== N2 · J-2: a same-name upload without the delete first leaves the OLD copy (v5.57 CHANGELOG) =="
P2="$T/p2"; mkpool "$P2"; echo "stale" >> "$P2"/CHANGELOG.md
fire "J-2 stale-in-pool" "J-2" "$BASE" "$P2"

echo; echo "== N3 · J-3: a rotation is TWO deletes; a third leg means one was missed =="
P3="$T/p3"; mkpool "$P3"; cp "$P3"/DangerClose-v5_57.jsx "$P3"/DangerClose-v5_55.jsx
fire "J-3 three-legs" "J-3" "$BASE" "$P3"

echo; echo "== N4 · G-2: a NEW hand-written tool left in the workspace (the v5.57 empty qa/tools) =="
W4="$T/w4"; mkdir -p "$W4/qa/tools"
echo "// a NEW instrument, never committed" > "$W4/qa/tools/zzz_new_probe.cjs"
fire "G-2 new-file-not-shipped" "G-2" "$BASE" "" "$W4"

echo; echo "== N5 · KIND: handover is ACCEPTED rather than defaulting to app-release =="
B5="$T/b5"; cp -r "$BASE" "$B5"; sed -i 's/^KIND: .*/KIND: handover/' "$B5"/MANIFEST.txt
node "$PC" "$B5" "$CLONE" 2>&1 | grep -q "kind:    handover" \
  && echo "   *** ACCEPTED *** handover recognised, no fail-closed default" \
  || echo "   *** NOT ACCEPTED — THIS IS THE FINDING ***"
