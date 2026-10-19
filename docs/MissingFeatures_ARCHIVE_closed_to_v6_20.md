# MissingFeatures archive — the write-ups of items closed or fixed, to v6.20

Moved verbatim from `docs/MissingFeatures.md` on 2026-10-19 to recover project-knowledge space (OPERATIONS §G). Repo only; never edited.
Each item keeps its row in the register's index. Sections are in the order they stood.

## §0 · The trace (OPERATIONS §G)

Selected by the index's status column (CLOSED or FIXED), not by heading — a heading match on "CLOSED" also catches "DISCLOSED" (D-37, D-39,
D-44, which stay) — and excluding every ID the register's own "Open, in this file" line names: D-18 is FIXED but recurs every tax year, so
its write-up stays pooled. Every line in these sections that reads as open was read in context: each is a superseded banner from before
the item closed (D-6's "user-side open", D-12's phase banners, D-22's "stays OPEN", D-26's "fix decided", D-30's "batch 2"), a pointer
to an item that has its own row (D-37 from D-36), or a closed descendant — D-2's IRMAA MAGI sentence (S-1), fixed at v5.40 with four
checks. D-23's "Decision D18-3, open for Steve" was taken: D-23 is FIXED v5.87. **Two threads had no other pooled record and were missed by
this trace; an independent second read found them before the package shipped:** D-12's closing banner re-homed its scope's residuals (a
public/private pension flag, inherited IRAs, 457(b)'s penalty exception, Roth subtypes, a second pension for a couple, Iowa's survivor and
disability paths), and its v5.69 finding noted the checklist's 401(k)-to-IRA rollover suggestion against Rhode Island's modification. Both
are now `ARCHITECTUREIssues.md` **E-30** (a) and (b).

## D-1 · The OBBBA senior bonus deduction is modelled by the Taxes engine, absent from the Roth engine, and declared absent by both disclosures — ✅ CLOSED

> ### CLOSED — verified against v5.39 source on 2026-08-18
>
> **All three problems are resolved.** The mechanism split (a) is unchanged and correct; both false
> disclosures (b) have been rewritten.
>
> | Part | v5.39 |
> |---|---|
> | Engine B still models it | **yes** — `seniorBonus` at L5118–5124, inside `computeTaxPlan` |
> | Engine A still does not | **yes** — `seniorBonus` appears at three sites, all in `computeTaxPlan`; the note at L915 states it explicitly |
> | **(a)** Field Manual disclosure | ✅ **FIXED** — now reads that the deduction *"is modeled on the Taxes tab, but not in the Roth conversion ladder."* Accurate, and it names the divergence |
> | **(b)** `METHODOLOGY.md` §5 (L120) | ✅ **FIXED** — now states it **IS** modelled, with the phase-out, the MAGI proxy, and a cross-reference to §7 |
>
> **The statutory parameters are now guarded.** The four figures moved into a named `OBBBA_CONSTS`
> block (L931–937) — `$6,000` per person, `$75,000` single / `$150,000` MFJ thresholds, `6%`
> phase-out, `2028` sunset — each carrying its citation to **P.L. 119-21 §70103**, and
> `METHODOLOGY.md` L442 records that the Verify tab checks them on every load. Through v5.30 they
> were inline literals no staleness mechanism could see. *(Constants checked against the statute;
> the Verify tab's assertion was not executed.)*
>
> **One change the original entry could not have anticipated.** The phase-out's MAGI proxy is
> `grossOrdinary + qdcg_y`, and since v5.36 `qdcg_y = capGains_y + div_y` — so realized drawdown
> gains now push the deduction toward phase-out. The deduction therefore shrinks slightly faster
> than at v5.29. Direction is **conservative**, and `METHODOLOGY.md` L120 describes the proxy
> correctly including gains.

**Priority: 1 — highest.** This is the only item here verified end-to-end, and it is three problems
wearing one coat.

### What the code does

**Engine B (`computeTaxPlan`, the Taxes tab) implements the deduction**, correctly and with the right
statutory parameters — `src/DangerClose.jsx` L4626–4636:

```js
// OBBBA bonus senior deduction: $6,000 per person 65+, tax years 2025–2028 ONLY,
// phasing out at 6% of MAGI above $75K single / $150K MFJ (statutory, unindexed).
let seniorBonus = 0;
if (yr <= 2028) { … 6000 - 0.06 * Math.max(0, magiProxy - bonusThr) … }
```

**Engine A (`runRothStrategies`, the Roth ladder and comparator) does not** — L3677–3679 says so and
gives a defensible reason: *"it expires before typical conversion windows and would make the
bracket-fill solver circular (the deduction depends on MAGI, which depends on the conversion)."*
`projectBrackets` (L8280, the Roth tab's bracket projection) likewise applies only `seniorExtraFor`.

AST census confirms the phase-out arithmetic exists at **exactly two sites, both inside
`computeTaxPlan`**.

### The three problems

**(a) The user-facing disclosure is false.** Field Manual §13 (`DOCS_HTML`, L3464) states:

> **The temporary OBBBA "senior bonus" deduction (up to $6,000/person 65+, tax years 2025–2028,
> income-phased) is NOT modeled.** Its omission makes near-term tax projections slightly conservative
> (overstated) for moderate-income 65+ households — a deliberate simplification for a provision that
> expires mid-plan.

It **is** modelled, on the Taxes tab. And the second sentence inverts the direction of error: the
disclosure tells the user their near-term tax is *overstated* when for 2025–2028 the Taxes tab has
already taken the deduction, so it is not. **For a deliberately pessimistic tool, this claims
pessimism the model does not have** — the direction the project's own design defaults call out as the
wrong way to be wrong.

**(b) `METHODOLOGY.md` §5 (L120) repeats the false claim, while §7 (L151–154) states the truth in
full.** §5 says the deduction "is deliberately omitted — a conservative simplification". §7 says:

> "Separately, and deliberately, **neither the ladder nor the comparator** models the OBBBA $6,000
> bonus senior deduction (tax years 2025–2028): it expires before typical conversion windows, and
> modelling it would make the bracket-fill solver circular… **The Taxes tab does model it, so the two
> tabs differ for any ladder year at or before 2028.**"

§7 is **accurate and complete** — it names the divergence, the engine that has it, the reason, and
the years affected. §5 is stale. The correct replacement wording therefore already exists in the same
file, which makes the fix cheaper and removes any need to invent language.

> ⚠ **CORRECTED 2026-08-12, same session.** This paragraph first read *"`METHODOLOGY.md` contradicts
> itself… L151 says the comparator models the OBBBA bonus."* **That was my misreading**: I took
> "comparator models the OBBBA $6,000 bonus senior deduction" out of the middle of the negation
> "neither the ladder nor the comparator models…". §7 was right all along. The error is the same
> shape as the one OPERATIONS records against the Engine D `magi` finding — a conclusion drawn from a
> partial read of a sentence — and it is recorded here rather than only in chat, per the project's
> own rule on owning errors in the deliverables.

**(c) Two tabs disagree for 2025–2028 — disclosed in METHODOLOGY §7, undisclosed in Field Manual
§13.** The Taxes tab applies the deduction; the Roth tab's ladder, bracket-fill solver and break-even
do not. A reader of METHODOLOGY §7 learns this; a reader of the Field Manual — the document users
actually read — is told the opposite. Both read the same conversion slider and are presented as
views of one plan. For a 65+ household with MAGI below the phase-out ceiling this makes the Roth
tab's marginal-rate arithmetic — the input to *"how much should I convert"* — systematically
different from the tax the Taxes tab reports for the same year.

### Boundary test

**Occurs for a mainstream couple within sight of retirement?** **Yes, squarely.** 65+, MAGI under
$150K MFJ, tax years 2025–2028 — this is the modal early-retirement window for the app's whole
audience, and it is *now*, not a tail case.

**Makes an existing output more correct?** **Yes.** It reconciles two existing tabs. It adds no new
output.

### Suspected cause

v5.16's `taxFactsFor` extraction deliberately kept the bonus out of the shared accessor (L829–831),
recording an intended split — "Engine A models it on the conversion side and Engine B in the
schedule." Engine A's side was never built (or was reverted for the circularity reason), Engine A's
own comment recorded that decision, and neither disclosure was revisited. The false §13 text has
therefore been true of *no* build since Engine B gained the deduction.

### Severity and exposure

**Severity: high** for (a) — a false user-facing disclosure about tax treatment, in the document
users actually read, stating the wrong direction of error. **Medium** for (c).

**Exposure: user-side** for (a) and (c); creator-side for (b).

### Recommended shape (finding, not fix)

Three separable pieces, and they should not be one release:

1. **Correct §13 and `METHODOLOGY.md` L120** to state what is actually true — modelled in the Taxes
   engine, not in the Roth ladder, and why. This is a disclosure fix and carries the §B2 obligation
   to find *every* assertion checking the old copy and invert it, **gated to the builds each is true
   for**.
2. **Decide** whether Engine A should model it. Engine A's circularity objection is real; the Roth
   solver is a fixed-point on SS taxability already, and adding a MAGI-dependent deduction inside it
   is not free. "Leave Engine A alone and disclose the divergence" is a legitimate answer.
3. **Move the four constants into `TAX_CONSTS`** — that is E-2 in `ARCHITECTUREIssues.md`, and it is
   the piece with a 2028 fuse on it.

---

## D-2 · Realized capital gains are never generated by ordinary drawdown — ✅ CLOSED v5.36

> ### ✅ CLOSED AT v5.36 — verified against v5.39 source on 2026-08-18
>
> The release is titled *"the drawdown realizes capital gains, and the tax engines consume them"*
> (2026-08-16). The finding below is accurate for v5.29 and **false for anything from v5.36 forward**.
>
> | Site in v5.39 | What it does |
> |---|---|
> | L4742–4742 | Engine D: `_gainShareOfPool` → `_saleFromGain = _spendFromTaxable × _gainShareOfPool` — **ordinary spending from the taxable sleeve realizes gain** |
> | L5096 | Engine B: `const capGains_y = Math.round(_gainByYr[yr] \|\| 0)` — **no longer `0`** |
> | L9427–9433 | withdrawal schedule wired into `computeTaxPlan` |
> | L9710–9712 | withdrawal schedule wired into `computeIrmaaPlan` — so the gains **do** reach MAGI and IRMAA |
> | L9553, L9610 | rendered as its own column and row |
>
> The surrounding work: **v5.34** built the conversion-funding basis tracker, **v5.37** made ordinary
> money's growth accrue and be taxed, **v5.38** taxed the ACA-premium sale's gain and fed it to the
> IRMAA lookback. The "no cost-basis input" blocker named under **Shape** below was solved with the
> blended-basis approach that section proposed.
>
> **One live descendant:** the IRMAA tab's MAGI sentence (L9792) still does not name `capGain_y`,
> so the tab explains IRMAA without mentioning the gains v5.36 added to it. Tracked as **S-1** in
> `AUDIT_PHASE3_SECTION_D_SWEEP.md`, now widened. Low, user-side, safe-direction.

**Priority: 2.** *Disclosed limitation* — METHODOLOGY §12 and the Taxes tab micro-note both state
that *"realized cap gains default to $0 unless a sale is modeled."*

**What.** The only path that realizes gains is the Roth conversion-tax funding model (the appreciated
brokerage sale, which grosses up and feeds MAGI). Ordinary spending from the taxable sleeve realizes
nothing. Engine D's `magi` correctly excludes `drawFromTaxable` as return of basis (L4387), and
Engine B sets `capGains_y = 0` — the two engines are consistent, and that consistency is documented.

**Why it ranks high anyway.** The direction is **optimistic**: a household spending down a
long-held, highly-appreciated brokerage account pays no capital-gains tax anywhere in the model, and
that money also never enters MAGI, so it never trips IRMAA or the ACA cliff either. The project's
stated design default is to pick the direction that makes the plan look *slightly worse*. This picks
the other one, and compounds across the whole horizon.

**Boundary test.** Occurs for a mainstream couple — **yes**, any household with a taxable brokerage
account of long standing. Makes an existing output more correct — **yes** (lifetime tax, MAGI, IRMAA,
ACA all move). No new output.

**Shape.** The blocker is that the app has no cost-basis input. A single blended basis fraction per
account — the same simplification the conversion-tax funding model already uses and already discloses
("one blended gain share for the whole account, all long-term, no per-lot selection") — would be
consistent with existing precedent and would not require per-lot tracking.

**Severity:** medium-high, because of the direction. **Exposure:** user-side.

---

## D-3 · Progressive state schedules are approximated by an effective flat rate — ✅ CLOSED v6.01

> ✅ **CLOSED v6.01 (2026-10-09).** Every progressive state is taxed on its own schedule — ten from v6.00, the other seventeen from v6.01 (D-22). What remains
> of this item's over-taxing direction is the absence of state standard deductions, exemptions and credits, now **D-30**. *(The entry below is retained.)*

> ### ⚠ DIRECTION CORRECTED 2026-08-19 — measured against v5.40, and the finding splits
>
> ⚠ **v5.48: this box HOLDS, and a NEW sub-item D-3c runs the OTHER WAY — income-limited
> exclusions applied unconditionally, which UNDER-taxes. See the v5.48 re-pin block at the top.**
>
> **This entry's direction is wrong.** The approximation was recorded as *"Not uniform"* and was
> reasoned about downstream as under-taxing high earners and flattering a plan. **It over-taxes**
> across the entire mainstream range.
>
> New York, MFJ, both 67, sourced 2026 schedule (Form IT-2105-I; $16,050 MFJ standard deduction;
> $20,000/person pension exclusion 59½+):
>
> | NY retirement income | Model | Actual | Direction |
> |---|---|---|---|
> | $80,000 | $2,400 | $971 | over-taxes |
> | $120,000 | $4,800 | $3,121 | **over-taxes by 54%** |
> | $250,000 | $12,600 | $10,303 | over-taxes |
> | $600,000 | $33,600 | $33,050 | over-taxes |
> | $900,000 | $51,600 | $53,600 | under-taxes |
>
> The direction reverses only between **$600,000 and $900,000** of annual retirement income — outside
> this project's own boundary test. Engine figures executed from shipped v5.40 source, matching hand
> arithmetic to the dollar. **Direction is therefore CONSERVATIVE**, the safe side for this tool.
>
> **Two causes:** `stateTaxAnnual` (L1091) models **no state standard deduction**, and each flat rate
> approximates a mid-to-upper *marginal* rate rather than an effective one.
>
> **The finding splits, and the halves have different urgency:**
>
> - **Disclosure half — ⚠ OVERSTATED, corrected 2026-08-20, now LOW.** As written on 2026-08-19 this
>   said six states (HI, MN, NJ, NY, VT, WI) collapse a graduated schedule with **no note admitting
>   it** while four (CA, DC, MD, OR) disclose it, and called that D-3's defensible core. **False on
>   both counts.** The approximation is disclosed in three places — Field Manual §13, the Field
>   Manual's Taxes tab entry, and `src/DangerClose.jsx` **L11889**, which renders *"2026 approx: X.XX%
>   effective … — [note]. Verify against your state's rules."* *(from v5.86: "Model: X.XX% effective rate (an
>   approximation) … — [note]. Dollar figures by tax year: …" — the rate disclosure stands; D-18)* beneath the My Data selector for **every**
>   jurisdiction. All six named states carry notes. And Maryland was misfiled: its note says
>   *"effective"* but never *"progressive"*, so the disclosing set is **three** — CA, DC, OR — against **30**
>   whose notes say nothing about the shape of the schedule (26 excluding the four `retExempt` states). The exact count in between is **unmeasured**. What is left: **per-state `note`
>   detail is inconsistent, severity Low**, plus the setup wizard's state picker (L3393) showing no
>   note at all. **Do not ship a release for this** — let the note tidy ride along with the next
>   release that opens `STATE_RULES`. Full working: `AUDIT_D3_STATE_TAX_DIRECTION.md` §3.
> - **Precision half — HELD, and de-prioritised.** Its rank rested on the direction. Full graduated
>   brackets are **declined**: ~300 numbers across 51 jurisdictions re-indexed annually, and a stale
>   bracket table is worse than an honest flat approximation because it looks precise. If it proceeds,
>   prefer **recalibration** — a per-state standard-deduction field plus rates re-derived as effective
>   rates against a reference retiree household (~102 numbers, no structural change).
>
> **Limits:** only New York is verified against a sourced schedule. California is **indicative only**
> (recalled brackets). HI, MN, VT, WI are **unmeasured** — and the "missing note" half of the reason
> they were listed is **withdrawn** (2026-08-20). **Every state a recalibration would touch needs the
> New York treatment before it ships**, and the set is a census that has not been run, not the six
> named above.
>
> **Separate item found in passing:** the engine returns **$0** New Jersey tax for this household
> (`excl65: 75000 × 2` exceeds the income). NJ's real exclusion is generous and income-limited and the
> note calls it *"approximated as unconditional"*, so this may be roughly right or may be a distinct
> defect. **Unmeasured, asserted neither way.**
>
> Full evidence: `AUDIT_D3_STATE_TAX_DIRECTION.md`.


**Priority: 3.** *Disclosed limitation* — Field Manual §13, the module header, and each state's own
`note` string. Sub-phase 2E verified the module implements its documented approximation correctly and
explicitly ruled the approximation itself out of scope; the Phase 3 brief asks the different question:
*does the approximation deserve a feature?*

**Assessment: yes, but it is the largest item here and its direction of error is not uniform.**

> ⚠ **The paragraph immediately below is SUPERSEDED** — measured 2026-08-19 and false for this app's
> population. It is kept because it is the reasoning that drove the priority, not because it is right.
> The crossover it assumes sits at ~$600–900K of retirement income in New York, not in the mainstream
> range. See the box at the top of this entry.

An effective rate under-taxes a high-income household in a steeply progressive state and over-taxes a
low-income one. So unlike almost every other simplification in this app, **it is not reliably
conservative** — it can flatter a plan. That is what distinguishes it from, say, the LTC gross-cost
choice, which is deliberately pessimistic.

**Boundary test.** Occurs — **yes**, for every user outside the nine no-tax states. More correct —
**yes**. But the work is 51 jurisdictions × bracket tables × filing status × indexation rules, plus
the annual refresh burden that E-2 already shows the project struggles to keep visible.

**Shape.** Worth its own scope, and worth considering a partial: the handful of states with the
steepest schedules and the largest retiree populations, with the rest left on effective rates and the
split disclosed. A staged approach fits this project's release discipline better than a 51-state
rewrite.

**Severity:** medium. **Exposure:** user-side.

---

## D-6 · IRMAA life-changing-event relief (SSA-44) appears to be unmodelled and undisclosed — ✅ CLOSED v5.49

> ⚠ **HALF-CLOSED at v5.48 — see the v5.48 re-pin block at the top.** `METHODOLOGY.md` now names
> SSA-44 and work stoppage; the render tree and Field Manual still carry **zero** mention of either.
> Creator-side closed, **user-side open** — and user-side is where this entry sets its exposure.

> ### ⚠ CORRECTED 2026-08-18 — the v5.31 sweep resolved this too broadly
>
> `AUDIT_PHASE3_SECTION_D_SWEEP.md` §3.3 reclassified D-6 as **"disclosed, not a gap"**, on the
> grounds that `METHODOLOGY.md` states the life-changing-event reassessment is not modelled. **That
> disclosure exists, and it is narrower than this item.** `METHODOLOGY.md` L696–699:
>
> > *"Social Security's life-changing-event redetermination — which lets a **survivor** ask SSA to
> > reassess IRMAA on more current income **after a spouse's death**, rather than on the two-year-old
> > joint return — is not modeled."*
>
> The mechanism is named generically in the opening clause, but the sentence's subject and only
> illustration is the **death-of-spouse** trigger. **This item is about work stoppage** — which the
> entry below calls *"the single most common trigger for this form"* and the one that *"applies
> precisely to the population this app is built for."*
>
> A newly-retired, non-widowed household reading that sentence learns that a survivor can appeal.
> It does not learn that **retiring** is itself an enumerated life-changing event on SSA-44.
>
> **Verified at v5.39:** `SSA-44`, `life-changing` and `work stoppage` return **zero hits** in the
> source render tree and **zero** in the decoded Field Manual. The disclosure exists in exactly one
> place, `METHODOLOGY.md`, in the survivor form.
>
> **Reclassify as: disclosed for the death-of-spouse trigger, undisclosed for work stoppage.**
> Severity stays **Low** — direction is conservative either way, since the model charges IRMAA the
> household may successfully appeal away. The fix is a clause, not a feature: naming work stoppage
> alongside the survivor case.
>
> *This is a correction to a sweep finding, not to the entry below, which was right to flag D-6 for
> verification. The sweep's own rule — "'Undisclosed' requires looking everywhere" — has a converse
> it did not state: **finding one disclosure does not establish that the gap is disclosed.***

**Priority: unranked — flagged for verification before it is trusted.**

**What.** IRMAA uses a two-year MAGI lookback, which the app models faithfully (Phase 2B verified
tier selection, lookback and indexation across 78 checks; v5.14 fixed the premium-year-vs-MAGI-year
error). The consequence for a *newly retired* household is that the first Medicare years are priced
off working-income MAGI. SSA form **SSA-44** exists for exactly this: "work stoppage" is an
enumerated life-changing event, and it lets a retiree ask SSA to use current-year income instead.

Retirement is the single most common trigger for this form, and it applies precisely to the
population this app is built for.

**Direction of error is conservative** — the model charges IRMAA the household may successfully
appeal away, so it overstates cost. That is the right direction for this tool, which is why this is
ranked as a candidate rather than a defect.

**Why it is not confidently a finding.** I found no mention of SSA-44 or life-changing-event relief
in `METHODOLOGY.md` §8, Field Manual §13, or the IRMAA tab entry. **I did not search exhaustively**,
and manifest item 7 records this project asserting "undisclosed" wrongly after checking two places.
**Verify against the full manual and METHODOLOGY before treating this as undisclosed.**

**If confirmed.** The feature is small and does not need to model the appeal — a disclosure that the
first Medicare years may be appealable, with a pointer to SSA-44, would close it. That makes an
existing output (the IRMAA tab's early-year surcharges) more correctly *understood* without changing
a figure.

**Severity:** low as modelling; medium as disclosure, because the sums are real (~$1,000+/yr per
person per tier) and the remedy is a form. **Exposure:** user-side.

---

## D-12 · Account type (IRA versus employer plan) and per-person retirement income — opened at v5.69 — ✅ CLOSED v5.95

> ✅ **D-12 CLOSED v5.95 (2026-10-07) — all three phases shipped.** RI, IA, PA, MS and WV apply their rules per person and (RI, PA, MS) by plan type;
> the survivor-slot defect found at the build is fixed with it. Scope `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` FULFILLED (repo-only). **Residuals,
> re-homed here from the scope's out-of-scope list (§G):** a public/private pension flag (WV's public-pension offsets); inherited IRAs; 457(b)'s
> penalty exception; Roth subtypes; a second pension for a couple (P3-1: one pension, one owner, disclosed); Iowa's survivor and disability paths.
> New items from the build: **D-27** and **D-28** below.
>
> *(Superseded, retained:)* > 🟡 **D-26 SHIPPED v5.94 (2026-10-06)** — the base Phase 3 builds on is complete: the spending draw now reaches the state calculator and sits
> inside the per-person split (P2-6 superseded by D26-2; `byPerson.draw` is an of-which, never to be added again). **Open:** Phase 3, **v5.95**.

> 🟡 **PHASE 2 SHIPPED v5.93 (2026-10-06): carried, not yet used.** Engines A and B pass the state calculator each person's retirement income by
> plan type, the pension by owner and the draw separately, through one shared `attributeRetIncome`; the calculator ignores it, no figure moves
> (`qa/t57_attribution_carry.mjs`). **There is no v5.92** (tag collision with the retired v5.9.2 leg). **Open:** Phase 3, **v5.95** (RI, IA, PA, MS, WV),
> after the spending-draw fix (**D-26**, v5.94). Still to decide for Phase 3: a couple with a pension each. Record: the scope's §9.

> 🟡 **PHASE 1 SHIPPED v5.91 (2026-10-06): collected, not yet used.** Plan type (IRA / employer plan) on every row holding Traditional money,
> and the pension's owner; defaults IRA and A; no figure moves (`qa/t56_plan_type_collect.mjs`). **Open:** Phase 2 (v5.92, carry them through the
> engines) and Phase 3 (v5.93, use them in RI, IA, PA, MS, WV). **New finding for Phase 3:** the pension is one household amount with one owner, so a
> couple with a pension each cannot record the split — decide before per-person caps use it. Record: `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` §8.

**Opened 2026-09-10 by `docs/SCOPE_RI_POPULATE.md` decision D-RI-1 (approved).** Rhode Island's modification (§ 44-30-12(c)(9))
covers Form 1040 line 5b income — pensions, annuities, 401(k), 403(b), 457(b), TSP — and **no IRA of any kind**. It is also
capped at each person's own qualifying income, and only a spouse at full retirement age counts. **The model can express none of
the three**: `OTHER_TAX_TYPES` maps IRA, rollover, 401(k), 403(b), 457, pension, SEP and SIMPLE all to `trad`; positions carry
`trad`/`roth` dollars and an owner but no plan type; the pension input has no owner; and `stateTaxAnnual` receives household
totals only. v5.69 models the AGI cliff and **discloses** these three, each of which overstates the exclusion.

**Priced at scope time through `stateTaxAnnual`** (flat 5%, `ss` 0.5 held fixed): an $80,000 IRA-only couple is under-taxed
$4,000.00/yr; a couple whose $90,000 pension is all one spouse's, $2,000.00/yr; a couple where only the spouse under full
retirement age holds $80,000 of 401(k) income, $2,500.00/yr.

**Why it is its own item.** A plan-type field touches saved data (migration and defaults for every existing backup), every
traditional position and account, and how each engine sources a distribution — a data-model feature, not a populate. It
passes the product boundary test (a mainstream couple within sight of retirement; it corrects an existing output). ⚠ The
app's own retirement checklist suggests considering a 401(k)-to-IRA rollover; for a Rhode Island household below the cliff
that forfeits the modification. **Not a decision here** — recorded so the scope that picks this up weighs it.

---

## D-14 · Traditional spending withdrawals never reach the Taxes tab — ✅ FIXED v5.74

> **⚠ FIXED at v5.74 (2026-09-21)** — the Taxes and IRMAA tabs now take the plan's spending draws from the Withdrawal plan
> through one shared bridge (`docs/SCOPE_TAXES_DRAWDOWN.md`, retired with its build record; C-8 in
> `FlawsToFix-v5_73-Phase2.md`). *Annotation only; the entry below is as written at v5.73.*

**The feature that is missing is a single drawdown shared by the Taxes and Withdrawal tabs.** Engine B (Taxes) and
Engine D (Withdrawal) are independent projections joined only by the realized-gains series (v5.32 D-4). Engine D funds
spending from Traditional money before RMD age; Engine B never sees those draws and computes RMDs on a balance that was
never drawn. On the shipped example household the Taxes tab shows **$0 federal tax in 2032–2038** while the plan draws
≈$238,000 of Traditional money, and projects **$1.63M** of lifetime RMDs against the plan's **$1.02M**. The defect, its
figures and its cause are **C-8** in `FlawsToFix-v5_73-Phase2.md`; it is listed here because fixing it is a feature — an
engine relationship — rather than a line edit. **Priority 1.** Passes the product boundary test (it corrects an existing
output).

## D-17 · The Additional Medicare Tax (0.9%) is not modelled — ✅ CLOSED v6.14

> ✅ **CLOSED v6.14 (2026-10-15).** Modelled (scope DC-2): 0.9% on the household's wages above $200,000 Single / $250,000 joint, not
> indexed (26 U.S.C. §3101(b)(2); IRS Instructions for Form 8959), on the year's filing status, in one helper Engines A and B call. The
> scope's census found the same three lines also capped Social Security wages once per household instead of once per earner — **C-14**
> in `docs/FlawsToFix-v5_73-Phase2.md`, fixed in the same release and the larger error (two $150,000 earners: $6,461 a year against D-17's
> $450). `docs/SCOPE_D17_PAYROLL_TAX_V614.md` (fulfilled, repo-only); `qa/t77_payroll_tax.mjs`. *(The entry below is retained.)*


The additional 0.9% Medicare tax on earned income above $200,000 / $250,000 joint (as stated in SSA's 2026 COLA fact sheet) appears nowhere in the
source (a parser census of numeric literals finds no `0.009`), and METHODOLOGY does not mention it. It reaches only
households still earning above those thresholds, which the app models in pre-retirement years. **Low.** Disclosure is the
cheap half.

## D-19 · The seven half-rate Social Security states need re-checking against current law — ✅ FIXED v5.85

> **FIXED at v5.85** (`docs/SCOPE_SS_STATES.md`): each of the seven now follows its own statute (`ssRule`), and Utah's rate is
> 4.45 % (S.B. 60). Read against primary sources 2026-09-29; the remaining approximations are listed in METHODOLOGY.

`ss: 0.5` stands for "income thresholds that exempt most retirees" (`stateTaxAnnual`, the ss-factor comment). Montana's
0.5 had described pre-2024 law for two years before v5.73 corrected it. CO, CT, MN, NM, RI, UT and VT keep 0.5; each should
be read against its current statute. Filed as a lead in `FlawsToFix-v5_69-Phase1.md`. **Medium** — the error is
directional per state and large relative to the other state items.

## D-20 · Montana's base should reflect federal deductions — ✅ CLOSED v6.04

> ✅ **CLOSED v6.04 (2026-10-11).** v6.02 took the federal standard deduction, with its 65+ additions, that Montana starts from; v6.04 took the
> federal senior deduction (2025–2028). Both are in `STATE_RULES.MT.deduct` and Montana's note. *(Closed in the census of 2026-10-11; the entry below is retained.)*

Montana starts from federal taxable income, so the federal senior bonus (2025–2028) and the age-65 extra lower Montana's
base. The model's state measure is AGI-like and does not subtract them. Disclosed in METHODOLOGY at v5.73. **Low.**

## D-21 · West Virginia's $8,000 is not additive to its Social Security modification — ✅ FIXED v5.89

> ✅ **FIXED v5.89 (2026-10-02).** W. Va. Code §11-21-12(c)(9)(ii), read at the build: each person's $8,000 is reduced by that
> person's taxable SS (the (c)(8) modification). Modelled per person (D21-A) through the new `seniorVsTaxableSS` field; MD/ME/CO untouched.
> Held by `qa/t54_wv_senior_modification.mjs`. The law's other offsets (public pensions etc.) remain unmodelled — D-12. Record:
> `docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md` §7. *(The entry below is the v5.86 finding, retained.)*

Filed at v5.86 (`docs/SCOPE_D18_STATE_FIGURES.md` §1c). Per the WV Tax Division, a taxpayer 65+ receives the **higher** of the
$8,000 senior modification or the sum of the other modifications, Social Security included — and from TY2026 Social Security is
fully exempt. A retiree whose benefit is $8,000 or more therefore gets nothing further; the model grants both, so it is
**optimistic by up to $8,000 per person per year** in West Virginia. A modelling rule, not a stale figure. The obvious mechanism
(`ssOffset`) is reserved for MD/ME by the v5.56 decision, so the fix needs its own scope. Settled 2026-09-29: its own release,
after v5.86. **Medium** — optimistic, and large relative to WV's other figures.

## D-22 · The 42 nonzero state rates have not been re-read — ✅ CLOSED v6.01

> ✅ **CLOSED v6.01 (2026-10-09) — option 3, batch 2: the seventeen remaining progressive rows are on their own schedules.** AL, AR (Act 1 of 2026, top 3.7 %,
> with its high-income table and bracket adjustment), CT (with the 2 % phase-out and the recapture amounts), DC, DE, HI (with Act 24's 13 % from 2027), KS, MD
> (with the county tax at 3.30 % and the 2 % capital-gains tax), ME (with the 2026 surcharge), MO, MT, ND, NE, NM, RI (with the 2027+ surtax at 3 %), VT and
> WV (SB 392 of 2026), each read at its primary source. `qa/t65_state_brackets_b2.mjs` asserts the extinction: every taxing row is on its own schedule or is
> one of the fifteen flat-rate states, all read at v5.99. Scope `docs/SCOPE_D22_BRACKETS_V601.md` (fulfilled, repo-only). **Follow-ups opened:** D-29
> (Missouri's capital-gains subtraction) and D-30 (state standard deductions, exemptions and credits). *(The history below is retained.)*

> 🔶 **OPTION 3, BATCH 1 DONE v6.00 (2026-10-09) — ten states on their own bracket schedules.** Steve chose option 3 after v5.99: the progressive states'
> real schedules, read from the law. CA (TY2025 + the BHST), MN, MS, NJ, NY (with its recapture), OK, OR, SC (Act 110), VA and WI, each read at its primary
> source. `qa/t64_state_brackets.mjs`; scope `docs/SCOPE_D22_BRACKETS_V600.md` (fulfilled, repo-only). **Seventeen progressive rows remain on one rate:**
> AL, AR, CT, DE, DC, HI, KS, ME, MD, MO, MT, NE, NM, ND, RI, VT, WV. **Recommended alongside them:** state standard deductions and exemptions (none is
> modelled in any state today — conservative), which the same sources give.

> 🔶 **BATCH 1 DONE v5.99 (2026-10-09) — the thirteen flat-rate states.** AZ, CO, ID, IL, IN, IA, LA, MA, MI, MS, NC, OH, PA read at primary sources for
> TY2026; Idaho (5.3 %), Indiana (2.95 %) and Ohio (2.75 %, top-rate convention, $384.38 a year overstated above $26,050) corrected; every note names its
> rate, year and source. `qa/t63_flat_rates.mjs`; scope `docs/SCOPE_D22_FLAT_RATES_V599.md` (fulfilled, repo-only). **27 rows remain, mostly progressive:
> the table mixes top-rate, effective-rate and middle-bracket conventions, so the next batch needs one convention decided first (Steve).**

> 🔶 **PARTLY FIXED v5.97 (2026-10-08) — Georgia and Oklahoma, the two known misses.** Georgia 4.99 % (O.C.G.A. §48-7-20(a.1), HB 463, TY2026) and
> Oklahoma 4.5 % (HB 2764, 68 O.S. §2355, the top rate), each read at a primary source and recorded in the row's note; `t61` holds every note that
> states a rate for a year to the row's own rate. **The other 40 nonzero rates are still unread — this item stays OPEN.** Scope
> `docs/SCOPE_D22_GA_OK_RATES.md` (fulfilled, repo-only). *(The entry below is the v5.86 finding, retained.)*

Filed at v5.86 (D-18's scope called it D-18b). D-18 dated the dollar figures and deliberately left the effective rates undated
(decision D18-1), because none was re-read. Secondary sources already suggest two are stale for TY2026: **Georgia 4.99 %** (model
5.19 %; HB 463, May 2026, retroactive) and **Oklahoma 4.5 %** (model 4.75 %; HB 2764). Both would lower modelled tax. The other
40 are unmeasured, and Kentucky's own note says to check the year. Each rate should be read at a primary source and, once read,
can carry a year like the dollar figures. **Medium** — two known misses, direction mixed across the rest.

## D-23 · Two exclusions start earlier in law than the model applies them — New York, Arkansas (decision D18-3 open) — ✅ FIXED v5.87

> ✅ **FIXED v5.87 (2026-10-01) — and the class was six notes, not two.** Steve answered D18-3 (as D23-A/B/C) "yes"; the build's
> census then found Georgia (a 62–64 tier the model does not apply), Iowa and Pennsylvania (ages the model ignores — **optimistic**)
> and Oklahoma (silent, as Arkansas). D23-D/E: all six notes rewritten in v5.87; the modelling for Iowa and Pennsylvania is **D-24**.
> Every note is now held to the model's age by `qa/t52_age_start_notes.mjs`. The generated "65+" summary in the same My Data line was
> found at the build and is **D-25**. Record: `docs/SCOPE_D23_AGE_START_NOTES.md` §7–§8. *(The entry below is the v5.86 finding, retained.)*

Found at v5.86 (`docs/SCOPE_D18_STATE_FIGURES.md` §3b item 5, §6a). **New York** allows its $20,000 pension-and-annuity exclusion
from 59½; the model applies it from 65 (no `exclAge`), **and New York's in-app note says "59½+" — so the note misdescribes the
model.** **Arkansas** allows its $6,000 for IRA money from 59½ and for employer plans at any age; the model applies it from 65 and
its note does not say so. Both overstate tax (conservative). **Decision D18-3, open for Steve:** (a) correct New York's note to say
the model applies it from 65 — one clause, the same kind of correction as South Carolina's at v5.86; recommended, because a note
that misdescribes the model breaks the "simplifications are disclosed, never silent" rule; or (b) review with Arkansas. Changing
the modelled ages is a separate question (the app has one age per person and no account-type split — D-12). v5.86 ships **without**
the New York clause. The edit under (a), in full: New York's note `$20K/person pension & annuity exclusion 59½+; NYC local tax not
modeled` becomes `$20K/person pension & annuity exclusion — applied here from 65, although the law allows it from 59½
(conservative); NYC local tax not modeled`. **Low** in dollars, but a disclosure defect.

## D-24 · `retExempt` has no age gate — Iowa and Pennsylvania exempt retirement income below the law's age (optimistic) — ✅ FIXED v5.90

> ✅ **FIXED v5.90 (2026-10-02).** Iowa 55, Pennsylvania and Mississippi 60 (59½ in whole years) with pensions in payment exempt at any age,
> joint returns only when both spouses qualify (D-12 for the exact answer); Michigan capped at TY2025's $65,897 / $131,794; Illinois unchanged. All fourteen
> rows reviewed: nine have no income tax. Oklahoma kept at 65 (statute unread). Held by `qa/t55_retexempt_age.mjs`. Record:
> `docs/SCOPE_D24_RETEXEMPT_AGE.md` §6. *(The entry below is the v5.87 finding, retained.)*

Found at the v5.87 build (`docs/SCOPE_D23_AGE_START_NOTES.md` §7a, measured through the shim). `stateTaxAnnual` computes
`retBase = r.retExempt ? 0 : …` with no age test, so every one of the fourteen `retExempt` rows (AK FL IL IA MI MS NV NH PA SD TN TX
WA WY) exempts retirement income at any age. **Iowa**'s exclusion requires 55 or older on 31 December, disability, or a qualifying
survivor, per spouse (Iowa DOR, Retirement Income Tax Guidance, read 2026-10-01); **Pennsylvania** taxes IRA distributions before
59½ and employer-plan payments before the plan's own retirement age or service (DOR rev-636; PA-40 instructions). The model is
therefore **optimistic** for a retiree younger than those ages — $0 Iowa or Pennsylvania tax on $50,000 of IRA income at 50,
measured. v5.87 discloses this in both notes; it does not change the model. **The scope should re-read the law for all fourteen
rows** (only Iowa's and Pennsylvania's were read at v5.87), add a per-row age (as `exclAge` does for exclusions), and
apply it per person — `retIncome` is household-level, so this is D-12's territory. **Also here: Oklahoma's age condition.** OAC
710:50-15-49 (read 2026-10-01) states no age test for private retirement income in its general rule but exempts disability benefits
"without regard to age", and secondary sources disagree (none vs 65); the model applies 65 and the v5.87 note claims no law age. Rank
beside D-21, the other known optimistic item. **Medium** — optimistic, but only for retirees under 55–59½ in two states.

## D-25 · My Data's generated summary says "65+ exclusion" for every state, whatever age the model applies — ✅ FIXED v5.88

> ✅ **FIXED v5.88 (2026-10-01).** The summary now reads "$12,500/person exclusion from 60" / "…at any age": the engine's own age rule
> and its exact figure (D25-A (a), D25-B (a)). Held by `qa/t53_mydata_summary_age.mjs` against the engine's measured onset for all 18 rows.
> Record: `docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md` §7. *(The entry below is the v5.87 finding, retained.)*

Found at the v5.87 build, by `t52`'s DOM read of the My Data line. The line's summary (the `excl65` branch of the JSX that renders
`Model: … effective rate (an approximation)`, `MyDataEditor`) is the literal `` ` · $${…}K/person 65+ exclusion` `` for every row with
a dollar exclusion. It misstates the modelled age for **Delaware** (60), **Kentucky** (any age), **Rhode Island** and **Wisconsin**
(67) — Wisconsin's line reads "65+" immediately before a note saying "from age 67". Pre-existing since `exclAge` arrived at v5.55;
not made worse by v5.87, and deliberately not widened into it (a new site mid-build). **Fix, designed:** render the age from the
same rule the engine uses — `exclAge ?? 65`, with 0 shown as "any age" — and extend `t52`'s extinction to the generated summary.
(Separately, `toFixed(0)` shows Delaware's $12,500 as "$13K"; cosmetic.) **Low** in dollars, a disclosure defect; presentation-only.

> **Decided 2026-10-01 (Steve, option (a)):** v5.87 ships without it; the fix is **v5.88**, presentation-only.

## D-26 · State tax omits the spending draw — opened at v5.93 (found during the D-12 Phase 2 build) — ✅ FIXED v5.94

> ✅ **FIXED v5.94 (2026-10-06).** All three state call sites pass the draw in `retIncome`; `attributeRetIncome` folds it into the income split
> (D26-2, superseding P2-6). Measured: NC +$12,501 lifetime on the example household; Engine B 392 year-rows rise, none fall; federal and Engines C/D
> unchanged. `qa/t58_state_draw.mjs`; scope `docs/SCOPE_D26_STATE_TAX_DRAW.md` (fulfilled, repo-only).
>
> *(Superseded, retained:)*
> 🔴 **OPEN — fix decided as its own release, v5.94 (Steve, 2026-10-06),** between D-12 Phase 2 (v5.93) and Phase 3 (v5.95), so Phase 3's
> per-person rules are not built on an incomplete base.

Both engines that compute state tax count Traditional dollars spent on living costs as ordinary income for **federal** tax and pass none
of them to `stateTaxAnnual`. Engine B (`computeTaxPlan`): `ordinaryIncome` includes `ordDraw_y`, but its state call passes
`retIncome: rmdTax_y + conv_y` and `work: work_y + otherOrd_y`. Engine A (`runRothStrategies`): `base` includes `draw_y`, but its state
call passes `retIncome: rmd + conv`. Introduced with the draw bridges (v5.74 for B, v5.84 for A), after v5.62 fixed the call's argument
shape; never disclosed. **Measured (v5.91 source, the example household, NC and VA):** in all ten draw years 2029–2038 ordinary income rises by
exactly the draw and federal tax rises, and **state tax does not move**; $313,303 of lifetime draw goes untaxed by the state. Engine A,
one-year household, $10,000: as a draw +$1,200 federal, +$0 state; as a pension +$399 (NC) / +$575 (VA) state. **Optimistic.** Whole-plan
totals hide it, because draws also shrink later RMDs. **Fix, designed:** route the draw into the state calculator as retirement income
(D-12 Phase 2 already attributes it per person, `byPerson.draw`), in both engines; measure the real dollar effect with the fixed engine;
METHODOLOGY entry and a CHANGELOG disclosure of the understatement since v5.74 / v5.84. **Raises state tax** (conservative direction).

## D-27 · The Roth comparator files jointly for a survivor in the state calculation — opened at v5.95 (found during the D-12 Phase 3 build) — ✅ FIXED v5.96

> ✅ **FIXED v5.96 (2026-10-08).** Both Engine A state calls file by the engine's own `effSingle`, blank the late spouse's age and put the survivor's
> benefit in the survivor's slot in single survivor years. Measured: every change an increase, survivor years only; ME +$35,853 lifetime on the example
> household; the Roth tab's best-by-estate cell changed in 6 of 102 measured state-household cases (none on the example household). `qa/t60_engineA_survivor_state.mjs`;
> scope `docs/SCOPE_D27_ENGINE_A_SURVIVOR_STATE.md` (fulfilled, repo-only). *(The entry below is the v5.95 finding, retained.)*

Engine A (`runRothStrategies`) passes `single: !!P.single` to `stateTaxAnnual`, so after a death the survivor keeps joint state thresholds,
bands and cliffs (RI, NJ, CT, VA, ...), and the decedent keeps an age. Its per-person slots are right (the decedent is attributed nothing), so
v5.95's per-person rules read the survivor correctly; the filing status is what is wrong. Direction: mixed by state (joint thresholds are
higher — optimistic where a cliff or band binds). Engine B was fixed for the related age defect at v5.95. **Not measured. Medium.**

## D-28 · Pennsylvania and commercial annuities — opened at v5.95 — ✅ CLOSED v6.06 (widened)

> ✅ **CLOSED v6.06 (2026-10-12).** Pennsylvania taxes a commercial annuity as interest income at any age (2025 PA-40 instructions, Code 7D; Act 40 of
> 2005), and a census of all 25 taxing states that give retirement relief found twelve more whose relief does not reach it — AR, DE, IL, IA, ME, MD, NY,
> OK, WI; CO and MI (life annuities only, not distinguished); MS (unclear, conservative). Maryland's exclusion reaches no IRA money either. Rows carry
> `reliefKinds` (`docs/SCOPE_D28_ANNUITY_RELIEF_V606.md`, fulfilled, repo-only; `qa/t69_annuity_relief.mjs`). New from the build: **D-33**. *(The entry
> below is retained.)*

The model's `annuity` category (Other accounts of type annuity) is exempt in Pennsylvania from 60, per person, as at v5.90. Pennsylvania's
REV-636 points commercial annuities to the cost-recovery method; whether their earnings are taxable to a retiree is not settled from a primary
source here. Possibly optimistic. **Low — verify before changing.**

## D-29 · Missouri exempts capital gains from 2025; the model taxes them — opened at v6.01 — ✅ CLOSED v6.04

> ✅ **CLOSED v6.04 (2026-10-11)** — Missouri subtracts 100 % of realized capital gains from TY2025 (RSMo 143.121.3(14), re-read; the 2025 Form MO-A line 18;
> Letter Ruling 8397), through a row field `gainsExempt`; qualified dividends stay taxed (`docs/SCOPE_D31_D29_V604.md`, fulfilled, repo-only;
> `qa/t68_fed_deductions.mjs`). Engine B passes its realized gains; Engine A realizes none. *(The entry below is retained.)*

HB 594 & 508 (2025), RSMo 143.121: from TY2025 an individual subtracts 100 % of the capital gain reported for federal purposes (the DOR's 2025
legislative-changes summary: "one hundred percent (100%) of the income reported as capital gain for federal tax purposes can be subtracted"). The model
taxes Missouri gains on the state's schedule (found while reading Missouri's brackets for v6.01, `docs/SCOPE_D22_BRACKETS_V601.md` §0). Conservative, and
large for a household that funds spending from a taxable account. An exclusion field (gains exempt) and its tests; re-read the statute first.
**Medium — simple, conservative today.**

## D-30 · No state standard deduction, personal exemption or credit is taken — opened at v6.01 — ✅ CLOSED v6.03

> ✅ **CLOSED v6.03 (2026-10-10) — batch 2: the fourteen flat-rate states whose law has them take their standard deductions, exemptions and personal credits**
> (Pennsylvania's has none), with Idaho's zero band and Ohio's 2026 schedule (`docs/SCOPE_D30_DEDUCTIONS_V603.md`, fulfilled, repo-only; `qa/t67_deductions_flat.mjs`).
> Every state's standard deduction, exemptions and personal credits are now taken. The federal senior deduction that reaches Arizona, Colorado, Idaho and Iowa
> joined **D-31**; three credits that need measures the calculator lacks are **D-32**. ⚠ *Correction:* the batch-1 note below calls Georgia "the example
> household's state" — the example plan files in Florida; Georgia is the parity fingerprint's state. *(The entries below are retained.)*

> ◐ **BATCH 1 CLOSED v6.02 (2026-10-09) — the 27 progressive states take their standard deductions, personal exemptions and personal credits**, each read at
> its primary source (`docs/SCOPE_D30_DEDUCTIONS_V602.md`, fulfilled, repo-only; `qa/t66_deductions_askai.mjs`). **Open: batch 2, v6.03** — the fifteen
> flat-rate states (Georgia among them, the example household's state and the parity fingerprint's, so batch 2 re-baselines both). Alabama's deduction of
> federal income tax moved to **D-31**. *(The entry below is retained.)*

Every state is taxed on its income from the first dollar: no state's standard deduction (or its sliding or phased version), personal exemption, exemption
credit or personal tax credit is taken, and neither is Alabama's deduction of federal income tax (which is large). v6.00 BR-3 left them out, one change at a
time; with every progressive state on its own schedule from v6.01 (D-22) this is the main remaining over-statement in the state layer. The figures come
from the same sources the schedules were read from (several noted in `docs/SCOPE_D22_BRACKETS_V601.md` §0). Related: D-20 (Montana starts from federal
taxable income). **Medium-high — the recommended next state release; conservative today.**

## D-31 · Deductions a state takes from the federal return are not taken — opened at v6.02 — ✅ CLOSED v6.04

> ✅ **CLOSED v6.04 (2026-10-11)** — Alabama (in full, NIIT included), Missouri (by income band, capped) and Oregon (capped, phased out by federal AGI) deduct
> the year's federal income tax as the model computes it; the federal senior deduction (2025–2028) is taken in Arizona, Colorado, Idaho, Iowa, Montana and
> North Dakota. The calculator is given the year, the federal tax and NIIT by all three call sites (`docs/SCOPE_D31_D29_V604.md`, fulfilled, repo-only;
> `qa/t68_fed_deductions.mjs`). Not taken, disclosed: the District of Columbia's senior deduction (unsettled law), the refunds Alabama and Oregon recapture,
> Oregon's 2026 cap (the 2025 one is held). *(The entries below are retained.)*

> **Widened v6.03 (D-30 batch 2):** the federal senior deduction also reaches **Arizona** (its own subtraction, A.R.S. §43-1022, from TY2025), **Colorado** and
> **Iowa** (both start from federal taxable income; Iowa's DOR: "Iowa conforms") and **Idaho** (conformity to 1 January 2026, HB 559, retroactive to 2025) —
> not taken, disclosed in each note (`docs/SCOPE_D30_DEDUCTIONS_V603.md` §0.2). The other eleven flat-rate states start from federal AGI or their own income,
> which the deduction comes after.

Two kinds, both found while reading D-30's sources (`docs/SCOPE_D30_DEDUCTIONS_V602.md` §0.2): **federal income tax** that Alabama (in full), Missouri (a
percentage, capped at $5,000 / $10,000) and Oregon (up to $8,500, phased out by federal AGI) let a return deduct; and the **federal senior deduction**
($6,000 for each filer 65 or older, 2025–2028, phased out above $75,000 / $150,000 of MAGI), which flows into Montana and North Dakota because they start from
federal taxable income. The state calculator is given neither the year's federal tax nor the model year, and its three callers would each have to pass
them. Conservative today (more state tax than the law), disclosed in each note. **Medium — its own change to the calculator's arguments; scope first.**

## D-33 · A Roth conversion draws annuity money, which a non-qualified annuity cannot convert — opened at v6.06 — ✅ CLOSED v6.07

> ✅ **CLOSED v6.07 (2026-10-12).** Engines A, B and C and the Roth tab's ladder carry the annuity dollars: a conversion and a QCD are capped at the
> non-annuity balance, the RMD, any QCD above it and the conversion leave non-annuity dollars only, the spending draw stays pro rata, and the share is
> re-taken every year. The census found the related defect — with a constant share every RMD and conversion drained annuity money too — and the
> ladder's own RMD on annuity money (open since v5.44); both fixed with it. Direction measured: lower RMDs and tax for an annuity household; estate
> figures both ways. `docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md` (fulfilled, repo-only); `qa/t70_annuity_conversion.mjs`. New from the scope: **D-34**.
> *(The entry below is retained.)*

Found measuring v6.06 (`docs/SCOPE_D28_ANNUITY_RELIEF_V606.md` §6). The Other-accounts *Annuity* type rides inside the Traditional pool as a share
(`annShareA`/`annShareB`, v5.26), and both engines take a Roth conversion pro rata from the whole pool, annuity included (`attributeRetIncome`: "a conversion
or a draw leaves the whole leg: annuity by annShare"). A non-qualified annuity is not a traditional IRA or an eligible plan, so in law it cannot be converted
(IRC §408A(d)(3)). The conversion's tax is charged now and the money then grows as Roth, so the net direction is not obvious and was not measured. Fixing it
means converting from the non-annuity share only — an engine change with a scope. **Low–medium.**

## D-34 · Engine D converts bucket money only — opened at v6.07 — ✅ CLOSED v6.08

> ✅ **CLOSED v6.08 (2026-10-12).** Engine D's conversion is figured after the year's draws: the buckets' pre-tax money left after their own RMD and
> the year's spending draw first, then the Other-account IRA's RMD-bearing money (never annuity money). The census found two more defects in that
> IRA's tracker, both fixed with it: it never grew (so its RMD was figured on the opening balance — optimistic), and its RMD left it pro rata across
> the whole pool. Direction measured: the Withdrawal tab's RMD and MAGI rise where the IRA reaches RMD age; the Taxes tab's lifetime tax falls on such
> households, a correction (Engines B and C had already converted the IRA, so some dollars were taxed twice). The example household does not move
> at $0 or $70,000. `docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md` (fulfilled, repo-only); `qa/t71_engine_d_other_ira.mjs`. New from the scope: **D-35**.
> *(The entry below is retained.)*

Found scoping D-33 (`docs/SCOPE_D33_ANNUITY_CONVERSION_V607.md` §4). Engine D (`computeWithdrawalPlan`) caps its conversion as
`min(rothAmount, tradNotional_boy − rmd_y)`: `tradNotional_boy` is the buckets' pre-tax money, while `rmd_y` includes the RMD of any Traditional IRA
entered under Other accounts (held in the Priority-1 pool, v5.26). So such an IRA is never converted in Engine D, and its RMD shrinks the bucket cap. It
matters only where the cap binds — a slider above the bucket money left — and lowers the conversion there; direction not measured. Not a D-33 defect: annuity money was never converted in Engine D. **Low.**

## D-35 · A Roth IRA entered under Other accounts is counted twice in Engine D — opened at v6.08 — ✅ CLOSED v6.09

> ✅ **CLOSED v6.09 (2026-10-13).** The Roth money sits in the Priority-1 pool's tax-free remainder (no gain, no RMD) and the buckets' Roth share is
> the holdings' Roth only; the Withdrawal tab shows it once. A Roth IRA under Other accounts and the same money as brokerage now give identical
> buckets year by year. Direction measured: the Withdrawal tab's RMD and MAGI rise, the phantom gain goes; the Taxes and IRMAA tabs move a little
> either way. `docs/SCOPE_D35_ENGINE_D_OTHER_ROTH_V609.md` (fulfilled, repo-only); `qa/t72_engine_d_other_roth.mjs`.
> *(The entry below is retained.)*

Found scoping D-34 (`docs/SCOPE_D34_ENGINE_D_OTHER_IRA_V608.md` §0.2 (3)). Engine D (`computeWithdrawalPlan`) holds every Other account in its
Priority-1 pool (`_taxInit = household − total401k`), and its gains-bearing sub-pool is that pool less ordinary and HSA money
(`_gainPoolInit`) — **not less Roth money**, so a Roth IRA there is treated as brokerage: its growth is booked as capital gain when spent, and that
gain reaches Engines B and C through the gains bridge. Separately, the buckets' Roth fraction is `_rothInit / _t401kInit`, and `_rothInit`
(`retireStartBalances`) includes Other-account Roth money the buckets do not hold, so the buckets' Traditional share — and every bucket RMD — is
understated. Measured on the example household plus $200,000 of Roth IRA under Other accounts, against the same $200,000 entered as brokerage: capital
gain identical ($29,227 both — the conservative half); the buckets' first-year Traditional $1,048,850 against $1,179,744; lifetime RMD $343,192
against $470,488 (the optimistic half). Fixing it means holding Roth money out of the gains pool (it would sit in the tax-free remainder, as converted
IRA money does from v6.08) and out of the buckets' fraction — an engine change that moves every household with a Roth IRA under Other accounts, in
both directions; it needs its own scope and measurement. **Low–medium.** *(Named D-36 in the D-34 scope's draft and its decision question; D-35 is the
next free ID.)*

## D-36 · Self-employment tax is not modelled — opened at v6.14 — ✅ CLOSED v6.16

> ✅ **CLOSED v6.16 (2026-10-16).** A job row now has two types, "Job — employee (W-2)" and "Job — self-employed (1099)" (both `kind: "work"`;
> the second adds `selfEmployed: true`). The one helper, `payrollTax`, applies §1401 and §1402 to a self-employed row: 92.35% of the profit is
> net earnings, nothing is owed under $400, Social Security 12.4% on the base the same person's wages leave, Medicare 2.9% on all of it, and the
> 0.9% on the household's wages plus net earnings. Engines A and B move for such a household only; rows saved before v6.16 stay employees.
> Measured: $60,000 of profit pays $8,477.73 in 2029 where v6.15 charged $4,590.00 (+$19,438.65 over five years). Not taken, filed as **D-37**:
> the §164(f) deduction and the §199A deduction. `docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md` (fulfilled, repo-only); `qa/t79_self_employment.mjs`.
> *(The entry below is retained.)*

Found scoping D-17 (`docs/SCOPE_D17_PAYROLL_TAX_V614.md` §0.4). Every job row is taxed as **wages** — the employee's half, 7.65% up to the
wage base (Social Security per earner from v6.14) plus the 0.9% above $200,000 / $250,000. A self-employed person owes both halves (15.3%,
less a deduction for half of it), and the Instructions for Form 8959 reduce their 0.9% threshold by any wages. A retiree's consulting
income is often self-employment income, so the omission is **optimistic** for that household. Modelling it needs a choice on the job row
(employee / self-employed) — a new input. **Disclosed at v6.14** in the Taxes tab's method note, My Data's job-row note, the Field Manual
and METHODOLOGY (*Payroll tax on job income*). **Low–medium.** *(The ID D-36 was a draft name in the D-34 scope for what was filed as D-35;
this is its first use.)*

## D-38 · The cash from a home move was a fixed $130,000 added to every plan — filed and ✅ CLOSED v6.17

> ✅ **CLOSED v6.17 (2026-10-16).** `docs/SCOPE_D38_HOME_SALE_CASH_V617.md` (fulfilled, repo-only); `qa/t80_home_move_cash.mjs`.

Found answering a question about another chat's advice. `HOME_SALE_PROCEEDS = 130000` (L1126 at v6.16) was added to the portfolio in the
retirement quarter by both Monte Carlo engines for **every** plan — the example, a Start Fresh or wizard plan, an imported backup — with no
input and no disclosure (one Events card said "the plan books $130K"). The figure is the net of a home move, so it can be 0 or negative;
for anyone not moving it was the largest single optimism in the Monte Carlo (on the example, 30-year success 81.1% at +$130,000 against
74.8% at $0). Never registered before (the §K2 sweep at the scope found nothing).

**Fixed at v6.17:** a signed My Data field, *Cash from your home move at retirement* (`PORTFOLIO.homeMoveCash`), read through one accessor at
the five model sites; a plan saved without it reads $0 with a notice until Save & Apply; Start Fresh and the wizard start at $0; the example
keeps $130,000. **Not changed, disclosed:** the sale is treated as tax-free (26 U.S.C. §121 excludes up to $250,000 / $500,000 joint when the
ownership and use tests are met — a larger gain is not taxed here, optimistic and rare); the cash arrives in the retirement quarter; the
Withdrawal, Taxes, IRMAA and Roth tabs do not see it (**D-39**).

## D-41 · The Withdrawal tab spent the expense table on the example's calendar — filed and ✅ CLOSED v6.18

> ✅ **CLOSED v6.18 (2026-10-18).** `docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md` (fulfilled, repo-only); `qa/t81_engine_d_spending.mjs`.

Through v6.17 Engine D, Backtest and What-Breaks spent `POST_MONTHLY_EARLY` before spouse B's Medicare year and `POST_MONTHLY_FULL` after —
the expense table at "2029-06" and "2031-06", the example household's dates typed into the code — for every plan. A plan retiring in 2032
spent a month that still held its current home's costs and none of its retirement rows ($6,700 a month where its own table says $8,170, then
$8,020: on the same plan moved three years later, $401K less lifetime spending and a $734K higher ending portfolio than its own table, read
year by year, gives). A row ending after June
2031 was charged for life, one starting later never, and one-time rows never arrived. The Taxes, IRMAA and Roth tabs took the error through
the bridge. **Fixed at v6.18:** one function, `tableYearExpense`, sums each year's own months and one-time rows for all three engines; the
display figures take their months from the plan's timeline by one rule (the example's three are unchanged); the Withdrawal tab and the
Field Manual say where the spending comes from. Every moved pinned figure was re-pinned with its attribution: the same suites run on v6.17's
spending written as a table and reproduce every v6.17 figure exactly.

## D-45 · The Monte Carlo charges a one-time row only when it is dated in a quarter's last month — opened at v6.18, ✅ CLOSED v6.20

> ✅ **CLOSED v6.20 (2026-10-18).** `docs/SCOPE_D40_MC_TAX_V620.md` (fulfilled, repo-only); `qa/t83_mc_tax.mjs` C (a $10,000 row in every
> month of two years is charged once, in its own quarter, exact on both planned paths); `t81` C2-2 flipped to fixed. The v6.17 home-move note
> ("closing costs … are already counted") is now true for the Monte Carlo.

Found at the D-41 build by an independent review of the release, after the scope's premise (§0.1) and the v6.17 findings note had both said
the Monte Carlo subtracts one-time rows "when they fall". It does not: `runMonteCarlo` and `runExtendedMC` read the table once a quarter, at
`${year}-${03|06|09|12}`, and `getOneTimeExpenses` needs the row's month to match exactly. So a one-time row dated in any other month is never
charged by either engine. The example's golf cart and closing costs (April 2029, $28,000) are never charged — measured: both engines give
byte-identical output with and without them, and the same rows dated June 2029 move both (`t81` C2, pinned as a dated `[KNOWN DEFECT]`).
A row added through My Data is saved as `${year}-06` and IS charged; the example's, a spreadsheet import's or a hand-edited backup's may not
be. The v6.17 home-move note ("If the next home's closing costs are a one-time row in your expenses, they are already counted") is therefore
untrue for the example's closing costs in the Monte Carlo. **Optimistic; low–medium.** Not changed at v6.18 (the scope kept the Monte Carlo
bit-identical). Candidate fix, with D-40 and D-44: charge a one-time row in the quarter that contains its month, inflated. **Disclosed at v6.18**
in the Field Manual's Withdrawal Strategy entry and Backtest's comparison sentence.

## D-46 · The Monte Carlo's quarter calendar — filed and ✅ CLOSED v6.19

> ✅ **CLOSED v6.19 (2026-10-18).** `docs/SCOPE_D46_MC_CALENDAR_V619.md` (fulfilled, repo-only); `qa/t82_mc_calendar.mjs`.

Found while scoping D-40 (`docs/SCOPE_D40_MC_TAX_V620.md`, which it now precedes). Both Monte Carlo engines turned their quarter number
into a date with one formula — quarter 0 "June of the as-of year", whatever the as-of month — and decided when things happened by two other
rules: `runMonteCarlo` at `round(months from the as-of month ÷ 3)` (right for every event only with an as-of date in May; a quarter late or
early for some event months otherwise), `runExtendedMC` at quarters from January of the as-of year (ignoring the as-of month: its figures
were identical for every as-of date in a year, and for an April–June as-of date it retired and paid each claim one quarter late). The year
2026 was typed into run A's length and label, the chart axis, the Stress tab's table and the current ages for stochastic longevity, and the
run headers said runs B and C start at retirement (they start at the as-of date). The example (as of 2026-04-18, January events) hid almost
all of it; the setup wizard's plans (as of 1 January, June claims) did not. **Optimistic for most plans' 30-year figures** — on the example
81.0% → 80.3% above $800K, median $1,609K → $1,565K; saved in November, $1,487K. **Fixed at v6.19:** one calendar for both engines; the
first quarter counts only the months from the as-of month; a claim pays from its month; the stress set's forced years are calendar years; a
plan saved after it retired gets no home-move cash; 2026 comes from the plan; the run headers give the spans the runs model.

