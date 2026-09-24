#!/usr/bin/env python3
"""controls_v576_c7.py — negative controls for t42_single_spouse_b_ss (SCOPE_SINGLE_HOUSEHOLD_SPOUSE_B_SS §5).

Coverage is DEMONSTRATED, never inferred (OPERATIONS §B2). Each control plants one breakage in a copy of the
v5.76 source, builds it (and its DOM bundle), runs t42 against it gated as v576, and REQUIRES t42 to fail.

    M0  unmutated v5.76 ................................................. t42 must PASS (the control of the controls)
    M1  remove the single test from getSSB() (D-1) ...................... B-1 and the X-1 sweep must fire
    M2  restore the loader's $1,300 default for a single plan (D-3) ..... C-1 must fire
    M3  re-add a DIRECT read of spouse B's benefit in the Withdrawal plan  the X-1 sweep must fire — this is the
                                                                          control that proves the sweep catches a
                                                                          read that bypasses getSSB() entirely
    M4  the D-2 note never renders ...................................... N-2 must fire
    M5  the D-2 note renders for any single plan, stored figure or not .. N-4 must fire

USAGE — from the ROOT of a run folder with v576 as the current leg:
    python3 qa/tools/controls_v576_c7.py          # all six
    python3 qa/tools/controls_v576_c7.py M3       # one
"""
import io, os, re, subprocess, sys
ROOT = os.getcwd(); SRC = os.path.join(ROOT, "v576.jsx")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(ROOT, "qa", "mk_testable.sh")):
    sys.exit("run from the ROOT of a v576 run folder (needs ./v576.jsx and ./qa/mk_testable.sh)")

MUTANTS = {
    "M0": ("unmutated v5.76 — t42 must pass", None, None, [], False),
    "M1": ("remove the single test from getSSB()",
           "  if (PORTFOLIO.single) return 0;\n", "  // CONTROL M1: single test removed\n", ["B-1", "X-1"], False),
    "M2": ("restore the loader's $1,300 default for a single plan",
           "      ? { tableByAge: {}, planned: 0, plannedAge: 67 }\n",
           "      ? { tableByAge: {}, planned: 1300, plannedAge: 63, isDefault: true } // CONTROL M2\n", ["C-1"], False),
    "M3": ("re-add a direct read of spouse B's benefit in the Withdrawal plan",
           "function computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset }) {",
           "function computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset }) { const getSSB = () => PORTFOLIO.incomeSources?.ssB?.planned ?? 0; // CONTROL M3",
           ["X-1"], False),
    "M4": ("the D-2 note never renders",
           "        if (!PORTFOLIO.single || !_sb || _sb.isDefault || !(Number(_sb.planned) > 0)) return null;",
           "        return null; // CONTROL M4", ["N-2"], True),
    "M5": ("the D-2 note renders for any single plan",
           "        if (!PORTFOLIO.single || !_sb || _sb.isDefault || !(Number(_sb.planned) > 0)) return null;",
           "        if (!PORTFOLIO.single || !_sb) return null; // CONTROL M5", ["N-4"], True),
}

def run(label):
    desc, anchor, repl, must, dom = MUTANTS[label]
    src = io.open(SRC, encoding="utf-8").read()
    if anchor is not None:
        n = src.count(anchor)
        if n != 1: return False, f"anchor found {n} times (must be exactly 1) — the mutation did not land"
        src = src.replace(anchor, repl, 1)
    tag = "c7" + label.lower(); made = []
    io.open(os.path.join(ROOT, tag + ".jsx"), "w", encoding="utf-8").write(src); made.append(os.path.join(ROOT, tag + ".jsx"))
    b = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
    made += [os.path.join(ROOT, "qa", f"app_{tag}.jsx"), os.path.join(ROOT, "qa", f"app_{tag}.mjs")]
    if b.returncode != 0: return False, "build failed: " + (b.stderr or b.stdout)[-300:]
    env = dict(os.environ)
    if dom or label == "M0":
        entry = os.path.join(ROOT, "qa", f"dom_entry_{tag}.jsx"); bundle = os.path.join(ROOT, "qa", f"dom_{tag}.cjs")
        io.open(entry, "w").write(io.open(os.path.join(ROOT, "qa", "dom_entry_v576.jsx")).read().replace("app_v576.jsx", f"app_{tag}.jsx"))
        d = subprocess.run(["npx", "esbuild", entry, "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                            "--jsx=automatic", f"--outfile={bundle}", "--log-level=error"], cwd=ROOT, capture_output=True, text=True)
        made += [entry, bundle]
        if d.returncode != 0: return False, "DOM bundle failed: " + d.stderr[-300:]
        env["T42_DOM"] = f"./dom_{tag}.cjs"
    r = subprocess.run(["node", "t42_single_spouse_b_ss.mjs", "v576", f"./app_{tag}.mjs"], cwd=os.path.join(ROOT, "qa"),
                       capture_output=True, text=True, env=env, timeout=280)
    for f in made:
        if os.path.exists(f): os.remove(f)
    m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
    if not m: return False, "t42 did not report a total (DIED?): " + (r.stdout + r.stderr)[-400:]
    npass, nfail = int(m.group(1)), int(m.group(2))
    fired = [l.strip()[2:] for l in r.stdout.splitlines() if l.strip().startswith("\u2717")]
    if label == "M0": return nfail == 0 and npass >= 34, f"{npass} passed, {nfail} failed"
    missing = [f for f in must if not any(f in x for x in fired)]
    return (nfail > 0 and not missing), f"{nfail} fired" + ("" if not missing else f"; EXPECTED BUT SILENT: {missing}") + \
           "\n" + "\n".join("        \u2717 " + x[:120] for x in fired[:6])

labels = sys.argv[1:] or list(MUTANTS); bad = 0
for lab in labels:
    ok, detail = run(lab); bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {MUTANTS[lab][0]}\n        {detail}")
print(f"\ncontrols_v576_c7: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
