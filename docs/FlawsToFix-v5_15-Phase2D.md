# FlawsToFix — v5.15 · Phase 2D — REVISION 3

**Supersedes revisions 1 and 2.** Both stated finding mechanisms incorrectly. §1 records both errors
and the reason they happened, because it is the same reason twice.

**Build audited:** v5.15 · `src/DangerClose.jsx` md5 `f915dd8c71142bcf16aeb00a6d56c403` (commit `25ab61b`)
**Date:** 2026-08-09 · **Mode:** findings-only. Fixes deferred to a combined release; Option B chosen.

---

## 1. TWO CORRECTIONS, AND THE PATTERN BEHIND THEM

**Revision 1 said** the HSA falls into the taxable residual and is treated as a taxable brokerage
account. Wrong: the residual reduces over `positions`, and the HSA is in `otherAccounts`.

**Revision 2 said** `otherAccounts` reaches *no* tax engine. Also wrong: **Engine D (Withdrawal) reads
it**, as its entire taxable balance (L7025).

Both errors are the same mistake. I verified **one** code path — the residual rule in rev 1,
`retireStartBalances()` in rev 2 — and stated a conclusion about **all** engines. This is the identical
failure that produced the "the first-death class is CLOSED" error at v5.13, which the manifest already
records as a lesson: *a claim about every engine has to be checked against every engine.* I wrote that
lesson down and then repeated it twice in one audit.

**What holds from revision 2:** the executed two-run probe is still valid — it showed
`tradInit`/`rothInit`/`taxableInit` unmoved by a $500K `otherAccounts` entry. That was a correct
measurement of the Engines A/B/C basis and I generalized it beyond what it measured.

§2 below is verified **per engine, individually**, not inferred from a shared helper.

---

## 2. FINDING D-2D-3 (restated) — the engines disagree about `otherAccounts`

**Severity: HIGH** · **direction: NON-CONSERVATIVE in every engine, by two different mechanisms** ·
**undisclosed** · **EXECUTED + per-engine source verification**

| Engine | Sees `otherAccounts`? | As what | Verified at |
|---|---|---|---|
| Monte Carlo | **yes** | undifferentiated portfolio, grown | `_P0mc = PORTFOLIO.household` (L1496) |
| **D — Withdrawal** | **yes** | **entirely taxable** | `_taxInit = household − total401k` (L7025), `let taxable = _taxInit` (L7066) |
| A — Roth strategy | **no** | — | `positions` residual (L3850) |
| B — Taxes | **no** | — | `positions` residual (L8240) |
| C — IRMAA | **no** | — | `positions` residual (L8745) |
| Roth ladder | **no** | — | `retireStartBalances()` (L7505), `positions` only |

### The two defects this produces

**(a) Engines A, B, C and the ladder do not see the money at all.** No RMD, no ordinary-income tax, no
MAGI contribution, no dividend yield. On the shipped example household that is **$147,000 — 8.9% of
the $1,647,000 net worth** — of which **$90,000 is named "Rollover IRA (A)" and "Traditional IRA (A)"**
(L409). Money the user explicitly labelled tax-deferred produces no RMD anywhere in the app while
still counting as wealth the plan reports.

**(b) Engine D sees all of it and treats every dollar as taxable** — including that same $90,000 of
traditional IRA. So the Withdrawal tab draws it down at capital-gains treatment, when it is ordinary
income and RMD-forced.

Both run **non-conservative**, and they are also **inconsistent with each other** — the same account,
in the same household, is invisible on one tab and taxable on another. That is the cross-engine
divergence condition the standing audit exists to catch.

### Disclosure

None. Nothing in-app, and METHODOLOGY does not mention `otherAccounts`. The MyData section is headed
simply "Other accounts."

---

## 3. FINDING D-2D-2 (restated) — the taxable residual is copied at FIVE sites

Revisions 1 and 2 said four. There are **five**: L3850, L7906, L8040, L8240 and **L8745** (Engine C's
`_taxableInitI`, missed previously). No divergence between them was found.

This is the same shape that let F-2B-1 and F-2B-2 survive three releases and let a fifth copy of the
IRMAA threshold arithmetic drift into C-2B-3. The IRMAA case was consolidated at v5.14; this one has
not been. **And the undercount is itself the argument**: a duplicated expression is hard to count
correctly, which is exactly why it should not be duplicated.

---

## 4. VERIFIED SOUND — income streams (unchanged)

`streamsMonthlyAt()` (L460) is consumed by every engine and defaults owner-mortality from
`PLAN_TIMELINE`, so the Monte Carlo supplies per-path mortality while deterministic engines get
planned-death behaviour automatically. Same question as §2, opposite answer, same file: **streams were
built so no engine has to remember; accounts were not.** A D-2D-3 fix should copy this pattern.

---

## 5. IMPLICATIONS FOR THE OPTION B FIX (Steve, 2026-08-09)

Option B — fold `otherAccounts` into `positions` at import with an appropriate tax split — survives
the correction, but §2 changes its risk profile. **Engine D currently derives its taxable balance as
`household − total401k`.** Folding accounts into `positions` raises `total401k`, so that expression
collapses toward zero and **Engine D's taxable balance would silently vanish** unless it is changed in
the same release.

This is not a detail to discover mid-build. Any Option B scope must:

1. Change Engine D's `_taxInit` off the `household − total401k` derivation and onto the same
   positions-residual basis the other engines use — or, better, onto a single shared helper, given §3.
2. Decide the default split per account name, and what happens to accounts a user typed by hand where
   the name implies nothing.
3. Handle migration: every existing saved backup carries `otherAccounts` with name and balance only.
4. Preserve `household` and `bucketActuals` exactly, or the Monte Carlo moves — `_P0mc` is
   `PORTFOLIO.household` and the bucket weights are authoritative from a separate sheet.
5. Assert, as a test, that the same account produces the same tax treatment in **all five** engines —
   the invariant whose absence is this finding.

---

## 6. WHAT 2D STILL OWES

The **completeness half is done**, now to the Section C standard and verified per engine.

The **Roth break-even half remains a premise reading, not a verification** — unchanged across all
three revisions. Still outstanding: hand-verify the crossover on two households (one running a real
deficit before recovering, one never behind); verify the discounting-equivalence claim; author the
`t10` cases this sub-phase owes.

---

## 7. Honesty statement

§2's table is verified **per engine at the line cited**, not inferred from a shared helper — that is
the specific discipline whose absence caused both errors in §1. The executed probe from revision 2
stands as a measurement of the Engines A/B/C basis. The `$147,000` and `$90,000` figures are read from
the shipped source. §3's count of five was reached by grepping the expression rather than by memory,
after two undercounts. §6's break-even items remain unaudited: **the break-even half of 2D still does
not meet the Section C standard, and 2D should not be marked complete.**
