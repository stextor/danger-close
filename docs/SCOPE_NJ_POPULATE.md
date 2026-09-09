# SCOPE — populate New Jersey (§ 54A:6-10) into `exclTest`

| | |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v5.67, 2026-09-08.** Written and built the same day; all four decisions in §6 resolved and built as resolved. §8 is the build record. *(Prior: APPROVED AND BUILDABLE, NOT BUILT.)* |
| Premise verified against | shipped **v5.66**, source `31b43e094307ef5f996570c090478e13`, tree `0fc82c5`, pool 119 files. Re-measured this session, not carried from the parent scope |
| Parent | `SCOPE_INCOME_CONDITIONING.md` §8 step 4 — *"populate one state per release."* CT shipped v5.65, NM v5.66. **NJ is the third of five; RI and VA remain after it** |
| Statutory oracle | `FINDINGS-v5_63-state-statutes.md` §4 — N.J.S.A. § 54A:6-10, read against the chaptered P.L. 2021 c.129 text 2026-09-04. **The build encodes that table and does not re-derive it** |
| Direction | ⚠ **A user-visible figure moves, and one of the two moves is OPTIMISTIC.** See §4 |
| Kind | Rule-table populate. **No evaluator change** — see §3 |

## 1 · The premise, verified against the shipped source

`STATE_RULES.NJ` at v5.66, dumped by AST rather than read off a document:

```
NJ: { name: "New Jersey", rate: 0.055, ss: 0, retExempt: false, excl65: 75000,
      note: "$100,000 (2026) HOUSEHOLD exclusion at 62+, not per-person — income-limited: …
             the model applies $75K/person unconditionally from 65 — overstates the exclusion.
             The 62 floor is NOT modelled: applying it alone would grant a 62-64 couple $150K
             against a $100K household cap, making the estimate worse" }
```

No `exclTest`, no `exclAge`. So today NJ grants **$75,000 per person from 65, unconditionally**.

### 1a · Sized

For MFJ, both 65+, with NJ gross income above $150,000 — where the statute allows **nothing**:

| | model excludes | statute allows | NJ tax understated |
|---|---|---|---|
| MFJ, both 65+, over $150,000 | **$150,000** | **$0** | **$8,250/yr** at 5.5% |

**The largest remaining single-state error in the app**, and larger than RI ($5,000) and VA ($1,380)
combined. That is why NJ goes before them.

## 2 · The statute, transcribed from the oracle — NOT re-derived

Percentages are **of the payments received**, not of income. Age gate **62**, or disabled under the
federal Social Security Act. **Never indexed** — every change came by amendment. Comparator
**inclusive** (*"not more than"*), which is `cmp`'s `lte` default, so **no `cmp` key** (B-2).

| NJ gross income | MFJ | single |
|---|---|---|
| not more than $100,000 | up to **$100,000** | up to **$75,000** |
| over $100,000, not more than $125,000 | **50%** | **37.5%** |
| over $125,000, not more than $150,000 | **25%** | **18.75%** |
| over $150,000 | none | none |

⚠ **MFS has its own column** ($50,000 / 25% / 12.5%) and **is not modelled**, because the app models
single and joint only. Disclose; do not let MFS be assumed to track single.

## 3 · The encoding — and why the evaluator needs NO change

Read from `_fromTest` at v5.66, not assumed. **It already anticipates New Jersey by name**, in three
separate places:

- `base: "agiExSS"` — the comment reads *"VA, NJ … Virginia's AFAGI exactly; New Jersey's gross
  income approximately."*
- `kind: "bands"` — *"Expresses … **New Jersey's MIXED table for free** (1 amount row + 2 pct rows +
  zero)."* A row carries **either** an `amount` **or** a `pct`; NJ needs exactly that mix.
- `unit: "household"` — *"applies the row ONCE for the return (**New Jersey's household cap**, and
  Connecticut …)."*

So the build is a `STATE_RULES` edit. ⚠ **Verify this by re-reading `_fromTest` at build time rather
than trusting this section** — the parent scope's own status line was two releases stale when this
one was written (§6, D-NJ-3).

An `amount` row can exceed the household's actual payments; that is harmless, because
`retBase = max(0, retIncome + pen − exclFinal)` clamps it. Same mechanic as New Mexico's rows.

## 4 · ⚠ Two figures move, and they move in OPPOSITE directions

**Pessimistic correction (the main fix).** Households above $100,000 of NJ gross income lose an
exclusion the statute does not grant them. Up to $8,250/yr more NJ tax. This is the release's point.

**Optimistic correction (the 62 floor, D-NJ-1).** Households aged 62–64 gain an exclusion the model
currently withholds. **This makes one output look better**, and it is the first populate release to
do so.

⚠ **Both must be disclosed in the CHANGELOG entry and in the in-app note.** A release that reports
only the pessimistic half would be describing itself inaccurately, and the app's identity is that it
reports what the model computes.

## 5 · Tests this ships with

**One case per tier is mandatory, not thorough** — the oracle says so explicitly, and §5 of the
parent scope requires it. Hand-verified to the dollar means computed independently and compared to
engine output; reading the code and judging it plausible does not count.

1. **Tier 1** — gross ≤ $100,000, MFJ. Full payments excluded.
2. **Tier 2** — gross $100,001–$125,000, MFJ, **payments materially ≠ $100,000**. See the pin below.
3. **Tier 3** — gross $125,001–$150,000, MFJ.
4. **Tier 4** — gross > $150,000, MFJ. **Zero.** This is the $8,250 case.
5. **Single**, at least one tier, since the single column is a different set of numbers.
6. **Boundary cases at exactly $100,000, $125,000 and $150,000** — inclusive, so each belongs to the
   tier *below*. `t29_boundaries.mjs` is the existing home for this.
7. **A 62–64 household** — the D-NJ-1 case. Currently zero, must become the tier amount.
8. **A 65+ household unchanged in tier 1**, so the age change is shown not to disturb it.

### ⚠ Two extinction pins, each for a defect that would otherwise pass

**E-NJ-1 · the percentage is of PAYMENTS, not of the cap.** A `0.5 × $100,000 = $50,000`
implementation returns the right answer whenever payments happen to be $100,000 and the wrong one
otherwise. **Test 2 must use payments that are not $100,000** and assert the product of the
payments. This is why a cap-then-percentage implementation *"would still pass a tier-1 test."*

**E-NJ-2 · `unit: "household"`, not per person.** A per-person reading doubles the exclusion for a
couple. Assert an MFJ tier-1 result equal to the **single** household figure, not twice it.

### The `_qual` fallback, and why NJ fails safe where Rhode Island would not

`_qual` falls back to `persons65` when a caller supplies no ages. `_floor` becomes **62** here, so a
caller using the fallback **undercounts** — it misses a 62–64 person and grants nothing. That is the
**conservative** direction, so a missed call site fails safe. ⚠ **Rhode Island will be the opposite**
(floor 67, fallback grants from 65 — optimistic), so this reasoning must not be reused there.

The source comment claims *"every call site in this file supplies them."* **That is a comment, not a
measurement — re-derive it with a parser at build time** (§B1), for all three call sites.

## 6 · Decisions — ALL RESOLVED 2026-09-08

**D-NJ-1 · Model the 62 age floor in this release? → YES.** *(Steve deferred the call; taken here,
with the cost stated.)* The floor's shipped reason for being unmodelled — *"applying it alone would
grant a 62-64 couple $150K against a $100K household cap"* — is an argument about the **broken** cap,
and it **expires the moment the tiers are right**. Keeping 65 would mean writing a new justification
that does not exist. The design default of choosing the conservative direction governs when an
assumption *must* be picked; this is a primary-source rule, not an assumption. A couple retiring at
62 is squarely inside the drawdown frame. ⚠ **Cost, stated plainly: this moves one figure in the
optimistic direction** (§4), and §5 test 7 is what holds it honest.

**D-NJ-2 · The dollar caps that provably cannot bind → ENCODE FAITHFULLY, with an extinction test.**
Tier 1 is a real `amount` row. The percentage tiers carry **no cap in the statute**, so faithful
encoding is `1 amount + 2 pct + zero` — which is exactly what `_fromTest` supports, so **no
evaluator change is needed to honour this decision**. The caps' unreachability (payments ≤ gross ≤
$150,000, so 50% × $150,000 = $75,000 < $100,000) is documented in the rule comment and pinned by
**E-NJ-1**.

**D-NJ-3 · The parent scope's stale status line → REPAIRED IN THIS RELEASE.** Three documents
disagree today: `SCOPE_INCOME_CONDITIONING.md` says *"Not yet built"*; `package_check.mjs:542` says
*"PARTIALLY BUILT: CT v5.65, NM v5.66"*; the manifest row says *"PARTIALLY BUILT at v5.64."* The gate
is right. ⚠ **That scope's own header already records this failure once — four documents disagreeing
for two releases, logged there as the fifth instance of the class. This is the sixth, in the same
document.** The build rolls all three to name NJ, and the parent's premise (anchored to v5.63) is
re-measured against whatever is shipped.

**D-NJ-4 · What becomes of the `excl65: 75000` scalar? → SET IT TO `0`, Connecticut's pattern.** The
standing guard says a populated state's scalar *"must be asserted equal to what its table yields at
zero income, or the scalar becomes a second source of truth."* That comparison is **ill-defined
here**: the scalar is per-person and the table is `unit: "household"`, so there is no value that
makes them agree. CT met this by setting `excl65: 0` with a comment that it is unread; NM kept `8000`
because its table is per-person and genuinely yields it. NJ is the CT case. ⚠ **The build must check
what the whole-table guards actually assert about a zero scalar** — the parent scope warns that a
populate release has already lifted a state out of both whole-table guards silently, *on exactly the
states a populate release changes.*

## 7 · Explicitly out of scope

- **MFS** — the app models single and joint only. Disclosed, not modelled.
- **The disabled-under-SSA alternative gate.** No disability input exists; it cannot be expressed.
- **Dividend and interest income are absent from both bases**, because `_fromTest` is never passed
  them. A household whose NJ income is materially dividend-driven sits **lower** on the tier table
  than the statute would put it — **optimistic**, and disclosed in the note per the standing rule.
- **Any other New Jersey retirement exclusion.** The oracle covers § 54A:6-10 only. Anything else is
  unread and must not be inferred from it.
- **RI and VA.** One state per release. VA next (it is `taper`, not `bands`); **RI last**, because its
  TY2026 pair is unpublished until November 2026 and it carries a second, separate defect — the
  exclusion does not cover IRA distributions — which should not be tangled into a conditioning release.
- The `K-1`–`K-3` pre-ship/post-ship split and `t10_taxcases.mjs:1133`'s wrong oracle path. Both
  still open, both unrelated.

## 8 · Build record

*(empty — nothing built. Fill this at the ship, per §I.)*
