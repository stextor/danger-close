# controls_v573_me_mt.py — negative controls for SCOPE_ME_PHASEOUT_MT_CORRECTIONS (t39).
#     cd <run folder>/qa && python3 tools/controls_v573_me_mt.py v573
# ASSERTS NOTHING ABOUT THE APP and is counted in no total. One reversion per change, each in a throwaway
# copy; the watched md5s are printed before and after. No shebang: run it with python3.
import hashlib, os, re, shutil, subprocess, sys, tempfile
TAG = sys.argv[1] if len(sys.argv) > 1 else "v573"
QA = os.getcwd(); RUN = os.path.dirname(QA); SRC = os.path.join(RUN, f"{TAG}.jsx")
if not os.path.exists(SRC): sys.exit(f"controls_v573_me_mt: FATAL — missing {SRC}")
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = [SRC, os.path.join(QA, f"app_{TAG}.mjs"), os.path.join(QA, "t39_me_mt.mjs")]
BEFORE = {p: md5(p) for p in WATCH}
CONTROLS = [
  ("C1", "the phaseout ignored (Maine keeps the whole deduction)",
   [("      return excl * (1 - frac);", "      return excl;")], ["M-3 ", "M-4 ", "M-5 ", "M-6b ", "M-6c "]),
  ("C2", "the phaseout applied BEFORE the Social Security offset",
   [("      return excl * (1 - frac);",
     "      const _c = (a, ss) => (a === null || a < _floor) ? 0 : Math.max(0, _cap * (1 - frac) - Math.max(0, ss));\n"
     "      return _c(ageA, ssGrossA) + (single ? 0 : _c(ageB, ssGrossB));")], ["M-3 ", "M-7 "]),
  ("C3", "Montana's subtraction back to $5,500",
   [("excl65: 5660,", "excl65: 5500,")], ["T-1 ", "T-2 ", "T-3 ", "T-4 ", "T-5 "]),
  ("C4", "Montana's SS back to half",
   [('MT: { name: "Montana", rate: 0.0565, ss: 1,', 'MT: { name: "Montana", rate: 0.0565, ss: 0.5,')], ["T-1 ", "T-2 ", "T-3 ", "T-5 "]),
]
print(f"controls_v573_me_mt ({TAG})")
bad = []
for cid, what, edits, expect in CONTROLS:
    root = tempfile.mkdtemp(prefix=f"ctl73_{cid}_")
    for f in os.listdir(RUN):
        if f in ("qa", f"{TAG}.jsx"): continue
        os.symlink(os.path.join(RUN, f), os.path.join(root, f))
    shutil.copytree(QA, os.path.join(root, "qa"), symlinks=True,
                    ignore=shutil.ignore_patterns(f"app_{TAG}.*", "node_modules"))
    s = open(SRC, encoding="utf8").read()
    for a, b in edits:
        if s.count(a) != 1: sys.exit(f"controls_v573_me_mt: FATAL — {cid} anchor found {s.count(a)}x: {a[:60]!r}")
        s = s.replace(a, b)
    open(os.path.join(root, f"{TAG}.jsx"), "w", encoding="utf8").write(s)
    subprocess.run(["bash", "qa/mk_testable.sh", TAG], cwd=root, check=True, capture_output=True)
    out = subprocess.run(["node", "t39_me_mt.mjs", TAG], cwd=os.path.join(root, "qa"), capture_output=True, text=True).stdout
    fails = [l.strip()[2:] for l in out.splitlines() if l.strip().startswith("\u2717")]
    missing = [e for e in expect if not any(f.startswith(e) for f in fails)]
    other = [f for f in fails if not any(f.startswith(e) for e in expect)]
    ok = not missing and fails
    print(f"  {cid} {'FIRED ' if ok else 'SILENT'} {what} — {len(fails)} red" + (f"; DID NOT FIRE: {missing}" if missing else ""))
    for o in other: print(f"       collateral: {o[:120]}")
    if not ok: bad.append(cid)
    shutil.rmtree(root, ignore_errors=True)
AFTER = {p: md5(p) for p in WATCH}
print("  watched md5s: " + ("UNCHANGED" if AFTER == BEFORE else "CHANGED"))
print(f"controls_v573_me_mt: {len(CONTROLS) - len(bad)} of {len(CONTROLS)} fired" + (f" — NOT: {bad}" if bad else ""))
sys.exit(1 if bad or AFTER != BEFORE else 0)
