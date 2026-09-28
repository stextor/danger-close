#!/usr/bin/env python3
"""controls_v580_scenario.py — negative controls for docs/SCOPE_SCENARIO_DEFAULT.md (t46, and t5's wipe guard).
Coverage DEMONSTRATED (OPERATIONS §B2). Each control plants one breakage in a copy of the v5.80 source, builds its app
module and DOM bundle exactly as mk_runfolder.sh does, swaps the bundle in under v580's name, runs the named suite, and
RESTORES the original (checked by hash afterwards). The named checks must fire:
    M0  unmutated ................................................... t46 and t5 pass
    M1  the default reverts to BASE ................................. t46 1-1, 1-2 (first visit: label AND regime weights)
    M2  the saved choice is never restored .......................... t46 3-1, 3-2 (a new visit forgets HISTORICAL)
    M3  an unknown stored value is accepted ......................... t46 4-1 (the app must fall back, not break)
    M4  the key is dropped from "delete everything" ................. t5's wipe guard (it loops STORAGE_KEYS)
    M5  a choice is applied but never saved ......................... t46 2-3, 3-0 (nothing written)
USAGE  from the ROOT of a run folder with v580 as the current leg:  python3 qa/tools/controls_v580_scenario.py [M3]
"""
import hashlib, io, os, re, shutil, subprocess, sys
ROOT = os.getcwd(); SRC = os.path.join(ROOT, "v580.jsx"); QA = os.path.join(ROOT, "qa")
if not os.path.exists(SRC) or not os.path.exists(os.path.join(QA, "dom_v580.cjs")):
    sys.exit("run from the ROOT of a v580 run folder (needs ./v580.jsx and ./qa/dom_v580.cjs)")
RESTORE = "      if (r && Object.prototype.hasOwnProperty.call(PROB_PRESETS, r.value)) setScenarioPreset(r.value);"
M = {
    "M0": ("unmutated", None, None, {"t46": [], "t5": []}),
    "M1": ("the default reverts to BASE", 'const DEFAULT_SCENARIO_PRESET = "bull";', 'const DEFAULT_SCENARIO_PRESET = "base"; // CONTROL M1', {"t46": ["1-1", "1-2"]}),
    "M2": ("the saved choice is never restored", RESTORE, "      if (false) setScenarioPreset(r.value); // CONTROL M2", {"t46": ["3-1", "3-2"]}),
    "M3": ("an unknown stored value is accepted", RESTORE, "      if (r && r.value) setScenarioPreset(r.value); // CONTROL M3", {"t46": ["4-1"]}),
    "M4": ("the key is dropped from delete-everything",
           "    window.storage.delete(STORAGE_KEYS.scenario).catch(() => null), // v5.80: the chosen scenario preset resets with the plan\n", "",
           {"t5": ["D: Clear All Data deletes STORAGE_KEYS.scenario"]}),
    "M5": ("a choice is applied but never saved", "onClick={() => applyScenarioPreset(key)}", "onClick={() => setScenarioPreset(key)}", {"t46": ["2-3", "3-0"]}),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
LIVE = os.path.join(QA, "dom_v580.cjs"); BEFORE = md5(LIVE)
def fired_of(out): return [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
def run(label):
    desc, a, b, suites = M[label]
    src = io.open(SRC, encoding="utf-8").read()
    if a is not None:
        n = src.count(a)
        if n != 1: return False, f"anchor occurs {n} times (must be exactly 1) — the mutation did not land"
        src = src.replace(a, b, 1)
    tag = "sc" + label.lower(); made = [os.path.join(ROOT, tag + ".jsx")] + [os.path.join(QA, x) for x in (f"app_{tag}.jsx", f"app_{tag}.mjs", f"dom_entry_{tag}.jsx", f"dom_{tag}.cjs")]
    bak = LIVE + ".ctlbak"; out = []; ok_all = True
    try:
        io.open(made[0], "w", encoding="utf-8").write(src)
        r = subprocess.run(["./qa/mk_testable.sh", tag], cwd=ROOT, capture_output=True, text=True)
        if r.returncode != 0: return False, "mk_testable failed: " + (r.stderr or r.stdout)[-200:]
        de = io.open(os.path.join(QA, "dom_entry_v580.jsx"), encoding="utf-8").read().replace("app_v580", f"app_{tag}")
        io.open(made[3], "w", encoding="utf-8").write(de)
        r = subprocess.run(["npx", "esbuild", f"qa/dom_entry_{tag}.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx",
                            "--jsx=automatic", f"--outfile=qa/dom_{tag}.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True)
        if r.returncode != 0: return False, "esbuild failed: " + (r.stderr or r.stdout)[-200:]
        shutil.copy2(LIVE, bak); shutil.copy2(made[4], LIVE)
        for suite, must in suites.items():
            cmd = ["node", "t46_scenario_default.mjs", "v580"] if suite == "t46" else ["node", "t5_storage.mjs", "v580"]
            r = subprocess.run(cmd, cwd=QA, capture_output=True, text=True, timeout=280)
            m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
            f = fired_of(r.stdout)
            if suite == "t5":   # t5 prints a failure as an indented line holding the check's name (no cross): match the name
                f = [l.strip() for l in r.stdout.splitlines() if "STORAGE_KEYS" in l or "D:" in l]
            nfail = int(m.group(2)) if m else -1
            if label == "M0":
                good = (nfail == 0); out.append(f"{suite}: {m.group(0) if m else 'no total (DIED?)'}")
            else:
                miss = [w for w in must if not any(w in x for x in f)]
                good = nfail > 0 and not miss
                out.append(f"{suite}: {nfail} fired" + (f"; EXPECTED BUT SILENT: {miss}" if miss else "") + "".join("\n          \u2717 " + x[:100] for x in f[:3]))
            ok_all = ok_all and good
    finally:
        if os.path.exists(bak): shutil.move(bak, LIVE)
        for p in made:
            if os.path.exists(p): os.remove(p)
    return ok_all, "\n        ".join(out)
labels = sys.argv[1:] or list(M); bad = 0
for lab in labels:
    ok, d = run(lab); bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {M[lab][0]}\n        {d}", flush=True)
if md5(LIVE) != BEFORE: print("  FAIL  the run folder's dom_v580.cjs was NOT restored"); bad += 1
print(f"\ncontrols_v580_scenario: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
