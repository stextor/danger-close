# AUDIT — D-3's direction is wrong, and the finding splits in two

| Field | Value |
|---|---|
| Date | 2026-08-19 |
| Build measured | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · tree `db8f142` |
| Trigger | Premise verification while scoping a D-3 fix. **Stopped and reported rather than adapting the scope.** |
| Result | **D-3's stated direction is false for the app's target population.** The approximation is **conservative**, not optimistic. A second, better-founded finding is separated out: **six states collapse a graduated schedule with no disclosure.** |
| Fixes made | **None.** This is an audit. |

---

## 1. What D-3 claimed, and what was scoped on it

`MissingFeatures.md` D-3 records that progressive state schedules are approximated by an effective
flat rate, direction **"Not uniform"**, and the reasoning carried forward into
`AUDIT_TOP_FIVE_SUMMARY.md` was that the approximation *"under-taxes a high-income household in a
steeply progressive state and can therefore make a plan look better than it is."*

**That reasoning made D-3 the summary's item #2 and the recommended next release.** It was the stated
tiebreaker: the only open simplification that was not reliably conservative, in a tool whose identity
is deliberate pessimism.

**It is wrong.** The direction reverses only far outside the population this app is built for.

## 2. The measurement

**Household:** MFJ, both age 67, retirement-account and pension income only, Social Security separate
(New York exempts it entirely, and the module's `ss: 0` for NY is correct).

**Law, from primary schedule:** New York 2026 MFJ. The 2025 bracket structure with the FY2026 budget's
**0.1 percentage-point cut to the bottom five brackets** effective tax year 2026 — 3.9%, 4.4%, 5.15%,
5.4%, 5.9%, then 6.85% / 9.65% / 10.3% / 10.9% unchanged (Form IT-2105-I, 2026). Standard deduction
MFJ **$16,050**. Pension and annuity exclusion **$20,000 per person** age 59½+.

**Model, from shipped v5.40 source:** `STATE_RULES.NY = { rate: 0.06, ss: 0, retExempt: false,
excl65: 20000 }`, applied by `stateTaxAnnual` (L1091) as
`rate × max(0, retIncome + pen − excl65 × persons65)`.

| NY retirement income | Model | Actual (hand-computed) | Delta | Direction |
|---|---|---|---|---|
| $80,000 | $2,400 | $971 | **+$1,429** | model over-taxes |
| $120,000 | $4,800 | $3,121 | **+$1,679** | model over-taxes |
| $180,000 | $8,400 | $6,361 | **+$2,039** | model over-taxes |
| $250,000 | $12,600 | $10,303 | **+$2,297** | model over-taxes |
| $400,000 | $21,600 | $19,350 | **+$2,250** | model over-taxes |
| $600,000 | $33,600 | $33,050 | **+$550** | model over-taxes |
| **$900,000** | $51,600 | $53,600 | **−$2,000** | model under-taxes |

**The direction flips between $600,000 and $900,000 of annual retirement income.** Below that — the
entire mainstream range, and well past it — the model charges **more** state tax than New York does.
At $120,000 it is **54% too high**.

**Engine output verified, not inferred.** `stateTaxAnnual` and `STATE_RULES` were extracted from the
shipped v5.40 source and executed directly: NY **$4,800**, CA **$7,200** at $120,000. Both match the
hand arithmetic to the dollar.

### 2.1 Why it over-taxes

Two causes, both pushing the same way:

1. **No state standard deduction is modelled.** NY's $16,050 MFJ deduction is simply absent from
   `stateTaxAnnual`, which taxes from the first dollar above the 65+ exclusion.
2. **The flat rate approximates a mid-to-upper marginal rate, not an effective one.** NY's 6.00% is
   its fifth bracket. A retiree at $120,000 never reaches it — their top marginal rate is 5.4% and
   their effective rate on NY taxable income is about 4.9%.

## 3. The finding that survives, and is better founded

**Six states collapse a graduated schedule with no note admitting it.** Four do disclose it — CA
(*"progressive 1–13.3%; 6% is a mid-range effective approximation"*), DC, MD, OR. These six do not:

| State | Modelled rate | Top marginal | Note text |
|---|---|---|---|
| **HI** Hawaii | 6.75% | 11.00% | mentions DB pensions only |
| **MN** Minnesota | 6.80% | 9.85% | mentions the SS subtraction only |
| **NJ** New Jersey | 5.50% | 10.75% | mentions the retirement exclusion only |
| **NY** New York | 6.00% | 10.90% | mentions the exclusion and NYC only |
| **VT** Vermont | 6.60% | 8.75% | mentions SS thresholds only |
| **WI** Wisconsin | 5.30% | 7.65% | mentions the retirement exclusion only |

**This is an undisclosed simplification, and it stays undisclosed regardless of which way the error
points** — the conservative direction buys it no reprieve. It is also *inconsistent*: the same
approximation is disclosed for CA and silent for NY, so a user comparing the two has no way to know
they are reading the same kind of estimate.

**This, not the precision gap, is D-3's defensible core.**

### 3.1 A separate item found in passing — NJ returns $0

At $120,000 with two people 65+, the engine returns **$0** New Jersey state tax. `excl65: 75000 × 2 =
$150,000` exceeds the income, so `retBase` clamps to zero. New Jersey's real exclusion is generous and
**income-limited**, and the note says it is *"approximated as unconditional"* — so this may be
approximately right, or it may be a distinct defect wearing D-3's coat. **Unmeasured. Not asserted
either way.**

## 4. Limits of this measurement — stated, not buried

- **Only New York is verified against a sourced schedule.** The brackets, the 0.1pp 2026 cut, the
  $16,050 deduction and the $20,000/person exclusion were checked against published 2026 material.
- **California is indicative only.** Model $7,200 vs roughly $3,690 by hand — but the CA brackets used
  were **recalled, not sourced**, and CA is not to be cited as verified.
- **HI, MN, VT, WI were not measured at all.** Their inclusion in §3 rests on the rate-vs-top-marginal
  gap and the absence of a note — a disclosure claim, not a magnitude claim. The direction pattern
  **could break** where a state's exclusions are unusually generous, as NJ's may.
- **One household shape, one filing status.** No survivor case, no capital gains, no earned income.
- This is arithmetic against the engine's own function, not a full-plan run through Engine B.

**Before any recalibration ships, all six states need the New York treatment**: sourced schedule,
hand-computed, compared to engine output to the dollar.

## 5. Recommendations

1. **Split D-3.** The *disclosure* half (§3) and the *precision* half (§2) have different urgency and
   should not travel together.
2. **Ship the six disclosure notes in the next release.** A note string per state, no engine change,
   no arithmetic risk.
3. **Hold the precision half** until all six states are measured. **Decline full graduated brackets** —
   roughly 300 numbers across 51 jurisdictions, re-indexed annually, maintained by one person; a stale
   bracket table is worse than an honest flat approximation because it looks precise. If the precision
   half proceeds, prefer **recalibration**: add a per-state standard-deduction field and re-derive each
   rate as an effective rate against a reference retiree household — about 102 numbers, no structural
   change.
4. **Drop D-3's priority.** Its rank rested on a direction that does not hold. The structural
   extinction assertion and E-7's version-ladder registry are both cheaper and now rank above it.
5. **Correct the record** in `AUDIT_TOP_FIVE_SUMMARY.md` and `MissingFeatures.md`.

## 6. What this says about the audit

The top-five summary was written eight days after the Section D sweep and one day after the delta
sweep, and it ranked D-3 second on a **direction label carried forward from v5.29 without
re-measurement**. The label was never wrong at the time in any checkable sense — it was never checked.
Every other correction in this audit has come the same way: from executing a check rather than
re-reading the reasoning. This one cost nothing because it surfaced during premise verification, which
is exactly where scope discipline is supposed to catch it.
