# SCOPE — the IRMAA top tier starts AT its threshold (C-1), one tier rule for every engine, and the audit tidy-up

**Status: SCOPED 2026-09-25 — awaiting decisions D-1 to D-3 (§7). No code written.** Target release **v5.78**, built
from **v5.77** (source `9cdd345d488443a8ca146e8cbb7da332`, built `index.html` `a2bc67451b11cad440709e3c342834d5`, repo
`4485505`; verified live and against a fresh clone on 2026-09-25). Every line number below is a v5.77 address.

---

## 1 · Premise — verified, not inherited

**The law.** 42 U.S.C. §1395r(i)(3)(C)(i)(III), the applicable-percentage table for years from 2019, read at the source
on 2026-09-25:

| If MAGI is | Applicable percentage |
|---|---|
| More than $85,000 but not more than $107,000 | 35 |
| More than $107,000 but not more than $133,500 | 50 |
| More than $133,500 but not more than $160,000 | 65 |
| More than $160,000 but **less than** $500,000 | 80 |
| **At least** $500,000 | 85 |

Clause (ii) doubles the lower amounts for a joint return and sets the last row at **150%** ($750,000). So tiers 1–4 are
"not more than" their upper amount, and the top tier begins **at** its threshold. §1395r(i)(5)(C) freezes the $500,000
through 2027 and indexes it from 2028. The code's constants already agree (`IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH: 2027`,
L1015); only the comparison is wrong.

**The defect, executed on v5.77** (the audit's own probe `qa/tools/audit_phase2_v573/audit_c1.mjs`, pointed at
`app_v577.mjs` — a session-only copy):

| Case (premium year 2028) | MAGI | v5.77 `totIrmaa` | The law |
|---|---|---|---|
| single, top threshold 500,000 × 1.02 = 510,000 | 509,999 | 6,360 (tier 4) | tier 4 ✓ |
| single | **510,000** | **6,360** | **top tier: 6,940** |
| single | 510,001 | 6,940 | top ✓ |
| joint, top threshold 765,000 | 764,999 / **765,000** / 765,001 | 12,720 / **12,720** / 13,880 | at 765,000: **13,880** |
| control — single tier-1 edge 113,403.60 | −1 / exact / +1 | 0 / 0 / 1,150 | exact → standard ✓ ("not more than") |

Identical to the audit's v5.73 figures. The under-charge at the exact threshold is **$580 per person per year** in the
app's surcharge table. **Optimistic, low severity:** for a float MAGI the band is one dollar wide, so it reaches only a
user who targets the threshold — but that is precisely what the Roth tab's IRMAA-aware strategies invite.

## 2 · Site census (parser: `census.cjs` over `IRMAA_CONSTS`, its aliases, `irmaaThresholdFor`, `isTopIrmaaTier`)

The audit (E-22) counted "4 comparisons (A ×3, C ×1)". The parser finds three **selection loops** and three other readers:

| Site | What it is | Reaches the top tier? | Action |
|---|---|---|---|
| Engine A L4451 (`_upsC` loop, in a conversion solver) | tier selection | yes | route through the shared helper |
| Engine A L4619 (`ups` loop) | **tier selection that bills IRMAA** | yes | route through the shared helper |
| Engine C L4876–4882 (`tierForMagi`) | tier selection | yes | route through the shared helper |
| Engine A L4397–4398 (`_upsCap`, the IRMAA-avoidance cap) | targets the **tier-1** threshold only (`isTopIrmaaTier(_upsCap, 0)` is always false) | no | none — pinned unchanged (`t44` C-2) |
| Engine C L4998–4999 (`nextTierUpper`, `headroom`) | headroom to the next tier | yes, from tier 4 | **decision D-1** |
| Roth tab L9650, `projectBracketsAt` L5539 | first threshold only (`[0]`, `false`) | no | none |
| IRMAA tab tier table L10573 | labels the top row `> $500K` | copy | becomes `≥ $500K` (§4) |

The audit's "Engine A ×3" was the two loops plus the cap at L4398; the cap cannot reach the top tier.

**The suite carries the defect's rule too.** `t10`'s reference oracle (L150) picks tiers with `magi <= thrRef(...)` at
every tier, top included. It agrees with the engine today only because no `t10` case lands exactly on the top threshold.
`t17` tests every threshold at **±$1** (L131–145) — which cannot see C-1; that is E-25's "MAGI exactly on a threshold"
gap. Neither suite is wrong about anything it asserts; both are blind here.

## 3 · The fix

One module-level helper beside `irmaaThresholdFor` and `isTopIrmaaTier`, so tier *selection* has one home the way
threshold *computation* has had since v5.14:

```js
// §1395r(i)(3)(C)(i)(III): tiers 1–4 are "not more than" their upper amount; the top tier is "at least" its own.
const irmaaTierFor = (magi, uppers, premiumYr, baseYr) => {
  for (let i = 0; i < uppers.length; i++) {
    const thr = irmaaThresholdFor(uppers[i], isTopIrmaaTier(uppers, i), premiumYr, baseYr);
    if (isTopIrmaaTier(uppers, i) ? magi < thr : magi <= thr) return i;
  }
  return uppers.length - 1;
};
```

Engine A's two loops call it with their `ups` arrays; Engine C's `tierForMagi` calls it with its tier table's uppers
(`TT.map(t => t.magiUpper)`, keeping each engine's own choice of filing status — as v5.77 kept each engine's choice of
§86 status). The helper is exported through the shim, guarded (`_g`), for `t44`.

## 4 · Presentation

- The IRMAA tab's tier table labels the top row **`≥ $500K`** (joint `≥ $750K`); tier 4's `$205K–$500K` range stays.
- The Field Manual, METHODOLOGY and the Verify tab say nothing that contradicts "at least" (searched for 500K / 500,000 /
  750K / 750,000 and their "above / over / more than" forms). A Verify-tab row stating the rule is optional; not planned.
- The AST literal census (OPERATIONS §B1a) runs at build time over every suite string and regex, old vs new source, to
  find anything asserting `> $500K`; the pre-scope search found none.

## 5 · Tests — `t44_irmaa_top_tier.mjs`, both legs

The v5.77 leg pins C-1 as a dated known defect; the v5.78 leg asserts the statute. Hand-derived throughout: premium year
2028 thresholds are 500,000 × 1.02 = **510,000** and 750,000 × 1.02 = **765,000**; tier-4 / top surcharges per person are
**6,360 / 6,940** (`IRMAA_CONSTS.SUR`).

- **A · The helper against an independent oracle** written in the test from the statute's wording, at **exactly**, −1
  and +1 of every threshold, single and joint, frozen years (2026–2027) and indexed years (2028+), including
  non-integer thresholds such as 113,403.60. (v5.77 leg: the helper does not exist — asserted.)
- **B · Every engine at the exact top threshold:** Engine A's billing (L4619) and its solver (L4451), Engine C's
  `tierForMagi`, single and joint. v5.78: top tier, 6,940 / 13,880. v5.77: tier 4, 6,360 / 12,720, dated pins.
- **C · Nothing else moves:** the exact tier-1 to tier-4 edges stay in the lower tier on both legs (the control that
  proves the fix is confined to the top); the IRMAA-avoidance cap's target is unchanged (C-2); and the example household
  is unchanged in all seven Roth strategies and on the IRMAA tab (its MAGI is far from $500,000 — to be measured, not
  assumed).
- **D · The label:** the tier table's top row reads `≥ $500K` / `≥ $750K` (DOM).
- **E · Structural, by parser:** no function but `irmaaTierFor` compares a MAGI against an `irmaaThresholdFor` result
  inside a loop — i.e. a fourth private tier loop fails here.
- **`t10`'s oracle is corrected** to the statute (strict `<` at the top) with a comment saying why, and gains one
  exact-threshold case, gated per leg.

**Negative controls** (`qa/tools/controls_v578_irmaa.py`): M1 the helper reverts to `<=` at the top (A, B fire);
M2 Engine C gets a private `<=` loop (B and E fire); M3 the helper uses `<` at **every** tier (C's lower-edge controls
fire — the fix must not leak downward); M4 the label reverts (D fires); M0 unmutated passes.

## 6 · The tidy-up, folded into this package (decided 2026-09-25)

- **T-1 · The audit's at-a-glance table.** `FlawsToFix-v5_73-Phase2.md` still shows **C-8, C-3 and C-6** as open; they
  were fixed at v5.74 and v5.75 (their entries and the CHANGELOG say so; the table rows were never annotated). Annotate
  them, and C-1 as fixed at v5.78. `AUDIT_TOP_FIVE_SUMMARY.md` (repo-only) notes only v5.74's fix; add C-3/C-6 (v5.75),
  C-4 (v5.77), C-1 (v5.78).
- **T-2 · The Phase 3 documents' header tables.** `MissingFeatures.md` and `ARCHITECTUREIssues.md` still open with a
  "Build under audit: v5.29" table; their current blocks are the **v5.73** ones further down. That misled the v5.77
  handover (and this project's own recommendation of 2026-09-25) into proposing a Phase 3 that had already run. Roll each
  header row to name v5.73 as the current pin and point at its block. Annotation only — no finding changes.
- **T-3 · Two `package_check` drift checks,** app releases only (`KIND: app-release`):
  **K-10** — `TESTING.md`'s "**Current build: vX.YY**" names this package's version (it went stale four times: v5.71,
  v5.73–v5.74, v5.75–v5.76); **K-11** — `PROJECT_KNOWLEDGE_INDEX.md`'s newest "SHIPPED" ship note names this package's
  version (v5.75 and v5.76 left none). Each gets a negative control in `package_check_controls.sh` (**P66**, **P67**), and
  the controls run in both phases as OPERATIONS §I requires for any `package_check` change.

## 7 · Open decisions for Steve

**D-1 · Engine C's headroom at the top boundary.** `headroom = threshold − magi`. For tiers 1–4 a household can add
exactly that much and stay in its tier ("not more than"); at the top boundary, adding exactly that much reaches "at
least" and bills the top tier. (a) **Subtract $1 for the top threshold only**, so headroom always means "the most you can
add and stay in this tier," in whole dollars; or (b) leave it, and let the one-dollar difference stand. **Recommend (a)**
— it is the same one-dollar band as C-1, and a headroom figure is exactly what a threshold-targeting user reads.

**D-2 · Projected thresholds are not rounded to $1,000.** §1395r(i)(5)(B) rounds every indexed amount to the nearest
$1,000; `irmaaThresholdFor` does not (2028 tier 1 = 113,403.60, where CMS's own figure would be a round thousand). The
projection already uses a 2%/yr proxy for CPI-U (disclosed, METHODOLOGY §6), so its error dwarfs the rounding.
(a) **Out of scope — record it as a new low finding (C-13)** and decide it alongside the brackets, which have the same
question at $50; or (b) round here. **Recommend (a):** rounding moves every projected IRMAA edge by up to $500 and would
touch far more households than C-1 does, so it deserves its own measurement.

**D-3 · Version.** This is **v5.78**, changing modeling, so METHODOLOGY gets a sentence (the top tier begins at its
threshold). **Recommend** yes; stated here so it is not silent.

## 8 · Out of scope

C-10, C-5, C-11; D-4 and D-7 (the Engine A draw question — worth measuring, but a separate scope); the phone layout
(F-11/F-12, next); text size and touch targets (F-3/F-4, after that, with your direction first); D-2(b) if declined.

## 9 · Build order (after decisions)

1. Freshness check (OPERATIONS §A) against the current pool and repo. 2. `t44` written first, run on both legs against
v5.77 — its v5.78 checks must fail there. 3. The helper and the three call sites; D-1 as decided; the label.
4. `t10`'s oracle; AST literal census; registration of `v578` (`vercensus`, its three special shapes, `t33` `PINS`,
`t41`–`t43` chains); wire `t44` into `runsuite.sh`. 5. Full suite, parity, `domdiff`; negative controls. 6. T-1, T-2,
T-3 with P66/P67. 7. METHODOLOGY, CHANGELOG, TESTING, manifest; version bump; build; `smoke_built`; package per §L;
`package_check` pre-ship.
