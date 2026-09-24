# SCOPE — a single household is paid spouse B's Social Security (C-7)

**Decisions RESOLVED 2026-09-24 — all five adopted as recommended (§7). Buildable.** Built against **v5.75**, source
`4453cf274ef8c59f5ea610528eed97ab`. Finding C-7 in `FlawsToFix-v5_73-Phase2.md`.

## 1 · Premise — verified on v5.75 by execution, not recalled

The audit recorded C-7 as one unguarded read in Engine D, low–medium severity, reachable "by any user who switches a
household to single, or restores a backup, while spouse-B data is still stored". **Re-verified on v5.75, the finding is
materially larger in reach and impact, and materially narrower in one route:**

**1a. Both in-app routes to "single" already clear spouse B's benefit.** Guided Setup (L3776) and the My Data editor
(L12385) each write `{ tableByAge: {}, planned: 0 }` for a single household on save. Switching to single inside the app
does **not** leave stale data. *The audit's first route is closed.*

**1b. Loading a plan file does not clear it, and nothing downstream catches it.** `validateLoadedPlan` (L3330) checks
shapes only. A plan file with `single: true` and a spouse-B benefit loads unchanged.

**1c. The loader INVENTS a spouse-B benefit for a single household.** `applyLoadedDataUnchecked` L3593–3594: when a
loaded plan has no `incomeSources.ssB`, it inserts `{ planned: 1300, plannedAge: 63, isDefault: true }`. L3604
suppresses the fallback *warning* for single households but not the default itself. **Executed:** the example
household, made single, with its `ssB` block deleted before loading → after load `getSSB()` is **1300**, and Engine D
pays **$308,076** of spouse-B Social Security over the plan. A single person's plan file with no spouse-B section is the
natural shape, not an edge case.

**1d. Measured impact** (`c7_diff2.mjs`, session-only; the example household made single, retirement 2029, base preset,
no conversions; *stored* = spouse-B benefit present, *correct* = zeroed):

| Output | Stored | Correct | Error | Direction |
|---|---|---|---|---|
| Engine D — spouse B's SS paid, plan lifetime | 308,076 | 0 | +308,076 | optimistic |
| Engine D — total spending draws | 767,892 | 1,069,038 | −301,146 | optimistic |
| Engine D — ending portfolio | 1,807,137 | 1,379,868 | **+427,269** | optimistic |
| Taxes tab — lifetime federal tax (via v5.74's draw bridge) | 105,390 | 144,306 | **−38,916** | optimistic |
| Monte Carlo — planned-path end value | 2,128,443 | 2,066,436 | **+62,007** | optimistic |
| IRMAA — lifetime surcharge | 0 | 0 | none on this household | — |

**The Taxes-tab row did not exist when the audit ran**: v5.74 feeds Engine D's draws into Engines B and C, so an
understated draw is now an understated tax. The Monte Carlo row is the app's headline figure's input. **Every error
runs optimistic** — the direction this app exists to avoid. The audit's "low–medium" severity no longer fits.

⚠ **An earlier run of this probe used retirement year 2026 by mistake and produced different figures** ($366,594,
$42,451, $508,236). They are discarded; the household's own `targetRetireYear` is 2029.

**Measured at build step 1 (2026-09-24):**
- **Monte Carlo, fully seeded, one leg per process:** the stored benefit overstates the **median ending balance by
  $61,158** ($1,956,149 against $1,894,991). The success rate is 100% either way on this household — a very safe plan —
  so it cannot show the effect here; a tighter single household's success rate would move.
  ⚠ **Seeding trap, recorded for the next probe:** the simulation's market noise comes from `d3.randomNormal` (L2137),
  and d3 captures its own reference to `Math.random` when the library loads. Replacing `Math.random` after import seeds
  only half the randomness — identical runs then differ by ~$3,000, and a first measurement of $70,110 was contaminated
  by exactly that. The seeded source must be installed, resettably, **before** the app module is imported.
- **Stress tests (`runExtendedMC`): unaffected.** L2373 reads `getSSB()` unguarded but the value is only used at L2378,
  which tests `!_single`. Identical results with and without the stored benefit under an injected seeded `rng`.
- **The thirteen unguarded sites, classified:** safe where used — L2373 (above), L9546 (`_singleRoth ? 0`); affected
  and closed by D-1 — L2090, L2153, L5007, **L6328 (Ask AI is told the household's income)**, L7657, L8283, L8360, L8667,
  L11027, L11423. The direct table reads (L7658–7716, L8116, L8197) render only under `!single` gates (L8113 and L8193
  are whole married-only sections; L7649's spouse-B figures sit inside `!_single`), so D-1 is sufficient.
- **`getSSB()` had a second route to the phantom:** its own `?? DEFAULT…ssB.planned` fallback returns 1,300 when the
  block is missing. D-1 closes it too.

## 2 · The rule

Social Security retirement benefits are paid to the individual who earned them (42 U.S.C. §402(a)). A single household
has no spouse B, so no spouse-B benefit exists to pay. The model's own convention already says so at twelve read sites
and both in-app save paths; C-7 is the thirteen places, and the one loader default, that do not.

*No tax-law question is in scope, so no IRS source is needed; the fix makes an existing output correct.*

## 3 · Site census — parser output on v5.75 (`census.cjs`), not greps

`getSSB` — **25 call sites** (plus its definition at L508). **12 carry an inline single test**: L2274, 4788, 5525, 5977,
7266, 7352, 7626, 10001, 10147, 10644, 10687, 11248.

**13 do not** — classification still to be done at build step 1 (figure-moving vs display-only):

| Line | Function | Note |
|---|---|---|
| 2090, 2153 | `runMonteCarlo` | both simulation loops; gated only by claim quarter — **measured moving** (§1d) |
| 2373 | `runExtendedMC` | stress tests; L2274 in the same function IS guarded |
| 5007 | `computeWithdrawalPlan` | Engine D — **measured moving** (§1d) |
| 6328 | Ask AI context | what the assistant is told about the household |
| 7657, 8197, 8283, 8360, 8667 | tab components | includes an MC note that prints spouse B's benefit (L8075) |
| 9546 | Roth tab | `_rsSsB` |
| 11027, 11423 | tab components | L11248 between them IS guarded |

**Direct property reads that bypass `getSSB`** (`census.cjs ssB --kind=prop`, 27 hits): the loader (L3453, 3571, 3577,
**3593–3594**, 3604), `buildPlanTimeline` (L662), the SS tab's tables (L7658, 7714, 8116), the My Data editor
(L12201–12202), and Engine A's `P.ssB` (L4187), which is fed by callers that already guard.

## 4 · The fix — options in §7; the recommended shape

- **One rule, at the source:** `getSSB()` returns 0 for a single household. That closes all thirteen unguarded call
  sites at once, and any future one, instead of adding a thirteenth copy of the test. The twelve existing inline guards
  become redundant and are left in place (removing them is churn with no behaviour change).
- **The loader stops inventing data:** for a single household, a missing `ssB` block becomes `planned: 0`, not 1300.
- **The direct property reads in §3's third list** are each checked at build: display-only reads of the stored table
  may legitimately show it (for example in the editor); any that feed a figure get the same rule.

## 5 · Tests

- **`t42` (new, both legs).** The v5.75 leg pins C-7 as a dated known defect. On the new leg, for a single household:
  spouse-B SS is 0 in Engine D, Engine B, Engine C and both Monte Carlo loops; Engine D's draws, the Taxes tab's
  lifetime federal tax and the planned path equal the zeroed-benefit case **to the dollar**; and a plan file with no
  `ssB` block loads with `getSSB() === 0`.
- **Married control:** the example household's figures on every tab are unchanged (and `domdiff` stays identical).
- **Extinction invariant:** for a single household, no engine output depends on the stored spouse-B benefit — swept by
  varying it (0, 1,300, 4,000) and asserting every output is identical across the sweep. This catches a future
  unguarded read anywhere, not just at today's thirteen.
- **Negative controls:** remove the `getSSB` guard (the invariant must fire); restore the loader's 1300 default (the
  no-block load test must fire); re-add a single read via `PORTFOLIO.incomeSources.ssB.planned` in Engine D (the sweep
  must fire).
- **Hand check:** at least one Engine D year and one Taxes-tab year recomputed independently to the dollar.

## 6 · Out of scope

Survivor benefits for a married household after a death (a different rule, already modelled); C-4, C-10, C-1, C-9, C-5,
C-11; consolidating the other duplicated rules (E-22) beyond this one; claiming-strategy advice.

## 7 · Decisions — all ADOPTED as recommended, 2026-09-24

- ✅ **D-1 · Where the rule lives.** (a) `getSSB()` itself returns 0 when single — one rule, closes every current and
  future call site; (b) add the inline test at all thirteen sites. *Recommended: (a).* (b) is the duplicated-rule
  pattern that produced v5.75's bonus defect.
- ✅ **D-2 · What the loader does with a stored spouse-B benefit on a single household.** This touches users' saved data,
  so it is your call.
  (a) Leave the stored value alone — D-1 makes it inert while single, and switching back to married restores it;
  (b) clear it on load, matching what both in-app save paths already do;
  (c) as (a), but show a one-line note on load that stored spouse-B figures are being ignored.
  *Recommended: (c)* — no silent change to the user's file, and the user learns why a number they entered isn't used.
- ✅ **D-3 · The missing-block default.** For a single household, default `ssB` to `planned: 0` rather than 1300.
  *Recommended: yes.* The 1300 default is a married-household placeholder and has no meaning without a spouse B.
- ✅ **D-4 · Severity in the audit record.** Annotate C-7 in `FlawsToFix-v5_73-Phase2.md` as re-measured at v5.75 — larger
  reach (Taxes tab, Monte Carlo) and a narrower route (file load only). *Recommended: yes*, in the build's package.
- ✅ **D-5 · Disclosure.** Figures move for affected single households, all toward more tax and lower balances. CHANGELOG
  and METHODOLOGY, as usual; no in-app notice beyond D-2's. *Recommended: yes.*

## 8 · Build order (once §7 is resolved)

1. Reproduce every §1 figure on v5.75; seeded or averaged Monte Carlo success-rate comparison; the stress tests;
   classify the thirteen sites and the direct property reads.
2. D-1 and D-3 at their single sites; re-measure §1d (all errors must reach 0 against the zeroed case).
3. D-2 as decided.
4. `t42`, the sweep invariant, the negative controls; hand checks.
5. Measure every existing pin that moves; `domdiff` must stay identical for the married example household.
6. METHODOLOGY, CHANGELOG, the FlawsToFix annotation.
7. Version bump to v5.76, full suite from the packaged copies, `index.html`, package.
