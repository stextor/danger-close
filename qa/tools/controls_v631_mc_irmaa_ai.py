#!/usr/bin/env python3
"""controls_v631_mc_irmaa_ai.py — negative controls for t94 (docs/SCOPE_D51_AI6_V631.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t94 runs on
the v6.31 leg, then ./v631.jsx, ./METHODOLOGY.md, qa/app_v631.mjs and qa/dom_v631.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v630 -> v631 run folder:  python3 qa/tools/controls_v631_mc_irmaa_ai.py [C1 ...]
    C1  the surcharge dropped from the schedule's total ...................................... A-3, B-1, C-2
    C2  the surcharge charged in the MAGI year, not the premium year .......................... A-2, A-4, B-2
    C3  the surcharge not restated in today's dollars (surchargeAnnual) ....................... A-2, A-8, B-4
    C4  premium years after the horizon kept in the IRMAA part ................................ A-2, A-4
    C5  the tail without its surcharge (New York ×3) .......................................... A-5
    C6  What Breaks without Engine A's IRMAA .................................................. D-4
    C7  the old model string ................................................................... E-3, E-6, F-1, F-10
    C8  effort removed (it would run at high) .................................................. E-4, F-1, F-10
    C9  a thinking field sent .................................................................. E-5, F-1, F-10
    C10 a refusal read as no response .......................................................... F-4, F-5
    C11 a declined exchange re-sent in the conversation memory (the memory filter) .............. F-6
    C19 the declined question kept in the memory ................................................ F-6
    C20 What Breaks' disclosure that its IRMAA can differ from the IRMAA tab's removed ........... D-5
    C21 the conversation-growth figure back to 15 to 25 cents ..................................... G-13
    C12 a thinking block's text shown ........................................................... F-2
    C13 the timeout back to 120 seconds ......................................................... E-7, F-7
    C14 the Income card's IRMAA line dropped .................................................... G-1
    C15 the IRMAA tab's false "err high" sentence back ........................................... G-3
    C16 the Field Manual's Monte Carlo IRMAA sentence removed .................................... G-10
    C17 the cost note's old figure ............................................................. G-4, G-5
    C18 METHODOLOGY's v6.31 section heading changed ............................................... G-12
    C0  unmutated ............................................................................... t94 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v631.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T94 = os.path.join(QA, "t94_mc_irmaa_ai.mjs")
MOD = os.path.join(QA, "app_v631.mjs"); DOM = os.path.join(QA, "dom_v631.cjs")
for p in (SRC, METH, T94, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v631.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v630 -> v631 run folder copy (missing {p})")
LINE = 'if (r.surchargeToday > 0 && r.irmaaYr in taxByYr) irmaaByYr[r.irmaaYr] = (irmaaByYr[r.irmaaYr] || 0) + r.surchargeToday;'
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the surcharge dropped from the schedule's total", [(SRC, 'for (const y in taxByYr) byYr[y] = taxByYr[y] + (irmaaByYr[y] || 0);', 'for (const y in taxByYr) byYr[y] = taxByYr[y];')], ["A-3", "B-1", "C-2"]),
 "C2": ("the surcharge charged in the MAGI year", [(SRC, LINE, 'if (r.surchargeToday > 0 && r.yr in taxByYr) irmaaByYr[r.yr] = (irmaaByYr[r.yr] || 0) + r.surchargeToday;')], ["A-2", "A-4", "B-2"]),
 "C3": ("the surcharge not restated in today's dollars", [(SRC, LINE, LINE.replace("+ r.surchargeToday;", "+ r.surchargeAnnual;"))], ["A-2", "A-8", "B-4"]),
 "C4": ("premium years after the horizon kept", [(SRC, LINE, LINE.replace(" && r.irmaaYr in taxByYr", ""))], ["A-2", "A-4"]),
 "C5": ("the tail without its surcharge", [(SRC, 'const s = mcTaxScheduleOf(byYr);', 'const s = mcTaxScheduleOf(byYr); s.last = taxByYr[s.lastYr];')], ["A-5"]),
 "C6": ("What Breaks without Engine A's IRMAA", [(SRC, 'estAnnualTax = (_cT.totTaxToday + (Number.isFinite(_cT.totIrmaaToday) ? _cT.totIrmaaToday : 0)) / planYears;', 'estAnnualTax = _cT.totTaxToday / planYears;')], ["D-4"]),
 "C7": ("the old model string", [(SRC, 'const AI_MODEL = "claude-opus-4-8";', 'const AI_MODEL = "claude-sonnet-4-6";')], ["E-3", "E-6", "F-1", "F-10"]),
 "C8": ("effort removed", [(SRC, '            output_config: { effort: AI_EFFORT },\n', '')], ["E-4", "F-1", "F-10"]),
 "C9": ("a thinking field sent", [(SRC, 'output_config: { effort: AI_EFFORT },', 'output_config: { effort: AI_EFFORT }, thinking: { type: "adaptive" },')], ["E-5", "F-1", "F-10"]),
 "C10": ("a refusal read as no response", [(SRC, 'const _refused = !_useLocal && data.stop_reason === "refusal";', 'const _refused = false;')], ["F-4", "F-5"]),
 "C11": ("a declined exchange re-sent in the memory", [(SRC, 'const _hist = aiThread.filter(m => !m.err && !m.noMem)', 'const _hist = aiThread.filter(m => !m.err)')], ["F-6"]),
 "C19": ("the declined question kept in the memory", [(SRC, 'u[j] = { ...u[j], noMem: true }; break;', 'break;')], ["F-6"]),
 "C20": ("What Breaks' D-66 disclosure removed", [(SRC, "; that engine projects its own income, so on some plans its IRMAA differs from the IRMAA tab's), claim-month-accurate", "), claim-month-accurate")], ["D-5"]),
 "C21": ("the conversation-growth figure back to 15 to 25 cents", [(SRC, "six full-length answers re-sent as input add about 12 cents a question at most", "a long conversation can add 15 to 25 cents a question")], ["G-13"]),
 "C12": ("a thinking block's text shown", [(SRC, '.filter(c => c && c.type === "text").map(c => c.text || "")', '.map(c => c.text || c.thinking || "")')], ["F-2"]),
 "C13": ("the timeout back to 120 seconds", [(SRC, 'const AI_TIMEOUT_MS = 180000;', 'const AI_TIMEOUT_MS = 120000;')], ["E-7", "F-7"]),
 "C14": ("the Income card's IRMAA line dropped", [(SRC, '{_t1 != null && _iy.length > 0 && <div data-dc-mc-irmaa-card', '{false && <div data-dc-mc-irmaa-card')], ["G-1"]),
 "C15": ("the IRMAA tab's false sentence back", [(SRC, 'if your working income was above a tier, the model reads low for them.', 'The model charges every surcharge in full, so these years err high.')], ["G-3"]),
 "C16": ("the Field Manual's Monte Carlo IRMAA sentence removed", [(SRC, 'From v6.31 each run also pays the IRMAA tab’s Medicare surcharges (IRMAA), each in the year Medicare bills it', 'From v6.31 the IRMAA tab is beside it')], ["G-10"]),
 "C17": ("the cost note's old figure", [(SRC, 'a first question costs <strong>about 3 to 10 cents</strong>', 'a first question costs <strong>about one to five cents</strong>')], ["G-4", "G-5"]),
 "C18": ("METHODOLOGY's v6.31 heading changed", [(METH, '## The Monte Carlo pays IRMAA (v6.31)', '## IRMAA in the Monte Carlo (v6.31)')], ["G-12"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {SRC: open(SRC, "rb").read(), METH: open(METH, "rb").read()}
WATCH = (SRC, METH, T94, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v631"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v631.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v631.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if open(SRC, "rb").read() != ORIG[SRC]: build()
        r = subprocess.run(["node", "t94_mc_irmaa_ai.mjs", "v631"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t94 SUITE \(v631\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(METH, "rb").read() != ORIG[METH]: open(METH, "wb").write(ORIG[METH])
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
