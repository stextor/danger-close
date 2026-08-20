# STATUS — build reproducibility proven, suite re-measured, domdiff re-pointed, 2026-08-20

| Field | Value |
|---|---|
| Build worked against | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` |
| Prior build | v5.39 · `7070018f2699503dfac4ca8e0e1b2feb` |
| Source changed | **None.** Verified unchanged at session end against the hash it started from. |
| Changed | `qa/domdiff_withdrawal.mjs` only · `f31c743b…` → `1a4541b3407781138d38c9a93d2d64ec` |
| Version bump | **None.** No `src/` change, so no release; the CHANGELOG entry is `Unreleased`. |
| Result | App **1,350 / 0 across 22 suites**, parity **9/9** · `domdiff` 28/1 → **32/0** · built-artifact smoke **16/16** |

---

## 1. The build reproduces from knowledge alone — tested for the first time

The scaffold was taken **from the pool**, not from a repo clone, because the claim under test is that
project knowledge alone is sufficient. `src/index.html` had been missing from the pool until earlier the
same day, so OPERATIONS §G's four-file claim had stood asserted for eleven releases and never
demonstrated.

- Toolchain resolved **identical to the recorded tree** — vite 5.4.21, @vitejs/plugin-react 4.7.0,
  vite-plugin-singlefile 2.3.3, rollup 4.62.4, react/react-dom 18.3.1, node 22.22.2, jsdom 30.0.1 —
  which is the precondition §N3a sets for a hash comparison to mean anything.
- `npx vite build` → `dist/index.html` md5 **`17867edb9af4c5e7e3542aeade594f24`**, **byte-identical to
  the published v5.40 artifact.**
- `qa/smoke_built.mjs`: **16 passed, 0 failed, exit 0** — including *disclaimer gate rendered on first
  open* and *gate dismisses after acknowledgement*, the two checks that make the restored template
  meaningful rather than merely present.

Per §N3a the binding check is the smoke suite, not the hash; the hash is provenance. Both are recorded
because the interesting result here is that a knowledge-only scaffold produced a bit-identical artifact
on the immediately-current release, which is the §N3a criterion for "the scaffold is complete."

## 2. Suite re-measured, not inferred

Totals parsed from captured output by `runsuite.sh`, never restated:

| Leg | Passed | Failed | Suites |
|---|---|---|---|
| Prior (v5.39) | 618 | 0 | 7 |
| Current (v5.40) | 632 | 0 | 7 |
| Parity | 9 | 0 | 1 |
| Feature suites | 668 | 0 | 14 |
| **App total** | **1,927** | **0** | **29** |
| Tooling (`t21`, `domdiff`) | 82 | 0 | 2 |

Reconciled suite-by-suite against the recorded 22-suite convention (current leg + parity + features +
`t21`): **all 22 counts match exactly, sum 1,350.** The 1,927 figure counts the prior leg's 618
separately; it is the same run under a wider convention, not a different result. No suite drifted, and
no suite DIED.

## 3. The domdiff failure was not a regression — and it hid an older defect

The first run failed one check: IRMAA figures-identity. v5.40 deliberately rewrote the IRMAA MAGI
sentence (its S-1 disclosure fix), and that sentence sat inside the asserted region. The prior session
had already diagnosed this correctly and left the fix to whoever next opened the file.

**What re-running it exposed is a second, older defect: an asymmetry between the two figures-only
regions, latent since v5.36.** Both are meant to be anchored past every piece of changed copy. Measured:

| Region | Anchors | Length | Composition |
|---|---|---|---|
| Taxes | `Eff RateBracket` → `Estimates only` | 1,739 | ends on the last figure; footnote outside |
| IRMAA | `Tax YrAffectsMAGI` → `Not tax advice` | 1,972 | trailing **~1,070 chars are prose** |

So the Taxes anchor was always right and the IRMAA one never was — it stopped *after* the footnote
instead of *before* it, making a check whose name says FIGURES hostage to any disclosure edit. The
release that finally edited that disclosure is what surfaced it.

**Fix:** the end anchor moves to the first prose token, `"Affects" = the calendar year` — verified
**unique on both legs** — giving a **913-character region that is the year table and nothing else**,
byte-identical across the pair. The divergence had sat at offset **1,734 of 1,972**, so every figure
ahead of it already matched. That measurement is the evidence for "no figure moved."

**Staleness fixed in the same edit.** The file was three releases stale, still defaulting to
v5.36 → v5.37 through v5.38, v5.39 and v5.40, against its own "re-point every release" instruction. Its
header and code also disagreed — comment `v536 -> v537`, code `v537 -> v538` — so neither could be
trusted without running it. Both now read v539 → v540, and the header records that they roll together.

**Three checks added** so the v5.40 copy change is witnessed explicitly rather than incidentally, since
excluding it from the identity region would otherwise leave nothing asserting it at the DOM layer. Gated
per leg per §B2 so the frozen v5.39 leg keeps replaying green. They are pair-specific and the file says
so in place.

## 4. Both negative controls were run (§B2)

A green instrument proves nothing about what it would catch, and the point of shrinking a region is
precisely to ask whether it still catches anything.

| Control | Expected | Observed |
|---|---|---|
| Engine C's sole call site neutered (AST-resolved: definition L4272, call L9719) | tightened identity check fails | **FIRED** — headroom figures move $138K → $139K and $138K → $137K |
| Pre-v5.40 MAGI sentence restored on the v5.40 leg | the two v5.40-side copy checks fail, figures stay green | **FIRED** — exactly 2 failed, figures check green |

The second control is the one that demonstrates the fix worked as intended: copy and figures are now
cleanly separated, where before a copy edit failed a figures check.

Sources were restored from a pre-control snapshot and **hash-verified** (`v540.jsx`, `DangerClose.jsx`
both `6b7cebb1…`; `v539.jsx` `7070018f…`) before the final suite run, so no reported figure comes from a
perturbed tree.

## 5. Files changed

| File | Change |
|---|---|
| `qa/domdiff_withdrawal.mjs` | Default pair → v539/v540; self-contradicting header line fixed; IRMAA end anchor moved before the prose; three per-leg copy witnesses added; three assertion labels re-pointed; a v5.40 re-scope block recording the measurement |
| `CHANGELOG.md` | New `Unreleased` entry (newest first), closing the item the entry below it left open |
| `TESTING.md` | Running count carries `domdiff` 28/1 → 32/0; the re-point and the build-reproducibility result recorded |
| `PROJECT_KNOWLEDGE_INDEX.md` | `domdiff_withdrawal.mjs` hash row rolled to `1a4541b3…` |

## 6. Disclosed limitations, and what was NOT done

- **`qa/controls.sh` is still the v5.38 edition** and hardcodes `SRC=v538.jsx` — a source that rotated
  out of knowledge at v5.40 — so it cannot execute against the current pair. Both controls above were
  therefore run **by hand**. **Left stale by maintainer decision (2026-08-20):** re-point it in whichever
  session next needs controls, and re-verify each patch fires against v5.40 rather than v5.38.

- **⚠ A CORRECTION TO THIS DOCUMENT'S OWN FIRST DRAFT.** It reported the two instruments together as
  "the second per-release instrument found stale by neglect," which was accurate about the neglect and
  **wrong about the risk**, because it grouped a silent failure with a loud one. Checked afterwards
  rather than assumed:

  | Instrument | Run by `runsuite.sh`? | Failure mode |
  |---|---|---|
  | `domdiff_withdrawal.mjs` | **Yes, every run** — with the pair passed explicitly (line 49) | **Silent.** The explicit args mean the hardcoded default is never exercised, so the v5.34 "stale default dies loudly at module load" protection is switched off by the runner. What rotted was the *assertions*: three releases of v5.37-era claims run against whatever pair was handed in, returning 28 green checks nobody had confirmed were true of that pair |
  | `controls.sh` | **No — not invoked by it at all** | **Loud.** Hardcoded source, no override, run by hand at a build. Fails immediately at point of use; costs a session's time, never a false green |

  So the dangerous instrument is the one that was fixed, and the risk was never symmetric. A "pattern"
  claim that lumps them together reads as more alarming than the evidence supports, which is its own
  kind of inaccuracy in a document meant to be trusted later.

- **The structural option was considered and declined.** Converting each instrument's "re-point every
  release" rule into a suite assertion would be a **tripwire, not a proof** — `runsuite.sh` overrides
  the default anyway, so the check would force a human to open the file rather than verify the
  assertions match the pair — and it would add a hand-service site every release, the same per-release
  cost the v5.40 entry already flags for the MAGI term set. Declined on that trade, with the reasoning
  recorded here so a future session inherits the argument rather than re-deriving it.
- **No `src/` change, no version bump, no new app checks.** The app total is unchanged at 1,350.
- **Nothing was re-verified that this session did not itself run.** The v5.40 built md5 and the suite
  counts above are measured here; figures quoted from earlier sessions are labelled as theirs.
