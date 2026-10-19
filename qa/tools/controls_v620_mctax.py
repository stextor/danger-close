#!/usr/bin/env python3
"""controls_v620_mctax.py — negative controls for t83 (docs/SCOPE_D40_MC_TAX_V620.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t83 §I
renders the DOM bundle), t83 runs on the v6.20 leg (§H and §R need qa/app_v619.mjs and ./v619.jsx beside it), then ./v620.jsx,
qa/app_v620.mjs and qa/dom_v620.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v619 -> v620 run folder:  python3 qa/tools/controls_v620_mctax.py [C1 ...]
    C1  the flat drag restored at one site (runMonteCarlo's planned path) ............................ B-1, E-3
    C2  the tax not inflated (mcTaxCharge drops the inflator) ........................................ B-1, B-4
    C3  the one-time rows not inflated (mcOneTimeCharge drops the inflator) .......................... C-1, R-4
    C4  the one-time read back to the quarter's last month ........................................... C-1, D-1
    C5  the monthly read back to the quarter's last month ............................................ D-1, D-3
    C6  the tax inputs ignored by the engines (taxInputs hard-coded to the defaults) ................... G-1
    C7  the slider ignored by the app (the 6-year runs' schedule hard-coded to $70K) ................... I-4
    C8  the tail charged as zero (no tax after the schedule's last row) ................................ F-1, F-3
    C9  the schedule takes another tax (federal only — not the Taxes tab's totalTax) ..................... A-1, B-3
    C10 the tax put in pre-retirement quarters by the quarter read ...................................... F-6
    C11 one 30-year run in the app called without the schedule (run C) ................................... E-6
    C12 the slider dropped from the 6-year runs' effect dependencies ..................................... E-7, I-4
    C0  unmutated ........................................................................................ t83 passes
  The scope's §3 named one more mutation, "the schedule taken from Engine A instead of Engine B". Engine A needs a hand-built input
  object (the What-Breaks call site's ~20 fields), so a one-line mutation cannot express it; C9 plants the same defect class — a schedule
  that is not the Taxes tab's row — and A-1 compares every year with Engine B's row, so any other source fails it.
  C10 first named B-2 and F-2 and MISSED: the engines gate the charge on `retired` as well, so a schedule leaking into pre-retirement
  quarters changes no engine output (an equivalent mutant — found by the release's independent review). t83 F-6 now checks the quarter
  read itself. C11 and C12 were added on the same review: nothing checked the app's 30-year wiring (t83 E-6, E-7).
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v620.jsx"); T83 = os.path.join(QA, "t83_mc_tax.mjs")
MOD = os.path.join(QA, "app_v620.mjs"); DOM = os.path.join(QA, "dom_v620.cjs")
for p in (SRC, T83, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v620.jsx"), os.path.join(QA, "app_v619.mjs"),
          os.path.join(ROOT, "v619.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v619 -> v620 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the flat drag at one site", [("      planned -= mcTaxCharge(_qs, q, plannedInfl, _fq); // v6.20 (D-40): the Taxes tab's tax for this year, grown with inflation\n",
        "      planned -= 4000 * _fq; // the v6.19 drag\n")], ["B-1", "E-3"]),
 "C2": ("the tax not inflated", [("function mcTaxCharge(qs, q, infl, fq) { return qs.tax[q] * infl * fq; }",
        "function mcTaxCharge(qs, q, infl, fq) { return qs.tax[q] * fq; }")], ["B-1", "B-4"]),
 "C3": ("the one-time rows not inflated", [("function mcOneTimeCharge(qs, q, infl) { return qs.oneTime[q] * infl; }",
        "function mcOneTimeCharge(qs, q, infl) { return qs.oneTime[q]; }")], ["C-1", "R-4"]),
 "C4": ("the one-time read at the quarter's last month", [("      sumO += getOneTimeExpenses(d);\n",
        "      if (m === firstM + 2) sumO += getOneTimeExpenses(d);\n")], ["C-1", "D-1"]),
 "C5": ("the monthly read at the quarter's last month", [("    monthly[q] = sumM / n;\n",
        "    monthly[q] = getMonthlyExpense(`${yr}-${String(firstM + 2).padStart(2, \"0\")}`);\n")], ["D-1", "D-3"]),
 "C6": ("the engines ignore taxInputs", [("mcIncomeTaxSchedule(retireYear, (opts && opts.taxInputs) || {});",
        "mcIncomeTaxSchedule(retireYear, {});")], ["G-1"]),
 "C7": ("the app's 6-year runs ignore the slider", [("        const taxSchedule = mcIncomeTaxSchedule(yr, { rothAmount, qcdAnnual, taxYield, scenarioPreset });",
        "        const taxSchedule = mcIncomeTaxSchedule(yr, { rothAmount: 70000, qcdAnnual, taxYield, scenarioPreset });")], ["I-4"]),
 "C8": ("the tail charged as zero", [("  return sched.lastYr != null && yr > sched.lastYr ? sched.last : 0;\n", "  return 0;\n")], ["F-1", "F-3"]),
 "C9": ("federal tax only in the schedule", [("  for (const r of rows) byYr[r.yr] = r.totalTax;\n", "  for (const r of rows) byYr[r.yr] = r.fedTax;\n")], ["A-1", "B-3"]),
 "C10": ("the tax put in pre-retirement quarters", [("    tax[q] = q >= retireQ ? mcTaxForYear(sched, yr) / 4 : 0;\n",
        "    tax[q] = mcTaxForYear(sched, yr) / 4;\n")], ["F-6"]),
 "C11": ("run C called without the schedule", [("          ? { ..._tx, ltcShocks: false, sustainedLTC: true, autoReplace: true, mortality: true, stochasticMortality: mcLongevity }",
        "          ? { ltcShocks: false, sustainedLTC: true, autoReplace: true, mortality: true, stochasticMortality: mcLongevity }")], ["E-6"]),
 "C12": ("the slider out of the 6-year effect's dependencies", [("  }, [scenarioPreset, ssCut, rothAmount, qcdAnnual, taxYield]);",
        "  }, [scenarioPreset, ssCut, qcdAnnual, taxYield]);")], ["E-7", "I-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-JPR]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T83, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v620"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v620.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v620.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t83_mc_tax.mjs", "v620"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t83 SUITE \(v620\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
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
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
