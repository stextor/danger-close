# FlawsToFix — Standing Code Audit, Phase 2 · Sub-phase 2A (Section C: Federal core)

**Build under audit:** v5.10.2
**Source:** `DangerClose-v5_10_2.jsx` · md5 `7ddda3585abb9dc2c40fa4fbfc46967a`
**Prior (comparison baseline):** v5.10.1 · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc`
**Date:** 2026-08-07
**Governing scope:** `SCOPE_AUDIT_PHASE2_v5_10_2.md` (decisions D-1…D-5 binding)
**Sub-phase:** 2A — federal core (ordinary brackets both statuses; standard + age-65 + OBBBA deductions;
LTCG stacking; NIIT; SS taxability). Both engines, cross-compared, all borders ±$1.
**Sub-phases NOT covered here:** 2B (IRMAA + indexation), 2C (first-death), 2D (break-even + account
completeness), 2E (state) — per the confirmed order D-1.

Every line number below was read from the canonical source in this session. None is recalled.

---

## Freshness check (re-run this session — not inherited from the scope doc)

The scope document records a freshness check from a *prior* session; per PROJECT_INSTRUCTIONS §A it was
re-run independently here before any work:

| Step | Result |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` names current = v5.10.2, md5 `7ddda358…`; prior = v5.10.1, md5 `2ee4d1e5…` | read |
| `md5sum DangerClose-v5_10_2.jsx` | `7ddda3585abb9dc2c40fa4fbfc46967a` — **matches manifest** |
| `md5sum DangerClose-v5_10_1.jsx` | `2ee4d1e5d0f06fa89ee6980fd97984bc` — **matches manifest** |
| `CHANGELOG.md` newest entry | v5.10.2 — **agrees with manifest** |

**PASSED.** Work proceeds against v5.10.2.

---

## Summary of 2A

**Engine A (Roth strategy comparator) federal core is verified correct to the dollar** — 76/76 dollar-exact
assertions in the new `qa/t10_taxcases.mjs`, covering both filing statuses at every ordinary-bracket
boundary ±$1, the age-65 additional deduction, LTCG stacking at the 0%/15% break, NIIT at its MAGI border
and interior, and Social Security taxability across all three provisional-income tiers with confirmed
flow-through into a non-zero federal figure. The engine's arithmetic matches an independent hand
computation built from IRS Rev. Proc. 2025-32, IRC §1411, and IRC §86.

**One finding (F-2A-1, MEDIUM, user-side, disclosure defect):** the OBBBA $6,000 senior bonus deduction is
modeled by the Taxes-tab engine but deliberately omitted by the Roth comparator, so the two engines report
different federal tax for the same 65+ household-year (≤ 2028, MAGI below phase-out) — and the app describes
the deduction's modeling status **three contradictory ways**. Under decision D-3 a cross-engine divergence
is a finding unless documented *and* disclosed; this one is documented in code but the user-facing
disclosure is self-contradictory. See below.

**Two candidates examined and dismissed** (recorded for honesty, so they are not re-litigated as "open"):
the whole-dollar rounding of the reported lifetime total (correct behavior — O-2A-1), and a suspected
"double phase-out" of the OBBBA bonus for couples (dismissed against primary source — the per-spouse 6%
rate the engine uses is the statutory structure; C-2A-1).

**Honest partial (§ Remaining).** 2A verifies **Engine A** to the dollar and establishes the
case-construction harness every later sub-phase reuses (the point of running 2A first, per D-1). The
dollar-exact confirmation of **Engine B (Taxes tab)** via DOM extraction is the one 2A task that remains;
its federal-core helpers are shown structurally identical to Engine A's by source inspection, and its one
federal-core divergence (OBBBA) has its formula verified correct against primary source — but per the
standing rule that inspection is not verification, the Engine-B execution run is listed as remaining rather
than claimed as done.

---

## Method / harness (the D-1 deliverable)

Section C requires computing each figure by hand from primary law *before* looking at engine output, then
running the engine and comparing to the dollar. The harness that makes this executable:

- **Engine A is directly callable** via the test shim's `runRothStrategies(P)`. Its result carries the
  horizon-aggregate `totTax`. **Single-year isolation:** set `retireYr = horizonYr = asOfYr = 2026`, so the
  engine's year loop runs exactly once and a strategy's `totTax` equals that one year's total tax.
- **Neutralizers** so `totTax` equals only the federal figure under test:
  - *Global income streams / demo work taper.* `spouseBWorkTaper()` (L1128–1132) injects a hardcoded demo
    taper ($20k/$18k/$15k in retirement years 0/1/2) **whenever `getIncomeStreams().length === 0`.** A single
    income stream with `monthly: 0` makes the array non-empty (suppressing the taper) while contributing $0
    (the sum skips `amt <= 0`, L468–469). This is the concrete form of the standing "neutralize global income
    streams" trap; omitting it silently adds ~$1,920 of tax at zero pension.
  - State off (`stateCode: null`, `stateRate: 0`); no work income (no FICA); income kept below the 2026 AMT
    exemption (so AMT = $0); no MAGI two years prior inside a one-year window (so IRMAA = $0); `tradInit = 0`
    (so conversion headroom = 0 and every policy converts $0 — read the `none` strategy).
- **`asOfYr` is mandatory** on every P (the standing trap: omitting it NaNs all taxes). Present in every case.
- **Reference arithmetic is independent.** Expected values come from a bracket-walk / LTCG-stack / SS-tier
  reference written fresh in `t10` from the IRS-verified constants — never copied from the app — and that
  reference is itself anchored by fully hand-worked longhand literals at each bracket top (the appendix).
- **The engine rounds the reported total to whole dollars once** (`totTax: Math.round(totTax)`, L3640),
  accumulating exact per-year tax first (L3560). So expected = `Math.round(exact)`; the engine's whole-dollar
  output must equal the hand figure rounded to whole dollars — which it does in all 76 cases.

---

## What was verified against primary sources (not assumed)

Section C spot-checks a handful of constants against primary law to confirm the Verify tab is not merely
self-consistent, then tests the formulas that consume them. The 2A cases happen to touch far more than five,
so all were confirmed:

| Constant (app site) | App value | Primary source | Match |
|---|---|---|---|
| Ordinary brackets, single (`SGL_BR`, L791–793) | 12400 / 50400 / 105700 / 201775 / 256225 / 640600 | IRS IR-2025-103 (Rev. Proc. 2025-32) | ✔ all seven |
| Ordinary brackets, MFJ (`MFJ_BR`, L794–796) | 24800 / 100800 / 211400 / 403550 / 512450 / 768700 | IRS IR-2025-103 | ✔ all seven |
| Standard deduction (`SGL_STD`/`MFJ_STD`, L783) | 16100 / 32200 | IRS IR-2025-103 | ✔ |
| Age-65 extra deduction (`SENIOR_EXTRA_*`, L803) | 2050 (S) / 1650 (per spouse M) | Rev. Proc. 2025-32 §2.14 | ✔ |
| LTCG breakpoints (`SGL_LTCG`/`MFJ_LTCG`, L797–798) | 0% ≤ 49450/98900; 15% ≤ 545500/613700 | Rev. Proc. 2025-32 §3.03 | ✔ |
| NIIT thresholds (`SGL_NIIT`/`MFJ_NIIT`, L799) | 200000 / 250000, unindexed | IRC §1411 | ✔ (correctly not inflated) |
| AMT exemption/phase-out (`*_AMT_*`, L800–801) | 90100/140200; 500000/1000000 | IRS IR-2025-103 | ✔ |
| SS provisional thresholds (`SS_THR*`, L804–805) | 25000/34000 (S); 32000/44000 (M) | IRC §86 | ✔ (statutory, unindexed) |
| OBBBA senior bonus (Engine B, L8191–8201) | $6,000/person 65+, 2025–2028, 6% of MAGI over 75000/150000 | OBBBA P.L. 119-21 §70103 / IRC §151(d)(5) | ✔ formula correct (see C-2A-1) |

The Verify tab's constants are genuinely correct, not merely internally consistent.

---

## FINDING F-2A-1 — OBBBA senior bonus: two engines disagree, and the app discloses its status three contradictory ways (MEDIUM · user-side · disclosure defect)

**What.** For a household with at least one spouse 65+, in a tax year ≤ 2028, with MAGI below the phase-out
ceiling, the two tax engines compute **different federal tax for the same household-year**:

- **Engine B (Taxes tab)** applies the OBBBA $6,000-per-person senior bonus deduction (L8191–8201). Its
  phase-out formula is *correct* against primary source (see C-2A-1).
- **Engine A (Roth comparator)** deliberately omits it (L3400–3402), for two defensible modeling reasons
  stated in a code comment: the provision expires before typical conversion windows, and including it would
  make the bracket-fill solver circular (the deduction depends on MAGI, which depends on the conversion).

That divergence, on its own, is a *documented* modeling choice. The finding is the **user-facing
disclosure**, which contradicts itself three ways about whether the deduction is modeled at all:

1. Taxes-tab header text says it **is** modeled (L8299).
2. Taxes-tab footnote on the same tab says it is **not** (L8527).
3. Field Manual §13 lists it under "NOT modeled."

At most one of those can be right (in fact #1 is right for the Taxes tab and #2/#3 are wrong there, while for
the Roth tab the deduction genuinely is not modeled). A user comparing the Roth tab's tax against the Taxes
tab's tax for the same year sees two different numbers and three mutually exclusive statements about why.

**Where.** Engine A omission: `DangerClose-v5_10_2.jsx` L3400–3403. Engine B implementation: L8191–8201.
Conflicting disclosures: L8299, L8527, Field Manual §13 (inside `DOCS_HTML`).

**Dollar magnitude (hand-computed; Engine A side confirmed by t10).** Single filer, age 66, 2026, pension
producing gross income $48,150 (so MAGI ≈ $48,150, below the $75,000 phase-out start):

| | Deduction | Taxable ordinary | Federal tax |
|---|---|---|---|
| Engine A (no bonus) | 16100 + 2050 = **18,150** | 30,000 | **$3,352** ✔ confirmed to the dollar (t10 case `OBBBA`) |
| Engine B (bonus $6,000) | 16100 + 2050 + 6000 = **24,150** | 24,000 | **$2,632** (hand-computed from L8191–8201; DOM run pending) |

Divergence for this household-year: **$720** (= 12% marginal × $6,000). It scales with the marginal rate
(up to $1,320 at 22%) and doubles for a couple where both are 65+.

**Severity — MEDIUM, user-side.** The app's whole premise is that a skeptical reader can check its numbers.
Here two of its own tabs give different answers for the same year and the app's own text can't agree on why.
Not HIGH: the amounts are bounded (≤ ~$2,640/household-year), the provision self-expires after 2028, and the
Roth comparator's omission is a defensible, documented choice. But it is a genuine defect because the
*disclosure* — not the modeling — is wrong in at least two of three places.

**Suggested resolution (for a future scope, not this phase).** Make the three disclosures consistent: state
plainly that the OBBBA bonus **is** modeled on the Taxes tab and **is not** modeled in the Roth
comparator, and why. This is a text/disclosure fix; it touches no engine arithmetic and cannot affect
MC-parity. Whether to additionally model the bonus inside the Roth comparator is a separate modeling
decision (the circularity concern is real) and is explicitly out of 2A's scope.

---

## O-2A-1 — Reported lifetime tax total is rounded to whole dollars (NOT a defect)

**What.** `runRothStrategies` accumulates each year's *exact* tax (L3560) and rounds only the reported
horizon total once at return (`totTax: Math.round(totTax)`, L3640). The per-year figures that drive balance
evolution are unrounded, so no rounding error accumulates across the horizon; only the displayed total is
whole-dollar. This is correct (tax is reported in whole dollars) and is the sole reason the engine's output
differs from an exact-cent hand figure — always by < $1, always in the direction of correct `Math.round`
rounding (verified at every bracket border, e.g. taxable $768,700 → exact $206,583.50 → reported $206,584).
Recorded so a later reader does not mistake the sub-dollar deltas for a discrepancy.

## C-2A-1 — Candidate examined and DISMISSED: OBBBA phase-out is not a "double" phase-out for couples

**What was suspected.** Engine B computes `perPerson = max(0, 6000 − 0.06 × excess)` then multiplies by the
number of 65+ persons (L8196–8199). For a couple with both 65+, this applies the 6% phase-out *per spouse*,
i.e. 12% of the excess against the combined $12,000 — which looked like it might double-count the phase-out
relative to a single 6% applied to the aggregate.

**Why it is dismissed (primary source).** The statute (OBBBA P.L. 119-21 §70103 / IRC §151(d)(5)) applies
the 6% reduction **per eligible individual's own $6,000**, and the authoritative endpoint proves it: the
couple's deduction is fully eliminated at MAGI $250,000 = $150,000 threshold + $100,000, and $6,000 ÷ 6% =
$100,000 *per spouse*. A single aggregate 6% on $12,000 would not vanish until $350,000, contradicting the
published $250,000 endpoint. Worked check: couple both 65+, MAGI $180,000, excess $30,000 → per-spouse
reduction $1,800 → each retains $4,200 → combined $8,400. Engine B returns exactly that. **The engine's
per-person 6% is the correct statutory structure.** (One secondary source carried internally inconsistent
arithmetic; the self-consistent sources and the $250k endpoint decide it.) This was nearly recorded as a
finding on a source-shape reading alone — the arithmetic against the statutory endpoint is what dismissed
it, which is exactly the Section-C discipline of computing rather than inspecting.

*Note:* Engine B's OBBBA formula is thereby verified **correct by hand**; confirming it in *execution* is
part of the Engine-B DOM run listed under Remaining.

---

## Cross-engine structural finding (D-3 apparatus)

Beyond F-2A-1, the two engines' federal-core helpers were compared line by line:

| Helper | Engine A (Roth) | Engine B (Taxes) | Structurally identical? |
|---|---|---|---|
| Ordinary bracket walk | `fedTaxF` L3313–3318 | `fedOrdinaryTax` L8064–8075 | Yes — same walk, same `infl`/`inflate` (×1.02^(yr−asOfYr)) |
| LTCG stacking | `ltcgF` L3319–3324 | `ltcgTax` L8086–8100 | Yes — gains stack on ordinary taxable, same bracket loop |
| SS taxability | `ssTaxF` L3325–3330 | `taxableSSPortion` L8103–8110 | Yes — same provisional-income tiers |
| NIIT | inline L3528 | inline L8208–8214 | Yes — 3.8% × min(inv inc, MAGI − unindexed threshold) |
| Standard + age-65 deduction | L3396–3403 | L8186–8190 | Yes |
| **OBBBA senior bonus** | **omitted** (L3400–3402) | **applied** (L8191–8201) | **No — the one federal-core divergence (F-2A-1)** |

Because the shared helpers are identical and draw the same `TAX_CONSTS`, any two engines agree on a
household-year **whenever the OBBBA bonus is $0** (year > 2028, OR no one 65+, OR MAGI ≥ phase-out ceiling).
The only federal-core disagreement is F-2A-1. This is a source-inspection result; the dollar-exact execution
confirmation for Engine B is under Remaining.

---

## Remaining for 2A (honest partial — what a future session owes)

2A is complete for **Engine A** (76/76 dollar-exact) and for the primary-source constant verification and
the case-construction harness (reused by 2B–2E). The one remaining 2A task:

- **Engine B (Taxes tab) dollar-exact confirmation via DOM.** Engine B is not a callable function — it is
  inline in the `DangerClose` render (L8040+), reachable only by rendering the Taxes tab in jsdom and reading
  the emitted per-year `fedTax` / `capGainsTax` / `niit_y` row values (the row object is built at L8252). The
  mechanism: mount via the existing `dom_entry_v5102.jsx` bundle, inject a hand-built `PORTFOLIO` +
  `PLAN_TIMELINE` (the Taxes tab reads year span, DOBs, SS, pension from `PLAN_TIMELINE`, not from a P
  object, so the single-year isolation trick used for Engine A does not transfer directly — a short multi-year
  span with a known first year is the likely shape), navigate to the Taxes tab, and parse the first-year row.
  Confirm it matches the same hand figures 2A already computed for Engine A where the OBBBA bonus is $0, and
  confirm the $720 divergence of F-2A-1 where it is not. Estimated: a focused half-session (comparable to a
  t4 tab walk). Until then, Engine B's federal core is verified by *inspection + primary-source formula
  check*, not by execution — and this document says so rather than claiming otherwise.

Because 2A's federal-core work is otherwise complete and F-2A-1 is a text/disclosure matter with no engine
math involved, none of the above blocks 2B (IRMAA + indexation), which is the next sub-phase per D-1.

---

## Deliverables produced this sub-phase

- **`qa/t10_taxcases.mjs`** — 76 dollar-exact federal-core assertions against Engine A (v5.10.2). Held in the
  deliverables tree per D-2; **not shipped as its own release** — it rides with the next release that has an
  independent reason to exist, at which point TESTING.md's counts change. Run: `node qa/t10_taxcases.mjs v5102`
  from the flat working folder (sources at root, harness in `qa/`).
- **This document** — findings + the hand-computation appendix below.

The end-of-Phase-2 roll-up (which of Section C's seven bullets are satisfied/partial/remaining) is written
after 2E, not here, per scope §5.

---

# Appendix — hand computation (re-derivable without trusting the summary)

All arithmetic below is from the primary sources cited in "What was verified." Engine figures are the
whole-dollar `totTax` printed by `t10` (from suite output, not memory). "Exact" is the pre-rounding cents.

### A. Ordinary brackets — longhand anchors (cumulative tax at each bracket top)

**Single (2026).** Tax at the top of each bracket, computed by filling each band:
- top of 10% ($12,400): 12,400 × 10% = **$1,240.00**
- top of 12% ($50,400): 1,240 + (50,400 − 12,400) × 12% = 1,240 + 38,000 × .12 = 1,240 + 4,560 = **$5,800.00**
- top of 22% ($105,700): 5,800 + (105,700 − 50,400) × 22% = 5,800 + 55,300 × .22 = 5,800 + 12,166 = **$17,966.00**
- top of 24% ($201,775): 17,966 + (201,775 − 105,700) × 24% = 17,966 + 96,075 × .24 = 17,966 + 23,058 = **$41,024.00**
- top of 32% ($256,225): 41,024 + (256,225 − 201,775) × 32% = 41,024 + 54,450 × .32 = 41,024 + 17,424 = **$58,448.00**
- top of 35% ($640,600): 58,448 + (640,600 − 256,225) × 35% = 58,448 + 384,375 × .35 = 58,448 + 134,531.25 = **$192,979.25**

**MFJ (2026):**
- top of 10% ($24,800): **$2,480.00**
- top of 12% ($100,800): 2,480 + 76,000 × .12 = **$11,600.00**
- top of 22% ($211,400): 11,600 + 110,600 × .22 = **$35,932.00**
- top of 24% ($403,550): 35,932 + 192,150 × .24 = **$82,048.00**
- top of 32% ($512,450): 82,048 + 108,900 × .32 = **$116,896.00**
- top of 35% ($768,700): 116,896 + 256,250 × .35 = **$206,583.50**

These twelve literals anchor the `t10` reference walk (the `ANCHOR` assertions). Every border ±$1 case then
follows mechanically; e.g. single taxable $640,601 → 192,979.25 + 1 × 37% = 192,979.62 → engine reports 192,980
(`Math.round`), confirmed.

### B. LTCG stacking — single, taxable ordinary $20,000, dividends $30,000 (2026)

Gains stack on top of ordinary taxable income. Ordinary taxable $20,000 → federal ordinary = 1,240 +
(20,000 − 12,400) × 12% = 1,240 + 912 = **$2,152**. The $30,000 of qualified dividends stacks starting at
$20,000: the 0% LTCG bracket runs to $49,450, leaving $29,450 of room → $29,450 taxed at 0%; the remaining
$550 taxed at 15% = **$82.50**. Total = 2,152 + 82.50 = $2,234.50 → engine reports **$2,235** (t10 `LTCG_S_30000`,
got 2235). ✔

### C. NIIT — single, MAGI $220,000, investment income $20,000 (2026)

NIIT = 3.8% × min(net investment income, MAGI − $200,000) = 0.038 × min(20,000, 20,000) = 0.038 × 20,000 =
**$760** → engine `totNiit` **$760** (t10 `NIIT_S_220000`). ✔ At MAGI $200,001 the excess is $1, so
0.038 × 1 = $0.04 → $0, correctly showing NIIT switching on gradually from the threshold.

### D. Social Security taxability — single, benefit $30,000, other income $40,000 (2026)

Provisional income = 40,000 + 0.5 × 30,000 = **$55,000**, above the tier-2 threshold ($34,000). Taxable SS =
min(0.85 × 30,000, 0.5 × min(55,000 − 25,000, 34,000 − 25,000) + 0.85 × (55,000 − 34,000)) =
min(25,500, 0.5 × 9,000 + 0.85 × 21,000) = min(25,500, 4,500 + 17,850) = min(25,500, 22,350) = **$22,350**.
Gross ordinary = 40,000 + 22,350 = 62,350; taxable = 62,350 − 16,100 = 46,250; federal = 1,240 +
(46,250 − 12,400) × 12% ... = **$5,302** → engine reports **$5,302** (t10 `SS_S_40000`, confirms taxableSS
22,350 → taxableOrd 46,250 → fed 5,302). ✔ This case proves the SS taxable portion flows correctly into a
non-zero federal figure, not merely that the tier formula computes.

### E. OBBBA divergence — the two engines side by side (2026, single age 66, gross $48,150)

Worked in F-2A-1. Engine A: deduction $18,150, taxable $30,000, federal **$3,352** (t10 `OBBBA`, confirmed).
Engine B by hand: deduction $24,150 (adds the $6,000 bonus, MAGI $48,150 < $75,000), taxable $24,000, federal
1,240 + (24,000 − 12,400) × 12% = 1,240 + 1,392 = **$2,632**. Divergence **$720**. Engine B's figure is
hand-computed from L8191–8201; its execution confirmation is the Remaining item.
