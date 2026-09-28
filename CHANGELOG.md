# Changelog

## v5.81 — a phone's first screen shows the plan

Source `cdca327526e3a259c5269aca02576753` · built `index.html` `c711610e81410ba20c7e61270e5454fe` · built from v5.80 `7a04dadb86bdef6534bdc03a1d87e8d8`. A **presentation release**: no engine
changed (MC parity 10/10), so no figure moves; METHODOLOGY is unchanged. The first release built with the prior source resolved
from the repo's history by md5 (the single-source pool of 2026-09-28).

**Suite: 4,628 app checks, 0 failed, 0 DIED** — 46 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,758), run from the packaged copies. **In that run `domdiff` failed one check** on this release's own
stylesheet and phone-only elements (below); corrected and re-run from the same packaged folder: **32 passed, 0 failed**. **`t47` is new (30 checks, real Chromium, the built page).**
`t45` **88 passed, 0 failed** (now moving between tabs through the phone menu). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v581_first_screen.py` **7 of 7**; `controls_runfolder_prior.sh`
**6 of 6**.

### What changed, and why

- **On a phone, the selected tab now starts on the first screen (F-12).** Measured on the built page at 390 × 844: v5.80's
  content began at y = 1005 — below the screen — behind the header, the retirement cards, the allocation strip and a 26-tab grid.
  Below 600 px wide the grid is now **one native tab menu** (with the Simple Mode toggle beside it), and the retirement cards and
  allocation strip fold into **one line that keeps the chosen date and its success rate** ("PLAN: RETIRE JAN 1, 2029 · 99.8% ▸"),
  collapsed on every visit; one tap opens it. Content now begins at **y = 613** in example mode (≈ 437 with your own data).
- **Desktop and tablet do not change**, verified element by element against v5.80 on every tab: the phone-only pieces have no
  box at 600 px and up; the one added element is the summary's invisible wrapper.
- **One tab list, one way to change tab.** The grid's tab list and labels were written inline; the menu reads the same shared
  list, and both go through the one function that guards unsaved My Data edits — so the menu cannot become a way to lose them
  (tested by editing My Data and leaving through the menu).
- **The app's first breakpoint outside the Field Manual** — the audit's F-1 ("no breakpoints"), partly addressed.

### Limitations, stated plainly

- **The header itself is unchanged** (216 px on a phone); compacting it was option C, not chosen. The example-data banner stays.
- **Text size and touch targets (F-3/F-4) are unchanged.**

### Found while building, and worth recording

- **The code was written before `t47`,** against the test-first order every recent scope spelled out. `t47` was then run against
  v5.80's page, where its claims fail, so it discriminates; the order was still wrong.
- **`t47`'s first structure check reported a second copy of correct code:** it counted a prefix of the tab list, and the Simple
  Mode list starts with the same three tabs. It now compares the complete list.
- **The new CSS landed between an existing rule and its comment.** The AST literal census caught it; the repair was proven to move
  only the comment.
- **`t45` (v5.79) clicked the tab grid on a phone** — which v5.81 hides — and timed out. It now moves between tabs through the
  phone menu there, as a phone user does.
- **`mk_runfolder.sh`'s third argument was typed as an output folder twice in a day** and refused as "prior source not found". A
  third argument that does not end in `.jsx` is now the output folder.
- **`domdiff` compared everything in the page, not what is rendered.** Its Withdrawal check read `body.textContent`, which
  includes the stylesheet's text and v5.81's phone-only elements (no box at desktop width) — so any CSS addition failed it with no
  cell moving (v5.79 had worked around this for one version pair). It now excludes `<style>` text and `.dc-phone-only` elements for
  every pair, and stays byte-strict on everything else.
- **Decision recorded, 2026-09-28 (Steve):** the 24 release-pinned `controls_v5*` scripts **stay out of the knowledge pool**, their
  copies kept in the repo. This closes the "whether they stay out of the pool is Steve's call" in the ops entry of 2026-09-28
  (second); it is also why `controls_v581_first_screen.py` ships to the repo only.

## ops 2026-09-28 (third) — control P22 went vacuous when the pool became single-source; fixed

No app change (v5.80 stays current). After the single-source package was uploaded, `package_check_controls.sh` reported **P22
NOT CAUGHT**. P22 builds "a different release" by copying a source over the clone's, and picked it with
`ls /mnt/project/DangerClose-v5_*.jsx | head -1` — the prior while the pool held two sources, the CURRENT once it held one, so
it copied v5.80 over v5.80 and planted nothing. The control framework reported it rather than passing it. **The single-source
scope's census missed it**: it covered `package_check` and `mk_runfolder.sh`, not controls that glob the pool's sources (a
full census now finds P22 the only such site). P22 now resolves the prior release from the clone's history by the manifest's
Prior md5, as `mk_runfolder.sh` does, and reports itself INVALID if that equals the current source. After the fix, post-upload:
**62 behaved as designed, 0 did not, 1 skipped**, P22 caught by H-3.

## ops 2026-09-28 (second) — the pool keeps ONE source; the prior comes from the repo's history by md5

No app change (v5.80 stays current). The pool held two full copies of the app source — current and prior, 1.3 MB each, about
half of it — because `mk_runfolder.sh` took the prior as a file path. It now resolves the prior from the clone's git history by
the md5 the manifest records for that version (from whichever build table names it, so it works mid-build and after the roll),
and refuses a shallow clone, an unrecorded version, and an md5 no commit holds. A file may still be passed, but it is accepted
only if its md5 matches (decision D-1). `DangerClose-v5_79.jsx` and `dom_entry_v579.jsx` leave the pool (**~1.3 MB**; pool
111 → 110 with the one new control script).

- **`package_check`:** J-3 and J-4 now assert **one** source and **one** dom entry; K-4/K-5 check only the Current table
  against the pool; **K-6** asserts the pool's one source is the Current table's; new **K-5b** asserts the Prior table's md5 is
  held by a commit in the clone. None of these had a negative control before; **P68–P71** now plant each defect after first
  building the post-upload pool state, so none is "caught" by a baseline that is already red.
- **`qa/tools/controls_runfolder_prior.sh`** (new, general-purpose, pooled): git mode resolves the prior byte-exact; a correct
  file is accepted; a wrong file, an unrecorded version and a shallow clone are refused, each by exit code and message.

**A miss in the previous ops package, found while building this one.** OPERATIONS' "What does NOT rotate" (2026-09-03) said the
pool "keeps every `controls_v*.sh`" because a control script is evidence. The package that un-pooled all 24 did not see that
section, so the document contradicted itself for a day, and the un-pooling was approved without that rule being on the table.
Nothing was lost — the repo keeps all 24, which is what makes them evidence — and the section now says so. Whether they stay
out of the pool is Steve's call; re-pooling them costs ~150 KB.

## ops 2026-09-28 — the knowledge pool ran out of room: two moves free ~430 KB, nothing deleted

No app change (v5.80 stays current: source `7a04dadb86bdef6534bdc03a1d87e8d8`). Two moves, both to the repo, neither losing
anything:

- **The CHANGELOG split again.** v5.60–v5.74, with the ops entries between them, moved **verbatim** to
  `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` (repo only). This file now holds v5.75 onward and points to both archives
  (315 KB → 33 KB). The move was checked byte for byte: the archive's body equals the removed block, and the pieces
  reassemble into the original.
- **The 24 release-pinned control scripts (`controls_v557` … `controls_v580`) left the pool.** Each runs only inside its own
  release's run folder, so no later session can use a pooled copy. They stay in the repo; their manifest rows read
  *un-pooled, repo-only*. Three had been pooled with no manifest row at all and gained one. OPERATIONS §G now says new ones
  ship to `github/` only (~150 KB).

Checked before moving, per OPERATIONS §G: none of the 24 scripts carries an open decision; the CHANGELOG records only what
shipped. The manifest's superseded ship notes and old delete-first lists (~130 KB) were **not** archived — they mention 30
open items that must each be traced to a live register first. A larger saving is scoped next: the pool keeps two full copies
of the source (1.3 MB each); the prior one could come from the repo's history by its recorded md5.

## v5.80 — Bull-leaning is the default scenario, and your choice is remembered

Source `7a04dadb86bdef6534bdc03a1d87e8d8` · built `index.html` `a7394fad7c58dfccc2ddce86ac6dd0c9` · built from v5.79 `b06841a0c23f6451ca60c66755355567`. **No engine changed**
(MC parity 10/10); what changed is the scenario every run assumes unless the user chooses otherwise, so `METHODOLOGY.md`'s
description of the default prior is rewritten. `src/index.html` and `src/main.jsx` are unchanged.

**Suite: 4,592 app checks, 0 failed, 0 DIED** — 45 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,722), run from the packaged copies. `t46` is new on both legs (11 on v5.79, 16 on v5.80).
`t45` (real Chromium) **88 passed, 0 failed**. `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v580_scenario.py` **6 of 6**.

### What changed, and why

- **A first visit now starts on BULL-LEANING instead of BASE.** Measured against the app's own 1928–2025 returns: BASE
  expects 3.1% nominal / **0.4% real** equity return; BULL-LEANING 5.2% / **2.6% real**, and keeps history's frequency of bad
  years (10% of simulated years below −10%, against 12% in the record). It still sits about 5 points below history's average,
  so the default stays on the conservative side. (HISTORICAL matches the average only by making bad years about four times
  rarer than they were — the risk this app exists to test.)
- **Every user's numbers change on their next visit**, because nobody had a saved choice before. On the example household the
  displayed success rate moves from 99.6% to 99.8% (it is well funded); its median balance 25 years out from $1.96M to $2.11M.
  Households nearer the edge will move more. Choosing BASE on the Monte Carlo tab brings the old model back — and now stays.
- **The chosen preset is remembered** in the browser, exactly as the Social Security and ACA scenario settings already are:
  restored on the next visit, cleared by "delete everything", and not written into backup files (neither are those two). An
  unrecognised stored value falls back to the default rather than breaking the app.
- **The "not the default" warning names the default** (it used to say "non-base scenario"), and the Field Manual's glossary
  gives Bull-leaning's crisis / recession / stagflation frequencies (2% / 8% / 5% a year) with Base's alongside.

### Limitations, stated plainly

- **The "10–20 points lower than raw-history tools" figure** in METHODOLOGY was measured under BASE and is kept as that; the
  gap under Bull-leaning is smaller and has not been re-measured across households.
- **The preset is per browser.** A user on two devices chooses on each; a restored backup does not carry it.

### Found while building, and worth recording

- **A test that could not fail.** `t46`'s first draft checked that a saved BASE came back on the next visit — but BASE was the
  old default, so the check passed on the old code with no restore at all. It now restores HISTORICAL, which neither version
  defaults to.
- **`domdiff` compared different inputs, not different engines.** It rendered each version at its own default, so the new
  default made three identity checks fail. It now pins BASE for both legs through the key v5.80 restores; every check stays
  byte-strict, and the run doubles as a second proof that the restore works.
- **The version-registration sweep does not see Python files**, so `t45` (the first Python suite) was registered by hand.

## v5.79 — the app fits a phone

Source `b06841a0c23f6451ca60c66755355567` · built `index.html` `137a992f43e5a7d013d67e7ee959c31e` · built from v5.78 `536597644ae036a66f9a441e6311ad5c`. A **presentation release**:
no engine changed (MC parity 10/10, every engine suite unchanged), so no figure anywhere moves. `src/index.html` and
`src/main.jsx` are unchanged; `METHODOLOGY.md` is unchanged (no modeling change, decision D-4).

**Suite: 4,564 app checks, 0 failed, 0 DIED** — 44 app suites plus MC parity 10/10; tooling `t21` 64, `domdiff` 32,
`sets` 12 + 12 (GRAND 4,694), run from the packaged copies. **In that run `domdiff` failed one check on this release's own CSS** (below);
it was corrected — for this pair only — and re-run from the same packaged folder: **32 passed, 0 failed**. The totals count it at 32. **`t45` is new: 88 checks in real Chromium against the
built page.** `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v579_layout.py` **7 of 7**. Per-suite: `TESTING.md`.

### What changed, and why

- **No tab scrolls sideways on a phone any more (F-11, the audit's highest-ranked open item).** At 390 px every one of the
  26 tabs was 566–680 px wide on v5.78, so every screen scrolled sideways; now all 26 fit. Desktop and tablet are
  **unchanged, element by element**: every element of every tab's default view sits in exactly the same place and size as
  in v5.78, at 1440 and 820 px (measured with the Monte Carlo seeded, and repeat-run to prove the measurement is exact).
- **The audit's diagnosis was only part of it.** It traced the overflow to one control — the retirement selector's grid —
  and proposed a one-line fix. Measured in the browser first, that fix left all 26 tabs overflowing. The shell had three
  causes (the selector grid, the text inside each retirement card, and the allocation strip), and eleven tabs had wide
  tables or card rows of their own.
- **How:** every equal-width grid column may now narrow on a small screen (`minmax(0, 1fr)`, identical to the old `1fr`
  whenever content fits); each wide table or card row sits in its own sideways-scrolling box, so the table scrolls and the
  page does not (decision D-1); drop-down menus are capped at the screen's width; a few rows may wrap or narrow on a phone.
- **The Field Manual's "designed for a desktop browser" note** no longer says wide tables make the page scroll; it says
  the page fits and a wide table scrolls within its own box, and that the tab strip still fills the first screen.

### Limitations, stated plainly

- **The first screen on a phone is still all header and tabs (F-12)** — the selected tab's content starts near the bottom
  edge. That is a design choice about what to hide, and is its own release (decision D-3).
- **Text size and touch targets (F-3/F-4) are unchanged.**
- **Scrolling tables are a compromise on a phone:** readable, but sideways within their box. Reflowing tables into stacked
  cards is the better phone experience and is a possible follow-up, table by table.
- **What `t45` cannot see.** It measures page width. Each scroll box gives its table a 600 px floor (320 / 480 px for two
  of Grade's) so cells stay legible inside it; the page fits with or without that floor, so no page-width test guards it.
- **Desktop and tablet were verified on each tab's default view** with the example household; expanded panels and other
  data were not measured element by element.

### Found while building, and worth recording

- **The first wrapper rule changed desktop.** It let each table be as wide as its unwrapped content, which forbade cell
  text to wrap at *every* width: six desktop and tablet views came out up to 98 px shorter. The element-by-element check
  caught it before anything shipped; it was replaced by a fixed floor that cannot engage where the table already has room.
- **The last 2 px were text, not an element.** "~$16K/yr" was a hair wider than its card; no box-based probe could see it,
  because text has no element box of its own. A probe that measures the text itself found it.
- **Rolling out a Python suite needed the run-folder builder.** `mk_runfolder.sh` copied only `.mjs` and `.sh` suites, so
  `t45` would have been left out of every run folder and run nowhere; it now copies `qa/t*.py` and the tree's built page.
- **`t45` first failed on a correct page under load.** "Use example data" starts the Monte Carlo on the page's main thread; with
  the full suite running alongside it passed Playwright's 30 s click limit. The page was fine (the button was on screen and
  on top, measured); `t45` now allows 120 s, stated in the code, so it fails on layout and never on load.
- **`domdiff` compared the Withdrawal tab's full text — which includes the shell's CSS.** This release added CSS, so the
  check failed on a change made on purpose. For the v5.78→v5.79 pair only, exactly the two inserted passages are removed
  (each must occur exactly once) and nothing else; later pairs compare byte for byte again.
- **The shell is defended twice.** Reverting the selector's grid alone, or the allocation strip's, now breaks nothing: the
  fixes inside them (cards that may shrink, rows that wrap) cover them too. Controls M2 and M3 revert both layers, and then
  every tab breaks — defence in depth, not a blind spot.
- **One `t1` assertion counted 9-column grids by their spelling**; the same two grids are now spelled
  `repeat(9, minmax(0, 1fr))`. Gated per leg, same protection.

## v5.78 — the IRMAA top tier starts at its threshold

Source `536597644ae036a66f9a441e6311ad5c` · built `index.html` `a11c46dca503a433eaaf6665427769f9` · built from v5.77 `9cdd345d488443a8ca146e8cbb7da332`. `src/index.html` and
`src/main.jsx` are unchanged. **The example household does not move**: all seven Roth strategies' lifetime tax, widow-years
tax and lifetime IRMAA are identical to v5.77 (measured), MC parity is 10/10, and its IRMAA-tab MAGI never comes within half
of the joint top threshold. `METHODOLOGY.md` gains the top-tier rule; `docs/FlawsToFix-v5_73-Phase2.md` marks C-1 fixed and
records **C-13**.

**Suite: 4,469 app checks, 0 failed, 0 DIED, across both legs** — 43 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,599), run from the packaged copies. `t44` is new on both legs (29 on v5.77,
36 on v5.78). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v578_irmaa.py` **7 of 7**; `package_check_controls.sh`
in the pre-upload phase (pool given) **56 behaved as designed**, including **P66/P67**; its one miss is `P48`, which by
design fires only after the upload (OPERATIONS §I — run it again then), and `P15` and `P58`–`P61` skip (no ops or handover package). Per-suite: `TESTING.md`.

### What changed, and why

- **A MAGI of exactly the IRMAA top threshold now pays the top surcharge (C-1).** 42 U.S.C. §1395r(i)(3)(C) makes tiers 1–4
  "not more than" their upper amount but the top tier "at least" $500,000 ($750,000 joint) — re-read at the source for this
  release. Every engine used "not more than" for the top tier too, so a household exactly on that line was billed one tier
  low: **$580 per person per year optimistic** (single, premium year 2028: $6,360 where the law gives $6,940). It reaches
  only a household sitting exactly on the threshold, which is what an IRMAA-aware plan aims at.
- **Tier selection is one shared rule.** Two loops in the Roth comparator and one in the IRMAA tab's engine each chose the
  tier; all three now call one helper beside the one that computes the thresholds (v5.14), the way v5.77 made §86 one rule.
- **The IRMAA tab's headroom from tier 4 is one dollar less** (decision D-1): tiers 1–4 are "not more than", so adding the
  full gap stays in the tier; from tier 4 the next tier starts *at* its threshold, so the most a household can add and stay is
  one dollar less. The tier table's top row reads **≥ $750K** (≥ $500K single), not "> $750K".
- **Audit housekeeping.** The audit's at-a-glance table showed C-8, C-3 and C-6 as open long after v5.74 and v5.75 fixed them;
  they are annotated. `MissingFeatures.md` and `ARCHITECTUREIssues.md` opened with a "build under audit: v5.29" table whose
  current blocks were the v5.73 ones further down — which misled the v5.77 handover, and a recommendation made from it, into
  proposing a Phase 3 that had already run; each now names its current pin first. The top-five summary notes what is fixed.
- **Two new `package_check` checks, K-10 and K-11**, fail an app release whose `TESTING.md` "Current build" line, or whose
  manifest's newest ship note, names another version. The first went stale four times, the second was skipped by two
  consecutive releases; both were only ever caught by eye. Each has a control (P66, P67).

### Limitations, stated plainly

- **Projected IRMAA thresholds are not rounded to $1,000** as the statute rounds CMS's figures (2028, single tier 1:
  $113,403.60). Recorded as **C-13** and deliberately not fixed here (D-2): rounding would move every projected edge by up
  to $500 and reach far more households than C-1, so it gets its own measurement, alongside the brackets' $50 rounding.
- **Engine A's second tier loop sits inside the taxable-sale funding solver** and cannot practically be placed on a threshold;
  `t44` covers it through the helper sweep and a parser check that it calls the helper, not by a numerical case.

### Found while building, and worth recording

- **"Exactly at the threshold" is not always reachable.** Thresholds like 750,000 × 1.02⁴ are not round, and no monthly
  pension × 12 reproduces some of them bit for bit: a naive joint case landed a hair *under* the 2029 threshold and a hair
  *over* the 2031 one, and would have passed on the broken build. `t44` searches for a year whose threshold can be placed
  exactly and asserts that it found one.
- **`t10`'s reference oracles carried C-1's own rule.** Its exact-top case compared the engine's `<=` against the oracle's
  `<=` and agreed. Both oracles now state the law; a control that forces the fixed rule onto the v5.77 leg fires on exactly
  the two exact-threshold cases (−$580 single, −$1,160 joint), proving the case is reached.
- **The audit counted "Engine A ×3" tier comparisons**; the parser found two loops plus an IRMAA-avoidance cap that targets
  tier 1 and cannot reach the top. The count is corrected in the audit's entry.
- **The manifest's hash rows were first rolled by file name, which is wrong for exactly one file.** `index.html` names two
  different things: the built app in the repo root, and the Vite template the pool keeps (from `src/`). The roll wrote the
  built app's hash into the template's row; it was caught on inspection before packaging and restored (K-8 would also have
  failed it). The only other pooled name held by several repo paths is `README.md` (three of them); this release changes
  none, so no other row was at risk — but a roll must go by path, not by name.
- **Two full runs were interrupted** between working sessions (green through `t28` and `t38`, no GRAND line) and were
  re-run in full; a partial run is never counted. The counts above are from a complete run on the packaged copies.

## v5.77 — one Social Security tax rule for every engine

Source `9cdd345d488443a8ca146e8cbb7da332` · built `index.html` `a2bc67451b11cad440709e3c342834d5` · built from v5.76 `66b0dd944333a53f4cc00a54b9e3d618`.
`src/index.html` and `src/main.jsx` are unchanged. **The example household does not move**: all seven Roth strategies'
lifetime and widow-years tax are identical, MC parity is 10/10, and the Taxes and IRMAA tables are byte-identical on screen
(`domdiff` 32/32). Figures move for two kinds of household, in opposite directions — see *Who moves*. `METHODOLOGY.md`'s §86
passage is replaced by one account; `docs/FlawsToFix-v5_73-Phase2.md` annotates C-4 and D-1 fixed and adds **C-12**.

**Suite: 4,399 app checks, 0 failed, 0 DIED, across both legs** — 42 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,529), run from the packaged copies. `t43` is new on both legs (32 on v5.76, 37 on
v5.77). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v577_ss86.py` **6 of 6** as required. Per-suite:
`TESTING.md`.

### What changed, and why

- **Taxable Social Security is now computed in one place.** 26 U.S.C. §86 decides how much of a household's benefits is
  taxable, and through v5.76 the app wrote that rule out four times — in the Roth-strategy comparator, the Taxes tab, the
  IRMAA tab and the Roth tab's year table. v5.77 replaces all four with one function written line for line from the IRS
  Social Security Benefits Worksheet (2025 Form 1040 instructions, re-read from irs.gov at this build). Each tab passes the
  filing status for the year it is taxing — joint, or single once a survivor files alone.
- **The Roth-strategy comparator overstated taxable benefits in a narrow case (C-4).** Above the adjusted base amount the
  worksheet carries up the smaller of half the benefits and half of the capped excess (line 14). The comparator dropped
  the half-benefits limb — the same error v5.45 fixed in the Taxes tab, whose fix never reached this copy. Worked case: a
  single retiree born 1958 with $6,000 of benefits and a $32,000 pension in 2026 was charged **$2,026** of federal tax
  against **$1,876** by the worksheet (+$150; +$60 at $8,000 / $31,000). Pessimistic, and only in years with benefits
  under $9,000 single / $12,000 joint and provisional income above the adjusted base.
- **The IRMAA tab taxed a single household's benefits on the married thresholds (C-12).** Its formula was right, but it took
  the §86 amounts from the flag that marks a married household's widowed years, so a household single from the start got
  $32,000 / $44,000 instead of $25,000 / $34,000. Optimistic: a single retiree with $60,000 of benefits and a $62,500
  pension read MAGI **$109,725** (no surcharge) against **$113,500** — tier 1, **$1,150** of lifetime IRMAA. Found at this
  build by executing the rule on a grid (55 of 160 cells wrong, all single, by up to $7,000 of taxable benefits); the
  audit had read that engine and not run it. Fixed in this release by decision (D-5).
- **METHODOLOGY's §86 passage said two contradictory things** — that the half-benefits cap "is applied in both places as
  of v5.45", then that it "remains uncorrected" — and named neither the comparator nor the IRMAA tab. It is now one account
  of the shared rule, its history and both corrections (D-1).

### Who moves

- **A household with small benefits** — a low-earning single retiree, or a year with only one small benefit in payment, or
  a late claim's pro-rated first year — in the Roth tab's comparisons: taxable benefits fall by up to $1,838 (single) /
  $2,463 (joint) a year, and tax with them. Conservative before; correct now.
- **A single household** on the IRMAA tab: MAGI rises wherever the single thresholds bite and the 85% cap does not. On the
  example household made single, **eight years rise** — exactly $7,000 in 2032–2038, $5,644 in 2031 — with no change in
  surcharge. Optimistic before; correct now.
- **Married households do not move** in either place: they file jointly until the year after a death, when the IRMAA tab
  already used the single figures, and their benefits are far above the line-14 region.

### Limitations, stated plainly

- **The worksheet's adjustments (line 6) and tax-exempt interest (line 4) are not modelled**, and neither are lump-sum
  elections or repayments (§86(d)–(e)). Unchanged by this release; now stated in one place.
- **The comparator's tax is resolved to the dollar, not the cent.** It reports totals only, so `t43` measures it through a
  one-year household's tax: about $10 of taxable benefits at the 10% rate. Four of `t43`'s 70 line-14 cells overstate by
  exactly $5.00 on v5.76 and are invisible in the tax for that reason; the suite says so and pins 66.
- **Withdrawal-tab bracket column (C-5) is untouched.** Engine D's flat 85% there is a display figure and out of scope.

### Found while building, and worth recording

- **The scope's census missed two of Engine A's five call sites**, including the line that actually taxes the year. The fix
  was at the definition, so nothing changed; the scope's build record corrects the census.
- **Sixteen `t1` assertions pinned the deleted per-site text.** Found by executing every string and regex literal in the
  suite against both builds (an AST census, OPERATIONS §B1a), not by searching for names; gated per leg.
- **Two existing suites run the single example household and stayed green on both legs** while its IRMAA MAGI moved in
  eight years. Neither was wrong — they compare cases or pin other figures — but neither witnessed C-12. `t43` §F now does.
- **`t24` §D had tested dead code since v5.45.** Written at v5.42 against a transcription of the app's middle
  tier, it passed on every build after v5.45 fixed the app and could never flip. It now tests the shared function, gated on
  the version so a build missing it fails loudly.
- **The rewrite of that section was itself lost once, and a negative control found it.** The copy into the run folder was
  on a command line the sandbox shell rejected, so the original file was registered and run in its place. Control `M5`
  fired nothing; the investigation found the missing file. With the rewrite in place, `M5` fires and reproduces the
  historical $2,468 / $1,850 bounds exactly.
- **The v5.75 and v5.76 ships left no ship note or retirement entry in `PROJECT_KNOWLEDGE_INDEX.md`.** Recorded there, not
  back-filled.
- **The boundary census already covered both blind spots (OPERATIONS §K1), so no row was added.** Run on the example
  household at this build, `boundaries.mjs` reports `filing` as "the single path is unexercised" — the gap C-12 hid in — and
  both `ss*_band` rows as outside the THR2 − THR1 band (under $12,000 joint), which is where worksheet line 14 binds and C-4
  lives. The band row was written for v5.45's middle-tier cap; it is the same band.

## v5.76 — a single household is no longer paid spouse B's Social Security

Source `66b0dd944333a53f4cc00a54b9e3d618` · built `index.html` `1254aa00d608a98e0f29e22f974ab96d` · built from v5.75 `4453cf274ef8c59f5ea610528eed97ab`.
`src/index.html` and `src/main.jsx` are unchanged. **Figures move only for a single household whose plan was loaded
from a file — all toward lower balances and more tax.** Married households are untouched: on screen the Taxes and IRMAA
tables are byte-identical across the pair (`domdiff` 32/32). `METHODOLOGY.md` gains *A single household is never paid
spouse B's Social Security (v5.76)*; finding C-7 in `docs/FlawsToFix-v5_73-Phase2.md` is annotated re-measured and fixed.

**Suite: 4,319 app checks, 0 failed, 0 DIED, across both legs** — 41 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,449), run from the packaged copies. `t42` is new on both legs (17 on v5.75, 34 on
v5.76). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v576_c7.py` **6 of 6** as required, including
`M3`, which re-adds a read of spouse B's benefit that bypasses `getSSB()` entirely and must be caught by the sweep.
Per-suite: `TESTING.md`.

### What changed, and why

- **A single household has no spouse B, so it has no spouse-B benefit.** Social Security retirement benefits belong to
  the worker who earned them (42 U.S.C. §402(a)). Twelve of the 25 reads of spouse B's benefit already tested for a
  single household; thirteen did not — the Withdrawal plan, both Monte Carlo loops, what Ask AI is told about the
  household's income, and several tab figures. Since v5.74 the Withdrawal plan's draws feed the Taxes tab, so its
  error became a tax error too. The rule now lives once, in `getSSB()`, which returns zero for a single household.
- **The loader no longer invents one.** A single household's plan file with no spouse-B section — the natural shape of
  such a file — was given the example household's $1,300/month by default, and `getSSB()` had a second fallback to the
  same figure. It now loads with zero.
- **A stored figure is left alone, and the app says so.** If a single household's file carries a spouse-B benefit, it
  stays in the file — switching back to married restores it — but no calculation uses it, and one line under the header
  says so while it is present. Checked live at render, so it cannot outlast a My Data save that clears the figure.

**Size, on the example household made single** (retirement 2029, base preset, no conversions): the plan paid **$308,076**
of spouse-B benefits that do not exist; the ending portfolio read **$427,269** high, spending draws $301,146 low,
lifetime federal tax **$38,916** low, and the Monte Carlo median ending balance **$61,158** high. Every error ran
optimistic. Each is zero on v5.76 against the zeroed-benefit case, to the dollar.

### Limitations, stated plainly

- **The route is loading a plan file.** Both in-app ways of making a household single already cleared the figure on
  save, which narrows the audit's original description of who was exposed. A hand-edited file, a converted document or a
  backup from before the save paths cleared the figure are the realistic cases.
- **The Monte Carlo success rate did not move on the example household** — 100% either way; the plan is very safe — so
  this release shows its Monte Carlo effect through the median balance. A tighter single household's success rate would
  move, and was not separately measured.
- The twelve pre-existing inline single tests are now redundant and were left in place deliberately; removing them is
  churn with no behaviour change.

### Found while building, and worth recording

- **The audit's severity no longer fitted.** C-7 was rated low–medium at v5.73 as one site in one engine. Re-verified on
  v5.75 it had a narrower route (file load, not the in-app toggle), a second and larger route (the loader default), and a
  wider reach (the Taxes tab via v5.74's bridge, and Monte Carlo).
- **A Monte Carlo seeding trap.** The simulation's market noise comes from `d3.randomNormal`, and d3 captures its own
  reference to `Math.random` when the library loads. Replacing `Math.random` after import seeds only half the randomness:
  identical runs then differ by ~$3,000, and a first measurement for this scope ($70,110) was contaminated by exactly
  that. `t42` installs its seeded source before the import and asserts the harness is deterministic (`M-0`) before
  trusting any Monte Carlo comparison.
- **`t42`'s rendered check first failed on a stale screen.** Clicking the tab that is already showing changes no state,
  so React skips the render and the previous note stays visible. The check now switches between two different tabs.
- **Registration was clean on the first pass.** The project's sweep (`vercensus.cjs`, given its directory arguments) sized
  the work before any edit, and the three shapes it cannot see — `t31`'s `ORDER`, the ternary chains and the
  display-string maps — were handled explicitly. v5.75 needed two rounds of fixes for the same work.

## v5.75 — the survivor's age deductions, and a deduction ordinary income never used

Source `4453cf274ef8c59f5ea610528eed97ab` · built `index.html` `fac9dd22a686bfe40f9a3cc2962dcc21` · built from v5.74
`1ff04dee1b43b20880a8500ab9645f02`. `src/index.html` and `src/main.jsx` are unchanged. **Figures move for two
households: one whose first death leaves a survivor under 65 (tax goes UP — the deduction was not theirs), and one
whose ordinary income is below the standard deduction while it holds gains or qualified dividends above the 0% band
(tax goes DOWN).** The example household is unaffected — on screen the Taxes and IRMAA tables are byte-identical
across the pair (`domdiff` 32/32). `METHODOLOGY.md` gains *Who the age-65 deductions belong to, and an unused
deduction against gains (v5.75)*.

**Suite: 4,265 app checks, 0 failed, 0 DIED, across both legs** — 40 app suites plus MC parity 10/10; tooling `t21`
64, `domdiff` 32, `sets` 12 + 12 (GRAND 4,395), run from the packaged copies. `t41` is new on both legs (36 on
v5.74, 39 on v5.75). `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v575_c3c6.py` **8 of 8** as
required, including `M4`, which floors only the AMT stack and must fire the phantom-AMT check while every total stays
correct. Per-suite: `TESTING.md`.

### What changed, and why

- **The age-65 deductions belong to the people on the return.** §63(f)'s additional standard deduction and the OBBBA
  senior bonus are per individual *on the return*; on a single return that is the filer alone. Through v5.74 a single
  return took `Math.max(ageA, ageB)`, so a **surviving spouse under 65 received both deductions through the deceased
  spouse's age**, and a single household with a stale spouse-B birth date on file could receive them through someone
  not on the return at all. On a household whose first death leaves a survivor aged 62 with $50,000 of pension income,
  federal tax was understated by **$975.96** in the first widowed year (2028: $2,756.02 against $3,731.98, the bonus
  still in force) and by **$261.00** and **$266.28** in the two years after. The stale-date case understated by
  **$246/yr** — measured on Engine A, where it was live; it was not live on Engine B. Both engines and the Roth tab's
  bracket projection now decide it through one shared helper, `persons65OnReturn`. Sources: IRS Pub. 501 (2025),
  *Death of spouse*; 2025 Form 1040 instructions, Schedule 1-A Part V, *Death of a taxpayer in 2025* (added by the IRS
  after first print, and it gives the bonus the same rule and the same example).
- **A deduction ordinary income does not use now reaches the gains.** 26 U.S.C. §1(h)(1) applies the preferential rates
  to net capital gain *"or, if less, taxable income"*, and the IRS's Qualified Dividends and Capital Gain Tax Worksheet
  measures the gains against taxable income **after** the deduction. Through v5.74 the model stacked gains on ordinary
  income floored at zero, so the unused deduction was simply lost. A single filer with no ordinary income and $60,000
  of qualified dividends was charged **$1,583 instead of $0**; with $8,000 of ordinary income and $70,000 of dividends,
  $3,083 instead of $1,868. Corrected on the regular **and** the AMT path in both engines, in all thirteen stacking
  call sites.
- **Fixing only half the second defect re-routes the overcharge into AMT rather than removing it** — $1,583.00,
  $1,215.00 and $82.00 of pure AMT on the cases above, measured on both engines during the build. This is why `t41`
  asserts `amt == 0` per case and not only the total, and why control `M4` exists.
- **The Roth tab's bracket projection is hoisted** to module level as `projectBracketsAt` and exposed through the test
  shim, so `t41` checks its deduction to the dollar. Its figures were previously readable only through the DOM, where
  rendering rounds to the nearest $1,000 — a $500 floor under any invariant, larger than the $2,050 deduction at 12%.

### Limitations and approximations, stated plainly

- **The death year is still approximated, and in the optimistic direction.** The model holds birth *years*, not death
  dates, and treats the death year as a joint return counting the decedent by calendar-year age. The statute counts a
  decedent as 65 only if they reached 65 **on or before the date of death**. For a decedent whose birthday falls after
  their death date in that year, the model grants one deduction the return is not entitled to — one year, one
  deduction, disclosed in `METHODOLOGY.md` and unchanged by this release.
- **Engine A still does not model the $6,000 bonus at all** (a pre-existing, disclosed simplification), so its widowed
  figure is $3,732 where Engine B's is $3,731.98 plus the bonus effect. The Form 6251 add-back question therefore
  cannot arise there; Engine B's AMT already starts from gross ordinary income and subtracts no deduction.
- **Two longhand copies of the survivor rule remain** on the Roth tab, outside this scope. They behave identically
  today; they are the same duplicate-copy shape that produced this release's bonus defect and are recorded, not fixed.
- The sale gross-up sites are reachable only when a **state** bill funds the sale while the federal deduction is
  unused; `t41` D-4/D-5 pin that case and control `M6` proves nothing else covers those four sites.

### Found while building, and worth recording

- **`t41` was written, green, and never ran.** A suite file that is not listed in `qa/runsuite.sh` executes nowhere and
  nothing fails; the first full pass reported 4,320 green with 39 checks that had not run. Caught by reading the
  per-suite breakdown for a `t41` line. The runner now carries the warning beside the entry.
- **The test shim is shared by every leg.** Exporting the newly hoisted function unconditionally was a `ReferenceError`
  at module load on the v5.74 leg and killed four suites there. It was invisible in the working run folder, whose prior
  leg still held bundles built before the edit, and was caught only by the run from the **packaged** copies. The export
  is now guarded, and `t41` asserts its absence on the prior leg.
- **The scope's own example-household sentence was off by a year** (the survivor is 79 in the first single-filing year,
  not at the death); corrected in the shipped scope. Its conclusion was unaffected.
- `t24`'s pinned figures appeared to move and had not: its version gate is a ternary, the shape a version-roll sweep
  keeps missing. `t16`'s structural check needed its search region widened to follow the hoisted code rather than its
  expected count lowered.
- The boundary census (`t29`) gains the two conditions the example data hides, and reports them for that household:
  survivor already 79 at the first single-filing year, and ordinary income ($4,800) below the deduction ($32,200) but
  preferential income never above the 0% top ($98,900) — both halves are required, which is why this was $0 there.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` (2026-09-28); v5.59 and earlier in
`docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
