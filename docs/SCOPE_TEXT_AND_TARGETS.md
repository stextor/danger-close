# SCOPE — legible text and usable targets (F-3 / F-4: contrast, the type floor's leftovers, target size)

**FULFILLED — shipped in v5.82**, as F-1 (b) (§9, §10): the default and the seven dark skins pass; the six light skins' failures are pinned as KNOWN DEFECT counts for a v5.83 surface pass, which needs its own scope. D-1…D-4, E-1…E-4, F-1 all as recommended. Retained as the record. Target **v5.82**, built from **v5.81** (source
`cdca327526e3a259c5269aca02576753`, built `index.html` `c711610e81410ba20c7e61270e5454fe`, repo `8f26c95`). A presentation
release: no engine changes; parity pinned; METHODOLOGY unchanged. **Unlike v5.79–v5.81 this release changes how desktop
looks, by design** — the layout signature is a review of intended change, not a zero-change gate.

**Steve's design direction (2026-09-28), recorded as given:** (1) raise the type floor's leftovers to the 11 px label floor;
(2) fix `--ink-faint` in every skin that fails, not only the default; (3) 24 px minimum for every control, 44 px only for
phone-critical controls; (4) default UI SIZE stays 100 %; (5) accept the desktop change that follows from 1–3.

All figures below were produced by commands in the session of 2026-09-28 against v5.81's built page (real Chromium 141,
example data, `Math.random` seeded) or its source (acorn AST walks — no greps). Re-measure before quoting them at build.

---

## 1 · Premise — and a correction to the handover

**The handover's F-4 figures were 33 releases stale.** It quoted "8 px (341 sites) and 9 px (325 sites)". Those come from
the original body of F-4 in `UsabilityFlaws.md`; **v5.48 already raised exactly those** (852 declarations to a floor of
12 px body / 11 px labels — `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`) and considered and rejected raising the default UI SIZE.
On v5.81 the style-object sizes are 12 px (715) and 11 px (166). F-4's body text still states the pre-v5.48 numbers as
current; this release corrects it (§5).

**What is actually wrong on v5.81:**

| Problem | Measured |
|---|---|
| **`--ink-faint` below AA** | fails 4.5:1 on at least one base surface (bg / panel / panel2) in **9 of 13 skins**, incl. three light themes the audit calls a mitigation: Field Paper 3.20–3.78, Reading Paper 3.10–3.63, Report 3.10–3.61. Default: 3.83 / 3.58 / 3.43 (the audit said 3.88 / 3.61 for the same hex; not resolved — don't lean on the second decimal) |
| Rendered HTML text below AA (default skin, desktop) | **731 of 3,183** distinct text elements; **614 are `--ink-faint`**, 110 `--ink-dim` — all 110 on tinted highlight rows (accent at 4–17 % alpha over a panel) |
| **Trajectory chart axis labels** | painted `fill: var(--line2)` — a border colour — at 9 px: **1.4–3.2:1 in all 13 skins** (2.03 default, 1.78 Report) |
| **Hard-coded dark-theme text colours** | the three retirement-date colours (`#00ccff #00ff88 #aa66ff`, `buildRetireOptions` L808) render the "RETIRE" chart marker at **1.34:1** and the percentile labels at **1.30:1** on the Report skin; plus **36 more** literal text colours (§3) |
| Text under 11 px | the 26-tab grid (10 px); 9 d3 chart labels at 7–10 px; data rows in Expenses / Guardrails / Positions and two Ask AI buttons (10 px) |
| Controls under 24 px (WCAG 2.2 AA 2.5.8) | **15** distinct on desktop: 11 buttons, 3 sliders, 1 checkbox (§3); 13 on a phone |
| Phone-critical controls under 44 px | "Enter the tool" 43, tab menu 43, Plan summary toggle 41, "◑ Fewer" 36, "Use example data" 35 (390×844) |
| Field Manual (iframe) | 1,207 text elements; 122 under 11 px; 66 under AA — see D-4 |

**Desktop cost of the tab grid at 11 px** (simulated by injected CSS, no source change): grid height 64 → 68 px at 1440,
91 → 97 at 1024 and 820; **row count unchanged** at every width.

## 2 · The change

- **A · Tokens.** Move `--ink-faint` toward the skin's own `--ink` until it is ≥ 4.5:1 on bg, panel and panel2 (target 4.6
  for margin), in the 9 failing skins. Where that brings faint too close to `--ink-dim`, lift dim the same way until dim is
  ≥ 1.20× faint on every surface (D-1). Candidate values (the build tunes the hex; **the test pins the rule, not the hex**):

  | Skin | `--ink-faint` | `--ink-dim` |
  |---|---|---|
  | default | #3A7A5A → #578E73 | #6A8A7A → #799888 |
  | dark | #7A8694 → #8F99A5 | kept |
  | warmExec | #897F6C → #9D9482 | kept |
  | lowGlare | #6E7681 → #899099 | #8A9098 → #999FA6 |
  | fieldPaper | #78877D → #5D6D63 | #54685C → #4E6256 |
  | paperSepia | #8B7E67 → #6E634F | #6B5F4C → #625745 |
  | inkGray | #6F7986 → #5D6773 | #5A6572 → #505B68 |
  | report | #888780 → #6B6B65 | kept |
  | quietDark | #75756F → #8C8C86 | kept |
  | highLight, highDark, midnight, cbSafe | kept | kept |

- **B · The Trajectory chart.** Every d3 label to ≥ 11 px; axis ticks and the empty-state line from `--line2` to
  `--ink-dim`; percentile labels lose `opacity: 0.7`.
- **C · Hard-coded text colours become skin tokens** (D-3). The three retirement-date colours are **exactly** the default
  skin's `--info`, `--accent`, `--violet`, so mapping them changes nothing on the default skin. Same for `#ffaa00` →
  `--warn` and `#ff4444` → `--crit`. The one-offs (`#ff8888 #9ec4b0 #ddb84a #8a9a8f #ffcc00`) are mapped case by case and
  listed in the build record, because they do change slightly on the default skin. Mapped, `--info/--accent/--violet`
  reach ≥ 3.77:1 in every skin; the failures that remain are on `panel2` and Reading Paper's accent (3.77–4.43). Where the
  rendered test finds one, **that skin's token is nudged** — not the site.
- **D · Class rules at 10 px → 11 px:** `.tab`, `.erow`, `.grow`, `.prow`, `.ai-btn` (global style block, L6550).
  `.erow/.grow/.prow` sit in fixed-width grids — if a cell clips, widen the grid as v5.48 did, don't shrink the text.
- **E · Targets.** The 15 controls reach 24 × 24 px; the checkbox and sliders by enlarging the hit area (padding / label),
  not the drawn control. The five phone-critical controls reach 44 px tall below 600 px only (D-2).
- **F · Disclosures** (§5).

## 3 · Site census (v5.81, AST)

| Site | What |
|---|---|
| `SKINS` L4146–4201 | 13 skins; A edits 9 `inkFaint` and 5 `inkDim` values |
| d3 in `DangerCloseMain` L6213–6329 | 10 `font-size` calls: 13, 10, 8, 8, 10, 9, 9, 7, 9, 9 (L6213 L6216 L6246 L6248 L6257 L6265 L6273 L6307 L6324 L6329); `--line2` fills at L6216, L6324, L6329; `opacity 0.7` at L6307. The app's only SVG. |
| `buildRetireOptions` L808–846 | the colour array; reads of `.color` at L6256 L6258 L6303 L6314 L6321 (chart), L6635–6638 (retirement cards), L7162, L7188, L9239, L9254, L9266 |
| literal text colours | `#00ccff` ×10, `#00ff88` ×7, `#ffaa00` ×7, `#ff4444` ×3, `#ff8888` ×3, `#9ec4b0` ×3, `#ddb84a`, `#8a9a8f`, `#ffcc00` — in `PROB_PRESETS` (L779–787), the grade scorers (L8438–8540), My Data's missing-field warning (L11892–12110), the AI panel (L12012, L13425, L13494) and the footer (L12179) |
| global style block L6550 | the five 10 px class rules |
| 15 controls < 24 px | "◑ Show fewer tabs" 143×23; two × buttons 20×17 and 30×17 and a table checkbox 13×13 (My Data); "+ Add income stream" and the two "+ Spouse … works after retirement" 20 px tall; Dashboard's three "→" buttons 23; Roth's two law buttons 22; sliders 16 px tall (SS ×1, Monte Carlo ×2) |
| disclosures | `DOCS_HTML` L4137 §13 paragraph; skins copy L4078 |

**Build-time census still owed (STOP conditions):** every read of a colour changed by C must be a CSS context. If any
reaches a canvas, an export, a spreadsheet or anything where `var(--…)` does not resolve, **stop and report** — the
mapping is then not a presentation change. Also run the suite-literal census (`literal_census.cjs`, OPERATIONS §B1a) for
any assertion on a changed hex, size or disclosure sentence.

## 4 · Tests — `t48_legibility_targets.py` (Chromium, built page, like `t45`/`t47`); written and run FIRST

- **T · tokens, every skin (13).** Switch skin through the Skins tab (the stored value goes through `window.storage`, not
  `localStorage` — a direct write silently did nothing in the scoping session). Assert the switch landed (`--bg` changed),
  then read the live tokens: `--ink-faint` and `--ink-dim` ≥ 4.5:1 on bg / panel / panel2; dim ≥ 1.20× faint.
- **R · rendered text.** Every tab, all 13 skins at 1440; default and Reading Paper at 390. Every visible text element —
  SVG text by its **fill** and effective opacity, HTML by `color`, over the composited background — is ≥ 11 px and
  ≥ 4.5:1 (≥ 3:1 where WCAG "large"). Disabled controls exempt. Any other exemption is a named allowlist entry with a
  reason, and the allowlist's length is pinned.
- **C · targets.** Every visible control ≥ 24 × 24 px at 1440, 820 and 390; the five phone-critical controls ≥ 44 px tall
  at 390; the tab grid keeps its row count at 1440, 1024 and 820.
- **G · no clipping.** No cell in `.erow`, `.grow`, `.prow` or the five fixed grids has `scrollWidth > clientWidth`.
- **X · extinction invariants (source, AST).** No d3 `font-size` below 11; no SVG text fill from a `--line*` token; no class
  rule under 11 px outside `DOCS_HTML`; no style-object `fontSize` under 11; **no literal hex/rgb text colour outside
  `SKINS`** (the class C removes).
- **Negative controls:** restore one skin's old faint; set one chart label to 9; put an axis back on `--line2`; restore
  `.tab` at 10 px; shrink one × button; drop the dim lift (separation fails); re-plant one `#00ff88` text colour; make
  the skin switch a no-op (T must go red, not pass by measuring the default skin 13 times).
- **Order:** `t48` is run against v5.81's page before any code change, and must fail on T, R, C and X — it discriminates.
- **Also held:** parity 10/10; `t45`/`t47` green (the phone controls grow a few px; `t47` pins content above y = 450 with
  the user's own data — re-measure); `domdiff` (text only) unaffected except disclosure copy; the layout signature at
  1440 and 820 is run and **every moved box is listed** in the build record for review.

## 5 · Folded in

- **Field Manual §13** stops saying the smallest text is below AA, and stops saying the tab strip "wraps heavily and fills
  the first screen" — v5.81 fixed that and left the sentence (a finding in its own right). It says what remains:
  44 px is not met everywhere, and (if D-4 is "defer") the manual's own small text.
- **L4078** says the Skins tab "has seven themes"; there are 13.
- **`UsabilityFlaws.md`:** F-4's body still quotes the pre-v5.48 counts — mark it superseded, with v5.82's measurements.

## 6 · Open decisions for Steve

**D-1 · How distinct "faint" stays from "dim."** Lifting faint to AA narrows the gap to dim. (a) **Dim ≥ 1.20× faint** —
two levels stay visibly different, and five skins' dim gets slightly brighter (table above); (b) no separation rule —
fewer changes, but in the default skin faint and dim become nearly the same shade. **Recommend (a).**

**D-2 · Which controls are "phone-critical" (44 px).** (a) **The five on the first screen:** "Enter the tool", the tab
menu, the Plan summary toggle, "◑ Fewer", "Use example data"; (b) those plus My Data's Save & Apply and the retirement
cards. **Recommend (a):** they are how a phone user gets in and moves around; (b) can follow once (a) is seen on a phone.

**D-3 · The hard-coded colours.** The rendered test will flag all of them on light skins, so the choice is fix or
allowlist. (a) **Map every literal text colour to a skin token in this release** (~48 sites, mechanical, default skin
unchanged except the five one-offs); (b) fix only the retirement-date colours and allowlist the rest. **Recommend (a):**
the footer's `#ffcc00` on a white skin and the grade colours are the same defect, and an allowlist of 36 is a debt.

**D-4 · The Field Manual.** Its styling lives inside the one-line `DOCS_HTML` blob — a separate edit-risk class. (a)
**Defer its own CSS to a follow-up release; fix its §13 disclosure now** and say what remains; (b) include it. The build
will first measure whether A's token change reaches the iframe at all. **Recommend (a):** it keeps v5.82 reviewable.

## 7 · Out of scope

Default UI SIZE (stays 100 %, decision 4 and v5.48); 44 px everywhere; WCAG 2.5.8's spacing and user-agent exceptions (not
relied on — real size is simpler to test); compacting the phone header; C-13; the manifest's old ship notes.

## 8 · Scoping-session errors, recorded

Five measurement mistakes, each caught by a later command, none in the figures above: the first contrast probe read CSS
`color` for SVG text (SVG paints with `fill`), understating the chart's failures; the first grid-vs-menu tab-order check
ran before tabs existed and compared two empty lists; a `localStorage` skin switch silently did nothing, so two runs
labelled as other skins measured the default; a text click meant for the Reading Paper skin hit a description paragraph;
and the chat reply that preceded this scope said the tab grid "may need an extra row" — measured, it does not.

## 9 · Revision — build halted, 2026-09-28

**Decisions (Steve, 2026-09-28), all as recommended:** D-1 (a) dim ≥ 1.20× faint · D-2 (a) the five first-screen controls · D-3 (a)
every literal text colour to a token · D-4 (a) defer the Field Manual's own CSS · **E-1** hex alpha glued onto a colour
(`${c}33`) becomes `color-mix()` · **E-2** the whole class of hard-coded colours, not only the 36 of §3 · **E-3** the title is a
logotype (WCAG-exempt); the four pulsing status labels pulse 85–100 % · **E-4** one release.

**Premise corrections found at build (each by a command; none by review):**

- §3's colour census saw only `color:` properties: **62** hex literals, not 36 (also `rowColor`, `tierColors`, `_ckColor`,
  `overallColor`, a bare array, an `accentColor`). All 62 reach CSS contexts only (no export, canvas or print window).
- **8** template sites glue a hex alpha onto a colour; **three already received tokens on v5.81** (the income-phase cards,
  L7624/L7636) — so their borders and tints have been invalid CSS, silently dropped, in the shipped app.
- The `breathe` animation fades five text elements to 60 %; a contrast reading depended on when it was taken.
- **The surfaces text sits on were never in the census.** **366** `rgba()` literals outside `SKINS`/`DOCS_HTML` — 234
  backgrounds, 122 borders, **65 distinct values**, nearly all tuned for dark themes (`rgba(26,58,42,0.3)` ×82,
  `rgba(0,255,136,0.03)` ×40, `rgba(0,0,0,0.3)` ×29 …). On light skins they sink text that passes on a plain panel.

**What was built (not shipped; re-derivable from v5.81 by the handover's `rebuild_wip.sh`, source `1817828a…`, template
`543af5a9…`, built page `4e1d9da3…`, `smoke_built` 22/22):** A (tokens, 9 faint + 6 dim — Quiet Dark's dim needed a
one-step nudge for margin), B (chart; axis colour applied to TEXT only — d3 styles text, tick lines and the domain path
together, and a fill on the path draws a band), C (62 literals, 8 `color-mix` sites; the top two IRMAA tiers now share
`--crit`, labels differ), D, E (global 24 px minimums, `.dc-hit` labels, `.dc-tap44`), E-3, F, the version bump. v5.81
rebuilt byte-identically (`c711610e…`) first, so the scaffold is complete.

**`t48` on that build: 65 passed, 19 failed** (v5.81: 42 / 40). Every X (source) and T (token) check passes; tab-grid rows
unchanged; no clipped cells. Red: **R-1** in 12 skins (default 44 unique elements, down from 837; High Contrast Dark 1;
Reading Paper 718), **C-1** two checkbox labels 19 px tall (Trajectory, Command), **P-2** "Use example data" 35 px — its
`.dc-tap44` rule lives in the main app's style block, which is not rendered on the data-load screen.

**What the remaining R-1 failures are** (classified in three skins): default — `--ink-faint` on tinted rows (36 of 44);
Reading Paper — accent and warn fail even on plain panels (292), the rest on tints; High Contrast Light — all on tints.

**F-1 · How to finish.** (a) **Add a surface pass to v5.82**: map the 366 `rgba()` literals to token-derived `color-mix()`
values so each skin's tints come from its own palette, then nudge Reading Paper's accent/warn — needs a mapping table for
review, changes how every light skin looks, default nearly identical; (b) **split**: v5.82 ships A–F with the default and
dark skins fully passing (faint margin for tinted rows, P-2, the two labels) and each remaining skin's failure count pinned
as a KNOWN DEFECT that may only fall (OPERATIONS §D), the §13 text rewritten to say so; v5.83 is the surface pass under its
own scope; (c) narrow the promise to the dark and high-contrast skins and disclose the light themes as non-AA.
**Recommend (b)**: it ships measured gains now (default 837 → 0 targeted) under an honest pin, and the surface pass is a
different risk class — how light themes look — that deserves its own review. **If (b): §13's new sentence ("meets … AA in
every skin") is false and must change before ship.**

## 10 · Build record, F-1 (b) — 2026-09-28/29

**Decision (Steve):** F-1 (b). **Stage 2** (on stage 1 of §9; both re-derivable from v5.81 by the handover's `rebuild_wip.sh`):

- **Dark-skin token nudges**, each the smallest step (toward the skin's `--ink` for faint/dim, toward white for semantic colours)
  that clears 4.6:1 on every surface text was MEASURED on — base surfaces and the tinted rows: default faint/dim/crit/violet;
  Soft Dark faint/dim/crit/violet; Warm Executive faint/dim/crit; Low-Glare faint/dim/crit/violet/info/accent (its `--crit` failed
  even on plain panels); Quiet Dark faint/dim. Values in the CHANGELOG.
- **Selected-state text on `--ring` reads in `--ink`** (Roth law toggle, UI size, skin cards, the selected retirement card's
  description and median). The alternative — nudging whole palettes for one state — would have paled Soft Dark's info to
  `#91DBFB`. Border, tint and ✓ still mark the selection.
- **The 44 px rule lives in `src/index.html`**: the data-load screen renders before the app's style block exists.
- **`label:has(> input[type=checkbox]) { min-height: 24px; }`** — a checkbox's target is its label.
- **§13 rewritten** for the split. **`t48`**: text under 11 px is never pinned; a dark skin (bg luminance < 0.18, derived) must be
  0; each light skin at or under its pin; the pointer is parked before measuring (below).

**Found at build:** `.prow:hover` / `.erow:hover` tint a row with `--ring`, and on a touch screen hover STICKS where the last tap
landed — two phone rows read 3.22:1 only because of an earlier tap. The test now parks the pointer; **hovered rows below AA are a
disclosed limitation** for v5.83. **Negative controls:** `controls_v582_legibility.py`. **A no-op skin switch was NOT built** as a
control (no stable target in the minified page); `R-0` is exercised positively 13 times per run.
