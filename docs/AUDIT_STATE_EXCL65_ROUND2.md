# AUDIT — 65+ exclusion states, round 2, and the D-3 premise refresh

| Field | Value |
|---|---|
| Build | **v5.54** · source `2e27826c495d3d70ca49ccf71cf238ec` · repo `2a0e830` |
| Date | 2026-08-29 |
| Shape | **Findings only. No source change. No scope. No decisions taken.** `KIND: ops` |
| Coverage | **2 of the 13 unchecked states** — KY, DE. **11 still unchecked.** |
| Predecessor | `AUDIT_STATE_EXCL65_NOTES.md`, which checked 6 of 19 and found 4 wrong |

⚠ **This audit stops at two states because the session budget does, not because the question is
answered.** A partial audit stated as partial is the deliverable. The two were taken in the order the
predecessor recommended — largest unchecked exposure first.

---

## 0 · The finding that outranks the individual states

**The model has one age gate. The states have at least four.**

`stateTaxAnnual` computes the exclusion as `(r.excl65 || 0) * Math.max(0, persons65)` — verified by
parser at v5.54 L1123, byte-identical to v5.53. `persons65` can only express *"how many people are
65 or over."* But of the states now checked:

| State | Statutory age threshold | Source |
|---|---|---|
| **KY** | **none at all** | KY DOR, Schedule M (2025) |
| **DE** | **60** | 30 Del. C. § 1106(b)(3) |
| **NJ** | **62** | found by the predecessor audit |
| **SC** | **tiered** — $10K under 65, $15K at 65+ | the model's own note says so |
| most others | 65 | — |

For every state whose threshold is below 65, the model gives **$0 of exclusion** to a household aged
threshold-to-64 that the statute would give the full amount. **Direction: conservative — it
overstates state tax and understates the plan.** That is the opposite direction from every v5.54
finding, and it is not disclosed anywhere.

It matters more than its direction suggests, because the affected band — 60 to 64 — is exactly the
early-retirement population this app exists to model. A Delaware couple retiring at 61 is told they
get nothing until 65; the statute gives them $12,500 each from 60.

**This cannot be fixed by rewording notes.** `excl65 × persons65` has no way to express a per-state
age threshold. It needs a second field (an age floor per state) and a per-spouse age count — which
is the *same* structural prerequisite the SS-offset work needs, and which the v5.54 handover already
records as "a per-spouse replacement for `persons65`". **Two separate defect classes now converge on
one refactor.** That is worth knowing before either is scoped.

---

## 1 · Kentucky — `excl65: 31110`, `rate: 0.04`, note *"$31,110/person retirement-income exclusion"*

**Primary source:** KY DOR Schedule M (2025), Line 9; KY DOR Individual Income Tax page; KRS 141.019.

| Claim | Verdict |
|---|---|
| $31,110 | **CORRECT** for TY2025 — *"100 percent of taxable retirement benefits or $31,110, whichever is less"* |
| per-person | **CORRECT** — *"for each taxpayer and must be computed independently of your spouse"* |
| not income-limited | **CORRECT** — no income test on the exclusion |
| **age 65 gate** | **WRONG — there is no age requirement.** Schedule M attaches none, and the DOR page attaches none. The note does not claim one either; **the note is right and the code is wrong.** |

**This is the inverse of the New Jersey case** and worth stating plainly, because the predecessor
audit's pattern was *"the note misstates the law."* Here the note is accurate and `persons65`
silently imposes an age test the statute does not have.

⚠ **UNRESOLVED — rate.** The model carries `0.04`. The KY DOR's own Individual Income Tax page still
reads *"The tax rate is four (4) percent."* Multiple secondary sources report a reduction to **3.5%
effective 2026**, which would make the modelled rate stale for the "2026 approx" the caption claims.
**I did not resolve this against the enacting statute and am not recording a verdict on it.** The DOR
page appears not yet updated for TY2026 — it also still cites the IRC as of 31 Dec 2024. Someone
should read KRS 141.020 and the 2025 rate-reduction act directly.

⚠ Kentucky also allows **more** than $31,110 via Schedule P for government retirees with pre-1998
service. Out of scope for a flat model; worth a note only if the class is ever modelled.

## 2 · Delaware — `excl65: 12500`, `rate: 0.055`, note *"$12.5K 60+ pension/retirement exclusion"*

**Primary source:** 30 Del. C. § 1106(b)(3) (delcode.delaware.gov).

| Claim | Verdict |
|---|---|
| $12,500 | **CORRECT as of the code text read** — but see the staleness flag below |
| age 60 | **CORRECT in the note** — *"For persons age 60 or older, amounts received, not to exceed $12,500 … or as eligible retirement income"* |
| per-person | **CORRECT** — each taxpayer gets one exclusion; spouses each get one |
| **the model's 65 gate** | **WRONG** — the model gives a 60-64 Delaware household $0 where the statute gives $12,500 each |

**Two further gaps the model cannot express, neither disclosed:**

- **Under 60 is not zero — it is $2,000**, and only for *employer pensions*, not 401(k)/IRA
  distributions. The model gives $0.
- **"Eligible retirement income" at 60+ is broader than the model's `retIncome + pen`** — Delaware
  includes dividends, interest, capital gains and net rental income in the excludable base. The
  model applies the exclusion only against retirement and pension income, then taxes capital gains
  separately. Direction here is **also conservative**.

⚠ **UNRESOLVED — staleness.** Delaware **HB 108** (153rd General Assembly) raises the exclusion from
$12,500 to **$25,000** for persons 60 and older. Sources conflict on whether it is enacted and
effective for TY2025: one describes it as effective *"for taxable years beginning on or after
January 1, 2025"*, another describes it as a proposal. **I did not establish its status and am
recording no verdict.** If enacted, the modelled figure is understated by half — the single largest
proportional error found in either audit round. This should be checked first next session.

## 3 · Still unchecked — 11 of 19

`AL $6,000` · `AR $6,000` · `LA $6,000` · `MT $5,500` · `NM $8,000` · `OK $10,000` · `RI $20,000` ·
`SC $15,000` · `VA $12,000` · `WV $8,000` · `WI $5,000`

**Recommended order for the next round, and why it differs from "largest first":**

1. **DE's HB 108 status** — not a new state, but a possible 2× error on a state already audited.
2. **RI $20,000** — largest remaining, and its note already claims an income limit, so it is a
   candidate for the NJ failure mode (limit acknowledged, detail wrong).
3. **SC $15,000** — the note already describes a **tiered** rule the model cannot express, so it is
   a known-shape defect awaiting measurement.
4. **MT $5,500** — Montana restructured its income tax for 2024; the whole entry may be stale, and
   §2E already carries a version-gated pin for the Montana note.
5. **VA, NM, WI** — all three flag income limits in their notes and all three are in `t29`'s
   `state_excl_limited` set. **See §4.**

## 4 · Constraint on any future note rewording — carried from the v5.54 ship

`qa/tools/boundaries.mjs` L175 selects the `state_excl_limited` boundary set with
`/income[- ]limited|income limit/i` over the note text, and `t29`'s F-7 requires the
`stateExclCliff` fixture's own state — **New Jersey** — to be in that set. At v5.54 the rewritten NJ
note dropped the phrase, F-7 failed, and the fix was to restore the house-style `income-limited:`
wording the four sibling notes already use.

**NM, RI, VA and WI are the other four members.** Rewording any of them away from the phrase will
fail F-7 the same way. Either keep the phrase, or change the predicate — and if the predicate
changes, note that a widened matcher measured at the v5.54 ship pulls **Maine** into the set,
correctly: ME's $250K MFJ phase-out is a genuine income limit that no note disclosed before v5.54.
**Maine belongs in that set and is missing from it.** That is a real under-count, not a wording
artefact, and it is the decision this audit hands to D-3.

---

## 5 · D-3 premise refresh — `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md`

The scope's premise was verified against **v5.53** `12a007ed…` / tree `74497fd`. Re-verified against
shipped v5.54 by parser this session:

| Premise claim | Status at v5.54 |
|---|---|
| `stateTaxAnnual` definition at L1114 | **HOLDS** — `census.cjs`, same line |
| Three call sites: L3965, L4082 (Engine A), L5231 (Engine B) | **HOLDS** — same lines, same enclosing scopes |
| Exclusion arithmetic L1114–L1130 | **HOLDS — byte-identical** to v5.53 |
| `NJ.excl65 = 75000`, applied unconditionally | **HOLDS** |
| **NJ's `note` text, quoted verbatim in §2** | **STALE — v5.54 rewrote it** |
| Baseline "2,738 checks, v5.52/v5.53 pair" | **STALE — now 2,750, v5.53/v5.54 pair** |
| **D3-d** — *"NJ's note is wrong; correcting it is out of scope and needs a version bump"* | **BUILT.** v5.54 did exactly this. The decision is spent. |

**Verdict: the scope is buildable and its test is unchanged.** The thing D-3c tests is the *model's*
unconditional $150,000 for a 65+ couple, and v5.54 touched only the disclosure. Three edits are
needed before building — refresh the quoted note, refresh the baseline figures, and mark D3-d
resolved-by-v5.54 rather than open — none of which disturbs D3-a, D3-b, D3-c or D3-e.

⚠ **One decision D-3 should now absorb rather than leave to §7 as written:** given §0 above, is the
NJ archetype still *"one mechanism of at least two"*, or **one of at least three**? The audit note in
§7 names income-limiting and the SS offset. Age-threshold mismatch is a third, it affects NJ itself
(62, not 65), and it is now measured rather than suspected.

---

## 6 · What this audit did NOT do

- **No source change, no test, no scope.** Findings only.
- **Did not resolve** KY's 2026 rate or DE's HB 108 status. Both are flagged, neither is asserted.
- **Did not re-check** the six states the predecessor covered.
- **Did not verify** the eleven remaining states in any respect, including the ones whose notes look
  plausible. The predecessor found 4 of 6 wrong; plausible-looking is not evidence.
