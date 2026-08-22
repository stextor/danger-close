# SCOPE — tidy-up items 4 and 7: the §86 ½-benefits cap, in two places

| Field | Value |
|---|---|
| Written | 2026-08-22, scoping session after the v5.44 ship |
| Target | **v5.45** |
| Base source | `src/DangerClose.jsx` md5 **`cd87419e7e8ae182c0efdb30cb7b1305`** (v5.44) |
| Kind | Modelling fix · `src/` change · version bump · new invariants · METHODOLOGY update |
| Status | **SCOPED — two decisions open (D-47a, D-47b), both blocking** |
| Grouped because | One defect, one statutory clause, one oracle, and **two contiguous income bands** — see §3 |

---

## 1. The defect, once

26 U.S.C. §86(a)(1) caps the includible amount at **half** the benefits:

```
para1 = min( ½ × SS , ½ × (provisional − base) )
```

Two places in the app drop the `½ × SS` half. They are **mirror images** — one in the tier the other
gets right:

| | Site (v5.44) | Which tier | Middle tier | Upper tier |
|---|---|---|---|---|
| **Item 4** | `taxableSSPortion` **L5016** | upper | correct | **defective** |
| **Item 7** | Roth tab **L8906** | middle | **defective** | correct (v5.42) |

```js
// item 4, L5016 — statute's para1 is min(½SS, ½(prov−T1)); the ½SS half is missing
const lower = 0.5 * Math.min(provisional - _ssThr1, _ssThr2 - _ssThr1);

// item 7, L8906 — caps at 85% of benefits where the statute caps at ½
else if (provisional > _ssT1) taxableSS = Math.round(Math.min((provisional - _ssT1) * 0.5, totalSS * 0.85));
```

## 2. Measured at v5.44 — and the recorded figure is wrong again

| | `SCOPE_FIX_tidyup_six.md` | **Measured** (joint) | **Measured** (single) |
|---|---|---|---|
| Item 4 | $2,375 | **$2,463** | **$1,838** |
| Item 7 | *not listed* | **$2,468** | **$1,850** |

**This is the third consecutive item whose recorded figure did not reproduce** (item 3: $13,724 →
$12,643; item 6: ~$105 → $483; item 4: $2,375 → $2,463). That is now a property of the document, not
a run of bad luck: **treat every figure in `SCOPE_FIX_tidyup_six.md` as an order-of-magnitude
indication and re-measure before quoting it.** Its *rankings* have held; its numbers have not.

Both overstate, so both are conservative — which is why neither has ever been reported.

## 3. Why they belong in one release: the bands are contiguous

Swept across benefits × income, the two defects **never overlap** — not one cell, joint or single —
and they sit directly against each other:

| | Provisional-income band (joint) | Benefits band |
|---|---|---|
| **Item 7** | $32,038 – **$44,000** | $25 – $11,975 |
| **Item 4** | **$44,013** – $48,913 | $75 – $11,975 |

$44,000 is the adjusted base amount. **A household with small benefits and rising income leaves one
defect and enters the other at that dollar.** Fixing one alone would leave a discontinuity at the
threshold — correct below, wrong above, or the reverse — which is a worse artefact than the present
symmetric error. They are one defect with one fix, in two files' worth of expression.

## 4. ⚠ Neither is reachable from the example household — both need a fixture

At $55,200 of benefits (both alive) and $15,600 (spouse B only), **both defects diverge in zero
cells**. Any joint household with benefits at or above **$12,000** is outside both bands, because the
overall 85% cap binds first. Single: **$9,000**.

**Assertions on the shipped household prove nothing about this release.** That is the v5.42 lesson
repeating in a third form: v5.42's defect was invisible at the slider default, item 2's is invisible
because of a claim date, and these two are invisible because the example household's benefits are too
large. The build must construct a household with **benefits around $7,000** — where both worst cases
sit — and drive provisional income across both bands.

## 5. ⚠ Parity is NOT the guardrail for this release

Measured, with a control. Patching item 4 moves **zero** fingerprint keys — but so does perturbing
`taxableSSPortion`'s return for *every* input by 1%. **`computeTaxPlan` is on no fingerprinted path
at all**, so a 9/9 parity result here says nothing about whether the change is contained.

That distinction matters and is the reason the control was run: a green parity would otherwise be
read as evidence of safety, exactly the "green suite is not a coverage claim" trap. **The suite is
the guardrail for item 4; parity is only the guardrail for item 7**, which sits in the Roth tab's
render block. State this in the release notes rather than reporting 9/9 as reassurance.

## 6. Site census (v5.44 — re-find with `funcmap.cjs`)

| # | Line | Expression |
|---|---|---|
| 4 | **L5016** | `const lower = 0.5 * Math.min(...)` — inside `taxableSSPortion`, `computeTaxPlan` L4924–5234 |
| 4 | L5014 | the middle tier — **correct, do not touch** |
| 4 | L5132 | `taxableSSPortion(ssTotal, ordinaryIncome + qdcg_y)` — the only call site |
| 7 | **L8906** | the Roth tab's middle tier |
| 7 | L8903–8905 | the upper tier — **correct since v5.42, do not touch** |
| ref | `qa/tools/hand_86.mjs::statute86` | the oracle, already in the suite |
| ref | L4384 / L5100 | Engine C's §86, corrected at v5.43 — the form to mirror |

## 7. Tests

1. **A shared fixture at ~$7,000 of benefits**, swept across both bands. One household, two
   provisional points — one below $44,000 and one above — so the contiguity in §3 is itself asserted.
2. **Dollar-exact for item 4**: `computeTaxPlan` is exported through the shim, so no §M ceiling.
3. **Item 7 via the DOM** at ±$500, or better, by asserting the expression's structure in `t1` and
   its arithmetic through the fixture.
4. **The continuity invariant**: no discontinuity at the adjusted base amount. This is the assertion
   that would have caught fixing only one of the two.
5. **The neighbouring correct tiers pinned as unchanged** — item 4's middle tier and item 7's upper
   tier, both of which this release must not touch.
6. **Negative controls**: each cap removed separately · the threshold pair · the 85% overall cap.
   Expect at least one no-op on the fixture — investigate it, do not soften it (§B2).
7. **`t24`, `t25`, `t26` unchanged** — none of the three touches the affected band.

## 8. Out of scope

Items 2, 5, 6 · `div_y`/`capGain_y` · the §M hoist · `runRothStrategies` · Engine C and Engine D's
§86, both correct.

## 9. Open decisions — BOTH BLOCK

**D-47a — one release or two?** I recommend **one**. The bands are contiguous, the oracle is shared,
and the fixture is the expensive part — building it twice for two two-thousand-dollar fixes is poor
value. The counter-argument is the standing preference for the smallest possible before/after
witness, and item 4 sits in an engine while item 7 sits in a render block, so a single release mixes
the two kinds. **If you prefer two, item 4 first** — it is the one parity does not watch.

**D-47b — how is the fixture installed?** `applyLoadedData` takes a wrapper and mutates module
globals **without re-rendering** (§C), so a DOM fixture must be parked off the target tab and driven
back. For item 4 the engine can be called directly with a constructed argument set, which avoids the
trap entirely. Options: **(i)** engine-level fixture for item 4, DOM fixture for item 7; **(ii)** one
DOM fixture for both; **(iii)** engine-level for both, accepting that item 7's render path is then
covered only structurally. **I recommend (i)** — it puts each assertion at the lowest level that can
carry it, and keeps item 4 dollar-exact.
