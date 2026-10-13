# SCOPE — Peer-benchmark refresh to the 2025 SCF (v6.10)

**FULFILLED — shipped as v6.10 (2026-10-13).** Repo-only. §8 is the build record.

*(Superseded status line, retained:)* **Status: DECISIONS RESOLVED 2026-10-13 — DD-1 (a), DD-2 (a), DD-3 (a), DD-4 (a), all as recommended. Blocked only on the data
file (§3): build starts when `scfp2025excel.zip` is attached.**
Working against **v6.09**, source `a32ef4531f4b46e18d26ad9accd8a00a`, repo commit `ab6f1b8`. Drafted 2026-10-13.
Trigger: the Events tab's alarm "Peer-benchmark data refresh (Ranking tab)" went green this month.

## 1. Premise — verified, not assumed

- **The 2025 SCF is published.** The Fed's SCF index page lists the 2025 survey, released **October 9, 2026**, with the
  summary extract (`scfp2025*.zip`), the full public dataset, the Bulletin article *Changes in U.S. Family Finances from
  2022 to 2025* (`scf26.pdf`), and the historic tables. Source: https://www.federalreserve.gov/econres/scfindex.htm.
- **The app is on the 2022 survey.** `PEER_DATA_SCF_YEAR = 2022` (module scope, the one definition; census below). It feeds
  `DATA_VINTAGES.scfYear` and the Events alarm in `computePlanEvents`. The alarm logic is right: 2022 + 3 = 2025 survey,
  published the following fall, so it reads "refresh now" from October 2026 and turns red in 2027.
- **The app's 2022 figures match the Fed's own 2022 numbers.** The 2025 Bulletin restates 2022 in 2025 dollars. Read through a
  summarising web fetch — **to be re-confirmed against the microdata at build time (§4)**:

  | Age 55–64 | App (2022 $) | Bulletin, 2022 restated (2025 $) | Ratio | Bulletin, 2025 (2025 $) |
  |---|---|---|---|---|
  | Median net worth | 364,500 | 398.9K | 1.0944 | 411.9K |
  | Mean net worth | 1,566,900 | 1,714.7K | 1.0943 | 1,878.0K |
  | Mean retirement accounts, families with an IRA or DC plan | 537,000 | 588.5K | 1.0959 | 670.2K |

  The ratios are near-identical, which is what one price adjustment would produce. So the app's 2022 medians and means are the
  Fed's figures, and the two-year-old numbers are not themselves in error.
- **What the Bulletin does NOT give:** the Ranking tab's **percentile cut-offs** (the 75th / 90th / 95th percentiles of net worth
  for ages 55–64), median retirement accounts and debt for this age group, and the "% with less than $100K saved" and "% aged 60+
  carrying a mortgage" figures. Those need the **household-level summary extract**, computed with the survey's weights.
- **The workspace cannot download it.** A request to `federalreserve.gov` from the session's shell was refused (HTTP 403 at the
  egress proxy). The file has to be attached (§3).
- **The current cut-offs have no recorded derivation.** The source comment reads *"Approximate SCF 2022 net-worth percentile cuts
  for 55-64 (p95 ≈ $3.2M, p90 ≈ $1.9M, p75 ≈ $780K)"*. No document records how they were computed, so whether they were
  right for 2022 is **unknown**. §3 offers a way to find out.

## 2. Site census (AST, v6.09)

By AST walk over `src/DangerClose.jsx`, plus the Field Manual blob searched as one string (it is one line, §C0). Line numbers are
v6.09's.

**Constant and alarm.** `PEER_DATA_SCF_YEAR` — 5 AST hits: definition L1791, `DATA_VINTAGES` L1804, the alarm L2140, L2143 and
L2148.

**The `peers` object (Ranking tab, L9301–9321)** — each figure, its comment-stated source, and what this scope does with it:

| Field | Value | Stated source | Action |
|---|---|---|---|
| `medianRetSavings` | 185,000 | Fed SCF | **compute (2025)** |
| `meanRetSavings` | 537,000 | Fed SCF | **compute (2025)** — oracle: Bulletin 670.2K |
| `medianNetWorth` | 364,500 | Fed SCF 2022 | **compute** — oracle: Bulletin 411.9K |
| `meanNetWorth` | 1,566,900 | Fed SCF 2022 | **compute** — oracle: Bulletin 1,878.0K |
| `medianHHDebt` | 97,000 | "Fed" | **compute** (families with debt, 55–64) |
| `meanHHDebt` | 145,740 | Fed SCF 2022 | **compute** (same) |
| `pctLessThan100K` | 40 | "Fed" | **compute** — definition to fix at build (§4) |
| `pctMortgage60plus` | 30 | "Fed" | **compute** (families 60+, primary-residence debt) |
| `engagedAvgSavings` | 1,050,481 | Empower, Mar 2026 | DD-1: Empower now publishes 1,080,916 (Sept 2026) |
| `engagedMedSavings` | 460,363 | Empower | DD-1: 463,328 (Sept 2026) |
| `engagedAvgSavings60s` | 1,228,196 | Empower | DD-1: 1,247,718 (Sept 2026) |
| `avgSSat62` | 2,000 | "SSA: avg monthly benefit at 62" | **DD-3** — the label does not match the number |
| `pctOnTrack` | 47 | EBRI | DD-1 (c) only — no primary source found this session |
| `pctNothing` | 25 | EBRI | DD-1 (c) only |
| `pctWithLTC` | 7 | AALTCI | DD-1 (c) only |
| `pctWithRothPlan` | 10 | "Approx" | DD-1 (c) only |

**Duplicated literals: the same number typed in more than one place.** This is the project's recurring defect class, and it gets
consolidated in the same edit:
- **Net-worth cut-offs, 3 sites:** the tier ternary L9331 (`3200000 / 1900000 / 780000`); the affluent proxy's `cuts` L9483
  (`364500, 780000, 1900000, 3200000`, where `364500` is a second copy of the median); and the band/scale literals L9494–L9503
  (`780000` four times, `1550000`, `1900000`, `3200000` twice). One table in `peers` will replace all of them.
- **`1228196` at L9538:** a second copy of `engagedAvgSavings60s`, written inline in prose.
- **"~47% of peers on track" at L9471:** a hardcoded twin of `peers.pctOnTrack`.
- **"Fed SCF 2022" or "Survey of Consumer Finances 2022" typed as text at L9437, L9509 and L9691,** plus the Field Manual (12
  passages that mention the peer sources; two state the year: "currently the 2022 survey" and the §13 vintage row "2022 SCF … the
  2025 survey publishes ~fall 2026"). All will read from `PEER_DATA_SCF_YEAR`, or, in the Field Manual, be rewritten for 2025.

**Portfolio-size tiers, L9340:** `> 1500000 → TOP 5%`, `> 800000 → TOP 10%`. No source is stated anywhere. See DD-2.

**Test coverage today: none of these figures is asserted.** By AST over every suite and tool, the only check that reaches the
Ranking tab is `t4`'s signature check for the strings "SCF" and "Empower". Nothing asserts a figure, a cut-off, a tier, or the
peer alarm. Every change here is **unwitnessed by the current suite** (§B2), so this release ships its own suite (§5).

## 3. The data — what Steve attaches

1. **Required:** `scfp2025excel.zip` — the Summary Extract Public Data in CSV form,
   https://www.federalreserve.gov/econres/files/scfp2025excel.zip.
2. **Recommended:** `scfp2022excel.zip` — the same file for 2022, from the Fed's 2022 survey page (reached from the SCF index).
   It lets the build:
   (a) prove the method reproduces the Fed's *published* 2022 figures before trusting it on 2025; and (b) settle whether the
   current hand-entered 2022 cut-offs were right. If they were not, the CHANGELOG says so.

Both files are data inputs, not app files. **Destination: session only.** They are not committed and not pooled. The repo gets the
small computation script and its output table (§4), so the figures can be re-derived.

## 4. Method

- **Population:** families whose reference person is 55–64. That is the summary extract's age class for that band; the column is
  named at build after reading the codebook. Same population as today.
- **Weights and implicates:** the SCF publishes five implicates per family for its imputed values. The Fed's own summary-variable macro
  (`econres/files/bulletin.macro.txt`) defines the extract's weight as `WGT=X42001/5`, with the comment *"divide weight by 5 so totals
  estimated on the 5 implicates jointly are correct"*. So every statistic is computed on **all five implicates pooled**, weighted by
  `WGT`, and the script checks that every family has exactly five rows. (Corrected while building — see §8.) No standard errors are
  shown: the tab rounds to "~$xK" and tiers, and a ±band would be a new output (out of scope).
- **The oracle:** the computed 2025 median and mean net worth for 55–64 must agree with the Bulletin's **411.9K** and **1,878.0K** before
  any other figure is used. With the 2022 file, the 2022 run must likewise agree with **364.5K / 1,566.9K** (2022 dollars) — the figures
  the app carries today. *Tolerance (set while building):* the Bulletin is computed on the Fed's **internal** data, and the extract is the
  **public** data, which the Fed alters slightly for disclosure protection, so exact equality is not expected. `peer_scf.py` refuses to
  print outside **±2%** and always prints the actual gap; the CHANGELOG states it. A tighter oracle exists if Steve attaches it: the Fed's
  historic tables built on the public data (`scf2025_tables_public_nominal_historical.xlsx`), which this session's fetch tool cannot
  read.
- **Dollars:** 2025 survey dollars, as published. The tab says "2025 dollars" where it says "SCF 2025". The plan's own figures are
  in today's dollars, so the gap is one year of inflation, which is disclosed and not adjusted. Adjusting would make the peers
  look larger and the user's rank look worse; that is the conservative direction, but it would be the app's own number rather
  than the Fed's.
- **"Retirement savings"** = the extract's retirement-accounts total (IRA plus account-type DC plans), median and mean among
  families holding any. The same definition the Fed's 537.0K / 670.2K figures use.
- **"% with less than $100K saved"**: among *all* 55–64 families (holders and non-holders), the share whose retirement accounts are
  below $100K. The definition is written into the source comment, because today's "40" has none.
- **Reproducible:** `qa/tools/peer_scf.py <csv> <year>` prints every figure. Its output for 2025 is committed beside the scope as
  `docs/PEER_SCF2025_figures.txt`. It asserts the oracle and refuses to print if the oracle fails.

## 5. Tests that ship

New **`qa/t73_peer_benchmarks.mjs`**, gated so the v6.09 leg pins today's values as its pre-fix state:

- **A — figures:** every `peers` field equals the committed figures file, field by field, using the equality helper (§D1). The
  `peers` object is reached through the shim if exported, else by AST read of the literal object.
- **B — one table:** by AST, no net-worth cut-off literal survives outside `peers`, and no copy of a `peers` value appears
  elsewhere in the Ranking tab. This is the extinction invariant for the duplicated-literal class in §2.
- **C — every tier cut-off is interior-priced:** a household just below and just above each cut-off lands in the adjacent tier, for
  every cut-off, not just the endpoints (§D1's endpoint-only trap).
- **D — vintage text:** the rendered Ranking tab says "SCF 2025" and never "SCF 2022"; the Field Manual's §13 row names 2025 and the
  2028 survey. Gated per leg (§B2: the v6.09 leg asserts 2022).
- **E — the alarm:** with the clock in October 2026 it is *not* green on v6.10 and *is* green on v6.09. It reads "next refresh:
  2028 SCF, publishes ~Oct 2029" on v6.10.
- **F — DOM:** the example household's Ranking tab renders the new mean net worth and cut-offs.
- **Negative controls:** `qa/tools/controls_v610_peer.py` — revert one interior cut-off, re-introduce a duplicate literal, restore
  the "2022" text, and revert the constant. Each must turn the named check red.

Plus registration of `v610` across the suite, as every release.

## 6. Out of scope — and recorded

- **Only one of the nine ranking dimensions takes its tier from peer data.** Net worth (L9331) uses the SCF cut-offs. Portfolio size
  (L9340) uses unsourced cut-offs (DD-2). Retirement readiness (L9348) and income replacement (L9365) compare the user's own figures
  against thresholds — 95% / 85% Monte Carlo success, 65% replacement — that no peer data supports. Debt "TOP 20%", Roth
  "TOP 10%", Healthcare "TOP 5%", Housing "TOP 15%" and Planning "TOP 5%" (L9356, L9373, L9381, L9389, L9398) are fixed strings
  that hold whatever the household enters. All nine are averaged into the headline **"Overall tier: TOP N% of Americans age …"**.
  A data refresh cannot make that headline more correct, because most of its inputs are not data. See DD-4.
- No new peer groups, no standard errors, no per-state or per-income comparisons.
- The EBRI, AALTCI and "approx" figures, unless DD-1 (c).

## 7. Decisions for Steve

**DD-1 · How far the refresh goes.**
(a) **Recommended:** every figure the SCF can supply, computed from the 2025 file (§2's "compute" rows, the cut-offs, and DD-2's
tiers if chosen), plus Empower to its September 2026 figures. Empower's article states the date and the method. EBRI, AALTCI and
the "approx" figures stay, each shown with its vintage, as now.
(b) SCF only.
(c) (a), plus a primary-source hunt for the EBRI 47% and 25%, AALTCI 7% and Roth 10%. None was confirmed this session. A short search found EBRI's
Retirement Security Projection Model pages, but no source stating 47% — so (c) may end in replacing or removing these figures. That is a bigger
job than a refresh.

**DD-2 · The portfolio-size tiers ($1.5M → top 5%, $800K → top 10%) have no source.**
(a) **Recommended:** compute them from the 2025 file — the 90th and 95th percentiles of 55–64 families' financial assets
(the definition is pinned at build).
(b) Leave them, and label them in the source as unsourced.

**DD-3 · "Avg Social Security at 62: ~$2,000/mo" is not a figure at 62.** SSA's Annual Statistical Supplement 2025, Table 6.B3,
gives the **2024 average retired-worker award** as **$2,036.02** across all claiming ages. Awards with the early-retirement reduction
— which every claim at 62 carries — average **$1,620.17**. Today's $2,000 is the all-ages figure under an at-62 label. It drives the
"x avg SS" ratios on two cards.
(a) **Recommended:** relabel it as what it is — "Avg retired-worker award (SSA)" — at $2,036. This is a copy fix plus a sourced
figure.
(b) Switch to the reduced-award figure ($1,620) and keep a "claimed early" label. This makes the user's multiple *larger*, the
non-conservative direction.
(c) Leave it.

**DD-4 · The tiers with no peer data behind them (§6) — eight of nine, all feeding the headline.**
(a) **Recommended:** record it now as a finding in `UsabilityFlaws.md`, with the headline-averaging consequence spelled out, for its
own scope. It is a judgement about what the tab claims, not a data job.
(b) Fold it into this release.
(c) Leave it unrecorded.

## 8. Build record and corrections

- **Corrected — the implicate method (§4).** The first draft said each statistic would be computed per implicate and then averaged. The
  Fed's macro defines the extract's weight for estimating on the **pooled** implicates, and `peer_scf.py` does that. Both methods give the
  same means; medians and percentiles can differ slightly, and the pooled form is the one the weight is built for.
- **Two figures were defined while building, not in the draft.** "Typical affluent" on the affluent band is the **87.5th percentile** — the
  median of the top quartile; v6.09's $1.55M had no recorded definition. The Portfolio Size tier keeps its v6.09 shape: above p95 is
  TOP 5%, above p90 is TOP 10%, and **everything else reads TOP 25%** — including a household far below the 75th percentile. That is
  part of F-19 (DD-4) and is left as it was.
- **The refactor was proved before any 2025 figure existed.** The source was staged once with v6.09's own values in the new one-table
  form. On the example household and eleven others, chosen to straddle every net-worth and portfolio cut-off, the rendered Ranking
  tab — and the Events tab — came out **identical** to v6.09's. The figures change in a separate step.
- **The suite and its controls were exercised on a dry run.** A build carrying deliberately synthetic SCF figures, never shipped, ran
  `t73` green on both legs. All eight planted defects plus the null control behaved as designed, 9 of 9.
- **The data arrived and the check passed.** `scfp2025excel.zip` (md5 `c938318c529a0b200734f35c431f5911`; 21,800 rows = 4,360 families × 5
  implicates). `peer_scf.py`: median $411.3K vs the Bulletin's $411.9K (−0.14%), mean $1,871.0K vs $1,878.0K (−0.37%); mean retirement savings
  $670,248 vs $670.2K. Pooled percentiles agree with the per-implicate average within 1.3% (p75 $1,416K vs $1,400K, p90 $3,458K vs $3,412K, p95
  $7,545K vs $7,490K). Output: `docs/PEER_SCF2025_figures.txt`.
- **The finding the 2022 file would have settled.** The v6.09 cut-offs ($780K / $1.9M / $3.2M) sit far below the 2025 55–64 figures ($1.42M /
  $3.46M / $7.55M), and the same 2025 extract's **all-ages** 75th and 90th percentiles are $813K and $2.54M — consistent with an all-ages table
  read as the 55–64 one. Not confirmed (no 2022 extract). The CHANGELOG and METHODOLOGY say so.
- **The example household moves, conservatively:** net worth TOP 10% → TOP 25%, portfolio TOP 5% → TOP 25%, national percentile ~90th → ~81st,
  headline TOP 11% → TOP 14%.
- **Two things found while building, both fixed in this package.** `domdiff`'s whole-page capture includes the shell's action banner, which names
  the most urgent open event on the run date; on this pair it differs because the release clears the peer alarm. It is set aside for this pair
  only. And the manifest's `vite_config.js` row (found at the v6.09 verification) is corrected to `vite.config.js`.
- **Source** `1b41119b4e8d217a35956de42c09d4eb` (26 anchored edits on v6.09, each counted once: the table and its formatter; the Ranking render reading it at every former
  literal; the Social Security relabel; the survey year at three sites; the Field Manual at three sites; four version sites). **Built** `93ff44d52b126d3431687a1c51e69f3e`
  (`smoke_built` 22 passed, 0 failed).
- **Controls 9 of 9**, restored byte-identically, in a folder with its own `node_modules`.
- **`t73`** 56 (v6.10) / 31 (v6.09). **Suite:** 6,637 app checks, 72 suites, 0 failed, 0 DIED; GRAND 6,767. Every current-leg count equals v6.09's but `t72` (19 on both legs: its §D differential needs the v6.08 module, absent on this pair, and takes its designed skip) and the new `t73`; the v6.09 leg equals v6.09's own counts but `t72` (the same skip) and `t73` (31, pinning v6.09's state). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v609 v610 from the build workspace — a full clone of ab6f1b8 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.09 resolved from history, commit 2f25660) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6545, half B GRAND 222; none DIED.
