#!/usr/bin/env python3
"""controls_v613_c11.py — negative controls for t76 (docs/SCOPE_C11_CROSSOVER_LABEL_V613.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs the stated number of times
in its file; the app mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle),
t76 runs on the v613 leg, then every touched file — ./v613.jsx, qa/app_v613.mjs, qa/dom_v613.cjs, ./METHODOLOGY.md and
qa/tools/boundaries.mjs — is RESTORED and hash-checked.
Run from the ROOT of a COPY of a v612 -> v613 run folder:  python3 qa/tools/controls_v613_c11.py [K1 ...]
    K1  the card's old sentence ("after-tax wealth") restored ........................................... A-1, A-2, E-2b
    K2  the Field Manual's old Roth sentence restored ..................................................... A-1, A-3b
    K3  "Roth break-even" dropped from the Field Manual's history paragraph (t31's control) ................ A-4
    K4  METHODOLOGY's old crossover sentence restored ....................................................... B-1
    K5  Engine B (Taxes tab) stops re-taking the annuity share — v6.06's fixed share ......................... C-1, C-3
    K6  the same in Engine C (IRMAA tab) ..................................................................... C-2, C-4
    K7  the same in Engine A (strategy comparison) ........................................................... C-5
    K8  a non-text change: rothCrossover's recovery test `>= 0` made `> 0` ................................... D-1
    K9  the census row's copy of the card's inputs drops the ACA premium (the drift the scope made once) ....... E-3b
    K10 the Field Manual's blind-filer item removed (DC-5) ................................................... A-3c
    K0  unmutated ............................................................................................ t76 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v613.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); TOOL = os.path.join(QA, "tools", "boundaries.mjs")
MOD = os.path.join(QA, "app_v613.mjs"); DOM = os.path.join(QA, "dom_v613.cjs"); T76 = os.path.join(QA, "t76_crossover_label.mjs")
for p in (SRC, METH, TOOL, MOD, DOM, T76, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v613.jsx"), os.path.join(ROOT, "v612.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v612 -> v613 run folder copy (missing {p})")
SHARE_BC = "_annShareA = _pA > 0 ? Math.min(1, _nA / _pA) : 0; _annShareB = _pB > 0 ? Math.min(1, _nB / _pB) : 0;"   # Engine C first, Engine B second
# (old, new, occurrences the target must have, which occurrence to replace)
M = {
 "K0": ("unmutated", [], "app", []),
 "K1": ("card's old sentence", [("First year your strategy's account total — every balance at face value, so Traditional dollars count before the tax still owed on them — catches",
                                 "First year your strategy's after-tax wealth catches", 1, 0)], "app", ["A-1", "A-2", "E-2b"]),
 "K2": ("Field Manual's old Roth sentence", [("the card reports the first year your account total catches up — every balance at face value, so Traditional dollars count before the tax still owed on them, which makes the answer arrive no earlier than an after-tax count would. Discounting and",
                                              "the card reports the first year your after-tax wealth catches up — so discounting and", 1, 0)], "app", ["A-1", "A-3b"]),
 "K3": ("history paragraph loses \"Roth break-even\"", [("The Roth break-even was rebuilt", "The break-even was rebuilt", 1, 0)], "app", ["A-4"]),
 "K4": ("METHODOLOGY's old sentence", [("the first year the strategy's account total — every balance at face value, Traditional dollars\nbefore the tax still owed on them — catches the baseline.",
                                        "the first year the strategy's after-tax wealth catches the baseline.", 1, 0)], "meth", ["B-1"]),
 "K5": ("Engine B keeps the opening annuity share", [(SHARE_BC, "void _nA; void _nB;", 2, 1)], "app", ["C-1", "C-3"]),
 "K6": ("Engine C keeps the opening annuity share", [(SHARE_BC, "void _nA; void _nB;", 2, 0)], "app", ["C-2", "C-4"]),
 "K7": ("Engine A keeps the opening annuity share", [("_annShA = _pA > 0 ? Math.min(1, _nA / _pA) : 0; _annShB = _pB > 0 ? Math.min(1, _nB / _pB) : 0;",
                                                      "void _nA; void _nB;", 1, 0)], "app", ["C-5"]),
 "K8": ("rothCrossover recovers on > 0", [("if (beWasBehind && firstRecover === null && d >= 0) firstRecover = y;",
                                          "if (beWasBehind && firstRecover === null && d > 0) firstRecover = y;", 1, 0)], "app", ["D-1"]),
 "K9": ("census row drops the ACA premium", [("acaPremium: _aca.premium || 0, acaSize: _aca.size || 0,", "acaPremium: 0, acaSize: 0,", 1, 0)], "tool", ["E-3b"]),
 "K10": ("blind-filer item removed", [("\\n      <li><strong>The additional standard deduction for a blind filer is not modelled.</strong>",
                                       "\\n      <li><strong>Blind filers.</strong>", 1, 0)], "app", ["A-3c"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = {"app": SRC, "meth": METH, "tool": TOOL}
ORIG = {k: open(p, "rb").read() for k, p in FILES.items()}
WATCH = (SRC, METH, TOOL, MOD, DOM, T76); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v613"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v613.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v613.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def nth_replace(s, old, new, n):
    i = -1
    for _ in range(n + 1): i = s.index(old, i + 1)
    return s[:i] + new + s[i + len(old):]
def run(label):
    desc, pairs, where, want = M[label]
    try:
        if pairs:
            s = ORIG[where].decode("utf-8")
            for old, new, count, nth in pairs:
                if s.count(old) != count: return f"{label} TARGET occurs {s.count(old)}x (must be {count}) — control INVALID"
                s = nth_replace(s, old, new, nth)
            open(FILES[where], "w", encoding="utf-8").write(s)
            if where == "app": build()
        r = subprocess.run(["node", "t76_crossover_label.mjs", "v613"], cwd=QA, capture_output=True, timeout=2400)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t76 SUITE \(v613\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for k, p in FILES.items():
            if open(p, "rb").read() != ORIG[k]:
                open(p, "wb").write(ORIG[k])
                if k == "app": build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
