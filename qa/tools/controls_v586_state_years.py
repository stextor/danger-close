#!/usr/bin/env python3
"""controls_v586_state_years.py — negative controls for t51 (docs/SCOPE_D18_STATE_FIGURES.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
run folder's ./v586.jsx; the mutant is compiled with qa/mk_testable.sh AND the DOM bundle is rebuilt from qa/dom_entry_v586.jsx
(t51 reads the DOM bundle, not the module), t51 runs, then ./v586.jsx, ./qa/app_v586.mjs and ./qa/dom_v586.cjs are RESTORED
(source by bytes, both bundles by rebuilding) and hash-checked after every run.
    C1  Maine's cap back to $48,216 ................................................... V-ME E-ME2 E-ME4 E-ME6
    C2  Louisiana's exclusion back to $6,000 .......................................... V-LA E-LA1 E-LA3 E-LA4 E-LA5
    C3  one row (Alabama) loses its `years` ........................................... X-1 X-7
    C4  a year runs ahead of the model (Minnesota 2027) ............................... X-2 X-7
    C5  a stale key: Connecticut dates an `excl65` it does not carry ................... X-3
    C6  a stray `years` on a row with no dollar figure (Arizona) ....................... X-4
    C7  the display's blanket "2026 approx" label comes back ........................... D-2
    C8  the display drops the dated-figure suffix ..................................... D-1 D-4
    C9  the helper mislabels the income test ........................................... D-1 D-4
    C10 South Carolina's note back to "$10K ... under 65" .............................. V-SC2
    C11 Maine's phase-out threshold guessed forward ($130,000 single) .................. V-ME2 E-ME4
    C12 New Jersey's bands made exclusive at the top .................................. E-NJ1
    C13 the Field Manual's sources cell back to "2026 approximations" .................. D-6
    C14 Louisiana's note drifts into the income-limited selector ....................... X-8
    C0  unmutated ....................................................................... t51 passes
USAGE  from the ROOT of a v586 run folder (never one a suite run is using):  python3 qa/tools/controls_v586_state_years.py [C1 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v586.jsx")
MOD, DOM = os.path.join(QA, "app_v586.mjs"), os.path.join(QA, "dom_v586.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t51_state_figure_years.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v586.jsx"))
if not all(os.path.exists(p) for p in need):
    sys.exit("run from the ROOT of a v586 run folder (needs ./v586.jsx, qa/app_v586.mjs, qa/dom_v586.cjs, qa/dom_entry_v586.jsx, qa/t51_state_figure_years.mjs, qa/mk_testable.sh)")
M = {
    "C0": ("unmutated", None, None, []),
    "C1": ("Maine's cap back to $48,216", "excl65: 49824, ssOffset: true,", "excl65: 48216, ssOffset: true,", ["V-ME", "E-ME2", "E-ME4", "E-ME6"]),
    "C2": ("Louisiana back to $6,000", "excl65: 12324, note:", "excl65: 6000, note:", ["V-LA", "E-LA1", "E-LA3", "E-LA4", "E-LA5"]),
    "C3": ("Alabama loses its years", 'AL: { name: "Alabama", years: { excl65: 2026 }, ', 'AL: { name: "Alabama", ', ["X-1", "X-7"]),
    "C4": ("Minnesota dated 2027", 'MN: { name: "Minnesota", years: { ssRule: 2026 }, ', 'MN: { name: "Minnesota", years: { ssRule: 2027 }, ', ["X-2", "X-7"]),
    "C5": ("Connecticut dates an absent excl65", 'CT: { name: "Connecticut", years: { exclTest: 2026, ssRule: 2026 }, ',
           'CT: { name: "Connecticut", years: { excl65: 2026, exclTest: 2026, ssRule: 2026 }, ', ["X-3"]),
    "C6": ("stray years on Arizona", 'AZ: { name: "Arizona", ', 'AZ: { name: "Arizona", years: { excl65: 2026 }, ', ["X-4"]),
    "C7": ("blanket label back", ">Model: {(STATE_RULES[stateCode].rate * 100)", ">Model (2026 approx): {(STATE_RULES[stateCode].rate * 100)", ["D-2"]),
    "C8": ("display drops the years suffix",
           '{stateFigureYears(STATE_RULES[stateCode]) ? ` Dollar figures by tax year: ${stateFigureYears(STATE_RULES[stateCode])}.` : ""}', '{""}', ["D-1", "D-4"]),
    "C9": ("helper mislabels the income test", 'exclTest: "income test",', 'exclTest: "phase-out",', ["D-1", "D-4"]),
    "C10": ("SC note back to $10K under 65", "$15K 65+ deduction, which absorbs the $10K retirement deduction at 65+ (under 65 the retirement deduction is $3K)",
            "$15K 65+ deduction (or $10K retirement deduction under 65)", ["V-SC2"]),
    "C11": ("Maine threshold guessed forward", 'kind: "phaseout", base: "agi", threshold: { single: 125000, joint: 250000 }',
            'kind: "phaseout", base: "agi", threshold: { single: 130000, joint: 250000 }', ["V-ME2", "E-ME4"]),
    "C12": ("New Jersey exclusive at the top", 'exclTest: { kind: "bands", base: "agiExSS", unit: "household", rows: {',
            'exclTest: { kind: "bands", base: "agiExSS", unit: "household", cmp: "lt", rows: {', ["E-NJ1"]),
    "C13": ("Field Manual cell back", "<td>Dollar figures dated TY2025–2026 in My Data; rates approximate</td>", "<td>2026 approximations</td>", ["D-6"]),
    "C14": ("LA note drifts into the income-limited selector", 'spouse receives most of that income" }', 'spouse receives most of that income; not income-limited" }', ["X-8"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v586"], cwd=ROOT, capture_output=True, text=True, check=True)
    # exactly mk_runfolder.sh's invocation, from the ROOT with qa/ paths: esbuild writes source paths into the bundle's comments,
    # so any other working directory gives a different md5 and the restore check below would fail on a correct restore.
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v586.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v586.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t51_state_figure_years.mjs", "v586"], cwd=QA, capture_output=True, text=True, timeout=400)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t51 SUITE \(v586\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}"
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v586_state_years: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
