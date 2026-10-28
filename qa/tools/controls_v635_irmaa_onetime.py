#!/usr/bin/env python3
"""controls_v635_irmaa_onetime.py — negative controls for t98 (docs/SCOPE_D62_D65_D44_V635.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file; a
source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t98 runs on the
v6.35 leg, then ./v635.jsx, ./METHODOLOGY.md, qa/app_v635.mjs and qa/dom_v635.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v634 -> v635 run folder:  python3 qa/tools/controls_v635_irmaa_onetime.py [K1 ...]
  D-62 · STAY UNDER IRMAA
    K1  irmaaCap back on v6.34's solve (5-pass fixed point, no sale gain, rounded) ............... A-1a, A-1b, A-1f
    K2  the ACA strategy's fixed point in place of the search (8 passes, the estimate) .......... A-1b
        (with the estimate now exact, the cycle settles on its low phase: under the cliff, but not the largest conversion — A-1b, not A-1e)
    K3  one dollar over the acceptable answer ..................................................... A-1b
    K4  the estimate without the ACA-premium sale's gain ......................................... A-1c
    K5  the estimate ignoring withholding (the whole bill sold) ................................... A-1c
    K6  the margin removed ........................................................................ A-0b, A-1a
    K7  the margin doubled (an over-cautious solve) ............................................... A-0b, A-1b
    K8  the ACA strategy handed the uncapped subsidy .............................................. A-2b
    K27 the estimate's ACA contraction back to three subsidy evaluations ......................... A-1a, A-1c
  D-65 · the last working years
    K9  one P builder (What Breaks') without workMagi .............................................. B-6
    K10 Engine C without its working rows .......................................................... B-2d, B-2f, B-4, B-5
    K11 Engine C's rows prepended when the field is blank .......................................... B-1
    K12 the figure not carried to a future lookback year ........................................... B-2e
    K28 the figure carried twice ..................................................................... B-2e
    K13 a past lookback year deflated ............................................................... B-2b
    K14 Engine A's lookback not seeded ............................................................. B-2, B-2b, B-4
    K15 Export Backup drops the field ............................................................... B-7b
    K16 the IRMAA tab's sentence left as the blank one ............................................. B-8d
    K29 the Monte Carlo tab's clause left as the blank one ......................................... B-8e
    K30 What Breaks' clause left as the blank one ................................................... B-8e
    K31 the flag ignores who is on Medicare ......................................................... B-9e
    K17 the flag shown whatever the salaries ....................................................... B-9, B-9d
  D-44 · one-time rows before retirement
    K18 the helper counts rows before the as-of month ............................................. C-2
    K19 the helper counts the retirement year ..................................................... C-2b
    K20 the subtraction applied after the carry (today's amount, not carried) ..................... C-1b, C-1d
        (the example's $21,000 after-tax part is spent either way; the carry shows in the overflow and in a row smaller than the pool)
    K21 the money taken from the pool's Traditional part too ...................................... C-1c
    K22 the overflow taken from bucket 1 alone ..................................................... C-1b
    K23 Backtest alone left unreduced ............................................................... C-6d
    K24 What Breaks alone left unreduced ............................................................ C-6e
  copy
    K25 METHODOLOGY's v6.35 section removed ......................................................... B-8i
    K26 the Field Manual's v6.35 entry removed ....................................................... B-8g
    C0  unmutated ................................................................................... t98 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v635.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T98 = os.path.join(QA, "t98_irmaa_onetime.mjs")
MOD = os.path.join(QA, "app_v635.mjs"); DOM = os.path.join(QA, "dom_v635.cjs")
for p in (SRC, METH, T98, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v635.jsx"), os.path.join(QA, "shim.txt"),
          os.path.join(QA, "app_v634.mjs"), os.path.join(QA, "dom_v634.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v634 -> v635 run folder copy (missing {p})")
S = lambda pairs: [(SRC, a, b) for a, b in pairs]
BISECT = """          let _lo = 0, _hi = Math.floor(headroomTrad);
          if (!_ok(0)) conv = 0;
          else if (_ok(_hi)) conv = _hi;
          else {
            while (_hi - _lo > 1) { const _mid = Math.floor((_lo + _hi) / 2); if (_ok(_mid)) _lo = _mid; else _hi = _mid; }
            conv = _lo;
          }"""
OLD634 = """          let _lo = 0, _hi = 0;
          for (let i = 0; i < 5; i++) {
            const ssT = taxableSS86(ss, base + conv + div_y, effSingle);
            conv = Math.max(0, Math.min(thr - (base + ssT + div_y), headroomTrad));
          }
          conv = Math.round(conv);"""
FIXPT = """          let _lo = 0, _hi = 0;
          for (let _i = 0; _i < 8; _i++) {
            const gC = _gainEstLive ? _estSaleGain(conv, Infinity) : 0;
            const ssT = taxableSS86(ss, base + conv + div_y, effSingle);
            conv = Math.max(0, Math.min(thr - (base + ssT + div_y + gC) - IRMAA_SOLVER_MARGIN, headroomTrad));
          }
          conv = Math.floor(conv);"""
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("irmaaCap back on v6.34's solve", S([(BISECT, OLD634)]), ["A-1a", "A-1b", "A-1f"]),
 "K2": ("the ACA strategy's fixed point in place of the search", S([(BISECT, FIXPT)]), ["A-1b"]),
 "K3": ("one dollar over the acceptable answer", S([("            conv = _lo;\n          }\n          // The test seam", "            conv = _hi;\n          }\n          // The test seam")]), ["A-1b"]),
 "K4": ("the estimate without the ACA-premium sale's gain", S([("if (baselineSubByYr && acaHeads(yr, widowed) > 0) {", "if (baselineSubByYr && acaHeads(yr, widowed) > 0 && acaCap !== Infinity) {")]), ["A-1c"]),
 "K5": ("the estimate ignoring withholding", S([('const _dueSaleC = P.convTaxFunding === "withhold" ? Math.max(0, dueC - c) : dueC;', "const _dueSaleC = dueC;")]), ["A-1c"]),
 "K6": ("the margin removed", S([("const IRMAA_SOLVER_MARGIN = 500;", "const IRMAA_SOLVER_MARGIN = 0;")]), ["A-0b", "A-1a"]),
 "K7": ("the margin doubled", S([("const IRMAA_SOLVER_MARGIN = 500;", "const IRMAA_SOLVER_MARGIN = 1000;")]), ["A-0b", "A-1b"]),
 "K8": ("the ACA strategy handed the uncapped subsidy", S([("const gC = _estSaleGain(conv, cliff - ACA_CONSTS.solverMargin);", "const gC = _estSaleGain(conv, Infinity);")]), ["A-2b"]),
 "K9": ("What Breaks' P builder without workMagi", S([("workMagi: workMagi(),   // v6.35 (D-65): the last working years, for the IRMAA lookback\n              taxYieldPct: taxYield, currentConv: rothAmount,\n              ordDrawByYr: withdrawalPlanSeries({ retireYear: _retireYr,",
        "   // v6.35 (D-65): the last working years, for the IRMAA lookback\n              taxYieldPct: taxYield, currentConv: rothAmount,\n              ordDrawByYr: withdrawalPlanSeries({ retireYear: _retireYr,")]), ["B-6"]),
 "K10": ("Engine C without its working rows", S([("  if (workMagi() > 0) {\n    const _wRows = [];", "  if (false) {\n    const _wRows = [];")]), ["B-2d", "B-2f", "B-4", "B-5"]),
 "K11": ("Engine C's rows prepended when blank", S([("  if (workMagi() > 0) {\n    const _wRows = [];", "  if (true) {\n    const _wRows = [];")]), ["B-1"]),
 "K12": ("the figure not carried", S([("return m > 0 && taxYr > asOfYr ? m * planDollarFactor(taxYr, asOfYr) : m;", "return m;")]), ["B-2e"]),
 "K13": ("a past lookback year deflated", S([("return m > 0 && taxYr > asOfYr ? m * planDollarFactor(taxYr, asOfYr) : m;", "return m > 0 ? m * planDollarFactor(taxYr, asOfYr) : m;")]), ["B-2b"]),
 "K14": ("Engine A's lookback not seeded", S([("    if (workMagi({ workMagi: P.workMagi }) > 0) {", "    if (false) {")]), ["B-2", "B-2b", "B-4"]),
 "K15": ("Export Backup drops the field", S([("        portfolio: buildPortfolio(),\n        expenses: buildExpenses(),\n        masterPrompt: genAIContext(),",
         "        portfolio: (() => { const _p = buildPortfolio(); delete _p.workMagi; return _p; })(),\n        expenses: buildExpenses(),\n        masterPrompt: genAIContext(),")]), ["B-7b"]),
 "K16": ("the IRMAA tab's sentence left as the blank one", S([("{workMagi() > 0\n                  ? (rows.filter(r => r.working)", "{false\n                  ? (rows.filter(r => r.working)")]), ["B-8d"]),
 "K17": ("the flag shown whatever the salaries", S([("  return irmaaTierFor(sum * k, u, py) > 0 ? { sum, thr:", "  return true ? { sum, thr:")]), ["B-9", "B-9d"]),
 "K18": ("the helper counts rows before the as-of month", S([("let y = tl.asOf.year, m = tl.asOf.month || 1, sum = 0;", "let y = tl.asOf.year, m = 1, sum = 0;")]), ["C-2"]),
 "K19": ("the helper counts the retirement year", S([("while (y < Number(retireYr)) {", "while (y <= Number(retireYr)) {")]), ["C-2b"]),
 "K20": ("the subtraction after the carry", S([("          { let _pre = preRetireOneTime(retireYear);", "          { let _pre = preRetireOneTime(retireYear) / planDollarFactor(retireYear, _tlW.asOfYear);")]), ["C-1b", "C-1d"]),
 "K21": ("the pool's Traditional part spent too", S([("              const _fromGain = Math.min(_pre, taxGainPool);", "              const _fromGain = Math.min(_pre, taxGainPool); taxOrd = Math.max(0, taxOrd - _pre);")]), ["C-1c"]),
 "K22": ("the overflow from bucket 1 alone", S([("if (_pre > 0 && _bk > 0) { const _k = Math.max(0, _bk - _pre) / _bk; b1 *= _k; b2 *= _k; b3 *= _k; b4 *= _k; }", "if (_pre > 0 && _bk > 0) { b1 = Math.max(0, b1 - _pre); }")]), ["C-1b"]),
 "K23": ("Backtest alone left unreduced", S([("          // Starting liquid portfolio (household) and bucket weights\n          const startBal = Math.max(0, PORTFOLIO.household - preRetireOneTime(retireYear));",
         "          // Starting liquid portfolio (household) and bucket weights\n          const startBal = PORTFOLIO.household;")]), ["C-6d"]),
 "K24": ("What Breaks alone left unreduced", S([("          const planYears = _horizonYr - _retireYr + 1;\n          const startBal = Math.max(0, PORTFOLIO.household - preRetireOneTime(retireYear));",
         "          const planYears = _horizonYr - _retireYr + 1;\n          const startBal = PORTFOLIO.household;")]), ["C-6e"]),
 "K25": ("METHODOLOGY's v6.35 section removed", [(METH, "## STAY UNDER IRMAA, the last working years, and one-time rows before retirement (v6.35)", "## (removed)")], ["B-8i"]),
 "K27": ("the estimate's ACA contraction back to three evaluations", S([("for (let _i = 0; _i < (acaCap === Infinity ? 4 : 3); _i++) {", "for (let _i = 0; _i < 3; _i++) {")]), ["A-1a", "A-1c"]),
 "K28": ("the figure carried twice", S([("return m > 0 && taxYr > asOfYr ? m * planDollarFactor(taxYr, asOfYr) : m;", "return m > 0 && taxYr > asOfYr ? m * planDollarFactor(taxYr, asOfYr) * planDollarFactor(taxYr, asOfYr) : m;")]), ["B-2e"]),
 "K29": ("the Monte Carlo tab's clause left as the blank one", S([("{workMagi() > 0 ? \"(the first two years' premiums included", "{false ? \"(the first two years' premiums included")]), ["B-8e"]),
 "K30": ("What Breaks' clause left as the blank one", S([("{workMagi() > 0 ? \"the first two years' premiums from the working-year MAGI", "{false ? \"the first two years' premiums from the working-year MAGI")]), ["B-8e"]),
 "K31": ("the flag ignores who is on Medicare", S([("  if (workMagi(p) > 0 || !onMedicare) return null;", "  if (workMagi(p) > 0) return null;")]), ["B-9e"]),
 "K26": ("the Field Manual's v6.35 entry removed", S([("one-time costs before retirement (v6.35).</strong>", "one-time costs before retirement.</strong>")]), ["B-8g"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = (SRC, METH)
ORIG = {p: open(p, "rb").read() for p in FILES}
WATCH = (SRC, METH, T98, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v635"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v635.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v635.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if open(SRC, "rb").read() != ORIG[SRC]: build()
        r = subprocess.run(["node", "t98_irmaa_onetime.mjs", "v635"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t98 SUITE \(v635\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for p in (METH,):
            if open(p, "rb").read() != ORIG[p]: open(p, "wb").write(ORIG[p])
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
