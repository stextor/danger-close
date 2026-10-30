#!/usr/bin/env python3
"""controls_v639_ai_context.py — negative controls for t103 (docs/SCOPE_D69_AI_CONTEXT_V639.md §4). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red.
  Each control mutates ./v639.jsx (each target occurs exactly once), rebuilds qa/app_v639.mjs and qa/dom_v639.cjs as mk_runfolder.sh builds
  them, runs t103 on the v639 leg, then RESTORES the three files and hash-checks them.
Run from the ROOT of a COPY of a v638 -> v639 run folder:  python3 qa/tools/controls_v639_ai_context.py [K1 ...]
  what Ask AI is told (DA-1 to DA-3)
    K1  an HSA reported as taxable money ........................................................... C-1, B-4, D-1
    K2  the HSA contribution left out .............................................................. C-1b, B-4, D-1
    K3  each person's Roth left out ................................................................ C-1c, B-4
    K15 a single plan's row stored under spouse B reported as spouse B's ............................... C-5d
  the completeness extinction (§B)
    K4  a field added to what My Data saves, neither sent nor excluded ............................... B-2
    K5  a field added to each Other-accounts row, neither sent nor excluded .......................... B-2
  found by the build review (Steve: "Fix 1–6, file the RMD one")
    K10 an ACA household size of 0 printed as 0 .................................................... C-5f
    K11 a holding with no Traditional/Roth split described as untyped, not as taxable money ........... C-5c
    K12 the HSA contribution labelled the household's, with no end ................................... C-1b
    K16 the live context calls the retirement total a "401k subtotal" ................................. A-4
  the source (§A)
    K6  the ground rules' old "if something you need is missing, say so" ............................. A-5
    K8  "401(k) contribs" restored ................................................................... A-4
    K9  the helper reads the PORTFOLIO global ........................................................ A-2
  the copy (§E, DA-5)
    K7  My Data's list loses its new clause ........................................................... E-2
    K13 §13's v6.39 note removed ..................................................................... E-4
    K14 the Field Manual §09 table's new rows removed ................................................. E-3b
    C0  unmutated .................................................................................... t103 passes
  NOT controlled here: whether a model obeys the reworded rule (no test can show it); §F's engine comparison (no control here touches an engine).
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v639.jsx"); MOD = os.path.join(QA, "app_v639.mjs"); DOM = os.path.join(QA, "dom_v639.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t103_ai_context.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v639.jsx"),
          os.path.join(QA, "app_v638.mjs"), os.path.join(ROOT, "v638.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a COPY of a v638 -> v639 run folder (missing {p})")
ORIG = open(SRC, encoding="utf-8").read()
M = {
 "C0": ("unmutated", [], ["-"]),
 "K1": ("an HSA reported as taxable money", [('const tt = LBL[a.taxType] ? a.taxType : "taxable";', 'const tt = LBL[a.taxType] && a.taxType !== "hsa" ? a.taxType : "taxable";')], ["C-1", "B-4", "D-1"]),
 "K2": ("the HSA contribution left out", [('; HSA ${$(hsa)} (until ${nameA} retires).${bonusTxt}`;', '.${bonusTxt}`;')], ["C-1b", "B-4", "D-1"]),
 "K3": ("each person's Roth left out", [(', Roth ${$(h.roth)}${h.none >= 1', '${h.none >= 1')], ["C-1c", "B-4"]),
 "K4": ("a saved field neither sent nor excluded", [("      taxableGainPct: Math.max(0, Math.min(95, num(taxableGainPct) || 0)),", "      taxableGainPct: Math.max(0, Math.min(95, num(taxableGainPct) || 0)),\n      ctlNewField: 1,")], ["B-2"]),
 "K5": ("an Other-accounts row field neither sent nor excluded", [('return { name: relabel(o.name) || "Account", balance: num(o.balance), owner, taxType,', 'return { name: relabel(o.name) || "Account", ctlNote: 1, balance: num(o.balance), owner, taxType,')], ["B-2"]),
 "K6": ("the ground rules' old sentence", [("Do not invent balances, rates or tax amounts. If something you need is not in what you\n  were sent, say that it was not sent and ask for it; do not conclude that the plan lacks it. Show your arithmetic\n  and state your assumptions.",
                                           "Do not invent balances, rates or tax amounts; if something you need is missing, say so.\n  Show your arithmetic and state your assumptions.")], ["A-5"]),
 "K7": ("My Data's list loses its new clause", [("monthly spending, each contribution, the bonus and its deferral and match, each salary, the taxable gain share, the ACA bridge premium and household size,", "monthly spending and contributions,")], ["E-2"]),
 "K8": ('"401(k) contribs" restored', [(" Income in retirement: ${_aiSingle ?", " 401(k) contribs $${PORTFOLIO.contributions.monthly401k}/mo. Income in retirement: ${_aiSingle ?")], ["A-4"]),
 "K9": ("the helper reads the PORTFOLIO global", [("function aiPlanFacts(P, nA, nB, single) {\n  P = P || {};", "function aiPlanFacts(P, nA, nB, single) {\n  P = P || PORTFOLIO;")], ["A-2"]),
 "K10": ("an ACA household size of 0 printed as 0", [("acaHh = Math.max(1, acaSz || (single ? 1 : 2));", "acaHh = acaSz;")], ["C-5f"]),
 "K11": ("a holding with no split described as untyped", [(", with no Traditional/Roth split ${$(h.none)} (the model treats it as taxable money)", ", no tax type recorded ${$(h.none)}")], ["C-5c"]),
 "K12": ("the HSA contribution labelled the household's", [('; HSA ${$(hsa)} (until ${nameA} retires).', '; HSA ${$(hsa)} (household).')], ["C-1b"]),
 "K13": ("§13's v6.39 note removed", [("<li><strong>Ask AI is told what accounts you hold (v6.39).</strong>", "<li><strong>(removed)</strong>")], ["E-4"]),
 "K14": ("the Field Manual §09 table's new rows removed", [("; from v6.39 each account type (Traditional by plan type, Roth, HSA, taxable, annuity) totalled by owner, never by name</td></tr>", "</td></tr>")], ["E-3b"]),
 "K15": ("a single plan's spouse-B row reported as spouse B's", [('const ind = o => (single || o !== "B") ? "A" : "B";', 'const ind = o => (o !== "B") ? "A" : "B";')], ["C-5d"]),
 "K16": ('the live context says "401k subtotal"', [("const _bucketSnapshot = `Retirement holdings $${", "const _bucketSnapshot = `401k subtotal $${")], ["A-4"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Za-z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
WATCH = (SRC, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v639"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v639.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v639.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def ids(out): return [cid(l) or l.strip()[:60] for l in out.splitlines() if l.startswith("  ✗ ")]
def run_src(label):
    desc, pairs, want = M[label]
    try:
        if pairs:
            text = ORIG
            for old, new in pairs:
                if text.count(old) != 1: return f"{label} TARGET occurs {text.count(old)}x (must be 1) — control INVALID"
                text = text.replace(old, new)
            open(SRC, "w", encoding="utf-8").write(text); build()
        r = subprocess.run(["node", "t103_ai_context.mjs", "v639"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); tally = re.search(r"t103 SUITE \(v639\): (\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8', 'replace')[-300:]}"
        red = ids(out); miss = [w for w in want if w not in red]; extra = sorted(set(red) - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(red)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, encoding="utf-8").read() != ORIG:
            open(SRC, "w", encoding="utf-8").write(ORIG); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run_src(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
