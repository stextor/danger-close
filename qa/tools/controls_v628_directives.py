#!/usr/bin/env python3
"""controls_v628_directives.py — negative controls for t91 (docs/SCOPE_F23_F24_DIRECTIVES_V628.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t91 runs on
the v6.28 leg, then ./v628.jsx, ./METHODOLOGY.md, qa/t91_directives.mjs, qa/app_v628.mjs and qa/dom_v628.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v627 -> v628 run folder:  python3 qa/tools/controls_v628_directives.py [C1 ...]
    C1  a Guardrails band reads ACTION: again ..................................................... A-1, A-3, C-1b, C-1c
    C2  the Guardrails header says to boost Roth conversions again (V-2) ............................ A-1, C-1, C-1c
    C3  a guardrail figure typed as a literal that disagrees with GUARDRAILS ........................ C-1
    C4  the Grade weights printed as percents again (F-24) .......................................... B-1
    C5  lost points over 100 again (F-24) ............................................................ B-2
    C6  a fourth drag shown ............................................................................ B-3, B-3b
    C7  STATUS below a 4.0 ............................................................................... B-4
    C8  the v6.27 LTC pattern back in the shared test ................................................ D-7c, D-7d, B-8, B-8b
    C9  Income Floor's drag carries a dollar figure, and its evidence drops the streams sentence ...... B-6
    C10 a legal claim back in Estate Readiness's drag ................................................. B-7
    C11 the SS survivor card names spouse A on every couple again (V-12) .............................. C-4c
    C12 the SS tab's IRMAA sentence false again (V-1) ................................................. C-4
    C13 Priority 1's "Drawn first" year off by two .................................................... C-2b
    C14 the holdings card says Roth is drawn last again (V-9) ......................................... C-2d
    C15 Step 7 says the schedule cuts spending (V-5) ................................................... C-2e
    C16 a single plan told about a joint-and-survivor election ........................................ C-3c
    C17 the Exit Plan's pension directive back ........................................................ A-1, A-3, C-3, C-3b
    C18 the Events Roth item tells the household how to pay again .................................... A-1, C-12b
    C19 Field Manual §13's v6.28 entry removed ......................................................... F-4
    C20 METHODOLOGY §9 says the schedule applies the guardrails again ................................ F-5
    C21 the Field Manual's Guardrails entry disagrees with GUARDRAILS ................................. F-1
    C22 Engine D reads GUARDRAILS ........................................................................ D-3
    C23 a new directive sentence on a tab the lint reads (IRMAA) ...................................... A-3
    C24 the Roth tab's "ideal" back .................................................................... A-3, C-10
    C25 the holdings card counts Other-account Traditional again (build review #1) ................... C-13
    C26 the COBRA sentence unconditional again (build review #7) ...................................... C-13c
    C27 the Events legend says "go" again (build review #8) ........................................... A-1, C-13e
    C28 a single plan's SS filing event names a survivor (build review #5) ............................ C-13d
    C29 a catch-all allow-list entry hiding a planted directive (t91 itself mutated) ................... A-4b
    C0  unmutated .................................................................................. t91 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v628.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T91 = os.path.join(QA, "t91_directives.mjs")
MOD = os.path.join(QA, "app_v628.mjs"); DOM = os.path.join(QA, "dom_v628.cjs")
for p in (SRC, METH, T91, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v628.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v627 -> v628 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("a Guardrails band reads ACTION: again", [(SRC, '>MODEL: cuts monthly spending {Math.round(GUARDRAILS.cutPct * 100)}%</div>', '>ACTION: Cut next year spending by {Math.round(GUARDRAILS.cutPct * 100)}%</div>')],
        ["A-1", "A-3", "C-1b", "C-1c"]),
 "C2": ("the Guardrails header boosts Roth again", [(SRC, "each change compounding on the last. No engine changes a Roth conversion here.", "each change compounding on the last. Above the upper band, boost Roth conversions.")],
        ["A-1", "C-1", "C-1c"]),
 "C3": ("a guardrail figure typed as a literal", [(SRC, "of plan it cuts monthly spending {Math.round(GUARDRAILS.cutPct * 100)}%; above", "of plan it cuts monthly spending 15%; above")], ["C-1"]),
 "C4": ("Grade weights as percents again", [(SRC, ">Weight: {c.weight} of {_wSum}</span>", ">Weight: {c.weight}%</span>")], ["B-1"]),
 "C5": ("lost points over 100 again", [(SRC, "lossPts: (4.0 - c.gpa) * c.weight / _wSum }))", "lossPts: (4.0 - c.gpa) * c.weight / 100 }))")], ["B-2"]),
 "C6": ("a fourth drag shown", [(SRC, "                  .slice(0, 3);", "                  .slice(0, 4);")], ["B-3", "B-3b"]),
 "C7": ("STATUS below a 4.0", [(SRC, '{c.gpa >= 4.0 ? "STATUS: " : "DRAG: "}', '{c.gpa >= 3.0 ? "STATUS: " : "DRAG: "}')], ["B-4"]),
 "C8": ("the v6.27 LTC pattern back", [(SRC, r'const isLTCLabel = (label) => /\bltc|long[\s\-\u2013\u2014]?term[\s\-\u2013\u2014]?care/i.test(label || "");', 'const isLTCLabel = (label) => /ltc|long.?term/i.test(label || "");')],
        ["D-7c", "D-7d", "B-8", "B-8b"]),
 "C9": ("Income Floor's drag carries a dollar figure", [(SRC, "Social Security; the Income tab's gap card shows the portfolio draw.`", "Social Security, a ~$${Math.round(m * 6.5)}K portfolio draw.`"),
                                                      (SRC, "Income streams are not counted here", "Streams included")], ["B-6"]),
 "C10": ("a legal claim back in Estate Readiness", [(SRC, ". The grade weights survivor-critical items 70% and the rest 30%.`", ". Without a financial/medical POA, an incapacity forces a court guardianship.`")], ["B-7"]),
 "C11": ("the survivor card names A on every couple", [(SRC, "const _hi = _fB > _fA ? nB : nA, _lo = _fB > _fA ? nA : nB;", "const _hi = nA, _lo = nB;")], ["C-4c"]),
 "C12": ("the SS tab's IRMAA sentence false again", [(SRC, "IRMAA: taxable Social Security is part of MAGI, so", "IRMAA: Social Security is not part of MAGI, so")], ["C-4"]),
 "C13": ("Drawn first off by two", [(SRC, "return `reaches $0 in ${schedule[_zi].yr}", "return `reaches $0 in ${schedule[_zi].yr + 2}")], ["C-2b"]),
 "C14": ("Roth drawn last again", [(SRC, "<strong>Traditional and Roth money is drawn in proportion within each sleeve</strong>", "<strong>Traditional money is drawn first and Roth last</strong>")], ["C-2d"]),
 "C15": ("Step 7 says the schedule cuts spending", [(SRC, "</span> Guardrails: this schedule applies none; the Monte Carlo cuts", "</span> Guardrails: this schedule cuts spending at the lower band, as the Monte Carlo cuts")], ["C-2e"]),
 "C16": ("a single plan told about joint-and-survivor", [(SRC, "...(pension && !single ? [\"The pension's payout election", "...(pension ? [\"The pension's payout election")], ["C-3c"]),
 "C17": ("the Exit Plan's pension directive back", [(SRC, "\"The pension's payout election is made in writing with the plan administrator. The model assumes a joint-and-survivor option that continues the pension in full to a survivor.\"",
                                                   "\"Elect the pension's joint-and-survivor option in writing with the plan administrator.\"")], ["A-1", "A-3", "C-3", "C-3b"]),
 "C18": ("the Events Roth item says how to pay again", [(SRC, "Whether to convert, and how much, is your choice;", "Pay the tax from the taxable account. Whether to convert, and how much, is your choice;")], ["A-1", "C-12b"]),
 "C19": ("§13's v6.28 entry removed", [(SRC, "<li><strong>The app describes the model, it does not direct (v6.28).</strong>", "<li><strong>The app describes the model, it does not direct.</strong>")], ["F-4"]),
 "C20": ("METHODOLOGY §9 applies the guardrails again", [(METH, "and it applies **no\nguardrails**.", "and it applies the\nguardrails.")], ["F-5"]),
 "C21": ("the Field Manual's Guardrails entry disagrees", [(SRC, "above the upper band (120%) it raises it 5%", "above the upper band (120%) it raises it 10%")], ["F-1"]),
 "C22": ("Engine D reads GUARDRAILS", [(SRC, "function computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset }) {", "function computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset }) {\n  const _grX = GUARDRAILS.cutPct;")], ["D-3"]),
 "C23": ("a new directive on the IRMAA tab", [(SRC, "The Roth slider sets the conversion amount in the MAGI of each conversion year", "Consider smaller conversions near a cliff. The Roth slider sets the conversion amount in the MAGI of each conversion year")], ["A-3"]),
 "C25": ("the holdings card counts Other-account Traditional again", [(SRC, "${(_posTradW / 1000).toFixed(0)}K</span>; Roth:", "${(_tradInit / 1000).toFixed(0)}K</span>; Roth:")], ["C-13"]),
 "C26": ("the COBRA sentence unconditional again", [(SRC, "COBRA lasts up to 18 months, which can span this gap", "COBRA lasts at most 18 months, so it cannot span this gap alone")], ["C-13c"]),
 "C27": ("the Events legend says go again", [(SRC, "■ GREEN — window open (for a Roth conversion, a deadline only if you are converting that year)</span>", "■ GREEN — window open: go</span>")], ["A-1", "C-13e"]),
 "C28": ("a single plan's SS event names a survivor", [(SRC, "pays${tl.single ? \"\" : \", and what a survivor keeps\"}.", "pays you and a survivor.")], ["C-13d"]),
 "C29": ("a catch-all allow-list entry hides a planted directive", [(SRC, "The Roth slider sets the conversion amount in the MAGI of each conversion year", "Consider smaller conversions near a cliff. The Roth slider sets the conversion amount in the MAGI of each conversion year"),
        (T91, '  [/^my data$/, /^Don\'t enter income', '  [/^irmaa$/, /./, "planted"],\n  [/^my data$/, /^Don\'t enter income')], ["A-4b"]),
 "C24": ("the Roth tab's ideal back", [(SRC, "Conversion amount: the slider, ${Math.round(rothAmount / 1000)}K/yr<br/>", "Conversion amount (ideal): the slider, ${Math.round(rothAmount / 1000)}K/yr<br/>")], ["A-3", "C-10"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {p: open(p, "rb").read() for p in (SRC, METH, T91)}
WATCH = (SRC, METH, T91, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v628"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v628.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v628.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x in {os.path.basename(path)} (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if texts[SRC].encode("utf-8") != ORIG[SRC]: build()
        r = subprocess.run(["node", "t91_directives.mjs", "v628"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t91 SUITE \(v628\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {(out + r.stderr.decode('utf-8','replace'))[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        rebuild = open(SRC, "rb").read() != ORIG[SRC]
        for path in ORIG:
            if open(path, "rb").read() != ORIG[path]: open(path, "wb").write(ORIG[path])
        if rebuild: build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
