#!/usr/bin/env python3
"""
oracle_ri.py — an INDEPENDENT implementation of Rhode Island's pension/annuity modification, as the
model represents it. Written for v5.69 (SCOPE_RI_POPULATE.md D-RI-6). ASSERTS NOTHING; counted in no
release's total. It exists so the build compares the app to arithmetic typed from the statute, not to
the app itself.

SOURCE. R.I. Gen. Laws § 44-30-12(c)(9) and (c)(8), transcribed in FINDINGS-v5_63-state-statutes.md §6
AS CORRECTED 2026-09-10, and SCOPE_RI_POPULATE.md §2:
  - up to $50,000 per qualifying individual of taxable pension/annuity income, TY2025+;
  - qualifying = attained full retirement age, 67 for anyone born 1960 or later (`exclAge: 67`);
  - an all-or-nothing cliff on federal AGI, EXCLUSIVE: AGI must be LESS THAN the threshold
    (TY2025: $133,750 joint, $107,000 single, ADV 2025-22);
  - federal AGI includes federally taxable Social Security.

THE MODEL'S SIMPLIFICATIONS, reproduced on purpose so the oracle prices what the model CLAIMS to do —
each is disclosed in RI's note and is not a statutory fact:
  - a flat 5% rate on the state base, and half of federally taxable SS taxed at every income;
  - the exclusion is capped at the HOUSEHOLD's retIncome + pen, not at each person's own income;
  - every retirement dollar qualifies, including IRA money the statute excludes;
  - the AGI measure is retIncome + pen + work + capGains + ssTaxableFed (no dividends or interest).

This file deliberately does NOT import, read or parse DangerClose.jsx.

usage: python3 qa/tools/oracle_ri.py
"""

RATE = 0.05
SS_FACTOR = 0.5
PER_PERSON = 50_000
FLOOR = 67
THRESHOLD = {"joint": 133_750, "single": 107_000}


def ri_tax(ret=0.0, pen=0.0, work=0.0, gains=0.0, ss_taxable=0.0, age_a=70, age_b=70, single=False):
    measure = ret + pen + work + gains + ss_taxable
    column = "single" if single else "joint"
    qualifying = (1 if age_a >= FLOOR else 0) + (0 if single else (1 if age_b >= FLOOR else 0))
    exclusion = PER_PERSON * qualifying if measure < THRESHOLD[column] else 0.0   # EXCLUSIVE
    retirement_base = max(0.0, ret + pen - exclusion)
    return RATE * (retirement_base + max(0.0, work) + SS_FACTOR * max(0.0, ss_taxable) + max(0.0, gains))


CELLS = [
    ("C1 joint 70/70 $100,000 below", dict(ret=100_000)),
    ("C2 joint 70/70 $133,749 one below", dict(ret=133_749)),
    ("C3 joint 70/70 $133,750 AT", dict(ret=133_750)),
    ("C4 joint 70/70 $133,751 one above", dict(ret=133_751)),
    ("C5 single 70 $106,999 one below", dict(ret=106_999, single=True)),
    ("C6 single 70 $107,000 AT", dict(ret=107_000, single=True)),
    ("C7 joint 70/70 $110,000 between columns", dict(ret=110_000)),
    ("C8 joint 70/70 $60,000 + $80,000 taxable SS", dict(ret=60_000, ss_taxable=80_000)),
    ("C9 joint 70/60 $120,000 one qualifying", dict(ret=120_000, age_b=60)),
    ("C10 joint 66/66 $100,000 under the floor", dict(ret=100_000, age_a=66, age_b=66)),
    # Extra cells used by t10's wiring and extinction checks.
    ("X1 joint 70/70 pension $40,000 + RMD $60,000 + SS $20,000 (below)", dict(ret=60_000, pen=40_000, ss_taxable=20_000)),
    ("X2 joint 70/70 pension $40,000 + RMD $80,000 + SS $20,000 (above)", dict(ret=80_000, pen=40_000, ss_taxable=20_000)),
]

if __name__ == "__main__":
    for label, kw in CELLS:
        print(f"{label:<66} ${ri_tax(**kw):>10,.2f}")
