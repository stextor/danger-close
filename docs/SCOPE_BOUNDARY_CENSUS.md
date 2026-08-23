# SCOPE OF WORK — the boundary census (`qa/tools/boundaries.mjs`)

**Status: FULFILLED 2026-08-23**, in the same session that wrote it. All six decisions in §8 were
answered as recommended and the work shipped as the ops package `danger-close-boundary-census`
(`qa/tools/boundaries.mjs`, `qa/tools/fixture/households.mjs`, `qa/t29_boundaries.mjs`, OPERATIONS
§K1). **This document is history, not a work item** — nothing here is outstanding.

⚠ **Where the build deviated from this scope, so the two do not disagree silently.** §4 below lists
**thirteen** rows; the shipped census has **twelve**. The dropped row is *combined SS vs the §86
convergence point*, and it was dropped on purpose: convergence depends on where the conversion
slider sits, which is not a property of a household, so including it would have blurred the tool's
contract and reached into the default-view class §7 explicitly puts out of scope. §4 is left as
written rather than quietly edited, because a scope rewritten to match its own outcome is no longer
evidence of what was decided beforehand.

Also note §2's count is the corrected one (**two** releases, not the four the v5.46 brief claimed);
OPERATIONS §K1 carries that correction forward as the live record.

**Written** 2026-08-23, immediately after the v5.46 ship, against `src/DangerClose.jsx` md5
`bfb4ea3d3140d7135f67fcc324147b6e` (v5.46, verified in the committed tree at `2d3860a`).

**Kind:** QA tooling. **No `src/` change · no version bump · no app behaviour change.** Candidate for an
ops-kind package (OPERATIONS §L, `KIND: ops`).

---

## 1. What this is

A reporting instrument, run **at scope time**, that answers one question for a defect about to be
written up: **does the shipped example household exercise the behaviour in question, or is it $0
there?** It also answers the same question of a *proposed fixture*, which is the more valuable half —
see §5.

It asserts nothing and gates nothing. It prints a table.

## 2. The failure it addresses — stated accurately

The v5.46 build brief claimed four consecutive releases whose defect was worth $0 on the example
household. **That claim is wrong, and it was repeated once in session before being checked.** From the
CHANGELOG:

| Release | Effect on the example household | What actually hid it |
|---|---|---|
| v5.42 | **Non-zero** — up to $38,030 of MAGI at lower slider positions; $0 only at the $70,000 default | the default *view* |
| v5.44 | **Non-zero** — combined no-conversion RMD $102,205 → $89,562 | nothing; visible and unnoticed |
| v5.45 | **$0** — benefits far above the <$12,000 §86(a)(1) band | a household parameter |
| v5.46 | **$0** — B claims January of the ladder's first year | a household parameter |

So the real streak is **two**, and only those two are the failure this tool addresses. The v5.42 and
v5.44 cases are different problems (a default view that hides a range; a visible defect nobody looked
for) and this tool does not claim to catch them.

Two is still worth acting on, because the cost is concrete: in both cases the $0 property was
discovered **mid-build**, after the brief had been written, and in both cases the brief carried the
line "expected figures NOT derived — the fixture is the work."

## 3. Premise, verified against source

Measured this session, not assumed:

- Every numeric threshold the census needs is **readable live through the test shim**, so the tool need
  not hold its own copy of any constant: `TAX_CONSTS()` exposes `SS_THR1_SGL/MFJ` (25,000 / 32,000) and
  `SS_THR2_SGL/MFJ` (34,000 / 44,000); `IRMAA_CONSTS()` exposes the bracket sets; `rmdStartAge` is
  exported as a function and returns 73 for 1959 and 75 for 1960.
- `buildPlanTimeline()`, `PORTFOLIO()`, `getSSA()`, `getSSB()` are all reachable **without mounting the
  DOM**. A working prototype ran in **~5 seconds**.
- This matters because it removes the drift risk that has bitten this project repeatedly: a tool that
  reads the app's own constants cannot disagree with the app about what a threshold is.

The structural questions — is the DOB month January, does B's claim year equal the ladder start — are
**relationships between fields, not constants**, and have no source of truth to read. They are the part
that must be written down, and therefore the part that can go stale. §8 D-1 is about that.

## 4. What it measures (the initial boundary list)

Each row is a parameter, the boundary it could sit on, and whether the household is **on** it.
Prototype output against the v5.46 example household, verbatim:

| Parameter | Example value | Boundary | Verdict |
|---|---|---|---|
| filing status | married filing jointly | single vs MFJ | **MFJ only** — single path unexercised |
| dobA month | 1 | 1 = January | **degenerate** — partial-month math is a no-op |
| dobB month | 1 | 1 = January | **degenerate** — partial-month math is a no-op |
| A birth year | 1964 | <1960 → RMD 73, ≥1960 → 75 | only the 75 branch |
| B birth year | 1966 | same | only the 75 branch |
| A claim year | 2031 | ladder start 2029 | mid-ladder — gate exercised |
| B claim year | 2029 | ladder start 2029 | **degenerate** — equals ladder start |
| A benefits/yr | $39,600 | §86(a)(1) ½-cap band <$12,000 | **outside** — ½ cap unreachable |
| B benefits/yr | $15,600 | same | **outside** — ½ cap unreachable |
| combined SS | $55,200 | §86 convergence ≈ $92,141 provisional | above convergence at the default slider |
| state tax rate | unset | 0 vs non-zero | **zero** — state-tax path muted |
| income streams | 0 | >0 exercises stream code | **none** — stream paths unexercised |
| ladder span | 2029–2040 | A ends 2038, B ends 2040 | windows differ — per-spouse split exercised |

Seven of thirteen sit on a boundary. Two of them are exactly the ones that hid v5.45 and v5.46.

## 5. The second use, which is the stronger argument

Point it at a **proposed fixture** and it says whether that fixture actually clears the boundary it was
built for.

This is not hypothetical. The v5.46 fixture (spouse B delaying to 70) exercised the claim gate across
seven years and looked complete — but B claimed in **January**, so a pro-rata gate and a whole-year gate
produced identical figures and the release's actual modelling decision (D-2a) would have shipped
**unverified**. That was caught by reasoning about the DOB month mid-build, not by any instrument. A
second fixture with a July claim was then needed. The census would have flagged `dobB month = 1` on the
proposed fixture before a line of test code was written.

## 6. Site census — what it touches

| Touched | How |
|---|---|
| `src/DangerClose.jsx` | **nothing.** Read-only, through the shim |
| `qa/tools/boundaries.mjs` | new file |
| `qa/tools/fixture/` | new fixture portfolios — **not** `fixture.jsx`, whose line numbers are load-bearing (§B1) |
| `qa/t21_tools.mjs` | extended, or a sibling suite — see D-5 |
| `OPERATIONS.md` | one new subsection: when to run it, and the maintenance rule (D-6) |

No suite's expectations change. No app total moves. Per §B1 the tool lives in `qa/tools/` and is
**countable as zero checks**.

## 7. Out of scope

Changing the shipped example household (declined — the example data's job is to be a plausible demo,
and a household chosen to sit off every boundary is by construction less representative; conflating
"demo" with "fixture" is what produced this) · a standing adversarial fixture library (option B —
deferred until the census shows which boundaries recur) · anything that gates a release · the v5.42
default-view problem and the v5.44 nobody-looked problem, neither of which this catches · any
`src/` change.

## 8. Open decisions — ALL BLOCK

**D-1 — where does the structural boundary list live, and how is it kept honest?** The numeric side reads
live from `TAX_CONSTS`/`IRMAA_CONSTS` and cannot drift. The structural relationships have no source of
truth and must be written down. *Recommendation:* keep them in the tool, and pair them with a
maintenance rule (D-6) rather than trying to derive them — a wrong derivation is worse than a stale list
you are reminded to extend.

**D-2 — tool or suite?** A tool prints and asserts nothing (§B1); a suite would assert "the example
household still sits on these boundaries" and fail when it stops. *Recommendation:* **tool**, per §K's
nudge-never-gate precedent. But note the trade-off honestly: nothing then notices if the example
household changes and silently starts covering a boundary it used to miss.

**D-3 — does it take a portfolio argument?** *Recommendation:* yes, defaulting to the example
household, because §5 is the stronger use and needs it.

**D-4 — output format.** Human table, machine-readable, or both? *Recommendation:* both — table by
default, `--json` so a build brief can embed the verdict rather than paraphrase it.

**D-5 — how is it tested?** §B1 established that these tools are themselves tested, and that an
unexpected result is a finding *only when `t21` is green*. A boundary census operates on portfolios, not
on source text, so it cannot use `fixture.jsx`. It needs its own synthetic portfolios with known
boundary positions, and negative controls that **fire** — a census that reports "not on the boundary"
for a household built to sit exactly on it is the failure mode. *Open:* extend `t21` or add `t29`.

**D-6 — the maintenance rule, and where it is recorded.** The list only stays useful if it grows.
*Proposed rule:* when a release fixes a defect that was invisible in the example data, the boundary that
hid it is added to the census in the same release. *Open:* is that an OPERATIONS subsection, a line in
the release checklist (§I), or both? Recording it twice is exactly the drift pattern the project
instructions warn about, so it should live in **one** place and be referenced from the other.

## 9. Definition of done

Tool in `qa/tools/`, reading every numeric threshold live · takes a portfolio, defaults to the example
household · table and machine-readable output · its own fixture portfolios with negative controls that
fire · `t21` (or `t29`) green, counted in no app total · one OPERATIONS subsection carrying the
maintenance rule, referenced not duplicated · ops-kind package, `package_check` clean.

**Not done until the census has been run against a household it should FAIL to clear**, and said so.
