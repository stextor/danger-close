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


# ── E-1b ROUTE (a) CONTROLS (added 2026-09-07) ───────────────────────────────────────────
# E-1b learned to skip a repo path whose deletion README-FIRST declares. A gate that learns to
# stay quiet needs two controls, not one: that it still FIRES on the real defect, and that the
# new escape hatch cannot be opened by accident.
#
# ⚠ P36 IS THE ONE THAT MATTERS. A gate that stops firing is worse than no gate, and the v5.47
# omission E-1b exists to catch must still be caught with the new code in place.
e1b_ctl () {   # $1 = label, $2 = "FIRE" or "QUIET", $3 = README-FIRST line to append (or "")
  local label="$1" want="$2" rfline="$3"
  rm -rf /tmp/pke1b && cp -r "$APP" /tmp/pke1b
  # Build the v5.47 shape from whatever this package holds: take a knowledge/ file that HAS an
  # unambiguous repo counterpart, perturb it, and remove that counterpart from github/.
  local target rp
  target=$(node -e '
    const {readFileSync,existsSync,readdirSync,statSync}=require("fs");const {join,relative,sep}=require("path");
    const walk=(d,b=d)=>readdirSync(d).flatMap(e=>{const p=join(d,e);
      return statSync(p).isDirectory()?walk(p,b):[relative(b,p).split(sep).join("/")];});
    const CL=process.argv[1],KN=process.argv[2];
    const all=walk(CL).filter(f=>!f.startsWith(".git/"));const by=new Map();
    for(const r of all){const b=r.split("/").pop();(by.get(b)||by.set(b,[]).get(b)).push(r);}
    for(const k of readdirSync(KN)){const c=by.get(k)||[];if(c.length===1){console.log(k+"|"+c[0]);break;}}
  ' "$CLONE" /tmp/pke1b/knowledge)
  if [ -z "$target" ]; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (no resolvable knowledge/ file - control is INVALID)\n" "$label"
    rm -rf /tmp/pke1b; return
  fi
  local kf="${target%%|*}"; rp="${target##*|}"
  printf '\nPERTURBED BY CONTROL\n' >> "/tmp/pke1b/knowledge/$kf"
  rm -f "/tmp/pke1b/github/$rp"
  [ -n "$rfline" ] && printf '\n%s %s\n' "$rfline" "$rp" >> /tmp/pke1b/README-FIRST.md
  local fired
  fired=$(node "$PKG_CHECK" /tmp/pke1b "$CLONE" 2>&1 | grep "✗" | grep -oE 'E-1b' | head -1)
  if [ "$want" = "FIRE" ] && [ -n "$fired" ]; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "E-1b" "$label"
  elif [ "$want" = "QUIET" ] && [ -z "$fired" ]; then
    PASS=$((PASS+1)); printf "  CORRECTLY SILENT   %s\n" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, E-1b fired: %s)\n" "$label" "$want" "${fired:-no}"
  fi
  rm -rf /tmp/pke1b
}

e1b_ctl "P36 THE v5.47 SHAPE - changed knowledge/ file, counterpart absent from github/, NO declaration" "FIRE" ""
e1b_ctl "P37 the same package, with the deletion DECLARED - E-1b must go quiet" "QUIET" "DELETE FROM REPO:"
# ⚠ P38 is the P5 lesson applied to the new hatch. README-FIRST names every shipped github/ path
# in prose already, so if the declaration were a loose `includes` the gate would switch itself off
# for every file it ships. The path must be on a DELETE FROM REPO line and nowhere else will do.
e1b_ctl "P38 the path merely MENTIONED in README-FIRST, not declared deleted - must still FIRE" "FIRE" "upload this file to"

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

# ⚠ REWRITTEN 2026-09-07 (H-6). THE ENTIRE K BLOCK BELOW WAS MEASURING NOTHING.
#
# THE DEFECT. `runk` mutated the manifest in a scratch copy of the POOL. But K reads the manifest
# from the PACKAGE's github/ copy first, deliberately — "a package whose whole job is to correct
# this document would otherwise be failed BY the correction it is shipping." So once §L required
# every release package to ship a manifest (2026-09-03, the same day these controls were written),
# every one of these controls edited a file K never opened.
#
# WHAT THAT LOOKED LIKE, measured 2026-09-07: P29, P30, P31 and P34 reported
# "mutation did not apply - control is INVALID" — they fail closed, which is why they were the
# honest ones. **P32 reported CAUGHT and the pass was SPURIOUS**: K-8 fired, but on the package's
# genuinely stale package_check.mjs row, not on P32's mutation. P33 fired K-8 instead of K-9 for
# the same reason. **A control that cannot tell its own mutation from the ambient state is
# measuring the ambient state.** That is the identical defect P41 had on its first draft, caught
# the same afternoon; the fix there and here is to match on the thing the control itself changed.
#
# THE FIX, and why this route rather than the other. Two were available: mutate the manifest K
# actually reads, or hand K a package with no manifest so it falls back to the pool. **The second
# tests a configuration that never occurs** — §L requires every release package to ship a manifest —
# so it would be a green reading from a shape no release has. These now copy the PACKAGE, mutate
# its manifest in BOTH github/ and knowledge/, and run against that.
#
# ⚠ AND NOTHING IS HARDCODED ANY MORE. The old P29/P30/P31/P34 named `v5.61`, `v5.60`,
# `7e1a0288…` and `ba3968f2…` literally, so they went stale the release after they were written
# and had reported INVALID ever since. Every value is now DERIVED from the manifest under test.
#
# ⚠ P29 is still the reason section K exists. It reproduces the v5.61 defect — the manifest not
# updated at all, so NEITHER build table rolls — and asserts two things: that K-1 CATCHES it, and
# that **K-7 DOES NOT**. If K-7 ever starts firing on P29, someone has changed it into a different
# check and its WEAK label is a lie.

# runk: $1 label, $2 expected id, $3 "NOT:<id>" or "", $4 python mutation, $5 optional needle the
#       failure line must contain (disambiguation — the P41/P32 lesson)
runk () {
  local label="$1" want="$2" mustnot="$3" mut="$4" needle="${5:-}"
  rm -rf /tmp/pkpool /tmp/pkpkg
  cp -r "$POOLARG" /tmp/pkpool
  cp -r "$APP" /tmp/pkpkg
  # Every copy of the manifest this package could present to K. K prefers github/, then knowledge/,
  # then the pool — mutate all of them so the control does not depend on that ordering.
  local pre="
import os
MANPATHS=[q for q in ['/tmp/pkpkg/github/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpkg/knowledge/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'] if os.path.exists(q)]
assert MANPATHS, 'no manifest anywhere - control is INVALID'
def rd(): return open(MANPATHS[0]).read()
def wr(s):
    for q in MANPATHS: open(q,'w').write(s)
"
  if ! python3 -c "$pre$mut" >/dev/null 2>&1; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (mutation did not apply - control is INVALID)\n" "$label"
    rm -rf /tmp/pkpool /tmp/pkpkg; return
  fi
  local out fired hit
  out=$(node "$PKG_CHECK" /tmp/pkpkg "$CLONE" "" /tmp/pkpool 2>&1)
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+b?' | sort -u | tr '\n' ',')
  if [ -n "$mustnot" ] && echo "$fired" | grep -q "${mustnot#NOT:}"; then
    MISS=$((MISS+1)); printf "  *** FINDING *** %s - %s fired when it must NOT (fired: %s)\n" "$label" "${mustnot#NOT:}" "$fired"
    rm -rf /tmp/pkpool /tmp/pkpkg; return
  fi
  # ⚠ When a needle is given the failure line must name the control's OWN mutation. Without this a
  # control passes on any unrelated failure of the same check — which is how P32 passed spuriously.
  if [ -n "$needle" ]; then
    hit=$(echo "$out" | grep "✗" | grep -- "$want" | grep -F -- "$needle")
    [ -n "$hit" ] || fired="(no line naming $needle)"
  fi
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s%s\n" "$want" "$label" "${mustnot:+   [and ${mustnot#NOT:} correctly silent]}"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, fired: %s)\n" "$label" "$want" "${fired:-none}"
  fi
  rm -rf /tmp/pkpool /tmp/pkpkg
}

runk "P29 THE v5.61 DEFECT - manifest not updated at all, NEITHER table rolled" "K-1" "NOT:K-7" "
import re
s=rd()
a=s.index('## Current build'); b=s.index('## Prior build')
def ver(blk): return re.search(r'\| Version \| \*\*(v5\.(\d+))\*\* \|', blk)
mc=ver(s[a:b]); mp=ver(s[b:]); assert mc and mp, 'version rows not found'
n=int(mc.group(2))
cur=s[a:b].replace(mc.group(1), 'v5.%d'%(n-1), 1)
pri=s[b:].replace(mp.group(1), 'v5.%d'%(n-2), 1)
assert cur!=s[a:b] and pri!=s[b:], 'neither table moved'
wr(s[:a]+cur+pri)
"

runk "P30 Current source md5 corrupted" "K-2" "" "
import re
s=rd()
a=s.index('## Current build'); b=s.index('## Prior build')
m=re.search(r'\| Source md5 \| .?([0-9a-f]{32})', s[a:b]); assert m, 'no Source md5 row'
wr(s[:a]+s[a:b].replace(m.group(1),'0'*28+'dead',1)+s[b:])
"

runk "P31 Current built-artifact md5 corrupted" "K-3" "" "
import re
s=rd()
a=s.index('## Current build'); b=s.index('## Prior build')
m=re.search(r'index\.html.{0,2} md5 \| .?([0-9a-f]{32})', s[a:b]); assert m, 'no built md5 row'
wr(s[:a]+s[a:b].replace(m.group(1),'0'*28+'beef',1)+s[b:])
"

# ⚠ P32 CARRIES A NEEDLE. Its predecessor reported CAUGHT while K-8 was firing on an unrelated
# genuinely-stale row. The needle is the filename this control itself corrupted.
#
# ⚠ ITS EXTENSION SET (mjs|cjs|sh) IS NARROWER THAN K-8's ON PURPOSE — decision D-4, 2026-09-08.
# This selector does not need the widest set; it needs SOME row it can corrupt, and it must find
# one that is really in the pool. Widening it "for consistency" would buy nothing and would add a
# fourth copy of the gate's expression to keep in step. `qa/tools/row_census.cjs` checks the three
# copies that MUST agree and EXCLUDES this one by name, so a future census reports it as
# deliberate rather than as drift. Do not delete this comment; it is the reason the census is
# allowed to ignore this line.
P32F=$(node -e '
  const {readFileSync,existsSync}=require("fs");const d=process.argv[1];
  const M=readFileSync(d+"/PROJECT_KNOWLEDGE_INDEX.md","utf8");
  for(const m of M.matchAll(/\|\s*`?([A-Za-z0-9_.\-]+\.(?:mjs|cjs|sh))`?\s*\|\s*`?([0-9a-f]{32})`?/g))
    if(existsSync(d+"/"+m[1])){console.log(m[1]);break;}' "$POOLARG")
runk "P32 a fallback hash-table row goes stale ($P32F)" "K-8" "" "
import re
s=rd(); f=re.escape('$P32F')
m=re.search(r'.'+f+r'. \| .([0-9a-f]{32})', s); assert m, 'row not found'
wr(s[:m.start(1)]+'0'*32+s[m.end(1):])
" "$P32F"

# ⚠ P33 CARRIES A NEEDLE for the same reason, and asserts K-9 specifically: renaming a filename
# also breaks that file's hash row, so K-8 fires too and the id alone cannot tell them apart.
P33F=$(node -e '
  const {readFileSync,readdirSync}=require("fs");const d=process.argv[1];
  const M=readFileSync(d+"/PROJECT_KNOWLEDGE_INDEX.md","utf8");
  for(const f of readdirSync(d)) if(/\.(cjs|mjs)$/.test(f) && M.includes(f)){console.log(f);break;}' "$POOLARG")
runk "P33 a pool file loses its only manifest row ($P33F)" "K-9" "" "
s=rd(); assert '$P33F' in s, 'name not in manifest'
wr(s.replace('$P33F','REMOVED_BY_CONTROL.cjs'))
" "$P33F"

runk "P34 Current rolled but Prior NOT - the defect that ran for seven releases" "K-7" "" "
import re
s=rd(); b=s.index('## Prior build')
m=re.search(r'\| Version \| \*\*(v5\.(\d+))\*\* \|', s[b:]); assert m, 'Prior version row not found'
wr(s[:b]+s[b:].replace(m.group(1),'v5.%d'%(int(m.group(2))-5),1))
"

# ⚠ P35: the manifest is GONE from the PACKAGE, the clone AND the pool. K must SKIP LOUDLY, never
# pass blind — the E-14 shape, where a check that cannot reach its input and reports green is worse
# than none. ⚠ THE PACKAGE HALF IS NEW: the old version removed it from the clone and pool only, so
# K still found the package's own copy and had nothing to skip. It was passing for the wrong reason.
rm -rf /tmp/pkpool /tmp/pkclone2 /tmp/pkpkg
cp -r "$POOLARG" /tmp/pkpool && rm -f /tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md
cp -r "$CLONE" /tmp/pkclone2 && rm -f /tmp/pkclone2/PROJECT_KNOWLEDGE_INDEX.md
cp -r "$APP" /tmp/pkpkg && rm -f /tmp/pkpkg/github/PROJECT_KNOWLEDGE_INDEX.md /tmp/pkpkg/knowledge/PROJECT_KNOWLEDGE_INDEX.md
out35=$(node "$PKG_CHECK" /tmp/pkpkg /tmp/pkclone2 "" /tmp/pkpool 2>&1)
if echo "$out35" | grep -q "SKIPPED: K-1..K-9"; then
  PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "K-*" "P35 manifest absent EVERYWHERE - K skips LOUDLY instead of passing blind"
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P35 K did not skip loudly with no manifest - it may be passing blind\n"
fi
rm -rf /tmp/pkpool /tmp/pkclone2 /tmp/pkpkg

# ── P42 / P43 · D-C-1 (a): K-8 must read a hash ROW, not a hash QUOTED IN PROSE ──────────────
# ⚠ WHY THESE EXIST. K-8's matcher allowed any prose between the filename and the hash, so a
# DESCRIPTION row that merely quoted an md5 was read as that file's hash row. The instance was
# `MissingFeatures.md`, whose index row carries "RE-PINNED TO v5.48 on 2026-08-25 (`6b30580a…`)".
# K-8 read that dated statement about a PAST build as a live hash — accidentally correct for two
# weeks, and red the moment the file was first edited, pointing at a hash nobody should ever roll.
#
# ⚠ THE PAIR IS THE POINT, and it is the H-6 lesson. P42 alone would pass if K-8 were simply
# deleted. P43 proves the check still WORKS after being narrowed. A control that only shows a check
# going quiet has not distinguished "fixed" from "broken".
# ⚠ Both carry a NEEDLE so neither can pass on an unrelated K-8 failure — the P41/P32 lesson.

# P42 is bespoke rather than a runk call: runk asserts that a check FIRES, and P42's whole claim is
# that none does. Written out so the assertion is visible instead of inverted through a helper.
rm -rf /tmp/pkpool /tmp/pkpkg
cp -r "$POOLARG" /tmp/pkpool && cp -r "$APP" /tmp/pkpkg
if python3 - <<'P42PY' >/dev/null 2>&1
import os
MANPATHS=[q for q in ['/tmp/pkpkg/github/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpkg/knowledge/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'] if os.path.exists(q)]
assert MANPATHS, 'no manifest anywhere - control is INVALID'
s=open(MANPATHS[0]).read()
row='| `t1_units.mjs` | audit note: was pinned at `00000000000000000000000000000000` before v5.30 | history |\n'
assert row not in s, 'needle already present - control is INVALID'
for q in MANPATHS: open(q,'w').write(s.rstrip()+'\n'+row)
P42PY
then
  out42=$(node "$PKG_CHECK" /tmp/pkpkg "$CLONE" "" /tmp/pkpool 2>&1)
  # â  NEEDLE, and it is load-bearing. The first draft asserted "K-8 did not fire AT ALL" and
  # reported a FINDING on a run where K-8 was firing for an unrelated stale row. That is the P41 and
  # P32 defect exactly: a control that cannot tell its own mutation from the ambient state is
  # measuring the ambient state. The claim is narrower and correct - K-8 must not name THIS file.
  if echo "$out42" | grep "â" | grep "K-8" | grep -q "t1_units.mjs"; then
    MISS=$((MISS+1)); printf "  *** FINDING *** %s\n" "P42 K-8 named t1_units.mjs from a hash QUOTED IN PROSE - the D-C-1 matcher fix has regressed"
  else
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "K-8" "P42 a hash quoted in prose is correctly IGNORED (D-C-1)"
  fi
else
  MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P42 mutation did not apply - control is INVALID\n"
fi
rm -rf /tmp/pkpool /tmp/pkpkg

runk "P43 A REAL HASH ROW STILL FIRES after the matcher was narrowed (D-C-1)" "K-8" "" "
s=rd()
import re
m=re.search(r'^\|\s*\`?(t1_units\.mjs)\`?\s*\|\s*\`?([0-9a-f]{32})\`?\s*\|', s, re.M)
assert m, 'no real hash row for t1_units.mjs - control is INVALID'
wr(s[:m.start(2)]+'deadbeef'+m.group(2)[8:]+s[m.end(2):])
" "t1_units.mjs"

# ── P44 / P45 · D-1 (a): K-8 must now SEE a .py row ─────────────────────────────────────────────
# ⚠ BOTH CONTROLS INJECT A ROW THAT IS NOT IN THE TREE, AND THAT IS THE WHOLE DESIGN. Measured
# 2026-09-08: the old matcher, the widened one and an accept-anything one all see EXACTLY THE SAME
# 78 rows against the live manifest, because it carries no .py row. So a control written against
# the manifest as it stands is GREEN BEFORE AND AFTER THE WIDENING and proves nothing. That is the
# endpoint-only table-test class, found three times across two sessions and every time by a
# control rather than by review. Do not "simplify" these to use an existing row.
#
# ⚠ THE PAIR IS THE POINT (the H-6 lesson, and P42/P43's). P44 alone would pass if the matcher were
# widened to match EVERYTHING including rows it should leave alone; P45 is what shows the widened
# matcher still distinguishes a correct row from a stale one. Neither is evidence without the other.
#
# The target is DERIVED: the first .py file that is really in the pool. Nothing here names a file
# that can be renamed away, which is the defect that had package_check_controls.sh printing
# NOT CAUGHT for every control from a dead session's absolute paths.
PYF=$(node -e '
  const {readdirSync}=require("fs");
  const f=readdirSync(process.argv[1]).filter(x=>x.endsWith(".py")).sort()[0];
  if(f) console.log(f);' "$POOLARG")
if [ -z "$PYF" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P44/P45 - no .py file in the pool to build a row from"
else
  runk "P44 a .py hash row goes STALE - the case the old matcher could not see ($PYF)" "K-8" "" "
import hashlib, os, re
s = rd()
pool = os.path.dirname(MANPATHS[-1]) if MANPATHS[-1].startswith('/tmp/pkpool') else '/tmp/pkpool'
f = '$PYF'
assert os.path.exists(os.path.join(pool, f)), 'target .py not in the mutated pool - control is INVALID'
# a row for a real pool file, carrying a hash that is deliberately NOT its hash
m = re.search(r'^\| \`hand_86\.mjs\` \|', s, re.M)
assert m, 'anchor row not found - control is INVALID'
row = '| \`' + f + '\` | \`' + '0'*32 + '\` | qa/tools/' + f + ' |\n'
wr(s[:m.start()] + row + s[m.start():])
" "$PYF"

  # ⚠ P45 asserts K-8 stays SILENT, so it cannot use runk, which asserts that a check FIRES.
  # Same shape as P42, and for the same reason.
  rm -rf /tmp/pkpool /tmp/pkpkg
  cp -r "$POOLARG" /tmp/pkpool; cp -r "$APP" /tmp/pkpkg
  if python3 -c "
import hashlib, os, re
MANPATHS=[q for q in ['/tmp/pkpkg/github/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpkg/knowledge/PROJECT_KNOWLEDGE_INDEX.md',
                      '/tmp/pkpool/PROJECT_KNOWLEDGE_INDEX.md'] if os.path.exists(q)]
assert MANPATHS, 'no manifest anywhere - control is INVALID'
s=open(MANPATHS[0]).read()
f='$PYF'
# ⚠ HASH THE COPY K-8 WILL ACTUALLY COMPARE AGAINST, WHICH IS THE PACKAGE'S OWN knowledge/
# COPY IF IT SHIPS ONE, AND THE POOL OTHERWISE. K-8 resolves in that order deliberately (fixed
# 2026-09-07, 'AS THIS PACKAGE WILL LEAVE THE POOL'), and a control that hashes the pool copy of a
# file the package is REPLACING injects a row that is correct against the old bytes and stale
# against the new ones -- so K-8 fires and P45 reports a FINDING against a gate behaving exactly
# as designed. That happened on this control's first run, against a package shipping a new
# controls_manifest_rows.py. FOURTH occurrence of this shape in this project; see K-8's own note.
_shipped=os.path.join('/tmp/pkpkg/knowledge',f)
_src=_shipped if os.path.exists(_shipped) else os.path.join('/tmp/pkpool',f)
h=hashlib.md5(open(_src,'rb').read()).hexdigest()
m=re.search(r'^\| \`hand_86\.mjs\` \|', s, re.M)
assert m, 'anchor row not found - control is INVALID'
row='| \`'+f+'\` | \`'+h+'\` | qa/tools/'+f+' |\n'
out=s[:m.start()]+row+s[m.start():]
for q in MANPATHS: open(q,'w').write(out)
" >/dev/null 2>&1; then
    OUT45=$(node "$PKG_CHECK" /tmp/pkpkg "$CLONE" "" /tmp/pkpool 2>&1)
    # ⚠ A NEEDLE FOR A SILENCE ASSERTION. P45 claims K-8 does not fire ON ITS OWN ROW; it must not
    # claim K-8 is globally silent, or any unrelated stale row in the package turns this control
    # into a FINDING about a gate that is behaving correctly. That happened on its first run: the
    # package carried a genuinely stale row for a file it was itself editing, and P45 reported the
    # widened matcher as "matching too much" while pointing at something else entirely. Same shape
    # as P32's spurious pass and P42's first draft — a control that cannot tell its own effect from
    # the background has measured nothing, in either direction.
    if echo "$OUT45" | grep "✗" | grep "K-8" | grep -qF -- "$PYF"; then
      MISS=$((MISS+1)); printf "  *** FINDING *** P45 K-8 fired on a CORRECT .py row (%s) - the widened matcher is matching too much\n" "$PYF"
      echo "$OUT45" | grep "✗" | grep "K-8" | head -1
    else
      PASS=$((PASS+1)); printf "  CORRECTLY SILENT   P45 a CORRECT .py row leaves K-8 green (the pair for P44)\n"
    fi
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P45 mutation did not apply - control is INVALID\n"
  fi
  rm -rf /tmp/pkpool /tmp/pkpkg
fi

[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
fi

# ── P46..P49 · D-1's POST-SHIP completeness form, and B-2's repair (2026-09-14) ──────────────────
#
# WHY THESE EXIST. At the v5.71 ship 17 files were uploaded to the repo ROOT instead of qa/, and
# package_check said nothing: D-1 asks the PRE-SHIP question ("does everything in github/ differ
# from the tree?"), which a never-landed file answers YES to just as loudly as a correctly-changed
# one. The count that would have named all 17 was already computed and printed as an informational
# line. D-1 now has a post-ship complement, selected by the J-1/J-2 phase oracle.
#
# ⚠ THESE NEED A POOL, like the K controls, because the phase oracle reads it — `run` above passes
# only two positionals, which lands every package in PHASE=UNKNOWN where the complement is (by
# design, and out loud) not evaluated. They get their own runner.
#
# ⚠ THE RUNNER STARTS FROM "EVERYTHING LANDED" AND BREAKS ONE THING. Building the broken state
# directly would leave the control unable to tell its own mutation from a package that simply
# differs from the clone — the P32 defect, where a control reported CAUGHT because K-8 was firing
# on unrelated ambient staleness. Here the scratch clone is first brought fully up to date FROM the
# package, which makes the post-ship form green, and only then is one file broken. Each control
# below asserts the baseline is GREEN before its mutation, so a control that fires on the ambient
# state is reported as INVALID rather than counted as a pass.
if [ -z "${POOLARG:-}" ] || [ ! -d "${POOLARG:-}" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P46..P49 - no pool dir given (same argument as P29..P35)"
else

# rund1: $1 label, $2 expected id ("" = must stay silent), $3 shell mutation run from /tmp/pkd1,
#        $4 optional needle the failure line must contain
rund1 () {
  local label="$1" want="$2" mut="$3" needle="${4:-}"
  rm -rf /tmp/pkd1 /tmp/pkd1clone /tmp/pkd1pool
  cp -r "$APP" /tmp/pkd1
  cp -r "$CLONE" /tmp/pkd1clone && rm -rf /tmp/pkd1clone/.git
  # POST-SHIP by construction: the scratch pool holds exactly the package's knowledge/ half, so
  # J-1 and J-2 are both green and the oracle reports post-ship.
  mkdir -p /tmp/pkd1pool && cp /tmp/pkd1/knowledge/* /tmp/pkd1pool/ 2>/dev/null
  # "everything landed": copy every github/ file into the scratch clone at its packaged path.
  ( cd /tmp/pkd1/github && find . -type f | while read -r f; do
      mkdir -p "/tmp/pkd1clone/$(dirname "$f")" && cp "$f" "/tmp/pkd1clone/$f"; done )
  # baseline must be GREEN, or the control is measuring the ambient state (the P32 lesson)
  local base
  base=$(node "$PKG_CHECK" /tmp/pkd1 /tmp/pkd1clone "" /tmp/pkd1pool 2>&1)
  if ! echo "$base" | grep -q "phase: POST-SHIP"; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (phase oracle did not report POST-SHIP - control is INVALID)\n" "$label"
    return
  fi
  if echo "$base" | grep "✗" | grep -q "D-1 (post-ship)"; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (D-1 post-ship already red BEFORE the mutation - control is INVALID)\n" "$label"
    return
  fi
  ( cd /tmp/pkd1 && eval "$mut" ) >/dev/null 2>&1
  local out fired hit
  out=$(node "$PKG_CHECK" /tmp/pkd1 /tmp/pkd1clone "" /tmp/pkd1pool 2>&1)
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+b?' | sort -u | tr '\n' ',')
  if [ -z "$want" ]; then   # silence assertion (the P49 half of the pair)
    if echo "$out" | grep "✗" | grep -qF -- "$needle"; then
      MISS=$((MISS+1)); printf "  *** FINDING *** %s - fired when it must NOT\n" "$label"
      echo "$out" | grep "✗" | grep -F -- "$needle" | head -1
    else
      PASS=$((PASS+1)); printf "  CORRECTLY SILENT   %s\n" "$label"
    fi
    return
  fi
  if [ -n "$needle" ]; then
    hit=$(echo "$out" | grep "✗" | grep -F -- "$needle")
    [ -n "$hit" ] || fired="(no line naming $needle)"
  fi
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, fired: %s)\n" "$label" "$want" "${fired:-none}"
  fi
}

# P46 — the general case: one packaged file never reached the tree at all.
D1F=$(cd "$APP/github" && find . -type f | head -1 | sed 's|^\./||')
rund1 "P46 a packaged github/ file never LANDED in the tree ($D1F)" "D-1" \
  "rm -f /tmp/pkd1clone/$D1F" "$D1F"

# P47 — THE v5.71 DEFECT, EXACTLY. Not "a file is missing" but "the qa/ paths still exist holding
# the PRIOR release's bytes", which is what a flattened upload leaves behind. D-2 stays green
# throughout (the paths DO exist), which is precisely why nothing caught it.
# ⚠ Verified before the fix was written: with this shape the OLD D-1 and D-2 both passed green and
# the only trace was `(informational: N changed/new files in github/)`.
rund1 "P47 THE v5.71 DEFECT - qa/ paths exist but hold PRIOR bytes (flattened upload)" "D-1" \
  "for f in \$(cd /tmp/pkd1/github && find . -type f -name '*.mjs' | sed 's|^\./||'); do
     [ -f /tmp/pkd1clone/\$f ] && { printf '// stale prior-release copy\n' > /tmp/_p47; cat /tmp/pkd1clone/\$f >> /tmp/_p47; cp /tmp/_p47 /tmp/pkd1clone/\$f; }
   done" "did NOT land"

# ── P48 / P49 · B-2's repair ────────────────────────────────────────────────────────────────────
# B-2 matched on FILENAME alone and fired on any package shipping src/index.html to the pool — a
# legitimate build input, which v5.71 had to ship. It landed in that package's DO NOT SEND list.
#
# ⚠ THE PAIR IS THE POINT (the H-6 lesson, and P42/P43's). Repairing B-2 by DELETING it would make
# P49 pass and P48 fail. P48 is what forces a repair that still catches a genuinely built artifact
# in knowledge/; P49 is what shows the false positive is gone. Neither alone proves anything.
if [ -f "$CLONE/index.html" ] && [ -f "$CLONE/src/index.html" ]; then
  rund1 "P48 the genuinely BUILT index.html shipped to knowledge/ - must STILL fire" "B-2" \
    "cp '$CLONE/index.html' knowledge/index.html" "index.html"
  rund1 "P49 src/index.html (the Vite template) shipped to knowledge/ - the FALSE POSITIVE, must NOT fire" "" \
    "cp '$CLONE/src/index.html' knowledge/index.html" "B-2"
else
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P48/P49 - clone has no index.html + src/index.html pair to build from"
fi

[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
fi

# ── P50..P55 · the three blind spots (2026-09-14) ───────────────────────────────────────────────
#
# ⚠ ALL THREE GATES HAVE A ZERO BASELINE, which is why each ships as a PAIR. A gate that can never
# fire and a gate that has been deleted are indistinguishable from their green runs alone, and all
# three of these are green on a healthy tree. The silent halves (P51, P53, P55) are what prove the
# loud halves are discriminating rather than just quiet. This is the P48/P49 lesson one level up.
if [ -z "${POOLARG:-}" ] || [ ! -d "${POOLARG:-}" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P50..P55 - no pool dir given"
else

# runG: mutate the CLONE (not the package) and read one gate. $1 label, $2 want ("" = must be
# silent), $3 mutation run from the scratch clone, $4 needle.
# ⚠ The scratch clone is a real git repo: G-3 reads `git ls-files -s`, so a plain `cp -r` would
# leave it with no index and G-3 would SKIP rather than run — a skip that would read as a pass.
runG () {
  local label="$1" want="$2" mut="$3" needle="${4:-}"
  rm -rf /tmp/pkgc /tmp/pkgclone /tmp/pkgpool
  cp -r "$APP" /tmp/pkgc
  git clone -q "$CLONE" /tmp/pkgclone 2>/dev/null || { cp -r "$CLONE" /tmp/pkgclone; }
  mkdir -p /tmp/pkgpool && cp /tmp/pkgc/knowledge/* /tmp/pkgpool/ 2>/dev/null
  if [ ! -d /tmp/pkgclone/.git ]; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (scratch clone has no git index - control is INVALID)\n" "$label"; return
  fi
  local base
  base=$(node "$PKG_CHECK" /tmp/pkgc /tmp/pkgclone "" /tmp/pkgpool 2>&1)
  # ⚠ THE GUARD IS PER-NEEDLE, NOT PER-GATE, and that distinction is load-bearing. A first draft
  # invalidated any control whose target gate was already red — which broke P50..P53 outright,
  # because G-3a is LEGITIMATELY red until the four .py mode fixes land, and a mode cannot be
  # shipped as a file. Guarding on the gate would have made four controls unrunnable for exactly
  # as long as the defect they guard against existed. Guarding on the control's OWN needle asks
  # the right question: did THIS mutation add THIS name?
  if [ -n "$needle" ] && echo "$base" | grep "✗" | grep -qF -- "$needle"; then
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (needle already present BEFORE the mutation - control is INVALID)\n" "$label"; return
  fi
  ( cd /tmp/pkgclone && eval "$mut" ) >/dev/null 2>&1
  local out
  out=$(node "$PKG_CHECK" /tmp/pkgc /tmp/pkgclone "" /tmp/pkgpool 2>&1)
  if [ -z "$want" ]; then
    if echo "$out" | grep "✗" | grep -qF -- "$needle"; then
      MISS=$((MISS+1)); printf "  *** FINDING *** %s - fired when it must NOT\n" "$label"
      echo "$out" | grep "✗" | grep -F -- "$needle" | head -1
    else PASS=$((PASS+1)); printf "  CORRECTLY SILENT   %s\n" "$label"; fi
    return
  fi
  local fired
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+[ab]?' | sort -u | tr '\n' ',')
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, fired: %s)\n" "$label" "$want" "${fired:-none}"
  fi
}

# ── D-3: an EXTRA copy committed elsewhere ──────────────────────────────────────────────────────
# P50 is the v5.68 shape exactly: a tracked file re-committed BYTE-IDENTICALLY at the repo root.
# ⚠ Verified before the gate was written: the pre-fix tool passed this clean, because every
# packaged file DID land and `changed` is 0.
runG "P50 THE v5.68 SHAPE - a tracked file committed byte-identically at an EXTRA path" "D-3" \
  "cp qa/qa-baseline/t1_units.mjs ./t1_units.mjs && git add -f t1_units.mjs && git -c user.email=a@b -c user.name=t commit -qm x" \
  "qa/qa-baseline/t1_units.mjs =="
# P51 is the pair, and the reason this gate is content-based rather than name-based: README.md is
# tracked at THREE paths and index.html at TWO, BY DESIGN. A basename census called those false
# positives (68 candidates, 64 false) and got the gate deferred for a release.
runG "P51 README.md x3 and index.html x2, multi-path BY DESIGN - must NOT fire" "" \
  "true" "D-3"

# ── G-3: file modes ─────────────────────────────────────────────────────────────────────────────
runG "P52 a shebang-carrying file committed 100644" "G-3" \
  "git update-index --chmod=-x qa/runsuite.sh && git -c user.email=a@b -c user.name=t commit -qm x" \
  "qa/runsuite.sh (shebang"
# P53 is the pair: the .mjs/.cjs tools carry NO shebang and are correctly 100644, and three .py
# files are the same. A rule that fired on those would be unusable.
# ⚠ THE NEEDLE IS A SPECIFIC SHEBANG-LESS FILE, not the gate name. G-3a is LEGITIMATELY red until
# the four .py mode fixes land, so "did G-3 fire?" cannot distinguish a false positive from the
# real defect. "Did G-3 name oracle_nm.py?" can: that file has no shebang, sits at 100644, and is
# correct exactly as it is. If the rule ever widens to "all .py are executable", this fires.
# â  THE TRAILING "(" IS NOT COSMETIC. A bare filename needle matched K-8, which lists every pool
# file by name when the scratch pool is thin - so the control reported INVALID on an unrelated
# gate's output. That is the P32 shape precisely. G-3 formats its names as "path (shebang, mode)",
# so the paren scopes the needle to this gate and nothing else.
runG "P53 oracle_nm.py - no shebang, 100644, CORRECT - must never be named by G-3" "" \
  "true" "oracle_nm.py ("

# ── J-5: a file that should have LEFT the pool ──────────────────────────────────────────────────
# ⚠ J-5 reads MANIFEST.txt, not the clone, so these two mutate the PACKAGE. The pool copy is built
# from knowledge/, so a declared file that is still in the pool post-ship is the defect.
runJ5 () {
  local label="$1" want="$2" manline="$3" poolfile="$4" needle="${5:-}"
  rm -rf /tmp/pkgc /tmp/pkgclone /tmp/pkgpool
  cp -r "$APP" /tmp/pkgc; cp -r "$CLONE" /tmp/pkgclone
  mkdir -p /tmp/pkgpool && cp /tmp/pkgc/knowledge/* /tmp/pkgpool/ 2>/dev/null
  [ -n "$poolfile" ] && echo "stale" > "/tmp/pkgpool/$poolfile"
  printf '%s\n' "$manline" >> /tmp/pkgc/MANIFEST.txt
  local out fired
  out=$(node "$PKG_CHECK" /tmp/pkgc /tmp/pkgclone "" /tmp/pkgpool 2>&1)
  if [ -z "$want" ]; then
    if echo "$out" | grep "✗" | grep -qF -- "$needle"; then
      MISS=$((MISS+1)); printf "  *** FINDING *** %s - fired when it must NOT\n" "$label"
    else PASS=$((PASS+1)); printf "  CORRECTLY SILENT   %s\n" "$label"; fi
    return
  fi
  fired=$(echo "$out" | grep "✗" | grep -oE '[A-K]-[0-9]+[ab]?' | sort -u | tr '\n' ',')
  if echo "$fired" | grep -q "$want"; then
    PASS=$((PASS+1)); printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** %s (wanted %s, fired: %s)\n" "$label" "$want" "${fired:-none}"
  fi
}
# post-ship by construction (pool == knowledge/), so J-5 asks the ABSENCE question
runJ5 "P54 a RETIRE:-declared file still sitting in the pool post-ship" "J-5" \
  "RETIRE: ZZZ_retired_probe.md" "ZZZ_retired_probe.md" ""
# P55 is the pair: the same declaration, honoured. Without this, deleting J-5 would still pass P54's
# absence... no - without this, a J-5 that fires on EVERY declaration would look correct.
runJ5 "P55 the same RETIRE: declaration, actually honoured - must NOT fire" "" \
  "RETIRE: ZZZ_retired_probe.md" "" "J-5"

[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
fi

# ── P56..P61 · SCOPE_TOOLING_GAPS_V572 (2026-09-15): K-1..K-3 pre-upload, and G-1 under handover ──────
# These need two inputs the positional arguments do not carry, so they come from the environment and
# SKIP LOUDLY without them:
#   PRIOR_CLONE=<dir>   a clone of the repo BEFORE this release (the pre-upload shape of the tree)
#   HANDOVER_PKG=<dir>  an unpacked KIND: handover package with its workbench under handover/
# ⚠ P56 is the FALSE-POSITIVE control and the reason for the change: until 2026-09-15 a CORRECT app-release
#   manifest was red on K-1..K-3 pre-upload, so P57 (P29's mutation, pre-upload) could not be told apart
#   from the baseline — OPERATIONS §I recorded that P29 "cannot fire against an app release".
if [ -z "${PRIOR_CLONE:-}" ] || [ ! -d "${PRIOR_CLONE:-/nonexistent}" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P56/P57 (K pre-upload) - set PRIOR_CLONE to a clone at the prior release"
elif ! grep -q '^## v5' "$APP/github/CHANGELOG.md" 2>/dev/null || [ ! -f "$APP/github/src/DangerClose.jsx" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P56/P57 - '$APP' is not an app release (it ships no source), so K reads the clone either way"
else
  out=$(node "$PKG_CHECK" "$APP" "$PRIOR_CLONE" 2>&1)
  if echo "$out" | grep "✗" | grep -qE 'K-[123]:'; then
    MISS=$((MISS+1)); printf "  *** FALSE POSITIVE *** P56 K-1..K-3 red on a CORRECT app release pre-upload: %s\n" "$(echo "$out" | grep '✗' | grep -E 'K-[123]:' | head -1)"
  else
    PASS=$((PASS+1)); printf "  NOT fired        P56 K-1..K-3 green on a correct app release pre-upload (read from the package)\n"
  fi
  rm -rf /tmp/pkk && cp -r "$APP" /tmp/pkk
  python3 - <<'PY'
import re, os
for q in ['/tmp/pkk/github/PROJECT_KNOWLEDGE_INDEX.md', '/tmp/pkk/knowledge/PROJECT_KNOWLEDGE_INDEX.md']:
    if not os.path.exists(q): continue
    s = open(q).read()
    a = s.index('## Current build'); b = s.index('## Prior build')
    m = re.search(r'\| Version \| \*\*(v5\.(\d+))\*\* \|', s[a:b]); assert m
    s = s[:a] + s[a:b].replace(m.group(1), 'v5.%d' % (int(m.group(2)) - 1), 1) + s[b:]
    open(q, 'w').write(s)
PY
  # keep MANIFEST.txt honest about the mutated copies, so only K can object
  ( cd /tmp/pkk && for f in github/PROJECT_KNOWLEDGE_INDEX.md knowledge/PROJECT_KNOWLEDGE_INDEX.md; do
      [ -f "$f" ] || continue; r=${f#github/}; r=${r#knowledge/}
      sed -i "s|^[0-9a-f]\{32\}  $r\$|$(md5sum "$f" | cut -d' ' -f1)  $r|" MANIFEST.txt; done )
  out=$(node "$PKG_CHECK" /tmp/pkk "$PRIOR_CLONE" 2>&1)
  if echo "$out" | grep "✗" | grep -q 'K-1:'; then
    PASS=$((PASS+1)); printf "  CAUGHT by K-1    P57 a manifest NOT rolled, pre-upload, on an app release (P29's teeth)\n"
  else
    MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P57 stale manifest pre-upload (fired: %s)\n" "$(echo "$out" | grep '✗' | grep -oE '[A-K]-[0-9]+' | sort -u | tr '\n' ',')"
  fi
  rm -rf /tmp/pkk
fi

if [ -z "${HANDOVER_PKG:-}" ] || [ ! -d "${HANDOVER_PKG:-/nonexistent}/handover" ]; then
  SKIP=$((SKIP+1)); echo "  - SKIPPED: P58..P61 (G-1 handover) - set HANDOVER_PKG to an unpacked KIND: handover package"
else
  WB=$(find "$HANDOVER_PKG/handover" -type f -name '*.jsx' | head -1)
  g1 () {  # $1 = package dir, $2 = workspace; prints "fired" or "quiet"
    node "$PKG_CHECK" "$1" "$CLONE" "$2" 2>&1 | grep -q "✗ G-1" && echo fired || echo quiet
  }
  WS=/tmp/pkho_ws; rm -rf "$WS"; mkdir -p "$WS"; cp "$WB" "$WS/DangerClose.jsx"
  if cmp -s "$WS/DangerClose.jsx" "$CLONE/src/DangerClose.jsx"; then
    SKIP=$((SKIP+1)); echo "  - SKIPPED: P58..P61 - the workbench equals the clone's source, so G-1 has nothing to judge"
  else
    [ "$(g1 "$HANDOVER_PKG" "$WS")" = quiet ] \
      && { PASS=$((PASS+1)); printf "  NOT fired        P58 G-1 accepts the workbench carried in handover/ (by content)\n"; } \
      || { MISS=$((MISS+1)); printf "  *** FALSE POSITIVE *** P58 G-1 names the handover workbench\n"; }
    printf '\n// one byte of drift\n' >> "$WS/DangerClose.jsx"
    [ "$(g1 "$HANDOVER_PKG" "$WS")" = fired ] \
      && { PASS=$((PASS+1)); printf "  CAUGHT by G-1    P59 a workspace source that is NOT the packaged workbench\n"; } \
      || { MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P59 a drifted workbench passed as if packaged\n"; }
    cp "$WB" "$WS/DangerClose.jsx"
    rm -rf /tmp/pkho && cp -r "$HANDOVER_PKG" /tmp/pkho && sed -i 's/^KIND:[[:space:]]*handover[[:space:]]*$/KIND: ops/' /tmp/pkho/MANIFEST.txt
    [ "$(g1 /tmp/pkho "$WS")" = fired ] \
      && { PASS=$((PASS+1)); printf "  CAUGHT by G-1    P60 the same package as KIND: ops — the allowance is handover-only\n"; } \
      || { MISS=$((MISS+1)); printf "  *** NOT CAUGHT *** P60 the handover allowance leaked into another KIND\n"; }
    rm -rf /tmp/pkho && cp -r "$HANDOVER_PKG" /tmp/pkho && mv "/tmp/pkho/handover/$(basename "$WB")" /tmp/pkho/handover/RENAMED.jsx
    [ "$(g1 /tmp/pkho "$WS")" = quiet ] \
      && { PASS=$((PASS+1)); printf "  NOT fired        P61 the match is by CONTENT, not name (renamed workbench still accepted)\n"; } \
      || { MISS=$((MISS+1)); printf "  *** FINDING *** P61 G-1 depends on the workbench's file name\n"; }
    rm -rf /tmp/pkho
  fi
  rm -rf "$WS"
fi

[ "$SKIP" -gt 0 ] && echo "  ⚠ A SKIPPED control is not a passing one."
[ "$MISS" -gt 0 ] && { echo "  A control that does not fire is a FINDING — investigate the check, never soften it."; exit 1; }
exit 0
