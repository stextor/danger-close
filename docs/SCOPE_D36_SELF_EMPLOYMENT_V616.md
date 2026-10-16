# SCOPE — v6.16 · D-36: a self-employed person's job income pays self-employment tax

**FULFILLED — shipped as v6.16, 2026-10-16.** Steve: *"go"* — all six decisions (a), as recommended. Build record in §7. Repo-only.

This is a **MODELLING** release, so METHODOLOGY changes. By census (§2) it reaches the payroll helper and its two engines: the Taxes tab
(Engine B) and the strategy comparison (Engine A). It moves only a household with a job row marked self-employed, and only in that row's
years. The example household, the IRMAA and Withdrawal engines, the Roth tab's ladder and both Monte Carlo engines cannot move, and the
release must prove that (§3).

Steve, 2026-10-16: *"yes"*, to scoping D-36 next. I recommended it because it is the only open item in the registers whose error makes
plans look better than they are.

**Built against v6.15.** I made a fresh clone of `origin/main` at `7ee5470` (v6.15 plus its chmod) and it is clean. The source is
`a9520db52dc06aa380714c8a2a5c7514` and the built page is `38f51c212390ec41669fb9fb8246f024`. Both equal the v6.15 release verified on
2026-10-16. The tag `v616` is free: `vercensus.cjs v616 qa src` finds 0 sites. Every line number below is a v6.15 line in
`src/DangerClose.jsx`, found with the parser tools:

- `census.cjs` and `textsites.cjs` for the app;
- `suitetext.cjs` and `idsites.cjs` for the suites.

The measurements in §0.3 come from a session-only prototype, `proto616/v616p.jsx`, built against the shipped v6.15 module. They are not
shipped.

---

## 0 · Premise (verified at v6.15, not assumed)

### 0.1 · The law (primary sources, read 2026-10-16)

- **26 U.S.C. §1401(a):** *"a tax equal to 12.4 percent of the amount of the self-employment income."*
- **26 U.S.C. §1401(b)(1):** *"a tax equal to 2.9 percent of the amount of the self-employment income."*
- **26 U.S.C. §1401(b)(2):** an extra 0.9% of self-employment income above $250,000 on a joint return and $200,000 otherwise. Per
  (b)(2)(B), those amounts are *"reduced (but not below zero) by the amount of wages taken into account"* for the employee-side tax.
  Combined with §3101(b)(2), this means the 0.9% falls on the household's wages plus self-employment income above the threshold.
- **26 U.S.C. §1402(a)(12):** net earnings are figured after a deduction equal to net earnings × one-half of the §1401(a) and (b)(1)
  rates. That is 7.65%, so 92.35% of net profit is taxed, and the 0.9% is left out of that factor.
- **26 U.S.C. §1402(b):** self-employment income excludes:
  - for the 12.4%, any part above *the contribution and benefit base minus the individual's wages*. So the wage base is shared with that
    person's paycheck, earner by earner;
  - all of it if net earnings are *"less than $400."*
- **26 U.S.C. §164(f):** a deduction for *"one-half of the taxes imposed by section 1401 (other than the taxes imposed by section
  1401(b)(2))"*. Under §62(a)(1) it is taken above the line, so it lowers AGI and every MAGI built on AGI.
- **IRS, Instructions for Schedule SE (2025):** they are on irs.gov. They give $176,100 as 2025's maximum self-employment income subject to
  Social Security tax (the app carries 2026's $184,500). They send the 0.9% to Form 8959 and repeat that wages reduce its threshold for
  self-employment income.

### 0.2 · What the app does today

- **Job rows are taxed as wages.** Every job row is taxed as a paycheck: the employee's 7.65%. Social Security is capped per earner, and
  the 0.9% applies to household wages (v6.14, `payrollTax` L2047, `workEarners` L2058).
- **Three callers.** `payrollTax` is called at three sites: Engine A L4931 (the ACA-cliff solver) and L5057, and Engine B L6366.
- **No self-employment marker.** An income stream has no field that says "self-employed". The My Data editor offers the types Rental,
  Job (part/full-time), Annuity and Other (L13805). The save path, `buildPortfolio` (L13010), keeps an explicit list of fields, so a new
  field has to be added there and in the editor's initial state (L12847).
- **Disclosed, not modelled.** The gap has been disclosed since v6.14 in four places:
  - the Taxes tab's method note (L11163);
  - My Data's stream note (L13791);
  - the Field Manual's streams entry (DOCS_HTML @≈139608);
  - METHODOLOGY's *Payroll tax on job income*.

  `t77` E-4 asserts the disclosure is present. That is a lock this release has to invert (§2.2).
- **Engines that carry no payroll tax:**
  - Engine C (the IRMAA tab, L5385);
  - Engine D (the Withdrawal tab, L5692);
  - the Roth tab's ladder (L10214);
  - both Monte Carlo engines (L2515, L2578, L2699, L2807).

  None of them calls `payrollTax`, so a change confined to it and to `workEarners` cannot reach them.

### 0.3 · Measured (prototype vs the shipped v6.15, Engine B, job rows in the first five plan years, 2029–2033)

The prototype applies §0.1 in full except the §164(f) deduction (DC-2 (a)). Each figure is the year-2029 payroll tax and the five-year
change.

| Household (example plus) | 2029 payroll, v6.15 → prototype | 5-yr change | Lifetime total tax change |
|---|---|---|---|
| example household (no job rows) | $1,530.00 → $1,530.00 | $0 | $0, rows identical |
| A employee $60,000 | $4,590.00 → $4,590.00 | $0 | $0, rows identical |
| **A self-employed $60,000** | $4,590.00 → **$8,477.73** | +$19,438.65 | +$19,438.65 |
| A self-employed $30,000 + B employee $40,000 | $5,355.00 → $7,298.87 | +$9,719.32 | +$9,719.33 |
| A employee $150,000 + A self-employed $60,000 (one person) | $15,184.16 → $18,760.21 | +$19,374.64 | +$19,374.64 |
| A self-employed $250,000 | $15,764.16 → $30,973.69 | +$78,524.54 | +$78,524.54 |
| single, A self-employed $120,000 | $9,180.00 → $16,955.46 | +$38,877.30 | +$38,877.30 |
| A self-employed $430 a year (below the $400 floor) | $32.90 → $0.00 | −$164.48 | −$164.47 |

**Hand checks, to the cent.**

- **$60,000 self-employed:** 60,000 × 0.9235 = 55,410.00, × 15.3% = **$8,477.73**.
- **One person with a $150,000 paycheck and $60,000 of consulting, 2029:**
  - The wage base is 184,500 × 1.02³ = 195,792.88.
  - Employee half on the wages: 150,000 × 7.65% = 11,475.00.
  - Social Security room left after the wages: 195,792.88 − 150,000 = 45,792.88, × 12.4% = 5,678.32.
  - Medicare on the net earnings: 55,410 × 2.9% = 1,606.89.
  - The 0.9% does not apply: 150,000 + 55,410 = 205,410, below $250,000.
  - Total **$18,760.21**.
  - v6.15 taxed $210,000 as wages: 195,792.88 × 6.2% + 210,000 × 1.45% = $15,184.16.

**The change is all payroll tax.** In every row the lifetime change in total tax equals the payroll change, so nothing else in Engine B
moved.

**Engine A:**

- On the $60,000 household, every strategy pays $19,329–$19,439 more tax, and the estate falls by $53,299–$53,602.
- On the $250,000 household, tax rises $70,638–$78,525 and the estate falls $194,549–$216,229. The strategies' second-order effects
  differ there, which is why the range is wider.
- On the example household, all seven strategies are identical.

**The $430 row falls.** That is the law: §1402(b)(2) excludes net earnings under $400. Today it pays the employee's 7.65%.

**The direction.** For anyone self-employed above the floor it is up, which is conservative and matches the law. It corrects an optimism.

### 0.4 · What this scope does not fix, and its direction

- **§164(f), the deduction for half the tax** (DC-2). Leaving it out overstates federal income tax by half the self-employment tax times
  the marginal rate. On $60,000 that is $4,238.87 × 12–22%, about $509–$933 a year. It also keeps AGI and MAGI higher by the same
  $4,238.87, which affects IRMAA, the ACA subsidy, the Social Security worksheet and state AGI. The direction is conservative. Taking the
  deduction correctly means changing MAGI in the IRMAA, Withdrawal and Roth-ladder engines too, or the tabs would disagree, and `t40`
  asserts that they agree. That is a wider release.
- **The §199A qualified business income deduction.** It is up to 20% of a sole proprietor's net profit, with limits for service
  businesses above the income thresholds. It is not modelled. The direction is conservative, because federal income tax is overstated.
- **Net losses, and the optional methods on Schedule SE.** These are not modelled; a stream is never negative.

---

## 1 · The change (recommended options)

### 1.1 · The rule (DC-1 (a), DC-2 (a), DC-6 (a))

`payrollTax` stays the one copy of the rule and keeps its three callers and its signature. `workEarners` returns each person's paycheck
wages and self-employment profit: `{ w: [...], se: [...] }`. A job row owned jointly is split equally, as wages are (v6.14 DC-3). For each
person:

- **Paycheck wages:** Social Security 6.2% up to the base, and Medicare 1.45% on all of it. This is unchanged.
- **Net earnings:** profit × (1 − `FICA_SS_RATE` − `FICA_MED_RATE`), which is 0.9235. It counts only if it is at least `SE_MIN_NET`
  ($400, statutory; a new `TAX_CONSTS` key).
- **12.4% Social Security** (2 × `FICA_SS_RATE`) on net earnings, up to the base minus that person's wages.
- **2.9% Medicare** (2 × `FICA_MED_RATE`) on all net earnings.

Then, for the household: 0.9% on wages plus net earnings above $200,000 or $250,000 on the year's filing status.

There are no new rate literals. Every rate is derived from the payroll constants `t77` B-2 already guards. `streamsMonthlyAt` gains one
filter, `opts.se`, which no existing caller passes.

### 1.2 · The input (DC-3 (a), DC-4 (a))

- **The Type dropdown.** It offers **"Job — employee (W-2)"** and **"Job — self-employed (1099)"** in place of "Job (part/full-time)". Both
  store `kind: "work"`, and the second adds `selfEmployed: true`. So every site that keys on `kind === "work"` (L2059, L4660, L4662, L5692,
  L6254, L6255, L8156, L13114, L13838) keeps working.
- **Rows already saved without the field** are employees. Their figures do not move, and the job-row note asks the user to choose.
- **Persistence.** The editor's state, `buildPortfolio`, the backup export and import all carry the field.
- **Labels.** The Income tab's stream list (L8156) and the Ask AI context (L13114) say "self-employed" for such a row.

### 1.3 · What the user reads

The four disclosures (§0.2) stop saying self-employment is not modelled. Instead they state the rule:

- both halves on 92.35% of the profit;
- the $400 floor;
- the base shared with the same person's paycheck.

They also state the two remaining simplifications: half the tax is not deducted (DC-2), and the QBI deduction is not taken. MissingFeatures
D-36 closes, and D-37 opens for §164(f) if DC-2 (a) is chosen.

### 1.4 · METHODOLOGY and the version

- **METHODOLOGY:** *Payroll tax on job income* gains a self-employment subsection with the §0.3 measurements, and its "Simplifications,
  stated" paragraph is rewritten.
- **Version:** v6.16, at the four in-app sites and through the registrar. `t1`'s and `t4`'s version arms and `t33`'s PINS are reviewed by
  hand **before** the first full run, as v6.15's CHANGELOG requires. The three Python suites are registered by hand.

---

## 2 · Site census

### 2.1 · App (v6.15 lines; re-run at the build and recorded in §7)

| # | Site | Change |
|---|---|---|
| A1 | `TAX_CONSTS` | adds `SE_MIN_NET: 400` (plus a Verify-tab check citing §1402(b)(2)) |
| A2 | `streamsMonthlyAt` L545 | the `opts.se` filter |
| A3 | `payrollTax` L2047, `workEarners` L2058 | the rule (§1.1) and the comment block |
| A4 | Engine A L4757, L4931, L5057; Engine B L6366 | none expected: the call sites stay textually the same |
| A5 | My Data editor L12847 (state), L13010 (`buildPortfolio`), L13805 (dropdown), L13791 and L13838 (notes) | input and copy |
| A6 | Income tab L8156; Ask AI context L13114 | the label |
| A7 | the Taxes tab's method note L11163; Field Manual @≈139608 | copy |
| A8 | four version sites | v6.15 → v6.16 |

Verify-tab count: if A1 adds one check, the count goes 71 → 72, and `t1` and `t4` re-gate their Verify count. That is a value arm, so it
is reviewed by hand.

### 2.2 · Suites

| Suite | Why | Change |
|---|---|---|
| `t77` E-4 | Asserts "a self-employed person owes both halves" is disclosed. That is a lock that goes false at v6.16. | Gated per leg: v6.15 keeps it, and v6.16 asserts the new rule's text. |
| `t77` §A | The oracle has no self-employment term, and its households carry no `selfEmployed` field. | Unchanged on both legs: the rows are identical, as §0.3 measured for employee-only households. |
| `t1`, `t4` | version arms; the Verify count if A1 adds a check | reviewed by hand |
| `t33` | PINS | v6.15's values (its households have no self-employed row) |
| `t29` / `tools/boundaries.mjs` | §K1: the example has no self-employed row, so this defect was invisible there | a new census row `self_employed`, plus a fixture that turns it ON |
| `t5`, `t38` | storage and import round trips | must stay green; `t79` adds the field's own round trip |

`idsites.cjs` finds no suite calling `payrollTax` or `workEarners` directly. `suitetext.cjs` finds the self-employment disclosure text only
in `t77`, at L206 and L210.

---

## 3 · Tests — new `qa/t79_self_employment.mjs`, both legs (v6.15 prior, v6.16 current)

- **A · An oracle typed from §1401/§1402.** Its own rates, the 0.9235 factor, the $400 floor and the shared base. It reproduces Engine B's
  payroll tax to the cent, every year, on the eight households of §0.3 plus two more:
  - a joint-owned self-employed row;
  - a survivor who crosses from joint to Single while still self-employed.

  The prior leg is reproduced by v6.15's rule, and not by the new one.
- **B · By AST.**
  - `payrollTax` is still called at exactly three sites.
  - No 0.124, 0.029, 0.153 or 0.9235 literal exists anywhere.
  - `SE_MIN_NET` is read, not typed.
- **C · Across the pair.**
  - Households with no self-employed row are bit-identical in Engines A and B.
  - Engines C and D, the withdrawal series and both Monte Carlo engines are bit-identical on every household.
  - Engine A's "none" strategy moves by exactly Engine B's payroll change.
- **D · The hand pins:** $8,477.73 and $18,760.21; the $400 floor; and the 0.9% on $250,000 of self-employment.
- **E · The input.**
  - The dropdown offers both job types.
  - Choosing self-employed and pressing Save & Apply persists the field.
  - It survives export and import.
  - A row saved without it reads as an employee.
- **F · The copy.**
  - The four disclosures state the rule.
  - "Not modelled" is gone for self-employment.
  - The §164(f) and QBI simplifications are disclosed.

**Controls**, in `qa/tools/controls_v616_se.py`, each one planted defect:

- the 92.35% factor dropped;
- the $400 floor dropped;
- the base not reduced by the person's wages;
- the 0.9% ignoring net earnings;
- a joint row given wholly to A;
- the field lost on save;
- a stray `0.124`;
- the old disclosure restored;
- plus the unmutated run.

---

## 4 · Out of scope, and stop conditions

**Out of scope:**

- the §164(f) deduction (DC-2 (b)/(c) would make it a separate release, D-37);
- the QBI deduction;
- losses and the optional methods;
- Social Security credits earned by self-employment;
- the retirement earnings test;
- withholding and estimated-tax timing.

**STOP and report if:**

- any engine other than A and B moves on any household;
- an employee-only household moves;
- a suite outside §2.2 turns red.

---

## 5 · Decisions for Steve

**DC-1 · Model self-employment tax now, or keep it disclosed only?**
- **(a) Model it per §1401/§1402**, as §1.1 describes. **Recommended.** It is the only open optimistic item, and on a $60,000 consulting
  income the understatement is $3,888 a year.
- (b) Keep the disclosure only.

**DC-2 · The deduction for half the self-employment tax (§164(f)).**
- **(a) Not taken anywhere, and disclosed** (filed as D-37). **Recommended.** It is conservative: about $509–$933 a year too much income
  tax on $60,000 of profit. It is also consistent: no tab's MAGI changes, so the IRMAA, Withdrawal and Taxes tabs keep agreeing (`t40`).
  It keeps this release to the payroll helper.
- (b) Taken in Engines A and B only. That is exact for their income tax, but the Taxes tab's MAGI would then differ from the IRMAA and
  Withdrawal tabs'.
- (c) Taken everywhere, in Engines A, B, C, D and the ladder. That is exact, but it is a much wider release, so it gets its own scope.

**DC-3 · The input.**
- **(a) Two job types in the existing Type dropdown** — "Job — employee (W-2)" and "Job — self-employed (1099)" — with no new column.
  **Recommended.** The table is already 760 pixels wide.
- (b) A new "self-employed" checkbox column, shown on job rows.

**DC-4 · Job rows saved before v6.16.**
- **(a) Read as employees, so today's figures do not move.** The job-row note asks the user to check the type. **Recommended.** The app
  should not guess someone's employment status.
- (b) Read as self-employed. That is the more conservative reading, but it changes every saved plan that has a job row.

**DC-5 · The QBI deduction (§199A).**
- **(a) Not modelled; disclosed.** **Recommended.** Its direction is conservative, and its limits for service businesses need inputs the
  app doesn't have.
- (b) Model it. That is its own scope.

**DC-6 · A jointly owned self-employed row.**
- **(a) Split equally between the spouses, as wages are (v6.14 DC-3).** **Recommended.** The split can only raise the capped Social
  Security tax.
- (b) Give it all to A.

---

## 6 · Register housekeeping at ship

- D-36 closes.
- If DC-2 (a), D-37 opens: §164(f) not taken, conservative.
- The §199A deduction gets a line in D-37's entry, or its own ID if Steve prefers.
- The §K2 mechanism sweep was run 2026-10-16. It searched `FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md` and
  `UsabilityFlaws.md` for `payrollTax`, "self-employ", "both halves", "164(f)", "199A" and "Schedule SE". It found only D-36 itself, and two
  items this release leaves as they are:
  - C-14 (fixed at v6.14);
  - E-23, whose payroll rates stay in `TAX_CONSTS`. The new rates are derived from them, so E-23 needs no change.

---

## 7 · Build record

**Built against v6.15** (`a9520db5…` / built `38f51c21…`); the v6.15 page was rebuilt first and reproduced `38f51c212390ec41669fb9fb8246f024`.
**v6.16:** source `dfc07ee74ad9dd52c0925f54bee0a682`, built `index.html` `765cd89f6c5d97a937f2fa2e7405ee64`; `smoke_built` 22 of 22.
Decisions: DC-1 to DC-6 all **(a)**.

**Census at the build (v6.16 lines, `census.cjs`).** `payrollTax` defined L2059, called at L4953 (`_estSaleGain`, Engine A), L5079 (Engine A's
tax line) and L6388 (Engine B) — three, as before. `workEarners` L2076, called at L4779 and L6388. `SE_MIN_NET`: L916 (`TAX_CONSTS`), L1980 (the
Verify check), L2065 (read in `payrollTax`). `selfEmployed`: L563 (`streamsMonthlyAt`'s filter), L8178 (Income tab label), L12873 (editor state),
L12877 (`setStreamType`), L13044 (`buildPortfolio`), L13140 (the Ask AI context), L13830 (the dropdown). Version: four sites; registrar 314 sites.

**Tests.** `t79`: 116 on v6.16, 60 on v6.15. `t29` 73 → 78 per leg (the `self_employed` row). Controls `qa/tools/controls_v616_se.py` 9 of 9,
files restored and hash-checked. Full suite from the packaged copies: {SUITE}

**STOP conditions.** No engine but A and B moved on any household (Engines C and D, the bridge series and both Monte Carlo engines are
bit-identical on all thirteen of `t79`'s households); no employee-only household moved in A or B. **One suite outside §2.2 went red on the
first full run: `t78` D-2a**, on both legs. I read the check before acting: it is a SETUP assertion that the run folder's built page "names
v6.15" — a typed version string, which every version bump breaks, and which my pre-run review of the value arms missed. It says nothing about
a figure, so it does not bear on this scope's premise; it now derives the version from the newest source in the run folder (and fails against
v6.15's page in a v6.16 folder, checked). Recorded here because the condition's letter was met.

**Where the build departed from §3, owned.**
- **§3 C overstated Engine A.** It said the "none" strategy moves by *exactly* Engine B's payroll change. Measured, that holds to the dollar on
  four households ($60,000; $30,000 + $40,000; $150,000 + $60,000; $200,000 + $60,000) and not on five: Engine A carries balances forward, so
  the extra tax leaves less invested and later IRMAA, survivor-year tax and NIIT fall a little (joint-owned $300,000: $74,573 against
  $96,160.50; single $120,000: $38,825 against $38,877.30; under the floor, $430: −$149 against −$164.48). Instrumenting a session-only copy
  of the module showed every strategy's first-year tax moving by exactly Engine B's figure on every household. §0.3's own Engine A range at
  $250,000 ($70,638–$78,525) already showed this, so it was a drafting error in §3, not a changed premise. `t79` C-4 asserts the exact form on
  the four and, on the rest, the same direction, no larger, and at least 75% of it; C-5 asserts the estate moves the other way.
- **§3 D's "0.9% on $250,000 of self-employment"** does not bite on a joint return: $250,000 of profit is $230,875 of net earnings, under
  $250,000. The pin is taken on a single filer instead ($31,251.57), plus one §3 did not list: a $200,000 paycheck with $60,000 of profit
  ($16,694.74 — no Social Security room left, and the 0.9% on wages plus net earnings).
- **Additions beyond §3:** a second `t29` fixture under the $400 floor (the row must stay ON — it reads the floor, not merely the flag); `t79`
  E-7 (the Income tab's label), E-9 (the Ask AI context in the backup) and E-10 (switching back to employee clears the field).

---

**Destination:** repo `docs/SCOPE_D36_SELF_EMPLOYMENT_V616.md`. **Not pooled** (OPERATIONS §G: scope documents are repo-only).
