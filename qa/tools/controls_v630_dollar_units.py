#!/usr/bin/env python3
"""controls_v630_dollar_units.py — negative controls for t93 (docs/SCOPE_D60_DOLLAR_UNITS_V630.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v630.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM
bundle), the named suites run on the v6.30 leg, then ./v630.jsx, qa/app_v630.mjs and qa/dom_v630.cjs are RESTORED and hash-checked.
Each mutation puts back one shape of the defect D-60 removed; the expected checks were written down before the controls were first run.
Run from the ROOT of a COPY of a v629 -> v630 run folder:  python3 qa/tools/controls_v630_dollar_units.py [U1 ...]
    U1  Engine B holds Social Security flat in today's dollars again (spouse A's check) .................... t93 B-1
    U2  the bridge deflates Engine D's draw again ......................................................... t93 H-6; t40 (any)
    U3  Engine D's inflator runs from the retirement year again ............................................ t93 H-3, D-4
    U4  the cost basis is carried to retirement with the balances ......................................... t93 H-5
    U5  the bracket family indexes at a fixed 1.02 again ................................................. t93 H-1, A-4, A-10, A-11
    U6  Engine C's surcharge flat at 2026's amount again .................................................. t93 G-1, G-2
    U7  the poverty line grows at a fixed 2% past the last guideline year ................................. t93 A-9
    U8  the Social Security wage base indexes at the chained (bracket) rate — the v6.30 build's own slip .... t93 A-4b; t77 (any)
    U9  the Monte Carlo handed each row's own-year tax again (grown twice) ................................ t93 E-1, M-1
    U10 What Breaks reads Engine A's each-year total again (grown twice) .................................. t93 H-7, W-1
    U11 the planned-contribution accrual carried with the holdings (the build review's blocker) ........... t93 O-1, O-2, O-3
    U12 the NIIT threshold indexed (Engine B) ............................................................ t93 H-11, N-1
    U0  unmutated .......................................................................................... t93, t40, t77 pass
Results are recorded in MANIFEST.txt and the CHANGELOG, not here. Notes from building it: a target naming a variable outside its scope
crashes the suite's module child (only a setup check goes red — an invalid control, not a miss), so U3 names `retireYear`; and a run folder
copied with a SYMLINKED node_modules rebuilds the DOM bundle with different path comments and fails the restore hash — copy it whole.
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v630.jsx")
MOD, DOM = os.path.join(QA, "app_v630.mjs"), os.path.join(QA, "dom_v630.cjs")
SUITES = {"t93": "t93_dollar_units.mjs", "t40": "t40_cross_tab_agreement.mjs", "t77": "t77_payroll_tax.mjs"}
for p in [SRC, MOD, DOM, os.path.join(QA, "app_v629.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v630.jsx")] + [os.path.join(QA, f) for f in SUITES.values()]:
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v629 -> v630 run folder copy (missing {p})")
# (description, old, new, {suite: [check ids] — "*" = at least one red check in that suite})
M = {
 "U0": ("unmutated", None, None, {"t93": [], "t40": [], "t77": []}),
 "U1": ("Engine B's Social Security flat in today's dollars",
        "_ssA * 12 : yr === _ssAYr ? _ssA * Math.max(0, 13 - _ssAMo) : 0) * _kY(yr);",
        "_ssA * 12 : yr === _ssAYr ? _ssA * Math.max(0, 13 - _ssAMo) : 0);", {"t93": ["B-1"]}),
 "U2": ("the bridge deflates the draw",
        "ordDrawByYr[r.yr] = r.ordDraw_y || 0;",
        "ordDrawByYr[r.yr] = (r.ordDraw_y || 0) / Math.pow(1 + expectedInflation(), r.yr - 2026);", {"t93": ["H-6"], "t40": ["*"]}),
 "U3": ("Engine D on the retirement clock",
        "const _wInflator = (yr) => Math.pow(1 + _wInfl, Math.max(0, yr - _tlW.asOfYear));",
        "const _wInflator = (yr) => Math.pow(1 + _wInfl, Math.max(0, yr - retireYear));", {"t93": ["H-3", "D-4"]}),
 "U4": ("the basis carried with the balances",
        "taxGainPool *= _rb; }", "taxGainPool *= _rb; gainBasis *= _rb; }", {"t93": ["H-5"]}),
 "U5": ("a fixed 1.02 for the bracket family",
        "base === Infinity ? Infinity : base * Math.pow(1 + chainedCpiRate(), yr - baseYr);",
        "base === Infinity ? Infinity : base * Math.pow(1.02, yr - baseYr);", {"t93": ["H-1", "A-4", "A-10", "A-11"]}),
 "U6": ("Engine C's surcharge flat",
        "_TT[tier].surchargePerPerson * personsOnMedicare * _kY(irmaaYr);",
        "_TT[tier].surchargePerPerson * personsOnMedicare;", {"t93": ["G-1", "G-2"]}),
 "U7": ("the poverty line at a fixed 2%",
        "(last.base + last.perPerson * (size - 1)) * Math.pow(1 + cpiuRate(), gy - lastGy);",
        "(last.base + last.perPerson * (size - 1)) * Math.pow(1 + 0.02, gy - lastGy);", {"t93": ["A-9"]}),
 "U9": ("the Monte Carlo's schedule in each year's dollars",
        "for (const r of rows) byYr[r.yr] = r.totalTaxToday;", "for (const r of rows) byYr[r.yr] = r.totalTax;", {"t93": ["E-1", "M-1"]}),
 "U10": ("What Breaks on the each-year total",
        "if (_cT && Number.isFinite(_cT.totTaxToday)) estAnnualTax = _cT.totTaxToday / planYears;",
        "if (_cT && Number.isFinite(_cT.totTax)) estAnnualTax = _cT.totTax / planYears;", {"t93": ["H-7", "W-1"]}),
 "U11": ("the accrual carried with the holdings",
        "  const at = (amt, acc) => (amt - acc) * rb + acc;", "  const at = (amt, acc) => amt * rb;", {"t93": ["O-1", "O-2", "O-3"]}),
 "U12": ("the NIIT threshold indexed in Engine B",
        "const niitThr = taxFactsFor(effSingle).niit; // deliberately NOT inflated", "const niitThr = inflate(taxFactsFor(effSingle).niit, yr); // deliberately NOT inflated",
        {"t93": ["H-11", "N-1"]}),
 "U8": ("the wage base at the chained rate",
        "const inflateWageBase = (base, yr, baseYr) => base * Math.pow(1 + cpiuRate(), yr - baseYr);",
        "const inflateWageBase = (base, yr, baseYr) => base * Math.pow(1 + chainedCpiRate(), yr - baseYr);", {"t93": ["A-4b"], "t77": ["*"]}),
}
cid = lambda l: (re.match(r"  ✗ ([0-9A-Z]+-[A-Za-z0-9]+|[A-Z][0-9]+[a-z]?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v630"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v630.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v630.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def suite(name):
    r = subprocess.run(["node", SUITES[name], "v630"], cwd=QA, capture_output=True, timeout=3600)
    out = r.stdout.decode("utf-8", "replace")
    tally = re.search(r"(\d+) passed, (\d+) failed", out)
    return r.returncode, tally, [l for l in out.splitlines() if l.startswith("  ✗ ")], r.stderr.decode("utf-8", "replace")
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        parts, ok = [], True
        for name, ids in want.items():
            rc, tally, failed, err = suite(name)
            if not tally: return f"{label} CRASHED in {name} — {desc}: {err[-300:]}"
            if label == "U0":
                good = rc == 0 and tally.group(2) == "0"; ok &= good; parts.append(f"{name} {tally.group(0)}"); continue
            red = {cid(l) for l in failed if cid(l)}
            miss = ["any red check" for w in ids if w == "*" and not failed] + [w for w in ids if w != "*" and w not in red]
            ok &= not miss
            parts.append(f"{name}: {'MISSED ' + str(miss) if miss else 'fires'}, red {len(failed)}" + (f" (also: {' '.join(sorted(red - set(ids)))})" if red - set(ids) else ""))
        if label == "U0": return f"U0 {'OK' if ok else 'BAD'} unmutated: " + "; ".join(parts)
        return f"{label} {'FIRES' if ok else 'MISSED'} — {desc}; " + "; ".join(parts)
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("U0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
