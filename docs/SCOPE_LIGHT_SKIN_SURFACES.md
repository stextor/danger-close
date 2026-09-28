# SCOPE — light skins readable: skin-aware surfaces, selected states, hovered rows (v5.82's KNOWN DEFECT)

**ACTIVE — decisions G-1 to G-4 (§6) open; build after they are answered.** Target **v5.83**, built from **v5.82** (source
`f6a54749bb14a291971395b0db20d11f`, built `index.html` `725bde1524d1ce00592aea9a621e1c03`, repo `f0ec889`). A presentation release:
no engine changes; parity pinned; METHODOLOGY unchanged. Follows `docs/SCOPE_TEXT_AND_TARGETS.md` (v5.82, FULFILLED), whose §9–§10
recorded this work as deferred.

Every figure below was measured on 2026-09-29 against v5.82's source (acorn AST walks) or a **prototype build** made in a scratch
folder (`289ac716…`, `smoke_built` 22/22, never in the repo) — real Chromium, example data, seeded, animations frozen, pointer parked.
Re-measure before quoting at build.

---

## 1 · Premise (measured, not assumed)

**v5.82 left the six light skins below WCAG AA** on text over tinted panels, pinned in `t48` as KNOWN DEFECT counts that may only
fall: Field Paper 288 · Reading Paper 716 · E-Ink Gray 269 · High Contrast Light 106 · Colorblind-Safe 144 · Report 198 (distinct
elements over 26 tabs at 1440; Reading Paper 665 at 390). Hovered table rows were never measured (`t48` parks the pointer).

**The cause is 366 `rgba()` literals** outside `SKINS` and the Field Manual — **65 distinct values, every one a dark-theme colour**:

| Family (RGB is the default skin's…) | Sites | Mostly |
|---|---|---|
| `--accent` (0,255,136) | 107 | backgrounds (98) |
| `--line` (26,58,42) | 85 | borders (83) |
| **black** (0,0,0) | 60 | "recessed" backgrounds (59) |
| `--warn` (255,170,0) | 40 | backgrounds, borders |
| v5.81's `--crit` (255,68,68) — v5.82 nudged the token to `#FF4E4E` | 30 | backgrounds, borders |
| `--info` (0,204,255) | 24 | backgrounds |
| v5.81's `--violet` (170,102,255) — now `#AD6BFF` | 11 | backgrounds |
| v5.81's `--ink-faint` (58,122,90) | 4 | borders |
| neutral grey (128,128,128) — the Skins tab's swatch rims | 2 | *left as is: neutral on every skin* |
| `--orange` 2, ≈`--plan` (255,220,0) 1 | 3 | |

**Prototype A — every family mapped to `color-mix(in srgb, var(--token) N%, transparent)` at its own opacity, black mapped to
`--bg`** (363 literal sites rewritten; the two grey rims kept):

| Skin | v5.82 pin | Prototype A | What remains |
|---|---|---|---|
| Report | 198 | **0** | — |
| E-Ink Gray | 269 | **17** | warn / info / plan / positive tokens on **plain** panels |
| Field Paper | 288 | **49** | 29 on `--ring` (below) + warn / positive / plan tokens on plain panels |
| High Contrast Light | 106 | **29** | all 29 on `--ring` |
| Colorblind-Safe | 144 | **30** | 29 on `--ring` + 1 accent |
| Reading Paper | 716 | **499** | its **accent (264) and warn (189) fail on plain panels** — tokens, as v5.82 found |
| Tactical Green, Low-Glare, Midnight | 0 | **0** | the mapping does not regress the dark skins (the other four: the build's `t48`) |

**The 29 on `--ring` are one thing:** selected-state text on the selected-state highlight — the ACTIVE TAB button (one per tab) and
the selected retirement card's date, "PLANNED" and success rate. In High Contrast Light the ring is a 35 % dark-green wash; green
text on it reads **3.22:1**. **Lowering the ring's opacity does not work**: for the retirement card's blue and violet date labels to
clear AA, the ring's opacity must go to **0** in five of six light skins — no highlight at all. The lever is the text, not the wash.

**Token nudges that finish the job** (candidates; each the smallest step toward the skin's `--ink` clearing 4.6:1 on every surface
measured — the rule v5.82 used; the build tunes the hex, `t48` pins the rule):

| Skin | Changes |
|---|---|
| paperSepia | warn `#96690A→#835D10` · accent `#8A6D3B→#796037` · positive `#5D7D4A→#556A41` · info `#3F6E8C→#3F6882` · plan `#7D6C1E→#73631F` · orange `#A8611F→#8F5721` |
| fieldPaper | warn `#96690A→#89630E` · positive `#2E8A5C→#2B7751` · plan `#8A7500→#776A08` · accent `#1D7A4F→#1D784E` |
| inkGray | warn `#8F6A1A→#7F6120` · positive `#4A7C62→#446E5C` · info `#2F6F8F→#2F6C8B` · plan `#7C6E28→#71662B` |
| cbSafe | accent `#0072B2→#0070AF` |
| highLight, report | none |

## 2 · The change

- **A · Surfaces.** Every `rgba()` literal of §1's token families becomes `color-mix(in srgb, var(--<token>) N%, transparent)` at
  its own opacity (G-1 decides black's target). The default skin is unchanged for accent, line, warn, info, orange; crit, violet and
  the four old-faint borders move to v5.82's nudged tokens (a ≤ 10-unit shift at ≤ 40 % opacity); black→`--bg` differs from black by
  ≤ 6 units per channel at ≤ 45 % opacity on the default. Same mechanism as v5.82's E-1; same browser floor.
- **B · Selected states on `--ring`** read in a new token **`--on-ring`**, defined **only in the six light skins** (as their `--ink`),
  with every selected-state rule falling back to today's colour where it is absent — so the default and dark skins do not change
  (G-2). Sites: `.tab.on`, `.rbtn.sel` and the selected retirement card's label, tag and success figure.
- **C · Hovered rows** (`.prow:hover`, `.erow:hover`, today `var(--ring)`) get a wash light enough that the row's own text keeps AA
  (G-3).
- **D · Token nudges** (§1's table), then whatever the rendered test finds — a token, never a site.
- **E · `t48`**: the KNOWN_DEFECT pins are **deleted** — every skin must be 0, light or dark; a new **hover leg** hovers a row of
  each hoverable table and measures its text; a new invariant: **no `rgba()` literal outside `SKINS` and `DOCS_HTML`** except the
  two named neutral swatch rims.
- **F · Disclosures**: Field Manual §13's sentence about the light skins; `UsabilityFlaws.md` F-4's status; the CHANGELOG.

## 3 · Site census (v5.82, AST)

366 `rgba()` literals (the prototype rewrote 363 literal nodes; a few strings carry two): 234 backgrounds, 122 borders, 2
box-shadows, 3 d3 `fill` attributes (SVG presentation attributes — `var()` already works there; `color-mix()` there is **unverified**: the build checks the chart
renders its guardrail band and area fills, and stops if not), and 5 in other positions (a d3 `.map()` value, three unkeyed
strings, one CSS rule in a template literal). **Build-time census
still owed:** `literal_census.cjs` for suite assertions on changed strings; every consumer of `--ring` (it is also the card
`::before` gradient and several selected backgrounds that carry `--ink` text since v5.82).

## 4 · Tests (written and run FIRST, against v5.82's page, where they must fail)

`t48` revised as §2 E. **Negative controls** extend `controls_v582_legibility.py`'s pattern as `controls_v583_*.py`: re-plant one
`rgba(0,255,136,…)`; drop `--on-ring` from one light skin; restore a hover to `var(--ring)`; revert one nudge; re-add a pin.
**Held:** parity 10/10; the full suite from the packaged copies; the layout signature at 1440 and 820 — **expected to be
box-for-box identical to v5.82** (colours only), so any moved box is a finding.

## 5 · Out of scope

The Field Manual's own styling (v5.82's D-4, still deferred); 44 px everywhere; WCAG 1.4.11 non-text contrast for borders and
focus rings (the mapping keeps borders skin-aware but asserts no ratio for them); the two neutral swatch rims.

## 6 · Open decisions for Steve

**G-1 · What black "recessed" panels become** (60 sites). (a) **`--bg` at the same opacity**: on dark skins indistinguishable
from today; on light skins the recess becomes a faint wash of the page colour instead of murky grey — measured above, it removes
every black-overlay failure; (b) a new per-skin `--shade` token — more control, 13 more values to choose. **Recommend (a).**

**G-2 · Text on a selected highlight in light skins.** (a) **A new `--on-ring` token, light skins only** — default and dark skins
unchanged, light skins' active tab and selected card read in ink; (b) ink in every skin — simpler, but the default's green active
tab turns grey-green. **Recommend (a).**

**G-3 · Hovered rows.** (a) **`color-mix(in srgb, var(--accent) 8%, transparent)`** — the same strength as the app's other row
tints, measured to pass by the new hover leg; (b) no hover wash at all. **Recommend (a)** — the hover is a real aid in wide tables.

**G-4 · The light skins' semantic colours get darker** (§1's table; Reading Paper most: six tokens). Each is the smallest step to
AA, but Reading Paper's gold-and-sepia look will be a little browner. (a) **Accept, with a before/after swatch page for review at
the build**; (b) review swatches before any build. **Recommend (a)** — the test fixes the rule, not the look, and you see it
before it ships.
