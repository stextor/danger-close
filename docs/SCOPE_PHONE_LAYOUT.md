# SCOPE — the app fits a phone (F-11), and what F-12 needs first

**FULFILLED — shipped in v5.79 (2026-09-27).** Decisions D-1 (a), D-2 (a), D-3 (a), D-4 yes — all as recommended (§6).
See §9 for what the build found that this document did not say. Retained in the repo as the record. Target **v5.79**, built from **v5.78**
(source `536597644ae036a66f9a441e6311ad5c`, built `index.html` `a11c46dca503a433eaaf6665427769f9`, repo `67012ab`, verified
post-ship 2026-09-26). This is a presentation release: no engine changes; parity and the example household stay pinned.

---

## 1 · Premise — re-measured, and the audit's fix shape does not hold

**Method.** Real **Chromium 141** via Playwright in this sandbox (the same engine the v5.73 audit used), on the **built**
v5.78 page, at **390×844** (mobile, touch). The disclaimer gate is dismissed by ticking `#dc-dg-check` and clicking
`#dc-dg-accept`, and every probe **asserts `body` has no inline style** before measuring — the audit's recorded trap, where
the gate's scroll lock reads exactly like an app clipping defect. The audit's own harness
(`qa/tools/audit_phase4_v573/probe_ux.py`) was rerun unmodified.

**F-11 holds exactly as the audit measured it at v5.73.** Every one of the 26 tabs scrolls sideways at 390 px: 566 px on
19 tabs; Guardrails 680, Expenses 638, Monte Carlo 624, Social Security 621, Income 611, Stress 608, Positions 571. Desktop
(1440) and tablet (820): no tab overflows. The landing screen and the gate fit. **F-12 holds exactly:** the header, the
retirement cards, the allocation strip, the banner and the 26-tab grid end at **y = 824 of 844**.

**But the audit's single cause and fix shape are wrong — measured, not argued.** F-11 attributed the overflow to "one shell
control", the retirement selector's `repeat(3, 1fr)` grid, with the fix `repeat(3, minmax(0, 1fr))`. Applied in the browser
as a style override on all 26 tabs:

| Counterfactual (in-browser, v5.78) | Tabs still overflowing | Floor |
|---|---|---|
| (a) the selector grid → `minmax(0, 1fr)` — the audit's fix | **26 / 26** | 453 px |
| (b) every `repeat(N, 1fr)` grid → `minmax(0, 1fr)` | **26 / 26** | 420 px |
| (c) (a) + the selector cards' contents allowed to wrap | **26 / 26** | 432 px |
| (d) (b) + the cards' contents allowed to wrap | **11 / 26** | — (15 tabs fit) |

## 2 · Site census — measured culprits

**The shell has three causes, all needed for any tab to fit:**
1. The retirement selector's `repeat(3, 1fr)` grid (the audit's cause).
2. **Inside each selector card**, a non-wrapping flex row ("99.0%" beside "median@retire: $1.96M"): with the grid fixed,
   each card is 110 px but its row keeps its min-content width and spills out — past the viewport on the third card.
3. **The allocation strip** (the "HEDGES 0.0% $0K" cells): another `repeat(N, 1fr)` grid, holding the page at 432 px once
   the selector is fixed.

**Eleven tabs overflow on their own content after the shell is fixed** (fix (d)), each named by measurement:

| Tab | Width | What overflows |
|---|---|---|
| Guardrails | 680 | a table with fixed-width columns (90 / 70 / 60 px: "Median sim", "10th pctl", "SWR %") |
| Expenses | 638 | a 287 px non-wrapping summary row ("POST-RETIREMENT — $8170/mo → …") |
| Positions | 571 | 190 px description columns |
| Ranking | 552 | 90 px fixed columns ("Ratio", "Tier") |
| Backtest | 532 | 110 / 90 px fixed columns ("Low point", "Depleted") |
| Grade | 531 | a 269 px distribution row; 90 / 60 px spans |
| Income | 528 | 79 px timeline labels; a 131 px "SS INCOME GAP" card |
| Roth | 493 | two `<select>` controls **436–443 px wide** — a select sizes to its longest option's text |
| My Data | 453 | small fixed cells in the spouse-B and hedges rows |
| Monte Carlo | 422 | not named by the element probe (no single top-level culprit) — to be found at build |
| Social Security | 397 | as Monte Carlo (7 px over) |

The shared shape: **fixed pixel widths and non-wrapping rows designed for ≥ 820 px**, with no narrow-screen alternative —
the audit's F-1 ("no breakpoints": `@media` occurs once, inside the Field Manual) is the root.

## 3 · The fix, by part

- **Shell (all three causes):** `minmax(0, 1fr)` tracks for the selector and the allocation strip; the selector cards'
  inner rows wrap (`flexWrap: "wrap"`, `minWidth: 0`). Measured effect: 15 of 26 tabs fit with no other change.
- **Per tab (the eleven):** per D-1.
- **Roth selects:** `maxWidth: "100%"` so a long option cannot widen the page (the option text itself is unchanged).
- **Desktop and tablet must not change.** Every change is either invisible at ≥ 820 px (`minmax(0,1fr)` resolves to `1fr`
  when content fits) or confined to narrow screens — verified by measuring **both** before and after at 1440 and 820 (§5).

## 4 · F-12 (the first screen is all chrome) — recommended as its own release

Fixing F-11 makes each tab's content reachable, but still below the fold: 824 px of chrome precedes it. Collapsing the header
and the tab strip on a phone is a design question — what stays visible, what goes behind a menu — and it needs the
breakpoint mechanism F-1 says the app lacks. See D-3.

## 5 · Tests

**jsdom does no layout**, so the claim this release makes — *no tab scrolls sideways at 390 px* — can only be tested in a
browser. See D-2. Planned either way:
- **Layout, in Chromium:** every tab at 390×844 has `scrollWidth ≤ clientWidth`; every tab at 1440 and 820 is **unchanged**
  in `scrollWidth` and in the tab content's top position against v5.78 (the pre-leg); the gate is asserted dismissed first.
- **Structural (jsdom, both legs):** the selector and allocation-strip grids use `minmax(0, 1fr)`; the cards' rows wrap; the
  eleven tabs' containers carry the D-1 treatment; the Roth selects are width-capped.
- **Negative controls:** revert each shell cause alone (each must re-break every tab — the measurement above says so);
  revert one tab's wrapper (only that tab breaks); widen a select option (the cap holds).
- The engines are untouched: parity 10/10 and the full suite unchanged are the proof.

## 6 · Open decisions for Steve

**D-1 · The eleven tabs' wide tables.** (a) **Each wide table scrolls sideways inside its own box** (`overflow-x: auto`), so
the page never does; the table keeps its layout. Or (b) tables reflow into stacked cards on narrow screens — more readable
on a phone, far more work, and it needs D-3's breakpoint. **Recommend (a)** now: it is the audit's own F-2 fix shape, it is
mechanical per site, and it changes nothing on desktop. (b) can follow table by table if you want it.

**D-2 · How the layout claim is tested.** (a) **A new suite (`t45`) that drives Chromium**, wired into `runsuite.sh`, and
**fails — never skips — if no browser can launch**, so a session without one cannot report green; or (b) structural jsdom
checks only, with the Chromium measurement as an uncounted build tool. **Recommend (a):** the whole defect is invisible to
jsdom, and a structural check can pass while the page still overflows (as the audit's own fix shape shows). The cost is a
new suite dependency; Chromium 141 is available here today.

**D-3 · F-12.** (a) **Its own scope and release after this one**, where you choose what collapses; or (b) fold it in now.
**Recommend (a):** F-11 is mechanical and measurable; F-12 is a design choice with your input first.

**D-4 · Version.** A presentation release, **v5.79**; METHODOLOGY unchanged (no modeling); the Field Manual gains one line
if a user-visible behaviour changes (a table that scrolls within its box). **Recommend** yes.

## 7 · Out of scope

F-12 (D-3); F-3/F-4 (touch-target size and text size — after this, with your direction); table-to-card reflow (D-1 b);
the Field Manual's own layout (`DOCS_HTML`, which already carries the app's only `@media` rule).

## 8 · Build order (after decisions)

1. Freshness check (OPERATIONS §A). 2. `t45` written first, run against v5.78 — it must fail on all 26 tabs at 390 and pass
at 1440/820. 3. The shell fixes; re-measure (expect 15/26). 4. The eleven tabs, one at a time, each re-measured; Monte Carlo
and Social Security culprits named at the build. 5. Full suite, parity, `domdiff`; controls. 6. Docs, bump, build,
`smoke_built`, package per §L, `package_check`.

## 9 · Build record (v5.79) — where the build departed from this document, and why

- **Result:** all 26 tabs fit at 390 px (v5.78: none); desktop (1440) and tablet (820) **unchanged element by element** on
  every tab's default view — every v5.78 element box identical, every page height identical, the only additions 42
  invisible scroll-box wrappers. The measurement seeds `Math.random` before the page loads (the Monte Carlo is random in
  the browser) and was run twice on v5.78 first to prove it exact.
- **§3 said `minmax(0, 1fr)` "cannot change desktop". True only where content fits** — where it does not, `1fr` grows a
  column and `minmax(0, 1fr)` holds it equal. That is why invariance was MEASURED (the layout signature) rather than
  argued; applied to all 86 static grid literals it changed 0 of 52 views.
- **§1's census of eleven tabs was incomplete.** Several tabs had a second culprit once the first was wrapped (SS,
  Ranking, Backtest, Grade), Income's last 2 px were TEXT spilling from a 44 px card (invisible to every box-based probe),
  and Monte Carlo's grid template is built in code, which the static rewrite could not reach.
- **D-1's box needed a floor, and the first floor was wrong.** A child sized `max-content` forbade cell text to wrap at every
  width and changed six desktop/tablet views (up to 98 px shorter); replaced by `min-width: var(--dc-floor, 600px)`, with
  320 px and 480 px for two of Grade's, where the tablet column is narrower than 600.
- **The shell is now defended twice.** The retirement cards' zero minimum and word-break, and the allocation strip's row
  wrap, each make their grid's `1fr` harmless on their own; controls M2 and M3 revert BOTH layers.
- **`mk_runfolder.sh` copied only `.mjs`/`.sh` suites** — `t45` (Python) would have run nowhere. It now copies `qa/t*.py`
  and the tree's built page; `t45` checks the page's footer names its own tag, so a stale page fails loudly.
- **Two tabs needed scoped adjustments:** My Data's rows (a −6 px inner margin, netting their collapsed margin back to
  v5.78's) and Income's timeline (its 170 px label floor scales down on a phone only: `min(170px, 40%)`).
- **Known gap (disclosed):** the 600 px floor keeps cells legible inside their box; the page fits without it, so `t45`,
  a page-width test, cannot guard it.

