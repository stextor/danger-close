#!/bin/bash
# controls_v571_draft.sh — negative controls for qa/t37_mydata_draft.mjs (SCOPE_A3_DRAFT_AUTOSAVE, v5.71). OPERATIONS §B2.
#
# usage: qa/tools/controls_v571_draft.sh <run-folder>     (a folder built by qa/mk_runfolder.sh v570 v571 …)
#
# Builds scratch copies of the v5.71 leg, each in its own folder so the run folder is never touched, and runs t37 against
# each. C0 is UNMUTATED and must stay green — the control on the controls, so a mutant's failure can only be its mutation.
# C1–C6 each break ONE property the scope's §3 names and require the named t37 check to FAIL. A control that does not fire
# is a finding (§B2), not something to adjust until it does. Asserts nothing in the app; counted in no release total.
#
# ⚠ C2 IS THE ONE THAT MATTERS MOST. It restores the pre-v5.71 wipe path — the draft key absent from clearStorage — which
#   is the defect A-3's fix would have SHIPPED had the eight call sites been repaired without the wipe. A world where C2
#   does not fire is a world where a "permanently deleted" plan stays recoverable from the restore banner.
set -uo pipefail
RUN="$(cd "${1:?usage: controls_v571_draft.sh <run-folder>}" && pwd)"
[ -f "$RUN/v571.jsx" ] && [ -f "$RUN/qa/t37_mydata_draft.mjs" ] || { echo "FATAL: $RUN is not a v570/v571 run folder"; exit 2; }
WORK=$(mktemp -d); met=0; total=0
build () {  # $1 control id (C0..C6)
  local D="$WORK/$1"; mkdir -p "$D/qa"; ln -s "$RUN/node_modules" "$D/node_modules"; cp "$RUN/package.json" "$D/"
  cp "$RUN/qa/shim.txt" "$RUN/qa/mk_testable.sh" "$RUN/qa/env_dom.mjs" "$RUN/qa/t37_mydata_draft.mjs" "$RUN/qa/dom_entry_v571.jsx" "$D/qa/"
  cp "$RUN/v571.jsx" "$D/v571.jsx"
  python3 - "$D/v571.jsx" "$1" <<'PY' || return 1
import sys
p, cid = sys.argv[1], sys.argv[2]

# --- the properties, each quoted from the v5.71 source ---
WRITE   = 'window.storage && window.storage.set(MYDATA_DRAFT_KEY, JSON.stringify({ ts, portfolio: buildPortfolio(), expenses: buildExpenses() }))'
WIPE    = '    window.storage.delete(STORAGE_KEYS.draft).catch(() => null),\n'
FLAGSET = '.then(() => { MYDATA_DRAFT_SAVED = true; setDraftSavedAt(ts); })'
CHIP    = '{draftSavedAt ? `\u25cf Unsaved changes (draft saved ${new Date(draftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : "\u25cf Unsaved changes"}'
DIALOG  = '{MYDATA_DRAFT_SAVED ? "Discarding keeps the auto-saved draft, so you can still restore this work on your next visit." : "Discarding loses these edits."}'
TYPEGD  = 'if (masterPrompt && typeof masterPrompt === "string") MASTER_PROMPT = masterPrompt.slice(0, MASTER_PROMPT_MAX_CHARS);'

M = {
 "C0": None,
 # the autosave reverts to the sync method the contract does not have — finding A-3 itself
 "C1": (WRITE, 'window.storage && window.storage.setItem(MYDATA_DRAFT_KEY, JSON.stringify({ ts, portfolio: buildPortfolio(), expenses: buildExpenses() }))'),
 # the draft key drops out of the wipe list — the leak the v5.9.1 review existed to prevent
 "C2": (WIPE, ''),
 # the chip promises a draft unconditionally, as every build through v5.70 did
 "C3": (CHIP, '"\u25cf Unsaved changes (a draft auto-saves every few seconds)"'),
 # the leave dialog's restore sentence goes unconditional again
 "C4": (DIALOG, '"Discarding keeps the auto-saved draft, so you can still restore this work on your next visit."'),
 # A-6: the type check is dropped, an object reaches the system prompt
 "C5": (TYPEGD, 'if (masterPrompt) MASTER_PROMPT = masterPrompt;'),
 # A-6: the length cap is dropped but the type check kept — the cap must be controlled separately
 "C6": (TYPEGD, 'if (masterPrompt && typeof masterPrompt === "string") MASTER_PROMPT = masterPrompt;'),
}
s = open(p, encoding="utf-8").read()
if M[cid]:
    old, new = M[cid]; c = s.count(old)
    if c != 1:
        print(f"  anchor count {c} for {cid} — mutation NOT applied"); sys.exit(1)
    s = s.replace(old, new)
open(p, "w", encoding="utf-8").write(s)
PY
  (cd "$D" && ./qa/mk_testable.sh v571 >/dev/null && npx esbuild qa/dom_entry_v571.jsx --bundle --format=cjs --platform=browser \
     --loader:.jsx=jsx --jsx=automatic --outfile=qa/dom_v571.cjs --log-level=error) || return 1
}
check () {  # $1 id, $2 description, $3 "green" or an ERE naming the t37 check that must FAIL
  total=$((total+1))
  if ! build "$1"; then echo "  ✗ $1 $2: the scratch leg did not build"; return; fi
  local out tally; out=$(cd "$WORK/$1/qa" && timeout 900 node t37_mydata_draft.mjs v571 2>&1); tally=$(echo "$out" | grep -E '^t37 SUITE:')
  if [ "$3" = "green" ]; then
    if echo "$tally" | grep -q ' 0 failed'; then echo "  ✓ $1 $2: green, as it must be — $tally"; met=$((met+1))
    else echo "  ✗ $1 $2: expected green — $tally"; echo "$out" | grep '✗' | head -5; fi
  else
    if echo "$out" | grep '✗' | grep -Eq "$3"; then echo "  ✓ $1 $2: FIRED — $(echo "$out" | grep '✗' | grep -E "$3" | head -1 | cut -c1-130)"; met=$((met+1))
    else echo "  ✗ $1 $2: DID NOT FIRE — expected a failure matching /$3/ — $tally"; echo "$out" | grep '✗' | head -5; fi
  fi
}

echo "controls_v571_draft — negative controls for t37 (SCOPE_A3_DRAFT_AUTOSAVE)"
check C0 "unmutated leg"                                   green
check C1 "autosave reverted to sync setItem (A-3 itself)"  'W-1'
check C2 "draft key removed from the wipe list (the leak)" 'WP-1'
check C3 "dirty chip promises a draft unconditionally"     'PR-2'
# C4 is caught by the LD group, which EXISTS BECAUSE OF C4: on the first run this control did not
# fire at all, because nothing in t37 reached the leave dialog before a draft had been written.
check C4 "leave dialog promises a draft unconditionally"   'LD-2|LD-3'
check C5 "A-6 type check dropped"                          'A6-4|A6-5'
check C6 "A-6 length cap dropped"                          'A6-2'
echo "controls_v571_draft: $met/$total met"
rm -rf "$WORK"
[ "$met" -eq "$total" ] || exit 1
