# SCOPE — D-23 · Two state notes say nothing true about when the model applies the exclusion (v5.87)

**FULFILLED — shipped as v5.87 (2026-10-01).** Retired to repo-only at the ship (OPERATIONS §G). §8 is the build record.

*(Superseded status line, retained:)* **DRAFT — BUILD STOPPED AT THE §3 CENSUS, 2026-10-01 (see §7). Steve answered D23-A/B/C "yes to all three" on 2026-10-01; the census then found four more rows in the class, which is the scope's own stop condition. New decisions D23-D and D23-E (§7c) need an answer before any build.** Drafted 2026-09-30. Built against v5.86
(source `74c880bc3af80865f6b99759cc7bba3b`, built `index.html` `bad51541661e84bd0dd245e77f243150`, repo HEAD `754e948`).

## 0 · Premise — measured on the shipped v5.86, through the shim (`app_v586.mjs`), not read as text

- **New York** — `excl65: 20000`, no `exclAge`, so the model applies the exclusion from **65** (the `_floor` default). Its note
  reads `$20K/person pension & annuity exclusion 59½+; NYC local tax not modeled`. **The note states an age the model does not
  apply.** Law: from 59½ (tax.ny.gov, retired persons — read at v5.86, scope D-18 §1b).
- **Arkansas** — `excl65: 6000`, no `exclAge`, so the model applies it from **65**. Its note reads `$6K retirement exclusion` —
  **silent on age**. Law (A.C.A. §26-51-307, read at v5.86): IRA distributions from 59½; employer-plan benefits at any age.
- Both directions are **conservative** (the model withholds an exclusion the law grants, so it overstates tax for a retiree under
  65 in these states). Neither is a wrong number. Both break the standing rule: *simplifications are disclosed in-app, never
  silent* — New York's actively misdescribes the model.
- Filed as `MissingFeatures.md` **D-23** at v5.86 (decision D18-3 re-homed there).

## 1 · The change (presentation only — no figure, rule, rate or age moves)

Two note strings in `STATE_RULES`:

| Row | v5.86 | Proposed |
|---|---|---|
| NY | `$20K/person pension & annuity exclusion 59½+; NYC local tax not modeled` | `$20K/person pension & annuity exclusion — applied here from 65, although the law allows it from 59½ (conservative); NYC local tax not modeled` |
| AR | `$6K retirement exclusion` | `$6K retirement exclusion — applied here from 65, although the law allows it from 59½ for IRAs and at any age for employer plans (conservative)` |

Version bump at the four in-app sites. **METHODOLOGY:** no modelling change, so no new section — but its age-threshold paragraph
(updated at v5.86) already names both states; check it still reads true and add "both notes now say so" if it does not.

## 2 · Site census — owed at build, by parser (OPERATIONS §B1)

- Both note strings: AST walk of every string node, **every occurrence** (the v5.86 lesson: one `DOCS_HTML` node holds the whole
  Field Manual — a per-node walk misses repeats). Expected: one site each, in `STATE_RULES`.
- **§B1a regex census before the copy is final:** every suite regex executed against the old and new note text, and against My Data's
  line rendered for NY and AR. Known live matcher to clear: `NOTE_MATCHER` (`/income[- ]limited|income limit/i`, `qa/tools/state_sets.cjs`)
  — neither proposed note contains it, but run it, don't assert it. t10 §2E requires every `excl65 > 0` note to carry a dollar
  figure — both still do.
- Pins on the old strings: a string-literal census across the suite (`literal_census.cjs`). None expected; confirm.

## 3 · Tests (written first; run against v5.86, where they must fail)

- **Typed:** NY's note states 65 as the modelled start and 59½ as the law's; AR's states 65 and 59½. Neither says "59½+" as if
  it were the model's.
- **Extinction (proposed, D23-C):** *a note may name a start age only if it is the age the model applies, or it says the model
  differs.* Mechanically: every age pattern in a note (`/\b(\d{2})(½)?\s*\+/` and "from NN") equals the row's modelled floor
  (`exclAge ?? 65`), unless the note contains "applied here from". **Census owed before adopting it** — which notes name ages
  today, and does each match its floor (DE 60, WI 67, KY 0, GA's 62–64 band, SC, WV…)? If the census finds a third mismatch, STOP
  and report: the premise grew.
- Display: My Data's line for NY and AR carries the new note (DOM, as `t51` D-group does).
- Negative controls (repo-only, release-pinned): revert each note; plant "59½+" in a third row whose floor is 65 (extinction fires).
- Where: extend `t51` (it already owns state-table invariants and the DOM harness) **or** a new `t52` — build's choice, stated.

## 4 · Out of scope

- **Changing the modelled ages.** The app has one age per person and no account-type split (D-12); NY at 59½ and AR's
  IRA-vs-employer split are modelling changes for their own scope.
- **D-21** (West Virginia's $8,000 is not additive — optimistic by up to $8,000/person/year): its own release, after this one.
- **D-22** (the 42 rates not re-read): its own release.

## 5 · Decisions (for Steve)

- **D23-A · New York's note** (was D18-3). (a) correct it as in §1 — **recommended**: the note misdescribes the model; (b) leave it.
- **D23-B · Arkansas's note.** (a) add the disclosure as in §1 — **recommended**: same rule, silent rather than wrong; (b) leave it
  for the modelling scope that would change AR's ages.
- **D23-C · The extinction invariant.** (a) adopt it, subject to the §3 census — **recommended**: it turns a one-off correction into
  a class that cannot return; (b) typed checks on NY and AR only.

## 6 · Status
⚠ *Superseded by §7 — the paragraph below is the 2026-09-30 draft's status, retained.*

DRAFT. Destination once decisions are answered: repo `docs/SCOPE_D23_AGE_START_NOTES.md` and the knowledge pool (active scope);
retire to repo-only when v5.87 ships (OPERATIONS §G).

## 7 · Build stopped at the §3 census (2026-10-01, against v5.86 `74c880bc3af80865f6b99759cc7bba3b`, repo `754e948`)

**Answers recorded.** Steve, 2026-10-01: "Yes to all three" — D23-A (a), D23-B (a), D23-C (a) *subject to the §3 census*. The
census was then run, before any test or source edit, and it tripped §3's stop condition: **the premise grew from two rows to six.**
Nothing was edited; the working tree equals `754e948`.

### 7a · What was measured

Freshness check (OPERATIONS §A, §A2) first: pool 115 files, every one matching committed content at `754e948`; source md5 = manifest
= CHANGELOG newest = repo. Then `STATE_RULES` evaluated from an AST slice of the source (not a grep), and `stateTaxAnnual` executed
through the shim (`mk_testable.sh v586`), single filer, $50,000 retirement income, no Social Security:

| Row | Note names | Model applies (measured) | Direction for a younger retiree |
|---|---|---|---|
| NY | "59½+" | from 65 ($3,000 at 59–64, $1,800 at 65) | conservative — **as scoped** |
| AR | nothing | from 65 ($1,950 at 55–64, $1,716 at 65) | conservative — **as scoped** |
| **GA** | "$35K at 62–64" | from 65 only — $2,595 at 61, 62, 63 and 64; $0 at 65. The 62–64 tier is not modelled and the note does not say so | conservative |
| **IA** | "fully exempt for 55+" | **any age** — $0 at 50 and 54 (`retExempt` has no age gate: `retBase = r.retExempt ? 0 : …`, `stateTaxAnnual`) | **optimistic** |
| **PA** | "exempt for 59½+" | **any age** — $0 at 50 and 59 (same mechanism) | **optimistic** |
| **OK** | nothing ("$10K retirement exclusion") | from 65 ($2,375 at 60–64, $1,900 at 65) | silent, as AR |

Every other row with a nonzero exclusion (AL, CO, DE, KY, LA, ME, MD, MT, NJ, NM, RI, SC, VA, WV, WI) names the age it is modelled
from, and the measured tax steps at that age. CO's "55–64" and RI's "67" are their `ssRule` ages, also matched.

**The premise's direction claim no longer covers the class.** §0 says both rows are conservative. Iowa's and Pennsylvania's are
**optimistic**: the model exempts retirement income at any age while the note names an age floor. Whether those floors are correct in
law was **not** re-read this session — the finding is the disagreement between note and model, which holds either way.

### 7b · The §3 invariant as written would have been wrong in both directions

Executed on v5.86 (session tool, not shipped):

- **As written** (`/\b(\d{2})(½)?\s*\+/` and "from NN" against `exclAge ?? 65`): fires on NY, **IA, PA** — the last two for the
  wrong reason (compared to 65; the model applies them at any age) — and is **blind to GA** (a range, "62–64", matches neither
  pattern) and to AR/OK (silence matches nothing).
- **Revised** — modelled floor `retExempt ? 0 : (exclAge ?? 65)`; patterns `NN+`, `NN½+`, `from/at (age) NN`, `NN–NN`; ages equal to
  the row's own `ssRule.fullAge / midAge / ageMin` allowed; `$` and `§` contexts excluded (Utah's "§59-10-1042" was a false
  positive until then); plus a **silence** check (every `excl65 > 0` row names its start age or "any age"): fires on **exactly AR,
  GA, IA, NY, OK, PA** and nothing else.

### 7c · New decisions (for Steve)

- **D23-D · Widen v5.87 to the four new rows.** (a) **recommended**: correct GA, IA, PA and OK in the same presentation-only
  release, so the invariant can be adopted green and the class is closed in one pass. Each note says what the model does; a law
  comparison ("although the law …") is added only where the primary source is read at the build (GA DOR, Iowa DOR, PA DOR,
  Oklahoma Tax Commission). Iowa's and Pennsylvania's notes say plainly that the model is **optimistic** for a retiree under the
  law's age. (b) keep v5.87 to NY and AR, adopt the invariant with GA/IA/PA/OK pinned as known exceptions, and file the four as a
  new item — not recommended: pinned exceptions are a lock on wrong copy (OPERATIONS §B2).
- **D23-E · Iowa's and Pennsylvania's modelling.** A note can disclose an optimistic simplification but cannot make it conservative.
  (a) **recommended**: file as **D-24** — age-gate `retExempt` — its own modelling scope, which should re-read the law for **all 14**
  `retExempt` rows (AK FL IL IA MI MS NV NH PA SD TN TX WA WY), not just these two; rank it beside D-21 (WV), the other known
  optimistic item. (b) fold it into v5.87 — not recommended: `retIncome` is household-level, so a per-person age gate is a modelling
  change in D-12's territory, and it would turn a presentation release into a modelling one.
- **D23-C stands as answered (a)**, adopting the **revised** form in §7b, not the §3 form.

Destination: this file goes to the repo (`docs/SCOPE_D23_AGE_START_NOTES.md`) and the pool **once D23-D and D23-E are answered**, as
§6 already said; retire to repo-only when v5.87 ships.

## 8 · Build record (v5.87, 2026-10-01)

- **Decisions:** D23-D (a) and D23-E (a), Steve 2026-10-01; D-25 (found below) answered (a) — v5.88.
- **Law read at the build:** NY tax.ny.gov retired persons (59½, $20,000 per person); AR DFA Subject 206 (employer pensions, no age;
  traditional IRAs from 59½); GA Dept. of Audits and Accounts evaluation, Feb 2023 ($35,000 at 62–64, $65,000 at 65+); IA DOR guidance (55 on
  31 Dec, disability or survivor, per spouse); PA DOR rev-636 and PA-40 instructions (IRAs 59½; employer plans at the plan's age or service);
  OK OAC 710:50-15-49 — **does not settle an age**, so Oklahoma's note claims none (filed under D-24).
- **Source** `3bb42add57012e0e8a9d6df350afd0df`: six notes and four version sites; exactly six rows changed, notes only (AST-evaluated table compared field by field).
  **Built** `0b9b36a0f33baac1df933a8a909393a5`; v5.86 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed.
- **Census (§2, §B1a):** each note one site, in `STATE_RULES`; no suite string or regex changes outcome against the source or METHODOLOGY;
  `NOTE_MATCHER` false on all six, old and new; every `excl65 > 0` note still carries a dollar figure.
- **Tests:** `t52` 34 checks — v5.86 16 passed / 18 failed, v5.87 34/34. Controls `controls_v587_age_notes.py` 12 of 12. Registration:
  32 ladders + 79 gated (77 `||`, 2 arms) by `register_tag2`, `t33`'s keyed PIN (its household is in Georgia — a note change, no figure),
  `t45`/`t47`/`t48` by hand.
- **Suite:** 4,866 app checks, 51 suites, 0 failed, 0 DIED; GRAND 4,996. Run from the PACKAGED copies as two halves at once (approved by Steve, 2026-10-01): one turn cannot hold the ~40-minute single run (a command is capped at 300 s and a turn at about eight calls; two single runs died at the turn boundary, after t29 and t47). Two run folders were built by mk_runfolder.sh v586 v587 from the same fresh clone of 754e948 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: everything else, tooling included). Half A GRAND 4774, half B GRAND 222, both exit 0, no suite ran in both, none DIED.
- **Found, not built (D-25):** My Data's generated summary hard-codes "65+ exclusion" — wrong for DE, KY, RI, WI. A new site mid-build, so
  not widened into; `t52` reads the line but asserts only on the note. Fix designed in `MissingFeatures.md` D-25.
