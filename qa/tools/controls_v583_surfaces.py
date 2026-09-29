#!/usr/bin/env python3
"""controls_v583_surfaces.py — negative controls for t48 at v5.83 (docs/SCOPE_LIGHT_SKIN_SURFACES.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red; each target occurs exactly once; the run
folder's ./v583.jsx and ./index.html are swapped for a mutant and RESTORED, hash-checked, after every run.
  SOURCE (T48_SOURCE_ONLY=1):
    M1  one surface re-planted as a dark-theme rgba() ............................................ X-12
    M2  Field Paper loses its onRing token ........................................................ X-13
    M3  a selected state back to plain --accent (.tab.on) ........................................ X-14
    M4  a hovered row washed with --ring again .................................................... X-15
  BUILT PAGE (T48_SKINS restricts the skin sweep):
    M5  the hover wash back to --ring in the RENDER (source untouched) ........................... R-2 1440px default
    M6  Reading Paper's warn back to v5.82's #96690A ............................................. R-2 1440px paperSepia
    M7  the active tab's text back to --accent (no --on-ring) in the RENDER ...................... R-2 1440px highLight
    M0  unmutated (T48_SKINS=default,paperSepia) .................................................. t48 passes
USAGE  from the ROOT of a v583 run folder:  python3 qa/tools/controls_v583_surfaces.py [M1 M5 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v583.jsx"); PAGE = os.path.join(ROOT, "index.html")
if not all(os.path.exists(p) for p in (SRC, PAGE, os.path.join(QA, "t48_legibility_targets.py"))):
    sys.exit("run from the ROOT of a v583 run folder (needs ./v583.jsx, ./index.html, ./qa/t48_legibility_targets.py)")
HOV = ".prow:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); }"
TABON = ".tab.on { background: var(--ring); border-color: var(--accent); color: var(--on-ring, var(--accent)); }"
M = {
    "M0": ("unmutated", None, None, None, {"T48_SKINS": "default,paperSepia"}, []),
    "M1": ("a dark-theme rgba() re-planted", "src", "color-mix(in srgb, var(--accent) 15%, transparent)", "rgba(0,255,136,0.15)", {"T48_SOURCE_ONLY": "1"}, ["X-12"]),
    "M2": ("Field Paper loses onRing", "src", ', onRing: "#22352B"', "", {"T48_SOURCE_ONLY": "1"}, ["X-13"]),
    "M3": (".tab.on back to --accent", "src", TABON, TABON.replace("var(--on-ring, var(--accent))", "var(--accent)"), {"T48_SOURCE_ONLY": "1"}, ["X-14"]),
    "M4": ("hover washed with --ring (source)", "src", HOV, ".prow:hover { background: var(--ring); }", {"T48_SOURCE_ONLY": "1"}, ["X-15"]),
    "M5": ("hover washed with --ring (render)", "page", HOV, ".prow:hover { background: var(--ring); }", {"T48_SKINS": "default"}, ["R-2 1440px default"]),
    "M6": ("Reading Paper warn back to v5.82", "page", '"#835D10"', '"#96690A"', {"T48_SKINS": "paperSepia"}, ["R-2 1440px paperSepia"]),
    "M7": ("active tab text back to --accent (render)", "page", TABON, TABON.replace("var(--on-ring, var(--accent))", "var(--accent)"), {"T48_SKINS": "highLight"}, ["R-2 1440px highLight"]),
}
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
BEFORE = (md5(SRC), md5(PAGE)); keep = {SRC: open(SRC, "rb").read(), PAGE: open(PAGE, "rb").read()}
def run(label):
    desc, where, old, new, env, want = M[label]
    try:
        if where:
            p = SRC if where == "src" else PAGE; s = keep[p].decode("utf-8")
            n = s.count(old)
            if n != 1: return f"{label} TARGET occurs {n}x (must be 1) — control INVALID"
            open(p, "w", encoding="utf-8").write(s.replace(old, new))
        r = subprocess.run([sys.executable, "t48_legibility_targets.py", "v583"], cwd=QA, capture_output=True, text=True,
                           env={**os.environ, **env}, timeout=1800)
        out = r.stdout; failed = [l for l in out.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t48 SUITE \(v583\): (\d+) passed, (\d+) failed", out)
        if label == "M0":
            return f"M0 {'OK' if r.returncode == 0 and tally else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        # the page's footer check 0-2 and the skin-subset pins are not what is being tested; everything named must fire
        miss = [w for w in want if not any(l.startswith(f"  \u2717 {w}") for l in failed)]
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}"
    finally:
        for p, b in keep.items(): open(p, "wb").write(b)
        assert (md5(SRC), md5(PAGE)) == BEFORE, "RESTORE FAILED"
labels = sys.argv[1:] or list(M)
res = [run(l) for l in labels]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v583_surfaces: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
