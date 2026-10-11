# SCOPE — v6.04 · D-31 (deductions a state takes from the federal return) and D-29 (Missouri's capital-gains subtraction)

**FULFILLED — shipped as v6.04 (2026-10-11).** Repo-only. §6 is the build record. D-31 and D-29 close.

*(Superseded status line, retained:)* **READY — 2026-10-11.** Repo-only. Steve, 2026-10-11: "start the v6.04 scope on D-31 plus D-29." Under his standing instruction every decision below
carries a recommendation the build takes and records. **Stop only where §5's conditions fire.** A MODELLING release: METHODOLOGY changes.

## 0 · Premise (verified against v6.03, not assumed)

Freshness (OPERATIONS §A): repo `3540e4f` (the v6.03 commits, then the controls script's mode fix), full clone; source
`bba6256a1380feae47809094ac667ffd` = repo = pool (verified 2026-10-11 at the v6.03 check: all 64 packaged files byte-identical to a fresh clone; the pool's
source and manifest by hash; 132 names after the duplicate `t23` was removed) = CHANGELOG newest; built `7acea8cda30fe596ad986935eefa611e` = live Pages.

### 0.1 · What the calculator is given today (AST census of `stateTaxAnnual`, v6.03)

- **Three call sites:** `runRothStrategies` (Engine A) at two — the year's tax and the ACA-cliff solver's estimate (`_estSaleGain`) — and `computeTaxPlan`
  (Engine B) at one. Each passes code, rate, retirement income, pension, work, capital gains, Social Security, ages, status and the per-person split. **No
  call passes the model year or any federal tax figure**, so no row can take a deduction that depends on either.
- **Every federal figure the deductions need already exists at each site, computed before the state call**:
  - Engine B has `fedTax` (ordinary), `capGainsTax`, `amt_y`, `niit_y` and the OBBBA `seniorBonus`.
  - Engine A has `fed`, `qdcgTax`, `amt`, `niit` (the estimate: `fedC`, `qdcgTaxC`, `amtC`, `niitC`). Engine A omits the OBBBA bonus from its own
    federal deduction by a recorded decision (the bracket-fill solver would be circular), and the omission is disclosed.
  - Federal tax does not depend on state tax: the model takes no itemized deductions, so the state call can follow the federal one with no circularity.
- **The `capGains` argument is gains AND qualified dividends.** Engine B passes `qdcg_y = capGains_y + div_y`; Engine A passes `div_y` alone (it realizes
  no gains). Missouri's subtraction is of capital gains only, so the calculator must be told the realized-gain part.
- **The calculator's federal-AGI measure** (`_stateIncome("agi")`: retirement income, pension, work, gains and dividends, taxable Social Security) is the
  same composition as Engine B's `magiProxy` for the OBBBA bonus (`grossOrdinary + qdcg_y`). §3 holds the two equal year by year.

### 0.2 · The law — read at primary sources on 2026-10-11 (a research pass in two groups, then each figure re-read by me at its source)

**Federal income tax deducted on the state return** (latest published: TY2025; none of the three has 2026 return instructions yet):

| State | What is deducted | Limit | Source |
|---|---|---|---|
| AL | federal income tax "paid or accrued within the taxable year" — the 2025 worksheet: Form 1040 line 22 (regular and capital-gains tax, AMT, after nonrefundable credits) **plus NIIT** (Form 8960 line 17), less EIC / ACTC / AOTC / refundable adoption / Form 2439 credits; self-employment, Additional Medicare and early-distribution taxes are not federal income tax for it | none for residents | Code of Ala. §40-18-15(c) (the research pass found the text at (c); the (a)(2) it was asked about came from my own research brief, not from any project file — corrected at the build, §6); r. 810-3-15-.20; the 2025 Federal Income Tax Deduction Worksheet |
| MO | a percentage of federal income tax liability (after credits other than estimated payments, overpayments and §§31, 27, 34 — so before the foreign tax credit): 35 % at $25,000 or less, 25 % to $50,000, 15 % to $100,000, 5 % to $125,000, 0 above; on the 2025 form, MO-1040 lines 9–11 (1040 line 22 less EIC and AOTC, with AMT, the early-distribution tax and the foreign tax credit added back; NIIT not included) | $5,000 single / $10,000 combined | RSMo 143.171.2(1) (A.L. 2021, effective 7-1-21, unchanged since); 2025 MO-1040 instructions lines 9–13 |
| OR | "federal income tax after all credits other than the earned income tax credit" (1040 line 22 less excess APTC, plus the early-distribution and other income-only taxes; not self-employment tax; NIIT and Additional Medicare tax on no line) | $8,500 under federal AGI $125,000 single / $250,000 joint, then $6,800 / $5,100 / $3,400 / $1,700 per $5,000 / $10,000 band, nothing from $145,000 / $290,000 | ORS 316.680(1)(b), 316.685, 316.695(3) (base $5,500, CPI-indexed); 2025 OR-40 instructions line 10 and Table 4 |

Measures: Missouri's table reads "Missouri gross income" in the statute and "the Missouri Adjusted Gross Income reported on Line 6" in the form; Oregon's
bands are federal AGI, fixed by statute (only the cap is indexed). Oregon's 2026 withholding formulas use $8,750; the same publication's text and the
companion tables say $8,500 — unconfirmed for the 2026 return. A later refund of the deducted federal tax is income in Alabama and Oregon (the model has no
refunds).

**The federal senior deduction** (P.L. 119-21 §70103, IRC §151(d)(5)(C): $6,000 each 65 or older, TY2025–2028, less 6 % of MAGI above $75,000 single /
$150,000 joint; Form 1040 line 13b — below AGI): the research pass read all 42 taxing jurisdictions. It reaches **six** of the model's rows, each at the
federal amount, after the federal phase-out:

| State | Mechanism | Source |
|---|---|---|
| CO | starts from federal taxable income (DR 0104 line 1 = 1040 line 15); no addback | 2025 Book 104 |
| IA | starts from federal taxable income; IA 1040 line 1f: "For Iowa purposes, this deduction is considered a personal exemption" | 2025 IA 1040 instructions |
| MT | Form 2 line 2: "the total of Form 1040, lines 12e and 13b"; the Schedule 1-A deductions "are included in the calculation of Montana taxable income" | 2025 Form 2 instructions |
| ND | starts from federal taxable income, which it "perpetually conforms to"; no addback | 2025 individual income tax booklet |
| ID | conformity to the IRC of 1 January 2026, retroactive to 2025, no carve-out (HB 559); Form 40 line 18 subtracts 1040 line 13b | HB 559 (2026); Idaho State Tax Commission |
| AZ | its own subtraction: "the amount deducted for a qualified individual under section 151(d)(5)(C)" | A.R.S. §43-1022(35) (HB 4168, 2026) |

Every other jurisdiction starts from federal AGI or its own income, or decouples (South Carolina from 2026, Act 110; Missouri expressly). **The District
of Columbia is unsettled** (its 2025 booklet disallows it; congressional disapproval and a 2026 budget act are reported, not read).

**Missouri's capital-gains subtraction:** RSMo 143.121.3(14)(a): "For all tax years beginning on or after January 1, 2025, one hundred percent of all
income reported as a capital gain for federal income tax purposes by an individual" (A.L. 2025 H.B. 594 & 508, effective 28 Aug 2025). The 2025 Form MO-A
line 18 takes Form 1040 line 7a — the net capital gain, losses netted, never below zero; qualified dividends are not capital gain (Letter Ruling 8397 of 28
May 2026: capital-gain distributions qualify, short-term gain distributions reported as ordinary dividends do not). The DOR's FAQ gives 2026 in one answer
and 2025 in another; the statute, the 2025 form and the ruling say 2025.

**Measured** in §6 (the build's probe; Engines A and B over the nine rows).

## 1 · Decisions (taken on recommendation)

- **DD-1 — the release is D-31 and D-29 together:** Alabama, Missouri and Oregon deduct federal income tax; Colorado, Iowa, Montana, North Dakota, Idaho and
  Arizona take the federal senior deduction; Missouri subtracts realized capital gains. Missouri is in both, and its federal-tax percentage is measured on
  its AGI after the gains subtraction, so the two land in one release.
- **DD-2 — four new calculator arguments, passed by all three call sites:** `taxYear` (the model year), `fedIncomeTax` (the year's federal income tax:
  ordinary, capital-gains rate and AMT), `fedNiit` (its net investment income tax, kept apart because only Alabama counts it) and `gains` (the realized
  capital-gain part of `capGains`). A caller that passes none — every hand pin, every count-only caller — gets exactly v6.03 (each defaults to nothing,
  which takes nothing: conservative and backward compatible).
- **DD-3 — the evaluator grows three fields, the data stays declarative:**
  - `of: "fedtax"` — the component's amount is `amt` × the federal income tax (plus `fedNiit` with `niit: true`, Alabama);
  - `cap` — a number, `{ single, joint }`, or a table `{ on, rows }` of [upTo, limit, "lt"?] (Oregon's AGI bands), applied after the phase;
  - `years: [from, to]` — the component exists only in those tax years (the senior deduction, 2025–2028); without a year it grants nothing.
  The senior deduction is an ordinary `per: "age"` component, $6,000 each, with the existing `rate` phase on the federal-AGI measure (6 % above $75,000 /
  $150,000) — the federal rule's own shape. Its figures are read from `OBBBA_CONSTS`, the federal block, not copied.
- **DD-4 — Missouri's subtraction is a row field, `gainsExempt`:** the realized gains (`gains`, at most `capGains`, never below zero) leave Missouri's base
  before anything is measured on it. Qualified dividends stay taxed.
- **DD-5 — what "federal income tax" is in the model:** regular tax on ordinary income, the capital-gains-rate tax and AMT — what the model computes of
  Form 1040 line 22 (it computes no credits, no excess premium-credit repayment, no early-distribution tax; FICA is not income tax in any of the three).
  Alabama adds NIIT. The year's own liability (Alabama's accrual basis, Oregon's accrual method, Missouri's liability) — the model has no refunds to recapture.
- **DD-6 — Engine A takes the state senior deduction from its own MAGI** though its federal calculation omits the bonus (the recorded solver decision): at
  the state call the conversion is already fixed, so there is no circularity, and the state layer then agrees between the two engines (§3 B holds it).
  Alabama, Missouri and Oregon read Engine A's federal tax as Engine A computes it — slightly higher than Engine B's in 2026–2028 for a 65+ household,
  so their deduction is slightly larger there; disclosed. *Alternative:* no senior deduction in Engine A — rejected: the two tabs would disagree on six states'
  tax for the same year.
- **DD-7 — Oregon's cap held at $8,500** (TY2025; the 2026 $8,750 is unconfirmed) — conservative.
- **DD-8 — Missouri's table on Missouri AGI** (the form's line 6), not the statute's "Missouri gross income": the department administers it on AGI.
  Disclosed in the note.
- **DD-9 — the District of Columbia is not given the senior deduction** (its 2025 law disallows it; 2026 unsettled) — conservative, disclosed.
- **DD-10 — dated figures:** the nine rows' `years.deduct` stays the year of their own figures; the new components are dated in the notes (AL 2025 worksheet;
  MO statute; OR 2025 cap held; the senior deduction statutory 2025–2028).
- **DD-11 — the version is v6.04, tag `v604`** (confirmed free at the build).

## 2 · Site census (AST; anchors counted once on v6.03 by the staging script)

**Source:** the evaluator (`of`, `niit`, `cap`, `years`; its signature gains `fedTax`, `fedNiit`, `yr`) and its header comment; the calculator's signature
(four arguments), Missouri's gains subtraction in the base, the evaluator call, the `_onDetail` record (year, federal tax, NIIT, gains); the three call
sites; nine rows' `deduct` and Missouri's `gainsExempt`; nine notes; the Field Manual's state-tax sentences (Taxes entry, methodology entry); four version
sites. **Docs:** CHANGELOG, METHODOLOGY, TESTING, MissingFeatures (D-29 and D-31 closed), this scope's §6, the manifest.
**Suite:** derived pins found by running the full suite on the staged build, gated per v6.02 DD-14; `qa/d30_ref.mjs` extended.

## 3 · Tests

New suite **`t68_fed_deductions.mjs`**, both legs (the v6.03 leg pins the absence of the arguments, fields and components):
- **A** — the nine rows' new components equal §0.2; the senior component reads `OBBBA_CONSTS` (equal values) and only the six rows carry it; only AL, MO, OR
  carry an `of: "fedtax"` component; only Missouri `gainsExempt`; EXTINCTION: every component well formed; notes name what is taken and the DC exclusion.
- **B** — the edges through the calculator: Missouri's bands at $25,000 / $25,001 … and its caps; Oregon's bands at $124,999 / $125,000 … and the joint
  doubling; the senior deduction in 2028 / 2029 and 2024 / 2025, its phase-out to zero, one filer 65+ against two; Alabama with and without NIIT; Missouri's
  gains (losses floor at zero; dividends stay taxed); a call with no year and no federal tax equals v6.03 byte for byte.
- **C** — hand cases to the cent (Decimal, session working): every one of the nine rows at least once, joint and single.
- **D** — v6.03 → v6.04 (v604 leg, needs `app_v603.mjs`): every jurisdiction × a household grid × years 2026–2030 × federal tax and NIIT values: with the new
  arguments omitted, byte-identical to v6.03; with them, the nine equal an independent implementation (`qa/d30_ref.mjs` extended) on the calculator's
  measures, and the other rows are byte-identical.
- **E** — the engines: Engine B's state senior deduction equals its own federal `seniorBonus` in every year for each of the six states (to the dollar —
  the federal figure is rounded); Engine A and Engine B pass the same federal income tax definition (the three components) — by AST at the three sites; the
  Field Manual and notes held to the code.
- Controls `qa/tools/controls_v604_feddeduct.py` (repo-only): an amount moved (Missouri's 25 %), a band boundary moved (Oregon $125,000), NIIT dropped from
  Alabama, the senior window widened to 2029, Missouri's gains subtraction applied to dividends, one call site stops passing `fedIncomeTax`, a row outside the
  nine moves — and the unmutated run.

## 4 · Out of scope

DC's senior deduction (unsettled); Oregon's 2026 cap; the federal tax refunds Alabama and Oregon recapture (the model has none); Missouri's specie
subtraction (2026); credits the model does not compute; Engine A's federal OBBBA omission itself (its own decision, D-1's record).

## 5 · Stop conditions

Stop and report if: a primary source contradicts §0.2; anything outside the nine rows moves (`t68` D, MC parity); with the new arguments omitted the
calculator differs from v6.03; Engine B's state senior deduction and its federal bonus disagree in any year; a suite asserts an old figure on purpose in a
way the derived-pin gating cannot honestly carry.

## 6 · Build record (v6.04, 2026-10-11)

- **Source** `8226b20b62334074606993d411bb0fb1` (35 anchored edits, each counted once on v6.03: the evaluator's three fields, its signature and header comment; the calculator's four
  arguments, Missouri's gains subtraction, the evaluator call and the `_onDetail` record; the three call sites; nine rows' `deduct`, Missouri's
  `gainsExempt`; nine notes; the Field Manual's state-tax sentences; four version sites). **Built** `71f4ada6ac4923075f9f1d1a576c2293` (v6.03 rebuilt byte-identical first;
  `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — without the new arguments the calculator is v6.03's byte for byte over 25,818 calls (`t68` D-1); with them every row
  outside the nine is (21,168 calls, D-2); MC parity 10/10, unchanged; Engine B's state senior deduction equals its federal bonus in every year for each
  of the six (E-2); no source contradicted §0.2; every derived check was gated honestly (the retired "not taken" checks in `t66` / `t67` are the claims this
  release makes false, and `t68` holds the new wording).
- **Measured** (scratch probe, v6.03 against v6.04; not shipped): the example plan's Engine B lifetime state tax falls in AL, MO and OR and is byte-identical in
  the other 48 and "none"; a 65+ household's falls in AL, MO, OR, MT, ID and AZ (figures in the CHANGELOG); Engine A: no strategy's tax rises, the
  estate-best strategy changes in no state.
- **`t68`** 49 (v6.04) / 5 (v6.03). **Controls 8 of 8.**
- **Hand cases** (session working `hand604.py`, Decimal, not shipped): 15, every one of the nine at least once — e.g. AL single 50, $40,000, federal tax $3,000:
  $1,610.00; MO single 66, $24,000, $1,000: $104.88; OR single 66 at $124,999 / $125,000, $20,000: $9,521.60 / $9,670.44; MT joint 66/66, $100,000, 2027 /
  2029: $2,467.50 / $3,031.50; ND single 70, $90,000, 2028: $334.91; CO joint 66/60, $160,000: $5,313.00; IA joint 66/66, $120,000: $2,635.00; AZ single 66,
  $70,000, 2028 / 2024: $1,153.75 / $1,303.75.
- **Found by the build, fixed before the run, owned here:**
  - The controls first missed two planted defects (K1, Missouri's 25 % moved; K2, Oregon's first boundary moved): `t68` group D's household grid never
    reached those bands. A band sweep for Missouri, Oregon and Alabama was added to group D; both now fire.
  - K5's expected red list named D-2, which cannot fire by construction (the independent implementation reads the base from the calculator's own record,
    so a base moved by dividends moves both sides). The expected list is B-7, D-1, D-4 — B-7 and D-4 catch it.
  - An edit to `t65` put a `//` comment mid-line, which silenced Arkansas's regex; replaced with `/* */`.
  - `t68` group E first read the DOM bundle's engines and the app module's calculator (two module instances); it now uses one app module.
  - `t67` group D failed D-0 on the v6.03 leg of a v6.03 → v6.04 folder (it needs `app_v602.mjs`); it now reports itself not run, as `t66` D does.
  - **Alabama's citation:** §0.2 first said "not the (a)(2) this project's notes cite". No project file cites (a)(2) — it was in my research brief.
    Corrected in §0.2; the statute is §40-18-15(c).
- **Sources** (§0.2) re-read in the session after a research pass in two groups: Code of Ala. §40-18-15(c), r. 810-3-15-.20 and the 2025 Federal Income Tax
  Deduction Worksheet; RSMo 143.171, 143.121.3(14), the 2025 MO-1040 instructions and Form MO-A, Letter Ruling 8397; ORS 316.680, 316.685, 316.695 and the 2025
  OR-40 instructions (Table 4); P.L. 119-21 §70103 (IRC §151(d)(5)(C)); the 2025 Colorado Book 104, IA 1040 instructions, Montana Form 2 instructions and North
  Dakota booklet; Idaho HB 559 (2026); A.R.S. §43-1022(35).
- **Suite:** 6,293 app checks, 67 suites, 0 failed, 0 DIED; GRAND 6,423. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v603 v604 from a full clone of 3540e4f with the github/ files overlaid (v6.03 resolved from history, commit 12a4428), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6201, half B GRAND 222; none DIED.

