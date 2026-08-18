# MISSING TAXATION FEATURES — Section D of the standing code audit

| Field | Value |
|---|---|
| Build under audit | **v5.29** |
| Source md5 | **`4ef69e9a820fac18b99aa2aa46a8b2a1`** |
| Built `index.html` md5 | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Phase | 3 (Sections D + E) · governing doc `SCOPE_STANDING_AUDIT.md` §D |
| Date | 2026-08-12 |
| Status | **Partial — see §0.** D-1 is verified to source. D-2 onward are assessed, not all independently verified. |

> ## ⚠ THIS DOCUMENT IS PINNED TO v5.29 AND HAS BEEN OVERTAKEN (banner added 2026-08-18)
>
> **`D-2` — the top-ranked item — was CLOSED at v5.36.** Do not cite it as open. See the correction
> box at D-2 itself.
>
> **This document is the Section D *findings inventory*. It is NOT the Section D sweep.** The
> systematic undisclosed-gap sweep was run separately against v5.31 and is complete — see
> `AUDIT_PHASE3_SECTION_D_SWEEP.md`. This document's "Partial" status above has been read as
> "Section D was never swept" by several sessions; that reading is wrong and cost most of a session
> on 2026-08-18.
>
> Everything below is accurate **as of v5.29**. Six modelling releases have shipped since
> (v5.32, v5.34–v5.38). Re-pin at the next Section D pass; until then, verify any item against
> current source before acting on it.

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
> | L4741–4742 | Engine D: `_gainShareOfPool` → `_saleFromGain = _spendFromTaxable × _gainShareOfPool` — **ordinary spending from the taxable sleeve realizes gain** |
> | L5095 | Engine B: `const capGains_y = Math.round(_gainByYr[yr] \|\| 0)` — **no longer `0`** |
> | L9426–9433 | withdrawal schedule wired into `computeTaxPlan` |
> | L9709–9712 | withdrawal schedule wired into `computeIrmaaPlan` — so the gains **do** reach MAGI and IRMAA |
> | L9552, L9609 | rendered as its own column and row |
>
> The surrounding work: **v5.34** built the conversion-funding basis tracker, **v5.37** made ordinary
> money's growth accrue and be taxed, **v5.38** taxed the ACA-premium sale's gain and fed it to the
> IRMAA lookback. The "no cost-basis input" blocker named under **Shape** below was solved with the
> blended-basis approach that section proposed.
>
> **One live descendant:** the IRMAA tab's MAGI sentence (L9791) still does not name `capGain_y`,
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

**Priority: 3.** *Disclosed limitation* — Field Manual §13, the module header, and each state's own
`note` string. Sub-phase 2E verified the module implements its documented approximation correctly and
explicitly ruled the approximation itself out of scope; the Phase 3 brief asks the different question:
*does the approximation deserve a feature?*

**Assessment: yes, but it is the largest item here and its direction of error is not uniform.**

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
| **D-1** | OBBBA bonus: modelled in Engine B, absent from Engine A, declared absent by Field Manual §13 and METHODOLOGY §5 (§7 is correct) | **Disclosure is FALSE** | Claims conservative; is not | **Build** | **High** |
| **D-2** | No realized gains from ordinary drawdown | Disclosed | **Optimistic** | **Build** | Med-High |
| **D-3** | Progressive state schedules → effective flat rate | Disclosed | **Not uniform** | Build, staged | Medium |
| **D-4** | Itemized deductions not modelled | Disclosed | Conservative | Minority case | Low-Med |
| **D-5** | QCD one-time CRT/CGA election | Disclosed | Conservative | **Decline** | Very low |
| **D-6** | IRMAA SSA-44 life-changing-event relief | **Verify first** | Conservative | Build (disclosure) | Low-Med |
| **D-8** | ACA subsidy below 100% FPL: \$0 that reads as computed, and no floor at all in the enhanced regime | Was disclosed in two places only | **Both** — see entry | **Built (v5.32)** | **ADDRESSED / PARTIALLY** |

**D-1 and D-2 are the two that matter**, and they differ in kind: D-1 is a disclosure that is
verifiably false today, D-2 is an honestly-disclosed simplification that happens to point the wrong
way for a tool whose identity is pessimism.

**No fixes were made in the session that produced this document.**

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
That is a coherent outcome, and it is now a decision on the record rather than a discovery at the
next release. What D-8b does give that release is a principled way to identify which households'
apparent improvement is this artifact.
