#!/usr/bin/env python3
"""controls_v581_first_screen.py — negative controls for t47 (docs/SCOPE_PHONE_FIRST_SCREEN.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2). Two kinds, each target asserted to occur exactly once:
  SOURCE (the run folder's ../v581.jsx is swapped for a mutant and RESTORED, hash-checked) — t47's structure checks must fire:
    M1  the phone menu calls setActiveTab directly (bypassing selectTab and its unsaved-edits guard) ....... S-3
    M2  the phone menu lists TAB_IDS instead of visibleTabs (Simple Mode desync) ........................... S-4
    M3  a second inline copy of the tab list appears ....................................................... S-1
  BUILT PAGE (a mutant copy of ./index.html is passed to t47) — its browser checks must fire:
    M4  the rule hiding the tab grid below 600 px is removed ............................................... P-1
    M5  the rule collapsing the plan summary is removed (it starts open) ................................... P-7
    M6  the rule showing phone-only elements below 600 px is removed ....................................... P-2
    M0  unmutated ......................................................................................... t47 passes
USAGE  from the ROOT of a v581 run folder:  python3 qa/tools/controls_v581_first_screen.py [M4]
"""
import hashlib, os, re, shutil, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v581.jsx"); PAGE = os.path.join(ROOT, "index.html")
if not all(os.path.exists(p) for p in (SRC, PAGE, os.path.join(QA, "t47_phone_first_screen.py"))):
    sys.exit("run from the ROOT of a v581 run folder (needs ./v581.jsx, ./index.html, ./qa/t47_phone_first_screen.py)")
M = {
    "M0": ("unmutated", None, None, None, []),
    "M1": ("the phone menu bypasses selectTab", "src", "onChange={e => selectTab(e.target.value)}", "onChange={e => setActiveTab(e.target.value)}", ["S-3"]),
    "M2": ("the phone menu lists TAB_IDS, not visibleTabs", "src", "{visibleTabs.map(t => <option key={t} value={t}>", "{TAB_IDS.map(t => <option key={t} value={t}>", ["S-4"]),
    "M3": ("a second COMPLETE copy of the tab list", "src", "const tabLabel = (t) => TAB_LABELS[t] || t;", "__COPY__", ["S-1"]),
    "M4": ("the grid-hiding rule removed", "page", ".dc-tabgrid { display: none !important; }", "", ["P-1"]),
    "M5": ("the summary-collapse rule removed", "page", ".dc-plansum:not(.open) { display: none; }", "", ["P-7"]),
    "M6": ("the phone-only display rule removed", "page", "          .dc-phone-only { display: block; }", "", ["P-2"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
BEFORE = (md5(SRC), md5(PAGE))
def run(label):
    desc, kind, a, b, must = M[label]
    page = PAGE; bak = SRC + ".ctlbak"
    try:
        if kind == "src":
            s = open(SRC, encoding="utf-8").read(); n = s.count(a)
            if n != 1: return False, f"source target occurs {n} times (must be 1)"
            if b == "__COPY__":   # a full second copy, taken from TAB_IDS' own definition (a prefix stub would not be a copy)
                full = re.search(r"const TAB_IDS = (\[[^\]]*\]);", s).group(1); b = a + "\nconst TAB_IDS_COPY = " + full + ";"
            shutil.copy2(SRC, bak); open(SRC, "w", encoding="utf-8").write(s.replace(a, b, 1))
        elif kind == "page":
            h = open(PAGE, encoding="utf-8").read(); n = h.count(a)
            if n != 1: return False, f"page target occurs {n} times (must be 1)"
            page = os.path.join(ROOT, f"ctl_{label}.html"); open(page, "w", encoding="utf-8").write(h.replace(a, b, 1))
        r = subprocess.run(["python3", "t47_phone_first_screen.py", "v581", page], cwd=QA, capture_output=True, text=True, timeout=600)
    finally:
        if os.path.exists(bak): shutil.move(bak, SRC)
        if page != PAGE and os.path.exists(page): os.remove(page)
    m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
    if not m: return False, "t47 printed no total: " + (r.stdout + r.stderr)[-200:]
    fired = [l.strip()[2:] for l in r.stdout.splitlines() if l.strip().startswith("\u2717")]
    if not must: return int(m.group(2)) == 0, f"t47: {m.group(0)}"
    miss = [w for w in must if not any(x.startswith(w) for x in fired)]
    return (not miss), f"{len(fired)} fired" + (f"; EXPECTED BUT SILENT: {miss}" if miss else "") + "".join("\n          \u2717 " + x[:95] for x in fired[:3])
labels = sys.argv[1:] or list(M); bad = 0
for lab in labels:
    ok, d = run(lab); bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {M[lab][0]}\n        {d}", flush=True)
if (md5(SRC), md5(PAGE)) != BEFORE: print("  FAIL  the run folder's v581.jsx or index.html was NOT restored"); bad += 1
print(f"\ncontrols_v581_first_screen: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
