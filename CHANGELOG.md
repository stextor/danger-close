# Changelog

## ops 2026-09-18 (third) — OPERATIONS §L gains the pool-membership test that today's miss needed

`KIND: ops`. Leaves **v5.73** current. Documentation only: no source, no version, no suite total change.

**What changed.** §L now states, in one block, that **a file's pool membership is answered by the manifest,
not by its repo path** — with the instance that earned it (this morning's `package_check.mjs` miss, where
the file's `qa/tools/` location made a pooled file look repo-only), the reason the mistake was available,
and the check to run while packaging: for every `github/` file, ask whether the manifest names it as pooled;
if it does, there must be a `knowledge/` copy and a delete-first entry.

**Why write it down at all.** The miss was caught by `package_check` K-8 post-ship and corrected the same
day, so nothing shipped broken — but K-8 is a gate, not a plan, and §L is the section a session packages
*from*. The manifest's §A2 note already recorded `package_check.mjs` going a day without a row in August;
that is twice for one file, from the same gap between where a file lives and where it belongs. A second
occurrence is the project's own standard for writing a rule rather than remembering one.

⚠ **Deliberately NOT a second copy of an existing answer.** The block adds the destination test and points
at §I's hash-row obligation rather than restating it — the same discipline §L's own four-argument paragraph
follows, and the failure mode (two documents that disagree and never notice) this project has now recorded
against §A2, the manifest's rotation section, and `TESTING.md`'s build sentence.

**Verified.** `package_check` against a fresh clone before the zip was cut; the post-ship run closes section
J and K-8. The §A2 clone-and-diff was re-run this session after the two earlier packages: 121 of 122 pool
files content-match a committed file, the exception being the prior-build source, pool-only by design.

## ops 2026-09-18 (second) — the pool half of the probe package, which shipped repo-only

`KIND: ops`. Leaves **v5.73** current. No app source, no version change, no suite total change.

**The defect, plainly.** The ops package earlier today edited `qa/tools/package_check.mjs` (the I-2 OPEN
allowlist entry for `SCOPE_TAXES_DRAWDOWN.md`), rolled its hash row in the manifest to
`bbb9fac0478a9e3f45af6868961b2153`, and shipped **only the repo copy**. `package_check.mjs` is a **pooled**
file, so the pool kept `2554d811fe…` while the manifest asserted the new hash — a row claiming a hash the
pool does not hold, which is the exact failure §I calls worse than no row at all, because §A's fallback then
returns a confident MATCH on a file that has drifted. Caught post-ship by **`package_check` K-8** against the
uploaded pool. The gate worked; the packaging session did not.

**Why it happened, for the next session.** The package was assembled as "probes go to `qa/tools/`, repo
only" — true of the probes, and carried across to `package_check.mjs` because it lives in the same
directory. Directory is not destination: the manifest's own §A2 note records this file being uploaded to the
pool at the v5.42 refresh and its row being missed for a day, and the same manifest says adding a file and
adding its row are two acts. This is the third act nobody names — **changing a pooled file means shipping
BOTH copies**, and the repo path is not the test of whether a file is pooled.

**What this package does.** Ships `package_check.mjs` to the pool, so the pool matches the repo and the row.
`PROJECT_KNOWLEDGE_INDEX.md` gains a note recording the miss; the `package_check.mjs` row is **not** rolled —
it was already correct and the pool is what was wrong. `CHANGELOG.md`'s row is rolled last, as always.

**Verified.** `package_check` re-run with all four positionals against the uploaded pool: the earlier package
scored 47 passed, 1 failed, K-8 the only failure and this its cause. Nothing else in that package was
affected — J-1 and J-2 passed, so both knowledge files it did ship landed and none landed stale.

## ops 2026-09-18 — the C-8 scope's probes, and the allowlist entry that scope shipped without

`KIND: ops`. Leaves **v5.73** current (source `3bf1e15f1b28659aae9a78e3186d2ae8`, built `index.html`
`345ccbceb58bf74f9fbdde5db0646d1d`). No app source, no version change, no suite total change.

**What this package carries.**

- **Three probes for `SCOPE_TAXES_DRAWDOWN.md` §3**, repo only, at `qa/tools/audit_phase2_v573/` beside
  `audit_c8.mjs`. They assert nothing and are counted in no total. `scope_c8_probe.mjs` recovers the
  quantity a C-8 fix must bridge — Engine D's own ordinary-draw recognition, **$352,485** lifetime on base
  against the audit's narrower $238,144 — and prints the two engine disagreements the audit did not record:
  growth (D 3.518% weighted vs B's flat 4.500%) and units (2034 Social Security, D 45,331 COLA'd vs B 39,600
  flat). `scope_c8_probe2.mjs` prints the scenario and conversion sensitivity (draw $352,485 base /
  **$660,662 bear** / $352,386 bull). `scope_c8_probe3.mjs` is the partial counterfactual — Engine B taxing
  those draws with its balance path unchanged — at **+$16,160** of federal tax across 2032–2038.
- **`qa/tools/package_check.mjs`** gains the I-2 OPEN-allowlist entry for `SCOPE_TAXES_DRAWDOWN.md`. The
  scope shipped one package earlier **without** it, which would have turned I-2 red naming it — the same
  shape as 2026-09-14's `SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md`, and the gate working as designed. The
  entry records that all eight of the scope's decisions were resolved on 2026-09-18, so it is
  OPEN-because-UNBUILT, and names its expiry as the build that fulfils it.
- **`PROJECT_KNOWLEDGE_INDEX.md`** gains the pool row for `SCOPE_TAXES_DRAWDOWN.md` — **the third place a
  document has to land, and the one that was missed**: the scope was committed to `docs/` and uploaded to
  the pool on 2026-09-18 with no manifest row at all. Pool **121 → 122**.

**Limitations, stated rather than implied.** The probes recover Engine D's draw terms as a *residual* of its
published MAGI identity, because `tradDraw` (L5302) and `othOrdDraw` (L5241) are computed and never
published; that recovery is exact only on a household with no ordinary income streams, and each probe's
header says so. `scope_c8_probe3.mjs`'s 2029–2031 rows are **contaminated and labelled as such in its own
output** — any real income stream suppresses the demo spouse-B work taper (measured: `work_y` 20,000 → 0 in
2029) — and its state/total-tax column is not usable, because the fixture routes the draw through the state
module's work base. Only the federal figure on the clean years is quotable, and the probe prints both
totalling bases so the scope's $16,160 is reproducible rather than approximately so.

**Verified.** All three probes run from the packaged copies before the zip was cut, reproducing the scope's
figures; `scope_c8_probe3.mjs`'s negative control (the `applyLoadedData` round-trip with no streams) moves
Engine B by $0 in both federal and state tax, so its deltas are the draws' and not the fixture's. The §A
freshness check was run at the start of the session: pool source, repo `src/DangerClose.jsx` and the
manifest all hash to `3bf1e15f…`, and 120 of the pool's 121 files content-matched a committed file, the
exception being the prior-build source, which is pool-only by design. No app suite applies to this package;
`package_check` was run against the zip.

## ops 2026-09-15 (seventh) — project-knowledge space: twelve retired documents leave the pool; the CHANGELOG is split

KIND: ops. **v5.73 stays current**; no app source, suite or harness changes. The pool was at 98% of capacity.

- **The CHANGELOG is split.** Entries for **v5.59 and earlier** (83 headings) move verbatim to
  `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`, **repo only**. This file keeps v5.60 onward and a pointer at its end. No tool or
  suite reads past the newest entries — the suites mention the CHANGELOG only in comments, and `package_check` reads the
  newest release entries (H-1, H-2, K-1 to K-3) — and `package_check` was run against the split file before shipping.
  Every release's provenance line survives unchanged in the archive.
- **Twelve documents leave the pool (they stay in the repo):** six retired scopes
  (`SCOPE_HOUSEKEEPING_THREE`, `SCOPE_PACKAGE_CHECK_BLIND_SPOTS`, `SCOPE_STATE_SET_SELECTOR`, `SCOPE_IMPORT_HARDENING`,
  `SCOPE_TOOLING_GAPS_V572`, `SCOPE_ME_PHASEOUT_MT_CORRECTIONS`), four stop reports (v5.63, two for v5.66, v5.72), and
  the two v5.63 findings notes.
- **§G's decision check was run first, line by line.** Every open-sounding line in those twelve was read: all are closed,
  superseded status lines, or history — except two follow-ups that only the retiring
  `SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` still listed as open. **Both are re-homed** in `FlawsToFix-v5_69-Phase1.md`'s header,
  in this same package: **D-B3-1 (b)** (removing `src/main.jsx`'s `/anthropic` rewrite, deferred by the v5.70 scope) and
  the **two legacy `controls_v559`/`v560` manifest rows** that contradict the manifest's own D-3 rule.
- **`OPERATIONS.md` §G** gains the CHANGELOG-split rule. The manifest marks the twelve rows un-pooled, corrects a stale row
  that still called `SCOPE_HOUSEKEEPING_THREE.md` open, and lists the archive as repo-only.

**Space.** 12 documents (195,660 bytes) leave the pool and the pooled CHANGELOG shrinks from 695,551 to about 269,311 bytes — together about 621,900 bytes, **10.3%** of the pool's 6,027,341.
How the capacity figure is computed was not measured; the saving is an estimate in proportion to size.

**A gap found while verifying this package, not fixed here.** `package_check` confirms that every pooled file has a
manifest row, but **not** that a row marked *un-pooled* is absent from the pool: a simulated pool that still held
`SCOPE_IMPORT_HARDENING.md` stayed green (48 / 0 / 0). The twelve deletions are therefore confirmed after upload by
comparing the pool's file names with the expected 121, not by `package_check`. A check for un-pooled rows is a small
tooling item for a later ops package.

## ops 2026-09-15 (sixth) — standing audit Phases 3 and 4 (Sections D, E, F) at v5.73, and the top-five summary

KIND: ops. **v5.73 stays current**; no app source changes. **Findings only.** With the Phase 2 package, this completes a
full run of `SCOPE_STANDING_AUDIT.md` against v5.73.

- **Section D** — `MissingFeatures.md` gains a v5.73 re-pin block (every earlier item's status; D-3c and D-11's NM/RI halves
  closed) and **D-14 to D-20**: the Taxes tab's missing drawdown (priority 1, with Phase 2's C-8), Maine's age test, filing
  statuses beyond single and joint, the Additional Medicare Tax, tax-year refresh of state figures, the seven half-rate
  Social Security states, and Montana's federal-deduction base.
- **Section E** — `ARCHITECTUREIssues.md` gains **E-21 to E-28**: the Taxes and Withdrawal engines as parallel projections
  (high); the same statute implemented up to five times with fixes landing in some copies; statutory rates repeated inline
  (sites read one by one after a census that over-counted by value); tax-only border tests that cannot see a $1 edge
  error; eight missing test classes, each of which would have caught a Phase 2 finding; the version requirement only
  partly met (**the backup export carries a file-format number, not the build, and no hash appears in the app**); the
  phase-bound control harness; and stale prose.
- **Section F** — `UsabilityFlaws.md` gains a v5.73 re-pin block measured in real Chromium at three sizes across all 26
  tabs: **F-11 (high)** — every tab scrolls sideways on a 390 px phone, because the retirement selector's
  `repeat(3, 1fr)` grid cannot shrink below ≈566 px; **F-12** — on a phone the header and tab grid fill the first screen.
  F-1, F-3 and F-4 hold; **F-10 is closed** (the Field Manual now points to the UI SIZE control). The harness ships as
  `qa/tools/audit_phase4_v573/probe_ux.py` and reproduced every figure from that path.
- **Top five** — `AUDIT_TOP_FIVE_SUMMARY.md` (repo only) gains the v5.73 two-paragraph summary: C-8; phone layout;
  duplicated tax rules with partial fixes; C-3 and C-6; micro-typography.

**Limitations.** Several earlier items are marked *not re-verified* rather than assumed. The usability pass measures
layout, target size and type size; it cannot judge comprehension. One draft statement (that the manual never mentions UI
SIZE) was checked against the raw Field Manual before shipping and found false; it was corrected.

## ops 2026-09-15 (fifth) — standing audit Phase 2 (Section C) at v5.73: findings, and the probes that reproduce them

KIND: ops. **v5.73 stays current** — source `3bf1e15f1b28659aae9a78e3186d2ae8`, built `index.html`
`345ccbceb58bf74f9fbdde5db0646d1d`. No app source changes, no version bump. **Findings only — nothing is fixed here.**

**What this adds.** `docs/FlawsToFix-v5_73-Phase2.md`, the numerical-validation phase of `SCOPE_STANDING_AUDIT.md`, run
against v5.73 across six working sessions; and `qa/tools/audit_phase2_v573/`, the 18 probes every executed figure in it
came from. The probes assert nothing and are counted in no total; each was rerun from its shipped location and
reproduces the document.

**What it found** (details, figures and causes in the document's §0 and §2):
- **C-8 (high):** the Taxes tab never taxes spending withdrawals from Traditional accounts, and runs RMDs on a balance
  that was never drawn — on the shipped example household it shows $0 federal tax in 2032–2038 while the Withdrawal plan
  draws about $238,000 of Traditional money, and its lifetime RMDs are $1.63M against the plan's $1.02M. The tab
  describes itself as "your projected tax life as-is".
- **Medium:** C-3 (a surviving spouse under 65 gets the 65+ deductions through the deceased spouse's age) and C-6 (unused
  standard deduction is not applied against qualified dividends and capital gains).
- **Low to medium:** C-4 (the Roth comparator keeps the §86 error v5.45 fixed elsewhere), C-7 (a single household is paid
  spouse B's Social Security in the Withdrawal plan), C-10 (a Roth IRA under Other accounts realizes taxable gains).
- **Low:** C-1 (IRMAA top-tier comparator), C-5 (the Withdrawal tab's bracket column), C-9 (annuity RMD exclusion drifts),
  C-11 (the break-even card mislabels its measure), D-1 (METHODOLOGY's §86 passage contradicts itself).
- C-2 (IRMAA surcharges rounded to $10) is a documented limitation, not a defect.

**What passed.** Every statutory constant against its primary source; every federal bracket, LTCG, NIIT and §86 border in
the engines that compute tax; the senior bonus; IRMAA tiers and the top-tier freeze; indexation; first-spouse death;
the state module's conditioned branches. The document's §4 lists what was **not** covered.

**Limitations.** C-8's lifetime effect is estimated, not computed to the dollar. Several probes needed correcting during
the audit (a reference that omitted an RMD; a probe that did not maintain the household total; a non-discriminating
case) — each is recorded in the document, and in every case the engine was right. The standalone top-five summary the
scope requires is written only after Phase 4.

## v5.73 — Maine's pension deduction phases out as the law says; Montana taxes Social Security as it now does

Source `3bf1e15f1b28659aae9a78e3186d2ae8` · built `index.html` `345ccbceb58bf74f9fbdde5db0646d1d` · built from v5.72
`2b88134b4b1f014364262d479fb4e8a3`. `src/index.html` and `src/main.jsx` are unchanged. **Figures move for Maine and
Montana households only**; `METHODOLOGY.md` §11 gains *Maine's phaseout and Montana's corrections (v5.73)*.

**Suite: 4,115 app checks, 0 failed, 0 DIED, across both legs** — 38 app suites plus MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12 (GRAND 4,235), run from the packaged copies. From 3,954: `t39` +35, `t38`'s prior leg
+123 (v5.72 runs 206 checks where v5.71 ran 83), `t10` +3. `smoke_built` **22 passed, 0 failed**. Negative controls: `controls_v573_me_mt.py` **4 of 4**,
`controls_state_sets.py v573` **41 of 41**. Per-suite breakdown: `TESTING.md`.

### What changed, and why (every legal fact read from a primary source on 2026-09-15)

- **Maine's pension deduction now phases out above $125,000 single / $250,000 joint**, as 36 M.R.S. §5122(2)(M-3)
  requires from 2025. The deduction left after the Social Security offset shrinks in proportion to federal AGI
  and is gone at $225,000 / $350,000. Maine households above the thresholds see **more** Maine tax. The order
  is the statute's — offset first — and a test proves it: at $300,000 joint with $30,000 and $20,000 of Social
  Security the deduction is $23,216, where the reverse order would leave $4,108.
- **Montana taxes Social Security exactly as the federal return does.** Since 2024 Montana starts from federal
  taxable income (DOR Tax Simplification Hub). The model had taxed half of the federally taxable amount — the
  pre-2024 law — so it **understated** Montana tax for every household with Social Security.
- **Montana's 65+ subtraction is $5,660 for 2025** (DOR 2025 Form 2, line 6), not $5,500 — about **$9 a year less**
  tax per person 65+.
- **The Field Manual says so**, and now also says what is still approximate (below).
- **Engine:** a third condition shape, `phaseout`, which is the only one allowed to combine with a Social
  Security offset; the code now says exactly why.
- **Tests:** `t39_me_mt.mjs` (new, both legs, every cell hand-computed); `t10`'s half-rate example moves from
  Montana to Colorado; `t29` F-6 and `t35` D-7/D-8 return to "empty" now that Maine is conditioned.
- **Retired:** `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md`, written and built in this one release.

### Limitations and approximations, stated plainly

- **2025 figures throughout** — Maine's $48,216 and both thresholds, Montana's $5,660. Both states index them.
- **Maine's deduction has no age-65 test in law**, but the model applies it from 65 — pessimistic before 65.
- **Montana has two brackets**; the model keeps one flat rate. Its subtraction reduces all income in law but only
  retirement income here. The federal senior deduction (2025–2028), which lowers Montana's base, is not reflected.
- Maine's head-of-household and separate-filer thresholds, military pay and Railroad Retirement are not modelled.
- The seven remaining half-rate Social Security states have not been re-checked against current law.
- These three leads — Maine's age test, Montana's brackets, the half-rate audit — are filed in
  `FlawsToFix-v5_69-Phase1.md`.
- **A first v5.73 candidate** (source `5e5dfa81…`, built `4e013a30…`) was built before the Field Manual edit and
  was superseded before anything shipped.
- **One intermediate full run was red (4,233 passed, 2 failed)**: `t34` A-1 and A-6 asserted the v5.72 world — five
  conditioned states, and no offset row with any condition. Both now carry v573 branches that keep their strength
  (exactly six by name; only `phaseout` may sit on an offset row), and A-3 names all six. The run above is the
  clean one. `controls_state_sets.py` also needed a fix: Maine's row is multi-line in the built code, and C5m
  stopped loudly until it accepted either layout.
- The bump was priced at 90 by `vercensus`, which now counts `t33`'s `PINS` map — the entry that was missed at
  three earlier bumps was counted this time, not found by a dying suite.

## ops 2026-09-15 (fourth) — four tooling gaps from the v5.72 ship, fixed and retired in one package

KIND: ops. **v5.72 stays current** — source `2b88134b4b1f014364262d479fb4e8a3`, built `index.html`
`4f035dc5644d91476888a9fb9fdc1f5b`. No app source changes, no version bump. `SCOPE_TOOLING_GAPS_V572.md` is
written, built and retired here (its D-6); §7 is the build record.

**What changed, and why**
- **`vercensus` now counts version MAPS** (`t33`'s `PINS`), on a new "keyed registry entries (a judgement)"
  line. `t33` died on a missing map entry at v5.66, v5.70 and v5.72 because the census could not see it.
  At v5.72 the census total reads 89, not 88. `vercensus_list` shows the same sites.
- **`package_check` K-1…K-3 read the tree as the package leaves it.** A correct app-release manifest is no
  longer red before upload by construction, a stale one still is, and control P29's mutation now fires
  before upload (P57). Nothing was softened; post-upload behaviour is unchanged.
- **`package_check` G-1 accepts a handover's unshipped source** — only under `KIND: handover`, and only
  when a file in `handover/` has the same content.
- **`mk_runfolder.sh` restores the committed `package.json` and `package-lock.json`** after its single
  `npm install`, and stops if they still differ. G-1 had flagged npm's rewrite at both v5.72 checks.
- **`OPERATIONS.md`**: the registry-shapes table said the census missed three shapes; measured, it missed
  one (the map). Corrected. The K-1…K-3 paragraphs describe the new behaviour.

**Verified by** the full suite on a run folder built by the new `mk_runfolder.sh` — **3,954 app checks, 0 failed, 0
DIED, parity 10/10; tooling `t21` 64 (was 56), `domdiff` 32, `sets` 11 + 12; GRAND 4,073** — and one negative
control per fix: the old `vercensus` turns `t21` red on both map cases and the summary (61/3); the old
`package_check` reds K-1…K-3 on the correct v5.72 package against the prior clone, and `P57` catches a stale
manifest there; `P59`/`P60` catch a drifted workbench and a non-handover kind; `mk_runfolder.sh` without its
copy-back leaves both files different from the repo. `package_check_controls.sh`, run in both phases: 54
controls behaved as designed in each, and each run's single miss was the other phase's control.

**Found, and recorded rather than fixed.** `package_check_controls.sh` is phase-bound: `P17` fires only
against the pre-upload tree and `P48` only against the post-upload one, so every single run reports one
miss. Run in both phases, every control fired in at least one. `OPERATIONS.md` now says to run it twice.

**Limitations.** The census still decides nothing — every counted site, including each map entry, is a
judgement. `P56`–`P61` skip unless `PRIOR_CLONE` and `HANDOVER_PKG` are set.

## v5.72 — a bad backup can no longer damage the plan you have; Maine joins the income-limited list

Source `2b88134b4b1f014364262d479fb4e8a3` · built `index.html` `4f035dc5644d91476888a9fb9fdc1f5b` · built from v5.71
`9e79b92f9eb91e86489cb6b80caa33c3`. `src/index.html` and `src/main.jsx` are unchanged. The v5.71 build was first
rebuilt from its own source and reproduced `e1bd283b638cdab74941804708987bb2` byte-identically, so the scaffold
is complete. **No engine, tax or state figure changes for any plan entered through the app's own forms**;
`METHODOLOGY.md` gains a §11 paragraph because a *restored* plan carrying an impossible value can now come out
differently (below). MC parity stays 10/10.

**Suite: 3,954 app checks, 0 failing, 0 DIED, across both legs** — 37 app suites plus MC parity 10/10; tooling `t21` 56,
`domdiff` 32 and `sets` 11 + 12 counted separately (GRAND 4,065), run from the packaged copies. The app total rises
from 3,647 by **+289** (`t38`, 83 + 206), **+17** and **+1** because the prior leg is now v5.71 (`t37` 43 not 26, `t5`
59 not 58); every other suite is unchanged on both legs. `smoke_built` **22 passed, 0
failed** on the built artifact. Negative controls: `controls_v572_import.py` **14 of 14 fired, plus V1** (a render error with the boundary present still turns
`t4` and `t9` red), watched files unchanged, and
`controls_state_sets.py v572` **41 of 41**. Per-suite breakdown: `TESTING.md`.

### What changed, and why

- **A malformed backup no longer replaces your plan before anything checks it** (audit finding A-4). Through
  v5.71 the load routine installed the incoming plan first and threw part-way through its fixes, so memory held a
  half-applied plan. It now checks the plan's shape first, and if loading still fails it puts back everything it
  touched. This covers all eight load paths, **page load included** — where a saved plan the app could not use
  used to leave the bad plan in memory and let *Start Fresh* overwrite the saved copy without asking. Now the
  landing screen says why it is showing, and Start Fresh asks.
- **Both restore paths say the same plain thing when a file is refused**: *"That file couldn't be restored. Your
  saved plan was not changed."* The landing screen used to show a raw engine error; My Data showed nothing,
  because the import was not awaited. **A refused file no longer costs you unsaved My Data edits** — they used to
  be discarded before the file was even read.
- **A skin name such as `constructor` no longer blanks the page** (A-5). The three places a skin name is accepted
  now require a real skin.
- **A rendering failure shows a message and a Reload button instead of a blank page.** It offers nothing that
  deletes data.
- **Backups are bounded** (A-2): more than 500 rows in any list, or more than 5 MB, and the file is refused whole
  — never cut down. The caps were chosen by measurement (`SCOPE_IMPORT_HARDENING.md` §3a).
- **Out-of-range values are pulled into range and listed on My Data**: Social Security claim age (62–70),
  income-stream years, and birth dates. **The v5.9.1 birth-year limit had never worked** — it read a number out of a
  field the app stores as text — so a backup could put birth year 9999 into the timeline. The earlier retirement-year
  and life-expectancy limits were silent; they are now reported too.
- **The Field Manual says all of this up front**, in a new note, *"What a restore accepts."*
- **Maine is on the suite's income-limited-in-law list** (`SCOPE_STATE_SET_SELECTOR` stage 2). Six `STATE_RULES`
  rows now carry `incomeLimitedInLaw`; the suite reads its list from that data. Nothing in the app reads the field,
  so no figure moves. Maine's phaseout is still not modelled, as its note and METHODOLOGY already say; `t29` F-6 and
  `t35` D-8 are non-empty guards again until it is.
- **Two scopes retire**: `SCOPE_IMPORT_HARDENING.md` and `SCOPE_STATE_SET_SELECTOR.md`, both with build records,
  and both leave `package_check`'s OPEN allowlist in this package.

### Found and fixed in the build itself

- **The suite runner's total read green while a suite was dead.** `runsuite.sh` printed `DIED` for the suite but
  tallied it as 0 passed / 0 failed, so the GRAND line said "0 failed". Found when `t33` died on v572 (below). A death
  now counts as a failure and the GRAND line names it; a negative control shows the old form reading green.
- **`t33`'s version-keyed `PINS` registry was missed for the third time** (v5.66, v5.70, v5.72). `vercensus.cjs`
  and this release's bump transform both see only string-literal tags, and `PINS` uses identifier keys. The suite
  failed closed, the entry was added by hand, and an AST sweep found no other registry of that shape. ⚠ **Teaching
  `vercensus.cjs` to count identifier-keyed registries is not done here** — it is owed.
- **A first v5.72 candidate was built and quoted before the Field Manual note was added** (source `8a75a392…`,
  built `740d3e7f…`). It was superseded before anything shipped and must not be confused with this build.

### Limitations and approximations, stated plainly

- The caps and timings were measured in jsdom, not a browser.
- The test suite cannot observe the Reload button's navigation; it asserts only that pressing it changes no data.
- The income-limited list is still set **by hand** from the statutes; the phrase-based drift guard cannot see a note
  that describes an income limit in other words, which is how Maine was missed.
- Montana's 65+ subtraction may be indexed ($5,660 vs the app's $5,500 for 2025) — an **unverified** lead, filed in
  `FlawsToFix-v5_69-Phase1.md`, not acted on.
- `package_check` G-1 does not recognise a `handover/` folder; the session-1 handover recorded that as a tooling gap.

## ops 2026-09-15 (third) — handover: import hardening session 1, built as a workbench; the birth-year clamp was never live

KIND: handover. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No version bump, no rebuild, no rotation, no app change shipped.** The
workbench source (`e819493421b0283965de7b06f497af43`) travels in the handover zip only.

**What was built** (`SCOPE_IMPORT_HARDENING.md` §9): a malformed plan is checked before it replaces the live
one, and any failure part-way restores everything (H-1, both halves); the My Data import waits for its result
and both restore paths say *"That file couldn't be restored. Your saved plan was not changed."* (H-2); skin
names must be real skins at all three gates and in `skinVars` (H-3); a top-level error boundary replaces the
blank page, with a Reload button and no data control (H-4); backups over 500 rows in any list or 5 MB are
rejected, never truncated (H-5, measured — §3a); stream years and Social Security claim ages are clamped, and
every adjustment, including the old silent ones, is shown on My Data (H-6).

**Found while building.** A stored plan the app cannot load left it on the landing screen with the bad plan in
memory, and Start Fresh then overwrote the stored copy without asking — the scope had traced this, the build
ran it. **The v5.9.1 birth-year clamp has never fired** — birth dates are stored as strings and the clamp reads
`.year` — so that half of H-6 is **stopped, not adapted**, as new decision **D-10**.

**Verified by** `t38` from the packaged copy — **v571 83/0** (every defect pinned) and **v572 184/0**; the full
suite with the workbench as the current leg and both legs rebuilt with the new shim — **app 3,647 · tooling 108
· GRAND 3,755 · 0 failing · parity 10/10**, identical to the unmodified baseline; `controls_v572_import.py` —
**13 of 13 reversions fired**, plus **V1** (a render error with the boundary present still turns `t4` and `t9`
red); and a §B1a AST pass showing no existing assertion reads the removed wording. The first V1 verdict was
wrong because of the control's predicate, not the app; that is recorded in the stop report.

**Limitations.** Not a release: nothing here is live. `t38` is not yet in `runsuite.sh`, so no runner total
includes it. jsdom cannot observe the Reload navigation. D-4 timings are jsdom's. The post-ship
`package_check` for the scope package was not run (its zip was not in the session). One behaviour change
goes beyond the scope's letter and is flagged for the maintainer: an unsaved My Data draft now survives a
rejected import.

## ops 2026-09-15 (second) — the import-hardening scope: A-2, A-4, A-5 still reproduce at v5.71, and Maine is missing from the in-law list

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No app source change, no version bump, no rebuild, no suite change.**
Writes **`docs/SCOPE_IMPORT_HARDENING.md`** for **v5.72** and registers it on `package_check`'s I-2 OPEN
allowlist. **Nothing is built.** **All nine decisions were taken the same day: the maintainer approved every
recommendation**, so the scope is buildable in the two sessions D-6 sets out.

**Verified by** re-running `probe_import_hostile.mjs` against v5.71 on both import paths; `funcmap.cjs`,
`census.cjs` and `vercensus.cjs` on the v5.71 source and suite; primary-source reads for Maine and Montana;
`package_check` pre-ship; and a targeted control on the allowlist edit (below). **The app suite was not
re-run**: no file it reads changed.

### What the scope establishes

- **All three findings still reproduce at v5.71**, and the valid-backup positive control imports on both paths.
  - **A-4.** On My Data a malformed backup shows no message, leaves an unobserved rejection, and leaves memory
    holding the bad plan. The landing path shows a raw engine error and also leaves memory replaced.
  - **A-5.** `skin: "constructor"` empties the page (0 tabs) on both paths.
  - **A-2.** 20,000 holdings exhaust the harness heap on both paths. This is a jsdom measurement, not a browser one.
- **Two things the v5.69 audit did not have.**
  - There are **three** truthy skin gates, not two. The third is the page-load read of the stored skin. `skinVars`'s
    fallback carries the same defect.
  - The replace-before-validate ordering sits in `applyLoadedData`, which has **eight** callers, so the fix
    reaches every load path.
- **Stage 2 of `SCOPE_STATE_SET_SELECTOR` is folded into the same release.** `vercensus.cjs` still prices the bump
  at **86 judgement points**. Run with no directory arguments it prints 0, which is a vacuous zero.

### ⚠ Maine is income-limited in law, and the suite's in-law list does not have it

- **The law.** Maine Revenue Services' summary of 2025 enacted legislation: from TY2025 the pension income deduction
  phases out above federal AGI of $125,000 single / $187,500 HoH / $250,000 MFJ (36 M.R.S. §5122(2)(M-3), P.L. 2025,
  c. 388, Pt. H).
- **The model.** v5.71 applies Maine's $48,216 deduction with no income condition. That is optimistic above the
  threshold, and the in-app note discloses it.
- **What this makes false.** The stage-1 package shipped earlier today called its list "the five statutes" and
  its unconverted set empty. Both are true of the list, not of the law. Recorded in `SCOPE_STATE_SET_SELECTOR.md`
  §9. **The list is not edited here:** adding Maine turns `t29` F-6 and `t35` D-8 red. D-8 decided that Maine joins
  the list, re-inverting both guards, in the v5.72 release that builds stage 2.
- **What could not see it.** The stage-1 drift guard missed Maine because its note does not use the phrase. That was
  a limitation the stage-1 package disclosed; this is its first concrete instance.
- **Not read:** the phaseout rate.
- **Montana was checked and is correctly outside the list** (MCA 15-30-2120, no income test). A **secondary**
  source says its $5,500 subtraction is indexed to $5,660 for 2025. That is recorded as an unverified lead, out of
  scope.

### An error of mine, recorded

My first tabulation of the probe output read the landing path as leaving memory intact. The script had parsed the
memory line printed **before** the import. The raw output shows the plan replaced afterwards, as the audit said.
Corrected before anything was written.

### The allowlist edit, and how it was checked

`package_check.mjs` gains one I-2 entry. `package_check_controls.sh` was **not** run: it needs an app-release package
directory, which an ops session does not have. A targeted control was run instead:
- with the entry, `I-2` and `I-3` are green;
- with the entry removed, `I-2` fires naming `SCOPE_IMPORT_HARDENING.md`.

### Files

Repo: `docs/SCOPE_IMPORT_HARDENING.md` (new), `docs/SCOPE_STATE_SET_SELECTOR.md` (§9),
`docs/FlawsToFix-v5_69-Phase1.md` (a pointer), `qa/tools/package_check.mjs`, `PROJECT_KNOWLEDGE_INDEX.md`,
`CHANGELOG.md`. All of them also go to the pool.
- `FlawsToFix-v5_69-Phase1.md` joins the pool while the scope is open, per that document's own item 4.
- The pool goes 123 → 125.

Source md5 `9e79b92f9eb91e86489cb6b80caa33c3` · built `index.html` md5 `e1bd283b638cdab74941804708987bb2` — both
unchanged.

## ops 2026-09-15 — SCOPE_STATE_SET_SELECTOR stage 1: one shared state set, and a probe that had been reporting the complement of its gate

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No app source change, no version bump, no rebuild, no `smoke_built`
re-run.** Builds **stage 1** of `docs/SCOPE_STATE_SET_SELECTOR.md` (its §7.6/§7.7, decided 2026-09-14).
**The scope stays OPEN** and stays on `package_check`'s I-2 allowlist: stage 2, the `incomeLimitedInLaw`
field on five `STATE_RULES` rows, is owed to the next release that bumps the version for another reason.

**Verified by the full suite, both legs, run from the packaged copies.** **APP total UNCHANGED at 3,647,
0 failing**, summed from `runsuite.sh` output across 58 lines — although `t10`, `t29` and `t35` were all
edited, each holds its count on both legs (`t10` 354 · `t29` 60 · `t35` 114). MC parity 10/10. Tooling:
`t21` 56 · `domdiff` 32 · **`sets` 10 + 10 (new)** — **GRAND 3,755, 0 failing**. The baseline was
re-run on the unmodified clone first, this session: 3,647 app, `t21` 56, `domdiff` 32.

### What changed, and why

Three places in the suite decided which states are income-limited **in law** by executing a regex against
each row's user-facing note, and six more kept their own verbatim copy of that regex. A correction to one
copy left the others wrong — and the scope's own census showed that happening to the instrument built to
watch for it.

- **`qa/tools/state_sets.cjs` (new)** — the five-state in-law list (CT, NJ, NM, RI, VA, from
  `FINDINGS-v5_63-state-statutes.md`), the one phrase matcher, one `exclTest` predicate, and the helpers.
- **`t29` F-6 and `t35` D-7 now take membership from that list**, not from prose. Checked first against
  every source from **v5.64 to v5.71** (older ones recovered from git history): old and new selectors give
  identical sets on every leg, so every gated arm in both suites still holds.
- **The two selectors now share one predicate.** `t29` read `!r.exclTest` and `t35` read
  `exclTest === undefined`; they agreed only because no row carried `null` or `false`.
- **The six phrase PINS were not converted** — `t35` D-7a–D-7d and `t10`'s two `[BY DECISION v5.59]`
  checks. For them, executing the phrase against the note *is* the assertion (a state must not leave the
  set by being reworded — the v5.54 New Jersey defect). They now execute the shared matcher.
- ⚠ **`qa/tools/f6_probe.cjs` repaired — it had reported the COMPLEMENT of the gate since v5.68.** Against
  v5.71 it printed `NM, RI, VA` while `t29` F-6 was empty; reproduced on both legs before the fix. The
  scope named a missing `!exclTest`. **That was half of it:** the probe's AST reader kept only literal
  values, so `exclTest` — an object — was never recorded at all, and adding the predicate alone would have
  changed nothing. The reader now records a non-literal value, and the selection is the shared one.

### Where the new checks went — and a false header they exposed

⚠ **`t29_boundaries.mjs`'s header said "COUNTED IN NO APP TOTAL — this is tooling". That was false.**
`runsuite.sh` has tallied `t29` in the app section since v5.49, and `TESTING.md` lists it at 60 per leg
inside 3,647. Corrected here. It is also why §7.7's new checks are not in `t29` or `t35`: there they would
have moved the app figure. They live in **`qa/state_sets_check.mjs`**, a TOOLING suite under
`runsuite.sh`'s TOOLING heading — **10 checks per leg, no version ladder** (nothing in it differs by leg,
so it adds nothing to the 86-point bump cost `vercensus.cjs` measured):

- S-1 to S-3: the list is exactly the five, each is a `STATE_RULES` key, and the derived sets can only
  name list members.
- **S-4: the drift guard** — no state outside the list carries a non-zero `excl65` with a note saying
  "income-limited".
- **S-5/S-6: `f6_probe` agrees with `t29` F-6 on the same leg's source.** This is the regression test for
  the inverted probe.
- S-7: the shared predicate.
- S-8, by AST: the phrase pattern exists as a literal in exactly one file, and the six pins still execute it.

The scope's test 2 (*the unconverted set is empty, gated per leg*) is carried by `t29` F-6/F-6a/F-6b and
`t35` D-7/D-8, which were already gated at v5.69 and are now fed by the list. It is not duplicated.

### Negative controls — `qa/tools/controls_state_sets.py`, 38 of 38 as expected on each leg

Run from the packaged run folder; the md5s of every file the controls mutate were printed before and after
and did not change. Python with no shebang, so no new file needs the executable bit.

- **Each converted site is sabotaged alone** — re-pointed at its own copy of the module with WI added to
  the list — while the other sites run in the same folder against the pristine module and stay green. C1
  fires only `t29` F-6/F-6a/F-6b; C2 only `t35` D-7/D-8; C3 only S-5.
- **C4 restores the probe's literal-only reader, and S-5 fires.**
- C5 drops RI from the list (S-1 and S-4 fire); C6 restores `t35`'s old predicate (S-7 fires).
- **C7 makes the matcher never match: the selectors stay GREEN while all four `t35` pins and `t10`'s RI
  pin fire** — the control that shows the selectors no longer read prose.
- C8–C12 reword one note each in a throwaway copy of the built module: each fires exactly its own pin
  (C12, where WI's note gains the phrase, also fires the drift guard), and `t29` F-6 never moves.
- **Three first-run misses were adjudicated by reading, not by editing until green.** In C1/C2 the
  sabotaged module is itself a second copy of the pattern, so S-8a fired correctly; the expectation now
  names it. In C7, S-8a counts copies of the module's *own* pattern and cannot see a changed one; the
  pattern's content is guarded by the pins, which C7 shows firing.

### Limitations, disclosed

- **The drift guard is phrase-based.** A note describing an income limit in other words is invisible to
  it. Maine's note mentions an unmodelled phaseout and Montana's says "income-based"; neither is flagged,
  and **whether either is an in-law income limit was not checked against statute** in this package.
- **A shrunk list is invisible to the converted sites** while every in-law row is conditioned. S-1 and
  the drift guard catch NM, RI or VA leaving; **nothing catches CT or NJ leaving**, because both carry
  `excl65 = 0`.
- **`sel_census.cjs` counts regex literals, so it now reports 2 sites**, not 10: the shared module and the
  out-of-scope `t35` Field Manual copy lock. The six pins no longer appear in its output; S-8 witnesses them.
- The in-law list is still hand-maintained. Stage 2 retires it.
- An own error, recorded: a modified `t29` was briefly copied into the *baseline* run folder while the
  baseline suite was running. It was reverted (confirmed with `cmp`) before that suite reached `t29`.

### Files

Repo: `qa/tools/state_sets.cjs` (new), `qa/state_sets_check.mjs` (new), `qa/tools/controls_state_sets.py`
(new), `qa/t10_taxcases.mjs`, `qa/t29_boundaries.mjs`, `qa/t35_state_populate.mjs`, `qa/runsuite.sh`,
`qa/tools/f6_probe.cjs`, `docs/OPERATIONS.md` (§B1a), `docs/SCOPE_STATE_SET_SELECTOR.md` (status line and
§8), `TESTING.md`, `PROJECT_KNOWLEDGE_INDEX.md`, `CHANGELOG.md`. Everything except `f6_probe.cjs` also goes
to the pool, which goes 120 → 123. Source md5 `9e79b92f9eb91e86489cb6b80caa33c3` · built `index.html` md5
`e1bd283b638cdab74941804708987bb2` — both unchanged.

## ops 2026-09-14 (third) — `t21` Section F: Item B closes on disclosure and one pin, because the fixture cannot reach the tools

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`. **No app source change,
no version bump, no rebuild, no `smoke_built` re-run.** Builds **Item B of
`SCOPE_HOUSEKEEPING_THREE.md`**, the last of its three items, and **retires the scope** — removing its
`package_check` **I-2 OPEN allowlist** entry in the same package, as I-2 requires.

**Verified by the full suite, both legs, run from the packaged copies.** `t21` **50 → 56**;
`domdiff` 32; **GRAND 3,735, 0 failing**; MC parity 10/10. ⚠ **The APP total is UNCHANGED at 3,647,
and that is the assertion, not a coincidence** — `t21` is tooling and counted separately, so its rise
must not move the app figure; a moved app figure would mean the package touched more than it claims.
Both totals summed from `runsuite.sh` output across 58 suite legs, not derived by subtracting tooling
from GRAND.

### ⚠ What Item B asked for, and why it did not ship

The item asked for `t21` coverage of the parser tools `t21` does not reach. **Re-measured by AST it is
TWELVE tools, not the three §2 named or the nine its 2026-09-07 banner corrected them to** — three more
have been added since (`census_p1.cjs`, `lits_p1.cjs`, `sel_census.cjs`). `qa/tools/` holds **sixteen**
tools that parse with `acorn`; `t21` covers **four**.

**None of the twelve is reachable by `qa/tools/fixture/fixture.jsx`.** Eight need a directory fixture.
Three need a `STATE_RULES` table — `f6_probe.cjs` and `state_rows.cjs` **exit 1** without one, and
`notes_probe.cjs` runs, reports `0 regex literals` and `OLD: undefined / NEW: undefined`, which is
worse because it would pass vacuously.

⚠ **The twelfth is the finding, and it overturned the plan this package started from.**
`census_p1.cjs` takes a single `.jsx` and walks it generally, so it passes the argument-shape test —
and it **answers ZERO to all fifteen of its questions** on this fixture, which holds no storage call,
no network primitive, no HTML sink, no `href` and no `JSON.parse`. A copy sabotaged in two places (the
storage-method list cut to one entry, the whole `spec.any` member-property branch disabled) produces
**byte-identical output**. Any case written about those questions would have stayed green on a working
tool, a broken one, and a tool replaced by `console.log` of fifteen zeros.

⚠ **Sharpest form:** `census_p1`'s own header records a defect corrected 2026-09-11 — `key` sat in the
storage-method list, so sixteen React `.key` reads were counted as storage calls. The fixture contains
no `.key` read. **It cannot catch the regression of the defect that tool has already had.**

**So `D-2` was re-asked on the evidence rather than answered a third time from a corrected premise.**
Its original answer was *build it*, with an explicit escape: *stop and report rather than writing thin
cases to reach a number.* That escape was reached twice — 2026-09-07 for the directory fixture,
2026-09-14 for the content gap. **Disclosure plus one honest pin is the answer, and the item closes
rather than staying open a fourth time.**

### What shipped

**`t21` Section F — six checks (50 → 56), and its own header says it is NOT coverage.** One
`[EXTINCTION 2026-09-11]` pin on the `wc -l` correction (reverting it turns `75 lines` into
`76 lines`); three checks that the tool runs rather than bailing and that its self-check is inert off
`DangerClose.jsx`; and a **disclosure guard** asserting all fifteen questions answer zero. The guard
is the one that earns its place: if the fixture ever gains surface content it goes **RED** and forces
the disclosure to be rewritten instead of quietly going stale. That is the opposite polarity to §B2's
stale-disclosure lock — it fires when the disclosure becomes false rather than holding it in place.

**Negative controls — `qa/tools/controls_t21_censusp1.sh`, 6 fired, 0 silent.** Five mutants; C2 turns
two checks red. **C5 runs in the opposite direction from the rest**, adding a storage call to the
fixture and requiring the guard to go red, because a gap-assertion that cannot be falsified is exactly
the vacuous pass this section exists to avoid. Every mutant is written to a throwaway copy from a
pristine read and both canonical files are md5-verified byte-identical before and after — the v5.66
lesson, where a control run died mid-mutation and poisoned the baseline.

**`TESTING.md` names all twelve uncovered tools with the reason each is out**, split into the eight
needing a directory fixture, the three needing a `STATE_RULES` table, and the one needing surface
content. The scope's own line is that *"a suite that says what it does not cover is worth more than one
that appears to cover everything"*; at twelve it is more true than at nine.

⚠ **`package_check.mjs`, `package_check_controls.sh` and `row_census.cjs` appear in `t21` zero times
and that is CORRECT, not a gap** — none parses with `acorn`, so none falls inside §B1's warrant, and
`package_check` is verified by its own `P1`–`P55`. Recorded in `TESTING.md` because the zero-mention
reading is alarming and wrong, and a grep reaches the alarming version first.

### Three documents were wrong, and the third had never been rolled at all

- **`OPERATIONS.md` §B1 said `t21` was 49 checks** where `TESTING.md` said 50 — a **third** copy of a
  drift `TESTING.md`'s own parenthetical already records (*"this sentence read 49 while the sentence
  below it read 50, for eleven releases"*). Nobody had ever rolled it. Both now read 56.
- **`TESTING.md`'s "Current build" sentence went stale AGAIN at the v5.71 ship** — still reading
  v5.70 / 3,576 / 3,658 on 2026-09-14, the second time in four releases, with the checklist line that
  is supposed to roll it alongside the tally not doing so. Rolled from suite output.
- **§B1's warrant was overstated by twelve tools.** It sells an unexpected tool result as a finding on
  its own provided `t21` is green; that reaches four tools of sixteen. §B1 now says so and points at
  `TESTING.md`'s list rather than carrying a second copy of it.

### Limitations, stated rather than implied

- **This is not coverage of `census_p1.cjs`.** Fifteen of its questions remain unasserted and the
  package says so in the suite file, in `TESTING.md`, in `OPERATIONS.md` §B1 and here.
- **Eleven of the twelve tools gain nothing but a disclosure row.** Their outputs still have no
  standing under §B1 and remain a reason to hand-check.
- **The fixture-design work is deferred to its own scope**, with its requirements recorded in the
  scope's §7 so they are not re-derived: for `f6_probe`, entries satisfying **both** conjuncts of the
  F-6 predicate, decoys failing **each** conjunct separately, **a key literally named `VA`** (line 40
  does `R2.VA.note = cand` and throws without it), and the two secondary matchers in both polarities.
- **`J-5` is not exercised by this package** — it removes nothing from the pool, so there is no
  `RETIRE:` line, and none was invented to exercise it.
- ⚠ **`qa/tools/controls_t21_censusp1.sh` is a NEW shell script.** A drag-and-drop upload lands it
  `100644` and `G-3a` will fire; edit in place and check `git ls-files -s`.

## ops 2026-09-14 (second) — housekeeping after the pool pruning: three ghost rows and one rescued question

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`. **No app source change,
no version bump, no rebuild, no suite-affecting change.** Corrective, following the removal of sixteen
retired scopes from the project-knowledge pool (~348K recovered; the repo copies remain at `docs/`).

### `K-8` — three manifest rows naming files that are no longer pooled

Removing a document from the pool is two of §G's three places. The third — its manifest row — was not
done, and `K-8` went red post-ship naming `SCOPE_STATE_FIXTURES.md`, `SCOPE_VA_NOTE_CORRECTION.md` and
`SCOPE_EXCL65_STALE_RI_WI.md`. **Only three of the sixteen carried a hashed row**; the other thirteen are
described in prose columns that `K-8` does not read, so they never fired. Those three rows now read
**un-pooled 2026-09-14, repo-only** in place of an md5. `K-9` was unaffected throughout — it asks that
every *pool* file be named, and these are no longer pool files.

⚠ **Un-pooling is not deleting, and the distinction is what made this safe.** §G's three-place rule and
its pre-deletion check exist because deletion destroys the only copy of an open decision. Here every
document remains in the repo at `docs/`, so nothing was destroyed — but see below for what was still lost.

### ⚠ `MissingFeatures.md` D-13 — a question that became invisible without being answered

`SCOPE_INCOME_CONDITIONING.md` retired FULFILLED at v5.69 with all seven decisions resolved. **One §2.4
item did not close with it**: *"how often any threshold binds"* — whether each state income threshold
actually binds for the households this app models, which its §6 notes cannot be measured from the
existing fixtures, because `households.mjs` holds boundary variants of **one** household and the engines
compute no AGI-like state income at all.

When that scope left the pool, the question left with it. A check afterwards found it **no longer
reachable from the pool by any path**, and every session works from the pool. It is re-homed here as
**D-13**, stated in full, with the fixture limitation intact.

⚠ **This is the second instance of a recorded shape and it is named as such.** On 2026-08-26
`SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` was deleted after confirming what it *built* survived, and took an
open maintainer decision with it — recovered from git history and re-homed as **D-10**. §G's *"check for
unresolved DECISIONS, not just built outcomes"* was written from that incident. **The rule was not
broken here; it was applied late.** The re-homing was identified alongside the file list, but the list
was the actionable half and was acted on first. **Anything that removes a document from the pool should
carry its re-homing in the same package.**

*(Virginia's married-couple taper endpoint, the other open question in that set, survives independently
in `AUDIT_STATE_EXCL65_ROUND3.md` and needed no re-homing. Verified, not assumed.)*

### Disclosed

- **`J-5` was deliberately NOT used.** The deletions had already happened, so a `RETIRE:` declaration
  would document history rather than verify an action — and the gate's first real use should not be a
  rubber stamp. It remains available for the next pool removal, which is where it earns its keep.
- ⚠ **`G-3a` is still RED and this package does not close it.** The four
  `git update-index --chmod=+x` commands from the preceding package have not been run:
  `controls_manifest_rows.py`, `controls_v566_nm.py`, `controls_v568_va.py`, `oracle_ri.py`. They are
  restated in `COMMIT_MESSAGE.txt`. A mode cannot be shipped as a file.
- **The thirteen prose-column rows were left as they are.** They already describe each scope's status
  and repo path; rewriting thirteen rows to say "un-pooled" would be churn no gate reads.
- Still open and untouched: **A-2, A-4, A-5** (in `FlawsToFix-v5_69-Phase1.md`), `E-1b`'s matcher,
  `SCOPE_STATE_SET_SELECTOR.md`, Item B of `SCOPE_HOUSEKEEPING_THREE.md`, `D-B3-1 (b)`, and the two
  legacy `controls_v559`/`v560` manifest rows.


## ops 2026-09-14 — the three things `package_check` could not see, because they are not file contents

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No app source change, no version bump, no rebuild.** Builds
`docs/SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md`, which ships **RETIRED with a §7 build record** — all six of
its decisions were answered before building, so it never needed an `I-2` OPEN-allowlist entry.

Three gates, each for a defect that was invisible to every check in the tool for the same structural
reason: `md5` is content-only, and `statSync` was used for `isDirectory()` and `.size` and nothing else.

### `D-3` — a file committed at an EXTRA path

`D-1` asks whether every packaged file **landed**. It cannot ask whether one landed **twice**: in that
case every packaged file did land, `changed` is 0, and `D-1` passes clean. That is the v5.68 shape —
six `qa/qa-baseline/` files committed at the repo root as well as their real paths — which only the §F
clone diff saw, and which also switched `E-1b` off for those six names for as long as the copies stood.

⚠ **The deferral reason for this gate was wrong, and it cost a release.** §C recorded it as unscoped
because *"a first census ran to 68 candidates of which 64 were false positives"*. **That census matched
BASENAMES**, and `index.html` and `README.md` are multi-path by design. Asking instead which tracked
paths hold **byte-identical content** — which is what the v5.68 defect actually was — measures **0
groups** on the clean tree and **5** when five `qa-baseline` files are re-committed at the root.
Zero false positives, five true ones. Verified before building: the shipped tool named the duplicate
**nowhere**; `D-3` names it exactly. §C is corrected in this package.

### `G-3` — file modes, and the green run that over-reported a ship

The preceding ops package scored **45 passed, 0 failed** against a tree where `F-4` — one of the five
fixes it named — had **not** been applied. The gate was not wrong; a mode was invisible to it.

**The rule: a tracked file with a shebang carries the executable bit.** Measured across 340 tracked
files — reverse direction **0 counterexamples**, forward direction **4**. ⚠ This **supersedes** the
preceding package's decision D-4, which left the seven `.py` files at `100644` on the grounds that *"no
document claims the `.py` files are directly executable"* — **four of them make that claim in their own
first line**. Superseded on measurement, not overruled on taste: the three without a shebang are
correctly left alone, and `P53` exists to keep them that way.

⚠ **`G-3a` SHIPS RED, naming those four files, and that is construction rather than defect.** A mode
cannot be shipped as a packaged file: the content does not change, so `D-1` would fire on it as
`unchanged`, and §L records that replacing a tracked file **preserves** its mode. They are
`git update-index --chmod=+x` lines in `COMMIT_MESSAGE.txt`. **`G-3` turning green after those four
commands is the first confirmation this project has ever had that a mode landed.** §I carries this.

### `J-5` — a file that should have LEFT the pool (F-2, deferred twice)

`J-1`–`J-4` assert presence and rotation; nothing asserted **absence**, so a document retired from the
repo could sit in the pool indefinitely. §G calls deletion a three-place operation and the third place
had no gate. A package now declares a retirement with a **`RETIRE:` line in `MANIFEST.txt`** — not the
README delete-first list, which means *"delete then re-upload"* where this means *"delete and do not
replace"*, and one name doing two jobs is how the `index.html` confusion started. `J-5` is phase-split:
pre-ship it asserts the name is still **in** the pool so a typo cannot pass as a success, post-ship that
it is **gone**.

### `E-1b`'s silent skip is now loud

`E-1b` skips any basename matching more than one repo path. It was silent, and at v5.68 that silence
switched the gate off for six files for a whole release with nothing printed. It now prints what it did
not evaluate — today `README.md` and `index.html`, both multi-path by design. **Repairing the matcher is
deliberately left to its own scope**: it is a real change to a gate that has no controls of its own.

### Controls — P50–P55, three pairs

⚠ **All three gates have a zero baseline, so each ships as a pair.** A gate that can never fire and a
gate that has been deleted are indistinguishable from their green runs alone. The silent halves (`P51`
multi-path by design, `P53` shebang-less files, `P55` a retirement honoured) are what prove the loud
halves discriminate.

Two control-design faults, both found by the controls themselves and both recorded rather than tidied:
the baseline guard had to become **per-needle rather than per-gate**, because guarding on the gate made
four controls unrunnable for exactly as long as the defect they guard existed; and `P53`'s needle
matched **`K-8`**, an unrelated gate that lists every pool file by name — the `P32` shape precisely.

### Disclosed

Verified by the full app suite from the packaged copies, both legs — figures in the run below. The
`.github/` issue templates and discussion posts added at `b2b76cf` are untouched. Still open: `E-1b`'s
matcher, a served-bytes check for §H, **A-2, A-4, A-5**, `SCOPE_STATE_SET_SELECTOR.md`, item B of
`SCOPE_HOUSEKEEPING_THREE.md`, `D-B3-1 (b)`, and the two legacy `controls_v559`/`v560` manifest rows.


## ops 2026-09-14 — the release gates that did not fire: D-1's completeness complement, B-2's name match

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No app source change, no version bump, no rebuild.** Verified by the
full app suite from the packaged copies, both legs: **3,647 app checks, 0 failing** (`t21` 50 and `domdiff`
32 are tooling; GRAND 3,729) — unmoved, which is what an ops package owes. Builds
`docs/SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md`, now RETIRED with a §10 build record.

### D-1 — the gate that watched 17 files not arrive

At the v5.71 ship, 17 files were uploaded to the repo **root** instead of `qa/`, leaving a `qa/` tree that
could not test its own release. `package_check` scored 44 passed, 2 failed with **both failures documented
as expected**, and named none of it. D-1 asserted `unchanged.length === 0` — the correct **pre-ship**
question — while §I told a reader to expect `D-1` red post-ship, so a broken upload produced exactly the
reading a correct one was supposed to.

D-1 is now **phase-split**. Post-ship it asserts the mirror: every packaged file **landed**
(`changed.length === 0`, and the count equals `ghFiles.length` so a truncated `github/` cannot pass). The
number was already computed and already printed as an informational line; it is now a check. Reproduced
before the fix was written — with the `qa/` paths present but holding prior-release bytes, D-1 and D-2 both
passed green while 20 files had not landed.

The phase is **inferred, never flagged**: the oracle is `J-1`/`J-2` both green. Not `K-2`, which was the
first proposal — an ops package changes no source, so `K-2` is true in both phases for one, and this
package is itself `KIND: ops`. **`PHASE: UNKNOWN` is a real third state and is printed**, never silently
defaulted: no pool argument, no `knowledge/` half, or an *empty* `knowledge/` whose J checks would be green
over an empty set.

⚠ **What it does not catch, stated rather than implied.** The completeness check sees a packaged file that
did **not land at its path**. It does **not** see an **extra** copy committed elsewhere — the v5.68 shape —
because there every packaged file did land, `changed` is 0, and it passes clean. The §F clone diff remains
the only thing in the release path that sees an extra path. A gate for that is **deliberately deferred to
its own scope** (decision D-7): it needs a rule for what "outside the package" legitimately means, and a
first census of it ran to 68 candidates of which **64 were false positives**. `OPERATIONS.md` §C now records
the shape **three-deep** (v5.52, v5.68, v5.71) instead of two-deep with the worst one missing.

### B-2 — a false positive that made a correct package read DO NOT SEND

B-2 matched on **filename alone**, so it fired on any package shipping `src/index.html` — the Vite entry
template, a legitimate build input — to the pool. It landed in v5.71's `DO NOT SEND` list as a known false
alarm. It now compares **bytes** against the `github/index.html` the package itself ships, falling back to a
content marker (the built artifact carries an inlined `<script>` bundle) when the package ships none. No size
threshold: a magic number goes stale as the bundle grows.

### Controls — P46–P49, and a pair that had to stay a pair

`P46` (a packaged file never landed) and `P47` (**the exact v5.71 defect** — `qa/` paths present but stale)
both fire on the new completeness check. `P48` and `P49` are the B-2 pair: repairing B-2 by **deleting** it
would make P49 pass and P48 fail, so P48 proves a genuinely built artifact in `knowledge/` is still caught
while P49 proves the false positive is gone. Each carries a green-baseline assertion so it cannot report
CAUGHT on ambient state — the `P32` lesson.

### Also in this package

- **§H's comment corrected (D-5).** It said a session *"cannot reach stextor.github.io (403 — not in the
  egress allowlist)"*. **False**: measured HTTP 200, 1,429,130 bytes, md5 `e1bd283b…`, byte-identical to the
  shipped artifact. The comment's *conclusion* — H proves what the repo holds, not what Pages serves — is
  unchanged and still correct; only its reason had expired, which is the more dangerous kind of stale
  comment. Making H a live-serving check remains **out of scope**.
- **`OPERATIONS.md` §C** gains the `globalThis`/`FileReader` trap: the app's bare `new FileReader()` resolves
  on `globalThis`, jsdom installs it on `window` only, and stubbing the wrong global makes a whole group
  **vacuous** while reading green.
- **`OPERATIONS.md` §I** gains a version-registry shape table. `vercensus` sweeps `KNOWN_VERSIONS`; three
  other shapes exist — `t31`'s `ORDER` (whose `indexOf` returns `-1` and silently grades every disclosure
  key on the wrong rubric), `t33`'s object map, and OR-chains that are a ternary's **test**.

### Deferred, considered, and not oversights

- **F-2** — nothing detects a file that should have **left** the pool. **Deliberately deferred** by decision
  D-3: it needs a declaration mechanism that does not exist yet, and inventing one inside a package whose
  headline fix is a one-line assertion risks the headline fix. Recorded here so the omission is not read as
  an oversight.
- **The seven `100644` `.py` files** in `qa/tools/` — `controls_manifest_rows.py`, `controls_v566_nm.py`,
  `controls_v568_va.py`, `controls_v569_ri.py`, `oracle_nm.py`, `oracle_ri.py`, `oracle_va.py` — were
  **considered and left** (decision D-4). No document claims they are directly executable; they are invoked
  as `python3 …` throughout, and changing them would invent an obligation. Recorded so this is not re-found
  as a bug.
- ⚠ **`controls_v570_b3.sh`'s mode fix could not be delivered as scoped, and is a commit instruction rather
  than a shipped file.** It is the only `.sh` in `qa/tools/` at `100644`. But `package_check` has **no mode
  awareness at all** — `md5` is content-only — so shipping the file with unchanged content would make D-1
  fire on it as `unchanged`; and §L records that replacing an existing tracked file **preserves** its mode,
  so the upload path cannot fix it either. `COMMIT_MESSAGE.txt` carries
  `git update-index --chmod=+x qa/tools/controls_v570_b3.sh`. **Nothing verifies that it happened** — the
  same class as an I-2 allowlist expiry, where a person is the mechanism. Whether `package_check` should gain
  a mode check is not decided here.

### Corrections to the scope's own text, recorded in its §10

Three. Its §1 presented the v5.71 flattening as the motivating defect **without saying it was the third
instance** of a shape §C already recorded. Its census claimed §I recorded `t33`'s `PINS` — **it did not**;
that record was in `TESTING.md`, and the trap was built into §I where a durable mechanic belongs. And it
named **one** ternary-shaped registry site where an AST census found **three** (`t24` L92 and L254, `t28`
L61).

⚠ **A reporting error in the build session is recorded in the scope's §10 rather than tidied away.** A
mid-build handover table stated md5s for two files that **no command had produced**; both were wrong. That
is the §A0 failure exactly — a claim that felt settled enough not to check — in a table whose only purpose
was to be trusted across a session boundary. Caught by re-hashing on resumption.


## ops 2026-09-14 — the new scope's I-2 allowlist entry and K-9 manifest naming, one package late

KIND: ops. Leaves **v5.71** current — source `9e79b92f9eb91e86489cb6b80caa33c3`, built `index.html`
`e1bd283b638cdab74941804708987bb2`. **No app source change, no suite or harness change, no version bump.** The
app suite is untouched and its total stays **3,647 app checks** across both legs.

### What this fixes, and why it was needed

`docs/SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` was uploaded on 2026-09-14 **on its own**, and two gates went red
as designed:

- **`I-2`** — *unclassified: SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md*. A scope must be retired, superseded,
  fulfilled, or on the OPEN allowlist in `qa/tools/package_check.mjs`, and I-2 reads the tree **as a package
  leaves it**, so a scope arriving without its entry fires in the same run that ships it.
- **`K-9`** — every pool file must be **named somewhere** in `PROJECT_KNOWLEDGE_INDEX.md` (§G: list every file
  explicitly). The scope reached the pool and the manifest did not mention it.

Both are now supplied. The allowlist entry names its own expiry — the build that fixes D-1 and B-2 must remove
it **and** mark the scope RETIRED in the same package — and the manifest entry records that the scope is
deliberately **unrowed**, consistent with the other open scope and with decision D-3 (an open or retired
`SCOPE_*` is pending or history, not build state).

⚠ **This was avoidable and is recorded rather than tidied away.** The scope's own §7 said the two halves must
ship together, and the delivery did not follow it. The near-identical `SCOPE_A3_DRAFT_AUTOSAVE.md` entry at
v5.71 is the precedent that got it right. Both gates caught it immediately and named the file — which is the
system working, not failing. The lateness is noted in both the allowlist comment and the manifest row, in the
same "one package late (K-9)" form already used by `sel_census.cjs` and `SCOPE_STATE_SET_SELECTOR.md`.

### Limitations

- Nothing in `package_check` can detect a **missed removal** of an allowlist entry later: `I-3` fires only on an
  entry naming a file that is **gone**, and a retired scope is still present, carrying a RETIRED marker. A
  person removes it. The entry says so.
- This package does not touch D-1, B-2, F-2, F-4 or the OPERATIONS traps. Those are the scope's own build and
  remain unbuilt.

## v5.71 — the My Data draft autosave actually saves; an imported master prompt is checked; the first-open gate stops overclaiming

Source `9e79b92f9eb91e86489cb6b80caa33c3` · built `index.html` `e1bd283b638cdab74941804708987bb2` · built from v5.70
`df3e5d7599277ae1bb1afc216d318baf`. **`src/index.html` changes** (`9d6f7519c01feb8ddd1133e9a6f2a599`), so this is a
scaffold change as well as a source one. No engine, tax or state-rule change: `METHODOLOGY.md` does not change and MC
parity stays 10/10.

**Suite: 3,647 app checks, 0 failing, across both legs** — 37 suites, `t21` 50 and `domdiff` 32 counted separately
(GRAND 3,729). `smoke_built` **22 passed, 0 failed** on the built artifact. Negative controls
`qa/tools/controls_v571_draft.sh` **7 of 7 met**. Per-suite breakdown: `TESTING.md`.

### What changed, and why

- **The My Data draft autosave had never saved — in any release since it was added.** The draft code called
  `getItem`, `setItem` and `removeItem`: synchronous methods the storage contract does not have. It exposes
  `get`/`set`/`delete`/`list`, all async, and `get` throws on a missing key. Every call raised a `TypeError` into an
  empty catch, so the feature was silently dead for five releases **while the interface promised it in two places** —
  the dirty chip, and the leave dialog's "discarding keeps the auto-saved draft", which sits next to DISCARD & LEAVE
  at the moment the user decides. All eight call sites now speak the contract the app actually has.
- **The wipe path, which is the half that could have gone wrong.** `clearStorage` deletes a hand-enumerated list of
  keys and the draft key was not among them. Repairing the autosave without the wipe would have shipped a **new
  privacy defect on top of a closed one**: a plan the user "permanently deleted" would stay recoverable from the
  restore banner on a shared machine — the exact scenario a v5.9.1 leak review was run to prevent. The key now joins
  `STORAGE_KEYS`, the delete line was added, and `t5` grew a wipe assertion for it on its own, because it loops that
  map. This is `t37`'s extinction invariant, driven through the real Clear All Data button.
- **The interface no longer promises a draft it has not observed.** A flag is set only after a write resolves. The
  chip reports the time a draft was actually saved, and the leave dialog's restore sentence is conditional on it —
  with no draft yet, it says plainly that discarding loses the edits.
- **An imported `masterPrompt` is now checked.** It is persisted, reloaded on every visit and heads every Ask AI
  system prompt, but was assigned from a backup file with no type check and no length cap, so a shared backup could
  steer the assistant and a non-string value was template-interpolated. It is now accepted only as a string and
  truncated. ⚠ **The 20,000-character cap is a judgement, not a measurement** — no distribution of real prompt
  lengths was sampled; it is reasoned from token arithmetic alone, is deliberately cheap to change, and should be
  revised when anyone has real data. It is disclosed in the Field Manual rather than applied silently.
- **The first-open gate no longer claims that nothing is ever uploaded.** Ask AI does upload a plan summary when the
  user asks it to. The Field Manual qualified this in two places; the gate — which is what every first-time user
  actually reads — did not.
- **Three `smoke_built` checks were reading the inlined bundle source.** The built artifact contains the bundle as
  script *text*, and the harness read `body.textContent`, so the version check, the Ask AI notice check and the
  survivor-disclosure check could all pass on a page **where no script ran at all**. The harness now reads `#root`.

### Limitations and approximations, stated plainly

- The survivor-disclosure check in `smoke_built` asserts presence in the shipped artifact bytes, **not** that the
  text renders. Those disclosures appear only when a survivor year is selected in the Taxes detail table, which that
  smoke test does not drive; `t31` owns disclosure reachability. The check's previous, broader-sounding claim was
  never actually tested — it was one of the three vacuous checks above.
- `restoreDraft`, `discardDraft` and the recovery banner had **never executed** on any build. This release switches
  on unexercised code rather than repairing exercised code, and `t37` gives each its first coverage.
- The draft holds portfolio and expenses only, and the restore path commits through the same import pipeline every
  other entry path uses. The export payload is built from named fields, so a draft cannot ride into a backup file.
- The 20,000-character cap truncates rather than rejects, so an over-long imported prompt is silently shortened at
  import; the Field Manual states this.

## ops 2026-09-12 — the A-3 scope (with A-6 and F-3), decided and buildable; the B-3 browser check recorded

KIND: ops. Leaves **v5.70** current — source `df3e5d7599277ae1bb1afc216d318baf`, built `index.html` `372d066cf4fc7115ebdae9fc9d6f35d1`.
**No app source change, no suite or harness change.** Nothing is built. The one code file here is a QA tool's allowlist.

### What this package adds, and why

- **`docs/SCOPE_A3_DRAFT_AUTOSAVE.md` — the scope for v5.71.** A-3 (the My Data draft autosave has never saved) with
  A-6 (an imported `masterPrompt` heads every Ask AI system prompt unchecked) and F-3 (the first-open gate claims
  unconditionally that nothing is uploaded) folded in, since all three need one version bump and one rebuild between
  them. Measured against v5.70 and `d8c6aaa`; the Phase 1 finding's line numbers were all twelve lines stale and are
  re-resolved here by parser.
- **Three things the scope records that were not previously written down.** First, and the reason the fix is not
  mechanical: `clearStorage` deletes only the fourteen keys in `STORAGE_KEYS`, and the draft key is not one of them.
  The v5.9.1 leak review found exactly this and put a draft deletion inside `performClearAll` — one of the eight dead
  call sites. It is harmless only because no draft has ever been written, so **repairing A-3 without the wipe path
  would ship the leak that review existed to prevent**. Second, the suite has **zero** coverage of the draft feature:
  an AST walk over every `t*.mjs` collecting string **and regex** literals finds no assertion naming the draft key or
  the storage methods, and `VERIFICATION_REPORT.md`'s claim that the v5.9.1 fix was guarded by a `t1` assertion does
  not hold today. (The first pass of that census was string-only and would have missed a regex outright; the re-run is
  what is quoted.) Third, `restoreDraft`, `discardDraft` and the recovery banner have **never executed** — this is
  unexercised code being switched on, not repaired.
- **All six of the scope's decisions were approved the day it was written**, each as recommended: the draft key joins
  `STORAGE_KEYS` so the wipe and `t5`'s key-map loop cover it by construction; a flag set on a successful write drives
  the dirty chip, so the app cannot promise a draft it did not observe; the leave dialog's restore sentence becomes
  conditional on that flag; an imported `masterPrompt` is string-only and truncated at 20,000 characters; the gate
  gains the Ask AI exception. ⚠ **The 20,000 figure is a judgement, not a measurement** — reasoned from token
  arithmetic with no sample of real prompt lengths behind it, recorded as such in the scope, and cheap to revise.
- **`qa/tools/package_check.mjs`:** the I-2 OPEN allowlist gains `SCOPE_A3_DRAFT_AUTOSAVE.md`. I-2 reads the tree as
  the package leaves it, so the scope and its entry must ship together; the entry names its own expiry (the v5.71
  build, which must remove it in the same package).
- **`docs/STATUS_2026_09_11_b3_live_verification.md`:** §4's reserved line is filled. The maintainer observed the
  refusal notice on the live site on 2026-09-12; the Network panel was not opened, so this confirms the user-visible
  half only and the zero-request half still rests on that record's §2 measurements. Recorded second-hand and marked as
  such. It landed here rather than in its own zip because a package was shipping anyway.

### How it was verified

`package_check` ran on the packaged copies with all four arguments before the zip was cut, using **this package's own
copy of `package_check.mjs`** rather than the clone's — I-2's allowlist lives inside the tool, so the clone's copy
cannot see an entry this package adds, and the packaged copy is what the post-ship tree will hold. Both runs are
recorded in `MANIFEST.txt`, including the clone-copy run and why it differs. `package_check_controls.sh` was not
re-run: no check logic changed, only a data entry in a list. The regression suite was not re-run: no app, suite or
harness file is in this package.

## ops 2026-09-11 (third package) — B-3 verified on the live site: GitHub Pages serves the tested v5.70 build, and it sends nothing without a key

KIND: ops. Leaves **v5.70** current — source `df3e5d7599277ae1bb1afc216d318baf`, built `index.html` `372d066cf4fc7115ebdae9fc9d6f35d1`.
**No app source, suite or harness file changes.** Nothing is built.

### What this package adds, and why

- **`docs/STATUS_2026_09_11_b3_live_verification.md` — the verification record (repo-only).** The v5.70 CHANGELOG entry
  disclosed that nothing had been measured in a real browser and that GitHub Pages had not been checked; this closes the
  second. `https://stextor.github.io/danger-close/index.html` returned 200, 1,428,589 bytes, md5 `372d066c…`, an origin
  fetch one minute after the `1f1e837` commit; the directory URL serves the same bytes. v5.69 rebuilt byte-identically
  to `86703918…` (the §N3a scaffold check) and v5.70 rebuilt byte-identically to the live download, so pool source =
  clone source = rebuild = committed artifact = served bytes, all measured in one session. On the live download:
  `smoke_built` 20/20; through the real bootstrap under jsdom, no key and no Local Model → **0 requests** and the
  refusal notice, a saved key → 1 request to `api.anthropic.com`, a Local Model → 1 request to its URL; the v5.69
  rebuild → 1 keyless request resolving to the page's own host. From a clean clone, `t36` 23 on v5.69 / 24 on v5.70 and
  `controls_v570_b3.sh` 4 of 4. The pool is at 130 and `SCOPE_B3_KEYLESS_AI_ROUTE.md` has left it. **Still not
  measured: a real browser** — Steve's check, with a line reserved for its result in the record's §4.
- **Seven findings, recorded there in full.** F-1 (confirmed by demonstration): two `smoke_built.mjs` checks read
  `body.textContent`, which includes the relocated bundle's *source*, so *"Ask AI refuses (notice shown)"* and *"renders
  its own declared version"* both pass on a page in which no script ran; B-3 coverage stands on the zero-request and
  disabled-button checks and on `t36`. Fixed with A-3 (D-2). F-2: the leftover scope file was a fresh instance of the gap
  OPERATIONS §G already records — `package_check` K-9's "named somewhere" was satisfied by the manifest's own sentence
  saying the file leaves. F-3 (located): the first-open notice in `src/index.html` L21 states *"Nothing is uploaded or
  seen by anyone else"* unconditionally, while the Field Manual qualifies it twice; wording is Steve's, and it is a
  scaffold change with a rebuild. F-4: `qa/tools/controls_v570_b3.sh` is committed `100644` — the only `.sh` without the
  executable bit; the §L upload hazard for new scripts. F-5 and F-7 are corrected below. F-6: `VERIFICATION_REPORT.md`
  declares itself frozen after v5.9.2 and had no manifest row, so the record lives in `docs/`, not there.
- **`TESTING.md` (F-5, D-4):** its only "Current build" sentence read v5.67 with v5.67's hashes and total, three
  releases stale in the present tense while OPERATIONS §G says the file holds the current md5. Rolled to v5.70
  (`df3e5d75…` / `372d066c…` / 3,576, GRAND 3,658) with a note recording the stale span.
- **`OPERATIONS.md` §I (F-7, D-5):** the paragraph saying a session cannot reach `stextor.github.io` (403) is false as
  of 2026-09-11 — the host was added to the sandbox allowlist and this package's record reached it. Corrected to say
  so, and to say the served-bytes check is still a habit, not a gate. `package_check.mjs`'s §H comment says the same
  false thing and is left for the change that next touches the tool.
- **`PROJECT_KNOWLEDGE_INDEX.md`:** an inventory row for the new record; a REPO-ONLY inventory row for
  `VERIFICATION_REPORT.md` (F-6); the orientation note gains the live result; hash rows rolled for `TESTING.md`,
  `OPERATIONS.md` and `CHANGELOG.md` (last); a delete-first section for this upload.
- **Decisions taken on the session's recommendations:** D-1 (a), D-2 with A-3, D-3 no second full-suite run, D-4 yes,
  D-5 yes. F-2, F-3, F-4 and the `package_check` §H comment go to a housekeeping scope, not to A-3.

### How it was verified

`package_check` — the packaged copy, with all four arguments (`/tmp/ship` at `1f1e837`, the run folder with its
`package.json` and `package-lock.json` restored from the clone, the pool) — ran before the zip was cut; its result is in
the package's `MANIFEST.txt`, and the post-upload run closes section J. `package_check_controls.sh` was not re-run: no
check logic changed. `row_census.cjs` was not needed: K-8's expression was not touched. The regression suite was not
re-run: no app, suite or harness file changed.

## v5.70 — Ask AI sends nothing without a key or a Local Model (the audit's B-3), 2026-09-11

Source `df3e5d7599277ae1bb1afc216d318baf` · built `index.html` `372d066cf4fc7115ebdae9fc9d6f35d1`.

**Suite: 3,576 app checks passing, 0 failing, 0 dead, across both the v5.69 and v5.70 legs** (`t21` 50 and `domdiff` 32 are
tooling and counted separately; GRAND 3,658). Parsed from `runsuite.sh` output by script. Per suite, current leg: `t1` 185 · `t2` 35 · `t3` 36 · `t4` 252 · `t5` 58 · `t6` 21 · `t7` 41 · `t8` 42 · `t9` 14 · `t10` 354 · `t11` 40 · `t12` 23 · `t13` 42 · `t14` 44 · `t15` 11 · `t16` 24 · `t17` 74 · `t18` 67 · `t19` 65 · `t20` 100 · `t22` 85 · `t23` 25 · `t24` 38 · `t25` 45 · `t26` 25 · `t27` 18 · `t28` 34 · `t29` 60 · `t30` 12 · `t31` 31 · `t32` 12 · `t33` 32 · `t34` 73 · `t35` 114 · **`t36` 24**. On the v5.69
leg `t36` is 23. MC parity 10/10. `smoke_built` 20/20 against the packaged `index.html`.

### What changed, and why

- **On a self-hosted copy with neither a saved API key nor a Local Model, Ask AI now sends nothing.** Through v5.69,
  pressing ▶ EXECUTE (or Enter) in that state sent the Anthropic request without a key, and `src/main.jsx` rewrites any
  keyless Anthropic request to the page's own address. On the live site, the full Ask AI context therefore went to the
  site's GitHub Pages host: the plan summary (names, balances, income, Social Security and simulation results), the
  question, and any attachments. Found by the 2026-09-11 Phase 1 audit (B-3); the Field Manual's list of where Ask AI
  data goes did not include that destination.
- **How.** One definition, `_aiNoRoute`, read by four sites:
  - a refusal inside `askAI`, before any request is built — Enter reaches it even with the button disabled;
  - the send button's disabled state;
  - its label, **"🔑 Add your API key to use Ask AI"**;
  - the network-error hint, whose condition now also excludes the Local Model route.

  The refusal shows *"Nothing was sent — add your API key above, or set up a Local Model."* and the typed question stays
  in the box.
- **The Field Manual** — §10's complete list of what an Ask AI call transmits — gains: *"With neither a key nor a Local
  Model set, Ask AI sends nothing."*
- **Unchanged:** the claude.ai branch; keyed requests, which still go only to api.anthropic.com; Local Model requests;
  offline mode; and every figure (MC parity 10/10). `src/main.jsx` is not touched.

### What earlier versions did — disclosed

- **The verified case is the live site.** Every standalone build published from this repository carried the keyless send
  and the rewrite; both are in its first commit (2026-08-01). When the live site first served such a build was not
  established.
- **What GitHub Pages returned for such a request, or keeps from it, was not measured and is not known.** No API key was
  involved.
- **A copy opened as a downloaded file takes a different path:** a `file:` page gets no rewrite, so the keyless request
  heads for api.anthropic.com, which refuses it without a key. That path was traced in the source, not tested, and no
  claim is made about it. A copy hosted at some other address would have sent to that address.

### Tests and controls

- **`t36_ai_route.mjs` (new, both legs).**
  - R-1 is the extinction invariant: zero requests, the refusal notice, the question kept, and the button disabled and
    relabelled. The v5.69 leg carries a dated pre-fix pin instead: exactly one keyless request to the Anthropic URL, from
    an enabled EXECUTE.
  - Controls: R-2 a saved key, R-3 a Local Model, R-4 the claude.ai branch (in a child process), and R-5 offline mode;
    plus the Field Manual sentence.
  - Each self-hosted case asserts the LOCAL API KEY panel is on screen, because the shared jsdom environment runs every
    other DOM suite on the claude.ai branch.
- **`qa/tools/controls_v570_b3.sh`: 4 of 4 met expectation.** Unmutated stays green; deleting the refusal fires R-1;
  narrowing the guard to "no key" fires R-3; dropping its claude.ai term fires R-4.
- **`smoke_built.mjs` gains a B-3 behaviour check**: the built artifact, with the real bootstrap, sends nothing. 20/20 on
  v5.70. Against the v5.69 rebuild it fails exactly its three B-3 checks, and every Enter sends a keyless request to
  `/anthropic/v1/messages` — the defect reproduced in the shipped composition, not a transcription.
- **Version registration:** `v570` in 18 suites — 80 AST edits and 2 hand edits — then `vercensus.cjs` on the new tag
  (82 judgement points, as on v569). **⚠ The build's own error:** that pass missed `t33`'s `PINS` entry, an
  identifier-keyed registry `vercensus.cjs` cannot see. The first full run showed `t33` DIED on the v5.70 leg while the
  runner's GRAND line still read "0 failed". The entry carries v5.69's figures forward, and the suite was re-run in
  full.
- **§B1a:** every suite regex was executed against the old and new copy; no matcher's meaning changes.
- **Built per OPERATIONS §N3a:** v5.69 rebuilt byte-identically to `86703918db247e3284752f0f1cc1f6d5` first.

### Limitations — disclosed, not modelled

- **`src/main.jsx` still rewrites keyless Anthropic requests to the page's origin.** The app no longer makes one outside
  claude.ai, except in the fail-closed case — a non-file page with no hostname, which the app treats as claude.ai.
  Removing the rewrite is a separate, later release.
- **The network-error hint that tells users to put a key in `.env` for the dev proxy is now unreachable.** The dev proxy
  injects no key, so that text was never accurate; it goes with the rewrite.
- **Nothing was measured in a real browser.** The DOM suites and `smoke_built` run in jsdom.
- **A short public note about the earlier behaviour follows once v5.70 is live.**

Provenance: source `df3e5d7599277ae1bb1afc216d318baf` · built `index.html` `372d066cf4fc7115ebdae9fc9d6f35d1`.

## ops 2026-09-11 (second package) — B-3 is scoped and approved: Ask AI will send nothing without a key or a local model

KIND: ops. Leaves **v5.69** current — source `76a35ba283ed5153ff257106e7ccfc10`, built `index.html` `86703918db247e3284752f0f1cc1f6d5`.
**No app source, suite or harness file changes.** Nothing is built yet.

### What this package adds, and why

- **`docs/SCOPE_B3_KEYLESS_AI_ROUTE.md` — BUILDABLE, target v5.70.** The fix for the Phase 1 audit's B-3: on a self-hosted
  copy with no saved API key, Ask AI sent the plan context to the page's own host. All three decisions were approved on
  2026-09-11:
  - **D-B3-1 (a)** — the fix lives in the app, as a refusal inside `askAI`; `src/main.jsx`'s `/anthropic` rewrite is left
    for its own later release.
  - **D-B3-2 (a)** — with neither a key nor a local model, the button is disabled and relabelled, and Enter shows
    "Nothing was sent".
  - **D-B3-3 (b)** — the v5.70 CHANGELOG discloses what earlier builds did, the Field Manual gains one sentence, and a
    short public note follows once v5.70 is live, all within the scope's wording constraints.
- **What the scope measured.** On a scratch copy that never ships, one guard took the no-key case from one request to
  the site's host to zero, while a saved key still reached `api.anthropic.com` and a local model still reached its own
  endpoint. A keyless request to Anthropic returns 401, so the rewrite cannot succeed anywhere. The Field Manual's
  "complete list" of Ask AI destinations had been contradicted by the defect, and both the send path and the rewrite are
  in the repository's first commit.
- **`qa/tools/package_check.mjs`** — the I-2 OPEN allowlist gains the scope, with its expiry: the entry is removed in
  the v5.70 package that closes it.
- **`docs/FlawsToFix-v5_69-Phase1.md`** — one annotation (the scope's F-8): OPERATIONS §N3a records `jsdom`'s absence
  from `package.json` as deliberate, and the audit's Section E note should have cited it.
- **The Phase 1 audit package was verified after upload:** `package_check` 44 passed, 1 failed — `D-1` only, the
  expected complement.

### How it was verified

`row_census.cjs`: all three copies of K-8's row expression still agree after the allowlist edit. `package_check` — the
packaged copy, with all four arguments — ran before the zip was cut; its result is in the package's `MANIFEST.txt`.
`package_check_controls.sh` was not re-run: the change adds one allowlist entry and alters no check logic. The
regression suite was not re-run: no app, suite or harness file changed.

## ops 2026-09-11 — Standing audit Phase 1 re-run at v5.69: the import and storage path

KIND: ops. Leaves **v5.69** current — source `76a35ba283ed5153ff257106e7ccfc10`, built `index.html` `86703918db247e3284752f0f1cc1f6d5`.
**No app source, suite or harness file changes.** Findings only; nothing is fixed.

### What this package adds, and why

- **`docs/FlawsToFix-v5_69-Phase1.md`** — Sections A + B of the standing audit re-run at v5.69 over the ground the v5.10.1
  Phase 1 named as not cleared: the import/apply path line by line, and the storage path.
  - **A-3 · MEDIUM · undisclosed — the My Data draft autosave has never saved.** The draft code calls `getItem`/`setItem`/
    `removeItem`; the storage the app runs on exposes only async `get`/`set`/`delete`/`list`, and each call's error is
    swallowed. The dirty chip promises an auto-saved draft and the leave dialog says discarding keeps it. Reproduced on v5.68
    and v5.69 with a positive control; source-traced to v5.9.1, the release that introduced it. A fix must move all eight
    calls together, including Clear All Data's.
  - **B-3 · MEDIUM · undisclosed — keyless Ask AI on a self-hosted copy sends the plan to the page's own host.** With no saved
    key, EXECUTE stays enabled and `src/main.jsx`'s dev-proxy rewrite sends the full AI context to `/anthropic/v1/messages`
    on the page's origin — `stextor.github.io` on the live site. Reproduced in the harness with the wrapper transcribed and a
    keyed control; nothing was sent to any network.
  - **A-4, A-5, A-6 · LOW** — a malformed backup imported from My Data fails silently and half-applied; an inherited skin name
    (`"constructor"`) blanks the app until reload; an imported `masterPrompt` persists and heads every Ask AI prompt until the
    next Save & Apply.
  - **A-2 still open**, now reproduced: no row-count bound (20,000 holdings exhausted the harness heap on both import paths —
    a jsdom measurement, not a browser one). A-1 and B-2 hold; positive findings 1, 2, 4 and 5 hold; 3 is confirmed at runtime
    on the import side.
- **Five repo-only tools in `qa/tools/`**, which assert nothing and count toward no release total: `probe_mydata_draft.mjs`,
  `probe_import_hostile.mjs`, `probe_ai_route.mjs`, `census_p1.cjs`, `lits_p1.cjs`.
- **`FlawsToFix-v5_10_1-Phase1.md` and `AUDIT_PHASE3_ROLLUP.md` are annotated** to point at the re-run; neither is rewritten.
- **The knowledge pool's `PROJECT_KNOWLEDGE_INDEX.md` was the v5.68 manifest** when this audit began — its Current-build
  table named v5.68 and no line mentioned v5.69 — while every other pooled file matched the clone. This package's manifest
  replaces it.

### How it was verified

`t21` 50 passed, 0 failed, so the parser tools are trusted (OPERATIONS §B1). Every probe carries a positive control, and every
control fired: sync methods added to a scratch shim make the draft appear and restore; a valid backup imports on both paths; a
saved key reaches `api.anthropic.com` with `x-api-key`. Two controls first failed because the probes were wrong — the DOM
harness has no `FileReader` global, and the first Ask AI button is ATTACH FILE — and both are recorded in the document.
`census_p1.cjs` self-checks 4/4; `lits_p1.cjs` parsed 152 files with 0 failures. The packaged tools are byte-identical to the
copies that produced the results. The regression suite was not re-run: this package changes no file a suite reads (by AST,
no suite reads `CHANGELOG.md` or the manifest). `package_check` ran with all four arguments before the zip was cut; its
result is recorded in the package's `MANIFEST.txt`.

### Limitations — disclosed

Nothing was measured in a real browser. What GitHub Pages does with the keyless POST was deliberately not tested.
claude.ai's native storage method list is corroborated, not primary-sourced. The document's scope statement lists
everything that was not examined, including the export payload, the wizard's save path and the regression suite.

## v5.69 — Rhode Island's exclusion becomes a cliff, the last of the five income-limited statutes, 2026-09-10

Source `76a35ba283ed5153ff257106e7ccfc10` · built `index.html` `86703918db247e3284752f0f1cc1f6d5`.

**Suite: 3,506 app checks passing, 0 failing, 0 dead, across both the v5.68 and v5.69 legs** (`t21` 50 and `domdiff` 32 are
tooling and counted separately; GRAND 3,588). Parsed from `runsuite.sh` output by script. Per suite, current leg: t1 185, t2 35,
t3 36, t4 252, t5 58, t6 21, t7 41, t8 42, t9 14, **t10 354**, t11 40, t12 23, t13 42, t14 44, t15 11, t16 24, t17 74, t18 67,
t19 65, t20 100, t22 85, t23 25, t24 38, t25 45, t26 25, t27 18, t28 34, **t29 60**, t30 12, t31 31, t32 12, t33 32, **t34 73**,
**t35 114**. On the v5.68 leg `t10` is 341, `t29` 60 and `t35` 104. MC parity 10/10.

### What changed, and why

- **Rhode Island's $50,000 pension/401k exclusion per person is now lost entirely at its AGI cliff.** R.I. Gen. Laws
  § 44-30-12(c)(9) grants it from full retirement age (67) only while federal AGI is **less than** $133,750 joint / $107,000
  single (TY2025, ADV 2025-22). Until this release the model granted it at every income. It is a two-row `bands` table on
  `agi`, per person. **This CHANGES A USER'S NUMBER, in the CONSERVATIVE direction only**: over 34,992 households priced on the
  built v5.68 and v5.69 modules, tax rose for 14,843 and **fell for none**; the largest rise is **$5,000.00/yr**, a both-67+
  couple with $100,000 of qualifying income at or above the cliff. On a common household no other state's tax moved.
- **The comparator is EXCLUSIVE.** The statute says "less than" and ADV 2025-22 says "below"; only the Division's retirement
  guide says "or less", in the table that misprints $133,500. A couple at exactly $133,750 loses the exclusion. The project's
  statutory oracle had recorded this as inclusive and was corrected in the ops package that scoped this release.
- **⚠ The model's best Roth cell can change for a Rhode Island household.** Measured on four households through the Roth
  engine: unchanged for three; for a couple with $2M of traditional money the best cell moved from *fill the 12% bracket* to the
  *current slider* strategy, with modelled lifetime tax $107,757 higher on the old winner; a fourth household's second and third
  places swapped. A conversion that pushes AGI across the cliff costs the whole exclusion that year, and the ranking now sees it.
- **All five income-limited state exclusions are now conditioned** (CT v5.65, NM v5.66, NJ v5.67, VA v5.68, RI v5.69), so the
  suite's "income-limited but unconditional" guards are **inverted to assert the set is EMPTY** rather than weakened: `t29`
  F-6/F-6a/F-6b and `t35` D-8, gated so the v5.68 leg keeps its own truth. `t29` F-6c and F-7, the `stateExclCliff` fixture and
  the `state_excl_limited` census row **retire together**. `t34` A-3 is rewritten because its `[].every` over an empty list
  would have passed vacuously.
- **The Field Manual** no longer says Rhode Island is "not yet" conditioned or that "several" income-limited exclusions are
  treated as unconditional; a lock now asserts it (no assertion read those sentences before).

### Tests and controls

- `t10`: twelve Rhode Island hand cells through `stateTaxAnnual` (both columns, both sides of the cliff, **the two AT-threshold
  cells that alone detect the comparator**, the SS-carrying base, the age floor), an extinction invariant ($1 across the cliff costs
  $5,000.05), the scalar/table and `exclAge` invariants, and three pre-fix pins on the v5.68 leg. Every cell matches
  `qa/tools/oracle_ri.py`, which imports nothing from the app, to the cent.
- `t34` A-12…A-12b price every row of the table; `t35` D-7d (converted, not reworded), D-14…D-20 (the note's disclosures, as
  claims), RI-1…RI-4 (the cliff reached from `computeTaxPlan` on the example household) and RI-5…RI-7 (the Field Manual lock).
- `qa/tools/controls_v569_ri.py`: **16 controls, 16 met expectation**, canonical inputs unchanged — nine table mutants, each caught
  by the cells the scope predicted; the guard, note and manual controls; and G5, which reproduces the `[].every` vacuity on purpose
  and stays silent. `qa/tools/controls_state.sh` revised (S2 retired, S4 inverted by tag, **S1 re-anchored — the scope missed it**):
  5 of 5 against v5.69.
- Version registration: 83 AST edits across 18 suites, then `vercensus.cjs` on the new tag (82 judgement points, as on v568).
- Built per OPERATIONS §N3a: v5.68 rebuilt byte-identically to `f7f0e3dd…` first; `smoke_built` 16/16 on v5.69.

### Limitations — disclosed, not modelled

- **IRA distributions are not distinguished.** The statute excludes every IRA; the model cannot tell an IRA from a 401(k), so it
  still grants the exclusion to IRA money below the cliff — optimistic, up to $4,000/yr for an $80,000 IRA-only couple.
  `MissingFeatures.md` **D-12**.
- **Each person's $50,000 is not capped at their own income, and FRA is not applied per spouse's income** — the engine sees household
  totals. Optimistic, $2,000–$2,500/yr on the households priced.
- **The AGI measure omits dividend and interest income** — optimistic near the cliff.
- **Half of federally taxable Social Security is still taxed at every income**; Rhode Island's SS modification is part of the
  eight-state partial-SS approximation. Overstates tax under the cliff, understates it above. Its TY2027 age-test removal is not
  modelled.
- **TY2025 thresholds**, dated in the note; the TY2026 pair is expected in November 2026. Flat 5% rate, no MFS or head-of-household.
- **No assertion pins the Roth best-cell change**; it is measured and disclosed. Whether to pin it is an open question for the maintainer.
- `t29` falls from 64 to 60 **on the frozen leg too**, because the retired checks were shared tooling, not build behaviour.

Provenance: source `76a35ba283ed5153ff257106e7ccfc10` · built `index.html` `86703918db247e3284752f0f1cc1f6d5`.

## ops 2026-09-10 — Rhode Island is scoped: the last of the five, its comparator corrected, its IRA gap measured

**KIND: ops. No version bump, no source change, no figure moves, no test changes.** v5.68 remains the
current build: source `561fc39b5bdae7c6d83698f352c436b3`, artifact `f7f0e3dd338804b2a09a6ca53318ac26`,
repo HEAD `f2f4c20` at the start of this work. Six files change: `docs/SCOPE_RI_POPULATE.md` (new),
`docs/FINDINGS-v5_63-state-statutes.md`, `docs/SCOPE_INCOME_CONDITIONING.md`, `qa/tools/package_check.mjs`,
this file and the manifest.

### What changed

- **`docs/SCOPE_RI_POPULATE.md` is new, and BUILDABLE.** It scopes Rhode Island's $50,000 pension/401(k)
  modification into `exclTest` as a two-row `bands` cliff on `agi`, per person, on the dated TY2025 pair
  (parent B-3, not reopened). **All six of its decisions were approved by the maintainer on 2026-09-10**:
  cliff only, with the IRA distinction disclosed and given its own input scope (D-RI-1); `cmp: "lt"`
  (D-RI-2); the own-income cap and per-spouse FRA disclosed, not modelled (D-RI-3); the guards the
  conversion empties inverted and the `stateExclCliff` fixture and `state_excl_limited` row retired
  together (D-RI-4); the Field Manual rewritten with a lock (D-RI-5); an independent `oracle_ri.py`
  (D-RI-6). **Social Security stays out of scope**, per the parent's §4.
- **`FINDINGS-v5_63-state-statutes.md` §6 and §7c, and the parent's B-2, are CORRECTED IN PLACE: Rhode
  Island's comparator is EXCLUSIVE.** FINDINGS recorded it as inclusive ("at or below"). R.I. Gen. Laws
  § 44-30-12(c)(8) and (c)(9) say AGI "less than" the threshold, ADV 2025-22 says "below", and the
  Division's 22 July 2026 legislative summary says "less than"; only PUB 2026-01's table says "or less" —
  the table with the $133,500 typo FINDINGS already rejected. The original sentences are kept beside
  their corrections. B-2's mechanism is unaffected.
- **`package_check`'s I-2 OPEN allowlist gains `SCOPE_RI_POPULATE.md`**, with an expiry stated as the
  Rhode Island build — the same release that must remove the `SCOPE_INCOME_CONDITIONING.md` entry.

### What the scope measured, so the build does not rediscover it

- **Direction, over 34,992 grid households priced through `stateTaxAnnual` with the candidate table
  injected in memory: tax rose for 14,843, fell for none; largest rise $5,000.00/yr.** The comparator
  changed no grid household — only an exact-threshold cell sees it ($6,687.50 against $1,687.50, joint).
- **The example household, placed in Rhode Island, crosses the cliff in 10–13 of 25 Engine B rows**, up
  to $5,000/yr, and the exposure depends on the conversion amount. **Whether the model's best Roth cell
  changes for a Rhode Island household was NOT measured**; the scope requires the build to measure it.
- **The model's inputs cannot distinguish an IRA from an employer plan** — every pre-tax account type is
  `trad`, positions carry no plan type, the pension has no owner. Left disclosed, the IRA gap understates
  tax by $4,000.00/yr on an $80,000 IRA-only couple, the own-income cap by $2,000.00, per-spouse FRA by
  $2,500.00.
- **A test-cell × mutant matrix**: ten hand cells, nine mutants, every mutant caught. Three are caught by
  exactly one cell, and the comparator only by the two exact-threshold cells.
- **Converting Rhode Island empties the guarded set**, and the scope's census names what that breaks:
  `t29` F-6…F-7, the fixture and census row, `t35` D-7/D-8 (whose label miscounts an empty set),
  `t34` A-3 (whose `[].every` goes vacuous), `controls_state.sh` S2 and S4, two Field Manual sentences
  **no assertion reads**, and 18 files / 82 judgement points of version registration.

### How it was verified

- **§A freshness, clean**: source and artifact match the manifest, the repo and the pool; all 125 pool
  files match a committed file by content except `DangerClose-v5_67.jsx`, pool-only by design and equal to
  the manifest's prior-build hash.
- **The v5.68 suite re-run this session**: 3,441 app checks, 0 failing, parity 10/10 (tooling 82 separate).
  No suite or source file changes in this package, so no further app run applies.
- Every statutory statement in the scope was read from the statute, ADV 2025-22, PUB 2026-01 or the
  Division's 2026 summary in this session. The scope's draft Rhode Island note holds 16 of 16 executed
  locks (the twelve existing, four proposed). `package_check` results are in `MANIFEST.txt`.

### Limitations

- **The statute was read from a codification** (current to 1 January 2026) and from its reproduction in
  PUB 2026-01, not from the General Assembly's own site.
- **The draft note is a draft**: 63 suite matchers remain candidates that only the build's full run settles.
- **Two counts of unchecked exclusion states disagree** (the manual's thirteen, the CHANGELOG's nine); the
  scope records it as F-5 and does not resolve it.
- This work took three passes in one session; the first two ended at the tool limit with no files written.

## ops 2026-09-10 — controls_state.sh can run again, and the v5.68 ship's lessons are written where the next session reads

**KIND: ops. No version bump, no source change, no figure moves, no test changes.** v5.68 remains the
current build: source `561fc39b5bdae7c6d83698f352c436b3`, artifact `f7f0e3dd338804b2a09a6ca53318ac26`,
repo HEAD `e684106` at the start of this work. Four files change: `qa/tools/controls_state.sh`,
`docs/OPERATIONS.md`, this file and the manifest.

### What changed

- **`qa/tools/controls_state.sh` is repaired, not retired.** It had been pinned to the `v553` leg, which
  no current run folder contains, and its S2 mutation anchored on New Jersey fixture text that has not
  existed since v5.67 — so S2 would have run an unmutated `t29`. Retiring it was considered and
  rejected on coverage: `controls_v568_va.py` duplicates only S2; **S1 (F-5), S3 (F-8), S4 (F-6's
  empty-set guard) and S5 (section C's flip re-derivation) exist nowhere else.** Now: the version tag is a
  required argument; S2 reads the fixture's state from the file; **every mutation is checked to have
  changed its target**, so a drifted anchor is reported as *MUTATION DID NOT APPLY* instead of reading
  like a check that failed to fire; and a null control **S0** requires a green baseline first.
- **OPERATIONS §I** now names the whole pre-ship red set measured at the v5.68 ship — `K-1`–`K-3` **and
  `J-1`, `J-2`, `K-4`, `K-6`** (39 passed, 7 failed with all four arguments) — and records that `D-1` is
  red post-ship on an app release too (45 passed, 1 failed), not only on an ops package. No check was
  changed.
- **OPERATIONS §C3** records the second instance of committed stray files: the v5.68 web upload put six
  `qa/qa-baseline/` files at the repo root as well, caught only by the clone diff (39 changed paths
  against a 33-file package). No suite read them, but **`package_check` E-1b matches by basename and
  skips any name with more than one repo path, so it was silently blind to all six** until they were
  deleted. Nothing in `package_check` checks for committed paths outside the package; that is unscoped.
- **OPERATIONS §L** writes down that an ops package carries a CHANGELOG entry. Every 2026-09-08 ops
  package has one; **the three 2026-09-09 ops packages do not**, and are recorded rather than back-filled,
  because a back-filled entry would carry a date it was not written on.

### How it was verified

- `controls_state.sh v568` against a run folder built from the committed tree (its inputs hash-equal to
  HEAD): **6 of 6** — S0 silent, S1–S5 fired — in 15 s, with the run folder's inputs unchanged afterwards.
- **The new guard was itself controlled.** In a copy whose legacy-fixture name was altered (`t29` still
  64/0), S3 reported *MUTATION DID NOT APPLY … a FINDING* and the script exited 1, with S0–S2, S4 and S5
  unaffected.
- No app, suite or build-input file changes, so the app suite does not apply; the v5.68 figure stands
  (3,441 app checks, verified post-ship from a clean clone). `package_check` results are in `MANIFEST.txt`.

### Limitations

- The §I red set is **one package's measurement**, stated as such; it does not diagnose the split, which
  still wants a scope.
- `README.md` and `index.html` remain multi-path basenames that E-1b cannot see. Long-standing and by
  design; recorded, not changed.

## v5.68 — Virginia's age deduction becomes income-conditioned, and is taken once per couple, 2026-09-10

Source `561fc39b5bdae7c6d83698f352c436b3` · built `index.html` `f7f0e3dd338804b2a09a6ca53318ac26`.

**Suite: 3,441 app checks passing, 0 failing, 0 dead, across both the v5.67 and v5.68 legs**
(`t21` 50 and `domdiff` 32 are tooling and counted separately, which brings the
runner's GRAND line to 3,523). Run from the **packaged copies** — a fresh clone with this release's
`github/` files laid over it and the prior leg taken from the pool — and parsed from `runsuite.sh`
output by script, not assembled by hand. Per suite, current leg: t1 185, t2 35, t3 36, t4 252, t5 58, t6 21, t7 41, t8 42, t9 14, **t10 338**, t11 40, t12 23, t13 42, t14 44, t15 11, t16 24, t17 74, t18 67, t19 65, t20 100, t22 85, t23 25, t24 38, t25 45, t26 25, t27 18, t28 34, **t29 64**, t30 12, t31 31, t32 12, t33 32, **t34 70**, **t35 99**. On the v5.67 leg `t10` is
312, `t29` 64 and `t35` 94. MC parity 10/10.

### What changed for a user

The model granted Virginia's age deduction at **$12,000 per person 65 or older, at every income**.
Va. Code § 58.1-322.03(5)(b) reduces it **$1 for every $1** of adjusted federal AGI above **$50,000
single / $75,000 married**, so it is gone at $62,000 single, $87,000 for a couple with one qualifying
spouse and $99,000 with two. A couple both 65+ at $80,000 of retirement income now pays **$287.50 a
year** more Virginia tax, and one at $99,000 or above **$1,380.00** more — the statutory figures.

**Conservative only.** Swept v5.67 against v5.68 over 20,050 Virginia households: estimated tax fell in
none. Households below the threshold, or with no one 65+, are unchanged.

**The reduction is taken ONCE for a couple, against their combined maximum** — Form 760's Age
Deduction Worksheet settles what the statute's text does not. A per-spouse reading agrees with the
statute below the threshold and once extinguished, and is wrong only inside the phase-out with both
spouses qualifying — by up to $690.00 a year, at $87,000. Virginia is the first state in the module expressed as
a continuous taper rather than a band table.

### How the once-not-twice proof was chosen, and why most cells cannot carry it

With one qualifying person, `12,000 × 1 − excess` and `(12,000 − excess) × 1` are the same expression.
So **every single-filer cell and every one-spouse cell is structurally incapable of catching a
per-spouse defect**; only both-spouses cells strictly inside the taper can. `t10` marks those cells
`[DISC]`, and the proof rests on two household pins rather than on the table cells. **Measured, not
argued:** `controls_v568_va.py` C8 rewrites the evaluator per-spouse and turns 9 `[HAND v5.68]` lines
red — none of them single-filer or one-spouse. The scope's own §5 read as though the single column
contributed; it is corrected at the site.

### `t29` F-6a / F-6b could not fail, and now can (OPERATIONS §D2, flipped)

Both were written `T(label, actual, expected)` against a helper whose third argument is a display
string, so they passed on any non-empty set. **`t29` had no equality helper at all** — `EQ` is added.
The set they described was also mis-measured: their comments said `{VA}` while it was `{NM, RI, VA}`,
because the selector read note prose for a meaning that lives in data. It now carries `!r.exclTest` in
**both** copies (`t29` and `boundaries.mjs`), F-6c asserts the copies agree, and the checks are gated
per leg: `{RI}` at v5.68, `{RI, VA}` at v5.67. The `stateExclCliff` fixture moves to **Rhode Island**, its
third state. **Controlled:** an interior member joining the set turns F-6a and F-6b red while F-6 stays
green (T1); the identical mutation against the restored v5.67 form stays silent (T5) — the recorded
defect, reproduced on purpose. `controls_v568_va.py`: **17 controls, 17 met expectation**, canonical md5s
unchanged.

### Four errors this build made, every one caught by running rather than reading

1. **A comparison script reported the source edit as "0 of 15" against the oracle.** It was slicing the
   oracle's printed columns wrongly; re-compared against the oracle's unrounded values it is **15 of
   15**, plus two added cells. Recorded because the wrong reading was a STOP-shaped result and was
   not accepted by eye in either direction.
2. **The METHODOLOGY rewrite deleted the only creator-side copy of "$50K single/$75K married".** `t31`'s
   parity lock fired on both legs. The figures were restored in present-tense form; the lock was not
   touched.
3. **Version registration missed an object-keyed registry.** The AST transform covered arrays, `||`
   chains and value maps; `t33`'s `PINS` is keyed by tag. `t33` failed CLOSED and the first full run
   reported it **DIED** — so that run's GRAND line was discarded, not quoted. The v5.68 pins carry
   v5.67's values because `t33`'s household is in Georgia, which makes them an assertion that the
   Virginia change leaked nowhere.
4. **The control script first carried a hardcoded count no command had printed.** Unused, and removed
   before the first run.

### Where the scope and the documents were wrong

- `SCOPE_VA_POPULATE.md`: §5's filing-column wording (above); "flip to the suite's equality helper"
  named a helper `t29` did not have; the third site of the wrong `{VA}` measurement was the fixture's
  `why:` string, not text in `boundaries.mjs`, which has none; and two line citations were stale
  (`t10:1133` is L1182, `t10:1257` is L1256). Corrected at each site.
- **`SCOPE_INCOME_CONDITIONING.md` still read "Not yet built." after three populate releases.** The
  v5.67 entry below records D-NJ-3 as repairing exactly that disagreement; the repair reached
  `package_check`'s allowlist and not the scope. Corrected, with the prior line retained.
- **METHODOLOGY contradicted itself about New Jersey's 62 floor for one release** — two passages still
  called it unapplied after v5.67 applied it. Corrected in place with annotations.
- **`qa/tools/controls_state.sh` cannot run as written**: pinned to `v553`, and its S2 anchor is New
  Jersey fixture text gone since v5.67. Not fixed; recorded in OPERATIONS §I, and F-6a–F-7 are now
  controlled by `controls_v568_va.py` T1–T6.

### Limitations, disclosed rather than implied

- **The income measure carries no dividend or interest income**, so the deduction is slightly
  overstated for households with taxable investment income. Optimistic; in the note.
- **Born on or before 1 January 1939** (age 87+ in 2026) the $12,000 has no income test; not modelled,
  outside the frame. **The deduction cannot be combined with Virginia's Disability Income subtraction**;
  not modelled.
- **The flat-rate approximation for Virginia is unchanged** by this release.
- **Rhode Island remains unconditional** above its AGI cliff, and still does not distinguish IRA
  distributions. It is the last of the five, scoped next with both defects together.
- **The Field Manual still says the module treats "several" income-limited exclusions as
  unconditional.** Rhode Island is the only one of the five known statutes left; the word was kept
  because nine of nineteen exclusion states remain unchecked. A wording decision for the maintainer.

### Also in this release

`docs/SCOPE_VA_POPULATE.md` retired as fulfilled, with its build record in §9, and its `package_check`
OPEN-allowlist entry removed in the same package; the `SCOPE_INCOME_CONDITIONING.md` entry rolled to
ONE left. `qa/qa-baseline/dom_entry_v568.jsx` added. `t10`'s oracle path comment corrected to
`qa/tools/oracle_nm.py`.

## v5.67 — New Jersey's pension exclusion becomes income-conditioned, and its 62 floor is modelled, 2026-09-08

Source `ca05b2ece1af9dac3851837a0e96fbfa` · built `index.html` `35fcca203418e3e10b11765e2c6ade93`.

**Suite: 3,377 app checks passing, 0 failing, 0 dead, across both the v5.66 and v5.67 legs**
(`t21` 50 and `domdiff` 32 are tooling and counted separately, which brings the runner's GRAND line
to 3,459). Per suite, current leg, parsed from `runsuite.sh` output rather than restated: t1 185,
t2 35, t3 36, t4 252, t5 58, t6 21, t7 41, t8 42, t9 14, **t10 309**, t11 40, t12 23, t13 42, t14 44,
t15 11, t16 24, t17 74, t18 67, t19 65, t20 100, t22 85, t23 25, t24 38, t25 45, t26 25, t27 18,
t28 34, **t29 63**, t30 12, t31 31, t32 12, t33 32, t34 67, **t35 94**. MC parity 10/10. Both legs
run green; nothing is skipped.

> ⚠ **This entry first said "3,459 checks" and called that the suite figure. It is the GRAND total
> INCLUDING tooling**, which this project counts separately — an inflation of 82. Several per-suite
> figures were wrong too (`t19` as 24 against an actual 65, `t22` as 26 against 85, `t23` as 27
> against 25, and `t8` omitted). **Caught by a reader asking why `TESTING.md` had not been updated
> with this release — which it had not been, and that was the real miss.** Both are corrected here
> and in `TESTING.md`, `MANIFEST.txt`, `README-FIRST.md` and the commit message. Totals are supposed
> to be computed from suite output, and these were assembled by hand from a partial run.

### What changed for a user

The model granted New Jersey's pension exclusion at **$75,000 per person, unconditionally, from age
65**. N.J.S.A. § 54A:6-10 grants a **household** exclusion conditioned on New Jersey gross income:
the full amount (up to $100,000 joint, $75,000 single) at or below $100,000, then **50%** of the
payments received up to $125,000, **25%** up to $150,000, and **nothing** above $150,000.

**An MFJ household above $150,000 excluded $150,000 where the statute allows none — $8,250 a year of
understated New Jersey tax, the largest single-state error this module carried.** That household now
pays the statutory figure. Tier tops are inclusive; the percentages are of the payments received,
not of income and not of the tier-1 cap.

### ⚠ One figure moves the OPTIMISTIC way, and it is the first time a populate release has done that

The statute's age floor is **62**, and the model refused to apply it. The shipped reason was that
with a per-person $75,000 amount, granting it at 62 would hand a 62–64 couple $150,000 against a
$100,000 statutory cap — worse, not better. **That was an argument about the broken cap, and it
expired with this table.** The floor is now modelled, so a household aged 62–64 receives an
exclusion this model previously denied them and their estimated New Jersey tax **falls**.

Recorded here, in METHODOLOGY and in the Field Manual rather than left as a side effect: a release
reporting only the half that looks rigorous would be describing itself inaccurately.

### Six errors this build made, every one caught by running rather than reading

Listed because the project's standard is that hand-verified means computed independently and
compared, and because five of the six were caught by a check rather than by review.

1. **A test's expected value was wrong and the engine was right.** The clamp cell asserted
   `0.055 × 60,000`, double-counting $5,000 of pension that tier 1 fully excludes. `3,025` is the
   answer.
2. **The new test block stole the New Mexico `else` branch**, silently breaking the *prior* leg —
   288/4 where the shipped suite gives 288/0. Visible only because both legs were run.
3. **A blanket version-ladder edit corrupted a version-STRING map.** `VER === "v566" ? "v5.66"` is a
   value map, not a carry-forward ladder; widening its condition made t4's badge assert v5.66
   against a v5.67 build.
4. **The v5.54 New Jersey defect was nearly reproduced by the release fixing New Jersey.** The
   rewritten note first said *"income-conditioned"* and dropped the phrase the guarded-set selector
   matches, so NJ would have left that set by **rewording** as well as converting — and a reword
   alone empties it silently. `t35` D-7a caught it by shape. The phrase is restored and NJ now has
   its own **D-7b**.
5. **`F-6`'s guarded set was left standing on one member.** Setting `excl65: 0` correctly drops NJ
   from a filter keyed on `excl65 > 0`, leaving `{VA}` — and **Virginia is the next state to
   populate**, which would empty it. Pinned as **F-6a/F-6b** with instructions not to fix the coming
   red by weakening F-6 or keeping a scalar alive to satisfy a filter.
6. **The `stateExclCliff` fixture had gone vacuous.** It stood on New Jersey since v5.54 and turned
   the D-3c row ON; this release made that unreachable, so the fixture would have passed by having
   nothing left to catch. **Re-founded on Virginia**, with a note that Virginia is the last state it
   can stand on.

### Limitations, disclosed rather than implied

- **Married-filing-separately has its own lower column** ($50,000 / 25% / 12.5%) and is not
  modelled; the app models single and joint only. Do not assume MFS tracks single.
- **Disability-based eligibility at any age** is a separate statutory route with no input to express
  it, so a disabled New Jersey claimant under 62 is modelled as receiving nothing — overstating
  their state tax.
- **The income measure carries no dividend or interest income**, so a household whose income is
  materially dividend-driven sits lower on the tier table than the statute would put it. Optimistic.
- **The residual New Jersey error is now the flat-rate approximation alone**, and its sign has
  FLIPPED: against NJ's graduated Table B the model now *overstates* by $2,250 / $2,748.75 /
  $2,302.50 at the three pinned incomes. Conservative, and pinned as an extinction invariant.
- **Rhode Island and Virginia remain unconditional and optimistic.** VA converts next; RI is
  deliberately last, because its TY2026 figures are unpublished until November 2026 and its
  exclusion carries a second, separate defect.
- **The run-folder repairs this build needed are session scaffolding, not repo changes** — the
  baseline suites, `app_testable.mjs`, `dom_bundle.cjs`, an untagged source at the run root, and the
  dependency set. The ten `0 passed, 0 failed` suites the v5.66 stop report diagnosed have the same
  root cause, and it is **still undocumented anywhere durable**. Worth its own ops note.

### Also in this release

`docs/SCOPE_NJ_POPULATE.md`, written and retired the same day, carrying the build record. It was
never shipped as a standalone package — folding it in avoided a CHANGELOG entry for a package that
would have been superseded within the hour. **D-NJ-3 repaired a live three-way status disagreement**
about `SCOPE_INCOME_CONDITIONING.md`: the scope said *"Not yet built"*, the gate said *"PARTIALLY
BUILT: CT v5.65, NM v5.66"*, the manifest row said *"at v5.64."* The gate was right. That scope's own
header already logs this failure once, as the fifth instance of the class; this was the sixth, in the
same document.

## ops 2026-09-08 (third package) — K-8 can see a .py row, and the three copies of its expression are now checked against each other

**KIND: ops. No version bump, no source change, no figure moves, no test changes.** v5.66 remains
the current build: source `31b43e094307ef5f996570c090478e13`, artifact
`af4612323092c3c2aa6f0b408185f01f`, repo HEAD `9762851` at the start of this work. **Builds
`SCOPE_K8_ROW_MATCHER_PY.md`, which is retired in the same package.**

### What changed

`package_check` **K-8**'s row matcher recognised `mjs cjs jsx js sh md html json txt` and not `py`,
so a stale hash row on any of the pool's three Python files was invisible — not a wrong answer, no
answer. **`py` is added** (D-1 (a)); the set stays an explicit allowlist because it documents which
files the table is for. No check was added, removed or softened, and `K-8`'s predicate is unchanged
in every other respect.

**`oracle_nm.py` is now rowed** (D-2 (c)) — the first `.py` row this table has carried. It earns the
obligation where the two control scripts do not: it is the independent transcription of NMSA 1978
§ 7-2-5.2 that `t10` prices every New Mexico band against, so a silent change to it is the one
change in this set that could move a user's number. ⚠ **Its row is rolled only after re-reading the
statute, never to make a check go green** — a disagreement there means the oracle moved, and the
oracle is the thing that is supposed to be independent.

### The finding that made this a scope rather than a one-token edit

**That expression exists in three places that must agree**, and a fourth and fifth that must not.
The gate; this manifest's D-5 count block; and `controls_manifest_rows.py`'s target selector — which
is load-bearing, because it picks the control's target, so a gate widened without it would ship new
behaviour with a control that **structurally cannot exercise it**. All three are widened in one
edit (D-3 (a)), and **`qa/tools/row_census.cjs` now checks that they still agree.** That check was
the stated condition for keeping the manifest's block pasteable rather than replacing it with a
pointer; without it, the pointer was the right answer.

`P32`'s selector is narrower **on purpose** and is left alone with a comment saying so (D-4 (a)).
`SCOPE_HOUSEKEEPING_THREE.md` carries a copy that is two generations stale — the pre-`D-C-1` loose
form — and it is **annotated, not corrected** (D-5 (a)), because rewriting it would erase the only
readable record that the matcher was once loose.

### How this was verified

| | result |
|---|---|
| `row_census.cjs` on the built tree | 3 copies, one set, **exit 0** |
| drift control · either of the two other copies reverted | **exit 1**, names the drift |
| `P44` (stale `.py` row) against the **OLD** gate | ***NOT CAUGHT*** — the blind spot, reproduced |
| `P44` against the **NEW** gate | **CAUGHT by K-8**, and names the file |
| `P45` (correct `.py` row) | **silent** on both gates |

⚠ **Both new controls INJECT a `.py` row that is not in the tree, and that is the design.** Measured
before building: the old matcher, the widened one and an accept-anything one all see **exactly the
same 78 rows** against the live manifest, because it carried no `.py` row. A control written against
the manifest as it stands would be green before and after and prove nothing — the **endpoint-only
table-test class**, found three times across two sessions and every time by a control rather than by
review.

### Limitations, disclosed rather than implied

- **`P45` was wrong twice on its first runs, and the controls caught both.** It hashed the *pool*
  copy of a file this package was replacing, when `K-8` resolves against the package's own
  `knowledge/` copy first — the fourth occurrence of that shape. And it asserted *global* `K-8`
  silence with no needle, so it reported a FINDING while pointing at an unrelated stale row: the row
  for `package_check_controls.sh`, which this session had edited **after** rolling its row, which is
  exactly the trap §I names. Both corrected; a silence assertion now needs a needle too.
- **`P45` is not a second witness.** It is silent under the old matcher too, and cannot be
  otherwise, because that matcher does not see the row at all. Its job is to stop a future widening
  from matching too much. **`P44` is the only control that witnesses this change.**
- **`row_census.cjs` checks that the three copies AGREE. It does not check that they are RIGHT.**
  Three identically-wrong copies pass it. What makes them right is `P44`/`P45`, and those exercise
  the gate only — the other two copies have no test of their own.
- **The parity check is a list of three paths in `SITES`.** A fourth copy written tomorrow is
  invisible to it until someone adds it. It exits **2** rather than 0 when a site cannot be found,
  so a moved expression fails loudly instead of silently shrinking the set — but a *new* one is not
  something it can discover.
- **The `.py` row count is one.** The other two Python files remain unrowed by decision, so most of
  the widened matcher's new reach is still unused.
- The `K-1`–`K-3` pre-ship/post-ship split, and `P29`'s blindness on any package whose `K-1` is
  already red, remain diagnosed in §I and unscoped.
- `t10_taxcases.mjs:1133` still names its oracle `qa/oracle_nm.py`; it is at
  `qa/tools/oracle_nm.py`. Suite edit, still outside an ops package's lane.

## ops 2026-09-08 (second package) — a scope for K-8's blind spot, and a correction to the package that found it

**KIND: ops. No version bump, no source change, no figure moves, no test changes, and no gate
change.** v5.66 remains the current build: source `31b43e094307ef5f996570c090478e13`, artifact
`af4612323092c3c2aa6f0b408185f01f`, repo HEAD `b822d3e` at the start of this work. **This package
ships a scope and a correction. It builds nothing.**

### The correction, first, because it is mine

The package earlier today stated in three places that `SCOPE_STATE_SET_SELECTOR.md` was **not** on
`package_check`'s I-2 OPEN allowlist. **It was, and had been since the scope was written on
2026-09-07**, at `package_check.mjs:535`, carrying its own expiry. The claim was asserted from
reading the manifest rather than from running anything, and it shipped to the repo and the pool in
the package whose *entire subject* was stale claims in that file.

**This is §A0 committed by the session enforcing §A0**, and the cheapest possible test would have
caught it: the sentence named a state, and no command had printed it. The manifest row is corrected;
the CHANGELOG entry keeps its original wording with the correction beneath it, because a release
entry records what was believed at the ship.

### The scope

`docs/SCOPE_K8_ROW_MATCHER_PY.md` — **written, not built. Five decisions are open in its §6.**

`K-8`'s row matcher recognises `mjs cjs jsx js sh md html json txt` and **not `py`**, so a stale
hash row on any of the pool's three Python files is invisible. Verified by execution rather than
argued: a scratch manifest given a deliberately stale `oracle_nm.py` row leaves `K-8` **green**
under the current matcher and makes it **fire and name the file** under a widened one.

Two findings make it a scope rather than a one-token edit.

**An AST census found FOUR live copies of that expression**, plus a fifth that has already drifted.
The gate; this manifest's own D-5 count block; `controls_manifest_rows.py`'s target selector; and
`P32`'s deliberately narrower one — with `SCOPE_HOUSEKEEPING_THREE.md` carrying the **pre-`D-C-1`**
loose form, disagreeing with the gate today, noticed by nothing. The manifest introduces its D-5
block with the claim that it *"is `package_check` K-8's own expression so it cannot drift away from
the gate."* **That is true only while both are edited together** — and widening one and not the
other would falsify a sentence this project's index makes about itself. `controls_manifest_rows.py`
is worse than cosmetic: it selects its control target with its own copy, so a gate widened without
it ships new behaviour with a control that **structurally cannot exercise it.**

**The change is inert on today's manifest, and that is the trap.** All three candidate matchers see
**exactly the same 78 rows** against the live pool. So a check written against the tree as it stands
is green before and after and proves nothing — the **endpoint-only table-test class**, found three
times across two sessions and every time by a control rather than by review. The scope's §4 requires
every control to inject a `.py` row into a scratch copy, and says so at the top so it does not get
simplified away later.

The census instrument is `row_census.cjs`, which admits a site only if its pattern, **executed**,
matches a canonical hash row — a grep cannot tell a definition from a mention and cannot run a
regex. It is session-only for now and ships only if the build proceeds.

### Limitations, disclosed rather than implied

- **Nothing is fixed.** `K-8` is still blind to `.py` and the four copies still have to be kept in
  step by hand. This package makes the problem legible and decided-upon; it does not close it.
- **The new scope is NOT on the I-2 allowlist** — verified by command this time, in tree `b822d3e`.
  It will fail `I-2` in the next package unless it is allowlisted or retired, which is correct
  behaviour and is stated in its manifest row so the failure is expected rather than surprising.
- The `K-1`–`K-3` pre-ship/post-ship split, and `P29`'s blindness on any package whose `K-1` is
  already red, remain diagnosed and unscoped. Named in §I on 2026-09-08; deliberately not folded in.
- `t10_taxcases.mjs:1133` still names its oracle at the wrong path. Suite edit; still out of lane.

## ops 2026-09-08 — the manifest's hash rows went stale for the third time, and nothing in the release path had ever told anyone to roll them

**KIND: ops. No version bump, no source change, no figure moves, no test changes.** v5.66 remains
the current build: source `31b43e094307ef5f996570c090478e13`, artifact
`af4612323092c3c2aa6f0b408185f01f`, repo HEAD `9157042` at the start of this work. **The app is
untouched — this repairs the map, not the territory.**

### What was wrong

`package_check`'s **K-8** and **K-9**, run against the pool for the first time after the v5.66
upload, found the §A2 fallback hash table describing a build that no longer existed:

- **25 stale hash rows** — every pooled file v5.66 changed still carried its pre-v5.66 hash
  (`TESTING.md`, `METHODOLOGY.md`, `MissingFeatures.md`, `SCOPE_STATE_FIXTURES.md`,
  `package_check.mjs`, `domdiff_withdrawal.mjs`, and `t1`, `t3`–`t6`, `t10`, `t23`–`t35`).
- **1 ghost row** — `dom_entry_v564.jsx`, whose file v5.66's rotation had removed from the pool.
- **4 files with no row at all** — `SCOPE_STATE_SET_SELECTOR.md`, `oracle_nm.py`,
  `controls_v566_nm.py`, `sel_census.cjs`, all new at v5.66.
- **1 further gap the gates could not see**, found while repairing the above: `dom_entry_v566.jsx`
  had **no md5 row**, while both its predecessors had one. K-9 is satisfied by a bare mention
  anywhere in the file and the rotation note mentions it; K-8 cannot see a row that was never
  written. So the rotation pair was recorded backwards — the table named the leg that had **left**
  and not the leg that had **arrived**.

**A stale row is worse than no row.** §A's offline fallback compares a pool file to its recorded
hash; a stale file and a stale row agree with each other and return a confident MATCH.

### Why it shipped, which is the part worth fixing

**This is the third occurrence of one defect class.** At v5.61 the table carried 21 wrong hashes and
12 pool files had no row; on 2026-09-01 it carried 10 rows naming files that had already left the
pool alongside 19 whose hash no longer matched; now 25/1/4 — produced, this time, by a session that
was editing that very document.

Two failures made it repeatable, and both are now closed:

1. **No checklist step connected the halves that already existed.** §L named the manifest a
   mandatory deliverable and K-8 checked the rows, but nothing in the release path said to *roll*
   them. The obligation lived only inside the manifest's own D-3 note — read by people editing the
   manifest, not by people shipping a release. §I now carries **The hash rows are a per-release
   obligation**, with §L pointing at it rather than restating it.
2. **`package_check`'s printed usage line named two of its four positionals.** The header comment
   had all four; the line anyone actually reads did not. A session passing the pool third binds it
   to the workspace slot, leaving `POOL` null, at which point K-4, K-5, K-6, K-8 and K-9 print
   *"no pool given — this is the POST-SHIP half"* — which reads as a benign skip and is in fact the
   whole post-ship half of section K not running. The v5.66 session read that line and came within
   one step of recording a false green. Both lines now agree, and the checklist names the
   four-argument invocation as a post-upload step.

**The checks worked; the process around them did not.** K-8 and K-9 exist *because of* v5.61, were
skipped pre-ship for want of the pool argument, and caught this the moment they could run.

### Also corrected

Three manifest rows whose **prose** had frozen mid-build and now read as live instructions. The
`STOP-REPORT-v5_66-nm-session2.md` row still called itself *"the entry point for the New Mexico
session"* and ended *"the v5.66 source is NOT in the repo or the pool"* — false since the ship, and
in the one document a session reads first. The `STOP-REPORT-v5_66-NM-note-guarded-set.md` row still
said the selector scope was unwritten; it was written 2026-09-07. Both bodies are kept as the record
of the stop and marked as history. This is the shape §G recorded on 2026-09-01: **a row freezes when
written and nothing re-reads it.**

### How this was verified

No app suite applies — no source, suite or fixture changed, and the current-build hashes above are
unmoved from v5.66's provenance line. What was run instead:

- **§A freshness check, in full.** Pool source, prior source and `src/index.html` hashed against a
  fresh clone; all 116 pool files compared by content in **both** directions. Every one is
  byte-identical to its repo counterpart except `DangerClose-v5_65.jsx`, which is the prior leg and
  pool-only by design. The repo-only set is the expected categories only.
- **`package_check` with all four arguments**, before and after the repair — the invocation this
  package exists to make unskippable.
- **`package_check_controls.sh`**, because this package edits `package_check.mjs`.
- **Negative controls on the repaired rows** — `qa/tools/controls_manifest_rows.py`, new here and
  shipped to both destinations, because a control script is evidence and a release input, not
  scaffolding. Built from a pristine copy rather than by mutate-then-restore: corrupting one real
  hash row must turn K-8 red, removing a pool file's only manifest mention must turn K-9 red, and
  suppressing both mutations must leave them green. All four behaved, the package's md5 was
  unchanged across the run, and **every control carries a needle** so it cannot pass on someone
  else's failure. **A control that does not fire is the finding.** ⚠ Its fifth case, `B1`, is
  deliberately **not** a control: it removes `dom_entry_v566.jsx`'s row and asserts K-9 stays
  **green**, which is the demonstration that the fifth gap above was invisible to both gates.

### Limitations, disclosed rather than implied

- **`K-8`'s row matcher does not recognise `.py`.** Its extension set is
  `mjs|cjs|jsx|js|sh|md|html|json|txt`, so `oracle_nm.py` and `controls_v566_nm.py` could carry an
  md5 row that no gate would ever check. They are given index rows and no hash row, with the reason
  stated in place. **Widening the matcher is a real option and was not taken here** — it changes
  what a check asserts, which belongs in a scope with its own controls, not in a package repairing
  the rows that gate reads.
- **The `K-1`–`K-3` pre-ship/post-ship split is diagnosed and NOT fixed.** Those three anchor the
  Current-build table to the committed tree, so on a release package they are red pre-ship on a
  *correct* manifest and green on a *stale* one — the class is invisible until after upload, by
  construction. Named in §I so it is not mistaken for repaired. **No K check was softened to make a
  run look clean.**
- **`P29` DID fire against this package, and the received diagnosis was wrong.** It has been
  recorded as not firing "against an ops package"; run here, it fires. The real shape is narrower
  and worth having: P29 mutates the manifest stale and wants **K-1** to notice. On an *app-release*
  package K-1 is **already red pre-ship** — a release manifest has rolled ahead of the commit by
  construction — so P29 could not tell its mutation from the baseline. This package changes no
  version, so K-1 is green at baseline and the mutation is visible. **The blind spot was never
  "ops packages"; it is "packages whose K-1 is already red"**, which is the same root cause as the
  pre-ship/post-ship split above and belongs in the same scope. Only **`P13` and `P14`** now fail
  to fire, and both are correct by construction: they mutate `C-5`/`C-6`'s app-release form, which
  an ops package does not carry. ⚠ **An earlier draft of this entry said P1, P2 and P3 did not fire
  either. That was measured against an incomplete package** — `MANIFEST.txt` had not yet been
  written, so `KIND` read as `app-release` and five controls failed for that reason alone. All
  three fire against the finished package. Recorded rather than quietly corrected: it is §A0 in
  miniature, and the harness is what caught it.
- **`t10_taxcases.mjs` L1133 names its oracle `qa/oracle_nm.py`; the file is at
  `qa/tools/oracle_nm.py`.** Recorded in the manifest row and **not fixed** — editing a suite is
  outside an ops package's lane. `TESTING.md` has the path right.
- **`SCOPE_STATE_SET_SELECTOR.md` is not on `package_check`'s I-2 OPEN allowlist.** Adding it edits
  the gate; that is a scope's decision.
  > ⚠ **WRONG, and corrected by the next package the same day. It WAS on the allowlist** — at
  > `package_check.mjs:535`, since the scope was written on 2026-09-07. The claim was asserted from
  > reading and no command ever printed it. It is left standing with this correction beneath it
  > rather than edited away, because a release entry is a record of what was believed at the ship.
  > **§A0, committed by the package whose subject was stale claims in the manifest.**
- The three-place deletion rule of §G is still **unenforced by any check** for the *departure* half.
  This package's ghost row is exactly what that gap produces, and K-8 caught it only after upload.

## v5.66 — New Mexico's 65+ exemption becomes income-conditioned, 2026-09-07

**Figures MOVE, in the conservative direction.** Source `31b43e094307ef5f996570c090478e13`,
artifact `af4612323092c3c2aa6f0b408185f01f`, built from repo `7fc8b58`.

**3,310 app checks, 0 failing** (`t21` 50 and `domdiff` 32 counted separately), computed from the
runner's output rather than restated. Per suite on the v5.66 leg: t1 185 · t2 35 · t3 36 · t4 252 ·
t5 58 · t6 21 · t10 **288** · t7 41 · t8 42 · t9 14 · t11 40 · t12 23 · t13 42 · t14 44 · t15 11 ·
t16 24 · t17 74 · t18 67 · t19 65 · t20 100 · t22 85 · t23 25 · t24 38 · t25 45 · t26 25 · t27 18 ·
t28 34 · t29 61 · t30 12 · t31 31 · t32 12 · t33 32 · t34 67 · t35 93. Parity `t2 compare` 10/10 —
the engines are unchanged across the v5.65 → v5.66 boundary. The rise of 64 from v5.65's 3,246 is
`t10` (+44 on the current leg, +4 on the frozen leg) and `t35` D-7a plus the gating.

### What changed

New Mexico's `STATE_RULES` row carries the nine AGI bands of **NMSA 1978 § 7-2-5.2**, transcribed
from `docs/FINDINGS-v5_63-state-statutes.md` §2 and not re-derived. The model granted a flat $8,000
per person 65 or older at **every income level**; the statute steps it down $1,000 per band to **$0
above $51,000 of joint AGI / $28,500 single**. Per qualifying individual, age floor 65, band tops
inclusive.

**Direction: optimistic → conservative. Affected New Mexico households now show MORE state tax.** A
couple with $60,000 of retirement income was under-taxed by **$784/yr**; a single filer at $35,000
by **$392/yr**. Households at or below the top band are unchanged, and no cell moves the other way.

New Mexico is the second of five income-conditioned states to convert (Connecticut, v5.65, was the
first and the only one that moved optimistically). **NJ, RI and VA remain unconditional and remain
optimistic** — three left, not four.

### Limitations, disclosed rather than implied

- **The table has not been indexed since Laws 1987, ch. 264, § 6.** It is a 1987 schedule applied to
  2026 income and bites far more households than when written. The model reproduces the statute as
  it stands; it does not inflate it.
- **Blind claimants at any age** also qualify under the statute. The model has no way to express
  that, so a blind New Mexico claimant under 65 is modelled as receiving nothing — which
  **overstates** their state tax.
- The income measure **carries no dividend or interest income**, because the state engine is never
  passed either. A dividend-driven household sits lower on the band table than the statute would put
  it and receives a larger exemption than it should. Named in New Mexico's own state note.

### Verified to the dollar, and two coverage failures found by controls rather than by review

`t10` §2E now prices **every band of both tables** — 18 cells at the band tops, 14 more one dollar
past each top — plus the age floor, the per-person unit, the AGI measure, the wage-spill clamp, an
extinction invariant and the scalar-consistency check. Expected values come from
`qa/tools/oracle_nm.py`, an independent implementation of the statutory table typed from the
findings document and never from `STATE_RULES`.

⚠ **The first draft priced only four of eighteen rows.** Mutating the $4,000 band to $4,500 left
`t10` entirely green — a table test checking its own endpoints, which is the same defect a control
found in `t34` A-9's first draft during the previous session. **Twice in two suites in one release.**

⚠ **A wrong band TOP was invisible to the dollar path.** Moving the $36,000 joint top to $37,000
changed no priced cell. `t34` A-10 does catch it — verified directly, it fires alone on that
mutation — but by comparing the table to a literal, not by pricing a household. A top correct in the
table but mis-read by the row-selection loop would pass A-10 and fail nothing. The one-dollar-over
cells close it; the overlap is deliberate and recorded at the site.

Eight negative controls: **C0 silent; C1, C1b, C2, C3, C4, C5, C6, C7 all fire.** The control
harness (`qa/tools/controls_v566_nm.py`) never edits the canonical source — each mutant is built
into a throwaway tag from a pristine read — so the mid-run death that poisoned the previous
session's baseline cannot recur. Source md5 verified unchanged across the whole run.

### ⚠ Ten feature suites reported `0 passed, 0 failed` and this is what it was

The previous session stopped here, correctly: an empty set is not a pass. Three distinct causes,
**none of them an app defect**.

- **Nine were harness setup.** `dom_bundle.cjs` was never derived from `dom_v566.cjs`, and
  `DangerClose.jsx` was not at the run-folder root.
- **Two were invocation.** `t22`'s argument is the **prior** build tag (default `v532`, a source the
  repo does not carry); `t11`–`t16` take a **module path**, not a version tag — `node
  t11_survivor_rmd.mjs v566` dies with `Cannot find module 'v566'`. Both conventions lived only in
  each suite's own header; they are now in the qa-baseline README, which is where a session looks.
- **One was real.** `t33` failed **closed** — *"registered but has no PINS entry."* It carries a
  **second** version registry, a table of absolute dollar figures, separate from `KNOWN_VERSIONS`.
  The AST sweep that verified version registration looked at `KNOWN_VERSIONS` arrays and could not
  see it. An AST census confirms `t33` is the only suite with that shape. Its household is in
  Georgia, so its pins holding is itself the assertion that the New Mexico change did not leak.

### Also in this release

- `qa/domdiff_withdrawal.mjs`'s hardcoded default pair was **stale by 26 releases** (`v539 → v540`)
  and is rolled to `v565 → v566`, header and code in one edit as its own warning requires.
- **`docs/SCOPE_STATE_SET_SELECTOR.md` — the second half of D-NM-1 (c), written rather than
  intended.** Seven sites select a state set by executing a regex against user-facing copy; census
  by AST, not by grep. Recommends a structural `STATE_RULES` field. Not built — it is a scope.
- `METHODOLOGY.md` updated (a modelling change). One stale line corrected: it still said New Mexico
  was untouched and awaiting its own pass.

### Known-stale on arrival, and cleared by this package

The knowledge pool was stale for **20 files** — 18 suite files carrying the v566 registration plus
two documents — because they landed in repo packages after the last refresh. The repo was ahead in
every case. Named here because a session working from the pool alone would have been running
pre-v566 suites.

## ops 2026-09-07 (eleventh package) — the New Mexico handover's third place, and a report that outlived its own decision by a day

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `36f24ab` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `qa/tools/` change, no `index.html`. Two documents and a row.

### `K-9` was red again, for the same reason as the seventh package

`STOP-REPORT-v5_66-nm-session2.md` was filed to `docs/` and to the pool and **named nowhere in the
manifest**, so K-9 — *every pool file is named somewhere in the manifest* — went red the moment it
landed. **Two of §G's three places, executed in different passes. Third occurrence this week**, after
H-2 and the seventh package.

⚠ **This one was foreseen and shipped anyway**, which is worse than the other two and is why it is
recorded plainly. The handover package's own `README-FIRST.md` said: *"Its manifest row is NOT in
this zip, so K-9 goes red on upload."* The reasoning was that touching the manifest would also mean
rolling `CHANGELOG.md`'s new md5 row for a CHANGELOG that package did not change. **That reasoning
was sound about the row and wrong about the conclusion**: the answer was to carry the CHANGELOG too,
not to ship a known-red gate. A gate that everyone knows is red is how the K block rotted for four
days while reporting `CAUGHT`.

The row added is a **description row** — `File | What it is | Status` — reading **OPEN: the entry
point for the New Mexico session**. No md5 row: D-3 excludes this class, and
`STOP-REPORT-v5_63-fica-workbench.md` has never had one either.

### A document outlived its own decision by one day

`STOP-REPORT-v5_66-NM-note-guarded-set.md` was written on 2026-09-07 to put **D-NM-1** to the
maintainer. D-NM-1 was answered **the same day** — (c) — and the note half was built. But the report
still read as the live entry point, with four unresolved options in its §4, and **its manifest row
still said *"Read §4 (D-NM-1) FIRST."***

That is the exact defect the third scope-status sweep spent this morning hunting across 44 files:
**a document whose status line describes a world that has moved on.** Found one day later, on a
document this project created after the sweep. Annotated in place per §G's *prefer retiring to
deleting*: the body stays as the record of how the release was first stopped, with a banner naming
the live successor.

⚠ **THE ANNOTATION RECORDS WHAT IS STILL OWED, NOT JUST WHAT CLOSED.** (c) was *"ship the safe note
AND scope the selector fix in the same session, not as an intention."* **The note half is built and
pinned** — NM's row keeps the phrase *"income-limited"*, a comment at the site says it is
load-bearing, `t35` **D-7a** asserts NM left the guarded set by CONVERTING rather than by rewording,
and a negative control fires on the reword. **The scope half is NOT written. Until it is, (c) has
quietly become (a)**, which §4 of that report explicitly calls not an acceptable final answer.

### The obligation, honoured a second time

`CHANGELOG.md`'s md5 row is rolled here, computed into place after this entry was final. Second
package to face it since the row was added.

### Verification

**No suite was run and none applies** — no source, no `t*.mjs`, no fixture, no tooling.

- OPERATIONS §A freshness check against a fresh clone at `36f24ab`; source and artifact unchanged.
- **The handover's own upload verified before anything else:** all 20 `github/` files byte-identical
  to what shipped, the pool at 112, and — checked rather than assumed — **`src/DangerClose.jsx` still
  carries no `v5.66` string and the pool still holds exactly two `.jsx` sources.** The unshipped
  v5.66 source did not leak into either destination, which was the one thing that could have gone
  quietly wrong.
- **K-9 re-tested against the live pool with the manifest as this package leaves it:** all 112 files
  named. It reported `UNLISTED: 1` before.
- `package_check` run on this package **with the pool argument**, from the committed tool.

### Still open

- **New Mexico**, per `STOP-REPORT-v5_66-nm-session2.md` §3: a **dollar-exact** behavioural test
  first, then the ten silent suites, METHODOLOGY, the artifact, and packaging.
- ⚠ **D-NM-1 (c)'s selector scope**, still unwritten.
- **Item B** of `SCOPE_HOUSEKEEPING_THREE.md`, route (a) on the corrected premise. **K-10**, proposed.
- ⚠ **P1–P28** against New Mexico's own package, before its zip is sent. **Still unknown, still not
  to be assumed.**

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (tenth package) — D-B-1: Item B's premise said three tools; it is nine, and six are unreachable

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `5ee19aa` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `qa/tools/` change, no `index.html`. **Nothing is built here** —
this corrects a premise so that the build, when it happens, is scoped against true numbers.

### What was wrong

`SCOPE_HOUSEKEEPING_THREE.md` §2 says **"the three tools added at v5.58."** Measured from a
**full-history clone (750 commits)** rather than the shallow one earlier sessions used, and by a
crisp definition — tools that parse with `acorn`, the class §B1's warrant actually covers — **`t21`
fails to reach NINE:**

| Not covered by `t21` | First committed | |
|---|---|---|
| `copylock.cjs`, `lits.cjs`, `notes_probe.cjs`, `vergates.cjs` | 2026-08-31 | pool |
| `f6_probe.cjs`, `suite_regex_probe.cjs`, `vercensus.cjs`, `vercensus_list.cjs` | 2026-09-01 | mixed |
| `state_rows.cjs` | 2026-09-04 | repo-only |

⚠ **The dating was wrong in both directions, which is why the count could not be right.** Four of the
nine **predate** v5.58 — they arrived 2026-08-31, around v5.57 — and one **postdates** it by three
days. §2 named a three-shaped slice of a nine-file set and dated all of it to one release.

⚠ **A shallow clone is what hid this.** Two sessions could not date `qa/tools/` because
`--depth 1` carries no history, and both recorded the number as unknown rather than guessing — which
was right. **The answer cost one full clone.** When a question is "when did this arrive," the shallow
clone §A2 recommends for freshness is the wrong instrument.

### The harder half, and why nothing was built

§2 already warned that `f6_probe` and `suite_regex_probe` *"do not take `DangerClose.jsx` as their
subject."* **That is true of SIX of the nine**, read from their own usage lines: `copylock` takes two
sources plus suite directories, `lits` takes numbers and directories, `suite_regex_probe` takes two
text files and directories, `vercensus` and `vercensus_list` take a version tag and directories.
**`f6_probe` is the only clean fit for a `.jsx` fixture.**

`qa/tools/fixture/fixture.jsx` is one `.jsx` file. Extending it does not reach six of the nine: they
need a purpose-built **directory** fixture, and a shared one would have to satisfy a suite-walker, a
text-differ and a version-tag census simultaneously. That is a second fixture **kind**, with its own
negative controls, plus an unanswered question about whether repo-only tools belong in a pool-facing
suite at all.

**This is the stop condition D-2 named** — *"if the fixture work turns out to need its own design,
STOP and report rather than writing thin cases to reach a number."* It was reported, not worked
around. Writing nine thin cases to reach a count is the §B2 failure this suite exists to prevent.

### D-B-1, resolved as (c) then (a)

Correct the premise first — this package — then build coverage **only for the tools the existing
fixture can actually reach**, and **disclose the rest in `TESTING.md` by name** rather than covering
them thinly. The directory-fixture work becomes its own scope if it is ever wanted.

⚠ **So `t21`'s check count will rise by less than §2 implies**, and `TESTING.md` will carry a named
list of uncovered tools instead of silence. **A suite that says what it does not cover is worth more
than one that appears to cover everything** — which is §B2 stated the other way round.

### The obligation from the ninth package, honoured on its first outing

`CHANGELOG.md` gained an md5 row yesterday, and it changes in **every** package by definition. **Its
row is rolled here**, computed into place after this entry was final. That obligation was recorded in
the manifest precisely so the first package to face it would not miss it; this is that package.

### Verification

**No suite was run and none applies** — no source, no `t*.mjs`, no fixture, no tooling.

- OPERATIONS §A freshness check against a fresh clone at `5ee19aa`; source and artifact unchanged.
- **Full clone (750 commits)**, `git log --diff-filter=A` for every `qa/tools/*.cjs` and `*.mjs`.
- Tool subjects read from each file's own usage line, not inferred.
- `t21` coverage measured by reference count per tool, not by reading it for intent.
- `package_check` run on this package from the committed tool, with `CHANGELOG.md`'s rolled row.

### Still open

- **Item B**, on the corrected premise: route (a), two tools not nine, with the rest disclosed.
- **D-NM-1** — the guarded-set decision blocking New Mexico. **This is the item that changes a
  user's number**, in the conservative direction, and it should go first.
- **K-10**, proposed and not built.
- ⚠ **P1–P28 still not re-validated.** NM's package will be the first that can settle whether their
  six NOT CAUGHT reports are an input artefact or a real defect. **It must not be assumed.**

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (ninth package) — Items A and C: a register row stale for twelve releases, and six files the freshness check could not see

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `29a898d` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `qa/tools/` change, no `index.html`. Documents only.

Builds **Items A and C** of `SCOPE_HOUSEKEEPING_THREE.md`, together and without Item B, per **D-1**.
All five decisions are answered; **Item B remains open** and the scope stays on the I-2 allowlist.

### Item A — `MissingFeatures.md`'s D-10 row was wrong in FIVE ways, not four

The row advertised work as outstanding that had shipped twelve releases earlier — *"MODELLING HALF
STILL OPEN"*, *"dividends and realized capital gains remain absent"* — when `_divLadder` landed at
**v5.53**. It also described the Roth ladder as **five** terms when it is six, and pointed at
`SCOPE_FIX_roth_tab_div_capgain.md` as the live route when that document is **superseded and was
never built**.

**The fifth was found while editing and was in no scope:** the ranking cell still read *"Unranked —
awaiting the product call"* when that call was made and shipped at **v5.52**. A register row cannot
be awaiting an answer that arrived thirteen releases ago. It now reads **Low**.

The corrected row states the position **re-resolved by AST against v5.65**, not by line number — every
line the old row cited had moved — and says exactly what is still open and no more: `capGain_y` is
absent **by resolved decision D-2 (c)**, measured at $342 across the whole ladder, and the
earned-income term is narrower by scope. ⚠ It says so explicitly, because **a register that
re-litigates a settled call is the failure this row's own warning is about.**

⚠ **Confirmed before editing rather than assumed: no suite asserts D-10's text.** `t31` is the only
suite naming `MissingFeatures.md`, and only in a comment; it reads `METHODOLOGY.md`.

### Item C — six md5 rows, and why not the other thirty-one

Before this package **37 of 111 pool files carried no md5 row**, so §A2's offline fallback could not
compare them at all. Not a wrong answer — *no* answer. A stale `OPERATIONS.md` or `TESTING.md` in the
pool was invisible by construction.

Rowed, per **D-3**: `OPERATIONS.md`, `TESTING.md`, `METHODOLOGY.md`, `CHANGELOG.md`,
`MissingFeatures.md`, `README.md` — the documents whose staleness would actively mislead a session
about build state. **Not all 37.** A row is a maintenance obligation and **a stale row is worse than
no row**: it returns a false green rather than no answer, which is exactly what happened to `t8`, and
again on 2026-09-07 when a package changed `package_check.mjs` and did not roll its row.

**The unrowed sets are named in the manifest with reasons**, per D-3's second half, so the next
session reads a decision rather than an oversight: the frozen `AUDIT_*`, `STATUS_*`, `FINDINGS-*` and
`STOP-REPORT-*` documents (history; nothing reads them for build state), and the `controls_v*.sh` set
(never edited after their release). **D-4:** the manifest carries no row for itself and says why — it
cannot be correct at the moment it is written.

⚠ **A DEVIATION FROM D-3, STATED RATHER THAN TAKEN QUIETLY.** D-3's recommendation also named both
app sources. **They were excluded**, on evidence found while building it: the two build tables
already carry `Source md5` for both, and `package_check` **K-4, K-5 and K-6** already assert those
against the pool. A second row would be **a second copy of a fact the build tables own**, free to
drift from it — this project's defining failure, and the reason §A2's `probe_classify` bullet was
wrong in both directions for months. **Covered, not skipped.**

**D-5:** the count ships as *"37 as of 2026-09-07"* beside **K-8's own derivation command**, so the
figure carries its own expiry and cannot drift from the gate. That figure had already been wrong
twice in five days — recorded as *42* when it was 37, and *107 files / 72 rows* when it was 110 / 73.

### ⚠ The obligation this creates, stated plainly rather than discovered later

`CHANGELOG.md` changes in **every** package by definition, and `MissingFeatures.md` changes often. So
**every future package touching them must now roll their rows.** That is six new chances to ship a
stale row — the trap K-8 caught twice this week. Accepted deliberately: K-8 reads the package's own
`knowledge/` copy first, so a rolled row is checked against the file actually shipping and a package
that forgets goes red **pre-ship** rather than after.

### A prerequisite nobody foresaw, and it cost a package

**Item A could not ship until `package_check` was fixed first.** Editing `MissingFeatures.md` turned
K-8 red, because its matcher read a historical md5 quoted in that file's own index row as its live
hash. Decided as **D-C-1 (a)** and shipped as the eighth package, ahead of this one, with controls
P42 and P43. **The fix shipped first and the edit second, so the check that passed is the check that
was in force** — H-3's ordering, for H-3's reason.

⚠ **And the quieter half is the one that matters.** Because K-8 saw a row there,
`MissingFeatures.md` did not appear in the no-row set — so **§3 of the scope listed it as unrowed
while the gate saw it as rowed.** A human and a check disagreed about one file and neither could see
the other. §3's premise was wrong for a reason §3 could not have detected, and the count is now 37
rather than the 42 it claimed for a different reason again.

### Verification

**No suite was run and none applies** — no source, no `t*.mjs`, no fixture, no tooling.

- OPERATIONS §A freshness check against a fresh clone at `29a898d`; source and artifact unchanged.
- **K-8 re-tested with the NEW matcher against the manifest as this package leaves it**: every rowed
  file matches the copy actually shipping, 0 stale, 0 ghost. The six new rows were **computed into
  place, never typed** — `CHANGELOG.md`'s row last, after its own text was final.
- **K-9 re-tested**: all 111 pool files still named.
- Confirmed by AST that no suite asserts D-10's text before editing it.
- `package_check` run on this package from the committed tool.

### Still open

- **Item B** — `t21` coverage for the newer `qa/tools/` scripts, with **K-10** after it. ⚠ **D-2's
  prerequisite is unanswered:** §2 says *"the three tools added at v5.58"*, `qa/tools/` holds **39
  entries**, and a shallow clone cannot date them. **Whether three is still right is UNKNOWN** —
  settle it with a full-history clone before building.
- **D-NM-1** — the guarded-set decision blocking New Mexico.
- ⚠ **P1–P28 still not re-validated.** New Mexico's package will be the first that can settle whether
  their six NOT CAUGHT reports are an input artefact or a real defect. **It must not be assumed.**

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (eighth package) — D-C-1: K-8 was reading a sentence as a hash row

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `6b23149` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `index.html`. Two `qa/tools/` files, the CHANGELOG, the manifest.

### What was wrong

`package_check`'s **K-8** locates hash rows in the manifest with a regex. Its matcher allowed **any
prose** between the filename and the md5:

> `\|\s*` + *file* + `\s*\|[^|]*\|?\s*` + *hash*

So a **description** row that merely *quoted* an md5 was read as that file's hash row. The instance:
`MissingFeatures.md`'s index row carries the historical note *"RE-PINNED TO v5.48 on 2026-08-25
(`6b30580a…`, tree `ba6d598`)"*. **K-8 read that dated statement about a past build as a live hash.**

⚠ **It had been accidentally CORRECT for two weeks**, because the file had not been edited since that
re-pin. **The first edit to it turned K-8 red** — pointing at a row that is not a row, and at a hash
nobody should ever roll, because rolling it would falsify the record of what the file *was* at v5.48.

**Two consequences worth separating.** The gate went red on a correct edit, which is the loud half.
The quiet half is worse: `MissingFeatures.md` therefore did **not** appear in the "carries no md5
row" set, so `SCOPE_HOUSEKEEPING_THREE.md` Item C listed it as unrowed while this check saw it as
rowed. **A human and the gate disagreed about the same file and neither could see the other.** That
disagreement was the defect; the red gate was only its symptom.

### What changed

The matcher now requires the row's own cell — `| <file> | <hash> |`, anchored at the start of a line,
with the hash cell holding **nothing but the hash**. Measured against the live manifest before and
after: **73 → 72 rows, the single dropped entry being the false one.** No legitimate row lost, no
hash disagreement on any file that kept its row.

### Two controls, because one would have proved nothing

- **P42** — a description row quoting a deliberately wrong hash for a real pool file is appended;
  **K-8 must not name that file.** ⚠ Its first draft asserted *"K-8 did not fire at all"* and reported
  a FINDING on a run where K-8 was firing for an unrelated stale row. **A control that cannot tell
  its own mutation from the ambient state is measuring the ambient state** — the P41 and P32 defect,
  now its third occurrence in this harness. It carries a **needle**: the failure line must name
  `t1_units.mjs`.
- **P43** — a real hash row is corrupted and **K-8 must still fire.**

⚠ **The pair is the point, and it is H-6's lesson.** P42 alone would pass if K-8 were simply deleted.
P43 is what distinguishes *narrowed* from *broken*. Both were run and both behave as claimed.

### Why this shipped alone, ahead of the work that found it

**Items A and C of `SCOPE_HOUSEKEEPING_THREE.md` are blocked on this.** Item A rewrites the stale
D-10 row in `MissingFeatures.md`, and until this fix lands *any* edit to that file turns K-8 red. The
fix ships first and the edit second, validated by the fixed gate — the same ordering H-3 used on
2026-09-07, and for the same reason: **shipping both together would mean the check that passed is not
the check that was in force.**

⚠ `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` §6 put *"fixing `package_check`'s gaps"* out of housekeeping's
scope, each needing its own scope. This is that separate package, decided as **D-C-1 (a)**.

### Verification

**No suite was run and none applies** — no app source, no `t*.mjs`, no fixture. `qa/tools/` asserts
nothing about the app and is counted in no release total (§B1).

- OPERATIONS §A freshness check against a fresh clone at `6b23149`; source and artifact unchanged.
- `node --check` on `package_check.mjs`, `bash -n` on `package_check_controls.sh`.
- **The loose and strict matchers run side by side against the live manifest**: 73 vs 72, one
  dropped, none added, no hash disagreement.
- **Section K's controls re-run: P29–P35 and P42–P43 all behave as documented.**
- `package_check` run on this package.

⚠ **P1–P28 were again NOT re-validated** — they need an un-uploaded **app-release** package and this
is an ops package. Six report NOT CAUGHT against one, and **whether that is an input artefact or a
real defect remains UNKNOWN.** New Mexico's package will be the first that can settle it.

### Still open

- **D-NM-1** — the guarded-set decision blocking New Mexico.
- **Items A and C** — built in the session that found this and **held**, unblocked by this package.
- **K-10**, proposed and not built.

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (seventh package) — the stop report's third place, and a document that argued with the shelf it sat on

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `feb7f67` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `qa/tools/` change, no `index.html`. Two documents and a rename.

### `K-9` was RED on the live pool, and had been since the file landed

The New Mexico stop report was filed to `docs/` and to the pool on 2026-09-07 and **named nowhere in
`PROJECT_KNOWLEDGE_INDEX.md`.** `package_check`'s **K-9** — *every pool file is named somewhere in
the manifest* — went red the moment it arrived, and stayed red because the third place was never
done.

**Two of §G's three places, executed in different passes.** That is H-2's failure reproduced four
days later: its pool deletions and its manifest rewrite happened two sessions apart and left K-8 red
in between. §G calls this a **three**-place operation for exactly this reason, and the lesson each
time is the same — **schedule all three into one package.** This package is the third place.

The row is a **description row**, not an md5 row: `File | What it is | Status`, reading **OPEN — the
entry point for the New Mexico session.** No hash row is added. `STOP-REPORT-v5_63-fica-workbench.md`
carries none either, and **D-3's recommendation in `SCOPE_HOUSEKEEPING_THREE.md` is explicitly not to
row this class of document** — a row is a maintenance obligation, and a stale row is worse than none.

### The report contained a false statement about its own destination

It opened *"Session-only. Nothing shipped. No package cut."* — and was then correctly filed in two
durable places. **A document instructing its reader to let it expire, from inside the pool it is
sitting in, is a document arguing with the shelf it is on.**

The recommendation was made without checking precedent and the precedent contradicts it: the repo
holds **eight** stop reports under `docs/`, and the one describing still-live work is **also in the
pool with a manifest row**; the seven completed ones are repo-only. That is H-2's settled shape — a
live handover goes to both and rotates to repo-only once the work it hands over has shipped.
Corrected **in place, with the reasoning kept**, per §I: a retired document keeps its body as the
record of what was believed, and anything reading as a live instruction gets annotated rather than
overwritten.

### Renamed, and a rename is a delete in BOTH destinations

`STOP-REPORT-NM-note-guarded-set.md` → **`STOP-REPORT-v5_66-NM-note-guarded-set.md`**. All eight
siblings carry the version they stopped in; this one did not, and a file that sorts away from its
siblings is one the next scope sweep reads as a different kind of thing.

⚠ The old name is deleted from the **pool** (add-only: a same-name upload would leave both) **and
from the repo** (`DELETE FROM REPO: docs/STOP-REPORT-NM-note-guarded-set.md`, the declaration E-1b
learned to read on 2026-09-07). §G: *"Renaming a file is also a delete-plus-upload: if the old name
isn't removed, the pool holds the same document twice under two names."*

### What the report actually hands over, unchanged by this package

**New Mexico stopped on a DECISION, not a defect, and the premise is good.** `_fromTest` already
supports NM's nine `amount` bands, `cmp` already defaults to the inclusive comparator the statute
needs, and `_floor` already defaults to 65 — the release is a table transcription into tested
machinery, and its direction is **optimistic → conservative**.

⚠ **The stop is that rewording NM's note to state its phase-out silently drops NM out of the
income-limited guarded set**, which `boundaries.mjs` and `t10` both select with
`/income[- ]limited|income limit/i` **against the user-facing note string** — and `t10` still reports
**244 passed / 0 failed**. A shrinking set is invisible to a green suite. **Second occurrence: the
same shape hit New Jersey at v5.54**, is recorded in `boundaries.mjs`'s own comment, and nothing was
built to catch it since. **D-NM-1 is open and the build cannot resume until it is answered.**

### Verification

**No suite was run and none applies** — no source, no `t*.mjs`, no fixture, no tooling.

- OPERATIONS §A freshness check against a fresh clone at `feb7f67`: source and artifact unchanged and
  matching the manifest's Current table.
- **K-9 re-tested against the live pool with the manifest as this package leaves it:** all **111**
  pool files listed, with the renamed report substituted for the old name. It was `UNLISTED: 1`
  before.
- `package_check` run on this package from the committed tool.

### Still open

- **D-NM-1** — the guarded-set decision. Recommendation on record: **(c)**, ship NM on a safe note
  and scope the selector fix separately, *scoped in the same session, not left as an intention*.
- **`SCOPE_HOUSEKEEPING_THREE.md`** — Items A, B, C, decisions answered and queued.
- **P1–P28** run against **New Mexico's own package**, before its zip is sent. ⚠ The earlier phrasing
  *"before New Mexico"* was not executable: they need an un-uploaded **app-release** package, and NM's
  will be the first one. **Whether their six NOT CAUGHT reports are an input artefact or a real
  defect remains unknown and must not be assumed.**
- **K-10** — proposed, not built.

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (sixth package) — D-7: the housekeeping scope retires, and takes its allowlist entry with it

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `f0554c5` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `index.html`. One `qa/tools/` change, one document, the manifest.

### What changed

`SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` is **RETIRED**. H-1 through H-6 are all resolved and built, and
§5's four items are all done — the last of them, the third scope-status sweep, ran in the fifth
package of the same day. Its status line read *"OPEN — decisions resolved, NOT YET BUILT"* until now.

In the same edit, `package_check.mjs`'s **I-2 OPEN allowlist loses that scope's entry.** The entry
named its own expiry when it was written on 2026-09-04 — *"Expires when BOTH of those are done"*,
meaning H-3 and the sweep — and both are done. The allowlist now holds **three** entries:
`SCOPE_STANDING_AUDIT.md`, `SCOPE_HOUSEKEEPING_THREE.md` and `SCOPE_INCOME_CONDITIONING.md`.

### The two halves had to ship together, and that is demonstrated rather than asserted

Either half alone is wrong, in opposite directions:

- **Drop the entry, leave the scope open** → I-2 reports the scope unclassified. A correct
  retirement becomes a red gate.
- **Retire the scope, leave the entry** → I-2 passes, but the allowlist keeps a permanent excuse for
  a scope that no longer needs one. **`I-3` cannot see this**: it fires only on an entry naming a
  file that is *gone*, and the file is still there.

Both were run as negative controls against this package rather than reasoned about. The second is
the more interesting: it is **green**, and green is the wrong answer. That is the whole class of
defect this allowlist keeps producing — an entry that stays correct while its reason rots, invisible
to every check in the project.

### The hash row was rolled, first, and deliberately

`package_check.mjs` carries an md5 row in the manifest, and **this package changes that file.** The
row is rolled to `775e248b28e78e3867a87030f241ad13`, computed into place.

This is called out because the manifest-repair package of **this same day** changed this same file
and did *not* roll its row: K-8 passed pre-ship and went red the moment the package landed, because
pre-upload the check compares the new row against the old pool copy — the two things guaranteed not
to correspond. **The row for a file the package itself changes is the row most likely to need
rolling and the one the gate could least see.**

⚠ **The other document in this package has no row at all.** `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` is
among the **37 pool files carrying no md5 row**, so K-8 cannot see it in either direction. That is
Item C of `SCOPE_HOUSEKEEPING_THREE.md`, still unbuilt, and this is another instance of it rather
than a fix for it.

### An error made and corrected in-session, recorded because the CHANGELOG is where errors go

**The first edit to `package_check.mjs` left the file syntactically invalid.** Removing the allowlist
entry with a replacement that carried its own closing bracket produced **two** `]);` and a
`SyntaxError` on load. It was caught by `node --check`, not by reading the diff — the same lesson as
P41 and the stale manifest row earlier today: **both of that day's errors were caught by running
things and neither by review.** A second, quieter consequence of the same edit was fixed with it: the
comment block above the removed entry described *that* entry and was orphaned by its removal, left
pointing at nothing. It is folded into the removal note instead.

### Three things the retired scope does NOT carry away with it

Named in the retirement note itself, because §G is explicit that an open item is the one thing
retirement destroys and nothing else holds:

1. **`K-10` is proposed and NOT built** — the manifest → pool direction. ⚠ Its naive form (*every row
   names a pool file*) is **wrong** and would fire on dozens of legitimate repo-only rows; the correct
   form is *every row NOT marked repo-only names a pool file*, which makes the marker load-bearing
   and needs its own §B2 control.
2. **`E-1b` is blind to three pool files by rename** — `tools_fixture.jsx`, `vite_config.js` and
   `qa-baseline-README.md`. Its existing `cands.length !== 1` rule, not a new defect. Not built.
3. **`P1–P28` were never re-validated.** They need an un-uploaded **app-release** package; every
   2026-09-07 session had only ops packages. ⚠ **Whether the six NOT CAUGHT reports are an input
   artefact or a real defect is UNKNOWN and must not be assumed.**

### Verification

**No suite was run and none applies** — no source, no `t*.mjs`, no fixture. `package_check.mjs` is
tooling and asserts nothing about the app; it is counted in no release total (§B1).

- OPERATIONS §A freshness check run first against a fresh clone at `f0554c5`. Source and artifact
  unchanged and matching the manifest.
- `node --check` on the edited `package_check.mjs`.
- **Three negative controls, run rather than reasoned about:** entry dropped + scope retired (the
  shipped state) → I-2 green; entry dropped + scope NOT retired → I-2 fires; scope retired + entry
  still present (the old tool) → I-2 green and I-3 silent, which is the failure this package exists
  to prevent and which nothing can detect.
- `package_check` run on the package with the committed tool.

### Still open

- **`SCOPE_HOUSEKEEPING_THREE.md`** — Items A, B and C on **D-1…D-5**, now all answered by the
  maintainer and queued: A + C as one ops package, B with **K-10** afterwards.
- **New Mexico**, the next income-conditioned state, is the next app release — and **P1–P28 get
  re-run before it, not after.**
- **`SCOPE_INCOME_CONDITIONING.md`'s I-2 entry** expires when the fifth state converts. NM, RI, VA
  and NJ remain unconditional and optimistic. Only a person can retire it.

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (fifth package) — the third scope-status sweep: 44 scopes read, and the release that was never written down

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `2c20873` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `qa/tools/` change, no `index.html`. Documents only.

This closes **§5 item 4** of `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` — the third scope-status sweep,
the item that file called its largest and said not to bundle. It was not bundled.

### The headline is a negative result, and it is the cheapest possible outcome

**All 44 `SCOPE_*.md` files were read against what their release actually shipped**, per §I's
standard: the version number in a marker is not evidence, so every claim was resolved against the
CHANGELOG entry for the release it names, and several against the source.

**The defect class the two prior sweeps existed to catch did not appear.** The 2026-08-26 sweep
found seven of nine live-looking status lines describing shipped work; 2026-08-28 found twelve more,
the worst reading **BUILD GATE OPEN** about work shipped twenty-nine releases earlier. This sweep
found **none of that shape**. Every scope claiming FULFILLED has work that shipped, and every one of
the eight carrying a marker *and* live-sounding language turned out to be a retirement banner
quoting its own superseded status line, or prose about a different document's history.

A sweep that finds little is easy to under-report, so it is reported here as a result rather than as
an absence. What it did find is three things, none of them the defect it went looking for.

### 1 · An ops package shipped with no CHANGELOG entry at all

`SCOPE_BOUNDARY_CENSUS.md` records its work as having shipped on 2026-08-23 as the ops package
`danger-close-boundary-census`. **The work is real and present** — `qa/tools/boundaries.mjs`,
`qa/tools/fixture/households.mjs`, `qa/t29_boundaries.mjs` and OPERATIONS §K1 all exist. **There is
no CHANGELOG entry for it.** The package name occurs exactly once in the whole tree: in the scope's
own claim about it.

Its only trace in the release history is a reconciliation footnote inside v5.47, which reads
*"`t29`'s 43 checks are counted per leg here and appeared in neither of that entry's two tables."*
That sentence is the record of a suite arriving, written as an accounting correction.

**This matters more than a missing entry usually would.** §6 of the housekeeping scope calls the
CHANGELOG *"the release history and the only durable record this project has, since it uses no git
tags."* A whole ops package outside that record is recoverable only from a commit nobody has a
reason to look for — the same failure shape as the deleted scope §G's three-place rule was written
for. **No entry is being back-dated here**, because a reconstructed entry is a second answer written
from inference; the scope is annotated in place instead, and the gap is named.

### 2 · A retirement marker that overstates by half

`SCOPE_D10_MODELLING_v5_53.md` is titled *"the Roth tab's omitted dividend **and capital-gain**
terms"* and its status line reads **"BUILT AND SHIPPED AS v5.53."** Only the dividend half shipped.

This is **not** a false marker. The scope's own §6 records **D-2 resolved as (c), dividends only,
gains stay out** — a deliberate call, on a measured $342 across the entire ladder. The v5.53 entry
has a section headed *What this does NOT fix* that says so. Verified at source this session rather
than recalled: the ladder computes `const qdcg = div_y;` with no capital-gain term, while Engine C's
IRMAA MAGI carries `+ capGain_y`.

**The defect is that a reader who stops at the status line concludes both terms landed**, and the
title invites exactly that. Annotated in place; nothing is re-opened.

### 3 · A document that contradicts itself about its own build state

`SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` §4a records **"H-6 · RESOLVED AND BUILT 2026-09-07"** with a
full build record beneath it. Its §9 *Still not built* section, forty lines later, lists **H-6** as
not built. Both were true at different hours of the same day and nothing reconciled them.

This is the shape the project instructions name: two statements of one fact, in one document, that
will not notice each other. §9 is corrected here — it now records both the sweep and H-6 as built,
which leaves it empty of unbuilt items and says so.

### `SCOPE_HOUSEKEEPING_THREE.md` — its three items are now verified, and its own counts were wrong

The scope is legitimately OPEN (*"AWAITING DECISIONS in §5 — do not build yet"*) and none of its
three items is built here. **The decisions D-1…D-4 remain Steve's and are untouched.** What changed
is that all three premises were checked, because a live scope reasoning from a wrong number is the
failure its own §2 demonstrates.

- **Item C's figures were both stale.** It states *"42 pool files carry no md5 row"* and its §3
  states *"107 files, 72 md5 rows."* Measured this session against the live pool with **K-8's own
  regex**, not a hand count: **110 pool files, 73 hashed rows, 37 with no row.** The number moved
  because the four earlier ops packages of 2026-09-07 added rows. Restated — and a **D-5** is raised
  asking whether the item should name the derivation command instead of a number, since this count
  has now gone stale twice in five days.
- **Item A is VERIFIED and is worse than the scope states.** `MissingFeatures.md`'s D-10 row still
  reads *"MODELLING HALF STILL OPEN"* and *"dividends and realized capital gains remain absent."*
  Dividends landed at **v5.53**, twelve releases ago. The row also still describes the Roth tab as
  **five terms** (it is six), and still points a reader at `SCOPE_FIX_roth_tab_div_capgain.md` as
  *"NOT BUILDABLE, four decisions open"* — a document that is superseded and was never built. **Not
  corrected here**: correcting it *is* Item A, and Item A is gated on D-1.
- **Item B is VERIFIED.** `qa/t21_tools.mjs` references `funcmap`, `census.cjs`, `diverge` and
  `residual` and nothing else; `vercensus_list.cjs`, `f6_probe.cjs` and `suite_regex_probe.cjs`
  appear in it **zero times**. §B1's warrant — *an unexpected tool result is a finding on its own,
  provided `t21` is green* — still does not reach them. ⚠ One thing this session could **not**
  settle and did not assume: Item B says *"the three tools added at v5.58,"* and a `--depth 1` clone
  carries no history to date `qa/tools/`'s 39 entries against. Whether three is still the right
  number is recorded as an open question rather than repeated as a fact.

### A structural nuisance worth naming once

**Line-number citations into `CHANGELOG.md` are guaranteed to rot**, because that file grows at the
top. `SCOPE_STATE_FIXTURES.md` cites *"`CHANGELOG.md` L691"* as the evidence for its own build; the
cited text now sits at **L2087**. The claim is true and the pointer is dead. Corrected to quote the
entry by title, which does not move. Two other scopes carry source line numbers from v5.49 that have
since moved; those were re-resolved **by content** with `census.cjs` and left as history, since their
own text marks them as verified-at-a-build.

### ⚠ A trap this package hit while packaging itself, recorded because it will recur

**Annotating a retired scope in place can un-retire it, as far as the gate is concerned.** `I-2`
reads only the **first 12 lines** of each scope. The first draft of the banner added to
`SCOPE_D10_MODELLING_v5_53.md` pushed its status table past line 12, and `package_check` reported the
scope as **unclassified** — a scope retired eleven days ago, failing the retirement check because it
had been annotated. Caught by running the tool, not by review.

The 12-line window is deliberate and good — a 2026-09-07 test confirmed it is what stops I-2 passing
`SCOPE_HOUSEKEEPING_THREE` on ambient `SUPERSEDED` text at line 43. **The rule that follows is: a
banner prepended to a retired scope must carry the retirement word in its own heading.** All three
banners added by this package do.

### What was verified, and how

Freshness check per §A run first and in both directions: **109 of 110 pool files match a repo file
byte-for-byte.** The single non-match is `DangerClose-v5_64.jsx`, the prior-build leg, which the repo
does not keep — expected, not drift. The pool's `index.html` is `src/index.html`, the Vite template
and a build *input*; the built artifact at the repo root is the other one. Manifest re-measured
against the live pool: **73 hashed rows, 0 stale, 0 ghost, 0 unlisted.**

Source-level claims were re-resolved with `qa/tools/census.cjs` rather than grepped, per §B1:
`HEIR_RATE` is `0.22` at module level with two consumers, confirming `SCOPE_D9_HEIR_RATE_DISCLOSURE`;
`capGain_y` and `rmd_y` are summed into MAGI at the sites their scopes claim, confirming
`SCOPE_FIX_realized_capital_gains_v5_32` and `SCOPE_FIX_roth_tab_rmd_magi` at lines that have moved
since those markers were written.

**No suite was run and none applies.** No source, no `t*.mjs`, no fixture and no tool is touched, so
a green reading would be a green reading from an unrelated set — §7 of the housekeeping scope says to
state that rather than quote a total. `package_check` was run on this package.

### Disclosed limitations

- **The sweep's unit of evidence is the CHANGELOG entry**, not the shipped bytes of each release.
  For the three scopes whose claims were checked at source, that is stronger; for the rest it is what
  §I asks for and no more. A release whose entry described work it did not contain would still pass
  this sweep, and nothing in the project can currently see that.
- **Item B's "three tools" figure is unconfirmed**, as above.
- **Nothing in `MissingFeatures.md` was corrected**, though D-10 is known stale, because that edit is
  a gated build item.
- **No entry is reconstructed for the boundary-census package.** The gap is recorded, not filled.

### Still open

- **`SCOPE_HOUSEKEEPING_THREE.md`** — Items A, B and C, gated on **D-1…D-4**, now plus **D-5**.
- **P1–P28 re-validation** at the next app release, before anything else. Six of them report NOT
  CAUGHT against an ops package and **whether that is an input artefact or a real defect is still
  unknown** — it must not be assumed.
- **K-10** — the manifest → pool direction, proposed and not built. The naive form (*every row names
  a pool file*) is wrong and would fire on dozens of legitimate repo-only rows.
- **`SCOPE_INCOME_CONDITIONING.md`'s I-2 allowlist entry**, which expires when the fifth
  income-conditioned state converts. Connecticut shipped at v5.65; **NM, RI, VA and NJ remain
  unconditional and optimistic.** Nothing can detect this; only a person can retire it.

**Provenance.** No source or artifact change: v5.65 remains `7604fac5dab891bb31905544d11072f8` /
`b4ea0bd1d6993aadd0b7fedcfe47e580`.


## ops 2026-09-07 (fourth package) — H-6: the controls that guard the manifest were guarding nothing

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `25af988` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `index.html`, and **no change to `package_check.mjs`** — only its
negative-control harness.

### What was wrong

`package_check`'s **section K** is what guards the manifest, and repairing that manifest cost three
packages this afternoon. **All seven of K's negative controls were measuring nothing.**

They mutated the manifest in a scratch copy of the **pool**. But K reads the manifest from the
**package's `github/` copy** first — deliberately, so that a package whose job is to correct the
manifest is not failed by the correction it ships. §L requires every release package to ship a
manifest, and has since 2026-09-03 — **the same day these controls were written.** So every one of
them edited a file K never opened.

- **P29, P30, P31, P34** reported *mutation did not apply — control is INVALID*. They fail closed,
  which makes them the honest ones. They also hardcoded `v5.61`, `v5.60` and two v5.61-era hashes
  literally, so they went stale the release after they were written.
- ⚠ **P32 reported `CAUGHT`, and the pass was spurious.** K-8 was firing — on a genuinely stale row
  for a different file, not on P32's mutation. **A control that cannot tell its own mutation from
  the ambient state is measuring the ambient state.**
- **P33** fired K-8 where it wanted K-9, for the same reason.
- **P35 passed for the wrong reason.** It removed the manifest from the clone and the pool, but not
  from the package — so K found the package's copy and had nothing to skip.

### The decision, and why route (a)

Two routes existed: **(a)** mutate the manifest K actually reads, or **(b)** hand K a package with no
manifest so it falls back to the pool. **(a)**, because **(b) tests a configuration that never
occurs** — §L requires every release package to ship a manifest, so (b) would be a green reading from
a shape no release has. That is the empty-set failure P23 exists to catch, one level up.

### What changed

The package is copied and its manifest mutated in `github/` **and** `knowledge/`. **Every value is
derived from the manifest under test**, so nothing can go stale at the next release. P32 and P33
carry a **needle** — the failure line must name the file the control itself changed — which is the
fix P41 needed on its first draft the same afternoon. P35 now removes the manifest from the package
too.

**All seven fire.** And a **null control** — the same harness with the mutation writes suppressed —
makes all six mutation-driven controls report NOT CAUGHT, which is what shows they are sensitive to
their own mutation rather than to the ambient state. P35 correctly still passes under the null,
because it deletes files directly rather than through the suppressed write.

### ⚠ The open half, stated rather than implied

**P1–P28 were NOT re-validated.** They need an un-uploaded **app-release** package and this session
had only ops packages; run against one, six report NOT CAUGHT for that reason alone. **Whether that
is input or defect is unknown, and must not be assumed** — assuming it is input is precisely what let
the K block rot for four days. **Re-run the full harness at the next app release, before anything
else.**

### Post-upload close-out of the H-3 package

**J-2 GREEN, K-8 GREEN.** 44 passed / 1 failed / 0 skipped, the failure being D-1, the expected
post-upload inversion. `docs/qa-baseline-README.md` is gone; `qa/qa-baseline/README.md` and the
pool's `qa-baseline-README.md` are both intact at `cbbbb3bae7149cfbcdad7f8e061b5f2a`. **All 73
hashed manifest rows match the live pool: 0 stale, 0 ghost.**

### Still open

- **The third scope-status sweep** (§5 item 4) — the largest remaining item, and the one §5 says not
  to bundle. Two prior sweeps found nineteen stale status lines between them.
- **P1–P28 re-validation** at the next app release.
- **K-10** — the manifest → pool direction, proposed and not built.


## ops 2026-09-07 (third package) — H-3 closed: the duplicate is gone, and the gate could see it go

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `c41c18b` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `index.html`, **and no tooling change** — this package is
validated by the gate the previous one shipped, which is the whole reason the two were split.

### What changed

**`docs/qa-baseline-README.md` is deleted.** It was a byte-identical duplicate of
`qa/qa-baseline/README.md` that landed at `dcc14c1` as an upload artifact — the pool's *flattened*
name uploaded into `docs/` as though it were a document. §G's deletion precondition is met in its
strongest form: the outcome is preserved **byte-identically** at another path and the document
carries no decision of its own.

**Declared as `DELETE FROM REPO: docs/qa-baseline-README.md`** in `README-FIRST.md` — the **first
use** of the declaration E-1b learned to read earlier the same day.

### ⚠ Why this is a separate package from its own fix

H-3 was resolved on 2026-09-04 and could not be executed for a tooling reason: E-1b resolved a
`knowledge/` file to its repo counterpart against the **pre-ship** clone, so a package shipping the
deletion went red **because of the deletion it was shipping.** The fix shipped in the second package
of 2026-09-07; this is the third, and it ships only the deletion.

**Shipping both together would have meant the check that passed was not the check that was in
force.** That is the same discipline as §B2's gate-the-inversion rule, one level up.

⚠ **Contrast with H-2, four hours earlier.** That deletion was split across two *sessions* — pool on
2026-09-05, manifest rows on 2026-09-07 — and left `package_check` **K-8 red for two days**. **A
split between packages is discipline; a split between sessions is a dropped third place.** All three
of §G's places are in this one package: the repo deletion, the pool (untouched, deliberately), and
the manifest row.

### Verified at deletion time, not recalled

- **All three copies byte-identical** at `cbbbb3bae7149cfbcdad7f8e061b5f2a`. ⚠ The scope's §3a
  records `605c263a…` at 5,913 bytes; that is the **pre-correction** pair and is now history — the
  2026-09-04 package rewrote the file to 7,382 bytes. **A hash written into prose goes stale; this
  one did, in three days.**
- **Full reference census across the repo and the pool.** Every mention of the name is prose *about*
  the duplicate. Nothing loads it. The one scope naming the bare basename
  (`SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md`) maps it explicitly to `qa/qa-baseline/README.md`.
- ⚠ **The pool's `qa-baseline-README.md` is NOT deleted and must not be.** It is the legitimate
  flattened name and keeps its own manifest row.

### ⚠ A consequence of the deletion, recorded so it is not found as a surprise

Before this, exactly one repo path carried the basename `qa-baseline-README.md`, so E-1b could
resolve the pool file to a counterpart. There is now **none**, so E-1b skips it. It joins
`tools_fixture.jsx` and `vite_config.js` as **the three pool files E-1b is blind to by rename.**

That is E-1b's existing `cands.length !== 1` rule — *"guessing which one was meant is how a check
starts lying"* — and not a new defect. But it is worth stating plainly: **removing a duplicate
removed the one thing that made this file visible to that check.** The remedy, if it ever matters,
is a rename map rather than a looser match. **Not built.**

### Post-upload close-out of the previous package

Run before this work started, with the now-committed fixed tool: **J-2 GREEN, K-8 GREEN**, 44
passed / 1 failed / 0 skipped, the one failure being D-1 — the expected post-upload inversion. The
pool holds 110 files with no add-only duplicates, every shipped file byte-identical in both
destinations, and every `.sh` still `100755`. **All six new negative controls re-run from the
committed copies and all six fire.**

### Still open

- **The third scope-status sweep** (§5 item 4) — the single largest remaining item.
- **H-6** — section K's negative controls are mostly measuring nothing. ⚠ **Until repaired, they are
  not evidence that section K works.**
- **K-10** — the manifest → pool direction, proposed and not built.


## ops 2026-09-07 (second package) — three gate blind spots of one shape, and the row that proved it

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `d0e17f4` at the start of this work. No app
source, no `t*.mjs`, no fixture, no `index.html`. No app suite applies and no app check total is
quoted.

### ⚠ First: an error in the package shipped four hours earlier, and why nothing caught it

The manifest-repair package changed `qa/tools/package_check.mjs` and **did not roll that file's own
hash row in the manifest.** `package_check` was run four times before the zip was cut and passed
K-8 every time; the post-upload re-run went red immediately, naming `package_check.mjs`.

**K-8 could not have caught it.** It compared the package's NEW manifest row against the OLD pool
copy — and before an upload, those are the two things guaranteed not to correspond. **The row for a
file the package is replacing is exactly the row most likely to need rolling, and it was the one row
K-8 was structurally unable to check.** The error was mine; the blind spot was older.

### The shape, and the sweep it earned

That is the **third instance of one defect** in `package_check.mjs`: a check reading the tree as it
finds it rather than **as the package will leave it**. I-2 was fixed for it and its own comment
states the principle. I-3 was then found reading the pre-ship tree while I-2 read the post-ship one.
Now E-1b and K-8. **When a fix of this shape lands, sweep the whole file for the shape** — that
lesson is written at the E-1b site, where the next reader will be.

- **K-8 fixed** — a row is compared to the package's own `knowledge/` copy when the package ships
  one, and to the pool otherwise. **Controls P39, P40, P41.**
- **E-1b fixed (H-3 route (a))** — it now reads declared repo deletions from `README-FIRST.md`.
  This unblocks H-3, which could not be executed for a year-old reason: deleting
  `docs/qa-baseline-README.md` made E-1b report the package red **because of the deletion it was
  shipping**. **Controls P36, P37, P38.**
- ⚠ **The declaration is an exact line form** — `DELETE FROM REPO: <full repo path>` — **not a loose
  `includes`.** D-2 uses a plain `includes` and that is safe for D-2. It would not be safe here:
  `README-FIRST.md` already names every shipped `github/` path, so a loose match would let a file's
  own upload row silently switch the gate off for it. That is the **P5 defect** one level up, and
  **P38 pins it**: a path merely mentioned must still make E-1b fire.

**Six new negative controls, all firing** (§B2). Two of them assert a gate stays QUIET, which is the
half that is easy to skip: P37 (the deletion declared) and P41 (the row matches). ⚠ **P41 failed on
its first draft** — it grepped for `K-8` alone and could not distinguish its own mutation from the
package's genuinely stale row. **A control that cannot tell its own mutation from the ambient state
is measuring the ambient state.** It was repaired to match on the picked filename; the finding it
accidentally surfaced was real.

### Also in this package

- **Two tool hash rows rolled**, computed into place: `package_check.mjs` and
  `package_check_controls.sh`. A full audit of all **73 hashed manifest rows against the live pool**
  now shows **73 matching, 0 stale, 0 ghost.**
- **H-4 RESOLVED — (a).** `STOP-REPORT-v5_63-fica-workbench.md` stays in the pool and is now a
  **named carve-out in §4**, so the next sweep does not re-propose it.
- **H-5 RESOLVED — (a).** Six history documents that were named only in prose now have proper
  repo-only rows. ⚠ **Six, not the three a row-anchored search reported** — the table parser found
  them, which is §B1 working. Two further prose names correctly get no row: they are struck through
  as retired and the files are genuinely absent from `docs/`.

### ⚠ A NEW FINDING, RECORDED AND NOT FIXED: section K's controls are mostly measuring nothing

Found while validating this package's own controls. **Four of the seven K controls report
`mutation did not apply - control is INVALID`** (P29–P31, P34) and **P33 fires the wrong check.**
The cause is a line of K that is *correct*: K reads the manifest from the package's `github/` copy
first, deliberately — but P29–P34 mutate a scratch copy of the **pool**, which K never reads once a
package ships a manifest, and §L now requires every release package to ship one.

⚠ **P32 reported `CAUGHT` and that pass was spurious** — K-8 fired on the real stale row, not on
P32's mutation. The three reporting INVALID are the honest ones; P32 and P33 are the dangerous pair.
**Until this is repaired, section K's controls should not be cited as evidence that section K
works.** Written up as **H-6** in `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` §4a, with the decision it
needs. Not fixed here: this package already changes two gates, and rewriting seven more controls in
the same pass is how a harness gets rewritten without being re-verified.

### Limitations and what this package deliberately does NOT do

- **`docs/qa-baseline-README.md` is NOT deleted.** The fix ships in this package and the deletion in
  the next, validated by the fixed gate — otherwise the check that passed is not the check that was
  in force. **H-3 is not closed until the deletion lands.**
- **The third scope-status sweep is not run.**
- **H-6 is recorded, not fixed. K-10 is still proposed, not built.**
- **This package's `package_check.mjs` was validated by the COMMITTED tool.** The new behaviour is
  demonstrated separately by the six controls, which run the new tool by design — that is what a
  control harness is for, and it is not the gate.


## ops 2026-09-07 — the manifest catches up with the pool (H-2's third place)

**No version bump. v5.65 remains the current build**, source `7604fac5dab891bb31905544d11072f8`,
artifact `b4ea0bd1d6993aadd0b7fedcfe47e580`, repo HEAD `8486494` at the start of this work. **No app
source, no `t*.mjs`, no fixture and no `index.html` was touched**, so no app suite applies and no
check total is quoted — per `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` §7, a green reading from an
unrelated suite is not evidence about a documentation change.

### What was wrong

§G makes a deletion a **three-place operation**: repo, pool, and the manifest row. H-2 moved two of
them. The maintainer deleted 18 completed-history documents from the pool on 2026-09-05; every one
of them is still in `docs/`, so nothing was lost. **The manifest was not rewritten in the same
pass**, so from 2026-09-05 to 2026-09-07 `package_check` **K-8** was red, naming
`STATUS_v5_42_shipped.md` and `AUDIT_STATE_EXCL65_NOTES.md` as hashed rows for files not in the pool.

### What changed

- **24 manifest rows rewritten as repo-only**, each naming `docs/<name>`. Two carried an md5 and the
  hash came off — those two are what K-8 was reporting. The other 22 were unhashed. ⚠ **No row was
  deleted.** §G prefers retiring to deleting, and a row that names a file is what makes K-9 pass and
  what tells a future session the document exists.
- **The manifest's own 2026-09-04 note** — *"This package does NOT execute H-2… the 24 completed
  history files stay in the pool"* — is marked superseded, with its two wrong numbers corrected in
  place rather than removed.
- **Two `package_check` I-2 allowlist reasons corrected.** Neither entry was wrong; both *reasons*
  had gone stale, which I-3 structurally cannot see — it fires only on an entry naming a file that is
  gone. `SCOPE_INCOME_CONDITIONING.md` read *approved, unbuilt*; v5.65 built the Connecticut half, so
  it now reads **partially built** and its expiry is restated as a count — **when the last of the
  five converts** — instead of a single shipping moment it had already passed.
  `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md`'s reason now names H-3 and the sweep rather than H-2.
- **`SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` §9** carries the H-2 build record, three corrections to
  the scope's own counts, and two new open decisions (H-4, H-5).

### ⚠ The finding worth more than the fix: K-8 saw two of twenty-four

K-8's row regex requires a 32-hex md5, so it checks **hashed rows only**. Twenty-two of the twenty-
four stale rows carried no hash and were invisible to every check in the file — K-9 runs pool →
manifest and is satisfied by a row whose file has gone. **The gate did not measure the problem; it
happened to touch 8% of it**, and the 8% was enough to make the repair look complete.

The 2026-09-04 manifest note said, as reassurance, *"K-8 does not object to an unhashed row."* That
sentence was true, and it is precisely why the drift was undetectable. **A property relied on to
make a change safe is also the property that hides the change going wrong.**

A **K-10** for the manifest → pool direction is proposed and **deliberately not built**. The naive
form (*every row names a pool file*) is wrong: the manifest carries legitimate repo-only rows for
`qa/tools/*`, for retired documents, and now for these 24. The correct form makes the repo-only
marker load-bearing and needs a fixed spelling plus its own §B2 negative control. Bolting that onto
the end of a repair package is how a gate starts lying.

### Limitations and what this package deliberately does NOT do

- **H-3 is not executed and `docs/qa-baseline-README.md` is NOT deleted.** The E-1b fix it needs
  (§3a route (a)) is **not in this package** — see the handoff notes shipped alongside. Shipping the
  fix and the deletion together would mean the check that passed is not the check that was in force.
- **The third scope-status sweep is not run.**
- **H-4** (`STOP-REPORT-v5_63-fica-workbench.md`, still in the pool and not a named carve-out) and
  **H-5** (six history documents named only in prose, with no table row) are **open decisions**, not
  built outcomes. Both are recorded in the scope's new §4a with a recommendation.
- **This package's `package_check.mjs` was validated by the COMMITTED tool, not by itself.** That is
  deliberate: a tool checked by its own new copy is not checked. The I-2 edits are comment and
  reason text only — no predicate changed — so no new negative control was owed.


## v5.65 — Connecticut's pension exemption is now income-conditioned (the first state to move)

**Source `7604fac5dab891bb31905544d11072f8` · artifact `b4ea0bd1d6993aadd0b7fedcfe47e580` · built
from that source, verified by hash.**

**This release changes a number, and it changes it in the direction that makes plans look better.**
v5.64 built the machinery to let a state's retirement exclusion depend on income and deliberately
populated no state with it. This is the first release that uses it, and Connecticut is the first
state — chosen to go first, and alone, precisely because it is the one whose correction is
optimistic. A Connecticut household will see less modelled state tax than it saw at v5.64.

### Why Connecticut was wrong, and wrong in an unusual direction

Five states condition their retirement exclusion on income in law: New Mexico, Rhode Island,
Virginia, New Jersey and Connecticut. Four of them grant an exclusion this model applied
**unconditionally**, handing it to households the statute excludes — optimistic. Connecticut was the
odd one out: it granted **nothing at all**. `STATE_RULES` could hold a dollar amount and a count, not
a phase-out, so Connecticut's schedule was recorded as a zero and disclosed as unmodelled. The
placeholder was pessimistic, and it was the largest single-state dollar error this model carried for
a mainstream household.

Connecticut now uses the TY2026 phase-out schedule from Form CT-1040ES (Rev. 01/26), page 5, read
first-hand and transcribed in `docs/FINDINGS-v5_63-state-statutes.md` §3 rather than re-derived:
100% of pension and IRA income exempt below $100,000 of federal AGI on a joint return ($75,000
single), stepping down through eight bands to nothing at $150,000 and above ($100,000 single).
Applied **per return, not per person**, with **no age test at all** — Connecticut conditions on
income alone, which is why its rule row carries `exclAge: 0` (Kentucky is the existing precedent).

**What that is worth.** A Connecticut couple with $90,000 of retirement income goes from $4,500 of
modelled state tax to $0. At $118,000, from $5,900 to $3,540. At $135,000, from $6,750 to $6,412.50.
At and above $150,000 of federal AGI the statute grants nothing and the two builds agree exactly.

### Limitations and approximations — read these before trusting the figure

- **The income measure carries no dividend or interest income.** The state engine is never passed
  either. A Connecticut household whose income is materially dividend- or interest-driven therefore
  sits **lower** on the band table than the statute would place it and receives a **larger**
  exemption than it is entitled to. This is an optimistic error, it is live today rather than
  hypothetical, and it is stated in Connecticut's own in-app state note.
- **The rate is still a flat 5% approximation** of Connecticut's graduated schedule, as it was
  before. This release changes the exemption, not the rate.
- **Social Security is still approximated** as taxing half the federally-taxable portion, unchanged.
- **The other four states are still unconditional and still optimistic.** New Mexico, Rhode Island,
  Virginia and New Jersey convert one release at a time. Rhode Island will populate on dated TY2025
  figures, because its TY2026 pair is not published until November 2026.
- **The measure is a sum of floats, not a rounded return figure.** Connecticut is the only one of the
  five statutes that is exclusive at the top of a band, so its comparator is `lt` where the other
  four will be `lte`. For whole-dollar income the two agree; in general they do not.

### Tests — 3,246 app checks, 0 failing

Up 177 from v5.64's 3,069. (`t21` 50 and the DOM diff 32 are counted separately, as always.)

| suite | v5.64 leg | v5.65 leg |
|---|---|---|
| t1 units | 185 | 185 |
| t2 engines | 35 | 35 |
| t3 roth | 36 | 36 |
| t4 dom | 252 | 252 |
| t5 storage | 58 | 58 |
| t6 single | 21 | 21 |
| t10 tax cases | 244 | 244 |
| MC parity (t2 compare) | — | 10 |
| t7–t20, t22 (single-leg) | — | 672 |
| t23–t33 (both legs) | 313 | 313 |
| t34 income conditioning | — | 62 |
| **t35 state populate (NEW)** | **82** | **92** |

**`t35_state_populate.mjs` is new and runs on BOTH legs.** The prior leg asserts Connecticut's
pre-populate figures — no exemption, the whole retirement base taxed — and the current leg asserts
the populated ones. A current-leg-only suite could not demonstrate that anything moved, which is the
entire claim of a populate release. It carries the hand-computed cells across six bands in both
filing columns, boundary pins **at** all nine thresholds in each column plus one dollar either side,
the `excl65`-equals-table-at-zero invariant, the note-vs-code disclosure locks, and a cross-engine
parity check that re-prices every row the tax engine produced through the state module directly and
requires agreement to the cent.

Three assertions carry the claim that only Connecticut moved: `t34` §A asserts the populated set is
**exactly** `CT` rather than "at least CT"; `t33`'s two absolute pins are a Georgia household and
hold unchanged; and `t35` §D-7 pins the remaining income-limited-but-unconditional set at exactly
NM, NJ, RI, VA.

### Negative controls

Eleven, in `qa/controls_v565.sh`, all firing: the comparator flipped to `lte`, `exclAge` dropped so
the engine's default 65 floor silently reappears, the base switched to `agiExSS`, the unit made
per-person, a mistyped threshold, a mistyped factor, the single column pointed at the joint
thresholds, the terminal row deleted, a dollar figure written into the dead `excl65` scalar, and the
note reverted in each of two directions.

**One of them found a defect in the new suite rather than in the source, and it is recorded here
because the project's rule is that a control which does not fire is the finding.** The disclosure
check for the dividend/interest omission originally asserted only that the words "dividend" and
"interest" appeared in the state note. A note claiming the exact opposite — that the measure *does*
carry them — would have passed. The control caught it; the assertion was rewritten to require a
negation near the noun, and the matcher's deliberate narrowness is recorded at its site.

### Harness note

Registering the new tag touched 17 suite files. The four baseline registries end `"v564", "v592"` —
the retired v5.9.2 leg sorts last — so a transform anchored on the tag being final missed all four
and reported them as needing no change. The AST verification caught it, not the transform. This is
the same class as v5.64's `t24` ternary miss and v5.63's eighteen-file miss: **a blanket pattern is
the wrong instrument for version registration, and only a parser sweep afterwards is evidence.**

## v5.64 — the income-conditioning measure (no user-visible change)

**Source `02ea7e398a35bbade8a89e6ca57edac0` · artifact `1f10e4a64cc19cd4c68ac49fb933b30a` · built
from that source, verified by hash.**

⚠ **This release changes nothing a user can see, and that is deliberate.** It builds the machinery
that lets a state's exclusion depend on income, and populates **no state with it**. Every household
gets exactly the figures v5.63 gave them. If you are looking for a modelling improvement here, there
isn't one yet — it arrives one state at a time in later releases.

### Why ship machinery on its own

Five states condition their retirement exclusion on income in law — New Mexico, Rhode Island,
Virginia, New Jersey and Connecticut — and the app applies all five **unconditionally**, because
`STATE_RULES` had a scalar and a count and no way to hold a condition. Fixing that means two separate
things: an evaluator, and five statutory tables. Landing them together would mean that a wrong figure
could not be attributed to either. So the evaluator ships first, tested against the real tables
through a synthetic jurisdiction, and each state follows in its own release with its own
hand-computed cells. (`docs/SCOPE_INCOME_CONDITIONING.md` decision B-1.)

It also unblocks a measurement that should have come first: how often any of these thresholds
actually binds for the households this app models. That could not be asked before the income measure
existed.

### What was added

- **The measure**, computed inside `stateTaxAnnual` from arguments it already receives — never
  borrowed from one of the app's four MAGI definitions, which disagree with each other and which
  nothing compares.
- **Two bases**, differing by one term: `agi` (New Mexico, Rhode Island, Connecticut) and `agiExSS`
  (Virginia, New Jersey). `agiExSS` is Virginia's AFAGI exactly; for New Jersey it is an
  approximation of gross income.
- **An optional `exclTest` field** carrying either `bands` (ordered rows, each a dollar amount or a
  percentage) or `taper` (a continuous $1-for-$1 reduction). `excl65` stays a scalar beside it.
- **A per-table comparator.** Four of the five statutes are inclusive at the band top; Connecticut is
  exclusive — its TY2026 table ends "$150,000 and up → 0" and phrases eligibility as *less than*, so
  at exactly $150,000 the factor is zero, not 2.5%.

### Limitations, stated rather than implied

- **No state uses any of this yet.** Every one of the five is still applied unconditionally, which
  is **optimistic** — the app currently grants exclusions to households the statutes exclude.
- **Neither base carries dividend or interest income**, because `stateTaxAnnual` is never passed it.
  A household whose state income is materially dividend-driven will sit lower on a band table than
  the statute would put it. Optimistic, and it will be disclosed in each state's note as it lands.
- **The measure is a float sum, not a rounded return figure.** Real returns round to whole dollars;
  this does not, which is precisely why the comparator is per-table rather than assumed.
- New Mexico carries a known residual for later: its exemption reduces taxable income, so its value
  is the marginal rate, and the model's flat 4.9% **over-values** it by roughly 1.5× to 3× in the
  only range where the exemption exists. A disclosure, not a mechanism.

### Tests

**3,069 app checks, 0 failing** (v5.63 → v5.64, both legs). Tooling, counted separately: `t21` 50,
`domdiff` 32. The rise of 59 from v5.63's 3,010 is `t34` and nothing else — every prior-leg suite
reports the figure it reported before.

| suite | checks |
|---|---|
| `t34_income_conditioning.mjs` (new) | 59 — New Mexico's nine bands, Virginia's taper, Connecticut's ten percentage rows, New Jersey's mixed table, the measure's terms, and the malformed-table floor |
| baseline `t1`–`t6`, `t10`, both legs | 1,662 |
| feature suites | 1,338 |
| MC parity | 10 |

Three things are asserted rather than assumed:

- **No `STATE_RULES` entry carries `exclTest`**, so "populates nothing" is tested, not stated.
- `t33`'s two absolute pins — lifetime tax for a stream-free household, and the ACA solver's lifetime
  conversions — **hold unchanged at v5.64**, which is the direct evidence that no output moved.
- Ten negative controls (`qa/controls_v564.sh`) break the evaluator ten ways and **all ten fire**,
  including both comparator inversions and a Virginia taper that subtracts the excess per spouse
  instead of once — an error that is wrong by a factor of two through the entire phase-out range and
  correct everywhere else, so it passes any two-sided test.

### Two suite defects found while building this, both fixed

Neither was in the app; both were in the harness, and both were found by running rather than reading.

- **`t24`'s `_k` gate was missed by a version-registration script.** The script extended every
  `VER === "v563"` gate except those followed by a ternary, to protect the version-*string* mappings
  in `t1` and `t4` — but `t24`'s is a real gate chain that merely ends in one, so v5.64 silently took
  pre-v5.53 expectations and three checks failed. A blanket rule was the wrong instrument; reading
  the three surviving ternaries individually was the right one. Same class as the eighteen-file miss
  at v5.63.
- **`t33` halted with no result line** — the mode that reads as green to anything counting only
  failures. It was the suite working: a tag registered without a matching pins entry fails **closed**
  rather than silently reading another build's absolute figures.

### Statutory sources

`docs/FINDINGS-v5_63-state-statutes.md` (new) records all five statutes read against primary or
official sources: N.M. Stat. § 7-2-5.2 and § 7-2-7; Connecticut's TY2026 phase-out table from Form
CT-1040ES; New Jersey's tiers from the chaptered P.L. 2021 c.129 text; Va. Code § 58.1-322.03(5)(b)
plus the Form 760 Age Deduction Worksheet, which is what settles the taper's once-not-twice mechanic;
and Rhode Island's thresholds from ADV 2025-22. The populate releases test against those tables
rather than re-deriving them.

## OPS 2026-09-04 · two decisions, and four documents that disagreed about one of them

**No app change.** No source edit, no rebuild, no version bump — **v5.63 remains the current build**,
source `b2deba49e68bee6c29300f2f8cf0a7e3` and artifact `5998e8b60c5f45ded623d500fce09a86`, both
re-verified against a fresh clone at `37cea89`. No `t*.mjs`, no fixture and no `METHODOLOGY` change.
Scope: `docs/SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` (new) and `docs/SCOPE_INCOME_CONDITIONING.md`.

### The disagreement

`CHANGELOG.md`'s **v5.62** entry stated that the income-conditioning field's *"D-2 (b, named-string
`base`) and D-3 (b, additive) are approved."* Three other documents said the opposite: the scope's
own status line, its `PROJECT_KNOWLEDGE_INDEX.md` row, and the comment on `package_check`'s I-2
allowlist entry all described both decisions as unresolved. Nothing compares those four artifacts,
which is the **fifth** recorded instance of this class.

**The chronology was established from git rather than inferred, and it contradicts the obvious
reading.** `docs/SCOPE_INCOME_CONDITIONING.md` landed at `dcc14c1` — the v5.61 commit — already
carrying the ROUND5 re-decided text, and has not been modified since; the file is byte-identical
across the commit, the tree and the pool (`af5015f1…`). The v5.62 entry was written afterwards, at
`00face0`, and it names the **current** options both by letter and by shape. The superseded options
were *one shared base* and `{ upTo, amount }` — neither of which that sentence describes. So the
entry cannot have been a stale approval carried forward onto renumbered text, which is what a
handover note written the same week proposed; the likelier history is the reverse, that an approval
was given and three documents were never updated. **This is not established and is now moot**: the
maintainer approved (b) and (b) in writing on 2026-09-04, and all four documents carry that date.

⚠ **The lesson is the one already recorded four times.** A fact stated in four places drifts in
whichever one is not read next. Two of the four here are machine-readable — a manifest row and a
source comment — and neither is checked against the CHANGELOG by anything.

### What the two decisions were

- **D-2 (b)** — two income measures, `agi` and `agiExSS`, selected by a per-state `base` field.
  Both are expressions over arguments `stateTaxAnnual` already receives, so no call site changes.
- **D-3 (b)** — an additive `{ kind: 'bands' | 'taper', … }` field, with `excl65` **kept** as a
  scalar. Re-verified before approval: `qa/t10_taxcases.mjs` L467 reads `r.excl65 > 0` and
  `qa/t29_boundaries.mjs` L233 reads `(r.excl65 || 0) > 0`, and an array or object compared `> 0`
  evaluates **false** — so replacing the scalar with a rich object empties both guarded sets on
  exactly the states the feature changes, and both checks keep passing. The approval carries a new
  invariant with it: the redundant scalar must be asserted equal to what the band table yields at
  zero income, or it becomes a second source of truth nothing compares.

### The scope's premise was two releases stale and one of its claims was false

`SCOPE_INCOME_CONDITIONING.md` was anchored to v5.60. Re-measured against v5.63 by AST:

- **Every line number moved.** `stateTaxAnnual`'s three call sites are L4003 / L4128 / L5283, not
  L3996 / L4114 / L5265; the four MAGI definitions are L4116 / L4509 / L4970 / L9066.
- **Its central §2.1 claim is falsified.** It read *"the three call sites do not pass the same
  fields,"* with the two Roth sites folding pension and work into `retIncome`. **v5.62 rewrote both
  to gross components** — all three now pass an identical field set. That makes the feature cheaper,
  not more expensive: the burden of proving three shapes sum to one measure is now a same-shape
  comparison.
- ⚠ **`work` no longer means wages.** All three sites pass `work + otherOrd` as of v5.63, so rental,
  annuity and royalty income ride in that argument. Arithmetically that is what a state base should
  contain and the approved expressions are correct as written — but **no disclosure note for this
  feature may call the term wages**, and neither measure carries dividend or interest income at all.
- What did **not** move: `STATE_RULES` is still 51 entries with six universal fields, `exclAge` on
  DE/KY/RI/WI and `ssOffset` on ME/MD.

### Housekeeping — two decisions, and a measurement error owned

A new scope, `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md`, with both of its decisions resolved and neither
of its two remaining work items built.

- **H-1 — keep all 57 `dom_entry_*.jsx`.** ⚠ **The draft's central number was wrong by a factor of
  thirteen.** It gave the 57 files as **251 KB**; they are **18,913 bytes**. 251 KB is the size of
  the whole `qa/qa-baseline/` directory — 257,413 bytes — attributed to the subset inside it, most
  likely through a `du` reading of 4 KB blocks. With the size corrected, deleting the 54 unreachable
  shims saves about 18 KB against a documented capability, and §G's *prefer retiring to deleting*
  governs. The census question was answered by parse, not grep: an AST walk over `qa/` finds **57
  distinct version tags, every one registered** in the `KNOWN_VERSIONS` guards. Those registries name
  tags rather than files, so deletion would not have broken a run — it would have left 57 registered
  tags against three runnable legs.
- **H-2 — move completed history out of the pool, keep it in the repo.** 24 `AUDIT_*`, `STATUS_*`,
  `STOP-REPORT-*` and `FINDINGS-*` files, 283,558 bytes, load into every session's context and are
  all durably committed. They become repo-only with a manifest row each, carving out
  `FINDINGS-v5_63-otherOrd.md` and any audit a live scope cites. **Not executed in this package.**
- **A second finding, made while writing H-1's annotation.** `qa/qa-baseline/README.md` said
  `v510.jsx` was *"recoverable from its git tag."* **There is no such tag** — `git ls-remote --tags
  origin` returns nothing, and OPERATIONS §G has said since 2026-08-09 that this project uses none.
  The false sentence sat in the one place a session would read while hunting for that exact file.
  Corrected.
- ⚠ **H-3, found while packaging: the repo carries the `qa-baseline` README twice.**
  `qa/qa-baseline/README.md` and `docs/qa-baseline-README.md` are byte-identical
  (`605c263afbe2f30a3fc2ba720aba1925`); the `docs/` copy landed at `dcc14c1` as a 90-line single-file
  addition, the shape of the pool's *flattened* name being uploaded into `docs/`. Nothing points at
  it. This is the class §G names under *One manifest, one copy* — and it would have gone stale **in
  this package**, which edits the real file and would have left the duplicate still claiming a git
  tag that does not exist. **Decided: delete the `docs/` copy. Not executed here** — see below.
- ⚠ **A tooling finding, and it is a second instance of a known shape.** `package_check`'s **E-1b**
  resolves a `knowledge/` file to its repo counterpart by basename **against the clone**, i.e. the
  pre-ship tree. A deletion cannot be expressed in a zip, so a package that removes a repo file is
  marked red **by the removal it is shipping**. That is precisely the defect **I-2 was fixed for**,
  whose own comment states the rule: *"the question worth asking is not 'is the tree clean now' but
  'will the tree be clean once this lands.'"* E-1b was left reading the pre-ship tree alone.
  **What this package did instead of deleting:** shipped the corrected README to **both** repo paths,
  so no copy carries the false sentence. The duplicate survives one more package, deliberately.
- **The pool has no orphans, and that is worth recording rather than re-deriving.** Compared in both
  directions by content hash: every pool file has a byte-identical committed counterpart except four,
  and all four are expected — the rotated `DangerClose-v5_62/63.jsx` pair, plus `tools_fixture.jsx`
  and `vite_config.js`, which are the mount's renamings of `qa/tools/fixture/fixture.jsx` and
  `vite.config.js`.

### Limitations of this package, stated rather than implied

- **No app suite was run, and none applies.** No source, suite or fixture changed, so a green total
  would be a reading from an unrelated set (§B2). The package was verified with `package_check`
  against a fresh clone; that tool asserts about the delivery and is counted in no check total.
- **The `package_check` allowlist entry for `SCOPE_INCOME_CONDITIONING.md` was rewritten, not
  removed**, because the scope is approved but unbuilt. Its expiry moved from *when the decisions are
  made* to *when the field ships*. ⚠ I-3 cannot catch either — it fires only on an entry naming a
  file that is gone, and this file will still be there.
- **H-2 and H-3 are decided and not done.** The 24 files remain in the pool with their existing
  rows, and `docs/qa-baseline-README.md` is still in the tree.
- **The third scope-status sweep is not started.** 43 `SCOPE_*` files; the two prior sweeps found
  nineteen stale status lines between them, and §I is explicit that reading what each release
  actually shipped is the expensive, unavoidable part.
- **No statutory figure in this package was re-verified.** Nothing here ships one. The income
  conditioning build must check all five states against primary sources at build time — Rhode Island
  especially, whose own filing guide prints a threshold its indexing statute cannot produce.

## v5.63 · the Roth comparator charged payroll tax on rental income, 2026-09-04

**FICA is now charged on earned income only, in the Roth strategy comparator. Nothing else moves.**
Scope: `docs/SCOPE_ROTH_FICA_OTHERORD.md`.

`runRothStrategies` built `annualWork` from **every** ordinary income stream — rental, annuity,
royalty, "other" — and then charged 7.65% payroll tax on the total, at **both** of its FICA sites.
Rental income has never been subject to FICA. The Taxes engine has always split earned from
unearned income for exactly this reason (`kind: "work"` / `excludeKind: "work"`); this engine never
did.

**This changed which strategy the Roth tab recommends.** The tab ranks on `estate`, and a tax that
should not exist is real money in that comparison. On a 336-household grid the top-two ordering
flipped at **36 points**, the smallest shipped gap among them **$301**, concentrated in single
filers. ⚠ That is an **existence result on a grid this project chose** — it is not a prevalence and
no percentage should be read off it.

**The fix is one line of substance.** `annualWork` gains a `kind: "work"` filter; a new
`annualOtherOrd` picks up the complement. **The two FICA expressions are not touched** — they
become correct once `work` stops carrying non-work income. The two state-tax call sites then add
`otherOrd` back explicitly (`work + otherOrd`), so **the state base is arithmetically the same
value it was**; the decomposition is now visible rather than implied. Two further sites are
deliberately left unfiltered and now say so in comments: the ladder solver needs the ordinary
total, and nothing there charges FICA.

⚠ **Second-order effects are real and run against intuition.** A smaller tax bill leaves a larger
taxable balance, which pays more dividends, which raises MAGI. On a household near an IRMAA
threshold the surcharge can **rise** even though lifetime tax falls: measured **+$2,300** on one
household and **−$1,740** on another. **This release does not claim IRMAA or NIIT are untouched**,
and the direction is not fixed. `METHODOLOGY` §6 says so.

⚠ **A v5.62 disclosure is WITHDRAWN, not quietly deleted.** v5.62 disclosed that `otherOrd` was
computed only in the Taxes engine and that "engine agreement is exact only for households without
such income", and pinned it in the suite as `[KNOWN DEFECT pre-otherOrd]`. Measured by execution at
this build, `stateTaxAnnual` was already receiving the same ordinary total either way — **the gap
that text described did not exist for the state layer.** The pin asserted only that adding $12,000
to a taxed base changes the tax, which no release will ever falsify, under a label that claimed
something false. The pin is retired, `METHODOLOGY` quotes the withdrawn text before retracting it,
and the real defect the investigation found instead is the FICA one above.

**Testing — 3,010 app checks, 0 failing**, run from the packaged copies. v5.63 leg **1,164** ·
v5.62 leg **1,164** · run-once **672** · parity **10/10**. Tooling 82.

⚠ **MC parity is 10/10 and it is EXPECTED AND BLIND**, the same way it was at v5.62. The three
parity fixtures carry no income streams, so the changed code path is never entered. **Parity is not
evidence here**; the suite work below is.

**The boundary census grew, under §K1's maintenance rule.** `qa/tools/boundaries.mjs` gains a
`stream_kinds` row and `t29` goes 54 → 61 per leg. The rule is that a release fixing a defect
invisible in the example data adds the boundary that hid it — and the row that already existed,
`income_streams`, would **not** have caught this one: it counts streams, so a work-only stream reads
*exercised* while never reaching the FICA path. What had to be non-zero was a **non-work** stream.
A `streamsWork` fixture drives the new row in the opposite direction from the old one, because a
census row nothing can move is the failure `t29` §E2 already records against the SS-offset row.
Two controls, both firing: stripping the fixture's `kind: "work"`, and collapsing the row to count
all streams.

⚠ **The FIX's own contribution to the suite total is +62, and that is the measurement of a gap, not
reassurance.** (`t33` adds 32 per leg and the retired `t10` pin removes 1, so +31 per leg, +62
across two, carrying 2,934 → 2,996; the census work above adds a further +14 to reach **3,010**.
This entry said **+64** when it was written and `TESTING.md` said +62; the arithmetic here is the
one that holds, and the error is recorded rather than silently corrected.) Before this
release **no fixture in the suite carried a non-zero income stream** — measured by AST at this
build: 15 sites set `incomeStreams`, every one `monthly: 0` or `[]`, eleven of them the identical
deliberate line that neutralises the demo part-time taper so cross-engine comparisons stay clean.
That convention is right, and its side effect was that **the defective code path was unreachable
from every fixture the suite had.** 2,934 checks were green against a live defect for as long as
the feature has existed.

**`qa/t33_roth_stream_fica.mjs`, new — the first stream-bearing fixtures this suite has ever had.**
32 checks per leg, gated: the v5.62 leg asserts the defect, the v5.63 leg asserts the fix, so both
legs stay green and honest. Hand-verified to the dollar: a $2,000/month stream is $24,000/yr, below
the OASDI wage base, so FICA is `24,000 × 0.062 + 24,000 × 0.0145 = $1,836`/yr; the engine's span
was **measured** by single-year stream windows, not assumed, at 2027–2058 = 32 years; and the
lifetime delta between an identical rental and wage stream is exactly `32 × 1,836 = $58,752` once
the second-order channel is closed. Also covered: the work/non-work complement with **both sides
asserted non-zero first**, annuity and untyped streams (a stream with no `kind` defaults to
`"other"`, so a fix special-casing "rental" would pass the main test and fail this one), and an
inertness control proving a stream-free household is untouched.

⚠ **A first version of the ACA group was blind, and a negative control caught it.**
`_estSaleGain` — the engine's second FICA site — is reached **only** from the STAY UNDER ACA CLIFF
solver; setting the ACA fields and reading the slider row never enters it. That version showed a
large, real, entirely main-path delta and looked like coverage, and controls C2a and C4 did not
fire against it. Per §B2 the non-firing was treated as the finding and the test was repaired, not
the control. The group now reads `key: "acaCliff"` and asserts on `totConv`: the cliff solver sizes
each year's conversion against an estimated sale gain that includes FICA, so the wrong FICA moves
the conversion the strategy chooses — a field nothing else in the suite can move.

**`t10` §2E 103 → 102**: the retired `otherOrd` pin, replaced by a note recording why it went and
pointing at `t33` §B rather than restating it.

**Five negative controls (`qa/controls_v563.sh`), each failure read.** The engine has two FICA
sites and one source edit corrects both, so a control reverting them together proves nothing about
either: **C2a and C2b simulate the two half-fixes by pushing the unfiltered total back into one
site at a time.** C2a fires exactly 2 checks, both in the ACA group, while the main-path groups stay
green — the partial-ship case. C1 (revert the filter entirely) fires 11; C2b fires 11; C3 and C4
revert the two state-base additions separately and fire 9 and 2.

**The suite had to be taught the `v563` tag, and that work was not in the repo.** Sixteen suites gate
behaviour on an enumerated version list; two ladder heads (`t1`'s `verStr`, `t4`'s `_badge`) take a
new arm, sixty OR-chain members and sixteen registry/`ORDER` arrays take the tag, and
`qa/qa-baseline/dom_entry_v563.jsx` is new. `t24`'s `_k` is the trap: it ends in a ternary
**condition**, not a ladder arm, so a transform that skips ladder heads skips it silently. It was
caught by per-file counts failing to reconcile, not by the run — both branches happened to agree on
this release, so the suite would have stayed green while the tag took the wrong branch.

⚠ **§N3a's recipe and the repo disagreed about the build, and the repo was right.** Rebuilding v5.62
from its own unmodified source under the documented four-file scaffold gave
`99dbcac2fbe3dbc8e0207278e9179ea8` against the published `ceb7fb4af26560b0944030ffb5da1d6a` — an
85-byte difference confined to a single 22 KB window inside the vendored `mammoth` bundle
(`Object.create(null)` where the published file has `{}`); the app's own code was byte-identical.
The cause is that v5.62's committed **`package-lock.json`** pins `mammoth` to 1.12.1 while §N3a
copies four scaffold files and never copies the lock, so a plain `npm install` resolves 1.12.2.
Rebuilt with `npm ci` from that lockfile, v5.62 reproduced its published artifact **exactly**. The
lockfile v5.62's own entry argued for did land; the recipe that would use it did not. **§N3a now
names `package-lock.json` as a fifth scaffold file and `npm ci` as the install step**, and this
release is built that way. The pin is no longer something that has to be remembered.

**Source md5** `b2deba49e68bee6c29300f2f8cf0a7e3` · **built `index.html` md5**
`5998e8b60c5f45ded623d500fce09a86`. Toolchain: node 22.22.2, vite 5.4.21, @vitejs/plugin-react 4.7.0,
vite-plugin-singlefile 2.3.3, rollup 4.63.1, react/react-dom 18.3.1, mammoth 1.12.1 (from the
lockfile), jsdom 30.0.1.

**Not in this release:** a `t31` extinction key. The scope assumed one would be needed; measured, the
withdrawn v5.62 disclosure never reached a user surface — the gap language returns zero hits in both
the render tree and `DOCS_HTML` — so there is nothing to invert and an added key would be vacuous,
which `t31`'s own header warns against twice with two recorded instances. The honest candidate is the
second-order IRMAA caveat, and that needs new user-facing copy, which was outside this scope.

## v5.62 · the three engines share one state-tax calculator and disagreed anyway, 2026-09-03

**State tax rises in the Roth outputs. Nothing else moves.** Scope: `docs/SCOPE_ENGINE_STATE_PARITY.md`.

`stateTaxAnnual` grants the state retirement exclusion to `retIncome + pen` and adds `work` outside
it. The Taxes engine passed gross components. **The two Roth engines passed
`retIncome: max(0, taxableOrd − ssT)` and no `pen` or `work` at all** — wrong twice over:

1. `taxableOrd` is net of the **federal standard deduction**. `METHODOLOGY` describes the state layer
   as an effective-rate approximation that explicitly does **not** model standard deductions, so a
   federal deduction was being netted off a state base.
2. It is undecomposed, and the Roth engines' income base is `pen + work + rmd` — so **wage income was
   folded into `retIncome` and collected the state RETIREMENT exclusion.** In the five states that
   exempt retirement income entirely (IL, MI, MS, IA, PA) that exempted the household's **wages**.

**The three engines disagreed in all 42 taxing jurisdictions**, by up to **$2,656/yr** on an ordinary
household (67/67 couple, $28k wages, $18k pension, $22k RMD, $8k qualified dividends and gains, $18k
taxable SS), **always in the same direction: the Roth engines under-taxed.** Roth conversion and
break-even output was therefore optimistic against the model's own Taxes tab. All three call sites
now pass gross components.

⚠ **`METHODOLOGY` asserted the opposite, and that is probably why nobody looked.** It read *"One
shared calculator serves the Taxes engine, the Roth strategy comparator, and the Withdrawal engine,
so the three can never disagree."* They shared the calculator but not the arguments. Corrected: what
guarantees agreement is the argument shape, and that shape is now asserted. A second, unrelated stale
clause in the same file — claiming RI's and WI's age-67 floors are not applied, which v5.60 applied
and the same document says so twelve lines above — is corrected in the same pass and disclosed
separately rather than folded in silently.

⚠ **Limitation, pinned rather than hidden.** `otherOrd` — non-work ordinary income such as rental or
annuity streams — is computed **only** in the Taxes engine; the Roth engines' base never carries it.
**Engine agreement is exact only for households without such income.** Fixing it changes federal tax,
Social Security taxation, IRMAA and bracket-fill conversion sizing, so it is a separate release with
its own hand-verified cells. The suite pins the gap as `[KNOWN DEFECT pre-otherOrd]`, which flips
when that lands.

**Testing — 2,934 app checks, 0 failing.** v5.62 leg **1,126** · v5.61 leg **1,126** · run-once **672**
· parity **10/10**. Tooling 82. `smoke_built` **16/16**.

⚠ **MC parity is 10/10 and it is EXPECTED AND BLIND.** §E treats parity as the "engines unchanged"
line and this release deliberately changes engine output, so a green parity needs explaining rather
than accepting. `PORTFOLIO` carries no `stateCode`, so all three parity fixtures resolve to
`stateCode: null` and never consult `STATE_RULES`. **Parity cannot see this change.** It is not
evidence of no regression here; the suite work below is.

**The real content of this release is the tests, because nothing caught this.** A scratch fix was
built first and every suite touching Roth or state tax run against it: t3 36, t4 252, t23 25, t26 25,
t32 12, t10 240, t2 35, t7 41, t8 40 — **all green, zero checks moved.** The suite had no opinion
about Roth-engine state tax at all.

Coverage was added to the two files that already owned the class, not to a new suite:
- **`t8_invariant` 40 → 42** (run-once, so **no version-ladder cost**). It already carried
  `[EXTINCTION v5.56] every stateTaxAnnual call site passes GROSS SS` — the same class — and already
  excluded the definition and stripped comments. Two checks added: no call site passes a
  post-deduction `taxableOrd` as `retIncome`, and every site passes `pen` and `work` as bound
  identifiers.
- **`t10` §2E 98 → 103**: wages still taxed in all five retExempt states; an unused exclusion does
  not spill onto wages in the nine states with a $20k+ exclusion; two hand-computed cells (PA
  $1,105.20, IL $1,782, worked independently to the dollar); and the `otherOrd` pin. **No version
  gate** — v5.62 does not change the calculator, only the wiring, so these hold on both legs.

**Six negative controls (`qa/controls_v562.sh`), each failure read.** C0 correctly silent. The defect
had two independent halves and a partial fix would have been easy to ship, so they are reverted
**separately**: C1a (revert the deduction netting) fires both extinction checks; C1b (keep gross
totals but fold `work` back into `retIncome`) fires **only** the decomposition one. C2 adds a fourth
call site and is caught. C3 grants the exclusion to wages and fires 5 checks including both hand
cells. C4 catches a stale version site.

✅ **§N3a passed:** v5.61 rebuilt byte-identically to its published `ba3968f2…` with **`mammoth`
pinned to 1.12.1** (`--no-save`; `package.json` unchanged). The v5.61 reproducibility finding paid
off one release later — and still argues for a committed lockfile, since the pin worked only because
it was remembered.

**Source md5** `827566da23ba3f37a3d7a66432afddfe` · **built `index.html` md5**
`ceb7fb4af26560b0944030ffb5da1d6a`. Toolchain: node 22.22.2, vite 5.4.21, @vitejs/plugin-react 4.7.0,
vite-plugin-singlefile 2.3.3, rollup 4.63.1, react/react-dom 18.3.1, mammoth 1.12.1 (pinned),
jsdom 30.0.1.

**Not in this release:** `otherOrd` in the Roth engines (next); the income-conditioning field, whose
D-2 (b, named-string `base`) and D-3 (b, additive) are approved and were waiting on this; Connecticut;
the eight-state `ss: 0.5` blend.

## OPS 2026-09-03 · the manifest went stale at v5.61, and it had turned off two negative controls

**No app change.** No source edit, no rebuild, no version bump — **v5.61 remains the current build**,
its source `7e1a02881256142c5b9206045e76e2ec` and artifact `ba3968f24e06eb989d9171cbd9a8c796`
untouched and re-verified. This corrects `PROJECT_KNOWLEDGE_INDEX.md` and builds the check that
would have caught it. Scope: `docs/SCOPE_MANIFEST_D4.md`, now **FULFILLED**.

**The defect.** The manifest was omitted from the v5.61 release package. Both build tables were left
describing v5.60, the §A2 fallback hash table carried **21 wrong hashes**, one row named a file the
rotation had removed, and **12 pool files had no row at all** — eleven of them predating v5.61.
Nothing caught it; post-ship verification did. §G has always called the manifest mandatory, but §L,
the checklist a session actually packages from, never named it. §L now does.

⚠ **D-4 as recorded for eleven releases would NOT have caught this.** It was carried as *"nothing
compares the manifest's two build tables"*, and this file's own manifest proposed a one-line
assertion. Run against the real defect, that assertion **passes**: neither table rolled, so
Current v5.60 / Prior v5.59 stayed mutually consistent while the document described the wrong build.
Internal consistency is the one property a never-updated manifest preserves. The check therefore
anchors the manifest to **external truth** — the clone's CHANGELOG, its source and artifact, and the
pool's actual contents. Had D-4 been built as described it would have shipped green through the
defect that motivated it. That is §B2 one level up: a check carried for eleven releases on an
untested description of what it would catch.

⚠ **And the stale manifest had silently disabled two negative controls.** `package_check_controls.sh`
derives P20 and P21's mutation anchor from the manifest's Current-build table. With the manifest
stale that anchor was the v5.60 hashes, which do not appear in the newest CHANGELOG entry — so the
mutation was a no-op and both controls reported NOT CAUGHT while the checks they guard were
innocent. Verified against the **unmodified** gate, so it predates this work. **Both fire again once
the manifest is correct.** The manifest is not documentation; it is an input the verification layer
reads as ground truth, and its staleness propagated into that layer.

**A second rotted control, unrelated.** P26 hardcoded a scope that has since left the OPEN allowlist,
so it could not trip I-3 and had been reporting NOT CAUGHT for an unknown number of releases. It now
derives its target from the live allowlist. **P17 remains non-firing**, is already recorded in
`TESTING.md`, and is deliberately not touched here.

**What shipped.** `package_check.mjs` gains **section K** (K-0 through K-9). K-1..K-3 anchor the
Current table to the committed tree; K-4..K-6 anchor both tables to the pool; K-8 checks every hashed
row against its pool file; K-9 asserts §G's rule that every pool file is named. **K-7 is D-4 exactly
as originally written and ships labelled WEAK**, because it catches the other real case — one table
rolled and the other not, which ran for seven releases — but cannot see a both-tables-stale manifest.
It is never the only guard.

`package_check_controls.sh` gains **seven controls, P29–P35, all firing**. P29 reproduces the v5.61
defect and asserts both that K-1 catches it and that **K-7 does not**. P34 is K-7's justification.
P35 asserts K skips loudly with no manifest rather than passing blind. The harness's section-matching
class was widened from `[A-I]` to `[A-K]` in **both** runners.

`OPERATIONS.md` §L now names the manifest as a release deliverable, and §G records **what does not
rotate**: the pool keeps every `controls_v*.sh`, while `dom_entry_*.jsx` rotates with its source leg.
A v5.61 delivery note wrongly told the maintainer to delete `controls_v559.sh`; the pool already held
`controls_v557.sh` and `controls_v5571.sh`, contradicting the instruction in plain sight.

**Verification.** Section K reproduced the scope's predicted fired/passed table against the live
defect before the fix, and is green against the corrected manifest. All seven new controls fire, and
the pre-existing ones still do. `package_check` on this package with `KIND: ops`. **No app suite was
run and no check count is claimed, because no app file changed.**

## v5.61 · Rhode Island's own filing-season guide states a threshold its statute cannot produce, 2026-09-03

**One string changes. No computed output moves, and no engine code is touched.** `STATE_RULES.RI.note`
gave Rhode Island's TY2025 MFJ pension/SS threshold as **$133,500**; it is **$133,750**. The AGI cliff
is not modelled, so no code path reads the figure — but it ships to users in the app's own note, and a
user checking the app against Rhode Island's guide would have found the app wrong. That is why this is
a release and not a documentation edit. Parent findings:
`docs/AUDIT_STATE_INCOME_BASES_ROUND5.md` §2e and §8; scope `docs/SCOPE_RI_THRESHOLD_CORRECTION.md`.

**Two official Rhode Island publications disagree, and the statute settles it.**

| source | date | TY2025 single / HoH / MFS | TY2025 MFJ |
|---|---|---|---|
| **ADV 2025-22** | 3 Nov 2025 | $107,000 | **$133,750** |
| **PUB 2026-01** Retirement Income Guide | Feb 2026 | $107,000 | **$133,500** |

PUB 2026-01 states $133,500 **nine times** — its threshold table, two body sections, and seven worked
examples. It is the later document and the filing-season guide, which is why the project adopted it,
and why this was not a careless figure to have taken.

**It is still wrong.** R.I. Gen. Laws § 44-30-12(c)(8) sets base-tax-year-2000 amounts of $80,000
(single/HoH/MFS) and $100,000 (MFJ/QW) and adjusts **both by one cost-of-living factor**. TY2024
confirms the mechanism exactly: $104,200 ÷ $80,000 = $130,250 ÷ $100,000 = **1.3025**. Against the
verified TY2025 single figure of $107,000, $133,500 would put the MFJ threshold at 1.3350 times its
base while the single sits at 1.3375 times its own — a gap of 0.0025, roughly **four times larger than
any rounding step in the statute can produce**. The admissible MFJ value is **$133,750 or $133,800**.
$133,750 is also the only one preserving the exact 1.25 ratio TY2024 confirms. **ADV 2025-22 is right.**

The corrected note cites its source — `per ADV 2025-22` — rather than arguing the point in a state-rule
note. `METHODOLOGY.md` carries the full derivation.

**Limitations, stated rather than implied.** The cliff itself remains **unmodelled**: the app still
ignores it entirely, so a household above the threshold is still modelled optimistically. This release
corrects what the app *says* the threshold is, not what it computes. RI's TY2026 thresholds are **not
obtainable** — the state publishes them a year in arrears and the November 2026 advisory does not
exist yet; ROUND4's open item to read them closes as not-yet-available, not as obtained. The
`$133,800` alternative cannot be excluded from the rounding bound alone; $133,750 is adopted because
ADV 2025-22 states it and it preserves the confirmed ratio.

**Testing — 2,920 app checks, 0 failing.** v5.61 leg **1,121** · v5.60 leg **1,119** · run-once **670**
· parity **10/10**. Tooling 82 (`t21` 50, cross-version DOM diff 32), counted separately. Built-artifact
smoke `smoke_built` **16/16**.

`t10` L873's assertion pinned the literal string `TY2025: $133,500` and ran on **both** legs, so
correcting the note would have failed the current build while leaving it would have blocked the fix.
It is now a **version-gated split** at `_v >= 561`, matching the idiom used for v5.60's `exclAge`
change eight lines above: the v5.61 branch asserts the corrected figure, and the `else` branch pins
$133,500 as `[KNOWN DEFECT pre-v5.61]` for the frozen legs, which legitimately carry it. Asserting a
correction against a frozen build is the v5.27 defect; inverting an assertion without gating it is the
v5.28 defect that the v5.27 fix itself caused. Two new checks ride with it on the v5.61 leg: an
extinction assertion that `133,500` is gone from the note, and a pin on the `ADV 2025-22` citation.

**Six negative controls (`qa/controls_v561.sh`), all read individually.** C0 (comment-only) correctly
silent; reverting the figure fires 3 checks; dropping the citation fires 1; wording RI off the
`income[- ]limited` matcher fires the by-decision pin; leaving one of the four version sites at v5.60
fires `t1`'s STATIC check; and falsifying the *pre-v5.61* pin on the frozen v5.60 leg fires — proving
the gated split is a split rather than an inversion. **The citation control initially did NOT fire,
and that verdict was correct**: nothing pinned `ADV 2025-22`, so the clause could have been deleted
silently. The remedy was a new assertion, not a relabelled control.

⚠ **The rewording was checked against every live matcher before the source was edited**, by executing
the regexes rather than searching for them. Rhode Island is one of only four states holding `t29`'s
F-6 income-limited set open; that set stays at four (NJ, NM, RI, VA). A whole-suite AST sweep of 376
regex literals found exactly two whose verdict changes: the intended `$133,500` pin, and
`t29_boundaries.mjs` L112's `/75/`, which matches because `$133,750` contains `75` and which tests an
RMD-age row that never sees a state note. Read, adjudicated, innocent.

⚠ **Build reproducibility — `mammoth` moved, and it is pinned for this build.** Rebuilding v5.60 from
its own unmodified source did **not** reproduce its published artifact: `mammoth` resolves through an
unpinned caret and had advanced from 1.12.1 to 1.12.2, changing the vendored bundle. Pinned back to
**1.12.1**, v5.60 reproduces byte-identically (`278cb053b93f4b389c99f1e1ad31b591`), and v5.61 is built
against that pin — so applying this release's five textual edits to the v5.60 artifact reproduces the
v5.61 artifact **exactly**. The dependency change is therefore *not* riding along in this release.
`package.json` is unchanged (`--no-save`). A committed lockfile remains the real fix and is not this
release's work.

⚠ **`qa/tools/package_check.mjs` gains one allowlist entry**, and it is data rather than logic.
`SCOPE_INCOME_CONDITIONING.md` is gated on decisions D-2 and D-3, which are unresolved, so it is
legitimately OPEN and none of the words check `I-2` looks for is true of it. That scope landed in the
tree on 2026-09-03, so **any** package cut after that date would have failed `I-2`; this release is
the first one cut. The entry records its own expiry — it must be removed when D-2 and D-3 are
decided. The alternative was writing a false status line into a scope, or shipping a zip the gate
refuses.

**Source md5** `7e1a02881256142c5b9206045e76e2ec` · **built `index.html` md5**
`ba3968f24e06eb989d9171cbd9a8c796`. Toolchain: node 22.22.2, vite 5.4.21, @vitejs/plugin-react 4.7.0,
vite-plugin-singlefile 2.3.3, rollup 4.63.1, react/react-dom 18.3.1, mammoth 1.12.1 (pinned), jsdom
30.0.1.

**Not in this release**, and recorded so the omissions are deliberate: Connecticut, where from TY2026
the model taxes 100% of a household's pension, 401(k) and IRA income that the statute exempts below
$100,000 AGI — the largest single-state error in the current set; the income-conditioning field; the
eight-state `ss: 0.5` blend; and modelling the RI cliff.

## v5.60 · Rhode Island and Wisconsin gated their exclusions at 65, not the statutory 67, 2026-09-02

**Two `STATE_RULES` properties are ADDED — `exclAge: 67` on RI and on WI — and two notes are
rewritten. No figure moves and no engine code changes.** `exclAge` already existed and is read in
exactly one place, the `_floor` constant in `stateTaxAnnual`, so the modelling change is two
properties. Output moves for any household domiciled in either state, as at v5.59 and unlike v5.58.

This is the half `SCOPE_EXCL65_STALE_RI_WI.md` deliberately held back. ROUND4 §6 **D-D** deferred it
on the grounds that a gate change landing beside a figure change cannot be attributed if a downstream
figure moves; the figures shipped at v5.59 and `t10` §2E pins them, so a gate-only release now has
clean attribution. Parent findings: `docs/AUDIT_STATE_EXCL65_ROUND4.md` §2b, §2c, §6 D-D; scope
`docs/SCOPE_EXCL_AGE_RI_WI.md`, whose decisions D-1 through D-6 were resolved before the build.

| | statutory floor | source |
|---|---|---|
| RI | **67** | R.I. Gen. Laws § 44-30-12(c)(9) — "the age used for calculating full or unreduced Social Security retirement benefits", 67 for anyone born 1960 or later |
| WI | **67** | Wis. Stat. § 71.05(6)(b)54m., 2025 Wis. Act 15 — "67 or over" |

**Direction: CONSERVATIVE in every measured cell.** Tax rises or stays flat, never falls. This was the
last *optimistic* error in either state, and v5.59 enlarged it by growing the amounts it applied two
years early. All six cells were hand-computed from the rule table before the engine ran:

| state | ages | v5.59 | v5.60 | delta |
|---|---|---|---|---|
| RI | 66/66 | 1,020.00 | **5,020.00** | +4,000.00 |
| RI | 68/66 | 1,020.00 | **2,520.00** | +1,500.00 |
| RI | 68/68 | 1,020.00 | 1,020.00 | — |
| WI | 66/66 | 636.00 | **3,180.00** | +2,544.00 |
| WI | 68/66 | 636.00 | **1,908.00** | +1,272.00 |
| WI | 68/68 | 636.00 | 636.00 | — |

*(RI: retirement income $80,000, federally-taxable SS $40,800, rate 5%, `ss` 0.5. WI: $60,000, rate
5.3%, `ss` 0. Gross SS $24,000 each, no pension or wages.)* The **mixed-age rows are the load-bearing
ones**: the floor is applied per person, so a household-level implementation would pass 66/66 and
68/68 and fail 68/66. The 68/68 rows are unchanged, which is the proof the correction is confined to
the 65–66 window.

### What did NOT change, and the limitations that REMAIN

- **Rhode Island's AGI cliff is still not modelled.** TY2025: $133,500 MFJ / $107,000 single, a hard
  cutoff. The model applies the $50,000 regardless of income. The TY2026 indexed pair was located but
  not read, so only TY2025 figures are stated.
- **Rhode Island's IRA exclusion is still not modelled.** Only Form 1040 line 5b income qualifies.
  `STATE_RULES` carries no employer-plan-vs-IRA field; **D-11 (c)** scopes that once across states,
  not per state.
- **Rhode Island's Social Security modification** carries the same gates and removes *all*
  federally-taxable SS where it applies; the model's `ss: 0.5` blend taxes half unconditionally. RI's
  2026 session removed the age threshold from the SS modification for TY2027+ (HB 7127 Sub A, Art. 6
  § 5) — recorded, not modelled, and it applies to the SS modification rather than to this exclusion.
- **Rhode Island's $100,000 couple cap is still not asserted dollar-exact** (ROUND4 D-E): the
  per-person reading rests on the Division of Taxation's guide rather than on the statute alone. The
  per-person *floor* shipped here is a separate question and is what `exclAge` already implements.
- **New Mexico is untouched** (ROUND4 D-C) and keeps the implicit 65 default; its pass is its own.
- **Delaware's `exclAge: 60` was not re-read** — out of scope, and nothing here suggests it is stale.
- **Neither statute was re-read this session.** Both are carried from ROUND4 §2b/§2c, and WI's is
  carried in ROUND4 from ROUND3 §2b.

Net: RI's remaining sign depends on which side of the cliff the household sits and whether the money
is an employer plan or an IRA — conservative under the cliff, optimistic above it. **Wisconsin is now
correct on this provision**, so its note states the floor positively and its optimism disclosure is
deleted rather than left as a limitation that no longer exists.

### The extinction invariant was blind to this defect class — and the fix is not what it looked like

`t10`'s v5.55 invariant asserts that no state's note names a non-65 age while its code still uses 65.
It is the check this whole family of releases exists to maintain, and **it never saw RI or WI.** Its
matcher stopped at 64.

**Widening it "past 64" — the obvious reading — is wrong, and was measured to be wrong before it was
written.** The engine's default floor *is* 65, so a note reading "65+" beside no `exclAge` is
agreement, not a defect. Extending the range to `6\d` flags **CO, GA, LA, MT, NM, VA and WV**, all of
them correct. **65 is the one value that must be excluded, not the top of the range**; the shipped
matcher is `(5\d|6[0-46-9]|7\d)`, which returns exactly `WI` against shipped v5.59 and nothing after
the fix.

**And Rhode Island was invisible to it for a second, independent reason.** The matcher recognises
exactly two phrasings — `from age NN` and `NN+`. RI's v5.59 note said *"requires full retirement age
(67)"*, which is neither, so **no widening of the numeric range would have reached it.** RI's note now
says "from age 67" (decision D-6), and two new assertions pin that both notes remain *visible* to the
matcher that guards them — coverage as a tested property rather than an accident of wording. The
remaining limitation is that a third state wording an age some other way would be invisible again;
that is recorded in `TESTING.md` rather than papered over with a longer phrase list.

The widening is proved non-vacuous **permanently rather than once**: on the frozen v5.59 leg the
widened matcher is asserted to fire, naming WI, and RI is asserted absent from that set. Narrow the
pattern again and the prior leg fails.

### Coverage — and two holes the negative controls found in the tests themselves

`t10` §2E gains a v5.60 block: **14 checks on the current leg, 5 pre-fix pins on the frozen v5.59
leg**, plus the two rewritten v5.59 disclosure pins and the rolled membership assertions
(`t10` 224 → **238** current, 217 → **230** prior).

⚠ **Two `t10` assertions had names that would have gone false while their regexes kept passing.** The
v5.59 pins read *"RI's note names the full-retirement-age floor **the model does not apply**"* — but
they only asked whether the note mentions 67, so after this release they would have gone on passing
while their titles stated the opposite of the truth. Both were **rewritten, not re-gated**: they now
assert the note names the floor *and* the model applies it, with `[KNOWN DEFECT pre-v5.60]` twins on
the frozen leg. A silently-true assertion with a false name is worse than a failing one.

⚠ **Two further holes were found by the controls coming back NOT CAUGHT, and are the most useful
thing in this release.** Reverting WI's note to its v5.59 text with `exclAge` intact fired **nothing**
— the mention-67 check passes on the stale wording, because that wording names 67 twice while
asserting the model ignores it. And rewording RI's note back to an invisible phrasing fired
**nothing**, silently removing RI from the invariant's coverage. Both are the defect class this
release exists to close, reproduced inside the tests written to close it. Closed by three assertions:
both notes must stay visible to the matcher, and neither may still claim the exclusion applies from
65. Re-run, C5 and C6 now fire.

**`qa/controls_v560.sh`** — eight §B2 controls plus a comment-only null, each reverting ONE thing,
every failure read: **C1** RI `exclAge` removed: `t10` 8; **C2** WI removed: `t10` 8; **C3** RI
`exclAge: 65` — the *silent* form of the same defect: `t10` 5; **C4** RI note → v5.59 clause: `t10` 3;
**C5** WI note → v5.59 clause: `t10` 1; **C6** RI note reworded to the matcher-invisible phrasing:
`t10` 1; **C7** footer left at v5.59: `t1` 1; **C8** the L658 matcher narrowed back to its v5.55
range: `t10` 3 across both legs. C0 (comment only) fires nothing.

⚠ **The controls runner reported its own null control as a finding.** C0's correct outcome is
silence, and the shared verdict line printed *"NOT CAUGHT — THIS IS THE FINDING"* for it. Fixed with
an inverted expectation; a control that reports its own success as a failure is the same class of
defect these controls hunt.

### Suite totals — parsed from suite output, not restated

**2,910 app checks, 0 failing.** Current v5.60 leg **1,119** · prior v5.59 leg **1,111** · run-once
670 · MC parity 10/10 · tooling 82 (`t21` 50, DOM diff 32) — GRAND 2,992. `smoke_built` 16/16 on the
built artifact. Per suite, current leg: `t1` 185 · `t2` 35 · `t3` 36 · `t4` 252 · `t5` 58 · `t6` 21
· `t7` 41 · `t8` 40 · `t9` 14 · `t10` **238** · `t11` 40 · `t12` 23 · `t13` 42 · `t14` 44 · `t15` 11
· `t16` 24 · `t17` 74 · `t18` 67 · `t19` 65 · `t20` 100 · `t21` 50 · `t22` 85 · `t23` 25 · `t24` 38
· `t25` 45 · `t26` 25 · `t27` 18 · `t28` 34 · `t29` 54 · `t30` 12 · `t31` 31 · `t32` 12. The frozen
v5.59 leg replays at 1,111 = 1,105 + 6 (`t10` pre-fix pins and the two widened-matcher pins); every
other suite on it is unchanged, the check that no new expectation leaked backwards (§B2).

**MC parity holding 10/10 is expected and BLIND**, not reassuring: no parity or suite fixture is
domiciled in RI or WI. Re-confirmed this session by AST walk over every literal, template, regex and
member access across all 32 suites — the only non-generated RI/WI references outside `t10` are two
`t31` assertion *names*, and the parity household is Georgia. **The DOM diff (32/32) is not a witness
here** either, for the same reason.

**F-6 re-executed on the final wording with `qa/tools/f6_probe.cjs`: the guarded set stays at 4**
(NJ, NM, RI, VA). RI keeps its cliff language and stays in; WI's note still contains no form of
"income limit". A grep cannot evaluate this; the matcher was run against the shipped text.

**Version-bump cost, measured with `qa/tools/vercensus.cjs v559`**: 15 files, 18 ladder entries,
**63 gated expressions** — 81 judgement points. **78 were rolled** (16 ladder entries — 15
`KNOWN_VERSIONS` plus `t31`'s `ORDER` — 60 chain gates, and 2 ternary NEW ARMS in `t1` `verStr` /
`t4` `_badge`). **Three were deliberately not rolled**: `t31`'s two `since: "v559"` key entries and
its `since === "v559"` branch, which pin the v5.59 *figures* and stay at v5.59 forever. 78 + 3 = 81. Four registries end in the
retired `v592` and took `v560` positionally. `domdiff_withdrawal.mjs` needed no edit — confirmed by
reading its ladder, which covers new tags by a numeric rule (`<= 39`), not assumed.

⚠ **The registry edit halted rather than guessing.** `t31`'s `KNOWN_VERSIONS` and `ORDER` arrays are
textually identical, so an anchor on the array contents matched twice; the script exited and the
anchors were re-keyed to the `const` names. An unrolled `ORDER` scores −1 from `indexOf` and every
`t31` key silently takes its pre-fix branch.

✅ **The immediately-prior release reproduced byte-identically** on a fresh scaffold — v5.59 rebuilt
to `c6ac96552dbc598e4812f4229ba425ad`, matching its published artifact, **on rollup 4.63.1 rather
than the 4.62.4 recorded at v5.31**. This is the §N3a check that matters, it passed, and it is
further evidence that rollup was never the cause of the v5.30 divergence. It also contradicts the
expectation carried into this session that the artifact would not reproduce. v5.60's own artifact
rebuilt to the same hash twice in-session.

Source `23877f903a14ba43dd707a43d98b0df4` · built `index.html` `278cb053b93f4b389c99f1e1ad31b591`

### Documents

`METHODOLOGY.md` (mandatory — modelling changed; the v5.59 section's "applies from 65" sentences are
corrected there too) · `TESTING.md` (counts, `controls_v560.sh`, and the two-phrasing limitation
recorded as a lesson) · `MissingFeatures.md` (**D-11 (a) closes for RI and WI**; New Mexico's stays
open) · `SCOPE_EXCL_AGE_RI_WI.md` §8 build record, status SHIPPED · `PROJECT_KNOWLEDGE_INDEX.md`
rotation · `SCOPE_VA_NOTE_CORRECTION.md` retired to SHIPPED at v5.58 and dropped from
`package_check`'s OPEN allowlist in the same edit.

---

**Older entries (v5.59 and earlier) are in `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`, in the repo — moved there verbatim on
2026-09-15 to recover project-knowledge space. They are not in the knowledge pool.**
