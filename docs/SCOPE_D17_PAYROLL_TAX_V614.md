# SCOPE — v6.14 · D-17: payroll tax on job income follows the law — the 0.9% Additional Medicare Tax, and the wage cap per earner

**DRAFT — 2026-10-15, awaiting Steve's decisions (§5).** Repo-only.

A **MODELLING** release, so METHODOLOGY changes. By census (§0.3) it reaches exactly the Taxes tab (Engine B) and the strategy
comparison (Engine A), and only for a household with job income in its plan years. The example household, Engines C and D and the Monte
Carlo cannot move, and the release must prove that (§3 §C).

Steve, 2026-10-15: *"scope D-17"*. That was after I recommended it as the only open register item whose error makes plans look better than
they are.

**Built against v6.13.** Fresh clone of `origin/main` at `46ea61e` (v6.13 plus its chmod), clean. Source
`b08609bd6bf158ae5c035d9fc87297a4` and built `index.html` `6afe2ab916e2e5443b4fa4a04175688f` both equal the manifest's Current table
and the live site. The tag `v614` is free: `vercensus.cjs v614` over `qa/` and `src/` finds 0 sites. Every line number below is a v6.13
line in `src/DangerClose.jsx`, found with the parser tools (`census.cjs`, `textsites.cjs`, and a new `numlits.cjs` — an AST census of
numeric literals by value with their enclosing function, session-only).

**The scope found a second, larger defect in the same three lines** (§0.2), by sweeping for the mechanism as OPERATIONS §K2 now asks.
The payroll tax applies the Social Security wage cap to the **household's** combined job income, but the law applies it **per earner**.
Measured on one household, that costs 13 times what D-17 does. It has no register ID. This scope proposes **C-14**, and DC-1 asks
whether it ships with D-17.

---

## 0 · Premise (verified at v6.13, not assumed)

### 0.1 · The law (primary sources, read 2026-10-15)

- **26 U.S.C. §3101** (Cornell LII):
  - **(a)** imposes 6.2% "on the income of every individual" (Social Security).
  - **(b)(1)** imposes 1.45% (Medicare, hospital insurance).
  - **(b)(2)** imposes an **additional 0.9%** on wages above **$250,000 on a joint return, $125,000 married filing separately, and $200,000 in any other case**.
- **26 U.S.C. §3121(a)(1)** limits the Social Security tax to remuneration up to the contribution and benefit base "paid to an
  individual by an employer during the calendar year". The cap is **per person**, and it names only §§3101(a) and 3111(a), so Medicare
  has no cap.
- **IRS, Instructions for Form 8959 (2025)** (irs.gov/instructions/i8959):
  - Thresholds by filing status: married filing jointly $250,000; married filing separately $125,000; single, head of household and qualifying surviving spouse $200,000.
  - "The threshold amounts below **aren't indexed for inflation**."
  - On a joint return the test **combines** the spouses' Medicare wages and self-employment income.
  - Employers withhold the 0.9% only on wages over $200,000 paid to one employee. That is a withholding rule, not the liability, and it is not modelled (§4).
- **The 2026 wage base, $184,500**, is the app's `TAX_CONSTS.SS_WAGE_BASE` (L906). It was verified in the v5.73 audit's register (SSA, 24 Oct 2025).

### 0.2 · What the engines do

**Census:**
- `numlits.cjs` finds the payroll rates `0.062` and `0.0145` at exactly three sites, and `0.009` at none:

  | Engine | Function | Line |
  |---|---|---|
  | A (strategy comparison) | its sale-gain estimator `_estSaleGain` | L4905 |
  | A | its tax line | L5031 |
  | B (Taxes tab) | `computeTaxPlan` | L6339 |

  The other hits of the census values are historical-return rows and the NIIT rate.
- All three sites have the same shape:

  ```
  fica = work > 0 ? min(work, wageBase_y) × 0.062 + work × 0.0145 : 0
  ```

**Where `work` comes from:**
- `work` / `work_y` is the household's job income for the year:
  - spouse B's built-in part-time taper (`spouseBWorkTaper`, L2028: $20,000, $18,000, $15,000 in the first three plan years, and **only when no income stream is entered**);
  - plus every income stream of kind "work", **summed over both owners** (`streamsMonthlyAt`, L545, has no owner filter):
    - Engine A: `annualWork`, L4635 → L4731.
    - Engine B: L6228–6230.

**So two things are wrong:**
1. **D-17.** No 0.9% on household wages above $200,000 / $250,000. This was already registered.
2. **C-14 (new).** `min(work, wageBase)` caps the **household's** wages at one person's base. Two earners whose combined pay exceeds the base are under-taxed by 6.2% of the excess.

Both errors are optimistic: the model takes too little tax.

**Already right, and kept:**
- Medicare 1.45% is uncapped.
- Job rows only are taxed: rental, annuity and other ordinary streams carry no payroll tax (v5.63).
- A job stream stops at its owner's death (`streamsMonthlyAt`).
- The wage base is indexed (`infl`/`inflate`, 2%/yr from 2026).

**Not modelled anywhere:**
- Payroll tax in Engine C (IRMAA, which needs MAGI only), Engine D (no tax computation beyond its display column), the Roth tab's ladder, or either Monte Carlo engine. None of them has a payroll site.

### 0.3 · Measured (session-only probes `d17_probe.mjs` / `d17_proto.mjs`, run folder `runship613`, against the shipped v6.13 module)

**Setup.**
- Households: the example, plus job streams entered in My Data's shape (kind "work", tax "ordinary", no COLA), running for the first five plan years (2029–2033).
- Engine B uses the Taxes tab's own inputs: the slider's $70,000 and the plan's draws.
- "Prototype" means a session-only copy of v6.13 with all three sites replaced by one helper:
  - Social Security per earner, each capped at the year's base;
  - Medicare on everything;
  - 0.9% over $200,000 single / $250,000 joint, unindexed, on the year's filing status.

| Household | Engine B (Taxes tab): payroll tax added over 5 yrs | Of which 0.9% | Of which per-earner cap | Engine A (comparison), "current" strategy: tax / estate |
|---|---|---|---|---|
| Example (B's $20K–$15K taper) | **$0** — bit-identical | $0 | $0 | $0 / $0, bit-identical |
| A: one job, $300,000 | +$2,250 | +$2,250 ($450 a year) | $0 | +$2,250 / −$6,205 |
| A $150,000 + B $150,000 | **+$32,077** | +$2,250 | **+$29,827** | +$32,077 / **−$88,757** |
| A $120,000 + B $120,000 | +$11,227 | $0 | +$11,227 | +$11,227 / −$31,262 |
| A $60,000 + B $60,000 | **$0** — bit-identical | $0 | $0 | bit-identical |
| Single household, A $250,000 | +$2,250 | +$2,250 (over $200,000) | $0 | +$2,250 / −$4,175 |
| One job owned "joint", $300,000 | +$2,250 | +$2,250 | $0 (treated as one earner) | as the first row |

**What the table shows.**
- On every household, **Engines C and D are bit-identical** before and after, and so is every engine on the example and on the $60K + $60K couple.
- The **per-earner cap is the bigger error by far:**
  - The year-1 base is $195,793 (184,500 × 1.02³). The $150K + $150K couple is taxed on $195,793 of Social Security wages where the law taxes $300,000. That is $6,461 short in 2029.
  - D-17 alone is $450 a year at $300,000 of household wages.
- **Engine A's NO CONVERSIONS strategy moves a little less than its payroll tax** on the one-earner households: +$1,741 of tax on the $300,000 job.
  - The extra tax is paid from the taxable account, so later dividends and their tax shrink. That is a second-order effect, as expected.
  - The "current" strategy's tax moves by exactly the payroll amount.
- **Hand check, A $150K + B $150K, 2029:**
  - Law: 2 × min(150,000, 195,793) × 6.2% = $18,600; Medicare 300,000 × 1.45% = $4,350; additional 0.9% × (300,000 − 250,000) = $450. **Total $23,400.**
  - Model: min(300,000, 195,793) × 6.2% = $12,139.17 + $4,350 = **$16,489.17**. The engine's published `fica` is $16,489.
  - The difference is $6,910.83 = $6,460.83 (cap) + $450 (0.9%). It matches the probe's two columns.

**The example household cannot show either error.** It has no income streams, and B's taper peaks at $20,000. This is the OPERATIONS
§K1 case: §2.3 adds the boundary to the census.

### 0.4 · A third finding from the same read: self-employment

- The engines charge every job row the **employee** share, 7.65% up to the base.
- A self-employed person owes both halves, 15.3%, less the deduction for half of it. The Form 8959 instructions then reduce the 0.9% threshold for self-employment income by any wages.
- A retiree's consulting income is often self-employment income.
- Nothing in the app or METHODOLOGY says job rows are taxed as wages (`textsites` for `self-employ` finds nothing).
- This is an undisclosed, optimistic simplification. Modelling it needs a new choice on the job row, which is a new input. **DC-5** recommends disclosing it now and filing it.

---

## 1 · The change (recommended options)

### 1.1 · One payroll helper, three callers (DC-1 (a), DC-2 (a), DC-4 (a))

**The helper.** A module-level `payrollTax(wA, wB, wJ, wageBase, filingSingle)`:
- Social Security 6.2% on each earner's wages up to the year's base, **per earner**;
- Medicare 1.45% on all of them;
- plus 0.9% on the household total above $200,000 (Single) / $250,000 (joint), **not indexed**.

**Where the rates come from.** `TAX_CONSTS` gains `FICA_SS_RATE: 0.062`, `FICA_MED_RATE: 0.0145`, `ADDL_MED_RATE: 0.009`,
`ADDL_MED_SGL: 200000` and `ADDL_MED_MFJ: 250000`. Each gets a Verify-tab check citing §3101 and the Form 8959 instructions.
This closes the payroll third of **E-23** ("NIIT, AMT and FICA rates still inline at three sites each").

**The three sites.** L4905, L5031 and L6339 call the helper, with the year's filing status:
- Engine A `effSingle`; Engine B `effSingle`.
- Joint through the year of the first death, Single from the next, as every other threshold.

**Who earned it.** Wages are attributed per person:
- B's built-in taper → B;
- each job stream → its owner;
- a job stream owned "joint" → **split equally between the spouses (DC-3 (a))**: the conservative reading, since a split can only raise the capped Social Security tax.

`streamsMonthlyAt` gains an `owner` option, which is the one shared change outside the three sites.

**What stays as it was.**
- The wage base keeps its 2%/yr indexing (§4).
- A single household's B slot is empty, as now.

### 1.2 · What the user sees (DC-6 (a))

- The Taxes tab's FICA line includes the 0.9% when it applies. Its label stays "FICA (on earned income)", and the method note (L11138) gains one clause: the Social Security part is capped per earner and the 0.9% applies above $200,000 / $250,000.
- The Field Manual's Taxes entry (DOCS_HTML @139454, "job rows also pay FICA") and My Data's job-row note (L13766) say the same in a sentence each.
- **DC-5 (a):** the job-row note, the Field Manual and METHODOLOGY say that job income is taxed as wages (the employee's half). A self-employed person owes both halves, so their tax is understated here.

### 1.3 · METHODOLOGY

- L124 ("FICA on earned income only") and L1027–1031 are corrected.
- A short section, "Payroll tax on job income (v6.14)", states:
  - the rule;
  - the per-earner cap and the joint-row split;
  - what v6.13 did, with §0.3's numbers;
  - the self-employment simplification;
  - the wage base's 2%/yr indexing.

### 1.4 · Version bump to v6.14

The four in-app sites.

---

## 2 · Site census

### 2.1 · App (v6.13 lines; re-run at the build and recorded in §7)

| Site | Line | Change |
|---|---|---|
| `TAX_CONSTS` | L882–907 | five keys (DC-4) |
| Verify-tab checks | near L1958–1963 | five checks (DC-4): the in-app check count moves |
| `streamsMonthlyAt` | L545 | `owner` filter |
| new `payrollTax` | module level, beside `spouseBWorkTaper` (L2028) | §1.1 |
| Engine A, sale-gain estimate | L4905 | calls the helper |
| Engine A, tax line | L5031 | calls the helper; per-person wages beside `work` (L4731) |
| Engine B | L6339 (and the work split at L6228–6230) | calls the helper |
| Taxes tab method note | L11138 | one clause |
| My Data job-row note | L13766 | one clause (+ DC-5) |
| Field Manual, Taxes / streams entry | DOCS_HTML @139454 | one sentence (+ DC-5) |
| Engine C, Engine D, the ladder, both Monte Carlo engines | — | **unchanged** (no payroll site), asserted by §3 §C |

### 2.2 · Suites

- Suites that pin payroll tax will move only on households with job streams above the thresholds, or with two earners above the base.
- The build runs the full suite against a prototype first and lists every suite that moves, as at v6.12.
- Expected, from the census of their fixtures:
  - `t33` (the Roth optimizer's job-row payroll tax; its fixture's job is a `joint` $18,000 a year, under every threshold, so it should not move);
  - `t18` (Engine B exact);
  - `t2`.
- Any Verify-tab count pinned by a suite moves with DC-4. The build finds it by parser, not by expectation.
- MC parity must stay 10/10: the Monte Carlo has no payroll site.

### 2.3 · Census and registration

- **`qa/tools/boundaries.mjs` + `t29` (§K1).** A row `payroll` reads ON for the example ("no job stream; B's taper under every threshold"). It is clear when household job wages exceed $200,000 / $250,000, or when two earners together exceed the year's base.
- **Version registration** of `v614`: by AST plus the hand-edited registries, as at v6.13.

---

## 3 · Tests — new `qa/t77_payroll_tax.mjs`, both legs (v6.13 prior, v6.14 current)

The v6.13 leg pins D-17 and C-14 as dated `[KNOWN DEFECT]` checks, reproduced by the old rule. Dollar-exact throughout: Engine B
publishes `fica` per row.

**§A · the oracle, every year.**
- An independent payroll computation:
  - its own rates and thresholds from §0.1, typed from the sources and never read from `TAX_CONSTS`;
  - its own per-person attribution read from the household's streams;
  - its own filing switch.
- It must reproduce Engine B's `fica` to the cent, every year, on the seven households of §0.3 plus a survivor case: A's $300,000 job running past B's death, so it crosses joint → Single, $250,000 → $200,000.
- Each leg is reproduced by its own rule, and by not the other's.

**§B · Engine A.**
- **By AST:** all three payroll sites call the helper, and **no `0.062`, `0.0145` or `0.009` literal survives outside `TAX_CONSTS`**. This is the extinction check, in the shape of `t75`'s `× 0.85` check.
- On the five households where payroll moves, the "current" strategy's lifetime tax moves by exactly the oracle's payroll difference. This is pair-gated to v6.13 → v6.14, and designed to skip on other pairs.

**§C · what cannot move.**
- Engines C and D, and the bridge series, are bit-identical v6.13 → v6.14 on every household.
- Every engine is bit-identical on the example and on the $60K + $60K couple.

**§D · the hand-verified pin.** §0.3's 2029 figure for A $150K + B $150K: **$23,400.00** (v6.14) and **$16,489.17** (v6.13).

**§E · copy.**
- The Taxes tab's method note, My Data's job-row note and the Field Manual carry the new sentences, including DC-5's.
- One rendered Taxes-tab year on the $150K + $150K household shows the FICA figure the engine computed, read through `window.__g` (OPERATIONS §C).

**Controls** — `qa/tools/controls_v614_payroll.py`, repo-only and release-pinned. The planted defects:
- the household cap back;
- the 0.9% dropped;
- the threshold indexed;
- the threshold fixed at joint in Single years;
- a joint row given to one spouse;
- a literal `0.0145` back in Engine A;
- the oracle's attribution dropped (a test mutant);
- the method-note clause removed;

plus the unmutated run.

---

## 4 · Out of scope, and stop conditions

**Out of scope:**
- **Self-employment tax** (15.3%, the half-deduction, the shared 0.9% threshold): DC-5 discloses it and files it. Modelling it needs a job-row choice.
- **The wage base's indexing.**
  - The app inflates the 2026 base 2%/yr. SSA indexes it to the national average wage index, which has usually risen faster than 2% a year, so later-year caps likely run a little low. That is optimistic, but small, and each annual refresh resets the base year.
  - It is stated in §1.3's section, not changed.
- **Withholding** (the employer's $200,000-per-employee rule) and the **excess Social Security credit** for one person with two employers. These are timing and refund mechanics with no effect on liability.
- **Employer-side payroll tax.** It is not the household's tax.
- **Head-of-household and qualifying-surviving-spouse status (D-16).** All three of those statuses share the $200,000 threshold with Single, so D-16 does not change this rule.
- **The 2027 annual refresh.** That is its own release. When it lands it must carry DC-4's five keys in the new constants block.

**Stop and report** (do not adapt) if:
- the build's census finds a fourth payroll site;
- any engine but A and B moves on any household;
- any engine moves on the example;
- MC parity is anything but 10/10;
- §0.3's hand figure does not reproduce.

---

## 5 · Decisions for Steve

Each has a recommendation. "Recommended" means what I would do; it is your call.

**DC-1 — Fix the per-earner wage cap (C-14) in the same release?**
- **(a) Recommended: yes.** It is the same three lines and the same helper, and the bigger error: about $6,000 a year for a couple each earning $150,000. Shipping D-17 alone would fix the $450 and leave the $6,000.
- (b) D-17 only, with C-14 filed for later.

**DC-2 — Model the 0.9% or only disclose it?**
- **(a) Recommended: model it.** Once the helper exists it is one term, and disclosure-only would leave a known, computable understatement in place.
- (b) Disclose only.

**DC-3 — A job stream owned "joint".**
- **(a) Recommended: split it equally between the spouses.** That is the conservative reading: it can only raise the capped Social Security tax. Stated in the job-row note.
- (b) Treat it as one person's job.

**DC-4 — Where the rates live.**
- **(a) Recommended: five new `TAX_CONSTS` keys with Verify-tab checks citing §3101 / Form 8959.** This closes E-23's payroll third.
- (b) Literals inside the one helper. One site instead of three, but still outside the constants block.

**DC-5 — Self-employment income.**
- **(a) Recommended: disclose now and file it as D-36.** The job-row note, the Field Manual and METHODOLOGY say job income is taxed as wages, the employee's half. Filed in `MissingFeatures.md` for a later job-row choice.
- (b) Leave it.

**DC-6 — How the 0.9% shows.**
- **(a) Recommended: inside the existing FICA line, with the method-note clause.**
- (b) Its own column on the Taxes tab: more table width for a tax few households pay.

---

## 6 · Register housekeeping at ship (not decisions; corrections the release carries)

- **`docs/MissingFeatures.md`:**
  - D-17 → **CLOSED v6.14** (modelled per DC-2).
  - **D-36** added (self-employment tax; disclosed v6.14, modelling open) per DC-5.
- **`docs/FlawsToFix-v5_73-Phase2.md`:** **C-14** added and marked **FIXED v6.14**, with §0.2–§0.3's evidence. It is filed and fixed in one release, as C-12 was at v5.77.
- **`docs/ARCHITECTUREIssues.md`:** E-23 → **NARROWED**: payroll rates in `TAX_CONSTS`, and one helper. NIIT and AMT remain inline.
- **The scheduled task "Danger Close — 2027 tax constants prep"** (runs 15 November) lists the `TAX_CONSTS` keys its block must keep. After this release its key list is short by five.
  - That task's instructions are yours to change. I'll raise it again when this ships, as a decision, not as a release item.

---

## 7 · Build record

*(Filled at the build.)*

---

**Destination:** repo `docs/SCOPE_D17_PAYROLL_TAX_V614.md`. **Not pooled** (OPERATIONS §G: scope documents are repo-only).

**Session-only material** — the probes `d17_probe.mjs` and `d17_proto.mjs`, the prototype `v613p.jsx`, and `numlits.cjs`. They are named
here so the numbers can be traced, and they expire with the session.
