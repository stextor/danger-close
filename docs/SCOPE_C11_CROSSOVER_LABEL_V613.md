# SCOPE — v6.13 · C-11: the break-even card says what it measures · C-9 closed on evidence · the age-65 deduction read at source

**DRAFT — 2026-10-15, awaiting Steve's decisions (§5).** Repo-only. A **PRESENTATION** release: the planned source change is
user-facing text plus one code comment and the version bump. No engine, constant or figure moves, and §3 §D asserts that by AST.
METHODOLOGY changes anyway, because its crossover section misdescribes the measure (C-11) and leaves out one simplification (§0.3).
Steve, 2026-10-15: *"Yes, scope C-11 with C-9 and the deduction check folded in."*

**Built against v6.12.** Fresh clone of `origin/main` at `e1d89ab` (v6.12 plus its chmod). Source `fc8d2a5f98a1f68314a57214db845426` and built
`index.html` `bc19a24e446ab595ea8975f6fe4191a4` both equal the manifest's Current table, and the tree is clean. The tag `v613` is free:
`vercensus.cjs v613` over `qa/` and `src/` finds 0 sites, and no `dom_entry_v613.jsx` exists in history. Unless marked otherwise, every
line number below is a v6.12 line in `src/DangerClose.jsx`, found with the parser tools (`census.cjs`, `textsites.cjs`, `suitetext.cjs`,
`lits.cjs`; OPERATIONS §B1).

Three items, one release:

| Item | What the scope found | What v6.13 does |
|---|---|---|
| **C-11** | Confirmed: the card and the Field Manual each call a face-value total "after-tax wealth", and METHODOLOGY's crossover section does the same. Its own next paragraph says the measure is face value | Corrects the wording in those three places and adds a source-comment fix |
| **C-9** | **Already fixed at v6.07** by D-33, which did not cite the ID. Re-measured: v6.06 reproduces the defect, and v6.12 is identical to the cent | Corrects the register and adds an extinction check |
| **Deduction check** | $1,650 / $2,050 **confirmed** against Rev. Proc. 2025-32 §4.14(3) itself. The v6.12 CHANGELOG's caveat was unneeded, and the miss was mine (§0.3). Separate finding: the §63(f) **blind** amount is not modelled and not disclosed | Resolves the caveat and discloses the blind amount (DC-4, DC-5) |

---

## 0 · Premise (verified at v6.12, not assumed)

### 0.1 · C-11: what the card measures, and what three documents say it measures

**The measure.**
- Engine A (`runRothStrategies`) records each year's total as `wealthByYr[yr] = Math.round(taxBal + rothA + rothB + tradA + tradB)` (L5215).
  That is taxable, Roth and Traditional money all at **face value**, with Traditional dollars counted before the income tax still owed on them.
- The comment above it (L5207–5214) says this is deliberate: the card answers the cash question "when does the tax I paid come back?"
- `rothCrossover` (L1413–1425) reports the first year the slider strategy's total reaches the NO CONVERSIONS total.

**The census.** The pattern `[Aa]fter-tax` (`textsites.cjs` over every string, template and piece of JSX text, plus the DOCS_HTML windows)
finds **two** sites that use "after-tax wealth":

| # | Site | Text | Verdict |
|---|---|---|---|
| 1 | The card, recovered branch (L10675) | "First year your strategy's **after-tax wealth** catches the NO CONVERSIONS path (deepest earlier shortfall …)." | **Wrong**: the measure is face value |
| 2 | Field Manual, Roth entry (DOCS_HTML L4499 @57893–58200) | "…the card reports the first year your **after-tax wealth** catches up — so discounting and the opportunity cost of the conversion tax are included mechanically…" | **Wrong** in the same words |
| 3 | METHODOLOGY.md L1110–1111 (repo document) | "…and reports the first year the strategy's **after-tax wealth** catches the baseline." Seven lines later (L1118) it says "The crossover deliberately uses FACE VALUE" | **Wrong**, and the section contradicts itself |
| 4 | Source comment (L10641, not user-facing) | "First year the slider strategy's after-tax wealth ≥ the NO-CONVERSIONS path." | Wrong. Fixed for consistency |

Every other "after-tax" site is about something else and is correct as it stands: the annuity's after-tax basis, Roth contributions, a lump-sum pension, the bonus remainder.

**Read and found accurate, so left unchanged:**
- **The card's other three branches.** Their wording is "in cash terms", "never fall behind" and "No measurable".
- **The card's METHOD line** (L10681). It already says "wealth compared year-by-year at FACE VALUE … this card answers the cash question".
- **The Roth assumptions box** (L10494–10495): "computes this from the full 30-year engine (discounted, opportunity cost included)".
  - `docs/AUDIT_2D_BREAKEVEN_v5_28.md` §1 and §3 verified both claims by measurement. Same-year comparison equals discounting at the portfolio's growth rate: eleven yearly ratios, each within rounding of 1.045. The opportunity cost of the conversion tax is mechanical.
  - Correction to my own working notes: I had listed this box as a fourth C-11 site. It is not one.

**Why the register's "three sites" holds:** the card, the Field Manual and METHODOLOGY. The comment makes four code-side.

**Invisible on the example household (OPERATIONS §K1).**
- I rendered the Roth tab on the example (session-only, `c11_dom.mjs`, v6.12 DOM bundle, slider driven through the native setter as `t24` does).
- At nine slider positions from $5,000 to $200,000, the card shows **"Does not break even within the plan"** every time. That is the third branch.
- The mislabelled first branch never renders on the example.
- It does render on a household with the example's data and both spouses living to 100, at $5,000: **"2062 — age 98 / 96"**, with the wrong sentence beneath it.
- §2.3 adds the boundary that hid it to the census, as §K1 requires.

### 0.2 · C-11: would an after-tax measure answer differently? (measured, so DC-1 can be decided on numbers)

**How it was measured.**
- I used a session-only copy of v6.12, never shipped. Its only change is that Engine A also returns each year's Traditional balance.
- The copy's `wealthByYr` is byte-identical to the shipped module's in every cell.
- For each household and conversion amount, I ran the shipped `rothCrossover` on two measures:
  - face value, as shipped;
  - Traditional balances reduced by a flat 12%, 22% or 24%, as an "after-tax" count would.
- Inputs are the card's own, read from source (L10600–10619):
  - the default scenario ("bull", L805);
  - the household's ACA bridge premium;
  - the spending-draw series for the slider amount.
- (A first pass of this probe built the inputs with no ACA premium and the base scenario, and disagreed with the rendered card in two of six
  cells. With the card's inputs it agrees with the rendered card in all seven cells compared: the example at $70,000, both-to-100 at $5,000,
  $15,000 and $70,000, and survivor A at the same three. The cells below are from the corrected run.)

| Household | Slider | Face value (shipped) | Traditional at 88% | at 78% | at 76% |
|---|---|---|---|---|---|
| Example | $10K | never | never | 2053 | 2039 |
| Example | $20K | never | never | 2037 | 2032 |
| Example | $30K | never | never | **never behind, from 2029** | never behind, from 2029 |
| Example | $50K | never | never | never behind, from 2029 | never behind, from 2029 |
| Example | $70K (default) | never | 2052 | never behind, from 2029 | never behind, from 2029 |
| Example | $100K | never | 2052 | never behind, from 2029 | never behind, from 2029 |
| Both to 100 | $5K | **2062** (matches the rendered card) | 2059 | 2055 | 2053 |
| Both to 100 | $15K | never | never | 2040 | 2035 |
| Both to 100 | $70K | never | never | 2066 | 2066 |
| `t10`'s 2D fixture | $10K | never behind, from 2045 | never behind, from 2027 | from 2027 | from 2027 |
| `t10`'s 2D fixture | $30K | 2048 | never behind, from 2027 | from 2027 | from 2027 |
| `t10`'s 2D fixture | $60K | never | never behind, from 2027 | from 2027 | from 2027 |

**Two things follow.**

1. **Face value is the conservative direction, and that is argued as well as measured.**
   - The argument: a fixed conversion only ever leaves the strategy holding less Traditional money than the baseline. The gap starts at the converted amount. Each later year carries the gap forward through the same growth and the same RMD divisor, and the spending draw takes the same dollars from both paths. So the gap never goes negative, and deducting any rate from Traditional balances can only shrink the strategy's shortfall.
   - The measurement agrees: in all 36 cells, the after-tax count moved the crossover earlier or left it unchanged.
2. **An after-tax answer is decided by the rate you pick.**
   - On the example at $30,000, a 12% rate says "never" and a 22% rate says "ahead from the first year".
   - That second answer is the instant paper gain METHODOLOGY's face-value paragraph warns about: moving a dollar from Traditional (counted at 78¢) to Roth (counted at $1) looks like a profit before any tax is saved.
   - The rate that would be right is the household's own future marginal rate, and the card would have to guess it.

The relabel (DC-1 (a)) therefore keeps the measure that was verified at v5.28 and says what it is.

### 0.3 · The deduction check (primary source read 2026-10-15)

**The primary source.** Rev. Proc. 2025-32, fetched from irs.gov (`/pub/irs-drop/rp-25-32.pdf`).
- §4.14(3): "the additional standard deduction amount under § 63(f) for the aged or the blind is **$1,650**. The additional standard deduction amount is increased to **$2,050** if the individual is also unmarried and not a surviving spouse."
- §4.14(1): basic standard deduction $32,200 joint, $16,100 single.

**The app.** `TAX_CONSTS.SENIOR_EXTRA_SGL: 2050, SENIOR_EXTRA_MFJ: 1650` (L903, by AST). `seniorExtraFor` (L942–944) indexes them. Both equal the primary source.
- The app's survivor files Single, not as a qualifying surviving spouse, so $2,050 is the right amount in survivor years.
- Eight suites already carry the figures as their own independent literals:
  - `t10` L89, `t15` L75, `t16` L106, `t18` L69, `t40` L77, `t67` L53, `t75` L63, and `d30_ref` L16.
  - Each traces to §4.14.
- **No new check is needed.**

**My error at v6.12, owned.**
- The v6.12 CHANGELOG's last limitation says the $1,650 / $2,050 constant "was not re-read against Rev. Proc. 2025-32 in this release's sessions".
- That sentence was true of those sessions, but it left the impression the figure was unverified.
- It had been verified. The Phase 2 register's constants table (`docs/FlawsToFix-v5_73-Phase2.md` L104) records "Additional std deduction, aged | 1,650 (married) / 2,050 (unmarried) | §4.14(3) | ✓".
- I did not find that row before writing the caveat. DC-4 decides how the record is corrected.

**A separate finding: the blind amount.**
- §63(f) gives the same additional amount to a **blind** filer, and it stacks with the age amount.
- The app has no blindness input:
  - `census.cjs blind` finds 0 AST hits;
  - `textsites` finds the word only in the colour-theme names.
- No document says so for the federal return. METHODOLOGY's only mention (L185–186) is about New Mexico's state exemption.
- Effect: a blind filer's federal deduction is understated and their federal tax overstated. That is the conservative direction, but the simplification is undisclosed.
- **The product-boundary test:** a mainstream couple near retirement can include a blind spouse, but it is uncommon. Adding an input would add a new output path for a rare case.
- DC-5 recommends disclosure, not modelling.

### 0.4 · C-9: fixed at v6.07, re-measured to be sure

**The register's C-9** (`docs/FlawsToFix-v5_73-Phase2.md` L46 and L301–309):
- The annuity's exclusion from the RMD base was a share fixed at retirement start.
- As RMDs drained the pool, the share under-excluded, and RMDs crept up: "+$255 (2040) … +$4,547 (2050)" on an earlier build of the example plus a $100,000 non-qualified annuity for A.
- The register's fix direction: "track the annuity amount, not a share".

**v6.07 (D-33) did exactly that.**
- Its CHANGELOG reads: "through v6.06 the share was constant … every RMD and conversion left the pool pro rata with the share held fixed, draining annuity dollars the law never touches, so the model understated the annuity and overstated every later RMD."
- It carried the annuity dollars and re-took the share every year, in every engine that holds it:
  - Engine A: `_annShA` at L4665, L4740 and L5197.
  - Engine C: `_annShareA` at L5322, L5369 and L5455.
  - Engine B: `_annShareA` at L6183, L6242 and L6407.
- Neither the D-33 scope nor its CHANGELOG cites C-9. **The same pattern left C-10 open after v6.09** (corrected at v6.12), which is why DC-6 exists.

**Re-measured** (session-only, `c9_probe.mjs` / `c9_engA.mjs`, run folder `runship612`).
- v6.06 was built from history: commit `9232406`, source `a5ac49a5…`, equal to the parent of the first v6.07 commit.
- Household: the example, plus a $100,000 non-qualified annuity owned by A, compared with the example as shipped.
- Settings: no spending draws, no QCD, taxable yield 0.
- The opening RMD base is identical in both runs: `rmdInitA` 1,180,000 and `annShareA` 0.0781. The annuity correctly sits outside the base on day one.

| Engine · conversions | v6.06: with-annuity RMD minus without | v6.12 |
|---|---|---|
| B · $0 | +$257 (2040), +$543 (2041), +$1,885 (2045), +$4,543 (2050), +$6,849 (2053); 14 of 15 RMD years, **+$41,217 lifetime** | **$0.00 in all 15 years** (largest difference 2.9 × 10⁻¹¹) |
| C · $0 | identical to B | identical to B: $0.00 |
| B and C · $70,000 | 15 of 15 years, +$74,701 lifetime | $0.00 in all 15 |
| A · $0 (NO CONVERSIONS) | the annuity ends at $249,161, not $300,543; total tax +$8,879 | the annuity ends at **$300,544 = $100,000 × 1.045²⁵**, rounded; total tax **identical** |

**Reading the table.**
- v6.06 reproduces the register's shape on today's example: +$257 / +$543 / +$1,885 / +$4,543 against the register's +$255 / +$540 / +$1,878 / +$4,547, measured on an older build of the example.
- v6.12 shows no trace of it.
- **C-9 is fixed, and has been since v6.07.**
- `t70` §C (v6.07) already checks Engines B and C's RMD every year against an independent recursion that carries annuity dollars.
- What no suite asserts is C-9's own statement: with-annuity RMD equals without-annuity RMD, year by year. §3 §C adds that as the extinction check.

**Scope boundary.**
- With spending draws on, the two RMD series differ by design. A draw takes annuity money pro rata at the year's share (D-33's DD-2, decided at v6.07), so the non-annuity base is drawn less.
- That is not C-9, and the extinction check runs with draws off, as C-9's own measurement did.

---

## 1 · The change (recommended options)

### 1.1 · The card's recovered branch (L10675)

Old:
> First year your strategy's after-tax wealth catches the NO CONVERSIONS path (deepest earlier shortfall $XK). Before this year, converting had cost more than it saved; after it, the tax savings compound.

New:
> First year your strategy's account total — every balance at face value, so Traditional dollars count before the tax still owed on them — catches the NO CONVERSIONS path (deepest earlier shortfall $XK). Before this year, converting had cost more than it saved; after it, the tax savings compound.

- The header stays (DC-2).
- The METHOD line stays: it already says FACE VALUE and why.

### 1.2 · The Field Manual's Roth entry (DOCS_HTML, edited with quote-free anchors, OPERATIONS §C0)

Old:
> …and the card reports the first year your after-tax wealth catches up — so discounting and the opportunity cost of the conversion tax are included mechanically, and for some households the honest answer is that it never does.

New:
> …and the card reports the first year your account total catches up — every balance at face value, so Traditional dollars count before the tax still owed on them, which makes the answer arrive no earlier than an after-tax count would (DC-3). Discounting and the opportunity cost of the conversion tax are included mechanically, and for some households the honest answer is that it never does.

- The history paragraph's "The Roth break-even was rebuilt as a wealth crossover" (@20074) stays.
- It is also what keeps `t31`'s B-2 control valid. That control needs "Roth break-even" in the raw manual and **not** in the render tree, so the card's new text must not contain that phrase, and §1.1's does not.

### 1.3 · METHODOLOGY.md, "Roth break-even: the wealth-crossover method (v5.7.1)"

**The heading stays.** `t31` B-0 needs "Roth break-even" in METHODOLOGY.

**L1110–1111** becomes: "…and reports the first year the strategy's account total — every balance at face value, Traditional dollars before
the tax still owed on them — catches the baseline."

**A new paragraph after the FACE VALUE paragraph** (DC-3):
- *What it says.*
  - The direction argument from §0.2.
  - The 36-cell measurement, including the example's "never behind from 2029" at 22%.
  - One line of history: "Through v6.12 this section, the card and the Field Manual called the measure 'after-tax wealth' (C-11)."
- *Measurement wording.* State plainly that the 36 cells came from a session-only instrumented copy. They are not a shipped assertion.

**Federal deductions** (DC-5): one sentence beside the §63(f) passage (L396–399): "The same additional amount for a **blind** filer is not
modelled — the app has no input for it — so a blind filer's federal tax is overstated (the conservative direction)."

### 1.4 · The Field Manual's simplifications list (DC-5)

One `<li>` beside the OBBBA senior-bonus item (DOCS_HTML @126995), quote-free:

> The additional standard deduction for a blind filer (§63(f), $1,650 per spouse joint, $2,050 single for 2026) is not modelled — there is no input for it — so a blind filer's federal tax is overstated (conservative).

### 1.5 · The source comment (L10641)

"after-tax wealth ≥" becomes "account total at face value ≥".

### 1.6 · Version bump to v6.13

The four in-app sites: footer, DATA LOAD header, Field Manual callsign, Field Manual footer.

**Nothing else in the source changes.** In particular, nothing in Engine A, `rothCrossover`, the C-9 sites or `TAX_CONSTS` changes.

---

## 2 · Site census

### 2.1 · App (v6.12 lines; re-run at the build and recorded in §7)

| Site | Line | Change |
|---|---|---|
| Card, recovered branch (JSX text) | L10675 | §1.1 |
| Source comment | L10641 | §1.5 |
| Field Manual Roth entry | L4499 @57893–58200 | §1.2 |
| Field Manual simplifications list | L4499 @126995 | §1.4, a new `<li>` |
| Version strings | four sites | §1.6 |
| Card header, the other three branches, METHOD line | L10666, L10676–10678, L10681 | unchanged (DC-2) |
| Roth assumptions box | L10494–10495 | unchanged: accurate (§0.1) |
| Engine A, `rothCrossover`, `TAX_CONSTS`, every engine | — | unchanged, asserted by §3 §D |

### 2.2 · Suites that touch these strings (`suitetext.cjs` over `qa/`)

The pattern was `after-tax wealth|discounted, opportunity cost|WEALTH CROSSOVER|cash terms|FACE VALUE|catches the|Break-even|break-even`. It finds three sites:
- **`t10` L390 and L1695.** Test names only. `t10` 2D drives `runRothStrategies` and `rothCrossover` directly, and neither changes.
- **`t31` L136.** The `CTRL_DOCS = "Roth break-even"` control. It stays valid under §1.2 and §1.3, and §3 §A-4 guards it explicitly.

No suite asserts the card's text today, so nothing goes red on the change alone. That is why `t76` §A and §E exist.

### 2.3 · Re-gated or extended

- **`t29` and `qa/tools/boundaries.mjs`: the §K1 obligation.**
  - A new census row `crossover`: "the Roth tab's break-even card at the opening slider ($70,000)". It reads the branch the card would show.
  - It reads ON when that branch is not "recovered after a deficit", the branch whose text was wrong.
  - **On the example it reads ON, "does not break even".**
  - `t29` gains A-3's row-present check and a B-10 pin, both legs: about +2 a leg.
  - ⚠ **The row rebuilds the card's inputs**, a second copy of L10600–10619. §0.2 shows how easily that copy drifts: the first probe missed the ACA premium and the default scenario. So `t76` §E asserts that the row's branch equals the **rendered** card's on two households.
  - The shared parts are read through the shim: `DEFAULT_SCENARIO_PRESET`, `acaBridge` from the portfolio, and `withdrawalPlanSeries`.
- **`domdiff`.** The pair is re-pointed to v612 → v613, back to **strict identity** on all three tax-bearing tabs. The v611 → v612 Bracket mask was pair-gated, so it falls away on its own; the build confirms that, and the release touches none of those tabs.
- **Version registration of `v613`.**
  - By AST, with `register_v611.cjs`.
  - By hand: the value-selecting ternaries (`t1` L244, `t4` L65), `t33`'s PINS, the three Python `KNOWN_VERSIONS` lists, `qa/qa-baseline/dom_entry_v613.jsx` and the runsuite lines.
  - The v612 census is the cost to expect: 213 judgement points.

---

## 3 · Tests — new `qa/t76_crossover_label.mjs`, both legs (v6.12 prior, v6.13 current)

**Leg rules.** The v6.12 leg pins C-11 as dated `[KNOWN DEFECT C-11]` checks. C-9 checks hold on **both** legs (it was fixed at v6.07). Dollar-exact where an engine is read; the rendered checks read through `window.__g` behind a setup check (OPERATIONS §C).

**§A — the copy, by AST over the leg's own source**
- **A-1 [EXTINCTION C-11]:** no string, template or JSX text anywhere in the app contains "after-tax wealth".
  - Current leg: 0 sites.
  - Prior leg: exactly 2, the card and the Field Manual.
- **A-2:** the card's recovered branch carries §1.1's sentence (current leg), or the old one (prior leg).
- **A-3:** the Field Manual's Roth entry carries §1.2's sentence, and its simplifications list carries §1.4's item.
- **A-4 (guard):** "Roth break-even" is still in DOCS_HTML and in no JSX text. That is `t31`'s control precondition, stated where it could break.

**§B — METHODOLOGY (current leg only, as `t31` reads it: the run folder holds one METHODOLOGY.md)**
- **B-1:** the crossover section contains no "after-tax wealth" and states the measure at face value.
- **B-2:** the direction paragraph is present.
- **B-3:** the heading still contains "Roth break-even".
- **B-4:** the blind sentence is present (DC-5).

**§C — C-9 extinction (both legs)**
- **C-0 (preconditions, so the section cannot pass vacuously):**
  - A's pool holds exactly the $100,000 of annuity money (`tradInitA − rmdInitA`);
  - the no-annuity run has at least ten RMD years.
- **C-1 / C-2:** Engine B's and Engine C's `rmd_y` with the annuity equal the no-annuity run's **to the cent, every year**, with conversions at $0 and no draws.
- **C-3 / C-4:** the same, with conversions at $70,000.
- **C-5:** Engine A's NO CONVERSIONS run.
  - The end Traditional balance exceeds the no-annuity run's by $100,000 compounded at Engine A's growth rate over the horizon, within $1. The rate is read through the shim, not typed.
  - Total tax is identical.

**§D — the release moved text only (current leg; needs both sources)**
- **D-1:** the v6.13 AST equals the v6.12 AST once these are masked:
  - string contents;
  - template quasis;
  - JSX text;
  - comments.

  So no operator, identifier, number or structure changed.
- **D-2 (control, so D-1 is not vacuous):** the same comparison **without** the mask finds differences, exactly in the sites of §2.1.

**§E — rendered (both legs)**
- **E-0 (setup):** the rendered household is the one loaded (lifeExp read through `window.__g`), and the slider drives the card. This follows `t24`'s native-setter route.
- **E-1:** on the example at the opening slider, the card shows "Does not break even within the plan", and the census row agrees.
- **E-2:** on the example with both spouses to 100, at $5,000, the card shows the **recovered** branch and 2062 (the measured value).
  - Current leg: §1.1's sentence and no "after-tax wealth".
  - Prior leg: pinned `[KNOWN DEFECT C-11]`.
- **E-3:** the census row's branch equals the rendered card's on both households. This keeps §2.3's second copy honest.

**Expected size.** Roughly 25 checks a leg. The build records the real count from the suite's own output, never from this estimate.

**Controls.** `qa/tools/controls_v613_c11.py`, repo-only and release-pinned (OPERATIONS §G). Each planted defect must turn its named checks red, and every file is restored and hash-checked:

| # | Planted defect | Red |
|---|---|---|
| 1 | The card's old sentence restored | A-1, A-2, E-2 |
| 2 | The Field Manual's old sentence restored | A-1, A-3 |
| 3 | "Roth break-even" removed from the manual's history paragraph | A-4 (and `t31` B-2) |
| 4 | METHODOLOGY's old sentence restored | B-1 |
| 5 | v6.06's fixed share restored in Engine B (`_annShareA` not re-taken at L6407) | C-1, C-3 |
| 6 | The same in Engine C (L5455) | C-2, C-4 |
| 7 | The same in Engine A (L5197) | C-5 |
| 8 | A non-text change: `rothCrossover`'s `>= 0` made `> 0` | D-1 |
| 9 | The census row's ACA input dropped, the drift §0.2 actually made | E-3 |
| 10 | The unmutated run | all green |

---

## 4 · Out of scope, and stop conditions

**Out of scope:**
- **Changing the crossover's measure** (DC-1 (b) and (c)).
- **Publishing Engine A's per-year Traditional balance.** §0.2's instrumentation was session-only. Exporting it is an engine change, and
  OPERATIONS §M keeps a change and its new assertions in separate releases.
- **Why the example household never breaks even.** The deficit is the conversion tax compounded, and AUDIT_2D verified the technique. This scope relabels the answer; it does not re-examine it.
- **Draw-side annuity treatment.** Pro rata at the year's share is DD-2, decided at v6.07.
- **Engine D's annuity handling.** D-33 left it untouched: the annuity sits in its Priority-1 pool.
- **Modelling the blind deduction**, which would need a new input (DC-5 (c)).
- **The OBBBA senior deduction on the Roth tab.** Already disclosed.
- **E-23 / E-24**, and every other register item.

**Stop conditions (stop and report; do not adapt):**
- the build's census of "after-tax wealth" finds a site that §0.1 does not list;
- a suite other than `t29`, `domdiff`, the version registries and the new `t76` changes count;
- §3 D-1 finds a non-text difference that is not the planted control;
- the rendered card disagrees with §0.1's measured branches on the example or on the both-to-100 household;
- MC parity is anything but 10/10.

---

## 5 · Decisions for Steve

Each has a recommendation. "Recommended" means what I would do; it is your call.

**DC-1 — What the card measures.**
- **(a) Recommended: keep face value and say so.** The measure was verified at v5.28 (AUDIT_2D). Only the label is wrong.
- (b) Switch to an after-tax count at a flat rate. Not recommended: §0.2 shows the answer is set by the rate chosen. At 22%, every conversion on the example reads "ahead from year one", the paper gain the method was built to avoid.
- (c) Show both. More text on a crowded card for a figure that depends on a guessed rate.

**DC-2 — The card's header** ("BREAK-EVEN — WEALTH CROSSOVER vs NO CONVERSIONS").
- **(a) Recommended: unchanged.** "Wealth crossover" is accurate once the body defines the total, and the name is used in the Field Manual twice and in METHODOLOGY's heading.
- (b) Rename it to "CASH CROSSOVER". This ripples to three more sites, for no gain in correctness.

**DC-3 — Saying that face value is the conservative direction.**
- **(a) Recommended: METHODOLOGY gets the argument and the 36-cell measurement, and the Field Manual gets one clause** ("which makes the answer arrive no earlier than an after-tax count would").
- (b) METHODOLOGY only.
- (c) Also add it to the card's METHOD line, which is already long.

**DC-4 — The v6.12 CHANGELOG's unneeded caveat** about the $1,650 / $2,050 deduction.
- **(a) Recommended: leave v6.12's text as shipped, and add a dated line beneath that bullet.** "Resolved at v6.13: read against Rev. Proc. 2025-32 §4.14(3), $1,650 / $2,050, equal. It had also been verified in the v5.73 audit's register (FlawsToFix L104), which this entry missed."
- The v6.13 entry says the same. Shipped entries are not rewritten, and the correction sits where a reader of the error will see it.
- (b) The v6.13 entry only.

**DC-5 — The §63(f) blind amount.**
- **(a) Recommended: disclose it.** One sentence in METHODOLOGY and one item in the Field Manual's simplifications list. The conservative direction, stated in-app, per the design default.
- (b) METHODOLOGY only.
- (c) Model it with a new input per spouse. It would make an existing output more correct, so it passes the product test. Not recommended now, though: it adds an input every user sees, for a case few have. It could be its own small scope later.

**DC-6 — Twice now a fix has closed a register item without citing it** (C-10 at v6.09, C-9 at v6.07), leaving the register wrong until a later scope stumbled on it.
- **(a) Recommended: one line in OPERATIONS' scope rules.** At scope time, search the registers for the defect's **mechanism** (the variable or the rule), not only for an ID, and cite every item the fix closes.
- (b) No process change.

---

## 6 · Register housekeeping at ship (not decisions; corrections the release carries)

- **`docs/FlawsToFix-v5_73-Phase2.md` — C-9.**
  - Census row L46 becomes **FIXED v6.07** *(row corrected 2026-10-15)*, with this evidence: D-33 carries the annuity dollars and re-takes the share yearly in Engines A, B and C; the D-33 scope did not cite this ID; re-measured at the v6.13 scope (v6.06 +$41,217 lifetime RMD on the example + $100K annuity; v6.12 $0.00 in every year); `t70` §C and `t76` §C.
  - Summary-table row L74 gains "· **FIXED v6.07** (D-33)", as C-10's does.
  - The body (L301) gains a fix note.
- **The same register — C-11.** Census row L48 becomes **FIXED v6.13**: the card, the Field Manual and METHODOLOGY name the face-value measure; `t76` §A, §B and §E.
  The summary row L75 is updated likewise.
- **`docs/ARCHITECTUREIssues.md` — E-25.**
  - Census row L42 becomes **FIXED v6.13**. All eight classes are now covered: C-9's ("Annuity share over a long horizon") by `t70` §C since v6.07, and by `t76` §C.
  - The class table row (L1003) gets its nearest test updated.
- **`CHANGELOG.md`** — per DC-4.
- **OPERATIONS** — per DC-6. Also §K1's census gains the `crossover` row (§2.3).

---

## 7 · Build record

*(Filled at the build: the parser census re-run on v6.12, every count from suite output, controls, and the package verification.)*

---

**Destination:** repo `docs/SCOPE_C11_CROSSOVER_LABEL_V613.md`. **Not pooled** (OPERATIONS §G: scope documents are repo-only).

**Session-only material, not shipped:**
- in the run folder `runship612`:
  - the probes `c9_probe.mjs`, `c9_engA.mjs`, `c11_probe2.mjs`, `c11_dom.mjs`, `c11_dom3.mjs` and `dd_probe.mjs`;
  - the instrumented `v612i.jsx`;
  - `app_v606.mjs`.

They are recorded here so the numbers can be traced, and they expire with the session.
