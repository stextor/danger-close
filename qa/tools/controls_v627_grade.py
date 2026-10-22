#!/usr/bin/env python3
"""controls_v627_grade.py — negative controls for t90 (docs/SCOPE_F22_GRADE_FINDINGS_V627.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t90 runs on
the v6.27 leg (which spawns the untouched v6.26 leg for §B-8), then ./v627.jsx, qa/app_v627.mjs and qa/dom_v627.cjs are RESTORED and
hash-checked.
Run from the ROOT of a COPY of a v626 -> v627 run folder:  python3 qa/tools/controls_v627_grade.py [C1 ...]
    C1  the panel back (its identifier and its header) ........................................... A-1, A-2, B-1
    C2  the LTC policy sentence back ................................................................ A-3, B-2, B-2b, B-10
    C3  the Monte Carlo drag blames an LTC shock again .............................................. A-3, B-4, B-10
    C4  one literal grade's fixed: true removed (Diversification) ................................... A-6, B-5
    C5  the Field Manual's Grade entry stops naming one category (cost structure) ................... C-2
    C6  a single plan told "both spouses" ........................................................... B-3, B-3b
    C7  the ceiling line removed .................................................................... B-5b
    C8  the Field Manual describes a radar chart again .............................................. C-1
    C9  Field Manual §13's v6.27 entry removed ...................................................... C-6
    C10 a hidden lift on the overall GPA ............................................................ B-7, B-8
    C11 the Tax line's conversion-plan claim back ................................................... A-3, B-10, B-11
    C12 a literal grade changed (LTC C+ -> B) ....................................................... B-7b, B-8
    C13 the equity-share sentence pointing at "the actions above" again ............................. A-3, B-9, B-10
    C14 Guardrail Readiness's labelKeyed removed .................................................... A-7, B-5
    C15 the Roth line's $0 branch reworded .......................................................... A-9
    C16 a grade hardcoded through a spread (the build review's mutant X1) ............................ A-6b, B-8
    C17 Top grade drags loses its † / ‡ marks ....................................................... B-12b
    C18 the Roth years from the target year (rothLadderStart) again ................................. A-10
    C19 the "$0K convexity" sentence back ........................................................... A-3, B-10, B-13
    C20 the Field Manual's guardrail sentence hedged again ("whenever a cut is needed") ............ C-3
    C0  unmutated .................................................................................. t90 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v627.jsx"); T90 = os.path.join(QA, "t90_grade_findings.mjs")
MOD = os.path.join(QA, "app_v627.mjs"); DOM = os.path.join(QA, "dom_v627.cjs")
for p in (SRC, T90, MOD, DOM, os.path.join(ROOT, "v626.jsx"), os.path.join(QA, "dom_v626.cjs"), os.path.join(QA, "mk_testable.sh"),
          os.path.join(QA, "dom_entry_v627.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v626 -> v627 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the panel back", [(SRC, "          // v6.27 (F-22, DG-1 (a)): the \"PATH TO", "          const improvements = [];\n          // v6.27 (F-22, DG-1 (a)): the \"PATH TO"),
                           (SRC, "Sequence Protection reads the cash-and-bond share.</div>", "Sequence Protection reads the cash-and-bond share. PATH TO B+ — RECOMMENDED ACTIONS</div>")], ["A-1", "A-2", "B-1"]),
 "C2": ("the LTC policy sentence back", [(SRC, '"No LTC / long-term-care line is in your expenses."', '"Hybrid LTC insurance active."')], ["A-3", "B-2", "B-2b", "B-10"]),
 "C3": ("the MC drag blames LTC again", [(SRC, '"Fewer than 90% of paths end above $800K. This rate comes from the 6-year Monte Carlo, which carries no long-term-care event; the 30-year Monte Carlo and the Stress tab model one."',
                                          '"LTC shock scenarios pull left tail below threshold"')], ["A-3", "B-4", "B-10"]),
 "C4": ("Diversification's fixed: true removed", [(SRC, 'grade: "B+", gpa: 3.3, color: "var(--info)", fixed: true,\n              evidence: `${distinctTypes.length}',
                                                  'grade: "B+", gpa: 3.3, color: "var(--info)",\n              evidence: `${distinctTypes.length}')], ["A-6", "B-5"]),
 "C5": ("the Grade entry stops naming cost structure", [(SRC, "tax efficiency (5), cost structure (5), guardrail", "tax efficiency (5), guardrail")], ["C-2"]),
 "C6": ("a single plan told both spouses", [(SRC, '${_ckSingle ? "" : "for each spouse "}', 'for both spouses ')], ["B-3", "B-3b"]),
 "C7": ("the ceiling line removed", [(SRC, '>Highest any plan can score here: B+</div>', '></div>')], ["B-5b"]),
 "C8": ("the radar chart back", [(SRC, "<p>Nine weighted categories, each shown as a bar", "<p>A radar chart of nine weighted categories, each")], ["C-1"]),
 "C9": ("§13's v6.27 entry removed", [(SRC, "The Grade tab reports the model\\u2019s grading, not actions (v6.27).", "The Grade tab (v6.27).")], ["C-6"]),
 "C10": ("a hidden lift on the overall GPA", [(SRC, "const weightedGPA = categories.reduce((s, c) => s + c.gpa * c.weight, 0) / categories.reduce((s, c) => s + c.weight, 0);",
                                              "const weightedGPA = categories.reduce((s, c) => s + c.gpa * c.weight, 0) / categories.reduce((s, c) => s + c.weight, 0) + 0.05;")], ["B-7", "B-8"]),
 "C11": ("the Tax line's conversion-plan claim back", [(SRC, "`Roth slider: $${Math.round(rothAmount / 1000)}K/yr, ${retireYear}", "`Roth conversion plan: ${retireYear}")], ["A-3", "B-10", "B-11"]),
 "C12": ("a literal grade changed", [(SRC, 'grade: "C+", gpa: 2.3, color: "var(--warn)", fixed: true,', 'grade: "B", gpa: 3.0, color: "var(--warn)", fixed: true,')], ["B-7b", "B-8"]),
 "C13": ("the equity sentence points at the actions again", [(SRC, "The equity share is not graded on its own; Sequence Protection reads the cash-and-bond share.</div>", "Allocation is yours to set — the actions above are insurance, tax, and estate items only.</div>")], ["A-3", "B-9", "B-10"]),
 "C15": ("the Roth line's $0 branch reworded", [(SRC, '"Roth slider at $0 — no conversions modeled."', '"Roth ladder in progress."')], ["A-9"]),
 "C16": ("a grade hardcoded through a spread (the review's mutant)", [(SRC, "              ..._sg,\n", "              ...{ grade: \"A-\", gpa: 3.7, color: \"var(--accent)\" },\n")], ["A-6b", "B-8"]),
 "C17": ("Top grade drags loses its marks", [(SRC, '{d.name}{d.fixed ? " †" : d.labelKeyed ? " ‡" : ""} ({d.grade})', '{d.name} ({d.grade})')], ["B-12b"]),
 "C18": ("the Roth years from the target year again", [(SRC, "K/yr, ${retireYear}–${PLAN_TIMELINE.rothLadderEnd}.`", "K/yr, ${PLAN_TIMELINE.rothLadderStart}–${PLAN_TIMELINE.rothLadderEnd}.`")], ["A-10"]),
 "C19": ("the $0K convexity sentence back", [(SRC, '${b4a > 0 ? ` Hedge holdings: $${(b4a * total401k / 1000).toFixed(0)}K.` : ""}`', ' Hedge holdings add $${(b4a * total401k / 1000).toFixed(0)}K convexity.`')], ["A-3", "B-10", "B-13"]),
 "C20": ("the Field Manual's guardrail sentence hedged again", [(SRC, "so a plan without them grades B-.", "so a plan without them grades B- whenever a cut is needed.")], ["C-3"]),
 "C14": ("Guardrail's labelKeyed removed", [(SRC, 'color: _ok ? "var(--info)" : "var(--warn)", labelKeyed: true,', 'color: _ok ? "var(--info)" : "var(--warn)",')], ["A-7", "B-5"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {SRC: open(SRC, "rb").read()}
WATCH = (SRC, T90, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v627"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v627.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v627.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG[SRC].decode("utf-8")
            for path, old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t90_grade_findings.mjs", "v627"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t90 SUITE \(v627\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {(out + r.stderr.decode('utf-8','replace'))[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
