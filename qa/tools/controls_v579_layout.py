#!/usr/bin/env python3
"""controls_v579_layout.py — negative controls for t45 (docs/SCOPE_PHONE_LAYOUT.md §5). Coverage DEMONSTRATED (OPERATIONS §B2).
t45 tests the BUILT page, so each control mutates the built index.html's text (every target is asserted to occur exactly
once) and runs t45 against the mutant, REQUIRING the named checks to fire:
    M0  unmutated ................................................ t45 passes (88)
    M1  the .dc-scrollx scroll-box rule removed .................. wrapped tabs overflow the page (Guardrails among them)
    M2  the retirement selector's BOTH layers reverted ........... all 26 phone checks fire (the shell holds every tab)
        (grid back to repeat(3, 1fr) AND the cards' minWidth 0 / word-break removed. Either layer alone now suffices:
        the cards' zero minimum also makes the grid's 1fr harmless — measured at the build, where reverting only the
        grid fired nothing. Defence in depth, not a t45 blind spot: the page genuinely still fits.)
    M3  the allocation strip's BOTH layers reverted .............. all 26 phone checks fire (measured at the scope: 432 px)
        (grid back to repeat(4, 1fr) AND its two inner rows no longer wrap — as M2, either layer alone suffices)
    M4  the select { max-width: 100% } cap removed ............... the Roth tab overflows (its selects size to the longest option)
    M5  a STALE page (v5.78 footer) .............................. 0-2 fires — a page from another release is never measured
    M6  NO BROWSER (PLAYWRIGHT_BROWSERS_PATH points nowhere) ..... 0-3 fires and the suite FAILS — it never skips (decision D-2)
KNOWN GAP, not a control: the `.dc-scrollx > *` 600 px floor keeps table cells legible INSIDE their scroll box; the page fits
with or without it, so t45 (a page-width test) cannot see it. Disclosed in the CHANGELOG and the scope's build record.
USAGE  from the ROOT of a v579 run folder (needs ./index.html, the built page, and ./qa/t45_phone_layout.py):
    python3 qa/tools/controls_v579_layout.py          # all
    python3 qa/tools/controls_v579_layout.py M4       # one
"""
import os, re, subprocess, sys
ROOT = os.getcwd(); PAGE = os.path.join(ROOT, "index.html"); QA = os.path.join(ROOT, "qa")
if not os.path.exists(PAGE) or not os.path.exists(os.path.join(QA, "t45_phone_layout.py")):
    sys.exit("run from the ROOT of a v579 run folder (needs ./index.html and ./qa/t45_phone_layout.py)")
M = {
    "M0": ("unmutated", None, None, {}, "pass"),
    "M1": ("the .dc-scrollx scroll-box rule removed", ".dc-scrollx { overflow-x: auto; max-width: 100%; }", "", {}, ["L-phone 'guardrails'"]),
    "M2": ("the retirement selector's grid AND card layers reverted", 'gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap:10}',
           'gridTemplateColumns:"repeat(3, 1fr)",gap:10}', {}, "all26"),
    "M3": ("the allocation strip's grid AND row-wrap layers reverted", 'gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:1,',
           'gridTemplateColumns:"repeat(4, 1fr)",gap:1,', {}, "all26"),
    "M4": ("the select cap removed", "select { max-width: 100%; }", "", {}, ["L-phone 'roth'"]),
    "M5": ("a stale page (v5.78 footer)", "DANGER CLOSE v5.79 │ Not financial advice", "DANGER CLOSE v5.78 │ Not financial advice", {}, ["0-2"]),
    "M6": ("no browser can launch", None, None, {"PLAYWRIGHT_BROWSERS_PATH": "/nonexistent-browsers"}, ["0-3"]),
}
html = open(PAGE, encoding="utf-8").read()
def run(label):
    desc, a, b, env, want = M[label]
    page = PAGE
    if a is not None:
        n = html.count(a)
        if n != 1: return False, f"target occurs {n} times (must be exactly 1) — the mutation did not land"
        mut = html.replace(a, b, 1)
        if label == "M3":   # the row layer: both inner rows, each exactly once
            for x, y in [('display:"flex",flexWrap:"wrap",justifyContent:"space-between"}', 'display:"flex",justifyContent:"space-between"}'),
                         ('display:"flex",flexWrap:"wrap",columnGap:4,justifyContent:"space-between",marginTop:3}',
                          'display:"flex",justifyContent:"space-between",marginTop:3}')]:
                k = mut.count(x)
                if k != 1: return False, f"row-layer target occurs {k} times (must be exactly 1)"
                mut = mut.replace(x, y, 1)
        if label == "M2":   # the card layer: its variable name is the minifier's, so match it by pattern, exactly once
            rx = r'("--rc":[\w$]+\.color),minWidth:0,overflowWrap:"anywhere"'
            k = len(re.findall(rx, mut))
            if k != 1: return False, f"card-layer pattern occurs {k} times (must be exactly 1)"
            mut = re.sub(rx, r"\1", mut, count=1)
        page = os.path.join(ROOT, f"ctl_{label}.html"); open(page, "w", encoding="utf-8").write(mut)
    try:
        r = subprocess.run(["python3", "t45_phone_layout.py", "v579", page], cwd=QA, capture_output=True, text=True, timeout=600,
                           env={**os.environ, **env})
    finally:
        if page != PAGE and os.path.exists(page): os.remove(page)
    m = re.search(r"(\d+) passed, (\d+) failed", r.stdout)
    if not m: return False, "t45 printed no total (DIED?): " + (r.stdout + r.stderr)[-300:]
    p, f = int(m.group(1)), int(m.group(2))
    fired = [l.strip()[2:] for l in r.stdout.splitlines() if l.strip().startswith("\u2717")]
    if want == "pass": return (f == 0 and p == 88), f"t45: {p} passed, {f} failed"
    if want == "all26":
        ph = [x for x in fired if x.startswith("L-phone")]
        return (len(ph) == 26 and r.returncode != 0), f"{len(ph)} of 26 phone checks fired"
    miss = [w for w in want if not any(x.startswith(w) for x in fired)]
    return (not miss and r.returncode != 0), f"{f} fired" + (f"; EXPECTED BUT SILENT: {miss}" if miss else "") + \
        "\n        " + "\n        ".join("\u2717 " + x[:100] for x in fired[:3])
labels = sys.argv[1:] or list(M); bad = 0
for lab in labels:
    ok, d = run(lab); bad += 0 if ok else 1
    print(f"  {'PASS' if ok else 'FAIL'}  {lab}  {M[lab][0]}\n        {d}", flush=True)
print(f"\ncontrols_v579_layout: {len(labels) - bad} of {len(labels)} behaved as required"); sys.exit(1 if bad else 0)
