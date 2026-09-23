# SCOPE — the survivor's age deductions (C-3) and the unused deduction against gains (C-6)

**FULFILLED — built and shipped at v5.75 (2026-09-23).** All eight build-order steps executed; every §1 figure
reproduced before any code changed. Corrected here: the example household's survivor is **78** in the death year and
79 in the first single-filing year, not 79 at the death — the conclusion (already past 65, so unaffected) is unchanged.

| | |
|---|---|
| Status | ☑ **BUILDABLE, NOT BUILT — all seven decisions (§7) adopted as recommended by Steve, 2026-09-22.** |
| Build under scope | **v5.74** — source `1ff04dee1b43b20880a8500ab9645f02`, built `index.html` `4e7532a4670f667d3ad53c580f278d7f`, repo `e44970f` |
| Findings | `FlawsToFix-v5_73-Phase2.md` **C-3** (medium, optimistic, undisclosed) and **C-6** (medium, pessimistic, undisclosed) — the audit's fourth-ranked issue (`AUDIT_TOP_FIVE_SUMMARY.md`) |
| Release | app release, **v5.75** (proposed) |

## 1 · Premise — verified on v5.74 by execution, not recalled

**Both defects persist unchanged at v5.74.** The audit's probes (`qa/tools/audit_phase2_v573/audit_c3*.mjs`,
`audit_c6.mjs`) were re-run on both builds; every figure matches the audit's v5.73 table.

**C-3 — a surviving spouse under 65 gets the 65+ deductions through the deceased spouse's age.** Engine B, the audit's
household (A born 1955, dies 2027; B born 1966; $50,000 pension; no SS, no state):

| Year | Filing | B's age | `seniorExtra` (v5.74) | Correct | fedTax (v5.74) | Hand | Understated |
|---|---|---|---|---|---|---|---|
| 2026 | MFJ | 60 | 7,650 | 7,650 | 1,015.00 | 1,015.00 | 0 |
| 2027 | MFJ (death year) | 61 | 7,683 | 7,683 | 947.30 | 947.30 | 0 |
| 2028 | Single | 62 | **8,133** | **0** | 2,756.02 | 3,731.98 | **975.96** |
| 2029 | Single | 63 | **2,175** | **0** | 3,425.62 | 3,686.62 | **261.00** |
| 2030 | Single | 64 | **2,219** | **0** | 3,374.04 | 3,640.32 | **266.28** |
| 2031 | Single | 65 | 2,263 | 2,263 | 3,321.51 | — | 0 |

Engine A (Roth comparator), same household, 2028: `totTax` **3,476** against the correct **3,732**.
The hand figures are the audit's, from Rev. Proc. 2025-32 with the model's 2%/yr indexation.

**C-6 — unused standard deduction is not applied against qualified dividends and capital gains.** Engine B, single,
under 65, 2026, with the AMT line shown separately:

| Ordinary / preferential | v5.74 (fed + gains tax + AMT) | Law |
|---|---|---|
| 0 / 60,000 | **1,582.50** | **0.00** |
| 8,000 / 70,000 | **3,082.50** | **1,867.50** |
| 15,551 / 50,000 | 82.50 | 0.15 |
| control 16,100 / 60,000 | 1,582.50 | 1,582.50 |
| control 30,000 / 60,000 | 5,087.50 | 5,087.50 |

Engine A returns the same overstatements (1,583 / 3,083 / 83; it rounds to whole dollars).

**The trap — measured, and it shapes the fix.** Both engines compute AMT by stacking the gains on an AMT base that is
floored at zero, the same way. Two patched copies of Engine B were built and run on the cases above:

| Case | Patch 1 — regular path only | Patch 2 — regular **and** AMT paths | Law |
|---|---|---|---|
| 0 / 60,000 | 0 gains tax **+ 1,583.00 AMT** = 1,583.00 | 0.00 | 0.00 |
| 8,000 / 70,000 | 1,867.50 **+ 1,215.00 AMT** = 3,082.50 | 1,867.50 | 1,867.50 |
| 15,551 / 50,000 | 0.15 **+ 82.00 AMT** = 82.15 | 0.15 | 0.15 |
| controls | unchanged | unchanged | — |

**A fix to the regular path alone leaves every overcharge in place, relabelled as AMT.** The AMT sites are therefore not
optional (§7 D-4). Patch 2 matches the law to the cent and moves neither control.

**The example household is unaffected by either fix**, measured: its first death is in 2044, when the survivor (B) is
79; and no year has ordinary income below the deduction while gains or dividends exist, on either view of the Taxes tab
(as-is, and as it first opens). Both defects were hidden by the example data — which triggers §K1 (§5).

## 2 · The law — primary sources

- **C-3.** IRS Publication 501 (2025): in the year of death, consider the spouse 65 or older at the end of the year only
  if the spouse was 65 or older at the time of death. Publication 554 (2025): the death year is the last year a joint
  return can be filed; after that the survivor files as a qualifying surviving spouse, head of household, or single. So in
  later years only the survivor's own age can qualify. The enhanced deduction for seniors is $6,000 per eligible person
  ($12,000 on a joint return where both are eligible) — also per person, so the same rule governs it.
- **C-6.** 26 U.S.C. §1(h)(1) (uscode.house.gov): each preferential tier taxes "the adjusted net capital gain (or, if
  less, taxable income)". Taxable income is after the standard deduction, so a deduction left over after ordinary income
  reduces the gains that are taxed.
- **AMT.** 26 U.S.C. §55(b)(3) (uscode.house.gov): each AMT tier taxes "the adjusted net capital gain (or, if less,
  taxable excess)", and the taxable excess is AMT income above the exemption — the same cap as §1(h). So the AMT half of
  the fix follows the law, not only the execution in §1. *(Read 2026-09-22.)*
- **NIIT is unaffected.** 26 U.S.C. §1411: 3.8% of the lesser of net investment income or modified AGI over the
  threshold, and modified AGI starts from adjusted gross income — the standard deduction never enters. No NIIT change.
  *(Read 2026-09-22.)*
- **Still to read, build step 1 — confirmation only, the statute governs:** the 2025 Form 1040 Qualified Dividends and
  Capital Gain Tax Worksheet, from the IRS instructions themselves.

## 3 · Site census — parser output on v5.74 (`census.cjs`), not greps

**C-3 — one rule, two copies, three callers:**
- `seniorExtraFor` (L895, module level) — single filer: `Math.max(ageA, ageB) >= 65`. **The rule.**
- Engine B's OBBBA bonus (L5717, `computeTaxPlan`) — `persons65` repeats the same test. **A second copy of the rule.**
- Callers passing both ages: Engine A (L4306, `runRothStrategies`), Engine B (L5709), and the Roth tab's bracket
  projection `projectBrackets` (L9398, a closure inside `DangerCloseMain`; single years from `_filingSingleAt`, L9359).
- Who survived is already known: Engine B `_survivorIsA` (L5505); Engine A `P.survivor` (L4225), built as an object key
  at four sites (L5939, L9965, L10111, L11273) from one repeated expression.

**C-6 — two stacking helpers, thirteen calls, all in Engines A and B:**
- Engine B: helper `ltcgTax` (L5551); regular call (L5725) and AMT call (L5745).
- Engine A: helper `ltcgF` (L4155); regular calls (L4397, L4517), AMT calls (L4403, L4523), and the sale gross-up and
  ACA sale stacks (L4430, L4476, L4604, L4609, L4657, L4686, L4691), whose stacks `_stackC`, `_stack`, `_stackAca` are
  built from the same floored value (L4420, L4602, L4650).
- **Engines C and D compute no federal income tax** — the bracket machinery (`ltcgBrackets2026`, `fedOrdinaryTax`,
  `marginalBracket`) is referenced only inside Engine B, and Engine A carries its own tables. This makes the audit's
  text-search claim firm.

## 4 · The fix (as proven on Engine B by Patch 2)

- **C-3.** One shared rule for "who is 65 or older on this return": on a joint return, each spouse by their own age (the
  death-year behaviour is unchanged); on a single return, **the filer only** — the survivor in widowed years, spouse A in
  a single household. Both the §63(f) additional deduction and the OBBBA bonus use it, which removes the second copy.
- **C-6.** Each helper accepts a **signed** stack — ordinary income minus deductions, possibly negative. A negative stack
  first absorbs the gains (`taxed = max(0, gains + stack)`, stacked from zero). Every caller passes the unfloored value,
  in the regular and AMT paths alike (AMT: AMTI minus the exemption). Ordinary tax and the bracket display keep using the
  floored value.

## 5 · Tests

- **`t41` (new, both legs).** C-3: the household above, Engine B `fedTax` 2026–2031 to the cent against the hand
  figures; `seniorExtra` 0 in 2028–2030; the death year unchanged; the 2028 bonus 0; Engine A 2028 = 3,732; a single
  household with a stale spouse-B birth date takes only A's age. C-6: the five cases in both engines, total equal to the
  law, **AMT = 0 in every case** (the phantom-AMT guard); one Engine A sale gross-up case with an unused deduction; an
  extinction sweep of (ordinary, gains) pairs around the deduction and the 0% top. The v5.74 leg pins the defects as
  dated known defects.
- **§K1 boundary census (`t29`)** gains the two conditions the example data hides: *first death while the survivor is
  under 65*, and *ordinary income below the deduction with preferential income above the 0% top*.
- **Negative controls** (`controls_v575_c3c6.py`): clean build passes; revert the single-filer rule; revert the bonus
  copy; floor Engine B's regular stack; floor Engine B's AMT stack (the phantom-AMT pin must fire); floor one Engine A
  regular site and one sale-stack site.
- **Existing pins that move are re-derived, never overwritten** — measured at build (candidates: `t17`/`t18` for Engine
  B, `t3`/`t22` for Engine A, and the Roth fingerprints in MC parity, which would need a declared intended difference).

## 6 · Out of scope

C-4 (Engine A's §86 error), C-1, C-5, C-9, C-10; C-7's Social Security side (the tax side of a stale spouse-B birth
date *is* covered by D-2); consolidating the other duplicated rules (E-22) beyond these two; qualifying-surviving-spouse
and head-of-household statuses; blindness; state taxes.

## 7 · Decisions — all ADOPTED as recommended, 2026-09-22

- ✅ **D-1 · Fix every copy in one release** — Engines A and B, the Roth tab's projection, both helpers and all thirteen
  calls. *Recommended:* yes. Fixing some copies only is how these defects arose (E-22).
- ✅ **D-2 · One shared "65 or older on this return" rule**, used by both the additional deduction and the bonus, filer-only
  on a single return. *Recommended:* yes. It also stops a single household's stale spouse-B birth date from granting the
  deduction.
- ✅ **D-3 · Signed stacks** in both helpers. *Recommended:* yes — proven to the cent by Patch 2.
- ✅ **D-4 · AMT sites in the same release.** Not really a choice: execution shows a regular-only fix relabels the whole
  overcharge as AMT. Listed so the reason is on record.
- ✅ **D-5 · Include Engine A's sale gross-up stacks.** *Recommended:* yes — otherwise Engine A taxes the sale that funds a
  conversion differently from the year's own gains.
- ✅ **D-6 · The death-year edge.** The model counts the decedent as 65+ when the calendar year minus birth year reaches 65;
  Pub 501 requires 65 *at the time of death*. They differ only when death comes before the 65th birthday in that year, and
  the model has no death date. *Recommended:* leave it, and disclose it (optimistic, one year, narrow).
- ✅ **D-7 · Test the Roth tab's projection by hoisting `projectBrackets` to module level**, as v5.74 hoisted
  `withdrawalPlanSeries`, so `t41` can call it directly instead of reading rendered text. *Recommended:* yes.

## 8 · Build order

1. Re-run the scope probe on v5.74 and reproduce §1 exactly (C-3 rows, C-6 cases, Patch 1 and Patch 2 — built by
   `scope_c3c6_patches.py`); read the 2025 worksheet. **If anything differs, stop and report.**
2. Engine B: the shared rule, the bonus, signed stacks in both paths — must reproduce Patch 2 and the C-3 hand figures.
3. Engine A: helper and all eleven calls — the same cases; demonstrate the phantom-AMT trap on A before its AMT half lands.
4. The Roth tab's projection (hoisted, per D-7).
5. `t41`, the §K1 rows, the controls.
6. Measure every existing pin that moves; re-derive each by hand; declare parity differences.
7. Disclosures: METHODOLOGY (the stacking passage, the survivor rule, the D-6 edge), CHANGELOG; the Field Manual only if
   one of its sentences becomes false.
8. Version bump to v5.75, full suite from the packaged copies, `index.html`, package.

The scope probe (`scope_c3c6.mjs`, the patch recipe, and the example-household measurement) ships repo-only with the
build, beside the audit's probes, so every figure above can be reproduced.
