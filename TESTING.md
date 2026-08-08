# How Danger Close Is Tested

This project's premise is *verify, don't trust* — so this page explains what verification actually exists, what it covers, and what it doesn't. It's written for the same skeptical reader the app is.

**Current build: v5.11** · source `src/DangerClose.jsx` md5 `f645a3967c687960bb03227b5ce5bfec` · **381 automated checks green** against that exact source.

## The part you can check yourself, right now

Open the app → **Verify tab**. Every statutory constant the math depends on — federal brackets, deductions, LTCG thresholds and NIIT, IRMAA tiers, RMD divisors, the QCD cap, 402(g) contribution limits, the SS wage base, state-module facts, the longevity engine, and the ACA premium-subsidy tables — is re-checked **live in your browser on every visit** against its cited primary source (IRS Rev. Proc. 2025-32 and 2025-25, Rev. Proc. 2021-36, CMS, SSA, HHS/ASPE, IRS Pub. 590-B). Currently **54 checks**, each showing ✓/✗ and its citation. A tampered, corrupted, or stale copy fails loudly. This is the user-facing guarantee, and it requires trusting nobody: the checks and their expected values are visible in the page source.

Honest scope: the Verify tab proves the *constants* are right — not every formula that uses them. That's what the development suite below is for.

## The development test suite

**The suite is published in this repo** — `qa/qa-baseline/` (the t1–t6 regression baseline and its harness) and `qa/` (the t7–t9 feature suites). It runs in full before any release, and can be re-run from a clean clone; `qa/qa-baseline/README.md` has the setup steps. This was not always true: the original suite lived only in build-session sandboxes and was lost, which is why v5.10 rebuilt it as repo files.

The suite compares **two builds by role** — the current release and the immediately-prior one — and re-baselines every release. For v5.11 that pair is v5.10.2 → v5.11.

### Current build (v5.11) — 267 checks in the t1–t6 baseline

| Suite | Checks | What it covers |
|---|---|---|
| t1 units & statics | 64 | Pure functions and source invariants against hand-derived values: tax math, SS taxability, RMD divisors, state rules, parsing, the ACA machinery, plus a headless run of the in-app Verify checks and assertions that the version string is bumped at all four in-app sites — as of v5.10.2 all four are asserted exactly (footer, DATA LOAD header, Field Manual callsign, Field Manual footer) |
| t2 engines | 15 | Monte Carlo statistical properties, extended-MC longevity/LTC machinery, stress scenarios, Roth engine invariants, each reduced to a seeded fingerprint |
| t3 Roth | 36 | The conversion engine against hand-computed dollar figures, using explicit hand-built inputs rather than the demo household: bracket fills, IRMAA caps, funding-model gross-ups, widow transitions, and the ACA bridge cases |
| t4 DOM | 90 | The real component mounted in jsdom: all 26 tabs clicked and asserted for signature content, no NaN/undefined anywhere, Simple Mode round-trip, unsaved-edits guard. Signature strings were grounded against a captured DOM, not guessed |
| t5 persistence | 44 | The full storage lifecycle against the same `window.storage` contract the standalone build installs: fresh boot → landing, save → persisted, remount → reopens, backup export/import round-trip, and that a backup never contains the API key. As of v5.10.2, Clear All Data is tested against a fully-seeded store and asserted by **looping the `STORAGE_KEYS` map itself** — every key, including any added in a future release, must be absent after the wipe, and the seeded third-party contact PII must be gone from all surviving storage |
| t6 single-filer | 18 | Storage seeded with a single-filer plan *before* mount, so the app boots into the branch the couple-centric demo never exercises |

### Cross-version and feature suites — 86 checks

| Suite | Checks | What it covers |
|---|---|---|
| t2 parity (v5.10.1 → v5.10.2) | 8 | Under common seeded random numbers with identical inputs, the Monte Carlo, extended MC, stress, and Roth engines produce **byte-identical** output across the two builds. This is the mechanical form of any "engines unchanged" claim |
| t7 accrual | 37 | The v5.10 contribution-accrual feature against hand-computed figures ($96,000 / $24,000 / $72,000 for the couple case), migration parity, and round-trip persistence. Authored *before* the engine edits |
| t8 invariants | 29 | Extinction invariants (fixed defect classes asserted not to return), Verify-tab constants, and engine behavior. At v5.11 the two source invariants that asserted the old pooled Traditional seed in the Taxes and IRMAA engines were updated to assert the per-person split explicitly — a strictly stronger check |
| t9 DOM smoke | 14 | End-to-end render smoke over the feature surface |

**Two honesty notes on t11.** First, *precision*: the Taxes and IRMAA engines are computed inside the app's component body, so the harness — which exports module-level bindings — cannot reach their row arrays. Their only output path is the rendered DOM, which prints every figure rounded to the nearest $1,000. t11's assertions are therefore accurate to **±$500, not to the dollar**. That is adequate here only because the effect being measured (~$4,050/yr per $1M of Traditional balance) is roughly eight times the measurement band. Making these engines dollar-exact testable requires a new harness capability and is scoped separately. Second, *teeth*: a test that cannot fail proves nothing, so t11 was run as a **negative control against the pre-fix v5.10.2 build and correctly failed its five discriminating assertions** in both directions. Its two cross-checks pass on the defective build as well and are recorded in the suite as supporting context rather than proof.
| t11 survivor RMD | 26 | The v5.11 extinction invariant for audit finding C-2C-3: survivor-year RMDs must follow the **survivor's** age, not the deceased spouse's. Asserted in **both** direction configurations (Person A older, and Person A younger), because the defect's sign flips with the age order and a one-directional test would have passed against it in the other sign. Includes IRS Uniform Lifetime divisor and SECURE 2.0 start-age grounding read from the engine's own helpers. **Precision: ±$500** (see the note below) |

**353 checks verify this build** = 267 (current leg) + 8 (parity) + 78 (t7–t9). The prior legs are re-proven at every run as history: v5.10.1 254 checks, v5.10 252 (both up from their published 248/246 because the suite itself grew at v5.10.2 — two new version-site assertions in t1 and, in t5, the all-keys seed check plus three dated pre-fix pins for the B-2 wipe defect). Frozen legs are expected to show since-fixed defects in their pre-fix state — that's correct, not a regression. The v5.9.2 leg (234) is retired history at its git tag.

### How known defects are tracked

When a bug is found but not yet fixed, it gets a dated `[KNOWN DEFECT]` test asserting *today's wrong behavior*, so the defect stays visible and "green" describes reality rather than hiding it. Fixing it means changing the code and flipping the pin to a positive assertion — the fix is then self-verifying.

Three pins were opened at the v5.10 baseline rebuild and **flipped at v5.10.1** (the ACA cliff solver's own funding sale, Clear All Data not wiping the API key, and a phantom Spouse B on the SS tab for single filers). The current leg now asserts the fixed behavior; the frozen prior legs keep the dated pins as pre-fix history. A fourth defect class was pinned and fixed in the same release at **v5.10.2** (audit Finding B-2): `clearStorage()` deleted only 10 of the 13 storage keys, leaving the checklist's third-party contacts, the Simple-Mode flag, and the SS-cut scenario in browser storage after "delete everything." The current leg asserts the full wipe via the loop invariant; frozen legs carry the dated pre-fix pins.

## Hand-verified ACA figures — check these with a calculator

These test cases were derived by hand from the primary sources and asserted to the dollar. Every row below was **re-verified against the v5.10.2 engine** for this release (byte-identical engine parity with v5.10.1 at 8/8; the v5.10.2 diff touches no engine). Sources: IRS Rev. Proc. 2025-25 (applicable percentages), HHS/ASPE poverty guidelines (2025: $15,650 + $5,500/person; 2026: $15,960 + $5,680/person), Rev. Proc. 2021-36 (ARPA table for the "enhanced" scenario).

| Case (single filer, 2026 coverage, $1,500/mo benchmark = $18,000/yr) | Value |
|---|---|
| FPL, 1 person (2025 guidelines govern 2026 coverage) | $15,650 |
| 400% cliff | $62,600 |
| Applicable % at MAGI $30,000 (ratio 1.9169, band 150–200%: 4.19→6.60) | 6.1996% |
| → Subsidy at MAGI $30,000 | $16,140.12 |
| Applicable % at the cliff (ratio 4.0 exactly — inclusive) | 9.96% |
| → Subsidy at MAGI $62,600 | $11,765.04 |
| → Subsidy at MAGI $62,601 | $0 |
| Enhanced scenario, MAGI $50,000 (ratio 3.195, ARPA band 6→8.5%) | 6.487% → subsidy $14,756.39 |

The v5.10.1 cliff-solver fix was hand-verified the same way, computed independently from the 2026 HHS guidelines and the Rev. Proc. applicable-percentage table before being compared to engine output.

Every row is reproducible from the cited documents with arithmetic. If you find a discrepancy, that's a bug report — please open an issue.

## What the tests don't cover

No independent professional review of the tax, IRMAA, or ACA modeling has occurred. The app's limitations sections (Field Manual §13, METHODOLOGY §12, and the in-app ACA notes) list the simplifications that remain by design — simplified SS taxability, effective-rate state approximations, deterministic-by-default mortality, and the rest. The suites prove the code implements the documented model; they cannot prove the model matches your life.

The suite also proves nothing about builds it hasn't run against. Counts on this page are pinned to the build named at the top; a different version is a different claim.

## A note on AI-assisted development — and one incident worth disclosing

This project is built with AI assistance, which is exactly why the verification culture above exists: plausible-looking code is not reviewed code. One incident during v5.7 development makes the point concretely. Partway through the build, the AI working copy was found to contain a complete, plausible, *unrequested* ACA implementation — engine, UI, and matching tests — that no one had written or reviewed. Much of it was even substantively correct. It was quarantined rather than adopted: the source was reverted to the last verified snapshot, and the feature was rebuilt deliberately from a written spec, with every constant fetched from primary sources during the build and every test case hand-derived. The same discipline caught two genuine errors in the deliberate rebuild — one in the builder's hand math (the engine was right), one a real bug (a premium-growth term that silently zeroed later bridge years, caught by a test asserting exact compounding).

A second, quieter failure is worth disclosing because this page was its victim: through several releases, this file's headline count drifted badly out of date — claiming 562 checks and a six-suite layout that no longer existed, and stating the suite was unpublished after it had been committed. The per-suite figures in each release's CHANGELOG were correct throughout; this page simply stopped being updated. An earlier release also shipped totals that were understated by a transcription slip in hand addition. Both are the same lesson from different angles, and the reason every count on this page is now computed from parsed suite output rather than restated: the tests are not ceremony; they are the only thing standing between "looks right" and "is right."
