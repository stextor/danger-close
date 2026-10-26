#!/usr/bin/env python3
"""controls_v632_f26_d61.py — negative controls for t95 (and t29's two new census rows) (docs/SCOPE_F26_D61_V632.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), the named suite
runs on the v6.32 leg, then ./v632.jsx, ./README.md, ./METHODOLOGY.md, qa/tools/boundaries.mjs, qa/app_v632.mjs and qa/dom_v632.cjs are
RESTORED and hash-checked.
Run from the ROOT of a COPY of a v631 -> v632 run folder:  python3 qa/tools/controls_v632_f26_d61.py [C1 ...]
    C1  Engine B's v6.31 eligibility (the older age in widowed years; both in the death year) ...... A-1, A-3, A-6, A-7, A-8, A-10
    C2  Engine C's v6.31 eligibility (both spouses for the whole horizon) .......................... A-2, A-3, A-5, A-10
    C3  the death year counted twice (both engines switch at the year AFTER the death) ............. A-1, A-2, A-6, A-7
    C4  the survivor's age replaced by the older age (both engines) ................................ A-1, A-2, A-7, A-10
    C5  "Combined shock … over 4–10 years" back on the LTC card .................................... B-1, B-5
    C6  the survivor check back to spouse A's ........................................................ B-9
    C7  the years alone without the B-first branch (A assumed to die first) ......................... S-2, B-7
    C8  a single plan's LTC card worded for a couple ................................................. B-5
    C9  a single plan's early-death card back on the couple wording .................................. B-7
    C10 the "Tech −40%" header back .................................................................. B-1, B-3
    C11 the SS tab's CLAIM 62 cell back on spouse A's benefit alone .................................. B2-1
    C12 the Roth ladder back on the target year (seed of the table) .................................. C-1, C-4
    C13 the Roth tab's RMD cards back on the target year ............................................. C-2
    C14 Ask AI's conversion years back on the target year ............................................ C-3, G-13
    C15 the Backtest's worst start back to the strict-< tie-break .................................... D-3
    C16 the Backtest's "generally considered the worst" sentence typed again ......................... D-4
    C17 the ACA dates printed for every coverage year ................................................ E-2
    C18 a typed check count back in the README ....................................................... F-1, F-2
    C19 `npm install` back in the README ............................................................. F-3
    C20 the Taxes tab's survivor clause removed ...................................................... G-8, G-14
    C21 the Field Manual's single-plan Stress sentence removed ......................................... G-3
    C22 METHODOLOGY's v6.32 section heading changed .................................................. G-11
    C23 the census's qcd_survivor row reads ON below 71 (t29) ........................................ C-d61-1
    C24 "must sustain for 20+ years alone" back on the early-death card ............................... B-1, B-7
    C25 the survivor sentence printed when no one is alone (the tie) .................................. B-8
    C26 "after the run" read from the calendar year, not the quarter .................................. S-3
    C27 the Roth RMD cards read the last ladder row before the ladder starts (review) ................. C-6
    C28 "Gompertz survival modeling" back in the README ............................................... F-1
    C0  unmutated .................................................................................... t95 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v632.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); README = os.path.join(ROOT, "README.md")
BND = os.path.join(QA, "tools", "boundaries.mjs"); T95 = os.path.join(QA, "t95_f26_d61.mjs"); T29 = os.path.join(QA, "t29_boundaries.mjs")
MOD = os.path.join(QA, "app_v632.mjs"); DOM = os.path.join(QA, "dom_v632.cjs")
for p in (SRC, METH, README, BND, T95, T29, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v632.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v631 -> v632 run folder copy (missing {p})")
NEWB = "const _qcdPersons = _single ? (ageA >= 71 ? 1 : 0) : widowed ? ((_survivorIsA ? ageA : ageB) >= 71 ? 1 : 0) : ((ageA >= 71 ? 1 : 0) + (ageB >= 71 ? 1 : 0));"
NEWC = "const _qcdPersonsI = _singleI ? (ageA >= 71 ? 1 : 0) : widowed ? ((_survivorIsA ? ageA : ageB) >= 71 ? 1 : 0) : ((ageA >= 71 ? 1 : 0) + (ageB >= 71 ? 1 : 0));"
WORST_NEW = """          const _depleted = sweepBucket.filter(s => !s.survived);
          const worstSeq = _depleted.length
            ? _depleted.reduce((w, s) => (s.failedYear < w.failedYear ? s : w), _depleted[0])
            : sweepBucket.reduce((w, s) => (s.endReal < w.endReal ? s : w), sweepBucket[0]);"""
WORST_OLD = "          const worstSeq = sweepBucket.reduce((w, s) => (s.endReal < w.endReal ? s : w), sweepBucket[0]);"
M = {
 "C0": ("unmutated", [], [], "t95"),
 "C1": ("Engine B's v6.31 eligibility", [(SRC, NEWB, "const _qcdPersons = effSingle ? (Math.max(ageA, ageB) >= 71 ? 1 : 0) : ((ageA >= 71 ? 1 : 0) + (ageB >= 71 ? 1 : 0));")], ["A-1", "A-3", "A-6", "A-7", "A-8", "A-10"], "t95"),
 "C2": ("Engine C's v6.31 eligibility", [(SRC, NEWC, "const _qcdPersonsI = _singleI ? (ageA >= 71 ? 1 : 0) : ((ageA >= 71 ? 1 : 0) + (ageB >= 71 ? 1 : 0));")], ["A-2", "A-3", "A-5", "A-10"], "t95"),
 "C3": ("the death year counted twice", [(SRC, NEWB, NEWB.replace("widowed ?", "filingSingle ?")), (SRC, NEWC, NEWC.replace("widowed ?", "filingSingleI ?"))], ["A-1", "A-2", "A-6", "A-7"], "t95"),
 "C4": ("the survivor's age replaced by the older age", [(SRC, NEWB, NEWB.replace("(_survivorIsA ? ageA : ageB)", "Math.max(ageA, ageB)")), (SRC, NEWC, NEWC.replace("(_survivorIsA ? ageA : ageB)", "Math.max(ageA, ageB)"))], ["A-1", "A-2", "A-7", "A-10"], "t95"),
 "C5": ("Combined shock back on the LTC card", [(SRC, '{L.B ? "One care cost per person, each charged once" : "One care cost, charged once"}', 'Combined shock: $300K–$600K over 4–10 years. {L.B ? "One care cost per person, each charged once" : "One care cost, charged once"}')], ["B-1", "B-5"], "t95"),
 "C6": ("the survivor check back to spouse A's", [(SRC, "const _ss = Math.max(getSSA(), getSSB()), _pen = getPension();", "const _ss = getSSA(), _pen = getPension();")], ["B-9"], "t95"),
 "C7": ("the years alone without the B-first branch", [(SRC, "const from = Math.max(dFirst, start), to = Math.min(dSecond, whole + 1);", "const from = Math.max(dA, start), to = Math.min(dB, whole + 1);")], ["S-2", "B-7"], "t95"),
 "C8": ("a single plan's LTC card worded for a couple", [(SRC, '{L.B ? "One care cost per person, each charged once" : "One care cost, charged once"}', '{"One care cost per person, each charged once"}')], ["B-5"], "t95"),
 "C9": ("a single plan's early-death card back on the couple wording", [(SRC, "if (E.single) return <><span", "if (false) return <><span")], ["B-7"], "t95"),
 "C10": ("the Tech −40% header back", [(SRC, 'sub: `US ${_pc(SCENARIOS.crisis.equity)}, intl ${_pc(SCENARIOS.crisis.intl)}, Yr 1`', 'sub: "Tech −40%, Yr 1"')], ["B-1", "B-3"], "t95"),
 "C11": ("the CLAIM 62 cell back on spouse A's benefit alone", [(SRC, 'survivor: Math.max(ssBenefit(spouseAFRA, -60), selectedSpouseB.benefit)', 'survivor: ssBenefit(spouseAFRA, -60)')], ["B2-1"], "t95"),
 "C12": ("the Roth ladder back on the target year", [(SRC, "const _ladderStart = retireYear;", "const _ladderStart = _tlRoth.rothLadderStart;")], ["C-1", "C-4"], "t95"),
 "C13": ("the RMD cards back on the target year", [(SRC, "const _rsbC = retireStartBalances(retireYear);", "const _rsbC = retireStartBalances(tl.rothLadderStart);"),
          (SRC, "const _rbC0 = planDollarFactor(retireYear, tl.asOfYear);", "const _rbC0 = planDollarFactor(tl.rothLadderStart, tl.asOfYear);"),
          (SRC, "const yrs = Math.max(0, yr - retireYear);", "const yrs = Math.max(0, yr - tl.rothLadderStart);")], ["C-2"], "t95"),
 "C14": ("Ask AI's conversion years back on the target year", [(SRC, "`Roth conversions ${retireYear}-${_aiTL.rothLadderEnd} at", "`Roth conversions ${_aiTL.rothLadderStart}-${_aiTL.rothLadderEnd} at")], ["C-3", "G-13"], "t95"),
 "C15": ("the worst start back to the strict-< tie-break", [(SRC, WORST_NEW, WORST_OLD)], ["D-3"], "t95"),
 "C16": ("the generally-considered sentence typed again", [(SRC, "Start years remembered for hard markets, with 1982 for contrast, replayed on this plan.", "1966 is generally considered the worst real start year in US history.")], ["D-4"], "t95"),
 "C17": ("the ACA dates for every coverage year", [(SRC, 'when = cy === ACA_OE_CHECKED.coverageYear ?', 'when = true ?')], ["E-2"], "t95"),
 "C18": ("a typed check count back in the README", [(README, "has the current count and how to run it", "has all 562 checks and how to run them")], ["F-1", "F-2"], "t95"),
 "C19": ("npm install back in the README", [(README, "npm ci             # install the exact dependency tree", "npm install        # install the exact dependency tree")], ["F-3"], "t95"),
 "C20": ("the Taxes tab's survivor clause removed", [(SRC, "{!_single && <>; from the year of the first projected death ({_deathYr1}) only the survivor may give, from the year the survivor turns 71, with one person's cap</>}", "")], ["G-8", "G-14"], "t95"),
 "C21": ("the Field Manual's single-plan Stress sentence removed", [(SRC, " For a single plan the care cards charge one person, and the early-death case ends the run at that death, holding what is left.", "")], ["G-3"], "t95"),
 "C22": ("METHODOLOGY's v6.32 heading changed", [(METH, "## QCDs after a death (v6.32)", "## A survivor's QCDs (v6.32)")], ["G-11"], "t95"),
 "C24": ("20+ years alone back", [(SRC, ": `${nB} is alone from ${E.dA} until ${_until}: ${_yrs(E.alone)} in this 30-year run.`;", ": `${nB} must sustain for 20+ years alone.`;")], ["B-1", "B-7"], "t95"),
 "C25": ("the survivor sentence printed with no one alone", [(SRC, '{E.alone > 0 ? "The survivor keeps the larger of the two claimed Social Security benefits, and the run includes" : "The run includes"}', '{"The survivor keeps the larger of the two claimed Social Security benefits, and the run includes"}')], ["B-8"], "t95"),
 "C26": ("after the run read from the calendar year", [(SRC, ': qJ >= years * 4 ? "afterRun" : "beforeStart";', ': yr > runEnd(years) ? "afterRun" : "beforeStart";')], ["S-3"], "t95"),
 "C27": ("the RMD cards read the last row before the ladder starts", [(SRC, "if (!lastRow || yr - 1 < rows[0].year) return t0[who] * Math.pow(", "if (!lastRow) return t0[who] * Math.pow(")], ["C-6"], "t95"),
 "C28": ("Gompertz survival modeling back in the README", [(README, "deaths at the ages you enter by default", "Gompertz survival modeling; deaths at the ages you enter by default")], ["F-1"], "t95"),
 "C23": ("the census's qcd_survivor row reads ON below 71", [(BND, '"under 71 in the death year", _age >= 71,', '"under 71 in the death year", _age >= 60,')], ["C-d61-1"], "t29"),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = (SRC, METH, README, BND)
ORIG = {p: open(p, "rb").read() for p in FILES}
WATCH = (SRC, METH, README, BND, T95, T29, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v632"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v632.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v632.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want, suite = M[label]
    script = {"t95": "t95_f26_d61.mjs", "t29": "t29_boundaries.mjs"}[suite]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if open(SRC, "rb").read() != ORIG[SRC]: build()
        r = subprocess.run(["node", script, "v632"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(rf"{suite} SUITE \(v632\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for p in (METH, README, BND):
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
