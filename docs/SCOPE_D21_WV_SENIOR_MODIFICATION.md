# SCOPE — D-21 · West Virginia's $8,000 senior modification is not additive to taxable Social Security (v5.89)

**FULFILLED — shipped as v5.89 (2026-10-02).** Retired to repo-only at the ship (OPERATIONS §G). §7 is the build record.

*(Superseded status line, retained:)* **DRAFT — 2026-10-01. Decision D21-A (§5) needs Steve's answer before any build.** This is a **MODELLING** release. METHODOLOGY
updates with it.

## 0 · Premise (verified against v5.88, not assumed)

**Freshness check (OPERATIONS §A).** Repo `b584b50`. All 117 pool files match committed content. Source
`9843bd1747a24af2791e4ba0fa94ab7f` = pool = manifest = CHANGELOG newest.

**The law, read 2026-10-01.** Primary source: WV Tax Division, *Social Security Modification* (tax.wv.gov, Individuals › Senior
Citizens). The amount of the Social Security modification under W. Va. Code §11-21-12(c)(8) determines how much of the $8,000
modification under §11-21-12(c)(9) a taxpayer 65+ (or permanently disabled) receives. It is "similar in operation to the federal
standard deduction": the taxpayer receives **the higher of** $8,000 or the sum of the itemized decreasing modifications. Those
include **taxable** Social Security and certain public pension modifications. From TY2026, 100% of taxable Social Security is a
decreasing modification for every filer (HB 4880).

The WV Legislature's fiscal note on the Social Security modification says the same: claiming it reduces or removes the $8,000.

**Not settled by that page:** whether the comparison is made **per person** or for the joint return. Secondary sources say each
qualifying spouse claims up to $8,000. The statute's text, §11-21-12(c)(9), was **not** read this session. It is read at the build
and decides D21-A's (a)/(b) below.

**The model (v5.88).** The WV row is `excl65: 8000` (per person 65+, floor 65), with `ss: 0`, so Social Security never enters WV
income. `stateTaxAnnual` grants both: Social Security is untouched, **and** $8,000 per person comes off retirement income. The
existing offset mechanism (`ssOffset`, L1405, `_cap − ssGross`) subtracts **gross** Social Security, which is the Maryland/Maine rule. It
is reserved for those two states by the v5.56 decision, and it is the wrong base for WV anyway: WV's base is **taxable** SS.

**Measured through the v5.88 shim**, rate 4.82%, law computed by hand:

| Household | Model | Law | Model under-taxes |
|---|---|---|---|
| Single 66, $30,000 IRA, taxable SS $20,400 | $1,060.40 | $1,446.00 | **$385.60** |
| Single 66, $30,000 IRA, taxable SS $3,000 | $1,060.40 | $1,205.00 | **$144.60** |
| Single 66, $30,000 IRA, no taxable SS | $1,060.40 | $1,060.40 | — |
| Single 64, same | $1,446.00 | $1,446.00 | — (no senior modification) |
| Joint 66/66, $60,000 IRA, taxable SS $40,000 | $2,120.80 | $2,892.00 | **$771.20** |

**Optimistic, as filed:** up to $8,000 of income per person wrongly exempted, which is $385.60 per person per year at 4.82%. That
applies to every WV retiree whose taxable Social Security reaches $8,000, which most retirees' does.

## 1 · Change

1. A new row field for WV, distinct from `ssOffset` so Maryland and Maine cannot move. In effect: senior modification per eligible
   person = max(0, $8,000 − that person's taxable SS), or the household form, per D21-A.
2. `stateTaxAnnual` applies it. Taxable SS is already passed in (`ssTaxableFed`, household-level), and gross SS per person
   (`ssGrossA` / `ssGrossB`) is available to apportion it.
3. WV's note says what is modelled and what is not (§4).
4. METHODOLOGY: WV's paragraph gains the rule.
5. Version bump at the four in-app sites.

## 2 · Site census (at build, by parser, not grep)

- `stateTaxAnnual`'s exclusion block (`_one`, `_floor`, the `ssOffset` line), and every caller's arguments: does every engine pass
  `ssTaxableFed` and per-person gross SS? This is the scope's biggest unknown. If any engine passes zeros, the fix is invisible
  there; **STOP and report** if so.
- The WV row; any suite household in West Virginia whose pinned figures would move (the literal census plus a run of the existing
  suite against the staged source); MC parity (WV is not the parity household — confirm).
- Field Manual / DOCS_HTML text about West Virginia.

## 3 · Tests

- **New suite `t54`** (current leg). It is shown failing on v5.88 first.
  - the five cases above, dollar-exact by hand;
  - a joint case where the spouses' taxable SS differ, which is where (a) and (b) part company;
  - the disability path is **not** modelled (the model has no disability input), so the suite asserts nothing about it.
- **Extinction:** for every WV household in a grid of ages × taxable SS × retirement income, the senior relief the engine grants plus
  taxable SS never exceeds the larger of the two. Maryland's and Maine's results are **unchanged**, bit for bit, across the same grid.
- **Controls** (repo-only):
  - the rule removed;
  - the base switched to gross SS;
  - the household/per-person form swapped;
  - the floor changed;
  - MD/ME's `ssOffset` disturbed;
  - the unmutated run.
- Full suite after, run as two concurrent halves.

## 4 · Out of scope (disclosed in WV's note where it matters)

- **Public pension modifications.** WV's own list of decreasing modifications includes "certain public pension modifications".
  The model cannot tell a public pension from a private one (D-12), so those are not counted against the $8,000. That leaves the
  model optimistic for a WV public pensioner, and the note says so.
- **Military retirement**, fully exempt in WV: not modelled, which is conservative.
- **The disability path:** no disability input.
- **WV's rate (4.82%)** is not re-read here. If the build finds it stale, that is filed separately, not fixed in this release.

## 5 · Open decisions (for Steve)

- **D21-A · Per person or per household.**
  - **(a) recommended, if the statute confirms it:** per person, as the law applies it. Each spouse 65+ gets max(0, $8,000 − their
    share of taxable SS). The household's taxable SS is apportioned by each spouse's gross SS, because the model knows gross SS per
    person but computes taxable SS for the household. That apportionment is a disclosed simplification.
  - (b) household: max(0, $16,000 − the household's taxable SS), or $8,000 if only one spouse is 65+. It is simpler and never more
    generous than (a), so it is the conservative fallback.

  **Recommendation:** read §11-21-12(c)(9) at the build. Use (a) if it is per person; otherwise use (b). If it is unclear, use (b),
  because it is conservative.

## 6 · Status

DRAFT. Destination: repo `docs/SCOPE_D21_WV_SENIOR_MODIFICATION.md` and the knowledge pool once D21-A is answered (the active scope,
OPERATIONS §G). It retires to repo-only when v5.89 ships.

## 7 · Build record (v5.89, 2026-10-01 → 02)

- **D21-A answered by the statute, as the recommendation said:** W. Va. Code §11-21-12 (current text, code.wvlegislature.gov, read 2026-10-01).
  (c)(9)(ii): "Where the total modification under subdivisions (1), (2), (5), (6), (7), and (8) of this subsection is less than $8,000 per
  person, the total modification allowed under this subdivision for all gross income received by that person shall be limited to the
  difference" — **per person**. (c)(8)(E): 100 % of SS "included in federal adjusted gross income" from TY2026 — **taxable** SS. The other
  offsetting subdivisions: (1) U.S. obligation interest, (2) federal/WV-exempt interest, (5) the first $2,000 of WV PERS/TRS or federal
  pensions, (6) WV police/fire pensions, (7) military retirement — none modelled (§4).
- **Stop condition (§2) cleared:** all three `stateTaxAnnual` call sites (Roth engine L4552 and L4677, `computeTaxPlan` L5911) pass
  `ssTaxableFed`, `ssGrossA/B` and ages. The per-spouse taxable split already existed (`_txA`/`_txB`, v5.85), so the rule is one line in `_one`
  plus the count-only fallback.
- **Source** `abf14500169ac6a6793607fdda82a688`; **built** `ae0f99bf9e3064da0d4d04f66d8808d0` (v5.88 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed). Literal census: only the version-string
  arms change outcome; `t51`:47's hit is a provenance label, not an assertion. METHODOLOGY's v5.86 paragraph gained a dated fix note
  (moves nothing in `t31`).
- **Tests:** `t54` 18 — v5.88 11 failed (exactly the additive rule's cases), v5.89 18/18. Controls 9 of 9; C2 and C6 also reddened
  further checks, correctly, and those were written into their expectations and re-confirmed.
- **Session slips, recorded:** three METHODOLOGY edits failed before the paragraph was found to be the file's last (no blank line after
  it); a half B started with too little turn left was cut off in `t48` and discarded.
- **Suite:** 4,927 app checks, 53 suites, 0 failed, 0 DIED; GRAND 5,057. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v588 v589 from a fresh clone of b584b50 with the github/ files overlaid; each ran the shipped runsuite.sh through a session-only copy whose one added line skips the other half's labels (half B: t45, t47, t48; half A: the rest, tooling included). An earlier half B, started alone, was cut off at a turn boundary in t48; it was discarded and half B re-run in a freshly built folder from the same inputs, concurrently with half A. Half A GRAND 4835, half B GRAND 222, both exit 0, no suite in both, none DIED.
