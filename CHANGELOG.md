# Changelog

## v5.90 — the law's age gates on Iowa's, Pennsylvania's and Mississippi's exemptions; Michigan's cap (D-24)

**A MODELLING release** (METHODOLOGY updated). Through v5.89 every "retirement income exempt" row exempted all retirement income at any
age and any amount (`retBase = r.retExempt ? 0 : …`). Five of the fourteen such rows tax anything; read at the build:

- **Iowa** exempts it only from **55** (Iowa DOR). **Pennsylvania** exempts IRA distributions only from **59½**, employer-plan payments once the
  plan's own age or service is met (DOR rev-636; PA-40 instructions). **Mississippi**: early distributions do not qualify (DOR regulation
  Ch. 07). The model was **optimistic** for younger retirees — at v5.87, a 50-year-old with $50,000 of IRA income paid $0 in Iowa or
  Pennsylvania where the law gives $1,900 and $1,535.
- **Michigan** has no age test from TY2026 but caps the deduction per return at the private-retirement maximum, public and private combined
  (Treasury RAB 2026-1, read in full). The model treated it as unlimited — optimistic above the cap.
- **Illinois** includes early distributions (IDOR Publication 120): unchanged.

**What changed:** `retExemptAge` — IA 55; PA and MS 60, i.e. 59½ in whole years (conservative). A joint return is exempt only when **both**
spouses qualify, because the model cannot tell whose account a withdrawal comes from (D-12) — conservative, and disclosed. PA and MS keep
pensions in payment exempt at any age (`retExemptPensionAnyAge`), as their employer-plan tests are the plan's own. Michigan's `retCap` is
**$65,897 single / $131,794 joint, TY2025**, the latest Treasury has published (TY2026's indexed figure is higher, so this is
conservative), shown as a dated figure. My Data's line says "retirement income exempt from 55" / "up to …". Notes rewritten for IA, PA, MS, MI.

**Decisions taken on recommendation** (Steve's standing instruction of 2026-10-02; recorded in the scope): the both-spouses rule; 59½ as 60;
pensions vs withdrawals; Michigan's TY2025 cap, and **no** Michigan age gate because its IRA bulletin (RAB 2017-21) was not read; Oklahoma
**kept at 65** — its regulation's general rule states no age but the statute (68 O.S. §2358) was not read.

**Tests changed by design, each found by the literal census or the run:** `t52` (its model-age helper, four Iowa/Pennsylvania note checks,
M-IA1/M-PA1 — which said in advance they would flip — X-5, and the Pennsylvania DOM check D-2); `t53` X-4 (the gated wording); `t51` (a
new dollar field, and its census pins: 24 rows, 32 dated figures, Michigan's cap among the TY2025 figures). **`t10` 2E**, found by the first
full run: its "an exempt state exempts any size" case was Mississippi with nobody counted 65+, which v5.90 rightly taxes ($20,000). Its
intent (size) kept with a household past the gate; the original inputs kept with their new answer, gated from v5.90 by a version list.

**New suite `t55`** (27 checks, current leg): hand-computed cases for each state under and over its gate, single and joint, the
both-spouses rule, pensions vs withdrawals, the count-only path, Michigan under and over its cap, Illinois and the nine no-tax rows
unchanged, and an extinction grid. **Shown failing 14 of 27 on v5.89 first.** Controls `qa/tools/controls_v590_retexempt.py` (repo-only):
**8 of 8**.

**Limitations, disclosed:** per-person retirement income and account type (D-12) — the joint rule over-taxes a couple whose older spouse
owns the account; Iowa's disability and survivor paths; Michigan's early-distribution rule unread; Oklahoma's statute unread.

**Suite, run from the packaged copies:** 4,955 app checks across **54 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12; **GRAND 5,085** — v5.89's 5,057 plus `t55`'s 27 plus `t10`'s
one new check, so nothing else moved. ⚠ **Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87, run folders built by mk_runfolder.sh v589 v590 from a fresh clone of db860f2 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). The first run found one failure, t10 2E on v5.90 (a by-design change; see below); after the fix both halves were re-run in freshly rebuilt folders from the corrected package. Half A GRAND 4863, half B GRAND 222, both exit 0, no suite in both, none DIED.** Per-suite counts are in `TESTING.md`. `smoke_built` on the packaged `index.html`:
22 passed, 0 failed. The prior release's page was rebuilt byte-identical first (`ae0f99bf…`).

Source `653fff47f0f7665bb4d07a74bdf3d109` · built `index.html` `153ad9a2e773c56b5414714bebf9e40a`

## v5.89 — West Virginia's $8,000 senior modification is reduced by the person's taxable Social Security (D-21)

**A MODELLING release** (METHODOLOGY updated). Through v5.88 the model exempted West Virginia Social Security **and** granted the full
$8,000 senior modification per person 65+ on top. W. Va. Code §11-21-12(c)(9)(ii) — read at the build, 2026-10-01 — limits each
**person's** $8,000 to $8,000 minus that person's other modifications, and (c)(8) makes the Social Security "included in federal
adjusted gross income" (taxable SS) one of them; the WV Tax Division states it as "the higher of" the two. A retiree whose taxable SS
is $8,000 or more therefore gets none. The model was **optimistic** by up to $8,000 of income per person: measured on v5.88, a single
66-year-old with $30,000 of IRA income and $20,400 of taxable SS was under-taxed $385.60 a year; a couple, $771.20.

`stateTaxAnnual` now gives each person 65+ max(0, $8,000 − their share of taxable SS), the household's taxable SS split by each spouse's
gross benefit (the split the v5.85 SS layer already makes), through a new WV-only field, `seniorVsTaxableSS`. Maryland's and Maine's
gross-SS offset (`ssOffset`) and Colorado's (`ssSharesCap`) are untouched. A caller supplying only a count of people 65+ gets the household
form, which is never more generous. Decision D21-A, Steve 2026-10-01: per person if the statute says so — it does.

**New suite `t54`** (18 checks, current leg): nine households computed by hand at WV's 4.82 % (single and joint, under and over
65, taxable SS of $0, $3,000, exactly $8,000 and $20,400, a mixed couple where per person and per household differ, the count-only
path); Maryland and Maine held to their own gross-SS rule by hand; an extinction grid of WV household shapes (single and joint, four ages, five taxable-SS levels, three benefit splits)
asserting the relief equals the per-person rule, with Maryland checked on the same grid; and the note. **Shown failing 11 of 18 on v5.88
first.** Negative controls `qa/tools/controls_v589_wv_senior.py` (repo-only): **9 of 9** — the rule removed, its base switched to gross
SS, each person offset by the household total, Maryland's offset removed, the count-only path made generous, the flag removed, a 64
floor, the note drifting.

**Limitations, disclosed in WV's note and METHODOLOGY:** the law's other offsetting modifications — the first $2,000 of WV public or
federal pensions, police and fire pensions, military retirement, U.S. obligation interest — are not modelled (the model has no account
type: D-12), which leaves a WV public pensioner slightly optimistic; military retirement's own exemption is not modelled either
(conservative); the statute caps the modification at income "received by that person", which the household-level model cannot apply
(D-12); the disability path has no input. WV's 4.82 % rate was not re-read in this release.

**Suite, run from the packaged copies:** 4,927 app checks across **53 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12; **GRAND 5,057** — v5.88's 5,039 plus `t54`'s 18, so no
existing check moved (no suite household is in West Virginia). ⚠ **Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v588 v589 from a fresh clone of b584b50 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). An earlier half B, started alone, was cut off at a turn boundary in t48; it was discarded and half B re-run in a freshly built folder from the same inputs, concurrently with half A. Half A GRAND 4835, half B GRAND 222, both exit 0, no suite in both, none DIED.** Per-suite counts are in `TESTING.md`. `smoke_built` on the
packaged `index.html`: 22 passed, 0 failed. The prior release's page was rebuilt byte-identical first (`115b6883…`).

Source `abf14500169ac6a6793607fdda82a688` · built `index.html` `ae0f99bf9e3064da0d4d04f66d8808d0`

## v5.88 — My Data's summary says the age the model applies, and the exact figure (D-25)

**A PRESENTATION release.** No figure, rate, rule or age moved; the engines are unchanged (MC parity 10/10). My Data's state line opens
with a summary built from `STATE_RULES`, not from the note. Through v5.87 it read `$NK/person 65+ exclusion` for every row with a dollar
exclusion — "65+" whatever age the engine applies, which was wrong for **Delaware** (60), **Kentucky** (any age), **Rhode Island** and
**Wisconsin** (67), measured through the DOM at scope — and rounded to thousands, four of which rounded **up** (Delaware's $12,500 read
"$13K"; Maine, Maryland, Montana likewise). It now reads, for example, "$12,500/person exclusion from 60" or "…at any age": the exact
figure the engine uses and the age by the engine's own rule (`exclAge ?? 65`). Decisions D25-A (a) and D25-B (a), Steve 2026-10-01. The
text changes on all 18 exclusion rows; the age changes on four. Found at the v5.87 build by `t52`'s DOM read (D-25).

**New suite `t53`** (43 checks, current leg; node + DOM): all 18 exclusion rows read through My Data, each summary's age compared
with the engine's **measured** onset (the youngest age its tax drops, at $15,000 — below New Mexico's income limit) and with the rule, and
its figure with the engine's, exact; a zero must read "at any age"; no "65+" or rounded "$NK" left in any summary; summary and note agree
where the note states a start; the exempt rows keep their own wording. **Shown failing 38 of 43 on v5.87 first.** Negative controls
`qa/tools/controls_v588_summary_age.py` (repo-only): **7 of 7** — the template reverted, the display's default age drifting with the engine
untouched and the reverse, the "any age" wording broken, rounding planted back, an age on the exempt wording.

**Limitations, disclosed:** New Mexico's summary does not mention its income limit (its note does). The Field Manual's general prose about
"65+ exclusions" was reviewed and left: each sentence uses a 65-floor example or is a dated historical statement. **D-24** (Iowa and
Pennsylvania's exemptions apply at any age; optimistic) is open.

**Suite, run from the packaged copies:** 4,909 app checks across **52 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12; **GRAND 5,039** — v5.87's 4,996 plus `t53`'s 43, so no
existing check moved. ⚠ **Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: two run folders built by mk_runfolder.sh v587 v588 from a fresh clone of be8ec7c with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). The first half A was cut off at a turn boundary after t38 and was re-run alone in a freshly built folder from the same inputs; half B's completed run stands. Half A GRAND 4817, half B GRAND 222, both exit 0, no suite in both, none DIED.** Per-suite counts are in `TESTING.md`. `smoke_built` on the packaged `index.html`: 22 passed, 0 failed. The prior
release's page was rebuilt byte-identical first (`0b9b36a0…`).

Source `9843bd1747a24af2791e4ba0fa94ab7f` · built `index.html` `115b688347e671716f6f562d57608e0b`

## v5.87 — six state notes say when the model applies the exclusion (D-23)

**A PRESENTATION release.** No figure, rate, rule or age moved; the engines are unchanged (MC parity 10/10). Six `STATE_RULES` notes
described a start age the model does not use, or none. Measured on v5.86 (single filer, $50,000 retirement income, through the shim):

- **New York** said "59½+"; the model applies the $20,000 from 65. **Georgia** named "$35K at 62–64"; the model applies nothing before
  65. Both overstate tax for a younger retiree (conservative), and the notes now say so.
- **Iowa** said "55+" and **Pennsylvania** "59½+"; the model exempts retirement income at **any age** (`retExempt` has no age gate), so it
  **understates** tax for a younger retiree — the optimistic direction. Both notes now say so plainly; changing the model is **D-24**.
- **Arkansas** and **Oklahoma** named no age; both now say "applied here from 65". Arkansas's note adds the law's split (IRAs from 59½,
  employer plans at any age). Oklahoma's claims no law age: OAC 710:50-15-49 does not settle one, so it says the state's condition was not verified.

The law each note states was read at the build from: tax.ny.gov (retired persons); Arkansas DFA Subject 206; Georgia Dept. of Audits and
Accounts' Retirement Income Exclusion evaluation; Iowa DOR Retirement Income Tax Guidance; Pennsylvania DOR rev-636 and the PA-40 instructions.

**Scope grew at the build, by its own rule.** The draft (`docs/SCOPE_D23_AGE_START_NOTES.md`) covered New York and Arkansas; its census
found the other four and stopped; Steve widened it (D23-D) and sent Iowa's and Pennsylvania's modelling to D-24 (D23-E). The scope's
proposed invariant was also wrong in both directions (it would have compared the `retExempt` rows to 65 and missed Georgia's range); the
shipped one is the revised form (§7b).

**New suite `t52`** (34 checks, current leg; node + DOM): each rewritten note typed from its source, the model's behaviour behind
each disclosure dollar-exact by hand, an extinction check over all 51 rows (a note names only the age the model applies — `exclAge ?? 65`,
or any age for `retExempt` — unless it carries an "applied here …" disclosure, which must itself be true; no exclusion row silent), an
empty-set guard, and My Data's line for New York, Pennsylvania and Georgia through the DOM. **Shown failing 18 of 34 on v5.86 first.**
Negative controls `qa/tools/controls_v587_age_notes.py` (repo-only): **12 of 12** — each note reverted, "59½+" planted in a third 65-floor row,
a false disclosure (Wisconsin), New York given `exclAge: 59` under its note, Montana's note made silent, Iowa's drifting into the income-limited set.

**Limitations, disclosed:**
- **D-25 (found at the build, decided for v5.88):** My Data's generated summary still reads "65+ exclusion" for every row, which misstates
  Delaware (60), Kentucky (any age), Rhode Island and Wisconsin (67). A different site from the notes, pre-existing since v5.55, and not
  widened into mid-build. `t52`'s extinction covers notes, **not** that summary.
- **D-24:** Iowa's and Pennsylvania's exemptions remain optimistic below the law's ages; the other twelve `retExempt` rows' age rules were not read.
- METHODOLOGY corrected in place: it listed "IA 55+" among the exemptions as though the model applied that age.

**Suite, run from the packaged copies:** 4,866 app checks across **51 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12; **GRAND 4,996** — v5.86's 4,962 plus `t52`'s 34, so no
existing check moved. ⚠ **Run from the PACKAGED copies as two halves at once (approved by Steve, 2026-10-01): one turn cannot hold the ~40-minute single run (a command is capped at 300 s and a turn at about eight calls; two single runs died at the turn boundary, after t29 and t47). Two run folders were built by mk_runfolder.sh v586 v587 from the same fresh clone of 754e948 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: everything else, tooling included). Half A GRAND 4774, half B GRAND 222, both exit 0, no suite ran in both, none DIED.** Per-suite counts are in `TESTING.md`. `smoke_built` on the packaged `index.html`: 22 passed, 0 failed. The prior
release's page was rebuilt byte-identical first (`bad51541…`), so the scaffold is complete.

Source `3bb42add57012e0e8a9d6df350afd0df` · built `index.html` `0b9b36a0f33baac1df933a8a909393a5`

## v5.86 — every state dollar figure carries its tax year (D-18); Maine's and Louisiana's refreshed

Source `74c880bc3af80865f6b99759cc7bba3b` · built `index.html` `bad51541661e84bd0dd245e77f243150` · built from v5.85 `a1d9c5e03e4aa7c059427fdf4fc84a98`. **A modelling release:**
state tax moves for households in Maine and Louisiana; METHODOLOGY gains a section.

**Suite: 4,832 app checks, 0 failed, 0 DIED** — 50 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,962),
run from the packaged copies. **`t51` is new** (57, primary-source values, an extinction check, dollar-exact fixture households, the My Data line through the DOM). `smoke_built` **22 passed, 0 failed**.
Negative controls: `controls_v586_state_years.py` **15 of 15**.

### What changed, and why

- **Nothing in the state table said which tax year a dollar figure came from**, and My Data headlined every state "Model (2026
  approx)" while Maine's, Montana's and Rhode Island's notes said 2025. Every dollar-bearing figure — 31 of them, on 23 states —
  now records the tax year it was checked for against a primary source, and My Data shows those years ("Dollar figures by tax
  year: exclusion 2026 · income test 2025"). The effective rate is called an approximation and carries no year: the rates were
  not re-read in this release (filed as D-22), and a displayed year is a claim.
- **Maine's pension deduction cap is $49,824** (TY2026, Maine Revenue Services' 2026 Form 1040ES-ME) — the model had $48,216
  (2025). Its phase-out thresholds stay at the TY2025 $125,000 / $250,000, which Maine had not updated when this was built, and
  say so.
- **Louisiana's retirement-income exemption is $12,324** (TY2026) — the model had $6,000, the pre-2025 amount. The state
  doubled it to $12,000 from 2025 and indexes it from 2026; the TY2026 figure is the Department of Revenue's own statement in its
  proposed rule of 20 June 2026. It covers pension, annuity and IRA income.
- **South Carolina's note** gave the under-65 retirement deduction as $10,000; it is $3,000. The modelled $15,000 at 65+ was right.
- **The Field Manual** called the whole state module "2026 approximations" in two places; both now say the rates are
  approximate and each dollar figure is dated in My Data.
- **Checked and unchanged**, each against its state's own source: AL, AR, CO, CT, DE, GA, KY, MD, MN, NJ, NM, NY, OK, RI, UT,
  VA, VT, WI, WV. Bills that would have raised Kentucky's, Alabama's, Maryland's and Delaware's did not pass. Montana ($5,660) and
  Rhode Island keep their 2025 figures until those states publish 2026's, and are shown as 2025.
- **What moved on the example household: nothing, by construction** — it has no state selected. The evidence is `t51`'s fixture
  households, computed by hand: e.g. a single 70-year-old in Maine with a $60,000 IRA draw and $20,000 of Social Security pays
  $2,157.58 (was $2,272.56); in Louisiana with $20,000 of IRA income, $230.28 (was $420.00).

### Limitations, stated plainly

- **Louisiana's larger amount enlarges an existing approximation.** Louisiana allows each person the exemption only against that
  person's own retirement income; the model nets it against the household's, which overstates it when one spouse receives most
  of that income (D-12). Louisiana's note now says so.
- **West Virginia is optimistic by up to $8,000 per person per year**: its $8,000 is not in addition to its Social Security
  exemption, and the model gives both. Found here, filed as D-21, fixed in its own release.
- **New York's and Arkansas's exclusions start earlier in law than the model's 65** (conservative). New York's note still says
  59½; whether to correct it is decision D18-3, open, filed as D-23.
- The 42 effective rates are not re-read (D-22); Georgia's and Oklahoma's look stale for 2026 on secondary sources.

### Found while building, and worth recording

- **`t51` caught my own census miss before it shipped:** the Field Manual's "2026 approximations" appeared twice, and my first
  search reported one hit per string — the whole manual is one string. The second site was fixed and the tool corrected.
- **10 existing test pins moved**, all Maine, each recomputed by hand at $49,824 and version-gated so earlier releases
  keep theirs. 8 of them derive from the old cap arithmetically and were invisible to a literal search; the run found them.

## v5.85 — Social Security in seven states follows each state's own law (D-19); Utah's 2026 rate

Source `a1d9c5e03e4aa7c059427fdf4fc84a98` · built `index.html` `7ff3d434fbfb13a32e3582870d991834` · built from v5.84 `1d7208800a325e78220917d3f767b517`. **A modelling release:**
state tax moves for households in CO, CT, MN, NM, RI, UT and VT; METHODOLOGY gains a section.

**Suite: 4,775 app checks, 0 failed, 0 DIED** — 49 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,905),
run from the packaged copies. **`t50` is new** (32, statute-typed, dollar-exact). `smoke_built` **22 passed, 0 failed**.
Negative controls: `controls_v585_ss_states.py` **9 of 9**.

### What changed, and why

- **Seven states taxed "half of taxable Social Security" for every household.** Each actually conditions it on income and/or
  age, so that flat half was wrong in both directions, depending on the household. Each now follows its own statute, read from
  primary sources (`docs/SCOPE_SS_STATES.md` §1):
  **Colorado** — 65+ subtract all of it; 55–64 all at AGI ≤ $75K / $95K, else up to $20K; and the subtraction **uses up** the $24K
  pension cap. **Connecticut** — none below $75K / $100K AGI; above, at most 25 % of total benefits. **Minnesota** — all
  subtracted up to $86,410 / $110,780 (TY2026), then 10 % less per $4,000. **New Mexico** — none up to $100K / $150K, then all (a
  cliff). **Rhode Island** — none at full retirement age and AGI under $107,000 / $133,750, per spouse. **Utah** — a credit of the
  rate × taxable SS, less 2.5 ¢ per dollar of AGI over $54K / $90K. **Vermont** — none up to $55K / $70K (2025 Act 71), phasing in
  over the next $10K.
- **Utah's rate is 4.45 %** from 2026 (S.B. 60, signed 23 March 2026, retroactive) — the model had 4.50 %.
- **What moved on the example household**, lifetime state tax (the Taxes tab, at the defaults), v5.84 → v5.85: Colorado
  **$50,558 → $60,200**; Connecticut $68,875 → $56,871; Minnesota $139,611 → $123,974; New Mexico $100,602 → $82,897; Rhode Island
  $49,096 → $35,364; Utah $92,390 → $87,680; Vermont **$135,505 → $159,160**.
- **Colorado goes UP** although its retirees owe no tax on Social Security: the statute makes that subtraction use up the pension
  cap, and the old model gave both in full (its own note said it overstated the exclusion). **Vermont** was the largest
  optimistic error: the example household sits above its line, so Vermont taxes all of it, not half.
- **The Field Manual said twice that Colorado's shared cap "is not modelled"** — corrected in-app; METHODOLOGY's three passages
  describing the half-rate are marked superseded and point to the new section.

### Limitations, stated plainly

- Minnesota's alternative subtraction (at most $5,840) is not modelled — conservative. Rhode Island uses its 2025 thresholds (2026
  unpublished at the build) — conservative. Thresholds are fixed; indexing belongs to D-18.
- Head-of-household and married-separate thresholds are not modelled (the app has single and joint). The AGI measure omits
  tax-exempt interest (Utah's MAGI adds it). Colorado's 55–64 pension subtraction is not modelled.
- Engine A's state call passes the household's filing status, not a widow-aware one (pre-existing; recorded, not changed).

### Found while building, and worth recording

- **`t50` and the existing suites caught four flaws of mine before they shipped** — a widowed survivor's benefit in the second
  slot would have escaped Connecticut's cap; count-only callers got no Colorado subtraction; Connecticut's cap with gross unknown
  computed $0; and I had put Colorado's cap in a field a v5.56 decision reserves for Maryland and Maine. Scope §7.
- **13 existing test pins moved**, each checked against the statute and version-gated so earlier releases keep their pins.
- **Workspace drift, handled by the rule:** after an environment outage, the scope file held a build record I had not written
  (accurate, but unreviewed). It was quarantined, reverted to the repo's copy, and the record re-applied deliberately; every other
  changed file matched the last verified backup byte for byte.

## v5.84 — the Roth comparator sees your spending draw (D-7), with D-4 measured

Source `1d7208800a325e78220917d3f767b517` · built `index.html` `985b488bf4d622970ef52f055d90bbaa` · built from v5.83 `47beecf81eb45bd6faea899fa093dd81`. **A modelling release:**
Engine A's figures move (below); METHODOLOGY §7 and "The Taxes tab and the drawdown" item 4 are rewritten.

**Suite: 4,743 app checks, 0 failed, 0 DIED** — 48 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,873),
run from the packaged copies. **`t49` is new** (11, dollar-exact at the engine). `smoke_built` **22 passed, 0 failed**.
Negative controls: `controls_v584_draw.py` **6 of 6**.

### What changed, and why

- **Engine A — the Roth tab's strategy comparator, its solve-for grid, the grid's current-slider row and the stress solver's
  tax estimate — now taxes the household's spending draw from Traditional.** It never had: v5.74 put the draw into the Taxes and
  IRMAA engines and excused Engine A because a draw "common to both paths largely cancels". Measured, it does not: four of the
  six strategies SIZE the conversion from this base, so they were filling bracket room the household's own spending had
  already used. The draw is the series the Taxes tab already uses (the withdrawal plan at the slider amount).
- **What moved on the example household** (UI defaults), estate advantage over NO CONVERSIONS: Fill 12 % **$218,720 → $150,518**
  (it now converts $989,133, not $1,203,528); Fill 22 % **$23,915 → −$25,782**; Stay under IRMAA **$63,468 → $884**; your $70K
  slider $125,753 → $112,736. **The solve-for grid's winner stays Fill 12 %**; the $70K slider ranks **#8 of 25** (was #11). The
  stress solver's lifetime-tax input rises **$225,275 → $270,640**, so its thresholds move in the conservative direction.
- **The draw is taxed, not drained** — a decision made on measurement at the build. Taxing AND draining it (the scope's first
  choice) flipped the grid's winner to Fill 24 %, but that answer came from the approximation, not the plan: giving each
  fixed-amount cell its own exact draw changed the winner again in all 11 test households, by $100K–$150K. Taxed only, the
  draw-series choice moves the result by ≈ $15K–$30K. Draining properly needs each strategy's own spending path, which
  Engine A cannot compute; filed as **D-7b**.
- **D-4 (the engines' conversion caps differ) — measured and disclosed, not fixed.** No cap binds at the default $70K/yr; at
  $150K–$250K/yr the Taxes tab and the Withdrawal plan convert lifetime totals ≈ $90K–$181K apart, mostly through D-9's decided
  growth difference. METHODOLOGY §7.

### Limitations, stated plainly

- **Engine A's balances still omit spending** — every strategy keeps the same overstated Traditional balance. Disclosed in the
  Field Manual's Roth tab description and METHODOLOGY; D-7b.
- **The draw series is exact only for the slider's own strategy**; other strategies use the same series.
- The stress solver's tax estimate is still the "current" strategy's lifetime tax spread evenly over the plan.

### Found while building, and worth recording

- **The build stopped twice and went back to Steve** rather than adapting: once when the first design moved the stress
  estimate in the optimistic direction (the opposite of the scope's claim), and once when measurement showed that design's new
  winner came from its own approximation. Decisions H-1 → K-1 and J-1 → K-2 are in the scope's §7.
- **`t49` caught three mistakes of mine before they shipped:** its hand-verified cases first ran with the example household's
  income streams loaded (the harness trap the project instructions name) and read $2,160 for a $1,200 draw; a check expected
  lifetime tax to rise with the draw, which the drain could legitimately reverse; and the grid's current-slider row builds a
  SECOND input object the first edit missed — the scope's census had counted call sites, not declarations.
- **The shipped figures equal the scope's tax-only counterfactual to the dollar** ($150,518, −$25,782, $884): the code does
  what was measured.

## v5.83 — every skin readable: light-skin surfaces, selected items, hovered rows

Source `47beecf81eb45bd6faea899fa093dd81` · built `index.html` `9f39232ee73b0d46f25933302dcf7474` · built from v5.82 `f6a54749bb14a291971395b0db20d11f`. A **presentation
release**: no engine changed (MC parity 10/10), so no figure moves; METHODOLOGY is unchanged. **Desktop layout is box-for-box
identical to v5.82** on all 52 tab-views at 1440 and 820 — only colours change.

**Suite: 4,732 app checks, 0 failed, 0 DIED** — 47 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,862),
run from the packaged copies. **`t48` 104** (was 99): its KNOWN_DEFECT pins are gone — every one of the 13 skins must be 0 —
and it now measures a **hovered** table row on every tab. `smoke_built` **22 passed, 0 failed**. Negative controls:
`controls_v583_surfaces.py` **8 of 8**.

### What changed, and why

- **All 13 skins now meet WCAG AA on every tab.** v5.82 left the six light skins with 106–716 failing text elements each, pinned as
  a known defect. The cause was **366 hard-coded `rgba()` surfaces** — 65 values, every one a dark-theme colour — under the text.
  Each is now the skin's own token at the same opacity (`color-mix()`, as v5.82 introduced), so a light skin's tints come from its
  own palette. The two neutral grey swatch rims on the Skins tab are kept.
- **"Recessed" dark panels** (60 black overlays) now use the page colour at the same opacity (decision G-1): indistinguishable on
  dark skins; on light skins a faint wash instead of murky grey.
- **Selected items on light skins read in ink** (G-2): the active tab and the selected retirement card's date, tag and success rate
  sat on a coloured highlight and measured as low as 3.22:1. A new token, `--on-ring`, is defined only in the six light skins, so
  the default and dark skins look exactly as before.
- **Hovered table rows** (Expenses, Positions) use a light accent wash (G-3). **This also fixes the default skin**: a hovered
  Expenses row read **2.66:1** there — found by `t48`'s new hover leg; v5.82 never measured hover.
- **Light-skin colours darkened slightly** where they still missed AA on plain panels (G-4): Reading Paper's warn, accent,
  positive, info, plan and orange; Field Paper's warn, positive, plan, accent; E-Ink Gray's warn, positive, info, plan;
  Colorblind-Safe's accent. Each is the smallest step to 4.6:1. High Contrast Light and Report change no colours. A before/after
  swatch page shipped with the package for review.
- **Field Manual §13** now says every skin meets AA, hover and selected items included.

### Limitations, stated plainly

- **Most controls are still under the 44 px platform guideline**; the **Field Manual's own small print** is unchanged (both
  disclosed in §13).
- **Borders are not held to a ratio** (WCAG 1.4.11 non-text contrast): they are skin-aware now, but no check asserts them.
- `color-mix()` needs Safari 16.2+ / Firefox 113+ / Chrome 111+; older browsers drop those tints and borders.
- The default skin's crit, violet and old-faint tints move to v5.82's nudged token values (at most a 10-unit shift at ≤ 40 %
  opacity); black overlays → `--bg` differ by at most 6 units per channel on the default. Neither is visible on the layout signature,
  which compares geometry, not colour.

### Found while building, and worth recording

- **The hover defect was in the default skin**, not only the light ones: `t48` parked the pointer at v5.82 precisely because hover
  made readings depend on an earlier tap, and so never measured hover at all. The hover leg now hovers deliberately.
- **Ring opacity was not the lever.** The scope's prototype showed that for blue and violet date labels to clear AA on the
  selection highlight, five of six light skins would need a highlight of opacity 0. The text colour was the fix.
- **`color-mix()` inside SVG `fill` attributes was an open question**: an attribute the browser cannot parse falls back to black.
  Verified on the built page — all three chart fills compute to v5.82's colours. The build record first asserted this before
  measuring it; corrected in the scope.
- **The version bump cost 109 judgement points** again (29 ladders, 79 gated, 1 keyed — `t33`'s `PINS` gets v5.82's figures), none
  outside the three known shapes; `t45`/`t47`/`t48` by hand.

## v5.82 — legible text and usable targets (F-3 / F-4)

Source `f6a54749bb14a291971395b0db20d11f` · built `index.html` `725bde1524d1ce00592aea9a621e1c03` · built from v5.81 `cdca327526e3a259c5269aca02576753`. A **presentation
release**: no engine changed (MC parity 10/10), so no figure moves; METHODOLOGY is unchanged. Unlike v5.79–v5.81, **desktop
changes by design** — reviewed box by box (below).

**Suite: 4,727 app checks, 0 failed, 0 DIED** — 47 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,857),
run from the packaged copies. **`t48` is new (99 checks, real Chromium, the built page, all 13 skins, ~10 minutes).** `smoke_built`
**22 passed, 0 failed**. Negative controls: `controls_v582_legibility.py` **13 of 13** (eight source mutations, four built-page
mutations, the unmutated run at 44 passed / 0 failed).

### What changed, and why

- **Secondary text is readable in every skin.** `--ink-faint` — the app's most-used small-text colour — failed WCAG AA (4.5:1) in
  **9 of 13 skins** (the default measured 3.43–3.83). It now clears 4.6:1 on every base surface in all 13, and `--ink-dim` stays
  at least 1.20× brighter so the three text levels stay distinct (decision D-1). In the dark skins the values were then nudged
  again, the smallest step that clears 4.6:1 on every **tinted row** text was actually measured on.
- **The chart's axis labels were the least readable text in the app** — painted in a *border* colour (`--line2`) at 9 px,
  1.4–3.2:1 in every skin. Every Trajectory label is now ≥ 11 px, the axis text is `--ink-dim`, and the percentile labels lose a
  70 % fade. The axis lines and domain path keep their v5.81 colours (d3 styles all three together; a fill on the path draws a band).
- **62 hard-coded dark-theme colours became skin tokens** (D-3, E-2) — retirement-date, scenario, grade, IRMAA-tier, warning and
  footer colours that nearly vanished on light skins (the RETIRE marker measured 1.34:1 on Report). Every exact match is the
  default skin's own token, so the default does not change; the one-offs are listed below.
- **Eight colours were built by gluing a hex alpha onto a colour** (`${c}33`) — invalid CSS the moment the colour is a token.
  **Three already were, in v5.81:** the income-phase cards' borders and tints were silently dropped. All eight use `color-mix()`
  now (E-1), and those three cards get their tints back.
- **The type floor's leftovers reach 11 px** — the 26-tab grid, three data-row classes, the Ask AI buttons (v5.48 set the 12/11 px
  floor for style objects; these CSS rules survived it).
- **Every control is at least 24 × 24 px** (WCAG 2.2 AA 2.5.8; 15 were smaller — × buttons at 17 px, "+ Add" buttons at 20,
  sliders at 16); a bare checkbox gets its target from a 24 px label. **Five phone-critical controls are 44 px tall below 600 px**
  (D-2): Enter the tool, Use example data, the tab menu, the plan-summary line, and the Simple Mode toggle.
- **Selected controls read in `--ink`** on the `--ring` highlight (Roth law toggle, UI size, skin cards, the selected retirement
  card's description and median) — the highlight made accent- and dim-coloured text fail; the border, tint and ✓ still mark it.
- **Pulsing status text** fades to 85 %, not 60 % (E-3), so it never drops below AA; the title keeps its pulse (a logotype).
- **Field Manual §13** no longer says the tab strip "wraps heavily" (v5.81 fixed that and left the sentence) and now says what
  remains (below). The Skins tab no longer says it has seven themes; it has 13.

**Reviewed desktop change** (layout signature, all 26 tabs at 1440 and 820 against v5.81): every view moves down 4–6 px (the tab
grid's taller text); views with sliders grow 16–22 px (SS, Taxes, Monte Carlo, Roth); My Data gains 31 elements (the checkbox
labels). **No view became wider.** The tab grid keeps its row count (2 / 3 / 3 at 1440 / 1024 / 820).

### Limitations, stated plainly

- **The six light skins still have text below AA** on tinted panels — KNOWN DEFECT, pinned per skin in `t48` and allowed only to
  fall: Field Paper 288 · Reading Paper 716 · E-Ink Gray 269 · High Contrast Light 106 · Colorblind-Safe 144 · Report 198 distinct
  elements across 26 tabs (Reading Paper 665 on a phone). The cause is **366 hard-coded `rgba()` surfaces** (65 values, nearly all
  dark-theme tints), plus Reading Paper's accent and warn tokens. A v5.83 surface pass owns them and needs its own scope.
- **Hovered rows are below AA**: `.prow:hover` / `.erow:hover` tint a row with `--ring`. `t48` measures resting states only.
- **Most controls are still under the 44 px platform guideline** (disclosed in §13). The Field Manual's own small print is
  unchanged — 122 elements under 11 px, 66 below AA — deferred (D-4).
- The top two IRMAA tiers now share `--crit` (their labels differ). One-off colours changed slightly on the default skin:
  `#ff8888`→`--crit`, `#9ec4b0`→`--ink`, `#ddb84a`→`--plan`, `#8a9a8f`→`--ink-dim`, `#ffcc00`→`--plan`; `#ff8800` is a mix of
  `--warn` and `--orange`, identical on the default.
- `color-mix()` needs Safari 16.2+ / Firefox 113+ / Chrome 111+; older browsers drop those borders and tints (as v5.81 already
  did for three of them).

### Found while building, and worth recording

- **The handover's F-4 premise was 33 releases stale** ("8 px × 341, 9 px × 325"): v5.48 already fixed those; `UsabilityFlaws.md`
  kept quoting them. Marked there.
- **The scope under-counted three times, each caught by a command:** 62 hard-coded colours, not 36 (the census read only `color:`
  properties); the alpha-glued colours; and the 366 `rgba()` surfaces text sits on, which were never in the census. The build halted
  twice and went back to Steve (E-1…E-4, then F-1) rather than adapting.
- **Measurement traps, each recorded in the scope:** SVG text paints with `fill`, not `color` (the first contrast probe understated
  the chart); the skin is stored through `window.storage`, so a `localStorage` write silently changed nothing; a pulsing element's
  contrast depends on when it is read (animations are frozen at their faintest keyframe); and on a touch screen **hover sticks
  where the last tap landed** — two phone rows read 3.22:1 only because of it (the pointer is now parked).
- **acorn reports UTF-16 offsets**; Python indexes code points — AST-range edits are applied in Node (the emoji shifted them).
- **The version bump cost 109 judgement points** (vercensus: 29 ladders, 79 gated, 1 keyed — `t33`'s `PINS` gets v5.81's figures,
  no engine change), none outside the three known shapes; `t45`/`t47` by hand.

## v5.81 — a phone's first screen shows the plan

Source `cdca327526e3a259c5269aca02576753` · built `index.html` `c711610e81410ba20c7e61270e5454fe` · built from v5.80 `7a04dadb86bdef6534bdc03a1d87e8d8`. A **presentation release**: no engine
changed (MC parity 10/10), so no figure moves; METHODOLOGY is unchanged. The first release built with the prior source resolved
from the repo's history by md5 (the single-source pool of 2026-09-28).

**Suite: 4,628 app checks, 0 failed, 0 DIED** — 46 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,758), run from the packaged copies. **In that run `domdiff` failed one check** on this release's own
stylesheet and phone-only elements (below); corrected and re-run from the same packaged folder: **32 passed, 0 failed**. **`t47` is new (30 checks, real Chromium, the built page).**
`t45` **88 passed, 0 failed** (now moving between tabs through the phone menu). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v581_first_screen.py` **7 of 7**; `controls_runfolder_prior.sh`
**6 of 6**.

### What changed, and why

- **On a phone, the selected tab now starts on the first screen (F-12).** Measured on the built page at 390 × 844: v5.80's
  content began at y = 1005 — below the screen — behind the header, the retirement cards, the allocation strip and a 26-tab grid.
  Below 600 px wide the grid is now **one native tab menu** (with the Simple Mode toggle beside it), and the retirement cards and
  allocation strip fold into **one line that keeps the chosen date and its success rate** ("PLAN: RETIRE JAN 1, 2029 · 99.8% ▸"),
  collapsed on every visit; one tap opens it. Content now begins at **y = 613** in example mode (≈ 437 with your own data).
- **Desktop and tablet do not change**, verified element by element against v5.80 on every tab: the phone-only pieces have no
  box at 600 px and up; the one added element is the summary's invisible wrapper.
- **One tab list, one way to change tab.** The grid's tab list and labels were written inline; the menu reads the same shared
  list, and both go through the one function that guards unsaved My Data edits — so the menu cannot become a way to lose them
  (tested by editing My Data and leaving through the menu).
- **The app's first breakpoint outside the Field Manual** — the audit's F-1 ("no breakpoints"), partly addressed.

### Limitations, stated plainly

- **The header itself is unchanged** (216 px on a phone); compacting it was option C, not chosen. The example-data banner stays.
- **Text size and touch targets (F-3/F-4) are unchanged.**

### Found while building, and worth recording

- **The code was written before `t47`,** against the test-first order every recent scope spelled out. `t47` was then run against
  v5.80's page, where its claims fail, so it discriminates; the order was still wrong.
- **`t47`'s first structure check reported a second copy of correct code:** it counted a prefix of the tab list, and the Simple
  Mode list starts with the same three tabs. It now compares the complete list.
- **The new CSS landed between an existing rule and its comment.** The AST literal census caught it; the repair was proven to move
  only the comment.
- **`t45` (v5.79) clicked the tab grid on a phone** — which v5.81 hides — and timed out. It now moves between tabs through the
  phone menu there, as a phone user does.
- **`mk_runfolder.sh`'s third argument was typed as an output folder twice in a day** and refused as "prior source not found". A
  third argument that does not end in `.jsx` is now the output folder.
- **`domdiff` compared everything in the page, not what is rendered.** Its Withdrawal check read `body.textContent`, which
  includes the stylesheet's text and v5.81's phone-only elements (no box at desktop width) — so any CSS addition failed it with no
  cell moving (v5.79 had worked around this for one version pair). It now excludes `<style>` text and `.dc-phone-only` elements for
  every pair, and stays byte-strict on everything else.
- **Decision recorded, 2026-09-28 (Steve):** the 24 release-pinned `controls_v5*` scripts **stay out of the knowledge pool**, their
  copies kept in the repo. This closes the "whether they stay out of the pool is Steve's call" in the ops entry of 2026-09-28
  (second); it is also why `controls_v581_first_screen.py` ships to the repo only.

## ops 2026-09-28 (third) — control P22 went vacuous when the pool became single-source; fixed

No app change (v5.80 stays current). After the single-source package was uploaded, `package_check_controls.sh` reported **P22
NOT CAUGHT**. P22 builds "a different release" by copying a source over the clone's, and picked it with
`ls /mnt/project/DangerClose-v5_*.jsx | head -1` — the prior while the pool held two sources, the CURRENT once it held one, so
it copied v5.80 over v5.80 and planted nothing. The control framework reported it rather than passing it. **The single-source
scope's census missed it**: it covered `package_check` and `mk_runfolder.sh`, not controls that glob the pool's sources (a
full census now finds P22 the only such site). P22 now resolves the prior release from the clone's history by the manifest's
Prior md5, as `mk_runfolder.sh` does, and reports itself INVALID if that equals the current source. After the fix, post-upload:
**62 behaved as designed, 0 did not, 1 skipped**, P22 caught by H-3.

## ops 2026-09-28 (second) — the pool keeps ONE source; the prior comes from the repo's history by md5

No app change (v5.80 stays current). The pool held two full copies of the app source — current and prior, 1.3 MB each, about
half of it — because `mk_runfolder.sh` took the prior as a file path. It now resolves the prior from the clone's git history by
the md5 the manifest records for that version (from whichever build table names it, so it works mid-build and after the roll),
and refuses a shallow clone, an unrecorded version, and an md5 no commit holds. A file may still be passed, but it is accepted
only if its md5 matches (decision D-1). `DangerClose-v5_79.jsx` and `dom_entry_v579.jsx` leave the pool (**~1.3 MB**; pool
111 → 110 with the one new control script).

- **`package_check`:** J-3 and J-4 now assert **one** source and **one** dom entry; K-4/K-5 check only the Current table
  against the pool; **K-6** asserts the pool's one source is the Current table's; new **K-5b** asserts the Prior table's md5 is
  held by a commit in the clone. None of these had a negative control before; **P68–P71** now plant each defect after first
  building the post-upload pool state, so none is "caught" by a baseline that is already red.
- **`qa/tools/controls_runfolder_prior.sh`** (new, general-purpose, pooled): git mode resolves the prior byte-exact; a correct
  file is accepted; a wrong file, an unrecorded version and a shallow clone are refused, each by exit code and message.

**A miss in the previous ops package, found while building this one.** OPERATIONS' "What does NOT rotate" (2026-09-03) said the
pool "keeps every `controls_v*.sh`" because a control script is evidence. The package that un-pooled all 24 did not see that
section, so the document contradicted itself for a day, and the un-pooling was approved without that rule being on the table.
Nothing was lost — the repo keeps all 24, which is what makes them evidence — and the section now says so. Whether they stay
out of the pool is Steve's call; re-pooling them costs ~150 KB.

## ops 2026-09-28 — the knowledge pool ran out of room: two moves free ~430 KB, nothing deleted

No app change (v5.80 stays current: source `7a04dadb86bdef6534bdc03a1d87e8d8`). Two moves, both to the repo, neither losing
anything:

- **The CHANGELOG split again.** v5.60–v5.74, with the ops entries between them, moved **verbatim** to
  `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` (repo only). This file now holds v5.75 onward and points to both archives
  (315 KB → 33 KB). The move was checked byte for byte: the archive's body equals the removed block, and the pieces
  reassemble into the original.
- **The 24 release-pinned control scripts (`controls_v557` … `controls_v580`) left the pool.** Each runs only inside its own
  release's run folder, so no later session can use a pooled copy. They stay in the repo; their manifest rows read
  *un-pooled, repo-only*. Three had been pooled with no manifest row at all and gained one. OPERATIONS §G now says new ones
  ship to `github/` only (~150 KB).

Checked before moving, per OPERATIONS §G: none of the 24 scripts carries an open decision; the CHANGELOG records only what
shipped. The manifest's superseded ship notes and old delete-first lists (~130 KB) were **not** archived — they mention 30
open items that must each be traced to a live register first. A larger saving is scoped next: the pool keeps two full copies
of the source (1.3 MB each); the prior one could come from the repo's history by its recorded md5.

## v5.80 — Bull-leaning is the default scenario, and your choice is remembered

Source `7a04dadb86bdef6534bdc03a1d87e8d8` · built `index.html` `a7394fad7c58dfccc2ddce86ac6dd0c9` · built from v5.79 `b06841a0c23f6451ca60c66755355567`. **No engine changed**
(MC parity 10/10); what changed is the scenario every run assumes unless the user chooses otherwise, so `METHODOLOGY.md`'s
description of the default prior is rewritten. `src/index.html` and `src/main.jsx` are unchanged.

**Suite: 4,592 app checks, 0 failed, 0 DIED** — 45 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,722), run from the packaged copies. `t46` is new on both legs (11 on v5.79, 16 on v5.80).
`t45` (real Chromium) **88 passed, 0 failed**. `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v580_scenario.py` **6 of 6**.

### What changed, and why

- **A first visit now starts on BULL-LEANING instead of BASE.** Measured against the app's own 1928–2025 returns: BASE
  expects 3.1% nominal / **0.4% real** equity return; BULL-LEANING 5.2% / **2.6% real**, and keeps history's frequency of bad
  years (10% of simulated years below −10%, against 12% in the record). It still sits about 5 points below history's average,
  so the default stays on the conservative side. (HISTORICAL matches the average only by making bad years about four times
  rarer than they were — the risk this app exists to test.)
- **Every user's numbers change on their next visit**, because nobody had a saved choice before. On the example household the
  displayed success rate moves from 99.6% to 99.8% (it is well funded); its median balance 25 years out from $1.96M to $2.11M.
  Households nearer the edge will move more. Choosing BASE on the Monte Carlo tab brings the old model back — and now stays.
- **The chosen preset is remembered** in the browser, exactly as the Social Security and ACA scenario settings already are:
  restored on the next visit, cleared by "delete everything", and not written into backup files (neither are those two). An
  unrecognised stored value falls back to the default rather than breaking the app.
- **The "not the default" warning names the default** (it used to say "non-base scenario"), and the Field Manual's glossary
  gives Bull-leaning's crisis / recession / stagflation frequencies (2% / 8% / 5% a year) with Base's alongside.

### Limitations, stated plainly

- **The "10–20 points lower than raw-history tools" figure** in METHODOLOGY was measured under BASE and is kept as that; the
  gap under Bull-leaning is smaller and has not been re-measured across households.
- **The preset is per browser.** A user on two devices chooses on each; a restored backup does not carry it.

### Found while building, and worth recording

- **A test that could not fail.** `t46`'s first draft checked that a saved BASE came back on the next visit — but BASE was the
  old default, so the check passed on the old code with no restore at all. It now restores HISTORICAL, which neither version
  defaults to.
- **`domdiff` compared different inputs, not different engines.** It rendered each version at its own default, so the new
  default made three identity checks fail. It now pins BASE for both legs through the key v5.80 restores; every check stays
  byte-strict, and the run doubles as a second proof that the restore works.
- **The version-registration sweep does not see Python files**, so `t45` (the first Python suite) was registered by hand.

## v5.79 — the app fits a phone

Source `b06841a0c23f6451ca60c66755355567` · built `index.html` `137a992f43e5a7d013d67e7ee959c31e` · built from v5.78 `536597644ae036a66f9a441e6311ad5c`. A **presentation release**:
no engine changed (MC parity 10/10, every engine suite unchanged), so no figure anywhere moves. `src/index.html` and
`src/main.jsx` are unchanged; `METHODOLOGY.md` is unchanged (no modeling change, decision D-4).

**Suite: 4,564 app checks, 0 failed, 0 DIED** — 44 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,694), run from the packaged copies. **In that run `domdiff` failed one check on this release's own CSS** (below);
it was corrected — for this pair only — and re-run from the same packaged folder: **32 passed, 0 failed**. The totals count it at 32. **`t45` is new: 88 checks in real Chromium against the
built page.** `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v579_layout.py` **7 of 7**. Per-suite: `TESTING.md`.

### What changed, and why

- **No tab scrolls sideways on a phone any more (F-11, the audit's highest-ranked open item).** At 390 px every one of the
  26 tabs was 566–680 px wide on v5.78, so every screen scrolled sideways; now all 26 fit. Desktop and tablet are
  **unchanged, element by element**: every element of every tab's default view sits in exactly the same place and size as
  in v5.78, at 1440 and 820 px (measured with the Monte Carlo seeded, and repeat-run to prove the measurement is exact).
- **The audit's diagnosis was only part of it.** It traced the overflow to one control — the retirement selector's grid —
  and proposed a one-line fix. Measured in the browser first, that fix left all 26 tabs overflowing. The shell had three
  causes (the selector grid, the text inside each retirement card, and the allocation strip), and eleven tabs had wide
  tables or card rows of their own.
- **How:** every equal-width grid column may now narrow on a small screen (`minmax(0, 1fr)`, identical to the old `1fr`
  whenever content fits); each wide table or card row sits in its own sideways-scrolling box, so the table scrolls and the
  page does not (decision D-1); drop-down menus are capped at the screen's width; a few rows may wrap or narrow on a phone.
- **The Field Manual's "designed for a desktop browser" note** no longer says wide tables make the page scroll; it says
  the page fits and a wide table scrolls within its own box, and that the tab strip still fills the first screen.

### Limitations, stated plainly

- **The first screen on a phone is still all header and tabs (F-12)** — the selected tab's content starts near the bottom
  edge. That is a design choice about what to hide, and is its own release (decision D-3).
- **Text size and touch targets (F-3/F-4) are unchanged.**
- **Scrolling tables are a compromise on a phone:** readable, but sideways within their box. Reflowing tables into stacked
  cards is the better phone experience and is a possible follow-up, table by table.
- **What `t45` cannot see.** It measures page width. Each scroll box gives its table a 600 px floor (320 / 480 px for two
  of Grade's) so cells stay legible inside it; the page fits with or without that floor, so no page-width test guards it.
- **Desktop and tablet were verified on each tab's default view** with the example household; expanded panels and other
  data were not measured element by element.

### Found while building, and worth recording

- **The first wrapper rule changed desktop.** It let each table be as wide as its unwrapped content, which forbade cell
  text to wrap at *every* width: six desktop and tablet views came out up to 98 px shorter. The element-by-element check
  caught it before anything shipped; it was replaced by a fixed floor that cannot engage where the table already has room.
- **The last 2 px were text, not an element.** "~$16K/yr" was a hair wider than its card; no box-based probe could see it,
  because text has no element box of its own. A probe that measures the text itself found it.
- **Rolling out a Python suite needed the run-folder builder.** `mk_runfolder.sh` copied only `.mjs` and `.sh` suites, so
  `t45` would have been left out of every run folder and run nowhere; it now copies `qa/t*.py` and the tree's built page.
- **`t45` first failed on a correct page under load.** "Use example data" starts the Monte Carlo on the page's main thread; with
  the full suite running alongside it passed Playwright's 30 s click limit. The page was fine (the button was on screen and
  on top, measured); `t45` now allows 120 s, stated in the code, so it fails on layout and never on load.
- **`domdiff` compared the Withdrawal tab's full text — which includes the shell's CSS.** This release added CSS, so the
  check failed on a change made on purpose. For the v5.78→v5.79 pair only, exactly the two inserted passages are removed
  (each must occur exactly once) and nothing else; later pairs compare byte for byte again.
- **The shell is defended twice.** Reverting the selector's grid alone, or the allocation strip's, now breaks nothing: the
  fixes inside them (cards that may shrink, rows that wrap) cover them too. Controls M2 and M3 revert both layers, and then
  every tab breaks — defence in depth, not a blind spot.
- **One `t1` assertion counted 9-column grids by their spelling**; the same two grids are now spelled
  `repeat(9, minmax(0, 1fr))`. Gated per leg, same protection.

## v5.78 — the IRMAA top tier starts at its threshold

Source `536597644ae036a66f9a441e6311ad5c` · built `index.html` `a11c46dca503a433eaaf6665427769f9` · built from v5.77 `9cdd345d488443a8ca146e8cbb7da332`. `src/index.html` and
`src/main.jsx` are unchanged. **The example household does not move**: all seven Roth strategies' lifetime tax, widow-years
tax and lifetime IRMAA are identical to v5.77 (measured), MC parity is 10/10, and its IRMAA-tab MAGI never comes within half
of the joint top threshold. `METHODOLOGY.md` gains the top-tier rule; `docs/FlawsToFix-v5_73-Phase2.md` marks C-1 fixed and
records **C-13**.

**Suite: 4,469 app checks, 0 failed, 0 DIED, across both legs** — 43 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,599), run from the packaged copies. `t44` is new on both legs (29 on v5.77,
36 on v5.78). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v578_irmaa.py` **7 of 7**; `package_check_controls.sh`
in the pre-upload phase (pool given) **56 behaved as designed**, including **P66/P67**; its one miss is `P48`, which by
design fires only after the upload (OPERATIONS §I — run it again then), and `P15` and `P58`–`P61` skip (no ops or handover package). Per-suite: `TESTING.md`.

### What changed, and why

- **A MAGI of exactly the IRMAA top threshold now pays the top surcharge (C-1).** 42 U.S.C. §1395r(i)(3)(C) makes tiers 1–4
  "not more than" their upper amount but the top tier "at least" $500,000 ($750,000 joint) — re-read at the source for this
  release. Every engine used "not more than" for the top tier too, so a household exactly on that line was billed one tier
  low: **$580 per person per year optimistic** (single, premium year 2028: $6,360 where the law gives $6,940). It reaches
  only a household sitting exactly on the threshold, which is what an IRMAA-aware plan aims at.
- **Tier selection is one shared rule.** Two loops in the Roth comparator and one in the IRMAA tab's engine each chose the
  tier; all three now call one helper beside the one that computes the thresholds (v5.14), the way v5.77 made §86 one rule.
- **The IRMAA tab's headroom from tier 4 is one dollar less** (decision D-1): tiers 1–4 are "not more than", so adding the
  full gap stays in the tier; from tier 4 the next tier starts *at* its threshold, so the most a household can add and stay is
  one dollar less. The tier table's top row reads **≥ $750K** (≥ $500K single), not "> $750K".
- **Audit housekeeping.** The audit's at-a-glance table showed C-8, C-3 and C-6 as open long after v5.74 and v5.75 fixed them;
  they are annotated. `MissingFeatures.md` and `ARCHITECTUREIssues.md` opened with a "build under audit: v5.29" table whose
  current blocks were the v5.73 ones further down — which misled the v5.77 handover, and a recommendation made from it, into
  proposing a Phase 3 that had already run; each now names its current pin first. The top-five summary notes what is fixed.
- **Two new `package_check` checks, K-10 and K-11**, fail an app release whose `TESTING.md` "Current build" line, or whose
  manifest's newest ship note, names another version. The first went stale four times, the second was skipped by two
  consecutive releases; both were only ever caught by eye. Each has a control (P66, P67).

### Limitations, stated plainly

- **Projected IRMAA thresholds are not rounded to $1,000** as the statute rounds CMS's figures (2028, single tier 1:
  $113,403.60). Recorded as **C-13** and deliberately not fixed here (D-2): rounding would move every projected edge by up
  to $500 and reach far more households than C-1, so it gets its own measurement, alongside the brackets' $50 rounding.
- **Engine A's second tier loop sits inside the taxable-sale funding solver** and cannot practically be placed on a threshold;
  `t44` covers it through the helper sweep and a parser check that it calls the helper, not by a numerical case.

### Found while building, and worth recording

- **"Exactly at the threshold" is not always reachable.** Thresholds like 750,000 × 1.02⁴ are not round, and no monthly
  pension × 12 reproduces some of them bit for bit: a naive joint case landed a hair *under* the 2029 threshold and a hair
  *over* the 2031 one, and would have passed on the broken build. `t44` searches for a year whose threshold can be placed
  exactly and asserts that it found one.
- **`t10`'s reference oracles carried C-1's own rule.** Its exact-top case compared the engine's `<=` against the oracle's
  `<=` and agreed. Both oracles now state the law; a control that forces the fixed rule onto the v5.77 leg fires on exactly
  the two exact-threshold cases (−$580 single, −$1,160 joint), proving the case is reached.
- **The audit counted "Engine A ×3" tier comparisons**; the parser found two loops plus an IRMAA-avoidance cap that targets
  tier 1 and cannot reach the top. The count is corrected in the audit's entry.
- **The manifest's hash rows were first rolled by file name, which is wrong for exactly one file.** `index.html` names two
  different things: the built app in the repo root, and the Vite template the pool keeps (from `src/`). The roll wrote the
  built app's hash into the template's row; it was caught on inspection before packaging and restored (K-8 would also have
  failed it). The only other pooled name held by several repo paths is `README.md` (three of them); this release changes
  none, so no other row was at risk — but a roll must go by path, not by name.
- **Two full runs were interrupted** between working sessions (green through `t28` and `t38`, no GRAND line) and were
  re-run in full; a partial run is never counted. The counts above are from a complete run on the packaged copies.

## v5.77 — one Social Security tax rule for every engine

Source `9cdd345d488443a8ca146e8cbb7da332` · built `index.html` `a2bc67451b11cad440709e3c342834d5` · built from v5.76 `66b0dd944333a53f4cc00a54b9e3d618`.
`src/index.html` and `src/main.jsx` are unchanged. **The example household does not move**: all seven Roth strategies'
lifetime and widow-years tax are identical, MC parity is 10/10, and the Taxes and IRMAA tables are byte-identical on screen
(`domdiff` 32/32). Figures move for two kinds of household, in opposite directions — see *Who moves*. `METHODOLOGY.md`'s §86
passage is replaced by one account; `docs/FlawsToFix-v5_73-Phase2.md` annotates C-4 and D-1 fixed and adds **C-12**.

**Suite: 4,399 app checks, 0 failed, 0 DIED, across both legs** — 42 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,529), run from the packaged copies. `t43` is new on both legs (32 on v5.76, 37 on
v5.77). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v577_ss86.py` **6 of 6** as required. Per-suite:
`TESTING.md`.

### What changed, and why

- **Taxable Social Security is now computed in one place.** 26 U.S.C. §86 decides how much of a household's benefits is
  taxable, and through v5.76 the app wrote that rule out four times — in the Roth-strategy comparator, the Taxes tab, the
  IRMAA tab and the Roth tab's year table. v5.77 replaces all four with one function written line for line from the IRS
  Social Security Benefits Worksheet (2025 Form 1040 instructions, re-read from irs.gov at this build). Each tab passes the
  filing status for the year it is taxing — joint, or single once a survivor files alone.
- **The Roth-strategy comparator overstated taxable benefits in a narrow case (C-4).** Above the adjusted base amount the
  worksheet carries up the smaller of half the benefits and half of the capped excess (line 14). The comparator dropped
  the half-benefits limb — the same error v5.45 fixed in the Taxes tab, whose fix never reached this copy. Worked case: a
  single retiree born 1958 with $6,000 of benefits and a $32,000 pension in 2026 was charged **$2,026** of federal tax
  against **$1,876** by the worksheet (+$150; +$60 at $8,000 / $31,000). Pessimistic, and only in years with benefits
  under $9,000 single / $12,000 joint and provisional income above the adjusted base.
- **The IRMAA tab taxed a single household's benefits on the married thresholds (C-12).** Its formula was right, but it took
  the §86 amounts from the flag that marks a married household's widowed years, so a household single from the start got
  $32,000 / $44,000 instead of $25,000 / $34,000. Optimistic: a single retiree with $60,000 of benefits and a $62,500
  pension read MAGI **$109,725** (no surcharge) against **$113,500** — tier 1, **$1,150** of lifetime IRMAA. Found at this
  build by executing the rule on a grid (55 of 160 cells wrong, all single, by up to $7,000 of taxable benefits); the
  audit had read that engine and not run it. Fixed in this release by decision (D-5).
- **METHODOLOGY's §86 passage said two contradictory things** — that the half-benefits cap "is applied in both places as
  of v5.45", then that it "remains uncorrected" — and named neither the comparator nor the IRMAA tab. It is now one account
  of the shared rule, its history and both corrections (D-1).

### Who moves

- **A household with small benefits** — a low-earning single retiree, or a year with only one small benefit in payment, or
  a late claim's pro-rated first year — in the Roth tab's comparisons: taxable benefits fall by up to $1,838 (single) /
  $2,463 (joint) a year, and tax with them. Conservative before; correct now.
- **A single household** on the IRMAA tab: MAGI rises wherever the single thresholds bite and the 85% cap does not. On the
  example household made single, **eight years rise** — exactly $7,000 in 2032–2038, $5,644 in 2031 — with no change in
  surcharge. Optimistic before; correct now.
- **Married households do not move** in either place: they file jointly until the year after a death, when the IRMAA tab
  already used the single figures, and their benefits are far above the line-14 region.

### Limitations, stated plainly

- **The worksheet's adjustments (line 6) and tax-exempt interest (line 4) are not modelled**, and neither are lump-sum
  elections or repayments (§86(d)–(e)). Unchanged by this release; now stated in one place.
- **The comparator's tax is resolved to the dollar, not the cent.** It reports totals only, so `t43` measures it through a
  one-year household's tax: about $10 of taxable benefits at the 10% rate. Four of `t43`'s 70 line-14 cells overstate by
  exactly $5.00 on v5.76 and are invisible in the tax for that reason; the suite says so and pins 66.
- **Withdrawal-tab bracket column (C-5) is untouched.** Engine D's flat 85% there is a display figure and out of scope.

### Found while building, and worth recording

- **The scope's census missed two of Engine A's five call sites**, including the line that actually taxes the year. The fix
  was at the definition, so nothing changed; the scope's build record corrects the census.
- **Sixteen `t1` assertions pinned the deleted per-site text.** Found by executing every string and regex literal in the
  suite against both builds (an AST census, OPERATIONS §B1a), not by searching for names; gated per leg.
- **Two existing suites run the single example household and stayed green on both legs** while its IRMAA MAGI moved in
  eight years. Neither was wrong — they compare cases or pin other figures — but neither witnessed C-12. `t43` §F now does.
- **`t24` §D had tested dead code since v5.45.** Written at v5.42 against a transcription of the app's middle
  tier, it passed on every build after v5.45 fixed the app and could never flip. It now tests the shared function, gated on
  the version so a build missing it fails loudly.
- **The rewrite of that section was itself lost once, and a negative control found it.** The copy into the run folder was
  on a command line the sandbox shell rejected, so the original file was registered and run in its place. Control `M5`
  fired nothing; the investigation found the missing file. With the rewrite in place, `M5` fires and reproduces the
  historical $2,468 / $1,850 bounds exactly.
- **The v5.75 and v5.76 ships left no ship note or retirement entry in `PROJECT_KNOWLEDGE_INDEX.md`.** Recorded there, not
  back-filled.
- **The boundary census already covered both blind spots (OPERATIONS §K1), so no row was added.** Run on the example
  household at this build, `boundaries.mjs` reports `filing` as "the single path is unexercised" — the gap C-12 hid in — and
  both `ss*_band` rows as outside the THR2 − THR1 band (under $12,000 joint), which is where worksheet line 14 binds and C-4
  lives. The band row was written for v5.45's middle-tier cap; it is the same band.

## v5.76 — a single household is no longer paid spouse B's Social Security

Source `66b0dd944333a53f4cc00a54b9e3d618` · built `index.html` `1254aa00d608a98e0f29e22f974ab96d` · built from v5.75 `4453cf274ef8c59f5ea610528eed97ab`.
`src/index.html` and `src/main.jsx` are unchanged. **Figures move only for a single household whose plan was loaded
from a file — all toward lower balances and more tax.** Married households are untouched: on screen the Taxes and IRMAA
tables are byte-identical across the pair (`domdiff` 32/32). `METHODOLOGY.md` gains *A single household is never paid
spouse B's Social Security (v5.76)*; finding C-7 in `docs/FlawsToFix-v5_73-Phase2.md` is annotated re-measured and fixed.

**Suite: 4,319 app checks, 0 failed, 0 DIED, across both legs** — 41 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,449), run from the packaged copies. `t42` is new on both legs (17 on v5.75, 34 on
v5.76). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v576_c7.py` **6 of 6** as required, including
`M3`, which re-adds a read of spouse B's benefit that bypasses `getSSB()` entirely and must be caught by the sweep.
Per-suite: `TESTING.md`.

### What changed, and why

- **A single household has no spouse B, so it has no spouse-B benefit.** Social Security retirement benefits belong to
  the worker who earned them (42 U.S.C. §402(a)). Twelve of the 25 reads of spouse B's benefit already tested for a
  single household; thirteen did not — the Withdrawal plan, both Monte Carlo loops, what Ask AI is told about the
  household's income, and several tab figures. Since v5.74 the Withdrawal plan's draws feed the Taxes tab, so its
  error became a tax error too. The rule now lives once, in `getSSB()`, which returns zero for a single household.
- **The loader no longer invents one.** A single household's plan file with no spouse-B section — the natural shape of
  such a file — was given the example household's $1,300/month by default, and `getSSB()` had a second fallback to the
  same figure. It now loads with zero.
- **A stored figure is left alone, and the app says so.** If a single household's file carries a spouse-B benefit, it
  stays in the file — switching back to married restores it — but no calculation uses it, and one line under the header
  says so while it is present. Checked live at render, so it cannot outlast a My Data save that clears the figure.

**Size, on the example household made single** (retirement 2029, base preset, no conversions): the plan paid **$308,076**
of spouse-B benefits that do not exist; the ending portfolio read **$427,269** high, spending draws $301,146 low,
lifetime federal tax **$38,916** low, and the Monte Carlo median ending balance **$61,158** high. Every error ran
optimistic. Each is zero on v5.76 against the zeroed-benefit case, to the dollar.

### Limitations, stated plainly

- **The route is loading a plan file.** Both in-app ways of making a household single already cleared the figure on
  save, which narrows the audit's original description of who was exposed. A hand-edited file, a converted document or a
  backup from before the save paths cleared the figure are the realistic cases.
- **The Monte Carlo success rate did not move on the example household** — 100% either way; the plan is very safe — so
  this release shows its Monte Carlo effect through the median balance. A tighter single household's success rate would
  move, and was not separately measured.
- The twelve pre-existing inline single tests are now redundant and were left in place deliberately; removing them is
  churn with no behaviour change.

### Found while building, and worth recording

- **The audit's severity no longer fitted.** C-7 was rated low–medium at v5.73 as one site in one engine. Re-verified on
  v5.75 it had a narrower route (file load, not the in-app toggle), a second and larger route (the loader default), and a
  wider reach (the Taxes tab via v5.74's bridge, and Monte Carlo).
- **A Monte Carlo seeding trap.** The simulation's market noise comes from `d3.randomNormal`, and d3 captures its own
  reference to `Math.random` when the library loads. Replacing `Math.random` after import seeds only half the randomness:
  identical runs then differ by ~$3,000, and a first measurement for this scope ($70,110) was contaminated by exactly
  that. `t42` installs its seeded source before the import and asserts the harness is deterministic (`M-0`) before
  trusting any Monte Carlo comparison.
- **`t42`'s rendered check first failed on a stale screen.** Clicking the tab that is already showing changes no state,
  so React skips the render and the previous note stays visible. The check now switches between two different tabs.
- **Registration was clean on the first pass.** The project's sweep (`vercensus.cjs`, given its directory arguments) sized
  the work before any edit, and the three shapes it cannot see — `t31`'s `ORDER`, the ternary chains and the
  display-string maps — were handled explicitly. v5.75 needed two rounds of fixes for the same work.

## v5.75 — the survivor's age deductions, and a deduction ordinary income never used

Source `4453cf274ef8c59f5ea610528eed97ab` · built `index.html` `fac9dd22a686bfe40f9a3cc2962dcc21` · built from v5.74
`1ff04dee1b43b20880a8500ab9645f02`. `src/index.html` and `src/main.jsx` are unchanged. **Figures move for two
households: one whose first death leaves a survivor under 65 (tax goes UP — the deduction was not theirs), and one
whose ordinary income is below the standard deduction while it holds gains or qualified dividends above the 0% band
(tax goes DOWN).** The example household is unaffected — on screen the Taxes and IRMAA tables are byte-identical
across the pair (`domdiff` 32/32). `METHODOLOGY.md` gains *Who the age-65 deductions belong to, and an unused
deduction against gains (v5.75)*.

**Suite: 4,265 app checks, 0 failed, 0 DIED, across both legs** — 40 app suites plus MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,395), run from the packaged copies. `t41` is new on both legs (36 on
v5.74, 39 on v5.75). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v575_c3c6.py` **8 of 8** as
required, including `M4`, which floors only the AMT stack and must fire the phantom-AMT check while every total stays
correct. Per-suite: `TESTING.md`.

### What changed, and why

- **The age-65 deductions belong to the people on the return.** §63(f)'s additional standard deduction and the OBBBA
  senior bonus are per individual *on the return*; on a single return that is the filer alone. Through v5.74 a single
  return took `Math.max(ageA, ageB)`, so a **surviving spouse under 65 received both deductions through the deceased
  spouse's age**, and a single household with a stale spouse-B birth date on file could receive them through someone
  not on the return at all. On a household whose first death leaves a survivor aged 62 with $50,000 of pension income,
  federal tax was understated by **$975.96** in the first widowed year (2028: $2,756.02 against $3,731.98, the bonus
  still in force) and by **$261.00** and **$266.28** in the two years after. The stale-date case understated by
  **$246/yr** — measured on Engine A, where it was live; it was not live on Engine B. Both engines and the Roth tab's
  bracket projection now decide it through one shared helper, `persons65OnReturn`. Sources: IRS Pub. 501 (2025),
  *Death of spouse*; 2025 Form 1040 instructions, Schedule 1-A Part V, *Death of a taxpayer in 2025* (added by the IRS
  after first print, and it gives the bonus the same rule and the same example).
- **A deduction ordinary income does not use now reaches the gains.** 26 U.S.C. §1(h)(1) applies the preferential rates
  to net capital gain *"or, if less, taxable income"*, and the IRS's Qualified Dividends and Capital Gain Tax Worksheet
  measures the gains against taxable income **after** the deduction. Through v5.74 the model stacked gains on ordinary
  income floored at zero, so the unused deduction was simply lost. A single filer with no ordinary income and $60,000
  of qualified dividends was charged **$1,583 instead of $0**; with $8,000 of ordinary income and $70,000 of dividends,
  $3,083 instead of $1,868. Corrected on the regular **and** the AMT path in both engines, in all thirteen stacking
  call sites.
- **Fixing only half the second defect re-routes the overcharge into AMT rather than removing it** — $1,583.00,
  $1,215.00 and $82.00 of pure AMT on the cases above, measured on both engines during the build. This is why `t41`
  asserts `amt == 0` per case and not only the total, and why control `M4` exists.
- **The Roth tab's bracket projection is hoisted** to module level as `projectBracketsAt` and exposed through the test
  shim, so `t41` checks its deduction to the dollar. Its figures were previously readable only through the DOM, where
  rendering rounds to the nearest $1,000 — a $500 floor under any invariant, larger than the $2,050 deduction at 12%.

### Limitations and approximations, stated plainly

- **The death year is still approximated, and in the optimistic direction.** The model holds birth *years*, not death
  dates, and treats the death year as a joint return counting the decedent by calendar-year age. The statute counts a
  decedent as 65 only if they reached 65 **on or before the date of death**. For a decedent whose birthday falls after
  their death date in that year, the model grants one deduction the return is not entitled to — one year, one
  deduction, disclosed in `METHODOLOGY.md` and unchanged by this release.
- **Engine A still does not model the $6,000 bonus at all** (a pre-existing, disclosed simplification), so its widowed
  figure is $3,732 where Engine B's is $3,731.98 plus the bonus effect. The Form 6251 add-back question therefore
  cannot arise there; Engine B's AMT already starts from gross ordinary income and subtracts no deduction.
- **Two longhand copies of the survivor rule remain** on the Roth tab, outside this scope. They behave identically
  today; they are the same duplicate-copy shape that produced this release's bonus defect and are recorded, not fixed.
- The sale gross-up sites are reachable only when a **state** bill funds the sale while the federal deduction is
  unused; `t41` D-4/D-5 pin that case and control `M6` proves nothing else covers those four sites.

### Found while building, and worth recording

- **`t41` was written, green, and never ran.** A suite file that is not listed in `qa/runsuite.sh` executes nowhere and
  nothing fails; the first full pass reported 4,320 green with 39 checks that had not run. Caught by reading the
  per-suite breakdown for a `t41` line. The runner now carries the warning beside the entry.
- **The test shim is shared by every leg.** Exporting the newly hoisted function unconditionally was a `ReferenceError`
  at module load on the v5.74 leg and killed four suites there. It was invisible in the working run folder, whose prior
  leg still held bundles built before the edit, and was caught only by the run from the **packaged** copies. The export
  is now guarded, and `t41` asserts its absence on the prior leg.
- **The scope's own example-household sentence was off by a year** (the survivor is 79 in the first single-filing year,
  not at the death); corrected in the shipped scope. Its conclusion was unaffected.
- `t24`'s pinned figures appeared to move and had not: its version gate is a ternary, the shape a version-roll sweep
  keeps missing. `t16`'s structural check needed its search region widened to follow the hoisted code rather than its
  expected count lowered.
- The boundary census (`t29`) gains the two conditions the example data hides, and reports them for that household:
  survivor already 79 at the first single-filing year, and ordinary income ($4,800) below the deduction ($32,200) but
  preferential income never above the 0% top ($98,900) — both halves are required, which is why this was $0 there.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` (2026-09-28); v5.59 and earlier in
`docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
