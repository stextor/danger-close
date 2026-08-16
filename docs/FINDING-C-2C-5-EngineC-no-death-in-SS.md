# FINDING C-2C-5 — Engine C (IRMAA) does not model the first death in Social Security

**Status: PROVISIONAL.** Found incidentally while implementing the v5.11 survivor-RMD fix. The
code path was read and the absence confirmed by source inspection; the dollar effect on the
surcharge has **not** been executed. Do not treat the magnitude as measured.

**Build:** v5.11 · `src/DangerClose.jsx` md5 `f645a3967c687960bb03227b5ce5bfec`
**Predecessor build audited:** v5.10.2 · md5 `7ddda3585abb9dc2c40fa4fbfc46967a` (defect present identically)
**Date:** 2026-08-08 · **Related:** `FlawsToFix-v5_10_2-Phase2C.md` (C-2C-1…C-2C-3),
`FINDING-C-2C-4-EngineD-no-death-modeling.md` (same class, Engine D)

---

## 1. What the code does

Engine C (the IRMAA planner) has **no first-death machinery at all**. Confirmed by reading the
whole engine block: the only household-status variable in scope is `_singleI`. There is no
`_deathYr1`, no `widowed`, no survivor concept, and no filing switch anywhere in the engine —
with one exception introduced at v5.11, described below.

Two consequences, both in the MAGI that drives the surcharge:

1. **Both Social Security benefits are paid for the entire horizon.** The engine computes
   `ssTot = annualSSA(yr) + annualSSB(yr)` for every year to the end of the projection. In
   reality the survivor keeps only the larger of the two checks — which is exactly what
   Engine A (Roth) and Engine B (Taxes) both model.
2. **Filing status never switches.** The IRMAA tier table is selected once from `_singleI`, so a
   surviving spouse is scored against **MFJ** thresholds for the rest of the plan, where the
   Taxes tab correctly moves them to Single.

There is also a fixed `ssTaxable = ssTot * 0.85` simplification, which is a separate, pre-existing
approximation and is not part of this finding.

**What v5.11 did and did not change.** v5.11 introduced `_deathYr1` and `_survivorIsA` into this
engine, but deliberately scoped them to the **RMD basis only** (the spousal rollover for the
per-person Traditional balances — finding C-2C-3). The Social Security and filing-status
behavior described above is **unchanged** from v5.10.2 and earlier. A comment at the declaration
site says so explicitly, so a future reader does not mistake the presence of `_deathYr1` for
death being modeled here.

---

## 2. Direction — and why this one is not urgent

The two effects push MAGI in **opposite** directions, and the net is not obvious without execution:

| Effect | Direction on MAGI | Direction on the surcharge |
|---|---|---|
| Paying both SS checks after the first death | **Overstates** MAGI | Overstates — conservative |
| Keeping MFJ thresholds for a survivor | Thresholds too **generous** | Understates — non-conservative |

The first effect is bounded by the smaller spouse's benefit; the second is bounded by the gap
between the MFJ and Single tier thresholds, which is roughly a factor of two at every tier. **The
net sign is therefore genuinely unknown and must be executed, not reasoned about** — which is why
this finding is provisional rather than severity-rated. My prior working assumption that this was
simply "conservative" was based on the first effect alone and is not safe.

This differs from C-2C-3, where the direction was executed in both configurations before the fix
was scoped.

---

## 3. Why it is a finding

Same test as C-2C-3: an **undisclosed cross-engine divergence**. Engine A and Engine B both
reduce Social Security to the survivor's single check and switch filing at the first death;
Engine C does neither. The three engines therefore report different MAGI for the same household
in the same year, and nothing on the IRMAA tab discloses that its projection assumes both spouses
live to the end of the horizon. METHODOLOGY as of v5.11 now records the limitation, so the
*undisclosed* half is closed — what remains open is whether the arithmetic should change.

---

## 4. Owed before this can be closed

1. **Execute it.** Drive the IRMAA tab through jsdom in both direction configurations (the t11
   harness already does exactly this setup and can be reused), read MAGI, tier, and surcharge
   across the death boundary, and establish the net sign and magnitude. Precision ceiling
   applies: ±$500 on MAGI and ±$50 on the surcharge (`STOP-REPORT-EngineBC-render-precision.md`).
2. **Interaction check.** Fixing this changes `magi`, which changes tiers — the same coupling
   flagged for F-2B-1 / F-2B-2. Whichever ships second must re-verify the first's assertions.
3. **Decide fix vs disclose**, with C-2C-4 (Engine D, the Withdrawal tab, which pays both SS
   checks for the full horizon) in the same scope. These are one defect class across two engines
   and should be scoped together rather than fixed piecemeal.

---

## 5. Honesty statement

Every code claim here was read from the canonical v5.11 source this session. **No figure in this
document was measured** — the direction table is reasoning about bounds, not results, and is
labelled as such. Nothing here was changed in v5.11 beyond the RMD basis and the METHODOLOGY
disclosure.
