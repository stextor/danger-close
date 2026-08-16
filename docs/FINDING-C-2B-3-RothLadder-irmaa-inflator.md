# FINDING C-2B-3 — The Roth ladder table indexes the IRMAA cliff at 3%/yr, and hardcodes MFJ

**Status: EXECUTED** (arithmetic verified against the source's own expression; the rendered figures
are not read from a jsdom run — see §6).

**Build:** v5.13 · `src/DangerClose.jsx` md5 `0ed9e140cd9163e4523d8ff71959d56c` (commit `a2ea89b`)
**Re-verified against:** v5.14 · md5 `452626b89c509e44d0a1ccf4ec33cda2` (commit `d40381a`) — defect present identically
**Date:** 2026-08-09 · **AMENDED 2026-08-09 — severity raised MEDIUM → HIGH**
**Severity: HIGH** · **direction: NON-CONSERVATIVE on both channels** · **partially disclosed, and the
disclosure contradicts the arithmetic**
**Status: CLOSED — fixed and shipped at v5.15.** Extinction invariant:
`t16_roth_ladder_filing.mjs` (21 checks; negative-controlled against v5.14, where it fails 9).

> **Outcome written back 2026-08-09, at the release that fixed it** — the practice adopted after
> C-2C-4 sat stale for a release. Two corrections to what this document said:
>
> **The magnitude was understated.** §0 estimated federal tax "~40% too low" from hand arithmetic on
> $K-rounded display values, and labelled it indicative. Executed: the single filer's 2029 row moved
> from `TAXABLE $61K · 12% · FED $6.7K` to `$78K · 22% · $11.5K` — a **72%** increase.
>
> **The census was short.** The scope listed ten sites; there were **thirteen**. The Social Security
> provisional threshold was three lines rather than one, and two of them hardcoded bare `32000` /
> `44000` literals — bypassing `TAX_CONSTS` entirely, which is the same pattern as the IRMAA base and
> the third time it has produced a defect.
>
> What v5.15 did NOT do: the ladder still computes its own tax rather than calling the shared Roth
> engine. That duplication is the root cause and remains open as the recorded intended direction.

---

## 0. AMENDMENT — the prerequisite in §5 was answered, and it makes this a bigger finding

§5 of the original text left one question open and said it had to be settled before scoping: *is the
Roth ladder table gated off for single filers?* It said that if the tab were gated, the filing-status
half shrank to a survivor question, and if it were not, "the ladder's tax figures are wrong for every
single filer, which is a larger finding than this one."

**It is not gated. Executed against v5.14 by driving the tab with a single-filer household:**

| Single-filer household, 2029 ladder row | Shown |
|---|---|
| TAXABLE | $61K |
| RATE | **12%** |
| FED TAX | $6.7K |
| MAGI | $95K |

Both figures are wrong, and they compound:

- **The deduction.** MAGI $95K − TAXABLE $61K is a $34K gap. That is `TAX_CONSTS.MFJ_STD` ($32,200)
  plus the senior extra. A single filer's deduction is roughly half that, so taxable income is
  understated by ~$17K before any tax is computed.
- **The brackets.** A 12% marginal rate is shown on $61K of taxable income. Single's 12% bracket ends
  near $53K in 2029 dollars — that household is in the **22%** bracket. The tab is reading
  `TAX_CONSTS.MFJ_BR`, where 12% runs to ~$107K.

Hand arithmetic on the displayed figures puts the federal tax roughly **40% too low** for that row.
That figure is computed off $K-rounded display values and is **indicative, not measured** — pinning
it exactly is scoped work.

**So this finding is no longer "an IRMAA cliff uses the wrong inflator." It is: every federal tax
figure on the Roth tab is wrong for every single filer, and the IRMAA cliff is wrong for everyone.**

### Two further discoveries from the same census

**(a) The same tab contains a correct engine and an incorrect one, side by side.** The ladder table
(L7457–~7600) runs its own private tax arithmetic with the hardcoded constants above. The strategy
comparator and solve-for grid *below it on the same screen* (L7862+, L7998+) build proper `P` objects
carrying `single`, `deathYr1` and `survivor`, and call **Engine A**, which handles filing status
correctly and — since v5.14 — the death year too. A single filer therefore sees two different tax
pictures for the same household on one tab, and nothing explains the difference.

**(b) The tab's own assumptions box contradicts its arithmetic.** L7773 tells the reader
*"thresholds indexed ~2%/yr"*, while L7477 and L7563 index the IRMAA threshold at **1.03**. The app
states one rate and computes another.

### Adjudication: "partially disclosed", stated precisely

The assumptions box does label its constants as married — *"Standard deduction MFJ"*, *"provisional
income > $44K MFJ"*, *"IRMAA: MFJ threshold ~$218K+"*. So the app is honest about **what it used**.
It does **not** say that those figures are inappropriate for a single filer, does not vary them, and
does not warn. An attentive single filer could infer the problem; the numbers remain wrong either
way. That nuance is why the direction line above says *partially disclosed* rather than
*undisclosed* — but it does not soften the severity, because a label is not a calculation.

### Why HIGH rather than MEDIUM

1. **Whole-tab, not one figure.** Taxable income, marginal rate, tax owed, and the
   headroom-to-24%-bracket readout people use to size conversions are all affected.
2. **Both channels point the same way.** Understated tax makes conversions look cheaper; the
   overstated cliff means fewer crossings get flagged. Where two errors partly cancel (Engine D at
   C-2C-4) MEDIUM is arguable. Here they reinforce: *convert more than you should.*
3. **~40% on the headline number**, against LOW-rated F-2B-1's ~3.9% in the *conservative* direction.
4. **The Verify tab cannot catch it.** Verify asserts the constants, not which constant an engine
   reaches for. Green Verify, married brackets.

The argument for keeping MEDIUM is prevalence — the app targets couples. I do not find it persuasive:
severity should describe the effect on an affected user, and prevalence belongs to sequencing. The
single-filer branch is deliberate, has its own suite (`t6_single.mjs`, which passes 18/18 and does not
reach this tab's arithmetic), and had three defects fixed for it at v5.10.1.

**Scoped in `SCOPE_FIX_roth_tab_filing_status_v5_14.md`.**

---

**Found:** while verifying the site census of `SCOPE_FIX_irmaa_indexation_v5_13.md` before building it.
**Related:** F-2B-1 / F-2B-2 (`FlawsToFix-v5_10_2-Phase2B.md`) — same constant, **different defect**;
deliberately kept out of that scope and given its own release.

---

## 1. What the code does

The Roth tab's **conversion-ladder projection** — a separate engine from Engine A, the strategy
comparator — computes its own IRMAA cliff (L7402, L7411, L7497):

```js
const irmaaBase = IRMAA_CONSTS.MFJ[0];                                          // L7402
…
irmaaThreshold: Math.round(irmaaBase * Math.pow(1.03, year - _asOfYrRoth)),      // L7411
…
const irmaaYear = year + 2;                                                      // L7496
const irmaaThresholdLookback = Math.round(irmaaBase * Math.pow(1.03, irmaaYear - _asOfYrRoth));
const triggersIrmaa = magi > irmaaThresholdLookback;                             // L7498
```

Two independent problems in three lines:

1. **The inflator is `1.03`, not `1.02`.** Every other threshold in the app — federal brackets,
   standard deduction, IRMAA tiers in Engines A and C, ACA figures — indexes at 2%/yr. METHODOLOGY
   states that rate explicitly and gives a conservatism rationale for choosing it (thresholds assumed
   to grow *slower* than income, producing bracket creep, so the model overstates future burden). This
   site does the opposite.
2. **The base is hardcoded `IRMAA_CONSTS.MFJ[0]`.** There is no single-filer branch and no survivor
   branch. A single filer is scored against the married cliff, which is exactly twice their own.

**One thing this site gets right, and it is worth recording:** it indexes to `irmaaYear = year + 2`,
the **premium** year. That is the correct behaviour that F-2B-1 finds missing in Engines A and C. So
the app currently contains both the right and the wrong answer to the same question, in two engines,
and neither is disclosed.

---

## 2. Magnitude — computed from the source's own expression

Base 2026 MFJ cliff $218,000; app inflator `1.03^(premiumYr − 2026)`; correct at the app's own stated
2% indexation:

| Premium year | Engine threshold | Correct MFJ (2%) | Overstated by | Correct Single (2%) | Overstated by |
|---|---|---|---|---|---|
| 2028 | $231,276 | $226,807 | +2.0% | $113,404 | **+104%** |
| 2036 | $292,974 | $265,741 | +10.2% | $132,870 | **+120%** |
| 2046 | $393,732 | $323,937 | **+21.5%** | $161,968 | **+143%** |
| 2056 | $529,143 | $394,877 | **+34.0%** | $197,438 | **+168%** |

The 1%/yr gap compounds, so the error grows without bound across a 30-year plan — unlike F-2B-1,
whose ~3.9% offset is constant.

---

## 3. Direction — NON-CONSERVATIVE, and undisclosed

`triggersIrmaa` drives two user-visible outputs on the Roth tab: the ladder row's MAGI turns red when
it crosses the cliff (L7638), and the row prints `Thr $NNNK` (L7739).

An overstated threshold means the app **fails to flag cliff crossings that will actually happen**. A
household converting into the ladder is told it has headroom it does not have, and finds out two years
later when the premium arrives. That is the wrong direction for a tool whose identity is deliberate
pessimism, and it is the direction the app's own inflation section promises it does not take.

For a **single filer** the effect is severe rather than gradual: by 2046 the app would flag a cliff at
$394K where the real Single cliff is $162K.

No disclosure exists. METHODOLOGY's inflation section states 2%/yr for tax-threshold indexation
without exception; the Verify tab asserts the *constants* but not the *rate any engine applies to
them*, so a green Verify tab does not catch this.

---

## 4. Why this is NOT part of the indexation scope

`SCOPE_FIX_irmaa_indexation_v5_13.md` covers F-2B-1 (threshold indexed to the MAGI year) and F-2B-2
(top tier not frozen). Both are one mechanism — *which year* the inflator is evaluated at — and both
are currently **conservative**.

This finding is a different mechanism (*what rate* the inflator uses, and *which filing status* the
base comes from), sits in a different engine, and runs the **opposite direction**. Folding it in would
put two conservative corrections and one non-conservative correction in a single CHANGELOG entry and
make the net effect on any household unreadable. Kept separate on that basis.

---

## 5. Recommended handling

**Fix, and treat the filing-status half as the larger problem.** The rate is a one-character change;
the hardcoded MFJ base is a missing branch, and it is not the only one in this block — the same
projection hardcodes `TAX_CONSTS.MFJ_STD` and `TAX_CONSTS.MFJ_BR` (L7393–7394). Whether the ladder
table is MFJ-only *by design* for single filers is **not established here** and must be checked before
scoping: if the whole tab is gated off for singles, the filing-status half of this finding shrinks to
a survivor question; if it is not, the ladder's tax figures are wrong for every single filer, which is
a larger finding than this one.

Suggested next step: a short scope that (a) confirms what single filers actually see on this tab,
(b) routes the threshold through the same shared helper the indexation fix introduces, so there is one
place where an IRMAA threshold is computed, and (c) decides the survivor case in line with v5.13.

---

## 6. Honesty statement

Every line reference was read from the canonical v5.13 source this session. The figures in §2 are
computed from the source's own expression against the app's own stated 2% rate — they are arithmetic,
**not** read from a rendered ladder table, so the claim is "this is what the expression yields," not
"this is what a user saw." The user-visible consequences in §3 are traced from `triggersIrmaa` to its
two render sites by inspection. The scope of the MFJ hardcoding beyond the IRMAA threshold (standard
deduction and brackets at L7393–7394) is **observed but not investigated**, and is flagged in §5 as a
question rather than asserted as a defect.
