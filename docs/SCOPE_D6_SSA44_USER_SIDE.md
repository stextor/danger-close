# SCOPE — D-6: the SSA-44 clause the user never sees

| Field | Value |
|---|---|
| Premise verified against | **v5.48** · source `30ab12fba362b8ce538f66adea9a104b` · tree `ba6d598` |
| Written | 2026-08-25 |
| Origin | `MissingFeatures.md` D-6, re-pinned to v5.48 on 2026-08-25 |
| Shape | **Disclosure only.** No engine change. No figure moves. |
| Status | **Awaiting decisions in §6 — do not build yet** |

---

## 1. Premise, verified — not assumed

D-6 has been recorded as *"partially disclosed — survivor trigger yes, work stoppage no"* since
2026-08-18. **Half of that is now wrong and half is still right, and the halves are not the ones the
record implies.**

**Verified at v5.48 by content:**

- `METHODOLOGY.md` **L840–845** is fixed, and fixed more broadly than D-6 asked for. It names the
  form and the trigger: *"Social Security's life-changing-event redetermination (form SSA-44) … is
  not modeled. The enumerated events include **work stoppage or reduction, the trigger that applies
  to most newly retired households**, as well as death of a spouse, marriage, divorce and loss of a
  pension. A household that files one may pay less than the model projects, so the omission is
  conservative."*
- **Nothing reached the user.** `SSA-44`, `SSA 44`, `life-changing`, `life changing`,
  `work stoppage`, `appeal`, `redetermination` and `reassess` return **zero hits in the render tree
  and zero in the raw `DOCS_HTML`** (146,679 chars, read raw — a stripped copy produced false zeros
  once already this week and the errata in `MissingFeatures.md` records it).

**So: creator-side CLOSED, user-side OPEN.** D-6's own entry sets its exposure as **user-side** and
its severity as *"low as modelling; medium as disclosure."* On its own test, nothing has moved.

**Boundary test — passes.** The two-year lookback prices a newly-retired household's first Medicare
years off working income. That is not a tail case; it is the modal arrival state for this app's
audience. The clause makes an **existing output more correctly understood** and adds no new output.
Direction is unchanged and conservative: the model charges a surcharge the household may appeal
away, so it errs high, and this release keeps it that way.

## 2. Why the suite could not have caught this

**No test in this project reads `METHODOLOGY.md` as a file.** Every occurrence of the string across
`t1`–`t30` is a code comment. There is therefore no mechanism by which a limitation documented
creator-side and absent user-side can fail a check — the two surfaces are asserted independently or
not at all.

That is the same defect class the manifest logged on 2026-08-23 (*a fixture that cannot reach a
behaviour makes every assertion about it vacuous*), applied to documentation surfaces. It is also
exactly how S-1 and S-3 sat closed-but-unrecorded for nine releases. **The extinction invariant in
§4 is the point of this release**, at least as much as the clause itself.

## 3. Site census — every surface this touches

| # | Surface | Anchor (v5.48) | Action |
|---|---|---|---|
| 1 | **Field Manual — IRMAA Cliff strategy entry**, inside `DOCS_HTML` (L3593) | quote-free anchor `push you over a cliff and cost ~$1,000+/yr per person.</p>` — unique, idx 69794. ⚠ **CORRECTED 2026-08-25, see §7** | **APPEND** the clause after that `</p>` |
| 2 | **IRMAA tab disclosure note** | **L9973**, the paragraph beginning *"IRMAA tiers and surcharges are approximate…"* and ending *"Not tax advice."* | **INSERT** before the closing sentence |
| 3 | `METHODOLOGY.md` §8 | L840–845 | **NO CHANGE** — already correct |
| 4 | Version sites ×4 | footer · DATA LOAD header · Field Manual callsign · Field Manual footer | **BUMP** to v5.49 (`t1` STATIC asserts all four) |
| 5 | `CHANGELOG.md` | newest-first | **NEW ENTRY** + provenance line |

**`DOCS_HTML` handling.** It is one line of **146,679 bytes / 145,542 code points** (1,137 multi-byte
UTF-8 characters — em dashes, curly quotes). ⚠ **State the unit.** `awk`/`wc -c` count bytes, Python
`len()` counts code points; a session comparing one against the other will read drift that is not
there. Edit with **quote-free anchors**, exclude it from any grep or transform, and locate it **by
length, not by index** — comparing lengths *within* one measurement, never across two. `METHODOLOGY.md` is untouched
by convention — it updates on modelling releases, and this changes no model.

## 4. Tests this ships with

**New file `t31_disclosure_parity.mjs`** — the extinction invariant, and the reason to do this now:

1. **Cross-surface parity.** Read `METHODOLOGY.md` from disk. For a declared set of user-relevant
   limitation keys — starting with `SSA-44` and `work stoppage` — assert that if `METHODOLOGY.md`
   names it, the **render tree or the RAW Field Manual string names it too.** This is the first test
   in the project to read `METHODOLOGY.md`, and it closes the class, not just the instance.
   ⚠ **Corrected 2026-08-25:** this clause read *"the decoded Field Manual"* and contradicted point 4
   below, which requires the raw string. **Raw wins** — decoding is what produced the false zeros in
   the errata, and it is what broke this scope's own site-1 anchor. There is now one instruction.
2. **Negative control.** A key present in `METHODOLOGY.md` and deliberately absent user-side must
   make the check **fail** when the parity assertion is inverted — otherwise the test passes
   vacuously and we have shipped another green-either-way assertion.
3. **Both surfaces, separately asserted.** The Field Manual clause and the IRMAA-tab clause each get
   their own check, so removing one does not hide behind the other.
4. **Raw-string discipline.** The manual is read from the raw `DOCS_HTML` literal, located by
   length. A stripped copy is what produced false zeros during the v5.48 verification.

**Existing suites:** `t1` STATIC picks up the four version strings automatically. `t4`/`t9` DOM legs
re-run against the new `dom_entry_v549.jsx`. Parity must stay **10/10** and the cross-version DOM
diff must take its **STRICT** branch — no rendered figure may move, which is the guardrail proving
this is disclosure-only.

## 5. Explicitly out of scope

- **Modelling the appeal.** The model keeps charging the full surcharge. Conservative direction is
  deliberate and is what the clause tells the user.
- **Any other SSA-44 trigger as a feature.** Naming the enumerated events in prose is the whole job.
- **D-7 and D-3c.** Same audit pass, different releases, different risk.
- **The IRMAA engine, tiers, lookback or indexation.** All verified and untouched.
- **Widening the parity test's key set** beyond the two keys above. The mechanism ships with a
  minimal, honest set; growing it is a later pass, and a list that grows carelessly is how a green
  check stops meaning anything.

## 6. Open decisions — build only after these are resolved

**D1 · The Field Manual wording.** Draft, for approval — user-facing copy in your voice, reporting
what the model does rather than advising:

> *Newly retired? The two-year lookback means your first Medicare years are priced off your working
> income. Form **SSA-44** lets you ask SSA to use current-year income instead — **work stoppage or
> reduction** is one of the enumerated life-changing events, along with the death of a spouse,
> marriage, divorce and loss of a pension. **This model does not assume any appeal succeeds**: it
> charges the full surcharge, so a household that files one may pay less than shown.*

**D2 · The IRMAA tab wording.** Shorter, inserted before *"Not tax advice."*:

> *If you have just retired, this tab prices your first Medicare years off working income — SSA-44
> lets you ask SSA to reassess on current income. The model charges the full surcharge regardless,
> so these years err high.*

**D3 · Does the parity test ship in this release or its own?** It is the more valuable half and it
is also the larger half. Shipping together means one release closes the instance and the class;
shipping separately means the clause lands in a day and the mechanism gets its own scope.
**Recommendation: together.** A disclosure fix with no test to hold it is how D-6 got here.

**D4 · Version.** v5.49, disclosure-only. Confirm.

---

## 7. Corrections made before build — 2026-08-25

Three errors in this scope, found by resolving its own anchors against v5.48 before editing
anything. Recorded here because the *class* matters more than the instances.

**7.1 · The site-1 anchor did not exist.** §3 gave the quote-free anchor `IRMAA Cliff strategy`.
That string is not in the source. The heading is:

```html
<h3>IRMAA Cliff <span class="tag" style="background:rgba(255,170,0,.15);color:#ffaa00">strategy</span></h3>
```

`IRMAA Cliff` and `strategy` are separated by ~80 characters of markup for the amber badge. The
entry *renders* as "IRMAA Cliff strategy", so the anchor was taken from the rendered manual rather
than the raw string.

**This is the FOURTH instance of the class the `MissingFeatures.md` errata records —
⚠ corrected 2026-08-25: this read "third" and "records twice", and both were wrong. Errata
entry 2 already describes itself as the third. The miscount came from counting errata entries
instead of reading them, which is the same class again, applied to the tally of the class —
a derived artifact mistaken for the primary source — and it occurred inside the scope written to
close the second.** Reading the rendered surface is the natural thing to do and it is wrong every
time; the raw string is the only thing an edit or a test can address.

⚠ **The near-miss is worse than the miss.** `cliff strategy` (lowercase) *does* match — at idx
71936, inside the **ACA Premium Subsidy** entry's law-scenario paragraph. An anchor that lands in
the wrong entry silently is how a disclosure ends up appended to unrelated copy.

**7.2 · "146,679 chars" is a byte count — and there are THREE measures, not two.**
Corrected in §3. One line, three numbers, all of them truthfully "its length":

| Measure | v5.48 | v5.49 |
|---|---|---|
| code points (Python `len`) | 145,542 | 146,374 |
| UTF-16 units (JS `.length`) | 145,545 | 146,377 |
| bytes (utf-8, `wc -c`, `awk length`) | 146,679 | 147,515 |

The third was found on 2026-08-25 when the same string measured 146,374 in Python and 146,377 in
node. Neither was wrong: **JS `.length` counts UTF-16 units**, and the manual holds three non-BMP
emoji (🔑 🖥 🧭), each costing two units. **Always say which measure you recorded.**

**7.3 · §4 contradicted itself on decoded vs raw.** Point 1 said "decoded", point 4 said "raw".
Resolved to raw. A scope carrying two answers is the same failure this project logged when
`OPERATIONS.md` §A2 and the manifest disagreed for eleven releases.

**Consequence for `t31`:** the parity test matches literal strings in the **raw** `DOCS_HTML`, so
it will go red on copy that is visually correct but raw-different — markup inside a key phrase,
exactly what the heading above does. That strictness is the point, and `t31`'s header says so, so
that a future session does not "fix" it by decoding.
