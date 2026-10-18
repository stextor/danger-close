#!/usr/bin/env python3
"""controls_v619_calendar.py — negative controls for t82 (docs/SCOPE_D46_MC_CALENDAR_V619.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t82 §K
renders the DOM bundle), t82 runs on the v6.19 leg (§C, §D, §H and §J need qa/app_v618.mjs and ./v618.jsx beside it), then ./v619.jsx,
qa/app_v619.mjs and qa/dom_v619.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v618 -> v619 run folder:  python3 qa/tools/controls_v619_calendar.py [C1 ...]
    C1  the old label formula back at one site (runMonteCarlo's planned path) ...................... B-1
    C2  runExtendedMC's retirement quarter back to (retireYear − asOfYear) × 4 ....................... D-1
    C3  spouse A's claim paid from one quarter late in runExtendedMC ................................. D-1
    C4  round(months / 3) back in buildRetireOptions ................................................. A-2, I-1
    C5  the first-quarter share removed (every quarter counted in full) ............................. A-1, F-1, I-1
    C6  the mid-quarter claim share removed (a claim quarter paid in full) .......................... A-1, G-1, G-2
    C7  2026 typed back into the current-age line ..................................................... B-2, J-3
    C8  the forced years keyed by year-from-start again ................................................ E-2
    C9  the home-move cash added at quarter 0 for a plan already retired (runMonteCarlo's planned path)  L-2
    C10 the bonus back on q % 4 === 3 in runMonteCarlo .................................................. F-1
    C0  unmutated ........................................................................................ t82 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v619.jsx"); T82 = os.path.join(QA, "t82_mc_calendar.mjs")
MOD = os.path.join(QA, "app_v619.mjs"); DOM = os.path.join(QA, "dom_v619.cjs")
for p in (SRC, T82, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v619.jsx"), os.path.join(QA, "app_v618.mjs"),
          os.path.join(ROOT, "v618.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v618 -> v619 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the old label formula at one site", [("    const { calYear, calMonth } = mcQuarterDate(_tlM, q);\n    const _fq = mcQuarterFrac(_tlM, q);\n",
        "    const calYear = _asOfYr + Math.floor((q + 1) / 4); const calMonth = String(((q + 1) % 4) * 3 + 3).padStart(2, \"0\");\n    const _fq = mcQuarterFrac(_tlM, q);\n")], ["B-1"]),
 "C2": ("runExtendedMC's retirement quarter from January", [("  const retireQ = mcQuarterOf(_tl, { year: retireYear, month: 1 });\n",
        "  const retireQ = (retireYear - _tl.asOfYear) * 4;\n")], ["D-1"]),
 "C3": ("spouse A's claim a quarter late (30-year engine)", [("        const ssA_q = _ssA * mcPaidShare(_tl, q, _tl.ssA_date);",
        "        const ssA_q = _ssA * (q >= mcQuarterOf(_tl, _tl.ssA_date) + 1 ? 1 : 0);")], ["D-1"]),
 "C4": ("round(months / 3) in buildRetireOptions", [("    const retireQuarter = mcQuarterOf(tl, retireDate);\n",
        "    const retireQuarter = Math.round(((retireDate.year - tl.asOf.year) * 12 + (retireDate.month - tl.asOf.month)) / 3);\n")], ["A-2", "I-1"]),
 "C5": ("the first-quarter share removed", [("function mcQuarterFrac(tl, q) { return q === 0 ? (3 - (((tl.asOf.month || 1) - 1) % 3)) / 3 : 1; }",
        "function mcQuarterFrac(tl, q) { return 1; }")], ["A-1", "F-1", "I-1"]),
 "C6": ("the mid-quarter claim share removed", [("  return (3 - Math.max(first, at)) / (3 - first);\n", "  return 1;\n")], ["A-1", "G-1", "G-2"]),
 "C7": ("2026 back in the current-age line", [("    const _curAgeA = _tl.asOfYear - _tl.dobA.year, _curAgeB = _tl.asOfYear - _tl.dobB.year;",
        "    const _curAgeA = 2026 - _tl.dobA.year, _curAgeB = 2026 - _tl.dobB.year;")], ["B-2", "J-3"]),
 "C8": ("forced years by year-from-start", [("      const _forced = forcedScenarioYears[calYear - _tl.asOfYear];\n",
        "      const _forced = forcedScenarioYears[Math.floor(q / 4)];\n")], ["E-2"]),
 "C9": ("home-move cash for a plan already retired", [("    if (q === config.retireQuarter) planned += homeMoveCash();   // v6.17 (D-38): the My Data field, was a fixed $130,000\n",
        "    if (q === Math.max(0, config.retireQuarter)) planned += homeMoveCash();   // v6.17 (D-38): the My Data field, was a fixed $130,000\n")], ["L-2"]),
 "C10": ("the bonus on q % 4 === 3", [("  const _bonusAtQ = (q) => (_bonusAnnual > 0 && mcQuarterDate(PLAN_TIMELINE, q).yearStart && q < config.retireQuarter) ? _bonusAnnual : 0;",
        "  const _bonusAtQ = (q) => (_bonusAnnual > 0 && q % 4 === 3 && q < config.retireQuarter) ? _bonusAnnual : 0;")], ["F-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-LP]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T82, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v619"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v619.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v619.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t82_mc_calendar.mjs", "v619"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t82 SUITE \(v619\): (\d+) passed, (\d+) failed", out)
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
