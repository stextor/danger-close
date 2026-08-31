# SCOPE — the Social Security offset: Maryland and Maine

| Field | Value |
|---|---|
| Premise verified against | **v5.55** · source `31761794c4c69ec255ca5cd856d48b8f` · tree `6a23758` |
| Written | 2026-08-29 |
| Origin | `AUDIT_STATE_EXCL65_NOTES.md` §1 — MD and ME reduce the exclusion by Social Security received; disclosed at v5.54, not modelled |
| Shape | **Modelling change. Figures move UP — this is the optimistic error being corrected.** Version bump. |
| Status | **RETIRED — SHIPPED AS v5.56, 2026-08-30** |
| Handover | `STOP-REPORT-v5_56-session-budget.md` — the halt this scope survived; history, not live |

> ## ⛔ RETIRED — SHIPPED AS v5.56, 2026-08-30 · source `b191cc577646faa138ffc6149a0aa646`
>
> All six decisions resolved and built. **D-a** `ssOffset: true` on MD and ME only, **D-b** the
> exclusion computed per person and summed, **D-c** both stale caps corrected in the same release
> (MD `36200 → 40600`, ME `35000 → 48216`), **D-d** Maine's phaseout OUT and disclosed, **D-e**
> Colorado OUT and its `ss: 0.5` contradiction still disclosed rather than resolved, **D-f** a
> `boundaries.mjs` row keyed on the flag rather than on note prose.
>
> **Three things this scope did not anticipate, all found by negative control at the ship and all
> fixed in the same release.** The build the scope produced was correct at the engine and left
> three holes around it: the Field Manual and `METHODOLOGY.md` both still said *the model applies
> none of that* and that MD's and ME's amounts *trail the current statutory figures*, three
> sentences this release falsified and did not rewrite; nothing in the suite reached the three
> engine call sites, so destroying the offset in every engine failed zero checks; and the new
> `boundaries.mjs` row had no assertion at all. See `CHANGELOG.md` v5.56.

**Baseline confirmed by command:** **2,785 app checks / 0 failing** (v5.54 leg 1,048 · v5.55 leg
1,059 · parity 10/10 · feature once 668), tooling 82, run from a clean clone of `6a23758`.

---

## 1. What this ships

`stateTaxAnnual` learns that some states reduce the exclusion by the Social Security a person
actually received, and applies it **per person** for Maryland and Maine.

This is the **third** of the three mechanisms the 65+ exclusion class is wrong in. v5.54 disclosed
all three, v5.55 fixed the age gate, `t10` §2E pins the income-limit gap. This one is the last of
the three, and **the only one whose direction is optimistic** — it currently overstates the
exclusion and understates state tax.

## 2. Premise, verified by parser against `31761794…`

**The exclusion line as it stands, L1132-1136:**

```
L1132   const _floor = (r.exclAge === undefined || r.exclAge === null) ? 65 : r.exclAge;
L1133   const _qual  = (ageA === null && ageB === null)
L1134     ? Math.max(0, persons65)
L1135     : ((ageA !== null && ageA >= _floor ? 1 : 0) + (single ? 0 : (ageB !== null && ageB >= _floor ? 1 : 0)));
L1136   const excl   = (r.excl65 || 0) * _qual;
```

⚠ **`_qual` IS A COUNT, AND THAT IS THE OBSTACLE.** A per-person SS offset needs
`max(0, cap − thatPerson'sSS)` for **each** qualifying person separately. A count cannot express
that: two people with $10,000 and $50,000 of SS do not yield the same total as two people with
$30,000 each. **The exclusion line must become per-person, not a multiplication.** This is a
larger change to that line than v5.55 made, and it is the reason §7's D-b exists.

**What the function receives today** — `ssTaxableFed`, used once:

```
L1140   const ssBase = (r.ss || 0) * Math.max(0, ssTaxableFed);
```

⚠ **`ssTaxableFed` IS THE WRONG QUANTITY FOR THIS JOB.** It is the *federally taxable* portion, at
most 85% and often far less. **Both MD and ME reduce by SS actually received — gross, including the
nontaxable part.** Maine's own wording is explicit that it counts *taxable and nontaxable* benefits.
Using `ssTaxableFed` would under-apply the offset and leave the model still optimistic.

**Gross SS is already in scope at every call site, per-spouse** — confirmed at both engines:

| Engine | Line | Binding |
|---|---|---|
| A | L3841 | `const ss = ssA_y + ssB_y;` |
| B | L5134 | `const ssTotal = ssA_y + ssB_y;` |

⚠ **Both sites apply a widowhood collapse IMMEDIATELY BEFORE** — `if (widowed) { ... ssA_y = ...;
ssB_y = ...; }` — which zeroes the deceased spouse and gives the survivor the larger benefit. **Any
per-spouse value must be read AFTER that block**, or a survivor's offset will be computed against a
benefit they no longer receive. Reading the raw `annualSSA(yr)`/`annualSSB(yr)` would be wrong.

**Three call sites**, all already passing per-spouse context after v5.55:

```
L3982   ssTaxableFed: ssTC,      ageA: _ageAc, ageB: _ageBc, single: !!P.single,
L4100   ssTaxableFed: ssT,       ageA: _ageAs, ageB: _ageBs, single: !!P.single,
L5251   ssTaxableFed: ssTaxable, ageA, ageB, single: !!effSingle,
```

**So the plumbing v5.55 built is sufficient and no new threading is required** — two more named
values join an argument list that already carries per-spouse data.

## 3. The facts, from primary sources already recorded

| | Maryland | Maine |
|---|---|---|
| Source | Comptroller of MD, *Maryland Pension Exclusion* KB0010012; Worksheet 13A | Maine Revenue Services *Individual Income Tax FAQ*; 2025 Form 1040ME instructions |
| Model `excl65` | **36,200** | **35,000** |
| Statute | **$40,600** (CY2026) — stale by $4,400 | **$48,216** (TY2025) — stale by $13,216 |
| Offset | reduced **dollar-for-dollar by all SS and Railroad Retirement received**; if SS exceeds the cap the exclusion is **zero** | reduced **dollar-for-dollar by all taxable AND nontaxable SS and RR benefits** |
| Also | traditional IRA does not qualify — disclosed, not modelled | **income phaseout above $125K single / $250K MFJ AGI, new for TY2025** |
| `ss` factor | 0 | 0 |

**Worked example, Maryland, both 65+, each receiving $40,000 of SS:** statute gives an exclusion
near **$0**; the model grants **$72,400**. At MD's 7.5% effective rate that is roughly **$5,430 a
year** of state tax the model does not charge.

⚠ **Maine's direction is MIXED and it is the least safe of the two to reason about casually.** The
stale $35,000 *under*-excludes (pessimistic); ignoring the offset *over*-excludes (optimistic).
Which dominates depends on the household — which is exactly why D-c must be decided rather than
assumed.

## 4. Tests it ships with

In `t10` §2E, alongside the D-3c and age-floor sets, **gated to the new tag** with a
`[KNOWN DEFECT pre-vNNN]` else-branch pinning current behaviour so the flip is self-verifying:

- **MD dollar-exact**, hand-computed both ways, at three SS levels: zero SS (offset inert, exclusion
  full), SS below the cap (partial), SS above the cap (exclusion floors at zero, not negative).
- **ME dollar-exact** at the same three levels.
- **Asymmetric spouses** — the case a count cannot express. Two qualifying people with different SS
  must not equal two people with the averaged amount.
- **Gross, not taxable.** A household whose gross SS exceeds the cap but whose *taxable* portion
  does not must still get a zero exclusion. This is the assertion that fails if someone wires
  `ssTaxableFed` in by mistake.
- **Widowhood.** After a death the survivor's offset uses the survivor's actual benefit.
- **Extinction invariants:** no state carries an `ssOffset` flag without a note saying so; the
  states that do *not* carry it are unchanged; **the D-3c NJ pins and the v5.55 age-floor set must
  not move.**

## 5. Site census — what this touches

| File | Sites | What |
|---|---|---|
| `src/DangerClose.jsx` | L1114 | signature — gains the per-spouse gross-SS parameters |
| | L1132-L1136 | **the exclusion line becomes per-person** |
| | L3841, L3982 · L4100 · L5134, L5251 | pass gross SS after the widowhood collapse |
| | `STATE_RULES` MD, ME | offset flag, and possibly the amounts (D-c) |
| | `DOCS_HTML` §13 | disclosure |
| `METHODOLOGY.md` | state-tax section | modelling change — mandatory |
| `qa/t10_taxcases.mjs` | §2E | new set; the D-3c and age sets must not move |
| `qa/tools/boundaries.mjs` | — | see D-f |

**Bump cost, measured twice and not to be rediscovered: 62 gated expressions and 15 registries**,
each decided individually. Two are ternary lookups (`t1` `verStr`, `t4` `_badge`) needing a NEW ARM.
⚠ **`t31` has THREE version lists** — `KNOWN_VERSIONS`, `POST`, `ORDER` — and rolling two fails six
checks silently. ⚠ **New assertions must be gated from the start**; v5.55 shipped them ungated and
failed the frozen leg nine times.

## 6. What must not break

- **Parity 10/10.** Both engines must move identically.
- **The `t10` §2E D-3c pins** (NJ, 65+, no SS in the case) and **the v5.55 age-floor set** (KY/DE,
  no SS in the cases). Neither involves SS, so neither should move. **Verify; do not assume.**
- **The 47 states with no offset**, and the `ss: 0.5` partial-SS states, which use a different
  mechanism entirely and are not touched here.

## 7. Open decisions — Steve

**D-a · Where does the offset flag live? RECOMMEND: `ssOffset: true` on `STATE_RULES`, absent for
the 49 states that do not have one.** Same shape as v5.55's `exclAge`, which worked; the rule table
is where per-state facts live.

**D-b · The exclusion line must become per-person (§2). RECOMMEND: compute a per-person exclusion
for A and B separately and sum, replacing `excl65 × _qual`.** The count survives only in the
legacy `persons65` fallback path, which cannot do an offset at all and should return the
unoffset exclusion as it does today.
⚠ **This rewrites the line v5.55 just rewrote.** It is the third change to that expression in three
releases and the place a defect is most likely to be introduced.

**D-c · Do the stale AMOUNTS get fixed in the same release? RECOMMEND: YES for both.** Normally I
would split axes, but here they interact and splitting is the riskier order: adding the offset to a
stale $35,000 makes Maine's *mixed* direction harder to reason about, not easier, and the correct
figures are already sourced and already disclosed in the notes. Fixing both together means the note
stops saying *"the modelled amount trails the current figure"* in the same release the offset lands.
*Alternative:* offset only, amounts later. Cheaper to verify per release, but leaves Maine in a
state where neither error is fully characterised.

**D-d · Maine's income phaseout ($125K single / $250K MFJ)? RECOMMEND: OUT, and disclosed.** That is
the D-3c income-limit mechanism, not this one. Mixing it in means two mechanisms in one release,
and D-3c is unfixed for NJ, VA and RI as well — it deserves its own scope covering all of them.

**D-e · Colorado? RECOMMEND: OUT, explicitly.** CO is a **shared cap** — one $24K allowance covering
SS *and* pension, which do not stack — not a dollar-for-dollar offset. It is a third mechanism
wearing similar words. **CO also still carries `ss: 0.5` against a note saying 65+ deduct all
federally-taxed SS**, a contradiction v5.54 disclosed and deliberately did not resolve. Do not
reword the note to match the code. CO needs its own decision once the shared-cap mechanics are
written down.

**D-f · Does `boundaries.mjs` gain a row for this class? RECOMMEND: YES.** The audit's own finding is
that `state_excl_limited` keys on *"a note flagging an income limit"* and therefore reads **OFF** for
MD, ME and CO — *"a gate that cannot see the thing it gates reports green either way."* Shipping the
offset without a boundary row repeats that. ⚠ **Whatever predicate is chosen must not key on note
prose** — that is what made the NJ rewording break `t29` F-7 at v5.54. Key on `ssOffset`.

---

## 8. Explicitly out of scope

- **Colorado**, per D-e — including its `ss: 0.5` contradiction.
- **Maine's income phaseout**, per D-d.
- **D-3c income limits** for NJ, VA, RI — still pinned in `t10` §2E.
- **NJ's 62 floor and household cap** — both axes together or neither, and this is neither.
- **The 11 unverified states**, and **Delaware HB 108** and **Kentucky's 2026 rate**, which outrank
  any new state — see `AUDIT_STATE_EXCL65_ROUND2.md` §3.
- **Railroad Retirement as a distinct income type.** Both statutes name it alongside SS; the model
  has no RR concept and this scope does not add one. Disclose, do not model.
