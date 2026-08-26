# ASSESSMENT — `HEIR_RATE = 0.22`, the estate figure's only deduction

| Field | Value |
|---|---|
| Assessed | 2026-08-26, against **v5.50** · `src/DangerClose.jsx` md5 `0bef5fc4cb1ebdaf1effffe1783bbd04` · repo `fb73d9b` |
| Kind | **Assessment only.** No code change proposed here; no figure has moved |
| Verdict | **A real gap. Direction is SPLIT** — optimistic on the estate *level*, conservative on the *ranking* |
| Severity | **Medium** — disclosed, bounded, but it compounds with D-7 in the same figure |
| Boundary test | **Passes** — every couple with a Traditional balance and children is exposed |

---

## 1. What it is, and what it is not

```
L3689   const HEIR_RATE = 0.22;    // assumed heir tax on inherited Traditional
L4251   estate: Math.round(taxBal + rothA + rothB + (tradA + tradB) * (1 - HEIR_RATE)),
L4252   heirRate: HEIR_RATE,
```

Three occurrences, all inside `runRothStrategies`. It is the **only** deduction the estate figure
makes, and that figure is the **default ranking objective** of both the strategy comparator and the
25-cell solve-for grid.

**The other two terms are correct and should not be touched.** `taxBal` is credited at full face
value, which is right — taxable assets receive a **step-up in basis** at death, and the Field Manual
already defines that term. `rothA + rothB` are credited whole, also right — an inherited Roth is
distributed under the 10-year rule but is not taxed. Only the Traditional term is in question.

## 2. Provenance: there isn't any

- **No citation, no derivation, anywhere.** Not in the code comment, not in `METHODOLOGY.md`, not in
  the Field Manual, not in any audit or scope document. `METHODOLOGY.md` L299 says only *"an assumed
  22%"* and the in-app note says *"Traditional discounted 22% for heirs' taxes."* Both state the
  number; neither defends it.
- **It is the one tax constant outside the single source of truth.** The comment eleven lines above
  it reads *"All tax/IRMAA constants come from the shared `TAX_CONSTS` / `IRMAA_CONSTS` blocks
  (single source of truth)."* `HEIR_RATE` is then declared inline as a bare literal. Every other
  rate in that function is imported; this one is typed in place.
- **No suite pins it.** `HEIR_RATE` appears in `t1` and `t31` only inside **comments** added at
  v5.50. Nothing asserts the value. It could be changed to any number and the suite would stay green.
- `0.22` is exactly a federal bracket rate. The likely origin is "use the 22% bracket as a
  stand-in" — plausible, but that is inference, not evidence, and it is recorded here as inference.

## 3. What the law actually requires

Verified against the July 2024 final regulations under the SECURE Act and SECURE 2.0. A non-spouse
beneficiary who is not an *eligible designated beneficiary* is subject to the **10-year rule**: the
inherited account must be fully distributed by the end of the tenth year after death. Where the
decedent died **on or after** their required beginning date, the final regulations additionally
require **annual distributions** across those ten years rather than a single deferred lump at year
ten.

That second half matters here. This app models households through their RMD years, so its users die
after their RBD by construction. Their children therefore face both constraints: the balance must
come out within ten years, **and** it must come out annually — so the flexibility to park the money
until a low-income year is largely gone.

Distributions are **ordinary income to the heir**, stacked on top of whatever the heir already earns.
The heirs of a retiree are typically adult children in their peak earning years.

## 4. What an heir actually pays

Computed from the app's own `TAX_CONSTS` 2026 brackets (Rev. Proc. 2025-32), a ten-year drawdown, and
the heir's own income underneath. Federal only, no state tax:

| Heir income | Filing | Inherited | Effective rate | vs 0.22 |
|---|---|---|---|---|
| $90,000 | MFJ | $1,000,000 | 17.7% | −4.3% |
| $150,000 | MFJ | $1,000,000 | **22.1%** | +0.1% |
| $220,000 | MFJ | $1,000,000 | 23.5% | +1.5% |
| $300,000 | MFJ | $1,000,000 | 24.0% | +2.0% |
| $80,000 | Single | $1,000,000 | 23.2% | +1.2% |
| $120,000 | Single | $1,000,000 | 24.1% | +2.1% |
| $180,000 | Single | $1,000,000 | 29.2% | +7.2% |

Across 21 scenarios: **minimum 13.4%, median 23.7%, maximum 31.1%. Seventeen of twenty-one land
above 0.22.**

Hand-verified, MFJ at $150,000 inheriting $1,000,000 over ten years: taxable income $117,800 → tax
$15,340; with the $100,000 annual slice, $217,800 → tax $37,468; marginal $22,128 on $100,000 =
**22.128%**. This is the case where 0.22 is very nearly exactly right.

**For 0.22 to be correct, the heir's *total* taxable income including the inherited slice must land
entirely inside the 22% bracket** — roughly $133,000–$243,600 of AGI filing jointly, or
$66,500–$121,800 filing single. That is a real band, and it is a plausible one. It is not the
general case, and nothing anywhere says it was chosen to represent it.

**State income tax is not in the figure at all.** Heirs pay it on these distributions in most states:

| Heir AGI | State rate | Effective | vs 0.22 |
|---|---|---|---|
| $150,000 MFJ | 0% (FL/TX) | 22.1% | +0.1% |
| $150,000 MFJ | 5% (typical) | 27.1% | **+5.1%** |
| $150,000 MFJ | 9.3% (CA) | 31.4% | **+9.4%** |

The app already models the *household's* state tax. It models none of the *heir's*.

## 5. Direction — split, and this is the important part

**On the estate level: OPTIMISTIC.** Too low a rate credits the Traditional balance too generously,
so the estate shown is larger than reality. On a $1,000,000 ending Traditional balance, a five-point
understatement is **$50,000** of estate that does not exist.

**On the ranking: CONSERVATIVE.** Roth's whole advantage in this metric is that it escapes the heir
discount. Understating the discount *understates the case for conversion*. Since the app reports "the
model's best cell, never a directive," erring toward less conversion is the safer error, and this
half is arguably a feature. Nothing documents it as an intentional one.

**The ranking is genuinely sensitive.** Two end-states of equal substance, one converting and one not:

| `HEIR_RATE` | No conversion | Convert | Winner |
|---|---|---|---|
| 0.15 | $1,350,000 | $1,340,000 | **no conversion** |
| **0.22** | $1,280,000 | $1,312,000 | **convert** ← shipped |
| 0.28 | $1,220,000 | $1,288,000 | **convert** |

The ranking **flips at 0.167** — verified algebraically, not just numerically: setting the two estates
equal gives $100,000 = $600,000·r, so r = 1/6. The shipped value sits 5.3 points above the flip, and
each additional point of `HEIR_RATE` moves the margin by $6,000 in this example. **An unjustified,
unpinned constant is steering the default ranking**, and how far it sits from a flip depends on the
household.

## 6. How this compounds with D-7

This is the finding that raises the severity above "an imprecise constant."

**Two independent errors inflate the same number in the same direction.** D-7: no estate or
inheritance tax is deducted at all. This: the one deduction that *is* made is understated for most
heirs. Both make the estate larger than reality, and that figure is the default ranking objective.
v5.50 disclosed the first. The second is disclosed as a bare number — *"an assumed 22%"* — with no
indication that it is a guess or which way it is likely to be wrong.

## 7. Honest counter-arguments

- **A heir with modest income really does pay less.** The $90,000-MFJ row is 17.7%. Some heirs are
  retired themselves, or the estate splits across several children, shrinking each slice.
- **Ten years is manageable.** A heir who retires mid-window can time distributions into low
  brackets — though the annual-RMD requirement blunts this.
- **A point estimate cannot capture dispersion.** Real heir rates span 12% to 37%. Any single number
  is wrong for most people; the question is only whether it is *centred*.
- **The conservative half may be deliberate.** Under-selling conversion is a defensible bias.

None of these defends 0.22 *specifically*. They argue that a low number is not indefensible — not
that this one was chosen.

## 8. Recommendation

**Do not simply raise it.** Substituting 0.25 for 0.22 replaces one undocumented guess with a
slightly better undocumented guess, moves every comparator figure — parity and the DOM diff would go
to 40 and the whole release would need re-verification — and pushes the ranking toward *more*
conversion, which is the direction with real consequences for a user who acts on it.

**Recommended: Option 1 now, Option 3 as a scope.**

| | What | Cost | Figures move? |
|---|---|---|---|
| **1** | Move `HEIR_RATE` into `TAX_CONSTS` with a comment stating what it is, what it is not, and that it is an assumption rather than a statutory rate. Pin it in `t1`. Disclose the sensitivity in-app and in `METHODOLOGY.md`: the number is a guess, real heir rates run roughly 13–31%, state tax is excluded, and the estate reading is optimistic if the heir's rate is higher. | Small | **No** |
| **2** | Re-anchor the default to ~0.24–0.25 | Medium | **Yes** — full re-verification |
| **3** | Expose it as a user input, defaulting to 0.22 | Larger, needs a scope | Only if the user changes it |

Option 1 fixes what is actually broken — a load-bearing constant with no provenance and no pin —
costs nothing in verification because no figure moves, and follows the pattern that worked for D-7:
when the model cannot know the right answer, say so where the user reads the number.

Option 3 is the correct long-run answer. The right rate depends on the heirs' incomes, their states,
and how many of them there are — all things **the user knows and the model cannot**. It passes the
product boundary test: it occurs for any mainstream couple with children, and it makes an existing
output more correct rather than adding a new one outside the drawdown frame.

## 9. Register entry

> **D-9 · Heir income-tax rate on inherited Traditional balances is an unjustified constant**
> `HEIR_RATE = 0.22`, the only deduction in the comparator's estate figure and its default ranking
> objective. No citation, not in `TAX_CONSTS`, unpinned by any suite. Realistic effective rates run
> ~13–31% federal (median 23.7%), higher with the heir's state tax, which is not modelled at all.
> **Direction split** — optimistic on the estate level, conservative on the ranking. **Compounds
> with D-7**: two independent optimistic errors in the same figure. Disclosed as a bare number only.
> **Severity Medium. Recommend disclosure + pin now (no figures move); user input as a later scope.**
