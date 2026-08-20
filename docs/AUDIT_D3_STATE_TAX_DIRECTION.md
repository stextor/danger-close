# AUDIT — D-3's direction is wrong, and the finding splits in two

| Field | Value |
|---|---|
| Date | 2026-08-19 |
| Build measured | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · tree `db8f142` |
| Trigger | Premise verification while scoping a D-3 fix. **Stopped and reported rather than adapting the scope.** |
| Result | **D-3's stated direction is false for the app's target population.** The approximation is **conservative**, not optimistic. A second finding was separated out and, on 2026-08-20, **corrected downward**: the approximation is disclosed in three places, so what remains is **inconsistent per-state note detail, severity Low** — see §3. |
| Fixes made | **None.** This is an audit. |
| Amended | **2026-08-20** — §3 rewritten (see the box at §3), §4 and §5 followed. Verified against v5.40 source, committed tree `c7c8156`. |

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

## 3. The finding that survives — and it is smaller than this section first claimed

> ⚠ **CORRECTED 2026-08-20, against v5.40 `src/DangerClose.jsx` md5
> `6b7cebb1476ee66e57079b713b94ba75` (committed tree `c7c8156`).** As first written, this section
> called the flat-rate approximation an **"undisclosed simplification"** and named it *"D-3's
> defensible core."* **Both claims are false.** The approximation is disclosed in three places (§3.0),
> two of which this same session had already read. What actually varies is how much detail an
> individual state's `note` string adds *on top of* that disclosure — **inconsistent per-state detail,
> severity Low**, not an undisclosed gap. The original text is preserved in §3.3 so the correction can
> be audited. **Consequence: D-3 has no live high-priority half.** The precision half (§2) is
> conservative and held; this half is Low.

### 3.0 The approximation IS disclosed — three sites, each quoted from source

1. **Field Manual §13, "Limitations & Known Issues."** Decoded from the one-line `DOCS_HTML` blob at
   `src/DangerClose.jsx` **L3593** (143,529 runtime bytes; decodes with a JS evaluator, not
   `JSON.parse`): *"State tax is an approximation layer. The 51-jurisdiction module (see the Taxes tab
   entry) uses effective flat rates in place of progressive state brackets, treats several
   income-limited exclusions as unconditional, and skips county/city taxes — pick your state in My
   Data, then verify against your state's own rules."*
2. **Field Manual, the Taxes tab entry**, same blob: *"It is an approximation layer: effective rates
   stand in for progressive brackets and several income-limited exclusions are treated as
   unconditional — verify your state."*
3. **In the app itself** — `src/DangerClose.jsx` **L11889**, rendered under the state selector on My
   Data whenever a state is chosen from the dropdown, for **every** jurisdiction in `STATE_RULES`:
   *"2026 approx: {rate}% effective … — {note}. Verify against your state's rules."*

**One real gap found while checking this, and it is new:** the **setup wizard's** state picker
(`src/DangerClose.jsx` **L3393**, step 5) offers the same 51-entry dropdown with **no note beneath
it** — a user who picks a state during setup and never revisits My Data sees the approximation
disclosed only in the Field Manual. Severity **Low**; recorded here rather than opened as a numbered
defect.

### 3.1 What actually varies — measured, not inferred

`STATE_RULES` (`src/DangerClose.jsx` **L1005–L1057**) holds **51** entries and gives every one of them
a **single scalar `rate`**. The collapse of a graduated schedule into one number is therefore
**universal by construction** — it is not a property of six states. What differs between states is the
`note` string:

| Group | Count | States |
|---|---|---|
| `rate === 0` — no income tax modelled | 9 | AK FL NV NH SD TN TX WA WY |
| Note itself says "flat" | 9 | AZ GA ID IN LA MA MS NC OH |
| **Remainder — candidate set: the note does not declare the rate flat** | **33** | AL AR CA CO CT DE DC HI IL IA KS KY ME MD MI MN MO MT NE NJ NM NY ND OK OR PA RI SC UT VT VA WV WI |
| — of the 33, the note **does** name progressivity | 3 | **CA, DC, OR** |
| — of the 33, the note is **silent on the shape of the schedule** | **30** | the other 30 |
| — of those 30, `retExempt: true`, so the rate never bites on retirement income | 4 | IL IA MI PA |

Three corrections follow from that table, and each contradicts the original §3:

- **Maryland is misfiled.** MD's note reads *"state+county effective; pension exclusion ~$36K 65+
  (traditional IRA excluded from the exclusion — not modeled)"* — it says **"effective"** but never
  says the schedule is progressive. By this section's own discriminator MD belongs with the silent
  group. **The disclosing set is three, not four: CA, DC, OR.** Only CA names a numeric range
  (*"progressive 1–13.3%"*); OR names a ceiling (*"progressive to 9.9%"*); DC names neither
  (*"progressive; effective approximation"*). So even the "disclosing" set is not uniform with itself.
- **"With no note" is false.** All six named states carry notes — the original table's own right-hand
  column says what each one mentions, which contradicts the sentence directly above it.
- **Six is a sample, not a census.** The measured set of states whose note is silent on schedule shape
  is **30**, falling to **26** once the four `retExempt` states are set aside. That is an **upper
  bound**, not the answer: several of the 26 levy a flat rate in law and belong out of the set
  entirely, and identifying which requires a **sourced census of 26 state schedules that has NOT been
  run**. No number between 6 and 26 should be quoted as measured until it is.

### 3.2 Restated finding

**Per-state `note` detail is inconsistent: of the 33 states whose note does not declare the rate flat,
three name the progressivity the rate stands in for and 30 say nothing about the shape of the schedule
— and the three do not agree with each other on how much to say.** A user comparing California to New York reads different amounts of detail about the
same modelling choice — but not, as originally claimed, disclosure versus silence, because the
approximation itself is stated in the Field Manual twice and beneath the selector on every state.

**Severity: Low.** Exposure is **user-side** but bounded: the governing disclosure is present and the
per-state note is additive. **Where:** `src/DangerClose.jsx` L1005–L1057, the `note` field.
**Suspected cause:** notes were written per state as each was added, against no template.

### 3.3 The original §3, preserved for audit

> **Six states collapse a graduated schedule with no note admitting it.** Four do disclose it — CA
> (*"progressive 1–13.3%; 6% is a mid-range effective approximation"*), DC, MD, OR. These six do not:
> HI (6.75% modelled / 11.00% top marginal), MN (6.80% / 9.85%), NJ (5.50% / 10.75%), NY (6.00% /
> 10.90%), VT (6.60% / 8.75%), WI (5.30% / 7.65%).
>
> **This is an undisclosed simplification, and it stays undisclosed regardless of which way the error
> points** — the conservative direction buys it no reprieve. It is also *inconsistent*: the same
> approximation is disclosed for CA and silent for NY, so a user comparing the two has no way to know
> they are reading the same kind of estimate.
>
> **This, not the precision gap, is D-3's defensible core.**
>
> *(The top-marginal figures above were never sourced — see §4. They are carried into this quotation
> unchanged and remain unverified.)*

### 3.4 A separate item found in passing — NJ returns $0

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
- **HI, MN, VT, WI were not measured at all.** Their inclusion in the original §3 rested on the
  rate-vs-top-marginal gap and on a claimed absence of a note. **The absence half is now withdrawn**
  (§3.0): all four carry notes, and the approximation is disclosed app-wide. What remains unmeasured
  is the magnitude, and the direction pattern **could break** where a state's exclusions are unusually
  generous, as NJ's may.
- **The top-marginal rates quoted in the original §3 were never sourced.** They are preserved in §3.3
  and remain unverified. None of the 2026-08-20 correction depends on them.
- **One household shape, one filing status.** No survivor case, no capital gains, no earned income.
- This is arithmetic against the engine's own function, not a full-plan run through Engine B.

**Before any recalibration ships, every state it would touch needs the New York treatment**: sourced
schedule, hand-computed, compared to engine output to the dollar. "The six" was a sample, not a
census (§3.1).

## 5. Recommendations

1. **Split D-3.** The *disclosure* half (§3) and the *precision* half (§2) have different urgency and
   should not travel together.
2. **~~Ship the six disclosure notes in the next release.~~ Superseded 2026-08-20.** The
   approximation is already disclosed (§3.0), so there is no disclosure defect to ship against. What
   is left is a **Low**-severity consistency tidy — bring the `note` strings onto one template so that
   a state whose modelled rate stands in for a graduated schedule says so. **Let it ride along with
   the next release that opens `STATE_RULES` for another reason; it does not justify a release of its
   own.** If it does ship, it should cover the measured set (§3.1), not the six this document
   originally named, and it should add the missing note beneath the **setup wizard's** picker (L3393).
3. **Hold the precision half** until the states it would touch are measured. **Decline full graduated brackets** —
   roughly 300 numbers across 51 jurisdictions, re-indexed annually, maintained by one person; a stale
   bracket table is worse than an honest flat approximation because it looks precise. If the precision
   half proceeds, prefer **recalibration**: add a per-state standard-deduction field and re-derive each
   rate as an effective rate against a reference retiree household — about 102 numbers, no structural
   change.
4. **Drop D-3's priority — and after 2026-08-20, drop it further.** Its rank rested on a direction
   that does not hold; the half that was supposed to survive that correction is Low. **D-3 now has no
   live high-priority half.** The structural extinction assertion and E-7's version-ladder registry
   both rank above it.
5. **Correct the record** in `AUDIT_TOP_FIVE_SUMMARY.md`, `MissingFeatures.md` and
   `PROJECT_KNOWLEDGE_INDEX.md`. *(Done 2026-08-20 for the disclosure correction.)*

## 6. What this says about the audit

The top-five summary was written eight days after the Section D sweep and one day after the delta
sweep, and it ranked D-3 second on a **direction label carried forward from v5.29 without
re-measurement**. The label was never wrong at the time in any checkable sense — it was never checked.
Every other correction in this audit has come the same way: from executing a check rather than
re-reading the reasoning. This one cost nothing because it surfaced during premise verification, which
is exactly where scope discipline is supposed to catch it.

**And then this document did it again.** The 2026-08-20 correction (§3) is the same failure one level
down: having corrected D-3's *direction* by measurement, the surviving half was written up from
inference — "these notes don't mention brackets" was rounded to "this is undisclosed" — while the
disclosure text sat in the same source file the session had already opened. `MissingFeatures.md`
records the project's own rule for exactly this, from an earlier instance: ***"'Undisclosed' requires
looking everywhere."*** Its D-3 row had also classified the item **"Disclosed | Not uniform"** since an
earlier pass, which was correct; the 2026-08-19 revision overwrote a correct classification with a
worse one.

The general form: **a correction is not self-certifying.** The act of having just caught an error makes
the replacement claim feel earned, and it is not — it needs its own execution. Three of this
document's claims have now been fixed by running a check; none by re-reading.
