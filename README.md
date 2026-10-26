# Danger Close

**A retirement stress-test console. Runs in your browser. No account and no server; your plan stays in your browser unless you use Ask AI.**

> **Standing disclaimer:** Danger Close is an educational modeling tool built by a hobbyist with no financial credentials. It renders no investment advice, recommends no securities, and every output should be verified independently before any real-world action.

---

## Try it

**[Open the live app](https://stextor.github.io/danger-close/)**

Or download `index.html` from this repository and double-click it. It is a single self-contained file — no install and no build step. After download it needs the internet for nothing but Ask AI (and the page's Google Fonts, which fall back to your system fonts when offline).

---

## What it does

Danger Close projects a household retirement plan — the drawdown years, from retirement on — against a deliberately pessimistic model of the future, then shows you where it breaks.

- **Regime-switching Monte Carlo** — each simulated year is drawn from one of six probability-weighted economic regimes (base, optimistic, pessimistic, recession, stagflation, crisis) rather than a single normal distribution, producing fatter left tails and coupling returns with inflation. The simulations apply Guyton-Klinger spending guardrails: spending is cut when a path's balance falls below 80% of the planned path and raised above 120%.
- **Historical backtest** — the same plan replayed against actual market history (1928–2025) on its own tab. It holds the asset mix constant and counts Social Security and the pension as its only income.
- **Mortality and long-term care** — deaths at the ages you enter by default, with an optional stochastic-longevity toggle (a Gompertz curve anchored to those ages); long-term care as a one-time cost per person or as a drawn multi-year care duration (the tail that actually breaks plans).
- **Federal and state tax engines** — bracket-aware, with a 51-jurisdiction state module, NIIT, and a simplified AMT check.
- **Roth conversion modeling** — a six-strategy comparator and a 25-cell solve-for grid run through the full deterministic engine, with **IRMAA** two-year-lookback tier effects and a wealth-crossover break-even ("does not break even" is a possible honest answer).
- **Per-spouse ownership** — every retirement holding has an owner, so each spouse's RMDs begin at their own SECURE 2.0 age (73 or 75 by birth year) on their own balance, conversions land in the converter's own Roth, and the first death triggers a spousal rollover.
- **A year-by-year withdrawal plan** — which accounts the spending comes from each year; the Taxes and IRMAA tabs tax the draws it makes. It is a fixed schedule: the adaptive spending guardrails are the Monte Carlo's, not this plan's.
- **Other income streams** — rental, post-retirement work, annuities and more, each with its own start/end years, owner, COLA flag, and tax treatment. The tax engines, the withdrawal plan and the Monte Carlo count them; the Historical Backtest and What Breaks do not.
- **ACA premium subsidy modeling** — Roth strategies are charged for the marketplace subsidies they destroy in pre-Medicare bridge years, with a STAY UNDER ACA CLIFF solver and a current-law-vs-enhanced scenario toggle — constants checked against IRS Rev. Proc. 2025-25 and the HHS poverty guidelines.

### A note on the numbers

Danger Close is built to read low. Its default scenario prior, `BULL-LEANING`, is still more conservative than historical US equity performance, and `BASE` and `BEAR-LEANING` are more conservative again; a `HISTORICAL` preset shows how much of a result is the plan and how much is the model's caution. The Field Manual (the app's Docs tab) gives the figures behind each preset.

---

## Verification

The app checks itself, in part. The **Verify tab** re-checks the statutory constants it can name — the federal brackets and deductions, the AMT figures, the 0% capital-gains bracket tops, the NIIT thresholds, the payroll-tax rates, the wage base, the QCD cap and the ACA figures — against their primary sources, in your browser, every time you open it, with a pass/fail and a citation per line. IRMAA tiers, RMD divisors and state-module facts are spot-checked, and some figures are not checked there at all (among them the AMT, NIIT and Social Security taxation rates, which sit inline in the engines); the tab says which. The expected values live in the same file, so this catches a corrupted copy — not a deliberate edit to both a constant and its check, and not a copy that is simply a year old (the Events tab and a staleness strip warn about that).

Behind that, the repository carries a headless regression suite in `qa/`: engine figures computed independently and compared to the dollar, backup import/export round-trips, the disclaimer gate, and browser-level tests that mount the real app and render its tabs. Every release runs it in full, comparing the new build with the one before; [TESTING.md](TESTING.md) has the current count and how to run it, and [CHANGELOG.md](CHANGELOG.md) each release's results.

---

## Privacy

All computation is client-side. Your data lives in browser storage only; the app file is never modified, and exports are explicit JSON files you choose to save. The page loads its fonts from Google Fonts.

The one exception is the optional **Ask AI** feature. When you use it, it sends the model a set of ground rules, a summary of your plan and its current results (the exact text is shown on the tab), the recent conversation, any file you attach, and your question. On claude.ai it uses the platform, with no key; on the published site or a downloaded copy it calls the Anthropic API with a key **you** supply, kept in browser storage and never written into any file or backup. Two escape hatches exist:

- **Offline Mode** — a persisted toggle that hard-disables Ask AI entirely, for fully air-gapped operation.
- **Local endpoint** — route Ask AI to an OpenAI-compatible local server (Ollama, LM Studio) so the summary never leaves your machine.

---

## Methodology

[**METHODOLOGY.md**](METHODOLOGY.md) is a full white paper explaining how every engine works, what it assumes, where those assumptions come from, and where the model simplifies reality. It is written to be auditable by a skeptical CPA, actuary, or engineer without reading the source.

It also documents the known limitations honestly — including that no independent professional (CPA/EA/actuary) review has been done, which is the single most valuable outstanding validation.

---

## Repository contents

| File / folder | What it is |
|---|---|
| `index.html` | The complete application. Self-contained build — open it in any browser. This is the published, distributed artifact. |
| `src/DangerClose.jsx` | The readable React source for the entire app, in one file. The single source of truth for the application logic. |
| `src/main.jsx` | Browser bootstrap — installs the `localStorage` persistence shim and the Anthropic fetch wrapper, then mounts the app. |
| `src/index.html` | Vite HTML entry template (not the published file). |
| `package.json`, `package-lock.json`, `vite.config.js` | Build configuration. The lockfile is a build input: it pins the exact dependency tree. |
| `qa/` | The regression suite every release runs (see TESTING.md), its harness, and the parser tools it uses. |
| `docs/` | Scope documents, audits, findings and the issue registers behind each release. |
| `validation/` | An older, separate suite of statutory-constant checks. Kept, but not part of the release gate. |
| `METHODOLOGY.md` | The methodology white paper. |
| `CHANGELOG.md` | Release history, most recent first. |
| `TESTING.md` | What the suite covers and how to run it. |
| `REVIEWING.md` | Short orientation for anyone auditing the math. |
| `LICENSE` | MIT license. |

---

## Building from source

`src/DangerClose.jsx` is the source of truth. The build inlines everything into the single self-contained `index.html`.

Requirements: [Node.js](https://nodejs.org) 18 or newer (which includes `npm`).

```
npm ci             # install the exact dependency tree the lockfile pins (first time only)
npm run dev        # local dev server with live reload at http://localhost:5173
npm run build      # produce the single-file bundle at dist/index.html
```

Use `npm ci`, not `npm install`: it installs what `package-lock.json` records, which is how a rebuild reproduces the published file byte for byte. To publish a new build, copy `dist/index.html` over the `index.html` at the repository root and commit it.

A note on the two runtime shims baked in by `src/main.jsx`: the app persists to `window.storage`, which in this standalone build is backed by the visitor's own `localStorage` — nothing leaves their machine. The Ask AI feature calls Anthropic directly using the visitor's own key; on a static host with no key supplied, Ask AI is simply inactive, which is the intended bring-your-own-key behavior.

---

## License

MIT — see [LICENSE](LICENSE). Provided as-is, with no warranty of any kind. See the standing disclaimer at the top of this file.
