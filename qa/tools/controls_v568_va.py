#!/usr/bin/env python3
"""Negative controls for v5.68 — Virginia's age deduction, and the t29 F-6a/F-6b repair.

usage:  python3 qa/tools/controls_v568_va.py <run-folder>
        <run-folder> is the flat folder qa/mk_runfolder.sh builds, with v568.jsx at its root.

DRIFT-SAFE BY CONSTRUCTION (the controls_v566_nm.py rule). Nothing in <run-folder> is ever
edited: each control copies the folder to a scratch directory (node_modules symlinked, not
copied), applies ONE mutation to the copy, rebuilds the v568 leg THERE, and runs the suites
THERE. A mid-run death leaves only a scratch directory. md5s of every canonical input a control
mutates are printed before and after.

EVERY CONTROL STATES ITS EXPECTED OUTCOME. `fire` controls list needles that must appear on a
failing-assertion line; `silent` controls must produce no failing line in the suites they run.
A control whose expectation is not met is a FINDING and the script exits non-zero. An anchor
that does not match is a FINDING, never a skip — a mutation that silently did not apply reads
exactly like a control that fired and was fixed.

⚠ WHY T5 EXPECTS SILENCE. It restores F-6a/F-6b's v5.67 form (the truthiness helper written
as though it compared) and applies T1's interior mutation. It must stay GREEN: that is the
defect OPERATIONS §D2 recorded, reproduced on purpose, so the record shows the repair — not a
coincidence of data — is what makes T1 fire.

⚠ WHAT C8 SHOWS AND WHAT IT DOES NOT. C8 rewrites the EVALUATOR to the per-spouse reading. Every
[DISC] cell and both once-not-twice pins must fire; the single-filer and one-spouse cells must
NOT, because with one qualifying person the two readings are the same expression. The script
prints the count of [HAND v5.68] cells that stayed green under C8 so that fact is measured.
"""
import hashlib, os, re, shutil, subprocess, sys

RUN = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
SCR = os.path.join(os.environ.get("TMPDIR", "/tmp"), "nc68")
SRC = "v568.jsx"
T29, BND, HH = "qa/t29_boundaries.mjs", "qa/tools/boundaries.mjs", "qa/tools/fixture/households.mjs"

VA_TEST = 'exclTest: { kind: "taper", base: "agiExSS", perPerson: 12000,\n      threshold: { single: 50000, joint: 75000 } },'
TAPER = 'if (t.kind === "taper") return Math.max(0, (t.perPerson || 0) * _qual - Math.max(0, m - thr));'
SEL = '(r.excl65 || 0) > 0 && !r.exclTest && '


def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()


def other_state_row(text):
    """An entry with excl65 > 0, no exclTest, and a note WITHOUT the selector phrase — so adding
    the phrase grows the guarded set by one while it stays non-empty. Chosen live, not hardcoded."""
    for m in re.finditer(r'^  ([A-Z]{2}): \{ name: "[^"]+",[^\n]*?excl65: ([1-9]\d*),[^\n]*?note: "', text, re.M):
        line = text[m.start():text.index("\n", m.start())]
        if "exclTest" in line or re.search(r"income[- ]limited|income limit", line, re.I):
            continue
        return m.group(1), m.end()
    return None, None


def c_other_state_joins(files):
    code, pos = other_state_row(files[SRC])
    if not code:
        return None
    files[SRC] = files[SRC][:pos] + "income-limited (CONTROL) — " + files[SRC][pos:]
    return files


def c_swap_member(files):
    # RI leaves (phrase removed), another state joins: the count stays 1, the membership changes.
    s = files[SRC]
    i = s.index('  RI: { name: "Rhode Island"')
    j = s.index("\n", i)
    row = s[i:j]
    if "are income-limited in law" not in row:
        return None
    s = s[:i] + row.replace("are income-limited in law", "are capped in law") + s[j:]
    files[SRC] = s
    return c_other_state_joins(files)


def rep(key, old, new):
    def f(files):
        if files[key].count(old) != 1:
            return None
        files[key] = files[key].replace(old, new, 1)
        return files
    return f


def chain(*fs):
    def f(files):
        for g in fs:
            files = g(files)
            if files is None:
                return None
        return files
    return f


def remove_va_test(files):
    return rep(SRC, VA_TEST + "\n", "")(files)


APP = ["t10", "t34", "t35", "t29"]
CONTROLS = [
    # id, description, mutation(files)->files|None, suites, expect, needles
    ("C0", "no mutation at all", lambda f: f, APP, "silent", []),
    ("C1", "perPerson 12000 -> 11000", rep(SRC, "perPerson: 12000,", "perPerson: 11000,"), APP, "fire",
     ["[HAND v5.68] VA joint, both 70", "A-11 [v5.68]", "[INVARIANT v5.68] and that value is the taper's own perPerson"]),
    ("C2", "joint threshold 75000 -> 74000", rep(SRC, "joint: 75000 } },", "joint: 74000 } },"), APP, "fire",
     ["EXACTLY at the threshold", "A-11 [v5.68]"]),
    ("C3", "single threshold 50000 -> 51000 (single cells only)", rep(SRC, "threshold: { single: 50000,", "threshold: { single: 51000,"), APP, "fire",
     ["[HAND v5.68] VA single", "A-11 [v5.68]"]),
    ("C4", "base agiExSS -> agi (taxable SS rides AFAGI)", rep(SRC, 'kind: "taper", base: "agiExSS"', 'kind: "taper", base: "agi"'), APP, "fire",
     ["taxable SS does NOT ride AFAGI", "A-11 [v5.68]"]),
    ("C5", "kind taper -> bands (no rows: grants nothing)", rep(SRC, 'kind: "taper", base: "agiExSS"', 'kind: "bands", base: "agiExSS"'), APP, "fire",
     ["[HAND v5.68] VA joint, both 70, AFAGI $60,000", "A-11 [v5.68]"]),
    ("C6", "excl65 scalar 12000 -> 0 while the table stays right", rep(SRC, '"Virginia", rate: 0.0575, ss: 0, retExempt: false, excl65: 12000,', '"Virginia", rate: 0.0575, ss: 0, retExempt: false, excl65: 0,'), APP, "fire",
     ["[INVARIANT v5.68] VA's excl65 scalar"]),
    ("C7", "VA exclTest removed (unconditional again)", remove_va_test, APP, "fire",
     ["[EXTINCTION v5.68] VA's deduction is no longer income-blind", "A-1 [v5.67]", "D-7 [v5.67]"]),
    ("C8", "EVALUATOR per-spouse: (perPerson - excess) x qual", rep(SRC, TAPER, 'if (t.kind === "taper") return Math.max(0, (t.perPerson || 0) - Math.max(0, m - thr)) * _qual;'), APP, "fire",
     ["[EXTINCTION v5.68] VA once-not-twice: inside the taper", "[EXTINCTION v5.68] VA once-not-twice: at $90,000", "mid taper [DISC $287.50]", "D-3"]),
    ("C9", "note drops 'not once per spouse'", rep(SRC, ", not once per spouse. The measure", ". The measure"), APP, "fire", ["D-12 [v5.68]"]),
    ("C10", "note says the measure INCLUDES dividends", rep(SRC, "but omits dividend and interest income, which the model does not carry", "and includes dividend and interest income"), APP, "fire", ["D-10 [v5.68]"]),
    # ── t29 F-6a / F-6b: the repair itself ──
    ("T1", "INTERIOR change: a second state joins the guarded set (set stays non-empty)", c_other_state_joins, ["t29"], "fire",
     ["F-6a:", "F-6b:"]),
    ("T2", "membership swap at constant size: RI leaves, another joins", c_swap_member, ["t29"], "fire", ["F-6b:"]),
    ("T3", "t29's selector loses !r.exclTest (NM and VA re-enter)", rep(T29, "(r.excl65 || 0) > 0 && !r.exclTest && /income", "(r.excl65 || 0) > 0 && /income"), ["t29"], "fire",
     ["F-6a:", "F-6b:", "F-6c:"]),
    ("T4", "boundaries.mjs's selector loses !r.exclTest (the two copies disagree)", rep(BND, SEL, "(r.excl65 || 0) > 0 && "), ["t29"], "fire", ["F-6c:"]),
    ("T5", "v5.67's VACUOUS form restored + T1's interior change — MUST STAY SILENT (the recorded defect)",
     chain(rep(T29, "EQ(`F-6a:", "T(`F-6a:"), rep(T29, "EQ(`F-6b:", "T(`F-6b:"), c_other_state_joins), ["t29"], "silent-t29-f6", []),
    ("T6", "stateExclCliff fixture loses its stateCode", rep(HH, 'P.stateCode = "RI"; P.stateName = "Rhode Island";', 'P.stateName = "Rhode Island";'), ["t29"], "fire", ["F-7:"]),
]

SUITE_CMD = {"t10": ["node", "t10_taxcases.mjs", "v568"], "t34": ["node", "t34_income_conditioning.mjs", "v568"],
             "t35": ["node", "t35_state_populate.mjs", "v568"], "t29": ["node", "t29_boundaries.mjs", "v568"]}


def prep():
    shutil.rmtree(SCR, ignore_errors=True)
    shutil.copytree(RUN, SCR, symlinks=True, ignore=shutil.ignore_patterns("node_modules"))
    os.symlink(os.path.join(RUN, "node_modules"), os.path.join(SCR, "node_modules"))


def main():
    keys = [SRC, T29, BND, HH]
    before = {k: md5(os.path.join(RUN, k)) for k in keys}
    pristine = {k: open(os.path.join(RUN, k), encoding="utf-8").read() for k in keys}
    print("canonical md5 BEFORE:")
    for k in keys:
        print(f"  {before[k]}  {k}")
    print()
    bad = 0
    for cid, desc, mut, suites, expect, needles in CONTROLS:
        files = mut(dict(pristine))
        if files is None:
            print(f"{cid:<4} ** ANCHOR DID NOT MATCH — FINDING **  {desc}")
            bad += 1
            continue
        if cid != "C0" and all(files[k] == pristine[k] for k in keys):
            print(f"{cid:<4} ** MUTATION CHANGED NOTHING — FINDING **  {desc}")
            bad += 1
            continue
        prep()
        for k in keys:
            open(os.path.join(SCR, k), "w", encoding="utf-8").write(files[k])
        if files[SRC] != pristine[SRC] or cid == "C0":
            r = subprocess.run(["bash", "qa/mk_testable.sh", "v568"], cwd=SCR, capture_output=True, text=True)
            if r.returncode != 0:
                print(f"{cid:<4} DIED building  {desc}\n{r.stderr[-400:]}")
                bad += 1
                continue
        out = ""
        for s in suites:
            out += subprocess.run(SUITE_CMD[s], cwd=os.path.join(SCR, "qa"), capture_output=True, text=True).stdout
        red = [l.strip() for l in out.splitlines() if "✗" in l]
        if expect == "silent":
            ok = not red
        elif expect == "silent-t29-f6":
            ok = not any(("F-6a:" in l or "F-6b:" in l) for l in red)
        else:
            missing = [n for n in needles if not any(n in l for l in red)]
            ok = bool(red) and not missing
        verdict = "OK   " if ok else "FAIL "
        bad += (not ok)
        shape = "SILENT" if not red else f"FIRES ({len(red)} red)"
        print(f"{cid:<4} {verdict} expect {expect:<14} {shape:<16} {desc}")
        if expect == "fire" and not ok:
            print(f"       missing needles: {[n for n in needles if not any(n in l for l in red)]}")
        if expect.startswith("silent") and red:
            for l in red[:4]:
                print(f"       red: {l[:150]}")
        if cid == "C8":
            hand = re.findall(r"^\s*✗ \[HAND v5\.68\][^\n]*", out, re.M)
            n_hand = len(re.findall(r'\[HAND v5\.68\]', open(os.path.join(RUN, "qa/t10_taxcases.mjs"), encoding="utf-8").read()))
            print(f"       C8: {len(hand)} [HAND v5.68] assertion line(s) red; single/one-spouse cells red: "
                  f"{sum(1 for l in hand if 'single' in l or 'one spouse' in l or 'both 64' in l)}  "
                  f"(source carries {n_hand} [HAND v5.68] label sites, several of them loops)")
    shutil.rmtree(SCR, ignore_errors=True)
    after = {k: md5(os.path.join(RUN, k)) for k in keys}
    print("\ncanonical md5 AFTER:")
    for k in keys:
        print(f"  {after[k]}  {k}  {'unchanged' if after[k] == before[k] else '** DRIFT **'}")
    drift = any(after[k] != before[k] for k in keys)
    print(f"\nCONTROLS: {len(CONTROLS) - bad} met expectation, {bad} did not{' — and CANONICAL DRIFT' if drift else ''}")
    sys.exit(1 if (bad or drift) else 0)


if __name__ == "__main__":
    main()
