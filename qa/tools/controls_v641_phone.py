#!/usr/bin/env python3
"""controls_v641_phone.py — negative controls for t105 and t45 §S-10 (docs/SCOPE_F30B_PHONE_V641.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  SOURCE controls mutate ./v641.jsx (each target occurs exactly once), rebuild qa/app_v641.mjs and qa/dom_v641.cjs as mk_runfolder.sh builds them,
  run t105 on the v641 leg, then RESTORE the three files and hash-check them.
  PAGE controls mutate a COPY of ./index.html (the built page; the rules and the style values appear in it verbatim) and run t45 on the copy;
  ./index.html is never edited.
Run from the ROOT of a COPY of a v640 -> v641 run folder:  python3 qa/tools/controls_v641_phone.py [K1 ... P1 ...]
  the stylesheet (t105 §A)
    K1  .dc-wrap-phone moved outside the phone block .......................................................... A-1
    K2  the export row's input loses min-width: 0 (on a phone it would not shrink) .............................. A-1
    K3  .dc-cards-sub700 moved into the phone block (600-699 px would keep the CONVERT overrun) ................... A-1b
    K4  the stream row's wrap at every width removed (F-31 back) ............................................... A-1c
    K5  the stream row's wrap moved into the 699 px block (it would stop at 700 px) .............................. A-1c
  the sites (t105 §A)
    K6  M1 the household totals' class removed ................................................................ A-3a, A-8
    K7  M2 the second asset-class card row's class removed ...................................................... A-3b, A-8
    K8  M3 one SS amount / claim age row's class removed (one shrinking track: no extinction) ...................... A-3c
    K9  M4 the paycheck row's class removed ................................................................... A-3d, A-8
    K10 M6 the bonus row's class removed ...................................................................... A-3g, A-8
    K11 S1 the claiming grid's class removed .................................................................. A-3i, A-8
    K12 S1 the claiming grid's class removed and minWidth: 0 added (protects nothing) ............................. A-3i, A-8
    K13 S2 the survivor cards' class removed .................................................................. A-3j, A-8
    K14 E1 the Expenses delta's class removed ................................................................. A-3l, A-8
    K15 T1 the Taxes tiles' class removed ..................................................................... A-3m, A-8
    K16 W1 the Withdrawal cards' class removed ................................................................ A-3o
    K17 C1 the Monte Carlo LTC panel's class removed .......................................................... A-3p
    K18 E2 the one-time list's scroll box removed ............................................................. A-4a
    K19 E2 its floor 296 -> 200 px (a floor, but not the decided one) ........................................... A-4a
    K20 E3 one monthly list's category column back to 85 px ..................................................... A-4b
    K21 M5 the fee row's wrap class removed ................................................................... A-5a
    K22 R1 the calendar's minimum 600 -> 500 px ................................................................ A-5b
    K23 R1 the calendar's dc-cards-sub700 removed .............................................................. A-5b
    K24 a new four-column shrinking grid added to the Taxes tab, unprotected .................................... A-7, A-8
  the copy (t105 §B, §C)
    K25 one word changed on the Expenses tab (the one-time list's heading) ...................................... B-3
    K29 E2 its floor 316 px (the first build's, which ignored the row's padding) ................................ A-4a
    K26 §13's v6.41 note removed .............................................................................. C-1, C-1b
    K27 §13's v6.40 desktop sentence restored .................................................................. C-2, C-3, C-4
    K28 the v6.40 note's last sentence restored ................................................................ C-5
  the built page (t45 §S-10)
    P1  E2's floor 296 -> 0 px (the one-time rows overprint at 360 px) .......................................... S-10
    P2  S1's class removed (the claiming grid overprints on a phone) ............................................. S-10
    P3  the stream row's wrap at every width removed (F-31: 626 px at 600) ....................................... S-10
    P4  the 699 px block's rule disabled (the calendar shows nine columns at 640) ................................ S-10
    P5  E3 back to 85 px in both lists (Transportation under Car Payment at 1024 and 1440) ......................... S-10
    P9  E2's floor 296 -> 316 px (the list scrolls and hides part of the year at 390 px) ............................ S-10
    C0  unmutated .................................................................................................. t105 passes
  NOT controlled here by a page control: the My Data, Monte Carlo and Withdrawal classes on the built page (K6, K16, K17 hold them in the
  source; P2 shows t45 S-10 turns red when a phone class leaves the built page — one t45 run is about 15 minutes); the box comparison at 600-1440 px (done at the build, not by a suite); the CONVERT labels with the web fonts (t45 counts
  the calendar's cards a row at 640 and 700 px, not the labels' overrun — measured at the build, scope §3.1).
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v641.jsx"); MOD = os.path.join(QA, "app_v641.mjs"); DOM = os.path.join(QA, "dom_v641.cjs"); PAGE = os.path.join(ROOT, "index.html")
for p in (SRC, PAGE, MOD, DOM, os.path.join(QA, "t105_f30b_phone.mjs"), os.path.join(QA, "t45_phone_layout.py"), os.path.join(QA, "mk_testable.sh"),
          os.path.join(QA, "dom_entry_v641.jsx"), os.path.join(QA, "dom_v640.cjs"), os.path.join(ROOT, "v640.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v640 -> v641 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
WRAP = "          .dc-wrap-phone { flex-wrap: wrap !important; }\n"
SUB = "        @media (max-width: 699px) { .dc-cards-sub700 { grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important; } }\n"
SUBRULE = ".dc-cards-sub700 { grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important; }"
CARDS = "          .dc-cards-phone { grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important; }\n"
STREAM = "        .dc-streamrow { flex-wrap: wrap; }\n"
G = '<div style={{ display: "grid", '
def unc(cls, rest): return (f'<div className="{cls}" style={{{{ display: "grid", {rest}', G + rest)
E3PRE = ('{_preItems.map((e, i) => {\n                  const r = _fmtRange(e);\n                  return (\n                    <div key={i} style={{ borderBottom: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", padding: "5px 10px 6px" }}>\n'
         '                      <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0, 1fr) 70px"')
CAL = '<div className="dc-cards-phone dc-cards-sub700" style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, fontSize: 12, minWidth: 600 }}>'
NEW_S = "At UI SIZE 100% no tab prints figures over their neighbours on a screen 360 px wide or more (v6.38, v6.40 and v6.41 fixed the tabs that did); on a narrower phone a few figures on the Monte Carlo tab still do, and the Grade and Verify tabs scroll sideways a little. A larger UI SIZE gives the page less room, as a smaller screen would, but the phone layout follows the window’s width, not UI SIZE: with a UI SIZE above 100% some figures overlap in a narrow window - on a phone, most on the Monte Carlo tab - and on a phone some tabs scroll sideways."
OLD_S = "On a phone some figures still print over their neighbours on parts of the My Data, Social Security, Expenses and Taxes tabs (v6.38: the Income tab’s were fixed; v6.40: the Roth and Stress tabs’). At UI SIZE 100% a screen 600 px wide or more shows them apart, except that a long category name on the Expenses tab can run under its item at any width, and below about 690 px the Roth tab’s IRMAA calendar’s “CONVERT” labels can run past their cards. A larger UI SIZE gives the page less room, as a smaller screen would, but the phone layout follows the window’s width, not UI SIZE: with a large UI SIZE in a narrow window some figures overlap, and on a phone at 150% the page can scroll sideways. Between 600 and 625 px the Income tab can scroll sideways when an income stream has a long label."
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": (".dc-wrap-phone moved outside the phone block", [(WRAP, ""), (STREAM, STREAM + "        .dc-wrap-phone { flex-wrap: wrap !important; }\n")], ["A-1"]),
 "K2": ("the export input's min-width: 0 dropped", [(".dc-export-phone > input { min-width: 0; flex-shrink: 1; }", ".dc-export-phone > input { flex-shrink: 1; }")], ["A-1"]),
 "K3": (".dc-cards-sub700 moved into the phone block", [(SUB, ""), (CARDS, CARDS + "          " + SUBRULE + "\n")], ["A-1b"]),
 "K4": ("the stream row's wrap at every width removed", [(STREAM, "")], ["A-1c"]),
 "K5": ("the stream row's wrap moved into the 699 px block", [(STREAM, ""), (SUB, SUB.replace(" } }\n", " } .dc-streamrow { flex-wrap: wrap; } }\n"))], ["A-1c"]),
 "K6": ("M1's class removed", [unc("dc-two-phone", 'gridTemplateColumns: "repeat(4,minmax(0, 1fr))", gap: 10 }}>')], ["A-3a", "A-8"]),
 "K7": ("M2's second card row's class removed", [tuple("                </span>\n              </div>\n              " + x for x in unc("dc-two-phone", 'gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", gap: 8 }}>'))], ["A-3b", "A-8"]),
 "K8": ("M3's first row's class removed", [unc("dc-stack-phone", 'gridTemplateColumns: "minmax(0, 1fr) 90px", gap: 8 }}>{/* v6.41 (F-30, DG-1 (a)): stacks on a phone */}\n              <div><label style={lbl}>Monthly $ at claim age</label><input inputMode="decimal" style={inp} value={ssAamt}')], ["A-3c"]),
 "K9": ("M4's class removed", [unc("dc-two-phone", 'gridTemplateColumns: "140px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"')], ["A-3d", "A-8"]),
 "K10": ("M6's bonus row's class removed", [unc("dc-two-phone", 'gridTemplateColumns: "1.2fr minmax(0, 1fr) minmax(0, 1fr) 1.2fr"')], ["A-3g", "A-8"]),
 "K11": ("S1's class removed", [unc("dc-cards-phone", 'gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, fontSize: 12, marginBottom: 6 }}>')], ["A-3i", "A-8"]),
 "K12": ("S1's class removed, minWidth: 0 added", [(unc("dc-cards-phone", 'gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, fontSize: 12, marginBottom: 6 }}>')[0],
                                                  G + 'gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4, fontSize: 12, marginBottom: 6, minWidth: 0 }}>')], ["A-3i", "A-8"]),
 "K13": ("S2's class removed", [unc("dc-stack-phone", 'gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginBottom: 8 }}>')], ["A-3j", "A-8"]),
 "K14": ("E1's class removed", [unc("dc-stack-phone", 'gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>')], ["A-3l", "A-8"]),
 "K15": ("T1's class removed", [unc("dc-two-phone", 'gridTemplateColumns: "repeat(6, minmax(0, 1fr))"')], ["A-3m", "A-8"]),
 "K16": ("W1's class removed", [unc("dc-stack-phone", 'gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>{/* v6.41 (F-30, DG-9 (a))')], ["A-3o"]),
 "K17": ("C1's class removed", [unc("dc-two-phone", 'gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, fontSize: 12 }}>')], ["A-3p"]),
 "K18": ("E2's scroll box removed", [('<div className="dc-scrollx" style={{ "--dc-floor": "296px" }}>', "<div>")], ["A-4a"]),
 "K19": ("E2's floor 200 px", [('"--dc-floor": "296px"', '"--dc-floor": "200px"')], ["A-4a"]),
 "K20": ("E3 the pre-retirement list's column back to 85 px", [(E3PRE, E3PRE.replace('"110px minmax', '"85px minmax'))], ["A-4b"]),
 "K21": ("M5's fee row's wrap class removed", [('<div className="dc-wrap-phone" style={{ marginTop: 12', '<div style={{ marginTop: 12')], ["A-5a"]),
 "K22": ("R1's minimum 600 -> 500", [(CAL, CAL.replace("minWidth: 600", "minWidth: 500"))], ["A-5b"]),
 "K23": ("R1's dc-cards-sub700 removed", [(CAL, CAL.replace(" dc-cards-sub700", ""))], ["A-5b"]),
 "K24": ("a new shrinking grid on the Taxes tab", [(unc("dc-two-phone", 'gridTemplateColumns: "repeat(6, minmax(0, 1fr))"')[0],
                                                   '<div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 3 }}></div>\n' + unc("dc-two-phone", 'gridTemplateColumns: "repeat(6, minmax(0, 1fr))"')[0])], ["A-7", "A-8"]),
 "K29": ("E2's floor 316 px (the first build's: it ignored the row's padding)", [('"--dc-floor": "296px"', '"--dc-floor": "316px"')], ["A-4a"]),
 "K26": ("§13's v6.41 note removed", [("<li><strong>My Data, Social Security, Expenses and Taxes on a phone (v6.41).</strong>", "<li><strong>(removed)</strong>")], ["C-1", "C-1b"]),
 "K27": ("§13's v6.40 desktop sentence restored", [(NEW_S, OLD_S)], ["C-2", "C-3", "C-4"]),
 "K28": ("the v6.40 note's last sentence restored", [("Four other tabs still overprinted on a phone; v6.41 fixed them.</li>", "Four other tabs still overprint on a phone (the desktop item below).</li>")], ["C-5"]),
}
PAGEM = {
 "P1": ("E2's floor 296 -> 0 px", [('"--dc-floor":"296px"', '"--dc-floor":"0px"', 1)], ["S-10"]),
 "P2": ("S1's class removed", [('className:"dc-cards-phone",style:{display:"grid",gridTemplateColumns:"repeat(9, minmax(0, 1fr))",gap:4,fontSize:12,marginBottom:6}',
                                'style:{display:"grid",gridTemplateColumns:"repeat(9, minmax(0, 1fr))",gap:4,fontSize:12,marginBottom:6}', 1)], ["S-10"]),
 "P3": ("the stream row's wrap at every width removed", [(".dc-streamrow { flex-wrap: wrap; }\n", "\n", 1)], ["S-10"]),
 "P4": ("the 699 px block's rule disabled", [("@media (max-width: 699px) { .dc-cards-sub700", "@media (max-width: 9px) { .dc-cards-sub700", 1)], ["S-10"]),
 "P5": ("E3 back to 85 px in both lists", [('"110px minmax(0, 1fr) 70px"', '"85px minmax(0, 1fr) 70px"', 2)], ["S-10"]),
 "P9": ("E2's floor 296 -> 316 px (the list scrolls at 390 px)", [('"--dc-floor":"296px"', '"--dc-floor":"316px"', 1)], ["S-10"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Za-z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM, PAGE); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v641"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v641.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v641.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
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
        r = subprocess.run(["node", "t105_f30b_phone.mjs", "v641"], cwd=QA, capture_output=True, timeout=5400)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t105 SUITE \(v641\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        red = ids(out); miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, encoding="utf-8").read() != ORIG:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
def run_page(label):
    desc, subs, want = PAGEM[label]; html = open(PAGE, encoding="utf-8").read()
    for old, new, n in subs:
        if html.count(old) != n: return f"{label} TARGET occurs {html.count(old)}x in the built page (must be {n}) — control INVALID"
        html = html.replace(old, new)
    mut = os.path.join(ROOT, f"_ctl_{label}.html"); open(mut, "w", encoding="utf-8").write(html)
    try:
        r = subprocess.run(["python3", "t45_phone_layout.py", "v641", mut], cwd=QA, capture_output=True, timeout=7200)
        out = r.stdout.decode("utf-8", "replace"); red = ids(out)
        if not re.search(r"t45 SUITE \(v641\): \d+ passed", out): return f"{label} CRASHED — {desc}: {out[-300:]}"
        miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        os.remove(mut)
labels = sys.argv[1:] or list(M) + ["K25"] + list(PAGEM)
M["K25"] = ("one word changed on the Expenses tab (the one-time list's heading)", [("                ONE-TIME EXPENSES\n", "                ONE-OFF EXPENSES\n")], ["B-3"])
if "--dry" in sys.argv:   # target counts only: every source target must occur once, every page target its stated number of times
    html = open(PAGE, encoding="utf-8").read()
    for l, (d, pairs, w) in M.items(): print(l, [ORIG.count(o) for o, n in pairs] if pairs else "-", d)
    for l, (d, subs, w) in PAGEM.items(): print(l, [f"{html.count(o)}/{n}" for o, nw, n in subs], d)
    sys.exit(0)
labels = [l for l in labels if l != "--dry"]
out = []
for l in labels: out.append(run_page(l) if l in PAGEM else run_src(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
