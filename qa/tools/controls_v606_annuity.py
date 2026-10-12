#!/usr/bin/env python3
"""controls_v606_annuity.py — negative controls for t69 (docs/SCOPE_D28_ANNUITY_RELIEF_V606.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v606.jsx; the mutant is compiled (qa/mk_testable.sh, as mk_runfolder.sh builds it — t69 reads the app module), t69 runs on the v606
leg, then ./v606.jsx and qa/app_v606.mjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v605 -> v606 run folder:  python3 qa/tools/controls_v606_annuity.py [K1 ...]
    K1  Pennsylvania's relief reaches the annuity again ............................................ A-1, A-2, B-3, C-3
    K2  New York loses its `reliefKinds` ........................................................... B-3, C-2
    K3  the exclusion is netted against all retirement income again (the netting broken) ........... B-3, B-4
    K4  Maryland's relief reaches IRA money again .................................................. C-4
    K5  the Field Manual drops Wisconsin ........................................................... C-8
    K6  the exemption is not netted against eligible income (IL and MI, whose exemption has no per-person path) ... B-3, B-4
        (the per-person path's own category list is not controlled separately: `_eligible` caps it too, so reverting it alone changes no
        figure — two defences, and K3/K6 break the one that binds)
    K0  unmutated .................................................................................. t69 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v606.jsx"); MOD = os.path.join(QA, "app_v606.mjs")
for p in (SRC, MOD, os.path.join(QA, "app_v605.mjs"), os.path.join(QA, "t69_annuity_relief.mjs"), os.path.join(QA, "mk_testable.sh")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v605 -> v606 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("PA re-admits the annuity", 'PA: { name: "Pennsylvania", reliefKinds: ["ira", "employer", "pension"]', 'PA: { name: "Pennsylvania", reliefKinds: ["ira", "employer", "annuity", "pension"]', ["A-1", "A-2", "B-3", "C-3"]),
 "K2": ("NY loses the field", 'NY: { name: "New York", reliefKinds: ["ira", "employer", "pension"], ', 'NY: { name: "New York", ', ["B-3", "C-2"]),
 "K3": ("the netting broken", "Math.max(0, retIncome + pen - Math.min(exclFinal, _eligible))", "Math.max(0, retIncome + pen - exclFinal)", ["B-3", "B-4"]),
 "K4": ("MD re-admits IRA money", 'MD: { name: "Maryland", reliefKinds: ["employer", "pension"]', 'MD: { name: "Maryland", reliefKinds: ["ira", "employer", "pension"]', ["C-4"]),
 "K5": ("the Field Manual drops Wisconsin", "Pennsylvania and Wisconsin (in Colorado and Michigan", "Pennsylvania (in Colorado and Michigan", ["C-8"]),
 "K6": ("the exemption is not netted (the household-gate states IL and MI)", "Math.max(0, retIncome + pen - Math.min(_rxAmt, _eligible))", "Math.max(0, retIncome + pen - _rxAmt)", ["B-3", "B-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-C]-\d+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v606"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t69_annuity_relief.mjs", "v606"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t69 SUITE \(v606\): (\d+) passed, (\d+) failed", out)
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
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
