# Project Knowledge Index — Danger Close

**This file is the source of truth for what's in project knowledge.** A session reads it
FIRST, before trusting any source file, because project knowledge is a flat pool with no
version awareness — a stale file looks identical to a current one. This manifest removes the
guessing: it names which build is current, which is the prior comparison baseline, and what
every other file is.

Update this file as step 1 of every post-build knowledge refresh.

---

## Where the project instructions live (changed 2026-08-09)

**`PROJECT_INSTRUCTIONS.md` is NO LONGER a knowledge file.** Its ground rules, conventions,
cautions, and voice now live in the **project instructions**, which are injected into every
conversation automatically — so they cannot go stale in the pool or be missed by a session that
doesn't search for them. (They did go stale once: a v5.11 amendment sat unapplied for a full
release cycle, invisible because a stale copy is byte-identical to a current one.)

The operational half — sections §A–§N — lives here as **`OPERATIONS.md`**. If a session finds a
`PROJECT_INSTRUCTIONS.md` in the pool, it is a leftover and should be deleted.

## Current build (the canonical working source)

| Field | Value |
|---|---|
| Version | **v6.39** |
| Source file in knowledge | `DangerClose-v6_39.jsx` |
| Source md5 | `5a948ff4ca43908c8fdffe948780519b` |
| Built `index.html` md5 | `f8df7ca2f6d70871bbf7ea6cb87f2a52` |
| Shipped | 2026-10-30 |

> ⚠ **v6.39 SHIPPED (2026-10-30) — Ask AI is told what accounts the plan holds and what it contributes (D-69).** Source `5a948ff4…` · built `f8df7ca2…`.
> An ASK AI release (`docs/SCOPE_D69_AI_CONTEXT_V639.md`, DA-1 to DA-6 all as recommended; build record §8, which includes six fixes the independent build review found — Steve: *"Fix 1–6, file the RMD one"*). Through v6.38 the request carried the plan's accounts as two totals and one contribution figure, so an HSA, a Roth balance or a rollover IRA was invisible to Ask AI, and the ground rules' *"if something you need is missing, say so"* let it tell a plan holding an HSA that it had none. From v6.39 one helper, `aiPlanFacts`, adds every account type totalled by owner (never by name), every contribution, the salaries, the pension's owner, the ACA bridge and the gain share to the live context on every question; the rule says a fact not sent is to be named as such and asked for; the five lists of what is sent name the new facts. No computed figure changed (parity 10/10). METHODOLOGY §11: what is sent. MissingFeatures D-69 filed and closed, **D-70 filed** (a single plan's money stored under spouse B gets no RMD). UsabilityFlaws F-30's stale *"My Data 21"* corrected. **Under DA-6 (a) the 2027 tax figures are v6.40** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered a sixth time; suite still `t99`; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t103` (both legs); `controls_v639_ai_context.py` new; `boundaries.mjs` gains `ai_account_types` (`t29` B-34, C-d69-1); `t92` E-2/E-3 re-gated; the shim exports `aiPlanFacts`; `v639` registered (`t33` PINS unchanged; `t93`'s Engine D reference v638). `TESTING.md`'s v6.36 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_38.jsx` (v6.38 is read from history, commit `65c6b10`) and gains `DangerClose-v6_39.jsx`. **Pool stays 16.**
>
> *(**v6.38 SHIPPED (2026-10-29) — the Income tab on a phone, and what it says when income covers spending (F-20).** Source `b82ede24…` · built `a405b665…`.
> A PRESENTATION release for the Income tab (`docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md`, DF-1 to DF-6 all as recommended; build record §8, which includes five fixes the independent build review found — Steve: *"Fix in v6.38"*). With an income stream the Income tab scrolled sideways on a phone (504–627 px at 390), and on every plan its three income cards and each phase card's figures printed over each other there; a plan whose income covers spending read *"-$-1,302"* in six places and was told the shortfall came from the portfolio; the coverage before spouse A's Social Security counted spouse B before B claimed. From v6.38: phone-only rules in the v5.81 block (desktop and tablet identical by construction, proved against a build without them); the covered wording; the after-payments figure counts the streams running then; draw figures to the dollar. No engine changed (parity 10/10). METHODOLOGY: one sentence (D-49's phone-layout precondition met). UsabilityFlaws F-20 fixed, **F-30 filed and disclosed in §13** (six other tabs overprint on a phone). **Under DF-6 (a) the 2027 tax figures are v6.39** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered a fifth time; suite still `t99`; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t102` (both legs); `t45` gains §S (a stream plan; an overlap check on the Income tab); `controls_v638_income.py` new; `boundaries.mjs` gains `income_covers_spend` (`t29` B-33, C-f20-1); fixture `qa/tools/fixture/f20_streams_plan.json` new; `v638` registered (`t33` PINS unchanged; `t93`'s Engine D reference v637); no shim change. `TESTING.md`'s v6.35 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_37.jsx` (v6.37 is read from history, commit `ecde3ff`) and gains `DangerClose-v6_38.jsx`. **Pool stays 16.**)*
>
> *(**v6.37 SHIPPED (2026-10-29) — the SS tab's claim-age explorer starts at your plan (F-29).** Source `0b63ca62…` · built `bbe3987f…`.
> A PRESENTATION release for the SS tab only (`docs/SCOPE_F29_SS_SLIDER_START.md`, DS-1 to DS-6 all as recommended — DS-6 added at the build; build record §7). Spouse A's what-if slider opened at a literal 67 for every plan (spouse B's at her plan), and the draw comparison under the sliders had three baselines (the card against the plan, the table's FRA amount from the plan's date, the permanent card against FRA); spouse B's section read her age in the retirement year as her claim (the shortfall card, a *"Modeled"* tag, a false note that the Monte Carlo understated her income); a single household's table counted the placeholder spouse B's check. All invisible on the example (spouse A plans 67; spouse B claims in the retirement year). From v6.37 both sliders open at `ssTabClaimAge` (the plan's age, rounded, clamped 62–70) and one monthly series from retirement compares spouse A's slider with the plan. No engine changed (parity 10/10; METHODOLOGY unchanged). UsabilityFlaws F-29 filed and fixed. **Under DS-5 (a) the 2027 tax figures are v6.38** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered a fourth time; suite still `t99`; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t101` (both legs); `controls_v637_ss_slider.py` new (15 of 15); `boundaries.mjs` gains `ss_claim_a_planned_67` and `ss_claim_b_at_retire` (`t29` B-31, B-32, C-f29-1, C-f29-2); `t6`'s single-household shortfall invariant re-gated; `v637` registered (`t33` PINS unchanged; `t93`'s Engine D reference v636); no shim change. `TESTING.md`'s v6.34 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_36.jsx` (v6.36 is read from history, commit `c3c72f0`) and gains `DangerClose-v6_37.jsx`. **Pool stays 16.**)*
>
> *(**v6.36 SHIPPED (2026-10-28) — What Breaks pays the Monte Carlo's tax (D-66).** Source `9c470b5a…` · built `ee554293…`.
> A MODELING release for What Breaks only (`docs/SCOPE_D66_WHATBREAKS_TAX.md`, DB-1 to DB-5 all as recommended; build record §7). What Breaks averaged the Roth tab's strategy engine (Engine A) while the Monte Carlo charged the Taxes tab's tax and the IRMAA tab's surcharges; D-66 was registered as IRMAA alone, and the income tax differed more (+$2,480 a year on the example at the defaults; above the Monte Carlo on 100 of 102 fixture cases). From v6.36 What Breaks calls `whatBreaksAnnualTax`, which averages `mcIncomeTaxSchedule` at the Monte Carlo's four inputs; Engines A–D, the Monte Carlo and the Roth tab do not move (parity 10/10). Mostly optimistic: on the example under BASE the estimate $10,528 → $8,048 a year, headroom 1.20× → 1.25×. Engine A's three differences (the undrained draw, the unspent dividend pool, the per-spouse ladder end) filed as MissingFeatures D-68. **Under DB-5 (a) the 2027 tax figures are v6.37** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered a third time; suite still `t99`; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t100` (both legs); `controls_v636_whatbreaks.py` new (17 of 17); `t8`, `t49` X-2, `t57` D4, `t81` E-8 (the v6.20-table run), `t83`, `t93`, `t94` and `t98` re-gated (`t98`'s six v6.34 differentials skip outside a v634 → v635 folder); the Roth comparator's “same tax engine” sentence reworded; `v636` registered (`t33` PINS unchanged; `t93`'s Engine D reference v635); the shim exports `whatBreaksAnnualTax`. MissingFeatures D-66 closed, D-68 filed, D-57 updated; `FlawsToFix-v5_73-Phase2.md`'s D-7b points to D-68. `TESTING.md`'s v6.33 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_35.jsx` (v6.35 is read from history, commit `2762bf7`) and gains `DangerClose-v6_36.jsx`. **Pool stays 16.**)*
>
> *(**v6.35 SHIPPED (2026-10-28) — STAY UNDER IRMAA stays under (D-62); the last working years' income (D-65); one-time costs before retirement (D-44).** Source `853e311a…` · built `1f5a4cb5…`.
> A MODELING release (`docs/SCOPE_D62_D65_D44_V635.md`, all twelve decisions as recommended; build record §7). STAY UNDER IRMAA takes the largest whole-dollar conversion whose lookback MAGI, the funding sale's gain included, is $500 under the first cliff (`IRMAA_SOLVER_MARGIN`); it had crossed the cliff in some year on every fixture household (the example $13,800 of IRMAA → $0, estate +$19,817). My Data takes the last working years' MAGI (`workMagi`, optional, today's dollars), charged in the first two premium years by Engines A and C and so the Monte Carlo; blank charges nothing, as before, with a flag when the salaries are above the first tier and someone is on Medicare then. The Withdrawal tab, Backtest and What Breaks start from today's holdings less the one-time rows dated before retirement (`preRetireOneTime`). One scope premise was false (the estimate can fall as the conversion grows, once in 624 grids); the build stopped and Steve chose *"Test the real need"* (scope §7.5). **Under DV-1 (a) the 2027 tax figures are v6.36** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t98` (both legs); `controls_v635_irmaa_onetime.py` new (32 of 32); `boundaries.mjs` gains `pre_retire_once` and `work_magi` (`t29` B-29, B-30, C-d44-1, C-d65-1); `t2` compare's intended differences, `t22`'s estate identity, `t81`/`t83`/`t93`/`t94` re-gated, `domdiff` bounds the pair's Withdrawal-tab copy, `t96`'s skip line reworded; `v635` registered (`t33` PINS unchanged; `t93`'s Engine D reference v634); the shim exports the v6.35 helpers on `__g`. MissingFeatures D-44, D-62, D-65 closed; UsabilityFlaws F-25's census row corrected. `TESTING.md`'s v6.32 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_34.jsx` (v6.34 is read from history, commit `39e763d`) and gains `DangerClose-v6_35.jsx`. **Pool stays 16.**)*
>
> *(**v6.34 SHIPPED (2026-10-27) — My Data keeps spouse A's stored pre-tax contribution (D-58).** Source `5ca11d61…` · built `04e87d95…`.
> A DATA-HANDLING and display release; no engine changed (`docs/SCOPE_D58_CONTRIB_SAVE_V634.md`, DC-1 to DC-4 all as recommended; build record §7). My Data showed $0 for spouse A's pre-tax contribution on a plan holding a monthly figure with no paycheck breakdown (the example's $2,500 a month, or a backup written outside My Data), and one unedited Save & Apply, draft or Export Backup stored the $0 (the example: A's Traditional at retirement −$90,000). One rule, `effectivePreTaxA`, now gives the figure: the stored one until the paycheck row is edited, then the rollup; every display site and the save read it; a saved all-zero row beside a stored figure opens blank; while the stored figure is in use the 402(g) check counts no paycheck deferral and says so. No notice for plans saved earlier (DC-3 (c)). **Under DC-4 the 2027 tax figures are v6.35** (`docs/SCOPE_TY2027_REFRESH_V633_V634.md`, renumbered; OPEN — it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December, DT-7).
> New suite `t97` (both legs); `controls_v634_contrib.py` new (22 of 22); `t8`'s mirror pin and `t9`'s readout check re-gated; `v634` registered (`t33` PINS unchanged; `t93`'s Engine D reference v633); the shim exports `effectivePreTaxA`. MissingFeatures D-58 closed; METHODOLOGY's two false contribution sentences corrected; OPERATIONS §C4's save trap keeps only the as-of move. `TESTING.md`'s v6.31 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_33.jsx` (v6.33 is read from history, commit `045de6b`) and gains `DangerClose-v6_34.jsx`. **Pool stays 16.**)*
>
> *(**v6.33 SHIPPED (2026-10-27) — the published tax tables index from their own year (D-67); two bracket drawings read the right table (F-28).** Source `5fd4f025…` · built `64296d15…`.
> A MODELING release that moves nothing for a plan dated 2026 (`docs/SCOPE_TY2027_REFRESH_V633_V634.md` — v6.33 built, §7 its record; **v6.34, the 2027 figures, OPEN**: it waits on the IRS TY2027 Rev. Proc., the §402(g) notice and CMS's 2027 IRMAA figures, to ship by 15 December — DT-7). Each published table carries its year (`FED_TABLES`, `IRMAA_TABLES`, `WAGE_BASE_TABLES`, the ACA table by coverage year); the five indexing helpers lost their base-year parameter; a year reads its own table, the newest indexed forward after it, or the oldest deflated before it (DT-2 revised at the build, Steve: *"Deflate before 2026"*). `TAX_CONSTANTS_YEAR` is read from the table. On the example dated 2027 lifetime tax falls $4,109 (at $70K) and IRMAA rises $600 (at $250K); plans dated 2026 are bit-identical. The Taxes tab's bracket panel and the Roth tab's bracket bar read their year's own table (F-28).
> New suite `t96` (both legs); `controls_v633_table_year.py` new (22 of 22); `boundaries.mjs` gains `asof_table_year` (`t29` B-28, C-table-1); `t22`, `t78` and `t95` C-5 re-gated, `domdiff` bounds the pair; `v633` registered (`t33` PINS unchanged; `t93`'s Engine D reference v632); the shim exports the table accessors. MissingFeatures D-67 filed and closed; UsabilityFlaws F-27 closed by decision, F-28 filed and fixed; OPERATIONS §I's refresh row and the OBBBA bullet name the year-keyed tables. `TESTING.md`'s v6.30 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_32.jsx` (v6.32 is read from history, commit `b781d7f`) and gains `DangerClose-v6_33.jsx`. **Pool stays 16.**)*
>
> *(**v6.32 SHIPPED (2026-10-25) — QCDs after a death (D-61); the Stress, Social Security, Roth, Events and Backtest tabs say what the model does (F-26).** Source `fe8188a5…` · built `2cdbfc54…`.
> A MODELING release with a presentation pass (`docs/SCOPE_F26_D61_V632.md`, DF-1 to DF-8 all as recommended). From the first projected death only the survivor may make a QCD, on the survivor's own age, with one cap (Engines B and C); on four test households lifetime tax rises $8,054–$26,252, the example unchanged. The Stress tab's cards are computed for the plan (`stressPlanFacts`); the SS tab's survivor grid shows the larger benefit; the Roth ladder starts at the selected year (byte-identical at the target year); the ACA dates print only for 2027 coverage; the Backtest names the plan's own worst start; the README rewritten.
> New suite `t95` (both legs); `controls_v632_f26_d61.py` new; `boundaries.mjs` gains `qcd_survivor` and `survivor_benefit_b` (`t29` B-26, B-27, C-d61-1 to -3); `t1` S-5 and `t8` STEP-1 re-gated; `v632` registered (`t33` PINS unchanged); `mk_runfolder.sh` copies `README.md`; the shim exports `stressPlanFacts`. MissingFeatures D-61 closed; UsabilityFlaws F-26 and F-15b closed, F-27 filed. `TESTING.md`'s v6.29 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_31.jsx` (v6.31 is read from history, commit `a018e1b`) and gains `DangerClose-v6_32.jsx`. **Pool stays 16.**)*
>
> *(**v6.31 SHIPPED (2026-10-24) — the Monte Carlo pays IRMAA (D-51); Ask AI asks Claude Opus 4.8 at medium effort (AI-6).** Source `d729d028…` · built `7a52c128…`.
> A MODELING release with an Ask AI change (`docs/SCOPE_D51_AI6_V631.md`, all decisions as recommended). `mcIncomeTaxSchedule` adds Engine C's surcharges, each in its premium year (MAGI year + 2), to the Taxes tab's tax; nothing before retirement or after the horizon; the tail repeats the last year's total. What Breaks adds Engine A's IRMAA; the Income card adds an IRMAA line; the IRMAA tab's false "err high" sentence replaced (D-65). The example as it opens is unchanged; at a $250,000 slider $24,180 of surcharges, BASE 30-year success 75.13% → 74.03%. Ask AI: `claude-opus-4-8`, effort medium, no thinking, text blocks only, a refusal notice with the declined exchange left out of the memory, 180 s timeout, the cost note restated at $5 / $25 and the newer tokenizer.
> New suite `t94` (both legs); `controls_v631_mc_irmaa_ai.py` new; `boundaries.mjs` gains `irmaa_in_mc` (`t29` B-25, C-irmaa-1); `t66`, `t83`, `t89` and `t93` re-gated; `v631` registered (`t33` PINS unchanged). MissingFeatures D-51 closed, D-65 and D-66 filed; ARCHITECTUREIssues E-30 (c) closed; UsabilityFlaws F-26's token item addressed. `TESTING.md`'s v6.28 per-suite line moved to the archive. **Rotation:** the pool loses `DangerClose-v6_30.jsx` (v6.30 is read from history, commit `9eee5a7`) and gains `DangerClose-v6_31.jsx`. **Pool stays 16.**)*
>
> *(**v6.30 SHIPPED (2026-10-23) — one dollar unit and one inflation clock for the tax engines (D-60).** Source `f2d3f578…` · built `3d013b09…`.
> A MODELING release (`docs/SCOPE_D60_DOLLAR_UNITS_V630.md`, all nine decisions as recommended). Every tax engine computes each year in that year's own dollars on the Monte Carlo's as-of clock; today's holdings reach retirement at inflation (basis nominal, the contribution accrual at face value, `carryStartBalances`); the bracket family indexes at the plan's inflation less 0.25 point (C-CPI-U), IRMAA tiers, the poverty line and the wage base at the plan's inflation; surcharges grow to the premium year; year rows in each year's dollars and every lifetime total also in today's; the Monte Carlo and What Breaks are handed each year's tax in today's dollars. The example's lifetime tax (BULL-LEANING, $70,000) $213,670 → $201,181 in today's dollars; the 30-year Monte Carlo moves by up to two points, by household. v6.29's partial measurement of D-60 corrected; the build review's blocker (the accrual was carried with the holdings) fixed before release.
> New suite `t93` (both legs); `qa/units_v630.mjs`, `qa/tools/fed_oracle_v630.mjs`, `qa/tools/validate_v630.mjs`, `controls_v630_dollar_units.py` new; `sim_ledger.mjs` gains a v6.30 mode; `boundaries.mjs` gains four rows (`t29` B-21–B-24); every suite pinning an engine, Monte Carlo or What Breaks figure re-gated by re-derivation, a few re-pinned by measurement (each listed in the CHANGELOG). MissingFeatures D-60 closed, D-64 filed; ARCHITECTUREIssues E-9 closed, E-22 narrowed, E-23 noted; FlawsToFix C-13 re-worded. **Rotation:** the pool loses `DangerClose-v6_29.jsx` (v6.29 is read from history, commit `be4b76f`) and gains `DangerClose-v6_30.jsx`. **Pool stays 16.**)*
## Pooled file hashes (freshness fallback — OPERATIONS §A2)

**From 2026-10-19 the pool holds no `qa/` file** (the second ops package that day; `docs/SCOPE_UNPOOL_QA_CODE.md`, DC-1 (a)). The suite, its
harness and its tools are read from a clone, which every build works from anyway — `mk_runfolder.sh` needs the repo's tree. This table keeps
the rows for the files that are still pooled and hashed, so §A2's offline fallback and `package_check` K-8 still have something to compare,
and E-1b still resolves `index.html` and `README.md` through the path cell. **The test and harness hash table that stood here** — 118 rows for
files that left the pool, and its history — **moved verbatim to `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md`** (repo-only, DC-2 (a));
the description of every departing file moved to `TESTING.md`, *Every suite and harness file*. The two `.jsx` app sources are covered by
the build tables, and the registers and audit documents by the clone-and-diff, as before.

**DERIVE THE COUNT, DO NOT READ IT (decision D-5, 2026-09-07).** The command below is `package_check` K-8's own expression; `qa/tools/row_census.cjs`
checks it agrees with the gate and with `controls_manifest_rows.py`. Its last argument is a folder holding the pool.

```bash
node --input-type=module -e '
import {readFileSync,readdirSync} from "fs"; import {join} from "path";
const POOL=process.argv[1];
const M=readFileSync(join(POOL,"PROJECT_KNOWLEDGE_INDEX.md"),"utf8");
const rows=[...M.matchAll(/^\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt|py))`?\s*\|\s*`?([0-9a-f]{32})`?\s*\|/gm)];
const hashed=new Set(rows.map(r=>r[1])); const pool=readdirSync(POOL);
console.log(pool.length,"files ·",hashed.size,"hashed rows ·",pool.filter(f=>!hashed.has(f)).length,"with no row");
' /mnt/project
```

**Which pooled files carry a row (decision D-3, 2026-09-07; carried from the archive, because it is a rule in force).** A row is a
maintenance obligation, not a free check — every package editing a rowed file must roll its row, and a stale row returns a false MATCH,
which is worse than no row. So rows are kept for the files whose staleness would actively mislead a session — the six documents below —
and the four build-scaffold files. **Deliberately unrowed:** this file (D-4: it cannot carry its own hash); the app source (the build
tables own its md5, and K-4–K-6 check it); the registers and audit documents (`ARCHITECTUREIssues.md`, `UsabilityFlaws.md`,
`FlawsToFix-v5_73-Phase2.md`, `SCOPE_STANDING_AUDIT.md` — covered by the clone-and-diff). A file gaining its first pool copy gets a row
or a reason here (OPERATIONS §I).

| Pool file | md5 | Repo path |
|---|---|---|
| `CHANGELOG.md` | `e00916da4c3a5818285b43603a13fb3e` | `CHANGELOG.md` |
| `METHODOLOGY.md` | `523bf6319d76f5e1c8107059ba761d38` | `METHODOLOGY.md` |
| `MissingFeatures.md` | `a6048725f352e683d29f8e9fb08bd046` | `docs/MissingFeatures.md` |
| `OPERATIONS.md` | `7675168d93b27012a5314b5c739927a1` | `docs/OPERATIONS.md` — **rolled 2026-10-27 at the v6.34 ship:** §C4's *An unedited Save & Apply* trap keeps only the as-of move (D-58 closed) and names the save's other normalisations. *(Previously `a127f4a4ff…`.)* Before that, **rolled 2026-10-27 at the v6.33 ship:** §I's *Annual data refreshes* row names the year-keyed tables (a new year's entry, nothing bumped by hand) and §C's OBBBA bullet says `TAX_CONSTANTS_YEAR` is read from `FED_TABLES`. *(Previously `0468ef1e62…`.)* Before that, **rolled 2026-09-09** at the run-folder ops package: §B gained the `mk_runfolder.sh` pointer, and §D gained **D1** (the named existence-only assertion class) and **D2** (the `t29` F-6a/F-6b defect pin). *(Previously `f33c2e0cfd…`.)* |
| `README.md` | `2757b43ee6b39d0f34496c1cf639d688` | `README.md` |
| `TESTING.md` | `bccae6e094f305133d01e840d547427f` | `TESTING.md` |
| `index.html` | `247816be583271d50cf13e0a02e18cdf` | `src/index.html` — the **Vite entry template**, **restored to the pool 2026-08-20** after being found absent (see the build-scaffold row below). ⚠ **Not the built app.** The published single-file `index.html` is repo-only output and never enters the pool; its md5 is in the Current build table and is different by construction |
| `main.jsx` | `d9eca7b469a3fb7ec1c5325fd4bf8145` | `src/main.jsx` |
| `package.json` | `9ee8d745bc9f32d6e8fa02e623603423` | `package.json` — The pinned toolchain, and a **build input** rather than a suite file — given a row 2026-08-23 for a measured reason: `npm i <pkg>` in a run folder rewrites it with resolved versions, so it drifts as a side effect of setting the folder up. That is why OPERATIONS §N3a installs jsdom with `--no-save`, and it is the drift `package_check`'s new G-1 caught on its first real use |
| `vite.config.js` | `30da5708038a1d7c97a4b06777ea8e8a` | `vite.config.js` — The Vite config, pooled under its real name. ⚠ **Corrected at v6.10:** this row read `vite_config.js` and said the pool flattens the inner dot. That was an old session mount's renaming (OPERATIONS §G), never the pool's — every Projects listing since 2026-10-08 shows `vite.config.js` — and K-8/K-12 could not see it because post-ship checks ran against a local pool copy that kept the mount's name. Vite silently ignores a differently-named config, producing a `dist/` of separate files instead of one self-contained artifact (§N1). Build input, same reasoning as `package.json` |

## Prior build (the regression comparison baseline)

| Field | Value |
|---|---|
| Version | **v6.38** |
| Source file in knowledge | — **not pooled**: repo history, commit `65c6b10`, found by this md5 |
| Source md5 | `b82ede24ad13456587358fc2e272c323` |
| Built `index.html` md5 | `a405b665d7b33d70a5f6afe31fdea805` |

> **Rolled 2026-10-30 at the v6.39 ship.** The pair is now **v6.38 prior / v6.39 current**; both tables rolled in one edit (K-7, which counts 639 − 1 = 638). Commit `65c6b10` is the first to carry the v6.38 source (`e8b054a` to `dcdfa69`, earlier v6.38 uploads, carry v6.37's source beside v6.38's page); `f291975` set the executable bit `controls_v638_income.py` landed without.

> **Rolled 2026-10-29 at the v6.38 ship.** The pair is now **v6.37 prior / v6.38 current**; both tables rolled in one edit (K-7, which counts 638 − 1 = 637). Commit `ecde3ff` is the first to carry the v6.37 source (`789ea5c` to `cec4475`, earlier v6.37 uploads, carry v6.36's source beside v6.37's page); `e72757d` set the executable bit `controls_v637_ss_slider.py` landed without.

> **Rolled 2026-10-29 at the v6.37 ship.** The pair is now **v6.36 prior / v6.37 current**; both tables rolled in one edit (K-7, which counts 637 − 1 = 636). Commit `c3c72f0` is the first to carry the v6.36 source (`4a9af8d` to `5e14d8d`, earlier v6.36 uploads, carry v6.35's source beside v6.36's page); `10efc40` set the executable bit `controls_v636_whatbreaks.py` landed without.

> **Rolled 2026-10-28 at the v6.36 ship.** The pair is now **v6.35 prior / v6.36 current**; both tables rolled in one edit (K-7, which counts 636 − 1 = 635). Commit `2762bf7` is the first to carry the v6.35 source (`844f452` to `133c435`, earlier v6.35 uploads, carry v6.34's source beside v6.35's page); `59b8dc4` set the executable bit `controls_v635_irmaa_onetime.py` landed without.

> **Rolled 2026-10-28 at the v6.35 ship.** The pair is now **v6.34 prior / v6.35 current**; both tables rolled in one edit (K-7, which counts 635 − 1 = 634). Commit `39e763d` is the first to carry the v6.34 source (`3b34450` to `d361161`, earlier v6.34 uploads, carry v6.33's source beside v6.34's page); `dc95435` set the executable bit `controls_v634_contrib.py` landed without.

> **Rolled 2026-10-27 at the v6.34 ship.** The pair is now **v6.33 prior / v6.34 current**; both tables rolled in one edit (K-7, which counts 634 − 1 = 633). Commit `045de6b` is the first to carry the v6.33 source (`182b2d3` to `d5702aa`, earlier v6.33 uploads, carry v6.32's source beside v6.33's page); `956ac7f` set the executable bit `controls_v633_table_year.py` landed without.

> **Rolled 2026-10-27 at the v6.33 ship.** The pair is now **v6.32 prior / v6.33 current**; both tables rolled in one edit (K-7, which counts 633 − 1 = 632). Commit `b781d7f` is the first to carry the v6.32 source (`06c6f88` to `1946ccf`, earlier v6.32 uploads, carry v6.31's source beside v6.32's page); `cc8b7e8` set the executable bit `controls_v632_f26_d61.py` landed without.

> **Rolled 2026-10-25 at the v6.32 ship.** The pair is now **v6.31 prior / v6.32 current**; both tables rolled in one edit (K-7, which counts 632 − 1 = 631). Commit `a018e1b` is the first to carry the v6.31 source (`67f2eae` to `91c221d`, earlier v6.31 uploads, carry v6.30's source beside v6.31's page); `7ebd0e7` set the executable bit `controls_v631_mc_irmaa_ai.py` landed without.

> **Rolled 2026-10-24 at the v6.31 ship.** The pair is now **v6.30 prior / v6.31 current**; both tables rolled in one edit (K-7, which counts 631 − 1 = 630). Commit `9eee5a7` is the first to carry the v6.30 source (`ca8ddc6` to `4a3ebe7`, earlier v6.30 uploads, carry v6.29's source beside v6.30's page); `2d41b26` set the executable bit `controls_v630_dollar_units.py` landed without.

> **Rolled 2026-10-23 at the v6.30 ship.** The pair is now **v6.29 prior / v6.30 current**; both tables rolled in one edit (K-7, which counts 630 − 1 = 629). Commit `be4b76f` is the first to carry the v6.29 source (`6a725de` to `8a585f9`, earlier v6.29 uploads, carry v6.28's source beside v6.29's page); `1dc0d49` set the executable bit `controls_v629_model_claims.py` landed without.

> **Rolled 2026-10-22 at the v6.29 ship.** The pair is now **v6.28 prior / v6.29 current**; both tables rolled in one edit (K-7, which counts 629 − 1 = 628). Commit `21a5dde` is the first to carry the v6.28 source (`9a9756c` to `61604d5`, earlier v6.28 uploads, carry v6.27's source beside v6.28's page); `64dc251` set the executable bit `controls_v628_directives.py` landed without.

> **Rolled 2026-10-22 at the v6.28 ship.** The pair is now **v6.27 prior / v6.28 current**; both tables rolled in one edit (K-7, which counts 628 − 1 = 627). Commit `35a1926` is the first to carry the v6.27 source (`d1089c3` to `9255ba2`, earlier v6.27 uploads, carry v6.26's source beside v6.27's page); `310b134` set the executable bit `controls_v627_grade.py` landed without.
>
> **Rolled 2026-10-21 at the v6.27 ship.** The pair is now **v6.26 prior / v6.27 current**; both tables rolled in one edit (K-7, which counts 627 − 1 = 626). Commit `ac5c7d7` is the first to carry the v6.26 source (`b4782c7` to `396f894`, earlier v6.26 uploads, carry v6.25's source beside v6.26's page; `5b78999` also committed 70 stray top-level copies of `qa/` files, removed by `27961be`).
>
> **Rolled 2026-10-21 at the v6.26 ship.** The pair is now **v6.25 prior / v6.26 current**; both tables rolled in one edit (K-7, which counts 626 − 1 = 625). Commit `0859894` is the first to carry the v6.25 source (`2742310` to `c063009`, earlier v6.25 uploads, carry v6.24's source beside v6.25's page).
>
> **Rolled 2026-10-21 at the v6.25 ship.** The pair is now **v6.24 prior / v6.25 current**; both tables rolled in one edit (K-7, which counts 625 − 1 = 624). Commit `115c051` is the first to carry the v6.24 source (`aab7c3d` and `d3ba063`, earlier v6.24 uploads, carry v6.23's source beside v6.24's page).
>
> **Rolled 2026-10-20 at the v6.24 ship.** The pair is now **v6.23 prior / v6.24 current**; both tables rolled in one edit (K-7, which counts 624 − 1 = 623). Commit `aced4a4` is the first to carry the v6.23 source (`cf2803b` and `a03651a`, earlier v6.23 uploads, carry v6.22's).
>
> **Rolled 2026-10-20 at the v6.23 ship.** The pair is now **v6.22 prior / v6.23 current**; both tables rolled in one edit (K-7, which counts 623 − 1 = 622).
>
> **Rolled 2026-10-20 at the v6.22 ship.** The pair is now **v6.21 prior / v6.22 current**; both tables rolled in one edit (K-7, which counts 622 − 1 = 621).
>
> **Rolled 2026-10-19 at the v6.21 ship.** The pair is now **v6.20 prior / v6.21 current**; both tables rolled in one edit (K-7, which counts 621 − 1 = 620).
>
> **Rolled 2026-10-18 at the v6.20 ship.** The pair is now **v6.19 prior / v6.20 current**; both tables rolled in one edit (K-7, which counts 620 − 1 = 619).
>
> **Rolled 2026-10-18 at the v6.19 ship.** The pair is now **v6.18 prior / v6.19 current**; both tables rolled in one edit (K-7, which counts 619 − 1 = 618).
>
> **Rolled 2026-10-18 at the v6.18 ship.** The pair is now **v6.17 prior / v6.18 current**; both tables rolled in one edit (K-7, which counts 618 − 1 = 617).
>
> **Rolled 2026-10-16 at the v6.17 ship.** The pair is now **v6.16 prior / v6.17 current**; both tables rolled in one edit (K-7, which counts 617 − 1 = 616).
>
> **Rolled 2026-10-16 at the v6.16 ship.** The pair is now **v6.15 prior / v6.16 current**; both tables rolled in one edit (K-7, which counts 616 − 1 = 615).
>
> **Rolled 2026-10-16 at the v6.15 ship.** The pair is now **v6.14 prior / v6.15 current**; both tables rolled in one edit (K-7, which counts 615 − 1 = 614).
>
> **Rolled 2026-10-15 at the v6.14 ship.** The pair is now **v6.13 prior / v6.14 current**; both tables rolled in one edit (K-7, which counts 614 − 1 = 613).
>
> **Rolled 2026-10-15 at the v6.13 ship.** The pair is now **v6.12 prior / v6.13 current**; both tables rolled in one edit (K-7, which counts 613 − 1 = 612).
>
> **Rolled 2026-10-14 at the v6.12 ship.** The pair is now **v6.11 prior / v6.12 current**; both tables rolled in one edit (K-7, which counts 612 − 1 = 611).
>
> **Rolled 2026-10-14 at the v6.11 ship.** The pair is now **v6.10 prior / v6.11 current**; both tables rolled in one edit (K-7, which counts 611 − 1 = 610).
>
> **Rolled 2026-10-13 at the v6.10 ship.** The pair is now **v6.09 prior / v6.10 current**; both tables rolled in one edit (K-7, which counts 610 − 1 = 609).
>
> **Rolled 2026-10-13 at the v6.09 ship.** The pair is now **v6.08 prior / v6.09 current**; both tables rolled in one edit (K-7, which counts 609 − 1 = 608).
>
> **Rolled 2026-10-12 at the v6.08 ship.** The pair is now **v6.07 prior / v6.08 current**; both tables rolled in one edit (K-7, which counts 608 − 1 = 607).
>
> **Rolled 2026-10-12 at the v6.07 ship.** The pair is now **v6.06 prior / v6.07 current**; both tables rolled in one edit (K-7, which counts 607 − 1 = 606).
>
> **Rolled 2026-10-12 at the v6.06 ship.** The pair is now **v6.05 prior / v6.06 current**; both tables rolled in one edit (K-7, which counts 606 − 1 = 605).
>
> **Rolled 2026-10-12 at the v6.05 ship.** The pair is now **v6.04 prior / v6.05 current**; both tables rolled in one edit (K-7, which counts 605 − 1 = 604).
>
> **Rolled 2026-10-11 at the v6.04 ship.** The pair is now **v6.03 prior / v6.04 current**; both tables rolled in one edit (K-7, which counts 604 − 1 = 603).
>
> **Rolled 2026-10-10 at the v6.03 ship.** The pair is now **v6.02 prior / v6.03 current**; both tables rolled in one edit (K-7, which counts 603 − 1 = 602).
>
> **Rolled 2026-10-09 at the v6.02 ship.** The pair is now **v6.01 prior / v6.02 current**; both tables rolled in one edit (K-7, which counts 602 − 1 = 601).
>
> **Rolled 2026-10-09 at the v6.01 ship.** The pair is now **v6.00 prior / v6.01 current**; both tables rolled in one edit (K-7, which counts 601 − 1 = 600).
>
> **Rolled 2026-10-09 at the v6.00 ship.** The pair is now **v5.99 prior / v6.00 current**; both tables rolled in one edit (K-7, which counts 600 − 1 = 599).
>
> **Rolled 2026-10-09 at the v5.99 ship.** The pair is now **v5.98 prior / v5.99 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.98 ship.** The pair is now **v5.97 prior / v5.98 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.97 ship.** The pair is now **v5.96 prior / v5.97 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.96 ship.** The pair is now **v5.95 prior / v5.96 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-07 at the v5.95 ship.** The pair is now **v5.94 prior / v5.95 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.94 ship.** The pair is now **v5.93 prior / v5.94 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.93 ship.** The pair is now **v5.91 prior / v5.93 current** (there is no v5.92); both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.91 ship.** The pair is now **v5.90 prior / v5.91 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-02 at the v5.90 ship.** The pair is now **v5.89 prior / v5.90 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-02 at the v5.89 ship.** The pair is now **v5.88 prior / v5.89 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-01 at the v5.88 ship.** The pair is now **v5.87 prior / v5.88 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-01 at the v5.87 ship.** The pair is now **v5.86 prior / v5.87 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-30 at the v5.86 ship.** The pair is now **v5.85 prior / v5.86 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.85 ship.** The pair is now **v5.84 prior / v5.85 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.84 ship.** The pair is now **v5.83 prior / v5.84 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.83 ship.** The pair is now **v5.82 prior / v5.83 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.82 ship.** The pair is now **v5.81 prior / v5.82 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-27 at the v5.80 ship.** The pair is now **v5.79 prior / v5.80 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-24 at the v5.76 ship.** The pair is now **v5.75 prior / v5.76 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-23 at the v5.75 ship.** The pair is now **v5.74 prior / v5.75 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-21 at the v5.74 ship.** The pair is now **v5.73 prior / v5.74 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-15 at the v5.73 ship.** The pair is now **v5.72 prior / v5.73 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-15 at the v5.72 ship.** The pair is now **v5.71 prior / v5.72 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-14 at the v5.71 ship.** The pair is now **v5.70 prior / v5.71 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-11 at the v5.70 ship.** The pair is now **v5.69 prior / v5.70 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-10 at the v5.69 ship.** The pair is now **v5.68 prior / v5.69 current**; both tables rolled in one edit (K-7).
>
> *(Superseded, retained:)* **Rolled 2026-09-10 at the v5.68 ship.** The pair is now **v5.67 prior / v5.68 current**; both tables rolled in one edit (K-7).
>
> *(Superseded, retained:)* **Rolled 2026-09-07 at the v5.66 ship.** The pair is now **v5.65 prior / v5.66 current**. ⚠ This
> table is what `package_check` **K-7** reads, and rolling the Current table WITHOUT rolling this one
> leaves K-7 red with *"Prior is not exactly one release below Current"* — which is what happened on
> the first packaging attempt of v5.66 and is why K-7 exists. Roll both tables in the same edit.
>
> *(Superseded, retained: rolled 2026-09-05 at the v5.65 ship, when the pair was v5.64 / v5.65.)*
>
> *(Kept from the previous roll, because the lesson is the table's own.)* ⚠ **This table was missed on the first pass of the v5.64
> release's packaging and `package_check` K-7 caught it** — the Current table was rolled to v5.64
> while Prior still read v5.62, which is a two-release gap and exactly the both-tables-drift shape
> K-7 exists to catch. It is the fourth time a build table has gone stale in packaging.

> **Rolled 2026-09-03 at the v5.62 ship**, in the same pass as the Current table above — which is
> now asserted by `package_check` **K-1..K-9**, built in the 2026-09-03 ops package after this
> document was left stale at the v5.61 ship.

> **Rolled 2026-09-03 in the post-v5.61 ops package.** Both hashes verified against a fresh clone at
> `8bd0282` and against the pool.
> ✅ **D-4 IS NOW BUILT — `package_check` section K.** The warning that stood here for eleven
> releases is discharged, but **not in the form it was written**. It said "nothing compares the
> manifest's two build tables" and proposed a one-line assertion. That assertion is **K-7**, and
> **it does not fire on the defect that motivated building it**: at v5.61 neither table rolled, so
> Current v5.60 / Prior v5.59 stayed mutually consistent and every internal-coherence check passed
> while the manifest described the wrong build. K-1 through K-6, K-8 and K-9 anchor this document to
> EXTERNAL truth — the clone's CHANGELOG, its source and artifact, and the pool's actual contents —
> and those are the ones that fire. **K-7 ships labelled WEAK and must never be the only guard.**

> **Rolled 2026-09-02 at the v5.60 ship.** Both hashes verified against a fresh clone at `b25af32`
> and the pool before this edit, and the built hash independently by rebuilding v5.59 from its own
> source (§N3a) — it reproduced exactly.
> ⚠ **This table still has no automatic check against the Current table above.** It read v5.51 for
> seven ships and was caught by eye at v5.59. A one-line `package_check` assertion would close it;
> it was raised as v5.60 decision **D-4** and deliberately deferred, because the tool that verifies
> releases should not change in the zip it verifies. **It remains an open ops item**, and this is
> the tenth release in which the gap is recorded rather than fixed.

> **Rolled 2026-09-02 at the v5.59 ship — and it had read v5.51 / `3cf497b8…` since the v5.49 pass
> below, through seven ships that each rolled the Current table above.** Both hashes were
> verified against a fresh clone at `2e6336a` and the pool before that edit.

> **Rolled 2026-08-25 at the v5.49 ship, in the same pass as the Current build table above.**

> **Rolled 2026-08-23 at the v5.47 ship, in the same pass as the Current build table above.** Both
> tables were compared against a fresh clone AND against the pool before the edit was considered
> done, and the outgoing version string was grepped for afterwards. Rotation removed
> `DangerClose-v5_45.jsx` and `dom_entry_v545.jsx`; the pool holds exactly `DangerClose-v5_46.jsx`
> and `DangerClose-v5_47.jsx`.
>
> **Superseded — rolled 2026-08-21 at the v5.42 ship, in the same pass as the Current build table above** — and
> this time the two build tables were compared against the pool as part of the §A2 sweep rather than
> after it, which is the gap the eighth instance below exposed. Both source hashes here were verified
> against a fresh clone of the committed tree.
>
> ⚠ **Rolled 2026-08-20 — EIGHTH instance of this table going stale.** It read **v5.38 /
> `DangerClose-v5_38.jsx` / `b8d12481…`** while the pool held `DangerClose-v5_39.jsx`, so the row
> named a file that does not exist — the same failure as the seventh instance below, which named
> `DangerClose-v5_37.jsx` after rotation removed it. Found on 2026-08-20 **after** a full §A2
> clone-and-diff had reported the hash table clean: that session verified all 44 hash rows against
> pool and clone and never compared these two build tables to the pool at all. **The §A2 sweep does
> not cover the build tables unless you make it.** Verified now against both: the pool holds exactly
> `DangerClose-v5_39.jsx` at `7070018f…`, matching the v5.39 CHANGELOG provenance line.

> **Rolled 2026-08-18 (v5.39 ship).** Both build tables and the §A2 hash rows were rolled together
> in one pass, and this file was searched end-to-end for the outgoing version string before the edit
> was considered done. Verified against a fresh clone of the committed tree, not against session state.
>
> **History of this table going stale — read before the next roll.** At the v5.38 ship it was left
> reading v5.36 while the pool held v5.37 (sixth instance of "roll the whole file or none of it",
> E-14/E-18). It was corrected earlier on 2026-08-18, and then at the v5.39 ship **it went stale again
> in the same way**: the pool files were rotated correctly and this file was not touched, leaving the
> Prior build row pointing at `DangerClose-v5_37.jsx` — a file the rotation had just removed, so the
> row named something that did not exist. Seventh instance.
>
> **The pattern is now unambiguous: rotating pool files and rolling this manifest are two separate
> acts, and the second is the one that gets skipped.** Treat the ship as incomplete until
> `grep -c "v5\.<outgoing>" PROJECT_KNOWLEDGE_INDEX.md` returns only the intended historical hits.

This is the immediately-prior shipped release. The regression suite diffs current against it.
It exists in knowledge ONLY as that comparison baseline. When the next release ships, it rolls
OUT (see the rotation in POST_BUILD_CHECKLIST.md) — its full history lives permanently at its
commit history, so nothing is lost. (This project does not use git tags — see OPERATIONS.md §G. From v5.12 forward each CHANGELOG entry ends with a provenance line carrying that release's source and built md5s; for earlier releases, identify a retired source by reading it out of the commit that shipped it.)

**Exactly two `.jsx` files live in knowledge at once: current + prior. Never a growing pile.**

---

## Everything else in knowledge (single-and-current — no version suffix)

These are refreshed in place when they change; git holds their history.

| File | What it is | Refresh when |
|---|---|---|
| `CHANGELOG.md` | Cumulative release log, newest first | every release |
| `METHODOLOGY.md` | Modeling methodology | releases that change modeling (**updated at v5.12** — per-spouse RMD/survivor section now states which engines implement it; two survivor-year simplifications and one IRMAA limitation disclosed). **Corrected at v5.49** — the SSA-44 passage named five of the eight life-changing events and said the list *"includes"* them; it now states there are **eight** and that the list is **closed** (20 CFR 418.1205), and that a Roth conversion, a capital gain and a home sale are none of them. ⚠ **This file is now a TEST INPUT**: `t31` reads it, so an edit here that drops a key phrase turns a suite red |
| `TESTING.md` | Suite description + counts | when the suite changes. **v5.49: 2,559 app checks, 0 failing** (prior leg 939 · current leg 942 · parity 10 · feature run once 668) · tooling 82 · **2,641 total** · `smoke_built` 16/16. Totals computed from suite output, never restated |
| `README.md` | Repo/setup README | when it changes |
| **Test files — enumerated, never elided.** A range written as "t1 … t9" hides whatever sits inside it; `t10` was invisible for exactly that reason. Every file gets its own line. | | |
| `t1_units.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Units & statics (asserts the four in-app version strings — a stale bump fails here). **+16 at v5.33:** the `taxableGainPct` field and its default, the `taxableGainShare` export, a nine-case clamp table hand-verified input by input, and **AST** checks that the accessor is defined once and called by NOBODY. The call-site check is deliberately an AST node count, not a line match — two of the three textual occurrences at v5.33 are comments | when tests change |
| `t2_engines.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engines + **cross-version MC parity** (`compare` must stay **9/9** *(10/10 since v5.48 — the `stateTax` key; corrected at the census of 2026-10-08)* — it was 8 until the E-15 addendum of 2026-08-14, which added the premium-positive ACA household). Carries TWO fingerprint households: the original derives from `PORTFOLIO()`/`PLAN_TIMELINE()`, the ACA one is **fully explicit and must stay that way** so example-data changes cannot silently rewrite the fingerprint | when tests change |
| `t3_roth.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Roth engine | when tests change |
| `t4_dom.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — 26-tab DOM walk. **+17 at v5.24:** extinction assertions on the corrected Withdrawal Priority 1 copy and the Field Manual. The six manual checks read the iframe `srcdoc` attribute, NOT `textContent` — `DOCS_HTML` reaches the DOM only through `<iframe srcDoc>`, so a textContent read passes vacuously on both builds. Negative-controlled at 15/17. **+17 at v5.33:** the embedded-gain panel in My Data — render, label copy verbatim, Save & Apply write-through, clamping. **INVERTED and GATED PER LEG at v5.36** (210 current / 199 prior): the v536 leg asserts the in-use copy, the brokerage-scoped label (scope §9), the share-0 disclosure, the E-16-fixed footnote, and EXTINCTION of the recorded-not-used and %-of-taxable-pool copy; v533–v535 legs keep asserting the copy their builds are true to, and the prior leg GAINS one assertion pinning its $0-gains footnote. Re-query the input after every save — React replaces the node and a held reference types into a detached element | when tests change |
| `t5_storage.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Persistence / storage contract (incl. the 13-key Clear-All wipe loop). **+14 at v5.33 (group E):** `taxableGainPct` persists through Save & Apply, restores as 0 from a simulated pre-v5.33 backup that lacks it, normalises an unparseable value to 0, survives a backup-bytes round trip at a user-set 40, and is clamped by the accessor at an out-of-range 200. The bytes round trip is JSON, not the Export button: `handleExport` serialises `buildPortfolio()` — the FORM state — so driving the real button after mutating the module global exports the old value. `t4` owns the control-driven half | when tests change |
| `t6_single.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Single-filer branch | when tests change |
| `t7_accrual.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Contribution accrual (v5.10 feature suite, 41). **v5.37: E-17 sweep** — object dobs converted to the strings the run resolves to; measured no-op (stdout byte-identical; the arithmetic is retireYear-driven) | when tests change |
| `t8_invariant.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Invariants; reads canonical `DangerClose.jsx` from the run-folder root | when tests change |
| `t9_dom_smoke.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — DOM smoke (fast environment validation — run this first to prove the toolchain) | when tests change |
| `t11_survivor_rmd.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Survivor RMD / filing-transition suite — **40 checks**. DOM-read at ±$500 (OPERATIONS §M); its header carries the two honesty notes on precision and on the effect size that makes that band adequate | when tests change |
| `t12_engineD_survivor.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engine D survivor suite — **23 checks**, module-level and dollar-exact. ⚠ **Release (c) of the `otherAccounts` plan moves Engine D's balances, so this is the suite that must be re-verified case by case there** | when tests change |
| `t13_engineC_irmaa.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engine C IRMAA survivor extinction invariant (C-2C-5, v5.13) — 42 checks, three omissions, both directions, plus a person-count isolation case | when tests change |
| `t14_cross_engine_survivor.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Cross-engine survivor SS invariant (decision D-5) — **44 checks**; the only cover for Engine A is structural, and the file says so. **D-4 addendum 2026-08-14:** source windows are **bounded** (anchor → start of the next top-level function), not fixed character spans — a span ages as the engine grows around the rule and then fails looking like an app regression. Both bounds asserted unique; a missing end marker fails loudly, never falls back. ⚠ **From v6.12 (C-5) Engine D HAS a filing concept**, and the check moved as this row said it must: Engine D is in `filingEngines`, and its window must hold exactly ONE `yr > _deathYr1D` (the filing switch) and both `>=` death guards — a weakened guard still fails (negative-controlled at the v6.12 build). Through v6.11 it asserted the absence of any `>` | when tests change |
| `t16_roth_ladder_filing.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Roth ladder filing-status extinction invariant (C-2B-3, v5.15) — 24 checks against an independent IRS reference, incl. that the couple's ladder does NOT move | when tests change |
| `t17_engineC_exact.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engine C dollar-exact (v5.18) — **74 checks at v5.36** (+11: the `gainByYr` consumption block — exact MAGI and headroom pass-through, tier climb, default equivalence; control C9 fires 5 of them). Originally 63 checks against CMS figures via the module-level `computeIrmaaPlan`; tier borders ±$1, indexation, freeze, lookback, per-person counts, survivor switch, QCD. Negative-controlled at 23/63. Asserts the surcharge constants' ≤$5 **bound**, not CMS-exact amounts | when tests change |
| `t18_engineB_exact.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engine B dollar-exact (v5.21) — **67 checks at v5.36** (+17: the `gainByYr` consumption block, hand-exact — $10K gain → MAGI +$10,000, ordinary tax +$0, LTCG +$1,500, NIIT +$380, total +$1,880 — and the E-16 provisional-income fix pinned at the 85% statutory cap; controls C8 and C12 fire it). The v5.21 note 'NOT yet covered: LTCG, NIIT' no longer holds — both are exercised by the gain path. Originally 50 checks via module-level `computeTaxPlan`; federal brackets, age-65 extra per spouse, SS taxability, **plus the first Engine A vs Engine B agreement invariant** (they agree). Negative-controlled at 24/47. NOT yet covered: LTCG, NIIT, AMT, FICA, state, survivor | when tests change |
| `t19_engineD_exact.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **65 checks at v5.37** (+8): two exact pins (mixed-household lifetime MAGI $3,162,820 — the ordinary growth recognised, was $3,132,746 — and lifetime gain $89,673 UNCHANGED, the census-verified blast-radius witness), an in-suite INDEPENDENT LEDGER (own IRS Pub 590-B divisor table) that must reproduce the published pool/sub-pool/gain/basis to the cent every year before its report is trusted, and the §8-3 conservation report (one-sided `taxOrd + taxGainPool ≤ taxable` all years; the growth cap binds ZERO years — control C13 fires it). Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. ⚠ The pin needed a **purpose-built household** — two earlier drafts written against `t19`'s own fixture asserted nothing, because `drawNeeded` exceeds `rmd_y` in every year of that schedule, so every taxable draw it makes is genuine. The defect requires guaranteed income large enough to cover expenses. **57 checks at v5.36** (32 at v5.35): the v5.36 block asserts the gains-bearing sub-pool as a balance to the cent — the discriminating MIXED pool (brokerage + IRA + HSA, the shipped example's own shape, E-20), a hand-computed sale, full-basis surplus banking, basis conservation, and the exact-zero exclusion comparison — and the two Engine-B/C consumption EXTINCTION scans were INVERTED in the same release the wiring landed, plus a C-specific `_gainByYrI` binding. Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. Flipped at v5.35/v5.36 as instructed. **Originally NEW at v5.23** — Engine D's first discriminating coverage. 14 checks: five structural (reachability, the 17-key return contract, determinism, parameter purity) and eight fixture/pinned. Three dated `[KNOWN DEFECT]` pins (taxable pot == all of `otherAccounts`; `magi` omits taxable draws; named-IRA money never reaches the RMD balance). Negative-controlled twice — 12/13 and 11/13. Not yet dollar-exact; that is release (b)/(c) work. **AMENDED at v5.24:** the B-2 pin was re-tagged `| rel c` and reworded. It previously read "Engine D magi omits drawFromTaxable" tagged `rel b`, which named something that is CORRECT and instructed the next session to introduce a defect. The assertion itself was right and is unchanged. Repo `qa/` |
| `domdiff_withdrawal.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **Re-pointed and RE-SCOPED at v5.37 to v5.36 → v5.37, 29 checks: ALL THREE tabs at STRICT IDENTITY** — Taxes/IRMAA because the census shows v5.37 cannot reach Engines B/C, the Withdrawal tab because lifetime MAGI rises $3,333 on the example household but never crosses a bracket edge (measured — inverting the session's own stop-report prediction). The identity form still witnesses the call sites (a dead site on either leg desynchronizes the figures and fails loudly — C10/C11 verified against it); the release's divergence witness lives at the engine level (t19/t20 pins) per E-20. Historically: **re-pointed and re-scoped at v5.36 to v5.35 → v5.36, 26 checks**: the Withdrawal tab returns to STRICT IDENTITY (the v5.36 tracker is bookkeeping on an unchanged schedule — measured, inverting the session brief's premise), and NEW Taxes/IRMAA sections assert figures-only-region divergence — the ONLY witness that the app's call sites pass `gainByYr` (every suite calls the engines directly). Those regions are anchored PAST all changed copy because the naive whole-tab form was satisfied by copy alone and its control did not fire (E-20); controls C10/C11 now fail exactly the two witness checks. Historically: re-pointed at v5.34 to v5.33 → v5.34. ⚠ At the v5.34 build its committed default was found four releases stale (v5.29 → v5.30) and it **died at module load** looking for a bundle the run folder does not hold — a stale default here fails loudly rather than silently, but it fails as a missing module, which reads like a broken harness. Re-point it every release. Previously **re-pointed at v5.24 to v5.23 → v5.24 and grown 4 → 10 checks**. It now excises the one deliberately reworded panel BY ANCHOR and requires everything else byte-identical, rather than relaxing the comparison — and separately asserts the panel did change and that only the prior build carries the false claim. **It hardcodes its default version pair; re-point it every release.** Originally new at v5.23, v5.22 → v5.23. **This is the proof the hoist changed nothing**, because the pre-existing suite does not discriminate on Engine D (OPERATIONS §B2). 4 checks; cross-version by nature, so NOT counted in the release headline. Repo `qa/` |
| `t21_tools.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **NEW 2026-08-11** — tests the `qa/tools/` parser toolkit itself against a fixture with hand-counted known answers. **56 checks, negative-controlled eleven ways** (the original six, plus five in `controls_t21_censusp1.sh`). ⚠ **It covers FOUR of the sixteen acorn-parsing tools in `qa/tools/`, and Section F is a pin, not a fifth** — `TESTING.md` names the twelve it does not reach and why. Counted SEPARATELY from the app total: it verifies tooling, not the build. Carries one dated `[KNOWN DEFECT]` pin — `census.cjs` double-reports object shorthand and export specifiers, so its "hits" exceed its site count. Repo `qa/` |
| `tools_fixture.jsx` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **NEW 2026-08-11** — the fixture `t21` reads. **NOT AN APP SOURCE**: never built, never imported, never version-bumped, and it does NOT count toward the "exactly two `.jsx` app sources" rule. Repo `qa/tools/fixture/fixture.jsx`; knowledge is flat so it lives here under this name, and `t21` resolves either. Line numbers are load-bearing — add cases at the END only |
| `t22_aca_floor.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **75 checks at v5.34** (was 64): group H unit-tests the shared `realizeGain` rule directly, including that selling alone never moves the gain share — chosen over comparing two engines' figures and hoping agreement implies a shared rule. Run it as `node t22_aca_floor.mjs v533`; its committed default is still `v532`, unrolled. **NEW at v5.32** — the ACA 100%-of-FPL eligibility floor. **Was 64 checks** in seven groups: the floor as an `[EXTINCTION]` set in BOTH regimes; regime symmetry; the boundary hand-computed to the cent from HHS/ASPE and Rev. Proc. 2025-25 typed independently; the drift case; Engine A end-to-end on a household crossing the floor twice at two depths; **group F, the cross-version byte-identity check on `acaSubByYr`/`totAcaLoss`/`estate`**; and five negative controls, all firing. ⚠ **Group F exists because parity is blind here** — `t2`'s fingerprint household is `acaPremium: 0`, so no ACA code runs inside the guardrail at all (E-15). Do not delete it as redundant; the file's header says so too. Group F reads the PRIOR leg's bundle and defaults to **`v532` at v5.33** (rolled forward, like `t2`'s parity pair). ⚠ **Rolling that default is not sufficient on its own.** Group F mixes claims true for ANY pair (byte identity) with one true for a SINGLE transition — *"acaFloorYrs is NEW"*, which is false once the prior build is v5.32. That check is now **gated on the prior tag**, so the suite holds at 64 on either pairing. The rotation forces the roll: v5.31 left knowledge at v5.33, so `app_v531.mjs` can no longer be built from knowledge alone. Repo `qa/` |
| `t23_roth_ladder_rmd.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Roth ladder RMD term (v5.41). MAGI at ±$500 (§M component-inline ceiling), RMD cards dollar-exact. Gated per leg. **Unchanged in substance at v5.42** — only the version registry moved; its 25/25 on both legs is the evidence that release did not overreach | when tests change |
| `t24_ss86_phasein.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **NEW at v5.42.** The §86 upper-tier phase-in. ⚠ **DRIVES THE CONVERSION SLIDER** through the native `HTMLInputElement` setter — the defect is worth $0 at the $70,000 default, so default-position assertions prove nothing about it. Five positions × 12 years against `statute86`, computed not hardcoded. Gated per leg (38 v542 / 34 v541). §D tests the shared §86 helper from v5.77 (it tested a dead transcription v5.45–v5.76) | when tests change |
| `hand_86.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **The §86 statutory oracle**, transcribed from 26 U.S.C. §86 at law.cornell.edu and NOT from any app expression. Imported by `t24` and by `qa/tools/derive_v542.mjs` — one oracle on both sides, deliberately. ⚠ Its three embedded app copies are **v5.40 transcriptions and now history**. Asserts nothing; counted in no total. Repo `qa/tools/` | when the statute or the app copies change |
| `controls_source.sh` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) — The source-level control harness. **Replaces `controls_v542.sh`, DELETED from both destinations 2026-08-23** — the same rotation `controls.sh` got at v5.42, for the same reason: keeping both invites someone running the dead one. Version deliberately absent from the name |
| `t20_other_taxtype.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **100 checks at v5.37** (+1): the exact E2 pin moved $600,000 → **$724,266** (the balance plus its growth — derived by the independent simulator BEFORE the engine edit, matched to six decimals) and a new **E-15 EXTINCTION** (the ordinary excess must EXCEED the opening balance). The trad−annuity exact-0 pin survived the edit at 0.000000 and is documented as REGIME-BOUND (full pool exhaustion) in the fixture. E-17 closed: the dobs are now the strings the run resolves to (1964-01-01/1966-01-01), measured value-identical across all five engines and all eight households. Historical: **NEW at v5.25** — the Other-accounts `taxType` schema, its migration, and the extinction assertion that no engine reads the field. 94 checks. The extinction check is a **permutation test**: the same household runs twice with every type flipped and all five engines must return byte-identical output — so it fires the moment release (c) starts reading the field. Also carries the required equality that inference over the example household reproduces the $111,000 / $21,000 / $15,000 split v5.24 published. Negative-controlled five ways; two of its own assertions were caught passing vacuously on v5.24 and now assert a precondition first. Repo `qa/` |
| `dom_entry_v552.jsx` | Harness entry for the v5.52 CJS DOM bundle (**prior** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `dom_entry_v553.jsx` | Harness entry for the v5.53 CJS DOM bundle (**current** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `dom_entry_v546.jsx` | Harness entry for the v5.46 CJS DOM bundle (**prior** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `runsuite.sh` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **NEW at v5.36 — adopted from session tooling.** Runs both legs, parity, feature suites and tooling, and PARSES every total from suite output (the honesty standard: totals are computed, never restated). A suite printing no count with a non-zero exit reports DIED, not 0/0. Repo `qa/` |
| `capture_gain_fp.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **Probe, not a suite — asserts nothing and is counted in no total.** Captures a full-precision fingerprint of every engine that touches the realized-gain rule, which is how `realizeGain`'s extraction was proven a behaviour no-op before any behaviour changed (OPERATIONS §M pattern). Repo `qa/` |
| `probe_withhold_gain.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — **NEW at v5.34. Probe, not a suite — asserts nothing and is counted in no total.** Reproduces the measurement behind the v5.34 copy correction: under `convTaxFunding: "withhold"` it runs Engine A at three conversion sizes and two declared gain shares on both legs, showing that a residual bill reaches the brokerage and is taxed. Run it as `node probe_withhold_gain.mjs ./app_v534.mjs`. Repo `qa/` |
| `SCOPE_OPS_PROCESS_FIX.md` | *(new 2026-08-26)* | `docs/SCOPE_OPS_PROCESS_FIX.md` — ☑ **RETIRED: BUILT AND SHIPPED 2026-08-26** as an ops package against v5.51. `OPERATIONS.md` §A0/§I/§L. ⚠ Its §0 records that the finding which motivated it — "8 of 11 scopes missing retirement notes" — was **wrong**, and why; kept as an instance of §A0. The suite check it proposed was deliberately NOT built — see its §3 before re-proposing one *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_D9_HEIR_RATE_DISCLOSURE.md` | *(new 2026-08-26)* | `docs/SCOPE_D9_HEIR_RATE_DISCLOSURE.md` — ☑ **RETIRED: BUILT AND SHIPPED AS v5.51.** All four decisions resolved as recommended. Carries a retirement note; its §1–§2 describe v5.50 and are history, not current state *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `ASSESSMENT_HEIR_RATE.md` | *(new 2026-08-26)* | `docs/ASSESSMENT_HEIR_RATE.md` — **un-pooled 2026-10-11, repo-only** (removed from the pool that day; recorded by the ops package of 2026-10-11, second). ☑ **ACTED ON at v5.51.** ⚠ **SUPERSEDED IN PART:** shipped unannotated in the very release that fixed it, and its §8 Option 1 recommends moving `HEIR_RATE` into `TAX_CONSTS` — the option that was examined and REJECTED. Annotated in place 2026-08-26. §3–§7 (the law, the measured rates, the flip point) stand |
| `SCOPE_D7_ESTATE_DISCLOSURE.md` | *(new 2026-08-26)* | `docs/SCOPE_D7_ESTATE_DISCLOSURE.md` — ☑ **RETIRED: BUILT AND SHIPPED AS v5.50** *(was: ALL FOUR DECISIONS RESOLVED 2026-08-26 — BUILDABLE as v5.50.** D-1: narrow the label to `MAX ESTATE AFTER HEIR INCOME TAX`. ⚠ **D-2 decided AGAINST the recommendation — the clause names NO state and NO threshold**, because a clause quoting Oregon's $1M is a clause that goes stale, and Oregon's SB 1511 was already pending. The scope's §1 figures are rationale, **not copy**. ⚠ Nothing in `qa/` asserts the objective label today (zero hits) — the narrowed label must be pinned in `t1` STATIC or it can silently revert. Premise verified against **v5.49** source. The comparator's estate figure (L4251) contains **no estate or inheritance tax of any kind** — `HEIR_RATE` 0.22 is an heir *income* tax on Traditional only. It is the **DEFAULT ranking objective** (L5386) and is labelled **"MAX AFTER-TAX ESTATE"** (L9518), a phrase that asserts the very thing that is untrue. ⚠ **Worse than D-6 was: NEITHER half exists** — `METHODOLOGY.md` has zero mentions of estate tax, the Field Manual has zero, and the only in-app estate limitation text (L10786–10789) is gated to `single`, so a **couple never renders it**. Direction **OPTIMISTIC**. Disclosure-only; no engine change. Reuses `t31` (third key) and adds a `t4_dom` assertion with `single: false`, because a couple-blind fixture would reproduce the defect. **Four decisions open; D-1 (the "after-tax" label) is the one that matters** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| **TWO DELETIONS** *(2026-08-26)* | — | ☑ **`validation/PROJECT_KNOWLEDGE_INDEX.md` deleted** — a second copy of this manifest, referenced by nothing, frozen at v5.49 and 47 lines adrift. `OPERATIONS.md` §G now requires exactly one manifest at the repo root. ☑ **`docs/SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` deleted** — built 2026-08-20, never retired, missed by the sweep below. Its outcome survives: `CHANGELOG.md` carries the entry and four suites still assert the invariant; only the decision record is gone. ⚠ **Delete it from the knowledge pool too** — §G, deletion is a three-place operation |
| **SCOPE-RETIREMENT SWEEP** *(2026-08-26)* | — | ⚠ **Seven `SCOPE_*.md` were built-and-shipped while still advertising themselves as open; all seven are now RETIRED.** `FIX_realized_capital_gains_v5_32` (shipped **v5.36**, said *"Ready to build"* — 13 releases), `FIX_docs_v5_39` (**v5.39**, said *"do not build"*), `FIX_roth_tab_rmd_magi` (**v5.41**, said *"not yet built"*), `ENGINE_C_SS86` (**v5.43**, said *"Buildable"*), `ITEMS_3_6_perRmd` (**v5.44**/**v5.47**, said *"NOT BUILDABLE — two blocking"*), `ENGINE_B_ROTH_HALF_CAP` (**v5.45**, said *"both blocking"*), `ROTH_TAB_MAGI_MEASUREMENT` (fulfilled). ⚠ **Two said DO NOT PROCEED about shipped work.** ⚠ **This file already knew:** its own rows called `ENGINE_C_SS86` *"fulfilled at the ship"* and `ITEMS_3_6_perRmd` shipped — while those scopes said otherwise, and nothing compared them. Still genuinely open: `SCOPE_STATE_FIXTURES.md` (awaiting §5 decisions). *(This row also named `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` — **built**, D4 open, non-blocking, and the only status line in the set that was accurate. That file was **deleted 2026-08-26**; its open D4 is re-homed as `MissingFeatures.md` **D-10**, and the file itself is recoverable from git history at the commit before its deletion.)* Rule recorded in `OPERATIONS.md` §I |
| `validation/` *(repo-only, not in this pool)* | ⚠ **Audited for the first time 2026-08-25**, as the Section E remainder's `validation/` ↔ `qa/` question. **Not the release gate**; §I does not ask for it, deliberately. **Layer 1 `check_constants.mjs` is LIVE: 48 checks, 0 failing at v5.49**, each with a statutory citation, covering constants `qa/` does NOT touch (`SGL_LTCG`, `SGL_NIIT`, partial-SS count, QCD cap) — 48 passing checks that appear in no count anywhere. **Layer 2 was UNRUNNABLE** since `package.json` gained `"type": "module"`; renamed `run.js`→`run.cjs` (byte-identical) and **five of six tests now run**. ⚠ **`deep_test` CRASHES** on a moved Roth solve-for button — that directory's only modelling assertions are unchecked. ⚠ `run.cjs` is a **tenth** jsdom environment (E-6 counts nine, correct for `qa/`), never audited against §C's traps. ⚠ Open: `smoke_entry` reports 2 `/bucket|glide/i` hits — a product-vocabulary call, left for the maintainer |
| `VERIFY.sh` | — **un-pooled 2026-10-11, repo-only** (removed from the pool that day; recorded by the ops package of 2026-10-11, second). ⚠ **RETIRED 2026-08-25 at v5.49 — it no longer runs and is NOT the release gate.** It was pinned to `v537`/`v538` (**eleven releases stale**) and **`OPERATIONS.md` referenced it zero times** — a script at the repo root calling itself "release verification" while sitting outside the release process. Found during the Section E remainder sweep, not by any check designed for it. Replaced by three checks §I already required: the **full suite from a clean clone**, **`smoke_built`**, and **`package_check`**. The file is kept for its record of why each control existed, and for one caveat that outlived it (parity must run AFTER the prior leg). It prints an explanation and exits 2. ⚠ **Do not revive it by rolling the version pair forward.** Originally added to knowledge at v5.23 because it was repo/local only. Repo root |
| `t15_engineA_death_filing.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Engine A death-year filing extinction invariant (C-2C-6, v5.14) — 11 checks, **dollar-exact** (module-level engine), incl. the non-conservative high-MAGI corner | when tests change |
| `t10_taxcases.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — Tax-case assertions built by the Phase 2 audit: 76 federal-core (2A) + 35 IRMAA (2B) = **163** at v5.30 (2A 76 · 2B 87 · 2D 27 · 2E 21), incl. 3 dated `[KNOWN DEFECT]` pins. **ADOPTED into `run_all.sh` at v5.14** (scope D-4); pins flipped, borders re-derived, now 115 checks | when audit phases add cases |
| `smoke_built.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — The **built-artifact** suite — **16 checks** against the published single-file `index.html`, not the source: boots it, dismisses the disclaimer gate, mounts React, loads the example household, and round-trips the `window.storage` shim. Added v5.11 after a build passed every source check while being unable to save a plan | when tests change |
| `qa-baseline-README.md` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — How to run the baseline suite (renamed from `qa/qa-baseline/README.md` for the flat pool). ⚠ **The `docs/qa-baseline-README.md` DUPLICATE was deleted 2026-09-07 (H-3)** — the real file is `qa/qa-baseline/README.md` and this pool copy is the flattened name, both legitimate. ⚠ **A CONSEQUENCE WORTH KNOWING:** until the deletion there was exactly one repo path with this basename, so `package_check` E-1b could resolve this pool file to a counterpart. There is now **none**, so E-1b skips it — it joins `tools_fixture.jsx` and `vite_config.js` as the three pool files E-1b is blind to **by rename** *(⚠ v6.10: the pool's name is `vite.config.js`, so that one was never renamed — the mount's name was read as the pool's)*, which is E-1b's documented `cands.length !== 1` rule and not a new defect. Recorded so nobody discovers it as a surprise | when it changes |
| **qa-baseline harness files** | **repo-only from 2026-10-19 (qa/ un-pooled; each file's description in `TESTING.md`'s per-file index)** — `shim.txt`, `mk_testable.sh`, `env_dom.mjs`, `run_all.sh`, `cap_tabs.mjs` — the `dom_entry_*` files are listed individually above, current + prior only | when they change. NOTE (v5.10.2): stale knowledge copies were re-synced from the committed repo at that refresh. The repo is their source of truth. |
| **`qa/tools/` parser toolkit** | **repo-only from 2026-10-19 (qa/ un-pooled; each file's description in `TESTING.md`'s per-file index)** — `funcmap.cjs` (function boundaries — line numbers move every release), `census.cjs` (identifier/property/string hits with enclosing scope chain), `diverge.cjs` (normalized-fingerprint duplicate detection), `residual.cjs` (narrow: `balance − roth − trad`; ages out after release (c)). All four named explicitly per §G — a folder reference makes them invisible. They live in `qa/tools/`, **not** `qa/`, because they assert nothing and must never be countable as checks. **Tested since v5.25 by `t21_tools.mjs` (50 checks) against `tools_fixture.jsx`**, negative-controlled six ways; one pinned defect (AST hits vs source sites) is disclosed by reporting both counts since v5.29. Census and site-count questions go through these, never greps (OPERATIONS §B1) | when the tools change |
| **build scaffold files** | `index.html` (the Vite HTML entry template), `main.jsx` (the browser bootstrap), `vite.config.js`, `package.json` — all four, per OPERATIONS §G. Without all four a session working from knowledge **cannot produce the published `index.html`** (the v5.11 failure). ⚠ **The pool held only three of the four until 2026-08-20.** `index.html` was missing — this row asserted all four for eleven releases while the pool never carried the template, and no check compared the claim to the pool because the §A2 table had no row for it either. It matters more than a missing file usually would: that template carries the entire **first-open disclaimer gate** (credentials disclosure, pessimism notice, acknowledgement checkbox), which exists **nowhere** in `DangerClose.jsx`, so a knowledge-only rebuild would have published the app with no gate. Restored at md5 `52ef2be3080352df6198ee3b8c3507ad`; `qa/smoke_built.mjs` asserts the gate renders and dismisses, so the failure would have been loud at the built-artifact suite rather than silent in production. ⚠ **`vite.config.js` is written with a DOT** — the session mount displays it as `vite_config.js`; that is a mount artifact, not the pool name (verified 2026-08-10: same file, md5 `30da5708038a1d7c97a4b06777ea8e8a`). It is the only file in the pool where the mounted name differs from the real one | when the build setup changes |
| `SITE_CENSUS_v5_10.md` | Code census (self-versioned by filename). ⚠ **Not in the pool** as of the 2026-08-20 clone-and-diff — it lives in the repo at `docs/SITE_CENSUS_v5_10.md`. Row kept and marked rather than deleted: whether the pool should carry it is the maintainer's call, and a silently-dropped row is how files become invisible | new one per feature *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_STANDING_AUDIT.md` | Reusable audit spec (not version-specific) | rarely |
| `OPERATIONS.md` | **The operational appendix, §A–§N** — freshness check, suite layout, harness traps, defect pins, parity guardrail, ship verification, storage/rotation, release checklist, packaging, instrumentation ceiling, and the `index.html` build. **Read it before any build, fix, scope, or release, starting with §A.** | when mechanics change |
| `PROJECT_KNOWLEDGE_INDEX.md` | This manifest | every refresh |

---


### ⚠ Added 2026-09-03 — pool tooling that had no manifest row

Found by the same sweep as the block in *Audit findings and scopes*. Enumerated, never elided.

| File | What it is | Refresh when |
|---|---|---|
| `controls_v562.sh` | §B2 controls for the **v5.62** cross-engine wiring fix. Six; **C1a and C1b revert the defect's two halves SEPARATELY**, because a partial fix would otherwise pass — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v564.sh` | §B2 controls for the **v5.64** income-conditioning evaluator. Ten, all firing. **Two of them are the point**: forcing every table to a single comparator (each direction), and subtracting Virginia's taper excess PER SPOUSE rather than once — an error wrong by a factor of two across the whole phase-out range and correct everywhere else, so it survives any two-sided test. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v565.sh` | §B2 controls for the **v5.65** Connecticut populate. Eleven, all firing. **Three are the point**: dropping `exclAge` so the engine's default 65 floor silently reappears (the pessimistic failure the release removes); flipping the comparator to `lte`, which is what makes the threshold pins load-bearing; and reverting the note's dividend/interest disclosure — **that one did NOT fire on first run and exposed a blind assertion in `t35`, which was repaired**. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v563.sh` | §B2 controls for the **v5.63** earned-only-FICA fix. Five, all firing (C1 11, C2a 2, C2b 11, C3 9, C4 2). **C2a and C2b simulate the two HALF-fixes** by pushing the unfiltered total back into one FICA site at a time — the engine has two sites and one source edit corrects both, so a control reverting them together proves nothing about either. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v561.sh` | §B2 negative controls for the **v5.61** RI threshold correction. Six, incl. a null control and one that falsifies the pre-fix pin on the FROZEN leg to prove the version gate is a split, not an inversion — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v560.sh` | §B2 controls for the v5.60 RI/WI age-floor release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `controls_v559.sh` | §B2 controls for the v5.59 figure release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `controls_v5571.sh` | controls for `package_check` itself — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | when `package_check` changes |
| `controls_v557.sh` | §B2 controls for the v5.57 rate release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `copylock.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — §B2 disclosure-lock probe — finds assertions that pin copy a release is about to falsify | when the lock class changes |
| `lits.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — literal/string extractor over the suite (§B1a) | rarely |
| `notes_probe.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — AST probe pulling `STATE_RULES` note strings out of two builds and comparing | when the state-note work continues |
| `vergates.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — counts version gate chains and registries — the version-bump cost (§A0: re-derive, never quote) | rarely |
| `sel_census.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — `qa/tools/sel_census.cjs` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** AST census of every regex literal in the suite and tools whose pattern matches *income limit* / *income-limited* — i.e. every site that selects a state set by **executing a pattern against user-facing copy**. It is the measurement behind `SCOPE_STATE_SET_SELECTOR.md`, and it is a parser because the question is a parser question: a grep cannot tell a definition from a mention and cannot execute a regex (§B1). Asserts nothing; counted in no check total | when the selector scope is built, and per release that adds a selection site |
| `row_census.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — `qa/tools/row_census.cjs` — **NEW 2026-09-08.** The parity check for `K-8`'s hash-row expression, which exists in **three** places that must agree: the gate, this file's D-5 count block, and `controls_manifest_rows.py`'s target selector. ⚠ **It is the condition on which decision D-3 was taken** — keeping this file's block pasteable rather than replacing it with a pointer was only defensible because something now checks the two copies against each other. ⚠ **Parser, not grep** (§B1): a site is admitted only if its pattern, **executed**, matches a canonical row AND encodes the extension set — a first draft required only the first and reported 35 sites, most of them generic patterns matching the specimen by accident. Exits 1 on drift, 2 if a site cannot be found — **repair it rather than deleting the site from `SITES`**, or the check goes quietly blind. `P32`'s narrower selector and `SCOPE_HOUSEKEEPING_THREE.md`'s pre-`D-C-1` copy are excluded BY NAME, as a decision (D-4, D-5) rather than an oversight. Asserts about the TREE, not the app; counted in NO check total | when `K-8`'s matcher changes, or a fourth copy appears |
| `oracle_nm.py` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — `qa/tools/oracle_nm.py` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** The independent implementation of NMSA 1978 § 7-2-5.2, typed from `FINDINGS-v5_63-state-statutes.md` §2 and **never read off `STATE_RULES`** — it derives `t10`'s expected New Mexico cells without reading the figure off the thing under test, the same role `hand_86.mjs` plays for §86. ⚠ **`t10`'s own comment at L1133 names it `qa/oracle_nm.py`; the file is at `qa/tools/oracle_nm.py`** (`TESTING.md` has it right). Reported 2026-09-08, not fixed — a suite edit is outside an ops package's lane | when NM's statute changes; re-read against the primary source, never against the app |
| `oracle_va.py` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — `qa/tools/oracle_va.py` — **NEW 2026-09-09.** The independent implementation of Va. Code § 58.1-322.03(5)(b) — the age deduction — typed from `FINDINGS-v5_63-state-statutes.md` §5 and **never read off `STATE_RULES`**. It reproduces the statute's three extinction points ($62,000 / $87,000 / $99,000) as a derived result rather than a transcription, which is the check that it is right. ⚠ **Its point is the once-not-twice mechanic.** It carries BOTH readings — the correct one-subtraction-against-the-combined-maximum, and the per-spouse reading the Virginia release exists to prevent — and prints which cells separate them. **Only 4 of its 15 candidate cells do.** Every single-filer cell and every one-spouse-qualifying cell is structurally incapable of catching a per-spouse defect, because at one qualifying person the two expressions are algebraically identical. ⚠ **`SCOPE_VA_POPULATE.md` §5 says to price the taper regions "in both filing columns", which reads as though the single column contributes to that proof; it cannot.** Correct that in the Virginia release | re-read against the primary source, never against the app |
| `oracle_ri.py` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — `qa/tools/oracle_ri.py` — **NEW at v5.69.** Rhode Island's oracle (SCOPE_RI_POPULATE D-RI-6); prints the ten §7a cells plus two wiring cells |
| `controls_v569_ri.py` | `qa/tools/controls_v569_ri.py` — **NEW at v5.69.** 16 drift-safe negative controls for Rhode Island's table, the inverted guards, the note and the Field Manual lock; 16 met expectation at the build. Unrowed by class, like `controls_v568_va.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder)
| `controls_v566_nm.py` | `qa/tools/controls_v566_nm.py` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** §B2 negative controls for the v5.66 New Mexico block: eight, C0 silent and C1/C1b/C2–C7 all firing. ⚠ **Drift-safe by construction, and that is the point** — it never edits the canonical source; each mutant is written to a throwaway tag from a pristine read, because the v5.66 session-2 control run died between applying a mutation and restoring it and poisoned the baseline so a later control read as NOT firing. It prints the canonical md5 before and after regardless, and reports an unmatched anchor as a **FINDING rather than a skip**. **The pattern to copy for any new control harness** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept (§G — controls do not rotate) |
| `controls_v568_va.py` | `qa/tools/controls_v568_va.py` — **NEW at v5.68.** §B2 negative controls for Virginia and the `t29` F-6a/F-6b repair: seventeen, all meeting their stated expectation. C0 silent; C1–C10 mutate the VA table, the evaluator (C8, per-spouse) and the note; T1–T6 mutate the D-3c selector's two copies, the fixture and F-6a/F-6b themselves. ⚠ **T5 EXPECTS SILENCE** — it restores the v5.67 vacuous form against an interior change, reproducing the defect on purpose. Drift-safe: builds every mutant in a scratch copy of the run folder; canonical md5s printed before and after. Deliberately unrowed in the hash table — see the D-3 note | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder)
| `controls_manifest_rows.py` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — `qa/tools/controls_manifest_rows.py` — **NEW 2026-09-08.** §B2 negative controls for `package_check`'s **K-8** and **K-9**, the two gates that guard this file's own hash rows. Four controls plus a blind-spot demonstration: C0a/C0b are null controls, **C1** corrupts one real hash row and K-8 must fire, **C2** removes a pool file's only manifest mention and K-9 must fire. ⚠ **Every control carries a NEEDLE** — the failure line must name the file the mutation touched, so a control cannot pass on someone else's failure, which is the P32/P42 defect this project has recorded three times. ⚠ **Targets are DERIVED from the manifest and the pool, and paths come from four required arguments** — it names no hash and no filename that can be renamed away, because `package_check_controls.sh` once hardcoded paths from a dead session and printed NOT CAUGHT for every control while exiting 0. Drift-safe: each mutant is a throwaway copy built from a pristine read, and the package's md5 is printed before and after. ⚠ **`B1` is NOT a control** — it removes `dom_entry_v566.jsx`'s row and asserts K-9 stays GREEN, demonstrating the blind spot that let that row go missing | when `K-8` or `K-9` changes |

⚠ **Controls scripts do NOT rotate.** §G's rotation rule covers **app sources only** — the pool
keeps every `controls_v*.sh`. A v5.61 delivery note wrongly told the maintainer to delete
`controls_v559.sh`; the pool already held `controls_v557.sh` and `controls_v5571.sh`, which
contradicted the instruction. `dom_entry_*` DOES rotate, and `package_check` J-4 asserts it. *(Both sentences are history from 2026-10-19:
no `qa/` file — controls script or dom entry — is pooled; J-4 is retired and J-6 asserts none. OPERATIONS §G, qa/ is repo-only.)*

⚠ **REWRITTEN 2026-09-08 (second build package). Half of this note's reasoning has EXPIRED and the
other half has not** — recorded this way rather than replaced, because the expired half is the whole
argument for the release that expired it.

**`oracle_nm.py` IS NOW ROWED** (decision D-2 (c) of `SCOPE_K8_ROW_MATCHER_PY.md`). `K-8`'s matcher
was widened to `py` in the same release, so the row is checked rather than merely recorded. It earns
the obligation: it is the statutory transcription `t10` prices New Mexico against, so a silent change
to it is the one change here that could move a user's number.

**`controls_v568_va.py` (NEW at v5.68) stays UNROWED on the same reasoning as the script below**, and is named in its own row in the tooling table so `K-9` sees it.

**`controls_v568_runfolder.sh` (NEW 2026-09-09) stays UNROWED on the same reasoning**, and it is
named here so the next reader does not file it as an oversight: it is a control script, it was pooled
because every `controls_*` script then was (none is from 2026-10-19), and D-3's *"a row on a file that never changes protects
nothing"* applies to it exactly as it does to the two below.

**`controls_v566_nm.py` and `controls_manifest_rows.py` stay UNROWED**, and that reason has not
expired: they are control scripts, and D-3's *"a row on a file that never changes protects nothing"*
still holds. `sel_census.cjs` likewise stays unrowed, on the same reasoning as `copylock.cjs`,
`lits.cjs`, `notes_probe.cjs` and `vergates.cjs`, its four immediate neighbours — rowing one of five
invites the next reader to call the other four an oversight.

*(Superseded, retained as the record of what was believed on 2026-09-08 in the morning: all three
`.py` and `.cjs` additions were left unrowed, partly because* `K-8`*'s extension set was
`mjs|cjs|jsx|js|sh|md|html|json|txt` *and an md5 row on a `.py` file would have been a maintenance
obligation with no gate behind it — the precise shape D-3 rejected. That note closed by saying
widening `K-8` was "a real option and is NOT taken here", because it changes what a check asserts and
belonged in a scope with its own controls. The scope was written that afternoon and built the same
day; the objection was answered, not overruled.)*

### Added 2026-09-15 — SCOPE_STATE_SET_SELECTOR stage 1

| File | What it is | Refresh when |
|---|---|---|
| `state_sets.cjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — `qa/tools/state_sets.cjs` — the shared in-law list and phrase matcher; required by `t10`, `t29`, `t35`, `f6_probe.cjs` and `state_sets_check.mjs`. **Hash row above** | when the in-law set changes, and at stage 2 |
| `state_sets_check.mjs` | **repo-only from 2026-10-19 (qa/ un-pooled; description in `TESTING.md`'s per-file index)** — `qa/state_sets_check.mjs` — TOOLING suite (S-1–S-8), **10 per leg, both legs**, in `runsuite.sh`'s TOOLING section. **Hash row above** | when the shared module changes |
| `controls_state_sets.py` | **repo-only from 2026-10-19 (qa/ un-pooled; this row is its pooled description)** — `qa/tools/controls_state_sets.py` — **38 negative controls, 38 of 38 as expected on each leg.** One sabotaged module per converted site; C4 restores `f6_probe`'s §7.3 defect; C7 shows the selectors no longer read prose; C8–C12 reword one note each. **No shebang on purpose** (run with `python3`), so `G-3a` does not apply. **Unrowed by class**, like `controls_v569_ri.py` | never — it is the record of this package |

## Audit findings and scopes (self-versioned by filename)

**v5.40 and later rows — added 2026-08-20.** ⚠ **Every one of these files was in the pool with no
manifest row.** Seven documents were invisible to the manifest at once, including two status records
written the same week and one written by the session that was auditing the manifest. The
clone-and-diff cannot catch this: all seven match the committed tree exactly, so the pool was correct
and only its *index* was wrong. **A file the manifest never names is a file the next session will not
know to read.**

| File | What it is | Status |
|---|---|---|
| `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` | Scope covering the Roth tab's MAGI measurement | **active — read before touching the Roth tab's MAGI** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STATUS_2026_08_20_structural_magi_extinction.md` | Build record for the structural S-1 assertion. **1,350 passed / 0 failed across 22 suites, parity 9/9, t1 102 → 108** — the current recorded suite state. Also records a line-citation correction the session owned against its own scope (`computeIrmaaPlan` at L4272, not L4271) | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_structural_magi_extinction.md`** (removed from the pool 2026-09-05, H-2). current — the suite baseline any next build starts from |
| `STATUS_2026_08_20_d3_correction.md` | The D-3 disclosure correction: the state-tax approximation is disclosed in three places, Maryland was misfiled, and the finding is restated as **Low** severity, not an undisclosed simplification. Also records the late v5.40 knowledge refresh | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_d3_correction.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_08_20_knowledge_refresh.md` | This refresh's record — the missing `src/index.html` entry template (and the disclaimer gate that rides in it), the retired stale `README-FIRST.md`, the inverted OPERATIONS §A2 bullet, and the pruned/corrected manifest rows | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_knowledge_refresh.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_08_20_build_and_domdiff.md` | The verification record: the published v5.40 artifact **rebuilds byte-identical from project knowledge alone** (`17867edb…`, smoke 16/16) — tested for the first time, the pool having lacked `src/index.html` until that day; the suite re-measured at **1,350 / 0 across 22 suites**, parity 9/9; and `domdiff_withdrawal.mjs` re-pointed after three releases stale, its IRMAA region re-anchored off 1,070 characters of prose, both controls fired | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_build_and_domdiff.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_09_11_b3_live_verification.md` | **The B-3 live-site verification record, 2026-09-11 (KIND: verification — no source, suite or harness change).** GitHub Pages serves the tested v5.70 build: 200, md5 `372d066cf4fc7115ebdae9fc9d6f35d1`, byte-identical to the committed artifact AND to a same-session rebuild from the canonical source (v5.69 first rebuilt to `86703918…`, §N3a). On the live download: `smoke_built` 20/20; through the real bootstrap, no key + no Local Model → 0 requests, key → 1 to `api.anthropic.com`, Local Model → 1 to its URL; v5.69 rebuild → 1 keyless request to the page's own host. Clean clone: `t36` 23/24, `controls_v570_b3.sh` 4 of 4. Pool 130, the retired scope gone. **Seven findings:** F-1 (`smoke_built` reads `body.textContent`, which includes the relocated bundle source — two checks vacuous, CONFIRMED on a scripts-disabled page; fix with A-3), F-2 (a fresh instance of §G's recorded J-gap; K-9 is satisfied by the retirement sentence itself), F-3 (the first-open notice at `src/index.html` L21 is unconditional; the Field Manual qualifies it twice — wording is Steve's), F-4 (`controls_v570_b3.sh` committed `100644`), F-5 (`TESTING.md` L5 said v5.67 — rolled), F-6 (`VERIFICATION_REPORT.md` is frozen — row below), F-7 (§I said the live host is unreachable — corrected). ⚠ **Steve's real-browser check was NOT yet received at packaging** — its line in §4 is blank until he reports it | ⚠ **REPO-ONLY — `docs/STATUS_2026_09_11_b3_live_verification.md`** (H-2 class; never in the pool). current — the only record of F-1…F-7 |
| `VERIFICATION_REPORT.md` | **A FROZEN historical record, v5.7 – v5.9.2 ONLY**, at the repo root (not `docs/`). Its own header says so: it stopped being maintained after v5.9.2, deliberately repeats no current figures, and routes readers to `CHANGELOG.md`; corrected 2026-08-23 after its header had claimed v5.9.2 was current for 37 releases. Kept because the workspace-drift incidents, the ACA primary-source gate record and the v5.9.1 pre-release leak review are recorded nowhere else. ⚠ **Do not append to it** — a 2026-09-11 brief proposed a v5.70 section there; the record went to `docs/STATUS_2026_09_11_b3_live_verification.md` instead (its F-6). Row added 2026-09-11: until then this file had no manifest row of any kind | ⚠ **REPO-ONLY — `VERIFICATION_REPORT.md`** (repo root; never in the pool). frozen — read as history only |
| `STATUS_2026_08_20_roth_magi_partial.md` | **PARTIAL measurement** for `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` (D-A and D-B resolved; D-C still deferred). On the **shipped example household** the Roth tab's IRMAA MAGI matches Engine C in **10 of 12 ladder years** and reads **≈$43K low in 2039 and 2040** — the two years containing a live RMD — while the same tab prints that RMD as $47,681 on screen. **Tier consequence on this household: zero** (tier 0 throughout, $113K–$166K headroom). ⚠ **Engine-vs-rendered-DOM only — the primary-source hand-computation the scope requires has NOT been run**, so this shows *where* they disagree, not *which is right*. Constructed household, term isolation and the `t3` pin all outstanding. Also records that the scope's §2 census table does not reproduce (24 claimed vs **28 hits / 25 sites** measured) | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_roth_magi_partial.md`** (removed from the pool 2026-09-05, H-2). current — resume here |
| `STATUS_CAPGAINS_PARTIAL_for_v5_33.md` | The capital-gains partial-state handoff written for v5.33 — a scope premise falsified mid-build, reported rather than adapted around | ⚠ **REPO-ONLY — `docs/STATUS_CAPGAINS_PARTIAL_for_v5_33.md`** (removed from the pool 2026-09-05, H-2). historical; read with the v5.33–v5.36 gains work |

**v5.39 rows (this refresh):**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_39_shipped.md` | The v5.39 ship record — full verification chain (tested source == shipped source, rebuild reproducibility, parity 9/9), per-suite totals parsed from output, the negative control for the new extinction assertion, **and §5, four errors made during the build, recorded plainly** | ⚠ **REPO-ONLY — `docs/STATUS_v5_39_shipped.md`** (removed from the pool 2026-09-05, H-2). **current — the authoritative v5.39 record** |
| `STATUS_v5_41_shipped.md` | ⚠ **REPO-ONLY — `docs/STATUS_v5_41_shipped.md`** (removed from the pool 2026-09-05, H-2). **The v5.41 ship record.** Carries the two corrections made to the build brief's expected figures (an out-of-scope $420 dividend term; an undecided conversion-gating rule worth $2,492 in 2040), the §M precision ceiling and why dollar-exact MAGI was NOT achievable, the 9 negative controls, and four findings left for the next scope |

**v5.36 rows:**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_36_shipped.md` | The v5.36 ship record — session-2 narrative, every decision with who made it, and the FULL per-file hash table (source, suites, docs), the E-18 process fix executed | ⚠ **REPO-ONLY — `docs/STATUS_v5_36_shipped.md`** (removed from the pool 2026-09-05, H-2). **current — the authoritative v5.36 record** |
| `STOP-REPORT-v5_36-session2-pool-drift.md` | The fourth pool-drift block: six suite files pre-session-1 while the brief said otherwise; evidence trail and recovery | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_36-session2-pool-drift.md`** (removed from the pool 2026-09-05, H-2). historical — E-18's primary source |
| ~~`SCOPE_v5_36_drawdown_capital_gains.md`~~ | Scope for the v5.36 capital-gains work (rev 3) | **RETIRED — FULFILLED at v5.36.** Decisions and outcomes recorded in `STATUS_v5_36_shipped.md` and the CHANGELOG; no test cites it by filename (checked) |
| ~~`STATUS_v5_36_partial.md`~~ | Session-1 intermediate status | **RETIRED — superseded by `STATUS_v5_36_shipped.md`** |

Read these together with the build they are pinned to. Every finding document names its build
version + md5 in its header; a finding pinned to an older build has NOT been re-verified against
the current source unless it says so.

| File | What it is | Status |
|---|---|---|
| `FlawsToFix-v5_10_1-Phase1.md` | Phase 1 audit (Sections A+B) against v5.10.1 | B-2 fixed at v5.10.2; B-1 closed as disclosed limitation; **A-2 open**, LOW, needs its own scope · **re-run at v5.69 on 2026-09-11 — `FlawsToFix-v5_69-Phase1.md`** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_69-Phase1.md` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) — its two header items are resolved (v5.73) and its three leads are D-15, D-3/MT brackets (modelled) and D-19 (fixed); its re-homed follow-ups are `ARCHITECTUREIssues.md` E-29 (a) and closed (the legacy rows, 2026-09-28). ⚠ **v5.72: A-2, A-4, A-5 FIXED; its header now files the Montana lead and Maine's open populate — it stays pooled for that.** Phase 1 re-run (Sections A+B — the import and storage path) against v5.69 · ⚠ **POOLED 2026-09-15 while `SCOPE_IMPORT_HARDENING.md` is open** (its item 4 carve-out: an audit a live scope cites); returns to repo-only when that scope retires. *(Was:)* **REPO-ONLY** (`docs/`), not in the pool (§G / H-2; its decision 4) | **A-3 MEDIUM** (the draft autosave never saves) and **B-3 MEDIUM** (keyless Ask AI posts the plan to the page's host) — both undisclosed; **B-3 FIXED at v5.70** (2026-09-11; `SCOPE_B3_KEYLESS_AI_ROUTE.md` retired), A-3 unscoped; A-4…A-6 LOW; A-2 still open |
| `FlawsToFix-v5_73-Phase2.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first.** **v6.12: C-5 FIXED (census row and summary table); C-10's row corrected to FIXED v6.09 (D-35 fixed it without citing the ID).** **v5.77: C-4 and D-1 annotated FIXED; C-12 (Engine C, single household on the joint §86 thresholds) added and FIXED.** **The live audit register for numerical validation (standing audit Phase 2, v5.73, 2026-09-15).** Section C complete: eleven findings (C-8 high; C-3, C-6 medium) with causes, executed figures and hand arithmetic; §0 is the summary, §4 what was not covered, §5 how to reproduce (`qa/tools/audit_phase2_v573/`, repo only). `docs/` **and** the pool; no md5 row (D-3). Stays pooled until its findings are scoped and fixed |
| `FlawsToFix-v5_15-Phase2D.md` | Sub-phase 2D findings, **REVISION 3**. Completeness half done to the Section C standard, verified **per engine**. Revisions 1 and 2 both stated mechanisms wrongly — §1 records both errors and the single cause, and is still worth reading for that. ⚠ **§6 IS SUPERSEDED** by `AUDIT_2D_BREAKEVEN_v5_28.md`, which says so in its own header | **2D COMPLETE at v5.28 — this row said "IN PROGRESS" through eleven releases and cost a session.** §6's three owed items (crossover hand-verified on two households, discounting-equivalence, `t10` cases) are all discharged. **Read the v5.28 audit, not §6** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_TAXES_DRAWDOWN.md` | — **un-pooled 2026-09-21, repo-only** (§G decision check run line by line: D-4 and D-7 re-homed in `FlawsToFix-v5_73-Phase2.md`, D-5 disclosed in-app and in METHODOLOGY, E-22 in `ARCHITECTUREIssues.md`; nothing open left behind) — `docs/SCOPE_TAXES_DRAWDOWN.md` — ☑ **RETIRED, v5.74 — FULFILLED.** C-8 / E-21 / D-14: Engines B and C take Engine D's spending draws through one bridge. §12 is the build record (two build sessions; Departure 3, the detail panel; decision 3 replaced 2026-09-21). No md5 row (D-3, retired-scope class) |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2 — supersedes the v5.15 scope, which is retired.** Re-verified against v5.21 with AST resolution. Corrects three premise claims: Engine D applies **zero** tax to these draws (not capital-gains — `magi` L7686 omits `drawFromTaxable`); the treatment is **mischaracterized, not undisclosed** (MyData L11211 discloses it, Withdrawal L7822 and the Field Manual contradict it); and the census grew by **nine sites**. Structural trap **EXECUTED**: $147K → $0, silent, plus $21K of genuine brokerage leaving the tab's accounting. `total401k` has **three** derivations, so Option B is path-dependent | **active — §7 DECISIONS RESOLVED 2026-08-10.** Governs releases (b) and (c) *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_CONSOLIDATE_taxable_residual_v5_22.md` | Release **(a)** of the three-release plan (D-6/D-7). Consolidates the taxable residual, verified at **seven** identical sites by normalized AST fingerprint (one distinct form). Two binding constraints: the helper must **not** live in `retireStartBalances` (documented decision, L1509–1511, whose comment must be amended in the same edit), and **L8384 is a variant** — positions residual **plus** `otherAccounts` — so only its positions half is replaced | **active — no open decisions. Next build.** Pure refactor: 8/8 strict parity, all 751 checks **identical** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_AUDIT_PHASE2_v5_10_2.md` | Governing scope for Phase 2 / Section C. Decisions D-1…D-5 are **binding** on all 2A–2E work | **COMPLETE — all five sub-phases closed.** Roll-up: `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2A.md` | Sub-phase 2A — federal core. Engine A dollar-exact (76 assertions) | complete. **Amended 2026-08-08**: Engine B is verifiable only to **±$500**, not dollar-exact *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2B.md` | Sub-phase 2B — IRMAA + indexation (35 assertions). Findings F-2B-1 (threshold indexed to MAGI year) and F-2B-2 (top tier not frozen) — both LOW, conservative, **coupled: fix both or neither** | complete. **Amended 2026-08-08**: Engine C verifiable only to ±$500 MAGI / ±$50 surcharge *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2C.md` | Sub-phase 2C — first-spouse death. **C-2C-3 (HIGH)**: Engines B and C key post-death RMDs to the deceased spouse's age; direction depends on which spouse is younger, **non-conservative** when A is the younger. C-2C-1 and C-2C-2 LOW, conservative | complete — **this is the current 2C document** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-EngineBC-render-precision.md` | Why Engines B and C cannot be verified to the dollar: every DOM figure is `Math.round(x/1000)`; the shim reaches only module-level bindings. Records the ±$500 ceiling and the options to lift it | ⚠ **REPO-ONLY — `docs/STOP-REPORT-EngineBC-render-precision.md`** (removed from the pool 2026-09-05, H-2). standing constraint — applies to all future B/C verification |
| `FINDING-C-2C-6-EngineA-death-year-filing.md` | Engine A files Single for the whole death year (Pub. 501 says the year after). **Executed dollar-exact**: over-taxes by $3.5K–$15.5K depending on income. Conservative, undisclosed, and a cross-engine divergence *created* by the v5.12/v5.13 corrections | **open — needs a scope**; pairs naturally with the F-2B indexation fix, which lives in the same tier loop *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FINDING-C-2C-4-EngineD-no-death-modeling.md` | Engine D (Withdrawal tab) did not model first death at all. Severity restated by D-4 to **MEDIUM, direction household-dependent** | **CLOSED — fixed at v5.12**; header corrected 2026-08-09 after sitting stale at *provisional / HIGH* for a full release *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FINDING-C-2C-5-EngineC-no-death-in-SS.md` | Engine C (IRMAA) did not model the first death in its Social Security basis — the finding `t13` was written to pin. Fixed at v5.13 | rarely *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_survivor_engines_CD.md` + `SCOPE_ADDENDUM_D6_EngineC_design.md` | Scope for C-2C-4 (Engine D) + C-2C-5 (Engine C). Engine D shipped at v5.12; **Engine C shipped at v5.13** | **fulfilled — retire both at this release** |
| `FINDING-C-2B-3-RothLadder-irmaa-inflator.md` | The Roth ladder ran its own tax arithmetic with the **married** deduction, brackets, SS thresholds and IRMAA cliff hardcoded, and no single-filer branch. Severity raised MEDIUM → HIGH when the prerequisite was executed | **CLOSED — fixed at v5.15.** Outcome written back on the finding itself; magnitude corrected upward (72%, not ~40%) and census corrected (13 sites, not 10) *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_irmaa_indexation_v5_13.md` | Scope for the coupled F-2B-1 / F-2B-2 indexation fix. Premise **re-verified against v5.13**, not inherited from the v5.10.2 findings; census updated for the two-array tier structure v5.13 introduced. Four open decisions | **active — awaiting Steve's decisions in §7** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_roth_tab_filing_status_v5_14.md` | Scope for C-2B-3. All five decisions resolved by Steve 2026-08-09; all three ordered changes shipped (the droppable third was not needed) | **fulfilled at v5.15 — retire** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_DEFECTS_v5_10_1.md` | The v5.11 defect-fix release scope: three pre-existing defects found by the rebuilt t1–t6 baseline — **D1 (P0)** Clear All Data left the API key and skipped the landing return, **D2** ACA cliff solver ignored MAGI from its own funding sale, **D3** phantom Spouse-B card for single filers. All three were present identically in v5.9.2 and v5.10, so none was a regression. **Kept as the worked example** of the defect-pin → fix → flip cycle, and of a scope with an enforceable out-of-scope boundary | fulfilled (all three shipped at v5.10.1); retained for reference, not retirement *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `AUDIT_2D_BREAKEVEN_v5_28.md` | Sub-phase 2D — Roth break-even + account completeness against v5.28. **Explicitly supersedes `FlawsToFix-v5_15-Phase2D.md` §6** and discharges all three items it owed; verification is arithmetic, not inspection (a $30K conversion costs $2,196 incremental federal tax against a −$2,294 year-one wealth delta; 2,196 × 1.045 = 2,294.8). **Check count reconciled 2026-08-18:** the document's **19** was its own v5.28 delta (t10 115 → 134); the current `t10` carries **27** `2D`-labelled assertions, so 8 arrived after v5.28. Both figures are right about different things — the 27 in this row describes today's file. *(Suite totals not re-run to confirm t10's overall total.)* **ADDED TO THE POOL 2026-08-18** — it was repo-only, which is why the row above went stale | ⚠ **REPO-ONLY — `docs/AUDIT_2D_BREAKEVEN_v5_28.md`** (removed from the pool 2026-09-05, H-2). complete |
| `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` | Sub-phase 2E — state-tax module (21 checks) **and the Phase 2 roll-up**. The document a Phase 3+ session must read first: it names what is already verified and therefore not a finding | ⚠ **REPO-ONLY — `docs/AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md`** (removed from the pool 2026-09-05, H-2). complete — **authoritative for Phase 2** |
| `AUDIT_DOCS_HTML_v5_27.md` | Audit of the Field Manual against shipped v5.27 behaviour. Records that the **glossary, §10 API-key material and §14 FAQ were NOT audited** — that ground is Section F (**now covered — see `UsabilityFlaws.md` Part D**). **ADDED TO THE POOL 2026-08-18**, closing the repo-only annotation this row carried — the standing advice *"a row with no file behind it costs a session a hunt"* was borne out twice over on the same day (see the Section D sweep and the 2D audit rows) | ⚠ **REPO-ONLY — `docs/AUDIT_DOCS_HTML_v5_27.md`** (removed from the pool 2026-09-05, H-2). complete, with the stated gap — **gap since closed** |
| `STATUS_release_a.md` | Release-(a) status note (taxable-residual consolidation, v5.22) | ⚠ **REPO-ONLY — `docs/STATUS_release_a.md`** (removed from the pool 2026-09-05, H-2). historical |
| `STATUS_v5_23_engineD_hoist.md` | Engine D hoist status note (v5.23) | ⚠ **REPO-ONLY — `docs/STATUS_v5_23_engineD_hoist.md`** (removed from the pool 2026-09-05, H-2). historical |
| ~~`probe_classify.mjs`~~ | **RESOLVED at v5.30 — removed from knowledge, now versioned.** Committed to the repo at `qa/tools/probe_classify.mjs` with a header recording what it was for. It is a v5.25-era probe from the `otherAccounts` scoping work; **its conclusions have since shipped and are asserted by `t20`**, so its "what would move" output now describes a change that already happened. It asserts nothing and **must never be counted in a release total**. Read `t20` instead. | retired from knowledge |
| `MissingFeatures.md` | **CENSUS AT v6.04 (2026-10-11): its opening table is the current status of every D item — read it first.** **Section D** of the standing audit (Phase 3) — the taxation-features findings inventory. **RE-PINNED TO v5.48 on 2026-08-25** (`6b30580a2a1a5bc95b0df2c3f2a23a95`, tree `ba6d598`); the v5.29 and v5.39 blocks are kept below it for the record. Verified **by content** — the document's `L####` citations are pinned to v5.29/v5.39 and most have moved. **D-1, D-2 closed and confirmed; D-2's live descendant S-1 is now closed too** (the IRMAA MAGI sentence names realized gains at L9973) — ~~⚠ `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` and `AUDIT_TOP_FIVE_SUMMARY.md` still carry S-1 as live~~ — **CLEARED 2026-08-25.** Both documents were repaired hours later in the same session and their own rows below say so; this warning was left standing and **contradicted them for two days**. It was found on 2026-08-25 by reading the three rows against each other. ⚠ **The lesson is the one this file already records twice: a warning that points AT another document goes stale when that document is fixed, and nothing checks it.** When you repair a document, clear every cross-reference that describes its old state in the same pass — a manifest that disagrees with itself is worse than one that says nothing, because it is read as authoritative. ~~**D-6 is HALF-CLOSED, not closed**~~ — **D-6 CLOSED AT v5.49 (2026-08-25), both halves.** The user-side half shipped: the Field Manual's IRMAA Cliff entry and the IRMAA tab both name SSA-44 and work stoppage. `METHODOLOGY.md` was corrected in the same release — it named five of the eight life-changing events and said the list *"includes"* them, never that it is **closed**; on a tab driven by the Roth slider that reads as an invitation to infer a conversion-driven spike might qualify, and it cannot (`ssa.gov/forms/ssa-44.pdf`; 20 CFR 418.1205). **`t31` now enforces the class** — see its row above. ⚠ **This entry is the reason `t31` exists:** D-6 was recorded CLOSED once already, on the strength of the creator-side half alone, and nothing could catch that because no suite read `METHODOLOGY.md`. **D-7 assessed at last**: no estate tax of any kind sits in the comparator's estate figure (L4251), which is its **default ranking objective**, and the only disclosure (L10788) is gated to `single` households, so a couple never sees it — direction **optimistic**. **NEW D-3c**: `excl` applies income-limited state exclusions unconditionally (L1100), so a NJ couple pays $0 modelled tax up to $150K of retirement income against a statutory $100K MFJ cap and a hard cliff — this **under-taxes**, the opposite of D-3's headline direction. **D-4 reclassified** as a boundary note (no app input can express itemizing). D-3, D-5, D-8b hold. ⚠ Carries an errata owning two errors of the re-pinning session: a wrong state-note discriminator, and a lossy `DOCS_HTML` decode that produced false zeros — **read the Field Manual from the RAW string, never a stripped copy**. **Coverage finding recorded there:** every suite fixture sets `stateCode: null` except `t3`'s `GA`, so no projection exercises the state module for 50 of 51 jurisdictions | Section D **re-verified at v5.48**; no fix made — scoping decision open with Steve |
| `ARCHITECTUREIssues.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first; E-29 (2026-10-11) and E-30 (2026-10-19, AI-6 among them) hold the threads re-homed from documents that left the pool.** **Section E** of the standing audit — **v5.73 section (E-21–E-28) appended 2026-09-15: read it first.** Highest: E-21, the Taxes and Withdrawal engines as parallel projections (the cause of Phase 2 C-8); E-22, the same statute implemented up to five times (**v6.12: every engine now calls the one §86 helper** — census row updated, as is E-25's). Earlier items are pinned to v5.29 and later releases | Section E **covered** |
| `UsabilityFlaws.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first.** **F-19 is two IDs from 2026-10-14:** **F-19s** (skins, fixed v5.39 — its census row added then) and **F-19r** (§H: the Ranking tab's headline averaged nine tiers; filed at v6.10 as "F-19", **fixed v6.11**). **F-20** (§H, filed v6.23, **fixed v6.38**, wider than registered): the Income tab on a phone, and its wording when income covers spending. **F-30** (§H, filed and disclosed v6.38, open): six other tabs overprint text on a phone. **F-21** (§H) filed and fixed at v6.25 (the holdings table's plan-type column). **F-22** (§H, filed v6.26, **fixed v6.27**): the Grade tab's *RECOMMENDED ACTIONS* were directives with invented projections. **F-23** (§H, filed v6.27, open): directive copy on other tabs. **F-24** (§H, filed v6.27, open): the Grade tab's remaining copy and its understated *"Lost ~X GPA points"*. This row's own "Fixed: … F-19" below is F-19s. **Section F** of the standing audit — **RE-PINNED TO v5.73 (2026-09-15), measured in real Chromium at 1440 / 820 / 390 px across all 26 tabs: read that block first.** New: F-11 (every tab scrolls sideways on a phone), F-12 (the first phone screen is all chrome). F-10 closed | **PARTIALLY CLOSED at v5.39.** Fixed: F-10, F-11, F-12, F-13, F-14, F-15, F-17, F-18, F-19 (F-19 was found while verifying F-10 and was the release's highest-value item). **Still open:** F-1…F-9 (small-screen layout, contrast, touch targets, tooltips, input modes, chart resize) — now **disclosed** in Field Manual §13 but **not fixed**; and F-16 (glossary ASCII sort, NIT). The mechanics release for F-2/F-6/F-8 is identified but unscoped. The two-paragraph top-five summary is ✅ **WRITTEN 2026-08-18** — `AUDIT_TOP_FIVE_SUMMARY.md`; F-1…F-9 are its item 4. It was **NO LONGER BLOCKED** (corrected 2026-08-18): both stated blockers were already closed — Section C's 2D break-even half at **v5.28** and Section D's gap sweep at **v5.31**. It was deferred through several sessions against blockers that had already cleared. Write it after the v5.31 → v5.39 delta sweep, since that may change what the top five are |
| `AUDIT_D3_STATE_TAX_DIRECTION.md` | **D-3's direction is wrong, and the finding splits.** Measured against **v5.40** on 2026-08-19 while verifying the premise for a D-3 scope — **stopped and reported rather than adapting the scope.** D-3 was recorded as under-taxing and flattering a plan, and that reasoning made it item **#2** of the top-five summary. New York MFJ, both 67, against the sourced 2026 schedule: at $120,000 the model charges **$4,800** where NY charges **$3,121** — **54% too high** — and it over-taxes at every income to roughly $600,000, reversing only between **$600K and $900K**. **Direction is CONSERVATIVE.** Causes: `stateTaxAnnual` (L1091) models **no state standard deduction**, and each rate approximates a mid-to-upper *marginal* rate. ⚠ **The disclosure half was OVERSTATED and is corrected 2026-08-20:** the approximation is disclosed in THREE places — Field Manual §13, the manual's Taxes tab entry, and `src/DangerClose.jsx` **L11889**, rendered under the My Data state selector for every jurisdiction — so it is not an undisclosed simplification. All six named states carry notes; Maryland was misfiled (its note says *effective*, never *progressive*), leaving **three** disclosing states (CA, DC, OR) against **30** silent ones, exact count **unmeasured**. What remains is **inconsistent per-state note detail, severity Low**, plus the setup wizard's picker (L3393) showing no note at all. ⚠ **Limits:** only NY is verified against a sourced schedule; CA is **indicative** (recalled brackets); HI/MN/VT/WI are **unmeasured**. Also flags **NJ returning $0** for this household — unmeasured, asserted neither way | ⚠ **REPO-ONLY — `docs/AUDIT_D3_STATE_TAX_DIRECTION.md`** (removed from the pool 2026-09-05, H-2). **current, corrected 2026-08-20.** Disclosure half → **Low; ride the note tidy along with the next release that opens `STATE_RULES`, do not ship for it**. Precision half → **held**; full graduated brackets **declined** (~300 numbers, annually re-indexed); recalibration preferred if it proceeds. **D-3 has no live high-priority half** |
| `AUDIT_TOP_FIVE_SUMMARY.md` | **THE STANDING AUDIT'S CAPSTONE** — the two-paragraph top-five summary, written 2026-08-18 against v5.39. ⚠ **RE-PINNED TO v5.48 on 2026-08-25: its #1 item is largely discharged.** Item 1 was *"disclosures drift off the engines beneath them — S-1, S-3, D-6"*, ranked top *"by a distance"*; **S-1 and S-3 are now CLOSED** (S-1 structurally — the IRMAA tab's MAGI sentence at L9973 is a catch-all with named examples, not an enumeration, so it cannot drift by omission again) and **D-6 is HALF-CLOSED** (creator-side only). **Item 5 has demonstrated itself on this very document**: S-1 and S-3 closed silently and the capstone ranked them #1 for nine releases — the 4th and 5th silent closure on the same list as D-1, D-2, C-2C-3 — so **item 5 now outranks item 1**. Rows left unrenumbered on purpose. All eleven `L####` citations re-resolved at v5.48. ⚠ **Item 4's F-1…F-9 count was NOT re-verified** — treat as unverified until measured | ⚠ **REPO-ONLY — `docs/AUDIT_TOP_FIVE_SUMMARY.md`** (removed from the pool 2026-09-05, H-2). **re-pinned v5.48**; items 2/3 hold |
| `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` | **The Section D delta sweep**, run 2026-08-18 against **v5.39** (tree `d18f7cc`). ✅ **RE-PINNED TO v5.48 on 2026-08-25 — BOTH of its live findings are CLOSED.** S-1 closed structurally (L9973 vs Engine C's seven-component sum at L4435); S-3 closed (`METHODOLOGY.md` L678–680 now past-tense and version-gated). Its §4 recommendation — *"fix S-1 and S-3 together in one small docs release"* — was carried out and **never recorded here**, which is why the capstone ranked them #1 for nine releases. **This document is now history: its method stands, its findings are discharged, nothing in it is open** | ⚠ **REPO-ONLY — `docs/AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`** (removed from the pool 2026-09-05, H-2). **closed** — do not cite S-1 or S-3 as live |
| `AUDIT_PHASE3_SECTION_D_SWEEP.md` | **THE SECTION D UNDISCLOSED-GAP SWEEP** — the deliverable the rollup below asked for, run against **v5.31** (committed tree `4b8e714`). Method: *enumerate, don't sample* — all **28 user-facing surfaces** captured (26 rendered tabs driven through the DOM harness, plus decoded `DOCS_HTML` and `METHODOLOGY.md`), then three passes: **58 claims** extracted across 18 surfaces, **28 distinct negative modelling claims** inventoried, then **measurement** by driving the engines and perturbing inputs. Result: **no undisclosed gap.** One Low disclosure inaccuracy (**S-1**, IRMAA tab's MAGI enumeration), **D-6 resolved** as disclosed rather than a gap, and two suspected gaps **cleared by measurement** with control arms recorded. §6 states its own limits (one household; pattern-based extraction; arithmetic not re-verified; `validation/` untouched). ⚠ **Its result is anchored to v5.31 and six modelling releases have shipped since (v5.32, v5.34–v5.38)** — see the standing note below | ⚠ **REPO-ONLY — `docs/AUDIT_PHASE3_SECTION_D_SWEEP.md`** (removed from the pool 2026-09-05, H-2). **Section D discharged at v5.31.** **ADDED TO THE POOL 2026-08-18** — it was repo-only and named in no manifest, which is why Section D read as "never run" for eight releases (E-14's failure shape) |
| `AUDIT_PHASE3_ROLLUP.md` | Phase 3 roll-up (Sections D + E). ✅ **RE-PINNED TO v5.49 on 2026-08-25 — read that box first.** This is **the orientation document for the whole audit**, and on 2026-08-25 it gave a wrong answer about **two of the four phases**: its §5 said Phase 4 (F) was *not started* when `UsabilityFlaws.md` has been pinned since v5.38 with three findings FIXED at v5.40, and said the top-five capstone was unwritten when it exists and has been re-pinned twice. §5 is now marked SUPERSEDED in place. Section E findings re-checked by content: **E-2 CLOSED** (a named `OBBBA_CONSTS` block with the statutory cite, an explicit `SENIOR_BONUS_SUNSET_YEAR` and Verify-tab coverage); **E-4, E-5, E-6 and E-11 HOLD**; **E-11's mechanism identified** — one `DOCS_HTML` line has three truthful lengths (code points / UTF-16 units / bytes), so it is a UNITS defect, not drift. ⚠ E-1, E-3, E-7, E-8, E-9, E-10, E-12, E-13 **not re-verified — assume stale**. Its §4 asked for Section D to be re-run with the undisclosed-gap sweep as the explicit objective — **that request was fulfilled**; read `AUDIT_PHASE3_SECTION_D_SWEEP.md` alongside it. ⚠ §4's list of what Section E did NOT reach — the file's structure, `DOCS_HTML` internals, `validation/` ↔ `qa/` — **is still accurate and is the largest untouched area in the audit**. **ADDED TO THE POOL 2026-08-18** (previously listed here but repo-only) | ⚠ **REPO-ONLY — `docs/AUDIT_PHASE3_ROLLUP.md`** (removed from the pool 2026-09-05, H-2). current, **with the sweep as its successor** |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2.** Governing scope for the three-release `otherAccounts` plan — (a) v5.22, (b) v5.24, (c) v5.26. §1 records three corrections to its own premise; §7 carries Steve's resolved decisions D-1…D-7 | **FULFILLED (all three shipped) — RESTORED to knowledge 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `qa/t19_engineD_exact.mjs` L61 cites it as its governing scope *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_ENGINE_D_MAGI_v5_24.md` | Release (b). §1 corrects the carried-forward premise (adding `drawFromTaxable` to `magi` would have been a **defect**, not a fix); §8 is the correction owed to `t19`'s B-2 pin. §8 also warns the finding **"is unusually good at being restated wrongly"** and counts three prior wrong statements | **FULFILLED at v5.24 — RESTORED 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `t19` L96 is a **stop-instruction** telling a session to read its §1 before touching `magi` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ *(retire — spent)* | Build brief for v5.30 — pasted as the first message of the build session. Carries the freshness expectations, the three edits, the per-leg gating rule, and the version-bump tax | current |
| ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ *(retired)* | Scope for **D-1(a)/(b) + E-3** — the false OBBBA disclosure in Field Manual §13 and METHODOLOGY §5, and the false source comment at L829–831. Three edits, no engine change, parity must stay 8/8. §3 records the §B2 lock check (clean) and a second gap it surfaced: nothing asserts Engine B *applies* the bonus | **RETIRED — FULFILLED BY v5.30 (verified 2026-08-13).** All three edits shipped, `t18` gained the three hand-computed OBBBA cases including the 2029 sunset, and E-3 was closed and named in the CHANGELOG. Delete from the pool with its build brief |

---


### ⚠ Added 2026-09-03 — twelve pool files had NO manifest row, eleven of them predating v5.61

**This is the SECOND occurrence of the class recorded at the head of this section.** The seven
documents found in 2026-08-20 were the first. `package_check` **K-9** now asserts that every pool
file is named here, so a third occurrence fails loudly instead of waiting for someone to look.

| File | What it is | Status |
|---|---|---|
| `AUDIT_STATE_INCOME_BASES_ROUND5.md` | State income bases and thresholds, round 5. Four findings; the Rhode Island one shipped as v5.61 | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) **COMPLETE**, and all four findings are resolved: the bases and shapes in `SCOPE_INCOME_CONDITIONING.md` (fulfilled v5.69), Rhode Island v5.61, Connecticut v5.65. *(This cell read "three findings still open — Connecticut is the largest single-state error currently known" until 2026-10-11.)* |
| `FINDINGS-v5_63-state-statutes.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — The statutory oracle for the five income-conditioned states (NM, RI, VA, NJ, CT) — every figure read against a primary or official source 2026-09-04, with the two ROUND5 open items closed and the four build decisions they produced | **REFERENCE — the populate releases test against these tables and do not re-derive them.** ⚠ Connecticut is read at **TY2026**; the other four at their current codified or TY2025 state. **Rhode Island's TY2026 pair is NOT PUBLISHED** and is expected in the November 2026 advisory — re-read §6 when it issues. ⚠ **§6 and §7c CORRECTED IN PLACE 2026-09-10: Rhode Island's comparator is EXCLUSIVE** (§ 44-30-12(c)(8)/(9) "less than"; ADV 2025-22 "below") — the original "at or below" is kept beside the correction; see `SCOPE_RI_POPULATE.md` F-1 and D-RI-2 |
| `SCOPE_INCOME_CONDITIONING.md` | An income-conditioning field for state exclusions (D-11 (c)) | ☑ **RETIRED — FULFILLED AT v5.69**: all five states conditioned. *(Was:)* **OPEN — PARTIALLY BUILT: CT v5.65, NM v5.66, NJ v5.67, VA v5.68; RHODE ISLAND OPEN, ONE LEFT** (rolled at v5.68, when the scope's own status cell — which still read "Not yet built." — was corrected in the same package). *(Earlier wording:)* **OPEN — PARTIALLY BUILT at v5.64.** ⚠ Status rolled 2026-09-04 at the v5.64 ship: the measure, the two bases and the evaluator are BUILT and populate no state (B-1 (a)); the five state tables are not. Four further decisions **B-1..B-4** were raised by the completed pre-build gate and approved the same day — see the scope's §7b. It stays on `package_check`'s I-2 OPEN allowlist until the last state lands, and ⚠ **that entry's REASON is now stale**: it reads *approved, unbuilt*, and a stale allowlist reason is as invisible to I-3 as a ghost entry is. *(Previously: APPROVED 2026-09-04, NOT YET BUILT.)* ⚠ Row rewritten 2026-09-04: it said *"gated on D-2 and D-3, unresolved"* while `CHANGELOG.md`'s v5.62 entry said both were approved — a four-document disagreement (this row, the scope's status line, `package_check`'s allowlist comment, the CHANGELOG) that nothing compared, the **fifth** of its class. D-2 **(b)** two bases via a per-state `base` field and D-3 **(b)** additive `{ kind: 'bands' \| 'taper' }` with `excl65` kept as a scalar are approved; all seven decisions are now resolved. ⚠ **Its premise was re-anchored from v5.60 to v5.63 in the same pass** — v5.62 rewrote all three `stateTaxAnnual` call sites to gross components and v5.63 made `work` carry `work + otherOrd`, so every line number and the falsified "the three call sites do not pass the same fields" claim were corrected. Stays on `package_check`'s OPEN allowlist; **that entry now expires when the field SHIPS, and only a person can retire it** ⚠ **2026-09-10: B-2 annotated in place** — Rhode Island is exclusive too; B-2's mechanism stands. *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_RI_POPULATE.md` | `docs/SCOPE_RI_POPULATE.md` — **NEW 2026-09-10.** Populate Rhode Island's $50,000 pension/401(k) modification (§ 44-30-12(c)(9)) into `exclTest` as a two-row `bands` cliff on `agi`, per person, `cmp: "lt"`, on the dated TY2025 pair — the **fifth and last** state under `SCOPE_INCOME_CONDITIONING.md`. Measured against v5.68 `561fc39b…`, tree `f2f4c20`: over 34,992 households tax rose for 14,843 and fell for none, largest rise **$5,000.00/yr**. Records **F-1** (FINDINGS' inclusive comparator is wrong) and **F-4** (no assertion reads the Field Manual sentences the release falsifies). The IRA distinction, the own-income cap and per-spouse FRA are disclosed, not modelled; Social Security is out of scope. | ☑ **RETIRED — FULFILLED AT v5.69**; §10 is the build record. *(Was:)* **OPEN — BUILDABLE. All six decisions D-RI-1…D-RI-6 APPROVED 2026-09-10.** On `package_check`'s I-2 OPEN allowlist; the Rhode Island build retires this scope AND the parent, and removes BOTH allowlist entries in that package *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_B3_KEYLESS_AI_ROUTE.md` | `docs/SCOPE_B3_KEYLESS_AI_ROUTE.md` — ☑ **RETIRED — FULFILLED AT v5.70, 2026-09-11**; §7 is the build record. **Left the pool** at the v5.70 upload; its `package_check` allowlist entry and hash row left with it. *(Was:* **NEW 2026-09-11. BUILDABLE** — all three decisions approved 2026-09-11. The fix for the Phase 1 audit's **B-3** (keyless Ask AI posts the plan to the page's own host): a refusal inside `askAI` (the app only), a disabled and relabelled button, and full disclosure — the v5.70 CHANGELOG, one Field Manual sentence, and a short public note once v5.70 is live. Target **v5.70**. On `package_check`'s I-2 OPEN allowlist until that release closes it)* | retired *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_NJ_POPULATE.md` | `docs/SCOPE_NJ_POPULATE.md` — **NEW 2026-09-08.** Populate New Jersey (§ 54A:6-10) into `exclTest`, the **third of five** states under `SCOPE_INCOME_CONDITIONING.md` (CT v5.65, NM v5.66). ⚠ **The largest remaining single-state error in the app**: the model grants $75,000 per person unconditionally from 65, so an MFJ household over $150,000 of NJ gross income excludes $150,000 where the statute allows **nothing** — **$8,250/yr of NJ tax understated**, more than RI and VA combined. Premise re-measured against v5.66 `31b43e09…`, tree `0fc82c5`. ⚠ **No evaluator change needed** — `_fromTest` already names NJ in three of its own comments. ⚠ **Two figures move in OPPOSITE directions** and both must be disclosed: the tier fix is pessimistic, and modelling the 62 age floor (D-NJ-1) is **optimistic** | ☑ **RETIRED — FULFILLED at v5.67, 2026-09-08.** All four decisions built as resolved: **D-NJ-1** the 62 floor IS modelled, **D-NJ-2** caps encoded faithfully with `E-NJ-1` pinning percentage-of-payments, **D-NJ-3** the status disagreement repaired, **D-NJ-4** `excl65` set to 0. §8 is the build record. ⚠ **Two guards were left standing on nothing by this release and are pinned rather than discovered later**: `t29` F-6a/F-6b (the income-limited scalar set is down to VA alone, and populating VA empties it) and the `stateExclCliff` fixture, re-founded on VA because NJ was the state it stood on *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_VA_POPULATE.md` | `docs/SCOPE_VA_POPULATE.md` — ☑ **RETIRED — FULFILLED AT v5.68, 2026-09-10**; §9 is the build record, and four errors in the scope are corrected at their sites. Its `package_check` OPEN-allowlist entry left in the same package. *(Row as written at arrival follows.)* **NEW 2026-09-09.** Populate Virginia's age deduction (§ 58.1-322.03(5)(b)) into `exclTest`, the **fourth of five** states under `SCOPE_INCOME_CONDITIONING.md` (CT v5.65, NM v5.66, NJ v5.67). ⚠ **Virginia is the FIRST REAL `taper`** — all three populated states are `bands`, so the evaluator at L1311 is exercised only by `t34`'s synthetic jurisdiction and the scope's job is to prove the WIRING, not the evaluator. Premise re-measured against v5.67 `ca05b2ec…`, tree `8dc9160`; worst case **+$1,380.00/yr** at $99,000 MFJ, every measured point conservative or unchanged. | **OPEN — BUILDABLE. All decisions resolved 2026-09-09**, and the two that matter were reopened by measurement first: **D-VA-2** — keep `excl65: 12000` (the taper yields `perPerson` at zero income, so New Mexico's precedent and the `t10:1257` invariant both apply, against the handover's `0`); **D-VA-3** — repair `t29` F-6a/F-6b FIRST so they can fail at all, THEN re-found the selector on `!r.exclTest`, correcting the wrong `{VA}` measurement at all three shipped sites; **D-VA-6** — that repair ships WITH the Virginia release, not separately. ⚠ **OPEN here means UNBUILT, not undecided.** ⚠ **Re-measure the premise against whatever is shipped when the build starts** — every figure in it is against v5.67 *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | Repo and pool housekeeping — the `dom_entry_*` set, and whether completed history needs to be in the pool | **OPEN — H-1/H-2/H-3/H-4/H-5 all RESOLVED; H-2, H-3 route (a) and the H-3 deletion BUILT 2026-09-07.** Still unbuilt: the **third scope-status sweep** (§5 item 4) and **H-6** (§4a, NEW 2026-09-07 — section K's negative controls are mostly measuring nothing; four report INVALID and one passes for the wrong reason). ⚠ **Until H-6 is repaired, section K's controls are not evidence that section K works.** Held open by name in `package_check`'s I-2 allowlist *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` | — **un-pooled at v5.95, repo-only** (FULFILLED: all three phases; residuals re-homed to MissingFeatures D-12, D-27, D-28) | `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` |
| `SCOPE_HOUSEKEEPING_THREE.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — Three housekeeping items | ☑ **RETIRED 2026-09-14 — all three items closed** (item B on disclosure). *(This row read "OPEN — awaiting decisions" until 2026-09-15; stale since the retirement, corrected when the file left the pool.)* |
| `SCOPE_RI_THRESHOLD_CORRECTION.md` | Rhode Island's TY2025 MFJ threshold | **FULFILLED** — shipped as v5.61; §7 is the build record *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_ENGINE_STATE_PARITY.md` | The three engines shared one state-tax calculator and disagreed anyway | **FULFILLED** — shipped as v5.62; §7 is the build record. ⚠ **Its §2 and §7 assert an `otherOrd` gap that was verified FALSE on 2026-09-03** — see `FINDINGS-v5_63-otherOrd.md`. Read that first; the disclosure is corrected by the pending v5.63 release *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_MANIFEST_D4.md` | This manifest's staleness, and the D-4 check | **the scope for the 2026-09-03 ops package** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STATUS_v5_50_shipped.md` | Ship record for v5.50 | ⚠ **REPO-ONLY — `docs/STATUS_v5_50_shipped.md`** (removed from the pool 2026-09-05, H-2). historical |

### Added 2026-09-03 (second upload that day) — the `otherOrd` verification and the v5.63 workbench

**These three rows exist because the pool gained three files the same afternoon.** `package_check`
K-9 asserts every pool file is named here; adding the files without the rows would fail the next
package, which is the failure mode the section above this one records twice.

| File | What it is | Status |
|---|---|---|
| `FINDINGS-v5_63-otherOrd.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — The `otherOrd` question settled by execution: the v5.62 disclosed gap is **FALSE** (complement identity executed with non-zero readings on both sides), and the Roth comparator instead charges **FICA on rental and annuity income** at two sites. Also records why the earlier runtime attempt read `0`, the six AST-resolved `streamsAnnualAt` call sites, the mislabelled `t10` pin, and two harness facts absent from `TESTING.md` | **current — read before touching `runRothStrategies` or the v5.62 disclosure** |
| `SCOPE_ROTH_FICA_OTHERORD.md` | Scope for v5.63: fix the FICA defect and correct the false disclosure together | **APPROVED 2026-09-03** — D-1 withdrawn (the fix closes it), D-2..D-5 decided by the maintainer. §4's blast radius is measured, not assumed *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-v5_63-fica-workbench.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — v5.63 stopped mid-build: engine fix applied from canonical v5.62 and **2,934 app checks green on both legs**, but no new tests, controls, `METHODOLOGY`, `CHANGELOG` or built artifact. Lists what remains, in order | **OPEN — the entry point for the next session.** The workbench `github/` half is NOT committed |
| `STOP-REPORT-v5_66-NM-note-guarded-set.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — **How New Mexico was stopped the FIRST time, and the defect that stopped it.** §3 is the finding: rewording NM's note to state its phase-out silently drops NM out of the income-limited guarded set that `boundaries.mjs` and `t10` both select with `/income[- ]limited|income limit/i` **against the user-facing note string** — and `t10` still reports green. Second occurrence; the same shape hit New Jersey at v5.54 | ☑ **SUPERSEDED as the entry point 2026-09-07. D-NM-1 is ANSWERED — (c) — and the note half is BUILT and pinned by `t35` D-7a.** Read `STOP-REPORT-v5_66-nm-session2.md` instead. ⚠ **(c)'s SECOND half — corrected 2026-09-08: the scope IS written.** It is `SCOPE_STATE_SET_SELECTOR.md`, dated 2026-09-07, and this row froze before it existed. **(c) has therefore NOT become (a)** — but the scope is unbuilt, so the defect it names is still live and the shipped NM note is held safe only by `t35`'s D-7a pin. Body kept as the record |
| `SCOPE_STATE_SET_SELECTOR.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_STATE_SET_SELECTOR.md` — ☑ **RETIRED — FULFILLED AT v5.72 (§10; stage 2 built as S-2 of SCOPE_IMPORT_HARDENING).** ⚠ **§9 (2026-09-15, second package): the in-law list omits MAINE; stage 2 is now scoped in `SCOPE_IMPORT_HARDENING.md`.** ⚠ **STAGE 1 BUILT 2026-09-15 (its §8); STAGE 2 OWED, so still OPEN and still on the I-2 allowlist.** The premise below was re-measured and amended on 2026-09-14 — **its §7 is authoritative over §§1, 2, 4 and 6**, and the *in-law* set is no longer selected from prose. *(Superseded wording, retained:)* ⚠ **premise annotated at v5.69**: its *unconverted* set is now empty and asserted empty; its *in-law* set is still selected from note prose, so it stays OPEN. **NEW 2026-09-07. Row added 2026-09-08, one package late (K-9).** Stop selecting the income-limited state set by **executing a regex against user-facing copy**. A note reworded to *describe* a phase-out silently drops its state out of the guarded set that `boundaries.mjs` and `t10` both select on, and the suite still reports green — twice observed (NJ at v5.54, NM at v5.66). Its premise is verified against v5.66 source `31b43e094307ef5f996570c090478e13`; the census behind it is `sel_census.cjs`. **No user-visible figure moves — test infrastructure** | **OPEN — written, NOT BUILT.** Discharges the second half of **D-NM-1 (c)**; until it is built, the v5.66 shipped note is held safe only by `t35`'s **D-7a** extinction pin. ⚠ **CORRECTION 2026-09-08 (second package): it IS on `package_check`'s I-2 OPEN allowlist, and the row written earlier the same day said it was not.** The entry has been at `package_check.mjs:535` since the scope was written on 2026-09-07, carrying its own expiry — *when the structural field ships*. The false claim was asserted from reading, never from a command, and it shipped to the repo and the pool in the package whose entire subject was stale claims in this file. **§A0, by the session enforcing §A0.** The cheapest possible test would have caught it: the sentence named a state, and no command had printed it |
| `STOP-REPORT-v5_72-import-hardening-session1.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — ☑ **RESOLVED — v5.72 shipped 2026-09-15; retained as the record** (§G: prefer retiring to deleting). *Was:* **The live import-hardening handover (2026-09-15, KIND: handover).** Session 1 of D-6: H-1…H-5 and half of H-6 built as a workbench with `t38` and `controls_v572_import.py`; **no version bump**. Opens **D-10** (the birth-year clamp is dead code). §5 is the stop table — every file, md5 and destination; §4 is what session 2 owes. `docs/` **and** the pool; **no md5 row** (D-3 excludes this class). Rotates to repo-only when v5.72 ships |
| `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` — ☑ **RETIRED ON ARRIVAL, v5.73** (its D-10). Maine's phaseout and Montana's two corrections, every legal fact from a primary source; §9 is the build record. `docs/` **and** the pool; no md5 row (D-3) |
| `SCOPE_TOOLING_GAPS_V572.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_TOOLING_GAPS_V572.md` — ☑ **RETIRED ON ARRIVAL, 2026-09-15** (its D-6: written, built and retired in one ops package). The four tooling gaps found at the v5.72 ship; §7 is the build record, including the control harness's phase split. `docs/` **and** the pool; no md5 row (D-3) |
| `SCOPE_PACKAGE_CHECK_DECLARATIONS.md` | — **repo-only, never pooled** — `docs/SCOPE_PACKAGE_CHECK_DECLARATIONS.md` — ☑ **RETIRED ON ARRIVAL, 2026-09-22** (its D-5: written, built and retired in one ops package). `C-7` and `G-3c`: `package_check` checks, before upload, the `RETIRE:` and `chmod` declarations that `J-5` and `G-3a` rely on; §6 is the build record. No md5 row (D-3, retired-scope class) |
| `CHANGELOG_ARCHIVE_pre_v5_60.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`: every CHANGELOG entry for v5.59 and earlier, moved verbatim 2026-09-15 (§G). The provenance lines for those releases live here |
| `CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`: every CHANGELOG entry from v5.60 through v5.74, with the ops entries between them, moved verbatim 2026-09-28 (§G), checked byte for byte against the removed block. Never edited. |
| `CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md`: every CHANGELOG entry from v5.75 through v5.99, with the ops entries between them, moved verbatim 2026-10-11 (§G), checked byte for byte against the removed block. Never edited. |
| `TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` | — **repo-only, never pooled** — `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`: `TESTING.md`'s per-suite count lines from v6.25 back to v5.53, moved verbatim — v6.01 and earlier on 2026-10-11, checked byte for byte; v6.02's to v6.17's one per ship at the v6.05 to v6.20 ships; v6.18's to v6.21's together at the v6.24 ship, after the v6.21, v6.22 and v6.23 ships moved none. v6.22's at the v6.25 ship; v6.23's at the v6.26 ship; v6.24's at the v6.27 ship; v6.25's at the v6.28 ship. Its header's *Added since* rows record each. Lines are only ever added, verbatim (the name predates all of them). ⚠ *Corrected at v6.24: this row had stopped at v6.07's line since the v6.11 ship.* |
| `CHANGELOG_ARCHIVE_v6_00_to_v6_15.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_v6_00_to_v6_15.md`: every CHANGELOG entry from v6.00 through v6.15, with the four ops entries between them, moved verbatim 2026-10-19 (§G); §0 header names the one thread re-homed (`t38`, to `TESTING.md`). |
| `TESTING_ARCHIVE_release_notes_to_v5_40.md` | — **repo-only, never pooled** — `docs/TESTING_ARCHIVE_release_notes_to_v5_40.md`: `TESTING.md`'s per-release write-ups to v5.40 (51 paragraphs of its opening section), moved verbatim 2026-10-19 (§G); §0 trace. |
| `MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md` | — **repo-only, never pooled** — `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md`: this manifest's *Test and harness file hashes* section, moved verbatim 2026-10-19 when `qa/` left the pool (DC-2 (a)); §0 records what went where. |
| `MANIFEST_ARCHIVE_notes_and_lists_v6_04_to_v6_19.md` | — **repo-only, never pooled** — `docs/MANIFEST_ARCHIVE_notes_and_lists_v6_04_to_v6_19.md`: this manifest's superseded ship notes and delete-first lists from v6.19 back to v6.04, moved verbatim 2026-10-19 (§G); §0 trace. |
| `MissingFeatures_ARCHIVE_closed_to_v6_20.md` | — **repo-only, never pooled** — `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`: the write-ups of the 28 D items closed or fixed by v6.20 (each keeps its index row in `MissingFeatures.md`), moved verbatim 2026-10-19 (§G); §0 trace. |
| `MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md` | — **repo-only, never pooled** — `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`: the manifest's superseded ship notes (v6.03 back to v5.42) and its delete-first lists (v6.03 back to v5.31), moved verbatim 2026-10-11 (§G), checked by reassembly; its §0 traces every open thread in them and in the six documents un-pooled that day. Parts 1 and 2 are never edited. |
| `SCOPE_IMPORT_HARDENING.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_IMPORT_HARDENING.md` — ☑ **RETIRED — FULFILLED AT v5.72 (§10).** ⚠ **SESSION 1 BUILT 2026-09-15 as a workbench (§9); D-4 measured (§3a); D-10 OPEN (§7a).** **NEW 2026-09-15.** A-2, A-4 and A-5 from `FlawsToFix-v5_69-Phase1.md`, **all re-run and reproduced at v5.71** on both import paths, plus `SCOPE_STATE_SET_SELECTOR` stage 2 folded into the same **v5.72** release so the 86-point bump is paid once. Finds a third truthy skin gate, the ordering defect in all eight `applyLoadedData` callers, and **Maine** income-limited in law but missing from the in-law list | **OPEN — NOT BUILT; all nine decisions TAKEN 2026-09-15 (every recommendation approved).** On the I-2 allowlist; expires at the build that retires it |
| `SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` — **NEW 2026-09-14, RETIRED IN THE PACKAGE THAT BUILT IT.** The three things `package_check` could not see because they are not file contents: a file committed at an **extra** path (`D-3`), a file that should have **left** the pool (`J-5`), and a **file mode** (`G-3`). All six §5 decisions answered as recommended and built the same day, so this never needed an `I-2` OPEN-allowlist entry — it ships classified. ⚠ It was filed to the repo and pool BEFORE being built, which is what moved its own §1 anchor (HEAD `00f8dc4`/339/134 → `b2b76cf`/340/135); every premise was re-measured before building. §7 carries the build record: one correction to its own text (the control numbers), two control-design faults the controls caught in themselves, and the four `.py` mode fixes that ship as **commit instructions, not files**. |
| `SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` | `docs/SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` — **NEW 2026-09-14, OPEN, decided and buildable.** The release gates that did not fire. Its headline is **D-1**: at the v5.71 ship 17 files were uploaded to the repo root instead of `qa/`, leaving a committed `qa/` that could not test its own release, and `package_check` scored 44/2 with both failures documented as expected. D-1 asserts `unchanged.length === 0`, the correct PRE-ship question; §I tells a session to expect D-1 red POST-ship, so a broken upload and a clean one read alike. The post-ship complement — `changed.length === 0` — is already COMPUTED and PRINTED as an informational line and asserted nowhere (33 pre-ship / 17 broken / 0 clean, measured). Also: **B-2** matches `knowledge/index.html` by NAME and calls the 5,029-byte Vite template the 1,428,589-byte built artifact; **F-4**'s `controls_v570_b3.sh` at `100644`; §H's comment claiming a session cannot reach Pages (false — measured 2026-09-14); and two traps for OPERATIONS (`globalThis` vs `window` for `FileReader`; `t31`'s `ORDER` and `t24`'s `_k` as the second and third registry shapes `vercensus` cannot sweep). All six §5 decisions answered 2026-09-14; §7 is authoritative for D-1, whose oracle was refined from `K-2` to `J-1`/`J-2` to drop an ops carve-out. ⚠ Deliberately UNROWED, like the open scope above: a retired or open `SCOPE_*` is history or pending, not build state (D-3). **Named here 2026-09-14, one package late (K-9)** — the same lateness as its `I-2` entry, and for the same reason: the scope was uploaded alone. ⚠ **RETIRED 2026-09-14** in the ops package that built it, with a **§10 build record**; its `I-2` allowlist entry was removed from `package_check.mjs` in the **same** package, as its own entry required. Stays in the pool. §10 carries a seventh decision **D-7** (the v5.71 flattening is the THIRD instance of a shape §C records; the extra-path gate is deferred with a named reason), **three corrections to the scope's own text** — including that §I did **not** record `t33`'s `PINS` (`TESTING.md` did) and that the ternary registry shape has **three** sites, not one — and a finding that **F-4's mode fix could not be delivered as a packaged file**, because `package_check` has no mode awareness and §L records that replacing a tracked file preserves its mode *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_K8_ROW_MATCHER_PY.md` | `docs/SCOPE_K8_ROW_MATCHER_PY.md` — **NEW 2026-09-08.** `package_check` **K-8**'s row matcher does not recognise `.py`, so a stale hash row on any of the pool's three Python files would be **invisible** — verified by execution, not argued: a scratch manifest carrying a deliberately stale `oracle_nm.py` row leaves K-8 green under the current matcher and fires under the widened one. ⚠ **Its §2 is the reason it is a scope and not a one-token edit: an AST census found FOUR live copies of that expression** — the gate, this file's own D-5 count block, `controls_manifest_rows.py`'s target selector, and `P32`'s narrower one — **plus a fifth, in `SCOPE_HOUSEKEEPING_THREE.md`, that has already drifted to the pre-`D-C-1` form.** This file claims its D-5 block *cannot drift away from the gate*; that is true only while both are edited together. ⚠ **Its §1b is the trap**: all three candidate matchers see the same 78 rows on today's manifest, so the change is INERT until a `.py` row exists and any test written against the tree as it stands proves nothing — the endpoint-only table-test class | ☑ **RETIRED — FULFILLED 2026-09-08, the same day it was written.** All five decisions answered as recommended: **D-1 (a)** `py` added, **D-2 (c)** `oracle_nm.py` rowed and the two control scripts not, **D-3 (a)** both copies widened with `row_census.cjs` shipping as the condition, **D-4 (a)** and **D-5 (a)** the two other copies annotated in place. §7 is the build record. ⚠ **It never needed an I-2 allowlist entry** — it was written and retired inside one day, so the gate saw it unclassified in exactly one package and that was expected and stated. ⚠ **Its §1b is worth keeping**: the widening was INERT against the live manifest, so the controls had to INJECT a `.py` row; `P44` fires on the new gate and **NOT CAUGHT** on the old one, which is the witness *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_A3_DRAFT_AUTOSAVE.md` | **NEW 2026-09-12 — the scope for v5.71.** A-3 (the My Data draft autosave has never saved: eight sites call `getItem`/`setItem`/`removeItem` on a storage API that has only `get`/`set`/`delete`/`list`, every throw swallowed by an empty `catch`), with **A-6** (an imported `masterPrompt` is assigned unchecked and heads every Ask AI system prompt) and **F-3** (the first-open gate's unconditional "nothing is uploaded") folded in — one version bump and one rebuild between them. ⚠ Its §0 records three things found while scoping: `clearStorage` covers only the fourteen `STORAGE_KEYS` and **not** the draft key, so repairing A-3 without the wipe path would ship the leak the v5.9.1 review prevented; the suite has **zero** coverage of the draft feature (AST census including regex literals), contradicting `VERIFICATION_REPORT.md`'s v5.9.1 claim of a `t1` guard; and `restoreDraft`, `discardDraft` and the recovery banner have **never executed**. All six §5 decisions approved 2026-09-12 as recommended — ⚠ the 20,000-character prompt cap among them is a judgement, not a measurement | ⚠ **REPO + POOL — `docs/SCOPE_A3_DRAFT_AUTOSAVE.md`.** **OPEN — decided, unbuilt.** On the I-2 allowlist; ⚠ **both the entry and this row expire at the v5.71 build**, which retires the scope with a build record *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-v5_66-nm-session2.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — **The live New Mexico handover.** Source written and version-bumped at all four in-app sites; **eighteen suites register `v566`, verified by an AST sweep**; two Connecticut-only assertions **gated, not rewritten**; six new `t34` assertions and `t35` **D-7a**, with five negative controls and two null controls all behaving. ⚠ Records two errors caught by running things and not by review: an assertion that checked only its table's endpoints, and a **workspace drift** that only the null control could have noticed | ☑ **DISCHARGED — v5.66 SHIPPED 2026-09-07. Status corrected 2026-09-08; this row was written mid-build and froze.** Everything it listed as owed has landed: the dollar-exact NM block (`t10` 244 → 288 current, 244 → 248 frozen), METHODOLOGY, the built artifact, packaging, and P1–P28, which **all fired**. The ten `0 passed, 0 failed` suites were diagnosed and none was an app defect — nine run-folder setup, two argument conventions, one real fail-closed in `t33`; `qa/runsuite.sh` now reports `DIED` rather than `0/0`. ⚠ **Its closing line — *"the v5.66 source is NOT in the repo or the pool"* — is FALSE as of the ship** and was left standing for a day: the source is committed at `src/DangerClose.jsx` and pooled as `DangerClose-v5_66.jsx`, both `31b43e094307ef5f996570c090478e13`. **Body kept as the record of the stop; read it as history, not as a resume order.** The one thing genuinely still owed is the selector fix, which is now `SCOPE_STATE_SET_SELECTOR.md` |

⚠ **The suite total being UNCHANGED across the v5.63 fix is not reassurance.** No suite fixture
carries a non-zero income stream, so the changed path is unreachable by every existing check. That
is why the defect shipped. Recorded here because a session reading only the counts would draw the
opposite conclusion.

### Added 2026-09-07 (H-5) — six history documents that were named only in PROSE

**These six have always been in `docs/` and were never broken** — `package_check` **K-9** is
satisfied by a bare mention anywhere in this file, so none of them ever failed a gate. They had no
table row, which means a reader scanning the tables would conclude they do not exist. §G's whole
argument for *retiring rather than deleting* is that a row is what tells a future session a document
exists at all; **by that argument a prose mention is a row that has already half-decayed.**

⚠ **Found by the same table parser that found H-2's 24 stale rows, not by a grep.** A row-anchored
search reported three of these as having no row; the parse found six. The handover that carried the
figure of three said in its own text not to trust a row-anchored grep for exactly this reason.

| File | What it is | Status |
|---|---|---|
| `AUDIT_STATE_EXCL65_ROUND2.md` | Round 2 of the state `excl65` audit; predecessor of `AUDIT_STATE_EXCL65_NOTES.md`, which covered 6 of 19 states | ⚠ **REPO-ONLY — `docs/AUDIT_STATE_EXCL65_ROUND2.md`**. Row added 2026-09-07 (H-5); the document itself is older and unchanged |
| `FINDINGS-v5_54-session-2.md` | Findings from the second v5.54 session | ⚠ **REPO-ONLY — `docs/FINDINGS-v5_54-session-2.md`**. Row added 2026-09-07 (H-5) |
| `STATUS_v5_37_shipped.md` | The v5.37 ship record | ⚠ **REPO-ONLY — `docs/STATUS_v5_37_shipped.md`**. Row added 2026-09-07 (H-5) |
| `STATUS_v5_43_shipped.md` | The v5.43 ship record | ⚠ **REPO-ONLY — `docs/STATUS_v5_43_shipped.md`**. Row added 2026-09-07 (H-5) |
| `STOP-REPORT-v5_54-session-budget.md` | v5.54 stopped on session budget. ⚠ Its version-cost measurement was wrong by a factor of sixty — the finding that `qa/tools/vercensus.cjs` exists to make un-stale | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_54-session-budget.md`**. Row added 2026-09-07 (H-5) |
| `STOP-REPORT-v5_56-session-budget.md` | v5.56 stopped on session budget | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_56-session-budget.md`**. Row added 2026-09-07 (H-5) |

⚠ **Two further names appear in prose and are NOT in `docs/` — that is correct, not a gap.**
`STATUS_v5_36_partial.md` and `STATUS_v5_32_ACA_FLOOR_PARTIAL.md` are recorded struck-through as
retired and superseded. They get no row because there is no file. Checked 2026-09-07 against the
committed tree, so the next sweep does not re-open them.

## Retirement list (delete-first; nothing replaces these)

### At the v6.39 ship (2026-10-30) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_38.jsx`; `DangerClose-v6_39.jsx` arrives. **Pool stays 16** documents. Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_38.jsx` | **rotated out** — v6.38 is read from the repo's history (commit `65c6b10`) |
| `CHANGELOG.md` | replaced — the v6.39 entry |
| `METHODOLOGY.md` | replaced — §11: the live context carries the accounts by tax type and owner, the contributions, salaries, pension owner, ACA bridge and gain share |
| `MissingFeatures.md` | replaced — D-69 filed and closed; D-70 filed |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.39 per-suite line, v6.36's moved to the archive; `t103`'s, `dom_entry_v639.jsx`'s and the census row's entries; `t92`'s re-gate |
| `UsabilityFlaws.md` | replaced — F-30's list said *"My Data 21"* where its census row and note say 8 (corrected) |

**Arriving new:** `DangerClose-v6_39.jsx`. **Not changed, stays:** `FlawsToFix-v5_73-Phase2.md`, `ARCHITECTUREIssues.md`, `OPERATIONS.md`, `README.md`, the four scaffold files, `SCOPE_STANDING_AUDIT.md`. **Repo-only:** every `qa/` change (`t103_ai_context.mjs`,
`qa-baseline/dom_entry_v639.jsx`, `tools/controls_v639_ai_context.py` new; the registered suites, `t92` (E-2/E-3), `t29` and `tools/boundaries.mjs` (the row), `t33`, `t93`,
`t45`/`t47`/`t48`, `runsuite.sh`, the shim, `tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now v6.40)),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.36's line and note appended), the D-69 scope (`docs/SCOPE_D69_AI_CONTEXT_V639.md`, new — built, §8 its record),
the TY2027 scope (renumbered v6.40), the built `index.html`. (`docs/UsabilityFlaws.md` and `docs/MissingFeatures.md` ship to both, under their pool names.)

### At the v6.38 ship (2026-10-29) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_37.jsx`; `DangerClose-v6_38.jsx` arrives. **Pool stays 16** documents. Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_37.jsx` | **rotated out** — v6.37 is read from the repo's history (commit `ecde3ff`) |
| `CHANGELOG.md` | replaced — the v6.38 entry |
| `METHODOLOGY.md` | replaced — one sentence: D-49's phone-layout precondition is met (F-20) |
| `MissingFeatures.md` | replaced — D-49's row and write-up note F-20's fix |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.38 per-suite line, v6.35's moved to the archive; `t102`'s, `t45` §S's, the fixture's, `dom_entry_v638.jsx`'s and the census row's entries |
| `UsabilityFlaws.md` | replaced — F-20 fixed (its census row and §H entry); F-30 filed |

**Arriving new:** `DangerClose-v6_38.jsx`. **Not changed, stays:** `FlawsToFix-v5_73-Phase2.md`, `ARCHITECTUREIssues.md`, `OPERATIONS.md`, `README.md`, the four scaffold files, `SCOPE_STANDING_AUDIT.md`. **Repo-only:** every `qa/` change (`t102_income_tab.mjs`,
`qa-baseline/dom_entry_v638.jsx`, `tools/controls_v638_income.py`, `tools/fixture/f20_streams_plan.json` new; the registered suites, `t45` (§S), `t29` and `tools/boundaries.mjs` (the row),
`t33`, `t93`, `t47`/`t48`, `runsuite.sh`, `tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now v6.39)),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.35's line and note appended), the F-20 scope (`docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md`, new —
built, §8 its record), the TY2027 scope (renumbered v6.39), the built `index.html`. (`docs/UsabilityFlaws.md` and `docs/MissingFeatures.md` ship to both, under their pool names.)

### At the v6.37 ship (2026-10-29) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_36.jsx`; `DangerClose-v6_37.jsx` arrives. **Pool stays 16** documents. Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_36.jsx` | **rotated out** — v6.36 is read from the repo's history (commit `c3c72f0`) |
| `CHANGELOG.md` | replaced — the v6.37 entry |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.37 per-suite line, v6.34's moved to the archive; `t101`'s, `dom_entry_v637.jsx`'s and the census rows' entries |
| `UsabilityFlaws.md` | replaced — F-29 filed and fixed (its census row and §H entry) |

**Arriving new:** `DangerClose-v6_37.jsx`. **Not changed, stays:** `METHODOLOGY.md` (a presentation release), `MissingFeatures.md`, `FlawsToFix-v5_73-Phase2.md`. **Repo-only:** every `qa/` change (`t101_ss_slider_start.mjs`,
`qa-baseline/dom_entry_v637.jsx`, `tools/controls_v637_ss_slider.py` new; the registered suites, `t6` (re-gated), `t29` and `tools/boundaries.mjs` (the two rows),
`t33`, `t93`, `t45`/`t47`/`t48`, `runsuite.sh`, `tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now v6.38)),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.34's line and note appended), the F-29 scope (`docs/SCOPE_F29_SS_SLIDER_START.md`, new —
built, §7 its record), the TY2027 scope (renumbered v6.38), the built `index.html`. (`docs/UsabilityFlaws.md` ships to both, as `UsabilityFlaws.md` in the pool.)

### At the v6.36 ship (2026-10-28) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_35.jsx`; `DangerClose-v6_36.jsx` arrives. **Pool stays 16** documents. Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_35.jsx` | **rotated out** — v6.35 is read from the repo's history (commit `2762bf7`) |
| `CHANGELOG.md` | replaced — the v6.36 entry |
| `METHODOLOGY.md` | replaced — *What Breaks pays the Monte Carlo's tax (v6.36)*; four passages closed or marked superseded |
| `MissingFeatures.md` | replaced — D-66 closed, D-68 filed, D-57 updated |
| `FlawsToFix-v5_73-Phase2.md` | replaced — its D-7b row points to MissingFeatures D-68 |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.36 per-suite line, v6.33's moved to the archive; `t100`'s and `dom_entry_v636.jsx`'s entries |

**Arriving new:** `DangerClose-v6_36.jsx`. **Repo-only:** every `qa/` change (`t100_whatbreaks_tax.mjs`, `qa-baseline/dom_entry_v636.jsx`,
`tools/controls_v636_whatbreaks.py` new; the registered suites, `t8`, `t49`, `t57`, `t81`, `t83`, `t93`, `t94` and `t98` (re-gated), `t33`,
`t45`/`t47`/`t48`, `runsuite.sh`, the shim, `tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now v6.37)),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.33's line and note appended), the v6.36 scope (`docs/SCOPE_D66_WHATBREAKS_TAX.md`,
new — built, §7 its record), the TY2027 scope (renumbered v6.37), the built `index.html`.

### At the v6.35 ship (2026-10-28) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_34.jsx`; `DangerClose-v6_35.jsx` arrives. **Pool stays 16** documents. Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_34.jsx` | **rotated out** — v6.34 is read from the repo's history (commit `39e763d`) |
| `CHANGELOG.md` | replaced — the v6.35 entry |
| `METHODOLOGY.md` | replaced — *STAY UNDER IRMAA, the last working years, and one-time rows before retirement (v6.35)*; four passages rewritten |
| `MissingFeatures.md` | replaced — D-44, D-62 and D-65 closed |
| `UsabilityFlaws.md` | replaced — F-25's census row reads FIXED v6.29, as its section has since that release |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.35 per-suite line, v6.32's moved to the archive; `t98`'s and `dom_entry_v635.jsx`'s entries |
| `DangerClose_audit_remaining_v6_34.xlsx` | **recommended, Steve's call** — a file upload, not a manifest document (it has no row, and the 16 above do not count it): the remaining-audit workbook made at v6.34 and added 2026-10-28. v6.35 closes three of its rows, and its D-62 row calls the defect optimistic, which the scope found wrong (§0.4). If kept, it needs a row or a reason here (OPERATIONS §I) |

**Arriving new:** `DangerClose-v6_35.jsx`. **Repo-only:** every `qa/` change (`t98_irmaa_onetime.mjs`, `qa-baseline/dom_entry_v635.jsx`,
`tools/controls_v635_irmaa_onetime.py` new; the registered suites, `t2` compare, `t22`, `t81`, `t83`, `t93`, `t94` (re-gated), `t29` (the boundary rows), `t96`'s skip line, `t33`,
`t45`/`t47`/`t48`, `runsuite.sh`, the shim, `tools/boundaries.mjs`, `tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now
v6.36), `domdiff_withdrawal.mjs` (registered; bounds the pair's Withdrawal-tab copy), `units_v630.mjs`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.32's line and note appended), the
v6.35 scope (`docs/SCOPE_D62_D65_D44_V635.md`, new — built, §7 its record), the TY2027 scope (renumbered v6.36), the built `index.html`.

### At the v6.34 ship (2026-10-27) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_33.jsx`; `DangerClose-v6_34.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_33.jsx` | **rotated out** — v6.33 is read from the repo's history (commit `045de6b`) |
| `CHANGELOG.md` | replaced — the v6.34 entry |
| `METHODOLOGY.md` | replaced — *My Data keeps spouse A's stored pre-tax contribution (v6.34)*; two false contribution sentences corrected; the v6.24 bullet closed |
| `MissingFeatures.md` | replaced — D-58 closed |
| `OPERATIONS.md` | replaced — §C4's save trap keeps only the as-of move |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.34 per-suite line, v6.31's moved to the archive; `t97`'s and `dom_entry_v634.jsx`'s entries |

**Arriving new:** `DangerClose-v6_34.jsx`. **Repo-only:** every `qa/` change (`t97_contrib_save.mjs`, `qa-baseline/dom_entry_v634.jsx`,
`tools/controls_v634_contrib.py` new; the registered suites, `t8` and `t9` (re-gated), `t33`, `t93`, `t45`/`t47`/`t48`, `runsuite.sh`, the shim,
`tools/package_check.mjs`'s OPEN allowlist reason (the TY2027 scope, now v6.35), `domdiff_withdrawal.mjs`, `units_v630.mjs`),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.31's line and note appended), the D-58 scope (`docs/SCOPE_D58_CONTRIB_SAVE_V634.md`, new
— built, §7 its record), the TY2027 scope (renumbered v6.35), the built `index.html`.

### At the v6.33 ship (2026-10-27) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_32.jsx`; `DangerClose-v6_33.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_32.jsx` | **rotated out** — v6.32 is read from the repo's history (commit `b781d7f`) |
| `CHANGELOG.md` | replaced — the v6.33 entry |
| `METHODOLOGY.md` | replaced — *The tables index from their own year (v6.33)*; the one-clock and surcharge notes in the v6.30 section |
| `MissingFeatures.md` | replaced — D-67 filed and closed |
| `OPERATIONS.md` | replaced — §I's refresh row and §C's OBBBA bullet name the year-keyed tables |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.33 per-suite line, v6.30's moved to the archive; `t96`'s and `dom_entry_v633.jsx`'s entries |
| `UsabilityFlaws.md` | replaced — F-27 closed by decision; F-28 filed and fixed |

**Arriving new:** `DangerClose-v6_33.jsx`. **Repo-only:** every `qa/` change (`t96_table_year.mjs`, `qa-baseline/dom_entry_v633.jsx`,
`tools/controls_v633_table_year.py` new; the registered suites, `t22`, `t78`, `t95`, `t29`, `domdiff_withdrawal.mjs`, `tools/boundaries.mjs`,
`tools/fed_oracle_v630.mjs`'s comment, `tools/package_check.mjs`'s OPEN allowlist (the scope, until v6.34), `runsuite.sh`, the shim), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.30's line and note
appended), the scope (`docs/SCOPE_TY2027_REFRESH_V633_V634.md` — v6.33 built, v6.34 open), the built `index.html`.

### At the v6.32 ship (2026-10-25) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_31.jsx`; `DangerClose-v6_32.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_31.jsx` | **rotated out** — v6.31 is read from the repo's history (commit `a018e1b`) |
| `CHANGELOG.md` | replaced — the v6.32 entry |
| `METHODOLOGY.md` | replaced — *QCDs after a death (v6.32)*; the QCD summary; the ladder's taper-year sentences |
| `MissingFeatures.md` | replaced — D-61 closed |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `README.md` | replaced — DF-6: every stale claim rewritten |
| `TESTING.md` | replaced — the v6.32 per-suite line, v6.29's moved to the archive; `t95`'s, `dom_entry_v632.jsx`'s and the census rows' entries |
| `UsabilityFlaws.md` | replaced — F-26 and F-15b closed; F-27 filed |

**Arriving new:** `DangerClose-v6_32.jsx`. **Repo-only:** every `qa/` change (`t95_f26_d61.mjs`, `qa-baseline/dom_entry_v632.jsx`,
`tools/controls_v632_f26_d61.py` new; the re-gated and registered suites, `tools/boundaries.mjs`, `t29`, `mk_runfolder.sh`, the shim),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.29's line and note appended), the scope (`docs/SCOPE_F26_D61_V632.md`, fulfilled),
the built `index.html`.

### At the v6.31 ship (2026-10-24) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_30.jsx`; `DangerClose-v6_31.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_30.jsx` | **rotated out** — v6.30 is read from the repo's history (commit `9eee5a7`) |
| `ARCHITECTUREIssues.md` | replaced — E-30 (c) closed (AI-6) |
| `CHANGELOG.md` | replaced — the v6.31 entry |
| `METHODOLOGY.md` | replaced — *The Monte Carlo pays IRMAA (v6.31)*; the v6.20 section's IRMAA bullet and What-Breaks bullet closed; the SSA-44 paragraph corrected for D-65 |
| `MissingFeatures.md` | replaced — D-51 closed; D-65 and D-66 added |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.31 per-suite line, v6.28's moved to the archive; `t94`'s, `dom_entry_v631.jsx`'s and the census row's entries |
| `UsabilityFlaws.md` | replaced — F-26's token-count item addressed |

**Arriving new:** `DangerClose-v6_31.jsx`. **Repo-only:** every `qa/` change (`t94_mc_irmaa_ai.mjs`, `qa-baseline/dom_entry_v631.jsx`,
`tools/controls_v631_mc_irmaa_ai.py` new; the re-gated and registered suites, `tools/boundaries.mjs`, `runsuite.sh`),
`docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.28's line and note appended), the scope (`docs/SCOPE_D51_AI6_V631.md`, fulfilled),
the built `index.html`.

### At the v6.30 ship (2026-10-23) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_29.jsx`; `DangerClose-v6_30.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_29.jsx` | **rotated out** — v6.29 is read from the repo's history (commit `be4b76f`) |
| `ARCHITECTUREIssues.md` | replaced — E-9 closed; E-22 narrowed; E-23 noted |
| `CHANGELOG.md` | replaced — the v6.30 entry |
| `FlawsToFix-v5_73-Phase2.md` | replaced — C-13's reason re-worded (the 2% proxy it cited is gone) |
| `METHODOLOGY.md` | replaced — *One dollar unit and one inflation clock for the tax engines (v6.30)*; the dollar-basis, indexation, wage-base and *no growth* passages re-worded; v6.29's both-readings figures withdrawn and corrected |
| `MissingFeatures.md` | replaced — D-60 closed; D-64 added |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.30 per-suite line, v6.27's moved to the archive; `t93`'s, `dom_entry_v630.jsx`'s and the new tools' rows |

**Arriving new:** `DangerClose-v6_30.jsx`. **Repo-only:** every `qa/` change (`t93_dollar_units.mjs`, `units_v630.mjs`, `dom_entry_v630.jsx`,
`tools/fed_oracle_v630.mjs`, `tools/validate_v630.mjs`, `tools/controls_v630_dollar_units.py` new; the re-gated and registered suites,
`tools/sim_ledger.mjs`, `tools/boundaries.mjs`, `shim.txt`, `runsuite.sh`, `domdiff_withdrawal.mjs`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`
(v6.27's line and note appended), the scope (`docs/SCOPE_D60_DOLLAR_UNITS_V630.md`, fulfilled), the built `index.html`.

### At the v6.29 ship (2026-10-22) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_28.jsx`; `DangerClose-v6_29.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_28.jsx` | **rotated out** — v6.28 is read from the repo's history (commit `21a5dde`) |
| `ARCHITECTUREIssues.md` | replaced — E-23 notes the six AMT Verify checks |
| `CHANGELOG.md` | replaced — the v6.29 entry |
| `METHODOLOGY.md` | replaced — *The dollar basis — measured, both readings (v6.29)*; the state measure carries the taxable yield (two passages corrected); the bracket-creep generalisation corrected |
| `MissingFeatures.md` | replaced — D-60 to D-63 added; D-57 widened, its gap-draw note closed |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.29 per-suite line, v6.26's moved to the archive; `t92`'s and `dom_entry_v629.jsx`'s rows; notes on the re-gated suites |
| `UsabilityFlaws.md` | replaced — F-25 closed; F-26 filed |

**Arriving new:** `DangerClose-v6_29.jsx`. **Repo-only:** every `qa/` change (`t92_model_claims.mjs`, `dom_entry_v629.jsx`,
`controls_v629_model_claims.py` new; the registered suites, `t33` PINS, `t1`, `t4`, `t29`, `t35`, `t78`, `t83`, `t86`, `t90`, `t91`,
`boundaries.mjs`, `fixture/households.mjs`, `shim.txt`, `runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.26's line and
note appended), the scope (`docs/SCOPE_F25_MODEL_CLAIMS_V629.md`, fulfilled) and its ledger (`docs/F25_LEDGER_V628.tsv`), the built `index.html`.

### At the v6.28 ship (2026-10-22) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_27.jsx`; `DangerClose-v6_28.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_27.jsx` | **rotated out** — v6.27 is read from the repo's history (commit `35a1926`) |
| `CHANGELOG.md` | replaced — the v6.28 entry |
| `METHODOLOGY.md` | replaced — §9: the schedule applies no guardrails and computes no income tax; the guardrails are the Monte Carlo's |
| `MissingFeatures.md` | replaced — D-57 notes the gap-draw figure |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; the per-suite archive's row; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.28 per-suite line, v6.25's moved to the archive; `t91`'s and `dom_entry_v628.jsx`'s rows; notes on `t4`, `t19`, `t29`, `t72`, `t86`, `t90`, `boundaries.mjs`, `domdiff` |
| `UsabilityFlaws.md` | replaced — F-23 and F-24 closed; F-25 filed |

**Arriving new:** `DangerClose-v6_28.jsx`. **Repo-only:** every `qa/` change (`t91_directives.mjs`, `dom_entry_v628.jsx`,
`controls_v628_directives.py` new; the registered suites, `t33` PINS, `t4`, `t19`, `t29`, `t72`, `t86`, `t90`, `boundaries.mjs`, `shim.txt`,
`domdiff_withdrawal.mjs`, `runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.25's line and note appended), the scope
(`docs/SCOPE_F23_F24_DIRECTIVES_V628.md`, fulfilled), the census (`docs/F25_CENSUS_V627.tsv`), the built `index.html`.

### At the v6.27 ship (2026-10-21) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_26.jsx`; `DangerClose-v6_27.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_26.jsx` | **rotated out** — v6.26 is read from the repo's history (commit `ac5c7d7`) |
| `CHANGELOG.md` | replaced — the v6.27 entry |
| `MissingFeatures.md` | replaced — D-56 widened (the Grade tab's literal grades and fixed labels) |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; the per-suite archive's row; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.27 per-suite line, v6.24's moved to the archive; `t90`'s and `dom_entry_v627.jsx`'s rows |
| `UsabilityFlaws.md` | replaced — F-22 closed; F-23 and F-24 filed |

**Arriving new:** `DangerClose-v6_27.jsx`. **Not changed, stays:** `METHODOLOGY.md` (a presentation release). **Repo-only:** every `qa/` change
(`t90_grade_findings.mjs`, `dom_entry_v627.jsx`, `controls_v627_grade.py` new; the registered suites, `t33` PINS, `boundaries.mjs`, `t29`,
`runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (v6.24's line and note appended), the scope
(`docs/SCOPE_F22_GRADE_FINDINGS_V627.md`, fulfilled), the built `index.html`.

### At the v6.26 ship (2026-10-21) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_25.jsx`; `DangerClose-v6_26.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_25.jsx` | **rotated out** — v6.25 is read from the repo's history (commit `0859894`) |
| `CHANGELOG.md` | replaced — the v6.26 entry |
| `METHODOLOGY.md` | replaced — §11: what Ask AI sends, the ground rules first |
| `MissingFeatures.md` | replaced — D-55 closed |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; the per-suite archive's row; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.26 per-suite line, v6.23's moved to the archive; `t89`'s and `dom_entry_v626.jsx`'s rows |
| `UsabilityFlaws.md` | replaced — F-22 filed (the Grade tab's recommended actions) |

**Arriving new:** `DangerClose-v6_26.jsx`. **Repo-only:** every `qa/` change (`t89_ai_ground_rules.mjs`, `dom_entry_v626.jsx`,
`controls_v626_ai_rules.py` new; the registered suites, `t33` PINS, `t66` E-7, `t85` D-7, `runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`
(v6.23's line and note appended), the scope (`docs/SCOPE_D55_AI_GROUND_RULES_V626.md`, fulfilled), the built `index.html`.

### At the v6.25 ship (2026-10-21) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_24.jsx`; `DangerClose-v6_25.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_24.jsx` | **rotated out** — v6.24 is read from the repo's history (commit `115c051`) |
| `CHANGELOG.md` | replaced — the v6.25 entry |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; the per-suite archive's row; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.25 per-suite line, v6.22's moved to the archive; `t88`'s and `dom_entry_v625.jsx`'s rows |
| `UsabilityFlaws.md` | replaced — F-21 filed and fixed (its census row and §H entry) |

**Arriving new:** `DangerClose-v6_25.jsx`. **Repo-only:** every `qa/` change (`t88_holdings_columns.mjs`, `dom_entry_v625.jsx`,
`controls_v625_columns.py` new; the registered suites, `t33` PINS, `runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`
(v6.22's line and note appended), the scope (`docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md`, fulfilled), the built `index.html`.

### At the v6.24 ship (2026-10-20) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_23.jsx`; `DangerClose-v6_24.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_23.jsx` | **rotated out** — v6.23 is read from the repo's history (commit `aced4a4`) |
| `CHANGELOG.md` | replaced — the v6.24 entry |
| `METHODOLOGY.md` | replaced — *My Data keeps each expense row's months (v6.24)*; the v6.21 D-52 bullet closed and corrected |
| `MissingFeatures.md` | replaced — D-52 and D-59 closed; D-54 closed for new wizard plans; D-56 extended; D-58 opened |
| `OPERATIONS.md` | replaced — §C4: an unedited Save & Apply is not a no-op on the portfolio; a DOM remount does not reset the plan |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; the per-suite archive's row corrected; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.24 per-suite line, v6.18's to v6.21's moved to the archive; `t87`'s and `dom_entry_v624.jsx`'s rows |

**Arriving new:** `DangerClose-v6_24.jsx`. **Repo-only:** every `qa/` change (`t87_expense_months.mjs`, `dom_entry_v624.jsx`,
`controls_v624_months.py` new; the registered suites, `t84` G-11, `t33` PINS, `runsuite.sh`), `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`
(four lines and their notes appended), the scope (`docs/SCOPE_D52_EXPENSE_MONTHS_V624.md`, fulfilled), the built `index.html`.

### At the v6.23 ship (2026-10-20) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_22.jsx`; `DangerClose-v6_23.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_22.jsx` | **rotated out** — v6.22 is read from the repo's history (commit `4231562`) |
| `CHANGELOG.md` | replaced — the v6.23 entry |
| `METHODOLOGY.md` | replaced — *Built-in work is the example's alone (v6.23)*; the streams paragraph (What-Breaks), the D-10 residual, the payroll and v6.20 passages corrected |
| `MissingFeatures.md` | replaced — D-49 narrowed to the example (its wording corrected); D-10's residual (2) corrected; D-57 opened |
| `OPERATIONS.md` | replaced — §C4: never two full suites, or two `t2` / `t6` runs, at once (shared `/tmp` files) |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.23 per-suite line; `t86`'s, `dom_entry_v623.jsx`'s and `example_work_rows.mjs`'s rows |
| `UsabilityFlaws.md` | replaced — F-20 filed (the Income tab's stream list scrolls sideways at 390 px) |

**Arriving new:** `DangerClose-v6_23.jsx`. **Repo-only:** every `qa/` change (`t86_builtin_work.mjs`, `dom_entry_v623.jsx`,
`controls_v623_work.py`, `tools/example_work_rows.mjs` new; the registered suites, the fixtures of `t16`, `t20`, `t40`, `t43`, `t71`, the
gates of `t83` and `t84`, `t29`, `domdiff_withdrawal.mjs`, `shim.txt`, `runsuite.sh`, `tools/boundaries.mjs`), `docs/FlawsToFix-v5_10_2-Phase2A.md`
(the neutraliser note), the scope (`docs/SCOPE_D49_WORK_TAPER_V623.md`, fulfilled), the built `index.html`.

### At the v6.22 ship (2026-10-20) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_21.jsx`; `DangerClose-v6_22.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_21.jsx` | **rotated out** — v6.21 is read from the repo's history (commit `83d4d9b`) |
| `ARCHITECTUREIssues.md` | replaced — E-32: two dead load paths |
| `CHANGELOG.md` | replaced — the v6.22 entry |
| `METHODOLOGY.md` | replaced — *A plan's facts are its own (v6.22)*; the D-53 sibling bullet in the v6.21 section closed |
| `MissingFeatures.md` | replaced — D-53 closed (D-50's narrowing lifted); D-55 and D-56 opened |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.22 per-suite line; `t85`'s and `dom_entry_v622.jsx`'s rows |

**Arriving new:** `DangerClose-v6_22.jsx`. **Repo-only:** every `qa/` change (`t85_prompt_carryover.mjs`, `dom_entry_v622.jsx`,
`controls_v622_prompt.py` new; the registered suites, `t20`, `t29`, `t33`, `t37`, `t84`, `qa-baseline/t1_units.mjs`, `qa-baseline/t4_dom.mjs`,
`runsuite.sh`, `tools/boundaries.mjs`), `docs/FlawsToFix-v5_69-Phase1.md` (A-6 note), the scope (`docs/SCOPE_D53_PROMPT_V622.md`, fulfilled),
the built `index.html`.

### At the v6.21 ship (2026-10-19) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_20.jsx`; `DangerClose-v6_21.jsx` arrives. **Pool stays 16.** Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_20.jsx` | **rotated out** — v6.20 is read from the repo's history (commit `3d19b5c`) |
| `CHANGELOG.md` | replaced — the v6.21 entry |
| `METHODOLOGY.md` | replaced — *Cars are expense rows (v6.21)*; D-47's limitation closed |
| `MissingFeatures.md` | replaced — D-42, D-43, D-47, D-50 closed; D-52 to D-54 opened |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — the v6.21 per-suite line; `t84`'s and `dom_entry_v621.jsx`'s rows |

**Arriving new:** `DangerClose-v6_21.jsx`. **Repo-only:** every `qa/` change (`t84_car_rows.mjs`, `dom_entry_v621.jsx`, `controls_v621_car.py`
new; the registered and re-pinned suites, `shim.txt`, `runsuite.sh`, `domdiff_withdrawal.mjs`, `tools/boundaries.mjs`,
`tools/v617_spending.mjs`), the scope (`docs/SCOPE_D42_CAR_V621.md`, fulfilled), the built `index.html`.

### At the ops package of 2026-10-19 (second) — DELETE THESE FIRST

**5 files replaced, 126 leave, nothing arrives. Pool 142 → 16.** v6.20 stays current. Every `qa/` file leaves (`docs/SCOPE_UNPOOL_QA_CODE.md`,
DC-1 (a)); each is declared `RETIRE:` in the package's `MANIFEST.txt`, so `package_check` J-5 and J-6 confirm it left.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-31: open threads re-homed from the `qa/` files and the hash table |
| `CHANGELOG.md` | replaced — this package's ops entry |
| `OPERATIONS.md` | replaced — §A2, §G (*qa/ is repo-only*), §C4 (the traps re-homed), §L |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — the hash table archived, *Pooled file hashes*, rows marked repo-only, this list |
| `TESTING.md` | replaced — the per-file index (every departing file's description, verbatim); the run-argument note corrected |
| `boundaries.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `cap_tabs.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `capture_gain_fp.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `census.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `controls_manifest_rows.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `controls_runfolder_prior.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `controls_state.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `controls_state_sets.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `controls_t21_censusp1.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `copylock.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `d30_ref.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `diverge.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `dom_entry_v620.jsx` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `domdiff_withdrawal.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `env_dom.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `funcmap.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `hand_86.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `households.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `lits.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `mk_runfolder.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `mk_testable.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `notes_probe.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `oracle_nm.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `oracle_ri.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `oracle_va.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `package_check.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `package_check_controls.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `peer_scf.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `probe_withhold_gain.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `qa-baseline-README.md` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `residual.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `row_census.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `run_all.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `runsuite.sh` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `sel_census.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `shim.txt` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `smoke_built.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `state_sets.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `state_sets_check.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t10_taxcases.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t11_survivor_rmd.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t12_engineD_survivor.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t13_engineC_irmaa.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t14_cross_engine_survivor.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t15_engineA_death_filing.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t16_roth_ladder_filing.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t17_engineC_exact.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t18_engineB_exact.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t19_engineD_exact.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t1_units.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t20_other_taxtype.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t21_tools.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t22_aca_floor.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t23_roth_ladder_rmd.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t24_ss86_phasein.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t25_engineC_ss86.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t26_noconv_span.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t27_half_cap.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t28_ssB_claim_gate.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t29_boundaries.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t2_engines.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t30_legible.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t31_disclosure_parity.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t32_ladder_dividend.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t33_roth_stream_fica.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t34_income_conditioning.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t35_state_populate.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t36_ai_route.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t37_mydata_draft.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t38_import_hardening.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t39_me_mt.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t3_roth.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t40_cross_tab_agreement.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t41_survivor_age_gains.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t42_single_spouse_b_ss.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t43_ss86_one_rule.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t44_irmaa_top_tier.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t45_phone_layout.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t46_scenario_default.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t47_phone_first_screen.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t48_legibility_targets.py` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t49_engineA_draw.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t4_dom.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t50_ss_states.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t51_state_figure_years.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t52_age_start_notes.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t53_mydata_summary_age.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t54_wv_senior_modification.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t55_retexempt_age.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t56_plan_type_collect.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t57_attribution_carry.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t58_state_draw.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t59_per_person_state.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t5_storage.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t60_engineA_survivor_state.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t61_ga_ok_rates.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t62_desktop_disclosures.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t63_flat_rates.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t64_state_brackets.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t65_state_brackets_b2.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t66_deductions_askai.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t67_deductions_flat.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t68_fed_deductions.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t69_annuity_relief.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t6_single.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t70_annuity_conversion.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t71_engine_d_other_ira.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t72_engine_d_other_roth.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t73_peer_benchmarks.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t74_ranking_headline.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t75_engine_d_ss86.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t76_crossover_label.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t77_payroll_tax.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t78_events_user_facing.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t79_self_employment.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t7_accrual.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t80_home_move_cash.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t81_engine_d_spending.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t82_mc_calendar.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t83_mc_tax.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t8_invariant.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `t9_dom_smoke.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `tools_fixture.jsx` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `v617_spending.mjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `vercensus.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |
| `vergates.cjs` | **un-pooled, repo-only** — delete, do not re-upload (`qa/` is repo-only from 2026-10-19) |

**Repo-only, new:** `docs/MANIFEST_ARCHIVE_test_hash_table_to_v6_20.md`. **Repo-only, changed:** `docs/SCOPE_UNPOOL_QA_CODE.md` (FULFILLED),
`qa/tools/package_check.mjs`, `qa/tools/package_check_controls.sh`, `qa/tools/controls_manifest_rows.py` — no longer pooled, so they ship to `github/` only.

### At the ops package of 2026-10-19 — DELETE THESE FIRST

7 files replaced; nothing leaves, nothing arrives. **Pool stays 142.** v6.20 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-30: seven open threads re-homed from the text leaving |
| `CHANGELOG.md` | replaced — v6.00–v6.15 moved to a repo-only archive; this package's entry added |
| `MissingFeatures.md` | replaced — closed write-ups moved to a repo-only archive |
| `OPERATIONS.md` | replaced — §G records the fourth trim |
| `package_check.mjs` | replaced — the OPEN allowlist gains `SCOPE_UNPOOL_QA_CODE.md` |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `TESTING.md` | replaced — write-ups to v5.40 moved to a repo-only archive; `t38`'s thread re-homed |

**Repo-only, new:** the four archives, `docs/SCOPE_UNPOOL_QA_CODE.md` (open).

### At the v6.20 ship (2026-10-18) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_19.jsx` and `dom_entry_v619.jsx`. **Pool goes 141 → 142** (`t83_mc_tax.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_19.jsx` | **rotated out** — v6.19 is read from the repo's history (commit `2dbaba7`) |
| `dom_entry_v619.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t20_other_taxtype.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t2_engines.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `t76_crossover_label.mjs` | replaced |
| `t77_payroll_tax.mjs` | replaced |
| `t78_events_user_facing.mjs` | replaced |
| `t79_self_employment.mjs` | replaced |
| `t80_home_move_cash.mjs` | replaced |
| `t81_engine_d_spending.mjs` | replaced |
| `t82_mc_calendar.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_20.jsx`, `dom_entry_v620.jsx`, `t83_mc_tax.mjs`. **Repo-only:** `controls_v620_mctax.py`, the scope (`SCOPE_D40_MC_TAX_V620.md`, fulfilled), the built `index.html`.

### Older delete-first lists — in the repo

Every delete-first list from the v6.19 ship (2026-10-18) back to the v6.04 ship, with the ops packages' lists between them, moved verbatim
on 2026-10-19 to `docs/MANIFEST_ARCHIVE_notes_and_lists_v6_04_to_v6_19.md`; every list from the v6.03 ship (2026-10-10) back to the v5.31
refresh, with the notes that sat among them, moved verbatim on 2026-10-11 to `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`. Both repo
only (OPERATIONS §G). A new package adds its list at the top of this section, as before;
when the lists above grow long, the oldest move to a new archive file the same way.

## Rotation state — **DELETED at v5.32, deliberately**

This section used to restate the current/prior pair and the rotation history. It went stale by five
releases once, was repaired, and went stale again immediately — at the v5.32 build it still read
*"Current pair: v5.29 (prior) → v5.30 (current)"* while the tables at the top of this file said
v5.31/v5.30. Its own standing note said that if it went stale a second time it should be **deleted
rather than repaired**, because the authoritative answer is elsewhere and a duplicated answer is
what goes stale. That instruction is now carried out.

**Where the answer actually lives:** the two tables at the top of this file (current and prior),
and the provenance line at the end of each CHANGELOG entry from v5.12 forward (OPERATIONS §G),
which is the durable record of what every shipped version was.

**What rotating still means, kept because it is a procedure and not a fact:** at each release, roll
the oldest `DangerClose-v5_*.jsx` and its `dom_entry_v5*.jsx` OUT of the pool, add the new current
pair, promote the outgoing current to prior, and update the two tables at the top **and the §A2
hash table** — every changed test file needs its row updated, or the offline fallback lies. *(From 2026-10-19 the pool holds one
source and no `dom_entry` or test file: a rotation deletes the outgoing source only, and the hash table holds pooled files only.)*

---

## ⚠ Line citations in the 2026-08-18 audit documents were corrected on 2026-08-19

`AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`, `AUDIT_TOP_FIVE_SUMMARY.md`, `MissingFeatures.md` and the
delta-sweep row below all originally cited `src/DangerClose.jsx` line numbers that were **one low**
above L3593. The analysis was run on a working copy with the single-line `DOCS_HTML` literal (L3593)
deleted — the documented anti-grep-dump technique — and the resulting numbers were quoted as if from
the unmodified file.

**All are corrected, and every corrected citation was re-resolved against the shipped source by
confirming the cited line contains the code claimed. No finding or conclusion changed.**

**The durable lesson, because it will recur:** the docs-stripped copy is the right tool for grepping
and the wrong tool for citing. Re-derive any line number from the original file before it goes in a
document. Each affected document carries the errata in full.

## ⚠ The audit documents live in `docs/`, and this manifest indexes the POOL (added 2026-08-18)

**Read this before concluding that any audit phase is incomplete.** On 2026-08-18 a session opened
with a brief naming three tasks in priority order. **Two were already finished** — the Section D
sweep at v5.31, the Section C 2D break-even half at v5.28 — and the third depended on them. The
finished work was in the committed tree at `docs/` and **named in no manifest row**, so it was
invisible to every procedure this project runs. Most of a session's budget went to rediscovering it.

This is **E-14's failure shape, applied to documents instead of tests**: the freshness check hashes
what the pool holds and cannot see what the pool *lacks*. A stale row and a missing file are
indistinguishable from a genuinely open task.

**The three audit documents named above are now in the pool.** The durable guard is the habit:
**when a row says a phase is incomplete, check `docs/` in the committed tree before believing it**
— `git clone --depth 1` then `ls docs/`. The §A2 clone-and-diff already does the clone; this is one
extra `ls`.

The reverse leak also exists and is listed in the repair note: `UsabilityFlaws.md`,
`STATUS_v5_39_shipped.md` and `SCOPE_FIX_docs_v5_39.md` were **pool-only and uncommitted** — Section F
of the standing audit had no version history at all.

## Standing item — the Section D sweep is anchored to v5.31

`AUDIT_PHASE3_SECTION_D_SWEEP.md` concluded that the rendered surfaces and the documentation agree.
That was **measured against v5.31**. Six **modelling** releases have shipped since — v5.32 (ACA FPL
floor), v5.34 (conversion-funding basis tracker), v5.35 (RMD sourcing), v5.36 (drawdown capital
gains), v5.37 (ordinary growth taxed), v5.38 (ACA sale gain into IRMAA) — each adding a term some
surface may still describe in its pre-release form.

**One instance is already confirmed:** the sweep's own **S-1** is still open at v5.39 and has
**widened**. The IRMAA tab (L9792) names five MAGI components; Engine C (L4399) sums seven —
`div_y` (the original S-1) and now `capGain_y`, added at v5.36 precisely so the IRMAA lookback would
see realized gains. The tab that exists to explain IRMAA still tells users those gains are not in the
calculation. Low severity and safe-direction — the app *counts* the income, so no surcharge is
understated — but it is the same "engines synced, prose left behind" failure the sweep was built to
catch, recurring after it, in the same sentence, twice.

**Decided 2026-08-18: re-run the sweep's method over the v5.31 → v5.39 delta.** ✅ **DONE the same
day** — see `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`. It found **S-1 widened** (above) and one new
finding, **S-3**: `METHODOLOGY.md` L537-538 still says in the present tense that Engine B defaults
realized capital gains to $0, false since v5.36, while a later section of the same document describes
the change correctly. Both Low, both safe-direction, both a one-sentence fix. **Neither is fixed** —
they need a small docs release, and the delta sweep's §6 recommends shipping them together plus an
extinction assertion tying the IRMAA sentence to Engine C's `magi` expression.

## Open items a session should know about (not a task list — orientation)

> **⚠ 2026-09-11 — the standing audit's Phase 1 was re-run at v5.69** (`docs/FlawsToFix-v5_69-Phase1.md`, repo-only).
> Two MEDIUM findings, both undisclosed and unscoped, with decisions put to Steve: **A-3**, the My Data draft autosave has
> never saved; **B-3**, keyless Ask AI on a self-hosted copy sends the plan to the page's own host. A-4…A-6 LOW; A-2 still open.
> **B-3 is FIXED at v5.70** (2026-09-11; `docs/SCOPE_B3_KEYLESS_AI_ROUTE.md` retired with its build record), **and VERIFIED ON THE
> LIVE SITE the same day** (`docs/STATUS_2026_09_11_b3_live_verification.md`, repo-only): GitHub Pages serves `372d066c…`, byte-identical
> to a same-session rebuild, and the live download sends nothing without a key or a Local Model. ⚠ Still owed: Steve's real-browser check
> (a line is reserved for it in that record's §4). A-3 is next; the public note about B-3 can go out now. That record's F-1…F-7 are the
> open housekeeping items (F-1 with A-3; F-2, F-3, F-4 to a housekeeping scope; F-5 and F-7 corrected in the same package).

1. **The first-death class IS closed, as of v5.14.** C-2C-3 (v5.11), C-2C-4 (v5.12), C-2C-5 (v5.13)
   and C-2C-6 (v5.14) are all fixed: every engine models the first death in Social Security *and*
   separates the death event from the filing switch. The guard is `t14_cross_engine_survivor.mjs`,
   which now asserts **both** halves — at v5.13 it asserted only the first, which is exactly why
   C-2C-6 slipped past it and had to be found by hand. The lesson kept from the v5.13 refresh, where
   this line wrongly said the class was already closed: a class-level invariant only closes the part
   of the class it actually asserts, and "every engine does X" should be read as a claim about X.
2. **C-2C-4 is CLOSED**, and its header was corrected 2026-08-09. Worth noting *why* it went stale:
   the closing work happened inside a scope document, and nothing wrote the outcome back to the
   finding. A finding is read on its own; a status that lives only in the scope that resolved it is a
   status nobody sees. Writing the outcome back is now part of retiring a scope.
3. **F-2B-1 / F-2B-2 are FIXED at v5.14**, together, through one shared threshold helper. `t10`'s two
   dated `[KNOWN DEFECT]` pins are flipped and its 30 tier borders re-derived against premium-year
   indexing. **A related defect stays open:** `FINDING-C-2B-3` — a fifth copy of the threshold
   arithmetic, in the Roth ladder table, on a 3%/yr inflator with a hardcoded married base. It runs
   the *opposite* direction (non-conservative) and was deliberately held back so three pessimistic
   corrections and one optimistic one did not land in the same release. **Now amended to HIGH and
   scoped** — its prerequisite was executed and the defect is far wider than the IRMAA cliff.
4. **The Roth tab still runs its own private tax engine — now correct, but still duplicated.** v5.15
   fixed its filing status, IRMAA helper and survivor transition (C-2B-3); **v5.20 fixed the last
   known figure defect in it — the §63(f) age-65 additional standard deduction, which the ladder
   omitted entirely while Engines A and B both applied it.** Worth ~$5,300 of overstated federal tax
   on the example household, and a same-screen contradiction with the comparator directly below it.
   The duplication itself REMAINS: the ladder still carries its own tax arithmetic rather than
   routing through Engine A. The intended direction is still to delete it and use the engine. That is
   unscoped, and each release that patches the ladder instead adds a little to what consolidation
   will have to reproduce — v5.20 was the second such patch, taken deliberately on the v5.15
   precedent because the wrong number was on screen and consolidation is not imminent.
   **Note the pattern in how these were found:** both were invisible because a comment beside the
   code explained a *different* provision convincingly. At v5.20 the note discussed the OBBBA bonus
   deduction, analysed it correctly, and never mentioned §63(f) at all — so it read as a reasoned
   decision about an omission it never addressed.

5. **Phase 2 is incomplete.** **2D is IN PROGRESS** — its *completeness* half is now done to the
   Section C standard (executed, not inferred); its *Roth break-even* half remains a premise reading
   and still owes the crossover arithmetic and the `t10` cases. 2E (state tax) has not been run.
   Sections D, E, F not started.
6. **The headline 2D finding is `D-2D-3`, HIGH, and the engines DISAGREE about it.** `otherAccounts`
   — HSA, annuities, state plans, outside brokerage, **and explicitly named traditional IRAs** — is
   read by the Monte Carlo (grown) and by **Engine D as entirely taxable** (`household − total401k`,
   L7025), and is **invisible to Engines A, B, C and the Roth ladder** (all use the `positions`
   residual). So the same account is taxable on one tab and absent from another. On the shipped
   example household that is **$147,000, 8.9% of net worth**, incl. **$90,000 named "Rollover IRA" /
   "Traditional IRA"** producing no RMD anywhere.

   ⚠ **CORRECTED 2026-08-10 against v5.21 — three of the claims above are wrong as stated, and the
   line numbers are v5.15's.** Engine D applies **zero** tax to these draws, not capital-gains:
   `magi` (L7686) omits `drawFromTaxable` entirely, so $111,000 of tax-deferred money is spent
   tax-free and RMD-free. The treatment is **mischaracterized rather than undisclosed** — MyData
   L11211 states accurately that Other accounts aren't classified, while Withdrawal L7822 calls the
   same money "already-taxed principal" and the Field Manual calls it "non-retirement." And **the
   Roth tab does read `otherAccounts`** (L8384), so the "invisible to the Roth ladder" row is true
   of the ladder's arithmetic and false of the tab. Engine D's pot is now at **L7528**.

   ⚠ **The structural trap is EXECUTED, not inferred**: folding without moving Engine D's derivation
   drives the taxable pot $147K → **$0** with **no throw and no warning**, and $21,000 of genuine
   brokerage leaves the tab's accounting entirely. Bucket weights survive on the backup-load path.
   `total401k` has **three different derivations** across the three entry paths, so the same fix
   collapses the pot on one and **double-counts** on another — a single-path test would pass.

   **D-2D-2 is seven sites, not five** (L3847, 4056, 4353, 8384, 8432, 8566, 9706) — hoisting Engines
   B and C multiplied the copies. All seven verified identical by normalized AST fingerprint.
   **`D-2D-1` is WITHDRAWN.**

   ⚠ **CORRECTED AGAIN 2026-08-11 at v5.24 — read this before touching `magi`.** The line above says `magi` omits `drawFromTaxable` "so $111,000 of tax-deferred money is spent tax-free." The fact is right; the implied fix is wrong. `drawFromTaxable` is a TAXABLE-BROKERAGE withdrawal, mostly return of basis — adding it whole to MAGI would tax returned principal as ordinary income. The source says so at the line, and Engine B agrees (realized gains default to $0 unless a sale is modeled). **The defect is the classification feeding MAGI, not MAGI.** Release (b) was re-scoped as disclosure-only and shipped at v5.24; the modelling fix is release (c), which must do classification + MAGI + RMD as one unit. This finding has been stated wrongly four times across three documents.

   **Now scoped** in `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` (revision 2), **§7 decisions
   RESOLVED 2026-08-10**, split by D-7 into three releases: **(a)** consolidate the residual
   (`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`, next build, no open decisions) · **(b)** Engine D
   `magi` + the false copy · **(c)** fold and classify. HSA is held **out** of the tax split, honouring
   the v5.10 `contribAccrual` decision.
   **Note the process failure recorded in rev 3 §1**: two of these findings were first stated wrongly
   because one code path was verified and a conclusion drawn about all engines — the same error as the
   v5.13 "class is CLOSED" claim, repeated twice in one audit.
7. **The consolidation work is COMPLETE for the hoists, and one export remains.** `taxFactsFor`
   (v5.16), Engine C hoisted (v5.17) and exported + `t17` (v5.18), **Engine B hoisted (v5.19)**.
   **No engine is computed inside the render any more.** Every one of those releases proved itself
   the same way: every pre-existing figure identical, parity 8/8 strict.
   **The one thing left in this line:** export `computeTaxPlan` through `shim.txt` and write Engine
   B's dollar-exact suite, the way `t17` did for Engine C. `t17` is the template. Until it ships,
   Engine B is *hoisted but still measured at ±$500*.
   Three method lessons kept from these releases: the v5.17 pre-build census was wrong in three
   places (one return-surface entry existed only because a text search matched an English word in
   the tab's prose); the v5.18 scope's first revision called a disclosed rounding an undisclosed
   finding after checking two places and concluding "everywhere"; and at v5.19 the census was
   re-verified with a parser before any code, found unchanged, and the hoist came out clean on the
   first pass. **Use a parser for census questions. "Undisclosed" requires looking everywhere.**

8. **CLOSED at v5.17: the stale comment in Engine C.** It claimed the engine "still pays BOTH SS
   benefits and does not switch filing at death" — true at v5.11, false from v5.13, and left standing
   for four releases. All three of its claims were re-checked individually, each at its own line, before
   it was rewritten. Comment-only. This was the C-2C-4 stale-header failure recurring, and it is worth
   noting what actually caught it: not a test, since no test reads comments, but a build brief that
   listed it as a known wart. Comments have no guard rail.
9. **CLOSED at v5.21: no engine is behind the ±$500 ceiling at all, structural or measured.**
   Engine C hoisted v5.17, exported and asserted v5.18 (`t17`). Engine B hoisted v5.19, exported and
   asserted v5.21 (`t18`). The DOM suites (`t13`, `t14`, `t16`) still read at ±$500 deliberately —
   they are the extinction invariants and the only proof the tabs render what the engines compute.
   **New standing invariant from v5.21:** Engines A and B are PARALLEL implementations of the same
   statute — Engine A calls none of `fedOrdinaryTax` / `ltcgTax` / `marginalBracket` and carries its
   own inline copies, while Engine B calls all three and `taxFactsFor` nine times. v5.16's
   consolidation reached B thoroughly and A barely. `t18` case 10 asserts they agree, and they do — but only on pure ordinary income (SS/LTCG/NIIT/AMT/FICA/state all zero in all six cases), so the AMT difference above is NOT yet compared.
   Consolidating Engine A onto the shared helpers is unscoped, and the invariant makes deferring it
   safe rather than merely tolerable.
   **`t18` covers four of the ten scoped case groups.** Still uncovered: LTCG stacking, NIIT, AMT,
   FICA, state tax, survivor transition — all reachable now, all named rather than implied.

10. **The suite count is 701 at v5.18** (638 pre-existing + the new `t17`), and was misreported as 634 for two releases before v5.17. Corrected at v5.17. The
   error was a sub-total in `TESTING.md` — the nine feature suites were added as 244 where they sum to
   248 — which then propagated into the v5.15 and v5.16 CHANGELOG headlines and into the v5.17 build
   brief. No test was ever missing. Third recorded instance of a hand-computed total being wrong in this
   project's documentation; parse the suite output.

11. **`t15` defaults to the version tag `v514`** (`process.argv[2] || "v514"`) and dies with a module-
   not-found error if run bare, because `app_v514.mjs` no longer exists. It is green only when the tag is
   passed explicitly. This is the enumerated-tag trap the release checklist warns about, in its most
   brittle form. Left alone at v5.17 on purpose — editing the suite during a refactor weakens the proof
   the refactor rests on — but it should be fixed in the next release that touches the harness.

12. **A cross-engine divergence found at v5.13 and deliberately left alone:** Engines B (Taxes) and C
   (IRMAA) hold Social Security flat in today's dollars while Engine D (Withdrawal) COLA-indexes it.
   All three model the same transition in the same year; they do not share a dollar basis. This is
   the bracket-creep conservatism described in METHODOLOGY §5, not a defect — but it is the reason
   t14 asserts timing and rule rather than a single figure, and it is a candidate for its own scope
   if the tabs should ever be reconciled.
