# Danger Close

**A retirement stress-test console. Runs entirely in your browser. No account, no server, no data leaves your machine.**

> **Standing disclaimer:** Danger Close is an educational modeling tool built by a hobbyist with no financial credentials. It renders no investment advice, recommends no securities, and every output should be verified independently before any real-world action.

---

## Try it

**[Open the live app](https://stextor.github.io/danger-close/)**

Or download `index.html` from this repository and double-click it. It is a single self-contained file — no install, no build step, no internet connection required after download.

---

## What it does

Danger Close projects a household retirement plan against a deliberately pessimistic model of the future, then shows you where it breaks.

- **Regime-switching Monte Carlo** — each simulated year is drawn from one of six probability-weighted economic regimes (expansion, recession, crisis, stagflation, recovery, boom) rather than a single normal distribution, producing fatter left tails and more realistic return/inflation coupling.
- **Historical backtest** — the same plan run against actual market history, side by side with the simulation.
- **Mortality and long-term care** — Gompertz survival modeling and an LTC shock layer.
- **Federal and state tax engines** — bracket-aware, with a state module covering effective-rate differences.
- **Roth conversion modeling** and **IRMAA** tier effects.
- **Withdrawal sequencing and guardrails** — spending rules that adapt to portfolio performance.
- **Other income streams** — rental, post-retirement work, annuities and more, each with its own start/end years, owner, COLA flag, and tax treatment, flowing through every engine.
- **ACA premium subsidy modeling** - Roth strategies are charged for the marketplace subsidies they destroy in pre-Medicare bridge years, with a STAY UNDER ACA CLIFF solver and a current-law-vs-enhanced scenario toggle — constants verified against IRS Rev. Proc. 2025-25 and HHS poverty guidelines.

### A note on the numbers

Danger Close will usually show a **lower success rate than mainstream retirement calculators** at their default settings — often by 10 to 20 points. Where another tool shows 95%, this may show ~78% for the same plan. That is by design, not an error. The BASE scenario prior is intentionally more pessimistic than the 1926–present historical record, because the tool's job is stress-testing. Switch the scenario to `HISTORICAL` to see how much of your result is the plan versus the model's caution.

---

## Privacy

All computation is client-side. Your data lives in browser storage only; the app file is never modified, and exports are explicit JSON files you choose to save.

The one exception is the optional **Ask AI** feature, which transmits a structured plan summary and your typed question to the Anthropic API using a key **you** supply. That key is stored in browser storage only and is never written into any file or backup. Two escape hatches exist:

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
| `src/DangerClose.jsx` | The readable React source for the entire app (~10,600 lines, single component tree). The single source of truth for the application logic. |
| `src/main.jsx` | Browser bootstrap — installs the `localStorage` persistence shim and mounts the app. |
| `src/index.html` | Vite HTML entry template (not the published file). |
| `package.json`, `vite.config.js` | Build configuration. |
| `validation/` | Runnable verification suite — statutory-constant checks and headless behavioral tests. |
| `METHODOLOGY.md` | The methodology white paper. |
| `REVIEWING.md` | Short orientation for anyone auditing the math. |
| `LICENSE` | MIT license. |

---

## Building from source

`src/DangerClose.jsx` is the source of truth. The build inlines everything into the single self-contained `index.html`.

Requirements: [Node.js](https://nodejs.org) 18 or newer (which includes `npm`).

```
npm install        # install dependencies (first time only)
npm run dev        # local dev server with live reload at http://localhost:5173
npm run build      # produce the single-file bundle at dist/index.html
```

To publish a new build, copy `dist/index.html` over the `index.html` at the repository root and commit it.

A note on the two runtime shims baked in by `src/main.jsx`: the app persists to `window.storage`, which in this standalone build is backed by the visitor's own `localStorage` — nothing leaves their machine. The Ask AI feature calls Anthropic directly using the visitor's own key; on a static host with no key supplied, Ask AI is simply inactive, which is the intended bring-your-own-key behavior.

---

## License

MIT — see [LICENSE](LICENSE). Provided as-is, with no warranty of any kind. See the standing disclaimer at the top of this file.
