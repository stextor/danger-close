#!/usr/bin/env python3
"""controls_v578_irmaa.py — negative controls for SCOPE_IRMAA_TOP_TIER §5 (t44, and t10's exact-threshold gate).
Coverage is DEMONSTRATED, never inferred (OPERATIONS §B2). Each source control plants one breakage in a copy of the v5.78
source, builds it, runs t44 against it (gated as v578, module path as argv[3]) and REQUIRES the named checks to fire.
    M0  unmutated v5.78 ............................................. t44 must PASS (the control of the controls)
    M1  the helper reverts to `<=` at the top tier (C-1 returns) ..... the statute sweep, Engine A and Engine C must fire
    M2  Engine C gets a PRIVATE `<=` tier loop ....................... Engine C's exact case AND the parser checks must fire
    M3  the helper uses `<` at EVERY tier (the fix leaks downward) ... the lower-edge controls must fire
    M4  the tier table's top label reverts to `>` .................... the source label check must fire
    M5  Engine C's headroom reverts to the full gap at tier 4 (D-1) .. the headroom check must fire
    M6  t10 on the v577 leg with its C1_FIXED gate forced on ......... EXACTLY the two exact-top-threshold cases must fire
        (a TEST-side control: it proves t10's exact case is reached, since t10 prints neither passes nor its results)
USAGE  from the ROOT of a run folder with v578 as the current leg and v577 as the prior:
    python3 qa/tools/controls_v578_irmaa.py          # all seven
    python3 qa/tools/controls_v578_irmaa.py M3       # one
"""
import io, os, re, subprocess, sys
ROOT = os.getcwd(); SRC = os.path.join(ROOT, "v578.jsx"); QA = os.path.join(ROOT, "qa")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(QA, "mk_testable.sh")):
    sys.exit("run from the ROOT of a v578 run folder (needs ./v578.jsx and ./qa/mk_testable.sh)")
HELPER = "    if (top ? magi < thr : magi <= thr) return i;"
C_CALL = "    return irmaaTierFor(magi, tiersFor(filingSingleI).map(t => t.magiUpper), magiYr + 2, _asOfYr);"
MUTANTS = {
    "M0": ("unmutated v5.78 — t44 must pass", None, None, ["__PASS__"]),
    "M1": ("the helper reverts to <= at the top tier", HELPER, "    if (magi <= thr) return i; // CONTROL M1",
           ["A-1", "A-2", "B-1", "B-2", "B-6"]),
    "M2": ("Engine C gets a private <= tier loop", C_CALL,
           "    { const TT = tiersFor(filingSingleI); for (let i = 0; i < TT.length; i++) { if (magi <= irmaaThresholdFor(TT[i].magiUpper,"
           " i === TT.length - 2, magiYr + 2, _asOfYr)) return i; } return TT.length - 1; } // CONTROL M2",
           ["B-6", "E-1", "E-3"]),
    "M3": ("the helper uses < at every tier", HELPER, "    if (magi < thr) return i; // CONTROL M3", ["A-1", "A-4", "C-1"]),
    "M4": ("the top label reverts to >", "t.magiUpper === Infinity ? `≥ $${", "t.magiUpper === Infinity ? `> $${", ["E-4"]),
    "M5": ("Engine C's headroom reverts to the full gap at tier 4",
           "      : tier === _TT.length - 2 ? Math.max(0, nextTierUpper - magi - 1) : nextTierUpper - magi;",
           "      : nextTierUpper - magi; // CONTROL M5", ["C-2"]),
}
def fired_of(out): return [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
def run_source(label):
    desc, anchor, repl, must = MUTANTS[label]
    src = io.open(SRC, encoding="utf-8").read()
    if anchor is not None:
        n = src.count(anchor)
        if n != 1: return False, f"anchor found {n} times (must be exactly 1) — the mutation did not land"
        src = src.replace(anchor, repl, 1)
    tag = "ir" + label.lower(); made = [os.path.join(ROOT, tag + ".jsx"), os.path.join(QA, f"app_{tag}.jsx"), os.path.join(QA, f"app_{tag}.mjs")]
    try:
        io.open(made[0], "w", encoding="utf-8").write(src)
        b = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
        if b.returncode != 0: return False, "build failed: " + (b.stderr or b.stdout)[-300:]
        r = subprocess.run(["node", "t44_irmaa_top_tier.mjs", "v578", f"./app_{tag}.mjs"], cwd=QA, capture_output=True, text=True, timeout=280)
    finally:
        for f in made:
            if os.path.exists(f): os.remove(f)
    m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
    if not m: return False, "t44 did not report a total (DIED?): " + (r.stdout + r.stderr)[-300:]
    npass, nfail = int(m.group(1)), int(m.group(2)); fired = fired_of(r.stdout)
    if must == ["__PASS__"]: return nfail == 0 and npass >= 30, f"t44: {npass} passed, {nfail} failed"
    missing = [f for f in must if not any(x.startswith(f) for x in fired)]
    return (nfail > 0 and not missing), f"t44: {nfail} fired" + (f"; EXPECTED BUT SILENT: {missing}" if missing else "") + "\n" + \
        "\n".join("        \u2717 " + x[:110] for x in fired[:8])
def run_m6():
    t10 = io.open(os.path.join(QA, "t10_taxcases.mjs"), encoding="utf-8").read()
    anchor = 'const C1_FIXED = VER === "v577" || VER === "v578";'
    if t10.count(anchor) != 1:
        anchor = 'const C1_FIXED = VER === "v578";'
        if t10.count(anchor) != 1: return False, "t10's C1_FIXED gate not found exactly once"
    tmp = os.path.join(QA, "t10_ctl_m6.mjs")
    try:
        io.open(tmp, "w", encoding="utf-8").write(t10.replace(anchor, "const C1_FIXED = true; // CONTROL M6", 1))
        r = subprocess.run(["node", "t10_ctl_m6.mjs", "v577"], cwd=QA, capture_output=True, text=True, timeout=280)
    finally:
        if os.path.exists(tmp): os.remove(tmp)
    fired = fired_of(r.stdout)
    ok = len(fired) == 2 and all("exactly the top threshold" in x for x in fired)
    return ok, f"t10 on v577 with the gate forced: {len(fired)} fired (must be exactly the two exact-top cases)\n" + \
        "\n".join("        \u2717 " + x[:120] for x in fired[:4])
labels = sys.argv[1:] or list(MUTANTS) + ["M6"]; bad = 0
for lab in labels:
    ok, detail = run_m6() if lab == "M6" else run_source(lab); bad += 0 if ok else 1
    desc = "t10's exact-threshold gate forced on (v577 leg)" if lab == "M6" else MUTANTS[lab][0]
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {desc}\n        {detail}", flush=True)
print(f"\ncontrols_v578_irmaa: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
