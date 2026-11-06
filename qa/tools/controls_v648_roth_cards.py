#!/usr/bin/env python3
"""controls_v648_roth_cards.py — negative controls for t112 (docs/SCOPE_F34_F35_V648.md §2). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v648.jsx (each target occurs exactly once), rebuilds qa/app_v648.mjs and qa/dom_v648.cjs as mk_runfolder.sh builds
  them, runs t112 on the v648 leg with §D skipped (T112_CONTROLS_SKIP_D — the controls' switch, never the suite's), then RESTORES the three
  files and hash-checks them.
Run from the ROOT of a COPY of a v647 -> v648 run folder:  python3 qa/tools/controls_v648_roth_cards.py [K1 ...]
    K1  the Traditional card's "(now)" label back ................................... A-1, A-2, B-5
    K2  the Traditional card prints the uncarried figure (_tradFromPortfolio) ...... A-5, B-3
    K3  the Roth card prints the uncarried figure (_rothFromPortfolio) ............. A-5, B-4
    K4  the start taken from retireStartBalances, not the carried seeds ............ A-3, B-3
    K5  the label names the year after the selected one ............................ B-5
    K6  the ladder's marginal rate starts at 0.10 again ............................ A-6, C-1
    K7  the Field Manual's "current Traditional/Roth balances" back ................ E-1
    K8  §13's v6.48 note removed .................................................... E-2, E-3
    K9  the cards' note names the year after (the review: its year was unchecked) .. B-5b
    C0  unmutated (§D skipped) ....................................................... t112 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v648.jsx"); MOD = os.path.join(QA, "app_v648.mjs"); DOM = os.path.join(QA, "dom_v648.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t112_roth_cards_rate.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v648.jsx"),
          os.path.join(QA, "units_v630.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v647 -> v648 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>The Roth ladder’s starting balances and its rate column (v6.48).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("the Traditional card's (now) label back", [('className="lbl">Traditional at retirement ({retireYear})</div>', 'className="lbl">Traditional bal (now)</div>')], ["A-1", "A-2", "B-5"]),
 "K2": ("the Traditional card prints the uncarried figure", [("${Math.round(_tradStartL).toLocaleString()}", "${Math.round(_tradFromPortfolio).toLocaleString()}")], ["A-5", "B-3"]),
 "K3": ("the Roth card prints the uncarried figure", [("${Math.round(_rothStartL).toLocaleString()}", "${Math.round(_rothFromPortfolio).toLocaleString()}")], ["A-5", "B-4"]),
 "K4": ("the start taken from retireStartBalances", [("const _tradStartL = tradBalA + tradBalB, _rothStartL = rothBal0;", "const _tradStartL = _rsbL.tradInit, _rothStartL = rothBal0;")], ["A-3", "B-3"]),
 "K5": ("the label names the year after", [('className="lbl">Traditional at retirement ({retireYear})</div>', 'className="lbl">Traditional at retirement ({retireYear + 1})</div>')], ["B-5"]),
 "K6": ("the marginal rate starts at 0.10", [("            let marginalRate = 0;\n", "            let marginalRate = 0.10;\n")], ["A-6", "C-1"]),
 "K7": ("the Field Manual's old sentence back", [("and the Traditional and Roth balances it starts from at the selected retirement year — your holdings carried to that year at the plan’s inflation",
                                                  "and current Traditional/Roth balances (derived from your positions) — your holdings carried to that year at the plan’s inflation")], ["E-1"]),
 "K8": ("§13's v6.48 note removed", [(NOTE_LI, "")], ["E-2", "E-3"]),
 "K9": ("the cards' note names the year after", [("plus the planned contributions — in ${retireYear}'s dollars`", "plus the planned contributions — in ${retireYear + 1}'s dollars`")], ["B-5b"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-[A-Za-z0-9_]+)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v648"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v648.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v648.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        env = dict(os.environ, T112_CONTROLS_SKIP_D="1")
        r = subprocess.run(["node", "t112_roth_cards_rate.mjs", "v648"], cwd=QA, capture_output=True, timeout=3600, env=env)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t112 SUITE \(v648\): (\d+) passed, (\d+) failed", out)
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
