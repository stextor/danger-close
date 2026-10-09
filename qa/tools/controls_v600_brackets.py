#!/usr/bin/env python3
"""controls_v600_brackets.py — negative controls for t64 (docs/SCOPE_D22_BRACKETS_V600.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v600.jsx; the mutant is compiled (qa/mk_testable.sh + the DOM bundle, as mk_runfolder.sh builds them), t64 runs on the v600 leg
(K10: t2's parity compare), then ./v600.jsx, qa/app_v600.mjs and qa/dom_v600.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v599 -> v600 run folder:  python3 qa/tools/controls_v600_brackets.py [K1 ...]
    K1  a threshold moves (NY single $80,650 -> $80,600) ............................ A-2NY, C-NY, D-1
        (B-NY cannot see it: a $50 shift at a 0.5-point step moves the base by $0.25, inside the $1 tolerance New York's rounded bases need)
    K2  California's `rate` is not its top bracket .................................. A-5, A-6
    K3  New York's recapture removed ................................................ A-3, A-4, C-NY
    K4  the calculator ignores schedules (rate x base) .............................. C-CA, C-NJ, D-1
    K5  a joint return reads the single schedule .................................... C-MN, C-WI, D-1
    K6  the recapture without its phase-in (flat at once) ........................... C-NY
    K7  a state outside the ten moves (Georgia 4.99 % -> 5 %) ........................ C-GA, D-1
    K8  a Field Manual sentence reverted ............................................ E-7, E-9
    K9  My Data's model line reverted ............................................... E-2, E-3, E-4
    K10 Georgia moves, so t2's stateTax fingerprint moves ........................... parity fails (t2 v600, then t2 compare v599 v600;
        the fingerprint is regenerated from the restored source afterwards — it lives in /tmp, so do not run this beside a suite run)
    K0  unmutated ................................................................... t64 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v600.jsx")
MOD, DOM = os.path.join(QA, "app_v600.mjs"), os.path.join(QA, "dom_v600.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v599.mjs"), os.path.join(QA, "t64_state_brackets.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v600.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v599 -> v600 run folder copy (missing {p})")
RECAP = 'recapture: { start: 107650, width: 50000, flat: { single: 0.059, joint: 0.054 }, flatUpTo: { single: 215400, joint: 161550 } }, '
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("NY single threshold moved", "[80650, 0.054]", "[80600, 0.054]", ["A-2NY", "C-NY", "D-1"]),
 "K2": ("CA rate is not the top bracket", 'name: "California", years: { brackets: 2025 }, rate: 0.133,', 'name: "California", years: { brackets: 2025 }, rate: 0.123,', ["A-5", "A-6"]),
 "K3": ("NY recapture removed", RECAP, "", ["A-3", "A-4", "C-NY"]),
 "K4": ("calculator ignores schedules", "let _stTax = _sch ? stateBracketTax(_sch, _stBase) : r.rate * _stBase;", "let _stTax = r.rate * _stBase;", ["C-CA", "C-NJ", "D-1"]),
 "K5": ("joint reads the single schedule", "const _sch = r.brackets ? (single ? r.brackets.single : r.brackets.joint) : null;", "const _sch = r.brackets ? r.brackets.single : null;", ["C-MN", "C-WI", "D-1"]),
 "K6": ("recapture without its phase-in", "Math.min(1, Math.round((_stBase - _rc.start) / _rc.width * 1e4) / 1e4)", "1", ["C-NY"]),
 "K7": ("Georgia moves", 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0499,', 'name: "Georgia", years: { excl65: 2026 }, rate: 0.05,', ["C-GA", "D-1"]),
 "K8": ("Field Manual sentence reverted", "for the other progressive states one rate stands in for the brackets, no state's standard deduction or personal exemption is taken (conservative),", "effective rates stand in for progressive brackets,", ["E-7", "E-9"]),
 "K9": ("My Data line reverted", "Model: {STATE_RULES[stateCode].brackets ? `the state's own brackets, ${(STATE_RULES[stateCode].brackets.single[0][1] * 100).toFixed(2)}% to ${(STATE_RULES[stateCode].rate * 100).toFixed(2)}%` : `${(STATE_RULES[stateCode].rate * 100).toFixed(2)}% effective rate (an approximation)`}",
        "Model: {(STATE_RULES[stateCode].rate * 100).toFixed(2)}% effective rate (an approximation)", ["E-2", "E-3", "E-4"]),
 "K10": ("Georgia moves: t2 parity", 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0499,', 'name: "Georgia", years: { excl65: 2026 }, rate: 0.05,', ["PARITY"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-[A-Za-z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v600"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v600.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v600.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        if label == "K10":
            subprocess.run(["node", "t2_engines.mjs", "v599"], cwd=QA, capture_output=True, timeout=900)
            subprocess.run(["node", "t2_engines.mjs", "v600"], cwd=QA, capture_output=True, timeout=900)
            r = subprocess.run(["node", "t2_engines.mjs", "compare", "v599", "v600"], cwd=QA, capture_output=True, timeout=900)
            out = r.stdout.decode("utf-8", "replace"); t = re.findall(r"(\d+) passed, (\d+) failed", out)
            red = bool(t) and int(t[-1][1]) > 0
            return f"K10 {'FIRES' if red else 'MISSED [PARITY]'} — {desc}; t2 compare: {t[-1] if t else 'no tally'}" + (" (stateTax named)" if "stateTax" in out else "")
        r = subprocess.run(["node", "t64_state_brackets.mjs", "v600"], cwd=QA, capture_output=True, timeout=900)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t64 SUITE \(v600\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        if label == "K10": subprocess.run(["node", "t2_engines.mjs", "v600"], cwd=QA, capture_output=True, timeout=900)   # the restored fingerprint
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
