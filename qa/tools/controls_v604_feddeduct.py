#!/usr/bin/env python3
"""controls_v604_feddeduct.py — negative controls for t68 (docs/SCOPE_D31_D29_V604.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v604.jsx; the mutant is compiled (qa/mk_testable.sh + the DOM bundle, as mk_runfolder.sh builds them), t68 runs on the v604 leg,
then ./v604.jsx, qa/app_v604.mjs and qa/dom_v604.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v603 -> v604 run folder:  python3 qa/tools/controls_v604_feddeduct.py [K1 ...]
    K1  Missouri's 25 % band moves to 20 % ........................................................ A-1, B-1, D-2
    K2  Oregon's first band boundary moves ($125,000 -> $126,000) ................................. A-1, B-3, C-OR-2, D-2
    K3  Alabama stops counting NIIT ............................................................... A-1, B-6, C-AL-2, D-2
    K4  the senior deduction's window widens to 2029 .............................................. B-4, C-MT-2, D-2
    K5  Missouri's gains subtraction ignores `gains` (subtracts all of capGains, dividends too) ... B-7, D-1, D-4 (D-2 is blind to the base by construction)
    K6  Engine B stops passing the federal tax .................................................... E-1, E-3
    K7  a row outside the nine moves (Virginia single $8,750 -> $8,700) .......................... D-2
    K0  unmutated ................................................................................. t68 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v604.jsx")
MOD, DOM = os.path.join(QA, "app_v604.mjs"), os.path.join(QA, "dom_v604.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v603.mjs"), os.path.join(QA, "t68_fed_deductions.mjs"), os.path.join(QA, "d30_ref.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v604.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v603 -> v604 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Missouri's 25 % band", "[[25000, 0.35], [50000, 0.25], [100000, 0.15], [125000, 0.05], [null, 0]], joint: [[25000, 0.35], [50000, 0.25],",
        "[[25000, 0.35], [50000, 0.2], [100000, 0.15], [125000, 0.05], [null, 0]], joint: [[25000, 0.35], [50000, 0.2],", ["A-1", "B-1", "D-2"]),
 "K2": ("Oregon's first boundary", 'single: [[125000, 8500, "lt"], [130000, 6800, "lt"]', 'single: [[126000, 8500, "lt"], [130000, 6800, "lt"]', ["A-1", "B-3", "C-OR-2", "D-2"]),
 "K3": ("Alabama without NIIT", 'of: "fedtax", niit: true, amt: 1 }', 'of: "fedtax", niit: false, amt: 1 }', ["A-1", "B-6", "C-AL-2", "D-2"]),
 "K4": ("the senior window to 2029", "if (c.years && !(yr !== null && yr !== undefined && yr >= c.years[0] && yr <= c.years[1])) continue;",
        "if (c.years && !(yr !== null && yr !== undefined && yr >= c.years[0] && yr <= c.years[1] + 1)) continue;", ["B-4", "C-MT-2", "D-2"]),
 "K5": ("Missouri subtracts dividends too", "const _gx = r.gainsExempt ? Math.min(Math.max(0, capGains), Math.max(0, gains || 0)) : 0;",
        "const _gx = r.gainsExempt ? Math.max(0, capGains) : 0;", ["B-7", "D-1", "D-4"]),   # D-2 reads the base from the calculator's own record, so it cannot see a base error by construction; D-1 and D-4 can
 "K6": ("Engine B without federal tax", "taxYear: yr, fedIncomeTax: fedTax + capGainsTax + amt_y, fedNiit: niit_y, gains: capGains_y,",
        "taxYear: yr, fedIncomeTax: 0, fedNiit: niit_y, gains: capGains_y,", ["E-1", "E-3"]),
 "K7": ("Virginia moves", 'amt: { single: 8750, joint: 17500 }', 'amt: { single: 8700, joint: 17500 }', ["D-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v604"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v604.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v604.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t68_fed_deductions.mjs", "v604"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t68 SUITE \(v604\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
