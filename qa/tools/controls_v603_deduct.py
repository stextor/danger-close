#!/usr/bin/env python3
"""controls_v603_deduct.py — negative controls for t67 (docs/SCOPE_D30_DEDUCTIONS_V603.md §3.1). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v603.jsx; the mutant is compiled (qa/mk_testable.sh + the DOM bundle, as mk_runfolder.sh builds them), t67 runs on the v603 leg,
then ./v603.jsx, qa/app_v603.mjs and qa/dom_v603.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v602 -> v603 run folder:  python3 qa/tools/controls_v603_deduct.py [K1 ...]
    K1  a deduction amount moves (Georgia joint $30,000 -> $29,000) .................................. A-2, C-GA-1, C-GA-FP, D-2
    K2  Colorado's comparator "lt" dropped (the addback from just over $300,000, as the form reads) ... A-2, B-1, B-2, C-CO-2, D-2
    K3  Illinois's cliff measured on the state base instead of federal AGI ............................ A-2, D-2
    K4  Ohio's $332 step removed .................................................................... B-9, C-OH-5, D-2
    K5  Ohio's band boundary moved ($80,000 -> $80,001) .............................................. A-2, B-5, D-2
    K6  the `tiers` `pick` removed (Utah's start read as an object) .................................. B-13, B-14, B-16, C-UT-1, D-2
    K7  Idaho's zero band removed ................................................................... A-4, B-10, C-ID-1, D-2, E-3
    K8  Kentucky's deduction per filer instead of per return ......................................... A-2, B-17, C-KY-1, D-2
    K9  a batch-1 state moves (Virginia single $8,750 -> $8,700) ..................................... D-1, D-2
    K10 My Data's old "effective rate (an approximation)" restored ................................... E-1, E-2, E-4
    K0  unmutated .................................................................................... t67 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v603.jsx")
MOD, DOM = os.path.join(QA, "app_v603.mjs"), os.path.join(QA, "dom_v603.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v602.mjs"), os.path.join(QA, "t67_deductions_flat.mjs"), os.path.join(QA, "d30_ref.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v603.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v602 -> v603 run folder copy (missing {p})")
OH2150 = 'rows: { single: [[40000, 0], [80000, 1], [null, 0]], joint: [[40000, 0], [80000, 1], [null, 0]] }'
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Georgia's joint deduction moves", 'deduct: [{ what: "standard deduction", kind: "ded", per: "return", amt: { single: 15000, joint: 30000 } }]',
        'deduct: [{ what: "standard deduction", kind: "ded", per: "return", amt: { single: 15000, joint: 29000 } }]', ["A-2", "C-GA-1", "C-GA-FP", "D-2"]),
 "K2": ("Colorado's comparator", 'thr: { single: 300000, joint: 300000 }, cmp: "lt"', 'thr: { single: 300000, joint: 300000 }', ["A-2", "B-1", "B-2", "C-CO-2", "D-2"]),
 "K3": ("Illinois's cliff on the state base", 'add: { age: 65, amt: 1000 }, phase: { on: "agi", shape: "cliff", thr: { single: 250000, joint: 500000 } }',
        'add: { age: 65, amt: 1000 }, phase: { on: "base", shape: "cliff", thr: { single: 250000, joint: 500000 } }', ["A-2", "D-2"]),
 "K4": ("Ohio's step removed", "  if (_sch && r.notch && _stTI > r.notch.over) _stTax += r.notch.add;\n", "", ["B-9", "C-OH-5", "D-2"]),
 "K5": ("Ohio's band boundary moved", OH2150, OH2150.replace("[80000, 1]", "[80001, 1]"), ["A-2", "B-5", "D-2"]),
 "K6": ("the tiers pick removed", "Math.min(m, to === null ? Infinity : pick(to)) - pick(from)", "Math.min(m, to === null ? Infinity : to) - from", ["B-13", "B-14", "B-16", "C-UT-1", "D-2"]),
 "K7": ("Idaho's zero band removed", "brackets: { single: [[4811, 0], [null, 0.053]], joint: [[9622, 0], [null, 0.053]] }, ", "", ["A-4", "B-10", "C-ID-1", "D-2", "E-3"]),
 "K8": ("Kentucky per filer", 'what: "standard deduction", kind: "ded", per: "return", amt: 3360', 'what: "standard deduction", kind: "ded", per: "person", amt: 3360', ["A-2", "B-17", "C-KY-1", "D-2"]),
 "K9": ("Virginia moves", 'amt: { single: 8750, joint: 17500 }', 'amt: { single: 8700, joint: 17500 }', ["D-1", "D-2"]),
 "K10": ("My Data's old phrase", "% flat rate`)}", "% effective rate (an approximation)`)}", ["E-1", "E-2", "E-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)", l) or [None, None])[1]   # ids like C-GA-FP, B-13
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v603"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v603.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v603.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t67_deductions_flat.mjs", "v603"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t67 SUITE \(v603\): (\d+) passed, (\d+) failed", out)
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
