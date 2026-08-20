# MISSING TAXATION FEATURES — Section D of the standing code audit

| Field | Value |
|---|---|
| Build under audit | **v5.29** |
| Source md5 | **`4ef69e9a820fac18b99aa2aa46a8b2a1`** |
| Built `index.html` md5 | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Phase | 3 (Sections D + E) · governing doc `SCOPE_STANDING_AUDIT.md` §D |
| Date | 2026-08-12 |
| Status | **Partial — see §0.** D-1 is verified to source. D-2 onward are assessed, not all independently verified. |

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
| **D-1** | ✅ **CLOSED.** Both false disclosures corrected. See the box at D-1 |
| **D-2** | ✅ **CLOSED at v5.36.** See the box at D-2 |
| **D-3** | ⚠ **DIRECTION CORRECTED and finding SPLIT (2026-08-19); disclosure half CORRECTED DOWN to Low (2026-08-20)** — see the box at D-3 |
| **D-4** | unchanged — `METHODOLOGY.md` L120 still discloses it |
| **D-5** | unchanged — disclosure still at `TAX_CONSTS.QCD_LIMIT` (now L850) |
| **D-6** | ⚠ **CORRECTED — the v5.31 sweep's resolution was too broad.** See the box at D-6 |
| **D-7** | unchanged — state estate/inheritance tax still **unassessed** |
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

## D-1 · The OBBBA senior bonus deduction is modelled by the Taxes engine, absent from the Roth engine, and declared absent by both disclosures

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

## D-2 · Realized capital gains are never generated by ordinary drawdown

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

## D-3 · Progressive state schedules are approximated by an effective flat rate

> ### ⚠ DIRECTION CORRECTED 2026-08-19 — measured against v5.40, and the finding splits
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
>   effective … — [note]. Verify against your state's rules."* beneath the My Data selector for **every**
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

## D-4 · Itemized deductions are not modelled

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

## D-6 · IRMAA life-changing-event relief (SSA-44) appears to be unmodelled and undisclosed

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

## D-7 · Assessed and deliberately excluded

| Candidate | Why excluded |
|---|---|
| **Joint-mortality correlation** in the Monte Carlo | Named in the Phase 3 brief as a §13 disclosure and it is one — but it is a **mortality** modelling gap, not a taxation one, so it is out of Section D's scope. It belongs in a mortality scope. Disclosed in §13 and §06. |
| **Inherited-IRA 10-year rule / beneficiary treatment** | New output outside the drawdown frame — it models the heirs' tax position, not the household's drawdown. Boundary test: decline. |
| **Federal estate tax** | OBBBA exemption is far above this app's audience. Not mainstream. |
| **State estate / inheritance tax** | Thresholds in some states (OR, MA) are low enough to reach the app's audience, and the solve-for grid already ranks by "after-tax estate" — so it is not obviously out of frame. **Left unassessed; a later session should price it properly.** |
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
| **D-6** | IRMAA SSA-44 relief | **partially disclosed** — survivor trigger yes, work stoppage no | Conservative | Build (one clause) | Low |
| **D-5** | QCD one-time CRT/CGA election | open, unchanged | Conservative | **Decline** | Very low |
| **D-7** | State estate / inheritance tax | **unassessed** — still owed | unknown | unassessed | unranked |
| **D-8** | ACA sub-floor \$0 | **PARTIALLY ADDRESSED (v5.32)** — declined toggle not built | **Both** | Built | see entry |

**D-3 was ranked top here on 2026-08-18 and that ranking is superseded** (direction corrected 2026-08-19 — see the box at D-3). Its *disclosure* half stays a live Medium; its *precision* half is held and de-prioritised. What follows is the 2026-08-18 reasoning, kept for the record: **with D-1 and D-2 closed, D-3 is the top-ranked open item** — and it is the one simplification here
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
