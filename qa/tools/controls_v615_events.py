#!/usr/bin/env python3
"""controls_v615_events.py — negative controls for t78 (docs/SCOPE_EVENTS_USER_FACING_V615.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
the app mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t78's §C-4
renders the DOM bundle in a child process), t78 runs on the v615 leg, then ./v615.jsx, qa/app_v615.mjs, qa/dom_v615.cjs and
qa/t78_events_user_facing.mjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v614 -> v615 run folder:  python3 qa/tools/controls_v615_events.py [K1 ...]
    K1  Google Drive back in the backup card ................................................................ D-1, E-1
    K2  the strip stops ignoring the notice ................................................................. C-1, C-2
    K3  the backtest-data chore restored to the Events list ................................................. A-1
    K4  the Field Manual says "eighteen" again .............................................................. F-1
    K5  the notice turns yellow from October ................................................................ B-1b, B-2
    K6  the STALE strip's old sentence restored (the swap promise and the maintainer workflow) .............. C-4d, D-4
    K7  a non-text change: the plan review's window moves from January to February .......................... A-3
    K8  the Field Manual's Ranking entry says the Events tab flags the benchmarks again ...................... F-2
    K0  unmutated ............................................................................................ t78 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v615.jsx"); T78 = os.path.join(QA, "t78_events_user_facing.mjs")
MOD = os.path.join(QA, "app_v615.mjs"); DOM = os.path.join(QA, "dom_v615.cjs")
for p in (SRC, T78, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v615.jsx"), os.path.join(QA, "app_v614.mjs"), os.path.join(ROOT, "index.html")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v614 -> v615 run folder copy (missing {p})")
HIST = ('  {\n    ev.push({ key: "hist", title: "Backtest data: append last year\'s returns", state: "future", when: "data current", countdown: "",\n'
        '      instructions: "Append the row to HISTORICAL_RETURNS." });\n  }\n\n')
M = {
 "K0": ("unmutated", [], "app", []),
 "K1": ("Drive back in the backup card", [("and keep it somewhere private: your Documents folder, a personal cloud drive, or a USB stick. That way",
                                            "and drop it in the Google Drive Danger Close folder. That way")], "app", ["D-1", "E-1"]),
 "K2": ("the strip stops ignoring the notice", [("  const live = (evs || []).filter(e => !e.notice);", "  const live = (evs || []).filter(e => e);")], "app", ["C-1", "C-2"]),
 "K3": ("the backtest chore restored", [("  // ── 2. Roth conversion — must execute by Dec 31 in each ladder year ──\n",
                                         HIST + "  // ── 2. Roth conversion — must execute by Dec 31 in each ladder year ──\n")], "app", ["A-1"]),
 "K4": ("Field Manual says eighteen", [("(sixteen for a two-person household", "(eighteen for a two-person household")], "app", ["F-1"]),
 "K5": ("notice yellow from October", [("else if (TAX_CONSTANTS_YEAR === nowY && nowM >= 10) { state = \"future\";",
                                        "else if (TAX_CONSTANTS_YEAR === nowY && nowM >= 10) { state = \"yellow\";")], "app", ["B-1b", "B-2"]),
 "K6": ("STALE strip's old sentence", [(" Export Backup first: your plan is saved in this browser, and the new copy may not see it — Import Backup on the My Data tab brings it across.\n",
                                         " Your plan data lives in this browser, not the file, so nothing is lost (Export Backup first as insurance). Maintaining the file yourself? The Events tab's tax-refresh alarm has the constant-update workflow.\n")], "app", ["C-4d", "D-4"]),
 "K7": ("plan review moves to February", [("const state = nowM === 1 ? \"green\" : nowM === 12 ? \"yellow\" : \"future\";",
                                          "const state = nowM === 2 ? \"green\" : nowM === 12 ? \"yellow\" : \"future\";")], "app", ["A-3"]),
 "K8": ("Ranking entry flags again", [("the 2028 survey publishes ~fall 2029, and a later version of the app will carry it.",
                                       "the 2028 survey publishes ~fall 2029, when the Events tab flags these benchmarks as due for a refresh.")], "app", ["F-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([0A-F]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = {"app": SRC, "test": T78}
ORIG = {k: open(p, "rb").read() for k, p in FILES.items()}
WATCH = (SRC, T78, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v615"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v615.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v615.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, where, want = M[label]
    try:
        if pairs:
            s = ORIG[where].decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(FILES[where], "w", encoding="utf-8").write(s)
            if where == "app": build()
        r = subprocess.run(["node", "t78_events_user_facing.mjs", "v615"], cwd=QA, capture_output=True, timeout=2400)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t78 SUITE \(v615\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for k, p in FILES.items():
            if open(p, "rb").read() != ORIG[k]:
                open(p, "wb").write(ORIG[k])
                if k == "app": build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
