# SCOPE — an income-conditioning field for state exclusions (D-11 (c))

| | |
|---|---|
| Status | **APPROVED AND BUILDABLE. Eleven decisions resolved: D-1, D-4, D-5, D-6, D-7 approved 2026-09-02; D-2 (b) and D-3 (b) approved 2026-09-04; B-1 (a), B-2, B-3 and B-4 approved 2026-09-04 — see §7b.** ⚠ **§8's pre-build gate (steps 1–3) is COMPLETE**, so the next session builds rather than researches. Not yet built. |
| Premise measured against | **re-measured against shipped v5.63**, source `b2deba49e68bee6c29300f2f8cf0a7e3`, clone `37cea89`, 2026-09-04; **re-confirmed at repo HEAD `4ca47a5` on 2026-09-04** — §2.1's census re-run (4 hits, L1114 / L4003 / L4128 / L5283) and `STATE_RULES` re-dumped by AST (L1028, 51 entries, `exclAge` on 4, `ssOffset` on 2), both unchanged. Suite re-measured at that anchor: **3,010 app checks / 0 failing**, parity 10/10. *(Previously anchored to v5.60 `23877f90…`; v5.62 and v5.63 both changed the call sites — see §2.1.)* |
| Statutory oracle | **`FINDINGS-v5_63-state-statutes.md`** — all five statutes read against primary or official sources 2026-09-04. **The build encodes its tables and does not re-derive them.** |
| Parent findings | `MissingFeatures.md` **D-11 (c)** · `AUDIT_STATE_INCOME_BASES_ROUND5.md` (complete) · `AUDIT_STATE_EXCL65_ROUND4.md` §2a, §2b, §4 · `AUDIT_STATE_EXCL65_ROUND3.md` §4 |
| Kind | **Data-model feature.** Engine code changes. This is not a rule-table edit. |

> **Clone tag corrected.** This line previously read `33f699d`, which was accurate when written.
> Re-read from a fresh clone on 2026-09-03: `d590bcd` and `513f666` added this file and the ROUND5
> audit under `docs/`, and `e1f7adb` is an empty commit.

> ### ⚠ Four documents disagreed about this scope's status for two releases
>
> The `CHANGELOG.md` v5.62 entry stated *"D-2 (b, named-string `base`) and D-3 (b, additive) **are
> approved**"* while this file's status line, the `PROJECT_KNOWLEDGE_INDEX.md` row and
> `package_check.mjs`'s I-2 allowlist comment all said the two decisions were unresolved. Nothing
> compared them; this is the **fifth** recorded instance of the class.
>
> **The chronology, established from git on 2026-09-04 rather than inferred.** This file landed at
> `dcc14c1` (the v5.61 commit, 2026-09-03) already carrying the ROUND5 re-decided text, and has not
> been modified since — `git show dcc14c1:docs/SCOPE_INCOME_CONDITIONING.md` is byte-identical to the
> committed and pooled copies (`af5015f1…` all three). The v5.62 CHANGELOG entry was written later,
> at `00face0`, and names the **current** options by letter *and* by shape. A session brief written
> the same week proposed the opposite reading — that the entry carried a stale approval of the
> superseded options forward onto renumbered text — and that reading is **wrong**: the superseded
> options were *one shared base* and `{ upTo, amount }`, neither of which the entry describes.
>
> **How it is resolved.** The maintainer approved D-2 (b) and D-3 (b) in writing on **2026-09-04**,
> which is the date this file, the manifest row and the allowlist comment now carry. Whether an
> earlier approval had also been given, making the v5.62 entry correct and the other three stale, is
> not established and is now moot. The four documents are made to agree in the ops package of
> 2026-09-04.

---

## 1 · Why this exists, and why it is not another state release

Five states' exclusions and two states' Social Security treatment are conditioned in law on income,
and the data model cannot hold a condition. `excl65` is a scalar and `persons65` is a count, so every
income-limited provision is currently applied **unconditionally**.

| state | statute conditions on | what the model does | direction |
|---|---|---|---|
| **NM** | nine-band step, **$0 above $51,000** AGI (MFJ), never indexed since 1987 | grants $8,000 per person always | optimistic, and for the target household the provision **does not exist** |
| **RI** | hard AGI cliff, **TY2025 $133,750 MFJ / $107,000 single** | grants $50,000 per person always | optimistic above the cliff |
| **VA** | $12,000 per person, single $1-for-$1 taper on joint AFAGI above $50,000/$75,000 | applied unconditionally | optimistic above the threshold |
| **NJ** | household cap at 62, then percentage tiers, **zero above $150,000** of NJ gross income | grants $75,000 per person from 65 | optimistic |
| **CT** | 100% of pension/annuity/IRA below $75,000/$100,000 federal AGI, stepped percentage above | **not modelled at all**, and says so | ⚠ **PESSIMISTIC — the model overstates CT tax** |

**The maintainer's instruction of 2026-09-02 governs this work**: state tax rules are not assumptions,
so the project's conservative-direction tiebreaker does not apply to them. Where the statute is
knowable and the model can express it, model it. Where the model *cannot* express it, the answer is
to make the model able — not to pick a scalar and lean it pessimistic. That is what this scope is
for, and it is why "ship New Mexico as a disclosed scalar" is not the recommendation.

> ⚠ **Two corrections from the completed ROUND5, 2026-09-03.**
>
> **Rhode Island's figure was wrong.** This table read $133,500. Rhode Island's own TY2025 guide
> prints $133,500, but the statute's indexing formula does not admit it — see
> `AUDIT_STATE_INCOME_BASES_ROUND5.md` §2e and §8. **The shipped app note carries the same error and
> needs correcting.**
>
> **Connecticut's direction reverses, and this section's conclusion needs qualifying.** This section
> previously ended: *"the existing simplifications run optimistic, not conservative."* That is true of
> the four modelled states. **Connecticut is materially pessimistic** — from TY2026 the model taxes
> 100% of a CT household's pension, 401(k) and IRA income at 5% where the statute taxes none of it
> below $100,000 of AGI. An unmodelled provision is not a neutral one, and this scope should not have
> assumed it was.

---

## 2 · Premise — measured, not assumed

### 2.1 `stateTaxAnnual` has exactly three call sites, in three engines

AST census against **v5.63** (`node qa/tools/census.cjs src/DangerClose.jsx stateTaxAnnual`, run
2026-09-04) — 4 hits, one definition and three calls. **All four line numbers moved from the v5.60
reading; do not cite the old ones.**

| line | enclosing | notes |
|---|---|---|
| **1114** | *definition* | `function stateTaxAnnual({ code, fallbackRate, retIncome = 0, pen = 0, work = 0, capGains = 0, ssTaxableFed = 0, ssGrossA = 0, ssGrossB = 0, ageA = null, ageB = null, single = false, persons65 = 0 })` — spans L1114–1160 (`funcmap.cjs`) |
| **4003** *(was 3996)* | `_estSaleGain` ← `run` ← `runRothStrategies` | the gross-up mirror |
| **4128** *(was 4114)* | `run` ← `runRothStrategies` | the Roth ladder engine |
| **5283** *(was 5265)* | `computeTaxPlan` | the main tax plan |

> ### ⚠ This subsection's central claim was FALSIFIED by v5.62 and is rewritten
>
> It previously read: *"The three call sites do not pass the same fields. L3996 and L4114 fold
> pension and work into `retIncome` (`Math.max(0, taxableOrd - ssT)`) and pass no `pen` or `work` at
> all."* **That is no longer true of any call site.** v5.62 rewrote both Roth sites to gross
> components precisely because the folded form was under-taxing in all 42 taxing jurisdictions.

**As of v5.63 all three call sites pass the same field set**, read from the source at `37cea89`:

| | L4003 | L4128 | L5283 |
|---|---|---|---|
| `retIncome` | `rmd + c` | `rmd + conv` | `rmdTax_y + conv_y` |
| `pen` | `pen` | `pen` | `pen_y` |
| `work` | `work + otherOrd` | `work + otherOrd` | `work_y + otherOrd_y` |
| `capGains` | `qdcgC` | `qdcg` | `qdcg_y` |
| `ssTaxableFed` | `ssTC` | `ssT` | `ssTaxable` |

**This is the single largest change to this scope's premise and it makes the feature cheaper.** The
burden the old text described — proving three differently-shaped argument lists sum to one measure —
is now a same-shape comparison. The cross-engine parity invariant in §5 is still mandatory; it is no
longer the hard part.

> ### ⚠ `work` no longer means wages — v5.63 (added 2026-09-04)
>
> All three sites pass **`work + otherOrd`**, so rental, annuity, royalty and "other" ordinary income
> ride in the `work` slot. The value reaching `stateTaxAnnual` is arithmetically what a state base
> should contain, and v5.63's CHANGELOG says so explicitly. But **the base expressions in D-2 must be
> read as "the `work` argument", not as wages**, and no disclosure note written for this feature may
> use the word *wages* — it would be wrong for four income types. The FICA sites, which do mean
> earned income only, read the filtered `work` binding and not this argument.

### 2.2 ⚠ THE FINDING — the app already carries FOUR different MAGI definitions, and nothing compares them

Re-measured against v5.63 on 2026-09-04 (`census.cjs … magi --kind=ident`, 21 hits, four of them
definitions). **The four definitions are unchanged in content; every line number moved.**

| line (v5.63) | was | context | definition |
|---|---|---|---|
| 4116 | 4102 | Roth ladder engine | `grossOrd + qdcg` |
| 4509 | 4491 | `computeIrmaaPlan` | `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| 4970 | 4952 | `computeWithdrawalPlan` | `taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y` |
| 9066 | 9047 | a render block | `pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder` |

**No suite asserts these agree.** Eighteen suite files mention `magi`; none contains a parity,
equality or agreement assertion across engines. `METHODOLOGY.md` already documents one divergence —
the ladder's MAGI omits dividend income and realized capital gains that the IRMAA engine includes —
and calls it "a separate and larger correction."

**Why this matters here.** v5.43 closed exactly this class for §86: the app was "answering one
statutory question two ways depending on which tab was open." Hanging a state income threshold off
the nearest available MAGI would recreate that defect on a new statute.

**So the hard part of this feature is not the `STATE_RULES` field. It is defining the state-income
measures and proving all three call sites compute them identically.**

### 2.3 What `STATE_RULES` can hold today — re-measured 2026-09-04 against v5.63

**Unchanged from the v5.60 reading, and now confirmed by AST at v5.63** (object literal at L1028;
field frequencies printed, not counted by eye). 51 entries. **Six fields on every entry** (`name`,
`rate`, `ss`, `retExempt`, `excl65`, `note`) and **two optional fields already present**: `exclAge`
on **4** states (DE, KY, RI, WI) and `ssOffset` on **2** (ME, MD). This is the one part of the
premise two releases did not move.

> ⚠ **This section previously said "nothing in the table is nested, so a band table would be the first
> non-scalar value."** True about nesting, but it understated the precedent. **`ssOffset` carries no
> data — it selects behaviour** inside `_one` (L1145–1148 at v5.63, the branch itself at **L1147**),
> branching the exclusion computation for Maine and Maryland. A shape discriminator is the
> generalisation of something the table already does.

### 2.4 What was NOT established — **now established, see ROUND5**

Every item in this list has been closed except where noted:

- ~~Which income base each statute names~~ → **three in law, two the model can express**, differing by
  one argument (`ssTaxableFed`). ROUND5 §3.
- ~~New Jersey's phase-out percentages and whether $100,000/$150,000 are indexed~~ → **captured from
  the codified section; NOT indexed**. ROUND5 §2b.
- ~~Rhode Island's TY2026 indexed thresholds (ADV 2025-22)~~ → **the advisory never contained them**;
  RI publishes a year in arrears, expected November 2026. ROUND5 §2e.
- ~~Connecticut, New Jersey and Virginia's current figures~~ → **all three verified**. ROUND5 §2b–§2d.
- ~~New Mexico's stepped table versus its graduated rate schedule~~ → **CLOSED 2026-09-04.** It does
  interact, and the flat `rate: 0.049` gets it wrong in a bounded way. The exemption reduces net
  income, so its cash value is the marginal rate; § 7-2-7 (as amended by Laws 2024 ch. 67 § 5) puts
  MFJ taxable income at AGI ≤ $51,000 — the only range where the exemption is non-zero — in the
  **1.5%–3.2%** brackets. **The model over-values the exemption by roughly 1.5× to 3× wherever it is
  non-zero: an optimistic residual, to be disclosed, not modelled.** It runs opposite to the headline
  correction, which is strongly conservative. No mechanism change. `FINDINGS` §7a.
- ~~Connecticut's band boundaries at exactly $100,000 / $150,000~~ → **CLOSED 2026-09-04** against the
  TY2026 Form CT-1040ES table, which reads "$150,000 and up → 0" and phrases eligibility as *less
  than*. **At exactly the threshold the factor is zero, not 2.5%.** This is what forced B-2.
  `FINDINGS` §3.
- **Still open — how often any threshold binds.** See §6. This is the only §2.4 item the build does
  not inherit closed, and B-1 (a) is what makes it answerable.

---

## 3 · Site census — what the build would touch

**Line numbers re-resolved against v5.63 on 2026-09-04.**

| site | what |
|---|---|
| `stateTaxAnnual` L1114–1160 | signature gains nothing new — both measures are expressions over existing arguments; `_floor`/`_cap` logic gains a band lookup and a taper |
| call sites **L4003 / L4128 / L5283** | now pass an identical field set (§2.1); parity must still be **proven**, not assumed; no new parameters |
| `STATE_RULES` | **new optional field, ADDITIVE** — on NM, RI, VA, NJ, CT |
| notes for those states | all five disclose the limitation as unmodelled; all five must be rewritten. **RI's also carries a wrong figure** |
| `t10` §2E | whole-table assertions, the F-6 guarded set (NJ, NM, RI, VA), the note-vs-code invariant — **see §7 D-3, this constrains the field's design** |
| `t29` **L233** *(was cited as L212)* | the F-6 empty-set guard — same constraint. Re-read at `37cea89`: `.filter(([, r]) => (r.excl65 \|\| 0) > 0 && /income[- ]limited\|income limit/i.test(r.note \|\| ""))` |
| `t31` | disclosure-parity keys for any figure that becomes real |
| `METHODOLOGY.md` | mandatory; plus the state-tax paragraph the maintainer's rule needs stated explicitly |

---

## 4 · Explicitly OUT of scope

- **The `ss: 0.5` blend across the eight partial-SS states.** Same defect class, natural *next*
  release; bundling destroys attribution. ⚠ ROUND5 found **Connecticut's `ss: 0.5` is wrong in both
  directions** — 100% exempt below the thresholds, and above them the cap is 25% of *total benefits
  received*, a different base. That belongs to this out-of-scope release, not this one.
- **Fixing the four-way MAGI divergence** (§2.2). Contained, not fixed. Its own scope.
- **The nine of nineteen exclusion states still unchecked.**
- **Any state's rate, `retExempt`, or `exclAge`.** ⚠ ROUND5 confirms RI's `exclAge: 67` is **correct**
  for anyone born 1960 or later and mildly conservative for a 1955–1959 cohort. No change warranted.
- **RI's IRA-versus-employer-plan distinction.** Needs an input, not a threshold.
- **Virginia's pre-1939 unconditional deduction and its Disability Income interaction**, New Jersey's
  disabled-at-any-age route, New Mexico's blindness route, Rhode Island's military pension
  modification. All confirmed real; none expressible without new household inputs. **Disclose, don't
  model.**

---

## 5 · Tests this would ship with

- Hand-computed cells for each populated state **on both sides of every threshold**, and — for New
  Mexico — inside at least three of the nine bands, since a cliff implementation would pass a
  two-sided test and fail a band. **For Connecticut, inside at least three of the ten.**
- **For Virginia specifically: a case in the taper range with BOTH spouses qualifying**, because the
  reduction is applied once to the combined $24,000 and a per-spouse implementation is wrong by a
  factor of two there and correct everywhere else.
- **For New Jersey: a case in each percentage tier**, since the dollar cap and the percentage never
  bind together and a cap-then-percentage implementation would pass a tier-1 test.
- **A cross-engine parity invariant**: the same household priced through all three call sites yields
  the same state-income measure and the same state tax. The single most valuable test in the release.
- Boundary pins **at** each threshold (at, one dollar below, one dollar above).
- ⚠ **The pins must discriminate the comparator, which B-2 makes a per-table property.** Four statutes
  are inclusive at the band top ("not over $30,000", "not more than $125,000", "at or below");
  **Connecticut is exclusive** ("$150,000 and up → 0"). A pin *at* the threshold is the only one of
  the three that can tell `lte` from `lt`, so it is the load-bearing one, and a suite that only tests
  one-below and one-above would pass with the comparator inverted on every state.
- ⚠ **Which tests land in which release, under B-1 (a).** The measure-only release ships the
  cross-engine parity invariant, the evaluator's band and taper arithmetic against the
  `FINDINGS` tables driven through a **synthetic** jurisdiction, the comparator pins, and an
  assertion that **no `STATE_RULES` entry carries `exclTest`** — which is what makes "no output
  change" a tested claim rather than a stated one. The hand-computed per-state cells, the
  `excl65`-equals-table-at-zero invariant and the note-vs-code extinction invariant land with the
  state each belongs to, since none of them can exist before a state is populated.
- An extinction invariant: **no state whose note claims an income limit may carry an unconditional
  exclusion**, generalising the v5.60 note-vs-code check.
- ⚠ **The invariant D-3 (b) creates a need for, added 2026-09-04 with the approval.** Keeping
  `excl65` as a scalar alongside a band table means the two can disagree and nothing would notice —
  the scalar becomes a second source of truth the moment a statute is re-read and only one of them is
  updated. **For every state carrying a band table, assert that the scalar `excl65` equals what the
  table yields at zero income.** One check, on the `t10` side where the whole-table walk already
  lives. This is the price of the option that keeps the guards meaningful, and it converts (b)'s only
  real weakness into something tested rather than something remembered.
- Negative controls that revert each new field and each threshold, per §B2, **read individually**.

---

## 6 · First deliverable is a measurement, not code

Unchanged. **How often does each threshold actually bind for the households this app models?**

⚠ This cannot be measured from the existing fixtures. `qa/tools/fixture/households.mjs` holds
boundary-clearing variants of one shipped example household, so counting them says nothing about a
population. And the engines compute no AGI-like state income at all.

The measurement needs a purpose-built set of households and it needs the measure from D-1 to exist
first. That is not a detour: **defining the measure is the first step of the feature and of the
measurement alike.**

---

## 7 · Decisions

> **D-1, D-4, D-5, D-6, D-7 were approved 2026-09-02 and all five stand** — see
> `AUDIT_STATE_INCOME_BASES_ROUND5.md` §6 for what the completed audit did to each.
> **D-2 and D-3 were invalidated by ROUND5, re-decided below, and APPROVED 2026-09-04: (b) and (b).**
> All seven decisions are now resolved and the scope is buildable. Read the §2.1 warning first —
> the approved D-2 expressions are written in terms of the `work` **argument**, whose contents
> changed at v5.63.

### D-2 · One income base, or per-state bases? — **(b) APPROVED 2026-09-04**

The 2026-09-02 recommendation was *one base now, with divergence disclosed*. ROUND5 killed it: three
statutes name three bases and two of them exclude Social Security. But the PARTIAL draft's
replacement reading — per-state base selection — overstated the cost.

**Reduced to the terms `stateTaxAnnual` already receives, there are exactly two measures:**

| model base | expression | states |
|---|---|---|
| `agi` | `retIncome + pen + work + capGains + ssTaxableFed` | NM, RI, CT |
| `agiExSS` | `retIncome + pen + work + capGains` | VA, NJ |

⚠ **`work` here is the argument, which since v5.63 carries `work + otherOrd` at all three call
sites** — so both measures include rental, annuity and royalty income. That is what a state base
should contain, and it is why these expressions are correct as written; but the disclosure notes must
not describe the term as wages, and neither measure carries dividend or interest income at all.

**Options.**
(a) One base, as approved — **now known wrong**; for a couple with $40,000 of Social Security it moves
the measure across a cliff in two states.
(b) **Two bases selected by a per-state `base` field** — one extra term, one extra field, no new
arguments, both expressions self-contained inside `stateTaxAnnual`.
(c) Five per-state bases modelling each statute's own definition — needs NJ gross-income categories
the model does not carry, for a difference that does not move a mainstream household.

**Recommendation: (b) — APPROVED 2026-09-04.** It is exact for Virginia, close for New Jersey, and it keeps D-1 and D-5
intact because both expressions live in one function. **The residual gap is disclosed, not modelled**:
New Jersey's true gross income differs from `agiExSS` in ways the model cannot see, and neither
measure carries dividend or interest income at all — an **optimistic** direction that must be said
out loud in every populated state's note.

### D-3 · Cliff-only shape, or a general band table? — **(b) APPROVED 2026-09-04**

The 2026-09-02 recommendation was an ordered list of `{ upTo, amount }`. ROUND5 called it
insufficient and counted four shapes. **Reading all five statutes, the count is two** — and three
things that looked like shape are orthogonal attributes.

**Two shapes:**
- **`bands`** — ordered rows, each carrying **either** a dollar `amount` **or** a `pct` of qualifying
  income. Expresses NM (9 amount rows), RI (2 — a cliff), CT (10 pct rows), and **NJ's mixed table
  for free** (1 amount row, 2 pct rows, zero).
- **`taper`** — `max(0, perPerson × qualifying − max(0, measure − threshold))`. Virginia only.

**Three orthogonal attributes:** `base` (D-2), `unit` (`person` for NM/RI/VA, `household` for NJ, per
return for CT), and the existing `exclAge` (62 for NJ, 0 for CT, 67 for RI).

**And one constraint the suite imposes, checked before building as this decision required.**
`t10` §2E's note-vs-code guard reads `r.excl65 > 0`; `t29`'s F-6 empty-set guard reads
`(r.excl65 || 0) > 0`. Executed 2026-09-03: an array or object compared `> 0` yields **false**.
⚠ **If the band table replaces `excl65`, every converted state drops silently out of both guards** —
a vacuous pass, on exactly the states the release changes, in the two checks written to catch this.

**Options.**
(a) `{ upTo, amount }` only, as approved — **cannot express CT or NJ's tiers at all**.
(b) **Additive optional field carrying `{ kind: 'bands' | 'taper', ... }` with mixed amount/pct rows,
`excl65` left in place as a scalar.**
(c) Replace `excl65` with a rich object — cleaner data model, **breaks both whole-table guards
silently**.

**Recommendation: (b) — APPROVED 2026-09-04.** Additive matches the `exclAge` and `ssOffset`
precedent, keeps the guards meaningful, and leaves an unpopulated state behaving exactly as today,
which is what D-6 requires. The cost is one redundant scalar per populated state; the alternative is
a green suite that has stopped checking the thing it was written for.

**Re-verified independently at `37cea89` on 2026-09-04**, because this is the decision with a hard
constraint behind it rather than a preference. The two live guards read
`qa/t10_taxcases.mjs` **L467** `if (r.excl65 > 0 && !/\$\d/.test(n)) exclOK++;` and
`qa/t29_boundaries.mjs` **L233** `(r.excl65 || 0) > 0 && …`. Executed in node the same day:
`[1,2] > 0`, `({a:1}) > 0` and `(({a:1})||0) > 0` all return **false**, `8000 > 0` returns true. So
option (c) empties both guarded sets on exactly the states this release changes, and both keep
passing. **The approval carries the §5 invariant with it** — the redundant scalar must be asserted
equal to the table's value at zero income, or it becomes a second source of truth.

**⚠ One consequence to accept openly.** Every threshold in all five statutes is per filing status —
MFJ, single, MFS, and for CT head of household. The model carries only a `single` boolean. **Two
columns are all that can be expressed**, and the MFS and head-of-household figures must be disclosed
as unmodelled rather than folded silently into one of the two.

---

## 7b · Build decisions — raised by the completed pre-build gate, **all four APPROVED 2026-09-04**

> **None of these was among the seven.** They surfaced only once the statutes had been read and the
> build was about to start, and three of them change something a user or a reader would notice. They
> are recorded here rather than left as implementation detail because the project's rule is that a
> judgement call affecting the app's direction or a user's numbers gets asked, not assumed.

### B-1 · Does the first release populate a state, or only build the measure? — **(a) APPROVED**

**(a) Measure-only.** D-1's income measure, D-2's two bases, D-3's evaluator, the cross-engine parity
invariant, **zero states populated** — so no user-visible change at all.
**(b)** Measure plus Connecticut together, so the first release moves a number.

**Rationale for (a): attribution.** If the evaluator and Connecticut's ten-row table land in the same
release and a figure comes out wrong, the CHANGELOG cannot say which one was at fault — and CT is the
state where a wrong figure moves the most money, in the direction that turns a pessimistic error
into an optimistic one. (a) also makes §6's binding-frequency measurement possible **before** five
tables are committed to, which is the order §6 has asked for since the scope was written.

⚠ **The cost, to be stated plainly in the CHANGELOG rather than glossed:** one release a user cannot
see. Its entry must say so in those words, and must not imply a modelling improvement that has not
reached anyone yet.

### B-2 · One comparator for all five tables, or a per-table one? — **per-table, APPROVED**

The field carries **`cmp: 'lte' | 'lt'`, defaulting to `'lte'`**; Connecticut sets `'lt'`.

Four statutes are inclusive at the band top, Connecticut is exclusive (§2.4, `FINDINGS` §3). For
whole-dollar income the two agree — but the model's measure is a **sum of floats, not a rounded
return figure**, so they do not agree in general. The alternatives were rounding the measure (which
invents a rule no statute states) or picking one comparator for all five (which silently misprices
whichever state loses). One extra key, and it is what gives the §5 boundary pins something to catch.

### B-3 · Populate Rhode Island on TY2025 figures, or wait for November 2026? — **TY2025, dated, APPROVED**

RI publishes a year in arrears; the TY2026 pair is expected in the November 2026 advisory and did not
exist on 2026-09-04. Populating on **$107,000 / $133,750** puts the cliff slightly below where TY2026's
will sit, so marginally more households lose the exclusion and pay more modelled tax — **the
conservative direction**.

⚠ **The maintainer's 2026-09-02 instruction says the conservative tiebreaker does not apply to state
tax rules, because the statute is knowable. The point here is that this one is not knowable yet** —
the figure does not exist to be read. That is a different situation from picking a scalar and leaning
it pessimistic, and it is why this is decided rather than deferred. **The note must name the tax
year** ("TY2025 thresholds; Rhode Island publishes a year in arrears, TY2026 expected November 2026")
so the figure is dated rather than merely stated, and the November advisory becomes an ordinary
constants refresh.

The alternative — holding RI back — leaves it wrong in the **optimistic** direction (an unconditional
$50,000 per person, every income) for another three months, which is the worse of the two errors.

### B-4 · The field's name — **`exclTest`, APPROVED**

D-3 approved the shape, not the name. `exclTest` reads as "the test that conditions `excl65`", which
is what it is, and it sorts beside `exclAge` in every state row. `incomeTest` was the alternative:
clearer read in isolation, but it loses the tie to the exclusion it governs. Low stakes — decided now
only because the name is about to appear across 51 rows and several suites, where renaming is a site
census rather than an edit.

---

## 8 · Build record

*(not yet built. **The pre-build gate below is COMPLETE as of 2026-09-04** — steps 1, 2 and 3 were
executed and recorded, so the next session writes code. The build itself is the next release, and
under B-1 (a) it is the measure only.)*

**The three-step gate, and what each returned.** *(Kept rather than deleted: it is the record of what
was checked, and step 1 must be re-run against whatever is current when the build actually starts.)*

1. **§A freshness check — DONE, clean.** Source, both artifacts and the whole pool matched the
   manifest at repo HEAD `4ca47a5`; §2.1's census and the `STATE_RULES` dump were re-run and are
   unchanged; the suite measured 3,010 / 0. ⚠ **Re-run this step anyway.** If a release has landed
   since 2026-09-04, re-run §2.1's census before writing a line of code — two releases invalidated
   this premise once already.
2. **Re-read every statutory figure against its primary source — DONE.** All five read
   first-hand on 2026-09-04 and recorded in **`FINDINGS-v5_63-state-statutes.md`**: NM § 7-2-5.2 (all
   three tables) and § 7-2-7; CT's **TY2026** phase-out table from Form CT-1040ES (Rev. 01/26); NJ's
   tiers from the chaptered P.L. 2021 c.129 text; VA § 58.1-322.03(5)(b) **plus the Form 760 Age
   Deduction Worksheet**, which is what settles the once-vs-twice taper mechanic the statute alone
   leaves ambiguous; RI's thresholds from ADV 2025-22. **The build encodes those tables and cites
   that file — it does not re-derive them.**
   ⚠ Two things the re-read added. RI's shipped note was verified **correct** at v5.63 by AST dump
   (`$133,750 MFJ/$107,000 single`), so the ROUND5 §8 defect is confirmed closed from the source
   rather than from the CHANGELOG. And RI gives **married filing separately its own column**
   ($104,225 for TY2024, $107,000 for TY2025), so MFS must not be assumed to track single in the
   unmodelled-filing-status disclosure.
3. **Resolve the two items §2.4 listed as open — DONE, both closed.** See §2.4. Connecticut's
   boundary resolution is what produced **B-2**; New Mexico's rate interaction is a disclosure, not a
   mechanism.

**What the build session does now, in this order:**

1. Re-run gate step 1 against whatever is current.
2. Build **D-1's measure, D-2's two bases and D-3's evaluator** as `exclTest` (B-4), with the
   comparator of B-2, **populating no state** (B-1 (a)). Ship it with §5's measure-only test set.
3. Run §6's binding-frequency measurement, which the measure now makes possible.
4. Populate one state per release, **Connecticut first** — the only one of the five whose current
   simplification runs pessimistic, and the largest single-state dollar error for a mainstream
   household. Rhode Island populates on dated TY2025 figures per **B-3**.

---

*Destination: `docs/SCOPE_INCOME_CONDITIONING.md` in the repo, and the knowledge pool — replacing the
2026-09-04 copy in both. It stays on `package_check`'s I-2 OPEN allowlist until it is BUILT; the
allowlist comment still reads correctly (approved and unbuilt) and needs no rewrite — ⚠ but check it
rather than assuming, since a stale allowlist REASON is as invisible to I-3 as a ghost entry is.*

*⚠ **This revision adds a second pool file**, `FINDINGS-v5_63-state-statutes.md`, which needs its own
manifest row — a pool file without one is exactly the gap that hid the missing `src/index.html` for
eleven releases. Suggested row for the reference-documents table:*

| `FINDINGS-v5_63-state-statutes.md` | The statutory oracle for the five income-conditioned states (NM, RI, VA, NJ, CT) — every figure read against a primary or official source 2026-09-04, plus the two ROUND5 open items closed and the four build decisions they produced. **The populate releases test against these tables; they are not re-derived.** RI's TY2026 pair is not published and is expected November 2026 | when a statute changes or RI's TY2026 advisory issues |
