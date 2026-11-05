#!/usr/bin/env python3
"""controls_v645_ladder_seed.py — negative controls for t109 (docs/SCOPE_D76_LADDER_SEED_V645.md §3.4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v645.jsx (each target occurs exactly once), rebuilds qa/app_v645.mjs and qa/dom_v645.cjs as mk_runfolder.sh builds
  them, runs t109 on the v645 leg, then RESTORES the three files and hash-checks them. t109's §C needs qa/dom_v644.cjs (a v644 -> v645
  run folder), and takes about five minutes a run.
Run from the ROOT of a COPY of a v644 -> v645 run folder:  python3 qa/tools/controls_v645_ladder_seed.py [K1 ...]
  the seeds (DJ-1 (b))
    K1  the Roth seed's example fallback restored ($356,813 × the carry) ............................... A-2, A-3, B-2, B-3
    K2  the Traditional seed's example fallback restored ($1,340,645) .................................. A-2, A-3, B-5, D-3
    K3  a new literal fallback planted elsewhere (`_rsbL.othHsa || 15000`, no display effect) ............. A-3
    K5  the Roth seed read uncarried (`_rsbL.rothInit` — the example's column moves) ......................... C-1
    K6  a listed fallback changed (the home value's 500000 → 400000) ...................................... A-3
  the note (DJ-2 (a), keyed to the ladder's result)
    K4a shown always ................................................................................... A-4, B-8
    K4b shown never .................................................................................... B-8
    K4c keyed to the start Traditional instead of the result (annOnly loses it, noTradLaterB2 gains it) .... A-4, B-8
    K4d the empty-ladder clause dropped (`[].every` is true: bothPast gains it) ........................... B-8
    K4e the slider clause dropped (noTrad at a $0 slider gains it) ........................................ B-8
  the other seeds (the build review)
    K8  spouse B's Traditional seed scaled (× 1.1) ......................................................... C-1, D-1
    K9  spouse B's annuity seed dropped (her $7,000 annuity converted and counted) ......................... C-1, D-1
  the copy
    K7  §13's v6.45 note removed, the whole item ......................................................... E-1, E-2
    C0  unmutated ....................................................................................... t109 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v645.jsx"); MOD = os.path.join(QA, "app_v645.mjs"); DOM = os.path.join(QA, "dom_v645.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t109_ladder_seed.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v645.jsx"),
          os.path.join(QA, "dom_v644.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v644 -> v645 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
_i = ORIG.find("<li><strong>The Roth conversion ladder’s starting balances (v6.45).</strong>")
NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] + "\\n      " if _i >= 0 else "<missing>"
NC = "          const _nothingConverts = rothAmount > 0 && rows.length > 0 && rows.every(r => r.conversion === 0);"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("the Roth seed's example fallback restored",
        [("          const rothBal0 = _cL.rothInitA + _cL.rothInitB;", "          const rothBal0 = _rothFromPortfolio > 0 ? _cL.rothInitA + _cL.rothInitB : 356813 * _rbL;")],
        ["A-2", "A-3", "B-2", "B-3"]),
 "K2": ("the Traditional seed's example fallback restored",
        [("          const tradBal0 = _tradFromPortfolio;", "          const tradBal0 = _tradFromPortfolio > 0 ? _tradFromPortfolio : 1340645;"),
         ("          let tradBalA = _perSeed ? _cL.tradInitA : 0;", "          let tradBalA = _perSeed ? _cL.tradInitA : tradBal0 * _rbL;")],
        ["A-2", "A-3", "B-5", "D-3"]),
 "K3": ("a new literal fallback planted (`_rsbL.othHsa || 15000`)",
        [("taxableInitAll() - (_rsbL.othHsa || 0)) * (taxYield / 100));", "taxableInitAll() - (_rsbL.othHsa || 15000)) * (taxYield / 100));")], ["A-3"]),
 "K4a": ("the note shown always", [(NC, "          const _nothingConverts = true;")], ["A-4", "B-8"]),
 "K4b": ("the note shown never", [("              {_nothingConverts && (\n", "              {false && (\n")], ["B-8"]),
 "K4c": ("the note keyed to the start Traditional", [(NC, "          const _nothingConverts = rothAmount > 0 && rows.length > 0 && _tradFromPortfolio === 0;")], ["A-4", "B-8"]),
 "K4d": ("the empty-ladder clause dropped", [(NC, NC.replace("rows.length > 0 && ", ""))], ["B-8"]),
 "K4e": ("the slider clause dropped", [(NC, NC.replace("rothAmount > 0 && ", ""))], ["B-8"]),
 "K8": ("spouse B's Traditional seed scaled", [("          let tradBalB = _perSeed ? _cL.tradInitB : 0;", "          let tradBalB = _perSeed ? _cL.tradInitB * 1.1 : 0;")], ["C-1", "D-1"]),
 "K9": ("spouse B's annuity seed dropped", [("          let annBalB = _perSeed ? _cL.tradInitB * _cL.annShareB : 0;", "          let annBalB = 0;")], ["C-1", "D-1"]),
 "K5": ("the Roth seed read uncarried", [("          const rothBal0 = _cL.rothInitA + _cL.rothInitB;", "          const rothBal0 = _rsbL.rothInit;")], ["C-1"]),
 "K6": ("a listed fallback changed (home value 500000 -> 400000)",
        [("parseInt(_homeValMatch[1].replace(/,/g, ''), 10) : 500000);", "parseInt(_homeValMatch[1].replace(/,/g, ''), 10) : 400000);")], ["A-3"]),
 "K7": ("§13's v6.45 note removed", [(NOTE_LI, "")], ["E-1", "E-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v645"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v645.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v645.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t109_ladder_seed.mjs", "v645"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t109 SUITE \(v645\): (\d+) passed, (\d+) failed", out)
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
