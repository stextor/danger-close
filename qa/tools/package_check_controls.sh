#!/bin/bash
# Negative controls for package_check.mjs (OPERATIONS §B2). Each perturbs ONE §L requirement in a
# scratch copy of a REAL package and requires the corresponding check to FAIL.
#
# ── REWRITTEN 2026-08-23. Read this before changing it. ──────────────────────────────────────
# The previous version hardcoded `/home/claude/pkg/danger-close-v5.42`, `/home/claude/pkg2/
# danger-close-ops-v2` and `/home/claude/package_check.mjs` — absolute paths from the session that
# wrote it. That is the same portability defect `mk_testable.sh` and t6's subprocess carried until
# v5.10.1, and it had the worst possible failure mode: run anywhere else, every control printed
# *** NOT CAUGHT ***, which reads as "package_check's checks are broken" rather than "this script
# cannot find its inputs" — and it exited **0**, so anything automated saw success. A control
# harness that lies about the thing it is controlling is worse than no control harness.
#
# Four things changed:
#   1. `package_check.mjs` resolves relative to THIS FILE, so the pair travels together.
#   2. The packages and the clone are ARGUMENTS, and a missing one aborts loudly instead of
#      degrading into a wall of false failures.
#   3. Every target file is DERIVED from the package rather than named, so the script runs against
#      whatever release is current instead of rotting the moment a suite is renamed. The old P1
#      named `t24_ss86_phasein.mjs`; that file is real, but nothing made it stay real.
#   4. It exits NON-ZERO if any control fails to fire.
#
# usage: package_check_controls.sh <app-release-pkg-dir> <clone-dir> [ops-pkg-dir]
# The ops package is optional; P15 (KIND fail-closed) is SKIPPED and said so without it.

set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_CHECK="$HERE/package_check.mjs"
APP="${1:-}" ; CLONE="${2:-}" ; OPS="${3:-}"

die () { echo "ABORT: $*" >&2; exit 2; }
[ -f "$PKG_CHECK" ] || die "package_check.mjs not found beside this script at $PKG_CHECK"
[ -n "$APP" ] && [ -d "$APP" ] || die "app-release package dir missing: '${APP:-<none>}'
  usage: $(basename "$0") <app-release-pkg-dir> <clone-dir> [ops-pkg-dir]"
[ -n "$CLONE" ] && [ -d "$CLONE" ] || die "clone dir missing: '${CLONE:-<none>}'
  git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship"
[ -d "$APP/github" ] && [ -d "$APP/knowledge" ] || die "'$APP' is not a release package (no github/ + knowledge/)"

BASE="$(basename "$APP")"
PASS=0; MISS=0; SKIP=0

# ── targets DERIVED from the package, so nothing here names a file that can be renamed away ──
QA_FILE=$(cd "$APP" && find github -type f -name '*.mjs' | head -1)
JSX=$(cd "$APP" && ls knowledge/DangerClose-v5_*.jsx 2>/dev/null | head -1)
BOTH=""
for k in $(cd "$APP/knowledge" && ls); do
  case "$k" in DangerClose-v5_*.jsx) continue;; esac
  if (cd "$APP" && find github -type f -name "$k" | grep -q .); then BOTH="$k"; break; fi
done
UNCH=""
for c in LICENSE .gitignore .nojekyll; do
  [ -f "$CLONE/$c" ] && [ ! -f "$APP/github/$c" ] && { UNCH="$c"; break; }
done

echo "NEGATIVE CONTROLS — package_check.mjs"
echo "  package: $APP"
echo "  clone:   $CLONE"
echo "  ops pkg: ${OPS:-(none — P15 will be SKIPPED)}"
echo "  derived: qa=$QA_FILE  both=$BOTH  jsx=${JSX:-none}  unchanged=${UNCH:-none}"
echo

run () {   # $1 = label, $2 = expected check id, $3.. = mutation commands run inside the copy
  local label="$1" want="$2"; shift 2
  rm -rf /tmp/pkctl && mkdir -p /tmp/pkctl && cp -r "$APP" /tmp/pkctl/
  local D="/tmp/pkctl/$BASE"
  ( cd "$D" && eval "$@" ) >/dev/null 2>&1
  local out fired
  out=$(node "$PKG_CHECK" "$D" "$CLONE" 2>&1)
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-G]-[0-9]+b?' | sort -u | tr '\n' ',')
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** (wanted %s, fired: %s) %s\n" "$want" "${fired:-none}" "$label"
  fi
}
skip () { SKIP=$((SKIP+1)); printf "  – SKIPPED  %s — %s\n" "$1" "$2"; }

run "P1  a MANIFEST-listed file is missing from the zip"    C-2 "rm '$QA_FILE'"
run "P2  a shipped file is silently modified after hashing" C-3 "echo '// drift' >> '$QA_FILE'"
run "P3  a file is in the zip but not in MANIFEST"          C-4 "echo x > github/__stray__.mjs"
if [ -n "$UNCH" ]; then
  run "P4  an UNCHANGED file is shipped in github/"         D-1 "cp '$CLONE/$UNCH' github/ && printf '%s  %s\n' \"\$(md5sum < '$CLONE/$UNCH' | cut -d' ' -f1)\" '$UNCH' >> MANIFEST.txt"
else
  skip "P4  an UNCHANGED file is shipped in github/" "no clone file available that is absent from github/"
fi
run "P5  a file lands at the WRONG repo path"               D-2 "mkdir -p github/__wrong__ && mv '$QA_FILE' github/__wrong__/"
run "P7  knowledge/ is nested instead of flat"              B-1 "mkdir -p knowledge/sub && mv 'knowledge/$BOTH' knowledge/sub/"
if [ -n "$JSX" ]; then
  run "P8  a THIRD .jsx source rides along (rotation broken)" B-3 "cp '$JSX' knowledge/DangerClose-v5_00.jsx"
  run "P10 versioned source != canonical source"             E-2 "echo '// x' >> '$JSX'"
else
  skip "P8/P10 rotation and source-identity controls" "this package ships no versioned .jsx"
fi
run "P9  the two destinations disagree on the same file"    E-1 "echo '// diverged' >> 'knowledge/$BOTH'"
run "P11 COMMIT_MESSAGE.txt forgotten"                      A-2 "rm COMMIT_MESSAGE.txt"
run "P12 README omits a file from the delete-first list"    F-2 "sed -i 's|$BOTH||g' README-FIRST.md"
run "P13 MANIFEST does not record the packaged-copy run"    C-5 "sed -i '/packaged copies/Id' MANIFEST.txt"
run "P14 smoke_built not recorded"                          C-6 "sed -i '/smoke_built/Id' MANIFEST.txt"

# ── P17 · the v5.47 miss: a doc that lives in BOTH places, shipped to knowledge/ only ─────────
# The control that did not exist when it mattered. E-1b is the check; this is its teeth.
run "P17 a both-destinations file is OMITTED from github/"  E-1b "f=\$(find github -type f -name '$BOTH'); rm \"\$f\"; grep -v \"  \$f\$\" MANIFEST.txt > /tmp/m && mv /tmp/m MANIFEST.txt"

# ── P18/P19 · G-1 needs a WORKSPACE, so these run outside run() ───────────────────────────────
WS=/tmp/pkctl_ws
if [ -n "$UNCH" ]; then
  rm -rf "$WS"; mkdir -p "$WS"; cp "$CLONE/$UNCH" "$WS/$UNCH"
  printf '\n# edited, never packaged\n' >> "$WS/$UNCH"
  if node "$PKG_CHECK" "$APP" "$CLONE" "$WS" 2>&1 | grep -q "✗ G-1"; then
    PASS=$((PASS+1)); printf "  CAUGHT by G-1    P18 a changed workspace file is missing from the package\n"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P18 a changed workspace file is missing from the package\n"
  fi
  # ...and it must NOT fire on a clean workspace, or it is just noise.
  rm -rf "$WS"; mkdir -p "$WS"; cp "$CLONE/$UNCH" "$WS/$UNCH"
  if node "$PKG_CHECK" "$APP" "$CLONE" "$WS" 2>&1 | grep -q "✗ G-1"; then
    MISS=$((MISS+1)); printf "  *** FALSE POSITIVE *** P19 G-1 fires on a CLEAN workspace\n"
  else
    PASS=$((PASS+1)); printf "  NOT fired        P19 G-1 stays quiet on a clean workspace (no false positive)\n"
  fi
  rm -rf "$WS"
else
  skip "P18/P19 G-1 workspace controls" "no suitable clone file to perturb"
fi

# ── P15 · fail-closed KIND. Needs the OPS package: only observable on a non-release. ─────────
if [ -n "$OPS" ] && [ -d "$OPS" ]; then
  rm -rf /tmp/pkctl2 && mkdir -p /tmp/pkctl2 && cp -r "$OPS" /tmp/pkctl2/
  D2="/tmp/pkctl2/$(basename "$OPS")"
  sed -i '/^KIND:/d' "$D2/MANIFEST.txt"
  if node "$PKG_CHECK" "$D2" "$CLONE" 2>&1 | grep -q "✗ A-1"; then
    PASS=$((PASS+1)); echo "  CAUGHT by A-1    P15 KIND undeclared on an ops package (fail-closed default)"
  else
    MISS=$((MISS+1)); echo "  *** NOT CAUGHT *** P15 KIND undeclared — the fail-closed default is NOT working"
  fi
  rm -rf /tmp/pkctl2
else
  skip "P15 KIND undeclared (fail-closed default)" "no ops package given as the third argument"
fi

rm -rf /tmp/pkctl
echo
echo "CONTROLS: $PASS fired as expected, $MISS did NOT, $SKIP skipped"
[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
[ "$MISS" -gt 0 ] && { echo "  A control that does not fire is a FINDING — investigate the check, never soften it."; exit 1; }
exit 0
