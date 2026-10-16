#!/usr/bin/env python3
"""controls_v614_payroll.py — negative controls for t77 (docs/SCOPE_D17_PAYROLL_TAX_V614.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
the app mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t77 runs on
the v614 leg, then ./v614.jsx, qa/app_v614.mjs, qa/dom_v614.cjs and qa/t77_payroll_tax.mjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v613 -> v614 run folder:  python3 qa/tools/controls_v614_payroll.py [K1 ...]
    K1  the household cap back (one wage base for both earners — C-14) ...................................... A-1, A-2, D-1
    K2  the 0.9% Additional Medicare Tax dropped (D-17) ...................................................... A-1, A-2
    K3  the 0.9% threshold indexed with the wage base ........................................................ A-1
    K4  the joint threshold used in Single years ............................................................. A-1
    K5  a joint job row given wholly to A .................................................................... A-1
    K6  a literal 0.0145 back in Engine A .................................................................... B-2
    K7  Engine A keeps v6.13's rule at its tax line .......................................................... B-1, C-3
    K8  the TEST's oracle stops attributing wages per person (a test mutant) ................................ A-1
    K9  the Taxes tab's method note loses the per-earner clause ............................................. E-1
    K0  unmutated ............................................................................................ t77 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v614.jsx"); T77 = os.path.join(QA, "t77_payroll_tax.mjs")
MOD = os.path.join(QA, "app_v614.mjs"); DOM = os.path.join(QA, "dom_v614.cjs")
for p in (SRC, T77, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v614.jsx"), os.path.join(QA, "app_v613.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v613 -> v614 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", [], "app", []),
 "K1": ("household cap back", [("  for (const w of earners) ss += Math.min(Math.max(0, w), wageBase) * TAX_CONSTS.FICA_SS_RATE;",
                                "  ss = Math.min(wages, wageBase) * TAX_CONSTS.FICA_SS_RATE;")], "app", ["A-1", "A-2", "D-1"]),
 "K2": ("0.9% dropped", [("  return ss + wages * TAX_CONSTS.FICA_MED_RATE + TAX_CONSTS.ADDL_MED_RATE * Math.max(0, wages - thr);",
                          "  return ss + wages * TAX_CONSTS.FICA_MED_RATE;")], "app", ["A-1", "A-2"]),
 "K3": ("threshold indexed", [("  const thr = filingSingle ? TAX_CONSTS.ADDL_MED_SGL : TAX_CONSTS.ADDL_MED_MFJ;",
                               "  const thr = (filingSingle ? TAX_CONSTS.ADDL_MED_SGL : TAX_CONSTS.ADDL_MED_MFJ) * (wageBase / TAX_CONSTS.SS_WAGE_BASE);")], "app", ["A-1"]),
 "K4": ("joint threshold in Single years", [("  const thr = filingSingle ? TAX_CONSTS.ADDL_MED_SGL : TAX_CONSTS.ADDL_MED_MFJ;",
                                             "  const thr = TAX_CONSTS.ADDL_MED_MFJ;")], "app", ["A-1"]),
 "K5": ("joint row all A's", [("  return onePerson ? [a + b + j + taperB] : [a + j / 2, b + taperB + j / 2];",
                               "  return onePerson ? [a + b + j + taperB] : [a + j, b + taperB];")], "app", ["A-1"]),
 "K6": ("literal 0.0145 back in Engine A", [("const fica = payrollTax(work, _earners, infl(TAX_CONSTS.SS_WAGE_BASE, yr), effSingle);",
                                              "const fica = payrollTax(work, _earners, infl(TAX_CONSTS.SS_WAGE_BASE, yr), effSingle) + work * 0.0145 * 0;")], "app", ["B-2"]),
 "K7": ("Engine A keeps v6.13's rule", [("const fica = payrollTax(work, _earners, infl(TAX_CONSTS.SS_WAGE_BASE, yr), effSingle);",
                                          "const fica = work > 0 ? Math.min(work, infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * TAX_CONSTS.FICA_SS_RATE + work * TAX_CONSTS.FICA_MED_RATE : 0;")], "app", ["B-1", "C-3"]),
 "K8": ("the oracle drops per-person attribution", [("  return onePerson ? [a + b + j] : [a + j / 2, b + j / 2];", "  return [a + b + j];")], "test", ["A-1"]),
 "K9": ("method note loses the per-earner clause", [("Social Security 6.2% on each earner's wages up to the wage base, Medicare 1.45% on all of them,",
                                                     "Social Security 6.2% up to the wage base, Medicare 1.45%,")], "app", ["E-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = {"app": SRC, "test": T77}
ORIG = {k: open(p, "rb").read() for k, p in FILES.items()}
WATCH = (SRC, T77, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v614"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v614.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v614.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, where, want = M[label]
    try:
        if pairs:
            s = ORIG[where].decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(FILES[where], "w", encoding="utf-8").write(s)
            if where == "app": build()
        r = subprocess.run(["node", "t77_payroll_tax.mjs", "v614"], cwd=QA, capture_output=True, timeout=2400)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t77 SUITE \(v614\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for k, p in FILES.items():
            if open(p, "rb").read() != ORIG[k]:
                open(p, "wb").write(ORIG[k])
                if k == "app": build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
