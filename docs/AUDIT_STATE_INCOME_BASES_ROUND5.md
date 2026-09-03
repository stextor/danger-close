# AUDIT — state income bases and thresholds (ROUND 5) — **COMPLETE**

| | |
|---|---|
| Status | **COMPLETE.** All five income-conditioned states established against primary sources. Two scope decisions re-decided; one shipped disclosure defect filed. |
| Purpose | Decision D-7 of `SCOPE_INCOME_CONDITIONING.md`: establish the income BASE and thresholds for the five income-conditioned states before the field is built |
| Measured against | shipped **v5.60**, source `23877f903a14ba43dd707a43d98b0df4`, clone **`e1f7adb`** |
| Dates | opened 2026-09-02 (PARTIAL, New Mexico only) · completed 2026-09-03 |

> **On the clone tag.** The PARTIAL draft and the session brief both recorded `33f699d`. Re-read from
> a fresh clone this session: three commits followed it — `d590bcd` and `513f666` uploaded this file
> and the scope into `docs/`, and `e1f7adb` is an **empty commit** (`git diff --name-status` between
> it and its parent returns nothing).

---

## 0 · Headline — four findings, and two of them reverse what the PARTIAL draft said

**The PARTIAL draft's two invalidations were right that D-2 and D-3 fail. It was wrong about why, and
the corrected reasons make the build cheaper, not dearer.**

1. **D-2 fails — but the model can express exactly TWO bases, not five.** Three statutes name three
   different bases. Reduced to the terms `stateTaxAnnual` already receives, they collapse to two
   expressions **differing by a single argument the function already has** (`ssTaxableFed`). The
   PARTIAL draft's "per-state base selection" reading overstated the cost by a wide margin.
2. **D-3 is insufficient — but there are TWO shapes, not four.** What the draft called four shapes is
   **two shapes multiplied by three orthogonal attributes** (base, unit, age gate). New Jersey looked
   like its own shape only because all three attributes differ at once.
3. **A shipped, user-facing figure is wrong.** Rhode Island's note gives its TY2025 MFJ threshold as
   **$133,500**. The statute's own indexing formula makes that value arithmetically impossible. The
   correct figure is **$133,750**. See §2e and §8.
4. **Connecticut's direction reverses.** It is not a neutral omission. The model **overstates**
   Connecticut tax substantially, and from TY2026 more so than in any prior year. It is the only one
   of the five whose simplification runs *pessimistic*.

A fifth, procedural: **ADV 2025-22 never contained Rhode Island's TY2026 thresholds.** The ROUND4
item that named it as the source rested on a false premise, established by reading the document.

---

## 1 · Method, and what is first-hand

Every state below was read against a primary or official source **in this session**, except New
Mexico, which was read from the codified statute in the 2026-09-02 pass and is carried unchanged.
`bash_tool`'s network allowlist excludes statute sites; all of this came through `web_search` /
`web_fetch`, which are a separate path and work.

| state | source read | standing |
|---|---|---|
| **NM** | 2025 N.M. Stat. § 7-2-5.2, full text incl. all three band tables (Justia) | **verified** — carried from the 2026-09-02 pass |
| **NJ** | **N.J.S.A. 54A:6-10, codified text, read in full** (Justia, 2025 revision) | **verified** — the gap the PARTIAL draft left is closed |
| **VA** | **Va. Code § 58.1-322.03(5)(b)** (law.lis.virginia.gov, corroborated FindLaw/Justia) + **official Form 760 Age Deduction Worksheet**, 2023 and 2025 instructions (tax.virginia.gov) + Tax Commissioner ruling 22-19 | **verified**, including the worksheet mechanics |
| **CT** | **CGS § 12-701(a)(20)(B)(xx)–(xxix)** via CGA **OLR reports 2024-R-0130 and 2025-R-0152**, incl. Table 1 in full | **verified** |
| **RI** | **ADV 2025-22 (3 Nov 2025) read in full** + **PUB 2026-01 Retirement Income Guide read in full**, incl. the reproduced text of R.I. Gen. Laws § 44-30-12(c)(8)–(c)(11) (tax.ri.gov) | **verified**, and the two documents **conflict** — see §2e |

The app's own notes were read from the **source via the AST** (`qa/tools/state_dump.cjs`, written this
session), never by grep. `STATE_RULES` declares **51 entries at L1028**; `stateTaxAnnual` is defined
at **L1114–1160**.

---

## 2a · New Mexico — VERIFIED from statute *(carried from 2026-09-02, unchanged)*

**N.M. Stat. § 7-2-5.2**, read in full. Every table is headed "If adjusted gross income is:", so the
base is explicitly **AGI**. The exemption is capped at $8,000 "of income includable except for this
exemption in net income", and is claimable by **any individual** 65 or older — per person.

| MFJ / head of household / surviving spouse — AGI | exemption each |
|---|---|
| not over $30,000 | $8,000 |
| then −$1,000 per additional $3,000 of AGI, in 7 steps | $7,000 … $1,000 |
| **over $51,000** | **$0** |

Single: $8,000 to $18,000, −$1,000 per $1,500, **zero above $28,500**. Married filing separately:
**zero above $25,500**. Nine rows each.

**History: Laws 1985, ch. 114 § 1; 1987, ch. 264 § 6 — and nothing after.** The bands are 1987
dollars and have never been indexed, which is why the provision is dead for the app's target
household rather than merely reduced.

⚠ The exemption is equally available to **any blind individual regardless of age**. The model has no
blindness input and cannot express this. It is an under-application, to be disclosed, not modelled.

**Model holds** `excl65: 8000`, no `exclAge`, note *"SS exempt under $100K single/$150K MFJ; $8K 65+
exemption income-limited"* — which names the limit but **not the base and not a single threshold**.
The note is the vaguest of the five and should gain the $51,000 figure when NM is populated.

## 2b · New Jersey — COMPLETE. The codified section closes every open question

**N.J.S.A. 54A:6-10(b), read in full.** Last amended **P.L. 2021, c.129, s.1**.

**The phase-out percentages, which the PARTIAL draft could not capture** — of *payments* received as
pension, annuity, disability or retirement benefits:

| NJ gross income | MFJ | MFS | single / § 54A:2-1(a) |
|---|---|---|---|
| ≤ $100,000 | up to **$100,000** | up to **$50,000** | up to **$75,000** |
| > $100,000, ≤ $125,000 | **50%** of payments | **25%** | **37.5%** |
| > $125,000, ≤ $150,000 | **25%** of payments | **12.5%** | **18.75%** |
| > $150,000 | **not allowed at all** — § 54A:6-10(b)(2) | | |

**Indexed? NO.** There is no inflation-adjustment clause anywhere in the section. Every change came by
amendment — 1999 c.177, 2005 c.130, 2016 c.57, 2021 c.129 — stepping the base tier $10,000 → $20,000
→ $40,000 → $60,000 → $80,000 → $100,000 across two decades. **This settles the PARTIAL draft's open
question and it settles it the same way New Mexico's does: a fixed dollar figure that only the
legislature moves.**

**Age gate 62**, or disabled such that the person is or would be eligible under the federal Social
Security Act. Confirmed in the operative clause.

⚠ **New, and it simplifies the build: the dollar caps can never bind in the percentage tiers.**
Payments cannot exceed gross income, and gross income in those tiers cannot exceed $150,000. So the
largest possible MFJ exclusion there is 50% × $150,000 = $75,000, below the $100,000 cap; single
37.5% × $150,000 = $56,250, below $75,000; MFS 25% × $150,000 = $37,500, below $50,000. **The tiers
are a pure percentage with no effective cap**, which removes an interaction the draft assumed existed.

**Base is New Jersey gross income and it excludes Social Security.** Social Security is excluded from
gross income by N.J.S.A. 54A:6-2, and § 54A:6-1 makes the items in 54A:6-2 to 54A:6-9 exclusions from
gross income — so benefits are not gross income and cannot count toward the $100,000/$150,000 test.
Confirmed structurally against the chapter's own architecture.

**Model holds** `excl65: 75000`, no `exclAge` (so 65), applied **per person, unconditionally**. Four
simultaneous mismatches — base, shape, unit (household, not per person), age (62, not 65) — all
confirmed. ⚠ **The existing note's warning survives the audit and is load-bearing**: correcting the
age alone would grant a 62–64 couple $150,000 against a $100,000 household cap, making the estimate
*worse*. New Jersey cannot be corrected one dimension at a time.

⚠ Also confirmed: where only one spouse qualifies, the household may still claim the full maximum,
but only against the *qualifying* spouse's pension, annuity or IRA income.

## 2c · Virginia — VERIFIED, and its note is accurate about the base

**Va. Code § 58.1-322.03(5)(b).** The app's note is right and is the best-written of the five.

- **Base: "adjusted federal adjusted gross income" = federal AGI minus Title II Social Security
  benefits and other benefits taxable solely under IRC § 86.** Since federal AGI already carries only
  the § 86-taxable portion, AFAGI is exactly **federal AGI minus taxable Social Security**.
- **$12,000 per qualifying individual** — born after 1 Jan 1939 and having attained 65.
- **Thresholds $50,000 single / $75,000 married**, tested on **joint AFAGI regardless of filing
  status**; for MFS, on the combined AFAGI of both spouses.
- **Not indexed.** $12,000 / $50,000 / $75,000 unchanged since TY2004 (identical in the 2006
  codification).

⚠ **The worksheet mechanics matter and were not knowable from the statute alone.** The official Form
760 Age Deduction Worksheet multiplies the *count* of qualifying taxpayers by $12,000, subtracts the
excess **once**, then divides the result between spouses. **The taper is a single reduction against
the combined maximum, not $1 per spouse per $1.** Extinction points:

| | maximum | extinguished at AFAGI |
|---|---|---|
| single | $12,000 | **$62,000** |
| married, one spouse qualifying | $12,000 | **$87,000** |
| married, both qualifying | $24,000 | **$99,000** |

Two third-party guides disagree on the married figure; the worksheet settles it. Anything built
against a per-spouse taper would be wrong by a factor of two in the phase-out range.

⚠ **Two facts the app's note omits.** First, § 58.1-322.03(5)(a) gives $12,000 with **no income test**
to individuals born on or before 1 Jan 1939 — age 87+ in 2026, so **irrelevant to the app's target
household**, and it should stay unmodelled rather than be mistaken for a gap. Second, the age
deduction **cannot be combined with the Disability Income subtraction**; the model has no input for
that and should disclose rather than model it.

## 2d · Connecticut — VERIFIED, and the direction REVERSES

**CGS § 12-701(a)(20)(B)(xx)–(xxix)**, as amended by PA 23-204 § 377 and PA 23-117 § 8.

**Base: federal AGI.** Named as such throughout the OLR analysis.

**Table 1 — the pension/annuity exemption and the IRA deduction share one phase-out schedule.** Ten
rows, a percentage of qualifying income selected by an AGI band:

| federal AGI — single / MFS / HoH | federal AGI — MFJ | deduction |
|---|---|---|
| < $75,000 | < $100,000 | **100%** |
| $75,000–$77,499 | $100,000–$104,999 | 85% |
| $77,500–$79,999 | $105,000–$109,999 | 70% |
| $80,000–$82,499 | $110,000–$114,999 | 55% |
| $82,500–$84,999 | $115,000–$119,999 | 40% |
| $85,000–$87,499 | $120,000–$124,999 | 25% |
| $87,500–$89,999 | $125,000–$129,999 | 10% |
| $90,000–$94,999 | $130,000–$139,999 | 5% |
| $95,000–$99,999 | $140,000–$149,999 | 2.5% |
| > $100,000 | > $150,000 | **0%** |

⚠ **The table as published has boundary gaps** — nothing is stated for AGI of exactly $100,000
(single) or exactly $150,000 (MFJ). That is a presentation artifact of the OLR rendering, not
necessarily of the statute, and it is exactly the kind of edge the scope's §5 boundary pins exist for.
**Resolve it against the CT-1040 instructions before populating Connecticut**, not from this table.

**IRA distributions (other than Roth) complete their phase-in at 100% for TY2026** — 25% for 2024,
75% for 2025, 100% for 2026 and after. During phase-in the two factors *multiply*; the OLR worked
example is a single filer at $80,000 AGI with $50,000 of IRA distributions deducting $20,625 for
TY2025, being 75% × $50,000 × 55%. **From TY2026 the phase-in factor is 1 and only the table applies.**

⚠ **There is no age gate at all.** Connecticut conditions on income alone. `exclAge: 0` is the
existing precedent for that (Kentucky).

**Model holds** `excl65: 0`, note *"SS exempt under $75K/$100K AGI; pension/IRA exemptions
income-limited (not modeled)"*. So the model taxes **100% of a Connecticut household's pension,
401(k), 403(b), 457(b) and IRA income at a flat 5%.** In law, a Connecticut couple under $100,000 of
federal AGI pays **nothing** on any of it from TY2026.

**This is the finding that changes the scope's framing.** `SCOPE_INCOME_CONDITIONING.md` §1 concludes
that "the existing simplifications run optimistic, not conservative." That holds for the four modelled
states. **Connecticut is materially pessimistic**, and it is the largest single-state error in the
set by dollar size for a mainstream household. It is not a safe omission and should not be described
as one.

⚠ Out of scope but recorded, because it belongs to the `ss: 0.5` release: **Connecticut's `ss: 0.5`
is wrong in both directions.** Below the thresholds the state exempts **100%** of federally taxable
benefits. Above them the statute caps the taxable share at **25% of total benefits received** — a
different base from "50% of the federally taxable portion", not merely a different rate.

## 2e · Rhode Island — the TY2026 item closes on a false premise, and a shipped figure is wrong

**ADV 2025-22 (3 November 2025), read in full.** It does **not** contain TY2026 retirement thresholds.
Its TY2026 tables cover the standard deduction, personal/dependency exemptions, the phase-out range,
and the personal and fiduciary rate schedules. The Social Security and pension/401(k)/annuity
modification tables sit under a heading that reads, in the document's own words, *the following items
are for the 2025 Tax Year*, and their columns are **2024 and 2025**.

**Rhode Island publishes those figures a year in arrears.** The TY2026 pair will appear in the
November 2026 advisory, which as of 2026-09-03 has not been issued. **The ROUND4 item "RI's TY2026
indexed thresholds (ADV 2025-22) — located but never read" therefore closes as *not obtainable yet*,
not as obtained.** Reading the document was still the right move: it is what surfaced the next item.

### The two official RI publications disagree, and the statute settles it

| source | date | TY2025 single / HoH / MFS | TY2025 MFJ |
|---|---|---|---|
| **ADV 2025-22** | 3 Nov 2025 | $107,000 | **$133,750** |
| **PUB 2026-01** Retirement Income Guide | Feb 2026 | $107,000 | **$133,500** |

Both are Rhode Island Division of Taxation publications. PUB 2026-01 states $133,500 **nine times** —
its Section 1c at-a-glance table, Section 3, Section 5's preamble, and worked examples 2, 4, 5, 6, 8,
9 and 10. Being later and being the filing-season guide, it is the natural one to trust, and it is
where the project's figure came from.

**It is wrong, and the statute's own formula proves it.** R.I. Gen. Laws § 44-30-12(c)(8)(i)–(v),
reproduced in PUB 2026-01 itself, sets base-tax-year-2000 amounts of **$80,000** (single/HoH/MFS) and
**$100,000** (MFJ/QW), adjusts both by **one** cost-of-living factor, and rounds each increase **down
to the next lower multiple of $50**. Therefore:

- **TY2024 confirms the mechanism exactly.** $104,200 ÷ $80,000 = $130,250 ÷ $100,000 = **1.3025**.
- **Given the verified TY2025 single figure of $107,000**, the factor lies in [1.3375, 1.33813).
- **The implied MFJ raw increase is $33,750.00 to $33,812.50**, which rounds down to $33,750 or
  $33,800 — so the threshold is **$133,750 or $133,800**.
- **$133,500 is not admissible.** It would require the MFJ threshold to be a *smaller* multiple of the
  same factor than the single threshold.

$133,750 is both admissible and preserves the exact 1.25 ratio that TY2024 confirms. **ADV 2025-22 is
right; PUB 2026-01 carries a typo that it then repeated nine times.**

### Other Rhode Island facts newly established from the reproduced statute

- The **$50,000 is per qualifying individual**, so joint filers may claim up to **$100,000 combined**,
  each capped at that individual's own qualifying income. Confirmed in § 44-30-12(c)(9)(i)(A)–(B).
- ⚠ **If only one spouse has reached full retirement age, the modification applies only to that
  spouse's pension and annuity income.** A per-person rule, and the same rule governs the Social
  Security modification.
- ⚠ **The age test is full retirement age by birth year**, not a flat 67 — 66 for 1943–1954, rising in
  two-month steps through 1959, **67 for 1960 or later**. v5.60's `exclAge: 67` is **exactly right for
  anyone born 1960 or later** and mildly conservative for a 1955–1959 cohort, by at most ten months.
  No change is warranted; the disclosure could say so.
- **No IRA of any kind qualifies** — traditional, Roth, SEP or SIMPLE. Confirmed against the guide's
  own qualifying/non-qualifying table. The model's note is right.
- The **Social Security modification and the pension modification share one threshold table** and both
  key on **federal AGI**.
- Military service pensions are **fully exempt with no income or age test**, under a separate
  modification. The model has no concept of it. Out of scope; recorded.

---

## 3 · The income bases — three in law, **two** in the model

`stateTaxAnnual` is defined at **L1114** and receives, per the AST:

```
{ code, fallbackRate, retIncome, pen, work, capGains, ssTaxableFed, ssGrossA, ssGrossB,
  ageA, ageB, single, persons65 }
```

Reduced to those terms, the three statutory bases collapse to two expressions:

| model base | expression from the arguments already present | states |
|---|---|---|
| `agi` | `retIncome + pen + work + capGains + ssTaxableFed` | **NM, RI, CT** |
| `agiExSS` | `retIncome + pen + work + capGains` | **VA, NJ** |

**They differ by exactly one argument the function already receives.** This is the single most
important correction the completed audit makes to the PARTIAL draft: "per-state base selection" reads
as five bespoke measures and is in fact a one-term switch.

**Where `agiExSS` is an approximation, and how large.** For Virginia it is not an approximation at
all — AFAGI *is* federal AGI minus § 86-taxable benefits, exactly. For New Jersey it is: NJ gross
income is built from NJ's own income categories, disallows federal above-the-line deductions, and
taxes some interest federal AGI excludes. **For a mainstream retired household of pension, 401(k),
Social Security and capital gains the two agree**, and qualified Roth distributions are outside both.
The residual divergence should be **disclosed in New Jersey's note, not modelled**.

**What neither base can see.** The model carries no dividend or interest term inside
`stateTaxAnnual`. Any household whose state income is materially dividend- or interest-driven will sit
lower on the band table than it should — an **optimistic** direction, and it must be disclosed as
such rather than left implicit.

---

## 4 · The shapes — **two**, times three orthogonal attributes

The PARTIAL draft counted four shapes. Reading all five statutes, the count is two:

| shape | expresses | states |
|---|---|---|
| **`bands`** — ordered rows, each carrying **either** a dollar `amount` **or** a `pct` of qualifying income | NM (9 amount rows), RI (2 amount rows — a cliff), CT (10 pct rows), **NJ (1 amount row + 2 pct rows + zero)** | NM, RI, CT, NJ |
| **`taper`** — `max(0, perPerson × qualifying − max(0, measure − threshold))` | VA | VA |

**Allowing a row to carry either an amount or a percentage expresses New Jersey's mixed table for
free**, which is what dissolves the draft's fourth shape. Only Virginia's continuous $1-for-$1 taper
resists the band form, and only because expressing it as steps would need twelve thousand rows.

**Three attributes are orthogonal to shape, and confusing them for shape is what produced the count
of four:**

| attribute | values | why NJ looked unique |
|---|---|---|
| `base` | `agi` · `agiExSS` | NJ is `agiExSS` |
| `unit` | `person` · `household` | NJ is the only **household** cap; NM, RI, VA are per person; CT is per return |
| age gate | existing `exclAge` | NJ is **62**; CT has **none** (`exclAge: 0`, the Kentucky precedent) |

**New Jersey is still the hardest state in the set** — but because three attributes differ at once,
not because it needs a bespoke shape.

**Every threshold is per filing status.** The model carries only a `single` boolean — no MFS, no head
of household. Two columns therefore suffice, and the MFS and HoH figures must be **disclosed as
unmodelled** rather than silently folded into one of the two.

---

## 5 · What the SUITE says about the field's shape — run, not reasoned

The scope's D-3 requires the whole-table assertions to be checked **before** building. Done, and the
answer is decisive.

`STATE_RULES` carries **51 entries**, six fields on every one (`name`, `rate`, `ss`, `retExempt`,
`excl65`, `note`) and **two optional fields already**: `exclAge` on **4** states (DE, KY, RI, WI) and
`ssOffset` on **2** (ME, MD). ⚠ **`ssOffset` is a stronger precedent than the scope credits**: it does
not carry data, it *selects behaviour* inside `_one` at L1145–1148, which is precisely what a shape
discriminator does.

**The constraint.** `t10` §2E's whole-table note-vs-code guard reads:

```js
if (r.excl65 > 0 && !/\$\d/.test(n)) exclOK++;
```

and `t29`'s F-6 empty-set guard reads `(r.excl65 || 0) > 0`. Executed this session:

```
excl65 as array  > 0 : false
excl65 as object > 0 : false
excl65 as number > 0 : true
```

⚠ **If a band table replaces `excl65`, every converted state silently drops out of both guards** — a
vacuous pass, on exactly the states the release changes, in the two checks that exist to catch this
class. F-6 is described in its own comment as "the one that would have failed quietly."

**Therefore the new field must be ADDITIVE**, with `excl65` remaining a scalar, matching the
`exclAge` and `ssOffset` precedent. This is not a stylistic preference; it is the difference between
a green suite that means something and one that does not.

---

## 6 · Effect on the seven decisions

| decision | status after the completed ROUND5 |
|---|---|
| **D-1** measure computed inside `stateTaxAnnual` | **stands, and is now cheap.** Both bases are expressions over arguments the function already receives; no new plumbing at any of the three call sites |
| **D-2** one income base | **FAILS — re-decide.** Not five bases: **two**, differing by `ssTaxableFed`. See `SCOPE_INCOME_CONDITIONING.md` §7 |
| **D-3** `{ upTo, amount }` bands | **INSUFFICIENT — re-decide.** Needs `{ upTo, amount \| pct }` rows plus a `taper` kind, and must be **additive** to `excl65` per §5 |
| **D-4** design for SS later | **stands.** CT's SS rule is a percentage-by-AGI-band — the same `bands` shape, so the field will carry it |
| **D-5** contain the MAGI divergence | **stands.** Both bases are self-contained inside `stateTaxAnnual`; no existing MAGI is reused |
| **D-6** no output change until populated | **stands, and matters more.** NJ needs four dimensions at once and CT reverses direction — both must be able to land independently |
| **D-7** audit first | **vindicated twice over.** The build would have been written against a per-spouse Virginia taper, a capped New Jersey percentage tier, and a wrong Rhode Island figure |

---

## 7 · What remains NOT established

- **Connecticut's exact band boundaries at $100,000 (single) and $150,000 (MFJ).** The published table
  has a gap at those two points. Resolve against the CT-1040 instructions before populating CT.
- **New Mexico's interaction with its graduated rate schedule** — carried unresolved from ROUND4 §3
  and still open. It was outside this round's remit (bases and thresholds).
- **Rhode Island's TY2026 thresholds** — not published yet; expected November 2026.
- **How often each threshold binds** for the households the app models. Unchanged: the scope's §6
  measurement still needs the income measure to exist first.
- **The nine of nineteen exclusion states still unchecked.** A different problem — unverified rather
  than misdirected — and out of scope here.

---

## 8 · DEFECT — Rhode Island's TY2025 MFJ threshold, shipped

**Severity: disclosure only. No computed output changes** — the cliff is not modelled, so the figure
is never read by any code path. But it ships to users in the app's own note.

**Sites.** Counted by the AST for code, by literal search for prose (a prose search, not a census):

| where | occurrences | notes |
|---|---|---|
| `STATE_RULES.RI.note`, v5.60 source | **1** | user-facing; parser-confirmed |
| built `index.html` | **1** | so the live site carries it |
| `DangerClose-v5_59.jsx` | 1 | **frozen prior leg — do not edit** |
| `AUDIT_STATE_EXCL65_ROUND4.md` | 3 | |
| `CHANGELOG.md` | 2 | historical entries |
| `METHODOLOGY.md` | 1 | |
| `MissingFeatures.md` | 1 | |
| `SCOPE_EXCL65_STALE_RI_WI.md` | 1 | |
| `SCOPE_INCOME_CONDITIONING.md` | 1 | corrected in this session's update |

**9 prose occurrences across 6 documents, plus the shipped source.** `$133,750` appears nowhere.

> **Correction to this session's own first report.** An earlier statement in chat gave this as "eight
> places", conflating files with occurrences and omitting the built artifact. The counts above are the
> ones a command printed.

**Remedy.** Change the note's figure to **$133,750** and say why in one clause, because a user checking
the app against Rhode Island's own TY2025 guide will find $133,500 and think the app wrong. Suggested
disclosure: *TY2025: $133,750 MFJ / $107,000 single per ADV 2025-22 — RI's own filing-season guide
prints $133,500, which the statute's indexing formula does not admit.*

⚠ **This touches the shipped source, so it is a version bump and four in-app version sites.** Whether
it rides with the ROUND5 document commit or waits for the income-conditioning field is a release-
attribution judgement for the maintainer, not one this audit should make. **Historical CHANGELOG
entries should NOT be rewritten** — they were true as published; the correction belongs in the new
entry.

---

*Destination: `docs/AUDIT_STATE_INCOME_BASES_ROUND5.md` in the repo, and the knowledge pool —
replacing the PARTIAL copy in both.*
