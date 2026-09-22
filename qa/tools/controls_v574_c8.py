#!/usr/bin/env python3
"""controls_v574_c8.py — negative controls for t40_cross_tab_agreement (SCOPE_TAXES_DRAWDOWN §8).

Coverage is DEMONSTRATED, never inferred (OPERATIONS §B2). Each control plants one specific breakage in a
copy of the v5.74 source, builds it, runs t40 against it gated as v574, and REQUIRES t40 to fail. A control
under which t40 stays green means the assertion it targets was never testing what it claims.

    M0  unmutated v5.74 ........................................ t40 must PASS (the control of the controls)
    M1  zero the draw series inside the bridge ................. the agreement / gap-year / RMD pins must fail
    M2  publish the draw but never add it to ordinaryIncome .... the gap-year and headline pins must fail
    M3  import the draw into Engine B, leave Engine C alone .... the cross-engine (section B) checks must fail
    M4  perturb Engine D's growth by +10% ...................... the shared-path pins must MOVE (the
                                                                  2026-08-11 lesson: a perturbation that
                                                                  moves nothing means coverage was imaginary)
    M5  Engine B adopts Engine D's 3.518% growth ............... the D-9 pins must fail. This is the trap the
                                                                  build brief warned about: a build that copies
                                                                  D's balance path inherits D's growth silently
                                                                  and "succeeds" at $166,270. Added beyond §8's
                                                                  four because §4 of the brief made it THE trap.
    M6  drop the panel's spending-withdrawals line ............. t40 D1/D2 must fail (added 2026-09-21 with section D)
    M7  drop the panel's dividends line ........................ t40 D1/D2 must fail (the older omission, same class)
    M8  change the rothAmount default to 60000 ................. t40 E0 must fail — "first open" is tied to the source

USAGE — from the ROOT of a run folder built by qa/mk_runfolder.sh with v574 as the current leg:
    python3 qa/tools/controls_v574_c8.py            # all five, in order
    python3 qa/tools/controls_v574_c8.py M2         # one control
Asserts nothing into any suite total; it is a coverage proof, run at build time and recorded in the CHANGELOG.
"""
import io, os, re, subprocess, sys

ROOT = os.getcwd()
SRC = os.path.join(ROOT, "v574.jsx")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(ROOT, "qa", "mk_testable.sh")):
    sys.exit("run from the ROOT of a v574 run folder (needs ./v574.jsx and ./qa/mk_testable.sh)")

# (label, description, anchor, replacement, assertion-name fragments that MUST appear among the failures)
MUTANTS = {
    "M0": ("unmutated v5.74 — t40 must pass", None, None, []),
    "M1": ("zero the draw series inside the bridge",
           "    ordDrawByYr[r.yr] = (r.ordDraw_y || 0) / Math.pow(1 + infl, Math.max(0, r.yr - retireYear));",
           "    ordDrawByYr[r.yr] = 0; // CONTROL M1",
           ["A2: the bridge's draw", "A4: the seven gap years", "A5:", "A3 [PINNED DIVERGENCE, D-9]: Engine B"]),
    "M2": ("publish the draw but never add it to ordinaryIncome",
           "const ordinaryIncome = pen_y + work_y + otherOrd_y + rmdTax_y + conv_y + ordDraw_y;",
           "const ordinaryIncome = pen_y + work_y + otherOrd_y + rmdTax_y + conv_y; // CONTROL M2",
           ["A4: the seven gap years", "A5:"]),
    "M3": ("import the draw into Engine B, leave Engine C alone",
           "    const ordDraw_y = Math.max(0, _ordDrawByYrI[yr] || 0);",
           "    const ordDraw_y = 0; // CONTROL M3",
           ["B1:", "B2:", "B4:"]),
    "M4": ("perturb Engine D's growth by +10%",
           "            .reduce((sum, [regime, p]) => sum + p * (SCENARIOS[regime][assetKey] || 0), 0);",
           "            .reduce((sum, [regime, p]) => sum + p * (SCENARIOS[regime][assetKey] || 0), 0) * 1.10; // CONTROL M4",
           ["A3 [PINNED DIVERGENCE, D-9]: Engine D"]),
    # Engine B's copy only — the SAME line also opens the Roth tab's inline ladder (L9446), so the anchor
    # carries the preceding line to be unique; the exactly-once guard below refuses anything else.
    "M5": ("Engine B adopts Engine D's 3.518% growth (the D-9 trap)",
           "  let _merged = false; // becomes true after the survivor rollover (guards double-roll)\n  const tradGrowth = BASE_GROWTH;",
           "  let _merged = false; // becomes true after the survivor rollover (guards double-roll)\n  const tradGrowth = 0.03518; // CONTROL M5",
           ["A3 [PINNED DIVERGENCE, D-9]: Engine B", "A5:"]),
    "M6": ("drop the panel's spending-withdrawals line",
           '                      { label: "Spending withdrawals (Withdrawal plan)", val: sel.ordDraw_y, c: "var(--warn)" },\n',
           "                      // CONTROL M6: spending-withdrawals line removed\n",
           ["D1: the panel lists EVERY term", "D2:"]),
    "M7": ("drop the panel's dividends line",
           '                      { label: "Dividends & interest (est.)", val: sel.div_y, c: "var(--orange)" },\n',
           "                      // CONTROL M7: dividends line removed\n",
           ["D1: the panel lists EVERY term", "D2:"]),
    "M8": ("change the rothAmount default to 60000",
           "const [rothAmount, setRothAmount] = useState(70000);",
           "const [rothAmount, setRothAmount] = useState(60000); // CONTROL M8",
           ["E0:"]),
}

def run(label):
    desc, anchor, repl, must = MUTANTS[label]
    src = io.open(SRC, encoding="utf-8").read()
    if anchor is not None:
        n = src.count(anchor)
        if n != 1:
            return False, f"anchor found {n} times (must be exactly 1) — the mutation did not land; the control proves nothing"
        src = src.replace(anchor, repl, 1)
    tag = "c8" + label.lower()
    io.open(os.path.join(ROOT, tag + ".jsx"), "w", encoding="utf-8").write(src)
    b = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
    if b.returncode != 0:
        return False, "build failed: " + (b.stderr or b.stdout)[-300:]
    r = subprocess.run(["node", "t40_cross_tab_agreement.mjs", "v574", f"./app_{tag}.mjs"],
                       cwd=os.path.join(ROOT, "qa"), capture_output=True, text=True)
    out = r.stdout
    m = re.search(r"(\d+) passed, (\d+) failed", out)
    if not m:
        return False, "t40 did not report a total (DIED?): " + out[-400:]
    npass, nfail = int(m.group(1)), int(m.group(2))
    fired = [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
    for f in (os.path.join(ROOT, tag + ".jsx"), os.path.join(ROOT, "qa", f"app_{tag}.jsx"), os.path.join(ROOT, "qa", f"app_{tag}.mjs")):
        if os.path.exists(f): os.remove(f)
    if label == "M0":
        return (nfail == 0), f"{npass} passed, {nfail} failed"
    missing = [frag for frag in must if not any(frag in x for x in fired)]
    ok = nfail > 0 and not missing
    detail = f"{nfail} assertion(s) fired" + ("" if not missing else f"; EXPECTED BUT SILENT: {missing}")
    return ok, detail + "\n" + "\n".join("        \u2717 " + x[:150] for x in fired)

labels = sys.argv[1:] or list(MUTANTS)
bad = 0
for lab in labels:
    ok, detail = run(lab)
    bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {MUTANTS[lab][0]}\n        {detail}")
print(f"\ncontrols_v574_c8: {len(labels) - bad} of {len(labels)} behaved as required")
sys.exit(1 if bad else 0)
