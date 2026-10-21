#!/usr/bin/env python3
"""controls_v626_ai_rules.py — negative controls for t89 (docs/SCOPE_D55_AI_GROUND_RULES_V626.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file;
a source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), t89 runs on
the v6.26 leg, then ./v626.jsx, ./METHODOLOGY.md, qa/app_v626.mjs and qa/dom_v626.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v625 -> v626 run folder:  python3 qa/tools/controls_v626_ai_rules.py [C1 ...]
    C1  the rules dropped from the Anthropic request (claude.ai and keyed) ............................. A-2, C-1, C-6
    C2  the rules dropped from a Local Model's request ............................................ A-2, C-4
    C3  the rules sent twice ......................................................................... B-1, B-4, C-1
    C4  the rules written into the stored plan summary (and so into a backup) ......................... A-5, B-3b, B-3c
    C5  the precedence line removed .................................................................. A-6
    C6  the live context's old "supersedes Section 2 balances" header ................................... D-1
    C7  the LTC sentence back ........................................................................ D-2
    C8  the pension's survivor option stated as fact again ............................................. D-3
    C9  a single household sent a spouse again ......................................................... D-4
    C10 the Ask AI tab's sentence not naming the rules ................................................. E-1
    C11 Field Manual §13's entry removed ............................................................... E-4
    C12 the cost sentence's old range .................................................................. E-6
    C13 METHODOLOGY §11 not listing the rules .......................................................... E-5
    C14 the Field Manual's master-prompt section not naming the rules .................................. E-2
    C15 §10's row for the rules removed ................................................................ E-3
    C16 a single household's pension given a survivor .................................................. D-4
    C17 the success rate's threshold dropped ........................................................... D-6
    C18 the Roth line's amount dropped ................................................................. D-7
    C0  unmutated .................................................................................. t89 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v626.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); T89 = os.path.join(QA, "t89_ai_ground_rules.mjs")
MOD = os.path.join(QA, "app_v626.mjs"); DOM = os.path.join(QA, "dom_v626.cjs")
for p in (SRC, METH, T89, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v626.jsx"), os.path.join(QA, "shim.txt")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v625 -> v626 run folder copy (missing {p})")
M = {
 "C0": ("unmutated", [], []),
 "C1": ("the rules dropped from the Anthropic request", [(SRC, 'system: aiSystemPrompt,', 'system: aiSystemPrompt.slice(AI_GROUND_RULES.length).replace(/^\\n\\n/, ""),')], ["A-2", "C-1", "C-6"]),
 "C2": ("the rules dropped from a Local Model's request", [(SRC, '{ role: "system", content: aiSystemPrompt }', '{ role: "system", content: aiSystemPrompt.slice(AI_GROUND_RULES.length) }')], ["A-2", "C-4"]),
 "C3": ("the rules sent twice", [(SRC, '${AI_GROUND_RULES}\\n\\n${MASTER_PROMPT ?', '${AI_GROUND_RULES}\\n\\n${AI_GROUND_RULES}\\n\\n${MASTER_PROMPT ?')], ["B-1", "B-4", "C-1"]),
 "C4": ("the rules written into the stored plan summary", [(SRC, '    return lines.join("\\n");\n  };\n\n  // ── v5.71', '    return AI_GROUND_RULES + "\\n\\n" + lines.join("\\n");\n  };\n\n  // ── v5.71')], ["A-5", "B-3b", "B-3c"]),
 "C5": ("the precedence line removed", [(SRC, '; they take precedence over anything below.', '.')], ["A-6"]),
 "C6": ("the old Section 2 header", [(SRC, '— supersedes any balances stated above', '— supersedes Section 2 balances')], ["D-1"]),
 "C7": ("the LTC sentence back", [(SRC, '= $${_aiTotalIncome.toLocaleString()}/mo. ${_aiRothYr', '= $${_aiTotalIncome.toLocaleString()}/mo. Hybrid LTC insurance per master prompt. ${_aiRothYr')], ["D-2"]),
 "C8": ("the pension's survivor option as fact", [(SRC, '(the model continues it in full to a survivor)', '(joint&survivor, full to survivor)')], ["D-3"]),
 "C9": ("a single household sent a spouse", [(SRC, 'const nameInfo = _aiSingle ?', 'const nameInfo = false ?')], ["D-4"]),
 "C10": ("the Ask AI tab's sentence not naming the rules", [(SRC, "the app's fixed ground rules (the same for everyone: educational only, no financial directives), ", "")], ["E-1"]),
 "C11": ("Field Manual §13's entry removed", [(SRC, 'Ask AI sends its ground rules with every plan (v6.26).', 'Ask AI (v6.26).')], ["E-4"]),
 "C12": ("the cost sentence's old range", [(SRC, 'roughly 600 to 1,500 tokens for a plan you entered yourself', 'roughly 1,000 to 5,000 tokens for a plan you entered yourself')], ["E-6"]),
 "C13": ("METHODOLOGY §11 not listing the rules", [(METH, "transmits — from v6.26, first — the\napp's fixed ground rules", "transmits the\napp's ground rules")], ["E-5"]),
 "C14": ("the Field Manual's master-prompt section not naming the rules", [(SRC, "Every question starts with the app\\u2019s fixed <strong>ground rules</strong> (v6.26)", "Every question starts with the app\\u2019s fixed rules (v6.26)")], ["E-2"]),
 "C15": ("§10's row for the rules removed", [(SRC, "<tr><td><strong>The app\\u2019s ground rules</strong></td><td>YES</td>", "<tr><td><strong>The app\\u2019s rules</strong></td><td>YES</td>")], ["E-3"]),
 "C16": ("a single household's pension given a survivor", [(SRC, '${_aiSingle ? "" : " (the model continues it in full to a survivor)"}', ' (the model continues it in full to a survivor)')], ["D-4"]),
 "C17": ("the success rate's threshold dropped", [(SRC, 'success (ends above $800K)=', 'success=')], ["D-6"]),
 "C18": ("the Roth line's amount dropped", [(SRC, ' at $${_aiRothYr.toLocaleString()}/yr (the Roth slider these results ran at)', '')], ["D-7"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-H]-\d+[a-z]?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
ORIG = {SRC: open(SRC, "rb").read(), METH: open(METH, "rb").read()}
WATCH = (SRC, METH, T89, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v626"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v626.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v626.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
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
        r = subprocess.run(["node", "t89_ai_ground_rules.mjs", "v626"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t89 SUITE \(v626\): (\d+) passed, (\d+) failed", out)
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
