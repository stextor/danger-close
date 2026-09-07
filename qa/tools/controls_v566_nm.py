#!/usr/bin/env python3
"""Negative controls for the v5.66 New Mexico dollar-exact block in t10 2E.

DRIFT-SAFE BY CONSTRUCTION, and that is deliberate. The v5.66 session-2 control run died on a
shell error AFTER applying a mutation and BEFORE its restore, poisoning the baseline so that every
later control measured against corrupt source and one control appeared not to fire
(STOP-REPORT-v5_66-nm-session2.md 2b). This script NEVER edits the canonical source: each mutant is
written to a throwaway tag from a pristine read, so a mid-run death leaves nothing behind but a
scratch file. The canonical md5 is printed before and after regardless.

C0 is the null control. If it is not SILENT, no other result in this run means anything.
An anchor that fails to match is reported as a FINDING, not skipped -- a control that silently does
not apply its mutation reads exactly like a control that fired and was fixed.
"""
import hashlib, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__)) + "/.."
SRC = os.path.join(ROOT, "v566.jsx")
TAG = "v566c"

ANCHOR = 'exclTest: { kind: "bands", base: "agi", unit: "person", rows: {\n      joint: [\n        { upTo: 30000'

CONTROLS = [
    ("C0", "no mutation at all -- MUST BE SILENT", None, None),
    ("C1", "middle band amount $4,000 -> $4,500 (a band no endpoint test can see)",
     "{ upTo: 42000, amount: 4000 }", "{ upTo: 42000, amount: 4500 }"),
    ("C1b", "middle band TOP $36,000 -> $37,000",
     "{ upTo: 36000, amount: 6000 }", "{ upTo: 37000, amount: 6000 }"),
    ("C2", "comparator forced EXCLUSIVE (cmp lt) -- only the inclusive band tops see this",
     ANCHOR, ANCHOR.replace('unit: "person", rows:', 'unit: "person", cmp: "lt", rows:')),
    ("C3", "unit person -> household (grants the row ONCE to a two-qualifier couple)",
     ANCHOR, ANCHOR.replace('unit: "person"', 'unit: "household"')),
    ("C4", "measure base agi -> agiExSS (drops taxable SS out of the band lookup)",
     ANCHOR, ANCHOR.replace('base: "agi"', 'base: "agiExSS"')),
    ("C5", "single table top band $28,500 -> $30,000 (single-status cells only)",
     "{ upTo: 28500, amount: 1000 }", "{ upTo: 30000, amount: 1000 }"),
    ("C6", "excl65 scalar 8000 -> 7000 while the table stays right (second source of truth)",
     'retExempt: false, excl65: 8000,\n    // NMSA 1978', 'retExempt: false, excl65: 7000,\n    // NMSA 1978'),
    ("C7", "NM exclTest removed entirely (falls back to the unconditional $8,000)",
     None, None),
]


def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()


def build_and_run(text):
    dst = os.path.join(ROOT, TAG + ".jsx")
    open(dst, "w").write(text)
    subprocess.run([os.path.join(ROOT, "qa", "mk_testable.sh"), TAG],
                   cwd=ROOT, capture_output=True)
    out = subprocess.run(["node", "t10_taxcases.mjs", TAG],
                         cwd=os.path.join(ROOT, "qa"), capture_output=True, text=True).stdout
    for f in (dst, os.path.join(ROOT, "qa", f"app_{TAG}.jsx"), os.path.join(ROOT, "qa", f"app_{TAG}.mjs")):
        if os.path.exists(f):
            os.remove(f)
    m = re.search(r"^t10 total: (\d+) passed, (\d+) failed", out, re.M)
    if not m:
        return None, out
    return (int(m.group(1)), int(m.group(2))), out


before = md5(SRC)
print(f"canonical v566.jsx md5 BEFORE: {before}\n")
pristine = open(SRC).read()

for label, desc, old, new in CONTROLS:
    if label == "C0":
        text = pristine
    elif label == "C7":
        # remove the whole exclTest object by brace matching from its key
        i = pristine.index("exclTest: { kind: \"bands\", base: \"agi\", unit: \"person\"")
        j, depth = i, 0
        while True:
            if pristine[j] == "{":
                depth += 1
            elif pristine[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        text = pristine[:i] + "exclTestRemovedByControl: 0" + pristine[j + 1:]
    else:
        if old not in pristine:
            print(f"{label:<4} ** ANCHOR DID NOT MATCH -- THIS IS A FINDING, not a skip **  {desc}")
            continue
        text = pristine.replace(old, new, 1)
        if text == pristine:
            print(f"{label:<4} ** MUTATION DID NOT CHANGE THE SOURCE -- FINDING **  {desc}")
            continue
    res, out = build_and_run(text)
    if res is None:
        print(f"{label:<4} DIED (no total line) {desc}")
        continue
    p, f = res
    if f == 0:
        print(f"{label:<4} SILENT  ({p} passed, 0 failed)  {desc}")
    else:
        names = re.findall(r"✗ (\[[A-Z]+ v5\.66\][^:]*)", out)[:3]
        print(f"{label:<4} FIRES   ({f} failed)  {desc}")
        for n in names:
            print(f"       {n}")

after = md5(SRC)
print(f"\ncanonical v566.jsx md5 AFTER : {after}")
print("UNCHANGED -- no workspace drift" if before == after
      else "** DRIFT -- the canonical source moved during the control run **")
