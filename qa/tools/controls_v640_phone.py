#!/usr/bin/env python3
"""controls_v640_phone.py — negative controls for t104 and t45 §S-9 (docs/SCOPE_F30_ROTH_STRESS_PHONE_V640.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  SOURCE controls mutate ./v640.jsx (each target occurs exactly once), rebuild qa/app_v640.mjs and qa/dom_v640.cjs as mk_runfolder.sh builds them,
  run t104 on the v640 leg, then RESTORE the three files and hash-check them.
  PAGE controls mutate a COPY of ./index.html (the built page; the phone rule and the style values appear in it verbatim) and run t45 on the copy;
  ./index.html is never edited.
Run from the ROOT of a COPY of a v639 -> v640 run folder:  python3 qa/tools/controls_v640_phone.py [K1 ... P1 ...]
  the source (t104 §A)
    K1  the .dc-cards-phone rule moved outside the phone block .............................................. A-1
    K2  the rule's min-width: 0 dropped (on a phone the calendar would scroll, not reflow) ................... A-1
    K3  the calendar's class removed (its 500 px minimum still protects it, so A-6 rightly stays green) ......... A-3a
    K4  the calendar's 500 px minimum removed ................................................................. A-3a
    K5  the comparator's scroll box removed ................................................................... A-3b, A-6
    K6  the comparator's minimum 520 px (it engaged at a 600 px window and moved its boxes — measured at scope) .. A-3b
    K7  the rules box's class removed ......................................................................... A-3c, A-6
    K8  the scenario table's minimum 600 px (STAGFLATION over SEQUENCE RISK at 390-640 px) ...................... A-3d
    K9  the scenario table's scroll box removed ............................................................... A-3d, A-6
    K10 the risk report's class removed ....................................................................... A-3e, A-6
    K11 the guardrail table's scroll box removed .............................................................. A-3f, A-6
    K12 a new four-column shrinking grid added to the Stress tab, unprotected ................................... A-5, A-6
    K16 the calendar's class AND its minimum removed (R1 as v6.39 had it) ....................................... A-3a, A-6
    K17 the calendar's class removed and its minimum set to 0 (minWidth: 0 protects nothing; the class alone would) .. A-3a, A-6
    K18 the guardrail table's floor set to 0px ................................................................ A-3f, A-6
  the copy (t104 §B, §C)
    K13 one word changed on the Stress tab (the scenario table's "Ruin Rate" row) ............................... B-3b, B-3d, B-3f
    K14 §13's v6.40 note removed ............................................................................. C-1
    K15 §13's v6.39 desktop sentence restored ................................................................. C-2, C-3
  the built page (t45 §S-9)
    P1  the scenario table's minimum 720 -> 600 px ............................................................ S-9
    P2  the calendar's 500 px minimum removed (UI SIZE 130%: the calendar overprints at 600 px) ................. S-9
    P3  the comparator's minimum 490 -> 0 px (it shrinks and overprints on a phone) ............................. S-9
    P4  the guardrail table's minimum 290 -> 0 px ("Planned" over "Upper (" at 360 px) .......................... S-9
    C0  unmutated .................................................................................................. t104 passes
  NOT controlled here: whether a phone class's rule reflows the way its screenshot shows (t45 measures overlap, not the layout's shape — K2's
  defect leaves no overlap, so only t104 A-1 holds it); the box comparison at 600-1440 px (done at the build, not by a suite).
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v640.jsx"); MOD = os.path.join(QA, "app_v640.mjs"); DOM = os.path.join(QA, "dom_v640.cjs"); PAGE = os.path.join(ROOT, "index.html")
for p in (SRC, PAGE, MOD, DOM, os.path.join(QA, "t104_roth_stress_phone.mjs"), os.path.join(QA, "t45_phone_layout.py"), os.path.join(QA, "mk_testable.sh"),
          os.path.join(QA, "dom_entry_v640.jsx"), os.path.join(QA, "dom_v639.cjs"), os.path.join(ROOT, "v639.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v639 -> v640 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
RULE = ".dc-cards-phone { grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important; }"
CAL = '<div className="dc-cards-phone" style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, fontSize: 12, minWidth: 500 }}>'
CMP = '<div className="dc-scrollx" style={{ "--dc-floor": "490px" }}><div style={{ display: "grid", gridTemplateColumns: _hasAca'
SCN = '<div className="dc-scrollx" style={{ marginBottom: 16, "--dc-floor": "720px" }}><div style={{ display: "grid", gridTemplateColumns: "150px repeat(6, minmax(0, 1fr))"'
GRD = '<div className="dc-scrollx" style={{ "--dc-floor": "290px" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))"'
NEW_S = "On a phone some figures still print over their neighbours on parts of the My Data, Social Security, Expenses and Taxes tabs (v6.38: the Income tab’s were fixed; v6.40: the Roth and Stress tabs’). At UI SIZE 100% a screen 600 px wide or more shows them apart, except that a long category name on the Expenses tab can run under its item at any width, and below about 690 px the Roth tab’s IRMAA calendar’s “CONVERT” labels can run past their cards. A larger UI SIZE gives the page less room, as a smaller screen would, but the phone layout follows the window’s width, not UI SIZE: with a large UI SIZE in a narrow window some figures overlap, and on a phone at 150% the page can scroll sideways. Between 600 and 625 px the Income tab can scroll sideways when an income stream has a long label."
OLD_S = "On a phone some figures still print over their neighbours: the Roth tab’s IRMAA calendar, the Stress tab’s scenario table, and parts of the My Data, Social Security, Expenses and Taxes tabs (v6.38: the Income tab’s were fixed). A screen 680 px wide or more (a desktop, or a tablet held sideways) shows them apart, except that a long category name on the Expenses tab can run under its item at any width."
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("the phone rule moved outside the phone block", [("          " + RULE + "\n        }", "        }\n        " + RULE)], ["A-1"]),
 "K2": ("the rule's min-width: 0 dropped", [(RULE, RULE.replace(" min-width: 0 !important;", ""))], ["A-1"]),
 "K3": ("the calendar's class removed", [(CAL, CAL.replace('className="dc-cards-phone" ', ""))], ["A-3a"]),
 "K4": ("the calendar's minimum removed", [(CAL, CAL.replace(", minWidth: 500", ""))], ["A-3a"]),
 "K5": ("the comparator's scroll box removed", [(CMP, CMP.replace('className="dc-scrollx" style={{ "--dc-floor": "490px" }}', ""))], ["A-3b", "A-6"]),
 "K6": ("the comparator's minimum 520 px", [(CMP, CMP.replace("490px", "520px"))], ["A-3b"]),
 "K7": ("the rules box's class removed", [('<div className="dc-stack-phone" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, fontSize: 12 }}>',
                                          '<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, fontSize: 12 }}>')], ["A-3c", "A-6"]),
 "K8": ("the scenario table's minimum 600 px", [(SCN, SCN.replace("720px", "600px"))], ["A-3d"]),
 "K9": ("the scenario table's scroll box removed", [(SCN, SCN.replace('className="dc-scrollx" ', ""))], ["A-3d", "A-6"]),
 "K10": ("the risk report's class removed", [('<div className="dc-two-phone" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>',
                                             '<div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>')], ["A-3e", "A-6"]),
 "K11": ("the guardrail table's scroll box removed", [(GRD, GRD.replace('className="dc-scrollx" style={{ "--dc-floor": "290px" }}', ""))], ["A-3f", "A-6"]),
 "K12": ("a new shrinking grid on the Stress tab", [("{/* ── Scenario Detail Cards ── */}",
                                                    '<div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 3 }}></div>\n                  {/* ── Scenario Detail Cards ── */}')], ["A-5", "A-6"]),
 "K16": ("the calendar's class and minimum removed", [(CAL, CAL.replace('className="dc-cards-phone" ', "").replace(", minWidth: 500", ""))], ["A-3a", "A-6"]),
 "K17": ("the calendar's class removed, minimum set to 0", [(CAL, CAL.replace('className="dc-cards-phone" ', "").replace("minWidth: 500", "minWidth: 0"))], ["A-3a", "A-6"]),
 "K18": ("the guardrail table's floor 0px", [(GRD, GRD.replace("290px", "0px"))], ["A-3f", "A-6"]),
 "K13": ("one word changed on the Stress tab", [('{ label: "Ruin Rate", fn: d => fmtP(d.ruin)', '{ label: "Ruin Odds", fn: d => fmtP(d.ruin)')], ["B-3b", "B-3d", "B-3f"]),
 "K14": ("§13's v6.40 note removed", [("<li><strong>The Roth and Stress tabs on a phone (v6.40).</strong>", "<li><strong>(removed)</strong>")], ["C-1"]),
 "K15": ("§13's v6.39 desktop sentence restored", [(NEW_S, OLD_S)], ["C-2", "C-3"]),
}
PAGEM = {
 "P1": ("the scenario table's minimum 720 -> 600 px", '"--dc-floor":"720px"', '"--dc-floor":"600px"', ["S-9"]),
 "P2": ("the calendar's 500 px minimum removed", "minWidth:500", "minWidth:0", ["S-9"]),
 "P3": ("the comparator's minimum 490 -> 0 px", '"--dc-floor":"490px"', '"--dc-floor":"0px"', ["S-9"]),
 "P4": ("the guardrail table's minimum 290 -> 0 px", '"--dc-floor":"290px"', '"--dc-floor":"0px"', ["S-9"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Za-z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM, PAGE); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v640"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v640.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v640.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def ids(out): return [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
def run_src(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t104_roth_stress_phone.mjs", "v640"], cwd=QA, capture_output=True, timeout=5400)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t104 SUITE \(v640\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        red = ids(out); miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, encoding="utf-8").read() != ORIG:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
def run_page(label):
    desc, old, new, want = PAGEM[label]; html = open(PAGE, encoding="utf-8").read()
    if html.count(old) != 1: return f"{label} TARGET occurs {html.count(old)}x in the built page (must be 1) — control INVALID"
    mut = os.path.join(ROOT, f"_ctl_{label}.html"); open(mut, "w", encoding="utf-8").write(html.replace(old, new))
    try:
        r = subprocess.run(["python3", "t45_phone_layout.py", "v640", mut], cwd=QA, capture_output=True, timeout=7200)
        out = r.stdout.decode("utf-8", "replace"); red = ids(out)
        if not re.search(r"t45 SUITE \(v640\): \d+ passed", out): return f"{label} CRASHED — {desc}: {out[-300:]}"
        miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        os.remove(mut)
labels = sys.argv[1:] or list(M) + list(PAGEM)
out = []
for l in labels: out.append(run_page(l) if l in PAGEM else run_src(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
