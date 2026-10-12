#!/usr/bin/env bash
# controls_runfolder_prior.sh — controls for mk_runfolder.sh's prior-source resolution (SCOPE_SINGLE_SOURCE_POOL, 2026-09-28).
# GENERAL-PURPOSE: it reads the prior version from the manifest's Prior table, so it runs against ANY build (pooled, §G).
# Each case asserts an EXIT CODE and a message — a refusal that printed nothing, or a success that built from the wrong
# bytes, both fail here.
#   A  git mode resolves the prior, and the run folder's prior .jsx has EXACTLY the manifest's md5
#   B  a correct prior file is accepted (md5-verified fallback, decision D-1)
#   C  a wrong prior file (the current source) is REFUSED, both md5s named
#   D  a version neither build table names is REFUSED
#   E  a shallow clone is REFUSED in git mode, and leaves no output folder
#   F  a third argument NOT ending in .jsx is taken as the output folder, in git mode (v5.81)
#   G  the run folder's dependency tree is EXACTLY the harness lock, entry for entry (E-29 (i), 2026-10-12)
#   H  a harness package.json that disagrees with its lock is REFUSED (npm ci fails, and the tool says so), no folder left usable
# USAGE  from the root of a FULL clone:  bash qa/tools/controls_runfolder_prior.sh
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
PASS=0; FAIL=0
ok () { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }; bad () { FAIL=$((FAIL+1)); printf '  FAIL  %s — %s\n' "$1" "$2"; }
VER=$(awk '/^## Prior build/{f=1} f&&/\| Version \|/{gsub(/[^0-9.]/,"",$4); print $4; exit}' PROJECT_KNOWLEDGE_INDEX.md)
WANT=$(awk '/^## Prior build/{f=1} f&&/\| Source md5 \|/{match($0,/[0-9a-f]{32}/); print substr($0,RSTART,32); exit}' PROJECT_KNOWLEDGE_INDEX.md)
CURV=$(awk '/^## Current build/{f=1} f&&/\| Version \|/{gsub(/[^0-9.]/,"",$4); print $4; exit}' PROJECT_KNOWLEDGE_INDEX.md)
P="v$(echo "$VER" | tr -d .)"; C="v$(echo "$CURV" | tr -d .)"
[ -n "$WANT" ] && [ "$P" != "v" ] || { echo "cannot read the Prior table"; exit 2; }
echo "controls_runfolder_prior: prior $P ($WANT), current $C"
T=$(mktemp -d)
./qa/mk_runfolder.sh "$P" "$C" --git "$T/a" > "$T/a.log" 2>&1; rc=$?
[ $rc -eq 0 ] && [ "$(md5sum "$T/a/$P.jsx" 2>/dev/null | cut -c1-32)" = "$WANT" ] && grep -q "resolved from commit" "$T/a.log" \
  && ok "A git mode resolves $P, byte-exact to the manifest's md5" || bad "A git mode" "exit $rc; $(tail -1 "$T/a.log")"
git show "$(git log --format=%H -- src/DangerClose.jsx | while read c; do [ "$(git show "$c:src/DangerClose.jsx" | md5sum | cut -c1-32)" = "$WANT" ] && echo "$c" && break; done):src/DangerClose.jsx" > "$T/prior.jsx"
./qa/mk_runfolder.sh "$P" "$C" "$T/prior.jsx" "$T/b" > "$T/b.log" 2>&1; rc=$?
[ $rc -eq 0 ] && grep -q "matches the manifest" "$T/b.log" && ok "B a correct prior file is accepted" || bad "B correct file" "exit $rc"
./qa/mk_runfolder.sh "$P" "$C" src/DangerClose.jsx "$T/c" > "$T/c.log" 2>&1; rc=$?
[ $rc -ne 0 ] && grep -q "Refused" "$T/c.log" && ok "C a wrong prior file is refused" || bad "C wrong file" "exit $rc — accepted a file whose md5 is not the manifest's"
./qa/mk_runfolder.sh v501 "$C" --git "$T/d" > "$T/d.log" 2>&1; rc=$?
[ $rc -ne 0 ] && grep -q "names v5.01" "$T/d.log" && ok "D an unrecorded version is refused" || bad "D unknown version" "exit $rc"
git clone -q --depth 1 "file://$REPO" "$T/shallow" 2>/dev/null && cp qa/mk_runfolder.sh "$T/shallow/qa/"
( cd "$T/shallow" && ./qa/mk_runfolder.sh "$P" "$C" --git "$T/e" > "$T/e.log" 2>&1 ); rc=$?
[ $rc -ne 0 ] && grep -q "shallow" "$T/e.log" && [ ! -d "$T/e" ] && ok "E a shallow clone is refused, no output left" || bad "E shallow" "exit $rc"
./qa/mk_runfolder.sh "$P" "$C" "$T/f" > "$T/f.log" 2>&1; rc=$?
[ $rc -eq 0 ] && [ "$(md5sum "$T/f/$P.jsx" 2>/dev/null | cut -c1-32)" = "$WANT" ] && grep -q "resolved from commit" "$T/f.log" \
  && ok "F a third argument not ending in .jsx is the output folder (git mode)" || bad "F folder as third argument" "exit $rc; $(tail -1 "$T/f.log")"
# G — the locked harness, entry for entry. `node_modules/.package-lock.json` is npm's record of the tree it actually installed.
if [ -d "$T/a/node_modules" ]; then
  _g=$(node -e '
    const w = require(process.argv[1]).packages, h = require(process.argv[2]).packages; let d = [];
    for (const k of Object.keys(h)) if (k && (!w[k] || w[k].version !== h[k].version)) d.push(k);
    for (const k of Object.keys(w)) if (k && !h[k]) d.push("extra " + k);
    console.log(d.length + " " + Object.keys(h).filter(Boolean).length + " " + d.slice(0, 3).join(","));' \
    "$T/a/node_modules/.package-lock.json" "$REPO/qa/harness/package-lock.json")
  [ "${_g%% *}" = "0" ] && ok "G the run folder's tree is exactly the harness lock ($(echo "$_g" | cut -d' ' -f2) packages)" || bad "G harness tree" "$_g"
else bad "G harness tree" "case A left no folder to read"; fi
# H — a harness pair that disagrees is refused: a copy of the tree whose package.json pins a jsdom the lock does not hold.
git clone -q "file://$REPO" "$T/h" 2>/dev/null && mkdir -p "$T/h/qa/harness" && cp qa/mk_runfolder.sh "$T/h/qa/" && cp qa/harness/package.json qa/harness/package-lock.json "$T/h/qa/harness/" \
  && node -e 'const f=process.argv[1],p=require(f);p.dependencies.jsdom="29.0.0";require("fs").writeFileSync(f,JSON.stringify(p,null,2)+"\n")' "$T/h/qa/harness/package.json"
( cd "$T/h" && ./qa/mk_runfolder.sh "$P" "$C" --git "$T/hh" > "$T/h.log" 2>&1 ); rc=$?
[ $rc -ne 0 ] && grep -q "harness lock failed" "$T/h.log" && ok "H a harness package.json out of step with its lock is refused" || bad "H harness mismatch" "exit $rc; $(tail -1 "$T/h.log")"
rm -rf "$T"
printf '\ncontrols_runfolder_prior: %d passed, %d failed\n' "$PASS" "$FAIL"; [ $FAIL -eq 0 ]
