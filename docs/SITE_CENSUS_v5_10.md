# v5.10 site census — retirement-start Traditional/Roth derivations in v5.9.2 (hash a1f0d4a7…)

Rule being enforced (scope §3): every place that derives retirement-start Traditional/Roth
from positions must add `contribAccrual()`'s figures. Line numbers refer to the shipped v5.9.2.

## Consumers found (accrual REQUIRED)

| # | Lines | Site | In scope's enumerated list? |
|---|-------|------|------------------------------|
| 1 | 3631–3636 | Engine P-construction — `rothSolve` useMemo (solve-for grid engine) | yes (§3.1, engine site 1/4) |
| 2 | 6791/6795/6798 | Withdrawal tab `_tradInit`, `_tradInitB_own`, `_rothInit` | yes (§3.2) — `_rothInit` implied |
| 3 | 7250–7251 | **Roth tab deterministic ladder projection** `tradBal0`/`rothBal0` (seeds the year-by-year conversion table at the ladder start = retirement) | **NO — found by census.** Without it the ladder table would disagree with the STEP-1 cards and the engine on the same tab. |
| 4 | 7360–7361 | STEP-1 per-person RMD cards `t0` sums | yes (§3.3) |
| 5 | 7637–7642 | Engine P-construction — Roth tab strategy comparator | yes (engine site 2/4) |
| 6 | 7775–7780 | Engine P-construction — solve-for grid PO (render) | yes (engine site 3/4) |
| 7 | 7971 | **Taxes tab year-by-year schedule** `_tradInit` (seeds `tradBal` at `_retireYr`) | **NO — found by census.** |
| 8 | 8417 | **IRMAA planner** `_tradInit` (seeds `tradBal` at `_retireYr`) | **NO — found by census.** |
| 9 | 9220–9225 | Engine P-construction — `_pTax` (What-Breaks estAnnualTax) | yes (engine site 4/4) |

Census verdict: the scope's list was incomplete by three sites (3, 7, 8) — exactly the class of
quiet cross-tab disagreement the §3.4 invariant exists to prevent. All nine get the helper.

## Explicitly unchanged (verified against source)

- Monte Carlo (`runMonteCarlo`, line 1406) and extended MC / Trajectory (line 1589): consume the
  contribution SUM via `contributions.monthly401k`/`spouseBMonthly`. v5.10 keeps these fields as
  **legacy mirrors** (`monthly401k = contribPreTaxA + contribRothA`, `spouseBMonthly = contribPreTaxB
  + contribRothB`), maintained by `applyLoadedData` and by Save & Apply — so the MC code is literally
  unchanged, sum-parity holds by construction, and **new backups still run on v5.9.x** (which reads
  `contributions.monthly401k` without a null guard at line 1406).
- Holdings table (shows *today*, correctly), `PORTFOLIO.household`, `total401k`, bucket math,
  `taxableInit` reduces (no accrual to taxable — working-year taxable saving is out of scope).
- Cosmetic readers of the mirror (AI context line 3989, Positions-tab note line 9780): now read
  "total A monthly contributions" — still accurate.

## Stop years (scope §2, verified)

- A: the selected `retireYear` (each deterministic tab's own retirement-year context).
- B: `PLAN_TIMELINE.targetRetireYearB` — the same year the MC already uses for B's contribution stop
  (line 1586: `(_tl.targetRetireYearB || retireYear)`), reused rather than invented.
