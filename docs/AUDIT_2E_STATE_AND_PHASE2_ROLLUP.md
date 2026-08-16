# AUDIT 2E — the state-tax module, and the Phase 2 roll-up

**Sub-phase 2E is complete. Phase 2 (Section C) is complete.** This is the last sub-phase of the
standing audit that began at v5.10.1.

| Field | Value |
|---|---|
| Date | 2026-08-12 |
| Build | **v5.28** · `9e06482087f415661196b1c47f7e8be0` (committed tree) |
| Governing decision | `SCOPE_AUDIT_PHASE2_v5_10_2.md` **D-5** |
| Deliverable | `t10_taxcases.mjs` gains a **2E** block — **20 checks** · t10 134 → **154** |
| Result | **`stateTaxAnnual` implements its documented approximation correctly.** One documentation gap, pinned. |

---

## 1. Scope, and why the boundary is not a dodge

D-5 scoped 2E to one jurisdiction per archetype rather than all 51, because `stateTaxAnnual`
(L981–997) is **one function with five behavioural branches**; the archetypes exercise every branch,
and testing 51 jurisdictions re-confirms the same five code paths with different constants.

The boundary D-5 draws is the important part:

> 2E asks whether the code implements the **documented approximation** correctly. Whether an
> effective flat rate is a good stand-in for a progressive state schedule is already a disclosed
> limitation… A state whose modelled treatment contradicts its own `note` string **is** a defect.

So "California uses 6% for a 1–13.3% progressive schedule" is **not** a finding — it is disclosed in
the Field Manual §13, in the module header, and in California's own note. A state whose note and
behaviour disagree **is**.

**The maintainer's own state is Florida**, which is the no-tax archetype — D-5's two requirements are
satisfied by one jurisdiction.

---

## 2. Hand-verified — all six branches, both filing statuses

One income shape throughout, so jurisdiction is the only variable:
retirement $40,000 · pension $20,000 · work $10,000 · capital gains $5,000 · federally-taxable SS
$30,000.

| Archetype | State | Hand arithmetic | Engine | |
|---|---|---|---|---|
| No tax | **FL** | short-circuits at `rate === 0` | 0 | ✓ |
| Flat | **AZ** 2.5% | `0.025 × 75,000` | 1,875 | ✓ |
| retExempt | **MS** 4% | `0.04 × (0 + 10,000 + 5,000)` | 600 | ✓ |
| excl65 MFJ | **AL** 4.5% | `0.045 × ((60,000 − 12,000) + 15,000)` | 2,835 | ✓ |
| excl65 single | **AL** | `0.045 × ((60,000 − 6,000) + 15,000)` | 3,105 | ✓ |
| partial-SS MFJ | **MT** 5.65% | `0.0565 × ((60,000 − 11,000) + 10,000 + 15,000 + 5,000)` | 4,463.50 | ✓ |
| partial-SS single | **MT** | `0.0565 × ((60,000 − 5,500) + 30,000)` | 4,774.25 | ✓ |
| Fallback | none | `0.05 × (70,000 + 5,000)` | 3,750 | ✓ |

Every figure computed from the rule table **first**, then compared. All match to the cent. MT is the
strongest case: it carries both `ss: 0.5` and a `$5,500` exclusion, so it exercises two branches at
once.

---

## 3. Clamps — five places a sign error would produce a negative tax

None of these is reached by the archetype cases, and all five hold:

| Case | Behaviour |
|---|---|
| Exclusion ($12,000) exceeds retirement income ($3,000) | clamps at 0, taxes only the $20,000 of work → $900 |
| A $30,000 capital **loss** | ignored, not deducted → tax unchanged |
| `persons65 = −5` (defensive) | no negative exclusion → full base taxed |
| No-tax state with a 90% fallback rate and $4M income | returns 0; fallback correctly unreachable |
| retExempt state, $700,000 of retirement income | returns 0 |

---

## 4. The defect test D-5 actually names

I scanned **all 51 jurisdictions** for behaviour contradicting the `note` string. Seven candidates
surfaced; **six are false positives** — the dollar figures in those notes are **AGI thresholds** or
explicitly unmodelled provisions, not exclusions:

| | |
|---|---|
| CT, NM, UT, VT | `$75K/$100K`, `$100K/$150K`, `$54K/$90K`, `$50K/$65K` are the income thresholds above which SS becomes taxable — correctly modelled by the `ss: 0.5` factor, exactly as the module header describes |
| MD | note says "~$36K", table holds `36200`. Agreement; my matcher demanded an exact figure |
| WA | "no income tax (7% capital-gains excise over ~$270K **not modeled**)" — `rate: 0`, and the omission is disclosed in the note itself |

**One is genuine, and is pinned:**

> **[KNOWN DEFECT 2026-08-12 | MT note omits SS]** Montana carries `ss: 0.5`, so the model taxes half
> of federally-taxable Social Security there. Its note reads only *"$5,500 65+ subtraction"* and never
> mentions Social Security. **All seven other partial-SS states say so in their notes** (CO, CT, MN,
> NM, RI, UT, VT) — asserted as a control, so the pin cannot pass by accident.

The **modelling is correct**; the **disclosure is incomplete**. That is the mild form of the defect
D-5 names, which is why it is pinned rather than treated as a stop. A Montana user reading the note
would not learn their Social Security is being taxed by the model. Fixing it is a one-string change
in a future release, and flipping the pin is its verification.

---

## 5. Negative controls — five, all firing

| Control | Fails |
|---|---|
| Exclusion applied once rather than per person | 3 |
| `retExempt` ignored | 2 |
| The negative clamp on `retBase` removed | 1 |
| Capital losses deducted instead of ignored | 1 |
| The SS factor ignored | 2 |

---

## 6. PHASE 2 ROLL-UP

`SCOPE_AUDIT_PHASE2_v5_10_2.md` requires a roll-up at the end of Phase 2 naming which of Section C's
bullets were verified. All five sub-phases are now closed:

| Sub-phase | Coverage | |
|---|---|---|
| **2A** federal core | brackets, deductions, LTCG, NIIT, SS taxability | ✅ 76 checks |
| **2B** IRMAA + indexation | tier selection, 2-year lookback, indexation | ✅ 78 checks |
| **2C** first-spouse death | filing-status transition, survivor RMD, IRMAA | ✅ across t11–t15 |
| **2D** break-even + completeness | crossover identity, discounting equivalence, `otherAccounts` | ✅ 19 checks |
| **2E** state tax | five archetypes, both statuses, clamps, 51-state note scan | ✅ 20 checks |

**Section C — "numerical validation to the dollar" — is verified.**

### Two residual gaps, both stated rather than closed

1. **2D:** the crossover *selection* expression (`beYr = beWasBehind ? firstRecover : firstAhead`)
   sits in an unexported closure inside `DangerCloseMain` and is reimplemented by the suite. The
   wealth series, the tax identity and the discounting equivalence are genuine engine output; the
   one-line selection is not reached. Closing it needs ~14 lines extracted to a callable function.
2. **2E:** Montana's note, above.

Neither affects a computed figure. Both are recorded in `t10` at the point where they matter.

### What Phase 2 leaves for Phases 3 and 4

| Phase | Sections | Status |
|---|---|---|
| 1 | A + B — creator exposure, PII | ✅ done at v5.10.1 |
| **2** | **C — numerical validation** | ✅ **done, this document** |
| 3 | D + E — missing tax features, architecture | ⬜ not started |
| 4 | F — usability, desktop + small screen | ⬜ not started |

Phase 3's Section D is the natural successor: it asks what the model *doesn't* have rather than
whether what it has is right, and several candidates are already disclosed in Field Manual §13 (the
OBBBA senior-bonus deduction, QCD one-time CRT/CGA election, joint-mortality correlation).
