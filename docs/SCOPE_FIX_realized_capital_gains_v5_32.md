# SCOPE — v5.32 · Ordinary drawdown realizes capital gains (addresses **D-2**)

| Field | Value |
|---|---|
| Governing finding | `MissingFeatures.md` **D-2** — medium-high, **user-side**, ranked top item |
| Build under scope | **v5.31** · source md5 `17636ea1b24ea37c806008e7a6b1a32f` |
| Built `index.html` | `ec935c4af4309ee3dbcf2d2c269383ad` |
| Prior build (comparison leg) | v5.30 · `8fcc546263f59fb4a88c131e97f4c882` |
| Proposed version | **v5.32** |
| Engine behaviour | Capability changes; **with the shipped default of 0, no figure moves.** Parity 8/8 strict is the gate — §5 |
| **Revision** | **Rev C, 2026-08-13.** Rev A was written from inspection and carried two false premises (§1.1, §1.2). Rev B recommended a non-zero default because it was *the conservative direction*; **a six-household measurement falsified that too** (§1.3). All corrections recorded in place |
| Status | ✅ **ALL EIGHT DECISIONS RESOLVED. Ready to build.** §6 |
| Supersedes | `SCOPE_FIX_realized_capital_gains_v5_32_RevB.md` — **delete it from the pool.** The `_RevB` filename also broke convention: the revision belongs in this header, as `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` shows |

---

## 1. Three corrections, all found before any code was written

Rev A instructed a build session to **STOP and report** if evidence contradicted its premise. That
instruction fired three times during measurement. The errors were mine and they were structural.

### 1.1 ⚠ Engine B cannot compute a gain — Rev A's S-3 was impossible

Rev A said *"`capGains_y` becomes `drawFromTaxable × gainFrac`."* **Engine B has no
`drawFromTaxable` and no way to derive one.** `computeTaxPlan`'s body is **19,141 characters** with
**zero** references to `drawFromTaxable`, `draw`, `spend`, `exp_y`, `expenses` or `withdraw`. Its
taxable balance is static: `const _taxableInit = taxableInitAll()` is evaluated **once, outside the
year loop**, and never decremented.

Rev A hid an architectural choice inside a table row. It became **D-4**.

*(The static balance overstates dividends, hence tax — the conservative direction — so it is an
inconsistency, not a defect. Its own finding, out of scope here.)*

### 1.2 ⚠ A flat gain fraction invents gains that do not exist

| Quantity (example household) | Value |
|---|---|
| Taxable pool at retirement | **$147,000** |
| Lifetime draws from the Priority-1 pool | **$997,685** |
| ...from the **original** appreciated pool | **$147,000** |
| ...**recycled RMD surplus**, entering at full basis | **$850,685 — 85.3%** |

At a 40% share a flat fraction produces **$399,074** of gains against **$58,800** real — **$340,274
phantom**. The funding model gets away with a flat share because nothing refills its pool mid-plan;
Engine D's pool is refilled every RMD year. **Basis must be tracked** — D-3.

### 1.3 ⚠ Realizing gains is NOT reliably conservative — this killed Rev B's D-2 argument

Rev B recommended a non-zero default *because it was the conservative direction*. Measured across six
household shapes, **the direction flips on two of them** (§2.2), and §2.3 shows the flip is an
artifact of a different modelling gap. A conservative default is defensible; an **indeterminate** one
cannot be described honestly in release notes. D-2 was re-decided on that basis.

---

## 2. Measurement — six households

All figures from unmodified v5.31 engines; gains computed outside them with the D-3 basis tracker.

### 2.1 The example household

| Gain share | Real gains | Fed LTCG | NIIT | IRMAA | ACA |
|---|---|---|---|---|---|
| 25% | $36,750 | $0 | none | none | −$4,073 |
| 40% | $58,800 | $0 | none | none | −$7,082 |
| 75% | $110,250 | $0 | none | none | −$15,043 |

**Federal capital-gains tax is $0 at every share.** The gain-bearing years are bridge years with
`taxableOrdinary = $0`, so gains stack from the bottom and stay inside the 0% LTCG bracket
(**$100,878 MFJ in 2027**, $102,896 in 2028; 2026 base $98,900 indexed 2%/yr). NIIT ($250,000) and
IRMAA tier 1 ($218,000) are never approached.

### 2.2 Six shapes, 40% gain share

| Household | Real gains | Fed LTCG | NIIT | IRMAA | ACA | **Net** |
|---|---|---|---|---|---|---|
| A · example household | $58,800 | $0 | $0 | none | −$7,082 | **$7,082 worse** |
| B · large pension ($90K/yr) | $58,783 | $8,817 | $164 | none | $0 | **$8,982 worse** |
| C · big Traditional, early RMD | $58,800 | $0 | $0 | none | −$7,082 | **$7,082 worse** |
| D · working spouse to 70 | $58,800 | $0 | $0 | none | −$1,469 | **$1,469 worse** |
| **F · low MAGI, near 100% FPL** | $58,800 | $0 | $0 | none | **+$36,438** | **$36,438 BETTER** |
| **E · large brokerage (+$600K)** | $298,800 | $1,905 | $0 | none | **+$76,268** | **$74,363 BETTER** |

**IRMAA never moves — no household, no share.** Gains land in bridge years before Medicare, and by
IRMAA age the pool is recycled RMD cash carrying no gain. **Federal LTCG appears only where ordinary
income pushes gains out of the 0% bracket** — household B alone.

Household D is not even monotonic: **$1,469 worse at 40%, $32,848 better at 75%.**

### 2.3 Why the sign flips — and why it is an artifact, not a benefit

Below **100% of FPL** the model returns a **$0** subsidy and defers to Medicaid rules it does not
model (disclosed). FPL rises ~2%/yr while a flat drawdown MAGI does not, so a household can **drift
below the floor mid-plan** and lose its entire modelled subsidy. Realizing gains lifts MAGI back over
the floor and restores it — worth a full benchmark premium.

Traced directly: couple, $19,200 benchmark, MAGI $24,472 — **2032: subsidy $18,686** (102% FPL);
**2034: subsidy $0** (98% FPL; the floor has risen to $24,858). Same MAGI, opposite answer, two
years apart.

**That $0 is a placeholder meaning "not modelled", not a statement that the household receives
nothing.** So households E and F do not show gains improving a plan — they show a modelled number
compared against an unmodelled blank. **This is an ACA-floor artifact and must not be read as
evidence about capital gains.** Raised separately — §7.

### 2.4 Two harness errors of mine, corrected

Recorded so the numbers above are not over-trusted. My first household C scaled `total401k` without
scaling `household`; since `_taxInit = household − total401k`, that drove the taxable pool to **$0**
and reported zero gains — I nearly filed it as a finding about RMD-heavy households. And I first read
household E's negative ACA figure as a harness bug rather than the real floor effect. Both were my
construction. **Neither was a defect in the app.**

---

## 3. Premise — verified against v5.31 source

| Line | Code | Role |
|---|---|---|
| **L4653 / L4657** | `const capGains_y = 0;` · `qdcg_y = capGains_y + div_y` | Engine B — the zero, and the stack a gain must join |
| **L4366** | `drawFromTaxable = Math.min(remaining, taxable)` | Engine D — the draw that realizes |
| **L4381–4387** | `_taxBoy`, `_ordFrac`, `othOrdDraw`, `_rmdShrink` | Engine D — **the precedent D-3 mirrors** |
| **L4391** | `taxable += rmdToTaxable;` | Engine D — the full-basis inflow §1.2 is about |
| **L4430** | `const magi = taxableSS + … + othOrdDraw + conv_y;` | Engine D — no gain term |
| **L4139** | `const magi = ssTaxable + … + div_y;` | Engine C — no gain term |
| **L3758–3772** | ACA cliff solver reserving headroom for the funding sale's gain | Engine A — **highest-risk site**, §8 |
| **L3913–3935** | funding-sale gross-up, LTCG stacking, MAGI feed | Engine A — existing, do not touch |
| **L3951** | `acaSubsidyAnnual(acaMagi, …)` | Engine A — **the only ACA consumer** |
| **L4858 / L8702** | `useState(0)` · the 0–95 input | the existing, unpersisted control |
| **L9137 / L9080** | "Realized cap gains" row + chart series | **output surface already built**, renders $0 today |
| **L4533** | `ltcgTax(capGains, ordinaryTaxable, yr)` | stacks correctly; asserted by `t18`; do not touch |

**No basis field exists** — 0 AST hits for `basis`, `costBasis`, `basisFrac`, `gainShare`;
`STORAGE_KEYS` has no key for one. **Instrumentation ceiling: none** (OPERATIONS §M) — every moved
figure is assertable to the cent.

---

## 4. Site census

| # | Site | Change |
|---|---|---|
| **S-1** | `PORTFOLIO` schema + `applyLoadedData` migration | one persisted household-level gain share (D-1), default **0** (D-2) |
| **S-2** | My Data — taxable/Other accounts card | the control and its disclosure line |
| **S-2b** | **the visible prompt (D-2)** | beside the detected-taxable-holdings figure: state that **0% embedded gain is assumed**, that this is unlikely for a long-held account, and where to change it |
| **S-3** | **Engine D — the basis tracker** | running basis balance; inflows add basis 1:1; `gain = draw × (1 − basis/pool)`. Mirrors `_ordFrac` (L4382) |
| **S-4** | Engine D — `magi` L4430 | add the **gain** term, not the raw draw |
| **S-5** | Engine A — spending-draw gains | the site carrying the measured effect |
| **S-6** | ⚠ **Engine A — ACA cliff solver L3758–3772** | must reserve headroom for spending-draw gain. §8 |
| **S-7** | Engines B and C consume Engine D's gain series | the cross-engine dependency (D-4) |
| **S-8** | Roth tab L4858 / L8702 | read the persisted field instead of local state |
| **S-9** | Taxes tab L9137 / L9080 | **no code change** — becomes non-zero on its own once a share is set |
| **S-10** | disclosures — Taxes tab, METHODOLOGY §5/§12, Field Manual §13 | rewrite per D-7 |
| **S-11** | `TESTING.md`, `CHANGELOG.md`, manifest, `VERIFY.sh` | per §I |

**Do NOT touch:** the funding-sale gross-up (L3913–3935), `ltcgTax` (L4533), `taxYield`/dividend
handling, the ACA floor itself (§7), or the estate ranking (§7b).

---

## 5. Parity — 8/8 strict IS the gate

**Because the default is 0, this release must move no figure at all.** Parity run A (share = 0) must
be **8/8 strict**, and it is the whole verification story — a stronger position than Rev B's, which
would have needed documented intended diffs.

A separate **measured** run at a non-zero share confirms the mechanism works; its differences are
reported in the CHANGELOG but are not a gate.

---

## 6. DECISIONS — all eight resolved

### ✅ D-1 · Where the gain share lives → **one household-level persisted field**
Matches the shipped *"one blended gain share for the whole account"* disclosure; the user describes
only the **starting** pool, everything after is tracked by S-3. *Rejected:* per-account rows; a
second field beside `rothGainPct` (the F-2B-1 / F-2B-2 / C-2B-3 shape).

### ✅ D-2 · The default → **0, plus a visible prompt.** ACA floor split out as its own finding
**Resolved 2026-08-13, reversing Rev B.** Rev B argued non-zero *because it was conservative*; §2.2
shows the direction flips on two of six households, and §2.3 shows the flip is an **ACA-floor
artifact** — a modelled number compared against an unmodelled blank. A default whose direction
depends on whether a household crosses an artifact boundary is **indeterminate**, and indeterminate
cannot be stated honestly in release notes.

So: **ship the mechanism with a 0 default** — parity stays strict, nothing moves silently, and a
structurally significant release lands without a contested default riding along — **and make the
unknown visible** (S-2b) rather than silent, which answers the objection to 0 (that it helps nobody
who never finds the field) without inventing a number no source supports.

**Revisit the default once the ACA floor (§7) is resolved.** With the artifact removed, the direction
argument returns and non-zero can be judged on its merits.

⚠ **Consequence for honesty: the CHANGELOG must NOT claim D-2 is closed.** This closes the
*capability* gap; the *default* stays optimistic for anyone who does not set it. `MissingFeatures.md`
D-2 is **partially addressed** — not struck through — with the default named as outstanding.

### ✅ D-3 · Basis tracking → **a running basis balance in Engine D**
`gain = draw × (1 − basis/pool)`; RMD-surplus inflows add basis 1:1 and dilute the share as they
arrive. **The file already does this**: `_ordFrac` (L4382) tracks the ordinary fraction of the same
pool by the same mechanic, and v5.26's comment gives the identical reasoning — unspent RMD cash
*"dilutes the ordinary fraction rather than adding to it. Adding it to `taxOrd` would tax the same
dollar twice."* *Rejected:* flat fraction (falsified §1.2); initial-pool-only (right here only
because the pool fully drains; wrong wherever it does not).

### ✅ D-4 · Engine relationships → **Engine D computes the gain series; A, B and C consume it**
One owner of the drawdown. *Rejected:* Engine A only (the Taxes tab would report "Realized cap gains
$0" while the model realized them elsewhere — the cross-surface contradiction v5.31 just closed); a
second draw model in Engine B (the duplication behind C-2B-3 and F-2B-1/2).
⚠ **A structural change to how the engines relate**, not a parameter addition — B and C are currently
independent parallel projections. Warrants an `ARCHITECTUREIssues.md` note when it lands.

### ✅ D-5 · Gross-up on a spending sale → **no gross-up**
Federal tax is $0 in the gain-bearing years for five of six households, so it does nothing except
where gains reach the 15% band. Simpler, and matches the annual structure. **Confirm how expense
lines are defined before building** — if they are net of tax, revisit.

### ✅ D-6 · Migration → **inherit the default (0); no figures move**
With a 0 default no notice is required, which removes Rev B's migration risk entirely. The v5.26
notice precedent stays available for whenever the default changes.

### ✅ D-7 · The three "$0 unless a sale is modeled" disclosures → **rewrite, don't delete**
State that gains **are** now modelled on ordinary drawdown, name the blended-share and basis-tracking
simplifications, name the **0 default** explicitly, and keep the per-lot / loss-harvesting /
wash-sale exclusions that remain true. Per OPERATIONS §B2 invert every assertion guarding the old
copy, **gated per leg**, sweeping **all 28 surfaces** per the v5.31 sweep method.

### ✅ D-8 · Version → **v5.32**

---

## 7. New finding raised by this scope — proposed `MissingFeatures.md` **D-8**

> **D-8 · The ACA subsidy falls to $0 below 100% FPL, producing a discontinuity that can invert
> other results.** Below 100% FPL the model returns $0 and defers to Medicaid rules it does not model
> — disclosed. Two consequences were not understood until measured: (1) because FPL rises ~2%/yr
> while a flat drawdown MAGI does not, a household can **drift below the floor mid-plan** and lose
> its entire modelled subsidy — same MAGI, $18,686 in 2032 and $0 in 2034; (2) the $0 is a
> placeholder for *"not modelled"*, so any change lifting MAGI over the floor **appears to improve
> the plan by a full benchmark premium**, inverting the apparent direction of unrelated features.
> That is why v5.32's default could not be settled on direction.
> **Severity: medium. Exposure: user-side.** *The limitation is disclosed; the discontinuity is not.*

**Out of scope for v5.32** — but it **gates reconsideration of D-2's default**.

## 7b. Also explicitly out of scope

- **Per-lot selection, loss harvesting, wash-sale logic** — disclosed, staying out.
- **Step-up in basis at death.** The Roth tab ranks estates with *"taxable at face value"*, which is
  **correct** because inherited taxable accounts get a step-up. Do not "fix" it once gains are
  modelled; record the reason in a comment.
- **Engine B's static `_taxableInit`** (§1.1) — conservative-direction inconsistency, own finding.
- **ACA beyond Engine A** — the other tabs do not model it; claim no ACA improvement on them.
- **D-3 (progressive state brackets)**, **E-9**, and the sweep's **S-1** (IRMAA MAGI enumeration
  omitting dividends). S-1 may ride along only if the build opens that file anyway and stays green.

---

## 8. Risks

- ⚠ **S-6, the ACA cliff solver, is the highest-risk edit.** L3758–3772 already reserves cliff
  headroom for the funding sale's own gain; its comment says why — without it *"the strategy converts
  to the cliff and its own sale pushes the household over it: full subsidy forfeit from the strategy
  built to avoid it."* Adding spending-draw gains without updating that reserve reintroduces exactly
  that, silently, in the one place the code warns about it. **No existing test would catch it.** The
  maths is tractable — a spending gain depends on the year's expenses, not the conversion amount, so
  with respect to the solver's variable it is a constant that shifts the headroom — **but it must be
  shifted, and it needs its own hand-computed case.**
- ⚠ **`t19`'s B-2 pin must be rewritten, not flipped.** It asserts Engine D's MAGI does **not**
  contain `drawFromTaxable` and says that is *correct* (return of basis). After this release MAGI
  must contain the **gain** while still excluding the **basis**. A careless flip would assert the raw
  draw belongs in MAGI — wrong in the opposite direction, taxing return of basis.
- **A 0 default means the suite can pass while the feature does nothing.** The non-zero measured run
  (§9.6) is what proves the mechanism is real. Do not let strict parity stand in for it.
- **The disclosure rewrite (S-10)** is the v5.30/v5.31 defect class, entered deliberately. The
  28-surface sweep method is the control.

---

## 9. Tests

1. **Basis tracker — the recycling case is the headline.** Draw the original pool to zero, refill
   from RMD surplus, assert **the refilled pool realizes no gain**. This is §1.2 made executable, and
   the assertion that would have caught Rev A.
2. **Engine A / ACA** — hand-computed subsidy at a known MAGI with and without spending gains, plus a
   **cliff-proximity case** proving S-6's reserve accounts for them.
3. **`t18` (Engine B, dollar-exact)** — gains stacked across the 0%/15%/20% LTCG breakpoints, **one
   dollar either side of each**, both filing statuses; NIIT borders at $200,000/$250,000. *(All $0 on
   the example household — these need a purpose-built household, as `t13` and `t17` already use.)*
4. **`t17`/`t13` (Engine C)** — a gain crossing an IRMAA tier moves the surcharge **two years later**.
5. **`t19`** — the B-2 pin rewritten per §8.
6. **Zero-default inertness AND non-zero efficacy — both required.** At share 0 every engine is
   byte-identical to v5.31; at a set share the gain series, MAGI and subsidy all move by
   hand-computed amounts.
7. **`t5`** — persistence, migration from a v5.31-shaped backup, Clear-All coverage.
8. **`t4`** — the S-2b prompt renders; the disclosure rewrite, gated per leg.
9. **Negative controls (mandatory)** — corrupt the share and confirm Engine A's subsidy, Engine D's
   MAGI and the basis tracker all move. **If any does not fire, that is the finding.**
