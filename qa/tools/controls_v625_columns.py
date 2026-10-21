#!/usr/bin/env python3
"""controls_v625_columns.py — negative controls for t88 (docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t88 runs on
the v6.25 leg, then ./v625.jsx, qa/app_v625.mjs and qa/dom_v625.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v624 -> v625 run folder:  python3 qa/tools/controls_v625_columns.py [C1 ...]
    C1  the plan-type dropdown back under the tax type (stacked in one cell) .......................... A-2, A-3, A-4
    C2  the Plan type header removed ............................................................... A-1, A-2
    C3  the footer's label spanning one column too many again ....................................... A-6, A-7
    C4  no divider under the rows .................................................................. A-5
    C5  a Roth row's Plan type cell left empty (no dash) ............................................ B-2
    C6  the plan-type dropdown's handler dropped .............................................. B-2b, B-4, B-5
    C7  the Field Manual sentence removed ........................................................... E-1
    C0  unmutated .................................................................................. t88 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v625.jsx"); T88 = os.path.join(QA, "t88_holdings_columns.mjs")
MOD = os.path.join(QA, "app_v625.mjs"); DOM = os.path.join(QA, "dom_v625.cjs")
for p in (SRC, T88, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v625.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v624 -> v625 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the plan-type dropdown back under the tax type", [('</select>\n                  </td>\n                  <td style={{ padding: 3 }}>{r.taxType !== "roth"\n', '</select>\n                  {r.taxType !== "roth"\n')], ["A-2", "A-3", "A-4"]),
 "C2": ("the Plan type header removed", [('<th style={{ ...th, width: 120 }} title={PLAN_TYPE_HELP}>Plan type</th>', '')], ["A-1", "A-2"]),
 "C3": ("the footer's label one column too wide", [('<td colSpan={9} style={{ padding: "8px 6px", textAlign: "right", fontSize: 11', '<td colSpan={10} style={{ padding: "8px 6px", textAlign: "right", fontSize: 11')], ["A-6", "A-7"]),
 "C4": ("no divider under the rows", [('<tr key={r.id} style={{ borderBottom: "1px solid var(--line)" }}>', '<tr key={r.id}>')], ["A-5"]),
 "C5": ("a Roth row's Plan type cell empty", [(': <span style={{ fontSize: 12, color: "var(--ink-faint)" }} title="A Roth holding has no Traditional dollars, so no plan type">—</span>}</td>', ': null}</td>')], ["B-2"]),
 "C6": ("the plan-type handler dropped", [('onChange={e => updateRow(r.id, "planType", e.target.value)}', 'onChange={() => {}}')], ["B-2b", "B-4", "B-5"]),
 "C7": ("the Field Manual sentence removed", [("My Data\\u2019s holdings table gives plan type its own column (v6.25).", "My Data\\u2019s holdings table (v6.25).")], ["E-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T88, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v625"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v625.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v625.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t88_holdings_columns.mjs", "v625"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t88 SUITE \(v625\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != ORIG:
            open(SRC, "wb").write(ORIG); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
