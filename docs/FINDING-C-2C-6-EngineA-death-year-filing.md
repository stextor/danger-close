# FINDING C-2C-6 — Engine A (Roth strategy comparator) files Single for the whole year of death

**Status: CLOSED — fixed and shipped at v5.14.** Extinction invariant:
`t15_engineA_death_filing.mjs` (dollar-exact, 11 checks; negative-controlled against v5.13, where it
fails 8 of 11). The code path was read from canonical source and the dollar effect measured
dollar-exact, not inferred — Engine A is module-level, so the ±$500 render ceiling does not apply.

> **Outcome written back 2026-08-09, at the release that fixed it.** C-2C-4 sat marked *provisional /
> HIGH* for a full release after being fixed, because its closure lived only in the scope document
> that resolved it. Recording the outcome on the finding itself is now part of retiring a scope, and
> this note is that practice applied.
>
> What v5.14 changed: Engine A's single `widowed` flag was split into a death-event flag (`>=`) and a
> filing flag (`>`), matching Engines B and C; its IRMAA block now reads the **lookback** year's
> filing status and counts people by **premium-year** survival (both matching Engine C); and
> `t14_cross_engine_survivor.mjs` gained the filing-timing assertion whose absence let this defect
> exist at all — §5 below specified it, and against v5.13 it now fails on exactly one engine.
>
> **One thing §3 got incomplete.** It listed the IRMAA-side effect as unquantified. Scoping measured
> it: the IRMAA half runs conservative below ~$500K MAGI but **non-conservative above it**, because
> filing Single halves the person count faster than it narrows the thresholds once both statuses reach
> the top tier (−$5,780 at $700K, −$6,940 at $1.2M). Net stayed conservative at every level measured,
> since the income-tax over-charge dominates. `t15` case 4 pins that corner.

**Build:** v5.13 · `src/DangerClose.jsx` md5 `0ed9e140cd9163e4523d8ff71959d56c`
**Date:** 2026-08-09 · **Class:** first-death survivor modeling (C-2C series)
**Related:** `FlawsToFix-v5_10_2-Phase2C.md` (C-2C-1, the identical defect in Engine B, fixed at v5.12);
`SCOPE_ADDENDUM_D6_EngineC_design.md` §5 (decision D-7, which asked this exact question about two
engines and did not ask it about the third)

---

## 0. A correction I owe first

The v5.13 knowledge refresh states, as open item 1 of `PROJECT_KNOWLEDGE_INDEX.md`:

> **The first-death defect class is CLOSED.** … every engine now models the first death in Social
> Security.

**That claim is wrong, and I wrote it.** The sentence is true about the *Social Security* half and I
generalized it into a claim about the whole class. Engine A models the SS half correctly and the
**filing-status half incorrectly** — it switches a year too early, which is precisely the defect
C-2C-1 identified in Engine B and which v5.12 corrected there.

This is the same generalizing failure that concealed C-2C-3: describing a correct model as though
every engine implemented it. It is worth recording that the pattern recurred immediately after being
documented as a hazard, in a document written by the person who documented it.

---

## 1. What the code does

`runRothStrategies` uses **one** flag where Engines B and C now use two (L3375–3376):

```js
const widowed = !P.single && yr >= P.deathYr1;
const effSingle = P.single || widowed;          // brackets, standard deduction, senior deduction,
                                                // SS provisional thresholds, LTCG brackets, IRMAA
```

`effSingle` drives the bracket table, the standard deduction, the senior deduction, both Social
Security provisional-income thresholds, the LTCG brackets, and the IRMAA tier table and person
count — all of them from the **year of death itself**.

Engines B and C separate the two concerns (L8167–8168 and L8663–8664):

```js
const widowed       = !_single && yr >= _deathYr1;   // death event: SS drops, IRA rolls over
const filingSingle  = !_single && yr >  _deathYr1;   // Pub. 501: joint return allowed FOR the death year
```

**Engine A's Social Security survivor rule is correct** (L3381, the same larger-check block as
Engines B and C) and is bound to `widowed`, which is the right flag for it. Only the filing status is
misdated. That is why `t14_cross_engine_survivor.mjs` passes on Engine A: it asserts the SS rule, and
the SS rule is right. **t14 does not assert filing-status timing, which is the gap this finding
exposes** — see §5.

---

## 2. Primary source

IRS Pub. 501: a surviving spouse is treated as married for the **entire** year in which the spouse
died and may generally file a joint return for that year; Single filing begins the following year.
(Qualifying Surviving Spouse extends joint *rates* further but requires a dependent child, which this
app's population generally lacks and which the app does not model — unchanged from v5.12's reasoning.)

Engine A therefore applies Single a full year before the law does.

---

## 3. Direction and magnitude — EXECUTED, dollar-exact

Isolation: Social Security set to $0 and Traditional balances to $0, so neither the SS survivor rule
nor the spousal rollover can move the result; a single-year horizon at the death year; pension-only
income. The only difference between the two runs is whether year 2044 is treated as Single or MFJ.

| Pension (annual) | Engine A, 2044 = death year | Engine A, both alive | Over-tax |
|---|---|---|---|
| $100,000 | $8,744 | $5,207 | **+$3,537** |
| $150,000 | $19,744 | $11,207 | **+$8,537** |
| $200,000 | $31,207 | $17,740 | **+$13,467** |
| $300,000 | $55,207 | $39,740 | **+$15,467** |

**Direction: CONSERVATIVE** — the model over-taxes the death year, exactly as Engine B did before
v5.12. The magnitude is one year's worth of the widow's penalty, and it is not small: on a mainstream
household it is thousands of dollars, and it rises with income until the brackets converge.

Note the figures are the *whole* difference between filing statuses in that year, which is the right
comparison here because the correct treatment is the MFJ column.

---

## 4. Why it is a finding rather than a disclosed approximation

Three tests, all failed:

1. **Undisclosed.** METHODOLOGY's "The year of death (v5.12)" section states that "two things happen
   at different times, and **the model** now separates them" — with no engine qualification. The
   engine-coverage table in the same section lists the Roth strategy comparator as "Filing switches:
   yes," which is true but silent about the timing being a year off. A reader is told the app
   implements the Pub. 501 rule; one engine does not.
2. **Cross-engine divergence.** For the same household in the same year, Engine A reports Single and
   Engines B and C report MFJ. That is the D-3 audit condition, and it was *created* by the v5.12 and
   v5.13 corrections — the app was internally consistent (and consistently wrong) before them.
3. **It reaches user-visible output.** Engine A drives the Roth strategy comparator, the 25-cell
   solve-for grid, and the **widow-year tax** ranking objective specifically. A death-year tax that is
   too high by thousands feeds directly into a ranking the app presents as "the model's best cell."

---

## 5. A gap in t14, and how to close it

`t14_cross_engine_survivor.mjs` was built at v5.13 as the class-level invariant and it did not catch
this, because it asserts the *Social Security* survivor rule across the four engines and nothing else.
The obvious strengthening, which should ship with the fix:

- Assert every engine that has a filing concept separates `widowed` from `filingSingle` — structurally
  (two distinct flags, one `>=` and one `>`) and behaviourally where reachable.
- Engine A is module-level, so its half can be **dollar-exact**: the isolation in §3 is already a
  working test fixture and needs only to be turned into assertions.

That is a strictly better invariant than the one shipped, and this finding is the evidence for why.

---

## 6. Recommended handling

**Fix, do not disclose.** The disclosure route would require METHODOLOGY to say the app applies two
different filing rules to the same year depending on which tab you open, which is not a statement a
reader can use. The fix is the same two-line split already applied twice, in an engine whose test
harness reaches it dollar-exact — the cheapest of the three C-2C filing corrections, not the dearest.

**Sequencing caution.** Engine A's IRMAA block reads `effSingle` for both its thresholds and its
person count, so splitting the flag changes IRMAA figures as well as income tax. That interacts with
F-2B-1 / F-2B-2, which also live in Engine A's tier loop (L3555). Whichever ships second must
re-verify the first's assertions — the same coupling warning that has now fired three times in this
engine's neighbourhood.

---

## 7. Honesty statement

Every code claim was read from the canonical v5.13 source this session. The figures in §3 were
**executed** against `runRothStrategies` through the test shim and are dollar-exact, not rendered and
not inferred. What is **not** established here: the downstream effect on the strategy comparator's
*ranking* (whether the over-taxed death year ever changes which strategy wins) is unmeasured, and the
IRMAA-side effect of `effSingle` in the death year is identified but not quantified.
