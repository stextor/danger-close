#!/usr/bin/env python3
"""controls_v585_ss_states.py — negative controls for t50 (docs/SCOPE_SS_STATES.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
run folder's ./v585.jsx; the mutant is compiled with qa/mk_testable.sh (the project's own recipe), t50 runs, and ./v585.jsx and
./qa/app_v585.mjs are RESTORED (source by bytes, module by rebuilding) and hash-checked after every run.
    M1  Vermont back to the flat `ss: 0.5` ............................................ VT-1 VT-3 VT-4 X-1 X-2
    M2  Minnesota's steps become one whole-threshold cliff ............................ MN-2 MN-3 MN-4
    M3  Connecticut's 25 %-of-total cap removed ....................................... CT-2
    M4  Rhode Island's full-retirement-age test removed (per spouse) .................. RI-3
    M5  Utah's phase-out at 25 ¢ per dollar instead of 2.5 ¢ .......................... UT-2
    M6  Utah back to 4.50 % ........................................................... R-1
    M7  Colorado's SS subtraction no longer consumes the pension cap .................. CO-5
    M8  total benefits from spouse A's slot only (the widowed-survivor bug t50 caught) . CT-4
    M0  unmutated ..................................................................... t50 passes
USAGE  from the ROOT of a v585 run folder:  python3 qa/tools/controls_v585_ss_states.py [M1 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v585.jsx"); MOD = os.path.join(QA, "app_v585.mjs")
if not all(os.path.exists(p) for p in (SRC, MOD, os.path.join(QA, "t50_ss_states.mjs"), os.path.join(QA, "mk_testable.sh"))):
    sys.exit("run from the ROOT of a v585 run folder (needs ./v585.jsx, ./qa/app_v585.mjs, ./qa/t50_ss_states.mjs, ./qa/mk_testable.sh)")
M = {
    "M0": ("unmutated", None, None, []),
    "M1": ("Vermont back to ss 0.5", 'ss: 1, ssRule: { kind: "linear", cmp: "le", threshold: { single: 55000, joint: 70000 }, width: 10000 },', "ss: 0.5,",
           ["VT-1", "VT-3", "VT-4", "X-1", "X-2"]),
    "M2": ("MN steps become a cliff", 'kind: "step", cmp: "le", threshold: { single: 86410, joint: 110780 }, step: 4000, pct: 0.10',
           'kind: "step", cmp: "le", threshold: { single: 86410, joint: 110780 }, step: 1, pct: 1', ["MN-2", "MN-3", "MN-4"]),
    "M3": ("CT 25 % cap removed", 'threshold: { single: 75000, joint: 100000 }, capOfTotal: 0.25 }', 'threshold: { single: 75000, joint: 100000 } }', ["CT-2"]),
    "M4": ("RI age test removed", 'threshold: { single: 107000, joint: 133750 }, ageMin: 67 }', 'threshold: { single: 107000, joint: 133750 } }', ["RI-3"]),
    "M5": ("UT phase-out 25 cents", 'threshold: { single: 54000, joint: 90000 }, perDollar: 0.025 }', 'threshold: { single: 54000, joint: 90000 }, perDollar: 0.25 }', ["UT-2"]),
    "M6": ("UT back to 4.50 %", 'UT: { name: "Utah", rate: 0.0445,', 'UT: { name: "Utah", rate: 0.045,', ["R-1"]),
    "M7": ("CO cap not consumed", "    if (r.ssSharesCap) return Math.max(0, _cap - Math.max(0, ssSub || 0));", "    if (r.ssSharesCap) return _cap;", ["CO-5"]),
    "M8": ("total benefits from A's slot only", "  const _gTot = Math.max(0, ssGrossA) + Math.max(0, ssGrossB);", "  const _gTot = Math.max(0, ssGrossA) + (single ? 0 : Math.max(0, ssGrossB));", ["CT-4"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
build = lambda: subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v585"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t50_ss_states.mjs", "v585"], cwd=QA, capture_output=True, text=True, timeout=300)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t50 SUITE \(v585\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "M0": return f"M0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}"
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v585_ss_states: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
