# UsabilityFlaws.md — Standing Audit, Section F (Phase 4)

| Field | Value |
|---|---|
| Build audited | **v5.38** · source `src/DangerClose.jsx` md5 **`b8d12481b55cd2ed05c6c6f14e2f41d9`** |
| Freshness | Source hash matches manifest, repo `src/DangerClose.jsx`, and the session brief. §A2 clone-and-diff: **all 41 mapped pool test/harness files byte-identical** to the committed tree (stale=0); the five v5.38-prep tools match `qa/tools/`. |
| Date | 2026-08-18 |
| Scope | Section F of `SCOPE_STANDING_AUDIT.md` (usability, large browser window *and* small-real-estate devices), **plus the material `AUDIT_DOCS_HTML_v5_27.md` deferred to Section F**: the glossary (§15), the §10 API-key / Ask AI material, and the §14 FAQ, now audited against v5.38 behaviour. |
| Exposure side | Every finding in this document is **user-side**. No creator-exposure or PII findings arose from this pass (Section A/B ground was not re-audited). |

**Note on the deferred-audit source.** `AUDIT_DOCS_HTML_v5_27.md` is listed in the pool manifest but is **not in the mounted pool**; it was read from the committed repo (`docs/AUDIT_DOCS_HTML_v5_27.md`), which the manifest itself allows for. Its stated gap — glossary, §10, §14 — defines the deferred scope covered in Part D below. Separately, the manifest's *Prior build* table (pool **and** committed copy) still names v5.36 while the pool correctly holds `DangerClose-v5_37.jsx` (`ff4dddcb…`, matching the v5.37 provenance line in `STATUS_v5_37_shipped.md`); the §A2 hash table was rolled at v5.38 but that table was not — the "roll the whole file or none of it" failure, sixth instance. That is a manifest defect, recorded here only because this session found it; it belongs to the manifest/E-series, not to Section F.

---


> ## CENSUS AT v5.97 (2026-10-08) — read this first; it supersedes the v5.40 status block below
>
> **Method.** One pass per register on 2026-10-08 against the shipped v5.97 (repo `2cfe5e2`, source `4157137a…`): every ID the register defines, what it says, what the CHANGELOG and archives record, and — for anything still open — the current source or suite, read by parser where a count is claimed. The body below is the record as written; where a marker in it disagrees with this table, **this table is current**.
>
> **F-19 is two items too (recorded 2026-10-14, decision DF-0 (a) of `docs/SCOPE_F19R_RANKING_HEADLINE.md`).** At v5.39 F-19 was the
> skin-registry drift, fixed in that release; v6.10 filed the Ranking-tab headline finding under the same number. They are **F-19s** and
> **F-19r**. Entries already shipped (the v5.39 records, the v6.10 CHANGELOG entry) keep the bare "F-19" they were written with.
>
> **F-11 and F-12 are each two items.** The v5.73 re-pin uses them for the phone findings (**F-11p** sideways scroll, **F-12p** first screen — the meanings every CHANGELOG entry uses); §D.2 uses them for two Field Manual defects (**F-11d** over-escaped callout, **F-12d** "25 vs 26 tabs"), and so do §F's groupings. Cite them with the suffix; nothing is renumbered.
>
> | ID | Status at v5.97 | Evidence |
> |---|---|---|
> | F-1 | **PARTLY FIXED v5.81** | one app breakpoint (`max-width: 599px`) beside the Field Manual's; v5.81 calls it "partly addressed" |
> | F-2 | **FIXED v5.40, v5.79** | no tab scrolls sideways on a phone (`t45`) |
> | F-3 | **PARTLY FIXED v5.81–v5.82** | one phone tab menu; every control ≥ 24 px, five phone-critical ones 44 px; most still under 44 px — disclosed in §13 |
> | F-4 | **FIXED for app text** (v5.48 size, v5.82–v5.83 contrast, `t48` in all 13 skins) | the Field Manual's own small print is open — disclosed in §13 |
> | F-5 | **OPEN, DISCLOSED v5.98** (Field Manual §13; `t62` holds the clause to the code) | **42** JSX `title` attributes (one is an iframe's name); the Field Manual has no mention of tooltips or touch |
> | F-6 | **FIXED v5.40** | 48 `inputMode="decimal"` fields (47 at v5.40) |
> | F-7 | **OPEN, DISCLOSED v5.98** (§13, with the work-around: leave the tab and come back; `t62`) | no resize observer or listener; the chart reads its width once; the Field Manual never mentions resizing. Whether it visibly goes stale needs a browser |
> | F-8 | **FIXED v5.40** | grids wrapped, later `repeat(9, minmax(0, 1fr))` |
> | F-9 | **OPEN, DISCLOSED v5.98** (§13; `t62`) | the Docs tab's iframe is still `74vh`; the Field Manual says nothing of nested scrolling |
> | F-10 | **FIXED v5.39** | the Skins entry documents UI SIZE |
> | F-11p | **FIXED v5.79** | `t45` |
> | F-12p | **FIXED v5.81** | `t47` |
> | F-11d, F-12d, F-13, F-14, F-15, F-17, F-18 | **FIXED v5.39** | `t4`'s Field Manual assertions |
> | F-19s | **FIXED v5.39** — row added 2026-10-14 (it had none) | the skin registry had drifted ahead of both descriptions (13 skins, "Seven color palettes"); `docs/SCOPE_FIX_docs_v5_39.md` D-6, `docs/STATUS_v5_39_shipped.md` |
> | F-19r | **FIXED v6.11** — filed at v6.10 as "F-19" (§H) | `t74`; `docs/SCOPE_F19R_RANKING_HEADLINE.md` |
> | F-20 | **OPEN** — filed at v6.23 (§H) | the Income tab's stream list scrolls sideways at 390 px for a plan with income streams (scrollWidth 510); `t45` runs on the example, which has none |
> | F-21 | **FIXED v6.25** — filed and fixed together (§H) | `t88`; `docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md` |
> | F-22 | **FIXED v6.27** — filed at v6.26 (§H); wider than registered | `t90`; `docs/SCOPE_F22_GRADE_FINDINGS_V627.md`. The panel's directives and invented projections are gone; the category text's false and example-only sentences corrected; the three literal grades, the guardrail grade's fixed labels and the B+ ceiling labelled; the Field Manual's Grade entry rewritten. No grade moved |
> | F-23 | **FIXED v6.28** — filed at v6.27 (§H); about ten times wider than registered | `t91`; `docs/SCOPE_F23_F24_DIRECTIVES_V628.md`. Every financial directive found by a six-reader census recast as what the model computes or assumes (DF-1 to DF-8, all (a)); twelve false statements about the model corrected (V-1 to V-12), and eight more the build review found |
> | F-24 | **FIXED v6.28** — filed at v6.27 (§H) | `t91` §B. *"Lost ~X GPA points"* is each category's real cost (÷ 78); weights read as points of 78; Income Floor, Estate and Monte Carlo copy corrected; one LTC test, `isLTCLabel`, no longer matching a long-term-disability row; the rough RMD estimate removed. No grade moved |
> | F-25 | **OPEN** — filed at v6.28 (§H) | the F-23 census's editorial claims (102 E-tagged) and unchecked model claims (151 V-tagged, less V-1 to V-12), the gap-draw figure, and the items the v6.28 build review left; `docs/F25_CENSUS_V627.tsv` |
> | F-15b | **OPEN** | "Success (>$1,500K)" beside a sibling "Success Rate (>$1.25M)" — still in the source |
> | F-16 | **FIXED v5.98** | the pair swapped; `t62` holds every term in order (was: "API Key" before "Agency MBS") |
> | §E-1 / §E-2 | **OPEN** | no physical-device pass; no keyboard / screen-reader pass (4 `aria-label`s in the app) |
> | §E-3 | **DONE v5.82–v5.83** | all 13 skins measured by `t48` |
> | §E-4 | **DONE v5.73** | `AUDIT_TOP_FIVE_SUMMARY.md` |
>
> ⚠ **A finding of this census: the v5.40 block's "DISCLOSED, NOT FIXED — v5.39 disclosed them in Field Manual §13" was never true for F-5, F-7, F-9 or F-16.** Read at v5.39 (commit `d18f7cc`), §13 said the app had "no responsive phone layout", that the tab strip wraps, wide tables scroll sideways and the smallest text is below AA, and that "a phone remains a compromised experience" — nothing about tooltips, a chart that does not redraw, nested scrolling or the glossary's order; no commit ever put "tooltip" into the source. That blanket sentence was itself replaced as v5.79–v5.83 fixed the phone layout, so even its general cover is gone. **Four simplifications are undisclosed today**, against the project's "disclosed in-app, never silent" rule — a small presentation release can disclose them (or fix F-16, a one-line reorder). **Done at v5.98:** F-5, F-7 and F-9 disclosed in §13; F-16 fixed.
> **Stale passages below, left as written:** the v5.40 block (superseded by this one); the v5.73 table's HOLDS/WORSE rows for F-1–F-4; L89 "still open after v5.79" directly above its own v5.81 fix; the touch-target counts (pre-v5.82); F-4's 8/9 px counts and "three light themes" (six); F-5's "38"; §D.2 (no fix markers); §E (items 3 and 4 done); §F's groupings (shipped v5.39, v5.40, v5.79–v5.83 except F-5, F-7, F-9, F-15b, F-16); §G (superseded by `t45`/`t47`/`t48`).

> ## STATUS AT v5.40 — rewritten 2026-08-19
>
> **This document's findings text is pinned to v5.38 and describes the app before two releases acted
> on it.** Rather than re-flow every entry, the current status of each finding is stated here, once,
> and the entries below are left as the original evidence.
>
> | Finding | Status |
> |---|---|
> | **F-2** · fixed-pixel grids overflow the phone viewport | ✅ **FIXED v5.40** — both grids wrapped |
> | **F-6** · money fields raise the alphabetic keyboard | ✅ **FIXED v5.40** — 47 numeric inputs carry `inputMode="decimal"` |
> | **F-8** · nine-column claiming grids overflow | ✅ **FIXED v5.40** — both grids wrapped |
> | **F-1, F-3, F-4, F-5, F-7, F-9, F-16** | **DISCLOSED, NOT FIXED** — v5.39 disclosed them in Field Manual §13; the defects remain |
>
> **On F-6's count:** the v5.40 scope estimated **28** fields from a label heuristic. Exact
> enumeration by what each input binds and parses found **47**. The 19 it missed carry no currency
> symbol in the label — "ALL RETIREMENT ACCOUNTS COMBINED" among them. Free-text fields (names,
> tickers, notes, the local-LLM URL and model) were deliberately excluded.
>
> **What v5.40 did NOT verify.** The fixes are pinned by **source-text** extinction invariants in
> `t1`, proven to fail against a reverted build. **No device or headless-layout verification was
> run**, so "fixed" here means the wrapper and the keyboard hint are present in the shipped source —
> not that the result was measured at 380px. §G's headless recipe remains the way to close that gap,
> and the disclaimer gate must be dismissed properly (tick `#dc-dg-check`, click `#dc-dg-accept`) or
> a scroll-lock artifact masquerades as an app defect, as it did once already.
>
> **§A's errata still stand and are still worth reading** — an F-8 static-arithmetic overreach and an
> F-2 "correction" that was a harness artifact. Both were inference stated with more confidence than
> it had earned, which is this document's recurring failure mode rather than carelessness.


> ## RE-PINNED TO v5.73 — 2026-09-15 · STANDING AUDIT PHASE 4 (SECTION F) · READ THIS BLOCK FIRST
>
> Source `3bf1e15f1b28659aae9a78e3186d2ae8`, built `index.html` `345ccbceb58bf74f9fbdde5db0646d1d` (the **built** page was
> tested, not the source), repo `a06f41c`. **Findings only.**
>
> **Method.** Real Chromium 141 via Playwright (not jsdom, which does no layout): the disclaimer gate accepted, "Use
> example data", then **all 26 tabs** visited at **desktop 1440×900**, **tablet 820×1180 (touch)** and **phone 390×844
> (mobile, touch)**. Per tab: document `scrollWidth` against the viewport, elements whose right edge passes the viewport,
> interactive elements under 44 px in either dimension, and visible text under 12 px. Screenshots were read for the
> dashboard and Taxes tabs at phone size. The harness ships as `qa/tools/audit_phase4_v573/probe_ux.py` (asserts nothing)
> and reproduced every figure below when rerun from that path. ⚠ Automated measures cannot judge comprehension or flow;
> the flow observations come from the screenshots.
>
> ### What changed since v5.38
>
> | # | v5.38 | **v5.73** |
> |---|---|---|
> | F-1 no breakpoints | HIGH (phone) | **HOLDS** — `@media` occurs exactly **once** in the source, inside `DOCS_HTML` |
> | F-2 unwrapped grids overflow | HIGH (phone) — measured on the IRMAA tab | **WORSE — now every tab; see F-11** |
> | F-3 tab strip | MED | **HOLDS exactly** — 26 buttons, **27 px tall** at every size; "SHOW FEWER TABS" (Simple Mode) still present |
> | F-4 micro-typography | HIGH | **HOLDS** — visible text under 12 px on every tab at every size (33–113 nodes per tab; 10–11 px throughout, **7–9 px** on Trajectory) |
> | F-5 … F-9 | — | *not re-verified in this pass* |
> | F-10 UI SIZE undocumented | MED (docs) | **CLOSED** — the Field Manual's skins entry now says the UI SIZE control (100 / 115 / 130 / 150%) "enlarges everything — useful on high-DPI displays and for aging eyes" (read from the raw `DOCS_HTML` string) |
> | F-11, F-12 | — | **NEW** (below) |
>
> ### F-11 · NEW · Every tab scrolls sideways on a phone, because of one shell control — **HIGH (phone)**
>
> **FIXED at v5.79** (`docs/SCOPE_PHONE_LAYOUT.md`). All 26 tabs fit at 390 px; desktop and tablet unchanged element by
> element. The cause below was only part of it: the fix shape given here, applied alone in the browser, left all 26 tabs
> overflowing — the shell had three causes and eleven tabs had wide tables of their own. `t45` (real Chromium) guards it.
>
> **Measured (390 px):** the document is **566 px** wide on 19 of the 26 tabs and wider on the rest — Guardrails 680,
> Expenses 638, Monte Carlo 624, Social Security 621, Income 611, Stress 608, Positions 571. Desktop and tablet: **no**
> sideways scroll on any tab. The disclaimer gate and the landing screen fit (390).
> **Cause:** the retirement selector (L6400) is `display: grid; gridTemplateColumns: "repeat(3, 1fr)"` over three `.rbtn`
> date cards. A `1fr` track cannot shrink below its content's minimum width, so the row claims ≈566 px whatever the
> screen — the screenshot shows the third card and the allocation strip ("HEDG…") cut off at the right. Because the
> selector sits in the shell, **no tab can fit**, which subsumes F-2's per-table cases on a phone.
> **Fix shape:** `repeat(3, minmax(0, 1fr))` or an auto-fit column rule for the selector; F-2's per-table wrappers for the
> tabs that are wider still.
>
> ### F-12 · NEW · On a phone the first screen is all chrome — **MED (phone)**
>
> **Still open after v5.79** — deliberately its own release (decision D-3 of `SCOPE_PHONE_LAYOUT.md`).
>
> **FIXED at v5.81** (`docs/SCOPE_PHONE_FIRST_SCREEN.md`): below 600 px the tab grid is one native menu and the retirement
> cards and allocation strip fold into one line; content begins at y = 613 (example mode; v5.80: 1005). This is also the app's
> first breakpoint outside the Field Manual (F-1, partly addressed). `t47` guards it.
>
> **Measured (390×844):** the header, the three retirement cards, the allocation strip, the example-data banner and the
> wrapped 26-tab grid end at **y = 824 px** of an 844 px screen, so the selected tab's content begins at the bottom edge on
> every tab (desktop: content starts at y = 406 of 900). A phone user who taps a tab sees no change above the fold.
> **Mitigation that exists:** Simple Mode shrinks the tab grid. **Fix shape:** collapse the header and the tab strip on
> narrow screens (the app has no breakpoint to hang that on — F-1).
>
> ### Touch targets, remeasured
>
> Under 44 px in either dimension, counted per tab at 390 px: typically **27 of 30** interactive elements; My Data **443 of
> 447**. This is F-3 and F-6's ground, now measured across every tab rather than the tab strip alone.

## A. Method — and its honest limits

Everything below was established by **direct inspection of the v5.38 source and byte-level checks of the runtime HTML the source produces** (the `DOCS_HTML` string was decoded from its JS literal to the exact bytes the iframe receives; CSS/grid arithmetic and WCAG contrast ratios were computed, not eyeballed).

**A real layout engine was subsequently obtained, and it corrected two findings.** An earlier draft of this document stated that no Chromium/WebKit was available in this environment. That was wrong — the browser binary ships *inside* an npm tarball, and `registry.npmjs.org` is on the sandbox allowlist:

```
npm i puppeteer-core @sparticuz/chromium
# launch: { args: chromium.args, executablePath: await chromium.executablePath(), headless: true }
```

The shipped `index.html` was then loaded at a 380×844 viewport and driven through the real UI. Findings marked **measured** below carry engine numbers; findings still marked **computed** rest on source arithmetic alone. Recipe and script recorded here deliberately so the capability is not lost between sessions (the E-18 lesson).

**Harness trap — read before re-running.** The disclaimer gate in `src/index.html` (L47) sets `overflow:hidden` on `html` and `body`, and restores it (L55) **only** in the click handler of `#dc-dg-accept`, which is `disabled` until `#dc-dg-check` is ticked. A harness that clicks past the gate by matching button text will not dismiss it: the accept button reads *"Enter the tool"*, not the usual "I understand"/"Accept"/"Continue". Worse, `page.evaluate(() => el.click())` fires through the still-present `position:fixed; inset:0; z-index:2147483647` overlay, so the run *looks* successful while the scroll lock stays applied — which reads exactly like an app-level clipping defect. Always tick `#dc-dg-check`, then click `#dc-dg-accept`, then assert `document.body.getAttribute('style') === ''` before measuring anything.

**Errata — two errors of mine, both corrected in place below.**
1. **F-8 was wrong as first written.** It predicted the SS 9-column `repeat(9,1fr)` grid would squeeze cells to ~34px ("fits but compresses"). Measured, cells hold at **53.2px** — min-content floors win over `1fr` distribution — so the grid *overflows* rather than compressing. Static arithmetic cannot predict min-content behaviour; that was inference stated with more confidence than it had earned.
2. **A mid-session "correction" to F-2 was itself wrong and is retracted.** On the first (gate-broken) harness run I reported that overflowing content was *clipped and unreachable* because `html`/`body` computed `overflow-x: hidden` — and characterised this as worse than the original finding. That was the gate's scroll lock, not app behaviour. With the gate dismissed properly, `overflow` is correctly released (`body` inline style is empty) and the page scrolls horizontally as originally described. **F-2 as first written was correct.** A control page confirmed the harness itself does not induce the artifact.

Not done at all, and stated per the *report scope honestly* rule: a **physical**-device pass (headless Chromium is a real layout engine but not a real phone — no touch, no paint-level or platform-font behaviour), a screen-reader/keyboard-navigation pass, and contrast computation for the six non-default skins (only the default Tactical Green palette was computed). Those remain open Section F ground.

**One process note.** Two early greps in this session matched inside the one-line `DOCS_HTML` string and dumped the entire manual — exactly the trap OPERATIONS §B1 and the project cautions describe. All subsequent queries excluded line 3593. The line-number citations below are against the v5.38 source with `DOCS_HTML` **included** (i.e., real file line numbers).

Severity scale: **HIGH** = materially impairs use of a core flow for a real class of users · **MED** = friction or confusion in a common path · **LOW** = polish/minor · **NIT** = cosmetic.

---

## B. The app shell — findings that affect both screen sizes

### F-1 · The application has no responsive breakpoints at all — **HIGH (small screens), context for everything below**
**What:** The entire 12,691-line source contains exactly **one** `@media` rule, and it is inside the Field Manual's own stylesheet (`DOCS_HTML`, L3593). The app shell, all 26 tabs, every table and form rely solely on `flexWrap` (45 sites) and CSS grid to degrade on narrow viewports.
**Where:** whole-file measurement; the single media query is the manual's `@media(max-width:760px)`.
**Suspected cause:** the app was designed and tested on desktop; small-screen behaviour is whatever flex-wrap produces.
**Consequence:** flex rows genuinely wrap and nothing is *unreachable*, but every fixed-pixel grid (F-2) and dense control cluster is delivered to a phone at desktop proportions. Ironically the **Field Manual iframe is the most mobile-ready surface in the app** — it has a viewport meta, a 760px breakpoint that collapses its two-column TOC/glossary, and fluid SVG figures.

### F-2 · Fixed-pixel data grids without scroll wrappers overflow phone viewports — **HIGH (phone), MED (tablet)**
**What:** Wide tables are built as CSS grids with fixed pixel columns. Some are wrapped in `overflowX:auto` containers; some are not, and an unwrapped fixed-px grid forces **whole-page horizontal scrolling** on a ~380px viewport (~340px of content width) — the entire page pans, header and tab strip included, rather than the table scrolling within its own frame.

**Measured (380px viewport, gate dismissed).** On the IRMAA tab the unwrapped grid reports `scrollWidth 480` against `clientWidth 306`, and the document reports `scrollWidth 517` against a 380px viewport — i.e. the page is horizontally scrollable and the overflowing columns **are reachable**, just only by panning the whole page. Content is not clipped or lost; the cost is navigational, not data loss. (See the errata in §A: an intermediate claim that this content was unreachable was a harness artifact and is withdrawn.)
**Where (verified per site):**
- **Wrapped, fine:** the 11-column ≈785px grid at **L8525** (inside `overflowX:auto` at L8524); the 9-column `minWidth:650` grid at **L8999** (inside L8998). Seven `overflowX:auto` wrappers exist in total (L7564, 8524, 8998, 9533, 11912, 12122, 12234).
- **Unwrapped, overflowing:** the SS draw-comparison table at **L7320** (`50px+85px×5` ≈ 475px + padding) and the IRMAA "Year-by-year MAGI vs the next cliff" table at **L9772** (`50+64+90+96+90+90` ≈ 480px). Neither sits inside any of the seven wrappers.
**Suspected cause:** the scroll wrapper was applied table-by-table as tables were noticed to be wide, not as a policy; ~480px tables pass on desktop and were never seen at 380px.
**Note:** the UI SIZE control (F-10) makes this *worse* — it is applied as CSS `zoom` on the root (L5808), so at 130–150% these grids overflow proportionally sooner.

### F-3 · The 26-tab strip on a phone: a wall of sub-target-size buttons — **MED**
> **PARTLY FIXED at v5.82** (`docs/SCOPE_TEXT_AND_TARGETS.md`): v5.81 replaced the phone's tab strip with one menu (F-12); v5.82
> makes every control at least 24 × 24 px (WCAG 2.2 AA 2.5.8) and the five phone-critical controls 44 px tall below 600 px.
> Most controls remain under the 44 px platform guideline — not fixed, disclosed in Field Manual §13. `t48` guards it.
>
**What:** The tab strip (L5954–5961) is `flexWrap:"wrap"` over 26 buttons styled `.tab` (L5817): `font-size:10px`, `padding:7px 13px`, well under the 44px platform guideline for touch targets.
**Measured (380px viewport, gate dismissed):** **26 buttons, 27.0px tall, wrapping to 7 rows** — confirming the computed estimate (≈29px, 6–8 rows) and landing inside it. Seven rows of 27px targets consume roughly 190px of vertical space before any content renders.
**Mitigation that exists and works:** Simple Mode. `SIMPLE_TABS` (L5292) is exactly the six tabs the manual claims (`mydata, dashboard, trajectory, montecarlo, ss, docs`), the toggle persists (`danger_close:simple_v1`), and Guided Setup starts new plans in it. On a phone, Simple Mode is the difference between usable and hostile — but nothing *suggests* it on a narrow viewport (no breakpoint exists to do so, F-1). The toggle's own label is `fontSize:8` with a hover-only `title` explanation (F-5).
**Suspected cause:** design intent is a desktop console; Simple Mode was added for cognitive load, and happens to be the mobile answer too.

### F-4 · Micro-typography at sub-AA contrast, for a 55+ audience — **HIGH (accessibility, both form factors)**
> **CONTRAST FIXED IN EVERY SKIN at v5.83** (`docs/SCOPE_LIGHT_SKIN_SURFACES.md`): the 366 dark-theme `rgba()` surfaces are skin
> tokens, light skins' selected states and hovered rows read at AA, and `t48` requires 0 in all 13 skins (hover included). Still open:
> 44 px targets everywhere, and the Field Manual's own text.
>
> **PARTLY FIXED at v5.82** (`docs/SCOPE_TEXT_AND_TARGETS.md`). ⚠ **The counts below are pre-v5.48**: v5.48 raised the 341 × 8 px and
> 325 × 9 px sites to a 12 px body / 11 px label floor; this block kept quoting them as current until v5.82. v5.82 raises the floor's
> leftovers (the tab grid, the Trajectory chart's labels, three data-row classes, the Ask AI buttons) to 11 px, and brings
> `--ink-faint` to AA in every skin — measured on the built page, the **default and all seven dark skins now have no text below AA
> on any tab**. **Not fixed:** the six light skins still fail AA on tinted panels (hard-coded dark-theme `rgba()` surfaces, 366
> literals — pinned as KNOWN DEFECT counts in `t48`, owned by a v5.83 surface pass); hovered rows; the Field Manual's own text.
>
**What:** The dominant type sizes in the app are **8px (341 sites) and 9px (325 sites)** — together more than half of all explicit `fontSize` declarations — and the color most used for that micro text, `--ink-faint` (#3a7a5a, **410 sites**), measures **3.88:1** on the app background and **3.61:1** on panels (computed from the shipped default-skin values, L3603). WCAG AA requires 4.5:1 for normal-size text; these fail AA *at sizes far below normal*, and the app's stated audience is households within sight of retirement.
**Where:** measured whole-file; representative: diagnostics line 8px `--ink-dim`, `.micro` 11px `--ink-faint`, table headers 8px, the Simple Mode toggle 8px.
**Mitigations that exist:** the **UI SIZE control** (Skins tab: 100/115/130/150%, persisted, applied as root `zoom` — L5808, L6284–6291, L12538) genuinely enlarges everything, and the three light themes help in bright rooms. But zoom does not change a contrast *ratio*, and see F-10: the control is undocumented.
**Suspected cause:** the tactical-console aesthetic prizes density; each individual label looked fine on a desktop monitor.
**Defect vs disclosed:** undisclosed — nothing in-app or in the manual warns that the default presentation is small/low-contrast, though the Skins entry does steer bright-room users to light themes.

### F-5 · 38 hover-only tooltips are dead on touch — **LOW**
**What:** 38 `title=` attributes carry real information (e.g., the Simple Mode toggle's "Show only the six core tabs") that a tablet/phone user can never see.
**Suspected cause:** desktop habit. **Fix shape:** move load-bearing tooltips into visible micro-copy.

### F-6 · Money fields are bare text inputs — phones get the full QWERTY keyboard — **MED (mobile data entry)**
**What:** Of 92 `<input>` elements, only 31 carry any `type`; `inputMode` appears **once** in the file. The 11 `type="number"` inputs all live in the **Guided Setup wizard**; the main My Data forms — every holdings balance (L11930), every Other-accounts balance (L12063), mortgage balance (L11890), and the rest — are default text inputs. On iOS/Android that means the alphabetic keyboard for every dollar amount, in the tab where a new user types thirty-odd numbers.
**Suspected cause:** the wizard was built later with mobile in mind; the My Data forms predate it. (Text inputs may also be deliberate to allow "1.2M"-style entry — if so, `inputMode="decimal"` still gives the numeric keyboard without changing parsing. Steve's call.)

### F-7 · The Trajectory chart sizes once and never on resize — **LOW**
**What:** The one d3 chart (L5470–5474) measures `chartRef.current.clientWidth` when its effect runs and draws fixed coordinates into an `width:100%` SVG (L6375). There is no resize listener or `ResizeObserver` anywhere in the file. Resize the window or rotate a tablet and the drawing keeps its stale width — clipped or letter-boxed — until some state change re-renders it.
**Suspected cause:** effect deps are data, not viewport.

### F-8 · The SS optimizer's 9-column grids overflow the phone viewport — **MED** *(corrected — see errata, §A)*
**What:** The benefit-by-claiming-age rows (L7375) and the 81-cell joint claiming grid (L9105) are `repeat(9, 1fr)` at `fontSize` 8–9. This is the flagship couples feature (§07 sells it hard).

**Correction.** This finding first claimed the grid *fits* a ~340px content width by squeezing to ≈34px per cell — "unreadable confetti rather than overflowing" — and concluded that F-2's scroll-wrapper fix therefore did not apply. **That was wrong.** Measured at 380px: cells hold at **53.2px** at 9px font, giving a `scrollWidth` of **511px** inside a 306px container, with document `scrollWidth 598`. `1fr` is a *maximum* share, not a forced one — the min-content width of the cell contents (formatted dollar amounts, which do not wrap mid-figure) floors it, so the grid overflows instead of compressing.

**Consequence of the correction:** F-8 is the same defect class as F-2, not a separate one. The dollar figures remain legible; the grid simply extends past the viewport and requires whole-page horizontal panning. **The same `overflowX:auto` wrapper idiom fixes it**, which moves F-8 out of the "needs a real phone layout" bucket (iii) and into the mechanical fix bucket (ii) — see §F.
**Suspected cause:** `1fr` was the honest desktop choice; the failure mode on narrow screens was never observed either way.

### F-9 · Docs tab: nested 74vh scrolling on mobile — **LOW**
**What:** The manual renders in an iframe at `height:74vh` (L6352) — page scroll outside, manual scroll inside, a classic mobile nested-scroll annoyance. Inside the iframe the manual behaves well (own viewport meta, 760px breakpoint). Standard pattern, listed for completeness.

### F-10 · The UI SIZE accessibility control exists and the Field Manual never mentions it — **MED (documentation)**
**What:** The Skins tab carries a persisted **UI SIZE** control (100/115/130/150%, L6284–6291; storage key `danger_close:ui_scale_v1`; reset by Clear All at L3241) — precisely the mitigation for F-4, aimed (per its own hint text) at "4K and high-DPI screens" and, in practice, at older eyes. The Field Manual's Skins entry (§07) describes **only** the seven palettes; §13 doesn't list it; no section names it. The users who most need it are the least likely to stumble onto it.
**Suspected cause:** the F-4 audit pattern from `AUDIT_DOCS_HTML_v5_27.md` recurring — a shipped feature whose manual entry was never revisited. Same fix shape: one sentence in the Skins entry (and note the zoom-vs-overflow interaction from F-2 when recommending it on small screens).

---

## C. Desktop-specific observations

On a large window the app is fundamentally sound: `flexWrap` everywhere, seven scroll wrappers on the genuinely wide tables, a fluid manual, and one intentional 1000px `.wrap` inside the Docs iframe. The desktop findings are F-4 (the density/contrast trade-off does not need a phone to bite), F-7 (window-resize staleness), and one label nit recorded as F-15b below. No desktop-blocking issue was found.

---

## D. The deferred Field Manual material — §10, §14, §15 audited against v5.38

### D.1 What checks out — verified claim-by-claim against source, not assumed

The §10 API-key/Ask-AI section, the ground the v5.27 audit explicitly did not cover, is **accurate at v5.38 on every checkable claim**:

| §10 / §14 claim | Verified at |
|---|---|
| Key panel appears only outside claude.ai; environment detection fails **closed** (no key UI if host is indeterminate) | L2318–2326, L11087 |
| Key masked as `sk-ant-••••••••` + last 4 | L11099 |
| Key sent as `x-api-key` header, **only** to `api.anthropic.com`, never inside claude.ai, never on the Local-Model route | L5727–5735 (the local-model fetch builds no key header) |
| Key stored under its own key, never exported, **wiped by Clear All Data** | `STORAGE_KEYS.apikey`, L3239 ("credentials never survive a wipe") |
| Conversation re-sends **last 12 messages**, errors excluded | L5699 |
| **8-attachment cap** | L5647 |
| **45-second timeout** with the exact `REQUEST TIMED OUT (45s)` string | L5695, L5769 |
| `COMMS ERROR` / `ERROR [4xx/5xx]` strings and their described causes | L5756, L5771 |
| Offline Mode hard-stops before anything is built or sent, **and persists** | L5250 (writes `danger_close:offline_v1`), L5686 |
| "Ask AI does nothing until a simulation has run" | L5693 — the guard literally returns silently on empty `simData`, matching the FAQ's symptom word-for-word |
| Office files can't be attached | the file input's `accept` list (L11192) excludes them |
| Glossary: QCD 2026 cap $111K/person | `TAX_CONSTS.QCD_LIMIT = 111000`, L851 |
| §06/glossary regime weights 45/20/15/10/7/3; Roth slider $0–$400K, step $5K, default $70K; Simple Mode = six named tabs | L765; L8969 + L5280; L5292 |

One §14 nuance, not a defect: the FAQ's "no HEIC" is *advice*, not enforcement — the picker's `accept="image/*"` happily admits HEIC and the API then rejects it as the 4xx that very row troubleshoots. Client-side pre-filtering would upgrade the advice into behaviour; optional.

### D.2 Defects in the deferred material

**F-11 · §13's "In plain English" callout is over-escaped and renders broken — MED (rendering defect).**
The JS string carries one `class=\\\"plain\\\"` / `class=\\\"lbl\\\"` pair escaped one level too deep (source shows `\\\\\\"` where nine sibling callouts show `\\\"`). Decoded to runtime bytes, the iframe receives `<div class=\"plain\">` — **literal backslashes in the markup** — so the class never applies: the two-buckets section's plain-English callout renders as unstyled text with stray `\"` artefacts, while the manual's nine other callouts render correctly (verified programmatically: 9 correct / 1 broken, for both `plain` and `lbl`). **Pre-existing:** byte-identical in v5.37, so not a v5.38 regression; it entered with the §13 two-buckets block. **Why nothing caught it:** `t4`'s six manual assertions target other strings — this is Finding 4 of the v5.27 docs audit playing out again (no tool reads a narrative for correctness), except this instance *is* mechanically checkable: an assertion that the decoded `DOCS_HTML` contains zero `\"` sequences would pin the whole class extinct.

**F-13 · §14's first FAQ row is structurally malformed — MED.**
The "Will Social Security run out?" row has **two** `<td>` cells in a three-column (Symptom / Likely cause / Fix) table — verified programmatically; every other row has three. The row renders misaligned with an empty Fix column. Underneath the markup slip is a content-shape issue: it is a policy question with a mini-essay answer, not a troubleshooting symptom, jammed into a symptom table. Fix shape: either give it its Fix cell or (better) lift it out of the table as a lead-in Q&A.

**F-14 · Glossary "TCJA" entry states superseded law — LOW-MED.**
"…many individual provisions expire after 2025 unless extended" was true when written; OBBBA (2025) settled it, and **this same manual's §13 models OBBBA** — so the document contradicts itself on the state of the law. For a tool whose identity is candour about staleness, a stale law statement in its own glossary is the credibility version of the v5.27 "what's new says v5.7" finding, in miniature.

**F-12 · "25" vs "26", twice — LOW (one certain, one for Steve).**
§05's body text asks "Feeling like **25** is a lot?" two lines beneath its own heading "The **26** Tabs at a Glance" — an internal contradiction, plainly stale. FIG.1's box reads "**25 TABS** / all read the same model," which *may* be deliberate (26 tabs minus My Data, which writes the model rather than reading it) — if intended, it deserves a caption note; if not, it's the same staleness. Both pre-exist v5.38 (present in v5.37). The 26-tab count itself is correct everywhere else and matches the tab array (L5955) and `t4`.

**F-15 · Glossary "Success Rate" thresholds don't match what the tabs display — LOW.**
Glossary: "($500K/$800K/$1.5M here)". The engine computes five thresholds (L2141–2145: $500K, $800K, $250K, $1.25M, $1.5M) and the tabs display **$500K, $250K, $1.25M, $1.5M and $800K in different panels** (L10071–10072, L10172, L10776, L10799). Three of the glossary's figures exist, but a user checking the Monte Carlo tab against the glossary will find $250K and $1.25M unexplained. **F-15b (NIT, app-side):** the label at L10799 reads "Success (>**$1,500K**)" where sibling labels use "$1.25M" — unit-style inconsistency on one line.

**F-17 · §07 Docs entry oversells the toolbar — LOW.**
"…downloadable as HTML **or printable to PDF from the toolbar above**." The toolbar downloads HTML and displays instructions ("Download the HTML, open it in your browser, then Print → Save as PDF" — L6335); `window.print` appears nowhere in the source. §14's closing note has the same phrasing. Accurate fix is three words ("or print it from your browser").

**F-18 · §07 presents "ACA Premium Subsidy" as a tab that doesn't exist — LOW (confusion, not falsehood).**
The §07 entry is styled as a `tabentry` among real tabs, but the verified 26-tab array (L5955) has no ACA tab — the feature lives on the Roth tab, as the entry's own body text says. A reader scanning §07 as a tab directory will hunt the tab strip for it. The §05 tab map correctly omits it, which makes §07 the outlier. Fix shape: retitle the entry ("ACA Premium Subsidy — *on the Roth tab*") or restyle it as a sub-entry of Roth.

**F-16 · Glossary ordering — NIT.** "API Key" precedes "Agency MBS": ASCII case-sensitive sort, not human-alphabetical. One slip in 79 terms (count verified); every internal `href="#…"` anchor in the manual resolves (verified — zero dangling).

### D.3 What was *not* done to the deferred material
Per the same standard the v5.27 docs audit set for itself: glossary claims were checked against the **app's own constants and behaviour** (and internal consistency), not re-derived from primary tax sources — `t10`/the Verify tab own that ground. The 79 glossary terms were read individually; findings above are exhaustive for internal-inconsistency and app-mismatch classes, but a term-by-term check against external references (e.g., whether "duration ≈ −6% per 1%" is a fair simplification) was judged out of Section F's usability lane and remains open if Steve wants a subject-matter pass.

---

## E. What Section F did not cover (open ground)

1. **Physical-device pass** — headless Chromium at 380px now backs F-2, F-3 and F-8 with engine measurements (§A), but a real phone is still untested: no touch-target behaviour, no platform fonts, no paint-level or momentum-scroll behaviour, and no confirmation that whole-page horizontal panning is as awkward in the hand as it reads on paper. Ten minutes in Chrome/Edge DevTools' device toolbar (Ctrl+Shift+M) or on an actual handset would close this. The remaining small-screen findings (F-4 contrast at size, F-5 touch tooltips, F-6 keyboard type, F-9 nested scroll) are **still computed, not observed**.
2. **Keyboard navigation and screen-reader semantics** — untested. Early signal for a future pass: the tab strip is `<button>`s (good), but the app is div-and-inline-style throughout, so landmark/heading semantics are likely thin.
3. **Contrast for the six non-default skins** — only Tactical Green was computed. The light themes may pass AA where the console theme fails; worth computing before deciding F-4's fix.
4. **The two-paragraph top-five standalone summary** the standing scope calls for after the final phase is **deliberately not included here**: it must draw on all four documents, and per the manifest, Section C's 2D break-even half and Section D's undisclosed-gap sweep remain open. Writing the top-five now would present an incomplete audit as complete. It should be written in the session that closes those two items.

---

## F. Suggested fix groupings (options, with a recommendation — Steve decides)

- **(i) Docs-only release** (the v5.27/v5.28 pattern, small and safe): F-11 (re-escape the §13 callout — one string edit, plus a `t4` extinction assertion that decoded `DOCS_HTML` contains no `\"`), F-13, F-14, F-12 (§05 "25"→"26"; decide FIG.1), F-15, F-17, F-18, F-16, and F-10's one documentation sentence. Presentation-only, parity 8/8, no engine change.
- **(ii) Small-screen mechanics release:** F-2 (wrap L7320 and L9772 in the same `overflowX:auto` idiom the other five tables already use), **F-8 (same idiom on the two `repeat(9,1fr)` grids at L7375 and L9105 — moved here from (iii) by the measurement correction; it is a wrapper fix, not a layout rewrite)**, F-6 (`inputMode="decimal"` on money fields — additive, no parsing change), F-5 (surface the load-bearing tooltips), F-15b. Still no engine change, but touches render code, so the DOM suites are the proof. The now-working headless harness can serve as the before/after check.
- **(iii) Deliberate scope decisions, not quick fixes:** F-1/F-3 (a real phone layout or an explicit "desktop-first, use Simple Mode on phones" disclosure in §13 — the *disclose-or-fix* rule applies: right now the small-screen degradation is undisclosed), F-4 (a contrast pass on `--ink-faint` sizes, or an in-app pointer to UI SIZE + light themes), F-7 (a resize listener).

**Recommendation:** ship (i) next — it is the same shape as v5.27, every edit is verifiable by string assertion, and F-11/F-13 are visible-to-users today; fold (ii) into it only if the DOM-suite budget allows; scope (iii) separately, because F-1 is a product-direction question (§ *Product boundary test*: a mainstream couple within sight of retirement increasingly opens tools on a tablet — this one arguably passes).

*Findings F-11, F-12 pre-exist v5.38 (verified byte-identical in v5.37); all other docs findings were checked only against v5.38 and their introduction release was not traced. Nothing in this document alters engine behaviour or figures; no source was modified.*

---

## G. Appendix — the small-screen measurement harness

Recorded verbatim so the capability is not rebuilt from scratch next session. Requires only `registry.npmjs.org` (allowlisted); no local browser install, and nothing needed on the maintainer's machine — Chrome/Edge DevTools' device toolbar (Ctrl+Shift+M) covers manual confirmation.

```bash
mkdir -p /tmp/pptest && cd /tmp/pptest && npm init -y
npm i puppeteer-core @sparticuz/chromium
node measure.mjs 380
```

```js
// measure.mjs — v5.38 small-screen measurements
// CRITICAL: the disclaimer gate (src/index.html L47) sets html/body overflow:hidden and
// restores it (L55) ONLY in #dc-dg-accept's click handler, which is disabled until
// #dc-dg-check is ticked. The accept button reads "Enter the tool" — text-matching on
// UNDERSTAND/ACCEPT/CONTINUE misses it, and evaluate-click fires through the overlay,
// so the run looks fine while the scroll lock stays on and mimics a clipping defect.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const WIDTH = Number(process.argv[2] || 380);
const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: 844 });
await page.goto('file:///tmp/ship/index.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1500));

// dismiss the gate the way a user must
await page.evaluate(() => {
  document.getElementById('dc-dg-check').click();
  document.getElementById('dc-dg-accept').click();
});
// assert the scroll lock actually released before trusting any measurement
const clean = await page.evaluate(() => document.body.getAttribute('style') === '');
if (!clean) throw new Error('gate scroll-lock still applied — measurements invalid');

await page.evaluate(() => [...document.querySelectorAll('button')]
  .find(x => x.textContent.includes('USE EXAMPLE DATA'))?.click());
await new Promise(r => setTimeout(r, 3500));
// ... then click button.tab elements by name and read getBoundingClientRect /
//     scrollWidth / clientWidth / getComputedStyle per finding.
await browser.close();
```

**Control check (run this first if a result looks like a clipping defect).** Load a blank page containing a single 900px-wide box at the same viewport: a healthy harness reports `overflowX: "visible"` and `documentElement.scrollWidth ≈ 908`. If it reports `hidden`, the artifact is in the harness or the gate, not the app. This control is what caught the retracted F-2 claim in §A.

**Committing this to `qa/tools/` is not proposed here.** It would be a source addition, and the *scope before build* rule applies — it needs a `SCOPE_*.md` naming the premise, the site census, and the tests it ships with, plus a decision on whether an audit-only harness belongs in the shipped repo at all. Flagged for Steve; not actioned.

---

## H. Findings filed after the audit

### F-19r · The Ranking tab's headline "TOP N%" averages nine tiers, and eight have no peer data behind them — **MED (honesty of an output)**

> ✅ **FIXED v6.11** (`docs/SCOPE_F19R_RANKING_HEADLINE.md`; all six decisions as recommended). The headline is the net-worth band against
> the SCF and nothing else; the four rows without peer data show the household's figure beside a survey figure with no tier and no ratio;
> Roth Strategy, Healthcare Planning and Planning Sophistication are removed; the praise copy is replaced by figures; Net Worth gains its
> median band and Portfolio Size loses its floor; "Nx avg SS" is gone; the column header reads "Survey figure"; the Field Manual says which
> rows are ranked. Pinned by `t74` (both legs). **Filed as "F-19"** — the number was already the v5.39 skins finding (census note above).
>
> ⚠ **Its measured figure below was wrong, in the safe direction.** "At $20,000 invested … Overall tier TOP 15%" was read without
> re-running the Monte Carlo: `applyLoadedData` changes the household but not `simData`, so the Readiness row kept the example's 100%
> success and "TOP 5%". With the sims re-run, v6.09 and v6.10 both show **TOP 18%** for that household (0.0% success, "TOP 30%"). The
> trap is now in OPERATIONS §C. The text below is left as filed.

**Filed at v6.10** (scope `docs/SCOPE_PEER_DATA_SCF2025_V610.md`, decision DD-4 (a): record it for its own scope; v6.10 does not change it).
Measured on v6.09; v6.10 leaves the logic as it was.

**What the tab does.** The Ranking tab's **"Overall tier: TOP N% of Americans age …"**, and the Bottom Line's *"If you walked into a
room with 100 randomly selected {age}-year-old Americans, you would rank in the top N"*, are the **plain average** of nine dimension
tiers (`tierVal`, then `avgPctile`). Where each tier comes from:

| Dimension | Tier from | Peer data? |
|---|---|---|
| Net Worth | SCF percentile cut-offs (from v6.10, `PEER_BENCHMARKS.nwCuts`) | **yes** |
| Portfolio Size | SCF financial-asset cut-offs from v6.10 (DD-2); an unsourced $800K / $1.5M before | yes from v6.10 — but below the 90th percentile it always says **TOP 25%**, even for a household at the bottom |
| Retirement Readiness | the user's own Monte Carlo success against 95% / 85% | no — compared with "~47% on track", a different measure |
| Income Replacement | the user's own replacement ratio against 65% | no |
| Debt Load | the fixed string **TOP 20%** | no — the same for any mortgage |
| Roth Strategy | the fixed string **TOP 10%** | no |
| Healthcare Planning | the fixed string **TOP 5%** | no |
| Housing Equity | the fixed string **TOP 15%** | no |
| Planning Sophistication | the fixed string **TOP 5%** | no |

**Measured (v6.09, session probe; example household with only its investable portfolio changed).** At **$20,000** invested — net
worth $350,000 with the example's $330,000 home equity — the tab shows Net Worth **TOP 50%**, Portfolio Size **TOP 25%**, and
**Overall tier TOP 15%**. At $6,000,000 it shows **TOP 10%**. The five fixed strings hold the headline inside a narrow band
whatever the household enters.

**Smaller things in the same block, noted so a scope finds them:** `tierVal` scores **"TOP 50%"** as 30 (its default branch),
because the ladder lists no 50. The dimension table's column header reads **"Peer benchmark (age 62)"** while every peer figure is
for ages 55–64. Income Replacement divides a couple's *combined* guaranteed income by **one person's** average Social Security award.

**Options (for its own scope — Steve decides):**
(a) **Recommended:** base the headline only on the dimensions with peer data (net worth, portfolio), and show the other seven as
descriptive notes without a "TOP N%".
(b) Drop the headline and the Bottom Line's percentile sentence; keep the per-dimension rows.
(c) Keep both and disclose, next to the headline, that most of its inputs are fixed.

### F-20 · The Income tab's stream list scrolls sideways on a phone — **LOW–MED (phone layout)**

**Filed at v6.23** (`docs/SCOPE_D49_WORK_TAPER_V623.md` §0.4; not fixed). Measured at the scope: `t45` run on a prototype whose example
carried three income-stream rows — so its Income tab rendered the stream list every v6.22 plan with streams renders — reads *"the page
does not scroll sideways at 390 px"* failing, **scrollWidth 510 against 390**. `t45` never sees it on a shipped build because it runs on
the example, which has no income streams. **Who it reaches:** any plan with an income stream (a job row, rental, an annuity), on a phone.
**Why it matters beyond layout:** moving the example's built-in spouse-B work into visible rows — the way to close D-49's residual
(MissingFeatures) — would put this list on the example's own Income tab, so the fix belongs before or with that release. Candidate fix: wrap
the list's row grid at the phone breakpoint, as F-2 and F-8 did for the grids they named, and extend `t45` to a household with streams.

### F-21 · My Data's holdings table: the plan type read as the next holding's, and the totals sat one column right — **LOW–MED (desktop layout)** — **FIXED v6.25**

**Filed and fixed at v6.25** (`docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md`; Steve, with a screenshot: *"under the My data tab in the
retirement, the fields don't line up"*). Through v6.24 the *Retirement holdings* table's Tax type cell held two dropdowns stacked — the tax
type and, for a row with Traditional dollars, the plan type (from v5.91) — with no header for the second and no divider between rows; the
spacing within a pair was about the spacing between pairs, so the lower dropdown read as the next ticker's. A sibling in the same table: the
footer's *Total annual fees →* spanned nine columns where eight stood before *$/yr fee*, so the fee total sat under *Contrib split %* and a
footer cell ran past the table's last column — so since the footer was written. **Fixed:** plan type has its own headed column (a dash for a
Roth row), each row has a divider, and each total sits under its own column; measured in Chromium at 1440 px (rows 66–67 px → 35–36 px).
Nothing stored or computed changed. `t88` pins the structure on both legs.

### F-22 · The Grade tab tells the user what to do — **MED (honesty of an output)** — **FIXED v6.27**

**Filed at v6.26** (`docs/SCOPE_D55_AI_GROUND_RULES_V626.md` §0.3 item 4, found by its independent review; not fixed). The app reports what the
model computes, never advice, and its comparisons say so (*"the model's best cell"*). From v6.26 Ask AI is told not to tell the user which
financial decision to make. The Grade tab's *"PATH TO {grade} — RECOMMENDED ACTIONS"* panel does: read at v6.26, its list (`improvements`, in the
Grade tab's render) is
- *"Secure hybrid LTC insurance policy for both spouses"* — on any plan whose expense table has no row labelled LTC or long-term (a single plan
  included), with a projected grade lift;
- *"Execute Roth conversion ladder {start}–{end} (fill 22% bracket each year)"* — on every plan, whatever its brackets or the Roth tab's best cell;
- *"Complete N survivor-critical estate item(s): …"* — from the checklist, an administrative task rather than a financial choice.

Its own comment says *"No allocation/rebalancing actions in this build — … allocation decisions are the user's alone"*, so the line it draws is
narrower than the one Ask AI now follows. **Who it reaches:** every user who opens the Grade tab. Candidate fix (its own scope, decisions for
Steve): reword the panel as the model's findings (*"the model's grade rises if…"*) or drop the actions, and tie the Roth line to the Roth tab's
best cell rather than a fixed 22% bracket.

**Fixed at v6.27** (`docs/SCOPE_F22_GRADE_FINDINGS_V627.md`; DG-1 to DG-4, all (a)). **Wider than registered.** None of the panel's three
grade lifts was what the model does: the LTC and Tax Efficiency grades are literals, so a policy (+0.20) or a ladder (+0.05) could not move them —
an LTC premium row can in fact *lower* the grade (more spending; the couple fixture 2.99 → 2.94) — and the estate lift was understated (+0.21 and D → B on the example, not
"+0.10 … toward an A"). Its *"Projected MC success"* was the current rate plus 3–5 points, never simulated (on the example, *"95–97%, From
100%"*). The categories told every plan *"Hybrid LTC insurance active"*, blamed the 6-year Monte Carlo's failures on an LTC shock that engine
does not carry, called every plan's conversion plan *"well-designed"*, and showed the example household's *"International intentionally
reduced…"*. Three grades are literals and Guardrail Readiness reads rows labelled exactly "golf" and "Amazon", which caps every plan at
**B+**; the tab said none of it, and the Field Manual described a radar chart that does not exist. **Fixed:** the panel is gone (the
equity share stays, as a fact, saying what is graded — Sequence Protection reads the cash-and-bond share); the sentences are corrected, and
three more the build review found (*"Hedge holdings add $0K convexity"* beside *"No hedge positions held"*, the Roth line's years from the
target rather than the selected retirement year, the guardrail's *"whenever a cut is needed"* when it always is); the three literal grades carry *"Fixed in this build"*, Guardrail Readiness
*"Graded from two fixed expense labels"* (the grade list and *Top grade drags* mark them † and ‡), and the ceiling is stated; the Field Manual's entry matches the tab. **No grade moved** — `t90`
B-8 compares every plan's grades with the v6.26 leg's under the same seed. The candidate fix's Roth-best-cell line is superseded (the line is
gone). Computing the literal grades is filed with D-56 (MissingFeatures); directive copy on other tabs is **F-23**; the Grade tab's remaining copy
and its understated *"Lost ~X GPA points"* are **F-24**.

### F-23 · Directive copy on other tabs — **LOW–MED (honesty of an output)** — **FIXED v6.28**

**Filed at v6.27** (`docs/SCOPE_F22_GRADE_FINDINGS_V627.md` §4, from its §K2 sweep and its independent review; not fixed). The sweep was not
exhaustive, so the fix starts with a full census of model-description copy. Found so far, read at v6.26:
- **Withdrawal tab**, *ORDER OF OPERATIONS*, Step 7: *"Execute planned Roth conversion (if within …) to fill 22% bracket. Pay conversion taxes
  from Taxable account, NOT from retirement assets."* An instruction — and a misdescription: the same tab says its Conv column is *"the annual
  Roth conversion amount set by the slider on the Roth tab"*.
- **Guardrails tab**: three *"ACTION: …"* lines describing the Guyton-Klinger rule (*"Cut next year spending by 10%"*, *"Continue as planned"*,
  *"Increase spending 5% or boost Roth conversions"*). They describe the modelled rule; whether the engine "boosts Roth conversions" was not checked.
- **Exit Plan tab**: *"Elect the pension's joint-&-survivor option in writing with the plan administrator."*; *"Build 1–2 years of spending into a
  brokerage money-market / T-bills …"*; *"… Often the highest-value move in the whole transition."*
- **The plan-events list** (`computePlanEvents`): *"execute {yr} conversion by Dec 31"* and *"Convert the planned amount (Roth-tab slider) …
  Pay the tax from the taxable account."*

**Who it reaches:** every user who opens those tabs. Candidate fix (its own scope): describe each as what the model does or assumes, and keep
logistics (dates, deadlines) separate from financial choices, as the Exit Plan tab's own *"This is logistics — not financial, tax, or legal
advice"* intends.

**Fixed at v6.28** (`docs/SCOPE_F23_F24_DIRECTIVES_V628.md`; DF-1 to DF-8, all (a)). **About ten times wider than registered.** A parser
census of every user-facing string and the Field Manual, read by six independent readers, flagged 283 entries (39 D, 52 D?, 102 E, 151 V);
every D and D? was adjudicated against the source. Recast as what the model computes or assumes: the Guardrails tab (its *ACTION:* lines,
one of which said the model *"boosts Roth conversions"*, which no engine does), the Withdrawal tab (its seven steps, its Priority-1 *"Years
active"*, now the schedule's own year, and its three-strategy comparison with a *"Recommendation"*, removed), the Exit Plan (its directives
and its header, *"Exit plan — the dates and paperwork"*), the Events tab's Roth alarm (*"if converting this year"*), the SS tab's
*"#1 OPTIMIZATION LEVER"* and optimizer headings, the Roth tab's *"ideal"* bracket and *"classic guideline"*, the Survivor tab's case for
converting, the Stress tab's *"Reserve defense"*, the checklist's trust and claiming lines, and the Field Manual's *"PAY CONVERSION TAX FROM
OUTSIDE FUNDS"* (its worked examples kept, under *"Paying conversion tax: outside funds or withholding — what each costs"*). **Twelve
statements false about the model were corrected** (scope §0.3): among them, the schedule applies no guardrail, harvests nothing and pays no
income tax; it draws Traditional and Roth in proportion within each sleeve, not Roth last; taxable Social Security is part of IRMAA's MAGI;
and the SS tab's survivor card no longer names spouse A the higher earner on every couple. **The build review found eight more**, all
corrected: the Withdrawal tab's holdings card counted Other-account Traditional money already in Priority 1; the Exit Plan's income line left
out income streams, its conversion years were said to end before RMDs, and its COBRA sentence ignored the gap's length; *"a smaller survivor
benefit"* for either spouse's claim (only the larger benefit's sets it); survivor wording on single plans; the in-app Events legend's
*"window open: go"*; and the Field Manual figure's *"convert at low brackets"*. METHODOLOGY §9 is corrected (the guardrails are the Monte
Carlo's). No engine, figure the engines compute, grade or stored field changed. What the census found and this release did not fix is **F-25**.

### F-24 · The Grade tab's remaining copy, and its "Lost ~X GPA points" — **LOW–MED (honesty of an output)** — **FIXED v6.28**

**Filed at v6.27** (the v6.27 build's independent review; not fixed — outside the decided scope, and one item changes a displayed figure).
Read at v6.27:
- **"Lost ~X GPA points (weight N%)"** in *Top grade drags* is `(4 − gpa) × weight / 100`, but the nine weights sum to **78**, so every figure is
  understated by 22% (the example's Estate Readiness shows 0.24; its real cost to the overall GPA is 3 × 8 / 78 = 0.31). The *"Weight: N%"*
  chips sum to 78%. A displayed figure, so its fix is Steve's call: divide by the weights' sum, or show weights as points rather than percents.
- **Income Floor's drag**, *"requires ~$XK accelerated portfolio draw at peak sequence risk"*, is editorial, and the floor counts Social
  Security and the pension only — a plan's income streams (the couple fixture's $1,200 rental) are in neither its *"covers N%"* nor its $ figure.
- **Estate Readiness's drag** states legal effects as fact (*"an incapacity forces a court guardianship"* — many states have default
  health-care surrogate laws; *"stale beneficiary designations override the will entirely"* — a designation governs that account).
- **Monte Carlo**: *"Strong base-case performance"* at 90% or more is evaluative, and the rate is not a base case; between 88% and 90% the
  below-90% sentence is labelled STATUS, not DRAG (the label follows the grade, B+ = 3.3).
- **The LTC test** `/ltc|long.?term/i` (the Grade tab's and the Stress tab's) also matches a *"Long-term disability"* row, which would read as
  an LTC line.
- **Tax Efficiency's RMD estimate** grows the balance over the ladder's length rather than the years to RMDs and divides the household's
  Traditional balance by spouse A's divisor — disclosed as rough.

Candidate fix: its own scope, with the figure as a decision for Steve.

**Fixed at v6.28** with F-23 (DF-1, DF-2 and DF-8, all (a)). *"Lost ~X GPA points"* divides by the weights' sum, 78, so each figure is the
category's real cost to the overall GPA and they add to 4 − GPA (the example's Estate Readiness reads 0.31, where it read 0.24); the cut-off
is set in raw points, so the same drags show as at v6.27; weights read *"20 of 78"*. A category reads *STATUS* only at GPA 4.0. Income Floor's
evidence says it counts Social Security and the pension, not income streams (the Income tab's floor counts them), and its drag gives the gap
in months, with no dollar figure (the gap figure both tabs show is wrong for a late-claiming spouse B, filed under F-25). The Estate drag
makes no legal claim. The Monte Carlo sentence says its rate is the 6-year engine's, which carries no long-term-care event. One LTC test,
`isLTCLabel`, serves the Grade and Monte Carlo tabs and no longer matches *"Long-term disability"*. Tax Efficiency's rough RMD estimate is
removed; its drag gives each spouse's RMD start age. **No grade moved** (`t90` B-8 compares every plan's grades with the v6.27 leg's).

### F-25 · Editorial and unchecked model claims across the app — **LOW–MED (honesty of an output)** — **FIXED v6.29**

**Filed at v6.28** (`docs/SCOPE_F23_F24_DIRECTIVES_V628.md` §4; its census and its build review). Steve chose to fix directives and false
statements at v6.28 and to file the rest. The census is kept in `docs/F25_CENSUS_V627.tsv` (283 entries, with id, line, tab, tags and text), so
this item's scope starts from it. Open:
- **The E-tagged entries (102), less those v6.28 rewrote:** editorial or unsourced claims, e.g. the checklist's legal *"why"* sentences,
  *"Congress has always acted before a cut landed"*, unsourced market history, *"The single biggest lever"*, the IRMAA tab's *"the main
  lever"*, the Withdrawal footer's *"actual tax planning requires a CPA"*, *"A Health Savings Account is the most tax-advantaged account there
  is"*, the Monte Carlo tab's *"another tool might show 95%"*.
- **The V-tagged entries (151), less V-1 to V-12:** specific claims about the model, to be checked one by one in the source.
- **The gap-draw figure.** The Grade's (until v6.27) and the Income tab's gap draw subtract spouse B's Social Security for the whole gap,
  even when B claims after A. A displayed figure; its fix is with D-57 (MissingFeatures).
- **Found by the v6.28 build review, checked in the source, not fixed:**
  - the Backtest tab says *"the MC headline success is 'ended above $500K', and the MC also charges LTC shocks"*; the header's rate is the
    6-year Monte Carlo's above $800K, which carries no long-term-care event;
  - the Exit Plan calls a spouse *"Medicare-eligible at retirement"* whenever they turn 65 in the retirement year, though retirement is
    January and the birthday may be later;
  - the estimated-tax event says *"Roth conversions have no withholding"* (withholding can be elected on a conversion, and the Exit Plan's
    v6.28 line says so of distributions);
  - the Events tab and the Exit Plan date the conversion window from the **target** retirement year, the Withdrawal schedule from the
    **selected** one (±1 year);
  - the SS survivor card orders the two benefits at full retirement age, while the model compares the claimed amounts (now worded *"unless
    the claim ages reverse the order"*);
  - the Grade tab's *DRAG* label sits on sentences its grade does not read (Income Floor's gap months, the fixed grades' notes);
  - the Exit Plan's first phase is still titled *"CONFIRM THE MONEY WORKS"* (`t4` signs it), a verdict the model does not give;
  - the Withdrawal tab's RMD line names spouse A's start only.

Candidate fix: its own scope, from the census, with each V entry checked in the source first.

**Fixed at v6.29** (`docs/SCOPE_F25_MODEL_CLAIMS_V629.md`, all eleven decisions as recommended; the ledger is `docs/F25_LEDGER_V628.tsv`,
326 rows). The census was re-resolved on v6.28 and every entry read by two independent readers against the code; 93 were confirmed FALSE or
PARTLY (4 figures, 48 misleading, 47 imprecise after the verifiers' corrections), 16 editorial, 40 statements about the world. Each was
reworded to what the code does or computed for the plan — the Stress recovery, the Backtest's survival note (shown only at ≥ 90%) and What
Breaks' history comparison are now computed; the gap draw pays B from B's claim month; the mortgage what-if quotes the active preset and
handles the sign; Example 2 states its method ($10,400). The world claims were checked against primary sources (IRS, CMS, SSA, HHS/ASPE,
the 2026 Trustees Report, the statutes) and corrected or removed; comparisons with other tools are removed. The build-review items above:
the Backtest comparison (fixed), *"Medicare-eligible at retirement"* (by month now), the withholding sentence (corrected, W-4R/W-4V), the
Exit Plan's conversion window (the selected year; the Events tab's item keeps the target year and says so), the *DRAG* label (*NOTE:* on the
three fixed grades and Income Floor's months), *"CONFIRM THE MONEY WORKS"* (renamed), the Withdrawal tab's RMD line (each person's). The
SS survivor card's FRA ordering keeps its v6.28 wording. Pinned by `t92` (both legs). What remains is filed as **F-26**.

### F-26 · Claims the F-25 census did not reach, found at the v6.29 build — **LOW (honesty of an output)** — OPEN

**Filed at v6.29.** The F-25 build edited sentences beside the ledger's and found these, outside the census's flagged set. Fixed in the same
build because they sat in edited cards: the Stress tab's two scenario descriptions (*"Tech/AI crashes 40–50% in Year 1"*, *"Inflation 6–8% …
bonds down 10–15%"* — now the forced regimes' own figures from `SCENARIOS`), its *"At 7% inflation"* (the regime's 6.5%), What Breaks'
*"1929–32 was ≈−80%"* (the app's annual data gives about −65%), the Survivor tab's *"the survivor's portfolio draw rises"* (keyed to
percentages; now the draw itself), the CT, NJ, NY, RI and VA notes' claim that the state base carries no dividends (it carries the taxable
yield; `t35` D-2/D-3, D-10/D-11, D-18/D-19 had locked the false claim), and the Dashboard's crash card (*"vs X% with no forced crash"*,
an unlike pair — MissingFeatures D-63). **Open, not fixed:**
- the Stress tab's other cards: *"Combined shock: $300K–$600K over 4–10 years"*; the sequence card's *"{B} must sustain for 20+ years
  alone"* and *"Survivor SS benefit = {A}'s FRA + DRCs accrued"*, and its income line *"survivor SS ({A}'s check)+"* — written as if spouse A
  has the larger benefit and dies first (the v6.28 V-12 shape, on another tab);
- ~~the Field Manual's Ask AI cost note gives token counts that look estimated at about four characters a token; Anthropic's figure is about
  3½, so they may read about 14% low — not measured;~~ **addressed at v6.31** (`docs/SCOPE_D51_AI6_V631.md` §0.6): the counts were derived
  at characters ÷ 4 (confirmed in `t66` and `t89`); the note now states them for Claude Opus 4.8 — characters ÷ 3.5, × 1.35 for the newer
  tokenizer (900–2,300 for an entered plan, about 7,000 for the example), with prices and costs recomputed. Still computed, not measured
  against a live bill;
- the Roth tab's ladder table and its strategy heading start at the **target** retirement year, while Engines A–C convert from the
  **selected** one (±1 year) — the Exit Plan now says the selected year;
- the Events tab's ACA status line prints *"Nov 1 – Jan 15"* for every year; the item's instructions now say the dates can change;
- the Backtest's *"1966 is generally considered the worst real start year in US history"* — a market-history claim the app's own data could
  settle, not checked;
- the repo's `README.md` (the GitHub front page, outside the app and so outside the census) still says the Verify tab *"re-runs every
  statutory constant the math depends on"* — the promise v6.29 corrects in-app, which now names what is checked and what is not — and
  states *"562 checks"* and *"all 26 tabs"*, figures from an early build. Found at the v6.29 package check.
**Lesson recorded in the scope (§7):** the census flagged sentences by tag; a sentence in an edited card that the census had not flagged
still needed reading. Candidate fix: a short pass over the Stress tab's cards and the items above, each checked in the source.

