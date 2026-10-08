#!/usr/bin/env python3
"""controls_v597_rates.py — negative controls for t61 and t2's declared diff (docs/SCOPE_D22_GA_OK_RATES.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each source target occurs exactly once in
the run folder's ./v597.jsx; the mutant is compiled (qa/mk_testable.sh), t61 runs on the v597 leg, then ./v597.jsx and ./qa/app_v597.mjs
are RESTORED and hash-checked. K7 mutates a COPY of t2 instead and needs both legs' fingerprints in /tmp (a full run writes them).
Run from the ROOT of a COPY of a v596 -> v597 run folder:  python3 qa/tools/controls_v597_rates.py [K1 ...]
    K1  Georgia's rate back to 5.19 % ................................................. A-1, B-1, C-1
    K2  Oklahoma's rate back to 4.75 % ................................................ A-2, B-4, C-1
    K3  Georgia's note loses its rate clause .......................................... A-3, A-6
    K4  Oklahoma's note states a wrong rate (4.25 %) ................................... A-4, A-5
    K5  another state's rate moves (Alabama 4.5 % -> 4.6 %) ............................ C-1, C-2
    K6  Oklahoma's note misstates the top-rate overstatement ........................... A-4
    K7  t2 no longer declares stateTax as an intended v596 -> v597 change .............. t2 PARITY stateTax
    K0  unmutated ...................................................................... t61 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v597.jsx"); MOD = os.path.join(QA, "app_v597.mjs")
for p in (SRC, MOD, os.path.join(QA, "app_v596.mjs"), os.path.join(QA, "t61_ga_ok_rates.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "t2_engines.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v596 -> v597 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Georgia back to 5.19 %", 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0499,', 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0519,', ["A-1", "B-1", "C-1"]),
 "K2": ("Oklahoma back to 4.75 %", 'name: "Oklahoma", years: { excl65: 2026 }, rate: 0.045,', 'name: "Oklahoma", years: { excl65: 2026 }, rate: 0.0475,', ["A-2", "B-4", "C-1"]),
 "K3": ("Georgia's rate clause dropped", " Rate 4.99% flat for 2026 (HB 463, 2026 — O.C.G.A. §48-7-20);", "", ["A-3", "A-6"]),
 "K4": ("Oklahoma's note states 4.25 %", "Rate 4.5% from 2026, the top of three brackets", "Rate 4.25% from 2026, the top of three brackets", ["A-4", "A-5"]),
 "K5": ("Alabama's rate moves", 'name: "Alabama", years: { excl65: 2026 }, rate: 0.045,', 'name: "Alabama", years: { excl65: 2026 }, rate: 0.046,', ["C-1", "C-2"]),
 "K6": ("overstatement misstated", "by up to $214.75 single / $429.50 joint a year", "by up to $210.00 single / $429.50 joint a year", ["A-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-[A-Za-z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v597"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    if label == "K7": return k7()
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t61_ga_ok_rates.mjs", "v597"], cwd=QA, capture_output=True, timeout=900)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t61 SUITE \(v597\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
def k7():
    for v in ("v596", "v597"):
        if not os.path.exists(f"/tmp/t2_{v}_fingerprint.json"): return f"K7 INVALID — /tmp/t2_{v}_fingerprint.json missing (run the suite first)"
    t2 = open(os.path.join(QA, "t2_engines.mjs"), encoding="utf-8").read(); line = '    "v596→v597": ["stateTax"],\n'
    if t2.count(line) != 1: return "K7 TARGET occurs %dx — control INVALID" % t2.count(line)
    mut = os.path.join(QA, "t2_engines__k7.mjs"); open(mut, "w", encoding="utf-8").write(t2.replace(line, ""))
    try:
        base = subprocess.run(["node", "t2_engines.mjs", "compare", "v596", "v597"], cwd=QA, capture_output=True, timeout=300).stdout.decode()
        r = subprocess.run(["node", "t2_engines__k7.mjs", "compare", "v596", "v597"], cwd=QA, capture_output=True, timeout=300).stdout.decode()
    finally: os.remove(mut)
    okBase = re.search(r"t2 SUITE \(compare\): (\d+) passed, 0 failed", base) is not None   # passing checks print nothing; the declared diff is one of them
    fired = re.search(r"✗ PARITY: stateTax identical", r) is not None
    return f"K7 {'FIRES' if okBase and fired else 'MISSED'} — t2 without the declaration; unmutated: {'green' if okBase else 'NOT GREEN'}"
labels = sys.argv[1:] or list(M) + ["K7"]
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
