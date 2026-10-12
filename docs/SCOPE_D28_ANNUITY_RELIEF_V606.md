# SCOPE — v6.06 · D-28 widened: which states' retirement relief reaches a commercial (non-qualified) annuity

**FULFILLED — shipped as v6.06 (2026-10-12).** Repo-only. §6 is the build record. D-28 closes; D-33 opens.

*(Superseded status line, retained:)* **READY — 2026-10-12.** All four decisions taken (§5) — Steve took every recommendation. Repo-only. A MODELLING release: figures move (conservative direction only), METHODOLOGY changes.
Steve, 2026-10-12: "start on D-28", then *"Census all states first"* when asked how wide the fix should be.

## 0 · Premise (verified against v6.05, not assumed)

Freshness (OPERATIONS §A): repo `a3d0da6` = `origin/main` (the v6.05 commits and the chmod fix), fresh clone; source
`f230ffbbd4f2773f7816769bb726d975` = repo = pool (pool copy hashed after `project_read`) = CHANGELOG newest; built `1c3d9f3a83bcdd6c09fe99fc574b5085` = live Pages.

### 0.1 · What the model does (parser and calculator, v6.05)

- The Other-accounts tax type **`annuity`** is a **non-qualified annuity** (METHODOLOGY: "taxed like pre-tax money but carries no RMD"; a qualified
  annuity inside an IRA is `trad`). Federally the model taxes all of it as ordinary income — the pessimistic simplification METHODOLOGY discloses.
- The state calculator receives it as the `annuity` category of `byPerson` (`attributeRetIncome`, v5.93). AST census of `stateTaxAnnual` calls:
  **three, and all pass `byPerson`** (v6.05 census, unchanged since).
- **25 taxing states give retirement income relief** (`STATE_RULES` evaluated by AST): `retExempt` IA, IL, MI, MS, PA; `excl65` / `exclTest`
  AL, AR, CO, CT, DE, GA, KY, LA, MD, ME, MT, NJ, NM, NY, OK, RI, SC, VA, WI, WV. In **every one the annuity category can use the relief**:
  the household exclusion is netted against `retIncome + pen` (annuity included); the per-person `retExempt` path sums `_ALLK =
  [ira, employer, annuity, pension]`; RI's and WV's per-person lists include `annuity`.
- The example plan holds **$7,000** of annuity money (spouse B, "Spouse B - Annuity"), so the example plan's figures move in the affected states.

### 0.2 · The law, state by state (primary sources; read 2026-10-12)

Five research agents read one group of five states each, from primary sources only; quotes are theirs, joined from the fetch tool's segments.
**Re-read by the build session itself** (marked ✓): PA, NY, WI, MD, IA, OK — every one confirmed. The rest are re-read at the build (§3, B-0).

| State | Relief, as the law defines it | Commercial annuity | Decisive source |
|---|---|---|---|
| **PA** ✓ | eligible employer plans; IRAs from 59½ | **NOT COVERED** — taxable as interest to the extent federally taxable, any age | 2025 PA-40 Instructions, Code 7 caution: *"Distributions from a commercial insurance or mutual company annuity … purchased as a retirement annuity are not distributions from an eligible employer-sponsored retirement plan and are taxable as interest income to the extent they are included in federal gross taxable income"*; PIT Guide, Interest (DSM-12, 10-2025), Act 40 of 2005 |
| **NY** ✓ | $20,000 pension/annuity exclusion, 59½ | **NOT COVERED** | 2025 IT-201-I, line 29, *"does not include: Distributions you received as a result of an annuity contract purchased with your own funds from an insurance company…"* |
| **WI** ✓ | $24,000 from 67, qualified plans and IRAs | **NOT COVERED** | DOR Guidance 100322 (30 Jan 2026), Q1 note: *"Not all payments reportable on federal Form 1099-R are from qualified retirement plans or IRAs (e.g., payments from commercial annuities …)"* |
| **MD** ✓ | pension exclusion, "employee retirement system" | **NOT COVERED** (nor IRAs — already disclosed, not modelled) | Tax-Gen. §10-209(a): a plan *"established and maintained by an employer … qualified under § 401(a), § 403, or § 457(b)"*; IRAs and §408 annuities listed as excluded |
| **IA** ✓ | retirement income exclusion, 55+ | **NOT COVERED** | 701 IAC 302.47(1)"b" (ARC 7502C, eff. 14 Feb 2024): plans not meeting IRC qualification do not qualify — *"(2) Nonqualified annuities."* |
| **OK** ✓ | $10,000 other retirement income | **NOT COVERED** | 2025 Form 511 packet, Sch. 511-A: benefits must be from IRC §401, §457, §408 (IRA/IRA annuity), §403(a)/(b), §402(e) |
| **IL** | subtraction of amounts under IRC §§402(a), 402(c), 403(a), 403(b), 406(a), 407(a), 408 + government plans | **NOT COVERED** (a commercial annuity is taxed under §72, not a listed section) | 35 ILCS 5/203(a)(2)(F), quoted in IDOR letter IT 26-0003-GIL (1 Apr 2026); Publication 120 (Dec 2025) |
| **ME** | pension deduction, "retirement plan benefits" = employer plans + IRAs | **NOT COVERED** | 36 M.R.S. §5122(2)(M-2) definitions |
| **AR** | $6,000, employment-related plans and traditional IRAs | **NOT COVERED** | 2025 AR1000F instructions, line 18B: *"provided the distribution was from public or private employment-related retirement systems, plans, or programs"* |
| **DE** | $12,500 from 60, employer/government pensions or "eligible retirement income" (§4974 plans, dividends, interest, gains, rent) | **NOT COVERED** (a §72 annuity is none of these) | 30 Del. C. §1106(b)(3) |
| **CO** | pension and annuity subtraction, 55+ | **COVERED ONLY IF ANNUITIZED** ("fully matured") | DOR ITT, Social Security, Pensions and Annuities (rev. Jan 2025): *"Amounts received from privately purchased annuities that have fully matured also qualify"* |
| **MI** | retirement deduction (MCL 206.30(1)(f)) | **COVERED ONLY IF PAID FOR LIFE TO A SENIOR** | MCL 206.30(1)(f)(iv): *"benefits from a retirement annuity policy in which payments are made for life to a senior citizen"* |
| **MS** | retirement allowances, pensions, annuities from a "retirement system or plan" | **UNCLEAR** | 35 Miss. Admin. Code Pt. III, 3-02-07-100; no source says whether a commercial contract is a "private retirement … plan" |
| **AL** | $6,000 of "taxable retirement income", 65+ | **UNCLEAR** (the form takes it in) | Code of Ala. §40-18-19(a)(13) undefined; 2025 Form 40 sends all "pension and annuity income" to Schedule RS, whose total caps the exclusion |
| GA | retirement income incl. interest, dividends | covered | DOR, Retirement Income Exclusion |
| KY | "annuity contracts" (IRC §1035 meaning) | covered | KRS 141.019(1)(g) |
| LA | "pension and annuity income" in tax table income | covered | R.S. 47:44.1(A); 2025 IT-540 instructions |
| CT | from federal Form 1040 line 5b | covered | 2025 CT-1040 instructions, line 48b |
| NJ | "any public or private plan" | covered | N.J.S.A. 54A:6-10(b)(1); GIT-1&2 (Jan 2026) |
| RI | "taxable pension and/or annuity income"; 1040 line 5b | covered | Division PUB 2026-01: *"Life insurance annuity contracts"* qualify |
| SC | the 65+ deduction (the one modelled) is against any income | covered | §12-6-1170(B) |
| MT, NM, VA, WV | an age deduction or exemption against any income | covered | MCA 15-30-2120(3)(g); PIT-ADJ 2025; Va. Code §58.1-322.03(5)(b); W. Va. Code §11-21-12(c)(9) "from any source" |

**So the premise holds, and is wider than D-28 said: in ten states the law plainly gives a commercial annuity no relief and the model gives it
some (PA, NY, WI, MD, IA, OK, IL, ME, AR, DE); in two it qualifies only as a life annuity, which the model does not distinguish from
withdrawals (CO, MI); two are unclear (MS, AL).** Every one of these errs **optimistic** — the direction this project least tolerates.

## 1 · The change

- **A row field `reliefKinds`** — the `byPerson` categories (`ira`, `employer`, `annuity`, `pension`) a state's retirement relief reaches. Absent
  means all four (today's behaviour, byte-identical). Set on the affected states without `annuity` (MD also without `ira` if DD-3).
- **The calculator, with `byPerson` only:** (a) the household exclusion is netted against `retIncome + pen` less the categories outside
  `reliefKinds`, so it can never absorb annuity dollars; (b) the per-person `retExempt` path sums `reliefKinds` instead of `_ALLK`, and its
  household gate path subtracts the excluded categories. **Without `byPerson`** (direct callers only; no in-app call) nothing changes — disclosed.
- **Notes** of the affected states say which plan types qualify and that a commercial annuity does not (CO, MI: unless annuitized for life);
  **METHODOLOGY** gains a section; the **Field Manual**'s state-tax paragraph gains one sentence.
- **Not a per-person cap.** The exclusion stays netted at household level as today (per person only where it already is: RI, WV). Capping each
  person's exclusion at that person's own income would move figures for households with no annuity at all — a separate item if wanted.

## 2 · Site census (to be run by parser at the build and recorded in §6)

`stateTaxAnnual` (the exclusion netting, `_rxAmt`, `_rxPerson`, `retBase`), `STATE_RULES` (the affected rows' field and notes), `DOCS_HTML`, and
every suite literal whose outcome the change flips (§B1a literal census) and every derived pin priced in an affected state with annuity money.

## 3 · Tests (new suite `t69`, both legs)

- **B-0** each affected state's source re-read at the build, its verdict recorded beside the row (the six ✓ above already are).
- **A** hand cases to the cent, one per affected state, an annuity-only household and a mixed one: annuity dollars taxed, IRA/employer/pension
  relief unchanged; the v6.05 leg pins today's figures.
- **B** v6.05 → v6.06 over every jurisdiction and a household grid: rows outside the affected states byte-identical; inside, figures rise only
  where annuity money meets relief, and never fall.
- **C extinction** — every state that gives retirement relief carries `reliefKinds` with an explicit decision, so a relief state added later must
  decide its annuity treatment; every affected state's note names the exclusion; no call site loses `byPerson`.
- Controls `qa/tools/controls_v606_annuity.py`: re-admit the annuity in one state, drop the field from one state, break the netting.

## 4 · Out of scope, and stop conditions

**Out:** per-person own-income caps (above); annuitized vs. withdrawal modelling (would need a payout field); the annuity's after-tax basis
(federal simplification, disclosed); SC's under-65 $3,000 retirement deduction (not modelled; if it ever is, the annuity is outside it); state
treatment of IRA early distributions beyond what rows already carry.
**Stop if:** any row outside the affected states moves; any figure falls; MC parity is not 10/10; a re-read at B-0 contradicts §0.2.

## 5 · Decisions for Steve

- **DD-1 · The two unclear states.** **Recommendation:** Alabama stays covered — its revenue department's own form routes all pension and annuity
  income into the exclusion's base; Mississippi becomes not covered — its regulation speaks of a "retirement system or plan", which a privately
  bought contract is not, and the conservative default applies when the law is unclear. Both disclosed in their notes.
- **DD-2 · CO and MI, life annuities only.** The model cannot tell an annuitized contract from withdrawals. **Recommendation:** treat as not
  covered (conservative), and say in each note that an annuity paid for life would qualify.
- **DD-3 · Maryland's IRAs.** Maryland's exclusion does not reach IRAs either; the note already discloses it as "not modelled". The same field fixes
  it. **Recommendation:** include it — same class, same machinery, optimistic today.
- **DD-4 · One release.** **Recommendation:** all of it in v6.06.

**Taken 2026-10-12 (Steve, by question):** DD-1 *"AL covered, MS not"*; DD-2 *"Not covered, disclosed"*; DD-3 *"Include it in v6.06"*; DD-4 follows
(one release). **Affected rows: PA, NY, WI, MD (also IRAs), IA, OK, IL, ME, AR, DE, CO, MI, MS — thirteen.**

## 6 · Build record (v6.06, 2026-10-12)

- **B-0:** the seven states not yet re-read were read by the build session at their primary sources before any code — Maine (36 M.R.S. §5122(2)(M-2)),
  Delaware (30 Del. C. §1106(b)(3)), Michigan (MCL 206.30(1)(f)(iv) and (8)), Arkansas (2025 AR1000F instructions, line 18B), Colorado (DOR publication,
  January 2025), Illinois (35 ILCS 5/203(a)(2)(F) as quoted in IDOR letter IT 26-0003-GIL, 1 April 2026) and Mississippi (35 Miss. Admin. Code Pt. III,
  3-02-07-100). Every one agreed with §0.2; no stop condition fired.
- **Source** `a5ac49a570a2e776a26ad64536420566` (34 anchored edits, each counted once on v6.05: thirteen rows' `reliefKinds`, thirteen notes, the calculator's netting (three
  edits), the Field Manual, four version sites). **Built** `fa02504f34989cb2054de3f5d9e9138f` (`smoke_built` 22 passed, 0 failed).
- **The direction:** 3,264 calls over 51 jurisdictions, rows without the field byte-identical, 238 paying more, all in the thirteen; the differential against the v6.05 calculator with the excluded categories moved to `work` agrees to the cent on every
  affected call (`t69` B-4). MC parity 10/10.
- **Measured** (scratch probe; not shipped): with $70,000 a year of Roth conversions (the Taxes tab), the example plan's lifetime state tax rises in Illinois $1,557 → $1,609, Michigan $986 → $1,030 and Pennsylvania $1,627 → $1,757, and in Maryland $75,530 → $101,679 (its IRA money and the annuity); with the annuity raised to $150,000, Illinois +$1,011, Michigan +$868, Pennsylvania +$2,530, Maryland +$29,224. In the ten other affected states the figure does not move for these households: their exclusion is capped, and the plan's other retirement income already fills the cap. Without conversions only Maryland moves ($108,536 → $120,031): Engine B reaches annuity money through conversions and draws, never through RMDs, and the example plan draws none (checked in Pennsylvania: no draw or conversion year without the slider).
- **Found while measuring:** the conversion pro-rata draw on annuity money — filed as `MissingFeatures.md` D-33, not changed.
- **Found by the first full run, fixed before the final one:** `t67` D-0 failed on both legs — its group-D skip keyed on `app_v604.mjs` being present
  (the v6.04 build's choice), which no v6.05 → v6.06 folder holds. Re-keyed on the leg (skipped on every leg but v6.03's); half A re-run whole.
- **Found by the controls, fixed before the run:** K2 (New York's field removed) first crashed `t69` at C-4, which read the missing field; C-4 now tolerates
  it and C-2 reports it. K6 as first written reverted the per-person path's category list, which `_eligible` also caps, so it changed no figure — two
  defences; K6 now breaks the netting the household-gate states (Illinois, Michigan) rely on.
- **`t69`** 19 (v6.06) / 10 (v6.05). **Controls 7 of 7.**
- **Suite:** 6,360 app checks, 68 suites, 0 failed, 0 DIED; GRAND 6,490. Every current-leg count equals v6.05's, the new `t69` aside; the v6.05 leg equals v6.05's own counts, `t69` aside (10, pinning the absence of the field). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v605 v606 from the build workspace — a full clone of a3d0da6 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.05 resolved from history, commit 11c1d13) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6268, half B GRAND 222; none DIED.
