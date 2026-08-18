# SCOPE — v5.38: the ACA-premium sale's gain is taxed (the standing candidate)

**Rev B — §8 decisions RESOLVED by Steve, 2026-08-17 (recommendations adopted as stated).
Build may proceed.** Rev B also corrects one cross-reference error in §4 (it said "decision 2"
where the lookback question is decision 1) and folds decision 1's ripples into §3/§5/§6.

**Pinned to:** v5.37 · `src/DangerClose.jsx` md5 `ff4dddcb585e2237e6c6a2643ded2ebb` · built
`index.html` md5 `50faed9fe934ddeb628b59d00ddb4a3e`. Every line number below was read from that
source or produced by `qa/tools/` against it, this session (2026-08-17). Prior build for the
pair: v5.36 `b7396c1c14861dc149b71e8edb1a00d5`.

**Lineage.** v5.34 built the conversion-funding basis tracker and deliberately routed the
ACA-premium sale's gain "into MAGI and no further" (d-iii/d-iv). The v5.36 scope's decision 5
kept it out of that release *because `acaSaleGain` lives in `runRothStrategies` — Engine A —
which `t2` calls for its parity fingerprint*, and a release already carrying premise corrections
could not afford to forfeit the 9/9-strict guarantee. v5.37 §7 and `STATUS_v5_37_shipped.md` §3
carry it forward as **the standing v5.38 candidate: "the ACA-premium sale's gain reaches MAGI
but is untaxed — Engine A, needs a parity-witnessed release."** This is that release. The
finding has no E-/D-/S- registry number; its durable record is the chain above plus the
disclosures listed in §5.

---

## 0 · Pre-build actions (freshness findings from this session — resolve before any edit)

The §A/§A2 freshness check was run 2026-08-17 (clone-and-diff against HEAD). The **repo is
current and internally consistent**: `src/DangerClose.jsx` and `index.html` match the manifest
and the v5.37 provenance line exactly. The **pool is stale on four counts**, all in the
direction "repo right, pool behind" — the v5.37 knowledge refresh partially failed to land, the
same shape as the `qa/t4_dom.mjs` deletion that STATUS v5.37 §3 records as documented-but-never-
executed:

| Pool file | Pool holds | Manifest + repo agree on | Verdict |
|---|---|---|---|
| `t1_units.mjs` | `1fb0caf8…` (pre-v5.37: no `v537` tag, verify-count and verStr maps end at v5.36) | `69e8718765bca64c9d3ce1d62fa3fad2` | **stale — delete, re-upload the repo copy** |
| `domdiff_withdrawal.mjs` | `184b826b…` (the v5.36 edition; default pair v535→v536) | `faaea61bea1ec51794dd7a5ebb825d13` | **stale — delete, re-upload.** The manifest's own retirement list says the pool "takes the v5.37 edition"; it did not |
| `VERIFY.sh` | `44563a9c…` (v5.36 trailer, pair v535→v536) | repo root `VERIFY.sh` is `6cd8e6a08b00e048f178a14ae703d65c` (v5.37) | **stale — delete, re-upload.** Also: `VERIFY.sh` has **no row in the manifest's md5 table**, so this drift was invisible to the offline fallback by construction — the unlisted-pool-file failure shape named at the v5.32 refresh. Add the row |
| `capture_gain_fp.mjs` | absent from the pool | manifest row `99f096c7…` claims it present | **either restore it to the pool or delete the manifest row** — a listed-but-absent file is the mirror image of the E-14 shape |

None of these blocks scope-drafting (this document was written against the repo clone, which is
authoritative), but **the refresh must land before the build session runs the suite from the
pool** — a session building from knowledge alone would run a t1 that fails on the v537 tag and a
DOM diff that dies looking for v535 bundles, and both failures read as regressions. These four
actions fold into this release's knowledge refresh (delete-first), and the failed-refresh
recurrence itself is worth one line in the CHANGELOG's limitations or the manifest's warning
block: **this is the second consecutive release where a documented refresh action did not land.**

## 1 · Premise, as measured (not recalled)

**The asymmetry is real at v5.37, in code and by census.** `acaSaleGain` has exactly **4 AST
hits**, all inside `run@3731 < runRothStrategies@3683` (census.cjs against `ff4dddcb…`):

- **L4098** — init. **L4156–4157** — the 3-pass bounded contraction: the *estimated* gain of the
  premium sale enters `acaMagi`, which sets the year's subsidy. **L4175** — the *actual* sale:
  `realizeGain(max(0, lost), taxBal, taxBasisA)` mutates the basis, `taxBal -= lost` pays the
  extra premium, and the realized gain is assigned to `acaSaleGain` — **which is never read
  again**. It reaches no tax, no `totTax`, no `widowTax`, no `magiHist`.

- The **funding sale** one block up (L4100–4122) is the contrast the disclosure names: its gain
  `g` is charged LTCG (`gTax = ltcgF(g, _stack, yr, LT)`, added to `totTax`/`widowTax`), the sale
  is grossed up fixed-point for its own tax, and the gain enters the IRMAA lookback
  (`magiHist[yr] = magi + g`, L4118).

- The **source comment at L4166–4172** states the asymmetry as deliberate and points here: *"It
  is deliberately still not TAXED: d-iii/d-iv route it into MAGI and no further… That asymmetry
  is disclosed, not silent, and is the optimistic direction — it is recorded for step 3, not
  fixed here."* This release is step 3, and that comment becomes false the moment the fix lands —
  it is edited in the same change (the v5.22 rule: a now-false comment beside the fix is the
  defect class).

**The effect exceeds the achievable precision.** Engine A is module-level and dollar-exact
testable (OPERATIONS §M — the component-inline category is empty). Measured this session on the
`t2` ACA-guardrail household (PACA: declared gain share 0.5, $1,600/mo benchmark, $250K taxable),
via an **additive-only scratch instrumentation** (an accumulator spliced into a throwaway copy of
the testable bundle; nothing ships from it):

| strategy | untaxed ACA-sale gain (lifetime) | est. LTCG forgone | totTax today |
|---|---|---|---|
| none / current | $0 | $0 | $194,377 |
| fill12 | $20,535 | ~$3,080 | $120,091 |
| fill22 | $20,535 | ~$3,080 | $168,127 |
| fill24 | $20,535 | ~$3,080 | $193,475 |
| irmaa1 | $20,535 | ~$3,080 | $155,089 |
| acaCliff | $8,341 | **$0** | $181,860 |

The estimate stacks the gain on `taxableOrd + qdcg + saleGain` and does **not** iterate the
gross-up or the subsidy contraction, so it is a magnitude, not a projection — the build derives
the real figures by independent hand computation (§5). Two things it establishes: the forgone
tax is ~25× the dollar-exact floor and ~2.5% of a strategy's lifetime tax, so the fix is
material; and `acaCliff` realizes gain whose LTCG is **$0** (it sits inside the 0% bracket), so
"taxed" and "tax > 0" must not be conflated in any assertion.

**The shipped example household is on the bridge.** `PORTFOLIO.acaBridge = { premium: 1600,
size: 2 }` (L393) — so the Roth tab's rendered figures *can* move for the demo couple, and the
DOM-diff scoping in §6 is a measurement, not an assumption.

## 2 · The mechanism today (what the fix must fit into)

Order of operations inside the year loop of `run`: year tax + IRMAA computed (L4020–4062) →
funding model pays `due` (withhold first if selected; then the brokerage funding sale with
gross-up, gain taxed, gain into `magiHist`; then Roth, then Traditional fallbacks, L4083–4139) →
**ACA block** (L4141–4181): heads, benchmark, `_magiBase = base + conv + div_y + ss + saleGain`,
the 3-pass contraction estimating the premium-sale gain into `acaMagi`, subsidy stored, floor
flagged, then the actual premium sale and `taxBal -= lost`.

Two mirrors must stay in lockstep with whatever this release changes (the D-34-4 shared-rule
principle, asserted by t22 group H):

- **The acaCliff solver's estimator** (`_estSaleGain`, L3914–3992) walks a local copy of the
  pool through *both* sales in engine order — funding sale grossed up, then the d-iv anticipated
  premium sale with the cliff-clamped 3-pass contraction — to shrink bridge-year conversions by
  the MAGI its own sales will create. If the premium sale now grosses up for its own LTCG, the
  estimator must anticipate the same larger sale, or the solver leaves too little headroom and
  the v5.10.1/S-6 defect class returns one step later.
- **t22 group H** pins the solver's convergence, the oscillation state, the withhold-inclusion
  (S6-2), and dollar anchors on the floor-crossing household.

Known edge already in the code, unchanged by intent (§7): `taxBal -= lost` can drive the pool
transiently negative (clamped to 0 at the next year's growth line); the premium sale has no
Roth/Traditional fallback the way `due` does.

## 3 · Design

**The fix, symmetric with the funding sale it is disclosed against:**

1. In the ACA block, replace the bare `lost`-sized sale with a grossed-up sale: fixed-point
   `sale = lost + ltcgF(gain(sale), stack)`, clamped to the pool (the funding sale's exact
   idiom, using `realizeGain` for the gain estimate — never a parallel `sale × fraction`).
2. Charge the realized gain's LTCG to `totTax` (and `widowTax` when widowed).
3. **Stack order:** the ACA sale's gain stacks on `max(0, taxableOrd) + qdcg + saleGain` — gains
   realized later in the year stack on gains realized earlier. (The funding block's `_stack`
   const is scoped inside its own branch; the ACA block computes its own.) This is the
   conservative direction and the only internally consistent one.
4. The contraction (L4150–4159) estimates the gain of the **grossed-up** sale, not of bare
   `lost` — otherwise `acaMagi` understates by the tax-driven slice, the same one-pass optimism
   d-iv exists to remove.
5. The solver's `_estSaleGain` mirror gains the identical gross-up in its anticipated-premium-
   sale branch (its clamp logic is untouched — the discontinuity analysis in its comment holds
   regardless of the sale's size).
6. **(Decision 1, resolved: yes.)** The ACA sale's realized gain — including the gross-up's
   slice — enters the IRMAA lookback: after the sale, `magiHist[yr] = magi + saleGain +
   acaSaleGain` (the funding block's L4118 write plus the new term; one coherent final write is
   preferable to two increments). **Timing is safe by construction:** within the year loop,
   `magiHist[yr]` is only ever *read* at `yr + 2` (L4048, and the solver's L3899), so appending
   the ACA term after the funding block's write cannot affect the current year's IRMAA — verify
   this claim against source at build rather than trusting it from here.
7. Rewrite the L4166–4172 comment to state the new truth, in the same edit — it currently says
   "route it into MAGI and no further," which decision 1 also falsifies on the "no further" half.

**Precision note (§M):** everything here is module-level; every moved figure is dollar-exact
verifiable through `g.runRothStrategies`. No claim in this scope depends on a DOM read.

## 4 · Site census (AST, against `ff4dddcb…`)

`acaSaleGain`: 4 hits, all in `run@3731` (L4098, L4156, L4157, L4175). `magiHist`: 5 hits, all
in `run@3731` (L3767 init · L3899 solver lookback · L4046 store · L4048 IRMAA lookback · L4118
funding-sale gross-up) — the ACA sale's gain is in **none** of them, which is decision 1's
subject *(Rev A said "decision 2" — a cross-reference slip, corrected; resolved: the gain
enters, per §3 step 6)*. The solver mirror: `_estSaleGain` L3914–3992 inside the `acaCliff` branch. Call sites
constructing `P` for Engine A: L5296, L9154, L9300 (all pass `acaBridge` through; no site
change needed). Engines B, C, D contain zero references to any of these identifiers — the edit
cannot reach them, which is what parity witnesses.

Out-of-repo mirrors of the disclosure (swept, per B2's lock rule):

- `METHODOLOGY.md` L246–250 — the **"Disclosed, not fixed"** paragraph. Inverts this release.
- The Field Manual (`DOCS_HTML`) — searched for "asymmetr", "premium sale", "not taxed",
  "d-iv": **absent**. The asymmetry was never disclosed in-app, so no in-app copy changes, and
  (as at v5.37) that keeps whatever DOM identity the measurement finds true.
- Suite locks: no assertion asserts the asymmetry copy's *presence* (t22 L358–365 and t11 L33
  mention it in comments only; comments are not locks). Verified by grep of the suite for the
  disclosure's sentences; re-verify at build.

## 5 · What moves (blast radius — re-derive by hand, never adapt silently)

- **Engine A output, for bridge households with a gains-bearing pool and `lost > 0`:** `totTax`
  up (conservative direction), and second-order: the larger sale depletes pool and basis faster
  → later `_gfEff`, later subsidy, `wealthByYr`, `estate`, `endTaxable` all move. `totAcaLoss`
  can move where the grossed-up sale's MAGI shifts a subsidy. Households with `acaPremium 0`,
  a pure-basis pool, or `lost ≤ 0` every year move **nothing** — that invariance is itself
  asserted (§6).
- **`totIrmaa`, via decision 1:** a bridge household realizing gain at 63–64 can cross an IRMAA
  threshold in the 65–66 lookback and pick up a surcharge it did not carry at v5.37 —
  conservative direction, one cause. Households whose bridge ends more than two years before
  Medicare, or whose lookback MAGI stays inside its tier, show no IRMAA movement even where
  `totTax` moves; the exact case in §6 witnesses both a crossing and a non-crossing year. This
  widens the `rothAca` fingerprint diff — every moved IRMAA dollar is hand-computed from the
  tier table like every moved tax dollar.
- **`t2` parity CANNOT stay 9/9 silent and must not.** Expected `INTENDED_DIFFS["v537→v538"]`:
  `["rothAca"]` — the ACA-guardrail fingerprint moves; `roth` and `rothCurrentEstate` (built on
  the `acaPremium: 0` household where no ACA code runs) must stay **byte-identical**, as must
  MC, extended-MC and stress. That declared-diff-plus-everything-else-identical result *is* the
  parity witness this candidate has waited two releases for. If anything outside the declared
  set moves, the fix has overreached — stop and narrow (§E).
- **`t3`** — the ACA-bridge block's `gainyRun`/`bigSlider` figures may move; its assertions are
  directional (they should hold) but must be re-run, not presumed.
- **`t22`** — group H dollar anchors (`ANCHOR`, the H-A'/H-B subsidy figures) sit on
  knife-edge floor-crossing households by design; any that move are **re-derived by the
  suite's own documented method**, never nudged until green. The oscillation pin (H-A') and
  the S6-2 source assertions must survive.
- **The Roth tab DOM (example household)** — the demo couple is on the bridge (§1), so rendered
  strategy rows can move at $K rounding. Measure; do not assert either direction (B2). The
  Taxes, IRMAA and Withdrawal tabs render Engines B/C/D and **cannot** move (census); the DOM
  diff asserts whatever the measurement shows, with the strongest true claim.
- **Every moved dollar figure that a test pins is hand-computed independently** (Section C
  standard: LTCG from the published brackets on the hand-built stack, gain from the basis
  ledger) and compared to engine output to the dollar. The §1 table's estimates are
  *disqualified* as expectations — they exist to size the effect, not to seed assertions.

## 6 · Tests this ships with

1. **A hand-computed exact case, in a new t22 group** (decision 2, resolved — t22 owns the ACA
   fixtures and their regime-bound derivation notes; a one-line cross-reference comment goes in
   t10 so a future session hunting Engine A exact cases finds the pointer): a bridge household
   with known pool/basis/loss schedule; assert the premium sale's LTCG to the dollar, the
   gross-up convergence, and basis conservation across both sales.
1a. **The IRMAA-lookback exact case (decision 1):** a household whose ACA-sale gain pushes the
   65–66 lookback across an IRMAA threshold — assert the surcharge to the dollar from the tier
   table, and assert a non-crossing year in the same schedule stays surcharge-free. Plus its own
   extinction half: dropping the `acaSaleGain` term from the `magiHist` write must fail this
   case and only this case.
2. **The asymmetry-extinction assertion:** on a household with `lost > 0` and `_gfEff > 0`,
   `totTax` strictly exceeds the identical household run with basis = pool (all-basis ⇒ zero
   gain ⇒ zero gain tax), by exactly the hand-computed LTCG. This fails the moment the tax
   charge is removed — the invariant that keeps this defect class extinct.
3. **The 0%-bracket case:** a household whose ACA-sale gain lands inside the 0% LTCG bracket —
   gain > 0, tax = $0, figures otherwise unchanged from v5.37 except the gross-up's null
   effect. (The §1 `acaCliff` row shows this regime is reachable, not hypothetical.)
4. **Invariance assertions:** `acaPremium: 0` household and pure-basis household byte-identical
   to v5.37 through `runRothStrategies` (JSON-canonical), so the guard's reach is measured, not
   assumed.
5. **`t2`:** the `INTENDED_DIFFS` entry for `v537→v538`; the declared set from measurement.
6. **Solver-mirror check:** extend t22 group H — under appreciated-sale funding *with* the tax
   gross-up, the acaCliff strategy still forfeits no bridge year (the anticipated sale includes
   its own tax). This is the check that stops the S-6 defect class from returning one layer up.
7. **Negative controls C14 and C15** in `qa/controls.sh` — one per mechanism, so each fires
   discriminatingly: **C14** reverts the tax charge (gross-up intact) → the extinction assertion
   (2) and the exact case (1) fire, and *only* they fire; **C15** drops the `acaSaleGain` term
   from the `magiHist` write → case (1a)'s crossing assertion fires alone. Run both and watch
   them fail; a control that does not fire is the finding (B2).
8. **DOM diff** re-pointed v537→v538, scoped by measurement per §5.
9. Version-tag maintenance: four in-app sites; t1's `KNOWN_VERSIONS`/`IS511`/`IS514` chains,
   verify-count gate, `verStr` map, `IS536` alias — budget for it (§I).

Suite counts are reported from parsed output at ship, per suite, never restated.

## 7 · Out of scope

- **NIIT and state tax on sale gains — both sales.** Today *neither* the funding sale's gain
  nor the ACA sale's reaches NIIT (L4027 sees `qdcg` only) or `stateTaxAnnual`'s `capGains`
  argument. Fixing that is a different mechanism touching the funding sale too, and bundling it
  would blur the parity attribution this release exists to keep clean. **Record it as its own
  finding at this release** (it graduates from "implicit" to "known and named" the moment this
  scope ships), optimistic direction, disclosed in METHODOLOGY.
- **Roth/Traditional fallback for a premium-sale shortfall**, and the transiently-negative
  `taxBal`. Pre-existing, unchanged; the gross-up clamps to the pool exactly as the funding
  sale does.
- **S-8** (`rothGainPct` initialisation) — separate surface, standing carry-forward.
- **E-6 / E-9 / E-15-family Engine D work, the Section-D gap sweep** — untouched.
- **Any Engine B/C/D change** — parity and census are the proof.
- Per-lot tracking, loss harvesting, wash sales — disclosed out of scope since v5.34.

## 8 · Decisions — RESOLVED by Steve, 2026-08-17 (recommendations adopted as stated)

1. **IRMAA-lookback routing of the ACA sale's gain: INCLUDED in this release.** ✅ The funding
   sale's gain enters `magiHist[yr]` (L4118); the ACA sale's did not, and after the tax fix
   that would have been the last remaining asymmetry between the two sales. Same sale's gain,
   one assignment, same parity witness; conservative direction. This supersedes the "into MAGI
   and no further" boundary of the v5.34 d-iii/d-iv decision, by the same maintainer who set
   it. Design in §3 step 6; blast radius in §5; witnessed by §6 case 1a and control C15. The
   L4166–4172 comment rewrite must reflect both halves of what this falsifies.
2. **Exact tests live in a new t22 group.** ✅ t22 owns the ACA fixtures and their regime-bound
   derivation discipline; a one-line cross-reference comment goes in t10.
3. **Ship alone.** ✅ Nothing else rides: no S-8, no refactor, no copy work beyond the
   METHODOLOGY inversion and the source-comment rewrite. The pool-refresh repairs (§0 —
   executed 2026-08-17, sweep clean) and the two manifest edits (the `VERIFY.sh` row; the
   `capture_gain_fp.mjs` retirement, if taken) ride in the *packaging*, not the source.
4. **CHANGELOG framing: plain-direction, ratified on substance; wording reviewed by Steve at
   ship.** ✅ The entry must carry: figures move in the conservative direction (taxes higher,
   never lower); the NONE row and a zero slider are unchanged by construction; comparator
   rankings can reorder as a result (~$3K lifetime on the guardrail household, ~2.5% of a
   strategy's lifetime tax); a 0%-bracket household sees no change even though its gain is now
   taxed, so an unmoved number is not a missed fix; and — per decision 1 — bridge households
   can pick up an IRMAA lookback surcharge at 65–66 they did not carry at v5.37, same single
   cause. Claude drafts in that shape; Steve adjusts wording before it ships.

---

*Drafted 2026-08-17 against v5.37 (`ff4dddcb…`), clone-verified. The §1 instrumentation was a
scratch additive probe on a throwaway bundle copy; it ships nowhere and its figures are
estimates by construction, recorded here so the build session can check magnitude without
re-deriving intent.*
