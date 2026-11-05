# SCOPE — D-76: the Roth ladder seeds a Roth (and a Traditional) balance the plan does not have

☑ **RETIRED — FULFILLED AT v6.45 (2026-11-04).** Steve: *"all as recommended"* — DJ-1 (b), DJ-2 to DJ-5 (a), DJ-6 (b) (§5). Reviewed once,
independently, before the decisions (§6); the build reviewed once more (§7), which changed the note's wording. Build record in §7. Scoped on v6.44 (source `e024f8ba39fe29c5b131c0aff38d6a6c`, built `82c47833…`, repo
`740285e`, verified against a fresh clone and the project-knowledge pool on 2026-11-04). Repo-only (`docs/`); it ships in the release
package that builds it.

Steve, 2026-11-04: *"write the D-76 scope now"*.

**In one paragraph.** The Roth tab's conversion ladder starts from the plan's balances at the selected retirement year, with two
exceptions left over from the example household. When the plan has **no Roth money** at that year, the ladder's ROTH BAL column starts
from a fixed **$356,813** (× the carry to the ladder start). When it has **no Traditional money**, the ladder converts from a fixed
**$1,340,645**. The Roth one (D-76 as filed) overstates one column, by about $0.40M in the first year and $0.65M by the last on the
example with its Roth removed ($0.48M → $1.78M where the plan's own figures are $0.07M → $1.13M; the gap is exactly the carried seed,
$384,642, grown at 4.5%: $401,951 in 2029, $652,308 in 2040). The Traditional one, found by this scope, is worse: on a plan with no Traditional money the ladder
converts $70,000 a year that does not exist, charges $108,237 of tax on it, and prints *"Combined RMDs reduced by $-56,268/yr"*. Both
are display-only: nothing outside the Roth tab's ladder block reads either figure. The fix removes both fallbacks. The example and every
plan with both kinds of money are unchanged, page text identical. A wider sweep of the same class found one more, on the Social Security
tab: spouse B's benefit estimate falls back to a typed $1,944, which hides the spousal-benefit warning on a plan where B has no benefit
of her own (DJ-6).

## 0 · Premise (verified at v6.44, not assumed)

Every figure was printed by a probe in this session against the v6.44 bundle (`qa/dom_v644.cjs` in the packaged run folder) or a
prototype leg (`p76`, §0.5). Probes are session scratch (`d76/probe.mjs`, `hand.mjs`, `fx.mjs`, `carry.mjs`, `biglits.cjs`,
`escape.cjs`). Sites were found with `qa/tools/census.cjs` and `funcmap.cjs`, and the two class sweeps (§0.4) with AST walks, never a
grep.

### 0.1 · The two fallbacks

Inside the Roth tab's render block (`funcmap.cjs`: the anonymous function L11196–12068 inside `DangerCloseMain`):
- L11285 `_rothFromPortfolio = _rsbL.rothInit`; L11286 `_tradFromPortfolio = _rsbL.tradInit` — `_rsbL = retireStartBalances(retireYear)`
  (L11264), the plan's balances at the selected retirement year.
- **L11304** `const rothBal0 = _rothFromPortfolio > 0 ? _cL.rothInitA + _cL.rothInitB : 356813 * _rbL;`
- **L11287** `const tradBal0 = _tradFromPortfolio > 0 ? _tradFromPortfolio : 1340645;` and **L11298**
  `let tradBalA = _perSeed ? _cL.tradInitA : tradBal0 * _rbL;` with L11296 `_perSeed = (_rsbL.tradInitA > 0 || _rsbL.tradInitB > 0)`.
  Because `tradInit === tradInitA + tradInitB` by construction (the comment at L11295 says so), `_perSeed` is false exactly when the
  plan's Traditional is 0 — so the fallback is reached exactly then.

Both literals are in the repo's first commit (`f8e21ce`, v5.6, 2026-08-01: `rothBal0 = _rothFromPortfolio > 0 ? _rothFromPortfolio :
356813`). v6.30 (D-60) added the carry `× _rbL` to the Roth fallback and left the literal.

### 0.2 · What reads them (census, v6.44)

`census.cjs` over the source, restricted to nothing (every hit in the file is shown):
- `rothBal0`: 2 sites, L11304 (definition) and L11305 (`let rothBal = rothBal0`).
- `rothBal`: 6 source sites, all in the block — the seed, the loop's growth (L11443), v6.44's later-B step (L11445), the row object
  (L11455), and **one reader, the ROTH BAL column (L11646)**. Nothing else reads the ladder's Roth.
- `tradBal0`: 3 sites (L11287, L11288, L11298). Through `tradBalA` (9 source sites) the phantom Traditional reaches: the RMD (L11340),
  the conversion cap (L11344, L11352–11353) and so the conversion, every income term built on it (taxable SS, MAGI, taxable income, tax,
  the marginal rate, IRMAA flags, headroom), the TRAD BAL column (L11645), the totals cards ("Total conversion", "Total tax cost"), the
  bracket-utilisation bar and its *HEADROOM … to 24% cap*, the *IRMAA lookback calendar* (each year's MAGI), and the with-conversion RMD
  card through `_balOf` (L11525) → `balAt` → `withConv`, and so *"Combined RMDs reduced by $X/yr"* (L11697). (Every one of these moved
  in the prototype's page-text diff on noTrad, §0.3.)
- **Nothing leaves the block.** An AST walk of L11196–12068 finds 174 local names and four writes to anything outside: `setRothAmount`,
  `setRothTaxFunding`, `setRothGainPct`, `setRothSolveObj` — the slider and selector handlers, none of which writes a ladder figure.
  Engines A–D keep their own balances (`runRothStrategies` and the rest are module-level and do not read this block), so the strategy
  comparator ③, the solve-for grid ④, the Taxes, IRMAA and Withdrawal tabs, the Monte Carlo, What Breaks, Backtest and Ask AI are all
  untouched by either fallback. **Both defects are display-only, confined to the ladder table, its parameter cards and the RMD cards.**

### 0.3 · Reproduced, and what each costs

Rendered Roth tab, BASE, $70K slider, the selected year 2029 (the example's). Five plan shapes, each built from the example:
- **noRoth** — every holding's Roth share removed (`balance = trad`, `roth = 0`), no Roth Other account, Roth contributions 0;
- **roth1** — noRoth with $1 of Roth in one holding (the control: the fallback's threshold is `> 0`);
- **noTrad** — every holding's Traditional share removed, no Traditional or annuity Other account, pre-tax contributions 0, a
  $1,000/mo Roth contribution for A;
- **noIra** — no holdings, one $900,000 taxable brokerage account, no contributions (a pension-and-brokerage household);
- **example** — as shipped.

| Shape | Start Trad / Roth (`retireStartBalances`) | v6.44 renders | Prototype (§0.5) renders |
|---|---|---|---|
| example | $1,398,600 / $315,000 | first row TRAD $1.50M, ROTH $0.43M; RMDs reduced by $41,275/yr | **page text identical** (md5 of the page's text with the Roth tab open) |
| noRoth | $1,398,600 / **$0** | *Roth bal (now) $0*, but ROTH BAL **$0.48M** (2029) → **$1.78M** (2040) | ROTH BAL $0.07M → $1.13M; the page text with the 12 ROTH BAL cells masked is identical |
| roth1 | $1,398,600 / $1 | ROTH BAL $0.07M → $1.13M | **page text identical** |
| noTrad | **$0** / $351,000 | *Traditional bal (now) $0*, but TRAD BAL **$1.44M**; converts $70K/yr (total $0.70M); total tax **$108,237**; with-conversion RMD **$56,268**; *"Combined RMDs reduced by **$-56,268**/yr"* | converts $0; total tax $0; TRAD BAL $0.00M; both RMD cards $0; reduced by $0/yr |
| noIra | **$0 / $0** | both phantoms: TRAD $1.44M, ROTH $0.48M, tax **$110,846**, reduced by **$-56,268**/yr | everything $0 but the dividend MAGI ($25K → $58K) |

**The cliff.** $1 of Roth starts the column at $0.07M; $0 starts it at $0.48M. The figure is discontinuous at the threshold, which is
the signature of a fallback and not of a model.

**Hand-checked at the display precision** (the column renders `fmtM`, `$(x/1e6).toFixed(2)M`, so ±$5,000). The bundle's inflation in
these renders is 2.535%/yr (`expectedInflation()` read in the rendered app; the bare module reads 2.74% — the example's load sets the
scenario), so the carry 2026 → 2029 is 1.02535³ = 1.077994. Computed in a separate script, not from the app:
- noRoth's 2029 ROTH BAL: (356,813 × 1.077994 + 70,000) × 1.045 = **$475,101** → renders $0.48M ✓.
- noTrad's 2029 TRAD BAL: 1,340,645 × 1.077994 × 1.045 − 70,000 = **$1,440,242** → renders $1.44M ✓.
- roth1's 2029 ROTH BAL: (1 + 70,000) × 1.045 = $73,151 → renders $0.07M ✓, and the prototype's noRoth equals it.

Both effects exceed the column's ±$5,000 by two orders of magnitude, so a DOM test of them is not vacuous (OPERATIONS §M). The RMD cards
render whole dollars and pin exactly.

**Why nothing caught it.** Neither fallback is reachable from the example or from any of the 17 fixture households (`fx.mjs`: start
Roth > 0 and start Traditional > 0 on all 17). `lits.cjs` finds no suite assertion carrying 356813 or 1340645 (its control, 340000,
finds `t65`). The boundary census has no row for either (§3.3).

**Where it fires.** The Roth half fires on any plan with no Roth holdings, no Roth Other account and no planned Roth contribution (a
planned contribution accrues into `rothInit` and avoids it). How many real plans that is, is not known; it errs optimistic (a Roth
column about $0.4–0.7M above the plan's). The Traditional half fires on a plan with no Traditional money at the selected year
(taxable-only savers, pension households, an all-Roth plan), and there every figure in the ladder is invented.

**Two more shapes, from the review (§6), read from its output:**
- **noTradLaterB2** — no Traditional at the selected year, but spouse B still working and contributing $2,000/mo pre-tax until 2033 (as-of
  2029). v6.44: the phantom (tax $116,250, *"reduced by $-45,426/yr"*). Prototype: the ladder converts **B's contributions as they
  arrive**, $25K a year 2030–2033, tax $2,669, B's no-conversion RMD $5,936 and *"reduced by $5,936/yr"* — real figures, from v6.44's
  `laterBContribAt` step (L11445), which adds to `tradBalB` inside the loop whatever the seed.
- **annOnly** — Traditional is only a $250,000 non-qualified annuity (which cannot be converted). Both legs: the card reads $250,000,
  every conversion $0, tax $0. Not a D-76 defect, but a plan where the slider does nothing although the start Traditional is not 0.

These two are why §1.2's note is keyed to the ladder's result, not to the start balance.

### 0.4 · The class: is anything else like it?

D-76 is one instance of a class: *an example value used when the plan's own field is empty*. Two sweeps, both by AST:
- **Numeric literals ≥ 10,000 in a fallback position** (a ternary's alternate, or the right of `||`), in the whole source
  (`biglits.cjs`; 725 literals ≥ 10,000, 6 in a fallback position):
  - L11287 `1340645` and L11304 `356813` — this scope;
  - L10545 `500000` (home value) and L10546 `150000` (mortgage) — **disclosed**: the same block flags them (`_fb`, L10550–10561) and
    the page says *"Showing baked-in defaults for these fields (affected rows marked ⚠ below)"* (L10795–10797). A different, already
    disclosed case; out of scope;
  - L2568 `18000`, `15000` — `spouseBWorkTaper`'s schedule (a lookup chain, not a fallback; the example only, v6.23).
- **That sweep was too narrow, and the review's wider one found a live member** (`rv76/fallbacks.cjs`: `||`, `??`, ternary consequents
  and alternates, default parameters, any magnitude):
  - **L9603 `spouseBFRAest = _ssSrc.ssB?.tableByAge?.[67] || 1944`** (the Social Security tab). Reachable: `applyLoadedData` gives a
    missing spouse B `tableByAge: {}` (L4897–4898), and the guided setup with B's benefit at $0 builds an all-zero table, so `0 || 1944`
    fires. Rendered (review): the example with no spouse-B benefit shows *"EST. FRA: $1,944/mo"*, which drives B's claiming-age table and
    **suppresses the "SPOUSAL BENEFIT NOT MODELED" warning** (A's half-FRA, $1,650, is below $1,944) — on exactly the household that
    warning is for. Already in UsabilityFlaws (L821) and `SCOPE_F29_SS_SLIDER_START.md` L184 as *"whether a married plan can reach it
    was not measured … belongs with D-56"*; it is now measured, and it is reachable. DJ-6.
  - L11735 `dobA?.year || 1963`, `rmdAgeA || 75`, L11590 `|| 75` — dead (the timeline always sets both); L135 `rothAmount = 70000` —
    unreachable (every caller passes a value); L904, L921, L925, L927, L938 — the timeline placeholders, already D-56; string `||`
    fallbacks — generic labels.
- **The registers, for the mechanism** (OPERATIONS §K2): `356813`, `1340645`, `rothBal0`, `tradBal0`, `_perSeed`,
  `_rothFromPortfolio`, `_tradFromPortfolio` across `FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md`, `UsabilityFlaws.md`
  and METHODOLOGY. Hits: **D-76** itself, and **D-56** (*"example-valued defaults that remain after D-53"*), which already lists one more
  example leftover on this same tab: *"Roth 401K 5-year rule: satisfied / Roth IRA 5-year clock: started (example)"*, shown to every plan
  (the Constraints & rules card). **The Traditional fallback is in no register** — it is new.

### 0.5 · The prototype

A scratch run folder (`d76/run`, leg `p76`) built from the v6.44 source with three lines changed and nothing else:
`tradBal0 = _tradFromPortfolio`; `tradBalA = _perSeed ? _cL.tradInitA : 0`; `rothBal0 = _cL.rothInitA + _cL.rothInitB`. Bundled with
`mk_testable.sh` and the same esbuild call as `mk_runfolder.sh`. It is a measurement device, not the build. With Traditional 0,
`carryStartBalances` returns `annShareA/B = 0` (not NaN; `carry.mjs`), so dropping the fallback leaves no 0 × NaN behind.

## 1 · What changes (the recommended shape: DJ-1 (b), DJ-2 to DJ-5 (a), DJ-6 (b))

### 1.1 · The seeds come from the plan, always

Exactly the prototype's three lines, so the build is what was measured:
- `rothBal0 = _cL.rothInitA + _cL.rothInitB` — no condition. `_cL` already carries holdings at inflation and the accrual at face
  (v6.30, DU-7 (a)), which is what the `> 0` branch uses today.
- `tradBal0 = _tradFromPortfolio` and `tradBalA = _perSeed ? _cL.tradInitA : 0` — the literal goes; `_perSeed` stays. (Removing
  `_perSeed` as well would differ from the prototype if `tradInitA/B` were ever negative — `retireStartBalances` takes `contribAccrual`
  without `openingAccrual`'s floor — so it is not done here.) `tradBal` is reassigned before every read (L11442).
- On every plan with start Traditional > 0 and start Roth > 0 these are the values computed today, so the change is bit-identical there.
  The prototype shows it (§0.3; the review: also B-only Traditional, annuity-only, the −1/+1 years and an empty ladder); §3.1 §C proves
  it on the build.

### 1.2 · A plan with nothing to convert says so (DJ-2 (a))

With the Traditional fallback gone, a plan with nothing convertible shows a ladder of $0 conversions. One line above the table:
*"Nothing converts in this ladder: the plan holds no Traditional (pre-tax) money that can be converted in these years, so the slider has
no effect here."* **Shown when the slider is above $0 and no ladder row converts** — keyed to the ladder's own result, not to the start
balance, because a plan with $0 start Traditional can still convert spouse B's later contributions (noTradLaterB2), and a plan whose
Traditional is all annuity converts nothing although its start balance is not 0 (annOnly; §0.3). Not shown at a $0 slider (nothing
converts by choice) or on an empty ladder (the heading already says *"no conversion years"*). No note for a plan with no Roth: its column
is then the conversions, grown — correct and self-explanatory.

### 1.3 · The copy

- **Field Manual §13**, a v6.45 note: the ladder's Roth column started from the example's Roth on a plan with none, and its
  conversions from the example's Traditional on a plan with none; both now start from the plan. What moved (§0.3's table, in words).
- **METHODOLOGY**: one sentence in the ladder's section — its seeds are `retireStartBalances` at the selected year, carried, with no
  fallback; a plan with no Traditional converts nothing.
- The four version sites read v6.45.

### 1.4 · The registers

- **D-76** closed, its row widened to name the Traditional twin (DJ-3 (a)).
- **D-56** unchanged unless DJ-4 (b): the 5-year-clock line stays in D-56 as it stands.
- Two new UsabilityFlaws items (DJ-4 (a), §4): the *(now)* labels, and the RATE column's 10% in a year with no taxable income.
- The UsabilityFlaws row on `spouseBFRAest` (L821) and D-56 widened with §0.4's measurement: reachable, and it hides the spousal-benefit
  warning (DJ-6 (b)).

## 2 · Site census (v6.44, by `census.cjs` / `funcmap.cjs`)

| What | Sites |
|---|---|
| The Roth tab block | anonymous function L11196–12068 in `DangerCloseMain` (`funcmap.cjs`) |
| `_rothFromPortfolio` | 3: L11285 (def), L11304 (the fallback), L11611 (*Roth bal (now)* card) |
| `_tradFromPortfolio` | 3 source sites (4 AST hits): L11286 (def), L11287 (the fallback), L11607 (*Traditional bal (now)* card) |
| `rothBal0` | 2: L11304, L11305 |
| `tradBal0` | 3: L11287, L11288, L11298 |
| `_perSeed` | 5: L11296 (def), L11298, L11299, L11302, L11303 |
| `rothBal` | 6 source sites, one reader: the ROTH BAL column L11646 |
| `tradBalA` | 9 source sites; read by the RMD L11340, the cap L11344, the row L11456, `_balOf` L11525 (→ the RMD cards) |
| Writes leaving the block | 4, all UI handlers (§0.2) |
| Suite literals | `lits.cjs`: no suite file carries 356813 or 1340645 |

**Suites that read the ladder.** My first list came from a text search and was short. The review's AST literal search (case-sensitive,
template literals included) adds `t93` (L581, the totals cards), `t96` (L220), `t106` (L171) and `t108` (L545) to `t16`, `t23`, `t26`,
`t70`, `t86`, `t95`; `t104`/`t105` render the tab for the phone layout. The review ran every suite that renders the Roth tab against the
prototype bundles (a copy of the run folder, `rv76/prun2`): all green — t4 253, t11 40, t16 26, t20 102, t23 26, t24 40, t26 25, t28 34,
t70 33, t72 19, t86 44, t93 97, t95 153, t96 72, t104 18, t105 36, t106 33, t107 37, t108 49. No re-gate is predicted; the build's own
full run decides.

## 3 · Tests

### 3.1 · `t109_ladder_seed.mjs` (new, both legs)

The v6.44 leg pins each defect as `[KNOWN DEFECT 2026-11-04, D-76 — flips at v6.45]`.
- **§A, source by AST (the extinction invariants):**
  - inside the Roth tab block, the initialisers of the ladder's seeds (`rothBal`, `tradBalA`, `tradBalB`, `annBalA`, `annBalB`),
    followed through `rothBal0` and `tradBal0` to their definitions, contain no numeric literal other than 0 and read only `_cL` /
    `_rsbL`;
  - **the class, as far as a walk can see it:** every numeric literal in a fallback position anywhere in the source (`||`, `??`, a
    ternary's consequent or alternate, a default parameter), at any magnitude above 1, is either absent or on a named allowlist with its
    reason — the disclosed home value and mortgage (`_fb`), the dead `|| 1963` / `|| 75`, `rothAmount = 70000`, the D-56 timeline
    placeholders, and `spouseBFRAest`'s `1944` (reason: DJ-6; removed from the list if DJ-6 (a)). A new entry, or one that leaves, turns it
    red. It is named for what it proves — *no unlisted literal fallback* — not *"the class is gone"*.
- **§B, rendered, the shapes of §0.3** (noRoth, roth1, noTrad, noIra, noTradLaterB2, annOnly; the current leg):
  - noRoth's ROTH BAL column equals roth1's, row by row (the cliff is gone);
  - noRoth's first ROTH BAL equals the oracle (the slider's conversion × 1.045) at the column's precision;
  - noTrad and noIra: every CONVERT cell $0K, every TRAD BAL $0.00M, *Total tax cost* $0, both RMD cards **$0 exactly**, *"Combined RMDs
    reduced by $0/yr"*;
  - noTradLaterB2: conversions only in the years B's contributions are there to convert, and the RMD cards equal an oracle from B's
    contributions (dollar-exact);
  - **the §1.2 note** present on noTrad, noIra and annOnly at $70K; absent on the example, noRoth, roth1 and noTradLaterB2, and on noTrad
    at a $0 slider;
  - *(the v6.44 leg pins the §0.3 defect values: $0.48M, $1.44M, $108,237, $-56,268).*
- **§C, bit-identity:** the Roth tab's full page text, v6.44 vs v6.45, identical on the example, roth1, all 17 fixtures as they stand,
  three slider positions ($0, $70K, $250K) and the −1/+1 retirement years on the example — the guard that the change reaches only plans
  with a zero start balance. As `t108`, the prior leg's text comes from a `--dumpdom` child process.
- **§D, hand pins (dollar-exact, the RMD cards):** the v6.44 leg's noTrad with-conversion RMD — 1,340,645 × 1.02535³, then × 1.045 −
  70,000 for each year 2029–2038 = $1,384,188, ÷ 24.6 = **$56,268** (hand-derived by the review, matching the render) — and the current
  leg's $0; the example's first-year cards unchanged on both legs ($79,859 / $15,657 no conversion; $50,215 / $4,026 with).
- **Harness traps the build will hit** (the review hit both): `households.mjs`'s `build(G, name)` deep-copies the *current*
  `G.PORTFOLIO()`, so the example must be reapplied before each fixture or they compound; and `applyLoadedData` does not reset the React
  `retireYear` state (L7612, set only at L8395), so a shape that needs another selected year must use the selector or move the as-of date,
  not `P.retireYear`.
- **§E, copy:** the Field Manual §13 v6.45 note, METHODOLOGY's sentence (current leg), the four version sites.

### 3.2 · Re-gates

None predicted (§2). Any suite that turns red is read assertion by assertion (§B2) before anything is gated.

### 3.3 · Boundary census (§K1)

The maintenance rule applies: this defect was invisible in the example data. Two new rows in `boundaries.mjs`, with `t29` checks and two
fixtures in `households.mjs`:
- **`ladder_start_roth_zero`:** ON (degenerate) when the plan's Roth at the selected year is above 0. The example is ON.
- **`ladder_nothing_converts`:** ON (degenerate) when the ladder converts something at the opening slider. The example is ON. (Keyed to
  the ladder's result, as the §1.2 note is — not `ladder_start_trad_zero`, which annOnly and noTradLaterB2 show is the wrong boundary.)
- Fixtures **`rothToTrad`** and **`tradToRoth`**: each moves every holding's Roth (or Traditional) share into the other with the balances
  unchanged, and retypes the Other accounts and the contributions to match. `holdsExampleHoldings` (L1585) compares only ticker and
  balance, so the example's built-in spouse-B work stays on and each fixture moves one boundary (the review: `rothToTrad` keeps 2029
  taxable income at $73K and shows the phantom $0.48M on v6.44).

### 3.4 · Controls

`qa/tools/controls_v645_ladder_seed.py`. Each mutant must turn its named checks red:
- K1 the Roth literal restored → §A seed, §B cliff;
- K2 the Traditional literal restored → §A seed, §B noTrad;
- K3 a new literal fallback planted elsewhere in `DangerCloseMain` → §A class-wide;
- K4 the §1.2 note shown always / never, and keyed to the start Traditional instead of the result → §B (annOnly, noTradLaterB2);
- K5 the Roth seed read uncarried (`_rsbL.rothInit`) → §C (the example's column moves);
- K6 one home-fallback allowlist entry removed → §A;
- C0 the unmutated run, green.

## 4 · Out of scope (recorded)

- **D-56's 5-year-clock line** (*"Roth 401K 5-year rule: satisfied / Roth IRA 5-year clock: started (example)"*), on the same tab — the
  same class, but a wording decision about what to say for a plan whose Roth history the app does not know. DJ-4 (b) brings it in.
- **The *Traditional bal (now)* and *Roth bal (now)* cards show the balance at the selected retirement year, not today's.** On the
  example: *Traditional bal (now) $1,398,600*, which is today's $1,296,000 plus $102,600 of planned contributions to 2029 at face. Not
  registered; recommended as a UsabilityFlaws item (DJ-4 (a)).
- **The RATE column reads 10% in a year with $0 taxable income** (`marginalRate` starts at 0.10, L11404). Pre-existing on any such year;
  it becomes visible on every row of a no-Traditional plan once the phantom conversions go. Not registered; recommended as a
  UsabilityFlaws item.
- **Hoisting the ladder to module level** for dollar-exact tests (OPERATIONS §M): its own release, as §M requires; this scope's effects
  far exceed the DOM ceiling.
- **The home value and mortgage fallbacks** (L10545–10546): disclosed in-app; not this class's silent kind.
- **`spouseBFRAest`'s $1,944** (L9603, §0.4) unless DJ-6 (a).
- **Backtest's fixed pension at face** (reported at v6.44, not filed): a different tab and mechanism.

## 5 · Decisions for Steve

**DJ-1 · What does this release fix?**
- (a) **The Roth fallback only** — D-76 as filed. Leaves the Traditional twin, which is worse.
- **(b) Both fallbacks (recommended).** The same mechanism, two lines apart in the same block; one test set covers both. On a plan with
  no Traditional money the ladder stops inventing $0.70M of conversions and $108,237 of tax.
- (c) Both, plus D-56's 5-year-clock line (see DJ-4 (b)).

**DJ-2 · A ladder where nothing converts.**
- **(a) Show the ladder of zeros with a one-line note above it, shown when the slider is above $0 and no row converts (recommended)** —
  §1.2's wording. The user sees why the slider does nothing. It also covers an annuity-only plan, which converts nothing today.
- (b) Show the ladder of zeros, no note.
- (c) Hide the ladder table and the RMD cards, and show only the note. Not recommended: a larger layout change (phone tests `t104`), and
  the RMD cards still carry real figures on such a plan when spouse B contributes later (noTradLaterB2: *"reduced by $5,936/yr"*).

**DJ-3 · How the registers record the Traditional twin.**
- **(a) Widen D-76 to cover both, and close it (recommended)** — one mechanism, one ID; the row records the widening and that the twin
  was found by this scope (the precedent: D-57's widening at v6.29).
- (b) File it as D-77 and close D-76 and D-77 together.

**DJ-4 · The three neighbours (§4).**
- **(a) File the two unregistered ones as UsabilityFlaws items (the *(now)* labels; the 10% RATE at $0 income), fix none of them here,
  and leave D-56 as it stands (recommended).** Keeps this release to one mechanism.
- (b) Also fix D-56's 5-year-clock line here: replace it with a neutral line (for example *"Roth 5-year rules: not modelled — check
  your own account dates"*). A wording choice; D-56 narrows.
- (c) Also relabel the two *(now)* cards *"at retirement ({year})"*. No existing suite literal reads *"bal (now)"* (the review's AST
  search), but the relabel changes the example's Roth-tab text, so this release's own §C (page text identical) needs those two labels
  masked, and `t108` §C's DOM comparison against v6.43 would see them too.

**DJ-5 · The version.**
- **(a) Build this as v6.45 now; the 2027 tax figures become v6.46 (recommended)** — the TY2027 scope renumbered a twelfth time. The IRS's
  TY2027 revenue procedure was reported not yet published as of 2026-10-31 (a third-party tracker; re-checked at the build). If the
  figures publish before this build passes its suite, the tax release goes first and this becomes v6.46.
- (b) Wait, and build this after the tax release.

**DJ-6 · Spouse B's $1,944 Social Security estimate (§0.4) — the same class, on the Social Security tab.**
- (a) **Fix it here:** B's FRA estimate reads $0 when the plan's table has no age-67 figure, so B's claiming-age table shows $0 and the
  *"SPOUSAL BENEFIT NOT MODELED"* warning appears when it should. A second tab and a second mechanism in the release; it needs its own
  census of `spouseBFRAest`'s readers and tests on the Social Security tab, which this scope has not done.
- **(b) Register it now and scope it next (recommended):** widen the UsabilityFlaws row (L821) and D-56 with the measurement (reachable;
  it hides the spousal warning on the household it is for), keep this release to the ladder, and make the $1,944 the next scope — small,
  and it gets its own premise and census rather than riding in on this one's.
- (c) Register only.

## 6 · Review (2026-11-04)

One independent review read the first draft against the v6.44 source, wrote its own probes and AST walks (`rv76/`), and ran the
prototype against every suite that renders the Roth tab (all green, §2). It confirmed: the two fallbacks, their conditions, line numbers
and provenance; every census count; that nothing computed in the block leaves it (an AST taint walk; no DOM-text reader in the source;
`aiPlanFacts` and the export are module-level); the §0.3 figures on v6.44 and the prototype; the hand arithmetic; bit-identity on the
example, B-only Traditional, annuity-only and the −1/+1 years; an empty ladder identical on both legs; the annuity share 0 (not NaN) at
Traditional 0; all 17 fixtures above 0 at all three selectable years. Not checked by it: the noIra figures and the count of local names
(its broader walk counts 179, mine 174).

Its findings, each checked and folded in:
1. **(must-fix) §1.2's note was keyed to the start Traditional, and is false on two reachable shapes** — spouse B's later contributions
   convert though the start is $0 (noTradLaterB2), and an annuity-only plan converts nothing though the start is not 0 (annOnly). Now
   keyed to the ladder's result (§1.2, DJ-2, §3.1 §B, §3.3, K4). I spot-read both shapes in its output.
2. **The class sweep was too narrow** and missed `spouseBFRAest`'s $1,944 (L9603), reachable, which hides the spousal-benefit warning.
   §0.4 widened; §3.1 §A's class test re-specified and named for what it proves; DJ-6 added. I read L9603 and the register rows.
3. **The fixtures need not flip the spouse-B work row** — `holdsExampleHoldings` compares ticker and balance only (read at L1585). §3.3
   now moves shares, not balances.
4. **§2's list of suites that read the ladder came from a text search** and missed four. Replaced with its AST list and its prototype
   run.
5. **DJ-4 (c) understated its cost** to this release's own §C. Restated.
6.–9. Harness traps (§3.1), the prototype vs the recommended code (§1.1 now matches the prototype exactly), a dollar-exact §D pin in
   place of a display-precision one, and the seed invariant following `rothBal0` (§3.1 §A).
10. **§0.3's "common" claim had no source.** Removed; the Roth half's exact trigger is stated instead.

## 7 · Build record (v6.45, 2026-11-04)

Built on v6.44 (`e024f8ba…`, repo `740285e`) in a full clone. The IRS's TY2027 revenue procedure was re-checked at the build: two
third-party trackers (2026-10-24, 2026-10-31) and a search that day found it unpublished, so DJ-5 (a) held — this is v6.45 and the 2027
figures are v6.46 (the TY2027 scope renumbered a twelfth time; `package_check`'s OPEN entry rolled).

**Built as scoped.** §1.1's three lines, exactly the prototype's. §1.2's note, keyed to the ladder's result. The four version sites. The
Field Manual's §13 v6.45 note. `t109` (both legs), `controls_v645_ladder_seed.py`, census rows 30–31 with `t29` checks, the registers (§1.4).

**Where the build departed from this scope — each recorded here, as the build review asked.**
1. **The note's wording** (§1.2). The build review found a fourth shape: spouse A born 1952 (RMDs from 73, so A's conversion window closed in
   2024) holding every account. B's window keeps the ladder's rows; B holds no Traditional; nothing converts — and the scoped wording (*"the
   plan holds no Traditional (pre-tax) money that can be converted"*) would have printed beside *Traditional bal (now) $1,365,000*. The shipped
   line: *"Nothing converts in this ladder, so the slider has no effect here: the plan holds no Traditional (pre-tax) money the ladder converts
   in these years. It converts neither annuity money nor the money of a spouse already past their own conversion window (which closes the year
   before their RMDs begin)."* `t109` B-10 asserts the words; B-11 the shape (`pastA`).
2. **The census rows** (§3.3) are `ladder_start_roth` and `ladder_convertible`, not `ladder_start_roth_zero` / `ladder_nothing_converts`. The
   census reads the module and the ladder is computed inside the page (OPERATIONS §M), so a row cannot read whether a row converted; row 31
   reads what can be converted — each spouse's Traditional less annuity money while that spouse's window is open at the start, plus a later
   spouse B's pre-tax contributions in her window. Its first form ignored the windows and read ON on `pastA`; fixed after the build review
   (`t29` C-d76-5).
3. **The fixtures** (§3.3) were not added to `households.mjs`: every suite that loops over the fixture households would grow by two (`t108`
   and `t109` among them). The shapes are built inline, as v6.44's C-d71 did. `t29`'s `rothToTrad` moves holdings only; `t109`'s also retypes
   Roth Other accounts and Roth contributions — identical on the example, which has neither.
4. **`t109` A-3 is narrower than §3.1 said**: numeric literals of 1,000 or more in a fallback position (`||`, `??`, a ternary's alternate, a
   default value), not "any magnitude above 1" and not a ternary's consequent. The wide walk finds 177 hits, mostly styling; the narrow one 17
   on v6.45, each on a named allowlist with its reason (the build review's independent walk matched it key for key). Not covered: the timeline's
   smaller placeholders (`|| 67`, `|| 63`, `|| 90`, `rmdAgeA || 75` — D-56), `spouseBWorkTaper`'s schedule (consequent position), and object
   fallbacks such as `_dobAFound || { year: 1963, … }`. The test is named for what it proves: no unlisted literal fallback.
5. **METHODOLOGY** got a new section at its end (*The Roth ladder starts from the plan's own balances (v6.45)*), as every release since v6.07
   has, not one sentence in §7.

**Harness traps found by this build** (recorded in `t109`'s header and TESTING):
- `applyLoadedData` does not remount, and the Roth tab's solve-for grid is a `useMemo` with no plan in its keys (the app remounts on every
  load — `setRemountKey`), so a suite that loads plans in a row reads a grid ranked for an earlier plan. `t109` moves the slider off and back.
- Once the slider has moved, jsdom cannot clone the page: React updates `background` in place, jsdom writes the expanded longhands back and
  then fails to parse them (`TypeError` in `shorthand-properties.js`, v6.44 and v6.45 alike). `t109` reads text with a tree walk.
- A 23-page dump through a pipe followed by `process.exit()` arrived truncated; `t109`'s child writes a file.
- `t109` §C compares the Roth tab from its opening panel to the page's end: the retirement selector above it carries Monte Carlo medians that
  depend on the random stream's position, which differs between the two processes.

**The build review** (one independent reviewer, read-only, no DOM runs while the suite ran) — every finding checked and acted on:
- *must-fix* — the registers, CHANGELOG, TESTING and this document were not yet written while shipped text said they were: written in this
  package; and the note's wording (above, 1).
- the empty-ladder clause had no shape and no control: `bothPast` (both spouses' windows closed before 2029 — no rows, no note), K4d;
- A-3 and the census narrower than scoped, unrecorded: recorded (2–4 above);
- controls missing for the slider clause and the other seeds: K4e, K8 (`tradBalB`), K9 (`annBalB`); the note's words asserted (B-10);
- D-2 (the oracle's own arithmetic) counted on the v6.45 leg: it runs on the v6.44 leg only, where it is compared; D-1's figures now carry
  their working (D-0, hand-computed from the example's fields: $79,859 and $15,657);
- notes: §C's version mask also hid figures like "$6.45M" — narrowed to `v6.4x`; `t33`'s PINS comments fixed; the Field Manual now says the
  $356,813 was grown to the retirement year, and that the line shows with the slider above $0. B-4 checks a shape, not the defect (K1 leaves
  it green) — kept, and said so here. `t108` F-1's label still says the v6.44 note comes first; its check compares with v6.43 only and holds.

**Counts, controls and the ship** are in the CHANGELOG's v6.45 entry and TESTING (from suite output, not restated here).
