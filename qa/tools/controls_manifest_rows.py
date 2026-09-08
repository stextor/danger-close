#!/usr/bin/env python3
"""Negative controls for the 2026-09-08 manifest hash-row repair.

DRIFT-SAFE BY CONSTRUCTION, following qa/tools/controls_v566_nm.py. This script NEVER edits the
package: each mutant is a fresh copy of the pristine package with one edit applied, and the
pristine package's manifest md5 is printed before and after regardless. A mid-run death leaves
nothing behind but a scratch directory.

C0 is the null control. If it is not SILENT, no other result in this run means anything.

Every control carries a NEEDLE — the failure line must name the file the mutation touched.
A control that passes because some OTHER row is stale has measured nothing, which is the P32/P42
defect this project has now recorded three times.

An anchor that fails to match is reported as a FINDING, not skipped: a control that silently does
not apply its mutation reads exactly like a control that fired and was fixed.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

# ARGUMENT-DRIVEN AND SELF-LOCATING, deliberately. `package_check_controls.sh` had to be rewritten
# in 2026-08-23 because it hardcoded absolute paths from a dead session: anywhere else it printed
# *** NOT CAUGHT *** for every control -- reading as "the checks are broken" rather than "the inputs
# are missing" -- and exited 0. Nothing here names a path from the session that wrote it.
#
#   usage: controls_manifest_rows.py <package-dir> <clone-dir> <workspace-dir> <pool-dir>

HERE  = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) != 5:
    sys.exit("usage: %s <package-dir> <clone-dir> <workspace-dir> <pool-dir>\n"
             "  clone: git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship"
             % os.path.basename(sys.argv[0]))
PKG, CLONE, WORK, POOL = (os.path.abspath(a) for a in sys.argv[1:5])
for label, d in (("package", PKG), ("clone", CLONE), ("workspace", WORK), ("pool", POOL)):
    if not os.path.isdir(d):
        sys.exit("ABORT: %s dir missing: %s" % (label, d))
# package_check beside this script if it is in the tree, else in the workspace being tested.
CHECK = os.path.join(HERE, "package_check.mjs")
if not os.path.exists(CHECK):
    CHECK = os.path.join(WORK, "qa/tools/package_check.mjs")
if not os.path.exists(CHECK):
    sys.exit("ABORT: package_check.mjs not found beside this script or at <workspace>/qa/tools/")

md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
MANS = ["github/PROJECT_KNOWLEDGE_INDEX.md", "knowledge/PROJECT_KNOWLEDGE_INDEX.md"]

def run(pkg_dir):
    r = subprocess.run(["node", CHECK, pkg_dir, CLONE, WORK, POOL],
                       capture_output=True, text=True)
    return r.stdout

def line_for(out, cid):
    for ln in out.splitlines():
        if re.search(r"[\u2713\u2717]\s*" + re.escape(cid) + r":", ln):
            return ln
    return None

def control(name, cid, needle, mutate, expect_fire):
    """mutate(text) -> (new_text, applied?). Built from a pristine copy every time."""
    tmp = tempfile.mkdtemp(prefix="ctl-")
    dst = os.path.join(tmp, os.path.basename(PKG))
    shutil.copytree(PKG, dst)
    applied = True
    if mutate:
        for rel in MANS:
            p = os.path.join(dst, rel)
            txt = open(p, encoding="utf-8").read()
            new, ok = mutate(txt)
            if not ok:
                applied = False
            open(p, "w", encoding="utf-8").write(new)
    if mutate and not applied:
        print(f"  {name}: *** FINDING *** anchor did not match - the mutation was NOT applied")
        shutil.rmtree(tmp); return False

    out = run(dst)
    ln = line_for(out, cid)
    shutil.rmtree(tmp)
    if ln is None:
        print(f"  {name}: *** FINDING *** {cid} did not appear in the output at all")
        return False
    fired = ln.lstrip().startswith("\u2717")
    if expect_fire:
        if not fired:
            print(f"  {name}: *** NOT CAUGHT *** {cid} stayed green under the mutation")
            return False
        if needle and needle not in ln:
            print(f"  {name}: *** FINDING *** {cid} fired but does NOT name {needle} "
                  f"- it caught something else, so this control measured nothing")
            print(f"          {ln.strip()[:200]}")
            return False
        print(f"  {name}: CAUGHT - {cid} fired and names {needle}")
        return True
    else:
        if fired:
            print(f"  {name}: *** FINDING *** {cid} fired with NO mutation applied")
            print(f"          {ln.strip()[:200]}")
            return False
        print(f"  {name}: SILENT - {cid} green, as a null control must be")
        return True


# ── targets DERIVED from the manifest, so this file names no hash and no row that can move ──
# ⚠ WIDENED 2026-09-08 with the gate (D-1 (a)). This copy is LOAD-BEARING: C1 picks its target
# by scanning rows with it, so a gate widened without this line would ship new behaviour with a
# control that STRUCTURALLY CANNOT select a .py row - a control passing while measuring
# nothing, which is the P32/P42 defect. Kept in step by qa/tools/row_census.cjs.
ROW = re.compile(r"^\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt|py))`?\s*\|\s*`?([0-9a-f]{32})`?\s*\|", re.M)

def _first_row_in_pool():
    """The first hash row naming a file that is actually in the pool. Derived, not named."""
    txt = open(os.path.join(PKG, MANS[0]), encoding="utf-8").read()
    for f, h in ROW.findall(txt):
        if os.path.exists(os.path.join(POOL, f)):
            return f, h
    return None, None

C1_FILE, C1_HASH = _first_row_in_pool()

def revert_one_row(txt):
    """C1: corrupt one real hash row. K-8 must fire AND must name that file."""
    if not C1_FILE:
        return txt, False
    bad = ("0" * 32) if C1_HASH != "0" * 32 else ("1" * 32)
    pat = re.compile(r"(^\|\s*`?" + re.escape(C1_FILE) + r"`?\s*\|\s*`?)" + C1_HASH + r"(`?\s*\|)", re.M)
    out, n = pat.subn(r"\g<1>" + bad + r"\g<2>", txt)
    return out, n >= 1


C2_FILE = "sel_census.cjs"   # a pool file whose ONLY mention is its row; verified below

def delete_added_row(txt):
    """C2: remove a pool file's only manifest mention. K-9 must fire and must name it."""
    lines = txt.split("\n")
    keep = [l for l in lines if not l.startswith("| `" + C2_FILE + "` |")]
    if len(keep) != len(lines) - 1:
        return txt, False
    # the name must not survive as a bare mention anywhere, or K-9 is satisfied by that alone.
    # ⚠ The NEEDLE is `sel_census.cjs` even so: K-9 reports the unnamed POOL FILE, not the
    # manifest text. A first draft needled the redaction string, and the needle caught that error
    # rather than the gate - which is the needle doing its job.
    out = "\n".join(keep).replace(C2_FILE, "REDACTED_FOR_CONTROL")
    return out, True


def blind_spot(txt):
    """B1: remove dom_entry_v566.jsx's md5 row but LEAVE its rotation-note mention.
    K-9 is expected to STAY GREEN. This is not a control - it is the demonstration that the
    gap this package closed by hand was invisible to both gates."""
    lines = txt.split("\n")
    keep = [l for l in lines if not l.startswith("| `dom_entry_v566.jsx` |")]
    return "\n".join(keep), len(keep) == len(lines) - 1


print("controls - manifest hash-row repair (K-8 / K-9)")
print(f"  derived: C1 row = {C1_FILE}  ({(C1_HASH or '')[:8]}...)   C2 row = {C2_FILE}")
before = {r: md5(os.path.join(PKG, r)) for r in MANS}
print(f"  pristine manifest md5 (both copies): {set(before.values())}\n")

results = []
results.append(("C0  null control, no mutation                   K-8", control(
    "C0a", "K-8", None, None, expect_fire=False)))
results.append(("C0  null control, no mutation                   K-9", control(
    "C0b", "K-9", None, None, expect_fire=False)))
results.append(("C1  one repaired row reverted to its old hash   K-8", control(
    "C1", "K-8", C1_FILE, revert_one_row, expect_fire=True)))
results.append(("C2  one added row deleted, name redacted        K-9", control(
    "C2", "K-9", C2_FILE, delete_added_row, expect_fire=True)))

print("\n  --- blind-spot demonstration, NOT a control ---")
bs = control("B1", "K-9", None, blind_spot, expect_fire=False)
print("  B1: dom_entry_v566.jsx's md5 row removed and K-9 stayed GREEN, as documented:")
print("      the file is named in the Current-build rotation note, and a bare mention satisfies")
print("      K-9. This is why the missing row had to be found by hand.")

after = {r: md5(os.path.join(PKG, r)) for r in MANS}
print(f"\n  pristine manifest md5 after the run: {set(after.values())}")
print(f"  package unchanged by this run: {before == after}")

print()
ok = True
for name, res in results:
    print(f"  {'PASS' if res else 'FAIL'}  {name}")
    ok = ok and res
print(f"\n  {'all controls behaved' if ok and bs else 'A CONTROL DID NOT BEHAVE - THAT IS THE FINDING'}")
sys.exit(0 if (ok and bs and before == after) else 1)
