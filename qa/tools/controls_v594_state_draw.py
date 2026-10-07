#!/usr/bin/env python3
"""controls_v594_state_draw.py — negative controls for t58 (docs/SCOPE_D26_STATE_TAX_DRAW.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v594.jsx; the mutant is compiled (qa/mk_testable.sh), t58 runs on the v594 leg, then ./v594.jsx and ./qa/app_v594.mjs are
RESTORED and hash-checked. Run from the ROOT of a COPY of a v593 -> v594 run folder with a real node_modules:
    python3 qa/tools/controls_v594_state_draw.py [K1 ...]
    K1  Engine B passes no draw to the state (the v5.93 defect) .................. B-1 B-2 B-NC D-1
    K2  Engine A's year call passes no draw ..................................... A-2 D-1
    K3  Engine A's sale-gain call passes no draw ................................. D-1   (AST only: no runtime check reaches it)
    K4  Engine B routes the draw to `work` (taxed, but denied every exclusion) ...... B-1 B-2 D-1
    K5  Engine B counts the draw twice ............................................ B-1 B-2 B-NC
    K6  Engine A routes the draw to `work` ........................................ A-2 D-1
    K7  the Field Manual line is lost ............................................. E-1
    K8  a federal figure moves (FICA + $1 in Engine B) ............................. C-2 C-3
    K9  Engine C moves (IRMAA surcharge + $1) ...................................... C-1
    K10 an Engine B year's state tax falls ........................................ C-4 B-1
    K0  unmutated ................................................................. t58 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v594.jsx"); MOD = os.path.join(QA, "app_v594.mjs")
need = (SRC, MOD, os.path.join(QA, "app_v593.mjs"), os.path.join(QA, "t58_state_draw.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "shim.txt"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v593 -> v594 run folder copy")
BR = "retIncome: rmdTax_y + conv_y + ordDraw_y, pen: pen_y, work: work_y + otherOrd_y,"
AY = "retIncome: rmd + draw_y + conv, pen: pen, work: work + otherOrd,"
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("B: no draw to the state", BR, "retIncome: rmdTax_y + conv_y, pen: pen_y, work: work_y + otherOrd_y,", ["B-1", "B-2", "B-NC", "D-1"]),
 "K2": ("A year call: no draw", AY, "retIncome: rmd + conv, pen: pen, work: work + otherOrd,", ["A-2", "D-1"]),
 "K3": ("A sale-gain call: no draw", "retIncome: rmd + draw_y + c,", "retIncome: rmd + c,", ["D-1"]),
 "K4": ("B: draw routed to work", BR, "retIncome: rmdTax_y + conv_y, pen: pen_y, work: work_y + otherOrd_y + ordDraw_y,", ["B-1", "B-2", "D-1"]),
 "K5": ("B: draw counted twice", BR, "retIncome: rmdTax_y + conv_y + 2 * ordDraw_y, pen: pen_y, work: work_y + otherOrd_y,", ["B-1", "B-2", "B-NC"]),
 "K6": ("A year call: draw routed to work", AY, "retIncome: rmd + conv, pen: pen, work: work + otherOrd + draw_y,", ["A-2", "D-1"]),
 "K7": ("Field Manual line lost", "As of v5.94 the Traditional dollars the plan draws", "As of v5.94 the Traditional sums the plan draws", ["E-1"]),
 "K8": ("federal moves: FICA + 1", "const fica = work_y > 0 ? (Math.min(work_y, wageBase) * 0.062 + work_y * 0.0145) : 0;",
        "const fica = 1 + (work_y > 0 ? (Math.min(work_y, wageBase) * 0.062 + work_y * 0.0145) : 0);", ["C-2", "C-3"]),
 "K9": ("Engine C moves: surcharge + 1", "surchargePerPerson: IRMAA_CONSTS.SUR[i],", "surchargePerPerson: IRMAA_CONSTS.SUR[i] + 1,", ["C-1"]),
 "K10": ("B: a year's state tax falls", BR, "retIncome: rmdTax_y + conv_y + ordDraw_y - (yr === 2030 ? 30000 : 0), pen: pen_y, work: work_y + otherOrd_y,", ["C-4", "B-1"]),
}
cid = lambda l: (re.match(r"  \u2717 ([A-E]-[A-Z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v594"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t58_state_draw.mjs", "v594"], cwd=QA, capture_output=True, text=True, timeout=280)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t58 SUITE \(v594\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = [run(l) for l in labels]
print("\n".join(out))
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected")
sys.exit(0 if ok and fires == len(out) else 1)
