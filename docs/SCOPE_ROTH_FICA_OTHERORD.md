# SCOPE — the Roth comparator charges FICA on rental and annuity income (v5.63)

**Destination: project knowledge, AND `docs/` in the repo.** Standard scope handling; it becomes the
build record when the release ships.

**Build:** v5.62 · source `827566da23ba3f37a3d7a66432afddfe` · repo tree `2d23fe3`.
**Baseline recomputed this session: 2,934 app checks, 0 failing** (per-leg 1,126 ×2, run-once 672,
parity 10, `smoke_built` 16/16).
**Status: DECIDED 2026-09-03 — BUILD STARTED AND STOPPED. Not shipped.**
D-1 withdrew itself on inspection; D-2 through D-5 were decided by the maintainer, all in the
direction this scope recommended. The build then ran as far as the engine fix and the suite
registration and stopped there. **`STOP-REPORT-v5_63-fica-workbench.md` is the live entry point** —
it lists what remains, and it supersedes this file for the question "what do I do next."

⚠ **This scope is deliberately NOT marked FULFILLED, and it is on `package_check`'s I-2 OPEN
allowlist.** Nothing has shipped. The allowlist entry expires the moment v5.63 ships, at which point
§7 becomes the build record and the head of this file gains a FULFILLED marker.

Companion evidence: `FINDINGS-v5_63-otherOrd.md`. Everything asserted here was printed by a command;
nothing is carried from the session brief, whose premise this scope replaces.

---

## 1 · Premise, verified

Two separate claims, one false and one newly found.

**(a) The disclosed `otherOrd` gap does not exist.** Executed with four ordinary streams live:
`streamsAnnualAt(yr,{tax:"ordinary"})` = 54,996 = `{kind:"work"}` 18,000 + `{excludeKind:"work"}`
36,996. Driven through both engines on the same household varying only `kind`, the Taxes engine's
state tax is **1,246 either way**. The Roth engine passes the same total. The gap v5.62 disclosed
is not there.

**(b) The Roth comparator charges FICA on non-work ordinary income.** L3767 folds *all* ordinary
streams into `work`; L4127 charges 7.65% on `work`. The Taxes engine splits at L5167–5168 precisely
so FICA lands on one half only (L5264) while the state base gets both (L5275). The Roth engine never
made the split. Measured, $24,000/yr joint stream, GA, varying only `kind`:

| | Roth lifetime tax | Taxes engine FICA | Taxes engine state |
|---|---|---|---|
| as **work** | 363,472 | 1,836 | 1,246 |
| as **rental** | **363,472** | **0** | 1,246 |

Identical to the dollar across 32 years in the Roth engine — only possible if the rental is being
charged payroll tax. 7.65% × 24,000 = 1,836, exactly the Taxes engine's delta.

**This changes the model's recommendation.** Shipped engine vs the candidate across a 336-household
sweep (7 states × 6 conversion levels × 4 stream sizes × both filing statuses): **36 households — 10.7%
— change which strategy scores best on `estate`**, the field the Roth tab ranks on. The smallest
shipped top-two gap among them is **$301**; flips concentrate in single filers (33 of 36) and larger
streams (29 at $6,000/mo, 7 at $1,500/mo), but 3 are MFJ and they occur with and without a state
code. This is not a cosmetic overstatement — it moves recommendation-shaped output.

## 2 · Site census — AST, `census.cjs`

`streamsAnnualAt`: **6 AST hits.** Three consumers are unfiltered (L3767 Roth comparator, L4446
`computeIrmaaPlan`, L8997 Roth tab ladder); two are the Taxes engine's split (L5167/5168).
`work` inside `runRothStrategies`: **6 source sites** — L3861 (bind), L3895 (`base`), L4005 (state,
ACA sale sub-engine), L4008 (**FICA**, ACA sale sub-engine), L4124 (state), L4127 (**FICA**).

**The engine has TWO FICA sites, not one.** `_estSaleGain@3981` carries its own copy at L4008. A fix
that touches only L4127 leaves the ACA-bridge path defective — and the ACA path is exactly where
income streams matter most.

## 3 · The change

Five edits; the two FICA lines are **not touched** and become correct automatically once `work`
carries only earned income.

| site | from | to |
|---|---|---|
| L3767 | `annualWork = yr => taper + round(streamsAnnualAt(yr,{tax}))` | `{kind:"work",tax}`; **new** `annualOtherOrd` with `{excludeKind:"work",tax}` |
| L3861 | `const work = annualWork(yr);` | + `const otherOrd = annualOtherOrd(yr);` |
| L3895 | `base = pen + work + rmd` | `pen + work + otherOrd + rmd` — **value unchanged**, decomposition explicit |
| L4005 | `work: work` | `work: work + otherOrd` |
| L4124 | `work: work` | `work: work + otherOrd` |

`computeIrmaaPlan` L4446 and the Roth tab ladder L8997 stay unfiltered: both consume the total and
neither charges FICA, so they are correct as written. See decision **D-3**.

## 4 · Blast radius — measured, and NOT what I first assumed

A scratch candidate was built and both engines run on identical fixtures. Controls first:

```
CONTROL no streams    identical: true
CONTROL work stream   identical: true
CONTROL rental stream identical: false   (must be false)
```

So the change bites only where it should. On the $2,000/mo rental household:

```
totConv, endTrad, endRoth : unchanged      totTax -57,671   estate +130,228
```

⚠ **But on an IRMAA-positive household ($5,000/mo rental, $250k conversions) `totIrmaa` moves
−1,740 and `totNiit` +19.** My first control claimed MAGI could not move "by construction" and
printed `false` against a household that could actually reach IRMAA — the weak control caught my own
overreach. The path is second-order and familiar from v5.38: a smaller tax bill changes the funding
draw, which changes the taxable pool, which changes later dividends, which changes MAGI. **The
release cannot claim IRMAA and NIIT are untouched.** It must hand-verify one household where they
move and state the mechanism.

## 5 · Tests

- **Extinction, engine-level:** a rental stream and a wage stream of equal size must produce
  **different** lifetime tax in the Roth comparator, by exactly the FICA on the non-work half. The
  shipped v5.62 build fails this; that is the point.
- **Identity, executed:** replace the mislabelled `t10` §2E pin with a check that actually runs
  `streamsAnnualAt` three ways with **non-zero readings on both sides** and asserts the complement.
  A `0 === 0` version of this check is worse than none — it is how the false claim survived.
- **The second FICA site:** an ACA-bridge household (`acaPremium`/`acaSize` set) with a rental
  stream, so L4008 is covered independently of L4127.
- **Second-order pin:** one household with `totIrmaa > 0`, hand-verified to the dollar, so the
  MAGI movement in §4 is asserted rather than discovered again later.
- **Disclosure parity:** `t31` reads `METHODOLOGY.md`; the corrected sentence needs its key.
- **Suite regex re-run** per §B1a — the corrected copy must be tested against every live matcher, not
  grepped for.

**Version-bump cost, re-derived this session with `vercensus.cjs`: 15 files, 16 ladder entries,
62 gated expressions, 78 judgement points.** The gated ones are judgement, not a script.

## 6 · Out of scope

- The unfiltered-but-harmless sites L4446 and L8997 (unless **D-3** says otherwise).
- The income-conditioning field (`SCOPE_INCOME_CONDITIONING.md`) — still waiting, and its §6
  premises still need re-verifying by execution before anything is built on them.
- Connecticut, and the two other open findings in `AUDIT_STATE_INCOME_BASES_ROUND5.md`.
- The owed D-a statutory check, the `mammoth` lockfile, `package_check` section K's pre-upload
  failures, and the `qa/tools/` home for probes.

## 7 · Decisions — ALL RESOLVED 2026-09-03

*Recorded as written, with the outcome on each. Kept rather than deleted: §G prefers retiring to
deleting precisely because the reasoning is what a later session needs, and the outcome alone is
what deletion keeps.*

**D-1 · The $1 double-rounding — WITHDRAWN, the fix already closes it.** The gap was between the
shipped Roth engine's `round(total)` and the Taxes engine's `round(work) + round(other)`. AST-resolved
against the candidate, the fix makes the Roth engine round each half independently at L3767/L3768 —
**the identical expression the Taxes engine uses at L5167/5168**. There is nothing left to decide and
nothing to disclose: post-fix the two engines compute the same arithmetic, not merely the same value
to within a dollar. `METHODOLOGY` should say they agree, without the hedge.

*(This entry originally recommended leaving the gap and hedging the wording. That recommendation was
made before the candidate's own structure was checked, and it was wrong.)*

**D-2 · What `METHODOLOGY` says about the history.** Options: (a) describe only the corrected
behaviour; (b) also record that v5.62 disclosed a gap that did not exist. **Recommend (b), briefly.**
A user who read the v5.62 text deserves to know it was withdrawn, and this project's failure mode is
documents that quietly stop matching.

> **DECIDED: (b).** `METHODOLOGY` records that the v5.62 disclosure was withdrawn.

**D-3 · L4446 and L8997.** Leave unfiltered (correct, but a reader must re-derive why) or make them
explicitly `work + otherOrd` (self-documenting, more sites to bump). **Recommend leave**, with a
one-line comment at each saying the total is deliberate because nothing there charges FICA.

> **DECIDED: leave unfiltered, comment at each.** Both comments are in the workbench source.

**D-4 · The `t10` pin.** Retire the mislabelled `[KNOWN DEFECT pre-otherOrd]` check and replace it,
or keep it renamed to what it actually tests? **Recommend retire** — it asserts that adding $12,000
to a taxed base changes the tax, which no release will ever falsify.

> **DECIDED: retire.** Not yet done — it is item 2 on the stop report.

**D-5 · Ship alone?** This is now a modelling release, not a note correction. **Recommend yes,
alone**, as v5.63, with `METHODOLOGY` updated.

> **DECIDED: ship alone as v5.63.**

**D-6 · How the flip finding is reported.** The 336-household sweep is a grid I chose, so **10.7% is
a property of the grid, not of the user population** — the stream sizes and conversion levels I picked
set it, and quoting it as a prevalence would be a made-up statistic dressed as a measurement.
Options: (a) publish the percentage; (b) report it as an **existence result** — flips occur, found at
36 of 336 grid points, smallest shipped top-two gap $301, concentrated in single filers — and state
the grid; (c) widen the sweep first. **Recommend (b).** It is the only one of the three that says
something true. (c) buys a different arbitrary number for a session's budget.

> **DECIDED: (b), existence result.** Do not publish 10.7% as a prevalence.

## 8 · Workspace state

The scratch candidate `v562fix.jsx` in the session run folder is a **measurement artifact, not a
build**. It was written to produce §4 and must not be treated as reviewed code — the release rebuilds
the edit deliberately from the canonical v5.62 source. Per the workspace-drift caution, if a later
session finds it, quarantine and re-derive rather than shipping it.
