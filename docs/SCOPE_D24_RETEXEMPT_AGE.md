# SCOPE — D-24 · "Retirement income exempt" states: the law's age gates, and Michigan's cap (v5.90)

**FULFILLED — shipped as v5.90 (2026-10-02).** Retired to repo-only at the ship (OPERATIONS §G). §6 is the build record.

*(Superseded status line, retained:)* **READY — 2026-10-02.** Under Steve's standing instruction (2026-10-02), every decision below carries a recommendation, and the build
takes the recommendation and records it here and in the CHANGELOG. **Stop only for a decision with no recommendation.** This is a
**MODELLING** release; METHODOLOGY updates with it.

## 0 · Premise (verified against v5.89, not assumed)

**Freshness (OPERATIONS §A).** Repo `db860f2`. All 118 pool files match committed content. Source `abf14500169ac6a6793607fdda82a688`
= pool = manifest = CHANGELOG newest.

**The model.** `stateTaxAnnual` computes `retBase = r.retExempt ? 0 : Math.max(0, retIncome + pen - exclFinal)` (L1522). There is no
age test and no cap, so every `retExempt` row exempts retirement-account income **and** pensions at any age and any amount.

- **Fourteen rows** carry `retExempt`. **Nine have no income tax** (rate 0: AK FL NV NH SD TN TX WA WY), so a gate cannot matter there.
- **Five tax:** IL 4.95 %, IA 3.8 %, MI 4.25 %, MS 4 %, PA 3.07 %.
- **Ages** reach the function as whole years (`yr − dobYr`): the age attained by 31 December.

**The law** (Iowa and Pennsylvania read 2026-10-01; the others 2026-10-02):

| State | Law | Model today | Direction |
|---|---|---|---|
| IA | 55 or older on 31 Dec (or disabled, or a qualifying survivor), per spouse — Iowa DOR | any age | **optimistic** under 55 |
| PA | IRA distributions from 59½; employer-plan payments once the plan's age or service is met — DOR rev-636, PA-40 instructions | any age | **optimistic** under 59½ |
| MS | "Early distributions from retirement plans do not qualify for this exemption" — MS DOR regulation, Ch. 07 ¶104 (quoted verbatim in a secondary source; read the regulation itself at the build); IRAs effectively from 59½, plans once their conditions are met | any age | **optimistic** for early distributions |
| MI | From TY2026 **no birth-year or age test**, but the deduction is **capped** at the inflation-adjusted private-retirement maximum, about $65–68K single and twice that joint (secondary figures; read Treasury RAB 2026-1 at the build) | unlimited | **optimistic** above the cap |
| IL | Qualified-plan and IRA distributions subtracted, early ones included (secondary, consistent across sources; confirm in Illinois's own instructions at the build) | any age, unlimited | expected: **no change** |

Measured at v5.87: a 50-year-old with $50,000 of IRA income paid $0 in Iowa or Pennsylvania. At the model's own rates the law gives
$1,900 (IA) and $1,535 (PA).

## 1 · Change (each item records its decision)

1. **Age gate on exempt rows: a new field `retExemptAge`.**
   - IA **55**: the age attained by 31 Dec, which matches the law exactly.
   - PA **60** and MS **60**: 59½ expressed in whole years. That is conservative: in the calendar year someone turns 59, they may
     already be 59½ for part of it. *(D24-B)*
2. **Who it applies to without per-person income (D-12): D24-A.** Single filer: their own age. Joint filers: exempt when **both** meet
   the age; when only one does, **none** of the household's retirement income is exempt. That is conservative, and it is disclosed:
   it over-taxes a couple where the older spouse owns the IRA.
   - *Alternative not taken:* exempt half when one spouse qualifies. That can be optimistic when the younger spouse owns the account.
   - The exact answer needs per-person retirement income, which is D-12.
3. **Pensions versus account withdrawals: D24-C.** The function receives `pen` separately from `retIncome` (withdrawals and
   conversions).
   - PA and MS: gate **only `retIncome`**. A pension already in payment has generally met its plan's conditions, which is exactly the
     law's test for employer plans.
   - IA: gate **both**, because Iowa's 55 applies to all retirement income.
   - Roth conversions are gated as distributions, which is conservative and consistent with Mississippi's distribution-code rule.
4. **Michigan's cap: D24-D.** MI moves from unlimited to a deduction capped at the TY2026 maximum read from Treasury (single / joint,
   household-level, as the law's figures are per return). If RAB 2026-1 confirms an early-distribution rule, MI also gets a
   `retExemptAge` as PA. **If the RAB cannot be read, keep MI unlimited and disclose:** a cap from secondary figures would be a guess.
5. **Illinois:** confirm no age test; expected no change. If Illinois's own instructions show a gate, apply it as above.
6. **Oklahoma (carried from D-24's entry):** re-read 68 O.S. §2358.
   - If the statute sets no age test for private retirement income, change OK's `exclAge` to 0, which is correct and more generous.
   - If it sets 65, keep 65.
   - If it is unsettled, keep 65 (conservative) and say so in the note.
7. **Notes, summary and dependent suites:**
   - IA, PA and MS notes say the modelled age and the joint rule. MI's note states its cap.
   - My Data's summary shows "retirement income exempt from 55" for gated rows, which is the D-25 consistency.
   - `t52`'s `MODEL_AGE` learns `retExemptAge`.
   - `t52` M-IA1 and M-PA1 flip **by design**. Their header said they would; rewrite them to the new truth.
   - `t53` X-4 learns the gated wording.
8. Version bump at the four in-app sites.

## 2 · Site census (at build, by parser)

- `retExempt`: L1522 is the only behavioural site, plus the `MyDataEditor` summary branch.
- Every reader of `retExempt` in the suites: `t52` L43, L70–71; `t53` L81; anything the literal census finds.
- **All three `stateTaxAnnual` call sites pass `pen` separately and both ages** (L4552, L4677, L5911; confirmed at v5.89).
- Any suite household in IA, IL, MI, MS or PA whose pinned figures would move: the literal census plus a run of the existing suite
  against the staged source.
- MC parity: confirm its state.

## 3 · Tests

- **New `t55`** (current leg, node, with a DOM read for the summary). Shown failing on v5.89 first.
  - per state, by hand: under and over the gate;
  - single, joint with both spouses over, joint with one over;
  - pension versus withdrawal (PA, MS);
  - Michigan below and above its cap;
  - Illinois unchanged at 50;
  - the nine no-tax rows still $0.
- **Extinction grid:** for every taxing `retExempt` row, the exemption equals the rule computed independently.
- **Controls** (repo-only):
  - each gate removed;
  - the both-spouses rule loosened to either spouse;
  - the pension gated in PA;
  - the Michigan cap removed;
  - a gate moved;
  - the unmutated run.
- Full suite as two concurrent halves.

## 4 · Out of scope

- Per-person retirement income and account type (**D-12**).
- Iowa's disability and survivor paths (no input; conservative).
- Mississippi's $10K / $20K zero-rate band (its flat rate is a separate approximation).
- Michigan's PA 24 of 2025 standard-deduction changes (Social Security, not retirement income).
- Railroad Retirement.

## 5 · Status

READY to build under the standing instruction. Destination: repo `docs/SCOPE_D24_RETEXEMPT_AGE.md` and the pool while active; it
retires to repo-only when v5.90 ships.

## 6 · Build record (v5.90, 2026-10-02)

- **Law read at the build:** Michigan Treasury **RAB 2026-1** (approved 8 Jan 2026), read in full — from TY2026, "regardless of year of birth",
  the deduction runs up to the inflation-adjusted private-retirement maximum, public and private combined; the RAB states the **TY2025**
  figure, $65,897 / $131,794, not TY2026's. Illinois **Publication 120** (tax.illinois.gov): "You may include early distributions from
  qualified plans and IRAs." Oklahoma: OAC 710:50-15-49(d) states no age in its general rule; the statute was not read.
- **Decisions taken on recommendation** (standing instruction): every §1 item as written; Michigan's cap at TY2025 (conservative); no
  Michigan age gate (RAB 2017-21 unread); Oklahoma kept at 65.
- **Source** `653fff47f0f7665bb4d07a74bdf3d109` (11 anchors, each once); **built** `153ad9a2e773c56b5414714bebf9e40a` (v5.89 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Tests changed by design:** `t51`, `t52` (incl. D-2, which the literal census caught and the plan had missed), `t53` — and **`t10` 2E**, which
  only the full run caught: Mississippi with nobody counted 65+ is now taxed on withdrawals. Kept the "any size" intent with a household past
  the gate; the original inputs kept with their v5.90 answer behind a version list (an ungated first attempt failed on v5.89, which `t10`
  also runs — caught before the re-run).
- **`t55`** 27 — v5.89 14 failed, v5.90 27/27. **Controls 8 of 8**; C4's expectation was corrected (the grid reads the row's own pension
  flag, so only hand cases see a row-level change, as C6) and re-confirmed.
- **Suite:** 4,955 app checks, 54 suites, 0 failed, 0 DIED; GRAND 5,085. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87, run folders built by mk_runfolder.sh v589 v590 from a fresh clone of db860f2 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). The first run found one failure, t10 2E on v5.90 (a by-design change; see below); after the fix both halves were re-run in freshly rebuilt folders from the corrected package. Half A GRAND 4863, half B GRAND 222, both exit 0, no suite in both, none DIED.
