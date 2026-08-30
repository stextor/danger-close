# STOP REPORT — v5.56 halted on session budget, 2026-08-29

**This document is authoritative for what is built, what remains, and what was decided.** The
session brief that accompanies it deliberately carries no conclusions of its own and routes here.
`KIND: ops`.

| Field | Value |
|---|---|
| Base | **v5.55** · source `31761794c4c69ec255ca5cd856d48b8f` · built `index.html` `d26050b78c46e1561bd36161ce083a4e` · tree `6a23758` |
| Working source | **`61073db109bf3de04b07d864a32b477f`** — in `workbench/`, **UNVERIFIED as a package**, see §2 |
| Target | **v5.56** — the Social Security offset for Maryland and Maine |
| Governing scope | `SCOPE_STATE_SS_OFFSET.md`, **shipped in this package because it had never been filed** |

---

## 1 · The six decisions, as resolved

All six were resolved as recommended and all six are built.

| | Decision | Built as |
|---|---|---|
| **D-a** | offset flag on `STATE_RULES` | `ssOffset: true`, on MD and ME only |
| **D-b** | the exclusion line becomes per-person | `_one(age, ssGross)` applied to A and B separately and summed |
| **D-c** | correct the stale amounts in the same release | MD `36200 → 40600`, ME `35000 → 48216` |
| **D-d** | Maine's income phaseout | **OUT**, disclosed in ME's note |
| **D-e** | Colorado | **OUT**, explicitly; its `ss: 0.5` contradiction still disclosed, not resolved |
| **D-f** | a `boundaries.mjs` row for the class | `state_ss_offset`, **keyed on the flag, not on note prose** |

## 2 · What is built

**Everything in `workbench/` is source-complete and passes the full suite. It has NOT been through
§L packaging, `index.html` has not been rebuilt, and `smoke_built` has not run against it.**

- **`stateTaxAnnual`** gained `ssGrossA` / `ssGrossB`. The exclusion is computed **per person** —
  `max(0, cap − that person's gross SS)` for each qualifying spouse — replacing `cap × count`.
- **The legacy `persons65` path** returns the unoffset exclusion **at the current cap**. It is not
  "pre-v5.56 behaviour": the cap correction applies there too. The test says so explicitly.
- **Three call sites** pass `ssA_y` / `ssB_y`. ⚠ **All three read them AFTER the widowhood
  collapse** — verified by `census.cjs` scope chains, not by eye: L3999 and L4117 inherit
  `run@3785` (collapsed L3858), L5268 inherits `computeTaxPlan@4994` (collapsed L5147). L4117 sits
  between two collapses and was not safe to assume.
- **Four version sites bumped.** Five `v5.55` occurrences remain and **none is a version site** —
  four code comments and §13 prose about v5.55. Verified by position.
- **Field Manual §13** discloses the offset, the direction, and the three related things still not
  modelled: Railroad Retirement, Maine's phaseout, Colorado's shared cap.
- **`boundaries.mjs`** gained `state_ss_offset`, keyed on `ssOffset`.
- **62 gates, 15 registries, and all THREE of `t31`'s version lists** rolled — `KNOWN_VERSIONS`,
  `POST` and `ORDER`. 60 gates extended, 2 ternary lookups took new arms.

### Suite, from the working tree

```
2,821 app checks, 0 failing
v5.55 leg 1,063 · v5.56 leg 1,080 · parity 10/10 · feature once 668
tooling 82 (t21 50 · domdiff 32) · GRAND 2,903 · 0 died
```

**The pre-edit baseline was green first.** §2E is **65** on the new leg.

### The figures, hand-computed and executed before any test was written

Thirteen cases, all matched. The one that justifies the rewrite:

| MD, both 65, retIncome $120,000 | exclusion | tax |
|---|---|---|
| SS $10,000 / $50,000 | $30,600 + $0 | **$6,705.00** |
| SS $30,000 / $30,000 | $10,600 + $10,600 | **$7,410.00** |

Same total SS, same qualifying count, different answer — **each person's offset floors
independently, which a count cannot express.** That asymmetry is asserted, not just described.

Confirmed unmoved: NJ's D-3c pins at **$2,750.00**, KY's v5.55 age floor at **$1,511.20**, AL
ignoring SS entirely at **$3,960.00**.

## 3 · What remains, in order

1. **Recover the working tree** from `workbench/` and confirm the source md5.
2. **Re-run the full suite** from a clean clone plus the recovered tree. Do not carry 2,821 forward
   as a target — recompute from output.
3. **`METHODOLOGY.md`** — mandatory, this is a modelling release. Nothing has been written yet.
4. **`CHANGELOG.md`, `TESTING.md`, `PROJECT_KNOWLEDGE_INDEX.md`** — nothing written yet. TESTING's
   header carries the v5.55 figures.
5. **Retire `SCOPE_STATE_SS_OFFSET.md` and delete its `package_check` OPEN-allowlist entry in the
   same edit.** The entry is added by *this* package; see §5.
6. **Rebuild `index.html` per §N** from the **pristine repo `package.json`**
   (`9ee8d745bc9f32d6e8fa02e623603423`) — not a work tree whose `package.json` an `npm i` has
   rewritten. That happened at v5.54 and the build was discarded and redone.
7. **`smoke_built`** against the artifact — path as `argv[2]`, no placeholder first argument.
8. **Package per §L**, run the suite **from the packaged copies**, `package_check` on the zip.

## 4 · The cost finding, so it is not rediscovered a fourth time

**A version bump costs 62 gated expressions and 15 registries.** Not 14 — `t29_boundaries.mjs`
carries a registry and has **no** `VER ===` gate, which is exactly what makes it easy to miss; it
was also the file omitted from the v5.54 package. Two of the 62 are ternary lookup tables
(`t1` `verStr`, `t4` `_badge`) needing a **new arm**, not an extended condition — the blanket
transform would render the new build under the old version string.

⚠ **`t31` has THREE version lists.** `ORDER` drives `indexOf(VER)`, so an unrolled tag scores −1 and
**every key silently takes its pre-fix branch**: six failures with no hint a list is missing. v5.55
hit this. All three are rolled in `workbench/`.

⚠ **New assertions must be gated from the start.** v5.55 shipped them ungated and failed the frozen
leg nine times — the v5.27 mistake §B2 exists to prevent. The v5.56 set **is** gated, to `_v >= 556`,
with a `[KNOWN DEFECT pre-v5.56]` else-branch.

## 5 · This package files two documents that were never filed

- **`SCOPE_STATE_SS_OFFSET.md`** was written this session, its six decisions resolved, and the build
  begun — but it was **never uploaded**. It ships here to both destinations. Its status line has
  been updated from *"Awaiting decisions"* to *"decisions resolved, build in progress"*, which is
  true and is what the next session must see.
- **Its `package_check` OPEN-allowlist entry** is added in the same edit, because a scope that is
  neither retired nor allowlisted fails I-2 on the next package. **Delete that entry when the scope
  retires at the v5.56 ship** — the comment beside it says so.

## 6 · Still open after v5.56

- **11 of 19 exclusion states unverified.** Ahead of any new state: **Delaware HB 108** (may have
  raised $12,500 → $25,000) and **Kentucky's 2026 rate** (model 4%, DOR page 4%, secondary sources
  3.5%). Neither resolved, neither asserted.
- **Railroad Retirement** — named by both MD and ME statutes alongside SS. No RR concept exists in
  the model. Disclosed, not modelled.
- **Maine's income phaseout** and **NJ, VA, RI's income limits** are the same D-3c mechanism and
  deserve one scope covering all of them.
- **Colorado's shared $24K cap**, and its `ss: 0.5` against a note saying 65+ deduct all
  federally-taxed SS. **Do not reword the note to match the code.**
- **NJ's 62 floor and household cap** — both axes together or neither.
- **`KIND: handover`** — still absent from `package_check`; this package is `KIND: ops` for want of
  a truer word. And nothing checks that a `github/` file landed at the path it was filed under,
  which is how a scope reached the repo root twice this week.
