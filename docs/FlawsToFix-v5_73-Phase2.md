# FlawsToFix — v5.73 · Phase 2 (Section C: numerical validation) — COMPLETE

**Build audited:** v5.73 · `src/DangerClose.jsx` md5 `3bf1e15f1b28659aae9a78e3186d2ae8` · built `index.html`
`345ccbceb58bf74f9fbdde5db0646d1d` · repo `7220b96`
**Scope:** `SCOPE_STANDING_AUDIT.md` Section C. **Mode:** findings only; fixes are scoped separately.
**Status:** ☑ **PHASE 2 COMPLETE (six working sessions, 2026-09-15).** Every item of Section C was executed against the
build above; §0 summarises the findings, §4 states plainly what was **not** covered. Phases 3 (D + E) and 4 (F) remain,
and the scope's standalone top-five summary is written only after Phase 4.

**Destination of this file:** session workbench until Phase 2 closes; then `docs/` **and** the pool, as
`FlawsToFix-v5_73-Phase2.md`, with a manifest row.

**Post-audit update, v5.74 (2026-09-21).** **C-8 is FIXED at v5.74** (`docs/SCOPE_TAXES_DRAWDOWN.md`, retired with its
build record in §12; pinned by `t40` on both legs). The findings below are left as written. **Filed here — two open
follow-ups whose only pooled record was that scope, which leaves the pool at this ship:** (1) **D-4 · the conversion caps
still differ.** Engine B caps a conversion at `tradBal − max(rmd_y, qcd_y)`, Engine D at `tradNotional_boy − rmd_y`
(both read in the v5.74 source). The scope expected them to converge once the engines shared one balance path, but D-9
kept Engine B on its own 4.5% growth, so the caps are still measured on different balances. Whether that ever binds is
unmeasured. (2) **D-7 · Engine A (the Roth comparator) has the gap C-8 closed in B and C:** its ordinary base is
`pen + work + otherOrd + rmd`, with no spending draw. Its output is a difference between conversion strategies, where a
draw common to both sides largely cancels — "largely" is unmeasured, so this is an open finding, not a clean exclusion.
**Also fixed at v5.74, found during its build:** the Taxes tab's detail panel never itemized dividends/interest or other
ordinary income, though both were in its "Gross taxable" total; it now lists every term (`t40` section D).

---

## 0 · Findings at a glance

| ID | What | Engines | Severity | Direction | Disclosed? |
|---|---|---|---|---|---|
| **C-8** | Taxes tab never taxes spending withdrawals from Traditional accounts; its RMDs run on a never-drawn balance (example household: $0 tax 2032–2038 on ≈$238K of draws; lifetime RMDs $1.63M vs $1.02M) | B vs D | **High** | mis-timed: low early, likely high late | **No** — the tab says it is "your projected tax life as-is" |
| **C-3** | A surviving spouse under 65 gets the 65+ deductions via the deceased's age ($975.96 in 2028 in the worked case) | B, A (executed); Roth-tab projection (read) | Medium | optimistic | No |
| **C-6** | Unused standard deduction is not applied to qualified dividends / capital gains (up to 15% of the unused deduction; $1,582.50 on $60K of gains with no ordinary income) | A, B | Medium | pessimistic | No |
| **C-4** | Engine A keeps the §86 upper-tier error v5.45 fixed in B (+$150 in the worked case); v5.45's census named 2 of 5 §86 sites | A | Low–medium | pessimistic | No |
| **C-7** | A single household is paid spouse B's Social Security in the Withdrawal plan | D | Low–medium → **re-measured larger at v5.75; FIXED v5.76** | optimistic | No |
| **C-10** | A Roth IRA under Other accounts is sold as brokerage and realizes taxable gains (when a gain share is set) | D → B, C | Low–medium | pessimistic | No |
| **C-1** | At exactly the IRMAA top-tier threshold the household is billed one tier low | A, C | Low | optimistic | No |
| **C-5** | The Withdrawal tab's bracket column uses the joint table for every household, unindexed, with a flat 85% of SS | D (display) | Low | varies | No |
| **C-9** | The annuity RMD exclusion is a fixed share, so RMDs creep up as the pool drains (+$4,547 by 2050) | B (and C by the same code) | Low | pessimistic | No |
| **C-11** | The break-even card calls a face-value cash measure "after-tax wealth" | Roth tab | Low | — | — |
| **D-1** | METHODOLOGY's §86 passage contradicts itself and omits Engine A | doc | Low | — | — |
| C-2 | IRMAA surcharges rounded to $10 | — | — | — | **Yes** — documented limitation, not a defect |

**What passed** (all executed, references typed from primary sources): every statutory constant (§1); ordinary tax at
every bracket border in A and B; LTCG, NIIT and §86 borders; the OBBBA senior bonus; IRMAA tiers 1–4; the IRMAA top-tier
freeze; indexation of indexed figures and non-indexation of statutory ones in A, B and C; the ACA borders (by reading);
first-spouse death in B; the state module's conditioned branches against their declared rules.

---

## 1 · Statutory constants, checked against primary sources (2026-09-15) — COMPLETE

Every figure in `TAX_CONSTS` and `IRMAA_CONSTS` (L850–976) that a primary source publishes was compared digit for
digit. **Source for federal figures: IRS Rev. Proc. 2025-32 §4.** **Source for IRMAA: CMS fact sheet
"2026 Medicare Parts A & B Premiums and Deductibles", 14 Nov 2025.**

| Constant | App | Primary source | Result |
|---|---|---|---|
| Standard deduction, single / joint | 16,100 / 32,200 | §4.14(1) | ✓ |
| Single brackets (tops) | 12,400 · 50,400 · 105,700 · 201,775 · 256,225 · 640,600 | §4.01 Table 3 | ✓ all six |
| Joint brackets (tops) | 24,800 · 100,800 · 211,400 · 403,550 · 512,450 · 768,700 | §4.01 Table 1 | ✓ all six |
| LTCG 0% / 15% maxima, single | 49,450 / 545,500 | §4.03 | ✓ |
| LTCG 0% / 15% maxima, joint | 98,900 / 613,700 | §4.03 | ✓ |
| AMT exemption, single / joint | 90,100 / 140,200 | §4.10 | ✓ |
| AMT phaseout start, single / joint | 500,000 / 1,000,000 | §4.10 | ✓ ($1,000,000 unindexed before 2027 per §2.07) |
| AMT 28% break | 244,500 | §4.10 | ✓ |
| Additional std deduction, aged | 1,650 (married) / 2,050 (unmarried) | §4.14(3) | ✓ |
| IRMAA thresholds, single | 109,000 · 137,000 · 171,000 · 205,000 · 500,000 | CMS table | ✓ all five |
| IRMAA thresholds, joint | 218,000 · 274,000 · 342,000 · 410,000 · 750,000 | CMS table | ✓ all five |
| IRMAA annual surcharge per person (`SUR`) | 1,150 · 2,880 · 4,620 · 6,360 · 6,940 | (B + D IRMAA) × 12 = 1,148.40 · 2,884.80 · 4,620.00 · 6,355.20 · 6,936.00 | ⚠ rounded — see C-2 |

**Session 2 additions (2026-09-15):**

| Constant | App | Primary source | Result |
|---|---|---|---|
| FPL 2026 guideline, base / per person | 15,960 / 5,680 | HHS/ASPE 2026 guidelines table | ✓ |
| Applicable percentage table 2026 (six bands, initial/final) | 2.10/2.10 · 3.14/4.19 · 4.19/6.60 · 6.60/8.44 · 8.44/9.96 · 9.96/9.96 | IRS Rev. Proc. 2025-25 §3.01 | ✓ all twelve figures |
| §402(g) limit / 50+ catch-up / 60–63 catch-up | 24,500 / 8,000 / 11,250 | IRS IR-2025-111; IRS "Catch-up contributions" page | ✓ |
| QCD limit | 111,000 | Notice 2025-67 **as summarised by ASPPA** | ✓ *secondary only — the Notice itself was not opened* |
| SS wage base 2026 | 184,500 | SSA press release, 24 Oct 2025 | ✓ |
| OBBBA senior bonus: amount / thresholds / years | 6,000 / 75,000 & 150,000 / 2025–2028 | IRS newsroom and Pub. 6142 | ✓ |
| OBBBA senior bonus: rate and **how it phases** | 6%, applied to each person's $6,000 | **IRS 2025 Schedule 1-A, Part V** (line 35 is $6,000 − 6% × excess; each qualifying spouse enters line 35) | ✓ — and Engine B (L5642–5644) computes it exactly that way. A joint couple's bonus is gone at $250,000, not $350,000 |

**Session 3 additions — §1 is now COMPLETE:**

| Constant | App | Primary source | Result |
|---|---|---|---|
| `AMT_PHASE_RATE` | 0.50 | Rev. Proc. 2025-32 §4.10: exemptions $140,200 / $90,100 are fully phased over $280,400 / $180,200 ($1,000,000→$1,280,400; $500,000→$680,200) — both ratios are exactly 0.50 | ✓ |
| FPL 2025 (used for 2026 coverage) | 15,650 / 5,500 | HHS/ASPE 2025 guidelines table | ✓ |
| NIIT thresholds, unindexed | 250,000 joint / 200,000 other | 26 U.S.C. §1411(b), uscode.house.gov — no indexing provision | ✓ |
| SS base / adjusted base, unindexed | 25,000 & 32,000 / 34,000 & 44,000 | 26 U.S.C. §86(c), GovInfo | ✓ |

Reference values the Rev. Proc. prints, for the hand cases in §3: joint tax at the top of each bracket —
$2,480 · $11,600 · $35,932 · $82,048 · $116,896 · $206,583.50; single — $1,240 · $5,800 · $17,966 · $41,024 ·
$58,448 · $192,979.25.

## 2 · Candidates — READ, NOT YET EXECUTED (the audit does not count these as findings until run)

**C-1 · CONFIRMED (Engine A, executed) — at exactly the IRMAA top-tier threshold the household is billed one tier low.**
*Severity: low. User-side. Optimistic. Not disclosed.* CMS defines tiers 1–4 as "greater than X and less than or equal
to Y" but the top tier as "**greater than or equal to** $500,000" (single) / "$750,000" (joint). Every engine picks the
tier with `magi <= threshold` — Engine A at L4333, L4386, L4554 and Engine C at L4809 — so a MAGI of exactly the top
threshold lands in tier 4. The IRMAA tab's tier table (L10426) labels the top tier "> $500K", matching the code, not CMS.

Executed (probe `audit_c1.mjs`, Engine A, premium year 2028, whose top threshold is 500,000 × 1.02 = exactly 510,000
in floating point):

| Case | MAGI | Engine `totIrmaa` | CMS rule gives |
|---|---|---|---|
| single | 509,999 | 6,360 (tier 4) | tier 4 ✓ |
| single | **510,000** | **6,360 (tier 4)** | **top tier — 6,940 in the app's own table** |
| single | 510,001 | 6,940 | top ✓ |
| joint (threshold 765,000) | 764,999 / **765,000** / 765,001 | 12,720 / **12,720** / 13,880 | at 765,000: **13,880** |
| control: single tier-1 edge (113,403.60) | −1 / **exact** / +1 | 0 / **0** / 1,150 | exact → standard ✓ (CMS "≤") |

Under-charge at the exact threshold: $580 per person per year in the app's table ($580.80 at CMS figures). The band
is one dollar wide for a float MAGI, so this matters only to a user who targets the threshold. **Engine C is now also
EXECUTED (session 5):** MAGI exactly 510,000 (single) and 765,000 (joint), premium year 2028, return tier 4 and surcharges
6,360 / 12,720. Fix direction: `<` for the top numeric tier only.

**C-2 · CLOSED — a DOCUMENTED LIMITATION, not a defect (methodology rule 5).** `SUR` is rounded to the nearest $10.
METHODOLOGY L615–616 discloses exactly that ("rounded to the nearest $10 — within $5/person/year of the CMS-exact
figure at every tier"), and the claim is true (largest measured difference $4.80). The IRMAA tab says "approximate"
beside the table (L10431).

**C-3 · CONFIRMED (Engine B, executed) — a surviving spouse under 65 is given the 65+ deductions through the
deceased spouse's age.** *Severity: medium. User-side. Optimistic (tax understated). Not disclosed.*

- **Cause.** `seniorExtraFor` (L901–905), for a single filer, tests `Math.max(ageA, ageB) >= 65`, and Engine B's
  senior bonus (L5643) does the same. Engine B computes `ageA = yr − dobA` and `ageB = yr − dobB` (≈L5440) whether or
  not that spouse is alive, so in a survivor year the **deceased** spouse's hypothetical age can satisfy the test.
  Engine A (L4306) and the bracket projection `projectBrackets` (L9311, which passes `year − dob` for both) call the
  same helper. **Engine A is now EXECUTED (session 3, probe `audit_c3a.mjs`):** the same household in 2028 returns
  `totTax` **3,476** — exactly the hand figure with the wrongly granted $2,133 extra (3,731.98 − 2,133 × 12% = 3,476.02);
  the correct figure is **3,732** (Engine A models no senior bonus, so only the extra is involved). Control: the same
  run with B also born 1955 (legitimately 65+) returns the same 3,476; 2031 (B turns 65) returns 3,322, matching hand.
  **`projectBrackets` is read only** — it feeds the Roth tab's bracket-headroom display; its effect is not yet quantified.
- **Executed** (session probe `audit_c3.mjs`, Engine B via `__engines.computeTaxPlan`): joint household, A born
  1955-01 and B born 1966-01, A's life expectancy 72 (dies 2027), $50,000 pension, no SS, no state. Engine output
  vs hand computation from Rev. Proc. 2025-32 with the model's own 2%/yr indexation:

  | Year | Filing | B's age | Engine `seniorExtra` | Correct | Engine fed tax | **Hand** fed tax | Understatement |
  |---|---|---|---|---|---|---|---|
  | 2026 | MFJ | 60 | 7,650 (A: 1,650 + 6,000) | 7,650 | 1,015.00 | 1,015.00 | 0 |
  | 2027 | MFJ (death year) | 61 | 7,683 | 7,683 — the decedent's age counts on the final joint return | 947.30 | 947.30 | 0 |
  | 2028 | Single | 62 | **8,133** (2,133 + 6,000) | **0** | 2,756.02 | **3,731.98** | **975.96** |
  | 2029 | Single | 63 | **2,175** | **0** | 3,425.62 | **3,686.62** | **261.00** |
  | 2030 | Single | 64 | **2,219** | **0** | 3,374.04 | **3,640.32** | **266.28** |
  | 2031 | Single | 65 | 2,263 | 2,263 | — | — | 0 (B now qualifies) |

  Hand 2028: std 16,100 × 1.02² = 16,750.44 → 16,750 (the engine rounds the same way); taxable 50,000 − 16,750 =
  33,250; 10% × 12,900.96 = 1,290.10; 12% × (33,250 − 12,900.96) = 2,441.88; total 3,731.98. Each understatement
  equals the wrongly granted deduction × 12%, as it must at this income.
- **Who is affected:** any couple where the older spouse dies first while the younger is under 65 — a mainstream
  case (an age gap of a few years suffices). Worst in 2025–2028, when the $6,000 bonus also applies.
- **Fix direction (for the scope, not decided here):** pass the survivor's age alone in widowed single years.

**ACA borders — CORRECT BY READING (not executable through the shim).** `acaApplicablePct` (L1498–1516) returns `null`
only for `fplRatio > 4.0`, and its top band includes 4.0 (`hi === cliffMult`), so exactly 400% keeps the credit, as
Rev. Proc. 2025-25's "not more than 400%" requires; the floor test is `< 1.0`, so exactly 100% qualifies. Coverage year
N uses guideline year N−1 (`acaFplFor`). `acaApplicablePct` is not on the test shim, so this is read, not run.

**C-4 · CONFIRMED (Engine A, executed) — the Roth comparator still carries the §86 upper-tier error v5.45 fixed in
Engine B.** *Severity: low–medium. User-side. Pessimistic (taxable SS and tax overstated). Not disclosed.* Engine A's
`ssTaxF` (L4161–4166) computes the upper tier as `0.5 × min(prov − t1, t2 − t1) + 0.85 × (prov − t2)`, dropping the
"½ × benefits" limb of §86(a)(1) — word for word the expression Engine B's own v5.45 comment (L5506–5513) records as the
defect it fixed. Executed (probe `audit_c4.mjs`, single filer born 1958, 2026, deductions $16,100 + $2,050):

| SS / pension | Engine A tax | §86-correct (hand) | pre-v5.45 formula | Overstatement |
|---|---|---|---|---|
| 6,000 / 32,000 | **2,026** | **1,876.00** (taxable SS 3,850) | 2,026 (taxable SS 5,100) | **+150** |
| 8,000 / 31,000 | **1,936** | **1,876.00** (4,850) | 1,936 (5,350) | **+60** |
| 6,000 / 34,000 (control: 85% cap binds) | 2,266 | 2,266.00 | 2,266 | 0 |
| 24,000 / 40,000 (control: large benefits) | 4,750 | 4,750.00 | 4,750 | 0 |

Bounded as v5.45 measured for the same expression: at most $1,838 (single) / $2,463 (joint) of taxable SS, only for
benefits under $9,000 / $12,000. **Why it survived:** v5.45's census named "two places" (`taxableSSPortion` and the Roth
tab's display block). The source has **five** places that compute taxable SS today (L4165 Engine A, L4908 Engine C,
L5360 Engine D, L5515 Engine B, L9457 Roth tab); Engine A's was not among the two. Engines B and C and the Roth tab use
the correct form (B executed above; C and the tab read).

**C-5 · CONFIRMED (Engine D, executed) — the Withdrawal tab's "bracket" column is read from the joint table for every
household.** *Severity: low. User-side. Direction depends on the household (optimistic for single filers). Not disclosed.*
L5360–5368: taxable SS is a flat `0.85 ×` benefits; the bracket is chosen against **MFJ** thresholds
(`TAX_CONSTS.MFJ_STD + MFJ_BR`) for every household; and the 2026 figures are not indexed. The column is display-only (no
tax dollars are computed from it) but is rendered on the tab (`r.bracket`, per `domdiff_withdrawal.mjs`'s own notes).
Executed (probe `audit_c5.mjs`, `g.computeWithdrawalPlan` at module level): the example household made **single** shows
Engine D's bracket as **12%** at MAGI 80,225 in 2029; for a single filer that MAGI is above 16,100 + 50,400 = 66,500, so
the 22% band. Across 31 common years Engine D's bracket differs from Engine B's in 15 (joint: 28 of 33) — though not all
of that is C-5: C-7 and C-8 feed the same column.

**C-7 · CONFIRMED (Engine D, executed) — a single household is paid spouse B's Social Security in the Withdrawal plan.**

> **Re-measured on v5.75 and FIXED at v5.76** (`SCOPE_SINGLE_HOUSEHOLD_SPOUSE_B_SS.md`). Re-verification changed
> this finding in three ways. **Narrower route:** switching to single inside the app already cleared the stored
> benefit on both save paths, so the route is loading a plan file, not the toggle. **A second, larger route:** a
> single household's plan with no spouse-B section had the example household's $1,300/month filled in by the
> loader. **Wider reach:** thirteen of 25 reads lacked the single test — Engine D, both Monte Carlo loops, Ask AI's
> context and several tab figures — and since v5.74 Engine D's draws feed the Taxes tab. On the example household
> made single: $308,076 of phantom benefits, ending portfolio +$427,269, lifetime federal tax −$38,916, Monte Carlo
> median +$61,158. The severity above no longer fitted. Fixed at the source (`getSSB()` returns zero for a single
> household) with `t42` and six negative controls; figures below this note are the original v5.73 record.
*Severity: low–medium. User-side. Optimistic (guaranteed income overstated, so draws understated). Not disclosed.*
L4971 reads `const _ssB = getSSB();` with no single test; Engine B uses `_tlT.single ? 0 : getSSB()` (L5418).
METHODOLOGY (§ on the v5.4x Roth-tab fixes) already records that "a stored spouse-B benefit surviving in a restored backup
would otherwise still reach the ladder" and that the Roth tab added an explicit single-filer test — **Engine D never got
the same guard.** Executed: the example household (which carries a spouse-B benefit) with `single: true` — Engine B's rows
show `ssB_y` 0; Engine D's show **`ssB_y` 15,600 in 2029 and 16,918 in 2032**. Reachable by any user who switches a
household to single, or restores a backup, while spouse-B data is still stored.

> **⚠ FIXED at v5.74 (2026-09-21)** — `docs/SCOPE_TAXES_DRAWDOWN.md`, retired with its build record. *Annotation only;
> the finding below is as written at v5.73.* On the tab's as-is reading the correction is −$35,309 (−14.5%); at the tab's
> first-open defaults ($70,000/yr of conversions) it is +$1,540 — see METHODOLOGY, "The Taxes tab and the drawdown".

**C-8 · CONFIRMED (Engines B and D, executed) — the Taxes tab never taxes spending withdrawals from Traditional
accounts, and computes RMDs on a balance that was never drawn down.** *Severity: **high** — user-visible on the shipped
example data, and contradicted by the tab's own words. User-side. Direction mixed (early years optimistic, later years
likely pessimistic). Not disclosed.*
- **Cause.** Engines B (Taxes) and D (Withdrawal) are "independent parallel projections" (`SCOPE_FIX_realized_capital_gains_v5_32.md`
  D-4); since v5.32 the only bridge between them is Engine D's **realized-gains** series. Engine B's ordinary income is
  pension, work, other streams, RMDs and conversions (L5414–5734 contain no draw concept). Engine D, meanwhile, funds
  spending from Traditional buckets before RMD age and counts those draws as income.
- **What the user is told.** The Taxes tab: *"Set ① honestly and leave ② and ③ at zero, and this tab is simply your
  projected tax life as-is"*, under **"LIFETIME TAX ESTIMATE"**; the only input it names as arriving from outside is realized
  capital gains (L10137–10141). Nothing says Traditional spending draws are excluded; METHODOLOGY does not say so either
  (searched, and the Taxes-tab passages read).
- **Executed** (probe `audit_c8.mjs`, the example household exactly as shipped — joint, retiring 2029):
  - Engine D draws from retirement buckets (~80% Traditional) in **2032–2038**: 31,351 · 40,926 · 42,179 · 43,466 · 44,789 ·
    46,148 · 47,544 — about **$238,000** of Traditional spending withdrawals beyond any RMD.
  - Engine B's ordinary income in each of those years is the **$4,800** pension alone, and its **federal tax is $0** in
    every one of them.
  - Engine B's lifetime RMDs are **$1,625,926** against Engine D's **$1,021,349**, because B's balance was never drawn.
  - Engine B's lifetime federal tax: **$244,040**.
- **Size, estimated (not a hand computation to the dollar).** 2032 alone: about 25,200 of Traditional draws, plus the
  pension and the SS that §86 would then include, against about 37,700 of joint deductions — on the order of **$1,200** of
  federal tax the tab shows as $0; similar in each of the seven years. The later RMD overstatement pushes the other way, so
  the lifetime total is mis-timed rather than simply low. A to-the-dollar counterfactual needs the fix's design, so it is
  left to the scope.
- **Why no suite caught it:** `t17`/`t18` call Engine B directly on households with no Traditional draws; `domdiff`
  witnesses byte identity, not agreement between tabs.

**C-9 · CONFIRMED (Engine B, executed) — the annuity exclusion from the RMD base is a fixed share, so RMDs creep up as
the pool drains.** *Severity: low. User-side. Pessimistic. Not disclosed* — METHODOLOGY L1366–1367 says only that every
engine excludes annuity money as `trad × (1 − annShare)`. The share is set once from the opening balances (Engine B L5533; Engine C L4821) and
recomputed only at a survivor merge (L5592 / L4868); RMDs are then taken from the combined pool while the annuity money itself is never
distributed, so the annuity's true fraction of the pool rises and a fixed share under-excludes it. Executed (probe
`audit_accts2.mjs`, example household, +$100,000 non-qualified annuity for A): the opening RMD base correctly **excludes**
it (`rmdInitA` 1,090,000 in both runs; `annShareA` 0.0840), but Engine B's RMD then exceeds the no-annuity run by **$255
(2040), $540 (2041), $1,878 (2045), $4,547 (2050)**. A falling exclusion is the only thing that should differ, and it
grows exactly as the mechanism predicts. Fix direction: track the annuity amount, not a share (the treatment Engine A's
dividend comment at L4290–4302 already argues for in a sibling case).

**C-10 · CONFIRMED (Engine D, executed) — a Roth IRA entered under Other accounts is sold as if it were brokerage, and
realizes taxable capital gains.** *Severity: low–medium. User-side. Pessimistic (tax and MAGI overstated). Not disclosed.*
Engine D's taxable pool is `household − total401k` (L5012), i.e. every Other account whatever its type (`buildPortfolio`
L12181–12227). Its gain-bearing sub-pool is that pool minus the ordinary sub-pool (Traditional + annuity) and minus HSA
(`_gainPoolInit`, L5023) — **nothing removes Roth**. Executed (probe `audit_accts3.mjs`, household total maintained as
`buildPortfolio` maintains it, declared embedded-gain share 50%): +$100,000 under Other accounts adds lifetime realized
gains of **+51,461 as `taxable`** and **+51,461 as `roth`** (should be 0); `trad`, `hsa` and `annuity` add 0. Those gains
flow to Engine B's tax and Engine C's MAGI (v5.36 bridge). With the shipped default share of 0 nothing is realized, so it
reaches only users who set a share and hold a Roth under Other accounts.

**C-11 · CONFIRMED (read; the text is what renders) — the Roth break-even card calls a face-value measure "after-tax
wealth".** *Severity: low. User-side. Not a numeric defect.* `wealthByYr` (L4716) is `taxBal + roth + trad` at **face
value**, deliberately — the code (L4707–4715) argues it answers the cash question "when does the tax I paid come back?",
treats same-year comparison as discounting at the portfolio's own growth rate, and leaves the heirs' tax to the separate
ESTATE ranking (METHODOLOGY L471–477, heirs at an assumed 22%). That is sound technique for a cash-payback metric, and
counting untaxed Traditional dollars in full makes the break-even arrive **later** than an after-tax comparison would (the
conservative direction). But the card's first outcome (L9936) tells the user it is *"the first year your strategy's
**after-tax** wealth catches the NO CONVERSIONS path"*, while its third outcome (L9938) correctly says *"in cash terms"*.
One label misdescribes the measure. **Answer to Section C's question "does the break-even use reliable financial-accounting
technique?": yes, with this labelling defect.**

**D-1 · DOCUMENT — METHODOLOGY's §86 passage contradicts itself and understates the sites.** L448 says the half-benefits
cap "is applied in both places as of v5.45"; the next paragraph (L457–467) still says the engine's cap and the Roth
tab's middle tier "remain uncorrected… scheduled to ship together" — text written before v5.45 and never removed. Neither
paragraph mentions Engine A (C-4). *Section E-type finding, recorded here because it is where the §86 work found it.*

**Session 4 — the systematic federal borders (executed, all PASS).** Harnesses `audit_fed.mjs` and `audit_fed2.mjs`,
2026, references typed from the primary sources (never read from the app):

| Check | Engines | Points | Result |
|---|---|---|---|
| Ordinary tax at every bracket top −1 / exact / +1, single and joint (Rev. Proc. 2025-32 §4.01 base + rate × excess) | A and B | 36 each | **PASS** — B to the cent; A rounds to whole dollars (worst \|Δ\| $0.50) |
| Marginal bracket exactly at each top ("not over" → lower rate) and one dollar above | B | 36 | **PASS** |
| LTCG 0%/15% and 15%/20% edges, ordinary income stacked below (§4.03) | B | 12 | **PASS** to the cent |
| NIIT alongside the 20% edge, and at MAGI 200,000/250,000 −1/0/+1 (§1411) | B | 18 | **PASS** |
| §86 at base and adjusted base −1/0/+1, single and joint | B | 12 | **PASS** to the cent |

⚠ **A limit of "within a dollar" found and handled.** A negative control that moved one bracket top by $1 did **not**
fire on tax amounts — a $1 edge error moves tax by at most (37% − 35%)…(22% − 12%) × $1 < $1. The tax check therefore
cannot see edge errors, which is why the marginal-bracket check was added; a second control (a $5 error in a table base
amount) fired on exactly the three affected points in both engines, so the harness can fail. Engine A reports no marginal
bracket, so **its edges are covered only to within the tax tolerance.**

**C-6 · CONFIRMED (Engines A and B, executed) — unused standard deduction is not applied against qualified dividends
and capital gains.** *Severity: medium. User-side. Pessimistic (tax overstated). Not disclosed* — METHODOLOGY L112 says
only that gains stack "on top of ordinary income". Both engines compute taxable ordinary income as `max(0, ordinary −
deductions)` and then stack the **whole** preferential amount on it (`ltcgF`/`ltcgTax`), so any deduction left over when
ordinary income is below the standard deduction is lost. Under the Form 1040 qualified-dividends worksheet, taxable income
is ordinary + preferential − deduction, and the preferential portion is capped at taxable income — the excess deduction
reduces the gains that are taxed. Executed (probe `audit_c6.mjs`, single, under 65, 2026; A via qualified dividends,
B via `gainByYr`):

| Ordinary / preferential | Law (hand) | Engine A | Engine B | Overstatement |
|---|---|---|---|---|
| 15,549 / 50,000 | 0.00 | 83 | 82.50 | 82.50 |
| 15,551 / 50,000 | 0.15 | 83 | 82.50 | 82.35 |
| **0 / 60,000** | **0.00** (taxable income 43,900, all at 0%) | **1,583** | **1,582.50** | **1,582.50** |
| **8,000 / 70,000** | **1,867.50** | **3,083** | **3,082.50** | **1,215.00** (= 15% × 8,100 unused) |
| control 16,100 / 60,000 | 1,582.50 | 1,583 | 1,582.50 | 0 |
| control 30,000 / 60,000 | 5,087.50 | 5,088 | 5,087.50 | 0 |

It bites only when ordinary income is below the deduction **and** preferential income exceeds the 0% top, and is bounded
by 15% of the unused deduction — $2,415 single, $4,830 joint at 2026 figures, more with the age-65 extras and the senior
bonus. That is the profile of an early retiree living off a taxable account in the bridge years, which this app models
specifically. Engines C (L4759–4940) and D (L4966–5412) contain no bracket or LTCG computation — a text search of those ranges finds only Engine D's display threshold behind C-5 — so on that evidence this covers every engine that computes federal tax; a parser census would make it firm.

**Session 5 — further executed checks (harness `audit_s5.mjs`; all PASS unless noted):**

| Check | Engine | Points | Result |
|---|---|---|---|
| OBBBA senior bonus at MAGI 75,000 / 175,000 (single) and 150,000 / 250,000 (joint), −1/0/+1, per Schedule 1-A | B | 12 | **PASS** (engine rounds the bonus to whole dollars) |
| Bonus absent after the 2028 sunset; age extra still indexed | B | 1 | **PASS** |
| **Indexation, 2032:** bracket top 50,400 moves to 56,758.59 (marginal rate flips across it); LTCG 0% top moves to 55,688.73; age extra moves to 2,309 | B | 4 | **PASS** — indexed at the disclosed 2%/yr proxy |
| **Unindexed, 2032:** NIIT still at 200,000; §86 base still 25,000 | B | 3 | **PASS** — see the note below |
| IRMAA tiers 1–4 exactly at each premium-year-indexed top and one dollar above, single and joint | C | 16 | **PASS** |
| Engine A LTCG / NIIT through qualified dividends at the 15%/20% top and at the NIIT thresholds | A | 12 | **PASS** within $0.50, once NIIT is separated — Engine A's `totTax` **includes** NIIT and also reports it as `totNiit` (a reporting convention, not a defect) |

*Harness error, owned:* the first 2032 §86 check failed (engine 4,029.41 vs my 500). The engine was right — passing
`retireYear: 2032` let the example household's workplace contributions accrue until then, producing a 2032 RMD of
7,058.82, which my reference omitted. With it, provisional income is 33,058.82 and §86 gives 4,029.41 exactly.

**Session 6 — first-spouse death, executed through Engine B and checked by hand (all PASS).** Joint, both born 1956,
A dies 2030 (`audit_death.mjs`); SS 30,000 (A) and 20,000 (B); pension 40,000; a small RMD (≈540) on B's accrued
contributions, taken from the rows rather than assumed.

| Year | Filing | Deductions (hand) | Taxable SS (hand, §86) | Fed tax (hand) | Engine B |
|---|---|---|---|---|---|
| 2029 | MFJ | 34,171 + 2 × 1,751 = **37,673** | **24,311.20** | **2,735.34** | 37,673 · 24,311.20 · 2,735.34 ✓ |
| 2030 (death) | MFJ — Pub. 501 | 34,854 + 2 × 1,786 = **38,426** (the decedent's extra counts on the final joint return) | one check, joint thresholds: **15,831.95** | **1,797.30** | 38,426 · 15,831.96 · 1,797.30 ✓ |
| 2031 | Single | 17,776 + 2,263 = **20,039** | single thresholds: **22,851.59** | **4,934.51** | 20,039 · 22,851.60 · 4,934.51 ✓ |

The survivor keeps the larger ($30,000) check — the model's rule, and **a documented simplification** (METHODOLOGY
L1085–1089: the RIB-LIM 82.5%-of-PIA branch is not modelled; conservative). The death-year single-check treatment is also
documented there (conservative). TDA rollover: Engine B merges the decedent's Traditional into the survivor's (read,
L5584; the `_merged` guard prevents a double roll). **Not repeated here because C-3 already covers the one defect this
area produced.**

**Session 6 — all tracked accounts (item 6), executed.** Every Other-account type reaches the engines that should see it:
Traditional and annuity balances enter the Traditional start balance; Roth enters Roth; taxable and HSA enter the taxable
start; annuity is excluded from the opening RMD base; Engine D's first-year total rises by the same $104,072 for every
type (no double counting of balances). Two defects came out of this item: **C-9** and **C-10** above.
*Harness error, owned:* a first probe added an Other account without updating `PORTFOLIO.household`, and Engine D did not
move — because Engine D reads `household − total401k`, which the app maintains in `buildPortfolio`. Rerun with the
household total maintained, every type reaches Engine D. Not a finding.

## 3 · What remains of Section C (planned order for the next sessions)

1. ~~Finish §1~~ — done (session 3). ~~Execute C-1~~ — done (Engine A); Engine C by reading.
2. ~~Federal tax borders~~ — done for A and B (sessions 4–5); ~~senior bonus~~, ~~IRMAA tiers in C~~, ~~A's LTCG/NIIT~~
   done (session 5); ~~C-5~~ done (session 6, module level — no DOM run needed). Remaining original wording:
   federal tax, single and joint, (A Roth, B Taxes, C IRMAA, D Withdrawal —
   the Phase 2D lesson: a claim about every engine is checked against every engine): one dollar below and above
   each bracket top, the LTCG 0%/15% edges, NIIT at $200,000 / $250,000, the SS provisional-income thresholds, the
   senior-bonus phaseout, IRMAA at every tier edge.
3. ~~**Inflation**~~ — **done** (sessions 5–6): Engine B; Engine A (2032 brackets and std indexed; NIIT unindexed; §86
   unindexed on a discriminating case — engine 2,224 vs 2,223.91 unindexed, 1,854.55 if it were indexed); IRMAA top tier
   frozen at 500,000 for premium 2027 and indexed from that base after (Engine C exact at 500,000 · 510,000 · 520,200 ·
   530,604 · 541,216.08; Engine A flips at 500,000 ± 1 and 520,200 ± 1). One Engine A §86 probe was non-discriminating
   (tax 0 either way) and was replaced, not counted.
   Indexed figures move by the model's 2%/yr proxy (disclosed, METHODOLOGY §6); statutorily
   **unindexed** figures (NIIT, SS thresholds, senior bonus, IRMAA top tier through 2027) must not move — asserted
   per engine for a year ≥ 2030.
4. ~~Roth break-even accounting~~ — done (session 6): sound cash-payback technique; one mislabel (C-11).
5. ~~First-spouse death~~ — done (session 6): Engine B hand-checked across the death; IRMAA single thresholds are covered
   by `t13` and were not re-derived here.
6. ~~All tracked accounts~~ — done (session 6): C-9, C-10.
7. ~~**State tax**~~ — done (session 6), within the boundary `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` D-5 set (the module is
   checked against its **documented** approximation; a flat rate standing in for a progressive schedule is a disclosed
   limitation, not a finding). Since 2E (v5.28) the module gained the conditioned branches; one hand case each
   (`audit_state.mjs`), all to the cent: **NM** bands per person at 42,000 (≤) / 42,001, one qualifier, single 18,000 /
   18,001 / 28,501; **CT** bands per household at 104,999 / 105,000 (exclusive top) and single 74,999 / 100,000; **VA**
   taper joint 80,000 / 99,000, single 55,000, and its `agiExSS` base ignoring taxable SS. Maine's `phaseout` is covered by
   `t39`. **14 of 14 pass.**
8. The standalone top-five summary is written only after the final phase (scope rule).

## 4 · What Phase 2 did NOT cover — stated so it is not read as covered

- **Engine A's marginal-bracket edges** are covered only to within the $1 tax tolerance (Engine A reports no bracket).
- **Engine C's §86 and the Roth tab's §86 display** were read (correct form), not executed.
- **`projectBrackets`** (C-3's third site) was read; its effect on the Roth tab's headroom display was not quantified.
- **C-8's lifetime effect** is estimated, not computed to the dollar — a counterfactual needs the fix's design.
- **IRMAA in survivor years** was not re-derived here; `t13` covers it.
- **A note-versus-behaviour sweep across all 51 state rows** was not re-run; `t10`, `t29` and `t35` guard parts of it.
- **Monte Carlo, backtest, guardrails and What-Breaks** consume the engines above and were not separately validated.
- **The ACA subsidy amount** (as opposed to its borders) was not executed; `acaSubsidyAnnual` is not on the test shim.
- **The QCD limit** was checked against a secondary summary of Notice 2025-67 only.

## 5 · Reproducing this

Every executed result above names its probe. The probes are session scripts, not suites; they are shipped with this
document under `qa/tools/audit_phase2_v573/` so each figure can be regenerated. Each takes the v5.73 testable module
(`app_v573.mjs`) from a run folder built by `mk_runfolder.sh v572 v573` and **asserts nothing**.
