# SCOPE — v5.40 · four disclosure corrections and the small-screen mechanics

| Field | Value |
|---|---|
| Written | 2026-08-19 |
| Base build | **v5.39** · source `7070018f2699503dfac4ca8e0e1b2feb` · built `0563e2f6db79c19b4729bec6e09a458a` · tree `a8e59f3` |
| Target | **v5.40** |
| Decisions resolved | S-1 phrasing → **generic**; bundling → **all four ride together**; extinction assertion → **its own scope, out of scope here** |
| Status | **RETIRED — FULFILLED AT v5.40, CONFIRMED BY CONTENT 2026-09-01** |

> ## ⛔ RETIRED — FULFILLED AT v5.40 · confirmed by content against v5.57, not by version heading
>
> Every premise re-checked against `0daebb4af466b9095db79117daefcd32` on 2026-09-01:
> **S-3** `METHODOLOGY.md` now reads *through v5.35* — past tense, the defect it described is gone.
> **D-6** `t31` asserts BOTH the SSA-44 and work-stoppage keys (closed v5.49).
> **F-2/F-8** `t30` asserts grids sit inside an `overflowX` wrapper, in three places.
> **F-6** 48 `inputMode` attributes are present in source.
>
> ⚠ **This scope sat on `package_check`'s OPEN allowlist for four releases after its work had
> shipped.** It was added at v5.54 on a session brief's classification, with no content check, in
> the release whose whole lesson was that status lines go stale. `I-2` would have caught it; the
> allowlist excused it. The rule that would have stopped it is now recorded where the list lives.

**Every line number below was derived from the unmodified `src/DangerClose.jsx`** and re-resolved by
confirming the cited line contains the code claimed. This is stated because the 2026-08-18 documents
had to be corrected for exactly this — an off-by-one from citing a docs-stripped working copy.

---

## 1. Premise — verified, not assumed

Four findings, all disclosure-or-mechanics, none touching a modelling result.

| ID | Premise | Verified at |
|---|---|---|
| **S-1** | The IRMAA tab names five MAGI components; Engine C sums seven | tab text **L9792**; `const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y` **L4399** |
| **S-3** | `METHODOLOGY.md` states in the present tense that Engine B defaults realized gains to $0 — false since v5.36 | `METHODOLOGY.md` **L537–538**; contradicted by `capGains_y = Math.round(_gainByYr[yr] \|\| 0)` at **L5096** |
| **D-6** | The SSA-44 disclosure covers the survivor trigger only; work stoppage is undisclosed | `METHODOLOGY.md` **L696–699**; `SSA-44` / `work stoppage` return **zero hits** in source and in the decoded manual |
| **F-2 / F-8** | Fixed-pixel and `repeat(9, 1fr)` grids sit outside any scroll wrapper and overflow a 380px viewport | four unwrapped grids, §2 |
| **F-6** | Money fields are bare text inputs, so phones raise the alphabetic keyboard | 57 bare `<input>`, 28 numeric-looking, §2 |

**All five hold at v5.39.** Nothing here changes a computed figure: S-1, S-3 and D-6 correct prose
about behaviour that is already right, and F-2/F-6/F-8 change presentation and keyboard type only.

## 2. Site census

### 2.1 S-1 — one sentence, one site

**L9792.** Current text names the 85%-of-SS assumption plus pension, earned income, RMDs and
conversions. Engine C (**L4399**) also sums `div_y` (**L4395**) and `capGain_y` (**L4398**, added
v5.36 — the comment at **L4396** says so).

**Decided phrasing: generic.** The enumeration has been falsified twice by the same mechanism, so the
replacement must not be a longer enumeration. Draft for approval in §7.

### 2.2 S-3 and D-6 — `METHODOLOGY.md` only, no source change, no bump

- **S-3 · L537–538** — date-stamp the passage (*"through v5.35…"*) rather than striking it; the
  surrounding argument about Engine D's MAGI excluding brokerage withdrawals is still correct.
- **D-6 · L696–699** — add work stoppage alongside the survivor case. One clause.

### 2.3 F-2 / F-8 — four unwrapped grids

Seven `overflowX:auto` wrappers exist (**L7564, 8524, 8998, 9533, 11912, 12122, 12234**) and are
unchanged from v5.38. Four wide grids sit outside all of them:

| Grid | Line | Shape | Approx width |
|---|---|---|---|
| SS draw-comparison (F-2) | **L7320** | `50px 85px 85px 85px 85px 85px` | ≈475px |
| IRMAA year-by-year MAGI vs next cliff (F-2) | **L9772** | `50px 64px 90px 96px 90px 90px` | ≈480px |
| Benefit-by-claiming-age (F-8) | **L7376** | `repeat(9, 1fr)` | ≈511px measured |
| 81-cell joint claiming grid (F-8) | **L9106** | `repeat(9, 1fr)` | 9 columns |

**Containment verified, not inferred.** The L9106 grid's nearest wrapper above is L8998, but that
wrapper **closes at L9022** — checked by tracking div depth — so it does not cover L9106. All four are
genuinely unwrapped.

**Note carried from F-8's own errata:** these grids *overflow*, they do not compress. `1fr` is a
maximum share, not a forced one, and the min-content width of formatted dollar figures floors the
cell. Content is reachable by panning; the cost is navigational, not data loss.

### 2.4 F-6 — bare inputs

Measured at v5.39: **92 `<input>` total · 31 carry a `type` · 11 `type="number"` (all in Guided
Setup) · `inputMode` appears exactly once.** Of the **57** inputs carrying neither `type` nor
`inputMode`, **28 are numeric-looking** by label, in five clusters:

| Cluster | Count |
|---|---|
| L3371–L3384 | 5 |
| L11867–L11892 | 6 |
| L12100 | 1 |
| L12188–L12216 | 4 |
| L12291–L12335 | 12 |

⚠ **The 28 is a heuristic lower bound**, from labels carrying `$` or `%` on the same line. Money
fields whose label sits on another line are not counted. **The build must enumerate the exact set
rather than trusting this figure** — it is a census aid, not the census.

`inputMode="decimal"` gives the numeric keypad **without changing parsing**, so "1.2M"-style entry (if
deliberate) is preserved.

## 3. The version-bump tax — measured, and larger than previously stated

⚠ **Correction to a figure I have repeated in several sessions.** I have been quoting *"version
ladders in six suites plus ~25 feature gates."* Measured at v5.39:

| Surface | Count |
|---|---|
| `VER === "v5xx"` comparisons across the six baseline suites | **433** |
| Sites naming the current top version (`v539`) — the ones needing a `v540` clause | **35** |
| — `t1_units.mjs` 7 · `t3_roth.mjs` 2 · `t4_dom.mjs` 19 · `t5_storage.mjs` 4 · `t6_single.mjs` 3 | |
| Of those, **version-*string* mappings** that must map to `"v5.40"` rather than fold into a gate | **2** — `t1` `verStr` **L222**, `t4` `_badge` **L65** |
| In-app version sites | **4**, across **3 lines** — `DATA LOAD` **L3531**, app footer **L11252**, and **two inside `DOCS_HTML` L3593** (Field Manual callsign and end-of-manual footer) |

**The per-release edit count is ~35, not ~25**, and the 433 figure shows how much ladder has
accumulated — `ARCHITECTUREIssues.md` **E-7** recorded 202 across five suites at v5.29, so it has more
than doubled. E-7 is not fixed here (§6) but this scope is the evidence for prioritising it.

**Also pinned at v538 and needing attention before they can gate v5.40:** `VERIFY.sh` (4),
`controls.sh` (7), `gate_v538.mjs` (8), `project.mjs` (5), `sim_ledger.mjs` (4), `case1_detail.mjs`
(2), `domdiff_withdrawal.mjs` (1), `t2_engines.mjs` (1). **Whether these need a v5.40 leg at all is an
open decision (§7.4)** — several are session-scoped instruments, not permanent suites.

## 4. Tests this ships with

| Test | Asserts | Suite |
|---|---|---|
| STATIC ×4 | the four in-app version sites carry `v5.40` | `t1` (existing pattern, new ladder clause) |
| SHELL | version badge reads `v5.40` | `t4` `_badge` |
| **IRMAA sentence names dividends and gains** | the L9792 text mentions both, generically or by name | **new**, `t13` (Engine C's suite) |
| **No unwrapped wide grid** | each of the four grids at L7320, L7376, L9106, L9772 sits inside an `overflowX:auto` ancestor | **new**, `t4` (DOM) |
| **Money inputs carry a numeric keyboard hint** | every enumerated money field has `inputMode="decimal"` | **new**, `t4` (DOM) |
| Regression | full suite green, per-suite breakdown recorded from output | all |

The grid and input assertions are **extinction invariants**: they pin the defect class, not the
instance, so a future wide grid added without a wrapper fails.

⚠ **Test counts are recorded from suite output at build time, never restated from memory** —
`TESTING.md` carries the current totals and this scope deliberately quotes none.

## 5. Expected behaviour change

| Change | User-visible? | Modelling impact |
|---|---|---|
| S-1 sentence | yes — IRMAA tab | **none** |
| S-3, D-6 | `METHODOLOGY.md` only | **none** |
| Four scroll wrappers | yes — grids scroll in their own frame instead of panning the page | **none** |
| `inputMode="decimal"` | yes on mobile — numeric keypad | **none**; parsing unchanged |

**No engine, constant, or computed figure changes.** `METHODOLOGY.md` is edited for S-3 and D-6, but
this is **not a modelling release** — the convention requiring a METHODOLOGY update on modelling
change does not make the converse true.

## 6. Explicitly out of scope

- **The S-1 extinction assertion tying the IRMAA sentence to Engine C's `magi` expression.** Its own
  scope — a `qa/` change, and the §4 test above is the weaker text-level check, not the structural one.
- **E-7, the version-ladder registry.** §3 is the argument for it; it is a `qa/` change needing its own
  scope, and doing it inside a release scope is how unreviewed work ships.
- **F-1, F-3, F-4, F-5, F-7, F-9, F-16** — breakpoints, touch targets, contrast, tooltips, chart
  resize. F-4 (contrast) in particular is a design decision, not mechanics.
- **D-3** — the top-ranked open taxation gap. Its own release.
- **D-8b's sub-floor toggle** — declined at v5.32, needs persisted state and a migration.
- **`ARCHITECTUREIssues.md`'s duplicate `E-15`** — a renumbering, not a release item.
- **Rewriting `UsabilityFlaws.md`** — see §7.5; it is a decision, not an assumption.

## 7. Open decisions — build does not start until these are resolved

**7.1 · S-1 replacement wording.** Generic was decided; the exact sentence is not. Draft:

> *"MAGI here is the model's own projected income for the year — the simplified 85%-of-SS assumption
> plus every other taxable component the plan generates, including dividends and realized capital
> gains."*

This names the two omitted components while framing the list as non-exhaustive, so a future added term
cannot falsify it. **Approve, amend, or reject.**

**7.2 · Does D-6's clause also go in-app?** Currently the SSA-44 disclosure exists **only** in
`METHODOLOGY.md`, which most users never read. Putting a line on the IRMAA tab would reach them —
but it enlarges an already-dense tab and pushes S-1's sentence further down. *Recommendation:
`METHODOLOGY.md` only this release*, since the direction is conservative and the tab is the subject of
S-1 in the same release.

**7.3 · Wrapper idiom.** Apply the existing `<div style={{ overflowX: "auto" }}>` pattern verbatim, or
introduce a shared component? Verbatim is lower-risk and matches the seven existing wrappers;
a component is the E-6-style de-duplication but changes seven working sites.
*Recommendation: verbatim, and note the duplication in `ARCHITECTUREIssues.md`.*

**7.4 · Do the v538-pinned instruments get a v5.40 leg?** `gate_v538.mjs`, `sim_ledger.mjs`,
`project.mjs`, `case1_detail.mjs`, `domdiff_withdrawal.mjs` look session-scoped rather than permanent.
*Recommendation: leave them; add a line to `TESTING.md` recording that they are pinned to the build
that produced them.* Confirm.

**7.5 · `UsabilityFlaws.md`.** Its text still reads as though nothing shipped, and v5.40 would make it
doubly stale. *Recommendation: rewrite it in this release* — it is the exact staleness pattern the
2026-08-18 repair spent a session cleaning up.

**7.6 · The F-6 exact set.** §2.4's 28 is a heuristic. Confirm that the build enumerates the money
fields precisely and reports the final count, rather than applying the heuristic.

## 8. Stop conditions

Per the standing rule, **stop and report rather than adapting silently** if:

- any of the four grids turns out to be wrapped after all, or wrapping one changes a rendered figure;
- `inputMode="decimal"` alters parsing of any existing stored value;
- the S-1 sentence cannot be phrased generically without losing information the tab needs;
- the version-bump surface differs materially from the 35 sites in §3;
- the full suite is not green at the end — a partial state is delivered clean, never a thin pass.
