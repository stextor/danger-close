# SCOPE — Kentucky's 2026 rate, and the Delaware HB 108 question

| Field | Value |
|---|---|
| Premise verified against | **v5.56** · source `b191cc577646faa138ffc6149a0aa646` · tree `d588380` |
| Written | 2026-08-31 |
| Origin | `AUDIT_STATE_EXCL65_ROUND2.md` §1 and §2 — two facts the audit flagged UNRESOLVED and recorded no verdict on; §5 names DE first for the next round |
| Shape | **Modelling change for Kentucky. Figures move DOWN.** Delaware needs no source change. Version bump. |
| Status | **RETIRED — SHIPPED AS v5.57, 2026-08-31** |

> ## ⛔ RETIRED — SHIPPED AS v5.57, 2026-08-31 · source `0daebb4af466b9095db79117daefcd32`
>
> All five decisions resolved as recommended and built. **D-1** Kentucky's rate `0.04 → 0.035`.
> **D-2** the effective year and the enacting act carried in Kentucky's own note, with a test that
> the note and the constant agree. **D-3** the three moved pins gated on the VERSION TAG, not on a
> rate read back from the app. **D-4** Delaware's military-pension rule disclosed with no amount
> asserted. **D-5** recorded in the CHANGELOG and resolved in place in
> `AUDIT_STATE_EXCL65_ROUND2.md`.
>
> **What this scope did not anticipate, and a negative control found:** the rate extinction check
> was **vacuous through the helper**. `T` compares with `EPS = $0.01`; a rate differs by 0.005, so
> the assertion covering this release's entire point passed against a reverted 4% build. Now a
> boolean identity. §8 named three falsifiers and none of them fired — this was a fourth nobody
> listed, and it was caught only because the control was actually run.

**Baseline confirmed by command this session:** **2,832 app checks / 0 failing** (v5.55 leg 1,067 ·
v5.56 leg 1,085 · parity 10/10 · feature once 670); tooling 82; GRAND 2,914. Run from a clean clone
of `d588380` plus the prior source. `smoke_built` 16/16 against the committed `index.html`
`14a20fe9efc70cf65e1a46f4820d69e8`.

---

## 1 · Both questions are now RESOLVED against primary sources

The audit deliberately recorded no verdict on either. Both are settled here, and they resolve in
**opposite directions** — which is the finding that shapes this scope.

### 1a · Kentucky — the modelled rate is STALE. This is a real defect.

| | |
|---|---|
| **Primary source** | KY LRC record, 2025 Regular Session, **HB 1** · `apps.legislature.ky.gov/record/25rs/hb1.html` |
| **Status** | **02/06/25 — signed by Governor, Acts Ch. 1.** Passed House 90–7, Senate 34–3 |
| **Enacted summary, verbatim from the LRC record** | *Reduces the individual income tax rate from four percent to 3.5 percent for taxable years beginning on or after January 1, 2026* |
| **Statute amended** | KRS 141.020 |
| **Model holds** | `KY: { rate: 0.04 }` at L1046 |
| **Correct for 2026** | `0.035` |

The Round-2 audit could not resolve this because **the KY DOR's own Individual Income Tax page still
read "four (4) percent"** — the audit noted that page also still cited the IRC as of 31 Dec 2024 and
was probably not updated for TY2026. That guess was right. The DOR page was stale; the statute is
not.

**Direction: figures move DOWN.** The model charges 4% where the law says 3.5%, so it **overstates**
Kentucky state tax by an eighth. Conservative, and wrong — the same shape as v5.55's KY age gate,
and the same argument applies: the app's state caption claims *2026 approx*, and 2026 is exactly the
year the rate changed.

⚠ **A rate reduction is not a one-off.** HB 1 also continues an annual trigger process under which
the General Assembly may cut the rate again for TY2027 and onward, toward zero. Whatever this
release does will be stale again. That is decision **D-2**.

### 1b · Delaware — HB 108 was NEVER ENACTED. The modelled figure is correct.

| | |
|---|---|
| **Primary source** | Delaware General Assembly Bill Detail, HB 108, 153rd GA · `legis.delaware.gov/BillDetail?LegislationId=142071` |
| **Status** | **House Revenue & Finance 4/8/25** — introduced, assigned to committee, and never moved |
| **Volume:Chapter** | **N/A** | 
| **Governor's Advisory Number** | **N/A** |
| **Effective Date** | **N/A** |
| **Amendments / Committee Reports / Roll Calls / Actions History** | **all empty** |

The audit called this *"the single largest proportional error found in either audit round"* **if
enacted**. It was not enacted. The model's `excl65: 12500` for the 60+ eligible-retirement-income
exclusion is **CORRECT**, and Delaware needs no source change.

⚠ **One genuinely open Delaware thread, and it is a different exclusion.** Separate legislation
(SB 201, and a later SB 219 reported in July 2026 as awaiting the Governor) phases in an increased
exclusion for **United States military pensions** — reported at $20,000 for TY2025 and $25,000 for
TY2026, regardless of age. **I did not resolve the enactment status of either military-pension bill
and am recording no verdict on them.** They do not touch the general 60+ exclusion this model uses.
The model has no military-pension concept at all, so this is a disclosure question, not a modelling
one — decision **D-4**.

---

## 2 · Site census — parser output, not grep

`census.cjs` against `v5.56` source:

```
KY  1 AST hit   L1046  objkey  <module>   rate: 0.04, excl65: 31110, exclAge: 0
DE  1 AST hit   L1036  objkey  <module>   rate: 0.055, excl65: 12500, exclAge: 60
```

One definition site each. No other reference resolves to either state — the rate is read generically
through `stateTaxAnnual`'s `r.rate`, so **the source change is one number.**

### The suite literals that move — AST literal scan across `qa/` and `qa/tools/`

| Site | Literal | Now | After |
|---|---|---|---|
| `t10_taxcases.mjs:615` | `1511.20` | `AGE("KY", 60, 60)` | **`1322.30`** |
| `t10_taxcases.mjs:617` | `1511.20` | `AGE("KY", 45, 45)` | **`1322.30`** |
| `t10_taxcases.mjs:674` | `0.04 * 100000` | pre-v5.55 KNOWN DEFECT pin | **`0.035 * 100000`** |

Derived by hand and confirmed against the engine: exclusion `31,110 × 2 = 62,220`; base
`100,000 − 62,220 = 37,780`; `37,780 × 0.035 = 1,322.30`.

**Nothing else moves.** `t10:595` and `t10:677` carry `0.055` and are Delaware — untouched.
`t1_units.mjs:203` uses `fallbackRate: 0.04` for a **null** state code, which is a fallback-path
test unrelated to Kentucky. `t3_roth.mjs:41` and `probe_withhold_gain.mjs:16` set `stateRate: 0.04`
on a **Georgia** fixture. `t24:316` uses `12500` as a §86 benefit amount, not a Delaware cap.

⚠ **`t10:674` is a `[KNOWN DEFECT pre-v5.55]` pin on the FROZEN leg.** It asserts what v5.54 did.
Changing the constant changes that leg's answer too, because the frozen leg runs the *current* suite
against the *old* source — and the old source will still hold `0.04`. **This pin must be gated to
the rate, not to the version**, or read the rate from the app rather than restating it. Getting this
wrong is how a frozen leg stops replaying green (OPERATIONS §B2). That is decision **D-3**.

---

## 3 · What this release ships

- **`STATE_RULES.KY.rate`** `0.04 → 0.035`, one constant at L1036–1046.
- **KY's note** gains the year the rate belongs to, so the next reader can see staleness without
  re-deriving it.
- **Field Manual §13 and `METHODOLOGY.md`** — the Delaware finding is worth stating: an audit flagged
  a possible 2× error, it was checked against the legislature, and it was not real.
- **Four version sites**, 62 gated expressions, 15 registries, three `t31` version lists.
- **`t10` §2E** — the three pins above, gated.
- **No Delaware source change.**

## 4 · Tests

- The three moved pins, gated so both legs assert their own build's truth.
- **An extinction invariant on the rate's provenance:** KY's rate must equal a value the note also
  names, so a future rate cut cannot move one without the other. This is the class that produced
  this defect — a constant and a caption drifting apart with nothing comparing them, the same shape
  as v5.55's *"the note is right and the code is wrong."*
- **A negative control per change**, run before the release is called done: reverting the rate must
  fail `t10`; reverting the note must fail whatever asserts it. v5.56 shipped with three controls
  that did not fire and the suite green, which is why this is written down before the build.
- **The §B1a copy sweep** (`qa/tools/copylock.cjs`) run against the pre/post sources, because this
  release rewrites a state note and Field Manual copy.

## 5 · Explicitly OUT of scope

- **Delaware's military-pension exclusion** — a class the model does not represent (D-4 decides
  whether to disclose it).
- **Kentucky's Schedule P** additional exclusion for government retirees with pre-1998 service.
  Named in the Round-2 audit, out of scope for a flat model.
- **The 11 unverified states**, and RI / SC / MT, which the audit ranks next.
- **Maine's phaseout and the NJ/VA/RI income limits** — one shared mechanism, its own scope.
- **Colorado's shared cap**, **NJ's two axes**, **Railroad Retirement**.
- **Any general rate-freshness mechanism** beyond what D-2 decides.

## 6 · Direction and disclosure

| | |
|---|---|
| **Kentucky** | Figures move **DOWN**. The model overstated KY state tax. Correcting it makes affected plans look slightly better — against the app's conservative default, by explicit decision, exactly as v5.55 decided for the same state |
| **Delaware** | Nothing moves |
| **Parity** | Must stay **10/10**. A `STATE_RULES` constant is read by all engines, so a drop means one engine diverged — a stop, not a rebaseline |

## 7 · DECISIONS FOR STEVE — build starts after these

**D-1 · Ship the Kentucky rate correction at all?**
It moves figures in the optimistic direction and Kentucky is one of 51 jurisdictions in an
admittedly approximate module. **Recommend: YES.** The rate is verifiably wrong for the year the app
says it models, v5.55 already set the precedent for this exact state, and "conservative" is not a
defence for a number the statute contradicts.

**D-2 · How to handle the fact that this will go stale again.**
HB 1 continues an annual trigger toward 0%. Options: (a) fix the number and say nothing; (b) fix it
and put the effective year in the note, so the next reader sees the vintage; (c) build a general
per-state rate-vintage field. **Recommend (b)** — (a) reproduces the defect, and (c) is a real
feature that should not ride along inside a two-constant fix.

**D-3 · How to keep the frozen leg honest at `t10:674`.**
That pin asserts pre-v5.55 behaviour using the literal `0.04`. Options: (a) gate it on the version
tag like the others; (b) read the rate from `STATE_RULES` so it follows whatever the build holds.
**Recommend (a)** — (b) is self-referential and would pass against a wrong rate, which is precisely
the vacuity §B2 warns about.

**D-4 · Disclose Delaware's military-pension exclusion?**
The model has no military-pension concept, and I did not establish whether SB 201 / SB 219 are
enacted. Options: (a) say nothing; (b) disclose that military pensions are excluded differently and
are not modelled, without asserting an amount; (c) resolve the bills first and then disclose.
**Recommend (b)** — it is true regardless of how those bills landed, and it does not put an
unverified figure in front of a user.

**D-5 · Record the Delaware non-finding, and where?**
HB 108 was the top item on the audit's own next-round list and the answer is "not law." Options:
(a) CHANGELOG only; (b) CHANGELOG plus an update to `AUDIT_STATE_EXCL65_ROUND2.md` §2 resolving its
own ⚠; (c) a new audit round-3 document. **Recommend (b)** — the flag lives in that file, and a
resolved flag left standing is how this project acquires a second answer that drifts.

---

## 8 · What could falsify this scope's premise mid-build

Named in advance, per the ground rule that mid-build contradiction is a STOP rather than an adaptation:

- **The KY rate is not `0.04` in the source when the build starts.** Census says L1046 today; if it
  has moved, re-run the census before touching anything.
- **`AGE("KY", …)` does not produce `1511.20` on the unmodified build.** The suite is green at that
  value today; if it is not, the harness has changed and the derivation above is void.
- **Parity drops below 10/10.** Stop. A shared constant cannot move one engine and not another.
- **A KY rate change after 2026-08-31.** The TY2027 trigger runs on a report due 1 September 2025 and
  a General Assembly action in the 2026 session. Re-check the LRC record at build time rather than
  trusting this document's date.
