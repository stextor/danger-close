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
**What:** The tab strip (L5954–5961) is `flexWrap:"wrap"` over 26 buttons styled `.tab` (L5817): `font-size:10px`, `padding:7px 13px`, well under the 44px platform guideline for touch targets.
**Measured (380px viewport, gate dismissed):** **26 buttons, 27.0px tall, wrapping to 7 rows** — confirming the computed estimate (≈29px, 6–8 rows) and landing inside it. Seven rows of 27px targets consume roughly 190px of vertical space before any content renders.
**Mitigation that exists and works:** Simple Mode. `SIMPLE_TABS` (L5292) is exactly the six tabs the manual claims (`mydata, dashboard, trajectory, montecarlo, ss, docs`), the toggle persists (`danger_close:simple_v1`), and Guided Setup starts new plans in it. On a phone, Simple Mode is the difference between usable and hostile — but nothing *suggests* it on a narrow viewport (no breakpoint exists to do so, F-1). The toggle's own label is `fontSize:8` with a hover-only `title` explanation (F-5).
**Suspected cause:** design intent is a desktop console; Simple Mode was added for cognitive load, and happens to be the mobile answer too.

### F-4 · Micro-typography at sub-AA contrast, for a 55+ audience — **HIGH (accessibility, both form factors)**
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
