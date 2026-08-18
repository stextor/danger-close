# DERIVATION — v5.38 step 1: expected figures, derived before the edit

**Pinned to:** v5.37 · `src/DangerClose.jsx` md5 `ff4dddcb585e2237e6c6a2643ded2ebb` ·
derived 2026-08-17 against a fresh clone of HEAD. Companion to
`SCOPE_v5_38_aca_sale_gain_tax.md` (Rev B, decisions resolved); this document is the §6
derivation the build must match — produced BEFORE any engine edit, per the v5.37 precedent,
so the edited engine has something to match rather than something to define.

## 1 · The instrument, and its validation record

`sim_ledger.mjs` is an independent re-implementation of Engine A's deterministic path for
MFJ / no-death / fixed-conversion households: its own bracket walk (marginal-slice
accumulation, not the engine's prev/upper loop), its own §86 SS-taxability worksheet, its
own AMT, gross-up, subsidy-contraction and pro-rata-basis expressions. It shares only the
law tables (Rev. Proc. 2025-32, CMS 2026, Rev. Proc. 2025-25 / HHS, Pub. 590-B) — the same
tables t1's Verify rows assert against primary sources. Deliberately out of its scope, and
enforced by a loud throw: single filers, deaths, annuity shares, bracket-fill/irmaaCap/
acaCliff solver policies, state codes, the enhanced ACA regime.

**Validation, mode "v537" vs the shipped bundle (`app_v537.mjs`, built from `ff4dddcb…`):**

- `validate.mjs`: **72/72 clean on the first run.** Two households (t22's BRIDGE verbatim;
  a pension variant) × three fixed strategies each; compared: every rounded aggregate
  (totTax, totIrmaa, totNiit, totConv, totAcaLoss, endTrad/Roth/Taxable, estate) to ±$1,
  every year of wealthByYr to ±$1, every acaSubByYr entry to ±$0.01, and acaFloorYrs keys.
- `case1_detail.mjs` re-validates the CASE1 fixture shape (large balances, $186K
  conversion) the same way: **clean.**

Two mechanics the validation forced into the sim, worth the build session's attention:
the demo **work taper** ($20K/$18K/$15K in retirement years 0–2) is ACTIVE for hand-built
P objects because the shipped example `PORTFOLIO` carries no `incomeStreams` — the
documented "neutralize global streams" trap runs the other way; and `stateTaxAnnual`
under `stateCode: null, stateRate: 0` is exactly $0 (legacy path).

## 2 · The v5.38 reference semantics (mode "v538")

The sim's v538 mode implements scope §3 and is the build's reference. Precisely:

1. The premium sale grosses up fixed-point (4 passes, the funding idiom):
   `sale = max(0, lost) + ltcgF(gain(sale), stack₂)`, clamped to the pool, where
   **`stack₂ = max(0, taxableOrd) + qdcg + saleGain`** — computed in the ACA block
   (the funding block's `_stack` is scoped inside its own branch and, in any case, omits
   `saleGain`; gains realized later in the year stack on gains realized earlier).
2. `gain` comes from the shared pro-rata rule (`realizeGain`); the realized gain's LTCG
   (`ltcgF(gain, stack₂)`) is charged to `totTax` (and `widowTax` when widowed); basis
   leaves with the sale; the pool loses the whole grossed-up `sale`, not bare `lost`.
3. The 3-pass subsidy contraction estimates the gain of the **grossed-up** sale — inside
   each contraction pass, the candidate `lost` is grossed up (nested 4-pass) before its
   gain enters `acaMagi`. One-pass-of-lost estimation would understate MAGI, the exact
   optimism d-iv exists to remove.
4. **Decision 1:** after the sale, `magiHist[yr] = magi + saleGain + acaGain` (the whole
   grossed-up sale's gain). Timing verified against source this session: within the year
   loop `magiHist[yr]` is only read at `yr + 2` (L4048 and the solver's L3899), so the
   late write cannot affect the current year.

Where the build's implementation makes a different micro-choice (rounding placement, pass
counts, loop order), the derivation figures below govern: match them, or change this memo
deliberately and re-derive — never adapt the tests to the engine silently.

## 3 · Fixtures and expected pins

Base shape shared by all fixtures (BRIDGE, verbatim from t22):

```js
{ single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable",
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0 }
```

### CASE1 — the taxed-gain + IRMAA-crossing fixture (scope §6 cases 1 and 1a in one)

BRIDGE shape with `taxableGainFrac: 0.6, taxableInit: 400000, tradInitA: 1200000,
tradInitB: 600000, rothInitA: 60000, rothInitB: 40000`, run at **fixed $186,000** against
its own no-conversion baseline.

| figure | v5.37 (engine-validated) | v5.38 expected | Δ |
|---|---|---|---|
| totTax | 310,906 | **314,708** | +3,802 |
| totIrmaa | 0 | **1,150** | +1,150 |
| totAcaLoss | 40,081 | 40,081 | 0 |
| endTaxable | 1,850,540 | **1,828,774** | −21,766 |
| endRoth | 6,756,858 | 6,756,858 | 0 |
| endTrad | 413,331 | 413,331 | 0 |
| estate | 8,929,796 | **8,908,031** | −21,765 |

Per-year pins (the hand-derivable ones):

| yr | lost | sale (was) | acaGain | **acaGainTax** | lookback MAGI (was) |
|---|---|---|---|---|---|
| 2027 | 19,545 | **21,478** (19,545) | 12,887 | **1,933** | 244,493 (231,607) |
| 2028 | 20,536 | **22,631** (20,536) | 13,969 | **2,095** | 242,909 (228,973) |

IRMAA: exactly one year moves — **2030: $0 → $1,150** (tier 1 × 1 person; spouse A turns
65 in 2030 and the lookback reads 2028). The 2028 crossing has healthy margin on both
sides: without the decision-1 term the lookback is **228,940**, with it **242,909**,
against a premium-year-2030 tier-1 threshold of **235,970** (= 218,000 × 1.02⁴) — ≈$7.0K
below and ≈$6.9K above, robust to multi-$K implementation drift (a $180K conversion
crossed by only $67 and was rejected for that reason). Two structural notes: the **2027**
gain feeds premium year 2029, where nobody is 65+ — inert by construction, a free
"crossing that correctly bills nothing" assertion; and **2029** realizes no ACA gain, the
in-schedule non-crossing year case 1a requires.

**The aggregate Δ is NOT the sum of the gain taxes.** 1,933 + 2,095 = 4,028, but
ΔtotTax = 3,802: the extra ~$4K of pool depletion shrinks later dividends, which shrinks
later ordinary/QDCG tax by ~$226 over the horizon. Pin the per-year gain taxes by hand
and the aggregates as measured; asserting ΔtotTax = Σ gainTax would be wrong.

### CASE3 — the 0%-bracket fixture (scope §6 case 3)

BRIDGE exactly as above (`taxableGainFrac: 0.5, taxableInit: 250000, tradInitA: 600000,
tradInitB: 300000, rothInitA: 60000, rothInitB: 40000`) at **fixed $60,000**: the premium
sale realizes **$9,798 (2027) and $10,738 (2028) of gain, and its LTCG is $0** — the
stack (taxableOrd ≈ $47K + dividends) plus the gain sits entirely inside the indexed 0%
band (top $100,878 in 2027). Consequently the grossed-up sale equals bare `lost`, and
**every returned figure is identical between v5.37 and v5.38** for this household — at
$60K, $40K, and $15K conversions alike. That identity is the pin: gain realized, tax $0,
nothing else moves, and an unmoved number is not a missed fix.

### Invariances (measured, both true in the sim)

`acaPremium: 0` household: identical across modes at every figure. The `none` strategy on
a bridge household: identical across modes. Both become byte-identity assertions in the
build's tests (through `runRothStrategies`, JSON-canonical).

## 4 · The hand-shown chain (CASE1, 2028) — follow it without the sim

Deduction: 32,200 × 1.02² = 33,500.88 → **33,501**. Ordinary: conv 186,000 + work taper
18,000 = 204,000; SS not yet claimed → ssT = 0; taxableOrd = 204,000 − 33,501 =
**170,499**. Dividends 5,421 (1.5% of the year's pool). Funding-sale gain 19,519. Stack₂ =
170,499 + 5,421 + 19,519 = **195,439**. Indexed 0% LTCG top: 98,900 × 1.02² = **102,896**
— the stack is already past it, and the 15% top (613,700 × 1.02² = 638,499) is far above,
so the ACA gain is taxed at a flat 15%. Gain fraction at sale time ≈ 13,969 / 22,631 =
0.6173; gross-up fixed point: sale = 20,536 / (1 − 0.15 × 0.6173) = 20,536 / 0.90740 =
**22,632** (±$1 rounding vs the ledger's 22,631). Tax = 0.15 × 13,969 = **2,095** ✓.

## 5 · Findings for the build session

- **0%-bracket gains are the COMMON case on modest households.** Every t22-BRIDGE-shaped
  run tested (conversions $15K–$60K) realized its ACA gains entirely inside the 0% band —
  the fix is a provable no-op there. The scope-§1 forgone-tax measurement came from
  bracket-fill strategies (large conversions). Exact taxed-gain tests need CASE1-sized
  conversions; t22's existing anchors on BRIDGE-shaped households should therefore
  survive unmoved — verify, don't assume.
- **t2 parity expectation refined:** the `rothAca` fingerprint household runs bracket-fill
  strategies (fill12/22/24 realize gains with large stacks — the §1 measurement showed
  ~$3.08K forgone there), so `rothAca` moves; `roth`/`rothCurrentEstate` (acaPremium 0)
  and the three MC engines must stay byte-identical. `INTENDED_DIFFS["v537→v538"] =
  ["rothAca"]` remains the declared-set expectation, from measurement at build.
- The solver mirror (`_estSaleGain`) gross-up is NOT exercised by these fixed-policy
  fixtures; §6 item 6's t22-group-H check covers it directionally at build.
- Files: `sim_ledger.mjs` (reference), `validate.mjs` (stage-1 gauntlet),
  `project.mjs` (diffs + sweep), `case1_detail.mjs` (CASE1 pins + shape validation).
  Re-run order after any sim change: validate → case1_detail → project.

## 6 · What remains (the build session's queue)

Steps 2–7 of the plan, unchanged: the engine edit per §2 above; the new t22 group
(CASE1, CASE3, invariances, extinction pair) with controls C14/C15 run-and-watched;
t2 `INTENDED_DIFFS`; t1 tag maintenance; full suite both legs + parity with the declared
set hand-verified; DOM diff re-point and Roth-tab measurement; METHODOLOGY inversion +
CHANGELOG in the ratified §8-4 shape; the NIIT/state finding registered; `index.html`
build + smoke; packaging incl. the knowledge-refresh list (stale STATUS files if desired,
`capture_gain_fp.mjs` retirement, `VERIFY.sh` manifest row).
