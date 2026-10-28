#!/usr/bin/env python3
"""controls_v634_contrib.py — negative controls for t97 (docs/SCOPE_D58_CONTRIB_SAVE_V634.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file; a
source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t97 runs on the
v6.34 leg, then ./v634.jsx, ./METHODOLOGY.md, qa/app_v634.mjs and qa/dom_v634.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v633 -> v634 run folder:  python3 qa/tools/controls_v634_contrib.py [K1 ...]
    K1  buildPortfolio writes the paycheck rollup again (and its mirror) ....................... A-2, A-3, C-1, F-3
    K2  the draft alone writes the rollup ........................................................ A-4
    K3  Export Backup alone writes the rollup .................................................... A-1
    K4  the mirror rounded while the split keeps its cents ...................................... A-6b, F-3
    K5  always the stored figure — the edit ignored ............................................. B-3, B-4, D-7
    K6  the pay frequency not counted as an edit ................................................. B-4, F-4
    K7  a typed 0 not counted as an edit ......................................................... D-7
    K8  Pre-tax monthly drawn from the rollup .................................................... D-1, F-7
    K9  the readout's A figure from the rollup ................................................... D-4, F-7
    K10 WHERE CONTRIBUTIONS LAND's total from the rollup ......................................... D-5, F-7
    K11 the 402(g) not-counted sentence never shown .............................................. E-1, E-2b
    K12 the Roth/bonus 402(g) warning suppressed when the stored figure is in use ................ E-2
    K13 METHODOLOGY's false employer-match sentence restored ..................................... G-3
    K14 the Field Manual's v6.34 entry removed ................................................... G-1, G-1b
    K15 an edit of A's Roth marks the paycheck row edited ........................................... F-4, D-10
    K16 the 402(g) check counts a breakdown the plan is not using ................................... E-5
    K17 the bonus deferral dropped from the 402(g) check in stored mode ............................. E-2c
    K18 a saved zero paycheck row reopens as 0, 0, 0 ................................................ D-9, D-9b
    K19 Annual total from the rollup ................................................................ D-2
    K20 the both-figures sentence never shown ....................................................... B-2
    K21 Per-paycheck total shows $0 instead of — .................................................... D-3
    C0  unmutated ................................................................................. t97 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v634.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T97 = os.path.join(QA, "t97_contrib_save.mjs")
MOD = os.path.join(QA, "app_v634.mjs"); DOM = os.path.join(QA, "dom_v634.cjs")
for p in (SRC, METH, T97, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v634.jsx"), os.path.join(QA, "shim.txt"),
          os.path.join(QA, "app_v633.mjs"), os.path.join(QA, "dom_v633.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v633 -> v634 run folder copy (missing {p})")
RU = "Math.round(perPaycheckTotal * _periodsPerYear / 12)"
S = lambda pairs: [(SRC, a, b) for a, b in pairs]
M = {
 "C0": ("unmutated", [], [], "t97"),
 "K1": ("buildPortfolio writes the rollup again", S([("        contribPreTaxA: _preTaxA.save,", f"        contribPreTaxA: {RU},"),
        ("        monthly401k: _preTaxA.save + num(rothAMo),", f"        monthly401k: {RU} + num(rothAMo),")]), ["A-2", "A-3", "C-1", "F-3"], "t97"),
 "K2": ("the draft alone writes the rollup", S([("JSON.stringify({ ts, portfolio: buildPortfolio(), expenses: buildExpenses() })",
        f"JSON.stringify({{ ts, portfolio: (() => {{ const _p = buildPortfolio(); _p.contributions.contribPreTaxA = {RU}; _p.contributions.monthly401k = {RU}; return _p; }})(), expenses: buildExpenses() }})")]), ["A-4"], "t97"),
 "K3": ("Export Backup alone writes the rollup", S([("        portfolio: buildPortfolio(),\n        expenses: buildExpenses(),\n        masterPrompt: genAIContext(),",
        f"        portfolio: (() => {{ const _p = buildPortfolio(); _p.contributions.contribPreTaxA = {RU}; _p.contributions.monthly401k = {RU}; return _p; }})(),\n        expenses: buildExpenses(),\n        masterPrompt: genAIContext(),")]), ["A-1"], "t97"),
 "K4": ("the mirror rounded while the split keeps cents", S([("        monthly401k: _preTaxA.save + num(rothAMo),", "        monthly401k: Math.round(_preTaxA.save) + num(rothAMo),")]), ["A-6b", "F-3"], "t97"),
 "K5": ("always the stored figure — the edit ignored", S([("  if (edited || Math.abs(st - Math.round(ru)) <= 0.5)", "  if (Math.abs(st - Math.round(ru)) <= 0.5)")]), ["B-3", "B-4", "D-7"], "t97"),
 "K6": ("the pay frequency not counted as an edit", S([("onChange={e => { setPaycheckEdited(true); setContribFreq(e.target.value); }}", "onChange={e => setContribFreq(e.target.value)}")]), ["B-4", "F-4"], "t97"),
 "K7": ("a typed 0 not counted as an edit", S([("onChange={e => { setPaycheckEdited(true); setEmpContrib(e.target.value); }}",
        "onChange={e => { if (parseFloat(e.target.value)) setPaycheckEdited(true); setEmpContrib(e.target.value); }}")]), ["D-7"], "t97"),
 "K8": ("Pre-tax monthly drawn from the rollup", S([("fontWeight: 600 }}>${Math.round(monthly401k).toLocaleString()}/mo</span>", f"fontWeight: 600 }}}}>${{{RU}.toLocaleString()}}/mo</span>")]), ["D-1", "F-7"], "t97"),
 "K9": ("the readout's A figure from the rollup", S([("const _tA = 12 * monthly401k * _yrsA + _bonusYr * _yrsA;", "const _tA = 12 * (perPaycheckTotal * _periodsPerYear / 12) * _yrsA + _bonusYr * _yrsA;")]), ["D-4", "F-7"], "t97"),
 "K10": ("WHERE CONTRIBUTIONS LAND's total from the rollup", S([("const _totalMo = monthly401k + num(rothAMo)", "const _totalMo = (perPaycheckTotal * _periodsPerYear / 12) + num(rothAMo)")]), ["D-5", "F-7"], "t97"),
 "K11": ("the 402(g) not-counted sentence never shown", S([("{_preTaxA.fromStored && _preTaxA.monthly > 0 && _yrsA > 0 && (", "{false && (")]), ["E-1", "E-2b"], "t97"),
 "K12": ("the Roth/bonus warning suppressed in stored mode", S([("              {_over402g.length > 0 && (", "              {_over402g.length > 0 && !_preTaxA.fromStored && (")]), ["E-2"], "t97"),
 "K13": ("METHODOLOGY's false employer-match sentence restored", [(METH, "## My Data keeps spouse A's stored pre-tax contribution (v6.34)",
        "There is no employer-match field beyond the existing bonus-deferral machinery.\n\n## My Data keeps spouse A's stored pre-tax contribution (v6.34)")], ["G-3"], "t97"),
 "K15": ("an edit of A's Roth marks the paycheck row edited", S([('onChange={e => setRothAMo(e.target.value)}', 'onChange={e => { setPaycheckEdited(true); setRothAMo(e.target.value); }}')]), ['F-4', 'D-10'], "t97"),
 "K16": ('the 402(g) check counts a breakdown the plan is not using', S([('const _electiveA = (_preTaxA.fromStored ? 0 : num(empContrib) * _periodsPerYear) + ', 'const _electiveA = (num(empContrib) * _periodsPerYear) + ')]), ['E-5'], "t97"),
 "K17": ('the bonus deferral dropped from the 402(g) check in stored mode', S([('num(rothAMo) * 12 + num(annualBonus) * (num(bonusDeferralPct) / 100);', 'num(rothAMo) * 12 + (_preTaxA.fromStored ? 0 : num(annualBonus) * (num(bonusDeferralPct) / 100));')]), ['E-2c'], "t97"),
 "K18": ('a saved zero paycheck row reopens as 0, 0, 0', S([('const [empContrib, setEmpContrib] = useState(_c.employeePer != null && !_zeroPayRow ? _c.employeePer : "");', 'const [empContrib, setEmpContrib] = useState(_c.employeePer != null ? _c.employeePer : "");')]), ['D-9', 'D-9b'], "t97"),
 "K19": ('Annual total from the rollup', S([('const annual401k = _preTaxA.fromStored ? _preTaxA.monthly * 12 : perPaycheckTotal * _periodsPerYear;', 'const annual401k = perPaycheckTotal * _periodsPerYear;')]), ['D-2'], "t97"),
 "K20": ('the both-figures sentence never shown', S([('            {_preTaxA.rollupDiffers\n              ? `This plan uses', '            {false\n              ? `This plan uses')]), ['B-2'], "t97"),
 "K21": ('Per-paycheck total shows $0 instead of —', S([('{_preTaxA.fromStored && !_preTaxA.rollupDiffers ? "—" : `$${Math.round(perPaycheckTotal).toLocaleString()}`}', '{`$${Math.round(perPaycheckTotal).toLocaleString()}`}')]), ['D-3'], "t97"),
 "K14": ("the Field Manual's v6.34 entry removed", S([("<li><strong>My Data keeps spouse A's stored pre-tax contribution (v6.34).</strong>", "<li><strong>My Data keeps the stored figure.</strong>")]), ["G-1", "G-1b"], "t97"),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = (SRC, METH)
ORIG = {p: open(p, "rb").read() for p in FILES}
WATCH = (SRC, METH, T97, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v634"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v634.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v634.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want, suite = M[label]
    script = {"t97": "t97_contrib_save.mjs"}[suite]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if open(SRC, "rb").read() != ORIG[SRC]: build()
        r = subprocess.run(["node", script, "v634"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(rf"{suite} SUITE \(v634\): (\d+) passed, (\d+) failed", out) or re.search(rf"{suite}[^\n]*?(\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for p in (METH,):
            if open(p, "rb").read() != ORIG[p]: open(p, "wb").write(ORIG[p])
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
