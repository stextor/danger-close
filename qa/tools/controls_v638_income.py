#!/usr/bin/env python3
"""controls_v638_income.py — negative controls for t102 and t45 §S (docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  SOURCE controls mutate ./v638.jsx (each target occurs exactly once), rebuild qa/app_v638.mjs and qa/dom_v638.cjs as mk_runfolder.sh builds
  them, run t102 on the v638 leg, then RESTORE the three files and hash-check them.
  PAGE controls mutate a COPY of ./index.html (the built page; the phone rules appear in it verbatim) and run t45 on the copy; ./index.html
  is never written.
Run from the ROOT of a COPY of a v637 -> v638 run folder:  python3 qa/tools/controls_v638_income.py [K1 ... P1 ...]
  the phone rules (DF-1, DF-2)
    K1  a phone rule also written outside the phone block (it would reach 600 px and up) ................... A-1b
    K2  the three-card grid loses its class .................................................................. A-2, F-2
    K3  the stream row loses its class ....................................................................... A-2, F-1
    K4  the phase figure row loses its class ................................................................. A-2, F-2
  the shortfall when income covers spending (DF-3)
    K5  the steady-state metric prints the difference unguarded (v6.37's) .................................... A-3, C-a-1, C-a-2
    K6  the after-payments card prints it unguarded ............................................................ C-a-1, C-a-3
    K7  the floor's steady-state sentence always speaks of a shortfall from the portfolio ...................... C-a-4
    K8  the floor's after-payments sentence always speaks of a shortfall ...................................... C-a-1, C-a-4
    K12 an exact match reads as a surplus ("income exceeds spending by $0/mo") ................................ C-c-2
    K15 the floor's first sentence loses its space ("expenses.The") ........................................... B-3, B-4
    K16 the after-payments metric prints the difference unguarded ............................................. C-a-1, C-a-2
  found by the build review (Steve: "Fix in v6.38")
    K17 the after-payments income counts the streams of the last Medicare month again ......................... A-3b, C-d-1
    K18 the first counted stream that ends goes unnamed ........................................................ C-d-2
    K19 the gap card says the portfolio draws a gap that costs $0 .............................................. C-a-5
    K20 the first phase's note always says the portfolio covers a shortfall .................................... C-a-5
    K21 the yearly draw keeps its cents ........................................................................ C-e-1
    K22 the floor says the portfolio draws a gap that costs $0 ................................................. C-a-5
  the coverage metric (DF-4)
    K9  spouse B counted before B claims ....................................................................... A-4, D-3
    K10 the streams at retirement left out ..................................................................... A-4, D-2
    K11 a percentage shown with no gap ......................................................................... D-4
  the Field Manual (DF-5)
    K13 §13's v6.38 note removed ............................................................................... E-1
    K14 the desktop item's phone sentence removed .............................................................. E-2
  the built page (t45 §S)
    P1  the three-card stack rule deleted ...................................................................... S-5, S-6
    P2  the stream row's wrap rule deleted ..................................................................... S-3 'income'
    P3  the phase figure row's two-column rule deleted ......................................................... S-5, S-6
    C0  unmutated .............................................................................................. t102 passes
  NOT controlled here: a phone rule leaking to 600 px and up changes no measured box on the fixture plans (their rows fit one line either
  way), so t45 S-7 cannot see a leak; t102 A-1b holds it by source (K1).
"""
import hashlib, os, re, shutil, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v638.jsx"); PAGE = os.path.join(ROOT, "index.html")
MOD = os.path.join(QA, "app_v638.mjs"); DOM = os.path.join(QA, "dom_v638.cjs")
for p in (SRC, PAGE, MOD, DOM, os.path.join(QA, "t102_income_tab.mjs"), os.path.join(QA, "t45_phone_layout.py"), os.path.join(QA, "mk_testable.sh"),
          os.path.join(QA, "dom_entry_v638.jsx"), os.path.join(QA, "dom_v637.cjs"), os.path.join(ROOT, "v637.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v637 -> v638 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
STEADY_NEW = "value: _shortSteady > 0 ? `-$${_shortSteady.toLocaleString()}` : \"$0\", sub: _shortSteady > 0 ? `$${steadyStateDraw.toLocaleString()}/yr from portfolio` : _coveredBy(_shortSteady),"
STEADY_OLD = "value: `-$${(POST_MONTHLY_FULL - _steadyInc).toLocaleString()}`, sub: `$${steadyStateDraw.toLocaleString()}/yr from portfolio`,"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("a phone rule also outside the block", [(".dc-phone-only { display: none; }\n", ".dc-phone-only { display: none; }\n        .dc-streamrow { flex-wrap: wrap; row-gap: 2px; }\n")], ["A-1b"]),
 "K2": ("the three-card grid loses its class", [('<div className="dc-stack-phone" style={{ display: "grid"', '<div style={{ display: "grid"')], ["A-2", "F-2"]),
 "K3": ("the stream row loses its class", [('<div key={i} className="dc-streamrow" style=', '<div key={i} style=')], ["A-2", "F-1"]),
 "K4": ("the phase row loses its class", [('<div className="dc-two-phone" style={{ display: "grid"', '<div style={{ display: "grid"')], ["A-2", "F-2"]),
 "K5": ("the steady-state metric unguarded", [(STEADY_NEW, STEADY_OLD)], ["A-3", "C-a-1", "C-a-2"]),
 "K6": ("the after-payments card unguarded", [("{_shortPost > 0 ? `$${_shortPost.toLocaleString()}/mo shortfall × 12` : _coveredBy(_shortPost)}, from",
                                             "{`$${(POST_PAYMENTS.monthly - _steadyInc).toLocaleString()}/mo shortfall × 12`}, from")], ["C-a-1", "C-a-3"]),
 "K7": ("the floor always names a shortfall from the portfolio", [("{_shortSteady > 0 ? (<> The <span", "{true ? (<> The <span")], ["C-a-4"]),
 "K8": ("the floor's after-payments sentence always a shortfall", [("{POST_PAYMENTS && (_shortPost > 0 ? (<> From", "{POST_PAYMENTS && (true ? (<> From")], ["C-a-1", "C-a-4"]),
 "K9": ("spouse B counted before B claims", [("const _preAInc = (ssBYM <= retireYM ? spouseBSS : 0) + pension + _stAt(retireYM);", "const _preAInc = spouseBSS + pension + _stAt(retireYM);")], ["A-4", "D-3"]),
 "K10": ("the streams left out of coverage", [("const _preAInc = (ssBYM <= retireYM ? spouseBSS : 0) + pension + _stAt(retireYM);", "const _preAInc = (ssBYM <= retireYM ? spouseBSS : 0) + pension;")], ["A-4", "D-2"]),
 "K11": ("a percentage with no gap", [('value: gapMonths > 0 ? `${((_preAInc / POST_MONTHLY_EARLY) * 100).toFixed(0)}%` : "—",', 'value: `${((_preAInc / POST_MONTHLY_EARLY) * 100).toFixed(0)}%`,')], ["D-4"]),
 "K12": ("an exact match reads as a surplus", [(': "income equals spending";', ': `income exceeds spending by $${(-d).toLocaleString()}/mo`;')], ["C-c-2"]),
 "K13": ("§13's v6.38 note removed", [("<li><strong>The Income tab on a phone, and when income covers spending (v6.38).</strong>", "<li><strong>(removed)</strong>")], ["E-1"]),
 "K14": ("the desktop item's phone sentence removed", [(" On a phone some figures still print over their neighbours:", " On a phone some figures still overlap:")], ["E-2"]),
 "K16": ("the after-payments metric unguarded", [('value: _shortPost > 0 ? `-$${_shortPost.toLocaleString()}` : "$0",', 'value: `-$${_shortPost.toLocaleString()}`,')], ["C-a-1", "C-a-2"]),
 "K17": ("the after-payments income at the last Medicare month", [("const _ppInc = POST_PAYMENTS ? totalIncome + _stAt(POST_PAYMENTS.from.year * 12 + POST_PAYMENTS.from.month) : 0;", "const _ppInc = POST_PAYMENTS ? totalIncome + _stAt(ph3Start) : 0;")], ["A-3b", "C-d-1"]),
 "K18": ("the first counted stream that ends unnamed", [("{_firstEnd && (<> The figures above count", "{false && (<> The figures above count")], ["C-d-2"]),
 "K19": ("the gap card's draw of $0", [('{gapDraw > 0 ? "the model draws it from the portfolio" : "on this tab\'s figures income covers it, so nothing is drawn"}', '{"the model draws it from the portfolio"}')], ["C-a-5"]),
 "K20": ("the first phase's note always a shortfall", [("_p1.note = _p1.income >= _p1.expenses ?", "_p1.note = false ?")], ["C-a-5"]),
 "K21": ("the yearly draw keeps its cents", [("const annualDraw = (exp, inc) => Math.max(0, Math.round((exp - inc) * 12));", "const annualDraw = (exp, inc) => Math.max(0, (exp - inc) * 12);")], ["C-e-1"]),
 "K22": ("the floor's gap of $0 drawn from the portfolio", [("{gapDraw > 0 ? (<>, which the model draws from the portfolio:", "{true ? (<>, which the model draws from the portfolio:")], ["C-a-5"]),
 "K15": ("the floor's first sentence loses its space", [("{_shortSteady > 0 ? (<> The <span", "{_shortSteady > 0 ? (<>The <span")], ["B-3", "B-4"]),
}
PAGEM = {
 "P1": ("the three-card stack rule deleted", ".dc-stack-phone { grid-template-columns: minmax(0, 1fr) !important; }", ["S-5", "S-6"]),
 "P2": ("the stream row's wrap rule deleted", ".dc-streamrow { flex-wrap: wrap; row-gap: 2px; }", ["S-3"]),
 "P3": ("the phase row's two-column rule deleted", ".dc-two-phone { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }", ["S-5", "S-6"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Za-z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM, PAGE); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v638"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v638.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v638.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def ids(out): return [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
def run_src(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t102_income_tab.mjs", "v638"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t102 SUITE \(v638\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        red = ids(out); miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, encoding="utf-8").read() != ORIG:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
def run_page(label):
    desc, rule, want = PAGEM[label]; html = open(PAGE, encoding="utf-8").read()
    if html.count(rule) != 1: return f"{label} TARGET occurs {html.count(rule)}x in the built page (must be 1) — control INVALID"
    mut = os.path.join(ROOT, f"_ctl_{label}.html"); open(mut, "w", encoding="utf-8").write(html.replace(rule, ""))
    try:
        r = subprocess.run(["python3", "t45_phone_layout.py", "v638", mut], cwd=QA, capture_output=True, timeout=5400)
        out = r.stdout.decode("utf-8", "replace"); red = ids(out)
        if not re.search(r"t45 SUITE \(v638\): \d+ passed", out): return f"{label} CRASHED — {desc}: {out[-300:]}"
        miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        os.remove(mut)
labels = sys.argv[1:] or list(M) + list(PAGEM)
out = []
for l in labels: out.append(run_page(l) if l in PAGEM else run_src(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
