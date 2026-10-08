#!/usr/bin/env python3
"""controls_v595_per_person.py — negative controls for t59 (docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md §10). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v595.jsx; the mutant is compiled (qa/mk_testable.sh), t59 runs on the v595 leg, then ./v595.jsx and ./qa/app_v595.mjs are
RESTORED and hash-checked. Run from the ROOT of a COPY of a v594 -> v595 run folder:  python3 qa/tools/controls_v595_per_person.py [K1 ...]
    K1  the calculator's survivor swap removed ..................................... B-GA, B-RI
    K2  Engine B passes the decedent's age again ................................... B-GA, B-RI
    K3  RI counts IRA income ........................................................ A-1, A-6, D-2
    K4  the per-person cap on the 65+ exclusion removed (WV) ......................... A-5
    K5  PA/MS employer plans no longer exempt at any age ............................. A-3
    K6  the per-person exemption reverted to D-24's both-spouses rule ................ A-2, A-3, A-4
    K7  calls WITHOUT byPerson take the per-person path ............................. A-7, C-1
    K8  t57's recorder anchor removed ............................................... D-5
    K9  the "until v5.95" text restored ............................................. E-1
    K10 RI's band per person not capped at own income ................................ A-1
    K0  unmutated .................................................................... t59 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v595.jsx"); MOD = os.path.join(QA, "app_v595.mjs")
for p in (SRC, MOD, os.path.join(QA, "app_v594.mjs"), os.path.join(QA, "t59_per_person_state.mjs"), os.path.join(QA, "mk_testable.sh")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v594 -> v595 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("survivor swap removed", "  if (single && (ageA === null || ageA === undefined) && ageB !== null && ageB !== undefined) {", "  if (false) {", ["B-GA", "B-RI"]),
 "K2": ("Engine B passes the decedent's age", "ageA: (_svS && !_survivorIsA) ? null : ageA, ageB: (_svS && _survivorIsA) ? null : ageB,", "ageA, ageB,", ["B-GA", "B-RI"]),
 "K3": ("RI counts IRA", 'exclPerPerson: ["employer", "annuity", "pension"],', 'exclPerPerson: ["ira", "employer", "annuity", "pension"],', ["A-1", "A-6", "D-2"]),
 "K4": ("WV per-person cap removed", "? Math.min(x, _own(_bp[who], STATE_RULES[code].exclPerPerson)) : x;", "? x : x;", ["A-5"]),
 "K5": ("PA/MS employer at any age removed", "(r.retExemptEmployerAnyAge ? Math.max(0, (p && p.employer) || 0) : 0)", "0", ["A-3"]),
 "K6": ("both-spouses rule restored", "const _rxPP = !!(_bp && r.retExempt && r.retExemptAge);", "const _rxPP = false;", ["A-2", "A-3", "A-4"]),
 "K7": ("no-byPerson calls take the per-person path", "const _bp = (byPerson && byPerson.A && byPerson.B) ? byPerson : null;",
        "const _bp = (byPerson && byPerson.A && byPerson.B) ? byPerson : { A: { ira: 0, employer: 0, annuity: 0, pension: 0 }, B: { ira: 0, employer: 0, annuity: 0, pension: 0 } };", ["A-7", "C-1"]),
 "K8": ("recorder anchor removed", "  void byPerson; // t57's recorder anchor", "  // anchor removed", ["D-5"]),
 "K9": ("stale text restored", "Both are used by the state rules from v5.95.", "Neither changes any figure until v5.95.", ["E-1"]),
 "K10": ("RI band not capped at own income", "(_okP(ageA) ? Math.min(per, _own(_bp.A, r.exclPerPerson)) : 0)", "(_okP(ageA) ? per : 0)", ["A-1"]),
}
cid = lambda l: (re.match(r"  \u2717 ([A-E]-[A-Z0-9]+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD))
def build(): subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v595"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t59_per_person_state.mjs", "v595"], cwd=QA, capture_output=True, timeout=600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  \u2717 ")]
        tally = re.search(r"t59 SUITE \(v595\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' '.join(x for x in extra if x)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = [run(l) for l in labels]; print("\n".join(out))
ok = (md5(SRC), md5(MOD)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
