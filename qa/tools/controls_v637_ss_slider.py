#!/usr/bin/env python3
"""controls_v637_ss_slider.py — negative controls for t101 (docs/SCOPE_F29_SS_SLIDER_START.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the source;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t101 runs on
the v6.37 leg, then ./v637.jsx, qa/app_v637.mjs and qa/dom_v637.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v636 -> v637 run folder:  python3 qa/tools/controls_v637_ss_slider.py [K1 ...]
  where the sliders start
    K1  spouse A's slider back at the literal 67 (DS-1) ............................................... A-2, B-1
  the baseline (DS-2, DS-3)
    K2  the plan column pays the FRA amount from the plan's claim date (v6.36's hybrid) ............... B-3, C-9
    K3  the delay total counts from the earlier claim, not from retirement ............................ C-6, C-9
    K4  the permanent card compares with FRA, not the plan .............................................. C-2, C-9
    K5  the table stops at retirement + 8 whatever the claims ........................................... C-8
    K6  claim months taken as January (the birth month ignored) ......................................... C-5
  spouse B and the single household (DS-4, DS-6)
    K7  the shortfall card takes spouse B's benefit at her age in the retirement year ................... C-12
    K8  the grid tags spouse B's age in the retirement year "Modeled" ................................... C-10, C-11
    K9  the note's claim restored to the grid ("MC simulation models") ................................... A-5
    K10 a single household's table counts the placeholder spouse B's check ............................... C-13
  copy
    K11 the top card's label back to "vs FRA" ............................................................ B-3
    K12 the Field Manual's slider entry back to v6.36's ................................................... E-1
    K13 the Field Manual's v6.37 note removed .............................................................. E-2
  the build review
    K14 the claim age taken as stored (65.4 not rounded) .................................................. B-8
    C0  unmutated ............................................................................................ t101 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v637.jsx"); T101 = os.path.join(QA, "t101_ss_slider_start.mjs")
MOD = os.path.join(QA, "app_v637.mjs"); DOM = os.path.join(QA, "dom_v637.cjs")
for p in (SRC, T101, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v637.jsx"), os.path.join(QA, "shim.txt"),
          os.path.join(QA, "app_v636.mjs"), os.path.join(QA, "dom_v636.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v636 -> v637 run folder copy (missing {p})")
S = lambda pairs: [(SRC, a, b) for a, b in pairs]
SF = "Math.max(0, POST_PAYMENTS.monthly - _bIncAt(_ppM) - pension - _aSelAt(_ppM))"
SF_OLD = "Math.max(0, POST_PAYMENTS.monthly - (_single ? 0 : spouseBOptions.find(o => o.age === Math.min(70, Math.max(62, retireYear - _dobBYear))).benefit) - pension - _aSelAt(_ppM))"
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("spouse A's slider back at 67", S([('useState(() => ssTabClaimAge("A"));', "useState(67);")]), ["A-2", "B-1"]),
 "K2": ("the plan column pays the FRA amount from the plan's date", S([("const _aPlanAt = m => m >= plannedClaimMonthA ? plannedBenefitA : 0;",
                                                                     "const _aPlanAt = m => m >= plannedClaimMonthA ? spouseAFRA : 0;")]), ["B-3", "C-9"]),
 "K3": ("the delay total counts from the earlier claim", S([("for (let m = retireMonth; m < laterClaimMonthA; m++) drawDelta +=",
                                                           "for (let m = Math.min(retireMonth, plannedClaimMonthA, selectedClaimMonth); m < laterClaimMonthA; m++) drawDelta +=")]), ["C-6", "C-9"]),
 "K4": ("the permanent card against FRA", S([("const permanentGainA = selectedBenefit - plannedBenefitA;", "const permanentGainA = selectedBenefit - spouseAFRA;")]), ["C-2", "C-9"]),
 "K5": ("the table stops at retirement + 8", S([("const endYear = Math.max(retireYear + 8, _mYear(laterClaimMonthA));", "const endYear = retireYear + 8;")]), ["C-8"]),
 "K6": ("claim months taken as January", S([("const plannedClaimMonthA = (_dobAYear + plannedAgeA) * 12 + claimMonth;", "const plannedClaimMonthA = (_dobAYear + plannedAgeA) * 12 + 1;"),
                                           ("const selectedClaimMonth = claimYear * 12 + claimMonth;", "const selectedClaimMonth = claimYear * 12 + 1;")]), ["C-5"]),
 "K7": ("the shortfall card takes spouse B's retirement-year benefit", S([(SF, SF_OLD)]), ["C-12"]),
 "K8": ("spouse B's retirement-year age tagged Modeled", S([("const isModeled = opt.age === plannedAgeB;", "const isModeled = opt.age === retireYear - _dobBYear;")]), ["C-10", "C-11"]),
 "K9": ("the note's claim back in the grid", S([("* = FRA │ Estimated FRA benefit derived from", "* = FRA │ MC simulation models │ Estimated FRA benefit derived from")]), ["A-5"]),
 "K10": ("a single household counts spouse B's check", S([("const _bIncAt = m => (!_single && m >= _bClaimMonth) ? selectedSpouseB.benefit : 0;",
                                                         "const _bIncAt = m => (m >= _bClaimMonth) ? selectedSpouseB.benefit : 0;")]), ["C-13"]),
 "K11": ("the top card's label back to vs FRA", S([('className="lbl">Portfolio draw delta vs your plan</div>', 'className="lbl">Portfolio draw delta vs FRA</div>')]), ["B-3"]),
 "K12": ("the Field Manual's slider entry back to v6.36's", S([("<strong>SS Claim-Age sliders (SS tab)</strong> — 62–70, one per spouse; each opens at that person’s claim age from My Data and drives",
                                                               "<strong>SS Claim-Age slider (SS tab)</strong> — 62–70, drives")]), ["E-1"]),
 "K14": ("the claim age neither rounded nor clamped by type", S([("const n = Math.round(Number(src && src.plannedAge));", "const n = Number(src && src.plannedAge);")]), ["B-8"]),
 "K13": ("the Field Manual's v6.37 note removed", S([("<li><strong>The SS tab’s claim-age explorer starts at your plan (v6.37).</strong>", "<li><strong>(removed)</strong>")]), ["E-2"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {SRC: open(SRC, "rb").read()}
WATCH = (SRC, T101, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v637"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v637.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v637.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG[SRC].decode("utf-8")
            for path, old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t101_ss_slider_start.mjs", "v637"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t101 SUITE \(v637\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
