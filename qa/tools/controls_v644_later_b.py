#!/usr/bin/env python3
"""controls_v644_later_b.py — negative controls for t108 (docs/SCOPE_D71_D72_D73_V644.md §3.4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v644.jsx (each target occurs exactly once), rebuilds qa/app_v644.mjs and qa/dom_v644.cjs as mk_runfolder.sh builds
  them, runs t108 on the v644 leg, then RESTORES the three files and hash-checks them.
Run from the ROOT of a COPY of a v643 -> v644 run folder:  python3 qa/tools/controls_v644_later_b.py [K1 ...]
  the step removed from one projection at a time (D-71, DE-1 (a))
    K1  Engine D ..................................................................................... B-3
    K2  Engine B ..................................................................................... B-5, B-6
    K3  Engine C ..................................................................................... B-5, B-6
    K4  Engine A (its `P.laterB` step) ............................................................... B-4
    K5  the Roth ladder's year loop .................................................................. F-12
    K6  the RMD cards' closed forms (`_lbGrown`) ..................................................... F-9
    K7  What Breaks' `project` ....................................................................... F-10
    K8  Backtest's `runSequence` ..................................................................... F-10
  when and from which year (DE-2 (a), the engine's year)
    K9  Engine D adds the NEXT year's contribution at this year's end (a year early — the start of its year) .. B-2, B-3
    K10 the helper runs from the timeline's retirement year, not the engine's (the ±1 selector) ........ B-1, D-3
    K11 the helper keeps adding after B has died ..................................................... A-5, B-1, B-9
  the start balances
    K12 `bStopsAtA` dropped from `retireStartBalances` (B's accrual to her own year, as v6.43) ......... A-3, B-2, D-2
  Engine A reads P only
    K13 Engine A's step reads the module through the helper ........................................... A-1, A-2
  D-72 and D-73
    K14 the single-plan rule removed from `streamsMonthlyAt` .......................................... A-8, E-1, E-3
        (F-11 stays green here: the Income tab's text does not change when the stream drops out, so F-11 is the labels' check — K24)
    K15 the Monte Carlo gate removed from `runMonteCarlo` .............................................. A-9, E-6
    K16 the Monte Carlo gate removed from `runExtendedMC` .............................................. A-9, E-6
    K17 the AI context's owner label without the single flag ............................................ A-8
  the copy
    K18 §13's v6.44 note removed, the whole item ........................................................ F-1
    K19 the Withdrawal units note back to "left out" .................................................... F-6
  added after the build review
    K20 What Breaks re-indexes the contributions (× its inflation — the scope's first form) .............. A-7
    K21 Backtest re-indexes them (× the sequence's historical inflation) ................................. A-7
    K22 the notes run B's later contributions to B's retirement whatever B's death ........................ F-6b
    K23 the start note names nothing on a plan with nothing planned before retirement ..................... D-7
  added after the first control run
    K24 the Income tab's two owner labels without the single flag ......................................... A-8, F-11
    C0  unmutated ..................................................................................... t108 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v644.jsx"); MOD = os.path.join(QA, "app_v644.mjs"); DOM = os.path.join(QA, "dom_v644.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t108_later_b_contrib.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v644.jsx"),
          os.path.join(QA, "app_v643.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v643 -> v644 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>A spouse who retires later, and a single plan’s spouse-B data (v6.44).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("the step removed from Engine D",
        [("              if (_lA > 0) {\n                const _bk = b1 + b2 + b3 + b4, _tO = _bk * tradFrac", "              if (false) {\n                const _bk = b1 + b2 + b3 + b4, _tO = _bk * tradFrac")], ["B-3"]),
 "K2": ("the step removed from Engine B",
        [("      if (_lb > 0) { const _o = tradB, _qO = _o * (1 - _annShareB); tradB += _lb;", "      if (false) { const _o = tradB, _qO = _o * (1 - _annShareB); tradB += _lb;")], ["B-5", "B-6"]),
 "K3": ("the step removed from Engine C",
        [("      if (_lb > 0) { const _o = tradB; tradB += _lb; _annShareB", "      if (false) { const _o = tradB; tradB += _lb; _annShareB")], ["B-5", "B-6"]),
 "K4": ("the step removed from Engine A", [("      if (!_pooled && P.laterB && P.laterB[yr]) {", "      if (false && !_pooled && P.laterB && P.laterB[yr]) {")], ["B-4"]),
 "K5": ("the step removed from the Roth ladder", [("if (_lb.trad > 0 || _lb.roth > 0) { tradBalB += _lb.trad;", "if (false) { tradBalB += _lb.trad;")], ["F-12"]),
 "K6": ("the step removed from the RMD cards", [('const _lbGrown = (who, yr, after) => { if (who !== "B") return 0;', "const _lbGrown = (who, yr, after) => { if (true) return 0;")], ["F-9"]),
 "K7": ("the step removed from What Breaks", [("if (_la > 0) bal += _la / _rbWB; }", "if (false) bal += _la / _rbWB; }")], ["F-10"]),
 "K8": ("the step removed from Backtest", [("if (_la > 0) bal += _la / planDollarFactor(_retireYr, PLAN_TIMELINE.asOfYear); }", "if (false) bal += _la / planDollarFactor(_retireYr, PLAN_TIMELINE.asOfYear); }")], ["F-10"]),
 "K9": ("Engine D a year early", [("{ const _lb = laterBContribAt(yr, retireYear), _lA = _lb.trad + _lb.roth;", "{ const _lb = laterBContribAt(yr + 1, retireYear), _lA = _lb.trad + _lb.roth;")], ["B-2", "B-3"]),
 "K10": ("the helper from the timeline's year", [("  const rA = Number.isFinite(Number(retireYr)) ? Number(retireYr) : tl.targetRetireYear;\n  const rB = tl.targetRetireYearB || rA;\n  if (!(yr >= rA",
                                                  "  const rA = tl.targetRetireYear;\n  const rB = tl.targetRetireYearB || rA;\n  if (!(yr >= rA")], ["B-1", "D-3"]),
 "K11": ("the helper adds after B has died", [("  if (tl.dobB && Number.isFinite(tl.lifeExpB) && yr >= tl.dobB.year + tl.lifeExpB) return none;\n", "")], ["A-5", "B-1", "B-9"]),
 "K12": ("bStopsAtA dropped from retireStartBalances", [("  const acc = contribAccrual(retireYr, { bStopsAtA: true });", "  const acc = contribAccrual(retireYr);")], ["A-3", "B-2", "D-2"]),
 "K13": ("Engine A reads the module", [("        const _lb = P.laterB[yr], _lT =", "        const _lb = laterBContribAt(yr, P.retireYr), _lT =")], ["A-1", "A-2"]),
 "K14": ("the single-plan stream rule removed", [('    const s = (_single && s0 && s0.owner === "B") ? { ...s0, owner: "A" } : s0;', "    const s = s0;")], ["A-8", "E-1", "E-3"]),
 "K15": ("runMonteCarlo's gate removed", [("  const spouseContrib = PORTFOLIO.single ? 0 : (PORTFOLIO.contributions.spouseBMonthly || 0);", "  const spouseContrib = (PORTFOLIO.contributions.spouseBMonthly || 0);")], ["A-9", "E-6"]),
 "K16": ("runExtendedMC's gate removed", [("  const _spouseContrib = (PORTFOLIO.single ? 0 : (PORTFOLIO.contributions.spouseBMonthly || 0)) * contribRate;",
                                         "  const _spouseContrib = (PORTFOLIO.contributions.spouseBMonthly || 0) * contribRate;")], ["A-9", "E-6"]),
 "K17": ("the AI context's label without the single flag", [('s.owner === "B" && !single ? (nameB || "Person B")', 's.owner === "B" ? (nameB || "Person B")')], ["A-8"]),
 "K18": ("§13's v6.44 note removed", [(NOTE_LI, "")], ["F-1"]),
 "K20": ("What Breaks re-indexes them (× cumInf, the scope's first form)", [("if (_la > 0) bal += _la / _rbWB; }", "if (_la > 0) bal += _la / planDollarFactor(_retireYr + k, PLAN_TIMELINE.asOfYear) * cumInf; }")], ["A-7"]),
 "K21": ("Backtest re-indexes them (× its historical inflation)", [("if (_la > 0) bal += _la / planDollarFactor(_retireYr, PLAN_TIMELINE.asOfYear); }",
                                                                  "if (_la > 0) bal += _la / planDollarFactor(_retireYr + k, PLAN_TIMELINE.asOfYear) * cumInflation; }")], ["A-7"]),
 "K22": ("the notes run to B's retirement whatever B's death", [("function laterBLastYear(retireYr) { const ks = Object.keys(laterBContribSeries(retireYr)).map(Number); return ks.length ? Math.max(...ks) : null; }",
                                                               "function laterBLastYear(retireYr) { return PLAN_TIMELINE.targetRetireYearB - 1; }")], ["F-6b"]),
 "K23": ("the start note names nothing when nothing is planned before retirement", [("  else if (_later) out.push(", "  else if (false) out.push(")], ["D-7"]),
 "K24": ("the Income tab's two owner labels without the single flag",
         [('\n            const _own = s.owner === "A" || (s.owner === "B" && PLAN_TIMELINE.single) ? nA :', '\n            const _own = s.owner === "A" ? nA :'),
          ('\n                    const _own = s.owner === "A" || (s.owner === "B" && PLAN_TIMELINE.single) ? nA :', '\n                    const _own = s.owner === "A" ? nA :')], ["A-8", "F-11"]),
 "K19": ("the units note back to 'left out'", [("'s later ones join the schedule at the end of each year they are made, through ${laterBLastYear(retireYear)} — from v6.44; through v6.43 they were left out)",
                                              "'s later ones are left out)")], ["F-6"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v644"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v644.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v644.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t108_later_b_contrib.mjs", "v644"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t108 SUITE \(v644\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        got = [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
        hit = [w for w in want if w in got]
        return f"{label} {'FIRED' if len(hit) == len(want) else ('PARTIAL' if hit else 'SILENT')} — {desc}: want {want}, red {got}"
    finally:
        if pairs:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
labels = sys.argv[1:] or list(M.keys())
res = [run(l) for l in labels]
for line in res: print(line)
after = tuple(md5(p) for p in WATCH)
print("files restored:", "YES" if after == BEFORE else f"NO — {BEFORE} vs {after}")
bad = [x for x in res if not (x.startswith("C0 OK") or " FIRED " in x)]
sys.exit(1 if bad or after != BEFORE else 0)
