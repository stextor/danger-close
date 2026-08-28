# AUDIT — the 65+ exclusion notes against primary sources

| Field | Value |
|---|---|
| Verified against | **v5.53** · source `12a007ed8e57a391acba67b799eb5a2f` · tree `74497fd` |
| Written | 2026-08-28 |
| Origin | `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md` §7 D3-d — NJ's `note` is wrong, and nothing had checked the class |
| Shape | **Findings only. No source change. No scope. No decisions taken.** |
| Coverage | **6 of 19** states with `excl65 > 0`. **13 unchecked.** See §5 |

---

## 0 · The headline, and it is not the one this audit was commissioned to find

The question was *"is NJ's wrong note a one-state bug or a class?"* It is a class. **Four of the six
states checked misstate their own law to the user.**

But the more consequential finding is that **the D-3c class is mis-specified.** D-3c is defined as
*"income-limited in law, applied unconditionally."* Of the four defective states found, **only New
Jersey is income-limited.** The other three — Maryland, Maine, Colorado — reduce the exclusion by
**Social Security received**, which is a different mechanism entirely and one that no scope, census
row, fixture or test in this project currently describes.

`boundaries.mjs`'s `state_excl_limited` row keys on *"a note flagging an income limit."* It reads ON
for NJ. **It would read OFF for MD, ME and CO — the states where the defect is arguably worse**,
because a Social Security offset bites every retiree who has Social Security, which is most of them,
whereas an income limit bites only above a threshold.

> **The pattern this project already has a name for.** A gate that cannot see the thing it gates
> reports green either way. The census row was built from the one example anybody had looked at, and
> it encodes that example's mechanism as though it were the category.

## 1 · What the user is actually shown

The `note` is not an internal comment. `DangerClose.jsx` **L12103** renders it live in the state
selector, next to a second sentence generated from `excl65` itself:

```
2026 approx: 5.50% effective · $75K/person 65+ exclusion · SS not taxed
  — retirement-income exclusion up to $75K/person — INCOME-LIMITED (~$150K);
    approximated as unconditional. Verify against your state's rules.
```

Two independent problems:

1. **The note** is hand-written prose about the law, and can be wrong about the law.
2. **The `· $XK/person 65+ exclusion` clause is generated from the model's own parameter** and
   asserts it as a legal fact. For New Jersey it says *"$75K/person"* when NJ has **no per-person
   exclusion at all**. This clause fires for **all 19** states with `excl65 > 0`, and correcting a
   note does not touch it — a corrected NJ note would sit beside a generated clause contradicting it.

The trailing *"Verify against your state's rules"* is a real mitigation and should be said out loud
in its favour. It is not a licence to state the rules wrongly.

## 2 · Verified — 6 states

Each figure below is from the state's own revenue authority. Secondary sites were used only to
locate the primary page.

### ✗ New Jersey — WRONG in four ways

**Source:** NJ Division of Taxation, *Retirement Income Exclusions*, `njit7.shtml`, updated
**12/03/25**; confirmed for 2026 by the **2026 Form NJ-1040-ES** instructions.

| Model says | NJ law |
|---|---|
| `$75K/person`, doubled via `persons65` → **$150,000** for a couple | **$100,000 for the HOUSEHOLD** (MFJ). $75,000 is the **single** figure. Not per-person |
| gates on **65** | gates on **62** |
| *"INCOME-LIMITED (~$150K)"* | full below $100,000; **50% of taxable pension** $100,001–$125,000; **25%** $125,001–$150,000; **zero** above |

Dollar-exact at $200,000 of retirement income, 65+ MFJ: model **$2,750** against **$8,442.70**.
Full derivation in `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md` §4.

### ✗ Maryland — WRONG: stale figure, and the dominant mechanism is undisclosed

**Source:** Comptroller of Maryland, *Maryland Pension Exclusion* (KB0010012); Worksheet 13A.

| Model says | MD law |
|---|---|
| `excl65: 36200` | **$41,200** for CY2025, **$40,600 for CY2026** — stale by ~$4,400 |
| unconditional | **reduced dollar-for-dollar by all Social Security and Railroad Retirement benefits received.** If SS exceeds the cap, the exclusion is **zero** |
| *"traditional IRA excluded from the exclusion — not modeled"* | correct, and correctly disclosed — credit where due |

The Social Security offset is the dominant effect and the note does not mention it. A Maryland
couple each receiving $40,000 of Social Security has a real exclusion near **$0**; the model grants
them **$72,400**.

### ✗ Maine — WRONG: stale figure, SS offset, and a phaseout added in 2025

**Source:** Maine Revenue Services, *Individual Income Tax FAQ*, `maine.gov/revenue/faq`; 2025
Form 1040ME instructions.

| Model says | ME law |
|---|---|
| `excl65: 35000`, *"≈ SS max (~$35K+, indexed); approximated"* | **$48,216** for TY2025. The *mechanism* in the note is right — it is indexed to the SS full-retirement-age maximum — but the value is stale |
| unconditional | **reduced dollar-for-dollar by all taxable and nontaxable SS and Railroad Retirement benefits.** Above $48,216 of SS, no deduction at all |
| — | **NEW for tax years from 2025: an income phaseout** above $125,000 single / $250,000 MFJ federal AGI |

⚠ **Maine's error direction is mixed**, which makes it the least safe of the four to reason about
casually: the stale $35,000 *under*-excludes (pessimistic), while ignoring the SS offset
*over*-excludes (optimistic). Which dominates depends on the household.

### ✗ Colorado — WRONG: the note presents one shared cap as two separate benefits

**Source:** Colorado DOR, *Income Tax Topics: Social Security, Pensions and Annuities*, and
*Information for Retirees*, `tax.colorado.gov`.

The `$24,000` figure and the per-person doubling are both **correct** — *"in the case of joint
filers, the subtraction is allowed separately to each taxpayer."* The defect is the interaction:

> The $24,000 is **one cap covering Social Security AND pension/annuity income together.** Any
> subtraction claimed for Social Security reduces what remains for pension income. For 65+ there is
> an exception — if federally-taxed SS *exceeds* $24,000 it may be subtracted in full — but that
> leaves no room for pension income either way.

The model's note reads *"65+ may deduct all federally-taxed SS (approximated); $24K pension/annuity
exclusion 65+"* — two clauses joined by a semicolon, which reads as two stacking benefits. They do
not stack. **Any Colorado retiree with Social Security has less than $24,000 of pension room.**

### ✓ Georgia — CORRECT

**Source:** `dor.georgia.gov/retirement-income-exclusion`. $65,000 at 65+ ($35,000 at 62–64), and
*"for married couples filing joint returns with both members receiving retirement income, the maximum
adjustment may be up to twice the individual exclusion amount."* Per-person doubling is right, and
there is no income limit. The note is accurate.

*Two non-defects worth recording so nobody re-derives them.* GA's exclusion also covers interest,
dividends, capital gains and rents; the model applies `excl65` only to `retIncome + pen`, so it
**under**-excludes — the conservative direction. And GA's flat rate has been stepping down; the
model's **5.19%** was not verified here and is listed in §5 as unchecked.

### ✓ New York — CORRECT

Already hand-verified in `AUDIT_D3_STATE_TAX_DIRECTION.md` against **Form IT-2105-I, 2026**:
$20,000 per person at 59½+. The note is accurate. That audit's *other* finding — the flat-rate
approximation over-taxes NY by 54% at $120,000 — is a separate, disclosed limitation and is not
revisited here.

## 3 · What this changes

**The mechanism, not just the count.** Three defect shapes are now evidenced, and the project models
none of them:

| Shape | States found | Modelled? | Census row sees it? |
|---|---|---|---|
| Income-limited / phased down | NJ *(ME, from 2025)* | no — applied unconditionally | **yes** — `state_excl_limited` |
| **Social Security offset** | **MD, ME, CO** | **no** | **NO — invisible** |
| Stale statutory figure | MD, ME | n/a — it is just wrong | no |

**The direction is not uniformly optimistic.** The project's working assumption for D-3c has been
that unconditional application over-excludes and therefore understates state tax — true for NJ, MD
and CO. **Maine breaks it**, because its stale figure errs the other way. Any disclosure written for
this class must not claim a single direction.

**A note can be right about mechanism and wrong about value** (Maine), or right about every value and
wrong about how two values interact (Colorado). A check that only asks *"does the note name a
figure?"* — which is what `t10` §2E's note scan asks — passes all four defective states.

## 4 · What this does NOT establish

- **Nothing about the 13 unchecked states.** 4-of-6 is not a rate to extrapolate from; GA and NY
  passing cleanly shows the notes are not uniformly bad.
- **Nothing about the rate figures.** Only exclusions were checked. Every `rate` in `STATE_RULES`,
  including GA's stepping-down 5.19%, is unverified by this audit.
- **Nothing about `retExempt` or `ss` states.** Out of scope; `excl65 > 0` was the frame.
- **No fix is proposed here, and none should be inferred.** Notably, correcting NJ's note alone
  would now be *worse* than leaving it: it would signal that the module had been reviewed.

## 5 · Coverage — the 13 not checked

`AL $6,000` · `AR $6,000` · `DE $12,500` · `KY $31,110` · `LA $6,000` · `MT $5,500` · `NM $8,000` ·
`OK $10,000` · `RI $20,000` · `SC $15,000` · `VA $12,000` · `WV $8,000` · `WI $5,000`

Four of these already flag a limit in their own notes (NM, RI, VA, WV, WI — five, in fact), which
makes them *more* likely to be partially right and no less likely to be wrong in detail, as NJ was.
**KY at $31,110 is the largest unchecked exposure** and should go first if this continues.

⚠ **This audit stops here because the session budget does, not because the question is answered.**
Six states took the primary-source work they took; thirteen more is more than remained. A partial
audit stated as partial is the deliverable; a thin pass over nineteen would not have been.
