#!/usr/bin/env python3
"""controls_v647_spousal.py — negative controls for t111 (docs/SCOPE_D77_SPOUSAL_BENEFIT_V647.md §3.4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v647.jsx (each target occurs exactly once), rebuilds qa/app_v647.mjs and qa/dom_v647.cjs as mk_runfolder.sh builds
  them, runs t111 on the v647 leg with the sections its checks live in (T111_SECTIONS; §D's rendered comparison skipped by
  T111_CONTROLS_SKIP_DDOM — both the controls' switches, never the suite's), then RESTORES the three files and hash-checks them.
Run from the ROOT of a COPY of a v646 -> v647 run folder:  python3 qa/tools/controls_v647_spousal.py [K1 ...]
  each money path's addition removed (both spouses') — the census (A-3) and the twins (§C) must fire for each
    K1  the 6-year Monte Carlo, planned path ...................................... A-3, C-1d, C-2a, C-2b, C-2c
    K2  the 6-year Monte Carlo, the runs ........................................... A-3, C-1d, C-2a, C-2b, C-2c
        (its six years end before 2033, so twins 1a–1c, whose top-ups start in 2033, cannot see it; the 2031 twins do)
    K3  the 30-year Monte Carlo, planned path ...................................... A-3, C-1a, C-1d, C-2a
    K4  the 30-year Monte Carlo, the runs .......................................... A-3, C-1a, C-1d, C-2a
    K5  Engine A (its annualSSA / annualSSB) ....................................... A-3, A-4, C-1a, C-1d, C-2a
    K6  Engine C ................................................................... A-3, C-1a, C-1d, C-2a
    K7  Engine D ................................................................... A-3, C-1a, C-1d, C-2a
    K8  Engine B (and the Monte Carlo's tax schedule and What Breaks' tax through it)  A-3, C-1a, C-1d, C-2a
    K9  the Roth ladder (rendered) ................................................. A-3, C-1ar, C-1dr, C-2ar
    K10 Backtest (rendered) ........................................................ C-1ar, C-1dr, C-2ar
        (its sums read the top-ups' fields, not a helper call, so A-3's count does not see them; the rendered twins do)
    K11 What Breaks' guaranteed income (rendered) .................................. A-3, C-1ar, C-1dr, C-2ar
    K12 Engine A's three builders without the plan's fields (the Roth tab) ......... A-3, A-4, C-1ar, C-2ar
  the rule
    K13 the reduction's two branches swapped ....................................... B-1, B-2, E-noSSB, C-2a
    K14 the start month taken as the spouse's own filing (the worker's ignored) .... B-1, B-8, E-noSSB, C-2a
    K15 the delayed-credit offset dropped .......................................... B-1, B-7, E-smallB_70
    K16 the attained-age month dropped (67 in the birth month, born on the 1st) .... B-1, B-5, E-noSSB, C-2a
    K17 the placeholder rule dropped (DL-7) ........................................ A-1b, E-8, F-8
    K18 the top-up taxed as a pension by Engine B, not as Social Security ......... C-1a, C-2a
  the displays and the copy
    K19 spouse B's card line removed ............................................... F-1, F-6
    K20 the warning restored ....................................................... A-6, F-3
    K21 the Income tab's total without the top-ups ................................. G-1
    K22 the grid's tie rule reverted (the first tied cell named) ................... F-4
    K24 the claiming grid without the top-up ....................................... F-9
    K25 Ask AI's context without it ................................................ G-3
    K26 My Data's line removed ..................................................... G-4
    K27 Backtest's high-survival line without it (found by the twins at the build) . A-3, C-1ar, C-1dr, C-2ar
    K28 a date of birth without its day read as the 1st ............................. E-10
    K29 the "none is owed" line shown beside the placeholder's $0 spouse B .......... F-8
    K30 Engine B pays spouse A's top-up from A's own filing (the review's gap) ...... C-2c
    K23 §13's v6.47 note removed, the whole item ................................... H-1
    C0  unmutated (all sections; §D's rendered comparison skipped) ................. t111 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v647.jsx"); MOD = os.path.join(QA, "app_v647.mjs"); DOM = os.path.join(QA, "dom_v647.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t111_spousal.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v647.jsx"),
          os.path.join(QA, "tools", "spousal_oracle.mjs"), os.path.join(QA, "app_v646.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v646 -> v647 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>SSA’s spousal benefit (v6.47).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
TW = ["C-1a", "C-1d", "C-2a"]; TWR = ["C-1ar", "C-1dr", "C-2ar"]
M = {
 "C0": ("unmutated", [], ["-"], "A,B,C,D,E,F,H"),
 "K1": ("the 6-year Monte Carlo's planned path", [
   ("(getSSB() * mcPaidShare(_tlM, q, _tlM.ssB_date) + _topMq(_topMB, q)) * ssCola(plannedInfl)", "(getSSB() * mcPaidShare(_tlM, q, _tlM.ssB_date)) * ssCola(plannedInfl)"),
   ("(getSSA() * mcPaidShare(_tlM, q, _tlM.ssA_date) + _topMq(_topMA, q)) * ssCola(plannedInfl)", "(getSSA() * mcPaidShare(_tlM, q, _tlM.ssA_date)) * ssCola(plannedInfl)")], ["A-3", "C-1d", "C-2a", "C-2b", "C-2c"], "A,C"),
 "K2": ("the 6-year Monte Carlo's runs", [
   ("(getSSB() * mcPaidShare(_tlM, q, _tlM.ssB_date) + _topMq(_topMB, q)) * ssCola(inflationCum)", "(getSSB() * mcPaidShare(_tlM, q, _tlM.ssB_date)) * ssCola(inflationCum)"),
   ("(getSSA() * mcPaidShare(_tlM, q, _tlM.ssA_date) + _topMq(_topMA, q)) * ssCola(inflationCum)", "(getSSA() * mcPaidShare(_tlM, q, _tlM.ssA_date)) * ssCola(inflationCum)")], ["A-3", "C-1d", "C-2a", "C-2b", "C-2c"], "A,C"),
 "K3": ("the 30-year Monte Carlo's planned path", [
   ("getSSB() * mcPaidShare(_tl, q, _tl.ssB_date) + _topXq(_topXB, q) : 0)", "getSSB() * mcPaidShare(_tl, q, _tl.ssB_date) : 0)"),
   ("(getSSA() * mcPaidShare(_tl, q, _tl.ssA_date) + _topXq(_topXA, q)) * ssCola(_plannedInfl)", "(getSSA() * mcPaidShare(_tl, q, _tl.ssA_date)) * ssCola(_plannedInfl)")], ["A-3"] + TW, "A,C"),
 "K4": ("the 30-year Monte Carlo's runs", [
   ("const ssA_q = _ssA * mcPaidShare(_tl, q, _tl.ssA_date) + _topXq(_topXA, q);", "const ssA_q = _ssA * mcPaidShare(_tl, q, _tl.ssA_date);"),
   ("_ssB * mcPaidShare(_tl, q, _tl.ssB_date) + _topXq(_topXB, q) : 0;", "_ssB * mcPaidShare(_tl, q, _tl.ssB_date) : 0;")], ["A-3"] + TW, "A,C"),
 "K5": ("Engine A's sums", [("+ _topAY(P.topA, yr))", ")"), ("+ _topAY(P.topB, yr))", ")")], ["A-3", "A-4"] + TW, "A,C"),
 "K6": ("Engine C", [("+ _topIY(_topIA, yr)) * _kY(yr)", ") * _kY(yr)"), ("+ _topIY(_topIB, yr)) * _kY(yr)", ") * _kY(yr)")], ["A-3"] + TW, "A,C"),
 "K7": ("Engine D", [(": 0) + spousalTopUpYear(_topWA, yr);", ": 0);"), (": 0) + spousalTopUpYear(_topWB, yr);", ": 0);")], ["A-3"] + TW, "A,C"),
 "K8": ("Engine B", [("+ spousalTopUpYear(_topTA, yr)) * _kY(yr);", ") * _kY(yr);"), ("+ spousalTopUpYear(_topTB, yr)) * _kY(yr);", ") * _kY(yr);")], ["A-3"] + TW, "A,C"),
 "K9": ("the Roth ladder", [('+ spousalTopUpYear(spousalTopUp("B", _tlRoth), year)) * _kYL(year);', ") * _kYL(year);"),
                             ('+ spousalTopUpYear(spousalTopUp("A", _tlRoth), year)) * _kYL(year);', ") * _kYL(year);")], ["A-3"] + TWR, "A,C"),
 "K10": ("Backtest", [("+ (_topBA.monthly > 0 && yr >= _topBA.date.year ? _topBA.monthly * 12 : 0);", ";"),
                      ("+ (_topBB.monthly > 0 && yr >= _topBB.date.year ? _topBB.monthly * 12 : 0);", ";")], TWR, "A,C"),
 "K11": ("What Breaks' guaranteed income", [('return a + b + spousalTopUpYear(spousalTopUp("A", _tlW), yr) + spousalTopUpYear(spousalTopUp("B", _tlW), yr);', "return a + b;")], ["A-3"] + TWR, "A,C"),
 "K12": ("Engine A's three builders without the plan's fields", [
   ("\n      ssA: getSSA(), ssB: _tlO.single ? 0 : getSSB(), ...spousalTopUpFields(_tlO),", "\n      ssA: getSSA(), ssB: _tlO.single ? 0 : getSSB(),"),
   ("ssB: _tlR.single ? 0 : getSSB(), ...spousalTopUpFields(_tlR),", "ssB: _tlR.single ? 0 : getSSB(),"),
   ("\n                  ssA: getSSA(), ssB: _tlO.single ? 0 : getSSB(), ...spousalTopUpFields(_tlO),", "\n                  ssA: getSSA(), ssB: _tlO.single ? 0 : getSSB(),")], ["A-3", "A-4", "C-1ar", "C-2ar"], "A,C"),
 "K13": ("the reduction's branches swapped", [("let top = m <= 36 ? excess", "let top = m > 36 ? excess")], ["B-1", "B-2", "E-noSSB", "C-2a"], "A,B,C,E"),
 "K14": ("the start month taken as the spouse's own filing", [("const ym = Math.max(ymS, ymW), fra = _ssFraYm(dobS);", "const ym = ymS, fra = _ssFraYm(dobS);")], ["B-1", "B-8", "E-noSSB", "C-2a"], "A,B,C,E"),
 "K15": ("the delayed-credit offset dropped", [("  if (drc > 0) top -= drc;\n", "")], ["B-1", "B-7", "E-smallB_70"], "A,B,E"),
 "K16": ("the attained-age month dropped", [("return dob.day === 1 ? m - 1 : m; }", "return m; }")], ["B-1", "B-5", "E-noSSB", "C-2a"], "A,B,C,E"),
 "K17": ("the placeholder rule dropped", [("return !!(blk && blk.isDefault);", "return false;")], ["A-1b", "E-8", "F-8"], "A,E,F"),
 "K18": ("the top-up taxed as a pension by Engine B", [
   ("? _ssB * Math.max(0, 13 - _ssBMo) : 0) + spousalTopUpYear(_topTB, yr)) * _kY(yr);", "? _ssB * Math.max(0, 13 - _ssBMo) : 0) + 0) * _kY(yr);"),
   ("  const annualPen = (yr) => yr >= _retireYr ? _pen * 12 : 0;", "  const annualPen = (yr) => (yr >= _retireYr ? _pen * 12 : 0) + spousalTopUpYear(_topTB, yr) * _kY(yr);")], ["C-1a", "C-2a"], "A,C"),
 "K19": ("spouse B's card line removed", [('{_tBsel.monthly > 0 && <div data-dc-spousal-card="B"', '{false && <div data-dc-spousal-card="B"')], ["F-1", "F-6"], "F"),
 "K20": ("the warning restored", [("ⓘ SSA's spousal benefit, modelled:", "⚠ SPOUSAL BENEFIT NOT MODELED — ⓘ SSA's spousal benefit, modelled:")], ["A-6", "F-3"], "A,F"),
 "K21": ("the Income tab's total without the top-ups", [("const totalIncome = spouseBSS + pension + spouseASS + _topIncS;", "const totalIncome = spouseBSS + pension + spouseASS;")], ["G-1"], "F"),
 "K22": ("the grid's tie rule reverted", [("if (t >= best.tot) best = { cA, cB, tot: t };", "if (t > best.tot) best = { cA, cB, tot: t };")], ["F-4"], "F"),
 "K24": ("the claiming grid without the top-up", [("+ topY(y)) * 12 * ssDepletionFactor(y);", ") * 12 * ssDepletionFactor(y);")], ["F-9"], "F"),
 "K25": ("Ask AI's context without it", [("(${_aiSsAStart})${_aiTopTxt} = $", "(${_aiSsAStart}) = $")], ["G-3"], "F"),
 "K26": ("My Data's line removed", [("const t = spousalTopUp(w); if (!(t.monthly > 0)) return null;", "const t = spousalTopUp(w); if (true) return null;")], ["G-4"], "F"),
 "K27": ("Backtest's high-survival line without it", [("const fullGuar = (_ssA + _ssB + spousalTopUpsSteady(_tlB)) * 12 + _pen * 12;", "const fullGuar = (_ssA + _ssB) * 12 + _pen * 12;")], ["A-3", "C-1ar", "C-1dr", "C-2ar"], "A,C"),
 "K28": ("a date of birth without its day read as the 1st", [("return known ? d : { year: d.year, month: d.month }; }", "return d; }")], ["E-10"], "E"),
 "K29": ("the \"none is owed\" line on the placeholder", [("{_noneOwed && <>SSA's spousal benefit: none", "{!(_eligA || _eligB) && <>SSA's spousal benefit: none")], ["F-8"], "F"),
 "K30": ("Engine B pays spouse A's top-up from A's own filing", [("+ spousalTopUpYear(_topTA, yr)) * _kY(yr);", "+ (_topTA.monthly > 0 && yr >= _ssAYr ? _topTA.monthly * (yr > _ssAYr ? 12 : 13 - _ssAMo) : 0)) * _kY(yr);")], ["C-2c"], "A,C"),
 "K23": ("§13's v6.47 note removed", [(NOTE_LI, "")], ["H-1"], "H"),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-[A-Za-z0-9_]+)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v647"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v647.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v647.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want, secs = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        env = dict(os.environ, T111_SECTIONS=secs, T111_CONTROLS_SKIP_DDOM="1")
        r = subprocess.run(["node", "t111_spousal.mjs", "v647"], cwd=QA, capture_output=True, timeout=3600, env=env)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t111 SUITE \(v647\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        got = [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
        hit = [w for w in want if w in got]
        return f"{label} {'FIRED' if len(hit) == len(want) else ('PARTIAL' if hit else 'SILENT')} — {desc}: want {want}, red {got}"
    finally:
        if pairs:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
labels = sys.argv[1:] or list(M.keys())
res = []
for l in labels:
    res.append(run(l)); print(res[-1], flush=True)
after = tuple(md5(p) for p in WATCH)
print("files restored:", "YES" if after == BEFORE else f"NO — {BEFORE} vs {after}")
bad = [x for x in res if not (x.startswith("C0 OK") or " FIRED " in x)]
sys.exit(1 if bad or after != BEFORE else 0)
