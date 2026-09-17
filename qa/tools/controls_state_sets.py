# controls_state_sets.py — negative controls for SCOPE_STATE_SET_SELECTOR stage 1 (ops 2026-09-15).
#
# Run from a run folder's qa/ (mk_runfolder.sh output), with the stage-1 files in place:
#     cd /tmp/run/qa && python3 tools/controls_state_sets.py v571
#
# ASSERTS NOTHING ABOUT THE APP and is counted in no total. It proves the stage-1 checks can FAIL.
# No shebang on purpose: run it with python3 (a shebang would require 100755, and a new file uploaded
# through the web UI lands 100644 — package_check G-3a).
#
# NEVER EDITS THE RUN FOLDER. Every mutant is built in a throwaway copy of qa/ (node_modules and the
# two leg sources are symlinked), and the md5s of the files the controls mutate are printed before and
# after, so a control run that dies mid-way cannot poison the baseline (the v5.66 lesson).
#
# ⚠ ONE MUTATION MUST NOT LOOK LIKE SIX (§7.7 test 5). Each converted site is re-pointed, ALONE, at its
#   own sabotaged copy of state_sets.cjs; the other sites run in the same folder against the pristine
#   module and must stay GREEN. A site that fires only when every site is sabotaged proves nothing
#   about that site.
import hashlib, os, re, shutil, subprocess, sys, tempfile

TAG = sys.argv[1] if len(sys.argv) > 1 else "v571"
# ⚠ STAGE 2 (v5.72): from v572 the in-law list is DATA on STATE_RULES rows and the set is {ME}, so t29 F-6
#   and t35 D-8 are NON-EMPTY guards again, and a list change is a change to the app module, not to the
#   helper's literal. Every expectation below that differs by leg reads V572.
_N = int(re.sub(r"[^0-9]", "", TAG) or 0)
V572 = _N >= 572
# ⚠ v5.73: Maine is conditioned, so the set is EMPTY again and the guards are the "empty" kind once more.
#   ONLY v572 has the non-empty shape; NONEMPTY is what the expectations below branch on.
V573 = _N >= 573
NONEMPTY = V572 and not V573
F6 = "F-6 [v5.73]" if V573 else "F-6 [v5.72]" if V572 else "F-6 [v5.69]"
D8 = "D-8 [v5.73]" if V573 else "D-8 [v5.72]" if V572 else "D-8 [v5.69]"
S1 = "S-1 [v5.72]" if V572 else "S-1:"
QA = os.path.abspath(os.getcwd())
RUN = os.path.dirname(QA)
if not os.path.exists(os.path.join(QA, "tools", "state_sets.cjs")):
    sys.exit("controls_state_sets: FATAL — run from a run folder's qa/ holding tools/state_sets.cjs")

def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()

WATCH = [os.path.join(QA, "tools", "state_sets.cjs"), os.path.join(QA, f"app_{TAG}.mjs"),
         os.path.join(QA, "t10_taxcases.mjs"), os.path.join(QA, "t29_boundaries.mjs"),
         os.path.join(QA, "t35_state_populate.mjs"), os.path.join(QA, "tools", "f6_probe.cjs")]
BEFORE = {p: md5(p) for p in WATCH}
print(f"controls_state_sets ({TAG}) — watched md5s before:")
for p in WATCH: print(f"  {BEFORE[p]}  {os.path.relpath(p, RUN)}")

SUITES = {  # label -> argv (run in the throwaway qa/)
    "t10": ["node", "t10_taxcases.mjs", TAG],
    "t29": ["node", "t29_boundaries.mjs", TAG],
    "t35": ["node", "t35_state_populate.mjs", TAG],
    "sets": ["node", "state_sets_check.mjs", TAG],
}

def sandbox():
    root = tempfile.mkdtemp(prefix="ctl_sets_")
    for f in os.listdir(RUN):
        if f in ("qa",): continue
        os.symlink(os.path.join(RUN, f), os.path.join(root, f))
    shutil.copytree(QA, os.path.join(root, "qa"), symlinks=True)
    return root

def edit(path, old, new, count=1):
    s = open(path, encoding="utf8").read()
    n = s.count(old)
    if n != count:
        raise SystemExit(f"controls_state_sets: FATAL — anchor {old!r} found {n}x in {path}, expected {count}")
    open(path, "w", encoding="utf8").write(s.replace(old, new))

def run(root, label):
    r = subprocess.run(SUITES[label], cwd=os.path.join(root, "qa"), capture_output=True, text=True, timeout=600)
    out = r.stdout + r.stderr
    m = re.findall(r"(\d+) passed, (\d+) failed", out)
    return out, (int(m[-1][1]) if m else None)

results = []
def expect(cid, root, label, fires, quiet=()):
    """fires: labels that MUST appear as failures; quiet: labels that must NOT. Empty fires => suite green."""
    out, nfail = run(root, label)
    fl = [l for l in out.splitlines() if "\u2717" in l]
    ok = nfail is not None
    why = []
    if not fires and nfail != 0: ok = False; why.append(f"expected green, {nfail} failed")
    for f in fires:
        if not any(f in l for l in fl): ok = False; why.append(f"did NOT fire: {f}")
    for q in quiet:
        if any(q in l for l in fl): ok = False; why.append(f"fired but must not: {q}")
    results.append((cid, label, ok))
    print(f"  {'OK ' if ok else 'BAD'} {cid:<6} {label:<5} {'green' if not fires else 'fires ' + ', '.join(fires)}"
          + (f"   <-- {'; '.join(why)}" if why else ""))

def bad_module(root, name, old, new):
    src = os.path.join(root, "qa", "tools", "state_sets.cjs")
    dst = os.path.join(root, "qa", "tools", name)
    shutil.copy(src, dst); edit(dst, old, new)
    if old == ADD_WI[0]:
        edit(dst, *ADD_WI_2)

# The sabotage goes through inLaw(), which every site reads on every leg (stage 2).
ADD_WI = ("module.exports = { IN_LAW_PRE_V572, hasField, inLaw,",
          "const _inLawTrue = inLaw;\nconst inLawBad = (R) => _inLawTrue(R).concat([\"WI\"]).sort();\n"
          "module.exports = { IN_LAW_PRE_V572, hasField, inLaw: inLawBad,")
# ⚠ `unconverted` and `proseSelected` close over the module's own inLaw, so the export swap alone would move
#   nothing. They are re-bound to the bad list too.
ADD_WI_2 = ("const unconverted = (RULES) =>\n  inLaw(RULES)", "const unconverted = (RULES) =>\n  (typeof inLawBad === 'function' ? inLawBad : inLaw)(RULES)")

# ── C0 · silent: the untouched sandbox is green everywhere ─────────────────────────────────────
root = sandbox()
for s in SUITES: expect("C0", root, s, [])
shutil.rmtree(root)

# ── C1 · t29 ALONE reads a list that wrongly includes WI (unconditioned, excl65 > 0) ───────────
root = sandbox()
bad_module(root, "state_sets_bad.cjs", *ADD_WI)
edit(os.path.join(root, "qa", "t29_boundaries.mjs"), '"state_sets.cjs"', '"state_sets_bad.cjs"', 2)
# v572: the set becomes {ME, WI} — still non-empty, so F-6 stays GREEN and only the exact-set checks fire.
expect("C1", root, "t29", (["F-6a:", "F-6b:"] if NONEMPTY else [F6, "F-6a:", "F-6b:"]), quiet=([F6] if NONEMPTY else []))
expect("C1", root, "t35", [])     # same folder, pristine module: must stay green
expect("C1", root, "sets", ["S-8a:"], quiet=[S1, "S-3:", "S-4:", "S-5:", "S-6:", "S-7:"])  # the bad copy IS a 2nd pattern copy
shutil.rmtree(root)

# ── C2 · t35 ALONE reads the same bad list ─────────────────────────────────────────────────────
root = sandbox()
bad_module(root, "state_sets_bad.cjs", *ADD_WI)
edit(os.path.join(root, "qa", "t35_state_populate.mjs"), '"state_sets.cjs"', '"state_sets_bad.cjs"', 2)
expect("C2", root, "t35", (["D-7 [v5.67]"] if NONEMPTY else ["D-7 [v5.67]", D8]), quiet=([D8] if NONEMPTY else []))
expect("C2", root, "t29", [])
expect("C2", root, "sets", ["S-8a:"], quiet=[S1, "S-3:", "S-4:", "S-5:", "S-6:", "S-7:"])  # the bad copy IS a 2nd pattern copy
shutil.rmtree(root)

# ── C3 · f6_probe ALONE reads the bad list → S-5 (probe vs t29) fires ──────────────────────────
root = sandbox()
bad_module(root, "state_sets_bad.cjs", *ADD_WI)
edit(os.path.join(root, "qa", "tools", "f6_probe.cjs"), "'state_sets.cjs'", "'state_sets_bad.cjs'", 2)
expect("C3", root, "sets", ["S-5:"], quiet=[S1, "S-4:", "S-6:"])
expect("C3", root, "t29", [])
shutil.rmtree(root)

# ── C4 · §7.3 REGRESSION: restore the probe's literal-only reader (exclTest never recorded) ────
root = sandbox()
edit(os.path.join(root, "qa", "tools", "f6_probe.cjs"),
     "        else o[k]={astNode:q.value.type};", "        // (reverted: non-literals dropped)")
expect("C4", root, "sets", ["S-5:"])
shutil.rmtree(root)

# ── C5 · DRIFT GUARD: RI drops out of the shared list (all sites see it) ───────────────────────
# ⚠ Disclosed blind spot: t29/t35 stay GREEN here — with every in-law row conditioned, a SHRUNK list
#   cannot move `unconverted()`. Only S-1 and the drift guard see it; that is what they are for.
root = sandbox()
if V572:
    # the list is data: RI loses its field in the built module (the source f6_probe reads is untouched,
    # and RI is conditioned, so S-5 cannot move — only S-1 and the drift guard see it, as before)
    edit(os.path.join(root, "qa", f"app_{TAG}.mjs"), 'RI: { name: "Rhode Island", incomeLimitedInLaw: true,', 'RI: { name: "Rhode Island",')
else:
    edit(os.path.join(root, "qa", "tools", "state_sets.cjs"), '"NM", "RI", "VA"', '"NM", "VA"')
expect("C5", root, "sets", [S1, "S-4:"])
expect("C5", root, "t29", [])
expect("C5", root, "t35", [])
shutil.rmtree(root)

# ── C5m · v572 ONLY: MAINE loses its field → the set empties → every non-empty guard fires ──────
# This is D-8's control: a list that is empty only because Maine is missing is the vacuous green §B2 names.
if V572:
    root = sandbox()
    # esbuild keeps a short row on one line and reflows a long one (Maine's, from v5.73) — take whichever
    # form is present; edit() still requires exactly one match.
    _app = os.path.join(root, "qa", f"app_{TAG}.mjs")
    _one_line = 'ME: { name: "Maine", incomeLimitedInLaw: true,'
    if _one_line in open(_app, encoding="utf8").read():
        edit(_app, _one_line, 'ME: { name: "Maine",')
    else:
        edit(_app, 'name: "Maine",\n    incomeLimitedInLaw: true,\n', 'name: "Maine",\n')
    if NONEMPTY:
        expect("C5m", root, "t29", [F6, "F-6a:", "F-6b:"])
        expect("C5m", root, "t35", ["D-7 [v5.67]", D8])
        expect("C5m", root, "sets", [S1, "S-5:"])   # the probe reads the untouched SOURCE, which still has ME
    else:
        # v5.73: Maine is conditioned, so dropping its in-law mark moves ONLY the list — the guarded set
        # was empty and stays empty. S-1 is the one check that must see it.
        expect("C5m", root, "t29", [])
        expect("C5m", root, "t35", [])
        expect("C5m", root, "sets", [S1])
    shutil.rmtree(root)

# ── C6 · the predicate: revert to t35's old `=== undefined` reading → S-7 fires ────────────────
root = sandbox()
edit(os.path.join(root, "qa", "tools", "state_sets.cjs"),
     "const isConditioned = (row) => !!(row && row.exclTest);",
     "const isConditioned = (row) => !!row && row.exclTest !== undefined;")
expect("C6", root, "sets", ["S-7:"])
shutil.rmtree(root)

# ── C7 · the matcher never matches: SELECTORS stay green, PINS fire ────────────────────────────
root = sandbox()
edit(os.path.join(root, "qa", "tools", "state_sets.cjs"),
     "const NOTE_MATCHER = /income[- ]limited|income limit/i;", "const NOTE_MATCHER = /(?!)/;")
expect("C7", root, "t29", [])
expect("C7", root, "t35", ["D-7a", "D-7b", "D-7c", "D-7d"], quiet=[D8, "D-7 [v5.67]"])
expect("C7", root, "t10", ["[BY DECISION v5.59] RI's note"], quiet=["[BY DECISION v5.59] WI's note"])
# S-8a counts COPIES of the module's own pattern, so a changed-but-single pattern is still one copy.
# The pattern's CONTENT is guarded by the six pins above, which is where C7 is expected to fire.
expect("C7", root, "sets", [])
shutil.rmtree(root)

# ── C8..C12 · §7.7 TEST 6 — a REWORDED note fires its pin, and moves NO selector ───────────────
REWORD = [
    ("C8",  "is income-limited:",         "is income-conditioned:",      [("t35", ["D-7a"])]),
    ("C9",  "54A:6-10, income-limited",   "54A:6-10, income-conditioned", [("t35", ["D-7b"])]),
    ("C10", "deduction, income-limited:", "deduction, income-conditioned:", [("t35", ["D-7c"])]),
    ("C11", "are income-limited in law",  "are income-conditioned in law",
            [("t35", ["D-7d"]), ("t10", ["[BY DECISION v5.59] RI's note"])]),
    ("C12", "not income-tested;",         "income-limited;",
            [("t10", ["[BY DECISION v5.59] WI's note"]), ("sets", ["S-4:"])]),
]
for cid, old, new, fires in REWORD:
    root = sandbox()
    appf = os.path.join(root, "qa", f"app_{TAG}.mjs")
    edit(appf, old, new)
    for label, f in fires:
        if label != "t35": expect(cid, root, label, f)
    expect(cid, root, "t29", [])                                        # membership did not move
    if cid != "C12": expect(cid, root, "sets", [])
    if not any(l == "t35" for l, _ in fires):
        expect(cid, root, "t35", [])
    else:  # the pin fires, but D-7/D-8 (the selectors) must not
        expect(cid, root, "t35", [f for l, fs in fires if l == "t35" for f in fs], quiet=["D-7 [v5.67]", D8])
    shutil.rmtree(root)

AFTER = {p: md5(p) for p in WATCH}
print("watched md5s after: " + ("UNCHANGED" if AFTER == BEFORE else "CHANGED — the run folder was touched"))
bad = [r for r in results if not r[2]]
print(f"\ncontrols_state_sets: {len(results) - len(bad)} of {len(results)} as expected"
      + ("" if not bad else f" — {len(bad)} NOT: " + ", ".join(f'{c}/{l}' for c, l, _ in bad)))
sys.exit(1 if bad or AFTER != BEFORE else 0)
