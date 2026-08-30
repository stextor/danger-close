# SCOPE — the state exclusion age gate: a per-state floor and per-spouse ages

> ## ⛔ RETIRED — SHIPPED AS v5.55, 2026-08-29 · source `31761794c4c69ec255ca5cd856d48b8f`
>
> All six §7 decisions resolved and built. **D-a** `exclAge` on `STATE_RULES`, **D-b** ages passed
> and the floor applied internally, **D-c the CORRECT route** — full exclusion from the state's own
> floor, chosen over the conservative default by explicit decision, **D-d** SC's tier out and
> disclosed, **D-e** NJ left at 65 and disclosed, **D-f** built now rather than after the remaining
> states.
>
> **Suite 2,768 → 2,785, 0 failing. Parity 10/10** — the evidence both engines moved identically.
>
> **§2's central claim held:** per-spouse ages were already in scope at all three call sites, so the
> refactor was local rather than plumbing. **§2's correction to the handover held too** — there is
> no `ssGross`; Engine A binds `ss` at L3829 and Engine B binds `ssTotal` at L5119.
>
> **Two things this scope did not foresee.** Its §6 said the new assertions would need a gate "or
> the frozen prior leg gets asserted against a fix it predates" — and they shipped ungated first
> and failed that leg 9 times, exactly as written. And §5's site census missed that `t31` has a
> THIRD version list, `ORDER`, whose omission fails 6 checks silently.


| Field | Value |
|---|---|
| Premise verified against | **v5.54** · source `2e27826c495d3d70ca49ccf71cf238ec` · tree `67b6cf3` |
| Written | 2026-08-29 |
| Origin | `docs/AUDIT_STATE_EXCL65_ROUND2.md` §0 — the model has one age gate, the states have at least four |
| Shape | **Modelling change. Figures move. Version bump.** |
| Status | **⛔ RETIRED — BUILT AND SHIPPED AS v5.55, 2026-08-29** |

**Baseline confirmed by command this session**, not carried forward: **2,768 app checks / 0 failing**
(v5.53 leg 1,045 · v5.54 leg 1,045 · parity 10/10 · feature suites once 668), tooling 82, run from a
clean clone of `67b6cf3`. Source and built artifact unchanged from the v5.54 ship.

---

## 1. What this ships

`stateTaxAnnual` learns **two** things it does not currently know: what age a given state's exclusion
starts at, and **how old each spouse is** rather than how many are over 65.

**It fixes the age gate. It does not fix the two other mechanisms** — income limits (D-3c) and the
Social Security offset — both of which are disclosed at v5.54 and pinned in `t10` §2E. This scope
builds the interface those will need and deliberately stops there.

## 2. Premise, verified against source by parser

`census.cjs` on `2e27826c…`, not grep, not recall.

**The gate itself** — `stateTaxAnnual` L1114, parameter `persons65`, used exactly once:

```
L1123   const excl = (r.excl65 || 0) * Math.max(0, persons65);
```

**Three call sites, and every one computes the count locally from per-spouse ages that are
ALREADY IN SCOPE:**

| Line | Enclosing scope | Engine | Count computed at | From |
|---|---|---|---|---|
| L3968 | `_estSaleGain` < `run` < `runRothStrategies` | **A** | L3935 `_p65c` | `P.dobAYr`, `P.dobBYr`, `yr`, `P.single` |
| L4085 | `run` < `runRothStrategies` | **A** | L4081 `_p65` | same |
| L5234 | `computeTaxPlan` | **B** | L5230 `_persons65` | `ageA`, `ageB`, `effSingle` |

```
L3935/L4081   ((yr - P.dobAYr) >= 65 ? 1 : 0) + (P.single ? 0 : ((yr - P.dobBYr) >= 65 ? 1 : 0))
L5230         (ageA >= 65 ? 1 : 0) + (effSingle ? 0 : (ageB >= 65 ? 1 : 0))
```

**This is the finding that sizes the job.** The v5.54 handover described the work as *"a per-spouse
replacement for `persons65`"*, which reads like threading new state through two engines. It is not.
**Per-spouse ages are already available at all three sites; only the literal `65` and the shape of
what is passed need to change.** The refactor is local.

⚠ **`65` is hardcoded at all three sites** and nowhere else in this path.

⚠ **THERE IS A SECOND `persons65` AND IT IS NOT THIS ONE.** `computeTaxPlan` L5191 computes its own
`persons65` for `seniorBonus`, the **federal** senior deduction, four lines before the state one at
L5230. They are different quantities with almost the same name in the same function. **Conflating
them would silently apply a state age floor to a federal deduction.** Any edit here must name which.

### For the SS offset that follows — corrected

The v5.54 handover states the offset *"needs `ssGross` (both engines already bind it: A L3829, B
L5119)"*. **There is no `ssGross` in the source — 0 AST hits.** The substance is right and the
identifier is wrong. What is actually bound, at exactly those lines:

```
A  L3829   const ss      = ssA_y + ssB_y;
B  L5119   const ssTotal = ssA_y + ssB_y;
```

Better than claimed: **the per-spouse halves `ssA_y` and `ssB_y` are in scope at both**, which the SS
offset will need because Maryland and Maine reduce the exclusion by *each person's* SS. Note both
sites apply a widowhood adjustment immediately before, collapsing the pair to the survivor's larger
benefit — per-spouse logic must run after that, not before.

`stateTaxAnnual` currently receives `ssTaxableFed`, the federally-taxable portion, **not gross SS**.
The offset will need a new parameter regardless. It is not added here.

## 3. The evidence this is needed

From `AUDIT_STATE_EXCL65_ROUND2.md` and its predecessor, all primary-sourced:

| State | Statutory threshold | Model | Effect on a household in the gap |
|---|---|---|---|
| **KY** | **none** | 65 | $31,110/person withheld at every age below 65 |
| **DE** | **60** | 65 | $12,500/person withheld from 60 to 64 |
| **NJ** | **62** | 65 | $75,000/person withheld from 62 to 64 |
| **SC** | **tiered** — $10K under 65, $15K at 65+ | 65 | the under-65 tier does not exist in the model |

**Direction: conservative.** It overstates state tax. That is the opposite of every v5.54 finding,
and it is the direction this project prefers to be wrong in — which is exactly why it has survived
undisclosed. **It lands on ages 60-64, the early-retirement band this app exists to model.**

⚠ **11 of 19 exclusion states are still unchecked.** More thresholds will surface. The design must
tolerate that without another refactor — which is §7's first decision.

## 4. A second axis this scope must decide about, not discover later

New Jersey's exclusion is a **HOUSEHOLD** cap, not per-person — v5.54's own note says so:
*"$100,000 (2026) HOUSEHOLD exclusion at 62+, not per-person."* The model computes
`excl65 × count`, which is **structurally per-person for every state**.

So NJ is wrong on **two** axes at once: the age (62 vs 65) and the multiplication (household vs
per-person). Fixing only the age would make NJ *more* wrong for a 62-64 couple — it would grant
$150,000 where the statute grants $100,000, widening the D-3c gap the `t10` §2E pins measure.

**This is a stop-and-decide, not a build-and-see.** See D-e.

## 5. Site census — what this touches

| File | Sites | What |
|---|---|---|
| `src/DangerClose.jsx` | L1114, L1123 | `stateTaxAnnual` signature and the exclusion line |
| | L3935, L3968 | Engine A, `_estSaleGain` path |
| | L4081, L4085 | Engine A, `run` path |
| | L5230, L5234 | Engine B, `computeTaxPlan` |
| | L1029-L1079 | `STATE_RULES` — 51 entries, if a field is added |
| | `DOCS_HTML` §13 | disclosure, if the fix changes what is disclosed |
| `qa/t10_taxcases.mjs` | §2E | new assertions; **the D-3c pins may move — see §6** |
| `qa/tools/boundaries.mjs` | `state_excl_limited` | unchanged, but see §6 |

**Version-bump cost, measured at v5.54 and not to be rediscovered: 62 gated expressions across the
suite plus 14 `KNOWN_VERSIONS` registries**, each decided individually. Two of the 62 are ternary
lookup tables (`t1` `verStr`, `t4` `_badge`) needing a NEW ARM, not an extended condition.

## 6. What must not break

- **Parity 10/10.** Both engines compute state tax and both must move identically. Parity compares A
  against B, so a correct change keeps it at 10/10 — **but if it moves, the two engines have
  diverged and that is a stop, not a rebaseline.**
- **The `t10` §2E D-3c pins.** They assert the model understates NJ by $1,050.00 / $3,026.25 /
  $5,947.50 for a **65+** couple. This scope changes NJ's floor to 62, which does **not** move a
  65+ household — so the pins should hold unchanged. **Verify that; do not assume it.** If they
  move, the fix has reached further than intended.
- **`t10` §2E's existing `excl65` archetype** (AL, MFJ vs single) asserts per-person behaviour at 65.
  AL's statutory floor is 65, so it should be untouched — again, verify.
- **The `_v` gate.** Any assertion this release changes needs a version gate per §B2, or the frozen
  prior leg gets asserted against a fix it predates.

## 7. Open decisions — Steve

**D-a · Where does the age floor live? RECOMMEND: a new optional field on `STATE_RULES`,
`exclAge`, defaulting to 65 when absent.** Only the states that differ carry it, so 47 of 51 entries
are untouched and the diff stays readable. The rule table is already where per-state facts live.
*Alternative:* a separate lookup keyed by state code. Rejected — a second table that can disagree
with the first is the failure mode this project keeps paying for.

**D-b · What does `stateTaxAnnual` receive? RECOMMEND: the two ages, `ageA` and `ageB`, plus a
`single` flag — and it computes the count internally against the state's floor.** The threshold
then lives with the rule table rather than being duplicated at three call sites.
*Alternative:* keep passing a count, computed per-site against a looked-up floor. Rejected — it puts
rule-table knowledge in three places, and the three are in two different engines.
⚠ **Either way this is a signature change to a function with three call sites, and `persons65` is
also a parameter name that appears in the same function as an unrelated federal quantity.**

**D-c · What happens between a state's floor and 65 — full exclusion, or nothing? RECOMMEND: full
exclusion from the state's own floor.** That is what KY, DE and NJ statutes say. But note it makes
the model **less conservative**, which is a direction this project does not take by default. It is
correct rather than conservative, and the two conflict here for the first time.
*Alternative:* disclose the gap and leave it unfixed, as v5.54 did. Cheaper and keeps the
conservative bias, but leaves a known error in place for a second release.

**D-d · South Carolina's tiered rule — in or out? RECOMMEND: OUT, and disclosed.** SC is not an age
*floor*, it is two different amounts either side of 65. `exclAge` cannot express it and a second
field for one state is a poor trade. Its note already describes the tier, so the disclosure exists.
*Alternative:* a second field `excl65Under`. Rejected as premature until the 11 unchecked states say
how common tiering is.

**D-e · New Jersey is HOUSEHOLD, not per-person (§4). RECOMMEND: do NOT change NJ's floor to 62 in
this release.** Fixing the age alone makes NJ measurably worse for a 62-64 couple — $150,000 granted
against a $100,000 statutory cap — and would widen the gap the `t10` §2E pins measure. Either fix
both axes together or neither. **Both axes is a bigger job than this scope, so my recommendation is
neither: leave NJ at 65, and disclose why.**
*Alternative:* add a `exclHousehold` boolean in the same release. Doable, but it turns a
one-mechanism fix into a two-mechanism one, and NJ is the only state currently known to need it —
out of 8 checked, with 11 unchecked.

**D-f · Do the 11 unchecked states go first?** This scope is buildable now: four thresholds are
established and the design tolerates more. But every state checked so far has been wrong, and a
second bump to add more floors costs the 62 gates again.
*Recommendation: **build this now anyway.*** The design is additive — a new `exclAge` on a state is
a one-line data change, not a code change — so later states cost a data edit, not a refactor. The
62-gate cost is paid by the *bump*, and any correction release pays it regardless.

---

## 8. Explicitly out of scope

- **D-3c income limits.** Still pinned as `[KNOWN DEFECT]` in `t10` §2E. Not touched.
- **The SS offset.** §2 records what it will need and corrects the handover's identifier. Not built.
- **NJ's household cap**, per D-e's recommendation.
- **Any change to a state's `rate`, `ss`, `retExempt` or `excl65` value.** This scope changes *when*
  an exclusion applies, never *how much*.
- **The 11 unchecked states.** Separate work; see `AUDIT_STATE_EXCL65_ROUND2.md` §3 for the order,
  with Delaware HB 108 and Kentucky's 2026 rate ahead of any new state.
