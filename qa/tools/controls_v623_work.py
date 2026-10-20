#!/usr/bin/env python3
"""controls_v623_work.py — negative controls for t86 (docs/SCOPE_D49_WORK_TAPER_V623.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t86 §E
renders the DOM bundle), t86 runs on the v6.23 leg (§B and §C need qa/app_v622.mjs beside it), then ./v623.jsx, qa/app_v623.mjs and
qa/dom_v623.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v622 -> v623 run folder:  python3 qa/tools/controls_v623_work.py [C1 ...]
    C1  the condition without the holdings test ............................................ A-3, A-4, A-8, C-1, F-1, E-6
    C2  the condition without the single test .............................................. A-2, A-8, C-1, D-1, F-1
    C3  the taper back on v6.22's one test ("no streams") ...................................... A-2, A-3, A-9, C-1, D-1, F-1
    C4  the loader's flag never set ............................................................ A-13, E-6, E-8, E-11
    C5  the loader's flag ignores the marker .................................................... A-14, E-9, E-13
    C6  the loader's flag read from the example, not the loaded plan .............................. A-13, E-6
    C7  the Monte Carlo notice never shown ....................................................... E-8
    C8  the My Data notice never shown ........................................................... E-6, E-11
    C9  the My Data notice shown on the example .................................................. E-1
    C10 the Monte Carlo notice shown on the example .............................................. E-5
    C11 the marker not written by DEFAULT_PORTFOLIO ................................................ A-11, A-12, A-15
    C12 the marker not written by the guided setup ................................................. A-11, A-12
    C13 the marker not written by Start Fresh ...................................................... A-11, A-12, E-13
    C14 the marker not written by buildPortfolio (Save & Apply) .................................... A-11, A-12, E-9
    C15 the Withdrawal tab's Step 1 back on "Spouse B work income" ................................. E-3, E-7c
    C16 the Taxes-tab line back on "<spouse B> earned income" ...................................... E-4, E-7b
    C17 My Data's note back on "the built-in example part-time-work schedule" ....................... E-2
    C18 the Field Manual's limitations entry back on "applies to every plan" ........................ G-1, G-2
    C19 the Field Manual's Monte Carlo entry back on "a plan with no other income streams" .......... G-3
    C20 the Field Manual's Backtest / What Breaks sentence (D-57) removed ........................... G-4
    C21 the Field Manual's D-10 sentence back on "Two smaller terms" ................................ G-5
    C22 the My Data notice stays up after a job row is added to the draft ........................... E-6b
    C23 the Monte Carlo notice back on the draft's "include no work income. Earlier versions paid" ... E-8
    C24 the Withdrawal tab's Work-column note without the example's built-in work .................. E-3
    C25 My Data's streams note back on "every projection" ........................................... G-7
    C26 the Field Manual's streams FAQ with no Backtest / What Breaks exception ....................... G-7
    C0  unmutated .............................................................................................. t86 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v623.jsx"); T86 = os.path.join(QA, "t86_builtin_work.mjs")
MOD = os.path.join(QA, "app_v623.mjs"); DOM = os.path.join(QA, "dom_v623.cjs")
for p in (SRC, T86, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v623.jsx"), os.path.join(QA, "app_v622.mjs"),
          os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v622 -> v623 run folder copy (missing {p})")
COND = "  return getIncomeStreams().length === 0 && !PORTFOLIO.single && holdsExampleHoldings(PORTFOLIO);\n"
MC_N = '{PORTFOLIO._builtinWorkDropped && (\n              <div data-dc-builtin-work-notice="mc"'
MD_N = '{PORTFOLIO._builtinWorkDropped && streams.length === 0 && (\n          <div data-dc-builtin-work-notice="mydata"'
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the condition without the holdings test", [(COND, "  return getIncomeStreams().length === 0 && !PORTFOLIO.single;\n")], ["A-3", "A-4", "A-8", "C-1", "F-1", "E-6"]),
 "C2": ("the condition without the single test", [(COND, "  return getIncomeStreams().length === 0 && holdsExampleHoldings(PORTFOLIO);\n")], ["A-2", "A-8", "C-1", "D-1", "F-1"]),
 "C3": ("the taper on v6.22's one test", [("  if (!builtinWorkApplies()) return 0;\n", "  if (getIncomeStreams().length > 0) return 0;\n")], ["A-2", "A-3", "A-9", "C-1", "D-1", "F-1"]),
 "C4": ("the loader's flag never set", [('? (PORTFOLIO.single ? "single" : "joint") : null;', "? null : null;")], ["A-13", "E-6", "E-8", "E-11"]),
 "C5": ("the loader's flag ignores the marker", [('(!Object.prototype.hasOwnProperty.call(PORTFOLIO, "workRowsV623") && getIncomeStreams()', "(getIncomeStreams()")], ["A-14", "E-9", "E-13"]),
 "C6": ("the loader's flag read from the example", [("\n      && !builtinWorkApplies()) ?", "\n      && !(getIncomeStreams().length === 0 && !PORTFOLIO.single && holdsExampleHoldings(DEFAULT_PORTFOLIO))) ?")], ["A-13", "E-6"]),
 "C7": ("the Monte Carlo notice never shown", [(MC_N, MC_N.replace("{PORTFOLIO._builtinWorkDropped && (", "{false && ("))], ["E-8"]),
 "C8": ("the My Data notice never shown", [(MD_N, MD_N.replace("{PORTFOLIO._builtinWorkDropped && streams.length === 0 && (", "{false && ("))], ["E-6", "E-11"]),
 "C9": ("the My Data notice on the example", [(MD_N, MD_N.replace("{PORTFOLIO._builtinWorkDropped && streams.length === 0 && (", "{(PORTFOLIO._builtinWorkDropped || holdsExampleHoldings(PORTFOLIO)) && ("))], ["E-1"]),
 "C10": ("the Monte Carlo notice on the example", [(MC_N, MC_N.replace("{PORTFOLIO._builtinWorkDropped && (", "{(PORTFOLIO._builtinWorkDropped || holdsExampleHoldings(PORTFOLIO)) && ("))], ["E-5"]),
 "C11": ("no marker on DEFAULT_PORTFOLIO", [("\n  workRowsV623: true,\n", "\n")], ["A-11", "A-12", "A-15"]),
 "C12": ("no marker from the guided setup", [("\n      workRowsV623: true, // v6.23 (D-49, DC-2 (a)): a new plan has no work income until the user enters a job row", "")], ["A-11", "A-12"]),
 "C13": ("no marker from Start Fresh", [("\n        workRowsV623: true, // v6.23 (D-49, DC-2 (a)): a new plan has no work income until the user enters a job row", "")], ["A-11", "A-12", "E-13"]),
 "C14": ("no marker from buildPortfolio", [("\n      workRowsV623: true,  // v6.23", "\n      // v6.23")], ["A-11", "A-12", "E-9"]),
 "C15": ("Step 1's old wording", [("Take Social Security + pension + other income (income streams{builtinWorkApplies() ? \" and the example's built-in work\" : \"\"}) — guaranteed floor.", "Take Social Security + pension + Spouse B work income — guaranteed floor.")], ["E-3", "E-7c"]),
 "C16": ("the Taxes-tab line's old wording", [('builtinWorkApplies() ? "Earned income (job rows and the example\'s built-in work)" : "Earned income (job rows)"', "`${_tlT.nameB} earned income`")], ["E-4", "E-7b"]),
 "C17": ("My Data's note's old wording", [("Only the example household also carries built-in part-time work for spouse B ($20,000, $18,000 and $15,000 in its retirement year and the two after); entering any stream replaces it.",
        "Entering any stream here replaces the built-in example part-time-work schedule.")], ["E-2"]),
 "C18": ("the limitations entry's old claim", [("belongs to the example household alone", "applies to every plan with no income streams, single plans included")], ["G-1", "G-2"]),
 "C19": ("the Monte Carlo entry's old wording", [("For the example household, whose spouse B works part-time in its retirement year and the two after", "For a plan with no other income streams entered, the Taxes tab also taxes")], ["G-3"]),
 "C20": ("the D-57 sentence removed", [("<strong>Backtest and What Breaks count no income stream</strong>", "")], ["G-4"]),
 "C22": ("the My Data notice stays up after a job row is added to the draft", [(MD_N, MD_N.replace(" && streams.length === 0 && (", " && ("))], ["E-6b"]),
 "C23": ("the Monte Carlo notice's v6.23-draft wording (\"these figures include no work income. Earlier versions paid\")", [("earlier versions charged every plan with no income streams{", "Earlier versions paid every plan with no income streams{")], ["E-8"]),
 "C24": ("the Work-column note without the example's built-in work", [('Other Income Streams{builtinWorkApplies() ? ", and the example household\'s built-in part-time work for spouse B" : ""})', "Other Income Streams)")], ["E-3"]),
 "C25": ("My Data's note back on \"every projection\"", [("These streams flow through the Monte Carlo, Trajectory, Withdrawal, Taxes, IRMAA, Roth optimizer and Income tabs — not Backtest or What Breaks, which count Social Security and the pension only.",
        "These streams flow through every projection: Monte Carlo, Trajectory, Withdrawal, Taxes, IRMAA, Roth optimizer, and the Income tab.")], ["G-7"]),
 "C26": ("the streams FAQ back on \"every engine\" with no exception", [("Roth optimizer — but not Backtest or What Breaks, which count Social Security and the pension only. For a job", "Roth optimizer. For a job")], ["G-7"]),
 "C21": ("the D-10 sentence's old count", [("One smaller term is still missing</strong>: realized capital gains", "Two smaller terms are still missing</strong>: realized capital gains")], ["G-5"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T86, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v623"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v623.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v623.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t86_builtin_work.mjs", "v623"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t86 SUITE \(v623\): (\d+) passed, (\d+) failed", out)
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
