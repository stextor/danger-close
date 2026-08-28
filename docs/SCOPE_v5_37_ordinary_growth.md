# SCOPE — v5.37: ordinary money grows, and its growth is taxed (E-15)

> ## ☑ RETIRED 2026-08-28 — BUILT AND SHIPPED AS **v5.37** (2026-08-16).
>
> **Do not build from this document.** The status line below reads *"DECISIONS RESOLVED by Steve,
> 2026-08-16 — ready to build"* and was true when written, against shipped v5.36.
>
> Confirmed by content: `CHANGELOG.md` v5.37 — *"ordinary money grows, and its growth is finally
> taxed (E-15 fixed)"* — is this scope's governing finding and its fix. Body kept as the record of
> what was decided and why.
>
> *Retired 2026-08-28 by the second scope-retirement sweep. The first sweep (§I, 2026-08-26) found seven of nine stale; twelve had drifted again by v5.53. Confirmed by CONTENT against the release that shipped it — not by the presence of a version heading in the CHANGELOG, which is not evidence (see this file's note, and v5.34's).*

**Governing finding:** `docs/ARCHITECTUREIssues.md` E-15 · **Premise verified against:**
`src/DangerClose.jsx` md5 `b7396c1c14861dc149b71e8edb1a00d5` (shipped v5.36), 2026-08-16, by AST
census (`qa/tools/census.cjs`) and direct reading — not inherited from the finding text.
**Status: DECISIONS RESOLVED by Steve, 2026-08-16 — ready to build.** Rev 2 (this revision folds
the ratified decisions into §8 with their concrete forms; no premise or census change).

---

## 1 · Premise, as measured

**The defect.** Engine D's ordinary-character balance never grows. `taxOrd` opens at
`min(_taxOrdInit, _taxInit)` (L4524), is depleted by spending and the sleeve RMD (L4733), and no
line ever compounds it — while the pool it lives inside (`taxable`) grows every year. Consequence,
pinned exactly by `t20` E2: an Other-accounts row taxed as ordinary produces lifetime ordinary
income of **exactly its opening balance** ($600,000 in, $600,000 out) however much it compounds.
The growth on that money is recognised as **nothing at all** — not ordinary income (taxOrd is
exhausted), and not capital gain either, because v5.36's `_gainPoolInit` (L4481) *excludes* the
ordinary share from the gains-bearing pool. Every compounded dollar above the opening balance exits
untaxed. **Direction: optimistic — the wrong direction for this app.**

**Who else sees this money — measured, and it sharpens the finding.** `retireStartBalances` L1701
folds Other-ordinary balances into `tradInitA/B`, and Engine B **compounds** its trad balances
(`tradA = … * (1 + tradGrowth)`, L5141), so the Taxes tab's RMD stream already reflects growth on
this money. Engine A likewise consumes the folded trad. So E-15 is an **Engine D defect with a
live cross-tab divergence**: the Taxes tab taxes RMDs on the compounded balance while the
Withdrawal tab recognises ordinary income only up to the opening balance. Engines A/B/C need **no
change**; the boundary of this release is `computeWithdrawalPlan`.

**Magnitude, as recorded.** t20's fixture: $600,000 at growth over a ~30-year schedule — the
untaxed growth is the dominant term, not a rounding artifact (compare the v5.36 measurement that a
40%-share $400K brokerage pool realizes $215,216 of *gain*; the ordinary pool's untaxed growth on
the same horizons is of that order). The build's first task is the exact figure by independent
simulation (§6), before any code changes.

## 2 · The mechanism today (what the fix must fit into)

One balance, `taxable`, contains three characters tracked three different ways:

| Character | Tracking today | Grows? |
|---|---|---|
| Ordinary (`taxOrd`) | opening value, depleted by `othOrdDraw + _sleeveRmdDraw` (L4524/4690/4699/4733) | **never** |
| HSA (`_hsaInit`) | opening value only; used once in the gain-pool exclusion (L4480–4481) | implicitly, invisibly |
| Gains-bearing (`taxGainPool` + `gainBasis`) | explicit sub-balance, grows capped by `taxable`, depleted by sales, banked surplus enters at full basis (v5.36) | yes |

Spending attribution is proportional: `_ordFrac = (taxOrd − sleeveRMD) / _poolPostRmd` (L4690),
`othOrdDraw = _spendFromTaxable × _ordFrac` (L4699), and `othOrdDraw` reaches MAGI at L4821.
The sleeve RMD is reserved out of `taxOrd` before the spending draw (v5.36's fix for the $102
clamp residual — t20 asserts the residual is exactly 0; the fix must preserve that).

## 3 · Design options

**Option A — grow `taxOrd` symmetrically with the gains sub-pool (recommended).** One new line at
the same point `taxGainPool` grows: `taxOrd = Math.min(taxable, taxOrd * (1 + growth.tax))`, plus a
conservation guard (§8 decision 3). Smallest diff; reuses the v5.36 pattern exactly; `_ordFrac`
then naturally attributes more of each sale to ordinary character. HSA stays implicit. Known
wrinkle: with `taxOrd` and `taxGainPool` growing independently, their sum can exceed `taxable`
after heavy draws — the guard decides who yields (§8-3).

**Option B — full three-character ledger.** Explicit `taxHsa` joins `taxOrd` and `taxGainPool`;
all three grow, all three deplete proportionally, and `_ordFrac`'s approximation is replaced by
ledger reads with an every-year conservation assertion `ord + hsa + gainPool ≤ taxable + ε`.
More correct, materially bigger diff, and it rewrites arithmetic that t19/t20 hand-verified at
v5.36. Recommended only if Option A's guard proves ugly in the build.

Either way, the growth is recognised **when spent** (character attaches to the sale, as today) —
no phantom income on unsold balances, matching how the gains side already works.

## 4 · Site census (AST, against `b7396c1c…`)

All inside `computeWithdrawalPlan` (L4424–4861): `taxOrd` decl L4524 · `_ordFrac` L4690 ·
`othOrdDraw` L4699 · depletion L4733 · MAGI consumption L4821 · inits L4471/4480/4481.
Growth insertion point: adjacent to the `taxGainPool` growth line (L4797 region). Engines A/B/C:
**zero sites** (verified: B's ordinary path is `streamsAnnualAt` + folded-trad RMDs, already
compounding). Parity engines: untouched — **parity must hold 9/9 strict**; if it moves, STOP.

## 5 · What moves (blast radius, to re-derive by hand — never adapt silently)

- **t20 E2:** "annuity − taxable ordinary excess EXACTLY $600,000" becomes *balance + growth
  recognised on it* — the new exact figure comes from the independent simulator. "trad − annuity
  excess exactly 0" **should hold** (both characters grow identically); if it doesn't, STOP.
- **t19 mixed-pool figures:** `_ordFrac` rises over time → `_gainShareOfPool` and the sale split
  shift → the hand-computed sale, sub-pool balances, and $215,216 lifetime gain all move.
  Re-derive with the same independent 25-year simulator, extended to carry the growing `taxOrd`.
- **Engine D MAGI rises** on every ordinary-bearing household → Taxes/IRMAA tabs move through the
  v5.36 call sites → `domdiff` figure regions re-witness (they assert divergence, so they stay
  green, but re-derive deliberately); the Withdrawal tab's identity claim: **measure, don't
  assume** (v5.36's lesson — the schedule's displayed dollars likely don't move, but MAGI-adjacent
  copy might).
- **Disclosure:** METHODOLOGY's v5.36 limitation (b) is being *fixed* — invert it and the
  CHANGELOG bullet in the same release; sweep for locks (§B2) before editing.

## 6 · Tests this ships with

1. The independent simulator (t19's pattern) extended with a growing ordinary balance —
   hand-verification to the dollar of both the new t20 exacts and the re-derived t19 figures,
   **before** engine code changes.
2. t20: re-derived exacts + a new invariant *ordinary excess > opening balance* stated exactly,
   and the E-15 pin's extinction (the exact-$600,000 form must be GONE and asserted gone).
3. Negative control **C13**: revert the growth line → t20's new exact fails; run the full C1–C13
   program (the v5.36 controls all still apply — this release touches their machinery).
4. Conservation invariant per §8-3, asserted every simulated year in t19.

## 7 · Out of scope

The ACA-premium sale's gain (Engine A, needs its own parity-witnessed release — the standing
v5.38 candidate) · S-8 · E-6/E-9 · any Engine B/C change (verified unnecessary) · per-lot or
per-account character tracking (one blended ordinary balance, disclosed, matching the gains side).

## 8 · Decisions — RESOLVED by Steve, 2026-08-16 (recommendations adopted as stated)

1. **Option A — the minimal growth line.** One line in the v5.36 pattern; the verified attribution
   machinery (`_ordFrac`, the sale split) is untouched, so every figure movement has one cause.
   **Fallback trigger, binding, written here so it is a measurement and not a mood:** if the §8-3
   conservation cap binds by more than rounding on any test household, or the independent simulator
   cannot reproduce the engine to the dollar under Option A, STOP and re-scope to Option B.
2. **E-17 rides along, fixtures FIRST.** Step 1 of the build converts t20's object-shaped dobs to
   strings against the UNCHANGED v5.36 engine and records that step's figures alone ("the fixture
   now runs the household it declares"). Step 2 makes the engine change against the corrected
   fixture. Two measured deltas, each with one cause, one release — the v5.36 E-16 sequencing
   pattern. E-17 closes with this release.
3. **Conservation guard: ordered caps, ordinary yields, invariant reports.** The gains pool keeps
   its existing cap; ordinary caps against the residual:
   `taxOrd = Math.min(taxable − taxGainPool, taxOrd × (1 + growth.tax))`.
   Deterministic and hand-verifiable where a proportional squeeze is not. The cap's binding year is
   locally OPTIMISTIC and is not pretended otherwise: the t19 invariant reports every simulated
   year the cap binds and by how much on the test households (expected: rarely, by rounding —
   both sub-pools grow at the same rate). Material binding escalates per decision 1's trigger.
4. **Growth rate: `growth.tax`.** The character balance tracks the balance it characterizes — these
   dollars live in the taxable pool and already compound at `growth.tax`; a different rate would
   desynchronize the sub-pool from its container by construction, manufacturing the violation the
   conservation invariant exists to catch. Symmetry with the gains side. (The `tradGrowth` steelman
   is an argument about where the money should be MODELED — a different, larger release.)

The three design decisions interlock: A + ordered caps + `growth.tax` is a coherent design in which
conservation should hold almost freely, and each element's failure mode is covered by another's
measurement.
