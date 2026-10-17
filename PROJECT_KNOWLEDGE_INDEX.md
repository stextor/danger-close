# Project Knowledge Index — Danger Close

**This file is the source of truth for what's in project knowledge.** A session reads it
FIRST, before trusting any source file, because project knowledge is a flat pool with no
version awareness — a stale file looks identical to a current one. This manifest removes the
guessing: it names which build is current, which is the prior comparison baseline, and what
every other file is.

Update this file as step 1 of every post-build knowledge refresh.

---

## Where the project instructions live (changed 2026-08-09)

**`PROJECT_INSTRUCTIONS.md` is NO LONGER a knowledge file.** Its ground rules, conventions,
cautions, and voice now live in the **project instructions**, which are injected into every
conversation automatically — so they cannot go stale in the pool or be missed by a session that
doesn't search for them. (They did go stale once: a v5.11 amendment sat unapplied for a full
release cycle, invisible because a stale copy is byte-identical to a current one.)

The operational half — sections §A–§N — lives here as **`OPERATIONS.md`**. If a session finds a
`PROJECT_INSTRUCTIONS.md` in the pool, it is a leftover and should be deleted.

## Current build (the canonical working source)

| Field | Value |
|---|---|
| Version | **v6.17** |
| Source file in knowledge | `DangerClose-v6_17.jsx` |
| Source md5 | `dc8a4d5f5796b11d88007024b1ecaca7` |
| Built `index.html` md5 | `067c87404e92339a1de9ece815d6151e` |
| Shipped | 2026-10-16 |

> ⚠ **v6.17 SHIPPED (2026-10-16) — the cash from a home move is a My Data field, not a fixed $130,000 added to every plan (D-38).** Source `dc8a4d5f…` · built `067c8740…`.
> A MODELLING release (METHODOLOGY gains *Cash from a home move*): `HOME_SALE_PROCEEDS = 130000`, added at retirement to every plan by both Monte Carlo engines and disclosed nowhere, is replaced by the signed My Data field *Cash from your home move at retirement* (`homeMoveCash`), read through one accessor. A plan saved before v6.17 reads $0 with a notice; new plans start at $0; the example keeps $130,000. Engines A–D never read it (D-39 opened). D-38 filed and closed.
> New suite `t80` (oracle modules built from the v6.16 source); `t29` gains the census row `home_move`; the shim exports `homeMoveCash`; `v617` registered. **Rotation:** the pool loses `DangerClose-v6_16.jsx` and `dom_entry_v616.jsx` (v6.16 read from history, commit `13b281a`) and gains `DangerClose-v6_17.jsx`, `dom_entry_v617.jsx`
> and `t80_home_move_cash.mjs`. **Pool 137 → 138** (count from the Projects listing).
>
> *(Superseded, retained: the v6.16 note follows.)*
>
> ⚠ **v6.16 SHIPPED (2026-10-16) — self-employment tax: a self-employed job row pays both halves, on 92.35% of the profit (D-36).** Source `dfc07ee7…` · built `765cd89f…`.
> A MODELLING release (METHODOLOGY's *Payroll tax on job income* gains a self-employment subsection): My Data's Type dropdown offers "Job — employee (W-2)" and "Job — self-employed (1099)" (`selfEmployed: true`); `payrollTax` applies §1401/§1402 — 92.35% of the profit, nothing under $400 (`SE_MIN_NET`, Verify 71 → 72), Social Security on the base the same person's wages leave, the 0.9% on wages + net earnings. Rows saved before v6.16 stay employees. Not taken, disclosed: §164(f) and §199A (D-37). D-36 closes.
> New suite `t79`; `t29` gains the census row `self_employed` (two fixtures); `t77` B-3/E-4 and `t78` D-2a re-gated; `v616` registered. **Rotation:** the pool loses `DangerClose-v6_15.jsx` and `dom_entry_v615.jsx` (v6.15 read from history, commit `cbe2eb2`) and gains `DangerClose-v6_16.jsx`, `dom_entry_v616.jsx`
> and `t79_self_employment.mjs`. **Pool 136 → 137** (count from the Projects listing).
>
> *(Superseded, retained: the v6.15 note follows.)*
>
> ⚠ **v6.15 SHIPPED (2026-10-16) — the Events tab speaks to users only: no Google Drive, no maintainer chores, and the strip never hides the user's own reminders.** Source `a9520db5…` · built `38f51c21…`.
> A PRESENTATION release (METHODOLOGY unchanged): the tax card is a NOTICE the app-wide strip ignores (`alertStripEvents`); the backtest and peer chores are gone (sixteen events); the backup card and the STALE strip are neutral and no longer promise the plan "survives the swap"; the Field Manual follows. The maintainer's three refresh cycles moved to OPERATIONS §I, *Annual data refreshes*.
> New suite `t78`; `t73` §E and `domdiff` re-gated; the shim exports `alertStripEvents`; `v615` registered. **Rotation:** the pool loses `DangerClose-v6_14.jsx` and `dom_entry_v614.jsx` (v6.14 read from history, commit `ec5f16c`) and gains `DangerClose-v6_15.jsx`, `dom_entry_v615.jsx`
> and `t78_events_user_facing.mjs`. **Pool 135 → 136** (count from the Projects listing).
>
> *(Superseded, retained: the v6.14 note follows.)*
>
> ⚠ **v6.14 SHIPPED (2026-10-15) — payroll tax on job income follows the law: the 0.9% Additional Medicare Tax (D-17) and the wage cap per earner (C-14).** Source `57e4fca1…` · built `2eeb7650…`.
> A MODELLING release (METHODOLOGY gains a section): one helper, `payrollTax`, called by Engines A (twice) and B; rates in `TAX_CONSTS` with five Verify checks (71 in all). Engines C and D and the Monte Carlo cannot move (`t77` §C). D-17 closed; C-14 filed and fixed; E-23 narrowed; D-36 (self-employment) opened and disclosed.
> New suite `t77`; `t29` gains the census row `payroll`; `t1`/`t4` count 71 Verify checks; `v614` registered. **Rotation:** the pool loses `DangerClose-v6_13.jsx` and `dom_entry_v613.jsx` (v6.13 read from history, commit `756dc76`) and gains `DangerClose-v6_14.jsx`, `dom_entry_v614.jsx`
> and `t77_payroll_tax.mjs`. **Pool 134 → 135** (count from the Projects listing).
>
> *(Superseded, retained: the v6.13 note follows.)*
>
> ⚠ **v6.13 SHIPPED (2026-10-15) — C-11: the Roth tab's break-even card says what it measures; C-9 closed on evidence; the age-65 deduction read at source.** Source `b08609bd…` · built `6afe2ab9…`.
> A PRESENTATION release: the card, the Field Manual and METHODOLOGY name the face-value measure ("after-tax wealth" is extinct), METHODOLOGY says why face value is the conservative direction, and the §63(f) blind amount is disclosed. No code moved (`t76` §D, by AST). C-9 was fixed at v6.07 (D-33) and is now asserted extinct; E-25 closes; OPERATIONS gains §K2 (sweep the registers for the mechanism).
> New suite `t76`; `t29` gains the §K1 row `crossover`; `v613` registered. **Rotation:** the pool loses `DangerClose-v6_12.jsx` and `dom_entry_v612.jsx` (v6.12 read from history, commit `47d6854`) and gains `DangerClose-v6_13.jsx`, `dom_entry_v613.jsx`
> and `t76_crossover_label.mjs`. **Pool 133 → 134** (count from the Projects listing).
>
> *(Superseded, retained: the v6.12 note follows.)*
>
> ⚠ **v6.12 SHIPPED (2026-10-14) — C-5: the Withdrawal tab's Bracket column taxes Social Security by the §86 worksheet, on the household's own return.** Source `fc8d2a5f…` · built `bc19a24e…`.
> A MODELLING release whose reach is one displayed column (METHODOLOGY gains a section): Engine D calls `taxableSS86` on the year's filing status and takes its table, deduction and age-65 extra from `projectBracketsAt`; nothing else moves (t75 §C). Three sentences elsewhere that misstated §86 corrected (DC-4).
> New suite `t75`; `t14` (Engine D joins `filingEngines`), `t19`, `t20`, `t40`, `t43` and `domdiff` re-gated; `v612` registered. Registers: C-5 fixed, C-10 marked fixed at v6.09. OPERATIONS §C gains the DOM-bundle module-copy trap.
> **Rotation:** the pool loses `DangerClose-v6_11.jsx` and `dom_entry_v611.jsx` (v6.11 read from history, commit `8e5133a`) and gains `DangerClose-v6_12.jsx`, `dom_entry_v612.jsx`
> and `t75_engine_d_ss86.mjs`. **Pool 132 → 133** (count from the Projects listing).
>
> *(Superseded, retained: the v6.11 note follows.)*
>
> ⚠ **v6.11 SHIPPED (2026-10-14) — F-19r: the Ranking tab's headline is the net-worth band, and the tab stops claiming what it does not measure.** Source `35f3c656…` · built `ff3c5d7e…`.
> A PRESENTATION release (no engine reads it; parity unchanged; METHODOLOGY gains a short section). Four rows unranked, three removed, the praise copy replaced by figures, the Field Manual's Ranking entry rewritten.
> New suite `t74`; `t73` C-3 gated per leg; `v611` registered. F-19 is now two IDs, F-19s and F-19r (UsabilityFlaws census). OPERATIONS §C gains the Monte Carlo re-run trap.
> **Rotation:** the pool loses `DangerClose-v6_10.jsx` and `dom_entry_v610.jsx` (v6.10 read from history, commit `89963eb`) and gains `DangerClose-v6_11.jsx`, `dom_entry_v611.jsx`
> and `t74_ranking_headline.mjs`. **Pool 131 → 132** (count from the Projects listing).
>
> *(Superseded, retained: the v6.10 note follows.)*
>
> ⚠ **v6.10 SHIPPED (2026-10-13) — the Ranking tab's peer benchmarks move to the 2025 SCF, computed from the Fed's microdata.** Source `1b41119b…` · built `93ff44d5…`.
> A data and presentation release (no engine reads the figures; METHODOLOGY gains a section). One module-level table, `PEER_BENCHMARKS`; `PEER_DATA_SCF_YEAR` 2025; the alarm clears.
> New suite `t73`, new tool `qa/tools/peer_scf.py` (pooled); `domdiff` sets aside the shell banner for this pair; the shim exports the table. New finding F-19 (UsabilityFlaws).
> The `vite_config.js` row is corrected to `vite.config.js` (the pool's real name).
> **Rotation:** the pool loses `DangerClose-v6_09.jsx` and `dom_entry_v609.jsx` (v6.09 read from history, commit `2f25660`) and gains `DangerClose-v6_10.jsx`, `dom_entry_v610.jsx`,
> `t73_peer_benchmarks.mjs` and `peer_scf.py`. **Pool 129 → 131** (count from the Projects listing).
>
> *(Superseded, retained: the v6.09 note follows.)*
>
> ⚠ **v6.09 SHIPPED (2026-10-13) — D-35: a Roth IRA entered under Other accounts is counted once in the Withdrawal tab, as Roth money.** Source `a32ef453…` · built `df3d3e7e…`.
> A MODELLING release (METHODOLOGY updated). Engine D holds the Roth money out of the pool's gains part and out of the buckets' Roth share; the Withdrawal tab shows it once.
> A household with no Roth IRA under Other accounts does not move (the example holds none). New suite `t72`; `t29`, `t71` and `domdiff` re-gated; the boundary census gains a row.
> **Rotation:** the pool loses `DangerClose-v6_08.jsx` and `dom_entry_v608.jsx` (v6.08 read from history, commit `b6eb255`) and gains `DangerClose-v6_09.jsx`, `dom_entry_v609.jsx`
> and `t72_engine_d_other_roth.mjs`. **Pool 128 → 129** (count from the Projects listing).
>
> *(Superseded, retained: the v6.08 note follows.)*
>
> ⚠ **v6.08 SHIPPED (2026-10-12) — D-34: the Withdrawal tab converts a Traditional IRA entered under Other accounts, and carries it as an account.** Source `a739b64a…` · built `2e869c23…`.
> A MODELLING release (METHODOLOGY updated). Engine D figures its conversion after the year's draws (bucket money first, then that IRA, never annuity money), grows the IRA's RMD
> tracker and takes its RMD whole; the example household does not move at $0 or $70,000. New suite `t71`; `t19`, `t29`, `t70` and `domdiff` re-gated; the boundary census gains two rows.
> New open item D-35 (a Roth IRA under Other accounts is counted twice in Engine D).
> **Rotation:** the pool loses `DangerClose-v6_07.jsx` and `dom_entry_v607.jsx` (v6.07 read from history, commit `4cb6859`) and gains `DangerClose-v6_08.jsx`, `dom_entry_v608.jsx`
> and `t71_engine_d_other_ira.mjs`. **Pool 127 → 128** (count from the Projects listing).
>
> *(Superseded, retained: the v6.07 note follows.)*
>
> ⚠ **v6.07 SHIPPED (2026-10-12) — D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money.** Source `ee557028…` · built `5b444023…`.
> A MODELLING release (METHODOLOGY updated). Engines A, B and C and the Roth tab's ladder carry the annuity dollars; Engine D and the Monte Carlo untouched; an annuity-free
> household bit-identical. New suite `t70`; eleven suites re-gated for the example's $7,000 annuity; `t33`'s PINS carried. New open item D-34 (Engine D converts bucket money only).
> **Rotation:** the pool loses `DangerClose-v6_06.jsx` and `dom_entry_v606.jsx` (v6.06 read from history, commit `9232406`) and gains `DangerClose-v6_07.jsx`, `dom_entry_v607.jsx`
> and `t70_annuity_conversion.mjs`. **Pool 126 → 127** (count from the Projects listing).
>
> *(Superseded, retained: the v6.06 note follows.)*
>
> ⚠ **v6.06 SHIPPED (2026-10-12) — D-28 widened: a commercial annuity gets no retirement relief in the thirteen states whose law gives it none; Maryland's pension exclusion no longer reaches IRA money.** Source `a5ac49a5…` · built `fa02504f…`.
> A MODELLING release (METHODOLOGY updated). Thirteen rows carry `reliefKinds` (AR, CO, DE, IA, IL, MD, ME, MI, MS, NY, OK, PA, WI); the calculator nets their relief against the eligible
> categories only. New suite `t69`; `t33`'s PINS carried. New open item D-33 (conversions draw annuity money). **Rotation:** the pool loses `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`
> (v6.05 read from history, commit `11c1d13`) and gains `DangerClose-v6_06.jsx`, `dom_entry_v606.jsx` and `t69_annuity_relief.mjs`. **Pool 125 → 126** (count from the Projects listing).
>
> *(Superseded, retained: the v6.05 note follows.)*
>
> ⚠ **v6.05 SHIPPED (2026-10-12) — the Field Manual counts six income-limited exclusions and no longer says Rhode Island's is applied to IRA money.** Source `f230ffbb…` · built `1c3d9f3a…`.
> A TEXT-ONLY release: no figure moves. Two Field Manual sentences corrected (E-29 (e)); METHODOLOGY's "thirteen of nineteen unverified" (E-29 (f)) and three lines of
> the same kind corrected, and the Field Manual's copy of it (its state-age paragraph; `t52` F-1–F-3); `t35` RI-7 inverted and gated per build, RI-8–RI-10 new (RI-9 derives the count from `STATE_RULES`); E-29 (d) and (k) closed by Steve's decisions.
> `t33`'s PINS carried; `package_check_controls.sh`'s app-release test no longer needs a `## v5` heading (P56/P57 run again); `package_check` H-1/H-2's window ends at the next heading. **Rotation:** the pool loses `DangerClose-v6_04.jsx` and `dom_entry_v604.jsx` (v6.04 read from history, commit `a923332`) and gains
> `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`. **Pool 125 → 125** (count from the Projects listing).
>
> *(Superseded, retained: the v6.04 note follows.)*
>
> ⚠ **v6.04 SHIPPED (2026-10-11) — D-31 and D-29: the deductions a state takes from the federal return, and Missouri's capital-gains subtraction.** Source `8226b20b…` · built `71f4ada6…`.
> A MODELLING release (METHODOLOGY updated). The state calculator is given the model year, the year's federal income tax and NIIT, and the realized gains (all three call
> sites); Alabama, Missouri and Oregon deduct federal income tax; the six states whose returns carry the federal senior deduction (2025–2028) take it; Missouri subtracts
> capital gains. New suite `t68`; `d30_ref.mjs` extended; derived checks gated in `t64`–`t67`; `t33`'s PINS carried. **Rotation:** the pool loses `DangerClose-v6_03.jsx`
> and `dom_entry_v603.jsx` (v6.03 read from history, commit `12a4428`) and gains `DangerClose-v6_04.jsx`, `dom_entry_v604.jsx` and `t68_fed_deductions.mjs`.
> **Pool 132 → 133** (count from the Projects listing).
>
> *(Older ship notes — v6.03 back to v5.42, with the ops, handover and docs notes between them — moved verbatim on 2026-10-11
> to `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`, repo only (OPERATIONS §G). Their open threads were traced first: that file's §0 records where each went.)*

**Any work — edits, verification, scope premises — is done against this file.** Confirm its
md5 matches the value above before starting (see the pre-build freshness check in
OPERATIONS.md §A). A mismatch means knowledge is stale — refresh before working.

## Test and harness file hashes (freshness fallback — OPERATIONS §A2)

**Why this table exists.** Until v5.30 the freshness check hashed the `.jsx` sources and nothing else,
so a stale test in this flat pool was invisible by construction. One was: the pool's `t8_invariant.mjs`
was an older 35-check copy with 3 failing assertions while the committed file had 38 and was green,
which halted the v5.30 build and cost most of a session to diagnose. Recorded as **E-14**.

> ### ⚠ 2026-08-28 — the table VOUCHED for two stale pool files, and the freshness check passed on them
>
> The clone-and-diff found the pool one package behind in **five** files. For three of them
> (`CHANGELOG.md`, `OPERATIONS.md`, `t8_invariant.mjs`) this table was already correct, so the
> mismatch was visible. **For `package_check.mjs` and `package_check_controls.sh` it was not:** the
> pool held the pre-rewrite copy *and this table recorded the pre-rewrite hash*, so §A steps 1–3
> — hash the pool file, compare to the manifest — returned **MATCH on a file 162 lines out of date**.
> `qa/tools/controls_state.sh` was absent from the pool and had no row at all.
>
> **A stale file and a stale row agree with each other.** That is not a weaker version of drift, it
> is the invisible version: the check designed to catch it reports green, and only the clone
> disagrees. This is the fourth recorded block to go stale and the first where the *record* went
> stale in the same motion as the thing it records. Rows corrected and rows added in this package —
> but the durable lesson is the line immediately below, which was already right.

⚠ **Prefer the clone-and-diff in OPERATIONS §A2 over this table.** A recorded table is only as fresh as
the release that wrote it, and this project has had FOUR separate recorded blocks go stale — the fourth opened the v5.36 session-2 build: six suite files in the pool were pre-session-1 copies while the brief said otherwise, recoverable only from the maintainer's archive (E-18). This is the
offline fallback, accurate **as of 2026-08-20** — every row in it was re-verified against a fresh
clone on that date: **44 rows, 0 mismatches against the pool and 0 against the committed tree**, after
two rows for rotated-out `dom_entry_*` files were pruned, six *"not yet committed"* notes corrected,
and an `index.html` row added. At the v5.38 ship every row was re-hashed
from the mounted pool at post-ship verification (the fifth stale-block incident: that ship left the
table un-rolled for a day, caught by the closing sweep). At the v5.39 ship the six rows the release
actually changed — `t1_units`, `t3_roth`, `t4_dom`, `t5_storage`, `t6_single` and the new
`dom_entry_v539.jsx` — were rolled from a **fresh clone of the committed tree**, and a full
pool-vs-clone sweep confirmed 42 files matching, 0 stale. Rows not listed as changed are carried
forward from that v5.38 re-hash. **At the v5.42 ship the check ran clean in both directions for the
first time on record**: a fresh clone compared by CONTENT against the whole pool found exactly one
pool-only file (`DangerClose-v5_40.jsx`, the rotated-out build) and no repo-only *build input* — the
repo-only set was the built `index.html`, the `qa/tools/` scripts the pool deliberately does not keep,
and superseded `dom_entry_*` files, all expected. Rows the v5.42 release changed are rolled below;
rows not listed as changed carry forward.

⚠ **`OPERATIONS.md` DRIFTED IN THE POOL and was restored 2026-08-22.** The pool copy was the
pre-§E-correction version (parity still reading **8/8**) while the repo carried the corrected one
(**9/9**). Since the pool is where a session without a clone reads OPERATIONS, the freshness rule
itself was being read from a stale copy. **Found by the §A2 content diff, which is the only check
that looks at documents at all** — no suite reads them. This is the fourth document-drift finding in
two days and the first that was not self-inflicted by a stale edit base, which is the argument for
running the §A2 diff *both directions* every time rather than only when something looks wrong.

⚠ **A fourth orphan `dom_entry` row, removed 2026-08-22.** `dom_entry_v543.jsx` rotated out at v5.45
and its §A2 hash row survived — the same slip as `v541` and `v542` before it, now three releases
running. **Rotating a leg is two edits: delete the file AND delete its hash row.** If it happens a
fourth time the rotation block should generate these rows rather than have them hand-maintained.

⚠ **Three rows were wrong after the v5.44 ship, corrected 2026-08-22.** v5.44's manifest was rolled
from a clone taken BEFORE the preceding scope package landed, so it silently **reverted** that
package's manifest edits and layered v5.44's on top: `SCOPE_ITEMS_3_6_perRmd.md`'s row vanished and
`dom_entry_v541.jsx`'s reappeared, joined by a newly-orphaned `dom_entry_v542.jsx`. **The freshness
check covers the SOURCE; it did not cover the document base.** Re-clone before editing any document
that a prior package already changed — a stale doc base reverts silently and the suite cannot see it.

⚠ **AUDITED 2026-08-23: 37 of the pool's 89 files (90 since 2026-08-23 — see below) have no row in this table, and 10 of them are
not documents.** Counted by script, not by eye. The non-document gaps are `mk_testable.sh` and
`run_all.sh` — named as harness files in OPERATIONS §B — the four parser tools `census.cjs`,
`funcmap.cjs`, `diverge.cjs` and `residual.cjs`, plus `package.json` and `vite.config.js` (named `vite_config.js` here until v6.10 — the mount's name, not the pool's). The two
`.jsx` sources are covered by the build tables above instead, by design. **Nothing has drifted right
now**: the 2026-08-23 both-directions sweep found every pool file except the prior-leg source
byte-identical to its repo counterpart, so this is a latent hole, not a live one. But it is exactly
the defect class §A2 was written to close — *"a stale test in the pool was invisible by
construction"* — and it is the third recording of the same shape on this page.
**Not fixed here, deliberately.** Whether the 27 `.md` documents want rows is a separate question
from whether the harness files do, and a partly-filled table is worse than an openly incomplete one
— the same rule this file applies to its own count lines. It needs one decision, taken once.

⚠ **Two rows were missing for a day and added 2026-08-21.** `STATUS_v5_42_shipped.md` and
`package_check.mjs` were uploaded to the pool at the v5.42 refresh and the ops fix respectively, and
neither was given a row here — so both were **invisible to the freshness check by construction**, the
exact hole this table exists to close (E-14). Found by sweeping pool filenames against this file's
text rather than by reading the table, which is the only way to find a row that was never written.
**Adding a file to the pool and adding its row are two acts, and the second is the one that gets
skipped** — the same shape as the rotation/manifest split recorded under Prior build below.

**WHAT THIS TABLE COVERS, stated explicitly 2026-08-23 so it stops implying more than it does.**
It carries the **test, harness and build-input** files the pool holds — the ones where staleness is
SILENT, because a stale test either fails against correct code and reads as a regression or passes
vacuously and hides one. It does **not** carry the pool's 27 `.md` documents, and that is a decision
rather than an oversight: documents change most releases, so rows for them would be 27 more figures
to roll every time — a new drift surface on a page that has already recorded this exact failure
three times. Documents are covered by the **clone-and-diff**, which §A2 names as the primary check
and which costs one command and cannot itself go stale. The two `.jsx` sources are covered by the
Current/Prior build tables above.

⚠ **THE POOL IS 90 FILES, NOT 89, SINCE 2026-08-23** — and the way it grew is the finding.
`package_check_controls.sh` was **repo-only**; the ops package that rewrote it listed the file in its
DELETE-FIRST list, that delete was a no-op, and the upload ADDED it. The end state is correct — the
file is pooled, at the right hash, with a row — but the count moved without anyone deciding it
should. The two figures above were written the day before and are left as written, with this note,
because rewriting them would erase the evidence of how a number goes stale.

The cause is an asymmetry worth naming: `package_check`'s F-2 verifies that every `knowledge/` file
**replacing a pool file** is named for deletion. Nothing verifies the reverse — that every file
named for deletion **exists to be deleted**. So a delete-first list derived from what the PACKAGE
contains, rather than from what the POOL holds, silently adds files. That is the same shape as the
`E-1b` / `G-1` gap one level over, and it is not yet checked.

⚠ **Eight rows were added 2026-08-23** after a scripted audit found the table covered 52 of the
pool's 89 files (90 since 2026-08-23 — see below), ten of the gaps not being documents. Nothing had drifted at the time — the same
day's both-directions sweep found every pool file except the prior-leg source byte-identical to its
repo counterpart — so this closed a **latent** hole, not a live one. Counted by script, because a
row that was never written cannot be found by reading the table.

**Two mapping caveats.** The pool flattens repo paths: `tools_fixture.jsx` here is
`qa/tools/fixture/fixture.jsx` in the repo (byte-identical), and the baseline suites live under
`qa/qa-baseline/`. Match by content, not by filename position.


### ⚠ Added 2026-09-07 — Item C of `SCOPE_HOUSEKEEPING_THREE.md`, decisions D-3, D-4 and D-5

**The gap this closes.** Before this package **37 of the 111 pool files carried no md5 row**, so
§A2's offline fallback could not compare them at all — a stale `OPERATIONS.md` or `TESTING.md` in
the pool was **invisible by construction**. Not a wrong answer: *no* answer. That is why §A2 says
prefer the clone, and the clone is what has caught every instance.

⚠ **DERIVE THE COUNT, DO NOT READ IT (decision D-5).** The figure is true only on the date beside
it, and it had already gone stale **twice in five days** — recorded as *42* when it was 37, and
*107 files / 72 rows* when it was 110 / 73, both times moved by ordinary ops packages between the
writing and the reading. **37 as of 2026-09-07**; the command below is the authority, and it is
`package_check` K-8's own expression so it cannot drift away from the gate:

```bash
node --input-type=module -e '
import {readFileSync,readdirSync} from "fs"; import {join} from "path";
const POOL=process.argv[1];
const M=readFileSync(join(POOL,"PROJECT_KNOWLEDGE_INDEX.md"),"utf8");
const rows=[...M.matchAll(/^\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt|py))`?\s*\|\s*`?([0-9a-f]{32})`?\s*\|/gm)];
const hashed=new Set(rows.map(r=>r[1])); const pool=readdirSync(POOL);
console.log(pool.length,"files ·",hashed.size,"hashed rows ·",pool.filter(f=>!hashed.has(f)).length,"with no row");
' /mnt/project
```

**Rowed here (decision D-3) — the six documents whose staleness would actively mislead a session:**

| Pool file | md5 | Repo path |
|---|---|---|
| `OPERATIONS.md` | `438eb50d9a32823a26003d356bf9c429` | `docs/OPERATIONS.md` — **rolled 2026-09-09** at the run-folder ops package: §B gained the `mk_runfolder.sh` pointer, and §D gained **D1** (the named existence-only assertion class) and **D2** (the `t29` F-6a/F-6b defect pin). *(Previously `f33c2e0cfd…`.)* |
| `TESTING.md` | `4d92ed89071d99eae82161a377a66dff` | `TESTING.md` |
| `qa-baseline-README.md` | `9289a5b407061e76d94bc0c5812f8f71` | `qa/qa-baseline/README.md` — **rowed 2026-10-12** (ops, E-29 (c)): the pool flattens the path, so `package_check` E-1b resolves this name only through this cell. Pool copy verified byte-identical to the repo's before the row was written. |
| `METHODOLOGY.md` | `3793bad6971f0385a98a0539fe828578` | `METHODOLOGY.md` |
| `CHANGELOG.md` | `f1e18a0b84762eacca9237b4b1c4e5f2` | `CHANGELOG.md` |
| `MissingFeatures.md` | `2b1d178c7cdf633732fcf5e7f5c7ced7` | `docs/MissingFeatures.md` |
| `README.md` | `eec58396f932b3209de79c2400dbfb88` | `README.md` |

⚠ **NOT all 37, and this is a decision rather than an omission.** A row is a **maintenance
obligation, not a free check**: every release editing a listed file must rewrite its row, and **a
stale row is worse than no row** — it returns a false green rather than no answer. That is what
happened to `t8`, and again on 2026-09-07 when a package changed `package_check.mjs` and left its
row stale.

**Deliberately UNROWED, with reasons (D-3's second half). Say why, or the next session reads the**
**gap as an oversight and re-opens this:**

- ⚠ **`PROJECT_KNOWLEDGE_INDEX.md` — this file (decision D-4).** It **cannot** carry a row for
  itself: the hash would have to be computed before the row containing it is written, so it is
  wrong at the moment of writing, always. Stated rather than left as a conspicuous absence.
- ⚠ **`DangerClose-v5_64.jsx` and `DangerClose-v5_65.jsx` — the two app sources. D-3's
  recommendation named them; they are EXCLUDED on evidence found while building it.** The two build
  tables at the top of this file already carry `Source md5` for both, and `package_check` **K-4,
  K-5 and K-6** already assert those against the pool. A second row would be **a second copy of a
  fact the build tables own**, free to drift from it — this project's defining failure, and the
  reason §A2's `probe_classify` bullet was wrong in both directions for months. **Covered, not
  skipped.**
- **`dom_entry_v564.jsx` and `dom_entry_v565.jsx`** already had rows before this package.
- **The frozen `AUDIT_*`, `STATUS_*`, `FINDINGS-*`, `STOP-REPORT-*` and retired `SCOPE_*`
  documents.** History; nothing reads them for build state. Rowing ~20 of them buys twenty
  maintenance obligations for no protection. `STOP-REPORT-v5_63-fica-workbench.md` has never had
  one, and neither does `STOP-REPORT-v5_66-NM-note-guarded-set.md`.
- **The `controls_v*.sh` set.** Kept forever by §G's no-rotation rule and never edited after their
  release; a row on a file that never changes protects nothing.

⚠ **THE OBLIGATION THIS CREATES.** `CHANGELOG.md` changes in **every** package by definition and
`MissingFeatures.md` changes often, so **every future package touching them must roll their rows.**
Six new chances to ship a stale row. Accepted deliberately: K-8 reads the package's own
`knowledge/` copy first, so a rolled row is checked against the file actually shipping and a package
that forgets goes red **pre-ship** rather than after.

| Pool file | md5 | Repo path |
|---|---|---|
| `cap_tabs.mjs` | `9057b96d48b84f99dc322f7fc983674a` | `qa/qa-baseline/cap_tabs.mjs` |
| `capture_gain_fp.mjs` | `99f096c7c332b5ec7a87949681386a71` | `qa/capture_gain_fp.mjs` |
| `domdiff_withdrawal.mjs` | `544096d4428decd575ae1eb333ba8c0f` | `qa/domdiff_withdrawal.mjs` — **gated per leg 2026-08-21 at v5.42**, 31/1 → **32/0**. Its pre-v5.40 MAGI-sentence check had been left PAIR-SPECIFIC with a note to re-point that was never acted on, so it had been false for every prior leg from v5.40 onward and went red at the v5.41 → v5.42 pair **with no code change** — the §B2 gating rule, applied to a cross-build assertion instead of a disclosure. Previously re-pointed to v539 → v540 and IRMAA-anchor-fixed 2026-08-20 (was `f31c743b…`, three releases stale). Tooling — counted in no app total |
| `env_dom.mjs` | `0ee15a1be6099a50319cfb271b530c4a` | `qa/qa-baseline/env_dom.mjs` |
| `main.jsx` | `d9eca7b469a3fb7ec1c5325fd4bf8145` | `src/main.jsx` |
| `index.html` | `247816be583271d50cf13e0a02e18cdf` | `src/index.html` — the **Vite entry template**, **restored to the pool 2026-08-20** after being found absent (see the build-scaffold row below). ⚠ **Not the built app.** The published single-file `index.html` is repo-only output and never enters the pool; its md5 is in the Current build table and is different by construction |
| `probe_withhold_gain.mjs` | `b7fbc3fc34a0684c88b79123ddcda57c` | `qa/probe_withhold_gain.mjs` |
| `shim.txt` | `9938be3c873f73ef2afe3b115a11034d` | `qa/qa-baseline/shim.txt` |
| `dom_entry_v579.jsx` | — **un-pooled 2026-09-28, repo-only** (one dom entry in the pool from now on) | `qa/qa-baseline/dom_entry_v579.jsx` — **NEW at v5.79.** The DOM leg's entry shim for the current source. `dom_entry_v577.jsx`'s row was deleted in this same edit (rotation). |
| `dom_entry_v580.jsx` | — **un-pooled at v5.81, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v580.jsx` — **NEW at v5.80.** The DOM leg's entry shim for the current source. `dom_entry_v578.jsx`'s row was deleted in this same edit (rotation). |
| `dom_entry_v581.jsx` | — **un-pooled at v5.82, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v581.jsx` — **NEW at v5.81.** The DOM leg's entry shim for the current source; the pool holds ONE (J-4). |
| `dom_entry_v582.jsx` | — **un-pooled at v5.83, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v582.jsx` — **NEW at v5.82.** The DOM leg's entry shim for the current source; the pool holds ONE (J-4). |
| `dom_entry_v583.jsx` | — **un-pooled at v5.84, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v583.jsx` — **NEW at v5.83.** The DOM leg's entry shim for the current source; the pool holds ONE (J-4). |
| `dom_entry_v584.jsx` | — **un-pooled at v5.85, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v584.jsx` — **NEW at v5.84.** The DOM leg's entry shim for the current source; the pool holds ONE (J-4). |
| `dom_entry_v585.jsx` | — **un-pooled at v5.86, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v585.jsx` |
| `dom_entry_v586.jsx` | — **un-pooled at v5.87, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v586.jsx` |
| `dom_entry_v587.jsx` | — **un-pooled at v5.88, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v587.jsx` |
| `dom_entry_v588.jsx` | — **un-pooled at v5.89, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v588.jsx` |
| `dom_entry_v589.jsx` | — **un-pooled at v5.90, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v589.jsx` |
| `dom_entry_v590.jsx` | — **un-pooled at v5.91, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v590.jsx` |
| `dom_entry_v591.jsx` | — **un-pooled at v5.93, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v591.jsx` |
| `dom_entry_v593.jsx` | — **un-pooled at v5.94, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v593.jsx` |
| `dom_entry_v594.jsx` | — **un-pooled at v5.95, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v594.jsx` |
| `dom_entry_v595.jsx` | — **un-pooled at v5.96, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v595.jsx` |
| `dom_entry_v596.jsx` | — **un-pooled at v5.97, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v596.jsx` |
| `dom_entry_v597.jsx` | — **un-pooled at v5.98, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v597.jsx` |
| `dom_entry_v598.jsx` | — **un-pooled at v5.99, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v598.jsx` |
| `dom_entry_v599.jsx` | — **un-pooled at v6.00, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v599.jsx` |
| `dom_entry_v600.jsx` | — **un-pooled at v6.01, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v600.jsx` |
| `dom_entry_v601.jsx` | — **un-pooled at v6.02, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v601.jsx` |
| `dom_entry_v602.jsx` | — **un-pooled at v6.03, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v602.jsx` |
| `dom_entry_v603.jsx` | — **un-pooled at v6.04, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v603.jsx` |
| `dom_entry_v604.jsx` | — **un-pooled at v6.05, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v604.jsx` |
| `dom_entry_v605.jsx` | — **un-pooled at v6.06, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v605.jsx` |
| `dom_entry_v606.jsx` | — **un-pooled at v6.07, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v606.jsx` |
| `dom_entry_v607.jsx` | — **un-pooled at v6.08, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v607.jsx` |
| `dom_entry_v608.jsx` | — **un-pooled at v6.09, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v608.jsx` |
| `dom_entry_v609.jsx` | — **un-pooled at v6.10, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v609.jsx` |
| `dom_entry_v610.jsx` | — **un-pooled at v6.11, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v610.jsx` |
| `dom_entry_v611.jsx` | — **un-pooled at v6.12, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v611.jsx` |
| `dom_entry_v612.jsx` | — **un-pooled at v6.13, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v612.jsx` |
| `dom_entry_v613.jsx` | — **un-pooled at v6.14, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v613.jsx` |
| `dom_entry_v614.jsx` | — **un-pooled at v6.15, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v614.jsx` |
| `dom_entry_v615.jsx` | — **un-pooled at v6.16, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v615.jsx` |
| `dom_entry_v616.jsx` | — **un-pooled at v6.17, repo-only** (one dom entry in the pool) | `qa/qa-baseline/dom_entry_v616.jsx` |
| `dom_entry_v617.jsx` | `2946b7f30b90957f7a3042236b747405` | `qa/qa-baseline/dom_entry_v617.jsx` — **NEW at v6.17.** The DOM leg's entry shim for the current source; the pool holds ONE (J-4). |
| `smoke_built.mjs` | `bb7f02d87e40c1a0d0fbd2ad40462787` | `qa/smoke_built.mjs` |
| `t10_taxcases.mjs` | `b96a61d3e1c8ffc7494b06d15e3eaee9` | `qa/t10_taxcases.mjs` |
| `t11_survivor_rmd.mjs` | `8c3139c0f185de43293b12875f13d936` | `qa/t11_survivor_rmd.mjs` |
| `t12_engineD_survivor.mjs` | `70fb865322692e042d364ca85437cc51` | `qa/t12_engineD_survivor.mjs` |
| `t13_engineC_irmaa.mjs` | `b3f72baef75686afb2853c841aab9cbb` | `qa/t13_engineC_irmaa.mjs` |
| `t14_cross_engine_survivor.mjs` | `050ac26c290af2d5af7055d9833c1eee` | `qa/t14_cross_engine_survivor.mjs` |
| `t15_engineA_death_filing.mjs` | `3fb4c83fd888ac6cad0ab0d57b8dba6b` | `qa/t15_engineA_death_filing.mjs` |
| `t16_roth_ladder_filing.mjs` | `cd5eaba43994e4580fd9e62ff5b69d4e` | `qa/t16_roth_ladder_filing.mjs` |
| `t17_engineC_exact.mjs` | `5eef71d2385058d847cc53018a3fae67` | `qa/t17_engineC_exact.mjs` |
| `t18_engineB_exact.mjs` | `7272f97181e0764204eef087f3810380` | `qa/t18_engineB_exact.mjs` |
| `t19_engineD_exact.mjs` | `684a66e697713d8fda08d47d770477d3` | `qa/t19_engineD_exact.mjs` |
| `t1_units.mjs` | `edb05096fceecc2502642dacbee42c3f` | `qa/qa-baseline/t1_units.mjs` — **rolled 2026-08-21 at v5.42** (+4 `STRUCT S-3` checks pinning the §86 upper tier as a phase-in, gated per leg so pre-v5.42 legs keep a dated `[KNOWN DEFECT]` pin asserting the cliff; plus `v542` registered across **five** nested ladders, `KNOWN_VERSIONS`, the `verStr` ladder and the `V540`/`V541` gates). **121 checks on v542, 117 on v541.** Previously **rolled 2026-08-20 at v5.41** (+5 `STRUCT S-2` checks pinning the ROTH TAB's `magi` term set by AST, gated per leg, plus `v541` registration). S-1 pinned Engine C's term set and left the Roth tab's unpinned — that gap is why the omitted-RMD defect survived. **115 checks on v541, 110 on v540, 94 on v539** |
| `t20_other_taxtype.mjs` | `cdfd16f92bb92d4b9df6841a51a7be7e` | `qa/t20_other_taxtype.mjs` |
| `t21_tools.mjs` | `a9d4e31e4cd4870e5dfac34302c7fed3` | `qa/t21_tools.mjs` — Section F is a **pin and a disclosure guard, NOT coverage of `census_p1.cjs`**, and says so in its own header: the fixture answers zero to all fifteen of that tool's questions and a sabotaged copy produces byte-identical output. Controlled by `qa/tools/controls_t21_censusp1.sh`, 6 fired / 0 silent |
| `t22_aca_floor.mjs` | `e8b52e06c38a095ac6eea830ac2dd84d` | `qa/t22_aca_floor.mjs` |
| `t23_roth_ladder_rmd.mjs` | `7dc1339d44a58939a32b34461fce0912` | `qa/t23_roth_ladder_rmd.mjs` — **NEW at v5.41.** The Roth ladder's RMD-term invariants. ⚠ **Split precision, by necessity (OPERATIONS §M):** the ladder is a COMPONENT-INLINE engine, so MAGI reads from the DOM at `Math.round(x/1000)` — **±$500** — while the RMD cards render full dollars and ARE pinned exactly ($44,991). Gated per leg: **25 checks on v542 AND on v541 — identical, and that is the point**: its pins sit at the $70,000 conversion default, where v5.42's §86 fix correctly moves nothing, so an unchanged t23 is the evidence that release did not overreach. Only the version registry and `POST_FIX` were touched at v5.42; **no assertion changed**. 21 on v540, that leg asserting the PRE-FIX figures deliberately so the legs are the before/after witness |
| `t24_ss86_phasein.mjs` | `546c759101f232845cf88b8cf3725c1d` | `qa/t24_ss86_phasein.mjs` — **NEW at v5.42.** The §86 upper-tier phase-in invariants. ⚠ **This suite DRIVES THE CONVERSION SLIDER** and must, because the defect it pins is worth $0 at the $70,000 default — assertions at the default prove nothing about it. The control is a **React controlled input**, so `.value` assignment is swallowed; it goes through the native `HTMLInputElement` prototype setter followed by an `input` event. Asserts all 12 ladder years at **$15,000 / $20,000 / $30,000 / $50,000 / $70,000** against `statute86`, computed rather than hardcoded. Gated per leg: **38 checks on v542, 34 on v541**, the v541 leg asserting the pre-fix cliff figures — which also proves the suite's ladder transcription is faithful. Precision **±$500** (§M); the effect is $4,200–$38,030. ⚠ **§D rewritten at v5.77:** from v5.45 to v5.76 it pinned the middle-tier defect against a transcription of pre-v5.45 code, so it tested nothing the app ran; it now tests the shared `taxableSS86` directly, gated on the version (34 on v5.76, 40 on v5.77) |
| `t25_engineC_ss86.mjs` | `1dd1acba4dbbd38147846ae98a8fc37f` | `qa/t25_engineC_ss86.mjs` — **NEW at v5.43.** Engine C's §86. ⚠ **DOLLAR-EXACT, unlike `t24`** — `computeIrmaaPlan` is module-level and exported through the shim, so rows are read directly and OPERATIONS §M's ±$500 render ceiling does NOT apply. Pins the three corrected years to the dollar on both legs, the twelve unchanged years as unchanged, and the **zero tier / zero surcharge** result deliberately, so the absence of a surcharge effect is a checked fact. Gated per leg: **29 on v543, 26 on v542** |
| `t26_noconv_span.mjs` | `b4d23cf74e218924e5348db310a1eb81` | `qa/t26_noconv_span.mjs` — **NEW at v5.44.** The no-conversion RMD counterfactual's growth span. **Dollar-exact on BOTH sides** — inputs come from the shim, and the RMD cards render whole dollars, so §M's ±$500 ceiling applies to neither half. ⚠ **Derives its expectation from the household's own dates rather than hardcoding the percentage**, because the defect's size is (ladderStart − asOfYear) years of growth and both dates move; today's figures are pinned separately. Gated per leg: **20 on v544, 18 on v543**. Carries the item-6 `[KNOWN DEFECT]` pin at §D-3 |
| `t27_half_cap.mjs` | `265bb7ff5f38b3328aa52c22fd03829d` | `qa/t27_half_cap.mjs` — **NEW at v5.45.** §86(a)(1)'s ½-benefits cap, in the two mirror-image places that dropped it. ⚠ **REQUIRES A FIXTURE** (~$7,000 of benefits, installed via `applyLoadedData` — a WRAPPER, §C): **neither defect is reachable from the example household**, whose benefits are far above the $12,000 band. Item 4 is asserted **dollar-exact through `computeTaxPlan`**; item 7's band is unreachable from any rendered ladder, so its arithmetic is checked against transcriptions with `t1` STRUCT S-6 carrying the structural pin — §F documents that split. Also pins the **continuity at the adjusted base amount**, the check that would catch a half-done release. Gated per leg: **18 on v545, 14 on v544** |
| `t28_ssB_claim_gate.mjs` | `948569e8f9d266fcffe226c3ff3ca2a8` | `qa/t28_ssB_claim_gate.mjs` — **NEW at v5.46.** The Roth ladder's spouse-B claim gate. ⚠ **REQUIRES TWO FIXTURES, and the second is not optional**: the first (B delays to 70, January claim) exercises the seven pre-claim years, but with a January claim a pro-rata gate and a whole-year gate are indistinguishable, so the release's actual modelling decision would ship unverified. The second moves B's claim to July and asserts all three candidate behaviours **by name** — pro-rata $119,935, whole-year $131,410, claim-year-dropped $108,460. The single-filer gate is asserted as a **difference** (a single filer's ladder must not change when a stale spouse-B benefit is stored), which needs no transcription of the single-filer recursion. **$0 on the example household** — B claims in January of the ladder's first year — so its §A pins exist to prove the fix did NOT reach that household. Precision ±$500 (§M); effects are $11,475–$22,950. Gated per leg: **34 on v546, 32 on v545** |
| `t29_boundaries.mjs` | `b57a41d2303f5c67f3744f6d99120097` | `qa/t29_boundaries.mjs` — **NEW 2026-08-23.** Covers the boundary census (OPERATIONS §K1). **TOOLING — counted in no app total** (§B1). Drives one purpose-built household per boundary so a row that fails to move is unambiguous, asserts both directions (clear→ON as well as ON→clear), and pins the two rows that actually hid shipped defects — v5.45's ½-cap band and v5.46's January claim. **Negative-controlled four ways**: forcing every verdict ON, hardcoding the ½-cap band, comparing the claim gate against the wrong year, and inverting the DOB-month test each fire. 43 checks |
| `t30_legible.mjs` | `cfeef9e96bf4f2ce0770c333c96f3c2a` | `qa/t30_legible.mjs` — **NEW at v5.48.** The declared type floor (12px body / 11px label) and the fixed-grid width guard. ⚠ Asserts what is DECLARED; jsdom does no layout, so it says nothing about how the app LOOKS |
| `t31_disclosure_parity.mjs` | `cdbccbcc3964839184203021ef12afbd` | `qa/t31_disclosure_parity.mjs` — **NEW at v5.49.** Cross-surface disclosure parity: if `METHODOLOGY.md` names a limitation, the render tree or the **raw** Field Manual must name it too. **The first suite in the project to read `METHODOLOGY.md`** — every mention of that filename across t1–t30 is a code comment, which is why the two surfaces could disagree forever and stay green. **14 checks on v5.49, 11 on v5.48** (the frozen leg PINS the pre-fix gap). Key set deliberately **two**: `SSA-44`, `work stoppage`. ⚠ **Needs `METHODOLOGY.md` at the run-folder root** — a harness input no earlier suite required; it exits loudly rather than skipping. ⚠ Matching is **case-insensitive** (the manual opens a sentence with "Work stoppage", the tab says "work stoppage") but contiguity and freedom from internal markup stay **strict** — a phrase split by a tag names nothing a reader can search for. ⚠ Asserts a string appears on both surfaces; says NOTHING about whether they agree or whether the wording is accurate |
| `t32_ladder_dividend.mjs` | `a8b88b7edda3c4858aaf1e3feed2200b` | `qa/t32_ladder_dividend.mjs` — **NEW at v5.53.** The Roth ladder's IRMAA MAGI carries the taxable sleeve's dividends. ⚠ **This is the ONLY suite that witnesses the v5.53 release.** The DOM diff is blind to the Roth tab and the moved term sits below its ±$500 render ceiling on the example household, so a runner stopping at `t31` reports that release green having executed nothing that can see it — which is why `runsuite.sh` was extended in the same release. 11 checks on v5.52 (the frozen leg PINS the pre-fix state), 12 on v5.53 |
| `t34_income_conditioning.mjs` | `cfaf6bd54dfb9b446321973e4bca5f3f` | `qa/t34_income_conditioning.mjs` — **NEW at v5.64.** The income-conditioning measure and the `bands`/`taper` evaluator. **59 checks, current leg ONLY** — it tests machinery no earlier build has, and its `KNOWN_VERSIONS` guard refuses any other tag. ⚠ **§A asserts that NO `STATE_RULES` entry carries `exclTest`**, which is what makes v5.64's no-output-change claim tested rather than stated; that section is expected to CHANGE when the first state is populated. ⚠ **Its statutory cases drive a SYNTHETIC jurisdiction** injected into the live rules object and removed per case, because there is no populated state to drive and there must not be one — the tables come from `FINDINGS-v5_63-state-statutes.md`. ⚠ **Its `exclGranted` helper originally subtracted nothing from the returned tax and read the exclusion as negative** the moment a case passed `work` or `capGains`; four §G checks caught it and the TEST was repaired, not the expectation |
| `t35_state_populate.mjs` | `1b37d90e3665e29a5ecab61923e7bb3d` | `qa/t35_state_populate.mjs` — **NEW at v5.65.** Connecticut's populated table: hand-computed cells, the boundary pins AT all nine thresholds in both filing columns, the `excl65`-equals-table-at-zero invariant, the note-vs-code disclosure locks, and cross-engine parity. **82 checks on the v564 leg, 92 on v565 — it runs on BOTH by design**, because the prior leg's pre-populate figures are what show that anything moved. ⚠ Its `KNOWN_VERSIONS` refuses any tag before v564. ⚠ Its §D-7 pins the still-unconverted set at NM, NJ, RI, VA and **must be lowered by one as each converts**. ⚠ Its §D-2 recognises a negation within ~40 characters of "dividend" and no other phrasing |
| `t36_ai_route.mjs` | `391b7747cfcc54af40f6108b8f11d943` | `qa/t36_ai_route.mjs` — **NEW at v5.70.** Ask AI's routes on a self-hosted origin (B-3): the extinction invariant with a v569 pre-fix pin, and the saved-key, Local Model, claude.ai (child process) and offline controls. Runs on BOTH legs. Negative controls: `controls_v570_b3.sh` |
| `t37_mydata_draft.mjs` | `1a868a1e9b375bfaa8c2fb4630b0bc1f` | `qa/t37_mydata_draft.mjs` — **NEW at v5.71.** The My Data draft autosave and the imported `masterPrompt` guard (`SCOPE_A3_DRAFT_AUTOSAVE`: A-3, A-6). Runs on BOTH legs — 26 on v5.70 **pinning the defect** (the autosave had never saved: the draft code called `getItem`/`setItem`/`removeItem`, which the storage contract does not have), 43 on v5.71. Its `WP` group is the release's **extinction invariant** — after Clear All Data the draft key is gone, driven through the real button, so a "permanently deleted" plan cannot return from the restore banner. Controlled by `qa/tools/controls_v571_draft.sh`, 7/7 |
| `t38_import_hardening.mjs` | `85047f330142f4460d9b30fd45936032` | `qa/t38_import_hardening.mjs` — **NEW at v5.72.** Import hardening on both legs (83 on v5.71, 206 on v5.72); group M is the extinction invariant. See `TESTING.md` |
| `t39_me_mt.mjs` | `debf642dd567c7a88cf5c3db5b1d19e5` | `qa/t39_me_mt.mjs` — **NEW at v5.73.** Maine phaseout and Montana corrections on both legs (13 on v5.72, 22 on v5.73), every cell hand-computed; M-7 is the ordering cell |
| `t40_cross_tab_agreement.mjs` | `ef826a6e1c2970aee3ccc034f44cabea` | `qa/t40_cross_tab_agreement.mjs` — **NEW at v5.74.** Cross-tab agreement on both legs (27 on v5.73, 34 on v5.74): the draw agrees to the cent across Engines B, C and D; D-9's RMD gap pinned as a known divergence; the gap years against an independent Rev. Proc. 2025-32 / §86 oracle; **D** — the Taxes detail panel itemizes every term of Gross taxable (term set derived by AST); **E** — the headline on the as-is and first-open views, E0 tied to the source's defaults |
| `t41_survivor_age_gains.mjs` | `add8061f625fd425da9a3c275a5311af` | `qa/t41_survivor_age_gains.mjs` — **NEW at v5.75.** The survivor's age deductions (C-3) and the unused deduction against preferential income (C-6); both legs, the v5.74 leg pinning both as dated known defects. Its per-case `amt == 0` line is the phantom-AMT guard. |
| `t42_single_spouse_b_ss.mjs` | `938561095671596c5c96b8b2ba5d9924` | `qa/t42_single_spouse_b_ss.mjs` — **NEW at v5.76.** A single household is not paid spouse B's Social Security (C-7); both legs, the v5.75 leg pinning the defect. Compares every figure to the zeroed-benefit case to the dollar; the `X-1` sweep catches reads that bypass `getSSB()`; `M-0` asserts the seeded Monte Carlo harness is deterministic before any MC line counts. |
| `t43_ss86_one_rule.mjs` | `bf2d05f0da2f430cefdef40bab009e65` | `qa/t43_ss86_one_rule.mjs` — **NEW at v5.77.** One §86 rule for every engine (C-4, C-12); both legs, the v5.76 leg pinning both defects and the four private copies. The helper against two independent oracles (worksheet and statute) on 950 cells crossing every border; Engines A, B and C against the worksheet on one grid, plus 70 cells placed inside the narrow line-14 region for Engine A; the IRMAA consequence; the example household made single (§F); and a parser check (`census.cjs`) that no function but the helper reads the §86 thresholds. Takes an optional module path for its controls. |
| `t44_irmaa_top_tier.mjs` | `34b653164c2e0ac12ab5090016c17c3f` | `qa/t44_irmaa_top_tier.mjs` — **NEW at v5.78.** The IRMAA top tier (C-1), both legs. The shared `irmaaTierFor` against the statute at ±$1, ±1¢ and exactly on every threshold; every engine placed **bit-for-bit** on the top threshold (a search, because some thresholds cannot be reproduced from a monthly figure — a naive joint case lands a hair off and would pass on the broken build); lower edges unmoved; D-1's headroom; the `≥` label (DOM and source); and an AST check that no other function compares a MAGI against a threshold. |
| `t45_phone_layout.py` | `e964bb03f04b83922a0a32f02203cba3` | `qa/t45_phone_layout.py` — **NEW at v5.79. The first PYTHON suite and the first in a real browser** (Playwright + Chromium): every tab of the BUILT page at 390, 820 and 1440 px must not scroll sideways, after dismissing the disclaimer gate the only way that releases its scroll lock (asserted). Current leg only (it needs the run folder's built page). **Fails, never skips**, if no browser launches or the page's footer names another version. Its output says "passed" once, on the last line, because `tally` sums every occurrence. |
| `t46_scenario_default.mjs` | `ca306ca1058249c86931ef425cff51be` | `qa/t46_scenario_default.mjs` — **NEW at v5.80.** Both legs: the v5.79 leg pins BASE on every visit with nothing stored; the current leg asserts a first visit on BULL-LEANING (the header chip AND the Monte Carlo's regime weights), a saved choice restored in a new session — HISTORICAL, neither default, because restoring BASE passed on the old code with no restore at all — an unknown stored value falling back, and the non-default notice naming the default. Storage lives in jsdom's localStorage so it survives a remount. |
| `t47_phone_first_screen.py` | `838cd619bf58b4d3b5734cab2fae186b` | `qa/t47_phone_first_screen.py` — **NEW at v5.81.** A phone's first screen (F-12), Chromium, the built page, current leg only: at 390 the grid has no box, the menu lists every visible tab (26, or 6 in Simple Mode) and switches; the summary starts collapsed with date and success rate, opens and closes; content begins on the first screen; **the unsaved-My-Data guard fires through the menu**; at 820/1440 nothing phone-only has a box. Structure: ONE tab list (the complete list, not a prefix — `SIMPLE_TABS` shares one), ONE guarded `selectTab`. |
| `t48_legibility_targets.py` | `062bf9840ac93ef220146d29e5f40eca` | `qa/t48_legibility_targets.py` — **NEW at v5.82.** Legible text and usable targets (F-3/F-4), Chromium, the built page, current leg only, all 13 skins, ~10 minutes: source invariants by AST (type floor, no line-token text fill, no hex colour outside SKINS, no hex alpha glued on); every skin's faint/dim tokens; rendered text ≥ 11 px everywhere and AA in every dark skin, light skins at or under KNOWN DEFECT pins; controls ≥ 24 px; five phone-critical controls 44 px; no clipped grid cell. |
| `t49_engineA_draw.mjs` | `51a9bf90a7e33dd207a42d5cf660e57a` | `qa/t49_engineA_draw.mjs` — **NEW at v5.84.** Engine A sees the spending draw (D-7): hand-verified bracket arithmetic against IRS Rev. Proc. 2025-32 (t10's neutralised household), inertness on 11 households, the draw taxed and NOT drained (K-1), AST checks on all four callers and the solver's dependencies. Current leg only. |
| `t50_ss_states.mjs` | `6a0ecf5927949801b0ed176aa9ea07fe` | `qa/t50_ss_states.mjs` — **NEW at v5.85.** The seven SS states follow their own law (D-19): 32 statute-typed cases at every threshold and inside every phase-out (MN's steps, VT's proportion, UT's 2.5 cents), CO's age rule and shared pension cap, RI's age test per spouse, CT's 25 % cap, Utah's 4.45 % rate; no fractional ss factor survives. Current leg only. |
| `t51_state_figure_years.mjs` | `6573665f6cb4b1ca80b2f1b002437f85` | `qa/t51_state_figure_years.mjs` — **NEW at v5.86.** State dollar figures carry their tax year (D-18): every §1a/§1b figure typed from its primary source, the extinction check (no dollar figure without a year, none ahead of 2026, no stale or stray key, no year on a rate), Maine/Louisiana/New Jersey fixture households dollar-exact by hand, and the My Data line through the DOM. Current leg only. |
| `t52_age_start_notes.mjs` | `315080df9c58bb1ed71ea8731c63acc3` | `qa/t52_age_start_notes.mjs` — **NEW at v5.87.** A state note names only the age the model applies, or carries a true "applied here …" disclosure (D-23): six notes typed from primary sources, the model's behaviour behind each dollar-exact, the extinction over all 51 rows, My Data through the DOM. Current leg (v586 registered only to reproduce the pre-fix failure). |
| `t53_mydata_summary_age.mjs` | `dd34443e12efd49441004c527fd63af5` | `qa/t53_mydata_summary_age.mjs` — **NEW at v5.88.** My Data's summary names the age the engine applies and the exact figure (D-25): all 18 exclusion rows through the DOM against the engine's measured onset. Current leg (v587 registered only to reproduce the pre-fix failure). |
| `t54_wv_senior_modification.mjs` | `9849ff47d978b9099ef40e929e699234` | `qa/t54_wv_senior_modification.mjs` — **NEW at v5.89.** West Virginia's $8,000 senior modification reduced by the person's taxable SS (D-21): hand-computed households, MD/ME by hand, an extinction grid, the note. Current leg (v588 registered only to reproduce the pre-fix failure). |
| `t55_retexempt_age.mjs` | `7d5332fa081c4cc436c901bb4d7111f7` | `qa/t55_retexempt_age.mjs` — **NEW at v5.90.** The law's age gates on IA/PA/MS's exemptions and Michigan's cap (D-24): hand-computed cases per state, the both-spouses rule, pensions vs withdrawals, the count-only path, an extinction grid. Current leg (v589 registered only to reproduce the pre-fix failure). |
| `t56_plan_type_collect.mjs` | `ffaaedfc3a3ec8f222da77c79e5acdb2` | `qa/t56_plan_type_collect.mjs` — **NEW at v5.91.** Plan type and pension owner collected, not read (D-12 Phase 1): migration, the saved-data round-trip (save 1 ≡ save 2), and group F — no figure depends on either field until v5.93. Both legs. |
| `t57_attribution_carry.mjs` | `7805c65acf0a856a12e6ce23c02303b5` | `qa/t57_attribution_carry.mjs` — **NEW at v5.93.** Per-person retirement income carried to the state calculator, not read (D-12 Phase 2): `attributeRetIncome` unit + identity grid, the employer share hand-computed, a runtime recorder on all three call sites, the death rescale in both engines, AST guards (D3 is a Phase-2 guard Phase 3 replaces). Current leg only. |
| `t58_state_draw.mjs` | `d2f1c738898f759bb21ee98ee664d256` | `qa/t58_state_draw.mjs` — **NEW at v5.94.** The spending draw reaches the state calculator (D-26): Engine A extinction grid (draw = pension, every jurisdiction), Engine B hand-computed in NC/CA/GA/NY, a v5.93 → v5.94 comparison (v594 leg only), AST extinction, the Field Manual line. Both legs; the v593 leg pins the defect. |
| `t59_per_person_state.mjs` | `8e426f8529a5e52eaa59d849cef85a15` | `qa/t59_per_person_state.mjs` — **NEW at v5.95.** D-12 Phase 3: per-person, per-plan-type state rules (RI, IA, PA, MS, WV) and the survivor slot, to the dollar; without `byPerson` every jurisdiction prices as v5.94. Both legs; the v594 leg pins the old figures. |
| `t60_engineA_survivor_state.mjs` | `935fe63d89cb81f81dff75d60108af05` | `qa/t60_engineA_survivor_state.mjs` — **NEW at v5.96.** D-27: Engine A files the survivor's state return single — a runtime recorder on its state calls, GA/ME/MI hand cases to the cent, a v5.95 → v5.96 comparison (v596 leg), AST extinction, the Field Manual line. Both legs; the v595 leg pins the defect. |
| `t61_ga_ok_rates.mjs` | `2a8fea71aa3b302ff879bdb5cc385793` | `qa/t61_ga_ok_rates.mjs` — **NEW at v5.97.** D-22 (two of 42): Georgia 4.99 % and Oklahoma 4.5 % from TY2026 — the rates and notes, an extinction guard that a note stating a rate for a year states the row's own rate, hand cases to the cent, a v5.96 → v5.97 comparison (v597 leg). Both legs; the v596 leg pins the old rates. |
| `t62_desktop_disclosures.mjs` | `d9cf04122baf847146e79a0c6e825de8` | `qa/t62_desktop_disclosures.mjs` — **NEW at v5.98.** F-5/F-7/F-9: the Field Manual §13 sentence, each clause held to the code fact that keeps it true (a lock that goes red when a behaviour is fixed); F-16: the glossary in case-insensitive order (extinction). Both legs; the v597 leg pins the absence. |
| `t63_flat_rates.mjs` | `998bd698073292145886c379c8f6682f` | `qa/t63_flat_rates.mjs` — **NEW at v5.99.** D-22 batch 1: the thirteen flat-rate states' TY2026 rates and notes, hand cases for ID/IN/OH to the cent, Ohio's top-rate overstatement from the statute's formula, a v5.98 → v5.99 comparison (v599 leg). Both legs; the v598 leg pins the old rates. |
| `t64_state_brackets.mjs` | `e6ec2835c8a2ed1ab8441a3965d48f4a` | `qa/t64_state_brackets.mjs` — **NEW at v6.00.** D-22 option 3, batch 1: ten states' bracket schedules against their sources and the states' printed tables, New York's recapture, hand cases to the cent, v5.99 → v6.00 moves only the ten, the display and the Field Manual held to the code. Both legs. |
| `t65_state_brackets_b2.mjs` | `64103f34f61d72f075287d565e62de13` | `qa/t65_state_brackets_b2.mjs` — **NEW at v6.01.** D-22 option 3, batch 2: the seventeen remaining progressive states' schedules and their added rules (AR, CT, MD, ME, HI, RI) against their sources and printed tables, hand cases to the cent, the D-22 extinction, v6.00 → v6.01 moves only the seventeen, the display and the Field Manual held to the code. Both legs. |
| `t66_deductions_askai.mjs` | `15cf4f502b346ce7a5029ad5696f7f7c` | `qa/t66_deductions_askai.mjs` — **NEW at v6.02.** D-30 batch 1: the 27 progressive states' deductions, exemptions and personal credits against their sources, dated and well formed; the phase shapes at their edges; hand cases to the cent; v6.01 → v6.02 against `d30_ref.mjs`; Ask AI's cap, cut-off notice and timeout through the DOM; the display and the Field Manual held to the code. Both legs. |
| `t67_deductions_flat.mjs` | `2242bd4f0f31da690478c8fd70c64535` | `qa/t67_deductions_flat.mjs` — **NEW at v6.03.** D-30 batch 2: the fourteen flat-rate states' deductions, exemptions and personal credits against their sources, dated and well formed (Pennsylvania none); Idaho's zero band and Ohio's 2026 schedule; the edges; hand cases to the cent; v6.02 → v6.03 against `d30_ref.mjs` (D30F); the display and the Field Manual held to the code. Both legs. |
| `t68_fed_deductions.mjs` | `c967ea03ba3958818c440a229b47cca1` | `qa/t68_fed_deductions.mjs` — **NEW at v6.04.** D-31 and D-29: Alabama's, Missouri's and Oregon's deduction of federal income tax, the federal senior deduction in the six states whose returns carry it, Missouri's capital-gains subtraction — the components against their sources, the edges, hand cases to the cent, v6.03 → v6.04 against `d30_ref.mjs`, Engine B against the calculator and its federal bonus, the three call sites by AST, the Field Manual. Both legs. |
| `t69_annuity_relief.mjs` | `64bad5e1ff71c80b2e3cce7dc61b07ba` | `qa/t69_annuity_relief.mjs` — **NEW at v6.06.** D-28 widened: a commercial annuity gets no retirement relief in the thirteen states whose law gives it none, and Maryland's exclusion no IRA money — Pennsylvania hand cases, v6.05 → v6.06 over every jurisdiction against the v6.05 calculator, the classification of the 25 relief states, notes and Field Manual derived from the table, the call sites by AST. Both legs. |
| `t70_annuity_conversion.mjs` | `a4f93722fcec640711ab2825db19bc3a` | `qa/t70_annuity_conversion.mjs` — **NEW at v6.07.** D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money — the attribution, all-annuity extinctions in Engines A, B and C, Engines B/C and A against independent recursions (the v6.06 rule reproduced on the prior leg), v6.06 → v6.07 bit-identical for annuity-free runs, the Roth tab's cards and ladder table against an independent ladder recursion, the expressions by source text. Both legs. |
| `t71_engine_d_other_ira.mjs` | `bbbf93852d0da094b61d0007d1c5cdc1` | `qa/t71_engine_d_other_ira.mjs` — **NEW at v6.08.** D-34: Engine D converts a Traditional IRA entered under Other accounts (bucket money first, never annuity money), figures the cap after the year's draws, grows that IRA's RMD tracker and takes its RMD whole — an independent oracle reproducing each leg to the cent under its own rules (and missing the other's), extinction invariants over six households × four sliders, dollar-exact pins that flip, v6.07 → v6.08 bit-identity for the households that must not move, the Withdrawal tab in the DOM. Both legs. |
| `t72_engine_d_other_roth.mjs` | `b2e4736c609eae1129f3181941bbf77e` | `qa/t72_engine_d_other_roth.mjs` — **NEW at v6.09.** D-35: a Roth IRA entered under Other accounts is counted once in Engine D, as Roth money — its brokerage twin (identical buckets, RMD and pool), no gain on Roth money, t71's oracle extended to hold Roth out (each leg to the cent under its own rules), v6.08 → v6.09 bit-identity for households without one, the Withdrawal tab's two cards. Both legs. |
| `t73_peer_benchmarks.mjs` | `a665c7acc6b0fcb3c54010bad3c052bc` | `qa/t73_peer_benchmarks.mjs` — **NEW at v6.10.** The Ranking tab's peer benchmarks: one module-level table on the 2025 SCF, its values against `peer_scf.py`'s output and the Empower and SSA publications; no table figure typed anywhere else (AST); every tier cut-off priced from both sides on the rendered tab; the vintage copy, the Social Security relabel and the Field Manual; the refresh alarm — from v6.15 its ABSENCE (§E, `NOPEER`: the alarm left the Events tab). Both legs. |
| `t74_ranking_headline.mjs` | `e49fce3416301f2959a7668ae885d41f` | `qa/t74_ranking_headline.mjs` — **NEW at v6.11.** F-19r: the Ranking tab's headline is the net-worth band and nothing else (AST: six rows, every assigned "TOP N%" is the net-worth band or Portfolio Size's tier, no average over the rows); every net-worth cut-off priced from both sides on the headline and the row; the portfolio floor; no verdict or unmeasured claim for a 2nd-percentile household; one national percentile; the Field Manual. ⚠ It **re-runs the Monte Carlo** after each household change and its B-1 is a setup check that it did (OPERATIONS §C). Both legs. |
| `t75_engine_d_ss86.mjs` | `364d5101159dba2acd83d3585301bb4f` | `qa/t75_engine_d_ss86.mjs` — **NEW at v6.12.** C-5: the Withdrawal tab's Bracket column taxes Social Security by the §86 worksheet, on the year's filing status (Single from the year after the first death), on the indexed table with the age-65 extra, rate on ordinary income. An independent oracle (its own worksheet and Rev. Proc. 2025-32 tables) every year on ten households, each leg reproduced by its own rule set and not the other's; hand-verified pins; v6.11 → v6.12 bit-identity of everything but `magi`, `bracket`, `ssTaxable`, the bridge and Engines B/C; no `× 0.85` product outside `taxableSS86` (AST); the rendered tabs, read through `window.__g` behind a setup check (OPERATIONS §C). Both legs. |
| `t76_crossover_label.mjs` | `06f9a1019283a523dfe6e6f42ebe01da` | `qa/t76_crossover_label.mjs` — **NEW at v6.13.** C-11: the break-even card, the Field Manual and METHODOLOGY name the face-value measure — "after-tax wealth" extinct in every string, template and JSX text (AST); the §63(f) blind amount disclosed; a guard for `t31`'s "Roth break-even" control. C-9's extinction in Engines A, B and C (an annuity changes no RMD and no tax when nothing draws on the pool; both legs). v6.12 → v6.13 moved text only (the ASTs equal with text masked, and differ unmasked in exactly four texts). The rendered card through `window.__g`, including the recovered outcome on a both-to-100 household, and the §K1 `crossover` row held to the rendered card. Both legs. |
| `t77_payroll_tax.mjs` | `6dfc531b173fea83a66351e233edcb15` | `qa/t77_payroll_tax.mjs` — **NEW at v6.14.** D-17 and C-14: payroll tax on job income follows 26 U.S.C. §3101/§3121 — Social Security per earner up to the wage base, Medicare uncapped, the 0.9% Additional Medicare Tax above $200,000 / $250,000 (unindexed). An oracle with its own rates and per-person attribution reproduces Engine B's FICA to the cent every year on nine households, each leg by its own rule; by AST `payrollTax` is called at exactly the three sites and no payroll literal survives outside `TAX_CONSTS`; across v6.13 → v6.14 Engines C and D are bit-identical and Engine A moves by Engine B's amount; the hand pin; the copy and the rendered Taxes tab through `window.__g`. Both legs. |
| `t78_events_user_facing.mjs` | `7e21ab852b8ad65351e8d3687f237a68` | `qa/t78_events_user_facing.mjs` — **NEW at v6.15.** The Events tab speaks to users only: the tax card is a NOTICE the app-wide strip ignores (`alertStripEvents`), so a maintainer's alarm can no longer hide the user's own January items; the backtest and peer chores are gone; no Google Drive in the source's text (AST) or the built page; no "survives the swap" promise; what did not move across v6.14 → v6.15 on 72 dates; the strip rendered in a child process with the clock at 2027-01-05; the Field Manual's event count tied to the real count. Both legs; the v6.14 leg pins its defects. |
| `t79_self_employment.mjs` | `44c6019e572c3004ef6b1da991ba2c7e` | `qa/t79_self_employment.mjs` — **NEW at v6.16.** D-36 — a self-employed job row pays self-employment tax: an oracle typed from §1401/§1402 reproduces Engine B to the cent on thirteen households (a joint-owned row; a survivor crossing to Single); by AST three `payrollTax` sites, no 0.124/0.029/0.153/0.9235 literal, the $400 floor read from `SE_MIN_NET`; Engines C and D, the bridge and both Monte Carlo engines bit-identical v6.15 → v6.16; five hand pins; the input saved, exported and imported (rendered); the copy. Both legs; the v6.15 leg pins its rule. |
| `t80_home_move_cash.mjs` | `7474c52dd99bf58bd255c07bbae08919` | `qa/t80_home_move_cash.mjs` — **NEW at v6.17.** D-38 — the cash from a home move is a My Data field, not the fixed $130,000 every plan carried: against oracle modules built at test time from the v6.16 source with the constant set to X, the field reproduces both Monte Carlo engines and the mortgage what-if bit for bit; by AST the constant is gone and the accessor is read at the five model sites only; Engines A–D and the bridge never see it; the planned-path hand pin; the field rendered, saved, exported, imported; an old plan reads $0 with a notice; the copy. Both legs; the v6.16 leg pins the constant. |
| `d30_ref.mjs` | `adbe9acb190dd813756e74e62b739d59` | `qa/d30_ref.mjs` — **NEW at v6.02.** An independent implementation of D-30 batch 1 (one function per state, not the app's data shape), imported by `t66` and by the derived pins of fourteen suites (DD-14). Pooled with them: a suite read from the pool needs it to run. |
| `controls_v573_me_mt.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v573_me_mt.py` — **NEW at v5.73.** Four reversions, one per change. Python, no shebang |
| `controls_v574_c8.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v574_c8.py` — **NEW at v5.74.** Nine mutants against `t40`: M0 clean passes; M1–M8 each fire their named assertions. Python |
| `controls_v575_c3c6.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v575_c3c6.py` — **NEW at v5.75.** Eight §B2 negative controls for `t41`: the single-return age rule, the bonus's second copy, Engine B's regular and AMT stacks, an Engine A regular site, the sale gross-up stack, and the hoisted projection. `M4` is the phantom-AMT control. |
| `controls_v576_c7.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v576_c7.py` — **NEW at v5.76.** Six §B2 negative controls for `t42`: the getter's single test, the loader default, a read that bypasses the getter (`M3`, the sweep's proof), and the D-2 note in both directions. |
| `controls_v577_ss86.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v577_ss86.py` — **NEW at v5.77.** Six §B2 negative controls for `t43`, `t24` §D and `t1` STRUCT S-4: line 14 dropped, a private copy in Engine C, the 85% cap removed, Engine C back on the widowed-years flag, and the pre-v5.45 middle-tier cap (`M5`, which reproduces the historical $2,468 / $1,850 bounds). `M4`/`M5` swap the mutant in under the suite's tag and restore it, checked by hash. |
| `controls_v578_irmaa.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v578_irmaa.py` — **NEW at v5.78.** Seven §B2 controls for `t44` and `t10`: the helper back to `<=` at the top, a private loop in Engine C, `<` at every tier (the fix must not leak downward), the label, the headroom, and M6 — `t10`'s exact-threshold gate forced on the v5.77 leg, which must fire exactly the two exact cases (a test-side control, because `t10` prints neither passes nor results). |
| `controls_v579_layout.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v579_layout.py` — **NEW at v5.79.** Seven controls for `t45`, each mutating the BUILT page's text (targets asserted exactly-once): the scroll-box rule, the selector's and the allocation strip's BOTH layers (either alone now suffices — defence in depth), the select cap, a stale page, and no browser at all (M6: it must FAIL). Known gap, disclosed: the 600 px floor is invisible to a page-width test. |
| `controls_v580_scenario.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v580_scenario.py` — **NEW at v5.80.** Six controls, each building a mutant DOM bundle exactly as `mk_runfolder.sh` does and swapping it in under v580's name (restored, hash-checked): default reverted, restore ignored, an unknown value accepted (the app then fails to render — the fallback matters), the key dropped from delete-everything (`t5`'s guard fires), a choice never saved. |
| `controls_v581_first_screen.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v581_first_screen.py` — **NEW at v5.81.** Seven controls for `t47`: three source mutations (menu bypasses `selectTab`; menu lists `TAB_IDS`; a complete second copy of the list), three built-page mutations (each phone rule removed), and M0. |
| `controls_v582_legibility.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v582_legibility.py` — **NEW at v5.82.** Thirteen controls for `t48`: eight source mutations (T48_SOURCE_ONLY), four built-page mutations and the unmutated run. A no-op skin switch was not built as a control (no stable target). |
| `controls_v583_surfaces.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v583_surfaces.py` — **NEW at v5.83.** Eight controls for `t48` at v5.83: four source mutations (T48_SOURCE_ONLY), three built-page mutations (the hover wash, a reverted nudge, the active tab without `--on-ring`) and the unmutated run. |
| `controls_v584_draw.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v584_draw.py` — **NEW at v5.84.** Six controls for `t49`: three source mutations (the AST checks), two compiled-module mutations (the draw dropped from the base; a drain re-planted — what K-1 forbids) and the unmutated run. |
| `controls_v585_ss_states.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v585_ss_states.py` — **NEW at v5.85.** Nine controls for `t50`: eight source mutations each compiled with `mk_testable.sh` (each state's rule undone, Utah's old rate, and the widowed-survivor bug t50 caught) and the unmutated run. |
| `controls_v586_state_years.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v586_state_years.py` — **NEW at v5.86.** Fifteen controls for `t51`: fourteen source mutations each compiled with `mk_testable.sh` and the DOM bundle rebuilt (the old Maine/Louisiana figures, a missing, future, stale or stray year, the blanket label, the dropped or mislabelled suffix, the old SC note, a guessed Maine threshold, NJ made exclusive, the Field Manual cell, LA's note drifting into the income-limited selector) and the unmutated run. |
| `controls_v587_age_notes.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v587_age_notes.py` — **NEW at v5.87.** Twelve controls for `t52`: each of the six notes reverted, "59½+" planted in a third 65-floor row, a false disclosure, New York given `exclAge: 59`, Montana's note silenced, Iowa's drifting into the income-limited selector, and the unmutated run. |
| `controls_v588_summary_age.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v588_summary_age.py` — **NEW at v5.88.** Seven controls for `t53`: the template reverted, display and engine default ages drifting apart in each direction, the "any age" wording broken, rounding planted, an age on the exempt wording, and the unmutated run. |
| `controls_v589_wv_senior.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v589_wv_senior.py` — **NEW at v5.89.** Nine controls for `t54`: the rule removed, a gross-SS base, a household offset per person, Maryland's offset removed, a generous count-only path, the flag removed, a 64 floor, note drift, and the unmutated run. |
| `controls_v590_retexempt.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v590_retexempt.py` — **NEW at v5.90.** Eight controls for `t55`: each gate removed, the both-spouses rule loosened, PA's pension gated, Michigan's cap removed, a gate moved, Michigan's single cap on joint returns, and the unmutated run. |
| `controls_v591_plantype.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v591_plantype.py` — **NEW at v5.91.** Seven controls for `t56`: buildPortfolio dropping the field, an engine reading the fields, the default flipped, stray values kept, a single filer's B kept, the selector drawn for a single household, and the unmutated run. |
| `controls_v593_attribution.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v593_attribution.py` — **NEW at v5.93.** Eleven planted defects plus the unmutated run for `t57` (12 of 12): wrong conversion shares at each of the three call sites, QCD from employer first, both engines' death rescale removed, the ownership fail-safe broken, bonus + match not employer, a P site without penOwner, the calculator reading byPerson, the pension left with a dead owner. |
| `controls_v594_state_draw.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v594_state_draw.py` — **NEW at v5.94.** Ten planted defects plus the unmutated run for `t58` (11 of 11): each engine's call without the draw, the draw routed to `work`, counted twice, the Field Manual line lost, a federal figure moving, Engine C moving, a state year falling. |
| `controls_v595_per_person.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v595_per_person.py` — **NEW at v5.95.** Ten planted defects plus the unmutated run for `t59` (11 of 11). |
| `controls_v596_survivor_state.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v596_survivor_state.py` — **NEW at v5.96.** Eight planted defects plus the unmutated run for `t60` (9 of 9, two runs). |
| `controls_v597_rates.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v597_rates.py` — **NEW at v5.97.** Seven planted defects plus the unmutated run for `t61` and `t2`'s declared diff (8 of 8). |
| `controls_v598_disclosures.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v598_disclosures.py` — **NEW at v5.98.** Six planted defects plus the unmutated run for `t62` (7 of 7). |
| `controls_v599_flat_rates.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v599_flat_rates.py` — **NEW at v5.99.** Six planted defects plus the unmutated run for `t63` (7 of 7). |
| `controls_v600_brackets.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v600_brackets.py` — **NEW at v6.00.** Ten planted defects plus the unmutated run for `t64` and the parity guardrail (11 of 11). |
| `controls_v601_brackets.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v601_brackets.py` — **NEW at v6.01.** Twelve planted defects plus the unmutated run for `t65` and the parity guardrail (13 of 13). |
| `controls_v602_deduct.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v602_deduct.py` — **NEW at v6.02.** Eleven planted defects plus the unmutated run for `t66` and the parity guardrail (12 of 12). |
| `controls_v603_deduct.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v603_deduct.py` — **NEW at v6.03.** Ten planted defects plus the unmutated run for `t67` (11 of 11). |
| `controls_v604_feddeduct.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v604_feddeduct.py` — **NEW at v6.04.** Seven planted defects plus the unmutated run for `t68` (8 of 8). |
| `controls_v605_fm.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v605_fm.py` — **NEW at v6.05.** Seven planted defects plus the unmutated runs, for `t35` RI-7–RI-10 and `t52` F-1–F-3 (9 of 9). |
| `controls_v606_annuity.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v606_annuity.py` — **NEW at v6.06.** Six planted defects plus the unmutated run for `t69` (7 of 7). |
| `controls_v607_annuity_conv.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v607_annuity_conv.py` — **NEW at v6.07.** Fourteen planted defects plus the unmutated run for `t70` (15 of 15). |
| `controls_v608_engine_d_ira.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v608_engine_d_ira.py` — **NEW at v6.08.** Nine planted defects plus the unmutated run for `t71` (10 of 10); one equivalent mutant recorded in the script, not run. |
| `controls_v609_engine_d_roth.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v609_engine_d_roth.py` — **NEW at v6.09.** Five planted defects plus the unmutated run for `t72` (6 of 6). |
| `controls_v610_peer.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v610_peer.py` — **NEW at v6.10.** Eight planted defects plus the unmutated run for `t73` (9 of 9). |
| `controls_v611_ranking.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v611_ranking.py` — **NEW at v6.11.** Eight planted defects plus the unmutated run for `t74` (9 of 9); K7 mutates the test, not the app (it skips the Monte Carlo re-run, and B-1 must fire). |
| `controls_v612_c5.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v612_c5.py` — **NEW at v6.12.** Ten planted defects plus the unmutated run for `t75` (11 of 11): flat 85% back, the joint table always, the death year filed Single, indexing dropped, the age-65 extra dropped, gain back in the rate's input, a private `× 0.85` in Engine C, the oracle's filing switch dropped (a test mutant), the 32% cap back, the table's sentence removed. |
| `controls_v613_c11.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v613_c11.py` — **NEW at v6.13.** Ten planted defects plus the unmutated run for `t76` (11 of 11): the card's and the Field Manual's old sentences, "Roth break-even" dropped from the manual, METHODOLOGY's old sentence, v6.06's fixed annuity share in Engines B, C and A, a non-text change in `rothCrossover`, the census row's ACA input dropped, the blind item removed. |
| `controls_v614_payroll.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v614_payroll.py` — **NEW at v6.14.** Nine planted defects plus the unmutated run for `t77` (10 of 10): the household cap back, the 0.9% dropped, the threshold indexed, the joint threshold in Single years, a joint row given to A, a stray `0.0145` in Engine A, Engine A kept on the old rule, the oracle's attribution dropped (a test mutant), the method-note clause removed. |
| `controls_v615_events.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v615_events.py` — **NEW at v6.15.** Eight planted defects plus the unmutated run for `t78` (9 of 9): Drive back in the backup card, the strip ignoring `notice` removed, the backtest chore restored, "eighteen" restored, the notice yellow in October, the STALE strip's old sentence, the plan review moved to February (a non-text change), the Ranking sentence restored. |
| `controls_v616_se.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v616_se.py` — **NEW at v6.16.** Eight planted defects plus the unmutated run for `t79` (9 of 9): the 92.35% factor dropped, the $400 floor dropped, the base not reduced by wages, the 0.9% ignoring net earnings, a joint row wholly A's, the field lost on save, a stray `0.124`, the old disclosure restored. |
| `controls_v617_home.py` | — **repo-only from birth** (release-pinned, OPERATIONS §G) | `qa/tools/controls_v617_home.py` — **NEW at v6.17.** Eight planted defects plus the unmutated run for `t80`: the constant restored at one site, the sign flipped, the field lost on save, a missing field read as 130,000, the clamp removed, the notice never shown, the example's figure changed, the Events clause kept at $0. |
| `controls_v568_runfolder.sh` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v568_runfolder.sh` — row added 2026-09-28: pooled until now with NO manifest row, found while un-pooling the release-pinned controls. |
| `controls_v570_b3.sh` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v570_b3.sh` — row added 2026-09-28: pooled until now with NO manifest row, found while un-pooling the release-pinned controls. |
| `controls_v571_draft.sh` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v571_draft.sh` — row added 2026-09-28: pooled until now with NO manifest row, found while un-pooling the release-pinned controls. |
| `controls_v572_import.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/tools/controls_v572_import.py` — **NEW at v5.72.** One reversion per fix (C1–C11, the three skin gates separately) plus V1. Python, no shebang |
| `t33_roth_stream_fica.mjs` | `90f1458b4ef628fe51b4fdc95a8cd4ef` | `qa/t33_roth_stream_fica.mjs` — **NEW at v5.63.** The Roth comparator charged FICA on non-work ordinary income. **Carries the FIRST stream-bearing fixtures in the suite's history** — every other fixture sets `incomeStreams` to `monthly: 0` or `[]`, which is why 2,934 checks were green against a live defect for as long as the feature existed. 32 checks per leg, gated: the v5.62 leg asserts the defect, the v5.63 leg the fix. ⚠ **Its two absolute pins live in a `PINS` table, one row per version tag, with a fail-closed guard** — a tag added to `KNOWN_VERSIONS` without a `PINS` row halts rather than silently reading another build's numbers. Everything else is a delta between two streams on one build and is version-independent by construction. ⚠ **`v561` is registered deliberately**, so a clean-clone verification run on the shipped pair does not halt on its first leg. ⚠ **Group E reaches `_estSaleGain` ONLY through the STAY UNDER ACA CLIFF solver** — setting the ACA fields and reading the slider row does not enter the second FICA site; a first version did exactly that, looked like coverage, and was caught by controls C2a and C4 NOT firing. Read its header before touching group E. ⚠ **Do not "tidy" its fixtures to `monthly: 0`** |
| ⚠ **ADDED TO THE POOL 2026-08-28, five days late** | — | `t32` shipped at v5.53 and **this manifest had no row for it while the pool had no copy of it.** Ten further test files (`t8`, `t23`–`t31`) were in the pool at their v5.52 content while **their md5 cells above were already correct** — the v5.53 refresh rewrote the hashes and did not upload the files. So the manifest was right and the pool disagreed with it, which is the one direction §A2's fallback table can actually catch: comparing pool files to these cells finds it in one command. Nobody compared them. **A hash table nothing is compared against is documentation, not a check** — and the source hash matching is what made the refresh look complete |
| `boundaries.mjs` | `1451ef34b55bc3e99514b24892eba99b` | `qa/tools/boundaries.mjs` — **NEW 2026-08-23.** The census itself. Asserts nothing (§B1). Reads every numeric threshold live through the shim, so it cannot drift from the app; the ½-cap band is derived as THR2−THR1 rather than repeating v5.45's "$12,000". Takes a portfolio, defaulting to the example household — pointing it at a proposed FIXTURE is the use that earns its keep |
| `peer_scf.py` | `9efc7e0c9264a5c64bd9e9eb7295dc68` | `qa/tools/peer_scf.py` — **NEW at v6.10.** Computes the Ranking tab's SCF figures from the Fed's Summary Extract Public Data (all five implicates pooled with `WGT`, ages 55–64), and refuses to print unless its median and mean net worth agree with the Fed's published figures within 2%. Asserts nothing about the app and is counted in no total (§B1). Pooled because the next SCF refresh needs it; the data file is attached per refresh and never kept. Its 2025 output is `docs/PEER_SCF2025_figures.txt`, which is kept in the repo and not pooled. |
| `vercensus.cjs` | `5df4e76641cf1faa97537580d5c50af2` | `qa/tools/vercensus.cjs` — **NEW 2026-09-01.** Measures what a version bump costs in the SUITE, which is priced everywhere else as "four in-app sites" — the SOURCE cost only. From v5.57: **15 files, 16 ladder entries, 62 gated expressions**, `t4` holding 21. ⚠ **It exists because the v5.54 stop-report measured this, called that scope wrong by a factor of sixty, and closed by finding that NO DOCUMENT RECORDS THE COST — and the gap was never filled, so `SCOPE_VA_NOTE_CORRECTION.md` repeated the error the same day it was written.** A number re-derived on demand cannot go stale; one written into prose does. Asserts nothing; counted in NO check total (§B1) |
| `households.mjs` | `2607259222aad6399ff625cf218490e3` | `qa/tools/fixture/households.mjs` — **NEW 2026-08-23.** Synthetic portfolios for `t29`. ⚠ **NOT `fixture.jsx`**, whose line numbers are load-bearing (§B1) — this census operates on portfolios, not source text |
| `BUILD_BRIEF_v5_49.md` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) | `docs/BUILD_BRIEF_v5_49.md` — **NEW 2026-08-25.** The build brief for v5.49, written because a full release build did not fit the session that resolved the decisions. **All four `SCOPE_D6` decisions are RESOLVED and the approved copy is quoted verbatim** — do not re-decide. ⚠ Records two traps that will bite this specific build: **§C0** (an anchored `DOCS_HTML` edit is silent about the text that FOLLOWS it — print the surrounding sentence back and re-measure char AND byte counts) and **§B2** (v5.48 does not contain the clause, so an ungated disclosure assertion fails the prior leg — the v5.28 defect exactly). ⚠ Also carries **EDIT 3**, added after checking `ssa.gov/forms/ssa-44.pdf`: the SSA-44 list is **closed at eight events** and a Roth conversion is not among them, so `METHODOLOGY.md` L840–845 is accurate but incomplete | **ready to build** |
| `SCOPE_STATE_FIXTURES.md` | — **un-pooled 2026-09-14, repo-only** | `docs/SCOPE_STATE_FIXTURES.md` — ☑ **RETIRED 2026-09-01: FULFILLED AT v5.54**, verified against v5.57. ⚠ Its `package_check` OPEN-allowlist entry was deleted in the same edit. ⚠ **RETIRED not deleted**: the deferred `stateEstate` fixture (D2) appears nowhere in `MissingFeatures.md`, so this document is its only record. **Its §4 ordering constraint on D-3c is now DISCHARGED.** *(Prior status:)* The prerequisite for D-3c and D-7: every suite fixture sets `stateCode: null` (the legacy fallback) except `t3`'s `GA`, so 50 of 51 jurisdictions are unexercised at household level, and `t10`'s six archetypes are structural branches that miss the income-limited-exclusion class entirely. ⚠ Also splits `boundaries.mjs` **L88–90**, whose `state_tax` row is keyed on the legacy scalar and reads ON while `STATE_RULES` is muted |
| `STATUS_v5_42_shipped.md` | *(no hash — REPO-ONLY, not in the pool)* | ⚠ **REPO-ONLY since 2026-09-05 (H-2).** Fetch from the repo; it is not in project knowledge, so it has no pool hash to fall back on. `docs/STATUS_v5_42_shipped.md` — **NEW at v5.42.** The ship record: the §86 cliff, the five-slider test design and why the default proves nothing, the six negative controls and the one that is a documented no-op, the middle-tier `[KNOWN DEFECT]` found mid-build, and the four items left open |
| `oracle_nm.py` | `49ea4b6a9d7661f87e190ff2d94c138b` | `qa/tools/oracle_nm.py` — ⚠ **ROWED 2026-09-08 (D-2 (c)), and the FIRST `.py` row this table has ever carried.** It was unrowed until `K-8`'s matcher was widened to see `.py` in the same release; before that a row here would have been an obligation with no gate behind it. **Rowed because it is the one Python file whose silent change could move a user's number** — it is the independent implementation of NMSA 1978 § 7-2-5.2, typed from `FINDINGS-v5_63-state-statutes.md` §2 and **never read off `STATE_RULES`**, and `t10` prices every New Mexico band against it. The two control scripts stay unrowed under D-3. ⚠ **Roll this row only after re-reading the statute**, never to make a check go green: a hash disagreement here means the oracle changed, and the oracle is the thing that is supposed to be independent |
| `oracle_va.py` | `ad3a72238297d19a7b46063ac654fff2` | `qa/tools/oracle_va.py` — ⚠ **ROWED ON ARRIVAL 2026-09-09, deliberately, because `oracle_nm.py`'s row above records being added ONE PACKAGE LATE and caught by `K-9`.** Same role, same rule: the independent implementation of Va. Code § 58.1-322.03(5)(b), typed from `FINDINGS-v5_63-state-statutes.md` §5 and **never read off `STATE_RULES`**. ⚠ **NOTHING READS IT YET** — `t10` will price Virginia's taper against it when `SCOPE_VA_POPULATE.md` is built, so today the row protects a file that cannot move a user's number. It is rowed anyway: `K-8`'s matcher has seen `.py` since v5.67, the row costs nothing, and the alternative is to remember to add it later, which is exactly what went wrong last time. ⚠ **Roll this row only after re-reading the statute**, never to make a check go green — a hash disagreement means the oracle changed, and the oracle is the thing that is supposed to be independent |
| `oracle_ri.py` | `92d15a5b5e485dd2e9e84bb7da92efaa` | `qa/tools/oracle_ri.py` — **ROWED ON ARRIVAL at v5.69**, as `oracle_va.py` was. The independent implementation of RI's pension/401(k) cliff as the model represents it, typed from FINDINGS §6 as corrected; imports nothing from the app |
| `hand_86.mjs` | `981b425c4fc738abb49046a97cd0fea0` | `qa/tools/hand_86.mjs` — **PROMOTED TO SUITE ORACLE at v5.42** and added to the pool (it was repo-only through v5.41, which is why the v5.42 brief had to record its hash separately). `statute86` is transcribed from 26 U.S.C. §86 at law.cornell.edu, **not from any app expression**, and is imported by BOTH `t24` and `qa/tools/derive_v542.mjs` — one oracle on both sides, deliberately, because at v5.41 a second independent derivation drifted and the brief's table shipped wrong twice. ⚠ **The three app copies inside it are v5.40 transcriptions and are now HISTORY** — `rothTab` records the cliff v5.42 replaced. Asserts nothing; counted in NO check total |
| `package_check.mjs` | `2c9eb4c0ca5ccb40b767e970d99a5974` | `qa/tools/package_check.mjs` — ⚠ **hash rolled 2026-09-07 (sixth package)** (was `c6ea907826…`): the I-2 OPEN allowlist **lost** `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md`, whose stated expiry — H-3 and the third scope-status sweep — was met on 2026-09-07, and which was retired in the same package. ⚠ **Rolled deliberately and first**: the 2026-09-07 manifest-repair package changed this same file and did NOT roll this row, so K-8 passed pre-ship and went red the moment the package landed. **The row for a file the package itself changes is the row most likely to need rolling.** Previously ⚠ **rolled 2026-09-04** (was `232b96ce74…`): the I-2 OPEN allowlist gained `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md`, and the `SCOPE_INCOME_CONDITIONING.md` entry's *comment* was rewritten — its reason changed from *awaiting D-2 and D-3* to *approved 2026-09-04, unbuilt*, and its expiry moved from "when the decisions are made" to "when the field ships." ⚠ **An allowlist entry whose REASON goes stale is invisible to I-3 exactly as a stale entry is** — I-3 fires only on an entry naming a file that is gone. Previously **rolled 2026-09-03** (was `999dd7a15f…`): the I-2 OPEN allowlist gained `SCOPE_ROTH_FICA_OTHERORD.md`, decided but not shipped. ⚠ **That entry expires when v5.63 ships and `I-3` CANNOT catch it going stale** — I-3 only fires on an entry naming a file that is gone, and this one will still exist. ⚠ **hash corrected 2026-09-02**: the row read `6133144820…` while pool AND repo held `ee1a1a8f63…` (the 2026-09-01 G-2/J rewrite landed and the row did not roll — the 2026-08-28 shape again). **NEW at v5.42 (added 2026-08-21).** Validates a release zip against OPERATIONS §L before it is sent: structure, MANIFEST truthfulness, changed-files-only against a clone, `knowledge/` flatness and the two-source rotation, cross-destination byte-identity, and the delete-first list. **25 checks (24 on an ops package), negative-controlled 16 ways, all firing.** Packages declare `KIND: app-release` or `KIND: ops` in MANIFEST.txt; release-only checks are gated on it and an **undeclared package fails closed**. Without a clone the tree-diff checks are SKIPPED and say so. Asserts about the DELIVERY, not the build — counted in NO release check total |
| `package_check_controls.sh` | `aeb71688719004f62712e029d4096c11` | `qa/tools/package_check_controls.sh` — ⚠ **SECTION K REWRITTEN 2026-09-07 (H-6): all seven K controls were measuring nothing.** They mutated a scratch copy of the POOL, but K reads the manifest from the PACKAGE's `github/` copy — so once §L required every package to ship a manifest, every K control edited a file K never opened. Four reported INVALID, **P32 passed SPURIOUSLY** (K-8 fired on an unrelated stale row) and P33 fired the wrong id. Now: the PACKAGE is copied and its manifest mutated in `github/` AND `knowledge/`; every value is DERIVED, not hardcoded (the old ones named `v5.61` and two v5.61-era hashes literally); P32/P33 carry a **needle** so a control cannot pass on someone else's failure; P35 now removes the manifest from the package too, which it never did. **Null-controlled: suppress the mutations and all six go quiet.** ⚠ **P1–P28 were NOT re-validated** — they need an un-uploaded APP-RELEASE package and none exists; recorded as the open half. the negative-control harness for `package_check.mjs` (§B2). **REWRITTEN 2026-08-23**: it hardcoded absolute paths from a dead session, so anywhere else it printed *** NOT CAUGHT *** for every control — reading as "the checks are broken" rather than "the inputs are missing" — and exited **0**. Now self-locating, argument-driven, deriving its targets from the package, and exiting non-zero when a control does not fire. **17 controls, all firing**, including P19, which asserts `G-1` stays QUIET on a clean workspace. Tooling — counted in no app total |
| `controls_runfolder_prior.sh` | `0cefdd013714388240a381c782250fb2` | `qa/tools/controls_runfolder_prior.sh` — **NEW 2026-09-28. General-purpose, pooled.** Five controls for `mk_runfolder.sh`'s prior resolution: git mode byte-exact to the manifest's md5; a correct file accepted; a wrong file, an unrecorded version and a shallow clone refused (exit code and message). |
| `controls_source.sh` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) | `qa/controls_source.sh` — the SOURCE-level negative-control harness (§B2): reverts a fix, rebuilds, and requires the named suites to FAIL. **Renamed and repaired 2026-08-23 from `controls_v542.sh`**, which is DELETED. The version is out of the filename (it described `SRC=`, not the controls, and made the file look stale whenever a tag rolled). All 19 anchors were intact at v5.47 — the defect was that `rebuild()` built only `app_<tag>.mjs` while `t24` reads `dom_<tag>.cjs`, so **four controls reported a FALSE `NOT CAUGHT`**. Now rebuilds both, and `verify_artifacts()` refuses a verdict unless every consumed artifact is newer than the source. **C0** is a control that must NOT fire. ⚠ Covers v5.36 and v5.42 only — **nothing covers v5.43–v5.47** |
| `t2_engines.mjs` | `e823a4b2355975a07f5c5432c6534864` | `qa/qa-baseline/t2_engines.mjs` |
| `t3_roth.mjs` | `6e276e51011dbcd361906ed1f67722e6` | `qa/qa-baseline/t3_roth.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t4_dom.mjs` | `193d4f8beaa733a237a0a6e6b4397d36` | `qa/qa-baseline/t4_dom.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t5_storage.mjs` | `51c8c4c86dd149ec8194d89d154f8373` | `qa/qa-baseline/t5_storage.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t6_single.mjs` | `238f670ca96aed37a84f195e96455b2a` | `qa/qa-baseline/t6_single.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t7_accrual.mjs` | `fd0ab4282e31d8a7e170606c877c28d0` | `qa/t7_accrual.mjs` |
| `t8_invariant.mjs` | `b0d376c083c540439b4bcd909420bbbe` | `qa/t8_invariant.mjs` — ⚠ **hash corrected 2026-09-01.** The pool copy had been stale since v5.56: 184 lines / 38 checks against the repo's 218 / 40, missing the **v5.56 state-SS-offset extinction invariant**. This row carried the STALE hash, so pool and manifest agreed with each other and §A2's no-network fallback returned a false green — only the clone-and-diff caught it. The repo copy was always correct and is what the 2,858 baseline is measured with |
| `controls_state.sh` | `00f48fe5ace27c3dc6d62e591c8305f3` | `qa/tools/controls_state.sh` — ☑ **REPAIRED 2026-09-10** (ops): it had been pinned to `v553` with a dead S2 anchor. Now `bash qa/tools/controls_state.sh <run-folder> <version-tag>`; null control S0 plus S1–S5, **6 of 6 against v5.68**; a mutation that does not apply is reported as a finding. Duplicates only S2 of `controls_v568_va.py` (T6) — S1, S3, S4, S5 exist nowhere else. *(Row as first written:)* **NEW 2026-08-28**, the negative-control harness for the three state census rows (§B2). Five controls, all firing: `bash qa/tools/controls_state.sh <run-folder>`. ⚠ **S4 rebuilds the app** and is the slow one; it is also the control that guards the empty-set case, so it is not the one to skip. ⚠ It was **absent from the pool entirely** until this package — the repo half of the 2026-08-28 refresh landed and the `knowledge/` half did not |
| `AUDIT_STATE_EXCL65_NOTES.md` | *(no hash — REPO-ONLY, not in the pool)* | ⚠ **REPO-ONLY since 2026-09-05 (H-2).** Fetch from the repo; it is not in project knowledge, so it has no pool hash to fall back on. `docs/AUDIT_STATE_EXCL65_NOTES.md` — **NEW 2026-08-28. FINDINGS ONLY, nothing fixed.** Six of the 19 `excl65 > 0` states checked against their own revenue authorities; **four misstate their own law to the user** (NJ, MD, ME, CO wrong; GA, NY correct). ⚠ **Its §0 finds the D-3c class MIS-SPECIFIED:** only NJ is income-limited — MD, ME and CO reduce the exclusion by **Social Security received**, which `boundaries.mjs`'s `state_excl_limited` row cannot see, because that row keys on a note flagging an income limit. ⚠ Coverage **6 of 19**, stated in its own §5; KY $31,110 is the largest unchecked. ⚠ The `note` is **rendered to the user** at L12103 beside a clause generated from `excl65` itself — correcting a note does not touch that clause |
| `AUDIT_STATE_EXCL65_ROUND3.md` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) | `docs/AUDIT_STATE_EXCL65_ROUND3.md` — **NEW 2026-09-01. FINDINGS ONLY, nothing fixed.** VA, WI and NJ checked against ENACTING STATUTES, not department summary pages. ⚠ **Its §0 finds the four-state grouping mis-specified**: ME is NOT in the class (v5.56 modelled its SS offset; its residual is a separate $125K/$250K phaseout), while NM and WI are in the live F-6 set and were omitted. ⚠ **VA's `note` misstates its own thresholds** — Va. Code §58.1-322.03(5) is $50K/$75K, the note says ~$75K/$150K, overstated in the OPTIMISTIC direction. ⚠ **WI models a SUPERSEDED provision** — 2025 Wis. Act 15 gives $24K/$48K at 67+ with NO income limit, so the model under-states the exclusion and its error runs **CONSERVATIVE**; WI does not belong in a D-3c scope. **NJ's `t10` §2E analysis HOLDS** against P.L. 2021 c.129 despite citing summary pages. ⚠ Coverage 3 states; **NM and RI UNVERIFIED**, both carrying `ss: 0.5`. Its §4 finds the fix is a **data-model change, not a formula tweak** — `excl65` × `persons65` cannot express a taper, bands, a cliff, a household cap, a non-65 age, or an SS-excluding income measure. **Four decisions open in §6.** Not swept by `package_check` I-2, which matches `SCOPE_*` only |
| `SCOPE_VA_NOTE_CORRECTION.md` | — **un-pooled 2026-09-14, repo-only** | `docs/SCOPE_VA_NOTE_CORRECTION.md` — **NEW 2026-09-01, ACTIVE, awaiting decisions.** Decision **D-C** of `AUDIT_STATE_EXCL65_ROUND3.md`: VA's note states ~$75K/$150K where Va. Code §58.1-322.03(5) says **$50K/$75K**, overstated in the OPTIMISTIC direction. **Disclosure only — one string, no figure moves.** ⚠ Its §2 census was RUN: no suite file asserts VA text and `METHODOLOGY.md` never mentions Virginia, both verified rather than assumed. ⚠ **Its real risk is `t29` L212** — rewriting the note can drop VA from the F-6 guarded set (the §B1a trap that took NJ's set from five to four). The draft wording was **executed against the live matcher** and holds at five; this must be re-run against the final wording. **Four decisions open in §6. Nothing built.** Held open by name in `package_check`'s I-2 allowlist |
| `t9_dom_smoke.mjs` | `cd966e47c98450c26ea1057b3d3de239` | `qa/t9_dom_smoke.mjs` |
| `controls_v559.sh` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/controls_v559.sh` — **NEW at v5.59.** Seven §B2 controls + null for the RI/WI figures and notes. Its `cd` targets the run-folder ROOT (the v5.57 edition cd-ed into `qa/` and could not find the source). Its first C4 patched Colorado on a shared `excl65: 24000` anchor — re-anchored; read every failure. |
| `controls_t21_censusp1.sh` | `7a02afc5ef52e7aa3b7d2b50522315e8` | `qa/tools/controls_t21_censusp1.sh` — **NEW at the ops package of 2026-09-14 (t21 Section F).** Five §B2 mutants for `t21` Section F; C2 turns two checks red, so **6 fired, 0 silent**. ⚠ **C5 runs in the OPPOSITE direction from the rest** — it ADDS a storage call to the fixture and requires the disclosure guard to go RED, because a gap-assertion that cannot be falsified is the vacuous pass Section F exists to avoid. Every mutant is written to a throwaway copy from a pristine read and both canonical files are md5-verified byte-identical before and after (the v5.66 poisoned-baseline lesson). ⚠ **Must land `100755`**; a drag-and-drop upload lands a NEW `.sh` at `100644` and `G-3a` fires. Tooling — counted in no app total |
| `controls_v560.sh` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | `qa/controls_v560.sh` — **NEW at v5.60.** Eight §B2 controls + null for the RI/WI age floors and notes. `cd`s to the run-folder ROOT. ⚠ **Two controls (C5, C6) came back NOT CAUGHT on the first run and exposed real holes in the new assertions, not faults in the controls** — see `TESTING.md`. ⚠ Its C0 verdict line was inverted after it reported the null control's correct silence as a finding. ⚠ Must land **100755**; a drag-and-drop upload lands 100644, which is what happened to `controls_v559.sh`. |
| `AUDIT_STATE_EXCL65_ROUND4.md` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) | `docs/AUDIT_STATE_EXCL65_ROUND4.md` — **NEW 2026-09-02. FINDINGS ONLY.** NM, RI, WI: the gate-shaped group (now `MissingFeatures.md` D-11); RI's $50,000 and the 67/cliff/IRA conditions; the F-6 set and the zero-coverage finding. Parent of the v5.59 release. |
| `SCOPE_EXCL65_STALE_RI_WI.md` | — **un-pooled 2026-09-14, repo-only** | `docs/SCOPE_EXCL65_STALE_RI_WI.md` — ✅ **SHIPPED at v5.59, 2026-09-02; RETIRED as active scope, kept as the build record** (§8 filled). Corrects its own §5(d) control-1 expectation in §8. |
| `runsuite.sh` | `ad8b0cf5cd4617288c6d475515f7c0df` | `qa/runsuite.sh` — **rolled at v5.42**: `t23` and `t24` adopted into the routine run, both legs each. NEW at v5.36 (parse-only totals runner with the DIED verdict) |
| `state_sets.cjs` | `3479ec88b8966c5163437da394582722` | `qa/tools/state_sets.cjs` — **NEW at the ops package of 2026-09-15 (state-set stage 1).** The suite's single source of truth for the income-limited state set: `IN_LAW`, `NOTE_MATCHER`, `isConditioned`, `unconverted()`, `proseSelected()`. **Rowed, unlike its parser neighbours**, because `t10`, `t29` and `t35` `require` it at run time — a stale pool copy changes what three app suites assert. Stage 2 is expected to change it |
| `state_sets_check.mjs` | `bccc17fd01109add1108bf28bce71dfe` | `qa/state_sets_check.mjs` — **NEW at the ops package of 2026-09-15 (state-set stage 1).** TOOLING suite, 10 checks per leg, counted in no app total; rowed like every other suite |
| `tools_fixture.jsx` | `3602b615b65f09995a9eb1fa17fe4175` | `qa/tools/fixture/fixture.jsx` |
| `VERIFY.sh` | *(rewritten at v5.49 — see the row below)* | `VERIFY.sh` (repo root) — **un-pooled 2026-10-11, repo-only** (removed from the pool that day; recorded by the ops package of 2026-10-11, second). ⚠ **RETIRED 2026-08-25.** Row added 2026-08-17; its absence here is how the v5.36→v5.37 pool drift stayed invisible (scope v5.38 §0). The file is kept but no longer executes |

`probe_classify.mjs` was removed from the pool at v5.30 and now lives only in the repo at
`qa/tools/probe_classify.mjs`. (OPERATIONS §A2 asserted the exact opposite — *"exists only in
knowledge"* — from v5.30 until 2026-08-20, when the clone-and-diff caught it. This row was right
the whole time; the two documents simply disagreed and nothing compared them. Corrected in
`OPERATIONS.md`.)

**The v5.38-prep duplicates were RETIRED FROM THE POOL on 2026-08-21**, together with
`gate_v538.mjs` and the two fulfilled scopes (`SCOPE_FIX_docs_v5_39.md`,
`SCOPE_v5_40_disclosures_and_mechanics.md`) — nine files, all of which this file had already marked
retirable. **Their rows were deleted in the same edit**, which is the whole point: a row naming a file
that no longer exists is worse than the file, because the §A2 offline fallback then misdirects. All
nine remain in the repo at `docs/` and `qa/tools/`, so nothing is lost. Pool: 88 → 79 files.

**TEN MORE ROWS WERE DELETED ON 2026-09-01**, for the same reason as the 2026-08-21 nine: each named
a file that had already left the pool, so the §A2 offline fallback was pointing at nothing. Seven are
documents retired at the 2026-09-01 pool read — `SCOPE_ENGINE_C_SS86.md`, `SCOPE_D6_SSA44_USER_SIDE.md`,
`SCOPE_ITEMS_3_6_perRmd.md`, `SCOPE_ENGINE_B_ROTH_HALF_CAP.md`, `SCOPE_D3_NJ_EXCL_DOLLAR_EXACT.md`,
`SCOPE_v5_54_STATE_DISCLOSURE.md` and the v5.54 `STOP-REPORT` — and three are rotated-out DOM entries,
`dom_entry_v548/552/553.jsx`. **All ten remain in the repo** (`docs/` and `qa/qa-baseline/`), so nothing
is lost. Pool unchanged at 105 files; this edit touches only the table.

⚠ **The deleted rows were stale in their PROSE too, and that is the more interesting half.** Six of the
seven scopes are marked **RETIRED** in their own first twelve lines — the marker `package_check` I-2
reads — while their manifest rows still described them as *"ACTIVE, awaiting decisions"*, because a row
freezes at the moment it is written and nothing re-reads it. Checked before deletion per §G: every one
carries a retirement marker in the repo, and the 2026-09-01 pool read had already confirmed all 22
retired scopes for unresolved decisions. **The `STOP-REPORT` has no marker** — it is a handover, which
the gate now classifies as `KIND: handover`, and its row itself said *delete from the pool at the v5.54
ship*. Deleting a row is not deleting a document; the decisions live in the repo copies.

⚠ **The repo's copy of THIS FILE was one release stale through v5.30** — the committed
`PROJECT_KNOWLEDGE_INDEX.md` still named v5.29 as current and carried no §A2 table at all, because
the v5.30 refresh updated knowledge but never committed the manifest. Found by the v5.31 clone-and-diff
(46 of 47 pool files matched the committed tree; this was the one). The manifest ships to **both**
destinations from v5.31 forward.

### Repo-only `qa/tools/*.mjs` — rows added 2026-08-20 at v5.41

**Why these were missing.** Eight measurement tools were written across the two sessions preceding
v5.41 and committed to `qa/tools/`, but never given manifest rows — so the §A2 fallback table could
not see them and a stale copy would have been invisible by construction, the exact hole §A2 exists
to close. They are **repo-only by design** (measurement scaffolding, not suites; they assert nothing
and are counted in no check total), so a session working from the pool alone will not have them and
should clone. ⚠ **Seven of the original eight still are; `hand_86.mjs` is not** — it became a suite oracle at v5.42 and now lives in the pool. Its row below is a pointer to the §A2 table, not a hash.

| Repo file | md5 | What it is |
|---|---|---|
| `qa/tools/d3_cap_sweep.mjs` | `c737fb6aff51bfe020498d73688bf18b` | Sweeps the D-3 conversion cap across the slider range × Traditional balances. Produced the "worst case $252, $0 on both measured households" figure that resolved D-3 *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/derive_rmd_expectations.mjs` | `0cfa92b929735f5207eab517c9b7adfb` | The v5.41 pre-build derivation. ⚠ **KNOWN-WRONG IN TWO WAYS, LEFT UNCORRECTED DELIBERATELY** — see the warning below *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/engineC_threeway.mjs` | `9caf5fb27267cecc2bfc8d4637283f45` | Drives Engine C against the Roth tab and a hand computation for three-way agreement *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/hand_86.mjs` | — | ⚠ **NO LONGER REPO-ONLY. See its row in the §A2 table above** (pool name `hand_86.mjs`, md5 `981b425c4fc738abb49046a97cd0fea0`), where it was promoted to SUITE ORACLE at v5.42 and added to the pool. This row is kept as a pointer, not a second hash: it carried `ad9688928e9a897b62951e5e22ba280e` — the pre-v5.42 content — for a few hours after the v5.42 refresh, so the manifest briefly held **two rows for one file with two different hashes**, one of them stale and both claiming authority. Caught by the post-ship sweep on 2026-08-21. **A file promoted out of this section must have its row here converted to a pointer in the same edit**, or the §A2 fallback has two answers and no way to tell which is current |
| `qa/tools/hh3.mjs` | `8bd8d8cd1c56eac1052ad87cff29671f` | The third (straddling) household fixture — the one whose error is 59% dividends/gains *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/ladder_hand.mjs` | `590234628df6a96e84dd3223a54fe2f3` | Hand replication of the ladder loop; one of the two independent scripts agreeing on $167,131 *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/render_check.mjs` | `88711e45ca98e8e63599488699ceeca3` | Reads the RENDERED ladder table out of jsdom. ⚠ Its imports are written for the RUN-FOLDER ROOT, not `qa/tools/` — copy it up a level to run it *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/slider_rerun.mjs` | `4fbbbdb5bc83505cdf994bb5a9b9027f` | Re-runs the ladder across slider positions; produced the direction-flip table in the measurement *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/probe_mydata_draft.mjs` | `f14e211de9ae21ebc0de641a4d2c2d96` | **Added 2026-09-11 (Phase 1 re-run at v5.69).** Runtime reproduction of `FlawsToFix-v5_69-Phase1.md` **A-3** (the draft autosave never saves): `contract`, `traced` and `control` modes. The control is a scratch shim with sync methods and must stay inside this file — never in a suite shim *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/probe_import_hostile.mjs` | `91537a1dc38f12acdeca1c3ca1c67e6b` | **Added 2026-09-11.** Drives hostile and malformed backups through BOTH real import paths (My Data, landing restore); `valid` is its positive control. Evidence for A-2, A-4, A-5, A-6. Sets `globalThis.FileReader` — the DOM harness has none *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/probe_ai_route.mjs` | `fd1e5a3900403b06fdbcb8337c1472e1` | **Added 2026-09-11.** Ask AI routing on a self-hosted origin with `src/main.jsx` L52–69 transcribed over a recording stub; `key` is its positive control. Evidence for **B-3**. Never touches the network *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/census_p1.cjs` | `8682c0dd7ce3234bb1fbbc0021729b0c` | **Added 2026-09-11.** The widened Phase 1 surface census — storage, network, sinks, iframe, download, clipboard, URL, JSX attributes, `JSON.parse`, merges. Walks every node key; self-checks four known sites *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `qa/tools/lits_p1.cjs` | `57f4b0ae07d18cf1b20347778b82b954` | **Added 2026-09-11.** Literal walk: the Field Manual's text value, app copy, and every suite string and regex literal, with each regex EXECUTED against the draft copy (§B1a) *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `mk_testable.sh` | `216722604a4a08faaee512d483219ca5` | `qa/qa-baseline/mk_testable.sh` — Splices `shim.txt` onto a source and builds `qa/app_<tag>.mjs`. **Named as a harness file in OPERATIONS §B and row-less until 2026-08-23.** Portability was fixed at v5.10.1 — it resolves relative to its own location, so the suite runs from a clean clone |
| `run_all.sh` | `71bf342fbc7221340d40a93a154b29ee` | `qa/qa-baseline/run_all.sh` — The baseline driver: t1–t6 plus t10 for one leg, or `parity` for the compare. **Row-less until 2026-08-23** |
| `mk_runfolder.sh` | `325606dbb7f8d6e76e13275733928131` | `qa/mk_runfolder.sh` — **NEW 2026-09-09.** Builds the whole run folder from a clone: flattens `qa/qa-baseline/` onto `qa/`, derives both legs, and creates the two untagged aliases. **Rowed because it is a harness file** (§G), on the same footing as `mk_testable.sh` and `run_all.sh` above — and unlike a control script, it changes when the run layout changes, so a row protects something. ⚠ **It lives at `qa/`, not `qa/qa-baseline/`**, because it reads from both. ⚠ **It landed at `100644`** — see the ops-upload block below |
| `qa/harness/package.json` | — **repo-only** (never pooled: `mk_runfolder.sh` runs from a clone) | `qa/harness/package.json` — **NEW 2026-10-12** (ops, E-29 (i)). The suite harness's top-level versions, exact. Installed into a run folder by `mk_runfolder.sh` with `npm ci`; NOT the app build scaffold. |
| `qa/harness/package-lock.json` | — **repo-only** | `qa/harness/package-lock.json` — **NEW 2026-10-12.** The whole harness tree locked: 184 packages, v6.07's run entry for entry. Move a version only with a full run, the pair together. |
| `census.cjs` | `82148eb7761468e29c96ee319dcdd92a` | `qa/tools/census.cjs` — Parser-based site census — the sanctioned answer to "how many sites?" (§B1), never a grep. Tested by `t21` |
| `funcmap.cjs` | `2630c96947b474889062d239a742f203` | `qa/tools/funcmap.cjs` — Function-range index over the source. Tested by `t21` |
| `diverge.cjs` | `f05523da96cd03ef519c873c18167e39` | `qa/tools/diverge.cjs` — AST divergence comparison. Tested by `t21` |
| `residual.cjs` | `9b250a3b825e5628d07eb9d88738107d` | `qa/tools/residual.cjs` — Taxable-residual expression finder. Tested by `t21` |
| `package.json` | `9ee8d745bc9f32d6e8fa02e623603423` | `package.json` — The pinned toolchain, and a **build input** rather than a suite file — given a row 2026-08-23 for a measured reason: `npm i <pkg>` in a run folder rewrites it with resolved versions, so it drifts as a side effect of setting the folder up. That is why OPERATIONS §N3a installs jsdom with `--no-save`, and it is the drift `package_check`'s new G-1 caught on its first real use |
| `vite.config.js` | `30da5708038a1d7c97a4b06777ea8e8a` | `vite.config.js` — The Vite config, pooled under its real name. ⚠ **Corrected at v6.10:** this row read `vite_config.js` and said the pool flattens the inner dot. That was an old session mount's renaming (OPERATIONS §G), never the pool's — every Projects listing since 2026-10-08 shows `vite.config.js` — and K-8/K-12 could not see it because post-ship checks ran against a local pool copy that kept the mount's name. Vite silently ignores a differently-named config, producing a `dist/` of separate files instead of one self-contained artifact (§N1). Build input, same reasoning as `package.json` |

> ⚠ **`derive_rmd_expectations.mjs` produces figures that v5.41 did NOT ship, and this is recorded
> rather than fixed.** Two defects, both found before any code was written:
>
> 1. It adds a **dividend term** (`div = sleeve × divPct` = $420) to `nonSS`. `census.cjs` finds
>    **zero `div_y` hits** in the Roth block, and dividends are explicitly out of scope for v5.41 —
>    so its tail-year MAGI targets are $420 too high.
> 2. It allocates each year's conversion **pro-rata without gating by each spouse's ladder window**,
>    while the shipped code gates (as `_perRmd` always did). This moves the 2040 RMD by **$2,492**.
>
> Shipped v5.41 figures: **2039 MAGI $166,711 / RMD $44,991 · 2040 MAGI $168,622 / RMD $46,902.**
> The script says $167,131 / $166,550. **The script is wrong, not the code.** It was left uncorrected
> on purpose: it is the artifact the discrepancy was found in, and editing it in the session that
> found it would erase the evidence. Correct it with the `div_y` release, and check the corrected
> allocation against a second household.

## Prior build (the regression comparison baseline)

| Field | Value |
|---|---|
| Version | **v6.16** |
| Source file in knowledge | — **not pooled**: repo history, commit `13b281a`, found by this md5 |
| Source md5 | `dfc07ee74ad9dd52c0925f54bee0a682` |
| Built `index.html` md5 | `765cd89f6c5d97a937f2fa2e7405ee64` |

> **Rolled 2026-10-16 at the v6.17 ship.** The pair is now **v6.16 prior / v6.17 current**; both tables rolled in one edit (K-7, which counts 617 − 1 = 616).
>
> **Rolled 2026-10-16 at the v6.16 ship.** The pair is now **v6.15 prior / v6.16 current**; both tables rolled in one edit (K-7, which counts 616 − 1 = 615).
>
> **Rolled 2026-10-16 at the v6.15 ship.** The pair is now **v6.14 prior / v6.15 current**; both tables rolled in one edit (K-7, which counts 615 − 1 = 614).
>
> **Rolled 2026-10-15 at the v6.14 ship.** The pair is now **v6.13 prior / v6.14 current**; both tables rolled in one edit (K-7, which counts 614 − 1 = 613).
>
> **Rolled 2026-10-15 at the v6.13 ship.** The pair is now **v6.12 prior / v6.13 current**; both tables rolled in one edit (K-7, which counts 613 − 1 = 612).
>
> **Rolled 2026-10-14 at the v6.12 ship.** The pair is now **v6.11 prior / v6.12 current**; both tables rolled in one edit (K-7, which counts 612 − 1 = 611).
>
> **Rolled 2026-10-14 at the v6.11 ship.** The pair is now **v6.10 prior / v6.11 current**; both tables rolled in one edit (K-7, which counts 611 − 1 = 610).
>
> **Rolled 2026-10-13 at the v6.10 ship.** The pair is now **v6.09 prior / v6.10 current**; both tables rolled in one edit (K-7, which counts 610 − 1 = 609).
>
> **Rolled 2026-10-13 at the v6.09 ship.** The pair is now **v6.08 prior / v6.09 current**; both tables rolled in one edit (K-7, which counts 609 − 1 = 608).
>
> **Rolled 2026-10-12 at the v6.08 ship.** The pair is now **v6.07 prior / v6.08 current**; both tables rolled in one edit (K-7, which counts 608 − 1 = 607).
>
> **Rolled 2026-10-12 at the v6.07 ship.** The pair is now **v6.06 prior / v6.07 current**; both tables rolled in one edit (K-7, which counts 607 − 1 = 606).
>
> **Rolled 2026-10-12 at the v6.06 ship.** The pair is now **v6.05 prior / v6.06 current**; both tables rolled in one edit (K-7, which counts 606 − 1 = 605).
>
> **Rolled 2026-10-12 at the v6.05 ship.** The pair is now **v6.04 prior / v6.05 current**; both tables rolled in one edit (K-7, which counts 605 − 1 = 604).
>
> **Rolled 2026-10-11 at the v6.04 ship.** The pair is now **v6.03 prior / v6.04 current**; both tables rolled in one edit (K-7, which counts 604 − 1 = 603).
>
> **Rolled 2026-10-10 at the v6.03 ship.** The pair is now **v6.02 prior / v6.03 current**; both tables rolled in one edit (K-7, which counts 603 − 1 = 602).
>
> **Rolled 2026-10-09 at the v6.02 ship.** The pair is now **v6.01 prior / v6.02 current**; both tables rolled in one edit (K-7, which counts 602 − 1 = 601).
>
> **Rolled 2026-10-09 at the v6.01 ship.** The pair is now **v6.00 prior / v6.01 current**; both tables rolled in one edit (K-7, which counts 601 − 1 = 600).
>
> **Rolled 2026-10-09 at the v6.00 ship.** The pair is now **v5.99 prior / v6.00 current**; both tables rolled in one edit (K-7, which counts 600 − 1 = 599).
>
> **Rolled 2026-10-09 at the v5.99 ship.** The pair is now **v5.98 prior / v5.99 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.98 ship.** The pair is now **v5.97 prior / v5.98 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.97 ship.** The pair is now **v5.96 prior / v5.97 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-08 at the v5.96 ship.** The pair is now **v5.95 prior / v5.96 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-07 at the v5.95 ship.** The pair is now **v5.94 prior / v5.95 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.94 ship.** The pair is now **v5.93 prior / v5.94 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.93 ship.** The pair is now **v5.91 prior / v5.93 current** (there is no v5.92); both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-06 at the v5.91 ship.** The pair is now **v5.90 prior / v5.91 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-02 at the v5.90 ship.** The pair is now **v5.89 prior / v5.90 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-02 at the v5.89 ship.** The pair is now **v5.88 prior / v5.89 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-01 at the v5.88 ship.** The pair is now **v5.87 prior / v5.88 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-10-01 at the v5.87 ship.** The pair is now **v5.86 prior / v5.87 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-30 at the v5.86 ship.** The pair is now **v5.85 prior / v5.86 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.85 ship.** The pair is now **v5.84 prior / v5.85 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.84 ship.** The pair is now **v5.83 prior / v5.84 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.83 ship.** The pair is now **v5.82 prior / v5.83 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-29 at the v5.82 ship.** The pair is now **v5.81 prior / v5.82 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-27 at the v5.80 ship.** The pair is now **v5.79 prior / v5.80 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-24 at the v5.76 ship.** The pair is now **v5.75 prior / v5.76 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-23 at the v5.75 ship.** The pair is now **v5.74 prior / v5.75 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-21 at the v5.74 ship.** The pair is now **v5.73 prior / v5.74 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-15 at the v5.73 ship.** The pair is now **v5.72 prior / v5.73 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-15 at the v5.72 ship.** The pair is now **v5.71 prior / v5.72 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-14 at the v5.71 ship.** The pair is now **v5.70 prior / v5.71 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-11 at the v5.70 ship.** The pair is now **v5.69 prior / v5.70 current**; both tables rolled in one edit (K-7).
>
> **Rolled 2026-09-10 at the v5.69 ship.** The pair is now **v5.68 prior / v5.69 current**; both tables rolled in one edit (K-7).
>
> *(Superseded, retained:)* **Rolled 2026-09-10 at the v5.68 ship.** The pair is now **v5.67 prior / v5.68 current**; both tables rolled in one edit (K-7).
>
> *(Superseded, retained:)* **Rolled 2026-09-07 at the v5.66 ship.** The pair is now **v5.65 prior / v5.66 current**. ⚠ This
> table is what `package_check` **K-7** reads, and rolling the Current table WITHOUT rolling this one
> leaves K-7 red with *"Prior is not exactly one release below Current"* — which is what happened on
> the first packaging attempt of v5.66 and is why K-7 exists. Roll both tables in the same edit.
>
> *(Superseded, retained: rolled 2026-09-05 at the v5.65 ship, when the pair was v5.64 / v5.65.)*
>
> *(Kept from the previous roll, because the lesson is the table's own.)* ⚠ **This table was missed on the first pass of the v5.64
> release's packaging and `package_check` K-7 caught it** — the Current table was rolled to v5.64
> while Prior still read v5.62, which is a two-release gap and exactly the both-tables-drift shape
> K-7 exists to catch. It is the fourth time a build table has gone stale in packaging.

> **Rolled 2026-09-03 at the v5.62 ship**, in the same pass as the Current table above — which is
> now asserted by `package_check` **K-1..K-9**, built in the 2026-09-03 ops package after this
> document was left stale at the v5.61 ship.

> **Rolled 2026-09-03 in the post-v5.61 ops package.** Both hashes verified against a fresh clone at
> `8bd0282` and against the pool.
> ✅ **D-4 IS NOW BUILT — `package_check` section K.** The warning that stood here for eleven
> releases is discharged, but **not in the form it was written**. It said "nothing compares the
> manifest's two build tables" and proposed a one-line assertion. That assertion is **K-7**, and
> **it does not fire on the defect that motivated building it**: at v5.61 neither table rolled, so
> Current v5.60 / Prior v5.59 stayed mutually consistent and every internal-coherence check passed
> while the manifest described the wrong build. K-1 through K-6, K-8 and K-9 anchor this document to
> EXTERNAL truth — the clone's CHANGELOG, its source and artifact, and the pool's actual contents —
> and those are the ones that fire. **K-7 ships labelled WEAK and must never be the only guard.**

> **Rolled 2026-09-02 at the v5.60 ship.** Both hashes verified against a fresh clone at `b25af32`
> and the pool before this edit, and the built hash independently by rebuilding v5.59 from its own
> source (§N3a) — it reproduced exactly.
> ⚠ **This table still has no automatic check against the Current table above.** It read v5.51 for
> seven ships and was caught by eye at v5.59. A one-line `package_check` assertion would close it;
> it was raised as v5.60 decision **D-4** and deliberately deferred, because the tool that verifies
> releases should not change in the zip it verifies. **It remains an open ops item**, and this is
> the tenth release in which the gap is recorded rather than fixed.

> **Rolled 2026-09-02 at the v5.59 ship — and it had read v5.51 / `3cf497b8…` since the v5.49 pass
> below, through seven ships that each rolled the Current table above.** Both hashes were
> verified against a fresh clone at `2e6336a` and the pool before that edit.

> **Rolled 2026-08-25 at the v5.49 ship, in the same pass as the Current build table above.**

> **Rolled 2026-08-23 at the v5.47 ship, in the same pass as the Current build table above.** Both
> tables were compared against a fresh clone AND against the pool before the edit was considered
> done, and the outgoing version string was grepped for afterwards. Rotation removed
> `DangerClose-v5_45.jsx` and `dom_entry_v545.jsx`; the pool holds exactly `DangerClose-v5_46.jsx`
> and `DangerClose-v5_47.jsx`.
>
> **Superseded — rolled 2026-08-21 at the v5.42 ship, in the same pass as the Current build table above** — and
> this time the two build tables were compared against the pool as part of the §A2 sweep rather than
> after it, which is the gap the eighth instance below exposed. Both source hashes here were verified
> against a fresh clone of the committed tree.
>
> ⚠ **Rolled 2026-08-20 — EIGHTH instance of this table going stale.** It read **v5.38 /
> `DangerClose-v5_38.jsx` / `b8d12481…`** while the pool held `DangerClose-v5_39.jsx`, so the row
> named a file that does not exist — the same failure as the seventh instance below, which named
> `DangerClose-v5_37.jsx` after rotation removed it. Found on 2026-08-20 **after** a full §A2
> clone-and-diff had reported the hash table clean: that session verified all 44 hash rows against
> pool and clone and never compared these two build tables to the pool at all. **The §A2 sweep does
> not cover the build tables unless you make it.** Verified now against both: the pool holds exactly
> `DangerClose-v5_39.jsx` at `7070018f…`, matching the v5.39 CHANGELOG provenance line.

> **Rolled 2026-08-18 (v5.39 ship).** Both build tables and the §A2 hash rows were rolled together
> in one pass, and this file was searched end-to-end for the outgoing version string before the edit
> was considered done. Verified against a fresh clone of the committed tree, not against session state.
>
> **History of this table going stale — read before the next roll.** At the v5.38 ship it was left
> reading v5.36 while the pool held v5.37 (sixth instance of "roll the whole file or none of it",
> E-14/E-18). It was corrected earlier on 2026-08-18, and then at the v5.39 ship **it went stale again
> in the same way**: the pool files were rotated correctly and this file was not touched, leaving the
> Prior build row pointing at `DangerClose-v5_37.jsx` — a file the rotation had just removed, so the
> row named something that did not exist. Seventh instance.
>
> **The pattern is now unambiguous: rotating pool files and rolling this manifest are two separate
> acts, and the second is the one that gets skipped.** Treat the ship as incomplete until
> `grep -c "v5\.<outgoing>" PROJECT_KNOWLEDGE_INDEX.md` returns only the intended historical hits.

This is the immediately-prior shipped release. The regression suite diffs current against it.
It exists in knowledge ONLY as that comparison baseline. When the next release ships, it rolls
OUT (see the rotation in POST_BUILD_CHECKLIST.md) — its full history lives permanently at its
commit history, so nothing is lost. (This project does not use git tags — see OPERATIONS.md §G. From v5.12 forward each CHANGELOG entry ends with a provenance line carrying that release's source and built md5s; for earlier releases, identify a retired source by reading it out of the commit that shipped it.)

**Exactly two `.jsx` files live in knowledge at once: current + prior. Never a growing pile.**

---

## Everything else in knowledge (single-and-current — no version suffix)

These are refreshed in place when they change; git holds their history.

| File | What it is | Refresh when |
|---|---|---|
| `CHANGELOG.md` | Cumulative release log, newest first | every release |
| `METHODOLOGY.md` | Modeling methodology | releases that change modeling (**updated at v5.12** — per-spouse RMD/survivor section now states which engines implement it; two survivor-year simplifications and one IRMAA limitation disclosed). **Corrected at v5.49** — the SSA-44 passage named five of the eight life-changing events and said the list *"includes"* them; it now states there are **eight** and that the list is **closed** (20 CFR 418.1205), and that a Roth conversion, a capital gain and a home sale are none of them. ⚠ **This file is now a TEST INPUT**: `t31` reads it, so an edit here that drops a key phrase turns a suite red |
| `TESTING.md` | Suite description + counts | when the suite changes. **v5.49: 2,559 app checks, 0 failing** (prior leg 939 · current leg 942 · parity 10 · feature run once 668) · tooling 82 · **2,641 total** · `smoke_built` 16/16. Totals computed from suite output, never restated |
| `README.md` | Repo/setup README | when it changes |
| **Test files — enumerated, never elided.** A range written as "t1 … t9" hides whatever sits inside it; `t10` was invisible for exactly that reason. Every file gets its own line. | | |
| `t1_units.mjs` | Units & statics (asserts the four in-app version strings — a stale bump fails here). **+16 at v5.33:** the `taxableGainPct` field and its default, the `taxableGainShare` export, a nine-case clamp table hand-verified input by input, and **AST** checks that the accessor is defined once and called by NOBODY. The call-site check is deliberately an AST node count, not a line match — two of the three textual occurrences at v5.33 are comments | when tests change |
| `t2_engines.mjs` | Engines + **cross-version MC parity** (`compare` must stay **9/9** *(10/10 since v5.48 — the `stateTax` key; corrected at the census of 2026-10-08)* — it was 8 until the E-15 addendum of 2026-08-14, which added the premium-positive ACA household). Carries TWO fingerprint households: the original derives from `PORTFOLIO()`/`PLAN_TIMELINE()`, the ACA one is **fully explicit and must stay that way** so example-data changes cannot silently rewrite the fingerprint | when tests change |
| `t3_roth.mjs` | Roth engine | when tests change |
| `t4_dom.mjs` | 26-tab DOM walk. **+17 at v5.24:** extinction assertions on the corrected Withdrawal Priority 1 copy and the Field Manual. The six manual checks read the iframe `srcdoc` attribute, NOT `textContent` — `DOCS_HTML` reaches the DOM only through `<iframe srcDoc>`, so a textContent read passes vacuously on both builds. Negative-controlled at 15/17. **+17 at v5.33:** the embedded-gain panel in My Data — render, label copy verbatim, Save & Apply write-through, clamping. **INVERTED and GATED PER LEG at v5.36** (210 current / 199 prior): the v536 leg asserts the in-use copy, the brokerage-scoped label (scope §9), the share-0 disclosure, the E-16-fixed footnote, and EXTINCTION of the recorded-not-used and %-of-taxable-pool copy; v533–v535 legs keep asserting the copy their builds are true to, and the prior leg GAINS one assertion pinning its $0-gains footnote. Re-query the input after every save — React replaces the node and a held reference types into a detached element | when tests change |
| `t5_storage.mjs` | Persistence / storage contract (incl. the 13-key Clear-All wipe loop). **+14 at v5.33 (group E):** `taxableGainPct` persists through Save & Apply, restores as 0 from a simulated pre-v5.33 backup that lacks it, normalises an unparseable value to 0, survives a backup-bytes round trip at a user-set 40, and is clamped by the accessor at an out-of-range 200. The bytes round trip is JSON, not the Export button: `handleExport` serialises `buildPortfolio()` — the FORM state — so driving the real button after mutating the module global exports the old value. `t4` owns the control-driven half | when tests change |
| `t6_single.mjs` | Single-filer branch | when tests change |
| `t7_accrual.mjs` | Contribution accrual (v5.10 feature suite, 41). **v5.37: E-17 sweep** — object dobs converted to the strings the run resolves to; measured no-op (stdout byte-identical; the arithmetic is retireYear-driven) | when tests change |
| `t8_invariant.mjs` | Invariants; reads canonical `DangerClose.jsx` from the run-folder root | when tests change |
| `t9_dom_smoke.mjs` | DOM smoke (fast environment validation — run this first to prove the toolchain) | when tests change |
| `t11_survivor_rmd.mjs` | Survivor RMD / filing-transition suite — **40 checks**. DOM-read at ±$500 (OPERATIONS §M); its header carries the two honesty notes on precision and on the effect size that makes that band adequate | when tests change |
| `t12_engineD_survivor.mjs` | Engine D survivor suite — **23 checks**, module-level and dollar-exact. ⚠ **Release (c) of the `otherAccounts` plan moves Engine D's balances, so this is the suite that must be re-verified case by case there** | when tests change |
| `t13_engineC_irmaa.mjs` | Engine C IRMAA survivor extinction invariant (C-2C-5, v5.13) — 42 checks, three omissions, both directions, plus a person-count isolation case | when tests change |
| `t14_cross_engine_survivor.mjs` | Cross-engine survivor SS invariant (decision D-5) — **44 checks**; the only cover for Engine A is structural, and the file says so. **D-4 addendum 2026-08-14:** source windows are **bounded** (anchor → start of the next top-level function), not fixed character spans — a span ages as the engine grows around the rule and then fails looking like an app regression. Both bounds asserted unique; a missing end marker fails loudly, never falls back. ⚠ **From v6.12 (C-5) Engine D HAS a filing concept**, and the check moved as this row said it must: Engine D is in `filingEngines`, and its window must hold exactly ONE `yr > _deathYr1D` (the filing switch) and both `>=` death guards — a weakened guard still fails (negative-controlled at the v6.12 build). Through v6.11 it asserted the absence of any `>` | when tests change |
| `t16_roth_ladder_filing.mjs` | Roth ladder filing-status extinction invariant (C-2B-3, v5.15) — 24 checks against an independent IRS reference, incl. that the couple's ladder does NOT move | when tests change |
| `t17_engineC_exact.mjs` | Engine C dollar-exact (v5.18) — **74 checks at v5.36** (+11: the `gainByYr` consumption block — exact MAGI and headroom pass-through, tier climb, default equivalence; control C9 fires 5 of them). Originally 63 checks against CMS figures via the module-level `computeIrmaaPlan`; tier borders ±$1, indexation, freeze, lookback, per-person counts, survivor switch, QCD. Negative-controlled at 23/63. Asserts the surcharge constants' ≤$5 **bound**, not CMS-exact amounts | when tests change |
| `t18_engineB_exact.mjs` | Engine B dollar-exact (v5.21) — **67 checks at v5.36** (+17: the `gainByYr` consumption block, hand-exact — $10K gain → MAGI +$10,000, ordinary tax +$0, LTCG +$1,500, NIIT +$380, total +$1,880 — and the E-16 provisional-income fix pinned at the 85% statutory cap; controls C8 and C12 fire it). The v5.21 note 'NOT yet covered: LTCG, NIIT' no longer holds — both are exercised by the gain path. Originally 50 checks via module-level `computeTaxPlan`; federal brackets, age-65 extra per spouse, SS taxability, **plus the first Engine A vs Engine B agreement invariant** (they agree). Negative-controlled at 24/47. NOT yet covered: LTCG, NIIT, AMT, FICA, state, survivor | when tests change |
| `t19_engineD_exact.mjs` | **65 checks at v5.37** (+8): two exact pins (mixed-household lifetime MAGI $3,162,820 — the ordinary growth recognised, was $3,132,746 — and lifetime gain $89,673 UNCHANGED, the census-verified blast-radius witness), an in-suite INDEPENDENT LEDGER (own IRS Pub 590-B divisor table) that must reproduce the published pool/sub-pool/gain/basis to the cent every year before its report is trusted, and the §8-3 conservation report (one-sided `taxOrd + taxGainPool ≤ taxable` all years; the growth cap binds ZERO years — control C13 fires it). Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. ⚠ The pin needed a **purpose-built household** — two earlier drafts written against `t19`'s own fixture asserted nothing, because `drawNeeded` exceeds `rmd_y` in every year of that schedule, so every taxable draw it makes is genuine. The defect requires guaranteed income large enough to cover expenses. **57 checks at v5.36** (32 at v5.35): the v5.36 block asserts the gains-bearing sub-pool as a balance to the cent — the discriminating MIXED pool (brokerage + IRA + HSA, the shipped example's own shape, E-20), a hand-computed sale, full-basis surplus banking, basis conservation, and the exact-zero exclusion comparison — and the two Engine-B/C consumption EXTINCTION scans were INVERTED in the same release the wiring landed, plus a C-specific `_gainByYrI` binding. Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. Flipped at v5.35/v5.36 as instructed. **Originally NEW at v5.23** — Engine D's first discriminating coverage. 14 checks: five structural (reachability, the 17-key return contract, determinism, parameter purity) and eight fixture/pinned. Three dated `[KNOWN DEFECT]` pins (taxable pot == all of `otherAccounts`; `magi` omits taxable draws; named-IRA money never reaches the RMD balance). Negative-controlled twice — 12/13 and 11/13. Not yet dollar-exact; that is release (b)/(c) work. **AMENDED at v5.24:** the B-2 pin was re-tagged `| rel c` and reworded. It previously read "Engine D magi omits drawFromTaxable" tagged `rel b`, which named something that is CORRECT and instructed the next session to introduce a defect. The assertion itself was right and is unchanged. Repo `qa/` |
| `domdiff_withdrawal.mjs` | **Re-pointed and RE-SCOPED at v5.37 to v5.36 → v5.37, 29 checks: ALL THREE tabs at STRICT IDENTITY** — Taxes/IRMAA because the census shows v5.37 cannot reach Engines B/C, the Withdrawal tab because lifetime MAGI rises $3,333 on the example household but never crosses a bracket edge (measured — inverting the session's own stop-report prediction). The identity form still witnesses the call sites (a dead site on either leg desynchronizes the figures and fails loudly — C10/C11 verified against it); the release's divergence witness lives at the engine level (t19/t20 pins) per E-20. Historically: **re-pointed and re-scoped at v5.36 to v5.35 → v5.36, 26 checks**: the Withdrawal tab returns to STRICT IDENTITY (the v5.36 tracker is bookkeeping on an unchanged schedule — measured, inverting the session brief's premise), and NEW Taxes/IRMAA sections assert figures-only-region divergence — the ONLY witness that the app's call sites pass `gainByYr` (every suite calls the engines directly). Those regions are anchored PAST all changed copy because the naive whole-tab form was satisfied by copy alone and its control did not fire (E-20); controls C10/C11 now fail exactly the two witness checks. Historically: re-pointed at v5.34 to v5.33 → v5.34. ⚠ At the v5.34 build its committed default was found four releases stale (v5.29 → v5.30) and it **died at module load** looking for a bundle the run folder does not hold — a stale default here fails loudly rather than silently, but it fails as a missing module, which reads like a broken harness. Re-point it every release. Previously **re-pointed at v5.24 to v5.23 → v5.24 and grown 4 → 10 checks**. It now excises the one deliberately reworded panel BY ANCHOR and requires everything else byte-identical, rather than relaxing the comparison — and separately asserts the panel did change and that only the prior build carries the false claim. **It hardcodes its default version pair; re-point it every release.** Originally new at v5.23, v5.22 → v5.23. **This is the proof the hoist changed nothing**, because the pre-existing suite does not discriminate on Engine D (OPERATIONS §B2). 4 checks; cross-version by nature, so NOT counted in the release headline. Repo `qa/` |
| `t21_tools.mjs` | **NEW 2026-08-11** — tests the `qa/tools/` parser toolkit itself against a fixture with hand-counted known answers. **56 checks, negative-controlled eleven ways** (the original six, plus five in `controls_t21_censusp1.sh`). ⚠ **It covers FOUR of the sixteen acorn-parsing tools in `qa/tools/`, and Section F is a pin, not a fifth** — `TESTING.md` names the twelve it does not reach and why. Counted SEPARATELY from the app total: it verifies tooling, not the build. Carries one dated `[KNOWN DEFECT]` pin — `census.cjs` double-reports object shorthand and export specifiers, so its "hits" exceed its site count. Repo `qa/` |
| `tools_fixture.jsx` | **NEW 2026-08-11** — the fixture `t21` reads. **NOT AN APP SOURCE**: never built, never imported, never version-bumped, and it does NOT count toward the "exactly two `.jsx` app sources" rule. Repo `qa/tools/fixture/fixture.jsx`; knowledge is flat so it lives here under this name, and `t21` resolves either. Line numbers are load-bearing — add cases at the END only |
| `t22_aca_floor.mjs` | **75 checks at v5.34** (was 64): group H unit-tests the shared `realizeGain` rule directly, including that selling alone never moves the gain share — chosen over comparing two engines' figures and hoping agreement implies a shared rule. Run it as `node t22_aca_floor.mjs v533`; its committed default is still `v532`, unrolled. **NEW at v5.32** — the ACA 100%-of-FPL eligibility floor. **Was 64 checks** in seven groups: the floor as an `[EXTINCTION]` set in BOTH regimes; regime symmetry; the boundary hand-computed to the cent from HHS/ASPE and Rev. Proc. 2025-25 typed independently; the drift case; Engine A end-to-end on a household crossing the floor twice at two depths; **group F, the cross-version byte-identity check on `acaSubByYr`/`totAcaLoss`/`estate`**; and five negative controls, all firing. ⚠ **Group F exists because parity is blind here** — `t2`'s fingerprint household is `acaPremium: 0`, so no ACA code runs inside the guardrail at all (E-15). Do not delete it as redundant; the file's header says so too. Group F reads the PRIOR leg's bundle and defaults to **`v532` at v5.33** (rolled forward, like `t2`'s parity pair). ⚠ **Rolling that default is not sufficient on its own.** Group F mixes claims true for ANY pair (byte identity) with one true for a SINGLE transition — *"acaFloorYrs is NEW"*, which is false once the prior build is v5.32. That check is now **gated on the prior tag**, so the suite holds at 64 on either pairing. The rotation forces the roll: v5.31 left knowledge at v5.33, so `app_v531.mjs` can no longer be built from knowledge alone. Repo `qa/` |
| `t23_roth_ladder_rmd.mjs` | Roth ladder RMD term (v5.41). MAGI at ±$500 (§M component-inline ceiling), RMD cards dollar-exact. Gated per leg. **Unchanged in substance at v5.42** — only the version registry moved; its 25/25 on both legs is the evidence that release did not overreach | when tests change |
| `t24_ss86_phasein.mjs` | **NEW at v5.42.** The §86 upper-tier phase-in. ⚠ **DRIVES THE CONVERSION SLIDER** through the native `HTMLInputElement` setter — the defect is worth $0 at the $70,000 default, so default-position assertions prove nothing about it. Five positions × 12 years against `statute86`, computed not hardcoded. Gated per leg (38 v542 / 34 v541). §D tests the shared §86 helper from v5.77 (it tested a dead transcription v5.45–v5.76) | when tests change |
| `hand_86.mjs` | **The §86 statutory oracle**, transcribed from 26 U.S.C. §86 at law.cornell.edu and NOT from any app expression. Imported by `t24` and by `qa/tools/derive_v542.mjs` — one oracle on both sides, deliberately. ⚠ Its three embedded app copies are **v5.40 transcriptions and now history**. Asserts nothing; counted in no total. Repo `qa/tools/` | when the statute or the app copies change |
| `controls_source.sh` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) — The source-level control harness. **Replaces `controls_v542.sh`, DELETED from both destinations 2026-08-23** — the same rotation `controls.sh` got at v5.42, for the same reason: keeping both invites someone running the dead one. Version deliberately absent from the name |
| `t20_other_taxtype.mjs` | **100 checks at v5.37** (+1): the exact E2 pin moved $600,000 → **$724,266** (the balance plus its growth — derived by the independent simulator BEFORE the engine edit, matched to six decimals) and a new **E-15 EXTINCTION** (the ordinary excess must EXCEED the opening balance). The trad−annuity exact-0 pin survived the edit at 0.000000 and is documented as REGIME-BOUND (full pool exhaustion) in the fixture. E-17 closed: the dobs are now the strings the run resolves to (1964-01-01/1966-01-01), measured value-identical across all five engines and all eight households. Historical: **NEW at v5.25** — the Other-accounts `taxType` schema, its migration, and the extinction assertion that no engine reads the field. 94 checks. The extinction check is a **permutation test**: the same household runs twice with every type flipped and all five engines must return byte-identical output — so it fires the moment release (c) starts reading the field. Also carries the required equality that inference over the example household reproduces the $111,000 / $21,000 / $15,000 split v5.24 published. Negative-controlled five ways; two of its own assertions were caught passing vacuously on v5.24 and now assert a precondition first. Repo `qa/` |
| `dom_entry_v552.jsx` | Harness entry for the v5.52 CJS DOM bundle (**prior** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `dom_entry_v553.jsx` | Harness entry for the v5.53 CJS DOM bundle (**current** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `dom_entry_v546.jsx` | Harness entry for the v5.46 CJS DOM bundle (**prior** leg). Repo `qa/qa-baseline/` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `runsuite.sh` | **NEW at v5.36 — adopted from session tooling.** Runs both legs, parity, feature suites and tooling, and PARSES every total from suite output (the honesty standard: totals are computed, never restated). A suite printing no count with a non-zero exit reports DIED, not 0/0. Repo `qa/` |
| `capture_gain_fp.mjs` | **Probe, not a suite — asserts nothing and is counted in no total.** Captures a full-precision fingerprint of every engine that touches the realized-gain rule, which is how `realizeGain`'s extraction was proven a behaviour no-op before any behaviour changed (OPERATIONS §M pattern). Repo `qa/` |
| `probe_withhold_gain.mjs` | **NEW at v5.34. Probe, not a suite — asserts nothing and is counted in no total.** Reproduces the measurement behind the v5.34 copy correction: under `convTaxFunding: "withhold"` it runs Engine A at three conversion sizes and two declared gain shares on both legs, showing that a residual bill reaches the brokerage and is taxed. Run it as `node probe_withhold_gain.mjs ./app_v534.mjs`. Repo `qa/` |
| `SCOPE_OPS_PROCESS_FIX.md` | *(new 2026-08-26)* | `docs/SCOPE_OPS_PROCESS_FIX.md` — ☑ **RETIRED: BUILT AND SHIPPED 2026-08-26** as an ops package against v5.51. `OPERATIONS.md` §A0/§I/§L. ⚠ Its §0 records that the finding which motivated it — "8 of 11 scopes missing retirement notes" — was **wrong**, and why; kept as an instance of §A0. The suite check it proposed was deliberately NOT built — see its §3 before re-proposing one *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_D9_HEIR_RATE_DISCLOSURE.md` | *(new 2026-08-26)* | `docs/SCOPE_D9_HEIR_RATE_DISCLOSURE.md` — ☑ **RETIRED: BUILT AND SHIPPED AS v5.51.** All four decisions resolved as recommended. Carries a retirement note; its §1–§2 describe v5.50 and are history, not current state *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `ASSESSMENT_HEIR_RATE.md` | *(new 2026-08-26)* | `docs/ASSESSMENT_HEIR_RATE.md` — **un-pooled 2026-10-11, repo-only** (removed from the pool that day; recorded by the ops package of 2026-10-11, second). ☑ **ACTED ON at v5.51.** ⚠ **SUPERSEDED IN PART:** shipped unannotated in the very release that fixed it, and its §8 Option 1 recommends moving `HEIR_RATE` into `TAX_CONSTS` — the option that was examined and REJECTED. Annotated in place 2026-08-26. §3–§7 (the law, the measured rates, the flip point) stand |
| `SCOPE_D7_ESTATE_DISCLOSURE.md` | *(new 2026-08-26)* | `docs/SCOPE_D7_ESTATE_DISCLOSURE.md` — ☑ **RETIRED: BUILT AND SHIPPED AS v5.50** *(was: ALL FOUR DECISIONS RESOLVED 2026-08-26 — BUILDABLE as v5.50.** D-1: narrow the label to `MAX ESTATE AFTER HEIR INCOME TAX`. ⚠ **D-2 decided AGAINST the recommendation — the clause names NO state and NO threshold**, because a clause quoting Oregon's $1M is a clause that goes stale, and Oregon's SB 1511 was already pending. The scope's §1 figures are rationale, **not copy**. ⚠ Nothing in `qa/` asserts the objective label today (zero hits) — the narrowed label must be pinned in `t1` STATIC or it can silently revert. Premise verified against **v5.49** source. The comparator's estate figure (L4251) contains **no estate or inheritance tax of any kind** — `HEIR_RATE` 0.22 is an heir *income* tax on Traditional only. It is the **DEFAULT ranking objective** (L5386) and is labelled **"MAX AFTER-TAX ESTATE"** (L9518), a phrase that asserts the very thing that is untrue. ⚠ **Worse than D-6 was: NEITHER half exists** — `METHODOLOGY.md` has zero mentions of estate tax, the Field Manual has zero, and the only in-app estate limitation text (L10786–10789) is gated to `single`, so a **couple never renders it**. Direction **OPTIMISTIC**. Disclosure-only; no engine change. Reuses `t31` (third key) and adds a `t4_dom` assertion with `single: false`, because a couple-blind fixture would reproduce the defect. **Four decisions open; D-1 (the "after-tax" label) is the one that matters** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| **TWO DELETIONS** *(2026-08-26)* | — | ☑ **`validation/PROJECT_KNOWLEDGE_INDEX.md` deleted** — a second copy of this manifest, referenced by nothing, frozen at v5.49 and 47 lines adrift. `OPERATIONS.md` §G now requires exactly one manifest at the repo root. ☑ **`docs/SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` deleted** — built 2026-08-20, never retired, missed by the sweep below. Its outcome survives: `CHANGELOG.md` carries the entry and four suites still assert the invariant; only the decision record is gone. ⚠ **Delete it from the knowledge pool too** — §G, deletion is a three-place operation |
| **SCOPE-RETIREMENT SWEEP** *(2026-08-26)* | — | ⚠ **Seven `SCOPE_*.md` were built-and-shipped while still advertising themselves as open; all seven are now RETIRED.** `FIX_realized_capital_gains_v5_32` (shipped **v5.36**, said *"Ready to build"* — 13 releases), `FIX_docs_v5_39` (**v5.39**, said *"do not build"*), `FIX_roth_tab_rmd_magi` (**v5.41**, said *"not yet built"*), `ENGINE_C_SS86` (**v5.43**, said *"Buildable"*), `ITEMS_3_6_perRmd` (**v5.44**/**v5.47**, said *"NOT BUILDABLE — two blocking"*), `ENGINE_B_ROTH_HALF_CAP` (**v5.45**, said *"both blocking"*), `ROTH_TAB_MAGI_MEASUREMENT` (fulfilled). ⚠ **Two said DO NOT PROCEED about shipped work.** ⚠ **This file already knew:** its own rows called `ENGINE_C_SS86` *"fulfilled at the ship"* and `ITEMS_3_6_perRmd` shipped — while those scopes said otherwise, and nothing compared them. Still genuinely open: `SCOPE_STATE_FIXTURES.md` (awaiting §5 decisions). *(This row also named `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` — **built**, D4 open, non-blocking, and the only status line in the set that was accurate. That file was **deleted 2026-08-26**; its open D4 is re-homed as `MissingFeatures.md` **D-10**, and the file itself is recoverable from git history at the commit before its deletion.)* Rule recorded in `OPERATIONS.md` §I |
| `validation/` *(repo-only, not in this pool)* | ⚠ **Audited for the first time 2026-08-25**, as the Section E remainder's `validation/` ↔ `qa/` question. **Not the release gate**; §I does not ask for it, deliberately. **Layer 1 `check_constants.mjs` is LIVE: 48 checks, 0 failing at v5.49**, each with a statutory citation, covering constants `qa/` does NOT touch (`SGL_LTCG`, `SGL_NIIT`, partial-SS count, QCD cap) — 48 passing checks that appear in no count anywhere. **Layer 2 was UNRUNNABLE** since `package.json` gained `"type": "module"`; renamed `run.js`→`run.cjs` (byte-identical) and **five of six tests now run**. ⚠ **`deep_test` CRASHES** on a moved Roth solve-for button — that directory's only modelling assertions are unchecked. ⚠ `run.cjs` is a **tenth** jsdom environment (E-6 counts nine, correct for `qa/`), never audited against §C's traps. ⚠ Open: `smoke_entry` reports 2 `/bucket|glide/i` hits — a product-vocabulary call, left for the maintainer |
| `VERIFY.sh` | — **un-pooled 2026-10-11, repo-only** (removed from the pool that day; recorded by the ops package of 2026-10-11, second). ⚠ **RETIRED 2026-08-25 at v5.49 — it no longer runs and is NOT the release gate.** It was pinned to `v537`/`v538` (**eleven releases stale**) and **`OPERATIONS.md` referenced it zero times** — a script at the repo root calling itself "release verification" while sitting outside the release process. Found during the Section E remainder sweep, not by any check designed for it. Replaced by three checks §I already required: the **full suite from a clean clone**, **`smoke_built`**, and **`package_check`**. The file is kept for its record of why each control existed, and for one caveat that outlived it (parity must run AFTER the prior leg). It prints an explanation and exits 2. ⚠ **Do not revive it by rolling the version pair forward.** Originally added to knowledge at v5.23 because it was repo/local only. Repo root |
| `t15_engineA_death_filing.mjs` | Engine A death-year filing extinction invariant (C-2C-6, v5.14) — 11 checks, **dollar-exact** (module-level engine), incl. the non-conservative high-MAGI corner | when tests change |
| `t10_taxcases.mjs` | Tax-case assertions built by the Phase 2 audit: 76 federal-core (2A) + 35 IRMAA (2B) = **163** at v5.30 (2A 76 · 2B 87 · 2D 27 · 2E 21), incl. 3 dated `[KNOWN DEFECT]` pins. **ADOPTED into `run_all.sh` at v5.14** (scope D-4); pins flipped, borders re-derived, now 115 checks | when audit phases add cases |
| `smoke_built.mjs` | The **built-artifact** suite — **16 checks** against the published single-file `index.html`, not the source: boots it, dismisses the disclaimer gate, mounts React, loads the example household, and round-trips the `window.storage` shim. Added v5.11 after a build passed every source check while being unable to save a plan | when tests change |
| `qa-baseline-README.md` | How to run the baseline suite (renamed from `qa/qa-baseline/README.md` for the flat pool). ⚠ **The `docs/qa-baseline-README.md` DUPLICATE was deleted 2026-09-07 (H-3)** — the real file is `qa/qa-baseline/README.md` and this pool copy is the flattened name, both legitimate. ⚠ **A CONSEQUENCE WORTH KNOWING:** until the deletion there was exactly one repo path with this basename, so `package_check` E-1b could resolve this pool file to a counterpart. There is now **none**, so E-1b skips it — it joins `tools_fixture.jsx` and `vite_config.js` as the three pool files E-1b is blind to **by rename** *(⚠ v6.10: the pool's name is `vite.config.js`, so that one was never renamed — the mount's name was read as the pool's)*, which is E-1b's documented `cands.length !== 1` rule and not a new defect. Recorded so nobody discovers it as a surprise | when it changes |
| **qa-baseline harness files** | `shim.txt`, `mk_testable.sh`, `env_dom.mjs`, `run_all.sh`, `cap_tabs.mjs` — the `dom_entry_*` files are listed individually above, current + prior only | when they change. NOTE (v5.10.2): stale knowledge copies were re-synced from the committed repo at that refresh. The repo is their source of truth. |
| **`qa/tools/` parser toolkit** | `funcmap.cjs` (function boundaries — line numbers move every release), `census.cjs` (identifier/property/string hits with enclosing scope chain), `diverge.cjs` (normalized-fingerprint duplicate detection), `residual.cjs` (narrow: `balance − roth − trad`; ages out after release (c)). All four named explicitly per §G — a folder reference makes them invisible. They live in `qa/tools/`, **not** `qa/`, because they assert nothing and must never be countable as checks. **Tested since v5.25 by `t21_tools.mjs` (50 checks) against `tools_fixture.jsx`**, negative-controlled six ways; one pinned defect (AST hits vs source sites) is disclosed by reporting both counts since v5.29. Census and site-count questions go through these, never greps (OPERATIONS §B1) | when the tools change |
| **build scaffold files** | `index.html` (the Vite HTML entry template), `main.jsx` (the browser bootstrap), `vite.config.js`, `package.json` — all four, per OPERATIONS §G. Without all four a session working from knowledge **cannot produce the published `index.html`** (the v5.11 failure). ⚠ **The pool held only three of the four until 2026-08-20.** `index.html` was missing — this row asserted all four for eleven releases while the pool never carried the template, and no check compared the claim to the pool because the §A2 table had no row for it either. It matters more than a missing file usually would: that template carries the entire **first-open disclaimer gate** (credentials disclosure, pessimism notice, acknowledgement checkbox), which exists **nowhere** in `DangerClose.jsx`, so a knowledge-only rebuild would have published the app with no gate. Restored at md5 `52ef2be3080352df6198ee3b8c3507ad`; `qa/smoke_built.mjs` asserts the gate renders and dismisses, so the failure would have been loud at the built-artifact suite rather than silent in production. ⚠ **`vite.config.js` is written with a DOT** — the session mount displays it as `vite_config.js`; that is a mount artifact, not the pool name (verified 2026-08-10: same file, md5 `30da5708038a1d7c97a4b06777ea8e8a`). It is the only file in the pool where the mounted name differs from the real one | when the build setup changes |
| `SITE_CENSUS_v5_10.md` | Code census (self-versioned by filename). ⚠ **Not in the pool** as of the 2026-08-20 clone-and-diff — it lives in the repo at `docs/SITE_CENSUS_v5_10.md`. Row kept and marked rather than deleted: whether the pool should carry it is the maintainer's call, and a silently-dropped row is how files become invisible | new one per feature *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_STANDING_AUDIT.md` | Reusable audit spec (not version-specific) | rarely |
| `OPERATIONS.md` | **The operational appendix, §A–§N** — freshness check, suite layout, harness traps, defect pins, parity guardrail, ship verification, storage/rotation, release checklist, packaging, instrumentation ceiling, and the `index.html` build. **Read it before any build, fix, scope, or release, starting with §A.** | when mechanics change |
| `PROJECT_KNOWLEDGE_INDEX.md` | This manifest | every refresh |

---


### ⚠ Added 2026-09-03 — pool tooling that had no manifest row

Found by the same sweep as the block in *Audit findings and scopes*. Enumerated, never elided.

| File | What it is | Refresh when |
|---|---|---|
| `controls_v562.sh` | §B2 controls for the **v5.62** cross-engine wiring fix. Six; **C1a and C1b revert the defect's two halves SEPARATELY**, because a partial fix would otherwise pass — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v564.sh` | §B2 controls for the **v5.64** income-conditioning evaluator. Ten, all firing. **Two of them are the point**: forcing every table to a single comparator (each direction), and subtracting Virginia's taper excess PER SPOUSE rather than once — an error wrong by a factor of two across the whole phase-out range and correct everywhere else, so it survives any two-sided test. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v565.sh` | §B2 controls for the **v5.65** Connecticut populate. Eleven, all firing. **Three are the point**: dropping `exclAge` so the engine's default 65 floor silently reappears (the pessimistic failure the release removes); flipping the comparator to `lte`, which is what makes the threshold pins load-bearing; and reverting the note's dividend/interest disclosure — **that one did NOT fire on first run and exposed a blind assertion in `t35`, which was repaired**. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v563.sh` | §B2 controls for the **v5.63** earned-only-FICA fix. Five, all firing (C1 11, C2a 2, C2b 11, C3 9, C4 2). **C2a and C2b simulate the two HALF-fixes** by pushing the unfiltered total back into one FICA site at a time — the engine has two sites and one source edit corrects both, so a control reverting them together proves nothing about either. It restores the pristine source on exit; **re-hash the source afterwards** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v561.sh` | §B2 negative controls for the **v5.61** RI threshold correction. Six, incl. a null control and one that falsifies the pre-fix pin on the FROZEN leg to prove the version gate is a split, not an inversion — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | per release that adds controls |
| `controls_v560.sh` | §B2 controls for the v5.60 RI/WI age-floor release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `controls_v559.sh` | §B2 controls for the v5.59 figure release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `controls_v5571.sh` | controls for `package_check` itself — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | when `package_check` changes |
| `controls_v557.sh` | §B2 controls for the v5.57 rate release — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept |
| `copylock.cjs` | §B2 disclosure-lock probe — finds assertions that pin copy a release is about to falsify | when the lock class changes |
| `lits.cjs` | literal/string extractor over the suite (§B1a) | rarely |
| `notes_probe.cjs` | AST probe pulling `STATE_RULES` note strings out of two builds and comparing | when the state-note work continues |
| `vergates.cjs` | counts version gate chains and registries — the version-bump cost (§A0: re-derive, never quote) | rarely |
| `sel_census.cjs` | `qa/tools/sel_census.cjs` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** AST census of every regex literal in the suite and tools whose pattern matches *income limit* / *income-limited* — i.e. every site that selects a state set by **executing a pattern against user-facing copy**. It is the measurement behind `SCOPE_STATE_SET_SELECTOR.md`, and it is a parser because the question is a parser question: a grep cannot tell a definition from a mention and cannot execute a regex (§B1). Asserts nothing; counted in no check total | when the selector scope is built, and per release that adds a selection site |
| `row_census.cjs` | `qa/tools/row_census.cjs` — **NEW 2026-09-08.** The parity check for `K-8`'s hash-row expression, which exists in **three** places that must agree: the gate, this file's D-5 count block, and `controls_manifest_rows.py`'s target selector. ⚠ **It is the condition on which decision D-3 was taken** — keeping this file's block pasteable rather than replacing it with a pointer was only defensible because something now checks the two copies against each other. ⚠ **Parser, not grep** (§B1): a site is admitted only if its pattern, **executed**, matches a canonical row AND encodes the extension set — a first draft required only the first and reported 35 sites, most of them generic patterns matching the specimen by accident. Exits 1 on drift, 2 if a site cannot be found — **repair it rather than deleting the site from `SITES`**, or the check goes quietly blind. `P32`'s narrower selector and `SCOPE_HOUSEKEEPING_THREE.md`'s pre-`D-C-1` copy are excluded BY NAME, as a decision (D-4, D-5) rather than an oversight. Asserts about the TREE, not the app; counted in NO check total | when `K-8`'s matcher changes, or a fourth copy appears |
| `oracle_nm.py` | `qa/tools/oracle_nm.py` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** The independent implementation of NMSA 1978 § 7-2-5.2, typed from `FINDINGS-v5_63-state-statutes.md` §2 and **never read off `STATE_RULES`** — it derives `t10`'s expected New Mexico cells without reading the figure off the thing under test, the same role `hand_86.mjs` plays for §86. ⚠ **`t10`'s own comment at L1133 names it `qa/oracle_nm.py`; the file is at `qa/tools/oracle_nm.py`** (`TESTING.md` has it right). Reported 2026-09-08, not fixed — a suite edit is outside an ops package's lane | when NM's statute changes; re-read against the primary source, never against the app |
| `oracle_va.py` | `qa/tools/oracle_va.py` — **NEW 2026-09-09.** The independent implementation of Va. Code § 58.1-322.03(5)(b) — the age deduction — typed from `FINDINGS-v5_63-state-statutes.md` §5 and **never read off `STATE_RULES`**. It reproduces the statute's three extinction points ($62,000 / $87,000 / $99,000) as a derived result rather than a transcription, which is the check that it is right. ⚠ **Its point is the once-not-twice mechanic.** It carries BOTH readings — the correct one-subtraction-against-the-combined-maximum, and the per-spouse reading the Virginia release exists to prevent — and prints which cells separate them. **Only 4 of its 15 candidate cells do.** Every single-filer cell and every one-spouse-qualifying cell is structurally incapable of catching a per-spouse defect, because at one qualifying person the two expressions are algebraically identical. ⚠ **`SCOPE_VA_POPULATE.md` §5 says to price the taper regions "in both filing columns", which reads as though the single column contributes to that proof; it cannot.** Correct that in the Virginia release | re-read against the primary source, never against the app |
| `oracle_ri.py` | `qa/tools/oracle_ri.py` — **NEW at v5.69.** Rhode Island's oracle (SCOPE_RI_POPULATE D-RI-6); prints the ten §7a cells plus two wiring cells |
| `controls_v569_ri.py` | `qa/tools/controls_v569_ri.py` — **NEW at v5.69.** 16 drift-safe negative controls for Rhode Island's table, the inverted guards, the note and the Field Manual lock; 16 met expectation at the build. Unrowed by class, like `controls_v568_va.py` | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder)
| `controls_v566_nm.py` | `qa/tools/controls_v566_nm.py` — **NEW at v5.66. Row added 2026-09-08, one package late (K-9).** §B2 negative controls for the v5.66 New Mexico block: eight, C0 silent and C1/C1b/C2–C7 all firing. ⚠ **Drift-safe by construction, and that is the point** — it never edits the canonical source; each mutant is written to a throwaway tag from a pristine read, because the v5.66 session-2 control run died between applying a mutation and restoring it and poisoned the baseline so a later control read as NOT firing. It prints the canonical md5 before and after regardless, and reports an unmatched anchor as a **FINDING rather than a skip**. **The pattern to copy for any new control harness** — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder) | historical; kept (§G — controls do not rotate) |
| `controls_v568_va.py` | `qa/tools/controls_v568_va.py` — **NEW at v5.68.** §B2 negative controls for Virginia and the `t29` F-6a/F-6b repair: seventeen, all meeting their stated expectation. C0 silent; C1–C10 mutate the VA table, the evaluator (C8, per-spouse) and the note; T1–T6 mutate the D-3c selector's two copies, the fixture and F-6a/F-6b themselves. ⚠ **T5 EXPECTS SILENCE** — it restores the v5.67 vacuous form against an interior change, reproducing the defect on purpose. Drift-safe: builds every mutant in a scratch copy of the run folder; canonical md5s printed before and after. Deliberately unrowed in the hash table — see the D-3 note | — **un-pooled 2026-09-28, repo-only** (release-pinned: it runs only in its own release's run folder)
| `controls_manifest_rows.py` | `qa/tools/controls_manifest_rows.py` — **NEW 2026-09-08.** §B2 negative controls for `package_check`'s **K-8** and **K-9**, the two gates that guard this file's own hash rows. Four controls plus a blind-spot demonstration: C0a/C0b are null controls, **C1** corrupts one real hash row and K-8 must fire, **C2** removes a pool file's only manifest mention and K-9 must fire. ⚠ **Every control carries a NEEDLE** — the failure line must name the file the mutation touched, so a control cannot pass on someone else's failure, which is the P32/P42 defect this project has recorded three times. ⚠ **Targets are DERIVED from the manifest and the pool, and paths come from four required arguments** — it names no hash and no filename that can be renamed away, because `package_check_controls.sh` once hardcoded paths from a dead session and printed NOT CAUGHT for every control while exiting 0. Drift-safe: each mutant is a throwaway copy built from a pristine read, and the package's md5 is printed before and after. ⚠ **`B1` is NOT a control** — it removes `dom_entry_v566.jsx`'s row and asserts K-9 stays GREEN, demonstrating the blind spot that let that row go missing | when `K-8` or `K-9` changes |

⚠ **Controls scripts do NOT rotate.** §G's rotation rule covers **app sources only** — the pool
keeps every `controls_v*.sh`. A v5.61 delivery note wrongly told the maintainer to delete
`controls_v559.sh`; the pool already held `controls_v557.sh` and `controls_v5571.sh`, which
contradicted the instruction. `dom_entry_*` DOES rotate, and `package_check` J-4 asserts it.

⚠ **REWRITTEN 2026-09-08 (second build package). Half of this note's reasoning has EXPIRED and the
other half has not** — recorded this way rather than replaced, because the expired half is the whole
argument for the release that expired it.

**`oracle_nm.py` IS NOW ROWED** (decision D-2 (c) of `SCOPE_K8_ROW_MATCHER_PY.md`). `K-8`'s matcher
was widened to `py` in the same release, so the row is checked rather than merely recorded. It earns
the obligation: it is the statutory transcription `t10` prices New Mexico against, so a silent change
to it is the one change here that could move a user's number.

**`controls_v568_va.py` (NEW at v5.68) stays UNROWED on the same reasoning as the script below**, and is named in its own row in the tooling table so `K-9` sees it.

**`controls_v568_runfolder.sh` (NEW 2026-09-09) stays UNROWED on the same reasoning**, and it is
named here so the next reader does not file it as an oversight: it is a control script, it is pooled
because every `controls_*` script is, and D-3's *"a row on a file that never changes protects
nothing"* applies to it exactly as it does to the two below.

**`controls_v566_nm.py` and `controls_manifest_rows.py` stay UNROWED**, and that reason has not
expired: they are control scripts, and D-3's *"a row on a file that never changes protects nothing"*
still holds. `sel_census.cjs` likewise stays unrowed, on the same reasoning as `copylock.cjs`,
`lits.cjs`, `notes_probe.cjs` and `vergates.cjs`, its four immediate neighbours — rowing one of five
invites the next reader to call the other four an oversight.

*(Superseded, retained as the record of what was believed on 2026-09-08 in the morning: all three
`.py` and `.cjs` additions were left unrowed, partly because* `K-8`*'s extension set was
`mjs|cjs|jsx|js|sh|md|html|json|txt` *and an md5 row on a `.py` file would have been a maintenance
obligation with no gate behind it — the precise shape D-3 rejected. That note closed by saying
widening `K-8` was "a real option and is NOT taken here", because it changes what a check asserts and
belonged in a scope with its own controls. The scope was written that afternoon and built the same
day; the objection was answered, not overruled.)*

### Added 2026-09-15 — SCOPE_STATE_SET_SELECTOR stage 1

| File | What it is | Refresh when |
|---|---|---|
| `state_sets.cjs` | `qa/tools/state_sets.cjs` — the shared in-law list and phrase matcher; required by `t10`, `t29`, `t35`, `f6_probe.cjs` and `state_sets_check.mjs`. **Hash row above** | when the in-law set changes, and at stage 2 |
| `state_sets_check.mjs` | `qa/state_sets_check.mjs` — TOOLING suite (S-1–S-8), **10 per leg, both legs**, in `runsuite.sh`'s TOOLING section. **Hash row above** | when the shared module changes |
| `controls_state_sets.py` | `qa/tools/controls_state_sets.py` — **38 negative controls, 38 of 38 as expected on each leg.** One sabotaged module per converted site; C4 restores `f6_probe`'s §7.3 defect; C7 shows the selectors no longer read prose; C8–C12 reword one note each. **No shebang on purpose** (run with `python3`), so `G-3a` does not apply. **Unrowed by class**, like `controls_v569_ri.py` | never — it is the record of this package |

## Audit findings and scopes (self-versioned by filename)

**v5.40 and later rows — added 2026-08-20.** ⚠ **Every one of these files was in the pool with no
manifest row.** Seven documents were invisible to the manifest at once, including two status records
written the same week and one written by the session that was auditing the manifest. The
clone-and-diff cannot catch this: all seven match the committed tree exactly, so the pool was correct
and only its *index* was wrong. **A file the manifest never names is a file the next session will not
know to read.**

| File | What it is | Status |
|---|---|---|
| `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` | Scope covering the Roth tab's MAGI measurement | **active — read before touching the Roth tab's MAGI** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STATUS_2026_08_20_structural_magi_extinction.md` | Build record for the structural S-1 assertion. **1,350 passed / 0 failed across 22 suites, parity 9/9, t1 102 → 108** — the current recorded suite state. Also records a line-citation correction the session owned against its own scope (`computeIrmaaPlan` at L4272, not L4271) | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_structural_magi_extinction.md`** (removed from the pool 2026-09-05, H-2). current — the suite baseline any next build starts from |
| `STATUS_2026_08_20_d3_correction.md` | The D-3 disclosure correction: the state-tax approximation is disclosed in three places, Maryland was misfiled, and the finding is restated as **Low** severity, not an undisclosed simplification. Also records the late v5.40 knowledge refresh | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_d3_correction.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_08_20_knowledge_refresh.md` | This refresh's record — the missing `src/index.html` entry template (and the disclaimer gate that rides in it), the retired stale `README-FIRST.md`, the inverted OPERATIONS §A2 bullet, and the pruned/corrected manifest rows | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_knowledge_refresh.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_08_20_build_and_domdiff.md` | The verification record: the published v5.40 artifact **rebuilds byte-identical from project knowledge alone** (`17867edb…`, smoke 16/16) — tested for the first time, the pool having lacked `src/index.html` until that day; the suite re-measured at **1,350 / 0 across 22 suites**, parity 9/9; and `domdiff_withdrawal.mjs` re-pointed after three releases stale, its IRMAA region re-anchored off 1,070 characters of prose, both controls fired | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_build_and_domdiff.md`** (removed from the pool 2026-09-05, H-2). current |
| `STATUS_2026_09_11_b3_live_verification.md` | **The B-3 live-site verification record, 2026-09-11 (KIND: verification — no source, suite or harness change).** GitHub Pages serves the tested v5.70 build: 200, md5 `372d066cf4fc7115ebdae9fc9d6f35d1`, byte-identical to the committed artifact AND to a same-session rebuild from the canonical source (v5.69 first rebuilt to `86703918…`, §N3a). On the live download: `smoke_built` 20/20; through the real bootstrap, no key + no Local Model → 0 requests, key → 1 to `api.anthropic.com`, Local Model → 1 to its URL; v5.69 rebuild → 1 keyless request to the page's own host. Clean clone: `t36` 23/24, `controls_v570_b3.sh` 4 of 4. Pool 130, the retired scope gone. **Seven findings:** F-1 (`smoke_built` reads `body.textContent`, which includes the relocated bundle source — two checks vacuous, CONFIRMED on a scripts-disabled page; fix with A-3), F-2 (a fresh instance of §G's recorded J-gap; K-9 is satisfied by the retirement sentence itself), F-3 (the first-open notice at `src/index.html` L21 is unconditional; the Field Manual qualifies it twice — wording is Steve's), F-4 (`controls_v570_b3.sh` committed `100644`), F-5 (`TESTING.md` L5 said v5.67 — rolled), F-6 (`VERIFICATION_REPORT.md` is frozen — row below), F-7 (§I said the live host is unreachable — corrected). ⚠ **Steve's real-browser check was NOT yet received at packaging** — its line in §4 is blank until he reports it | ⚠ **REPO-ONLY — `docs/STATUS_2026_09_11_b3_live_verification.md`** (H-2 class; never in the pool). current — the only record of F-1…F-7 |
| `VERIFICATION_REPORT.md` | **A FROZEN historical record, v5.7 – v5.9.2 ONLY**, at the repo root (not `docs/`). Its own header says so: it stopped being maintained after v5.9.2, deliberately repeats no current figures, and routes readers to `CHANGELOG.md`; corrected 2026-08-23 after its header had claimed v5.9.2 was current for 37 releases. Kept because the workspace-drift incidents, the ACA primary-source gate record and the v5.9.1 pre-release leak review are recorded nowhere else. ⚠ **Do not append to it** — a 2026-09-11 brief proposed a v5.70 section there; the record went to `docs/STATUS_2026_09_11_b3_live_verification.md` instead (its F-6). Row added 2026-09-11: until then this file had no manifest row of any kind | ⚠ **REPO-ONLY — `VERIFICATION_REPORT.md`** (repo root; never in the pool). frozen — read as history only |
| `STATUS_2026_08_20_roth_magi_partial.md` | **PARTIAL measurement** for `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` (D-A and D-B resolved; D-C still deferred). On the **shipped example household** the Roth tab's IRMAA MAGI matches Engine C in **10 of 12 ladder years** and reads **≈$43K low in 2039 and 2040** — the two years containing a live RMD — while the same tab prints that RMD as $47,681 on screen. **Tier consequence on this household: zero** (tier 0 throughout, $113K–$166K headroom). ⚠ **Engine-vs-rendered-DOM only — the primary-source hand-computation the scope requires has NOT been run**, so this shows *where* they disagree, not *which is right*. Constructed household, term isolation and the `t3` pin all outstanding. Also records that the scope's §2 census table does not reproduce (24 claimed vs **28 hits / 25 sites** measured) | ⚠ **REPO-ONLY — `docs/STATUS_2026_08_20_roth_magi_partial.md`** (removed from the pool 2026-09-05, H-2). current — resume here |
| `STATUS_CAPGAINS_PARTIAL_for_v5_33.md` | The capital-gains partial-state handoff written for v5.33 — a scope premise falsified mid-build, reported rather than adapted around | ⚠ **REPO-ONLY — `docs/STATUS_CAPGAINS_PARTIAL_for_v5_33.md`** (removed from the pool 2026-09-05, H-2). historical; read with the v5.33–v5.36 gains work |

**v5.39 rows (this refresh):**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_39_shipped.md` | The v5.39 ship record — full verification chain (tested source == shipped source, rebuild reproducibility, parity 9/9), per-suite totals parsed from output, the negative control for the new extinction assertion, **and §5, four errors made during the build, recorded plainly** | ⚠ **REPO-ONLY — `docs/STATUS_v5_39_shipped.md`** (removed from the pool 2026-09-05, H-2). **current — the authoritative v5.39 record** |
| `STATUS_v5_41_shipped.md` | ⚠ **REPO-ONLY — `docs/STATUS_v5_41_shipped.md`** (removed from the pool 2026-09-05, H-2). **The v5.41 ship record.** Carries the two corrections made to the build brief's expected figures (an out-of-scope $420 dividend term; an undecided conversion-gating rule worth $2,492 in 2040), the §M precision ceiling and why dollar-exact MAGI was NOT achievable, the 9 negative controls, and four findings left for the next scope |

**v5.36 rows:**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_36_shipped.md` | The v5.36 ship record — session-2 narrative, every decision with who made it, and the FULL per-file hash table (source, suites, docs), the E-18 process fix executed | ⚠ **REPO-ONLY — `docs/STATUS_v5_36_shipped.md`** (removed from the pool 2026-09-05, H-2). **current — the authoritative v5.36 record** |
| `STOP-REPORT-v5_36-session2-pool-drift.md` | The fourth pool-drift block: six suite files pre-session-1 while the brief said otherwise; evidence trail and recovery | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_36-session2-pool-drift.md`** (removed from the pool 2026-09-05, H-2). historical — E-18's primary source |
| ~~`SCOPE_v5_36_drawdown_capital_gains.md`~~ | Scope for the v5.36 capital-gains work (rev 3) | **RETIRED — FULFILLED at v5.36.** Decisions and outcomes recorded in `STATUS_v5_36_shipped.md` and the CHANGELOG; no test cites it by filename (checked) |
| ~~`STATUS_v5_36_partial.md`~~ | Session-1 intermediate status | **RETIRED — superseded by `STATUS_v5_36_shipped.md`** |

Read these together with the build they are pinned to. Every finding document names its build
version + md5 in its header; a finding pinned to an older build has NOT been re-verified against
the current source unless it says so.

| File | What it is | Status |
|---|---|---|
| `FlawsToFix-v5_10_1-Phase1.md` | Phase 1 audit (Sections A+B) against v5.10.1 | B-2 fixed at v5.10.2; B-1 closed as disclosed limitation; **A-2 open**, LOW, needs its own scope · **re-run at v5.69 on 2026-09-11 — `FlawsToFix-v5_69-Phase1.md`** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_69-Phase1.md` | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) — its two header items are resolved (v5.73) and its three leads are D-15, D-3/MT brackets (modelled) and D-19 (fixed); its re-homed follow-ups are `ARCHITECTUREIssues.md` E-29 (a) and closed (the legacy rows, 2026-09-28). ⚠ **v5.72: A-2, A-4, A-5 FIXED; its header now files the Montana lead and Maine's open populate — it stays pooled for that.** Phase 1 re-run (Sections A+B — the import and storage path) against v5.69 · ⚠ **POOLED 2026-09-15 while `SCOPE_IMPORT_HARDENING.md` is open** (its item 4 carve-out: an audit a live scope cites); returns to repo-only when that scope retires. *(Was:)* **REPO-ONLY** (`docs/`), not in the pool (§G / H-2; its decision 4) | **A-3 MEDIUM** (the draft autosave never saves) and **B-3 MEDIUM** (keyless Ask AI posts the plan to the page's host) — both undisclosed; **B-3 FIXED at v5.70** (2026-09-11; `SCOPE_B3_KEYLESS_AI_ROUTE.md` retired), A-3 unscoped; A-4…A-6 LOW; A-2 still open |
| `FlawsToFix-v5_73-Phase2.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first.** **v6.12: C-5 FIXED (census row and summary table); C-10's row corrected to FIXED v6.09 (D-35 fixed it without citing the ID).** **v5.77: C-4 and D-1 annotated FIXED; C-12 (Engine C, single household on the joint §86 thresholds) added and FIXED.** **The live audit register for numerical validation (standing audit Phase 2, v5.73, 2026-09-15).** Section C complete: eleven findings (C-8 high; C-3, C-6 medium) with causes, executed figures and hand arithmetic; §0 is the summary, §4 what was not covered, §5 how to reproduce (`qa/tools/audit_phase2_v573/`, repo only). `docs/` **and** the pool; no md5 row (D-3). Stays pooled until its findings are scoped and fixed |
| `FlawsToFix-v5_15-Phase2D.md` | Sub-phase 2D findings, **REVISION 3**. Completeness half done to the Section C standard, verified **per engine**. Revisions 1 and 2 both stated mechanisms wrongly — §1 records both errors and the single cause, and is still worth reading for that. ⚠ **§6 IS SUPERSEDED** by `AUDIT_2D_BREAKEVEN_v5_28.md`, which says so in its own header | **2D COMPLETE at v5.28 — this row said "IN PROGRESS" through eleven releases and cost a session.** §6's three owed items (crossover hand-verified on two households, discounting-equivalence, `t10` cases) are all discharged. **Read the v5.28 audit, not §6** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_TAXES_DRAWDOWN.md` | — **un-pooled 2026-09-21, repo-only** (§G decision check run line by line: D-4 and D-7 re-homed in `FlawsToFix-v5_73-Phase2.md`, D-5 disclosed in-app and in METHODOLOGY, E-22 in `ARCHITECTUREIssues.md`; nothing open left behind) — `docs/SCOPE_TAXES_DRAWDOWN.md` — ☑ **RETIRED, v5.74 — FULFILLED.** C-8 / E-21 / D-14: Engines B and C take Engine D's spending draws through one bridge. §12 is the build record (two build sessions; Departure 3, the detail panel; decision 3 replaced 2026-09-21). No md5 row (D-3, retired-scope class) |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2 — supersedes the v5.15 scope, which is retired.** Re-verified against v5.21 with AST resolution. Corrects three premise claims: Engine D applies **zero** tax to these draws (not capital-gains — `magi` L7686 omits `drawFromTaxable`); the treatment is **mischaracterized, not undisclosed** (MyData L11211 discloses it, Withdrawal L7822 and the Field Manual contradict it); and the census grew by **nine sites**. Structural trap **EXECUTED**: $147K → $0, silent, plus $21K of genuine brokerage leaving the tab's accounting. `total401k` has **three** derivations, so Option B is path-dependent | **active — §7 DECISIONS RESOLVED 2026-08-10.** Governs releases (b) and (c) *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_CONSOLIDATE_taxable_residual_v5_22.md` | Release **(a)** of the three-release plan (D-6/D-7). Consolidates the taxable residual, verified at **seven** identical sites by normalized AST fingerprint (one distinct form). Two binding constraints: the helper must **not** live in `retireStartBalances` (documented decision, L1509–1511, whose comment must be amended in the same edit), and **L8384 is a variant** — positions residual **plus** `otherAccounts` — so only its positions half is replaced | **active — no open decisions. Next build.** Pure refactor: 8/8 strict parity, all 751 checks **identical** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_AUDIT_PHASE2_v5_10_2.md` | Governing scope for Phase 2 / Section C. Decisions D-1…D-5 are **binding** on all 2A–2E work | **COMPLETE — all five sub-phases closed.** Roll-up: `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2A.md` | Sub-phase 2A — federal core. Engine A dollar-exact (76 assertions) | complete. **Amended 2026-08-08**: Engine B is verifiable only to **±$500**, not dollar-exact *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2B.md` | Sub-phase 2B — IRMAA + indexation (35 assertions). Findings F-2B-1 (threshold indexed to MAGI year) and F-2B-2 (top tier not frozen) — both LOW, conservative, **coupled: fix both or neither** | complete. **Amended 2026-08-08**: Engine C verifiable only to ±$500 MAGI / ±$50 surcharge *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FlawsToFix-v5_10_2-Phase2C.md` | Sub-phase 2C — first-spouse death. **C-2C-3 (HIGH)**: Engines B and C key post-death RMDs to the deceased spouse's age; direction depends on which spouse is younger, **non-conservative** when A is the younger. C-2C-1 and C-2C-2 LOW, conservative | complete — **this is the current 2C document** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-EngineBC-render-precision.md` | Why Engines B and C cannot be verified to the dollar: every DOM figure is `Math.round(x/1000)`; the shim reaches only module-level bindings. Records the ±$500 ceiling and the options to lift it | ⚠ **REPO-ONLY — `docs/STOP-REPORT-EngineBC-render-precision.md`** (removed from the pool 2026-09-05, H-2). standing constraint — applies to all future B/C verification |
| `FINDING-C-2C-6-EngineA-death-year-filing.md` | Engine A files Single for the whole death year (Pub. 501 says the year after). **Executed dollar-exact**: over-taxes by $3.5K–$15.5K depending on income. Conservative, undisclosed, and a cross-engine divergence *created* by the v5.12/v5.13 corrections | **open — needs a scope**; pairs naturally with the F-2B indexation fix, which lives in the same tier loop *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FINDING-C-2C-4-EngineD-no-death-modeling.md` | Engine D (Withdrawal tab) did not model first death at all. Severity restated by D-4 to **MEDIUM, direction household-dependent** | **CLOSED — fixed at v5.12**; header corrected 2026-08-09 after sitting stale at *provisional / HIGH* for a full release *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `FINDING-C-2C-5-EngineC-no-death-in-SS.md` | Engine C (IRMAA) did not model the first death in its Social Security basis — the finding `t13` was written to pin. Fixed at v5.13 | rarely *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_survivor_engines_CD.md` + `SCOPE_ADDENDUM_D6_EngineC_design.md` | Scope for C-2C-4 (Engine D) + C-2C-5 (Engine C). Engine D shipped at v5.12; **Engine C shipped at v5.13** | **fulfilled — retire both at this release** |
| `FINDING-C-2B-3-RothLadder-irmaa-inflator.md` | The Roth ladder ran its own tax arithmetic with the **married** deduction, brackets, SS thresholds and IRMAA cliff hardcoded, and no single-filer branch. Severity raised MEDIUM → HIGH when the prerequisite was executed | **CLOSED — fixed at v5.15.** Outcome written back on the finding itself; magnitude corrected upward (72%, not ~40%) and census corrected (13 sites, not 10) *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_irmaa_indexation_v5_13.md` | Scope for the coupled F-2B-1 / F-2B-2 indexation fix. Premise **re-verified against v5.13**, not inherited from the v5.10.2 findings; census updated for the two-array tier structure v5.13 introduced. Four open decisions | **active — awaiting Steve's decisions in §7** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_FIX_roth_tab_filing_status_v5_14.md` | Scope for C-2B-3. All five decisions resolved by Steve 2026-08-09; all three ordered changes shipped (the droppable third was not needed) | **fulfilled at v5.15 — retire** *(in neither the repo nor the pool — a history row, never committed; marked for K-12, 2026-10-12)* |
| `SCOPE_DEFECTS_v5_10_1.md` | The v5.11 defect-fix release scope: three pre-existing defects found by the rebuilt t1–t6 baseline — **D1 (P0)** Clear All Data left the API key and skipped the landing return, **D2** ACA cliff solver ignored MAGI from its own funding sale, **D3** phantom Spouse-B card for single filers. All three were present identically in v5.9.2 and v5.10, so none was a regression. **Kept as the worked example** of the defect-pin → fix → flip cycle, and of a scope with an enforceable out-of-scope boundary | fulfilled (all three shipped at v5.10.1); retained for reference, not retirement *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `AUDIT_2D_BREAKEVEN_v5_28.md` | Sub-phase 2D — Roth break-even + account completeness against v5.28. **Explicitly supersedes `FlawsToFix-v5_15-Phase2D.md` §6** and discharges all three items it owed; verification is arithmetic, not inspection (a $30K conversion costs $2,196 incremental federal tax against a −$2,294 year-one wealth delta; 2,196 × 1.045 = 2,294.8). **Check count reconciled 2026-08-18:** the document's **19** was its own v5.28 delta (t10 115 → 134); the current `t10` carries **27** `2D`-labelled assertions, so 8 arrived after v5.28. Both figures are right about different things — the 27 in this row describes today's file. *(Suite totals not re-run to confirm t10's overall total.)* **ADDED TO THE POOL 2026-08-18** — it was repo-only, which is why the row above went stale | ⚠ **REPO-ONLY — `docs/AUDIT_2D_BREAKEVEN_v5_28.md`** (removed from the pool 2026-09-05, H-2). complete |
| `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` | Sub-phase 2E — state-tax module (21 checks) **and the Phase 2 roll-up**. The document a Phase 3+ session must read first: it names what is already verified and therefore not a finding | ⚠ **REPO-ONLY — `docs/AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md`** (removed from the pool 2026-09-05, H-2). complete — **authoritative for Phase 2** |
| `AUDIT_DOCS_HTML_v5_27.md` | Audit of the Field Manual against shipped v5.27 behaviour. Records that the **glossary, §10 API-key material and §14 FAQ were NOT audited** — that ground is Section F (**now covered — see `UsabilityFlaws.md` Part D**). **ADDED TO THE POOL 2026-08-18**, closing the repo-only annotation this row carried — the standing advice *"a row with no file behind it costs a session a hunt"* was borne out twice over on the same day (see the Section D sweep and the 2D audit rows) | ⚠ **REPO-ONLY — `docs/AUDIT_DOCS_HTML_v5_27.md`** (removed from the pool 2026-09-05, H-2). complete, with the stated gap — **gap since closed** |
| `STATUS_release_a.md` | Release-(a) status note (taxable-residual consolidation, v5.22) | ⚠ **REPO-ONLY — `docs/STATUS_release_a.md`** (removed from the pool 2026-09-05, H-2). historical |
| `STATUS_v5_23_engineD_hoist.md` | Engine D hoist status note (v5.23) | ⚠ **REPO-ONLY — `docs/STATUS_v5_23_engineD_hoist.md`** (removed from the pool 2026-09-05, H-2). historical |
| ~~`probe_classify.mjs`~~ | **RESOLVED at v5.30 — removed from knowledge, now versioned.** Committed to the repo at `qa/tools/probe_classify.mjs` with a header recording what it was for. It is a v5.25-era probe from the `otherAccounts` scoping work; **its conclusions have since shipped and are asserted by `t20`**, so its "what would move" output now describes a change that already happened. It asserts nothing and **must never be counted in a release total**. Read `t20` instead. | retired from knowledge |
| `MissingFeatures.md` | **CENSUS AT v6.04 (2026-10-11): its opening table is the current status of every D item — read it first.** **Section D** of the standing audit (Phase 3) — the taxation-features findings inventory. **RE-PINNED TO v5.48 on 2026-08-25** (`6b30580a2a1a5bc95b0df2c3f2a23a95`, tree `ba6d598`); the v5.29 and v5.39 blocks are kept below it for the record. Verified **by content** — the document's `L####` citations are pinned to v5.29/v5.39 and most have moved. **D-1, D-2 closed and confirmed; D-2's live descendant S-1 is now closed too** (the IRMAA MAGI sentence names realized gains at L9973) — ~~⚠ `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` and `AUDIT_TOP_FIVE_SUMMARY.md` still carry S-1 as live~~ — **CLEARED 2026-08-25.** Both documents were repaired hours later in the same session and their own rows below say so; this warning was left standing and **contradicted them for two days**. It was found on 2026-08-25 by reading the three rows against each other. ⚠ **The lesson is the one this file already records twice: a warning that points AT another document goes stale when that document is fixed, and nothing checks it.** When you repair a document, clear every cross-reference that describes its old state in the same pass — a manifest that disagrees with itself is worse than one that says nothing, because it is read as authoritative. ~~**D-6 is HALF-CLOSED, not closed**~~ — **D-6 CLOSED AT v5.49 (2026-08-25), both halves.** The user-side half shipped: the Field Manual's IRMAA Cliff entry and the IRMAA tab both name SSA-44 and work stoppage. `METHODOLOGY.md` was corrected in the same release — it named five of the eight life-changing events and said the list *"includes"* them, never that it is **closed**; on a tab driven by the Roth slider that reads as an invitation to infer a conversion-driven spike might qualify, and it cannot (`ssa.gov/forms/ssa-44.pdf`; 20 CFR 418.1205). **`t31` now enforces the class** — see its row above. ⚠ **This entry is the reason `t31` exists:** D-6 was recorded CLOSED once already, on the strength of the creator-side half alone, and nothing could catch that because no suite read `METHODOLOGY.md`. **D-7 assessed at last**: no estate tax of any kind sits in the comparator's estate figure (L4251), which is its **default ranking objective**, and the only disclosure (L10788) is gated to `single` households, so a couple never sees it — direction **optimistic**. **NEW D-3c**: `excl` applies income-limited state exclusions unconditionally (L1100), so a NJ couple pays $0 modelled tax up to $150K of retirement income against a statutory $100K MFJ cap and a hard cliff — this **under-taxes**, the opposite of D-3's headline direction. **D-4 reclassified** as a boundary note (no app input can express itemizing). D-3, D-5, D-8b hold. ⚠ Carries an errata owning two errors of the re-pinning session: a wrong state-note discriminator, and a lossy `DOCS_HTML` decode that produced false zeros — **read the Field Manual from the RAW string, never a stripped copy**. **Coverage finding recorded there:** every suite fixture sets `stateCode: null` except `t3`'s `GA`, so no projection exercises the state module for 50 of 51 jurisdictions | Section D **re-verified at v5.48**; no fix made — scoping decision open with Steve |
| `ARCHITECTUREIssues.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first; E-29 (2026-10-11) holds the non-tax threads re-homed from documents that left the pool.** **Section E** of the standing audit — **v5.73 section (E-21–E-28) appended 2026-09-15: read it first.** Highest: E-21, the Taxes and Withdrawal engines as parallel projections (the cause of Phase 2 C-8); E-22, the same statute implemented up to five times (**v6.12: every engine now calls the one §86 helper** — census row updated, as is E-25's). Earlier items are pinned to v5.29 and later releases | Section E **covered** |
| `UsabilityFlaws.md` | **CENSUS AT v5.97 (2026-10-08): its opening census table is the current status of every ID — read it first.** **F-19 is two IDs from 2026-10-14:** **F-19s** (skins, fixed v5.39 — its census row added then) and **F-19r** (§H: the Ranking tab's headline averaged nine tiers; filed at v6.10 as "F-19", **fixed v6.11**). This row's own "Fixed: … F-19" below is F-19s. **Section F** of the standing audit — **RE-PINNED TO v5.73 (2026-09-15), measured in real Chromium at 1440 / 820 / 390 px across all 26 tabs: read that block first.** New: F-11 (every tab scrolls sideways on a phone), F-12 (the first phone screen is all chrome). F-10 closed | **PARTIALLY CLOSED at v5.39.** Fixed: F-10, F-11, F-12, F-13, F-14, F-15, F-17, F-18, F-19 (F-19 was found while verifying F-10 and was the release's highest-value item). **Still open:** F-1…F-9 (small-screen layout, contrast, touch targets, tooltips, input modes, chart resize) — now **disclosed** in Field Manual §13 but **not fixed**; and F-16 (glossary ASCII sort, NIT). The mechanics release for F-2/F-6/F-8 is identified but unscoped. The two-paragraph top-five summary is ✅ **WRITTEN 2026-08-18** — `AUDIT_TOP_FIVE_SUMMARY.md`; F-1…F-9 are its item 4. It was **NO LONGER BLOCKED** (corrected 2026-08-18): both stated blockers were already closed — Section C's 2D break-even half at **v5.28** and Section D's gap sweep at **v5.31**. It was deferred through several sessions against blockers that had already cleared. Write it after the v5.31 → v5.39 delta sweep, since that may change what the top five are |
| `AUDIT_D3_STATE_TAX_DIRECTION.md` | **D-3's direction is wrong, and the finding splits.** Measured against **v5.40** on 2026-08-19 while verifying the premise for a D-3 scope — **stopped and reported rather than adapting the scope.** D-3 was recorded as under-taxing and flattering a plan, and that reasoning made it item **#2** of the top-five summary. New York MFJ, both 67, against the sourced 2026 schedule: at $120,000 the model charges **$4,800** where NY charges **$3,121** — **54% too high** — and it over-taxes at every income to roughly $600,000, reversing only between **$600K and $900K**. **Direction is CONSERVATIVE.** Causes: `stateTaxAnnual` (L1091) models **no state standard deduction**, and each rate approximates a mid-to-upper *marginal* rate. ⚠ **The disclosure half was OVERSTATED and is corrected 2026-08-20:** the approximation is disclosed in THREE places — Field Manual §13, the manual's Taxes tab entry, and `src/DangerClose.jsx` **L11889**, rendered under the My Data state selector for every jurisdiction — so it is not an undisclosed simplification. All six named states carry notes; Maryland was misfiled (its note says *effective*, never *progressive*), leaving **three** disclosing states (CA, DC, OR) against **30** silent ones, exact count **unmeasured**. What remains is **inconsistent per-state note detail, severity Low**, plus the setup wizard's picker (L3393) showing no note at all. ⚠ **Limits:** only NY is verified against a sourced schedule; CA is **indicative** (recalled brackets); HI/MN/VT/WI are **unmeasured**. Also flags **NJ returning $0** for this household — unmeasured, asserted neither way | ⚠ **REPO-ONLY — `docs/AUDIT_D3_STATE_TAX_DIRECTION.md`** (removed from the pool 2026-09-05, H-2). **current, corrected 2026-08-20.** Disclosure half → **Low; ride the note tidy along with the next release that opens `STATE_RULES`, do not ship for it**. Precision half → **held**; full graduated brackets **declined** (~300 numbers, annually re-indexed); recalibration preferred if it proceeds. **D-3 has no live high-priority half** |
| `AUDIT_TOP_FIVE_SUMMARY.md` | **THE STANDING AUDIT'S CAPSTONE** — the two-paragraph top-five summary, written 2026-08-18 against v5.39. ⚠ **RE-PINNED TO v5.48 on 2026-08-25: its #1 item is largely discharged.** Item 1 was *"disclosures drift off the engines beneath them — S-1, S-3, D-6"*, ranked top *"by a distance"*; **S-1 and S-3 are now CLOSED** (S-1 structurally — the IRMAA tab's MAGI sentence at L9973 is a catch-all with named examples, not an enumeration, so it cannot drift by omission again) and **D-6 is HALF-CLOSED** (creator-side only). **Item 5 has demonstrated itself on this very document**: S-1 and S-3 closed silently and the capstone ranked them #1 for nine releases — the 4th and 5th silent closure on the same list as D-1, D-2, C-2C-3 — so **item 5 now outranks item 1**. Rows left unrenumbered on purpose. All eleven `L####` citations re-resolved at v5.48. ⚠ **Item 4's F-1…F-9 count was NOT re-verified** — treat as unverified until measured | ⚠ **REPO-ONLY — `docs/AUDIT_TOP_FIVE_SUMMARY.md`** (removed from the pool 2026-09-05, H-2). **re-pinned v5.48**; items 2/3 hold |
| `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` | **The Section D delta sweep**, run 2026-08-18 against **v5.39** (tree `d18f7cc`). ✅ **RE-PINNED TO v5.48 on 2026-08-25 — BOTH of its live findings are CLOSED.** S-1 closed structurally (L9973 vs Engine C's seven-component sum at L4435); S-3 closed (`METHODOLOGY.md` L678–680 now past-tense and version-gated). Its §4 recommendation — *"fix S-1 and S-3 together in one small docs release"* — was carried out and **never recorded here**, which is why the capstone ranked them #1 for nine releases. **This document is now history: its method stands, its findings are discharged, nothing in it is open** | ⚠ **REPO-ONLY — `docs/AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`** (removed from the pool 2026-09-05, H-2). **closed** — do not cite S-1 or S-3 as live |
| `AUDIT_PHASE3_SECTION_D_SWEEP.md` | **THE SECTION D UNDISCLOSED-GAP SWEEP** — the deliverable the rollup below asked for, run against **v5.31** (committed tree `4b8e714`). Method: *enumerate, don't sample* — all **28 user-facing surfaces** captured (26 rendered tabs driven through the DOM harness, plus decoded `DOCS_HTML` and `METHODOLOGY.md`), then three passes: **58 claims** extracted across 18 surfaces, **28 distinct negative modelling claims** inventoried, then **measurement** by driving the engines and perturbing inputs. Result: **no undisclosed gap.** One Low disclosure inaccuracy (**S-1**, IRMAA tab's MAGI enumeration), **D-6 resolved** as disclosed rather than a gap, and two suspected gaps **cleared by measurement** with control arms recorded. §6 states its own limits (one household; pattern-based extraction; arithmetic not re-verified; `validation/` untouched). ⚠ **Its result is anchored to v5.31 and six modelling releases have shipped since (v5.32, v5.34–v5.38)** — see the standing note below | ⚠ **REPO-ONLY — `docs/AUDIT_PHASE3_SECTION_D_SWEEP.md`** (removed from the pool 2026-09-05, H-2). **Section D discharged at v5.31.** **ADDED TO THE POOL 2026-08-18** — it was repo-only and named in no manifest, which is why Section D read as "never run" for eight releases (E-14's failure shape) |
| `AUDIT_PHASE3_ROLLUP.md` | Phase 3 roll-up (Sections D + E). ✅ **RE-PINNED TO v5.49 on 2026-08-25 — read that box first.** This is **the orientation document for the whole audit**, and on 2026-08-25 it gave a wrong answer about **two of the four phases**: its §5 said Phase 4 (F) was *not started* when `UsabilityFlaws.md` has been pinned since v5.38 with three findings FIXED at v5.40, and said the top-five capstone was unwritten when it exists and has been re-pinned twice. §5 is now marked SUPERSEDED in place. Section E findings re-checked by content: **E-2 CLOSED** (a named `OBBBA_CONSTS` block with the statutory cite, an explicit `SENIOR_BONUS_SUNSET_YEAR` and Verify-tab coverage); **E-4, E-5, E-6 and E-11 HOLD**; **E-11's mechanism identified** — one `DOCS_HTML` line has three truthful lengths (code points / UTF-16 units / bytes), so it is a UNITS defect, not drift. ⚠ E-1, E-3, E-7, E-8, E-9, E-10, E-12, E-13 **not re-verified — assume stale**. Its §4 asked for Section D to be re-run with the undisclosed-gap sweep as the explicit objective — **that request was fulfilled**; read `AUDIT_PHASE3_SECTION_D_SWEEP.md` alongside it. ⚠ §4's list of what Section E did NOT reach — the file's structure, `DOCS_HTML` internals, `validation/` ↔ `qa/` — **is still accurate and is the largest untouched area in the audit**. **ADDED TO THE POOL 2026-08-18** (previously listed here but repo-only) | ⚠ **REPO-ONLY — `docs/AUDIT_PHASE3_ROLLUP.md`** (removed from the pool 2026-09-05, H-2). current, **with the sweep as its successor** |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2.** Governing scope for the three-release `otherAccounts` plan — (a) v5.22, (b) v5.24, (c) v5.26. §1 records three corrections to its own premise; §7 carries Steve's resolved decisions D-1…D-7 | **FULFILLED (all three shipped) — RESTORED to knowledge 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `qa/t19_engineD_exact.mjs` L61 cites it as its governing scope *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_ENGINE_D_MAGI_v5_24.md` | Release (b). §1 corrects the carried-forward premise (adding `drawFromTaxable` to `magi` would have been a **defect**, not a fix); §8 is the correction owed to `t19`'s B-2 pin. §8 also warns the finding **"is unusually good at being restated wrongly"** and counts three prior wrong statements | **FULFILLED at v5.24 — RESTORED 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `t19` L96 is a **stop-instruction** telling a session to read its §1 before touching `magi` *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ *(retire — spent)* | Build brief for v5.30 — pasted as the first message of the build session. Carries the freshness expectations, the three edits, the per-leg gating rule, and the version-bump tax | current |
| ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ *(retired)* | Scope for **D-1(a)/(b) + E-3** — the false OBBBA disclosure in Field Manual §13 and METHODOLOGY §5, and the false source comment at L829–831. Three edits, no engine change, parity must stay 8/8. §3 records the §B2 lock check (clean) and a second gap it surfaced: nothing asserts Engine B *applies* the bonus | **RETIRED — FULFILLED BY v5.30 (verified 2026-08-13).** All three edits shipped, `t18` gained the three hand-computed OBBBA cases including the 2029 sunset, and E-3 was closed and named in the CHANGELOG. Delete from the pool with its build brief |

---


### ⚠ Added 2026-09-03 — twelve pool files had NO manifest row, eleven of them predating v5.61

**This is the SECOND occurrence of the class recorded at the head of this section.** The seven
documents found in 2026-08-20 were the first. `package_check` **K-9** now asserts that every pool
file is named here, so a third occurrence fails loudly instead of waiting for someone to look.

| File | What it is | Status |
|---|---|---|
| `AUDIT_STATE_INCOME_BASES_ROUND5.md` | State income bases and thresholds, round 5. Four findings; the Rhode Island one shipped as v5.61 | — **un-pooled 2026-10-11, repo-only** (ops package of 2026-10-11, third; open threads traced and re-homed first — the manifest archive's §0) **COMPLETE**, and all four findings are resolved: the bases and shapes in `SCOPE_INCOME_CONDITIONING.md` (fulfilled v5.69), Rhode Island v5.61, Connecticut v5.65. *(This cell read "three findings still open — Connecticut is the largest single-state error currently known" until 2026-10-11.)* |
| `FINDINGS-v5_63-state-statutes.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — The statutory oracle for the five income-conditioned states (NM, RI, VA, NJ, CT) — every figure read against a primary or official source 2026-09-04, with the two ROUND5 open items closed and the four build decisions they produced | **REFERENCE — the populate releases test against these tables and do not re-derive them.** ⚠ Connecticut is read at **TY2026**; the other four at their current codified or TY2025 state. **Rhode Island's TY2026 pair is NOT PUBLISHED** and is expected in the November 2026 advisory — re-read §6 when it issues. ⚠ **§6 and §7c CORRECTED IN PLACE 2026-09-10: Rhode Island's comparator is EXCLUSIVE** (§ 44-30-12(c)(8)/(9) "less than"; ADV 2025-22 "below") — the original "at or below" is kept beside the correction; see `SCOPE_RI_POPULATE.md` F-1 and D-RI-2 |
| `SCOPE_INCOME_CONDITIONING.md` | An income-conditioning field for state exclusions (D-11 (c)) | ☑ **RETIRED — FULFILLED AT v5.69**: all five states conditioned. *(Was:)* **OPEN — PARTIALLY BUILT: CT v5.65, NM v5.66, NJ v5.67, VA v5.68; RHODE ISLAND OPEN, ONE LEFT** (rolled at v5.68, when the scope's own status cell — which still read "Not yet built." — was corrected in the same package). *(Earlier wording:)* **OPEN — PARTIALLY BUILT at v5.64.** ⚠ Status rolled 2026-09-04 at the v5.64 ship: the measure, the two bases and the evaluator are BUILT and populate no state (B-1 (a)); the five state tables are not. Four further decisions **B-1..B-4** were raised by the completed pre-build gate and approved the same day — see the scope's §7b. It stays on `package_check`'s I-2 OPEN allowlist until the last state lands, and ⚠ **that entry's REASON is now stale**: it reads *approved, unbuilt*, and a stale allowlist reason is as invisible to I-3 as a ghost entry is. *(Previously: APPROVED 2026-09-04, NOT YET BUILT.)* ⚠ Row rewritten 2026-09-04: it said *"gated on D-2 and D-3, unresolved"* while `CHANGELOG.md`'s v5.62 entry said both were approved — a four-document disagreement (this row, the scope's status line, `package_check`'s allowlist comment, the CHANGELOG) that nothing compared, the **fifth** of its class. D-2 **(b)** two bases via a per-state `base` field and D-3 **(b)** additive `{ kind: 'bands' \| 'taper' }` with `excl65` kept as a scalar are approved; all seven decisions are now resolved. ⚠ **Its premise was re-anchored from v5.60 to v5.63 in the same pass** — v5.62 rewrote all three `stateTaxAnnual` call sites to gross components and v5.63 made `work` carry `work + otherOrd`, so every line number and the falsified "the three call sites do not pass the same fields" claim were corrected. Stays on `package_check`'s OPEN allowlist; **that entry now expires when the field SHIPS, and only a person can retire it** ⚠ **2026-09-10: B-2 annotated in place** — Rhode Island is exclusive too; B-2's mechanism stands. *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_RI_POPULATE.md` | `docs/SCOPE_RI_POPULATE.md` — **NEW 2026-09-10.** Populate Rhode Island's $50,000 pension/401(k) modification (§ 44-30-12(c)(9)) into `exclTest` as a two-row `bands` cliff on `agi`, per person, `cmp: "lt"`, on the dated TY2025 pair — the **fifth and last** state under `SCOPE_INCOME_CONDITIONING.md`. Measured against v5.68 `561fc39b…`, tree `f2f4c20`: over 34,992 households tax rose for 14,843 and fell for none, largest rise **$5,000.00/yr**. Records **F-1** (FINDINGS' inclusive comparator is wrong) and **F-4** (no assertion reads the Field Manual sentences the release falsifies). The IRA distinction, the own-income cap and per-spouse FRA are disclosed, not modelled; Social Security is out of scope. | ☑ **RETIRED — FULFILLED AT v5.69**; §10 is the build record. *(Was:)* **OPEN — BUILDABLE. All six decisions D-RI-1…D-RI-6 APPROVED 2026-09-10.** On `package_check`'s I-2 OPEN allowlist; the Rhode Island build retires this scope AND the parent, and removes BOTH allowlist entries in that package *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_B3_KEYLESS_AI_ROUTE.md` | `docs/SCOPE_B3_KEYLESS_AI_ROUTE.md` — ☑ **RETIRED — FULFILLED AT v5.70, 2026-09-11**; §7 is the build record. **Left the pool** at the v5.70 upload; its `package_check` allowlist entry and hash row left with it. *(Was:* **NEW 2026-09-11. BUILDABLE** — all three decisions approved 2026-09-11. The fix for the Phase 1 audit's **B-3** (keyless Ask AI posts the plan to the page's own host): a refusal inside `askAI` (the app only), a disabled and relabelled button, and full disclosure — the v5.70 CHANGELOG, one Field Manual sentence, and a short public note once v5.70 is live. Target **v5.70**. On `package_check`'s I-2 OPEN allowlist until that release closes it)* | retired *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_NJ_POPULATE.md` | `docs/SCOPE_NJ_POPULATE.md` — **NEW 2026-09-08.** Populate New Jersey (§ 54A:6-10) into `exclTest`, the **third of five** states under `SCOPE_INCOME_CONDITIONING.md` (CT v5.65, NM v5.66). ⚠ **The largest remaining single-state error in the app**: the model grants $75,000 per person unconditionally from 65, so an MFJ household over $150,000 of NJ gross income excludes $150,000 where the statute allows **nothing** — **$8,250/yr of NJ tax understated**, more than RI and VA combined. Premise re-measured against v5.66 `31b43e09…`, tree `0fc82c5`. ⚠ **No evaluator change needed** — `_fromTest` already names NJ in three of its own comments. ⚠ **Two figures move in OPPOSITE directions** and both must be disclosed: the tier fix is pessimistic, and modelling the 62 age floor (D-NJ-1) is **optimistic** | ☑ **RETIRED — FULFILLED at v5.67, 2026-09-08.** All four decisions built as resolved: **D-NJ-1** the 62 floor IS modelled, **D-NJ-2** caps encoded faithfully with `E-NJ-1` pinning percentage-of-payments, **D-NJ-3** the status disagreement repaired, **D-NJ-4** `excl65` set to 0. §8 is the build record. ⚠ **Two guards were left standing on nothing by this release and are pinned rather than discovered later**: `t29` F-6a/F-6b (the income-limited scalar set is down to VA alone, and populating VA empties it) and the `stateExclCliff` fixture, re-founded on VA because NJ was the state it stood on *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_VA_POPULATE.md` | `docs/SCOPE_VA_POPULATE.md` — ☑ **RETIRED — FULFILLED AT v5.68, 2026-09-10**; §9 is the build record, and four errors in the scope are corrected at their sites. Its `package_check` OPEN-allowlist entry left in the same package. *(Row as written at arrival follows.)* **NEW 2026-09-09.** Populate Virginia's age deduction (§ 58.1-322.03(5)(b)) into `exclTest`, the **fourth of five** states under `SCOPE_INCOME_CONDITIONING.md` (CT v5.65, NM v5.66, NJ v5.67). ⚠ **Virginia is the FIRST REAL `taper`** — all three populated states are `bands`, so the evaluator at L1311 is exercised only by `t34`'s synthetic jurisdiction and the scope's job is to prove the WIRING, not the evaluator. Premise re-measured against v5.67 `ca05b2ec…`, tree `8dc9160`; worst case **+$1,380.00/yr** at $99,000 MFJ, every measured point conservative or unchanged. | **OPEN — BUILDABLE. All decisions resolved 2026-09-09**, and the two that matter were reopened by measurement first: **D-VA-2** — keep `excl65: 12000` (the taper yields `perPerson` at zero income, so New Mexico's precedent and the `t10:1257` invariant both apply, against the handover's `0`); **D-VA-3** — repair `t29` F-6a/F-6b FIRST so they can fail at all, THEN re-found the selector on `!r.exclTest`, correcting the wrong `{VA}` measurement at all three shipped sites; **D-VA-6** — that repair ships WITH the Virginia release, not separately. ⚠ **OPEN here means UNBUILT, not undecided.** ⚠ **Re-measure the premise against whatever is shipped when the build starts** — every figure in it is against v5.67 *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_TREE_AND_POOL_HOUSEKEEPING.md` | Repo and pool housekeeping — the `dom_entry_*` set, and whether completed history needs to be in the pool | **OPEN — H-1/H-2/H-3/H-4/H-5 all RESOLVED; H-2, H-3 route (a) and the H-3 deletion BUILT 2026-09-07.** Still unbuilt: the **third scope-status sweep** (§5 item 4) and **H-6** (§4a, NEW 2026-09-07 — section K's negative controls are mostly measuring nothing; four report INVALID and one passes for the wrong reason). ⚠ **Until H-6 is repaired, section K's controls are not evidence that section K works.** Held open by name in `package_check`'s I-2 allowlist *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_D12_PLAN_TYPE_PER_PERSON.md` | — **un-pooled at v5.95, repo-only** (FULFILLED: all three phases; residuals re-homed to MissingFeatures D-12, D-27, D-28) | `docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md` |
| `SCOPE_HOUSEKEEPING_THREE.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — Three housekeeping items | ☑ **RETIRED 2026-09-14 — all three items closed** (item B on disclosure). *(This row read "OPEN — awaiting decisions" until 2026-09-15; stale since the retirement, corrected when the file left the pool.)* |
| `SCOPE_RI_THRESHOLD_CORRECTION.md` | Rhode Island's TY2025 MFJ threshold | **FULFILLED** — shipped as v5.61; §7 is the build record *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_ENGINE_STATE_PARITY.md` | The three engines shared one state-tax calculator and disagreed anyway | **FULFILLED** — shipped as v5.62; §7 is the build record. ⚠ **Its §2 and §7 assert an `otherOrd` gap that was verified FALSE on 2026-09-03** — see `FINDINGS-v5_63-otherOrd.md`. Read that first; the disclosure is corrected by the pending v5.63 release *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_MANIFEST_D4.md` | This manifest's staleness, and the D-4 check | **the scope for the 2026-09-03 ops package** *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STATUS_v5_50_shipped.md` | Ship record for v5.50 | ⚠ **REPO-ONLY — `docs/STATUS_v5_50_shipped.md`** (removed from the pool 2026-09-05, H-2). historical |

### Added 2026-09-03 (second upload that day) — the `otherOrd` verification and the v5.63 workbench

**These three rows exist because the pool gained three files the same afternoon.** `package_check`
K-9 asserts every pool file is named here; adding the files without the rows would fail the next
package, which is the failure mode the section above this one records twice.

| File | What it is | Status |
|---|---|---|
| `FINDINGS-v5_63-otherOrd.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — The `otherOrd` question settled by execution: the v5.62 disclosed gap is **FALSE** (complement identity executed with non-zero readings on both sides), and the Roth comparator instead charges **FICA on rental and annuity income** at two sites. Also records why the earlier runtime attempt read `0`, the six AST-resolved `streamsAnnualAt` call sites, the mislabelled `t10` pin, and two harness facts absent from `TESTING.md` | **current — read before touching `runRothStrategies` or the v5.62 disclosure** |
| `SCOPE_ROTH_FICA_OTHERORD.md` | Scope for v5.63: fix the FICA defect and correct the false disclosure together | **APPROVED 2026-09-03** — D-1 withdrawn (the fix closes it), D-2..D-5 decided by the maintainer. §4's blast radius is measured, not assumed *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-v5_63-fica-workbench.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — v5.63 stopped mid-build: engine fix applied from canonical v5.62 and **2,934 app checks green on both legs**, but no new tests, controls, `METHODOLOGY`, `CHANGELOG` or built artifact. Lists what remains, in order | **OPEN — the entry point for the next session.** The workbench `github/` half is NOT committed |
| `STOP-REPORT-v5_66-NM-note-guarded-set.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — **How New Mexico was stopped the FIRST time, and the defect that stopped it.** §3 is the finding: rewording NM's note to state its phase-out silently drops NM out of the income-limited guarded set that `boundaries.mjs` and `t10` both select with `/income[- ]limited|income limit/i` **against the user-facing note string** — and `t10` still reports green. Second occurrence; the same shape hit New Jersey at v5.54 | ☑ **SUPERSEDED as the entry point 2026-09-07. D-NM-1 is ANSWERED — (c) — and the note half is BUILT and pinned by `t35` D-7a.** Read `STOP-REPORT-v5_66-nm-session2.md` instead. ⚠ **(c)'s SECOND half — corrected 2026-09-08: the scope IS written.** It is `SCOPE_STATE_SET_SELECTOR.md`, dated 2026-09-07, and this row froze before it existed. **(c) has therefore NOT become (a)** — but the scope is unbuilt, so the defect it names is still live and the shipped NM note is held safe only by `t35`'s D-7a pin. Body kept as the record |
| `SCOPE_STATE_SET_SELECTOR.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_STATE_SET_SELECTOR.md` — ☑ **RETIRED — FULFILLED AT v5.72 (§10; stage 2 built as S-2 of SCOPE_IMPORT_HARDENING).** ⚠ **§9 (2026-09-15, second package): the in-law list omits MAINE; stage 2 is now scoped in `SCOPE_IMPORT_HARDENING.md`.** ⚠ **STAGE 1 BUILT 2026-09-15 (its §8); STAGE 2 OWED, so still OPEN and still on the I-2 allowlist.** The premise below was re-measured and amended on 2026-09-14 — **its §7 is authoritative over §§1, 2, 4 and 6**, and the *in-law* set is no longer selected from prose. *(Superseded wording, retained:)* ⚠ **premise annotated at v5.69**: its *unconverted* set is now empty and asserted empty; its *in-law* set is still selected from note prose, so it stays OPEN. **NEW 2026-09-07. Row added 2026-09-08, one package late (K-9).** Stop selecting the income-limited state set by **executing a regex against user-facing copy**. A note reworded to *describe* a phase-out silently drops its state out of the guarded set that `boundaries.mjs` and `t10` both select on, and the suite still reports green — twice observed (NJ at v5.54, NM at v5.66). Its premise is verified against v5.66 source `31b43e094307ef5f996570c090478e13`; the census behind it is `sel_census.cjs`. **No user-visible figure moves — test infrastructure** | **OPEN — written, NOT BUILT.** Discharges the second half of **D-NM-1 (c)**; until it is built, the v5.66 shipped note is held safe only by `t35`'s **D-7a** extinction pin. ⚠ **CORRECTION 2026-09-08 (second package): it IS on `package_check`'s I-2 OPEN allowlist, and the row written earlier the same day said it was not.** The entry has been at `package_check.mjs:535` since the scope was written on 2026-09-07, carrying its own expiry — *when the structural field ships*. The false claim was asserted from reading, never from a command, and it shipped to the repo and the pool in the package whose entire subject was stale claims in this file. **§A0, by the session enforcing §A0.** The cheapest possible test would have caught it: the sentence named a state, and no command had printed it |
| `STOP-REPORT-v5_72-import-hardening-session1.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — ☑ **RESOLVED — v5.72 shipped 2026-09-15; retained as the record** (§G: prefer retiring to deleting). *Was:* **The live import-hardening handover (2026-09-15, KIND: handover).** Session 1 of D-6: H-1…H-5 and half of H-6 built as a workbench with `t38` and `controls_v572_import.py`; **no version bump**. Opens **D-10** (the birth-year clamp is dead code). §5 is the stop table — every file, md5 and destination; §4 is what session 2 owes. `docs/` **and** the pool; **no md5 row** (D-3 excludes this class). Rotates to repo-only when v5.72 ships |
| `SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_ME_PHASEOUT_MT_CORRECTIONS.md` — ☑ **RETIRED ON ARRIVAL, v5.73** (its D-10). Maine's phaseout and Montana's two corrections, every legal fact from a primary source; §9 is the build record. `docs/` **and** the pool; no md5 row (D-3) |
| `SCOPE_TOOLING_GAPS_V572.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_TOOLING_GAPS_V572.md` — ☑ **RETIRED ON ARRIVAL, 2026-09-15** (its D-6: written, built and retired in one ops package). The four tooling gaps found at the v5.72 ship; §7 is the build record, including the control harness's phase split. `docs/` **and** the pool; no md5 row (D-3) |
| `SCOPE_PACKAGE_CHECK_DECLARATIONS.md` | — **repo-only, never pooled** — `docs/SCOPE_PACKAGE_CHECK_DECLARATIONS.md` — ☑ **RETIRED ON ARRIVAL, 2026-09-22** (its D-5: written, built and retired in one ops package). `C-7` and `G-3c`: `package_check` checks, before upload, the `RETIRE:` and `chmod` declarations that `J-5` and `G-3a` rely on; §6 is the build record. No md5 row (D-3, retired-scope class) |
| `CHANGELOG_ARCHIVE_pre_v5_60.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_pre_v5_60.md`: every CHANGELOG entry for v5.59 and earlier, moved verbatim 2026-09-15 (§G). The provenance lines for those releases live here |
| `CHANGELOG_ARCHIVE_v5_60_to_v5_74.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_v5_60_to_v5_74.md`: every CHANGELOG entry from v5.60 through v5.74, with the ops entries between them, moved verbatim 2026-09-28 (§G), checked byte for byte against the removed block. Never edited. |
| `CHANGELOG_ARCHIVE_v5_75_to_v5_99.md` | — **repo-only, never pooled** — `docs/CHANGELOG_ARCHIVE_v5_75_to_v5_99.md`: every CHANGELOG entry from v5.75 through v5.99, with the ops entries between them, moved verbatim 2026-10-11 (§G), checked byte for byte against the removed block. Never edited. |
| `TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md` | — **repo-only, never pooled** — `docs/TESTING_ARCHIVE_per_suite_v5_53_to_v6_01.md`: `TESTING.md`'s per-suite count lines from v6.02 back to v5.53, moved verbatim — v6.01 and earlier on 2026-10-11, checked byte for byte; v6.02's appended at the v6.05 ship, v6.03's at the v6.06 ship, v6.04's at the v6.07 ship, v6.05's at the v6.08 ship, v6.06's at the v6.09 ship, v6.07's at the v6.10 ship. Lines are only ever added, verbatim (the name predates all six). |
| `MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md` | — **repo-only, never pooled** — `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`: the manifest's superseded ship notes (v6.03 back to v5.42) and its delete-first lists (v6.03 back to v5.31), moved verbatim 2026-10-11 (§G), checked by reassembly; its §0 traces every open thread in them and in the six documents un-pooled that day. Parts 1 and 2 are never edited. |
| `SCOPE_IMPORT_HARDENING.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_IMPORT_HARDENING.md` — ☑ **RETIRED — FULFILLED AT v5.72 (§10).** ⚠ **SESSION 1 BUILT 2026-09-15 as a workbench (§9); D-4 measured (§3a); D-10 OPEN (§7a).** **NEW 2026-09-15.** A-2, A-4 and A-5 from `FlawsToFix-v5_69-Phase1.md`, **all re-run and reproduced at v5.71** on both import paths, plus `SCOPE_STATE_SET_SELECTOR` stage 2 folded into the same **v5.72** release so the 86-point bump is paid once. Finds a third truthy skin gate, the ordering defect in all eight `applyLoadedData` callers, and **Maine** income-limited in law but missing from the in-law list | **OPEN — NOT BUILT; all nine decisions TAKEN 2026-09-15 (every recommendation approved).** On the I-2 allowlist; expires at the build that retires it |
| `SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — `docs/SCOPE_PACKAGE_CHECK_BLIND_SPOTS.md` — **NEW 2026-09-14, RETIRED IN THE PACKAGE THAT BUILT IT.** The three things `package_check` could not see because they are not file contents: a file committed at an **extra** path (`D-3`), a file that should have **left** the pool (`J-5`), and a **file mode** (`G-3`). All six §5 decisions answered as recommended and built the same day, so this never needed an `I-2` OPEN-allowlist entry — it ships classified. ⚠ It was filed to the repo and pool BEFORE being built, which is what moved its own §1 anchor (HEAD `00f8dc4`/339/134 → `b2b76cf`/340/135); every premise was re-measured before building. §7 carries the build record: one correction to its own text (the control numbers), two control-design faults the controls caught in themselves, and the four `.py` mode fixes that ship as **commit instructions, not files**. |
| `SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` | `docs/SCOPE_RELEASE_GATES_AND_HOUSEKEEPING.md` — **NEW 2026-09-14, OPEN, decided and buildable.** The release gates that did not fire. Its headline is **D-1**: at the v5.71 ship 17 files were uploaded to the repo root instead of `qa/`, leaving a committed `qa/` that could not test its own release, and `package_check` scored 44/2 with both failures documented as expected. D-1 asserts `unchanged.length === 0`, the correct PRE-ship question; §I tells a session to expect D-1 red POST-ship, so a broken upload and a clean one read alike. The post-ship complement — `changed.length === 0` — is already COMPUTED and PRINTED as an informational line and asserted nowhere (33 pre-ship / 17 broken / 0 clean, measured). Also: **B-2** matches `knowledge/index.html` by NAME and calls the 5,029-byte Vite template the 1,428,589-byte built artifact; **F-4**'s `controls_v570_b3.sh` at `100644`; §H's comment claiming a session cannot reach Pages (false — measured 2026-09-14); and two traps for OPERATIONS (`globalThis` vs `window` for `FileReader`; `t31`'s `ORDER` and `t24`'s `_k` as the second and third registry shapes `vercensus` cannot sweep). All six §5 decisions answered 2026-09-14; §7 is authoritative for D-1, whose oracle was refined from `K-2` to `J-1`/`J-2` to drop an ops carve-out. ⚠ Deliberately UNROWED, like the open scope above: a retired or open `SCOPE_*` is history or pending, not build state (D-3). **Named here 2026-09-14, one package late (K-9)** — the same lateness as its `I-2` entry, and for the same reason: the scope was uploaded alone. ⚠ **RETIRED 2026-09-14** in the ops package that built it, with a **§10 build record**; its `I-2` allowlist entry was removed from `package_check.mjs` in the **same** package, as its own entry required. Stays in the pool. §10 carries a seventh decision **D-7** (the v5.71 flattening is the THIRD instance of a shape §C records; the extra-path gate is deferred with a named reason), **three corrections to the scope's own text** — including that §I did **not** record `t33`'s `PINS` (`TESTING.md` did) and that the ternary registry shape has **three** sites, not one — and a finding that **F-4's mode fix could not be delivered as a packaged file**, because `package_check` has no mode awareness and §L records that replacing a tracked file preserves its mode *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_K8_ROW_MATCHER_PY.md` | `docs/SCOPE_K8_ROW_MATCHER_PY.md` — **NEW 2026-09-08.** `package_check` **K-8**'s row matcher does not recognise `.py`, so a stale hash row on any of the pool's three Python files would be **invisible** — verified by execution, not argued: a scratch manifest carrying a deliberately stale `oracle_nm.py` row leaves K-8 green under the current matcher and fires under the widened one. ⚠ **Its §2 is the reason it is a scope and not a one-token edit: an AST census found FOUR live copies of that expression** — the gate, this file's own D-5 count block, `controls_manifest_rows.py`'s target selector, and `P32`'s narrower one — **plus a fifth, in `SCOPE_HOUSEKEEPING_THREE.md`, that has already drifted to the pre-`D-C-1` form.** This file claims its D-5 block *cannot drift away from the gate*; that is true only while both are edited together. ⚠ **Its §1b is the trap**: all three candidate matchers see the same 78 rows on today's manifest, so the change is INERT until a `.py` row exists and any test written against the tree as it stands proves nothing — the endpoint-only table-test class | ☑ **RETIRED — FULFILLED 2026-09-08, the same day it was written.** All five decisions answered as recommended: **D-1 (a)** `py` added, **D-2 (c)** `oracle_nm.py` rowed and the two control scripts not, **D-3 (a)** both copies widened with `row_census.cjs` shipping as the condition, **D-4 (a)** and **D-5 (a)** the two other copies annotated in place. §7 is the build record. ⚠ **It never needed an I-2 allowlist entry** — it was written and retired inside one day, so the gate saw it unclassified in exactly one package and that was expected and stated. ⚠ **Its §1b is worth keeping**: the widening was INERT against the live manifest, so the controls had to INJECT a `.py` row; `P44` fires on the new gate and **NOT CAUGHT** on the old one, which is the witness *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `SCOPE_A3_DRAFT_AUTOSAVE.md` | **NEW 2026-09-12 — the scope for v5.71.** A-3 (the My Data draft autosave has never saved: eight sites call `getItem`/`setItem`/`removeItem` on a storage API that has only `get`/`set`/`delete`/`list`, every throw swallowed by an empty `catch`), with **A-6** (an imported `masterPrompt` is assigned unchecked and heads every Ask AI system prompt) and **F-3** (the first-open gate's unconditional "nothing is uploaded") folded in — one version bump and one rebuild between them. ⚠ Its §0 records three things found while scoping: `clearStorage` covers only the fourteen `STORAGE_KEYS` and **not** the draft key, so repairing A-3 without the wipe path would ship the leak the v5.9.1 review prevented; the suite has **zero** coverage of the draft feature (AST census including regex literals), contradicting `VERIFICATION_REPORT.md`'s v5.9.1 claim of a `t1` guard; and `restoreDraft`, `discardDraft` and the recovery banner have **never executed**. All six §5 decisions approved 2026-09-12 as recommended — ⚠ the 20,000-character prompt cap among them is a judgement, not a measurement | ⚠ **REPO + POOL — `docs/SCOPE_A3_DRAFT_AUTOSAVE.md`.** **OPEN — decided, unbuilt.** On the I-2 allowlist; ⚠ **both the entry and this row expire at the v5.71 build**, which retires the scope with a build record *(repo-only — not in the pool; marked for K-12, 2026-10-12)* |
| `STOP-REPORT-v5_66-nm-session2.md` | — **un-pooled 2026-09-15, repo-only** (§G decision check run line by line; nothing open left behind) — **The live New Mexico handover.** Source written and version-bumped at all four in-app sites; **eighteen suites register `v566`, verified by an AST sweep**; two Connecticut-only assertions **gated, not rewritten**; six new `t34` assertions and `t35` **D-7a**, with five negative controls and two null controls all behaving. ⚠ Records two errors caught by running things and not by review: an assertion that checked only its table's endpoints, and a **workspace drift** that only the null control could have noticed | ☑ **DISCHARGED — v5.66 SHIPPED 2026-09-07. Status corrected 2026-09-08; this row was written mid-build and froze.** Everything it listed as owed has landed: the dollar-exact NM block (`t10` 244 → 288 current, 244 → 248 frozen), METHODOLOGY, the built artifact, packaging, and P1–P28, which **all fired**. The ten `0 passed, 0 failed` suites were diagnosed and none was an app defect — nine run-folder setup, two argument conventions, one real fail-closed in `t33`; `qa/runsuite.sh` now reports `DIED` rather than `0/0`. ⚠ **Its closing line — *"the v5.66 source is NOT in the repo or the pool"* — is FALSE as of the ship** and was left standing for a day: the source is committed at `src/DangerClose.jsx` and pooled as `DangerClose-v5_66.jsx`, both `31b43e094307ef5f996570c090478e13`. **Body kept as the record of the stop; read it as history, not as a resume order.** The one thing genuinely still owed is the selector fix, which is now `SCOPE_STATE_SET_SELECTOR.md` |

⚠ **The suite total being UNCHANGED across the v5.63 fix is not reassurance.** No suite fixture
carries a non-zero income stream, so the changed path is unreachable by every existing check. That
is why the defect shipped. Recorded here because a session reading only the counts would draw the
opposite conclusion.

### Added 2026-09-07 (H-5) — six history documents that were named only in PROSE

**These six have always been in `docs/` and were never broken** — `package_check` **K-9** is
satisfied by a bare mention anywhere in this file, so none of them ever failed a gate. They had no
table row, which means a reader scanning the tables would conclude they do not exist. §G's whole
argument for *retiring rather than deleting* is that a row is what tells a future session a document
exists at all; **by that argument a prose mention is a row that has already half-decayed.**

⚠ **Found by the same table parser that found H-2's 24 stale rows, not by a grep.** A row-anchored
search reported three of these as having no row; the parse found six. The handover that carried the
figure of three said in its own text not to trust a row-anchored grep for exactly this reason.

| File | What it is | Status |
|---|---|---|
| `AUDIT_STATE_EXCL65_ROUND2.md` | Round 2 of the state `excl65` audit; predecessor of `AUDIT_STATE_EXCL65_NOTES.md`, which covered 6 of 19 states | ⚠ **REPO-ONLY — `docs/AUDIT_STATE_EXCL65_ROUND2.md`**. Row added 2026-09-07 (H-5); the document itself is older and unchanged |
| `FINDINGS-v5_54-session-2.md` | Findings from the second v5.54 session | ⚠ **REPO-ONLY — `docs/FINDINGS-v5_54-session-2.md`**. Row added 2026-09-07 (H-5) |
| `STATUS_v5_37_shipped.md` | The v5.37 ship record | ⚠ **REPO-ONLY — `docs/STATUS_v5_37_shipped.md`**. Row added 2026-09-07 (H-5) |
| `STATUS_v5_43_shipped.md` | The v5.43 ship record | ⚠ **REPO-ONLY — `docs/STATUS_v5_43_shipped.md`**. Row added 2026-09-07 (H-5) |
| `STOP-REPORT-v5_54-session-budget.md` | v5.54 stopped on session budget. ⚠ Its version-cost measurement was wrong by a factor of sixty — the finding that `qa/tools/vercensus.cjs` exists to make un-stale | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_54-session-budget.md`**. Row added 2026-09-07 (H-5) |
| `STOP-REPORT-v5_56-session-budget.md` | v5.56 stopped on session budget | ⚠ **REPO-ONLY — `docs/STOP-REPORT-v5_56-session-budget.md`**. Row added 2026-09-07 (H-5) |

⚠ **Two further names appear in prose and are NOT in `docs/` — that is correct, not a gap.**
`STATUS_v5_36_partial.md` and `STATUS_v5_32_ACA_FLOOR_PARTIAL.md` are recorded struck-through as
retired and superseded. They get no row because there is no file. Checked 2026-09-07 against the
committed tree, so the next sweep does not re-open them.

## Retirement list (delete-first; nothing replaces these)

### At the v6.17 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_16.jsx` and `dom_entry_v616.jsx`. **Pool goes 137 → 138** (`t80_home_move_cash.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_16.jsx` | **rotated out** — v6.16 is read from the repo's history (commit `13b281a`) |
| `dom_entry_v616.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `t76_crossover_label.mjs` | replaced |
| `t77_payroll_tax.mjs` | replaced |
| `t78_events_user_facing.mjs` | replaced |
| `t79_self_employment.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_17.jsx`, `dom_entry_v617.jsx`, `t80_home_move_cash.mjs`. **Repo-only:** `controls_v617_home.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.16 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_15.jsx` and `dom_entry_v615.jsx`. **Pool goes 136 → 137** (`t79_self_employment.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_15.jsx` | **rotated out** — v6.15 is read from the repo's history (commit `cbe2eb2`) |
| `dom_entry_v615.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `t76_crossover_label.mjs` | replaced |
| `t77_payroll_tax.mjs` | replaced |
| `t78_events_user_facing.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_16.jsx`, `dom_entry_v616.jsx`, `t79_self_employment.mjs`. **Repo-only:** `controls_v616_se.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.15 ship (2026-10-16) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_14.jsx` and `dom_entry_v614.jsx`. **Pool goes 135 → 136** (`t78_events_user_facing.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_14.jsx` | **rotated out** — v6.14 is read from the repo's history (commit `ec5f16c`) |
| `dom_entry_v614.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `t76_crossover_label.mjs` | replaced |
| `t77_payroll_tax.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_15.jsx`, `dom_entry_v615.jsx`, `t78_events_user_facing.mjs`. **Repo-only:** `controls_v615_events.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.14 ship (2026-10-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_13.jsx` and `dom_entry_v613.jsx`. **Pool goes 134 → 135** (`t77_payroll_tax.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_13.jsx` | **rotated out** — v6.13 is read from the repo's history (commit `756dc76`) |
| `dom_entry_v613.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `t76_crossover_label.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_14.jsx`, `dom_entry_v614.jsx`, `t77_payroll_tax.mjs`. **Repo-only:** `controls_v614_payroll.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.13 ship (2026-10-15) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_12.jsx` and `dom_entry_v612.jsx`. **Pool goes 133 → 134** (`t76_crossover_label.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_12.jsx` | **rotated out** — v6.12 is read from the repo's history (commit `47d6854`) |
| `dom_entry_v612.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `t75_engine_d_ss86.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_13.jsx`, `dom_entry_v613.jsx`, `t76_crossover_label.mjs`. **Repo-only:** `controls_v613_c11.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.12 ship (2026-10-14) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_11.jsx` and `dom_entry_v611.jsx`. **Pool goes 132 → 133** (`t75_engine_d_ss86.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_11.jsx` | **rotated out** — v6.11 is read from the repo's history (commit `8e5133a`) |
| `dom_entry_v611.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `FlawsToFix-v5_73-Phase2.md` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t14_cross_engine_survivor.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t20_other_taxtype.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `t74_ranking_headline.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_12.jsx`, `dom_entry_v612.jsx`, `t75_engine_d_ss86.mjs`. **Repo-only:** `controls_v612_c5.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.11 ship (2026-10-14) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_10.jsx` and `dom_entry_v610.jsx`. **Pool goes 131 → 132** (`t74_ranking_headline.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_10.jsx` | **rotated out** — v6.10 is read from the repo's history (commit `89963eb`) |
| `dom_entry_v610.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `t73_peer_benchmarks.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v6_11.jsx`, `dom_entry_v611.jsx`, `t74_ranking_headline.mjs`. **Repo-only:** `controls_v611_ranking.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.10 ship (2026-10-13) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_09.jsx` and `dom_entry_v609.jsx`. **Pool goes 129 → 131** (`t73_peer_benchmarks.mjs` and `peer_scf.py` arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_09.jsx` | **rotated out** — v6.09 is read from the repo's history (commit `2f25660`) |
| `dom_entry_v609.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `shim.txt` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `t72_engine_d_other_roth.mjs` | replaced |
| `TESTING.md` | replaced |
| `UsabilityFlaws.md` | replaced (no hash row — listed by name only) |

**Arriving new:** `DangerClose-v6_10.jsx`, `dom_entry_v610.jsx`, `t73_peer_benchmarks.mjs`, `peer_scf.py`. **Repo-only:** `controls_v610_peer.py`, the scope (fulfilled), `docs/PEER_SCF2025_figures.txt`, the TESTING archive, the built `index.html`.

### At the v6.09 ship (2026-10-13) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_08.jsx` and `dom_entry_v608.jsx`. **Pool goes 128 → 129** (`t72_engine_d_other_roth.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_08.jsx` | **rotated out** — v6.08 is read from the repo's history (commit `b6eb255`) |
| `dom_entry_v608.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `t71_engine_d_other_ira.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_09.jsx`, `dom_entry_v609.jsx`, `t72_engine_d_other_roth.mjs`. **Repo-only:** `controls_v609_engine_d_roth.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.08 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_07.jsx` and `dom_entry_v607.jsx`. **Pool goes 127 → 128** (`t71_engine_d_other_ira.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_07.jsx` | **rotated out** — v6.07 is read from the repo's history (commit `4cb6859`) |
| `dom_entry_v607.jsx` | **rotated out** with it |
| `boundaries.mjs` | replaced |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `households.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t19_engineD_exact.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `t70_annuity_conversion.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_08.jsx`, `dom_entry_v608.jsx`, `t71_engine_d_other_ira.mjs`. **Repo-only:** `controls_v608_engine_d_ira.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the ops package of 2026-10-12 (E-29 (b), (c), (g), (i)) — DELETE THESE FIRST

10 files replaced, nothing removed, nothing arrives. **Pool stays 127.** v6.07 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-29 (b), (c), (g), (i) fixed |
| `CHANGELOG.md` | replaced — the ops entry; hash row rolled last |
| `controls_runfolder_prior.sh` | replaced — G and H, the harness lock |
| `mk_runfolder.sh` | replaced — `npm ci` from `qa/harness/` (i) |
| `OPERATIONS.md` | replaced — §B, §B2a, §I (K-12), §N3a, the E-1b notes |
| `package_check.mjs` | replaced — E-1b through the manifest's path cell (c); K-12 (g) |
| `package_check_controls.sh` | replaced — P72–P75 |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (50 rows marked for K-12; `qa-baseline-README.md` rowed; the harness rows) |
| `t13_engineC_irmaa.mjs` | replaced — §E, the first death's effect at engine level (E-29 (b)) |
| `TESTING.md` | replaced — `t13` 53; the full-run count |

**Repo-only, new:** `qa/harness/package.json`, `qa/harness/package-lock.json`, `docs/SCOPE_E29_BCGI_OPS.md` (fulfilled).

### At the v6.07 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_06.jsx` and `dom_entry_v606.jsx`. **Pool goes 126 → 127** (`t70_annuity_conversion.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_06.jsx` | **rotated out** — v6.06 is read from the repo's history (commit `9232406`) |
| `dom_entry_v606.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `domdiff_withdrawal.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t2_engines.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t69_annuity_relief.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_07.jsx`, `dom_entry_v607.jsx`, `t70_annuity_conversion.mjs`. **Repo-only:** `controls_v607_annuity_conv.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.06 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_05.jsx` and `dom_entry_v605.jsx`. **Pool goes 125 → 126** (`t69_annuity_relief.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_05.jsx` | **rotated out** — v6.05 is read from the repo's history (commit `11c1d13`) |
| `dom_entry_v605.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_06.jsx`, `dom_entry_v606.jsx`, `t69_annuity_relief.mjs`. **Repo-only:** `controls_v606_annuity.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the v6.05 ship (2026-10-12) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_04.jsx` and `dom_entry_v604.jsx`. **Pool stays 125** (two leave, two arrive). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_04.jsx` | **rotated out** — v6.04 is read from the repo's history (commit `a923332`) |
| `dom_entry_v604.jsx` | **rotated out** with it |
| `ARCHITECTUREIssues.md` | replaced (no hash row — listed by name only) |
| `CHANGELOG.md` | replaced |
| `controls_manifest_rows.py` | replaced (no hash row — listed by name only) |
| `METHODOLOGY.md` | replaced |
| `OPERATIONS.md` | replaced |
| `package_check.mjs` | replaced |
| `package_check_controls.sh` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t68_fed_deductions.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_05.jsx`, `dom_entry_v605.jsx`. **Repo-only:** `controls_v605_fm.py`, the scope (fulfilled), the TESTING archive, the built `index.html`.

### At the ops package of 2026-10-11, third (the manifest's history to the repo; six documents un-pooled) — DELETE THESE FIRST

6 files replaced, 6 removed, nothing arrives. **Pool 131 → 125.** v6.04 stays current.

| Delete | Because |
|---|---|
| `ARCHITECTUREIssues.md` | replaced — E-29, the re-homed non-tax threads |
| `CHANGELOG.md` | replaced — the ops entry; hash row rolled last |
| `controls_manifest_rows.py` | replaced — its B1 demonstration derives its target (its old anchor was in the archived retirement list) |
| `MissingFeatures.md` | replaced — the census at v6.04; closed items' headings carry their status |
| `OPERATIONS.md` | replaced — §B2a (six traps carried from the leaving text), §G, §I |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (old notes and lists archived; eleven leftover roll trails removed) |
| `FlawsToFix-v5_69-Phase1.md` | **un-pooled** — repo copy stays (`docs/FlawsToFix-v5_69-Phase1.md`); delete, do not re-upload |
| `AUDIT_STATE_EXCL65_ROUND3.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_EXCL65_ROUND3.md`); delete, do not re-upload |
| `AUDIT_STATE_EXCL65_ROUND4.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_EXCL65_ROUND4.md`); delete, do not re-upload |
| `AUDIT_STATE_INCOME_BASES_ROUND5.md` | **un-pooled** — repo copy stays (`docs/AUDIT_STATE_INCOME_BASES_ROUND5.md`); delete, do not re-upload |
| `BUILD_BRIEF_v5_49.md` | **un-pooled** — repo copy stays (`docs/BUILD_BRIEF_v5_49.md`); delete, do not re-upload |
| `controls_source.sh` | **un-pooled** — repo copy stays (`qa/controls_source.sh`); delete, do not re-upload |

### At the ops package of 2026-10-11, second (project knowledge trimmed) — DELETE THESE FIRST

4 files replaced; nothing arrives. **Pool stays 131** (`VERIFY.sh` and `ASSESSMENT_HEIR_RATE.md` were already removed by hand that day). v6.04 stays current.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — v5.75–v5.99 archived to the repo; the ops entry; hash row rolled last |
| `OPERATIONS.md` | replaced — §G records the archives; §I: a roll replaces the hash without a trail |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit (the hash rows' roll trail removed) |
| `TESTING.md` | replaced — old per-suite lines archived to the repo |
| `VERIFY.sh` | **un-pooled** — already removed by hand 2026-10-11; delete, do not re-upload |
| `ASSESSMENT_HEIR_RATE.md` | **un-pooled** — already removed by hand 2026-10-11; delete, do not re-upload |

### At the ops package of 2026-10-11 (`package_check_controls.sh`'s v6 source patterns) — DELETE THESE FIRST

5 files replaced; nothing leaves, nothing arrives. **Pool stays 133.** v6.04 stays current.

| Delete | Because |
|---|---|
| `CHANGELOG.md` | replaced — the ops entry, hash row rolled last |
| `OPERATIONS.md` | replaced — §G records the v6.00 miss; §L's two `v5_*` sentences |
| `package_check.mjs` | replaced — `E-2`'s printed label |
| `package_check_controls.sh` | replaced — its four `v5_*` source patterns read any major (P8/P10 run again) |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit |

### At the v6.04 ship (2026-10-11) — DELETE THESE FIRST

**Rotation:** delete `DangerClose-v6_03.jsx` and `dom_entry_v603.jsx`. **Pool goes 132 → 133** (`t68_fed_deductions.mjs` arrives). Count from the Projects listing (OPERATIONS §I, no-mount note).

| Delete | Because |
|---|---|
| `DangerClose-v6_03.jsx` | **rotated out** — v6.03 is read from the repo's history (commit `12a4428`) |
| `dom_entry_v603.jsx` | **rotated out** with it |
| `CHANGELOG.md` | replaced |
| `d30_ref.mjs` | replaced |
| `METHODOLOGY.md` | replaced |
| `MissingFeatures.md` | replaced |
| `PROJECT_KNOWLEDGE_INDEX.md` | replaced — this edit; `CHANGELOG.md`'s row rolled last |
| `runsuite.sh` | replaced |
| `t10_taxcases.mjs` | replaced |
| `t1_units.mjs` | replaced |
| `t23_roth_ladder_rmd.mjs` | replaced |
| `t24_ss86_phasein.mjs` | replaced |
| `t25_engineC_ss86.mjs` | replaced |
| `t26_noconv_span.mjs` | replaced |
| `t27_half_cap.mjs` | replaced |
| `t28_ssB_claim_gate.mjs` | replaced |
| `t29_boundaries.mjs` | replaced |
| `t30_legible.mjs` | replaced |
| `t31_disclosure_parity.mjs` | replaced |
| `t32_ladder_dividend.mjs` | replaced |
| `t33_roth_stream_fica.mjs` | replaced |
| `t34_income_conditioning.mjs` | replaced |
| `t35_state_populate.mjs` | replaced |
| `t36_ai_route.mjs` | replaced |
| `t37_mydata_draft.mjs` | replaced |
| `t38_import_hardening.mjs` | replaced |
| `t39_me_mt.mjs` | replaced |
| `t3_roth.mjs` | replaced |
| `t40_cross_tab_agreement.mjs` | replaced |
| `t41_survivor_age_gains.mjs` | replaced |
| `t42_single_spouse_b_ss.mjs` | replaced |
| `t43_ss86_one_rule.mjs` | replaced |
| `t44_irmaa_top_tier.mjs` | replaced |
| `t45_phone_layout.py` | replaced |
| `t46_scenario_default.mjs` | replaced |
| `t47_phone_first_screen.py` | replaced |
| `t48_legibility_targets.py` | replaced |
| `t49_engineA_draw.mjs` | replaced |
| `t4_dom.mjs` | replaced |
| `t50_ss_states.mjs` | replaced |
| `t51_state_figure_years.mjs` | replaced |
| `t52_age_start_notes.mjs` | replaced |
| `t53_mydata_summary_age.mjs` | replaced |
| `t54_wv_senior_modification.mjs` | replaced |
| `t55_retexempt_age.mjs` | replaced |
| `t56_plan_type_collect.mjs` | replaced |
| `t57_attribution_carry.mjs` | replaced |
| `t58_state_draw.mjs` | replaced |
| `t59_per_person_state.mjs` | replaced |
| `t5_storage.mjs` | replaced |
| `t60_engineA_survivor_state.mjs` | replaced |
| `t61_ga_ok_rates.mjs` | replaced |
| `t62_desktop_disclosures.mjs` | replaced |
| `t63_flat_rates.mjs` | replaced |
| `t64_state_brackets.mjs` | replaced |
| `t65_state_brackets_b2.mjs` | replaced |
| `t66_deductions_askai.mjs` | replaced |
| `t67_deductions_flat.mjs` | replaced |
| `t6_single.mjs` | replaced |
| `TESTING.md` | replaced |

**Arriving new:** `DangerClose-v6_04.jsx`, `dom_entry_v604.jsx`, `t68_fed_deductions.mjs`. **Repo-only:** `controls_v604_feddeduct.py`, the scope (fulfilled), the built `index.html`.

### Older delete-first lists — in the repo

Every delete-first list from the v6.03 ship (2026-10-10) back to the v5.31 refresh, with the notes that sat among them, moved verbatim
on 2026-10-11 to `docs/MANIFEST_ARCHIVE_notes_and_lists_to_v6_03.md`, repo only (OPERATIONS §G). A new package adds its list at the top of this section, as before;
when the lists above grow long, the oldest move to a new archive file the same way.

## Rotation state — **DELETED at v5.32, deliberately**

This section used to restate the current/prior pair and the rotation history. It went stale by five
releases once, was repaired, and went stale again immediately — at the v5.32 build it still read
*"Current pair: v5.29 (prior) → v5.30 (current)"* while the tables at the top of this file said
v5.31/v5.30. Its own standing note said that if it went stale a second time it should be **deleted
rather than repaired**, because the authoritative answer is elsewhere and a duplicated answer is
what goes stale. That instruction is now carried out.

**Where the answer actually lives:** the two tables at the top of this file (current and prior),
and the provenance line at the end of each CHANGELOG entry from v5.12 forward (OPERATIONS §G),
which is the durable record of what every shipped version was.

**What rotating still means, kept because it is a procedure and not a fact:** at each release, roll
the oldest `DangerClose-v5_*.jsx` and its `dom_entry_v5*.jsx` OUT of the pool, add the new current
pair, promote the outgoing current to prior, and update the two tables at the top **and the §A2
hash table** — every changed test file needs its row updated, or the offline fallback lies.

---

## ⚠ Line citations in the 2026-08-18 audit documents were corrected on 2026-08-19

`AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`, `AUDIT_TOP_FIVE_SUMMARY.md`, `MissingFeatures.md` and the
delta-sweep row below all originally cited `src/DangerClose.jsx` line numbers that were **one low**
above L3593. The analysis was run on a working copy with the single-line `DOCS_HTML` literal (L3593)
deleted — the documented anti-grep-dump technique — and the resulting numbers were quoted as if from
the unmodified file.

**All are corrected, and every corrected citation was re-resolved against the shipped source by
confirming the cited line contains the code claimed. No finding or conclusion changed.**

**The durable lesson, because it will recur:** the docs-stripped copy is the right tool for grepping
and the wrong tool for citing. Re-derive any line number from the original file before it goes in a
document. Each affected document carries the errata in full.

## ⚠ The audit documents live in `docs/`, and this manifest indexes the POOL (added 2026-08-18)

**Read this before concluding that any audit phase is incomplete.** On 2026-08-18 a session opened
with a brief naming three tasks in priority order. **Two were already finished** — the Section D
sweep at v5.31, the Section C 2D break-even half at v5.28 — and the third depended on them. The
finished work was in the committed tree at `docs/` and **named in no manifest row**, so it was
invisible to every procedure this project runs. Most of a session's budget went to rediscovering it.

This is **E-14's failure shape, applied to documents instead of tests**: the freshness check hashes
what the pool holds and cannot see what the pool *lacks*. A stale row and a missing file are
indistinguishable from a genuinely open task.

**The three audit documents named above are now in the pool.** The durable guard is the habit:
**when a row says a phase is incomplete, check `docs/` in the committed tree before believing it**
— `git clone --depth 1` then `ls docs/`. The §A2 clone-and-diff already does the clone; this is one
extra `ls`.

The reverse leak also exists and is listed in the repair note: `UsabilityFlaws.md`,
`STATUS_v5_39_shipped.md` and `SCOPE_FIX_docs_v5_39.md` were **pool-only and uncommitted** — Section F
of the standing audit had no version history at all.

## Standing item — the Section D sweep is anchored to v5.31

`AUDIT_PHASE3_SECTION_D_SWEEP.md` concluded that the rendered surfaces and the documentation agree.
That was **measured against v5.31**. Six **modelling** releases have shipped since — v5.32 (ACA FPL
floor), v5.34 (conversion-funding basis tracker), v5.35 (RMD sourcing), v5.36 (drawdown capital
gains), v5.37 (ordinary growth taxed), v5.38 (ACA sale gain into IRMAA) — each adding a term some
surface may still describe in its pre-release form.

**One instance is already confirmed:** the sweep's own **S-1** is still open at v5.39 and has
**widened**. The IRMAA tab (L9792) names five MAGI components; Engine C (L4399) sums seven —
`div_y` (the original S-1) and now `capGain_y`, added at v5.36 precisely so the IRMAA lookback would
see realized gains. The tab that exists to explain IRMAA still tells users those gains are not in the
calculation. Low severity and safe-direction — the app *counts* the income, so no surcharge is
understated — but it is the same "engines synced, prose left behind" failure the sweep was built to
catch, recurring after it, in the same sentence, twice.

**Decided 2026-08-18: re-run the sweep's method over the v5.31 → v5.39 delta.** ✅ **DONE the same
day** — see `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md`. It found **S-1 widened** (above) and one new
finding, **S-3**: `METHODOLOGY.md` L537-538 still says in the present tense that Engine B defaults
realized capital gains to $0, false since v5.36, while a later section of the same document describes
the change correctly. Both Low, both safe-direction, both a one-sentence fix. **Neither is fixed** —
they need a small docs release, and the delta sweep's §6 recommends shipping them together plus an
extinction assertion tying the IRMAA sentence to Engine C's `magi` expression.

## Open items a session should know about (not a task list — orientation)

> **⚠ 2026-09-11 — the standing audit's Phase 1 was re-run at v5.69** (`docs/FlawsToFix-v5_69-Phase1.md`, repo-only).
> Two MEDIUM findings, both undisclosed and unscoped, with decisions put to Steve: **A-3**, the My Data draft autosave has
> never saved; **B-3**, keyless Ask AI on a self-hosted copy sends the plan to the page's own host. A-4…A-6 LOW; A-2 still open.
> **B-3 is FIXED at v5.70** (2026-09-11; `docs/SCOPE_B3_KEYLESS_AI_ROUTE.md` retired with its build record), **and VERIFIED ON THE
> LIVE SITE the same day** (`docs/STATUS_2026_09_11_b3_live_verification.md`, repo-only): GitHub Pages serves `372d066c…`, byte-identical
> to a same-session rebuild, and the live download sends nothing without a key or a Local Model. ⚠ Still owed: Steve's real-browser check
> (a line is reserved for it in that record's §4). A-3 is next; the public note about B-3 can go out now. That record's F-1…F-7 are the
> open housekeeping items (F-1 with A-3; F-2, F-3, F-4 to a housekeeping scope; F-5 and F-7 corrected in the same package).

1. **The first-death class IS closed, as of v5.14.** C-2C-3 (v5.11), C-2C-4 (v5.12), C-2C-5 (v5.13)
   and C-2C-6 (v5.14) are all fixed: every engine models the first death in Social Security *and*
   separates the death event from the filing switch. The guard is `t14_cross_engine_survivor.mjs`,
   which now asserts **both** halves — at v5.13 it asserted only the first, which is exactly why
   C-2C-6 slipped past it and had to be found by hand. The lesson kept from the v5.13 refresh, where
   this line wrongly said the class was already closed: a class-level invariant only closes the part
   of the class it actually asserts, and "every engine does X" should be read as a claim about X.
2. **C-2C-4 is CLOSED**, and its header was corrected 2026-08-09. Worth noting *why* it went stale:
   the closing work happened inside a scope document, and nothing wrote the outcome back to the
   finding. A finding is read on its own; a status that lives only in the scope that resolved it is a
   status nobody sees. Writing the outcome back is now part of retiring a scope.
3. **F-2B-1 / F-2B-2 are FIXED at v5.14**, together, through one shared threshold helper. `t10`'s two
   dated `[KNOWN DEFECT]` pins are flipped and its 30 tier borders re-derived against premium-year
   indexing. **A related defect stays open:** `FINDING-C-2B-3` — a fifth copy of the threshold
   arithmetic, in the Roth ladder table, on a 3%/yr inflator with a hardcoded married base. It runs
   the *opposite* direction (non-conservative) and was deliberately held back so three pessimistic
   corrections and one optimistic one did not land in the same release. **Now amended to HIGH and
   scoped** — its prerequisite was executed and the defect is far wider than the IRMAA cliff.
4. **The Roth tab still runs its own private tax engine — now correct, but still duplicated.** v5.15
   fixed its filing status, IRMAA helper and survivor transition (C-2B-3); **v5.20 fixed the last
   known figure defect in it — the §63(f) age-65 additional standard deduction, which the ladder
   omitted entirely while Engines A and B both applied it.** Worth ~$5,300 of overstated federal tax
   on the example household, and a same-screen contradiction with the comparator directly below it.
   The duplication itself REMAINS: the ladder still carries its own tax arithmetic rather than
   routing through Engine A. The intended direction is still to delete it and use the engine. That is
   unscoped, and each release that patches the ladder instead adds a little to what consolidation
   will have to reproduce — v5.20 was the second such patch, taken deliberately on the v5.15
   precedent because the wrong number was on screen and consolidation is not imminent.
   **Note the pattern in how these were found:** both were invisible because a comment beside the
   code explained a *different* provision convincingly. At v5.20 the note discussed the OBBBA bonus
   deduction, analysed it correctly, and never mentioned §63(f) at all — so it read as a reasoned
   decision about an omission it never addressed.

5. **Phase 2 is incomplete.** **2D is IN PROGRESS** — its *completeness* half is now done to the
   Section C standard (executed, not inferred); its *Roth break-even* half remains a premise reading
   and still owes the crossover arithmetic and the `t10` cases. 2E (state tax) has not been run.
   Sections D, E, F not started.
6. **The headline 2D finding is `D-2D-3`, HIGH, and the engines DISAGREE about it.** `otherAccounts`
   — HSA, annuities, state plans, outside brokerage, **and explicitly named traditional IRAs** — is
   read by the Monte Carlo (grown) and by **Engine D as entirely taxable** (`household − total401k`,
   L7025), and is **invisible to Engines A, B, C and the Roth ladder** (all use the `positions`
   residual). So the same account is taxable on one tab and absent from another. On the shipped
   example household that is **$147,000, 8.9% of net worth**, incl. **$90,000 named "Rollover IRA" /
   "Traditional IRA"** producing no RMD anywhere.

   ⚠ **CORRECTED 2026-08-10 against v5.21 — three of the claims above are wrong as stated, and the
   line numbers are v5.15's.** Engine D applies **zero** tax to these draws, not capital-gains:
   `magi` (L7686) omits `drawFromTaxable` entirely, so $111,000 of tax-deferred money is spent
   tax-free and RMD-free. The treatment is **mischaracterized rather than undisclosed** — MyData
   L11211 states accurately that Other accounts aren't classified, while Withdrawal L7822 calls the
   same money "already-taxed principal" and the Field Manual calls it "non-retirement." And **the
   Roth tab does read `otherAccounts`** (L8384), so the "invisible to the Roth ladder" row is true
   of the ladder's arithmetic and false of the tab. Engine D's pot is now at **L7528**.

   ⚠ **The structural trap is EXECUTED, not inferred**: folding without moving Engine D's derivation
   drives the taxable pot $147K → **$0** with **no throw and no warning**, and $21,000 of genuine
   brokerage leaves the tab's accounting entirely. Bucket weights survive on the backup-load path.
   `total401k` has **three different derivations** across the three entry paths, so the same fix
   collapses the pot on one and **double-counts** on another — a single-path test would pass.

   **D-2D-2 is seven sites, not five** (L3847, 4056, 4353, 8384, 8432, 8566, 9706) — hoisting Engines
   B and C multiplied the copies. All seven verified identical by normalized AST fingerprint.
   **`D-2D-1` is WITHDRAWN.**

   ⚠ **CORRECTED AGAIN 2026-08-11 at v5.24 — read this before touching `magi`.** The line above says `magi` omits `drawFromTaxable` "so $111,000 of tax-deferred money is spent tax-free." The fact is right; the implied fix is wrong. `drawFromTaxable` is a TAXABLE-BROKERAGE withdrawal, mostly return of basis — adding it whole to MAGI would tax returned principal as ordinary income. The source says so at the line, and Engine B agrees (realized gains default to $0 unless a sale is modeled). **The defect is the classification feeding MAGI, not MAGI.** Release (b) was re-scoped as disclosure-only and shipped at v5.24; the modelling fix is release (c), which must do classification + MAGI + RMD as one unit. This finding has been stated wrongly four times across three documents.

   **Now scoped** in `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` (revision 2), **§7 decisions
   RESOLVED 2026-08-10**, split by D-7 into three releases: **(a)** consolidate the residual
   (`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`, next build, no open decisions) · **(b)** Engine D
   `magi` + the false copy · **(c)** fold and classify. HSA is held **out** of the tax split, honouring
   the v5.10 `contribAccrual` decision.
   **Note the process failure recorded in rev 3 §1**: two of these findings were first stated wrongly
   because one code path was verified and a conclusion drawn about all engines — the same error as the
   v5.13 "class is CLOSED" claim, repeated twice in one audit.
7. **The consolidation work is COMPLETE for the hoists, and one export remains.** `taxFactsFor`
   (v5.16), Engine C hoisted (v5.17) and exported + `t17` (v5.18), **Engine B hoisted (v5.19)**.
   **No engine is computed inside the render any more.** Every one of those releases proved itself
   the same way: every pre-existing figure identical, parity 8/8 strict.
   **The one thing left in this line:** export `computeTaxPlan` through `shim.txt` and write Engine
   B's dollar-exact suite, the way `t17` did for Engine C. `t17` is the template. Until it ships,
   Engine B is *hoisted but still measured at ±$500*.
   Three method lessons kept from these releases: the v5.17 pre-build census was wrong in three
   places (one return-surface entry existed only because a text search matched an English word in
   the tab's prose); the v5.18 scope's first revision called a disclosed rounding an undisclosed
   finding after checking two places and concluding "everywhere"; and at v5.19 the census was
   re-verified with a parser before any code, found unchanged, and the hoist came out clean on the
   first pass. **Use a parser for census questions. "Undisclosed" requires looking everywhere.**

8. **CLOSED at v5.17: the stale comment in Engine C.** It claimed the engine "still pays BOTH SS
   benefits and does not switch filing at death" — true at v5.11, false from v5.13, and left standing
   for four releases. All three of its claims were re-checked individually, each at its own line, before
   it was rewritten. Comment-only. This was the C-2C-4 stale-header failure recurring, and it is worth
   noting what actually caught it: not a test, since no test reads comments, but a build brief that
   listed it as a known wart. Comments have no guard rail.
9. **CLOSED at v5.21: no engine is behind the ±$500 ceiling at all, structural or measured.**
   Engine C hoisted v5.17, exported and asserted v5.18 (`t17`). Engine B hoisted v5.19, exported and
   asserted v5.21 (`t18`). The DOM suites (`t13`, `t14`, `t16`) still read at ±$500 deliberately —
   they are the extinction invariants and the only proof the tabs render what the engines compute.
   **New standing invariant from v5.21:** Engines A and B are PARALLEL implementations of the same
   statute — Engine A calls none of `fedOrdinaryTax` / `ltcgTax` / `marginalBracket` and carries its
   own inline copies, while Engine B calls all three and `taxFactsFor` nine times. v5.16's
   consolidation reached B thoroughly and A barely. `t18` case 10 asserts they agree, and they do — but only on pure ordinary income (SS/LTCG/NIIT/AMT/FICA/state all zero in all six cases), so the AMT difference above is NOT yet compared.
   Consolidating Engine A onto the shared helpers is unscoped, and the invariant makes deferring it
   safe rather than merely tolerable.
   **`t18` covers four of the ten scoped case groups.** Still uncovered: LTCG stacking, NIIT, AMT,
   FICA, state tax, survivor transition — all reachable now, all named rather than implied.

10. **The suite count is 701 at v5.18** (638 pre-existing + the new `t17`), and was misreported as 634 for two releases before v5.17. Corrected at v5.17. The
   error was a sub-total in `TESTING.md` — the nine feature suites were added as 244 where they sum to
   248 — which then propagated into the v5.15 and v5.16 CHANGELOG headlines and into the v5.17 build
   brief. No test was ever missing. Third recorded instance of a hand-computed total being wrong in this
   project's documentation; parse the suite output.

11. **`t15` defaults to the version tag `v514`** (`process.argv[2] || "v514"`) and dies with a module-
   not-found error if run bare, because `app_v514.mjs` no longer exists. It is green only when the tag is
   passed explicitly. This is the enumerated-tag trap the release checklist warns about, in its most
   brittle form. Left alone at v5.17 on purpose — editing the suite during a refactor weakens the proof
   the refactor rests on — but it should be fixed in the next release that touches the harness.

12. **A cross-engine divergence found at v5.13 and deliberately left alone:** Engines B (Taxes) and C
   (IRMAA) hold Social Security flat in today's dollars while Engine D (Withdrawal) COLA-indexes it.
   All three model the same transition in the same year; they do not share a dollar basis. This is
   the bracket-creep conservatism described in METHODOLOGY §5, not a defect — but it is the reason
   t14 asserts timing and rule rather than a single figure, and it is a candidate for its own scope
   if the tabs should ever be reconciled.
