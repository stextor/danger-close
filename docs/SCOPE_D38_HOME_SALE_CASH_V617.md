# SCOPE — v6.17 · D-38: the cash from a home move becomes a My Data field

**FULFILLED — shipped as v6.17, 2026-10-16.** Steve: *"go"* — all five decisions (a), as recommended. Build record in §7. Repo-only.

Steve, 2026-10-16: *"Let's make the home-sale cash a field in My Data rather than a number in the code."* This followed a question about a
sentence from another chat, which said the cash left from selling a home is "hardcoded at $130K (`HOME_SALE_PROCEEDS`, line 1121)".

This is a **MODELLING** release, so METHODOLOGY changes. By census (§2) it reaches the two Monte Carlo engines, the plan-review event, the
Ask AI context and My Data. The Taxes, IRMAA, Withdrawal and Roth engines never read the constant, and the release must prove they do not
move (§3).

**Built against v6.16.** I made a fresh clone of `origin/main` at `8e54a6a` (v6.16 plus its chmod). The source is
`dfc07ee74ad9dd52c0925f54bee0a682` and the built page is `765cd89f6c5d97a937f2fa2e7405ee64`, the release verified on 2026-10-16. Every line
number below is a v6.16 line from `census.cjs` and `textsites.cjs`. (The other chat's "line 1121" was an earlier build; it is L1126 now.)
The register ID D-38 is free.

---

## 0 · Premise (verified at v6.16, not assumed)

### 0.1 · What the app does today

- **One constant, every plan.** `const HOME_SALE_PROCEEDS = 130000;` (L1126, under "One-off plan cash flows shared across engines"). No
  input sets it. So **every plan** — the example, a plan built with Start Fresh or the guided wizard, an imported backup — gets $130,000
  added to its portfolio in the quarter it retires, whether or not anyone is selling a home.
- **Where it is read (`census.cjs`, 6 sites):**
  - `runMonteCarlo` L2529 (the planned path) and L2590 (each simulated path) — the Monte Carlo tab's 6-year headline;
  - `runExtendedMC` L2711 and L2806 — the 30-year runs behind the Monte Carlo, Stress and Dashboard tabs, and the Future Home mortgage
    what-if. Here it is `HOME_SALE_PROCEEDS + futureHomeMortgage`: a modelled mortgage adds its principal on top, as cash kept invested;
  - the Events tab's retirement card, L2215: "home-sale logistics (the plan books $130K at retirement)".
- **What does not read it.** Engines A (Roth strategies), B (Taxes), C (IRMAA) and D (Withdrawal) and the Roth tab's ladder have no
  reference to it. So the Withdrawal tab's schedule never sees the home-sale cash, while the Monte Carlo does. That is an existing
  inconsistency, out of scope here (DC-4).
- **It is a net figure, though nothing says so.** The model never buys the next home. The only new-home costs it knows are expense rows
  (in the example: "Future Home Mortgage" $0, "Closing Costs (Future Home)" $8,000 once, L63). So the $130,000 has to stand for: the old
  home sold, its mortgage paid off, the next home paid for in cash, and what is left over invested. It can be negative.
- **Never disclosed.** Apart from the Events card, no text tells the user the figure exists: not My Data, not the Monte Carlo tab, not the
  Field Manual (`textsites.cjs`: its only home-sale mention is "home sale and cash purchase" in the overview), not METHODOLOGY. The project's
  rule is that simplifications are disclosed in-app, never silent.
- **The direction is optimistic** for anyone not moving, and for anyone whose next home costs more than the old one nets: both are told
  they will have $130,000 they will not have.
- **Already in My Data:** "Home value $", "Mortgage balance $" and "Mortgage rate %" (L13443–13447). They feed the Ranking tab's net worth
  and the Ask AI context (L9357, L13145), not the Monte Carlo.
- **Tests.** No suite references the constant (`suitetext.cjs` and a file search: 0). The five suites that run the Monte Carlo (`t2`,
  `t20`, `t42`, `t56`, `t79`) all run it on the example household or a copy of it.

### 0.2 · Measured (v6.16 with the constant replaced, example household; 4,000 paths, the same random seed for every row)

| Home-move cash | 6-year: ending above $800K | 6-year median | 30-year (LTC shock, deaths): above $800K | ruin | median | 10th pct |
|---|---|---|---|---|---|---|
| **+$130,000 (today, every plan)** | 99.3% | $1,977K | 81.1% | 2.2% | $1,604K | $481K |
| $0 (not moving) | 99.2% | $1,851K | 74.8% | 3.4% | $1,352K | $335K |
| −$25,000 | 99.2% | $1,809K | 73.2% | 3.6% | $1,307K | $309K |
| −$105,000 | 98.5% | $1,720K | 67.6% | 4.7% | $1,151K | $221K |

On a smaller household (the example's holdings at 40%), the 6-year headline goes from 64.8% at +$130,000 to 39.2% at $0 and 20.1% at
−$105,000. The $130,000 is worth about $250,000 of median 30-year ending balance on the example, so for a user who is not moving it is the
largest single optimism in the Monte Carlo.

### 0.3 · Register sweep (OPERATIONS §K2)

`FlawsToFix-*`, `ARCHITECTUREIssues.md`, `MissingFeatures.md` and `UsabilityFlaws.md` searched for `HOME_SALE`, "home sale",
"home-sale", "sale proceeds", "130,000", "downsiz" and "hard-coded" cash flows: **nothing**. The constant has never been registered. It is
filed as **D-38** at ship, closed by this release.

---

## 1 · The change (recommended options)

### 1.1 · The field (DC-1 (a))

- **One signed number in My Data, on the home row** beside Home value, Mortgage balance and Mortgage rate:
  **"Cash from your home move at retirement $"**, stored as `PORTFOLIO.homeMoveCash`.
- **Its note says what it is:** what is left after you sell your current home, pay off its mortgage and selling costs, and pay cash for
  the next one. **Negative** if the next home costs more. **0** if you are not moving. It is added to (or taken from) your portfolio in the
  quarter you retire, in the Monte Carlo, Stress and Dashboard figures. If the next home's closing costs are a one-time row in your
  expenses, they are already counted — do not subtract them here too.
- **A hint, not a calculation:** when Home value and Mortgage balance are filled in, the note shows today's equity ("today's equity:
  $X") as a starting point. The app does not derive the field from it — the sale is years away and the next home's price is the user's.
- **One accessor** replaces the constant at all five reading sites, so no copy of the rule survives. The mortgage what-if keeps adding its
  principal on top.
- **Bounds:** a finite number, clamped to ±$10,000,000 on load and on save; anything else reads 0. It is saved by Save & Apply and carried
  by Export Backup, Import and the draft recovery, like `taxableGainPct` (v5.33).

### 1.2 · Plans that have no field yet (DC-2 (a), DC-3 (a))

- **The example household** carries `homeMoveCash: 130000`, so every example figure, and every suite pinned to one, stays bit-identical.
- **A new plan** (Start Fresh, the guided wizard) starts at **$0**.
- **A saved plan or backup without the field** reads **$0** — the conservative reading — and My Data and the Monte Carlo tab show a
  one-time notice until the next Save & Apply: *"New in v6.17: the cash from a home move at retirement is now yours to enter in My Data.
  Earlier versions added $130,000 to every plan at retirement; this plan now assumes $0 until you enter your own."*

### 1.3 · What the user reads

- My Data's note (above); the Monte Carlo tab and the mortgage what-if name the figure they start from ("from your home move: $X").
- The Events retirement card names the field, or drops the clause when it is $0.
- The Ask AI context adds the line to its HOME entry.
- The Field Manual's Monte Carlo and My Data entries; METHODOLOGY gains *Cash from a home move* (the rule, the measurements in §0.2,
  the simplifications in §4).

### 1.4 · The version

v6.17, at the four in-app sites and through the registrar. `t1`'s and `t4`'s version arms and Verify count, `t33`'s PINS and the three
Python suites are reviewed by hand **before** the first full run, and every typed version string in a SETUP check is searched for by
`suitetext.cjs` first — the `t78` D-2a lesson from v6.16.

---

## 2 · Site census

### 2.1 · App (v6.16 lines; re-run at the build and recorded in §7)

| # | Site | Change |
|---|---|---|
| A1 | `HOME_SALE_PROCEEDS` L1126 | removed; an accessor `homeMoveCash()` reads the field, clamped |
| A2 | `runMonteCarlo` L2529, L2590; `runExtendedMC` L2711, L2806 | read the accessor |
| A3 | Events retirement card L2215 | names the field, or drops the clause at $0 |
| A4 | `DEFAULT_PORTFOLIO` (≈L416) | `homeMoveCash: 130000` |
| A5 | `applyLoadedDataUnchecked` (≈L3847) | non-finite or missing → 0, clamp |
| A6 | My Data editor: state (≈L12836), `buildPortfolio` (≈L13005), the home row (L13443) and its note; the notice | input and copy |
| A7 | Ask AI context L13145 | the line |
| A8 | Monte Carlo tab and the mortgage what-if (≈L11400–11460) | the "from your home move" line |
| A9 | Field Manual (DOCS_HTML) Monte Carlo and My Data entries | copy |
| A10 | four version sites | v6.16 → v6.17 |

Start Fresh (L4418) and the guided wizard build plans without the field; A5 gives them $0, so neither needs an edit.

### 2.2 · Suites

| Suite | Why | Change |
|---|---|---|
| `t2` (and the MC parity run), `t20`, `t42`, `t56`, `t79` | run the Monte Carlo on the example or a copy | none expected: a copy of the example carries `homeMoveCash: 130000`. Any red here means a household built without the field, and is gated per leg (§B2), never softened |
| `t5`, `t37`, `t38` | storage, draft and import round trips | must stay green; `t80` adds the field's own |
| `t29` / `tools/boundaries.mjs` | §K1: the example is at +$130,000, so $0 and a negative figure are never exercised there | a new census row `home_move`, and two fixtures (0 and negative) |
| `t1`, `t4`, `t33`, the Python suites | version arms and registration | by hand, before the first run |

---

## 3 · Tests — new `qa/t80_home_move_cash.mjs`, both legs (v6.16 prior, v6.17 current)

- **A · The field is a pure replacement for the constant.** An oracle module is built at test time from the v6.16 source in the run
  folder with `HOME_SALE_PROCEEDS` set to X (text substitution, the same `esbuild` step `mk_testable.sh` uses). For X = 130,000, 0,
  −105,000 and 250,000, v6.17 with `homeMoveCash = X` must equal it **bit for bit**: both Monte Carlo engines (seeded), the planned path,
  and the mortgage what-if's two runs. The prior leg pins v6.16 as a dated `[KNOWN DEFECT]`: its result does not change with the field.
- **B · By AST.** `HOME_SALE_PROCEEDS` exists nowhere; no `130000` literal outside `DEFAULT_PORTFOLIO`; the accessor is read at exactly the
  five sites of §2.1 A2–A3.
- **C · What cannot move.** On the example, Engines A, B, C and D, the bridge series and the Roth ladder are bit-identical v6.16 → v6.17,
  and so is every Monte Carlo figure (the example keeps $130,000). On a household with the field at 0 or negative, Engines A–D are
  bit-identical too.
- **D · A hand pin.** The planned path is deterministic: with the field at X instead of 130,000, the planned balance N quarters after
  retirement differs by exactly (X − 130,000) × (1 + growth/4)^N until the path floors at 0 — worked by hand for one N.
- **E · The input, rendered.** The field shows on the home row with its note and today's-equity hint; a negative entry is kept; Save &
  Apply stores it; Export Backup carries it; Import restores it; the draft keeps it; a backup without it reads 0 **and** shows the notice,
  which goes away after Save & Apply; Start Fresh starts at 0; non-numbers and out-of-range values are clamped.
- **F · The copy.** My Data's note; the Monte Carlo line; the Events card at a positive figure and at $0; the Ask AI line; the Field
  Manual; METHODOLOGY. **Extinction:** no text anywhere says the plan books a fixed $130K.

**Controls**, in `qa/tools/controls_v617_home.py`, each one planted defect: the constant restored at one Monte Carlo site; the sign
flipped; the field dropped from `buildPortfolio`; a missing field read as 130,000; the clamp removed; the notice never shown; the example's
130,000 changed; the Events clause left fixed; plus the unmutated run.

---

## 4 · Out of scope, and stop conditions

**Out of scope (each disclosed in-app and in METHODOLOGY):**

- **The Withdrawal, Taxes, IRMAA and Roth tabs still ignore the home-move cash** (DC-4 (a)). Filed as **D-39**: putting it into Engine D's
  pool moves the withdrawal schedule, its taxes and MAGI — its own scope.
- **The timing stays the retirement quarter** (DC-5 (a)); a move years before or after retirement is not modelled.
- **Tax on the sale.** The cash is treated as tax-free. A home sale's gain is excluded up to $250,000 single / $500,000 joint (26 U.S.C.
  §121) when the ownership and use tests are met; a gain above that, or a sale that fails them, is not taxed here — optimistic, rare for
  the mainstream couple, disclosed.
- The next home's own costs stay where they are (expense rows), and nothing is derived from Home value and Mortgage balance.

**STOP and report if:**

- anything on the example household moves, in any engine;
- Engines A–D move on any household;
- §3 A's oracle differs from v6.17 by any amount;
- a suite outside §2.2 turns red.

---

## 5 · Decisions for Steve

**DC-1 · What the field asks for.**
- **(a) One signed figure: the cash left after selling and buying,** with the formula in its note and today's equity as a hint.
  **Recommended.** It is exactly what the model uses, so nothing is assumed on the user's behalf, and the note does the arithmetic's
  explaining.
- (b) Four inputs — expected sale price, selling costs %, mortgage payoff at the sale, next home's price — and the app computes the net.
  Easier to fill in correctly, but it adds assumptions the app would have to defend (what the home is worth in 2029, the mortgage left),
  and four inputs for one number.

**DC-2 · A saved plan or backup that has no field yet.**
- **(a) Reads $0, with a one-time notice** in My Data and on the Monte Carlo tab. **Recommended.** The project's default is the conservative
  reading, and the $130,000 was never disclosed, so most users never chose it. Their Monte Carlo figures fall (on the example's shape,
  30-year success 81% → 75%) and the notice says why.
- (b) Reads $130,000, with the same notice asking them to check it. Nobody's figures move, but the undisclosed optimism stays for everyone
  who does not open My Data.

**DC-3 · The example household.**
- **(a) Keeps $130,000.** **Recommended.** No example figure moves, the suites pinned to the example stay as they are, and the field shows a
  realistic positive value. (The example's own planning notes describe ~$330,000 of equity and a $350,000–$400,000 next home, which would net
  out negative; the example is illustrative, and this release does not touch it.)
- (b) Set it to match those notes (about −$45,000). Every example Monte Carlo figure moves, with its pinned suites.

**DC-4 · Which tabs use it.**
- **(a) The Monte Carlo, Stress and Dashboard figures only, as today,** with the gap disclosed and filed as D-39. **Recommended.** It keeps
  this release to an input and a constant.
- (b) Also feed it into the Withdrawal tab's pool. More consistent, but it moves the schedule, the tax engines' MAGI and IRMAA — its own
  scope.

**DC-5 · When the cash arrives.**
- **(a) The retirement quarter, as today.** **Recommended.**
- (b) Its own year and month in My Data. More flexible; a second input and a second timing rule in both engines.

---

## 6 · Register housekeeping at ship

- **D-38** filed and closed: "home-sale cash was a fixed $130,000 constant, applied to every plan, undisclosed."
- **D-39** opened: the Withdrawal, Taxes, IRMAA and Roth tabs do not see the home-move cash.
- The §121 simplification gets a line in D-38's entry.

---

## 7 · Build record

**Built against v6.16** (`dfc07ee7…` / built `765cd89f…`); the v6.16 page was rebuilt first and reproduced `765cd89f6c5d97a937f2fa2e7405ee64`.
**v6.17:** source `dc8a4d5f5796b11d88007024b1ecaca7`, built `index.html` `067c87404e92339a1de9ece815d6151e`; `smoke_built` 22 of 22. Decisions: DC-1 to DC-5 all **(a)**.

**Census at the build (v6.17 lines, `census.cjs`).** `HOME_SALE_PROCEEDS`: 0 sites. `homeMoveCash`: the field in `DEFAULT_PORTFOLIO` (L419, 130000);
`HOME_MOVE_CASH_LIMIT` and the accessor (L1134–1138); the five model reads — `computePlanEvents` L2227, `runMonteCarlo` L2544 and L2605,
`runExtendedMC` L2726 and L2821; the loader (L3867–3871); the wizard's and Start Fresh's new plans (L4286, L4460); the Monte Carlo tab's line and
the what-if (L11412, L11428); the editor's state, `buildPortfolio` and the Ask AI line (L12871, L13039, L13180). Version: four sites; registrar
322 sites. The test shim exports `homeMoveCash` (guarded).

**Tests.** `t80`: 42 on v6.17, 22 on v6.16. `t29` 78 → 82 per leg (the `home_move` row). Controls `qa/tools/controls_v617_home.py` 9 of 9, files
restored and hash-checked. Full suite from the packaged copies: **7,254 app checks across 79 app suites**, 0 failed, 0 DIED; MC parity 10/10; GRAND 7,384 (details in the CHANGELOG).

**STOP conditions.** None met. Nothing on the example household moved in any engine (`t80` C-1, C-2); Engines A–D and the bridge did not move on
any household (C-3, C-4); §3 A's oracles matched v6.17 bit for bit at all four values; no suite outside §2.2 changed — the only count that moved
besides the new suite is `t29`'s (§2.2), and `t79`'s differential takes its designed skip on this pair.

**Where the build departed from the scope, owned.**
- **§2.1 said Start Fresh and the wizard needed no edit.** They do: §1.2's notice is computed from the field's absence, so a brand-new plan built
  without it would have opened with "Earlier versions added $130,000 to every plan". Both now write `homeMoveCash: 0` (`t80` B-5).
- **§1.1 said a missing field reads 0 "on load".** The loader does not write the 0 into a plan that lacks the field — the accessor reads 0 —
  because the landing page's restore saves the loaded object straight back, which would have cleared the notice before the user ever saw it.
  Recorded in the loader's comment; `t80` E-10 to E-14 cover both import paths.
- **§3 B's "no 130000 literal outside DEFAULT_PORTFOLIO"** found two in `STATE_RULES` (Montana's 2027 joint threshold, a state band edge) — tax
  data, excluded by name and counted in the check's comment.
- **§3 B's "six sites" on the prior leg** is five reads: the declaration is a pattern to the AST walker, not a read.
- **Control H2 (the sign flipped in the accessor)** was predicted to turn §3 A and D red; it turns B-6 and the rendered E checks red instead.
  The loader clamps a stored value in place through the accessor, so the flip cancels in the engines on a freshly loaded plan and shows in the
  stored and displayed figure. Its expected list was corrected to what the run measured.
- **`t80` left its oracle modules in the run folder's `qa/`**, and the first `package_check` failed on them (G-2). `t80` now deletes them once
  loaded; the packaged suite run and the controls were repeated on the corrected package.
- **§3 C's "the Roth ladder"** is covered by §3 B (no ladder function reads the accessor): the ladder's projection takes no portfolio input to
  compare.

---

**Destination:** repo `docs/SCOPE_D38_HOME_SALE_CASH_V617.md`. **Not pooled** (OPERATIONS §G: scope documents are repo-only).
