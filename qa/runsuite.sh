#!/bin/bash
# Suite runner (adopted into the repo at v5.36 — was session scratch). Parses "N passed, M failed" out of each suite's own output and
# totals from THAT — never from a remembered figure (project instructions: totals are
# computed from suite output). Not a shipped file; scratch tooling for this session.
# usage: ./runsuite.sh <prior> <current>   e.g. ./runsuite.sh v535 v536
cd "$(dirname "$0")"
PRIOR=${1:-v536}; CUR=${2:-v537}
TMP=$(mktemp -d)
tally () {  # $1 label, $2... command
  local label="$1"; shift
  local out rc; out=$(timeout 900 "$@" 2>&1); rc=$?
  echo "$out" > "$TMP/$label.log"
  local p f
  p=$(echo "$out" | grep -oE '[0-9]+ passed' | awk '{s+=$1} END {print s+0}')
  f=$(echo "$out" | grep -oE '[0-9]+ failed' | awk '{s+=$1} END {print s+0}')
  # t10 prints per-PHASE lines AND a total line; take the total line only.
  case "$label" in t10-*)
    p=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+')
    f=$(echo "$out" | grep -E '^t10 total:' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+') ;;
  esac
  # A dead suite prints no "N passed" line at all and would tally as 0/0 — which reads
  # as green if you only count failures (OPERATIONS §B2, learned three times). Say DIED.
  if [ "$p" = "0" ] && [ "$f" = "0" ] && [ $rc -ne 0 ]; then
    printf "%-22s DIED (rc=%s) — see %s\n" "$label" "$rc" "$TMP/$label.log"
    # ⚠ v5.72: a death is COUNTED as a failure. Until then it was tallied "0 0", so the GRAND line below read
    #   "0 failed" while a suite lay dead above it — found when t33-v572 died on a missing PINS entry and the
    #   total still read green. The per-line DIED was right; the one line people read was not.
    echo "0 1 DIED" >> "$TMP/tally.txt"
  else
    printf "%-22s %5s passed %5s failed\n" "$label" "$p" "$f"
    echo "$p $f" >> "$TMP/tally.txt"
  fi
}
: > "$TMP/tally.txt"
echo "== BOTH LEGS =="
for V in "$PRIOR" "$CUR"; do
  for t in t1_units t2_engines t3_roth t4_dom t5_storage t6_single t10_taxcases; do
    tally "${t%%_*}-$V" node "$t.mjs" "$V"
  done
done
echo "== PARITY =="
tally "parity" node t2_engines.mjs compare "$PRIOR" "$CUR"
echo "== FEATURE =="
for t in t7_accrual t8_invariant t9_dom_smoke t11_survivor_rmd t12_engineD_survivor \
         t13_engineC_irmaa t14_cross_engine_survivor t15_engineA_death_filing \
         t16_roth_ladder_filing t17_engineC_exact t18_engineB_exact t19_engineD_exact \
         t20_other_taxtype; do
  tally "${t%%_*}" node "$t.mjs"
done
tally "t22" node t22_aca_floor.mjs "$PRIOR"
tally "t23-$PRIOR" node t23_roth_ladder_rmd.mjs "$PRIOR"
tally "t23-$CUR"   node t23_roth_ladder_rmd.mjs "$CUR"
tally "t24-$PRIOR" node t24_ss86_phasein.mjs "$PRIOR"
tally "t24-$CUR"   node t24_ss86_phasein.mjs "$CUR"
tally "t25-$PRIOR" node t25_engineC_ss86.mjs "$PRIOR"
tally "t25-$CUR"   node t25_engineC_ss86.mjs "$CUR"
tally "t26-$PRIOR" node t26_noconv_span.mjs "$PRIOR"
tally "t26-$CUR"   node t26_noconv_span.mjs "$CUR"
tally "t27-$PRIOR" node t27_half_cap.mjs "$PRIOR"
tally "t27-$CUR"   node t27_half_cap.mjs "$CUR"
tally "t28-$PRIOR" node t28_ssB_claim_gate.mjs "$PRIOR"
tally "t28-$CUR"   node t28_ssB_claim_gate.mjs "$CUR"
# t29/t30/t31 were absent from this runner until v5.49 — three suites the project could not see.
tally "t29-$PRIOR" node t29_boundaries.mjs "$PRIOR"
tally "t29-$CUR"   node t29_boundaries.mjs "$CUR"
tally "t30-$PRIOR" node t30_legible.mjs "$PRIOR"
tally "t30-$CUR"   node t30_legible.mjs "$CUR"
tally "t31-$PRIOR" node t31_disclosure_parity.mjs "$PRIOR"
tally "t31-$CUR"   node t31_disclosure_parity.mjs "$CUR"
# t32 (v5.53) is the ONLY suite that witnesses the ladder-dividend release at the engine layer.
# The DOM diff reports "nothing moved" for it by construction (it is blind to the Roth tab), so a
# runner that stops at t31 would report this release green without executing anything that can see it.
tally "t32-$PRIOR" node t32_ladder_dividend.mjs "$PRIOR"
tally "t32-$CUR"   node t32_ladder_dividend.mjs "$CUR"
# t33 (v5.63) carries the suite's FIRST stream-bearing fixtures. Every other fixture sets
# incomeStreams to 0 or [], so nothing else in this runner can reach the Roth comparator's
# FICA path at all. Both legs: the prior leg asserts the defect, the current leg the fix.
tally "t33-$PRIOR" node t33_roth_stream_fica.mjs "$PRIOR"
tally "t33-$CUR"   node t33_roth_stream_fica.mjs "$CUR"
# t34 (v5.64) is CURRENT-LEG ONLY by construction: it tests machinery that does not exist on any
# earlier build, so running it against the prior leg would fail for the right reason and report as
# a regression. Its own KNOWN_VERSIONS guard refuses any other tag.
tally "t34-$CUR"   node t34_income_conditioning.mjs "$CUR"
# t35 (v5.65) runs on BOTH legs by construction. The prior leg carries Connecticut UNPOPULATED and
# asserts the pre-fix figures; the current leg asserts the populated ones. A current-leg-only suite
# could not show that anything moved, which is the whole claim of a populate release.
tally "t35-$PRIOR" node t35_state_populate.mjs "$PRIOR"
tally "t35-$CUR"   node t35_state_populate.mjs "$CUR"
# t36 (v5.70) runs on BOTH legs: the prior leg pins B-3's keyless send, the current leg asserts it extinct.
tally "t36-$PRIOR" node t36_ai_route.mjs "$PRIOR"
tally "t36-$CUR"   node t36_ai_route.mjs "$CUR"

# t37 (v5.71) runs on BOTH legs: the prior leg pins A-3 (the draft autosave has never saved) and
# A-6 (an imported masterPrompt is assigned unchecked); the current leg asserts both fixed, and
# carries this release's EXTINCTION INVARIANT — after Clear All Data the draft key is gone.
tally "t37-$PRIOR" node t37_mydata_draft.mjs "$PRIOR"
tally "t37-$CUR"   node t37_mydata_draft.mjs "$CUR"

# t38 (v5.72) runs on BOTH legs: the prior leg pins the import defects (A-2, A-4, A-5) and the inert birth-year
# clamp; the current leg asserts each extinct. It is in the APP total. About two minutes per leg.
tally "t38-$PRIOR" node t38_import_hardening.mjs "$PRIOR"
tally "t38-$CUR"   node t38_import_hardening.mjs "$CUR"

# t39 (v5.73) runs on BOTH legs: the prior leg pins Maine's unphased deduction and Montana's $5,500 and
# half-taxed SS; the current leg carries the hand-computed cells. It is in the APP total.
tally "t39-$PRIOR" node t39_me_mt.mjs "$PRIOR"
tally "t39-$CUR"   node t39_me_mt.mjs "$CUR"

# t40 (v5.74) runs on BOTH legs: the prior leg pins C-8 (the Taxes and IRMAA tabs never saw the drawdown —
# $0 federal tax in 2032-2038, lifetime RMD $1,625,926); the current leg asserts the draw agreement, the D-9
# pinned divergence and the hand-verified gap years. It is the suite's FIRST cross-tab test (E-25): every
# other suite drives one engine. It is in the APP total. Its negative controls are qa/tools/controls_v574_c8.py.
tally "t40-$PRIOR" node t40_cross_tab_agreement.mjs "$PRIOR"
tally "t40-$CUR"   node t40_cross_tab_agreement.mjs "$CUR"
tally "t40-$CUR-spend617" env DC_V617_SPENDING=1 node t40_cross_tab_agreement.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t40-$CUR-table620" env DC_V620_TABLE=1 node t40_cross_tab_agreement.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t41 (v5.75) runs on BOTH legs by construction: the prior leg PINS the survivor-age and unused-
# deduction defects as dated known defects, the current leg asserts the statutory figures. A
# current-leg-only run could not show that anything moved. ⚠ It was written and left UNWIRED at the
# v5.75 build — the full suite reported 4,320 green with 39 checks that never executed. Nothing in
# the runner fails when a suite file exists but is not listed here; only this line makes it run.
tally "t41-$PRIOR" node t41_survivor_age_gains.mjs "$PRIOR"
tally "t41-$CUR"   node t41_survivor_age_gains.mjs "$CUR"
# t42 (v5.76) runs on BOTH legs: the v5.75 leg pins C-7 (a single household paid spouse B's Social
# Security) as a dated known defect; the current leg asserts every output equals the zeroed-benefit
# case to the dollar, sweeps the stored figure, and renders the D-2 note. Wired AT BUILD this time.
tally "t42-$PRIOR" node t42_single_spouse_b_ss.mjs "$PRIOR"
tally "t42-$CUR"   node t42_single_spouse_b_ss.mjs "$CUR"
tally "t42-$CUR-spend617" env DC_V617_SPENDING=1 node t42_single_spouse_b_ss.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t42-$CUR-table620" env DC_V620_TABLE=1 node t42_single_spouse_b_ss.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t43 (v5.77) runs on BOTH legs: the v5.76 leg pins C-4 (Engine A drops worksheet line 14) and §1f (Engine C
# taxes a single household on the joint thresholds) as dated known defects, and the four private copies of
# §86; the current leg asserts the shared helper against two independent oracles, Engines A, B and C
# against the worksheet, the IRMAA consequence, and the parser-level extinction check. Wired AT BUILD.
tally "t43-$PRIOR" node t43_ss86_one_rule.mjs "$PRIOR"
tally "t43-$CUR"   node t43_ss86_one_rule.mjs "$CUR"
tally "t43-$CUR-spend617" env DC_V617_SPENDING=1 node t43_ss86_one_rule.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t43-$CUR-table620" env DC_V620_TABLE=1 node t43_ss86_one_rule.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t44 (v5.78) runs on BOTH legs: the v5.77 leg pins C-1 (a MAGI of exactly the IRMAA top threshold billed one tier low) and
# the three private tier loops; the current leg asserts the shared irmaaTierFor against the statute at, above and below every
# threshold, every engine placed bit-for-bit on the top threshold, the lower edges unmoved, the headroom (D-1), the label,
# and a parser check that no other function selects a tier. Wired AT BUILD.
tally "t44-$PRIOR" node t44_irmaa_top_tier.mjs "$PRIOR"
tally "t44-$CUR"   node t44_irmaa_top_tier.mjs "$CUR"
# t45 (v5.79) — the phone layout, in REAL Chromium against the BUILT page (../index.html, copied in by mk_runfolder).
# Current leg ONLY by construction: the run folder carries exactly one built page. It FAILS, never skips, when no browser
# can launch or the page is not this build (decision D-2). Python, the first non-Node suite: Playwright ships in Python here.
tally "t45-$CUR"   python3 t45_phone_layout.py "$CUR"
# t46 (v5.80) runs on BOTH legs: the v5.79 leg pins BASE on every visit with nothing stored; the current leg asserts a
# first visit on BULL-LEANING (label AND the Monte Carlo's regime weights), a saved choice restored in a new session, an
# invalid stored value falling back to the default, and the non-default notice naming the default. Wired AT BUILD.
tally "t46-$PRIOR" node t46_scenario_default.mjs "$PRIOR"
tally "t46-$CUR"   node t46_scenario_default.mjs "$CUR"
# t47 (v5.81) — a phone's first screen (F-12), real Chromium, the BUILT page; current leg only, like t45. Structure checks read
# the run folder's ../<tag>.jsx (one tab list, one guarded selectTab); the guard is exercised through the phone menu. Wired AT BUILD.
tally "t47-$CUR"   python3 t47_phone_first_screen.py "$CUR"
# t48 (v5.82) — legible text and usable targets (F-3/F-4), real Chromium, the BUILT page, all 13 skins; current leg only, like
# t45/t47. Source invariants read ../<tag>.jsx by AST. ~10 minutes — the longest suite. Wired AT BUILD.
tally "t48-$CUR"   python3 t48_legibility_targets.py "$CUR"
# t49 (v5.84) — Engine A sees the spending draw (D-7): hand-verified bracket arithmetic, inertness on 11 households, the draw
# taxed and drained, and AST checks on every caller. Current leg only (the feature does not exist on the prior leg).
tally "t49-$CUR"   node t49_engineA_draw.mjs "$CUR"
# t50 (v5.85) — the seven SS states follow their own law (D-19): statute-typed cases at every threshold and phase-out, CO's
# shared pension cap, RI's age test per spouse, Utah's 4.45 % rate. Current leg only.
tally "t50-$CUR"   node t50_ss_states.mjs "$CUR"
# t51 (v5.86) — state dollar figures carry their tax year; Maine and Louisiana refreshed (D-18): primary-source values, the
# extinction (no dollar figure without a year), fixture households dollar-exact, and the My Data line through the DOM.
tally "t51-$CUR"   node t51_state_figure_years.mjs "$CUR"
# t52 (v5.87) — a state note names only the age the model applies, or says the model differs (D-23): six notes typed from
# their primary sources, the model's behaviour behind each dollar-exact, the extinction across all 51 rows, and My Data via the DOM.
tally "t52-$CUR"   node t52_age_start_notes.mjs "$CUR"
# t53 (v5.88) — My Data's summary names the age the engine applies and the exact figure (D-25): all eighteen exclusion rows
# through the DOM, each against the engine's measured onset; the summary and the note cannot disagree.
tally "t53-$CUR"   node t53_mydata_summary_age.mjs "$CUR"
# t54 (v5.89) — West Virginia's $8,000 senior modification is reduced by the person's taxable SS (D-21): hand-computed cases,
# per person, the count-only fallback, an extinction grid, and Maryland/Maine/Colorado held to their own rules.
tally "t54-$CUR"   node t54_wv_senior_modification.mjs "$CUR"
# t55 (v5.90) — the law's age gates on IA/PA/MS's exemptions and Michigan's cap (D-24): hand-computed cases per state, both-spouses
# rule, pensions vs withdrawals, the count-only path, an extinction grid, the nine no-tax rows, Illinois unchanged.
tally "t55-$CUR"   node t55_retexempt_age.mjs "$CUR"
# t56 (v5.91) — plan type and pension owner COLLECTED, NOT READ (D-12 Phase 1): migration, saved-data round-trip (save 1 == save 2,
# raw), and the extinction invariant that no figure depends on either field until v5.95 (D-12 Phase 3; there is no v5.92, and the
# spending-draw fix ships first as v5.94). Both legs: the prior leg pins the fields' absence and proves v5.90 reads a v5.91 backup
# with unchanged figures.
tally "t56-$PRIOR" node t56_plan_type_collect.mjs "$PRIOR"
tally "t56-$CUR"   node t56_plan_type_collect.mjs "$CUR"
# t57 (v5.93) — per-person, per-plan-type retirement income CARRIED to the state calculator, which ignores it (D-12 Phase 2):
# attributeRetIncome unit + 2,000-case identity grid, the employer share hand-computed, a runtime recorder on all three call sites
# (sums back, decedent gets nothing, the death rescale in both engines), and AST guards. CURRENT LEG ONLY: the function, the
# fields and the anchor do not exist before v5.93. Controls: qa/tools/controls_v593_attribution.py (repo-only), 12 of 12.
# From v5.94 BOTH LEGS (the prior leg is v5.93, which has them); A7/A9 are gated per build — the draw joined the split at v5.94 (D-26).
tally "t57-$PRIOR" node t57_attribution_carry.mjs "$PRIOR"
tally "t57-$CUR"   node t57_attribution_carry.mjs "$CUR"
# t58 (v5.94) — the spending draw reaches the state calculator (D-26): draw == pension in every jurisdiction (Engine A), Engine B
# hand-computed to the dollar (NC, CA, GA, NY), federal and Engines C/D byte-identical to v5.93, AST extinction on every state call,
# the Field Manual line. Both legs: the v593 leg PINS the defect. Controls: qa/tools/controls_v594_state_draw.py (repo-only).
tally "t58-$PRIOR" node t58_state_draw.mjs "$PRIOR"
tally "t58-$CUR"   node t58_state_draw.mjs "$CUR"
tally "t58-$CUR-spend617" env DC_V617_SPENDING=1 node t58_state_draw.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t58-$CUR-table620" env DC_V620_TABLE=1 node t58_state_draw.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t59 (v5.95) — D-12 Phase 3: per-person, per-plan-type state rules (RI, IA, PA, MS, WV) and the survivor slot, to the dollar; without
# byPerson every jurisdiction prices as v5.94 (v595 leg). Both legs; the v594 leg pins the pre-Phase-3 figures.
# Controls: qa/tools/controls_v595_per_person.py (repo-only).
tally "t59-$PRIOR" node t59_per_person_state.mjs "$PRIOR"
tally "t59-$CUR"   node t59_per_person_state.mjs "$CUR"
# t60 (v5.96) — D-27: Engine A files the survivor's state return as its federal one (single from the year after the death): a runtime
# recorder on Engine A's state calls, GA/ME/MI hand cases to the cent and through the whole engine, a v5.95 -> v5.96 comparison (v596 leg),
# an AST extinction check, the Field Manual line. Both legs; the v595 leg pins the defect. Controls: qa/tools/controls_v596_survivor_state.py.
tally "t60-$PRIOR" node t60_engineA_survivor_state.mjs "$PRIOR"
tally "t60-$CUR"   node t60_engineA_survivor_state.mjs "$CUR"
# t61 (v5.97) — D-22 (two of 42): Georgia 4.99 % (HB 463) and Oklahoma 4.5 % (HB 2764) from TY2026; a note stating a rate for a year
# states the row's own rate (all rows); hand cases to the cent; v5.96 -> v5.97 moves only GA/OK, by exactly the rate ratio.
tally "t61-$PRIOR" node t61_ga_ok_rates.mjs "$PRIOR"
tally "t61-$CUR"   node t61_ga_ok_rates.mjs "$CUR"
# t62 (v5.98) — F-5/F-7/F-9 disclosed in Field Manual §13, each clause held to the code fact that keeps it true; F-16: the glossary in
# case-insensitive order (extinction). Both legs; the v597 leg pins the absence and the one out-of-order pair.
tally "t62-$PRIOR" node t62_desktop_disclosures.mjs "$PRIOR"
tally "t62-$CUR"   node t62_desktop_disclosures.mjs "$CUR"
# t63 (v5.99) — D-22 batch 1: the thirteen flat-rate states read for TY2026 (ID, IN, OH move); hand cases to the cent; Ohio's top-rate
# overstatement from the statute's formula; v5.98 -> v5.99 moves only ID/IN/OH, by exactly the rate ratio. Both legs; the v598 leg pins the old rates.
tally "t63-$PRIOR" node t63_flat_rates.mjs "$PRIOR"
tally "t63-$CUR"   node t63_flat_rates.mjs "$CUR"
# t64 (v6.00) — D-22 option 3, batch 1: ten states on their own bracket schedules (CA MN MS NJ NY OK OR SC VA WI), New York's recapture;
# each schedule against its source and the state's printed table; hand cases to the cent; v5.99 -> v6.00 moves only the ten. Both legs.
tally "t64-$PRIOR" node t64_state_brackets.mjs "$PRIOR"
tally "t64-$CUR"   node t64_state_brackets.mjs "$CUR"
# t65 (v6.01) — D-22 option 3, batch 2: the other seventeen progressive states on their own schedules (AL AR CT DC DE HI KS MD ME MO MT ND
# NE NM RI VT WV), with Arkansas's high-income table, Connecticut's phase-out and recapture, Maryland's county and capital-gains taxes, Maine's
# surcharge, and Hawaii's and Rhode Island's later top brackets; each against its source and printed table; hand cases to the cent; the
# D-22 extinction (every taxing row on a schedule or flat); v6.00 -> v6.01 moves only the seventeen. Both legs.
tally "t65-$PRIOR" node t65_state_brackets_b2.mjs "$PRIOR"
tally "t65-$CUR"   node t65_state_brackets_b2.mjs "$CUR"
# t66 (v6.02) — D-30 batch 1: the 27 progressive states' standard deductions, exemptions and personal credits (each against its source, dated),
# the phase shapes at their edges, hand cases to the cent, v6.01 -> v6.02 against an independent implementation (qa/d30_ref.mjs, which the
# derived pins in t10, t35, t39, t50-t55, t58-t61, t64 and t65 also use); and Ask AI's cap, cut-off notice and timeout. Both legs.
tally "t66-$PRIOR" node t66_deductions_askai.mjs "$PRIOR"
tally "t66-$CUR"   node t66_deductions_askai.mjs "$CUR"
# t67 (v6.03) — D-30 batch 2: the fourteen flat-rate states' deductions, exemptions and personal credits (each against its source, dated;
# Pennsylvania's law has none), Idaho's zero band and Ohio's 2026 schedule with its $332 step; v6.02 -> v6.03 against qa/d30_ref.mjs (D30F);
# My Data's flat-rate line. Both legs.
tally "t67-$PRIOR" node t67_deductions_flat.mjs "$PRIOR"
tally "t67-$CUR"   node t67_deductions_flat.mjs "$CUR"
# t68 (v6.04) — D-31 and D-29: Alabama's, Missouri's and Oregon's deduction of federal income tax, the federal senior deduction in the six states
# whose returns carry it, Missouri's capital-gains subtraction; v6.03 -> v6.04 against qa/d30_ref.mjs; Engine B against the calculator. Both legs.
tally "t68-$PRIOR" node t68_fed_deductions.mjs "$PRIOR"
tally "t68-$CUR"   node t68_fed_deductions.mjs "$CUR"
# t69 (v6.06) — D-28 widened: a commercial (non-qualified) annuity gets no retirement relief in the thirteen states whose law gives it none,
# and Maryland's pension exclusion no longer reaches IRA money; hand cases, v6.05 -> v6.06 over every jurisdiction, the data. Both legs.
tally "t69-$PRIOR" node t69_annuity_relief.mjs "$PRIOR"
tally "t69-$CUR"   node t69_annuity_relief.mjs "$CUR"
# t70 (v6.07) — D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money; the engines carry the annuity dollars.
# Both legs: the prior leg pins the defect ([KNOWN DEFECT]); §D's differential reads app_v606.mjs when the run folder has it.
tally "t70-$PRIOR" node t70_annuity_conversion.mjs "$PRIOR"
tally "t70-$CUR"   node t70_annuity_conversion.mjs "$CUR"
# t71 (v6.08) — D-34: Engine D converts an Other-accounts Traditional IRA (bucket money first, never annuity money), figures the cap after
# the year's draws, grows that IRA's RMD tracker and takes its RMD whole. Both legs: the prior leg pins the defects ([KNOWN DEFECT]); an
# independent oracle reproduces each leg under its own rules; §E's differential reads app_v607.mjs when the run folder has it.
tally "t71-$PRIOR" node t71_engine_d_other_ira.mjs "$PRIOR"
tally "t71-$CUR"   node t71_engine_d_other_ira.mjs "$CUR"
tally "t71-$CUR-spend617" env DC_V617_SPENDING=1 node t71_engine_d_other_ira.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t71-$CUR-table620" env DC_V620_TABLE=1 node t71_engine_d_other_ira.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t72 (v6.09) — D-35: a Roth IRA entered under Other accounts is counted once in Engine D, as Roth money (out of the pool's gains part and out of
# the buckets' Roth share); its brokerage twin, an independent oracle, and the Withdrawal tab's cards. Both legs: the prior leg pins the defect;
# §D's differential reads app_v608.mjs when the run folder has it.
tally "t72-$PRIOR" node t72_engine_d_other_roth.mjs "$PRIOR"
tally "t72-$CUR"   node t72_engine_d_other_roth.mjs "$CUR"
tally "t72-$CUR-spend617" env DC_V617_SPENDING=1 node t72_engine_d_other_roth.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
tally "t72-$CUR-table620" env DC_V620_TABLE=1 node t72_engine_d_other_roth.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t73 (v6.10) — the Ranking tab's peer benchmarks: one module-level table on the 2025 SCF, no peer figure typed anywhere else (AST), every
# tier cut-off priced from both sides on the rendered tab, the vintage copy and the Field Manual, and the refresh alarm. Both legs: the
# prior leg pins what v6.09 shows.
tally "t73-$PRIOR" node t73_peer_benchmarks.mjs "$PRIOR"
tally "t73-$CUR"   node t73_peer_benchmarks.mjs "$CUR"
# t74 (v6.11) — F-19r: the Ranking tab's headline is the net-worth band and nothing else; the rows with no peer data carry no tier; the copy
# states figures, not verdicts; the Field Manual says which rows are ranked. Both legs: the prior leg pins what v6.10 shows. It re-runs the
# Monte Carlo after each household change and checks that it did (OPERATIONS §C).
tally "t74-$PRIOR" node t74_ranking_headline.mjs "$PRIOR"
tally "t74-$CUR"   node t74_ranking_headline.mjs "$CUR"
# t75 (v6.12) — C-5: the Withdrawal tab's Bracket column taxes Social Security by the §86 worksheet, on the year's filing status (Single
# from the year after the first death), on the indexed table with the age-65 extra; an independent oracle every year on ten households,
# what cannot move (v6.11 → v6.12), the extinction of any × 0.85 product outside the helper, the rendered tabs. Both legs: the prior leg
# pins what v6.11 shows.
tally "t75-$PRIOR" node t75_engine_d_ss86.mjs "$PRIOR"
tally "t75-$CUR"   node t75_engine_d_ss86.mjs "$CUR"
tally "t75-$CUR-spend617" env DC_V617_SPENDING=1 node t75_engine_d_ss86.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — every v6.17 figure must come out exactly
# t76 (v6.13) — C-11: the Roth tab's break-even card, the Field Manual and METHODOLOGY name the face-value measure ("after-tax wealth" is
# extinct); the §63(f) blind amount disclosed; C-9's extinction (an annuity changes no RMD in Engines A, B or C when nothing draws on the
# pool); v6.12 → v6.13 moved text only (AST); the rendered card, and the census row held to it. Both legs: the prior leg pins v6.12's copy.
tally "t76-$PRIOR" node t76_crossover_label.mjs "$PRIOR"
tally "t76-$CUR"   node t76_crossover_label.mjs "$CUR"
tally "t76-$CUR-spend617" env DC_V617_SPENDING=1 node t76_crossover_label.mjs "$CUR"   # v6.18 (D-41): v6.17's spending as a table — the v6.17 figure must come out exactly
# t77 (v6.14) — D-17 and C-14: payroll tax on job income follows §3101/§3121 — Social Security per earner up to the wage base, Medicare
# uncapped, the 0.9% Additional Medicare Tax above $200K / $250K (unindexed); an oracle against Engine B every year on nine households;
# one helper and no stray rate (AST); what cannot move and Engine A across v6.13 → v6.14; the hand pin; the copy and the rendered Taxes tab.
# Both legs: the prior leg pins v6.13's rule.
tally "t77-$PRIOR" node t77_payroll_tax.mjs "$PRIOR"
tally "t77-$CUR"   node t77_payroll_tax.mjs "$CUR"
# t78 (v6.15) — the Events tab speaks to users only: the tax card is a NOTICE the app-wide strip ignores (so a maintainer's alarm can no
# longer hide the user's own January items), the backtest and peer chores are gone, no Google Drive anywhere (AST and the built page),
# no "survives the swap" promise; what did not move across v6.14 → v6.15 on 72 dates; the strip rendered with the clock at 2027-01-05.
# Both legs: the prior leg pins v6.14's defects.
tally "t78-$PRIOR" node t78_events_user_facing.mjs "$PRIOR"
tally "t78-$CUR"   node t78_events_user_facing.mjs "$CUR"
# t79 (v6.16) — self-employment tax (D-36): a "Job — self-employed (1099)" row owes both halves on 92.35% of the profit (§1401, §1402(a)(12)),
# the SS base reduced by the person's wages, the 0.9% on wages + net, the $400 floor; an oracle from the statute, one helper and no stray
# rate (AST); employee-only households, Engines C and D and the Monte Carlo bit-identical across v6.15 → v6.16; hand pins; the input
# survives save/export/import; the copy. Both legs: the prior leg pins v6.15's employee-only rule as a dated [KNOWN DEFECT].
tally "t79-$PRIOR" node t79_self_employment.mjs "$PRIOR"
tally "t79-$CUR"   node t79_self_employment.mjs "$CUR"
# t80 (v6.17) — the cash from a home move is a My Data field, not the fixed $130,000 every plan carried through v6.16 (D-38): against
# ORACLE modules built at test time from the v6.16 source with the constant set to X, the field reproduces both Monte Carlo engines and the
# mortgage what-if bit for bit; by AST the constant is gone and the accessor is read at the five model sites only; Engines A–D and the bridge
# never see it; the planned-path hand pin; the field rendered, saved, exported and imported; an old plan reads $0 with a notice; the copy.
# Both legs: the prior leg pins the constant as a dated [KNOWN DEFECT].
tally "t80-$PRIOR" node t80_home_move_cash.mjs "$PRIOR"
tally "t80-$CUR"   node t80_home_move_cash.mjs "$CUR"
# t81 (v6.18) — the Withdrawal tab spends the expense table at the plan's own dates, year by year (D-41): Engine D's spending against an
# INDEPENDENT oracle (its own month loop over the EXPENSES rows) to the cent on the example, every fixture, the same plan 3 and 6 years later,
# single, Medicare-before-retirement, a survivor case and a stress table; tableYearExpense unit-tested; by AST no typed "YYYY-MM" reaches the
# table readers and Engine D, Backtest and What-Breaks share the one read; the display snapshots follow the plan's dates (the example's three
# unchanged); both Monte Carlo engines bit-identical across the pair; a flat table moves nothing; v6.17's spending as a table reproduces
# v6.17's Engine D (the tool the "-spend617" runs above use); rendered Withdrawal, Backtest, What Breaks and Expenses; the copy.
# Both legs: the prior leg pins the snapshots as a dated [KNOWN DEFECT].
tally "t81-$PRIOR" node t81_engine_d_spending.mjs "$PRIOR"
tally "t81-$CUR"   node t81_engine_d_spending.mjs "$CUR"
tally "t81-$CUR-table620" env DC_V620_TABLE=1 node t81_engine_d_spending.mjs "$CUR"   # v6.21 (D-42): the example's table without its four car rows (v6.20's) — every v6.20 figure must come out exactly
# t82 (v6.19) — the Monte Carlo's quarter calendar (D-46): the calendar against an INDEPENDENT oracle written from dates, for an as-of date in
# every month of two years and every event month; RETIRE_OPTIONS and the timeline take their quarters from it; by AST the old label formula,
# the two old quarter rules and the literal 2026 are gone from the machinery; the example's 6-year run bit-identical across the pair; the
# 30-year engine bit-identical to ORACLE MODULES built from the v6.18 source with its four event quarters one earlier (and 2027 in the age
# line); the stress set's forced years are calendar years (regime trace); the first quarter and a mid-quarter claim exact on the planned path;
# the planned balance at retirement smooth in the as-of date (the extinction); Engines B, C, D unmoved; a plan saved after it retired gets no
# home-move cash; rendered. Both legs: the prior leg pins what is observable from outside as dated [KNOWN DEFECT] checks.
tally "t82-$PRIOR" node t82_mc_calendar.mjs "$PRIOR"
tally "t82-$CUR"   node t82_mc_calendar.mjs "$CUR"
# t83 (v6.20) — the Monte Carlo pays the Taxes tab's tax and charges one-time expenses in the quarter they fall (D-40, D-44, D-45): the
# schedule equals the Taxes tab's rows exactly on every household, preset and slider; both planned paths move by the compounded tax, exact,
# with a hand pin to the cent; a one-time row in every month of two years charged once in its own quarter, inflated, exact; a year's four
# quarters add to tableYearExpense; by AST the drag is gone, neither engine reads the table except through mcQuarterSeries, and every
# outflow is named; the tail, timing, slider, state, QCD, and the t20 / t56 guards on their new footing with controls; Engines B, C, D
# unmoved; an ORACLE MODULE from the v6.19 source with the drag at 0 bit-identical to v6.20 with a zero schedule (both engines on every
# household, the stress set on two); the app's wiring by AST; t42 D-4's re-pin attributed step by step; rendered; METHODOLOGY. Both legs: the prior leg pins the old behaviour as
# dated [KNOWN DEFECT] checks.
tally "t83-$PRIOR" node t83_mc_tax.mjs "$PRIOR"
tally "t83-$CUR"   node t83_mc_tax.mjs "$CUR"
# t84 (v6.21) — a car is an expense row; the "after the payments end" figure, the Stress tab's planned path and the state lines come from
# the plan (D-42, D-43, D-47, D-50): by AST the fixed car, its switch, the six -400 subtractions and the 1.04 benchmark are gone; v6.21's
# example equals v6.20 run on the same table with its car off (both engines, Engine D), and on v6.20's table v6.21 reproduces v6.20's Engines
# A-D, the bridge and the tax schedule bit for bit (the attribution of every re-pin); a plan saved before v6.21 gains the old schedule as
# visible rows, written only on Save & Apply; the payments rule against an oracle; rendered (Income, SS, Roth, Monte Carlo, Stress, My Data);
# the Field Manual and METHODOLOGY. Both legs: the prior leg pins what v6.21 changes as dated [KNOWN DEFECT] checks.
tally "t84-$PRIOR" node t84_car_rows.mjs "$PRIOR"
tally "t84-$CUR"   node t84_car_rows.mjs "$CUR"
# t85 (v6.22) — a new plan keeps no one else's facts (D-53 and siblings): a load without a master prompt holds none, the example's path
# holds the demo, and storage keeps what memory keeps; DEFAULT_PORTFOLIO carries the example's ten facts, each equal to what the app's own
# parsers read from the demo prompt (by AST, live); the example unmoved across the pair; income a plan never entered is paid $0 and named;
# rendered (Start Fresh, My Data's placeholder and example-facts notices, the no-state wording on Taxes / Roth / My Data, Ask AI's preview,
# reloads, an unreadable stored plan, backups — a non-string or over-long prompt, a backup with no expense table). Both legs: the prior leg
# pins what v6.22 changes as dated [KNOWN DEFECT] checks. Controls: qa/tools/controls_v622_prompt.py (repo-only).
tally "t85-$PRIOR" node t85_prompt_carryover.mjs "$PRIOR"
tally "t85-$CUR"   node t85_prompt_carryover.mjs "$CUR"
# t86 (v6.23) — the built-in part-time work for spouse B reaches the example only (D-49): a plan that is not the example by its holdings,
# or is single, or has an income stream, is paid none; the example is unmoved (every engine, bit for bit, against v6.22); every other plan
# equals v6.22 with the work switched off; the My Data and Monte Carlo notices and the workRowsV623 marker; the wording. The v6.22 leg pins
# what v6.23 changes as dated [KNOWN DEFECT] checks. Controls: qa/tools/controls_v623_work.py (repo-only).
tally "t86-$PRIOR" node t86_builtin_work.mjs "$PRIOR"
tally "t86-$CUR"   node t86_builtin_work.mjs "$CUR"
# t87 (v6.24) — My Data keeps each expense row's months (D-52): an unedited Save & Apply, Export Backup and the draft store the table as it
# loaded; the engines are unmoved by a save (the portfolio held fixed); the When defaults split at the 1 January retirement, from the editor's
# live retirement year; the guided setup splits there and runs to the plan's horizon (D-54). The v6.23 leg pins what v6.24 changes as dated
# [KNOWN DEFECT] checks. Also D-59: the leave dialog's SAVE & APPLY, THEN LEAVE saves and lands on the chosen tab (A-9, A-9b, A-9d).
# Controls: qa/tools/controls_v624_months.py (repo-only).
tally "t87-$PRIOR" node t87_expense_months.mjs "$PRIOR"
tally "t87-$CUR"   node t87_expense_months.mjs "$CUR"
# t88 (v6.25) — My Data's holdings table, one control per cell (F-21): plan type in its own headed column (a dash for a Roth row), a divider
# under each row, the footer's totals under their own columns, the plan type still saved. Structure only (jsdom does no layout); the v6.24 leg
# pins both defects as dated [KNOWN DEFECT] checks. Controls: qa/tools/controls_v625_columns.py (repo-only).
tally "t88-$PRIOR" node t88_holdings_columns.mjs "$PRIOR"
tally "t88-$CUR"   node t88_holdings_columns.mjs "$CUR"
# t89 (v6.26) — Ask AI's ground rules reach every plan (D-55): a fixed header first in the system text on every route and every way into a
# plan, exactly once, stored nowhere; the live context's own lines; the copy. Both legs (the v6.25 leg pins the absence). Spawns itself once
# with --claude for the claude.ai route; prints one count line.
tally "t89-$PRIOR" node t89_ai_ground_rules.mjs "$PRIOR"
tally "t89-$CUR"   node t89_ai_ground_rules.mjs "$CUR"
# t90 (v6.27) — the Grade tab reports the model's grading, not actions (F-22): the panel's directives and invented projections gone, the
# false and example-only sentences corrected, the literal grades and the B+ ceiling labelled, the Field Manual's entry rewritten. Both legs
# (the v6.26 leg pins the defects); the v6.27 leg spawns the v6.26 leg once with --dump and checks no grade moves. Prints one count line.
tally "t90-$PRIOR" node t90_grade_findings.mjs "$PRIOR"
tally "t90-$CUR"   node t90_grade_findings.mjs "$CUR"
# t91 (v6.28) — the app describes the model, it does not direct (F-23, F-24): a directive lint over the rendered tabs and the Field Manual,
# the removed phrases extinct, the Grade tab's real GPA cost, the corrected model descriptions held to the engines by AST, the LTC label
# test. Both legs (the v6.27 leg pins the defects). Prints one count line.
tally "t91-$PRIOR" node t91_directives.mjs "$PRIOR"
tally "t91-$CUR"   node t91_directives.mjs "$CUR"
# t92 (v6.29) — what the app says about its own model (F-25): the replaced sentences extinct by AST, no typed preset name in an in-app
# sentence, every AMT constant checked on the Verify tab (by mutation), the computed sentences (Stress recovery, Backtest note, What Breaks'
# history) against independent readings, the four figures, spouse B's RMD event, the Exit Plan's months, privacy parity, the Field Manual
# and METHODOLOGY. Both legs (the v6.28 leg pins the defects); module facts in a child process. Prints one count line.
tally "t92-$PRIOR" node t92_model_claims.mjs "$PRIOR"
tally "t92-$CUR"   node t92_model_claims.mjs "$CUR"
# t93 (v6.30) — one dollar unit and one inflation clock for the tax engines (D-60): the statute rates (C-CPI-U, CPI-U) against the scenario
# table, Engine B's units input by input, the homogeneity invariant (real income, rates forced to the plan's inflation, the same tax in
# today's dollars every year), one clock (a fixed amount is the amount paid; Engine D at the two-clock boundary equals v6.29), the Monte
# Carlo's schedule, Engine A's today's-dollar fields, IRMAA surcharges to the premium year, basis, the source by AST, copy and the
# rendered tabs. Both legs (the v6.29 leg pins the defects); module facts in a child process. Prints one count line.
tally "t93-$PRIOR" node t93_dollar_units.mjs "$PRIOR"
tally "t93-$CUR"   node t93_dollar_units.mjs "$CUR"
# t94 (v6.31) — the Monte Carlo pays IRMAA, and Ask AI asks Claude Opus 4.8 at medium effort (D-51, AI-6): the schedule's parts against
# Engines B and C exactly (premium year, edges, tail), the planned paths by the compounded surcharges with a hand pin, the extinction invariant
# (surcharge table at zero → v6.30's schedule), What Breaks against Engine A and Engine A beside Engine C (D-66), the request by AST and through a
# recording fetch on all three routes (model, effort, no thinking, refusals, the timeout), the rendered tabs, copy. Both legs (the v6.30 leg
# pins the defects); the claude.ai route in a child process. Prints one count line.
tally "t94-$PRIOR" node t94_mc_irmaa_ai.mjs "$PRIOR"
tally "t94-$CUR"   node t94_mc_irmaa_ai.mjs "$CUR"
# t95 (v6.32) — QCDs after a death, and five tabs say what the model does (D-61, F-26): Engines B and C's QCD against a head-count made in the
# suite on nine households, the two engines equal every year, pre-death years v6.31's to the cent; stressPlanFacts against the Monte Carlo's
# quarter calendar; the Stress tab rendered on six plans; the survivor grid; the Roth ladder at ±1 and byte-identical at the target year (child
# processes); the Backtest's worst start; ACA dates at fixed clocks; the README; copy. Both legs (the v6.31 leg pins the defects). One count line.
tally "t95-$PRIOR" node t95_f26_d61.mjs "$PRIOR"
tally "t95-$CUR"   node t95_f26_d61.mjs "$CUR"
# t96 (v6.33) — the tables index from their own year (D-67, F-28): the source by AST (no helper takes a base year, no call passes an as-of
# year, no surcharge grown by the dollar clock, no engine reading the 2026 table directly); the extinction invariant (one household dated 2025,
# 2026, 2027 and 2028: Engines A, B, C and projectBracketsAt the same in all four, and a MAGI in the tier gap); the Roth tab's rendered threshold
# against a typed oracle; nothing moves for a plan dated 2026 (byte-identical JSON and the rendered ladder, against the v6.32 module); Engine B
# against the statute oracle; the copy; the Taxes tab's bracket panel. Both legs (the v6.32 leg pins the defects). One count line.
tally "t96-$PRIOR" node t96_table_year.mjs "$PRIOR"
tally "t96-$CUR"   node t96_table_year.mjs "$CUR"
# t97 (v6.34) — My Data keeps spouse A's stored pre-tax contribution (D-58): the round trip through the real controls (Export Backup,
# the draft and its restore, Save & Apply) on the example, a hand-made backup with cents and a single plan; plans with a paycheck breakdown
# (consistent, disagreeing, an amount edit, a frequency edit); the extinction invariant (an unedited save moves no engine figure); the display
# sites; the 402(g) line; one rule (effectivePreTaxA) by unit cases, AST and behaviour; the copy. Both legs (the v6.33 leg pins the defect).
tally "t97-$PRIOR" node t97_contrib_save.mjs "$PRIOR"
tally "t97-$CUR"   node t97_contrib_save.mjs "$CUR"
# t98 (v6.35) — STAY UNDER IRMAA stays under (D-62), the last working years' MAGI (D-65), one-time rows before retirement (D-44): the
# solver's invariants (under the cliff less the margin; the largest such conversion; the estimate equals the engine; monotone; no phases) on
# every fixture, the example and the single-filer ACA-bridge households that cycled a fixed point; every other strategy bit-identical; one
# year by hand; the working rows by hand, Engines A and C agreeing, the Monte Carlo paying them, the AST rule on every P builder, the round
# trip through the real controls, the flag; Engine D's opening pools by hand, which rows count, the overflow, the +1 YEAR button; the copy.
# Both legs (the v6.34 leg pins each defect).
tally "t98-$PRIOR" node t98_irmaa_onetime.mjs "$PRIOR"
tally "t98-$CUR"   node t98_irmaa_onetime.mjs "$CUR"
echo "== TOOLING (not counted in APP TOTAL) =="
tally "t21" node t21_tools.mjs
tally "domdiff" node domdiff_withdrawal.mjs "$PRIOR" "$CUR"
# state_sets_check (2026-09-15, SCOPE_STATE_SET_SELECTOR stage 1) is TOOLING: it asserts the suite's shared
# income-limited list, its drift guard, and that f6_probe agrees with t29 F-6. Both legs; no app figure.
tally "sets-$PRIOR" node state_sets_check.mjs "$PRIOR"
tally "sets-$CUR"   node state_sets_check.mjs "$CUR"
echo
awk '{p+=$1; f+=$2; if ($3=="DIED") d++} END {printf "GRAND (incl tooling): %d passed, %d failed%s\n", p, f, (d ? sprintf(" — %d suite(s) DIED, each counted as one failure", d) : "")}' "$TMP/tally.txt"
echo "logs: $TMP"
