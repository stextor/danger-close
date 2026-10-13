#!/usr/bin/env python3
"""controls_v608_engine_d_ira.py — negative controls for t71 (docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in the run
folder's ./v608.jsx; the mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle
— t71 §F reads the Withdrawal tab), t71 runs on the v608 leg, then ./v608.jsx, qa/app_v608.mjs and qa/dom_v608.cjs are RESTORED and
hash-checked.
Run from the ROOT of a COPY of a v607 -> v608 run folder:  python3 qa/tools/controls_v608_engine_d_ira.py [K1 ...]
    K1  the bucket cap takes the IRA's RMD off bucket money again ......................................... D-5
    K2  the bucket cap ignores the year's spending draw again ............................................. D-4
    K3  the Other-account IRA is never converted again .................................................... D-1, F-2
    K4  converted IRA money stays ORDINARY in the pool (taxed again when spent) ........................... B-NAMED_IRA@70K
    K5  converted IRA money stays RMD-bearing ............................................................. B-MIXED@70K
        (not on NAMED_IRA: its IRA is converted away before RMD age at $70,000, so nothing reads the stale figure — measured at the build)
    K6  the IRA's RMD tracker stops growing ............................................................... D-2
    K7  the IRA's RMD leaves it pro rata across the whole pool again ...................................... D-3
    K8  annuity money becomes convertible (the IRA cap reads the whole ordinary pool) ..................... C-3
    K9  the Withdrawal tab's sentence is gone ............................................................. F-1
    NOT A CONTROL — an EQUIVALENT mutant, shown at the build: `tradAmt` / `rothAmt` taking the whole `conv_y` instead of `convBuckets_y`.
        The IRA converts only in a year whose bucket conversion took the whole bucket cap, so `tradAmt` is exactly 0 and `tradFrac` becomes 0
        on either expression; no output can tell them apart (the first controls run reported it "missed" with nothing red). The source keeps
        `convBuckets_y` because it says what is meant.
    K0  unmutated ......................................................................................... t71 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa"); SRC = os.path.join(ROOT, "v608.jsx")
MOD = os.path.join(QA, "app_v608.mjs"); DOM = os.path.join(QA, "dom_v608.cjs")
for p in (SRC, MOD, DOM, os.path.join(QA, "app_v607.mjs"), os.path.join(QA, "t71_engine_d_other_ira.mjs"), os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v608.jsx")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v607 -> v608 run folder copy (missing {p})")
M = {
 "K0": ("unmutated", None, None, []),
 "K1": ("bucket cap subtracts the IRA's RMD", "Math.max(0, tradNotional_boy - _bucketRmdTaken - _spendFromBuckets * tradFrac);",
        "Math.max(0, tradNotional_boy - rmd_y - _spendFromBuckets * tradFrac);", ["D-5"]),
 "K2": ("bucket cap ignores the spending draw", "Math.max(0, tradNotional_boy - _bucketRmdTaken - _spendFromBuckets * tradFrac);",
        "Math.max(0, tradNotional_boy - _bucketRmdTaken);", ["D-4"]),
 "K3": ("the IRA never converts", "const convSleeve_y = _convOn ? Math.min(rothAmount - convBuckets_y, _sleeveConvCap) : 0;",
        "const convSleeve_y = 0;", ["D-1", "F-2"]),
 "K4": ("converted IRA money stays ordinary", "              taxOrd = Math.max(0, taxOrd - convSleeve_y);\n", "", ["B-NAMED_IRA@70K"]),
 "K5": ("converted IRA money stays RMD-bearing", "              taxRmdA = Math.max(0, taxRmdA - convSleeve_y * _cA);\n              taxRmdB = Math.max(0, taxRmdB - convSleeve_y * (1 - _cA));\n",
        "              void _cA;\n", ["B-MIXED@70K"]),
 "K6": ("the IRA's tracker not grown", "taxRmdA = taxRmdA * (1 + growth.tax) * _kR; taxRmdB = taxRmdB * (1 + growth.tax) * _kR; }",
        "void _kR; }", ["D-2"]),
 "K7": ("the IRA's RMD leaves pro rata again", "            taxRmdA = Math.max(0, taxRmdA - _sRA * _sRk);\n            taxRmdB = Math.max(0, taxRmdB - _sRB * _sRk);\n            const _spendShrink = _poolPostRmd > 0 ? _spendFromTaxable / _poolPostRmd : 0;",
        "            void _sRk;\n            const _spendShrink = _taxBoy > 0 ? drawFromTaxable / _taxBoy : 0;", ["D-3"]),
 "K8": ("annuity money convertible", "const _sleeveConvCap = Math.max(0, taxRmdA + taxRmdB);", "const _sleeveConvCap = Math.max(0, taxOrd);", ["C-3"]),
 "K9": ("the Withdrawal sentence gone", "                  A conversion takes the buckets' pre-tax money first, then a Traditional IRA you entered under Other accounts, and never annuity money — that order is the model's assumption, not a rule.\n",
         "", ["F-1"]),
}
cid = lambda l: (re.match(r"  ✗ ([A-F]-[A-Za-z_0-9]+(?:@\d+K)?[ab]?)", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
SRC0 = open(SRC, "rb").read(); BEFORE = (md5(SRC), md5(MOD), md5(DOM))
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v608"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v608.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v608.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, old, new, want = M[label]
    try:
        if old is not None:
            s = SRC0.decode("utf-8")
            if s.count(old) != 1: return f"{label} TARGET occurs {s.count(old)}x (must be 1) — control INVALID"
            open(SRC, "w", encoding="utf-8").write(s.replace(old, new)); build()
        r = subprocess.run(["node", "t71_engine_d_other_ira.mjs", "v608"], cwd=QA, capture_output=True, timeout=1500)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(r"t71 SUITE \(v608\): (\d+) passed, (\d+) failed", out)
        if label == "K0": return f"K0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
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
fires = sum(1 for o in out if " FIRES " in o or o.startswith("K0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
