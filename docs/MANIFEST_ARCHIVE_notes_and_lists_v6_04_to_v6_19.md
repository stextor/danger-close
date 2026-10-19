# Manifest archive — superseded ship notes and delete-first lists, v6.04 to v6.19

Moved verbatim from `PROJECT_KNOWLEDGE_INDEX.md` on 2026-10-19 to recover project-knowledge space (OPERATIONS §G, *The manifest's own
history goes the same way*). Repo only; never edited. The manifest keeps the newest ship note and the lists from v6.20 on; the older
history is in `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`.

## §0 · The trace (OPERATIONS §G)

Every line of both blocks that reads as open was checked before the move. The notes' "new open item" lines name D-33, D-34 and D-35,
closed at v6.07, v6.08 and v6.09 (`MissingFeatures.md`'s index). The lists' prose lines are rotation counts, arrivals and repo-only
declarations — no standing rule and no open thread. Nothing needed re-homing.

## Ship notes (they stood in *Current build*, below the v6.20 note)

> *(Superseded, retained: the v6.19 note follows.)*
>
> ⚠ **v6.19 SHIPPED (2026-10-18) — the Monte Carlo's quarter calendar (D-46).** Source `35d3dcb4…` · built `d9e0df42…`.
> A MODELLING release (METHODOLOGY gains *The Monte Carlo's calendar*): both Monte Carlo engines dated quarter 0 "June of the as-of year" for every plan and placed events by two different rules (the 30-year engine ignored the as-of month and retired, and claimed, a quarter late for an April–June as-of date); one calendar now serves both, the first quarter counts only the months from the as-of month, claims pay from their month, the stress set's forced years are calendar years, and 2026 is no longer typed into the machinery. The example's 6-year run did not move; the 30-year runs did.
> New suite `t82` (an independent date oracle and ORACLE MODULES built from the v6.18 source); `v619` registered; the shim exports the calendar functions, `RETIRE_OPTIONS`, `applyScenarioProbs` and `PROB_PRESETS`; `runExtendedMC` takes `totalQuarters` and a test-only `regimeTrace`. MissingFeatures D-46 (closed), D-47, D-48. **Rotation:** the pool loses `DangerClose-v6_18.jsx` and `dom_entry_v618.jsx` (v6.18 read from history, commit `ae89bb5`) and gains `DangerClose-v6_19.jsx`, `dom_entry_v619.jsx`
> and `t82_mc_calendar.mjs`. **Pool 140 → 141** (count from the Projects listing).
>
> *(Superseded, retained: the v6.18 note follows.)*
>
> ⚠ **v6.18 SHIPPED (2026-10-18) — the Withdrawal tab spends the expense table at the plan's own dates, year by year (D-41).** Source `208bf89d…` · built `d228f1d3…`.
> A MODELLING release (METHODOLOGY gains *The Withdrawal tab spends the expense table year by year*): Engine D, Backtest and What-Breaks spent the table at June 2029 / June 2031 — the example's dates — for every plan; one function, `tableYearExpense`, now reads each year's own months and one-time rows, and the display figures follow the plan's dates (the example's unchanged). The Monte Carlo did not move.
> New suite `t81` (independent oracle); new harness tool `qa/tools/v617_spending.mjs` (v6.17's spending as a table — the attribution of every re-pinned figure; eight suites run a second time with it, the `-spend617` lines); `v618` registered; the shim exports `tableYearExpense`, `recomputeDerivedExpenses` and the snapshots. MissingFeatures D-40 to D-44. **Rotation:** the pool loses `DangerClose-v6_17.jsx` and `dom_entry_v617.jsx` (v6.17 read from history, commit `ac58643`) and gains `DangerClose-v6_18.jsx`, `dom_entry_v618.jsx`,
> `t81_engine_d_spending.mjs` and `v617_spending.mjs`. **Pool 138 → 140** (count from the Projects listing).
>
> *(Superseded, retained: the v6.17 note follows.)*
>
> ⚠ **v6.17 SHIPPED (2026-10-16) — the cash from a home move is a My Data field, not a fixed $130,000 added to every plan (D-38).** Source `dc8a4d5f…` · built `067c8740…`.
> A MODELLING release (METHODOLOGY gains *Cash from a home move*): `HOME_SALE_PROCEEDS = 130000`, added at retirement to every plan by both Monte Carlo engines and disclosed nowhere, is replaced by the signed My Data field *Cash from your home move at retirement* (`homeMoveCash`), read through one accessor. A plan saved before v6.17 reads $0 with a notice; new plans start at $0; the example keeps $130,000. Engines A–D never read it (D-39 opened). D-38 filed and closed.
> New suite `t80` (oracle modules built from the v6.16 source); `t29` gains the census row `home_move`; the shim exports `homeMoveCash`; `v617` registered. **Rotation:** the pool loses `DangerClose-v6_16.jsx` and `dom_entry_v616.jsx` (v6.16 read from history, commit `13b281a`) and gains `DangerClose-v6_17.jsx`, `dom_entry_v617.jsx`
> and `t80_home_move_cash.mjs`. **Pool 137 → 138** (count from the Projects listing).
>
> *(Superseded, retained: the v6.16 note follows.)*
>
> ⚠ **v6.16 SHIPPED (2026-10-16) — self-employment tax: a self-employed job row pays both halves, on 92.35% of the profit (D-36).** Source `dfc07ee7…` · built `765cd89f…`.
> A MODELLING release (METHODOLOGY's *Payroll tax on job income* gains a self-employment subsection): My Data's Type dropdown offers "Job — employee (W-2)" and "Job — self-employed (1099)" (`selfEmployed: true`); `payrollTax` applies §1401/§1402 — 92.35% of the profit, nothing under $400 (`SE_MIN_NET`, Verify 71 → 72), Social Security on the base the same person's wages leave, the 0.9% on wages + net earnings. Rows saved before v6.16 stay employees. Not taken, disclosed: §164(f) and §199A (D-37). D-36 closes.
> New suite `t79`; `t29` gains the census row `self_employed` (two fixtures); `t77` B-3/E-4 and `t78` D-2a re-gated; `v616` registered. **Rotation:** the pool loses `DangerClose-v6_15.jsx` and `dom_entry_v615.jsx` (v6.15 read from history, commit `cbe2eb2`) and gains `DangerClose-v6_16.jsx`, `dom_entry_v616.jsx`
> and `t79_self_employment.mjs`. **Pool 136 → 137** (count from the Projects listing).
>
> *(Superseded, retained: the v6.15 note follows.)*
>
> ⚠ **v6.15 SHIPPED (2026-10-16) — the Events tab speaks to users only: no Google Drive, no maintainer chores, and the strip never hides the user's own reminders.** Source `a9520db5…` · built `38f51c21…`.
> A PRESENTATION release (METHODOLOGY unchanged): the tax card is a NOTICE the app-wide strip ignores (`alertStripEvents`); the backtest and peer chores are gone (sixteen events); the backup card and the STALE strip are neutral and no longer promise the plan "survives the swap"; the Field Manual follows. The maintainer's three refresh cycles moved to OPERATIONS §I, *Annual data refreshes*.
> New suite `t78`; `t73` §E and `domdiff` re-gated; the shim exports `alertStripEvents`; `v615` registered. **Rotation:** the pool loses `DangerClose-v6_14.jsx` and `dom_entry_v614.jsx` (v6.14 read from history, commit `ec5f16c`) and gains `DangerClose-v6_15.jsx`, `dom_entry_v615.jsx`
> and `t78_events_user_facing.mjs`. **Pool 135 → 136** (count from the Projects listing).
>
> *(Superseded, retained: the v6.14 note follows.)*
>
> ⚠ **v6.14 SHIPPED (2026-10-15) — payroll tax on job income follows the law: the 0.9% Additional Medicare Tax (D-17) and the wage cap per earner (C-14).** Source `57e4fca1…` · built `2eeb7650…`.
> A MODELLING release (METHODOLOGY gains a section): one helper, `payrollTax`, called by Engines A (twice) and B; rates in `TAX_CONSTS` with five Verify checks (71 in all). Engines C and D and the Monte Carlo cannot move (`t77` §C). D-17 closed; C-14 filed and fixed; E-23 narrowed; D-36 (self-employment) opened and disclosed.
> New suite `t77`; `t29` gains the census row `payroll`; `t1`/`t4` count 71 Verify checks; `v614` registered. **Rotation:** the pool loses `DangerClose-v6_13.jsx` and `dom_entry_v613.jsx` (v6.13 read from history, commit `756dc76`) and gains `DangerClose-v6_14.jsx`, `dom_entry_v614.jsx`
> and `t77_payroll_tax.mjs`. **Pool 134 → 135** (count from the Projects listing).
>
> *(Superseded, retained: the v6.13 note follows.)*
>
> ⚠ **v6.13 SHIPPED (2026-10-15) — C-11: the Roth tab's break-even card says what it measures; C-9 closed on evidence; the age-65 deduction read at source.** Source `b08609bd…` · built `6afe2ab9…`.
> A PRESENTATION release: the card, the Field Manual and METHODOLOGY name the face-value measure ("after-tax wealth" is extinct), METHODOLOGY says why face value is the conservative direction, and the §63(f) blind amount is disclosed. No code moved (`t76` §D, by AST). C-9 was fixed at v6.07 (D-33) and is now asserted extinct; E-25 closes; OPERATIONS gains §K2 (sweep the registers for the mechanism).
> New suite `t76`; `t29` gains the §K1 row `crossover`; `v613` registered. **Rotation:** the pool loses `DangerClose-v6_12.jsx` and `dom_entry_v612.jsx` (v6.12 read from history, commit `47d6854`) and gains `DangerClose-v6_13.jsx`, `dom_entry_v613.jsx`
> and `t76_crossover_label.mjs`. **Pool 133 → 134** (count from the Projects listing).
>
> *(Superseded, retained: the v6.12 note follows.)*
>
> ⚠ **v6.12 SHIPPED (2026-10-14) — C-5: the Withdrawal tab's Bracket column taxes Social Security by the §86 worksheet, on the household's own return.** Source `fc8d2a5f…` · built `bc19a24e…`.
> A MODELLING release whose reach is one displayed column (METHODOLOGY gains a section): Engine D calls `taxableSS86` on the year's filing status and takes its table, deduction and age-65 extra from `projectBracketsAt`; nothing else moves (t75 §C). Three sentences elsewhere that misstated §86 corrected (DC-4).
> New suite `t75`; `t14` (Engine D joins `filingEngines`), `t19`, `t20`, `t40`, `t43` and `domdiff` re-gated; `v612` registered. Registers: C-5 fixed, C-10 marked fixed at v6.09. OPERATIONS §C gains the DOM-bundle module-copy trap.
> **Rotation:** the pool loses `DangerClose-v6_11.jsx` and `dom_entry_v611.jsx` (v6.11 read from history, commit `8e5133a`) and gains `DangerClose-v6_12.jsx`, `dom_entry_v612.jsx`
> and `t75_engine_d_ss86.mjs`. **Pool 132 → 133** (count from the Projects listing).
>
> *(Superseded, retained: the v6.11 note follows.)*
>
> ⚠ **v6.11 SHIPPED (2026-10-14) — F-19r: the Ranking tab's headline is the net-worth band, and the tab stops claiming what it does not measure.** Source `35f3c656…` · built `ff3c5d7e…`.
> A PRESENTATION release (no engine reads it; parity unchanged; METHODOLOGY gains a short section). Four rows unranked, three removed, the praise copy replaced by figures, the Field Manual's Ranking entry rewritten.
> New suite `t74`; `t73` C-3 gated per leg; `v611` registered. F-19 is now two IDs, F-19s and F-19r (UsabilityFlaws census). OPERATIONS §C gains the Monte Carlo re-run trap.
> **Rotation:** the pool loses `DangerClose-v6_10.jsx` and `dom_entry_v610.jsx` (v6.10 read from history, commit `89963eb`) and gains `DangerClose-v6_11.jsx`, `dom_entry_v611.jsx`
> and `t74_ranking_headline.mjs`. **Pool 131 → 132** (count from the Projects listing).
>
> *(Superseded, retained: the v6.10 note follows.)*
>
> ⚠ **v6.10 SHIPPED (2026-10-13) — the Ranking tab's peer benchmarks move to the 2025 SCF, computed from the Fed's microdata.** Source `1b41119b…` · built `93ff44d5…`.
> A data and presentation release (no engine reads the figures; METHODOLOGY gains a section). One module-level table, `PEER_BENCHMARKS`; `PEER_DATA_SCF_YEAR` 2025; the alarm clears.
> New suite `t73`, new tool `qa/tools/peer_scf.py` (pooled); `domdiff` sets aside the shell banner for this pair; the shim exports the table. New finding F-19 (UsabilityFlaws).
> The `vite_config.js` row is corrected to `vite.config.js` (the pool's real name).
> **Rotation:** the pool loses `DangerClose-v6_09.jsx` and `dom_entry_v609.jsx` (v6.09 read from history, commit `2f25660`) and gains `DangerClose-v6_10.jsx`, `dom_entry_v610.jsx`,
> `t73_peer_benchmarks.mjs` and `peer_scf.py`. **Pool 129 → 131** (count from the Projects listing).
>
> *(Superseded, retained: the v6.09 note follows.)*
>
> ⚠ **v6.09 SHIPPED (2026-10-13) — D-35: a Roth IRA entered under Other accounts is counted once in the Withdrawal tab, as Roth money.** Source `a32ef453…` · built `df3d3e7e…`.
> A MODELLING release (METHODOLOGY updated). Engine D holds the Roth money out of the pool's gains part and out of the buckets' Roth share; the Withdrawal tab shows it once.
> A household with no Roth IRA under Other accounts does not move (the example holds none). New suite `t72`; `t29`, `t71` and `domdiff` re-gated; the boundary census gains a row.
> **Rotation:** the pool loses `DangerClose-v6_08.jsx` and `dom_entry_v608.jsx` (v6.08 read from history, commit `b6eb255`) and gains `DangerClose-v6_09.jsx`, `dom_entry_v609.jsx`
> and `t72_engine_d_other_roth.mjs`. **Pool 128 → 129** (count from the Projects listing).
>
> *(Superseded, retained: the v6.08 note follows.)*
>
> ⚠ **v6.08 SHIPPED (2026-10-12) — D-34: the Withdrawal tab converts a Traditional IRA entered under Other accounts, and carries it as an account.** Source `a739b64a…` · built `2e869c23…`.
> A MODELLING release (METHODOLOGY updated). Engine D figures its conversion after the year's draws (bucket money first, then that IRA, never annuity money), grows the IRA's RMD
> tracker and takes its RMD whole; the example household does not move at $0 or $70,000. New suite `t71`; `t19`, `t29`, `t70` and `domdiff` re-gated; the boundary census gains two rows.
> New open item D-35 (a Roth IRA under Other accounts is counted twice in Engine D).
> **Rotation:** the pool loses `DangerClose-v6_07.jsx` and `dom_entry_v607.jsx` (v6.07 read from history, commit `4cb6859`) and gains `DangerClose-v6_08.jsx`, `dom_entry_v608.jsx`
> and `t71_engine_d_other_ira.mjs`. **Pool 127 → 128** (count from the Projects listing).
>
> *(Superseded, retained: the v6.07 note follows.)*
>
> ⚠ **v6.07 SHIPPED (2026-10-12) — D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money.** Source `ee557028…` · built `5b444023…`.
> A MODELLING release (METHODOLOGY updated). Engines A, B and C and the Roth tab's ladder carry the annuity dollars; Engine D and the Monte Carlo untouched; an annuity-free
> household bit-identical. New suite `t70`; eleven suites re-gated for the example's $7,000 annuity; `t33`'s PINS carried. New open item D-34 (Engine D converts bucket money only).
> **Rotation:** the pool loses `DangerClose-v6_06.jsx` and `dom_entry_v606.jsx` (v6.06 read from history, commit `9232406`) and gains `DangerClose-v6_07.jsx`, `dom_entry_v607.jsx`
> and `t70_annuity_conversion.mjs`. **Pool 126 → 127** (count from the Projects listing).
>
> *(Superseded, retained: the v6.06 note follows.)*
>
> ⚠ **v6.06 SHIPPED (2026-10-12) — D-28 widened: a commercial annuity gets no retirement relief in the thirteen states whose law gives it none; Maryland's pension exclusion no longer reaches IRA money.** Source `a5ac49a5…` · built `fa02504f…`.
> A MODELLING release (METHODOLOGY updated). Thirteen rows carry `reliefKinds` (AR, CO, DE, IA, IL, MD, ME, MI, MS, NY, OK, PA, WI); the calculator nets their relief against the eligible
> categories only. New suite `t69`; `t33`'s PINS carried. New open item D-33 (conversions draw annuity money). **Rotation:** the pool loses `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`
> (v6.05 read from history, commit `11c1d13`) and gains `DangerClose-v6_06.jsx`, `dom_entry_v606.jsx` and `t69_annuity_relief.mjs`. **Pool 125 → 126** (count from the Projects listing).
>
> *(Superseded, retained: the v6.05 note follows.)*
>
> ⚠ **v6.05 SHIPPED (2026-10-12) — the Field Manual counts six income-limited exclusions and no longer says Rhode Island's is applied to IRA money.** Source `f230ffbb…` · built `1c3d9f3a…`.
> A TEXT-ONLY release: no figure moves. Two Field Manual sentences corrected (E-29 (e)); METHODOLOGY's "thirteen of nineteen unverified" (E-29 (f)) and three lines of
> the same kind corrected, and the Field Manual's copy of it (its state-age paragraph; `t52` F-1–F-3); `t35` RI-7 inverted and gated per build, RI-8–RI-10 new (RI-9 derives the count from `STATE_RULES`); E-29 (d) and (k) closed by Steve's decisions.
> `t33`'s PINS carried; `package_check_controls.sh`'s app-release test no longer needs a `## v5` heading (P56/P57 run again); `package_check` H-1/H-2's window ends at the next heading. **Rotation:** the pool loses `DangerClose-v6_04.jsx` and `dom_entry_v604.jsx` (v6.04 read from history, commit `a923332`) and gains
> `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`. **Pool 125 → 125** (count from the Projects listing).
>
> *(Superseded, retained: the v6.04 note follows.)*
>
> ⚠ **v6.04 SHIPPED (2026-10-11) — D-31 and D-29: the deductions a state takes from the federal return, and Missouri's capital-gains subtraction.** Source `8226b20b…` · built `71f4ada6…`.
> A MODELLING release (METHODOLOGY updated). The state calculator is given the model year, the year's federal income tax and NIIT, and the realized gains (all three call
> sites); Alabama, Missouri and Oregon deduct federal income tax; the six states whose returns carry the federal senior deduction (2025–2028) take it; Missouri subtracts
> capital gains. New suite `t68`; `d30_ref.mjs` extended; derived checks gated in `t64`–`t67`; `t33`'s PINS carried. **Rotation:** the pool loses `DangerClose-v6_03.jsx`
> and `dom_entry_v603.jsx` (v6.03 read from history, commit `12a4428`) and gains `DangerClose-v6_04.jsx`, `dom_entry_v604.jsx` and `t68_fed_deductions.mjs`.
> **Pool 132 → 133** (count from the Projects listing).
>

## Delete-first lists (they stood in *Retirement list*, below the v6.20 list)

### At the v6.19 ship (2026-10-18) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_18.jsx` and `dom_entry_v618.jsx`. **Pool goes 140 → 141** (`t82_mc_calendar.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_18.jsx` | **rotated out** — v6.18 is read from the repo's history (commit `ae89bb5`) |
| `dom_entry_v618.jsx` | **rotated out** with it |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_19.jsx`, `dom_entry_v619.jsx`, `t82_mc_calendar.mjs`. **Repo-only:** `controls_v619_calendar.py`, the two scopes (`SCOPE_D46_MC_CALENDAR_V619.md`, fulfilled; `SCOPE_D40_MC_TAX_V620.md`, decided, next), the built `index.html`.

### At the ops package of 2026-10-18 (the v6.18 provenance line) — DELETE THESE FIRST

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the v6.18 entry gains its provenance line; an ops entry records it |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |

**Pool stays 140.** Nothing arrives new.

### At the v6.18 ship (2026-10-18) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_17.jsx` and `dom_entry_v617.jsx`. **Pool goes 138 → 140** (`t81_engine_d_spending.mjs` and `v617_spending.mjs` arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_17.jsx` | **rotated out** — v6.17 is read from the repo's history (commit `ac58643`) |
| `dom_entry_v617.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t14_cross_engine_survivor.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t20_other_taxtype.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_18.jsx`, `dom_entry_v618.jsx`, `t81_engine_d_spending.mjs`, `v617_spending.mjs`. **Repo-only:** `controls_v618_spend.py`, the scope (fulfilled), the findings note, the TESTING archive, the built `index.html`.

### At the v6.17 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_16.jsx` and `dom_entry_v616.jsx`. **Pool goes 137 → 138** (`t80_home_move_cash.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_16.jsx` | **rotated out** — v6.16 is read from the repo's history (commit `13b281a`) |
| `dom_entry_v616.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_17.jsx`, `dom_entry_v617.jsx`, `t80_home_move_cash.mjs`. **Repo-only:** `controls_v617_home.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.16 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_15.jsx` and `dom_entry_v615.jsx`. **Pool goes 136 → 137** (`t79_self_employment.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_15.jsx` | **rotated out** — v6.15 is read from the repo's history (commit `cbe2eb2`) |
| `dom_entry_v615.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_16.jsx`, `dom_entry_v616.jsx`, `t79_self_employment.mjs`. **Repo-only:** `controls_v616_se.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.15 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_14.jsx` and `dom_entry_v614.jsx`. **Pool goes 135 → 136** (`t78_events_user_facing.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_14.jsx` | **rotated out** — v6.14 is read from the repo's history (commit `ec5f16c`) |
| `dom_entry_v614.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_15.jsx`, `dom_entry_v615.jsx`, `t78_events_user_facing.mjs`. **Repo-only:** `controls_v615_events.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.14 ship (2026-10-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_13.jsx` and `dom_entry_v613.jsx`. **Pool goes 134 → 135** (`t77_payroll_tax.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_13.jsx` | **rotated out** — v6.13 is read from the repo's history (commit `756dc76`) |
| `dom_entry_v613.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_14.jsx`, `dom_entry_v614.jsx`, `t77_payroll_tax.mjs`. **Repo-only:** `controls_v614_payroll.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.13 ship (2026-10-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_12.jsx` and `dom_entry_v612.jsx`. **Pool goes 133 → 134** (`t76_crossover_label.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_12.jsx` | **rotated out** — v6.12 is read from the repo's history (commit `47d6854`) |
| `dom_entry_v612.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_13.jsx`, `dom_entry_v613.jsx`, `t76_crossover_label.mjs`. **Repo-only:** `controls_v613_c11.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.12 ship (2026-10-14) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_11.jsx` and `dom_entry_v611.jsx`. **Pool goes 132 → 133** (`t75_engine_d_ss86.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_11.jsx` | **rotated out** — v6.11 is read from the repo's history (commit `8e5133a`) |
| `dom_entry_v611.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t14_cross_engine_survivor.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t20_other_taxtype.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_12.jsx`, `dom_entry_v612.jsx`, `t75_engine_d_ss86.mjs`. **Repo-only:** `controls_v612_c5.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.11 ship (2026-10-14) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_10.jsx` and `dom_entry_v610.jsx`. **Pool goes 131 → 132** (`t74_ranking_headline.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_10.jsx` | **rotated out** — v6.10 is read from the repo's history (commit `89963eb`) |
| `dom_entry_v610.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v6_11.jsx`, `dom_entry_v611.jsx`, `t74_ranking_headline.mjs`. **Repo-only:** `controls_v611_ranking.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.10 ship (2026-10-13) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_09.jsx` and `dom_entry_v609.jsx`. **Pool goes 129 → 131** (`t73_peer_benchmarks.mjs` and `peer_scf.py` arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_09.jsx` | **rotated out** — v6.09 is read from the repo's history (commit `2f25660`) |
| `dom_entry_v609.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v6_10.jsx`, `dom_entry_v610.jsx`, `t73_peer_benchmarks.mjs`, `peer_scf.py`. **Repo-only:** `controls_v610_peer.py`, the scope (fulfilled), `docs/PEER_SCF2025_figures.txt`, the TESTING archive, the built `index.html`.

### At the v6.09 ship (2026-10-13) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_08.jsx` and `dom_entry_v608.jsx`. **Pool goes 128 → 129** (`t72_engine_d_other_roth.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_08.jsx` | **rotated out** — v6.08 is read from the repo's history (commit `b6eb255`) |
| `dom_entry_v608.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_09.jsx`, `dom_entry_v609.jsx`, `t72_engine_d_other_roth.mjs`. **Repo-only:** `controls_v609_engine_d_roth.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.08 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_07.jsx` and `dom_entry_v607.jsx`. **Pool goes 127 → 128** (`t71_engine_d_other_ira.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_07.jsx` | **rotated out** — v6.07 is read from the repo's history (commit `4cb6859`) |
| `dom_entry_v607.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_08.jsx`, `dom_entry_v608.jsx`, `t71_engine_d_other_ira.mjs`. **Repo-only:** `controls_v608_engine_d_ira.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the ops package of 2026-10-12 (E-29 (b), (c), (g), (i)) — DELETE THESE FIRST

10 files replaced, nothing removed, nothing arrives. **Pool stays 127.** v6.07 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-29 (b), (c), (g), (i) fixed |
| `CHANGELOG.md` | replaced — the ops entry; hash row rolled last |
| `controls_runfolder_prior.sh` | replaced — G and H, the harness lock |
| `mk_runfolder.sh` | replaced — `npm ci` from `qa/harness/` (i) |
| `OPERATIONS.md` | replaced — §B, §B2a, §I (K-12), §N3a, the E-1b notes |
| `package_check.mjs` | replaced — E-1b through the manifest's path cell (c); K-12 (g) |
| `package_check_controls.sh` | replaced — P72–P75 |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (50 rows marked for K-12; `qa-baseline-README.md` rowed; the harness rows) |
| `t13_engineC_irmaa.mjs` | replaced — §E, the first death's effect at engine level (E-29 (b)) |
| `TESTING.md` | replaced — `t13` 53; the full-run count |

**Repo-only, new:** `qa/harness/package.json`, `qa/harness/package-lock.json`, `docs/SCOPE_E29_BCGI_OPS.md` (fulfilled).

### At the v6.07 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_06.jsx` and `dom_entry_v606.jsx`. **Pool goes 126 → 127** (`t70_annuity_conversion.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_06.jsx` | **rotated out** — v6.06 is read from the repo's history (commit `9232406`) |
| `dom_entry_v606.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
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
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_07.jsx`, `dom_entry_v607.jsx`, `t70_annuity_conversion.mjs`. **Repo-only:** `controls_v607_annuity_conv.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.06 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`. **Pool goes 125 → 126** (`t69_annuity_relief.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_05.jsx` | **rotated out** — v6.05 is read from the repo's history (commit `11c1d13`) |
| `dom_entry_v605.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_06.jsx`, `dom_entry_v606.jsx`, `t69_annuity_relief.mjs`. **Repo-only:** `controls_v606_annuity.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.05 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_04.jsx` and `dom_entry_v604.jsx`. **Pool stays 125** (two leave, two arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_04.jsx` | **rotated out** — v6.04 is read from the repo's history (commit `a923332`) |
| `dom_entry_v604.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `CHANGELOG.md` | replaced |
| `controls_manifest_rows.py` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_05.jsx`, `dom_entry_v605.jsx`. **Repo-only:** `controls_v605_fm.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the ops package of 2026-10-11, third (the manifest's history to the repo; six documents un-pooled) — DELETE THESE FIRST

6 files replaced, 6 removed, nothing arrives. **Pool 131 → 125.** v6.04 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-29, the re-homed non-tax threads |
| `CHANGELOG.md` | replaced — the ops entry; hash row rolled last |
| `controls_manifest_rows.py` | replaced — its B1 demonstration derives its target (its old anchor was in the archived retirement list) |
| `MissingFeatures.md` | replaced — the census at v6.04; closed items' headings carry their status |
| `OPERATIONS.md` | replaced — §B2a (six traps carried from the leaving text), §G, §I |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (old notes and lists archived; eleven leftover roll trails removed) |
| `FlawsToFix-v5_69-Phase1.md` | **un-pooled** — repo copy stays (`docs/FlawsToFix-v5_69-Phase1.md`); delete, do not re-upload |
| `AUDIT_STATE_EXCL65_ROUND3.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_EXCL65_ROUND3.md`); delete, do not re-upload |
| `AUDIT_STATE_EXCL65_ROUND4.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_EXCL65_ROUND4.md`); delete, do not re-upload |
| `AUDIT_STATE_INCOME_BASES_ROUND5.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_INCOME_BASES_ROUND5.md`); delete, do not re-upload |
| `BUILD_BRIEF_v5_49.md` | **un-pooled** — repo copy stays (`docs/BUILD_BRIEF_v5_49.md`); delete, do not re-upload |
| `controls_source.sh` | **un-pooled** — repo copy stays (`qa/controls_source.sh`); delete, do not re-upload |

### At the ops package of 2026-10-11, second (project knowledge trimmed) — DELETE THESE FIRST

4 files replaced; nothing arrives. **Pool stays 131** (`VERIFY.sh` and `ASSESSMENT_HEIR_RATE.md` were already removed by hand that day). v6.04 stays current.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — v5.75–v5.99 archived to the repo; the ops entry; hash row rolled last |
| `OPERATIONS.md` | replaced — §G records the archives; §I: a roll replaces the hash without a trail |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (the hash rows' roll trail removed) |
| `TESTING.md` | replaced — old per-suite lines archived to the repo |
| `VERIFY.sh` | **un-pooled** — already removed by hand 2026-10-11; delete, do not re-upload |
| `ASSESSMENT_HEIR_RATE.md` | **un-pooled** — already removed by hand 2026-10-11; delete, do not re-upload |

### At the ops package of 2026-10-11 (`package_check_controls.sh`'s v6 source patterns) — DELETE THESE FIRST

5 files replaced; nothing leaves, nothing arrives. **Pool stays 133.** v6.04 stays current.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled last |
| `OPERATIONS.md` | replaced — §G records the v6.00 miss; §L's two `v5_*` sentences |
| `package_check.mjs` | replaced — `E-2`'s printed label |
| `package_check_controls.sh` | replaced — its four `v5_*` source patterns read any major (P8/P10 run again) |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |

### At the v6.04 ship (2026-10-11) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_03.jsx` and `dom_entry_v603.jsx`. **Pool goes 132 → 133** (`t68_fed_deductions.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_03.jsx` | **rotated out** — v6.03 is read from the repo's history (commit `12a4428`) |
| `dom_entry_v603.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `d30_ref.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
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
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_04.jsx`, `dom_entry_v604.jsx`, `t68_fed_deductions.mjs`. **Repo-only:** `controls_v604_feddeduct.py`, the scope (fulfilled), the built `index.html`.

