#!/usr/bin/env python3
"""controls_v602_deduct.py — negative controls for t66 (docs/SCOPE_D30_DEDUCTIONS_V602.md §4.1). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v602.jsx; the mutant is compiled (qa/mk_testable.sh + the DOM bundle, as mk_runfolder.sh builds them), t66 runs on the v602 leg
(K9 also t2's parity compare), then ./v602.jsx, qa/app_v602.mjs and qa/dom_v602.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v601 -> v602 run folder:  python3 qa/tools/controls_v602_deduct.py [K1 ...]
    K1  a deduction amount moves (Virginia single $8,750 -> $8,700) ............................ A-2, C-VA-1, C-VA-S, D-2
    K2  a phase threshold moves (Maine single $102,250 -> $102,000) ............................ A-2, B-ME-1, D-2
    K3  "or fraction thereof" dropped in the steps shape (ceil -> floor) ........................ B-CT-2, B-CA-2, B-RI-2, D-2
    K4  the deduction applied after the schedule (taxable income = AGI) ......................... B-C-4, C-AL-1, D-2
    K5  credits refundable against the county tax (no floor before Maryland's county tax) ....... B-C-7
    K6  the cut-off notice removed ............................................................... E-4, E-6, E-10
    K7  the answer cap back to 1,000 tokens ...................................................... E-1, E-3, E-9, E-15
    K8  the timeout back to 45 seconds ........................................................... E-1, E-11, E-16
    K9  a state outside the 27 moves (Georgia 4.99 % -> 5 %) ..................................... D-2, and t2's parity compare fails
    K10 the Field Manual's deduction sentence reverted ........................................... F-5, F-7
    K11 Maryland's senior credit loses its "at least $50,000" row boundary ("lt" dropped) ....... A-2, B-MD-4
    K0  unmutated ................................................................................ t66 passes
    (K9 runs t2 on both legs and compares; the fingerprint lives in /tmp and is regenerated from the restored source — do not run it beside a suite run)
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v602.jsx")
MOD, DOM = os.path.join(QA, "app_v602.mjs"), os.path.join(QA, "dom_v602.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v601.mjs"), os.path.join(QA, "t66_deductions_askai.mjs"), os.path.join(QA, "d30_ref.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v602.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v601 -> v602 run folder copy (missing {p})")
GA = 'name: "Georgia", years: { excl65: 2026 }, rate: 0.0499,'
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("Virginia's single standard deduction moves", 'amt: { single: 8750, joint: 17500 }', 'amt: { single: 8700, joint: 17500 }', ["A-2", "C-VA-1", "C-VA-S", "D-2"]),
 "K2": ("Maine's single phase-out threshold moves", 'start: { single: 102250, joint: 204550 }', 'start: { single: 102000, joint: 204550 }', ["A-2", "B-ME-1", "D-2"]),
 "K3": ("ceil -> floor in the steps shape", '(p.round === "floor" ? Math.floor : Math.ceil)', '(p.round === "floor" ? Math.floor : Math.floor)', ["B-CT-2", "B-CA-2", "B-RI-2", "D-2"]),
 "K4": ("the deduction after the schedule", "const _stTI = _dd ? Math.max(0, _stBase - _dd.ded) : _stBase;", "const _stTI = _stBase;", ["B-C-4", "C-AL-1", "D-2"]),
 "K5": ("credits refundable against the county tax", "if (_dd) _stTax = Math.max(0, _stTax * (1 - _dd.pct) - _dd.credit);", "if (_dd) _stTax = _stTax * (1 - _dd.pct) - _dd.credit;", ["B-C-7"]),
 "K6": ("the cut-off notice removed", "{m.cut && <div data-dc-ai-cutoff=", "{false && <div data-dc-ai-cutoff=", ["E-4", "E-6", "E-10"]),
 "K7": ("the cap back to 1,000 tokens", "const AI_MAX_TOKENS = 4096;", "const AI_MAX_TOKENS = 1000;", ["E-1", "E-3", "E-9", "E-15"]),
 "K8": ("the timeout back to 45 seconds", "const AI_TIMEOUT_MS = 120000;", "const AI_TIMEOUT_MS = 45000;", ["E-1", "E-11", "E-16"]),
 "K9": ("Georgia moves", GA, GA.replace("0.0499", "0.05"), ["D-2", "PARITY"]),
 "K10": ("the Field Manual's deduction sentence reverted",
         "It is an approximation layer: from v6.02 the twenty-seven progressive states take their standard deductions, personal exemptions and personal credits before their schedules (Alabama's, Missouri's and Oregon's deduction of federal income tax, the federal senior deduction Montana and North Dakota start from, and low-income refundable credits are not taken), while the flat-rate states take none yet (conservative),",
         "It is an approximation layer: no state's standard deduction or personal exemption is taken (conservative),", ["F-5", "F-7"]),
 "K11": ("Maryland's senior credit row boundary", 'single: [[50000, 1, "lt"], [100000, 0.5], [null, 0]]', 'single: [[50000, 1], [100000, 0.5], [null, 0]]', ["A-2", "B-MD-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)", l) or [None, None])[1]   # ids like C-VA-S, B-C-7b
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v602"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v602.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v602.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t66_deductions_askai.mjs", "v602"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t66 SUITE \(v602\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if w != "PARITY" and not any(cid(l) == w for l in failed)]
        par = ""
        if "PARITY" in want:
            subprocess.run(["node", "t2_engines.mjs", "v601"], cwd=QA, capture_output=True, timeout=900)
            subprocess.run(["node", "t2_engines.mjs", "v602"], cwd=QA, capture_output=True, timeout=900)
            c = subprocess.run(["node", "t2_engines.mjs", "compare", "v601", "v602"], cwd=QA, capture_output=True, timeout=900)
            t = re.findall(r"(\d+) passed, (\d+) failed", c.stdout.decode("utf-8", "replace"))
            if not (t and int(t[-1][1]) > 0): miss.append("PARITY")
            par = f"; t2 compare {t[-1] if t else 'no tally'}"
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}{par}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        if "PARITY" in want: subprocess.run(["node", "t2_engines.mjs", "v602"], cwd=QA, capture_output=True, timeout=900)   # the restored fingerprint
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
