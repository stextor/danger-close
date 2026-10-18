#!/usr/bin/env python3
"""controls_v618_spend.py — negative controls for t81 (docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t81 §E
renders the DOM bundle), t81 runs on the v6.18 leg (§D needs qa/app_v617.mjs beside it), S1 also runs the DOM diff, then ./v618.jsx,
qa/app_v618.mjs and qa/dom_v618.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v617 -> v618 run folder:  python3 qa/tools/controls_v618_spend.py [S1 ...]
    S1  Engine D back on the June 2029 / June 2031 snapshots ............................ A-1, A-6, A-8, B-2, D-3, E-2 (+ domdiff)
    S2  one-time rows dropped from the shared read ......................................... A-1, A-6, A-9, E-2
    S3  the survivor factor applied to one-time rows as well ................................ A-12
    S4  one-time rows left uninflated in Engine D ........................................... A-1
    S5  a snapshot date typed back in (FULL at "2031-06") .................................... B-1, C-2, C-7
    S6  Backtest back on the snapshots ....................................................... B-5, E-5
    S7  What-Breaks back on the snapshots .................................................... B-5, E-8
    S8  Engine D inflating from the as-of year instead of retirement ........................ A-1, A-6, A-8
    S9  the snapshots recomputed from a stale PLAN_TIMELINE ................................. B-10, C-7
    S10 the survivor guard weakened to > (the death year itself spends as a couple) ......... A-1, A-9
    S0  unmutated ............................................................................ t81 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v618.jsx"); T81 = os.path.join(QA, "t81_engine_d_spending.mjs")
MOD = os.path.join(QA, "app_v618.mjs"); DOM = os.path.join(QA, "dom_v618.cjs")
for p in (SRC, T81, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v618.jsx"), os.path.join(QA, "app_v617.mjs"),
          os.path.join(QA, "dom_v617.cjs"), os.path.join(QA, "domdiff_withdrawal.mjs"), os.path.join(ROOT, "METHODOLOGY.md")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v617 -> v618 run folder copy (missing {p})")
D_ANN = "          const annualExpense = (yr) => tableYearExpense(yr, _deathYr1D) * _wInflator(yr);\n"
DD_MASK = "…and the masked schedule DIFFERS"
M = {
 "S0": ("unmutated", [], [], []),
 "S1": ("Engine D back on the snapshots", [(D_ANN,
        "          const annualExpense = (yr) => (yr < _tlW.medicareB.year ? POST_MONTHLY_EARLY : POST_MONTHLY_FULL) * 12 * _wInflator(yr) * (yr >= _deathYr1D ? SURVIVOR_SPEND_FACTOR : 1);\n")],
        ["A-1", "A-6", "A-8", "B-2", "D-3", "E-2"], [DD_MASK]),
 "S2": ("one-time rows dropped", [("    once += getOneTimeExpenses(d);\n", "    once += 0;\n")], ["A-1", "A-6", "A-9", "E-2"], []),
 "S3": ("the survivor factor on one-time rows too", [("  return monthly * (yr >= survivorFromYr ? SURVIVOR_SPEND_FACTOR : 1) + once;\n",
        "  return (monthly + once) * (yr >= survivorFromYr ? SURVIVOR_SPEND_FACTOR : 1);\n")], ["A-12"], []),
 "S4": ("one-time rows uninflated in Engine D", [(D_ANN,
        "          const annualExpense = (yr) => { let o = 0; for (let m = 1; m <= 12; m++) o += getOneTimeExpenses(`${yr}-${String(m).padStart(2, \"0\")}`); return (tableYearExpense(yr, _deathYr1D) - o) * _wInflator(yr) + o; };\n")],
        ["A-1"], []),
 "S5": ("FULL typed back to 2031-06", [("  POST_MONTHLY_FULL = getMonthlyExpense(_snapshotMonth(fullEv, tl.asOf));\n", "  POST_MONTHLY_FULL = getMonthlyExpense(\"2031-06\");\n")],
        ["B-1", "C-2", "C-7"], []),
 "S6": ("Backtest back on the snapshots", [("          const baseMonthly = (planYrIdx) => tableYearExpense(_retireYr + planYrIdx) / 12;\n",
        "          const baseMonthly = (planYrIdx) => (_retireYr + planYrIdx < _tlB.medicareB.year ? POST_MONTHLY_EARLY : POST_MONTHLY_FULL);\n")], ["B-5", "E-5"], []),
 "S7": ("What-Breaks back on the snapshots", [("          const baseMonthly = (k) => tableYearExpense(_retireYr + k, _deathYr1W) / 12;\n",
        "          const baseMonthly = (k) => (_retireYr + k < _tlW.medicareB.year ? POST_MONTHLY_EARLY : POST_MONTHLY_FULL) * (_retireYr + k >= _deathYr1W ? SURVIVOR_SPEND_FACTOR : 1);\n")],
        ["B-5", "E-8"], []),
 "S8": ("inflation from the as-of year", [("          const _wInflator = (yr) => Math.pow(1 + _wInfl, Math.max(0, yr - retireYear));\n",
        "          const _wInflator = (yr) => Math.pow(1 + _wInfl, Math.max(0, yr - _tlW.asOfYear));\n")], ["A-1", "A-6", "A-8"], []),
 "S9": ("the snapshots from a stale PLAN_TIMELINE", [("  const tl = buildPlanTimeline();\n  const k = (o) => o.year * 12 + ((o.month || 1) - 1);\n",
        "  const tl = PLAN_TIMELINE || buildPlanTimeline();\n  const k = (o) => o.year * 12 + ((o.month || 1) - 1);\n")], ["B-10", "C-7"], []),
 "S10": ("the survivor guard weakened to >", [("  return monthly * (yr >= survivorFromYr ? SURVIVOR_SPEND_FACTOR : 1) + once;\n",
        "  return monthly * (yr > survivorFromYr ? SURVIVOR_SPEND_FACTOR : 1) + once;\n")], ["A-1", "A-9"], []),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T81, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v618"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v618.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v618.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want, dd_want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t81_engine_d_spending.mjs", "v618"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t81 SUITE \(v618\): (\d+) passed, (\d+) failed", out)
        if label == "S0": return f"S0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        if dd_want:
            d = subprocess.run(["node", "domdiff_withdrawal.mjs", "v617", "v618"], cwd=QA, capture_output=True, timeout=3600).stdout.decode("utf-8", "replace")
            dfail = [l for l in d.splitlines() if l.lstrip().startswith("✗")]
            miss += [f"domdiff: {w}" for w in dd_want if not any(w in l for l in dfail)]
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
