# STOP REPORT — v5.37 session 1: the E-17 dob correction is incompatible with gates 2–3

**Status: STOPPED at the end of build step 1 (simulator first), before any engine edit.**
Zero source changes were made — the workspace still hashes `b7396c1c14861dc149b71e8edb1a00d5`
(shipped v5.36). One decision is needed from Steve (§5); everything else is ready to resume.

**Base, reproduced clone-alone from `3842cee` before any work (per the session brief):**
current leg **600** (t1 94 · t2 18 · t3 36 · t4 210 · t5 58 · t6 21 · t10 163) · prior leg **588**
(t1 93 · t4 199, rest identical) · parity **9/9 strict** · feature **651** (t7 41 · t8 38 · t9 14 ·
t11 40 · t12 23 · t13 42 · t14 44 · t15 11 · t16 24 · t17 74 · t18 67 · t19 57 · t20 99 · t22 77)
— **APP TOTAL 1260** · t21 50 · domdiff 26/26 (v535→v536) · all ten script controls fire (C1–C9,
C12; C10/C11 verified at the domdiff layer). Scope hash verified `60304fa40e7a344e03ef264e82203f1a`.

---

## 1 · The instrument, and its validation record

Per build step 1, an independent simulator (`qa/sim_v537_probe.mjs`, session scratch) re-implements
Engine D's whole taxable-sleeve ledger — `taxRmdA/B`, `taxOrd`, `taxGainPool`, `gainBasis`,
`othOrdDraw`, `capGain_y` — year by year, with its **own** copy of the IRS Uniform Lifetime
divisors (Pub 590-B) and SECURE 2.0 start ages. It takes from the engine only the per-year
mechanical series (`drawFromTaxable`, `rmd_y`, `drawNeeded`, published `taxable`), which the §2
census proves the v5.37 edit cannot move.

**Validation: on all nine household runs** (t20's E2 households × four tax types, under both dob
shapes, plus t19's mixed pool) **the simulator reproduces the shipped v5.36 engine with worst
per-year |Δ| = $0.00** on `taxable`, `taxGainPool`, `capGain_y`, and `taxBasis`, with zero
derivation anomalies, and it reproduces t20's two pinned lifetime invariants exactly
(annuity−taxable ordinary excess 600000.000000; trad−annuity 0.000000). The ledger model is
faithful; the Option A projections below are trustworthy.

## 2 · Finding A — the blast radius is smaller than scope §5 predicts (measured, favourable)

AST census (`qa/tools/census.cjs`, t21 green at 50): `taxOrd` has exactly four hits, all inside
`computeWithdrawalPlan`, and its only consumers are `_ordFrac → othOrdDraw → {its own depletion,
magi}`. **`taxOrd` is write-only into MAGI.** The gains sub-pool, every balance, every draw, and
`capGain_y` are unreachable from it. Confirmed by simulation: the t19 mixed pool's lifetime gain
is **$89,673.45 under both semantics — unchanged**; scope §5's claim that the hand-computed sale,
sub-pool balances, and "$215,216 lifetime gain" move is falsified, as is its claim that the
Taxes/IRMAA tabs move "through the v5.36 call sites" — those call sites carry `capGain_y`, which
cannot move, so **Engines A/B/C outputs and the Taxes/IRMAA tabs are byte-identical by
construction**. What DOES move: Engine D's `othOrdDraw`, `magi`, and the derived `bracket` — and
the Withdrawal tab renders `r.bracket` per row, so at v5.37 the *Withdrawal* tab is the tab that
can move. This is the exact inverse of the brief's step-5 domdiff expectation, which the brief
itself flagged to measure rather than assume. The mixed household's lifetime MAGI movement under
Option A: othOrdDraw $193,834.16 → $223,908.64 (**+$30,074.48**).

## 3 · Finding B — Option A passes its gates exactly, where the gates are meaningful

On the household t20's E2 block actually runs today (the fixture's object dobs are ignored;
the engine runs the defaults, dob 1964-01-01 / 1966-01-01, 32-year plan, `growth.tax` 0.03449),
the simulator projects Option A (`taxOrd = min(taxable − taxGainPool, taxOrd × (1 + growth.tax))`,
at the `taxGainPool` growth point):

| Invariant | v5.36 (validated) | v5.37 Option A (projected) |
|---|---|---|
| annuity − taxable lifetime ordinary excess | 600,000.000000 (the E-15 pin) | **724,266.004427** — the balance plus $124,266.00 of growth now recognised |
| trad − annuity lifetime ordinary excess | 0.000000 | **0.000000** — gate 2 HOLDS, to six decimals |
| sleeve-RMD reservation ($102 residual GONE) | exact | **exact** (same figure as above) |
| conservation `taxOrd + taxGainPool ≤ taxable` | — | **holds with signed max 0.000000** on every ordinary-bearing household (negative slack elsewhere = the HSA remainder, by design) |
| §8-3 cap binding | — | **zero binding years on any household** — decision 3's "rarely, by rounding" expectation confirmed as *never* |

The scope's §6-2 invariant (*ordinary excess > opening balance*) holds; the E-15 exact-$600,000
form is extinguished. **The design is validated. The §8-1 fallback to Option B is NOT indicated**
— nothing below is a guard or simulator-disagreement problem, and Option B would exhibit the
identical behaviour in §4.

## 4 · Finding C — THE BLOCKER: decision 2's dob values break gates 2–3 on the unchanged engine

Step 2 as ratified converts t20's object dobs to the strings they declare: `"1962-06-01"` /
`"1964-06-01"`. Measured against the **unchanged v5.36 engine**, that household (RMDs from 2037,
30-year plan) does not exhaust its Priority-1 pool within the horizon — lifetime
`drawFromTaxable` is $560,678.32 against a $600,000 ordinary balance — and both pinned exacts
fail **before any engine change exists to blame**:

| Household | ann − tax ordinary excess | trad − ann ordinary excess |
|---|---|---|
| as run today (defaults, exhaustion regime) — v5.36 | 600,000.00 ✓ | 0.00 ✓ |
| as run today — v5.37 Option A | 724,266.00 | **0.00 ✓ (gate holds)** |
| dob strings 1962/1964 — **v5.36, unchanged engine** | **457,490.05 ✗** | **135,282.13 ✗** |
| dob strings 1962/1964 — v5.37 Option A | 560,582.90 | 94,059.77 |

The mechanism, and why the nonzero figures are *correct behaviour*, not a defect: the exact-0
invariant states that every ordinary dollar is taxed once **on its way out**. Dollars still in
the pool at the horizon are recognised by neither household — and the trad row's RMD forces
recognition inside the horizon that the annuity legitimately defers beyond it. Exact equality is
a property of the full-exhaustion regime only. The 1962/1964 household is outside that regime,
so the invariant the gates protect is undefined there, in both semantics.

So two ratified items collide: decision 2's specific dob values, and gates 2–3 ("must HOLD
exactly 0"; "$102-residual-GONE stays exact"). Per the brief — stop, don't adapt.

## 5 · The decision needed, with a recommendation

**Option (b) — recommended: close E-17 by making the fixture *declare the household it runs*.**
Convert the object dobs to the strings `"1964-01-01"` / `"1966-01-01"` — measured **byte-identical
engine schedules** to today's object-dob run, so step 2's recorded delta is exactly zero, with
proof rather than assumption. E-17's substance (an honest fixture; the silent-ignore trap dead in
t20) closes fully; the exact invariants stay meaningful and Option A preserves them to six
decimals; the step-3 engine delta has one cause. t7 (the other carrier) gets the same treatment,
measured the same way. The fixture's warning comment inverts to a statement of what was done.

**Option (a) — keep 1962/1964 and rewrite the E2 invariants regime-aware.** More literal to
decision 2's wording, but it amends gates 2–3, needs a new invariant set ratified (exact-0
asserted only on an exhaustion-regime sub-fixture; new deferral-regime assertions with the
figures above), and lands two figure movements where the scope promised single-cause deltas.

Not recommended in any form: reshaping balances/expenses so the 1962/1964 household exhausts —
that tunes the household to save an assertion.

## 6 · What remains (unchanged once decided)

Build steps 2–7 as briefed, with two measurement-driven amendments to carry: the domdiff re-scope
inverts (Taxes/IRMAA sections re-witness *strict identity*; the Withdrawal tab's bracket/MAGI
regions become the divergence witness — anchored per E-20), and scope §5's t19 re-derivation
records the gains figures as *unchanged* with the census as the reason. The conservation
invariant lands in t19 in its one-sided form (`taxOrd + taxGainPool ≤ taxable + ε`, binding
years reported). New exacts to pin, from §3: annuity excess 724,266 (to the dollar), growth
recognised 124,266, trad−annuity exactly 0, mixed-pool othOrdDraw 223,908.64 — all to be
re-derived against the final fixtures and matched by the engine to the dollar or STOP.

## 7 · Pool-hygiene findings from the freshness check (for the next refresh, non-blocking)

1. The pool's `domdiff_withdrawal.mjs` is the **stale v533→v534 edition** (`dc48d0c2…`); the repo
   carries the correct v5.36 file (`184b826b…`). Delete the stale copy at refresh.
2. The pool holds a third source, `DangerClose-v5_36-WIP.jsx` (`c5d9253c…`) — the documented
   session-1 intermediate, violating the two-source rotation. Delete at refresh.
3. `qa/t4_dom.mjs` duplicate confirmed present and content-identical to `qa/qa-baseline/t4_dom.mjs`
   (`6056840e…` both) — `git rm` rides with this release as planned.

## 8 · Honesty notes

Every figure above was parsed from suite, simulator, census, or `md5sum` output — none restated
from memory. The simulator was validated against the shipped engine to the cent on nine
households before any projection was trusted. No engine, test, or doc edits were made; the stop
is at the cheapest possible point, with the instrument delivered so the resumed session re-runs
rather than re-derives. Scope §5's blast-radius predictions were partially falsified by
measurement (§2) — recorded here and to be carried into the release record, not corrected
silently.
