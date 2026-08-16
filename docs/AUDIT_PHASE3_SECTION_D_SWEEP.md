# AUDIT — Phase 3, Section D · the undisclosed-gap sweep

| Field | Value |
|---|---|
| Build under audit | **v5.31** · source md5 `17636ea1b24ea37c806008e7a6b1a32f` |
| Built `index.html` | `ec935c4af4309ee3dbcf2d2c269383ad` |
| Verified against | the **committed tree** (fresh clone, commit `4b8e714`), not a working copy |
| Objective | the one `AUDIT_PHASE3_ROLLUP.md` §4 names: *"Section D should be re-run, with the undisclosed-gap sweep as its explicit objective."* |
| Result | **No new undisclosed gap found.** One low-severity disclosure inaccuracy (S-1). One previously-open question resolved (D-6). Two suspected gaps investigated and **cleared by measurement**. |
| Fixes made | **None.** This is an audit. |

---

## 1. Why this sweep needed a different method

The rollup left Section D partial and said why: D-6 was the only candidate surfaced, and it was
deliberately left unranked because manifest item 7 records this project asserting "undisclosed"
wrongly after checking two places — ***"'Undisclosed' requires looking everywhere."***

Two further pieces of evidence shaped the method here:

1. **v5.30 ran a disclosure sweep and reported it "found nothing."** It searched `DOCS_HTML`. The
   false statement it was looking for was in the **render tree**, and survived.
2. **v5.31 found that statement by accident**, while checking an unrelated blast radius. The Taxes
   tab's header said the OBBBA deduction was modelled, its line item rendered a figure including
   it, and its closing footnote said it was not modelled — false since v5.24, through five releases
   and one release dedicated to that exact class of error.

So the sweep was built around the failure mode that actually occurs here: **not a missing
disclosure, but two surfaces disagreeing.** And "everywhere" was made mechanical rather than
sampled.

## 2. Method

**Enumerate, don't sample.** All **28 user-facing surfaces** were captured from the shipped build:
26 rendered tabs (driven through the DOM harness with the example household loaded, text captured
per tab), plus the Field Manual (`DOCS_HTML`, decoded from the string literal rather than grepped)
and `METHODOLOGY.md`.

Three passes over that corpus:

- **Pass A — claim extraction.** Every claim-shaped sentence (modelling assertions, simplifications,
  approximations, exclusions, "assumes", "only", "deliberately"). **58 claims** across 18 surfaces.
- **Pass B — negative-claim inventory.** Every *negative* modelling claim, with its subject.
  **28 distinct claims.** These are where a contradiction lives, because a false "not modelled" is
  exactly the v5.31 defect.
- **Pass C — measurement.** Where a claim was checkable, it was checked by driving the engines and
  perturbing inputs — not by reading the code. Per the standing methodology, reading code and
  judging it plausible does not satisfy this audit.

## 3. What was measured, and what it showed

### 3.1 Other-accounts tax types — **CLEAR**, and stronger than the docs claim

My Data asserts *"TAX TYPE DRIVES TAX, RMDs AND THE WITHDRAWAL TAB."* Tested by shifting **$50,000
between tax types with the household total held constant**, so the drawdown-trajectory confound
that misled an earlier `t19` pin could not contaminate the result:

| Shift (total constant) | Lifetime RMD | Lifetime tax |
|---|---|---|
| `trad` → `annuity` (ordinary income, RMD-exempt) | −$45,767 | −$7,904 |
| `trad` → `taxable` (leaves pre-tax basis) | −$64,055 | −$10,495 |
| `trad` → `hsa` (modelled tax-free) | −$64,055 | −$10,495 |
| `trad` → `trad` (control) | $0 | $0 |

All four types behave distinctly and in the right directions. The annuity case is the one that
matters: the money stays in the ordinary-income basis but leaves the RMD basis, which is exactly
what `retireStartBalances` claims to do via its separate `rmdInit` and `annShare`. **It does it.**
The control moving $0 is what proves the harness was measuring the shift and not noise.

### 3.2 Cross-engine consistency for Other-accounts money — **CLEAR**

The suspected gap: Engine D was fixed at v5.26 to bring named-IRA money into the pre-tax basis, but
Engines B and C were not obviously covered by that fix, and Engine C's MAGI expression does not
mention Other-accounts draws. If B or C had missed it, the Withdrawal tab and the IRMAA tab would
disagree about the same money, in the optimistic direction.

Perturbation: **+$100,000 into the named "Rollover IRA (A)"** (`taxType: trad`).

| Engine | Quantity | Moved? |
|---|---|---|
| D — withdrawal | `_tradInit` | +$100,000 |
| D — withdrawal | `_taxInit` (Priority-1 pool) | +$100,000 |
| C — IRMAA | lifetime MAGI | +$128,111 |
| B — taxes | lifetime tax | +$23,690 |
| B — taxes | lifetime RMD | +$128,111 |

All three engines see it. **This suspicion was wrong and is recorded as wrong.** The shared
`retireStartBalances` helper is doing the work it was built for.

### 3.3 D-6 — IRMAA SSA-44 relief · **RESOLVED: disclosed, not a gap**

The rollup left D-6 flagged for verification precisely because "undisclosed" had not been
established by looking everywhere. Having now looked everywhere, it is **disclosed** —
`METHODOLOGY.md` states that the life-changing-event reassessment, which lets a survivor ask SSA to
reassess IRMAA on current rather than two-year-old joint income, is not modelled.

**D-6 should be reclassified from "unranked, flagged for verification" to a disclosed limitation.**
It remains a real modelling gap and its priority is unchanged by this; what changes is that it is
no longer a candidate *undisclosed* gap, which is what the rollup needed to know.

## 4. Findings

### S-1 · The IRMAA tab enumerates MAGI components and omits dividends — **Low, user-side**

**What.** The IRMAA tab states: *"MAGI here uses the simplified 85%-of-SS assumption plus pension,
earned income, RMDs, and conversions."* That is an enumeration, and it is incomplete. Engine C's
MAGI also includes `div_y`, the taxable sleeve's dividend and interest income.

**Measured.** Varying the taxable-account yield with everything else held constant:

| Taxable yield | Lifetime IRMAA MAGI |
|---|---|
| 0% | $2,854,365 |
| 2% (default) | $2,873,805 |
| 4% | $2,893,245 |

**~$19,440 of lifetime MAGI per 2% of yield** on this household — real, and it moves a household
toward the tier boundaries the whole tab is about.

**Why it is only Low.** The direction is safe in the way that matters: the app *does* count the
income, so no surcharge is understated. The engine is right and the sentence is incomplete. A user
reading it could reasonably conclude their brokerage dividends don't bear on IRMAA, which is the
opposite of true — but the plan they are shown is correct.

**Suspected cause.** The sentence enumerates the components that existed when it was written; `div_y`
was added to the MAGI expression later, and the source comment beside it says it is *"kept in sync
with the Taxes tab"* — the engines were synced and the prose was not. Same shape as the v5.31 defect,
smaller: a claim written once and left behind by a later change.

**Fix shape.** One clause. No engine change. Candidate for whatever release next opens that file;
not worth a release of its own.

### S-2 · Not a defect — recorded so it is not re-investigated

Both §3.1 and §3.2 began as suspected undisclosed gaps and were cleared by measurement. They are
written up because a future session reading Engine C's MAGI expression will notice the same absence
of Other-accounts draws and reach for the same hypothesis. **It is already tested. The money arrives
through the traditional balance, not as a separate MAGI term.**

## 5. The headline result

**The rendered surfaces and the documentation now agree.** Across 28 surfaces and 28 negative
modelling claims, no claim was found that the engines contradict. Every limitation named above —
spousal top-up benefits, itemized deductions, progressive state brackets, Medicaid below 100% FPL,
Alaska/Hawaii FPL, cost-sharing reductions, the 10% early-withdrawal penalty, the CRT/CGA QCD
election, correlated spousal mortality, inherited-IRA treatment, Qualifying Surviving Spouse status,
SSA-44 relief, LTC policy payouts, home equity, COLA compounding on the SS tab, and the backtest's
exclusion of taxes/RMDs/Roth/LTC — is **disclosed**, and disclosed in the right place.

This is a real result rather than an absence of one: the same method, aimed at v5.30, would have
caught the Taxes-tab contradiction, because that is the shape it was built to catch.

**Direction of the remaining known gaps is the open concern, not their disclosure.** Two disclosed
limitations still point the optimistic way and are unaffected by this sweep:

- **D-2** — ordinary drawdown realizes no capital gains, so an appreciated brokerage account is spent
  with no capital-gains tax and no MAGI effect anywhere. Ranked top item.
- **D-3** — an effective flat rate stands in for progressive state schedules; not uniformly
  conservative, and it can flatter a plan in steep states at high incomes.

## 6. Scope — what this sweep did NOT do

Stated explicitly rather than implied, per standing methodology requirement 6.

- **One household.** All measurement used the example household perturbed in controlled ways. A
  disclosure that is true for this household and false for another — a single filer, a very high
  earner, a state with an unusual rule — would not have been caught. The claims inventory is
  household-independent; the *measurements* in §3 are not.
- **Claim extraction is pattern-based.** A claim phrased without any of the matched
  markers would be missed. The 58/28 counts are a floor, not a proof of totality.
- **Numbers on screen were not re-verified.** This sweep checked *claims about what the model does*,
  not *whether the model's arithmetic is right* — that is Section C, complete and separately
  documented.
- **No Section F work.** Usability is untouched and remains not started.
- **`validation/` was not exercised.** The older public-constants suite was out of scope here.

## 7. Where this leaves the plan

| Phase | Sections | Status |
|---|---|---|
| 1 | A + B | ✅ v5.10.1 |
| 2 | C | ✅ complete |
| **3** | **D + E** | **E ✅ · D ✅ — completed by this document** |
| 4 | F — usability, desktop + small screen | ⬜ not started |

Section D's outstanding objective is discharged. **The two-paragraph top-five summary is now
unblocked** — the rollup deferred it pending this sweep and Phase 4, and only Phase 4 remains.

**Recommended next work, in order:**

1. **Scope D-2** (unrealized capital gains on ordinary drawdown). It is the ranked top item, it is
   user-side, and it is the one open item that makes the plan look *better* than reality — which is
   the direction this project exists to avoid. It needs a real scope: a cost-basis input implies a
   My Data field, a storage-schema change, backup migration, then Engines B and D, then the
   MAGI → IRMAA → ACA knock-ons.
2. **S-1** folded into any release that opens the IRMAA tab.
3. **Phase 4 (Section F)** whenever convenient — it is independent of everything above.
