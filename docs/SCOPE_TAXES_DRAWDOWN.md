# SCOPE — the Taxes tab and the drawdown (C-8 / E-21 / D-14)

**STATUS (v5.74): FULFILLED — BUILT AND SHIPPED IN v5.74. This scope is RETIRED; §12 is its build record.**
Engines B and C consume Engine D's spending draws through one shared bridge (`withdrawalPlanSeries`) and recompute the
Traditional balance at their own `BASE_GROWTH` (D-9). The acceptance figure reproduced exactly: **$208,416** lifetime
federal on this scope's basis, **$208,445** as the Taxes tab renders it. Two departures, both in §12 and both decided on
recommendation: §8 items 1–2 restated, and the series walk hoisted beyond §4's census.

*Prior status, superseded by the line above and kept as history:* STATUS (2026-09-18, third revision): ALL NINE DECISIONS RESOLVED — BUILDABLE. NOT BUILT as of this line. Eight were
resolved on 2026-09-18 by Steve adopting the scope's recommendations (§6). **§11 step 2's counterfactual was then
measured before any source change, and it sent two of them back** (§3.5): **D-3 was NARROWED** — it deflates the draw
term only, not the RMD term — and **D-9 was raised** because the measurement showed A2 as written bundled a modeling
change nobody had decided. **D-9 was resolved the same day: keep `BASE_GROWTH` in Engine B.** ⚠ Per OPERATIONS §I this
line is evidence of what was true when written and nothing makes it expire — confirm against `CHANGELOG.md` and the
source before believing it. No source line has been changed and no version is
claimed. ⚠ Per OPERATIONS §I, this line is evidence of what was true when it was written and nothing makes it expire —
**a later session confirms against `CHANGELOG.md` and the source before believing it**, and retires this document at
the ship of the release that fulfils it.

**Build this scope was written against:** v5.73 · source md5 `3bf1e15f1b28659aae9a78e3186d2ae8` · built `index.html`
`345ccbceb58bf74f9fbdde5db0646d1d` · repo clone HEAD `a9484d2`. Freshness check (OPERATIONS §A, §A2) run at the top of
the session: pool source, repo `src/DangerClose.jsx` and the manifest all agree; 120 of the pool's 121 files
content-match a committed file, the one exception being `DangerClose-v5_72.jsx`, which is pool-only by design because
the repo carries exactly one source. **Every number below was printed by a command in that session.**

**Destination of this file:** `docs/SCOPE_TAXES_DRAWDOWN.md` in the repo **and** the knowledge pool, with a manifest
row (OPERATIONS §G — active scope docs live in both). Retire it at the ship of whatever release fulfils it (§I).

---

## 1 · What this is, and what it is not

The audit's Phase 2 recorded **C-8**: the Taxes tab never taxes Traditional spending withdrawals, and its RMDs run on a
balance that was never drawn. The same defect is **E-21** (an architecture note: two parallel projections of one
household) and **D-14** (the missing feature is a *shared drawdown*, not a line edit).

This document establishes the premise against source, censuses the code the fix touches, states what the fix must
prove, and puts the design choices in front of Steve with a recommendation each. **It deliberately does not choose.**
The central question — who owns the drawdown — changes the size of the build by an order of magnitude and changes what
the Taxes tab *means*, so it is his call.

---

## 2 · Premise, verified against source

### 2.1 Engine B has no concept of a spending withdrawal

`computeTaxPlan` spans **L5414–5734** (`funcmap.cjs`). Its ordinary income is assembled in one line:

> **L5624** `const ordinaryIncome = pen_y + work_y + otherOrd_y + rmdTax_y + conv_y;`

Pension, work, other ordinary streams, the post-QCD RMD, and conversions. There is no draw term, and no other term is
added to it anywhere in the function. Its Traditional balance moves only for the RMD, the QCD excess and conversions:

> **L5699–5703** — `_outRest` is `max(rmd, qcd) − rmd` plus `conv_y`; the two legs are then grown by `tradGrowth`.

`tradGrowth` is `BASE_GROWTH` (**L5546**), which is `0.045` (**L993**) — a flat 4.5%/yr, and the balance therefore
compounds through the whole pre-RMD period untouched by any spending.

### 2.2 Engine D funds spending from that money and calls it income

`computeWithdrawalPlan` spans **L4966–5412**. Spending is met from the taxable sleeve first, then B1→B4
(**L5196–5205**), and the portion of that draw that is pre-tax money is recognised as income in two terms:

> **L5302** `const tradDraw = _spendFromBuckets * tradFrac;`
> **L5241** `const othOrdDraw = _spendFromTaxable * _ordFrac;`
> **L5372** `const magi = taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y;`

**Neither `tradDraw` nor `othOrdDraw` is published in the schedule row** (`schedule.push`, L5382–5401). Any design in
which Engine B consumes the draw therefore begins by publishing them — the same first step v5.36 took with `capGain_y`.

### 2.3 The only bridge that exists is the gains series

`census.cjs` on `gainByYr` returns four hits: the two engine signatures (**L4759** Engine C, **L5414** Engine B) and
the two call sites (**L10124** Taxes tab, **L10403** IRMAA tab). The Taxes tab builds the series immediately before
the call:

> **L10117–10118** — a loop over `computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset }).schedule`
> collecting `capGain_y` per year.

That shape was chosen deliberately at v5.32 (`docs/SCOPE_FIX_realized_capital_gains_v5_32.md`, **D-4**: *"Engine D
computes the gain series; A, B and C consume it"*), which explicitly **rejected** "a second draw model in Engine B" and
flagged that the change "warrants an `ARCHITECTUREIssues.md` note when it lands." E-21 is that note, written late.

### 2.4 What the user is told

- Taxes tab, **L10140–10141**: the tab names exactly one input as arriving from outside — realized capital gains — and
  closes with *"Set ① honestly and leave ② and ③ at zero, and this tab is simply your projected tax life as-is."*
- **The Field Manual repeats the same sentence.** Read out of the raw `DOCS_HTML` blob (one line, **L4043**, 153,907
  chars; searched by program, not by grep, per the standing caution): the string `tax life` occurs once, in
  *"…leave the other two at zero, and the tab is simply your projected tax life as-is."*
- `METHODOLOGY.md` documents the v5.36 gains bridge in full ("Capital gains in the drawdown, and where they are taxed",
  L1248–1290) and says nothing about spending draws being excluded from the Taxes tab.

So the exclusion is undisclosed on all three surfaces, and the tab's own summary sentence asserts the opposite.

### 2.5 Executed, on the shipped example household (joint, retire 2029, horizon 2053)

Reproduced this session from a run folder built by `mk_runfolder.sh v572 v573`, via
`qa/tools/audit_phase2_v573/audit_c8.mjs`:

| Measure | Value |
|---|---|
| Years with Traditional spending draws Engine B never sees | **7** (2032–2038) |
| Those draws, as the audit reconstructed them | **≈$238,144** |
| Engine B's federal tax in each of those years | **$0** (its only ordinary income is the $4,800 pension) |
| Engine B lifetime RMDs | **$1,625,926** |
| Engine D lifetime RMDs | **$1,021,349** |
| Engine B lifetime federal tax | **$244,040** |

---

## 3 · Four things this scope measured that the finding did not record

These change the shape of the fix, so they are stated before the design options rather than inside them.

### 3.1 The gap is larger than $238K, because it starts at retirement

Backed out of Engine D's own published `magi` identity (§2.2) — the household has no income streams, so the residual
after subtracting every other published term **is** `tradDraw + othOrdDraw`:

| Year | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ordinary draw Engine D recognises | 43,524 | 46,740 | 17,760 | 31,498 | 32,882 | 33,889 | 34,923 | 35,985 | 37,077 | 38,199 |

**Lifetime: $352,485**, not $238,144. The audit's figure counted only post-2031 *bucket* draws net of RMD; the
2029–2031 draws come out of the taxable sleeve, which on this household is ~75% ordinary money because it holds two
Traditional IRAs and a state plan under Other accounts (`Rollover IRA (A)`, `Traditional IRA (A)`,
`Spouse B - State Plan`). Both figures are correct measures of different quantities; **the bridge quantity is the
$352,485 one**, because that is what Engine D itself taxes.

### 3.2 Sharing the draws will not reconcile the RMDs — the engines also grow the balance differently

Engine D's weighted 401(k) growth on the base preset is **3.518%** (per-bucket expected returns, `growth` = b1 0.0453,
b2 0.039675, b3 0.03125, b4 0.002, against bucket weights 10/30/60/0). Engine B grows Traditional at a flat **4.500%**.
The gap survives the conversion slider: at `rothAmount` 70,000, lifetime RMDs are **D $340,470 vs B $852,458**.

**Consequence:** a fix that passes only the draw series to Engine B narrows the RMD divergence but does not close it,
and leaves two balance paths in the file. Closing it means Engine B consuming Engine D's *balance path*, which is a
materially bigger change. This is decision **D-2**.

### 3.3 The two engines are not in the same units

Engine D is nominal: it applies a COLA to Social Security and inflates expenses at `expectedInflation()`. Engine B
deliberately holds Social Security and pension **flat in today's dollars** while inflating brackets 2%/yr — its own
comment (L5573–5575) calls that the engine's "deliberate bracket-creep conservatism." Measured in 2034:

| | Engine D | Engine B |
|---|---|---|
| Spouse A Social Security | **45,331** (COLA'd) | **39,600** (flat) |
| Pension | 4,800 | 4,800 |

Feeding D's nominal draw series into B mixes conventions: a 2045 draw arrives inflated while the income beside it does
not, against brackets that inflate at a third rate. The divergence grows with the horizon, and it pushes the later
years **pessimistic** (nominal income taxed against slow-growing brackets). That is the app's preferred direction, but
it is an accident here rather than a choice, and it is the single most likely way this fix makes the tab *less* right
in the back half. This is decision **D-3**, and it applies to the existing gains bridge too — v5.36 crossed the same
boundary without recording it.

### 3.4 The early-year miss is bigger than the audit estimated

The audit estimated *"on the order of $1,200"* of missed federal tax in 2032. Measured this session with a partial
counterfactual — Engine D's ordinary-draw series injected into Engine B as ordinary income, **balance path and
therefore RMDs unchanged** (the fixture is an `applyLoadedData` round-trip adding one non-COLA, ordinary,
non-work income stream per drawing year):

| Year | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 | **Total** |
|---|---|---|---|---|---|---|---|---|
| Federal tax the tab shows | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **$0** |
| Federal tax with the draws taxed | 1,923 | 2,099 | 2,204 | 2,312 | 2,424 | 2,539 | 2,659 | **$16,160** |

**The 2029–2031 rows are excluded and must not be quoted from that probe:** any real income stream suppresses the demo
spouse-B work taper, so those three years lose $20,000 / $18,000 / $15,000 of work income in the fixture and their
deltas are contaminated (measured: `work_y` 20,000 → 0 in 2029). 2032–2038 are clean because the household's only other
ordinary income in those years is the $4,800 pension. **Negative control run:** the same `applyLoadedData` round-trip
with no streams added moves Engine B's lifetime federal tax and state tax by **$0**, so the deltas above are the
streams' effect and not the fixture's.

This is still only half the story — it is the *early* half, and it does not include the offsetting late-year RMD
overstatement. **The to-the-dollar lifetime counterfactual is a deliverable of the build, not of this scope**, because
its value depends on which design is chosen (§6, D-2 especially).

### 3.5 · The lifetime counterfactual (§11 step 2, measured 2026-09-18) — and the two decisions it sent back

§11 said the build's FIRST task is the to-the-dollar counterfactual, and that a materially different figure means stop
and report rather than adapt. It was measured before any source change, and it is materially different.

**Method.** Engine B does all the tax arithmetic; the fixture changes only WHAT INCOME reaches it, which is what A2
changes. For the split, Engine B's Traditional balance loop (L5590-5601, L5698-5702) was reimplemented outside the
engine and **validated by reproducing the shipped RMD series to the dollar — worst-year error $0.00, lifetime
$1,625,926 against $1,625,926** — before any draw term was added. Six fixture checks pass in the tax leg (B's own RMD
zeroed, work income $53,000 and FICA $4,055 preserved, SS $1,144,800 and pension $120,000 unchanged, 25 rows both
sides). Probes: `cf_growth_split.mjs` (the split, self-validating), `cf_a2.mjs` and `cf_a2_decomp.mjs` (the variants).

| Variant | Lifetime RMD | Lifetime federal | vs shipped |
|---|---|---|---|
| As shipped (C-8 live) | $1,625,926 | **$244,040** | — |
| **The C-8 fix alone** — draws leave the balance, Engine B keeps its own 4.5% | $1,321,030 | **$208,416** | **−$35,624** |
| + Engine D's growth adopted (3.518%) | $1,078,121 | **$166,270** | −$77,770 |
| + Engine D's RMD series imported and deflated (D-3 as first written) | — | **$91,729** | −$152,311 |

**What this changes.**

1. **The defect is worth −$35,624, about 15% — not the 62% that A2 as first written produced.** §3.4's early-year
   +$16,160 was real and is unaffected; the late-year RMD correction is larger and runs the other way, so the lifetime
   net is a reduction. The scope's "mis-timed rather than simply low" holds in direction.
2. **D-3 as first written was carrying $74,541 of the movement.** "Deflate the imported series" applied to the RMD term
   replaces a term derived from a nominally-compounding balance with a deflated one. That is not a units correction; it
   is a second and larger change wearing one's clothes. **D-3 is narrowed to the draw term only.**
3. **A2 silently adopted Engine D's growth assumption, worth a further $42,146.** That is a modeling change to the Taxes
   tab, not a fix to C-8, and it was never a decision. **It is now D-9.**

⚠ **The direction matters to the product, not just the arithmetic.** This is a deliberately pessimistic stress-tester,
and the most severe open defect is one whose correction LOWERS the headline. A 15% reduction is explainable in a
sentence; a 62% reduction is a different conversation, and the difference between them was two under-specified words.

---

## 4 · Site census

Parser output (`funcmap.cjs`, `census.cjs`) against the v5.73 source. Line numbers are canonical-file numbers,
confirmed to align with the run folder's copy (the `mk_testable` shim appends 97 lines at the end and shifts nothing).

### 4.1 Source

| Site | Lines | Role in the fix |
|---|---|---|
| `computeWithdrawalPlan` (Engine D) | 4966–5412 | owns the drawdown; **publishes nothing about it** |
| — `othOrdDraw` | 5241 | ordinary income from a taxable-sleeve spending draw |
| — `tradDraw` | 5302 | ordinary income from a bucket spending draw |
| — `schedule.push` | 5382–5401 | where the two would be published |
| — bucket/sleeve balances, growth | 5322–5351 | the balance path a fuller design would publish |
| `computeTaxPlan` (Engine B) | 5414–5734 | consumer; `ordinaryIncome` L5624, RMD L5598–5601, balance L5699–5703 |
| `computeIrmaaPlan` (Engine C) | 4759–4940 | second consumer; MAGI L4911 has the identical gap |
| `runRothStrategies` (Engine A) | 4138–4746 | ordinary base L4304 — same gap, different purpose (§7) |
| Taxes tab call site | 10112–10124 | builds `gainByYr`, calls Engine B |
| IRMAA tab call site | 10396–10403 | builds `gainByYrI`, calls Engine C |
| Withdrawal tab call site | 9010 | Engine D's own render |
| Taxes tab "as-is" copy | 10140–10141 | disclosure |
| Roth-tab ladder MAGI (component-inline) | 9483 | a fourth projection; RMD growth `BASE_GROWTH` at 9360 |
| `BASE_GROWTH` | 993 (def), used 2085, 2267, 4146, 5546, 8264, 9360 | the growth constant the reconciliation question turns on |

`computeTaxPlan` has **2** source sites (definition + one call). `computeWithdrawalPlan` has **4** (definition + three
calls). `computeIrmaaPlan` has **2**. The shim's `export const __engines` line is not counted — it exists only in the
testable copy.

### 4.2 Suite

By AST over `qa/` (§B1a — identifiers, member-expression properties, and string literals; run from a directory where
`acorn` resolves):

| Suite | What it touches | Expected effect |
|---|---|---|
| `t18_engineB_exact` | `computeTaxPlan`×6, `fedTax`×12, `totalTax`×4 | **figures should not move** — its fixtures set `positions = []` and `otherAccounts = []`, so there is no portfolio to draw from. Confirm by running, don't assume |
| `t17_engineC_exact` | `computeIrmaaPlan`×4 | same reasoning; moves only if Engine C is included (D-5) |
| `t35_state_populate` | `computeTaxPlan`×4, `rmdTax_y`×3 | state figures ride on Engine B's ordinary income |
| `t27_half_cap` | `computeTaxPlan`, `ordinaryIncome` | §86 band fixture; a draw term could move it off its band |
| `t19_engineD_exact` | `computeWithdrawalPlan`×13, `rmd_y`×23, `capGain_y`×9 | **must not move at all** — publishing fields is a no-op on D's numbers, and this suite is the witness |
| `t20_other_taxtype` | `computeWithdrawalPlan`×3 | the Other-accounts invariants that the ordinary-draw terms feed |
| `t14_cross_engine_survivor` | all three engines by name | survivor agreement across engines |
| `t25`, `t32`, `t13` | Engine C | only if C is in scope |
| `domdiff_withdrawal.mjs` | TAXES + WITHDRAWAL legs | its **"TAXES: the year-table FIGURES are IDENTICAL across the pair"** assertion is the designed witness and **will fire** — it must be gated per leg (§B2's rule: the old expectation stays true for the old build) |
| DOM suites `t4_dom`, `t9_dom_smoke`, `t11_survivor_rmd`, `t6_single`, `smoke_built` | render the Taxes and Withdrawal tabs | copy assertions move with the disclosure rewrite |
| `t31_disclosure_parity` | reads `METHODOLOGY.md` and the raw Field Manual | the new limitation must appear on both surfaces or this goes red |
| `t1_units` STATIC | asserts strings inside `computeTaxPlan` | a version bump alone fails it if the four in-app version sites are missed |

---

## 5 · The design space

**Resolved 2026-09-18 → Shape A2** (Engine D owns the drawdown; Engines B and C consume both the draw series and the
balance path). The rejected shapes are kept below because a scope that records only the winner cannot be audited.

Three shapes, in increasing order of cost. Each is stated with what it fixes and what it leaves broken.

**Shape A — Engine D owns the drawdown; Engine B (and optionally C) consume it.** v5.32's D-4, extended from gains to
draws. Two sub-shapes, and the difference matters more than the label:

- **A1 — draws only.** D publishes `tradDraw` and `othOrdDraw`; the call site builds a year-keyed series exactly as it
  builds `gainByYr`; Engine B adds the term to `ordinaryIncome`. Small, symmetric with the existing bridge, and it
  fixes the *early* miss (§3.4). **It does not fix the RMDs** — B's balance still never falls for spending, so the
  $1.63M vs $1.02M divergence survives almost intact, and the tab would then tax the draws *and* keep the inflated
  RMDs, making the later years worse than today.
- **A2 — draws and the balance path.** D additionally publishes the Traditional balance (and its per-owner split), and
  Engine B computes its RMD from that path instead of its own. This is the one that makes the tab agree with the plan.
  It is also the one that surfaces every hidden disagreement between the engines: growth rate (§3.2), units (§3.3),
  the per-owner split (D tracks `_fracB` at initial proportions; B tracks `tradA`/`tradB` with a survivor rollover),
  and the annuity exclusion (both carry it as a share, which C-9 already records as a defect).

**Shape B — Engine B models its own drawdown.** A second copy of the drawdown, which is exactly what v5.32 D-4
rejected and what E-22 names as this project's most expensive recurring failure. Not recommended, and listed so the
scope is honest that it was considered.

**Shape C — disclosure only.** Change the tab's "as-is" sentence, the Field Manual and METHODOLOGY to say that the
Taxes tab excludes spending withdrawals and that its RMDs assume an undrawn balance. Cheapest; ships in one release;
leaves a high-severity numeric defect live behind an accurate warning. Worth stating that this is the *floor* — **any
of the shapes above still ships the disclosure**, because even A2 leaves approximations worth naming.

---

## 6 · Decisions — RESOLVED 2026-09-18

All eight were resolved in one step: Steve adopted the scope's recommendations as written. The recommendation text is
left intact under each heading so the reasoning and the rejected alternatives travel with the decision.

### ✅ D-1 · Who owns the drawdown? → **Engine D owns it; Engine B consumes**
**Recommendation (adopted): Shape A (Engine D owns it; Engine B consumes).** It is the precedent the file already set at v5.32,
it keeps one drawdown in the codebase, and it is the only option that leaves the Withdrawal tab as the single answer
to "what does this plan actually do." *Rejected:* Shape B (a second copy — E-22); Shape C alone (the tab's own
sentence would have to be un-written rather than qualified, and a "high" finding would stay open).

### ✅ D-2 · Draws only, or draws plus the balance path? → **the balance path (A2)**
**Recommendation (adopted): A2.** A1 is measurably half a fix that makes one half worse: it adds the early tax (+$16,160 on the
example household, §3.4) while leaving lifetime RMDs 59% above the plan's, so the tab would overstate the late years
*more* confidently than it does now. The A1 fallback (draws only, with the RMD divergence disclosed in the
same release) was offered and **not taken**; it is recorded here so that a later session which finds the build running
long knows the fallback exists and knows its condition — A1 ships only with that disclosure, never as a silent
milestone toward A2. ⚠ *This is the decision that set the size of the build; everything else is contingent on it.*

### ✅ D-3 · Units → **deflate the DRAW term only, at the call site, and disclose it**
⚠ **NARROWED 2026-09-18 by measurement (§3.5), after being adopted the same day in its original wording.** As first
written this said "deflate the imported series", which read across to the RMD term and was worth **$74,541** of lifetime
tax on its own — more than the defect being fixed. Engine B's own RMD term is derived from a balance compounding at a
nominal 4.5%, so it is not in today's dollars either; deflating the imported replacement makes it *more* real than the
term it replaces. **The draw term is deflated. The RMD term is imported as Engine D computes it.** The original
recommendation, preserved: 

**Recommendation (adopted, now narrowed): deflate the draw series to the engine's convention at the call site**, i.e. divide Engine D's
nominal draw by its own cumulative inflator before handing it to Engine B, so the imported term sits in the same units
as the pension and Social Security beside it — and **disclose the choice in METHODOLOGY**, naming the direction.
*Alternative:* import nominal and accept a growing pessimism in the back half. *Do not:* leave it undecided — that is
how the same boundary got crossed silently at v5.36, and the same question should be answered for `gainByYr` in this
release. **The counterfactual in §3.4 was computed nominal**, so the lifetime figure will move once this is settled.

### ✅ D-4 · Roth conversions → **unchanged this release; cap divergence recorded**
The two engines already agree on the conversion *input* (`rothAmount`) but cap it differently: Engine B at
`tradBal − max(rmd, qcd)` (L5610), Engine D at `tradNotional_boy − rmd` (L5155), and only Engine B knows about QCDs.
**Recommendation (adopted): leave the conversion arithmetic alone in this release** and record the cap divergence as a
follow-up finding. Under A2 the caps converge on their own, because both would then be measured on one balance path;
under A1 they do not, and that is another reason to prefer A2.

### ✅ D-5 · QCDs → **out of scope, disclosed**
The QCD lever is Engine B's alone: Engine D has no QCD concept, so gifted dollars never leave the drawdown's portfolio
and a QCD makes the two balance paths disagree by construction. **Recommendation (adopted): out of scope for this release, and
disclosed** — the QCD modeler is explicitly a what-if, so the honest statement is that setting it above $0 makes the
Taxes tab diverge from the Withdrawal plan by the gifted amount. *Alternative (more work, cleaner):* Engine D takes
`qcdAnnual` and gifts the money out of its own Traditional pool, which would make the modeler consistent everywhere.

### ✅ D-6 · Engine C (IRMAA) → **included in the same release**
Engine C's MAGI (L4911) has the identical gap and the identical existing bridge (it already takes `gainByYr` at
L4759 and the IRMAA tab already calls Engine D at L10401). **Recommendation (adopted): include Engine C in the same release.**
Leaving it out would ship a build where the Taxes tab taxes the draws and the IRMAA tab does not — a new cross-tab
contradiction, created by fixing one. The marginal cost is one call-site loop and one MAGI term; the marginal test
cost is `t17`/`t25`/`t32` re-baselined and one more cross-tab case.

### ✅ D-7 · Engine A (the Roth comparator) → **out of scope, recorded as an open finding**
**Recommendation (adopted): explicitly out of scope, and say so in METHODOLOGY.** Engine A's ordinary base (L4304) is
`pen + work + otherOrd + rmd` — the same gap — but its taxable pool is sold only to fund taxes and ACA losses, and its
output is a *differential* between conversion strategies, where a spending draw common to both paths largely cancels.
"Largely" is doing work in that sentence, so this should be recorded as an open finding with its size unmeasured,
not as a clean exclusion.

### ✅ D-8 · Scenario coupling → **follow the selected scenario**
Engine D's schedule depends on the Monte Carlo scenario, and the draw series moves a long way with it — lifetime
ordinary draw is **$352,485 base, $660,662 bear, $352,386 bull**. The gains bridge already follows the selected
scenario, and the Taxes tab already tells the user so (L10140). **Recommendation (adopted): follow the same scenario**, and
extend the existing sentence so it names draws as well as gains. The consequence Steve should weigh: **the Taxes
tab's headline lifetime figure will start moving when the scenario picker moves**, which is correct but new.

### ✅ D-9 · Does the Taxes tab adopt Engine D's growth assumption? → **NO — keep `BASE_GROWTH`**
**Raised 2026-09-18 by the §3.5 measurement, which found A2 had been bundling it invisibly.** Engine B grows
Traditional at a flat `BASE_GROWTH` 4.500% (L5546 / L993); Engine D uses scenario-derived per-bucket returns, weighting
to **3.518%** on base. If Engine B consumes Engine D's *balance path* (D-2), it inherits D's growth whether or not
anyone chose it — worth **$42,146** of lifetime federal tax on the example household, on top of the $35,624 the defect
itself is worth.

**Recommendation (adopted 2026-09-18): keep `BASE_GROWTH` in Engine B for this release.** Engine B consumes Engine D's *draws* and recomputes
the balance path with its own growth, so the release changes exactly one thing and the Taxes tab's headline moves 15%
rather than 62%. A user told "we fixed a defect, your projected lifetime tax fell 15%" can follow that; the same user
told it fell 62% will reasonably ask which figure was the lie.

*Alternative (defensible, and probably right eventually):* adopt D's growth, on the grounds that per-bucket expected
returns are more considered than a flat rate and that two growth rates for one balance is E-22's duplication again. If
so it wants its own release, its own disclosure, and a look at the other three projections on `BASE_GROWTH`
(L4146 Engine A, L8264 and L9360 the component-inline ones), because fixing one of five is how the file got here.

⚠ **This decision gated the build and no longer does.** It was a fork in what the release *means*, not a parameter,
which is why it was raised rather than absorbed. **Reversing it is a one-line change here plus a re-measurement** —
§3.5's third row is what the adopted alternative costs ($166,270 lifetime, −$77,770 against shipped), so the price of
changing your mind is known rather than guessed.

⚠ **What this decision OBLIGES the build to do.** Engine B consumes Engine D's *draws*; it does **not** inherit Engine
D's balance path wholesale, because that path carries D's growth. B recomputes the Traditional balance with its own
`BASE_GROWTH`, minus the imported draws. That is the variant §3.5 measured at **$208,416** and it is the figure the
build must reproduce. ⚠ **This qualifies D-2**: "draws plus the balance path" now means *the path recomputed from the
draws*, not the path copied. A build that copies D's balance path will land on $166,270 and be $42,146 wrong against
the decision, while looking like a successful A2.

---

## 7 · Out of scope (explicitly)

- **Engine A** (D-7), beyond a recorded finding.
- **C-9's annuity share** (fixed-share exclusion drifting as the pool drains) — touches the same RMD base in Engines B
  and C; queued separately, and this release must not quietly change it.
- **C-5** (Engine D's display bracket read from the joint table) and **C-7** (spouse-B SS paid to a single household) —
  both feed the same Withdrawal-tab column and are queued for their own release. If a cross-tab agreement test is
  written against `magi`, it will trip over C-7 on a single-filer household; the test must pin C-7 as a known defect
  rather than absorbing it.
- **C-3, C-6, C-4, C-1, C-10, C-11**, and the phone-layout items **F-11/F-12** — queued.
- **The RMD cards and the Roth tab's component-inline projection** (L8264, L9360), which are a fourth and fifth
  projection on `BASE_GROWTH`. Reconciling them is E-22's general case and is not attempted here.
- **Any change to Engine D's numbers.** Publishing fields is a no-op by construction and `t19` is the witness.

---

## 8 · Tests this ships with

**New: `t40_cross_tab_agreement.mjs`** — E-25's first missing class, and the test whose absence let C-8 live.

1. Same household, same year, both engines driven at module level: the Taxes tab's ordinary income equals the
   Withdrawal plan's ordinary income, to the dollar, for every common year.
2. Lifetime RMDs agree between Engine B and Engine D — live, since A2 was chosen. (Had A1 shipped instead, this
   would have been a **pinned known divergence** carrying today's figures, so the gap stayed a checked fact.)
3. The example household exactly as shipped, because that is where the defect is user-visible — asserting the seven
   years 2032–2038 are no longer $0 federal tax, with the post-decision counterfactual figures hand-verified.
4. A no-portfolio household: the bridge contributes $0 and every figure is byte-identical to the pre-fix build. This
   is what proves `t17`/`t18` are legitimately unmoved rather than accidentally so.
5. Engine C's MAGI carries the same draws (if D-6 is yes).
6. Gated per leg: the frozen v5.73 leg asserts the **pre-fix** figures, so the pair is the before/after witness.

**Negative controls, each shown to fire** (§B2 — coverage is demonstrated, never inferred):

- zero the draw series at the call site → the agreement assertions fail;
- publish the draw but never add it to `ordinaryIncome` → they fail;
- import the draw into Engine B while leaving Engine C alone → the cross-engine MAGI case fails;
- perturb Engine D's growth by 10% → the shared-path assertions move (the 2026-08-11 lesson: a perturbation that
  moves nothing means the coverage was imaginary).

**Existing suites:** re-baseline per §J; `domdiff_withdrawal`'s TAXES leg gated per leg; `t19` asserted **unchanged**
as the proof that Engine D's numbers did not move; `t31` re-run after the METHODOLOGY and Field Manual edits; the
**MC-parity guardrail must stay 10/10** (§E) and is the hard line for "the simulators were not touched."

---

## 9 · Disclosure this ships with

1. **The Taxes tab's "as-is" sentence (L10141)** and the outside-input line above it (L10140) — rewritten to name
   spending withdrawals alongside realized capital gains. Per §B2's lock rule, **every assertion that guards the old
   copy must be found and inverted in the same release, gated per leg.**
2. **The Field Manual** — the same sentence appears once in `DOCS_HTML` (L4043) and must move with the tab. Edit with
   quote-free anchors; it is one 153,907-character line.
3. **`METHODOLOGY.md`** — a new section beside "Capital gains in the drawdown, and where they are taxed" (L1248),
   stating: which engines share the drawdown, the units decision (D-3), the QCD divergence (D-5), the scenario
   coupling (D-8), and Engine A's exclusion (D-7), each with its direction.
4. **Four in-app version sites** on the bump: footer, DATA LOAD header, Field Manual callsign, Field Manual footer
   (`t1` STATIC asserts all four).
5. **CHANGELOG** entry with the per-suite breakdown and the limitations named rather than implied.

---

## 10 · Reproduce

From a clone, per OPERATIONS §B:

```
./qa/mk_runfolder.sh v572 v573 <pool DangerClose-v5_72.jsx> <dir>
cd <dir>/qa/tools/audit_phase2_v573 && node audit_c8.mjs
```

The §3.5 probes — `cf_growth_split.mjs` (the split; it validates its own reimplementation of Engine B's balance loop
against the shipped RMD series before reporting anything), `cf_a2.mjs` and `cf_a2_decomp.mjs` (the A2 variants) — are in
the same folder and are run the same way. **`cf_growth_split.mjs` exits non-zero if its validation fails**, so a future
build that changes Engine B's balance loop will be told rather than quietly given wrong figures.

The three probes written for this scope (`scope_c8_probe.mjs` — the ordinary-draw series and the growth/units
comparison; `scope_c8_probe2.mjs` — scenario and conversion sensitivity; `scope_c8_probe3.mjs` — the partial
counterfactual and its negative control) assert nothing and are counted in no total. **They belong in
`qa/tools/audit_phase2_v573/` in the repo**, because §3's figures are quoted here and a quoted figure with no way to
re-run it is how a scope goes stale.

---

## 11 · Sequencing

1. ~~Steve answers D-1 … D-8.~~ **Done 2026-09-18** — all eight adopted as recommended (§6).
2. ~~The build session computes the to-the-dollar lifetime counterfactual.~~ **Done 2026-09-18, BEFORE any source
   change — see §3.5.** It came out materially different, the session stopped and reported rather than adapting, and
   the result was D-3 narrowed and D-9 raised. **D-9 was answered the same day** (keep `BASE_GROWTH`), so §3.5's
   second row, **$208,416**, is the figure this build must reproduce. The build re-runs the §A freshness check and
   re-measures; a result near $166,270 means D's balance path was copied rather than recomputed (see D-9).
3. Publish Engine D's terms; verify `t19` and MC parity are unmoved **before** touching Engine B.
4. Engine B, then Engine C (if D-6 is yes).
5. New suite, negative controls, full suite from the packaged copies, disclosure sweep, §L packaging.

⚠ **Workspace drift.** Phantom edits have appeared twice in this project. Before building, hash the workspace source
against the shipped hash; if it differs, quarantine and revert rather than assuming the diff is this session's.

---

## 12 · Build record (v5.74)

**Shipped in v5.74.** Everything below was measured in the build session from command output; nothing is restated.

**Before any edit (§11 step 2).** `cf_growth_split.mjs` on a v5.73 run folder: validation worst-year $0.00; shipped
$244,040; the C-8 fix alone $208,416; the D-9 trap $166,270. The premise held, so the build proceeded.

**The build.** Engine D publishes `tradDraw`, `othOrdDraw` and their sum `ordDraw_y` — a no-op on its own numbers
(825 published values across 25 rows compared to v5.73, 0 differ; `t19` 65/65; MC parity 10/10). Engines B and C take
`ordDrawByYr`, add it to ordinary income (Engine C: to `_prov86` and `magi` both) and to the pooled outflow that leaves the
Traditional balance, and publish it per row. Lifetime RMD in the Taxes tab $1,625,926 → **$1,321,030**, matching §3.5 to
the dollar; Engines B and C agree on draw and RMD to $0.00 every year.

**Figures, both bases.** As rendered (gains passed): $244,040 → **$208,445** (−$35,595, −14.6%); gap years 2032–2038 $0 →
$9,325. On this scope's basis (no gains): → **$208,416** (−$35,624); gap years $9,315. The $29 between the bases is the
realized gains reaching Social Security taxability once the draws lift gap-year income. The gap years are hand-verified to
the cent against an independent Rev. Proc. 2025-32 / §86 oracle in `t40`. The §3.4 cross-check figure (+$16,160) is on
UNDEFLATED draws — it predates D-3's narrowing — and the new engine reproduces it at +$16,159 on that basis.
> ⚠ **CORRECTED 2026-09-21 (second build session).** *"As rendered"* above is wrong. The Taxes tab opens with the Roth
> slider's default $70,000/yr of conversions and a 2.0% taxable yield (`useState(70000)`, `useState(2.0)`; a parser census
> finds no other setter call), and the $208,445 basis holds both at zero. The views a user meets, measured on this build
> through each build's own call path: **as-is** (no conversions, no QCD, 2% yield) $244,040 → **$208,730** (−$35,309,
> −14.5%), gap years $0 → $9,575; **first open** $210,051 → **$211,591 (+$1,540)** — the correction raises the figure
> there. The $9,325 / $9,315 gap-year totals above sum per-year ROUNDED values; rounded once at the end they are $9,325 /
> **$9,316**. The text above is left as written.

**Departure 1 — §8 items 1–2 restated (decided on recommendation, reversible).** As written they ask Engines B and D to
agree on ordinary income "to the dollar" and on lifetime RMD "live". Under D-3 and D-9 no correct build can: D-3 deflates
only B's draw term and D-9 keeps B on 4.5% against D's 3.518% (B $1,321,030, D $1,021,349). `t40` asserts instead that the
DRAW agrees to the cent, and pins the RMD gap as a known divergence — the remedy item 2's own parenthetical prescribes.

**Departure 2 — the walk is one function (decided on recommendation, reversible).** §4 listed two call sites; both now call
`withdrawalPlanSeries`, exported to the harness through a guarded shim entry. Without it, §8's first negative control
("zero the draw series at the call site") could never fire: the call sites sit inside the React component, and a
module-level test would rebuild the series itself and pass straight through a broken one. Parser census: one definition,
exactly two call sites. Behaviour-preserving, re-proven after the hoist ($208,416, $1,321,030, Engine D unmoved).

**Negative controls** (`qa/tools/controls_v574_c8.py`): M0 unmutated passes; M1 zero the series fires 9; M2 balance without
income fires 4 and lands at $187,232 — a half-built fix reads as a BIGGER improvement; M3 Engine C left alone fires 4; M4
Engine D growth +10% fires 8 (D's RMD moves $65,524, B's only $27 — D-9's insulation, measured); M5, added beyond §8's four,
Engine B adopting D's 3.518% fires 4 and lands on exactly $166,270, the brief's trap figure, by a second route.

**What the build found that this scope did not know.** (1) The six probes print byte-identical output bound to v5.73 or
v5.74: Engine B's change engages only when the series is passed, so they reproduce every figure here on either build and
confirm the fix on neither — `cf_growth_split.mjs` now ends with a build check that drives the real bridge. (2) A
"no-portfolio" fixture is not empty to Engine D: its taxable sleeve is `household − total401k`, which stripping positions
does not zero; $4,414.03 of gains remain, pinned in `t40`. (3) Three suite version gates are ternaries (`t1` `verStr`, `t4`
`_badge`, `t24` `_k`); a regex roll misses all three. The completed roll was verified by AST in both classes — no
`"v573"` literal line lacks `"v574"`, and the one identifier-keyed registry (`t33` PINS) carries it.

**Second build session (2026-09-21) — the zip was verified (md5 and all 38 files) before anything was built from it.**
- **The first complete full run** on the handover build: 4,162 app checks, 0 failed, 0 DIED; MC parity 10/10; `t19` 65/65.
  `domdiff` was 30 passed, 2 failed: its Taxes and IRMAA identity checks predate this release, which moves both tables by
  design. It gained a bounded `v573→v574` branch in the v5.43/v5.47 idiom — the figures must DIFFER, so a dead call site
  still fails — and a first bound on the count of $-figures was **measured false** (134 vs 140: exact-$0 cells fill in) and
  replaced by rows. Controlled: a v5.74 leg rendering v5.73's bundle fails exactly the two DIFFER checks.
- **Departure 3 — the detail panel (beyond §4's census; decided by Steve 2026-09-21).** Working that bound exposed it: the
  Taxes tab's "Gross taxable income by source" listed six of the nine terms of `grossTaxableAll`. v5.73 already omitted
  dividends/interest and other ordinary income; the handover build added the draw to the total and not the list (2029:
  $108K of sources under $152K). The fix lists all nine and publishes `otherOrd_y` on Engine B's row. Display-only — no
  engine figure moves. Source `2f8a22c8…` (the handover's) is **superseded, unshipped**; the build is `1ff04dee…`.
- **Decision 3 is replaced (Steve, 2026-09-21).** The release headlines the as-is reading above and states first open
  beside it; the scope basis stays the pinned acceptance figure. METHODOLOGY, `t40`'s header and A5 are corrected.
- **`t40` sections D and E.** D derives the term set of `grossTaxableAll` from the engine by AST and asserts the panel lists
  it exactly, then that the listed fields sum to the total to the cent on both views; E pins both views and **E0** ties
  "first open" to the source's `useState` defaults. v5.73 leg 27, v5.74 leg 34.
- **Controls M6–M8** (same script): drop the draw line — 2 fired (D1, D2); drop the dividends line — 2 fired (D1, D2);
  change the conversion default — 1 fired (E0). M0–M5 re-run on the new source: M0 passes; M1 13, M2 9, M3 5, M4 12,
  M5 6 fired. **9 of 9 behaved as required.**
- **A session fact for OPERATIONS §B:** a background job dies when the tool call that started it returns unless it is
  `setsid`-detached; across a turn boundary it is unreliable — gone after an hour's gap, still alive after a minute's, when
  a resumed earlier run wrote into the new run's folder and sentinel. So one run at a time, started and finished in one
  turn, with a fresh sentinel. The first session's run, "killed at `t35-v574`", fits this better than the `pgrep`
  explanation it recorded.

**Still open, recorded rather than fixed:** D-4's conversion-cap divergence, D-7's Engine A gap (unmeasured), D-5's QCD
divergence (disclosed in-app), and E-22's other `BASE_GROWTH` projections — including Engine C's hardcoded `1.045`.
D-4 and D-7 are **re-homed** in `FlawsToFix-v5_73-Phase2.md`'s post-audit update, because this file leaves the pool at
the v5.74 ship and was their only pooled record.
