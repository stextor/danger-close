# Changelog

## v6.05 — the Field Manual counts six income-limited exclusions and no longer says Rhode Island's is applied to IRA money; stale lines in it and METHODOLOGY corrected

**A TEXT-ONLY release** — no figure moves; no engine, table or note changes. `docs/SCOPE_V605_RI_FIELD_MANUAL.md` (repo-only, fulfilled). Closes four of
`ARCHITECTUREIssues.md` E-29's eleven threads: Steve asked for (e) to be fixed in a small release with (f) folded in (2026-10-12), and decided (d) and (k).

**What was wrong.** Two Field Manual sentences — the two Rhode Island sentences v5.69 rewrote — were false against the v6.04 source:
- They counted **five** exclusions known to be income-limited in law. The table holds six: Maine joined the list at v5.72 and has been conditioned on
  income since v5.73, which the Field Manual itself says elsewhere ("Maine's income phaseout is modelled from v5.73").
- The second said Rhode Island's $50,000 exclusion *"is still applied to IRA money the statute does not cover"*. That stopped being true at v5.95
  (D-12): Rhode Island's exclusion reaches only each person's own pension, annuity and employer-plan income, and all three in-app calls of the state
  calculator take that per-person path (AST census). Through the v6.04 calculator, a 70/70 couple with $30,000 of IRA money and $30,000 of 401(k) money
  leaves $30,000 taxable in Rhode Island — the IRA money.
- **A third Field Manual passage, found at this release's own re-read** (a search of the tree for every phrasing it retires): the state-age paragraph
  carried METHODOLOGY's (f) sentence word for word — *"Thirteen of the nineteen states remain unverified"* — and said *"One threshold remains deliberately
  NOT applied: South Carolina's under-65 tier"*, though Georgia's $35,000 at 62–64 has been disclosed as not modelled in its note since v5.87.
- **Why the second survived v5.95:** `t35` RI-7 asserted the IRA clause on every leg from v5.69 — a test that checks a disclosure is present turns into
  a lock once the disclosure goes false (OPERATIONS §B2). v5.95 changed the behaviour and left the lock and the sentence in place.

**What changed.**
- **Field Manual** (both sentences): *six* exclusions; the list gains *Maine at v5.73*; Rhode Island's exclusion *"from v5.95, reaches only each
  person's own pension, annuity and employer-plan income — never IRA money, which the statute does not cover"*. The state-age paragraph: *two*
  thresholds are deliberately not applied (South Carolina's under-65 tier and Georgia's $35,000 at 62–64), and *"Since v5.86 every exclusion state's
  figure has been read against a primary source"*, naming the two that start earlier in law than the model applies — Arkansas and New York, both applied
  from 65 (conservative).
- **METHODOLOGY**, each correction annotated where it stands: (f) the sentence *"Thirteen of the nineteen exclusion states remain unverified"*, false since
  its own v5.86 update, rewritten; and three lines of the same kind found while checking (e) — the income-conditioning section's *"Five states"*
  (Maine is the sixth), the v5.69 Rhode Island paragraph's *"four things remain unmodelled"* (three are modelled from v5.95; the fourth, dividend and
  interest income in the measure, stands), and the *Not modeled* list's *"Rhode Island's IRA distinction and per-person cap"* (modelled from v5.95; the
  item now names what is still unmodelled for Rhode Island, and the conditioned-state list adds Maine).
- **E-29** — (d) **closed by decision**: the v5.69 Roth best-cell move stays disclosed, unpinned. (k) **closed by decision**: an unsaved My Data draft
  survives a rejected import, as `t38` I-5 pins. (e) and (f) **fixed**. Open: (a), (b), (c), (g), (h), (i), (j).

**Tests.** `t35` RI-7 is inverted and gated per build (OPERATIONS §B2): on v6.05 it asserts the new wording; the v6.04 leg keeps the old one. New on
v6.05: **RI-8** (extinction) the IRA over-grant sentence is gone; **RI-9** (extinction) every Field Manual count of *exclusions known to be
income-limited in law* equals, as a word, the number of `STATE_RULES` rows marked `incomeLimitedInLaw` — derived from the table, so the next state marked
fails until the manual says so; **RI-10** every state with an income test is named in the list. On the v6.04 leg **RI-9 [KNOWN STALE]** pins the old
count. `t35` 114 → **117** on v6.05, **115** on v6.04. `t52` (current leg only) gains **F-1** (extinction) the "thirteen of
nineteen" sentence is gone, **F-2** both unapplied lower tiers are named, **F-3** every state whose note applies it from 65 although the law starts earlier
is named in the Field Manual — derived from the notes; 34 → **37**. Controls `qa/tools/controls_v605_fm.py` (repo-only): **9 of 9** —
the old sentence restored, the Taxes-tab count alone reverted, Maine dropped from the list, the IRA clause restored, a seventh row marked income-limited
(which also turns `t35` D-7 and D-8 red), the old state-age paragraph restored, New York dropped from it, and the unmutated runs of both suites. Every suite literal, string and regex, was evaluated against the old and new source and
METHODOLOGY (§B1a): only the new and inverted `t35` and `t52` matchers change outcome, besides the version strings. `t33`'s PINS carried unchanged; `v605` registered by AST,
the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,329 app checks across **67 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,459**. Every current-leg count equals v6.04's except `t35`
(114 → 117), `t52` (34 → 37) and `t68` (49 → 45: its group D compares v6.03 with v6.04 and needs `app_v603.mjs`, so it reports itself
not run in a v6.04 → v6.05 folder, as `t66`'s and `t67`'s do in theirs). The v6.04 leg equals v6.04's own counts except `t35` (115) and `t68`
(45), for the same reasons. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v604 v605 from the build workspace — a full clone of 16dcba4 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.04 resolved from history, commit a923332) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6237, half B GRAND 222; none DIED. Source `f230ffbbd4f2773f7816769bb726d975` · built `1c3d9f3a83bcdd6c09fe99fc574b5085` (v6.04 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Three QA-tool fixes, found at this ship.** *First, owned here:* `package_check_controls.sh` ran P56/P57 (the pre-upload K-1–K-3 controls) only for a package whose
`CHANGELOG.md` has a `## v5` heading. The ops package of 2026-10-11 (second) — mine — archived v5.75–v5.99 to the repo, leaving none, so this package's
first controls run SKIPPED both with *"is not an app release (it ships no source)"*. The pattern is now `^## v[0-9]`; with it both run (results in the
package's `MANIFEST.txt`). OPERATIONS §G records it beside the two v5-only patterns fixed the day before. *Second:* `package_check`'s provenance check H-1/H-2 read the newest
CHANGELOG entry up to the next `## v` heading, so after ops packages it also read their `## ops` entries, which quote the build they leave current.
In this package's post-upload rehearsal (GitHub still served v6.04) H-1 and H-2 passed on v6.04's md5s quoted by the 2026-10-11 ops entries, and
their controls P20/P21 could not fire. The window now ends at the next heading of any kind (OPERATIONS §I). *Third, owned here:* `controls_manifest_rows.py`'s B1 demonstration, whose
target I made derived on 2026-10-11 (the pool's dom entry with a hash row), found none before the upload of a release that rotates the dom entry, and
reported a FINDING about itself; it now falls back to another pool file whose row the manifest also names elsewhere. None of the three is part of the suite.

**Limitations, disclosed:** none new — no figure moved. Rhode Island's AGI measure still omits dividend and interest income (the state's note and
METHODOLOGY say so).

## ops 2026-10-11 (third) — the manifest's history to the repo; six documents un-pooled; their open threads re-homed

**KIND: ops** — documents and one QA tool; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite or figure changes; one tool fix (the last bullet). Steps 5–6 of the cleanup plan of 2026-10-11, after its steps 1–4 (the second ops package).
**328,402 bytes net out of the pool; the pool goes 131 → 125 files.**

**First, the trace (OPERATIONS §G).** Before anything left the pool, every open-sounding line in the text leaving — the manifest's
superseded ship notes, its old delete-first lists, and the six documents below — was read in context, and all 60 register IDs it cites
were checked for a pooled record. The full trace is §0 of the new archive file. In short:
- **Nine open threads had no other pooled record** and are re-homed as `ARCHITECTUREIssues.md` **E-29**: `main.jsx`'s `/anthropic`
  rewrite (D-B3-1 (b), never scoped); `t13`'s survivor check measuring more than its name; `E-1b`'s silent skip of renamed pool files;
  the manifest → pool check for unhashed rows, proposed as `K-10` and never built (the ID was later reused for another check); A-2's
  last bullet (imported checklists are not shape-checked); the suite's unpinned harness dependencies; Phase 1's "not examined, therefore
  not cleared" list; and two items for Steve — the v5.69 Roth best-cell move (disclosed, unpinned, no decision recorded) and a request to
  read two v5.69 Field Manual sentences. Two more were found while tracing: METHODOLOGY's "thirteen of nineteen unverified" beside its own
  v5.86 update, and a v5.72 behaviour change (a draft survives a rejected import) flagged for the maintainer and never acknowledged.
- **Six standing traps lived only in the leaving text** and are carried verbatim to OPERATIONS: §B2a (unreachable fixtures make
  assertions vacuous; three fixtures cannot see v5.47's item 5; `t13` is not `t14`; `t10`'s labels overlap; the DOM bundle is sloppy-mode
  CommonJS where the build is a strict ES module) and §I (a truncated hash is not a hash).
- ⚠ **The first pass missed four of these** (the `K-10` proposal, the checklist shape check, the harness dependencies, the CommonJS trap)
  and wrote two wrong statuses into the trace. **An independent second read by a separate agent found them**; all were fixed before
  the package was cut. The method is in the trace's last paragraph.
- Everything else is resolved, with evidence in the trace, or already held by a pooled register.

**Then the moves.**
- **The manifest's superseded ship notes** (v6.03 back to v5.42, 82,546 bytes) and **its delete-first lists** (v6.03 back to v5.31,
  129,298 bytes) moved verbatim to `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`, repo only, with a pointer at each cut. The
  manifest keeps the v6.04 note and the lists from v6.04 on.
- **Six documents un-pooled** (137,409 bytes; each stays in the repo): `FlawsToFix-v5_69-Phase1.md`, `AUDIT_STATE_EXCL65_ROUND3.md`,
  `AUDIT_STATE_EXCL65_ROUND4.md`, `AUDIT_STATE_INCOME_BASES_ROUND5.md` (its row's "three findings still open" was stale — all four are
  resolved), `BUILD_BRIEF_v5_49.md`, and `controls_source.sh` (it reverts fixes in the v5.47 source, so no session can run it from the pool).
- **`MissingFeatures.md`** opens with a census of every D item at v6.04, like the other registers' (some statuses re-checked against the
  source by parser); closed items' headings now carry their status, IDs unchanged. **D-20 is closed** — v6.02 and v6.04 took the
  federal deductions Montana starts from. D-11 is narrowed to New Mexico's unestablished age floor and two disclosed Rhode Island points.
- ⚠ **Correction to the second ops package of 2026-10-11.** It said it removed the hash rows' "rolled at" trail "from every row"; eleven
  rows written in another shape (the trail before the description) kept theirs. Removed here (9,285 bytes; file/hash pairs unchanged,
  asserted); OPERATIONS §I's sentence corrected.
- ⚠ **`controls_manifest_rows.py`'s B1 had been demonstrating nothing since 2026-09-10.** B1 (a demonstration, not a control) deletes a
  pool file's hash row to show that K-9 stays green while the file is named elsewhere. Its target was the literal `dom_entry_v566.jsx`,
  whose hash row left the manifest at the v5.68 rotation; from then on it deleted a retirement-list line of that name and still
  reported success. Archiving that line made its anchor fail, which is how it was seen. B1 now derives its target — the pool's dom
  entry with a hash row — and requires the file's other mentions to survive the edit.

**Verified by:** the archive reassembles the committed manifest byte for byte; the hash table's file/hash pairs compared before and after
(the four hashed rows of un-pooled files aside); `package_check` and `package_check_controls.sh` on this package, and `row_census.cjs`,
`controls_manifest_rows.py` and `controls_runfolder_prior.sh` re-run, since they read the manifest — results in the package's `MANIFEST.txt`.
No suite reads any of these documents (AST census of `qa/`: one tool, `lits_p1.cjs`, names `FlawsToFix` in a pattern it prints, and reads nothing).

## ops 2026-10-11 (second) — project knowledge trimmed: old CHANGELOG and TESTING history to the repo, the hash rows' roll trail removed

**KIND: ops** — documents only; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite, tool or figure changes. The project-knowledge meter read 1,752,756 of 2,000,000. Steps 1–4 of the cleanup plan agreed the same day:

- **CHANGELOG:** every entry from v5.75 through v5.99, with the ops entries between them, moved verbatim to `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md`
  (repo only, the third such archive). The pooled file holds v6.00 onward. 141,930 bytes out of the pool.
- **TESTING.md:** the per-suite count lines from v6.01 back to v5.53 (40, with two historical notes among them) moved verbatim to
  `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` (repo only); the newest three stay. 56,471 bytes.
- **The manifest's hash rows:** the `**rolled at …** (was `…`).` trail removed from every row (1408 phrases, 61,027 bytes). Each row keeps
  its current hash and description, and the 126 rows are unchanged in file and hash (asserted). Past values are in the manifest's git
  history; OPERATIONS §I now says a roll replaces the hash without appending a trail.
- **`VERIFY.sh` and `ASSESSMENT_HEIR_RATE.md`** had already been removed from the pool by hand earlier the same day (the listing went 133 → 131). Their
  rows now say so; both stay in the repo. No open item in either (searched for open-decision wording before they were proposed: none).

**Not in this package:** the manifest's old delete-first lists and superseded ship notes, and the six documents that carry open-item wording (steps 5–6
of the plan), which wait for each open item to be traced to a live register (OPERATIONS §G).

**Verified by:** both archives byte-compared with the removed blocks (each pooled file plus its archive body reassembles the committed file exactly);
the hash table's file/hash pairs compared before and after; `package_check` and `package_check_controls.sh` on this package (results in its
`MANIFEST.txt`); `row_census.cjs`, `controls_manifest_rows.py` and `controls_runfolder_prior.sh` re-run, since they read the manifest.

## ops 2026-10-11 — `package_check_controls.sh` could not see a v6 source: P8 and P10 run again

**KIND: ops** — tooling and documents only; **v6.04 stays current** (source `8226b20b62334074606993d411bb0fb1`, built `71f4ada6ac4923075f9f1d1a576c2293`).
No app source, suite or figure changes. Verified by `package_check_controls.sh` before and after the change, on the v6.04 package (below), and by
`package_check` and the controls on this package (its `MANIFEST.txt`).

**What was wrong.** `qa/tools/package_check_controls.sh` found a package's source with `ls knowledge/DangerClose-v5_*.jsx`. A `v5_*` pattern cannot
match a `v6_` name, so from v6.00 the script found no source and **skipped P8** (a third `.jsx` rides along — `B-3`) **and P10** (the versioned source
differs from the canonical one — `E-2`), printing *"this package ships no versioned .jsx"*. Found at the v6.04 ship by reading that SKIPPED line. The same
script's P68–P71 tidy a pool copy down to one source before planting each defect, with `glob("…/DangerClose-v5_*.jsx")` and `glob("…/dom_entry_v5*.jsx")`:
on a v6 pool that tidy-up removed nothing. It was harmless where it is normally run (a post-upload pool already holds one source), but on a pool still
holding two, each control would have been "caught" by a baseline already red — the case the tidy-up exists for. v6.00 widened this script's manifest
arithmetic for the new major and missed these patterns (OPERATIONS §G now records it). **The four patterns now read any single-digit major** (`v[0-9]_*`),
as `package_check.mjs`'s own pattern does (`DangerClose-v\d_\d+.jsx`).

**Census, not a list.** An AST walk over every string, template and regex literal in the 145 JavaScript files under `qa/` found one other hit: `E-2`'s
printed label in `package_check.mjs` (*"knowledge/DangerClose-v5_*.jsx == …"*) — label text only, its check already version-agnostic; corrected to
`vN_NN`. A text search of the shell and Python tooling (acorn cannot parse them) found, beyond the four patterns: release-pinned `controls_v5NN_*` scripts
(historical by design, §G), comments, and planted file names (P8's `DangerClose-v5_00.jsx`, P68–P71's `v5_01` / `v5_02` / `dom_entry_v501`), which still
match the checks' version-agnostic patterns and are left. OPERATIONS §L's two sentences naming `DangerClose-v5_*.jsx` now read `vN_NN`.

**Evidence** (`package_check_controls.sh` against the v6.04 package):
- **Before**, the shipped script, post-upload clone and a pool folder: 58 behaved as designed, 1 did not, 3 skipped — **P8/P10 skipped**; the miss is P17,
  which by design fires only against the pre-upload tree (OPERATIONS §I).
- **After**, post-upload clone, pool and `PRIOR_CLONE`: **60 behaved, 1 did not (P17, as above), 2 skipped**; pre-upload clone: **34 behaved, 0 did not,
  10 skipped** (the pool-dependent and handover controls). **P8 caught by `B-3` and P10 by `E-2` in both runs**; P17 fires pre-upload and P48 post-upload.
  The remaining skips are P15 (needs an ops package — run on this one, recorded in its `MANIFEST.txt`) and P58–P61 (need a handover package; none exists).
- **The tidy-up directly:** on a pool copy holding two sources and two dom entries, the old snippet left all four; the new one leaves the current pair.
- **The pool folder** is not the real pool — this session has none mounted (OPERATIONS §I). It was rebuilt from the v6.04 clone through the manifest's
  repo-path rows (133 files, `vite.config.js` under its mount name `vite_config.js`); `package_check` against it with all four arguments: **52 passed,
  0 failed, 0 skipped**, the green baseline that makes the pool controls' results meaningful.

**No scope document** — a judgement, stated: a pattern fix with no decision open; its premise, census and evidence are this entry.

## v6.04 — D-31 and D-29: deducting federal income tax (AL, MO, OR), the federal senior deduction in six states, Missouri's capital-gains subtraction

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D31_D29_V604.md` (repo-only, fulfilled). Steve: "start the v6.04 scope on D-31 plus D-29."

**What changed.** Through v6.03 the state calculator was given neither the model year nor any federal tax figure, so no state could take a deduction that
depends on either (conservative, disclosed). **From v6.04 all three call sites pass the year, the year's federal income tax and its NIIT, and Engine B its
realized gains**, and nine rows take what their laws allow, each read at its primary source on 2026-10-11 (the scope's §0.2 cites each):
- **Alabama** deducts the year's federal income tax in full, the net investment income tax included (Code of Ala. §40-18-15(c); the 2025 worksheet).
- **Missouri** deducts 35 % / 25 % / 15 % / 5 % / none of it as Missouri AGI passes $25,000 / $50,000 / $100,000 / $125,000, at most $5,000 single /
  $10,000 joint (RSMo 143.171), and **subtracts 100 % of realized capital gains from TY2025** (RSMo 143.121.3(14), D-29) — qualified dividends stay taxed,
  and the gains leave the base before the percentage is measured.
- **Oregon** subtracts it up to $8,500 (the 2025 cap, held), less in $5,000 / $10,000 steps of federal AGI from $125,000 single / $250,000 joint, nothing
  from $145,000 / $290,000 (ORS 316.695; OR-40 Table 4).
- **The federal senior deduction** ($6,000 each 65 or older, 2025–2028, less 6 % of MAGI above $75,000 / $150,000 — IRC §151(d)(5)(C)) is taken in the six
  states whose returns carry it: Colorado, Iowa, Montana and North Dakota (they start from federal taxable income), Idaho (conformity, HB 559) and Arizona
  (its own subtraction, A.R.S. §43-1022(35)). Its figures are read from the federal block (`OBBBA_CONSTS`), not copied, and it ends with the federal sunset.

The evaluator `stateDeductions` gains three fields — `years`, `of: "fedtax"` and `cap` — and Missouri's row a field `gainsExempt`; the data stays
declarative. A caller that passes none of the new arguments gets v6.03's figure byte for byte. "Federal income tax" is what the model computes of Form 1040
line 22: regular tax on ordinary income, the capital-gains-rate tax and AMT (Alabama adds NIIT). Only the nine rows move, all downward.

**Measured** (v6.03 → v6.04, a scratch probe, not shipped): the Taxes tab's lifetime state tax on the example plan with each state selected, no conversions —
AL $67,983 → $57,518 · MO $48,310 → $47,276 · OR $124,104 → $114,915; the other 48 jurisdictions and "none" are byte-identical (the example plan's tax years start at its 2029 retirement, after the senior deduction ends —
its filers, born 1964 and 1966, are under 65 until then — so the six senior-deduction states do not move for it). A 65+ household (an $80,000 pension, born 1958 and 1959): AL $86,285 → $81,338 · MO $57,232 → $56,534 · OR $152,945 → $144,286 · MT $47,401 → $45,709 (2026–2028: $4,678 → $2,986) · ID $48,285 → $46,377 · AZ $33,096 → $32,196; North Dakota, Colorado and Iowa do not move
for it (they already tax that household's income at zero before the deduction), nor does any state outside the nine. Engine A on the example plan: no
strategy's lifetime tax rises in any state, and the estate-best strategy changes in none. Engines C and D compute no state tax. **MC parity 10/10,
unchanged** — no fingerprint is priced in the nine.

**Not taken or approximated, each disclosed in its note and in METHODOLOGY:**
- The federal tax is the model's own figure for Form 1040 line 22: the model computes no federal credits, so none is subtracted.
- Oregon's cap is held at the 2025 $8,500: Oregon's 2026 withholding formulas use $8,750, but the same publication's text says $8,500, so the 2026 return
  figure is unconfirmed — the lower one is kept (conservative).
- Missouri's percentage table runs on Missouri AGI, as the MO-1040 administers it, where the statute says "Missouri gross income".
- The District of Columbia's senior deduction is not taken (its 2025 law disallows it; 2026 is unsettled) — conservative.
- The refunds of deducted federal tax that Alabama and Oregon tax as income are not modelled (the model has none).
- Engine A takes the state senior deduction from its own MAGI although its federal calculation omits the bonus (that solver decision stands). Alabama,
  Missouri and Oregon read Engine A's federal tax as Engine A computes it — in 2026–2028 slightly higher than Engine B's for a 65+ household, so their
  deduction there is slightly larger.
- Missouri's gains subtraction reaches only realized gains, which Engine B passes; Engine A realizes none (it passes dividends alone).

**Correction, owned here.** The scope's first draft said Alabama's deduction sits at §40-18-15(c), "not the (a)(2) this project's notes cite". No project
file cites (a)(2): the subsection came from my own research brief, and the research pass found the text at (c). Corrected in the scope (§0.2, §6).

**Tests.** New suite **`t68`** — **49** on v6.04, **5** on v6.03 (that leg pins the absence of the arguments, fields and
components): the nine rows' components equal to the sources, the senior component read from `OBBBA_CONSTS` and carried by exactly the six, only AL / MO / OR
an `of: "fedtax"` component, only Missouri `gainsExempt` — an extinction that every component is well formed; the edges (Missouri's and Oregon's bands to
the dollar, the joint doubling, the senior window at 2024 / 2025 and 2028 / 2029, its phase-out, one filer 65+ against two, Alabama with and without NIIT,
Missouri's gains floored at zero with dividends taxed); 15 hand cases to the cent computed independently in Decimal (e.g. Alabama single 50 at $40,000 with
$3,000 of federal tax: **$1,610.00**; Missouri single 66 at $24,000 with $1,000: **$104.88**; Oregon single 66 at $124,999 / $125,000 with $20,000:
**$9,521.60 / $9,670.44**; Montana joint 66/66 at $100,000 in 2027 / 2029: **$2,467.50 / $3,031.50**); v6.03 → v6.04 over every jurisdiction, a household
grid, the years 2026–2030 and a band sweep for Missouri, Oregon and Alabama, 25,818 calls (without the new arguments byte-identical to v6.03; with them the
nine equal the independent implementation, `qa/d30_ref.mjs` extended, on 4,650 calls and the other rows are byte-identical on 21,168; none pays more and
1,726 pay less); Engine B's state senior deduction equal to its own federal bonus year by year in each of the six; the three call sites' arguments by AST; the
Field Manual and notes held to the code. Controls `qa/tools/controls_v604_feddeduct.py` (repo-only): **8 of 8**. **Derived checks gated per build** (v6.02
DD-14): `t64` (the `deduct` census allows Missouri's `gainsExempt`), `t65` (Alabama's note), `t66` and `t67` (each keeps to its own components — the
federal-tax and senior components are `t68`'s — and their "not taken" claims for the nine are retired on the v6.04 leg, `t68` holding the new wording);
`t33`'s PINS carried unchanged (its household is in Georgia). `v604` registered by AST, the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,293 app checks across **67 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,423**. Every current-leg count equals v6.03's except the new `t68`,
`t66` (191 → 186: its five "not taken" checks for AL, MO, OR, MT and ND retire, `t68` A-7 holding the new wording) and `t67` (123 → 118:
its two for CO and ID retire, and its group D, which needs `app_v602.mjs`, reports itself not run in a v6.03 → v6.04 folder). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v603 v604 from a full clone of 3540e4f with the github/ files overlaid (v6.03 resolved from history, commit 12a4428), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6201, half B GRAND 222; none DIED. Source `8226b20b62334074606993d411bb0fb1` ·
built `71f4ada6ac4923075f9f1d1a576c2293` (v6.03 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The federal tax deducted is the model's, with no federal credits subtracted; Alabama's and Oregon's recapture of refunded federal tax is not modelled.
- Oregon's cap held at its 2025 figure; Missouri's table on Missouri AGI; DC's senior deduction not taken — each conservative or as administered.
- Ohio's retirement income and joint filing credits and Utah's retirement credit are still not taken (D-32); low-income and property-tax credits are not
  taken; itemized deductions are not modelled.
- Engine A's federal figure still omits the senior bonus (its recorded solver decision); the state layer takes it in both engines.

## v6.03 — D-30 batch 2: the flat-rate states' deductions, exemptions and personal credits; D-30 closes

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D30_DEDUCTIONS_V603.md` (repo-only, fulfilled). Steve: "start the v6.03 scope".

**What changed.** Through v6.02 the fifteen flat-rate states were taxed from the first dollar of their base — no standard deduction, exemption or personal
credit (conservative, disclosed). **From v6.03 the fourteen whose law has any take them**, each read at its primary source on 2026-10-10 (the scope's §0.2
table cites each): Arizona's standard deduction ($15,750 / $31,500) and $2,100 for each filer 65 or older; Colorado's and Iowa's federal standard deduction
(both start from federal taxable income; $16,100 / $32,200 and $2,050 / $1,650 for each filer 65 or older), Colorado's cut to $12,000 / $16,000 at federal AGI
of $300,000 or more (Proposition FF, "equal to or exceeding" as the statute says — the 2025 form says "exceeds"), Iowa's $40 exemption credits and $20 for each
filer 65 or older; Georgia's $15,000 / $30,000 (HB 463); Idaho's $15,750 / $31,500 with $2,000 / $1,600 for each filer 65 or older and its $155 grocery credit;
Illinois's $2,925 exemptions and $1,000 for each filer 65 or older, none above federal AGI of $250,000 / $500,000; Indiana's $1,000 exemptions, $1,000 more
for each filer 65 or older and $500 more each below federal AGI of $40,000; Kentucky's one $3,360 deduction per return and $40 credit for each filer 65 or
older; Louisiana's $12,500 / $25,000; Massachusetts' $4,400 exemptions and $700 for each filer 65 or older; Michigan's $5,900 exemptions; North Carolina's
$12,750 / $25,500; Ohio's exemptions by modified-AGI band ($2,400 / $2,150 / $1,900, none from $500,000), its $20 exemption credits and $50 senior citizen
credit; Utah's taxpayer tax credit (6 % of the federal standard deduction, less 1.3 % of Utah taxable income above $18,213 / $36,426). **Pennsylvania's law
has none**, and its note says so. **Idaho's zero band** ($4,811 / $9,622) and **Ohio's 2026 schedule** (no tax on a base of $26,050 or less, $332 plus
2.75 % above it — the statute's step, kept) are modelled as schedules; Ohio's step is a new row field, `notch`, read only with a schedule. The v6.02 evaluator
serves every row; its `tiers` shape now reads a single/joint start (Utah's) — numbers pass through unchanged, so the 27 batch-1 rows are byte-identical. Five
held at their 2025 figures (Arizona's, Idaho's and Louisiana's deductions, Ohio's exemptions, Utah's phase-out base), each at or below its later value.

**Measured** (v6.02 → v6.03, a scratch probe, not shipped): the Taxes tab's lifetime state tax on the example plan with each state selected, no conversions —
every one of the fourteen falls, and Pennsylvania, the other 36 jurisdictions and "none" are byte-identical: AZ $45,462 → $27,415 · CO $65,430 → $42,563 · GA $19,881 → $10,133 · ID $96,379 → $48,206 · IL $3,174 → $1,645 · IN $53,645 → $51,285 · IA $2,437 → $0 · KY $28,135 → $24,985 · LA $40,225 → $28,234 · MA $90,923 → $80,538 · MI $16,590 → $12,592 · NC $72,557 → $51,699 · OH $50,008 → $36,901 · UT $99,516 → $78,178. Engine A on the same plan: no strategy's
lifetime tax rises in any state, and the estate-best strategy changes in none. Engines C and D compute no state tax. **MC parity 10/10, one declared
diff:** the `stateTax` fingerprint is a Georgia call and moves $6,487 → $4,990 (= ($260,000 − 2 × $65,000 − $30,000) × 4.99 %), declared in `INTENDED_DIFFS`
as `v602→v603`; the nine other keys are byte-identical (the Engine A fingerprints carry no state).

**Display.** My Data's model line for a flat-rate row read "N% effective rate (an approximation)" — wrong for every row it reached since v6.01, when every
progressive state moved to its schedule. It now reads "N% flat rate", adds "· deductions and exemptions taken" for the fourteen, and a state without an income
tax reads "no state income tax" (it read "0.00% …"). The AI context line says "N% flat, after its deductions and exemptions". The Taxes tab's footer called
the state module "effective-rate approximations" and now names each state's own rate or schedule after its deductions. The Field Manual's "the flat-rate states
take none yet" (two places) and its two sentences giving every flat-rate state one rate are replaced with what is and is not taken, and Idaho's and Ohio's schedules.

**Not taken, each conservative and disclosed in its note:** the federal senior deduction (2025–2028) that reaches Arizona (its own subtraction), Colorado and
Iowa (through federal taxable income) and Idaho (conformity, HB 559) — added to **D-31**; Ohio's retirement income credit (at most $200) and joint filing credit,
and Utah's retirement credit (filers born in 1952 or earlier) — they need measures the calculator lacks (**D-32**, opened); low-income and property-tax
credits (Georgia's low income credit, Iowa's low-income exemption, Kentucky's family size credit, Indiana's unified credit, Arizona's family and property tax
credits, Pennsylvania's Tax Forgiveness, Massachusetts' circuit breaker and limited-income credits); Michigan's deduction for filers born before 1946. Idaho's
grocery credit is refundable in law and taken here against tax only. **D-30 closes:** every state's standard deduction, exemptions and personal credits are taken.

**Correction, owned here.** v6.02's CHANGELOG entry and the D-30 entry in MissingFeatures called Georgia "the example household's state". It is not: the
example plan files in Florida ("State: Florida (no income tax)"). Georgia is the parity fingerprint's state and `t33`'s household's. This release's scope
repeated the claim in its first draft; it is corrected there (§0.1) and in MissingFeatures.

**Tests.** New suite **`t67`** — **123** on v6.03, **6** on v6.02 (that leg pins the absence of all of it): the fourteen rows' components equal to
the sources, dated, well formed — an extinction: exactly 41 rows carry `deduct` (the 27 and the 14), only Ohio a `notch`, Pennsylvania none; every note names
what is taken and what is not, and every age it names; the edges (Colorado at $299,999 / $300,000, Illinois's and Indiana's cliffs, Ohio's bands, credits and
$26,050 step, Idaho's band, Utah's credit, Kentucky's one deduction, the `tiers` pick); 39 hand cases to the cent computed independently in Decimal (e.g.
Ohio single 50 at $28,451: **$312.03** — the step; Colorado joint 66/64 at $300,000: **$12,496.00**; Utah joint 66/66 at $80,000: **$1,996.46**); v6.02 → v6.03
over every jurisdiction, 22,572 calls (with the fifteen's additions removed, byte-identical to v6.02; with them, the fourteen equal the independent
implementation, `qa/d30_ref.mjs` extended with `D30F`, on the calculator's own measures, and the other 37 rows are byte-identical); the display and the Field
Manual held to the code. Controls `qa/tools/controls_v603_deduct.py` (repo-only): **11 of 11**. **Derived pins gated per build** (DD-14 — each keeps its base and,
on the v6.03 leg, expects that base after the state's deductions, schedule and credits, priced by `qa/d30_ref.mjs` on the calculator's record of the very call;
labels say so): `t10` (§2E — AZ, CO, KY; IL's hand case), `t50` (CO, UT), `t51` (the dated-figure census, 41 rows / 102 figures; Louisiana's cases; the display),
`t52` (GA, IA; the display finder), `t53` (the display finder), `t55` (IA, MI), `t58` (North Carolina's lifetime draw Δ, now the sum of its per-year hand
marginals), `t59` (IA; Georgia's survivor years), `t60` (GA, MI), `t61` (GA), `t63` (ID, IN, OH), `t64` (GA, the display, the `deduct` census), `t65` (the
schedule census with Idaho and Ohio, GA, the display, the Field Manual's lists) and `t66` (its group-wide checks keep to the 27; its group D reports itself not run
in a v6.02 → v6.03 folder). **Measured pins** (the household is in Georgia; second-order engine figures, measured at the build as v5.97's were): `t33`
`noStream` 173,836 → 155,661, and its E-3 / E-4 / F-2 / F-3 deltas 739 → 738, 60,036 → 60,035, 2,300 → 560, 48 → 50. `v603` registered by AST (93 array entries, 83
OR-gates, two version arms; one site reviewed by hand and left — `t66`'s v6.01 → v6.02 group), the three Python suites and `t33`'s PINS by hand.

**Suite, run from the packaged copies:** 6,135 app checks across **66 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,265**. Every current-leg count equals v6.02's except the new `t67` and `t66`
(194 → 191: its group D, which needs `app_v601.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v602 v603 from a full clone of 7af5fbb with the github/ files overlaid (v6.02 resolved from history, commit a7bbdb5), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6043, half B GRAND 222; none DIED. Source `bba6256a1380feae47809094ac667ffd` · built `7acea8cda30fe596ad986935eefa611e` (v6.02 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The federal senior deduction (AZ, CO, ID, IA; and MT, ND from v6.02) and federal-tax deductions (AL, MO, OR) are not taken (D-31); Ohio's retirement income
  and joint filing credits and Utah's retirement credit are not taken (D-32); low-income and property-tax credits are not taken; itemized deductions are not
  modelled — each conservative.
- Credits are nonrefundable: Idaho's grocery credit (refundable in law) is understated for a household whose Idaho tax is below it.
- Ohio's credits are tested on the state base, the model's Ohio AGI; Ohio's modified AGI adds back a business-income deduction the model does not have.
- Arizona, Idaho, Louisiana, Ohio (exemptions) and Utah (phase-out base) hold 2025 figures — each conservative.
- The calculator has no dependents: exemptions count the filers only.

## v6.02 — Ask AI's answers no longer cut off; D-30 batch 1: the 27 progressive states' deductions, exemptions and personal credits

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D30_DEDUCTIONS_V602.md` (repo-only, fulfilled). Steve: "one thing I've noticed in ASK AI, the
response field seems not to be long (big) enough. Some of the answers given out get's cutoff. Can you fix this along with D-30?"

**Ask AI.** The box was never the limit: the transcript shows the whole returned text. **The request was** — both routes (Anthropic and Local Model) asked
the model for at most 1,000 tokens, about 750 words, so a longer answer was cut off mid-sentence, and the app never read the API's stop reason, so a cut-off
answer looked finished. From v6.02:
- **The cap is 4,096 tokens on both routes** (one constant, `AI_MAX_TOKENS`) — roughly 3,000 words.
- **A cut-off is said, never silent:** when the API reports `stop_reason: "max_tokens"` (a Local Model, `finish_reason: "length"`) the answer is shown with
  a notice that it reached the length limit — type *continue* for the rest. The notice is kept apart from the answer, so the conversation memory re-sends
  the answer alone and the model can carry on from it.
- **The timeout is 120 seconds** (was 45; a longer answer takes longer), and the timeout message and the Field Manual's error table say so.
- **The default master prompt's note** ("~1000 token cap") now says answers may run to about 4,000 tokens, most far shorter. A master prompt restored from an
  older backup keeps its own wording (disclosed in the Field Manual).
- **The cost sentence is corrected.** The Field Manual said a question costs "well under a cent". Measured on the example plan, one question sends
  16,603 characters (about 4,150 tokens); at the Claude Sonnet 4.6 prices Anthropic listed in October 2026 ($3 per million input tokens, $15 per million
  output) a typical question costs about one to five cents, and a full-length answer adds about six. The BYOK section and the glossary now say so.
- The model is unchanged (`claude-sonnet-4-6`); a newer, cheaper Sonnet is listed — Steve's call (scope AI-6).

**D-30 batch 1.** Through v6.01 no state's standard deduction, personal exemption or personal credit was taken — every state taxed income from the first
dollar (conservative, disclosed). **From v6.02 the 27 progressive states take them**, each figure read at its primary source on 2026-10-09 (the scope's §0.2
table cites each): standard deductions — flat (NY, VA, MS, NE, HI, KS, OR, VT, DC, DE, AR per person), sliding (Wisconsin), phased out (Alabama's $25/$175
per $500, Maine's linear phase-out, Minnesota's 3 % / 10 %, Rhode Island's 20 % steps, South Carolina's new Income Adjusted Deduction) or the federal one
(MO, MT, ND, NM), with their 65-and-over additions; personal exemptions (incl. Connecticut's $1,000-per-$1,000 phase-out, Maryland's AGI table, Maine's and
Rhode Island's phase-outs, New Mexico's low- and middle-income exemption, Oklahoma's 65+ exemption at low AGI); and personal credits (Arkansas, California's
exemption credits with their phase-out, Delaware, Nebraska, Oregon's exemption credit, Connecticut's Table E credit decimal, Maryland's senior credit at its
reduced schedule). **The order is the forms':** state AGI − deductions = taxable income; the schedule (and Arkansas's high-income table, and Maryland's
county tax) on taxable income; New York's recapture fraction and Connecticut's added amounts on AGI, as their statutes measure them; then the credits,
nonrefundable, against the state tax (Maryland's senior credit not against the county tax). One field, `deduct` (a list of components), one evaluator
(`stateDeductions`), six phase shapes. Six states hold their latest published figures, TY2025 (AR, CA, DC, MD, OR, VT — each at or below its 2026 value).

**Measured** (v6.01 → v6.02): the Taxes tab's lifetime state tax on the example household, no conversions — every one of the 27 falls and the other 24
jurisdictions and "none" are byte-identical: AL $77,583 → $67,983 · AR $50,830 → $44,724 · CA $72,258 → $52,405 · CT $70,199 → $65,467 · DE $66,614 →
$50,491 · DC $118,735 → $71,432 · HI $97,191 → $73,135 · KS $98,216 → $67,430 · ME $70,129 → $40,873 · MD $107,711 → $81,984 · MN $140,098 → $95,880 ·
MS $991 → $0 · MO $80,952 → $48,310 · MT $119,556 → $82,773 · NE $71,599 → $46,547 · NJ $13,388 → $12,495 · NM $87,978 → $58,278 · NY $54,969 → $43,598 ·
ND $9,526 → $6,114 · OK $55,476 → $45,182 · OR $146,037 → $124,104 · RI $85,823 → $59,370 · SC $46,676 → $38,244 · VT $114,827 → $84,832 · VA $80,326 →
$61,805 · WV $62,920 → $59,641 · WI $45,957 → $33,863. **The direction is one way** (optimistic relative to v6.01, and each figure now nearer the law). The
Roth comparator's strategy tax falls in every changed run; **its estate-best cell changes in 3 of 81 cells tested** (27 states × three households: a B-dies
household in MD, ND and RI). Engines C and D compute no state tax; MC parity 10/10 with **no** declared diff (its state fingerprint is a Georgia call).

**Not taken, each conservative and disclosed in its note:** the federal income tax that Alabama, Missouri and Oregon let a return deduct, and the federal
senior deduction (2025–2028) that flows into Montana and North Dakota — both need inputs the calculator is not given (**D-31**, opened); low-income
refundable credits and rebates (HI, ME, NM, NY, OK, WV — each gone well below a retiree's income); Arkansas's "65 Special" credit (it excludes those taking the
retirement exemption the model applies); itemized deductions (no state's are modelled); and the fifteen flat-rate states' deductions — **D-30 batch 2, v6.03**
(Georgia is among them, the example household's state and the parity fingerprint's, so batch 2 re-baselines both on its own).

**Display.** My Data's model line adds "· deductions and exemptions taken" for each of the 27 and dates the figures ("deductions 2026"; "2025" for the six
held); the AI context line adds "after its deductions and exemptions"; the Field Manual's "no state's standard deduction or personal exemption is taken" is
replaced by what is and is not taken, in the Taxes entry and the methodology entry; each of the 27 notes says what it takes and what it does not.

**Tests.** New suite **`t66`** — **194** on v6.02, **54** on v6.01 (that leg pins the absence of `deduct`, the 1,000-token request, the silent
cut-off and the 45-second timeout): the 27 rows' components equal to the sources, dated, well formed (an extinction: exactly the 27 carry `deduct`); every
note names what is taken and what is not, and every age it names is one a component applies; the six phase shapes at their edges (Alabama's full $500
steps, Connecticut's "or fraction" and Table E rows, California's $6 steps, Maine's four-place ratio, Minnesota's cap, Maryland's table and senior-credit
bands, the Oklahoma and Oregon cliffs, Rhode Island's 20 % steps, South Carolina's $10 rounding, Wisconsin's slide, New Mexico's rate); 37 hand cases to the
cent computed independently in Decimal (e.g. Virginia single 66, $50,000 of wages: **$2,014.90**, was $2,617.50; Maryland joint 67/66 at $99,999:
**$5,031.87**); v6.01 → v6.02 over every jurisdiction, 22,032 calls (with `deduct` removed, byte-identical to v6.01; with it, the 27 equal an
independent implementation, `qa/d30_ref.mjs`, on the calculator's own measures, and the other 24 are byte-identical); Ask AI through the DOM with a
recording stub (both routes ask for 4,096; a `max_tokens` / `length` stop shows the notice and a finished one does not; the conversation memory re-sends the
answer without it; a timeout says 120 s; the AST holds every `max_tokens` and the timer to the constants); the Field Manual's cost, cap and timeout lines
held to the constants and the arithmetic; the display. A test seam `_onDetail` (no engine passes it) reports the calculator's measures. Controls
`qa/tools/controls_v602_deduct.py` (repo-only): **12 of 12**. **Derived pins gated per build** (DD-14 — each keeps its base and, on the v6.02 leg, expects that
base after the state's deductions and credits, priced by `qa/d30_ref.mjs` on the calculator's record of the very call; a different base fails; labels say
so): `t10` (§2E — through the TB / TB2 wrappers, and 15 difference, extinction and invariant pins gated one by one), `t35` (CT §B, §C by the record's base, RI-4), `t39` (ME, MT), `t50` (CT, MN, NM, RI, VT),
`t51` (the dated-figure census, 33 rows / 86 figures; six Maine cases; NJ; the display), `t52` (NY, AR, OK), `t53` (the exclusion-onset probe lifts `deduct`),
`t54` (WV, MD, ME; §X by the record), `t55` (MS), `t58` (CA, NY, RI), `t59` (RI, MS, WV), `t60` (ME), `t61` (OK), `t64` (§C, §E) and `t65` (§A-9, B-AR, §C, §E;
its group D reports itself not run in a v6.01 → v6.02 folder). `v602` registered by AST (77 array entries, 83 OR-gates, two version arms; no manual
site), the three Python suites and `t33`'s PINS by hand (unchanged: its household is in Georgia); the shim exports the evaluator and the Ask AI constants.

**Suite, run from the packaged copies:** 5,872 app checks across **65 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 6,002**. Every current-leg count equals v6.01's except the new `t66` and `t65`
(103 → 102: its group D, which needs `app_v600.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v601 v602 from a full clone of 9b531a1 with the github/ files overlaid (v6.01 resolved from history, commit 1c2674e), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5780, half B GRAND 222; none DIED. Source `d76dddc6381041c987fc5c87b8edad53` · built `16a4a850e5a10582b91eb98ea9b32ce5` (v6.01 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- The fifteen flat-rate states take no deduction yet (D-30 batch 2, v6.03); federal-tax deductions (AL, MO, OR) and the federal senior deduction (MT, ND) are
  not taken (D-31); low-income refundable credits are not taken; itemized deductions are not modelled — each conservative.
- Maryland's senior credit is taken at its reduced schedule (the full one applies only in a year the revenue trigger does not fire; TY2026's status is
  unpublished); AR, CA, DC, MD, OR and VT hold their 2025 figures — each conservative.
- The calculator has no dependents: exemptions count the filers only (the model's household has no dependents).
- Ask AI: an answer can still reach the 4,096-token limit — it now says so; the cost figures are October 2026's list prices for the model the app names.

## v6.01 — D-22 option 3, batch 2: the seventeen remaining progressive states on their own schedules; D-22 closes

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D22_BRACKETS_V601.md` (repo-only, fulfilled). v6.00 put ten states on their own bracket
schedules and left seventeen progressive rows on one rate each — a top rate (KS, MO, MT), a rate below the top (AL, CT, DC, DE, HI, ME, MD's "state+county",
ND, NE, NM, RI, VT) or a stale one (AR 3.9 %, WV 4.82 %). Steve: "Let's do the next batch for D-22." **All seventeen are now on their own schedules, each read
at its primary source on 2026-10-09** — with this release every taxing row is either on its own schedule or is one of the fifteen flat-rate states, and
`t65` asserts it:
- **Alabama** 2 / 4 / 5 % (§40-18-5) · **Delaware** 0 %–6.6 %, one schedule (30 Del. C. §1102(a)(14)) · **District of Columbia** 4 %–10.75 %, one schedule
  (§47-1806.03(a)(11)) · **Kansas** 5.2 / 5.58 % (K.S.A. 79-32,110; no 2026 cut, KDOR Notice 25-06) · **Missouri** 0 %–4.7 % in $1,348 bands (RSMo 143.011;
  2026 thresholds from the DOR's withholding formula) · **Montana** 4.7 / 5.65 % (HB 337) · **Nebraska** 2.46 %–4.55 % (LB 754; the DOR's 2026 schedule is a
  draft) · **New Mexico** 1.5 %–5.9 % (Laws 2024 ch. 67 — its top rate was 1 point above the row's 4.9 %) · **North Dakota** 0 / 1.95 / 2.5 % with a 0 % band to
  $49,575 single / $82,800 joint (Form ND-1ES 2026) · **Vermont** 3.35 %–8.75 % (2026 preliminary rates, IN-114) · **West Virginia** 2.11 %–4.58 %, one schedule
  (§11-21-4j, SB 392 of 2026, a 5 % cut retroactive to 1 January).
- **Arkansas** 0 %–3.7 % (Act 1 of the 2026 First Extraordinary Session — the top rate fell from 3.9 %), **with its high-income table**: above $94,700 of net
  income the law taxes all of it at 2 % on the first $4,700 and 3.7 % above, less a bracket adjustment of $290 that falls $10 per $100 to nothing above
  $97,600 — all modelled (new field `upper`).
- **Connecticut** 2 %–6.99 % (§12-700(a)(10)) **with the 2 % bracket's phase-out and the three benefit-recapture amounts** — whole dollars per $5,000 (or
  $10,000) of Connecticut AGI "or fraction thereof", up to $3,400 single / $6,800 joint — all modelled (new field `stepAdds`), on the state base.
- **Maryland** 2 %–6.5 % (§10-105, as amended in 2025) **plus the county income tax on the same base, at the highest county rate, 3.30 %** (the row used to be
  "state + county effective" at 7.5 %; new field `local`), **plus the 2 % tax on net capital gain when federal AGI exceeds $350,000** (from 2025; new field
  `cgSurtax`, measured on the calculator's existing federal-AGI measure).
- **Maine** 5.8 %–7.15 % **plus the new 2 % surcharge above $1,000,000 single / $1,500,000 joint** (36 M.R.S. §5111(7)) — a fourth bracket, top 9.15 %.
- **Hawaii** 1.4 %–11 % (the 2026 schedule) **plus the 13 % bracket Act 24 of 2026 adds from 2027 above $500,000 single / $1,000,000 joint**, and **Rhode
  Island** 3.75 %–5.99 % (ADV 2025-22) **plus the surtax the FY2027 budget imposes above $1,000,000 — 1 % in 2027, 2 % in 2028, 3 % from 2029 — taken at
  3 %**: each is applied in every year. At every income the result is at or above every schedule those acts enact for 2027–2029 (asserted to $3M), so it is
  a conservative stand-in for a model with no year dimension; holding 2026 alone would have understated tax from 2027 above the new lines.

**How.** Each row carries `brackets` and `rate` = its top rate, as at v6.00 (Maryland's `rate` is 6.5 % + 3.3 % = 9.8 %). Three new fields, each on exactly
one row (asserted): `upper` (Arkansas), `stepAdds` (Connecticut), `local` and `cgSurtax` (Maryland). My Data's line reads the schedule's own top rate and
adds Maryland's county clause ("the state's own brackets, 2.00% to 6.50%, plus a 3.30% county tax"); the AI context line likewise. The Field Manual's Taxes
entry now lists every progressive state on its own schedule and names the added rules; its "for the other progressive states one rate stands in" clause
is gone; the methodology entry follows; "skips county/city taxes" now excepts Maryland's.

**Measured** (v6.00 → v6.01): the Taxes tab's lifetime state tax on the example household, no conversions — **AL $71,301 → $77,583 (up)**, AR $61,794 →
$50,830, CT $75,553 → $70,199, DE $72,014 → $66,614, **DC $118,200 → $118,735 (up)**, HI $122,746 → $97,191, KS $101,470 → $98,216, ME $78,212 → $70,129,
**MD $101,478 → $107,711 (up)**, MO $85,468 → $80,952, MT $133,967 → $119,556, NE $94,560 → $71,599, NM $103,949 → $87,978, ND $36,369 → $9,526, RI $107,214 →
$85,823, VT $159,468 → $114,827, WV $85,801 → $62,920; the other 34 jurisdictions and "none" byte-identical. **Direction is mixed by design:** most households
pay less (the one rates overstated the low brackets); Alabama (4.5 % → 5 % on nearly all income), DC (its 8.5 % bracket) and Maryland (the explicit 3.30 %
county rate) pay more, and so do high incomes in Hawaii, Rhode Island, Maine, New Mexico and Connecticut. **The Roth comparator's best-by-estate cell
changes in 4 of the 51 cells tested** (seventeen states × three households: an early widow in RI; a B-dies household in AR, DE and VT). Engines C and D
compute no state tax; MC parity 10/10 with **no** declared diff (its state fingerprint is a Georgia call).

**Decisions taken on recommendation** (scope §1): BR2-1 the same field; BR2-2 Arkansas's table exactly; BR2-3 Connecticut's adds exactly; BR2-4 Maryland's
county tax at the highest rate (3.30 %, not the 3.20 % most Marylanders pay — overstates by 0.10–1.05 points of the base below 3.30 %, disclosed); BR2-5
Maryland's capital-gains tax; BR2-6 Maine's surcharge as a bracket; BR2-7 Hawaii's and Rhode Island's enacted later top brackets applied in every year;
BR2-8 later lower schedules (MT, NE 2027; triggered cuts) not applied; BR2-9 one schedule on a couple's combined income where the law lets spouses compute
separately (AR, DE, MO); BR2-10 Missouri's capital-gains subtraction left for its own release (D-29).

**Tests.** New suite **`t65`** — **103** on v6.01, **54** on v6.00 (that leg pins the one rates): each schedule and new field equals its
source; **the D-22 extinction** (no taxing row lacks a schedule unless it is a flat-rate state); every note states its top rate for its year, its own
brackets and its simplification; the notes' claims about later schedules (HI, MT, NE, RI) and Vermont's minimum tax held to the code; the printed bases
(to the cent for CT, DC, KS, NM, ND, NE, RI, WV and Arkansas's DFA constants; within $1 for HI, ME and VT, which print whole dollars); 46 hand cases to the
cent computed independently from the printed tables (e.g. Alabama single, $50,000 of wages: **$2,460.00**, was $2,250.00; Arkansas at $94,750, inside the
adjustment band: **$3,135.85**; Maryland single, $120,000: **$9,657.50**, was $9,000.00; North Dakota joint, $400,000: **$6,708.73**, was $8,000.00);
a v6.00 → v6.01 comparison over every jurisdiction and 192 households (byte-identical outside the seventeen; inside, equal to an independent
implementation on v6.00's base); the display and the Field Manual. Controls `qa/tools/controls_v601_brackets.py` (repo-only): **13 of 13**. **Derived pins
gated per build** (their base kept, the schedule figure computed in the suite and labelled; sites counted by AST): `t10` 42 (AL, DE, MD, ME, MT, NM, RI),
`t35` (CT §B 14, §C by inverting the schedule; RI-4), `t39` 14 (ME, MT), `t50` 14 (CT, NM, RI, VT), `t51` (the dated-figure census, 33 rows / 59 figures;
six Maine cases; the display), `t52` (AR), `t54` (WV, MD, ME; §X by inversion), `t58` (RI), `t59` (RI, WV), `t60` (ME), `t61` (the rate-claim set, now every
taxing row), and v6.00's own `t64` (its A-1, A-5, D, E-1, E-5, E-6 and E-8 on a v6.01 leg; its group D needs `app_v599.mjs` and reports itself not run in a
v6.00 → v6.01 folder). `v601` registered by AST (64 array entries, 83 OR-gates, two version arms; no manual site), the three Python suites and `t33`'s PINS
by hand (unchanged: its household is in Georgia).

**Suite, run from the packaged copies:** 5,579 app checks across **64 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 5,709**. Every current-leg count equals v6.00's except the new `t65` and
`t64` (65 → 62: two of its v6.00-only checks, E-6 and E-8, are gated to that leg, and its group D, which needs `app_v599.mjs`, reports itself not run). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v600 v601 from a full clone of c00822f with the github/ files overlaid (v6.00 resolved from history, commit b800ca1), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5487, half B GRAND 222; none DIED. Source `b7eb4dcb32795a35c5026953a5a31b68` · built `55cae3ab526d114eaaa89a6d890d8a8e`
(v6.00 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- No state standard deduction, personal exemption or credit is taken in any state, nor Alabama's deduction of federal income tax (conservative) — now **D-30**,
  the recommended next release.
- Missouri exempts capital gains from 2025 (HB 594); the model taxes them (conservative) — **D-29**.
- Hawaii's 7.25 % capital-gains cap, Montana's 3 % / 4.1 % capital-gains rates, North Dakota's 40 % and New Mexico's $2,500 capital-gains deductions and
  Vermont's capital-gains exclusion are not modelled (conservative).
- Maryland's county tax is the highest county's (3.30 %); Arkansas, Delaware and Missouri tax a couple on one schedule where the law lets spouses compute
  separately; later lower schedules (MT, NE 2027) and triggered cuts (KS, MO, WV) are not applied — each conservative.
- Hawaii's and Rhode Island's later top brackets are applied in 2026 too (conservative before they start); Nebraska's 2026 schedule is the DOR's draft
  and Vermont's the Department's preliminary table, both computed by statute from published indexes.
- Flat-rate rows still read "X% effective rate (an approximation)" in My Data — a label, not a figure; left for a presentation release.

## v6.00 — D-22 option 3, batch 1: ten states taxed on their own bracket schedules

**A MODELLING release** (METHODOLOGY updated). `docs/SCOPE_D22_BRACKETS_V600.md` (repo-only, fulfilled). Through v5.99 every state was taxed at ONE rate on
its whole base — a statutory flat rate where the state has one, and elsewhere a top rate (Oklahoma) or an "effective" rate of the model's own making
(California 6 %, New York 6 %, New Jersey 5.5 %, Oregon 8 %, Minnesota 6.8 %, Wisconsin 5.3 %, South Carolina 6 %). After v5.99 Steve chose option 3:
the progressive states' real schedules, read from the law, in batches. **This is the first batch — ten states, each schedule re-read at its primary
source on 2026-10-09:**
- **California** — Schedules X / Y, 1 %–12.3 %, the **TY2025** table (TY2026 not published; the 2026 Form 540-ES says to use the 2025 table), plus the 1 %
  Behavioral Health Services Tax on taxable income over $1,000,000 at every filing status (R&TC §17041, §17043): top rate 13.3 %.
- **Minnesota** 5.35 %–9.85 % (TY2026, MN DOR) · **Mississippi** 0 % on the first $10,000, 4 % above · **New Jersey** N.J.S.A. 54A:2-1, separate single
  and joint tables, 1.4 %–10.75 % · **Oklahoma** 0 / 2.5 / 3.5 / 4.5 % (HB 2764; the top-rate convention of v5.97 retires) · **Oregon** 4.75 %–9.9 %
  (OR-ESTIMATE 2026) · **South Carolina** 1.99 % and 5.21 % for every status (Act 110 of 2026, H.4216 — its $15,000 age-65 deduction stands; §12-6-1170 is
  unamended) · **Virginia** 2 %–5.75 %, one schedule for every status (§58.1-320) · **Wisconsin** 3.5 %–7.65 % (2026 Form 1-ES).
- **New York** 3.9 %–10.9 % (Form IT-2105-I, 2026) **with its tax-benefit recapture**: above New York AGI of $107,650 the first worksheet moves the tax
  toward a flat 5.9 % single / 5.4 % joint on all taxable income over $50,000 — modelled exactly, four-place fraction and all; above $215,400 single /
  $161,550 joint the later worksheets' end point (the bracket's own rate on all of it) is taken at once, where the law phases it in (conservative).

**How.** A row may now carry `brackets: { single, joint }`; the calculator taxes it on its schedule — single or joint by the return's status, so a
survivor files on the single schedule — applied to the same base the flat rate saw. `rate` stays, equal to the top rate (asserted), so every reader of
it keeps working. My Data's line reads "the state's own brackets, L% to T%" with "brackets YYYY" among its dated figures; the AI context line says the
same. The Field Manual's three sentences that said effective rates stand in for progressive brackets now name the ten states, and say that no
state's standard deduction or personal exemption is taken anywhere.

**Measured** (v5.99 → v6.00): the Taxes tab's lifetime state tax on the example household, no conversions — California **$109,108 → $72,258**, Minnesota
**$151,642 → $140,098**, Mississippi **$2,565 → $991**, New Jersey **$26,360 → $13,388**, New York **$65,747 → $54,969**, Oklahoma **$64,281 → $55,476**,
**Oregon $145,477 → $146,037 (up)**, South Carolina **$74,510 → $46,676**, Virginia **$86,431 → $80,326**, Wisconsin **$56,266 → $45,957**; the other 42
jurisdictions byte-identical. **Direction is mixed by design:** the effective rates overstated the lower brackets, so most households fall; the high
single-schedule incomes in California, Oregon and New York rise. **The Roth comparator's best-by-estate cell changes in 5 of the 30 cells tested** (ten
states × three households: an early widow in MN and NJ; a B-dies household in CA, SC and WI) — with a graduated schedule a conversion's state cost
depends on the bracket it fills, which one rate could not see. Engines C and D compute no state tax; MC parity 10/10 with **no** declared diff (its
state fingerprint is a Georgia call).

**v6.00, not v5.100.** The suites compare version tags as strings and sort pool files lexically, so `v5100` would sort below `v599`. Thirteen tooling
patterns that assumed a major of 5 now read any single-digit major (`mk_runfolder.sh`, `smoke_built`, `t9`, `domdiff_withdrawal`, `vergates`, `vercensus`,
`vercensus_list`, `package_check`, `package_check_controls.sh`); OPERATIONS §G records the rule. The pool's source is `DangerClose-v6_00.jsx`.

**Decisions taken on recommendation** (scope §1): BR-1 the field; BR-2 `rate` = the top rate; BR-3 no state standard deductions or exemptions yet
(conservative — recommended as a follow-up); BR-4 schedules held at their latest year; BR-5 New York's recapture; BR-6 Mississippi one band per return;
BR-7 Virginia one schedule; BR-8 South Carolina's SCIAD not taken; BR-9 New Jersey's 50 cents; BR-13 the batch; BR-14 the version number.

**Tests.** New suite **`t64`** — **65** on v6.00, **34** on v5.99 (that leg pins the single rates): each schedule equals its source
and is dated; an extinction check over every row with a schedule (ascending, rates never fall, last row open, top rate = `rate`); each schedule against
the state's PRINTED table (to the cent for WI, OK, NJ and SC; within 2 cents for CA and $1 for NY and OR, which round their bases); hand cases to the cent computed
independently from the printed tables (e.g. California single at 66 with $60,000: **$2,184.05**, was $3,600.00; Oklahoma single at 66 with $50,000:
**$1,585.25**, was $1,800.00; New York single with $120,000: **$6,652.11** inside the recapture's phase-in); a v5.99 → v6.00 comparison over every
jurisdiction and a grid of households (byte-identical outside the ten; inside, equal to an independent schedule on v5.99's base); the display and the
Field Manual, each clause held to its code fact. Controls `qa/tools/controls_v600_brackets.py` (repo-only): **11 of 11**. **Derived pins gated per build**
(their base kept, the bracket leg's figure computed in the suite and labelled): `t10` (Mississippi, New Jersey, Virginia, Wisconsin — the NJ residual
block now asserts the flat-rate error is ZERO), `t50` (MN), `t51` (dated-figure census, NJ), `t52` (NY, OK), `t53` (its line selector), `t55` and `t59`
(MS), `t58` (CA, NY), `t61` (OK, the rate-claim set), `t63` (MS's note). `v600` registered by AST (52 array entries, 83 OR-gates, two version arms; one
manual site, `t63`'s single-build group C, left single-build by design), the three Python suites and `t33`'s PINS by hand (173,836, measured).

**Suite, run from the packaged copies:** 5,395 app checks across **63 app suites**, 0 failed, 0 DIED; MC parity 10/10; tooling `t21` 64,
`domdiff` 32, `sets` 12 + 12; **GRAND 5,525**. Every current-leg count equals v5.99's except the new `t64` and
`t63` (18 → 9: its group C compares v5.99 with v5.98 and runs on the v5.99 leg only). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v599 v600 from a full clone of 5c90d85 with the github/ files overlaid (v5.99 resolved from history, commit f7ce172), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5303, half B GRAND 222; none DIED. Source `d535e13e865e9592e41f93f4359328f0` · built `3e02a42fac6f6281d7c0b17ab77cdcbd` (v5.99 rebuilt byte-identical
first; `smoke_built` 22 passed, 0 failed).

**Limitations, disclosed:**
- No state standard deduction, personal exemption or exemption credit is taken in any state (conservative).
- Schedules are held at their latest published year (California's TY2025) for every later year; indexing is not applied (conservative).
- New York: the later recapture worksheets' phase-in is not modelled (conservative); NYC tax is not modelled.
- Mississippi's per-spouse band on a combined return, Virginia's Filing Status 4 and $259 spouse adjustment, and South Carolina's SCIAD are not modelled
  (conservative); New Jersey's joint $70,000–$80,000 band is 50 cents below the statute (immaterial; in its note).
- Seventeen progressive rows still use one rate (AL, AR, CT, DE, DC, HI, KS, ME, MD, MO, MT, NE, NM, ND, RI, VT, WV) — D-22 stays open for them.

---

**Older entries are in the repo, not the knowledge pool, each moved verbatim to recover project-knowledge space:**
**v5.75 to v5.99 in `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` (2026-10-11); v5.60 to v5.74 in `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`
(2026-09-28); v5.59 and earlier in `docs/CHANGELOG_ARCHIVE_pre_v5_60.md` (2026-09-15).**
