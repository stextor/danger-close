#!/usr/bin/env python3
"""controls_v601_brackets.py — negative controls for t65 (docs/SCOPE_D22_BRACKETS_V601.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v601.jsx; the mutant is compiled (qa/mk_testable.sh + the DOM bundle, as mk_runfolder.sh builds them), t65 runs on the v601 leg
(K8 also t2's parity compare), then ./v601.jsx, qa/app_v601.mjs and qa/dom_v601.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v600 -> v601 run folder:  python3 qa/tools/controls_v601_brackets.py [K1 ...]
    K1  a threshold moves (Hawaii single $9,600 -> $9,500) .............................. A-2HI, B-HI, C-HI-1, D-1
    K2  Maryland's county tax removed (local 0.033 -> 0) ................................. A-5, C-MD-1, D-1, E-2
    K3  Arkansas's bracket adjustment removed ............................................. A-3, B-AR3, C-AR-3, C-AR-4, C-AR-5
    K4  the calculator ignores Connecticut's added amounts ................................ C-CT-1, C-CT-2, C-CT-3, C-CT-4, D-1
    K5  the calculator ignores Arkansas's high-income table ............................... B-AR2, C-AR-3, C-AR-7, D-1
    K6  Maryland's capital-gains test reads the state base, not federal AGI ................ C-MD-4
    K7  Connecticut's "or fraction thereof" dropped (ceil -> floor) ........................ C-CT-1, C-CT-6, D-1
    K8  a state outside the seventeen moves (Georgia 4.99 % -> 5 %) ........................ C-GA, D-1, and t2's parity compare fails
    K9  the Field Manual's methodology sentence reverted .................................. E-8, E-10
    K10 My Data's county clause removed ................................................... E-2
    K11 Hawaii's 13 % bracket removed (single) ............................................ A-2HI, A-12, C-HI-2
    K12 Rhode Island's surtax bracket removed ............................................. A-2RI, A-12, C-RI-2
    K0  unmutated ......................................................................... t65 passes
    (K8 runs t2 on both legs and compares; the fingerprint lives in /tmp and is regenerated from the restored source — do not run it beside a suite run)
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v601.jsx")
MOD, DOM = os.path.join(QA, "app_v601.mjs"), os.path.join(QA, "dom_v601.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v600.mjs"), os.path.join(QA, "t65_state_brackets_b2.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v601.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v600 -> v601 run folder copy (missing {p})")
GA = 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0499,'
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Hawaii single threshold moved", "brackets: { single: [[9600, 0.014],", "brackets: { single: [[9500, 0.014],", ["A-2HI", "B-HI", "C-HI-1", "D-1"]),
 "K2": ("Maryland's county tax removed", "local: 0.033, cgSurtax:", "local: 0, cgSurtax:", ["A-5", "C-MD-1", "D-1", "E-2"]),
 "K3": ("Arkansas's bracket adjustment removed", ", adjust: { to: 97600, width: 100, first: 290, step: 10 } }", " }", ["A-3", "B-AR3", "C-AR-3", "C-AR-4", "C-AR-5"]),
 "K4": ("calculator ignores Connecticut's added amounts", "  if (_sa) for (const [over, per, each, max] of _sa)", "  if (false) for (const [over, per, each, max] of _sa)", ["C-CT-1", "C-CT-2", "C-CT-3", "C-CT-4", "D-1"]),
 "K5": ("calculator ignores Arkansas's high-income table", "  if (_up && _stBase > _up.over) {", "  if (false) {", ["B-AR2", "C-AR-3", "C-AR-7", "D-1"]),
 "K6": ("Maryland's capital-gains test on the base", 'if (r.cgSurtax && _stateIncome("agi") > r.cgSurtax.agiOver)', "if (r.cgSurtax && _stBase > r.cgSurtax.agiOver)", ["C-MD-4"]),
 "K7": ("Connecticut's fraction dropped", "_stTax += Math.min(max, each * Math.ceil((_stBase - over) / per));", "_stTax += Math.min(max, each * Math.floor((_stBase - over) / per));", ["C-CT-1", "C-CT-6", "D-1"]),
 "K8": ("Georgia moves", GA, GA.replace("0.0499", "0.05"), ["C-GA", "D-1", "PARITY"]),
 "K9": ("methodology sentence reverted", "taxes every progressive state on its own bracket schedule (ten at v6.00, the other seventeen at v6.01) and each flat-rate state at its one rate,",
        "taxes ten states on their own bracket schedules (v6.00) and uses one rate in place of the brackets for the other progressive states,", ["E-8", "E-10"]),
 "K10": ("My Data's county clause removed", '${STATE_RULES[stateCode].local ? `, plus a ${(STATE_RULES[stateCode].local * 100).toFixed(2)}% county tax` : ""}', "", ["E-2"]),
 "K11": ("Hawaii's 13 % bracket removed (single)", "[325000, 0.1], [500000, 0.11], [null, 0.13]]", "[325000, 0.1], [null, 0.11]]", ["A-2HI", "A-12", "C-HI-2"]),
 "K12": ("Rhode Island's surtax bracket removed", "brackets: { single: [[82050, 0.0375], [186450, 0.0475], [1000000, 0.0599], [null, 0.0899]],", "brackets: { single: [[82050, 0.0375], [186450, 0.0475], [null, 0.0599]],", ["A-2RI", "A-12", "C-RI-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-[A-Za-z0-9]+(?:-[0-9]+)?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v601"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v601.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v601.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t65_state_brackets_b2.mjs", "v601"], cwd=QA, capture_output=True, timeout=900)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t65 SUITE \(v601\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if w != "PARITY" and not any(cid(l) == w for l in failed)]
        par = ""
        if "PARITY" in want:
            subprocess.run(["node", "t2_engines.mjs", "v600"], cwd=QA, capture_output=True, timeout=900)
            subprocess.run(["node", "t2_engines.mjs", "v601"], cwd=QA, capture_output=True, timeout=900)
            c = subprocess.run(["node", "t2_engines.mjs", "compare", "v600", "v601"], cwd=QA, capture_output=True, timeout=900)
            t = re.findall(r"(\d+) passed, (\d+) failed", c.stdout.decode("utf-8", "replace"))
            if not (t and int(t[-1][1]) > 0): miss.append("PARITY")
            par = f"; t2 compare {t[-1] if t else 'no tally'}"
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}{par}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        if "PARITY" in want: subprocess.run(["node", "t2_engines.mjs", "v601"], cwd=QA, capture_output=True, timeout=900)   # the restored fingerprint
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
