# SCOPE — the Roth tab's omitted dividend and capital-gain terms (D-10's modelling half)

| Field | Value |
|---|---|
| Status | ☑ **RETIRED: BUILT AND SHIPPED AS v5.53 (2026-08-28).** Source `12a007ed8e57a391acba67b799eb5a2f`, built `index.html` `c99fd1fe27998e1dff2aa192c7e48ea2`, suite **2,724 app checks / 0 failing**. Body kept as the record of what was decided; **read the status line, not the prose tense** — everything below is written as pending work and is not. *(Superseded status line: 🔨 BUILT, SUITE GREEN, NOT YET SHIPPED (2026-08-27).* Source and tests complete; artifact, documents and packaging remain. See §9 for what the build found and §10 for what is left |
| Build | **v5.52** · `src/DangerClose.jsx` md5 `40fd122d557a4fb00653c3e4384e1650` · repo `8acc62f` · every citation below re-resolved BY CONTENT against that source |
| Supersedes | `SCOPE_FIX_roth_tab_div_capgain.md` (2026-08-21, base v5.41 `18152190e9b699529642ae2983b3ae2c`, target v5.42, never built) |
| Parent | `MissingFeatures.md` **D-10**. Its disclosure half shipped at v5.52; this is the modelling half |
| Kind | **Modelling fix.** `src/` change · version bump · new structural invariant · METHODOLOGY update. **Figures WILL move — this is not a disclosure release** |
| Direction of the defect | ⚠ **Optimistic** — the omitted terms understate MAGI, understate the IRMAA trigger, and flatter the plan |
| Target | **v5.53** |

---

## 1. Why the predecessor scope could not be built from

It was written against **v5.41** and is now eleven releases stale. Re-resolving it produced four
corrections, three of which change a decision or a test:

1. **D-3 is dead.** It asked whether to copy Engine C's HSA-inclusive dividend base or fix it at the
   shared helper. **v5.47 already fixed it, at all three engine sites**, and `t1` STRUCT S-9 pins
   it — including that none of the three retired forms survives. Engine C now reads
   `Math.max(0, _taxableInitI - (_rsbC.othHsa || 0))` at **L4432**. There is no overstatement left
   to propagate. The ladder can copy Engine C's expression and inherit a correct base.
2. **The ladder total was wrong by 7×**, and in a way that flips D-2's reasoning (§3).
3. **Every line citation moved** (§2).
4. **The precision ceiling applies to a different layer than the scope assumed** (§5).

## 2. Census — re-resolved by content at v5.52

| Site | v5.41 (old scope) | **v5.52** |
|---|---|---|
| Ladder closure | ends L9485 | **L8787–9623** (`<anon>`, AST) |
| Ladder `nonSSincome` | — | **L8947** — `pension + spouseBWork + conv_y + rmd_y` |
| Ladder `magi` | L8997 | **L8997** — `pension + spouseBWork + taxableSS + conv_y + rmd_y` |
| Ladder `grossTaxable` | — | **L9002** — same arithmetic, different quantity. ⚠ Pin the ASSIGNMENT, never the arithmetic |
| `irmaaThresholdLookback` / `triggersIrmaa` | — | **L9027 / L9028** |
| Engine C `magi` | L4459 | **L4459** — `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| Engine C `div_y` | — | **L4432** (HSA already held out, v5.47) |
| Engine C `capGain_y` | — | **L4435**, reading `_gainByYrI` |
| `gainByYr` built | L9494 / L9777 | **L9631 / L9914** — both OUTSIDE the ladder closure, eight lines after it ends |
| Engine C dividend base | L4395 | **L4374** — `taxableInitAll()`, constant for the plan |
| `runRothStrategies` decaying base | L3826 | **L3768** — inside `run(policy, baselineSubByYr)` |

⚠ **Both sites assign to a variable literally named `magi`.** That is why "one label, two figures"
stayed invisible, and it is why v5.52's `t1` pins count OCCURRENCES rather than test presence.

## 3. The effect, re-measured at v5.52 — engine-exact, not DOM-read

Method: `div_y` isolated as `computeIrmaaPlan(taxYield = real) − computeIrmaaPlan(taxYield = 0)`,
using the engine's own arithmetic rather than a re-derivation; `capGain_y` read directly from
`computeWithdrawalPlan(...).schedule`. The app's live default yield is **2.0%** (`useState(2.0)`,
**L5351**) — the portfolio object carries no `taxYieldPct` field, so a measurement that reads the
portfolio alone silently gets 0 and understates everything.

| Household | omitted / yr | across the ladder | verdict flips |
|---|---|---|---|
| Shipped example, 2.0% yield | mean **$454**, max $762 | $4,542 | 0 of 10 |
| $1.5M brokerage @ 2% | mean **$30,454** | $304,542 | 0 of 10 |
| Same sleeve, MAGI beside the tier-1 threshold | mean **$30,420** | $304,200 | **5 of 10** |

**Two findings that matter more than the totals.**

**(a) The old $630 figure was the GAINS half only, and gains are negligible.** Realized gains
contribute **$342 across ten ladder years** on the example household and **$0** on both constructed
ones. Dividends are the entire effect. The predecessor scope read $630 as the whole omission and
built D-2's cheap option on it.

**(b) Size and harm are unrelated.** The $1.5M-brokerage household carries a $30,454/yr omission —
about a quarter of its MAGI — and flips **nothing**, because its cliff headroom runs $98K–$127K. The
near-cliff household carries the same omission and reads **tier 0 in five years where it is actually
in tier 1**, failing to warn about **$11,500** of surcharge. What determines harm is proximity to a
threshold, not magnitude. `MEASUREMENT_roth_tab_magi_v5_40.md`'s "8 of 8" was a household tuned to
sit on a cliff: reachable, not typical.

⚠ **A measurement error worth carrying forward.** The first flip test examined only rows whose FULL
magi sits in tier 0, so it could not see the case that matters — full in tier 1, narrow dropping to
tier 0 — and reported **0 flips on a household with 5**. The corrected version compares tiers from
two engine runs instead of reconstructing thresholds. Same class as the fixture traps in
OPERATIONS §B2: it reported green because it could not reach the behaviour.

## 4. Decisions — resolved 2026-08-27

⚠ **Resolved by Steve delegating to the recommendations, not by the recommendations standing
unopposed.** D-2 in particular was put to him as his call and returned; it is the one a later
session may legitimately revisit, and it must not be treated as settled-by-default.

| # | Decision | Resolution |
|---|---|---|
| **D-1** *(load-bearing)* | How are the terms taxed in the ladder? | **(a) MAGI and §86 only.** Add to `nonSSincome` (L8947) and `magi` (L8997); leave `grossTaxable` (L9002) alone. The IRMAA and Social Security figures become correct; the tax and marginal-rate columns keep doing exactly what they do today. Full preferential-rate treatment is a second bracket walk and is **its own release, not this one** |
| **D-2** | Where do realized gains come from? | **(c) Dividends only — gains stay out.** $342 across the entire ladder on the example household, $0 on both constructed ones. Hoisting `gainByYr` out of a closure for that is real plumbing for no measurable benefit. ⚠ **The cost is exactness of the equality invariant** — see §6 |
| **D-3** | The HSA in the dividend base | **MOOT.** Fixed at v5.47 across all three engines, pinned by `t1` STRUCT S-9 |
| **D-4** | Does the dividend base decay? | **Constant**, at `taxableInitAll()` — matches Engine C (L4374), and it is the conservative direction (higher MAGI for longer). The disagreement with `runRothStrategies`' decaying `taxBal` (L3768) is **disclosed in METHODOLOGY, not reconciled here** |

## 5. Explicitly out of scope

- **The tax and marginal-rate columns.** D-1(b). They ignore dividends today and will continue to.
- **`work_y` vs `spouseBWork`.** The third divergence. Engine C's term covers the household's other
  income streams; the ladder's covers one spouse's. **Untouched, and it means the term sets are still
  not identical after this release** — see §6.
- **Reconciling the constant and decaying dividend bases.** D-4 disclosed, not fixed.
- The SS-cliff term at L8841–8844.
- Any change to `otherTaxableInit()`. Seven call sites depend on its spendable-cash view and
  `t1` S-9 asserts it positively.

## 6. ⚠ The invariant this release exists for — and what D-2 costs it

The predecessor scope's §7.2 called term-set equality "the main reason to build it," and that is
still true: an assertion that the ladder's `magi` term set equals Engine C's would have caught the
v5.41 RMD defect and this one. **But D-2 and §5 together mean the sets will NOT be equal after this
release.** Two terms remain out: `capGain_y` by decision, `work_y`/`spouseBWork` by scope.

So the invariant must be written as **equality modulo a NAMED exclusion list**, not equality. That is
weaker, and the weakness has to be visible in the assertion itself rather than buried:

> the ladder's `magi` term set == Engine C's, **minus `{capGain_y}`**, **modulo the accessor renames**
> `pension`↔`pen_y`, `spouseBWork`↔`work_y`, `taxableSS`↔`ssTaxable`, `rmd_y`↔`rmdTax_y`

⚠ **An exclusion list is a lock** (OPERATIONS §B2). It goes green *because* the term stayed out. If a
later release adds `capGain_y`, this assertion must be tightened in the same release or it will hold
the omission in place and pass for the wrong reason. **Say so in the assertion's own comment.**

## 7. Tests it ships with

1. **`t1` STRUCT — the ladder's term set**, gated per leg, with v5.52 and earlier continuing to
   assert their own sets. Pin the ASSIGNMENT (`const magi = …`), never the arithmetic — it also
   appears at L9002 as `grossTaxable`.
2. **The equality-modulo-exclusions invariant of §6**, with the lock warning in its comment.
3. **Dollar assertions at the ENGINE layer, not the DOM.** ⚠ The predecessor scope put these at the
   rendered figure and then noted the effect was inside the ±$500 ceiling. On the example household
   the effect is **$454/yr mean** — genuinely below the render ceiling, so a DOM assertion cannot
   see it. Assert against `computeIrmaaPlan` directly, `t17`-style, where the figures are exact.
   The DOM leg's job is only to prove the tab renders *something* that moved.
4. **A near-cliff fixture, mandatory.** The example household flips no verdict, so a suite built on
   it alone would assert the fix while never exercising the behaviour the fix exists for. Ship the
   §3 near-cliff household and assert the five flipped years resolve to the correct tier.
5. **Non-dividend years unmoved** — the v5.41 pattern: what this release does not claim to change
   is pinned as unchanged.
6. **Negative controls, mandatory.** Perturb the dividend term, the base, and the yield; each must
   fire. ⚠ **Include a control that the flip test can DETECT a flip** — the §3 error is exactly the
   shape that reports green from an unreachable behaviour.

## 8. What this still does not fix — say so in the CHANGELOG

The Roth tab's MAGI will remain narrower than Engine C's by **`capGain_y`** (decision) and by the
**`work_y` / `spouseBWork`** difference (scope). v5.52's in-app disclosure names dividends and
realized capital gains; **if this release adds dividends only, that copy becomes wrong** and must be
narrowed in the same release — the ladder footnote at L9297 and Field Manual §13, both of which
`t31` and `t4_dom` currently assert. **A release that fixes half the disclosed defect and leaves the
disclosure unchanged is the v5.26 failure again** (OPERATIONS §B2: a disclosure assertion becomes a
lock the moment its disclosure becomes false).


---

## 9. What the build found — added 2026-08-27, at the end of the build session

Four things this scope did not anticipate. All are settled; they are recorded because the next
release in this area will meet them again.

**9.1 ⚠ THE DOM DIFF CANNOT WITNESS THIS RELEASE.** `domdiff_withdrawal.mjs` reports **32** on the
v5.52→v5.53 pair — the reading that means *no figures moved* — and it is **correct and meaningless**.
Its own header says it walks the Withdrawal, Taxes and IRMAA tabs. **The Roth tab is not among
them.** The release's headline gate is structurally blind to the tab the release changes. `t32`'s
header records this; §7 of this scope did not notice it either. A green number that means less than
it looks like (OPERATIONS §B2).

**9.2 Two suites model §86 and BOTH had to gain the term.** `t24` failed 7 and `t28` failed 12 on the
current leg. Neither was a defect: both build an independent §86 statute model, and **neither model
carried a dividend term while Engine C's `_prov86` always has.** They were asserting the *pre-fix*
expression. Corrected by adding the statutory term to the MODEL, bound to the app's own accessors so
it tracks the household rather than freezing a figure, and gated to v5.53.

⚠ **The ordering matters and should be repeated.** In `t24`, correcting the oracle fixed 4 of 7
outright; the remaining 3 were frozen K-figures on rows the corrected oracle then validated to
±$500. **The oracle is the independent derivation; the spot pins are pins on it.** Fixing the spot
figures first would have been adjusting expectations until they matched.

**9.3 `t8`'s census pin caught the new call site.** `taxableInitAll` went from 1 definition + 7 call
sites to 1 + 8, because `_divLadder` reads the same taxable base Engine C does. The pin went red,
which is it working. ⚠ `t8` takes no version tag — it reads the root `DangerClose.jsx` alias, so it
always describes the CURRENT build and is **not** gated per leg.

**9.4 The health warning was added, by Steve's decision of 2026-08-27.** The `IRMAA?` column header
now renders **`IRMAA? †`** and the footnote opens *"† The IRMAA? column is an indication, not a
verdict."* ⚠ **Framed as a PERMANENT qualifier, not an interim notice.** The question was put as
"until the fix ships" — but v5.53 *is* the fix, so a temporary notice would be obsolete on arrival.
What remains true afterwards is narrower: the verdict stays approximate because `capGain_y` and the
`work_y`/`spouseBWork` difference are still out. **Do not remove this when the last two terms land —
revisit the wording instead.**

## 10. State at the end of the build session

**Source complete.** `v553.jsx` md5 `12a007ed8e57a391acba67b799eb5a2f`, built from v5.52
`40fd122d557a4fb00653c3e4384e1650`. `METHODOLOGY.md` updated.

**Suite green, both legs, from suite output:**

| | passed | failed |
|---|---|---|
| prior leg v5.52 | 1,018 | 0 |
| current leg v5.53 | 1,022 | 0 |
| parity | **10** | 0 |
| feature suites run once | 668 | 0 |
| **app total** | **2,718** | **0** |
| tooling (`t21` 50, DOM diff 32) | 82 | 0 |
| **grand** | **2,800** | **0** |

`t32_ladder_dividend.mjs` is **new** — 12 checks on the current leg, 11 on the prior, with the
near-cliff fixture of §7.4 and the four negative controls of §7.6 including the detector control.

**Not done:** the built artifact, the documents, and packaging. Listed in the session brief.
