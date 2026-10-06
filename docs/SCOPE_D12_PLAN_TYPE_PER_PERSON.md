# SCOPE — D-12 · Account type and per-person retirement income (three releases, v5.91–v5.93)

**PHASE 1 SHIPPED as v5.91 (2026-10-06); Phases 2 and 3 open.** Stays in the pool while active (OPERATIONS §G). §8 is the Phase 1 build record.

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
