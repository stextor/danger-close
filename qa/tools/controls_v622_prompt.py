#!/usr/bin/env python3
"""controls_v622_prompt.py — negative controls for t85 (docs/SCOPE_D53_PROMPT_V622.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t85 §D
renders the DOM bundle), t85 runs on the v6.22 leg (§C needs qa/app_v621.mjs beside it), then ./v622.jsx, qa/app_v622.mjs and
qa/dom_v622.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v621 -> v622 run folder:  python3 qa/tools/controls_v622_prompt.py [C1 ...]
    C1  the loader keeps the prompt held before a load without one (v6.21's rule) ............ A-1..A-4, A-6, A-10, B-1, A-7, D-1
    C2  the example's path no longer sets the demo prompt ......................................................... A-6, B-1
    C3  saveToStorage never deletes the prompt key ................................................................ B-2, D-4
    C4  Import stores the raw argument, not the loader's result .................................................. B-2, A-9a, A-9b
    C5  a field on DEFAULT_PORTFOLIO drifts from the demo prompt (Georgia) ....................................... B-3, C-1
    C6  _parseTargetRetireYear back on "2029 when nothing matches" ............................................... B-3b, A-1
    C7  My Data pre-fills a placeholder date of birth ............................................................. D-1, D-2
    C8  the placeholder notice never shown ........................................................................ D-1, D-2b
    C9  the example-facts notice never shown ...................................................................... D-5
    C10 the example-facts notice shown on the example itself ...................................................... C-4
    C11 the Taxes footnote back on "your state … change the master prompt's state line" ............................ D-3b
    C12 the Roth tab's no-state wording back on v6.21's ........................................................... D-3c
    C13 My Data's no-state line never shown ......................................................................... D-3a
    C14 My Data's no-state line ignores a manual rate ............................................................. D-3f
    C15 getSSA back on DEFAULT_PORTFOLIO's amount ................................................................. B-4, E-1
    C16 the loader inserts the example's $3,300 again (the zeroing pass still runs — B-4 alone must catch it) .... B-4
    C17 flagged blocks no longer zeroed ............................................................................ E-3b
    C18 the income banner keyed on a held prompt again ............................................................ E-2, E-3, E-2r
    C19 a backup with no expense table accepted .................................................................... F-1
    C20 the landing guided setup's save omits the prompt (an older key would survive) ............................. B-2
    C21 DC-8: the demo text kept beside a plan's own holdings ..................................................... A-11, A-12
    C22 getSSB back on DEFAULT_PORTFOLIO's amount ................................................................. B-4, E-1
    C23 getPension back on DEFAULT_PORTFOLIO's amount ............................................................. B-4, E-1
    C0  unmutated .............................................................................................. t85 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v622.jsx"); T85 = os.path.join(QA, "t85_prompt_carryover.mjs")
MOD = os.path.join(QA, "app_v622.mjs"); DOM = os.path.join(QA, "dom_v622.cjs")
for p in (SRC, T85, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v622.jsx"), os.path.join(QA, "app_v621.mjs"),
          os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v621 -> v622 run folder copy (missing {p})")
LOADER = ('  if (useDefaults) MASTER_PROMPT = DEFAULT_MASTER_PROMPT;\n'
          '  else if (masterPrompt && typeof masterPrompt === "string") {\n')
LOADER_END = '  else MASTER_PROMPT = "";\n'
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the loader keeps the held prompt", [(LOADER, '  if (masterPrompt && typeof masterPrompt === "string") {\n'), (LOADER_END, "")],
        ["A-1", "A-2", "A-3", "A-4", "A-6", "A-10", "B-1", "A-7", "D-1"]),
 "C2": ("the example's path sets no demo", [("  if (useDefaults) MASTER_PROMPT = DEFAULT_MASTER_PROMPT;\n  else if (masterPrompt", "  if (useDefaults) {}\n  else if (masterPrompt")], ["A-6", "B-1"]),
 "C3": ("saveToStorage never deletes the key", [(": window.storage.delete(STORAGE_KEYS.prompt));", ": Promise.resolve());")], ["B-2", "D-4"]),
 "C4": ("Import stores the raw argument", [("    await saveToStorage({ portfolio, expenses, masterPrompt: MASTER_PROMPT });   // v6.22: the loader's result\n",
        "    await saveToStorage({ portfolio, expenses, masterPrompt });\n")], ["B-2", "A-9a", "A-9b"]),
 "C5": ("DEFAULT_PORTFOLIO drifts (Georgia)", [('  stateName: "Florida", stateTaxRate: 0,\n', '  stateName: "Georgia", stateTaxRate: 0,\n')], ["B-3", "C-1"]),
 "C6": ("_parseTargetRetireYear defaults to 2029", [("function _parseTargetRetireYear(text) {\n  if (!text) return null;", "function _parseTargetRetireYear(text) {\n  if (!text) return 2029;")],
        ["B-3b", "A-1"]),
 "C7": ("My Data pre-fills a placeholder", [('useState(src.dobA || (_tl0 && !_ph0.dobA ? _ymdStr(_tl0.dobA) : ""));', 'useState(src.dobA || (_tl0 ? _ymdStr(_tl0.dobA) : ""));')], ["D-1", "D-2"]),
 "C8": ("the placeholder notice never shown", [("          if (!_miss.length) return null;\n", "          if (true) return null;\n")], ["D-1", "D-2b"]),
 "C9": ("the example-facts notice never shown", [("          if (!_g.length) return null;\n", "          if (true) return null;\n")], ["D-5"]),
 "C10": ("the example-facts notice on the example", [("          if (holdsExampleHoldings(src)) return null;\n", "")], ["C-4"]),
 "C11": ("the Taxes footnote's old wording", [(": NO_STATE_CHOSEN_MSG}</span>}",
        ": \"your state has no state income tax, so the State column is $0 by design — change the master prompt's state line to model a taxed state.\"}</span>}")], ["D-3b"]),
 "C12": ("the Roth tab's old wording", [("if (_rt === 0) return _nm ? `${_nm} — no state income tax` : NO_STATE_CHOSEN_MSG;",
        "if (_rt === 0) return _nm ? `${_nm} — no state income tax` : \"No state income tax (the plan's flat state rate is 0%)\";")], ["D-3c"]),
 "C13": ("My Data's no-state line never shown", [("{!stateCode && !stateName && !(Number(stateTax) > 0) && <div data-dc-no-state", "{false && <div data-dc-no-state")], ["D-3a"]),
 "C14": ("My Data's no-state line ignores the rate", [("{!stateCode && !stateName && !(Number(stateTax) > 0) && <div data-dc-no-state", "{!stateCode && !stateName && <div data-dc-no-state")], ["D-3f"]),
 "C15": ("getSSA back on the example", [("function getSSA() { return PORTFOLIO.incomeSources?.ssA?.planned ?? 0; }",
        "function getSSA() { return PORTFOLIO.incomeSources?.ssA?.planned ?? DEFAULT_PORTFOLIO.incomeSources.ssA.planned; }")], ["B-4", "E-1"]),
 "C16": ("the loader inserts $3,300 again", [("    PORTFOLIO.incomeSources.ssA = { tableByAge: {}, planned: 0, plannedAge: 67, isDefault: true };",
        "    PORTFOLIO.incomeSources.ssA = { tableByAge: {}, planned: 3300, plannedAge: 67, isDefault: true };")], ["B-4"]),
 "C17": ("flagged blocks not zeroed", [('  for (const _k of ["ssA", "ssB"]) { const _b = PORTFOLIO.incomeSources[_k]; if (_b && _b.isDefault) { _b.planned = 0; _b.tableByAge = {}; } }\n', "")],
        ["E-3b"]),
 "C18": ("the banner keyed on a held prompt", [("  {\n    if (PORTFOLIO.incomeSources.ssA?.isDefault)", "  if (MASTER_PROMPT) {\n    if (PORTFOLIO.incomeSources.ssA?.isDefault)")],
        ["E-2", "E-3", "E-2r"]),
 "C19": ("a backup with no expense table accepted", [("  if (!Array.isArray(data.expenses)) return { msg: IMPORT_NO_EXPENSES_MSG };\n", "")], ["F-1"]),
 "C21": ("DC-8: the demo text kept beside a plan's own holdings", [("MASTER_PROMPT = (_mpIn === DEFAULT_MASTER_PROMPT && !holdsExampleHoldings(PORTFOLIO)) ? \"\" : _mpIn;",
        "MASTER_PROMPT = _mpIn;")], ["A-11", "A-12"]),
 "C22": ("getSSB back on the example", [("  return PORTFOLIO.incomeSources?.ssB?.planned ?? 0;", "  return PORTFOLIO.incomeSources?.ssB?.planned ?? DEFAULT_PORTFOLIO.incomeSources.ssB.planned;")], ["B-4", "E-1"]),
 "C23": ("getPension back on the example", [("function getPension() { return PORTFOLIO.incomeSources?.pension?.amount ?? 0; }",
        "function getPension() { return PORTFOLIO.incomeSources?.pension?.amount ?? DEFAULT_PORTFOLIO.incomeSources.pension.amount; }")], ["B-4", "E-1"]),
 "C20": ("the landing guided setup's save omits the prompt", [('            await saveToStorage({ portfolio: p.portfolio, expenses: p.expenses, masterPrompt: MASTER_PROMPT });   // v6.22: "" — a new plan has none\n',
        "            await saveToStorage({ portfolio: p.portfolio, expenses: p.expenses });\n")], ["B-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T85, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v622"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v622.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v622.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t85_prompt_carryover.mjs", "v622"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t85 SUITE \(v622\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != ORIG:
            open(SRC, "wb").write(ORIG); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
