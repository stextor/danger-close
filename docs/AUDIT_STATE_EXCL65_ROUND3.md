# AUDIT — the income-limited 65+ exclusion class, verified against statute (ROUND 3)

| Field | Value |
|---|---|
| Build audited | **v5.57** · source `0daebb4af466b9095db79117daefcd32` · tree `742f77d` |
| Baseline at audit | 2,858 app checks, 0 failing · parity 10/10 (recomputed from suite output) |
| Date | 2026-09-01 |
| Shape | **FINDINGS ONLY. Nothing fixed, no source change, no figure moves.** |
| Predecessors | `AUDIT_STATE_EXCL65_NOTES.md` (6 of 19 states), `AUDIT_STATE_EXCL65_ROUND2.md` (KY/DE) |

---

## 0. Why this exists, and the headline

A session brief proposed one scope covering **Maine, New Jersey, Virginia and Rhode Island** on the
premise that all four limit their 65+ retirement exclusion by income, that the model applies all four
unconditionally, and that this is **one shared mechanism**.

Executed against v5.57 and checked against the enacting statutes, **that premise does not hold on any
of its three clauses.** Maine is not in the class. Two states the brief omits are. And the surviving
members do not share a mechanism.

**This document does not propose a scope.** It establishes which states are actually in the class and
what their statutes say, so that the grouping decision — which remains the maintainer's — can be made
on verified facts rather than on the model's own note strings.

## 1. Method, and the one thing that made the difference

Two rules from `OPERATIONS.md` did the work here.

**§B1a — a grep cannot execute a regex.** The class is defined operationally by
`t29_boundaries.mjs` L212, `/income[- ]limited|income limit/i` over `STATE_RULES` entries with
`excl65 > 0`. That matcher was *executed* against v5.57 rather than read:

```
F-6 guarded set at v5.57: 5 members
   NJ  NM  RI  VA  WI
```

**§A0 / the ROUND2 lesson — the enacting act is reliable, the revenue-department summary page is
not.** Every statutory claim below is sourced to the code section or the session law. Where a
department publication is cited it is corroborating, never load-bearing.

⚠ **The trap this round nearly fell into.** The class list in `MissingFeatures.md` D-3c
(*"VA, RI, NM, WI, ME … by their own notes"*) is explicitly derived from the model's `note` strings —
that is, from the model's own account of the law. So is the F-6 matcher, which reads the same notes.
**Both instruments measure the model, not the statute.** A state whose note is wrong is invisible to
both, in either direction. That is exactly what was found for Wisconsin and Virginia.

## 2. Per-state findings

### 2a · Virginia — the modelled income thresholds are WRONG, and wrong optimistically

Modelled: `excl65: 12000`, note *"$12K 65+ age deduction (income-limited above ~$75K/$150K;
approximated as unconditional)"*.

**Statute — Va. Code § 58.1-322.03(5):** the $12,000 age deduction for individuals born after
1 January 1939 who have attained 65 is reduced **$1 for every $1** that adjusted federal adjusted
gross income exceeds **$50,000 single / $75,000 married**.

| | model note says | statute says |
|---|---|---|
| single threshold | ~$75,000 | **$50,000** |
| married threshold | ~$150,000 | **$75,000** |

**The note overstates both thresholds — by $25,000 single and $75,000 married.** A reader of the
in-app note is told the limit bites far later than it does, which compounds the underlying
unconditional-application defect rather than mitigating it. Both errors run the same way: the model
under-taxes.

Two structural details the current `excl65` mechanism cannot express:

- **The reduction is a continuous dollar-for-dollar taper**, not a band or a cliff.
- **The income measure excludes Social Security.** "Adjusted FAGI" is federal AGI *minus* benefits
  taxed under IRC §86. A Virginia household's exclusion therefore depends on an income figure the
  model would have to construct specially.

⚠ **Not resolved here:** whether, for a couple where both spouses claim $12,000, the reduction
applies once against the combined $24,000 or separately to each $12,000. Secondary sources disagree
about where the deduction reaches zero for a couple. **No dollar-exact Virginia figure should be
asserted until this is settled against Schedule ADJ.** Flagged rather than guessed.

*(Also noted, immaterial for a mainstream household in 2026: those born on or before 1 January 1939
take the $12,000 with no income test at all. Such a person is 87+.)*

### 2b · Wisconsin — the modelled provision is SUPERSEDED, and the error runs CONSERVATIVE

Modelled: `excl65: 5000`, note *"$5K retirement exclusion (income-limited)"*.

**Statute — Wis. Stat. § 71.05(6)(b)54m., created by 2025 Wis. Act 15 and amended by 2025 Wis.
Act 174:** for taxable years beginning after 31 December 2024, an individual **aged 67 or older** may
subtract up to **$24,000** of payments or distributions from a qualified retirement plan or IRA;
married joint filers where **both** spouses are 67+ may subtract up to **$48,000**. Railroad
retirement is excluded. **There is no income limit and no phase-out on this subtraction.** Act 174's
amendments to the same subdivision are technical — renumbering `54mn` to `54m.e` and repairing
cross-references — and do not disturb the figures.

The $5,000 subtraction the model carries is the *older* provision (65+, federal AGI under $15,000
single / $30,000 married). It still exists, but a taxpayer claims one subtraction or the other, and a
67+ retiree in 2026 with meaningful retirement income will take the larger one.

**Consequences, and they matter for scoping:**

1. The model is **stale by a full legislative cycle** — it models a provision superseded for the tax
   years the app projects.
2. The error runs the **conservative** direction. The model grants $5,000 where the statute allows
   $24,000, so it **over-states** Wisconsin tax. This is the opposite of D-3c's defining direction.
3. The age threshold is **67**, which `excl65 × persons65` cannot express any more than it can
   express Kentucky's absent age test or Delaware's 60.

**Wisconsin is in the F-6 guarded set only because its note says "income-limited."** On the statute
it is not an optimistic-direction income-limit defect at all. It is a staleness defect pointing the
other way, and it does not belong in a D-3c scope.

### 2c · New Jersey — the shipped analysis HOLDS against the enacting act

`t10_taxcases.mjs` §2E carries a dollar-exact NJ case whose cited sources are Division of Taxation
pages — the source class ROUND2 found unreliable for Kentucky and Delaware. It was therefore
re-checked against the session law.

**Statute — N.J.S.A. 54A:6-15 as amended by P.L. 2021 c.129 (A5539):** for taxpayers 62 or older,
the pension and retirement income exclusion phases by gross income —

| gross income | MFJ | single |
|---|---|---|
| ≤ $100,000 | 100% | 100% |
| $100,001–$125,000 | **50%** | 37.5% |
| $125,001–$150,000 | **25%** | 18.75% |
| above $150,000 | **0% — hard cliff** | 0% |

**The MFJ percentages t10 asserts are correct, and so is its reading that the percentage applies to
the retirement income rather than to the cap.** The sourcing was riskier than it needed to be; the
conclusion is sound. No correction required.

Two things the statute carries that the model does not, both already disclosed in the NJ note:
the **age floor is 62**, and the **cap is a household $100,000 MFJ**, not $75,000 per person. The
single-filer percentages (37.5% / 18.75%) differ from the MFJ ones and appear nowhere in the suite.

### 2d · Maine — not a member of this class

`ME` carries `ssOffset: true`. Its exclusion is reduced dollar-for-dollar by Social Security received,
**modelled since v5.56** and asserted dollar-exact at `t10_taxcases.mjs` L710–737. Its note contains
no income-limit language, so the F-6 matcher does not select it, correctly.

What remains unmodelled for Maine is a **separate income phaseout above $125,000 single /
$250,000 MFJ**, disclosed in its own note. That is a distinct item at a distinct threshold from
anything in §2a–2c and should not be bundled with them.

⚠ **The Maine phaseout figures were not verified this round.** They are the model's own claim about
the statute and carry the same warning as every other note in §1.

## 3. What was NOT verified — stated plainly

- **New Mexico** and **Rhode Island.** Both are in the F-6 guarded set. Both also carry `ss: 0.5`,
  so their exclusions interact with partial Social Security taxation — a second axis the other
  members do not have. **Neither statute was read.** Any claim about them in this document's §4 is a
  structural inference from `STATE_RULES`, not a verified fact.
- **Maine's $125K/$250K phaseout** (§2d).
- **Virginia's married-couple taper endpoint** (§2a).
- The **11 states** ROUND2 lists as unchecked remain unchecked. This round added VA, WI and NJ to the
  verified set and did not touch the rest.

## 4. The finding that changes the size of the job

The class is not one mechanism. On verified statute, the two surviving optimistic-direction members
differ in shape:

| | Virginia | New Jersey |
|---|---|---|
| form of limit | continuous $1-for-$1 taper | stepped percentage bands + cliff |
| applies to | per-person deduction | household cap |
| income measure | AFAGI, **Social Security excluded** | gross income |
| age | 65 | 62 |

`stateTaxAnnual` computes the exclusion from `excl65` (a scalar) and `persons65` (a count), with the
v5.56 `ssOffset` flag as the sole conditional. **That data model cannot express any of the following**,
each of which is required by at least one verified state: an income taper; stepped bands; a hard
cliff; a household rather than per-person cap; an age threshold other than 65; or an income measure
that excludes Social Security.

**So this is a data-model change, not a formula tweak.** Any scope that treats it as "add an income
test to the exclusion" has mis-priced the work. The plausible shape is a per-state rule descriptor —
which is a larger and more consequential change than the brief's framing implies, and one that
touches every engine through `STATE_RULES`. Parity 10/10 is the guardrail.

## 5. Corrections owed to existing documents

Recorded here rather than made, because this document changes nothing.

| Where | What is wrong | Direction |
|---|---|---|
| `STATE_RULES.VA.note` | thresholds stated as ~$75K/$150K; statute says $50K/$75K | user-facing, optimistic |
| `STATE_RULES.WI` | models a superseded $5,000 provision; current law is $24,000/$48,000 at 67+, no income limit | user-facing, conservative |
| `t10_taxcases.mjs` L511–513 | comment says the SS-reduction mechanism for MD/ME/CO is *"Nothing in this project models it"*; v5.56 modelled MD and ME, and the same file asserts it at L710–737 | internal, misleads scoping |
| `MissingFeatures.md` D-3c | class list derived from note strings; includes WI, which runs the other way | internal, mis-scopes |
| `SCOPE_STATE_FIXTURES.md` | status reads *"awaiting decisions — do not build yet"*; its census rows and two of three fixtures are built, and D1/D2/D3 are resolved in the built artefacts | internal, risks duplicate work |

## 6. Open decisions for the maintainer

**D-A · Class membership.** On verified evidence the optimistic-direction income-limited class is
**New Jersey and Virginia**. Wisconsin is out (§2b), Maine is out (§2d), and New Mexico and Rhode
Island are **unknown until read**. *Recommendation: verify NM and RI before fixing the grouping, since
both carry `ss: 0.5` and may form a second group rather than joining the first.*

**D-B · Does Wisconsin get its own fix, and when?** It is a real user-facing error at a real dollar
size, but it runs conservative, so it is not urgent by this project's own direction rule.
*Recommendation: correct the WI note and figure as disclosure work, separately from D-3c, and do not
let it ride along in a scope whose premise is the opposite direction.*

**D-C · Does the Virginia note get corrected ahead of the fix?** The thresholds are wrong today and
the correction is independent of any modelling change. *Recommendation: yes — same treatment as the
v5.54 disclosure route, no figure moves.*

**D-D · Does the D-3c fix wait for the fixture work?** `SCOPE_STATE_FIXTURES.md` §4 forbids shipping
the fix in the release that builds its measuring instrument. Most of that instrument now exists.
*Recommendation: re-verify and retire that scope against v5.57 first, so the ordering constraint is
discharged on the record rather than assumed.* No recommendation offered on whether the fix then
lands as one release or two — that depends on D-A.

## 7. Correction to this session's own earlier advice

An earlier message in the session that produced this document recommended scoping **NJ, VA and WI**
together as one income-limit group, with NM and RI held back. **That recommendation was derived from
the model's `note` strings and it was wrong about Wisconsin** — §2b falsifies it against the statute.
It is recorded here because a recommendation that has been superseded is exactly the kind of thing
that survives in a chat log and gets acted on later.

---

**Sources.** Va. Code § 58.1-322.03(5) (law.lis.virginia.gov); Virginia Tax ruling 22-19
(corroborating, on the AFAGI definition). Wis. Stat. § 71.05(6)(b)54m., 2025 Wis. Act 15 and
2025 Wis. Act 174 (docs.legis.wisconsin.gov); Wisconsin DOR Pub. 126 and Pub. 106 (corroborating).
N.J.S.A. 54A:6-15 as amended by P.L. 2021 c.129 / A5539 (pub.njleg.gov). All code and suite facts
were printed by commands against the v5.57 tree at `742f77d` in the session dated above.
