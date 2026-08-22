# STATUS — v5.43 shipped, Engine C gets the real §86

| Field | Value |
|---|---|
| Shipped | 2026-08-21 |
| Source | `src/DangerClose.jsx` md5 `7a9c6cfdaecaed0ebc77e98bfcd98b54` |
| Built | `index.html` md5 `7bbc3db533ca40ad516d43e976f9f574` |
| Prior | v5.42 `976a03fe16cd401b9735bbb21675bf5f` |
| Suite | **2,156 app checks, 0 failing** (1,420 verify this build) · parity **9/9** · `smoke_built` **16/16** |
| Decision | D-2 = **(b)**, maintainer, 2026-08-21 — now **resolved and closed** |

## 1. The fix

`computeIrmaaPlan` L4394 replaced its flat `ssTot * 0.85` with §86. Placed **below** `div_y` and
`capGain_y` — both are provisional-income terms declared after the old site, and computing the
phase-in where that line stood throws a temporal-dead-zone error. That trap was found during scoping
and is now pinned by `t1` STRUCT S-4. Thresholds come from `taxFactsFor`, the source the Roth tab
already uses; a third hardcoded copy is pinned against.

Measured on the shipped household: **3 of 25 years move** (2041 $101,748→$93,492, 2042
$103,746→$97,188, 2043 $105,779→$100,949), **zero tier changes, zero surcharge change**, headroom
corrected by up to **$8,256**. These reproduce the scoping figures exactly.

## 2. The scoping recommendation was partly wrong, and the CHANGELOG says so

The case argued for (b) included a false-IRMAA-surcharge scenario drawn from a synthetic sweep. It
**does not reproduce**. Per decision, the CHANGELOG makes no such claim. What shipped instead: the
fix is free (parity measured before the code was written), it corrects a rendered headroom figure,
and it closes the app answering one statute two ways.

## 3. Two test instruments were wrong — both found by this release

**`t1`'s structural pin passed on the fixed build for the wrong reason.** The new source comment
quotes the retired expression verbatim, and the unanchored regex matched the *comment* — so it would
have asserted the defect was still present while the build was correct. This is the `t8`
comment-counting trap, one suite over, and the v5.42 brief warned about exactly this class. Anchored
to line starts; the reason is recorded in the source.

**The DOM diff asserted the IRMAA figures are identical across every pair.** True until this release
changed them by design. Gated by pair; the replacement bounds the intended difference (exactly 6
figures move, none by more than $9,000) rather than suppressing the check. It also caught a modelling
error of mine mid-build: I first asserted every figure moves *down*, forgetting the table carries
headroom as well as MAGI, and headroom rises as MAGI falls. The check was wrong, not the code.

## 4. Negative controls — five run, five fired

Slope · the ½(adjbase − base) term · the 85% cap → `t25`. Threshold pair frozen to joint · para1
capped at 85% → `t1`. The last two are behavioural no-ops on this household (all moving years are
joint; benefits far exceed $12,000, so the $6,000 term swallows para1's cap) — now asserted at
`t25` §D-8 rather than remembered.

## 5. Left open

- **Tidy-up items 4 and 7** — the ½-benefits cap in the taxable-income engine and the Roth tab's
  middle tier. Same defect, two places; ship together.
- **Items 2, 3, 5, 6.** Recommended order: 3+6 next (same `_perRmd` block, and item 3 is the largest
  remaining error at $13,724), then 4+7, then 2 (needs a fixture — it is $0 on the example
  household), then 5 (the only one with parity risk).
- **`SCOPE_FIX_tidyup_six.md` is still repo-only** and governs the next build.
