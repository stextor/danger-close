# SCOPE — the six deferred corrections (the "tidy-up")

**Status: SCOPED. Three decisions open (§7). One item should probably be pulled OUT and shipped on
its own — see §2.**

| Field | Value |
|---|---|
| Written | 2026-08-21 |
| Target | v5.42 or v5.43, depending on ordering against `SCOPE_FIX_roth_tab_div_capgain.md` |
| Base source | `src/DangerClose.jsx` md5 **`18152190e9b699529642ae2983b3ae2c`** (v5.41, current) |
| Kind | Modelling fixes. `src/` change · version bump · new extinction invariants · METHODOLOGY update |

These six were each deferred by an earlier scope as small, conservative and independent. **Measuring
them changed that picture for two of the six.** Every figure below was computed in the scoping
session against the shipped source and the shipped example household; line numbers are v5.41's and
must be re-found with `qa/tools/funcmap.cjs`.

---

## 1. The six, ranked by measured worst case

| # | Item | Site | Worst measured error | Direction |
|---|---|---|---|---|
| **1** | **§86 upper-tier cliff, Roth tab** | L8885 | **$38,030** on the *shipped* household | overstates |
| **2** | Spouse B's SS ungated by start date | L8857 | up to **$15,600/yr** phantom SS | overstates |
| **3** | `_perRmd`'s `noConv` basis | L8967 | **$13,724 (19.3%)** on the shipped household | overstates |
| **4** | Engine B's omitted ½-benefits cap | L4990–4997 | **$2,375**, narrow band only | overstates |
| **5** | HSA inside the dividend base | `otherTaxableInit` | **$300/yr** (71% of the term) | overstates |
| **6** | Annuity money inside `_perRmd`'s RMD basis | L8961 | **~$105/yr** | overstates |

All six run in the conservative direction, which is why none of them ever blocked a release. That is
also why they have survived: nothing looks wrong, the plan just looks slightly worse than it is.

## 2. Item 1 is not a tidy-up item, and the record on it is wrong

The v5.41 build brief described this as *"the §86 cliff at L8841–8844 (real, cheap, **$0 on every
household measured**)."* That is true **only at the $70,000 slider default**, and the default is the
one position where it happens to be $0.

The code takes the upper tier as a cliff:

```
if (provisional > _ssT2) taxableSS = Math.round(totalSS * 0.85);
```

26 U.S.C. §86(a)(2) phases in instead: `min( 0.85 × SS,  0.85 × (prov − adjbase) + min(para1, ½(adjbase − base)) )`.
So the moment provisional crosses $44,000 the app jumps straight to the full 85% of benefits,
skipping the entire phase-in. The two converge only at provisional ≈ $92,141 for this household.

**Measured on the shipped example household, ladder year 2032, by slider position:**

| Slider | Provisional | §86 statute | App | Error |
|---|---|---|---|---|
| $10,000 | $42,400 | $5,200 | $5,200 | $0 |
| **$15,000** | $47,400 | $8,890 | $46,920 | **+$38,030** |
| $20,000 | $52,400 | $13,140 | $46,920 | +$33,780 |
| $30,000 | $62,400 | $21,640 | $46,920 | +$25,280 |
| $50,000 | $82,400 | $38,640 | $46,920 | +$8,280 |
| **$70,000 (default)** | $102,400 | $46,920 | $46,920 | **$0** |

At slider $15,000 the app reports **5.3×** the correct taxable Social Security. That figure then
propagates into `magi`, `grossTaxable`, `tax`, `marginalRate`, `headroom24` and the IRMAA verdict —
every column on the ladder table.

**This is the largest remaining defect in the Roth tab and it dwarfs the dividend and capital-gain
terms** (§3 of the div/capgain scope: $420–$720/yr). Recommendation: **pull item 1 out and ship it
alone**, before or instead of the div/capgain release. It is one expression, the correct formula is
already written and verified in `qa/tools/hand_86.mjs`, and the effect is large enough to clear the
§M ±$500 rendering ceiling without a synthetic household — which the div/capgain release cannot do.

**A caution that belongs with it.** Engine C does not implement §86 at all: `ssTaxable = ssTot * 0.85`,
flat, regardless of provisional income (L4394). Fixing the Roth tab makes the tab **more correct than
the engine it is being reconciled to**, and the two will disagree by up to $46,920 in the phase-in
region. That directly complicates the term-set-equality invariant the div/capgain scope is built
around, and it is the strongest argument for doing item 1 **first** and deciding Engine C's §86
before writing that invariant.

## 3. Items 2 and 3 — worth more than "tidy-up" implies

**Item 2 — spouse B's Social Security is ungated.** Spouse A's is gated with partial-month handling:

```
const spouseASS = year > _ssAYearRoth ? _rsSsA * 12 : year === _ssAYearRoth ? _rsSsA * _ssAPartialMonths : 0;
const spouseBSS = _rsSsB * 12;                       // ← every ladder year, no gate
```

`PLAN_TIMELINE` carries `ssB_date` (L657, L691) and the ladder never reads it — there is no
`_ssBYearRoth`. On the example household B claims in 2029, the ladder starts 2029, so the error is
$0. For any household where B claims **after** the ladder starts, the tab credits B's full annual
benefit in years B is not yet receiving it — up to **$15,600/yr** on the example figures, in both
provisional income and MAGI. A household where B defers to 70 would see this in four to five
consecutive ladder years.

`spouseBSS` is also **not gated on `single`**, while `_perRmd` two hundred lines below does gate
(`tl.single ? 0 : getSSB()`). `t6` passes, so either the single path zeroes it elsewhere or `t6` does
not cover it — **that must be established during the build, not assumed.**

**Item 3 — `_perRmd`'s `noConv` counterfactual grows the balance too far.** `mk()` computes
`yrs = yr − tl.asOfYear` and applies it to `t0`, which is a **`rothLadderStart` (2029) balance**, not
an `asOfYear` (2026) one. So spouse A's card grows a 2029 balance by **13** years for a 2039
distribution when the Pub. 590-B basis is the 31 December 2038 balance — **9** years from 2029.

| Card | Shipped | Correct basis | Overstated |
|---|---|---|---|
| A, no-conversion RMD | $85,008 | $71,284 | **+$13,724 (19.3%)** |
| B, no-conversion RMD | $17,197 | $14,421 | +$2,776 (19.3%) |

v5.41 fixed the *with*-conversion side of these cards onto the prior-31-December basis and
deliberately left `noConv` alone under D-4. The consequence is that the rendered
*"Combined RMDs reduced by $X/yr"* line (L9130) now differs two bases, so **the headline saving on
that card is overstated by roughly 19%**. That is a user-facing number and the most visible of the six.

## 4. Items 4, 5, 6 — genuinely small, and bounded

**Item 4 — Engine B omits the ½-benefits cap.** Statute: `min(para1, ½(adjbase − base))` where
`para1 = min(½SS, ½(prov − base))`. Engine B computes `0.5 * Math.min(prov − T1, T2 − T1)`, dropping
the `½ × SS` term. A full sweep (SS $1,000–$20,000 × non-SS $30,000–$90,000, joint) bounds the
overstatement at **$2,375**, peaking at SS ≈ $7,250. It vanishes above SS ≈ $12,000 because the
overall 85%-of-benefits cap binds first. **It cannot affect any household with normal Social
Security** — it needs joint benefits under $12,000/yr.

**Item 5 — the HSA is in the dividend base.** `otherTaxableInit()` counts `taxType === "hsa"`
alongside `"taxable"`. On the example household the sleeve is **$36,000, of which $15,000 is the
HSA** — so `div_y` is $720 where $420 is correct, a **71% overstatement** of the term. Small in
dollars, large as a fraction, and it is the base the div/capgain release would otherwise copy.
`qa/tools/derive_rmd_expectations.mjs` used $21,000 and had this **right** where the engine has it
wrong. Blast radius: `taxableInitAll` feeds Engine C, `computeTaxPlan`, `runRothStrategies` and four
Engine-A P-constructions, so this is a shared-helper change and needs a full parity run.

**Item 6 — annuity money is in `_perRmd`'s RMD basis.** `t0` seeds from `tradInitA/B`, not
`rmdInitA/B`. On the example household `tradInitB` is $218,600 and `rmdInitB` is $211,600 — a $7,000
non-qualified annuity that carries no RMD. `annShareB` (3.2022%) exists in `retireStartBalances`
precisely for this. Effect on B's card: **~$105/yr**. `annShareA` is 0, so spouse A is unaffected and
**the v5.41 tail-year figures are untouched by this**.

## 5. Sites

| Item | Site (v5.41, re-find) |
|---|---|
| 1 | `<anon>@8719` L8885, the `provisional > _ssT2` branch. Correct formula in `qa/tools/hand_86.mjs::statute86` |
| 2 | L8857 `spouseBSS`; needs an `_ssBYearRoth` + partial-month mirror of L8860, and a `single` gate |
| 3 | L8967 `mk()` — `yrs`, and `fin()`'s `noConv` / `noConvTrad` |
| 4 | `taxableSSPortion` L4990–4997 (Engine B) |
| 5 | `otherTaxableInit()` — shared helper, wide blast radius |
| 6 | L8961 `t0` — `tradInitA/B` → RMD-bearing basis via `annShareA/B` |

## 6. Tests

Each item ships with a dollar assertion at a household where it actually bites, plus a
**negative control that must fire**, plus an unchanged-elsewhere pin. Specifically:

1. §86: assert the ladder against `statute86` at **slider $15,000, $20,000, $50,000 and $70,000** —
   the last being the $0 case that made this look harmless. `hand_86.mjs` is already written from the
   statutory text and is the independent oracle; promote its comparison into a real suite.
2. Spouse B SS: a fixture where B claims after the ladder starts; assert the pre-claim years carry
   **no** B benefit. Plus a single-filer assertion, since that gate is missing too.
3. `noConv`: assert both cards and the rendered *"reduced by"* line; pin that both cards now sit on
   the **same** basis, which is the invariant that stops them drifting apart again.
4. Engine B: assert at SS ≈ $7,250 (the measured peak) and at SS $55,200 (where it must be $0).
5. HSA: assert `otherTaxableInit()` excludes HSA; **full parity run is mandatory** — this is the only
   one of the six that can move an engine fingerprint.
6. Annuity basis: assert B's card uses the RMD-bearing basis and that A's is unchanged.

**Precision (OPERATIONS §M).** Items 1, 2 and 3 clear the ±$500 DOM ceiling comfortably. Items 4, 5
and 6 do **not** — $2,375 does, but $300 and $105 do not, so those two need either module-level
assertions (both are reachable: `otherTaxableInit` is in the shim; `_perRmd` is not) or a fixture
scaled to clear the ceiling. Decide during scoping, not mid-build.

## 7. Open decisions — Steve

**D-1 — split item 1 out?** I recommend **yes**: ship the §86 cliff alone and first. It is the
largest defect of the seven now on the table (these six plus div/capgain), it is one expression, its
oracle already exists, and it clears the rendering ceiling without a synthetic household. The other
five then become a genuine tidy-up.

**D-2 — does Engine C get §86?** Engine C is currently flat 85% and has been designated the
comparison reference that must not be edited. Fixing item 1 makes the tab more correct than its own
reference. Options: (a) leave Engine C flat and accept that the tab and engine now legitimately
disagree below provisional ≈ $92,000, documenting it; (b) give Engine C the real §86, which is a
larger release with a parity impact; (c) hold item 1 until (b) is done. I lean **(a)**, with the
disagreement recorded in METHODOLOGY and the term-set-equality invariant written as *term sets equal,
values may differ* — but this decides how the div/capgain scope's central invariant is phrased, so it
cannot be deferred past that release.

**D-3 — item 5 at the shared helper, or not at all?** Changing `otherTaxableInit()` touches every
engine and needs a full parity run with intended-diff registration. The alternative is leaving it and
documenting the HSA inclusion as a known simplification. I lean toward fixing it at the helper, since
leaving it means the div/capgain release copies a base that is 71% wrong — but it is the only item
here that can move a fingerprint, and that is Steve's call.

## 8. Out of scope

Engine C's flat 85% unless D-2 says otherwise · the preferential-rate tax path (div/capgain scope,
D-1) · the §M hoist of the ladder block · anything in `runRothStrategies`, which is the parity
witness.

## 9. Harness warts, cheap, not modelling

Not part of the six; fold into whichever release comes next. `controls.sh` is pinned at **v5.38** and
cannot run against the current pair — this bites the *next* session, since every item above needs
negative controls. `t15` defaults to tag `v514` and dies if run bare. `census.cjs` double-reports
object-shorthand positions (over-reports, safe). **`t8`'s call-site check is a text regex that counts
comments** and turned red during the v5.41 build on a comment with no code change — OPERATIONS §B1
says site counts go through AST, and `t8` is doing the thing §B1 forbids. The qa-baseline README does
not mention that `t8`, `t14`, `t16` and `t19` resolve `../DangerClose.jsx` by that exact name while
the baseline suites take a version tag.
