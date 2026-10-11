# SCOPE — v6.03 · D-30 batch 2: the fifteen flat-rate states' deductions, exemptions and personal credits

**FULFILLED — shipped as v6.03 (2026-10-10).** Repo-only. §6 is the build record. D-30 closes; D-31 widened; D-32 opened.

*(Superseded status line, retained:)* **READY — 2026-10-10.** Repo-only. Steve, 2026-10-10: "start the v6.03 scope". Under his standing instruction every decision below carries a
recommendation the build takes and records. **Stop only where §5's conditions fire.** A MODELLING release: METHODOLOGY changes.

## 0 · Premise (verified against v6.02, not assumed)

Freshness (OPERATIONS §A): repo `7af5fbb` (the v6.02 commits `a8a7a38` … `a7bbdb5`, then the controls script's mode fix), full clone; source
`d76dddc6381041c987fc5c87b8edad53` = repo = pool (verified 2026-10-10 at the v6.02 check: every packaged file byte-identical to the fresh clone, the
131-name pool listing exact, source and manifest copies by hash) = CHANGELOG newest; built `16a4a850e5a10582b91eb98ea9b32ce5` = live Pages. Pool 131.

### 0.1 · What the calculator does with these fifteen today (read in `stateTaxAnnual`, v6.02)

- A row without `deduct` keeps taxable income equal to the base (`_stTI === _stBase`); a row without `brackets` is taxed at `rate` on all of it. All
  fifteen are both, so each is taxed at its flat rate from the first dollar of the base it builds (after its retirement exclusions and Social Security
  rule, unchanged here).
- **Ohio's** note already says the model overstates: Ohio taxes nothing on a base at or below $26,050 and $332 plus 2.75 % above it; 2.75 % on all of it
  is $384.38 a year too much above the line, and up to $716.38 below it.
- **Idaho's** note says its small indexed zero band is taxed (conservative).
- My Data's model line for a row without `brackets` reads "N% effective rate (an approximation)". Since v6.01 every such row with a rate is a
  statutory flat rate, so the sentence has been inaccurate since v6.01 (found reading the line for this scope; fixed here, DD-13).
- The parity fingerprint `stateTax` prices Georgia (`stateTaxAnnual({ code: "GA", … retIncome: 260000, persons65: 2 })`); `t33`'s household and
  several suites' fixture households are in Georgia. Every Georgia figure moves on purpose here. *(Corrected at the build: this line first said the
  Engine A fingerprints price "the example household's Georgia". They price `PORTFOLIO().stateCode`, which is unset in `t2`'s harness, and the app's
  example plan files in Florida — "State: Florida (no income tax)". The same wrong claim is in v6.02's CHANGELOG and D-30 entry; §6 records it.)*

### 0.2 · The figures — read at primary sources on 2026-10-10 (a research pass in three groups, then each figure re-read by me at its source)

Federal TY2026 (Rev. Proc. 2025-32 §4.14): standard deduction $16,100 single / $32,200 joint; additional for 65+ or blind $1,650 (married), $2,050
(unmarried). Used by the two states that start from federal taxable income (CO, IA) and by Utah's credit (federal line 12e).

| State | Starts from | Taken from v6.03 (per return unless "each") | Year | Source |
|---|---|---|---|---|
| AZ | federal AGI | standard $15,750 / $31,500; exemption $2,100 each 65+ | 2025 (2026 indexed, unpublished) | A.R.S. §43-1041(A),(H) (HB 4168 / SB 1861, 2026); §43-1023(E); 2025 Form 140 booklet |
| CO | federal taxable income | the federal standard deduction (above); while federal AGI is **below** $300,000 all of it, from $300,000 at most $12,000 / $16,000 (Proposition FF addback) | 2026 (statutory link; addback fixed) | C.R.S. 39-22-104(1.7), (3)(p.5); 2025 Book 104 lines 1 and 4 |
| GA | federal AGI | standard $15,000 / $30,000; no 65+ addition (none since 2024), no personal exemption for filer or spouse | 2026 | HB 463 (2026); DOR 2026 Employer's Tax Guide (June 2026); 2025 Form 500 |
| IA | federal taxable income | the federal standard deduction (above); exemption credit $40 each + $20 each 65+ | 2026 (statutory link; credits fixed) | Iowa Code §422.7, §422.12(2)(a); IA 1040 line 2 instructions |
| ID | federal AGI (statute: federal taxable income) | standard $15,750 / $31,500 + $2,000 (single) / $1,600 (married) each 65+; grocery credit $155 each; and the zero band $4,811 / $9,622 (a schedule, DD-5) | 2025 (2026 unpublished) | 2025 Form 40 line 16 and instructions; Idaho Code §63-3024, §63-3024A |
| IL | federal AGI | exemption $2,925 each + $1,000 each 65+; none at all when federal AGI exceeds $250,000 / $500,000 | 2026 | IDOR IL-700-T (2026); 2025 IL-1040 instructions line 10 |
| IN | federal AGI | exemption $1,000 each + $1,000 each 65+ + $500 each 65+ when federal AGI is less than $40,000 | 2026 (fixed) | 2025 IT-40 Schedule 3 lines 1, 4, 5; DOR 2026 legislative synopsis (no change) |
| KY | federal AGI | standard $3,360 — one per return, joint included; credit $40 each 65+ | 2026 | DOR release 4 Sept 2025 and 2026 Withholding Formula; 2025 Form 740 instructions line 10; DOR individual page |
| LA | federal AGI | standard $12,500 / $25,000; no 65+ addition, no exemptions (repealed by Act 11) | 2025 (2026 indexed, not final) | R.S. 47:294; 2025 IT-540 line 8; RIB 25-012, RIB 26-005 |
| MA | its own (Part B) | exemption $4,400 / $8,800 + $700 each 65+ | 2026 (statute capped / fixed) | M.G.L. c.62 §3(B)(b); 2025 Form 1 instructions |
| MI | federal AGI | exemption $5,900 each; no 65+ addition | 2026 | Treasury, Calendar Year Tax Information (2026); MCL 206.30 |
| NC | federal AGI | standard $12,750 / $25,500; no 65+ addition (D-401: none "for taxpayers who are age 65 or older") | 2026 (fixed) | G.S. 105-153.5(a)(1); 2025 D-401 instructions |
| OH | federal AGI | exemption each, by modified AGI: $2,400 at or below $40,000, $2,150 to $80,000, $1,900 below $500,000, none from $500,000; exemption credit $20 each when MAGI less exemptions is below $30,000; senior citizen credit $50 per return (a filer 65+) when MAGI less exemptions is below $100,000; and the 2026 schedule — nothing at or below $26,050, $332 plus 2.75 % of the excess above (a schedule, DD-6) | exemptions 2025 (indexing suspended for 2025–2026); schedule 2026 | R.C. 5747.025 (HB 96, eff. 30 Sept 2025) and the LSC analysis; 5747.022; 5747.055(F); 5747.02(A)(3); 2025 IT 1040 instructions |
| PA | its eight classes | nothing — "The Pennsylvania personal income tax does not provide for a standard deduction or personal exemption" | — | PA DOR personal income tax page |
| UT | federal AGI | taxpayer tax credit: 6 % of the federal standard deduction (with its 65+ additions), less 1.3 % of Utah taxable income above $18,213 / $36,426, not below zero | federal 2026; phase-out base 2025 (2026 unpublished) | 2025 TC-40 lines 11–22 and instructions |

Findings that bear on the design:
- **The federal senior deduction** ($6,000 each 65+, 2025–2028, phased out above $75,000 / $150,000 of MAGI) reaches four of the fifteen: Colorado and Iowa
  through federal taxable income (no Colorado addback; Iowa DOR: "Iowa conforms"), Idaho through HB 559 (2026, conformity to 1 January 2026; Form 40 line 18
  subtracts federal Schedule 1-A), and Arizona by its own subtraction (A.R.S. §43-1022(35), from TY2025). The others start from federal AGI and the
  deduction comes after it (North Carolina and Utah say so in writing). It is D-31's (DD-4).
- **Colorado's addback threshold disagrees between statute and form.** C.R.S. 39-22-104(3)(p.5) says "equal to or exceeding three hundred thousand
  dollars"; Book 104 (2025) says AGI that "exceeds $300,000". The statute governs and is also the conservative reading (DD-7).
- **Credits that need a measure the calculator does not have:** Ohio's retirement income credit (up to $200 per return, by the retirement income received
  "on account of retirement", R.C. 5747.055(B)) and joint filing credit (5 % to 20 % of tax up to $650, each spouse needing $500 of qualifying income other
  than interest, dividends, distributions, rents and gains, §5747.05(E)); Utah's retirement credit (only for a filer born on or before 1952). DD-8.
- **Refundable or low-income credits:** Idaho's grocery credit is refundable, with no income limit (DD-3); Massachusetts' senior circuit breaker is refundable
  and measured by property tax or rent the model does not carry; the low-income items (Georgia's low income credit, Iowa's low-income exemption,
  Kentucky's family size credit, Indiana's unified credit for the elderly, Arizona's family and property tax credits, Pennsylvania's Tax Forgiveness,
  Massachusetts' no-tax status and limited income credit, the earned income credits) disappear well below a retiree's typical income (DD-9).
- Ohio's literal 2026 schedule jumps from no tax to $332 at the first dollar over $26,050 (the statute's own words; 2025's was $342).

**Measured** in §6 (the build's probe; Engines A and B over the fifteen states).

## 1 · Decisions (taken on recommendation)

- **DD-1 — the batch is the fifteen**, closing D-30: fourteen rows gain `deduct`; Pennsylvania gains none, and its note says why (the law has none).
- **DD-2 — the same field and evaluator as v6.02** (`deduct`, `stateDeductions`), one change to the evaluator: a `tiers` row's `from` and `to` may be
  `{ single, joint }` (read through the same `pick` the amounts use), so Utah's phase-out starts where its statute says for each status. Numbers pass
  through `pick` unchanged, so the 27 batch-1 rows are byte-identical (`t67` D).
  *Alternative:* give `rate` the `add` it ignores — rejected: `rate` is per unit, and Utah's reduction is once on the whole.
- **DD-3 — credits stay nonrefundable** (the calculator floors the tax at zero). Idaho's grocery credit is refundable in law; taken against tax only, it is
  understated for a household whose Idaho tax is below $155 a person. Conservative, disclosed.
- **DD-4 — the federal senior deduction is not taken (AZ, CO, IA, ID)** — D-31 already holds it for Montana and North Dakota; these four are added to its
  entry. Conservative, disclosed in each note.
- **DD-5 — Idaho's zero band is modelled as a schedule** (`brackets` {single: [[4,811, 0], [∞, 5.3 %]], joint: [[9,622, 0], [∞, 5.3 %]]}, 2025 held):
  the law's own arithmetic ("subtract $4,811 … multiply by 5.3 %"); Mississippi's schedule is the precedent. `rate` stays 5.3 % (the top rate, as t64
  requires).
- **DD-6 — Ohio's schedule is modelled exactly**: `brackets` [[26,050, 0], [∞, 2.75 %]] and a new row field `notch` `{ over: 26050, add: 332 }` — the
  calculator adds `add` once when taxable income exceeds `over`. One line, read only by a row that carries it (Ohio). The $332 step is the statute's;
  the model does not smooth it. *Alternative:* keep 2.75 % on everything — rejected: once Ohio's exemptions are taken, leaving its own schedule out
  would be the one known error left in the row.
- **DD-7 — Colorado's addback by the statute**: the federal standard deduction splits into the part every filer keeps ($12,000 single / $16,000 joint) and
  the remainder (with the 65+ additions), which a `cliff` keeps only while federal AGI is below $300,000 (`cmp: "lt"`). At $300,000 exactly the addback
  applies, as C.R.S. 39-22-104(3)(p.5) says; Book 104 says "exceeds". The higher reading is the conservative one.
- **DD-8 — credits needing a measure the calculator lacks are not taken**: Ohio's retirement income credit (at most $200) and joint filing credit, and Utah's
  retirement credit (born 1952 or earlier; the calculator has ages, not birth years). Logged as **D-32**, low priority. Conservative, disclosed.
- **DD-9 — low-income and property-tax credits are not taken** (the list in §0.2), as v6.02 DD-6. Conservative, disclosed.
- **DD-10 — Ohio's thresholds by its own measure.** Ohio's tests are on modified AGI less exemptions; within the band where each threshold falls the
  exemption is fixed, so each converts exactly to a modified-AGI threshold: the exemption credit (below $30,000) at MAGI below $32,400 single / $34,800
  joint ($2,400 each), the senior credit (below $100,000) at below $101,900 / $103,800 ($1,900 each). The calculator's base is Ohio AGI (Social Security
  out, as Ohio has it); the business-income add-back that turns it into MAGI is not modelled (the model has no business income). The senior credit is
  per return with one filer 65+ (`byAge` [0, 50] / [0, 50, 50]).
- **DD-11 — latest published figures, held** (v6.00 BR-4): 2025 where 2026 is unpublished — Arizona's standard deduction, Idaho's deduction and zero band,
  Louisiana's standard deduction, Ohio's exemptions (2026 equals 2025 if the suspension of indexing holds, and is higher if not), Utah's phase-out base.
  Each is at or below its later value, or (Utah's base) makes the credit smaller: conservative every time. Colorado and Iowa use the 2026 federal
  amounts, a statutory link like Missouri's.
- **DD-12 — dated figures:** `years.deduct` on the fourteen rows; `years.brackets` on Idaho (2025) and Ohio (2026).
- **DD-13 — the display.** My Data's model line for a row without a schedule reads "N% flat rate" (not "effective rate (an approximation)", which has
  been wrong since v6.01 for every row it reaches) and adds "· deductions and exemptions taken" as the bracketed rows do; the AI context line says "N% flat,
  after its deductions and exemptions" for such a row. The Field Manual's "the flat-rate states take none yet (conservative)" (two places) and "the
  flat-rate states keep their one rate" become the true sentences, held to the code by `t67`.
- **DD-14 — derived pins and parity (v6.00 BR-16, v6.02 DD-14, unchanged):** hand figures elsewhere that price one of the fifteen keep their BASE and on the
  v6.03 leg expect it with the state's deductions, credits, Idaho's band and Ohio's schedule, computed in the suite independently (`qa/d30_ref.mjs`
  extended); labels say so. The MC parity guardrail gains `"v602→v603"` in `INTENDED_DIFFS`, listing exactly the fingerprints the staged build moves
  (measured, not presumed: `stateTax` at least, and the Engine A fingerprints that price Georgia).
- **DD-15 — the version is v6.03, tag `v603`** (to be confirmed free at the build: vercensus, the three `.py` lists, no `dom_entry_v603.jsx` in history).

## 2 · Site census (AST; anchors counted once on v6.02 by the staging script)

**Source:** the fourteen rows (`deduct`, `years.deduct`) and fifteen notes (Pennsylvania's too); Idaho's and Ohio's `brackets` and `years.brackets`;
Ohio's `notch`; the evaluator's `tiers` (`pick` on `from` / `to`) and its header comment; the calculator's notch line and the v6.02 comment that says
"the flat-rate states until batch 2"; My Data's model line; the AI context line; the Field Manual's three state-tax sentences; four version sites.
**Docs:** CHANGELOG, METHODOLOGY, TESTING, MissingFeatures (D-30 closed, D-31 gains AZ / CO / IA / ID, D-32 opened), this scope's §6, the manifest.
**Suite:** derived pins found by running the full suite on the staged build and gated per DD-14; `INTENDED_DIFFS`.

## 3 · Tests

New suite **`t67_deductions_flat.mjs`**, both legs (the v6.02 leg pins the absence of the fifteen's `deduct`, Idaho's and Ohio's schedules and `notch`):
- **A** — the fourteen rows' components equal §0.2 (every amount, unit, measure, threshold, comparator), dated; Idaho's and Ohio's schedules and Ohio's
  `notch`; EXTINCTION: exactly forty-one rows carry `deduct` (the 27 and the 14), every component well formed; Pennsylvania carries none and its note says
  the law has none; every note names what is taken and what is not (the senior deduction AZ / CO / IA / ID; Ohio's two credits; Utah's retirement credit;
  Idaho's refundability; Colorado's addback); notes say "for each filer 65 or older", never "at 65" (t52's rule).
- **B** — the edges, through `stateDeductions` and the calculator: Colorado at federal AGI $299,999 / $300,000; Illinois at $250,000 / $250,001 single and
  $500,000 / $500,001 joint; Indiana at $39,999 / $40,000; Ohio's exemption bands at $40,000 / $40,001, $80,000 / $80,001, $499,999 / $500,000, its credits'
  thresholds either side, its schedule at taxable income $26,050 / $26,051; Idaho's zero band; Utah's credit at its start, inside, and where it reaches
  zero; Kentucky's one deduction on a joint return; the `tiers` `pick` with numbers (Minnesota unchanged).
- **C** — hand cases to the cent through `stateTaxAnnual`, computed independently in Decimal (session working, figures in §6): every state at least once
  (Pennsylvania unchanged); joint and single; 65+ additions; a survivor on a single return; Georgia's parity-fingerprint figure.
- **D** — v6.02 → v6.03 (v603 leg, needs `app_v602.mjs`): every jurisdiction × a household grid: with the fifteen's `deduct`, Idaho's and Ohio's schedules
  and `notch` removed the calculator is byte-identical to v6.02's; with them, the fifteen equal an independent implementation on the calculator's own measures
  (`_onDetail`), and the other thirty-six rows are byte-identical.
- **E** — the display and the Field Manual's state-tax sentences, each held to its code fact (no "effective rate (an approximation)" for any row; every
  flat row's My Data line names its rate as flat; the Field Manual names no flat-rate state as taking nothing).
- Controls `qa/tools/controls_v603_deduct.py` (repo-only), §3.1.

### 3.1 · Controls (each mutation must turn the named check red)

K1 a deduction amount moved (GA joint) · K2 Colorado's comparator `lt` → `le` (the statute's "equal to") · K3 Illinois's cliff measured on the state base
instead of federal AGI · K4 Ohio's notch removed · K5 Ohio's band boundary moved ($80,000 → $80,001) · K6 the `tiers` `pick` removed (Utah's start reads an
object) · K7 Idaho's zero band removed · K8 Kentucky's deduction per person instead of per return · K9 a batch-1 state moves (Virginia) — `t67` D must fire ·
K10 the My Data line's old "effective rate (an approximation)" restored · K0 unmutated.

## 4 · Out of scope

The federal senior deduction (D-31); federal-tax deductions (D-31); Ohio's retirement income and joint filing credits, Utah's retirement credit (D-32);
low-income and property-tax credits; itemized deductions; dependents; Indiana's county tax; Massachusetts' 4 % surtax (already disclosed); Michigan's
deduction for filers born before 1946 (would reach only filers over 80 in 2026; disclosed in its note).

## 5 · Stop conditions

Stop and report if: a primary source contradicts §0.2; anything outside the fifteen rows moves (`t67` D, MC parity beyond the measured Georgia
fingerprints); with the fifteen's additions removed the calculator differs from v6.02; a suite asserts an old figure on purpose in a way DD-14 cannot gate
honestly; the Georgia re-baseline moves a parity fingerprint that does not price Georgia.

## 6 · Build record (v6.03, 2026-10-10)

- **Source** `bba6256a1380feae47809094ac667ffd` (46 anchored edits, each counted once on v6.02: the fourteen rows' `deduct` and `years`, Idaho's and Ohio's schedules and Ohio's `notch`, the
  fifteen notes, the evaluator's `tiers` and its comment, the calculator's notch line and comment, My Data's line, the AI context line, the Field Manual's
  three state-tax sentences and its methodology sentence, the Taxes tab's footer, four version sites). **Built** `7acea8cda30fe596ad986935eefa611e` (v6.02 rebuilt byte-identical
  first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — with the fifteen's additions removed the calculator is v6.02's byte for byte, and with them every other row is (`t67` D-1,
  D-2); MC parity 10/10 with the one declared Georgia fingerprint, measured, and no other key moved; no source contradicted §0.2; every derived pin was gated
  honestly (each keeps its base; none was re-derived from the app; `t33`'s second-order engine figures were measured, as v5.97's were).
- **Measured** (scratch probe, v6.02 against v6.03, the example plan with each state selected; not shipped): Engine B's lifetime state tax falls in all fourteen
  and is byte-identical in Pennsylvania, the other 36 and "none" (the figures are in the CHANGELOG); Engine A: no strategy's tax rises, the estate-best
  strategy changes in no state.
- **`t67`** 123 (v6.03) / 6 (v6.02). **Controls 11 of 11.**
- **Hand cases** (session working `hand603.py`, Decimal, not shipped): 39, every state at least once — e.g. AZ joint 66/66, $80,000: $1,107.50; CO joint 66/64 at
  $299,999 / $300,000: $11,710.56 / $12,496.00; ID joint 66/66, $80,000: $1,580.93; IL single 66 at $250,000 / $250,001: $12,180.71 / $12,375.05; OH single 50
  at $28,450 / $28,451: $0.00 / $312.03; OH single 66 at $101,899 / $101,900: $2,315.60 / $2,365.63; UT joint 66/66, $80,000: $1,996.46; KY survivor 70,
  $50,000: $1,592.40.
- **Build decisions recorded:** a row without an income tax reads "no state income tax" on My Data (the first staging read "0.00% flat rate"; within DD-13);
  the Taxes tab's footer ("effective-rate approximations") and the methodology entry's "each flat-rate state at its one rate" were found stale at the build and
  corrected with DD-13's sentences (`t67` E-4c, `t65` E-8).
- **Corrections found by the run, owned here:**
  - §0.1 said the Engine A fingerprints price "the example household's Georgia". They price `PORTFOLIO().stateCode`, unset in `t2`'s harness, and the example
    plan files in Florida; the claim came from v6.02's CHANGELOG and D-30 entry, which are corrected in this release's notes. The measured parity diff is the
    `stateTax` key alone.
  - `t66` group D (v6.01 → v6.02) failed on the v6.02 leg of a v6.02 → v6.03 folder (it needs `app_v601.mjs`); it now reports itself not run, as `t64` and `t65` do.
- **Sources** (§0.2) re-read in the session after a research pass in three groups: Rev. Proc. 2025-32 §4.14; A.R.S. §43-1041, §43-1023, §43-1022; C.R.S.
  39-22-104(3)(p.5) and the 2025 Book 104; HB 463 and the Georgia DOR's 2026 Employer's Tax Guide; Iowa Code §422.7, §422.12 and the IA 1040 instructions;
  the 2025 Idaho Form 40 and Idaho Code §63-3024, §63-3024A; IDOR IL-700-T (2026) and the 2025 IL-1040 instructions; the 2025 IT-40 Schedule 3; the Kentucky
  DOR's 2026 standard-deduction release (KRS 141.081) and the 2025 Form 740 instructions; R.S. 47:294 and the 2025 IT-540; M.G.L. c.62 §3(B)(b) and the 2025
  Form 1 instructions; Michigan Treasury's 2026 figures; G.S. 105-153.5; R.C. 5747.02, .022, .025, .055; the Pennsylvania DOR; the 2025 TC-40 instructions.
- **Suite:** 6,135 app checks, 66 suites, 0 failed, 0 DIED; GRAND 6,265. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v602 v603 from a full clone of 7af5fbb with the github/ files overlaid (v6.02 resolved from history, commit a7bbdb5), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6043, half B GRAND 222; none DIED.
