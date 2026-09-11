#!/bin/bash
# controls_v570_b3.sh — negative controls for qa/t36_ai_route.mjs (SCOPE_B3_KEYLESS_AI_ROUTE, v5.70). OPERATIONS §B2.
#
# usage: qa/tools/controls_v570_b3.sh <run-folder>     (a folder built by qa/mk_runfolder.sh v569 v570 …)
#
# Builds scratch copies of the v5.70 leg, each in its own folder so the run folder is never touched, and runs t36 against
# each. C0 is UNMUTATED and must stay green — the control on the controls, so a mutant's failure can only be its mutation.
# C1–C3 each break ONE property the scope's §3 names and require the named t36 check to FAIL. A control that does not fire
# is a finding (§B2), not something to adjust until it does. Asserts nothing in the app; counted in no release total.
set -uo pipefail
RUN="$(cd "${1:?usage: controls_v570_b3.sh <run-folder>}" && pwd)"
[ -f "$RUN/v570.jsx" ] && [ -f "$RUN/qa/t36_ai_route.mjs" ] || { echo "FATAL: $RUN is not a v569/v570 run folder"; exit 2; }
WORK=$(mktemp -d); met=0; total=0
build () {  # $1 control id (C0..C3)
  local D="$WORK/$1"; mkdir -p "$D/qa"; ln -s "$RUN/node_modules" "$D/node_modules"; cp "$RUN/package.json" "$D/"
  cp "$RUN/qa/shim.txt" "$RUN/qa/mk_testable.sh" "$RUN/qa/env_dom.mjs" "$RUN/qa/t36_ai_route.mjs" "$RUN/qa/dom_entry_v570.jsx" "$D/qa/"
  cp "$RUN/v570.jsx" "$D/v570.jsx"
  python3 - "$D/v570.jsx" "$1" <<'PY' || return 1
import sys
p, cid = sys.argv[1], sys.argv[2]
DEF = 'const _aiNoRoute = !IS_CLAUDE_ARTIFACT && !localApiKey && !(localLLM && localLLM.url);'
GUARD = '    if (_aiNoRoute) {\n      setAiThread(t => [...t, { role: "assistant", err: true, text: "Nothing was sent — add your API key above, or set up a Local Model." }]);\n      return;\n    }\n'
M = {"C0": None,
     "C1": (GUARD, ""),                                                             # the refusal deleted
     "C2": (DEF, 'const _aiNoRoute = !IS_CLAUDE_ARTIFACT && !localApiKey;'),         # narrowed to "no key" only
     "C3": (DEF, 'const _aiNoRoute = !localApiKey && !(localLLM && localLLM.url);')} # the claude.ai term dropped
s = open(p, encoding="utf-8").read()
if M[cid]:
    old, new = M[cid]; c = s.count(old)
    if c != 1: print(f"  anchor count {c} for {cid} — mutation NOT applied"); sys.exit(1)
    s = s.replace(old, new)
open(p, "w", encoding="utf-8").write(s)
PY
  (cd "$D" && ./qa/mk_testable.sh v570 >/dev/null && npx esbuild qa/dom_entry_v570.jsx --bundle --format=cjs --platform=browser \
     --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v570.cjs --log-level=error) || return 1
}
check () {  # $1 id, $2 description, $3 "green" or an ERE naming the t36 check that must FAIL
  total=$((total+1))
  if ! build "$1"; then echo "  ✗ $1 $2: the scratch leg did not build"; return; fi
  local out tally; out=$(cd "$WORK/$1/qa" && timeout 600 node t36_ai_route.mjs v570 2>&1); tally=$(echo "$out" | grep -E '^t36 SUITE:')
  if [ "$3" = "green" ]; then
    if echo "$tally" | grep -q ' 0 failed'; then echo "  ✓ $1 $2: green, as it must be — $tally"; met=$((met+1))
    else echo "  ✗ $1 $2: expected green — $tally"; echo "$out" | grep '✗' | head -5; fi
  else
    if echo "$out" | grep '✗' | grep -Eq "$3"; then echo "  ✓ $1 $2: FIRED — $(echo "$out" | grep '✗' | grep -E "$3" | head -1 | cut -c1-120)"; met=$((met+1))
    else echo "  ✗ $1 $2: DID NOT FIRE — $tally"; fi
  fi
}
echo "controls_v570_b3 — t36 against scratch v5.70 legs built from $RUN"
check C0 "unmutated"                                   green
check C1 "the refusal deleted"                          "R-1: EXTINCT"
check C2 "the guard narrowed to 'no key' only"          "R-3: a Local Model → exactly one request"
check C3 "the guard's claude.ai term dropped"           "R-4: exactly one request"
echo "controls_v570_b3: $met of $total met expectation"
rm -rf "$WORK"
[ "$met" -eq "$total" ]
