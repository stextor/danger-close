# Danger Close — Validation Suite

Two layers:

**1. Statutory constants** — `node validation/check_constants.mjs`
Asserts the 2026 federal figures (standard deductions, LTCG brackets), the QCD cap, the
state-module invariants (exactly 8 partial-SS states, exactly 9 no-tax states, 51 entries,
rate bounds, IL/PA exemptions, GA exclusion, WV phase-out), and the Gompertz longevity
sampler's median-anchoring property — each with its citation.

**2. Behavioral suites** — headless app tests (jsdom + React), run with the runner:
`TEST_MODE=selfhosted node validation/run.js <bundle>` after building each `*.test.jsx`
with esbuild (`--jsx=automatic --platform=node --external:jsdom`). Included:
- `smoke.entry.jsx` — mounts the app, loads example data, clicks all 25 tabs; asserts zero
  runtime errors and zero forbidden terms.
- `deep.test.jsx` — state-module ordering (TX=IL < GA < CA lifetime tax), Roth solve-for
  grid, Monte Carlo longevity/LTC toggles change results in the expected directions.
- `qcd`, `banner`, `byok`, `share`, `skins` tests — feature-level checks documented inline.

Honest scope note: this suite validates statutory constants and app behavior. It does NOT
constitute independent professional review of the tax mathematics, and golden-file
cross-validation against Pralana/ProjectionLab remains future work (see METHODOLOGY.md §12).
