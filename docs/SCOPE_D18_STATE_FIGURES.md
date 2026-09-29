# SCOPE — a tax-year refresh of dated state figures, each figure carrying its year (D-18)

**DRAFT — 2026-09-29. NOT BUILDABLE YET: §1b (primary-source reading of 15 fixed-amount rows) is owed.** Target **v5.86**,
built from **v5.85** (source `a1d9c5e03e4aa7c059427fdf4fc84a98`, built `index.html` `7ff3d434fbfb13a32e3582870d991834`,
repo `917a6f7`). Freshness check (OPERATIONS §A/§A2) run this session: all 114 pool files byte-identical to a committed file.
**A modelling release** (Maine's cap moves; METHODOLOGY changes) with one presentation change (per-figure tax year).

---

## 0 · Decisions already made (Steve, 2026-09-29)

- **D18-A · Refresh year.** TY2026 now wherever published; a figure whose TY2026 value is unpublished stays at its latest
  published year and is disclosed as such (the v5.85 L-3 rule). RI stays TY2025.
- **D18-B · Breadth.** The indexed figures **plus** a primary-source check of all **23** rows that carry a dollar amount or
  threshold. The **42** nonzero rates are a separate follow-on (D-18b), not this release.
- **D18-C · Staleness signal.** Each dated figure carries its tax year, shown in the app. **No banner** — RI publishes a year
  in arrears, so a banner keyed to `asOfYear` would fire for RI every year.

## 1 · Premise — measured, and read from primary sources

### 1.0 · The shape of the table (v5.85, measured this session)

- `STATE_RULES` (L1127–1292) has **51** rows, evaluated through the shim (`__g.STATE_RULES()`), not read as text.
- **Every state dollar figure lives in the table.** An AST walk of `stateTaxAnnual` (L1326–1511) finds no numeric literal
  ≥ 100. A refresh is a data edit plus note text plus METHODOLOGY.
- **Nothing dates the table.** The only year constant is the federal `TAX_CONSTANTS_YEAR = 2026` (L870).
- **23** rows carry a dollar amount or threshold (`excl65 > 0`, `ssRule`, or `exclTest`). **Six** notes state which tax year
  their dollar figures come from — TY2025: ME, MT, RI; TY2026: CT, MD, MN. Twelve dollar rows state no year at all.
- **Finding — the display contradicts three notes.** My Data's state line (L12921, `MyDataEditor`) headlines every state
  **"Model (2026 approx)"**, then prints the note, which for ME, MT and RI says the figures are 2025. It is the only site
  that displays a row's `note` (`census.cjs note --kind=prop`: 3 hits, the other two are not state rows).
- **The Field Manual carries none of the figures.** Searched in the *evaluated* `DOCS_HTML` (151,840 characters; the probe
  sees "Maine" 5 times): zero hits for every dated figure. User-facing copy sites are the row notes and METHODOLOGY
  (a text search of that prose finds $48,216 three times).
- **§K1 — the example household is $0 here by construction.** It carries no `stateCode` (read through the shim;
  `PORTFOLIO.stateCode` is set only by the loader and wizard), so it takes the flat-rate fallback. **No example-household
  figure can be quoted as evidence;** evidence comes from fixture households placed in the affected state.

### 1a · The indexed and dated figures — read 2026-09-29

| State · figure | Model (v5.85) | TY2026 law | Primary source | Action |
|---|---|---|---|---|
| **ME** pension-deduction cap | $48,216 (TY2025) | **$49,824** — the annual SS benefit at full retirement age as of 1 Jan 2026 | Maine Revenue Services, 2026 Form 1040ES-ME instructions (rev. July 2026), line 2; 36 M.R.S. § 5122(2)(M-2) | **Change** |
| **ME** phase-out thresholds | $125,000 / $250,000 (TY2025) | Indexed after 2025; **TY2026 value not published** (no MRS publication found; one secondary site repeats the 2025 figures) | MRS, 2025 Form 1040ME general instructions | Keep; disclose TY2025 |
| **MT** 65+ subtraction | $5,660 (TY2025) | Base $5,500, indexed from TY2025; **TY2026 value not found** in two searches of DOR publications | Montana DOR, *Tax Simplification Resource Hub* | Keep; disclose TY2025; **build re-checks** |
| **MD** pension-exclusion cap | $40,600 (2026) | **$40,600 confirmed.** HB 707 (2026) would alter it for TY2026; only a February hearing is on record, and the Comptroller's guidance of 8 Apr 2026 (after sine die) still states $40,600 | Comptroller of Maryland, Tax Guidance KB0010012 | Keep; **build re-checks HB 707** |
| **RI** SS / pension AGI cliff | $107,000 / $133,750 (TY2025) | **Confirmed TY2025.** ADV 2025-22 is *titled* "for Tax Year 2026", but lists these thresholds under "The following items are for the 2025 Tax Year". TY2026 unpublished. Also confirms the **$50,000** cap from TY2025. | RI Division of Taxation, ADV 2025-22 (3 Nov 2025) | Keep; note is correct |
| **MN** SS subtraction thresholds | $86,410 / $110,780 (TY2026) | TY2026, indexed | MN DOR, *Tax Year 2026 Inflation-Adjusted Amounts* — read at v5.85 (`SCOPE_SS_STATES.md` §1), **not re-read this session** | Keep |
| **CT** pension/IRA band table | TY2026 table | Statutory, **not indexed**; full below $75K / $100K, gone at $100K / $150K; IRAs reach 100 % inclusion in TY2026 | CT DRS-162 (seniors flyer); OLR 2024-R-0130; CGS § 12-701(a)(20)(B) | Keep; **one band spot-checked** (OLR 2025-R-0152's $80,000-single example → 55 %, matches the `lt` row); **full table read owed at build** |

Also read at v5.85 from primary sources, the same day, and cited from `SCOPE_SS_STATES.md` §1 rather than re-read: the SS
rules' thresholds for CO ($75K / $95K, $20K), NM ($100K / $150K), UT ($54K / $90K, 2.5 ¢), VT ($55K / $70K, not indexed).

### 1b · Fixed-amount rows — primary-source reading OWED (not done this session)

These amounts move only by new legislation, so each needs one read of the statute or revenue department to confirm it is
still current for TY2026, and whether any is indexed. **None has been read yet.**

| Row | Model figure(s) | Read |
|---|---|---|
| AL | $6,000 65+ IRA/401(k) exclusion | Ala. DOR / Code of Ala. |
| AR | $6,000 retirement exclusion | Ark. DFA |
| CO | $24,000 (65+) / $20,000 (55–64) pension subtraction | CO DOR (the SS half was read at v5.85) |
| DE | $12,500 from 60 | Del. Division of Revenue |
| GA | $65,000 (65+) / $35,000 (62–64) | GA DOR — **pinned by the verification check at L1716** |
| KY | $31,110 per person | KY DOR; **is it indexed?** |
| LA | $6,000 65+ | LDR |
| NJ | pension-exclusion bands (N.J.S.A. 54A:6-10) | NJ Division of Taxation |
| NM | $8,000 65+ exemption bands | NMSA 7-2-5.2 (the SS cliff was read at v5.85) |
| NY | $20,000 from 59½ | NY DTF |
| OK | $10,000 | OTC |
| SC | $15,000 (65+) / $10,000 | SCDOR |
| VA | $12,000; $50,000 / $75,000 taper | Va. Tax |
| WV | $8,000 65+ | WV Tax |
| WI | $24,000 from 67 (2025 Act 15) | WI DOR |

## 2 · The change

- **A · Maine's cap** $48,216 → **$49,824** (TY2026). Thresholds stay TY2025 (D18-A).
- **B · Each dated figure carries its tax year** (D18-C). Proposed shape: a `years` map on each dollar-bearing row, keyed by
  the field holding the figure — e.g. ME `years: { excl65: 2026, exclTest: 2025 }`. Year-in-note-text alone is untestable,
  which is why the proposal is a field. The My Data line (L12921) replaces the blanket "Model (2026 approx)" with each
  figure's year (D18-1 settles the wording for rates).
- **C · Disclosures.** Each changed row's `note`; METHODOLOGY's state section (three $48,216 sites); `MissingFeatures.md`
  D-18 → fixed, with the recurring refresh noted; plus any §1b corrections (D18-2).

## 3 · Site census (v5.85, AST)

`STATE_RULES` L1127–1292 — rows ME L1177–1181, MT L1188–1192, MD L1182, RI L1260, CT L1149–1164, MN L1185, CO L1133,
NM L1228–1252, KY L1175, GA L1168. Display L12921 (`MyDataEditor`). Verification checks L1716–1719 (`buildVerificationChecks`;
L1716 pins GA's $65,000). `stateTaxAnnual` L1326–1511 — expected unchanged.

**Suite literals on the dated figures** (`lits.cjs` over the pooled suites): **moving** — `t10` L888 and `t39` L96 pin ME
$48,216 → version-gate (`_v >= 586 ? 49824 : 48216`). **Not moving** — `t10` L887 (MD), `t39` L112 (MT), and RI's
$107,000 / $133,750 in `t10`, `t34`, `t35`, `t50`. **Owed at build:** derived pins (dollar figures computed *from* $48,216
in `t39`'s phase-out cases) are invisible to a literal walk — `literal_census.cjs` between the two sources, and `ast` for
the Python suites.

## 4 · Tests (written first, run against v5.85, where they must fail)

A new suite (proposed `t51_state_figure_years.mjs`):
1. **Values** — every §1a/§1b figure equals its value typed from the primary source, never read from the app.
2. **Extinction** — every dollar figure in a dollar-bearing row has a recorded tax year; no year exceeds `asOfYear`; a row
   cannot gain a dollar field without a year.
3. **Display** — the My Data line shows each figure's year and never the blanket "(2026 approx)" label.
4. **Maine end-to-end** on fixture households (not the example — §1.0): below / at / above the cap, with the SS offset,
   and across the phase-out; dollar-exact by hand.

Moved pins version-gated, never edited silently. Negative controls, mutating the source and rebuilding.

## 5 · Out of scope

The 42 rates (follow-on D-18b; KY's own note says "check the year"); a staleness banner (D18-C); head-of-household and
married-filing-separately thresholds; Engine A's `single: !!P.single` filing status (recorded at v5.85); D-20.

## 6 · Open decisions for Steve

**D18-1 · What the My Data line says about the rate.** Rates are not verified this release. (a) **Show a year only for
figures verified with one**; the rate reads as an approximation with no year; (b) show 2026 on everything. A displayed
year is a claim, and (b) would make it for 42 figures nobody read. **Recommend (a).**

**D18-2 · If §1b finds a fixed amount has changed, does the fix ship in v5.86?** (a) **Yes** — same row, same kind of
correction, as Utah's rate rode with v5.85 (L-4); (b) file it separately. **Recommend (a).**

## 7 · Status

Draft. Next: read §1b from primary sources; settle D18-1 and D18-2; then build per OPERATIONS (test first, shown failing on
v5.85).
