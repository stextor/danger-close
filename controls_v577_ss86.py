#!/usr/bin/env python3
"""controls_v577_ss86.py — negative controls for SCOPE_SS86_ONE_RULE §5 (t43, t24 §D, t1 STRUCT S-4).
Coverage is DEMONSTRATED, never inferred (OPERATIONS §B2). Each control plants one breakage in a copy of the
v5.77 source, builds it, runs the named suite against it gated as v577, and REQUIRES the named checks to fire.
    M0  unmutated v5.77 .................................................. t43 must PASS (the control of the controls)
    M1  the helper drops worksheet line 14's ½-of-benefits limb (C-4) .... the sweep and the worked cases must fire
    M2  Engine C gets a PRIVATE defective copy of §86 .................... the agreement grid AND the parser check must fire
    M3  the helper loses the 85%-of-benefits cap (line 17/18) ........... the cap-binding control A-3 must fire
    M4  Engine C's filing status reverts to the widowed-years flag (§1f)  the single cells, the IRMAA pin, section F, and
                                                                           t1 STRUCT S-4's v5.77 arm must fire
    M5  the helper's MIDDLE tier caps at 85% of benefits (pre-v5.45) ..... t24 §D D-1..D-3 must fire (§D now tests the
                                                                           helper the app runs, not a transcription)
M4's t1 run and M5's t24 run need the mutant under the suite's own tag, so the run folder's v577.jsx / app_v577.mjs are
swapped for the mutant and RESTORED in a finally block; the script re-hashes them afterwards and fails if they differ.
USAGE  from the ROOT of a run folder with v577 as the current leg:
    python3 qa/tools/controls_v577_ss86.py          # all six
    python3 qa/tools/controls_v577_ss86.py M4       # one
"""
import hashlib, io, os, re, shutil, subprocess, sys
ROOT = os.getcwd(); SRC = os.path.join(ROOT, "v577.jsx"); QA = os.path.join(ROOT, "qa")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(QA, "mk_testable.sh")):
    sys.exit("run from the ROOT of a v577 run folder (needs ./v577.jsx and ./qa/mk_testable.sh)")
C_CALL = "const ssTaxable = taxableSS86(ssTot, pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y + ordDraw_y, _singleI || filingSingleI);"
MUTANTS = {
    "M0": ("unmutated v5.77 — t43 must pass", None, None, {"t43": []}),
    "M1": ("the helper drops worksheet line 14's ½-of-benefits limb",
           "  const line14 = Math.min(line2, line13);", "  const line14 = line13; // CONTROL M1",
           {"t43": ["A-1", "A-2", "B-2", "B-3", "C-4", "C-5"]}),
    "M2": ("Engine C gets a private defective copy of §86",
           C_CALL,
           "const ssTaxable = ((ss, o, f) => { const t1 = f.ssThr1, t2 = f.ssThr2, p = o + 0.5 * ss; if (p <= t1) return 0;"
           " if (p <= t2) return Math.min(0.5 * (p - t1), 0.5 * ss); return Math.min(0.85 * ss, 0.5 * Math.min(p - t1, t2 - t1) + 0.85 * (p - t2)); })"
           "(ssTot, pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y + ordDraw_y, taxFactsFor(_singleI || filingSingleI)); // CONTROL M2",
           {"t43": ["C-3", "E-1", "E-2 computeIrmaaPlan"]}),
    "M3": ("the helper loses the 85%-of-benefits cap",
           "  return Math.min(line16, line17);", "  return line16; // CONTROL M3",
           {"t43": ["A-3", "B-2"]}),
    "M4": ("Engine C's filing status reverts to the widowed-years flag",
           C_CALL, C_CALL.replace("_singleI || filingSingleI);", "filingSingleI); // CONTROL M4"),
           {"t43": ["C-3", "D-1", "D-2", "D-3", "F-1", "F-2"], "t1": ["STRUCT S-4 (V577): Engine C calls the shared helper"]}),
    "M5": ("the helper's middle tier caps at 85% of benefits",
           "  const line14 = Math.min(line2, line13);", "  const line14 = Math.min(line11 > 0 ? line2 : line1 * 0.85, line13); // CONTROL M5",
           {"t24": ["D-1", "D-2", "D-3"]}),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
def suite(name, tag):
    if name == "t43": return subprocess.run(["node", "t43_ss86_one_rule.mjs", "v577", f"./app_{tag}.mjs"], cwd=QA, capture_output=True, text=True, timeout=280)
    if name == "t24": return subprocess.run(["node", "t24_ss86_phasein.mjs", "v577"], cwd=QA, capture_output=True, text=True, timeout=280)
    if name == "t1":  return subprocess.run(["node", "t1_units.mjs", "v577"], cwd=QA, capture_output=True, text=True, timeout=280)
def run(label):
    desc, anchor, repl, suites = MUTANTS[label]
    src = io.open(SRC, encoding="utf-8").read()
    if anchor is not None:
        n = src.count(anchor)
        if n != 1: return False, f"anchor found {n} times (must be exactly 1) — the mutation did not land"
        src = src.replace(anchor, repl, 1)
    tag = "ss" + label.lower(); made = [os.path.join(ROOT, tag + ".jsx"), os.path.join(QA, f"app_{tag}.jsx"), os.path.join(QA, f"app_{tag}.mjs")]
    io.open(made[0], "w", encoding="utf-8").write(src)
    b = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
    if b.returncode != 0: return False, "build failed: " + (b.stderr or b.stdout)[-300:]
    swaps = {"t24": [(os.path.join(QA, f"app_{tag}.mjs"), os.path.join(QA, "app_v577.mjs"))],
             "t1":  [(made[0], SRC)]}
    out = []; ok_all = True
    try:
        for name, must in suites.items():
            backups = []
            for mut, live in swaps.get(name, []):
                bk = live + ".ctlbak"; shutil.copy2(live, bk); backups.append((bk, live)); shutil.copy2(mut, live)
            try: r = suite(name, tag)
            finally:
                for bk, live in backups: shutil.move(bk, live)
            m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
            if not m: ok_all = False; out.append(f"{name} did not report a total (DIED?): " + (r.stdout + r.stderr)[-300:]); continue
            npass, nfail = int(m.group(1)), int(m.group(2))
            fired = [l.strip()[2:] for l in r.stdout.splitlines() if l.strip().startswith("\u2717")]
            if label == "M0":
                ok = nfail == 0 and npass >= 37; out.append(f"{name}: {npass} passed, {nfail} failed")
            else:
                missing = [f for f in must if not any(x.startswith(f) or f in x for x in fired)]
                ok = nfail > 0 and not missing
                out.append(f"{name}: {nfail} fired" + ("" if not missing else f"; EXPECTED BUT SILENT: {missing}") + "\n" +
                           "\n".join("        \u2717 " + x[:110] for x in fired[:8]))
            ok_all = ok_all and ok
    finally:
        for f in made:
            if os.path.exists(f): os.remove(f)
    return ok_all, "\n        ".join(out)
before = {p: md5(p) for p in (SRC, os.path.join(QA, "app_v577.mjs"))}
labels = sys.argv[1:] or list(MUTANTS); bad = 0
for lab in labels:
    ok, detail = run(lab); bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {MUTANTS[lab][0]}\n        {detail}", flush=True)
after = {p: md5(p) for p in before}
if after != before: print("  FAIL  the run folder's v577 files were NOT restored"); bad += 1
print(f"\ncontrols_v577_ss86: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
