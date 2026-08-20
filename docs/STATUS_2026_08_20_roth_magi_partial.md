# STATUS — Roth-tab IRMAA MAGI: measurement PARTIAL, first household measured, 2026-08-20

| Field | Value |
|---|---|
| Scope | `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` — **still open**, now `MEASUREMENT PARTIAL` |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · committed tree `7327575` |
| Decisions | **D-A resolved: both households.** **D-B resolved: include the SS term.** D-C still deferred by design |
| Source changed | **None.** No `src/`, no `qa/`, no build. |
| Complete? | **NO — see §5.** The primary-source hand-computation has NOT been done |

---

## 1. Premise re-verified independently — holds, with one bookkeeping error in the scope

Re-resolved against v5.40 rather than carried from the scope.

| Claim | Result |
|---|---|
| Target `magi` at L8847 is 4-term `pension + spouseBWork + taxableSS + conv_y` | ✅ |
| Engine C at L4399 is the 7-term set | ✅ |
| Four consumers at L8876, L8895, L9017, L9118 | ✅ |
| **Nothing outside the Roth render block reads it** | ✅ — L9017/L9118 resolve to `<anon>@9009` and `<anon>@9112`, both nested inside `<anon>@8719`; the only other reader, L9786, is in `<anon>@9783` and reads Engine C's rows |
| §1(a) the work terms are the same construction | ✅ L8828 vs L4368, wrapper L4340, `rothLadderStart = targetRetireYear` L663 |
| §1(b) ladder ends at the later spouse's pre-RMD year | ✅ L668 |
| §1(c) SS diverges — flat 85% vs graduated §86 | ✅ L4394 vs L8831–8844 |
| §2 census total | ❌ **Scope says 24 AST hits. Measured: 28 AST hits, 25 source sites.** |

**The §2 table does not reproduce.** `runRothStrategies` 2 → **5**; `computeIrmaaPlan` 7 → **5**; the
Roth block 6 → **7**; and `tierForMagi@4319` (2 hits) is **absent from the table entirely**.
`computeWithdrawalPlan` (8) and the IRMAA render (1) are correct. Same source, same tool, hashes
unchanged — so this is a tabulation error in the scope, not drift. **It does not affect the fix bound**,
which rests on the consumer census, and that verified exactly. Correct §2 in whatever ships next.

## 2. The shipped example household DOES exercise the omission — the scope wondered if it would

| Field | Value |
|---|---|
| Ladder | **2029 – 2040** (`rothLadderStart` 2029, `rothLadderEnd` 2040) |
| `rothLadderEndA` / `rothLadderEndB` | **2038 / 2040** — the spouses' RMD-start years differ |
| Spouse A's RMDs begin | **2039**, so **2 of 12 ladder years contain a live RMD** |

This is §1(b)'s conditional, and it bites on the **default household a user sees on first open** — not
only on a constructed one. D-A's constructed household is still needed for "how bad can it get," but the
"does this affect the user in front of us" question is already answered: **yes.**

## 3. Measured — rendered figure vs Engine C, at the default $70K/yr conversion

The Roth figures are read from the **rendered DOM**, not the internal variable (§7: the rendered number
is what the user acts on). The tab displays MAGI rounded to $1K, so Roth-tab values carry that rounding.

| Year | Engine C `magi` | Roth tab (rendered) | Delta | Engine C tier |
|---|---|---|---|---|
| 2029 | 108,060 | $108K | 0 | 0 |
| 2030 | 106,060 | $106K | 0 | 0 |
| 2031 | 136,720 | $137K | 0 | 0 |
| 2032–2038 | 121,720 | $122K | 0 | 0 |
| **2039** | **165,383** | **$122K** | **≈ $43K** | 0 |
| **2040** | **164,569** | **$122K** | **≈ $43K** | 0 |

**Ten of twelve ladder years agree exactly.** The divergence is confined to the two years containing a
live RMD, and runs in the direction the parent scope hypothesised: **the Roth tab reads low**, by roughly
**26%** in those years.

**The tab contradicts itself on screen.** Its own panel prints *"Spouse: $47,681 at 75 (2039)"* as the
first-year RMD under the $70K/yr plan, directly below a ladder row showing 2039 MAGI unchanged from 2038.
The number the user needs is on the same screen as the number that omits it.

**Two divergences the scope expected turned out inert on this household, and the reasons differ:**

- **`div_y` / `capGain_y`** contribute nothing here — this household's `taxableGainPct` is **0**.
  Inert by *configuration*, so a household with a funded taxable sleeve would still exercise them.
- **The SS treatment (§1c)** produces **no difference in any of the twelve years**. The likely reason is
  structural: once provisional income exceeds the upper §86 threshold the graduated worksheet returns
  the 85% cap, which is exactly Engine C's flat figure — so the two agree wherever income is high, and
  can only diverge for a **low-income** household. **Stated as a hypothesis, not a result** — it was
  inferred from the agreement, not isolated by a controlled run.

## 4. Threshold consequence on this household: none

Every ladder year sits at **tier 0** on Engine C's own figures, with headroom of $113K–$166K. A $43K
understatement is large in dollars and **changes no IRMAA tier here**, because the household is far below
the first cliff throughout. Per §3.5 the finding is the tier-crossing count, and for this household it is
**zero**. That is a real mitigation and it must be reported alongside the $43K, not buried by it.

⚠ **Unresolved:** the ladder's `IRMAA?` column renders `✓` on every row while Engine C reports tier 0
throughout. The column's semantics were not determined — the `✓` is followed by the lookback premium
year, so it may mark the lookback rather than a trigger. **Do not quote the `✓` as a trigger indicator
until this is read out of source.**

## 5. What is NOT done — this is a partial, not a result

- **The primary-source hand-computation has not been done.** §3 step 2 requires IRMAA MAGI computed
  independently from 26 U.S.C. §86, Pub. 590-B and the CMS lookback definition, written before either
  engine's output is looked at. **What is above is engine-vs-rendered-DOM, which the scope's own
  Section C standard does not accept as arithmetic.** It establishes *that* the two disagree and *where*;
  it does not establish *which one is right*. Engine C is the comparison, not the reference.
- **The constructed household (D-A, second half) has not been built or run.** Needed for a funded
  taxable sleeve (to exercise `div_y` / `capGain_y`) and for a household near an IRMAA cliff, where the
  tier-crossing count could be non-zero. The zero above is specific to this household and must not be
  generalised.
- **Term decomposition is attributed by inference, not isolation.** The ≈$43K is *consistent with* the
  omitted RMD but is not equal to the $47,681 the tab prints, and the difference has not been explained.
  §3 step 4 requires each term attributed separately; that requires controlled runs.
- **The SS-term conclusion is a hypothesis** (§3 above).
- **`t3` pin, `docs/` finding, and the D4 disclosure** — all wait on the completed measurement.

## 6. Workspace state for the next session

Nothing shipped; no file was modified. The run folder `/home/claude/suite` is session-local and will not
survive. To resume: stand it up per OPERATIONS §B (flat layout, `v539.jsx` / `v540.jsx` / `DangerClose.jsx`
at root, all suite and harness files in one `qa/`), then `mk_testable.sh` both legs and build the DOM
bundles. The rendered Roth figures above came from a jsdom mount that clicks through to the `roth` tab and
reads `body.textContent`; the domdiff harness's render half is the working idiom for it.

**Sources were pristine at every measurement above** — `v540.jsx` and `DangerClose.jsx` at
`6b7cebb1476ee66e57079b713b94ba75`, `v539.jsx` at `7070018f2699503dfac4ca8e0e1b2feb`.
