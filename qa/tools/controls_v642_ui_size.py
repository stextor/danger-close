#!/usr/bin/env python3
"""controls_v642_ui_size.py — negative controls for t106 and t45 §S-11 (docs/SCOPE_F32_UI_SIZE_V642.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  SOURCE controls mutate ./v642.jsx (each target occurs exactly once), rebuild qa/app_v642.mjs and qa/dom_v642.cjs as mk_runfolder.sh builds them,
  run t106 on the v642 leg, then RESTORE the three files and hash-check them.
  PAGE controls mutate a COPY of ./index.html (the built page; each target is a regular expression over the minified code, so a rebuild that
  renames a minified identifier does not break it) and run t45 on the copy; ./index.html is never edited.
Run from the ROOT of a COPY of a v641 -> v642 run folder:  python3 qa/tools/controls_v642_ui_size.py [K1 ... P1 ...]
  the stylesheet (t106 §A)
    K1  a window media query back: @media (max-width: 599px) holding the tab menu's rule ......................... A-1
    K2  one phone rule dropped from the .dc-narrow rules (My Data's flex rows) ..................................... A-2
    K3  the Roth calendar's rule left unscoped (.dc-sub700w taken off: it would reach every width) .................. A-3
    K4  one narrow rule unscoped (.dc-xs taken off .dc-stack-xs: it would stack at every width) ..................... A-4
    K5  a .dc-tap44 rule added to the app's stylesheet (DH-3: the 44 px targets belong to the window) ................ A-5
  the function and the root (t106 §A, §B, §C)
    K6  the layout width ignores UI SIZE (the window's width alone) ................................................ A-6b, B-1
    K7  the resize listener never added ............................................................................ A-6c, C-2
    K8  the hook does not re-run when UI SIZE changes (dependency list emptied) ...................................... A-6c, C-6
    K9  the root's class rendered as "" at desktop widths (className={_layoutCls}) ................................... A-7b
    K10 the narrow threshold 360 -> 340 px ........................................................................... B-1, B-3, C-4
  the sites (t106 §A)
    K11 the Survivor tab's monthly-income cards lose dc-two-xs ....................................................... A-8
    K20 dc-two-xs moved from the Survivor cards to a Taxes grid (the build review's: a class count stayed green) ....... A-8
    K12 the Monte Carlo percentile table's scroll box loses its class ................................................ A-8, A-9
    K13 the Verify check tables' floor 0 -> 300 px (the first build's) ................................................ A-9
    K18 the percentile table's tight cells (dc-tight-xs) dropped ...................................................... A-8, A-9
    K19 the percentile table's floor 280 -> 300 px (the first build's: it hid the last column at 412 px / 115%) ......... A-9
  the copy (t106 §D)
    K14 §13's v6.42 note removed, the whole item ...................................................................... D-1, D-2
    K15 the desktop item's v6.41 UI SIZE sentence restored ............................................................. D-3
    K16 the footer's version left at v6.41 ............................................................................ D-4
  the text (t106 §E)
    K17 one word changed on the Survivor tab ("Monthly income after" -> "Monthly income later") ...................... E-3
  the built page (t45 §S-11)
    P1  the layout width ignores UI SIZE on the built page (no phone layout in a zoomed window; nothing narrow on a zoomed
        phone) .......................................................................................................... S-11
        (A first P1 removed the root's class prop altogether. That takes the phone layout off every phone, and t45 died in an
        earlier section — a click timing out on a tab bar a phone no longer shows — before S-11 ran: red, but not by the named
        check. Replaced by this narrower defect, which only S-11 can see.)
    P2  the narrow threshold 360 -> 0 (dc-xs never set: the narrow rules never act) .................................... S-11
    P3  the Monte Carlo percentile table's scroll box loses its class (it overprints, and S-11's box check fails) ...... S-11
    P4  the percentile table's floor 280 -> 300 px (the first build's: S-11's 412 px / 115% check fails) ............. S-11
    C0  unmutated .................................................................................................... t106 passes
  NOT controlled here by a page control: each narrow site on the built page one by one (K11-K13 and K18-K20 hold them in the source; P2 shows t45 S-11
  turns red when the narrow rules stop acting — one t45 run is about 20 minutes); the box comparison at UI SIZE 100% (done at the build, not by
  a suite).
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v642.jsx"); MOD = os.path.join(QA, "app_v642.mjs"); DOM = os.path.join(QA, "dom_v642.cjs"); PAGE = os.path.join(ROOT, "index.html")
for p in (SRC, PAGE, MOD, DOM, os.path.join(QA, "t106_ui_size_layout.mjs"), os.path.join(QA, "t45_phone_layout.py"), os.path.join(QA, "mk_testable.sh"),
          os.path.join(QA, "dom_entry_v642.jsx"), os.path.join(QA, "dom_v641.cjs"), os.path.join(ROOT, "v641.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v641 -> v642 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
TABG = "        .dc-narrow .dc-tabgrid { display: none !important; }\n"
WRAPP = "        .dc-narrow .dc-wrap-phone { flex-wrap: wrap !important; }\n"
SUBR = "        .dc-sub700w .dc-cards-sub700 {"
STACK = "        .dc-xs .dc-stack-xs {"
FNL = "  const eff = w * 100 / (uiScale || 100);\n"
LIS = '    on(); window.addEventListener("resize", on);\n'
DEP = "    return () => window.removeEventListener(\"resize\", on);\n  }, [uiScale]);\n"
TAXG = '<div className="dc-stack-phone" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>'
SURV = '<div className="dc-two-xs" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 10 }}>'
MCBOX = '<div className="dc-scrollx-xs" style={{ "--dc-floor": "280px" }}>{/* v6.42 (F-32, DH-1 (a)): DH-2 (a): scrolls in its own box under 360 px of room */}<div className="dc-tight-xs" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 0, fontSize: 12 }}>'
VTBOX = '<div className="dc-scrollx-xs" style={{ "--dc-floor": "0px" }}>{/* v6.42 (F-32, DH-1 (a)): DH-2 (a): scrolls in its own box under 360 px of room */}<table '
_i = ORIG.find("<li><strong>UI SIZE and the phone layout (v6.42).</strong>"); NOTE_LI = ORIG[_i:ORIG.find("</li>", _i) + 5] if _i >= 0 else "<missing>"
NEW_S = "No tab prints figures over their neighbours, and no page scrolls sideways, on a phone 360 px wide or more at any UI SIZE, or 320 px wide or more at UI SIZE up to 130% (v6.38, v6.40, v6.41 and v6.42 fixed the tabs that did). A larger UI SIZE gives the page less room, as a smaller screen would, and since v6.42 the layout follows that room, not the window’s width: where UI SIZE leaves less than 600 px of room, even in a desktop window, the app uses its phone layout. The app is not designed for less than 240 px of room - a phone narrower than 360 px at UI SIZE 150% - and there a page may scroll sideways."
OLD_S = "At UI SIZE 100% no tab prints figures over their neighbours on a screen 360 px wide or more (v6.38, v6.40 and v6.41 fixed the tabs that did); on a narrower phone a few figures on the Monte Carlo tab still do, and the Grade and Verify tabs scroll sideways a little. A larger UI SIZE gives the page less room, as a smaller screen would, but the phone layout follows the window’s width, not UI SIZE: with a UI SIZE above 100% some figures overlap in a narrow window - on a phone, most on the Monte Carlo tab - and on a phone some tabs scroll sideways."
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("a window media query back, holding the tab menu's rule", [(TABG, "        @media (max-width: 599px) { .dc-tabgrid { display: none !important; } }\n")], ["A-1", "A-2"]),
 "K2": ("My Data's flex-row rule dropped from the .dc-narrow rules", [(WRAPP, "")], ["A-2"]),
 "K3": ("the Roth calendar's rule unscoped", [(SUBR, "        .dc-cards-sub700 {")], ["A-3"]),
 "K4": (".dc-stack-xs unscoped", [(STACK, "        .dc-stack-xs {")], ["A-4"]),
 "K5": ("a .dc-tap44 rule in the app's stylesheet", [(TABG, TABG + "        .dc-narrow .dc-tap44 { min-height: 44px; }\n")], ["A-5"]),
 "K6": ("the layout width ignores UI SIZE", [(FNL, "  const eff = w;\n")], ["A-6b", "B-1"]),
 "K7": ("the resize listener never added", [(LIS, "    on();\n")], ["A-6c", "C-2"]),
 "K8": ("the hook's dependency list emptied", [(DEP, DEP.replace("[uiScale]", "[]"))], ["A-6c", "C-6"]),
 "K9": ("the root's class rendered as \"\" at desktop widths", [("className={_layoutCls || undefined}", "className={_layoutCls}")], ["A-7b"]),
 "K10": ("the narrow threshold 360 -> 340 px", [('return eff < 360 ? "dc-narrow dc-sub700w dc-xs"', 'return eff < 340 ? "dc-narrow dc-sub700w dc-xs"')], ["B-1", "B-3", "C-4"]),
 "K11": ("the Survivor cards lose dc-two-xs", [(SURV, SURV.replace('className="dc-two-xs" ', ""))], ["A-8"]),
 "K20": ("dc-two-xs moved from the Survivor cards to a Taxes grid", [(SURV, SURV.replace('className="dc-two-xs" ', "")),
          (TAXG, TAXG.replace('className="dc-stack-phone"', 'className="dc-stack-phone dc-two-xs"'))], ["A-8"]),
 "K12": ("the Monte Carlo percentile table's box loses its class", [(MCBOX, MCBOX.replace('className="dc-scrollx-xs" ', ""))], ["A-8", "A-9"]),
 "K13": ("the Verify check tables' floor 0 -> 300 px (the first build's)", [(VTBOX, VTBOX.replace('"0px"', '"300px"'))], ["A-9"]),
 "K18": ("the percentile table's tight cells dropped", [(MCBOX, MCBOX.replace('<div className="dc-tight-xs" style=', '<div style='))], ["A-8", "A-9"]),
 "K19": ("the percentile table's floor 280 -> 300 px (the first build's: it hid the last column at 412 px / 115%)", [(MCBOX, MCBOX.replace('"280px"', '"300px"'))], ["A-9"]),
 "K14": ("§13's v6.42 note removed, the whole item", [(NOTE_LI, "")], ["D-1", "D-2"]),
 "K15": ("the desktop item's v6.41 UI SIZE sentence restored", [(NEW_S, OLD_S)], ["D-3"]),
 "K17": ("one word changed on the Survivor tab", [('className="lbl">Monthly income after</div>', 'className="lbl">Monthly income later</div>')], ["E-3"]),
 "K16": ("the footer's version left at v6.41", [("<span>DANGER CLOSE v6.42 │ Not financial advice", "<span>DANGER CLOSE v6.41 │ Not financial advice")], ["D-4"]),
}
# (regular expression, replacement, how many matches it must have)
PAGEM = {
 "P1": ("the layout width ignores UI SIZE on the built page (the window's width alone)", [(r'(window\.innerWidth\|\|1024\)\*100/)\((\w)\|\|100\)', r'\g<1>100', 1)], ["S-11"]),
 "P2": ("the narrow threshold 360 -> 0", [(r'(\w)<360\?"dc-narrow dc-sub700w dc-xs"', r'\1<0?"dc-narrow dc-sub700w dc-xs"', 1)], ["S-11"]),
 "P3": ("the Monte Carlo percentile table's box loses its class", [(r'className:"dc-scrollx-xs",(style:\{"--dc-floor":"280px"\},children:\w+\.jsxs\("div",\{className:"dc-tight-xs")', r'\1', 1)], ["S-11"]),
 "P4": ("the percentile table's floor 280 -> 300 px (the first build's)", [(r'"--dc-floor":"280px"', r'"--dc-floor":"300px"', 1)], ["S-11"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Za-z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM, PAGE); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v642"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v642.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v642.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
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
        r = subprocess.run(["node", "t106_ui_size_layout.mjs", "v642"], cwd=QA, capture_output=True, timeout=5400)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t106 SUITE \(v642\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        red = ids(out); miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, encoding="utf-8").read() != ORIG:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
def run_page(label):
    desc, subs, want = PAGEM[label]; html = open(PAGE, encoding="utf-8").read()
    for pat, rep, n in subs:
        k = len(re.findall(pat, html))
        if k != n: return f"{label} TARGET matches {k}x in the built page (must be {n}) — control INVALID"
        html = re.sub(pat, rep, html)
    mut = os.path.join(ROOT, f"_ctl_{label}.html"); open(mut, "w", encoding="utf-8").write(html)
    try:
        r = subprocess.run(["python3", "t45_phone_layout.py", "v642", mut], cwd=QA, capture_output=True, timeout=9000)
        out = r.stdout.decode("utf-8", "replace"); red = ids(out)
        if not re.search(r"t45 SUITE \(v642\): \d+ passed", out): return f"{label} CRASHED — {desc}: {out[-300:]}"
        miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        os.remove(mut)
if "--dry" in sys.argv:   # target counts only: every source target must occur once, every page target its stated number of times
    html = open(PAGE, encoding="utf-8").read()
    for l, (d, pairs, w) in M.items(): print(l, [ORIG.count(o) for o, n in pairs] if pairs else "-", d)
    for l, (d, subs, w) in PAGEM.items(): print(l, [f"{len(re.findall(p_, html))}/{n}" for p_, r_, n in subs], d)
    sys.exit(0)
labels = [l for l in sys.argv[1:] if l != "--dry"] or list(M) + list(PAGEM)
out = []
for l in labels: out.append(run_page(l) if l in PAGEM else run_src(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
