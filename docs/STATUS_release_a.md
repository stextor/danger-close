# RELEASE (a) v5.22 — CLEAN PARTIAL. **NOT SHIPPABLE.**

**Built from:** v5.21 · `0c3cf58994326a5eda39f7ec46957f51` (hash-verified against the committed tree)
**Candidate source:** `v522.jsx` · md5 `aac6851f91860edc8341dd44a2c35424`
**Candidate built artifact:** `index_UNVERIFIED.html` · md5 `34450fb1513117c9b47c1584028e8d72`
**Date:** 2026-08-10

**Do not publish this.** One ship condition failed and three were not reached. §3 says exactly which.

---

## 1. The change — complete and verified

Consolidated the taxable residual (finding D-2D-2) into one module-level helper,
`taxableInitFromPositions(P = PORTFOLIO)`, sited beside `retireStartBalances` — deliberately **not**
inside it (constraint K1: that constructor applies `contribAccrual`, and no accrual flows to taxable).
The stale header comment that said "those reduces stay inline at their sites" was amended in the same
edit, since it became false the moment this shipped.

Verified after the edit, by parser:

| Check | Result |
|---|---|
| Source parses (acorn + JSX) | OK |
| Residual `reduce` expressions remaining | **1** — inside the helper only (was 7) |
| Helper occurrences | **8** = 1 definition + 7 call sites |
| K2: Roth funding gate keeps its `otherAccounts` term | intact |
| Version sites bumped | 4 |

The census was re-run against the working copy immediately before editing, per the scope's own
precondition. Seven sites, no eighth.

## 2. Suites — 757 green, of which **751 pre-existing returning identical figures**

Totals computed from parsed suite output, not hand-added:

```
baseline 382 (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115)
parity     8
feature  367 (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33 · t15 11 · t16 24 · t17 63 · t18 47)
TOTAL    757   = 751 pre-existing (identical) + 6 new t8 assertions
```

**Parity is 8/8 strict** (`t2 compare v521 v522`). No `INTENDED_DIFFS` entry — this release changes no
output, so needing one would have meant the change overreached.

### Negative controls — all recorded

| Control | Result |
|---|---|
| NC-1: re-inline ONE copy of the residual at Engine B | t8 fails **2 of 35** (extinction + count) |
| NC-2: flatten the K2 gate (drop its `otherAccounts` term) | t8 fails **1 of 35** |
| Restored | 35 / 0 |
| Version-guard: unregistered tag | **exit 1**, explicit message |

## 3. WHY THIS IS NOT SHIPPABLE

### 3a. FAILED — the built artifact is unverified

`smoke_built.mjs` reads `dist/index_classicscript_TESTONLY.html`, a test-only variant of the built
file. **The recipe that produces that variant is documented nowhere** — not in OPERATIONS, not in the
qa-baseline README, not in any knowledge document. Only the test's own `readFileSync` line names it.

I inferred it (rewrite the single `<script type="module" crossorigin>` to a classic `<script>`) and got
**10 passed, 3 failed**: the React app does not mount from the inlined bundle, so the version and
landing-screen checks fail behind it.

**That result is ambiguous and must not be read as either pass or fail.** Either my reconstruction of
the variant is wrong, or the artifact is genuinely broken. I cannot distinguish without the real recipe.
`smoke_built` exists precisely because a build once passed every source check while being unable to save
a plan — so this is the one check that must not be waved through. The artifact ships only when this is
16/16 by the documented method.

**This is itself a finding, and the same class as the v5.11 scaffold failure:** a session working from
knowledge cannot verify the built artifact, because the input to the verification is undocumented.
Whoever has the recipe should write it into OPERATIONS §N.

### 3b. NOT REACHED

- `CHANGELOG.md` entry + provenance line
- `TESTING.md` roll-forward (count 751 → 757, new t8 rows) **and** the stale line-54 parenthetical
- `VERIFY.sh` rolled forward, zip root
- Full suite from a clean tree built out of the packaged copies
- The zip
- Manifest rows for `qa/tools/` and the version-guard change
- The `p1` → `[KNOWN DEFECT]` pin (carry-forward item E)

## 4. What is in this folder

- `v522.jsx` — the candidate source, complete
- `qa/t1_units.mjs`, `t3_roth.mjs`, `t4_dom.mjs`, `t5_storage.mjs`, `t6_single.mjs` — version ladders
  rolled to v522 **plus the new registry guard**
- `qa/t8_invariant.mjs` — +6 consolidation assertions (29 → 35)
- `qa/tools/` — the four parser tools (carry-forward item D)
- `index_UNVERIFIED.html` — the built artifact, **failing its own smoke suite by an unproven method**

## 5. The version-guard fix (asked for, done)

An unregistered version tag used to evaluate every ladder false and fall off every ternary, silently
running the **oldest** branch — pre-v5.11 expectations, v5.10 version strings. Fail-open: a new build
got a *weaker* test. It also changed the check count — an unregistered tag ran t3 at **35 instead of
36**, and the count is the release headline.

Fixed in all five version-keyed suites with a `KNOWN_VERSIONS` registry that hard-exits on an unknown
tag. Adds zero assertions and changes zero figures for registered tags, so it is inert to the parity
proof. Negative-controlled.

Checked separately: **no ladder had already missed a roll-forward** — every ladder that should carry
v521 does. This never bit before; the exposure was prospective.

## 6. Honesty statement

Every figure above is parsed from suite output. The 757 total was computed, not restated. The source
edit was verified by AST after the fact, not assumed from the diff. Both new assertion groups were
proven able to fail before being counted as passing.

**One process failure to record:** the first attempt at the version guard emitted broken JavaScript into
all five suites — a Python f-string leaked a conditional expression into the generated code. It was
caught because the suites then produced no output at all. The five files were reverted to the canonical
knowledge copies, hash-verified against them, and redone. No damaged file reached this folder, but the
failure belongs in the record: generated edits need a syntax check before their results are trusted, and
the second attempt added one.
