"""Negative controls for v5.69 — Rhode Island's pension/401(k) cliff, the inverted guards, the note and the
Field Manual lock. SCOPE_RI_POPULATE.md §7d.

usage:  python3 qa/tools/controls_v569_ri.py <run-folder>
        <run-folder> is the flat folder qa/mk_runfolder.sh builds, with v569.jsx at its root.

DRIFT-SAFE BY CONSTRUCTION (the controls_v566_nm.py / controls_v568_va.py rule). Nothing in <run-folder> is
edited: each control copies the folder to a scratch directory (node_modules symlinked), applies ONE mutation,
rebuilds the v569 leg THERE, runs the suites THERE. md5s of every canonical input are printed before and after.

EVERY CONTROL STATES ITS EXPECTED OUTCOME. `fire` controls list needles that must appear on a failing line;
`silent` controls must produce none. An anchor that does not match is a FINDING, never a skip.

M1-M9 are the mutants SCOPE_RI_POPULATE §7b priced at scope time; their needles are the cells that table says
catch them. ⚠ G5 EXPECTS SILENCE on A-3: it restores t34 A-3's pre-v5.69 `.every` over the (now empty)
remaining list and removes RI's table. It must stay green on A-3 — the vacuity the scope named, reproduced on
purpose — while G6 shows the repaired A-3 fires on the same source mutation.
"""
import hashlib, os, re, shutil, subprocess, sys

RUN = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
SCR = os.path.join(os.environ.get("TMPDIR", "/tmp"), "nc69")
SRC = "v569.jsx"
T29, BND, HH, T34 = "qa/t29_boundaries.mjs", "qa/tools/boundaries.mjs", "qa/tools/fixture/households.mjs", "qa/t34_income_conditioning.mjs"
RI_TEST = ('exclTest: { kind: "bands", base: "agi", unit: "person", cmp: "lt", rows: { joint: [{ upTo: 133750, amount: 50000 }, '
           '{ upTo: Infinity, amount: 0 }], single: [{ upTo: 107000, amount: 50000 }, { upTo: Infinity, amount: 0 }] } }, ')
FM_NEW = ('conditions the five exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at '
          'v5.66, New Jersey at v5.67, Virginia at v5.68 and Rhode Island at v5.69, whose $50,000 pension/401k exclusion is lost entirely '
          'at its AGI cliff but is still applied to IRA money the statute does not cover)')
FM_OLD = ('treats several income-limited exclusions as unconditional (Connecticut at v5.65, New Mexico at v5.66, New Jersey at v5.67 '
          'and Virginia at v5.68 are now conditioned; Rhode Island is not yet)')
A3_NEW = '_expOpen.length === 0 && ["CT", "NJ", "NM", "RI", "VA"].every((c) => RULES[c] && RULES[c].exclTest !== undefined)'
A3_OLD = '_expOpen.every((c) => RULES[c] && RULES[c].exclTest === undefined)'


def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()


def rep(key, old, new, count=1):
    def f(files):
        if files[key].count(old) != count:
            return None
        files[key] = files[key].replace(old, new)
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


def c_other_state_joins(files):
    """A state with excl65 > 0, no exclTest and a note WITHOUT the selector phrase gains the phrase. Chosen live."""
    for m in re.finditer(r'^  ([A-Z]{2}): \{ name: "[^"]+",[^\n]*?excl65: ([1-9]\d*),[^\n]*?note: "', files[SRC], re.M):
        line = files[SRC][m.start():files[SRC].index("\n", m.start())]
        if "exclTest" in line or re.search(r"income[- ]limited|income limit", line, re.I):
            continue
        files[SRC] = files[SRC][:m.end()] + "income-limited (CONTROL) — " + files[SRC][m.end():]
        return files
    return None


APP = ["t10", "t29", "t34", "t35"]
H = "[HAND v5.69] RI "
CONTROLS = [
    ("C0", "no mutation at all", lambda f: f, APP, "silent", []),
    ("M1", "cmp lt -> default lte", rep(SRC, 'unit: "person", cmp: "lt", rows: { joint: [{ upTo: 133750', 'unit: "person", rows: { joint: [{ upTo: 133750'),
     APP, "fire", [H + "C3 ", H + "C6 ", "A-12 [v5.69]"]),
    ("M2", "joint threshold -> $133,500 (PUB 2026-01's typo)", rep(SRC, "joint: [{ upTo: 133750, amount: 50000 }", "joint: [{ upTo: 133500, amount: 50000 }"),
     APP, "fire", [H + "C2 ", "A-12a [v5.69]"]),
    ("M3", "filing columns swapped", rep(SRC, "joint: [{ upTo: 133750, amount: 50000 }, { upTo: Infinity, amount: 0 }], single: [{ upTo: 107000,",
                                         "joint: [{ upTo: 107000, amount: 50000 }, { upTo: Infinity, amount: 0 }], single: [{ upTo: 133750,"),
     APP, "fire", [H + "C2 ", H + "C6 ", H + "C7 ", H + "C9 ", "A-12a [v5.69]"]),
    ("M4", "base agi -> agiExSS", rep(SRC, 'base: "agi", unit: "person", cmp: "lt"', 'base: "agiExSS", unit: "person", cmp: "lt"'),
     APP, "fire", [H + "C8 ", "A-12 [v5.69]"]),
    ("M5", "unit person -> household", rep(SRC, 'unit: "person", cmp: "lt", rows: { joint: [{ upTo: 133750', 'unit: "household", cmp: "lt", rows: { joint: [{ upTo: 133750'),
     APP, "fire", [H + "C1 ", H + "C2 ", H + "C7 ", "A-12 [v5.69]"]),
    ("M6", "amount 50,000 -> 40,000 (both columns, scalar untouched)", chain(rep(SRC, "upTo: 133750, amount: 50000", "upTo: 133750, amount: 40000"),
                                                                         rep(SRC, "upTo: 107000, amount: 50000", "upTo: 107000, amount: 40000")),
     APP, "fire", [H + "C1 ", H + "C2 ", H + "C5 ", H + "C7 ", H + "C9 ", "A-12a [v5.69]", "[INVARIANT v5.69] and that value"]),
    ("M7", "RI exclTest removed (unconditional again)", rep(SRC, RI_TEST, ""),
     APP, "fire", [H + "C3 ", H + "C4 ", H + "C6 ", H + "C8 ", "A-1 [v5.67]", "A-3 [v5.69]", "D-7 [v5.67]", "D-8 [v5.69]",
                   "F-6 [v5.69]: NO STATE_RULES", "RI-4 [v5.69]"]),
    ("M8", "exclAge 67 -> 65", rep(SRC, "exclAge: 67, exclTest: { kind: \"bands\"", "exclAge: 65, exclTest: { kind: \"bands\""),
     APP, "fire", [H + "C10 ", "A-12b [v5.69]", "[INVARIANT v5.69] RI still carries exclAge 67"]),
    ("M9", "tail rows grant $50,000 (no cliff)", rep(SRC, "amount: 50000 }, { upTo: Infinity, amount: 0 }", "amount: 50000 }, { upTo: Infinity, amount: 50000 }", count=2),
     APP, "fire", [H + "C3 ", H + "C4 ", H + "C6 ", H + "C8 ", "A-12a [v5.69]", "RI-4 [v5.69]"]),
    ("G1", "another state gains the income-limited phrase (the set re-fills)", c_other_state_joins,
     APP, "fire", ["F-6 [v5.69]: NO STATE_RULES", "F-6a:", "F-6b:", "D-7 [v5.67]", "D-8 [v5.69]"]),
    ("G2", "RI's note reworded out of the selector phrase, table kept", rep(SRC, "are income-limited in law by a hard AGI cliff:", "are capped in law by a hard AGI cliff:"),
     APP, "fire", ["D-7d [v5.69]", "RI's note still matches it"]),
    ("G3", "the Field Manual's pre-v5.69 state sentence restored", rep(SRC, FM_NEW, FM_OLD),
     ["t35"], "fire", ["RI-5 [v5.69]", "RI-6 [v5.69]", "RI-7 [v5.69]"]),
    ("G4", "RI's note drops the IRA disclosure", rep(SRC, "It does not distinguish IRA distributions, which the statute does not cover, does not cap", "It does not cap"),
     APP, "fire", ["D-16 [v5.69]"]),
    ("G5", "t34 A-3's vacuous .every restored + RI table removed — A-3 MUST STAY SILENT (the recorded vacuity)",
     chain(rep(T34, A3_NEW, A3_OLD), rep(SRC, RI_TEST, "")), ["t34"], "silent-a3", []),
    ("G6", "the same RI removal against the REPAIRED A-3 — A-3 fires", rep(SRC, RI_TEST, ""), ["t34"], "fire", ["A-3 [v5.69]"]),
]
SUITE_CMD = {s: ["node", f, "v569"] for s, f in [("t10", "t10_taxcases.mjs"), ("t29", "t29_boundaries.mjs"),
                                                  ("t34", "t34_income_conditioning.mjs"), ("t35", "t35_state_populate.mjs")]}


def prep():
    shutil.rmtree(SCR, ignore_errors=True)
    shutil.copytree(RUN, SCR, symlinks=True, ignore=shutil.ignore_patterns("node_modules"))
    os.symlink(os.path.join(RUN, "node_modules"), os.path.join(SCR, "node_modules"))


def main():
    keys = [SRC, T29, BND, HH, T34]
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
            r = subprocess.run(["bash", "qa/mk_testable.sh", "v569"], cwd=SCR, capture_output=True, text=True)
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
        elif expect == "silent-a3":
            ok = not any("A-3" in l for l in red)
        else:
            missing = [n for n in needles if not any(n in l for l in red)]
            ok = bool(red) and not missing
        bad += (not ok)
        shape = "SILENT" if not red else f"FIRES ({len(red)} red)"
        print(f"{cid:<4} {'OK   ' if ok else 'FAIL '} expect {expect:<10} {shape:<16} {desc}")
        if expect == "fire" and not ok:
            print(f"       missing needles: {[n for n in needles if not any(n in l for l in red)]}")
        if expect.startswith("silent") and not ok:
            for l in red[:4]:
                print(f"       red: {l[:150]}")
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
