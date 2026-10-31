# SCOPE — the 2027 tax-figure refresh: tables index from their own year (v6.33), then the 2027 figures (v6.41 — was v6.40, v6.39, v6.38, v6.37, v6.36, v6.35, and v6.34 before that) · F-27 closed by decision

> **RENUMBERED 2026-10-27, at the v6.34 build** (decision DC-4 (a) of `docs/SCOPE_D58_CONTRIB_SAVE_V634.md`; Steve: *"Let's go with your
> recommendations"*). v6.34 is the D-58 release, built while the 2027 figures were unpublished. **The 2027 figures ship as v6.35** (tag `v635`), and
> their suite is **`t98_ty2027.mjs`** (`t97` is D-58's) — *superseded by the next box: v6.36, `t99`*. Every *"v6.34"* below that names the 2027-figures release now means v6.35; the file
> keeps its name so its citations hold. DT-7's 15 December date is unchanged.
>
> **RENUMBERED AGAIN 2026-10-28, at the v6.35 build** (Steve, on the order of the next two releases: *"Next release (v6.35): D-62 and D-65,
> with D-44 … Release after that (v6.36): the 2027 tax figures, the moment the IRS and CMS have published, still by 15 December. If the model
> release runs long, the tax figures go first"* — `docs/SCOPE_D62_D65_D44_V635.md` §1.4, DV-1 (a)). v6.35 is the D-62/D-65/D-44 release.
> **The 2027 figures ship as v6.36** (tag `v636`), and their suite is **`t99_ty2027.mjs`** (`t98` is v6.35's). Every *"v6.35"* or *"v6.34"*
> below that names the 2027-figures release now means v6.36. DT-7's 15 December date is unchanged. ⚠ v6.35's suites and Engine A changed
> under this scope: the refresh's build re-reads its §3 test plan against v6.35 (STAY UNDER IRMAA's new solve, the working-years rows,
> `IRMAA_SOLVER_MARGIN`), and its IRMAA tables now also feed `workMagiFlag`'s threshold. *Superseded by the next box: v6.37, still `t99`.*
>
> **RENUMBERED A THIRD TIME 2026-10-28, at the v6.36 build** (DB-5 (a) of `docs/SCOPE_D66_WHATBREAKS_TAX.md`; Steve: *"Let's use your
> recommendations on the decisions"*). v6.36 is the D-66 release (What Breaks pays the Monte Carlo's tax), built while none of the three
> 2027 sources had published. **The 2027 figures ship as v6.37** (tag `v637`); their suite stays **`t99_ty2027.mjs`** (v6.36's is `t100`,
> so no suite name moves). Every *"v6.36"*, *"v6.35"* or *"v6.34"* below that names the 2027-figures release now means v6.37. DT-7's
> 15 December date is unchanged, and the deadline still outranks any model release. v6.36 changed no engine and no table: What Breaks now
> reads `mcIncomeTaxSchedule` (`whatBreaksAnnualTax`), so the 2027 tables reach What Breaks through the Monte Carlo's schedule as well.
> *Superseded by the next box: v6.38, still `t99`.*
>
> **RENUMBERED A FOURTH TIME 2026-10-29, at the v6.37 build** (DS-5 (a) of `docs/SCOPE_F29_SS_SLIDER_START.md`; Steve: *"yes, do the five
> recommendations for me"*). v6.37 is the F-29 release (the SS tab's claim-age explorer starts at the plan), built while CMS's 2027 Medicare
> premiums and IRMAA figures had not published (searched 2026-10-29; only projections found — the swap DS-5 (a) allowed did not apply).
> **The 2027 figures ship as v6.38** (tag `v638`); their suite stays **`t99_ty2027.mjs`** (v6.37's is `t101`). Every *"v6.37"*, *"v6.36"*,
> *"v6.35"* or *"v6.34"* below that names the 2027-figures release now means v6.38. DT-7's 15 December date is unchanged. v6.37 changed no
> engine and no table; its suite edits are the version registry, `t29`'s two census rows and `t101`. *Superseded by the next box: v6.39, still
> `t99`.*
>
> **RENUMBERED A FIFTH TIME 2026-10-29, at the v6.38 build** (DF-6 (a) of `docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md`; Steve: *"v6.38; tax →
> v6.39"*). v6.38 is the F-20 release (the Income tab on a phone, and its wording when income covers spending), built while the IRS TY2027
> Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures had not published (searched 2026-10-29; only projections found). **The 2027
> figures ship as v6.39** (tag `v639`); their suite stays **`t99_ty2027.mjs`** (v6.38's is `t102`). Every *"v6.38"*, *"v6.37"*, *"v6.36"*,
> *"v6.35"* or *"v6.34"* below that names the 2027-figures release now means v6.39. DT-7's 15 December date is unchanged. v6.38 changed no
> engine and no table; its suite edits are the version registry, `t29`'s census row, `t45`'s stream-plan section and `t102`. *Superseded by the
> next box: v6.40, still `t99`.*
>
> **RENUMBERED A SIXTH TIME 2026-10-30, at the v6.39 build** (DA-6 (a) of `docs/SCOPE_D69_AI_CONTEXT_V639.md`; Steve: *"v6.39; tax →
> v6.40"*). v6.39 is the D-69 release (Ask AI is told what accounts the plan holds and what it contributes), built while the IRS TY2027
> Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures had not published (searched 2026-10-30; only projections found). **The 2027
> figures ship as v6.40** (tag `v640`); their suite stays **`t99_ty2027.mjs`** (v6.39's is `t103`). Every *"v6.39"*, *"v6.38"*, *"v6.37"*,
> *"v6.36"*, *"v6.35"* or *"v6.34"* below that names the 2027-figures release now means v6.40. DT-7's 15 December date is unchanged. v6.39
> changed no engine and no table; its suite edits are the version registry, `t29`'s census row, `t92`'s list checks and `t103`. *Superseded by
> the next box: v6.41, still `t99`.*
>
> **RENUMBERED A SEVENTH TIME 2026-10-31, at the v6.40 build** (DF-7 (a) of `docs/SCOPE_F30_ROTH_STRESS_PHONE_V640.md`; Steve: *"Yes —
> v6.40; tax → v6.41"*). v6.40 is the first part of F-30 (the Roth and Stress tabs on a phone), built while the IRS TY2027 Rev. Proc., the
> §402(g) notice and CMS's 2027 IRMAA figures had not been found published (searched 2026-10-31; only projections). **The 2027 figures ship
> as v6.41** (tag `v641`); their suite stays **`t99_ty2027.mjs`** (v6.40's is `t104`). Every *"v6.40"* or earlier version below that names the
> 2027-figures release now means v6.41. DT-7's 15 December date is unchanged. v6.40 changed no engine and no table; its suite edits are the
> version registry, `t45`'s section S (S-9 and its gates), `t102`'s A-2/E-2 and `t104`.

| Field | Value |
|---|---|
| Build scoped against | **v6.32** · `src/DangerClose.jsx` md5 `fe8188a567035ce5a00fda1f201cecd5` · built `index.html` `2cdbfc5479c0d7ff7f0d1a66a70827af` · repo `cc8b7e8` (full clone) |
| Freshness (§A) | Pool source = manifest Current = clone = `fe8188a5…`, checked 2026-10-26 after the v6.32 upload: the 16 pool files byte-identical to the package or the clone; `package_check` post-upload 54 passed, 0 failed, 0 skipped; Pages serves `2cdbfc54…` |
| Register items | OPERATIONS §I *Annual data refreshes* (the yearly federal cycle, which the app promises "by January"). Files **MissingFeatures D-67** (§0.3: every engine indexes the published tables from the plan's as-of year; never registered). Closes **UsabilityFlaws F-27** by decision (§0.7). Touches **D-18** (state figures, recurring) and **ARCHITECTUREIssues E-31 (b)** (Nebraska's and Vermont's TY2026 schedules, read from a draft and preliminary rates) only through DT-5 |
| Versions | **v6.33** (`v633`) and **v6.34** (`v634`). Both tags are free: `vercensus.cjs` reports 0 ladder and 0 keyed entries for each; no `.py` suite names either; no `dom_entry_v633.jsx` or `dom_entry_v634.jsx` in the history |
| Status | **v6.33 BUILT** (§7, the build record). Decisions answered 2026-10-27 — DT-1 to DT-8 all as recommended; **DT-2 revised at the build** (§7.2: the build review found its premise false; Steve, 2026-10-27, *"Deflate before 2026"*). F-27 decided 2026-10-26 (*"take the 'close by decision' route and fold it into the tax-refresh scope"*) and closed in the v6.33 package. **v6.34 (the 2027 figures) OPEN** — waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures (DT-7: ship by 15 December). Reviewed once before Steve saw it (§6) and the build once (§7.3) |
| Measurements | Session-only, never shipped: `base_probe.mjs` (`projectBracketsAt` at three as-of years); `measure.mjs` (Engines B and C, v6.32 against the prototype); the prototype `v632p.jsx` (md5 `882544fefbb9939f7f400ef8266922fa`: v6.33's change at the **21** sites of §2 and nothing else); a full `runsuite.sh v631 v632` on a copy of the packaged v6.32 run folder with the prototype as the current leg. The review's own probes (Engine A) are in the session's `review/` folder |

Steve, 2026-10-26: *"Yes take the 'close by decision' route and fold it into the tax-refresh scope."*

---

## 0 · Premise — verified against v6.32

Line numbers are v6.32's. Identifier sites come from `census.cjs`; string sites from an acorn walk over every string literal, template
element and JSX text (`lit2026.cjs`, session-only); suite literals from an acorn walk over `qa/` (`num_census.cjs`, session-only).

### 0.1 What is published, as of 2026-10-26

Primary sources only. Projections from news and calculator sites are not counted.

| Figure | Published? | Source |
|---|---|---|
| Social Security wage base, 2027 | **Yes — $192,300** (2026: $184,500) | SSA, *2027 COLA Fact Sheet* (page certified 2026-10-14) |
| ACA applicable-percentage table, coverage year 2027 | **Yes** — initial/final 2.15/2.15 · 3.23/4.30 · 4.30/6.78 · 6.78/8.66 · 8.66/10.22 · 10.22/10.22 (bands under 133%, 133–150, 150–200, 200–250, 250–300, 300–400% of FPL, "not more than 400%"); required contribution percentage 10.22% | IRS Rev. Proc. 2026-26 §3.01–3.02 |
| Poverty guidelines for 2027 coverage | **Already in the app** (the 2026 guidelines, $15,960 + $5,680) | HHS/ASPE 2026; `ACA_CONSTS.fplByGuidelineYear[2026]` |
| Federal brackets, standard deduction, §63(f) amounts, LTCG breakpoints, AMT figures, QCD limit, TY2027 | **Not published.** The IRS newsroom's latest release is IR-2026-128 (Oct 23), none on 2027 inflation adjustments; the *Inflation-adjusted tax items by tax year* page stops at TY2026 | irs.gov newsroom; irs.gov *inflation-adjusted tax items* |
| §402(g) elective-deferral limit, 2027 (the app holds only this limit, `LIMIT_402G`, for a My Data warning) | **Not published** (the IRS COLA page shows 2026 as the latest) | irs.gov *COLA increases for dollar limitations* |
| IRMAA thresholds and Part B/D surcharges, 2027 | **Not published** (CMS has posted only the 2027 Part D base premium, $41.33) | cms.gov fact sheets |

⚠ **Pages that could not be opened this session** (an unanswered permission prompt, not an error): the IRS *news releases for current month* page and
Rev. Procs. 2026-33 and 2026-34 (posted Oct 22; probably the retirement-plan correction procedures IR-2026-126 announced — an inference, not
confirmed). The "not published" lines rest on the pages that did open and the absence of any release. **Re-check at the build.**

State figures (DT-5): Georgia's 65+ exclusion rises to **$70,000 from TY2027** (HB 463, signed 2026-05-11 — read in the Governor's copy of the
bill). Nebraska lists its TY2026 schedule as final (the final file was not opened; the app holds the August draft's figures). Vermont's TY2026
brackets are still preliminary (IN-114, Rev. 10/25). Montana's TY2026 65+ subtraction, Rhode Island's TY2026 thresholds and Maine's TY2026
phase-out thresholds are not published (Montana's by 1 November; Rhode Island's in a November advisory). Louisiana posts its TY2027 amount in
January. **A loose end:** no primary source for Maine's $49,824 TY2026 cap was found this session; the app's note derives it from the Social
Security maximum at full retirement age on 1 January. Re-read at DT-5's release.

### 0.2 How the app holds the figures today

- **`TAX_CONSTANTS_YEAR = 2026` (L1125) drives labels only.** Its 14 AST hits are `DATA_VINTAGES` (L2130–2132), the staleness strip
  (`DATA_STALE_YEARS`, L2342; the strip at L7965–7971), the Events tab's tax-figures notice (`computePlanEvents`, L2433–2437) and the
  Verify tab's sentence (L8011). **No engine reads it.**
- **Every engine indexes the 2026 tables from the plan's AS-OF year.** Five helpers take a base year as a parameter —
  `inflateTaxConst(base, yr, baseYr)` (L1187, the bracket family), `inflateWageBase` (L1192), `seniorExtraFor(…, yr, baseYr, …)` (L1215),
  `irmaaThresholdFor(…, premiumYr, baseYr)` (L1328) and `irmaaTierFor(magi, uppers, premiumYr, baseYr)` (L1342, which places a MAGI in an
  IRMAA tier) — and every caller passes the plan's as-of year (`P.asOfYr`, `_asOfYr`, `asOfYr`, `_asOfYrRoth`). The surcharges grow the same
  way (`SUR × planDollarFactor(yr, asOfYr)`). The **21** sites are §2's table.
- So **the code assumes the tables are the as-of year's figures.** True of the example (as of 2026-04-18) and of every plan saved in 2026;
  false for any other as-of year. A plan's as-of date is restamped to today at every Save & Apply (D-58's note), so from 1 January 2027 every
  plan saved is as of 2027.
- **One exception, correct in law:** the IRMAA top tier ($500,000 single / $750,000 joint) is frozen through 2027 and indexed from 2028 off
  the frozen base (BBA-2018 §53114; `IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH`, L1313). `irmaaThresholdFor`'s top-tier branch ignores the base
  year (L1330–1332), so it is already right whatever the as-of year.
- **One ACA table serves every coverage year.** `acaApplicablePct` reads `ACA_CONSTS.tableCurrent2026` (L2205) for any year — v6.30's
  disclosed simplification. The poverty guidelines are already keyed by year (`acaFplFor`, L2180–2190): a held guideline year is used as is,
  and any other year is indexed from the **newest** held year (backwards too, for an earlier year).

### 0.3 The consequence, measured — **D-67, filed by this scope**

`projectBracketsAt(2030, joint, one spouse 65+)` on v6.32 (`base_probe.mjs`):

| The plan's as-of year | 2030 standard deduction | 2030 top of the 12% bracket | IRMAA tier-1 threshold, premium year 2032 |
|---|---|---|---|
| 2025 | $38,280 | $113,990 | $263,411 |
| 2026 (the example; every plan saved this year) | **$37,350** | **$111,221** | **$256,386** |
| 2027 (every plan saved from 1 January) | $36,442 | $108,519 | $249,548 |

The same 2026 table, indexed one year more or less, by nothing but the date the plan was saved. On Engines B and C, lifetime, in today's
dollars (`measure.mjs`; the example with only its as-of date changed; "conversions" is the Roth tab's slider; the prototype indexes from the
table's year at all 21 sites):

| As-of date | Conversions | Lifetime tax, v6.32 | Prototype | Δ | Lifetime IRMAA, v6.32 | Prototype | Δ |
|---|---|---|---|---|---|---|---|
| 2026-04-18 (the example) | $70,000/yr | $195,504 | $195,504 | **0** | $0 | $0 | **0** |
| 2026-04-18 (the example) | $250,000/yr | $273,850 | $273,850 | **0** | $13,800 | $13,800 | **0** |
| 2025-06-15 | $70,000/yr | $200,243 | $204,585 | +$4,342 | $0 | $0 | 0 |
| 2025-06-15 | $250,000/yr | $276,718 | $280,711 | +$3,993 | $16,100 | $15,671 | −$429 |
| 2027-01-15 | $70,000/yr | $190,512 | $186,486 | **−$4,026** | $0 | $0 | 0 |
| 2027-01-15 | $250,000/yr | $267,011 | $263,205 | **−$3,806** | $17,260 | $14,178 | **−$3,082** |
| 2028-01-15 | $70,000/yr | $184,350 | $176,682 | −$7,668 | $0 | $0 | 0 |
| 2028-01-15 | $250,000/yr | $263,995 | $257,039 | −$6,956 | $17,260 | $14,567 | −$2,693 |

(The v6.32 column's rows also differ from each other for reasons the fix does not touch — the contribution accrual and the today's-dollar
restatement run from the as-of date. Only the Δ columns are this finding. The review measured Engine A the same way, on a household as of 2027:
its IRMAA fell $2,300 → $0 and $55,320 → $49,706 on two pension levels.)

⚠ **Corrected at the build (§7.3):** the table above called Engines B and C without the drawdown series both tabs pass in. Measured as the
tabs open (the series under the opening scenario), the example dated 2027 moves −$4,109 / −$3,306 in tax and **$0 / +$600** in IRMAA — the
IRMAA direction is the reverse of this table's, because the surcharges move from an as-of base to the table's year too, and where MAGI stays in
its tier the larger surcharge outweighs the higher threshold. Consequence 1's IRMAA clause below is therefore wrong as written: dated 2027, v6.32
read IRMAA about $600 *low* at $250,000, not $3,100 high. METHODOLOGY *The tables index from their own year (v6.33)* carries the corrected table.

**Three consequences:**
1. **From 1 January 2027, whatever build is live,** a plan saved that day treats the 2026 tables as 2027's — every threshold one year
   short: on the example's holdings about **$4,000 more lifetime tax** and, at large conversions, **about $3,100 more IRMAA**. Both
   conservative. Two years on, about $7,700 and $2,700.
2. **A plan saved in 2025 or earlier**, if any exists, reads every threshold one year too far — **optimistic**, by about $4,300 of tax.
3. **Entering the 2027 figures without fixing this** would treat them as 2026's for the example and every plan saved in 2026 — one year too
   far, optimistic, by about consequence 1's amounts. So the fix must ship no later than the figures (DT-1).

Never registered: a §K2 sweep of the four registers and METHODOLOGY for the mechanism (*base year*, `baseYr`, *as-of year*,
`TAX_CONSTANTS_YEAR`) finds D-60's "one clock from the as-of year" — right for dollars, and silent on which year a published table belongs
to. Filed as **MissingFeatures D-67**.

### 0.4 No check in the suite sees it

The prototype (all 21 sites indexing from the tables' year, nothing else changed), run through the whole suite on a copy of the packaged v6.32
run folder (`runsuite.sh v631 v632`, the prototype as the current leg): **GRAND 10,042 passed, 0 failed** — v6.32's exact count, and every
suite's count line identical to the packaged v6.32 run's (`diff` of the two logs: identical). The first draft's 18-site prototype gave the same.

That the example and every fixture as of 2026 cannot move is true by construction (the exponent `yr − 2026` is the same either way); the suite
run shows something different — that **no check is sensitive to the base at all**. The fixtures that set another as-of date (`asof_census.cjs`,
session-only: `t82` 2027-01-15, `t83` 2029-02-15, and the date loops in `t7`, `t23`, `t82`, `t83`, `t93`) assert relations whose two sides
move together — the Monte Carlo's schedule against Engine B's row, both indexed the same way. **OPERATIONS §B2: the coverage is not there,
so v6.33's suite has to carry it** (§3).

### 0.5 What else names the 2026 figures

**In the app's copy** (`lit2026.cjs`): the Verify tab's group labels (*MEDICARE IRMAA (2026)* ×8, *2026 wage base*, *Per-person QCD limit
(2026)*, *402(g) elective-deferral limit (2026)*, the ACA FPL rows — L2273–2325); the **Taxes tab's** method note (*"official 2026 brackets per
Rev. Proc. 2025-32"*, L11489; *"grow from {as-of year}"*, L11490 — false once v6.33 ships); the **Roth tab's** note (*"Standard deduction …
(2026) + $2,050 age 65+ / + $1,650 per spouse"*, L11097); the QCD panel (*"2026 cap: $111K"*, L11517–11518); the IRMAA tab (*"2026 IRMAA
TIERS"*, *"approximate 2026 Part B + Part D add-ons"*, L11771, L11782); My Data's 402(g) note (L14754); the comments over each block.
**In the Field Manual** (`DOCS_HTML`, L5056): the *Data vintages* table (*Tax year 2026 · IRS Rev. Proc. 2025-32*, *IRMAA 2026*, *wage base 2026
($184,500)*), the §63(f) blind-filer sentence (*"$1,650 … $2,050 single, for 2026 (Rev. Proc. 2025-32)"*), the QCD glossary entry (*"2026 cap
$111K/person"*), the verification paragraph (*"Rev. Proc. 2025-32"*, *"Every other 2026 constant … has been verified"*) and the ACA entry
(*"Rev. Proc. 2025-25"*).
**In seven state rows** — CO, IA, MO, MT, NM, ND and UT's credit — the federal standard deduction is typed into the row (*"$16,100 single /
$32,200 joint for 2026"*, `amt: { single: 16100, joint: 32200 }`): those states follow the federal figure by law, but the row is dated TY2026
like the rest of the state module (DT-5).

**In the suite** (`num_census.cjs`): numeric literals equal to a 2026 table value. Searched: both standard deductions; the 10%, 12%, 22%,
24%, 32% and 35% bracket tops for both statuses; the LTCG breakpoints; the AMT exemptions, phase-out starts and 28% break; both §63(f) amounts;
the wage base; the QCD and §402(g) limits; the IRMAA tiers and the five surcharges; the ACA table's percentages. **599 literals in 64 files**
(406 in 44 without the round numbers 500,000 / 750,000 / 1,000,000, which also occur as other things — `t65`'s state brackets among them). The
largest: `t10` 101, `tools/sim_ledger.mjs` 36, `t65` 33, `t44` 26, `t15` 24, `t41` 20, `tools/fed_oracle_v630.mjs` 20, `t18` 18, `t75` 17. A
candidate list, not a verdict. Under DT-2 (a) a 2026 row keeps its 2026 table, so a pin on a 2026 row holds; what moves at v6.34 is every
figure for 2027 and later, counted at that build, when the figures exist.

### 0.6 The app promises "by January"

The Events tab's notice (L2433–2437) reads, in October–December of the constants' year, *"2027 figures publish Oct–Nov; an updated version
follows by January"*; from 1 January it turns red and the ⌛ STALE DATA strip appears on every tab. That promise is v6.34's deadline.

### 0.7 F-27 — closed by decision

UsabilityFlaws F-27 (filed v6.32): the example's sample briefing (`DEFAULT_MASTER_PROMPT`) describes stress tests with figures the Stress tab
no longer uses. **Read again for this scope:** those figures are the example household's own requests to an AI (L457–462: *"1. AI Bubble
Burst — Tech/AI -40/-50% … 2. Stagflation — Inflation 6–8% for 3 yrs … 3. Long-Term Care Event — Spouse A assisted living at 78
($150K–$300K); Spouse B at 82"*) — not the app's description of its model. Where they overlap the model they agree: the care ages are
`LTC_SHOCK_AGE_A`/`_B` (78 and 82, L2053) and the cost range `LTC_SHOCK_MIN`/`RANGE` (L2050). Changing the text has a cost the register entry
did not name: the loader recognises the example's text by **exact equality** (L4469 and L4502 — v6.22's DC-8), so new wording would have to
recognise the old text too, or older backups would slip past that check.

⚠ **Corrected by the review.** The 2026-10-26 conversation said the ground-rules header "already outranks" these figures. It does not single
them out: the header (L555–566) says it takes precedence over what follows and tells the model to *"use the figures given"* — and the
briefing's stress figures are figures given; the live context's one superseding line (L7557) covers balances only. **The closure rests on the
first reason** — the figures are the household's own questions, not claims about the model — and on the cost of changing them.

**Decided 2026-10-26: closed by decision, the briefing unchanged.** `t89` A-7 keeps pinning it. The register edit (§1) ships with v6.33.

### 0.8 Boundary census (OPERATIONS §K1)

The example's as-of year equals the tables' year, so D-67 is invisible on it — which is why the suite never saw it. New row `asof_table_year`:
ON when the household's as-of year equals the year of the federal table its first year reads. The example is ON; a fixture as of 2027-01-15
clears it on v6.33.

---

## 1 · What changes (if the decisions are taken as recommended)

### v6.33 — the tables index from their own year (a modelling release; nothing moves for a plan as of 2026)

- **Each published table carries its year**, keyed like `fplByGuidelineYear` (DT-2 (a)): the federal family (brackets, standard deduction,
  §63(f) extras, LTCG breakpoints, AMT figures, the QCD limit) as `{ 2026: {…} }`; the IRMAA tiers and surcharges as `{ 2026: {…} }` keyed by
  premium year; the wage base `{ 2026: 184500 }`; the ACA applicable-percentage tables keyed by coverage year (DT-3).
- **The five helpers lose their base-year parameter.** Each looks up the table for the year it is given and indexes from that table's own
  year, so no caller can pass the as-of year again — the design the review recommended, which also makes §3's extinction check a check on
  five definitions rather than on 21 call sites. The top-tier freeze stays a carve-out inside `irmaaThresholdFor`, exactly as now.
- **What moves:** a plan with an as-of year other than the table's — §0.3's Δ columns. **What does not:** the example and every plan as of
  2026 (bit-identical, §3 §C). MC parity 10/10 with no intended difference (the fingerprints are as of 2026).
- **The Verify tab's** three computed IRMAA rows (L2288, L2292, L2293), which pass a literal 2026 as the base, read the table's year; their
  expected values do not change.
- **`TAX_CONSTANTS_YEAR`** becomes the federal table's year, read from the table (DT-8); `DATA_VINTAGES` (L2130–2132) reads each family's own year.
- **Copy:** the Taxes tab's *"grow from {as-of year}"* names the table's year; METHODOLOGY gains *The tables index from their own year
  (v6.33)*, and its D-60 section says the one clock is for dollars, not for published tables; Field Manual §13. The four version sites read v6.33.
- **Registers:** MissingFeatures D-67 filed and closed. UsabilityFlaws F-27 closed by decision — census row: *"CLOSED BY DECISION (Steve,
  2026-10-26) — not changed: the briefing's stress figures are the example household's own requests to an AI, not a description of the
  model (where they overlap the model, they agree), and changing the text would mean recognising the old text too (the loader's DC-8 check
  matches it exactly); `t89` A-7 keeps pinning it"*, with the same reason in its §H entry.

### v6.40 (was v6.39, v6.38, v6.37, v6.36, v6.35, and v6.34) — the 2027 figures (a data release on v6.33's structure)

- **Adds a 2027 entry to each table**, each figure typed from its primary source and checked against it: the federal family from the
  TY2027 Rev. Proc.; IRMAA tiers and surcharges from CMS's 2027 fact sheet (the top tier stays $500,000 / $750,000, frozen through 2027); the
  wage base, $192,300 (SSA); the QCD and §402(g) limits from the IRS; the ACA table from Rev. Proc. 2026-26. The federal table year becomes 2027.
- **What moves:** every year from 2027 on, in every engine — the 2027 row exact, later rows indexed from 2027 instead of 2026 (the difference
  between the published 2027 figures and the model's 2026-plus-one-year projection). 2026 rows do not move. The Monte Carlo moves by design
  (`t2` INTENDED_DIFFS). Measured at the build.
- **Copy driven from the tables** (DT-4): the Verify labels, the Taxes and Roth tabs' notes, the QCD panel, the IRMAA tab and My Data's
  402(g) note name each table's year and figure from the constants, so the 2028 refresh edits only the tables; the Field Manual's typed
  figures are pinned to the constants by a test. Field Manual *Data vintages* table and §13. The four version sites read v6.34.

---

## 2 · Site census

**The 21 indexation sites (v6.33).** Each passes the plan's as-of year as the base today:

| Engine | Sites (v6.32 lines) |
|---|---|
| A — `runRothStrategies` | `infl` L5161 · `seniorExtraFor` L5360 · `irmaaThresholdFor` L5397 · `irmaaTierFor` L5449, L5631 · surcharge × `_kY(yr)` L5450, L5632 · `inflateWageBase` L5488, L5614 |
| C — `computeIrmaaPlan` | `inflate` L5878 (brackets, QCD) · `irmaaTierFor` L5908 (`tierForMagi`) · surcharge × `_kY(irmaaYr)` L6028 · `irmaaThresholdFor` L6030 |
| `projectBracketsAt` (Engine D's Bracket column; the Roth ladder through `projectBrackets`) | `seniorExtraFor` L6644 · standard deduction L6646 · brackets L6647 · `irmaaThresholdFor` L6651 |
| B — `computeTaxPlan` | `inflate` L6718 (brackets, LTCG, AMT, QCD) · `seniorExtraFor` L6904 · `inflateWageBase` L6945 |
| Roth tab (component-inline) | `irmaaThresholdFor` L10819 |

⚠ **The scope's first draft listed 18 and missed the three `irmaaTierFor` callers** (L5449, L5631, L5908) — found by the review, which measured
the 18-site prototype placing the billed tier against a threshold its own conversion cap did not use. The prototype and §0.3 are now the
21-site version.

**The table readers** that become year-keyed: `TAX_CONSTS` (16 reads in `taxFactsFor`, 16 in Engine B, 8 in Engine A with its `run` and
`_estSaleGain`, 4 in `projectBracketsAt`, 2 in `seniorExtraFor`, 1 each in `payrollTax` and Engine C, 27 in `buildVerificationChecks` and 2
in its inner functions, 12 in the component), `IRMAA_CONSTS` (24 hits), `ACA_CONSTS.tableCurrent2026` (L2205), `SS_WAGE_BASE` (5),
`DATA_VINTAGES` (L2130–2132). The keyed structure is new code; the build's own census re-counts every reader before it changes one.

**Not reached, confirmed by the review:** the Monte Carlo and What Breaks see tax only through `mcIncomeTaxSchedule` → Engines B and C; the
state module is not indexed; `acaBenchAt` (L5210) grows the household's own premium, not a published table.

**Copy:** §0.5's sites; METHODOLOGY's D-60 section (*One clock*, L3058, says every engine prices from the as-of year — true of dollars; its
rate passages need a sentence on which year a table belongs to) and every passage the build's census finds saying thresholds grow from the
as-of year; the Field Manual §13. **Not touched:** `OBBBA_CONSTS` (statutory, unindexed, its own sunset).

---

## 3 · Tests

### v6.33 — new suite `t96_table_year.mjs`, both legs (the v6.32 leg pins D-67 as a dated `[KNOWN DEFECT 2026-10-26, D-67]`)

- **§A by AST:** none of the five helpers takes a base-year parameter; each reads its table's own year; no caller passes an as-of identifier
  to any of them; no surcharge is grown by an as-of factor; the ACA function reads the coverage year's table (the extinction check). On v6.32,
  pinned: all 21 sites pass an as-of year.
- **§B THE EXTINCTION INVARIANT:** one household, its as-of date set to 2025, 2026, 2027 and 2028 with every other input fixed — every
  year's standard deduction, bracket tops, LTCG breakpoints, AMT figures, §63(f) extra, QCD cap, wage base, IRMAA thresholds and surcharges,
  read from Engines A, B and C and `projectBracketsAt`, are **the same in all four runs**; on v6.32 they differ (pinned). Where an engine
  exposes no per-year figure, a read-only seam returns it (the `incomeByYr` precedent, `t93` F-5). **Plus a tier-placement case:** a MAGI
  placed between the as-of-indexed tier-1 threshold and the table-indexed one, so Engines A and C bill different tiers on v6.32 and the same
  tier in all four runs on v6.33 — the case the first draft could not see.
- **§B2 the Roth tab** (component-inline, OPERATIONS §M — no module seam): its rendered *"Thr $…K"* is read from the DOM at ±$500; one year
  of indexing moves it by about $6,000–7,000, well outside that band, so the as-of-2027 render differs on v6.32 and equals the as-of-2026 render's
  year-for-year threshold on v6.33.
- **§C nothing moves as of 2026:** across v6.32 → v6.33 on the example and every fixture as of 2026, Engines A–D, the bridge, the Monte
  Carlo's tax schedule, both seeded Monte Carlo engines and the rendered Roth ladder are bit-identical; `t44_irmaa_top_tier` green unchanged
  (the frozen top tier).
- **§D the moves, against an independent oracle:** `fed_oracle_v630.mjs` takes the table's year as its base (typed, never read from the app);
  Engine B's 2030 row for an as-of-2027 household equals it to the cent, and §0.3's Δs are reproduced.
- **§E copy:** the Taxes tab's sentence names the table year (rendered on an as-of-2027 plan); METHODOLOGY; Field Manual §13.
- **`boundaries.mjs`** gains `asof_table_year` (§0.8); `t29` B-28 (the example: ON) and C-table-1 (an as-of-2027 fixture clears it on v6.33).
- **Controls** `qa/tools/controls_v633_table_year.py`: a base-year parameter put back on each helper with an as-of argument at one call site
  per engine (A, B, C, `projectBracketsAt`, the Roth tab, an `irmaaTierFor` caller, a surcharge, the wage base) — each must fire §A and §B (the
  Roth tab §B2); the top-tier carve-out removed (must fire §C's `t44`); the Taxes sentence reverted; METHODOLOGY's heading removed; the
  unmutated run.

### v6.40 (was v6.39, v6.38, v6.37, v6.36, v6.35, and v6.34) — `t99_ty2027.mjs` (was `t98`, and `t97`), both legs

- Every 2027 figure against its source, **typed in the suite from the document**, never read from the app; the Verify tab's 2027 rows (DT-6).
- Statute oracles for 2027: `fed_oracle` gains the 2027 table, typed; Engine B's 2027 and 2028 rows to the cent on three households; IRMAA at
  every 2027 tier edge ±$1 (premium year 2027) in Engines A and C, the top tier at the frozen $500,000 / $750,000; the wage base in 2027; the ACA
  2027 table at every band edge and at 400% FPL.
- 2026 rows unchanged across v6.33 → v6.34 (bit-identical); 2027 rows exactly the table; later rows indexed from 2027.
- Copy from the constants (DT-4): every label named in §0.5 renders the table's year and figure; the Field Manual's typed figures equal the constants.
- **Re-gating:** every suite that pins a figure for 2027 or later is re-derived from an independent model on the v6.34 leg and keeps its v6.33
  assertion on the v6.33 leg (the v6.30 discipline); the count is measured at the build. `t1` STATIC and `t33` PINS by hand.

---

## 4 · Out of scope

- **State figures for TY2027** — Georgia's $70,000, Louisiana's indexed amount, every state's TY2027 brackets and deductions — and the seven
  state rows that quote the federal standard deduction (DT-5).
- The historical-returns row (the January cycle) and the peer data (the SCF cycle) — OPERATIONS §I's other two cycles.
- Rounding projected IRMAA thresholds to $1,000 (FlawsToFix C-13, open by decision) and the first two premium years (D-65).
- The OBBBA senior deduction: statutory, unindexed, with its own sunset; no yearly figure.
- The ACA open-enrollment dates for 2028 coverage (`ACA_OE_CHECKED`): HealthCare.gov publishes them later.
- The example's sample briefing (F-27 — closed by decision, §0.7).

---

## 5 · Decisions for Steve

**DT-1 · How the work ships.**
- **(a) Two releases: v6.33 now (the base fix, figures unchanged), v6.34 when the IRS and CMS have published (aimed at early December).** *Recommended.*
- (b) One release in December, both changes together.
- (c) v6.33 now, and the 2027 figures in pieces as each is published (the wage base and the ACA table first).

*Why (a):* D-67 goes live on 1 January whatever build is live, and the 2027 figures cannot safely land without its fix. Shipped alone, v6.33
moves nothing for any plan as of 2026, so if v6.34 then moves a figure the cause is the figures and nothing else (OPERATIONS §M: change the
structure, prove nothing moved, then change the values). (c) makes three or four releases out of one, each with its own suite re-gating; (b)
puts a model change and a data change in one diff.

**DT-2 · How the years are held.**
- **(a) Keep each published year's table. A year uses its own; a later year indexes forward from the newest table; an earlier year than
  any held uses the oldest table as it stands (no deflation).** *Recommended.*
- (b) Keep only the newest table and index every year from it, backwards too (how the poverty guidelines are held today).

*Why (a):* 2026 rows stay exactly 2026's figures, so the suite's hand-verified 2026 pins hold, and 2027 rows are exactly 2027's. Under (b) a 2026
row becomes the 2027 figure deflated at the model's rate — neither year's real figure — and every 2026 pin moves. **On earlier years:** only a
plan as of 2025 or earlier that has a row before 2026 reaches them. Deflating the 2026 table would invent figures that are not 2025's — OBBBA
reset several of them by more than inflation (the AMT phase-out among them) — while using the 2026 table as it stands is what v6.32 already
does for such a row (its exponent is 0 when the base is the row's own year). The poverty-guideline table can stay as it is: it already holds
each published year.

⚠ **REVISED AT THE BUILD (§7.2).** Both premises of the paragraph above are false. An already-retired plan dated 2026 (a 2024 retirement year)
has rows in 2024 and 2025, and v6.32 **deflated** the 2026 figures for them (its exponent was the row's year minus the as-of year, negative).
Under (a) as written that plan moved — its 2024 standard deduction $30,654 → $32,200, lifetime tax −$1,336, optimistic. Steve, 2026-10-27,
asked: *"Deflate before 2026"* — a year before every held table reads the oldest table deflated from its year, so every plan dated 2026 prices
to the bit what it did.

**DT-3 · Which tables are year-keyed.**
- **(a) All of them: the federal family, IRMAA tiers and surcharges, the wage base, the ACA applicable-percentage table (later coverage years
  hold the newest table, as today).** *Recommended.*
- (b) All but the ACA table, which stays one table for every year (today's disclosed simplification).

*Why (a):* the 2027 ACA table is published, and any bridge year from 2027 on is priced today with 2026's, which understates the applicable
percentage (10.22% against 9.96% at the top band) — the subsidy reads high, the optimistic direction.

**DT-4 · Copy that states a figure.**
- **(a) Render it from the tables (the year and the figure), so next year's refresh edits only the tables; the Field Manual, a fixed string,
  keeps its typed figures and a test pins each to the constant.** *Recommended.*
- (b) Re-type every site each year, as now.

**DT-5 · The state module.**
- **(a) Leave every state row on its dated tax year (TY2026), the seven federal-deduction rows included, and say so where they quote the
  federal figure. TY2027 state figures are their own D-18 release after the states publish (January–March 2027). Ride along with v6.34 only
  what corrects a TY2026 row and is published by then: Montana's, Rhode Island's and Maine's TY2026 figures, and the final Nebraska and Vermont
  schedules (E-31 (b)).** *Recommended.*
- (b) Bring the seven federal-deduction rows to TY2027 in v6.34 (each row would then mix tax years) and add Georgia's $70,000 as a scheduled
  change (the state module holds each statute's figures fixed — v6.30's DU-4 — so a dated step is new machinery).

**DT-6 · The Verify tab.**
- **(a) Check every held year's table against its own source (2026's rows stay; 2027's are added), labelled by year.** *Recommended.*
- (b) Check only the newest year.

**DT-7 · If a source is late.** OPERATIONS §I's cycle table expects the IRS's Rev. Proc. in late October and CMS's IRMAA figures in
mid-November (the 2026 CMS fact sheet is dated 14 November 2025 — FlawsToFix-v5_73-Phase2 §1).
- **(a) Hold v6.34 until the federal set is complete; if a table is still unpublished on 15 December, ship the rest, let the late table's
  2027 row be its 2026 table indexed forward (as every later year is), and have the Events notice name it.** *Recommended.*
- (b) Hold v6.34 until everything is published, even past 1 January (the red strip shows meanwhile).

**DT-8 · What the staleness strip keys on, once the tables are keyed.** (The first draft made this conflict with DT-7 — found by the review.)
- **(a) `TAX_CONSTANTS_YEAR` is the federal table's year (the IRS Rev. Proc. set — what the strip has always meant), read from the table.
  The Events notice lists each family's year when they differ (federal, IRMAA, wage base, ACA), so a late CMS table shows there without
  turning the strip red. The poverty guidelines do not count: they lag their coverage year by design.** *Recommended.*
- (b) The strip keys on the oldest of all the tables' newest years (a late CMS table would turn it red on 1 January).

---

## 6 · Review

An agent that had not seen the work reviewed the first draft against the v6.32 source, the prototype and both suite logs: **1 blocker,
4 should-fix, 4 notes**, every one checked and taken.
- **Blocker:** the census missed `irmaaTierFor` and its three callers (L5449, L5631, L5908) — taken: 21 sites, the prototype completed and
  re-measured, §0.3's IRMAA columns and consequence 1's direction corrected (the first draft said a plan as of 2027 under-states IRMAA; with
  tier placement fixed too it over-states it — conservative), the suite re-run (§0.4), §3 §A/§B extended with a tier-placement case, the
  helpers' base parameter removed in the design (§1).
- **Should-fix:** the IRMAA top-tier freeze must survive the keyed accessor (§0.2, §1, §3 §C with `t44`, the Verify rows L2288/2292/2293);
  DT-2's precedent was misdescribed (the poverty guidelines index from the newest year both ways) and deflation before 2026 is not neutral in
  law (DT-2 now uses the oldest table as it stands); DT-7 conflicted with DT-8 (DT-8 rewritten; `DATA_VINTAGES` in the census); the Roth tab's
  inline site needs a DOM test at a stated precision (§3 §B2).
- **Notes:** the F-27 closure overstated the ground-rules header (§0.7 corrected); two line references (L11097 is the Roth tab's note;
  L11489); the suite-literal census's searched values (§0.5, now listed); wording (the conversions column, the as-of-2025 rows, what the
  bit-identity claim rests on, the §402(g) catch-ups the app does not hold).
- **Confirmed by the review:** the 21-site diff is the prototype's only change; `TAX_CONSTANTS_YEAR`'s 14 hits; every figure in §0.3's tables
  reproduced; the Monte Carlo and What Breaks reach tax only through Engines B and C; no other year-offset use of a published figure; the
  primary-source figures in §0.1.

---

## 7 · Build record — v6.33 (2026-10-27)

**Built against v6.32** (`fe8188a5…`, repo `cc8b7e8`, freshness re-checked at the build: `origin/main` unchanged). **Shipped as v6.33**: source
`5fd4f025c3aacda999989ce3395b73ee`, built `index.html` `64296d15860bd5756ab5e3376d5c57d2`. The CHANGELOG's v6.33 entry is the release's account; this section records what the build found
against this scope and how each point was settled.

### 7.1 What §1 promised, and what was built

Every v6.33 bullet of §1 was built as written, with three differences:
- **DT-2 changed** (§7.2).
- **The tables' shape.** `TAX_CONSTS` and `IRMAA_CONSTS` are kept as the 2026 entries of `FED_TABLES` and `IRMAA_TABLES`, rather than renamed,
  so the suites' and the Verify tab's reads of the 2026 table stand unchanged. §A of `t96` holds that no engine reads an indexed figure from
  them directly. The wage base's 2026 entry is read from `TAX_CONSTS.SS_WAGE_BASE` when the app loads.
- **`taxFactsFor` has two shapes.** Without a year it returns the statutory facts only, so the three statutory call sites `t1` pins by text
  (§86) are unchanged. With a year it returns that year's table and its year.

The census's 21 sites are all changed. The build's own census, by parser, found one more site that indexed from the as-of year: the Taxes
tab's bracket-by-bracket panel, through Engine B's returned `inflate`. It also found that the same panel reads the last year's filing status.
Both are filed and fixed as UsabilityFlaws **F-28**. The build review added a second drawing to F-28, the Roth tab's BRACKET UTILIZATION bar.

### 7.2 DT-2 revised — Steve, 2026-10-27

The build review found both premises of DT-2 (a) false, and §5's DT-2 carries the note. Asked, with the measured move ($30,654 → $32,200 on
an already-retired plan's 2024 row, lifetime tax −$1,336), Steve chose ***"Deflate before 2026"*** (the recommendation). So a year before every
held table reads the oldest table deflated from its year. Every plan dated 2026, retired or not, is bit-identical to v6.32 (`t96` §C, seven
plans, one retiring in 2024).

### 7.3 The build review — 2 blockers, 4 should-fix, notes; every one checked and taken

An agent that had not seen the build was given this scope, the source diff, the Field Manual diff, the suites' diff, `t96` and its controls.

| Finding | Disposition |
|---|---|
| **B1** DT-2's premise is false: an already-retired plan dated 2026 moved | Asked Steve (§7.2); deflation restored; `t96` B-8 pins it, §C gains the retired plan, control C15 puts the clamp back |
| **B2** `t96` A-1 maps a defaulted parameter to `AssignmentPattern`, so `baseYr = …` passed and five controls would report MISSED | A-1 reads a default's name; the controls fire (§7.5) |
| **S3** §0.3's deltas (and the first METHODOLOGY and Field Manual drafts) called Engines B and C without the drawdown series; IRMAA's direction was backwards | Re-measured from the tabs' own call; METHODOLOGY, Field Manual §13, CHANGELOG and `t96` D-4/D-5 carry those figures; §0.3 has a correction note |
| **S4** the Roth tab's bracket bar is F-28's class, and A-6 whitelisted it | Fixed (the ladder year's own projection); folded into F-28; A-6's label set no longer includes it; `t96` F-3 and control C20 |
| **S5** the IRMAA tab's *"keeps its 2026 value in today's dollars"* is now false for a plan not dated 2026 | *"…in 2026's dollars"*; METHODOLOGY's DU-5 bullet likewise |
| **S6** coverage: no `seniorExtraFor` control; Engine C's QCD and Engine A's LTCG and AMT not reached by §B; ±$500 against a ±$1K check | Control C18 added; the three engine figures are disclosed in `t96`'s header as held by §A and §C only; B2-2 says "to the $K shown" |
| **N7** v6.34 readiness | The top tier's freeze now indexes from the later of the freeze and its table's year (`t96` A-4j, control C19). The rest is §7.4 |
| **N8, N9** completeness and bit-identity otherwise confirmed; the Taxes sentence and §6 said nothing of rows before 2026 | Both now say a row before 2026 deflates the figures |

### 7.4 Carried to v6.40 (was v6.39, v6.38, v6.37, v6.36, v6.35, and v6.34)

- **Verify tab.** The rows typed as 2026 expectations (the IRMAA indexing rows, from 109,000 and 500,000) must be re-derived for the 2027 table
  (DT-6). They fail loudly when the 2027 table lands.
- **Copy from the tables** (DT-4): the IRMAA tab's "2026 IRMAA TIERS" heading (Engine C returns the newest table's tiers), the Roth tab's
  rules note (*"(2026)"*), the QCD slider's maximum, and My Data's §402(g) note.
- **`t29` B-28.** Once the 2027 table is held, the example dated 2026 reads 2027's table for its first row (2029), so the row clears: a re-gate.
- **The ACA 2027 table** (Rev. Proc. 2026-26) and **the wage base** ($192,300) are published, and wait for v6.34 with the rest (DT-1).

### 7.5 Counts and controls

- **The full suite from the packaged copies** (a run folder from `mk_runfolder.sh v632 v633` on a clone of `cc8b7e8` carrying the package's
  code): 10,133 app checks across 95 app suites, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64, `domdiff` 33, `sets` 12 + 12; GRAND
  10,264.
- **The first packaged run** found three red checks. Both causes were fixed, then the run was repeated from scratch:
  - `t95` C-5, on both legs. It compares the Roth ladder with v6.31's bundle, which a v6.32 → v6.33 run does not build, so it now prints a
    skip.
  - `domdiff` TAXES. The bracket panel moved by design (F-28), so the pair is now bounded: the year table is identical and the panel differs.

- **`t95` 163 → 153 is not a loss of coverage at v6.32's own claims.** Its ten checks against v6.31's module ran in v6.32's release run.
- **Controls:** `controls_v633_table_year.py` on a copy of the packaged run folder — 22 of 22 as expected, every file restored and
  hash-checked.
- **Build:** `smoke_built` 22/22; v6.32 rebuilt byte-identically to `2cdbfc54…` with the same `npm ci` tree.
- **Packaging:** `package_check` I-2 asked for this scope to be classified. It is half built, so it went on the tool's OPEN allowlist, with
  an entry that expires at the v6.34 build. That build marks the scope FULFILLED and removes the entry in the same package.
