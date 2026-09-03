# SCOPE — an income-conditioning field for state exclusions (D-11 (c))

| | |
|---|---|
| Status | **ROUND5 COMPLETE (2026-09-03). D-1, D-4, D-5, D-6, D-7 stand as approved. D-2 and D-3 are RE-DECIDED and AWAIT MAINTAINER APPROVAL.** Not buildable until they are approved. |
| Premise measured against | shipped **v5.60**, source `23877f903a14ba43dd707a43d98b0df4`, clone **`e1f7adb`**, 2026-09-03 |
| Parent findings | `MissingFeatures.md` **D-11 (c)** · `AUDIT_STATE_INCOME_BASES_ROUND5.md` (complete) · `AUDIT_STATE_EXCL65_ROUND4.md` §2a, §2b, §4 · `AUDIT_STATE_EXCL65_ROUND3.md` §4 |
| Kind | **Data-model feature.** Engine code changes. This is not a rule-table edit. |

> **Clone tag corrected.** This line previously read `33f699d`, which was accurate when written.
> Re-read from a fresh clone on 2026-09-03: `d590bcd` and `513f666` added this file and the ROUND5
> audit under `docs/`, and `e1f7adb` is an empty commit.

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

AST census against v5.60 — 4 hits, one definition and three calls:

| line | enclosing | notes |
|---|---|---|
| **1114** | *definition* | `function stateTaxAnnual({ code, fallbackRate, retIncome, pen, work, capGains, ssTaxableFed, ssGrossA, ssGrossB, ageA, ageB, single, persons65 })` |
| **3996** | `_estSaleGain` ← `run` ← `runRothStrategies` | the gross-up mirror |
| **4114** | `run` ← `runRothStrategies` | the Roth ladder engine |
| **5265** | `computeTaxPlan` | the main tax plan |

**The three call sites do not pass the same fields.** L3996 and L4114 fold pension and work into
`retIncome` (`Math.max(0, taxableOrd - ssT)`) and pass no `pen` or `work` at all; L5265 passes
`retIncome: rmdTax_y + conv_y`, `pen: pen_y`, `work: work_y + otherOrd_y` separately. Any income
measure built inside `stateTaxAnnual` from its own arguments must therefore be proven to **sum to
the same thing** across all three, or the app answers one statutory question three ways.

### 2.2 ⚠ THE FINDING — the app already carries FOUR different MAGI definitions, and nothing compares them

| line | context | definition |
|---|---|---|
| 4102 | Roth ladder engine | `grossOrd + qdcg` |
| 4491 | `computeIrmaaPlan` | `ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` |
| 4952 | `computeWithdrawalPlan` | `taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + othOrdDraw + conv_y + capGain_y` |
| 9047 | a render block | `pension + spouseBWork + taxableSS + conv_y + rmd_y + _divLadder` |

**No suite asserts these agree.** Eighteen suite files mention `magi`; none contains a parity,
equality or agreement assertion across engines. `METHODOLOGY.md` already documents one divergence —
the ladder's MAGI omits dividend income and realized capital gains that the IRMAA engine includes —
and calls it "a separate and larger correction."

**Why this matters here.** v5.43 closed exactly this class for §86: the app was "answering one
statutory question two ways depending on which tab was open." Hanging a state income threshold off
the nearest available MAGI would recreate that defect on a new statute.

**So the hard part of this feature is not the `STATE_RULES` field. It is defining the state-income
measures and proving all three call sites compute them identically.**

### 2.3 What `STATE_RULES` can hold today — re-measured 2026-09-03

51 entries. **Six fields on every entry** (`name`, `rate`, `ss`, `retExempt`, `excl65`, `note`) and
**two optional fields already present**: `exclAge` on **4** states (DE, KY, RI, WI) and `ssOffset` on
**2** (ME, MD).

> ⚠ **This section previously said "nothing in the table is nested, so a band table would be the first
> non-scalar value."** True about nesting, but it understated the precedent. **`ssOffset` carries no
> data — it selects behaviour** inside `_one` at L1145–1148, branching the exclusion computation for
> Maine and Maryland. A shape discriminator is the generalisation of something the table already does.

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

| site | what |
|---|---|
| `stateTaxAnnual` L1114 | signature gains nothing new — both measures are expressions over existing arguments; `_floor`/`_cap` logic gains a band lookup and a taper |
| call sites L3996 / L4114 / L5265 | must be **proven** to sum to the same measure; no new parameters |
| `STATE_RULES` | **new optional field, ADDITIVE** — on NM, RI, VA, NJ, CT |
| notes for those states | all five disclose the limitation as unmodelled; all five must be rewritten. **RI's also carries a wrong figure** |
| `t10` §2E | whole-table assertions, the F-6 guarded set (NJ, NM, RI, VA), the note-vs-code invariant — **see §7 D-3, this constrains the field's design** |
| `t29` L212 | the F-6 empty-set guard — same constraint |
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
> **D-2 and D-3 were invalidated by ROUND5 and are re-decided below. They await approval.**

### D-2 · One income base, or per-state bases? — **RE-DECIDED, awaiting approval**

The 2026-09-02 recommendation was *one base now, with divergence disclosed*. ROUND5 killed it: three
statutes name three bases and two of them exclude Social Security. But the PARTIAL draft's
replacement reading — per-state base selection — overstated the cost.

**Reduced to the terms `stateTaxAnnual` already receives, there are exactly two measures:**

| model base | expression | states |
|---|---|---|
| `agi` | `retIncome + pen + work + capGains + ssTaxableFed` | NM, RI, CT |
| `agiExSS` | `retIncome + pen + work + capGains` | VA, NJ |

**Options.**
(a) One base, as approved — **now known wrong**; for a couple with $40,000 of Social Security it moves
the measure across a cliff in two states.
(b) **Two bases selected by a per-state `base` field** — one extra term, one extra field, no new
arguments, both expressions self-contained inside `stateTaxAnnual`.
(c) Five per-state bases modelling each statute's own definition — needs NJ gross-income categories
the model does not carry, for a difference that does not move a mainstream household.

**Recommendation: (b).** It is exact for Virginia, close for New Jersey, and it keeps D-1 and D-5
intact because both expressions live in one function. **The residual gap is disclosed, not modelled**:
New Jersey's true gross income differs from `agiExSS` in ways the model cannot see, and neither
measure carries dividend or interest income at all — an **optimistic** direction that must be said
out loud in every populated state's note.

### D-3 · Cliff-only shape, or a general band table? — **RE-DECIDED, awaiting approval**

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

**Recommendation: (b).** Additive matches the `exclAge` and `ssOffset` precedent, keeps the guards
meaningful, and leaves an unpopulated state behaving exactly as today, which is what D-6 requires.
The cost is one redundant scalar per populated state; the alternative is a green suite that has
stopped checking the thing it was written for.

**⚠ One consequence to accept openly.** Every threshold in all five statutes is per filing status —
MFJ, single, MFS, and for CT head of household. The model carries only a `single` boolean. **Two
columns are all that can be expressed**, and the MFS and head-of-household figures must be disclosed
as unmodelled rather than folded silently into one of the two.

---

## 8 · Build record

*(empty — this scope has not been built)*

---

*Destination: `docs/SCOPE_INCOME_CONDITIONING.md` in the repo, and the knowledge pool — replacing the
2026-09-02 copy in both.*
