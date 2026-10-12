#!/usr/bin/env python3
"""controls_v607_annuity_conv.py — negative controls for t70 (docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v607.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle
— t70 §E reads the Roth tab), t70 runs on the v607 leg, then ./v607.jsx, qa/app_v607.mjs and qa/dom_v607.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v606 -> v607 run folder:  python3 qa/tools/controls_v607_annuity_conv.py [K1 ...]
    K1  a conversion carries annuity money again in the state attribution ............................. A-1, A-2, F-1
    K2  Engine A's headroom counts the annuity again (convertible) ..................................... B-5, F-1
    K3  Engine A's share is no longer re-taken (RMDs drain the annuity pro rata again) ................ G-1
    K4  Engine C's conversion cap counts the annuity again ............................................. B-2, F-1
    K5  Engine C's QCD cap counts the annuity again .................................................... B-3
    K6  Engine C's share is no longer re-taken ......................................................... C-2
    K7  Engine B's conversion cap counts the annuity again ............................................. B-1, F-1
    K8  Engine B's QCD cap counts the annuity again .................................................... B-3
    K9  Engine B's share is no longer re-taken ......................................................... C-2
    K10 Engine B splits the conversion between the legs by the whole balance again .................... C-2
    K11 the ladder's own RMD counts spouse A's annuity again ........................................... E-5
        (A's window has closed by A's first RMD year, so the RMD moves no conversion and no card — only the table's RMD and MAGI;
        E-5 reads the table, which is why it exists: the cards alone cannot see this mutation, measured at the build)
        (the B line of the ladder's RMD is not controlled separately: B's first RMD year, 2041, falls after the ladder ends on every
        fixture here, so no fixture in this suite can see it — the expression is the A line's twin, and t1 S-2 pins the A line's text)
    K12 the ladder's cap lets spouse B's annuity be converted again .................................... E-1, E-2
    K13 the with-conversion card goes back to the static share ......................................... E-1
    K14 the ladder stops growing the carried annuity ................................................... E-1
    K0  unmutated ...................................................................................... t70 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v607.jsx")
MOD = os.path.join(QA, "app_v607.mjs"); DOM = os.path.join(QA, "dom_v607.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v606.mjs"), os.path.join(QA, "t70_annuity_conversion.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v607.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v606 -> v607 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("attribution: a conversion carries annuity again", "fromEmp = rd - fromIra, cs = split(c, 0, e);", "fromEmp = rd - fromIra, cs = split(c, a, e);", ["A-1", "A-2", "F-1"]),
 "K2": ("Engine A headroom counts the annuity", "const headA = yr <= ladderEndA ? Math.max(0, tradA * (1 - _annShA) - rmdA) : 0;", "const headA = yr <= ladderEndA ? Math.max(0, tradA - rmdA) : 0;", ["B-5", "F-1"]),
 "K3": ("Engine A share constant", "_annShA = _pA > 0 ? Math.min(1, _nA / _pA) : 0; _annShB = _pB > 0 ? Math.min(1, _nB / _pB) : 0;", "void _nA; void _nB;", ["G-1"]),
 "K4": ("Engine C conversion cap counts the annuity", "rothAmount : 0, Math.max(0, _rmdBaseA + _rmdBaseB - Math.max(rmd_y, qcd_y)));", "rothAmount : 0, Math.max(0, tradBal - Math.max(rmd_y, qcd_y)));", ["B-2", "F-1"]),
 "K5": ("Engine C QCD cap counts the annuity", "_qcdPersonsI * inflate(TAX_CONSTS.QCD_LIMIT, yr), _rmdBaseA + _rmdBaseB);", "_qcdPersonsI * inflate(TAX_CONSTS.QCD_LIMIT, yr), tradBal);", ["B-3"]),
 "K6": ("Engine C share constant", "_annShareA = _pA > 0 ? Math.min(1, _nA / _pA) : 0; _annShareB = _pB > 0 ? Math.min(1, _nB / _pB) : 0;\n      tradA = _pA * 1.045;", "void _nA; void _nB;\n      tradA = _pA * 1.045;", ["C-2"]),
 "K7": ("Engine B conversion cap counts the annuity", "Math.min(conv(yr), Math.max(0, _rmdBaseA + _rmdBaseB - Math.max(rmd_y, qcd_y)));", "Math.min(conv(yr), Math.max(0, tradBal - Math.max(rmd_y, qcd_y)));", ["B-1", "F-1"]),
 "K8": ("Engine B QCD cap counts the annuity", "_qcdPersons * inflate(TAX_CONSTS.QCD_LIMIT, yr), _rmdBaseA + _rmdBaseB);", "_qcdPersons * inflate(TAX_CONSTS.QCD_LIMIT, yr), tradBal);", ["B-3"]),
 "K9": ("Engine B share constant", "_annShareA = _pA > 0 ? Math.min(1, _nA / _pA) : 0; _annShareB = _pB > 0 ? Math.min(1, _nB / _pB) : 0;\n      tradA = _pA * (1 + tradGrowth);", "void _nA; void _nB;\n      tradA = _pA * (1 + tradGrowth);", ["C-2"]),
 "K10": ("Engine B conversion split by the whole balance", "const _fracQA = (_qPostA + _qPostB) > 0 ? _qPostA / (_qPostA + _qPostB) : _fracA;\n    const _attrQA", "const _fracQA = _fracA;\n    const _attrQA", ["C-2"]),
 "K11": ("ladder RMD counts A's annuity", "Math.max(0, tradBalA - annBalA) / rmdDivisor(_ageA_y)", "Math.max(0, tradBalA) / rmdDivisor(_ageA_y)", ["E-5"]),
 "K12": ("ladder cap converts B's annuity", "_grownB - annBalB * (1 + tradGrowth) : 0) - rmdB_y);", "_grownB : 0) - rmdB_y);", ["E-1", "E-2"]),
 "K13": ("card back to the static share", "withConv: Math.round(Math.max(0, balAt(P0.who, P0.yr) - annAt(P0.who, P0.yr)) / rmdDivisor(P0.age)),", "withConv: Math.round(balAt(P0.who, P0.yr) * (1 - P0.annSh) / rmdDivisor(P0.age)),", ["E-1"]),
 "K14": ("ladder annuity not grown", "annBalA = Math.min(annBalA * (1 + tradGrowth), tradBalA); annBalB = Math.min(annBalB * (1 + tradGrowth), tradBalB);", "annBalA = Math.min(annBalA, tradBalA); annBalB = Math.min(annBalB, tradBalB);", ["E-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-G]-\d+[ab]?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v607"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v607.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v607.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t70_annuity_conversion.mjs", "v607"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t70 SUITE \(v607\): (\d+) passed, (\d+) failed", out)
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
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
