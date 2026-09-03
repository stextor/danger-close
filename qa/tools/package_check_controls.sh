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
  # ⚠ The character class must cover EVERY section package_check emits. It read [A-G] until
  # 2026-08-28, when sections H and I were added — under the old class every H/I control would
  # have printed *** NOT CAUGHT ***, which reads as "the new checks are broken" when in fact the
  # harness could not see them. Widen this the same day you add a section.
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+b?' | sort -u | tr '\n' ',')
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

# ── P20–P28 · sections H and I (added 2026-08-28) ─────────────────────────────────────────────
# These differ in kind from everything above: H and I assert about the CLONE, not the package, so
# they need a helper that perturbs a copy of the clone and leaves the package alone.
runc () {  # $1 = label, $2 = expected check id, $3.. = mutation commands run inside the clone copy
  local label="$1" want="$2"; shift 2
  rm -rf /tmp/pkctlc && cp -r "$CLONE" /tmp/pkctlc
  ( cd /tmp/pkctlc && eval "$@" ) >/dev/null 2>&1
  local out fired
  out=$(node "$PKG_CHECK" "$APP" /tmp/pkctlc 2>&1)
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+b?' | sort -u | tr '\n' ',')
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** (wanted %s, fired: %s) %s\n" "$want" "${fired:-none}" "$label"
  fi
  rm -rf /tmp/pkctlc
}

CH_SRC=$(grep -oE '^\| Source md5 \| `[0-9a-f]{32}`' "$CLONE/PROJECT_KNOWLEDGE_INDEX.md" 2>/dev/null | grep -oE '[0-9a-f]{32}' | head -1)
CH_BLT=$(grep -oE '^\| Built .index.html. md5 \| `[0-9a-f]{32}`' "$CLONE/PROJECT_KNOWLEDGE_INDEX.md" 2>/dev/null | grep -oE '[0-9a-f]{32}' | head -1)

if [ -n "$CH_SRC" ] && [ -n "$CH_BLT" ]; then
  runc "P20 CHANGELOG provenance names the wrong SOURCE md5" H-1 \
    "python3 - <<'EOF'
import io
p='/tmp/pkctlc/CHANGELOG.md'; t=io.open(p,encoding='utf-8').read()
# Corrupt INSIDE the newest version entry, mirroring the window section H reads.
# Slicing from byte 0 broke on 2026-08-28 when Unreleased ops entries were added ABOVE
# v5.53 quoting the same source hash: .replace(..,1) then hit an Unreleased entry and H-1
# correctly still passed. THE CONTROL was wrong, not the check. Third time this cycle.
i=t.index('\n## v'); j=t.index('\n## v', i+1)
seg=t[i:j].replace('$CH_SRC','deadbeefdeadbeefdeadbeefdeadbeef',1)
io.open(p,'w',encoding='utf-8').write(t[:i]+seg+t[j:])
EOF"
  runc "P21 CHANGELOG provenance names the wrong BUILT md5" H-2 \
    "python3 - <<'EOF'
import io
p='/tmp/pkctlc/CHANGELOG.md'; t=io.open(p,encoding='utf-8').read()
i=t.index('\n## v'); j=t.index('\n## v', i+1)
seg=t[i:j].replace('$CH_BLT','0badc0de0badc0de0badc0de0badc0de',1)
io.open(p,'w',encoding='utf-8').write(t[:i]+seg+t[j:])
EOF"
else
  skip "P20/P21 provenance md5 controls" "could not read the current-build md5 pair from PROJECT_KNOWLEDGE_INDEX.md"
fi

# P22 is THE control for this section: the 66db033 shape, where the built artifact was pushed
# ahead of the source and the repo carried a release whose source was the previous one.
PRIOR_JSX=$(ls /mnt/project/DangerClose-v5_*.jsx 2>/dev/null | head -1)
if [ -n "$PRIOR_JSX" ]; then
  runc "P22 clone source is a DIFFERENT release from the served one (the 66db033 shape)" H-3 \
    "cp '$PRIOR_JSX' src/DangerClose.jsx"
else
  skip "P22 the 66db033 shape" "no prior-release .jsx available to roll back to"
fi


# ⚠ P23 must empty BOTH sides. The scope inventory became a UNION of the clone's docs/ and the
# package's github/docs/ on 2026-08-28, so stripping the clone alone leaves any scope the package
# ships and I-1 correctly still finds one. Emptying only the clone made this control stop firing —
# the control was measuring the old shape, not a regression.
rm -rf /tmp/pkctle /tmp/pkctlf && cp -r "$CLONE" /tmp/pkctle && cp -r "$APP" /tmp/pkctlf
rm -f /tmp/pkctle/docs/SCOPE_*.md /tmp/pkctlf/github/docs/SCOPE_*.md
out23=$(node "$PKG_CHECK" /tmp/pkctlf /tmp/pkctle 2>&1)
if echo "$out23" | grep -q "✗ I-1"; then
  PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "I-1" "P23 every scope removed from BOTH sides — a green reading from an EMPTY SET"
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P23 the sweep reports green against an empty set\n"
fi
rm -rf /tmp/pkctle /tmp/pkctlf
runc "P24 a shipped scope loses its retirement marker and reads live again" I-2 \
  "for f in docs/SCOPE_*.md; do grep -qE 'RETIRED|SUPERSEDED|FULFILLED' \"\$f\" && { grep -vE 'RETIRED|SUPERSEDED|FULFILLED' \"\$f\" > \"\$f.t\" && mv \"\$f.t\" \"\$f\"; break; }; done"
runc "P25 a NEW unclassified scope is added" I-2 \
  "printf '# SCOPE\n\n**Status: BUILD AUTHORISED.**\n' > docs/SCOPE___control__.md"
# ⚠ DERIVED, not named (fixed 2026-09-03). This control hardcoded `SCOPE_FIX_tidyup_six.md`,
# which was on the OPEN allowlist when the control was written and is not now — so removing it
# could not trip I-3 and the control reported NOT CAUGHT for an unknown number of releases while
# I-3 itself was innocent. That is the exact rot this harness's own header warns about
# ("every target file is DERIVED from the package rather than named"), reappearing in a control
# the same header was written to fix. Read the live allowlist out of package_check.mjs instead.
OPEN_SCOPE=$(grep -oE '"SCOPE_[A-Za-z0-9_]+\.md"' "$PKG_CHECK" | tr -d '"' | head -1)
if [ -z "$OPEN_SCOPE" ] || [ ! -f "$CLONE/docs/$OPEN_SCOPE" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P26 - could not derive a live OPEN-allowlist scope from $PKG_CHECK"
else
runc "P26 an OPEN-allowlist entry names a scope that no longer exists ($OPEN_SCOPE)" I-3 \
  "rm -f docs/$OPEN_SCOPE"
fi

# ── P27 · the FALSE-POSITIVE control, and the one most worth keeping ──────────────────────────
# A reporting check that cries wolf on a clean tree gets ignored, and an ignored gate has stopped
# being a gate — the VERIFY.sh failure by a different route. Assert the clean tree stays GREEN.
#
# ⚠ "Clean" means the tree AS THIS PACKAGE WILL LEAVE IT, not the tree as committed today. On its
# first draft this control compared against the bare clone and failed — correctly, because the
# package retires a scope that is still unclassified in the committed tree. The check was right and
# the control was asking the wrong question. Overlay github/ onto a clone copy first: that is the
# state the sweep will actually meet after the upload.
rm -rf /tmp/pkctlp && cp -r "$CLONE" /tmp/pkctlp
( cd "$APP/github" && find . -type f -print0 | while IFS= read -r -d '' f; do
    mkdir -p "/tmp/pkctlp/$(dirname "$f")" && cp "$f" "/tmp/pkctlp/$f"
  done ) >/dev/null 2>&1
out27=$(node "$PKG_CHECK" "$APP" /tmp/pkctlp 2>&1)
if echo "$out27" | grep -q "✓ I-2"; then
  PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "I-2" "P27 the POST-SHIP tree produces no scope candidates (false-positive control)"
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P27 the sweep flags the post-ship tree — it will be ignored\n"
  echo "$out27" | grep "I-2" | sed 's/^/      /'
fi
rm -rf /tmp/pkctlp

# ── P28 · offline must SKIP LOUDLY, never pass ────────────────────────────────────────────────
# H depends on the network. The failure mode to prevent is not "offline"; it is "offline and
# green." So the assertion here is a SKIP, not a failure — and this control was WRONG on its first
# draft: it demanded H-1 go red, which would have meant "no CHANGELOG" was treated as a defect in
# the repo rather than a gap in what this tool could see. The check was right and the control was
# wrong. Kept as written, because the distinction is the whole point of the section.
rm -rf /tmp/pkctlc && cp -r "$CLONE" /tmp/pkctlc && rm -f /tmp/pkctlc/CHANGELOG.md
out28=$(node "$PKG_CHECK" "$APP" /tmp/pkctlc 2>&1)
if echo "$out28" | grep -q "SKIPPED: H-1"; then
  PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "H-1" "P28 CHANGELOG absent — H skips LOUDLY instead of passing"
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P28 H did not skip loudly with no CHANGELOG — it may be passing blind\n"
fi
rm -rf /tmp/pkctlc


# ── SECTION K CONTROLS (added 2026-09-03) ────────────────────────────────────────────────
# K reads the MANIFEST against the clone and the pool, so these need a POOL argument the `run`
# helper above does not pass. They get their own runner and their own scratch pool.
#
# ⚠ P29 is the reason section K exists. It reproduces the v5.61 defect exactly — the manifest not
# updated at all, so NEITHER build table rolls — and asserts two things: that K-1 CATCHES it, and
# that **K-7 DOES NOT**. K-7 is D-4 exactly as it was written and carried for eleven releases, and
# the whole finding behind this package is that it cannot see this defect. If K-7 ever starts
# firing on P29, someone has changed it into a different check and its WEAK label is a lie.
POOLARG="${4:-}"
if [ -z "$POOLARG" ] || [ ! -d "$POOLARG" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P29..P35 (section K) - no pool dir given. usage: $(basename "$0") <app-pkg> <clone> <ops-pkg-or-empty> <pool>"
else

runk () {  # $1 = label, $2 = expected id, $3 = "NOT:<id>" or "", $4 = python mutation source
  local label="$1" want="$2" mustnot="$3" mut="$4"
  rm -rf /tmp/pkpool && cp -r "$POOLARG" /tmp/pkpool
  if ! python3 -c "$mut" >/dev/null 2>&1; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (mutation did not apply - control is INVALID)\n" "$label"; return
  fi
  local out fired
  out=$(node "$PKG_CHECK" "$APP" "$CLONE" "" /tmp/pkpool 2>&1)
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+b?' | sort -u | tr '\n' ',')
  if [ -n "$mustnot" ] && echo "$fired" | grep -q "${mustnot#NOT:}"; then
    MISS=$((MISS+1)); printf "  *** FINDING *** %s - %s fired when it must NOT (fired: %s)\n" "$label" "${mustnot#NOT:}" "$fired"
    rm -rf /tmp/pkpool; return
  fi
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s%s\n" "$want" "$label" "${mustnot:+   [and ${mustnot#NOT:} correctly silent]}"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, fired: %s)\n" "$label" "$want" "$fired"
  fi
  rm -rf /tmp/pkpool
}

runk "P29 THE v5.61 DEFECT - manifest not updated at all, NEITHER table rolled" "K-1" "NOT:K-7" "
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
a=s.index('## Current build'); b=s.index('## Prior build')
cur=s[a:b].replace('| Version | **v5.61** |','| Version | **v5.60** |',1)
pri=s[b:].replace('| Version | **v5.60** |','| Version | **v5.59** |',1)
assert cur!=s[a:b] and pri!=s[b:]
open(p,'w').write(s[:a]+cur+pri)
"

runk "P30 Current source md5 corrupted" "K-2" "" "
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
a=s.index('## Current build'); b=s.index('## Prior build')
blk=s[a:b].replace('7e1a02881256142c5b9206045e76e2ec','0000000000000000000000000000dead',1)
assert blk!=s[a:b]
open(p,'w').write(s[:a]+blk+s[b:])
"

runk "P31 Current built-artifact md5 corrupted" "K-3" "" "
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
a=s.index('## Current build'); b=s.index('## Prior build')
blk=s[a:b].replace('ba3968f24e06eb989d9171cbd9a8c796','0000000000000000000000000000beef',1)
assert blk!=s[a:b]
open(p,'w').write(s[:a]+blk+s[b:])
"

runk "P32 a fallback hash-table row goes stale" "K-8" "" "
import re
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
m=re.search(r'\`t29_boundaries\.mjs\` \| \`([0-9a-f]{32})\`', s)
assert m
open(p,'w').write(s[:m.start(1)]+'0'*32+s[m.end(1):])
"

runk "P33 a pool file loses its only manifest row" "K-9" "" "
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
assert 'vergates.cjs' in s
open(p,'w').write(s.replace('vergates.cjs','REMOVED_BY_CONTROL.cjs'))
"

runk "P34 Current rolled but Prior NOT - the defect that ran for seven releases" "K-7" "" "
p='/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'; s=open(p).read()
b=s.index('## Prior build')
pri=s[b:].replace('| Version | **v5.60** |','| Version | **v5.55** |',1)
assert pri!=s[b:]
open(p,'w').write(s[:b]+pri)
"

# P35: the manifest is GONE from BOTH clone and pool. K must SKIP LOUDLY, never pass blind.
# This is the E-14 shape: a check that cannot reach its input and reports green is worse than none.
rm -rf /tmp/pkpool /tmp/pkclone2
cp -r "$POOLARG" /tmp/pkpool && rm -f /tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md
cp -r "$CLONE" /tmp/pkclone2 && rm -f /tmp/pkclone2/PROJECT_KNOWLEDGE_INDEX.md
out35=$(node "$PKG_CHECK" "$APP" /tmp/pkclone2 "" /tmp/pkpool 2>&1)
if echo "$out35" | grep -q "SKIPPED: K-1..K-9"; then
  PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "K-*" "P35 manifest absent - K skips LOUDLY instead of passing blind"
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P35 K did not skip loudly with no manifest - it may be passing blind\n"
fi
rm -rf /tmp/pkpool /tmp/pkclone2

fi

[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
[ "$MISS" -gt 0 ] && { echo "  A control that does not fire is a FINDING — investigate the check, never soften it."; exit 1; }
exit 0
