# Reviewing Danger Close

This is a short orientation for anyone here to check the math — a CPA, actuary, engineer, or a careful skeptic. The full reasoning lives in [METHODOLOGY.md](METHODOLOGY.md); this page just tells you where to look and how to verify claims yourself.

## Start here

1. **[METHODOLOGY.md](METHODOLOGY.md)** is the white paper. It explains every engine, the assumptions behind it, the sources for statutory constants, and — importantly — the known limitations and simplifications. It's written to be auditable without reading the source.
2. **[`src/DangerClose.jsx`](src/DangerClose.jsx)** is the entire application in one component tree (~10,600 lines). It's the single source of truth for the logic.
3. **[`validation/`](validation/)** is a runnable suite that checks the statutory constants against their sources and exercises the app headlessly.

## The one thing to understand before you judge a number

Success rates here run **lower** than mainstream calculators, often by 10–20 points, at default settings. This is deliberate. The base scenario is intentionally more pessimistic than the 1926–present historical record, because the tool's purpose is stress-testing, not reassurance. To separate the model's caution from the plan itself, switch the scenario to `HISTORICAL` and compare. A plan that survives the pessimistic base case is genuinely robust.

## Running the validation suite

Requires [Node.js](https://nodejs.org) 18+.

**Statutory constants** — checks 2026 federal figures, LTCG brackets, the QCD cap, state-module invariants, and the Gompertz longevity sampler's median-anchoring property, each against its citation:

```
node validation/check_constants.mjs
```

**Behavioral suites** — headless app tests (jsdom + React). Each `*_test.jsx` / `*_entry.jsx` is bundled with esbuild, then run through the harness. See [`validation/README.md`](validation/README.md) for the exact commands and what each suite asserts (tab-render smoke test, state-tax ordering, Roth solve-for grid, QCD effects, banner logic, bring-your-own-key handling, share/export, and skins).

## What the suite does and does not prove

It validates that the **statutory constants are correct** and that the **app behaves as intended**. It does **not** constitute independent professional review of the tax mathematics, and golden-file cross-validation against established planners (e.g. Pralana, ProjectionLab) remains future work. This is stated plainly in METHODOLOGY.md, and an independent CPA/EA/actuary review is the single most valuable outstanding validation. If you are qualified to give one, it would be genuinely welcome — please open an issue or discussion.

## Sanity checks worth doing by hand

- Load the app, click **USE EXAMPLE DATA**, and confirm the Taxes tab's bracket math against a hand calculation for the example household.
- Change the state (My Data tab) and confirm the lifetime-tax ordering is sensible: no-income-tax states (TX, etc.) lowest, high-tax states (CA) highest.
- On the Monte Carlo tab, toggle stochastic longevity and the LTC distribution and confirm results move in the direction you'd expect.

## Reporting what you find

Bugs go in [Issues](../../issues); methodology questions and debates go in [Discussions](../../discussions). Please never post real personal financial figures or an API key — both spaces are public. Use rounded numbers or the built-in Example Data.
