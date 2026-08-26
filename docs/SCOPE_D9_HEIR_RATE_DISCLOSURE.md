# SCOPE — D-9: `HEIR_RATE` gets a home, a pin, and an honest disclosure

| Field | Value |
|---|---|
| Status | ☑ **RETIRED — BUILT AND SHIPPED AS v5.51 on 2026-08-26.** All four decisions resolved as recommended (D-1 (a) module-level, D-2 (a) no range in-app, D-3 (a) name state tax, D-4 v5.51). Do not build from this document. What shipped is in `CHANGELOG.md` under v5.51. *(Previously: SCOPE ONLY, do not build.)* |
| Build | **v5.50** · `src/DangerClose.jsx` md5 `0bef5fc4cb1ebdaf1effffe1783bbd04` · repo `fb73d9b` · premise verified against source 2026-08-26 |
| Parent | `ASSESSMENT_HEIR_RATE.md` (2026-08-26) → proposed register entry **D-9** |
| Kind | **Disclosure + structure only.** The VALUE STAYS 0.22 — decided 2026-08-26. No figure may move |
| Gate | Parity **10/10** and the DOM diff's **STRICT branch at 32**. If either moves, the build is wrong |
| Direction | Split — **optimistic** on the estate level, conservative on the ranking. Both get disclosed |

---

## 1. Premise — verified against v5.50 source, not assumed

`HEIR_RATE = 0.22` (**L3689**) is the **only** deduction in the comparator's estate figure
(**L4251**), and that figure is the **default ranking objective** (`useState("estate")`, L5386).

Three facts, each re-verified by search rather than recalled:

1. **No provenance anywhere.** No citation or derivation in the code comment, `METHODOLOGY.md`, the
   raw Field Manual, or any audit or scope document. Both user-facing mentions state the number and
   defend nothing.
2. **It is the one tax-shaped constant outside the shared block** — declared as a bare literal at
   L3689, eleven lines below a comment reading *"All tax/IRMAA constants come from the shared
   `TAX_CONSTS` / `IRMAA_CONSTS` blocks (single source of truth)."*
3. **No suite asserts the value.** `HEIR_RATE` appears in `t1` and `t31` in **comments only**, added
   at v5.50. The constant could be changed to any number and the suite would stay green.

Realistic effective rates, computed from the app's own 2026 brackets over a ten-year drawdown:
**median 23.7%, range 13.4–31.1% federal**, 17 of 21 scenarios above 0.22, and the heir's **state
income tax is not in the figure at all**. Full working in the assessment.

> ⚠ **The value is NOT in scope.** Steve decided 2026-08-26 not to raise it. Raising it swaps one
> undocumented guess for another, moves every comparator figure, and pushes the ranking toward more
> conversion — the direction with real consequences if a user acts on it. **If a build finds itself
> arguing for a different number, that is this line firing. Stop and report.**

## 2. Site census — verified at v5.50, case-insensitively

> The v5.50 census listed 2 of 5 sites because its greps were case-sensitive. This one was run with
> `grep -in`. That is the only reason to trust it more, and it is not a large reason.

| # | Site | Now | Change |
|---|---|---|---|
| 1 | **L3689** | `const HEIR_RATE = 0.22;` inline, one-line comment | **Move** to a module-level assumption constant (see D-1) with an honest comment |
| 2 | **L4251** | `(tradA + tradB) * (1 - HEIR_RATE)` | Reference only — **arithmetic unchanged** |
| 3 | **L4252** | `heirRate: HEIR_RATE` | Reference only — unchanged |
| 4 | **L9412** | renders `{Math.round((res[0].heirRate) * 100)}% for heirs' taxes` | **No edit needed** — derived, tracks automatically |
| 5 | **L9488** | renders `{Math.round((res[0].heirRate) * 100)}% assumed heir rate` | **Append** the sensitivity clause here |
| 6 | **Field Manual** | Taxes entry names the heir discount | **Append** the same disclosure |
| 7 | **`METHODOLOGY.md` L299** | *"heirs' Traditional taxed at an assumed 22%"* | **Expand** — what it is, what it excludes, which way it errs |

**Not the fix site:** L9412's parenthetical already names the number and is space-constrained inside a
table-bearing card. Editing it duplicates L9488 two paragraphs above it.

**`BASE_GROWTH = 0.045` (L985) is the precedent** for site 1 — a module-level modelling assumption
with its own descriptive comment, deliberately outside `TAX_CONSTS`.

## 3. Tests it ships with

- **`t1` STATIC** — pin the value (`0.22`), pin its new location, and pin that the disclosure strings
  are present. This is the whole point: the constant is currently unpinned.
- **`t4_dom`** — assert the sensitivity clause renders, with **`single: false`**. Same reasoning as
  D-7: the comparator is a couple-first surface and a couple-blind fixture makes the assertion
  vacuous.
- **`t31`** — a fourth key, `heir`, so both user surfaces and `METHODOLOGY.md` must name it.
- **Negative control, mandatory.** Build the version bump **without** the copy and run `t31`; it must
  **fail**. Record the numbers. A key added to a satisfied list proves nothing.
- **An arithmetic invariant** asserting `estate === taxable + roth + trad × (1 − 0.22)` to the dollar
  on a fixture, so a future edit cannot silently change the value or the formula.

## 4. Explicitly out of scope

- **Changing the value.** Decided. See the box in §1.
- **Modelling the heir's state income tax**, or heir income, or number of heirs. That is D-9 Option 3
  (user input) and needs its own scope.
- **Estate or inheritance tax** — D-7, disclosed at v5.50, modelling declined.
- **The default objective staying `estate`.** Separate question, still unassessed.
- **The break-even's face-value treatment.** Correct as built and documented at `METHODOLOGY.md`
  L739–743; it deliberately does not apply the heir discount. Do not "make it consistent."

## 5. Verification gate

No figure may move. **Parity 10/10** and **DOM diff STRICT 32**. Moving a constant to a different
scope with the same value cannot change arithmetic — but that is a prediction, and the diff is how it
gets checked rather than asserted. If the diff reports 40, something moved and the build is wrong.

## 6. Open decisions — resolve before building

**D-1 · Where does `HEIR_RATE` live?**
&nbsp;&nbsp;(a) **Module-level assumption constant near `BASE_GROWTH`** — *recommended*
&nbsp;&nbsp;(b) Into `TAX_CONSTS`
&nbsp;&nbsp;(c) Leave at L3689, just improve the comment and pin it

> ⚠ I recommended (b) in the assessment and **that was wrong.** `TAX_CONSTS` declares itself
> *"Official 2026 figures per IRS Rev. Proc. 2025-32 (verified Jun 2026 against primary sources)."*
> `HEIR_RATE` is an assumption, not an official figure — filing it there would falsify the block's
> own header and blur the line between what is statutory and what is guessed. `BASE_GROWTH` is the
> existing precedent for exactly this kind of constant. **(a).**

**D-2 · Does the in-app copy quote the 13–31% range?**
&nbsp;&nbsp;(a) **No numeric range in-app** — say the rate is an assumption, that a heir's real rate
depends on their income and state, that state tax is excluded, and that the estate reads optimistic
if their rate is higher. `METHODOLOGY.md` carries the numbers, dated. — *recommended*
&nbsp;&nbsp;(b) Quote the range in-app too

> This is D-7's D-2 decision again. Brackets are indexed annually, so a range quoted in the app goes
> stale on a schedule and nothing in-app carries a date. `METHODOLOGY.md` is dated and revised per
> release, so numbers belong there. **(a).**

**D-3 · Does the disclosure name the state-tax omission specifically?**
&nbsp;&nbsp;(a) **Yes** — *recommended*. It is the single largest component: a typical 5% state rate
moves a $150k-AGI heir from 22.1% to 27.1%, and the app already models the *household's* state tax,
so a reader could reasonably assume the heir's is in there too. It is not.
&nbsp;&nbsp;(b) Keep it general.

**D-4 · Version.** → **v5.51** (source changes, so the four in-app sites bump).

## 7. What this does not fix — say so in the CHANGELOG

The estate figure stays **optimistic for most households**: 0.22 is below the median realistic heir
rate and excludes state tax entirely. This scope makes the assumption legible and pinned; it does not
make it right. That is deliberate, and the reason is in §1.
