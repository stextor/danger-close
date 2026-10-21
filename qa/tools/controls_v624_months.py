#!/usr/bin/env python3
"""controls_v624_months.py — negative controls for t87 (docs/SCOPE_D52_EXPENSE_MONTHS_V624.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the
source; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle — t87 drives
the DOM bundle), t87 runs on the v6.24 leg, then ./v624.jsx, qa/app_v624.mjs and qa/dom_v624.cjs are RESTORED and hash-checked.
C1-C14 and C18-C25 plant D-52 and its review findings back; C15 and C17 plant D-59 back. Run from the ROOT of a COPY of a v623 -> v624 run folder:  python3 qa/tools/controls_v624_months.py [C1 ...]
    C1  buildExpenses writes a monthly row as January-December again ........................ A-1, A-2, A-3?, A-4b, A-6, A-8, B-1, C-1, C-2
    C2  buildExpenses writes a one-time row as June again ..................................... A-1, A-5, A-6, A-7e
    C3  the editor reads each row's year only on load ......................................... A-1, C-0, C-1, E-6
    C4  the month selectors hidden from the table ............................................... E-3
    C5  the stored row's other fields no longer pass through ................................... A-1, A-6
    C6  Before retirement back to December of the retirement year ............................. C-3, C-9, C-10
    C7  the boundary read from the saved timeline, not the editor's field ...................... C-9, C-10
    C8  the guided setup split back at June/July ................................................ D-1
    C9  the guided setup's post row back to December 2079 ........................................ D-1, D-2, D-3
    C10 Export Backup re-dates its table .......................................................... A-2
    C11 the draft re-dates its table ................................................................ A-4b
    C12 the footnote's pre-v6.24 line removed ...................................................... E-1
    C13 an unedited amount rounded to whole dollars .................................................. A-6
    C14 the guided setup keeps a pre-retirement row for a plan retiring this year ................. D-4
    C15 the leave dialog switches tabs before it saves again (D-59) ............................. A-9
    C16 the Field Manual's D-59 sentence removed ................................................... E-8b
    C17 the leave dialog saves, then lands back on My Data (the remembered tab not set) ............ A-9d
    C18 the preview (monthlyAt) read by whole year again ............................................ C-11
    C19 an unedited date rewritten as year-month (no verbatim keep) ................................ A-7g
    C20 a stored date with no two-digit month loses its year again ................................. A-7g
    C21 a text amount kept as text .................................................................. A-7h
    C22 a half-typed retirement year used as a year ................................................. C-12
    C23 the footnote's guided-setup sentence removed ................................................ E-1b
    C24 Field Manual §13's older-wizard clause removed .............................................. E-8
    C25 the draft restore re-dates its table ........................................................ A-4d
    C0  unmutated .............................................................................................. t87 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v624.jsx"); T87 = os.path.join(QA, "t87_expense_months.mjs")
MOD = os.path.join(QA, "app_v624.mjs"); DOM = os.path.join(QA, "dom_v624.cjs")
for p in (SRC, T87, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v624.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v623 -> v624 run folder copy (missing {p})")
MON = "start: (e._src && _keepDate(e._src.start, sYr, _moOf(e.startMo, 1), 1)) || _ymStr(sYr, _moOf(e.startMo, 1)), end: (e._src && _keepDate(e._src.end, eYr, _moOf(e.endMo, 12), 12)) || _ymStr(eYr, _moOf(e.endMo, 12))"
M = {
 "C0": ("unmutated", [], []),
 "C1": ("a monthly row written January-December again", [(MON, "start: `${sYr}-01`, end: `${eYr}-12`")], ["A-1", "A-2", "A-4b", "A-6", "A-8", "B-1", "C-1", "C-2"]),
 "C2": ("a one-time row written as June again", [('const mo = _moOf(e.oneMo, 6), kept = e._src && e._src.freq === "once" ? _keepDate(e._src.start, yr, mo, 6) : null;', "const mo = 6, kept = null;")], ["A-1", "A-5", "A-6", "A-7e"]),
 "C3": ("the year only read on load", [("const [sy, sm] = _ymOf(e.start), [ey, em] = _ymOf(e.end);",
        "const [sy, sm] = [e.start ? parseInt(e.start.slice(0, 4), 10) : \"\", 0], [ey, em] = [e.end ? parseInt(e.end.slice(0, 4), 10) : \"\", 0];")], ["A-1", "C-0", "C-1", "E-6"]),
 "C4": ("the month selectors hidden", [('<select data-dc-exp-month="start"', '<select hidden data-dc-exp-month-hidden="start"'),
        ('<select data-dc-exp-month="end"', '<select hidden data-dc-exp-month-hidden="end"'), ('<select data-dc-exp-month="one"', '<select hidden data-dc-exp-month-hidden="one"')], ["E-3"]),
 "C5": ("no pass-through of the stored row", [('const base = (e._src && typeof e._src === "object") ? { ...e._src } : {};', "const base = {};")], ["A-1", "A-6"]),
 "C6": ("Before retirement through the retirement year", [("? (_retYr > _asOfYrMD ? [_asOfYrMD, 1, _retYr - 1, 12] : [_retYr - 1, 12, _retYr - 1, 12])", "? [_asOfYrMD, 1, _retYr, 12]")], ["C-3", "C-9", "C-10"]),
 "C7": ("the boundary from the saved timeline", [("const _retYr = (Number.isInteger(_retYrField) && _retYrField >= 1900 && _retYrField <= 2200) ? _retYrField : (_tlMD ?", "const _retYr = (_tlMD ?")], ["C-9", "C-10"]),
 "C8": ("the wizard split at June/July", [("end: `${_rY - 1}-12`, deductible: false, phase: \"pre\"", "end: `${_rY}-06`, deductible: false, phase: \"pre\""),
        ("start: `${_rY}-01`, end: `${_hzY}-12`", "start: `${_rY}-07`, end: `${_hzY}-12`")], ["D-1"]),
 "C9": ("the wizard's post row to 2079", [("start: `${_rY}-01`, end: `${_hzY}-12`", "start: `${_rY}-01`, end: \"2079-12\"")], ["D-1", "D-2", "D-3"]),
 "C10": ("Export Backup re-dates", [("      expenses: buildExpenses(),\n", "      expenses: buildExpenses().map(e => e.freq === \"once\" ? e : ({ ...e, start: e.start.slice(0, 4) + \"-01\" })),\n")], ["A-2"]),
 "C11": ("the draft re-dates", [("expenses: buildExpenses() }))", "expenses: buildExpenses().map(e => e.freq === \"once\" ? e : ({ ...e, start: e.start.slice(0, 4) + \"-01\" })) }))")], ["A-4b"]),
 "C12": ("the footnote's pre-v6.24 line removed", [(" A plan saved before v6.24 stored every row here as January to December and every one-time cost as June (this editor kept years only) — check the months.", "")], ["E-1"]),
 "C13": ("an unedited amount rounded", [("amount: keepAmt ? e._src.amount : Math.round(monthlyAmt)", "amount: Math.round(monthlyAmt)")], ["A-6"]),
 "C14": ("the wizard keeps a pre row when retiring this year", [("...(_rY - 1 >= Number(yr) ? [", "...(true ? [")], ["D-4"]),
 "C15": ("the leave dialog switches before it saves (D-59)", [("const t = leaveTarget; if (onTabChange) onTabChange(t); if (MYDATA_SAVE) MYDATA_SAVE(); setLeaveTarget(null); setActiveTab(t); }}",
        "const t = leaveTarget; setLeaveTarget(null); setActiveTab(t); setTimeout(() => { if (MYDATA_SAVE) MYDATA_SAVE(); }, 40); }}")], ["A-9", "A-9d"]),
 "C17": ("the leave dialog saves but forgets the target tab", [("const t = leaveTarget; if (onTabChange) onTabChange(t); if (MYDATA_SAVE) MYDATA_SAVE();", "const t = leaveTarget; if (MYDATA_SAVE) MYDATA_SAVE();")], ["A-9d"]),
 "C18": ("the preview read by whole year again", [("    const k = yr * 12 + 5;\n    const a = (Number(e.startYr) || _asOfYrMD) * 12 + _moOf(e.startMo, 1) - 1;\n    const b = (Number(e.endYr) || _horizonEndYr) * 12 + _moOf(e.endMo, 12) - 1;\n",
        "    const k = yr;\n    const a = Number(e.startYr) || _asOfYrMD;\n    const b = Number(e.endYr) || _horizonEndYr;\n")], ["C-11"]),
 "C19": ("an unedited date rewritten as year-month", [('const _keepDate = (src, y, m, d) => { if (typeof src !== "string") return null;', 'const _keepDate = (src, y, m, d) => { if (true) return null;')], ["A-7g"]),
 "C20": ("a stored date with no two-digit month loses its year again", [("/^(\\d{4})(?:-(\\d{1,2}))?/", "/^(\\d{4})-(\\d{2})/")], ["A-7g"]),
 "C21": ("a text amount kept as text", [("typeof e._src.amount === \"number\" && Number.isFinite(e._src.amount) && ", "")], ["A-7h"]),
 "C22": ("a half-typed retirement year used as a year", [("(Number.isInteger(_retYrField) && _retYrField >= 1900 && _retYrField <= 2200) ? _retYrField :", "_retYrField ? _retYrField :")], ["C-12"]),
 "C23": ("the footnote's guided-setup sentence removed", [(" A plan the guided setup built before v6.24 also splits its living costs at June of the retirement year and stops them in 2079.", "")], ["E-1b"]),
 "C24": ("Field Manual §13's older-wizard clause removed", [("; a plan it built before v6.24 keeps its June split and its 2079 end \\u2014 check them in My Data)", ")")], ["E-8"]),
 "C25": ("the draft restore re-dates (restoreDraft through the old builder)", [("onImport({ portfolio: d.portfolio, expenses: d.expenses });", "onImport({ portfolio: d.portfolio, expenses: (d.expenses || []).map(e => e.freq === \"once\" ? e : ({ ...e, start: String(e.start).slice(0, 4) + \"-01\" })) });")], ["A-4d"]),
 "C16": ("the Field Manual's D-59 sentence removed", [(" Separately, the unsaved-edits dialog\\u2019s <em>Save &amp; Apply, then leave</em> now saves; through v6.23 it changed tabs and saved nothing.", "")], ["E-8b"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = open(SRC, "rb").read()
WATCH = (SRC, T87, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v624"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v624.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v624.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            s = ORIG.decode("utf-8")
            for old, new in pairs:
                if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
                s = s.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(s); build()
        r = subprocess.run(["node", "t87_expense_months.mjs", "v624"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t87 SUITE \(v624\): (\d+) passed, (\d+) failed", out)
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
