#!/usr/bin/env python3
"""controls_v593_attribution.py — negative controls for t57 (docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md, Phase 2). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v593.jsx; the mutant is compiled (qa/mk_testable.sh), t57 runs (node only — t57 has no DOM leg), then ./v593.jsx and
./qa/app_v593.mjs are RESTORED and hash-checked. Run from the ROOT of a COPY of a v593 run folder with a real node_modules:
    python3 qa/tools/controls_v593_attribution.py [K1 ...]
    K1  Engine B gives person B the WRONG share of the conversion .......................... C2
    K2  a QCD taken from EMPLOYER dollars first (the law: only an IRA can make one) ........... A2 A3
    K3  Engine B's death rescale removed (inherited employer dollars stay employer) ............ C7
    K4  the "B or else A" fail-safe broken in the employer share (missing owner drops out) ..... B2
    K5  bonus deferral + match no longer counted as employer money .............................. B2 B4
    K6  one Engine A P-construction site stops passing penOwner .................................. D4
    K7  the calculator starts READING byPerson (the Phase-2 guard) .............................. D3
    K8  Engine A attributes the pension to its owner even after the owner has died ............... C5
    K9  Engine A's sale-gain site gives person B the whole candidate conversion .................. C2
    K10 Engine A's main site passes person A's conversion twice ................................. C2
    K11 Engine A's death rescale removed (its own copy of the merge) .............................. C7b
    K0  unmutated ............................................................................... t57 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v593.jsx"); MOD = os.path.join(QA, "app_v593.mjs")
need = (SRC, MOD, os.path.join(QA, "t57_attribution_carry.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "shim.txt"))
if not all(os.path.exists(p) for p in need): sys.exit("run from the ROOT of a v593 run folder copy")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("B: person B gets the wrong conversion share", "convB: conv_y * (1 - _attrFA),", "convB: conv_y * _attrFA,", ["C2"]),
 "K2": ("QCD from employer dollars first", "fromIra = Math.min(rIra, rd), fromEmp = rd - fromIra", "fromEmp = Math.min(rEmp, rd), fromIra = rd - fromEmp", ["A2", "A3"]),
 "K3": ("B: death rescale removed", "_empShareA = _survivorIsA && _qA > 0 ? Math.min(1, _emA / _qA) : 0;\n        _empShareB = !_survivorIsA && _qB > 0 ? Math.min(1, _emB / _qB) : 0;",
        "void _qA; void _qB;", ["C7"]),
 "K4": ("owner fail-safe broken (employer share A)", 'p.owner === "B" || !_isEmp(p) ? 0', 'p.owner !== "A" || !_isEmp(p) ? 0', ["B2"]),
 "K5": ("bonus + match not employer", "    tradEmpA: bonusAnnual * yearsA,", "    tradEmpA: 0,", ["B2", "B4"]),
 "K6": ("one P site drops penOwner", "pen: _pen, penOwner: getPensionOwner(), stateRate", "pen: _pen, stateRate", ["D4"]),
 "K7": ("the calculator reads byPerson", "  void byPerson;", "  void byPerson; if (byPerson === 1) return 0;", ["D3"]),
 "K8": ("A: pension stays with a dead owner", 'const _penOwnerY = widowed ? (survivorIsA ? "A" : "B") :', 'const _penOwnerY = false ? (survivorIsA ? "A" : "B") :', ["C5"]),
 "K9": ("A sale-gain site: B gets the whole candidate", "byPerson: _attrY(_cSplitA(c), c - _cSplitA(c)),", "byPerson: _attrY(_cSplitA(c), c),", ["C2"]),
 "K10": ("A main site: A's conversion twice", "byPerson: _attrY(convA, convB),", "byPerson: _attrY(convA, convA),", ["C2"]),
 "K11": ("A: death rescale removed", "_empShA = survivorIsA && _qA > 0 ? Math.min(1, _emA / _qA) : 0;\n          _empShB = !survivorIsA && _qB > 0 ? Math.min(1, _emB / _qB) : 0;",
         "void _qA; void _qB;", ["C7b"]),
}
cid = lambda l: (re.match(r"  \u2717 ([A-Z]\d+[a-z]?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v593"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t57_attribution_carry.mjs", "v593"], cwd=QA, capture_output=True, text=True, timeout=280)
        failed = [l for l in r.stdout.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t57 SUITE: (\d+) passed, (\d+) failed", r.stdout)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
        assert (md5(SRC), md5(MOD)) == BEFORE, "RESTORE FAILED"
res = [run(l) for l in (sys.argv[1:] or list(M))]
print("\n".join(res)); bad = [r for r in res if " FIRES" not in r and " OK " not in r]
print(f"\ncontrols_v593_attribution: {len(res) - len(bad)} of {len(res)} as expected"); sys.exit(1 if bad else 0)
