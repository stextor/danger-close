#!/usr/bin/env python3
"""controls_v646_ss_fra.py — negative controls for t110 (docs/SCOPE_D56_SS_FRA_ESTIMATE_V646.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v646.jsx (each target occurs exactly once), rebuilds qa/app_v646.mjs and qa/dom_v646.cjs as mk_runfolder.sh builds
  them, runs t110 on the v646 leg, then RESTORES the three files and hash-checks them. t110's §D needs qa/dom_v645.cjs (a v645 -> v646
  run folder), and takes about a minute a run.
Run from the ROOT of a COPY of a v645 -> v646 run folder:  python3 qa/tools/controls_v646_ss_fra.py [K1 ...]
  the reads (DK-1 (a)) — each of the seven reverted to its v6.45 fallback (the build review: all seven, each in turn)
    K1  spouse B's typed $1,944 restored ............................... A-2, A-3, A-4, C-noSSB, C-zeroTable, C-missingB, C-smallA_noSSB, C-none, E-2
    K2  spouse A's read reverted (`|| getSSA()`) ......................................... A-2, A-3, C-aNoTable65, E-5
    K3  the survivor note's read reverted (`|| spouseBSS`) .............................................. A-2, A-3
    K4  the breakeven's spouse-B read reverted (`|| 0`) ................................................. A-2, A-3
    K13 the breakeven's spouse-A read reverted (`|| 0`) ................................................. A-2, A-3
    K5  the claiming grid's spouse-B read reverted (`|| getSSB()`) ...................................... A-2, A-3
    K14 the claiming grid's spouse-A read reverted (`|| getSSA()`) ...................................... A-2, A-3
  the helper
    K6  the planned amount used uncarried (no division by the claim-age factor) ......................... B-1, B-2, C-no67, E-3
    K7  the claim age taken from the defaults, not ssTabClaimAge ........................................ A-1, B-1, B-5
  the divisions (DK-1 (a))
    K8  spouse A's % of FRA unguarded .................................................................. A-5, C-noSSA
    K9  spouse B's % of est. FRA unguarded .............................................................. A-5, C-noSSB
    K15 the early-reduction note's division unguarded (shown for every plan; the sentence never) ...... A-5, C-none, C-noSSB
  the sentence (DK-2 (a))
    K10 the sentence removed ............................................................................ C-none
    K11 the sentence shown always (and the derivation note never) ....................................... C-none, D-1
  the copy
    K12 §13's v6.46 note removed, the whole item ........................................................ F-1, F-2
    C0  unmutated ....................................................................................... t110 passes
The breakeven's and the claiming grid's reads (K4, K5, K13, K14) are held by the source checks alone: t110's §C reads the cards, the combined income,
the shortfall, the survivor card and grid and the warning, and §D holds every plan whose tables hold 67 to v6.45's text.
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v646.jsx"); MOD = os.path.join(QA, "app_v646.mjs"); DOM = os.path.join(QA, "dom_v646.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t110_ss_fra.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v646.jsx"),
          os.path.join(QA, "dom_v645.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v645 -> v646 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>Social Security for a spouse with no benefit of their own (v6.46).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
SENT = "<>This plan holds no Social Security benefit for {nB}, so every projection pays {nB} no Social Security.</>"
HELP = "  return planned > 0 ? Math.round(planned / (SS_FACTORS[ssTabClaimAge(who)] || 1)) : 0;"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("spouse B's typed $1,944 restored",
        [('const spouseBFRAest = ssFraOf("B");', "const spouseBFRAest = _ssSrc.ssB?.tableByAge?.[67] || 1944;")],
        ["A-2", "A-3", "A-4", "C-noSSB", "C-zeroTable", "C-missingB", "C-smallA_noSSB", "C-none", "E-2"]),
 "K2": ("spouse A's read reverted", [('const spouseAFRA = ssFraOf("A");', "const spouseAFRA = _ssSrc.ssA?.tableByAge?.[67] || getSSA();")], ["A-2", "A-3", "C-aNoTable65", "E-5"]),
 "K3": ("the survivor note's read reverted", [('_fB = ssFraOf("B");', "_fB = (_ssSrc.ssB?.tableByAge?.[67] || spouseBSS);")], ["A-2", "A-3"]),
 "K4": ("the breakeven's spouse-B read reverted", [('          const fraB = ssFraOf("B");   // v6.46 (D-56): was `|| 0`', "          const fraB = PORTFOLIO.incomeSources?.ssB?.tableByAge?.[67] || 0;")], ["A-2", "A-3"]),
 "K13": ("the breakeven's spouse-A read reverted", [('          const fraA = ssFraOf("A");   // v6.46 (D-56): was `|| 0`', "          const fraA = PORTFOLIO.incomeSources?.ssA?.tableByAge?.[67] || 0;")], ["A-2", "A-3"]),
 "K5": ("the claiming grid's spouse-B read reverted", [('          const fraB = ssFraOf("B");   // v6.46 (D-56): was `|| getSSB()`', "          const fraB = PORTFOLIO.incomeSources?.ssB?.tableByAge?.[67] || getSSB();")], ["A-2", "A-3"]),
 "K14": ("the claiming grid's spouse-A read reverted", [('          const fraA = ssFraOf("A");   // v6.46 (D-56): was `|| getSSA()`', "          const fraA = PORTFOLIO.incomeSources?.ssA?.tableByAge?.[67] || getSSA();")], ["A-2", "A-3"]),
 "K6": ("the planned amount used uncarried", [(HELP, "  return planned > 0 ? planned : 0;")], ["B-1", "B-2", "C-no67", "E-3"]),
 "K7": ("the claim age taken from the defaults", [(HELP, HELP.replace("ssTabClaimAge(who)", '(who === "A" ? 67 : 63)'))], ["A-1", "B-1", "B-5"]),
 "K8": ("spouse A's % of FRA unguarded", [("const pct = spouseAFRA > 0 ? benefit / spouseAFRA : 0;", "const pct = benefit / spouseAFRA;")], ["A-5", "C-noSSA"]),
 "K9": ("spouse B's % of est. FRA unguarded", [("{spouseBFRAest > 0 ? Math.round(selectedSpouseB.benefit / spouseBFRAest * 100) : 0}% of est. FRA",
                                               "{Math.round(selectedSpouseB.benefit / spouseBFRAest * 100)}% of est. FRA")], ["A-5", "C-noSSB"]),
 "K15": ("the early-reduction note's division unguarded", [("* = FRA │ {spouseBFRAest > 0 ? <>Estimated", "* = FRA │ {true ? <>Estimated")], ["A-5", "C-none", "C-noSSB"]),
 "K10": ("the sentence removed", [(SENT, "<></>")], ["C-none"]),
 "K11": ("the sentence shown always", [("* = FRA │ {spouseBFRAest > 0 ? <>Estimated", "* = FRA │ {false ? <>Estimated")], ["C-none", "D-1"]),
 "K12": ("§13's v6.46 note removed", [(NOTE_LI, "")], ["F-1", "F-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-[A-Za-z0-9_]+)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v646"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v646.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v646.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t110_ss_fra.mjs", "v646"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t110 SUITE \(v646\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        got = [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
        hit = [w for w in want if w in got]
        return f"{label} {'FIRED' if len(hit) == len(want) else ('PARTIAL' if hit else 'SILENT')} — {desc}: want {want}, red {got}"
    finally:
        if pairs:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
labels = sys.argv[1:] or list(M.keys())
res = []
for l in labels:
    res.append(run(l)); print(res[-1], flush=True)
after = tuple(md5(p) for p in WATCH)
print("files restored:", "YES" if after == BEFORE else f"NO — {BEFORE} vs {after}")
bad = [x for x in res if not (x.startswith("C0 OK") or " FIRED " in x)]
sys.exit(1 if bad or after != BEFORE else 0)
