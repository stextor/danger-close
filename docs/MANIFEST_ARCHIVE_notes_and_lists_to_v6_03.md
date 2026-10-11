# Manifest archive — superseded ship notes and delete-first lists, to v6.03

| | |
|---|---|
| What this is | Two blocks of `PROJECT_KNOWLEDGE_INDEX.md`, moved here verbatim on 2026-10-11 to recover project-knowledge space: **Part 1** the superseded ship notes (v6.03 back to v5.42, with the ops, handover and docs notes between them); **Part 2** the delete-first lists from the v6.03 ship back to the v5.31 refresh, with the notes that sat among them |
| Where it lives | **Repo only** (`docs/`). Never pooled. The manifest points here at both cuts |
| Source of the split | `PROJECT_KNOWLEDGE_INDEX.md` md5 `effe8132edaf03021ee97e2113d29234` (as committed at `c200261`): Part 1 from the line *"(Superseded, retained: the v6.03 note follows.)"* up to *"Any work — edits, verification"*; Part 2 from *"At the v6.03 ship (2026-10-10) — DELETE THESE FIRST"* up to *"## Rotation state"* |
| Never edited | Parts 1 and 2 are each byte-identical to the manifest text they replaced (checked by reassembly). Statements in it are as written on their dates — many are superseded; the manifest, CHANGELOG and registers are current |

## §0 · The trace — every open thread in the text that left the pool on 2026-10-11, and where it went

OPERATIONS §G: before a document leaves the pool, every open decision in it is resolved or re-homed in a pooled register. Searched
(2026-10-11, against `c200261`) in Parts 1 and 2 below and in the six documents un-pooled the same day — `FlawsToFix-v5_69-Phase1.md`,
`AUDIT_STATE_EXCL65_ROUND3.md`, `AUDIT_STATE_EXCL65_ROUND4.md`, `AUDIT_STATE_INCOME_BASES_ROUND5.md`, `BUILD_BRIEF_v5_49.md`,
`controls_source.sh` — with two word lists (*OPEN, awaiting, unresolved, not yet, pending, deferred, follow-up, unscoped, TODO, left for,
later pass, Steve's call, yours, no recommendation, undecided, still open, not fixed, open question/decision*; then *not built, its own
release/scope/pass, owed, recorded not, not scoped, lead, not re-verified, NOT CAUGHT, UNKNOWN*) and by reading each hit in context. Every
register ID cited (60 distinct) was checked for a record in a pooled register; each is defined in `MissingFeatures.md`,
`ARCHITECTUREIssues.md`, `FlawsToFix-v5_73-Phase2.md`, `UsabilityFlaws.md` or `package_check.mjs`, except three sub-labels of closed work
(`C-0`, a `t31` check; `F-6a`/`F-6b`, `t29` checks repaired at v5.68). *(parser)* marks a claim checked against the v6.04 source by
evaluating `STATE_RULES` or walking the source with acorn.

### Re-homed — open, and the leaving text was their only pooled record

| Thread | Where it was | Where it went |
|---|---|---|
| `D-B3-1 (b)`: remove `main.jsx`'s `/anthropic` rewrite and the dev proxy — never scoped; still in the source *(parser)* | Phase 1 header | `ARCHITECTUREIssues.md` **E-29 (a)** |
| `t13` measures SS loss plus the rollover ($3,840.81 residual); fix is a counterfactual anchor, a scope | Part 1 (v5.47 note) | **E-29 (b)**; the measurement verbatim in OPERATIONS **§B2a** |
| `E-1b` silently skips a pool file renamed from its repo path; "a rename map", not built | Part 1 (2026-09-07 note) | **E-29 (c)** |
| The v5.69 Roth best-cell move: recommendation "leave disclosed, unpinned", no decision recorded | Phase 1, "carried" list | **E-29 (d)** — Steve's |
| The v5.69 Rhode Island Field Manual sentences: Steve asked to read them, no answer recorded | Phase 1, "carried" list | **E-29 (e)** — Steve's |
| `K-10` as first proposed (manifest → pool for unhashed rows) — never built; the ID was reused at v5.78 for a different check | Part 1 (2026-09-07 note), Part 2 (2026-09-07 list) | **E-29 (g)** |
| A-2's last bullet: an imported checklist is persisted with no shape check — out of `SCOPE_IMPORT_HARDENING.md`'s scope | Phase 1 §A-2 | **E-29 (h)** |
| The suite's harness dependencies resolve fresh at each run folder (no lockfile entry for `jsdom`) — "needs a scope" | Phase 1, Section E notes | **E-29 (i)** |
| Phase 1's "not examined, therefore not cleared" list; A-1 and B-1 — no Section A/B register stays pooled | Phase 1 | **E-29 (j)** |

### Carried — standing rules and traps, not open items, held only in the leaving text

Moved verbatim to the document that owns the rule: **OPERATIONS §B2a** — a fixture that cannot reach a behaviour makes every assertion
about it vacuous; three fixtures cannot see v5.47's item 5; `t13` is not `t14` (with `t14`'s re-anchoring); `t10`'s section labels
overlap; and, from Phase 1, the DOM bundle is CommonJS (sloppy) while the shipped build is an ES module (strict), so a write the harness
ignores can throw in the browser. **OPERATIONS §I** — a truncated hash is not a hash (the v5.64 lesson). The "derive the count" lesson already stands in the
manifest's hash-table notes (decision D-5), and "directory is not destination" in OPERATIONS §L (the pool-membership test); not duplicated.

### Resolved, or already held by a pooled register

| Thread | Status, with evidence |
|---|---|
| Phase 1: A-2, A-4, A-5, A-6 | A-2 (except its last bullet, E-29 (h)), A-4, A-5 FIXED v5.72 (its own header); A-3 and A-6 FIXED v5.71; B-3 FIXED v5.70 |
| Phase 1 header: Montana's 65+ subtraction lead ($5,660) | applied v5.73; `MT.excl65` 5660 *(parser)* |
| Phase 1 header: Maine's pension phaseout | modelled v5.73 (Maine's note) |
| Phase 1 leads: Maine has no age-65 test · Montana's two brackets · the seven half-rate SS states | `MissingFeatures.md` D-15 (open) · modelled, `MT.brackets` *(parser)* · D-19 FIXED v5.85 |
| Phase 1 header: the legacy `controls_v559`/`v560` rows against the manifest's D-3 rule | resolved 2026-09-28: those rows were rewritten un-pooled with every release-pinned control script (Steve's decision that day) |
| Phase 1 §E notes: no error boundary · harness dependencies unpinned | `AppErrorBoundary` exists *(parser)* · open — E-29 (i) |
| Phase 1: "pool pruning deferred by Steve, 2026-09-10" | done — the three ops packages of 2026-10-11 |
| ROUND3 §5 corrections owed (VA note, WI figure, a `t10` comment, D-3c's class list, `SCOPE_STATE_FIXTURES.md`'s status) | VA v5.68; WI v5.59/v5.60; the `t10` comment is gone; D-3c CLOSED; no scope but `SCOPE_STANDING_AUDIT.md` is on `package_check`'s I-2 OPEN allowlist |
| ROUND3 §6 D-A…D-D; ROUND4 §6 D-A…D-D | settled by ROUND4/5 and built v5.59–v5.69; ROUND4's recommendation became `MissingFeatures.md` D-11 |
| ROUND4/ROUND5: New Mexico's table against its graduated schedule | NM is on its own brackets with its bands in `exclTest` *(parser)*; D-11's NM half closed v5.66 |
| ROUND5 §7: Connecticut's band edges · RI's TY2026 thresholds · how often thresholds bind · unchecked exclusion states | CT populated v5.65 with boundary pins (`t35`) · D-18's recurring list · D-13 (open) · D-18 read every exclusion state's figure (v5.86) |
| BUILD_BRIEF §7: measure New Jersey; the D-7 disclosure scope | NJ income-conditioned v5.67; D-7 disclosed v5.50 |
| Part 1: D-9 of `SCOPE_TAXES_DRAWDOWN.md` | resolved 2026-09-18, built v5.74 |
| Part 1: D-10 of `SCOPE_IMPORT_HARDENING.md`; every scope said to "stay OPEN" | those scopes retired; the I-2 allowlist holds only `SCOPE_STANDING_AUDIT.md` |
| Part 1: K-10 "proposed, not built" · P1–P28 never re-validated | open — E-29 (g) (the `K-10` built at v5.78 is a different check) · the controls run at every package: the second ops package of 2026-10-11 recorded 62 behaved, 0 did not, 1 skipped (P58–P61, no handover package) |
| Part 1: C-13 recorded, not fixed | `FlawsToFix-v5_73-Phase2.md` C-13, OPEN by decision |
| Part 1: "two §86 divergences open" | fixed: the IRMAA engine applies §86 from v5.43; the Roth tab's middle tier v5.45; one helper v5.77 (METHODOLOGY) |
| Part 1: `mammoth` pinned, lockfile "not yet done" | `package-lock.json` committed |
| Part 1: "MC parity 10/10 is EXPECTED and BLIND" (no `stateCode`) | not carried — superseded: `MissingFeatures.md` D-30 records the parity fingerprint household as Georgia's |
| Part 2: F-2/F-8/F-6, F-1/F-4; E-6, E-14/E-18, E-15; E-10; Section C's 2D half | all in their pooled registers (`UsabilityFlaws.md`, `ARCHITECTUREIssues.md` — E-10 re-opened there), and Phase 2 re-ran at v5.73 |
| Part 2: every "replaced", "un-pooled", "stays OPEN" table row | packaging records; each scope named is retired |

**Found while tracing, not fixed** (besides E-29 (k), a v5.72 behaviour change flagged for the maintainer whose only record was already
repo-only): METHODOLOGY still says *"Thirteen of the nineteen exclusion states remain unverified"* directly before
its own v5.86 update saying D-18 read every one; the update is right. Filed as `ARCHITECTUREIssues.md` **E-29 (f)**.

**An independent second read** of the leaving text (a separate agent that had not seen this trace being made) found four threads the
first pass missed — E-29 (g), (h) and (i) and the CommonJS trap — and two wrong statuses in this table (K-10 "built v5.78"; the control
count). All are corrected above before the package shipped. It also confirmed E-29 (a) and (c), the error boundary, Montana's brackets,
the `t10` comment's removal and that §B2a's text is verbatim.

---

# Part 1 — superseded ship notes

> *(Superseded, retained: the v6.03 note follows.)*

> ⚠ **v6.03 SHIPPED (2026-10-10) — D-30 batch 2: the fifteen flat-rate states' deductions, exemptions and personal credits; D-30 closes.** Source `bba6256a…` · built `7acea8cd…`.
> A MODELLING release (METHODOLOGY updated). Fourteen flat-rate states take their standard deductions, exemptions and personal credits (Pennsylvania's law has none);
> Idaho's zero band and Ohio's 2026 schedule (with its $332 step) are modelled; My Data's flat-rate line no longer says "effective rate (an approximation)". New suite `t67`;
> `d30_ref.mjs` extended; derived pins gated in `t10`, `t33`, `t50`–`t53`, `t55`, `t58`–`t61`, `t63`–`t66`; the parity guardrail declares Georgia's `stateTax` fingerprint.
> **Rotation:** the pool loses `DangerClose-v6_02.jsx` and `dom_entry_v602.jsx` (v6.02 read from history, commit `a7bbdb5`) and gains `DangerClose-v6_03.jsx`,
> `dom_entry_v603.jsx` and `t67_deductions_flat.mjs`. **Pool 131 → 132** (count from the Projects listing).
>
> *(Superseded, retained: the v6.02 note follows.)*

> ⚠ **v6.02 SHIPPED (2026-10-09) — Ask AI's answers no longer cut off; D-30 batch 1: the 27 progressive states' deductions, exemptions and personal credits.** Source `d76dddc6…` · built `16a4a850…`.
> A MODELLING release (METHODOLOGY updated). Ask AI asks for 4,096 tokens (was 1,000), says when an answer was cut off, and waits 120 s. The 27 progressive states take their
> standard deductions, exemptions and personal credits (field `deduct`, evaluator `stateDeductions`). New suite `t66` and an independent implementation `d30_ref.mjs`;
> derived pins gated in `t10`, `t35`, `t39`, `t50`–`t55`, `t58`–`t61`, `t64`, `t65`; the shim exports the evaluator. **Rotation:** the pool loses `DangerClose-v6_01.jsx` and
> `dom_entry_v601.jsx` (v6.01 read from history, commit `1c2674e`) and gains `DangerClose-v6_02.jsx`, `dom_entry_v602.jsx`, `t66_deductions_askai.mjs` and `d30_ref.mjs`.
> **Pool 129 → 131** (count from the Projects listing).
>
> *(Superseded, retained: the v6.01 note follows.)*

> ⚠ **v6.01 SHIPPED (2026-10-09) — D-22 option 3, batch 2: the seventeen remaining progressive states on their own schedules; D-22 closes.** Source `b7eb4dcb…` · built `55cae3ab…`.
> A MODELLING release (METHODOLOGY updated). AL AR CT DC DE HI KS MD ME MO MT ND NE NM RI VT WV, with Arkansas's high-income table, Connecticut's phase-out and recapture,
> Maryland's county (3.30 %) and capital-gains taxes, Maine's surcharge, and Hawaii's and Rhode Island's later top brackets. New suite `t65`; derived pins gated in `t10`, `t35`,
> `t39`, `t50`–`t52`, `t54`, `t58`–`t61`, `t64`. **Rotation:** the pool loses `DangerClose-v6_00.jsx` and `dom_entry_v600.jsx` (v6.00 read from history, commit `b800ca1`)
> and gains `DangerClose-v6_01.jsx`, `dom_entry_v601.jsx` and `t65_state_brackets_b2.mjs`. **Pool 128 → 129** (count from the Projects listing).
>
> *(Superseded, retained: the v6.00 note follows.)*

> ⚠ **v6.00 SHIPPED (2026-10-09) — D-22 option 3, batch 1: ten states taxed on their own bracket schedules (CA MN MS NJ NY OK OR SC VA WI).** Source `d535e13e…` · built `3e02a42f…`.
> A MODELLING release (METHODOLOGY updated). New suite `t64`; derived pins gated in `t10`, `t50`–`t53`, `t55`, `t58`, `t59`, `t61`, `t63`. **The first v6 build:** the tooling
> now reads any single-digit major (OPERATIONS §G), and the pool's source is `DangerClose-v6_00.jsx`. **Rotation:** the pool loses `DangerClose-v5_99.jsx` and
> `dom_entry_v599.jsx` (v5.99 read from history, commit `f7ce172`) and gains `DangerClose-v6_00.jsx`, `dom_entry_v600.jsx` and `t64_state_brackets.mjs`. **Pool 127 → 128**
> (count from the Projects listing).
>
> *(Superseded, retained: the v5.99 note follows.)*

> ⚠ **v5.99 SHIPPED (2026-10-09) — D-22 batch 1: the thirteen flat-rate states read for TY2026; Idaho, Indiana and Ohio corrected.** Source `8c02876e…` · built `8047df4c…`.
> A MODELLING release (METHODOLOGY updated). New suite `t63`; `t61`'s rate-claim set widened for v5.99. **Rotation:** the pool loses `DangerClose-v5_98.jsx` and
> `dom_entry_v598.jsx` (v5.98 read from history, commit `9945d3c`) and gains `DangerClose-v5_99.jsx`, `dom_entry_v599.jsx` and `t63_flat_rates.mjs`. **Pool 126 → 127**
> (count from the Projects listing).
>
> *(Superseded, retained: the v5.98 note follows.)*

> ⚠ **v5.98 SHIPPED (2026-10-08) — three desktop-page behaviours disclosed; the glossary in order (F-5, F-7, F-9, F-16).** Source `240f5ae6…` · built `11518a49…`.
> A PRESENTATION release (METHODOLOGY unchanged). New suite `t62`; the v5.97 single-tag gates in `t33`, `t52`, `t58`, `t59`, `t60` became registrable arrays. **Rotation:**
> the pool loses `DangerClose-v5_97.jsx` and `dom_entry_v597.jsx` (v5.97 read from history, commit `ba46635`) and gains `DangerClose-v5_98.jsx`, `dom_entry_v598.jsx`
> and `t62_desktop_disclosures.mjs`. **Pool 125 → 126** (count from the Projects listing).
>
> *(Superseded, retained: the v5.97 note follows.)*

> ⚠ **v5.97 SHIPPED (2026-10-08) — Georgia's and Oklahoma's 2026 rates (D-22, two of 42).** Source `4157137a…` · built `42c082a2…`.
> A MODELLING release (METHODOLOGY updated). New suite `t61`; derived pins gated per build in `t33`, `t52`, `t58`, `t59`, `t60`; `t2` declares its `stateTax` key.
> OPERATIONS §C3 records the v5.96 partial upload. **Rotation:** the pool loses `DangerClose-v5_96.jsx` and `dom_entry_v596.jsx` (v5.96 read from history,
> commit `2d61c3c`) and gains `DangerClose-v5_97.jsx`, `dom_entry_v597.jsx` and `t61_ga_ok_rates.mjs`. **Pool 124 → 125** (count from the Projects listing).
>
> *(Superseded, retained: the v5.96 note follows.)*

> ⚠ **v5.96 SHIPPED (2026-10-08) — the Roth comparator files a survivor's state return single (D-27).** Source `2431abbb…` · built `11bbf9af…`.
> A MODELLING release (METHODOLOGY updated). New suite `t60`; `t8`'s gross-SS check and `t57` C5/C7b re-read the new argument shape. OPERATIONS §I gains the
> no-mount verification procedure. **Rotation:** the pool loses `DangerClose-v5_95.jsx` and `dom_entry_v595.jsx` (v5.95 read from history, commit `caf29a1`)
> and gains `DangerClose-v5_96.jsx`, `dom_entry_v596.jsx` and `t60_engineA_survivor_state.mjs`. **Pool 123 → 124** (count from the Projects listing, not a mounted folder).
>
> *(Superseded, retained: the v5.95 note follows.)*

> ⚠ **v5.95 SHIPPED (2026-10-07) — per-person state rules by plan type; the survivor's own age (D-12 Phase 3).** Source `b8f7039c…` · built `7d270994…`.
> A MODELLING release (METHODOLOGY updated). New suite `t59`; gated inversions in `t35`, `t52`, `t56`, `t57`, `t58`. D-12's scope FULFILLED and un-pooled.
> **Rotation:** the pool loses `DangerClose-v5_94.jsx`, `dom_entry_v594.jsx` (v5.94 read from history, commit `ebdfaa9`) and the retired
> `SCOPE_D12_PLAN_TYPE_PER_PERSON.md`; it gains `DangerClose-v5_95.jsx`, `dom_entry_v595.jsx` and `t59_per_person_state.mjs`. **Pool 123 → 123.**
>
> *(Superseded, retained: the v5.94 note follows.)*

> ⚠ **v5.94 SHIPPED (2026-10-06) — state tax counts the spending draw (D-26).** Source `47090df0…` · built `b3d8b7ea…`.
> A MODELLING release (METHODOLOGY updated): the draw reaches the state calculator in both engines; state tax rises, federal and Engines C/D unchanged.
> New suite `t58`; `t57` now runs on both legs; `t33`'s PINS gained `v594`; the three Python suites registered by hand. Split run (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_93.jsx` and `dom_entry_v593.jsx` (v5.93 is read from history, commit `2a4bfa6`) and gains `DangerClose-v5_94.jsx`,
> `dom_entry_v594.jsx` and `t58_state_draw.mjs`. Repo-only: `controls_v594_state_draw.py` and the fulfilled `docs/SCOPE_D26_STATE_TAX_DRAW.md`. **Pool 122 → 123.**
>
> *(Superseded, retained: the v5.93 note follows.)*

> ⚠ **v5.93 SHIPPED (2026-10-06) — per-person retirement income carried to the state calculator, not yet used (D-12 Phase 2).** Source `e60a0971…` · built `b7ebd28e…`.
> An ENGINE-PLUMBING release, no figure moves (METHODOLOGY unchanged). **There is no v5.92** — `v592` is the retired v5.9.2 leg's tag (OPERATIONS §G, the registry
> shapes). New suite `t57`; `t33`'s PINS gained `v593`; the three Python suites registered by hand. Split run (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_91.jsx` and `dom_entry_v591.jsx` (v5.91 is read from history, commit `54764c5`) and gains `DangerClose-v5_93.jsx`,
> `dom_entry_v593.jsx` and `t57_attribution_carry.mjs`. Repo-only: `controls_v593_attribution.py`. **Pool 121 → 122.**
>
> *(Superseded, retained: the v5.91 note follows.)*

> ⚠ **v5.91 SHIPPED (2026-10-06) — plan type and pension owner, collected but not yet used (D-12 Phase 1).** Source `bdeb550d…` · built `ed695a74…`.
> A DATA-MODEL release, no figure moves (METHODOLOGY unchanged). New suite `t56`; `t33`'s PINS gained `v591`. Split run (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_90.jsx` and `dom_entry_v590.jsx` (v5.90 is read from history, commit `39014e0`) and gains `DangerClose-v5_91.jsx`,
> `dom_entry_v591.jsx`, `t56_plan_type_collect.mjs` and the active `SCOPE_D12_PLAN_TYPE_PER_PERSON.md`. Repo-only: `controls_v591_plantype.py`. **Pool 119 → 121.**
>
> *(Superseded, retained: the v5.90 note follows.)*

> ⚠ **v5.90 SHIPPED (2026-10-02) — the law's age gates on IA/PA/MS's exemptions; Michigan's cap (D-24).** Source `653fff47…` · built `153ad9a2…`.
> A MODELLING release (METHODOLOGY updated): `retExemptAge`, `retExemptPensionAnyAge`, `retCap`. New suite `t55`; `t10` gained one gated check. Split run (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_89.jsx` and `dom_entry_v589.jsx` (v5.89 is read from history, commit `db860f2`) and gains `DangerClose-v5_90.jsx`,
> `dom_entry_v590.jsx`, `t55_retexempt_age.mjs`. Repo-only: `controls_v590_retexempt.py` and the fulfilled `docs/SCOPE_D24_RETEXEMPT_AGE.md`. **Pool 118 → 119.**
>
> *(Superseded, retained: the v5.89 note follows.)*

> ⚠ **v5.89 SHIPPED (2026-10-02) — West Virginia's $8,000 senior modification is reduced by the person's taxable SS (D-21).** Source `abf14500…` · built `ae0f99bf…`.
> A MODELLING release (METHODOLOGY updated): a WV-only field `seniorVsTaxableSS`; MD/ME/CO untouched. New suite `t54`. Suite run as two concurrent halves (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_88.jsx` and `dom_entry_v588.jsx` (v5.88 is read from history, commit `b584b50`) and gains `DangerClose-v5_89.jsx`,
> `dom_entry_v589.jsx`, `t54_wv_senior_modification.mjs`. Repo-only: `controls_v589_wv_senior.py` and the fulfilled `docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md`. **Pool 117 → 118.**
>
> *(Superseded, retained: the v5.88 note follows.)*

> ⚠ **v5.88 SHIPPED (2026-10-01) — My Data's summary says the age the model applies, and the exact figure (D-25).** Source `9843bd17…` · built `115b6883…`.
> A PRESENTATION release: one display template; no figure, rate, rule or age moved. New suite `t53`. Suite run as two concurrent halves, half A re-run (CHANGELOG).
> **Rotation:** the pool loses `DangerClose-v5_87.jsx` and `dom_entry_v587.jsx` (v5.87 is read from history, commit `622d0ec`) and gains `DangerClose-v5_88.jsx`,
> `dom_entry_v588.jsx`, `t53_mydata_summary_age.mjs`. Repo-only: `controls_v588_summary_age.py` and the fulfilled `docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md`. **Pool 116 → 117.**
>
> *(Superseded, retained: the v5.87 note follows.)*

> ⚠ **v5.87 SHIPPED (2026-10-01) — six state notes say when the model applies the exclusion (D-23).** Source `3bb42add…` · built `0b9b36a0…`.
> A PRESENTATION release: NY, AR, GA, IA, OK and PA notes rewritten; no figure, rate, rule or age moved. New suite `t52`. Files D-24 (`retExempt` has
> no age gate — IA/PA optimistic) and D-25 (My Data's "65+" summary; v5.88). Suite run as two concurrent halves (CHANGELOG). **Rotation:** the pool
> loses `DangerClose-v5_86.jsx` and `dom_entry_v586.jsx` (v5.86 is read from history, commit `754e948`) and gains `DangerClose-v5_87.jsx`,
> `dom_entry_v587.jsx`, `t52_age_start_notes.mjs`; `controls_v587_age_notes.py` and the fulfilled `docs/SCOPE_D23_AGE_START_NOTES.md` are repo-only. **Pool 115 → 116.**
>
> *(Superseded, retained: the v5.86 note follows.)*

> ⚠ **v5.86 SHIPPED (2026-09-30) — every state dollar figure carries its tax year (D-18); Maine's and Louisiana's refreshed.** Source
> `74c880bc…` · built `bad51541…`. A MODELLING release: `years` on the 23 dollar-bearing state rows (31 figures), shown in My Data
> in place of "Model (2026 approx)"; Maine's cap $49,824 (TY2026), Louisiana's exemption $12,324 (TY2026), South Carolina's note
> corrected. The example household has no state, so it does not move (§K1). New suite `t51`. Files D-21, D-22, D-23 (D18-3 open).
> **Rotation:** the pool loses `DangerClose-v5_85.jsx` and `dom_entry_v585.jsx` (v5.85 is read from history, commit `36070e1`) and
> gains `DangerClose-v5_86.jsx`, `dom_entry_v586.jsx`, `t51_state_figure_years.mjs`; `controls_v586_state_years.py` and the
> fulfilled `docs/SCOPE_D18_STATE_FIGURES.md` are repo-only. **Pool 114 → 115.**
>
> *(Superseded, retained: the v5.85 note follows.)*

> ⚠ **v5.85 SHIPPED (2026-09-29) — Social Security in seven states follows each state's law (D-19); Utah 4.45 %.** Source
> `a1d9c5e0…` · built `7ff3d434…`. A MODELLING release: CO, CT, MN, NM, RI, UT, VT each carry an `ssRule` (their statute, per
> year and per spouse) instead of a flat half; Utah's rate 4.45 % (S.B. 60). Example household lifetime state tax: CO +$9,642 (the
> SS subtraction consumes the pension cap), VT +$23,655, the other five down. New suite `t50` (statute-typed). **Rotation:** the pool
> loses `DangerClose-v5_84.jsx` and `dom_entry_v584.jsx` (v5.84 is read from history, commit `62c8aeb`) and gains
> `DangerClose-v5_85.jsx`, `dom_entry_v585.jsx`, `t50_ss_states.mjs`; `controls_v585_ss_states.py` is repo-only. **Pool 113 → 114.**
>
> *(Superseded, retained: the v5.84 note follows.)*

> ⚠ **v5.84 SHIPPED (2026-09-29) — the Roth comparator sees your spending draw (D-7); D-4 measured.** Source `1d720880…` · built
> `985b488b…`. A MODELLING release: Engine A (comparator, solve-for grid, its current row, the stress solver's tax estimate)
> taxes the household's spending draw — taxed, not drained (K-1). Example household: Fill 12 % $218,720 → $150,518; the grid's
> winner stays Fill 12 %. New suite `t49` (dollar-exact). METHODOLOGY §7 and the drawdown section rewritten. **Rotation:** the
> pool loses `DangerClose-v5_83.jsx` and `dom_entry_v583.jsx` (v5.83 is read from history, commit `6af40fc`) and gains
> `DangerClose-v5_84.jsx`, `dom_entry_v584.jsx`, `t49_engineA_draw.mjs`; `controls_v584_draw.py` is repo-only. **Pool 112 → 113.**
>
> *(Superseded, retained: the v5.83 note follows.)*

> ⚠ **v5.83 SHIPPED (2026-09-29) — every skin readable: light-skin surfaces, selected items, hovered rows.** Source `47beecf8…` · built
> `9f39232e…`. A presentation release: no engine changed, parity 10/10; desktop layout box-for-box identical to v5.82. The
> 366 dark-theme `rgba()` surfaces are skin tokens; light skins get `--on-ring` for selected items; hovered rows use a light
> accent wash (the DEFAULT skin's hovered row read 2.66:1); four light skins' semantic colours darkened slightly. `t48`'s pins are
> gone — all 13 skins must be 0, hover included. **Single-source rotation:** the pool loses `DangerClose-v5_82.jsx` and
> `dom_entry_v582.jsx` (v5.82 is read from history, commit `b9f8943`) and gains `DangerClose-v5_83.jsx`, `dom_entry_v583.jsx`;
> `controls_v583_surfaces.py` is repo-only. **Pool stays 112.**
>
> *(Superseded, retained: the v5.82 note follows.)*

> ⚠ **v5.82 SHIPPED (2026-09-29) — legible text and usable targets (F-3/F-4).** Source `f6a54749…` · built `725bde15…`. A
> presentation release: no engine changed, parity 10/10. `--ink-faint` reaches AA in every skin; the default and the seven dark
> skins have no text below AA on any tab; nothing under 11 px; every control ≥ 24 px, five phone-critical controls 44 px. The six
> light skins' remaining failures (tinted `rgba()` surfaces) are KNOWN DEFECT pins in the new `t48` (Chromium, ~10 min), owned by
> a v5.83 surface pass. **Single-source rotation:** the pool loses `DangerClose-v5_81.jsx` and `dom_entry_v581.jsx` (v5.81 is
> read from history, commit `e881715`) and gains `DangerClose-v5_82.jsx`, `dom_entry_v582.jsx`, `t48_legibility_targets.py`;
> `controls_v582_legibility.py` is repo-only. **Pool 111 → 112.**
>
> *(Superseded, retained: the v5.81 note follows.)*

> ⚠ **v5.81 SHIPPED (2026-09-28) — a phone's first screen shows the plan (F-12).** Source `cdca3275…` · built `c711610e…`. A
> presentation release: no engine changed, parity 10/10. Below 600 px the tab grid is one native menu and the retirement cards +
> allocation strip fold into one line; content begins at y = 613 (v5.80: 1005). Desktop and tablet unchanged element by element.
> New `t47` (Chromium); `t45` moves between tabs through the phone menu. **The first single-source rotation:** the pool loses
> `DangerClose-v5_80.jsx` and `dom_entry_v580.jsx` (v5.80 is read from history, commit `4aeabb1`) and gains `DangerClose-v5_81.jsx`,
> `dom_entry_v581.jsx`, `t47_phone_first_screen.py`; `controls_v581_first_screen.py` is repo-only. **Pool 110 → 111.** Records
> Steve's decision that the 24 release-pinned controls stay out of the pool.
>
> *(Superseded, retained: the third ops note of 2026-09-28 follows.)*

> ⚠ **OPS PACKAGE 2026-09-28 (third) — control P22 fixed.** It picked "the prior source" from the pool by glob, which found the
> current one once the pool became single-source, so it planted no defect (reported NOT CAUGHT post-upload). It now resolves
> the prior from the clone's history by md5 and refuses to run vacuously. v5.80 stays current; pool stays 110.
>
> *(Superseded, retained: the second ops note of 2026-09-28 follows.)*

> ⚠ **OPS PACKAGE 2026-09-28 (second) — the pool keeps ONE source.** v5.80 stays current. The prior build's source is read
> from the repo's history by the md5 recorded for its version (`mk_runfolder.sh`, no third argument); `DangerClose-v5_79.jsx`
> and `dom_entry_v579.jsx` leave the pool (~1.3 MB). `package_check` J-3/J-4 assert ONE source and ONE dom entry, K-6 the
> pool's source is the Current table's, new K-5b the Prior md5 is held by a commit; controls P68–P71 and the new pooled
> `controls_runfolder_prior.sh`. **Pool 111 → 110.** OPERATIONS reconciles a contradiction the first ops package introduced.
>
> *(Superseded, retained: the first ops note of 2026-09-28 follows.)*

> ⚠ **OPS PACKAGE 2026-09-28 — the knowledge pool ran out of room; ~430 KB freed, nothing deleted.** v5.80 stays current.
> The pooled `CHANGELOG.md` now holds **v5.75 onward**; v5.60–v5.74 moved verbatim to `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`
> (repo only). The **24 release-pinned `controls_v5*` scripts are un-pooled** (repo copies stay; rows read *un-pooled,
> repo-only*; three had no row and gained one); OPERATIONS §G says new ones ship to `github/` only. **Pool 135 → 111.**
>
> *(Superseded, retained: the v5.80 ship note follows.)*

> ⚠ **v5.80 SHIPPED (2026-09-27) — Bull-leaning is the default scenario, and each user's choice is remembered.** Source
> `7a04dadb…` · built `a7394fad…`. No engine changed (parity 10/10); the scenario a run assumes unless the user chooses
> otherwise did, so METHODOLOGY's default-prior passage is rewritten. The preset persists per browser (`STORAGE_KEYS.scenario`),
> like `ssCut`/`acaRegime`; cleared by "delete everything"; not in backups. `domdiff` now pins BASE for both legs, so it keeps
> comparing engines, not defaults. `SCOPE_SCENARIO_DEFAULT.md` FULFILLED, repo-only. Suite, counts, controls: the CHANGELOG
> and `TESTING.md`. New to the pool: `DangerClose-v5_80.jsx`, `dom_entry_v580.jsx`, `t46_scenario_default.mjs`,
> `controls_v580_scenario.py`; rotated out: `DangerClose-v5_78.jsx`, `dom_entry_v578.jsx`. **Pool 133 → 135.**
>
> *(Superseded, retained: the v5.79 ship note follows.)*

> ⚠ **v5.79 SHIPPED (2026-09-27) — the app fits a phone (F-11).** Source `b06841a0…` · built `137a992f…`. A presentation
> release: no engine changed, parity 10/10. All 26 tabs fit at 390 px (v5.78: none); desktop and tablet unchanged element by
> element. Every 1fr grid track may now narrow; wide tables and card rows scroll inside their own box (decision D-1); selects
> capped at the screen width. **New: `t45`, the first suite in real Chromium, against the BUILT page** — it fails, never
> skips, without a browser or on a stale page. `mk_runfolder.sh` now copies Python suites and the built page. F-12 (the first
> screen is all chrome) is its own release (D-3). `SCOPE_PHONE_LAYOUT.md` FULFILLED, repo-only. Suite, counts, controls: the
> CHANGELOG and `TESTING.md`. New to the pool: `DangerClose-v5_79.jsx`, `dom_entry_v579.jsx`, `t45_phone_layout.py`,
> `controls_v579_layout.py`; rotated out: `DangerClose-v5_77.jsx`, `dom_entry_v577.jsx`. **Pool 131 → 133.**
>
> *(Superseded, retained: the v5.78 ship note follows.)*

> ⚠ **v5.78 SHIPPED (2026-09-26) — the IRMAA top tier starts at its threshold (C-1), one tier rule, and the audit tidy-up.**
> Source `53659764…` · built `a11c46dc…`. Engines A and C choose IRMAA tiers through one `irmaaTierFor`, which applies
> §1395r(i)(3)(C)'s "at least" to the top tier; the IRMAA tab's headroom from tier 4 is a dollar less (D-1) and its label
> reads `≥`. C-13 (unrounded projected thresholds) recorded, not fixed (D-2). **The example household does not move** — tax,
> widow tax and IRMAA identical in all seven Roth strategies. Tidy-up folded in: the audit table's C-8/C-3/C-6 marked fixed;
> the Phase 3 documents now name their v5.73 pin first; `package_check` gains **K-10** and **K-11** (this note is what K-11
> reads). `SCOPE_IRMAA_TOP_TIER.md` FULFILLED, repo-only. Suite, counts and controls: the CHANGELOG and `TESTING.md`. New to
> the pool: `DangerClose-v5_78.jsx`, `dom_entry_v578.jsx`, `t44_irmaa_top_tier.mjs`, `controls_v578_irmaa.py`; rotated out:
> `DangerClose-v5_76.jsx`, `dom_entry_v576.jsx`. **Pool 129 → 131.**
>
> *(Superseded, retained: the v5.77 ship note follows.)*

> ⚠ **v5.77 SHIPPED (2026-09-25) — one §86 rule for every engine: C-4, C-12 (the scope's §1f) and D-1 fixed.**
> Source `9cdd345d…` · built `a2bc6745…`. Engines A, B, C and the Roth tab share one `taxableSS86`, written from the IRS
> worksheet. Engine A's upper tier regains line 14 (C-4, pessimistic); Engine C stops taxing a single household on the joint
> thresholds (C-12, optimistic); METHODOLOGY's contradictory §86 passage is replaced (D-1). **The example household does not
> move** (seven Roth strategies identical; MC parity 10/10; `domdiff` 32/32). `SCOPE_SS86_ONE_RULE.md` FULFILLED, repo-only.
> Suite, counts and controls: the v5.77 CHANGELOG entry and `TESTING.md` — not restated here. New to the pool:
> `DangerClose-v5_77.jsx`, `dom_entry_v577.jsx`, `t43_ss86_one_rule.mjs`, `controls_v577_ss86.py`; rotated out:
> `DangerClose-v5_75.jsx`, `dom_entry_v575.jsx`. **Pool 127 → 129.**
>
> ⚠ **The v5.75 and v5.76 ships left no note here and no retirement-list entry** — their hash rows and the two build tables
> were rolled, but this block still led with the 2026-09-22 ops note and "Shipped" still read v5.74's date. Found at the
> v5.77 ship; recorded rather than back-filled, because a note written now would carry a date it was not written on. Their
> record is the CHANGELOG and the per-row "rolled at" marks.
>
> *(Superseded, retained: the 2026-09-22 ops note follows.)*

> ⚠ **OPS PACKAGE 2026-09-22 — `package_check` checks the two declarations a package relies on (`C-7`, `G-3c`).**
> v5.74 stays current; no source changed. `SCOPE_PACKAGE_CHECK_DECLARATIONS.md` written, built and retired (repo-only).
> Pool stays **123**.
>
> *(Superseded, retained: the v5.74 ship note follows.)*

> ⚠ **v5.74 SHIPPED (2026-09-21) — C-8 / E-21 / D-14 fixed: the Taxes and IRMAA tabs take the plan's spending draws.**
> Source `1ff04dee…` · built `4e7532a4…`. Headline on the tab's as-is reading **−$35,309 (−14.5%)**; at first open **+$1,540**.
> `SCOPE_TAXES_DRAWDOWN.md` **retired and un-pooled** (repo copy stays; D-4 and D-7 re-homed in `FlawsToFix-v5_73-Phase2.md`).
> A first candidate (`2f8a22c8…`) was superseded before ship. Suite from the packaged copies: **4,181 app checks, 0 failed, 0 DIED**;
> parity 10/10; GRAND 4,315. New to the pool: `DangerClose-v5_74.jsx`, `dom_entry_v574.jsx`, `t40_cross_tab_agreement.mjs`,
> `controls_v574_c8.py`; rotated out: `DangerClose-v5_72.jsx`, `dom_entry_v572.jsx`. **Pool 122 → 123.**
>
> *(Superseded, retained: the fifth 2026-09-18 note follows.)*

> ⚠ **OPS PACKAGE 2026-09-18 (fifth) — D-9 resolved; `SCOPE_TAXES_DRAWDOWN.md` is BUILDABLE.** The Taxes tab **keeps
> `BASE_GROWTH`** rather than inheriting Engine D's 3.518%, so the C-8 release moves the headline **−$35,624 (15%)**, not 62%.
> ⚠ The decision **qualifies D-2**: Engine B recomputes the Traditional balance from D's draws **at its own growth** — it does not
> copy D's path. A build that copies lands at $166,270, $42,146 off, while looking correct. **The build must reproduce $208,416.**
> Pool stays **122**; v5.73 stays current; no source changed.
>
> *(Superseded, retained: the fourth 2026-09-18 note follows.)*

> ⚠ **OPS PACKAGE 2026-09-18 (fourth) — the C-8 counterfactual, measured BEFORE the build, sent two decisions back.**
> `SCOPE_TAXES_DRAWDOWN.md` §11 step 2 was executed and came out materially different, so the session stopped and reported.
> **The defect is worth −$35,624 (15%), not the −$152,311 (62%) A2 as first written produced.** **D-3 is narrowed** (deflate
> the DRAW term only — applying it to the RMD term was worth $74,541, more than the defect) and **D-9 is OPEN** (does the Taxes
> tab adopt Engine D's 3.518% growth, worth $42,146, or keep `BASE_GROWTH`?). **The scope is NOT BUILDABLE until D-9 is
> answered**; its row and status line say so. Three §3.5 probes to `qa/tools/audit_phase2_v573/`, repo only. Pool stays **122**.
>
> *(Superseded, retained: the third 2026-09-18 note follows.)*

> ⚠ **OPS PACKAGE 2026-09-18 (third) — `OPERATIONS.md` §L gains the pool-membership test.** A file's pool membership is
> answered by **this manifest's inventory, not by its repo path**: the block records this morning's `package_check.mjs` miss
> (a pooled file that looked repo-only because it sits beside repo-only probes), why the mistake was available, and the check
> to run while packaging — for every `github/` file, if the manifest names it pooled, there must be a `knowledge/` copy and a
> delete-first entry. Second occurrence for that one file; the §A2 note below records the first. Pool stays **122**; v5.73 stays current.
>
> *(Superseded, retained: the second 2026-09-18 note follows.)*

> ⚠ **OPS PACKAGE 2026-09-18 (second) — the pool copy of `package_check.mjs`, which the probe package shipped repo-only.**
> That package edited the file and rolled its row to `bbb9fac0478a9e3f45af6868961b2153` while uploading only the repo copy, so the
> pool kept `2554d811fe…` and this table asserted a hash the pool did not hold — the false-MATCH shape §I calls worse than no row.
> Caught post-ship by `package_check` **K-8**. **The row is NOT rolled here: it was already right, and the POOL was wrong.**
> ⚠ **Directory is not destination.** `package_check.mjs` sits in `qa/tools/` beside the repo-only probes and is **pooled**;
> a file's repo path is not the test of whether it is in the pool. Pool stays **122**. v5.73 stays current.
>
> *(Superseded, retained: the 2026-09-18 probe-package note follows.)*

> ⚠ **OPS PACKAGE 2026-09-18 — the C-8 scope's probes, and the manifest row that scope landed without. Pool 121 → 122.**
> `SCOPE_TAXES_DRAWDOWN.md` (C-8 / E-21 / D-14) was committed to `docs/` and uploaded to the pool on 2026-09-18 **with no
> row here** — the third place a document has to land, and the one that was missed. Its row is below; its three probes go to
> `qa/tools/audit_phase2_v573/`, **repo only**; `package_check.mjs` gains its I-2 OPEN-allowlist entry, one package late.
> **All eight of the scope's decisions were RESOLVED 2026-09-18** (the recommendations adopted), so it is OPEN-because-UNBUILT.
> v5.73 stays current; no source, no version, no suite total changes. Figures in `CHANGELOG.md` ops 2026-09-18.
>
> *(Superseded, retained: the seventh ops note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 (seventh) — project-knowledge space recovered. Pool 133 → 121.** Twelve retired or
> historical documents are **un-pooled** (repo copies kept) and the pooled `CHANGELOG.md` now holds **v5.60 onward** —
> older entries are `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`, repo only (§G). Two open follow-ups that were leaving with
> `SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` are re-homed in `FlawsToFix-v5_69-Phase1.md`'s header. v5.73 stays current.
>
> *(Superseded, retained: the sixth ops note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 (sixth) — standing audit Phases 3 and 4 at v5.73; the full audit run is COMPLETE.**
> `MissingFeatures.md` (D-14–D-20), `ARCHITECTUREIssues.md` (E-21–E-28) and `UsabilityFlaws.md` (F-11, F-12) each gain a
> v5.73 block to read first; the top-five summary is rewritten (repo only). Pool stays **133**. Next work: scope the fixes,
> starting with C-8 / E-21 / D-14. v5.73 stays current.
>
> *(Superseded, retained: the fifth ops note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 (fifth) — standing audit Phase 2 (Section C) at v5.73 is COMPLETE; findings only.**
> `FlawsToFix-v5_73-Phase2.md` arrives (pool **132 → 133**); its probes go to the repo only (`qa/tools/audit_phase2_v573/`).
> **Read its §0 first.** C-8 (high) — the Taxes tab never taxes spending withdrawals from Traditional accounts — is the
> most material open defect in the app. Phases 3 (D + E) and 4 (F) of the audit remain. v5.73 stays current.
>
> *(Superseded, retained: the v5.73 ship note follows.)*

> **Rolled 2026-09-15 at the v5.73 ship.** Rotation removes `DangerClose-v5_71.jsx` and `dom_entry_v571.jsx` from the POOL;
> the pool holds exactly `DangerClose-v5_72.jsx` and `DangerClose-v5_73.jsx`, and `dom_entry_v572.jsx` and `dom_entry_v573.jsx`.
> **v5.73 models Maine's pension-deduction phaseout and corrects Montana ($5,660; Social Security taxed as federally).**
> `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` is written and RETIRED in this package; its three leads are filed in
> `FlawsToFix-v5_69-Phase1.md`'s header. **Pool goes 129 → 132.** Figures in `CHANGELOG.md` v5.73.
>
> *(Superseded, retained: the tooling ops note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 (fourth) — four tooling gaps fixed; `SCOPE_TOOLING_GAPS_V572.md` written, built and RETIRED
> in this one package. v5.72 STAYS CURRENT; no source change, no bump, no rotation.** `vercensus` counts version maps;
> `package_check` K-1…K-3 read the tree as the package leaves it and G-1 accepts a handover's workbench by content;
> `mk_runfolder.sh` restores the committed `package.json`/`package-lock.json`. Figures in `CHANGELOG.md`. **Pool goes 128 → 129**
> (the scope arrives). `package_check_controls.sh` must now be run in BOTH phases (`OPERATIONS.md`).
>
> *(Superseded, retained: the v5.72 ship note follows.)*

> **Rolled 2026-09-15 at the v5.72 ship.** Rotation removes `DangerClose-v5_70.jsx` and `dom_entry_v570.jsx` from the POOL;
> the pool holds exactly `DangerClose-v5_71.jsx` and `DangerClose-v5_72.jsx`, and `dom_entry_v571.jsx` and `dom_entry_v572.jsx`.
> The `dom_entry_v570.jsx` row left the §A2 hash table and the `dom_entry_v572.jsx` row arrived in this same edit.
> `src/index.html` and `src/main.jsx` are UNCHANGED; v5.71 rebuilt byte-identically (`e1bd283b…`) before v5.72 was built.
>
> **v5.72 ships import hardening (A-2, A-4, A-5) and state-set stage 2, and moves no figure for a plan entered through the
> app.** Both scopes RETIRE here with §10 build records and leave `package_check`'s I-2 allowlist in this package, which now
> holds ONE entry, read from the gate: `SCOPE_STANDING_AUDIT.md`. The session-1 handover's `shim.txt` repo/pool difference
> is CLOSED by this rotation. `runsuite.sh` now counts a DIED suite as a failure. Figures, controls, the superseded first
> candidate and the limitations are in `CHANGELOG.md` v5.72 and are not restated here.
>
> *(Superseded, retained: the session-1 handover note follows.)*

> ⚠ **HANDOVER 2026-09-15 — import hardening, SESSION 1 built as a WORKBENCH. v5.71 STAYS CURRENT; no bump, no rebuild, no rotation.**
> H-1…H-5 and the stream/claim-age half of H-6 are built, with `t38_import_hardening.mjs` and one negative
> control per fix. **Read `STOP-REPORT-v5_72-import-hardening-session1.md` first** — it carries every file,
> its md5 and its destination, and what session 2 owes. ⚠ **A new decision is open: D-10** (scope §7a) — the
> v5.9.1 birth-year clamp can never fire, because birth dates are stored as strings.
> ⚠ **The unshipped source is `handover/DangerClose-v5_72-WORKBENCH.jsx` in the handover zip. It is NOT in
> the repo's `src/` and NOT in the pool** — do not put it in either until session 2 bumps it.
> ⚠ **Known, deliberate repo/pool difference until v5.72 ships:** the repo's `qa/qa-baseline/shim.txt` gains
> five guarded getters for `t38`; the pool keeps the v5.71 copy, so its hash row below stays true of the
> POOL. A §A2 clone-diff will show `shim.txt` differing — **that is this handover, not drift.**
>
> *(Superseded, retained: the scope-package note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 (second) — `SCOPE_IMPORT_HARDENING.md` is written. v5.71 stays current; no source, no rebuild, no rotation.**
> Scopes A-2, A-4 and A-5 for **v5.72** — **all three re-run at v5.71 and still reproducing** — with
> SCOPE_STATE_SET_SELECTOR stage 2 folded in. **Nothing is built. All nine decisions were taken the same day — the maintainer approved every recommendation — so the scope is BUILDABLE**, in two sessions (D-6). The I-2
> allowlist now holds **three** entries, read from the gate: `SCOPE_STANDING_AUDIT.md`,
> `SCOPE_STATE_SET_SELECTOR.md`, `SCOPE_IMPORT_HARDENING.md`. ⚠ **Maine is income-limited in law from TY2025 and
> is missing from the suite's in-law list** — recorded in SCOPE_STATE_SET_SELECTOR §9, decided at D-8.
> `FlawsToFix-v5_69-Phase1.md` joins the pool while the scope is open.
>
> *(Superseded, retained: the stage-1 note follows.)*

> ⚠ **OPS PACKAGE 2026-09-15 — SCOPE_STATE_SET_SELECTOR, STAGE 1. v5.71 stays current; no source, no rebuild, no rotation.**
> Builds stage 1 of the scope (its §7.6/§7.7): the suite's income-limited state set now comes from one shared module,
> `qa/tools/state_sets.cjs`; `t29` F-6 and `t35` D-7 take membership from its list rather than from note prose; the six
> phrase pins read its one matcher; and **`f6_probe.cjs` is repaired** — it had reported the complement of the gate
> since v5.68. **The scope STAYS OPEN and stays on `package_check`'s I-2 allowlist**: stage 2 (the `incomeLimitedInLaw`
> field) is owed to the next release that bumps the version. The allowlist still holds two entries, read from the gate:
> `SCOPE_STANDING_AUDIT.md` and `SCOPE_STATE_SET_SELECTOR.md`.
>
> **APP total UNCHANGED at 3,647.** A new TOOLING suite, `state_sets_check.mjs`, adds 10 per leg outside it. ⚠ **`t29` is
> IN the app total** — its header said otherwise and was corrected here. Figures, controls and limitations are in
> `CHANGELOG.md` and the scope's §8, and are not restated here.
>
> *(Superseded, retained: the 2026-09-14 t21 Section F note follows.)*

> ⚠ **OPS PACKAGE 2026-09-14 (third) — `t21` Section F. v5.71 stays current; no source, no rebuild, no rotation.**
> Builds **Item B of `SCOPE_HOUSEKEEPING_THREE.md`**, the last of its three items, and **RETIRES the scope** — its
> `package_check` **I-2 OPEN allowlist** entry is removed in this same package, as I-2 requires. **The allowlist now holds
> two entries**, read from the edited gate rather than from an older banner: `SCOPE_STANDING_AUDIT.md`
> (not a build scope) and `SCOPE_STATE_SET_SELECTOR.md`. ⚠ *A first draft of this line named
> `SCOPE_INCOME_CONDITIONING.md`, which left the allowlist at the v5.69 ship — §A0 exactly: a name
> restated from a retained historical banner instead of read from the file.*
>
> ⚠ **Item B did NOT ship the coverage it asked for, and the reason is the record worth keeping.** Re-measured by AST,
> `qa/tools/` holds **sixteen** tools that parse with `acorn`, `t21` covers **four**, and **none of the other twelve is
> reachable by `qa/tools/fixture/fixture.jsx`** — eight need a directory fixture, three need a `STATE_RULES` table, and
> `census_p1.cjs` runs but answers **zero to all fifteen** of its questions, so a deliberately sabotaged copy produces
> **byte-identical output**. The item closed on **disclosure plus one pin**, not on cases that would have been vacuous.
> `t21` **50 → 56**; `TESTING.md` names all twelve with a reason each; the fixture-design work is a separate scope, with
> its requirements recorded in the scope's §7 so they are not re-derived.
>
> **APP total UNCHANGED at 3,647**, summed from `runsuite.sh` output across 58 legs — `t21` is tooling, so its rise must
> not move it. GRAND **3,735**, 0 failing, MC parity 10/10, run from the packaged copies. Figures, the three stale
> documents this package found, and the stated limitations are in `CHANGELOG.md` and are not restated here.
>
> *(Superseded, retained: the v5.71 ship note follows.)*

> **Rolled 2026-09-14 at the v5.71 ship.** Rotation removes `DangerClose-v5_69.jsx` and `dom_entry_v569.jsx` from the POOL;
> the pool holds exactly `DangerClose-v5_70.jsx` and `DangerClose-v5_71.jsx`, and `dom_entry_v570.jsx` and `dom_entry_v571.jsx`. The
> `dom_entry_v569.jsx` row left the §A2 hash table and the `dom_entry_v571.jsx` row arrived in this same edit.
>
> ⚠ **`src/index.html` CHANGES at v5.71** (`9d6f7519c01feb8ddd1133e9a6f2a599`, was `52ef2be3080352df6198ee3b8c3507ad`) — finding F-3,
> the first-open gate's unconditional "nothing is uploaded". This is a SCAFFOLD change, so §N3a's scaffold check had to rebuild v5.70
> with **v5.70's own** `src/index.html` from git rather than the new one; it reproduced `372d066cf4fc7115ebdae9fc9d6f35d1`
> byte-identically. `smoke_built` **22/22** against the packaged `index.html` (20 at v5.70; F-3 adds two).
>
> **v5.71 FIXES A-3, A-6, F-3 and F-1, and moves no figure.** The My Data draft autosave had never saved in any release since it was
> added: the draft code called `getItem`/`setItem`/`removeItem`, which the storage contract does not have. The draft key joins
> `STORAGE_KEYS` so `clearStorage` and `t5`'s key-map loop cover it — without that half the fix would have shipped a new privacy defect
> on top of a closed one. `SCOPE_A3_DRAFT_AUTOSAVE.md` RETIRES in this package with a build record and stays in the pool; its `I-2`
> allowlist entry is removed from `package_check.mjs` in the same package. Figures, per-suite counts, the two corrections to that
> scope's own text, and the build's own errors (a mis-registered `t24` `_k` gate and a missed `t31` `ORDER` ladder) are in
> `CHANGELOG.md` v5.71 and are not restated here.
>
> *(Superseded, retained: the v5.70 note follows.)*

> **Rolled 2026-09-11 at the v5.70 ship.** Rotation removes `DangerClose-v5_68.jsx` and `dom_entry_v568.jsx` from the POOL;
> the pool holds exactly `DangerClose-v5_69.jsx` and `DangerClose-v5_70.jsx`, and `dom_entry_v569.jsx` and `dom_entry_v570.jsx`. The
> `dom_entry_v568.jsx` row left the §A2 hash table and the `dom_entry_v570.jsx` row arrived in this same edit.
>
> **v5.70 FIXES THE AUDIT'S B-3 and moves no figure.** On a self-hosted copy with neither a saved key nor a Local Model, Ask AI sent the
> plan context as a keyless request that `src/main.jsx` rewrote to the page's own host; it now sends nothing. `src/main.jsx` is untouched.
> `SCOPE_B3_KEYLESS_AI_ROUTE.md` RETIRES in this package and leaves the pool. Figures, per-suite counts and the build's own error (`t33`'s
> missed `PINS` entry) are in `CHANGELOG.md` v5.70 and are not restated here.
>
> ⚠ **The built artifact's hash is trustworthy, not merely recorded.** Per §N3a the scaffold check ran: rebuilding v5.69 from its own
> unmodified source reproduced `86703918db247e3284752f0f1cc1f6d5` byte-identically. `smoke_built` 20/20 against the packaged `index.html`.
>
> *(Superseded, retained: the v5.69 note follows.)*
>
> **Rolled 2026-09-10 at the v5.69 ship.** Rotation removes `DangerClose-v5_67.jsx` and `dom_entry_v567.jsx` from the POOL;
> the pool holds exactly `DangerClose-v5_68.jsx` and `DangerClose-v5_69.jsx`, and `dom_entry_v568.jsx` and `dom_entry_v569.jsx`. The
> `dom_entry_v567.jsx` row left the §A2 hash table and the `dom_entry_v569.jsx` row arrived in this same edit.
>
> **v5.69 POPULATES RHODE ISLAND — THE LAST OF THE FIVE — and CHANGES A USER'S NUMBER, in the CONSERVATIVE direction only**: 34,992
> households, tax fell in none, largest rise $5,000.00/yr. ⚠ **The model's best Roth cell changed for one of four Rhode Island
> households measured.** `SCOPE_INCOME_CONDITIONING.md` and `SCOPE_RI_POPULATE.md` RETIRE in this package and leave
> `package_check`'s I-2 allowlist together. Figures and the build's own errors are in `CHANGELOG.md` v5.69, not restated here.
>
> *(Superseded, retained: the v5.68 note follows.)*

> **Rolled 2026-09-10 at the v5.68 ship.** Rotation removes `DangerClose-v5_66.jsx` and
> `dom_entry_v566.jsx` from the POOL; the pool holds exactly `DangerClose-v5_67.jsx` and
> `DangerClose-v5_68.jsx`, and `dom_entry_v567.jsx` and `dom_entry_v568.jsx`. The `dom_entry_v566.jsx`
> row left the §A2 hash table and the `dom_entry_v568.jsx` row arrived in this same edit. Every
> `dom_entry_*.jsx` stays in the REPO as history (H-1).
>
> **v5.68 POPULATES VIRGINIA and CHANGES A USER'S NUMBER, in the CONSERVATIVE direction only** — swept
> over 20,050 Virginia households against v5.67, tax fell in none; the largest rise is $1,380.00/yr. The
> first real `taper` in `STATE_RULES`, taken ONCE per couple against the combined maximum. **Rhode
> Island is the last of the five and remains unconditional.** The same release repairs `t29` F-6a/F-6b
> (OPERATIONS §D2 flipped) and re-founds the D-3c selector on `!r.exclTest` in both copies. Figures,
> per-suite counts and the build's own errors are in `CHANGELOG.md` v5.68 and are not restated here.
>
> ⚠ **The built artifact's hash is trustworthy, not merely recorded.** Per §N3a the scaffold check
> ran: rebuilding v5.67 from its own unmodified source reproduced `35fcca203418e3e10b11765e2c6ade93`
> byte-identically. `smoke_built` 16/16 against the packaged `index.html`.
>
> *(Superseded, retained: the v5.67 note follows.)*
>
> **Rolled 2026-09-08 at the v5.67 ship.** Rotation removes `DangerClose-v5_65.jsx` and
> `dom_entry_v565.jsx` from the POOL; the pool holds exactly `DangerClose-v5_66.jsx` and
> `DangerClose-v5_67.jsx`, and `dom_entry_v566.jsx` and `dom_entry_v567.jsx`. ⚠ Every
> `dom_entry_*.jsx` stays in the REPO as history — H-1 (2026-09-04) decided that, and rotation
> governs the pool only. ⚠ **Both halves of the rotation are one edit** — the departing files'
> rows come OUT of the §A2 hash table and the arriving ones go IN, in this same package. v5.66
> recorded that pair backwards and it took a repair package to notice.
>
> **v5.67 POPULATES NEW JERSEY and CHANGES A USER'S NUMBER — in BOTH directions.** The tier fix is
> CONSERVATIVE and is the point: an MFJ household above $150,000 of NJ gross income excluded
> $150,000 where § 54A:6-10 allows nothing, so **$8,250/yr of understated New Jersey tax** is
> corrected. ⚠ **The 62 age floor is now modelled, and that is OPTIMISTIC** — households aged 62-64
> gain an exclusion the model denied them. It is the first populate release to move any figure the
> better-looking way, and it is disclosed in METHODOLOGY, the Field Manual and the CHANGELOG rather
> than being left as a side effect.
>
> **v5.66 POPULATES NEW MEXICO and CHANGES A USER'S NUMBER**, in the CONSERVATIVE direction — the
> first of the four states whose unconditional exclusion was making plans look better than the
> statute allows. The model granted a flat $8,000 per person 65+ at every income level; NMSA 1978
> § 7-2-5.2 steps it down $1,000 per band to $0 above $51,000 joint / $28,500 single AGI. A couple
> with $60,000 of retirement income was under-taxed by $784/yr. Transcribed from
> `FINDINGS-v5_63-state-statutes.md` §2, not re-derived. **NJ, RI and VA remain unconditional and
> optimistic — THREE left, not four.**
>
> ⚠ **The built artifact's hash is trustworthy, not merely recorded.** Per §N3a the scaffold check
> ran: rebuilding v5.65 from its own unmodified source reproduced the published
> `b4ea0bd1d6993aadd0b7fedcfe47e580` byte-identically, so the tree matches and this build's hash
> means something. `smoke_built` 16/16, exit 0.
>
> ⚠ **THE POOL WAS STALE FOR 20 FILES ON ARRIVAL AT THIS SHIP** — 18 suite files carrying the v566
> registration plus `SCOPE_STATE_FIXTURES.md` and `STOP-REPORT-v5_66-NM-note-guarded-set.md`. The
> repo was ahead in every case; they landed in packages after the last refresh. **This package
> clears all 20.** Recorded because a session working from the pool alone would have been running
> pre-v566 suites while believing itself current — exactly the §A2 failure mode.
>
> *(Superseded, retained: the v5.65 note read — rotation removed `DangerClose-v5_63.jsx` and
> `dom_entry_v563.jsx`; the pool held `DangerClose-v5_64.jsx` and `DangerClose-v5_65.jsx`.)* ⚠ Every
> `dom_entry_*.jsx` stays in the REPO as history — H-1 (2026-09-04) decided that, and rotation
> governs the pool only.
>
> **v5.65 POPULATES CONNECTICUT and CHANGES A USER'S NUMBER**, in the optimistic direction. v5.64
> built the income-conditioning machinery and populated no state; this is the first release that
> uses it. Connecticut was the one of the five income-conditioned states whose simplification ran
> PESSIMISTIC — `excl65: 0`, no exemption at all, where the statute grants up to 100% below
> $100,000 joint / $75,000 single of federal AGI. It now carries the TY2026 phase-out schedule from
> Form CT-1040ES (Rev. 01/26), transcribed from `FINDINGS-v5_63-state-statutes.md` §3.
> **NM, RI, VA and NJ are still unconditional and still optimistic**; they convert one per release.
> **3,246 app checks, 0 failing** (t21 50 and domdiff 32 counted separately) — the rise of 177 from
> v5.64's 3,069 is `t35` (82 + 92) and three added `t34` §A assertions.
>
> ⚠ **`exclAge: 0` was ADDED to Connecticut, not confirmed.** The handoff into this build recorded
> it as already correct; the shipped v5.64 row carried no `exclAge` key at all, so `_floor`
> defaulted to 65 and a populated table would have denied the exemption to every under-65 household
> — reinstating the pessimism the release exists to remove, silently. Found by reading the row
> rather than the handover. `t34` A-5 and a negative control both pin it now.
>
> ⚠ **A gated `t10` change rides with this release and was in no scope.** `2E age control` asserted
> that exactly FOUR states carry an `exclAge` (DE, KY, RI, WI). Connecticut makes five, so the
> assertion is gated at v565 and the four-state form is kept for earlier legs — OPERATIONS §B2's
> gate-the-inversion rule, which the v5.27 defect exists to enforce.
>
> ⚠ **A negative control found a blind assertion in the NEW suite.** `t35` §D-2 originally checked
> that the words "dividend" and "interest" appeared in Connecticut's note; a note claiming the
> measure *does* carry them would have passed. The control did not fire, the TEST was repaired to
> assert the negation, and its phrasing narrowness is recorded at the site. **A control that does
> not fire is the finding.**
>
> ⚠ **Version registration hit the same trap class a third time.** The four baseline registries end
> `"v564", "v592"` — the retired v5.9.2 leg sorts last — so a transform anchored on the tag being
> final missed all four and reported them as needing no change. The AST sweep caught it, not the
> transform. v5.63 lost eighteen files this way and v5.64 lost `t24`'s ternary. **A blanket pattern
> is the wrong instrument for version registration; only a parser sweep afterwards is evidence.**

> ⚠ **`SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` IS RETIRED as of 2026-09-07 (sixth package), and left
> `package_check`'s I-2 OPEN allowlist in the same edit.** H-1 through H-6 are resolved and built and
> §5's four items are done, the last being the third scope-status sweep. **The allowlist now holds
> three entries**, not four: `SCOPE_STANDING_AUDIT.md` (not a build scope), `SCOPE_HOUSEKEEPING_THREE.md`
> (awaiting D-1…D-5) and `SCOPE_INCOME_CONDITIONING.md` (CT shipped at v5.65; NM, RI, VA and NJ open).
>
> ⚠ **Three things that scope did NOT carry away with it, named here because retirement is where
> open threads get lost:** **K-10** is proposed and not built (and its naive form is wrong);
> **E-1b is blind to three pool files by rename**; and **P1–P28 were never re-validated** — they need
> an un-uploaded app-release package, and **whether their six NOT CAUGHT reports are an input
> artefact or a real defect is UNKNOWN and must not be assumed.**

> ⚠ **THE THIRD SCOPE-STATUS SWEEP RAN 2026-09-07 (fifth ops package). All 44 `SCOPE_*.md` files
> were read against what their release actually shipped**, per OPERATIONS §I. **The defect class the
> two prior sweeps existed to catch did not appear** — no scope claims work that did not ship. Three
> other findings did, all annotated in place and recorded in that package's CHANGELOG entry:
> `SCOPE_BOUNDARY_CENSUS.md`'s ops package has **no CHANGELOG entry at all** (the work exists; the
> record does not, and none was back-dated); `SCOPE_D10_MODELLING_v5_53.md`'s status line reads
> *"BUILT AND SHIPPED"* when only the dividend half of its title shipped, by resolved decision; and
> `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` **contradicted itself about H-6** — §4a recorded it built
> while §9 listed it unbuilt, hours apart, in one file.
>
> ⚠ **`SCOPE_HOUSEKEEPING_THREE.md`'s three premises were re-checked and it stays OPEN.** Items A
> and B are **TRUE** (D-10's register row is stale twelve releases on, in four ways not three;
> `t21` covers none of the three newer tools). **Item C's counts were WRONG** — it says 42, and the
> live pool measures **110 files · 73 hashed rows · 37 with no row**. Nothing was built and D-1…D-4
> are still Steve's; **D-5 is new** and asks whether that item should ship a command rather than a
> number, since the figure has now gone stale twice in five days.
>
> ⚠ **A count in this manifest or in a scope is a claim with an expiry date.** Two of the three
> figures Item C rests on were stale within five days, moved by ordinary ops packages. Where a
> number can be derived, prefer naming the command — §A2's clone comparison is the model, and it is
> the one check in this project that has never itself gone stale.

> ⚠ **STANDING LESSON, from the v5.64 post-ship correction (kept because it earned its place).**
> Two rows added by the v5.64 packaging carried **fabricated hashes** — `dom_entry_v564.jsx` and
> `t34_income_conditioning.mjs`. The packaging session rolled existing rows with a script that
> computed real md5s, then hand-wrote the new rows by copying that script's **truncated
> ten-character display** and inventing the remaining twenty-two characters. Both matched their file
> for exactly ten characters and were wrong after that. `package_check` K-8 caught it against the
> pool; nothing before that could have. **A truncated hash is not a hash. A row's md5 gets computed
> into place or it does not get written.** Every hashed row in this file was re-computed against the
> pool at the v5.65 ship.

> **Ops package 2026-09-04 (decisions) — NO VERSION BUMP.** v5.63 remains current, source
> `b2deba49e68bee6c29300f2f8cf0a7e3`, artifact `5998e8b60c5f45ded623d500fce09a86`, both re-verified
> against a fresh clone at `37cea89` that day. **Two maintainer decisions landed and one documented
> disagreement was closed.** `SCOPE_INCOME_CONDITIONING.md`'s D-2 and D-3 are **approved, (b) and
> (b)**, and its premise was re-anchored from v5.60 to v5.63 — v5.62 rewrote all three
> `stateTaxAnnual` call sites to gross components, falsifying the scope's §2.1, and v5.63 made the
> `work` argument carry `work + otherOrd`, so the approved base expressions must not be described as
> wages. `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` is **new**, with H-1 (keep all 57 `dom_entry_*.jsx`)
> and H-2 (move 24 completed-history files out of the pool) both resolved and neither built.
> ⚠ **`package_check`'s I-2 allowlist now holds four entries**, and the `SCOPE_INCOME_CONDITIONING`
> one had its REASON rewritten rather than removed — an allowlist entry whose justification goes
> stale is as invisible to I-3 as a ghost entry is. ⚠ **No app suite was run and none applies**: no
> source, suite or fixture changed, so a green total would have been a reading from an unrelated set.

> **Rolled 2026-09-04 at the v5.63 ship.** Rotation removed `DangerClose-v5_61.jsx` and
> `dom_entry_v561.jsx`; the pool holds exactly `DangerClose-v5_62.jsx` and `DangerClose-v5_63.jsx`,
> and `dom_entry_v562.jsx` and `dom_entry_v563.jsx`. **v5.63 is a CALCULATOR change**: the Roth
> comparator charged 7.65% FICA on every ordinary income stream — rental, annuity, royalty — at both
> of its FICA sites, and the tab ranks on `estate`, so a tax that should not exist changed which
> strategy it recommends. ⚠ **The v5.63 build also found that the suite's `v563` version-gate
> registration was absent from the repo** (eighteen files registered `v562`, two registered `v563`)
> and that OPERATIONS §N3a's build recipe did not use the `package-lock.json` committed at v5.62.
> Both are fixed in this release; both are recorded in the CHANGELOG.
>
> *(Superseded, retained: the v5.62 note read — rotation removed `DangerClose-v5_60.jsx` and
> `dom_entry_v560.jsx`.)* **v5.62 is a WIRING change, not a calculator
> change**: the two Roth call sites passed `retIncome: max(0, taxableOrd − ssT)` — net of the FEDERAL
> standard deduction, and undecomposed so `work` collected the state RETIREMENT exclusion. The three
> engines disagreed in **all 42 taxing jurisdictions**, up to **$2,656/yr**, always under-taxing the
> Roth engines. `METHODOLOGY` said they "can never disagree"; corrected.
> ⚠ **MC parity 10/10 is EXPECTED and BLIND** — `PORTFOLIO` carries no `stateCode`, so every parity
> fixture is `stateCode: null` and never reaches `STATE_RULES`. Not evidence of no regression.
> ✅ **§N3a passed**: v5.61 rebuilt byte-identically with `mammoth` pinned to **1.12.1**.
> `SCOPE_ENGINE_STATE_PARITY.md` is **FULFILLED**. Known residual, pinned in the suite: `otherOrd` is
> absent from the Roth engines, so engine agreement is exact only without other ordinary income.

> **Rolled 2026-09-03, in the ops package that followed the v5.61 ship — NOT at the ship itself.**
> ⚠ **This manifest was omitted from the v5.61 release package and both tables were left stale.**
> Caught by post-ship verification, not by any check. Rotation removed `DangerClose-v5_59.jsx` and
> `dom_entry_v559.jsx`; the pool holds exactly `DangerClose-v5_60.jsx` and `DangerClose-v5_61.jsx`,
> and `dom_entry_v560.jsx` and `dom_entry_v561.jsx`. **v5.61 is a DISCLOSURE-ONLY change**:
> `STATE_RULES.RI.note` corrected from `$133,500` to `$133,750 … per ADV 2025-22`, because Rhode
> Island's own indexing statute does not admit the figure its filing-season guide prints nine times.
> **No computed output moved** — the AGI cliff is still not modelled. `SCOPE_RI_THRESHOLD_CORRECTION.md`
> is **FULFILLED** and stays as the build record. Both hashes verified against a fresh clone at
> `8bd0282` and against the pool. Applying the release's five textual edits to the v5.60 artifact
> reproduces the v5.61 artifact byte-for-byte, so the artifact diff is provably only the note change.
> ⚠ **`mammoth` is pinned to 1.12.1 for reproducible builds** — it resolves through an unpinned
> `^1.8.0` caret and had moved to 1.12.2, which changed the vendored bundle. `package.json` is
> unchanged (`--no-save`). A committed lockfile is the real fix and is not yet done.

> **Rolled 2026-09-02 at the v5.60 ship.** Rotation removed `DangerClose-v5_58.jsx` and
> `dom_entry_v558.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_59.jsx`
> and `DangerClose-v5_60.jsx`, and `dom_entry_v559.jsx` and `dom_entry_v560.jsx`.
> **v5.60 is a MODELLING change: `STATE_RULES.RI.exclAge` and `WI.exclAge` set to 67**, the full
> retirement age both statutes require, applied per person. **No figure moved.** Direction
> conservative in every measured cell. MC parity 10/10 is EXPECTED and BLIND — re-confirmed by AST
> walk, no fixture is domiciled in either state. `SCOPE_EXCL_AGE_RI_WI.md` is **SHIPPED** and stays
> as the build record; it was never on the OPEN allowlist, so nothing to remove there.
> ⚠ **The v5.59 artifact rebuilt BYTE-IDENTICALLY on a fresh scaffold** (`c6ac9655…`) on rollup
> 4.63.1, not the 4.62.4 recorded at v5.31 — the §N3a prior-release check passed, contrary to the
> expectation carried into the session. Record it; it is evidence rollup was never the cause.
>
> **Previous roll, 2026-09-02 at the v5.59 ship.**
> **v5.59 is a MODELLING change: `STATE_RULES.RI.excl65` 20,000 → 50,000 and `WI.excl65` 5,000 →
> 24,000**, both toward the statute; MC parity 10/10 is EXPECTED and BLIND (no fixture is in RI or WI).
> `SCOPE_EXCL65_STALE_RI_WI.md` is **SHIPPED/RETIRED** and stays as the build record; its
> `package_check` OPEN-allowlist entry, if any, must go in the same edit.
> ⚠ **The Prior build table below had read v5.51 since 2026-08-25** — seven releases stale while this
> table rolled every ship. Found by reading it, not by any check: nothing compares the two tables.
> Corrected to v5.58 in this pass. Ninth recorded instance of that table going stale.
> ⚠ `COMMIT_MESSAGE.txt` was STILL in the pool at v5.49 content — on the delete-first list since
> v5.52 and never deleted; ROUND4 §7 called it "expected". It is named again below. Deleted-first
> lists are not executed by writing them.

> **Pool read complete 2026-09-01.** All 22 retired pool scopes read for unresolved decisions;
> **nothing was lost** and nothing needed re-homing. `SCOPE_POOL_AND_ALLOWLIST_HYGIENE.md` is
> **RETIRED** and off the allowlist. 23 scopes leave the pool (all exist in the repo);
> the shelf then reads TWO scopes, both genuinely open.
> ⚠ **Read the scope with NO retirement note first.** Twenty-one self-documented; the one that did
> not — `SCOPE_FIX_roth_tab_div_capgain.md`, SUPERSEDED and never built — was the only one that
> could have hidden a decision. Its D-4 was checked against `METHODOLOGY.md` and had been carried out.
>
> **Docs drop 2026-09-01 — no version bump, no source change.** Adds
> `AUDIT_STATE_EXCL65_ROUND3.md` (repo `docs/` + pool) and **corrects this manifest's own stale**
> **`t8_invariant.mjs` hash**, refreshing the pool copy from the repo in the same drop. The app is
> untouched at `0daebb4af466b9095db79117daefcd32`; baseline recomputed from suite output at
> **2,858 app checks, 0 failing**, parity **10/10**, `smoke_built` 16/16.
> ⚠ **The three files go together.** Uploading the manifest without the refreshed `t8_invariant.mjs`
> leaves this table asserting a hash the pool does not have — the same class of half-landed refresh
> that left `controls_state.sh` absent from the pool on 2026-08-28.
> **Table repaired 2026-09-01, same day, second pass.** The 19 stale md5 rows this note previously
> declared are **recomputed from the pool files**, and the 10 rows naming files already gone from the
> pool are **deleted** — the 2026-08-21 precedent, whose stated principle is that a row naming a file
> that no longer exists is worse than the file, because the §A2 offline fallback then misdirects.
> Every row in the table below was verified against pool AND clone at tree `aa72a5e`; the table now
> reconciles clean in both directions. See the retirement note further down for what left and why.

> **Ops package 2026-09-01 — no version bump.** `package_check`'s OPEN allowlist dropped
> `SCOPE_v5_40_disclosures_and_mechanics.md` and `SCOPE_FIX_tidyup_six.md`, both **RETIRED** after
> re-verifying every premise by content against v5.57. The gate gained `G-2`, `KIND: handover` and
> section `J` (post-ship pool verification). The app is untouched at
> `0daebb4af466b9095db79117daefcd32`. **`SCOPE_POOL_AND_ALLOWLIST_HYGIENE.md` stays OPEN** for the
> deferred pool cleanup only — 20 retired scopes to 3 open, all 20 carrying decision language.
> ⚠ **`dom_entry_v592.jsx` is NOT an orphan** — it is the retired v5.9.2 leg, documented in
> `qa-baseline/README.md`, correctly repo-only. Earlier notes of mine calling it overdue were wrong.
>
> **Rolled 2026-08-31 at the v5.57 ship.** Rotation removed `DangerClose-v5_55.jsx` and
> `dom_entry_v555.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_56.jsx`
> and `DangerClose-v5_57.jsx`, and `dom_entry_v556.jsx` and `dom_entry_v557.jsx`.
> **v5.57 is a MODELLING change and Kentucky's figures move DOWN**; nothing about Delaware moved.
> Parity stayed 10/10. `SCOPE_KY_RATE_DE_HB108.md` is **RETIRED** and its `package_check`
> OPEN-allowlist entry was deleted in the same edit.
>
> ⚠ **`AUDIT_STATE_EXCL65_ROUND2.md` changed at this ship** — its two ⚠ UNRESOLVED blocks are
> resolved in place rather than left standing, because a resolved flag nobody clears is how this
> project acquires a second answer that drifts (decision D-5).
>
> ⚠ **The `v592` orphan has now caused a SECOND defect.** Four `KNOWN_VERSIONS` registries end in
> that retired tag rather than the current one, so a version roll keyed on the current tag skips
> `t1`, `t4`, `t5` and `t6`. It failed loudly this time. It is still repo-only, still passes §A2's
> expected-repo-only list silently, and it is now overdue.
>
> **Rolled 2026-08-30 at the v5.56 ship.** Rotation removed `DangerClose-v5_54.jsx` and
> `dom_entry_v554.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_55.jsx`
> and `DangerClose-v5_56.jsx`, and `dom_entry_v555.jsx` and `dom_entry_v556.jsx`.
> **v5.56 is a MODELLING change and figures move UP** for Maryland and Maine households 65+ that
> receive Social Security; parity stayed 10/10, which is the evidence both engines moved
> identically. `SCOPE_STATE_SS_OFFSET.md` is **RETIRED** and its `package_check` OPEN-allowlist
> entry was deleted in the same edit.
> **`STOP-REPORT-v5_56-session-budget.md` is DELETED from the pool** at this ship — it was a
> handover, not history, and the repo copy stays at `docs/`.
>
> ⚠ **This release shipped three defects that a green suite could not see, and they were found by
> negative control, not by the suite.** Two sentences in Field Manual §13 and two in
> `METHODOLOGY.md` were falsified by the modelling change and left standing; nothing in the suite
> reached the three engine call sites; and the new `boundaries.mjs` row asserted nothing. All
> three are fixed and each now has a control that fires. **The lesson is recorded here because it
> generalises: a modelling release must sweep the prose its own change falsifies, and `t31`'s
> per-key comments are where a previous release writes down which key this one must invert.**
>
> **Rolled 2026-08-29 at the v5.55 ship.** Rotation removed `DangerClose-v5_53.jsx` and
> `dom_entry_v553.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_54.jsx`
> and `DangerClose-v5_55.jsx`, and `dom_entry_v554.jsx` and `dom_entry_v555.jsx`.
> **v5.55 is a MODELLING change and figures move DOWN** for KY and DE households below 65; parity
> stayed 10/10, which is the evidence both engines moved identically.
> `SCOPE_STATE_EXCL_AGE_GATE.md` is **RETIRED**.
>
> **Test-infrastructure release, 2026-08-29 (no version bump).** `t10_taxcases.mjs` §2E gained the
> D-3c dollar-exact New Jersey case set; suite 2,750 → **2,768**, parity 10/10, source unchanged at
> `2e27826c495d3d70ca49ccf71cf238ec`. `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md` is **RETIRED** and its
> `package_check` OPEN-allowlist entry was deleted in the same edit.
>
> ⚠ **`AUDIT_STATE_EXCL65_ROUND2.md` is NEW in both repo and pool** (uploaded 2026-08-29; this row
> was deferred from the v5.54 ship rather than editing the manifest twice in one day). It is the
> successor to `AUDIT_STATE_EXCL65_NOTES.md` and both are kept — the predecessor covered 6 of 19
> states, round 2 covers 2 of the remaining 13, and **11 are still unchecked**. Its §0 records a
> **structural** finding: `excl65 × persons65` has one age gate and the states have at least four.
>
> **Rolled 2026-08-29 at the v5.54 ship.** Rotation removed `DangerClose-v5_52.jsx` and
> `dom_entry_v552.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_53.jsx`
> and `DangerClose-v5_54.jsx`, and `dom_entry_v553.jsx` and `dom_entry_v554.jsx`.
>
> ⚠ **CORRECTION, 2026-08-29 — `dom_entry_v592.jsx` IS NOT AND HAS NEVER BEEN A POOL FILE.** Every
> rotation entry from v5.50 onward carries the warning *"NOT part of the rotation and must not be
> deleted,"* attached to a paragraph that is otherwise entirely about what the **pool** holds — so it
> reads as a claim that the pool holds it. **It does not, and the maintainer confirms it has never
> been in a release zip, which is the only way a pool file can arrive.** The underlying fact is true
> but is about the **repo**: `qa/qa-baseline/dom_entry_v592.jsx` is kept deliberately (it was
> proposed for deletion at v5.50 as a suspected typo and the suite caught it), and `v592` is still
> registered in four `KNOWN_VERSIONS` arrays — `t1`, `t4`, `t5`, `t6`, verified by parser
> 2026-08-29, not recalled.
>
> **A pool copy would be inert anyway.** `dom_entry_v592.jsx` imports `./app_v592.jsx`, which
> `mk_testable.sh` generates from `v592.jsx` — and that source is in **neither** the repo nor the
> pool by deliberate decision (`qa/qa-baseline/README.md`: local-only, maintainer-supplied). Anyone
> able to run the retired leg is working from a checkout that already has the repo's copy.
>
> ⚠ **Why the freshness check could not catch this:** §A2 lists superseded `dom_entry_*` under
> *expected repo-only*, so a pool-absent / repo-present entry file is filtered out by design. The
> §A2 scan at the v5.54 build reported the pool clean and this claim had been false for five
> releases underneath it. **The historical entries below are left unedited — they are a record of
> what was believed at each rotation. This note supersedes their v592 sentence.** **v5.54 is DISCLOSURE ONLY:
> parity 10/10, every `STATE_RULES` numeric field byte-identical, and `t4` did NOT move (252 both
> legs) — the DOM suite is blind to the state-selector caption this release rewrites, and the DOM
> diff's ±$500 ceiling cannot see it either. `t31` is the witness. A "nothing moved" reading is not
> evidence of correctness here.**
>
> ⚠ **`STOP-REPORT-v5_54-session-budget.md` is DELETED from the pool at this ship** — it was a
> handover, not history. The repo copy stays. `SCOPE_v5_54_STATE_DISCLOSURE.md` is RETIRED and its
> `package_check` OPEN-allowlist entry deleted in the same edit. `docs/FINDINGS-v5_54-session-2.md`
> is NEW (repo + pool) and records a phantom-edit drift incident and the AST-over-grep technique now
> in `OPERATIONS.md` §B1a; delete it from the pool once its findings are carried into the D-3 scope.
>
> **Rolled 2026-08-28 at the v5.53 ship.** Rotation removed `DangerClose-v5_51.jsx` and
> `dom_entry_v551.jsx` — a rotation is TWO deletes. The pool holds exactly `DangerClose-v5_52.jsx`
> and `DangerClose-v5_53.jsx`, and `dom_entry_v552.jsx` and `dom_entry_v553.jsx`. ⚠ `dom_entry_v592.jsx`
> is still NOT part of the rotation (retired v5.9.2 leg — see below). **v5.53 is a MODELLING change:
> parity 10/10 (no simulation engine moved), but the Roth ladder's IRMAA MAGI now carries the
> taxable sleeve's dividends. DOM diff STRICT 32 — the "nothing moved" reading, which for this
> release is expected and NOT evidence of inertness: the term is below the ±$500 render ceiling on
> the example household and the diff is blind to the Roth tab. `t32` is the witness.**
>
> *(v5.52 rotation, for the record.)* **Rolled 2026-08-27 at the v5.52 ship.** Rotation removed `DangerClose-v5_50.jsx` and
> `dom_entry_v550.jsx`; the pool holds exactly `DangerClose-v5_51.jsx` and `DangerClose-v5_52.jsx`,
> and `dom_entry_v551.jsx` and `dom_entry_v552.jsx`. ⚠ `dom_entry_v592.jsx` is still NOT part of
> the rotation (retired v5.9.2 leg — see below). **v5.52 is disclosure only: parity 10/10, DOM diff
> STRICT 32, and both IRMAA MAGI expressions byte-for-byte what they were at v5.51 — now pinned by
> `t1`, which nothing asserted before.**
>
> *(v5.51 rotation, for the record.)* **Rolled 2026-08-26 at the v5.51 ship.** Rotation removed `DangerClose-v5_49.jsx` and
> `dom_entry_v549.jsx`; the pool holds exactly `DangerClose-v5_50.jsx` and `DangerClose-v5_51.jsx`,
> and `dom_entry_v550.jsx` and `dom_entry_v551.jsx`. ⚠ `dom_entry_v592.jsx` is still NOT part of
> the rotation (retired v5.9.2 leg — see below). **v5.51 is disclosure + structure only: parity
> 10/10, DOM diff STRICT 32, `HEIR_RATE` still 0.22 by decision.**
>
> *(v5.50 rotation, for the record.)* Rotation removed `DangerClose-v5_48.jsx` and
> `dom_entry_v548.jsx`; the pool holds exactly `DangerClose-v5_49.jsx` and `DangerClose-v5_50.jsx`,
> and `dom_entry_v549.jsx` and `dom_entry_v550.jsx`. ⚠ **`dom_entry_v592.jsx` is NOT part of the
> rotation and must not be deleted** — `v592` is the retired v5.9.2 leg, still registered in four
> `KNOWN_VERSIONS` arrays (`t1`, `t4`, `t5`, `t6`) and kept deliberately so a retired leg can be run
> from a locally-supplied source. It was proposed for deletion at the v5.50 build as a suspected
> typo; the suite is what caught that.
>
> **v5.50 is DISCLOSURE ONLY — no modelling change, no computed figure moved.** Verified: parity
> **10/10** and the DOM diff's **STRICT branch at 32**. The comparator's estate objective is
> relabelled `MAX ESTATE AFTER HEIR INCOME TAX` and both user surfaces now state that no estate or
> inheritance tax is applied. ⚠ **The scope's site census listed 2 of 5 sites** — the column header
> `After-tax estate` was found only by the new DOM extinction check, because both the scope's and the
> build session's census greps were case-sensitive. Every D-7 pin matches case-insensitively.
>
> *(v5.49 rotation, for the record.)* Both build tables were verified against a fresh clone
> AND against the pool before this edit was considered done: repo `src/DangerClose.jsx`, the pool's
> `DangerClose-v5_49.jsx` and the suite's build input are **one file by md5**. Rotation removed
> `DangerClose-v5_47.jsx` and `dom_entry_v547.jsx`; the pool holds exactly `DangerClose-v5_48.jsx`
> and `DangerClose-v5_49.jsx`, and `dom_entry_v548.jsx` and `dom_entry_v549.jsx`.
>
> **v5.49 is DISCLOSURE ONLY — no modelling change, and no computed figure moved.** That is
> verified, not asserted: cross-version parity **10/10** and the DOM diff's **STRICT branch at 32**,
> the branch that fires only on a pair with no intended differences. A one-sentence summary is safe
> here, unlike v5.47's.
>
> The Field Manual's IRMAA Cliff entry and the IRMAA tab now both name **SSA-44** and **work
> stoppage**, state that the list of eight life-changing events is **closed**, and say plainly that
> a Roth conversion is not among them. `METHODOLOGY.md` was corrected in the same pass — it had the
> same gap, saying the events *"include"* six of eight.

> **Rolled 2026-08-23 at the v5.47 ship, in the same session that built it.**
>
> ⚠ **v5.47 changes modelling in two places, and the direction SPLITS — do not summarise it in one
> sentence.** (1) The HSA is held out of the taxable-dividend base in Engines A, B and C. On the
> example household this lowers MAGI by **$300/yr** ($555 inside §86's upper-tier phase-in) and
> moves **federal tax not at all** — the dividends sit in the 0% LTCG bracket, so what moves is
> IRMAA and ACA exposure. (2) The Roth tab's two RMD cards now exclude annuity money, as every
> engine already did. Spouse B's cards fall $15,070 → $14,587 and $3,283 → $3,178; **spouse A's do
> not move at all** (`annShareA` is 0), which is the fix's built-in negative control — so any
> measurement taken on spouse A is not evidence about this behaviour. The tab's "Combined RMDs
> reduced by" line falls $41,288 → $40,910, meaning **conversions look LESS effective**, the
> opposite direction from the RMD figures themselves.
>
> ⚠ **Three fixtures cannot see item 5, by construction — this is a live trap, not history.**
> `t2`'s parity fixture builds its portfolio from `positions` only, and `t17`/`t18` both do
> `P.otherAccounts = []`. `othHsa` is 0 in all three, so item 5 is worth **$0** on them and the
> MC-parity guardrail's 9/9 is NOT evidence about it. Any future scope premise that reaches for
> those fixtures to measure an Other-accounts behaviour must build its own household first.
>
> ⚠ **v5.48 IS PRESENTATION ONLY — no number the model computes moved, and that was verified, not
> assumed.** Parity **10/10** across v5.47→v5.48, and the cross-version DOM diff took its STRICT
> branch and passed **32/32**, meaning every rendered figure is byte-identical between the two
> builds. `METHODOLOGY.md` is deliberately untouched: the project's convention is that it updates
> on modelling releases only.
>
> ⚠ **852 font declarations were raised** to a 12px body / 11px label floor, and the five
> fixed-pixel grids widened 1.40x to carry it. The app had declared 793 sizes below 11px, 341 at
> 8px and 3 at 7px. The UI SIZE control still exists and still applies `zoom` — it is now a
> user-owned adjustment on top of a legible default rather than a workaround for an illegible one.
>
> ⚠ **NO TEST IN THIS PROJECT CAN SEE WHETHER v5.48 LOOKS RIGHT.** jsdom performs no layout, so
> `t30` asserts DECLARED sizes and grid specs and nothing about rendered boxes. A green `t30` proves
> the numbers in the source are what they claim to be. Only manual inspection at a real viewport
> proves the result is usable — and the five widened grids (withdrawal, roth, taxes, irmaa, ss) are
> where to look first.
>
> ⚠ **A FIXTURE THAT CANNOT REACH A BEHAVIOUR MAKES EVERY ASSERTION ABOUT IT VACUOUS — and the
> suite reports green either way.** Four instances found in two weeks, which is why this is here
> rather than in a CHANGELOG entry: `t2`'s parity fixture supplied no Other-accounts fields, so
> v5.47's HSA fix was worth $0 on it; and three §86 controls (the half-cap in Engine C, the half-cap
> in the Roth tab, the middle tier in Engine C) each reverted correct code that NO household in the
> suite could reach. In every case the code was right, the assertion was right, and the fixture
> could not exercise the line. **A green suite is not evidence of coverage; a green suite on a
> fixture that reaches the code is.** When adding an assertion, prove the fixture enters the region
> — `t25` §F/§G and `t27` §A show the idiom, and `t25`'s first §F draft checked ZERO rows and passed
> until its own anti-vacuity assertion caught it.
>
> ⚠ **`t13` LOOKS like `t14` and is NOT — do not apply `t14`'s drift correction to it.** Measured
> 2026-08-23, after a recommendation to do exactly that was made and withdrawn. `t14`'s households
> drift ~$4K/yr, so subtracting one year of drift is right there. `t13`'s are purpose-built and do
> not drift: case 1 moves +$2K, and case 2's `d-2` year is a **one-off −$63K step**. Applying the
> correction takes case 1 from margin 2.26 to 0.26 and case 2 from 1.74 to **−61.26**. It would have
> broken the suite.
>
> `t13` does carry a *related* defect, from a different cause. Counterfactual, both deaths pushed
> past the horizon: the isolated death effect is **$17,100.81** on case 1 against an expectation of
> $13,260.00. Decomposed — holding both spouses alive and removing spouse B's check gives **exactly
> $13,260.00**, so the **$3,840.81 residual** is not the SS term. The death also rolls the deceased's
> Traditional balance to the survivor and recomputes RMDs on the survivor's age; case 1's survivor is
> younger (larger divisor, smaller RMD, MAGI falls further), case 2's is older, which is why case 2
> lands at −$0.61K instead. So the check is NAMED for the SS loss while MEASURING SS plus the
> rollover, and its ±$4K band absorbs the difference. Margins are 2.26 and 1.74 — healthy next to the
> 0.74 and 0.08 that made `t14` urgent — so this is recorded, not fixed. The fix is a counterfactual
> anchor, and `t13` is DOM-driven, so that is a scope rather than a ride-along.
>
> ⚠ **`t14`'s Engine C magnitude checks were re-anchored at v5.47** after measurement showed they
> had been differencing raw year-over-year MAGI while the household's MAGI also rises $3,959/yr
> from RMD growth. Both passed for eleven releases with a structural offset inside their ±$4,000
> bands ($740 and $80 of margin left at v5.47). They now subtract one year of drift. A tolerance
> that has never been examined is not the same as headroom.
>
> ⚠ **The MC-parity guardrail gained a THIRD household, 2026-08-23 (`qa/` only, no version bump).**
> Until then `t2`'s fingerprint could not observe any Other-accounts behaviour: `runRothStrategies`
> reads 36 `P` fields and the main household supplied 33, omitting `othHsa`, `annShareA` and
> `annShareB`. So the annuity RMD exemption (v5.26) and the **survivor re-pooling of the exempt
> share** (L3811-3815) were invisible to it, as was v5.47's HSA fix — which is why parity reported
> 9/9 across a release it should have caught. The new `fp.rothOther` key carries all three, with
> both spouses annuitised at different rates and a death inside the horizon. Parity is now **10**,
> `t2` is **27** per leg. `INTENDED_DIFFS` carries `"v546→v547": ["rothOther"]`, so a revert of
> v5.47's item 5 fails permanently. ⚠ `t17` and `t18` still share the blind spot (`P.otherAccounts
> = []` in both builders) and are deliberately untouched — do not read their green as coverage of
> anything under Other accounts.
>
> ⚠ **`t10`'s printed section labels OVERLAP — do not total that suite by adding them up.** `pass`
> is one running counter across its blocks, and until v5.47 the "2B" line evaluated `pass-pass2A`
> at print time, so it reported 2B+2C+2D+2E while the 2D and 2E lines reported those blocks again.
> Adding the four labels gives **211**; the true total, printed on `t10`'s own total line, is
> **163**. The v5.47 session made exactly this error and nearly published a false finding that
> v5.46 had under-reported its suite by 96. The label is fixed, but the general rule stands: read
> a suite's own total line, and if it disagrees with the sum of its parts, that disagreement is
> the finding.
>
> **Superseded note, kept for history — rolled 2026-08-23 at the v5.46 ship, in the same session that built it.** ⚠ The date and
> narrative in this block had gone stale: through v5.45 the version and hashes were rolled each
> release while the `Shipped` field and the prose beneath still read 2026-08-21 / v5.42. Found by
> the v5.46 freshness check as a CHANGELOG-vs-manifest disagreement and corrected here.
>
> ⚠ **v5.46 changes modelling on the Roth tab, and it moves figures DOWN.** Spouse B's Social
> Security is now gated by B's own claim date (it was credited in every ladder year), with a
> pro-rata credit in the claim year and an explicit zero for single filers. **The effect is $0 on
> the example household**, whose spouse B claims in January of the ladder's first year — so any
> measurement of this tab taken on the example data is not evidence about this behaviour. On a
> fixture delaying B to 70 it is worth $22,950 of MAGI per pre-claim year. Any scope premise
> written against v5.45's ladder must be re-verified before use.
>
> **Superseded note, kept for history — rolled 2026-08-21 at the v5.42 ship** — the second
> consecutive roll without a lag. The v5.41 freshness check confirmed this table was correct for
> the first time, and the v5.42 check confirmed it again: all five hashes the build brief recorded
> matched a fresh clone exactly.
>
> ⚠ **v5.42 changes modelling on the Roth tab, and it moves figures DOWN** — unusual here, and
> stated for that reason. The conversion ladder's §86 upper tier was a cliff to 85% of benefits; it
> now phases in per §86(a)(2). MAGI, taxable income, tax, marginal rate and IRMAA risk all FALL for
> affected households, by up to $38,030 of MAGI in a single year. **The effect is $0 at the $70,000
> conversion-slider default** and only appears at lower slider positions — so any measurement of
> this tab taken at the default is not evidence about §86 behaviour. Any scope premise written
> against v5.41's Roth ladder must be re-verified before use.
>
> ⚠ **Two §86 divergences are open and documented, not defects to re-discover.** (1) The IRMAA
> engine does not implement §86 at all (flat 85%), so it and this tab legitimately disagree by up
> to $46,920 below provisional income ≈ $92,000. (2) The Roth tab's **middle** §86 tier caps at 85%
> of benefits where the statute caps at ½ — found during the v5.42 build, bounded at $2,468 joint /
> $1,850 single, needs benefits under $12,000, $0 on the example household, pinned by `t24` §D.
> Both are in METHODOLOGY; neither is fixed.


---

# Part 2 — delete-first lists

### At the v6.03 ship (2026-10-10) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_02.jsx` and `dom_entry_v602.jsx`. **Pool goes 131 → 132** (`t67_deductions_flat.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_02.jsx` | **rotated out** — v6.02 is read from the repo's history (commit `a7bbdb5`) |
| `dom_entry_v602.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `d30_ref.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t2_engines.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_03.jsx`, `dom_entry_v603.jsx`, `t67_deductions_flat.mjs`. **Repo-only:** `controls_v603_deduct.py`, the scope (fulfilled), the built `index.html`.

### At the v6.02 ship (2026-10-09) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_01.jsx` and `dom_entry_v601.jsx`. **Pool goes 129 → 131** (`t66_deductions_askai.mjs` and `d30_ref.mjs` arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_01.jsx` | **rotated out** — v6.01 is read from the repo's history (commit `1c2674e`) |
| `dom_entry_v601.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_02.jsx`, `dom_entry_v602.jsx`, `t66_deductions_askai.mjs`, `d30_ref.mjs`. **Repo-only:** `controls_v602_deduct.py`, the fulfilled scope, the built `index.html`.

### At the v6.01 ship (2026-10-09) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_00.jsx` and `dom_entry_v600.jsx`. **Pool goes 128 → 129** (`t65_state_brackets_b2.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_00.jsx` | **rotated out** — v6.00 is read from the repo's history (commit `b800ca1`) |
| `dom_entry_v600.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_01.jsx`, `dom_entry_v601.jsx`, `t65_state_brackets_b2.mjs`. **Repo-only:** `controls_v601_brackets.py`, the fulfilled scope, the built `index.html`.

### At the v6.00 ship (2026-10-09) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_99.jsx` and `dom_entry_v599.jsx`. **Pool goes 127 → 128** (`t64_state_brackets.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v5_99.jsx` | **rotated out** — v5.99 is read from the repo's history (commit `f7ce172`) |
| `dom_entry_v599.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `mk_runfolder.sh` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `smoke_built.mjs` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t9_dom_smoke.mjs` | replaced |
| `TESTING.md` | replaced |
| `vercensus.cjs` | replaced |
| `vergates.cjs` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v6_00.jsx`, `dom_entry_v600.jsx`, `t64_state_brackets.mjs`. **Repo-only:** `controls_v600_brackets.py`, the fulfilled scope, the built `index.html`.

### At the v5.99 ship (2026-10-09) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_98.jsx` and `dom_entry_v598.jsx`. **Pool goes 126 → 127** (`t63_flat_rates.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v5_98.jsx` | **rotated out** — v5.98 is read from the repo's history (commit `9945d3c`) |
| `dom_entry_v598.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_99.jsx`, `dom_entry_v599.jsx`, `t63_flat_rates.mjs`. **Repo-only:** `controls_v599_flat_rates.py`, the fulfilled scope, the built `index.html`.

### At the v5.98 ship (2026-10-08) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_97.jsx` and `dom_entry_v597.jsx`. **Pool goes 125 → 126** (`t62_desktop_disclosures.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v5_97.jsx` | **rotated out** — v5.97 is read from the repo's history (commit `ba46635`) |
| `dom_entry_v597.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v5_98.jsx`, `dom_entry_v598.jsx`, `t62_desktop_disclosures.mjs`. **Repo-only:** `controls_v598_disclosures.py`, the fulfilled scope, the built `index.html`.

### At the ops package of 2026-10-08 (census of the C/E/F registers) — DELETE THESE FIRST

6 files replaced; nothing leaves, nothing arrives. **Pool stays 125.** v5.97 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — census table (no hash row — listed by name only) |
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled |
| `FlawsToFix-v5_73-Phase2.md` | replaced — census table (no hash row — listed by name only) |
| `OPERATIONS.md` | replaced — §C1's jsdom count re-counted |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |
| `UsabilityFlaws.md` | replaced — census table (no hash row — listed by name only) |

### At the v5.97 ship (2026-10-08) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_96.jsx` and `dom_entry_v596.jsx`. **Pool goes 124 → 125** (`t61_ga_ok_rates.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v5_96.jsx` | **rotated out** — v5.96 is read from the repo's history (commit `2d61c3c`) |
| `dom_entry_v596.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t2_engines.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_97.jsx`, `dom_entry_v597.jsx`, `t61_ga_ok_rates.mjs`. **Repo-only:** `controls_v597_rates.py`, the fulfilled scope, the built `index.html`.

### At the v5.96 ship (2026-10-08) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_95.jsx` and `dom_entry_v595.jsx`. **Pool goes 123 → 124** (`t60_engineA_survivor_state.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v5_95.jsx` | **rotated out** — v5.95 is read from the repo's history (commit `caf29a1`) |
| `dom_entry_v595.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t8_invariant.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_96.jsx`, `dom_entry_v596.jsx`, `t60_engineA_survivor_state.mjs`. **Repo-only:** `controls_v596_survivor_state.py`, the fulfilled scope, the built `index.html`.

### At the v5.95 ship (2026-10-07) — DELETE THESE FIRST

**Rotation and retirement:** delete `DangerClose-v5_94.jsx`, `dom_entry_v594.jsx` and `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` (retired, FULFILLED). **Pool stays 123** (three leave, three arrive).

| Delete | Because |
|---|---|
| `DangerClose-v5_94.jsx` | **rotated out** — v5.94 is read from the repo's history (commit `ebdfaa9`) |
| `dom_entry_v594.jsx` | **rotated out** with it |
| `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` | **retired** — FULFILLED at v5.95; repo-only; residuals re-homed (MissingFeatures D-12, D-27, D-28) |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t8_invariant.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_95.jsx`, `dom_entry_v595.jsx`, `t59_per_person_state.mjs`. **Repo-only:** `controls_v595_per_person.py`, the built `index.html`, the retired scope.

### At the v5.94 ship (2026-10-06) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_93.jsx` and `dom_entry_v593.jsx`. **Pool goes 122 → 123** (`t58_state_draw.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_93.jsx` | **rotated out** — v5.93 is now read from the repo's history (commit `2a4bfa6`) |
| `dom_entry_v593.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_94.jsx`, `dom_entry_v594.jsx`, `t58_state_draw.mjs`. **Repo-only:** `controls_v594_state_draw.py` (release-pinned),
the fulfilled `docs/SCOPE_D26_STATE_TAX_DRAW.md`, the built `index.html`.

### At the v5.93 ship (2026-10-06) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_91.jsx` and `dom_entry_v591.jsx`. **Pool goes 121 → 122** (`t57_attribution_carry.mjs` arrives). There is no v5.92.

| Delete | Because |
|---|---|
| `DangerClose-v5_91.jsx` | **rotated out** — v5.91 is now read from the repo's history (commit `54764c5`) |
| `dom_entry_v591.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_93.jsx`, `dom_entry_v593.jsx`, `t57_attribution_carry.mjs`. **Repo-only:** `controls_v593_attribution.py` (release-pinned),
the built `index.html`.

### At the v5.91 ship (2026-10-06) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_90.jsx` and `dom_entry_v590.jsx`. **Pool goes 119 → 121** (`t56_plan_type_collect.mjs` and `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` arrive).

| Delete | Because |
|---|---|
| `DangerClose-v5_90.jsx` | **rotated out** — v5.90 is now read from the repo's history (commit `39014e0`) |
| `dom_entry_v590.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_91.jsx`, `dom_entry_v591.jsx`, `t56_plan_type_collect.mjs`, `SCOPE_D12_PLAN_TYPE_PER_PERSON.md`. **Repo-only:** `controls_v591_plantype.py` (release-pinned),
the built `index.html`.

### At the v5.90 ship (2026-10-02) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_89.jsx` and `dom_entry_v589.jsx`. **Pool goes 118 → 119** (`t55_retexempt_age.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_89.jsx` | **rotated out** — v5.89 is now read from the repo's history (commit `db860f2`) |
| `dom_entry_v589.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_90.jsx`, `dom_entry_v590.jsx`, `t55_retexempt_age.mjs`. **Repo-only:** `controls_v590_retexempt.py` (release-pinned),
`docs/SCOPE_D24_RETEXEMPT_AGE.md` (FULFILLED), the built `index.html`.

### At the v5.89 ship (2026-10-02) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_88.jsx` and `dom_entry_v588.jsx`. **Pool goes 117 → 118** (`t54_wv_senior_modification.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_88.jsx` | **rotated out** — v5.88 is now read from the repo's history (commit `b584b50`) |
| `dom_entry_v588.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_89.jsx`, `dom_entry_v589.jsx`, `t54_wv_senior_modification.mjs`. **Repo-only:** `controls_v589_wv_senior.py` (release-pinned),
`docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md` (FULFILLED), the built `index.html`.

### At the v5.88 ship (2026-10-01) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_87.jsx` and `dom_entry_v587.jsx`. **Pool goes 116 → 117** (`t53_mydata_summary_age.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_87.jsx` | **rotated out** — v5.87 is now read from the repo's history (commit `622d0ec`) |
| `dom_entry_v587.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_88.jsx`, `dom_entry_v588.jsx`, `t53_mydata_summary_age.mjs`. **Repo-only:** `controls_v588_summary_age.py` (release-pinned),
`docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md` (FULFILLED; its draft reached the repo at `be8ec7c` and never the pool), the built `index.html`.

### At the v5.87 ship (2026-10-01) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_86.jsx` and `dom_entry_v586.jsx` — ONE source and ONE dom entry leave. **Pool
goes 115 → 116** (`t52_age_start_notes.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_86.jsx` | **rotated out** — v5.86 is now read from the repo's history (commit `754e948`) |
| `dom_entry_v586.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_87.jsx`, `dom_entry_v587.jsx`, `t52_age_start_notes.mjs`. **Repo-only:** `controls_v587_age_notes.py` (release-pinned),
`docs/SCOPE_D23_AGE_START_NOTES.md` (FULFILLED), the built `index.html`.

### At the v5.86 ship (2026-09-30) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_85.jsx` and `dom_entry_v585.jsx` — ONE source and ONE dom entry leave. **Pool
goes 114 → 115** (`t51_state_figure_years.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_85.jsx` | **rotated out** — v5.85 is now read from the repo's history (commit `36070e1`) |
| `dom_entry_v585.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_86.jsx`, `dom_entry_v586.jsx`, `t51_state_figure_years.mjs`. **Repo-only:** `controls_v586_state_years.py` (release-pinned),
`docs/SCOPE_D18_STATE_FIGURES.md` (FULFILLED; D18-3 re-homed as `MissingFeatures.md` D-23), the built `index.html`.

### At the v5.85 ship (2026-09-29) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_84.jsx` and `dom_entry_v584.jsx` — ONE source and ONE dom entry leave. **Pool
goes 113 → 114** (`t50_ss_states.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_84.jsx` | **rotated out** — v5.84 is now read from the repo's history (commit `62c8aeb`) |
| `dom_entry_v584.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_85.jsx`, `dom_entry_v585.jsx`, `t50_ss_states.mjs`. **Repo-only:** `controls_v585_ss_states.py` (release-pinned),
`docs/SCOPE_SS_STATES.md` (FULFILLED), the built `index.html`.

### At the v5.84 ship (2026-09-29) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_83.jsx` and `dom_entry_v583.jsx` — ONE source and ONE dom entry leave. **Pool
goes 112 → 113** (`t49_engineA_draw.mjs` arrives).

| Delete | Because |
|---|---|
| `DangerClose-v5_83.jsx` | **rotated out** — v5.83 is now read from the repo's history (commit `6af40fc`) |
| `dom_entry_v583.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v5_84.jsx`, `dom_entry_v584.jsx`, `t49_engineA_draw.mjs`. **Repo-only:** `controls_v584_draw.py` (release-pinned),
`docs/SCOPE_ROTH_COMPARATOR_DRAW.md` (FULFILLED), the built `index.html`.

### At the v5.83 ship (2026-09-29) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_82.jsx` and `dom_entry_v582.jsx` — ONE source and ONE dom entry leave. **Pool
stays 112.**

| Delete | Because |
|---|---|
| `DangerClose-v5_82.jsx` | **rotated out** — v5.82 is now read from the repo's history (commit `b9f8943`) |
| `dom_entry_v582.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced |

**Arriving new:** `DangerClose-v5_83.jsx`, `dom_entry_v583.jsx`. **Repo-only:** `controls_v583_surfaces.py` (release-pinned),
`docs/SCOPE_LIGHT_SKIN_SURFACES.md` (FULFILLED), the built `index.html`.

### At the v5.82 ship (2026-09-29) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_81.jsx` and `dom_entry_v581.jsx` — ONE source and ONE dom entry leave. **Pool
goes 111 → 112.**

| Delete | Because |
|---|---|
| `DangerClose-v5_81.jsx` | **rotated out** — v5.81 is now read from the repo's history (commit `e881715`) |
| `dom_entry_v581.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `index.html` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced |

**Arriving new:** `DangerClose-v5_82.jsx`, `dom_entry_v582.jsx`, `t48_legibility_targets.py`. **Repo-only:** `controls_v582_legibility.py`
(release-pinned), `docs/SCOPE_TEXT_AND_TARGETS.md` (FULFILLED), the built `index.html`.

### At the v5.81 ship (2026-09-28) — DELETE THESE FIRST

**Rotation (single-source):** delete `DangerClose-v5_80.jsx` and `dom_entry_v580.jsx` — ONE source and ONE dom entry leave. **Pool
goes 110 → 111.**

| Delete | Because |
|---|---|
| `DangerClose-v5_80.jsx` | **rotated out** — v5.80 is now read from the repo's history (commit `4aeabb1`) |
| `dom_entry_v580.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `controls_runfolder_prior.sh` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `mk_runfolder.sh` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced |

**Arriving new:** `DangerClose-v5_81.jsx`, `dom_entry_v581.jsx`, `t47_phone_first_screen.py`. **Repo-only:** `controls_v581_first_screen.py`
(release-pinned), `docs/SCOPE_PHONE_FIRST_SCREEN.md` (FULFILLED), `docs/AUDIT_TOP_FIVE_SUMMARY.md`, the built `index.html`.

### At the ops package of 2026-09-28 (third) — DELETE THESE FIRST

3 files replaced; nothing leaves, nothing arrives. **Pool stays 110.**

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced |
| `package_check_controls.sh` | replaced — P22 fixed |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |

### At the ops package of 2026-09-28 (second) — DELETE THESE FIRST

**2 files LEAVE the pool with no replacement** and 6 are replaced; 1 arrives new. **Pool goes 111 → 110.**

| Delete | Because |
|---|---|
| `DangerClose-v5_79.jsx` | **leaves the pool** — the prior source is read from the repo's history from now on |
| `dom_entry_v579.jsx` | **leaves the pool** — one dom entry from now on |
| `CHANGELOG.md` | replaced |
| `mk_runfolder.sh` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced |

**Arriving new:** `controls_runfolder_prior.sh`. Repo-only: `docs/SCOPE_SINGLE_SOURCE_POOL.md` (FULFILLED). **The pool is ADD-ONLY.**

### At the ops package of 2026-09-28 — DELETE THESE FIRST

**24 files LEAVE the pool with no replacement** (they stay in the repo) and 3 are replaced. **Pool goes 135 → 111.**

| Delete | Because |
|---|---|
| `controls_v557.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v5571.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v559.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v560.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v561.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v562.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v563.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v564.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v565.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v566_nm.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v568_runfolder.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v568_va.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v569_ri.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v570_b3.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v571_draft.sh` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v572_import.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v573_me_mt.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v574_c8.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v575_c3c6.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v576_c7.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v577_ss86.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v578_irmaa.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v579_layout.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `controls_v580_scenario.py` | **un-pooled** — repo-only from now on (release-pinned) |
| `CHANGELOG.md` | replaced — now v5.75 onward |
| `OPERATIONS.md` | replaced — §G records both moves |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |

**Arriving new:** nothing. Repo-only: `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`. **The pool is ADD-ONLY (§L F-1)**: delete the
three replaced files before uploading their new copies, and delete the 24 scripts outright.

### At the v5.80 ship (2026-09-27) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_78.jsx` and `dom_entry_v578.jsx` (they leave; nothing replaces them). **Pool goes 133 → 135.**

| Delete | Because |
|---|---|
| `DangerClose-v5_78.jsx` | **rotated out** — v5.79 is now the prior build |
| `dom_entry_v578.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new** (nothing to delete for them): `controls_v580_scenario.py`, `DangerClose-v5_80.jsx`, `dom_entry_v580.jsx`, `t46_scenario_default.mjs`. **The pool is ADD-ONLY (§L F-1).** Repo-only, not the pool: `docs/SCOPE_SCENARIO_DEFAULT.md` (FULFILLED) and the built `index.html`.

### At the v5.79 ship (2026-09-27) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_77.jsx` and `dom_entry_v577.jsx` (they leave; nothing replaces them). **Pool goes 131 → 133.**

| Delete | Because |
|---|---|
| `DangerClose-v5_77.jsx` | **rotated out** — v5.78 is now the prior build |
| `dom_entry_v577.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced — added at packaging: its v5.79 correction came after this list was first drawn |
| `mk_runfolder.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced |

**Arriving new** (nothing to delete for them): `controls_v579_layout.py`, `DangerClose-v5_79.jsx`, `dom_entry_v579.jsx`, `t45_phone_layout.py`. **The pool is ADD-ONLY (§L F-1).** Repo-only, not the pool: `docs/SCOPE_PHONE_LAYOUT.md` (FULFILLED), `docs/AUDIT_TOP_FIVE_SUMMARY.md` (annotated) and the built `index.html`.

### At the v5.78 ship (2026-09-26) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_76.jsx` and `dom_entry_v576.jsx` (they leave; nothing replaces them). **Pool goes 129 → 131.**

| Delete | Because |
|---|---|
| `DangerClose-v5_76.jsx` | **rotated out** — v5.77 is now the prior build |
| `dom_entry_v576.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new** (nothing to delete for them): `controls_v578_irmaa.py`, `DangerClose-v5_78.jsx`, `dom_entry_v578.jsx`, `t44_irmaa_top_tier.mjs`. **The pool is ADD-ONLY (§L F-1).** Repo-only, not the pool: `docs/SCOPE_IRMAA_TOP_TIER.md` (FULFILLED), `docs/AUDIT_TOP_FIVE_SUMMARY.md` (annotated) and the built `index.html`.

### At the v5.77 ship (2026-09-25) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_75.jsx` and `dom_entry_v575.jsx` (they leave; nothing replaces them). **Pool goes 127 → 129.**

| Delete | Because |
|---|---|
| `DangerClose-v5_75.jsx` | **rotated out** — v5.76 is now the prior build |
| `dom_entry_v575.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new** (nothing to delete for them): `controls_v577_ss86.py`, `DangerClose-v5_77.jsx`, `dom_entry_v577.jsx`, `t43_ss86_one_rule.mjs`. **The pool is ADD-ONLY (§L F-1).** Repo-only, not the pool: `docs/SCOPE_SS86_ONE_RULE.md` (FULFILLED) and `qa/tools/scope_ss86/` (the scope's three probes).

### At the ops upload of 2026-09-22 (package_check declarations) — DELETE THESE FIRST

**Nothing leaves the pool and nothing arrives new. Pool stays 123.**

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |

**The pool is ADD-ONLY (§L F-1).**

### At the v5.74 ship (2026-09-21) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_72.jsx` and `dom_entry_v572.jsx` (they leave; nothing replaces them), and un-pool
`SCOPE_TAXES_DRAWDOWN.md` (retired; the repo copy stays). **Pool goes 122 → 123.**

| Delete | Because |
|---|---|
| `DangerClose-v5_72.jsx` | **rotated out** — v5.73 is now the prior build |
| `dom_entry_v572.jsx` | **rotated out** with it |
| `SCOPE_TAXES_DRAWDOWN.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `ARCHITECTUREIssues.md` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t11_survivor_rmd.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new** (nothing to delete for them): `controls_v574_c8.py`, `DangerClose-v5_74.jsx`, `dom_entry_v574.jsx`, `t40_cross_tab_agreement.mjs`. **The pool is ADD-ONLY (§L F-1).**

### At the ops upload of 2026-09-15 (seventh — space) — DELETE THESE FIRST

**KIND: ops — v5.73 stays current.** **Pool goes 133 → 121**: twelve files leave, none arrive.

| Delete | Because |
|---|---|
| `FINDINGS-v5_63-otherOrd.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `FINDINGS-v5_63-state-statutes.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `STOP-REPORT-v5_63-fica-workbench.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `STOP-REPORT-v5_66-NM-note-guarded-set.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `STOP-REPORT-v5_66-nm-session2.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `STOP-REPORT-v5_72-import-hardening-session1.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_HOUSEKEEPING_THREE.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_STATE_SET_SELECTOR.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_IMPORT_HARDENING.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_TOOLING_GAPS_V572.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` | **un-pooled** — delete, do not re-upload (repo copy stays) |
| `CHANGELOG.md` | replaced — now v5.60 onward (hash row rolled last) |
| `OPERATIONS.md` | replaced — §G: the CHANGELOG split and un-pooling rules |
| `FlawsToFix-v5_69-Phase1.md` | replaced — two re-homed follow-ups in its header |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this note and section |

**Upload 4 files:** `CHANGELOG.md`, `OPERATIONS.md`, `FlawsToFix-v5_69-Phase1.md`, `PROJECT_KNOWLEDGE_INDEX.md`.
**Repo:** those four (`docs/OPERATIONS.md` and `docs/FlawsToFix-v5_69-Phase1.md` are in `docs/`), plus the new
`docs/CHANGELOG_ARCHIVE_pre_v5_60.md`. The twelve documents **stay** in the repo. **The pool is ADD-ONLY (§L F-1).**

### At the ops upload of 2026-09-15 (sixth — audit Phases 3 and 4) — DELETE THESE FIRST

**KIND: ops — v5.73 stays current.** No rotation, nothing new to the pool. **Pool stays 133.**

| Delete | Because |
|---|---|
| `MissingFeatures.md` | replaced — v5.73 block, D-14–D-20 (hash row rolled) |
| `ARCHITECTUREIssues.md` | replaced — E-21–E-28 |
| `UsabilityFlaws.md` | replaced — v5.73 block, F-11, F-12 |
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this note and section |

**Repo only:** `docs/AUDIT_TOP_FIVE_SUMMARY.md`, `qa/tools/audit_phase4_v573/probe_ux.py`. **The pool is ADD-ONLY (§L F-1).**

### At the ops upload of 2026-09-15 (fifth — audit Phase 2) — DELETE THESE FIRST

**KIND: ops — v5.73 stays current.** No rotation. **Pool goes 132 → 133**: `FlawsToFix-v5_73-Phase2.md` ARRIVES.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this note, the new row, this section |

**Repo only:** `qa/tools/audit_phase2_v573/` (18 probe scripts, never pooled). **The pool is ADD-ONLY (§L F-1).**

### At the v5.73 ship (2026-09-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_71.jsx` and `dom_entry_v571.jsx` (they leave; nothing replaces them). **Pool goes 129 → 132.**

| Delete | Because |
|---|---|
| `DangerClose-v5_71.jsx` | **rotated out** — v5.72 is now the prior build |
| `dom_entry_v571.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_69-Phase1.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `TESTING.md` | replaced |
| `controls_state_sets.py` | replaced |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |

**Arriving new** (nothing to delete for them): `DangerClose-v5_73.jsx`, `dom_entry_v573.jsx`, `t39_me_mt.mjs`,
`controls_v573_me_mt.py`, `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md`. **The pool is ADD-ONLY (§L F-1).**

### At the ops upload of 2026-09-15 (fourth — tooling gaps) — DELETE THESE FIRST

**KIND: ops — v5.72 stays current.** No rotation. **Pool goes 128 → 129**: `SCOPE_TOOLING_GAPS_V572.md` ARRIVES.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this note, the scope's row, the rolled rows |
| `OPERATIONS.md` | replaced — the shapes table, the K paragraphs, run-the-controls-twice |
| `TESTING.md` | replaced — `t21` is 64 |
| `package_check.mjs` | replaced — K-1…K-3, G-1 |
| `package_check_controls.sh` | replaced — P56…P61 |
| `mk_runfolder.sh` | replaced — the copy-back |
| `vercensus.cjs` | replaced — keyed registries |
| `t21_tools.mjs` | replaced — the shape section |

**Repo only:** `qa/tools/vercensus_list.cjs` (never pooled). **The pool is ADD-ONLY (§L F-1).**

### At the v5.72 ship (2026-09-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v5_70.jsx` and `dom_entry_v570.jsx` (they leave; nothing replaces them). **Pool goes 126 → 128.**

| Delete | Because |
|---|---|
| `DangerClose-v5_70.jsx` | **rotated out** — v5.71 is now the prior build |
| `dom_entry_v570.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced |
| `FlawsToFix-v5_69-Phase1.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `SCOPE_IMPORT_HARDENING.md` | replaced |
| `SCOPE_STATE_SET_SELECTOR.md` | replaced |
| `TESTING.md` | replaced |
| `controls_state_sets.py` | replaced |
| `package_check.mjs` | replaced |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `state_sets.cjs` | replaced |
| `state_sets_check.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `CHANGELOG.md` | replaced — the v5.72 entry, hash row rolled last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |

**Arriving new** (nothing to delete for them): `DangerClose-v5_72.jsx`, `dom_entry_v572.jsx`, `t38_import_hardening.mjs`,
`controls_v572_import.py`. **Repo only:** `qa/tools/probe_import_hostile.mjs` (never pooled). The session-1 stop report
**stays** in the pool, marked resolved. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the handover upload of 2026-09-15 (import hardening, session 1) — DELETE THESE FIRST

**KIND: handover — v5.71 stays current.** No rotation, no version bump, no rebuild. **Pool goes 125 → 126**: `STOP-REPORT-v5_72-import-hardening-session1.md` ARRIVES (nothing to delete for it).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the handover entry, computed last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — the handover note, the stop report's row, the scope's row, one hash row rolled, this section |
| `SCOPE_IMPORT_HARDENING.md` | replaced — status line, §3a, §7a (D-10), §9. **Stays OPEN** |

**Repo only, not the pool:** `qa/t38_import_hardening.mjs` (new), `qa/qa-baseline/dom_entry_v572.jsx` (new), `qa/qa-baseline/shim.txt`, `qa/tools/controls_v572_import.py` (new — Python, no shebang, so `G-3a` has nothing new to see), `qa/tools/probe_import_hostile.mjs`. **The workbench source goes nowhere** until session 2. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the ops upload of 2026-09-15 (second — the import-hardening scope) — DELETE THESE FIRST

**KIND: ops — v5.71 stays current.** No source, no rotation, no version bump, no rebuild. **Pool goes 123 → 125**: `SCOPE_IMPORT_HARDENING.md` and `FlawsToFix-v5_69-Phase1.md` ARRIVE (nothing to delete for them).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package, computed last |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — two hash rows rolled, the new scope's row, the FlawsToFix row, this section |
| `SCOPE_STATE_SET_SELECTOR.md` | replaced — §9: Maine is missing from the in-law list; stage 2 is homed in the new scope. **Stays OPEN** |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist gains `SCOPE_IMPORT_HARDENING.md` |

**The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the ops upload of 2026-09-15 (SCOPE_STATE_SET_SELECTOR stage 1) — DELETE THESE FIRST

**KIND: ops — v5.71 stays current.** No rotation, no version bump, no rebuild. **Pool goes 120 → 123**: `state_sets.cjs`, `state_sets_check.mjs` and `controls_state_sets.py` ARRIVE (nothing to delete for them).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package, computed last |
| `OPERATIONS.md` | replaced — §B1a: the matcher exists once; `sel_census` reports 2; `t29` is in the app total |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — seven hash rows rolled, two new rows, three inventory rows, the scope's row, this section |
| `SCOPE_STATE_SET_SELECTOR.md` | replaced — status line and the §8 stage-1 build record. **Stays OPEN** |
| `TESTING.md` | replaced — the `sets` tooling suite, the `t29` correction, `f6_probe`'s coverage note |
| `t10_taxcases.mjs` | replaced — pins read the shared matcher |
| `t29_boundaries.mjs` | replaced — F-6 from the shared list; header corrected |
| `t35_state_populate.mjs` | replaced — D-7 from the shared list; pins read the shared matcher |
| `runsuite.sh` | replaced — `state_sets_check.mjs` registered under TOOLING |

**`f6_probe.cjs` changes in the repo only** — it has never been pooled. **No new shell script ships**, so `G-3a` has nothing new to see; the new controls file is Python with no shebang. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the ops upload of 2026-09-14 (t21 Section F — Item B) — DELETE THESE FIRST

**KIND: ops — v5.71 stays current.** No rotation, no version bump, no rebuild. **Pool goes 119 → 120**: `controls_t21_censusp1.sh` ARRIVES (nothing to delete for it).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package, computed last |
| `OPERATIONS.md` | replaced — §B1's stale `t21` count (49) and the true reach of its warrant |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — four hash rows rolled, one new row, the `t21` inventory row, this section |
| `SCOPE_HOUSEKEEPING_THREE.md` | replaced — RETIRED marker and the Item B build record (§7) |
| `TESTING.md` | replaced — the twelve-tool disclosure, and both stale figure sentences |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist loses `SCOPE_HOUSEKEEPING_THREE.md` |
| `t21_tools.mjs` | replaced — Section F, 50 → 56 |

⚠ **`controls_t21_censusp1.sh` is a NEW shell script and must land `100755`.** A drag-and-drop upload lands it `100644` and `G-3a` fires — edit in place, then check `git ls-files -s`. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the ops upload of 2026-09-12 (the A-3 scope) — DELETE THESE FIRST

**KIND: ops — v5.70 stays current.** No rotation. **Pool goes 130 → 131**: `SCOPE_A3_DRAFT_AUTOSAVE.md` ARRIVES (nothing to delete for it).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — the scope's inventory row, two hash rows, this section |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist gains `SCOPE_A3_DRAFT_AUTOSAVE.md` |

⚠ `docs/STATUS_2026_09_11_b3_live_verification.md` is repo-only and is **edited in the repo**, not uploaded to the pool: its §4 reserved line now carries the maintainer's real-browser result. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.


### At the ops upload of 2026-09-11 (third package — the B-3 live-site verification) — DELETE THESE FIRST

**KIND: ops — v5.70 stays current.** No rotation. **Pool goes 130 → 130** (four files replaced, none arrive).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `OPERATIONS.md` | replaced — §I's "a session cannot reach `stextor.github.io`" paragraph corrected (F-7) |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — two inventory rows (the new record; `VERIFICATION_REPORT.md` as frozen REPO-ONLY), the orientation note, three hash rows rolled, this section |
| `TESTING.md` | replaced — its "Current build" sentence rolled from v5.67 to v5.70 (F-5) |

⚠ `docs/STATUS_2026_09_11_b3_live_verification.md` is **repo-only** — nothing arrives in the pool. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the v5.70 upload (2026-09-11) — DELETE THESE FIRST

**v5.70 is the current build**, source `df3e5d7599277ae1bb1afc216d318baf`, artifact `372d066cf4fc7115ebdae9fc9d6f35d1`.

| Delete | Because |
|---|---|
| `DangerClose-v5_68.jsx` | **rotation** — leaves the pool; v5.69 becomes prior |
| `dom_entry_v568.jsx` | **rotation** — leaves the pool with its source leg (J-4); its hash row left in the same edit |
| `SCOPE_B3_KEYLESS_AI_ROUTE.md` | **leaves** — RETIRED, FULFILLED at v5.70; stays in the repo as the build record. Its hash row left (D-3) and its `package_check` allowlist entry was removed in the same package. Nothing replaces it in the pool |
| `CHANGELOG.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced |
| `TESTING.md` | replaced |
| `package_check.mjs` | replaced |
| `runsuite.sh` | replaced |
| `smoke_built.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |

⚠ `DangerClose-v5_70.jsx`, `controls_v570_b3.sh`, `dom_entry_v570.jsx`, `t36_ai_route.mjs` are **NEW** — nothing to delete first. **The pool is ADD-ONLY (§L F-1)**: every `replaced` file
above must be deleted before its new copy is uploaded. **Pool goes 129 → 130** (three leave, four arrive).

### At the ops upload of 2026-09-11 (second package — the B-3 scope) — DELETE THESE FIRST

**KIND: ops — v5.69 stays current.** No rotation. **Pool goes 128 → 129** (one arrives).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — the scope's description and hash rows, `package_check.mjs`'s and `CHANGELOG.md`'s hash rows rolled, two status lines updated, this section |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist gains `SCOPE_B3_KEYLESS_AI_ROUTE.md` |

⚠ `SCOPE_B3_KEYLESS_AI_ROUTE.md` is **NEW** — nothing to delete first. It gets a **hash row** as well as its description
row: D-3's deliberately-unrowed classes cover *retired* `SCOPE_*` documents, not active ones (§I), and the v5.70 package that retires it deletes the row. `docs/FlawsToFix-v5_69-Phase1.md`
is repo-only. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the ops upload of 2026-09-11 (Phase 1 re-run at v5.69 — the import and storage path) — DELETE THESE FIRST

**KIND: ops — v5.69 stays current.** No rotation. **Pool goes 128 → 128** (two files replaced, none arrive).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — five repo-only tool rows, one audit row added and one annotated, `CHANGELOG.md`'s row rolled, an orientation note, this section. ⚠ **The pool copy this replaces was the v5.68 manifest**: when the audit began its Current-build table named v5.68 and no line mentioned v5.69, while source, suites, OPERATIONS.md and CHANGELOG all matched the clone. The v5.69 package's manifest never reached the pool |

⚠ `docs/FlawsToFix-v5_69-Phase1.md` and the five `qa/tools/` files are **repo-only** — nothing arrives in the pool. **The pool is ADD-ONLY (§L F-1)**: delete each `replaced` file before uploading its new copy.

### At the v5.69 upload (2026-09-10) — DELETE THESE FIRST

**v5.69 is the current build**, source `76a35ba283ed5153ff257106e7ccfc10`, artifact `86703918db247e3284752f0f1cc1f6d5`.

| Delete | Because |
|---|---|
| `DangerClose-v5_67.jsx` | **rotation** — leaves the pool; v5.68 becomes prior |
| `dom_entry_v567.jsx` | **rotation** — leaves the pool with its source leg (J-4); its hash row left in the same edit |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced |
| `SCOPE_INCOME_CONDITIONING.md` | replaced |
| `SCOPE_RI_POPULATE.md` | replaced |
| `SCOPE_STATE_SET_SELECTOR.md` | replaced |
| `TESTING.md` | replaced |
| `boundaries.mjs` | replaced |
| `controls_state.sh` | replaced |
| `households.mjs` | replaced |
| `package_check.mjs` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |

⚠ `DangerClose-v5_69.jsx`, `controls_v569_ri.py`, `dom_entry_v569.jsx`, `oracle_ri.py` are **NEW** — nothing to delete first. **The pool is ADD-ONLY (§L F-1)**: every `replaced` file
above must be deleted before its new copy is uploaded. **Pool goes 126 → 128** (two leave by rotation, 4 arrive).

### At the ops upload of 2026-09-10 (second package — the Rhode Island scope) — DELETE THESE FIRST

**KIND: ops — v5.68 stays current.** No rotation. **Pool goes 125 → 126** (one arrives).

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `FINDINGS-v5_63-state-statutes.md` | replaced — §6 and §7c corrected in place: Rhode Island's comparator is exclusive |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — two rows rolled, two rows annotated, one row added, this section |
| `SCOPE_INCOME_CONDITIONING.md` | replaced — B-2 annotated in place |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist gains `SCOPE_RI_POPULATE.md` |

⚠ `SCOPE_RI_POPULATE.md` is **NEW** — nothing to delete first. **The pool is ADD-ONLY (§L F-1)**: every `replaced`
file above must be deleted before its new copy is uploaded.

### At the ops upload of 2026-09-10 (controls_state.sh repaired; the v5.68 ship's lessons) — DELETE THESE FIRST

**KIND: ops — v5.68 stays current.** No rotation; pool stays at 125.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `OPERATIONS.md` | replaced — §I's full pre-ship red set and `controls_state.sh` repair; §C3's second instance; §L's ops CHANGELOG rule |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — three rows rolled, `controls_state.sh`'s prose, this section |
| `controls_state.sh` | replaced — repaired: version-tag argument, S0 null control, drift-reporting mutations |

### At the v5.68 upload (2026-09-10) — DELETE THESE FIRST

**v5.68 is the current build**, source `561fc39b5bdae7c6d83698f352c436b3`, artifact `f7f0e3dd338804b2a09a6ca53318ac26`.

| Delete | Because |
|---|---|
| `DangerClose-v5_66.jsx` | **rotation** — leaves the pool; v5.67 becomes prior |
| `dom_entry_v566.jsx` | **rotation** — leaves the pool with its source leg (J-4); its hash row left in the same edit |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced |
| `SCOPE_INCOME_CONDITIONING.md` | replaced |
| `SCOPE_VA_POPULATE.md` | replaced |
| `TESTING.md` | replaced |
| `boundaries.mjs` | replaced |
| `households.mjs` | replaced |
| `package_check.mjs` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t6_single.mjs` | replaced |

⚠ `DangerClose-v5_68.jsx`, `dom_entry_v568.jsx` and `controls_v568_va.py` are **NEW** — nothing to delete
first. **The pool is ADD-ONLY (§L F-1)**: every `replaced` file above must be deleted before its new copy
is uploaded. **Pool goes 124 → 125** (two leave by rotation, three arrive).

### At the ops upload of 2026-09-09 (third package — oracle_va.py's rows) — DELETE THESE FIRST

**No version bump. v5.67 remains the current build**, source `ca05b2ece1af9dac3851837a0e96fbfa`,
artifact `35fcca203418e3e10b11765e2c6ade93`, tree `4876f96`. **No app source, no `t*.mjs`, no fixture
was touched.** This package carries **`PROJECT_KNOWLEDGE_INDEX.md` only**.

| Delete | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — two rows for `qa/tools/oracle_va.py` |

⚠ **`oracle_va.py` itself is already in the repo** (`4876f96`) and is unchanged by this package.
**Pool goes 123 → 124** if it was uploaded there too.

⚠ **WHY THIS PACKAGE EXISTS, since it is the kind that gets skipped.** `oracle_va.py` was uploaded
ahead of the release that consumes it. Nothing reads it yet, so it moves no user's number and breaks
no test — but **`K-9` fires on any pool file the manifest does not name**, and the manifest named it
nowhere. That is not a hypothetical: `oracle_nm.py`'s own hash row records being added *"one package
late (K-9)"*. The same miss, one release later, would have been the second instance of a defect this
file already documents against itself.

⚠ **It is ROWED, not merely named**, and that is a judgement worth stating rather than burying. D-3's
standing reasoning — *a row on a file that never changes protects nothing* — argues against rowing a
file no suite reads. It is rowed anyway because `K-8`'s matcher has seen `.py` since v5.67, the row
costs nothing today, and the alternative is to remember to add it when `t10` starts consuming it,
which is precisely the thing that was not remembered last time.

### At the ops upload of 2026-09-09 (second package — the VA decisions are settled) — DELETE THESE FIRST

**No version bump. v5.67 remains the current build**, source `ca05b2ece1af9dac3851837a0e96fbfa`,
artifact `35fcca203418e3e10b11765e2c6ade93`. **No app source, no `t*.mjs`, no fixture was touched.**
This package changes DECISION STATE only: `SCOPE_VA_POPULATE.md` goes from *not buildable* to
*buildable*, and the two files that describe its status follow it.

| Delete | Because |
|---|---|
| `SCOPE_VA_POPULATE.md` | replaced — §6's two reopened decisions are RESOLVED, §5 gains the F-6a/F-6b repair as a build requirement, and D-VA-6 records that the repair ships with this release |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `package_check.mjs` | replaced — the I-2 entry's reason, rolled the same day it was written |

⚠ **Nothing is NEW in this package.** All three replace files uploaded hours earlier; the pool stays
at **123**. If the first package of 2026-09-09 has NOT been uploaded yet, upload this one INSTEAD of
it for these three files — they supersede, they do not stack.

⚠ **The decisions were reopened by measurement and then re-resolved, and BOTH halves are the
record.** The handover brief recorded D-VA-2 and D-VA-3 as settled; measurement contradicted both;
they were re-decided on the re-measured evidence. A future reader who sees only the resolution will
not know the first answer was wrong, which is why §6 keeps what changed and why.

### At the ops upload of 2026-09-09 (run-folder + VA scope) — DELETE THESE FIRST

**No version bump. v5.67 remains the current build**, source `ca05b2ece1af9dac3851837a0e96fbfa`,
artifact `35fcca203418e3e10b11765e2c6ade93`. **No app source, no `t*.mjs`, no fixture was touched.**
The v5.67 suite was re-run in full from a clean run folder to confirm the baseline: **3,377 app
checks, 0 failing** (tooling `t21` 50 + `domdiff` 32 counted separately; GRAND 3,459), computed from
suite output.

| Delete | Because |
|---|---|
| `OPERATIONS.md` | replaced — §B's `mk_runfolder.sh` pointer, and §D's new **D1** and **D2** |
| `qa-baseline-README.md` | replaced — the same pointer at the top of its Setup section |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist gains `SCOPE_VA_POPULATE.md`, and the INCOME_CONDITIONING reason is rolled to TWO left |

⚠ `mk_runfolder.sh`, `controls_v568_runfolder.sh` and `SCOPE_VA_POPULATE.md` are **NEW** — nothing to
delete first. The first and third have rows (above); the second is deliberately unrowed, and that
decision is recorded beside the two `.py` control scripts it stands with, so `K-9` sees it named.

⚠ **The pool is ADD-ONLY (§L F-1).** All three files above must be deleted before the new copies are
uploaded. **Pool goes 120 → 123.**

> ### ⚠ TWO NEW SHELL SCRIPTS LANDED AT `100644` — the §L drag-and-drop trap, second occurrence
>
> The repo upload at `74cf96d` ("Add files via upload") **dropped the executable bit on both new
> scripts**, exactly as §L predicts: *"the same upload path drops the executable bit on any NEW shell
> script … replacing an existing tracked file preserves its mode."* Confirmed by §L's own prescribed
> check — `git ls-files -s` shows `qa/mk_runfolder.sh` and `qa/tools/controls_v568_runfolder.sh` at
> `100644` against **17** other shell scripts at `100755`, and `./qa/mk_runfolder.sh` returns
> *Permission denied*.
>
> **Not fixable from the GitHub web UI** — replacing the file preserves the wrong mode, which is the
> same property that caused it. It needs `git update-index --chmod=+x` from a git client, or the
> scripts run as `bash qa/mk_runfolder.sh …`, which works today and is the documented fallback the
> qa-baseline README already gives for `mk_testable.sh`. **Neither script is broken; only its
> invocation is.** Recorded here so the next session does not diagnose a permissions error as a
> defect in the script.

### At the ops upload of 2026-09-07 (eleventh package — the NM handover's third place) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no tooling.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file; the row K-9 was missing, and `CHANGELOG.md`'s md5 row rolled |
| `CHANGELOG.md` | replaced — the ops entry for this package |

**No deletion from the repo.** `STOP-REPORT-v5_66-nm-session2.md` is already in both destinations and
is **not** re-uploaded — only its manifest row was missing.

> ⚠ **K-9 HAS NOW GONE RED THREE TIMES THIS WEEK FOR ONE REASON: §G's three places done in two
> passes.** H-2 (pool deletions and manifest rows two sessions apart), the seventh package, and this
> one. ⚠ **This third instance was FORESEEN AND SHIPPED ANYWAY** — the handover package's own
> `README-FIRST.md` predicted it. The reasoning was sound about the CHANGELOG row and wrong about
> the conclusion: carry the CHANGELOG too, rather than ship a known-red gate.
>
> ⚠ **`STOP-REPORT-v5_66-NM-note-guarded-set.md` is also updated in the repo** (`docs/` only — it has
> no pool copy). Its decision was answered the same day it was written and its row still said *"Read
> §4 (D-NM-1) FIRST."* That is the defect the third scope-status sweep hunted across 44 files,
> recurring one day later on a document created after the sweep.


### At the ops upload of 2026-09-07 (tenth package, D-B-1 (c) — Item B's premise) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. **Nothing is built** — this corrects a premise.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file; `CHANGELOG.md`'s row rolled |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `SCOPE_HOUSEKEEPING_THREE.md` | replaced — Item B's premise corrected: **nine tools, not three** |

**No deletion from the repo.**

> ⚠ **`CHANGELOG.md`'S ROW IS ROLLED, AND THIS IS THE FIRST PACKAGE THAT HAD TO.** The ninth package
> added that row and recorded the obligation in this file *"so the first package to face it would not
> miss it."* This is that package. The hash is computed **after** the CHANGELOG entry is final,
> because the row lives in a different file and any later edit to the entry silently invalidates it.
>
> ⚠ **`SCOPE_HOUSEKEEPING_THREE.md` carries no row and gets none** (D-3 excludes scope documents),
> and it **stays on the I-2 OPEN allowlist** — Item B is unbuilt.


### At the ops upload of 2026-09-07 (ninth package, Items A and C) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no tooling.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file; Item C's six rows and the unrowed list |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `MissingFeatures.md` | replaced — Item A; the D-10 row corrected in five places |
| `SCOPE_HOUSEKEEPING_THREE.md` | replaced — Items A and C recorded as built; Item B stays OPEN |

**No deletion from the repo.**

> ⚠ **THREE OF THE FOUR NOW CARRY MD5 ROWS THAT THIS PACKAGE ITSELF ROLLED** — `CHANGELOG.md` and
> `MissingFeatures.md` by Item C, computed into place with `CHANGELOG.md`'s taken **last**, after its
> own text was final. That ordering is not optional: its row lives in a different file, so the hash
> must be computed after the entry is written and never touched again.
>
> ⚠ **`SCOPE_HOUSEKEEPING_THREE.md` carries no row and gets none** — D-3 excludes scope documents.
> It stays on `package_check`'s **I-2 OPEN allowlist**: Item B is unbuilt and D-2's prerequisite is
> unanswered.


### At the ops upload of 2026-09-07 (eighth package, D-C-1 (a) — K-8 learns a row from a sentence) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no `index.html`.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file; both tool hash rows rolled |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `package_check.mjs` | replaced — K-8's row matcher narrowed |
| `package_check_controls.sh` | replaced — gains P42 and P43 |

**No deletion from the repo.**

> ⚠ **THIS PACKAGE IS A PREREQUISITE, NOT A CLEANUP.** Items A and C of
> `SCOPE_HOUSEKEEPING_THREE.md` are **blocked on it**. Item A edits `MissingFeatures.md`, and until
> this fix lands **any** edit to that file turns K-8 red — it was reading a dated historical md5 out
> of the file's own index row and treating it as the live hash. Ship this first.
>
> ⚠ **Both tool rows are rolled, deliberately.** This package changes both files, and the row for a
> file a package itself changes is the row most likely to need rolling — the trap that made K-8 pass
> pre-ship and go red on landing on 2026-09-07.


### At the ops upload of 2026-09-07 (seventh package — the NM stop report gets its third place) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no tooling change.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| ⚠ `STOP-REPORT-NM-note-guarded-set.md` | **RENAMED.** Its replacement is `STOP-REPORT-v5_66-NM-note-guarded-set.md`, uploaded fresh |

> ⚠ **AND ONE DELETION FROM THE REPO, because a rename is a delete plus an upload in BOTH places:**
> **`DELETE FROM REPO: docs/STOP-REPORT-NM-note-guarded-set.md`**
>
> The pool is add-only and the repo is not, but the rename has to happen in both or the two
> destinations hold the same document under two names. §G records that exact outcome: *"Renaming a
> file is also a delete-plus-upload: if the old name isn't removed, the pool holds the same document
> twice under two names (observed 2026-08)."*
>
> ⚠ **WHY THIS PACKAGE EXISTS AT ALL: `K-9` IS RED ON THE LIVE POOL RIGHT NOW.** The stop report was
> filed to `docs/` and the pool on 2026-09-07 and named nowhere in this manifest, so K-9 — *every
> pool file is named somewhere in the manifest* — went red the moment it landed. **Two of §G's three
> places, done in different passes.** That is H-2's failure exactly, which left K-8 red for two days,
> and it is why §G calls this a three-place operation rather than a two-place one.
>
> ⚠ **The report also carried a FALSE STATEMENT ABOUT ITS OWN DESTINATION** — it read *"Session-only.
> Nothing shipped"* while sitting in the pool. Corrected in place, with the reasoning kept, rather
> than quietly overwritten.
>
> **No md5 hash row is added.** Stop reports do not carry one — `STOP-REPORT-v5_63-fica-workbench.md`
> has none either, and it is among the 37 pool files with no row. Item C of
> `SCOPE_HOUSEKEEPING_THREE.md`, unbuilt, and **D-3's recommendation is explicitly not to row this
> class of document**.

### At the ops upload of 2026-09-07 (sixth package, D-7 — the housekeeping scope retires) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no `index.html`.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | replaced — **RETIRED**; H-1…H-6 and §5's four items are all built |
| `package_check.mjs` | replaced — the I-2 OPEN allowlist loses that scope's expired entry |

**No deletion from the repo.** Nothing is removed anywhere by this package.

> ⚠ **THE HASH ROW FOR `package_check.mjs` WAS ROLLED, AND THAT IS THE WHOLE POINT OF SAYING SO.**
> The manifest-repair package of 2026-09-07 changed this same file and left its row stale; K-8
> passed pre-ship and went red the instant the package landed, because pre-upload it compares the
> NEW row against the OLD pool copy. **The row for a file the package itself changes is the row most
> likely to need rolling and the one the gate could least see.** It is rolled here to
> `775e248b28e78e3867a87030f241ad13`, computed into place, never typed.
>
> ⚠ **`SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` carries NO md5 row** — it is among the 37 files that
> have none, so K-8 cannot see it in either direction. That is Item C of
> `SCOPE_HOUSEKEEPING_THREE.md`, still unbuilt, and this package is another instance of it.
>
> ⚠ **THE SCOPE'S RETIREMENT AND THE ALLOWLIST REMOVAL SHIP TOGETHER, DELIBERATELY.** Either half
> alone is wrong: dropping the entry while the scope still reads *"OPEN — NOT YET BUILT"* turns a
> correct retirement into a red I-2, and retiring the scope while the entry stands leaves a
> permanent excuse that `I-3` cannot see. Three places, one package — the lesson H-2 paid two days
> of a red K-8 for.

### At the ops upload of 2026-09-07 (fifth package, the third scope-status sweep) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no `qa/tools/`
change, no `index.html`. Documents only.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | replaced — §5 item 4 executed; §9's H-6 self-contradiction corrected |
| `SCOPE_HOUSEKEEPING_THREE.md` | replaced — three premises re-checked, Item C's counts corrected, **D-5** raised |

**No deletion from the repo.** Nothing is removed anywhere by this package.

> ⚠ **FOUR REPO-ONLY DOCUMENTS ALSO CHANGE and are NOT in the pool** — they ship to `docs/` only:
> `SCOPE_BOUNDARY_CENSUS.md`, `SCOPE_D10_MODELLING_v5_53.md`, `SCOPE_STATE_FIXTURES.md` (annotations
> from the sweep). They have no pool copy and no hash row, which is correct and is H-2's settled
> shape.
>
> ⚠ **NO HASH ROW NEEDS ROLLING BY THIS PACKAGE, and that is not luck — it is Item C.** All four
> pooled files it replaces are in the **37 that carry no md5 row**. K-8 therefore cannot see any of
> them, in either direction. That is precisely the gap `SCOPE_HOUSEKEEPING_THREE.md` Item C is
> about, and this package is an instance of it rather than a fix for it. **A package that changes
> `CHANGELOG.md`, the manifest and two scopes touches nothing K-8 can check.**

### At the ops upload of 2026-09-07 (third package, H-3) — DELETE THESE FIRST

**No version bump.** v5.65 remains current. No app source, no `t*.mjs`, no fixture, no tooling change.

| Delete from the POOL | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | replaced — H-3 closed, §9 build record |

> ⚠ **AND ONE DELETION FROM THE REPO, WHICH IS THE POINT OF THE PACKAGE:**
> **`docs/qa-baseline-README.md`** — a byte-identical duplicate of `qa/qa-baseline/README.md`
> (`cbbbb3bae7149cfbcdad7f8e061b5f2a`, all three copies verified equal 2026-09-07). It landed at
> `dcc14c1` as an upload artifact: the pool's *flattened* name uploaded into `docs/` as though it
> were a document. **Nothing points at it** — a full reference census on 2026-09-07 found every
> mention to be prose *about* the duplicate, and the one scope that names the basename
> (`SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` §59) explicitly maps it to
> `qa/qa-baseline/README.md`.
>
> ⚠ **THE POOL COPY `qa-baseline-README.md` IS NOT DELETED AND MUST NOT BE.** It is the legitimate
> flattened name and has its own row above. Only the `docs/` duplicate goes.
>
> ⚠ **This is the FIRST package to use the `DELETE FROM REPO:` declaration** that E-1b learned to
> read on 2026-09-07. §G's three places are all in this one package: the repo (the deletion), the
> pool (untouched, deliberately), and this manifest row. **H-2 was split across two sessions and
> left K-8 red for two days; this one is not split.**


### At the ops upload of 2026-09-07 (manifest repair) — DELETE THESE FIRST

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`. No app source, no `t*.mjs`, no fixture was touched.

| Delete | Because |
|---|---|
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file; the H-2 rows rewritten as repo-only |
| `package_check.mjs` | replaced — two I-2 allowlist *reasons* corrected |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | replaced — §9 build record for H-2 |

> ⚠ **THIS PACKAGE IS THE THIRD PLACE OF A THREE-PLACE OPERATION, EXECUTED TWO DAYS LATE.** §G
> requires a deletion to move repo, pool and manifest together. H-2 moved two of the three: the
> maintainer deleted the pool copies on 2026-09-05 and the repo kept every file, but **the manifest
> was not rewritten in the same pass**, so `package_check` **K-8** was RED from 2026-09-05 to
> 2026-09-07 naming `STATUS_v5_42_shipped.md` and `AUDIT_STATE_EXCL65_NOTES.md`. Nothing was lost —
> all 24 documents are intact in `docs/` — but the index lied about where they were for two days.
> **A three-place operation split across two sessions is a three-place operation that will be left
> at two.**
>
> ⚠ **K-8 SAW TWO OF THE TWENTY-FOUR, AND THAT IS THE MORE USEFUL FINDING.** K-8's regex requires a
> 32-hex md5, so it checks **hashed rows only**. Twenty-two of the stale rows carried no hash and
> were **invisible to every check in the file**: K-9 runs pool → manifest and passes on a row whose
> file has gone, and no check runs manifest → pool for an unhashed row. The gate did not measure the
> problem; it happened to touch 8% of it. **A K-10 for that direction is proposed and NOT built —
> see the CHANGELOG entry for why it cannot be a naive assertion.**

### At the ops upload of 2026-09-04 (decisions package) — DELETE THESE FIRST

**No version bump. v5.63 remains the current build**, source `b2deba49e68bee6c29300f2f8cf0a7e3`,
artifact `5998e8b60c5f45ded623d500fce09a86`. No app source, no `t*.mjs`, no fixture was touched.

| Delete | Because |
|---|---|
| `SCOPE_INCOME_CONDITIONING.md` | replaced — D-2/D-3 approved, premise re-anchored v5.60 → v5.63 |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this file |
| `CHANGELOG.md` | replaced — the ops entry for this package |
| `package_check.mjs` | replaced — I-2 allowlist |
| `qa-baseline-README.md` | replaced — the H-1 annotation and the git-tag correction |

⚠ `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` is **NEW** — nothing to delete first, but it does need a
row (it has one, above) or the next `package_check` **K-9** fails.

⚠ **The pool is ADD-ONLY (§L F-1).** All five files above must be deleted before the new copies are
uploaded. `README-FIRST.md` carries the same list; this row exists so the manifest carries it too.

⚠ **This package does NOT execute H-2.** The 24 completed-history files stay in the pool for now and
keep their existing rows. When H-2 is built, those rows are rewritten as repo-only in the same pass —
`package_check` K-9 is what makes that safe, and K-8 does not object to an unhashed row.

> **SUPERSEDED 2026-09-07 — and two of its three sentences were wrong.** H-2's pool deletions ran on
> 2026-09-05 and the rows were rewritten on **2026-09-07, a separate session**, not "in the same
> pass". The count was wrong too: **24 rows needed the rewrite, not 24 files were deleted.** Measured
> on 2026-09-07 — 30 manifest rows name history-class documents, **6 are still in the pool** (the
> five carve-outs plus `STOP-REPORT-v5_63-fica-workbench.md`) and **24 are not**. The last sentence
> is accurate and is exactly the problem: *"K-8 does not object to an unhashed row"* was written as
> reassurance, and it is the reason 22 of the 24 stale rows were undetectable. **A property relied on
> to make a change safe is also the property that hides the change going wrong.**

### At the v5.65 upload (2026-09-05) — DELETE THESE FIRST

| Delete | Because |
|---|---|
| `DangerClose-v5_63.jsx` | **rotated out at v5.65** — a rotation is TWO deletes. The pair is now **v5.64 prior / v5.65 current** |
| `dom_entry_v563.jsx` | its source rotated out with it; its fallback-table hash row goes in the same pass |

*(Superseded, retained: at the v5.63 upload the deletes were `DangerClose-v5_61.jsx` and `dom_entry_v561.jsx`.)*

⚠ **The pool is ADD-ONLY (§L F-1): a same-name upload creates a SECOND copy rather than replacing
the first.** Every file in this release's `knowledge/` must be deleted from the pool before it is
re-uploaded, not just the two rotations above. That is 26 files; `README-FIRST.md` carries the list.

⚠ **Three files in this release's `knowledge/` were already partly refreshed out of band** and are
the reason this warning is here: at the v5.63 build the pool held `METHODOLOGY.md`,
`t10_taxcases.mjs` and `t33_roth_stream_fica.mjs` at their v5.63 hashes while `CHANGELOG.md`,
`TESTING.md` and `runsuite.sh` were still pre-v5.63 and `controls_v563.sh` was absent entirely —
a mixed state no manifest row described. `t10`'s fallback row was stale by two hashes as a result.
**Refresh the pool in one batch from the zip, never piecemeal.**

### At the v5.62 upload (2026-09-03) — DELETED

| Delete | Because |
|---|---|
| `DangerClose-v5_60.jsx` | **rotated out at v5.62** — a rotation is TWO deletes. The pair is now **v5.61 prior / v5.62 current** |

### At the v5.61 upload (2026-09-03) — DELETED

| Delete | Because |
|---|---|
| `DangerClose-v5_59.jsx` | ✅ **rotated out at v5.61** — a rotation is TWO deletes. The pair is now **v5.60 prior / v5.61 current** |
| `dom_entry_v559.jsx` | ✅ its source rotated out with it. Its hash row was removed from the fallback table in the same pass |
| `controls_v559.sh` | ⚠ **listed in error and correctly NOT deleted.** §G's rotation covers app sources only; controls scripts are kept. Recorded so the mistake is not repeated | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder)

### At the v5.59 upload (2026-09-02) — DELETE THESE FIRST

| Delete | Because |
|---|---|
| `DangerClose-v5_58.jsx` | **rotated out at v5.60** — a rotation is TWO deletes. The pair is now **v5.59 prior / v5.60 current** |
| `dom_entry_v558.jsx` | its source rotated out with it |
| `DangerClose-v5_57.jsx` | rotated out at v5.59 |
| `dom_entry_v557.jsx` | its source rotated out with it |
| `COMMIT_MESSAGE.txt` | ✅ **DELETED from the pool 2026-09-02**, seven releases after it was first listed here (v5.52) and having carried the v5.49 message throughout. Found by the 2026-09-02 §A2 both-directions diff; absence re-confirmed by the same diff at the v5.60 build. It is a per-release packaging artifact and belongs in the zip's top level, **never in `knowledge/`** — do not re-upload it. Kept as the record of a delete-first that took seven releases to execute |
| every document the v5.60 zip's `knowledge/` replaces | same-name upload creates a second copy; the zip's `README-FIRST.md` names them |

### At the v5.42 upload — DELETE THESE FIRST

The pool is flat and add-only, so a stale file is byte-indistinguishable from a current one until
hashed. Delete before uploading, not after:

| Delete | Because |
|---|---|
| `DangerClose-v5_50.jsx` | **rotated out at v5.52** — a rotation is TWO deletes, the `.jsx` and its `dom_entry`. The pair is now **v5.52 current / v5.51 prior, exactly two** |
| `dom_entry_v550.jsx` | its source rotated out with it |
| `COMMIT_MESSAGE.txt` | the pool copy carried the **v5.49** message through two releases — found at the v5.52 confidence test. It is a per-release packaging artifact; the v5.52 zip replaces it |
| `DangerClose-v5_46.jsx` | rotated out at v5.48 (with `dom_entry_v546.jsx` — a rotation is TWO deletes, the `.jsx` and its `dom_entry` hash row) — the pair is now **v5.48 current / v5.47 prior, exactly two** |
| `dom_entry_v543.jsx` | its source rotated out with it |
| `controls.sh` | superseded by `controls_v542.sh`. Unrunnable since v5.40 (it hardcoded `SRC=v538.jsx`); keeping both invited someone running the dead one. **DONE 2026-08-21 — deleted from the pool and the repo, and its two rows above removed in the same edit.** The v5.40 decision to keep it stale deliberately is hereby superseded: that reasoning held while it was the ONLY control program, and stopped holding the moment a working successor existed |
| `controls_v542.sh` | superseded by `controls_source.sh`. **DELETE from BOTH destinations 2026-08-23** — pool AND repo. Keeping both invites running the dead one, which is exactly what `controls.sh` taught at v5.42 |
| `CHANGELOG.md`, `METHODOLOGY.md`, `TESTING.md`, `PROJECT_KNOWLEDGE_INDEX.md` | replaced by this upload |
| `t1_units.mjs`, `t3_roth.mjs`, `t4_dom.mjs`, `t5_storage.mjs`, `t6_single.mjs` | replaced by this upload |
| `t23_roth_ladder_rmd.mjs`, `domdiff_withdrawal.mjs`, `runsuite.sh` | replaced by this upload |

**Add** (new to the pool at v5.43): `DangerClose-v5_43.jsx` · `dom_entry_v543.jsx` · `t25_engineC_ss86.mjs` · `SCOPE_ENGINE_C_SS86.md` · `STATUS_v5_43_shipped.md`.

**Added at v5.42:** `DangerClose-v5_42.jsx` · `dom_entry_v542.jsx` ·
`t24_ss86_phasein.mjs` · `hand_86.mjs` (the §86 oracle — repo-only through v5.41, which is why the
v5.42 build brief had to carry its hash separately) · `controls_v542.sh`.



⚠ **This section, the rotation block below, and several table rows above had gone stale by five
releases** — they described the v5.24 refresh while the two tables at the top of this file were
correctly rolled to v5.29. Corrected at the v5.30 refresh. The cause is structural and is recorded
as a finding: OPERATIONS §I's "refresh project knowledge once with the final state, delete-first"
was executed on the top tables and not on the body. **Roll the whole file or none of it.**

**Retired 2026-08-20 (knowledge-hygiene refresh, no release):**

- ~~`README-FIRST.md`~~ — **retired outright, not replaced.** It is a per-delivery upload instruction
  sheet, and the pool copy was the **v5.36 edition** — four releases stale, describing a packaging
  layout that has since changed. The v5.37 retirement list below claims it was *"replaced in place by
  the v5.37 edition"*; it was not, so this is the **§G write-hazard again** (delete-then-upload where
  the delete didn't take), and two prior freshness checks logged the file as *"knowledge-only by
  design"* — true of the name, false of the contents. Retired rather than rolled because the durable
  record it once carried now lives in `docs/` in the repo: the release story is the CHANGELOG entry,
  the per-file story is that release's `STATUS_*.md`. It remains a **delivery-zip** artifact per
  OPERATIONS §L — that convention is unchanged; only the stale pool copy goes.
- **The pool's `README-FIRST.md` and the repo have never been comparable** — it is one of only two
  pool files with no committed counterpart (the other is the retained prior source, which is
  legitimate), so the clone-and-diff could never adjudicate it and reported it as expected noise
  three times running. Retiring it removes that permanent blind spot from the check.

**Retired at the v5.37 refresh:**

- ~~`DangerClose-v5_35.jsx`~~ — rotates out under the two-source rule (v5.36 becomes the prior;
  v5.35 remains recoverable from its shipping commit).
- ~~`DangerClose-v5_36-WIP.jsx`~~ — found still in the pool at this release's freshness check
  despite the v5.36 list below marking it retired; a third `.jsx` violates the rotation. Its hash
  (`c5d9253c…`) stays recorded in `STATUS_v5_36_shipped.md`.
- ~~`domdiff_withdrawal.mjs` (stale pool copy)~~ — the pool held the v533→v534 edition
  (`dc48d0c2…`) while the repo carried the correct v5.36 file (`184b826b…`); found by the
  clone-and-diff at this release's freshness check. The pool takes the v5.37 edition
  (`faaea61b…`).
- ~~`SCOPE_v5_37_ordinary_growth.md`~~ — fulfilled; it ships in `docs/`, outcomes in
  `STATUS_v5_37_shipped.md` and the CHANGELOG.
- ~~`README-FIRST.md`~~ (v5.36 edition) — replaced in place by the v5.37 edition.

**Retired at the v5.36 refresh:**

- ~~`DangerClose-v5_36-WIP.jsx`~~ — superseded by the shipped `DangerClose-v5_36.jsx` (`b7396c1c…`). The
  WIP hash `c5d9253c…` appears in the session-1/2 records; the intermediate hashes between it and the
  ship (`9a97926…` post-copy, `279db93a…` post-E-16-fix, `62a23aa9…`/`06237271…` mid-work) are recorded
  in `STATUS_v5_36_shipped.md`.
- ~~`STATUS_v5_36_partial.md`~~ — superseded by `STATUS_v5_36_shipped.md`.
- ~~`SCOPE_v5_36_drawdown_capital_gains.md`~~ — fulfilled; outcomes in STATUS + CHANGELOG.
- ~~`README-FIRST.md`~~ (the v5.35-WIP edition) — **replaced in place** by the v5.36 edition; it had
  outlived its release, which is the same §I body-vs-tables failure this list already records once.
- ~~`SESSION_BRIEF_v5_36_SESSION2.md`~~ — spent (was an upload, never pooled; listed so nobody re-adds it).

**Retired at the v5.31 refresh:**

- ~~`SCOPE_FIX_docs_disclosure_v5_27.md`~~ — **RETIRED (confirmed absent from the pool 2026-08-13).**
  Fulfilled at v5.27; it outlived its release by three because §I's retirement step was skipped. Its
  outcome is recorded in the v5.27 CHANGELOG entry.
- ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ — **RETIRED at v5.30**, fulfilled by that release: all
  three edits shipped, `t18` gained the three OBBBA cases, and E-3 was closed and named in the
  CHANGELOG.
- ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ — **RETIRED at v5.30.** A build brief is spent once its release
  ships; keeping it invites a future session to build v5.30 again.
- ~~`SCOPE_FIX_obbba_constants_v5_31.md`~~ — **RETIRE at v5.31**, fulfilled: `OBBBA_CONSTS` shipped
  with five Verify rows, the four literals are extinct and extinction-checked, both negative controls
  fired, and E-2 is closed and named in the CHANGELOG. Its Rev B corrections (the suite is `t1` not
  `t10`; the finding's stated cause and urgency framing do not hold) are carried into the E-2 closure
  note so they survive the retirement.
- ~~`SESSION_BRIEF_v5_31_BUILD.md`~~ — **RETIRE with the scope it paired with.**

**Active scopes after this refresh: NONE.** v5.39 shipped on 2026-08-18; `SCOPE_FIX_docs_v5_39.md` is
fulfilled and retires with it (outcomes in `STATUS_v5_39_shipped.md`). The next release needs a scope
written before it is built (project instructions, *Scope before build*). ⚠ This line was found reading
"v5.36 shipped on 2026-08-16" at the v5.39 refresh — **two releases stale**, the same
roll-the-whole-file failure as the build tables. It is a third place a version lives.

**The nearest candidate — identified, not scoped.** The small-screen mechanics release: **F-2** and
**F-8** (wrap the four fixed-pixel grids in the `overflowX:auto` idiom five other tables already use)
and **F-6** (`inputMode="decimal"` on money fields). All are render-code string edits with no engine
change, and v5.39's §13 disclosure means the app currently *documents* these flaws rather than fixing
them. F-8 became cheap when measurement showed it needs the same wrapper as F-2, not a layout rewrite.

**The open work is tracked as findings, not scopes:** `ARCHITECTUREIssues.md` (Section E — six post-audit entries E-15…E-20 were added at v5.36 and **E-16 was closed the same day, in-release**; among the open items **E-6**, **E-14/E-18** (the hash-table principle, now executed at session close and packaging) and **E-15** — the ordinary-growth omission, optimistic, its own release — lead) and
`MissingFeatures.md` (Section D — **D-2**, unrealized capital gains on ordinary drawdown, is the ranked
top item and the one that points the optimistic way). Section D still owes a systematic
undisclosed-gap sweep, which the Phase 3 rollup says Phase 4 should wait for.
**Section F ran anyway, deliberately and with that dependency disclosed** — `UsabilityFlaws.md`
(audited against v5.38) covers the usability ground and closed the `AUDIT_DOCS_HTML_v5_27.md` gap.
**Its documentation half shipped as v5.39**; F-11 (the callout broken by over-escaping, invisible to
`t4` because every docs assertion read text and only the markup was wrong) is fixed and now has an
extinction assertion. Its two-paragraph top-five summary is still **withheld**, because Section D's
sweep and Section C's 2D break-even half remain open. That summary is the work of the session that
closes those two. Still open from Section F: **F-2/F-8/F-6** (mechanical wrapper and input-mode
fixes) and **F-1/F-4**
(the small-screen and contrast questions, which are product-direction decisions for Steve, not fixes).

Releases (a), (b) and (c) of the `otherAccounts` plan
have ALL shipped — (a) v5.22, (b) v5.24 re-scoped as disclosure-only, and **(c) fold-and-classify
shipped at v5.26.** The previous text of this section claimed (c) "remains", which was true when
written and false from v5.26 onward.

✅ **E-10 CLOSED 2026-08-12.** `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` and
`SCOPE_ENGINE_D_MAGI_v5_24.md` had been retired as fulfilled while `qa/t19_engineD_exact.mjs` still
cited both — L61 as its governing scope, L96 as a **stop-instruction**. Steve restored both to
knowledge; `t19`'s references now resolve.

⚠ **THEY ARE FULFILLED SCOPES AND MUST NOT BE RETIRED AGAIN.** OPERATIONS §I says to retire fulfilled
`SCOPE_*.md` at each release, so the default behaviour of the release checklist is to delete these
and re-open E-10. They are **retained deliberately**, on the same footing as
`SCOPE_DEFECTS_v5_10_1.md` ("retained for reference, not retirement"). The durable alternative — and
the better long-term fix — is to re-point `t19`'s two comments at the v5.24 and v5.26 CHANGELOG
entries, which record the same outcomes and are never retired. Until that is done, retiring these two
files breaks `t19`'s guidance.

Every other absent
`SCOPE_*`, `FlawsToFix-*-INTERIM` and retired `DangerClose-v5_*.jsx` / `dom_entry_v5*.jsx` named
above is retired-by-design and recoverable from commit history.

**Retired at the v5.32 ship:** `SCOPE_ACA_FPL_FLOOR_v5_32.md` and
`STATUS_v5_32_ACA_FLOOR_PARTIAL.md`. The status partial was in the pool and had never been listed
here, which is worth naming because an unlisted pool file is invisible to the manifest-based
freshness check by construction — the same failure shape as E-14. Its substance is carried
forward: the §8 sub-floor measurement and its method into the v5.32 CHANGELOG and
`MissingFeatures.md` D-8, the parity finding into `ARCHITECTUREIssues.md` E-15.

