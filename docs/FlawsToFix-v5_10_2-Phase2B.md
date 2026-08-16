# FlawsToFix — Standing Code Audit, Phase 2 · Sub-phase 2B (Section C: IRMAA + indexation)

**Build under audit:** v5.10.2
**Source:** `DangerClose-v5_10_2.jsx` · md5 `7ddda3585abb9dc2c40fa4fbfc46967a`
**Prior (comparison baseline):** v5.10.1 · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc`
**Date:** 2026-08-07
**Governing scope:** `SCOPE_AUDIT_PHASE2_v5_10_2.md` (decisions D-1…D-5 binding)
**Sub-phase:** 2B — IRMAA + indexation discipline (all five tier borders ±$1; per-person surcharge;
the 2-year lookback pairing; and which constants may receive the 2%/yr inflator — premise observations 1 and 2).
**Sub-phases NOT covered here:** 2A (federal core — done), 2C (first-death), 2D (break-even + account
completeness), 2E (state) — per the confirmed order D-1.

Every line number below was read from the canonical source in this session. None is recalled. Every
engine figure is from harness output (`t10` / probe scripts), not memory.

---

## Freshness check (re-run this session — not inherited)

| Step | Result |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` names current = v5.10.2 md5 `7ddda358…`; prior = v5.10.1 md5 `2ee4d1e5…` | read |
| `md5sum DangerClose-v5_10_2.jsx` | `7ddda3585abb9dc2c40fa4fbfc46967a` — **matches manifest** |
| `md5sum DangerClose-v5_10_1.jsx` | `2ee4d1e5d0f06fa89ee6980fd97984bc` — **matches manifest** |
| `CHANGELOG.md` newest entry | v5.10.2 — **agrees** |

**PASSED.** Work proceeds against v5.10.2. No source was modified in this sub-phase; the hash above is
unchanged after the work (2B adds a test file only).

---

## Summary of 2B

**Engine A (Roth strategy comparator) IRMAA tier selection is verified correct to the dollar** — 32
dollar-exact assertions in `qa/t10_taxcases.mjs`, covering all five tier boundaries ±$1 for both filing
statuses, the per-person surcharge (×2 / ×1 / ×0 by count of spouses 65+), and the cliff semantics (no
surcharge *at* a threshold, full surcharge one dollar above — matching CMS's "greater than" rule). The
2026 tier **thresholds match CMS exactly**; the per-person combined Part B + Part D **surcharges are the
app's disclosed "approximate annual" values**, rounded to the nearest $10 (≤$5 from the CMS-exact figure).

**Two findings, both LOW severity, both currently CONSERVATIVE, and COUPLED** (they share one mechanism —
which constants the 2%/yr inflator is permitted to touch — exactly as decision D-4 anticipated):

- **F-2B-1 (premise 2) — IRMAA thresholds are indexed to the MAGI year, not the premium year.** Both
  engines pair a year-(Y−2) MAGI against year-(Y−2) thresholds; CMS applies the *premium year's*
  thresholds. This under-indexes every tier boundary by two years (~3.9%), pushing households into a
  surcharge tier slightly sooner than the law — a conservative over-charge. Undisclosed → a defect.

- **F-2B-2 (premise 1) — the top tier ($500k / $750k) is passed through the inflator, though it is
  statutorily frozen** (BBA-2018 §53114: frozen through 2027, CPI-U-indexed only from 2028). The engine
  inflates it every year like the others.

**A correction the scope owes the reader (STOP-and-report, per the ground rules):** the scope's premise 1
predicted this would err **non-conservatively** (a fixed threshold modeled as rising understates the top
surcharge, making the plan look *better*). **The primary-source arithmetic reverses that.** The top tier
is *not* permanently fixed — it is frozen only through 2027 and then indexed — and once that is combined
with the app's MAGI-year offset (F-2B-1), the engine's modeled top threshold lands ~2% *below* correct, so
it **over-charges** the top surcharge: conservative, not non-conservative. The direction premise 1 assumed
was an artifact of assuming a permanent freeze. Detail and worked figures below.

Both findings affect only households with MAGI near an IRMAA threshold (F-2B-1) or near $500k/$750k
(F-2B-2) — beyond the "mainstream couple within sight of retirement" the product targets. Per scope §6,
Phase 2 **documents**; it does not fix. Any fix is a single later release covering both (D-4).

---

## What was verified (and how)

### Constants — spot-checked against CMS 2026 primary source

CMS 2026 Medicare Parts B & D premiums and IRMAA were published **2025-11-14**, effective **2026-01-01**
(CMS fact sheet, corroborated by Kiplinger, RetirementAdvisorPro, IRMAA Group — all citing CMS). Source
constants live in `IRMAA_CONSTS` (L810–814); the Verify tab asserts a subset live (L1077–1081).

**Tier thresholds — EXACT match:**

| Tier boundary | App `IRMAA_CONSTS.SGL` | CMS 2026 (single) | App `MFJ` | CMS 2026 (MFJ) |
|---|---|---|---|---|
| 1 | 109000 | 109,000 | 218000 | 218,000 |
| 2 | 137000 | 137,000 | 274000 | 274,000 |
| 3 | 171000 | 171,000 | 342000 | 342,000 |
| 4 | 205000 | 205,000 | 410000 | 410,000 |
| top (5) | 500000 | 500,000 | 750000 | 750,000 |

**Per-person combined Part B + Part D annual surcharge — app values are disclosed approximations
(≤$5 from CMS-exact).** CMS 2026 monthly: Part B `[0, 81.20, 202.90, 324.60, 446.30, 487.00]`,
Part D `[0, 14.50, 37.50, 60.40, 83.30, 91.00]`. Combined × 12:

| Tier | App `SUR` | CMS-exact (monthly×12) | Δ (app − CMS) |
|---|---|---|---|
| 1 | 1150 | (81.20+14.50)×12 = 1,148.40 | +1.60 |
| 2 | 2880 | (202.90+37.50)×12 = 2,884.80 | −4.80 |
| 3 | 4620 | (324.60+60.40)×12 = 4,620.00 | 0.00 |
| 4 | 6360 | (446.30+83.30)×12 = 6,355.20 | +4.80 |
| top | 6940 | (487.00+91.00)×12 = 6,936.00 | +4.00 |

The `IRMAA_CONSTS` header comment (L809) labels `SUR` "**approximate** annual Part B + Part D surcharge
per person," so these ≤$5 deltas are a **disclosed** rounding, not a defect. Minor observation: the Verify
tab annotates tier 1 as "derived from CMS monthlies (81.20+14.50)×12" — an expression equal to 1,148.40 —
while asserting the rounded constant 1150; the annotation implies an exact derivation the constant rounds.
Harmless, but the annotation would read truer as "≈" or "rounded from."

### Tier selection — Engine A, dollar-exact (executed)

`qa/t10_taxcases.mjs` §8–9 drive MAGI to each tier boundary via a pension-only isolation (all other MAGI
components neutralized; both spouses 65+ in the single surcharge year 2028, where the inflator exponent is
0 so thresholds are the base CMS values). Result: **32/32**, including the cliff direction (`≤` at the
threshold ⇒ lower tier; +$1 ⇒ next tier) and the per-person multiply (×2 / ×1 / ×0).

### Cross-engine note (honesty about method)

The dollar-exact execution above is **Engine A** (`runRothStrategies`, L3303–3620; IRMAA block
L3546–3558). **Engine C** (the IRMAA tab, L8548–8602) was verified by **source inspection**, not
execution: it renders inside a React path (like the Taxes tab), so a jsdom render is needed to read its
figures directly — not done here. Inspection shows Engine C consumes the same `IRMAA_CONSTS`, applies the
same `<=` cliff via `tierForMagi` (L8558–8562), and indexes thresholds with the **same MAGI-year offset**
as Engine A: it pairs a year-`yr` MAGI with `inflate(magiUpper, yr)` and pays the surcharge at
`irmaaYr = yr + 2` (L8592–8596), so from the premium year's view it, too, indexes to Y−2. The two engines
therefore **agree** on both indexation findings — this is not a cross-engine divergence (D-3). Executing
Engine C to confirm the dollar figures is owed, alongside the Engine-B federal DOM run still owed from 2A.

---

## Findings

### F-2B-1 · IRMAA thresholds indexed to the MAGI year, not the premium year — LOW, user-side, defect (disclosure-class)

**What.** The surcharge paid in premium year *Y* is set by CMS's **year-*Y*** thresholds applied to the
beneficiary's **year-(Y−2)** MAGI (the 2-year lookback). Both engines instead apply **year-(Y−2)**
thresholds to that Y−2 MAGI — the thresholds are indexed to the MAGI year, two years behind the premium
year. Every tier boundary is therefore ~2 years of indexation (~3.9% at 2%/yr) too low.

**Where.** Engine A L3555 — `if (lookM <= infl(ups[i], yr - 2))` (thresholds inflated to `yr-2`, while the
surcharge is charged in year `yr`). Engine C L8558–8596 — `tierForMagi(magi, yr)` with `inflate(…, yr)`
and `irmaaYr = yr + 2` (equivalently Y−2-indexed from the premium year's view).

**Suspected cause.** The 2-year lookback was implemented by shifting *both* the MAGI and the threshold
index back two years, rather than shifting only the MAGI and keeping the threshold at the premium year.

**Direction / magnitude.** Lower thresholds → a given MAGI lands in a surcharge tier (or a higher tier)
sooner than the law → the model **over-charges** IRMAA. Conservative (makes the plan look slightly worse),
which is the design default's preferred direction. Magnitude ≈ 3.9% of a threshold. Worked example
(executed): premium year 2046, single, tier 1. Engine threshold = 109,000·1.02¹⁸ = **155,679**;
CMS-correct (premium-year) = 109,000·1.02²⁰ = **161,968**. A household with 2044 MAGI of **158,000** owes
**$0** under the law but the engine charges **$1,150**.

**Disclosure.** The Verify tab discloses the **2-year MAGI lookback** ("CMS (2-yr MAGI lookback)", L1077)
— which is correct and is modeled correctly. It does **not** disclose the *threshold-indexation-year*
offset. Under the scope's adjudication rule an undisclosed simplification is a defect; because the
direction is conservative, the appropriate remedy may be a disclosure rather than an arithmetic change —
but that is the fix release's call, not this document's.

**Pinned.** `t10` §10 pins the current behavior as `[KNOWN DEFECT F-2B-1]` (engine=1150, CMS-correct=0)
plus a below-threshold bracket (magi 155,000 ⇒ $0), with a flip-to-0 instruction for when it is fixed.

---

### F-2B-2 · Top IRMAA tier passed through the inflator though statutorily frozen — LOW, user-side, defect (coupled)

**What.** `IRMAA_CONSTS.SGL[4]=500000` / `MFJ[4]=750000` is the top tier. Both engines pass it through the
2%/yr inflator like every other tier. By statute (BBA-2018 §53114) this top threshold was **frozen through
2027** and is **indexed by CPI-U only from 2028**, off the frozen $500k/$750k base. The engine models no
freeze and no 2028 resumption — it simply inflates from `asOfYr` (2026).

**Where.** Same sites as F-2B-1 — the tier loops that call `infl(ups[i], …)` / `inflate(magiUpper, …)`
over **all** indices including the top one (Engine A L3555; Engine C L8558–8562). The app's **own Verify
tab labels this constant "top tier fixed by law" (L1079)** — a label the engines do not honor.

**Primary source.** BBA-2018 (P.L. 115-123) §53114 added the fifth tier at $500k/$750k effective 2019;
"this new top income threshold will be frozen through 2027 and will be adjusted annually for inflation
starting in 2028 based on the CPI-U" (Congressional Research Service report, quoted on Bogleheads;
corroborated by TaxShark, IRMAA Group, BenefitsUSA — all citing the statute/CMS).

**Direction / magnitude — and the scope-premise reversal.** The scope (premise 1, and D-4's noted
asymmetry) predicted this errs **non-conservatively**: a fixed threshold modeled as rising would let a
very-high-MAGI household stay below the top tier too long and *understate* the surcharge. **That
prediction is reversed by the actual law.** Because the top tier is *not* permanently fixed (it indexes
from 2028), and because the app also applies the F-2B-1 MAGI-year offset, the net modeled top threshold at
premium year *Y*≥2028 is 500,000·1.02^(Y−2028), versus CMS-correct 500,000·1.02^(Y−2027) — the engine sits
**~2% below** correct, so it puts high-MAGI households into the top tier *sooner* and **over-charges**.
Conservative, not non-conservative. Worked example (executed): premium year 2046, single. Engine top
threshold = 500,000·1.02¹⁸ = **714,123**; CMS-correct = 500,000·1.02¹⁹ = **728,406**. A household with 2044
MAGI of **720,000** is tier 4 under the law (surcharge 6,360) but the engine charges the top tier
(**6,940**) — an over-charge of $580/person.

**Why premise 1 read the direction backwards.** Under the *assumption* the tier is permanently fixed at
$500k, the engine's rising threshold would indeed exceed it and under-charge. The reversal is entirely
about the law: the freeze ends in 2027, the tier then rises, and the app's MAGI-year lag makes it rise a
hair *slower* than the law rather than faster.

**Pinned.** `t10` §10 pins the current behavior as `[KNOWN DEFECT F-2B-2]` (engine=6940, CMS-correct=6360),
with a flip-to-6360 instruction for when the freeze/2028-index is implemented.

---

### The coupling (decision D-4 was right to bind them)

The two findings are one mechanism seen twice, and **must be resolved together**:

- **As the code stands** (both simplifications present) the top tier is net **conservative** — F-2B-1's
  2-year under-index more than offsets the missing freeze.
- **If F-2B-1 alone were fixed** (index thresholds to the premium year) while the freeze stays unmodeled,
  the top tier would become 500,000·1.02^(Y−2026) vs correct 500,000·1.02^(Y−2027) — one year *above*
  correct — and flip to **non-conservative**. That is the trap D-4 foresaw: fixing the offset without the
  freeze would *introduce* the very non-conservative error premise 1 feared.

So the fix release must either implement **both** (premium-year indexing *and* the 2027-freeze /
2028-resumption for the top tier) or **neither** (disclose both as stated simplifications). The MC-parity
guardrail (t2 compare 8/8) must hold across that release — the IRMAA change touches only the tier-lookup
sites (L3555, L8558–8562, and the tier construction above each), not the Monte Carlo draws.

---

## Adjudication summary

| Finding | Premise | Direction (actual law) | Disclosed? | Ruling | Severity |
|---|---|---|---|---|---|
| F-2B-1 | 2 (MAGI-year threshold offset) | Conservative (over-charge ~3.9%) | Lookback yes; index-year offset **no** | Undisclosed simplification → **defect** (disclosure-class) | LOW |
| F-2B-2 | 1 (top-tier freeze not modeled) | Conservative as-is (over-charge ~2%); flips non-conservative if F-2B-1 fixed alone | Verify label says "fixed by law"; engine ignores it | **Defect**, coupled to F-2B-1 | LOW |

Constants (thresholds exact; surcharges disclosed-approximate ≤$5): **not** findings. Both findings sit
outside the mainstream product boundary (MAGI near a threshold, or near $500k/$750k) and are the
conservative direction as the code stands.

---

## Deliverables produced this sub-phase

- **`qa/t10_taxcases.mjs`** — extended with **35** IRMAA assertions (32 dollar-exact tier-selection +
  3 `[KNOWN DEFECT]` indexation pins). Total now **111** (76 federal-core 2A + 35 IRMAA 2B). Held in the
  deliverables tree per D-2; **not shipped as its own release** — it rides with the next release that has
  an independent reason to exist, at which point TESTING.md's counts change. Run: `node qa/t10_taxcases.mjs
  v5102` from the flat working folder.
- **This document** — findings + the hand-computation appendix below.

The end-of-Phase-2 roll-up is written after 2E, per scope §5.

---

## Owed / not yet done (stated rather than implied complete)

- **Engine C (IRMAA tab) dollar-exact execution.** Verified here by inspection + shared-constant argument;
  a jsdom render to confirm its figures to the dollar remains owed (pairs naturally with the Engine-B
  federal DOM run still owed from 2A).
- **The fix itself.** Out of scope for Phase 2 (§6). F-2B-1 and F-2B-2 are handed to a future single
  release per D-4, with the coupling constraint above.

---

# Appendix — hand computation (re-derivable without trusting the summary)

Primary sources: CMS 2026 Medicare Parts B & D premiums/IRMAA (published 2025-11-14, eff 2026-01-01);
BBA-2018 (P.L. 115-123) §53114 for the top-tier freeze. Engine figures are the whole-dollar `totIrmaa`
from `t10` / probe output, not memory. Inflator is `b·1.02^(exponent)`; `1.02¹⁸ = 1.428246`,
`1.02¹⁹ = 1.456811`, `1.02²⁰ = 1.485947`.

### A. Surcharge constants (per person, annual, Part B + Part D)

`(PartB_monthly + PartD_monthly) × 12`, tier by tier: 1 → (81.20+14.50)×12 = 1,148.40; 2 →
(202.90+37.50)×12 = 2,884.80; 3 → (324.60+60.40)×12 = 4,620.00; 4 → (446.30+83.30)×12 = 6,355.20; top →
(487.00+91.00)×12 = 6,936.00. App `SUR = [0,1150,2880,4620,6360,6940]` — each rounded to the nearest $10
(disclosed "approximate").

### B. Tier selection (Engine A, executed — base thresholds, premium year 2028, exponent 0)

Isolation: `pen = MAGI/12` with SS/RMD/conversions/dividends/work all neutralized ⇒ MAGI = pension exactly;
both spouses 65+ in 2028; window 2026→2028 puts one surcharge year (2028) at exponent 0. Selected results
(engine `totIrmaa` = independent reference `SUR[tier(MAGI)] × persons`):

- SGL 109,000 → 0 · 109,001 → 1,150 · 137,000 → 1,150 · 137,001 → 2,880 · 500,000 → 6,360 · 500,001 → 6,940
- MFJ 218,000 → 0 · 218,001 → 2,300 · 274,001 → 5,760 · 750,000 → 12,720 · 750,001 → 13,880
- MFJ magi 300,000, both 65 → 5,760 (=2,880×2); one 65 → 2,880; neither 65 → 0

All 32 border/per-person cases matched to the dollar.

### C. F-2B-1 — MAGI-year vs premium-year threshold (executed)

Premium year Y = 2046, single, tier 1. Engine indexes to Y−2 = 2044 (exponent 18):
109,000 · 1.02¹⁸ = **155,679**. CMS-correct indexes to Y = 2046 (exponent 20):
109,000 · 1.02²⁰ = **161,968**. Household 2044 MAGI = 158,000:
155,679 < 158,000 < 161,968 → engine tier 1 (**$1,150**), CMS tier 0 (**$0**). Engine over-charges $1,150.
Engine confirmed: `magi=158000 → totIrmaa=1150`; below the engine threshold `magi=155000 → 0`.

### D. F-2B-2 — top tier: engine inflates vs law's freeze→2028-index (executed)

Premium year Y = 2046, single, top tier. Engine: 500,000 · 1.02^(Y−2−2026) = 500,000 · 1.02¹⁸ =
**714,123**. CMS-correct (frozen through 2027, indexed from 2028 off the $500k base):
500,000 · 1.02^(Y−2027) = 500,000 · 1.02¹⁹ = **728,406**. Household 2044 MAGI = 720,000:
714,123 < 720,000 < 728,406 → engine top tier (**$6,940**), CMS tier 4 (**$6,360**). Engine over-charges
$580. Engine confirmed: `magi=720000 → totIrmaa=6940`.

General form (premium year Y ≥ 2028): engine top threshold 500,000·1.02^(Y−2028) vs CMS
500,000·1.02^(Y−2027); ratio 1.02⁻¹ = 0.9804 ⇒ engine ~1.96% below correct ⇒ conservative over-charge.
Had F-2B-1 been fixed alone (premium-year index, no freeze): engine 500,000·1.02^(Y−2026) vs CMS
500,000·1.02^(Y−2027); ratio 1.02⁺¹ ⇒ engine ~2% *above* correct ⇒ non-conservative. Hence the coupling.
