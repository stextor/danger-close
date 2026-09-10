# Independent implementation of Va. Code § 58.1-322.03(5)(b) — the age deduction — typed from
# FINDINGS-v5_63-state-statutes.md §5 (the statute and the Form 760 Age Deduction Worksheet) and
# NOT from DangerClose's STATE_RULES. Its purpose is to derive expected cells for t10 without
# reading the figure off the thing under test.
#
# The engine formula it is combined with (rate, ss factor, what the deduction applies to) is read
# from stateTaxAnnual and is not itself under test here; the DEDUCTION is.
#
# ⚠ WHY THIS FILE EXISTS AT ALL, given that t34 §D already exercises the `taper` evaluator:
#   t34 proves the EVALUATOR against a synthetic jurisdiction. Virginia is the first REAL taper in
#   STATE_RULES — all three populated states (CT, NM, NJ) are `bands` — so what is unproven is the
#   WIRING: the threshold pair, the base, the per-person amount, and above all whether the excess is
#   subtracted ONCE for a household or once per spouse. A correct evaluator wired to a per-person
#   call site passes t34 D-3 and is wrong by up to a factor of two for every couple in the range.
#
# ⚠ THE ONCE-NOT-TWICE MECHANIC IS THE WHOLE POINT. Form 760's worksheet settles what the statute's
#   text alone does not: Line 8 is AFAGI COMBINED for married taxpayers regardless of filing status,
#   Line 11 is the excess computed ONCE, Line 12 is the COMBINED maximum, and Line 14 is 12 - 11.
#   One subtraction against the combined maximum. A per-spouse reading is correct below the
#   threshold and correct once fully phased out, so it passes a two-sided test and fails only in
#   the middle — which is why the discriminating cells below are marked.

PER_PERSON = 12000.0
THRESHOLD = {"single": 50000.0, "joint": 75000.0}
RATE, SS_FACTOR = 0.0575, 0.0          # Virginia does not tax Social Security

# Born on or before 1 Jan 1939 -> flat $12,000, NO income test. Age 87+ in 2026, outside the app's
# frame, deliberately unmodelled. Also unmodelled: the age deduction cannot be combined with the
# Disability Income subtraction. Both are disclosed, not silently dropped.
AGE_FLOOR = 65


def deduction(afagi, qual, single):
    """Form 760 lines 8-14. ONE subtraction against the COMBINED maximum."""
    if qual == 0:
        return 0.0
    excess = max(0.0, afagi - THRESHOLD["single" if single else "joint"])
    return max(0.0, PER_PERSON * qual - excess)


def deduction_WRONG_per_spouse(afagi, qual, single):
    """The defect this release exists to prevent — the excess taken against EACH spouse's own
    $12,000. Never call it; it is here so the discriminating cells can be shown to differ."""
    if qual == 0:
        return 0.0
    excess = max(0.0, afagi - THRESHOLD["single" if single else "joint"])
    return max(0.0, PER_PERSON - excess) * qual


def va_tax(retIncome=0, pen=0, work=0, capGains=0, ssTaxableFed=0,
           ageA=None, ageB=None, single=False, _deduct=deduction):
    # ⚠ AFAGI is `agiExSS` EXACTLY for Virginia (unlike New Jersey, where the base only
    # approximates gross income). The one remaining gap between this measure and the statute's is
    # dividend and interest income, which the model does not carry — optimistic, and disclosed.
    afagi = max(0.0, retIncome + pen + work + capGains)
    qual = 1 if (ageA is not None and ageA >= AGE_FLOOR) else 0
    if not single:
        qual += 1 if (ageB is not None and ageB >= AGE_FLOOR) else 0
    excl = _deduct(afagi, qual, single)
    retBase = max(0.0, retIncome + pen - excl)
    return RATE * (retBase + max(0.0, work) + SS_FACTOR * max(0.0, ssTaxableFed) + max(0.0, capGains))


# ── the extinction points the statute implies, derived rather than transcribed ────────────────
def extinguishes_at(qual, single):
    return THRESHOLD["single" if single else "joint"] + PER_PERSON * qual


if __name__ == "__main__":
    print("Va. Code § 58.1-322.03(5)(b) — independent oracle\n")
    print("extinction points (FINDINGS §5 gives 62,000 / 87,000 / 99,000):")
    print(f"  single, 1 qualifying     {extinguishes_at(1, True):>10,.0f}")
    print(f"  married, 1 qualifying    {extinguishes_at(1, False):>10,.0f}")
    print(f"  married, 2 qualifying    {extinguishes_at(2, False):>10,.0f}\n")

    CASES = [
        # label, kwargs, region, discriminating?
        ("MFJ both 70, below threshold",      dict(retIncome=60000, ageA=70, ageB=70), "below",   False),
        ("MFJ both 70, AT threshold",         dict(retIncome=75000, ageA=70, ageB=70), "boundary", False),
        ("MFJ both 70, $1 over",              dict(retIncome=75001, ageA=70, ageB=70), "taper",   True),
        ("MFJ both 70, mid taper",            dict(retIncome=80000, ageA=70, ageB=70), "taper",   True),
        ("MFJ both 70, $1 under extinction",  dict(retIncome=98999, ageA=70, ageB=70), "taper",   True),
        ("MFJ both 70, AT extinction",        dict(retIncome=99000, ageA=70, ageB=70), "extinct", False),
        ("MFJ both 70, past extinction",      dict(retIncome=110000, ageA=70, ageB=70), "extinct", False),
        ("MFJ one 70 one 62, mid taper",      dict(retIncome=80000, ageA=70, ageB=62), "taper",   False),
        ("MFJ one 70 one 62, AT extinction",  dict(retIncome=87000, ageA=70, ageB=62), "extinct", False),
        ("Single 70, below threshold",        dict(retIncome=40000, ageA=70, single=True), "below",   False),
        ("Single 70, AT threshold",           dict(retIncome=50000, ageA=70, single=True), "boundary", False),
        ("Single 70, mid taper",              dict(retIncome=55000, ageA=70, single=True), "taper",   False),
        ("Single 70, AT extinction",          dict(retIncome=62000, ageA=70, single=True), "extinct", False),
        ("MFJ both 64 — neither qualifies",   dict(retIncome=80000, ageA=64, ageB=64), "no-qual", False),
        ("MFJ both 65 — the floor itself",    dict(retIncome=80000, ageA=65, ageB=65), "taper",   True),
    ]

    print(f"{'case':<38}{'region':<10}{'deduction':>11}{'tax':>12}   {'per-spouse tax':>14}")
    print("-" * 90)
    for label, kw, region, disc in CASES:
        single = kw.get("single", False)
        afagi = kw.get("retIncome", 0)
        qual = (1 if kw.get("ageA", 0) and kw["ageA"] >= AGE_FLOOR else 0)
        if not single:
            qual += 1 if (kw.get("ageB") is not None and kw["ageB"] >= AGE_FLOOR) else 0
        d = deduction(afagi, qual, single)
        right = va_tax(**kw)
        wrong = va_tax(**kw, _deduct=deduction_WRONG_per_spouse)
        flag = "  <- DISCRIMINATING" if abs(right - wrong) > 0.005 else ""
        print(f"{label:<38}{region:<10}{d:>11,.2f}{right:>12,.2f}{wrong:>15,.2f}{flag}")

    print("\n⚠ Every row where the two columns AGREE is a row that cannot catch a per-spouse wiring")
    print("  defect. A t10 set drawn only from those rows would be green against the wrong engine.")
