#!/usr/bin/env python3
"""controls_v590_retexempt.py — negative controls for t55 (docs/SCOPE_D24_RETEXEMPT_AGE.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v590.jsx; the mutant is compiled (qa/mk_testable.sh) and the DOM bundle rebuilt from qa/dom_entry_v590.jsx, t55 runs, then
./v590.jsx, ./qa/app_v590.mjs and ./qa/dom_v590.cjs are RESTORED and hash-checked. Run from the ROOT of a COPY of a v590 run folder
with a real node_modules (never a symlink; never a folder a suite run is using):  python3 qa/tools/controls_v590_retexempt.py [C1 ...]
    C1  Iowa's gate removed ....................................................... IA-1 IA-3 IA-4 IA-7 Z-2 X-1
    C2  Pennsylvania's gate removed (pension rule kept) ........................... PA-1 PA-4 PA-5 Z-2 X-1
    C3  the both-spouses rule loosened to either spouse ........................... IA-4 IA-7 PA-5 X-1
    C4  Pennsylvania's pensions gated with its withdrawals (grid reads the row's flag, as C6) .. PA-3 PA-4 Z-2
    C5  Michigan's cap removed .................................................... MI-2 MI-3 MI-4 MI-5 Z-2 X-1
    C6  Iowa's gate moved to 56 (the grid reads the row, so only the hand cases see it) .. IA-2 IA-5
    C7  Michigan's single cap applied to joint returns ............................ MI-4 X-1
    C0  unmutated ................................................................. t55 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v590.jsx")
MOD, DOM = os.path.join(QA, "app_v590.mjs"), os.path.join(QA, "dom_v590.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t55_retexempt_age.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v590.jsx"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v590 run folder copy")
PA = 'retExemptAge: 60, retExemptPensionAnyAge: true, note: "retirement income exempt — applied here from 60 for IRA and 401(k) withdrawals and Roth conversions (the law'
M = {
 "C0": ("unmutated", None, None, []),
 "C1": ("IA gate removed", "retExemptAge: 55, note:", "note:", ["IA-1", "IA-3", "IA-4", "IA-7", "Z-2", "X-1"]),
 "C2": ("PA gate removed", PA, PA.replace("retExemptAge: 60, ", ""), ["PA-1", "PA-4", "PA-5", "Z-2", "X-1"]),
 "C3": ("either spouse", "(_rxOk(_aA) && _rxOk(_aB))", "(_rxOk(_aA) || _rxOk(_aB))", ["IA-4", "IA-7", "PA-5", "X-1"]),
 "C4": ("PA pensions gated", PA, PA.replace("retExemptPensionAnyAge: true, ", ""), ["PA-3", "PA-4", "Z-2"]),
 "C5": ("MI cap removed", "retCap: { single: 65897, joint: 131794 }, years: { retCap: 2025 }, note:", "note:", ["MI-2", "MI-3", "MI-4", "MI-5", "Z-2", "X-1"]),
 "C6": ("IA gate 56", "retExemptAge: 55, note:", "retExemptAge: 56, note:", ["IA-2", "IA-5"]),
 "C7": ("MI single cap on joint", "(single ? r.retCap.single : r.retCap.joint)", "(r.retCap.single)", ["MI-4", "X-1"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v590"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v590.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v590.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t55_retexempt_age.mjs", "v590"], cwd=QA, capture_output=True, text=True, timeout=300)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t55 SUITE \(v590\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr[-200:]}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        extra = sorted({l.split()[1] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v590_retexempt: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
