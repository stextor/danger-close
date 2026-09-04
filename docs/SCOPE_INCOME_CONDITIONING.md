# SCOPE — an income-conditioning field for state exclusions (D-11 (c))

| | |
|---|---|
| Status | **APPROVED AND BUILDABLE (2026-09-04). All seven decisions are resolved: D-1, D-4, D-5, D-6, D-7 approved 2026-09-02; D-2 (b) and D-3 (b) approved 2026-09-04.** Not yet built. |
| Premise measured against | **re-measured against shipped v5.63**, source `b2deba49e68bee6c29300f2f8cf0a7e3`, clone **`37cea89`**, 2026-09-04. *(Previously anchored to v5.60 `23877f90…`; v5.62 and v5.63 both changed the call sites — see §2.1.)* |
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
- **Still open — New Mexico's stepped table versus its graduated rate schedule**, carried from
  ROUND4 §3. Outside ROUND5's remit.
- **Still open — Connecticut's band boundaries at exactly $100,000 / $150,000**, a gap in the
  published table. Resolve against the CT-1040 instructions before populating CT.
- **Still open — how often any threshold binds.** See §6.

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

## 8 · Build record

*(not yet built — the decisions are resolved and the premise is re-anchored to v5.63, which is what
the 2026-09-04 ops package delivered. The build itself is the next release.)*

**What the build session must do FIRST, in this order:**

1. **§A freshness check** against whatever is current then. This file's premise is v5.63; if a
   release has landed since, re-run §2.1's census before writing a line of code. Two releases
   invalidated it once already.
2. **Re-read every statutory figure against its primary source.** NM's nine bands, RI's indexed
   cliff, CT's ten tiers, NJ's tiers and VA's taper are carried here from
   `AUDIT_STATE_INCOME_BASES_ROUND5.md` and have **not** been re-checked against primary sources
   since. ⚠ **Rhode Island in particular**: ROUND5 §2e/§8 records that the state's own TY2025
   filing-season guide prints a threshold its indexing statute cannot produce, and the shipped app
   note carried the same figure until v5.61. Read §2e before quoting any RI number.
3. **Resolve the two items §2.4 still lists as open** — New Mexico's stepped table versus its
   graduated schedule, and Connecticut's band boundaries at exactly $100,000 / $150,000 — against the
   CT-1040 instructions and the NM schedule, not against this document.

---

*Destination: `docs/SCOPE_INCOME_CONDITIONING.md` in the repo, and the knowledge pool — replacing the
2026-09-03 copy in both. It stays on `package_check`'s I-2 OPEN allowlist until it is BUILT, with the
allowlist comment rewritten: it is no longer awaiting decisions, it is approved and unbuilt.*
