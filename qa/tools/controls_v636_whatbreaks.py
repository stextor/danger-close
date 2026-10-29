#!/usr/bin/env python3
"""controls_v636_whatbreaks.py — negative controls for t100 (docs/SCOPE_D66_WHATBREAKS_TAX.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file; a
source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t100 runs on the
v6.36 leg, then ./v636.jsx, ./METHODOLOGY.md, qa/app_v636.mjs and qa/dom_v636.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v635 -> v636 run folder:  python3 qa/tools/controls_v636_whatbreaks.py [K1 ...]
  the estimate
    K1  What Breaks back on Engine A's lifetime tax + IRMAA (v6.35's block) .......................... A-3, A-5, A-6, A-7, C-5, C-8
    K2  the helper drops the IRMAA part (sums the tax rows only) ..................................... B-2, B-3
    K3  the helper divides by one year too many ....................................................... B-2, B-4
    K4  the helper starts two years late (skips the retirement year and the next) .................. B-2
    K5  What Breaks hands the schedule QCD $0 instead of the plan's (DB-2 (b)) ...................... A-3
    K6  What Breaks hands the schedule a fixed $70,000 instead of the slider ......................... A-3
  what must not move
    K7  Engine A perturbed (its growth +0.1%) ........................................................ D-1
    K8  the schedule perturbed (its surcharges left out of the total) ................................ D-2, B-2
  copy
    K9  What Breaks' basis line back to the Roth engine's ............................................ C-6
    K10 What Breaks' footer back to the Roth engine's ................................................ C-7
    K11 the Field Manual's What Breaks entry back to v6.35's ......................................... C-1
    K12 the Field Manual's Social Security cut exception kept ....................................... C-2
    K13 the Field Manual's v6.36 note removed ........................................................ C-3
    K14 METHODOLOGY's v6.36 section removed .......................................................... C-9
    K15 the helper applies the trust-fund cut (scaled by ssDepletionFactor) ........................... C-10
    K16 the Roth comparator's "same tax engine as the Taxes tab" restored ............................ A-8
    C0  unmutated ...................................................................................... t100 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v636.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T100 = os.path.join(QA, "t100_whatbreaks_tax.mjs")
MOD = os.path.join(QA, "app_v636.mjs"); DOM = os.path.join(QA, "dom_v636.cjs")
for p in (SRC, METH, T100, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v636.jsx"), os.path.join(QA, "shim.txt"),
          os.path.join(QA, "app_v635.mjs"), os.path.join(QA, "dom_v635.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v635 -> v636 run folder copy (missing {p})")
S = lambda pairs: [(SRC, a, b) for a, b in pairs]
NEWWB = """            const _wbT = whatBreaksAnnualTax(_retireYr, _horizonYr, { rothAmount, qcdAnnual, taxYield, scenarioPreset });
            if (_wbT && Number.isFinite(_wbT.annual)) estAnnualTax = _wbT.annual;"""
OLDWB = """            const _pTax = {
              single: !!_tlW.single, asOfYr: _tlW.asOfYear, retireYr: _retireYr, horizonYr: _horizonYr,
              ladderEnd: _tlW.rothLadderEnd, dobAYr: _dobAYr, dobBYr: _dobBYr, deathYr1: _deathYr1W,
              ssA: _ssA, ssB: _ssB, ssAYr: _ssAYr, ssAMo: _ssAMo, ssBYr: _ssBYr, ssBMo: _ssBMo,
              pen: _pen, penOwner: getPensionOwner(), stateRate: _tlW.stateTaxRate || 0, stateCode: PORTFOLIO.stateCode || null,
              ...retireStartBalances(_retireYr),
              ladderEndA: PLAN_TIMELINE.rothLadderEndA, ladderEndB: PLAN_TIMELINE.rothLadderEndB,
              survivor: PLAN_TIMELINE.single ? "A" : ((PLAN_TIMELINE.dobA.year + PLAN_TIMELINE.lifeExpA) >= (PLAN_TIMELINE.dobB.year + PLAN_TIMELINE.lifeExpB) ? "A" : "B"),
              taxableInit: taxableInitAll(), workMagi: workMagi(),
              taxYieldPct: taxYield, currentConv: rothAmount,
              ordDrawByYr: withdrawalPlanSeries({ retireYear: _retireYr, rothAmount, scenarioPreset }).ordDrawByYr,
            };
            const _cT = runRothStrategies(_pTax).find(r => r.key === "current");
            if (_cT && Number.isFinite(_cT.totTaxToday)) estAnnualTax = (_cT.totTaxToday + (Number.isFinite(_cT.totIrmaaToday) ? _cT.totIrmaaToday : 0)) / planYears;"""
FMNEW = "an annual average of the tax the Monte Carlo pays — the Taxes tab’s income tax, Roth-conversion taxes included, and the IRMAA tab’s surcharges, at the current conversion, QCD and dividend settings — the first two years’ premiums"
FMOLD = "an annual average from the Roth tab’s strategy engine, including Roth-conversion taxes and, from v6.31, IRMAA surcharges — the first two years’ premiums"
NOTE = "<li><strong>What Breaks pays the Monte Carlo’s tax (v6.36).</strong>"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("What Breaks back on Engine A's lifetime tax + IRMAA", S([(NEWWB, OLDWB)]), ["A-3", "A-5", "A-6", "A-7", "C-5", "C-8"]),
 "K2": ("the helper drops the IRMAA part", S([("    total += mcTaxForYear(schedule, y);", "    total += schedule.taxByYr[y] || 0;"),
                                               ("tax += schedule.taxByYr[y] || 0; irmaa += schedule.irmaaByYr[y] || 0; years++;", "tax += schedule.taxByYr[y] || 0; irmaa += 0; years++;")]), ["B-2", "B-3"]),
 "K3": ("the helper divides by one year too many", S([("annual: years > 0 ? total / years : 0,", "annual: years > 0 ? total / (years + 1) : 0,")]), ["B-2", "B-4"]),
 "K4": ("the helper starts two years late", S([("  for (let y = retireYear; y <= horizonYr; y++) {\n    total += mcTaxForYear", "  for (let y = retireYear + 2; y <= horizonYr; y++) {\n    total += mcTaxForYear")]), ["B-2"]),
 "K5": ("What Breaks hands the schedule QCD $0", S([("whatBreaksAnnualTax(_retireYr, _horizonYr, { rothAmount, qcdAnnual, taxYield, scenarioPreset })",
                                                    "whatBreaksAnnualTax(_retireYr, _horizonYr, { rothAmount, qcdAnnual: 0, taxYield, scenarioPreset })")]), ["A-3"]),
 "K6": ("What Breaks hands the schedule a fixed $70,000", S([("whatBreaksAnnualTax(_retireYr, _horizonYr, { rothAmount, qcdAnnual, taxYield, scenarioPreset })",
                                                             "whatBreaksAnnualTax(_retireYr, _horizonYr, { rothAmount: 70000, qcdAnnual, taxYield, scenarioPreset })")]), ["A-3"]),
 "K7": ("Engine A perturbed (growth +0.1%)", S([("  const GROWTH = BASE_GROWTH;", "  const GROWTH = BASE_GROWTH + 0.001;")]), ["D-1"]),
 "K8": ("the schedule's surcharges left out of its total", S([("  for (const y in taxByYr) byYr[y] = taxByYr[y] + (irmaaByYr[y] || 0);", "  for (const y in taxByYr) byYr[y] = taxByYr[y];")]), ["D-2", "B-2"]),
 "K9": ("What Breaks' basis line back to the Roth engine's", S([("K/yr, the average of what the Monte Carlo pays at your current settings: the Taxes tab's income tax, Roth-conversion taxes included, and the IRMAA tab's surcharges — ",
                                                                 "K/yr average from the Roth tab's strategy engine, incl. Roth-conversion taxes and IRMAA surcharges — ")]), ["C-6"]),
 "K10": ("What Breaks' footer back to the Roth engine's", S([("Its taxes are the Monte Carlo's — the Taxes tab's tax and the IRMAA tab's surcharges — averaged over the plan's years, and",
                                                            "Its taxes are a yearly average from the Roth tab's strategy engine, and")]), ["C-7"]),
 "K11": ("the Field Manual's What Breaks entry back to v6.35's", S([(FMNEW, FMOLD)]), ["C-1"]),
 "K12": ("the Field Manual's Social Security cut exception kept", S([("and so does What Breaks, its tax estimate included (from v6.36).",
                                                                     "and so does What Breaks, except for the tax estimate it takes from the Roth engine.")]), ["C-2"]),
 "K13": ("the Field Manual's v6.36 note removed", S([(NOTE, "<li><strong>(removed)</strong>")]), ["C-3"]),
 "K14": ("METHODOLOGY's v6.36 section removed", [(METH, "## What Breaks pays the Monte Carlo's tax (v6.36)", "## (removed)")], ["C-9"]),
 "K15": ("the helper applies the trust-fund cut", S([("annual: years > 0 ? total / years : 0,", "annual: years > 0 ? total / years * ssDepletionFactor(retireYear + 12) : 0,")]), ["C-10"]),
 "K16": ("the Roth comparator's old engine sentence restored", S([("(the same tax rules as the Taxes tab: brackets,", "(same tax engine as the Taxes tab: brackets,")]), ["A-8"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = (SRC, METH)
ORIG = {p: open(p, "rb").read() for p in FILES}
WATCH = (SRC, METH, T100, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v636"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v636.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v636.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
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
        r = subprocess.run(["node", "t100_whatbreaks_tax.mjs", "v636"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t100 SUITE \(v636\): (\d+) passed, (\d+) failed", out)
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
