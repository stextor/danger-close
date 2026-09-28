#!/usr/bin/env python3
"""controls_v582_legibility.py — negative controls for t48 (docs/SCOPE_TEXT_AND_TARGETS.md §4, §9). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target is asserted to occur
exactly once; the run folder's ./v582.jsx and ./index.html are swapped for a mutant and RESTORED, hash-checked, after every run.
  SOURCE (T48_SOURCE_ONLY=1 — §X/§T need no browser):
    M1  a chart label back to 9 px ............................................................... X-1
    M2  the x-axis text painted with --line2 again (a literal fill) ............................... X-3
    M3  .tab back to 10 px ........................................................................ X-4
    M4  a hard-coded #00ff88 text colour re-planted ............................................... X-6
    M5  a hex alpha glued onto a colour again (`${rowColor}11`) ................................... X-11
    M6  the default skin's --ink-faint back to v5.81's #3a7a5a .................................... T-1 default
    M7  the default skin's --ink-dim lift dropped (dim no longer 1.20x faint) ..................... T-2 default
    M8  section 13 stops saying the Field Manual's small print is not yet fixed ................... X-10
  BUILT PAGE (T48_SKINS restricts the skin sweep; the phone, tablet and clipping legs always run):
    M9  the 24 px button minimum removed .......................................................... C-1
    M10 the phone-critical 44 px rule removed ..................................................... P-1 P-2 P-3 P-4 P-5
    M11 the page's default --ink-faint back to #3a7a5a (source untouched: only the RENDER sees it) . R-2 1440px default
    M12 Reading Paper's --ink-faint back to v5.81's (its count must exceed the pin) ............... R-2 1440px paperSepia
    M0  unmutated (T48_SKINS=default,paperSepia) .................................................. t48 passes
  NOT BUILT: a no-op skin switch (scope §4). The minified page gives no stable single-occurrence target for the click handler;
  R-0 ("the switch landed") is exercised positively in every run, 13 times per full run. Recorded, not claimed.
USAGE  from the ROOT of a v582 run folder:  python3 qa/tools/controls_v582_legibility.py [M4 M9 ...]
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v582.jsx"); PAGE = os.path.join(ROOT, "index.html")
if not all(os.path.exists(p) for p in (SRC, PAGE, os.path.join(QA, "t48_legibility_targets.py"))):
    sys.exit("run from the ROOT of a v582 run folder (needs ./v582.jsx, ./index.html, ./qa/t48_legibility_targets.py)")
XAX = ('})).selectAll("text,line,path").attr("stroke", function () { return this.tagName === "text" ? "none" : "var(--line2)"; })'
       '.attr("fill", function () { return this.tagName === "text" ? "var(--ink-dim)" : "var(--line2)"; })')
M = {
    "M0":  ("unmutated", None, None, None, {"T48_SKINS": "default,paperSepia"}, []),
    "M1":  ("a chart label at 9 px", "src", '.attr("font-size", 11).attr("font-family", "monospace").text("UPPER GUARDRAIL (120%)")',
            '.attr("font-size", 9).attr("font-family", "monospace").text("UPPER GUARDRAIL (120%)")', {"T48_SOURCE_ONLY": "1"}, ["X-1"]),
    "M2":  ("axis text on --line2", "src", XAX, XAX.split(".attr(\"fill\"")[0] + '.attr("fill", "var(--line2)")', {"T48_SOURCE_ONLY": "1"}, ["X-3"]),
    "M3":  (".tab at 10 px", "src", "color: var(--ink-faint); padding: 7px 13px; cursor: pointer; font-family: inherit; font-size: 11px;",
            "color: var(--ink-faint); padding: 7px 13px; cursor: pointer; font-family: inherit; font-size: 10px;", {"T48_SOURCE_ONLY": "1"}, ["X-4"]),
    "M4":  ("#00ff88 re-planted", "src", 'const rowColor = isSel ? (opt.age === 67 ? "var(--accent)"',
            'const rowColor = isSel ? (opt.age === 67 ? "#00ff88"', {"T48_SOURCE_ONLY": "1"}, ["X-6"]),
    "M5":  ("hex alpha glued on", "src", "color-mix(in srgb, ${rowColor} 6.7%, transparent)", "${rowColor}11", {"T48_SOURCE_ONLY": "1"}, ["X-11"]),
    "M6":  ("default faint back to v5.81", "src", 'inkFaint: "#6F9F86"', 'inkFaint: "#3a7a5a"', {"T48_SOURCE_ONLY": "1"}, ["T-1 default"]),
    "M7":  ("default dim lift dropped", "src", 'inkDim: "#8EAB9C"', 'inkDim: "#7A9889"', {"T48_SOURCE_ONLY": "1"}, ["T-2 default"]),
    "M8":  ("section 13 drops 'not yet fixed'", "src", "This Field Manual's own small print is not yet fixed",
            "This Field Manual's own small print is fine", {"T48_SOURCE_ONLY": "1"}, ["X-10"]),
    "M9":  ("24 px button minimum removed", "page", "button { min-width: 24px; min-height: 24px; }", "", {"T48_SKINS": "default"}, ["C-1"]),
    "M10": ("44 px phone rule removed", "page", "#dc-dg-accept, .dc-tap44 { min-height: 44px; }", "#dc-dg-accept-x { min-height: 44px; }",
            {"T48_SKINS": "default"}, ["P-1", "P-2", "P-3", "P-4", "P-5"]),
    "M11": ("rendered default faint regressed", "page", '"#6F9F86"', '"#3a7a5a"', {"T48_SKINS": "default"}, ["R-2 1440px default"]),
    "M12": ("Reading Paper faint regressed", "page", '"#6E624F"', '"#8B7E67"', {"T48_SKINS": "paperSepia"}, ["R-2 1440px paperSepia"]),
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
        r = subprocess.run([sys.executable, "t48_legibility_targets.py", "v582"], cwd=QA, capture_output=True, text=True,
                           env={**os.environ, **env}, timeout=1800)
        out = r.stdout; failed = [l for l in out.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t48 SUITE \(v582\): (\d+) passed, (\d+) failed", out)
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
print(f"\ncontrols_v582_legibility: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
