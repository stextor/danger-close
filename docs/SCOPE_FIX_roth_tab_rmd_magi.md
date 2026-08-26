# SCOPE — add the omitted RMD term to the Roth tab's MAGI

| Field | Value |
|---|---|
| Status | ✅ **RETIRED 2026-08-26 by the scope-retirement sweep.** **BUILT AND SHIPPED AT v5.41** (2026-08-20) — the release titled *"the Roth tab's MAGI now includes required minimum distributions."* Verified at v5.49: L4896 sums `rmd_y` into the tab's MAGI. ⚠ Retired **8 releases late**; it read *"Not yet built"* while built. Kept as the record of how the work was scoped and built — **nothing here is outstanding; do not treat it as pending work.** |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · premise verified against source 2026-08-20 |
| Parent | `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` (D-C answered) · `MEASUREMENT_roth_tab_magi_v5_40.md` rev 2 §6 |
| Kind | **A modelling fix.** `src/` change, version bump, new extinction invariants |
| Why first | Largest single term in the measured error — **94.7%** on the shipped example household, 41% on the straddling one — and the only one of the three needing no new plumbing |

---

## 1. Premise, verified — and there is more here than the parent scope knew

**The target.** `const magi = pension + spouseBWork + taxableSS + conv_y;` at **L8847**, in
`<anon>@8719 < DangerCloseMain@5217`. It omits required minimum distributions. Measured consequence
on the shipped example household: **−$45,411 in 2039 and −$44,830 in 2040**, a 37% understatement of
those years' MAGI, validated against the rendered DOM figure and corroborated by Engine C to within
0.7%.

**Three things the parent scope did not establish, all found by AST census this session:**

**(a) `rmdDivisor` and `rmdStartAge` are already in scope in this block** — called at L8913, L8935
and L8937. No import, no hoist, no new dependency. This is why the term is cheap.

**(b) A per-person RMD replay already exists in the tab, twenty lines below the loop.** `_perRmd` at
**L8906–8940** replays the ladder per spouse, allocating each year's conversion proportional to
remaining Traditional and gating by each person's own window — *the exact split the fix needs*. It
runs after the loop and iterates `rows`, so it cannot feed the loop's own `magi` without
restructuring. **The fix is therefore a consolidation opportunity, not just an addition.**

**(c) ⚠ The two balance projections in this tab DISAGREE, and neither the parent scope nor the
measurement knew it.** The ladder loop grows then converts (L8814/L8888:
`grownTrad = tradBal*(1+g)`, then `tradBal = grownTrad − conv_y`). `_perRmd` converts then grows
(L8925–8928: `a = max(0, a − cA) * (1 + tradGrowth)`). The difference is `conv × g` per year,
compounding:

| Year | Ladder-loop `tradBal` | `_perRmd` balance | Divergence |
|---|---|---|---|
| 2029 | $1,391,537 | $1,388,387 | −$3,150 |
| 2034 | $1,351,159 | $1,330,000 | −$21,158 |
| 2040 | $1,289,378 | $1,240,666 | **−$48,712 (3.78%)** |

Both are on screen: `tradBal` is rendered in the ladder table at L9021, and the RMD cards are derived
from `_perRmd`. **The tab already shows a user two Traditional balances that do not agree**, and
whichever recursion the fix adopts sets the RMD. This must be decided before any code (D-1).

Direction note: convert-then-grow yields the **lower** balance, hence the **smaller** RMD — the
flattering direction. Grow-then-convert is the conservative one.

---

## 2. Site census

`census.cjs v540.jsx <id>`, AST-resolved. ⚠ Object-shorthand positions are double-reported
(OPERATIONS §B1, pinned); read as hits, not sites — the error over-reports and is safe.

| Identifier | Sites in the ladder block | Relevance |
|---|---|---|
| `magi` | L8847 (decl), L8876, L8895, L9017, L9118 | **the target** + four consumers |
| `grossTaxable` | L8850 | **same expression, one line below** — see §3 |
| `nonSSincome` | L8832 | feeds the §86 provisional test — must also take the RMD |
| `tradBal` | L8794, L8814, L8888, L8898, L9021 | the recursion, and it is rendered |
| `grownTrad` | L8814, L8815, L8888 | conversion cap |
| `conv_y` | L8815, L8832, L8847, L8850, L8885, L8888 | six sites |
| `rmdDivisor` / `rmdStartAge` | L8935/8937, L8913 | **already in scope** |
| `gainByYr` | **zero hits** | confirms `capGain_y` is a later, larger scope |

---

## 3. The blast radius is wider than "add a term to a sum"

An RMD is taxable ordinary income. It therefore belongs in **three** places, not one:

1. `magi` (L8847) — the IRMAA figure, the target.
2. `nonSSincome` (L8832) — the §86 provisional-income base. Omitting it here understates `taxableSS`,
   which understates `magi` a second time. **The omissions compound.**
3. `grossTaxable` (L8850) — hence `taxableIncome`, `tax`, `marginalRate`, and `headroom24`.

So the tab's **conversion tax, marginal rate and 24%-bracket headroom all move**. That is correct —
they are wrong today for the same reason — but it means this is not a cosmetic change and the release
notes must say so plainly. Any user with a ladder running past their RMD age will see their tax
figures rise.

---

## 4. Three implementations, and what each costs

**Option A — MAGI only.** Track `balA`/`balB` in the loop, compute `rmd_y`, add it to `magi`,
`nonSSincome` and `grossTaxable`. Leave the balance recursion alone.
*Cheapest. But the RMD enters income while never leaving the account, so `tradBal` overstates and the
tab becomes internally inconsistent in a new way. I do not recommend shipping a fix that creates a
second inconsistency to close the first.*

**Option B — MAGI plus a consistent balance.** As A, and subtract the RMD from the tracked balance.
*Correct and self-consistent. Moves `tradBal`, `rothBal`, the rendered balance column, and — if the
conversion cap is also changed (D-3) — `conv_y`. Leaves `_perRmd` as a second, still-divergent
projection.*

**Option C — Option B, plus unify the two recursions** so `_perRmd` reads the loop's per-person
balances instead of replaying them.
*Largest, and the only one that leaves the tab with one Traditional balance. Deletes the L8918–8929
replay. Fixes finding (c) as a side effect rather than leaving a known divergence pinned.*

**Recommendation: C.** The replay is already the per-person split the loop needs, the divergence is
user-visible today, and doing B now means opening this block again later to do C. The counter-argument
is real — C touches the RMD cards, which no current suite pins — and that is D-2.

---

## 5. What ships

- **`src/`** change per the chosen option, version bump, four in-app version sites.
- **Structural extinction invariant in `t1`, mirroring the existing `STRUCT S-1` block** (L291–307),
  which today pins **Engine C's** `magi` term set by AST and leaves the Roth tab's unpinned. The new
  check asserts the Roth-tab `magi` sums exactly its registered term set, order-insensitive, gated to
  the builds it is true for (OPERATIONS §B2 — gate the inversion, do not apply the new expectation to
  frozen legs).
- **A dollar-exact tail-year invariant** asserting the 2039/2040 MAGI includes the RMD, hand-derived
  from Pub. 590-B before the code is written (the v5.37/v5.38 order).
- **A recursion-unification invariant** (Option C only): the ladder table's `tradBal` and the RMD
  cards' balance agree for every ladder year. This is the extinction invariant for finding (c).
- **Negative controls, per OPERATIONS §B2.** A green suite is not evidence of coverage: perturb the
  RMD term and confirm each new check fires. If a control does not fire, that is the finding.
- **METHODOLOGY** update — this changes modelling.
- **CHANGELOG** disclosing that tax, marginal rate and headroom move, and why.

---

## 6. Open decisions

| # | Decision | Notes |
|---|---|---|
| **D-1** | **RESOLVED: the ladder loop's (grow-then-convert).** Which balance recursion is canonical — grow-then-convert (ladder loop, rendered) or convert-then-grow (`_perRmd`)? | **Recommend the ladder loop's.** It is the one displayed in the `tradBal` column, and it is the conservative one: the higher balance gives the larger RMD. Adopting it *raises* the RMD-card figures the tab shows today, which is a visible change needing a CHANGELOG line |
| **D-2** | **RESOLVED: Option C** — unify the recursions. (§4) | **Recommend C.** Only option leaving one Traditional balance. Costs: touches the RMD cards, which no suite currently pins, so the invariants in §5 must land in the same release |
| **D-3** | **Does the RMD cap the conversion?** Engine C caps at `tradBal − max(rmd, qcd)` (L4393); the Roth tab caps at `grownTrad` alone (L8815) | **RESOLVED: match Engine C.** ⚠ **My original note here was wrong and is retracted.** It said the cap "reduces modelled conversions in tail years, which changes the tab's headline advice" — asserted, never computed. Measured 2026-08-20: the cap binds only when the conversion nearly exhausts the balance, which needs the remaining Traditional to sit between `rothAmount` and `rothAmount + rmd`. Across a sweep of the full slider range ($0–$400,000, step $5,000) against Traditional balances $200,000–$1,400,000, the **worst case found reduces lifetime conversions by $252 — 0.0%** — binding in one year of one configuration. On both measured households the difference is **exactly $0**. With the behavioural cost at nil, the decision falls to consistency: two engines should not carry different rules for the same question |
| **D-4** | **RESOLVED: one term per release — RMD only.** One release or two? The RMD term alone, or RMD + the SS cliff (a cheap swap to the existing `taxableSSPortion`)? | **Recommend one term per release.** The measurement showed the SS cliff contributes $0 on all three households, so it buys nothing here and would blur what moved. Ship RMD, verify, then decide |

---

## 7. Out of scope

- **`div_y` and `capGain_y`.** Their own scope, and the larger one — `gainByYr` has zero hits in this
  block. They are 59% of the straddling household's error and must follow soon, but not here.
- **The §86 cliff at L8841–8844.** Real, cheap, and $0 on every household measured. Later.
- **Engine B's omitted ½-benefits cap; Engine C's HSA-inflated dividend base; spouse B's ungated SS
  at L8822.** All small, all conservative in direction, all belong in one tidy-up scope.
- **Engine C itself.** It is the comparison reference here and must not be edited.
- **Re-running the slider-sensitivity table** in measurement rev 1 §3, which was computed on the wrong
  `dobA` and should not be quoted until re-run.

---

## 8. Cautions

- **§A freshness check first**, including §A2's clone-and-diff of the suite. Clean at 2026-08-20.
- **`dobA` is 1964-01-01, not the L641 fallback.** `_parseDOB` reads `MASTER_PROMPT` L151 first. I got
  this wrong in measurement rev 1 and it moved the tail from three years to two. **Resolve the DOB
  through `PLAN_TIMELINE`, never from the literal.**
- **Harness traps:** engine P objects need `asOfYr`; `applyLoadedData` takes a wrapper and mutates
  module globals without re-rendering, so park off the target tab; `dobA`/`dobB` must be
  `"YYYY-MM-DD"` strings. This work is age-keyed at its core.
- **The parity guardrail (OPERATIONS §E)** covers `runRothStrategies` (L3683), a *different* function
  from this render block. Parity should stay 8/8 — **and if it does not, the fix has reached
  somewhere it should not have.** Treat a parity break as a stop, not as an expectation to update.
