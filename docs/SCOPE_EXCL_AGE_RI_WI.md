# SCOPE — model the full-retirement-age floor for Rhode Island and Wisconsin (`exclAge: 67`)

| | |
|---|---|
| Status | **DECISIONS OPEN — not buildable until §7 is resolved.** |
| Written | 2026-09-02, against shipped **v5.59** · source `ed89d2f214302942e5bd6355d923c9cf` · tree `4784a4a` |
| Parent findings | `AUDIT_STATE_EXCL65_ROUND4.md` §2b, §2c, §6 **D-D** (the deferral this scope collects) · `MissingFeatures.md` **D-11 (a)** |
| Predecessor | `SCOPE_EXCL65_STALE_RI_WI.md` — shipped as v5.59; this is the half it deliberately held back |
| Target | **v5.60**, tag `v560` |
| Kind | **Modelling change.** METHODOLOGY update is mandatory. |

---

## 1 · Why this exists

v5.59 corrected two stale exclusion **amounts** and deliberately did **not** touch the **gate**:
ROUND4 §6 D-D held that a gate change landing alongside a figure change cannot be attributed if a
downstream figure moves. That reason is now spent — the figures shipped, and `t10` §2E pins them with
boolean identities and hand cases. A gate-only release has clean attribution.

The remaining error is the only **optimistic** one left in the two states, and v5.59 made it larger:
both statutes gate at full retirement age (67), the model applies both exclusions from 65, and the
amounts it applies grew from $20,000/$5,000 to $50,000/$24,000. For a deliberately pessimistic tool an
optimistic error is the wrong kind of wrong, and this one is now worth up to **$4,000/yr** (RI) and
**$2,544/yr** (WI) of understated state tax on a household two years short of the gate.

---

## 2 · Premise — verified against v5.59 source on 2026-09-02, not assumed

Every statement here was produced by AST walk, read of the source, or engine execution this session.
**Re-verify at §A2 anyway: this is evidence about the tree it was written against, not about yours.**

**2.1 The field already exists and already does exactly this.** `STATE_RULES` is declared at L1028.
`exclAge` is referenced in exactly **one place in the whole source**, L1132 inside `stateTaxAnnual`:

```
const _floor = (r.exclAge === undefined || r.exclAge === null) ? 65 : r.exclAge;
```

`_floor` is then compared per person (`if (age === null || age < _floor) return 0;`). So the change is
**one property per state and no engine code**. Note the guard tests `undefined`/`null` explicitly, not
falsiness — Kentucky's `exclAge: 0` resolves to a floor of **0**, i.e. no age gate at all, which is
intended and must not be "fixed".

**2.2 Current state of the four relevant entries.**

| | L | `excl65` | `exclAge` | `ss` |
|---|---|---|---|---|
| DE | 1036 | 12,500 | **60** | 0 |
| KY | 1046 | 31,110 | **0** | 0 |
| NM | 1060 | 8,000 | *(absent → 65)* | 0.5 |
| RI | 1068 | 50,000 | *(absent → 65)* | 0.5 |
| WI | 1078 | 24,000 | *(absent → 65)* | 0 |

**2.3 The statutory floor is 67 in both states**, carried from ROUND4 §2b/§2c and not re-derived here:
RI's modification requires full retirement age (67 for anyone born 1960 or later); WI's
§ 71.05(6)(b)54m. reads "67 or over". **This scope does not re-read either statute** — see §4.

**2.4 The correction is measured, not estimated.** A scratch copy with `exclAge: 67` on both states was
built and executed against the v5.59 engine. All six figures match hand arithmetic to the cent:

| state | ages | v5.59 | with `exclAge: 67` | delta | hand check |
|---|---|---|---|---|---|
| RI | 66/66 | 1,020.00 | **5,020.00** | +4,000.00 | 0.05 × 80,000 |
| RI | 68/66 | 1,020.00 | **2,520.00** | +1,500.00 | 0.05 × 30,000 (per-person floor) |
| RI | 68/68 | 1,020.00 | 1,020.00 | 0.00 | unchanged |
| WI | 66/66 | 636.00 | **3,180.00** | +2,544.00 | 0.053 × 48,000 |
| WI | 68/66 | 636.00 | **1,908.00** | +1,272.00 | 0.053 × 24,000 |
| WI | 68/68 | 636.00 | 636.00 | 0.00 | unchanged |

Cases: retirement income $80,000 (RI) / $60,000 (WI), federally-taxable SS $40,800, gross SS $24,000
each, no pension or wages. **Direction: CONSERVATIVE in every cell** — tax rises or stays flat, never
falls. The mixed-age rows confirm the floor is applied per person, not per household.

**2.5 The v5.59 hand cases are at 68/68 and therefore survive unchanged.** Confirmed by row 3 and row
6 above. Running the whole suite against the scratch build produced **exactly two failures**, both in
`t10` §2E and both correct:

```
✗ 2E age control: exactly two states carry an exclAge: got 4  exp 2
✗ 2E age control: and they are KY and DE: got 0  exp 1
```

Nothing else moved. F-6 stayed at 4 (NJ, NM, RI, VA).

**2.6 ⚠ The v5.55 extinction invariant would NOT have caught this defect, and still would not.**
`t10` L658 asserts that no state's note names a non-65 age while its code still uses 65 — the class
this whole family of releases exists to close. Its matcher is
`/\bfrom age (5\d|6[0-4])\b|\b(5\d|6[0-4])\+/`. **The range stops at 64.** RI's and WI's notes name
**67**, so they were invisible to it — not because of the deliberate "disclosed / not modelled"
escape clause (neither note contains those words), but because 67 is outside the pattern. Widening
that range is part of this build, not a nicety: without it the invariant remains blind to exactly the
shape of defect it was written for.

**2.7 ⚠ Both v5.59 notes assert the thing this release makes false.** Read verbatim from source:

- RI: *"…applies the $50,000 **from 65** to all retirement income, ignoring the cliff — mixed
  direction: conservative under the cliff past 67, **optimistic otherwise**"*
- WI: *"…the model applies it **from 65** — **optimistic in the 65-66 window**, matches the statute
  from 67"*

Both clauses become false on the day this ships. Rewriting them is source work, not documentation
work, and it is what `t31` and `t10`'s note assertions actually read.

**2.8 ⚠ And one `t10` assertion's NAME goes false while its regex keeps passing.** L829:

```
T("[DISCLOSED v5.59] RI's note names the full-retirement-age floor the model does not apply",
  /full retirement age/i.test(R.RI.note) && /\b67\b/.test(R.RI.note) ? 1 : 0, 1);
```

After this release the model *does* apply that floor. The regex only asks whether the note mentions
it, so the check goes on passing while its title states the opposite of the truth. **A silently-true
assertion with a false name is worse than a failing one** — it is a comment that reads as verified.
Its WI twin at L832 has the same problem. Both must be rewritten, not merely re-gated.

---

## 3 · Site census — what the build touches

Produced by AST walk over source and all 32 suites, plus `vercensus.cjs v559`. **Re-run every count;
do not quote these.**

### 3.1 Source — `src/DangerClose.jsx`

| Site | What |
|---|---|
| L1068 (RI), L1078 (WI) | add `exclAge: 67` — **the entire modelling change** |
| L1068, L1078 notes | rewrite the "from 65" / "optimistic" clauses (§2.7). RI's note must still name the cliff, the IRA exclusion and what it does with SS; WI's must still not contain `income limit` in any form |
| four version sites | footer, DATA LOAD header, Field Manual callsign, Field Manual footer. **DOCS_HTML is ONE LINE** — quote-free anchors, never a global substitution |

No engine code. No other state. `_floor` at L1132 is read, not edited.

### 3.2 Suite — the assertions that must change

| Site | Why |
|---|---|
| `t10` L642 "exactly two states carry an exclAge" | becomes **4** on the current leg; must stay 2 on the frozen leg |
| `t10` L644 "and they are KY and DE" | becomes **DE,KY,RI,WI** current / `DE,KY` frozen |
| `t10` L829, L832 (the v5.59 DISCLOSED pins) | names go false (§2.8) — rewrite both |
| `t10` L658 the v5.55 note-vs-code invariant | widen the age range past 64 (§2.6) |
| `t10` §2E new v5.60 block | the hand cases in §2.4, both legs |
| `t31` | the two v5.59 keys carry **figures**, which do not move — they survive untouched. A **new** key is needed only if §7 D-3 says the age is user-visible copy |

### 3.3 Version-bump cost — measured `vercensus.cjs v559`, 2026-09-02

**15 files · 18 ladder entries · 63 gated expressions · 81 judgement points.** One more ladder than
v5.59's 17 because `t31` grew a fourth registry entry at the last ship. Known traps, all still live:

- `t31` `ORDER` ends in `v559`; `v560` **appends** there. `post()` uses `ORDER.indexOf(VER)` — an
  unrolled tag scores −1 and every key silently takes its pre-fix branch.
- Five registries end in the retired `v592`: insert **positionally**, never append.
- `t1` `verStr` and `t4` `_badge` are ternary maps needing a **new arm**, not an extended chain.
- `domdiff_withdrawal.mjs` needed no edit at v5.59 (its ladder covers new tags numerically) —
  **confirm, do not assume.**

### 3.4 Documents

`CHANGELOG.md` · `METHODOLOGY.md` (mandatory — modelling) · `TESTING.md` (counts, controls row) ·
`MissingFeatures.md` (**D-11 (a) closes for RI and WI**; NM's remains open) · this scope's §8 ·
`PROJECT_KNOWLEDGE_INDEX.md` (rotation: v5.58 leaves, v5.59 becomes prior) · `qa/controls_v560.sh` ·
`qa/qa-baseline/dom_entry_v560.jsx`.

---

## 4 · Explicitly OUT of scope

- **Re-reading either statute.** ROUND4 §2b/§2c is the source for the 67 floor. If a session doubts
  it, that is a finding to report, not a re-derivation to fold in.
- **New Mexico.** Still its own pass (ROUND4 §6 D-C). NM keeps the implicit 65 default here.
- **RI's AGI cliff and its IRA-vs-employer-plan distinction.** Both need a data-model field the
  engines do not carry; D-11 (c) scopes them once, across states, not per state.
- **The eight-state `ss: 0.5` blend.**
- **RI's TY2027 removal of the age threshold from its SS modification** (HB 7127 Sub A) — recorded in
  ROUND4, still not modelled, and it applies to the SS modification, not to this exclusion.
- **Any figure change.** If a session finds an amount it believes is wrong, that is ROUND5's, not this
  release's — a figure moving here would destroy the attribution this release was deferred to protect.
- **Retiring pool documents**, except the ops items in §6, which ride along because their files are
  already being touched.

---

## 5 · Tests that ship with it

**(a) `t10` §2E v5.60 block, both legs.** Hand-compute every expectation *before* running the engine;
the six cells in §2.4 are the arithmetic, not the answer key — recompute them. Ship at minimum:

1. `R.RI.exclAge === 67` and `R.WI.exclAge === 67` as boolean identities.
2. The **66/66 denial** case for each state — the cell that proves the gate bites.
3. The **mixed-age 68/66** case for each state — the cell that proves the floor is per person, which
   a household-level implementation would pass rows 1 and 3 and fail here.
4. The 68/68 cases **unchanged** from v5.59 — proof the correction is confined to the window.
5. Pre-fix pins on the frozen v5.59 leg asserting the old, optimistic values (1,020.00 / 636.00 at
   66/66) with `[KNOWN DEFECT pre-v5.60]` names.

**(b) Rewrite `t10` L829/L832 rather than re-gating them** (§2.8). The replacement should assert what
is now true — the note names the floor **and** the model applies it — so the name and the check agree.

**(c) Widen the L658 invariant's age range past 64** (§2.6) and prove the widening is not vacuous:
temporarily revert one `exclAge` and confirm the invariant *now* fires where it previously would not.

**(d) Roll the two whole-table membership assertions** (L642, L644) on the current leg only.

**(e) `controls_v560.sh`, §B2 shape, every failure read before it is believed.** At minimum: revert
RI's `exclAge` alone → something fails; revert WI's alone → something fails; revert each note's
rewritten clause alone → something fails; leave one version site stale → `t1` fails; and a
**comment-only null control that must fire nothing**. ⚠ Anchor on the **state entry**, not on a bare
`excl65:`/`exclAge:` string — v5.59's first C4 anchored on `excl65: 24000` and patched **Colorado**,
reporting one confident failure that had nothing to do with Wisconsin.

**(f) MC parity is expected to hold 10/10 and is BLIND.** No parity or suite fixture is domiciled in
RI or WI (AST walk, re-run 2026-09-02 — zero references). **Confirm that before trusting a green
parity.** If a fixture has since moved to either state, parity breaking is correct behaviour.

---

## 6 · Ops items riding along

These are documentation-only, have no suite exposure, and touch files this release already edits.
They are listed here so they are not forgotten again, not because they belong to this defect.

1. **`SCOPE_VA_NOTE_CORRECTION.md` still reads "DECISIONS RESOLVED — cleared to build as v5.58"** (its
   L9) though v5.58 shipped, and it sits on `package_check`'s in-code OPEN allowlist. This is exactly
   the live-looking-status failure §I exists to catch. Retire it (status → SHIPPED at v5.58, outcome
   written back) and drop it from the allowlist **in the same edit** — `package_check` I-2 flags
   allowlist entries whose scope no longer exists.
2. **`PROJECT_KNOWLEDGE_INDEX.md` L819 says `COMMIT_MESSAGE.txt` is "still in the pool"** — true when
   written on 2026-09-02, false hours later when it was deleted. Correct the tense; keep the row as
   the record of a delete-first that took seven releases to execute.
3. **Nothing compares the two build tables in the manifest.** The Prior-build table read v5.51 for
   seven ships before the v5.59 pass caught it by eye. A one-line `package_check` assertion — prior
   table's version = current table's version minus one release — would close it. **Optional; §7 D-4.**

---

## 7 · Open decisions — resolve before building

**D-1 · Does WI's floor apply per person or per return?** ROUND4 §2c reads
§ 71.05(6)(b)54m. as $24,000 each where both have reached 67, which the per-person `_floor`
implements. RI's per-person reading rests on the Division of Taxation's guide (v5.59's §8 recorded
that the couple cap is not asserted dollar-exact). **Recommendation: ship per person for both** — it
is what the field does, it matches ROUND4, and the mixed-age cell is tested. If a session cannot
confirm WI's per-person reading from ROUND4 alone, STOP and report rather than switching to a
household rule mid-build.

**D-2 · Does DE's `exclAge: 60` deserve the same re-read?** Out of scope as written, and it is not
stale so far as anything here shows. **Recommendation: leave it.** Note it for ROUND5 if a session
sees evidence otherwise.

**D-3 · Is the age floor user-visible copy, needing a `t31` key?** The v5.59 keys pin the **figures**,
which do not move, so they carry through untouched. The floor will be stated in both notes (source)
and in METHODOLOGY (creator-side) regardless. **Recommendation: no new `t31` key.** A key must be
probed for vacuity against the prior build before it is written, and any phrase containing "67"
already appears on the v5.59 surfaces — it would pass before the fix exists, which is the vacuous-key
trap `t31` records at v5.51/52/54/58/59. If Steve wants the floor covered creator-side, the honest
instrument is a `t10` note assertion, not a parity key.

**D-4 · Take the build-table check in §6.3, or leave it?** **Recommendation: leave it out of this
release** and open it as a separate ops item. It is a `package_check` change, which means the tool
that verifies releases changes in the same zip it verifies — v5.42's lesson. Steve's call.

**D-5 · Does WI's note need to keep saying anything about the 65–66 window at all?** Once the gate is
modelled the window is no longer a limitation. **Recommendation: state the floor positively** ("from
age 67, as the statute requires") and delete the optimism disclosure, because a limitation that no
longer exists is noise that will read as stale to the next reader. RI's note keeps its *other*
disclosures (cliff, IRA, SS) untouched.

---

## 8 · Build record — fill on the way through, not afterwards

| | |
|---|---|
| Build date | |
| Source md5 (v5.60) | |
| Built `index.html` md5 | |
| Repo tree built against | |
| Premise re-verified at §A2 (Y/N; any drift from §2) | |
| vercensus (files / ladders / gated) | |
| Suite total, per-suite in CHANGELOG | |
| Parity (and confirmation it is still blind) | |
| The six §2.4 cells, recomputed | |
| L658 widening proved non-vacuous (how) | |
| Controls run, each failure read | |
| Decisions as built (D-1 … D-5) | |
| Ops items 6.1 / 6.2 done | |
| `package_check` H/J post-upload | |

---

## 9 · What would make this scope wrong

If mid-build evidence contradicts §2 — `exclAge` is read somewhere other than L1132, the scratch
measurements do not reproduce, a fixture turns out to be domiciled in RI or WI, or either statute's
floor is not 67 — **STOP and report.** Do not adapt the build silently. The premise is evidence about
a tree, and trees move.
