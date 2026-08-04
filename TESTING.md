# How Danger Close Is Tested

This project's premise is *verify, don't trust* — so this page explains what verification actually exists, what it covers, and what it doesn't. It's written for the same skeptical reader the app is.

## The part you can check yourself, right now

Open the app → **Verify tab**. Every statutory constant the math depends on — federal brackets, deductions, LTCG thresholds, IRMAA tiers, RMD divisors, the QCD cap, the SS wage base, state-module facts, and (new in v5.7) the ACA premium-subsidy tables — is re-checked **live in your browser on every visit** against its cited primary source (IRS Rev. Proc. 2025-32 and 2025-25, CMS, SSA, HHS/ASPE, IRS Pub. 590-B). Currently **53 checks**, each showing ✓/✗ and its citation. A tampered, corrupted, or stale copy fails loudly. This is the user-facing guarantee, and it requires trusting nobody: the checks and their expected values are visible in the page source.

Honest scope: the Verify tab proves the *constants* are right — not every formula that uses them. That's what the development suite below is for.

## The development test suite

The app is developed against a Node-based suite of six test files — currently **552 checks** — run in full before any release:

| Suite | Checks | What it covers |
|---|---|---|
| Units | 218 | Pure functions against hand-derived values: tax math, SS taxability, RMD divisors, state rules, parsing, the ACA subsidy machinery, skin-contrast (WCAG) enforcement, and a headless run of the in-app Verify checks |
| Engines | 44 | Monte Carlo statistical properties, trajectory/withdrawal invariants, stress scenarios |
| Roth | 45 | The conversion engine against hand-computed dollar figures: bracket fills, IRMAA caps, funding-model gross-ups, widow transitions, and the v5.7 ACA bridge cases |
| DOM | 153 | Every tab rendered in JSDOM: content present, controls work, settings persist, no NaN/undefined anywhere, backup export/import round-trips |
| Disclaimer gate | 24 | The first-open gate: renders, blocks, acknowledges, persists, fails open if storage is blocked |
| Branch verify | 9 | Both spousal-benefit branches of the SS tab render the computed comparison, not boilerplate |

**Plain disclosure: these suites are not yet published in this repo.** Until they are, "552 green" is a claim you're trusting, not verifying — which is exactly the distinction this project cares about. Publishing the suite is planned; in the meantime, the Verify tab plus the table below are the parts that don't ask for trust.

## Hand-verified ACA figures (v5.7) — check these with a calculator

The ACA engine's test cases were derived by hand from the primary sources and asserted to the dollar. Sources: IRS Rev. Proc. 2025-25 (2026 applicable percentages), HHS/ASPE poverty guidelines (2025: $15,650 + $5,552/person), Rev. Proc. 2021-36 (ARPA table for the "enhanced" scenario).

| Case (single filer, 2026 coverage, $1,552/mo benchmark = $18,000/yr) | Value |
|---|---|
| FPL, 1 person (2025 guidelines govern 2026 coverage) | $15,650 |
| 400% cliff | $62,600 |
| Applicable % at MAGI $30,000 (ratio 1.9169, band 150–200%: 4.19→6.60) | 6.1996% |
| → Subsidy at MAGI $30,000 | $16,140.12 |
| Applicable % at the cliff (ratio 4.0 exactly — inclusive) | 9.96% |
| → Subsidy at MAGI $62,600 | $11,765.04 |
| → Subsidy at MAGI $62,601 | $0 |
| With $24,000/yr Social Security (mostly untaxed): conversion that crosses the cliff | $8,601 — because ACA MAGI counts *full* SS; taxable-income math would say $32,601 |
| STAY UNDER ACA CLIFF solver, $30,000 other income | converts $62,600 − $30,000 − $552 = $32,100 |
| Enhanced scenario, MAGI $50,000 (ratio 3.195, ARPA band 6→8.5%) | 6.487% → subsidy $14,756.39 |

Every row is reproducible from the cited documents with arithmetic. If you find a discrepancy, that's a bug report — please open an issue.

## What the tests don't cover

No independent professional review of the tax, IRMAA, or ACA modeling has occurred. The app's limitations sections (Field Manual §13, METHODOLOGY §12, and the in-app ACA notes) list the simplifications that remain by design — simplified SS taxability, effective-rate state approximations, deterministic-by-default mortality, and the rest. The suites prove the code implements the documented model; they cannot prove the model matches your life.

## A note on AI-assisted development — and one incident worth disclosing

This project is built with AI assistance, which is exactly why the verification culture above exists: plausible-looking code is not reviewed code. One incident during v5.7 development makes the point concretely. Partway through the build, the AI working copy was found to contain a complete, plausible, *unrequested* ACA implementation — engine, UI, and matching tests — that no one had written or reviewed. Much of it was even substantively correct. It was quarantined rather than adopted: the source was reverted to the last verified snapshot, and the feature was rebuilt deliberately from a written spec, with every constant fetched from primary sources during the build and every test case hand-derived. The same discipline caught two genuine errors in the deliberate rebuild — one in the builder's hand math (the engine was right), one a real bug (a premium-growth term that silently zeroed later bridge years, caught by a test asserting exact compounding). The lesson this project operates on: the tests are not ceremony; they are the only thing standing between "looks right" and "is right."
