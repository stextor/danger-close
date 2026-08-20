# STATUS — the structural S-1 assertion, built 2026-08-20

| Field | Value |
|---|---|
| Scope | `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` — now marked **BUILT** |
| Build worked against | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` |
| Committed tree at session start | **`027fbd2`** (parent `ffb8bd3`, the tree the scope names) |
| Changed | `qa/qa-baseline/t1_units.mjs` only · `768e9fe2…` → `5d205a18b18af683f4f7c71f824ee8ac` |
| Result | **1,350 passed, 0 failed across 22 suites** · parity **9/9** · t1 102 → **108** |
| Version bump | **None.** No `src/` change, so no release; the CHANGELOG entry is `Unreleased` |
| Complete? | **Yes, to standard.** Two items are reported below, neither in scope |

---

## 1. Freshness check (OPERATIONS §A / §A2) — clean

Clone-and-diff against the committed tree, preferred over the recorded hash table.

- `src/DangerClose.jsx` in the pool, in the clone, and in the manifest all hash
  `6b7cebb1476ee66e57079b713b94ba75`. Manifest version v5.40 agrees with the CHANGELOG's newest entry.
- Pool-vs-clone content sweep: **76 of 78 files matching**. The two exceptions are the ones the scope
  predicted — the retained prior source `DangerClose-v5_39.jsx` and `README-FIRST.md`. No drift.
- The uploaded scope is byte-identical to the pool copy and to `docs/SCOPE_STRUCTURAL_MAGI_EXTINCTION.md`
  in the clone (`df8c0295fb444e80fa78d5d596b9813c`).

⚠ **HEAD had moved since the scope was written, and it is worth saying why it did not matter.** The
scope names tree `ffb8bd3`; HEAD is now `027fbd2`. The diff between them is **one file added:
`docs/SCOPE_STRUCTURAL_MAGI_EXTINCTION.md`** — the scope committing itself. No source, suite, or harness
file differs. Checked rather than assumed, because "the tree moved" and "the build I am working against
moved" are not the same claim.

## 2. Premise re-verified independently, not carried

Every §2 claim was re-resolved by AST against `v540.jsx` in the run folder before a line was applied.

| Claim | Verified |
|---|---|
| Engine C's `magi` sums exactly 7 terms | ✅ `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| `magi` declarator at L4399 | ✅ |
| Four `magi` declarators, two labelled for IRMAA | ✅ L4033 (2 terms) · L4399 (7) · L4860 (9) · L8847 (4) |
| The S-1 sentence is at L9800 | ✅ |
| `AUDIT_TOP_FIVE_SUMMARY.md` cites L9792, which is a bare `</div>` | ✅ confirmed stale-by-8, still unfixed (out of scope, §8) |
| `computeIrmaaPlan` at L4271 | ❌ **L4272.** L4271 is the last line of the preceding comment block |

**The L4272 correction is mine to own.** It is off by one and non-substantive — the checks resolve by
enclosing function and never by line number, so nothing built on it — but the scope records exactly this
class of error against another file in its own §2b, and it would be inconsistent to fix that citation
loudly and this one silently. Corrected in the scope doc.

## 3. What was applied

Six checks, inserted as a **single 48-line block** inside t1's existing `if (V540)`, immediately after
the four v5.40 source-text S-1 checks. A diff of the shipped file against the committed one shows that
insertion and **no other change** — 48 added lines, 0 removed, 0 modified.

- No new version tag, so `KNOWN_VERSIONS` is untouched.
- The v5.39 leg runs **94, unchanged**, which is the version gate holding.
- One refinement carried from the scope's execution: the term-set comparison is **order-insensitive**.

## 4. Negative controls — re-run at build, not carried

Run against reverted copies of `v540.jsx`, rebuilt each time, source restored and hash-confirmed after.

| # | Revert | Expected | Observed |
|---|---|---|---|
| NC1 | 8th term (`+ dummy_y`) on Engine C's `magi` | fail | **2 fail** ✅ |
| NC2 | remove `div_y` | fail | **3 fail** ✅ |
| NC3 | reorder two terms | **pass** | **0 fail** ✅ |
| NC4 | strip *"including dividends and realized capital gains"* | fail | **4 fail** ⚠ see below |
| NC5 | rename `work_y` → `earned_y` | fail | **1 fail** ✅ |

⚠ **NC4 is the one row that needs a word.** The scope's table records 2; the whole suite reports 4. Both
are right under different readings: the two new STRUCT checks fail, *and* so do two of v5.40's existing
source-text checks (`names dividends`, `names realized capital gains`), which the same revert also
breaks. The scope was counting failures **among the six new checks**; every other row has no overlap, so
the readings coincide there and diverge only at NC4. **Stronger coverage than the row claimed, not
weaker** — but the row was ambiguous, and it is now disambiguated in the scope doc rather than left to
be rediscovered.

## 5. Totals — computed from captured output

Both legs plus parity, run **before and after** the edit, on the same run folder.

```
v5.40 leg   t1 108 · t2 18 · t3 36 · t4 228 · t5 58 · t6 21 · t10 163        = 632
feature     t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42 · t14 44
            t15 11 · t16 24 · t17 74 · t18 67 · t19 65 · t20 100 · t22 85    = 668
tooling     t21 50                                                            =  50
                                                        APP TOTAL, 22 suites = 1,350
```

Parity **9/9** across the v5.39 → v5.40 boundary. The v5.39 leg totals 618, unchanged.

**A suite-by-suite diff of the two runs shows exactly one line moved:** `t1-v540`, 102 → 108. The
pre-edit run reproduced the shipped v5.40 headline of **1,344** exactly, which is what makes the +6
delta trustworthy rather than merely plausible.

## 6. Reported, not fixed — `domdiff_withdrawal.mjs` has been red since v5.40 shipped

Found by the pre-edit baseline run, so it is **pre-existing and not caused by this work**. It is
cross-version tooling, counted in no release headline, and outside this scope — but it is red, and it
was red at the v5.40 ship without disclosure.

**What it is.** The instrument's IRMAA check asserts strict identity of a region anchored from
`Tax YrAffectsMAGI` to `Not tax advice`. v5.40's corrected S-1 sentence lives **inside** that region, so
the instrument fails on the release's own intended prose change.

**Measured, not assumed.** A probe excising the S-1 sentence from both legs and re-comparing returns the
regions **byte-identical** (1,972 chars on v5.39, 2,069 on v5.40; identical once the sentence is
excised). **No figure moved.** The divergence is entirely prose.

**Why it should not be left.** This instrument was re-scoped for exactly this situation at v5.24 and
again at v5.36 — excise-by-anchor, with the excision itself asserted to have changed, so an excision
cannot hide a no-op. It was not re-scoped at v5.40. The manifest's own note on it says *"re-point it
every release"*; three releases have passed since it was last re-pointed. A permanently-red instrument
stops being read, which is the failure mode worth avoiding.

**Recommendation:** re-scope it (excise the S-1 sentence by anchor, assert the excised span differs) in
whichever release next opens it. It does not warrant a release of its own.

## 7. Open for the maintainer

**D4 — still yours, still unrecommended.** The app shows two MAGI figures under one IRMAA label with no
cue that they are computed differently. Disclose now, or wait until L8847 is measured. No recommendation
is offered, for the reason the scope gives: it is a product-voice call about the app's contract with its
user, not a technical one. Disclosing would be a `src/` change and a different scope with a version bump.

**§6 of the scope — L8847 remains a thing to measure, not a finding.** Untouched, deliberately. No
arithmetic has been run against it.

**`TESTING.md` now understates the suite, and I did not edit it.** Its headline reads *"App total 1,344
across 22 suites"* and `t1` *"+94 → 102"*; the committed suite now runs 1,350 and 108. Editing it was not
in scope, and a non-release edit would make it describe a build state that has not shipped — but leaving
it is the drift class this project bleeds from. **Recommendation: roll those two figures when the next
release rolls `TESTING.md` anyway**, rather than now. Say the word if you would rather have it now.

**`AUDIT_TOP_FIVE_SUMMARY.md` row 1 still cites L9792 for S-1**; the sentence is at L9800. Out of scope
per §8, re-confirmed here so the next reader does not rediscover it.
