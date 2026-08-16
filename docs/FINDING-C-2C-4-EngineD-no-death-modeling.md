# FINDING C-2C-4 — Engine D (Withdrawal tab) does not model first-spouse death

**Found:** 2026-08-08, during the D-1 verification of `SCOPE_FIX_survivor_rmd.md` (pre-build).
**Build:** v5.10.2 · `DangerClose-v5_10_2.jsx` md5 `7ddda3585abb9dc2c40fa4fbfc46967a`
**Severity:** **MEDIUM** · **direction: HOUSEHOLD-DEPENDENT** (conservative on the demo household) · **undisclosed**
**Status:** premise verified from source; **figures EXECUTED 2026-08-09**; disclosure sweep RUN (negative).

> **AMENDED 2026-08-09 — the original HIGH / non-conservative rating in §3 is SUPERSEDED.** It was
> derived from the Social Security omission alone. This engine has a *second* omission pushing the
> opposite way — `annualExpense` (L6971–6974) applies no survivor spending factor — and on the demo
> household that one is larger. See §6, added below. Re-verified against v5.11 (md5
> `f645a3967c687960bb03227b5ce5bfec`); every absence reported here is still present in v5.11.

---

## 1. What the scope predicted, and what is actually there

The scope listed Engine D as *"already splits per person… but no widow/rollover logic appears — verification
owed."* The expectation was that Engine D might be a fourth site of the **same** defect class (RMDs keyed to
the wrong person's age). **It is not.** Engine D is correct on that specific point — it splits by `_fracB`
(L6947) and uses each person's own age and own start age (L7042–7043).

The actual problem is larger: **Engine D never models the first death.** Verified absences across the whole
engine region (L6900–7160): no `widowed`, no `deathYr1`, no `survivor`, no filing flip, no spousal rollover.

## 2. Consequences

- **Both Social Security checks continue for life.** `guaranteed = ssA_y + ssB_y + pen_y + work_y +
  streamsAll_y` (L7032), with `ssA_y` and `ssB_y` computed unconditionally (L7020–7021). Every other engine
  drops the smaller check at first death; Engine D keeps it.
- **The horizon confirms this is not an early-stop artifact.** `_horizonYr = Math.max(_dobAYr + lifeExpA,
  _dobBYr + lifeExpB)` (L6935) runs to the **second** death, so the engine models years in which one spouse
  is dead while still paying that spouse's benefit.
- **RMDs continue on the decedent's own schedule.** With no rollover, the decedent's `_fracB` share keeps
  RMD-ing on their own age for the full horizon.
- **Taxes use a flat approximation** (`taxableSS = (ssA_y + ssB_y) * 0.85`, L7101), so the inflated SS also
  inflates the taxable base.

## 3. Direction and rough scale

**Non-conservative.** Phantom income makes the withdrawal plan look **more** sustainable than it is — the
opposite of the app's stated identity.

Order of magnitude on the built-in example household (A dies 2044, B survives to 2053; gross benefits read
from the Taxes tab detail panel at ±$500: A ≈ $40K, B ≈ $16K): every other engine gives the survivor the
larger check only (≈$40K), while Engine D pays ≈$56K. That is **≈$16K/yr of phantom guaranteed income
across ≈9 survivor years**. Illustrative only — not executed against Engine D itself (§4).

## 4. Not yet done

- **Execution against Engine D.** The figures above are inferred from the *Taxes* tab's SS values plus
  Engine D's source, not read from the Withdrawal tab's own output. The DOM harness now exists and can do
  this; it was not done before reporting, because reporting a scope-premise contradiction takes precedence
  over extending the investigation.
- **Disclosure sweep.** A targeted search found no statement that the Withdrawal tab omits death modeling,
  but a full sweep of the Field Manual and tab-level notes has not been run. **If a disclosure exists, this
  downgrades to a disclosed limitation.** That check must happen before the finding is treated as settled.
- **Severity is provisional** pending both of the above.

## 5. Interaction with the in-flight fix

The scoped Engine B + C survivor-RMD fix is **unaffected** — different engines, different mechanism, no
shared code. But note: correcting B and C while D still ignores death **widens** the cross-engine (D-3)
divergence between the Withdrawal tab and everything else. That is an argument for addressing D soon, not
for delaying B and C.

## 6. Recommendation

Proceed with the v5.11 Engine B + C fix as scoped — it is a strict improvement and this finding does not
touch it. Handle C-2C-4 as its own scoped item once §4 is closed. Do **not** fold it into the current
release: the fix has a verified premise and a defined blast radius, and this does not yet.


---

## 6. AMENDMENT 2026-08-09 — executed figures, and a correction to §3's direction

**Executed** (Withdrawal tab, demo household, A dies 2044, B survives to 2053):

| Year | Guaranteed | Expenses | Draw Need |
|---|---|---|---|
| 2043 (both alive) | $85K | $141K | $55K |
| 2044 (A dies) | $88K | $144K | $57K |
| 2045 (survivor) | $90K | $148K | $58K |

Both columns rise smoothly through the death: no SS drop **and no spending drop**. This closes §4's
first owed item.

**The second omission.** `annualExpense` is `baseMo * 12 * _wInflator(yr)` — no survivor factor,
where the Survivor tab (L9388) and the Monte Carlo (L1773) both apply `SURVIVOR_SPEND_FACTOR = 0.75`
(L958). The two omissions oppose each other on Draw Need:

| Omission | Effect on Draw Need | Direction |
|---|---|---|
| Both SS checks continue | understates | non-conservative |
| No survivor spending reduction | **overstates** | **conservative** |

At 2045 the spending side is the larger (≈$37K vs ≈$16–25K), so the tab currently reads
**pessimistic** on this household — the opposite of §3's claim. The errors do not cancel by design,
and the net sign is **household-dependent**: high Social Security relative to spending flips it
non-conservative. Any restatement must give the condition, not a single sign.

**Disclosure sweep — RUN, negative.** No statement in the source, `DOCS_HTML`, tab notes, or
METHODOLOGY says the Withdrawal tab omits death modeling. The finding stands as undisclosed and does
**not** downgrade. METHODOLOGY §10 in fact lists "one SS check, survivor spending factor" as app
behavior without naming engines — the same generalizing pattern that concealed C-2C-3.

**Method note.** §3's error was rating a two-sided omission from one side. The same mistake was made
about C-2C-5 during the v5.11 session. Recorded so the pattern is visible, not just the instance.
