#!/usr/bin/env python3
"""controls_v605_fm.py — negative controls for t35 RI-7..RI-10 and t52 F-1..F-3 (docs/SCOPE_V605_RI_FIELD_MANUAL.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v605.jsx; the mutant is compiled (qa/mk_testable.sh and the DOM bundle, as mk_runfolder.sh builds them — t35 reads the app module,
t52 the bundle), the named suite runs on the v605 leg, then ./v605.jsx, qa/app_v605.mjs and qa/dom_v605.cjs are RESTORED and hash-checked.
Run from the ROOT of a COPY of a v604 -> v605 run folder:  python3 qa/tools/controls_v605_fm.py [K1 ...]
    K1  the Field Manual's v6.04 list sentence comes back (five, no Maine, IRA money still applied) ... RI-7, RI-8, RI-9, RI-10
    K2  only the Taxes-tab count goes back to "five" ................................................. RI-9
    K3  Maine drops out of the conditioned list .................................................... RI-7, RI-10
    K4  the IRA over-grant clause comes back beside the new wording ................................ RI-7, RI-8
    K5  a seventh state is marked income-limited in law in the table (Wisconsin) ................... RI-9
    K6  the Field Manual's v6.04 state-age sentences come back (t52) ............................... F-1, F-2, F-3
    K7  New York drops out of the earlier-in-law sentence (t52) .................................... F-3
    K0  unmutated .................................................................................. t35 passes
    K0b unmutated .................................................................................. t52 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v605.jsx"); MOD = os.path.join(QA, "app_v605.mjs"); DOM = os.path.join(QA, "dom_v605.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "t35_state_populate.mjs"), os.path.join(QA, "t52_age_start_notes.mjs"), os.path.join(QA, "dom_entry_v605.jsx"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "d30_ref.mjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v604 -> v605 run folder copy (missing {p})")
OLD_LIST = ("conditions the five exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at v5.66, "
            "New Jersey at v5.67, Virginia at v5.68 and Rhode Island at v5.69, whose $50,000 pension/401k exclusion is lost entirely at its AGI cliff "
            "but is still applied to IRA money the statute does not cover)")
NEW_LIST = ("conditions the six exclusions known to be income-limited in law on an income measure (Connecticut at v5.65, New Mexico at v5.66, "
            "New Jersey at v5.67, Virginia at v5.68, Rhode Island at v5.69 and Maine at v5.73; Rhode Island's $50,000 pension/401k exclusion is lost "
            "entirely at its AGI cliff and, from v5.95, reaches only each person's own pension, annuity and employer-plan income — never IRA money, "
            "which the statute does not cover)")
OLD_AGE = ("One threshold remains deliberately NOT applied: South Carolina's under-65 tier, which is a second amount rather than an earlier start. "
           "Both are stated in their own state notes. Thirteen of the nineteen states remain unverified, so more thresholds may differ from 65 than are modelled here.")
NEW_AGE = ("Two thresholds remain deliberately NOT applied, each a second, smaller amount rather than an earlier start: South Carolina's under-65 tier and "
           "Georgia's $35,000 at 62–64 (conservative). Since v5.86 every exclusion state's figure has been read against a primary source: two start earlier in "
           "law than the model applies — Arkansas (IRAs from 59½, employer plans at any age) and New York (59½) — and both are applied from 65, which "
           "overstates their tax (conservative). Each is stated in its own state note.")
M = {
 "K0": ("unmutated", None, None, []),
 "K0b": ("unmutated (t52)", None, None, []),
 "K1": ("the v6.04 list sentence", NEW_LIST, OLD_LIST, ["RI-7", "RI-8", "RI-9", "RI-10"]),
 "K2": ("the Taxes-tab count to five", "and the six state exclusions known to be income-limited in law", "and the five state exclusions known to be income-limited in law", ["RI-9"]),
 "K3": ("Maine leaves the list", "Virginia at v5.68, Rhode Island at v5.69 and Maine at v5.73;", "Virginia at v5.68 and Rhode Island at v5.69;", ["RI-7", "RI-10"]),
 "K4": ("the IRA over-grant comes back", "— never IRA money, which the statute does not cover)", "but is still applied to IRA money the statute does not cover)", ["RI-7", "RI-8"]),
 "K5": ("a seventh income-limited row", '  WI: { name: "Wisconsin",', '  WI: { name: "Wisconsin", incomeLimitedInLaw: true,', ["RI-9"]),
 "K6": ("the v6.04 state-age sentences", NEW_AGE, OLD_AGE, ["F-1", "F-2", "F-3"]),
 "K7": ("New York leaves the earlier-in-law sentence", "Arkansas (IRAs from 59½, employer plans at any age) and New York (59½) — and both are applied",
        "Arkansas (IRAs from 59½, employer plans at any age) — and it is applied", ["F-3"]),
}
SUITE = {k: ("t52_age_start_notes.mjs", r"t52 SUITE \(v605\): (\d+) passed, (\d+) failed") if k in ("K0b", "K6", "K7") else ("t35_state_populate.mjs", r"t35: (\d+) passed, (\d+) failed") for k in M}
cid = lambda l: (re.match(r"  ✗ (RI-\d+|F-\d+)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v605"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v605.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v605.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        suite, tre = SUITE[label]
        r = subprocess.run(["node", suite, "v605"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(tre, out)
        if label.startswith("K0"): return f"{label} {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        if open(SRC, "rb").read() != SRC0: open(SRC, "wb").write(SRC0); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = (md5(SRC), md5(MOD), md5(DOM)) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} ({BEFORE[0][:8]}… / {BEFORE[1][:8]}… / {BEFORE[2][:8]}…)")
fires = sum(1 for o in out if " FIRES " in o or re.match(r"K0b? OK ", o))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
