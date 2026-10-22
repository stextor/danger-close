#!/usr/bin/env python3
"""controls_v629_model_claims.py — negative controls for t92 (docs/SCOPE_F25_MODEL_CLAIMS_V629.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t92 runs on
the v6.29 leg, then ./v629.jsx, ./METHODOLOGY.md, qa/t92_model_claims.mjs, qa/app_v629.mjs and qa/dom_v629.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v628 -> v629 run folder:  python3 qa/tools/controls_v629_model_claims.py [C1 ...]
    C1  a replaced sentence restored (the Backtest's "almost no historical sequence breaks the plan") .......... A-1
    C2  the Stress recovery hard-coded again ......................................................... A-1, B-6
    C3  What Breaks' history typed again (a figure that disagrees with the table) .......................... B-8
    C4  the gap draw subtracts B's check for the whole gap again ...................................... C-1, C-1d
    C5  an AMT check removed from the Verify tab ...................................................... A-4, A-5b
    C6  spouse B's RMD event dropped ..................................................................... D-2, D-3
    C7  spouse B's RMD event keyed "rmd" ............................................................... D-2
    C8  the landing's privacy list misses the conversation ............................................ E-2
    C9  the mortgage what-if's sign bug back ............................................................. C-2d
    C10 a dollar-units sentence restored on the Taxes tab .............................................. A-1, F-4
    C11 a typed preset name in an in-app sentence ...................................................... A-2
    C12 the Backtest note shown below the threshold again ............................................... B-7c
    C13 the Exit Plan's B coverage gap from the household year again ................................... D-5
    C14 Field Manual Example 2's figure on the other method again ...................................... C-3b
    C15 METHODOLOGY's measurement removed ................................................................ F-3
    C16 a single plan's gap names spouse B again ........................................................ C-1g
    C17 What Breaks' other verdicts printed on a failing plan ........................................... B-8e
    C18 the Stress pre-crash level taken inside the crash year .......................................... B-4e
    C19 the phase table subtracts B for the whole first phase again ..................................... C-1h
    C0  unmutated .................................................................................. t92 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v629.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T92 = os.path.join(QA, "t92_model_claims.mjs")
MOD = os.path.join(QA, "app_v629.mjs"); DOM = os.path.join(QA, "dom_v629.cjs")
for p in (SRC, METH, T92, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v629.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v628 -> v629 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("a replaced sentence restored", [(SRC, "This backtest counts only Social Security and the pension as income (not your other income streams) and charges no income tax,",
        "At that rate almost no historical sequence breaks the plan. This backtest counts only Social Security and the pension as income (not your other income streams) and charges no income tax,")], ["A-1"]),
 "C2": ("the Stress recovery hard-coded again", [(SRC, "const _rec = stressRecovery(aiBubble, retireYear);\n                          if (!_rec) return null;",
        "const _rec = null;\n                          if (!_rec) return <><span>Recovery:</span> Median portfolio recovers to pre-crash levels by Year 4–5 in simulations.</>;")], ["A-1", "B-6"]),
 "C3": ("What Breaks' history typed again", [(SRC, "the weakest 20-year window, ${_histW20.start}–${_histW20.end}, earned ${_pm(_histW20.cagr)}%/yr",
        "the weakest 20-year window, ${_histW20.start}–${_histW20.end}, earned 2.0%/yr")], ["B-8"]),
 "C4": ("the gap draw subtracts B for the whole gap again", [(SRC, "s += m >= ssBYM ? _gapMoNet : _gapMoPreB;", "s += _gapMoNet;")], ["C-1", "C-1d"]),
 "C5": ("an AMT check removed", [(SRC, '  add("ALTERNATIVE MINIMUM TAX", "28% rate begins above (Single / MFJ)", TAX_CONSTS.AMT_28_BREAK, 244500, RP);\n', "")], ["A-4", "A-5b"]),
 "C6": ("spouse B's RMD event dropped", [(SRC, '  if (!tl.single) rmdEvent("rmdB", nB, tl.dobB.year);\n', "")], ["D-2", "D-3"]),
 "C7": ("spouse B's RMD event keyed rmd", [(SRC, 'if (!tl.single) rmdEvent("rmdB", nB, tl.dobB.year);', 'if (!tl.single) rmdEvent("rmd", nB, tl.dobB.year);')], ["D-2"]),
 "C8": ("the landing's privacy list misses the conversation", [(SRC, "or any prompt document you load, up to 12 earlier messages of the conversation, your question", "or any prompt document you load, your question")], ["E-2"]),
 "C9": ("the mortgage sign bug back", [(SRC, '`${Math.abs(dSucc).toFixed(1)} pts ${dSucc < 0 ? "lower" : "higher"} success`', '`${dSucc.toFixed(1)} pts lower success`')], ["C-2d"]),
 "C10": ("a units sentence restored", [(SRC, "(a chained-CPI proxy, below the household inflation the simulators draw). <strong>Units:</strong>",
        "(chained-CPI proxy; deliberately below the ~2.7% household inflation the simulators use — slow bracket growth overstates taxes, the conservative direction). <strong>Units:</strong>")], ["A-1"]),
 "C11": ("a typed preset name in an in-app sentence", [(SRC, "⚠ This is not the default scenario ({PROB_PRESETS[DEFAULT_SCENARIO_PRESET].label}).", "⚠ This is not the default scenario (BULL-LEANING).")], ["A-2"]),
 "C12": ("the Backtest note shown below the threshold", [(SRC, "{survBucket >= 0.9 && (() => {", "{(() => {")], ["B-7c"]),
 "C13": ("B's coverage gap from the household year", [(SRC, "const _retB = single ? _retA : { year: tl.targetRetireYearB || tl.retireDate.year,", "const _retB = single ? _retA : { year: tl.retireDate.year,")], ["D-5"]),
 "C14": ("Example 2 on the other method", [(SRC, "roughly <strong>$10,400 less per $100K converted</strong>", "roughly <strong>$10,900 less per $100K converted</strong>")], ["C-3b"]),
 "C15": ("METHODOLOGY's measurement removed", [(METH, "the shipped rows run **low**, by $70,823 and $40,664", "the shipped rows run high")], ["F-3"]),
 "C16": ("a single plan's gap names spouse B again (build review #1)", [(SRC, "const _gapPreB = _singleInc ? 0 : Math.min(", "const _gapPreB = Math.min(")], ["C-1g"]),
 "C17": ("What Breaks' other verdicts printed on a failing plan (build review #3)", [(SRC, 'a: !baseSurvives ? "None — fails without one" : maxShock >= 3000000', 'a: maxShock >= 3000000'),
        (SRC, "detail: !baseSurvives ? _failsLine : `A single", "detail: `A single")], ["B-8e"]),
 "C18": ("the Stress pre-crash level taken inside the crash year (build review #8)", [(SRC, "if (dateOf(y).year < retireYear) pre = y;", "if (dateOf(y).year <= retireYear) pre = y;")], ["B-4e"]),
 "C19": ("the phase table subtracts B for the whole first phase again (build review #4)", [(SRC, "income: (ssBYM <= retireYM ? spouseBSS : 0) + pension + _stAt(retireYM),", "income: spouseBSS + pension + _stAt(retireYM),")], ["C-1h"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {p: open(p, "rb").read() for p in (SRC, METH, T92)}
WATCH = (SRC, METH, T92, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v629"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v629.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v629.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x in {os.path.basename(path)} (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if texts[SRC].encode("utf-8") != ORIG[SRC]: build()
        r = subprocess.run(["node", "t92_model_claims.mjs", "v629"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t92 SUITE \(v629\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {(out + r.stderr.decode('utf-8','replace'))[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        rebuild = open(SRC, "rb").read() != ORIG[SRC]
        for path in ORIG:
            if open(path, "rb").read() != ORIG[path]: open(path, "wb").write(ORIG[path])
        if rebuild: build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
