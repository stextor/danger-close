#!/usr/bin/env python3
"""controls_v588_summary_age.py — negative controls for t53 (docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v588.jsx; the mutant is compiled (qa/mk_testable.sh) and the DOM bundle rebuilt from qa/dom_entry_v588.jsx, t53 runs, then
./v588.jsx, ./qa/app_v588.mjs and ./qa/dom_v588.cjs are RESTORED and hash-checked. Run from the ROOT of a COPY of a v588 run folder
with a real node_modules (never a symlink; never a folder a suite run is using):  python3 qa/tools/controls_v588_summary_age.py [C1 ...]
    C1  the template reverted to "$NK/person 65+ exclusion" ................... S-DE-age S-KY-age S-RI-age S-WI-age S-DE-$ X-2
    C2  the display's default age drifts to 66 (engine untouched) ............. S-AL-age S-GA-age S-NY-age X-3
    C3  the 0 -> "at any age" mapping broken (Kentucky reads "from 0") ........ S-KY-age
    C4  rounding planted back (two significant digits) ........................ S-DE-$ S-KY-$ S-LA-$ S-ME-$ S-MD-$ S-MT-$
    C5  the ENGINE's default age drifts to 64 under an unchanged summary ...... S-AL-age S-GA-age
    C6  an age appears on the exempt rows' wording ............................ X-4-IL X-4-IA X-4-PA
    C0  unmutated .............................................................. t53 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v588.jsx")
MOD, DOM = os.path.join(QA, "app_v588.mjs"), os.path.join(QA, "dom_v588.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t53_mydata_summary_age.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v588.jsx"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v588 run folder copy")
R = 'STATE_RULES[stateCode]'
NEWT = R + '.excl65 ? ` · $${' + R + '.excl65.toLocaleString("en-US")}/person exclusion ${(' + R + '.exclAge ?? 65) === 0 ? "at any age" : `from ${' + R + '.exclAge ?? 65}`}` : ""'
OLDT = R + '.excl65 ? ` · $${(' + R + '.excl65 / 1000).toFixed(0)}K/person 65+ exclusion` : ""'
M = {
 "C0": ("unmutated", None, None, []),
 "C1": ("template reverted", NEWT, OLDT, ["S-DE-age", "S-KY-age", "S-RI-age", "S-WI-age", "S-DE-$", "X-2"]),
 "C2": ("display default 66", NEWT, NEWT.replace("?? 65", "?? 66"), ["S-AL-age", "S-GA-age", "S-NY-age", "X-3"]),
 "C3": ("any-age mapping broken", '=== 0 ? "at any age"', '=== -1 ? "at any age"', ["S-KY-age"]),
 "C4": ("rounding planted", '.excl65.toLocaleString("en-US")}', '.excl65.toLocaleString("en-US", { maximumSignificantDigits: 2 })}', ["S-DE-$", "S-KY-$", "S-LA-$", "S-ME-$", "S-MD-$", "S-MT-$"]),
 "C5": ("engine default 64", "const _floor = (r.exclAge === undefined || r.exclAge === null) ? 65 : r.exclAge;", "const _floor = (r.exclAge === undefined || r.exclAge === null) ? 64 : r.exclAge;", ["S-AL-age", "S-GA-age"]),
 "C6": ("age on the exempt wording", '" · retirement income exempt"', '" · retirement income exempt from 65"', ["X-4-IL", "X-4-IA", "X-4-PA"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v588"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v588.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v588.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t53_mydata_summary_age.mjs", "v588"], cwd=QA, capture_output=True, text=True, timeout=600)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t53 SUITE \(v588\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}"
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v588_summary_age: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
