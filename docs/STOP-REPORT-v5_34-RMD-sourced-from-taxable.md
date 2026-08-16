# STOP REPORT — v5.34 · the RMD is sourced from the taxable sleeve, and v5.34 made that cost money

**Written:** 2026-08-15 · **Against WIP source** `4496af12331311476820c1be5f5a0633`
**Repo HEAD at time of writing:** `2c79a34` (v5.33 shipped state, verified clean this session)
**Raised because:** the premise handed forward for `t13` and `t17` is falsified. Per the project
ground rules, this stops rather than adapts.

---

## 0 · The premise that failed

`STATUS_v5_34_S6.md` §6 records:

> Both are v5.32-era MAGI locks that v5.34 legitimately falsifies (`t17` measures $174,657.10 where
> it expects $150,000). Gating them correctly means asserting the NEW figure per leg.

That was a reasonable reading, and it is wrong. **`t17` case G is correct as written. The engine is
wrong.** Hand-computing "the new figure" and pinning it would have written a defect into the suite
as an expectation — the precise outcome the independent-computation rule exists to prevent.

Nothing was edited. No expectation was adjusted.

---

## 1 · What `t17` case G asserts, and why it is right

The case builds a household whose only account is a $2,000,000 Traditional IRA — `otherAccounts: []`,
`taxYield: 0`, no Social Security, pension $150,000/yr — and applies a $150,000 QCD, large enough to
cover the RMD entirely. The assertion:

> with a QCD covering the RMD, MAGI is EXACTLY the pension — the RMD is fully excluded

That is a correct statement of the model's own intent and of the underlying rule: a qualified
charitable distribution is excluded from gross income and counts toward the RMD, so if the QCD covers
the RMD there is no RMD income left, and with no other income source MAGI is the pension and nothing
else. `rmdTax_y = max(0, rmd_y − qcd_y) = 0`, exactly as the case header says.

**Measured:** `taxableInitAll() = 0` — the household has no taxable account at all. Yet:

| build | 2039 MAGI | MAGI − pension |
|---|---|---|
| v5.33 | $150,000.00 | **$0.00** |
| v5.34 WIP | $174,657.10 | **$24,657.10** |

$24,657.10 of capital gain, in a household with no taxable account.

---

## 2 · Mechanism, traced to the line

Engine C's diff between the two builds is **one addition and nothing else** (L4361):

```js
const capGain_y = _gainByYrI[yr] || 0;
const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y;
```

read from Engine D via `computeWithdrawalPlan`. So the whole delta is that term, by construction.
Engine D's schedule for the same household and year:

```
yr    drawNeeded   rmd_y    drawFromTaxable   capGain_y   taxBasis   taxable
2038      0            0            0              0       147,000   206,339
2039      0        85,740       85,740         24,657      171,657   213,455
```

`drawNeeded = 0` — the pension covers expenses with room to spare. Nothing is being spent from the
portfolio. But `drawFromTaxable = 85,740`, exactly `rmd_y`.

The cause is Engine D's withdrawal sequencing (L4593–4604):

```js
const drawNeeded = Math.max(0, exp_y - guaranteed);
let totalToWithdraw = drawNeeded + rmd_y;
...
if (remaining > 0) { drawFromTaxable = Math.min(remaining, taxable); ... }   // Taxable FIRST
```

`rmd_y` is folded into a generic `totalToWithdraw`, and the sequencer satisfies the whole of it from
the **taxable sleeve first**. So the required minimum distribution is taken out of the brokerage
account and the IRA is left untouched. The money then returns on L4609/L4633 as "RMD surplus":

```js
const rmdToTaxable = Math.max(0, actuallyWithdrawn - drawNeeded);   // = 85,740
taxable += rmdToTaxable;
taxBasis += rmdToTaxable;
```

Net movement of the taxable balance: **zero**. It is a round trip.

**This routing is pre-existing — it is identical on v5.33 and is not a v5.34 regression.** It was
invisible for many releases precisely because it was balance-neutral. What v5.34 changed is that the
*outbound* leg now has a tax consequence (L4627):

```js
const _rg = realizeGain(drawFromTaxable, _taxBoy, taxBasis);
const capGain_y = _rg.gain;
```

so an accounting round trip now realizes real, MAGI-bearing capital gain. The inbound leg is handled
correctly — the source comment at L4634 explicitly reasons about RMD surplus entering at full basis —
but the outbound leg is not a sale at all, and nothing prices it as one.

**An RMD is a distribution from the retirement account.** It cannot be satisfied by selling assets in
a taxable brokerage account. The sequencer should draw the RMD from the Traditional buckets and use
the taxable sleeve only for spending the RMD and guaranteed income do not cover. *(The legal rule
should be pinned to its primary source before this goes in release notes; the modelling point stands
on its own.)*

---

## 3 · Reach — this is not a fixture artifact

The term flows into **three engines**:

| site | consumer |
|---|---|
| L4681 | Engine D's own `magi` |
| L4361 | Engine C (IRMAA) → tier selection **two years later**, where MAGI is a cliff |
| L4849 | Engine B (`computeTaxPlan`) → federal tax, NIIT, LTCG |

Measured on **the app's own demo household**, which does have real spending needs:

```
total realized capital gain over the plan : $37,555
  years where a taxable sale is warranted : $ 6,103
  years where the RMD alone covers spend  : $31,452   (83.7%)
  those years: 2041-2053 (13 years)
```

From 2041 on, the forced RMD by itself exceeds the spending need every year, so **no taxable sale is
warranted at all** — yet the model sells $50,000–$80,000/yr from the brokerage and books the gain.
**84% of the demo household's realized capital gain over the plan is an artifact of this routing.**

The affected household shape — guaranteed income plus an RMD that meets or exceeds the spending need
— is a mainstream retiree, not a corner case. It is the shape the project's own boundary test asks
about.

**Direction of the error is conservative** (more MAGI, more tax, higher IRMAA), which is the project's
default when an assumption must be picked. But this is not a chosen assumption or a disclosed
simplification — it is an artifact, and at $24,657 in year one of the `t17` household it is large
enough to move an IRMAA tier on its own.

---

## 4 · A second, smaller finding: Engine C's gain term is QCD-blind

`computeWithdrawalPlan` has **no `qcdAnnual` parameter** — censused, not grepped: `qcdAnnual` appears
at 12 source sites, in `computeIrmaaPlan` and `computeTaxPlan` only. Engine C calls it as:

```js
computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset: "base" })
```

So `capGain_y` is read from a scenario in which the QCD does not exist. Measured — Engine D's
`capGain_y[2039] = 24657.099115190857`, and Engine C's `magi − pension` at `qcdAnnual = 150000` is
`24657.09912`. Identical to the digit: the QCD slider cannot move this term.

Once §2 is fixed this particular case resolves on its own (the draw goes to zero, so the gain does
too), but the coupling remains latent for any household with a genuine taxable draw. Recorded rather
than fixed here.

**Not checked:** whether Engine A (`runRothStrategies`) sequences the RMD the same way. Its drawdown
is separate code and was not examined. It should be, before any fix is scoped.

---

## 5 · Consequence for `t13` and `t17`

- **`t17` needs no change.** Fix the sourcing and `drawFromTaxable` goes to 0 in this household, so
  `capGain_y` goes to 0 and MAGI returns to exactly the pension. The case passes as written.
- **`t13` case 3's +$8K is the same term.** Engine C's only diff is the `capGain_y` addition, so the
  move from $345K to $353K is that term by construction. Its household draws from a pool in
  RMD-covered years, so the delta is at least partly the same artifact. **Hand-computing a new $353K
  expectation would pin the defect.** It should stay red until §2 is resolved.

Both reds are green on shipped v5.33 (`t13` 42/0, `t17` 63/0, verified from the clean clone this
session), so neither is pre-existing damage.

---

## 6 · What I recommend

1. **Scope the sourcing fix** (`SCOPE_*.md`) before touching anything: the RMD is drawn from the
   Traditional buckets, and the taxable sleeve funds only `max(0, drawNeeded − rmd_y)`. Site census
   first — Engine A included, per §4.
2. Expect **parity to move**. This changes drawdown balances, so `t2 compare` will not hold at 9/9,
   and that is correct rather than overreach. It needs stating in the scope, since §E otherwise reads
   a parity break as a stop condition.
3. Expect **many existing figures to move**, including several the suite pins. Each new figure needs
   independent hand-computation, which is the real cost of this fix.
4. Leave `t13` and `t17` red meanwhile. They are honest — they are the two assertions that caught this.
5. The S-6 / d-iv work verified earlier this session is unaffected: it concerns Engine A's ACA cliff
   solver and its own funding sale, and the clamp measurement stands.

**Open question for the maintainer:** whether v5.34 ships with this fixed, or ships the capital-gains
engine with the routing defect disclosed and fixes it at v5.35. Shipping it disclosed is defensible —
the error direction is conservative — but the disclosure would have to say that realized gains are
overstated for households whose RMD exceeds their spending need, which is most of them, and that is a
large caveat to hang on a release whose headline is that gains are now modelled correctly.
