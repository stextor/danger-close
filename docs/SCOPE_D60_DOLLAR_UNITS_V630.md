# SCOPE — D-60: one dollar unit and one inflation clock for the tax engines (target v6.30)

| Field | Value |
|---|---|
| Build scoped against | **v6.29** · `src/DangerClose.jsx` md5 `2b1c24f145c10e5d5e2b8abfdf3a9db8` · built `index.html` `ce3605afdbafaa292bed443988f6ea33` · repo `1dc0d49` (full clone) |
| Freshness (§A) | Pool source = manifest Current = clone = measurement copy = `2b1c24f1…`, checked 2026-10-22 after the v6.29 upload |
| Register item | MissingFeatures **D-60** (filed at v6.29). Closes or changes E-9, E-22 (narrows), C-13 (reason re-worded), METHODOLOGY's *dollar basis* sections and its two *no growth* passages. Files a new item, **D-64** (§0.7) |
| Status | **FULFILLED — built as v6.30 (§7, the build record).** Decided 2026-10-22, all nine as recommended (§5); reviewed once (§6). ⚠ §0.4's REC figures include a carried contribution accrual, against DU-7 (a); the build corrected it — §7 and the CHANGELOG give the built figures |
| Measurements | A session-only prototype (§0.3), never shipped: builds `d60a` → `d60v` of the v6.29 source, each adding one switch, and seventeen measurement scripts (`m1`–`m17`). Figures are prototype figures; the build recomputes every one and its suite asserts its own |

Steve, 2026-10-22: *"D-60"*. On the scope: *"All as recommended"* — DU-1 (a), DU-2 (a), DU-3 (a), DU-4 (a), DU-5 (a), DU-6 (a),
DU-7 (a), DU-8 (a), DU-9 (a).

---

## 0 · Premise — verified against v6.29

### 0.1 What D-60 registered, and what is true

D-60 says Engines A, B and C mix dollar units. **Confirmed in source.** Engine B (`computeTaxPlan`, L6490–6858):

| Quantity | Units it is held in | Where |
|---|---|---|
| Social Security | today's dollars, flat | `annualSSA` / `annualSSB` L6586–6587 |
| Pension, built-in spouse-B work, income streams | today's dollars, flat (COLA streams not grown) | L6637, L6589, L6644–6645 |
| Spending draws taken from Engine D | Engine D's dollars **deflated back** to today's | the bridge, `withdrawalPlanSeries` L6476 |
| Taxable-account dividends | today's dollars, flat (`_taxableInit × yield`) | L6698 |
| RMDs | **nominal** — off a Traditional balance growing 4.5%/yr from today's balance | `tradGrowth` L6613, L6825 |
| Conversions | the slider, a constant | L6681 |
| Realized gains | Engine D's dollars, **not** deflated | L6687 |
| Brackets, standard deduction, age-65 extra, LTCG and AMT figures, QCD limit, wage base | grown 2%/yr from the as-of year | `inflate` L6534 (read at L6541, 6553, 6571, 6679, 6712, 6744–6749, 6755); `seniorExtraFor` L6714 |
| §86 thresholds, NIIT, Additional Medicare, the OBBBA senior deduction, state figures | fixed, as the law states them | — |

Engine C (`computeIrmaaPlan`, L5682–5883) has the same shape — SS, pension, work and streams flat (L5745–5778), draws deflated
(L5832), gains not (L5809), a hard-coded 1.045 balance growth (L5875), tiers at 2% (`irmaaThresholdFor` via `irmaaTierFor` L5731, and
L5850) and the 2026 surcharge amounts flat (L5848). Engine A (`runRothStrategies`, L5013–5664) likewise — `infl` at 1.02 (L5022), SS
and pension flat (L5047–5048, L5148), deflated draws (`DRAW` L5027), balances nominal (`GROWTH` L5021), the ACA benchmark already
grown in calendar dollars (L5062) against an FPL grown at a 2% proxy (`acaFplFor` L2141).

So a row of the Taxes tab adds today's-dollar Social Security to a nominal RMD and taxes the sum against brackets grown at 2%. The
figure is neither each year's own dollars nor today's.

### 0.2 Two inflation clocks — the part D-60 named in one sentence, measured here

| Clock | Who runs on it | What a fixed-dollar input means there |
|---|---|---|
| **As-of clock** — prices grow from the as-of date | the Monte Carlo (both engines: `inflationCum` starts at 1 in quarter 0, the as-of date, L3000/L3054 — compounded **quarterly** from the as-of month), the Guardrails table (L7481–7489), Engines A, B, C's thresholds, the ACA benchmark | the amount paid that year (the MC pays a non-COLA pension and a non-COLA stream flat from today, `penCola`, `streamsMonthlyAt`) |
| **Retirement clock** — prices grow from the retirement year | Engine D (`_wInflator` L5994), the bridge's deflator (L6476), What Breaks (`cumInf` starts at 1 in the retirement year, L12273) | today's prices **at retirement**: a $900 pension in a plan retiring in five years is $900 × (1+i)^5 in that year's dollars |

**Measured consequence:** on the retirement clock, Engine D's **balances** cannot see the years between today and retirement. The
example household with every date moved nine years later (retiring 2038 instead of 2029) gives Engine D the same balances to the
dollar — first row $1,635,452, last row $3,008,839 in both (`m14`). Other fields do differ: lifetime RMDs $499,644 vs $566,921, the
bracket column (22% vs 12% in the second year, because it indexes from the as-of year) and the ordinary draw handed to Engines A–C
($373,369 vs $376,758) — `m17`. The RMDs differ because the contribution accrual reaches Engine D's Traditional share but not its
balance (§0.7). On the as-of clock the same plan ends $51,837 lower in today's dollars (−3.1%, §0.4).

**What the input form says fits either clock.** The streams form asks for *"today's dollars per month"* (L14287) and says an unchecked
COLA *"stays flat and loses buying power"* (L14288). The facts that separate the clocks are outside the form: a pension statement and
a fixed annuity contract state **nominal** amounts, and the Monte Carlo already pays them flat from today. The retirement clock is the
one engine family that prices them at retirement.

### 0.3 Method

A measurement prototype (`proto_all.py` and follow-on edits, `d60a` → `d60v`) patches the v6.29 source with one module switch, `D60`:

- **frame on:** Engines A, B and C compute each year in that year's own (calendar) dollars — Social Security, COLA streams,
  dividends and the draws × kA = (1+i)^(yr − as-of); fixed inputs (pension, non-COLA streams, slider, built-in work, QCD) × fx;
  balances carried to retirement × reb = (1+i)^(R − as-of) **with cost basis left nominal**; gains on Engine D's clock; tax ÷ kA reported
  as today's dollars, which the Monte Carlo grows with each path's inflation exactly as now;
- **clock:** `retire` (fx = reb; Engine D untouched) or `asof` (fx = 1; Engine D's inflator from the as-of year, its opening balances
  × reb, the bridge deflating on that clock);
- **carry:** whether today's balances are carried to retirement at inflation (as-of clock only; DU-7);
- **rates:** `idx` for the bracket family, `irIdx` for IRMAA tiers, `fplIdx` for the FPL, `stIdx` for state figures, `surGrow` for IRMAA
  surcharge amounts.

`i` is `expectedInflation()` under the preset (BULL-LEANING 2.535%, BASE 2.740%). Monte Carlo figures are `runExtendedMC`, 30 years,
3,000 paths, `mulberry(7)` — **common random numbers across every variant**, so differences between variants are far more precise than
the sampling error on any single rate (about ±0.4 point near 95%, ±0.7 near 80–86%). **Null controls:** with the switch off, every
build is identical to v6.29 on every field — `m3`/`m4` on 9 and 4 preset × slider combinations of the example (on `d60a`), `m7`'s state
wrapper, and `m16`'s `d60v` against the shipped module.

**Not prototyped:** Engine D's bracket column, the Roth tab's ladder table, What Breaks and the 6-year Monte Carlo. They are in the
census (§2) and the tests (§3); the build measures them.

**Owned — three prototype errors, all corrected before these figures.** (1) The Ohio couple's expense row used field names the app does
not read (`category`/`startDate`/`kind` for `cat`/`start`/`freq`), so it had **no spending**; the late retiree's expense dates were not
shifted for the same reason. A decomposition probe caught it when the Ohio couple's pension moved nothing; both were rebuilt and
re-measured. (2) The first REC pass **inflated cost basis** with the balance (Engine D's `gainBasis`, Engine A's basis derived from the
carried balance) — a unit error that erased the gain inflation alone creates and leaned optimistic; the review caught it (§6). Basis
now stays nominal (`d60v`), and every REC figure below is the re-measurement (`m16`). (3) The draft's claim that Engine D's whole
schedule is invariant to the nine-year shift was too strong; §0.2 now says which fields move.

### 0.4 What the units fix does — measured

Variants. **V0** v6.29 as shipped · **REC** the recommended combination: as-of clock, balances carried at inflation (basis nominal),
bracket family at i − 0.25, IRMAA tiers and the FPL at i, state figures fixed, surcharges grown at i · **Q-REC** the same rates on the
retirement clock (Engine D untouched) · **no carry** REC without the balance carry (DU-7).

**Example household** (lifetime Taxes-tab tax; Monte Carlo 30-year success above $500K / $800K; Engine D's end balance in today's dollars):

| Preset · slider · variant | Taxes tab, today's $ | Taxes tab, each year's $ | MC30 | Engine D end, today's $ | Model's best cell (margin) |
|---|---|---|---|---|---|
| BULL · $70K · V0 shipped | $213,670 | — | 95.43% / 90.93% | $1,649,938 | fill 12% (0.66%) |
| BULL · $70K · Q-REC | $206,236 | $276,888 | 95.53% / 91.23% | $1,649,938 | current (0.05%) |
| BULL · $70K · **REC** | **$202,353** | **$274,761** | **95.60% / 91.37%** | **$1,635,600** (−0.87%) | fill 12% (0.09%) |
| BULL · $0 · V0 → REC | $212,552 → $186,890 | $296,043 | 95.00% → 95.63% / 90.73% → 91.53% | −0.91% | fill 12% → fill 12% |
| BASE · $70K · V0 → REC | $216,230 → $202,410 | $282,746 | 85.73% → 86.37% / 75.03% → 75.87% | $897,296 → $883,589 (−1.53%) | fill 12% → fill 12% |
| BASE · $0 · V0 → REC | $213,779 → $181,702 | $298,064 | **84.67% → 86.63%** / 74.70% → 76.50% | −1.50% | fill 12% → fill 12% |

**Six households, BULL, $70,000 slider:**

| Household | V0 today's $ | REC today's $ (each year's) | Q-REC today's $ | IRMAA today's $ (years), V0 → REC | MC30 >$500K V0 → REC (Q-REC) | Engine D end V0 → REC | Best cell V0 → REC |
|---|---|---|---|---|---|---|---|
| Example | $213,670 | $202,353 ($274,761) | $206,236 | $0 → $0 | 95.43 → 95.60 (95.53) | −0.87% | fill 12% → fill 12% (0.09%) |
| Example, balances ×1.6, Georgia | $367,909 | $325,863 ($482,902) | $329,407 | $0 → $0 | 99.33 → 99.37 (99.37) | −0.20% | fill 12% → current (0.07%) |
| Example, balances ×3, New York | $1,040,557 | $783,202 ($1,235,148) | $786,127 | $41,580 (9) → $46,180 (11) | 99.73 → 99.90 (99.90) | −0.09% | fill 12% → under IRMAA (0.12%) |
| Example, single filer | $236,175 | $229,163 ($283,048) | $235,755 | $9,780 (7) → $12,080 (9) | 97.10 → 97.13 (97.10) | −0.45% | none → none (0.13%) |
| Example, every date 9 years later (retires 2038) | $236,742 | $251,374 ($457,946) | $267,996 | $0 → $0 | 99.57 → 99.53 (99.50) | **−3.14%** | fill 12% → fill 12% (0.21%) |
| Ohio couple: $72,000/yr spending, $900 pension, COLA rental, retires 2031 | $161,018 | $175,552 ($256,603) | $177,051 | $0 → $0 | **79.33 → 78.23** (78.07) | −0.91% | current → fill 12% (1.43%) |

*(The scaled households lose the example's built-in spouse-B work, which applies to the unedited example only — v6.23, D-49 — so they
carry no job income.)*

**What the measurements say.**

1. **The direction depends on the household.** Lifetime tax in today's dollars falls for the example and the scaled households and
   rises for the late retiree and the Ohio couple. Three things pull: indexing the bracket family nearer inflation (i − 0.25 rather
   than 2%) lowers it — on the example that is most of the change (the units alone at 2%, `m5` V1, are $891 from shipped); counting an
   RMD at its own year's value rather than as today's lowers it most for an RMD-heavy household (New York ×3: $1,040,557 → $800,857
   on the units alone); and the unindexed figures raise it — §86's thresholds and the NIIT never move in law, so a household whose
   Social Security grows with inflation sees more of it taxed every year. v6.29 held Social Security flat in today's dollars, which in
   effect indexed §86 at full inflation: **optimistic for exactly the households where §86 binds.**
2. **Read as each year's own dollars, the shipped rows run low by $61,091 on the example at $70,000** (REC $274,761 against $213,670)
   and by $83,491 at $0. Read as today's dollars they run high by $11,317 and $25,662.
3. **The Monte Carlo moves by up to two points** — up on seven of the nine runs (largest +1.96, example, BASE, $0), down 0.04 on the late
   retiree and 1.10 on the Ohio couple (1.23 above $800K). The 6-year headline was not measured (§0.3).
4. **The model's best cell is a near-tie on most households and flips on three of the six households** (Georgia, New York, Ohio), every flip between
   cells within 1.5% of each other in estate. That is how close these strategies already are; it argues for the app's existing
   wording (*"the model's best cell"*), not for a stronger one.
5. **Capital gains:** carried at inflation with basis kept nominal, a taxable account's embedded gain grows before retirement. The late
   retiree's lifetime realized gains are $11,160 in today's dollars under REC against $424 under Q-REC and $435 shipped; the Ohio couple's
   $14,251 against $2,826. **v6.29's retirement clock (and Q-REC) prices today's basis as if it were at retirement**, so it omits the gain
   inflation alone creates before retirement — an optimistic omission that grows with the years to retirement.
6. **The clock matters most for a household far from retirement.** For the late retiree the retirement clock reads the $70,000 slider as
   $70,000 × 1.02535^12 ≈ $94,500 in 2038's dollars; the as-of clock reads it as $70,000. With the pension read the same way and the gain
   in item 5 pulling the other way, the whole clock difference is $16,622 of lifetime tax in today's dollars (Q-REC $267,996 against REC
   $251,374) and 3.1% of Engine D's end balance.
7. **The as-of clock is not conservative everywhere.** Against Q-REC it gives **lower** lifetime tax in today's dollars and **equal or higher**
   MC30 on all nine runs; it gives a **lower** Engine D end balance on every household. Which way it leans depends on which output is read.

### 0.5 The rates — what the statutes index by (primary sources, read 2026-10-22)

| Figure | Index in law | Source |
|---|---|---|
| Brackets, standard deduction and its age-65 extra, LTCG breakpoints, AMT figures | the §1(f)(3) cost-of-living adjustment, which uses **C-CPI-U** | 26 U.S.C. §1(f)(3)(A), §1(f)(6)(A) "the Chained Consumer Price Index for All Urban Consumers". The age-65 extra, LTCG and AMT figures cite §1(f)(3) in their own subsections — **confirm each at build** |
| QCD limit ($100,000 base) | §1(f)(3), base year 2022, rounded to $1,000 | 26 U.S.C. §408(d)(8)(G) |
| IRMAA thresholds | **CPI-U**, 12 months ending August of the prior year; rounded to $1,000 | 42 U.S.C. §1395r(i)(5)(A)–(B) |
| Federal poverty guidelines (the ACA's FPL) | **CPI-U** | 42 U.S.C. §9902(2) |
| Social Security wage base | the **national average wage index**, not a price index | 42 U.S.C. §430(b) |
| §86 thresholds, NIIT ($200K/$250K), Additional Medicare, OBBBA senior deduction | **not indexed** | the app's `TAX_CONSTS` already treat them so (FlawsToFix §1 verified these against statute 2026-09-15) |

The three U.S.C. texts were read on Cornell LII this session; **confirm against uscode.house.gov at build.**

How much slower C-CPI-U runs: *"Since 2001, the chained CPI has grown by an average of about 0.25 percentage points more slowly per year
than the traditional CPI measures have, and the Congressional Budget Office expects that trend to continue"* — CBO, Budget Options,
*Use an Alternative Measure of Inflation to Index Social Security and Other Mandatory Programs*, 12 December 2024.

So the shipped 2% is one fixed number standing in for two indexes: CPI-U, which the app's own inflation assumption models (≈ i), and
C-CPI-U, about 0.25 below it. The two 1.02 constants E-9 calls *"two facts that happen to share a value"* are, by statute, two facts.

**IRMAA and the FPL at CPI-U (measured on the retirement clock, `m8`):** on the single filer, Engine C's tiers at i rather than i − 0.25
cut IRMAA from $16,690 (10 years) to $13,810 (9 years). **The ACA subsidy is $0 on every fixture** (all sit above the 400% cliff in their
bridge years), so the FPL rate is unexercised here — §3 asks for a fixture that is not.

**State figures (measured — Georgia and New York on the retirement clock, `m7`; the Ohio couple on REC, `m13`):** Georgia ×1.6 state tax
$14,422 fixed → $4,984 indexed at i − 0.25; New York ×3 $162,818 → $130,154; the Ohio couple $29,420 → $21,598. Georgia's figure is
almost entirely its retirement exclusion, a fixed dollar amount in its statute (**confirm at build**); indexing it would cut Georgia's
modelled tax by about two-thirds. States that do index their brackets are overstated by keeping figures fixed.

**IRMAA surcharge amounts:** grown with i they keep their 2026 value in today's dollars, which is what v6.29 effectively shows; left flat in
each year's dollars they erode — New York ×3's IRMAA in today's dollars reads $26,709 instead of $46,180, 42% lower (`m9`). The surcharges
are set from the Part B premium, whose own growth is outside this release (§4). **Year basis:** an Engine C row is a MAGI year and its
surcharge falls two years later (`irmaaYr = yr + 2`, L5836); the build grows each surcharge to its **premium** year, as Engine A does. The
prototype grew it to the MAGI year, which leaves every today's-dollar total unchanged (growth and deflation use the same year) but would
put each displayed row two years short (about 5%).

### 0.6 v6.29's own measurement of D-60 was partial — owned

v6.29's scope (§0.4 item 1), its METHODOLOGY section *"The dollar basis — measured, both readings (v6.29)"*, its Field Manual inflation
map, its Taxes-tab sentence and MissingFeatures D-60 quote a *"units-consistent"* schedule of **$283,375 ($0) and $254,334 ($70,000)** and
say the Monte Carlo is *"very slightly pessimistic (0.6–0.8 points)"*. That benchmark grew **only Social Security** (its own text: *"only
Engine B's `annualSSA` / `annualSSB` grown"*). With every unit fixed and the same 2% index and retirement clock (`m5` V1; Engine B and the
Monte Carlo only, neither of which holds a basis):

| | v6.29 said | Full construction (V1) |
|---|---|---|
| Units-consistent schedule, each year's $ ($0 / $70K) | $283,375 / $254,334 | **$310,477 / $286,507** |
| Shipped rows read as each year's $ run low by | $70,823 / $40,664 | **$97,925 / $72,837** |
| Read as today's $ they run high by | $34,510 / $24,562 | **$16,878 / $891** |
| MC30 >$500K, shipped → units-consistent | 94.83 → 95.67 / 95.15 → 95.73 | 95.00 → 95.47 / **95.43 → 95.40** |

(The MC rows use different seeds — v6.29's and this scope's `mulberry(7)` — so compare within a row only.) At $70,000 the Monte Carlo's
charge was **not** measurably pessimistic once every unit was fixed; the in-app *"0.6–0.8 points"* overstated it. Every sentence quoting
these figures is replaced by this release (§2.5), and the CHANGELOG states the correction.

### 0.7 Found beyond the units — filed, not fixed (D-64)

**Engine D's balances do not carry the contribution accrual, while its Traditional share does.** Its buckets start at
`bucketActuals[k] × total401k` (L5979–5982), today's holdings; the accrual (`contribAccrual`, METHODOLOGY *Contribution accrual (v5.10)*,
which lists *"the Withdrawal schedule"* among the engines it seeds) reaches only `_rsbW`, from which `tradFrac = posTrad / _t401kInit`
(L6039) and the RMD are taken. Measured (`m15`, `m17`):

- the example, contributions as set vs zeroed: Traditional at retirement $1,398,600 vs $1,296,000 (the $102,600 accrual); Engine D's first
  row $1,635,452 and last row $3,008,839 in both; lifetime RMDs $499,644 vs $471,672;
- Engine D's two "views of the same money" **exceed 100%**: Traditional share 0.858 + Roth 0.210 = **1.068** on the example; **1.064 + 0.210 =
  1.274** on the nine-years-later fixture, whose twelve years of accrual push the Traditional share alone past 1;
- What Breaks starts from `PORTFOLIO.household` (L12252), which also omits the accrual.

The balance half is conservative; what a share above 100% does to each draw's tax split is not established here. Not D-60's mechanism;
filed as **D-64** with these figures.

### 0.8 Boundary census (OPERATIONS §K1)

`boundaries.mjs v629` on the example: 28 of 32 rows ON (`k1_example.txt`). The census has **no row** for the boundaries D-60 turns on. On
the example, read from Engine B and the prototype:

| Boundary this release turns on | Example | Fixture that clears it |
|---|---|---|
| Retirement year = as-of year (the two clocks coincide, reb = 1) | clear — 3 years apart | — (the build adds a fixture **at** the boundary, where both clocks must agree) |
| A fixed (non-COLA) income | clear — $400 pension | Ohio couple ($900) |
| An unindexed threshold binding: NIIT | **ON — $0 NIIT** | New York ×3 ($720 over 15 years in v6.29) |
| An IRMAA tier crossed | **ON — 0 years** | single filer (7), New York ×3 (9) |
| An ACA subsidy year under 400% FPL | **ON — subsidy $0** | **none of the seven** — the build must make one |
| A state with a fixed-dollar exclusion | **ON — no state** | Georgia ×1.6, Ohio couple |
| A taxable account with embedded gain far from retirement | small | late retiree, Ohio couple (§0.4 item 5) |

So the example's own figures cannot evidence the NIIT, IRMAA, ACA or state halves; this scope quotes fixtures for them. **Per §K1's
maintenance rule the build adds four rows** to the census: the two-clock coincidence, a binding NIIT year, an IRMAA year, and an ACA
subsidy year under the cliff.

### 0.9 Registers and documents swept for the mechanism (OPERATIONS §K2)

Searched `FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md`, `UsabilityFlaws.md` and METHODOLOGY for `TAX_INDEX_RATE`,
`IRMAA_INDEX_RATE`, `1.02`, `1.045`, `inflate`, `projectBracketsAt`, `withdrawalPlanSeries`, `irmaaThresholdFor`, `fplInflProxy`, chained,
CPI-U, wage base, nominal, today's dollars, bracket creep, clock, accrual, growth.

| Item | What this release does to it |
|---|---|
| **MissingFeatures D-60** | closes |
| **ARCHITECTUREIssues E-9** (two 1.02 constants) | closes: two rates, each named for its statute, from one helper |
| **ARCHITECTUREIssues E-22** (two LTCG and two bracket copies) | narrows: the four indexation lambdas (A L5022, C L5705, B L6534, `projectBracketsAt` L6456) become one helper; the bracket-walk copies stay |
| **ARCHITECTUREIssues E-23** (law constants outside the blocks) | touched, not closed: `fplInflProxy` leaves `ACA_CONSTS`; NIIT and AMT rates stay inline |
| **FlawsToFix C-13** (IRMAA thresholds not rounded to $1,000) | stays open (DU-6); its reason — *"a disclosed 2%/yr CPI-U proxy whose error is far larger"* — is re-worded, because the proxy is gone |
| **METHODOLOGY's "no growth" rule** — *Contribution accrual (v5.10)* L1378–1386 (*"Nominal dollars, no growth"*), and L2603–2605 (*"starts from today's balances without growth … Inflating only the spending from today would break that convention"*) | **changed by DU-7.** On the retirement clock, "no growth" in nominal dollars *is* "no real growth". On the as-of clock the two part: carrying balances at inflation keeps v6.29's real meaning; not carrying them is a real loss v6.29 never had. The v5.10 rule for **accrued contributions** (face value, no return) is unchanged |
| METHODOLOGY §6, L128, L621, L767, L1312–1319, L1479–1484, L2410, L2428–2430, L2440, L2501, L2721–2738 | rewritten (§2.5) |
| MissingFeatures D-44 (MC one-time rows) | related only; unchanged |

---

## 1 · What changes (if the decisions are taken as recommended)

1. **One clock, to the year.** Every engine prices each year from the as-of year, as the Monte Carlo already does. Spending, Social
   Security and COLA streams grow from today; a pension, a non-COLA stream, the conversion slider, the built-in work and a QCD are the
   dollars paid that year. Engine D carries today's balances to retirement at inflation — no real growth, the same real meaning as v6.29
   — with cost basis left at its nominal value. *The Monte Carlo compounds quarterly from the as-of month and the deterministic engines
   annually from the as-of year; they agree to the year, not the quarter (§3 D states the tolerance).*
2. **One unit inside each engine.** Engines A, B, C and D compute each year in that year's own dollars.
3. **Statute rates.** The bracket family indexes at the plan's inflation − 0.25 point (C-CPI-U); IRMAA tiers and the FPL at the plan's
   inflation (CPI-U); the wage base at the plan's inflation (law uses wages, which usually outpace prices — so this side is slightly
   optimistic, disclosed). Unindexed figures stay fixed. State figures stay as their statutes state them. IRMAA surcharge amounts grow
   with the plan's inflation, to their premium year. One helper owns the rates; no `1.02` remains.
4. **Displays.** Year rows (Withdrawal, Taxes, IRMAA, the Roth ladder) are in each year's own dollars, and say so. Every lifetime total and
   every strategy estate is also shown in today's dollars.
5. **The Monte Carlo and What Breaks** receive tax in today's dollars (each year's tax ÷ (1+i)^(yr − as-of)) and grow it with their paths'
   inflation, as now — the Monte Carlo's mechanism does not change, only the figure it is handed. What Breaks reads Engine A's
   today's-dollar total and, being a real-terms projector from retirement, values a fixed pension at its real worth then (÷ reb).
6. **Copy.** Every sentence describing the mixed units or the 2% proxy — v6.29's *"both readings"* text included — is replaced with what the
   code does, and every dollar input says which kind (an amount that grows with inflation, or the amount paid).

---

## 2 · Site census

By parser: `growth_census.cjs` (every `Math.pow` and every read of the growth identifiers, by enclosing function — 113 hits),
`callers.cjs` (every call of the engines and helpers, with its tab), `fieldreads.cjs` (every UI read of an engine result field),
`copy_census.cjs` (every string the app can show matching the units vocabulary — 53 matches). The review added sites by its own AST pass
over numeric literals, 24 tax and inflation helpers and the constant blocks (§6). Line numbers are v6.29's.

### 2.1 Shared helpers

| Site | Lines | Change |
|---|---|---|
| `TAX_INDEX_RATE`, `inflateTaxConst` | L1148–1150 | replaced by the rate helper (bracket family) |
| `seniorExtraFor` | L1173–1175 | indexes through the helper |
| `IRMAA_INDEX_RATE`, `irmaaThresholdFor`, `irmaaTierFor` | L1284–1302 | CPI-U rate; the top-tier freeze through 2027 unchanged |
| `ACA_CONSTS.fplInflProxy`, `acaFplFor`, `acaSubsidyAnnual`, `acaBelowFloor` | L2120, L2134–2175 | CPI-U rate past the last published guideline year |
| `projectBracketsAt` | L6455–6466 | its own `Math.pow(1.02, …)` (L6456) goes to the helper |
| `expectedInflation` | L1316 | read by the helper (the rates follow the preset) |
| Verify tab IRMAA checks | L2240–2242 | `Math.pow(1.02, 20)` and the *"2%/yr proxy"* citation replaced; **expected values computed independently in the check** (statute base × the rate written out), never by calling the helper being checked |

### 2.2 Engines

| Engine | Sites |
|---|---|
| **A** `runRothStrategies` L5013–5664 | `infl` L5022 and its 13 reads (L5032, 5042, 5195, 5223, 5299 ×2, 5301, 5324, 5397, 5427 ×2, 5429, 5450); `seniorExtraFor` L5196; IRMAA L5233, L5285–5286, L5467–5468 (surcharge to the premium year); ACA L5244, L5380, L5565, L5573, L5578; **state calls L5304, L5437** (DU-4); inputs SS L5047–5048, work L5053, other ordinary L5055, pension L5148, draws L5027, dividends L5190, balances L5021 and the taxable basis (kept nominal); outputs `totTax`, `estate`, `totIrmaa`, `wealthByYr` and the rest — today's-dollar companions added |
| **B** `computeTaxPlan` L6490–6858 | `inflate` L6534 (9 reads; returned L6857 to the Taxes detail panel); `seniorExtraFor` L6714; SS L6586–6587; work L6589; pension L6637; streams L6644–6645; conversions L6681; gains L6687; draws L6695; dividends L6698; balances L6613/L6825; state call L6781; per-row `totalTax` → each year's dollars plus today's; the lifetime total (`totAll`) both |
| **C** `computeIrmaaPlan` L5682–5883 | `inflate` L5705 (QCD L5803); tiers L5731 (the operative site) and L5850; SS L5745–5746; work L5747; pension L5773; streams L5778; conversions L5805; dividends L5806; gains L5809; draws L5832; surcharge L5848 grown to `irmaaYr` (L5836); the hard-coded 1.045 L5875 (left as is — not a units question); totals L5880–5881 |
| **D** `computeWithdrawalPlan` L5909–6427 | inflator L5993–5994 (clock); expense L5999; opening buckets L5979–5982 and the taxable trackers (× reb), **gain basis not**; SS, pension, streams on the as-of clock; bracket column L6355–6380 (D's income and `projectBracketsAt` then share a unit — v6.29 compared retirement-clock income against as-of-clock thresholds) |
| **Bridge** `withdrawalPlanSeries` L6471–6476 | stops deflating: the draws and gains it hands on are each year's dollars |
| **Roth tab ladder table** (render-inline) L10363–10705 | `projectBrackets` L10418; `tradGrowth` L10469 and L10683–10702; SS, pension, work and streams L10527–10534; `irmaaThresholdFor` L10585 — the same unit change, so the table agrees with Engine A beside it |
| **Roth optimizer grid** L6984–7009 | reads A; ranking unchanged by a common divisor; estates gain today's dollars |

No other render-inline tax computation exists: the Survivor, Social Security and Exit Plan tabs carry copy only (review, §6).

### 2.3 Consumers

| Consumer | Lines | Change |
|---|---|---|
| Monte Carlo tax schedule `mcIncomeTaxSchedule` | L116–121 (callers L174, L7064, L7086, L7118) | keeps `byYr[yr]` in today's dollars — now B's each-year tax ÷ kA; `mcTaxCharge` L169 unchanged |
| What Breaks | L12300–12316; projector L12273–12286, L12340–12348; `annualPenGuar` L12264; `baseDrawWR` L12357 | reads A's today's-dollar total; fixed pension at its real value at retirement (÷ reb) in the projector and the draw-rate line |
| Taxes tab | L11213–11219, detail panel L11465 | rows each year's $; totals both |
| IRMAA tab | L11504–11506 | rows each year's $ (surcharges grown to the premium year); totals both |
| Roth tab | L10971–10973, L11119–11138 | estates and totals both |
| Withdrawal tab | L10177 | its figures become true each-year dollars (they were understated by (1+i)^(R − as-of)) |

`fieldreads.cjs` counts the UI reads the display changes touch: A — `estate` 17, `totTax` 6 (4 Roth, 2 What Breaks), `totIrmaa` 4, `totConv` 2,
`widowTax` 2, `wealthByYr` 2, `acaSubByYr` 2, `totAcaLoss` 1, `endRoth` 1; B rows on the Taxes tab — `capGainsTax` 4, `fica` 4, `stateTax` 4,
`fedTax` 2, `amt_y` 2, `niit_y` 2, `ssTaxable` 2, `totalTax` 2. The build re-runs it and lists each read it edits.

### 2.4 Not tax sites — confirmed, unchanged

The mortgage what-if amortization (L7125), the Guardrails table (already on the as-of clock, L7481–7489), the stress tests' statistics
(L3272–3276), `historicalWorstRealWindow` (L973), the LTC escalator (L3116), the Backtest.

### 2.5 Copy and documents

`copy_census.cjs`, v6.29: the Taxes tab (L11236, L11244, L11490), IRMAA tab (L11534), Roth rules box (L10852), Withdrawal tab (L10228),
Monte Carlo tab tax card (L8670 *"treats as today's dollars"*), Income tab streams note (L8597), What Breaks (L12400 *"spending less Social
Security and pension, before tax, in today's dollars"*), My Data streams form (L14287–14288), the pension input's label, the Verify
citation (L2241), the Field Manual (`DOCS_HTML` L4917: the inflation map's two units passages, the Taxes approximation *"bracket inflation is
modeled at 2%/yr"*, §13's v6.29 line). METHODOLOGY's passages are listed in §0.9. MissingFeatures D-60 (closed), D-64 (new);
ARCHITECTUREIssues E-9, E-22; FlawsToFix C-13's reason. `t92` §F pins v6.29's measurement text and is re-gated.

---

## 3 · Tests

A new suite, **`t93_dollar_units.mjs`**, run on two legs; the v6.29 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-22, D-60]`.
Precision follows OPERATIONS §M: Engines A–D are module-level and exact; the Roth ladder table and What Breaks are component-inline
(±$500 from the DOM; the ladder's RMD cards render full dollars and are exact).

- **A · Units oracle (hand-verified), at the precision each engine exposes.** Engine B: two years on each of three fixtures (the example;
  the single filer in an IRMAA year; New York ×3 in a NIIT year), each component — federal ordinary, capital gains, NIIT, AMT, FICA,
  state — computed by hand in that year's dollars from the statute figures at the stated rates and compared **to the dollar**. Engine C:
  each row's MAGI, tier and surcharge to the dollar (it computes no federal tax). Engine A: it returns lifetime totals and per-year
  series, not per-year components, so the oracle compares its per-year `wealthByYr` and lifetime `totTax` against an independent
  recursion of the same fixture — or the build adds a read-only per-year tax seam first, in a **separate** commit that changes no figure
  (§M's hoist-then-test rule). Independent arithmetic, never the engines' own helpers.
- **B · Homogeneity — the extinction invariant.** Fixture: a single filer under 65 in every year (no age-65 extra, no OBBBA deduction),
  no Traditional or taxable balance (no RMDs, dividends, gains or NIIT), no state, income only a COLA rental stream; a second fixture adds
  Social Security large enough that §86's 85% limit binds every year (taxable SS = 0.85 × SS, so the unindexed base drops out). With
  every indexed rate forced to the plan's inflation through a test seam, the tax in today's dollars is **the same in every year**, within
  $2 a year for `Math.round` in the deduction and the streams. v6.29 fails it (thresholds at 2% against flat income). Any future mixed
  unit fails it.
- **C · One clock.** A fixed $X pension and a non-COLA $Y stream appear as exactly $X and $Y of income in every year in Engines A, B, C
  and D; a COLA stream as $Y × (1+i)^(yr − as-of). In the Monte Carlo the same $X appears in every quarter (×4 a year). At the two-clock
  boundary (retirement year = as-of year) every engine agrees with v6.29's clock to the cent. The v6.29 leg pins Engine D's
  retirement-clock reading.
- **D · Monte Carlo consistency.** (1) `mcIncomeTaxSchedule` equals Engine B's each-year tax ÷ kA to the cent. (2) The charge mechanism:
  each quarter's charge equals the schedule × that quarter's `inflationCum` × its fraction, to the cent (unchanged code, now pinned). (3)
  With path inflation fixed at the plan's through a seam, a year's four charges equal Engine B's each-year tax **within the compounding
  gap** — quarterly (1+i/4) from the as-of month against annual (1+i) from the as-of year — bounded in the test by computing that gap for
  the year, not by a typed tolerance.
- **E · What Breaks** reads Engine A's today's-dollar total; its fixed pension is the pension ÷ reb (DOM, ±$500 on the rendered estimate;
  the inputs exact through the engine).
- **F · Rates.** No `1.02` (or `Math.pow(TAX_INDEX_RATE` / `IRMAA_INDEX_RATE`) left in any engine or helper — the E-9/E-22 extinction by
  AST; the bracket family at i − 0.0025, IRMAA and FPL at i, each proved by mutation; NIIT, §86, Additional Medicare and the OBBBA
  deduction unchanged across years; the Verify tab's IRMAA checks green against independently computed values.
- **G · Displays.** Each year-row table labels its units; every today's-dollar total equals Σ each-year ÷ kA; the Withdrawal tab's draw
  equals the Taxes tab's draw for the same year (the `t40` agreement, now without a deflator); an IRMAA row's surcharge is grown to its
  premium year.
- **H · The sites the prototype did not reach.** Engine D's bracket column (exact: D is module-level) against Engine B's bracket for the same
  year; the Roth ladder table's rows against Engine A (±$500; RMD cards exact); the 6-year Monte Carlo's headline before and after,
  recorded.
- **I · Basis.** On the late-retiree fixture, the taxable account's basis at retirement equals today's basis (nominal) while its balance is
  carried; the first year's realized gain matches a hand computation.
- **J · Copy.** By `copy_census.cjs`: zero matches for v6.29's units sentences (*"both readings"*, *"read low"*, *"indexed 2%/yr"*, *"2%/yr
  proxy"*); every dollar input names its kind.
- **K · Fixtures.** An ACA bridge household **under** the 400% cliff (§0.8), and one at the two-clock boundary, each checked by
  `boundaries.mjs` before any test code is written.

**Re-gates expected:** every suite that pins a figure from Engines A–D, the Monte Carlo, What Breaks or the Verify tab's IRMAA rows, `t92`
§F, `t40`, and the copy suites. The build lists them by running the v6.29 suite against the new source; each moved figure is re-derived (by
hand or by an independent oracle), **never by pasting the new output**. MC parity will differ by design. If DU-8 (a) is taken, the build
runs the full suite at the end of each stage and records which re-gates each stage caused (§5).

**Controls** (`qa/tools/controls_v630_dollar_units.py`): re-insert a flat Social Security in B; a deflated draw in the bridge; a
retirement-clock inflator in D; an inflated basis in D; `1.02` in the helper; a flat surcharge in C; a fixed-rate FPL — each must turn its
check red.

---

## 4 · Out of scope — filed or stated

1. **Part B premium growth** (it sets the IRMAA surcharges) — the surcharges grow with the plan's inflation here; whether premiums outrun
   it is a model question, filed.
2. **C-13 rounding** of projected IRMAA tiers to $1,000 and of brackets to $50 — open (DU-6).
3. **Per-state indexing.** Some states index their brackets; the model keeps every state figure fixed (DU-4). A per-state flag is its own
   release.
4. **The ACA applicable-percentage table** is itself re-indexed each year by the IRS; the model holds the 2026 table. Stated, unchanged.
5. **The Monte Carlo scales the whole tax schedule by each path's inflation** — so on a high-inflation path the unindexed thresholds rise
   too. An approximation already disclosed (DC-3 (a)); unchanged.
6. **D-64** (§0.7) — Engine D's balances, its shares and the contribution accrual; What Breaks' starting balance.
7. **The wage base by wages, not prices** — disclosed (METHODOLOGY L2501 already does).
8. **The 2027 tax-figure refresh** (OPERATIONS: research from mid-November, ship before 1 January) is separate; this release changes how
   figures project, not the base-year figures. If the two land close together, the refresh rebases from whichever ships first.
9. **Engine C's hard-coded 1.045** (L5875) — noted in its own comment; not a units question.

---

## 5 · Decisions for Steve

**DU-1 · Which inflation clock.**
- **(a) One clock from today — recommended.** Every engine prices each year from the as-of year, as the Monte Carlo already does. A pension
  or fixed annuity is the dollars it pays; the conversion slider is that year's dollars. *For:* it is how pension statements and annuity
  contracts state amounts and how the Monte Carlo already pays them, so the two halves of the app stop reading a pension differently; it
  taxes the gain that inflation creates before retirement, which the retirement clock omits (§0.4 item 5); and it lowers Engine D's end
  balance on every household measured (0.09% to 3.1%). *Against:* it gives **lower** lifetime tax and **equal or higher** Monte Carlo
  success than (b) on all nine runs (§0.4 item 7) — less conservative on those outputs. Engine D changes, so every Withdrawal-tab figure
  changes (they become true each-year dollars) and more suites re-gate.
- **(b) The retirement clock.** Engine D untouched; A, B and C restate its units. Leaves the Monte Carlo and Engine D reading a pension
  differently, keeps the omitted pre-retirement gain, and for a household far out reads the $70,000 slider as ≈$94,500 (§0.4 item 6).

**DU-2 · What the year-by-year tables show.**
- **(a) Each year's own dollars on every year row, every total also in today's dollars — recommended (with DU-1 (a)).** A tax row can then be
  read against that year's brackets and against the Withdrawal tab's draw; a lifetime total can be compared with today's savings.
- **(b) Today's dollars on the tax tabs' rows.** Natural with DU-1 (b); a row cannot then be compared with its own year's brackets.

**DU-3 · The index rate for indexed figures.**
- **(a) By statute — recommended.** The bracket family at the plan's inflation − 0.25 point (C-CPI-U, CBO 2024); IRMAA tiers and the FPL at
  the plan's inflation (CPI-U); the wage base at the plan's inflation (law uses wages, so slightly optimistic, disclosed). The rates follow
  the preset, so a higher-inflation prior raises income and thresholds together.
- **(b) One rate, inflation − 0.25, for everything.** IRMAA tiers then sit lower than the statute's, so more IRMAA: single filer $13,810 → $16,690,
  9 → 10 years. **The conservative option**, at the cost of departing from the statute the app can name.
- **(c) Keep 2%.** Keeps bracket creep the statutes do not have (2% against 2.5–2.7% assumed inflation).

**DU-4 · State figures.**
- **(a) Fixed at the dollars the statutes state — recommended.** True for fixed exclusions (Georgia's retirement exclusion, to be confirmed
  at build); overstates tax in states that index their brackets, disclosed. The conservative direction.
- **(b) Index at the bracket rate.** Cuts Georgia's modelled state tax by about two-thirds (§0.5).

**DU-5 · IRMAA surcharge amounts.**
- **(a) Grow with the plan's inflation, to the premium year — recommended.** Keeps their 2026 value in today's dollars, which is what v6.29
  shows. Part B growth filed (§4).
- **(b) Flat in each year's dollars.** Erodes them (New York ×3: $46,180 → $26,709 in today's dollars) — optimistic.

**DU-6 · Round projected IRMAA tiers (and brackets) as the statutes do (C-13).**
- **(a) Not in this release — recommended.** Every projected edge already moves here; rounding is worth measuring on its own, and a tier ten
  years out at an assumed inflation is far less certain than $500.
- **(b) Include it.**

**DU-7 · On the as-of clock, how today's balances reach retirement** *(arises only with DU-1 (a))*.
- **(a) Carried at inflation — no real growth, basis left nominal — recommended.** Keeps v6.29's real meaning exactly (on the retirement
  clock, "no growth" already meant no real growth) and keeps the v5.10 rule for accrued contributions. METHODOLOGY's two "no growth"
  passages are re-worded to say *real*.
- **(b) Not carried — nominal, no growth.** Every balance loses (1+i)^(R − as-of) of real value before retirement, which no other part of the
  app assumes (the Monte Carlo grows them at market returns). Measured Engine D end balance, today's dollars, against (a): example
  −13.6%; BASE −19.0%; Georgia −10.4%; New York −8.7%; single −14.5%; Ohio couple −16.4%; the late retiree **−49.6%**. Lifetime tax falls
  with the smaller balances (example $202,353 → $187,308) and the Monte Carlo, which never sees Engine D's balances, rises slightly on the
  lower tax. METHODOLOGY L2603–2605 warns against exactly this pairing.

**DU-8 · One release, or two.**
- **(a) One release, built in two recorded stages — recommended.** Stage 1: units, rates and displays on the retirement clock (Q-REC); full
  suite, re-gates recorded. Stage 2: the clock and the balance carry; full suite, re-gates recorded. One ship. Each re-gate is attributable
  to one cause, and users see the Taxes tab move once.
- **(b) Two releases** — Q-REC as v6.30, the clock as v6.31. Each release smaller. *Against:* the displays change twice (DU-2 (b) for one
  release, then (a)); the Taxes tab's draws and the Withdrawal tab's disagree in units for the release between; and v6.30 ships the
  retirement clock's known gaps (§0.4 items 5–6).
- **What is not optional:** the engines and the Monte Carlo's input change together — fixing the engines alone doubles the Social Security
  tax in the Monte Carlo (v6.29's finding).

**DU-9 · The example's built-in spouse-B work** *(the unedited example only; the Monte Carlo does not model it)*.
- **(a) A fixed amount, like a pension — recommended.** The conservative reading (less income in later years); small — $20,000, $18,000 and
  $15,000 in the first three retirement years (`spouseBWorkTaper`).
- **(b) Today's dollars, growing with inflation**, as wages usually do.

---

## 6 · Review

One independent review (a reader that had not seen the work), against the v6.29 source, the measurement outputs and the prototype. It
re-ran `m3`, `m4`, `m14` and `m15`, recomputed every derived figure, checked the CBO quote on cbo.gov, and ran its own AST pass for
missed sites. **Every line cite and every table figure verified.** Its findings and what was done:

| # | Finding | Resolution |
|---|---|---|
| 1 | **Blocking.** Carrying balances at inflation overturns METHODOLOGY's *"no growth"* passages, undisclosed and not offered | Became **DU-7**, measured both ways (`m16`); both passages in §0.9 |
| 2 | **Blocking.** The prototype inflated cost basis with the balance — a unit error, optimistic | Confirmed. Basis kept nominal (`d60v`); every REC figure re-measured; owned in §0.3; test I and a control added |
| 3 | Engine D's invariance to the nine-year shift overstated; D-64 understated (shares over 100%; What Breaks) | Confirmed by `m17` (RMDs $499,644 vs $566,921; shares 1.068 and 1.274). §0.2 restated; §0.7 extended |
| 4 | DU-1's case gave only the conservative half | Confirmed (all nine runs). §0.4 item 7; DU-1 states both |
| 5 | Dismissing staging was not supported | **DU-8** offers it |
| 6 | Test D "to the cent" impossible: quarterly vs annual compounding | Test D rewritten with a computed bound; §1 item 1 says "to the year" |
| 7 | Test B under-specified (§86 base, NIIT, OBBBA, RMDs, rounding) | Fixture and tolerance specified |
| 8 | Tests assumed precision Engines A and C do not expose (§M); non-prototyped sites untested | Test A per engine; test H added; seam rule stated |
| 9 | Engine C's surcharge grown to the MAGI year, not the premium year | Build grows to the premium year (§0.5, test G); today's totals unaffected |
| 10 | Census gaps: A's state and ACA calls, C's tier site L5731, What Breaks' pension and draw-rate lines and copy | Added (§2.2, §2.3, §2.5) |
| 11 | The form's wording fits either clock; the built-in work's treatment was a silent choice | §0.2 re-worded; **DU-9** |
| 12 | DU-3 (b) described backwards; the wage base's direction | Rewritten: (b) is the conservative option; wage base at i is slightly optimistic, disclosed |
| 13 | "Within about one point" contradicted by +1.96; sampling error near 80% larger | §0.4 item 3 and §0.3 corrected |
| 14 | 70,000 × 1.025^12 is $94,142; the $17,432 was the whole clock effect; "no trace" said nothing; null controls mis-described; script count; B's lifetime field is `totAll` | Corrected (now 1.02535^12; the clock effect re-measured at $16,622; §0.3; header; §2.2) |
| 15 | Part B growth claim unsourced; the ACA applicable-percentage table is indexed; Verify checks would be self-referential | Softened (§0.5, §4 item 1); §4 item 4; §2.1 requires independent expected values |

The review's scratch probes (`d60/review/`) are session-only.

---

## 7 · Build record (v6.30)

**Built as decided** — DU-1 to DU-9 (a), in the two recorded stages DU-8 (a) asked for, then the displays and copy, then a build review. The
CHANGELOG's v6.30 entry carries the figures; this section records how the build went and what it changed in this scope's plan.

**Stage attribution (full suite after each stage, v6.29's suites against the stage source).** Stage 1 — units, rates and displays on the
retirement clock (Q-REC) — turned 40 suite legs red, 376 checks: the engine-figure suites (`t10`, `t13`–`t15`, `t17`, `t18`, `t22`, `t25`,
`t33`, `t40`–`t44`, `t56`, `t58`, `t60`, `t70`, `t75`–`t77`, `t79`, `t83`), parity (7 keys), the copy suites (`t1`, `t32`, `t35`, `t90`) and
`domdiff`. Stage 2 — the as-of clock and the balance carry — added the suites that read Engine D or the ladder's seed (`t8`, `t16`, `t19`,
`t20`, `t23`, `t24`, `t26`, `t28`, `t71`, `t72`, `t81`), 536 red checks in all. Every red was re-gated by re-deriving the figure (CHANGELOG,
*Re-gated*); none by pasting.

**Found at the build, fixed** (each in the CHANGELOG):
1. **The wage base was indexed at the chained rate** — the first implementation sent it through `inflateTaxConst`, against DU-3 (a); the
   payroll-tax law oracles (`t77`, `t79`) caught it; `inflateWageBase`, `t93` A-4b, control U8.
2. **`t92`'s rental fixture was never taxed** (field names the app does not read; tax type `"taxable"`); fixed.
3. **The build's own census of §3** found the Monte Carlo test D (3), statute oracles for the NIIT and IRMAA tiers, and What Breaks' rendered
   estimate missing — added to `t93` (§M, §N, §W), controls U9, U10.
4. **The statutes §0.5 asked to confirm at build** were read on uscode.house.gov (26 U.S.C. §1, current through P.L. 119-120; §55) and
   Cornell LII (§63, §408; 42 U.S.C. §1395r, §9902, §430 — uscode.house.gov returned maintenance pages): C-CPI-U for the §1(f)(3) family
   (§1(f)(3), (f)(6)(A); §1(j)(5)(C); §63(c)(4), (c)(7)(B); §55(d)(4)(B); §408(d)(8)(G)), CPI-U for IRMAA (§1395r(i)(5)(A)–(C)) and the
   poverty line (§9902(2)), the national average wage index for the wage base (§430(b)). Georgia's $65,000 exclusion is a fixed figure in
   O.C.G.A. §48-7-27(a)(5)(A) (read in a 2022 FindLaw copy; the 2023 state audit summary gives the same figure).
5. **The build reproduces this scope's prototype** to within $2 on all six households (before the build review's accrual fix, below, which moved them).

**The build review** (an agent that had not seen the build; source, tests, docs and this scope) found **1 blocker, 3 should-fix and 10
notes**. All were taken or answered:
- **Blocker — the planned-contribution accrual was carried to retirement with the holdings**, at every engine's seed, the Roth ladder and its
  RMD cards — against DU-7 (a) (*"keeps the v5.10 rule for accrued contributions"*) and against METHODOLOGY as drafted. **This scope's
  prototype did the same** (so its REC figures, §0.4, include the carried accrual) and so did every oracle built from it, which is why the
  suite could not see it. Fixed to the decision as written: one helper, `carryStartBalances`, carries today's holdings and adds the accrual
  at face value, re-taking the annuity and employer shares on the carried amounts; `t93` §O checks the opening balances against raw holdings
  and contributions; H-10 holds the carry in the one helper; control U11. The oracles were corrected (`units_v630.mjs` `carryHold`; `t23`,
  `t24`, `t25`, `t26`, `t28`, `t70`, `sim_ledger`) and the measured figures re-measured. *Taken as the faithful reading of DU-7 (a), not
  re-decided — Steve was not available to ask; the alternative (carry the accrual too, and re-word DU-7) is open to him.* Its largest effect:
  the late retiree's lifetime tax, which the prototype measured as rising, falls (CHANGELOG).
- **Should-fix 1 — Field Manual sentences untrue of v6.30** (the Withdrawal section's *"inflated from the retirement year"*, the FAQ's
  *"monthly amount in today's dollars"*, *"lifetime totals also in today's dollars"* where the Withdrawal and ladder totals had none):
  corrected, and today's-dollar companions added to the four totals (DU-2 (a) promised every lifetime total).
- **Should-fix 2 — tests §3 promised and the build had not shipped**, shown by mutation (Engine C's streams held flat and Engine A's Social
  Security held flat passed `t93`; Engine A's basis carried was caught only by measured pins): `t93` gains D-7 (Engine C's MAGI equals Engine
  B's every year on the clock household), F-5/F-6 (Engine A through a new read-only per-year seam, `incomeByYr`), I-2 (Engine A's opening
  taxable balance carried, its basis not), H-11 (no unindexed figure reaches an inflator; control U12), and M-2 tightened (a one-year clock
  slip now fails it). §F's F-1 to F-4 and §M's M-1 are restatement-consistency checks, true by construction, and are labelled as such.
- **Should-fix 3 — every dollar input names its kind**: the conversion slider and the QCD modeler now say they are fixed amounts.
- **Notes taken:** Engine A's dividend base subtracted today's HSA from a carried balance (now carried, × the factor); the Roth rules box and
  the comparator stated units differently (made consistent); What Breaks' last-year draw-rate line priced the fixed pension at its
  retirement-year worth (now its worth in that last year — it was optimistic); the Verify tab's *"not proxy"* label and a stale *"~3%"*
  comment; the CHANGELOG draft's census claim (three of the four new rows are ON on the example, not four). **Noted, not changed:** a
  retirement year already past deflates today's holdings (disclosed in METHODOLOGY); What Breaks and the Income/Monte Carlo steady-state
  line read a fixed pension two ways (neither a tax figure; disclosed); the Verify tab's IRMAA expected values copy `expectedInflation`'s
  formula (independent of the helper, not of the rate).

**A second pass by the same reviewer, on the fixes**, found no blocker and one should-fix: the new today's-dollar totals and the input
labels shipped untested — added (`t93` L-7, L-7b exact for the Withdrawal tab, L-8 bounded for the ladder, L-9 the labels). Notes taken: the
Field Manual's Withdrawal section said Backtest and What Breaks read the table "the same way" (narrowed to the same rows); the ladder total's
*"9-YR"* label (now the ladder's own count of years); the 6-year headline's noise worded as ±0.2 point, not a 0.1 bound (its run takes no
seed); §O's runtime check covers Engines B and C, Engine A and the ladder being held by H-10 and the `t23`–`t28`/`t70` recursions — stated
so in METHODOLOGY and the CHANGELOG.

**What remains untested from §3, stated:** Engine B's AMT, FICA and state components on this scope's two fixtures by hand (FICA is pinned by
`t77`/`t79`'s law oracles on every year, state by `t58`/`t64`–`t67`; AMT only where it must be zero, `t41`, and its six figures as Verify checks, `t92` A-5b — no suite and no fixture here reaches a positive AMT); the Roth ladder's rows
against Engine A within ±$500 in the DOM (the ladder is pinned against independent recursions in `t23`, `t24`, `t26`, `t28`, `t70`); the
Monte Carlo's quarterly $X pension (the planned path's charge mechanism is pinned in §M; the pension's quarterly payment is unchanged code).
