#!/usr/bin/env python3
"""controls_v584_draw.py — negative controls for t49 (docs/SCOPE_ROTH_COMPARATOR_DRAW.md §4, §7). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once; the
run folder's ./v584.jsx (read by t49's AST checks) or ./qa/app_v584.mjs (the compiled module its behaviour checks call) is swapped
for a mutant and RESTORED, hash-checked, after every run.
  SOURCE (t49 §X reads it):
    M1  the stress solver's caller stops passing the draw ........................................ X-2
    M2  Engine A's base drops the draw ............................................................ X-1
    M3  the solver's useMemo forgets scenarioPreset ............................................... X-3
  COMPILED MODULE (t49 §H/§D call it):
    M4  the base drops the draw (behaviour) ....................................................... H-S30000 H-S45000 H-M90000 D-1
    M5  a drain is re-planted — the draw leaves the traditional pools (what K-1 forbids) ........... D-2
    M0  unmutated .................................................................................. t49 passes
USAGE  from the ROOT of a v584 run folder:  python3 qa/tools/controls_v584_draw.py [M1 M4 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v584.jsx"); MOD = os.path.join(QA, "app_v584.mjs")
if not all(os.path.exists(p) for p in (SRC, MOD, os.path.join(QA, "t49_engineA_draw.mjs"))):
    sys.exit("run from the ROOT of a v584 run folder (needs ./v584.jsx, ./qa/app_v584.mjs, ./qa/t49_engineA_draw.mjs)")
STRESS = "ordDrawByYr: withdrawalPlanSeries({ retireYear: _retireYr, rothAmount, scenarioPreset }).ordDrawByYr, // v5.84 (D-7, H-2 a): the bridge B and C use\n"
BASE = "const base = pen + work + otherOrd + rmd + draw_y;"
BAL = "tradA = Math.max(0, tradA - rmdA - convA) * (1 + GROWTH);"
DRAIN = ("if (draw_y > 0) { const _pa = Math.max(0, tradA - rmdA - convA), _pb = Math.max(0, tradB - rmdB - convB), _pp = _pa + _pb; "
         "if (_pp > 0) { tradA -= Math.min(_pa, draw_y * _pa / _pp); tradB -= Math.min(_pb, draw_y * _pb / _pp); } } ")
M = {
    "M0": ("unmutated", None, None, None, []),
    "M1": ("stress caller without the draw", "src", STRESS, "", ["X-2"]),
    "M2": ("base without the draw (source)", "src", BASE, "const base = pen + work + otherOrd + rmd;", ["X-1"]),
    "M3": ("solver deps forget scenarioPreset", "src", "[retireYear, rothTaxFunding, rothGainPct, taxYield, rothAmount, scenarioPreset]",
           "[retireYear, rothTaxFunding, rothGainPct, taxYield, rothAmount]", ["X-3"]),
    "M4": ("base without the draw (module)", "mod", BASE, "const base = pen + work + otherOrd + rmd;", ["H-S30000", "H-S45000", "H-M90000", "D-1"]),
    "M5": ("a drain re-planted (module)", "mod", BAL, DRAIN + BAL, ["D-2"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
BEFORE = (md5(SRC), md5(MOD)); keep = {SRC: open(SRC, "rb").read(), MOD: open(MOD, "rb").read()}
def run(label):
    desc, where, old, new, want = M[label]
    try:
        if where:
            p = SRC if where == "src" else MOD; s = keep[p].decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(p, "w", encoding="utf-8").write(s.replace(old, new))
        r = subprocess.run(["node", "t49_engineA_draw.mjs", "v584"], cwd=QA, capture_output=True, text=True, timeout=600)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t49 SUITE \(v584\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "M0": return f"M0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w}") for l in failed)]
        extra = [l.split(":")[0].strip("  \u2717") for l in failed if not any(l.startswith(f"  \u2717 {w}") for w in want)]
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {extra})" if extra else "")
    finally:
        for p, b in keep.items(): open(p, "wb").write(b)
        assert (md5(SRC), md5(MOD)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v584_draw: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
