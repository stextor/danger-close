#!/usr/bin/env python3
"""controls_v611_ranking.py — negative controls for t74 (docs/SCOPE_F19R_RANKING_HEADLINE.md §5). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each source target occurs exactly once in the
run folder's ./v611.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM
bundle), t74 runs on the v611 leg, then ./v611.jsx, qa/app_v611.mjs and qa/dom_v611.cjs are RESTORED and hash-checked. K7 mutates the TEST
(a throwaway copy, deleted after), not the app.
Run from the ROOT of a COPY of a v610 -> v611 run folder:  python3 qa/tools/controls_v611_ranking.py [K1 ...]
    K1  the headline goes back to an average over the rows ............................................. A-4, B-3
    K2  one unranked row gets a fixed "TOP N%" again (Debt Load, TOP 20%) .............................. A-2, A-3, D-7
    K3  the header tells every household it is "in an exceptionally strong position" again ............. D-1
    K4  the net-worth median band is dropped (below the median reads TOP 50% again) .................... C-1, D-2
    K5  the Portfolio Size floor comes back (at or below p90 reads TOP 25%) ............................. C-3
    K6  the Field Manual says the tiers are built from public survey data again ......................... E-3
    K7  the TEST stops re-running the Monte Carlo (the trap that mis-measured F-19 at filing) ........... B-1
    K8  the affluent card adds "you're around the middle" to its verdict again ......................... D-1, D-5, D-5b
    K0  unmutated ......................................................................................... t74 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v611.jsx")
MOD = os.path.join(QA, "app_v611.mjs"); DOM = os.path.join(QA, "dom_v611.cjs"); T74 = os.path.join(QA, "t74_ranking_headline.mjs")
for p in (SRC, MOD, DOM, T74, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v611.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v610 -> v611 run folder copy (missing {p})")
HEAD_OLD = '>{nwTier}</div>\n                    <div style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 6 }}>of U.S. families age 55–64'
M = {
 "K0": ("unmutated", [], "app", []),
 "K1": ("headline back to an average over the rows", [
     ("          // v6.11 (F-19r DF-1): the headline is the net-worth band (`nwTier`, above).",
      "          const _avg = dims.reduce((s, d) => s + (d.tier.startsWith(\"TOP \") ? parseInt(d.tier.slice(4), 10) : 30), 0) / dims.length;\n"
      "          // v6.11 (F-19r DF-1): the headline is the net-worth band (`nwTier`, above)."),
     (HEAD_OLD, HEAD_OLD.replace(">{nwTier}</div>", ">{`TOP ${_avg.toFixed(0)}%`}</div>", 1))], "app", ["A-4", "B-3"]),
 "K2": ("Debt Load gets a fixed tier again", [
     ('              tier: "—",\n              color: "var(--ink-dim)",\n              fallback: _fb.mortgageBal || _fb.mortgageRate,',
      '              tier: "TOP 20%",\n              color: "var(--ink-dim)",\n              fallback: _fb.mortgageBal || _fb.mortgageRate,')], "app", ["A-2", "A-3", "D-7"]),
 "K3": ("unconditional praise in the header", [
     ("Your net worth of {fmtM(netWorth)} sits about the",
      "You are in an exceptionally strong position relative to your peers. Your net worth of {fmtM(netWorth)} sits about the")], "app", ["D-1"]),
 "K4": ("median band dropped", [
     (': netWorth > peers.nwCuts.p50 ? "TOP 50%" : "Below the median";', ': "TOP 50%";')], "app", ["C-1", "D-2"]),
 "K5": ("portfolio floor back", [(': "Below the top 10%",', ': "TOP 25%",')], "app", ["C-3"]),
 "K6": ("Field Manual: tiers built from survey data", [
     ("<p>Two rows are ranked:", "<p>Approximate Top N% tiers built from public survey data. Two rows are ranked:")], "app", ["E-3"]),
 "K7": ("the test skips the Monte Carlo re-run", [
     ("const rerunMC = async () => {", "const rerunMC = async () => { return true;")], "test", ["B-1"]),
 "K8": ("affluent card adds a second verdict", [
     ("Nationally that's about the {ord(Math.round(np))} percentile for your age.",
      "Nationally that's about the {ord(Math.round(np))} percentile for your age — among the wealthier residents you'll live near, you're around the middle.")],
     "app", ["D-1", "D-5", "D-5b"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-\d+b?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); T0 = open(T74, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM), md5(T74))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v611"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v611.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v611.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, where, want = M[label]
    script = "t74_ranking_headline.mjs"
    try:
        if pairs:
            base = (SRC0 if where == "app" else T0).decode("utf-8"); s = base
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            if where == "app": open(SRC, "w", encoding="utf-8").write(s); build()
            else: script = "t74_k7_mutant.mjs"; open(os.path.join(QA, script), "w", encoding="utf-8").write(s)
        r = subprocess.run(["node", script, "v611"], cwd=QA, capture_output=True, timeout=2400)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t74 SUITE \(v611\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        mut = os.path.join(QA, "t74_k7_mutant.mjs")
        if os.path.exists(mut): os.remove(mut)
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM), md5(T74)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}… / {BEFORE[3][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
