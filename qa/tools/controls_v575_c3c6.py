#!/usr/bin/env python3
"""controls_v575_c3c6.py — negative controls for t41_survivor_age_gains (SCOPE_SURVIVOR_AGE_AND_GAINS_DEDUCTION §5).

Coverage is DEMONSTRATED, never inferred (OPERATIONS §B2). Each control plants one specific breakage in a
copy of the v5.75 source, builds it, runs t41 against it gated as v575, and REQUIRES t41 to fail. A control
under which t41 stays green means the assertion it targets was never testing what it claims.

    M0  unmutated v5.75 ........................................ t41 must PASS (the control of the controls)
    M1  revert the single-return rule to Math.max(ageA, ageB) .. the survivor pins (A-6..A-11, B-1, B-5) must fail
    M2  give the OBBBA bonus its own age test again ............ A-6 must fail — the bonus had a SECOND copy of
                                                                  the rule until v5.75, and X-2 exists because a
                                                                  test of the §63(f) extra alone would miss it
    M3  floor Engine B's REGULAR stack ......................... the C-6 totals (D-1) must fail
    M4  floor Engine B's AMT stack ............................. THE PHANTOM-AMT CONTROL. The totals stay right
                                                                  and D-2 alone must fire: this is the half-fix
                                                                  that a total-only test would have passed
    M5  floor one Engine A REGULAR site ........................ Engine A's C-6 pins (D-3) must fail
    M6  floor Engine A's SALE gross-up stack ................... the sale sites are otherwise unproven: if t41
                                                                  stays green here, no case reaches them
    M7  floor the hoisted projection's ages .................... C-1/C-2 must fail (the D-7 hoist's purpose)

USAGE — from the ROOT of a run folder built by qa/mk_runfolder.sh with v575 as the current leg:
    python3 qa/tools/controls_v575_c3c6.py            # all eight, in order
    python3 qa/tools/controls_v575_c3c6.py M4         # one control
Asserts nothing into any suite total; it is a coverage proof, run at build time and recorded in the CHANGELOG.
"""
import io, os, re, subprocess, sys

ROOT = os.getcwd()
SRC = os.path.join(ROOT, "v575.jsx")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(ROOT, "qa", "mk_testable.sh")):
    sys.exit("run from the ROOT of a v575 run folder (needs ./v575.jsx and ./qa/mk_testable.sh)")

MUTANTS = {
    "M0": ("unmutated v5.75 — t41 must pass", None, None, []),
    "M1": ("revert the single-return rule to Math.max(ageA, ageB)",
           "  return (filerIsA ? ageA : ageB) >= 65 ? 1 : 0;",
           "  return Math.max(ageA, ageB) >= 65 ? 1 : 0; // CONTROL M1",
           ["A-6", "A-9", "B-1", "B-5"]),
    "M2": ("give the OBBBA bonus its own age test again",
           "      const persons65 = persons65OnReturn(effSingle, ageA, ageB, _survivorIsA);",
           "      const persons65 = effSingle ? (Math.max(ageA, ageB) >= 65 ? 1 : 0) : ((ageA >= 65 ? 1 : 0) + (ageB >= 65 ? 1 : 0)); // CONTROL M2",
           ["A-6"]),
    "M3": ("floor Engine B's REGULAR stack",
           "const capGainsTax = ltcgTax(qdcg_y, grossOrdinary - totalDeductions, yr);",
           "const capGainsTax = ltcgTax(qdcg_y, Math.max(0, grossOrdinary - totalDeductions), yr); // CONTROL M3",
           ["D-1"]),
    "M4": ("floor Engine B's AMT stack (the phantom-AMT control)",
           "+ ltcgTax(qdcg_y, amti - amtExempt, yr);",
           "+ ltcgTax(qdcg_y, Math.max(0, amti - amtExempt), yr); // CONTROL M4",
           ["D-2"]),
    "M5": ("floor one Engine A REGULAR site",
           "const qdcgTax = ltcgF(qdcg, grossOrd - ded, yr, LT);",
           "const qdcgTax = ltcgF(qdcg, Math.max(0, grossOrd - ded), yr, LT); // CONTROL M5",
           ["D-3"]),
    "M6": ("floor Engine A's SALE gross-up stack",
           "const _stack = (grossOrd - ded) + qdcg; // v5.75 C-6: signed",
           "const _stack = Math.max(0, grossOrd - ded) + qdcg; // CONTROL M6",
           ["D-4"]),
    "M7": ("floor the hoisted projection's ages",
           "  const senior = seniorExtraFor(filingSingle, ageA, ageB, year, asOfYr, survivorIsA);",
           "  const senior = seniorExtraFor(filingSingle, ageA, ageB, year, asOfYr, ageA >= ageB); // CONTROL M7",
           ["C-1"]),
}

def run(label):
    desc, anchor, repl, must = MUTANTS[label]
    src = io.open(SRC, encoding="utf-8").read()
    if anchor is not None:
        n = src.count(anchor)
        if n != 1:
            return False, f"anchor found {n} times (must be exactly 1) — the mutation did not land; the control proves nothing"
        src = src.replace(anchor, repl, 1)
    tag = "c3c6" + label.lower()
    io.open(os.path.join(ROOT, tag + ".jsx"), "w", encoding="utf-8").write(src)
    b = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
    if b.returncode != 0:
        return False, "build failed: " + (b.stderr or b.stdout)[-300:]
    r = subprocess.run(["node", "t41_survivor_age_gains.mjs", "v575", f"./app_{tag}.mjs"],
                       cwd=os.path.join(ROOT, "qa"), capture_output=True, text=True)
    out = r.stdout
    m = re.search(r"(\d+) passed, (\d+) failed", out)
    if not m:
        return False, "t41 did not report a total (DIED?): " + (out + r.stderr)[-400:]
    npass, nfail = int(m.group(1)), int(m.group(2))
    fired = [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
    for f in (os.path.join(ROOT, tag + ".jsx"), os.path.join(ROOT, "qa", f"app_{tag}.jsx"), os.path.join(ROOT, "qa", f"app_{tag}.mjs")):
        if os.path.exists(f): os.remove(f)
    if label == "M0":
        return (nfail == 0), f"{npass} passed, {nfail} failed"
    missing = [frag for frag in must if not any(frag in x for x in fired)]
    ok = nfail > 0 and not missing
    detail = f"{nfail} assertion(s) fired" + ("" if not missing else f"; EXPECTED BUT SILENT: {missing}")
    return ok, detail + "\n" + "\n".join("        \u2717 " + x[:130] for x in fired[:8])

labels = sys.argv[1:] or list(MUTANTS)
bad = 0
for lab in labels:
    ok, detail = run(lab)
    bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {MUTANTS[lab][0]}\n        {detail}")
print(f"\ncontrols_v575_c3c6: {len(labels) - bad} of {len(labels)} behaved as required")
sys.exit(1 if bad else 0)
