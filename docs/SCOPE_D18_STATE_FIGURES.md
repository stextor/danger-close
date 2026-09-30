# SCOPE — a tax-year refresh of dated state figures, each figure carrying its year (D-18)

**READY TO BUILD — 2026-09-29.** Premise read from primary sources for all 23 rows (MN, UT, VT and CO's cap via the v5.85 scope, same day, cited not re-read); decisions D18-A–C, D18-1, D18-2 settled;
the build-time re-checks are gathered in §3a. Target **v5.86**,
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
- **D18-1 · The rate carries no year** (settled 2026-09-29, as recommended). A year is shown only for a figure verified
  against a primary source; the rate reads as an approximation. See §6.
- **D18-2 · §1b corrections ship in v5.86** (settled 2026-09-29, as recommended). See §6.

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

### 1b · Fixed-amount rows — all 15 read 2026-09-29

| Row | Model | TY2026 law | Source (primary unless marked) | Result |
|---|---|---|---|---|
| **LA** | $6,000 at 65+ | **$12,000 from TY2025, indexed by CPI-U from 1 Jan 2026; TY2026 = $12,324** | R.S. 47:44.1 (legis.la.gov, 2026 RS text); LDR Notice of Intent, LAC 61:I.1311 (worked example: "$12,324 (the inflation adjusted amount for tax year 2026)"); LDR FAQ; RIB 25-012 (Act 11, 2024 3rd Ex. Sess.) | **CHANGE → $12,324.** The notice is a proposed rule; the build confirms LDR's posted TY2026 figure. **Owed at build:** the statute covers "pension and annuity income" — whether IRA distributions qualify decides what the exclusion applies to |
| **SC** | $15,000 at 65+ | $15,000 at 65+, reduced by the retirement deduction; retirement deduction **$3,000 under 65**, $10,000 at 65+ | SCDOR retiree tax tips; SCTIED ch. 3 (Sept 2025); SC4972 instructions | Value correct. **Note text wrong:** it says the under-65 alternative is "$10K"; it is $3,000 → **correct the note** |
| **GA** | $65,000 / $35,000 | $65,000 / $35,000 through TY2026; **$70,000 at 65+ from TY2027** | O.C.G.A. § 48-7-27 (version effective until 1 Jan 2027, via Justia) | Confirmed; L1716's check unchanged. TY2027 noted for the next refresh |
| **KY** | $31,110 | $31,110, **fixed since TY2018, not indexed** | KRS 141.019 (amendment text, apps.legislature.ky.gov); KY DOR individual income tax page | Confirmed. HB 146 (2025 RS, → $41,110 for 2026) referred to committee only (KPPA status chart; LegiScan). **A 2026-RS refile was not checked — build re-checks** |
| **AL** | $6,000 at 65+ | $6,000 (Code § 40-18-19(a)(13), from 2023) | ADOR 2025 Form 40NR; statute via PolicyEngine issue #9552 *(secondary quoting Act 2022-294)* | Confirmed. HB 388 (2025, → $12,000 from 2026) **dead** — last action 1 May 2025 (LegiScan). 2026-RS refile not checked — build re-checks |
| **AR** | $6,000 | $6,000, not indexed; IRA from 59½, employer plans at any age | A.C.A. § 26-51-307 (Justia 2024); DFA Subject 206 | Confirmed. Model applies from 65 — conservative; a disclosure item, not this release |
| **CO** | $24,000 / $20,000 | shared with the SS subtraction | CO DOR — read at v5.85 (`SCOPE_SS_STATES.md` §1), **not re-read** | Confirmed at v5.85 |
| **WV** | $8,000 at 65+ | $8,000 (W. Va. Code § 11-21-12(c)(9)) | tax.wv.gov, *Senior Citizen Social Security Modification* | Value confirmed. **Finding — see §1c** |
| **WI** | $24,000 from 67 | $24,000 from 67, not indexed (2025 Act 15) | WI DOR Tax Bulletin 230; 2025 Form 1 instructions | Confirmed |
| **OK** | $10,000 | $10,000 for TY2026; HB 2968 (2026, → $20,000 from TY2027) at introduction | OTC bill-impact statement (HB 1927, Apr 2025: "under current law … $10,000"); House bill summary HB 2968 | Confirmed |
| **NY** | $20,000 | $20,000 from 59½, fixed | tax.ny.gov, *Information for retired persons* | Confirmed (S2571A reported not enacted — secondary). **Owed at build:** the note says 59½; check which age the model applies |
| **DE** | $12,500 from 60 | $12,500 from 60 (30 Del. C. § 1106(b)(3)) | legis.delaware.gov, HB 108 bill detail | Confirmed. HB 108 (→ $25,000 from TY2025) never left House Revenue & Finance — no committee report, no roll call; the 153rd GA has ended. SB 219 (passed 2026) raises only the **military** pension exclusion, which the model already discloses it does not model |
| **NJ** | band table (joint / single) | ≤ $100,000 total income: full, up to $100,000 / $75,000; $100,001–125,000: 50 % / 37.5 %; $125,001–150,000: 25 % / 18.75 %; above: none. Fixed since 2020/2021, not indexed | NJ Division of Taxation, *Retirement Income Exclusions* (njit7); NJ Treasury pension fact sheet 12 | **Confirmed, every modelled row.** The row carries no `cmp` — the build's boundary test must show exactly $100,000 taking the full exclusion ("$100,000 or less") |
| **NM** | $8,000 bands | Statutory table unchanged "for any taxable year beginning on or after January 1, 1987" in the existing-law text quoted by bills through 2019 | nmlegis.gov: SB 627 (2004) — **single table in full**; HB 477 (2019) — **joint rows 1–3**; joint rows 4–9 as read at v5.63 (`oracle_nm.py`, typed from `FINDINGS-v5_63-state-statutes.md` §2) | Confirmed as far as read. **Build re-checks** the current NMSA text for any amendment after 2019 |
| **VA** | $12,000; $50K / $75K taper | $12,000 at 65+, reduced $1 per $1 of AFAGI (FAGI minus Social Security) over $50,000 / $75,000; fixed | Va. Code § 58.1-322.03(5)(b), law.lis.virginia.gov (current) | Confirmed |

### 1c · Findings outside D-18 (recorded, not fixed here)

- **WV — the $8,000 is not additive to the Social Security modification.** Per the Tax Division, a taxpayer receives the
  *higher* of the $8,000 or the sum of other modifications including Social Security, and from TY2026 Social Security is fully
  exempt. A retiree whose benefit is $8,000 or more gets nothing further; the model grants both — **optimistic by up to
  $8,000 per person per year**. This is a modelling rule, not a stale figure, and the obvious mechanism (`ssOffset`) is
  reserved for MD/ME by a v5.56 decision — **file it as its own entry for Steve; do not fold into D-18.**
- **Rates for D-18b (secondary sources; unread at primary):** GA 5.19 % → **4.99 %** retroactive to TY2026 (HB 463, May 2026);
  OK 4.75 % → **4.5 %** (HB 2764). The remaining 40 are unmeasured.
- **Next refresh, already known:** GA $70,000 at 65+ from TY2027.

## 2 · The change

- **A · Figures.** Maine's cap $48,216 → **$49,824** (TY2026; thresholds stay TY2025, D18-A). Louisiana's exclusion $6,000 →
  **$12,324** (TY2026; D18-2). South Carolina's note corrected ($3,000 under 65). (The four last-read rows — DE, NJ, NM, VA — turned up no change.)
- **B · Each dated figure carries its tax year** (D18-C). Proposed shape: a `years` map on each dollar-bearing row, keyed by
  the field holding the figure — e.g. ME `years: { excl65: 2026, exclTest: 2025 }`. Year-in-note-text alone is untestable,
  which is why the proposal is a field. The My Data line (L12921) replaces the blanket "Model (2026 approx)" with each
  figure's year (D18-1 settles the wording for rates).
- **C · Disclosures.** Each changed row's `note`; METHODOLOGY's state section (three $48,216 sites); `MissingFeatures.md`
  D-18 → fixed, with the recurring refresh noted; plus any §1b corrections (D18-2).

## 3 · Site census (v5.85, AST)

`STATE_RULES` L1127–1292 — rows ME L1177–1181, MT L1188–1192, MD L1182, RI L1260, CT L1149–1164, MN L1185, CO L1133,
NM L1228–1252, KY L1175, GA L1168, LA L1176, SC L1261, WV L1289, DE L1165, NJ L1196–1227, VA L1267–1287, NY L1253. Display L12921 (`MyDataEditor`). Verification checks L1716–1719 (`buildVerificationChecks`;
L1716 pins GA's $65,000). `stateTaxAnnual` L1326–1511 — expected unchanged.

**Suite literals on the dated figures** (`lits.cjs` over the pooled suites): **moving** — `t10` L888 and `t39` L96 pin ME
$48,216 → version-gate (`_v >= 586 ? 49824 : 48216`). **Not moving** — `t10` L887 (MD), `t39` L112 (MT), and RI's
$107,000 / $133,750 in `t10`, `t34`, `t35`, `t50`. **Owed at build:** derived pins (dollar figures computed *from* $48,216
in `t39`'s phase-out cases, and any all-states sweep touching LA) are invisible to a literal walk. No suite line pins LA's
$6,000 with LA named on it — `literal_census.cjs` between the two sources, and `ast` for
the Python suites.

### 3a · Re-checks owed at build (gathered from §1 so none is lost in a table cell)

1. **LA** — confirm LDR's *posted* TY2026 figure ($12,324 is from a proposed-rule example); read whether IRA distributions
   are "annual retirement income" under R.S. 47:44.1.
2. **ME** — TY2026 phase-out thresholds (unpublished at scoping). **MT** — TY2026 subtraction (unpublished at scoping).
3. **KY, AL** — 2026-session refiles of the dead 2025 bills. **MD** — HB 707 (2026). **NM** — amendments to 7-2-5.2 since 2019.
4. **CT** — the band table read in full (one band spot-checked at scoping).
5. **NJ** — boundary at exactly $100,000. **NY** — which age the model applies (the note says 59½).
6. **Suite** — derived pins on ME's $48,216 and on LA via `literal_census.cjs`; Python suites by `ast`.

## 4 · Tests (written first, run against v5.85, where they must fail)

A new suite (proposed `t51_state_figure_years.mjs`):
1. **Values** — every §1a/§1b figure equals its value typed from the primary source, never read from the app.
2. **Extinction** — every dollar figure in a dollar-bearing row has a recorded tax year; no year exceeds `asOfYear`; a row
   cannot gain a dollar field without a year.
3. **Display** — the My Data line shows each figure's year and never the blanket "(2026 approx)" label.
4. **Maine and Louisiana end-to-end** on fixture households (not the example — §1.0): below / at / above the cap, with the SS offset,
   and across the phase-out; dollar-exact by hand.

Moved pins version-gated, never edited silently. Negative controls, mutating the source and rebuilding.

## 5 · Out of scope

The 42 rates (follow-on D-18b; KY's own note says "check the year"); a staleness banner (D18-C); head-of-household and
married-filing-separately thresholds; Engine A's `single: !!P.single` filing status (recorded at v5.85); D-20.

## 6 · Decisions (both settled 2026-09-29, as recommended)

**D18-1 · What the My Data line says about the rate.** Rates are not verified this release. (a) **Show a year only for
figures verified with one**; the rate reads as an approximation with no year; (b) show 2026 on everything. A displayed
year is a claim, and (b) would make it for 42 figures nobody read. **Recommend (a).** ✅ *Settled: (a).*

**D18-2 · If §1b finds a fixed amount has changed, does the fix ship in v5.86?** (a) **Yes** — same row, same kind of
correction, as Utah's rate rode with v5.85 (L-4); (b) file it separately. **Recommend (a).** ✅ *Settled: (a).*

## 7 · Status

Ready to build. §1 complete: two value changes (ME cap, LA), one note correction (SC), the rest unchanged — of which
ME's thresholds, MT and RI are kept at their latest published year (TY2025) and disclosed, not confirmed for TY2026. Separately: put §1c's WV
finding to Steve as its own entry — it does not block this build per OPERATIONS (test first, shown failing on
v5.85).
