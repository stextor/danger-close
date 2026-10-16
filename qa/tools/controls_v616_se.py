#!/usr/bin/env python3
"""controls_v616_se.py — negative controls for t79 (docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t79 §E
renders the DOM bundle), t79 runs on the v616 leg (which needs app_v615.mjs beside it for §C), then ./v616.jsx, qa/app_v616.mjs and
qa/dom_v616.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v615 -> v616 run folder:  python3 qa/tools/controls_v616_se.py [S1 ...]
    S1  the 92.35% factor dropped (self-employment tax on the whole profit) ............................... A-1, D-1
    S2  the $400 floor dropped ............................................................................... A-1, B-3, D-5
    S3  the Social Security base not reduced by the person's wages ......................................... A-1, D-2
    S4  the 0.9% ignoring net earnings (wages only) .......................................................... A-1, A-4, D-3, D-4
    S5  a joint self-employed row given wholly to A ......................................................... A-1
    S6  the field lost on Save & Apply (buildPortfolio drops it) ............................................ E-4
    S7  a stray 0.124 (the 12.4% typed instead of derived) .................................................. B-2
    S8  the old "not modelled" disclosure restored in the Taxes tab's method note .......................... F-1, F-6
    S0  unmutated ............................................................................................ t79 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v616.jsx"); T79 = os.path.join(QA, "t79_self_employment.mjs")
MOD = os.path.join(QA, "app_v616.mjs"); DOM = os.path.join(QA, "dom_v616.cjs")
for p in (SRC, T79, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v616.jsx"), os.path.join(QA, "app_v615.mjs"), os.path.join(ROOT, "METHODOLOGY.md")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v615 -> v616 run folder copy (missing {p})")
M = {
 "S0": ("unmutated", [], []),
 "S1": ("the 92.35% factor dropped", [("const T = TAX_CONSTS, netFactor = 1 - T.FICA_SS_RATE - T.FICA_MED_RATE;", "const T = TAX_CONSTS, netFactor = 1;")], ["A-1", "D-1"]),
 "S2": ("the $400 floor dropped", [("net = n >= T.SE_MIN_NET ? n : 0;", "net = n;")], ["A-1", "B-3", "D-5"]),
 "S3": ("the base not reduced by the person's wages", [("Math.min(net, Math.max(0, wageBase - w)) * 2 * T.FICA_SS_RATE", "Math.min(net, wageBase) * 2 * T.FICA_SS_RATE")], ["A-1", "D-2"]),
 "S4": ("the 0.9% ignoring net earnings", [("T.ADDL_MED_RATE * Math.max(0, wSum + netSum - thr);", "T.ADDL_MED_RATE * Math.max(0, wSum - thr);")], ["A-1", "A-4", "D-3", "D-4"]),
 "S5": ("a joint row given wholly to A", [("se: [ea + ej / 2, eb + ej / 2] };", "se: [ea + ej, eb] };")], ["A-1"]),
 "S6": ("the field lost on save", [('...(s.kind === "work" && s.selfEmployed ? { selfEmployed: true } : {})', "...({})")], ["E-4"]),
 "S7": ("a stray 0.124", [("Math.min(net, Math.max(0, wageBase - w)) * 2 * T.FICA_SS_RATE", "Math.min(net, Math.max(0, wageBase - w)) * 0.124")], ["B-2"]),
 "S8": ("the old disclosure restored", [("A self-employed row pays self-employment tax: both halves on 92.35% of the profit (",
                                         "Taxed as wages — a self-employed person owes both halves, which is not modelled (")], ["F-1", "F-6"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T79, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v616"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v616.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v616.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t79_self_employment.mjs", "v616"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t79 SUITE \(v616\): (\d+) passed, (\d+) failed", out)
        if label == "S0": return f"S0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
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
fires = sum(1 for o in out if " FIRES " in o or o.startswith("S0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
