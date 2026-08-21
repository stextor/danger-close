# STATUS — v5.42 shipped, the §86 upper-tier cliff

| Field | Value |
|---|---|
| Shipped | 2026-08-21 |
| Source | `src/DangerClose.jsx` md5 `976a03fe16cd401b9735bbb21675bf5f` |
| Built | `index.html` md5 `2ede63fd5d64c7318da975437218e7b1` |
| Prior | v5.41 `18152190e9b699529642ae2983b3ae2c` |
| Suite | **2,085 app checks, 0 failing** (1,385 verify this build) · parity **9/9** · `smoke_built` **16/16** |

---

## 1. Freshness check (OPERATIONS §A / §A2)

Clean, and clean in a way it has not been before. The manifest read v5.41, the CHANGELOG's newest
entry read v5.41, and **all five hashes the build brief recorded matched a fresh clone exactly** —
including `qa/tools/hand_86.mjs`, which the brief had to carry separately because that file was
repo-only and had no manifest row. It has one now.

The §A2 clone-and-diff ran **both directions by content**, 85 pool files against 190 repo files:

- **Pool-only:** `DangerClose-v5_40.jsx` alone — the rotated-out prior build. Expected.
- **Repo-only:** the built `index.html`, the `qa/tools/` scripts, and superseded `dom_entry_*`.
  All named in §A2 as expected. **No build input was repo-only**, which is the condition that
  caught `src/index.html` missing on 2026-08-20.

No drift. Nothing stale.

## 2. The defect and the fix

One expression in the Roth ladder, **at L8881 — not L8885**, which is what both the build brief and
`SCOPE_FIX_tidyup_six.md` §1 record. L8885 is the `// MAGI (for IRMAA lookback)` comment. The record
should be corrected; a session that trusts the line number lands four lines past the target.

```js
if (provisional > _ssT2) taxableSS = Math.round(totalSS * 0.85);   // v5.41 and earlier
```

replaced by §86(a)(2)'s phase-in, with `para1` per §86(a)(1) and the 85%-of-benefits cap per
(a)(2)(B). The middle tier and the v5.15 filing-status threshold selection are **byte-identical** to
v5.41 — asserted, not assumed (t1 STRUCT S-3).

**Every figure in the brief's §4 table was reproduced exactly**, at all five slider positions, by
running `derive_v542.mjs` before touching code and then by reading the rendered DOM after. The
pre-fix column matched too, which is what proves the oracle's ladder transcription faithful rather
than coincidentally right.

## 3. ⚠ The brief's §3 premise was wrong, and what was done about it

The brief states the middle tier *"is correct and must not be touched"*, and §6 item 3 asks for it to
be pinned as correct. **It is not correct.** §86(a)(1) caps the includible amount at ½ of benefits;
the tab caps it at 85%:

```
app      Math.min((provisional - _ssT1) * 0.5, totalSS * 0.85)
statute  Math.min( ½(prov − base),             totalSS * 0.5 )
```

Swept rather than argued: **114,960 diverging cells joint, worst overstatement $2,468**
(at benefits ≈ $7,050); **64,620 cells single, worst $1,850**. It needs joint benefits under $12,000
(single under $9,000), because above that the overall 85% cap binds first. Direction is conservative,
which is why it survived. **It is $0 on the example household** — benefits are $15,600 then $55,200,
both outside the band — so no figure in §4 moves.

This is the same defect class as tidy-up item 4 (Engine B's omitted ½-benefits cap) **in a second
location that the tidy-up scope does not list.** Item 4 has a sibling.

**Judgement made, and why.** The release's actual premise — that the upper tier is a cliff and §86
phases in — was confirmed and is independent of this, so the build proceeded rather than halting.
But item 3's instruction could not be followed as written: pinning a defect as *correct* creates
exactly the lock §B2 warns about, a green assertion holding a wrong expression in place. So:

- the middle tier was **not touched**;
- its test was reframed from "pinned as correct" to **"pinned as unchanged by this release"**;
- a dated `[KNOWN DEFECT]` comment sits at the site, and `t24` §D pins the measured bounds;
- METHODOLOGY and the CHANGELOG both disclose it.

**Open decision for the maintainer:** fix it in v5.43 alongside Engine B's sibling, or leave it
pinned. It was not fixed here.

## 4. Tests

`t24_ss86_phasein.mjs`, new. **38 checks on v5.42, 34 on v5.41.**

The design point worth keeping: **the fix is invisible at the $70,000 default**, so assertions there
prove nothing. `t24` drives the conversion slider — through the native `HTMLInputElement` prototype
setter, because the control is a React controlled input and `.value` assignment is swallowed — to
$15,000 / $20,000 / $30,000 / $50,000 / $70,000, and checks all twelve ladder years at each against
`statute86`. Expectations are **computed, not hardcoded**. The $70,000 leg is included precisely
because it is the $0 case that made the defect look harmless.

`t1` gained STRUCT S-3 (117 → 121), gated per leg so frozen builds keep a `[KNOWN DEFECT]` pin
asserting the cliff.

**`t23` is unchanged and green at 25/25 on both legs** — only its version registry moved, no
assertion. That is the brief's own overreach test, and it passes.

### Negative controls — six run, five fired

| Control | Fired |
|---|---|
| C16 phase-in slope 0.85 → 0.50 | `t24` (10) |
| C17 the ½(adjbase − base) term dropped | `t24` (8) |
| C18 the overall 85% cap removed | `t24` (8) |
| C19 adjusted base shifted +$10,000 | `t24` (7) |
| C20 base amount hardcoded to the married literal (v5.15 reverted) | `t1` (1) |
| C21 `para1` capped at 85% instead of ½ | **`t1` only — not `t24`** |

**C21 was investigated, not adjusted** (§B2). It is a **behavioural no-op** on this household, not a
blind spot: `para1` enters as `min(para1, ½(adjbase − base))` = `min(para1, $6,000)`, so its
½-benefits cap can only matter when half the benefits are under $6,000 — the **same "benefits under
$12,000" condition as the middle-tier defect**. The example household cannot exercise it. It is
caught structurally by `t1`, and the reasoning is now asserted in `t24` as D-7 so a future change
that falsifies it fails a check instead of surviving in prose.

## 5. Direction — this release makes the plan look BETTER

Stated in the CHANGELOG rather than buried, per the brief's §5. MAGI, taxable income, tax, marginal
rate, bracket headroom and IRMAA risk all **fall** for affected households — up to **$38,030** of
MAGI in one year, and an IRMAA verdict can flip from triggered to not.

Users who already read their figures will see them drop. The framing is that **the earlier number was
wrong**, not that the new one is optimistic. The app was overstating taxable Social Security by up to
**5.3×**.

## 6. Two things found in the harness

**`controls.sh` was pinned at v5.38, as the brief predicted.** Re-pointed to `controls_v542.sh` —
and **all 13 v5.38-era patch anchors were verified to still resolve exactly once** against v5.42
source before the re-point, so the battery is live rather than nominally re-pointed. C16–C21 added.
The old file should be retired; leaving both invites someone running the dead one.

**`domdiff_withdrawal.mjs` was red, and not because of this release.** Its check that the *prior* leg
carries the pre-v5.40 IRMAA MAGI sentence was left pair-specific with an inline note to re-point it
that was never acted on. It has therefore been false for **every prior leg from v5.40 onward** and
would have gone red at this pair with no code change to explain it. Gated per leg — the same §B2 rule
that governs disclosure assertions, applied to a cross-build one. 31/1 → **32/0**.

The four baseline suites (`t3`–`t6`) died at the first run on the unregistered `v542` tag. That is
the fail-closed guard working, exactly as the brief warned; `t1` alone needed **five** nested ladders
plus the registry plus two gates.

## 7. Ship ritual

Full suite green with **counts parsed from suite output** by script, never restated · parity **9/9**
· METHODOLOGY updated (this changes modelling) · CHANGELOG with the §5 direction disclosure and
per-suite counts · `index.html` rebuilt via Vite from canonical source · `smoke_built` **16/16** ·
four version strings present exactly once, zero stale v5.41 in live copy.

⚠ **OPERATIONS §E still says parity must be 8/8.** The brief was right that the older briefs are
stale on this; §E is stale in the same way. The fingerprint carries nine keys and returned 9/9.
**§E needs the same one-line correction** — not done here, because OPERATIONS is only touched when
mechanics change and this is a documentation fix the maintainer should make deliberately.

## 8. D-2 — Engine C, unresolved by design

Engine C does not implement §86 at all (`ssTaxable = ssTot * 0.85`, flat, L4394). After this release
the Roth tab is **more correct than the engine it is normally reconciled to**, and the two
legitimately disagree by up to $46,920 below provisional ≈ $92,000. Engine C was **not** edited.

Documented in METHODOLOGY. It becomes blocking when the div/capgain release writes its
term-set-equality invariant, which must then be phrased as **term sets equal, values may differ**.

## 9. Left for the next session

- **The middle-tier §86 defect** (§3) — decision needed, then fix alongside Engine B's sibling.
- **OPERATIONS §E's stale 8/8** (§7).
- **The L8885 → L8881 correction** in `SCOPE_FIX_tidyup_six.md` §1.
- The other five tidy-up items, `div_y` / `capGain_y`, the §M hoist — all untouched, as scoped.
