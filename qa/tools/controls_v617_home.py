#!/usr/bin/env python3
"""controls_v617_home.py — negative controls for t80 (docs/SCOPE_D38_HOME_SALE_CASH_V617.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t80 §E
renders the DOM bundle), t80 runs on the v6.17 leg (which needs app_v616.mjs and ./v616.jsx beside it for §A's oracles and §C), then
./v617.jsx, qa/app_v617.mjs and qa/dom_v617.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v616 -> v617 run folder:  python3 qa/tools/controls_v617_home.py [H1 ...]
    H1  the old constant's 130000 restored at one Monte Carlo site ........................................ A-1, B-2
    H2  the sign flipped in the accessor ................................................................... B-6, E-4
        (NOT A-1 or D-1, measured: the loader clamps a stored value in place THROUGH the accessor, so a flip applied at load and again
        at read cancels in the engines on a freshly loaded plan — the defect shows in the stored and displayed value, which B-6 and E-4 read.
        Predicted A-1/D-1 at first; the run said otherwise, recorded in the CHANGELOG and the scope's §7.)
    H3  the field dropped from buildPortfolio (Save & Apply loses it) ..................................... E-3
    H4  a missing field read as 130,000 instead of 0 ....................................................... B-6, C-4, E-10
    H5  the clamp removed .................................................................................... B-6, E-7
    H6  the notice never shown ............................................................................... E-10
    H7  the example's 130,000 changed (its figures would move) .............................................. C-2, E-1
    H8  the Events clause kept at $0 ......................................................................... D-3
    H0  unmutated ............................................................................................ t80 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v617.jsx"); T80 = os.path.join(QA, "t80_home_move_cash.mjs")
MOD = os.path.join(QA, "app_v617.mjs"); DOM = os.path.join(QA, "dom_v617.cjs")
for p in (SRC, T80, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v617.jsx"), os.path.join(QA, "app_v616.mjs"), os.path.join(ROOT, "v616.jsx"), os.path.join(ROOT, "METHODOLOGY.md")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v616 -> v617 run folder copy (missing {p})")
M = {
 "H0": ("unmutated", [], []),
 "H1": ("the constant restored at one site", [("      if (q === config.retireQuarter) portfolio += homeMoveCash();   // v6.17 (D-38)\n", "      if (q === config.retireQuarter) portfolio += 130000;\n")], ["A-1", "B-2"]),
 "H2": ("the sign flipped", [("  return Number.isFinite(v) ? Math.max(-HOME_MOVE_CASH_LIMIT, Math.min(HOME_MOVE_CASH_LIMIT, v)) : 0;", "  return Number.isFinite(v) ? -Math.max(-HOME_MOVE_CASH_LIMIT, Math.min(HOME_MOVE_CASH_LIMIT, v)) : 0;")], ["B-6", "E-4"]),
 "H3": ("the field dropped on save", [("      homeMoveCash: homeMoveCash({ homeMoveCash: num(homeMove) }),   // v6.17 (D-38): always written, so a saved plan never shows the notice again\n", "")], ["E-3"]),
 "H4": ("a missing field read as 130,000", [("  return Number.isFinite(v) ? Math.max(-HOME_MOVE_CASH_LIMIT, Math.min(HOME_MOVE_CASH_LIMIT, v)) : 0;", "  return Number.isFinite(v) ? Math.max(-HOME_MOVE_CASH_LIMIT, Math.min(HOME_MOVE_CASH_LIMIT, v)) : 130000;")], ["B-6", "C-4", "E-10"]),
 "H5": ("the clamp removed", [("  return Number.isFinite(v) ? Math.max(-HOME_MOVE_CASH_LIMIT, Math.min(HOME_MOVE_CASH_LIMIT, v)) : 0;", "  return Number.isFinite(v) ? v : 0;")], ["B-6", "E-7"]),
 "H6": ("the notice never shown", [("    PORTFOLIO._homeMoveMigrated = !_hmHas;", "    PORTFOLIO._homeMoveMigrated = false;")], ["E-10"]),
 "H7": ("the example's figure changed", [("  homeMoveCash: 130000,\n", "  homeMoveCash: 120000,\n")], ["C-2", "E-1"]),
 "H8": ("the Events clause kept at $0", [('    const _hmTxt = _hm === 0 ? "" : ', '    const _hmTxt = false ? "" : ')], ["D-3"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T80, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v617"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v617.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v617.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t80_home_move_cash.mjs", "v617"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t80 SUITE \(v617\): (\d+) passed, (\d+) failed", out)
        if label == "H0": return f"H0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
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
fires = sum(1 for o in out if " FIRES " in o or o.startswith("H0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
