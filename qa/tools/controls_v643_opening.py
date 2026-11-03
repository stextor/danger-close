#!/usr/bin/env python3
"""controls_v643_opening.py — negative controls for t107 (docs/SCOPE_D64_D70_V643.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v643.jsx (each target occurs exactly once), rebuilds qa/app_v643.mjs and qa/dom_v643.cjs as mk_runfolder.sh builds
  them, runs t107 on the v643 leg, then RESTORES the three files and hash-checks them.
Run from the ROOT of a COPY of a v642 -> v643 run folder:  python3 qa/tools/controls_v643_opening.py [K1 ...]
  Engine D's opening (D-64)
    K1  the contributions never added to the buckets ................................................ B-1, C-1, C-4
    K2  the Traditional share taken over the old base (v6.42's) ...................................... B-1, C-2
    K3  spouse B's RMD split left as v6.42's (uncarried, the full accrual) ............................ C-3
    K4  the guard removed (the step runs on a plan with no contribution) .............................. A-4, E-1
    K5  the weights fall back to the stored bucket mix, not the buckets' own ........................... A-3, B-1
    K6  DD-6: what today's money could not cover is not charged against the contributions ............... C-6
    K7  DD-7: a later-retiring spouse B's contributions counted to her own year ......................... A-1, B-1, C-5
    K10 a negative contribution subtracts from the opening (no clamp) ................................... C-9
  What Breaks and Backtest (D-64, DD-2)
    K8  Backtest back to today's household (What Breaks only on the helper) ............................ A-5, F-7
  a single plan (D-70)
    K9  the single-plan rule removed (rows under B stay B's) ........................................... D-1
  the copy
    K11 §13's v6.43 note removed, the whole item ...................................................... F-1
    K12 the sleeve card back to today's holdings plus the contributions, uncarried ...................... F-5
  added after the build review
    K13 What Breaks back to today's household (Backtest still on the helper) ........................... A-5
    K14 the guard back to the capped accrual only (a retired plan keeps v6.42's shares) .................. A-4, B-1
    K15 DD-7 not disclosed (no spouse-B cap named on What Breaks, Backtest or the units note) ............ F-13
    C0  unmutated ..................................................................................... t107 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v643.jsx"); MOD = os.path.join(QA, "app_v643.mjs"); DOM = os.path.join(QA, "dom_v643.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t107_opening_balances.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v643.jsx"),
          os.path.join(QA, "app_v642.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v642 -> v643 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>The money the Withdrawal tab, What Breaks and Backtest start from (v6.43).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("the contributions never added to the buckets",
        [("            b1 += _acc * _w[1]; b2 += _acc * _w[2]; b3 += _acc * _w[3]; b4 += _acc * _w[4];\n", "")], ["B-1", "C-1", "C-4"]),
 "K2": ("the Traditional share over the old base",
        [("            tradFrac = _bk2 > 0 ? (_tH + _accT) / _bk2 : 0;\n", "            tradFrac = _t401kInit > 0 ? _rsbW.posTrad / _t401kInit : 0;\n")], ["B-1", "C-2"]),
 "K3": ("spouse B's RMD split left as v6.42's",
        [("            _fracB = (_tH + _accT) > 0 ? (_tH * _fb0 + _accO.tradB) / (_tH + _accT) : 0;", "            _fracB = _rsbW.posTrad > 0 ? _tradInitB_own / _rsbW.posTrad : 0;")], ["C-3"]),
 "K4": ("the guard removed", [("          if (_accT !== 0 || _accR !== 0 || _accRaw) {\n", "          if (true) {\n")], ["A-4", "E-1"]),
 "K5": ("the weights fall back to the stored bucket mix",
        [("const _w = contribAllocationWeights() || (_bk > 0 ? { 1: b1 / _bk, 2: b2 / _bk, 3: b3 / _bk, 4: b4 / _bk } : { 1: 1, 2: 0, 3: 0, 4: 0 });",
          "const _w = contribBucketWeights();")], ["A-3", "B-1"]),
 "K6": ("DD-6: the rest of a large pre-retirement row not charged", [("          if (_preLeft > 0) {\n", "          if (false) {\n")], ["C-6"]),
 "K7": ("DD-7: spouse B counted to her own year", [("contribAccrual(retireYr, { bStopsAtA: true })", "contribAccrual(retireYr, { bStopsAtA: false })")], ["A-1", "B-1", "C-5"]),
 "K8": ("Backtest back to today's household",
        [("          // Starting liquid portfolio (household) and bucket weights\n          const startBal = retireStartToday(retireYear);",
          "          // Starting liquid portfolio (household) and bucket weights\n          const startBal = Math.max(0, PORTFOLIO.household - preRetireOneTime(retireYear));")], ["A-5", "F-7"]),
 "K9": ("the single-plan rule removed", [('  const _asA = r => (_single && r && r.owner === "B") ? { ...r, owner: "A" } : r;', "  const _asA = r => r;")], ["D-1"]),
 "K10": ("a negative contribution subtracts", [("  const nz = x => Math.max(0, Number(x) || 0);\n  return { tradA: nz(a.tradA)", "  const nz = x => Number(x) || 0;\n  return { tradA: nz(a.tradA)")], ["C-9"]),
 "K11": ("§13's v6.43 note removed", [(NOTE_LI, "")], ["F-1"]),
 "K13": ("What Breaks back to today's household",
         [("          const planYears = _horizonYr - _retireYr + 1;\n          const startBal = retireStartToday(retireYear);",
           "          const planYears = _horizonYr - _retireYr + 1;\n          const startBal = Math.max(0, PORTFOLIO.household - preRetireOneTime(retireYear));")], ["A-5"]),
 "K14": ("the guard back to the capped accrual only", [("          if (_accT !== 0 || _accR !== 0 || _accRaw) {\n", "          if (_accT !== 0 || _accR !== 0) {\n")], ["A-4", "B-1"]),
 "K15": ("DD-7 not disclosed", [("  return Math.max(0, nz(u.tradB) + nz(u.rothB) - c.tradB - c.rothB);", "  return 0;")], ["F-13"]),
 "K12": ("the sleeve card back to v6.42's figures",
         [("Traditional <span data-dc-sleeve-open style={{ color: \"var(--info)\" }}>${((_wpOpenBk * _wpOpen.tradFrac) / 1000).toFixed(0)}K</span>",
           "Traditional <span data-dc-sleeve-open style={{ color: \"var(--info)\" }}>${(_posTradW / 1000).toFixed(0)}K</span>")], ["F-5"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v643"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v643.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v643.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t107_opening_balances.mjs", "v643"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t107 SUITE \(v643\): (\d+) passed, (\d+) failed", out)
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
