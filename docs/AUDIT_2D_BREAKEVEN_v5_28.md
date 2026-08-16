# AUDIT 2D — the Roth break-even half, discharged

**Sub-phase 2D of Phase 2 (Section C) is now complete**, with one residual gap stated precisely.

| Field | Value |
|---|---|
| Date | 2026-08-12 |
| Build | **v5.28** · `9e06482087f415661196b1c47f7e8be0` (committed tree) |
| Supersedes | `FlawsToFix-v5_15-Phase2D.md` §6 |
| Deliverable | `t10_taxcases.mjs` gains a **2D** block — **19 checks** · t10 total 115 → **134** |

---

## What 2D owed

`FlawsToFix-v5_15-Phase2D.md` §6 recorded, unchanged across three revisions:

> The **Roth break-even half remains a premise reading, not a verification**… Still outstanding:
> hand-verify the crossover on two households (one running a real deficit before recovering, one
> never behind); verify the discounting-equivalence claim; author the `t10` cases this sub-phase owes.

All three are discharged. The completeness half was already done; **2D can now be marked complete**,
subject to §5 below.

---

## 1. The identity that makes this a verification

The crossover subtracts a no-conversion run from a current-conversion run and reports the first year
the difference turns non-negative. The question 2D never answered was *what actually produces the
deficit*. It is not an assumption about opportunity cost — it is mechanical:

> **year-one wealth delta = −(incremental federal tax) × (1 + GROWTH)**

Both runs grow every balance at the same rate and differ only by the dollars the tax removed, so
nothing else can produce it.

**Hand-verified on a one-year horizon**, which isolates the conversion year: a $30,000 conversion on
the example household costs **$2,196** in incremental federal tax, and the year-one wealth delta is
**−$2,294**. `2,196 × 1.045 = 2,294.8` — agreement to the dollar of rounding. `GROWTH` is
`BASE_GROWTH = 0.045`, read from source.

---

## 2. Two households, as required

Both on **one fixture**, so the difference is conversion size and nothing else.

| Case | Conversion | Behind? | Max deficit | Reported |
|---|---|---|---|---|
| **1 — real deficit, then recovery** | $30,000/yr | yes | −$9,043 | recovers **2048** |
| **2 — never behind** | $10,000/yr | **no** | $0 | first ahead, **2045** |
| **3 — does not break even** | $60,000/yr | yes | −$65,123 | **null** |

**Case 2 is the one 2D could not confirm existed.** A conversion small enough to sit under the
standard deduction costs **zero** incremental tax, so there is no deficit and the branch
`beWasBehind ? firstRecover : firstAhead` takes its second path. It is reachable, and the lifetime
incremental tax is *negative* — the conversion saves tax outright.

**Case 3 was not in 2D's list and is added.** v5.7.1 made "does not break even" a possible answer and
nothing tested that it can still occur.

---

## 3. The discounting-equivalence claim — VERIFIED

The source comment asserts:

> Comparing same-year wealth ≡ discounting cash flows at the portfolio's own growth rate.

**Tested rather than reasoned.** With conversions confined to a single year and taxable yield set to
zero, the two runs differ thereafter *only* by balances, so any delta must compound at exactly
`GROWTH`. Measured over eleven years:

```
2027  -2294        2033  -2988  ×1.045121
2028  -2398 ×1.045336   2034  -3122  ×1.044846
2029  -2505 ×1.044621   2035  -3263  ×1.045163
2030  -2618 ×1.045110   2036  -3410  ×1.045051
2031  -2736 ×1.045073   2037  -3563  ×1.044868
2032  -2859 ×1.044956   2038  -3724  ×1.045187
```

Every ratio is within rounding of **1.045**, and lifetime incremental tax stays at **$2,195** — the
single conversion, with no later tax differences. A dollar of difference introduced in year Y appears
at year N as `(1+GROWTH)^(N−Y)`, which *is* discounting at that rate. **The claim is correct.**

The comment's companion claim — that the opportunity cost is "mechanical rather than assumed" — falls
out of the same measurement: the delta grows at exactly `GROWTH` because the removed dollars would
have compounded at `GROWTH`.

---

## 4. Negative controls

| Control | Result |
|---|---|
| Wealth credits Roth above Traditional via the heir rate | **7 of 19 fail** — this is the exact error the face-value comment exists to prevent |
| The never-behind branch removed from the shipped source | **did not fire** — see §5 |

---

## 5. THE RESIDUAL GAP, stated precisely

**The second control not firing is the finding.** The selection expression

```js
beYr = beWasBehind ? firstRecover : firstAhead;
```

lives inline in an **anonymous closure three levels inside `DangerCloseMain`** (~L8686–8699) and is
exported nowhere. The harness cannot call it, so `t10`'s `cross()` helper **reimplements** it.

| | |
|---|---|
| **Verified** | the wealth series (genuine engine output), the tax identity, the discounting equivalence, and that inputs producing all three outcomes exist and behave as claimed |
| **Not verified** | that the *shipped* selection expression picks the same year the reimplementation does |

This was found by the control failing to fire, not by inspection, and is recorded in the suite at the
point where it matters.

**Closing it requires extracting the expression to a callable function** — a source change, and
therefore out of scope for an audit. It is small: the block is 14 lines with no side effects. I'd
recommend it as a short presentation-only release, since the extracted function would also be
directly assertable against all three cases above.

Until then, 2D's honest status is: **the break-even computation is verified; its final one-line
selection is not.** That is a far smaller claim than "remains a premise reading", and it is the whole
of what remains.

---

## 6. Phase 2 status after this

| Sub-phase | | |
|---|---|---|
| 2A federal core | ✅ | |
| 2B IRMAA + indexation | ✅ | |
| 2C first-spouse death | ✅ | |
| **2D break-even + completeness** | ✅ | **complete**, with §5 recorded |
| 2E state tax | ⬜ | **not started** — the last one |

**Phase 2 is four-fifths complete.** 2E is scoped already (five state archetypes plus your own
state, ~½ session) and is all that stands between here and closing Section C.
