# SCOPE — The Ranking tab's headline and the claims around it (F-19r, target v6.11)

**Status: AWAITING DECISIONS (DF-0 … DF-5). Nothing built.** Drafted 2026-10-13.
Working against **v6.10**, source `1b41119b4e8d217a35956de42c09d4eb`, built `93ff44d52b126d3431687a1c51e69f3e`, repo commit `7c9567b`
(fresh clone this session; both md5s equal the manifest's Current table). Finding: `docs/UsabilityFlaws.md` §H, filed at v6.10 as **F-19**.
Every figure below was printed by a command run in this session (§9 lists them). Line numbers are v6.10's.

## 0. Two things to settle before anything else

**0a · The ID F-19 is used twice.** At v5.39, F-19 was the skin-registry drift ("Seven color palettes" against 13 skins) —
`docs/SCOPE_FIX_docs_v5_39.md` L33, `docs/STATUS_v5_39_shipped.md` L87 ("F-19 closed at v5.39"). v6.10 filed the Ranking-tab finding
under the same number. Three places now disagree:
- `UsabilityFlaws.md`'s census table (v5.97) has a row for every ID from F-10 to F-18 and **none for the old F-19**; the document's only
  F-19 heading is the new one.
- The manifest's `UsabilityFlaws.md` row says both "**Fixed:** … F-19 (F-19 was found while verifying F-10…)" and "**F-19 added at v6.10**".
- `CHANGELOG.md` (v6.10) and `METHODOLOGY.md` L2308 cite F-19 for the Ranking finding.

Reported here before acting, per the project rule on documents that disagree. The census already has a precedent for this (F-11p/F-11d,
F-12p/F-12d). **DF-0** decides it; this scope is named for the recommended option.

**0b · F-19's measured figure is wrong, and the direction is not.** F-19 says that on v6.09, with $20,000 invested, the headline read
**TOP 15%**. Re-measured this session on v6.09: **TOP 18%**. The difference is a harness trap, not the app: `applyLoadedData` changes the
household but does **not** re-run the Monte Carlo (`simData`, L6435, is set only by the effect at L6624–6646, which runs on mount and on a scenario-preset or SS-haircut change), so the
probe that filed F-19 rendered the new household's Ranking tab with the *example's* 100% success rate, and Retirement Readiness kept
"TOP 5%". With the sims re-run, a $20,000 portfolio reads 0.0% success and "TOP 30%". The finding is stronger than recorded, not weaker.
The probe used here flips the scenario preset away and back after each load, which forces the re-run. The trap is not yet in
OPERATIONS §C; the build adds it (§5, item 7).

## 1. Premise — verified against v6.10, not assumed

**1a · What the headline is.** The Ranking render is the anonymous function at **L9285–L9707** inside `DangerCloseMain` (`funcmap.cjs`).
It builds nine rows (`dims`, L9331–9408), maps each row's tier string to a number (`tierVal`, L9411) and shows their **plain average** as
**"Overall tier: TOP N% of Americans age {age}"** (L9412–9414, shown at L9452–9454) and in the Bottom Line, *"If you walked into a room with 100 randomly
selected {age}-year-old Americans, you would rank in the top N by virtually every dimension that matters for retirement security"*
(L9688–9690). `census.cjs`: `avgPctile` has 5 AST hits, all inside this render; nothing outside the tab reads it.

| Row | Tier from (v6.10) | Peer data? |
|---|---|---|
| Net Worth | `PEER_BENCHMARKS.nwCuts` p75 / p90 / p95 (L9338) | yes — but anything at or below p75 reads **TOP 50%**, including the 2nd percentile |
| Portfolio Size | `finCuts` p90 / p95 (L9347) | yes — but anything at or below p90 reads **TOP 25%** |
| Retirement Readiness | the user's MC success ≥ 95% / ≥ 85% (L9355) | no |
| Debt Load | the string "TOP 20%" (L9363) | no |
| Income Replacement | the user's replacement ratio ≥ 65% (L9372) | no |
| Roth Strategy | "TOP 10%" (L9380) | no |
| Healthcare Planning | "TOP 5%" (L9388) | no |
| Housing Equity | "TOP 15%" (L9396) | no |
| Planning Sophistication | "TOP 5%" (L9405) | no |

**1b · The headline can only ever say TOP 9% to TOP 18%.** Enumerating every tier the code can assign (72 combinations): the average runs
from 8.889 to 17.778, so the displayed headline is one of 9, 10, … 18 for **every possible household**. The five fixed strings contribute
55 of the nine-way sum whatever is entered. `tierVal` scores "TOP 50%" and "TOP 30%" both as 30 (its default branch). The headline's
`var(--accent)` colour (`avgPctile <= 8`, L9414) is unreachable.

**1c · Measured on v6.10, with the Monte Carlo re-run for each household** (probe, §9):

| Household | Net worth, national pctile | MC success | Headline | Bottom Line |
|---|---|---|---|---|
| Example, as shipped | 81st | 100.0% | **TOP 14%** | "top 14" |
| Example, $20,000 invested | 43rd | 0.0% | **TOP 18%** | "top 18" |
| Example, $250,000 invested | 57th | 0.0% | **TOP 18%** | "top 18" |
| Example, $6,000,000 invested | 94th | 100.0% | **TOP 11%** | "top 11" |
| No home, $20,000 invested | 2nd | 0.0% | **TOP 18%** | "top 18" |
| Same, single | 2nd | 0.0% | **TOP 18%** | "top 18" |

Hand check of two rows from the tier table: example 25+25+5+20+20+10+5+15+5 = 130, ÷9 = 14.44 → "14"; $20,000 30+25+30+20+20+10+5+15+5 = 160,
÷9 = 17.78 → "18". Both equal the rendered headline.

**1d · The copy around the headline is unconditional.** Every one of the six households above renders each of these (probe, §9; the
Bottom Line's "possess" clause and the table subtitle were read in the source, inside the same unconditional JSX as the checked phrases):
- Header, L9447–9449: *"You are in an exceptionally strong position relative to your peers… that is not a modest advantage, it is a
  structural one."*
- Planning advantage, L9664–9667: *"…no Roth conversion plan, no guardrail framework, and no defined withdrawal sequencing. You have all three —
  documented, stress-tested, and instrumented in this console."*
- Bottom Line, L9688–9696: *"…top N by virtually every dimension… planning sophistication… that fewer than 10% of your peers possess."*
- Four rows state facts about the household that the app does not know: Roth "Active conversion plan {years}" (L9377), Healthcare
  "ACA bridge + Medicare + hybrid LTC" (L9385), Housing "{equity} equity, **cash-purchase plan**" (L9393 — rendered as "$0K equity,
  cash-purchase plan" for a household with no home), Planning "Guardrails + sequencing + Roth plan" (L9402). Their ratios are the fixed
  words "Rare", "Rare", "Strong", "Rare".
- The affluent card, L9528: for the no-home $20,000 household it reads *"Nationally that's about the 2nd percentile for your age — among
  the wealthier residents you'll live near, you're around the middle."* For the example it reads *"You sit in the lower band of an
  affluent retirement community… you're around the middle"* — two verdicts in one sentence.
- The table's subtitle, L9576: *"Each financial-health dimension scored against peer-group medians and survey data"*; its column header,
  L9581: *"Peer benchmark (age 62)"* while every peer figure is for ages 55–64.

**1e · The Field Manual says the opposite of 1a.** Its Ranking entry: *"Approximate 'Top N%' tiers built from public survey data."*
True of two rows, false of seven and of the headline. (Read from the raw `DOCS_HTML` through the shim; the blob is 158,035 characters /
159,247 bytes at v6.10.) The disclaimer's *"Peer rankings are approximate"* stays true.

**1f · Smaller things, found in the same block:**
- Income Replacement and two other sites divide the household's **combined** guaranteed income (both spouses' SS plus the pension) by
  **one** retired worker's average award: "2.5x avg SS" on the example (L9371, the headline card at L9473, the Bottom Line at L9693).
- Retirement Readiness compares the user's success rate with "~47% of workers on track" and prints a ratio ("2.1x"). They are different
  measures, and the app's success rate is the share of paths ending above **$800,000** (L6636), a fixed threshold — the F-15b family.
- Portfolio Size's ratio and benchmark use mean *retirement accounts* ($670K) while its tier uses *financial assets* (`finCuts`).

**1g · Product boundary.** The situation (a mainstream couple reading where they stand) is squarely in frame, and the change makes an
existing output more correct. No new output. **Build it.** It is a presentation release: no engine, no figure that any engine reads.

## 2. Site census

**Source** (AST — `rank_sites.cjs`, `census.cjs`, `funcmap.cjs`; §9):

| Site | Lines | What changes |
|---|---|---|
| `dims` tier expressions and fixed strings | L9338–9405 | DF-1, DF-2, DF-4 |
| "yours" / ratio fixed claims | L9371, L9377–9379, L9385–9387, L9393–9395, L9402–9404 | DF-2, DF-5 |
| `tierVal`, `avgPctile`, `overallTier`, `overallColor` | L9411–9414 | DF-1 (removed under (a)) |
| Header paragraph | L9447–9449 | DF-3 |
| Overall-tier box | L9451–9455 | DF-1 |
| Headline card "Nx avg SS award" | L9473 | DF-5 |
| Affluent card's verdict sentence | L9528 (verdict built L9503–9507) | DF-3 |
| Table subtitle and column header | L9576, L9581 | folded in (§3) |
| Planning advantage block | L9663–9667 | DF-3 |
| Bottom Line | L9685–9696 | DF-1, DF-3, DF-5 |

`PEER_BENCHMARKS` itself does not change unless DF-4 (b) is chosen. No other render, engine or Ask AI path reads anything in this list.

**Field Manual:** the Ranking tab entry (one passage; quote-free anchors, §C0). **METHODOLOGY:** L2307–2308 ("What the refresh does not
fix…") becomes false and is rewritten. **UsabilityFlaws:** the F-19 entry, its census row, and the old F-19's missing census row (DF-0).
**Manifest:** the `UsabilityFlaws.md` row.

**Suite — what asserts this copy today** (AST walk of every string, template and regex literal in the run folder's `qa/`, each regex
executed against the copy; §9). Only two suites touch the Ranking tab:
- `t4` L100: `sig("ranking", ["SCF", "Empower"])` — survives every option here; the build must keep both words on the tab.
- `t73`: D-0 needs the heading "Dimension-by-dimension ranking"; C-1/C-2 read the Net Worth row's tier at p75/p90/p95; **C-3 expects a
  portfolio exactly at p90 to read "TOP 25%"**, which DF-4 changes — it must be gated per leg (§B2), not rewritten; B-1 requires the render's
  only six-figure literals to be 150,000 / 500,000 / 1,000,000, so the build adds no dollar literal to the render.
- **Nothing asserts the headline, the Bottom Line, the praise copy, the five fixed tiers or the four fixed claims.** Every change in this
  scope is unwitnessed until the new suite exists.

**Version cost:** `v611` is free (`vercensus.cjs` 0 hits; the three `.py` suites and `git log` for `dom_entry_v611.jsx` empty). Registering it
is the usual job — `vercensus.cjs v610` reports 308 judgement points across the suite.

## 3. Folded in without a decision (plain factual fixes)

- Column header "Peer benchmark (age 62)" → "Peer benchmark (ages 55–64)".
- Table subtitle → says which rows are compared with survey data and which are the household's own figures.
- The Field Manual's Ranking entry and METHODOLOGY L2307–2308 are rewritten to describe what ships.

## 4. Decisions for Steve

**DF-0 · The duplicate ID.**
(a) **Recommended:** suffix both, as the census did for F-11 and F-12 — **F-19s** (skins, fixed v5.39) and **F-19r** (Ranking). Add the
missing F-19s row to the census table. Shipped CHANGELOG entries stay as written (they are history); the manifest row is corrected.
(b) Renumber the Ranking finding to **F-20** and edit the v6.10 METHODOLOGY line and manifest row to match. Cleaner going forward, but the
v6.10 CHANGELOG entry would keep saying F-19 for a finding that is no longer called that.

**DF-1 · What the headline becomes.**
(a) **Recommended:** the household's **net-worth position** against SCF families 55–64, labelled as exactly that — e.g. "Net worth: TOP 25%
of U.S. families age 55–64 (Fed SCF 2025)". It is the one quantity on the tab with a real distribution behind it, and the tab already
computes it. The nine-way average and `tierVal` go. This departs from F-19's own option (a), which averaged net worth and portfolio:
the average of two percentile bands is not a percentile, and the portfolio is part of net worth, so it would count the same money twice.
(b) F-19's original (a): average the Net Worth and Portfolio Size tiers.
(c) Drop the headline box and the Bottom Line's percentile sentence; keep the rows.
(d) Keep the nine-way average and disclose beside it that most inputs are fixed. Not recommended: it would still read TOP 9%–18% for
everyone.

**DF-2 · The seven rows with no peer data.**
(a) **Recommended:** keep **Retirement Readiness, Income Replacement, Debt Load and Housing Equity** as descriptive rows showing the
household's own figures beside the survey figure, with **no tier and no ratio** across different measures. **Remove Roth Strategy,
Healthcare Planning and Planning Sophistication**: their "Your position" text is a fixed claim the app cannot know (for example "hybrid LTC"
for a household with none), so there is nothing true left to show.
(b) Keep all seven, replace their tier with "—" and fix the claim text to what the app does know.
(c) Remove all seven rows.

**DF-3 · The unconditional praise** (header, Planning advantage, Bottom Line, the affluent card's verdict).
(a) **Recommended:** state figures, not verdicts. The header gives the two multiples plainly ("Your investable portfolio is 2.5x the
average…"); the **Planning advantage block is removed** (it asserts three facts about every user); the Bottom Line states the net-worth
position and the multiples, without "virtually every dimension" or "fewer than 10% … possess"; the affluent card's sentence keeps its
national percentile and drops "among the wealthier residents you'll live near", and its verdict comes from one rule so it cannot say
"lower band" and "around the middle" at once. This is the app's stated voice — pessimistic, reporting what the model computes.
(b) Keep the praise, but show it only above thresholds (e.g. net worth above p90). Not recommended: it invents new verdict lines with no
source, which is the defect this scope removes.
(c) Fix the numbers only and leave the copy. A household at the 2nd percentile would still read "exceptionally strong position".

**DF-4 · The floors on the two peer-data rows.** Net Worth below p75 always reads TOP 50%; Portfolio below p90 always reads TOP 25%.
(a) **Recommended:** Net Worth gains its median band from the table it already has (`nwCuts.p50`): above p75 TOP 25%, above p50 TOP 50%,
otherwise "Below the median". Portfolio, below p90, reads "Below the top 10%". No new data needed.
(b) As (a) for Net Worth; for Portfolio, compute financial-asset p50 and p75 from the 2025 extract (you re-attach `scfp2025excel.zip`;
`peer_scf.py` gains two outputs and `docs/PEER_SCF2025_figures.txt` is re-run) and give Portfolio the same bands as Net Worth. More
informative, one download, and the row's average would then also move to a financial-assets figure so the tier and the benchmark measure
the same thing (§1f).
(c) Leave the floors.

**DF-5 · "Nx avg SS award"** (combined income ÷ one person's award; three sites).
(a) **Recommended:** drop the ratio; show the household's guaranteed income and the average award side by side, each labelled ("your
combined Social Security and pension", "average award per retired worker").
(b) Divide by the award times the number of people in the household drawing Social Security. Still mixes the pension in.
(c) Leave it.

## 5. Tests that ship

New **`qa/t74_ranking_headline.mjs`**, both legs, gated so the v6.10 leg pins today's behaviour as dated `[KNOWN DEFECT]`s:
1. **Extinction, by AST** — inside the Ranking render no "TOP N%" string literal exists outside the Net Worth and Portfolio tier
   expressions, and no expression averages over `dims`. (v6.10 leg: pins the five fixed strings and the average.)
2. **The headline follows net worth and nothing else** — households equal in net worth but differing in MC success (re-run), mortgage,
   filing status and income replacement show the same headline; households differing only in net worth across each cut-off do not.
   (v6.10 leg: pins the TOP 9%–18% bound and the $20,000 household at TOP 18%.)
3. **Every net-worth cut-off priced from both sides** — p50, p75, p90, p95, exactly at and $1 above (§D1: interior rows, not endpoints).
   Portfolio's floor under DF-4.
4. **Copy follows the household** — for a household below the median, none of "exceptionally strong", "You have all three", "virtually
   every dimension", "possess", "you'll live near"; the Bottom Line's position equals the headline's; the affluent sentence never pairs two
   verdicts. (Exact strings depend on DF-3.)
5. **Rows** — per DF-2, the removed rows are absent and the kept rows carry no tier; the column header says 55–64.
6. **Field Manual** — the Ranking entry no longer says the tiers are built from survey data, and names the rows that are compared with it.
7. **Harness** — the suite re-runs the Monte Carlo after each `applyLoadedData` and asserts, before any readiness check counts, that the
   rendered success rate changed between two households that must differ (the §0b trap made into a setup check, like `t37`'s IM group).
   The build also adds the trap to OPERATIONS §C.

Existing suites: `t73` C-3 gated per leg (DF-4), D-0's heading kept; `t4`'s signature words kept; `v611` registered. **Parity (`t2`) must
stay as v6.10 printed it** — no engine changes; `domdiff` does not read this tab.
**Negative controls** — `qa/tools/controls_v611_ranking.py`: restore the nine-way average; restore one fixed "TOP N%" row; restore the
header praise unconditionally; drop the net-worth median band; restore the portfolio floor; restore the Field Manual sentence; skip the
Monte Carlo re-run in the harness (the setup check must fire); plus the null control. Each must turn its named check red.

## 6. Out of scope — recorded

- The success-rate definition (paths ending above $800,000, L6636) — F-15b's family; it needs its own scope.
- The EBRI 47% / 25%, AALTCI 7% and Roth 10% figures, still carried unverified from before v6.10 (v6.10 DD-1 (c) not taken). They stay in
  "The broader context" box, each with its source, as now.
- The affluent card's interpolation between cut-offs (log-linear, and linear below the median) — kept; it is labelled "about".
- New peer groups, standard errors, per-state comparisons.
- The fallback-value path when the master prompt cannot be parsed (its ⚠ marks stay as they are).

## 7. Destination of this document

Repo `docs/SCOPE_F19R_RANKING_HEADLINE.md` (renamed `SCOPE_F20_RANKING_HEADLINE.md` if DF-0 (b)). **Not the pool yet:** a pooled scope needs
a manifest row and `package_check`'s I-2 allowlist entry, and the v6.11 build package adds both or retires it on arrival. Until then
`package_check` §I will list it as unclassified — expected.

## 8. Build record

*(Empty until built.)*

## 9. How each figure in this scope was produced (this session, 2026-10-13)

- Build identity: fresh `git clone` of `stextor/danger-close` at `7c9567b`; `md5sum src/DangerClose.jsx index.html` →
  `1b41119b…` / `93ff44d5…`, equal to the manifest's Current table. Pool listing: 131 files, as the manifest's v6.10 note says. The pool's
  source copy was **not** hashed byte-exact: the Projects tool returned it inline and truncated; its size, 1,404,088 bytes, equals the
  clone's.
- Run folder: `qa/mk_runfolder.sh v609 v610 --git` (prior resolved from commit `2f25660`, md5 `a32ef453…`); harness from the locked
  `qa/harness/` (jsdom 29.1.1). Baseline on v6.10: `t73` 56 passed, 0 failed; `t4` 253 passed, 0 failed.
- §1c, §0b and the §1d copy: a session-only probe (`probe_f19.mjs`, t73's harness idiom, sims re-run by a preset flip), on both legs.
- §1b: an enumeration of every tier combination the v6.10 code can assign.
- §1a, §2 line numbers: `funcmap.cjs`, `census.cjs`, and an AST literal walk restricted to the Ranking render (`rank_sites.cjs`).
- §2 suite census: an AST walk of every literal in `qa/`, each regex executed against the copy (`suite_lits_f19.cjs`).
- §1e: `DOCS_HTML()` read through the shim, raw.
- §0a: `git grep -n 'F-19'` over the documents (a prose search, not a code census).
