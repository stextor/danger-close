# STOP REPORT — the Roth tab's Social Security term is not the §86 worksheet

| Field | Value |
|---|---|
| Raised | 2026-08-20, during `SCOPE_ROTH_TAB_MAGI_MEASUREMENT` §3 step 2 |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` |
| Trigger | Ground rule: *"If mid-build evidence contradicts the scope's premise, STOP and report rather than adapting silently."* |
| Premise contradicted | `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` §1(c), and the direction hypothesis in §1 "Net" |
| Source changed | **None.** No `src/` edit, no version bump, no test edited |
| Engine output consulted | **None.** Everything below is source-reading plus independently-written arithmetic, so the scope's *"written independently, before either engine's output is looked at"* condition is still intact for whoever resumes |

---

## 0. Freshness check (OPERATIONS §A / §A2) — PASS

| Check | Result |
|---|---|
| `DangerClose-v5_40.jsx` | `6b7cebb1476ee66e57079b713b94ba75` — matches manifest |
| `DangerClose-v5_39.jsx` | `7070018f2699503dfac4ca8e0e1b2feb` — matches manifest |
| Committed `src/DangerClose.jsx` | byte-identical to the pool's v5.40 |
| Pool ↔ clone, **both directions** | 82 of 83 pool files content-identical |
| Only pool-only file | `DangerClose-v5_39.jsx`, the retained prior source (expected, §F) |
| Repo-only files | known-history classes only — superseded `dom_entry_*`, retired `probe_classify.mjs`, `validation/`, built `index.html`, archived docs |

No stale suite files. The scope's §7 recorded 76/78 with `README-FIRST.md` as a second exception; that file is no longer in the pool, so the count is now 82/83 with one exception.

---

## 1. What the scope says, and why it is wrong

`SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` §1(c):

> *"The Roth block runs the graduated §86 provisional-income worksheet against filing-status-selected
> thresholds (L8831–8844) and can return anything from **0** to 85% of benefits."*

**It does not run the §86 worksheet.** It runs a two-tier approximation, and above the adjusted base
amount it returns **exactly 85% of benefits, always** — a cliff, not a phase-in. Verbatim from v5.40
L8841–8844:

```js
let taxableSS = 0;
if (provisional > _ssT2) taxableSS = Math.round(totalSS * 0.85);
else if (provisional > _ssT1) taxableSS = Math.round(Math.min((provisional - _ssT1) * 0.5, totalSS * 0.85));
else taxableSS = 0;
```

Compare 26 U.S.C. §86(a)(2), which governs the case `provisional > adjusted base amount`. The
includible amount is the **lesser** of

- (A) 85% of the excess over the *adjusted base amount*, **plus** the lesser of [the §86(a)(1)
  amount] or [½ × (adjusted base − base)] — $6,000 joint, $4,500 otherwise; and
- (B) 85% of benefits.

The app's top branch is limb (B) alone. Limb (A) — the limb that actually binds for most retirees
just over the threshold — is absent.

The middle branch is also not §86(a)(1). The statute caps that tier at **½ of benefits**; the app
caps it at **0.85 × benefits**.

### The app already contains a correct implementation, and the Roth tab does not call it

`taxableSSPortion`, L4990–4997, inside `computeTaxPlan` (Engine B, L4902):

```js
if (provisional <= _ssThr1) return 0;
if (provisional <= _ssThr2) return Math.min(0.5 * (provisional - _ssThr1), 0.5 * ssBenefits);
const lower = 0.5 * Math.min(provisional - _ssThr1, _ssThr2 - _ssThr1);
const upper = 0.85 * (provisional - _ssThr2);
return Math.min(ssBenefits * 0.85, lower + upper);
```

That is the standard worksheet form. So v5.40 carries **three** different Social Security treatments —
Engine B's near-correct worksheet, Engine C's unconditional flat 85%, and the Roth tab's two-tier
cliff — and the scope was written believing the Roth tab held the good one.

---

## 2. The arithmetic

§86 was re-implemented directly from the statutory text (Cornell LII, fetched 2026-08-20), **not**
copied from any app expression, then compared to each in-app copy. Script: `qa/tools/hand_86.mjs`
(new, tooling — asserts nothing, counted in no total).

### 2a. Roth tab vs the statute — MFJ, benefits $60,000

| Non-SS income | Provisional | §86 | Roth tab | Roth tab overstates by |
|---|---|---|---|---|
| $10,000 | $40,000 | $4,000 | $4,000 | $0 |
| **$20,000** | **$50,000** | **$11,100** | **$51,000** | **+$39,900** |
| $30,000 | $60,000 | $19,600 | $51,000 | +$31,400 |
| $50,000 | $80,000 | $36,600 | $51,000 | +$14,400 |
| $80,000 | $110,000 | $51,000 | $51,000 | $0 |

The error opens at the adjusted base amount, peaks immediately above it, and closes again once the
statutory phase-in reaches the 85% ceiling on its own. Grid worst case (benefits $0–90,000, non-SS
$0–120,000): **$69,650** overstatement, at benefits $90,000 / provisional $45,000, where §86 gives
$6,850 and the Roth tab gives $76,500.

### 2b. On the shipped example household this is not hypothetical

From `DEFAULT_PORTFOLIO` (v5.40): `ssA` $3,300/mo at 67, `ssB` $1,300/mo at 63, pension $400/mo →
benefits **$55,200**, pension **$4,800**. With no conversion and no work income, provisional is
already **$32,400** — above the $32,000 joint base amount. The conversion that pushes provisional
past the $44,000 adjusted base amount is **$11,600**.

| `conv_y` | Provisional | §86 | Roth tab | Overstated by |
|---|---|---|---|---|
| $11,000 | $43,400 | $5,700 | $5,700 | $0 |
| $11,600 | $44,000 | $6,000 | $6,000 | $0 |
| **$12,000** | **$44,400** | **$6,340** | **$46,920** | **+$40,580** |
| $15,000 | $47,400 | $8,890 | $46,920 | +$38,030 |
| $25,000 | $57,400 | $17,390 | $46,920 | +$29,530 |
| $50,000 | $82,400 | $38,640 | $46,920 | +$8,280 |

**A $400 increase in the modelled conversion moves reported MAGI by $40,920.** The Roth tab is the
surface whose entire purpose is choosing a conversion size, and it has a $40,920 discontinuity in the
reported figure that does not exist in law.

The same expression is duplicated one line below as `grossTaxable` (L8850), so the tab's **conversion
tax, marginal rate and 24%-bracket headroom are computed off the same inflated figure** — the blast
radius is wider than the four MAGI consumers the scope censused.

### 2c. Engine B is also not exactly §86 — smaller, and outside this scope's target

Engine B's `lower` term is a flat ½ × (adjusted base − base) = $6,000. §86(a)(2)(A)(ii) says *the
lesser of* the §86(a)(1) amount **or** that $6,000 — and the §86(a)(1) amount is itself capped at ½
of benefits. Engine B omits that inner cap.

- Overstates at 452 of the swept grid points; **maximum $2,375**.
- Confined to **benefits below $12,000** — where ½ × benefits < $6,000. Above that the terms coincide.
- **Never understates** (0 grid points), so the direction is conservative.

Reported, not acted on. Engine B is not this scope's target, `t18` asserts it dollar-exact, and
changing it would move the parity guardrail. It needs its own scope.

---

## 3. Primary sources, verified (the durable part — reusable by whoever resumes)

| Rule | Source | Verified value |
|---|---|---|
| SS taxation, tier 1 | 26 U.S.C. §86(a)(1) | lesser of ½ benefits, or ½ (provisional − base) |
| SS taxation, tier 2 | 26 U.S.C. §86(a)(2) | lesser of [85%(prov − adjbase) + min(tier-1 amt, ½(adjbase − base))] or [85% benefits] |
| Base amount | §86(c)(1) | $25,000; **$32,000 joint**; $0 MFS-cohabiting |
| Adjusted base amount | §86(c)(2) | $34,000; **$44,000 joint**; $0 MFS-cohabiting |
| Indexation | §86(c) as amended | **None.** $25/32K fixed since 1983, $34/44K since Pub. L. 103–66 (1993) |
| IRMAA MAGI | 42 U.S.C. §1395r(i)(4)(A) | AGI (§62) **+ tax-exempt interest**, disregarding §§135/911/931/933 |
| IRMAA lookback | 42 U.S.C. §1395r(i)(4)(B)(i) | second calendar year preceding the premium year |
| RMD divisors | IRS Pub. 590-B App. B Table III | 72→27.4, 73→26.5, 74→25.5, 75→24.6, 76→23.7, 77→22.9, 78→22.0, 79→21.1, 80→20.2 … |
| RMD applicable age | SECURE 2.0 §107 | 73 for births 1951–1959; **75 for births 1960+** |

Two app constants **hand-checked against these and found correct**:

- `rmdDivisor` (L1361) reproduces Table III exactly for ages 72–100.
- `rmdStartAge` (L545) reproduces the SECURE 2.0 bands exactly.

**Consequence for the measurement that the scope did not draw.** IRMAA MAGI starts from AGI, and AGI
contains the §86 taxable portion of benefits — *not* 85% of them, and not the untaxed remainder. So
the reference figure for the SS term is §86 itself. Against that reference **both** the Roth tab and
Engine C overstate above the adjusted base amount, and by exactly the same amount, because both
resolve to 0.85 × benefits there. The scope's §1 note — *"against the law it may be the Roth tab that
is closer on this one term"* — is true only **below** the adjusted base amount. Above it they are
identical and identically wrong.

**Not yet verified:** the IRMAA threshold dollar amounts and the app's `irmaaThresholdFor` inflator.
Step 5 (tier consequence) needs them from CMS; they were out of reach in this session and must not be
taken from the secondary sources that surfaced during the search.

---

## 4. What this does to the scope

| Scope claim | Status |
|---|---|
| §1(a) "omits spouse A's earned income" is FALSE | **Stands** — re-read at L8828/L4340; unchanged |
| §1(b) RMD omission is TRUE but conditional | **Stands, and now quantified** — see §5 below |
| §1(c) "runs the graduated §86 worksheet … can return anything from 0 to 85%" | **FALSE.** Two-tier approximation with a cliff at the adjusted base amount |
| §1 "Net": *every* difference runs Roth tab ≤ Engine C | **Half true.** Holds vs Engine C, but the SS term equals Engine C above the adjusted base and the reference is the statute, not Engine C |
| §1 direction hypothesis (omissions understate → flatters the plan) | **No longer one-directional.** Three omitted terms push MAGI down; the SS cliff pushes it up by up to ~$40K on the example household. Net direction is household-specific and cannot be reasoned to — which is what the scope said, and is now the operative fact rather than a precaution |
| D-B ("include the SS divergence") | **Vindicated.** Excluding it would have produced a net figure wrong by construction, exactly as the scope predicted |

**§1(b) now has its number, for the shipped example household.** `dobA` 1963-09-01, `dobB`
1966-03-01, both births 1960+ so both take RMDs at 75:

- `rothLadderEndA` = 1963 + 74 = **2037**; `rothLadderEndB` = 1966 + 74 = **2040**; ladder ends **2040**
- Spouse A's first RMD year = **2038**; Spouse B's = 2041
- **Ladder years containing a live, omitted RMD: 2038, 2039, 2040 — three years**
- Both benefits are running from **2030**, so the SS cliff is live across the whole back half of the ladder

So the example household exercises *both* defects. D-A's worry — that running the example alone
risks a $0 result that reads as "no problem" — does not materialise here.

---

## 5. What remains before the measurement is complete

Steps 1–2 of scope §3 are partially done: the primary-source reference is established and the SS term
is hand-computed. Not done:

1. **The constructed household** (D-A's second case) — needs spouses with *different* RMD-start
   years. Note the cheapest lever is the 1959/1960 boundary: a 1959 birth takes RMDs at 73, a 1960
   birth at 75, so a three-year age gap can produce a five-year tail. `dobA`/`dobB` must be
   `"YYYY-MM-DD"` **strings** (OPERATIONS §C2) — this measurement is age-keyed at its core and the
   object-shaped-date trap would silently invalidate it.
2. **Per-ladder-year hand figures** for both households — requires `targetRetireYear`,
   `spouseBWorkTaper`, the conversion-sizing rule, and the projected Traditional balance feeding the
   2038–2040 RMDs. All are source-readable without touching engine output.
3. **Dividends and realized gains.** The Roth block has no `gainByYr` in scope, so `capGain_y` has no
   value to hand-compute *from the tab's own inputs*; the hand figure must come from the household
   definition directly.
4. **CMS IRMAA thresholds** and the app's inflator, for step 5's tier-consequence count.
5. **Steps 3–5** — the three-way comparison, per-term decomposition, and tier-crossing count.

---

## 6. Decisions for Steve

**D-D (new, and it is why this stopped rather than continued).** §1(c) is load-bearing, and it is
wrong in the direction that inverts the scope's working hypothesis. Two ways forward:

- **(i) Revise the scope, then resume the measurement.** Correct §1(c), record the SS cliff as a
  measured finding, and carry on to the per-year figures. The measurement still has a job: the net
  direction is now genuinely two-sided and only arithmetic settles it. *This is my recommendation.*
- **(ii) Split the SS cliff out now as its own fix scope.** It is arguably already established — the
  statute is unambiguous, the app already contains a working implementation to call, and the defect
  is a one-expression swap at L8841–8844. Against that: the swap moves `grossTaxable`, hence the
  tab's tax, marginal rate and headroom, so it is not the tightly-bounded change the scope's §2
  census describes, and it would need its own census and extinction invariants.

I lean (i) because the measurement's remaining value is precisely the net figure, and because
shipping a fix for one term while three others sit unmeasured is how a plan gets flattered in a new
direction. But (ii) is defensible on the grounds that a $40,920 discontinuity on the shipped example
household is not really "unmeasured" any more.

**D-C is now answerable earlier than the scope expected.** The scope deferred "is the fix in the
product boundary at all" until numbers existed. For the SS term the numbers exist, and the boundary
test is clean: it makes an existing output more correct, it affects a mainstream couple within sight
of retirement, and the correct implementation is already in the file. The three omitted terms are
still undecided.

**Disclosure question.** The Field Manual's D4 disclosure was waiting on this measurement. There is
now something true and specific to write about the SS term. Whether to write it before the rest of
the measurement lands is a call I would rather you made than made silently.
