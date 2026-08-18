# STATUS_v5_39_shipped.md — v5.39 ship record

**Release:** v5.39 · source `src/DangerClose.jsx` md5 **`7070018f2699503dfac4ca8e0e1b2feb`** ·
built `index.html` md5 **`0563e2f6db79c19b4729bec6e09a458a`** · prior v5.38 **`b8d12481b55cd2ed05c6c6f14e2f41d9`**
**Date:** 2026-08-18 · **Class:** documentation-only (no engine, constant, or modeling change)
**Governing scope:** `SCOPE_FIX_docs_v5_39.md` (decisions D-1…D-8 resolved by Steve, all as recommended)

---

## 1. Ship verification

| Check | Result |
|---|---|
| Tested source == shipped source | **identical** (`diff -q` clean; both `7070018f…`) |
| Build input == canonical | same file; `vite build` run from it |
| Built file version strings | 4 × `v5.39`, **0** × `v5.38` |
| Built-file smoke | **16/16** |
| MC parity v5.38 → v5.39 | **9/9, zero divergence** — the proof this is docs-only |
| Prior leg (v5.38) after suite edits | **440 baseline, 0 failed** — gating edits disturbed nothing |

## 2. Test totals — parsed from suite output, not restated

**v5.39 baseline:** t1 94 · t2 18 · t3 36 · t4 **228** · t5 58 · t6 21 = **455**
**Feature suites:** t7 41 · t8 38 · t9 14 · t10 163 · t11 40 · t12 23 · t13 42 · t14 44 · t15 11 ·
t16 24 · t17 74 · t18 67 · t19 65 · t20 100 · t21 50 · t22 85 = **881**
**Total: 1,336 checks.** t4 grew **+15** (213 → 228 on the prior leg's basis).

t22 was run as `node t22_aca_floor.mjs v538` — its committed default (`v532`) is unrolled and that
leg is not buildable from current knowledge. **This is unchanged from v5.38 and remains open.**

## 3. What shipped

Ten documentation corrections. F-11 (the over-escaped §13 callout that never rendered) and F-13
(the two-cell FAQ row) were live defects; F-19 (six undocumented skins, including all three
accessibility palettes) was the highest-value find. Full detail in the CHANGELOG entry.

Two edits touched **render copy outside `DOCS_HTML`**: the in-app Skins description (D-6b). Steve
approved this explicitly; it is still presentation-only and parity confirms it moved no figure.

## 4. New test coverage — and its negative control

t4 gained an **extinction assertion** that no attribute in the runtime manual carries a literal
backslash. This is the assertion that would have caught F-11 years ago and did not exist, because
every prior documentation assertion read *text* and the text was correct — only the markup was broken.

**Negative-controlled:** re-introducing the over-escaping fired **3** assertions (the extinction
check plus both callout-class counts); the control patch was then reverted and the source hash
confirmed back to `7070018f…` before the final run.

The remaining new assertions each pair a presence check with an extinction check, and the FAQ check
asserts **all 14 rows are uniform** rather than pinning the one row that was broken.

## 5. Errors made during this build — recorded per *report honestly*

1. **F-13 was omitted from the first edit pass.** It was in the scope's site census but absent from
   the apply script; caught only when writing its test assertion. Fixed before ship.
2. **A blanket version-gate transform corrupted a version-string mapping.** Extending every
   `VER === "v538"` gate to include v539 also rewrote t4's `_badge` ternary, so v5.39 asserted the
   badge read "v5.38". **t4 caught it.** All 25 insertions were then audited individually; the rest
   are genuine feature gates, correct for a feature-identical build.
3. **The first extinction assertion undercounted.** It matched `<div class="plain">` literally,
   missing the `<span class="plain" style=…>` in the Taxes entry, giving 8/7 instead of 10/9. The
   *assertion* was wrong, not the source; generalised to match the class on any element.
4. **Two scope figures were wrong.** Parity is **9/9**, not the 8/8 the scope stated (9/9 since the
   E-15 addendum). And the "version-bump tax" is far larger than scoped: not t1's registry and
   `verStr` chain, but version ladders in **six** suites plus ~25 feature gates.

## 6. Open items this release does not close

- **Small-screen defects are disclosed, not fixed** — F-2/F-8 (fixed-px tables overflowing a phone
  viewport), F-3 (26-tab strip, 7 rows at 380px), F-4 (3.88:1 contrast vs AA's 4.5:1). The new §13
  paragraph states this plainly. The mechanics release (`overflowX:auto` wrappers, `inputMode`)
  remains scoped-but-unbuilt.
- **The standing audit is still incomplete** — Section C's 2D break-even half and Section D's
  undisclosed-gap sweep are open, so the two-paragraph top-five summary stays deferred.
- **t22's prior leg** (`app_v532.mjs`) is still unbuildable from knowledge.
- **Version ladders remain manual** per release, in six suites. A registry helper would remove a
  recurring, error-prone tax — but that is a `qa/` change and needs its own scope.

## 7. Knowledge refresh owed

- `DangerClose-v5_39.jsx` in, `DangerClose-v5_37.jsx` out; **prior build rolls v5.37 → v5.38**
  (`b8d12481b55cd2ed05c6c6f14e2f41d9`).
- Manifest §A2 hash table **and** the *Prior build* table — roll both. That table was found stale
  this week (sixth instance); it is fixed in the amended manifest, so do not re-break it.
- Update the `UsabilityFlaws.md` manifest row: **F-10, F-11, F-12, F-13, F-14, F-15, F-17, F-18,
  F-19 closed at v5.39.** F-1…F-9 and F-16 remain open.
- `METHODOLOGY.md` is **not** updated — no modeling changed, per the project rule.
