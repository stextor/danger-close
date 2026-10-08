# SCOPE — D-12 · Account type and per-person retirement income (three releases: v5.91, v5.93, v5.95)

**FULFILLED — all three phases shipped: v5.91, v5.93, v5.95 (2026-10-07).** Retired to repo-only at the v5.95 ship (OPERATIONS §G); residuals re-homed to MissingFeatures D-12, D-27, D-28. §11 is Phase 3's build record.

*(Superseded status line, retained:)* **PHASE 3 (v5.95) IN BUILD — §10 is its scope, READY 2026-10-07.** **PHASE 2 SHIPPED as v5.93; D-26 SHIPPED as v5.94 (2026-10-06); Phase 3 (v5.95) open.** ⚠ **For Phase 3: P2-6 is superseded** (`docs/SCOPE_D26_STATE_TAX_DRAW.md` D26-2) — from v5.94 the draw is INSIDE `attributeRetIncome`'s ira / employer / annuity figures, and `byPerson.draw` is an of-which breakdown of the same dollars: a rule that adds it double-counts.

*(Superseded status line, retained:)* **PHASE 2 SHIPPED as v5.93 (2026-10-06); Phase 3 (v5.95) open.** Stays in the pool while active (OPERATIONS §G). §8 is the Phase 1 build record, §9 Phase 2's. **Renumbered at the v5.93 build:** there is no v5.92 (P2-9), and the spending-draw fix (MissingFeatures D-26) ships as v5.94 between Phases 2 and 3. Where this document says v5.92 read **v5.93**; where it says v5.93 for Phase 3 read **v5.95**.

*(Superseded status line, retained:)* **PHASE 1 SHIPPED as v5.91 (2026-10-06); Phases 2 and 3 open.** Stays in the pool while active (OPERATIONS §G). §8 is the Phase 1 build record.

*(Superseded status line, retained:)* **READY — 2026-10-02.** Written against v5.90 (freshness: repo `df34f03`; all 119 pool files match committed content; source
`653fff47f0f7665bb4d07a74bdf3d109`). Under Steve's standing instruction (2026-10-02) every decision below carries a recommendation that
the build takes and records. **Stop only for a decision with no recommendation**, or where §5's stop conditions fire.

## 0 · Why this, why now

`MissingFeatures.md` lists sixteen open items. D-12 is chosen because:

- **It hides a live optimistic error.** Rhode Island's modification (§44-30-12(c)(9)) covers pensions and 401(k)/403(b)/457/TSP and
  **no IRA**. The model cannot tell an IRA from a 401(k), so an $80,000 IRA-only couple is **under-taxed $4,000/yr**. D-12's entry
  also prices two per-person errors: $2,000/yr where a $90,000 pension is one spouse's, and $2,500/yr where only the spouse under
  full retirement age holds 401(k) income.
- **It retires conservative stand-ins added this session:**
  - D-24's both-spouses rule (IA, PA, MS);
  - D-24's "pensions in payment pass" rule (PA, MS);
  - D-21's household-level split of taxable Social Security (WV).
- **The alternative, D-22** (re-read 42 state rates), has two known stale rates (GA, OK) that both make the model **too
  pessimistic**. That is important but not urgent; see §6.

**Product boundary:** it passes. A mainstream couple holds both IRAs and 401(k)s, and the feature makes existing state-tax output
more correct.

## 1 · What the model holds today (census at scope time; re-run at each build)

- **`OTHER_TAX_TYPES`** = taxable, trad, roth, hsa, annuity. IRA, rollover IRA, 401(k), 403(b), 457, SEP and SIMPLE are all `trad`.
- **Positions** carry `owner` and `taxType` (about 25 / 28 AST sites), but **no plan type**.
- **The pension** is one household input (`pension:` at five sites) **with no owner**.
- **`stateTaxAnnual`** receives household totals (`retIncome`, `pen`), plus per-person gross SS and ages.
- **Saved data:** `window.storage` keys `portfolio`, `expenses`, `prompt` (L3798–3820). No explicit schema-version constant was
  found under the usual names; **find how old backups are recognised before Phase 1 writes anything** (§5).
- **Suites guarding saved data:** `t5_storage`, `t37_mydata_draft`, `t38_import_hardening`.

## 2 · The three releases

### Phase 1 — v5.91 · collect it (data model; no tax result moves)

- **`planType` on every `trad` position: `"ira"` | `"employer"`.** *Recommendation:* exactly two values, labelled "IRA (incl. rollover,
  SEP, SIMPLE)" and "Employer plan (401(k), 403(b), 457, TSP)". SEP and SIMPLE are IRAs in law. A pension is its own input.
- **Default for every existing and new `trad` position: `"ira"`.** *Recommendation and rationale:* it is the conservative choice in every
  state that distinguishes them. RI excludes IRAs; PA and MS gate IRAs at 59½ but employer plans at the plan's own age. A user who
  holds a 401(k) changes it.
- **Pension owner: `"A"` | `"B"`, default `"A"`.** *Recommendation:* concentrating the pension on one person makes per-person caps bind
  sooner, which is conservative. Single filers: A only.
- **Saved data:**
  - old backups, drafts and imports without the fields load with the defaults;
  - export writes the fields;
  - a round-trip is byte-stable after the first save;
  - `t38`'s hardening extends to the new fields: unknown value → default, never a throw.
- **UI:** a plan-type selector beside each traditional position on My Data, and a pension-owner selector.
  - Each says what it is used for, and that it is collected now and used from v5.93. Disclosed, not silent.
  - Sentence-case labels.
- **Tests:** a new suite with migration from a v5.90 backup, the defaults, the round-trip, and malformed values. The engines'
  outputs are unchanged bit-for-bit: the whole suite stays at its v5.90 figures plus the new suite.

### Phase 2 — v5.92 · carry it (engines; federal results unchanged, state results unchanged)

- Each engine passes `stateTaxAnnual` **per-person, per-plan-type** retirement income: withdrawals and conversions by owner ×
  plan type, plus the pension by owner. The household totals stay as the fallback path.
- **How a withdrawal is attributed** (census first): if an engine draws from named positions, use them. If it draws from pooled `trad`
  dollars, attribute pro rata by each position's balance at the start of the year. *Recommendation:* pro rata, disclosed as the
  approximation it is.
- **No state rule uses the new inputs yet**, so every state result, and MC parity, must be unchanged to the dollar. A new suite proves
  the attribution sums back to the household totals in every engine.

### Phase 3 — v5.93 · use it (modelling; METHODOLOGY updates; each state's law re-read at the build)

- **RI:** IRAs excluded; the modification capped at each person's own qualifying income; only a spouse at FRA counts.
- **IA, PA, MS:** per person, replacing D-24's both-spouses rule. PA and MS employer plans exempt at any age (the plan's own
  conditions are not modelled; *recommendation:* treat an employer plan as meeting them, disclosed), and IRAs from 59½ (60).
- **WV:** the senior modification is capped at "gross income received by that person" (D-21's unmodelled cap).
- **Not in this phase:** WV's public-pension offsets need a public/private flag, a fourth value that no other state needs yet.
  *Recommendation:* leave it disclosed.
- Each state gets hand-computed per-person cases; the existing `t50`–`t55` assertions that encoded the interim rules change by design,
  each named in the CHANGELOG.

## 10 · Phase 3 at the build (v5.95, 2026-10-07) — READY

Written before any Phase 3 rule is coded. Freshness: repo `0f28967`; v5.94 source `47090df091940165dc32356b56ada760` = pool = manifest =
CHANGELOG newest; built `b3d8b7ead5553ac97036e80e7a820dc1`; all 123 pool files match committed content.

### 10.1 · Law, re-read at primary sources
- **RI** (§44-30-12(c)(9); Division of Taxation PUB 2026-01 and ADV 2025-22): pensions, annuities, 401(k), 403(b), 457(b), TSP qualify;
  **no IRA does** (SEP and SIMPLE included). $50,000 **per individual**, capped at that person's own qualifying income; full retirement age
  **per spouse**, only that spouse's own income counts. ⚠ The guide gives the TY2025 joint AGI limit as $133,500; the advisory's
  "for the 2025 Tax Year" table gives **$133,750**, which the model carries and cites. The advisory sets the figures: **no change**.
- **IA** (Department of Revenue guidance): 55+ on 31 December, **per spouse**; covers IRAs, employer plans, pensions, annuities alike.
  Survivor-of-a-qualifier path not modelled (disclosed).
- **PA** (REV-636): IRAs exempt from 59½ with no early exceptions; employer plans under the plan's own conditions (D12-E: treated as met).
- **MS** (35 Miss. Admin. Code Pt. III, Subpt. 02, Ch. 07, R. 100–104; DOR FAQ): pensions, annuities from plans, IRAs exempt; early
  distributions do not qualify (R. 104) → PA's structure.
- **WV** (§11-21-12(c)(9), read via the legislature's bill texts; numbering per the Tax Department): $8,000 "received ... by any person"
  65+, limited to $8,000 minus that person's other modifications (the (c)(8) SS modification included) → per person, own income.

### 10.2 · Census (v5.94, AST)
- `byPerson` = `{ A: {ira, employer, annuity, pension}, B: {...}, draw: {A, B} }`; the draw is inside ira/employer/annuity (D26-2).
- Wages, other ordinary income, dividends and capital gains have **no owner** anywhere in the model.
- ⚠ **SURVIVOR SLOT (pre-existing defect, found at this build).** In single mode the calculator reads spouse A's slot only. Engine B
  files single after a death but kept passing `ageA = yr − dobA`, so **when B survived, every state age test used the decedent's age**;
  and it kept the larger benefit in whichever slot held it, so the survivor's gross SS could read $0. Engine A never files single after a
  death (`single: !!P.single`) — its per-person slots stay right, but the survivor keeps joint state thresholds.

### 10.3 · Decisions
| ID | Decision | Taken |
|---|---|---|
| P3-S | The survivor slot | **Steve, 2026-10-07: fixed in this release (option 1).** The calculator moves B into A's slot when a single return blanks A's age; Engine B blanks the decedent's age and puts the survivor's benefit in the survivor's slot, in single-filing survivor years, for the state call only. |
| P3-1 | A couple with a pension each | **Steve, 2026-10-07:** one household pension, one owner, disclosed. |
| P3-2 | Reach of the per-person exemption path | Only rules with `retExemptAge` (IA, PA, MS), and only when `byPerson` is passed; Michigan and other exempt states unchanged. |
| P3-3 | PA, MS plan types | Employer plans and pensions exempt at any age (D12-E); IRAs and the annuity category per owner from 60 (59½ in whole years). |
| P3-4 | The annuity category in PA/MS | Today's treatment, per person. Whether PA taxes commercial-annuity earnings is filed as a new MissingFeatures item. |
| P3-5 | RI | Per person at 67: `min(band amount, own employer + annuity + pension)`; IRA income stays taxable; the AGI cliff unchanged. |
| P3-6 | WV | Per person: `max(0, min(8,000 − taxable SS_p, retirement income_p))`; unattributed income (wages, investment) excluded — the cap binds sooner, pessimistic, disclosed. |
| P3-7 | Callers without `byPerson` | The v5.94 household path, unchanged (every direct `stateTaxAnnual` call in the suites). |
| P3-8 | Engine A's joint filing after a death | Not fixed here; filed as a new MissingFeatures item. |

### 10.4 · Measured before the rules (survivor slot alone, Engine B, v5.94 vs v5.94 + P3-S)
- Example household (B survives from 2044), 51 jurisdictions: **nothing moves** — both spouses are past every floor by then.
- H1 (A dies 2027; B survives at 62; $50,000 pension): **15 of 51 rise**, survivor years only, none fall; GA +$7,785 = 3 × $50,000 × 5.19 %
  (hand-checked), RI +$12,500 = 5 × $50,000 × 5 %. GA's unmodelled 62–64 tier is already disclosed in its note.
- H2 (B, the larger benefit, dies 2030; A survives): MD +$67,320, ME +$48,409 over 25 years — the offset now sees the survivor's benefit.
- Both: federal tax and every non-state row field byte-identical; no move in any non-widowed year; Engines C and D identical.

### 10.5 · Tests and stop conditions
New suite `t59` (both legs; the v5.94 leg pins the defects): per-state hand cases for RI, IA, PA, MS, WV, per person and per plan type;
the survivor slot (H1, H2) to the dollar; `byPerson`-absent calls byte-identical to v5.94; AST guards. `t50`–`t55` assertions that
encoded the interim rules change by design, each named in the CHANGELOG. Controls `qa/tools/controls_v595_per_person.py`.
**Stop:** any federal figure moves; Engines C/D move; MC parity is not 10/10; a non-widowed-year figure moves in a state outside the five;
any state figure falls in a case where the fix can only remove an exclusion.

## 3 · Out of scope

- A public/private pension flag.
- Inherited IRAs and their rules.
- 457(b)'s penalty exception.
- Roth subtypes.
- Per-person Social Security changes (already per person).

## 4 · Decisions (all with recommendations — the build takes them)

| # | Decision | Recommendation |
|---|---|---|
| D12-A | Plan types | Two: `ira`, `employer` |
| D12-B | Default for existing positions | `ira` (conservative everywhere it matters) |
| D12-C | Pension owner default | `A` |
| D12-D | Attribution when engines pool `trad` dollars | Pro rata by balance at the start of the year, disclosed |
| D12-E | PA/MS employer plans' own conditions | Treated as met, disclosed |
| D12-F | Release split | Three releases as above; Phase 1 ships with the fields collected but unused, said so in-app |

## 5 · Stop conditions (these still stop a build, standing instruction or not)

- **Saved-data safety:** if the build cannot find how old backups are recognised and upgraded, **stop and report** before Phase 1 writes a
  field. A migration that mis-reads a user's backup is the one failure this project cannot test its way out of afterwards.
- **Any change to a v5.90 tax result in Phase 1 or 2**, beyond the new suite's own checks.
- **An engine whose withdrawals cannot be attributed at all.** Report it, with pro rata as the proposed fallback.

## 6 · After D-12

**D-22** (state rates). *Recommendation:* start with Georgia (4.99 %, HB 463) and Oklahoma (4.5 %, HB 2764), each read at a primary
source, then the other forty in batches by region, each rate dated as the dollar figures are.

## 7 · Status

READY. Destination: repo `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` and the pool while active (it travels in the v5.91 package); it retires
to repo-only when v5.93 ships.

## 8 · Build record — Phase 1 (v5.91, 2026-10-06)

- **Freshness:** repo `df34f03`; v5.90 source `653fff47…` matched manifest and CHANGELOG; all 119 pool files matched committed content.
- **§5 stop condition answered:** backups carry a fixed envelope (`app`, `version: 5`) and are upgraded by field presence in
  `applyLoadedDataUnchecked`; all eight load paths reach it through `applyLoadedData` (AST census). The condition did not fire.
- **Premise corrected (§1):** holdings do not carry `taxType`; they carry `trad`/`roth` dollar fields (a Mixed row holds both). Only Other
  accounts carry `taxType`. Recommendation taken: the field lives on holdings with Traditional dollars and on Traditional Other accounts.
- **Decisions taken on recommendation** (standing instruction): D12-A, D12-B, D12-C as written; no name inference; envelope stays `version: 5`;
  explicit values in the example literal and Guided Setup; selector values `ira`/`employer` (no overlap with existing selector filters); no
  new table column; no pension-owner control for a single household (changed from fixed text during the build).
- **Measured before the test was written:** v5.90's own load→save cycle is byte-identical from the first save, so `t56` asserts save 1 ≡ save 2 raw.
- **Source** `bdeb550dc23a20d0b2c156ac1dd533fb` (33 anchors, each once); **built** `ed695a74ed0350f4846b957a09239561` (v5.90 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **`t56`** 48 on v590 / 50 on v591; its v5.91 assertions fail 23 of 50 on v5.90. **Controls 7 of 7** (C1's witnesses corrected to R-8/R-9).
- **Suite:** 5,054 app checks, 55 suites, 0 failed, 0 DIED; GRAND 5,184. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v590 v591 from a fresh clone of df34f03 with the github/ files overlaid, each running the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). Half A GRAND 4962, half B GRAND 222; none DIED; identical suite by suite to the workspace run.
- **Found for Phase 3:** the pension is one household amount with one owner; a couple with a pension each cannot record the split.
- **`package_check` I-2:** this scope is held on the OPEN allowlist in `qa/tools/package_check.mjs` until v5.93; remove it in the package that marks the scope FULFILLED.

## 9 · Build record — Phase 2 (v5.93, 2026-10-06)

- **Freshness:** repo `40681d5`; v5.91 source `bdeb550d…` matched manifest and CHANGELOG; all 121 pool files matched committed content. The v5.91
  post-upload `package_check` closed at 50/0/1 (G-1 skipped: no run folder) after a shallow-clone false red on K-5b — fixed in this release.
- **Premise corrected (§2):** "each engine" — only Engines A (`runRothStrategies`, two call sites) and B (`computeTaxPlan`, one) compute state
  tax; C and D have no state identifiers. §5's third stop condition did not fire: both keep per-person Traditional legs.
- **F-3 confirmed by source:** each person's Traditional money is one leg with one growth rate, so pro rata by start-of-year balance reduces to a
  share fixed at retirement start — the `annShare` idiom already in `retireStartBalances`.
- **Decisions taken on recommendation:** P2-1 one optional `byPerson` argument, ignored; P2-2 `empShareA/B` beside `annShare`; P2-3 inherited
  employer dollars become the survivor's IRA dollars; P2-4 QCDs from IRA first; P2-5 annuity a third category; P2-6 the draw attributed, kept out
  of the household totals; P2-7 bonus deferral + match are employer, monthly pre-tax contributions IRA; P2-8 the pension to the survivor after a
  death; **P2-9 no v5.92** (the tag `v592` is the retired v5.9.2 leg's, gated in `t1`/`t4`/`t5`/`t6`); P2-10 METHODOLOGY unchanged.
- **Steve's decision (2026-10-06):** the spending-draw omission found here (D-26, measured in both engines) is fixed in its own release between
  Phases 2 and 3 — now v5.94, with Phase 3 at v5.95.
- **Equivalence before tests:** every engine output (A, B with and without conversions and QCDs, C, D) on 23 households, v5.91 vs v5.93 — 161 of 161
  byte-identical.
- **Source** `e60a09711b5c1451d144a208bd82991b` (33 anchors, each once; Engine B's two shared-with-C anchors scoped to `computeTaxPlan`); **built** `b7ebd28e9f0d1abf063068dd438a35e1` (v5.91 rebuilt
  byte-identical first; `smoke_built` 22 passed, 0 failed).
- **`t57`** 34, current leg only. **Controls 12 of 12** — three of them first exposed blind spots in `t57` (K8, K9, and the per-strategy C7b),
  each fixed and re-proved.
- **Suite:** 5,090 app checks, 56 suites, 0 failed, 0 DIED; GRAND 5,220; every current-leg count equals v5.91's but `t57`. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v591 v593 from a full clone of 40681d5 with the github/ files overlaid (v5.91 resolved from history, commit 54764c5), each running the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). Half A GRAND 4998, half B GRAND 222; none DIED.
- **Open for Phase 3:** a couple with a pension each (one household amount, one owner); and §2's state rules, each re-read at the build.
- **`package_check` I-2:** this scope stays on the OPEN allowlist until **v5.95**; remove it in the package that marks the scope FULFILLED.

## 11 · Build record — Phase 3 (v5.95, 2026-10-07)

- **Law** re-read for all five states (§10.1); the RI guide/advisory conflict recorded, no change. **Survivor slot** found, decided (Steve, option 1),
  measured on two stress households through the app's load path (§10.4), then built with the rules.
- **Source** `b8f7039c0720248edf0aa0b8fc72c71d` (24 anchors, each once on v5.94); **built** `7d27099415c9dcccdf0b1a04dc176b19` (`smoke_built` 22 passed, 0 failed). Hand cases 7 of 7.
- **`t59`** 23 (v5.95) / 19 (v5.94). **Controls 11 of 11.** Gated inversions in `t35`, `t52`, `t56`, `t57`, `t58`; `t8`'s gross-SS check made semantic (CHANGELOG).
- **Suite:** 5,189 app checks, 58 suites, 0 failed, 0 DIED; GRAND 5,319. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v594 v595 from a full clone of 0f28967 with the github/ files overlaid (v5.94 resolved from history), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5097, half B GRAND 222; none DIED.
- **Stop conditions:** none fired — federal and Engines C/D unchanged; MC parity 10/10; on the example household only RI moves, all up.
