# SCOPE — D-56 (the $1,944): the Social Security tab's reading of each spouse's benefit at 67

☑ **RETIRED — FULFILLED AT v6.46 (2026-11-05).** Steve: *"all as recommended"* — DK-1 to DK-4 (a) (§5). Reviewed once, independently, before the decisions (§6); the build reviewed once more (§7), which corrected §0.5's aNoTable figures. Build record in §7. Scoped on v6.45 (source `b67f0d9adcfc7a8eb8bd9a60b72e1c72`, built `80088bc1…`, repo `8d77992`,
verified against a fresh clone, the live site and the project-knowledge pool on 2026-11-05). Repo-only (`docs/`); it ships in the release
package that builds it.

Steve, 2026-11-05: *"write the $1,944 scope"*.

**In one paragraph.** The Social Security tab works from each spouse's benefit at full retirement age (67). It reads that figure seven times,
in three blocks, with four different fallbacks for a plan whose table has no age-67 figure. The worst is spouse B's in the tab's main block:
a typed **$1,944** a month. A married plan reaches it whenever spouse B has no benefit of her own — the guided setup or My Data with her
amount at $0, Start Fresh, a backup with no spouse-B block — and on such a plan the tab invents a benefit for her: *"EST. FRA: $1,944/mo"*, a
claiming table built from it, her card showing **$1,458 a month** at 63, and that $1,458 carried into *"Combined income (all SS)"*, the
tab's *"Shortfall after …"* card (**$1,458 a month too small** — $2,462 where the plan's own figures give $3,920, and the withdrawal rate
beside it 1.8% where it is 2.9%), its draw-impact table, and its survivor figures (on a plan whose spouse A has the smaller benefit, every
survivor cell says B keeps the invented $1,458). The engines pay her $0, so the tab contradicts every projection, mostly in the optimistic
direction — and because $1,944 is above half of spouse A's $3,300, the *"SPOUSAL BENEFIT NOT MODELED"* warning is hidden on exactly the
household it was written for. The recommended fix gives the tab one reading for both spouses (the
table's figure, else the planned amount carried back to 67, else $0), and guards the three places that divide by those figures. The example and every
fixture household render the tab identically.

## 0 · Premise (verified at v6.45, not assumed)

Every figure was printed by a probe in this session against the v6.45 bundle (`qa/dom_v645.cjs` in the v6.45 packaged run folder) or a
prototype leg (`p56`, §0.5). Probes are session scratch (`d56/probe.mjs`). Sites were found with `qa/tools/census.cjs` (identifier and
property hits with their scope chain) and suite literals with `qa/tools/lits.cjs` — never a grep.

### 0.1 · The seven reads, and their four fallbacks

`census.cjs tableByAge`: 38 source sites. Outside the loaders and writers (the statement parser L4390–4478, the loader L4889–4903, the guided
setup L5129–5131, Start Fresh L5296–5297, My Data's `buildPortfolio` L14413–14416), every read of a spouse's age-67 figure is on the Social
Security tab:

| Line | Block | Reads | Fallback when the table has no 67 figure (or it is 0) |
|---|---|---|---|
| L9601 | main (L9594) | `spouseAFRA` | `getSSA()` — A's **planned** amount, at A's planned age (not carried to 67) |
| **L9603** | main | `spouseBFRAest` | **`1944`** |
| L9894 | main, survivor card | `_fB` | `spouseBSS` — B's planned amount (`getSSB()`) |
| L10065 | B's breakeven (L10062) | `fraB` | `0` — and the block hides itself (`if (!fraB) return null`) |
| L10066 | B's breakeven | `fraA` | `0` |
| L10145 | claiming grid (L10142) | `fraA` | `getSSA()` |
| L10146 | claiming grid | `fraB` | `getSSB()` |

`spouseBFRAest` (`census.cjs`: 9 hits) feeds B's claiming-age options (L9644, `ssBenefit(spouseBFRAest, …)`), so B's what-if card, her table
and the *Combined income* card; the spousal comparison (`_spousalBApplies`, L9609; `_spousalBGap`, L9610) and so the warning (L10022–10025);
the *"% of est. FRA"* line (L9782) and the *"… early reduction"* note (L10021), both of which divide by it.

**No engine reads `tableByAge`.** Engines A–D, the Monte Carlo, What Breaks, Backtest and Ask AI read `getSSA()` / `getSSB()` (the planned
amount). Every effect below is on the Social Security tab's display.

**What the invented figure reaches** (`census.cjs selectedSpouseB`: 15 hits; `_bIncAt`: 3). B's what-if benefit (`selectedSpouseB`, L9652,
built from `spouseBFRAest`) feeds: her card (L9780–9782); *Combined income* (L9787–9789); `_bIncAt` (L9719), and through it the draw-impact
table (`_drawAt`, L9723) and the shortfall card (`shortfallMo`, L9731); the survivor card (L9794–9796); the survivor grid (L9902–9904); the
survivor sentence (L9916–9917). A's percentage (`pct`, L9634) is read by A's card (L9775) **and A's claiming table** (L9825) — nine cells.

### 0.2 · How a married plan reaches it

- **My Data or the guided setup with spouse B's amount at $0:** both write `genSSTable(0, age)` (L14416, L5131) — every age $0, so `0 || 1944`.
- **Start Fresh** (L5297 stores B's claim age as 67, so B shows $1,944 at 67 there, and A — also $0 — the NaN below; not rendered by this
  scope) and **a backup with no spouse-B block** (the loader, L4897–4898, flagged `isDefault`): `tableByAge: {}`.
- **A statement table without an age-67 row** (the statement parser keeps whatever ages it finds, L4390–4406 needs four): B's real benefit
  is ignored and $1,944 used.
- The example's table has 67 ($1,800), and so has every fixture household (`households.mjs`'s `ssTable` writes 62–70 with 67): **the example
  and the fixtures cannot show it**, which is why nothing caught it.

### 0.3 · Reproduced (v6.45, BASE, the tab opened from the dashboard)

Each shape is the example with only spouse B's (or A's) Social Security block changed:

| Shape | EST. FRA | B's card (claim at 63) | Combined income (all SS) | Spousal warning | Note under the table |
|---|---|---|---|---|---|
| example | $1,800 | $1,350 | $5,050 = $3,300 + $1,350 + $400 | hidden (½ × $3,300 = $1,650 ≤ $1,800) | *"derived from $1,300 at age 63 (28% early reduction)"* |
| **noSSB** — B's block `{ tableByAge: {}, planned: 0 }` | **$1,944** | **$1,458** | **$5,158 = $3,300 + $1,458 + $400** | **hidden** | *"derived from $0 at age 63 (100% early reduction)"* |
| zeroTable — every age $0 (the setup / My Data at $0) | $1,944 | $1,458 | $5,158 | hidden | the same |
| missingB — no spouse-B block in a backup | $1,944 | $1,458 | $5,158 | hidden | the same |
| no67 — B's statement table without 67, $1,300 at 63 | **$1,944** | $1,458 (her plan: $1,300) | $5,158 | hidden | *"derived from $1,300 at age 63 (33% early reduction)"* |
| bigB — B's own table to $3,000 at 67 (control) | $3,000 | — | — | hidden | — |
| single | (no spouse-B block shown) | | | | |
| **noSSA** — spouse A's amount at $0 (a sibling) | $1,800 | $1,350 | $1,750 = $0 + $1,350 + $400 | hidden | A's card and nine cells of A's table: **"NaN%"** |
| smallA_noSSB — A's table to $1,000 at 67, B none (the review) | $1,944 | $1,458 | $2,858 | hidden | every survivor cell: *"$1,458 Spouse B keeps"* |

**The shortfall card** (*"Shortfall after Car Payment ends"*, the example's last fixed payment): noSSB **$2,462/mo, 1.8% SWR** on v6.45. By
hand from the plan: the post-payment spending $7,620 − B's $0 − the $400 pension − A's $3,300 = **$3,920**; v6.45 subtracts the invented
$1,458 (7,620 − 1,458 − 400 − 3,300 = 2,462 ✓). The draw-impact table's rows move the same way ($76K / $42K on v6.45, $93K / $59K from the
plan's own figures — the review's measurement).

**Hand-checked.** B's card at 63 is the tab's own SSA formula, 48 months early: 36 × 5⁄9 % + 12 × 5⁄12 % = 25%, so $1,944 × 0.75 = $1,458 ✓
(and $1,800 × 0.75 = $1,350 on the example ✓). The combined figure is $3,300 + $1,458 + $400 = $5,158 ✓. The warning compares ½ × A's $3,300
= $1,650 with B's estimate: below $1,944, so hidden; above $0, so it would show, with a gap of $1,650 a month ($19,800 a year).

**What it costs a user.** On a married plan where one spouse has no benefit of their own, the Social Security tab shows that spouse a $1,458
monthly check at 63 that no projection pays, a combined income $1,458 a month above the engines', a shortfall $1,458 a month too small (the
withdrawal rate 1.8% instead of 2.9%), survivor figures that can include the invented check, and no word that SSA's spousal top-up —
up to $1,650 a month here, which the engines also leave out — exists. Display only: no projection moves.

### 0.4 · The class, and the registers (OPERATIONS §K2)

- **Registers**, searched for `spouseBFRAest`, `1944`, `1,944`, `tableByAge[67]`, "spousal benefit", *"SPOUSAL BENEFIT NOT MODELED"* and
  "spousal top": **MissingFeatures D-56** (widened at v6.45 with the measurement — this scope's subject); **UsabilityFlaws** F-29's entry
  (L838–841: first recorded unmeasured at v6.37, measured at v6.45); `FlawsToFix-v5_10_2-Phase2C.md` L157 (a note that *"spousal top-up
  benefits not modeled"* is a different mechanism from the survivor floor). METHODOLOGY L865 discloses *"spousal top-ups not modeled"*. **No
  register item tracks the spousal benefit itself** (§4, DK-3).
- **The suite carries the $1,944 twice:** `t101` L144 — its oracle, `model()`, copies `|| 1944` (`lits.cjs 1944`; a copy of the defect in the
  oracle, though no `t101` plan reaches that branch); and `t109` A-3's allowlist entry for it (v6.45; the entry's reason says "scoped next").
- **v6.45's fallback sweep** (`t109` A-3) found this literal as one of 17 numeric fallbacks ≥ 1,000; it is the only one that invents a
  person's money. The others are sentinels, iteration counts, disclosed defaults and D-56's date placeholders.

### 0.5 · The prototype

A scratch leg (`d56/run`, `p56`) from the v6.45 source with one module-level helper and ten lines changed (§1.1, §1.2), bundled as
`mk_runfolder.sh` builds a leg:
- **noSSB, zeroTable, missingB:** EST. FRA **$0**; B's card $0; *Combined income* **$3,700** = $3,300 + $0 + $400 (what the engines pay);
  the warning shows: *"tops Spouse B up from a $0/mo own benefit toward $1,650/mo … roughly $1,650/mo ($19,800/yr) more than every
  projection here assumes"*; the spousal sentence reads *"above"*.
- **no67:** EST. FRA **$1,733** (her $1,300 at 63 ÷ 0.75, the `SS_FACTORS` table My Data builds tables with); her card **$1,300**, her plan's
  figure; combined $5,000; *"(25% early reduction)"*.
- **noSSA:** *"0% of FRA"* — no NaN.
- **The shortfall card on noSSB:** $3,920/mo, 2.9% SWR (the review's measurement; matches the hand figure above); the survivor card *"Max of
  Spouse B's own ($0) or Spouse A's ($3,300)"*; smallA_noSSB's survivor cells $700 / $1,000 / $1,240 (A's own at 62 / 67 / 70).
- **Moved by DK-1 (a) besides the $1,944 (the review's measurement — not "nothing else"):**
  - **A spouse whose plan has a benefit but no table** (aNoTable: A $3,000 at 65, no table): A's figure at 67 $3,000 → **$3,461** (the
    $3,000 carried back from 65). A's claiming table, the survivor cells and cumulative columns move with it; the delay total +$62,400 →
    +$72,000; the shortfall $2,870 → $2,409 (*measured with A's slider at 67, not her planned 65 — corrected in §7*); B's breakeven block's *"couple's twist"* flips from B holding the larger benefit to the smaller
    — v6.45 compared B's $1,300 with A's planned-at-65 $3,000 read as if at 67.
  - **no67:** B's breakeven block (hidden on v6.45, which read B's figure as 0 there) appears; the claiming grid and the shortfall ($2,462 →
    $2,620) move.
  - **String table values** (a backup storing `"1800"`): v6.45 shows a claiming-grid best cell of *"$4911080K"* and *"$1800"* with no comma;
    the helper's `Number()` reads them as numbers.
- **Page text identical** to v6.45 (the whole page with the Social Security tab open) on the example, bigB, the single plan and **all 17
  fixture households**.
- Still wrong after the prototype, and so in §1.2: the note under B's table reads *"Estimated FRA benefit derived from $0 at age 63 (0% early
  reduction)"* for a spouse with no benefit.

## 1 · What changes (the recommended shape: DK-1 to DK-4 (a))

### 1.1 · One reading of a spouse's benefit at 67 (DK-1 (a))

A module-level helper beside `SS_FACTORS` and `ssTabClaimAge` (it reads both; placing it there keeps it out of the temporal dead zone),
`ssFraOf(who)`: the table's age-67 figure, as a number, if it is above 0; else the planned amount carried back to 67 by
`SS_FACTORS[ssTabClaimAge(who)]` — the claim-age rule the tab already uses (rounded, clamped to 62–70, 67 for A and 63 for B when missing or
0), so a backup's `"65"` or 65.4 reads as the explorer reads it (the review: a bare `SS_FACTORS[Number(plannedAge)] || 1` read a missing or 0
age as 67, gave B $975 at 63 where the engines pay $1,300, and showed a false spousal warning) — the inverse of `genSSTable`, which writes
every table My Data and the guided setup save; else 0. A single plan's spouse B reads 0, as `getSSB()` does. All seven reads in §0.1 call it.
**What else moves** is listed in §0.5 (spouse A on a plan with no table; no67's breakeven block; string values). Exported on the shim's
`__g` (guarded), for `t110`.

### 1.2 · A spouse with no benefit of their own (DK-2 (a))

- The three divisions are guarded: A's *"% of FRA"* (her card and her claiming table), B's *"% of est. FRA"*, and the *"… early
  reduction"* note read 0% when the figure is 0.
- The note under B's table, when B's figure is 0: *"This plan holds no Social Security benefit for {nB}, so every projection pays {nB} no
  Social Security."* (the review's wording: the plan may only lack the figure — Start Fresh, or the loader's fallback banner — and "$0" read as
  all income) — in place of *"Estimated FRA benefit derived from $0 at age 63 (…% early reduction)"*. The spousal sentence and the warning stay
  as they are (they read correctly with $0: *"tops {nB} up from a $0/mo own benefit toward $1,650/mo"*).
- B's claiming-age table stays, at $0 a cell — the layout and the phone rules are untouched (DK-2 (b) would hide it).

### 1.3 · The copy

- **Field Manual §13**, a v6.46 note: the tab invented a $1,944 benefit for a spouse with none, and hid the spousal warning; now it shows $0 and
  the warning, and a statement without an age-67 row is read from the planned amount.
- **METHODOLOGY**: a short section — the tab's one reading of each spouse's benefit at 67; display only.
- The four version sites read v6.46.

### 1.4 · The registers

- **D-56** narrowed: the $1,944 struck; its other members (the as-of date placeholder, spouse B's claim-age 63 placeholder, the 2029
  retirement placeholder, the Roth tab's 5-year-clock line, the Grade tab's literals) stand.
- **UsabilityFlaws** F-29's paragraph closes the $1,944 line; **F-36 filed** (§4): the spousal warning only ever looks at spouse B.
- **MissingFeatures D-77 filed** (DK-3 (a)): the spousal benefit is not modeled.

## 2 · Site census (v6.45, by `census.cjs`)

| What | Sites |
|---|---|
| The seven reads | L9601, L9603, L9894, L10065, L10066, L10145, L10146 (§0.1) |
| `spouseBFRAest` | 9 hits: L9603 (def), L9609, L9610, L9644, L9782, L10002, L10021 ×2, L10024 |
| The divisions | L9634 (`pct = benefit / spouseAFRA`, read at L9775 and A's claiming table L9825), L9782, L10021 |
| What B's figure reaches | `selectedSpouseB` (15 hits): L9780–9789 (her card, combined income), L9719 `_bIncAt` → L9723 (draw table), L9731 (shortfall), L9794–9796, L9902–9904, L9916–9917 (survivor) |
| `SS_FACTORS` | L14107 (def) and `genSSTable` L14117, L14120; My Data's age changers L14506, L14513 |
| Writers of `tableByAge` | the statement parser L4390–4478, loader L4889–4903, guided setup L5129–5131, Start Fresh L5296–5297, `buildPortfolio` L14413–14416 |
| Suite literals | `lits.cjs 1944`: `t101` L144 (its oracle); `t109` L228 (A-3's allowlist, a string key) |

**Suites that open the Social Security tab** (a text search for its tab id and headings, to be confirmed by AST at the build, §B1): `t84`,
`t95`, `t100`, `t101` (the explorer; its `bGrid` reads *"BENEFIT BY CLAIMING AGE (EST. FRA"*), `t105` (phone layout), and `t45`'s page sweep
(Python); and, by the review's AST string scan, `t91` (lints the tab on the example, a couple, a single plan and a couple with B higher,
L239–249), `t106` (dumps every tab, L84–88), and `t84` L329, which asserts on the *"Shortfall after"* card — the card that moves. Every one runs on plans whose tables hold 67, so the prototype's page identity predicts no figure moves; the build's run decides.

## 3 · Tests

### 3.1 · `t110_ss_fra.mjs` (new, both legs)

The v6.45 leg pins each defect as `[KNOWN DEFECT 2026-11-05, D-56 — flips at v6.46]`.
- **§A, the source by AST:** `ssFraOf` is module-level and is the only reader of a spouse's age-67 figure outside the writers (an extinction
  check over every `tableByAge[67]` member access) and uses `ssTabClaimAge`; no numeric literal of 1,000 or more stands in a fallback position
  in the Social Security tab's blocks (the `|| 1` and `|| 63` fallbacks that remain are below that line); the three divisions are guarded.
- **§B, the helper, by checks that do not share its formula:** it equals `genSSTable(planned, age)[67]` for every whole planned amount
  1–6,000 at all nine ages (the review ran this); the tab's own SSA formula applied to it returns the planned amount at the claim age within
  $1; table 67 > 0 wins; a single plan's B → 0; claim-age shapes — missing, 0, `"65"`, 65.4, 71 — read as `ssTabClaimAge` reads them; string
  table values; a table with only 70.
- **§C, rendered, the shapes of §0.3 plus aNoTable and smallA_noSSB:** EST. FRA; B's card and *Combined income* equal to the tab's SSA
  formula applied to `ssFraOf` at the sliders' ages (not `getSSA + getSSB` — the example's statement table makes them differ by $50, and
  rounding by $1 at many ages; the review), and equal to what the engines pay where B's figure is $0; the shortfall card and the survivor
  card / grid against the same; the warning shown exactly when ½ × A's figure > B's, and its gap; the new sentence; no *"NaN"* anywhere. Each
  shape is loaded with a remount (the sliders keep their ages through `applyLoadedData` — the review's probe trap).
- **§D, page identity:** the whole page with the Social Security tab open equals v6.45's text on the example, bigB, the single plan and all 17
  fixtures (the v6.45 leg dumped in a child process to a file; the selector's Monte Carlo medians excluded, as `t109` §C learned).
- **§E, hand pins:** noSSB's combined $3,700, shortfall $3,920 (7,620 − 0 − 400 − 3,300) and gap $1,650 / $19,800; no67's $1,733
  (= 1,300 ÷ 0.75) and her $1,300 card; aNoTable's A at 67 $3,461 (= 3,000 ÷ 0.8667); the example's $1,800 / $1,350 / $5,050 unchanged. §D's
  page identity only guards against regressions (every fixture's tables hold 67 for both spouses), so these pins carry the change.
- **§F, the copy:** the §13 note, METHODOLOGY's section.

### 3.2 · Re-gates

- **`t101`** L144: its oracle copies both old fallbacks (`|| DG.getSSA()` and `|| 1944`); both become the new rule on the v6.46 leg (no
  `t101` plan reaches either branch — every plan uses `genSSTable` or the example, and its single plan makes B 0 — so no figure moves).
- **`t84`** L329 reads the shortfall card: on its plans (tables with 67) the card does not move; confirmed by run.
- **`t109`** A-3: the `|| 1944` allowlist entry is expected on the v6.45 leg only.
- Any other suite turned red is read assertion by assertion before anything is gated (§B2).

### 3.3 · Boundary census (§K1)

The maintenance rule applies (invisible in the example data). Two rows in `boundaries.mjs`, with `t29` checks:
- **`ss_fra_source`:** where each spouse's figure at 67 comes from — *table*, *planned*, or *none*. ON (degenerate) when both come from a
  table, as on the example and every fixture.
- **`spousal_warning`:** whether ½ × A's figure exceeds B's — the warning's path. ON (degenerate) when it does not, as on the example ($1,650 ≤
  $1,800).
Shapes built inline in `t29` (as v6.44's and v6.45's were), not in `households.mjs`, so suites that loop over the fixtures do not grow.

### 3.4 · Controls

`qa/tools/controls_v646_ss_fra.py`. Each mutant must turn its named checks red: the $1,944 restored at L9603; one of the seven reads put back to
its old fallback (each in turn); the planned amount used uncarried; a division unguarded; the new sentence removed or shown always; the §13
note removed; C0 unmutated.

## 4 · Out of scope (recorded)

- **The spousal benefit itself** (DK-3). No engine pays a spouse with no or little record SSA's spousal top-up (up to half the other's benefit
  at 67, once the other has claimed). Disclosed in METHODOLOGY and by the tab's warning; not in any register. Conservative (income
  understated). Recommended: file it as MissingFeatures **D-77** and scope it on its own — it is a modeling change to every engine, and the
  product-boundary test (a mainstream couple, an existing output made more correct) says it qualifies.
- **The spousal warning only looks at spouse B** (found by this scope). With spouse A's benefit at $0 and B's at $1,800 (noSSA), A's spousal
  top-up from B (½ × $1,800 = $900) gets no warning. Recommended: file as UsabilityFlaws **F-36**; fix it with D-77 or on its own.
- **D-56's other members**: the as-of date placeholder, spouse B's claim-age 63 placeholder (the missingB shape still says *"at age 63"*), the
  2029 retirement placeholder, the Roth tab's 5-year-clock line, the Grade tab's literals.
- **Neighbours on the same tab** (the review): on noSSB the claiming grid names *"the model's best cell … Spouse B at 62"* for a spouse with
  $0 (every B column ties and the first wins); with both spouses at $0 the survivor sentence still says *"Spouse A has the larger benefit"*;
  the tab fixes full retirement age at 67, so carrying back to 67 is SSA's rule for people born 1960 or later only (as everywhere on the tab
  today). Recorded; candidates for F-36's release.
- **More disclosures of the spousal top-up** exist than §0.4 named: the tab at L10130 and L10219, and the Field Manual.
- **The example's own table** gives $1,350 at 63 on the tab and $1,300 in the plan (statement figures vs SSA's rates; recorded at v6.37, F-29).
- **`SS_FACTORS`' rough factors** ("used only to seed the claiming table"): they match SSA's rates at 62–65, 67 and 70 for a 67 FRA, which is
  what the helper inverts; 66, 68 and 69 are SSA's too to the rounding. Not changed.

## 5 · Decisions for Steve

**DK-1 · How far the fix reaches.**
- **(a) One helper for both spouses at all seven reads (recommended)** — the table's figure, else the planned amount carried back to 67 at the
  tab's own claim age, else $0 — plus the three division guards. The tab then has one answer for "each spouse's benefit at 67", the same one
  My Data writes. It fixes the shortfall card ($1,458 too small on a no-benefit spouse), the survivor figures, the statement-without-67 case
  and spouse A's NaN — and it moves spouse A's figures on a plan that has A's benefit but no table (aNoTable, §0.5), which the §13 note says.
- (b) Spouse B's main read only (the $1,944 site), with the same rule and the guards. Smaller; the six other reads keep their four fallbacks.
- (c) Replace $1,944 with $0 only. Not recommended: a statement table without an age-67 row would then show B as having no benefit at all.

**DK-2 · What the tab shows for a spouse with no benefit of their own.**
- **(a) The claiming table at $0 a cell, the warning, and one plain sentence under the table (recommended)** — §1.2.
- (b) Hide that spouse's claiming table and what-if card, keep the sentence and the warning. Cleaner, but changes the tab's layout and its
  phone tests.

**DK-3 · The spousal benefit (§4).**
- **(a) File it as MissingFeatures D-77 and the warning's one-sidedness as UsabilityFlaws F-36; model neither here (recommended).**
- (b) Scope the spousal benefit next, instead of filing.

**DK-4 · The version.**
- **(a) Build this as v6.46 now; the 2027 tax figures become v6.47 (recommended)** — the TY2027 scope renumbered a thirteenth time. A search on
  2026-11-05 found no IRS TY2027 revenue procedure (the most recent official release is TY2026's). If the figures publish before this build
  passes its suite, the tax release goes first and this becomes v6.47.
- (b) Wait, and build this after the tax release.

## 6 · Review (2026-11-05)

One independent review read the draft against the v6.45 source, wrote its own probe (one shape at a time against v6.45 and the prototype),
and checked the helper over every planned amount 1–6,000 at all nine ages. It confirmed: the seven reads and their fallbacks; that no engine,
Ask AI, export or other tab reads `tableByAge` (Survivor, Income, Exit plan and Roth blocks read none; Ask AI uses `getSSA`/`getSSB`; the Field
Manual has no 1,944); noSSB, no67 and noSSA reproduced exactly on both builds; the hand arithmetic; `SS_FACTORS` equal to SSA's rates (to
3.3e-5 at 65 and 66); the noSSA asymmetry (only `_spousalBFromA` exists); `t101`'s copies unreached; D-77 and F-36 unused; no IRS TY2027
revenue procedure.

Its findings, each checked and folded in:
1. **(must-fix) The invented benefit reaches the shortfall card, the draw table and the survivor figures, and the fix's biggest changes were
   not stated.** Confirmed by census (`selectedSpouseB`, `_bIncAt`) and by its dumps; the shortfall's $2,462 → $3,920 checked by hand. §0
   (summary, §0.1, §0.3, §0.5), §2, §3.1 §C and §E, DK-1.
2. **(must-fix) §3.1 §C's *Combined income* oracle (`getSSA + getSSB + getPension`) was false** — $5,050 vs $5,000 on the example (statement
   figures), and $1 off at many ages from rounding. Replaced with the tab's formula applied to the helper.
3. **The helper resolved the claim age its own way** (a missing, 0 or 65.4 age read as 67 — a false warning and a $975 card on the
   prototype). It now uses `ssTabClaimAge`. §1.1, §3.1 §B.
4. **DK-1 (a)'s changes to spouse A and no67 were undocumented** ("nothing else changes"). Listed in §0.5 and DK-1; aNoTable added to §3.1.
5. §3.1 §A could not pass as worded (the tab keeps `|| 1` and `|| 63`): narrowed to literals of 1,000 or more.
6. §2's suite list missed `t91`, `t106` and `t84`'s shortfall assertion: added.
7. `pct`'s second reader (A's claiming table, nine NaN cells): added.
8. §3.1 §B's oracle copied the implementation: replaced with `genSSTable` equality and the round trip.
9.–17. Notes, each taken: Start Fresh's B at 67 (§0.2); string values (§0.5); the sentence's wording (§1.2); the neighbours (§4); `t101`'s
   second copy (§3.2); the helper's placement (§1.1); the other disclosures (§4); §D's limit (§3.1 §E); the slider trap (§3.1 §C).

## 7 · Build record (v6.46, 2026-11-05)

Built on v6.45 (`b67f0d9a…`, repo `8d77992`) in a full clone. The IRS's TY2027 revenue procedure was re-checked at the build: searches of
irs.gov that day found it unpublished, so DK-4 (a) held — this is v6.46 and the 2027 figures are v6.47 (the TY2027 scope renumbered a
thirteenth time; `package_check`'s OPEN entry rolled).

**Built as scoped.** §1.1's helper (`ssFraOf`, after `ssTabClaimAge`) and its seven calls; the three guards; §1.2's sentence, under spouse B's
claiming table in place of the derivation note when her figure is $0; the four version sites; the Field Manual's §13 v6.46 note; METHODOLOGY's
new section; `t110` (both legs), `controls_v646_ss_fra.py`, census rows 32–33 (`ss_fra_source`, `spousal_warning`) with `t29` B-40, B-41 and
C-d56-1 to -3; the re-gates of §3.2 (`t101`'s oracle takes the new rule on the v6.46 leg; `t109` A-3 expects the `|| 1944` on v6.45 only);
the registers (§1.4).

**Where the build departed from this scope — each recorded here.**
1. **§0.5's aNoTable figures were measured at the wrong slider age** (the build review). The prototype applied each plan in place, and the
   tab's sliders take their ages only when it mounts, so spouse A was read at the example's 67, not the plan's 65. On a fresh mount A's
   slider is at 65: her card is her own $3,000 on v6.46 (v6.45 read the $3,000 as her age-67 figure and showed $2,600 at 65), and the
   shortfall moves $3,270 → $2,870, not $2,870 → $2,409. The $3,461 at 67 stands. No shipped copy carries the slider-67 figures.
2. **`t110` §C loads every plan from storage into a fresh mount** (t101's storage shim), as §3.1 §C required; its first draft applied plans
   in place and so read every shape at the example's ages — caught by the build review before it shipped. Every oracle still reads the
   slider ages off the cards.
3. **The aNoTable shape is two in `t110`**: `aNoTable` (planned at 67 — renders as on v6.45) and `aNoTable65` (this scope's: planned at 65,
   carried back to $3,461). E-5 pins the second at A's own slider age.
4. **`t110` A-4 is narrower than §3.1 §A said**: a numeric literal of 1,000 or more standing as the fallback on a read of a benefit table,
   anywhere in the source — not "no such literal in the tab's blocks", which fails on the trust-fund year's `|| 2033`. A regression written
   as `ssFraOf("B") || 1944` is caught by C-noSSB, not by §A.
5. **`t110` A-2 matches every computed `[67]` member on any object**, not only `.tableByAge[67]`. The statement parser's read of the table
   it has just parsed (to choose a planned age) is the one other hit, and is allowed by name: a writer, not the tab.
6. **Two of the seven sites have no rendered check**: the breakeven block and the claiming grid. They are held by A-2 and A-3 and by
   controls K4, K5, K13 and K14, which turn only those red. §D holds every plan whose tables hold 67 to v6.45's text.
7. **Two dead locals removed** (`_srcB`, `_srcG` — the seven reads left them unused).
8. **Copy**: the §13 note and METHODOLOGY say *spouse B* where only spouse B gets the sentence and the warning (spouse A with no benefit
   shows 0% of FRA, no sentence, no warning — F-36); the §13 note carries no typed pronoun (v6.28 V-12's rule for in-app copy).
9. **The oracles state the helper's rule**: `t110`'s `fraOf`, `t101`'s `_fra` and the census's rows write the same rule out from the plan's
   fields. They check that each surface is wired to the rule; the rule itself is pinned independently by `t110` §B (`genSSTable`'s age-67
   cell over 6,000 amounts at nine ages and the SSA round trip) and §E's hand figures.

**The build review** (one independent reviewer, read-only, no suite runs) confirmed the source against §1 by AST on both builds (seven
`ssFraOf` calls at the seven sites; three divisions, all guarded; `|| 1944` gone — the one 1944 left is the historical-returns table), the
helper over every planned amount at every age, and every figure in the §13 note and METHODOLOGY by hand ($7,620; $1,458; $2,462 → $3,920;
1.8% → 2.9%; $5,158 → $3,700; $1,650 / $19,800; $1,733; $3,461). Its findings, each acted on: this document, the CHANGELOG, TESTING and the
manifest not yet written (written in this package); the sliders (1 and 2 above); the controls short of §3.4 — two of spouse A's reads and
the note's division had no mutant (K13, K14, K15 added; K2 now also expects the aNoTable65 checks); the v6.45 leg of `t110` not rerun after
an edit (rerun); the copy (8); A-4's narrowing undisclosed (4); A-5 accepted a guard whose division sat in the other branch (it now requires
the division inside the guarded branch); A-2's narrow matcher (5 — the review's note that the parser has no `[67]` read was itself wrong:
the parser reads a bare local `tableByAge[67]`); v6.45-leg pins for no67 and aNoTable65 (added); METHODOLOGY's "on the example" (now "the
example with spouse B's benefit removed") and its claim that every table holding 67 renders identically (a table stored as text now reads as
numbers — said so); the dead locals (7).

**Counts, controls and the ship** are in the CHANGELOG's v6.46 entry and TESTING (from suite output, not restated here).
