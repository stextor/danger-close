# SCOPE — v6.48: the Roth ladder's starting-balance cards (F-34) and its RATE column (F-35)

☑ **RETIRED — FULFILLED AT v6.48 (2026-11-06).** DR-1 to DR-3 (a) (§4); built as §1–§2 say, with the differences §5 records (the build
review's changes among them). Repo-only (`docs/`); it ships in the release package that builds it.

| Field | Value |
|---|---|
| Build scoped against | **v6.47** · `src/DangerClose.jsx` md5 `f75e7cf11612932186d9338c6422634e` · built `index.html` `046031afb7c33fe6c90987be9459f6d1` · repo `8647e9b` (full clone) |
| Freshness (§A) | Checked 2026-11-06 after the v6.47 upload: the 16 pool files byte-identical to the package or the clone; the 114 `github/` files byte-identical to the commit, the changed-path set since v6.46 equal to the package's; Pages serving `046031af…`; `package_check` post-upload 53 passed, 1 failed (K-8: the manifest's `MissingFeatures.md` row was left at v6.46's md5 — a v6.47 packaging slip, folded in here, §1) |
| Register items | Closes **UsabilityFlaws F-34** and **F-35** (both filed at v6.45). Renumbers the TY2027 scope a fifteenth time: the 2027 tax figures become **v6.49** |
| Version | **v6.48** (`v648`) — free: `vercensus.cjs` reports no ladder or keyed entry; no `.py` suite names it; no `dom_entry_v648.jsx` in the history |
| Status | **Built and shipped at v6.48** — decided by Steve, 2026-11-06: DR-1 (a), DR-2 (a), DR-3 (a). A presentation release: no engine changes |

Steve, 2026-11-06: *"Go ahead with v6.48 and move the tax figures to v6.49"*; on F-34's fix, after the census below: *"Ladder's start (Recommended)"*.

---

## 0 · Premise — verified against v6.47

Sites from `census.cjs` (identifiers) and a text walk of the source and the suite; figures from the v6.47 module (`retireStartBalances`,
`planDollarFactor`, `carryStartBalances`) on the example, under each scenario prior; the page opens on BULL-LEANING.

### 0.1 F-34 is wider than registered

UsabilityFlaws F-34 says the Roth tab's *Traditional bal (now)* and *Roth bal (now)* cards print the balance at the selected retirement year
rather than today's, and proposed a relabel to *"at retirement (year)"*. **The census found the figure itself is neither.** The cards read
`_rsbL.tradInit` and `_rsbL.rothInit` (`retireStartBalances(retireYear)`): today's holdings plus the planned contributions at face, **not
carried to the retirement year**. The ladder starts from the carried figures (`carryStartBalances(_rsbL, _rbL)` — `tradBalA + tradBalB`,
`rothBal0`), in the retirement year's dollars like every other figure in its table. On the example, retiring 2029:

| | Today's holdings | The card (v6.47) | The ladder's start, BULL-LEANING (2029's dollars) | under BASE |
|---|---|---|---|---|
| Traditional | $1,296,000 | **$1,398,600** | **$1,499,680** | $1,508,077 |
| Roth | $315,000 | **$315,000** | **$339,568** | $341,609 |

⚠ **Corrected at the build.** This table first gave $1,508,077 / $341,609 "under BULL-LEANING" — and so did the question put to Steve. Those
are BASE's figures: the ESM test module loads under BASE (`units_v630.mjs`'s note), and the measurement read it there. The page opens on
BULL-LEANING, where the ladder starts from $1,499,680 / $339,568 (`t112` B-6, rendered). The choice the figures supported does not depend on
which.

So a relabel alone would have described the wrong number. `_tradFromPortfolio` and `_rothFromPortfolio` have one reader each, the cards
(the pooled `tradBal` seed it also feeds is reassigned before any read). F-34 was visible on the example; no census row needed (§K1).

### 0.2 F-35

`marginalRate` (the ladder loop, component-inline) starts at 0.10 and is set only by a bracket the year's taxable income reaches. In a year
with $0 of taxable income — income at or under the standard deduction — the RATE column prints 10%. `census.cjs`: `marginalRate` has one
reader, that column (and its colour). On the example at the opening $70,000 every ladder year has taxable income, so the column was right
there; at a $0 slider its first ladder years read 10% on $0. A view (the slider), not a household: the boundary census, which reads
households, cannot carry it (§K1's own exception) — `t112` holds it instead.

### 0.3 What else names them

The Field Manual's Roth entry: *"and current Traditional/Roth balances (derived from your positions)"* — false of v6.47 for the reason in
§0.1. In the suite, `t109` reads the cards by their label (`/Traditional bal \(now\)…/`, B-1 and B-11). Nothing else: no METHODOLOGY passage,
no Ask AI text, no other tab.

---

## 1 · What changes

- **F-34 (DR-1 (a)):** the cards read **"Traditional at retirement (2029)"** and **"Roth at retirement (2029)"** (the selected year) and show
  the balance the ladder starts from, carried, with a line under each saying what it is (§5: revised at the build review).
- **F-35 (DR-2 (a)):** `marginalRate` starts at 0, so a year with no taxable income reads **0%**.
- **The Field Manual's** Roth sentence states what the cards show; §13 gains the v6.48 note (newest first). The four version sites read v6.48.
- **Registers:** UsabilityFlaws F-34 and F-35 closed; the TY2027 scope renumbered to v6.49 with its §8 (readiness at v6.47, the 2027 figures
  read from Rev. Procs. 2026-35 and 2026-26 and SSA, prepared 2026-11-06); the manifest's `MissingFeatures.md` row rolled (the v6.47 slip).
- **What does not move:** every engine (MC parity 10/10 with no intended difference); every figure in the ladder's table except the RATE cells
  of $0-taxable years; every other tab.

---

## 2 · Tests

`qa/t112_roth_cards_rate.mjs`, both legs (the v6.47 leg pins each defect as a dated `[KNOWN DEFECT 2026-11-06, F-34 — flips at v6.48]` /
`[…, F-35 …]`):
- **§A by AST:** the cards read the ladder's carried start, not `retireStartBalances` directly; `marginalRate` starts at 0; the "(now)"
  labels are gone.
- **§B the cards, rendered**, on the example and on plans that separate the three figures (a later retirement, contributions, no Roth, no
  Traditional): each card equals the carried start computed in the suite from the plan's fields (today's holdings × the inflation factor to
  the retirement year, plus the contributions at face), and the label names the selected year at −1 / PLANNED / +1 YEAR.
- **§C the RATE column**: every row's rate is the bracket of its taxable income, computed in the suite from the row's own TAXABLE and the
  year's brackets; $0 → 0%; at a $0 slider on a plan with no income. *(As built — §5: the pension-only plan was not built; a plan with no
  income reaches the $0 case, and the bracket check runs on the example, the no-income plan's RMD years and a single plan.)*
- **§D unchanged**: on the example and every fixture, the Roth tab's text equals v6.47's but for the two cards, their lines and the RATE cells
  of $0-taxable years (v6.47 dumped in a child process).
- **§E** the Field Manual's Roth sentence and §13 note.
- **Re-gates:** `t109` reads the cards by either label (its v6.48 leg checks the carried figures).
- **Controls** `qa/tools/controls_v648_roth_cards.py`: the old label back; the uncarried figure back; the 0.10 start back; the Field Manual
  sentence back; the unmutated run.

---

## 3 · Out of scope

- The pooled `tradBal` seed in the ladder (`tradBal0 = _tradFromPortfolio`, uncarried): it is reassigned before any read, so it moves nothing;
  left as it is.
- F-35's wider question — whether the RATE column should show the rate on the next dollar (the bracket above when taxable income sits exactly
  on a bracket top) rather than the rate on the last dollar taxed. The column's rule is unchanged: the bracket of the last taxed dollar.
- The 2027 tax figures (v6.49).

---

## 4 · Decisions (Steve, 2026-11-06)

- **DR-1 · F-34.** (a) **Show the ladder's start, labelled with the retirement year** — *taken*. (b) Today's holdings under "(now)". (c) Keep
  the figure, relabelled "today's holdings + planned contributions".
- **DR-2 · F-35.** (a) **0% in a year with no taxable income** — *taken*. (b) A dash.
- **DR-3 · Order.** (a) **These two now, as v6.48; the 2027 figures as v6.49** — *taken* (the figures wait on CMS and the IRS retirement-plan
  notice; keeping v6.49 a pure data release). (b) Ride along with the figures.

---

## 5 · Build record (v6.48, 2026-11-06)

Built on v6.47 (`f75e7cf1…`, repo `8647e9b`) in a full clone, as §1 and §2 describe, with these differences:

1. **The example's figures in §0.1 were BASE's**, not BULL-LEANING's (the ESM test module loads under BASE); corrected there, in the Field
   Manual's note and in `t112` B-6, from the rendered page: $1,499,680 / $339,568. The question put to Steve quoted BASE's figure; the choice does
   not depend on it.
2. **The build review** (an agent that had not seen the build, read-only, no suite runs): no must-fix; three should-fix and eight notes, each
   checked:
   - *A plan already retired* (a retirement year before the as-of date) carries by a factor below 1, so its card printed today's holdings
     deflated under "at retirement (2024)". **Taken:** each card's line now says what the figure is — *"today's holdings carried to 2029 at the
     plan's inflation, plus the planned contributions — in 2029's dollars"*, or for that plan *"today's holdings in 2024's dollars (the
     retirement year is before the plan's as-of date)"* — with *"— the ladder's start"* only when the ladder has rows (the review's two notes on
     the line folded in). `t112` B-5b, B-10; control K9.
   - *`t112` judged "$0 of taxable income" from the rounded cell*, which reads $0K up to $499. **Taken:** each RATE cell carries the row's exact
     taxable income (`data-dc-taxable`); §C and §D read it. No plan in the suite reaches $1–$499 of taxable income, so that band is read, not
     exercised.
   - *§2 §C's per-row bracket check and its pension-only plan were not built.* **Taken in part:** C-3 checks every taxed row's rate against the
     bracket of its exact taxable income (the 2026 tables typed in the suite, indexed at C-CPI-U) on the example, the no-income plan's RMD years
     and a single plan; the pension-only plan was not built (the no-income plan reaches the $0 case).
   - Notes taken: the sub-line's year is now checked (B-5b, K9); B_PLANS gains an annuity plan and a single plan (B-11); the §13 note says the
     next dollar *"owes no federal income tax (the ladder's tax is federal)"*. Notes left: `_rothFromPortfolio` is now read by nothing (§3's
     dead seed's sibling — left as it is); `t109`'s v6.48 check on the annuity-only card is only "above $250,000" (`t112` holds the figures); the
     ladder header's *"State tax per My Data"* is not modelled in the ladder's own tax (an older matter, not this release's — recorded, not filed).
3. **`t109`'s re-gate** reads the cards by either label; its v6.48 leg checks the annuity-only card above $250,000 (§2 said *"checks the carried
   figures"* — `t112` does).

