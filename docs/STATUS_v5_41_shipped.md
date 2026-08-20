# STATUS — v5.41 build, 2026-08-20

| Field | Value |
|---|---|
| Version | **v5.41** (from v5.40) |
| `src/DangerClose.jsx` | md5 **`18152190e9b699529642ae2983b3ae2c`** |
| Built `index.html` | md5 **`74355c8b66d5024b99fcc6fb19f100cb`** |
| Prior build | v5.40 `6b7cebb1476ee66e57079b713b94ba75` / `17867edb9af4c5e7e3542aeade594f24` |
| Suite | **1,332 checks, 0 failed** · parity **9/9 identical** · `smoke_built` **16/16** |
| Negative controls | **9 of 9 fired** |
| Built from | `BUILD_BRIEF_v5_41_rmd_term.md`, with two corrections to its figures (§2) |

---

## 1. Freshness check (OPERATIONS §A / §A2)

Clean. All eight hashes the brief listed matched exactly. The §A2 clone-and-diff was run **in both
directions**: 79 pool files matched the committed tree, every repo-only file fell into a known
category (history docs, superseded `dom_entry_*`, retired probes, `validation/`, the eight new
`qa/tools/*.mjs`), and **no build input was repo-only**. Zero test or harness files had drifted.

**One staleness finding.** Pool `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` (`87c9a7e7…`) is **revision 1** —
"SCOPED, NOT BUILDABLE YET, three decisions open." The committed copy (`281d9ca0…`) is revision 2,
measured and resolved. The build used the repo copy. **This is the sixth recorded stale block**; the
pool copy needs replacing at the refresh.

## 2. Two corrections to the brief's expected figures

The brief said its figures were derived in advance and that the code should be checked against them.
Both defects below are in the figures, and both were found before any code was written.

### 2a. The targets carried $420 of an out-of-scope term

`qa/tools/derive_rmd_expectations.mjs` computes `nonSS = pen + conv + rmd + div`, where
`div = 21,000 × 2% = $420`. **`census.cjs` finds zero `div_y` hits inside `<anon>@8719`** — every
site is in `runRothStrategies@3683` or `computeIrmaaPlan@4272` — and both the scope §7 and the brief
§8 place dividends out of scope. The brief's own table is therefore self-contradictory: it holds
non-RMD years at $121,720 (no dividend) while quoting tail years that include it.

MAGI-today of **$121,720** was confirmed against the running app, not the documents: the rendered
ladder reads $108K / $106K / $137K / $122K for 2029 / 2030 / 2031 / 2032+, and
`pension 4,800 + spouseBWorkTaper + taxableSS 46,920 + conv 70,000` reproduces all four exactly.

### 2b. The derivation did not gate conversions by each spouse's ladder window

The derivation script allocates each year's conversion pro-rata across both spouses in every year.
The shipped `_perRmd` gates on `r.year <= endA`, and scope §1(b) calls that gating *"the exact split
the fix needs."* Since `rothLadderEndA` is 2038, the two rules diverge exactly in the tail.

**Resolved as D-5 = gated**, per the recommendation put to the maintainer and confirmed. Gated
matches the tab's existing per-person semantics, gives `rothLadderEndA/B` meaning, is the split D-2's
unification is built on, and is the conservative branch — the same reasoning that settled D-1.

### Corrected figures, which the code now hits

| Year | RMD | MAGI, this release | Brief said | Why it differed |
|---|---|---|---|---|
| 2031–2038 | $0 | **$121,720 unchanged** | $121,720 | — |
| **2039** | **$44,991** | **$166,711** | $167,131 | −$420 out-of-scope dividend |
| **2040** | **$46,902** | **$168,622** | $166,550 | −$420 dividend, +$2,492 gating (D-5) |

The two branches are distinguishable on screen: ungated renders $167K in 2040, gated renders $169K.
The rendered ladder reads **$169K**.

## 3. Verification

| | |
|---|---|
| t1 / t2 / t3 / t4 / t5 / t6 / t10 | 115 · 18 · 36 · 228 · 58 · 21 · 163 |
| t7–t20, t22 | 41 · 38 · 14 · 40 · 23 · 42 · 44 · 11 · 24 · 74 · 67 · 65 · 100 · 85 |
| **t23 (new)** | **25** |
| **App total** | **1,332 passed, 0 failed** (t21 tooling 50, never counted) |
| Parity v540 → v541 | **9/9, every fingerprint byte-identical** — no engine was reached |
| `smoke_built` | **16/16** against the built artifact |
| Version strings | 4 present, **0 stale v5.40**, in both source and build |

**Parity is 9 keys, not the brief's 8.** The fingerprint carries `mc, extMC, stress, roth,
rothCurrentEstate, rothAca, ssTable, stateTax, inflation`. The brief's "8/8" is a stale expectation,
not a break — v539 → v540 also reports 9/9.

`t23` is gated per leg: **v541 25 checks, v540 21 checks**, the v540 leg asserting the pre-fix
figures deliberately. The two legs together are the before/after witness.

### Negative controls — 9 of 9 fired

| # | Perturbation | Caught by |
|---|---|---|
| 1 | remove `rmd_y` from `magi` | t1 STRUCT S-2 |
| 2 | divide the grown balance (basis error) | t1 STRUCT S-2 |
| 3 | remove `rmd_y` from the §86 base | t1 STRUCT S-2 |
| 4 | remove `rmd_y` from `grossTaxable` | t1 STRUCT S-2 |
| 5 | reinstate the convert-then-grow replay | t1 STRUCT S-2 (2 checks) |
| 6 | divide the grown balance | t23 A-2, B-3 |
| 7 | drop `rmd_y` from `magi` only | t23 A-2 (4 checks) |
| 8 | RMD does not leave the account | t23 A-2 |
| 9 | RMD age 73 instead of 75 | t23 A-1, A-2 (6 checks) |

Control 6 is the instructive one: the basis error yields $169K / $171K — plausible figures nothing
throws on — and only the card-versus-ladder cross-check catches the internal disagreement.

**Reproducing them.** The controls were run through a scratch version tag (`v541nc`) registered
temporarily in `t1` and `t23`. **That tag was removed before shipping** — it is not in the delivered
suites, and its removal changed no count (t1 stayed 115 / 110 / 94, t23 stayed 25 / 21, confirming it
was inert). To re-run: copy `src/DangerClose.jsx` to `v541nc.jsx`, add `"v541nc"` to `KNOWN_VERSIONS`
in both suites and to their `POST_FIX` / `V541` predicates, build with
`./qa/mk_testable.sh v541nc` plus an esbuild bundle for the DOM leg, then perturb and run. Nothing
in the shipped tree depends on this.

## 4. Precision ceiling, stated per OPERATIONS §M

The ladder is a **component-inline engine**: computed inside the component body, no module-level
binding, so `shim.txt` cannot reach its row array and its only output path is the rendered DOM.

- MAGI and the balance column render as `Math.round(x / 1000)` → **±$500 ceiling**. The effect
  measured is ~$45,000, about ninety times the ceiling, so the finding does not rest on the missing
  precision.
- The RMD cards render `toLocaleString()` — **full dollars** — so the distribution, its Pub. 590-B
  basis and the recursion unification **are** pinned to the dollar. Spouse A's with-conversion RMD is
  asserted at exactly **$44,991**.

**The brief's Definition of Done asked for dollar-exact tail-year MAGI assertions. That is not
achievable in this release** without hoisting the block to module level, and §M requires hoist and
export to be separate releases. Recorded rather than approximated and called done.

## 5. Findings for the next scope

1. **`_perRmd` seeds from `tradInitB`, not `rmdInitB`** — fabricating a required distribution on
   $7,000 of annuity money on the example household, the exact defect the v5.26 comment in
   `retireStartBalances` says the RMD/trad split exists to remove. `annShareA` is 0, so the tail-year
   figures are unaffected. Conservative in direction. Left alone under D-4 and flagged.
2. **`_perRmd`'s `noConv` counterfactual** grows the seed balance 13 years from `asOfYear` to reach a
   2039 distribution, i.e. to a 2042 balance. Same basis class as the defect just fixed, on the other
   side of the card. Deliberately untouched.
3. **`t8`'s call-site check is a text regex** (`/retireStartBalances\(/g`) and counts comments. A
   comment written during this build mentioning `retireStartBalances()` turned the check red with no
   code change. OPERATIONS §B1 says site counts go through AST tools, never greps; `t8` is doing the
   thing §B1 forbids. The comment was reworded rather than the test changed, so `t8` is untouched and
   still fragile.
4. **Ladder suites resolve `../DangerClose.jsx` by that exact name** (`t8`, `t14`, `t16`, `t19`) while
   the baseline suites take a version tag. A flat run folder needs both the tagged file and a copy at
   the canonical name, which the qa-baseline README does not currently say.

## 6. Knowledge refresh — what still has to happen

Not done in this session; the release is verified but the pool is not yet rolled.

- Roll the manifest: current **v5.41** `18152190…` / built `74355c8b…`; prior **v5.40** `6b7cebb1…` /
  `17867edb…`. Rotate the `.jsx` pair to exactly two.
- Replace the stale `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` rev 1 in the pool with rev 2.
- Add manifest rows for the eight `qa/tools/*.mjs` files, plus the new `qa/t23_roth_ladder_rmd.mjs`
  and `qa/qa-baseline/dom_entry_v541.jsx`.
- Correct `qa/tools/derive_rmd_expectations.mjs` to drop the `div` term and to gate the allocation,
  so the tool and the shipped assertions cannot disagree again. **Left uncorrected on purpose** — it
  is the artifact the discrepancy was found in, and changing it in the same session that found it
  would erase the evidence.

## 7. Files

Determined by diffing the working suite against the committed tree, not from memory of what was
edited — that diff caught `t10_taxcases.mjs` staged while byte-identical to the repo, now removed.

| Path | Change | md5 |
|---|---|---|
| `src/DangerClose.jsx` | modified | `18152190e9b699529642ae2983b3ae2c` |
| `index.html` (built) | rebuilt | `74355c8b66d5024b99fcc6fb19f100cb` |
| `qa/t23_roth_ladder_rmd.mjs` | **new** | — |
| `qa/qa-baseline/dom_entry_v541.jsx` | **new** | — |
| `qa/qa-baseline/t1_units.mjs` | modified — STRUCT S-2 + v541 registration | — |
| `qa/qa-baseline/t3_roth.mjs` | modified — v541 registration only | — |
| `qa/qa-baseline/t4_dom.mjs` | modified — v541 registration only | — |
| `qa/qa-baseline/t5_storage.mjs` | modified — v541 registration only | — |
| `qa/qa-baseline/t6_single.mjs` | modified — v541 registration only | — |

`CHANGELOG_v5_41_entry.md` and `METHODOLOGY_v5_41_insert.md` are written as **inserts, not rewritten
files**, so the diff is reviewable rather than a regenerated document to be trusted wholesale. Both
name their insertion point.

Shipped `.jsx` == canonical == build input, hash-verified. The built artifact is byte-identical to a
build made before the §5.3 comment reword, since minification drops comments — which is itself a
check that the reword changed no behaviour.
