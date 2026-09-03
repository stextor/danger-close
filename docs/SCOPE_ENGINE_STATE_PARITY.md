# SCOPE — the three engines share one state-tax calculator and disagree anyway

| Field | Value |
|---|---|
| Premise verified against | source `7e1a02881256142c5b9206045e76e2ec` (v5.61) · clone `f28fe42` · pool 2026-09-03 |
| Written | 2026-09-03 |
| Origin | the measurement `SCOPE_INCOME_CONDITIONING.md` §6 requires, run before building that field |
| Shipping as | **v5.62, alone** |
| Status | **AWAITING MAINTAINER DECISION** — §6. Not built. |
| Blocks | `SCOPE_INCOME_CONDITIONING.md`. Its parity invariant cannot be written until this lands. |

---

## 1. Premise — measured against the shipped source, not reasoned

`stateTaxAnnual` (L1114) grants the state retirement exclusion to `retIncome + pen` and adds `work`
**outside** it:

```
retBase = retExempt ? 0 : max(0, retIncome + pen − excl)
return   r.rate * (retBase + max(0, work) + ssBase + max(0, capGains))
```

The three call sites do not fill those arguments the same way.

| call site | engine | what it passes |
|---|---|---|
| **L5265** | Taxes / Withdrawal | `retIncome: rmdTax_y + conv_y`, `pen: pen_y`, `work: work_y + otherOrd_y` — **gross components** |
| **L3996** | Roth comparator (C) | `retIncome: max(0, taxableOrdC − ssTC)`, **no `pen`, no `work`** |
| **L4114** | Roth comparator (B) | `retIncome: max(0, taxableOrd − ssT)`, **no `pen`, no `work`** |

**Two defects, not one.**

**1a · Decomposition.** L3895 is `const base = pen + work + rmd`, so wage income *is* in the sum the
Roth engines pass as `retIncome`. **They therefore grant the state retirement-income exclusion to
wages.** In the five `retExempt` states (IL, MI, MS, IA, PA) retirement income is fully exempt, so
the Roth engines exempt the household's **wages** entirely.

**1b · Deduction netting, and this is the larger term.** `taxableOrd` is `max(0, grossOrd − ded)` —
**after the federal standard deduction**. The Roth engines net a *federal* deduction off a *state*
base. `METHODOLOGY.md` L125–152 states the state layer is *"an effective flat approximation of the
(often progressive) schedule for a typical retiree"* and lists **standard deductions among the things
not modelled**. So this is wrong twice: the wrong jurisdiction's deduction, and a deduction the
methodology disclaims.

⚠ **An earlier reading of this scope's own author reported 13 states and a $1,540 maximum. That was
wrong** — it treated `taxableOrd` as gross. Corrected below.

### Measured, on one household

67/67 couple · $28,000 part-time wages · $18,000 pension · $22,000 RMD · $8,000 qualified
dividends and gains · $18,000 taxable SS · federal standard deduction $33,200.

| | diverging states | largest gap | direction |
|---|---|---|---|
| decomposition only (ded = 0) | 13 of 42 | $1,540 (NJ) | Roth engines under-tax |
| **with the deduction modelled** | **42 of 42** | **$2,656 (OR)** | **Roth engines under-tax** |

**Every divergence has the same sign.** Roth-conversion and break-even output is therefore
**optimistic** relative to the model's own Taxes tab — against the project's conservative-direction
rule, in an output a user acts on.

### 1c ⚠ `METHODOLOGY.md` asserts the opposite, and that is probably why nobody looked

> One shared calculator serves the Taxes engine, the Roth strategy comparator, and the Withdrawal
> engine, **so the three can never disagree.**

They share the calculator but not the arguments. The sentence is false and it reads as a guarantee.

### 1d ⚠ A second, unrelated stale line in the same list

L153 still says RI's and WI's *"full-retirement-age (67) floors are not applied — the model starts
both at 65"*. **v5.60 applied them** (`exclAge: 67`), and L136 of the same file says so. The document
contradicts itself; L153 is the stale half.

### 1e The suite is completely blind to this

The fix was built in a scratch source and every suite touching Roth or state tax was run against it:
**t3 36 · t4 252 · t23 25 · t26 25 · t32 12 · t10 240 · t2 35 · t7 41 · t8 40 — all passing, zero
checks moved.** Nothing pins Roth-engine state tax at all. That is why a divergence in all 42 taxing
states survived to v5.61, and it is the real content of this release.

---

## 2. ⚠ A third divergence, which this release does NOT fix

`otherOrd_y` — non-work ordinary streams such as rental or annuity income — is computed **only** in
the Taxes engine (L5160). The Roth engines' `base = pen + work + rmd` never carries it.

Measured after the call-site fix:

| household | states still diverging | largest |
|---|---|---|
| no other ordinary income | **0 of 42 — exact parity** | — |
| $12,000 other ordinary income | **42 of 42** | $960 (OR) |

**Fixing that means adding `otherOrd` to the Roth engines' `base`, which changes `ord` — and so
federal tax, Social Security taxation, IRMAA, and bracket-fill conversion sizing.** That is a
modelling change with a wide blast radius needing hand-verified cells, not an argument-shape fix.
**Out of scope; see D-b.**

---

## 3. Site census — resolved from source

| site | change |
|---|---|
| `stateTaxAnnual` L1114 | **none.** Signature and body unchanged. |
| L3996 (engine C) | pass `retIncome: rmd + c`, `pen`, `work` — gross, matching the Taxes engine |
| L4114 (engine B) | pass `retIncome: rmd + conv`, `pen`, `work` |
| L5265 (Taxes) | **none — this is the correct one** |
| `METHODOLOGY.md` L~147 | delete the "can never disagree" claim; state what actually guarantees agreement |
| `METHODOLOGY.md` L153 | remove the stale RI/WI age-65 clause (§1d) |
| version bump | four in-app sites; suite cost re-derived, never quoted |

Confirmed in scratch: `rmd`, `conv`, `c`, `pen`, `work` are all in lexical scope at both call sites,
and both builds compile.

---

## 4. Explicitly out of scope

- **`otherOrd` in the Roth engines** (§2) — its own release, and it must be next.
- **The income-conditioning field.** D-2 (b, named-string `base`) and D-3 (b, additive) are approved
  and wait on this.
- **The four-way MAGI divergence**, the `ss: 0.5` blend, Connecticut, any state's rate or `exclAge`.
- **Any in-app note about the fix.** Numbers correct themselves on the next run; see D-c.

---

## 5. Tests this ships with

- **The cross-engine parity invariant.** The same household priced through all three call sites must
  yield the same state-income measure and the same state tax, across **every** state in
  `STATE_RULES`, not a sample. This is the release's reason to exist.
- **A companion pin for the §2 gap**: with other ordinary income present the engines still differ, by
  a stated amount, marked `[KNOWN DEFECT pre-otherOrd]`. It flips when that release lands. Writing
  parity without this would either fail or be quietly narrowed to hide it.
- **Hand-computed cells** — computed independently to the dollar, not read and judged plausible — for
  a `retExempt` state (wages must be taxed) and a large-exclusion state (the exclusion must not spill
  onto wages).
- **An extinction invariant**: no `stateTaxAnnual` call site may pass a post-deduction figure as
  `retIncome`. Generalises the defect rather than pinning today's numbers.
- **Negative controls** per §B2, each failure read individually: revert each call site separately;
  revert only the deduction netting; and a null control.

---

## 6. Decisions

**D-a · Confirm the Taxes engine is the correct one.**
`METHODOLOGY` says effective-rate approximation with standard deductions not modelled, which settles
it on the document. **Recommendation: yes, and verify against two statutes during the build** — the
claim "state retirement exclusions do not cover wages" is statutory and this project has been burned
once already by treating a plausible reading as verified.

**D-b · Does v5.62 also add `otherOrd` to the Roth engines?**
**Recommendation: no.** It changes federal tax and conversion sizing; bundling destroys attribution
and makes the parity invariant's first appearance depend on a much larger change. Ship it next, with
its own hand-verified cells. The `[KNOWN DEFECT]` pin keeps it visible.

**D-c · Any in-app disclosure?**
**Recommendation: no in-app note; magnitude in the CHANGELOG.** The numbers self-correct on the next
run, and a note about a fixed defect is clutter. *(Approved 2026-09-03.)*

**D-d · Correct `METHODOLOGY` in this release?**
**Recommendation: yes** — the false "can never disagree" sentence is the disclosure half of the same
defect. Also fix the stale RI/WI line (§1d) while the file is open, disclosed as a separate
correction rather than folded in silently. *(Approved 2026-09-03.)*

---

## 7. Build record

*(empty — this scope has not been built)*

---

*Destination: `docs/SCOPE_ENGINE_STATE_PARITY.md` in the repo, and the knowledge pool. Commit it
before the build, as `SCOPE_RI_THRESHOLD_CORRECTION.md` and `SCOPE_MANIFEST_D4.md` were.*
