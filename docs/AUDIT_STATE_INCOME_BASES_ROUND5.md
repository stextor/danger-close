# AUDIT — state income bases and thresholds (ROUND 5) — **PARTIAL**

| | |
|---|---|
| Status | **PARTIAL — New Mexico verified from statute; New Jersey substantially established; RI, VA, CT NOT DONE.** |
| Purpose | Decision D-7 of `SCOPE_INCOME_CONDITIONING.md`: establish the income BASE and thresholds for the five income-conditioned states before the field is built |
| Measured against | shipped v5.60, source `23877f903a14ba43dd707a43d98b0df4` |
| Date | 2026-09-02 |

---

## 0 · Headline — the audit invalidated two decisions before any code was written

D-1 through D-7 were approved as recommended on 2026-09-02. **Two of them are now known to be
wrong**, and this is the cheapest possible moment to find that out.

- **D-2 ("one income base for all conditioned states") FAILS.** At least two of the five key off a
  measure that **excludes Social Security entirely**, while the others key off adjusted gross income,
  which includes its taxable portion. This is not a rounding difference — for a couple with $40,000
  of Social Security it moves the measure by tens of thousands, across a cliff.
- **D-3 (`{ upTo, amount }` band table) IS INSUFFICIENT.** The five states need **four different
  shapes**, not one. New Jersey's phase-out range is a **percentage of pension income**, not a dollar
  amount, and its cap is a **household** figure at **age 62**, not a per-person figure at 65.

Neither was knowable from `MissingFeatures.md` D-11 (c), and neither is visible in the source. Both
would have been discovered mid-build, which the project's scope rule exists to prevent.

---

## 1 · Method, and what is second-hand

**New Mexico** was read directly from the codified statute (Justia, 2025 N.M. Stat. § 7-2-5.2), full
text including all three band tables. **New Jersey** rests on the Division of Taxation's *Retirement
Income Exclusions* page plus the text of bills amending N.J.S. 54A:6-10 and P.L. 1977 c.273; the
codified section itself was **not** read, and the exact phase-out percentages were not captured from
the official chart. **Virginia, Connecticut and Rhode Island were not audited in this round at all** —
what appears below for them is carried from the app's own notes, which are the thing under audit and
therefore cannot corroborate themselves.

---

## 2a · New Mexico — VERIFIED from statute

**N.M. Stat. § 7-2-5.2**, read in full. Every table is headed **"If adjusted gross income is:"**, so
the base is explicitly **AGI**. The exemption is capped at $8,000 "of income includable except for
this exemption in net income", and is claimable by **any individual** 65 or older — per person.

| MFJ / head of household / surviving spouse — AGI | exemption each |
|---|---|
| not over $30,000 | $8,000 |
| then −$1,000 per additional $3,000 of AGI, in 7 steps | $7,000 … $1,000 |
| **over $51,000** | **$0** |

Single: $8,000 to $18,000, −$1,000 per $1,500, **zero above $28,500**. Married filing separately:
**zero above $25,500**. Nine rows each.

**History: Laws 1985, ch. 114 § 1; 1987, ch. 264 § 6 — and nothing after.** Confirmed against the
2025 codification. The bands are 1987 dollars and have never been indexed, which is why the provision
is dead for the app's target household rather than merely reduced.

⚠ **Not previously recorded:** the exemption is equally available to **any blind individual regardless
of age**. The model has no blindness input and cannot express this. It is an under-application, and it
should be disclosed rather than modelled.

## 2b · New Jersey — substantially established, and it breaks the design

Model holds `excl65: 75000`, no `exclAge` (so 65), applied **per person, unconditionally**.

**Statute and Division guidance establish four separate mismatches:**

1. **Base is New Jersey gross income, not federal AGI — and it EXCLUDES Social Security.** The
   Division's test is "total income for the entire year was $150,000 or less". New Jersey does not
   tax Social Security at all and does not count it toward the threshold. A couple with $40,000 of
   Social Security and $90,000 of other income has an NJ gross income of $90,000 while their federal
   AGI is far higher — the difference between a full exclusion and a partial one.
2. **The shape is three tiers, and the middle one is a PERCENTAGE.** Up to $100,000 of income: a flat
   cap ($100,000 MFJ / $50,000 MFS / $75,000 single or head of household). From $100,001 to $150,000:
   **a percentage of reported pension, annuity and IRA income**, varying by sub-band and filing
   status. Above $150,000: **zero**, a hard cliff.
3. **The cap is a HOUSEHOLD figure, not per person.** The model applies $75,000 *each*.
4. **The age gate is 62, not 65** — or disabled at any age under Social Security's definition.

⚠ The existing note already warns that fixing the age alone would make the estimate *worse*: a 62–64
couple would be granted $150,000 against a $100,000 household cap. That warning is sound and survives
this audit. **New Jersey cannot be corrected one dimension at a time.**

⚠ **Also not previously recorded:** where only one spouse qualifies, the household may still claim the
full maximum, but only against the *qualifying* spouse's pension, annuity or IRA income. That is a
third per-person rule, different from both Rhode Island's and Wisconsin's.

**Not established:** the exact phase-out percentages per sub-band and filing status; whether the
$100,000/$150,000 figures are indexed; the codified text of N.J.S. 54A:6-10 itself.

## 2c · Virginia — NOT AUDITED, but its own note already contradicts D-2

Model holds `excl65: 12000`, applied unconditionally. **The app's existing note states the measure is
"adjusted federal AGI" and that it "excludes Social Security"** — a second state whose base is not the
one D-2 assumed. It also describes a **$1-for-$1 taper** above $50,000 single / $75,000 married, which
is neither a cliff nor a band table: a **fourth shape**.

This is recorded from the app's own note and is **unverified**. It is included because it bears
directly on D-2 and D-3, not because it has been established.

## 2d · Connecticut and Rhode Island — NOT AUDITED

Connecticut carries `excl65: 0` and says its pension and IRA exemptions are **not modelled**. Rhode
Island's cliff base is carried from ROUND4 as federal AGI; its TY2026 indexed thresholds
(ADV 2025-22) remain **located but never read**, so TY2025 is still the only verified pair.

---

## 3 · What this does to the scope

| decision | status after ROUND5 |
|---|---|
| **D-1** measure computed inside `stateTaxAnnual` | **stands** — and matters more, since per-state bases make a single upstream measure worse, not better |
| **D-2** one income base | **FAILS.** At least NJ and VA exclude Social Security; NM and RI use AGI. Needs re-deciding as per-state base selection |
| **D-3** `{ upTo, amount }` bands | **INSUFFICIENT.** Needs to express: fixed bands (NM), percentage-of-income tiers plus a household cap (NJ), a continuous taper (VA), a cliff (RI) |
| **D-4** design for SS later | **stands** |
| **D-5** contain the MAGI divergence | **stands, and is reinforced** — per-state bases make reuse of any existing MAGI clearly wrong |
| **D-6** no output change until populated | **stands, and matters more** — NJ needs four dimensions corrected at once, so per-state releases must be able to land independently |
| **D-7** audit first | **vindicated** |

**New Jersey is the hardest state in the set, not Rhode Island.** Base, shape, unit and age are all
wrong simultaneously, and the note already shows that partial fixes make the estimate worse.

---

## 4 · What remains before the scope can be re-decided

1. Finish New Jersey: the codified section and the official phase-out percentages.
2. Audit Virginia properly — the taper's base, thresholds and whether they are indexed.
3. Audit Connecticut — currently unmodelled, so establish whether it should stay that way.
4. Rhode Island's TY2026 indexed thresholds — the gap ROUND4 left open.
5. Re-decide **D-2** and **D-3** against the four shapes.
