# MISSING TAXATION FEATURES — Section D of the standing code audit

> **CURRENT PIN: v5.73 (2026-09-15) — the standing audit's full run, all four phases, is COMPLETE.** Read the **Census at v6.04** table directly below first (added 2026-10-11 — every item's status); the **RE-PINNED TO v5.73** block follows the original audit table.
> The table below records the ORIGINAL v5.29 audit and is kept as history. *(Added 2026-09-26: this header read as "build
> under audit: v5.29", and it misled the v5.77 handover — and a recommendation made from it — into proposing a Phase 3 that
> had already run. Items fixed since v5.73 are annotated at their entries.)*

## Census at v6.04 (2026-10-11) — read this first

**Method.** Every D item's status, read from its own entry's annotations and, where marked *(parser)*, re-checked against the v6.04
source (`8226b20b62334074606993d411bb0fb1`, repo `c200261`) by evaluating `STATE_RULES` or walking the source's literals with acorn.
Written when this file became the pooled home for the open threads of documents leaving the pool (ops package of 2026-10-11, third).
The blocks below this table — the v5.73, v5.48, v5.39 and v5.29 pins — are history; each entry keeps its full record. Headings of closed
items now carry their status; IDs are unchanged.

| ID | Status at v6.04 | Evidence / what remains |
|---|---|---|
| D-1 | **CLOSED** (confirmed v5.73) | at v5.73 Engine A still omitted the senior deduction, as disclosed — not re-checked here |
| D-2 | **CLOSED v5.36** | confirmed v5.73 |
| D-3 | **CLOSED v6.01** | every progressive state on its own schedule (v6.00–v6.01, D-22); its over-taxing remainder was D-30, closed v6.03. The v5.73 row's "filed lead" (Montana's two brackets) is modelled — `MT.brackets` 4.7 % / 5.65 % *(parser)* |
| D-3c | **CLOSED** | NJ v5.67, VA v5.68, Maine v5.73 |
| D-4 | **OPEN** (Low–Med, conservative) | itemized deductions not modelled — METHODOLOGY says so |
| D-5 | **DECLINED** | — |
| D-6 | **CLOSED v5.49** | the entry's HALF-CLOSED box (v5.48) is superseded |
| D-7 | **DISCLOSED v5.50**; modelling declined | state estate and inheritance tax — optimistic, stated in-app |
| D-8 | D-8a **ADDRESSED v5.32**; D-8b **PARTIALLY ADDRESSED v5.32** | the declined toggle is not built |
| D-9 | **DISCLOSED v5.51** | `HEIR_RATE` stays 0.22 by decision |
| D-10 | ◑ **PARTLY SHIPPED** | disclosure v5.52; modelling in part v5.53 (dividends landed; realized gains did not, by resolved decision) — its row in the summary table |
| D-11 | ◐ **NARROWED** | WI exact (v5.60); RI's cliff (v5.69), per-person and IRA rule (v5.95, D-12) and SS modification (v5.85); NM's bands (v5.66), SS cliff (v5.85) and own brackets (D-22). **Still open:** New Mexico's age floor was never established against its statute (the model uses 65); Rhode Island's removal of the age test from its SS modification for TY2027 (H 7127) is recorded in METHODOLOGY and not modelled; RI's AGI measure omits dividends and interest (disclosed in its note) |
| D-12 | **CLOSED v5.95** | all three phases |
| D-13 | **OPEN, unanswered** | a research question — how often any state threshold binds |
| D-14 | **FIXED v5.74** | — |
| D-15 | **OPEN** (Low, pessimistic) | Maine's note still reads "Applied from 65, although Maine law has no age-65 test" *(parser)* |
| D-16 | **OPEN** (Low–Med) | no head-of-household or qualifying-surviving-spouse status — no such string in the source *(parser)* |
| D-17 | **CLOSED v6.14** *(row updated 2026-10-15)* | modelled: the 0.9% on household wages above $200,000 / $250,000, unindexed, in the one payroll helper (`payrollTax`) Engines A and B call — with C-14, the per-earner wage cap, found by the same scope (`docs/SCOPE_D17_PAYROLL_TAX_V614.md`; `t77`) |
| D-18 | **FIXED v5.86**; the refresh **recurs** | next known: Montana's TY2026 subtraction (by 1 Nov 2026), Rhode Island's TY2026 thresholds (Nov 2026), Maine's TY2026 thresholds, Louisiana's TY2027 amount, Georgia's $70,000 at 65+ from TY2027 — the entry's list |
| D-19 | **FIXED v5.85** | — |
| D-20 | **CLOSED v6.04** | v6.02 takes the federal standard deduction (and its 65+ additions) Montana starts from; v6.04 the senior deduction — `MT.deduct` *(parser)* |
| D-21 | **FIXED v5.89** | — |
| D-22 | **CLOSED v6.01** | — |
| D-23 | **FIXED v5.87** | decision D18-3 answered (as D23-A/B/C) |
| D-24 | **FIXED v5.90** | — |
| D-25 | **FIXED v5.88** | — |
| D-26 | **FIXED v5.94** | — |
| D-27 | **FIXED v5.96** | — |
| D-28 | **CLOSED v6.06** (widened) | a commercial annuity gets no retirement relief in the thirteen states whose law gives it none — PA was one of them; Maryland's IRAs with it |
| D-29 | **CLOSED v6.04** | — |
| D-30 | **CLOSED v6.03** | — |
| D-31 | **CLOSED v6.04** | not taken, disclosed: DC's senior deduction, the refunds Alabama and Oregon recapture, Oregon's 2026 cap |
| D-32 | **OPEN** (Low, conservative) | Ohio's retirement income and joint filing credits and Utah's retirement credit — each state's note says not taken *(parser)* |
| D-33 | **CLOSED v6.07** | a conversion, a QCD and an RMD never take non-qualified annuity money; the engines carry the annuity dollars |
| D-34 | **CLOSED v6.08** | Engine D converts an Other-accounts Traditional IRA after the bucket money, figures the cap after the draws, grows that IRA's RMD tracker and takes its RMD whole |
| D-35 | **CLOSED v6.09** | a Roth IRA entered under Other accounts is counted once in Engine D, as Roth money: out of the pool's gains part and out of the buckets' Roth share |
| D-36 | **CLOSED v6.16** | modelled: a job row of type "Job — self-employed (1099)" pays both halves on 92.35% of the profit, nothing under $400 net, Social Security on the base the same person's wages leave, the 0.9% on wages + net earnings — in `payrollTax`, Engines A and B; rows saved before v6.16 stay employees |
| D-37 | **OPEN** (Low–Med, conservative) | two self-employment deductions not taken: half the self-employment tax (§164(f), above the line — it would lower AGI and every MAGI) and the QBI deduction (§199A). Disclosed in the Taxes tab's method note, the Field Manual and METHODOLOGY |
| D-38 | **CLOSED v6.17** *(filed and fixed 2026-10-16)* | the cash from a home move at retirement is the My Data field `homeMoveCash` (signed; 0 = no move), read by the two Monte Carlo engines through one accessor — through v6.16 a fixed $130,000 constant was added to every plan, undisclosed. A plan saved before v6.17 reads $0 with a notice; the example keeps $130,000 |
| D-39 | **OPEN** (Low–Med, either direction) | the Withdrawal, Taxes, IRMAA and Roth tabs do not see the home-move cash — only the Monte Carlo figures do. Disclosed in My Data, the Monte Carlo tab, the Field Manual and METHODOLOGY |
| D-40 | **CLOSED v6.20** | the Monte Carlo's only income tax was a flat $16,000 a year during the Roth ladder (`ROTH_TAX_DRAG_Q`), whatever the plan converted or owed, and none after it. From v6.20 both engines pay the Taxes tab's tax year by year (`mcIncomeTaxSchedule`), at the live conversion slider, QCD and yield, grown with each path's inflation |
| D-41 | **CLOSED v6.18** *(filed and fixed 2026-10-18)* | the Withdrawal tab (and Backtest and What-Breaks) spent the expense table as it stood in June 2029 and June 2031 — the example's dates — for every plan; from v6.18 each year's own months and one-time rows (`tableYearExpense`), and the display figures follow the plan's dates |
| D-42 | **CLOSED v6.21** | a car is a one-time expense row: `AUTO_REPLACE_COST` and the `autoReplace` switch are gone; the example's table carries four $40,000 rows (2037, 2045, 2053, 2061); a plan saved before v6.21 has the old schedule added as visible rows when it loads, written to storage at its next Save & Apply (`docs/SCOPE_D42_CAR_V621.md`; `t84`). Found at the scope: the old car was left out of the planned path its guardrails steer by |
| D-43 | **CLOSED v6.21** | the figure after the payments end is read from the table (the month after the last monthly row running at the Medicare month that ends before the horizon); the register said four sites on one tab — it was six on two (Income, Social Security) |
| D-44 | **OPEN — narrowed v6.20** (Low, optimistic) | the Withdrawal tab never sees a one-time row dated before the retirement year (disclosed on the tab since v6.18). *The Monte Carlo half — one-time rows charged in today's dollars — closed at v6.20* |
| D-45 | **CLOSED v6.20** | the Monte Carlo charged a one-time row only when it was dated in a quarter's last month, so the example's April 2029 rows ($28,000) never reached it. From v6.20 one quarter read (`mcQuarterSeries`) charges a row in the quarter that contains its month, and monthly rows count their own months |
| D-46 | **CLOSED v6.19** *(filed and fixed 2026-10-18)* | the Monte Carlo's quarter calendar: both engines dated quarter 0 "June of the as-of year" for every plan; the 6-year engine placed events by `round(months ÷ 3)` from the as-of month, the 30-year engine by quarters from January of the as-of year (ignoring the as-of month, and for an April–June as-of date retiring and claiming a quarter late); the year 2026 was typed into run A, the chart axis, the Stress table and the longevity ages; the run headers said runs B and C start at retirement. From v6.19 one calendar (`mcQuarterOf` / `mcQuarterDate`), a part first quarter, claims from their month, forced stress years on calendar years |
| D-47 | **CLOSED v6.21** (was Low, display) | the Stress tab's "30-year guardrail boundaries" table compared the Monte Carlo median with a "planned" figure of `household × 1.04^years`, a benchmark that ignored withdrawals; it now reads `runExtendedMC`'s own planned path, with the guardrails' own bands (`t84` A-4, A-7, F) |
| D-48 | **OPEN** (Low) | My Data's as-of date is the UTC date of saving (`toISOString`), so an evening save in the Americas on a quarter's last day falls in the next quarter — after v6.19 that moves the 30-year figures by about a quarter's accumulation. Disclosed in METHODOLOGY |
| D-49 | **OPEN — narrowed v6.23** (Low, conservative; the example alone) | the built-in part-time work for spouse B (`spouseBWorkTaper`, $20,000, $18,000 and $15,000 of spouse-B wages in retirement years 0–2). *Through v6.22 every plan with no income streams, single ones included, was paid it; from v6.23 only the example household (its holdings, married, no streams) is, and a plan saved before v6.23 that loses it is told so until its next Save & Apply (`t86`; `docs/SCOPE_D49_WORK_TAPER_V623.md`).* What remains is the example's: Engine D spends the wages and Engines A, B and C and the Roth ladder tax them (this row said "credited and taxed by Engines A, B, C and D" until v6.23 — only Engine D credits them), while the Monte Carlo pays their tax (through the schedule) without crediting them, and the Income tab, Backtest and What-Breaks do not credit them — conservative by $14,479 on the example. Disclosed in the Field Manual and METHODOLOGY |
| D-50 | **CLOSED v6.21** | the mortgage what-if states the model's rule (no itemized deductions, so no offset); a sibling found at the scope — the Roth tab's rules box said "Florida — no state income tax" to every plan — names the plan's state as the Taxes tab does. **Narrowed by D-53 at v6.21; the narrowing lifted at v6.22** (D-53 closed: a new plan holds no example prompt, and a plan with no state is named as having none) |
| D-51 | **OPEN** (Low–Med, optimistic for high-income plans) | IRMAA surcharges are not in the Monte Carlo's tax (it pays the Taxes tab's tax; IRMAA is a Medicare premium on its own tab) — $0 on the example, $21,880 lifetime at a $250,000 slider. Disclosed in the Field Manual and METHODOLOGY |
| D-52 | **CLOSED v6.24** *(wider than registered)* | My Data's editor kept years only, and every Save & Apply, draft and Export Backup re-dated the table: one unedited save of the example moved 31 of its 35 rows and made 2029 pay for both homes ($126,280 → $157,720), and a guided-setup table paid both living-expense rows in its retirement year. From v6.24 each row shows and keeps its months and every field it does not edit (the normalisations that remain are listed in METHODOLOGY); the *Before retirement* default ends in December of the year before the 1 January retirement (it overlapped the retirement year by twelve months). A plan saved earlier cannot be put back; the editor's footnote says to check its months. `t87`; `docs/SCOPE_D52_EXPENSE_MONTHS_V624.md` |
| D-53 | **CLOSED v6.22** | wider than registered: every plan that arrived without a master prompt (Start Fresh, both guided-setup routes, a backup without one, a stored plan without a prompt key) kept the one held — the example's at the landing screen, else the previous plan's — and the timeline, My Data, the Ranking tab and Ask AI read the example's dates of birth, plan-to ages, Florida and home from it; one Save & Apply stored them. From v6.22 the facts are fields on `DEFAULT_PORTFOLIO` (the example's figures unchanged: `t2`'s ten fingerprints byte-identical), a load without a prompt holds none and storage keeps what memory keeps, and the example's own text beside holdings that are not the example's is not taken (DC-8); My Data shows a placeholder blank, says so, and names example facts an older plan carries; a plan with no state says so. Siblings closed with it: the example's income as a fallback (3,300 / 1,300 / 400) and an expense table carried over by a backup without one. `t85`; `docs/SCOPE_D53_PROMPT_V622.md` |
| D-54 | **CLOSED v6.24 for new wizard plans** | the guided setup runs its post-retirement row to the plan's horizon (the later spouse's plan-to year) and splits its two rows at the 1 January retirement date (through v6.23: June/July of the retirement year). Plans the wizard built before v6.24 keep their 2079 end — disclosed with D-52's footnote line and in the Field Manual |
| D-55 | **CLOSED v6.26** *(wider than registered)* | Ask AI's ground rules reached only the unsaved example: every plan a user entered, and the example after one Save & Apply, sent none (measured in Chromium at v6.25). From v6.26 a fixed header (`AI_GROUND_RULES`) goes first in the system text on every route — educational only, no financial directives (*"the model's best cell"*), not an adviser, use the figures given — and is stored nowhere; the demo briefing is byte-identical and overridden by it. The live context stopped naming a *Section 2* most plans lack and stopped stating an LTC policy, the pension's survivor option as fact, and a spouse for a single household. Whether a model obeys it no test can show. `t89`; `docs/SCOPE_D55_AI_GROUND_RULES_V626.md`. Sibling filed, not fixed: the Grade tab's own *RECOMMENDED ACTIONS* (UsabilityFlaws **F-22**) |
| D-56 | **OPEN** (Low, either direction) | example-valued defaults that remain after D-53: the as-of date `2026-04-18` when a plan has none (`_asOfToYM`), Spouse B's claim age 63 when none is set, the 2029 retirement placeholder, and the Roth tab's *"Roth 401K 5-year rule: satisfied / Roth IRA 5-year clock: started (example)"* shown to every plan. Found at the v6.22 scope's review. *(v6.24: and My Data's expense editor fills a blank year with today's year, not the plan's as-of year — found at the D-52 scope. Its build review added two of the same kind: the guided setup with its retirement-year field cleared stores its post row from `"0-01"`, charged from now as v6.23's `"-07"` was; and My Data's *When* defaults read the saved plan's horizon, so a date of birth or plan-to age changed in the same session counts from the next save)* *(v6.27: and the Grade tab's three literal grades — LTC / Tail Risk C+, Tax Efficiency B+, Diversification B+ — and Guardrail Readiness, graded from rows labelled exactly "golf" and "Amazon": labelled in-app as fixed, not computed; computing them is open. F-22's scope DG-2 (a))* |
| D-57 | **OPEN — widened v6.29** (Low, conservative) | Backtest and What-Breaks credit no income stream (and, from the v6.29 census, no home-move cash either): their income is Social Security and the pension, so a plan's rental or job income never lowers their draws; What-Breaks pays those streams' tax (through the Roth tab's strategy engine). METHODOLOGY said streams reach What-Breaks until v6.23. Found at the v6.23 scope; filed, not fixed. From v6.28 it also noted the Income tab's gap-draw figure, which subtracted spouse B's benefit for the whole gap — **fixed at v6.29** (UsabilityFlaws F-25: B's check from B's claim month) |
| D-58 | **OPEN** (Low–Med, conservative) *(added at v6.24)* | an unedited My Data Save & Apply also rewrites spouse A's pre-tax contribution from the per-paycheck fields: a plan that holds only a monthly total (the example: $2,500 a month) stores $0, so its accumulation falls. Disclosed since v5.10 in METHODOLOGY's contribution-accrual section; found again at the D-52 scope, where it would have been measured as part of the save (`docs/SCOPE_D52_EXPENSE_MONTHS_V624.md` §0.2) |
| D-59 | **CLOSED v6.24** *(filed and closed at v6.24)* | the unsaved-edits dialog's **SAVE & APPLY, THEN LEAVE** saved nothing, from v5.9.2 to v6.23: it switched tabs and called the editor's save 40 ms later, after the editor had unmounted and unregistered it. Found at the v6.24 build when `t87` A-9 drove the button; confirmed in Chromium on the live v6.23 page. Fixed by saving in the handler, with the remembered tab set to the target first (`docs/SCOPE_D52_EXPENSE_MONTHS_V624.md` §8) |
| D-60 | **OPEN** (Med; either direction, by reading) *(added at v6.29)* | the tax engines mix dollar units: Engines A, B and C hold Social Security, the pension, income streams and (B) the deflated spending draws in today's dollars while brackets, deductions and the AMT figures grow 2%/yr and RMDs and gains arrive nominal. Read as each year's own dollars the Taxes tab's lifetime total runs **low** ($40,664 at the $70,000 slider on the example, $70,823 at $0); the Monte Carlo and What Breaks grow the schedule again, so they charge slightly **more** than a units-consistent tax (30-year success 0.6–0.8 points low). Measured at the F-25 scope; disclosed on the Taxes tab, the Roth tab's rules box, the Field Manual and METHODOLOGY (*The dollar basis — measured, both readings*) |
| D-61 | **OPEN** (Low, optimistic; plans with a QCD set) *(added at v6.29)* | QCD eligibility after a death: Engine C counts both spouses toward the QCD cap for the whole horizon of a married plan (`_qcdPersonsI`), and Engine B tests `Math.max(ageA, ageB) >= 71` in widowed years, so the deceased's age can qualify a younger survivor. Disclosed on the Taxes tab (v6.29) |
| D-62 | **OPEN** (Low) *(added at v6.29)* | STAY UNDER IRMAA fills to the first cliff on income before the year's tax-paying sale; the gain that sale realizes is added to MAGI afterwards, so the strategy can cross the cliff it targets (the ACA strategy allows for its own sale). Disclosed on the Roth tab (v6.29) |
| D-63 | **OPEN** (Low, display) *(added at v6.29)* | the Dashboard's crash card sets the Stress tab's 15-year, mortality-off sequence run beside its 30-year, mortality-on base run, so the gap is not the crash alone. Reworded at v6.29 (the card and the Field Manual) to say so; aligning the runs is a model change |

**Open, in this file: D-4, D-11 (narrowed), D-13, D-15, D-16, D-18 (recurring), D-32, D-37, D-39, D-44 (narrowed), D-48, D-49 (narrowed), D-51, D-56, D-57 (widened), D-58, D-60, D-61, D-62, D-63; D-5 declined.** *(D-60 to D-63 added, D-57 widened and its gap-draw note closed, at v6.29; D-55 closed at v6.26; D-52 closed, D-54 closed for new wizard plans, D-58 added, and D-59 filed and closed, at v6.24; D-49 narrowed to the example, its wording and D-10's residual (2) corrected, and D-57 added, at v6.23; D-53 closed (D-50's narrowing lifted), and D-55 and D-56 added, at v6.22; D-42, D-43, D-47 and D-50 closed (D-50 narrowed by D-53), and D-52 to D-54 added, at v6.21; D-40 and D-45 closed, D-44 narrowed, and D-49 to D-51 added, at v6.20; D-46 filed and closed, and D-47 and D-48 added, at v6.19; D-40 to D-43 filed from the v6.17 findings note, D-41 closed, and D-44 and D-45 added, at v6.18; D-38 filed and closed, and D-39 added, at v6.17; D-36 closed and D-37 added at v6.16; D-17 closed and D-36 added at v6.14; D-35 closed at v6.09; D-34 closed and D-35 added at v6.08; D-33 closed and D-34 added at v6.07; D-28 closed and D-33 added at v6.06.)* Non-tax open threads
re-homed the same day are in `ARCHITECTUREIssues.md` **E-29**.

*The write-ups of the items closed or fixed by v6.20 — D-1, D-2, D-3, D-6, D-12, D-14, D-17, D-19, D-20, D-21, D-22, D-23, D-24, D-25, D-26, D-27, D-28, D-29, D-30, D-31, D-33, D-34, D-35, D-36, D-38, D-41, D-45, D-46 — moved verbatim on 2026-10-19 to `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md` (repo only) to recover project-knowledge space (OPERATIONS §G). Each keeps its row in the index above; their residual-open lines were traced first (that file's §0); two threads with no other pooled record went to `ARCHITECTUREIssues.md` **E-30** (a), (b). Open, disclosed and recurring items (D-18) keep their write-ups here.*


| Field | Value |
|---|---|
| Build under audit | **v5.29** |
| Source md5 | **`4ef69e9a820fac18b99aa2aa46a8b2a1`** |
| Built `index.html` md5 | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Phase | 3 (Sections D + E) · governing doc `SCOPE_STANDING_AUDIT.md` §D |
| Date | 2026-08-12 |
| Status | **Re-pinned to v5.48 (2026-08-25) — read that block FIRST; it supersedes the v5.39 one.** ⚠ **D-6 has since CLOSED at v5.49 (2026-08-25)** — see its entry; the v5.48 block's HALF-CLOSED verdict is superseded for that item only, and every other item in that block still stands. Original v5.29 status: partial — D-1 verified to source, D-2 onward assessed. |

> ## RE-PINNED TO v5.73 — 2026-09-15 · STANDING AUDIT PHASE 3 (SECTION D) · READ THIS BLOCK FIRST
>
> Source `3bf1e15f1b28659aae9a78e3186d2ae8`, built `index.html` `345ccbceb58bf74f9fbdde5db0646d1d`, repo `a06f41c`.
> Twenty-five releases since the v5.48 re-pin. Written straight after Phase 2 (`FlawsToFix-v5_73-Phase2.md`), whose findings
> feed the new items below. **Findings only; no fix was made.**
>
> **Method and its limits.** Items D-1 to D-13 were re-checked **by content** where this session's work touched them; the
> rest are marked *not re-verified*. `L####` citations in the older blocks predate v5.73 and must not be used as addresses.
>
> ### Status of the existing items at v5.73
>
> | # | Status at v5.48 (or when opened) | **Status at v5.73** |
> |---|---|---|
> | D-1 | CLOSED | **CLOSED — confirmed.** Engine B applies the senior bonus per person exactly as Schedule 1-A Part V does (Phase 2, 12 border points); Engine A still omits it, as disclosed |
> | D-2 | CLOSED | **CLOSED — confirmed.** Engine B's `capGains_y` comes from Engine D's gain series. ⚠ Its bridge is the *only* bridge between the two engines — see **D-14** |
> | D-3 | holds (flat rates) | **HOLDS.** New evidence: Montana's DOR confirms two ordinary-income brackets; the model's one flat rate stands (a filed lead, `FlawsToFix-v5_69-Phase1.md` header). **D-3c (NJ, VA) is CLOSED** — both are income-conditioned since v5.67 / v5.68, and Maine, found to belong to the same class, since v5.73 |
> | D-4 | holds (itemized deductions) | **HOLDS** — METHODOLOGY L120 still states "itemized deductions are not modeled" |
> | D-5 | holds, decline | **HOLDS** — the QCD comment in `TAX_CONSTS` still says the one-time CRT/CGA election is not modeled |
> | D-6 | CLOSED at v5.49 | *not re-verified* |
> | D-7 | disclosure half closed at v5.50 | *not re-verified*; Phase 2 read the estate ranking's `HEIR_RATE` path (C-11) and found it as described |
> | D-8b | accurate | **ACCURATE** — the ACA floor and cliff comparators were read in Phase 2 and match Rev. Proc. 2025-25 at 100% and 400% |
> | D-11 | open (NM, RI, WI) | **NM and RI halves CLOSED** (populated at v5.66 / v5.69; Phase 2 executed NM's bands at the 42,000 edge). **WI half not re-verified** |
> | D-12 | open (account type) | **HOLDS** — `OTHER_TAX_TYPES` is still `taxable, trad, roth, hsa, annuity`; no plan-type field |
> | D-13 | open, unanswered | **HOLDS, unanswered** — no population fixture exists |
>
> ### New items at v5.73 (D-14 onward, below the existing entries)
>
> **D-14** Traditional spending withdrawals never reach the Taxes tab · **D-15** Maine's pension deduction has no
> age-65 test · **D-16** filing statuses beyond single and joint · **D-17** the Additional Medicare Tax ·
> **D-18** tax-year refresh of indexed state figures · **D-19** the seven half-rate Social Security states ·
> **D-20** Montana's base should reflect federal deductions (the senior bonus).
>
> ### Priority order at v5.73 — for a mainstream couple within sight of retirement
>
> 1. **D-14** — wrong tax in ordinary drawdown years on the shipped example household (the fix belongs with Phase 2's C-8). ✅ *Fixed at v5.74.*
> 2. **D-19** — the half-rate Social Security approximation was stale for Montana for two years; seven states remain.
> 3. **D-12** — account type (Rhode Island's $2,000–$4,000/yr), then **D-11**'s WI half.
> 4. **D-16** — head of household and the qualifying-surviving-spouse years (a widow(er) with a dependent).
> 5. **D-18**, **D-20**, **D-15** — small, bounded, each already disclosed or filed.
> 6. **D-3** (progressive state schedules), **D-4** (itemized), **D-17** (Additional Medicare) — disclosed or rarely
>    reached by retirees; **D-5** stays declined.
> 7. **D-13** is a research question, not a feature.

> ## RE-PINNED TO v5.48 — 2026-08-25 · THIS BLOCK SUPERSEDES THE v5.39 ONE BELOW
>
> Source `30ab12fba362b8ce538f66adea9a104b`, built `index.html` `8895b249af1313920c0c762a7a22776c`,
> committed tree `ba6d598`. Nine releases since the v5.39 re-pin. **No fix was made in this session
> — verification and inventory only.**
>
> **Method, stated so its limits are legible.** Every item was verified **by content**: all `L####`
> citations in this document are pinned to v5.29/v5.39 and most have moved, so none was trusted as
> an address. The Field Manual was read from the **raw `DOCS_HTML` string** (L3593, 146,679 chars)
> rather than a decoded copy — see the errata below. Two shipped functions were **executed**, not
> read: `stateTaxAnnual` and `acaApplicablePct`. The regression suite was **not re-run**; no source,
> test or harness file changed in this session.
>
> ### ⚠ ERRATA — 2026-08-25 (v5.49 session): a FOURTH instance, and a miscount of it
>
> **3. The v5.49 scope's Field Manual anchor did not exist in the source.** `SCOPE_D6_SSA44_USER_SIDE.md`
> §3 gave the quote-free anchor `IRMAA Cliff strategy`. That string is not in `DangerClose.jsx`. The
> heading is `<h3>IRMAA Cliff <span class="tag" style="…">strategy</span></h3>` — the two words are
> separated by ~80 characters of badge markup. The entry *renders* as "IRMAA Cliff strategy", so the
> anchor was read off the rendered manual. **The class again: a derived artifact mistaken for the
> primary source.** Caught before any edit, by resolving the anchor rather than trusting it. The
> working anchor is the entry's closing text, `push you over a cliff and cost ~$1,000+/yr per
> person.</p>`, unique at idx 69794.
>
> ⚠ **The near-miss was the dangerous part.** `cliff strategy` (lowercase) *does* match — inside the
> **ACA Premium Subsidy** entry. An anchor that silently lands in the wrong entry is how a disclosure
> gets appended to unrelated copy.
>
> **4. I then miscounted it, in two files that have shipped.** `docs/SCOPE_D6_SSA44_USER_SIDE.md`
> §7.1 and the header of `qa/t31_disclosure_parity.mjs` both call it *"the third instance"*, and the
> scope adds that this errata *"already records twice."* Both are wrong: entry 2 below already
> describes itself as the third, so the anchor error is the **fourth**. The miscount came from
> counting the errata entries visible in one screenful instead of reading what they say — which is,
> once more, **a derived artifact mistaken for the primary source**, this time applied to the tally
> of that very class. ⚠ **Both files need correcting; neither is urgent and neither changes a
> finding.** Recorded here first because this document is the register.
>
> ### ⚠ ERRATA — two errors of mine, recorded here rather than only in chat
>
> **1. The first state-note census used the wrong discriminator.** It did not treat a note reading
> *"flat"* as declaring the shape of the schedule, and so returned **33** silent states against
> `AUDIT_D3_STATE_TAX_DIRECTION.md`'s **30**. The audit's discriminator is the correct one. Re-run
> with it, the audit's census reproduces at v5.48 **exactly** — 51 / 9 / 9 / 33 / 3 / 30 / 4 / 26,
> every figure, MD still misfiled. The discrepancy was mine, not the document's.
>
> **2. The first Field Manual decode was lossy and produced false zeros.** Stripping tags with
> `<[^>]+>` let an unmatched `<` consume spans of text: `OBBBA`, `senior` and `standard deduction`
> all returned **0** hits from the decoded copy while the raw string held 2, 1 and 4. Caught on a
> sanity check against known manual text. **Every Field Manual result in this block was re-derived
> from the raw string.** This is the same shape as the error the 2026-08-19 errata below records —
> a derived artifact mistaken for the primary source — which is now the third instance in this
> document alone.
>
> ### The eight items at v5.48
>
> | # | Status at v5.39 | **Status at v5.48** |
> |---|---|---|
> | **D-1** | ✅ CLOSED | ✅ **CLOSED — confirmed by content** |
> | **D-2** | ✅ CLOSED at v5.36 | ✅ **CLOSED — confirmed. Its one live descendant S-1 is now closed too** |
> | **D-3** | SPLIT, both halves Low | **HOLDS as written — and a NEW sub-item, D-3c, runs the OTHER WAY** |
> | **D-4** | open, Low-Med | **HOLDS — but reclassify: not a measurable modelling gap** |
> | **D-5** | open, Decline | **HOLDS unchanged. Decline confirmed** |
> | **D-6** | partially disclosed | ✅ **CLOSED at v5.49 — both halves. `t31` enforces the class** |
> | **D-7** | unassessed — still owed | ✅ **ASSESSED 2026-08-25; DISCLOSURE HALF CLOSED at v5.50 (2026-08-26). Modelling half declined — see the box at D-7** |
> | **D-8b** | PARTIALLY ADDRESSED | **ACCURATE — confirmed by executing the function** |
>
> ### D-1 — CLOSED, confirmed
>
> `OBBBA_CONSTS` at **L931**; `seniorBonus` at **L5162–5166**, still inside `computeTaxPlan` only;
> the Verify-tab assertions at **L1273–1280** carry their citation to P.L. 119-21 §70103. Field
> Manual: *"The temporary OBBBA "senior bonus" deduction … is modeled on the Taxes tab, but not in
> the Roth conversion ladder"* — accurate, and it names the divergence. `METHODOLOGY.md` L120 states
> it is modelled, with the phase-out and the MAGI proxy. Nothing here has regressed.
>
> ### D-2 — CLOSED, and its descendant is closed too
>
> Engine D `_saleFromGain` at **L4779**; Engine B `capGains_y` at **L5140**, computed from
> `_gainByYr`, not `0`. **The live descendant recorded in the v5.39 box — the IRMAA tab's MAGI
> sentence not naming `capGain_y` — is now CLOSED.** At **L9973** it reads *"…plus every other
> taxable component the plan generates, including dividends and realized capital gains."* Tracked
> as **S-1** in `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`; **that finding should be marked closed
> there, and in `AUDIT_TOP_FIVE_SUMMARY.md`, which still ranks S-1 as part of its #1.**
>
> ### D-3 — holds, and a new sub-item that runs the other way
>
> **The 2026-08-20 correction survives contact.** The census reproduces exactly (above). The
> per-state disclosure has **moved L11889 → L12062** and is otherwise unchanged, rendering for every
> jurisdiction. `stateTaxAnnual` is still at **L1091** — one of the few citations in this document
> that did not move — and still models **no state standard deduction**. The setup wizard's state
> picker (now **L3392**) still shows no note at all. Both halves stay **Low**.
>
> **⚠ NEW — D-3c · income-limited exclusions are applied unconditionally, and this under-taxes.**
> ⚠ **Membership closed 2026-09-02 (ROUND4 §6 D-A): the optimistic income-limited class is NJ + VA, and
> nothing else.** New Mexico, Rhode Island and Wisconsin are **not** D-3c members — their error changes
> SIGN across a statutory gate rather than running one way. They are **D-11**, below. Maine is out
> (ROUND3 §2d). The New Jersey measurements in this box are unaffected.
>
> `stateTaxAnnual` computes `const excl = (r.excl65 || 0) * Math.max(0, persons65)` (**L1100**) —
> a flat multiplication with **no income test anywhere in the engine**. Executed against shipped
> v5.48, a New Jersey couple both 65+ pays **$0** modelled state tax at $80,000, $120,000 **and
> $150,000** of retirement income.
>
> New Jersey's actual rule (NJ Division of Taxation, *Retirement Income Exclusions*, njit7.shtml;
> P.L. 2021 c.129): the maximum exclusion is **$100,000 MFJ** — the app uses `excl65: 75000` per
> person, which is the **single-filer** figure applied twice — available only when total income is
> $100,000 or less, phasing to 50% at $100,001–125,000, 25% at $125,001–150,000, and to **zero above
> $150,000, as a hard cliff**. The model is therefore too generous twice over, and both errors run
> the same way: **it under-taxes**. That is the **optimistic** direction — the one this project's
> design defaults name as the wrong way to be wrong, and the opposite of D-3's headline verdict.
>
> D-3's "conservative" finding was measured on **New York**, which has no such exclusion, so this is
> not a contradiction of it — it is a different mechanism the New York measurement could not see.
> Six other states carry the same shape by their own notes: **VA, RI, NM, WI, ME** (income-limited or
> "approximated as unconditional") and **MD** (whose exclusion in law does not cover traditional IRA
> withdrawals at all, but does in the model).
>
> **Not measured:** the dollar delta. That needs the sourced NJ rate schedule — the same "New York
> treatment" this entry already says every state needs before a recalibration ships. The exclusion
> *structure* above is verified against the primary source; the resulting tax is not.
>
> ### D-4 — holds, but it is not a measurable modelling gap
>
> `METHODOLOGY.md` L120 still discloses it, in the same sentence as the OBBBA text. **The Field
> Manual does not: `itemiz` returns ZERO hits in the raw `DOCS_HTML`.** The glossary defines
> *"Standard Deduction"* but never says itemizing is unmodelled. So the disclosure is creator-side
> only — the D-6 shape.
>
> **But the app has no mortgage-interest, SALT or charitable-deduction inputs**, so no household a
> user can build in this app can express itemizing either way. Per the pattern recorded in the
> manifest on 2026-08-23, that makes the claim **unfalsifiable within the app's own frame**: it is a
> scope boundary, not a gap that could be measured and closed. Direction remains conservative (the
> model can only ever overstate tax here). **Rank it as a boundary note, not as an open modelling
> item.**
>
> ### D-5 — unchanged, decline confirmed
>
> Disclosure intact at **L850**, inside `TAX_CONSTS`: *"One-time CRT/CGA election not modeled."*
> The recurring QCD is still modelled. Nothing has changed and nothing should.
>
> ### D-6 — ✅ **CLOSED AT v5.49 (2026-08-25), BOTH HALVES.** The box below is the v5.48 finding, kept for the record
>
> **What shipped.** The Field Manual's IRMAA Cliff entry and the IRMAA tab both now name **SSA-44**
> and **work stoppage**, state that the eight life-changing events are a **closed** list, and say
> plainly that a Roth conversion is not among them. Both state the model **charges every surcharge
> in full** — it never prices in a successful appeal, so those early years err high, which is the
> conservative direction and the reason the omission was tolerable while it lasted.
>
> **`METHODOLOGY.md` was corrected too, and the box below is wrong about it.** It says the
> creator-side half was *"fixed, and fixed well."* It was not. It named five of the eight events and
> said the list *"includes"* them — never that it is **closed**. On a tab driven by the Roth slider
> that reads as an invitation to infer a conversion-driven spike might qualify. It cannot
> (`ssa.gov/forms/ssa-44.pdf`; 20 CFR 418.1205). **Neither half was actually complete**, and the
> incomplete half was the one this document called exemplary — because it was checked for the two
> keys it had been asked about rather than against the form.
>
> **`t31` now enforces the class.** If `METHODOLOGY.md` names a limitation, the render tree or the
> raw Field Manual must name it too. **No suite had ever read `METHODOLOGY.md`** — every mention of
> that filename across t1–t30 is a code comment — which is exactly why D-6 could be recorded CLOSED
> once already on the strength of the creator-side half alone. Before it was allowed to pass, the
> version bump was built **without** the clause and `t31` run against it: **8 passed, 6 failed**.
>
> ⚠ **What `t31` does NOT do.** It asserts a named string appears on both surfaces. It says nothing
> about whether the two agree, whether the wording is accurate, or whether it is comprehensible. A
> key can pass against a misleading sentence. Parity of vocabulary is a floor, not a ceiling.
>
> ---
>
> #### The v5.48 finding, as recorded (superseded)
>
> **`METHODOLOGY.md` is fixed, and fixed well.** L840–845 now names the form and the trigger:
> *"Social Security's life-changing-event redetermination (form SSA-44) … is not modeled. The
> enumerated events include **work stoppage or reduction, the trigger that applies to most newly
> retired households**, as well as death of a spouse, marriage, divorce and loss of a pension. A
> household that files one may pay less than the model projects, so the omission is conservative."*
> That is broader than this entry asked for, and it states the direction.
>
> **Nothing reached the user.** At v5.48, `SSA-44`, `SSA 44`, `life-changing`, `life changing`,
> `work stoppage`, `appeal`, `redetermination` and `reassess` return **zero hits in the render tree
> and zero in the raw `DOCS_HTML`** — the same result the v5.39 check recorded, re-run against raw
> after the decode error above. The disclosure is still in **exactly one place**, and that place is
> the one users do not read.
>
> This entry sets its own exposure as **user-side** and its severity as *"low as modelling; medium
> as disclosure."* On that test **nothing has moved**, and the closure should not be recorded as one.
> **Reclassify as: creator-side CLOSED, user-side OPEN.** The remedy is unchanged and still a
> clause, not a feature — the Field Manual's IRMAA section and the IRMAA tab's own note, naming work
> stoppage and pointing at SSA-44.
>
> ### D-7 — assessed, 13 days after it was owed
>
> **What exists.** The comparator's estate figure, **L4251**:
> `estate: Math.round(taxBal + rothA + rothB + (tradA + tradB) * (1 - HEIR_RATE))`, with
> `HEIR_RATE = 0.22` (**L3689**) — a flat assumed heir **income** tax on inherited Traditional. There
> is **no estate tax of any kind in it**, federal or state. This is not a peripheral number: it is
> the Roth strategy comparator's **default ranking objective** (**L5386**, `useState("estate")`;
> **L9518**, *"MAX AFTER-TAX ESTATE (leave the most behind)"*), so it drives which strategy the tab
> presents as the model's best cell.
>
> **What is disclosed.** Exactly one sentence, at **L10788**: *"If estate tax is a concern, note this
> tool does not model federal or state estate tax — consult an estate attorney."* It sits inside
> `if (_tlS.single)` on the Survivor tab — the single-household reframe. **A couple never sees it.**
> `estate tax`, `estate-tax` and `inheritance` return **zero hits in the raw `DOCS_HTML`**, and
> `METHODOLOGY.md` mentions neither. So: disclosed for single households in one tab, **undisclosed
> for the mainstream case**.
>
> **Direction: optimistic.** Omitting the tax overstates what passes to heirs, and it overstates it
> inside the figure the tab ranks by.
>
> **Boundary test: it passes, and this is what the v5.29 row could not settle.** Oregon's threshold
> is **$1,000,000**, not indexed and **not portable between spouses**, so a couple faces one
> exemption at second death — which is exactly when this app's estate figure is struck.
> Massachusetts is **$2,000,000**, Rhode Island roughly **$1.84M**; twelve states plus DC levy an
> estate tax and five more (KY, MD, NE, NJ, PA) levy an inheritance tax. The app's audience is
> households with seven-figure portfolios, and the modelled estate is **portfolio only** — no home —
> so a real estate crossing these thresholds is larger than the figure the app reports. It makes an
> existing output more correct rather than adding a new one.
>
> **⚠ Sourcing caveat.** The thresholds above come from secondary compilations, which **disagree
> with each other on the federal exemption** ($13.61M / $13.99M / $15M all appear). The federal
> figure is out of frame here — this entry's own table already declines federal estate tax as not
> mainstream — but the disagreement is a warning about the sources. **OR, MA and RI need primary
> confirmation from their revenue departments before any scope commits to a number.**
>
> **Severity: medium**, on direction and on the fact that it sits under a ranked recommendation.
> **Exposure: user-side.** Cheapest honest fix is to lift the L10788 sentence out of the `single`
> branch so every household sees it, and say it where the estate ranking is presented.
>
> ### D-8b — accurate, confirmed by execution
>
> `acaApplicablePct` (**L1215–1233**) tests `fplRatio < ACA_CONSTS.floorMult` **before** the regime
> branch, so D-8a's fix holds. Executed: at 0.900, 0.980 and 0.999 the function returns `null` in
> **both** regimes; at 1.000 it returns **0.021** under `current` and **0** under `enhanced`. The
> disclosure machinery is present as described — *"Sub-floor years — the ACA column is blank here,
> not zero"*, *"and means "not modelled""*, `acaFloorYrs` at **L3777**.
>
> The discontinuity is therefore **starker than this entry states**: under the enhanced scenario the
> applicable percentage goes `null` → **0**, i.e. from no subsidy modelled to the **entire** benchmark
> premium, on one dollar of MAGI. **Nothing here changes the product decision** — closing it still
> means paying a subsidy where the model pays none, and the toggle remains considered and declined.
>
> **Carried forward, not re-measured:** the *6 of 24 modelled bridge years below the floor* figure.
> It came from six reconstructed households in the v5.32 work and was not reproduced this session.
>
> ### A coverage finding that outranks several items above
>
> `stateTaxAnnual` **is** unit-tested — `t10` drives six archetypes hand-verified to the dollar
> (FL no-tax, AZ flat, MS `retExempt`, AL `excl65`, MT partial-SS, and the fallback path), plus a
> non-vacuous control. But every archetype is a **structural branch**, and AL's $6,000 exclusion is
> not income-limited, so **D-3c above has no assertion anywhere in the suite.**
>
> At household level it is starker. Across every fixture in the suite, `stateCode` is **`null`** —
> the legacy flat-rate fallback, which never touches `STATE_RULES` — with a single exception,
> `t3_roth.mjs`, which uses **`GA`**. **No full projection in this suite exercises the state module
> for 50 of its 51 jurisdictions**, and the one that does uses a flat-rate state with a large
> unconditional exclusion: the least discriminating choice available for detecting either the
> progressive-schedule approximation or D-3c.
>
> This is the manifest's 2026-08-23 pattern — *a fixture that cannot reach a behaviour makes every
> assertion about it vacuous* — at module scale rather than fixture scale. It is not itself a
> Section D finding; it is the reason several Section D findings cannot be measured without new
> fixtures, and any D-3 or D-7 scope should budget for that before it budgets for a fix.


> ## RE-PINNED TO v5.39 — 2026-08-18
>
> **This document is the Section D *findings inventory*. It is NOT the Section D sweep.** The
> systematic undisclosed-gap sweep was run separately against v5.31 (`AUDIT_PHASE3_SECTION_D_SWEEP.md`)
> and re-run over the v5.31 → v5.39 delta (`AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`). This document's
> "Partial" status above has been read as "Section D was never swept" by several sessions; that
> reading is wrong and cost most of a session on 2026-08-18.
>
> **See §0.1 for the re-pin record** — what changed, what held, and what is newly wrong.

## §0.1 · Re-pin record — v5.29 → v5.39, 2026-08-18

> ### ⚠ ERRATA — line citations corrected 2026-08-19
>
> **Every `L####` citation into `src/DangerClose.jsx` in this document was originally one line low.**
> The working copy used for the analysis had the single-line `DOCS_HTML` literal (L3593) deleted so
> that greps would not dump the Field Manual — a documented technique — but the resulting line
> numbers were then quoted as though they came from the unmodified file. Everything at or below
> L3593 was unaffected; everything above it was short by exactly one.
>
> **All citations here are now corrected and each was re-resolved against the shipped source**
> (`7070018f2699503dfac4ca8e0e1b2feb`) by confirming the cited line contains the code it claims.
> **No finding, figure, or conclusion changes** — the anchors were always the right code, described
> correctly; only the addresses were wrong.
>
> The error is recorded here rather than only in chat, per the project's rule on owning errors in
> the deliverables. It is the same shape as the failures this audit already documents: a derived
> artifact mistaken for the primary source. It was caught by re-deriving the anchors from the
> original file rather than by re-reading the analysis.


Every item below was re-checked against **v5.39** (source `7070018f2699503dfac4ca8e0e1b2feb`,
committed tree `755a4c7`) by locating the engine expression that implements it. Six modelling releases
shipped in the window: v5.32, v5.34, v5.35, v5.36, v5.37, v5.38.

| Item | Status at re-pin |
|---|---|
| **D-1** | ✅ **CLOSED.** Both false disclosures corrected. See the box at D-1 (archived 2026-10-19: `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`) |
| **D-2** | ✅ **CLOSED at v5.36.** See the box at D-2 (archived 2026-10-19: `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`) |
| **D-3** | ⚠ **DIRECTION CORRECTED and finding SPLIT (2026-08-19); disclosure half CORRECTED DOWN to Low (2026-08-20)** — see the box at D-3 (archived 2026-10-19: `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`) |
| **D-4** | unchanged — `METHODOLOGY.md` L120 still discloses it |
| **D-5** | unchanged — disclosure still at `TAX_CONSTS.QCD_LIMIT` (now L850) |
| **D-6** | ⚠ **CORRECTED — the v5.31 sweep's resolution was too broad.** See the box at D-6 (archived 2026-10-19: `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`) |
| **D-7** | ✅ **DISCLOSURE HALF CLOSED at v5.50.** Both user surfaces and `METHODOLOGY.md` now state that no estate or inheritance tax is applied and that the direction is optimistic; the objective is relabelled `MAX ESTATE AFTER HEIR INCOME TAX`. `t1` and `t4` pin it, `t31` carries the key. **The tax itself is still not modelled and that is deliberate** — see the box at D-7 |
| **D-8** | accurate as built, but its closing *"Consequence for D-2"* paragraph is **stale** — flagged in place |

**Two of eight items closed; one newly qualified; one paragraph stale.** The pattern is worth naming:
**both closures happened silently.** D-1 was fixed by some release that corrected the disclosures, and
D-2 by v5.36, and in neither case was this document touched — which is why it sat for four releases
presenting a closed item as the top-ranked open gap.

**What this re-pin did NOT do.** Claims were compared to **engine expressions at named lines**, not
measured by driving the engines. That is stronger than reading code and judging it plausible, and
weaker than the arithmetic standard Section C holds to. No figure below was recomputed. The **priority
rankings were not re-derived** — with D-1 and D-2 both closed, the ranking below is a v5.29 ordering
with its top two struck out, not a fresh one.

Each item is priced against the product boundary test in the project instructions: **does the
situation occur for a mainstream couple within sight of retirement, and does the feature make an
existing output *more correct* rather than adding a new output outside the drawdown frame?**

Per standing methodology requirement 5, each item says whether it is a **disclosed limitation** or an
**undisclosed gap**. Only the undisclosed ones are defects; the disclosed ones are candidate features.

---

## 0. Coverage statement — read this before using the priority order

**Verified to source this session:** D-1 only. Its every claim was checked against v5.29 by AST
census and by reading the engine.

**Assessed but not independently verified:** D-2 through D-7. These were derived from
`METHODOLOGY.md` §5/§12, Field Manual §13, and the Phase 2 roll-up, then reasoned against the
boundary test. Their *existence* as disclosed limitations is documented; their *direction of error*
and *size* are argued, not measured.

**Not reached:** a systematic sweep for undisclosed gaps. D-6 is the only candidate undisclosed item
I surfaced, and it carries an explicit caveat because manifest item 7 records this project stating
"undisclosed" wrongly after checking two places — *"'Undisclosed' requires looking everywhere."* I did
not look everywhere.

**Consequence for the ranking.** D-1 is confidently first. The order below it is a considered
argument, not a measured one, and a later session should expect to reorder it.

---

## D-4 · Itemized deductions are not modelled

> ⚠ **v5.48: reclassified.** Disclosed in `METHODOLOGY.md` only — **zero** mentions in the Field
> Manual — but the app has no inputs that could express itemizing, so the claim is unfalsifiable
> within its own frame. A boundary note, not an open modelling item. See the v5.48 block.

**Priority: 4.** *Disclosed limitation* — `METHODOLOGY.md` L120: *"itemized deductions are not
modeled (standard deduction assumed)."*

**Assessment.** Post-TCJA and post-OBBBA the standard deduction dominates for most retirees, so the
assumption is right for the majority. It is wrong for two identifiable groups within the app's
audience: large charitable givers (though the QCD modeller partly covers this) and households in
high-property-tax states, where OBBBA's raised SALT cap changes the arithmetic materially versus the
2018–2024 regime.

Direction is **conservative** (assuming the standard deduction when itemizing would be larger
overstates tax), which is the correct direction for this tool.

**Boundary test.** Occurs — for a meaningful minority, not the mainstream case. More correct — yes,
but only for that minority, and it requires new inputs (mortgage interest, SALT, charitable).

**Severity:** low-medium. **Exposure:** user-side.

---

## D-5 · The QCD one-time CRT/CGA election is not modelled

**Priority: 5.** *Disclosed limitation* — stated at `TAX_CONSTS.QCD_LIMIT` (L795–797), in Field
Manual §13, and in the glossary.

**Assessment: decline, or defer indefinitely.** The SECURE 2.0 one-time election to fund a charitable
remainder trust or charitable gift annuity from an IRA is a once-per-lifetime, low-cap provision used
by a small number of high-net-worth, philanthropically-structured households. Modelling it means
modelling CRT/CGA payout streams, which is a **new output outside the drawdown frame** — the boundary
test's decline condition.

The recurring QCD *is* modelled (per-person indexed cap, excluded from income and MAGI, satisfies
RMD), which is the part that matters for mainstream charitable givers.

**Severity:** very low. **Exposure:** user-side, negligible.

---

## D-7 · Assessed and deliberately excluded

> ### ✅ DISCLOSURE HALF CLOSED AT v5.50 — 2026-08-26
>
> **What shipped.** The comparator's estate figure deducts only `HEIR_RATE` (0.22), an assumed heir
> **income** tax on inherited Traditional balances — no estate or inheritance tax, federal or state,
> ever entered it. It was labelled `MAX AFTER-TAX ESTATE` and it is the **default ranking objective**.
> v5.50 narrowed the label to `MAX ESTATE AFTER HEIR INCOME TAX`, narrowed every site that carried the
> old phrase, and added the limitation to the comparator note, the Field Manual (beside the objective
> list and in its §13 register) and `METHODOLOGY.md` §12. `t1` and `t4` pin it — `t4` on a **couple**,
> because the only pre-existing estate text was gated to single households — and `t31` carries a third
> key. No state, threshold or dollar figure is quoted, deliberately.
>
> **What did NOT change, and must not be read as closed:** the tax is still **not modelled**, so the
> estate figure remains wrong for an affected household — it is now *disclosed* as wrong.
> `HEIR_RATE` (0.22) is unchanged, and the default objective is still `estate`. Both are separate
> questions. ☑ **Updated 2026-08-26:** `HEIR_RATE` has since been assessed and disclosed — see the
> **D-9** row and `ASSESSMENT_HEIR_RATE.md`. Its value is still 0.22, by decision. The default
> objective remains genuinely unassessed.
>
> ⚠ **The rows below were written before this shipped.** The "State estate / inheritance tax" row
> quotes `after-tax estate` — a label v5.50 deleted. It is annotated in place rather than rewritten,
> so the original reasoning stays legible.


> ✅ **The one row left unassessed here — state estate / inheritance tax — WAS ASSESSED on
> 2026-08-25. See the v5.48 re-pin block at the top.** Verdict: a real gap, direction **optimistic**,
> undisclosed for couples, sitting inside the Roth comparator's **default ranking objective**.
> The other rows in the table below are unchanged.

| Candidate | Why excluded |
|---|---|
| **Joint-mortality correlation** in the Monte Carlo | Named in the Phase 3 brief as a §13 disclosure and it is one — but it is a **mortality** modelling gap, not a taxation one, so it is out of Section D's scope. It belongs in a mortality scope. Disclosed in §13 and §06. |
| **Inherited-IRA 10-year rule / beneficiary treatment** | New output outside the drawdown frame — it models the heirs' tax position, not the household's drawdown. Boundary test: decline. |
| **Federal estate tax** | OBBBA exemption is far above this app's audience. Not mainstream. |
| **State estate / inheritance tax** | ⚠ **This row is superseded — assessed 2026-08-25, disclosed at v5.50.** Thresholds in some states are low enough to reach the app's audience, and the solve-for grid ranks by that estate figure by default — so it was never out of frame. **The label it quoted no longer exists**: v5.50 renamed it `MAX ESTATE AFTER HEIR INCOME TAX` precisely because "after-tax estate" asserted a deduction the model never made. Modelling the tax remains declined (18 jurisdictions, own thresholds, portability and rate ladders); the disclosure is the fix. **Left unassessed; a later session should price it properly.** |
| **HSA post-65 non-medical withdrawals** | Related to the disclosed "HSA modelled as tax-free throughout" simplification, already recorded as one of the five v5.26 `otherAccounts` simplifications in §13 and METHODOLOGY. Not a new finding. |
| **AMT beyond the simplified screen** | Disclosed (§13: "the AMT check is simplified — standard-deduction add-back only"). `t18` records AMT as not yet compared between Engines A and B. Genuinely a gap, but the population it binds on is very small post-OBBBA. |

---

## Summary — priority order

| # | Item | Disclosed? | Direction of error | Boundary test | Severity |
|---|---|---|---|---|---|
> **⚠ This table is the v5.29 ordering. It is superseded by the v5.39 column below** and is kept
> only so the original ranking is legible. Do not cite it on its own.

| **D-1** | OBBBA bonus: modelled in Engine B, absent from Engine A, declared absent by Field Manual §13 and METHODOLOGY §5 (§7 is correct) | **Disclosure is FALSE** | Claims conservative; is not | **Build** | **High** |
| **D-2** | No realized gains from ordinary drawdown | Disclosed | **Optimistic** | **Build** | Med-High |
| **D-3** | Progressive state schedules → effective flat rate | Disclosed | **Not uniform** | Build, staged | Medium |
| **D-4** | Itemized deductions not modelled | Disclosed | Conservative | Minority case | Low-Med |
| **D-5** | QCD one-time CRT/CGA election | Disclosed | Conservative | **Decline** | Very low |
| **D-6** | IRMAA SSA-44 life-changing-event relief | **Verify first** | Conservative | Build (disclosure) | Low-Med |
| **D-8** | ACA subsidy below 100% FPL: \$0 that reads as computed, and no floor at all in the enhanced regime | Was disclosed in two places only | **Both** — see entry | **Built (v5.32)** | **ADDRESSED / PARTIALLY** |

### Summary at v5.39 — re-pinned 2026-08-18

| # | Item | Status | Direction | Boundary test | Severity |
|---|---|---|---|---|---|
| ~~D-1~~ | OBBBA bonus disclosure | ✅ **CLOSED** — both disclosures fixed, constants Verify-checked | — | — | — |
| ~~D-2~~ | Realized gains from ordinary drawdown | ✅ **CLOSED at v5.36** — engine + both tax engines + render | — | — | — |
| **D-3** | State schedules → flat rate | **SPLIT 2026-08-19; disclosure half CORRECTED DOWN 2026-08-20** — approximation is disclosed, only per-state note detail is uneven | **CONSERVATIVE** (direction corrected) | Note tidy: ride along, no release of its own. Precision: declined/held | Both halves **Low** — **no live high-priority half** |
| **D-4** | Itemized deductions not modelled | open, unchanged | Conservative | Minority case | Low-Med |
| **D-6** | IRMAA SSA-44 relief | ✅ **CLOSED at v5.49** — both surfaces name SSA-44 and work stoppage; the closed eight-event list is stated; `METHODOLOGY.md` corrected in the same release | Conservative | **Done** | — |
| **D-5** | QCD one-time CRT/CGA election | open, unchanged | Conservative | **Decline** | Very low |
| **D-7** | State estate / inheritance tax | ✅ **DISCLOSED at v5.50** — both user surfaces + `METHODOLOGY.md`; objective relabelled; modelling declined | **OPTIMISTIC** (now stated in-app) | Disclosure built, modelling declined | was Med-High |
| **D-10** | Two MAGI figures render under one IRMAA label with no cue they are computed differently | ◑ **DISCLOSURE HALF SHIPPED at v5.52 (2026-08-27). MODELLING HALF SHIPPED IN PART at v5.53 (2026-08-28) — DIVIDENDS LANDED; REALIZED CAPITAL GAINS DID NOT, BY RESOLVED DECISION.** ⚠ **CORRECTED 2026-09-07 (Item A of `SCOPE_HOUSEKEEPING_THREE.md`). This row was stale for twelve releases and wrong in FOUR ways** — it said the modelling half was untouched, said *"dividends and realized capital gains remain absent"* when `_divLadder` had shipped, described the ladder as **five** terms when it is six, and pointed at `SCOPE_FIX_roth_tab_div_capgain.md` as the live route when that document is **SUPERSEDED and was never built**. **Where it stands, re-resolved BY AST against v5.65 `7604fac5dab891bb31905544d11072f8`, not by line number — the lines below have all moved at least once:** Engine C builds MAGI from **seven** terms (`ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y`); the Roth ladder builds it from **six** (`pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder`). **What is genuinely still open, and no more than this:** (1) **`capGain_y` is absent — and its absence is a RESOLVED DECISION, not an oversight.** `SCOPE_D10_MODELLING_v5_53.md` **D-2 (c)**: gains measured at **$342 across the entire ladder** on the example household and **$0** on both constructed ones, against real plumbing to hoist a series out of a closure. ⚠ **Do not re-open it; a register that re-litigates a settled call is the failure this row's own warning is about.** (2) ~~**the earned-income term is narrower** — `spouseBWork` against Engine C's `work_y`, out of scope by the same release.~~ ⚠ **CORRECTED at v6.23: (2) was false when checked at v6.22.** The ladder's `spouseBWork` is the built-in taper plus every ordinary stream — the same sum as Engine C's `work_y`; they differ only in the year the taper is keyed to (the plan's own retirement year on the ladder, the selected one in Engine C), and at the plan's own retirement year they are identical (`docs/SCOPE_D49_WORK_TAPER_V623.md` §0.3). (1) can only ADD to MAGI, so the residual error runs one way. **The live route is `SCOPE_D10_MODELLING_v5_53.md` (RETIRED, shipped); `SCOPE_FIX_roth_tab_div_capgain.md` is SUPERSEDED — do not build from it.** ⚠ Its status line overstates: it reads *"BUILT AND SHIPPED"* while its title names both terms, and it is annotated in place to say so. **The product call is MADE and must not be re-litigated** — `SCOPE_D10_MAGI_DIVERGENCE_DISCLOSURE.md` (RETIRED) resolved it: disclose now, qualitative in-app, both surfaces. The ladder footnote and Field Manual §13 name the omitted terms and the direction; `METHODOLOGY.md` carries both expressions term by term; `t1` pins BOTH, which nothing did before; and the `IRMAA?` column carries a permanent *† an indication, not a verdict* qualifier. **What remains user-visible: the verdict can still be WRONG for a taxable-heavy household** — disclosed, not fixed. ⚠ `MEASUREMENT_roth_tab_magi_v5_40.md` recorded IRMAA **verdict inversions** in constructed households, so this is not cosmetic. Re-homed 2026-08-26 from the deleted `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md`, where it was that scope's **D4** — *not* this register's D-4 | **Optimistic** — omitting income terms understates MAGI, understates the IRMAA trigger, and flatters the plan | Disclosure is a `src/` change and a version bump; needs its own scope | **Low** — the product call is made and the remaining term is a resolved decision; no open question ranks here |
| **D-9** | Heir income-tax rate on inherited Traditional is an unjustified constant | ✅ **DISCLOSED at v5.51** — both user surfaces + `METHODOLOGY.md`; promoted to a module-level assumption beside `BASE_GROWTH` (deliberately NOT `TAX_CONSTS`); value **unchanged at 0.22 by decision**; pinned by `t1` and by a to-the-dollar arithmetic invariant in `t2` | **OPTIMISTIC** on the estate level (compounds with D-7 in the same figure), conservative on the ranking | Disclosure built; user-settable rate is the real fix, scoped separately | Medium |
| **D-8** | ACA sub-floor \$0 | **PARTIALLY ADDRESSED (v5.32)** — declined toggle not built | **Both** | Built | see entry |
| **D-11** | Three states' 65+ figures are right on one side of a statutory gate the data model cannot hold and wrong on the other (NM, RI, WI) | ◐ **RI's AGI cliff MODELLED at v5.69** (exclusive, TY2025 pair; its IRA exclusion moves to **D-12**) · **RI and WI amounts CORRECTED at v5.59** (20,000 → 50,000; 5,000 → 24,000) and their **67 age floors MODELLED at v5.60** (`exclAge: 67`, per person) — **WI is now exact on this provision**; **NM's income-conditioned exemption was MODELLED at v5.66** (NMSA 1978 § 7-2-5.2, nine bands, per person, conservative direction), leaving RI's AGI cliff and IRA exclusion as the only unmodelled gate | **MIXED for RI only** — NM and WI no longer flip; RI's sign still flips at its remaining gates (stated in its note) | Disclose now; RI's remaining gates need a data-model field | Medium |
| **D-12** | Account type — IRA versus employer plan — and per-person retirement income (Rhode Island's modification excludes every IRA and caps each person at their own income) | **Open — disclosed at v5.69** in RI's note, METHODOLOGY and the Field Manual | **Optimistic** for RI households with IRA money or one spouse holding the pension | **Build** — makes an existing output more correct for a mainstream couple (401(k)-to-IRA rollovers are common) | Med |

**D-3 was ranked top here on 2026-08-18 and that ranking is superseded** (direction corrected 2026-08-19 — see the box at D-3, archived in `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`). Its *disclosure* half stays a live Medium; its *precision* half is held and de-prioritised. What follows is the 2026-08-18 reasoning, kept for the record: **with D-1 and D-2 closed, D-3 is the top-ranked open item** — and it is the one simplification here
that is **not reliably conservative**, so it can flatter a plan. That makes it the natural successor
to D-2 for a tool whose identity is deliberate pessimism.

**No fixes were made in the session that produced this document, nor in the 2026-08-18 re-pin.**

---

## D-8 · The ACA floor — the \$0 below 100% FPL, and the enhanced regime that had no floor

**Raised** by the realized-capital-gains scope §7, promoted ahead of it by decision 2026-08-13,
and **built at v5.32**. Two defects sat behind one symptom, and the release closes them unequally.

### D-8a · Enhanced regime applied no floor — **ADDRESSED at v5.32**

`acaApplicablePct` tested the 100%-of-FPL eligibility floor inside its current-law branch only.
The `enhanced` branch returned before reaching it and its table begins `[0, 1.5, 0, 0]`, so any
ratio below 150% FPL yielded an applicable percentage of 0 — the **entire** benchmark premium
paid as subsidy. Measured across the range it held at every ratio down to 0.000. ARPA and the IRA
suspended the 400% cliff; neither touched the §36B(c)(1)(A) floor, so this was wrong on the law
and made the law-scenario toggle do something it does not claim to do (a \$19,200 swing on the
measured case). Fixed: the floor is tested before the regime branch and binds in both. Current-law
behaviour is bit-identical. Pinned by `t22` groups A, B and D, with a negative control.

### D-8b · The sub-floor \$0 reads as a computed result — **PARTIALLY ADDRESSED at v5.32**

Below the floor the app prints \$0 because Medicaid is what governs there and this app does not
model Medicaid. Above the 400% cliff it prints \$0 because that is the statute. The two are
indistinguishable on screen, and the second one inverts comparisons: anything that lifts MAGI back
over the floor appears to buy a whole benchmark premium.

**What v5.32 did:** the engine records which bridge years fall below the floor and at what depth;
the strategy table names them with their FPL percentage, states the subsidy column excludes them,
and warns about the inverted comparison; the ACA panel, the My Data field, the Field Manual and
`METHODOLOGY.md` all say the same thing, moved together.

**What v5.32 did NOT do:** sub-floor years still show \$0, and one dollar of MAGI across the line
still moves the modelled subsidy by nearly a full benchmark premium. The artifact is visible and
excludable; it is not gone. Measured across six reconstructed bridge households, **6 of 24
modelled bridge years fall below the floor**, two of them below 51% of FPL — so this is a routine
sight, not an exception, which is why the flag carries depth rather than only existence.

**Why it stopped there.** Closing the discontinuity means paying out a subsidy where the model
currently pays none — making plans look *better*, deliberately, against this app's conservative
default. In a non-expansion state the true answer below the floor really may be \$0. The option
considered and **declined** was a user-owned toggle ("below 100% FPL assume: no subsidy modelled
(default) / Medicaid-equivalent coverage"), which would keep the default conservative while making
the alternative available. It remains available as its own release if wanted; it needs persisted
state and a migration, which v5.32 deliberately has none of.

### Consequence for D-2, stated so it is not rediscovered

Sequencing the ACA work first was originally justified by the idea that it would unblock the
realized-capital-gains default. **It does not.** Re-running that direction evidence with the floor
artifact held constant both ways needed the declined toggle. So the capital-gains default stays at
0 and **D-2 remains PARTIALLY ADDRESSED** — the capability ships, the default stays conservative.

> ⚠ **STALE as of v5.36 — flagged at the 2026-08-18 re-pin.** The sentence above is the v5.32-era
> position. **v5.36 changed it**: ordinary drawdown now realizes gains by default (Engine D
> L4742–4742), Engine B's `capGains_y` is no longer 0 (L5096), and both tax engines consume the
> schedule. The reasoning in this section — that the ACA work did not unblock the capital-gains
> default, and that closing D-8b's discontinuity needs the declined toggle — **remains correct and
> is still the live position on D-8b.** Only the D-2 consequence is out of date.
That is a coherent outcome, and it is now a decision on the record rather than a discovery at the
next release. What D-8b does give that release is a principled way to identify which households'
apparent improvement is this artifact.

## D-11 · Three states' modelled 65+ figures are correct on one side of a statutory gate and wrong on the other — New Mexico, Rhode Island, Wisconsin — ◐ NARROWED (see the census)

**Opened 2026-09-02 from `docs/AUDIT_STATE_EXCL65_ROUND4.md` §4 and §6 D-A.** ROUND3 §4 established
that `excl65` (a scalar) and `persons65` / per-person ages (a count and a floor) cannot express a
taper, bands, a cliff, a household cap, an income measure excluding Social Security, or an
account-type distinction. ROUND4 supplies the consequence: **wherever the statute puts a gate the
model cannot hold, the model does not merely lose precision — it changes sign across the gate.** That
is a different property from D-3c's (NJ, VA), where applying the exclusion unconditionally flatters
the plan at every income the app models, and it is not served by the same fix, disclosure or release.

| State | The gate the model cannot hold | Model vs statute (ROUND4 §4, both spouses 68, MFJ) |
|---|---|---|
| **NM** | SS exempt only under $150,000 MFJ AGI (hard cliff); the $8K 65+ exemption is zero above $51,000 MFJ, unindexed since 1987 | +$216 conservative below the SS cliff; **−$1,784 optimistic** above it — the two errors mask each other until exactly $150,000 of AGI |
| **RI** | ~~FRA (67) floor~~ **modelled v5.60**; AGI cliff **modelled v5.69, exclusive** (TY2025: $133,750 MFJ / $107,000 single, per ADV 2025-22 — corrected v5.61; RI's own PUB 2026-01 prints $133,500, which the statute's indexing formula does not admit); IRA distributions do not qualify; SS modification carries the same gates | conservative under the cliff with employer-plan money; **optimistic** if the money is an IRA; **optimistic** at or over the cliff. The **65–66 window is closed** — a couple at 66 on $80,000 now pays $5,020 rather than $1,020 |
| **WI** | ~~67 floor~~ **modelled v5.60**, no income test | **None remaining.** The 65–66 window is closed (a couple at 66 on $60,000 now pays $3,180 rather than $636) and the model matched the statute from 67 already — **WI is exact on this provision** |

**What v5.59 did.** Corrected the two *amounts* that were a legislative cycle stale — RI `excl65`
20,000 → **50,000** (P.L. 2024 ch. 117, TY2025+), WI 5,000 → **24,000** (2025 Wis. Act 15) — and
rewrote both notes to name every gate the model does not apply. Direction of the figure move:
conservative toward statute for qualifying households. **What it deliberately did not do** (ROUND4
§6 D-D): set `exclAge` to 67 for either state, model RI's cliff or IRA exclusion, touch New Mexico,
or touch the eight-state `ss: 0.5` blend. A gate change alongside a figure change cannot be
attributed if a downstream figure moves.

**What v5.60 did.** Set `exclAge: 67` on RI and WI — the cheapest gate, already supported by the data
model — and rewrote both notes. No figure moved; direction conservative in every measured cell. It
also widened `t10`'s note-vs-code extinction invariant, which had been blind to both states: its age
range stopped at 64, and RI's wording was invisible to it regardless of range. **This closes (a).**

**What remains.** (a) ~~`exclAge: 67` for RI and WI~~ — **CLOSED at v5.60.** New Mexico still keeps
the implicit 65 default; whether its exemption carries a different floor was not established and
belongs to its own pass. (b)
New Mexico, disclosure-first (D-C): its note is accurate and misleading, its `ss: 0.5` blends across a
0%/100% cliff the note states and the model ignores. (c) RI's cliff and IRA exclusion, and NM's SS
cliff, need a data-model field the engines do not carry — an income-gated exclusion and an
account-type flag — which is the same structural gap as D-3c's taper and should be scoped once, not
per state. Rhode Island's TY2027 removal of the age threshold from its SS modification (HB 7127 Sub
A, Art. 6 § 5) is recorded in ROUND4 §2b and belongs to whichever release models (c).

**Direction, stated for the product's identity:** mixed and sign-changing, which is worse for a
deliberately pessimistic tool than a one-way optimistic error, because it cannot be bounded by a
single caveat. Each of the three notes now states which side of its gate the model is on.

**Coverage.** `t10` §2E pins the RI/WI amounts as boolean identities with hand cases, both notes'
disclosure conditions, and both F-6 memberships; `t31` carries `$50,000 pension/401k exclusion` and
`$24,000 retirement-income exclusion`. v5.60 adds both `exclAge` identities, the 66/66 denial and
mixed-age 68/66 hand cases in each state (the cells that prove the floor is per person), 68/68 cells
unchanged, pre-fix pins on the frozen leg, and two assertions that each note stays **visible** to the
note-vs-code matcher that guards it. Before v5.59 no assertion in the suite named any of the three.
**NM was uncovered until v5.66**, which is what kept its half of D-11 open. It now carries the
largest cell block of the three: `t10` §2E prices EVERY band of both statutory tables to the dollar
(18 cells at the band tops, 14 one dollar past each top), plus the age floor, the per-person unit,
the AGI measure, the wage-spill clamp, an extinction invariant and the scalar-consistency check;
`t34` §A carries the structural table assertions and `t35` D-7a the guarded-set invariant. **NM's
half of D-11 is CLOSED as of v5.66.** Two limitations remain disclosed rather than modelled — the
table is unindexed since 1987, and blind claimants at any age cannot be expressed.

⚠ **D-11 is therefore now about TWO states, not three, and the heading above still says three.**
Left as-is deliberately: renaming a defect ID mid-life breaks every citation of it. The row and this
section state the current position.



## D-13 · How often does any state income threshold actually bind? — re-homed 2026-09-14, UNANSWERED

**This is not a new question. It is an old one rescued from a document that left the pool**, and it is
recorded here because that is the only thing keeping it visible to a session working from the pool.

`SCOPE_INCOME_CONDITIONING.md` retired FULFILLED at v5.69 — all five states (CT, NM, NJ, VA, RI) are
income-conditioned, and all seven of its decisions were resolved. **One item did not close with it.**
Its §2.4 list carried *"Still open — how often any threshold binds"*, and its §6 states the question
in full:

> **How often does each threshold actually bind for the households this app models?**

⚠ **It cannot be measured from the existing fixtures.** `qa/tools/fixture/households.mjs` holds
boundary-clearing variants of **one** shipped example household, so counting them says nothing about
a population — and the engines compute no AGI-like state income at all. The measurement needs a
purpose-built set of households.

### ⚠ Why this entry exists at all — the near-miss, recorded

On 2026-09-14 sixteen retired scopes were removed from the pool to recover space (~348K). The repo
copies remain, so nothing was destroyed. But this question existed **only** inside
`SCOPE_INCOME_CONDITIONING.md`, and a check after the fact found it was **no longer reachable from
the pool at all** — every session works from the pool, so the question had become invisible without
being resolved.

That is the milder form of what happened on 2026-08-26, when `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md`
was deleted after confirming what it BUILT survived — and took an open maintainer decision with it,
recovered from git history and re-homed as **D-10**. §G's rule was written from that incident:
**check for unresolved DECISIONS, not just built outcomes.** The rule held here only because the
check was run afterwards; it was not run before.

**The lesson worth keeping is about sequencing, not about the rule.** The un-pooling and the
re-homing were identified together, but the file list was the actionable half and was acted on first.
Anything that removes a document from the pool should carry its re-homing in the **same** package.

*(Virginia's married-couple taper endpoint, the other open question in that set, survives
independently in `AUDIT_STATE_EXCL65_ROUND3.md` and needed no re-homing.)*

---

# New at v5.73 — standing audit Phase 3 (2026-09-15)

## D-15 · Maine's pension deduction has no age-65 test in law

36 M.R.S. §5122(2)(M-2) limits the deduction by the §72(t) rule (and a 55-or-series rule for employer plans), not by age
65; the model applies Maine's deduction from 65 (the default age floor). Pessimistic for a Maine retiree drawing
retirement income before 65. Disclosed in Maine's note and METHODOLOGY at v5.73. Doing it right needs the 59½ rule per
account, which touches D-12. **Low.**

## D-16 · Filing statuses beyond single and joint

The model files joint, or single after a death. It has no head-of-household status (which several state thresholds and
the federal tables distinguish) and no qualifying-surviving-spouse years (joint brackets for two years after a death, for
a survivor with a dependent child — METHODOLOGY L1077 notes the rule). Married-filing-separately is out of scope by the
product boundary. **Low–medium**: a widow(er) with a dependent is uncommon but not rare in the app's population.

## D-18 · Indexed state figures need a tax-year refresh — ✅ FIXED v5.86 (recurs)

> **FIXED at v5.86** (`docs/SCOPE_D18_STATE_FIGURES.md`): every dollar-bearing state figure carries the tax year it was verified for
> (`years`, 31 figures on 23 rows) and My Data shows it in place of the blanket "Model (2026 approx)". Maine's cap is $49,824
> (TY2026); Louisiana's exemption $12,324 (TY2026); South Carolina's note corrected. Maine's thresholds, Montana and Rhode Island
> stay TY2025 (unpublished for 2026) and say so. **The refresh itself recurs** — next known: Montana's TY2026 subtraction (set by
> 1 November 2026), Rhode Island's TY2026 thresholds (expected November 2026), Maine's TY2026 thresholds, Louisiana's TY2027
> amount (posted each January), Georgia's $70,000 at 65+ from TY2027. Louisiana's larger amount enlarges the household-netting
> approximation recorded under D-12 (its write-up archived in `docs/MissingFeatures_ARCHIVE_closed_to_v6_20.md`). Rates are D-22.

Maine's $48,216 and both phaseout thresholds, and Montana's $5,660, are TY2025 figures, disclosed as such (v5.73 D-2);
both states index them. Several other rows carry dated figures of their own. A small, recurring populate release, akin to
the federal `TAX_CONSTANTS_YEAR` cycle but with no staleness banner of its own. **Low**, recurring.

## D-32 · State credits that need a measure the calculator lacks are not taken — opened at v6.03

Found reading D-30 batch 2's sources (`docs/SCOPE_D30_DEDUCTIONS_V603.md` §0.2, DD-8): **Ohio's retirement income credit** (R.C. 5747.055(B): $25 to $200 per
return by the retirement income received "on account of retirement", while modified AGI less exemptions is under $100,000) — the evaluator is given no
retirement-income measure, and whether a Roth conversion counts was not read; **Ohio's joint filing credit** (§5747.05(E): 5 % to 20 % of tax, at most $650,
each spouse needing $500 of qualifying income other than interest, dividends, distributions, rents and gains) — per-person income by type; and **Utah's
retirement credit** (up to $450 each, only for a filer born on or before 31 December 1952) — the calculator has ages, not birth years. Conservative today (more
state tax than the law), disclosed in each note. **Low — small amounts; an argument or two each.**

## D-37 · Two self-employment deductions are not taken — opened at v6.16, DISCLOSED

Filed at the D-36 build (`docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md` §0.4, decisions DC-2 (a) and DC-5 (a)). From v6.16 a self-employed job row pays
self-employment tax, but two deductions that come with it are not taken:
- **Half the self-employment tax (26 U.S.C. §164(f)).** It is taken above the line (§62(a)(1)), so it lowers AGI and every MAGI built on AGI —
  IRMAA, the ACA subsidy, the Social Security worksheet and state AGI. On $60,000 of profit the deduction is $4,238.87, worth about $509–$933
  of federal income tax a year at 12–22%. Taking it in Engines A and B alone would make the Taxes tab's MAGI disagree with the IRMAA and
  Withdrawal tabs' (`t40` asserts they agree), so doing it properly reaches Engines C and D and the Roth tab's ladder too — a wider release.
- **The qualified business income deduction (§199A).** Up to 20% of a sole proprietor's net profit, limited for service businesses above the
  income thresholds; those limits need inputs the app does not have.

Both are **conservative**: income tax runs high for a self-employed household. **Disclosed at v6.16** in the Taxes tab's method note, the Field
Manual's streams entry and METHODOLOGY (*Payroll tax on job income*). **Low–medium.**

## D-39 · The Withdrawal, Taxes, IRMAA and Roth tabs do not see the home-move cash — opened at v6.17, DISCLOSED

Filed at the D-38 build (scope DC-4 (a)). Only the Monte Carlo engines read `homeMoveCash`. Engine D's Priority-1 pool (the Withdrawal tab)
starts without it, so a household with a large positive figure draws its retirement accounts sooner there than the Monte Carlo assumes, and a
negative figure (a next home that costs more) is not taken from the pool at all. The tax engines inherit Engine D's draws through the bridge,
so the Taxes and IRMAA tabs follow it; the Roth comparison has no spending model. The direction depends on the sign. Putting the cash into
Engine D's pool moves the schedule, the tax engines' MAGI and IRMAA — its own scope. **Disclosed at v6.17** in My Data's note, the Monte
Carlo tab, the Field Manual and METHODOLOGY (*Cash from a home move*). **Low–medium.**

## D-40 to D-43 · Four fixed figures every plan inherited from the example — filed at v6.18 from the findings note

Measured on 2026-10-17 against v6.17 and written up in `docs/FINDINGS-v6_17-fixed-plan-figures.md` (repo-only; its F-1 to F-4), after
Steve approved measuring `ROTH_TAX_DRAG_Q` and `AUTO_REPLACE_COST`. The §K2 sweep then found none of them registered. Order agreed: D-41
first (v6.18, below), then D-40, then D-42 and D-43 together. Each will have its own scope, with its measurements re-run on the build it
starts from.

- **D-40 · The Monte Carlo's only income tax was a flat $16,000 a year during the Roth ladder — ✅ CLOSED v6.20** (`docs/SCOPE_D40_MC_TAX_V620.md`,
  fulfilled; `qa/t83_mc_tax.mjs`). From v6.20 both engines pay the Taxes tab's tax year by year, at the live conversion slider, QCD and yield,
  grown with each path's inflation; the 30-year figures read lower on every household measured (METHODOLOGY, *The Monte Carlo pays the
  Taxes tab's tax (v6.20)*). As filed: `ROTH_TAX_DRAG_Q = 4000` is subtracted
  every quarter up to the ladder's end in `runMonteCarlo` and `runExtendedMC`, on every plan, whatever it converts; the spending draw carries
  no tax term, and after the ladder nothing is charged (RMDs included). On the example it is close to the Taxes tab's own $215K ($192K);
  for the example's holdings ×1.6 in Georgia the Taxes tab says $368K and 30-year success reads 96.9% against 95.2% with that tax charged.
  **Either direction; medium.** Candidate fix: the Monte Carlo pays the tax the Taxes tab computes, at the plan's conversion setting —
  which is built on Engine D's draws, so it waited for D-41.
- **D-42 · A $40,000 car every 8 years, on every plan — ✅ CLOSED v6.21** (`docs/SCOPE_D42_CAR_V621.md`; `qa/t84_car_rows.mjs`): a car is an expense row; see METHODOLOGY, *Cars are expense rows (v6.21)*. As filed: `AUTO_REPLACE_COST = 40000`, spent in March of retirement years 8, 16 and 24 by
  `runExtendedMC` when auto-replacement is on (the Stress and Dashboard figures, the mortgage what-if). Disclosed in the Field Manual as a
  fixed example schedule. On the example, 30-year success 81.0% with it and 84.8% without. **Conservative; low–medium.** A household that
  enters car purchases in the expense table pays twice. Candidate fix: a My Data field (cost and interval, 0 = none), as v6.17 did for the
  home-move cash.
- **D-43 · The Income tab subtracts the example's $400 car payment — ✅ CLOSED v6.21** (six sites on two tabs, not four; the figure is read from the table). As filed: "Post-car draw" and "Monthly shortfall (car paid off)" are
  `POST_MONTHLY_FULL − 400` (four sites). Display only. **Low.** To be fixed with D-42.

## D-44 · One-time expenses: the Monte Carlo charges them in today's dollars; the Withdrawal tab misses one dated before retirement — opened at v6.18, DISCLOSED

> **NARROWED v6.20 (2026-10-18).** The Monte Carlo half is closed: both engines grow a one-time row with the run's inflation
> (`docs/SCOPE_D40_MC_TAX_V620.md`; `qa/t83_mc_tax.mjs` C). **Still open:** the Withdrawal tab never sees a one-time row dated before the
> retirement year — fixing it means taking the row out of `retireStartBalances`, which Engines A, B, C and D share (DC-5 (a)).

Filed at the D-41 build. Both Monte Carlo engines subtract `getOneTimeExpenses(dateStr)` uninflated (`runMonteCarlo`, `runExtendedMC`) — when
they charge it at all, see D-45 — while they inflate the monthly rows — optimistic by the inflation to the row's date (a $20,000 row ten years out at 2.7% is charged about $6,100
too little). Engine D starts at retirement from today's balances, so a one-time row dated before the retirement year never reaches the
Withdrawal tab — optimistic for that tab, by the row's amount. **Low.** Not
changed at v6.18: inflating the Monte Carlo's one-time rows moves every Monte Carlo figure and belongs with D-40. **Disclosed at v6.18**: the
Monte Carlo half in the Field Manual's Withdrawal Strategy entry, the Withdrawal-tab half in that tab's note; both in METHODOLOGY (*The
Withdrawal tab spends the expense table year by year*).

## D-47 · The Stress tab's "planned" benchmark ignores withdrawals — opened at v6.19 — ✅ CLOSED v6.21

> **CLOSED v6.21:** the Planned column is `runExtendedMC`'s own planned path at each snapshot, with the guardrails' own bands (`t84` A-7, F). Under BULL-LEANING the old column marked the example's median low in 16 of 31 yearly snapshots, the engine's path in none.


The Stress tab's 30-year guardrail table shows "Lower (80%)", "Planned" and "Upper (120%)" columns computed as `household × 1.04^years` —
the same benchmark `runExtendedMC`'s own comment says was replaced as its guardrail reference because it ignores withdrawals. Display only;
the engines do not read it. **Low.** *Corrected at v6.20:* this said "to be fixed with v6.20", but D-47 was filed after v6.20's scope was
decided and is not in it, so it was not folded in. From v6.20 `runExtendedMC` returns its planned path, so the fix is ready to scope.

## D-48 · My Data's as-of date is the UTC date — opened at v6.19

My Data stamps the plan's as-of date with `new Date().toISOString().slice(0, 10)` — the date in UTC, so a save in the evening in the Americas
on a quarter's last day is dated the next day, in the next quarter. From v6.19 the Monte Carlo counts accumulation from the as-of quarter,
so that save reads about one quarter less accumulation in the 30-year figures. **Low.** Disclosed in METHODOLOGY (*The Monte Carlo's
calendar*).

## D-49 · The built-in part-time work for spouse B — opened at v6.20

Found while scoping D-40 (`docs/SCOPE_D40_MC_TAX_V620.md` §0.1 item 2). `spouseBWorkTaper` gives every plan with no income streams
$20,000, $18,000 and $15,000 of spouse-B wages in retirement years 0–2. Engines A, B, C and D credit and tax it (and the Roth tab's ladder
table); neither Monte Carlo engine credits it. A single plan with no streams is taxed on a spouse B's wages ($20,000 / $18,000 / $15,000 of
`work_y`, $1,530 / $1,377 / $1,148 of payroll tax, measured at the scope); it has no single-household test. METHODOLOGY described it as a
feature. From v6.20 the Monte Carlo pays the Taxes tab's tax, so it pays the tax on these wages without crediting them — conservative by
$14,479 on the example (BASE, $70K): $7,037 directly in 2029–2031 and $7,442 through Engine D's draws later (measured at the v6.20 build).
**Either direction by engine; low–medium.** Kept as it is at v6.20 (DC-7 (a)); the taper is for its own release. Disclosed in the Field
Manual's Monte Carlo entry and METHODOLOGY (*The Monte Carlo pays the Taxes tab's tax (v6.20)*).

> **NARROWED at v6.23** (`docs/SCOPE_D49_WORK_TAPER_V623.md`; Steve: all four decisions as recommended; `t86`). Only the example household —
> a plan that holds the example's holdings, is married and has no income streams — is paid the wages (DC-1 (a)); a single plan gets none,
> the example made single included (DC-3 (a)). A plan saved before v6.23 that loses them is told so on My Data and the Monte Carlo tab until
> Save & Apply writes `workRowsV623` (DC-2 (a)). The wording that named spouse B for every plan is corrected (DC-4 (a)): the Taxes tab's
> line, the Withdrawal tab's Step 1, My Data's note, four Field Manual sentences and METHODOLOGY. **Correction to this entry:** it said the
> wages are "credited and taxed" by Engines A, B, C and D. Only Engine D credits them as cash; Engines A, B and C and the Roth ladder tax them
> (with payroll tax in A and B) and carry them in MAGI, and see Engine D's lower draws through the draw bridge (measured at the scope, §0.5).
> **What remains open is the example's alone:** its wages are built in, not visible rows; the Monte Carlo pays their tax without crediting
> them, and the Income tab, Backtest and What-Breaks do not credit them — conservative, $14,479 on the example (BASE, $70K, measured at
> v6.20). The way to close it is to move the example's wages into visible job rows and delete the taper (the scope's DC-1 (b)), which needs
> a new phase rule for the Income tab (it holds a stream's first-month amount for a whole phase) and a fix for its phone layout
> (UsabilityFlaws **F-20**) — its own release.

## D-50 · The mortgage what-if speaks to Florida — opened at v6.20 — ✅ CLOSED v6.21

> **CLOSED v6.21:** the sentence states the model's rule; the Roth tab's rules box, which said "Florida — no state income tax" to every plan (found at the D-42 scope, never registered), names the plan's state (`t84` G-3, G-7, H-4).
> **v6.22:** for a new plan that chose no state, "the plan's state" was the example's Florida, read from the example's master prompt it had kept (D-53). D-53 closed at v6.22: such a plan holds no example prompt and the rules box says no state is chosen (`t85` D-3c).


The Monte Carlo tab's mortgage what-if tells every plan "Mortgage interest isn't deductible for you (standard deduction + no FL income
tax)" — the example's state, typed in (`docs/SCOPE_D40_MC_TAX_V620.md` §0.1 item 4). Display only. **Low.** Not fixed at v6.20.

## D-51 · IRMAA is not in the Monte Carlo's tax — opened at v6.20

From v6.20 the Monte Carlo pays the Taxes tab's tax (DC-2 (a)); IRMAA — a Medicare premium surcharge, on the IRMAA tab (Engine C) — is not
in it. $0 on the example and on the example's holdings ×1.6 in Georgia; $21,880 lifetime on the example at a $250,000 slider (BASE,
measured at the v6.20 build). **Optimistic for high-income plans; low–medium.** Candidate fix: add Engine C's surcharge to the schedule
(the scope's DC-2 (c)). Disclosed in the Field Manual's Monte Carlo entry and METHODOLOGY.

## D-52 · My Data keeps a row's years only — opened at v6.21 — ✅ CLOSED v6.24

> **CLOSED at v6.24** (`docs/SCOPE_D52_EXPENSE_MONTHS_V624.md`; Steve: all five decisions as recommended; `t87`). Wider than this entry: the draft autosave and **Export Backup** re-dated too; one unedited save of the example moved 31 of its 35 rows — the current home's costs to December 2029, the next home's from January, so 2029 paid for both homes ($126,280 → $157,720 of table spending) — and Medicare to January 2028; a guided-setup table paid both its living-expense rows through the retirement year. A sibling: the editor's *Before retirement* default ran through December of the retirement year, though the model retires on 1 January. From v6.24 each row shows and keeps its months (an unedited well-formed row is stored as loaded, its dates verbatim; METHODOLOGY lists the normalisations that remain — a one-time row's phase follows its date, the old category name *Future Home Life* is saved as *Retirement Life*, a text amount becomes a number), and the defaults split at the retirement date, from the editor's live retirement year. A plan saved before v6.24 keeps its January–December dates; the editor's footnote says to check them. The original entry follows.


My Data's expense editor shows each row by year (`startYr` / `endYr`, or `oneYr` for a one-time row) and `buildExpenses` writes it back
as `${startYr}-01` to `${endYr}-12` for a monthly row and `${year}-06` for a one-time row. Any row dated by month — the example's, a
spreadsheet import's, a hand-edited backup's, and the *"Replacement car (added by v6.21 …)"* rows v6.21 adds to an older plan — is re-dated
at the next Save & Apply. On the example: the Car Payment (April 2029 to April 2034) becomes January 2029 to December 2034, so eleven more
months of it are spent (three before, eight after) and the "after the payments end" figure moves to January 2035; the golf cart and closing costs (April 2029) and the
added cars (March) move to June. Found at the v6.21 build by `t84` G-11 (the added rows were stored as 2037-06 … 2061-06), where the
one-time half is pinned as a dated `[KNOWN DEFECT]` so a fix flips it. Engine D, Backtest and What Breaks read one-time rows by year, so
those do not move them; the Monte Carlo charges a one-time row in the quarter that contains its month (v6.20), so a January–March row is
charged one quarter later (optimistic) and a July–December row one or two quarters earlier (conservative). A monthly row widened to whole
years is spent for more months (conservative for a cost, optimistic where a row's end is what the plan is waiting for). **Low–medium,
either direction.** Candidate fix: keep each row's stored months when its years are unchanged in the editor, and show the months.
Disclosed in METHODOLOGY's v6.21 section.

## D-53 · A new plan keeps the example's master prompt — opened at v6.21 — ✅ CLOSED v6.22

> **CLOSED at v6.22** (`docs/SCOPE_D53_PROMPT_V622.md`, Steve: all seven decisions as recommended; `t85`). The scope found it wider than this entry: ten facts, not the state alone, and four routes in (Start Fresh, both guided-setup routes, a backup without a prompt, a stored plan without a prompt key), plus a previous plan's own prompt surviving a fresh build. The example's facts are now fields on `DEFAULT_PORTFOLIO`, equal to what the parsers read from the demo prompt; a load without a prompt holds none; storage keeps what memory keeps; My Data shows a placeholder blank and names it, and names any of the example's facts an older plan carries; no state is said plainly. Two siblings closed with it: income a plan never entered was paid the example's $3,300 / $1,300 / $400 a month (now $0, named by the banner), and a backup without an expense table kept the table already held (now refused). The original entry follows.


Start Fresh passes an empty master prompt, which the loader ignores, so the example's prompt stays loaded; the guided wizard does the same
when its state step is skipped. The plan timeline takes the state from My Data's fields when they are set, else from the master prompt's
state line — so a new plan that chooses no state is the example's Florida, at 0% state tax: the engines tax it so, the Taxes tab's footnote
and the Roth tab's rules box say Florida, and Ask AI's context is the example's. Measured at the v6.21 build (Start Fresh's blank plan:
state name "Florida", rate 0, no state code; the wizard with the state skipped: the same). The scope read it and did not run it (its §0);
the build ran it. **Optimistic for a new plan in a state with an income tax that has not chosen it; low–medium** (My Data's state field
fixes it for that plan). Candidate fix: Start Fresh and the wizard clear the master prompt, or the timeline ignores the demo prompt for a
plan that is not the example. It narrows D-50's closure: the Roth tab's line now says what the Taxes tab says, which for such a plan is
Florida.

## D-54 · The guided wizard ends its living-expense row in 2079 — opened at v6.21 — ✅ CLOSED v6.24 for new wizard plans

> **CLOSED at v6.24 for plans the wizard builds from then on** (with D-52; DC-3 (a)): the post row runs to the plan's horizon — the later spouse's plan-to year — and the two rows split at the 1 January retirement date, not June/July. Plans it built earlier keep the 2079 end (disclosed in the Field Manual and the editor's footnote).


The wizard writes the household's retirement living expenses as one monthly row ending `2079-12`. A plan whose horizon (the later spouse's
plan-to year) is after 2079 spends nothing from 2080 — measured at the v6.21 review on a couple born 1975 and 1977 planning to 100 and 105:
$78,000 in 2079, $0 in 2080. **Optimistic, for few plans; low.** From v6.21 the D-43 figure ("after the payments end") treats a table that
spends nothing afterwards as having no such figure, so it is not shown as $0. Candidate fix: end the row at the plan's horizon.

## D-55 · Ask AI's ground rules reach only the example — opened at v6.22 — ✅ CLOSED v6.26

> **CLOSED at v6.26** (`docs/SCOPE_D55_AI_GROUND_RULES_V626.md`; Steve: all six decisions as recommended; `t89`). Wider than this entry: every plan but the unsaved example sent no ground rules, the example included once saved. A fixed header now goes first with every question on every route and is stored nowhere; the demo briefing is unchanged and overridden by it. The original entry follows.


The demo prompt's *Section 1 — System Role & Ground Rules* (among them *"Educational Only: Describe and analyze — do NOT recommend target
asset allocations or specific securities to buy, sell, or trim"*) heads the example's Ask AI system prompt. A plan saved from My Data sends
`genAIContext()` — a plan summary with no rules — and the live context, whose one guard is the asset-mix line's *"descriptive — do not
recommend allocation changes"*. Through v6.21 a plan begun with Start Fresh or the guided setup carried Section 1 by accident (D-53); from
v6.22 it ends where My Data plans already were. **Not a figure; the app's "never advice" posture on its Ask AI surface.** Candidate fix:
send a short fixed ground-rules header for every plan, ahead of its summary — a wording decision, so it needs its own scope. Found at the
v6.22 scope (DC-4).

## D-56 · Example-valued defaults that remain — opened at v6.22

After D-53, four defaults still carry the example household's values for a plan that has none of its own: the as-of date `2026-04-18`
(`_asOfToYM`, when a plan has no `asOf`); Spouse B's Social Security claim age 63 (the timeline's `ssB_age … || 63`, and the loader's inserted Spouse B block); the 2029 retirement
placeholder (shared with the timeline's other placeholders, disclosed by My Data from v6.22); and the Roth tab's *"Roth 401K 5-year rule:
satisfied / Roth IRA 5-year clock: started (example)"*, shown to every plan. **Low; either direction** (an earlier claim age lowers the
benefit and lengthens the years it is paid). Found by the v6.22 scope's independent review.

*Widened at v6.27* (`docs/SCOPE_F22_GRADE_FINDINGS_V627.md` §0.3 C and §4, DG-2 (a)). The Grade tab's **LTC / Tail Risk (C+), Tax Efficiency
(B+) and Diversification (B+)** are literals — the same for every plan, 20 of its 78 weight points — and **Guardrail Readiness** counts only
rows labelled exactly "golf" and "Amazon" (`/^golf$/i`, `/^amazon$/i`), so a plan without them grades B- (the cut it is measured
against is always above $0; the example's own golf row, "Golf (monthly)", does not match, and its $400 Amazon row leaves it at B- too). Together they cap every plan's overall grade at **B+** (277.5 / 78). From v6.27
the tab labels all four and states the ceiling; computing them — or dropping the literals from the weighting, which would raise many plans'
grades — is open. `t90` A-6 makes a literal grade without `fixed: true` fail.

## D-57 · Backtest and What-Breaks credit no income stream — opened at v6.23

Found while measuring D-49 (`docs/SCOPE_D49_WORK_TAPER_V623.md` §0.4). Backtest's guaranteed income is Social Security plus the pension;
What-Breaks reads the same two (`annualSSGuar`, `annualPenGuar`) and no stream. A plan's rental, job or annuity income therefore never
lowers either tab's draws, while What-Breaks' tax — Engine A's current strategy's lifetime tax, averaged per year — does include those
streams' tax. METHODOLOGY's streams paragraph listed What-Breaks among the engines streams flow through until v6.23 (corrected then). **Low;
conservative** (the draws are higher than the plan's own income would leave them). Candidate fix: credit `streamsAnnualAt` in both tabs'
yearly income, as Engine D does — a modelling change to two tabs, so it needs its own scope. Disclosed in the Field Manual (§13) and
METHODOLOGY from v6.23.

**A related figure, noted at v6.28** (`docs/SCOPE_F23_F24_DIRECTIVES_V628.md` §0.3, found by its review; filed as UsabilityFlaws F-25).
The Income tab's gap card, and the Grade tab's Income Floor drag until v6.27, figure the portfolio draw before spouse A's Social Security
as months × (expenses − spouse B's Social Security − the pension). Both subtract spouse B's benefit for the whole gap, even when B claims
after A (the `couple` fixture: B in 2034-06, A's gap 2031-01 to 2032-06), and only the Income tab's subtracts streams. v6.28 removed the
Grade tab's dollar figure (DF-2 (a)); the Income tab's stands. Fixing it changes a displayed figure, so it belongs with this item's scope.
**Fixed at v6.29** (`docs/SCOPE_F25_MODEL_CLAIMS_V629.md`, DF-2 (a)): the Income tab subtracts spouse B's benefit from B's claim month on, as
Engine D and the Monte Carlo pay it (streams are still taken at the retirement month). `t92` C-1 holds it to a month loop on a couple whose B
claims after A's gap; `boundaries.mjs` gained `ss_claim_after_gap`, ON for the example (its B claims at the gap's start).

**Widened at v6.29** (the F-25 scope, §0.4 item 5): Backtest and What-Breaks credit no home-move cash either — the cash a home move adds
or takes at retirement reaches every Monte Carlo figure and no deterministic tab. Both tabs now say they count Social Security and the
pension only (the Field Manual's What Breaks and Backtest entries, the Exit Plan's first phase).

## D-58 · An unedited Save & Apply rewrites spouse A's pre-tax contribution — opened at v6.24

Found at the D-52 scope (`docs/SCOPE_D52_EXPENSE_MONTHS_V624.md` §0.2, by comparing the example's stored portfolio after one unedited save
with the one it loaded). `buildPortfolio` takes spouse A's pre-tax contribution (`contribPreTaxA`) from the per-paycheck rollup; a plan that
holds only a monthly total, as the example does ($2,500 a month), has no per-paycheck figures and stores **$0** at the first save, so every
figure built on accumulation falls (the conservative direction). METHODOLOGY's contribution-accrual section has disclosed this since v5.10
(*"a plan holding only a monthly total and no per-paycheck detail shows $0 in that rollup"*). The same save moves the as-of date to today,
which is intended (D-48 records its UTC date). **Low–medium; conservative.** Candidate fix: keep a stored monthly figure when the per-paycheck
fields are blank — it touches the accrual readout and the bonus machinery, so it needs its own scope.

## D-59 · The leave dialog's "Save & Apply, then leave" saved nothing — filed and closed at v6.24

Found at the v6.24 build, when `t87` A-9 drove the unsaved-edits dialog's **SAVE & APPLY, THEN LEAVE** for the first time — nothing in the
suite had pressed it (`t4`'s GUARD checks press **DISCARD & LEAVE**). The button ran `setActiveTab(t)` and then, 40 ms later,
`MYDATA_SAVE()`. Switching tabs unmounts the editor, and the editor's cleanup sets `MYDATA_SAVE` to null, so the call found nothing and the
button saved nothing. It had done so since the dialog was added at v5.9.2. Confirmed in Chromium on the live v6.23 page: the tab's own
Save & Apply stored an edited label, and the dialog's button stored nothing. The dashboard went on showing the old plan, and the edit was
gone on return. The edit could be recovered only from the recovery banner, and only if the draft autosave had landed (2 s after the last
keystroke). **Medium; the button's label promises a save that did not happen** (no confirmation appeared — the save's notice never ran). Fixed at v6.24: the handler saves at once, not in a timer,
and first sets the remembered tab to the target. A save remounts the app on that tab, and the first fix, without that step, saved and then
landed back on My Data; a Chromium check of the built page caught it before release. Pinned by `t87` A-9 (the save), A-9b (the landing, as jsdom sees it) and A-9d (the handler's order, by AST — jsdom cannot see the
wrong-tab landing, which a browser shows) on both legs, and by controls C15 and C17 of `qa/tools/controls_v624_months.py`. *Residual, recorded at the build review:* the leave path drops the draft
before the save commits, so if the save were rejected (a storage error) the edits would be gone with the editor already closed; the tab's
own Save keeps the form open. The editor's own output is not rejected by the loader, so this is not reachable in practice.

## D-60 · The tax engines mix dollar units — opened at v6.29

Found at the F-25 scope (`docs/SCOPE_F25_MODEL_CLAIMS_V629.md` §0.4 item 1), measured by its review and reproduced. Engine B indexes brackets,
the standard deduction and the LTCG and AMT figures 2%/yr from the as-of year, takes RMDs off a balance growing at a nominal 4.5%, and holds
Social Security, the pension and income streams flat in today's dollars; it also deflates the draws it takes from Engine D. Engines A and C
share the shape. The result depends on the reading: as each year's own dollars (which *"indexed 2%/yr"* invites) the Taxes tab runs low —
$212,552 against a units-consistent $283,375 at a $0 slider, $213,670 against $254,334 at $70,000; as today's dollars it runs high. The Monte
Carlo and What Breaks treat it as today's dollars and grow it again, charging $62,400 and $38,358 more than the nominal benchmark; a
units-consistent schedule raises 30-year success from 94.83% to 95.67% ($0) and 95.15% to 95.73% ($70,000). Two inflation clocks also differ
(Engine D from the retirement year; Engine B and the Monte Carlo from the as-of year). **Medium; direction depends on the reading; the success
rates are very slightly pessimistic.** Candidate fix: one dollar frame in Engines A, B and C **and** the Monte Carlo's and What Breaks'
re-inflation, in one scope stating which inflation clock it uses — fixing the engines alone would double the Social Security tax in the
Monte Carlo. It moves the Taxes tab's total up and the success rates slightly up. Disclosed from v6.29.

## D-61 · QCD eligibility after a death — opened at v6.29

Found at the F-25 scope (§0.4 item 2), read by two readers and the review; not measured. Engine C sets the QCD cap's persons from
`_singleI`, which is false in a married plan's widowed years, so both spouses count for the whole horizon (`_qcdPersonsI`); Engine B, in
widowed years, gates the QCD on `Math.max(ageA, ageB) >= 71`, so the deceased's age can qualify a younger survivor (the C-3 shape).
**Low; optimistic, and only for a plan with a QCD set.** Disclosed on the Taxes tab's QCD line from v6.29 (*"survivor years are
approximated"*). Candidate fix: the survivor's own age and one person in widowed years, in both engines — a model change, its own release.

## D-62 · STAY UNDER IRMAA can cross the cliff it targets — opened at v6.29

Found at the F-25 scope (§0.4 item 3), confirmed by two readers. `irmaaCap` solves the conversion against the threshold less the year's
other MAGI before the funding sale; the sale's realized gain is then added to the lookback MAGI. A plan that pays conversion tax from a
taxable account with embedded gains can therefore land over the first cliff. The ACA strategy allows for its own sale. **Low.** Disclosed on
the Roth tab from v6.29. Candidate fix: solve with the sale's gain included (as the ACA strategy does).

## D-63 · The Dashboard's crash card compares unlike runs — opened at v6.29

The card sets `stress.sequence.success` (15 years from today, mortality off, poor returns forced into the first three retirement years) beside
`stress.base30.success` (30 years, mortality on). The difference is partly horizon and mortality, not the crash. Reworded at v6.29 (the card and the Field
Manual) to say so. **Low; display.** Candidate fix: run the sequence stress on the base run's horizon and settings — a change to the stress set.
