# FINDINGS — the `otherOrd` question, settled by execution

**Destination: project knowledge, AND `docs/` in the repo.** It is the evidence base for the
correction release and for the FICA defect below; the next session needs it and it must not expire
with this one. Delete `SESSION_BRIEF_v5_63_OTHERORD.md` from the pool if it was ever filed there —
it is session-only and its premise is now superseded by this note.

**Build:** v5.62 · source `827566da23ba3f37a3d7a66432afddfe` · built `index.html`
`ceb7fb4af26560b0944030ffb5da1d6a` · repo tree `2d23fe3`.
**Every figure below was printed by a command in this session.**

---

## 0 · Verdict

**Outcome (a), with a correction to the brief's own framing.**

| question | answer |
|---|---|
| Does the complement identity hold? | **YES**, executed with non-zero readings on both sides |
| Do the two engines pass the same state base? | **YES**, measured through both engines |
| Does `spouseBWorkTaper` get different arguments? | **NO** — and it cannot matter; see §3 |
| Is the v5.62 disclosed `otherOrd` gap real? | **NO. The disclosure is false.** |
| Is there a real divergence in this code? | **YES — a different one. FICA. See §4.** |

The brief predicted (a) and (a) is right, but not for the reason it gave, and the session that
disclosed the gap was looking one call away from a defect that is real, larger, and still shipping.

---

## 1 · The identity, executed

`streamsAnnualAt(yr, { tax: "ordinary" })` vs the Taxes engine's two-way split, with **one work
stream and three non-work ordinary streams live** (plus a tax-free stream as a negative control):

```
streams live:              5
all ordinary:              54996
kind:work ordinary:        18000
excludeKind:work ordinary: 36996
work + other:              54996
NON-ZERO BOTH SIDES:       YES
IDENTITY all === work+other: HOLDS
```

The tax-free stream ($500/mo) appears in none of the three readings, so the `tax` filter is doing
its job and the readings are not accidentally totalling everything.

**Why the previous attempt read `0` everywhere.** `getIncomeStreams()` (L510) is

```js
return Array.isArray(PORTFOLIO.incomeStreams) ? PORTFOLIO.incomeStreams : [];
```

With `PORTFOLIO.incomeStreams` absent it returns **a fresh array literal on every call**. Pushing
fixtures onto its return value mutates a throwaway that the next call never sees. The accessor does
not "return a copy" of real data — there was no data, and each call minted a new empty array.
Assigning `PORTFOLIO.incomeStreams` directly (the object is live via `__g.PORTFOLIO()`) works.

**One genuine sub-finding: double rounding.** The identity is exact in real arithmetic, but the two
engines round differently — the Roth engine rounds the **total** (L3767), the Taxes engine rounds
**each half** and adds (L5167–5168, recombined L5275). Forced onto a fractional case:

```
all=3600.9984  work=1200.4992  other=2400.4992   identity HOLDS
round(all)=3601   round(work)+round(other)=3600   delta=-1
```

**Up to $1/yr, direction unpredictable.** Not worth a release on its own; worth one sentence in
whatever ships next, because "the engines pass the same total" is about to be asserted in
`METHODOLOGY` and it is true to within a dollar, not exactly.

## 2 · The six call sites, AST-resolved

`census.cjs` on `streamsAnnualAt` — **6 AST hits**. The brief named two of them.

| L | scope | filter |
|---|---|---|
| 541 | definition | — |
| 3767 | `annualWork` < `runRothStrategies` | **unfiltered** |
| 4446 | `computeIrmaaPlan` | **unfiltered** |
| 5167 | `computeTaxPlan` | `kind: "work"` |
| 5168 | `computeTaxPlan` | `excludeKind: "work"` |
| 8997 | Roth tab ladder < `DangerCloseMain` | **unfiltered** |

Three unfiltered sites, not one. For the **state base** and for **MAGI** the lack of a filter is
harmless, because both consume the total. It is not harmless at L3767 — see §4.

## 3 · `spouseBWorkTaper` — outcome (b) is ruled out twice over

`P.retireYr` (L3767) and `_retireYr` (L5012) both resolve to the same single `retireYear`
`useState` binding in `DangerCloseMain@5327`; every engine's parameter object reads that same
variable (L5427, L9436, L9583, L9696).

More decisively, the taper's **first line** (L1408) is

```js
if (getIncomeStreams().length > 0) return 0;
```

The demo taper and the user's streams are **mutually exclusive by construction**. When any stream
exists the taper is 0 in every engine regardless of the year it was handed; when none exists the
stream term is 0 on both sides. The argument cannot produce a divergence.

## 4 · ⚠ THE REAL DEFECT — the Roth comparator charges FICA on rental and annuity income

L3767 folds **all** ordinary streams into `work`, and `work` is what L4127 charges FICA on:

```js
const fica = work > 0 ? Math.min(work, infl(TAX_CONSTS.SS_WAGE_BASE, yr)) * 0.062 + work * 0.0145 : 0;
```

The Taxes engine gets this right: FICA at L5264 is on `work_y`, which is **work-kind streams only**,
while the state base at L5275 gets `work_y + otherOrd_y`. The split at L5167–5168 exists precisely
so FICA can be charged on one half and not the other — and the Roth engine never made the split.

**Measured, both engines driven directly, $24,000/yr joint ordinary stream, GA, varying only `kind`:**

```
A. Roth comparator, lifetime total tax
   $24,000/yr as RENTAL : 363,472
   $24,000/yr as WORK   : 363,472
   difference           : 0        <-- treated IDENTICALLY

B. Taxes engine, year 2034 row
   as WORK   : fica 1836   state 1246   yr-total 3456   lifetime 117,228
   as RENTAL : fica    0   state 1246   yr-total 1620   lifetime  71,328
   FICA delta 1836   STATE delta 0   lifetime delta 45,900
   7.65% of 24,000 = 1836
```

Two things are proven at once. **The state base is identical** ($1,246 either way) — the v5.62
disclosure's gap is not there. **The Roth comparator cannot tell rental from wages** — identical to
the dollar across a 32-year horizon, which is only possible if FICA is being charged on the rental.

**Size:** 7.65% of every dollar of non-work ordinary income, every year, in every Roth strategy.
It is not conservative in the useful sense — it overstates tax in all strategies at once, so it
inflates the absolute figures on the Roth tab and understates the estate, while partly cancelling
in the strategy-vs-strategy comparison the tab exists to make. It reaches the Roth tab's headline
numbers; it does not reach the Taxes or IRMAA tabs.

**Not yet measured:** how much of it survives the between-strategy comparison, and whether it can
flip which strategy scores best. That needs a reverted-source control run and is the first thing
the scope should ask for.

## 5 · ⚠ The `t10` §2E pin asserts something other than its name — confirmed

`t10_taxcases.mjs` L1090, labelled `[KNOWN DEFECT pre-otherOrd]`, calls `stateTaxAnnual` **directly**
with `work` and `work + 12000` and requires the result to move in all 42 taxing jurisdictions. That
is arithmetic: adding $12,000 to a taxed base changes the tax. It touches no engine, no stream, no
`kind` filter and no comparison between engines. **It passes, it reads as coverage, and it covers
nothing** — while its comment block asserts the false gap in six lines of prose.

## 6 · Corrections owed to the brief itself

- ⚠ **"the Roth comparator is NOT callable" is wrong.** `__g` exports `runRothStrategies` (shim
  L21), and **`t3_roth.mjs` drives it directly** — eleven call sites in that file alone. The
  v5.62 checks asserted argument shape at the source when they could have run the engine. The
  brief's §5 trap should be struck.
- `package_check` section **J could not be run**: it needs a package with a `knowledge/` half and
  no release zip existed this session. **K-0..K-9 green** against pool + clone.

## 7 · Two harness facts not in `TESTING.md`

- **`t22` needs `qa/app_v532.mjs`, which exists in no pool and no clone**, and reports 74/1 without
  it. It must be built from the **v5.38** source (`b8d12481b55cd2ed05c6c6f14e2f41d9`, commit
  `4fa4b8c`) → **85/0**. Built from the *genuine* v5.32 source
  (`7e7be3f869f298667fe994074cfffb06`, commit `5724536`) it reports **81/2**, group F failing
  correctly against a build that predates the ACA gain tax. **The repo carries no git tags at all**,
  so the source is reachable only by unshallowing and finding the commit.
- **`t23`–`t27`, `t29`–`t32` take a version argument and default to `v541`**, dying at module load
  on a missing `dom_v541.cjs`. Run bare in a batch loop they emit no `SUITE` line, which reads as
  silence rather than as failure.

## 8 · Baseline, recomputed

**2,934 app checks, 0 failing.** Per-leg **1,126**, both legs equal (correct — v5.62 changed
wiring, not the calculator): t1 185 · t2 35 · t3 36 · t4 252 · t5 58 · t6 21 · t10 245 · t23 25 ·
t24 38 · t25 45 · t26 25 · t27 18 · t28 34 · t29 54 · t30 12 · t31 31 · t32 12.
Run-once **672**: t7 41 · t8 42 · t9 14 · t11 40 · t12 23 · t13 42 · t14 44 · t15 11 · t16 24 ·
t17 74 · t18 67 · t19 65 · t20 100 · t22 85. Parity **10/10**. `smoke_built` **16/16**.
Tooling: `t21` **50**, counted in no app total.
