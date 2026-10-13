#!/usr/bin/env python3
"""controls_v609_engine_d_roth.py — negative controls for t72 (docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v609.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle
— t72 §E reads the Withdrawal tab), t72 runs on the v609 leg, then ./v609.jsx, qa/app_v609.mjs and qa/dom_v609.cjs are RESTORED and
hash-checked.
Run from the ROOT of a COPY of a v608 -> v609 run folder:  python3 qa/tools/controls_v609_engine_d_roth.py [K1 ...]
    K1  Roth money is gains-bearing again (the pool's gains part keeps it) ................................ B-1, B-2
    K2  the buckets' Roth share counts the Other-account Roth again ....................................... A-1@0K, A-3
    K3  retireStartBalances stops returning the Roth total (both halves revert at once) .................. A-1@0K, B-1
    K4  the Roth card counts the Other-account Roth again ................................................. E-2
    K5  the Priority-1 card's sentence is gone ............................................................ E-1
    K0  unmutated ......................................................................................... t72 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v609.jsx")
MOD = os.path.join(QA, "app_v609.mjs"); DOM = os.path.join(QA, "dom_v609.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v608.mjs"), os.path.join(QA, "t72_engine_d_other_roth.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v609.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v608 -> v609 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Roth money gains-bearing again", "const _gainPoolInit = Math.max(0, _taxInit - _taxOrdInit - _hsaInit - _rothOth);",
        "const _gainPoolInit = Math.max(0, _taxInit - _taxOrdInit - _hsaInit);", ["B-1", "B-2"]),
 "K2": ("buckets' Roth share counts the Other-account Roth", "let rothFrac = _t401kInit > 0 ? (_rothInit - _rothOth) / _t401kInit : 0;",
        "let rothFrac = _t401kInit > 0 ? _rothInit / _t401kInit : 0;", ["A-1@0K", "A-3"]),
 "K3": ("retireStartBalances returns no Roth total", "           othRoth: othRothA + othRothB,\n", "", ["A-1@0K", "B-1"]),
 "K4": ("Roth card counts it again", "${((_rothInit - _rothOth) / 1000).toFixed(0)}K", "${(_rothInit / 1000).toFixed(0)}K", ["E-2"]),
 "K5": ("Priority-1 sentence gone", " A Roth IRA you entered under Other accounts sits here too: it is spent tax-free and carries no RMD, and it is counted here only, not again in the Roth line below.", "", ["E-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-[A-Za-z_0-9]+(?:@\d+K)?[ab]?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v609"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v609.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v609.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t72_engine_d_other_roth.mjs", "v609"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t72 SUITE \(v609\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
