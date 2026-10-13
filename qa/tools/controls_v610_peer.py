#!/usr/bin/env python3
"""controls_v610_peer.py — negative controls for t73 (docs/SCOPE_PEER_DATA_SCF2025_V610.md §5). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v610.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle),
t73 runs on the v610 leg, then ./v610.jsx, qa/app_v610.mjs and qa/dom_v610.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v609 -> v610 run folder:  python3 qa/tools/controls_v610_peer.py [K1 ...]
    K1  the net-worth tier types its p90 cut-off back as a literal (the v6.09 one) ........................ B-1, C-1 at p90
    K2  a table figure is typed again in prose (the Empower 60s average, as v6.09 had it) ................ B-2
    K3  the header types the survey year as text again ................................................... B-3, D-1
    K4  the survey-year constant goes back to 2022 ....................................................... A-1, D-1..D-3, E-1
    K5  the Field Manual says "currently the 2022 survey" again .......................................... D-8
    K6  the Social Security row is labelled "at 62" again ................................................ D-6, D-7
    K7  the p75 comparison becomes >= (a household exactly at the cut-off moves up a tier) ................ C-1 at p75
    K8  one interior table figure is off by $1 (the p87.5 "typical affluent" cut) ........................ A-3 nwCuts
    K0  unmutated ......................................................................................... t73 passes
"""
import hashlib, json, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v610.jsx")
MOD = os.path.join(QA, "app_v610.mjs"); DOM = os.path.join(QA, "dom_v610.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t73_peer_benchmarks.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v610.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v609 -> v610 run folder copy (missing {p})")
S0 = open(SRC, encoding="utf-8").read()
m = re.search(r"engagedAvgSavings60s: (\d+),", S0); v60 = m.group(1) if m else "?"
m = re.search(r"p875: (\d+), p90: (\d+),", S0); p875, p90 = (m.group(1), m.group(2)) if m else ("?", "?")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("p90 cut typed back as the v6.09 literal", 'netWorth > peers.nwCuts.p90 ? "TOP 10%"', 'netWorth > 1900000 ? "TOP 10%"', ["B-1", "C-1"]),
 "K2": ("a table figure typed again in prose", "~{(portfolioVal / peers.engagedAvgSavings60s).toFixed(1)}x", "~{(portfolioVal / " + v60 + ").toFixed(1)}x", ["B-2"]),
 "K3": ("header types the year as text", "Sources: Fed SCF {PEER_DATA_SCF_YEAR}, EBRI RRI, SSA", "Sources: Fed SCF 2022, EBRI RRI, SSA", ["B-3", "D-1"]),
 "K4": ("survey-year constant back to 2022", "const PEER_DATA_SCF_YEAR = 2025;", "const PEER_DATA_SCF_YEAR = 2022;", ["A-1", "D-1", "D-2", "D-3", "E-1"]),
 "K5": ("Field Manual back to the 2022 survey", "(SCF, currently the 2025 survey)", "(SCF, currently the 2022 survey)", ["D-8"]),
 "K6": ("Social Security row labelled at 62 again", "{ l: `Avg Social Security award (SSA, ${peers.avgSSAwardYear})`,", '{ l: "Avg Social Security at 62",', ["D-6", "D-7"]),
 "K7": ("p75 comparison becomes >=", 'netWorth > peers.nwCuts.p75 ? "TOP 25%"', 'netWorth >= peers.nwCuts.p75 ? "TOP 25%"', ["C-1"]),
 "K8": ("interior cut off by $1", f"p875: {p875}, p90: {p90},", f"p875: {int(p875) + 1 if p875 != '?' else 0}, p90: {p90},", ["A-3"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-\d+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v610"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v610.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v610.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t73_peer_benchmarks.mjs", "v610"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t73 SUITE \(v610\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
