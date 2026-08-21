#!/bin/bash
# Negative controls for package_check.mjs (OPERATIONS §B2). Each perturbs ONE §L requirement
# in a scratch copy of the real v5.42 package and requires the corresponding check to FAIL.
run () {  # $1 = label, $2 = expected check id, $3.. = mutation commands
  local label="$1" want="$2"; shift 2
  rm -rf /tmp/pk && mkdir -p /tmp/pk && cp -r /home/claude/pkg/danger-close-v5.42 /tmp/pk/
  local D=/tmp/pk/danger-close-v5.42
  ( cd "$D" && eval "$@" ) >/dev/null 2>&1
  local out; out=$(node /home/claude/package_check.mjs "$D" /tmp/ship 2>&1)
  local fired; fired=$(echo "$out" | grep "✗" | grep -oE '^\s*✗ [A-F]-[0-9]+' | grep -oE '[A-F]-[0-9]+' | tr '\n' ',' )
  if echo "$fired" | grep -q "$want"; then printf "  CAUGHT by %-6s %s\n" "$want" "$label"
  else printf "  *** NOT CAUGHT *** (wanted %s, fired: %s) %s\n" "$want" "${fired:-none}" "$label"; fi
}
echo "NEGATIVE CONTROLS — package_check.mjs"
run "P1  a MANIFEST-listed file is missing from the zip"      C-2 'rm github/qa/t24_ss86_phasein.mjs'
run "P2  a shipped file is silently modified after hashing"   C-3 'echo "// drift" >> github/qa/runsuite.sh'
run "P3  a file is in the zip but not in MANIFEST"            C-4 'echo x > github/qa/stray.mjs'
run "P4  an UNCHANGED file is shipped in github/"             D-1 'cp /tmp/ship/vite.config.js github/ && printf "%s  vite.config.js\n" "$(md5sum < /tmp/ship/vite.config.js | cut -d\  -f1)" >> MANIFEST.txt'
run "P5  a file lands at the WRONG repo path"                 D-2 'mkdir -p github/qa/wrong && mv github/qa/tools/hand_86.mjs github/qa/wrong/ && sed -i "s|qa/tools/hand_86.mjs|qa/wrong/hand_86.mjs|" MANIFEST.txt'
run "P6  the BUILT index.html is sent to knowledge/"          B-2 'cp github/index.html knowledge/ && printf "%s  index.html\n" "$(md5sum < github/index.html | cut -d\  -f1)" >> MANIFEST.txt'
run "P7  knowledge/ is nested instead of flat"                B-1 'mkdir -p knowledge/qa && mv knowledge/t24_ss86_phasein.mjs knowledge/qa/ && sed -i "s|^\(.*\)  t24_ss86_phasein.mjs|\1  qa/t24_ss86_phasein.mjs|" MANIFEST.txt'
run "P8  a THIRD .jsx source rides along (rotation broken)"   B-3 'cp knowledge/DangerClose-v5_42.jsx knowledge/DangerClose-v5_41.jsx && printf "%s  DangerClose-v5_41.jsx\n" "$(md5sum < knowledge/DangerClose-v5_42.jsx | cut -d\  -f1)" >> MANIFEST.txt'
run "P9  the two destinations disagree on the same file"      E-1 'echo "// diverged" >> knowledge/runsuite.sh && sed -i "s|^.*  runsuite.sh$|$(md5sum < knowledge/runsuite.sh | cut -d\  -f1)  runsuite.sh|" MANIFEST.txt'
run "P10 versioned source != canonical source"                E-2 'echo "// x" >> knowledge/DangerClose-v5_42.jsx && sed -i "s|^.*  DangerClose-v5_42.jsx$|$(md5sum < knowledge/DangerClose-v5_42.jsx | cut -d\  -f1)  DangerClose-v5_42.jsx|" MANIFEST.txt'
run "P11 COMMIT_MESSAGE.txt forgotten"                        A-2 'rm COMMIT_MESSAGE.txt'
run "P12 README omits a file from the delete-first list"      F-2 'sed -i "s|t23_roth_ladder_rmd.mjs||g" README-FIRST.md'
run "P13 MANIFEST does not record the packaged-copy run"      C-5 'sed -i "/packaged copies/Id" MANIFEST.txt'
run "P14 smoke_built not recorded"                            C-6 'sed -i "/smoke_built/Id" MANIFEST.txt'
run "P16 an ops package smuggles an app source"               B-3 'sed -i "s|^KIND: app-release|KIND: ops|" MANIFEST.txt'

# P15 needs the OPS package as its base: fail-closed is only observable on an undeclared
# package that is NOT a release. Run separately rather than through run(), which is pinned
# to the app-release package.
rm -rf /tmp/pk2 && mkdir -p /tmp/pk2 && cp -r /home/claude/pkg2/danger-close-ops-v2 /tmp/pk2/
sed -i '/^KIND:/d' /tmp/pk2/danger-close-ops-v2/MANIFEST.txt
out=$(node /home/claude/package_check.mjs /tmp/pk2/danger-close-ops-v2 /tmp/ship 2>&1)
if echo "$out" | grep -q "✗ A-1"; then
  echo "  CAUGHT by A-1    P15 KIND undeclared on an ops package (defaults to app-release, fail-closed)"
else
  echo "  *** NOT CAUGHT *** P15 KIND undeclared — fail-closed default is NOT working"
fi
