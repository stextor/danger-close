#!/usr/bin/env python3
"""controls_v598_disclosures.py — negative controls for t62 (docs/SCOPE_F_DISCLOSURES_V598.md). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v598.jsx; t62 reads the source by parser, so no rebuild is needed; ./v598.jsx is RESTORED and hash-checked.
Run from the ROOT of a COPY of a v597 -> v598 run folder:  python3 qa/tools/controls_v598_disclosures.py [K1 ...]
    K1  the §13 sentence removed ......................................................... A-1
    K2  the chart clause gives the wrong work-around ...................................... A-1b
    K3  the glossary pair swapped back .................................................... B-2
    K4  a ResizeObserver added while the chart clause stays (a fix without removing it) ... A-3
    K5  the Docs iframe no longer a 74vh box while the scroll clause stays ................ A-4
    K6  the "Authoritative sources" footer moved off the end .............................. B-1
    K0  unmutated ......................................................................... t62 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v598.jsx")
for p in (SRC, os.path.join(QA, "t62_desktop_disclosures.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v597 -> v598 run folder copy (missing {p})")
S0 = open(SRC, encoding="utf-8").read()
YC = S0[S0.index('<p class=\\"term\\"><b>Yield Curve</b>'):]; YC = YC[:YC.index("</p>") + 4]
AS = S0[S0.index("<p class='term'><b>Authoritative sources</b>"):]; AS = AS[:AS.index("</p>") + 4]
API = S0[S0.index('<p class=\\"term\\"><b>API Key</b>'):]; API = API[:API.index("</p>") + 4]
AGY = S0[S0.index('<p class=\\"term\\"><b>Agency MBS</b>'):]; AGY = AGY[:AGY.index("</p>") + 4]
SEP = "\\n      "
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("§13 sentence removed", " Three things still behave like a desktop page (v5.98):", " (v5.98):", ["A-1"]),
 "K2": ("wrong work-around", "leave the tab and come back to redraw it", "reload the page to redraw it", ["A-1b"]),
 "K3": ("glossary pair swapped back", AGY + SEP + API, API + SEP + AGY, ["B-2"]),
 "K4": ("ResizeObserver added, clause kept", "const BASE_GROWTH = 0.045;", "const BASE_GROWTH = 0.045; const __roProbe = typeof ResizeObserver;", ["A-3"]),
 "K5": ("iframe no longer 74vh", 'height: "74vh", border: "none"', 'height: "100%", border: "none"', ["A-4"]),
 "K6": ("footer moved off the end", YC + SEP + AS, AS + SEP + YC, ["B-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-B]-[A-Za-z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest(); BEFORE = md5(SRC)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            if S0.count(old) != 1: return f"{label} TARGET occurs {S0.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(S0.replace(old, new))
        r = subprocess.run(["node", "t62_desktop_disclosures.mjs", "v598"], cwd=QA, capture_output=True, timeout=300)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t62 SUITE \(v598\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed if cid(l)} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        open(SRC, "w", encoding="utf-8").write(S0)
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = md5(SRC) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
