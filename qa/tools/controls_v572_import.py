# controls_v572_import.py — negative controls for SCOPE_IMPORT_HARDENING H-1…H-6 (t38).
#
# Run from a run folder's qa/ that holds the hardened source as <root>/<tag>.jsx and the new files:
#     cd /tmp/run/qa && python3 tools/controls_v572_import.py v572 [jobs]
#
# ASSERTS NOTHING ABOUT THE APP and is counted in no total. It proves t38 can FAIL, one fix at a time.
# No shebang on purpose: run it with python3 (a new file uploaded through the web UI lands 100644 —
# package_check G-3a).
#
# NEVER EDITS THE RUN FOLDER. Each mutant is built in a throwaway copy of qa/ (node_modules and the
# leg sources are symlinked; the mutated <tag>.jsx is a real copy), and the md5s of the watched files
# are printed before and after.
#
# ⚠ ONE REVERSION PER CONTROL. D-1 has two halves; C1 reverts ONLY the validation and C2 ONLY the
#   rollback, and each must turn its own checks red. The three skin gates are likewise reverted one at
#   a time (C6a/b/c): skinVars's safe fallback means a leaked name still RENDERS, so each gate is
#   witnessed by which skin is SELECTED (t38 K-2 / R-7 / S-7), not by whether the page draws.
# ⚠ A control PASSES when every expected check id appears among t38's failures. Any OTHER failure is
#   printed as collateral, for reading — it does not fail the control, and it is not ignored.
import hashlib, os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

TAG = sys.argv[1] if len(sys.argv) > 1 else "v572"
JOBS = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 2
ONLY_V1 = "V1" in sys.argv[2:]          # `… v572 V1` runs the visibility control alone
BASE_TAG = TAG                           # t4/t9 register v572 from the bump on. (Session 1, before the bump,
                                         # had to present the mutant under "v571"; that was the only reason.)
QA = os.path.abspath(os.getcwd())
RUN = os.path.dirname(QA)
SRC = os.path.join(RUN, f"{TAG}.jsx")
for need in (SRC, os.path.join(QA, "t38_import_hardening.mjs"), os.path.join(QA, f"dom_entry_{TAG}.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(need):
        sys.exit(f"controls_v572_import: FATAL — missing {need}")

def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()

WATCH = [SRC, os.path.join(QA, f"app_{TAG}.mjs"), os.path.join(QA, f"dom_{TAG}.cjs"),
         os.path.join(QA, "t38_import_hardening.mjs"), os.path.join(QA, "shim.txt")]
BEFORE = {p: md5(p) for p in WATCH}
print(f"controls_v572_import ({TAG}) — watched md5s before:")
for p in WATCH: print(f"  {BEFORE[p]}  {os.path.relpath(p, RUN)}")

# (id, what it reverts, [(old, new)], dom?, [expected failing check-id prefixes])
CONTROLS = [
    ("C1", "H-1a: validation off (rollback kept)",
     [("function validateLoadedPlan(portfolio, expenses) {\n", "function validateLoadedPlan(portfolio, expenses) {\n  return null;\n")],
     False, ["M-A1 "]),
    ("C2", "H-1b: rollback off (validation kept)",
     [("    PORTFOLIO = prev.P; EXPENSES = prev.E; MASTER_PROMPT = prev.M;\n", "    if (false) { PORTFOLIO = prev.P; EXPENSES = prev.E; MASTER_PROMPT = prev.M; }\n"),
      ("    if (prev.pJSON !== null && PORTFOLIO) {", "    if (false && prev.pJSON !== null && PORTFOLIO) {")],
     False, ["M-B2:", "M-B5:"]),
    ("C3", "H-1: page load no longer flags an unreadable stored plan",
     [("    STORED_PLAN_UNREADABLE = true;\n", "")],
     True, ["L-2:", "L-4:", "L-6:"]),
    ("C4", "H-2: My Data import not awaited",
     [("        await onImport({", "        onImport({")],
     True, ["I-3 ", "I-4 ", "I-5 "]),
    ("C5", "H-3: skinVars truthy fallback",
     [("  const S = isSkinKey(skinKey) ? SKINS[skinKey] : SKINS.default;", "  const S = SKINS[skinKey] || SKINS.default;")],
     False, ["S-1 "]),
    ("C6a", "H-3: page-load skin gate truthy",
     [("if (r && isSkinKey(r.value)) setSkin(r.value);", "if (r && r.value && SKINS[r.value]) setSkin(r.value);")],
     True, ["K-2 "]),
    ("C6b", "H-3: landing-restore skin gate truthy",
     [("if (payload && isSkinKey(payload.skin)) setSkin(payload.skin);", "if (payload && payload.skin && SKINS[payload.skin]) setSkin(payload.skin);")],
     True, ["R-7 "]),
    ("C6c", "H-3: My Data import skin gate truthy",
     [("if (isSkinKey(importedSkin)) setSkin(importedSkin);", "if (importedSkin && SKINS[importedSkin]) setSkin(importedSkin);")],
     True, ["S-7 "]),
    ("C7", "H-4: no error boundary",
     [("  return <AppErrorBoundary><DangerCloseRoot /></AppErrorBoundary>;", "  return <DangerCloseRoot />;")],
     True, ["B-2:", "B-3:", "B-4:"]),
    ("C8", "H-5: row cap off by one",
     [("l.length > IMPORT_MAX_ROWS);", "l.length > IMPORT_MAX_ROWS + 1);")],
     False, ["N-2 "]),
    ("C8b", "H-5: byte cap removed on both paths",
     [("if (file.size > IMPORT_MAX_BYTES) {", "if (false && file.size > IMPORT_MAX_BYTES) {"),
      ("if (f && f.size > IMPORT_MAX_BYTES) {", "if (false && f && f.size > IMPORT_MAX_BYTES) {")],
     True, ["I-6:", "R-6:"]),
    ("C9", "H-6: claim-age clamp removed",
     [('    if (_isPlainObj(PORTFOLIO.incomeSources)) {\n      _clampField(', '    if (false) {\n      _clampField(')],
     False, ["C-1 claim age A 61", "C-1 claim age A 71", "C-1 claim age B 1e9"]),
    ("C11", "D-10: birth-date clamp removed",
     [('    for (const [k, who] of [["dobA", "first person"], ["dobB", "second person"]]) {\n', '    for (const [k, who] of []) {\n')],
     False, ["Y-1 9999-01-01", "Y-1 'abc'", "Y-3:"]),
    ("C10", "H-6 / D-5: adjustments not recorded",
     [("    PORTFOLIO._importAdjusted = _adj.length ? _adj : null;", "    PORTFOLIO._importAdjusted = null;")],
     True, ["C-2 ", "C-4:", "A-1:"]),
]

def build(cid, edits):
    root = tempfile.mkdtemp(prefix=f"ctl_imp_{cid}_")
    for f in os.listdir(RUN):
        if f in ("qa", f"{TAG}.jsx"): continue
        os.symlink(os.path.join(RUN, f), os.path.join(root, f))
    os.mkdir(os.path.join(root, "qa"))
    for f in os.listdir(QA):
        src = os.path.join(QA, f)
        if f in ("tools",) or f.startswith(("app_", "dom_v")): os.symlink(src, os.path.join(root, "qa", f))
        elif os.path.isdir(src): os.symlink(src, os.path.join(root, "qa", f))
        else: shutil.copy2(src, os.path.join(root, "qa", f))
    s = open(SRC, encoding="utf8").read()
    for old, new in edits:
        n = s.count(old)
        if n != 1:
            raise SystemExit(f"controls_v572_import: FATAL — {cid} anchor found {n}x: {old[:70]!r}")
        s = s.replace(old, new)
    open(os.path.join(root, f"{TAG}.jsx"), "w", encoding="utf8").write(s)
    # the mutant leg's own bundles (the symlinks to the pristine ones are replaced)
    for f in (f"app_{TAG}.jsx", f"app_{TAG}.mjs", f"dom_{TAG}.cjs"):
        p = os.path.join(root, "qa", f)
        if os.path.lexists(p): os.remove(p)
    subprocess.run(["bash", "qa/mk_testable.sh", TAG], cwd=root, check=True, capture_output=True)
    subprocess.run(["npx", "esbuild", f"qa/dom_entry_{TAG}.jsx", "--bundle", "--format=cjs", "--platform=browser",
                    "--loader:.jsx=jsx", "--jsx=automatic", f"--outfile=qa/dom_{TAG}.cjs", "--log-level=error"],
                   cwd=root, check=True, capture_output=True)
    return root

def one(ctl):
    cid, what, edits, dom, expect = ctl
    root = build(cid, edits)
    env = dict(os.environ)
    if not dom: env["T38_SKIP_DOM"] = "1"
    r = subprocess.run(["node", "--max-old-space-size=4096", "t38_import_hardening.mjs", TAG],
                       cwd=os.path.join(root, "qa"), capture_output=True, text=True, timeout=1500, env=env)
    out = r.stdout + r.stderr
    fails = [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
    summary = (re.findall(r"t38 SUITE:.*", out) or ["(no summary line — DIED)"])[-1]
    missing = [e for e in expect if not any(f.startswith(e) for f in fails)]
    collateral = [f for f in fails if not any(f.startswith(e) for e in expect)]
    shutil.rmtree(root, ignore_errors=True)
    return cid, what, expect, missing, collateral, summary, len(fails)

if ONLY_V1:
    CONTROLS = []
with ThreadPoolExecutor(max_workers=JOBS) as ex:
    results = list(ex.map(one, CONTROLS))

for cid, what, expect, missing, collateral, summary, nf in results:
    ok = not missing and nf > 0
    print(f"\n{cid}  {'FIRED  ' if ok else 'SILENT '} {what}")
    print(f"     expected red: {', '.join(expect)}")
    print(f"     {summary}")
    if missing: print(f"     ✗ DID NOT FIRE: {', '.join(missing)}")
    for c in collateral[:8]: print(f"     collateral: {c[:150]}")
    if len(collateral) > 8: print(f"     … and {len(collateral) - 8} more collateral")

# ── V1 · THE BOUNDARY MUST NOT HIDE A RENDER FAILURE FROM THE SUITE (session brief, trap 3) ──────────
# A fallback screen that "renders" could read as a working app. A throw inside My Data's render must
# still turn t4 (26 tabs, every tab's content) and t9 (the My Data readout) RED with the boundary in place.
def visibility():
    root = build("V1", [("function MyDataEditor({ onApply, onClearAll, onImport, onLoadSample, checklist, skin }) {\n",
                         "function MyDataEditor({ onApply, onClearAll, onImport, onLoadSample, checklist, skin }) {\n  throw new Error(\"V1 visibility control\");\n")])
    q = os.path.join(root, "qa")
    # the mutant is built as TAG; t4/t9 only accept a registered leg, so it is presented under BASE_TAG
    for f in (["dom_bundle.cjs"] + ([f"dom_{BASE_TAG}.cjs"] if BASE_TAG != TAG else [])):
        p = os.path.join(q, f)
        if os.path.lexists(p): os.remove(p)
        shutil.copy2(os.path.join(q, f"dom_{TAG}.cjs"), p)
    res = {}
    for label, argv in (("t4", ["node", "t4_dom.mjs", BASE_TAG]), ("t9", ["node", "t9_dom_smoke.mjs"])):
        r = subprocess.run(argv, cwd=q, capture_output=True, text=True, timeout=1200)
        out = r.stdout + r.stderr
        m = re.findall(r"(\d+) passed, (\d+) failed", out)
        res[label] = (m[-1] if m else None, r.returncode, "V1 visibility control" in out)
    shutil.rmtree(root, ignore_errors=True)
    return res
vis = visibility()
# RED means either a failure count, or a non-zero exit whose output names the injected error — t4 takes
# the second route: React rethrows the render error out of act(), t4 dies loudly, and runsuite reports it
# as DIED. Both are visible. What must never happen is a zero exit, or a death for some other reason.
vis_ok = all((v[0] is not None and int(v[0][1]) > 0) or (v[1] != 0 and v[2]) for v in vis.values())
print(f"\nV1  {'FIRED  ' if vis_ok else 'SILENT '} a render throw in My Data, boundary present")
for k, v in vis.items(): print(f"     {k}: {('%s passed, %s failed' % v[0]) if v[0] else 'no summary (DIED)'} rc={v[1]} names-the-injected-error={v[2]}")

AFTER = {p: md5(p) for p in WATCH}
print("\nwatched md5s after: " + ("UNCHANGED" if AFTER == BEFORE else "CHANGED — the run folder was touched"))
bad = [r for r in results if r[3] or r[6] == 0]
print(f"controls_v572_import: {len(results) - len(bad)} of {len(results)} fired as expected"
      + ("" if not bad else " — NOT: " + ", ".join(r[0] for r in bad)))
if not vis_ok: print("controls_v572_import: V1 DID NOT FIRE — the boundary hides a render failure from t4/t9")
sys.exit(1 if bad or not vis_ok or AFTER != BEFORE else 0)
