#!/usr/bin/env python3
"""controls_v591_plantype.py — negative controls for t56 (docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md, Phase 1). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v591.jsx; the mutant is compiled (qa/mk_testable.sh) and the DOM bundle rebuilt from qa/dom_entry_v591.jsx, t56 runs, then
./v591.jsx, ./qa/app_v591.mjs and ./qa/dom_v591.cjs are RESTORED and hash-checked. Run from the ROOT of a COPY of a v591 run folder
with a real node_modules (never a symlink; never a folder a suite run is using):  python3 qa/tools/controls_v591_plantype.py [C1 ...]
    C1  buildPortfolio drops a holding's plan type .................................. R-8 R-9
        (NOT R-5: Save & Apply migrates the rebuilt plan in place before the storage write, so a DEFAULT is re-added; only a
         user's choice is lost. Measured while t56 was written; its header records it.)
    C2  getPension made to read the pension owner and the plan types ............... F-1 F-2 F-3 (all three states)
    C3  the migration's default flipped to "employer" ............................... M-1 M-2 M-6 M-10 R-5
        (also R-8 R-9, correctly: with every default already "employer", R-8's "exactly one holding changed" cannot hold.)
    C4  stray plan types on non-Traditional rows kept ................................ M-14 M-15
    C5  a single filer's pension owner "B" kept ..................................... M-18
    C6  the pension-owner selector drawn for a single household ..................... R-10 R-11
    C0  unmutated ................................................................... t56 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v591.jsx")
MOD, DOM = os.path.join(QA, "app_v591.mjs"), os.path.join(QA, "dom_v591.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t56_plan_type_collect.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v591.jsx"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v591 run folder copy")
GP = 'function getPension() { return PORTFOLIO.incomeSources?.pension?.amount ?? DEFAULT_PORTFOLIO.incomeSources.pension.amount; }'
M = {
 "C0": ("unmutated", None, None, []),
 "C1": ("buildPortfolio drops a holding's plan type", ', ...(trad > 0 ? { planType: PLAN_TYPES.includes(r.planType) ? r.planType : "ira" } : {}) };', " };", ["R-8", "R-9"]),
 "C2": ("getPension reads the new fields", GP, GP.replace("return PORTFOLIO.incomeSources?.pension?.amount ?? DEFAULT_PORTFOLIO.incomeSources.pension.amount;",
        'return (PORTFOLIO.incomeSources?.pension?.amount ?? DEFAULT_PORTFOLIO.incomeSources.pension.amount) * (PORTFOLIO.incomeSources?.pension?.owner === "B" ? 1.01 : 1) * ((PORTFOLIO.positions || []).some(p => p.planType === "employer") ? 1.02 : 1);'), ["F-1", "F-2", "F-3"]),
 "C3": ("default flipped to employer", 'if (!PLAN_TYPES.includes(row.planType)) { row.planType = "ira"; _ptRows.push(label); }',
        'if (!PLAN_TYPES.includes(row.planType)) { row.planType = "employer"; _ptRows.push(label); }', ["M-1", "M-2", "M-6", "M-10", "R-5"]),
 "C4": ("stray values kept", 'if (!isTrad) { if (Object.prototype.hasOwnProperty.call(row, "planType")) delete row.planType; return; }', "if (!isTrad) { return; }", ["M-14", "M-15"]),
 "C5": ("single filer's B kept", 'const want = (!PORTFOLIO.single && _pen.owner === "B") ? "B" : "A";', 'const want = (_pen.owner === "B") ? "B" : "A";', ["M-18"]),
 "C6": ("pension selector for single", "{!single && (\n            <select style={{ ...inp, marginTop: 4 }} value={penOwner}", "{true && (\n            <select style={{ ...inp, marginTop: 4 }} value={penOwner}", ["R-10", "R-11"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v591"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v591.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v591.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
cid = lambda l: l.split()[1].rstrip(":")
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t56_plan_type_collect.mjs", "v591"], cwd=QA, capture_output=True, text=True, timeout=280)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t56 SUITE: (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr[-200:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v591_plantype: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
