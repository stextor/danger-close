# SCOPE — v6.12 · C-5: the Withdrawal tab's Bracket column taxes Social Security by the IRS worksheet, on the household's own filing status

**FULFILLED — shipped as v6.12 (2026-10-14).** Repo-only. §7 is the build record; §6 lists what the build changed from this document. C-5 closes.

*(Superseded status line, retained:)* **DRAFT — 2026-10-14, awaiting Steve's decisions (§5).** Repo-only. A MODELLING release (METHODOLOGY
changes), whose reach is one displayed column: by census, nothing outside the Withdrawal tab's **Bracket** column can move (§0.2).
Steve, 2026-10-14: *"Yes"* (to "Shall I scope C-5?"); then *"Let's use your recommendations for decisions §5"*.

## 0 · Premise (verified at v6.11, not assumed)

**Freshness (OPERATIONS §A).** Fresh clone of `origin/main` at `8e5133a` (v6.11 and its chmod). Source `35f3c6560cf8da1b984de77e07a4cf8b` and
built `index.html` `ff3c5d7ee91595a4f4634a4aa56f4103` both equal the manifest's Current table. The pool was verified against v6.11 earlier the
same day (that verification's limit stands: 7 of the 67 uploaded pool files byte- or content-compared). The tag `v612` is free: `vercensus.cjs v612`
over `qa/` and `src/` finds 0 sites, and no `dom_entry_v612.jsx` exists in history.

### 0.1 · The law (primary sources, read 2026-10-14)

- **Taxable Social Security, 26 U.S.C. §86** (Cornell LII). Base amount $25,000 single / $32,000 joint (§86(c)(1)); adjusted base amount
  $34,000 / $44,000 (§86(c)(2)); the 50% tier is the lesser of half the benefits and half the excess over the base (§86(a)(1)); above the adjusted
  base, the lesser of 85% of the excess plus the carried-up amount, or 85% of the benefits (§86(a)(2)). The amounts are statutory and not indexed.
  Danger Close already computes this rule line for line from the IRS worksheet in one helper, `taxableSS86` (L983–1000, v5.77).
- **2026 brackets and standard deduction, Rev. Proc. 2025-32** (read through KPMG's summary of it). Single 10% to $12,400, 12% to $50,400, 22% to
  $105,700, 24% to $201,775, 32% to $256,225, 35% to $640,600; joint $24,800 / $100,800 / $211,400 / $403,550 / $512,450 / $768,700. Standard
  deduction $16,100 single, $32,200 joint. **Every figure equals `TAX_CONSTS`** (printed through the test shim, 2026-10-14).
- **The age-65 additional deduction** ($1,650 per spouse joint, $2,050 single) is the app's own constant (`SENIOR_EXTRA_MFJ` / `_SGL`), carried
  by `t41` and the in-app constants audit. **Not re-read against the Rev. Proc. this session:** the two summaries consulted do not carry it. The
  build session reads it at the primary source before relying on it.
- **Filing status after a death, IRS Pub. 501.** *"If your spouse died during the year, you are considered married for the whole year"* and
  *"can choose married filing jointly"*; for the next two years a surviving spouse with a qualifying dependent child may file as a qualifying
  surviving spouse, and otherwise files Single. The app models no dependent children, so Engines A, B and C and the Roth tab treat the survivor
  as **Single from the year after the first death** (`yr > deathYr1`: L4711, L6196, the Roth tab's `_filingSingleAt` at L10020; `t14`'s
  `filingEngines` asserts it for A, B and C).

### 0.2 · What Engine D does (parser census on `src/DangerClose.jsx`; `census.cjs`, `funcmap.cjs`, `lit085.cjs`, `textsites.cjs`)

Engine D is `computeWithdrawalPlan` (L5488–5998), the Withdrawal tab. Its tax block, L5933–5949:

```js
const taxableSS = (ssA_y + ssB_y) * 0.85;
const magi = taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y; // tax-free streams excluded
const _bThr = (i) => TAX_CONSTS.MFJ_STD + TAX_CONSTS.MFJ_BR[i].upper;
const bracket = magi < TAX_CONSTS.MFJ_STD ? 0 : magi < _bThr(0) ? 10 : magi < _bThr(1) ? 12 : magi < _bThr(2) ? 22 : magi < _bThr(3) ? 24 : 32;
```

The register (`FlawsToFix-v5_73-Phase2.md`, C-5) names three faults. The census finds two more:

1. **85% of Social Security is taxable in every year**, whatever the household's other income. Engines A, B and C and the Roth tab have all
   called the worksheet helper since v5.77.
2. **The joint table for every household**: a single household in every year, and a widowed survivor in every year after the first death.
3. **The 2026 thresholds, never indexed,** against a MAGI that is nominal (Social Security COLA'd, expenses inflated). Every other engine
   indexes thresholds at 2%/yr from `asOfYr`.
4. **No age-65 additional deduction** (the source comment says *"rough; no senior extras"*).
5. **Capped at 32%** (the 35% and 37% bands cannot show), and the input includes realized capital gain, a simplification disclosed only in a
   source comment (L5942–5945).

**Reach.** `taxableSS` feeds `magi` only; `magi` feeds `bracket` only; `bracket` has **one** reader, the Withdrawal table's Bracket cell
(L9842). The schedule's `magi` field has no UI reader: the `.magi` reads at L10424 and L10526 are the Roth tab's own rows, and L11206 is
Engine C's. The bridge to Engines B and C (`withdrawalPlanSeries`, L6042) carries `capGain_y` and `ordDraw_y` only. No balance depends on
`magi`: it is computed after every balance update in the year and read by nothing else in the loop. **So the Taxes tab, the IRMAA tab, the Roth
tab, the Monte Carlo and every balance on the Withdrawal tab cannot move.** The prototype run (§0.4) confirms this.

**Disclosure.** None of the five faults is disclosed in the app. The tab's footnote says only *"Tax bracket estimates are approximate"*
(L9997). Worse, My Data tells a single household *"Single household: taxes use Single brackets"* (L13345), which is false on this tab.

### 0.3 · Measured (session-only probe, `probe_c5.mjs`, against the shipped v6.11 module; layers added one at a time)

The probe first rebuilds Engine D's column from each row and reproduces it **in every year of all five households**. Only then is any layer trusted.

| household (base scenario, no conversions) | years | §86 alone | + filing status | + indexed | + age-65 extra | + ordinary-only (the recommendation) |
|---|---|---|---|---|---|---|
| Example, as shipped (married; first death 2044) | 25 | 2 | 11 | 7 | 11 | **11** |
| Example made single | 16 | 0 | 16 | 16 | 16 | **16** |
| Modest couple (example × 0.3) | 25 | 12 | 12 | 13 | 17 | **17** |
| Modest single (example × 0.3) | 16 | 7 | 15 | 16 | 16 | **16** |
| Large single (example × 2) | 16 | 0 | 16 | 15 | 13 | **13** |

*(Each cell counts the years whose bracket differs from the shipped column. The layers interact, so the counts are not additive. A cell reads
"§86 alone: 0" where the household's other income is high enough that the 85% cap binds anyway.)*

**The error runs in both directions, on the same household:**

- **Married years: too high.** On the example, 2031–2036 show 12% where the correct figure is 10%, and 2042–2043 show 22% where it is 12%. On the
  modest couple the portfolio is spent by 2042. From then to 2053 the household lives on Social Security and the column shows 10–12%, while its
  taxable income is below the standard deduction: the correct figure is 0% in all twelve years. Over the plan the flat 85% treats $880,451 more
  Social Security as taxable than the worksheet does (the example: $254,632).
- **Survivor and single years: too low.** On the example, the survivor's 2045–2047 show 12% where Single filing gives 22%. The **widow's
  penalty**, which the Taxes, Survivor and Roth tabs and the Field Manual all stress, never appears on this tab. The example made single shows 12%
  in all 16 years; the correct figure is 22% in every one.

The register's grading, *"Low · varies"*, understates this. The column carries no dollar figure, but on these five households it is wrong in
**73 of 98 years**, and in the single and survivor years it is wrong in the direction this app exists to avoid. I'd restate it as
**low–medium, display only, both directions**.

**Hand-verified to the dollar** (shipped engine's own row inputs, worked by hand on the worksheet; `projectBracketsAt` for the thresholds):

- **2032, the example (joint, both alive).** Benefits $59,862.90; other income $36,413.71 (pension $4,800 + Traditional draw $25,189.10 +
  Other-account ordinary draw $6,309.16 + gain $115.45). Line 2 $29,931.45; line 7 $66,345.16; line 9 $34,345.16; line 10 $12,000; line 11
  $22,345.16; line 13 $6,000; line 14 $6,000; line 15 $18,993.39; line 16 $24,993.39; line 17 $50,883.47. **Taxable SS $24,993.39** against
  the flat $50,883.47. Deduction: $32,200 × 1.02⁶ = $36,262, plus two age-65 extras of $1,858 = **$39,978**. Taxable income
  $61,407.10 − $39,978 = $21,429.10, under the indexed 10% top of $24,800 × 1.02⁶ = $27,929, so **10%**. The engine shows 12%.
- **2045, the example (survivor B, 79, Single).** Benefits $61,027.86; other income $72,767.48 (pension $4,800 + RMD $67,967.48). Line 7
  $103,281.41 > line 8 $25,000; line 16 $63,389.20 > line 17 $51,873.68, so **taxable SS $51,873.68** (the cap binds; here only the table is wrong).
  Deduction: $16,100 × 1.02¹⁹ = $23,455, plus one age-65 extra of $2,986 = **$26,441**. Taxable income $98,200.17, above the indexed 12% top of
  $73,423 and under the 22% top of $153,985, so **22%**. The engine shows 12%, because it reads MAGI $124,641 against the 2026 joint $133,000.

### 0.4 · The prototype (session-only, never shipped): the full suite against §1's design

The recommended design (§1, with DC-1 (a) and DC-2 (a)) was applied to a scratch copy of the v6.11 run folder; the full suite then ran against
it, with `app_testable.mjs`, `dom_bundle.cjs` and the root `DangerClose.jsx` aliased to the prototype. Results:

- **Its column equals the probe's last layer in all 98 household-years**, and its MAGI equals worksheet-taxed MAGI to the cent. The probe and the
  design are two routes to the same figure.
- **The runner's own totals: 6,832 passed, 10 failed** (tooling included), parity 10/0, no suite died. The ten red checks are `t14` 1,
  `t19` 4, `t20` 2, `t40` (v611 leg) 2 and `domdiff` 1. Each is explained in §2.3, and all are reached through the three names the census found
  (`magi`, `bracket`, the death-year comparison). Every other suite is green on both legs, including `t12` (Engine D's survivor suite) and `t43`.
- The layout suites (`t45`, `t47`, `t48`) render the shipped `index.html`, so the prototype tells them nothing. The prototype changes no copy
  anyway; the build runs them against its own page.

## 1 · The change (recommended options)

In `computeWithdrawalPlan` only:

1. **Filing status for the year:** `const _filingSingleD = _tlW.single || yr > _deathYr1D;`. This is Pub. 501, and the same `>` that Engines A,
   B and C and the Roth tab use. The death **event** stays `>=` (the survivor's benefit and spending change in the death year, as now). Beside
   `_deathYr1D`: `const _survivorIsAD = _tlW.single || ((_dobAYr + _tlW.lifeExpA) >= (_dobBYr + _tlW.lifeExpB));`, Engine C's rule.
2. **Taxable Social Security by the shared helper:** `taxableSS = taxableSS86(ssA_y + ssB_y, _ordOtherD + capGain_y, _filingSingleD)`, where
   `_ordOtherD = pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y`, the same terms as today, written once.
   `magi = taxableSS + _ordOtherD + capGain_y`, the same composition. Realized gain stays in provisional income, as §86 requires and as Engines B
   and C already have it.
3. **Brackets from the one module-level projection:** `projectBracketsAt(yr, { asOfYr: _tlW.asOfYear, filingSingle: _filingSingleD,
   survivorIsA: _survivorIsAD, ageA, ageB, irmaaUpper0 })`. This is the Roth tab's year-by-year projection (L6026, hoisted at v5.75 and tested by
   `t41`): the filing status's 2026 table, and its standard deduction plus the age-65 extra for the filer only on a Single return (through
   `seniorExtraFor`), indexed 2%/yr. Engine D gains **no bracket figures of its own**: `MFJ_STD` and `MFJ_BR` leave the function. (`irmaaUpper0`
   is passed as the tier-0 threshold for the year's filing status, so no field of the result is garbage; Engine D does not read it.)
4. **The rate:** taxable ordinary income `taxableSS + _ordOtherD − stdDed` (DC-1). The first bracket whose top it does not exceed gives the rate,
   which is Engine B's rule (`marginalBracket`, L6121). Zero or less shows 0%. The 35% and 37% bands become reachable.
5. **Publish `ssTaxable` on each row**, the name Engine B's rows already use for the same quantity. No figure reads it; `t19`, `t20`, `t40` and the
   new suite do.
6. **Copy.** A sentence in the table's description says what the column is (DC-3). METHODOLOGY's v5.77 passage (*"every engine calls it: …"*)
   gains the Withdrawal tab, plus a short v6.12 section. The three adjacent stale sentences are DC-4.

## 2 · Site census

### 2.1 · App (parser, v6.11 line numbers; re-run at the build and recorded in §7)

| Site | Line(s) | Change |
|---|---|---|
| `computeWithdrawalPlan`, beside `_deathYr1D` | L5511 | add `_survivorIsAD` |
| `computeWithdrawalPlan`, the tax block | L5933–5949 | §1 items 1–4; the comments at L5935 and L5942–5947 are rewritten (both describe the flat 85% and the joint table) |
| `computeWithdrawalPlan`, the row | L5986 | add `ssTaxable` |
| Withdrawal tab, table description | L9800–9808 | DC-3 |
| Withdrawal tab, Bracket cell | L9842 | unchanged (it reads `r.bracket`; its colour thresholds 22/24 still mean the same) |
| IRMAA tab footnote | L11220 | DC-4: *"the simplified 85%-of-SS assumption"* is false since v5.77 (Engine C calls `taxableSS86`, L5412) |
| Taxes tab footnote | L11124 | DC-4: *"Federal brackets are MFJ inflated 2%/yr"* is false in single and widowed years (Engine B switches on `effSingle`, L6197–6199) |
| Roth tab assumptions | L10494 | DC-4: *"SS taxation: 85% taxable when provisional income > $44K"*. The ladder calls the worksheet helper (L10189); "85% taxable" overstates it |
| My Data, single household | L13345 | **none**: *"taxes use Single brackets"* becomes true |
| Field Manual, Withdrawal entry (`DOCS_HTML`) | one line, L4497 | DC-3 (b) only. It does not mention the column today, so nothing in it is false. If edited: quote-free anchors, passage printed back (§C0) |
| Version bump | four in-app sites | v6.11 → v6.12 |

**Extinction census (`lit085.cjs`).** Eight `0.85` literals in the source. Two are the helper's worksheet lines (L996, L998) and one is Engine D's
L5934. The other five are state-table properties (L1165, L1171) and success-rate comparisons (L8965, L11501, L12229), none of them a product.
After the change, **every `× 0.85` product in the source sits inside `taxableSS86`**: a structural statement the new suite can assert exactly.

### 2.2 · What cannot move (asserted by the new suite, not assumed)

Every schedule field except `magi`, `bracket` and the new `ssTaxable`; `withdrawalPlanSeries`; every Engine A, B and C output; Monte Carlo parity
(10/10). Engine D computes `magi` after every balance update and reads nothing back from it. That is why the prototype's other suites stayed green.

### 2.3 · Suites (from the prototype run, §0.4; their own output)

| Suite | Red on the prototype | Why | Treatment |
|---|---|---|---|
| `t14` | `Engine D [EXTINCTION]: NO weakened > guard` | Engine D gains a real filing switch | **Move Engine D into `filingEngines`**, as the suite's own note (L163) instructs: death event `const _widowedD = yr >= _deathYr1D`, filing switch `_tlW.single \|\| yr > _deathYr1D`. The new extinction: exactly **one** `yr > _deathYr1D` in the window, and it is the filing switch. A weakened spending or benefit guard still fails |
| `t19` | three source checks that locate the MAGI expression by its text; the mixed pool's lifetime MAGI pin ($3,191,209 → **$2,960,678** on the prototype) | expression rewritten; worksheet SS | re-point the source checks to `_ordOtherD`'s declaration and keep their meaning (brokerage draws excluded; every component named). Re-pin MAGI per leg from the new suite's oracle, not from the prototype's output |
| `t20` | the annuity's lifetime ordinary excess ($724,266 pin; reads $1,016,291) and the HSA-vs-taxable check | both read "ordinary income" as `magi − gain`, which held only while SS was a flat 85% | on the new leg use `magi − gain − ssTaxable` (its original meaning). Gated per leg |
| `t40` | A1 ($352,485 lifetime draw; reads $157,941) and the per-row residual identity | the residual is defined with `0.85 × SS` | on the new leg use `ssTaxable`; the $352,485 itself does not move (the draws are untouched). Gated per leg |
| `t43` | none | its E-1 (only the helper reads the §86 thresholds) passes, because Engine D read no thresholds | **extend E-2**: Engine D calls the helper (new leg) |
| `domdiff_withdrawal` | in the runner as tooling (outside the app total), and also run by hand on both pairs: shipped v610 → v611 32/0, prototype 31/1. The one red is the Withdrawal tab's byte-identity, first differing in the Bracket cells; Taxes and IRMAA stay identical | the Withdrawal table's Bracket cells change; the DC-4 copy changes in two other tabs | re-point v611 → v612 and re-scope: Withdrawal tab identical **outside** the Bracket cells and the description sentence (excised by anchor). Taxes and IRMAA figures identical. The Taxes year-table region ends at "Estimates only", before the footnote DC-4 edits; the IRMAA region's anchors are checked against the edited footnote at the build |
| layout `t45`/`t47`/`t48` | (not informative on the prototype) | copy lengthens if DC-3/DC-4 | run against the build's own page |
| version registration | — | `v612` | `vercensus v611` at the build; the usual hand registrations (t1, t4, t33 PINS, the three Python lists), `dom_entry_v612.jsx`, runsuite lines |

## 3 · Tests — new `qa/t75_engine_d_ss86.mjs`, both legs (the v6.11 leg pins the defect, the v6.12 leg asserts the fix)

- **A · Independent oracle.** The suite carries its own worksheet, its own 2026 tables transcribed from Rev. Proc. 2025-32, its own 2% indexing,
  its own age-65 extra and its own Pub. 501 filing rule. It takes from the engine only the row's income terms. On the v6.12 leg it reproduces
  `ssTaxable` and `magi` to the cent and `bracket` in every year. On the v6.11 leg it must reproduce the defect's form instead (flat 85%, joint,
  unindexed, capped) and **fail** to reproduce the fix, so the fixtures exercise the change. Households: §0.3's five, plus a survivor under 65 (the
  extra must not apply), spouse A as survivor (the `_survivorIsAD` branch), a year with a big realized gain (DC-1's edge), a conversion slider
  above 0, and a 35%-band year.
- **B · Hand-verified pins.** 2032: taxable SS $24,993.39, bracket 10%. 2045: $51,873.68, 22%. The modest couple's 2042: 0%.
- **C · What cannot move.** v6.11 → v6.12, every schedule field except `magi`/`bracket`/`ssTaxable` identical to the cent on every household;
  `withdrawalPlanSeries` identical; Engine B and C rows identical.
- **D · Structural extinctions (AST).** Engine D calls `taxableSS86` and `projectBracketsAt`; reads no `MFJ_BR`, `MFJ_STD`, `SGL_BR` or `SGL_STD`;
  every `× 0.85` product in the source is inside `taxableSS86`.
- **E · DOM.** The Withdrawal tab's Bracket cells for the example (2032: 10%, 2045: 22%); the description sentence; under DC-4 (a), the three stale
  sentences absent and their replacements present.
- **Negative controls, `qa/tools/controls_v612_c5.py`** (repo-only, release-pinned). K0 unmutated. K1 back to flat 85%. K2 the joint table for
  every household. K3 the death year filed Single (`>=`). K4 indexing dropped. K5 the age-65 extra dropped. K6 the gain back in the bracket input
  (if DC-1 (a)). K7 a private `× 0.85` copy planted in another function. K8 the oracle stops applying the filing switch (a test mutant). Each must
  turn its named checks red.

## 4 · Out of scope, and stop conditions

**Out (recorded):**
- **The OBBBA senior bonus** in Engine D (DC-2).
- **State tax in the column.** It is a federal marginal rate; the Taxes tab carries state tax.
- **Qualifying surviving spouse filing.** The app models no dependent children (the other engines agree).
- **Capital gains at LTCG rates.** The Taxes tab computes that tax; this column is the ordinary bracket.
- **Residual bracket creep:** thresholds indexed 2%/yr against income rising with the scenario's inflation (~2.7%). This is the app's disclosed
  conservative convention, kept as it is.
- **Any change to Engines A, B or C.** A shared marginal-rate lookup is not hoisted. E-22 records two federal-bracket copies, and Engine D adds
  none: it walks the table `projectBracketsAt` returns and holds no bracket figure of its own (asserted, §3 D).
- Engine D's other simplifications (the expected-return path; D-9's RMD gap, E-21).

**Stop:**
- any schedule field other than `magi`, `bracket` or `ssTaxable` moving, for any household;
- `withdrawalPlanSeries` or any Engine A/B/C output moving;
- Monte Carlo parity moving;
- the build's column disagreeing with the oracle, or with the prototype, in any year.

## 5 · Decisions for Steve — **taken 2026-10-14: DC-1 (a), DC-2 (a), DC-3 (a), DC-4 (a)**

- **DC-1 · What the column's rate is measured on.**
  - (a) **Ordinary taxable income only** *(recommended)*: Social Security (worksheet) plus every ordinary term, less the deduction. Realized gain
    still counts toward the §86 test. This is what a marginal bracket means and what the Taxes tab shows (`marginalBracket` on taxable ordinary
    income). On §0.3's households (a) and (b) give the same bracket in **every one of the 98 years** (compared year by year); they part only in a
    big-sale year, where (b) reads a band high.
  - (b) Include realized gain in the bracket input, as today. Conservative, but it states a rate the gain is not taxed at.
- **DC-2 · Deductions.**
  - (a) **Standard deduction plus the age-65 extra, through `projectBracketsAt`** *(recommended)*. One projection shared with the Roth tab, no new
    code, conservative. It omits the temporary OBBBA senior bonus, as the Roth tab does and discloses.
  - (b) Also the OBBBA bonus (2025–2028, MAGI-phased), matching the Taxes tab in those years. It needs Engine B's phase-out logic in Engine D, and
    for a household retiring in 2029 or later (the example) it never applies.
  - (c) The standard deduction only. The model would under-deduct for every household over 65.
- **DC-3 · Telling the user what the column is.**
  - (a) **Keep the header "Bracket"; add one sentence to the table's description** *(recommended)*: *"Bracket is the federal marginal rate on the
    year's ordinary income: Social Security taxed as the IRS worksheet taxes it, joint while both spouses are alive and Single from the year after
    the first death, with the standard deduction (and the extra at 65) and the brackets indexed 2%/yr. State tax and capital-gains rates are on
    the Taxes tab."* No layout risk.
  - (b) As (a), plus the same sentence in the Field Manual's Withdrawal entry (a `DOCS_HTML` edit, §C0).
  - (c) Rename the header "Fed bracket". The layout suites then re-measure the table.
- **DC-4 · Three sentences elsewhere that state the §86 rule wrongly.**
  - (a) **Fix all three in this release** *(recommended)*. They are copy about the same rule, and after v6.12 they would be the only places the
    app still misstates it:
    - IRMAA tab: *"the simplified 85%-of-SS assumption"* → *"Social Security taxed by the IRS worksheet"*.
    - Taxes tab: *"Federal brackets are MFJ inflated 2%/yr"* → *"Federal brackets follow the filing status (joint, or Single for a single
      household and from the year after the first death), inflated 2%/yr"*.
    - Roth tab: *"85% taxable when provisional income > $44K"* → *"up to 85% taxable above $44K of provisional income (IRS worksheet;
      thresholds not indexed)"*.
  - (b) File them as new register items and leave the copy alone.

## 6 · Register housekeeping at ship (not decisions; corrections the release carries) — **done at v6.12**

- `FlawsToFix-v5_73-Phase2.md` census: **C-5 → FIXED v6.12**, with the severity restated (§0.3). **C-10 → FIXED v6.09.** v6.09's D-35 item 1 is
  this defect: `_gainPoolInit` now subtracts `_rothOth` (L5552), and `t72` asserts no gain on Roth money. D-35's scope never cross-referenced the
  ID, so the register has carried it open since.
- `ARCHITECTUREIssues.md` E-22: Engine D's flat 85% leaves the list of open copies.
- `t14`'s header note on Engine D's filing concept is rewritten when the check moves.
- *(Added at the build.)* `ARCHITECTUREIssues.md` **E-25** also named C-10's class as uncovered; it is covered by `t72` and the row now says so.

## 6a · What the build changed from this document

1. **`domdiff`'s Withdrawal check masks the Bracket cells; it does not excise them by anchor** (§2.3 said "excised by anchor"). The tab is
   compared as text, and its cells run together with nothing between them to anchor on. For the v611 → v612 pair only, each Bracket cell — a
   one- or two-digit rate followed directly by the row's "$N.NNM" — is masked on both sides, counted (the same number on each, or the check
   fails), and two new checks keep the mask honest: it bit, and the masked cells did move. The new sentence is set aside on the v6.12 side,
   exactly once. Everything else in the tab must be byte-identical, as planned.
2. **`t20` is a current-leg suite, not gated per leg** (§2.3 said "gated per leg"). Its "ordinary income" now subtracts the row's own
   `ssTaxable`, falling back to 0.85 × benefits where a module does not publish the field — each build's own rule.
3. **`t19`'s new MAGI figure is tied to the old one by a decomposition, not by the new suite's oracle** (§2.3 said "from the new suite's
   oracle"). A second check asserts lifetime MAGI + Σ(0.85 × benefits − `ssTaxable`) = $3,191,209, v6.11's figure, so the move is shown to be
   Social Security and nothing else. `t75` §C separately asserts every other schedule field bit-identical on ten households.
4. **Two more negative controls than planned** (§3 listed K0–K8): K9 caps the rate at 32% again, K10 removes the table's new sentence. 11 of 11.
5. **A harness trap, found writing `t75`, recorded in OPERATIONS §C.** The DOM bundle carries its own copy of the app module, so a suite that
   reads a rendered table against an engine call must read the rendered household through `window.__g`. `t75`'s first draft did not, and its
   E-1 setup check caught it (a 25-row table compared with a 16-row fixture).
6. **`t14`'s counting check was negative-controlled by hand** (not in §3): weakening `survAdj` to `>` turns both Engine D checks red (45 / 2).

## 7 · Build record (v6.12, 2026-10-14)

- **Source** `fc8d2a5f98a1f68314a57214db845426` (v6.11 `35f3c656…` plus §1 and DC-3/DC-4; 12 anchored edits, each asserted unique — the four
  version sites, the helper's history note, `_survivorIsAD`, the tax block (exactly the 17 lines §0.2 cites), the row's `ssTaxable`, the
  table's sentence, the three DC-4 sentences). **Built** `index.html` `bc19a24e446ab595ea8975f6fe4191a4`; v6.11 rebuilt first from its own
  source to its published `ff3c5d7e…`; `smoke_built` 22 passed, 0 failed.
- **The build equals the prototype and the probe:** the v6.12 column equals the scope probe's last layer in all 98 household-years, MAGI
  equals worksheet-taxed MAGI to the cent, and the build and the §0.4 prototype agree in every year.
- **Suite, from the packaged copies:** 6,831 app checks across 74 app suites, 0 failed, 0 DIED; MC parity 10/10; GRAND 6,963. `t75` 50
  (v6.12) / 45 (v6.11); `t14` 44 → 47, `t19` 67 → 68, `t43` 37 → 38 per leg, `t20` and `t40` unchanged in count, `domdiff` 32 → 34.
- **Controls** `qa/tools/controls_v612_c5.py`: 11 of 11, every file restored and hash-checked. (A first run reported "restored: NO": its
  copy of the run folder had a symlinked `node_modules`, so esbuild wrote different module paths into the rebuilt DOM bundle. Normalised for
  that path the bundle was byte-identical; the controls were re-run in a copy with its own `node_modules` and restored cleanly. The
  first run's control results were the same.)
- **Registration:** `v612` by AST at 306 sites (`t1`'s `verStr` and `t4`'s `_badge` skipped and added by hand, because they select a
  value), `t33`'s PINS, the three Python lists, `dom_entry_v612.jsx`.
- **Registers:** C-5 FIXED v6.12; C-10 FIXED v6.09 (corrected); E-22 and E-25 updated (§6).

