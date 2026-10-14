#!/usr/bin/env python3
"""controls_v612_c5.py — negative controls for t75 (docs/SCOPE_C5_ENGINE_D_SS86_V612.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each source target occurs exactly once in the
run folder's ./v612.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM
bundle), t75 runs on the v612 leg, then ./v612.jsx, qa/app_v612.mjs and qa/dom_v612.cjs are RESTORED and hash-checked. K8 mutates the TEST
(a throwaway copy, deleted after), not the app.
Run from the ROOT of a COPY of a v611 -> v612 run folder:  python3 qa/tools/controls_v612_c5.py [K1 ...]
    K1  Engine D back to a flat 85% of benefits ........................................................ A, B-1, D-1, D-4
    K2  the joint table for every household and every year (no filing switch) .......................... A, B-4
    K3  the death year filed Single (`>=` for `>`) ....................................................... A
    K4  the table no longer indexed (asOf = the year itself) ............................................. A
    K5  the age-65 extra dropped ........................................................................... A
    K6  realized gain back in the rate's input (DC-1 (b)) ................................................ A, A-6
    K7  a private × 0.85 copy planted in another function (Engine C) ..................................... D-4
    K8  the TEST's oracle stops applying the filing switch .................................................. A
    K9  the rate capped at 32% again ........................................................................ A, A-8
    K10 the table's description loses its Bracket sentence (DC-3) .......................................... E-4
    K0  unmutated ............................................................................................ t75 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v612.jsx")
MOD = os.path.join(QA, "app_v612.mjs"); DOM = os.path.join(QA, "dom_v612.cjs"); T75 = os.path.join(QA, "t75_engine_d_ss86.mjs")
for p in (SRC, MOD, DOM, T75, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v612.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v611 -> v612 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", [], "app", []),
 "K1": ("flat 85% of benefits", [("const taxableSS = taxableSS86(ssA_y + ssB_y, _ordOtherD + capGain_y, _filingSingleD);",
                                  "const taxableSS = (ssA_y + ssB_y) * 0.85;")], "app", ["A", "B-1", "D-1", "D-4"]),
 "K2": ("joint table always", [("const _filingSingleD = _tlW.single || yr > _deathYr1D;", "const _filingSingleD = false;")], "app", ["A", "B-4"]),
 "K3": ("death year filed Single", [("const _filingSingleD = _tlW.single || yr > _deathYr1D;", "const _filingSingleD = _tlW.single || yr >= _deathYr1D;")], "app", ["A"]),
 "K4": ("table not indexed", [("const _pbD = projectBracketsAt(yr, { asOfYr: _tlW.asOfYear,", "const _pbD = projectBracketsAt(yr, { asOfYr: yr,")], "app", ["A"]),
 "K5": ("age-65 extra dropped", [("survivorIsA: _survivorIsAD, ageA, ageB,", "survivorIsA: _survivorIsAD, ageA: 0, ageB: 0,")], "app", ["A"]),
 "K6": ("gain back in the rate's input", [("const _ordTaxableD = taxableSS + _ordOtherD - _pbD.stdDed;",
                                          "const _ordTaxableD = taxableSS + _ordOtherD + capGain_y - _pbD.stdDed;")], "app", ["A", "A-6"]),
 "K7": ("private × 0.85 copy in Engine C", [("    const ssTaxable = taxableSS86(ssTot, ",
                                            "    const _planted85 = ssTot * 0.85; void _planted85;\n    const ssTaxable = taxableSS86(ssTot, ")], "app", ["D-4"]),
 "K8": ("the oracle drops the filing switch", [("  const fs = single || r.yr > d1;", "  const fs = single;")], "test", ["A"]),
 "K9": ("capped at 32%", [("const bracket = _ordTaxableD <= 0 ? 0 : Math.round(100 * _pbD.brackets.find(b => _ordTaxableD <= b.upper).rate);",
                           "const bracket = _ordTaxableD <= 0 ? 0 : Math.min(32, Math.round(100 * _pbD.brackets.find(b => _ordTaxableD <= b.upper).rate));")], "app", ["A", "A-8"]),
 "K10": ("description loses its Bracket sentence", [("                  The Bracket column is the federal marginal rate on the year's ordinary income:",
                                                     "                  The column is the federal marginal rate on the year's ordinary income:")], "app", ["E-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E](?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); T0 = open(T75, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM), md5(T75))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v612"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v612.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v612.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, where, want = M[label]
    script = "t75_engine_d_ss86.mjs"
    try:
        if pairs:
            base = (SRC0 if where == "app" else T0).decode("utf-8"); s = base
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            if where == "app": open(SRC, "w", encoding="utf-8").write(s); build()
            else: script = "t75_k8_mutant.mjs"; open(os.path.join(QA, script), "w", encoding="utf-8").write(s)
        r = subprocess.run(["node", script, "v612"], cwd=QA, capture_output=True, timeout=2400)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t75 SUITE \(v612\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        mut = os.path.join(QA, "t75_k8_mutant.mjs")
        if os.path.exists(mut): os.remove(mut)
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM), md5(T75)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}… / {BEFORE[3][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
