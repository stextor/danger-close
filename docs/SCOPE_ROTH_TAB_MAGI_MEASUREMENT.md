# SCOPE — measuring the Roth tab's IRMAA MAGI (the L8847 divergence)

| Field | Value |
|---|---|
| Status | ✅ **RETIRED 2026-08-26 by the scope-retirement sweep.** **FULFILLED — measurement complete, and its child scope `SCOPE_FIX_roth_tab_rmd_magi.md` was built at v5.41.** Status text was accurate; it simply was never retired. §3 steps 1–5 all complete. Kept as the record of how the work was scoped and built — **nothing here is outstanding; do not treat it as pending work.** | Results in `MEASUREMENT_roth_tab_magi_v5_40.md` **rev 2** (rev 1 carried a wrong `dobA` — see its §1). D-A/D-B/D-D resolved. **D-C answered by HH3: 8 of 8 ladder years render the wrong IRMAA verdict** — the defect is user-visible, not hygiene |
| ⚠ Revision 2 | 2026-08-20. **§1(c) below was wrong and is corrected in place** — see `STOP-REPORT-v5_40-roth-tab-section86.md`. The direction hypothesis in §1 "Net" was also wrong, and so was the inversion my stop report proposed to replace it. Both are superseded by §1d |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · committed tree `027fbd2` |
| Asked for by | `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` §6, which opened this rather than closing it; D4 of that scope waits on the outcome |
| Kind | **A measurement first.** Whether anything is fixed is decided by what the measurement says, not here |
| Changes | Unknown until measured. If it ends as measurement-only: `docs/` + a `t3` pin. If it ends as a fix: `src/` and a version bump |

---

## 0. Why this is a measurement and not a fix

The app renders **two different MAGI figures under the IRMAA label**, from two expressions, with no cue
to the user that they are computed differently. That much is established. What is *not* established is
whether the difference is a deliberate simplification, a defect, or immaterial — and **no arithmetic has
ever been run against the Roth tab's figure.**

Scoping a fix before measuring would be building on a hypothesis. Worse, the direction hypothesis in the
parent scope's §6 is the kind that feels obviously right and therefore never gets checked: *omitting
income understates MAGI, understates the IRMAA trigger, flatters the plan* — the non-conservative
direction, in a tool whose identity is deliberate pessimism. That reasoning is why this deserves priority.
It is not why it deserves a fix. **D-3 is the cautionary case**: recorded as under-taxing and flattering a
plan, ranked #2 of the top five on that basis, and measured on 2026-08-19 to be **54% too conservative** at
$120,000 — the direction was backwards, and only arithmetic found it.

## 1. Premise, verified — and the parent scope's §6 is wrong in three places

All resolved by AST against v5.40, with the site census from `qa/tools/census.cjs`, not greps.

**The site.** `const magi = pension + spouseBWork + taxableSS + conv_y;` at **L8847**, in
`<anon>@8719 < DangerCloseMain@5217` — the Roth tab's per-year ladder loop. Its own comment reads
`// MAGI (for IRMAA lookback)`. Four live consumers, all confirmed:

| Line | Consumer |
|---|---|
| L8876 | `const triggersIrmaa = magi > irmaaThresholdLookback;` |
| L8895 | exported on the row object |
| L9017 | table cell, coloured `var(--crit)` when over threshold |
| L9118 | the compact card, printed as `MAGI $XXXK` |

**Engine C, for comparison:** `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` at
L4399 — the seven-term set now pinned by the structural checks in `t1`.

⚠ **Three corrections to §6's description of the difference. Two shrink the claim; one adds to it.**

**(a) "Omits spouse A's earned income" is FALSE.** Engine C's `work_y` is
`annualSpouseBWork(yr) + streamsAnnualAt(yr, {tax:"ordinary"})` (L4340, L4368); the Roth block's
`spouseBWork` is `spouseBWorkTaper(year, _ladderStart) + streamsAnnualAt(year, {tax:"ordinary"})`
(L8828). `annualSpouseBWork` is a one-line wrapper on the same `spouseBWorkTaper` (L1354). The anchor
years match: Engine C passes `_retireYr`, the Roth block passes `rothLadderStart`, and
`rothLadderStart = targetRetireYear` (L663). **The two work terms are the same construction with the same
anchor. Neither engine models spouse A earned income at all.** This is not a divergence, and the parent
scope should not have listed it.

**(b) "Omits RMDs" is TRUE but CONDITIONAL, and for many households it is structurally vacuous.** The
ladder runs `_ladderStart … _ladderEnd` where `rothLadderEnd = single ? rothLadderEndA : Math.max(rothLadderEndA, rothLadderEndB)`
(L668) — each spouse's own pre-RMD year, household ladder to the **later** of the two. So:

- Single filer, or a couple where the RMD-start years coincide → **zero ladder years contain an RMD.**
  The omission cannot bite. `rmdTax_y` is legitimately absent.
- Couple with different RMD-start years → in the tail years between the earlier spouse's first RMD and
  the later spouse's, **RMDs are live and omitted.** How many such years, and how large, is exactly what
  the measurement must produce.

**(c) §6 misses a divergence entirely, and it is in the SS term.** Engine C sets
`ssTaxable = ssTot * 0.85` — a flat 85%, unconditional (L4394). The Roth block runs its own
provisional-income test against filing-status-selected thresholds (L8831–8844). So the two
expressions disagree on a term §6 treated as shared.

⚠ **CORRECTED 2026-08-20 (revision 2). This paragraph originally said the Roth block "runs the
graduated §86 provisional-income worksheet" and "can return anything from 0 to 85% of benefits."
Both claims are false, and they were load-bearing.** The block is a two-tier approximation:

- Above the adjusted base amount it returns **exactly 85% of benefits, always** — a cliff. §86(a)(2)'s
  limb (A), the graduated phase-in, is absent.
- In the middle tier it caps at **0.85 × benefits** where §86(a)(1) caps at **½ × benefits**.

**A correct implementation already exists in the file and the Roth tab does not call it:**
`taxableSSPortion` at **L4990–4997**, inside `computeTaxPlan` (Engine B, L4902). v5.40 therefore
carries **three** Social Security treatments — Engine B's worksheet, Engine C's flat 85%, and the
Roth tab's cliff.

Measured consequence: the cliff **overstates** taxable SS by up to $69,650 on a swept grid, and by
$40,580 on the shipped example household at a $12,000 conversion. It is live only for conversions
between roughly **$11,600 and $59,741** on that household — a band that does **not** contain the
$70,000 slider default, which is why the measured SS error at the default is **exactly $0 in every
ladder year**. Full arithmetic in the stop report and the measurement.

**Net.** The Roth tab's `magi` differs from Engine C's by **three genuine terms** — `rmdTax_y`
(conditional), `div_y`, `capGain_y` — plus a **fourth divergence in `ssTaxable`**, not four omissions
including a spouse's wages.

**(d) The direction, MEASURED 2026-08-20 — this supersedes the sentence that stood here.** The
original text argued every difference runs the same way, making §6's "understates, flatters the plan"
hypothesis *more* plausible. The stop report then argued the reverse, that the SS cliff inverts it.
**Both were over-generalisations, and the arithmetic settles it: the direction depends on the
conversion slider.**

| Slider (shipped example household) | Net error over the ladder | Direction |
|---|---|---|
| $0 – $10,000 | −$313K to −$332K | understates |
| **$15,000 – $20,000** | **+$52K / +$20K** | **overstates** — the SS cliff dominates |
| $25,000 – $60,000 | −$5K to −$152K | understates |
| **$70,000 (shipped default)** | **−$139,095, 12 of 12 years** | **understates** |

At the default, §6's original hypothesis is **correct**: the app understates MAGI, in the
non-conservative direction, in every ladder year. The SS term contributes **$0** there; **96.4% of
the error is the omitted RMD.** But the sign flips twice at low slider positions, so no
direction claim is true unconditionally — which is exactly why this scope refused to accept one
without arithmetic.

**One thing the measurement may find that this scope is not about.** Engine C's flat 85% overstates
taxable SS for any household below the upper provisional threshold. Against Engine C the Roth tab looks
low; against the *law* it may be the Roth tab that is closer on this one term. The reference for the
measurement is therefore **primary-source rules, not Engine C** (§3).

## 2. Site census

`census.cjs v540.jsx magi` — 24 AST hits. ⚠ Object-shorthand positions are reported twice (OPERATIONS
§B1, pinned defect), so read this as **hits, not sites**; the error over-reports and is safe.

| Scope | Hits | In scope here? |
|---|---|---|
| `runRothStrategies@3683` (`magiHist`) | 2 | No — different quantity (strategy MAGI history) |
| `computeIrmaaPlan@4272` (Engine C) | 7 | Reference only — not edited |
| `computeWithdrawalPlan@4454` | 8 | No — Engine D's own 9-term MAGI, different purpose |
| **`<anon>@8719 < DangerCloseMain@5217` (Roth tab)** | **6** | **Yes — the target** |
| `<anon>@9783` (IRMAA tab render) | 1 | No — renders Engine C's rows |

The target is a single expression with four consumers, all inside one render block. **Nothing outside
that block reads it.** That bounds any eventual fix tightly, which is worth knowing before deciding
whether to attempt one.

## 3. The measurement

**Section C standard: arithmetic, not inspection.** Reading the code and judging it plausible does not
count.

1. **Choose a household that makes the omission bite** (§5 D-A). At minimum it must have a Roth ladder
   with live years, a taxable sleeve throwing dividends, and — to exercise (b) — spouses with different
   RMD-start years so the tail years contain a real RMD.
2. **Hand-compute IRMAA MAGI from primary sources** for every ladder year — 26 U.S.C. §86 for the taxable
   SS fraction, Pub. 590-B for the RMD, and the CMS lookback definition for what belongs in MAGI. Written
   independently, before either engine's output is looked at.
3. **Compare to the dollar, three ways:** hand figure vs the Roth tab's **rendered** figure (via the DOM,
   not the internal variable — the rendered number is what the user acts on), hand figure vs Engine C, and
   Roth tab vs Engine C.
4. **Decompose the gap by term.** A single aggregate delta is not a finding; `rmdTax_y` vs `div_y` vs
   `capGain_y` vs the SS treatment must be attributed separately, because they have different fixes and
   the SS term may run the other way.
5. **Report the threshold consequence, not just the dollars.** MAGI that differs by $9,000 matters only if
   it crosses a tier edge. The finding is the count of ladder years where the two expressions land in
   **different IRMAA tiers**, and by how much.

## 4. What ships

**If the measurement finds the divergence immaterial or deliberate:** a `docs/` finding recording the
figures, plus a **`t3` pin** asserting the measured relationship so it cannot drift unnoticed, plus the
Field Manual disclosure that D4 has been waiting on — now writable because there is a number in it.
No version bump for the pin; the disclosure is `src/` and rides with a release.

**If it finds a real defect:** a fix scope of its own, with the fix derived before it is built (the v5.37 /
v5.38 order), a `t3` extinction invariant, and a version bump. `capGain_y` is the awkward one — the Roth
block has **no `gainByYr` in scope**, so routing realized gains in is a plumbing change, not a term added
to a sum. That is a real cost and it belongs in that scope, not this one.

**Either way, this scope ships the measurement**, and the parent scope's §6 gets closed with an answer
rather than carried again.

## 5. Open decisions

**RESOLVED 2026-08-20: D-A both households · D-B include the SS term · D-D (new) revise and resume.**
D-B was vindicated — the SS term turned out to be the one that inverted the working hypothesis, and
excluding it would have produced a net figure wrong by construction, exactly as predicted below.

**D-C — ANSWERED 2026-08-20.** The straddling household this paragraph called for was built (HH3)
and it settles the question: **8 of 8 ladder years show a green ✓ where the statute triggers a
surcharge.** The fix is in the product boundary — it makes an existing output more correct for a
mainstream couple, and the output it corrects is a warning the tab currently gets backwards.
Recommended order, per the measurement §6: `rmdTax_y` first, then `div_y`/`capGain_y` (59% of
HH3's error, and what inverts the verdict before any RMD exists), then the SS cliff (cheapest fix,
lowest severity — it contributed $0 on all three households).

Note the shape of the earlier evidence: HH1 and HH2 gave **0 of 20** verdict changes between them,
which read as "not user-visible." That reading was an artifact of neither household sitting near a
tier edge. **A zero result from households not built to test the thing is not a negative finding.**

| # | Decision | Notes |
|---|---|---|
| **D-A** | **Which household?** The shipped example, or one built to make the omission bite (different RMD-start years, funded taxable sleeve, live ladder)? | **Recommend: both.** The example household answers "does this affect the user in front of us"; the constructed one answers "how bad can it get". One is not a substitute for the other, and running the example alone risks a $0 result that reads as *no problem* when it means *this household does not exercise it*. Two households, both hand-computed |
| **D-B** | **Does the measurement include the SS-treatment divergence (§1c), or only the three missing terms?** | **Recommend: include it.** It is the one difference that might run the other way, and excluding it would produce a net figure that is wrong by construction. It is also the item most likely to turn up something about **Engine C** rather than the Roth tab |
| **D-C** | **If the fix turns out to be large, is it in the product boundary at all?** The Roth ladder is a self-contained projection that may be deliberately simplified | **No recommendation — this is yours.** The boundary test asks whether the feature makes an existing output *more correct*. It plainly does. But "the Roth tab's IRMAA warning is approximate, and here is how" is also a legitimate answer for a hobbyist tool that discloses rather than silently simplifies. Worth deciding **after** the numbers exist, not now |

## 6. Out of scope

- **Any `src/` change.** This scope measures. A fix, if warranted, is a separate scope with a version bump.
- **Engine C's flat-85% SS treatment.** It will be measured as a comparison term (§5 D-B) and reported if
  it looks wrong, but it is not this scope's target and must not be edited here.
- **`runRothStrategies`' `magiHist` and Engine D's 9-term MAGI.** Different quantities, out of the census.
- **D4 of the parent scope** — the disclosure decision. It waits on this measurement by design.
- **Re-scoping `domdiff_withdrawal.mjs`**, red since v5.40 and reported separately.
- `AUDIT_TOP_FIVE_SUMMARY.md`'s stale L9792 citation for S-1 (the sentence is at L9800).

## 7. Cautions for whoever picks this up

- **§A freshness check first.** Re-run 2026-08-20 at the measurement session: **82 of 83 pool files
  content-identical** to the committed tree, both directions, the single exception being the retained
  prior source. (`README-FIRST.md` is no longer in the pool, hence 83 rather than 78.)
- **The rendered figure is the claim, not the variable.** L9118 prints `MAGI $XXXK` — rounded to
  thousands. A sub-$500 divergence is invisible on screen and a $499 error rounds away. Measure the
  variable *and* the rendering; they support different claims.
- **Harness traps apply.** Engine P objects need `asOfYr` or every tax silently NaNs; `applyLoadedData`
  takes a wrapper object and mutates module globals without re-rendering, so park on another tab before
  reading; `dobA`/`dobB` must be `"YYYY-MM-DD"` **strings** or a different household is planned than the
  one declared — and this measurement is **age-keyed at its core**, since D-A turns entirely on the two
  spouses' RMD-start years. That trap would silently invalidate the whole result.
- **Do not adjust the expectation until it matches.** If the hand computation and the engine disagree,
  adjudicate by reading the primary source, and record which one was wrong.
