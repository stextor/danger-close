#!/usr/bin/env python3
"""controls_v587_age_notes.py — negative controls for t52 (docs/SCOPE_D23_AGE_START_NOTES.md §3, §7). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
run folder's ./v587.jsx; the mutant is compiled with qa/mk_testable.sh AND the DOM bundle is rebuilt from qa/dom_entry_v587.jsx
(t52 reads the DOM bundle), t52 runs, then ./v587.jsx, ./qa/app_v587.mjs and ./qa/dom_v587.cjs are RESTORED and hash-checked.
    C1  New York's note reverted ("59½+") ............................................. T-NY1 T-NY2 T-NY3 X-1 X-5 D-1
    C2  Arkansas's note reverted (silent) ............................................. T-AR1 T-AR2 X-3 X-5
    C3  Georgia's note reverted ("$35K at 62–64") ..................................... T-GA1 T-GA2 X-1 X-5 D-3
    C4  Iowa's note reverted ("55+") .................................................. T-IA1 T-IA2 X-1 X-5
    C5  Pennsylvania's note reverted ("59½+") ......................................... T-PA1 T-PA2 X-1 X-5 D-2
    C6  Oklahoma's note reverted (silent) ............................................. T-OK1 X-3 X-5
    C7  "59½+" planted in a third row whose floor is 65 (Alabama) — the scope's control  X-1
    C8  a FALSE disclosure: Wisconsin says "applied here from 65" (model 67) .......... X-2 X-5
    C9  the engine drifts under a true-looking note: New York gains exclAge 59 .. M-NY1 M-NY2 X-2
    C10 silence elsewhere: Montana's note loses its "65+" ............................. X-3
    C11 Iowa's note drifts into the income-limited selector ........................... X-6
    C0  unmutated ....................................................................... t52 passes
USAGE  from the ROOT of a v587 run folder (never one a suite run is using):  python3 qa/tools/controls_v587_age_notes.py [C1 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v587.jsx")
MOD, DOM = os.path.join(QA, "app_v587.mjs"), os.path.join(QA, "dom_v587.cjs")
need = (SRC, MOD, DOM, os.path.join(QA, "t52_age_start_notes.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v587.jsx"))
if not all(os.path.exists(p) for p in need):
    sys.exit("run from the ROOT of a v587 run folder (needs ./v587.jsx, qa/app_v587.mjs, qa/dom_v587.cjs, qa/dom_entry_v587.jsx, qa/t52_age_start_notes.mjs, qa/mk_testable.sh)")
NEW = {
 "NY": "$20K/person pension & annuity exclusion — applied here from 65, although the law allows it from 59½ (conservative); NYC local tax not modeled",
 "AR": "$6K retirement exclusion — applied here from 65, although the law allows it from 59½ for IRAs and at any age for employer plans (conservative)",
 "GA": "$65K/person retirement-income exclusion at 65+ — applied here from 65 only; the law's $35K at 62–64 is not modelled (conservative); flat rate stepping down",
 "IA": "retirement income fully exempt (2023 law) — applied here at any age, although the law exempts it only from 55 (or on disability, or as a survivor), per person; for a retiree under 55 the model understates Iowa tax (optimistic)",
 "OK": "$10K retirement exclusion per person — applied here from 65, the model's default age; Oklahoma's own age condition was not verified for this note",
 "PA": "retirement income exempt — applied here at any age, although the law exempts IRA distributions only from 59½ and employer-plan payments only once the plan's own retirement age or service is met; for a younger retiree the model understates Pennsylvania tax (optimistic)",
}
OLD = {"NY": "$20K/person pension & annuity exclusion 59½+; NYC local tax not modeled", "AR": "$6K retirement exclusion",
       "GA": "$65K/person retirement-income exclusion at 65+ ($35K at 62–64); flat rate stepping down", "IA": "retirement income fully exempt for 55+ (2023 law)",
       "OK": "$10K retirement exclusion", "PA": "ALL retirement income exempt for 59½+"}
q = lambda s: 'note: "' + s + '"'
M = {
    "C0": ("unmutated", None, None, []),
    "C1": ("NY reverted", q(NEW["NY"]), q(OLD["NY"]), ["T-NY1", "T-NY2", "T-NY3", "X-1", "X-5", "D-1"]),
    "C2": ("AR reverted", q(NEW["AR"]), q(OLD["AR"]), ["T-AR1", "T-AR2", "X-3", "X-5"]),
    "C3": ("GA reverted", q(NEW["GA"]), q(OLD["GA"]), ["T-GA1", "T-GA2", "X-1", "X-5", "D-3"]),
    "C4": ("IA reverted", q(NEW["IA"]), q(OLD["IA"]), ["T-IA1", "T-IA2", "X-1", "X-5"]),
    "C5": ("PA reverted", q(NEW["PA"]), q(OLD["PA"]), ["T-PA1", "T-PA2", "X-1", "X-5", "D-2"]),
    "C6": ("OK reverted", q(NEW["OK"]), q(OLD["OK"]), ["T-OK1", "X-3", "X-5"]),
    "C7": ("59½+ planted in Alabama (floor 65)", "$6K 65+ IRA/401k exclusion", "$6K 59½+ IRA/401k exclusion", ["X-1"]),
    "C8": ("false disclosure in Wisconsin", "the model applies it from age 67, as the statute requires", "applied here from 65, as the statute requires", ["X-2", "X-5"]),
    "C9": ("New York gains exclAge 59", "excl65: 20000, note:", "excl65: 20000, exclAge: 59, note:", ["M-NY1", "M-NY2", "X-2"]),
    "C10": ("Montana's note goes silent", "subtraction for each person 65+,", "subtraction for each person,", ["X-3"]),
    "C11": ("Iowa drifts into the income-limited selector", "understates Iowa tax (optimistic)", "understates Iowa tax (optimistic); not income-limited", ["X-6"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v587"], cwd=ROOT, capture_output=True, text=True, check=True)
    # exactly mk_runfolder.sh's invocation, from the ROOT with qa/ paths (esbuild writes paths into bundle comments; see v586's controls)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v587.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                    "--jsx=automatic", "--outfile=qa/dom_v587.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t52_age_start_notes.mjs", "v587"], cwd=QA, capture_output=True, text=True, timeout=400)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t52 SUITE \(v587\): (\d+) passed, (\d+) failed", r.stdout)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w} ") for l in failed)]
        extra = sorted({l.split()[1] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD), md5(DOM)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v587_age_notes: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
