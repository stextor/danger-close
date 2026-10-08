#!/usr/bin/env python3
"""controls_v596_survivor_state.py — negative controls for t60 (docs/SCOPE_D27_ENGINE_A_SURVIVOR_STATE.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v596.jsx; the mutant is compiled (qa/mk_testable.sh), t60 runs on the v596 leg, then ./v596.jsx and ./qa/app_v596.mjs are
RESTORED and hash-checked. Run from the ROOT of a COPY of a v595 -> v596 run folder:  python3 qa/tools/controls_v596_survivor_state.py [K1 ...]
    K1  the year call files by the household flag again (the v5.95 defect) .......... A-2, A-3, D-2, B-MI
        (with the decedent's age still blanked, GA's and ME's relief counts one person either way; only a cap or threshold
         keyed on filing status sees the flag — MI's joint cap. The first run named B-GA/B-ME and missed: the prediction was wrong.)
    K2  the ACA estimate call files by the household flag again ..................... D-2   (AST only: no runtime household reaches it)
    K3  the decedent's age is not blanked in survivor years ........................ A-2
    K4  the survivor's benefit is not moved into the survivor's slot ............... A-4
    K5  the Field Manual line is lost ............................................... E-1
    K6  Engine C moves (IRMAA surcharge + 1) ........................................ C-1
    K7  survivor-year state retirement income dropped (a strategy's tax can fall) ... C-2
    K8  a pre-death year filed single (a move outside survivor years) .............. C-3, A-1
    K0  unmutated ................................................................... t60 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v596.jsx"); MOD = os.path.join(QA, "app_v596.mjs")
for p in (SRC, MOD, os.path.join(QA, "app_v595.mjs"), os.path.join(QA, "t60_engineA_survivor_state.mjs"), os.path.join(QA, "mk_testable.sh")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v595 -> v596 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("year call files by the household flag", ": _ageBs, single: !!effSingle,", ": _ageBs, single: !!P.single,", ["A-2", "A-3", "D-2", "B-MI"]),
 "K2": ("ACA estimate files by the household flag", ": _ageBc, single: !!effSingle,", ": _ageBc, single: !!P.single,", ["D-2"]),
 "K3": ("decedent's age not blanked", "ageA: ((effSingle && !P.single) && !survivorIsA) ? null : _ageAs,", "ageA: _ageAs,", ["A-2"]),
 "K4": ("benefit not moved to the survivor's slot",
        "ssTaxableFed: ssT, ssGrossA: (effSingle && !P.single) ? (survivorIsA ? ssA_y + ssB_y : 0) : ssA_y, ssGrossB: (effSingle && !P.single) ? (survivorIsA ? 0 : ssA_y + ssB_y) : ssB_y,",
        "ssTaxableFed: ssT, ssGrossA: ssA_y, ssGrossB: ssB_y,", ["A-4"]),
 "K5": ("Field Manual line lost", "As of v5.96 the Roth comparator also files", "As of v5.96 the Roth tab also files", ["E-1"]),
 "K6": ("Engine C moves", "surchargePerPerson: IRMAA_CONSTS.SUR[i],", "surchargePerPerson: IRMAA_CONSTS.SUR[i] + 1,", ["C-1"]),
 "K7": ("survivor-year retirement income dropped", "retIncome: rmd + draw_y + conv, pen: pen,", "retIncome: ((effSingle && !P.single) ? 0 : 1) * (rmd + draw_y + conv), pen: pen,", ["C-2"]),
 "K8": ("a pre-death year filed single", ": _ageBs, single: !!effSingle,", ": _ageBs, single: !!effSingle || yr === P.retireYr,", ["C-3", "A-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-E]-[A-Za-z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v596"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t60_engineA_survivor_state.mjs", "v596"], cwd=QA, capture_output=True, timeout=900)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t60 SUITE \(v596\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
