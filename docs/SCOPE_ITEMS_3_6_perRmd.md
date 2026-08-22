# SCOPE — tidy-up items 3 and 6, the `_perRmd` block

| Field | Value |
|---|---|
| Written | 2026-08-22, scoping session after the v5.43 ship |
| Target | **v5.44** |
| Base source | `src/DangerClose.jsx` md5 **`7a9c6cfdaecaed0ebc77e98bfcd98b54`** (v5.43) |
| Kind | Modelling fix · `src/` change · version bump · new invariants · METHODOLOGY update |
| Status | **SCOPED, NOT BUILDABLE YET — two decisions open (D-3a, D-6a), both blocking** |
| Grouped because | Items 3 and 6 are the same forty lines. Item 3 is `yrs`/`t0` at L9007–9010; item 6 is `t0` at L9007. One census, one fixture, one control run |

---

## 1. ⚠ Neither item's recorded figure reproduces, and item 6 is bigger than recorded

`SCOPE_FIX_tidyup_six.md` §1 records item 3 at **$13,724 (19.3%)** and item 6 at **~$105/yr**.
Measured against v5.43 source through the shim (`qa/tools/probe_items_3_6.mjs`):

| | Recorded | **Measured at v5.43** |
|---|---|---|
| Item 3 | $13,724 (19.3%) | **$12,643 (14.1%)** |
| Item 6 | ~$105/yr | **$483/yr** on the `noConv` card |

The item 3 gap is explainable and worth stating: 19.3% is four years of compounding at 4.5%
(1.045⁴ = 1.193); 14.1% is three (1.045³ = 1.141). The defect is an off-by-N in a growth exponent,
and **N is the distance between two dates that both move between releases**, so the figure is not a
constant. Whichever number is right, the recorded one is not right *now*. **Do not carry either
figure into a build brief — re-measure.**

The item 6 gap is not explained, and the measured figure is 4.6× the recorded one. The probe's
direction is cross-checked against the engine's own constructor: `tradInitB × (1 − annShareB)` =
$211,600 = `rmdInitB`, exactly. (`annShare` is the RMD-**exempt** share, not the RMD-bearing one —
easy to invert, and I did invert it on the first pass.)

## 2. Item 3 — the `noConv` counterfactual grows the wrong balance for the wrong span

```js
const _rsbC = retireStartBalances(tl.rothLadderStart);   // L9006 — seed measured at LADDER START
const t0 = { A: _rsbC.tradInitA, B: _rsbC.tradInitB };   // L9007
const yrs = Math.max(0, yr - tl.asOfYear);               // L9010 — span counted from AS-OF YEAR
…
noConv:     Math.round(P0.t0 * Math.pow(1 + tradGrowth, P0.yrs) / rmdDivisor(P0.age)),   // L9041
noConvTrad: P0.t0 * Math.pow(1 + tradGrowth, P0.yrs),                                    // L9042
```

The seed is the balance at `rothLadderStart` (2029). The exponent counts from `asOfYear` (2026). The
three years between them are compounded **twice** — once inside `retireStartBalances`, which already
accrued planned contributions and growth to 2029, and again in the exponent.

Measured, example household: spouse A's no-conversion RMD $85,008 → **$74,492**; spouse B's $17,197 →
**$15,070**. Combined **$102,205 → $89,562**.

**This is user-facing.** `rmdNoConvert` (L9048) feeds `rmdReduction` (L9050) — the tab's *"Combined
RMDs reduced by $X/yr"* line. The overstated counterfactual makes conversions look **more**
effective than the model actually says. Direction: this correction makes the plan look **worse**,
unlike the last two releases.

`withConv` is **not** affected — it reads `balAt`, which takes the ladder rows' own balances.

## 3. Item 6 — annuity money in the RMD basis, and it is THREE sites, not one

A non-qualified annuity carries no RMD. Every engine excludes it:

```js
const _rmdBaseA = tradA * (1 - _annShareA), _rmdBaseB = tradB * (1 - _annShareB);   // L3821, L4384, L5100
```

**The Roth tab is the only place that does not** — and it fails to in two separate spots:

| Site | Line | What it feeds |
|---|---|---|
| `_perRmd`'s `t0` | **L9007** | the **no-conversion** RMD card |
| the ladder's own RMD | **L8856–8857** | the **with-conversion** card, the ladder table, MAGI, §86 provisional income, gross taxable income |

**⚠ This is why item 6 cannot be fixed at `t0` alone.** Doing so would put the two cards on different
bases — the no-conversion card excluding annuity money and the with-conversion card including it —
which is precisely the two-disagreeing-projections defect v5.41 was built to eliminate. Fix both
sites or neither.

Fixing L8856–8857 is **not** cosmetic: it changes `rmd_y`, which v5.41 wired into MAGI, the §86
provisional base and gross taxable income. That reaches `t23`, `t24` and the ladder's rendered
figures. **It is a materially larger change than `SCOPE_FIX_tidyup_six.md` implies**, and it retires
a simplification currently disclosed in METHODOLOGY rather than merely tidying a card.

`retireStartBalances` already returns `rmdInitA` / `rmdInitB` — the RMD-bearing balances — so the
`t0` half needs no new arithmetic, only the right field.

## 4. Site census (v5.43 — re-find with `funcmap.cjs`; these move every release)

| # | Line | Expression |
|---|---|---|
| 3 | L9006–9007 | `_rsbC` / `t0` — the seed |
| 3 | L9010 | `const yrs = Math.max(0, yr - tl.asOfYear);` |
| 3 | L9041–9042 | `noConv` / `noConvTrad` |
| 3 | L9048, L9050 | `rmdNoConvert`, `rmdReduction` — the consumers |
| 6 | L9007 | `t0` → `rmdInitA` / `rmdInitB` |
| 6 | **L8856–8857** | `rmdA_y` / `rmdB_y` — the ladder's own basis, the second site |
| ref | L3821 / L4384 / L5100 | the engines' correct form, to mirror |
| — | L9043–9044 | `withConv` / `withConvTrad` — **unaffected by item 3**, affected by item 6 via the ladder |

## 5. Tests

1. **Dollar-exact where reachable.** `retireStartBalances`, `rmdDivisor` and `rmdStartAge` are all in
   the shim, so the `noConv` arithmetic can be asserted **to the dollar** without the DOM. Do that
   rather than scraping cards.
2. **The rendered cards** still need DOM assertions (±$500, §M) — `rmdNoConvert` and the *"reduced
   by"* line are the user-facing consequence and the reason item 3 matters.
3. **The invariant that stops the v5.41 defect returning:** both cards sit on the **same** basis.
   Assert it as a property, not two separate values.
4. **`t23` and `t24` must be re-derived if L8856–8857 changes.** Both embed transcriptions of the
   ladder recursion. If their pins move, that is expected for item 6 — but it must be *deliberate*,
   with the new figures hand-verified, not accepted because the suite went green.
5. **Negative controls, mandatory**: the exponent's base year · the seed field (`tradInit` vs
   `rmdInit`) · the ladder's RMD basis · the divisor. Each must fire. Expect at least one behavioural
   no-op given spouse A's `annShareA` is 0 — **investigate it, do not soften the control** (§B2).
6. **Parity 9/9.** This is render-block work; if parity moves, the change reached too far.

## 6. Out of scope

Tidy-up items 2, 4, 5, 7 · `div_y`/`capGain_y` · the §M hoist · `runRothStrategies` · Engine C, which
v5.43 has just corrected and which is now the reference the tab should agree with.

## 7. Open decisions — BOTH BLOCK THE BUILD

**D-3a — which end of item 3 is wrong, the seed or the span?** Two internally consistent fixes:
**(a)** count `yrs` from `tl.rothLadderStart`, keeping the ladder-start seed and its planned-
contribution accrual; **(b)** seed from the as-of balance and keep the as-of span. They do **not**
give the same answer, because `retireStartBalances` adds planned contributions between the two dates.
**I recommend (a)** — it matches L9004–9005's stated intent ("per-person `t0` from the shared
constructor, so these cards carry the same planned-contribution accrual as the ladder table"), and
(b) would silently drop that accrual from the counterfactual.

**D-6a — does item 6 ship at both sites, or not at all?** Fixing only `t0` recreates the
two-disagreeing-bases defect v5.41 removed. Fixing both changes `rmd_y` and therefore MAGI, §86
provisional income and gross taxable income on the Roth tab, moving `t23`/`t24` pins. Options:
**(i)** both sites, accepting the larger blast radius and re-deriving the affected pins by hand;
**(ii)** neither, leaving item 6 for its own release and shipping item 3 alone; **(iii)** both, but
in a separate release from item 3. **I recommend (ii) for this release** — ship item 3 alone, and
give item 6 its own scope, because a change that touches the §86 provisional base one release after
§86 was corrected in two engines deserves its own before/after witness rather than sharing one with
an unrelated exponent fix.

**If (ii) is taken, this scope covers item 3 only and item 6 returns to the queue** — which also
undoes the "same block, ship together" grouping that motivated pairing them. That grouping was mine,
from the previous session, and the measurement above is what undermines it.
