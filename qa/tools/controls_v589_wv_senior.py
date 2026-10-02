#!/usr/bin/env python3
"""controls_v589_wv_senior.py — negative controls for t54 (docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v589.jsx; the mutant is compiled (qa/mk_testable.sh) and the DOM bundle rebuilt from qa/dom_entry_v589.jsx, t54 runs, then
./v589.jsx, ./qa/app_v589.mjs and ./qa/dom_v589.cjs are RESTORED and hash-checked. Run from the ROOT of a COPY of a v589 run folder
with a real node_modules (never a symlink; never a folder a suite run is using):  python3 qa/tools/controls_v589_wv_senior.py [C1 ...]
    C1  the WV rule removed from _one (back to the additive $8,000) ........... H-1 H-2 H-4 H-6 H-7 H-8 X-1
    C2  the rule's base switched to GROSS SS (the MD/ME base) .................. H-2 H-3 H-7 H-8 X-1
    C3  each person offset by the HOUSEHOLD's taxable SS, not their share ...... H-7 H-8 X-1
    C4  Maryland's ssOffset removed .......................................... P-MD P-flags X-2
    C5  the count-only fallback made generous ($8,000 × n, no offset) ......... H-9
    C6  the WV flag removed from the row .............. H-1 H-2 H-4 H-6 H-7 H-8 H-9 P-flags X-1
    C7  WV given a 64 floor under the same note ............................... 0-1 H-8 X-1
    C8  the note stops saying "modelled per person" ........................... N-1
    C0  unmutated .............................................................. t54 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v589.jsx")
MOD, DOM = os.path.join(QA, "app_v589.mjs"), os.path.join(QA, "dom_v589.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t54_wv_senior_modification.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v589.jsx"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v589 run folder copy")
RULE = "    if (r.seniorVsTaxableSS) return Math.max(0, _cap - Math.max(0, ssTx || 0));\n"
M = {
 "C0": ("unmutated", None, None, []),
 "C1": ("rule removed", RULE, "", ["H-1", "H-2", "H-4", "H-6", "H-7", "H-8", "X-1"]),
 "C2": ("gross base", "Math.max(0, _cap - Math.max(0, ssTx || 0))", "Math.max(0, _cap - Math.max(0, ssGross || 0))", ["H-2", "H-3", "H-7", "H-8", "X-1"]),
 "C3": ("household offset per person", "_one(ageA, ssGrossA, _ssSubA, _txA) + (single ? 0 : _one(ageB, ssGrossB, _ssSubB, _txB))",
        "_one(ageA, ssGrossA, _ssSubA, ssTaxableFed) + (single ? 0 : _one(ageB, ssGrossB, _ssSubB, ssTaxableFed))", ["H-7", "H-8", "X-1"]),
 "C4": ("MD ssOffset removed", "excl65: 40600, ssOffset: true,", "excl65: 40600,", ["P-MD", "P-flags", "X-2"]),
 "C5": ("generous fallback", "r.seniorVsTaxableSS ? Math.max(0, _cap * Math.max(0, persons65) - Math.max(0, ssTaxableFed))", "r.seniorVsTaxableSS ? _cap * Math.max(0, persons65)", ["H-9"]),
 "C6": ("WV flag removed", "seniorVsTaxableSS: true, note:", "note:", ["H-1", "H-2", "H-4", "H-6", "H-7", "H-8", "H-9", "P-flags", "X-1"]),
 "C7": ("WV floor 64", "seniorVsTaxableSS: true, note:", "seniorVsTaxableSS: true, exclAge: 64, note:", ["0-1", "H-8", "X-1"]),
 "C8": ("note drift", "— modelled per person, the household", "— the household", ["N-1"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v589"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v589.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v589.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t54_wv_senior_modification.mjs", "v589"], cwd=QA, capture_output=True, text=True, timeout=300)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t54 SUITE \(v589\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        extra = sorted({l.split()[1] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v589_wv_senior: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
