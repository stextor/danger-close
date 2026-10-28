# SCOPE — v6.34 · D-58: My Data shows and keeps spouse A's stored pre-tax contribution

**FULFILLED — shipped as v6.34 (2026-10-27).** Decided 2026-10-27, all four as recommended (Steve: *"Let's go with your recommendations"*): DC-1 (a), DC-2 (a), DC-3 (c), DC-4 (a). Scope reviewed once (§6); the build reviewed once (§7.2), every finding taken. Retired at the ship: read it as the record of what was decided and built, not as open work. Repo-only (`docs/`).

Steve, 2026-10-27, on what to do while the 2027 tax figures are unpublished: *"yes, write the D-58 scope."*

This is a **data-handling and display release**. No engine changes: every engine already reads `contributions.contribPreTaxA` and its mirror
correctly. What changes is what My Data shows for spouse A's pre-tax contribution, and what it writes when it saves, drafts or exports.
METHODOLOGY and OPERATIONS §C4 change where they describe the defect; METHODOLOGY also carries two sentences that were already false.

**Built against v6.33.**
- Clone: a fresh full clone of `origin/main` at `956ac7f`. The same day it passed the post-upload check: `package_check` 54 of 54 against
  the live pool, the §F clone diff clean, and the full suite run from it, 10,133 app checks with 0 failed.
- Hashes: source `5fd4f025c3aacda999989ce3395b73ee`, built page `64296d15860bd5756ab5e3376d5c57d2`.
- Line numbers: v6.33 lines, printed by `qa/tools/census.cjs` or read from the file this session.
- Probes: `probe_d58_dom.mjs`, `probe_d58_mod.mjs` and `probe_d58_ext.mjs` drive the real v6.33 DOM bundle and module; `suitecensus.cjs`
  walks the suite's literals by AST. All are session-only and were never committed.
- Free names: the tag `v634` (`vercensus.cjs v634` reports 0 sites; no `dom_entry_v634.jsx` in history; no `.py` suite names it), and the
  suite name `t97`. ⚠ `v634` is currently promised to the 2027 tax refresh — see DC-4.

---

## 0 · Premise (verified at v6.33, not assumed)

### 0.1 · The mechanism

Spouse A's pre-tax contribution has **no field of its own** in My Data. The form derives it from three per-paycheck amounts and a pay
frequency:
- the paycheck fields `empContrib`, `matchContrib` and `suppContrib` open from `employeePer`, `matchPer` and `supplementalPer` (L13675–13677),
  each `""` when the stored plan lacks it;
- `monthly401k = perPaycheckTotal × periods ÷ 12` (L13728–13730).

`buildPortfolio` (L13756) writes **that rollup**:
- `contribPreTaxA: Math.round(monthly401k)` (L13815);
- the mirror `monthly401k: Math.round(monthly401k) + num(rothAMo)` (L13821);
- the paycheck fields as `num(…)`, so a blank becomes `0` (L13822).

It never reads the stored `contribPreTaxA`. Spouse A's Roth and both of spouse B's fields are direct monthly entries that open from the
stored figures (L13681–13683), so they are not affected. Neither is the once-a-year bonus lump (`annualBonus` and its two percentages): it
has its own fields, which open from storage and save back unchanged.

`buildPortfolio` has **three callers**, confirmed by census and by the review:
- Save & Apply (`handleSave`, L13997);
- the draft autosave (L14019; written only after an edit);
- **Export Backup** (`handleExport`, L14078).

The register named only Save & Apply. **Exporting a backup from My Data writes $0 for A in the file, even without a save.**

### 0.2 · Which plans hold a stored figure with no paycheck breakdown

**My Data has written the paycheck fields since the first commit.** `f8e21ce` (2026-08-01) and the v5.9-skins, v5.9.1 and v5.9.2 sources
all write `employeePer: num(empContrib), …` in `buildPortfolio`, read with `git show`. So any plan saved or exported through My Data, in
any version, carries its breakdown, and its stored figure is that breakdown's rounded rollup.

| Route into a plan | A's stored pre-tax | Breakdown | Affected |
|---|---|---|---|
| The example (`DEFAULT_PORTFOLIO`, L628), however loaded (the landing button, the in-app *load sample*) | $2,500 | absent | **yes** |
| A backup written outside My Data: hand-made, or from an early plan built by the since-removed spreadsheet import and never saved in My Data | as written | absent | **yes** |
| A backup saved or exported through My Data, any version (v5.10's loader migration included, L4505–4525) | the rollup | present | no |
| Start Fresh (L5033) and the guided setup (L4861, and from inside My Data) | $0 | absent | no — nothing to lose |
| A v6.33 draft restored (it was written by `buildPortfolio`) | the rollup | present | no — it is already a My Data plan |

`_parseSpreadsheet` (L3703) builds such a plan, with an example-valued default of $2,692 a month (L3952) and a fixed $712 HSA (L3994).
**It is dead code**: its only AST hit is its own definition, and `xlsxStatus` (L4968) has no setter (ARCHITECTUREIssues E-32). It is not a
route, and this scope leaves it alone (§4).

⚠ **Owned — two corrections, both before Steve saw this scope.**
1. I told Steve that *"a user who saves without editing loses a number they entered"*. For the main route, the example, the $2,500 is
   **the example's** figure, not the user's, and My Data has shown A's figure as $0 on it the whole time.
2. The first draft of this table listed *"a backup from before v5.10"* as affected. The review showed that row was asserted, not checked,
   and the history above shows it is not affected. So a figure a user typed is lost only from a backup written outside My Data, which is
   rare.

What this release fixes is therefore mostly **the example's own figure, and the form misdescribing it**:
1. On the example, the plan accrues $2,500 a month to spouse A. Every engine adds it (`contribAccrual`, L2798), and both Monte Carlo
   engines read its mirror (L2945, L3126).
2. Meanwhile My Data shows *"Per-paycheck total $0"*, *"Pre-tax monthly $0/mo"*, *"Annual total $0/yr"* (L14797–14799) and *"Projected
   added by retirement: Spouse A $0K Trad"* (L14852).
3. An unedited save, draft or export then makes the $0 true.

**Severity: Low.** Direction **conservative**: the plan reads poorer than it is.

### 0.3 · What one unedited save does — measured by driving the real controls

`probe_d58_dom.mjs`, on the v6.33 DOM bundle (reproduced by the review): load *Use example data*, open My Data, export a backup, press
Save & Apply.

| | `contribPreTaxA` | `monthly401k` | paycheck fields |
|---|---|---|---|
| The example as loaded | 2500 | 2500 | absent |
| Exported backup, before any save | **0** | **0** | 0 / 0 / 0 |
| Stored after Save & Apply, and `PORTFOLIO` after it | **0** | **0** | 0 / 0 / 0 |

B's $350, the HSA's $300 and the allocations are unchanged. The save also moves `asOf` to today, which is intended (D-48) and outside
this scope.

**What the lost $2,500 moves.** `probe_d58_mod.mjs` and `probe_d58_ext.mjs` ran the module twice: the example as loaded, then the same plan
with its contributions as the save leaves them. `asOf` is held at 2026-04-18. Monte Carlo runs are seeded, 3,000 paths. Every row was
reproduced by the review.

| Figure | As loaded | After the save |
|---|---|---|
| Spouse A Traditional at retirement (2029, `retireStartBalances`) | $1,180,000 | **$1,090,000**: −$90,000 = 12 × $2,500 × 3 years |
| Lifetime tax, today's dollars (BULL-LEANING, $70K slider) | $197,987 | $185,192 (less Traditional money, so less tax) |
| Lifetime IRMAA | $0 | $0 |
| 30-year Monte Carlo above $500K / above $800K / median, BULL-LEANING | 95.37% / 91.10% / $2,073K | 94.43% / 88.40% / $1,856K |
| The same under BASE | 85.13% / 75.03% / $1,385K | 82.63% / 71.13% / $1,249K |
| 6-year headline above $800K, BULL-LEANING / BASE | 99.77% / 99.43% | 99.67% / 99.30% |
| Withdrawal tab end balance (2053) | $3,176,856 | $3,176,856, unchanged; its 2053 RMD $49,924 → $47,497 |

The Withdrawal tab's balance does not move because Engine D's buckets start from today's holdings, not the accrual. That is **D-64**,
recorded and not changed here.

The review also restored only the contributions and the as-of date on a real v6.33 save. The engines then matched the loaded example
exactly, so the bit-identity target in §3 is reachable on the example.

### 0.4 · Siblings in the same form

- **The 402(g) soft warning** (L14845–14847) counts spouse A's elective deferral as `empContrib` × periods, plus A's Roth and the bonus
  deferral. On a plan with no breakdown, A's pre-tax share counts as $0 and nothing says so. Counting the stored total in its place would
  be wrong: it may include employer money, and catch-up limits vary by age. → DC-2.
- **The four display sites read the rollup:**
  - *Per-paycheck total*, *Pre-tax monthly* and *Annual total* (L14797–14799);
  - *WHERE CONTRIBUTIONS LAND*'s monthly total (L14881).

  On the example each reads $2,500 a month short.
- **METHODOLOGY's contribution-accrual section** (L1418–1436) has three problems:
  - It says *"There is no employer-match field beyond the existing bonus-deferral machinery; matches can be folded into the pre-tax monthly
    amount by hand"*. Both halves are false: the paycheck row has *Employer match $* and *Employer supplemental $* (L14793–14794), and A has
    no pre-tax monthly field to fold anything into.
  - It calls the $0 rollup *"true in v5.9.2, true now"*.
  - Its 402(g) sentence needs the DC-2 wording.
- **METHODOLOGY's v6.24 bullet** (L3036–3037) and **OPERATIONS §C4** (L627) record D-58 as a standing trap: an unedited save stores A's
  pre-tax as $0.
- **`t9` reads the clock.** Its B-readout expectation uses `new Date().getFullYear()` (L82) where the readout uses the plan's as-of year,
  so `t9` L87 goes red from 1 January 2027 whatever this release does. It is fixed in the re-gate of `t9` below, because that suite is
  being edited anyway.

### 0.5 · What the copy says

- **The Field Manual** never mentions the paycheck fields or the rollup: 0 hits for *paycheck* in the raw `DOCS_HTML`, confirmed by the
  review. It gains a §13 entry and nothing else.
- **My Data** shows the rollup's $0 as fact (above).

---

## 1 · What changes (the recommended shape: DC-1 (a), DC-2 (a), DC-3 (c), DC-4 (a))

- **A's pre-tax figure is the stored one until the paycheck row is edited.** One helper computes the *effective* figure:
  - It is the stored `contribPreTaxA` (cents kept) until the user edits any of the four paycheck controls: the three amounts or the pay
    frequency.
  - From that edit on, it is the rollup, rounded as v6.33 rounds it.
  - Typing 0 into a paycheck amount counts as an edit, which is how the stored figure is cleared.
  - Clearing the paycheck amounts back to blank in the same session does not bring the stored figure back.
- **Who sees a difference.**
  - For a plan saved through My Data, the stored figure *is* the rounded rollup, so nothing changes.
  - Where the two disagree, the form shows both: *"This plan uses $2,500/mo. Your paycheck figures add to $1,083/mo — editing them here
    replaces the $2,500."* A disagreement happens when there is no breakdown, or the stored figure differs from the breakdown's rollup by
    more than rounding (more than $0.50).
- **Every reader uses the effective figure:**
  - `buildPortfolio`'s `contribPreTaxA` and its mirror (`effective + num(rothAMo)`, unrounded when the stored figure is in use, so
    `monthly401k === contribPreTaxA + contribRothA` holds — `t5` L119);
  - the three display sites (*Per-paycheck total* shows *"—"* when there is no breakdown);
  - the readout's `_tA`;
  - *WHERE CONTRIBUTIONS LAND*'s total.

  So an unedited save, draft or export stores A's contribution exactly as it loaded. The rest of `buildPortfolio` is unchanged: the paycheck
  fields are written as they stand, and a blank is still written as 0.
- **The 402(g) line (DC-2 (a)).** While A's figure is the stored one, the check counts what it can: A's Roth and the bonus deferral. Its
  over-limit warning works as before. It adds one sentence: *"Spouse A's pre-tax contribution is not counted — enter the paycheck breakdown
  to include it."* Single plans use the person's name, as elsewhere. The new text must not contain *" · "*, which `t6` L99 forbids in the
  readout.
- **Plans already saved with $0 (DC-3 (c)):** no notice and no marker. Field Manual §13 and the CHANGELOG say what changed. Why: §0.2
  shows that nobody using My Data ever saw a non-zero figure for A that a save then removed. The form showed $0 before the save.
- **Copy.**
  - METHODOLOGY: the three passages in §0.4 corrected, and the v6.24 bullet closed.
  - OPERATIONS §C4: the trap at L627 loses its contribution half (the as-of restamp stays).
  - Field Manual: a §13 entry.
  - The four version sites.
  - MissingFeatures: D-58 closed.

---

## 2 · Site census (v6.33)

**App** (`census.cjs`; the review confirmed the paycheck fields are read only at L13675–13677 and written only at L13822, and that
`contribPreTaxA` is written only at L13815). No engine site changes.

| Site | Line | Change |
|---|---|---|
| The paycheck state | L13674–13677 | add the "paycheck row edited" flag; the four setters set it |
| The rollup `monthly401k`, `annual401k` | L13728–13731 | the effective figure through one helper |
| `buildPortfolio`'s `contribPreTaxA` and its mirror | L13815, L13821 | the effective figure |
| *Per-paycheck total*, *Pre-tax monthly*, *Annual total* | L14797–14799 | the effective figure; the both-figures sentence |
| The readout's `_tA` | L14838 | the effective figure |
| The 402(g) line | L14845–14847 | DC-2 (a) |
| *WHERE CONTRIBUTIONS LAND*'s `_totalMo` | L14881 | the effective figure |

Unchanged and read as they are: the loader's migration (L4505–4525) and its notice (L14823), `contribAccrual` (L2787), both Monte Carlo
engines' reads of the mirror (L2945, L3126), Start Fresh (L5033) and the guided setup (L4861).

**Suite locks** (§B2) — re-gated per leg:

| Suite | Check | Why it moves |
|---|---|---|
| `t9` | L86 *"readout Trad-A previews form state ($0K — demo lacks per-paycheck fields)"* | it pins the defect; on v6.34 the readout reads $90K for A. L82's clock read is fixed with it (§0.4) |
| `t8` | L76 *"mirrors maintained on Save & Apply"* | it text-pins `monthly401k: Math.round(monthly401k) + num(rothAMo),` |
| `t8` | L82 *"readout preview follows the helper's formula"* | it text-pins `const _tA = 12 * monthly401k * _yrsA + …` |

`t4` (L694–700), `t5` (L118–119), `t6` (L95–99) and `t7` (L91–118) read the readout's presence, its form, and the stored split fields and
mirror. Their assertions stay true, and are expected to hold unchanged.

**Suites to re-measure.**
- `t45` (phone layout) and `t48` (text and target sizes) sweep the example's My Data, which gains new text.
- 17 suites press Save & Apply (by the walker): `t4`, `t5`, `t8`, `t37`, `t38`, `t56`, `t79`, `t80`, `t84`, `t85`, `t86`, `t87`, `t88`,
  `t89`, `t90`, `t91`, `t92`.
  - Any figure one of them reads after saving a plan with no breakdown will move: the example, and fixture households built from it.
  - **`t90` B-8**, which compares each saved plan's grades across the two legs, is the likeliest.
  - Each move is attributed at the build by a **harness transform** that reapplies v6.33's save shape on the v6.34 leg (sets
    `contribPreTaxA`, the mirror and the paycheck fields to what v6.33 stores). The v6.33 figures must come out exactly. As with v6.21's
    `DC_V620_TABLE`, this is suite-side, not an app hook.

**Version-bump cost** (`vercensus.cjs v633`, this session): 79 files, 264 ladder entries, 184 gated expressions, 2 keyed registries (`t33`
PINS, `t93`). Plus the three `.py` suites by hand.

**Census row (OPERATIONS §K1): none proposed.** D-58 was visible on the example, which is where it was found.

---

## 3 · Tests

New suite **`t97_contrib_save.mjs`**, run on both legs. The v6.33 leg pins each defect as a dated `[KNOWN DEFECT 2026-10-27, D-58]`.
`Math.random` is seeded before the bundle loads.

- **§A, the round trip through the real controls.**
  - On the example: Export Backup before any save; Save & Apply, then a second save; an edit elsewhere that writes the draft, then the
    draft's RESTORE & APPLY.
  - Each stores `contribPreTaxA`, `contribRothA`, `contribPreTaxB`, `contribRothB` and both mirrors exactly as loaded.
  - The same on a hand-made backup with a total and no breakdown, with cents ($2,500.50).
  - The same on a single plan with a total and no breakdown.
- **§B, plans with a breakdown.** All of these cases fail a build that always prefers the stored figure:
  - A My Data plan (biweekly, semi-monthly, monthly) stores the same contributions on both legs, rounding included.
  - A plan whose stored figure disagrees with its breakdown shows both figures. An unedited save keeps the stored figure; an edit to any
    paycheck amount stores the rollup.
  - A change to the pay frequency alone stores the rollup.
- **§C, the extinction invariant.** After an unedited save, with `asOf` held, `retireStartBalances`, Engines B and C and both seeded Monte
  Carlo engines are bit-identical to the plan as loaded, on the example and on the no-breakdown backup. The v6.33 leg pins the $90,000
  drop (12 × $2,500 × 3, by hand).
- **§D, edits.**
  - A typed 0 stores $0.
  - Blanking the amounts after an edit does not restore the stored figure.
  - The readout reads $90K for A on the example; the three display sites and *WHERE CONTRIBUTIONS LAND* read the effective figure.
- **§E, the 402(g) line.**
  - With no breakdown: the added sentence is shown, and Roth plus a bonus deferral above the limit still warns.
  - With a breakdown: no added sentence, and the over-limit warning is unchanged.
  - No *" · "* in the readout.
- **§F, by behaviour, not by name.**
  - Every display site and `buildPortfolio` agree with one another on four plans (with a breakdown, without one, a disagreeing one, and
    one after an edit).
  - By AST: `buildPortfolio`'s `contribPreTaxA`, its mirror, the readout and the totals line all read the one helper.
- **§G, copy.** Field Manual §13 (the v6.34 entry first); METHODOLOGY's corrected sentences, with the old ones extinct; OPERATIONS needs
  no test (no suite reads it).

**Controls** (`qa/tools/controls_v634_contrib.py`). Each puts one defect back:
- `buildPortfolio` back on the rollup;
- the draft or the export alone on the rollup;
- the mirror rounded while the split is not;
- always preferring the stored figure (§B must fire);
- the frequency select not counting as an edit;
- a typed 0 not counting as an edit;
- one display site, the readout, or the totals line on the rollup;
- the 402(g) sentence missing, or the Roth/bonus warning suppressed in stored mode;
- METHODOLOGY's old sentence restored;
- and the unmutated run.

---

## 4 · Out of scope (recorded)

- **A direct monthly field for spouse A**, like B's (DC-1 (b)).
- **The as-of restamp on save** (intended; its UTC date is D-48).
- **D-64**: Engine D's balances leave out the accrual.
- **`_parseSpreadsheet`'s example-valued defaults** ($2,692, $712). It is dead code; to be noted in E-32 in case it is ever revived.
- **Recovering a figure an earlier save already reset.** Nothing records it, and §0.2 shows nobody saw one.

---

## 5 · Decisions for Steve

**DC-1 · What spouse A's pre-tax figure is in My Data**
- **(a) Recommended: the stored figure, until the paycheck row is edited** (§1). It is the smallest change, and it follows the same rule
  v6.24 applied to expense rows: an unedited save stores what loaded. The form stops showing $0 on a plan that accrues $2,500 a month.
- (b) Give spouse A a direct pre-tax $/month field, like spouse B's, with the paycheck row as a calculator that fills it. Cleaner in the
  end, but bigger: a new input, re-laid-out rows, and more layout re-measurement.
- (c) Back-solve paycheck amounts from the monthly figure. Rejected: it invents an employee/employer split, which the 402(g) check would
  then trust.

**DC-2 · The 402(g) check when A's pre-tax has no breakdown**
- **(a) Recommended: keep counting A's Roth and the bonus deferral, and say A's pre-tax is not counted.**
- (b) Count the whole stored figure as elective. It may include employer money, so this can warn falsely.
- (c) Leave it as v6.33 has it: the pre-tax share counted as $0, silently.

**DC-3 · Plans already saved with $0**
- (a) A notice on My Data for plans saved before v6.34 with A still working and A at $0, with a marker to end it.
- (b) The same on the Monte Carlo tab too.
- **(c) Recommended: no notice.** Field Manual §13 and the CHANGELOG say what changed. The history (§0.2) shows that nobody using My Data
  ever saw a non-zero figure for A that a save then removed: the form showed $0 first. A notice would ask most people with a genuine $0 to
  check something they already saw.

**DC-4 · The version number**
- **(a) Recommended: this ships as v6.34, and the 2027 tax refresh becomes v6.35.** The refresh cannot be built before mid-November. In
  this release's package, its scope keeps its file name, and its header, its §1 and `package_check`'s OPEN-allowlist reason are re-pointed
  to v6.35.
- (b) Hold this until after the refresh, as v6.35.

---

## 6 · Review

An agent that had not seen the draft reviewed it against the v6.33 source. It ran the probes from copies, deleted them afterwards, and
edited no file. It found **no blocker, 9 should-fix and 10 notes**. The premise was confirmed, and every measured figure was reproduced
exactly. Every finding below was checked and taken into this text.

| Finding | Disposition |
|---|---|
| S1: §0.2's pre-v5.10 row was asserted, not checked | Checked in history: My Data has written the breakdown since `f8e21ce`. The row is corrected, the severity lowered, and DC-3's recommendation moved from (b) to (c) (§0.2, *Owned*) |
| S2: a stored figure that disagrees with a present breakdown is unspecified | Specified: the stored figure until the paycheck row is edited, with both figures shown (§1); tested in §B |
| S3: a pay-frequency change in stored mode is unspecified | The frequency counts as an edit; §B tests it, and a control covers it |
| S4: rounding | Cents kept in stored mode, with an unrounded mirror; §A has a cents case, and a control covers the mirror |
| S5: where the marker goes, and the export/draft ending the notice | Moot: DC-3 (c) has no marker. Options (a) and (b) would need it placed at top level, and written only by Save & Apply |
| S6: DC-2 (a) could suppress the existing warning | Reworded: Roth and the bonus are still counted and still warn; §E and a control cover it |
| S7: two display sites missed (L14797, L14799) | Added to §0.4, §1 and §2 |
| S8: the version-bump suite cost was not priced | Priced from `vercensus.cjs v633` (§2) |
| S9: `t45`/`t48`; §B could pass vacuously; §G keyed to a name; OPERATIONS §C4 not in the copy plan | All taken (§2, §3, §1) |
| Notes | Taken: §0.4's "never checked" corrected; DC-2 (b)'s rationale (catch-up limits); single-plan naming and a single case in §A; the *" · "* rule; `t9`'s clock read; the attribution switch as a harness transform; draft restore in §0.2, and a draft written only after an edit; METHODOLOGY's "folded into the pre-tax monthly amount"; the bonus left untouched, said in §0.1. Moot under DC-3 (c): the notice's inputs and its controls |

---

## 7 · Build record (v6.34)

**Built** against v6.33 (`5fd4f025…`) on the clone at `956ac7f`. Source `5ca11d612ffda0a870b93580f91b60aa` · built `index.html` `04e87d95a660eb7111bbf6c39afaadaa` (vite 5.4.21, `npm ci`;
v6.33 rebuilt from its own source byte-identically to `64296d15…`).

### 7.1 · As scoped

DC-1 (a), DC-3 (c) and DC-4 (a) are built exactly as §1 states. `effectivePreTaxA(stored, rollup, edited)` sits at module level and the shim
exports it (`__test`); the editor's `paycheckEdited` is set by the four paycheck controls alone; every reader in §2's census reads `_preTaxA`.
The editor is remounted on every path that changes the plan (load, Save & Apply, import, the draft's restore, the sample), so the edit flag
never carries from one plan to another (checked by the build review, N3). The TY2027 scope is renumbered v6.35 (its title, §1, §3, §7.4 and
`package_check`'s OPEN allowlist reason).

### 7.2 · Changed at the build, from the build review

An agent that had not seen the build reviewed the scope, the diff, `t97` and its controls. It ran one DOM probe from copies and edited
nothing. It found **no blocker, 3 should-fix and 8 notes**; each was checked against the source before it was taken.

| Finding | Disposition |
|---|---|
| S1: with a breakdown present but not in use, the 402(g) check still counted its employee share ($26,000 on a stored $500 beside $1,000 biweekly) and the sentence said to *enter* a breakdown that was on screen | **Fixed.** While the stored figure is in use the check counts no paycheck deferral (DC-2 (a) as written); the sentence says *"edit the paycheck amounts above"* when a breakdown is present. `t97` E-5/E-5b; control K16 |
| S2: My Data saves a blank row as 0, 0, 0, so the example reopened after one save showed three 0s beside *"no paycheck breakdown is entered … enter 0 to clear it"* — and a typed 0 in a field already reading 0 fires no change | **Fixed at load, not at save:** an all-zero row beside a stored figure opens blank. The saved shape is unchanged. `t97` D-9/D-9b; control K18 |
| S3: F-4 skipped any `setPaycheckEdited` call outside the four controls, so a stray marker (say on A's Roth) would pass while silently zeroing the stored figure | **Fixed:** F-4 now resolves every call and fails on a stray; behavioural D-10 (edit A's Roth, the $2,500 stays, the mirror goes to $2,600); control K15 |
| N1: the $0.50 rule rounds cents away on an unedited save of a near-agreeing plan; METHODOLOGY's "stores what loaded" and §C4's "the one thing an unedited save moves" overclaimed | **Taken:** both sentences now name the rounding and the save's other normalisations; §C4 is scoped to the example (`t97` C-1) |
| N2: a negative stored figure is now kept and shown as `$-500/mo` | **Recorded** as a stated simplification in METHODOLOGY; the loader does not clamp it and the engines already accrued it on load |
| N4: a stale comment in `buildPortfolio` | Updated |
| N5: E-2 tested Roth alone; no control for *Annual total*, *Per-paycheck total* or the both-figures sentence | **Taken:** E-2c (a bonus deferral alone); controls K17, K19, K20, K21 |
| N6, N7: the controls' targets and expected reds; the copy | Confirmed; no change |
| N8: the CHANGELOG's v6.33 entry says "the 2027 figures follow in v6.34" | History, left alone; the v6.34 entry states the renumbering |

### 7.3 · Measured

On the example, as-of date held, an unedited Save & Apply is bit-identical across `retireStartBalances`, Engines B and C and both seeded Monte
Carlo engines (`t97` C-1); on v6.33 it dropped A's Traditional at retirement by exactly $90,000 (the v6.33 leg's C-1, by hand). The §0.3
figures are v6.33's and are not re-measured: v6.34 removes them.

### 7.4 · Counts

From the full suite run from the packaged copies: 10,265 app checks across 96 app suites, 0 failed, 0 DIED (`t97` 63 on v6.34, 38 on v6.33); MC parity 10/10;
GRAND 10,385. The CHANGELOG's v6.34 entry has the breakdown.

Controls, `qa/tools/controls_v634_contrib.py` on a copy of the packaged run folder: **22 of 22 as expected** (C0 silent; K1–K21 each firing), every file restored and hash-checked.
