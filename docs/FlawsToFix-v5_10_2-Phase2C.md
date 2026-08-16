# FlawsToFix — Standing Code Audit, Phase 2 · Sub-phase 2C (Section C: first-spouse death)

**Supersedes** `FlawsToFix-v5_10_2-Phase2C-INTERIM.md` (that document was the pre-execution partial).

**Build under audit:** v5.10.2 · `DangerClose-v5_10_2.jsx` md5 `7ddda3585abb9dc2c40fa4fbfc46967a`
**Prior (comparison baseline):** v5.10.1 · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc`
**Date:** 2026-08-08 · **Governing scope:** `SCOPE_AUDIT_PHASE2_v5_10_2.md` (D-1…D-5 binding)
**Sub-phase order (D-1):** 2A ✓ → 2B ✓ → **2C ✓ (this)** → 2D → 2E

**Verification standard actually achieved — read this first.** Engine A (`runRothStrategies`) is a
module-level function and is dollar-exact testable. **Engines B and C are not.** Their figures reach the
outside world only through the rendered DOM, which emits every value $K-rounded, so they are verifiable to
**±$500** (Engine C's surcharge to ±$50). This was discovered during this sub-phase and is recorded in
`STOP-REPORT-EngineBC-render-precision.md`; 2A and 2B were amended accordingly. Nothing below claims
dollar-exactness for Engine B.

**Freshness check:** manifest ↔ `md5sum` ↔ CHANGELOG all agree, hashes as above. **PASSED.** No source
modified in this sub-phase.

---

## 1. Method

The jsdom render was stood up and validated (t9 green **14/14**) before any figure was read. Both harness
traps were honored: `Math.random` seeded **before** the bundle import (d3-random captures it at module
load), and `globalThis.URL.createObjectURL` stubbed rather than only `window.URL`.

Household under test — the built-in example (`PLAN_TIMELINE` read from the running app, not assumed):

| Field | Value |
|---|---|
| Spouse A born | 1964 · life expectancy 80 → **dies 2044** |
| Spouse B born | 1966 · life expectancy 87 → dies 2053 |
| `deathYr1` | **2044** · **survivor = B** |
| `rmdStartAge` | 75 for both (SECURE 2.0 §107, 1960+ births) |

This is the structurally interesting case: **the older spouse dies first and the younger survives.**

---

## 2. Findings

### C-2C-3 · Engine B computes post-death RMDs on the **deceased** spouse's age — **HIGH**, undisclosed, **direction depends on which spouse is younger**

**What the code does.** Engine A (Roth) splits `tradA`/`tradB`, performs a spousal rollover into the
survivor at the first widowed year (L3385–3389), and runs RMDs on the **survivor's** own age and start age
(L3390–3391). Engine B (Taxes) holds a **single pooled `tradBal`** (L8123, L8131) and computes
`rmd_y = ageA >= rmdStartAge(_dobAYr) && tradBal > 0 ? tradBal / rmdDivisor(ageA) : 0` (L8162) —
**unconditionally keyed to person A**, with `ageA = yr − _dobAYr` continuing to increment after A has died.

**Confirmed in execution.** Engine B's own detail panel, across the death boundary:

| Year | Panel header | RMD shown | Implied balance if **ageA**-based | Implied balance if **survivor**-based |
|---|---|---|---|---|
| 2043 | ages 79/77 · MFJ | $45K | $950K | $1,030K |
| 2044 | ages 80/78 · Single (survivor) | $47K | $949K | $1,034K |
| 2045 | ages 81/79 · Single (survivor) | $49K | $951K | $1,034K |

The ageA hypothesis yields a **stable implied balance straight through the death year** ($950K → $949K →
$951K); the survivor-age hypothesis requires an implausible discontinuity at the boundary. Engine B is
demonstrably still using the decedent's age after death.

**Size of the divergence** (divisors from `rmdDivisor()`, verified against the IRS Uniform Lifetime Table
by t1 — age 78 → 22.0, age 80 → 20.2, age 81 → 19.4, age 79 → 21.1):

| Year | Engine B (ageA) | Correct (survivor B) | Divergence |
|---|---|---|---|
| 2044 | $47.0K | $43.2K | **≈ $3,850/yr** |
| 2045 | $49.0K | $45.0K | **≈ $3,950/yr** |

Generalized: divergence = `tradBal × (1/div(ageA) − 1/div(ageB))`. At the 2044 ages that is
**$2,025 per $500K**, **$4,050 per $1M**, **$8,101 per $2M** — an order of magnitude above the ±$500
measurement band, so the finding is robust to the DOM's rounding.

**Direction is NOT uniformly conservative — this was executed, not assumed.** The sign of the error is set
by whether person A is older or younger than the survivor, because Engine B always uses `ageA`:

*Case 1 — A older, A dies first, B survives* (the example household above). The decedent's age carries the
*smaller* divisor, so Engine B **overstates** the RMD → overstates tax → **conservative**.

*Case 2 — A younger, A dies first, B survives* (**mirror case, executed 2026-08-08**: `dobA` 1966 /
`lifeExpA` 78 → dies 2044; `dobB` 1964 / `lifeExpB` 87 → survives). Engine B now keys RMDs to the *younger,
dead* spouse's age, which carries the *larger* divisor:

| Year | Panel header | Engine B RMD | Correct (survivor B) | Divergence |
|---|---|---|---|---|
| 2043 | ages 77/79 · MFJ | $46K | — | — |
| 2044 | ages 78/80 · Single (survivor) | $48.0K | $52.2K | **understated $4,273** |
| 2045 | ages 79/81 · Single (survivor) | $50.0K | $54.4K | **understated $4,381** |

(Implied balance again stable — $1,053K / $1,056K / $1,055K — confirming the `ageA` basis.) Here Engine B
**understates** the RMD → understates taxable income → understates tax → **overstates plan survival.
Non-conservative.** Magnitude is the same ≈$4,050 per $1M of Traditional balance; only the sign flips.

**Severity: HIGH.** Upgraded from the MEDIUM initially assigned on Case 1 alone. A deliberately pessimistic
stress-tester producing an over-optimistic figure is a direct contradiction of the app's stated identity,
and this is not an exotic configuration: it needs only that the first-listed spouse be the younger one and
die first. The error is silent (nothing on the Taxes tab suggests RMDs are keyed to one spouse), material
(thousands per year, compounding as balances grow), and it moves the plan in the wrong direction.

**Correction to a claim in this document's own prior draft.** The pre-mirror version of §4 predicted the
inversion but explained it as *"Engine B's `ageA` is the survivor's age"* — that reasoning was wrong. When
the survivor **is** A, `ageA` genuinely is the survivor's age and there is **no divergence at all**.
Non-conservative behavior requires `ageA < survivorAge`, i.e. survivor = B **and** B older than A — which
means A is the younger spouse and A dies first. The prediction was right; the stated mechanism was not.

**Why it is a finding (D-3).** The two engines report different RMDs — and therefore different taxable
income and tax — for the *same household in the same year*. Engine A's behavior **is disclosed and
correct** (Field Manual: "rollover: decedent's accounts join the survivor's"; "survivor's own RMD age
governs thereafter"). Engine B's departure is **nowhere disclosed**: its own scope note (L8299–8302)
enumerates what it models and never mentions pooling Traditional balances or keying RMDs to one spouse.
An undisclosed cross-engine divergence is exactly what D-3 defines as a finding.

**Also affects pre-death years.** Since `rmd_y` keys to `rmdStartAge(_dobAYr)` on the *pooled* balance, RMDs
on the younger spouse's money begin when the **older** spouse reaches the start age. For this household
both start ages are 75, so B's share begins in 2039 (A at 75) rather than 2041 (B at 75) — two years early,
again overstating income. Where the spouses' start ages differ (a 1959 vs 1960 birth splits 73 vs 75), the
gap widens.

(Severity is stated above: **HIGH**, on the strength of the executed mirror case.)

---

### C-2C-1 · Filing flips to Single in the **year of death** — LOW, disclosure-class, conservative

Both engines use `widowed = !single && yr >= deathYr1` (L3375, L8138), so the **entire** death year files
Single. Confirmed in execution: the 2044 panel reads *"DETAIL — 2044 (ages 80/78) · Single (survivor)"* with
the widow's-penalty warning, and 2044 **is** `deathYr1`.

**Primary law.** IRS Pub 501 and IRS.gov *"Filing a final federal tax return for someone who has died"*: the
surviving spouse is considered married for the entire year of death and **may file MFJ for that year** — it
is the *last* MFJ year, with Single beginning the year after. (Qualifying Surviving Spouse extends joint
rates two further years but requires a dependent child, which a retired couple lacks — so Single the
following year is correct for this app's population.)

**Effect.** One year of Single brackets and the Single standard deduction where the law allows MFJ →
**over-taxes the death year** → conservative. The app displays the flip year prominently (L7836, L8301) but
never discloses that flipping *in* that year is a simplification departing from the law.

**Severity: LOW.** One year, conservative, and the underlying "widow's penalty" it illustrates is real and
correctly the point of the Survivor tab. Remedy is a disclosure line, not an arithmetic change.

---

### C-2C-2 · SS survivor benefit ignores the RIB-LIM floor — LOW, borderline disclosed, conservative

Both engines keep `max(ssA, ssB)` and zero the other (L3381, L8146–8150) — each spouse's **actual** benefit.

**Primary law.** RIB-LIM / Widow's Limit (20 CFR §404.410(c); SSA POMS GN 00615.320; CRS IF12091): where the
deceased claimed **before** their FRA, the survivor receives the **larger of** the deceased's actual benefit
**or 82.5% of the deceased's PIA**. The app models only the first branch, so when the higher earner claimed
early it can **understate** the survivor's benefit → understates income → conservative.

**Why it stays LOW.** The model is disclosed plainly and accurately ("the survivor keeps the larger of the
two Social Security checks (not both)"), and the user enters actual benefit amounts, so the app is
faithfully reporting the arithmetic it says it performs. This sits close to a disclosed limitation; the only
gap is that the 82.5% floor is never *named*. Note the listed *"spousal top-up benefits not modeled"* refers
to the living-spouse spousal benefit, a different mechanism — it does not cover this.

---

### Observation (not a defect) · survivor SS is labelled under the deceased spouse's name

In survivor years the detail panel still lists *"Spouse A SS (gross benefit)"* — because the retained larger
check is held in `ssA_y` (L8146–8150). The **dollars are correct** (the survivor does keep the larger
check); only the label attributes it to the deceased. Presentation quirk, potentially confusing on the
Taxes tab. Recorded for the usability pass (Section E), not as a numerical finding.

---

## 3. Coupling and interactions

C-2C-1 and C-2C-3 both bite in the same years and both run conservative, so they compound: the death year is
taxed at Single rates *and* on an overstated RMD. Fixing C-2C-1 alone (allowing MFJ in the death year) would
reduce tax in exactly the year C-2C-3 inflates it — the two partially offset today. Any future fix should
therefore be scoped with both in view, as F-2B-1/F-2B-2 were under D-4. There is **no** interaction with the
Phase-2B IRMAA findings: IRMAA's 2-year lookback means the death year's MAGI drives surcharges two years
later, and both engines agree on that offset (2B §113–120).

---

## 4. Owed / not done (stated rather than implied complete)

- **`t10` assertions and `[KNOWN DEFECT]` pins for C-2C-3.** The pin discipline requires the wrong behavior
  be asserted so it stays visible. C-2C-3 lives in Engine B, reachable only through the DOM, so its pin
  needs a **DOM-based test** rather than a t10 addition. A validated probe exists (mount → example data →
  Taxes tab → select year → parse the detail panel; it produced the table in §2) but turning a probe into a
  committed suite is harness work I have not done, and I will not ship unreviewed test code. **Owed.**
- **C-2C-1 / C-2C-2 pins.** Both are cheap positive-behavior pins against Engine A (module-level, t10
  pattern) and should ship with whichever release addresses or discloses them. **Owed.**
- **Dollar-exact Engine B/C verification.** Not achievable by the current harness (see the STOP report).
  Requires the spliced test-only rows hook — a scoped harness task.
- **Mirror case — now executed (2026-08-08).** Done, and it inverted the direction: see C-2C-3 Case 2. This
  is what upgraded the finding to HIGH. The mechanism stated in the earlier draft was corrected there.
- **Remaining household shapes.** Two configurations are still unexecuted: (a) survivor = A (Engine B should
  be *correct*, since `ageA` is then the survivor's own age — predicted no divergence, worth confirming);
  and (b) spouses straddling the SECURE 2.0 start-age boundary (a 1959 vs 1960 birth splits 73 vs 75), which
  should widen the pre-death divergence. Predictions, not results — flagged as such.

---

## 5. Honesty statement

Every line number and constant here was read from the canonical source this session; every legal claim is
pinned to IRS or SSA primary material; every engine figure was produced by executing the build, not by
inspection. The one substantive limit is precision: Engine B's figures are ±$500, and the C-2C-3 divergence
(~$3,900/yr) is reported as robust *because* it exceeds that band by roughly eightfold, not because the
measurement is exact. Phase 2 documents; it does not fix (scope §6). Nothing here is a release gate.
