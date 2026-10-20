#!/usr/bin/env python3
"""controls_v621_car.py — negative controls for t84 (docs/SCOPE_D42_CAR_V621.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t84 §G
renders the DOM bundle), t84 runs on the v6.21 leg (§B and §C need qa/app_v620.mjs beside it), then ./v621.jsx, qa/app_v621.mjs and
qa/dom_v621.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v620 -> v621 run folder:  python3 qa/tools/controls_v621_car.py [C1 ...]
    C1  a car of the model's own restored in runExtendedMC (on top of the rows) ............................ A-2, B-1
    C2  the one-time rows out of runExtendedMC's planned path ................................................ B-1, B-4
    C3  the migration stops one schedule year short (as-of + 35 exclusive) .................................... D-1
    C4  the migration dates the rows from the as-of year, not the retirement year ............................. D-1, D-8
    C5  the migration appends to the table passed in (written before Save & Apply) ............................ D-2
    C6  the migration ignores the field (every plan gains the rows) ........................................... D-4
    C7  the Monte Carlo tab's notice never shown .............................................................. G-10
    C8  the "after the payments end" figure back on FULL − 400 ................................................ A-3, E-2
    C9  the payments rule ignores the horizon .................................................................. E-2
    C10 the Stress tab's planned column back on household × 1.04^years ....................................... A-4, A-7
    C11 the Stress tab's bands typed (0.80) .................................................................... A-7
    C12 the mortgage what-if's Florida sentence restored ...................................................... H-4
    C13 Save & Apply stops writing the field (the notice would never clear) .................................. A-6, G-11
    C14 the Roth tab's state line reads only a state chosen in My Data (the master prompt's state ignored) ...... G-3, G-7b
    C15 a one-time row (a car) charged uninflated by the Monte Carlo ........................................ B-1
    C16 the My Data notice never shown ......................................................................... G-8
    C0  unmutated ............................................................................................. t84 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v621.jsx"); T84 = os.path.join(QA, "t84_car_rows.mjs")
MOD = os.path.join(QA, "app_v621.mjs"); DOM = os.path.join(QA, "dom_v621.cjs")
for p in (SRC, T84, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v621.jsx"), os.path.join(QA, "app_v620.mjs"),
          os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v620 -> v621 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("a car of the model's own restored", [("      // v6.21 (D-42): no car of the model's own — a car is a one-time expense row, charged above with the rest (mcOneTimeCharge)\n",
        "      if (retired && calYear - retireYear > 0 && (calYear - retireYear) % 8 === 0 && calMonth === \"03\") portfolio -= 40000 * inflationCum;\n")], ["A-2", "B-1"]),
 "C2": ("the one-time rows out of the planned path", [("    _planned -= mcOneTimeCharge(_qs, q, _plannedInfl);    // v6.20 (D-44, D-45)\n", "")], ["B-1", "B-4"]),
 "C3": ("the migration one year short", [("y <= _tlc.asOf.year + 35;", "y < _tlc.asOf.year + 35;")], ["D-1"]),
 "C4": ("the migration from the as-of year", [("for (let y = _tlc.retireDate.year + CAR_SCHEDULE_V620.everyYears;", "for (let y = _tlc.asOf.year + CAR_SCHEDULE_V620.everyYears;")], ["D-1", "D-8"]),
 "C5": ("the migration appends to the table passed in", [("      if (_add.length) EXPENSES = [...EXPENSES, ..._add];\n", "      if (_add.length) EXPENSES.push(..._add);\n")], ["D-2"]),
 "C6": ("the migration ignores the field", [('if (Array.isArray(expenses) && !Object.prototype.hasOwnProperty.call(PORTFOLIO, "carRowsV621")) {',
        "if (Array.isArray(expenses)) {")], ["D-4"]),
 "C7": ("the Monte Carlo tab's notice never shown", [("            {Array.isArray(PORTFOLIO._carRowsAdded) && PORTFOLIO._carRowsAdded.length > 0 && (\n              <div data-dc-car-rows-notice=\"mc\"",
        "            {false && (\n              <div data-dc-car-rows-notice=\"mc\"")], ["G-10"]),
 "C8": ("the payments figure back on FULL − 400", [("    POST_PAYMENTS = { monthly: getMonthlyExpense(`${y}-${String(m).padStart(2, \"0\")}`), from:",
        "    POST_PAYMENTS = { monthly: POST_MONTHLY_FULL - 400, from:")], ["A-3", "E-2"]),
 "C9": ("the payments rule ignores the horizon", [("    && fullM >= e.start && fullM <= e.end && e.end < `${H}-01`);", "    && fullM >= e.start && fullM <= e.end);")], ["E-2"]),
 "C10": ("the planned column back on 1.04^years", [("                        const planned = _pp.length ? _pp[Math.min(4 * yi, _pp.length - 1)] : PORTFOLIO.household;",
        "                        const planned = PORTFOLIO.household * Math.pow(1.04, yi);")], ["A-4", "A-7"]),
 "C11": ("the bands typed", [("                        const lower = planned * GUARDRAILS.lowerPct;", "                        const lower = planned * 0.80;")], ["A-7"]),
 "C12": ("the Florida sentence restored", [("The model gives mortgage interest no tax deduction — it takes the standard deduction and does not model itemizing — so there's no tax offset.",
        "Mortgage interest isn't deductible for you (standard deduction + no FL income tax), so there's no tax offset.")], ["H-4"]),
 "C13": ("Save & Apply stops writing the field", [("      carRowsV621: true,   // v6.21 (D-42, DC-2 (a)): always written — the table saved with it is the user's, added car rows included\n", "")],
        ["A-6", "G-11"]),
 "C15": ("a one-time row charged uninflated", [("function mcOneTimeCharge(qs, q, infl) { return qs.oneTime[q] * infl; }",
        "function mcOneTimeCharge(qs, q, infl) { return qs.oneTime[q]; }")], ["B-1"]),
 "C16": ("the My Data notice never shown", [('{Array.isArray(PORTFOLIO._carRowsAdded) && PORTFOLIO._carRowsAdded.length > 0 && (\n          <div data-dc-car-rows-notice="mydata"',
        '{false && (\n          <div data-dc-car-rows-notice="mydata"')], ["G-8"]),
 "C14": ("the Roth line ignores the timeline's state", [('const _nm = PLAN_TIMELINE.stateName || "", _rt = Number(PLAN_TIMELINE.stateTaxRate) || 0;',
        'const _nm = "", _rt = 0;')], ["G-3", "G-7b"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T84, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v621"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v621.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v621.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t84_car_rows.mjs", "v621"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t84 SUITE \(v621\): (\d+) passed, (\d+) failed", out)
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
