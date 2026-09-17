# SCOPE — Maine's pension-deduction phaseout, and Montana's 65+ subtraction and Social Security

| | |
|---|---|
| Status | ☑ **RETIRED — FULFILLED AT v5.73, 2026-09-15** (its D-10: written and built in one release). §9 is the build record. All ten decisions taken as recommended; the three leads it filed are in `FlawsToFix-v5_69-Phase1.md`'s header. |
| Build under scope | **v5.72** — source `2b88134b4b1f014364262d479fb4e8a3`, repo `b345dc3` |
| Kind | **modelling release → v5.73.** Figures move, so `METHODOLOGY.md` updates |
| Destination of this file | `docs/` **and** the pool, and onto `package_check`'s I-2 allowlist in the package that adds it — unless D-10 folds scope and build into one release |

## 1 · Premise — every legal fact read from a primary source on 2026-09-15

### Maine

- **The phaseout is law, and its shape is exact.** 36 M.R.S. §5122(2)(M-3), as enacted by P.L. 2025, c. 388,
  Pt. H, and read on the Revisor's site: for tax years from 2025, the M-2(1)(a) deduction "must be reduced by"
  itself multiplied by a fraction. The numerator is **federal AGI minus the applicable amount (not below zero)**;
  the denominator is **$100,000** ($50,000 married filing separately). The fraction "may not produce a result
  that is more than one".
  - **Applicable amounts:** $125,000 single · $187,500 head of household · **$250,000 joint or surviving spouse**
    · half the joint figure for separate filers.
  - **Indexed** for tax years after 2025 (§5403(11)).
  - Maine Revenue Services' *2025 legislative changes* document states the same thresholds; its 2025 Form
    1040ME instructions say the deduction "is subject to phaseout" (the passage read did not show the figures).
- **So the deduction reaches zero at AGI $225,000 single and $350,000 joint.** It is a proportional phaseout,
  not a cliff, and it applies to the deduction **after** the per-person Social Security offset (M-2(1)(a)(ii)
  is the offset; M-3 reduces "the amount in … division (a)"). Military retirement pay (division (b)) is **not**
  reduced.
- **Today (v5.72)** the row carries `excl65: 48216`, `ssOffset: true` and `incomeLimitedInLaw: true`, and its
  note says the phaseout is not modelled. It is **optimistic** for a Maine household above the threshold.
- **A second fact the statute shows: M-2 has no age-65 test.** The deduction is limited by 72(t) (and a 55-or-series
  rule for employer plans), not by age 65. The app applies Maine's deduction only from 65, the default age
  floor. That is **pessimistic**: a Maine retiree drawing an IRA between 59½ and 65 gets no deduction in the model.
  Not in `METHODOLOGY` today. → D-3.

### Montana

- **The 65+ subtraction is $5,660 for 2025, not $5,500.** The Department of Revenue's 2025 Form 2, line 6, reads
  "$5,660 subtraction for taxpayers 65 and older ($11,320 if married filing jointly and both are 65 and older)",
  and its 2025 Publication 1 says the same. MCA 15-30-2120(3)(g) carries the $5,500 base, and the DOR's Tax
  Simplification Hub says it is "adjusted annually for inflation beginning with tax year 2025". **Today** the
  row carries `excl65: 5500`, which is **pessimistic** by $160 per person.
- **Social Security is taxed exactly as federally — the row's half-rate is stale.** The same Hub page: from tax
  year 2024 Montana starts from federal taxable income, and taxable Social Security is included "to the extent
  that [it is] included in federal taxable income". Its list of repealed subtractions includes the partial
  pension, annuity and IRA deduction; it lists no Social Security subtraction among those still available. **Today** the row
  carries `ss: 0.5` with the note "SS taxed as federally, with an income-based exemption". The `0.5` taxes half
  of the federally taxable amount, which is **optimistic** — for a typical couple, by far more than the $160 above.
- **Montana has two ordinary-income brackets, not one rate.** The Hub says so; the app uses a flat `rate: 0.0565`.
  **The 2025 and 2026 bracket rates were NOT read from a primary source in this session.** → D-6.
- **The subtraction is against all income**, not only retirement income. The model subtracts it from retirement
  income only, so a household with little retirement income loses part of it. Rare for this app's users;
  pessimistic. → D-7.

## 2 · The engine, as it is (read at `b345dc3`)

`stateTaxAnnual` computes a per-person exclusion `_one(age, ssGross)`, applying `ssOffset` when set, then
`exclFinal = r.exclTest ? _fromTest(...) : excl`. `_fromTest` knows two shapes, `bands` and `taper`, and a
conditioned table **replaces** `_one`. The code says so directly: *"`exclTest` and `ssOffset` are mutually
exclusive by construction … No state carries both, and none should without deciding how they compose."*
Maine needs both. → D-1.

The income measure `agi` = retirement + pension + other ordinary + gains + federally taxable SS. It carries no
dividends or interest; that is already disclosed as optimistic for every conditioned state, and Maine inherits it.

## 3 · Site census

| Site | Change |
|---|---|
| `STATE_RULES.ME` (L1091) | gains the phaseout table; note rewritten |
| `STATE_RULES.MT` (L1098) | `excl65` 5500 → 5660; `ss` 0.5 → 1.0 (D-5); note rewritten |
| `stateTaxAnnual` (`_fromTest`, the guard comment, `exclFinal`, L1346–1363) | a third shape that composes with `ssOffset` (D-1) |
| `t10` L857 (`R.ME.excl65 === 48216`) | unchanged — the scalar still equals the table at zero income, as the D-3(b) rule requires |
| `t29` F-6, `t35` D-7/D-8 | at v573 Maine is conditioned, so the guarded set empties and these **invert again**, exactly as their v5.72 notes say |
| `state_sets` / `state_sets_check` | none expected: Maine stays on the in-law list; `isConditioned` reads truthy `exclTest` |
| `METHODOLOGY.md` L1462–1508 (Maine/Maryland section) and the state tables | Maine phaseout modelled; Montana figures and SS treatment |
| Field Manual | only if a state note is rendered there; checked by parser at build |
| Version bump | four in-app sites, and `vercensus v572` — now counting map entries |

## 4 · Proposed changes

1. **Maine:** `exclTest: { kind: "phaseout", base: "agi", threshold: { single: 125000, joint: 250000 }, width: 100000 }`.
   The new shape takes the **post-offset** `excl` and multiplies it by `1 − min(1, max(0, (agi − threshold) / width))`.
   `_fromTest` gains the shape; the "mutually exclusive" guard is rewritten to say exactly how `phaseout`
   composes, and that `bands`/`taper` still do not.
2. **Montana:** `excl65: 5660`, `ss: 1`, and a note that says what the law now is.
3. **Notes and METHODOLOGY** say what is still approximate (§5).

## 5 · Tests (new `t39_me_mt.mjs`, both legs), each hand-computed to the dollar

- **Maine, joint, both 67, SS $30,000 and $20,000** (offset caps $18,216 + $28,216 = $46,432):
  AGI $250,000 → $46,432 · AGI $300,000 → **$23,216** · AGI $350,000 → **$0** · AGI $400,000 → $0.
  The same household at AGI $249,999 is unchanged from v5.72.
- **Maine, single, 67, SS $24,000** (cap $24,216): AGI $125,000 → $24,216 · $175,000 → $12,108 · $225,000 → $0.
- **Composition:** SS large enough to zero the offset → phaseout irrelevant (0 stays 0).
- **Maine tax, one full cell:** stateTaxAnnual for a stated household, computed by hand.
- **Montana:** one 67-year-old, and a joint couple both 67, with and without SS — tax computed by hand with
  `5660` and `ss = 1`.
- **Prior leg (v572) pins** every figure that moves: Maine's unreduced exclusion above $250,000, Montana's
  $5,500, Montana's half-taxed SS.
- **Extinction invariant:** no row that carries `ssOffset` may carry `exclTest` of any shape except `phaseout`.
- **Negative controls, one per change:** the phaseout ignored; applied before the offset instead of after
  (that must change a figure, or the ordering test is vacuous); Montana `5500` restored; `ss: 0.5` restored.
- Then the full suite, `smoke_built`, and the pricing from `vercensus v572`.

## 6 · Out of scope

- **Montana's bracket rates** until they are read from a primary source (D-6).
- Maine's head-of-household and married-filing-separately thresholds — the model has joint and single only.
- Maine military retirement (not modelled anywhere) and Railroad Retirement (already disclosed).
- **TY2026 indexing** of Maine's thresholds and $48,216, and of Montana's $5,660 (D-2).
- Other states carrying `ss: 0.5`. Montana's is stale; others may be too. → D-9.
- The federal senior deduction (2025–2028), which lowers Montana's base because Montana starts from federal taxable
  income. The model does not start from federal taxable income; that is a wider simplification.

## 7 · Decisions for Steve

| # | Question | Recommendation |
|---|---|---|
| **D-1** | Model Maine's phaseout as a new shape that multiplies the deduction **after** the Social Security offset? | **Yes.** It is exactly the statute's order, and it keeps `bands`/`taper` untouched |
| **D-2** | Use the **TY2025** thresholds ($125,000 / $250,000), matching the row's TY2025 $48,216 and Montana's TY2025 $5,660? | **Yes, TY2025 throughout**, disclosed. A TY2026 refresh of all three is a separate, small release once the indexed figures are published |
| **D-3** | Maine's deduction has no age-65 test in law. Remove the 65 floor for Maine now? | **No — disclose it and file it.** It is pessimistic (the conservative direction), and doing it right needs the 59½ rule, which the model does not have per account |
| **D-4** | Montana `excl65` 5500 → **5660**? | **Yes** |
| **D-5** | Montana `ss` 0.5 → **1.0**, with the note corrected? | **Yes.** The DOR is explicit, and this is the larger of the two Montana errors |
| **D-6** | Montana's rate: leave the flat 5.65% this release and file a lead? | **Yes, file it.** Two brackets are a model change for one state, and I have not read the rates from a primary source |
| **D-7** | Montana's subtraction reduces all income in law, but only retirement income in the model — disclose? | **Yes, disclose** (pessimistic, rare for this app's users) |
| **D-8** | Version **v5.73**, with `METHODOLOGY` updated? | **Yes** — figures move in both directions |
| **D-9** | File a lead to audit every other `ss: 0.5` state against post-reform law? | **Yes.** The half-rate is described in code as approximating "income thresholds that exempt most retirees", and Montana shows that assumption can go stale |
| **D-10** | Ship the scope first (an ops package with an I-2 entry), or scope and build together in v5.73? | **Together**, as with the tooling package — it saves a round trip and an allowlist entry that would live for one package |

## 8 · Which way the figures move

- **Maine households above $250,000 joint / $125,000 single:** Maine tax **rises** — the model stops granting a
  deduction the law phases out.
- **Montana households with Social Security:** Montana tax **rises**, typically by far more than the next item.
- **Montana households with anyone 65+:** Montana tax **falls** by 5.65% × $160 ≈ **$9 per person per year**.
- Every other state: unchanged.

## 9 · Build record — v5.73 (2026-09-15)

**Decisions D-1…D-10 all taken as recommended.** Every figure below is from command output.

- **Engine.** `_fromTest` gains `kind: "phaseout"`, which scales the **post-offset** exclusion by
  `1 − min(1, max(0, (agi − threshold) / width))`. The old "mutually exclusive" comment now says precisely what
  composes (`phaseout`) and what still does not (`bands`, `taper`).
- **Maine** carries `exclTest: { kind: "phaseout", base: "agi", threshold: { single: 125000, joint: 250000 },
  width: 100000 }`; the scalar $48,216 is unchanged (t10 L857 still holds). **Montana** carries `excl65: 5660`
  and `ss: 1`. Both notes rewritten; Maine's now discloses the missing age-65 test (D-3), Montana's the flat rate
  (D-6) and the subtraction's narrower base (D-7).
- **Field Manual.** The "remain unmodelled" list drops Maine's phaseout and says it is modelled, with the missing
  age test; "only 8 states partially tax SS" becomes "8 states tax some SS: Montana as the federal return does, 7
  partially". No suite reads either passage (AST walk).
- **`t39_me_mt.mjs`** (new, both legs): **v5.72 13/0** (every moving figure pinned), **v5.73 22/0** — every cell
  worked by hand in the file first. **`controls_v573_me_mt.py`: 4 of 4 fired** (phaseout ignored; phaseout
  before the offset — which also reds the single case, $108 instead of $12,108; Montana $5,500; Montana ss 0.5).
- **Re-gated, not weakened:** `t10`'s partial-SS archetype moves to Colorado (hand figures 1,848 / 2,904) and
  Montana gets a full-SS pair (5,292.92 / 5,612.71), with a v573 check that exactly seven states remain at 0.5;
  `t29` F-6 and `t35` D-7/D-8 invert to "empty" at v573, as their v5.72 notes said; `controls_state_sets.py`
  learns that the non-empty shape was v5.72 only.
- **Bump.** `vercensus v572` priced it at **90** — 23 ladder, 66 gated, **1 keyed** (`t33`'s `PINS`, counted by the
  tool for the first time, so not missed). The AST transform's counts matched: 63 chain gates, 2 ternaries, one
  manual (`t38`'s `POST_FIX`). `t33`'s household is in Georgia, so its pins carry.
- ⚠ **A first v5.73 candidate was built and quoted before the Field Manual edit** (source `5e5dfa81…`, built
  `4e013a30…`). It was superseded before anything shipped.
