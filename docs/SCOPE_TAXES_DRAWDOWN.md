# SCOPE — the Taxes tab and the drawdown (C-8 / E-21 / D-14)

**STATUS: AWAITING DECISIONS — DO NOT BUILD.** Eight decisions are open (§6). Nothing is built, no source line is
changed, and no version is claimed until Steve has answered them.

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

## 6 · Open decisions — Steve's call

### D-1 · Who owns the drawdown?
**Recommendation: Shape A (Engine D owns it; Engine B consumes).** It is the precedent the file already set at v5.32,
it keeps one drawdown in the codebase, and it is the only option that leaves the Withdrawal tab as the single answer
to "what does this plan actually do." *Rejected:* Shape B (a second copy — E-22); Shape C alone (the tab's own
sentence would have to be un-written rather than qualified, and a "high" finding would stay open).

### D-2 · Draws only (A1), or draws plus the balance path (A2)?
**Recommendation: A2.** A1 is measurably half a fix that makes one half worse: it adds the early tax (+$16,160 on the
example household, §3.4) while leaving lifetime RMDs 59% above the plan's, so the tab would overstate the late years
*more* confidently than it does now. If the budget only stretches to A1, then **A1 must ship with the RMD divergence
disclosed in the same release**, and the scope should say so explicitly rather than treating A1 as a milestone toward
A2. ⚠ *This is the decision that sets the size of the build; everything below is contingent on it.*

### D-3 · Units — nominal draws into a today's-dollars engine
**Recommendation: deflate the draw series to the engine's convention at the call site**, i.e. divide Engine D's
nominal draw by its own cumulative inflator before handing it to Engine B, so the imported term sits in the same units
as the pension and Social Security beside it — and **disclose the choice in METHODOLOGY**, naming the direction.
*Alternative:* import nominal and accept a growing pessimism in the back half. *Do not:* leave it undecided — that is
how the same boundary got crossed silently at v5.36, and the same question should be answered for `gainByYr` in this
release. **The counterfactual in §3.4 was computed nominal**, so the lifetime figure will move once this is settled.

### D-4 · Roth conversions
The two engines already agree on the conversion *input* (`rothAmount`) but cap it differently: Engine B at
`tradBal − max(rmd, qcd)` (L5610), Engine D at `tradNotional_boy − rmd` (L5155), and only Engine B knows about QCDs.
**Recommendation: leave the conversion arithmetic alone in this release** and record the cap divergence as a
follow-up finding. Under A2 the caps converge on their own, because both would then be measured on one balance path;
under A1 they do not, and that is another reason to prefer A2.

### D-5 · QCDs
The QCD lever is Engine B's alone: Engine D has no QCD concept, so gifted dollars never leave the drawdown's portfolio
and a QCD makes the two balance paths disagree by construction. **Recommendation: out of scope for this release, and
disclosed** — the QCD modeler is explicitly a what-if, so the honest statement is that setting it above $0 makes the
Taxes tab diverge from the Withdrawal plan by the gifted amount. *Alternative (more work, cleaner):* Engine D takes
`qcdAnnual` and gifts the money out of its own Traditional pool, which would make the modeler consistent everywhere.

### D-6 · Engine C (IRMAA)
Engine C's MAGI (L4911) has the identical gap and the identical existing bridge (it already takes `gainByYr` at
L4759 and the IRMAA tab already calls Engine D at L10401). **Recommendation: include Engine C in the same release.**
Leaving it out would ship a build where the Taxes tab taxes the draws and the IRMAA tab does not — a new cross-tab
contradiction, created by fixing one. The marginal cost is one call-site loop and one MAGI term; the marginal test
cost is `t17`/`t25`/`t32` re-baselined and one more cross-tab case.

### D-7 · Engine A (the Roth comparator)
**Recommendation: explicitly out of scope, and say so in METHODOLOGY.** Engine A's ordinary base (L4304) is
`pen + work + otherOrd + rmd` — the same gap — but its taxable pool is sold only to fund taxes and ACA losses, and its
output is a *differential* between conversion strategies, where a spending draw common to both paths largely cancels.
"Largely" is doing work in that sentence, so this should be recorded as an open finding with its size unmeasured,
not as a clean exclusion.

### D-8 · Scenario coupling
Engine D's schedule depends on the Monte Carlo scenario, and the draw series moves a long way with it — lifetime
ordinary draw is **$352,485 base, $660,662 bear, $352,386 bull**. The gains bridge already follows the selected
scenario, and the Taxes tab already tells the user so (L10140). **Recommendation: follow the same scenario**, and
extend the existing sentence so it names draws as well as gains. The consequence Steve should weigh: **the Taxes
tab's headline lifetime figure will start moving when the scenario picker moves**, which is correct but new.

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
2. Lifetime RMDs agree between Engine B and Engine D (A2 only; under A1 this becomes a **pinned known divergence**
   with today's figures, so the gap is a checked fact rather than an omission).
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

The three probes written for this scope (`scope_c8_probe.mjs` — the ordinary-draw series and the growth/units
comparison; `scope_c8_probe2.mjs` — scenario and conversion sensitivity; `scope_c8_probe3.mjs` — the partial
counterfactual and its negative control) assert nothing and are counted in no total. **They belong in
`qa/tools/audit_phase2_v573/` in the repo**, because §3's figures are quoted here and a quoted figure with no way to
re-run it is how a scope goes stale.

---

## 11 · Sequencing

1. Steve answers D-1 … D-8.
2. The build session re-runs the §A freshness check, computes the **to-the-dollar lifetime counterfactual** under the
   chosen design (this is the first build task, not the last — if it comes out materially different from §3.4, the
   premise has changed and the rule is to stop and report, not to adapt).
3. Publish Engine D's terms; verify `t19` and MC parity are unmoved **before** touching Engine B.
4. Engine B, then Engine C (if D-6 is yes).
5. New suite, negative controls, full suite from the packaged copies, disclosure sweep, §L packaging.

⚠ **Workspace drift.** Phantom edits have appeared twice in this project. Before building, hash the workspace source
against the shipped hash; if it differs, quarantine and revert rather than assuming the diff is this session's.
