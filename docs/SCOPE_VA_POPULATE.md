# SCOPE — populate Virginia's age deduction (`STATE_RULES.VA`)

**Status: ☑ RETIRED — FULFILLED AT v5.68, 2026-09-10.** Built as scoped; §9 is the build record, and it
records four places where this document was wrong. *(Prior status: BUILDABLE. All decisions resolved 2026-09-09.)* Two of them — D-VA-2 and D-VA-3 — were
recorded as resolved by the handover brief, **reopened by measurement**, and then re-resolved on the
re-measured evidence. §6 carries both, with what changed and why. Nothing here is waiting on anyone.

⚠ **The premise is measured against v5.67 and must be RE-MEASURED against whatever is shipped when
the build starts.** If any figure in §1, §4 or §6 fails to reproduce, that contradicts the premise:
**STOP and report** rather than adapting the scope.

**Measured against v5.67** — source md5 `ca05b2ece1af9dac3851837a0e96fbfa`, built `index.html`
`35fcca203418e3e10b11765e2c6ade93`, repo HEAD `8dc9160`. Suite at that build re-run in full this
session from a clean run folder: **3,377 app checks, 0 failing** (tooling `t21` 50 + `domdiff` 32
counted separately; GRAND 3,459). Every figure below was printed by a command in this session.

Parent scope: `docs/SCOPE_INCOME_CONDITIONING.md`. Statutory oracle: `docs/FINDINGS-v5_63-state-statutes.md`
§5, **transcribed here, not re-derived**.

---

## 1 · Premise, verified against the shipped source

`node qa/tools/state_rows.cjs v567.jsx VA` dumps `STATE_RULES.VA` at **L1160**:

```
name = "Virginia"   rate = 0.0575   ss = 0   retExempt = false
excl65 = 12000
(no exclTest, no exclAge)
note = "$12K 65+ age deduction, income-limited: reduced $1 for every $1 of adjusted federal AGI
        above $50K single/$75K married (the measure excludes Social Security); the model applies it
        unconditionally — overstates the deduction"
```

The note concedes the defect in its own words. Virginia is the third of the four optimistic states
to convert, and Rhode Island is the last.

**The `taper` evaluator already exists and is already tested.** `_fromTest` at **L1311** implements
`kind: "taper"` as `max(0, perPerson × _qual − max(0, m − threshold))`, and `t34` §D exercises it
against a **synthetic** jurisdiction — including **D-3**, which pins that the excess is subtracted
ONCE for a couple rather than per spouse.

⚠ **So the branch is neither dead nor untested — but no REAL state uses it.** All three populated
states (`CT`, `NM`, `NJ`) are `kind: "bands"`; the AST dump shows `exclTest` on exactly 3 of 51
entries. **Virginia is the first `taper` in `STATE_RULES`.** The build's job is therefore to prove
the **wiring**, not to re-prove the evaluator: `t34` proves the evaluator through a synthetic
jurisdiction, and only a `t10` household priced through `stateTaxAnnual` can prove Virginia.

## 2 · The statute (transcribed from FINDINGS §5 — do not re-derive)

**§ 58.1-322.03(5)(b):** $12,000 per individual born after 1 Jan 1939 who has attained 65, reduced
$1 for every $1 that **AFAGI** exceeds **$50,000 single / $75,000 married**. Not indexed since TY2004.

The Form 760 Age Deduction Worksheet settles the once-vs-twice question, which the statute alone does
not: Line 8 is AFAGI **combined for married taxpayers regardless of filing status**, Line 11 is the
excess **computed once**, Line 12 is the combined maximum, and Line 14 is `12 − 11`. The reduction is
**one subtraction against the combined maximum**, which is the `taper` shape exactly.

| | maximum | extinguished at AFAGI |
|---|---|---|
| single | $12,000 | **$62,000** |
| married, one spouse qualifying | $12,000 | **$87,000** |
| married, both qualifying | $24,000 | **$99,000** |

⚠ **A per-spouse taper is wrong by a factor of two through the whole phase-out range and correct
everywhere else**, so it passes a two-sided test. The both-spouses-in-range case is load-bearing.

**AFAGI is `agiExSS` exactly.** The in-source comment at L1268 says so — *"`agiExSS` … Virginia's
AFAGI exactly; New Jersey's gross income approximately."* That matters for how much the measure's
missing dividend/interest income costs: for New Jersey the base was already an approximation, but for
Virginia the **only** gap between the model's measure and the statute's is the absent dividend and
interest income, which is optimistic and must be disclosed in the note.

**Left unmodelled deliberately, not by omission:** those born on or before 1 Jan 1939 get $12,000
with no income test (age 87+ in 2026, outside the app's frame), and the age deduction cannot be
combined with the Disability Income subtraction.

## 3 · The table this release adds

```js
exclTest: { kind: "taper", base: "agiExSS", perPerson: 12000,
            threshold: { single: 50000, joint: 75000 } },
```

⚠ **No `cmp` key, and the B5 comparator question does not arise for Virginia.** `_fromTest` reads
`cmp` only on the `bands` branch (L1315). A taper is continuous: at exactly the threshold the excess
term is `max(0, 0) = 0` and the full deduction survives, which is what *"exceeds $50,000"* requires.
**Inclusivity is automatic here, not a choice** — so the threshold pin in §5 tests the `max(0, m − thr)`
clamp, not a comparator. Do not add `cmp` to make Virginia look like the other four.

## 4 · What moves for a user — measured, both directions checked

Priced through `stateTaxAnnual` at v5.67 against the statutory arithmetic, MFJ both aged 70, no SS,
no work, no gains:

| household | model today | statute | delta |
|---|---|---|---|
| MFJ, $60,000 retirement income (below threshold) | $2,070.00 | $2,070.00 | **no change** |
| MFJ, $75,000 (exactly at threshold) | $2,932.50 | $2,932.50 | **no change** |
| MFJ, $80,000 (inside the taper) | $3,220.00 | $3,507.50 | **+$287.50/yr** |
| MFJ, $99,000 (fully extinguished) | $4,312.50 | $5,692.50 | **+$1,380.00/yr** |
| Single, $55,000 (inside the taper) | $2,472.50 | $2,760.00 | **+$287.50/yr** |

**Every measured point moves the CONSERVATIVE way or not at all**, and the worst case reproduces the
~$1,380/yr figure the handover carried. **D-VA-5 holds: Virginia is conservative-only, unlike New
Jersey.** ⚠ If the build finds any household where Virginia's tax goes DOWN, that contradicts this
premise — **STOP and report** rather than adapting.

## 5 · What the build must ship

- **A `t10` case in each region of the taper** — below the threshold, inside it, and fully phased out
  — in **both** filing columns, priced to the dollar through `stateTaxAnnual`, **hand-computed before
  the engine is run**. The four cells above are a starting point, not the set.
  ⚠ **CORRECTED AT THE v5.68 BUILD.** Read literally this implies the single column contributes to the
  once-not-twice proof. **It cannot.** With one qualifying person `12,000 × 1 − excess` and
  `(12,000 − excess) × 1` are the same expression, so every single-filer and every one-spouse cell is
  structurally incapable of catching a per-spouse defect. Those cells pin the table; only
  **both-spouses-qualifying cells strictly inside the taper** discriminate. Measured, not argued:
  `controls_v568_va.py` C8 rewrites the evaluator per-spouse and turns 9 `[HAND v5.68]` lines red,
  **none** of them single-filer or one-spouse.
- **The once-not-twice pin, at household level.** `t34` D-3 proves it for the synthetic jurisdiction;
  Virginia needs its own, because a correct evaluator wired to a per-person call site would pass D-3
  and fail nothing. The both-spouses-qualifying case inside the taper range is the discriminating one.
- **The threshold boundary**, at exactly $50,000 single / $75,000 joint — testing the clamp, per §3.
- **An extinction invariant** in `t10`, in the shape `NM`'s and `NJ`'s carry: a step up the table must
  cost MORE than the rate on the income alone, so "the deduction is blind to income" cannot return.
- **`excl65` beside the table**, per §6 D-VA-2 once settled, with the invariant asserted either way.
- **Note rewritten** — the current note's closing clause becomes false the moment this ships, and it
  must disclose the missing dividend/interest income in the measure (the one remaining gap, §2).
- **Negative controls**, drift-safe, each mutant built from a pristine copy, each carrying a needle.
- **`t10:1133`'s oracle path comment** (D-VA-4): it names `qa/oracle_nm.py`; the file is at
  `qa/tools/oracle_nm.py`. A suite edit, and this release is already touching the suite.
  ⚠ *Line number stale when written: at v5.67 the comment is at L1182, and the NM scalar invariant
  this scope calls `t10:1257` is at L1256. Content as described.*
- **The `t29` F-6a/F-6b repair** (D-VA-3, D-VA-6), and it is a REQUIREMENT of this release rather
  than a nice-to-have: flip both to the suite's equality helper so they can fail at all, re-found the
  selector on `!r.exclTest`, and correct the wrong `{VA}` measurement at **all three** shipped sites
  — `t29` F-6a's comment, `qa/tools/fixture/households.mjs:67–77`, and the census row's own note in
  `qa/tools/boundaries.mjs`.
  ⚠ **TWO CORRECTIONS, both found at the build.** (1) **`t29` had no equality helper to flip to** —
  `T(n, ok, d)` was its only assertion function, which is how F-6a/F-6b came to be written that way.
  `EQ(name, got, want)` was added beside it. (2) **`boundaries.mjs` carries no Virginia text.** The
  third site of the wrong measurement is the `stateExclCliff` fixture's own `why:` string in
  `households.mjs` (*"the one remaining household shape"*). `boundaries.mjs` still changed — it holds
  the selector itself, which gained `!r.exclTest` — and `t29` F-6c now asserts the two copies agree. ⚠ **Correcting one and leaving the others is the two-copies-drift
  pattern this project keeps recording.** The OPERATIONS §D2 pin is flipped in the same pass.
- **A negative control for the repaired F-6a/F-6b themselves.** They were vacuous for a release and
  review did not catch it; only a mutant did. A repair that is not mutation-tested has no more
  standing than what it replaced — this is OPERATIONS §D1's named class, and its whole record is that
  controls find it and review does not.
- **Version bump across the four in-app sites** and the usual `METHODOLOGY` update — this release
  changes modelling.

## 6 · DECISIONS THAT WERE REOPENED, AND HOW THEY WERE SETTLED

Both were recorded as resolved by the handover, contradicted by measurement, and re-decided
2026-09-09 on the re-measured evidence. **They are closed. Do not re-open them in the build** — if
evidence contradicts one, that is a STOP-and-report, not a licence to choose again.

### D-VA-2 · the scalar — **RESOLVED 2026-09-09: `excl65: 12000`. KEEP IT.**

The handover resolved `excl65: 0` on the rationale that *"a taper has no single per-person value that
agrees with the table at zero income."* **Measured against L1311, that rationale is false.** At zero
measure the taper returns `perPerson × _qual` — a per-person amount of exactly $12,000.

The shipped rule, stated in `stateTaxAnnual`'s own comment and pinned at `t10:1257`, is that a
populated state's scalar **must equal what its table yields at zero income**, or it becomes a second
source of truth. Applied to the three populated states, by AST dump:

| state | table | at zero income | scalar | agrees? |
|---|---|---|---|---|
| NM | `bands`, `unit: "person"`, first row `amount: 8000` | $8,000 **per person** | `8000` — **kept** | yes |
| NJ | `bands`, `unit: "household"`, first row `amount: 100000` | $100,000 **once** | `0` | no per-person value exists |
| CT | `bands`, `pct` rows | $0 | `0` | yes |
| **VA** | **`taper`, `perPerson: 12000`** | **$12,000 per person** | **?** | **`12000` agrees** |

Virginia's taper is per-person, like New Mexico's table. **The New Mexico precedent applies, and
`excl65: 12000` is what the invariant requires.** F-6a's warning against *"keeping a scalar alive
SOLELY to satisfy a filter"* does not bite: the scalar would be kept because D-3(b) demands it, and
any filter staying green is a side effect, not the motive.

**Resolved as `12000`**, on the New Mexico precedent and the invariant that states it. ⚠ **The build
must ASSERT this**, in the shape `t10:1257` uses for New Mexico — *VA's `excl65` scalar still equals
its taper's value at zero income* — so a later session cannot quietly set it to `0` and stay green.
⚠ **Neither value moves a user's number**: `excl65` is unread once `exclTest` is present. The whole
stake is whether Virginia's scalar agrees with Virginia's own table, and `0` would have required
amending `t10:1257`'s rule to accommodate a single state.

### D-VA-3 · the guards — **RESOLVED 2026-09-09: repair the checks FIRST, then re-found on `!r.exclTest`.**

The handover's premise here is measurably wrong, and the truth is worse than it expected.

The handover says the income-limited scalar set is `{VA}`, that populating Virginia empties it, and
that `t29` F-6/F-6a/F-6b therefore turn **RED** — *"them working, not breaking."*

**Measured live at v5.67, the set is `{NM, RI, VA}`.** Rhode Island *does* carry the selector phrase
(*"…are income-limited in law by a hard AGI cliff…"*) with scalar `50000`; New Mexico was **populated
at v5.66**, correctly kept `excl65: 8000`, and its note still says `income-limited`.

**And the checks that should have caught this cannot fail.** `t29`'s helper is
`T = (n, ok, d = "") => { if (ok) pass++; … }` — a truthiness assertion whose third argument is a
display string. F-6a is written `T("…exactly the one member…", limited.length, 1)` and F-6b
`T("…that member is Virginia", limited.join(","), "VA")`. The `1` and `"VA"` are never compared. Both
pass on any non-empty set of any membership. **Controlled, not argued:** dropping the selector phrase
from Virginia's note alone, from a pristine copy, gives `t29 61 passed, 2 failed` — `C-stateExclCliff`
and `F-7` fire, **F-6a and F-6b do not.**

⚠ **So populating Virginia does NOT turn these red.** `{NM, RI}` keeps the set non-empty and the
`stateExclCliff` fixture keeps reading ON, while the row's stated meaning — *"income-limited in law,
**unconditional in the model**"* — quietly stops being true. **Green from a set that no longer means
what it says**, which is silent where the handover expected loud.

**RESOLVED. This replaces the handover's "re-found on `exclTest`" with something narrower and better
grounded, and THE ORDER IS PART OF THE DECISION, not a suggestion:**

1. **Fix F-6a/F-6b first** — flip them to the suite's equality helper so they can fail at all. Until
   that lands, nothing about this set is under test beyond "non-empty".
2. **Re-found the selector on DATA, not prose**, by adding `!r.exclTest` to it. The row means
   *unconditional in the model*, and `exclTest` is exactly what makes a state conditional. This is
   not a new idea in the codebase: `qa/tools/boundaries.mjs:128–132` already records the lesson —
   *"A flag is data; prose is not"* — learned when NJ's note was reworded at v5.54, and the
   `state_excl_limited` row directly above it was never brought along.
3. **With `!r.exclTest` the set at v5.67 becomes `{RI, VA}`**, and after this release **`{RI}`** — so
   Rhode Island carries the fixture forward and the D-3c row stays reachable. That settles the
   handover's warning that *"Virginia is the last state the fixture can stand on"*: it is not, once
   the selector stops mis-measuring. **RI's note does carry the phrase; the three sites that say
   otherwise are wrong.**
4. ⚠ **Three shipped sites carry the wrong `{VA}` measurement** and must be corrected in the same
   release: `t29` F-6a's comment, `qa/tools/fixture/households.mjs:67–77`, and the census row's
   own note text. Do not correct one and leave the others — that is the two-copies-drift pattern.

⚠ **Still forbidden, unchanged:** do not weaken F-6, do not delete the fixture to make `t29` green,
and do not keep a scalar alive *solely* to satisfy a filter.

### Decisions that stand as the handover recorded them

| | Decision |
|---|---|
| **D-VA-1** · age floor | **65** — the statute's own and the engine's default (`_floor` at L1217 defaults to 65 when `exclAge` is absent), so **no `exclAge` key**, matching NM. Verified: VA carries none today. |
| **D-VA-4** · `t10:1133` | **Fix the oracle path comment** in this release, since it is already touching the suite. |
| **D-VA-5** · direction | **CONSERVATIVE only.** Corroborated at all five measured points (§4). A downward move contradicts the premise: STOP and report. |
| **D-VA-6** · sequencing | **RESOLVED 2026-09-09: the `t29` F-6a/F-6b repair ships WITH this release**, not as a separate ops package. It is a suite edit and this release already opens the suite; splitting it means a second package touching the same file for no gain. ⚠ The counter-argument was heard and rejected on that ground alone: a vacuous check is misleading in the meantime, so **if Virginia slips more than a release or two, revisit this** — the pin in OPERATIONS §D2 is what keeps it visible until then |

## 7 · Out of scope

- **Rhode Island**, and its second defect — its exclusion does not cover IRA distributions. Next after
  Virginia, and **scoped with both defects together**. ⚠ Its TY2026 pair is not published until
  November 2026; the parent scope's B-3 permits populating on dated TY2025 figures with the staleness
  disclosed, but that is a judgement deserving its own scope.
- **The `K-1`–`K-3` pre-ship/post-ship split** and `P29`'s blindness on a package whose `K-1` is
  already red. Diagnosed in §I, still unscoped. Do not soften a K check to make a run look clean.
- **Widening `K-8`'s matcher beyond `.py`.** Settled at v5.67; not reopened.
- **The nine of nineteen exclusion states still unchecked.** A different problem.
- **Anything on the accumulation side, or a new output outside the drawdown frame.**

## 8 · Test count impact

Not predicted here. The release computes its own totals from suite output.

---

## 9 · Build record (v5.68, 2026-09-10)

Built against v5.67 (`ca05b2ec…`), baseline re-run first from a clean run folder: 3,377 app checks,
0 failing. Source edit transcribed from the session brief, **re-verified 15 of 15 to the cent against
`oracle_va.py` before anything was built on it**, plus two added cells. D-VA-5 swept v5.67 against
v5.68 over 20,050 Virginia households: tax fell in none; the largest rise is $1,380.00.

Shipped exactly as §5 required: `t10` Virginia block (every taper region, both columns, the age floor,
the measure, the clamp, two household once-not-twice pins, the extinction invariant, the `excl65`
agreement and no-`exclAge` invariants, and three pre-fix pins on the v5.67 leg); `t34` A-11; `t35`
D-7c and D-10–D-13; `t29` F-6a/F-6b repaired and gated per leg, plus F-6c; the selector re-founded in
**both** copies; the fixture moved to Rhode Island; the oracle path comment; §D2 flipped.
`qa/tools/controls_v568_va.py`: **17 controls, 17 met expectation**, canonical md5s unchanged —
including T1 (an interior member joins the set: F-6a and F-6b fire, F-6 does not) and T5 (the same
mutation against the restored v5.67 form: silent, which is the recorded defect reproduced on purpose).

**Where this scope was wrong** — §5's filing-column wording, the nonexistent equality helper, the
`boundaries.mjs` "note text", and two stale line numbers. Each is corrected at its site above rather than
here, so the correction sits beside the error. Per-suite totals are in `CHANGELOG.md` v5.68 and are not
restated here.

*Destination: **repo `docs/SCOPE_VA_POPULATE.md` AND the knowledge pool** — it is a scope document,
and §G routes scopes to both. It also needs a manifest row.*
