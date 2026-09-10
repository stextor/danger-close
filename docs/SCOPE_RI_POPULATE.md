# SCOPE — populate Rhode Island's pension/401(k) modification (`STATE_RULES.RI`), the last of the five

| | |
|---|---|
| Status | **BUILDABLE — all six decisions APPROVED 2026-09-10 (§5). Not yet built.** |
| Measured against | **v5.68**, source `561fc39b5bdae7c6d83698f352c436b3`, built `index.html` `f7f0e3dd338804b2a09a6ca53318ac26`, repo HEAD `f2f4c20`, pool 125 files. Suite re-run in full this session from a run folder built by `qa/mk_runfolder.sh v567 v568`: **3,441 app checks, 0 failing**, parity 10/10 (tooling `t21` 50 + `domdiff` 32 counted separately; GRAND 3,523, exit 0). |
| Parent scope | `docs/SCOPE_INCOME_CONDITIONING.md` — this is its **B-3** state, and the release that builds this retires the parent |
| Statutory oracle | `docs/FINDINGS-v5_63-state-statutes.md` **§6**, transcribed — ⚠ **with one correction (§2)**: the comparator is exclusive, not inclusive |
| Kind | **Rule-table populate + suite inversion.** No engine code changes; one source comment is wrong and is corrected (§6) |

⚠ **Every figure in §1, §4 and §6 must be RE-MEASURED against whatever is shipped when the build starts.**
If one fails to reproduce, that contradicts the premise: **STOP and report** rather than adapting.
Line numbers are parser output at v5.68 and will drift; re-resolve them, do not trust them.

---

## 0 · Findings this scope records before anything else

Each was found by command or by reading a primary source this session. None is a decision; the
decisions are in §5.

- **F-1 · FINDINGS §6 has Rhode Island's comparator wrong.** It says *"Comparator inclusive ('at or
  below')"*, and `FINDINGS` §7c and the parent's **B-2** rationale inherit that. The statute says
  **"less than"** in both § 44-30-12(c)(8)(i) and (c)(9)(i); ADV 2025-22 says AGI **"below"** the
  limit; the Division's *Summary of Legislative Changes* (22 July 2026) describes the test as AGI
  **"less than"**. Only **PUB 2026-01**'s threshold table reads *"$107,000 or less"* — the same table
  that prints the $133,500 typo FINDINGS already rejected, in a guide that states it is *not a
  substitute for the Rhode Island General Laws*. **Annotated in place in FINDINGS §6 and §7c and the
  parent's B-2 in this same package.** The in-source comment at `stateTaxAnnual` (L1318–1319 at v5.68)
  lists "at or below" among the inclusive statutes and is corrected by the build.
- **F-2 · The v5.68 session brief called the figures question open; the parent had already decided
  it.** B-3, approved 2026-09-04: populate on the dated TY2025 pair. `SCOPE_VA_POPULATE.md` §7 repeated
  the brief's framing (*"a judgement deserving its own scope"*). **It stays decided** (§5).
- **F-3 · The v5.68 `CHANGELOG.md` says Rhode Island is "scoped next with both defects together";
  the parent's §4 puts the IRA distinction OUT of scope.** Resolved by D-RI-1: both are scoped here;
  one is built. The shipped v5.68 entry is history and is not rewritten; `METHODOLOGY.md` changes at
  the build (§6).
- **F-4 · Nothing in the suite reads the two Field Manual sentences this release falsifies.** Every
  suite regex was executed against both (OPERATIONS §B1a, `qa/tools/suite_regex_probe.cjs`), and every
  candidate was read: all of them target state notes or unrelated text. A stale manual would ship
  green. §7 adds the lock.
- **F-5 · Two counts of "unchecked" exclusion states disagree.** The Field Manual (at v5.68) says
  *"Thirteen of the nineteen states remain unverified"*; the v5.68 CHANGELOG and the parent's §4 say
  *nine of nineteen*. They may be counting different checks (age thresholds versus exclusion amounts).
  **Not resolved here.** The build must establish which count a sentence means before writing either
  into the rewritten manual (§6, D-RI-5).

---

## 1 · Premise, verified against the shipped source

`node qa/tools/state_rows.cjs DangerClose.jsx RI` — `STATE_RULES` at L1028, 51 entries; **RI at L1153**:

```
rate 0.05   ss 0.5   retExempt false   excl65 50000   exclAge 67   (no exclTest)
note  "SS and a $50,000 pension/401k exclusion per person (TY2025+, P.L. 2024 ch. 117) are income-limited
       in law by a hard AGI cliff (TY2025: $133,750 MFJ/$107,000 single, per ADV 2025-22); the exclusion
       also does not cover IRA distributions. The model taxes half of federally-taxable SS and applies
       the $50,000 from age 67, the full retirement age the statute requires, to all retirement income —
       it still ignores the cliff and the IRA distinction, so conservative under the cliff and optimistic
       above it"
```

Field frequencies: `exclTest` on **4** (CT, NJ, NM, VA), `exclAge` on **6** (CT, DE, KY, NJ, RI, WI),
`ssOffset` on 2. Partial-SS states (`0 < ss < 1`): **CO, CT, MN, MT, NM, RI, UT, VT**.

**The evaluator needs nothing new.** `stateTaxAnnual` spans L1219–1353 (`funcmap.cjs`); `_fromTest`
L1328–1341 already implements `bands` with a per-table `cmp`, `unit: "person"`, and "no matching row →
zero". Qualifying income is `retIncome + pen`, and the three call sites (`census.cjs`: L4196
`_estSaleGain`, L4321 `run`, L5476 `computeTaxPlan`) pass `retIncome` = RMDs + conversions and `pen` = the
pension. **Rhode Island is the first `bands` table whose single amount row is a cliff**, and the second
with `cmp: "lt"`.

**The IRA premise is resolved: the model's inputs cannot tell an IRA from an employer plan.**
`OTHER_TAX_TYPES` (L3206) is `taxable | trad | roth | hsa | annuity`; `inferOtherTaxType` (L3222) maps
IRA, rollover, 401(k), 403(b), 457, pension, state plan, SEP and SIMPLE **all** to `trad`. Positions carry
`trad`/`roth` dollars and an owner, no plan type — the holdings panel is labelled *"RETIREMENT HOLDINGS
(401k / IRA)"*. The pension input is one household amount with no owner (`annualPen`, L5313). The only
IRA signal anywhere is free-text account names, and the example household's own `otherAccounts` include
*"Rollover IRA (A)"*. **No approximation from existing inputs is honest.**

**The per-person cap cannot be expressed either.** `stateTaxAnnual` receives household aggregates only,
so the exclusion is capped at the household's `retIncome + pen`, not at each person's own income.

**The guarded set.** `(excl65 || 0) > 0 && !exclTest && /income[- ]limited|income limit/i` selects
**`{RI}`** at v5.68, and **empties** when RI carries `exclTest` (measured by injecting a stub `exclTest`
into a copy of the live rule object).

---

## 2 · The statute — transcribed from FINDINGS §6, with F-1 applied

**R.I. Gen. Laws § 44-30-12(c)(9)** (pension/annuity) and **(c)(8)** (Social Security). Read this session
from the codification current to 1 January 2026 and from its reproduction in PUB 2026-01 §6.

- **Up to $50,000 per qualifying individual** of taxable pension and/or annuity income, TY2025+. Joint
  filers may take up to $100,000 combined. **Each person's $50,000 is capped at that person's own
  qualifying income**, and if only one spouse has reached FRA only that spouse's income counts.
- **FRA gate:** 66–67 by birth year; **67 for 1960 and later**, which is `exclAge: 67`.
- **All-or-nothing cliff on federal AGI, exclusive:** AGI must be **less than** the threshold.
- **What qualifies:** the taxable amount on Form 1040 line 5b — private and government pensions,
  annuities, 401(k), 403(b), 457(b), TSP. **No IRA of any kind** (traditional, Roth, SEP, SIMPLE; line
  4b), and not completed rollovers.
- **The SS modification (c)(8) carries the same thresholds and FRA gate** and removes all federally
  taxable SS. It is out of scope (§5).

| ADV 2025-22 (Nov 2025), "for the 2025 Tax Year" | TY2024 | **TY2025** |
|---|---|---|
| Single / head of household | $104,200 | **$107,000** |
| Married filing jointly / qualifying widow(er) | $130,250 | **$133,750** |
| Married filing separately | $104,225 | $107,000 |

⚠ ADV 2025-22's headline says *"amounts set for Tax Year 2026"* — that covers brackets, standard
deduction and exemptions. **Its modification tables are explicitly TY2024/TY2025.** The TY2026 pair is
not published; it is expected in the November 2026 advisory. **B-3's premise reproduces.**

⚠ **The 2026 session did not change (c)(9).** The Division's 22 July 2026 summary lists, for
retirement income, only the **SS modification's age test removed for TY2027+ (income test kept)**; it
also records a 1% surtax above $1M from TY2027. Neither touches this table.

---

## 3 · The table this release adds

```js
exclTest: { kind: "bands", base: "agi", unit: "person", cmp: "lt",
            rows: { joint:  [{ upTo: 133750, amount: 50000 }, { upTo: Infinity, amount: 0 }],
                    single: [{ upTo: 107000, amount: 50000 }, { upTo: Infinity, amount: 0 }] } },
```

- **Two rows per column, ending in an explicit `Infinity` zero row.** Every populated `bands` table
  (NM, NJ, CT) terminates that way, and `t34` A-9a pins New Mexico's for the stated reason that
  otherwise a household above the last band gets zero *by accident*. It matches the parent's
  *"RI (a 2-row cliff)"*.
- **`base: "agi"`** — federal AGI includes taxable SS. **`unit: "person"`**. **`cmp: "lt"`** (D-RI-2).
- **`excl65: 50000` stays** — the NM/VA precedent: a per-person table's scalar equals its value at zero
  income, asserted by invariant. **`exclAge: 67` stays.** `ss: 0.5` stays (§5).

---

## 4 · What moves for a user — measured, both directions checked

Measured by injecting the shipped row and the §3 table as throwaway codes into the live
`STATE_RULES` and pricing through `stateTaxAnnual` (the `t34` precedent). No file was edited.

**Grid sweep — 34,992 households** (both filing columns; six age pairs; `retIncome` $0–$200,000 in
$2,500 steps; pension 0/20k/60k; `work` 0/30k; gains 0/15k; taxable SS 0/20k/40.8k):
**tax rose for 14,843, fell for 0, unchanged for 20,149. Largest rise $5,000.00/yr** (joint, both 70,
$40,000 RMDs + $60,000 pension + $40,800 taxable SS). **Conservative-only, as the table's shape
guarantees** — a per-person amount identical to today's scalar can only be granted or withdrawn.

**The comparator is invisible except at the threshold.** `lt` and `lte` differed on **0** grid households.

| cell (both 70, no SS) | shipped | `lt` | `lte` |
|---|---|---|---|
| joint, measure $133,749.00 | $1,687.45 | $1,687.45 | $1,687.45 |
| joint, $133,749.99 | $1,687.50 | $1,687.50 | $1,687.50 |
| **joint, $133,750.00** | $1,687.50 | **$6,687.50** | **$1,687.50** |
| joint, $133,750.01 | $1,687.50 | $6,687.50 | $6,687.50 |
| single, $106,999.00 | $2,849.95 | $2,849.95 | $2,849.95 |
| **single, $107,000.00** | $2,850.00 | **$5,350.00** | **$2,850.00** |

**The example household placed in Rhode Island** (Engine B, `computeTaxPlan`, 25 rows):

| conversion / yr | rows taxed more | largest rise | total rise | rows taxed less | federal tax or income moved |
|---|---|---|---|---|---|
| $0 | 13 | $5,000.00 | $42,484.19 | 0 | 0 rows |
| $50,000 | 10 | $5,000.00 | $30,000.00 | 0 | 0 rows |
| $100,000 | 10 | $5,000.00 | $45,000.00 | 0 | 0 rows |

⚠ **The exposure depends on the conversion amount.** The Roth engine feeds tax back into balances and
ranks strategies, so **the model's best Roth cell for a Rhode Island household may change. Not measured
here; the build must measure it** (§7).

⚠ **Per §K1, example-household figures witness the cliff** — they cross it in 10–13 rows — so they may be
quoted. They cannot witness the comparator, which only an exact-threshold cell can.

**What stays wrong after this release, priced** (both qualifying unless stated; the statute column
holds the model's flat 5% and `ss: 0.5` fixed so only the named gap differs). **All three are
optimistic** and are disclosed, not modelled (D-RI-1, D-RI-3):

| gap | model | statute | model understates by |
|---|---|---|---|
| each person's $50,000 capped at own income — all $90,000 pension is A's | $0.00 | $2,000.00 | **$2,000.00** |
| FRA is per spouse — A 70 has no income, B 64 has $80,000 of 401(k) | $1,500.00 | $4,000.00 | **$2,500.00** |
| no IRA qualifies — $80,000 of IRA RMDs, no employer plan | $0.00 | $4,000.00 | **$4,000.00** |

And the SS modification, out of scope: **$1,020.00 overstated** below the cliff (measure $100,800) and
**$1,020.00 understated** above it (measure $140,800).

---

## 5 · Decisions

### Approved 2026-09-10 — the six recommendations, as put

| | Decision | Why |
|---|---|---|
| **D-RI-1** · IRA distinction | **Cliff only. The IRA gap is disclosed in the note, METHODOLOGY and the Field Manual, and becomes its own input scope**, recorded at the build as a `MissingFeatures.md` row. | §1: no input distinguishes an IRA, and the only fix is a plan-type field on every traditional account and position — saved data, migration and defaults, which is a data-model feature, not a populate. The 2026-09-02 instruction rules out leaning a scalar pessimistic in its place. |
| **D-RI-2** · comparator | **`cmp: "lt"`.** | F-1: the statute, the advisory and the Division's 2026 summary all say less than/below; only the guide with the known typo says "or less". It is also the conservative direction at the one income where they differ. |
| **D-RI-3** · own-income cap and per-spouse FRA | **Disclose, don't model.** | §1: `stateTaxAnnual` receives no per-person pension or retirement income, and the pension input has no owner. Modelling needs new arguments at three call sites and a parity proof. |
| **D-RI-4** · the guards the conversion empties | **Invert, don't weaken.** `t29` F-6, F-6a/F-6b and `t35` D-8 assert the set is **EMPTY** from v569, gated so ≤v568 legs keep their own truth. **Retire together**: the `stateExclCliff` fixture, the `state_excl_limited` census row, `t29` F-6c and F-7. Add a **D-7d** convert-not-reword pin for RI. `SCOPE_STATE_SET_SELECTOR.md` stays **separate** and gets a premise annotation. | OPERATIONS §B2: a guard over an empty set is vacuous. The fixture's own comment and `t29`'s F-6a comment both require retirement with inversion, never deletion to stay green. The selector scope recommends not bundling. |
| **D-RI-5** · Field Manual wording | **Rewrite both sentences to state what is now true, and add the lock that does not exist (F-4).** | Deferred to this release by the maintainer at v5.68. F-5 must be resolved before any count is written. |
| **D-RI-6** · oracle | **Yes — `qa/tools/oracle_ri.py`**, independent, typed from FINDINGS §6 as corrected and §2 above, built and run **before** the table is written. | NM and VA each had one; §7's matrix shows which cells can actually discriminate. |

### Decided elsewhere, and not reopened

| | Decision | Where |
|---|---|---|
| Figures | **The dated TY2025 pair**; the note names the tax year; November 2026 is a constants refresh | parent **B-3**, approved 2026-09-04; FINDINGS §9 item 4 |
| Scalar | `excl65: 50000`, asserted equal to the table at zero income | parent D-3 (b) invariant; NM and VA precedent |
| Age floor | `exclAge: 67`, unchanged | parent §4 (ROUND5 confirms it) |
| Social Security | **`ss: 0.5` is out of scope**, including the TY2027 removal of the SS modification's age test | parent §4: the eight-state partial-SS blend is its own release; bundling destroys attribution |

---

## 6 · Site census — every place the build touches

Resolved by parser this session (`census.cjs`, `state_rows.cjs`, `sel_census.cjs`, `vercensus.cjs`, an
AST walk over `qa/` and `qa/tools/` that visits object keys and member properties, and
`suite_regex_probe.cjs` with every candidate read). Line numbers are v5.68.

**App source (`src/DangerClose.jsx`)**

| site | change |
|---|---|
| `STATE_RULES.RI` L1153 | add §3's `exclTest`; rewrite the note (below) |
| comment L1309 | *"Rhode Island (a 2-row cliff)"* — still true; keep |
| comment L1318–1319 | lists "at or below" among inclusive statutes — **wrong (F-1)**; becomes "three inclusive, two exclusive (Connecticut, Rhode Island)" |
| comment in the v5.64 block | *"NM, RI, VA and NJ are still applied unconditionally"* style status lines — re-read and roll |
| `DOCS_HTML` (L3839, one line) | Taxes-tab sentence *"several income-limited exclusions are treated as unconditional — verify your state"* and the state paragraph *"(Connecticut at v5.65 … Virginia at v5.68 are now conditioned; Rhode Island is not yet)"* — both false after this release; rewrite per D-RI-5 |
| four version sites | footer, DATA LOAD header, Field Manual callsign, Field Manual footer |

**The note must keep every lock the suite already holds** — `t10` L920–972 and friends, executed:
`$50,000`; "full retirement age" **and** `67`; `IRA`; `cliff`; `TY2025: $133,750`; **no** `133,500`;
`ADV 2025-22`; the phrase `income-limited` (`t10` L972 `[BY DECISION v5.59]`, and D-7d below); an SS
mention (`t10` L493); a dollar figure (`t10` L467); **no** "from 65" (`t10` L1050); and the `t31` key
**`$50,000 pension/401k exclusion`** contiguous. It must newly disclose: the cliff is applied and is
exclusive; the TY2025 pair is dated with TY2026 expected November 2026; IRA distributions are not
distinguished; the own-income cap and per-spouse FRA are not modelled; the measure omits dividend and
interest income; **the direction of each** (overstates the exclusion); and that half of SS is taxed at
every income (overstates under the cliff, understates above). It must **stop** saying *"ignores the
cliff"*. **A draft.** Executed this session against the twelve existing RI locks listed above and four of §7's
proposed claim checks: **16 of 16 hold.** `suite_regex_probe.cjs` still lists 63 candidate matchers across
`qa/` for this text, which only the full suite settles — **so it remains a draft until the build's suite
run says otherwise:**

> SS and a $50,000 pension/401k exclusion per person (TY2025+, P.L. 2024 ch. 117) are income-limited in
> law by a hard AGI cliff: both are lost entirely unless federal AGI is less than the threshold (TY2025:
> $133,750 MFJ/$107,000 single, per ADV 2025-22; Rhode Island publishes a year in arrears, TY2026 expected
> November 2026). The model applies the cliff to the exclusion, from age 67, the full retirement age the
> statute requires. It does not distinguish IRA distributions, which the statute does not cover, does not
> cap each person's $50,000 at that person's own pension income, and omits dividend and interest income
> from the AGI measure — each overstates the exclusion. It taxes half of federally-taxable SS at every
> income, which overstates tax under the cliff and understates it above.

**Suite**

| site | what it asserts today | the build |
|---|---|---|
| `t29` L241 selector | income-limited ∧ `!exclTest` | unchanged |
| `t29` F-6 L243 (`T`) | set non-empty | **invert** from v569: set is empty; ≤v568 keeps `> 0` |
| `t29` F-6a/F-6b L259/261 (`EQ`) | gated `{RI}` ≥568, `{RI,VA}` 567 | add v569 → `[]`, length 0, join `""`; labels must read sensibly on zero |
| `t29` F-6c L265, F-7 L270 | census row names the set; fixture lights the row | **retire** with the row and the fixture (D-RI-4). ⚠ Tools and fixtures are shared by both legs, so these leave the **v568 leg** too — the prior leg's `t29` count falls for a tooling reason; the CHANGELOG says so |
| `t29` §C per-fixture flip checks | include `stateExclCliff` (OPERATIONS §D2 records `C-stateExclCliff`) | disappear with the fixture; measure the count change, don't predict it |
| `qa/tools/fixture/households.mjs:66` | `stateExclCliff` | **retire**, with a removal comment naming this scope |
| `qa/tools/boundaries.mjs:131` (selector :126) | `state_excl_limited` row | **retire**, with a removal comment; the `ssOffset` row's "a flag is data" note stays |
| `t35` D-7 L291 | offenders set per leg | add v569 → empty; ⚠ the label computes `"".split(",").length` = **1** on an empty string — fix the label |
| `t35` D-7a/b/c | NM, NJ, VA converted not reworded | add **D-7d [v5.69]** for RI |
| `t35` D-8 L327 | offenders non-empty, **ungated** | **invert** from v569 (empty), gate the old form |
| `t35` offender selector | `exclTest === undefined` — a **third copy** of the selector with no agreement check | note it; unifying the copies is `SCOPE_STATE_SET_SELECTOR.md` |
| `t35` A-4 L70 label | *"CT is the only one of the five"* exclusive | assertion reads CT only and stays green; **the label becomes false** — gate the wording |
| `t34` A-1 L67 | exact `exclTest` set | v569 → `CT,NJ,NM,RI,VA` |
| `t34` A-3 L70 | `_expOpen.every(...)` | ⚠ **vacuous on an empty list** (§D1-adjacent: `[].every` is true) — at v569 assert the five **named** codes each carry `exclTest` instead |
| `t10` §2E RI block L905–975 | RI amount, FRA, IRA/cliff/figure/source locks; hand case `RIWI("RI", 80000)` = $1,020.00 | all stay green on the draft note; ⚠ the hand case sits **below** the cliff (measure $120,800) and **cannot discriminate** this release |
| `t31` | key `$50,000 pension/401k exclusion` since v559; `POST` `||` chain; `ORDER` array | key must survive in app, manual and METHODOLOGY; register v569 in both |
| `sel_census.cjs` | **9** sites execute the income-limit matcher (t10 970/972, t29 241, t35 284/297/305/309, boundaries 126, f6_probe 34) | re-run after; expect boundaries 126 to leave with the row |
| version registration | `vercensus.cjs v568 qa`: **18 files, 19 ladder entries, 63 gated expressions (82 judgement points)** | register v569; ⚠ `t33` keys a registry in an object literal and fails closed when missed; follow with the AST sweep, not a pattern |

**Controls**

| harness | what breaks | the build |
|---|---|---|
| `qa/tools/controls_state.sh` | **S2** mutates the `stateExclCliff` block (gone → *MUTATION DID NOT APPLY*, exit 1); **S4** strips income-limit notes to empty the set, which is now the expected state | **retire S2; invert S4** — the mutation *adds* the phrase to a state with `excl65 > 0` and no `exclTest`, and the inverted F-6 must fire. S0, S1, S3, S5 unchanged. Record the revision in OPERATIONS §I, where the script is named |
| `qa/tools/controls_v568_va.py` | T2 and T6 anchor on Rhode Island text; hardcoded to v568 | **leave as the frozen v5.68 record.** Do not roll it forward |

**Documents** — `METHODOLOGY.md`: the *"One of the five remains unconditional…"* paragraph (L228–232),
the D-11 (c) routing (L1616–1619), and a Rhode Island section; it must carry the `t31` key.
`CHANGELOG.md`: the v5.69 entry with the direction sweep and the Roth-cell measurement.
`docs/MissingFeatures.md`: D-11's row (L818) and a new row for the IRA input (D-RI-1).
`docs/SCOPE_INCOME_CONDITIONING.md` **retires** (and leaves `package_check` I-2); **this scope retires**
(and leaves I-2); `docs/SCOPE_STATE_SET_SELECTOR.md` gets a premise annotation — its *unconverted* set is
empty from v5.69, its *in-law* set is unchanged; `docs/OPERATIONS.md` §I for `controls_state.sh`.

---

## 7 · Tests the build ships

### 7a · The oracle and the cells

`qa/tools/oracle_ri.py` prints every cell below from the statute alone — rate 5%, `ss` 0.5, $50,000 per
person from 67, capped at `retIncome + pen`, **exclusive** cliff on `retIncome + pen + work + capGains +
ssTaxableFed`. **Its output is compared to these values to the cent before anything is built on it.**

Measured this session: a plain-arithmetic implementation matched the §3 table through `stateTaxAnnual` on
all ten, **0 mismatches**.

| cell | household | expected |
|---|---|---|
| C1 | joint 70/70, $100,000, no SS — below | **$0.00** |
| C2 | joint 70/70, $133,749 — one dollar below | **$1,687.45** |
| C3 | joint 70/70, **$133,750 — AT** | **$6,687.50** |
| C4 | joint 70/70, $133,751 — one above | **$6,687.55** |
| C5 | single 70, $106,999 — one below | **$2,849.95** |
| C6 | single 70, **$107,000 — AT** | **$5,350.00** |
| C7 | joint 70/70, $110,000 — between the two columns | **$500.00** |
| C8 | joint 70/70, $60,000 + $80,000 taxable SS | **$5,000.00** |
| C9 | joint 70/60, $120,000 — one qualifying | **$3,500.00** |
| C10 | joint 66/66, $100,000 — under the floor | **$5,000.00** |

### 7b · Which cells can catch what — measured, not argued

Each mutant was injected as a throwaway rule and priced against the table above:

| mutant | fires on |
|---|---|
| M0 none | **none** (null control) |
| M1 `cmp` `lt` → default `lte` | **C3, C6 only** |
| M2 joint threshold → $133,500 (the PUB typo) | **C2 only** |
| M3 filing columns swapped | C2, C6, C7, C9 |
| M4 `base` `agi` → `agiExSS` | **C8 only** |
| M5 `unit` `person` → `household` | C1, C2, C7 |
| M6 amount $50,000 → $40,000 | C1, C2, C5, C7, C9 |
| M7 `exclTest` removed | C3, C4, C6, C8 |
| M8 `exclAge` 67 → 65 | **C10 only** |
| M9 tail row grants $50,000 (no cliff) | C3, C4, C6, C8 |

**Load-bearing: C2, C3, C6, C8, C10.** C2, C8 and C10 are each the *only* cell that catches M2, M4
and M8; C3 and C6 are the only cells that catch M1, one per filing column. **C9
discriminates no unit defect** (with one qualifying person, per-person and household agree), so it pins
the table, not the unit. **No fractional cell discriminates the comparator**: at $133,750.01 both lose.

### 7c · What lands where

- **`t10`** — a `[HAND v5.69]` RI block: C1–C10 through `stateTaxAnnual`, hand-computed before the engine
  runs; **one household through `computeTaxPlan`** with a year each side of the cliff, proving wiring and
  not just the table; **`[EXTINCTION v5.69]`** a $1 step from C2 to C3 costs **$5,000.05**, far more than
  the rate on $1 — the exclusion is no longer income-blind; **`[INVARIANT v5.69]`** `excl65` equals the
  table's first-row amount and `exclAge` is still 67; **`[KNOWN DEFECT pre-v5.69]`** pins on the v568 leg:
  C3's household paid $1,687.50 where the statute gives no exclusion, and RI carried no `exclTest`.
- **`t34`** — **A-12 [v5.69]**: RI's table is `bands`, `agi`, `person`, `cmp: "lt"`, **exactly two rows
  per column with every value priced** (§D1: no endpoint-only table check), `Infinity`-terminated; A-1 and
  A-3 per §6.
- **`t35`** — D-7/D-8 inverted and gated; **D-7d**; note claims asserted **as claims, not nouns** (the
  v5.65 D-2 lesson): IRA not distinguished, own-income cap not modelled, no dividend/interest in the
  measure, each with its direction; TY2026 expected; **and a §B2 lock that the note no longer says it
  ignores the cliff**. The **Field Manual lock (F-4)**: from v569 `DOCS_HTML` no longer contains *"Rhode
  Island is not yet"* nor claims *several* income-limited exclusions are treated as unconditional, and
  positively names Rhode Island among the conditioned states — gated.
- **`t29`** — F-6 / F-6a / F-6b inverted and gated; F-6c and F-7 retired.
- **Cross-engine parity** — the existing `t34` invariant covers the three call sites; the build confirms
  it runs an RI household rather than assuming it does.
- **The Roth tab** — run `runRothStrategies` for an RI household on v568 and v569 and **report whether the
  model's best cell changes**. A measurement for the CHANGELOG, not an assertion, unless it moves.

### 7d · Negative controls — `qa/tools/controls_v569_ri.py`

Drift-safe in the `controls_v568_va.py` shape (copy, one mutation, rebuild there, needle per control,
canonical md5s unchanged afterwards). **C0 null; M1–M9 against the source table**, each expected to fire
the `t10` cells in §7b and `t34` A-12; plus:

- **G1** — give a non-populated state with `excl65 > 0` (Wisconsin) the income-limited phrase: inverted
  F-6, F-6a, F-6b, D-7 and D-8 must fire; `t10` L970 fires too, and that is expected.
- **G2** — reword RI's note out of the phrase while keeping `exclTest`: **D-7d** fires.
- **G3** — restore the old Field Manual sentence: the manual lock fires.
- **G4** — drop the IRA disclosure from the note: the note-claim test fires.
- **G5** — `t34` A-3 restored to `.every` over an empty list with RI's `exclTest` removed: **must stay
  silent** — the recorded vacuity reproduced on purpose, as `controls_v568_va.py` T5 did for F-6a.

**A control that does not fire is the finding.**

---

## 8 · Out of scope

- **The IRA input** (D-RI-1) — its own scope; saved data, migration, defaults.
- **Per-person income arguments** at the call sites (D-RI-3).
- **Rhode Island's SS modification and the eight-state `ss: 0.5` blend**, including the TY2027 age-test
  removal — parent §4.
- **Rhode Island's flat 5% against its 3.75% / 4.75% / 5.99% schedule and standard deduction**, the TY2027
  surtax, the military pension modification (c)(11), married filing separately and head of household.
- **Unifying the three copies of the guarded-set selector** — `SCOPE_STATE_SET_SELECTOR.md`.
- **F-5's count reconciliation beyond what the manual rewrite needs**, and the unchecked exclusion states.
- **The `K-1`–`K-3` pre-/post-ship split** — OPERATIONS §I, still unscoped.

## 9 · Traps for the build

- **A hand-written `acorn-walk` census skips non-computed object keys and member properties** —
  `walk.full` does not visit `{ stateExclCliff: … }`'s key. This scope's first census returned the
  fixture's references but not the fixture; a self-check against a known key caught it. Use
  `census.cjs`, or visit `Property` and `MemberExpression` explicitly.
- **Tools and fixtures are shared by both legs** — retiring the fixture moves the prior leg's `t29` count.
- **`[].every` is true.** Any "the remaining states are…" assertion goes vacuous when the list empties.
- **The tool shell is `/bin/sh`**; run scripts with `bash`. `time` is not on the shell's path.
- **A suite run longer than the tool limit dies with the shell** unless detached (`setsid nohup … &`) —
  this session lost one run that way before reading its totals.
- **Upload into folders**, and check each folder afterwards (OPERATIONS §C3).

## 10 · Build record

*(not yet built)*

---

*Destination: **repo `docs/SCOPE_RI_POPULATE.md` AND the knowledge pool**, with a manifest row and an
entry on `package_check`'s I-2 OPEN allowlist until the build retires it.*
