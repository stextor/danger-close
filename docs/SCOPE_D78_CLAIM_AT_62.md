# SCOPE — D-78: a claim at 62 starts the month after the 62nd birthday, for most birthdays

| Field | Value |
|---|---|
| Status | **OPEN — awaiting decisions DM-1 to DM-3 (Steve). Not built.** |
| Item | `MissingFeatures.md` **D-78** (filed at v6.47 by its build review) |
| Written against | **v6.48** · source `src/DangerClose.jsx` md5 `9d4df8545dc2ea58a04559b71fa91ee2` · built `index.html` `936186ee3cdee636a4f1c101fa35f8ba` · repo `4e025b4` |
| Build against | the release after v6.49 (the 2027 tax figures), re-measured on that build |
| Date | 2026-11-16 |
| Kind | a MODELING change: every projection that reads a claim date, for a narrow set of plans |

**How this was written.** The law was read at its primary sources on 2026-11-16 (§0.1). The model's behaviour was read from the v6.48 source:
every site count below is a parser count (`qa/tools/census.cjs`, plus two acorn walks written for this scope, §3), never a grep. **No engine
was run and no figure was measured.** The sizes in §0.4 follow from the rules and are to be measured at the build, on the build's source.

---

## §0 · Premise

### 0.1 The law

- **POMS RS 00201.001 §C** (*Retirement Benefits — Entitlement Requirements*, TN 9 (04-26)): a person born on the 1st or 2nd of a month can be
  entitled for the month of their 62nd birthday; birth on any other day precludes that month, *"since the individual would not be age 62 for
  that entire month."* It applies to retirement claimants who attain 62 after August 1981.
- **POMS RS 00202.010** (*Throughout the Month Requirement*): the same rule for a spouse's benefits — §B.3 *"An individual born on the first or
  second day of the month can be entitled to benefits for the month of their 62nd birthday … Birth on any other day of the month precludes
  entitlement"*; §C.1 the young spouse attaining 62; §A.2 it applies to every spouse claimant except one who reaches full retirement age in or
  before the first month of entitlement.
- **20 CFR 404.311(a)**: at full retirement age or later, entitlement begins with the first month covered by the application in which the person
  meets all requirements; between 62 and full retirement age, the first month **throughout which** they meet them.
- **SSR 83-42a**: the "throughout" rule is section 202(a) of the Act as amended by P.L. 97-35, for claimants who attain 62 after August 1981.

So, for a claim at **62**:

| Date of birth (day of month) | First month a claim at 62 can be paid |
|---|---|
| 1st or 2nd | the birth month |
| 3rd to 31st | the month after the birth month (a December birthday: January of the next year) |

The rule binds only a claim at 62. A claim at 63 to 70 already meets the age requirement throughout the birth month, so this rule does not move it
(what a birthday on the 1st does at those ages is DM-2).

### 0.2 The model (v6.48)

- **Every claim date is built at one place**, `buildPlanTimeline` L940–941: `{ year: dob.year + claimAge, month: dob.month }` — the birth month at
  every claim age; the day is not read.
- The date of birth **carries a day**: the parser `_ymd` (L916) keeps it, defaulting to 1 when a stored date has none; the placeholder dates are the
  1st (L921, L925).
- **The model is inconsistent with itself here.** The spousal module's full-retirement-age month already applies SSA's day rule — `_ssFraYm`
  (L14206): *"`dob.day === 1 ? m - 1 : m`"* (a birthday on the 1st reaches 67 the month before). The claim month at 62 applies none.

**So for a claim at 62 by a spouse born on the 3rd or later, every projection pays from one month too early** — the own benefit, and from v6.47 a
spousal top-up that starts with it (`spousalTopUp` reads the claim dates, L14235). Optimistic.

### 0.3 Who it reaches

Any plan in which a spouse's planned claim age is 62 and their date of birth is on the 3rd or later. **Invisible on the example twice over:** both
dates of birth are the 1st (L620), and neither spouse claims at 62 (spouse A 67, spouse B 63; L671). So the boundary census needs a row for it
(OPERATIONS §K1), and the suite needs fixtures built to reach it.

### 0.4 Size (by rule; to be measured at the build)

- **Monthly readers** (Engines A, B and D, the Roth ladder, the Monte Carlo's quarter share, the Income and Social Security tabs, What Breaks):
  one month of the at-62 benefit per affected spouse, once — for a $1,300 benefit, $1,300 in the claim year (with the top-up's month where one starts
  with it).
- **Whole-year readers** (Engine C, L6294; Backtest, L12989) take the claim year only, so they move only for a **December** birthday, where the claim
  moves into the next calendar year — a full year of benefit.
- **Direction:** the fix lowers income, the conservative direction; today the model is optimistic.

---

## §1 · The amount, and why DM-1 exists

The rule above moves the **month**. It also changes how many months early the claim is, and the reduction depends on that:

- For a birthday on the 2nd, the first payable month at 62 is 60 months before full retirement age (67), so the reduction is 60 months
  (own benefit 70% of the benefit at 67; spousal 32.5% of the worker's).
- For a birthday on the 3rd or later, it is the month after the birth month: **59 months** early (own 70.42%; spousal 32.71%). For a birthday on
  the 1st, SSA counts from the month before, which also makes the birth month 59 months early.
  *(The rates are the ones the model and `qa/tools/spousal_oracle.mjs` already use: 5/9 % and 5/12 % a month on an own benefit, 25/36 % and 5/12 % on a
  spouse's. The 59-month figures are derived from those rates and the POMS rules above, not read from an SSA calculator.)*

The model holds a benefit at 62 two ways: the figure the plan entered (an SSA statement's age-62 amount), or the Social Security tab's table, which
counts 62 as 60 months early (`t111` pins the spousal 32.5% at 62). Moving the month without recounting the months leaves those figures up to
0.42% of the benefit at 67 low (0.21% on a spousal top-up) for these claimants — small, and in the conservative direction.

---

## §2 · Design (for DM-1 (a), DM-2 (a))

1. **One helper** builds a claim date from a date of birth and a claim age: at 62 with a day of 3 or more, the month after the birth month (December
   → January of the next year); otherwise the birth month, as now. `buildPlanTimeline` L940–941 call it.
2. **The Social Security tab's own claim months use it too**, or the tab and the engines disagree at 62: the explorer's `claimMonth` (L9680),
   spouse B's `_bClaimMonth` (L9753) and `spousalTopUpAtAges` (L14245), each built today from the birth month.
3. **No claim age is derived as a year difference.** Five sites compute it as claim year − birth year (§3.2); with a December roll they would read
   63. The timeline carries no claim age today (its return, L963–975), so the build adds `ssA_age` / `ssB_age` to it and the five sites read those.
4. **Every other reader moves with the date and is not edited** (§3.1). The build re-reads each against the new date, December included.

---

## §3 · Census (parser)

### 3.1 Readers of the claim dates

`census.cjs` on v6.48: **`ssA_date` 47 AST hits at 46 source sites; `ssB_date` 39 at 38.** Built only at L940–941. Read by:

| Area | Sites |
|---|---|
| The timeline itself | L956–957 (the Monte Carlo's claim quarters, `mcQuarterOf`), L969 (returned) |
| Retirement options | L1115 (the gap before spouse A's claim) |
| Events | L2653–2654 (claim events), L2694–2695 (HSA events), L2784–2785 (claimed yet) |
| Monte Carlo | L3244, L3246, L3305, L3307 (`runMonteCarlo`), L3426, L3428, L3530, L3531 (`runExtendedMC`) — `mcPaidShare` from the claim month |
| Engine C | L6294 — **year only** |
| Engine D | L6564–6567 — year and month |
| Engine B | L7229–7230 — year and month |
| Engine A's three builders | L7757–7758, L11906–11907, L12056–12057 — year and month |
| Ask AI | L8125–8126 (the claim starts it states) |
| Exit Plan | L8704–8705 (claim age — §3.2), L8731, L8801–8802 (dates shown) |
| Income tab | L9208, L9218, L9309–9310, L9359, L9415, L9527 |
| Social Security tab | L10096 (the gap months), L10123, L10228–10229 (claim ages — §3.2), L10362 |
| Roth ladder | L11388–11389, L11395–11396 |
| Backtest | L12989 — **year only** |
| What Breaks | L13229–13230 — year and month |
| Spousal benefit | L14235 (`spousalTopUp`: both spouses' claim months) |

### 3.2 Claim ages derived as a year difference (an acorn walk for `X.ss?_date.year − Y.dob?.year`)

**Five:** L8704, L8705 (Exit Plan), L10123 (spouse B's block), L10228, L10229 (the two-spouse block) — all three on the Social Security tab. Each would read 63 for a December
birthday claiming at 62 once the date rolls (§2.3).

### 3.3 Claim months built from a date of birth outside the timeline (`census.cjs month --kind=prop`, read by hand)

L9680 (`claimMonth = _tlSS.dobA.month`), L9753 (`_bClaimMonth`), L14245 (`spousalTopUpAtAges`) — §2.2. The other `dob.month` reads are Medicare,
the HSA events, the SSA earnings-record reminder (L2788), full-retirement-age labels (L9777, L10084–10085) and `_ssFraYm` (L14206), none a claim month.

---

## §4 · Tests

A new suite (`t113`, both legs; the prior leg pins the defect as a dated `[KNOWN DEFECT …, D-78 — flips at vX.YY]`):

- **§A source, by AST:** the claim dates are built only by the helper; no claim month is built from a birth month elsewhere (§3.3's three sites call
  it); no claim age is a year difference (§3.2); the helper's day rule appears once.
- **§B the helper against an oracle written in the suite from the POMS rules:** every day 1–31 and a date without a day, every month, ages 62–70.
- **§C twin plans:** the same plan born on the 2nd and on the 3rd of a month, claiming at 62 — every monthly projection differs by exactly one month
  of the benefit (and the top-up starting with it) in the claim year and by nothing after; Engine C and Backtest identical. A December twin: the
  claim in January of the next year, Engine C and Backtest moving a year, every claim age shown reading 62.
- **§D bit-identity:** the example and every fixture household that does not claim at 62 on a 3rd-or-later birthday identical to the prior build
  in every engine and on every rendered tab.
- **§E rendered:** the Social Security tab (cards, explorer at 62, spouse B's grid), the Income tab's claim dates, the Exit Plan, Ask AI's claim starts.
- **§F copy:** the Field Manual and METHODOLOGY say the rule.
- **Census row** `ss_claim_62_day` in `qa/tools/boundaries.mjs` (ON when a spouse claims at 62 on a birthday of the 3rd or later): the example
  clear; `t29` gains its B and C rows.
- **Negative controls** for each group; and the re-gates the build's own census finds — any suite fixture with a 62 claim on a 3rd-or-later birthday
  (a text search on v6.48 finds `plannedAge: 62` in `t29`, `t38`, `t43`, `t102`, `t110` and `t111` — a lead, not a census; whether those fixtures' dates of birth reach the rule is the build's first measurement, by parser).

---

## §5 · Out of scope

- **A birthday on the 1st at 63–70** (DM-2) and full retirement ages below 67 for a 1 January 1960 birthday (disclosed since v6.47: *"full
  retirement ages below 67"* are not modelled).
- **Medicare's start for a birthday on the 1st** — a lead, not read here: Medicare starts in the birth month at 65 (L942–943), and for a birthday on the
  1st it may start the month before. **Not checked at a primary source; not filed.** Read it before filing anything.
- The earnings test, disability and survivor benefits at 60, as before.

---

## §6 · Decisions for Steve

| # | Question | Options | Recommendation |
|---|---|---|---|
| **DM-1** | What moves for a claim at 62 on a 3rd-or-later birthday | **(a)** the month only; the benefit the plan holds is unchanged (conservative by up to 0.42% of the benefit at 67) · **(b)** the month, and the reduction counted at 59 months in the tab's table and the spousal rule (exact; touches `genSSTable`'s use, `spousalTopUpFor`, and the `t110`/`t111` oracles) | **(a)** — the smaller change, in the conservative direction, and one rule to test |
| **DM-2** | A birthday on the 1st, claiming at 63–70 | **(a)** leave it in the birth month (one month later than SSA's earliest — conservative; not D-78's defect) · **(b)** the month before, matching SSA's convention and `_ssFraYm` | **(a)** |
| **DM-3** | When | **(a)** its own release after v6.49 · (b) fold it into v6.49 | **(a)** — v6.49 is the tax figures, and a modelling change should not ride on them |

---

## §7 · Record

- 2026-11-16: written (ops package of that date). Sources read that day: POMS RS 00201.001, RS 00202.010, 20 CFR 404.311, SSR 83-42a. Census by
  `qa/tools/census.cjs` and two acorn walks (claim-age year differences; claim months built from a birth month). No engine run.
