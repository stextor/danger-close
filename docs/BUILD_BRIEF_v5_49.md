# BUILD BRIEF — v5.49 · the SSA-44 clause the user never sees

| Field | Value |
|---|---|
| Build FROM | **v5.48** · `30ab12fba362b8ce538f66adea9a104b` · built `index.html` `8895b249af1313920c0c762a7a22776c` · tree `b0bb72b` |
| Target | **v5.49** |
| Governing scope | `SCOPE_D6_SSA44_USER_SIDE.md` — **all four decisions RESOLVED, see §2** |
| Shape | **Disclosure only.** No engine change. **No figure may move.** |
| Written | 2026-08-25 |

---

## 0. Start here

**OPERATIONS §A/§A2 freshness check first**, as always. At the time of writing the pool holds **93
files** and the two sources are `DangerClose-v5_47.jsx` / `DangerClose-v5_48.jsx`. The v5.49 rotation
drops v5.47 and adds v5.49.

**Everything is decided.** This brief exists so the build session spends its budget building rather
than re-deciding. Nothing below is a suggestion; §2 is approved copy.

## 1. Premise, verified at v5.48 — do not re-litigate, do re-confirm

- `METHODOLOGY.md` **L840–845** names SSA-44 and *"work stoppage or reduction, the trigger that
  applies to most newly retired households."* Creator-side: **closed**.
- `SSA-44`, `SSA 44`, `life-changing`, `life changing`, `work stoppage`, `appeal`, `redetermination`
  and `reassess` return **zero hits in the render tree and zero in the raw `DOCS_HTML`**. User-side:
  **open**. That is what this release closes.
- ⚠ **Read `DOCS_HTML` from the RAW string, located by LENGTH not index.** A stripped/decoded copy
  produced false zeros during the v5.48 verification — owned in `MissingFeatures.md`'s errata.

## 2. Approved copy — verbatim, Steve-approved 2026-08-25

**Primary source checked** (`ssa.gov/forms/ssa-44.pdf`; 20 CFR 418.1205): there are **eight**
life-changing events and **the list is closed** — marriage, divorce/annulment, death of spouse, work
stoppage, work reduction, loss of income-producing property, loss of pension income, employer
settlement payment. **A Roth conversion, a capital gain, or a home sale is not among them.** That
fact is the reason the copy reads as it does: this tab is driven by the Roth slider, so a user is
most likely looking at a surcharge that *cannot* be appealed away.

**EDIT 1 — Field Manual**, appended to the IRMAA Cliff strategy entry, after the existing sentence
ending *…push you over a cliff and cost ~$1,000+/yr per person.*

> Newly retired? The two-year lookback prices your first Medicare years off your working income. Form
> **SSA-44** lets you ask Social Security to use current-year income instead. Work stoppage or
> reduction is one of **eight** life-changing events, and the list is closed — the others are
> marriage, divorce, death of a spouse, loss of a pension, loss of income-producing property, and an
> employer settlement. **A Roth conversion, a capital gain, or a home sale is not on that list**, so a
> surcharge this tab shows from a conversion can't be appealed away — though a one-off spike does
> drop out on its own once that year ages out of the lookback. This model never assumes an appeal
> succeeds: it charges every surcharge in full, so these years err high for a household that files one.

**EDIT 2 — IRMAA tab note**, inserted at v5.48 **L9973**, immediately before the closing
*"Not tax advice."*

> If you've just retired, these first years are priced off your working income, and Form SSA-44 lets
> you ask SSA to reassess on current income — work stoppage is one of eight qualifying events, and a
> Roth conversion is not one of them. The model charges every surcharge in full, so these years err
> high.

**EDIT 3 — `METHODOLOGY.md` L840–845.** Not in the original scope; added because checking the primary
source showed the existing passage is **accurate but incomplete**. It says the events *"include"* six
of eight and never says the list is closed — which is the fact that matters most for this app. Add
the closed-list statement and the two missing events. **This is a documentation completeness fix, not
a modelling change**, so it does not trigger the "METHODOLOGY updates on modelling releases" rule; it
rides along because the same release is already making the same correction user-side.

**EDIT 4 — version sites ×4:** footer · DATA LOAD header · Field Manual callsign · Field Manual
footer. `t1` STATIC asserts all four, so a missed site fails loudly.

## 3. ⚠ Two traps that will bite this specific build

**§C0 — an anchored edit inside `DOCS_HTML` is only half the job.** A quote-free anchor is necessary
and **not sufficient**: the replacement is correct about the span it replaces and *silent about the
text that follows*, invisible on a 146,679-character line. v5.26 shipped a sentence whose second half
contradicted its own first half this way.

- Use **quote-free anchors**.
- **Print the full surrounding sentence back and read it** after the edit — a `node -e` slice of
  ±400 chars around the edit point.
- **Re-measure** length after: `node -e 'console.log(L.length, Buffer.byteLength(L,"utf8"))'`.
  Characters and bytes differ by ~1,100 here because of en/em-dashes. **Say which one you recorded.**

**§B2 — a disclosure assertion becomes a LOCK, and an ungated inversion breaks the prior leg.**
`run_all.sh` runs **prior · current · parity**. v5.48 legitimately does **not** contain this clause.
An assertion that the clause is present, applied to every leg, makes the v5.48 leg fail and the
release notes state a total the suite will not produce — the exact defect the v5.27 fix caused at
v5.28. **Every new disclosure assertion must be gated to the builds it is true for.**

## 4. `t31_disclosure_parity.mjs` — the extinction invariant, and the real payload

This is the **first test in this project to read `METHODOLOGY.md` as a file.** Verified at v5.48:
every occurrence of the string across `t1`–`t30` is a code comment. There is therefore no mechanism
by which a limitation documented creator-side and absent user-side can fail a check — which is
precisely how D-6 reached v5.48 with `METHODOLOGY` correct and both user surfaces silent.

1. **Cross-surface parity.** Read `METHODOLOGY.md` from disk. For a declared key set — **starting at
   `SSA-44` and `work stoppage`, and no wider** — assert that if `METHODOLOGY.md` names it, the render
   tree or the raw `DOCS_HTML` names it too.
2. **Negative control, and it must actually fire.** Invert the parity assertion and confirm it fails.
   **If it does not fire, that is the finding — stop and investigate; do not adjust the control until
   it passes** (§B2).
3. **Both surfaces asserted separately**, so removing one clause cannot hide behind the other.
4. **Version-gated per §3.**
5. Read `DOCS_HTML` **raw, located by length**.

## 5. Ship gates

- Full suite green from the **committed tree**, all three legs. Record the per-suite breakdown; the
  CHANGELOG total is **computed from suite output, never restated from memory**.
- **Parity 10/10** and the cross-version DOM diff must take its **STRICT** branch. No rendered figure
  may move — that is the proof this release is disclosure-only, and it is the guardrail that would
  catch an accidental edit outside the two clauses.
- Both control harnesses: `controls_source.sh` and `package_check_controls.sh`.
- `smoke_built.mjs` against the built artifact **after the build and before the zip is cut** (§L).
- Package per **§L**, `KIND: app-release`, then `package_check.mjs` with a clone and workspace.

## 6. Explicitly NOT in this release

- **Modelling the appeal.** The model keeps charging the full surcharge; conservative direction is
  deliberate and the copy says so.
- **D-7, D-3c, and the state fixtures.** `SCOPE_STATE_FIXTURES.md` is decided and queued as **v5.50**
  (New York fixture; estate fixture held for the D-7 release; D-3c archetype extends `t10`).
- **Widening `t31`'s key set** beyond the two keys. A list that grows carelessly is how a green check
  stops meaning anything.

## 7. Still owed to Section D, unrelated to this release

- **Decision 4 — measure NJ.** Structure verified (statutory **$100,000 MFJ** cap, hard cliff above
  $150,000 — NJ Division of Taxation njit7); model measured at **$0** for a 65+ couple at $80K/$120K/
  $150K. **The dollar delta is NOT measured** and needs the sourced NJ 2026 schedule.
- **Decision 3 — the D-7 disclosure scope.** Premise verified and recorded in `MissingFeatures.md`.
