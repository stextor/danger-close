#!/usr/bin/env python3
"""controls_v599_flat_rates.py — negative controls for t63 (docs/SCOPE_D22_FLAT_RATES_V599.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v599.jsx; the mutant is compiled (qa/mk_testable.sh), t63 runs on the v599 leg, then ./v599.jsx and ./qa/app_v599.mjs are RESTORED
and hash-checked. Run from the ROOT of a COPY of a v598 -> v599 run folder:  python3 qa/tools/controls_v599_flat_rates.py [K1 ...]
    K1  Idaho back to 5.695 % ........................................................ A-1, B-1, C-1
    K2  Ohio back to 3.1 % ........................................................... A-1, B-3, C-1
    K3  Ohio's note misstates the overstatement ...................................... A-3
    K4  Mississippi's note loses its zero-band disclosure ............................ A-4
    K5  a state outside the batch moves (Arizona 2.5 % -> 2.6 %) ...................... A-1, C-1, C-2
    K6  Engine C moves (IRMAA surcharge + 1) ......................................... C-6
    K0  unmutated .................................................................... t63 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v599.jsx"); MOD = os.path.join(QA, "app_v599.mjs")
for p in (SRC, MOD, os.path.join(QA, "app_v598.mjs"), os.path.join(QA, "t63_flat_rates.mjs"), os.path.join(QA, "mk_testable.sh")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v598 -> v599 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Idaho back to 5.695 %", 'name: "Idaho", rate: 0.053,', 'name: "Idaho", rate: 0.05695,', ["A-1", "B-1", "C-1"]),
 "K2": ("Ohio back to 3.1 %", 'name: "Ohio", rate: 0.0275,', 'name: "Ohio", rate: 0.031,', ["A-1", "B-3", "C-1"]),
 "K3": ("Ohio overstatement misstated", "overstates tax by $384.38 a year", "overstates tax by $380.00 a year", ["A-3"]),
 "K4": ("Mississippi zero band undisclosed", "; the first $10,000 of taxable income is untaxed in law and taxed here, overstating tax by up to $400 a year (conservative)", "", ["A-4"]),
 "K5": ("Arizona moves", 'name: "Arizona", rate: 0.025,', 'name: "Arizona", rate: 0.026,', ["A-1", "C-1", "C-2"]),
 "K6": ("Engine C moves", "surchargePerPerson: IRMAA_CONSTS.SUR[i],", "surchargePerPerson: IRMAA_CONSTS.SUR[i] + 1,", ["C-6"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-C]-[A-Za-z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v599"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t63_flat_rates.mjs", "v599"], cwd=QA, capture_output=True, timeout=900)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t63 SUITE \(v599\): (\d+) passed, (\d+) failed", out)
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
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
