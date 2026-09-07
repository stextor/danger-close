# Independent implementation of NMSA 1978 § 7-2-5.2, typed from FINDINGS-v5_63-state-statutes.md §2
# — the statutory table — and NOT from DangerClose's STATE_RULES. Its purpose is to derive expected
# cells for t10 without reading the figure off the thing under test.
#
# The engine formula it is combined with (rate, ss factor, what the exemption applies to) is read
# from stateTaxAnnual and is not itself under test here; the EXEMPTION is.

JOINT = [(30000, 8000), (33000, 7000), (36000, 6000), (39000, 5000), (42000, 4000),
         (45000, 3000), (48000, 2000), (51000, 1000), (float("inf"), 0)]
SINGLE = [(18000, 8000), (19500, 7000), (21000, 6000), (22500, 5000), (24000, 4000),
          (25500, 3000), (27000, 2000), (28500, 1000), (float("inf"), 0)]

RATE, SS_FACTOR = 0.049, 0.5


def exemption(agi, single):
    for top, amt in (SINGLE if single else JOINT):
        if agi <= top:          # statute reads "not over", i.e. inclusive
            return amt
    return 0


def nm_tax(retIncome=0, pen=0, work=0, capGains=0, ssTaxableFed=0,
           ageA=None, ageB=None, single=False):
    agi = max(0.0, retIncome + pen + work + capGains + ssTaxableFed)
    qual = (1 if (ageA is not None and ageA >= 65) else 0)
    if not single:
        qual += (1 if (ageB is not None and ageB >= 65) else 0)
    excl = exemption(agi, single) * qual
    retBase = max(0.0, retIncome + pen - excl)
    return RATE * (retBase + max(0.0, work) + SS_FACTOR * max(0.0, ssTaxableFed) + max(0.0, capGains))


if __name__ == "__main__":
    print("JOINT band sweep — both 70/68, all income is retirement income")
    for top, amt in JOINT[:-1]:
        print(f"  AGI {top:>7,} -> exemption {amt:>5,}/person -> tax {nm_tax(retIncome=top, ageA=70, ageB=68):>10.3f}")
    print(f"  AGI  51,001 -> exemption     0/person -> tax {nm_tax(retIncome=51001, ageA=70, ageB=68):>10.3f}")
    print("\nSINGLE band sweep — 70, all income is retirement income")
    for top, amt in SINGLE[:-1]:
        print(f"  AGI {top:>7,} -> exemption {amt:>5,}        -> tax {nm_tax(retIncome=top, ageA=70, single=True):>10.3f}")
    print(f"  AGI  28,501 -> exemption     0        -> tax {nm_tax(retIncome=28501, ageA=70, single=True):>10.3f}")
