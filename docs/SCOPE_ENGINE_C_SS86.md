# SCOPE — Engine C gets the real §86 (D-2 option (b))

| Field | Value |
|---|---|
| Written | 2026-08-21, scoping session after the v5.42 ship |
| Target | **v5.43** |
| Base source | `src/DangerClose.jsx` md5 **`976a03fe16cd401b9735bbb21675bf5f`** (v5.42) |
| Kind | Modelling fix · `src/` change · version bump · new invariants · METHODOLOGY update |
| Decision | **D-2 resolved: (b).** Maintainer's call, 2026-08-21 |
| Status | **SCOPED — one open decision (D-2b-1), does not block. Buildable.** |

---

## 1. ⚠ Correction to the recommendation that produced this decision

**The case I made for (b) was partly wrong, and the error was in my favour. It is corrected here
before anything is built on it.**

I recommended (b) on two grounds. The first holds and is now measured properly. The second does not
hold as stated:

> *"Above $59,600 of annual benefits, the flat 85% can push MAGI over the first threshold when the
> statute wouldn't… a $1,150/yr surcharge shown to someone who owes $0."*

That came from a **synthetic grid sweep**, and I flagged at the time that it had not been reproduced
through the app. It now has been tested against the real engine, and **it does not reproduce on the
shipped example household.** Engine C was patched with the statute and both legs captured:

| | Result |
|---|---|
| Years whose MAGI moves | **3 of 25** (2041–2043, joint) |
| Size of the move | **$4,830 – $8,256** |
| **IRMAA tier flips** | **0** |
| **Surcharge difference** | **$0** |
| Rendered **headroom** corrected | 3 years, understated by up to **$8,256** |

The household's nine survivor years (2045–2052) **do not move at all** — their provisional income is
past the single-filer convergence point, so the flat rule is already exact there. That is the
opposite of what my sweep-based argument predicted for survivors, and it is the specific claim that
was wrong.

**A second error, disclosed because it changes what an earlier measurement proved.** The first parity
experiment used a patch that referenced `div_y` before its declaration — a temporal-dead-zone error.
It ran green and the fingerprint was unchanged, but only because the broken code never executed. So
that run did **not** demonstrate what I said it did. It was redone with a working patch; the result
below is from the corrected run.

**Does the decision survive the correction?** I believe yes, but on narrower grounds — see §3. If the
false-surcharge argument was what persuaded, **this scope should be re-read before it is built.**

## 2. The defect

`computeIrmaaPlan`, **L4394** in v5.42 (`funcmap.cjs` to re-find):

```js
const ssTaxable = ssTot * 0.85;
```

Engine C does not implement 26 U.S.C. §86 at all. It treats 85% of benefits as taxable regardless of
provisional income — no base amount, no adjusted base amount, no phase-in, no filing-status
thresholds. Below the convergence point it overstates includible benefits by up to **$46,920** on a
household with $55,200 of benefits.

Since v5.42 the Roth conversion tab **does** implement §86. The app therefore gives two different
answers to the same statutory question depending on which tab you are looking at.

## 3. Why do it — the case as it actually stands

1. **It is free.** Measured, not argued: patching Engine C with the statute moves **zero of the nine
   parity fingerprint keys**. Engine C has exactly one call site — the IRMAA tab's render (L9803) —
   and `runRothStrategies`, the parity witness, computes IRMAA independently via `taxableSSPortion`
   (Engine B). Engine C is on no fingerprinted path. **This corrects the tidy-up scope's premise that
   (b) is "a larger release with a parity impact."** It is not; it is one expression.
2. **It corrects a number users read.** `headroom` is rendered (L9872). On the shipped household it
   is understated by up to **$8,256** across three years — the figure someone uses to judge how much
   conversion room they have before an IRMAA cliff.
3. **It removes an internal contradiction.** After v5.42 the app answers the same statutory question
   two ways. Documenting that permanently (option (a)) is a standing disclosure that a future reader
   must be told about; fixing it makes the question moot.
4. **It unblocks the div/capgain invariant.** With Engine C correct, that release's central invariant
   reads plainly as *term sets equal, values equal* — no carve-out.
5. **Dollar-exact testability.** Engine C is module-level and already exported through the shim
   (`__engines.computeIrmaaPlan`). **This release is not subject to the §M ±$500 render ceiling** —
   unlike v5.42, its assertions can be to the dollar.

**What is NOT part of the case:** preventing a false IRMAA surcharge. That remains a sweep result
only (single filers, benefits ≥ $59,600), unreproduced on any real household. It may be real and
merely un-hit by this example; it is **not evidence** until a fixture demonstrates it. See D-2b-1.

## 4. Site census

| Site | v5.42 line | What it is |
|---|---|---|
| The defect | **L4394** | `const ssTaxable = ssTot * 0.85;` |
| Consumer | L4398 | `const magi = ssTaxable + pen_y + …` |
| Ordering trap | L4395–4397 | ⚠ `div_y` and `capGain_y` are declared **after** `ssTaxable`. A phase-in that reads them must be placed after their declarations or it throws a TDZ error — this bit the scoping experiment. Move the computation below `capGain_y`, or hoist the two terms. |
| Threshold source | L8878–8879 (Roth tab) | The Roth tab selects thresholds via `taxFactsFor(_filingSingleAt(year)).ssThr1/ssThr2`. Engine C has `filingSingleI` in scope already. **Decide whether to reuse `taxFactsFor` or read the constants directly — do not introduce a third copy of the thresholds.** |
| Oracle | `qa/tools/hand_86.mjs::statute86` | Already the suite oracle (v5.42) |
| Call site | L9803 | The only one |
| Not touched | `taxableSSPortion` L4990 (Engine B), the Roth tab's tiers, `runRothStrategies` | |

## 5. Tests

**Dollar-exact, module-level — no §M ceiling.**

1. **New assertions in `t13` (Engine C) or a new suite** — `computeIrmaaPlan`'s `magi` asserted
   against `statute86` for every row of the shipped household, **to the dollar**, on both legs.
2. **The three moving years pinned by value**: 2041 $101,748 → $93,492, 2042 $103,746 → $97,188,
   2043 $105,779 → $100,949. Gated per leg; the v5.42 leg asserts the flat figures as a dated
   `[KNOWN DEFECT]` pin.
3. **The 22 unchanged years pinned as unchanged** — the overreach test, the role `t23` played at
   v5.42.
4. **Headroom pinned** for the three years, since it is the user-facing consequence.
5. **A `t1` structural pin** that `ssTaxable` is no longer a bare `ssTot * 0.85`, gated per leg.
6. **Negative controls, mandatory**: the phase-in slope · the `½(adjbase − base)` term · the 85% cap
   · the filing-status threshold pair. Each must fire. **If one does not fire, that is the finding**
   (§B2) — investigate, do not soften the control. Note the v5.42 precedent: one control there was a
   genuine behavioural no-op and had to be explained, not adjusted.
7. **Parity 9/9, mandatory and expected to hold.** If it breaks, the change reached past Engine C.

## 6. Out of scope

Engine B's `taxableSSPortion` (tidy-up item 4) · the Roth tab's middle tier (item 7) — **both are the
½-benefits-cap defect and should ship together in their own release**, not be folded in here because
the statute is open · tidy-up items 2, 3, 5, 6 · `div_y`/`capGain_y` on the Roth tab · the §M hoist ·
`runRothStrategies`.

## 7. Open decision

**D-2b-1 — does this release also ship a fixture proving the false-surcharge case, or not?**

The tier-flip claim is unproven. Options:

- **(i) Ship the fix without it.** The four grounds in §3 stand on their own. The claim is simply not
  made. *Recommended* — it is the honest minimum and does not delay the fix.
- **(ii) Build a survivor fixture with benefits ≥ $59,600 and assert the flip.** Stronger: it would
  turn a sweep into a demonstrated user-facing defect and give the CHANGELOG a real consequence to
  report. Costs a fixture install through `applyLoadedData` (wrapper, module globals, no re-render —
  §C traps).
- **(iii) Drop the claim entirely** and note in METHODOLOGY that it was hypothesised and not
  reproduced.

**Does not block the build.** (i) can ship and (ii) can follow. What must **not** happen is the
CHANGELOG repeating the $1,150 false-surcharge figure as though it were measured.

## 8. Definition of done

Suite green, counts parsed from output · **parity 9/9** · dollar-exact assertions on all 25 Engine C
rows, both legs · the three moving years and 22 unchanged years pinned · negative controls that
**fired** · `t1` structural pin · four version sites · `smoke_built` 16/16 · METHODOLOGY updated
(this changes modelling, and it **retires** the v5.42 disclosure that the tab and Engine C disagree) ·
CHANGELOG with per-suite counts, the direction disclosure (**this one also makes figures fall**), and
**no unmeasured false-surcharge claim** · knowledge refresh, manifest rolled, `.jsx` rotated to
exactly two.
