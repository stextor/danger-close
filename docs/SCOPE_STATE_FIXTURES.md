# SCOPE — state-aware fixtures: the prerequisite for D-3c and D-7

| Field | Value |
|---|---|
| Premise verified against | **v5.48** · source `30ab12fba362b8ce538f66adea9a104b` · tree `ba6d598` |
| Written | 2026-08-25 |
| Origin | coverage finding in the `MissingFeatures.md` v5.48 re-pin |
| Shape | **Test infrastructure only.** No source change. No figure moves. |
| Status | ☑ **RETIRED: FULFILLED AT v5.54 (2026-08-29).** Verified against **v5.57** `0daebb4af466b9095db79117daefcd32`, tree `57575c6`, on 2026-09-01. `CHANGELOG.md` L691 records *Builds `docs/SCOPE_STATE_FIXTURES.md`, decisions D1–D4*. **This status line read "do not build yet" for three releases after the build.** |
| What was verified | §3A — all three census rows live in `boundaries.mjs` (`state_tax` narrowed L100, `state_code` L103, `state_excl_limited` L122). §3B — `stateProgressive` (New York, per **D1**) and `stateExclCliff` built in `households.mjs`. `t29` §F-6/F-7/F-8 pin the new rows as §3A required. **D2** followed: no `stateEstate` fixture. **D3** followed: `t10` §2E carries the D-3c dollar-exact block |
| ⚠ CARRIED FORWARD | **The `stateEstate` fixture is deliberately deferred to the D-7 release** by D2's resolution — and `stateEstate` appears **nowhere in `MissingFeatures.md`**, so THIS DOCUMENT is its only record. That is why this scope is RETIRED and not deleted (§G: prefer retiring to deleting). Re-home it before any future deletion |
| ⚠ §4 still governs | *"Any fix to D-3c… builds the instrument, not the repair."* The instrument now exists, so that ordering constraint is **discharged** — a D-3c fix may proceed in its own release |

---

## 1. Premise, verified — the state module is 51 jurisdictions with one under test

**Measured against v5.48:**

- Across every fixture in the suite, `stateCode` is **`null`** — with one exception, `t3_roth.mjs`,
  which uses **`GA`**. `null` takes the **legacy flat-rate fallback** in `stateTaxAnnual` (L1091),
  which never reads `STATE_RULES` at all.
- So **no full projection in this suite exercises the state module for 50 of its 51 jurisdictions.**
- The one that does uses a flat-rate state with a large **unconditional** `excl65` — the least
  discriminating choice available for detecting either the progressive-schedule approximation (D-3)
  or the unconditional-exclusion defect (D-3c).

**`t10` is not the gap.** It drives `stateTaxAnnual` directly across six archetypes, hand-verified to
the dollar (FL no-tax, AZ flat, MS `retExempt`, AL `excl65`, MT partial-SS, fallback), with a
non-vacuous control. That unit coverage is sound. **The gap is that every archetype is a structural
branch**, and AL's $6,000 exclusion carries no income limit — so **D-3c has no assertion anywhere in
the suite, at unit level or household level.**

**⚠ The boundary census cannot currently see this either.** `boundaries.mjs` **L88–90** has a
`state_tax` row keyed on `P.stateTaxRate` — the legacy scalar. It prints *"exercises the state-tax
path"* whenever a flat rate is set, which is **true of the fallback and says nothing about
`STATE_RULES`**. A household can read ON for `state_tax` while the entire 51-jurisdiction module is
muted. Per §K1's maintenance rule — *the boundary that hid a defect is added to the census in the
same release* — this row needs splitting before either fix lands.

## 2. Why this goes first

D-3c and D-7 are both **optimistic-direction** findings, which is the direction this project treats
as the wrong way to be wrong. Neither can be measured end-to-end today, and neither fix could be
shown to work: the suite would report green before and after.

That is the manifest's 2026-08-23 pattern — *a fixture that cannot reach a behaviour makes every
assertion about it vacuous* — and it has now cost this project four recorded instances in two weeks.
Building the fix first and the fixture afterwards is how that happens a fifth time.

## 3. What this ships

**A · Split the census row** (`boundaries.mjs`):

| Row | Keyed on | Reads ON when |
|---|---|---|
| `state_tax` *(existing, narrowed)* | `P.stateTaxRate` | the legacy flat-rate fallback is live |
| `state_code` *(new)* | `P.stateCode` ∈ `STATE_RULES` | the **51-jurisdiction module** is live |
| `state_excl_limited` *(new)* | `stateCode` has non-zero `excl65` **and** a note flagging an income limit | the **D-3c** defect class is reachable |

`state_excl_limited` reads its state list live through the shim — **no hardcoded state codes**, per
the §K1 rule that the tool must not be able to disagree with the app about what a threshold is.
`t29` §F pins that property and must be extended to cover the new rows.

**B · Household fixtures** (`households.mjs`), each sitting on **one** named boundary:

| Fixture | Purpose | Boundary it clears |
|---|---|---|
| `stateProgressive` | a graduated-schedule state where the flat approximation is measurable | `state_code` |
| `stateExclCliff` | **NJ**, 65+ couple, retirement income spanning the statutory $150K cliff | `state_excl_limited` |
| `stateEstate` | a household whose **ending** estate crosses a low state threshold — for D-7 | `state_code` |

**C · Run the census on each proposed fixture before any test code is written.** That is §K1's more
valuable use, and it is what caught the v5.46 claim-gate fixture producing identical figures under
two different rules.

## 4. Explicitly out of scope

- **Any fix to D-3c or D-7.** This scope builds the instrument, not the repair. Shipping a fix in
  the same release would mean the fixture and the behaviour it measures were written together, which
  is the coupling that makes a green result uninformative.
- **Recalibrating `STATE_RULES`.** D-3's precision half stays declined.
- **A sourced census of 51 schedules.** Out of reach and not needed to build fixtures.
- **`tools_fixture.jsx`.** Its line numbers are load-bearing (§B1, four AST tools assert positions
  in it). This scope operates on portfolios and must not touch it — the same separation
  `households.mjs` already documents in its own header.

## 5. Open decisions — build only after these are resolved

**D1 · Which progressive state for `stateProgressive`?** **Recommendation: New York.** It is the one
state already measured against a sourced 2026 schedule (`AUDIT_D3_STATE_TAX_DIRECTION.md`), so the
fixture's expected figures already exist and are hand-verified. Any other state means sourcing a
schedule first.

**D2 · Does `stateEstate` ship now or with D-7?** It is the only one of the three whose target
behaviour **does not yet exist** — nothing computes state estate tax, so the fixture would assert
the *absence*. **Recommendation: ship the census row now, hold the fixture for the D-7 release**,
where it has something to measure. Recorded here so it is not rediscovered.

**D3 · New file or extend `t10`?** **Recommendation: extend `t10`** for the unit-level D-3c
archetype (an income-limited `excl65` state, hand-verified to the dollar against a sourced schedule),
and put household-level state coverage in the existing DOM/engine legs. A new `t3x` file for three
fixtures is more suite surface than the work needs.

**D4 · Version.** Test-infrastructure-only releases still bump — the four in-app version sites are
asserted by `t1` STATIC. Confirm **v5.50** if this follows D-6's v5.49, or reorder if you would
rather this land first.
