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
| Version | **v5.42** |
| Source file in knowledge | `DangerClose-v5_42.jsx` |
| Source md5 | `976a03fe16cd401b9735bbb21675bf5f` |
| Built `index.html` md5 | `2ede63fd5d64c7318da975437218e7b1` |
| Shipped | 2026-08-21 |

> **Rolled 2026-08-21 at the v5.42 ship, in the same session that built it** — the second
> consecutive roll without a lag. The v5.41 freshness check confirmed this table was correct for
> the first time, and the v5.42 check confirmed it again: all five hashes the build brief recorded
> matched a fresh clone exactly.
>
> ⚠ **v5.42 changes modelling on the Roth tab, and it moves figures DOWN** — unusual here, and
> stated for that reason. The conversion ladder's §86 upper tier was a cliff to 85% of benefits; it
> now phases in per §86(a)(2). MAGI, taxable income, tax, marginal rate and IRMAA risk all FALL for
> affected households, by up to $38,030 of MAGI in a single year. **The effect is $0 at the $70,000
> conversion-slider default** and only appears at lower slider positions — so any measurement of
> this tab taken at the default is not evidence about §86 behaviour. Any scope premise written
> against v5.41's Roth ladder must be re-verified before use.
>
> ⚠ **Two §86 divergences are open and documented, not defects to re-discover.** (1) The IRMAA
> engine does not implement §86 at all (flat 85%), so it and this tab legitimately disagree by up
> to $46,920 below provisional income ≈ $92,000. (2) The Roth tab's **middle** §86 tier caps at 85%
> of benefits where the statute caps at ½ — found during the v5.42 build, bounded at $2,468 joint /
> $1,850 single, needs benefits under $12,000, $0 on the example household, pinned by `t24` §D.
> Both are in METHODOLOGY; neither is fixed.

**Any work — edits, verification, scope premises — is done against this file.** Confirm its
md5 matches the value above before starting (see the pre-build freshness check in
OPERATIONS.md §A). A mismatch means knowledge is stale — refresh before working.

## Test and harness file hashes (freshness fallback — OPERATIONS §A2)

**Why this table exists.** Until v5.30 the freshness check hashed the `.jsx` sources and nothing else,
so a stale test in this flat pool was invisible by construction. One was: the pool's `t8_invariant.mjs`
was an older 35-check copy with 3 failing assertions while the committed file had 38 and was green,
which halted the v5.30 build and cost most of a session to diagnose. Recorded as **E-14**.

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

**Two mapping caveats.** The pool flattens repo paths: `tools_fixture.jsx` here is
`qa/tools/fixture/fixture.jsx` in the repo (byte-identical), and the baseline suites live under
`qa/qa-baseline/`. Match by content, not by filename position.

| Pool file | md5 | Repo path |
|---|---|---|
| `cap_tabs.mjs` | `9057b96d48b84f99dc322f7fc983674a` | `qa/qa-baseline/cap_tabs.mjs` |
| `capture_gain_fp.mjs` | `99f096c7c332b5ec7a87949681386a71` | `qa/capture_gain_fp.mjs` |
| `domdiff_withdrawal.mjs` | `4ebd61793fd50bd6c446c6773ef2b10a` | `qa/domdiff_withdrawal.mjs` — **gated per leg 2026-08-21 at v5.42**, 31/1 → **32/0**. Its pre-v5.40 MAGI-sentence check had been left PAIR-SPECIFIC with a note to re-point that was never acted on, so it had been false for every prior leg from v5.40 onward and went red at the v5.41 → v5.42 pair **with no code change** — the §B2 gating rule, applied to a cross-build assertion instead of a disclosure. Previously re-pointed to v539 → v540 and IRMAA-anchor-fixed 2026-08-20 (was `f31c743b…`, three releases stale). Tooling — counted in no app total |
| `env_dom.mjs` | `0ee15a1be6099a50319cfb271b530c4a` | `qa/qa-baseline/env_dom.mjs` |
| `main.jsx` | `d9eca7b469a3fb7ec1c5325fd4bf8145` | `src/main.jsx` |
| `index.html` | `52ef2be3080352df6198ee3b8c3507ad` | `src/index.html` — the **Vite entry template**, **restored to the pool 2026-08-20** after being found absent (see the build-scaffold row below). ⚠ **Not the built app.** The published single-file `index.html` is repo-only output and never enters the pool; its md5 is in the Current build table and is different by construction |
| `probe_withhold_gain.mjs` | `b7fbc3fc34a0684c88b79123ddcda57c` | `qa/probe_withhold_gain.mjs` |
| `shim.txt` | `fec4551cd77cb2d4be0b19f6c54bb621` | `qa/qa-baseline/shim.txt` |
| `smoke_built.mjs` | `bc839044971ecd992bb9f4f019736d1e` | `qa/smoke_built.mjs` |
| `t10_taxcases.mjs` | `bcd00a8fad74d81c88e05f928aa8b5ec` | `qa/t10_taxcases.mjs` |
| `t11_survivor_rmd.mjs` | `dfa8ce062d9ae3bcca551a561ce717a8` | `qa/t11_survivor_rmd.mjs` |
| `t12_engineD_survivor.mjs` | `70fb865322692e042d364ca85437cc51` | `qa/t12_engineD_survivor.mjs` |
| `t13_engineC_irmaa.mjs` | `0be204b0d180fb40cf9bc7790f1c73ee` | `qa/t13_engineC_irmaa.mjs` |
| `t14_cross_engine_survivor.mjs` | `83ad5441e9574074567f21185ad17074` | `qa/t14_cross_engine_survivor.mjs` |
| `t15_engineA_death_filing.mjs` | `3fb4c83fd888ac6cad0ab0d57b8dba6b` | `qa/t15_engineA_death_filing.mjs` |
| `t16_roth_ladder_filing.mjs` | `829c97c01efeb707da011c1468fefbb5` | `qa/t16_roth_ladder_filing.mjs` |
| `t17_engineC_exact.mjs` | `5eef71d2385058d847cc53018a3fae67` | `qa/t17_engineC_exact.mjs` |
| `t18_engineB_exact.mjs` | `7272f97181e0764204eef087f3810380` | `qa/t18_engineB_exact.mjs` |
| `t19_engineD_exact.mjs` | `256ff3681548966735569c5034164dac` | `qa/t19_engineD_exact.mjs` |
| `t1_units.mjs` | `818f9b1a387398831bd3cf432a51c826` | `qa/qa-baseline/t1_units.mjs` — **rolled 2026-08-21 at v5.42** (+4 `STRUCT S-3` checks pinning the §86 upper tier as a phase-in, gated per leg so pre-v5.42 legs keep a dated `[KNOWN DEFECT]` pin asserting the cliff; plus `v542` registered across **five** nested ladders, `KNOWN_VERSIONS`, the `verStr` ladder and the `V540`/`V541` gates). **121 checks on v542, 117 on v541.** Previously **rolled 2026-08-20 at v5.41** (+5 `STRUCT S-2` checks pinning the ROTH TAB's `magi` term set by AST, gated per leg, plus `v541` registration). S-1 pinned Engine C's term set and left the Roth tab's unpinned — that gap is why the omitted-RMD defect survived. **115 checks on v541, 110 on v540, 94 on v539** |
| `t20_other_taxtype.mjs` | `9640ce1e4006c7ba6b30a29639ef428b` | `qa/t20_other_taxtype.mjs` |
| `t21_tools.mjs` | `c5fb4c712135028f1effa039c84e0b90` | `qa/t21_tools.mjs` |
| `t22_aca_floor.mjs` | `e8b52e06c38a095ac6eea830ac2dd84d` | `qa/t22_aca_floor.mjs` |
| `t23_roth_ladder_rmd.mjs` | `9fd21801580f108b28c4cc688992e8fd` | `qa/t23_roth_ladder_rmd.mjs` — **NEW at v5.41.** The Roth ladder's RMD-term invariants. ⚠ **Split precision, by necessity (OPERATIONS §M):** the ladder is a COMPONENT-INLINE engine, so MAGI reads from the DOM at `Math.round(x/1000)` — **±$500** — while the RMD cards render full dollars and ARE pinned exactly ($44,991). Gated per leg: **25 checks on v542 AND on v541 — identical, and that is the point**: its pins sit at the $70,000 conversion default, where v5.42's §86 fix correctly moves nothing, so an unchanged t23 is the evidence that release did not overreach. Only the version registry and `POST_FIX` were touched at v5.42; **no assertion changed**. 21 on v540, that leg asserting the PRE-FIX figures deliberately so the legs are the before/after witness |
| `t24_ss86_phasein.mjs` | `de9c8ed81ed0e10cc51fc61512074a5b` | `qa/t24_ss86_phasein.mjs` — **NEW at v5.42.** The §86 upper-tier phase-in invariants. ⚠ **This suite DRIVES THE CONVERSION SLIDER** and must, because the defect it pins is worth $0 at the $70,000 default — assertions at the default prove nothing about it. The control is a **React controlled input**, so `.value` assignment is swallowed; it goes through the native `HTMLInputElement` prototype setter followed by an `input` event. Asserts all 12 ladder years at **$15,000 / $20,000 / $30,000 / $50,000 / $70,000** against `statute86`, computed rather than hardcoded. Gated per leg: **38 checks on v542, 34 on v541**, the v541 leg asserting the pre-fix cliff figures — which also proves the suite's ladder transcription is faithful. Precision **±$500** (§M); the effect is $4,200–$38,030. Carries the middle-tier `[KNOWN DEFECT]` pin at §D |
| `hand_86.mjs` | `981b425c4fc738abb49046a97cd0fea0` | `qa/tools/hand_86.mjs` — **PROMOTED TO SUITE ORACLE at v5.42** and added to the pool (it was repo-only through v5.41, which is why the v5.42 brief had to record its hash separately). `statute86` is transcribed from 26 U.S.C. §86 at law.cornell.edu, **not from any app expression**, and is imported by BOTH `t24` and `qa/tools/derive_v542.mjs` — one oracle on both sides, deliberately, because at v5.41 a second independent derivation drifted and the brief's table shipped wrong twice. ⚠ **The three app copies inside it are v5.40 transcriptions and are now HISTORY** — `rothTab` records the cliff v5.42 replaced. Asserts nothing; counted in NO check total |
| `controls_v542.sh` | `66a923e87b585b4f8dd843e7fe3e8ca9` | `qa/controls_v542.sh` — **NEW at v5.42**, the re-pointed successor to `controls.sh`. All 13 v5.38-era patch anchors were verified to still resolve **exactly once** against v5.42 source before re-pointing; C16–C21 added for the §86 work. Supersedes the stale `controls.sh` row above — retire that file at the maintainer's discretion |
| `t2_engines.mjs` | `9a9ba167634ee29c645830ccdd7d6ca9` | `qa/qa-baseline/t2_engines.mjs` |
| `t3_roth.mjs` | `85cc622b11decbac9f22427c2c5f5bc2` | `qa/qa-baseline/t3_roth.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t4_dom.mjs` | `002afc222da1732172d41d8e219dbea1` | `qa/qa-baseline/t4_dom.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t5_storage.mjs` | `28066dd7c5219dada3013dc089c6f923` | `qa/qa-baseline/t5_storage.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t6_single.mjs` | `7dec1d00685497288ba4ac737225252a` | `qa/qa-baseline/t6_single.mjs` — **rolled to v5.42** (`v542` registered; the fail-closed version guard caught all four at the first suite run, which is it working). Previously rolled to v5.41 |
| `t7_accrual.mjs` | `fd0ab4282e31d8a7e170606c877c28d0` | `qa/t7_accrual.mjs` |
| `t8_invariant.mjs` | `a9bd015c8b50b54a98d0ed9a4e2afaaf` | `qa/t8_invariant.mjs` |
| `t9_dom_smoke.mjs` | `080c3edbe5f5479ac488d2f54034de69` | `qa/t9_dom_smoke.mjs` |
| `runsuite.sh` | `9418687e9a0359cfe9e29fd1b9352ef0` | `qa/runsuite.sh` — **rolled at v5.42**: `t23` and `t24` adopted into the routine run, both legs each. NEW at v5.36 (parse-only totals runner with the DIED verdict) |
| `tools_fixture.jsx` | `3602b615b65f09995a9eb1fa17fe4175` | `qa/tools/fixture/fixture.jsx` |
| `dom_entry_v542.jsx` | `7ca93a22cf92c50f35f369d5c15f2cbf` | `qa/qa-baseline/dom_entry_v542.jsx` — **NEW at v5.42**, the current leg |
| `dom_entry_v541.jsx` | `ae195e7e7d220fe3065684e8266cd2c2` | `qa/qa-baseline/dom_entry_v541.jsx` — now the PRIOR leg's entry. `dom_entry_v540.jsx` rotated OUT of the pool with its source |
| `gate_v538.mjs` | `585a90322d5a56ec7bed955eb9b5c67a` | `qa/tools/gate_v538.mjs` — committed at v5.38; retire from pool at next refresh if desired |
| `VERIFY.sh` | `d6c31723f3610a16cd0d2ae2f1931a68` | `VERIFY.sh` (repo root) — row added 2026-08-17; its absence here is how the v5.36→v5.37 pool drift stayed invisible (scope v5.38 §0) |
| `SCOPE_v5_38_aca_sale_gain_tax.md` | `77bda5bbce1e9bb3008566b57350aff1` | `docs/SCOPE_v5_38_aca_sale_gain_tax.md` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |
| `DERIVATION_v5_38_step1.md` | `6e6b2794fba1c1a7623720a442edfa02` | `docs/DERIVATION_v5_38_step1.md` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |
| `sim_ledger.mjs` | `a8d275a4ea7325a5500491f4b6b25058` | `qa/tools/sim_ledger.mjs` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |
| `validate.mjs` | `5e18e78e494c831a1a01d3623bbd43e9` | `qa/tools/validate.mjs` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |
| `case1_detail.mjs` | `0d94612058e013a00dcbcb2896254536` | `qa/tools/case1_detail.mjs` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |
| `project.mjs` | `cf964df972be31b133d0630bcbf2d4c7` | `qa/tools/project.mjs` — v5.38-prep; **committed at the v5.38 ship**, note corrected 2026-08-20 |

`probe_classify.mjs` was removed from the pool at v5.30 and now lives only in the repo at
`qa/tools/probe_classify.mjs`. (OPERATIONS §A2 asserted the exact opposite — *"exists only in
knowledge"* — from v5.30 until 2026-08-20, when the clone-and-diff caught it. This row was right
the whole time; the two documents simply disagreed and nothing compared them. Corrected in
`OPERATIONS.md`.)

The v5.38-prep files were committed to the repo at the v5.38 ship. The pool still carries
copies of the scope, derivation memo, and the five derivation instruments — harmless duplicates
of `docs/` and `qa/tools/`, listed above with their true hashes; retire them (rows deleted in
the same edit) whenever the maintainer chooses.

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
| `qa/tools/d3_cap_sweep.mjs` | `c737fb6aff51bfe020498d73688bf18b` | Sweeps the D-3 conversion cap across the slider range × Traditional balances. Produced the "worst case $252, $0 on both measured households" figure that resolved D-3 |
| `qa/tools/derive_rmd_expectations.mjs` | `0cfa92b929735f5207eab517c9b7adfb` | The v5.41 pre-build derivation. ⚠ **KNOWN-WRONG IN TWO WAYS, LEFT UNCORRECTED DELIBERATELY** — see the warning below |
| `qa/tools/engineC_threeway.mjs` | `9caf5fb27267cecc2bfc8d4637283f45` | Drives Engine C against the Roth tab and a hand computation for three-way agreement |
| `qa/tools/hand_86.mjs` | — | ⚠ **NO LONGER REPO-ONLY. See its row in the §A2 table above** (pool name `hand_86.mjs`, md5 `981b425c4fc738abb49046a97cd0fea0`), where it was promoted to SUITE ORACLE at v5.42 and added to the pool. This row is kept as a pointer, not a second hash: it carried `ad9688928e9a897b62951e5e22ba280e` — the pre-v5.42 content — for a few hours after the v5.42 refresh, so the manifest briefly held **two rows for one file with two different hashes**, one of them stale and both claiming authority. Caught by the post-ship sweep on 2026-08-21. **A file promoted out of this section must have its row here converted to a pointer in the same edit**, or the §A2 fallback has two answers and no way to tell which is current |
| `qa/tools/hh3.mjs` | `8bd8d8cd1c56eac1052ad87cff29671f` | The third (straddling) household fixture — the one whose error is 59% dividends/gains |
| `qa/tools/ladder_hand.mjs` | `590234628df6a96e84dd3223a54fe2f3` | Hand replication of the ladder loop; one of the two independent scripts agreeing on $167,131 |
| `qa/tools/render_check.mjs` | `88711e45ca98e8e63599488699ceeca3` | Reads the RENDERED ladder table out of jsdom. ⚠ Its imports are written for the RUN-FOLDER ROOT, not `qa/tools/` — copy it up a level to run it |
| `qa/tools/slider_rerun.mjs` | `4fbbbdb5bc83505cdf994bb5a9b9027f` | Re-runs the ladder across slider positions; produced the direction-flip table in the measurement |

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
| Version | **v5.41** |
| Source file in knowledge | `DangerClose-v5_41.jsx` |
| Source md5 | `18152190e9b699529642ae2983b3ae2c` |
| Built `index.html` md5 | `74355c8b66d5024b99fcc6fb19f100cb` |

> **Rolled 2026-08-21 at the v5.42 ship, in the same pass as the Current build table above** — and
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
| `METHODOLOGY.md` | Modeling methodology | releases that change modeling (**updated at v5.12** — per-spouse RMD/survivor section now states which engines implement it; two survivor-year simplifications and one IRMAA limitation disclosed) |
| `TESTING.md` | Suite description + counts | when the suite changes |
| `README.md` | Repo/setup README | when it changes |
| **Test files — enumerated, never elided.** A range written as "t1 … t9" hides whatever sits inside it; `t10` was invisible for exactly that reason. Every file gets its own line. | | |
| `t1_units.mjs` | Units & statics (asserts the four in-app version strings — a stale bump fails here). **+16 at v5.33:** the `taxableGainPct` field and its default, the `taxableGainShare` export, a nine-case clamp table hand-verified input by input, and **AST** checks that the accessor is defined once and called by NOBODY. The call-site check is deliberately an AST node count, not a line match — two of the three textual occurrences at v5.33 are comments | when tests change |
| `t2_engines.mjs` | Engines + **cross-version MC parity** (`compare` must stay **9/9** — it was 8 until the E-15 addendum of 2026-08-14, which added the premium-positive ACA household). Carries TWO fingerprint households: the original derives from `PORTFOLIO()`/`PLAN_TIMELINE()`, the ACA one is **fully explicit and must stay that way** so example-data changes cannot silently rewrite the fingerprint | when tests change |
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
| `t14_cross_engine_survivor.mjs` | Cross-engine survivor SS invariant (decision D-5) — **44 checks**; the only cover for Engine A is structural, and the file says so. **D-4 addendum 2026-08-14:** source windows are **bounded** (anchor → start of the next top-level function), not fixed character spans — a span ages as the engine grows around the rule and then fails looking like an app regression. Both bounds asserted unique; a missing end marker fails loudly, never falls back. ⚠ Engine D's death check asserts the **absence of the weakened `>` form**, which is sound only because Engine D has **no filing concept** — if it ever gains one, that assertion must MOVE to `filingEngines`, not be deleted | when tests change |
| `t16_roth_ladder_filing.mjs` | Roth ladder filing-status extinction invariant (C-2B-3, v5.15) — 24 checks against an independent IRS reference, incl. that the couple's ladder does NOT move | when tests change |
| `t17_engineC_exact.mjs` | Engine C dollar-exact (v5.18) — **74 checks at v5.36** (+11: the `gainByYr` consumption block — exact MAGI and headroom pass-through, tier climb, default equivalence; control C9 fires 5 of them). Originally 63 checks against CMS figures via the module-level `computeIrmaaPlan`; tier borders ±$1, indexation, freeze, lookback, per-person counts, survivor switch, QCD. Negative-controlled at 23/63. Asserts the surcharge constants' ≤$5 **bound**, not CMS-exact amounts | when tests change |
| `t18_engineB_exact.mjs` | Engine B dollar-exact (v5.21) — **67 checks at v5.36** (+17: the `gainByYr` consumption block, hand-exact — $10K gain → MAGI +$10,000, ordinary tax +$0, LTCG +$1,500, NIIT +$380, total +$1,880 — and the E-16 provisional-income fix pinned at the 85% statutory cap; controls C8 and C12 fire it). The v5.21 note 'NOT yet covered: LTCG, NIIT' no longer holds — both are exercised by the gain path. Originally 50 checks via module-level `computeTaxPlan`; federal brackets, age-65 extra per spouse, SS taxability, **plus the first Engine A vs Engine B agreement invariant** (they agree). Negative-controlled at 24/47. NOT yet covered: LTCG, NIIT, AMT, FICA, state, survivor | when tests change |
| `t19_engineD_exact.mjs` | **65 checks at v5.37** (+8): two exact pins (mixed-household lifetime MAGI $3,162,820 — the ordinary growth recognised, was $3,132,746 — and lifetime gain $89,673 UNCHANGED, the census-verified blast-radius witness), an in-suite INDEPENDENT LEDGER (own IRS Pub 590-B divisor table) that must reproduce the published pool/sub-pool/gain/basis to the cent every year before its report is trusted, and the §8-3 conservation report (one-sided `taxOrd + taxGainPool ≤ taxable` all years; the growth cap binds ZERO years — control C13 fires it). Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. ⚠ The pin needed a **purpose-built household** — two earlier drafts written against `t19`'s own fixture asserted nothing, because `drawNeeded` exceeds `rmd_y` in every year of that schedule, so every taxable draw it makes is genuine. The defect requires guaranteed income large enough to cover expenses. **57 checks at v5.36** (32 at v5.35): the v5.36 block asserts the gains-bearing sub-pool as a balance to the cent — the discriminating MIXED pool (brokerage + IRA + HSA, the shipped example's own shape, E-20), a hand-computed sale, full-basis surplus banking, basis conservation, and the exact-zero exclusion comparison — and the two Engine-B/C consumption EXTINCTION scans were INVERTED in the same release the wiring landed, plus a C-specific `_gainByYrI` binding. Historical: **22 checks at v5.34** (was 14): four EXTINCTION assertions that no engine reads a gain series and that Engine B is back to its hardcoded `0`, plus a dated `[KNOWN DEFECT] 2026-08-15` pin on the RMD-sourced-from-taxable defect with a restore check. Flipped at v5.35/v5.36 as instructed. **Originally NEW at v5.23** — Engine D's first discriminating coverage. 14 checks: five structural (reachability, the 17-key return contract, determinism, parameter purity) and eight fixture/pinned. Three dated `[KNOWN DEFECT]` pins (taxable pot == all of `otherAccounts`; `magi` omits taxable draws; named-IRA money never reaches the RMD balance). Negative-controlled twice — 12/13 and 11/13. Not yet dollar-exact; that is release (b)/(c) work. **AMENDED at v5.24:** the B-2 pin was re-tagged `| rel c` and reworded. It previously read "Engine D magi omits drawFromTaxable" tagged `rel b`, which named something that is CORRECT and instructed the next session to introduce a defect. The assertion itself was right and is unchanged. Repo `qa/` |
| `domdiff_withdrawal.mjs` | **Re-pointed and RE-SCOPED at v5.37 to v5.36 → v5.37, 29 checks: ALL THREE tabs at STRICT IDENTITY** — Taxes/IRMAA because the census shows v5.37 cannot reach Engines B/C, the Withdrawal tab because lifetime MAGI rises $3,333 on the example household but never crosses a bracket edge (measured — inverting the session's own stop-report prediction). The identity form still witnesses the call sites (a dead site on either leg desynchronizes the figures and fails loudly — C10/C11 verified against it); the release's divergence witness lives at the engine level (t19/t20 pins) per E-20. Historically: **re-pointed and re-scoped at v5.36 to v5.35 → v5.36, 26 checks**: the Withdrawal tab returns to STRICT IDENTITY (the v5.36 tracker is bookkeeping on an unchanged schedule — measured, inverting the session brief's premise), and NEW Taxes/IRMAA sections assert figures-only-region divergence — the ONLY witness that the app's call sites pass `gainByYr` (every suite calls the engines directly). Those regions are anchored PAST all changed copy because the naive whole-tab form was satisfied by copy alone and its control did not fire (E-20); controls C10/C11 now fail exactly the two witness checks. Historically: re-pointed at v5.34 to v5.33 → v5.34. ⚠ At the v5.34 build its committed default was found four releases stale (v5.29 → v5.30) and it **died at module load** looking for a bundle the run folder does not hold — a stale default here fails loudly rather than silently, but it fails as a missing module, which reads like a broken harness. Re-point it every release. Previously **re-pointed at v5.24 to v5.23 → v5.24 and grown 4 → 10 checks**. It now excises the one deliberately reworded panel BY ANCHOR and requires everything else byte-identical, rather than relaxing the comparison — and separately asserts the panel did change and that only the prior build carries the false claim. **It hardcodes its default version pair; re-point it every release.** Originally new at v5.23, v5.22 → v5.23. **This is the proof the hoist changed nothing**, because the pre-existing suite does not discriminate on Engine D (OPERATIONS §B2). 4 checks; cross-version by nature, so NOT counted in the release headline. Repo `qa/` |
| `t21_tools.mjs` | **NEW 2026-08-11** — tests the `qa/tools/` parser toolkit itself against a fixture with hand-counted known answers. 50 checks, negative-controlled six ways. Counted SEPARATELY from the app total: it verifies tooling, not the build. Carries one dated `[KNOWN DEFECT]` pin — `census.cjs` double-reports object shorthand and export specifiers, so its "hits" exceed its site count. Repo `qa/` |
| `tools_fixture.jsx` | **NEW 2026-08-11** — the fixture `t21` reads. **NOT AN APP SOURCE**: never built, never imported, never version-bumped, and it does NOT count toward the "exactly two `.jsx` app sources" rule. Repo `qa/tools/fixture/fixture.jsx`; knowledge is flat so it lives here under this name, and `t21` resolves either. Line numbers are load-bearing — add cases at the END only |
| `t22_aca_floor.mjs` | **75 checks at v5.34** (was 64): group H unit-tests the shared `realizeGain` rule directly, including that selling alone never moves the gain share — chosen over comparing two engines' figures and hoping agreement implies a shared rule. Run it as `node t22_aca_floor.mjs v533`; its committed default is still `v532`, unrolled. **NEW at v5.32** — the ACA 100%-of-FPL eligibility floor. **Was 64 checks** in seven groups: the floor as an `[EXTINCTION]` set in BOTH regimes; regime symmetry; the boundary hand-computed to the cent from HHS/ASPE and Rev. Proc. 2025-25 typed independently; the drift case; Engine A end-to-end on a household crossing the floor twice at two depths; **group F, the cross-version byte-identity check on `acaSubByYr`/`totAcaLoss`/`estate`**; and five negative controls, all firing. ⚠ **Group F exists because parity is blind here** — `t2`'s fingerprint household is `acaPremium: 0`, so no ACA code runs inside the guardrail at all (E-15). Do not delete it as redundant; the file's header says so too. Group F reads the PRIOR leg's bundle and defaults to **`v532` at v5.33** (rolled forward, like `t2`'s parity pair). ⚠ **Rolling that default is not sufficient on its own.** Group F mixes claims true for ANY pair (byte identity) with one true for a SINGLE transition — *"acaFloorYrs is NEW"*, which is false once the prior build is v5.32. That check is now **gated on the prior tag**, so the suite holds at 64 on either pairing. The rotation forces the roll: v5.31 left knowledge at v5.33, so `app_v531.mjs` can no longer be built from knowledge alone. Repo `qa/` |
| `t23_roth_ladder_rmd.mjs` | Roth ladder RMD term (v5.41). MAGI at ±$500 (§M component-inline ceiling), RMD cards dollar-exact. Gated per leg. **Unchanged in substance at v5.42** — only the version registry moved; its 25/25 on both legs is the evidence that release did not overreach | when tests change |
| `t24_ss86_phasein.mjs` | **NEW at v5.42.** The §86 upper-tier phase-in. ⚠ **DRIVES THE CONVERSION SLIDER** through the native `HTMLInputElement` setter — the defect is worth $0 at the $70,000 default, so default-position assertions prove nothing about it. Five positions × 12 years against `statute86`, computed not hardcoded. Gated per leg (38 v542 / 34 v541). Carries the middle-tier `[KNOWN DEFECT]` pin | when tests change |
| `hand_86.mjs` | **The §86 statutory oracle**, transcribed from 26 U.S.C. §86 at law.cornell.edu and NOT from any app expression. Imported by `t24` and by `qa/tools/derive_v542.mjs` — one oracle on both sides, deliberately. ⚠ Its three embedded app copies are **v5.40 transcriptions and now history**. Asserts nothing; counted in no total. Repo `qa/tools/` | when the statute or the app copies change |
| `controls_v542.sh` | **NEW at v5.42** — the re-pointed negative-control program. **Replaces `controls.sh`, which was DELETED from both destinations on 2026-08-21** after being unrunnable since v5.40 (it hardcoded `SRC=v538.jsx`, a source that rotated out of knowledge); its rows here were removed in the same edit, because a manifest row for a file that does not exist is the failure this file has recorded eight times. Recoverable from commit history if ever wanted. All 13 v5.38-era anchors verified to resolve exactly once against v5.42 source before re-pointing; C16–C21 added for the §86 work. Supersedes `controls.sh`. Repo `qa/` | every release |
| `t20_other_taxtype.mjs` | **100 checks at v5.37** (+1): the exact E2 pin moved $600,000 → **$724,266** (the balance plus its growth — derived by the independent simulator BEFORE the engine edit, matched to six decimals) and a new **E-15 EXTINCTION** (the ordinary excess must EXCEED the opening balance). The trad−annuity exact-0 pin survived the edit at 0.000000 and is documented as REGIME-BOUND (full pool exhaustion) in the fixture. E-17 closed: the dobs are now the strings the run resolves to (1964-01-01/1966-01-01), measured value-identical across all five engines and all eight households. Historical: **NEW at v5.25** — the Other-accounts `taxType` schema, its migration, and the extinction assertion that no engine reads the field. 94 checks. The extinction check is a **permutation test**: the same household runs twice with every type flipped and all five engines must return byte-identical output — so it fires the moment release (c) starts reading the field. Also carries the required equality that inference over the example household reproduces the $111,000 / $21,000 / $15,000 split v5.24 published. Negative-controlled five ways; two of its own assertions were caught passing vacuously on v5.24 and now assert a precondition first. Repo `qa/` |
| `dom_entry_v542.jsx` | Harness entry for the v5.42 CJS DOM bundle (**current** leg). Repo `qa/qa-baseline/` |
| `dom_entry_v541.jsx` | Harness entry for the v5.41 CJS DOM bundle (**prior** leg). Repo `qa/qa-baseline/`. ⚠ These two rows named `v536`/`v537` until 2026-08-20 — three releases of rotation moved the pool files and left the rows behind, so the manifest listed two files the pool did not hold. Roll them with the rotation, not after it |
| `runsuite.sh` | **NEW at v5.36 — adopted from session tooling.** Runs both legs, parity, feature suites and tooling, and PARSES every total from suite output (the honesty standard: totals are computed, never restated). A suite printing no count with a non-zero exit reports DIED, not 0/0. Repo `qa/` |
| `capture_gain_fp.mjs` | **Probe, not a suite — asserts nothing and is counted in no total.** Captures a full-precision fingerprint of every engine that touches the realized-gain rule, which is how `realizeGain`'s extraction was proven a behaviour no-op before any behaviour changed (OPERATIONS §M pattern). Repo `qa/` |
| `probe_withhold_gain.mjs` | **NEW at v5.34. Probe, not a suite — asserts nothing and is counted in no total.** Reproduces the measurement behind the v5.34 copy correction: under `convTaxFunding: "withhold"` it runs Engine A at three conversion sizes and two declared gain shares on both legs, showing that a residual bill reaches the brokerage and is taxed. Run it as `node probe_withhold_gain.mjs ./app_v534.mjs`. Repo `qa/` |
| `VERIFY.sh` | Release verification driver. **Added to knowledge at v5.23** — it was previously repo/local only, so a session working from knowledge alone could not reproduce the release run. Repo root |
| `t15_engineA_death_filing.mjs` | Engine A death-year filing extinction invariant (C-2C-6, v5.14) — 11 checks, **dollar-exact** (module-level engine), incl. the non-conservative high-MAGI corner | when tests change |
| `t10_taxcases.mjs` | Tax-case assertions built by the Phase 2 audit: 76 federal-core (2A) + 35 IRMAA (2B) = **163** at v5.30 (2A 76 · 2B 87 · 2D 27 · 2E 21), incl. 3 dated `[KNOWN DEFECT]` pins. **ADOPTED into `run_all.sh` at v5.14** (scope D-4); pins flipped, borders re-derived, now 115 checks | when audit phases add cases |
| `smoke_built.mjs` | The **built-artifact** suite — **16 checks** against the published single-file `index.html`, not the source: boots it, dismisses the disclaimer gate, mounts React, loads the example household, and round-trips the `window.storage` shim. Added v5.11 after a build passed every source check while being unable to save a plan | when tests change |
| `qa-baseline-README.md` | How to run the baseline suite (renamed from qa-baseline/README.md for the flat pool) | when it changes |
| **qa-baseline harness files** | `shim.txt`, `mk_testable.sh`, `env_dom.mjs`, `run_all.sh`, `cap_tabs.mjs` — the `dom_entry_*` files are listed individually above, current + prior only | when they change. NOTE (v5.10.2): stale knowledge copies were re-synced from the committed repo at that refresh. The repo is their source of truth. |
| **`qa/tools/` parser toolkit** | `funcmap.cjs` (function boundaries — line numbers move every release), `census.cjs` (identifier/property/string hits with enclosing scope chain), `diverge.cjs` (normalized-fingerprint duplicate detection), `residual.cjs` (narrow: `balance − roth − trad`; ages out after release (c)). All four named explicitly per §G — a folder reference makes them invisible. They live in `qa/tools/`, **not** `qa/`, because they assert nothing and must never be countable as checks. **Tested since v5.25 by `t21_tools.mjs` (50 checks) against `tools_fixture.jsx`**, negative-controlled six ways; one pinned defect (AST hits vs source sites) is disclosed by reporting both counts since v5.29. Census and site-count questions go through these, never greps (OPERATIONS §B1) | when the tools change |
| **build scaffold files** | `index.html` (the Vite HTML entry template), `main.jsx` (the browser bootstrap), `vite.config.js`, `package.json` — all four, per OPERATIONS §G. Without all four a session working from knowledge **cannot produce the published `index.html`** (the v5.11 failure). ⚠ **The pool held only three of the four until 2026-08-20.** `index.html` was missing — this row asserted all four for eleven releases while the pool never carried the template, and no check compared the claim to the pool because the §A2 table had no row for it either. It matters more than a missing file usually would: that template carries the entire **first-open disclaimer gate** (credentials disclosure, pessimism notice, acknowledgement checkbox), which exists **nowhere** in `DangerClose.jsx`, so a knowledge-only rebuild would have published the app with no gate. Restored at md5 `52ef2be3080352df6198ee3b8c3507ad`; `qa/smoke_built.mjs` asserts the gate renders and dismisses, so the failure would have been loud at the built-artifact suite rather than silent in production. ⚠ **`vite.config.js` is written with a DOT** — the session mount displays it as `vite_config.js`; that is a mount artifact, not the pool name (verified 2026-08-10: same file, md5 `30da5708038a1d7c97a4b06777ea8e8a`). It is the only file in the pool where the mounted name differs from the real one | when the build setup changes |
| `SITE_CENSUS_v5_10.md` | Code census (self-versioned by filename). ⚠ **Not in the pool** as of the 2026-08-20 clone-and-diff — it lives in the repo at `docs/SITE_CENSUS_v5_10.md`. Row kept and marked rather than deleted: whether the pool should carry it is the maintainer's call, and a silently-dropped row is how files become invisible | new one per feature |
| `SCOPE_STANDING_AUDIT.md` | Reusable audit spec (not version-specific) | rarely |
| `OPERATIONS.md` | **The operational appendix, §A–§N** — freshness check, suite layout, harness traps, defect pins, parity guardrail, ship verification, storage/rotation, release checklist, packaging, instrumentation ceiling, and the `index.html` build. **Read it before any build, fix, scope, or release, starting with §A.** | when mechanics change |
| `PROJECT_KNOWLEDGE_INDEX.md` | This manifest | every refresh |

---

## Audit findings and scopes (self-versioned by filename)

**v5.40 and later rows — added 2026-08-20.** ⚠ **Every one of these files was in the pool with no
manifest row.** Seven documents were invisible to the manifest at once, including two status records
written the same week and one written by the session that was auditing the manifest. The
clone-and-diff cannot catch this: all seven match the committed tree exactly, so the pool was correct
and only its *index* was wrong. **A file the manifest never names is a file the next session will not
know to read.**

| File | What it is | Status |
|---|---|---|
| `SCOPE_v5_40_disclosures_and_mechanics.md` | Governing scope for the v5.40 release — the disclosure and mechanics work that shipped 2026-08-19 | fulfilled at v5.40; retire when convenient (outcomes in the CHANGELOG entry) |
| `SCOPE_STRUCTURAL_MAGI_EXTINCTION.md` | Scope for the structural S-1 assertion: bind the IRMAA MAGI *sentence* to Engine C's `magi` *expression* in both directions, resolved by AST and enclosing function so a reflow cannot move the target | **BUILT 2026-08-20.** `qa/`-only, no version bump; outcomes in `STATUS_2026_08_20_structural_magi_extinction.md` |
| `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` | Scope covering the Roth tab's MAGI measurement | **active — read before touching the Roth tab's MAGI** |
| `STATUS_2026_08_20_structural_magi_extinction.md` | Build record for the structural S-1 assertion. **1,350 passed / 0 failed across 22 suites, parity 9/9, t1 102 → 108** — the current recorded suite state. Also records a line-citation correction the session owned against its own scope (`computeIrmaaPlan` at L4272, not L4271) | current — the suite baseline any next build starts from |
| `STATUS_2026_08_20_d3_correction.md` | The D-3 disclosure correction: the state-tax approximation is disclosed in three places, Maryland was misfiled, and the finding is restated as **Low** severity, not an undisclosed simplification. Also records the late v5.40 knowledge refresh | current |
| `STATUS_2026_08_20_knowledge_refresh.md` | This refresh's record — the missing `src/index.html` entry template (and the disclaimer gate that rides in it), the retired stale `README-FIRST.md`, the inverted OPERATIONS §A2 bullet, and the pruned/corrected manifest rows | current |
| `STATUS_2026_08_20_build_and_domdiff.md` | The verification record: the published v5.40 artifact **rebuilds byte-identical from project knowledge alone** (`17867edb…`, smoke 16/16) — tested for the first time, the pool having lacked `src/index.html` until that day; the suite re-measured at **1,350 / 0 across 22 suites**, parity 9/9; and `domdiff_withdrawal.mjs` re-pointed after three releases stale, its IRMAA region re-anchored off 1,070 characters of prose, both controls fired | current |
| `STATUS_2026_08_20_roth_magi_partial.md` | **PARTIAL measurement** for `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` (D-A and D-B resolved; D-C still deferred). On the **shipped example household** the Roth tab's IRMAA MAGI matches Engine C in **10 of 12 ladder years** and reads **≈$43K low in 2039 and 2040** — the two years containing a live RMD — while the same tab prints that RMD as $47,681 on screen. **Tier consequence on this household: zero** (tier 0 throughout, $113K–$166K headroom). ⚠ **Engine-vs-rendered-DOM only — the primary-source hand-computation the scope requires has NOT been run**, so this shows *where* they disagree, not *which is right*. Constructed household, term isolation and the `t3` pin all outstanding. Also records that the scope's §2 census table does not reproduce (24 claimed vs **28 hits / 25 sites** measured) | current — resume here |
| `STATUS_CAPGAINS_PARTIAL_for_v5_33.md` | The capital-gains partial-state handoff written for v5.33 — a scope premise falsified mid-build, reported rather than adapted around | historical; read with the v5.33–v5.36 gains work |

**v5.39 rows (this refresh):**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_39_shipped.md` | The v5.39 ship record — full verification chain (tested source == shipped source, rebuild reproducibility, parity 9/9), per-suite totals parsed from output, the negative control for the new extinction assertion, **and §5, four errors made during the build, recorded plainly** | **current — the authoritative v5.39 record** |
| `STATUS_v5_41_shipped.md` | **The v5.41 ship record.** Carries the two corrections made to the build brief's expected figures (an out-of-scope $420 dividend term; an undecided conversion-gating rule worth $2,492 in 2040), the §M precision ceiling and why dollar-exact MAGI was NOT achievable, the 9 negative controls, and four findings left for the next scope |
| ~~`SCOPE_FIX_docs_v5_39.md`~~ *(retire when convenient)* | Governing scope for the docs-only release. §1 re-verified every premise against the decoded runtime bytes rather than trusting the audit; §5 carried decisions D-1…D-8, all resolved by Steve as recommended | **FULFILLED at v5.39.** Two of its own figures were wrong and are corrected in the ship record: parity is **9/9** (not 8/8), and the version-bump tax spans version ladders in **six** suites plus ~25 feature gates (not two sites) |

**v5.36 rows:**

| File | What it is | Status |
|---|---|---|
| `STATUS_v5_36_shipped.md` | The v5.36 ship record — session-2 narrative, every decision with who made it, and the FULL per-file hash table (source, suites, docs), the E-18 process fix executed | **current — the authoritative v5.36 record** |
| `STOP-REPORT-v5_36-session2-pool-drift.md` | The fourth pool-drift block: six suite files pre-session-1 while the brief said otherwise; evidence trail and recovery | historical — E-18's primary source |
| ~~`SCOPE_v5_36_drawdown_capital_gains.md`~~ | Scope for the v5.36 capital-gains work (rev 3) | **RETIRED — FULFILLED at v5.36.** Decisions and outcomes recorded in `STATUS_v5_36_shipped.md` and the CHANGELOG; no test cites it by filename (checked) |
| ~~`STATUS_v5_36_partial.md`~~ | Session-1 intermediate status | **RETIRED — superseded by `STATUS_v5_36_shipped.md`** |

Read these together with the build they are pinned to. Every finding document names its build
version + md5 in its header; a finding pinned to an older build has NOT been re-verified against
the current source unless it says so.

| File | What it is | Status |
|---|---|---|
| `FlawsToFix-v5_10_1-Phase1.md` | Phase 1 audit (Sections A+B) against v5.10.1 | B-2 fixed at v5.10.2; B-1 closed as disclosed limitation; **A-2 open**, LOW, needs its own scope |
| `FlawsToFix-v5_15-Phase2D.md` | Sub-phase 2D findings, **REVISION 3**. Completeness half done to the Section C standard, verified **per engine**. Revisions 1 and 2 both stated mechanisms wrongly — §1 records both errors and the single cause, and is still worth reading for that. ⚠ **§6 IS SUPERSEDED** by `AUDIT_2D_BREAKEVEN_v5_28.md`, which says so in its own header | **2D COMPLETE at v5.28 — this row said "IN PROGRESS" through eleven releases and cost a session.** §6's three owed items (crossover hand-verified on two households, discounting-equivalence, `t10` cases) are all discharged. **Read the v5.28 audit, not §6** |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2 — supersedes the v5.15 scope, which is retired.** Re-verified against v5.21 with AST resolution. Corrects three premise claims: Engine D applies **zero** tax to these draws (not capital-gains — `magi` L7686 omits `drawFromTaxable`); the treatment is **mischaracterized, not undisclosed** (MyData L11211 discloses it, Withdrawal L7822 and the Field Manual contradict it); and the census grew by **nine sites**. Structural trap **EXECUTED**: $147K → $0, silent, plus $21K of genuine brokerage leaving the tab's accounting. `total401k` has **three** derivations, so Option B is path-dependent | **active — §7 DECISIONS RESOLVED 2026-08-10.** Governs releases (b) and (c) |
| `SCOPE_CONSOLIDATE_taxable_residual_v5_22.md` | Release **(a)** of the three-release plan (D-6/D-7). Consolidates the taxable residual, verified at **seven** identical sites by normalized AST fingerprint (one distinct form). Two binding constraints: the helper must **not** live in `retireStartBalances` (documented decision, L1509–1511, whose comment must be amended in the same edit), and **L8384 is a variant** — positions residual **plus** `otherAccounts` — so only its positions half is replaced | **active — no open decisions. Next build.** Pure refactor: 8/8 strict parity, all 751 checks **identical** |
| `SCOPE_AUDIT_PHASE2_v5_10_2.md` | Governing scope for Phase 2 / Section C. Decisions D-1…D-5 are **binding** on all 2A–2E work | **COMPLETE — all five sub-phases closed.** Roll-up: `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` |
| `FlawsToFix-v5_10_2-Phase2A.md` | Sub-phase 2A — federal core. Engine A dollar-exact (76 assertions) | complete. **Amended 2026-08-08**: Engine B is verifiable only to **±$500**, not dollar-exact |
| `FlawsToFix-v5_10_2-Phase2B.md` | Sub-phase 2B — IRMAA + indexation (35 assertions). Findings F-2B-1 (threshold indexed to MAGI year) and F-2B-2 (top tier not frozen) — both LOW, conservative, **coupled: fix both or neither** | complete. **Amended 2026-08-08**: Engine C verifiable only to ±$500 MAGI / ±$50 surcharge |
| `FlawsToFix-v5_10_2-Phase2C.md` | Sub-phase 2C — first-spouse death. **C-2C-3 (HIGH)**: Engines B and C key post-death RMDs to the deceased spouse's age; direction depends on which spouse is younger, **non-conservative** when A is the younger. C-2C-1 and C-2C-2 LOW, conservative | complete — **this is the current 2C document** |
| `STOP-REPORT-EngineBC-render-precision.md` | Why Engines B and C cannot be verified to the dollar: every DOM figure is `Math.round(x/1000)`; the shim reaches only module-level bindings. Records the ±$500 ceiling and the options to lift it | standing constraint — applies to all future B/C verification |
| `FINDING-C-2C-6-EngineA-death-year-filing.md` | Engine A files Single for the whole death year (Pub. 501 says the year after). **Executed dollar-exact**: over-taxes by $3.5K–$15.5K depending on income. Conservative, undisclosed, and a cross-engine divergence *created* by the v5.12/v5.13 corrections | **open — needs a scope**; pairs naturally with the F-2B indexation fix, which lives in the same tier loop |
| `FINDING-C-2C-4-EngineD-no-death-modeling.md` | Engine D (Withdrawal tab) did not model first death at all. Severity restated by D-4 to **MEDIUM, direction household-dependent** | **CLOSED — fixed at v5.12**; header corrected 2026-08-09 after sitting stale at *provisional / HIGH* for a full release |
| `FINDING-C-2C-5-EngineC-no-death-in-SS.md` | Engine C (IRMAA) did not model the first death in its Social Security basis — the finding `t13` was written to pin. Fixed at v5.13 | rarely |
| `SCOPE_FIX_survivor_engines_CD.md` + `SCOPE_ADDENDUM_D6_EngineC_design.md` | Scope for C-2C-4 (Engine D) + C-2C-5 (Engine C). Engine D shipped at v5.12; **Engine C shipped at v5.13** | **fulfilled — retire both at this release** |
| `FINDING-C-2B-3-RothLadder-irmaa-inflator.md` | The Roth ladder ran its own tax arithmetic with the **married** deduction, brackets, SS thresholds and IRMAA cliff hardcoded, and no single-filer branch. Severity raised MEDIUM → HIGH when the prerequisite was executed | **CLOSED — fixed at v5.15.** Outcome written back on the finding itself; magnitude corrected upward (72%, not ~40%) and census corrected (13 sites, not 10) |
| `SCOPE_FIX_irmaa_indexation_v5_13.md` | Scope for the coupled F-2B-1 / F-2B-2 indexation fix. Premise **re-verified against v5.13**, not inherited from the v5.10.2 findings; census updated for the two-array tier structure v5.13 introduced. Four open decisions | **active — awaiting Steve's decisions in §7** |
| `SCOPE_FIX_roth_tab_filing_status_v5_14.md` | Scope for C-2B-3. All five decisions resolved by Steve 2026-08-09; all three ordered changes shipped (the droppable third was not needed) | **fulfilled at v5.15 — retire** |
| `SCOPE_DEFECTS_v5_10_1.md` | The v5.11 defect-fix release scope: three pre-existing defects found by the rebuilt t1–t6 baseline — **D1 (P0)** Clear All Data left the API key and skipped the landing return, **D2** ACA cliff solver ignored MAGI from its own funding sale, **D3** phantom Spouse-B card for single filers. All three were present identically in v5.9.2 and v5.10, so none was a regression. **Kept as the worked example** of the defect-pin → fix → flip cycle, and of a scope with an enforceable out-of-scope boundary | fulfilled (all three shipped at v5.10.1); retained for reference, not retirement |
| `AUDIT_2D_BREAKEVEN_v5_28.md` | Sub-phase 2D — Roth break-even + account completeness against v5.28. **Explicitly supersedes `FlawsToFix-v5_15-Phase2D.md` §6** and discharges all three items it owed; verification is arithmetic, not inspection (a $30K conversion costs $2,196 incremental federal tax against a −$2,294 year-one wealth delta; 2,196 × 1.045 = 2,294.8). **Check count reconciled 2026-08-18:** the document's **19** was its own v5.28 delta (t10 115 → 134); the current `t10` carries **27** `2D`-labelled assertions, so 8 arrived after v5.28. Both figures are right about different things — the 27 in this row describes today's file. *(Suite totals not re-run to confirm t10's overall total.)* **ADDED TO THE POOL 2026-08-18** — it was repo-only, which is why the row above went stale | complete |
| `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` | Sub-phase 2E — state-tax module (21 checks) **and the Phase 2 roll-up**. The document a Phase 3+ session must read first: it names what is already verified and therefore not a finding | complete — **authoritative for Phase 2** |
| `AUDIT_DOCS_HTML_v5_27.md` | Audit of the Field Manual against shipped v5.27 behaviour. Records that the **glossary, §10 API-key material and §14 FAQ were NOT audited** — that ground is Section F (**now covered — see `UsabilityFlaws.md` Part D**). **ADDED TO THE POOL 2026-08-18**, closing the repo-only annotation this row carried — the standing advice *"a row with no file behind it costs a session a hunt"* was borne out twice over on the same day (see the Section D sweep and the 2D audit rows) | complete, with the stated gap — **gap since closed** |
| `STATUS_release_a.md` | Release-(a) status note (taxable-residual consolidation, v5.22) | historical |
| `STATUS_v5_23_engineD_hoist.md` | Engine D hoist status note (v5.23) | historical |
| ~~`probe_classify.mjs`~~ | **RESOLVED at v5.30 — removed from knowledge, now versioned.** Committed to the repo at `qa/tools/probe_classify.mjs` with a header recording what it was for. It is a v5.25-era probe from the `otherAccounts` scoping work; **its conclusions have since shipped and are asserted by `t20`**, so its "what would move" output now describes a change that already happened. It asserts nothing and **must never be counted in a release total**. Read `t20` instead. | retired from knowledge |
| `MissingFeatures.md` | **Section D** of the standing audit (Phase 3) — missing taxation features, priority-ordered, **pinned to v5.29 and overtaken by four releases**. ⚠ **Its top-ranked item D-2 (ordinary drawdown realizes no capital gains) was CLOSED at v5.36** — the release titled *"the drawdown realizes capital gains, and the tax engines consume them"*. The document still describes `capGains_y = 0`; v5.39 computes it at L5096 from Engine D's schedule (L4742–4742) and wires it into the Taxes (L9427–9433) and IRMAA (L9710–9712) engines. **Do not cite D-2 as open.** Re-pin to current at the next Section D pass | **Section D COMPLETE** — the systematic undisclosed-gap sweep this row previously said was never run **was run at v5.31**; see `AUDIT_PHASE3_SECTION_D_SWEEP.md`. This document is the *findings inventory*, not the sweep, and is **stale, not incomplete** |
| `ARCHITECTUREIssues.md` | **Section E** of the standing audit (Phase 3) — 13 findings, pinned to v5.29. Highest: jsdom duplicated **9×** (not 8), OBBBA constants outside `TAX_CONSTS` with a 2028 fuse, backup export does not identify the build | Section E **covered** |
| `UsabilityFlaws.md` | **Section F** of the standing audit (Phase 4) — usability across a large browser window and small-real-estate devices, audited against **v5.38**. 19 findings F-1…F-19, all user-side, **plus the material `AUDIT_DOCS_HTML_v5_27.md` deferred to this section**. ⚠ §A carries an **errata owning two of the audit's own errors** (an F-8 static-arithmetic overreach, and a retracted F-2 "correction" that was a harness artifact) — read it before citing F-2 or F-8. §G records a **headless-Chromium harness recipe** (npm-bundled binary, no local install) and the disclaimer-gate scroll-lock trap that silently invalidates naive runs. **NOTE: the document text still reads as if nothing has shipped — it predates v5.39 and was not rewritten.** Use the status column here for what is actually open | **PARTIALLY CLOSED at v5.39.** Fixed: F-10, F-11, F-12, F-13, F-14, F-15, F-17, F-18, F-19 (F-19 was found while verifying F-10 and was the release's highest-value item). **Still open:** F-1…F-9 (small-screen layout, contrast, touch targets, tooltips, input modes, chart resize) — now **disclosed** in Field Manual §13 but **not fixed**; and F-16 (glossary ASCII sort, NIT). The mechanics release for F-2/F-6/F-8 is identified but unscoped. The two-paragraph top-five summary is ✅ **WRITTEN 2026-08-18** — `AUDIT_TOP_FIVE_SUMMARY.md`; F-1…F-9 are its item 4. It was **NO LONGER BLOCKED** (corrected 2026-08-18): both stated blockers were already closed — Section C's 2D break-even half at **v5.28** and Section D's gap sweep at **v5.31**. It was deferred through several sessions against blockers that had already cleared. Write it after the v5.31 → v5.39 delta sweep, since that may change what the top five are |
| `AUDIT_D3_STATE_TAX_DIRECTION.md` | **D-3's direction is wrong, and the finding splits.** Measured against **v5.40** on 2026-08-19 while verifying the premise for a D-3 scope — **stopped and reported rather than adapting the scope.** D-3 was recorded as under-taxing and flattering a plan, and that reasoning made it item **#2** of the top-five summary. New York MFJ, both 67, against the sourced 2026 schedule: at $120,000 the model charges **$4,800** where NY charges **$3,121** — **54% too high** — and it over-taxes at every income to roughly $600,000, reversing only between **$600K and $900K**. **Direction is CONSERVATIVE.** Causes: `stateTaxAnnual` (L1091) models **no state standard deduction**, and each rate approximates a mid-to-upper *marginal* rate. ⚠ **The disclosure half was OVERSTATED and is corrected 2026-08-20:** the approximation is disclosed in THREE places — Field Manual §13, the manual's Taxes tab entry, and `src/DangerClose.jsx` **L11889**, rendered under the My Data state selector for every jurisdiction — so it is not an undisclosed simplification. All six named states carry notes; Maryland was misfiled (its note says *effective*, never *progressive*), leaving **three** disclosing states (CA, DC, OR) against **30** silent ones, exact count **unmeasured**. What remains is **inconsistent per-state note detail, severity Low**, plus the setup wizard's picker (L3393) showing no note at all. ⚠ **Limits:** only NY is verified against a sourced schedule; CA is **indicative** (recalled brackets); HI/MN/VT/WI are **unmeasured**. Also flags **NJ returning $0** for this household — unmeasured, asserted neither way | **current, corrected 2026-08-20.** Disclosure half → **Low; ride the note tidy along with the next release that opens `STATE_RULES`, do not ship for it**. Precision half → **held**; full graduated brackets **declined** (~300 numbers, annually re-indexed); recalibration preferred if it proceeds. **D-3 has no live high-priority half** |
| `AUDIT_TOP_FIVE_SUMMARY.md` | **THE STANDING AUDIT'S CAPSTONE** — the two-paragraph standalone top-five summary `SCOPE_STANDING_AUDIT.md` calls for after the final phase, written 2026-08-18 against **v5.39**, drawing on Sections A–F plus the rollup, both Section D sweeps and the v5.28 2D audit. **The five:** (1) disclosures drifting off the engines beneath them — S-1, S-3, D-6, the top finding by a distance; (2) **D-3**, state schedules as a flat rate — ⚠ **direction corrected 2026-08-19: it is CONSERVATIVE, not optimistic**; what survives is that **six states do not disclose the approximation** (see `AUDIT_D3_STATE_TAX_DIRECTION.md`); (3) the **ACA sub-floor $0** that reads as computed (D-8b); (4) **F-1…F-9**, disclosed at v5.39 and unfixed; (5) verdict instruments and records failing silently (E-19/E-20, E-14/E-18). Also records **three silent closures verified at v5.39** — D-1, D-2, and **C-2C-3, a HIGH non-conservative defect** — all fixed by releases that never touched the documents recording them. ⚠ Flags a live records defect: **`ARCHITECTUREIssues.md` uses `E-15` twice** (L624 and L756); only the second is discharged, so citing "E-15" is ambiguous | **complete — the standing audit's final deliverable.** Claims verified against v5.39 source by locating the implementing expression; **not measured by driving the engines**, and severity labels carried forward rather than re-derived |
| `AUDIT_SECTION_D_DELTA_v5_31_to_v5_39.md` | **The Section D delta sweep**, run 2026-08-18 against **v5.39** (committed tree `d18f7cc`) — re-runs the v5.31 sweep's method over the six modelling releases since it (v5.32, v5.34–v5.38). Corpus: 715 render-tree string literals + the manual decoded to 143,529 runtime bytes + `METHODOLOGY.md`. **Two live findings, both "two surfaces disagree":** **S-1 widened** (the IRMAA tab names five MAGI components, Engine C sums seven — `div_y` and now `capGain_y`) and **S-3 new** (`METHODOLOGY.md` L537–538 still states in the present tense that Engine B defaults realized gains to $0, false since v5.36, and the same document contradicts it in a later section). Four delta subjects **cleared**, with v5.34 recorded as the counter-example that retracted what it falsified. ⚠ **§2.1 states honestly where this is weaker than the v5.31 sweep** — source literals not a 28-surface DOM capture, and claims compared to engine *expressions* rather than measured by driving the engines. Read that before treating any null result here as strong | **current — Section D is swept to v5.39.** Both findings **Low, user-side/published, safe-direction** (they understate the model's conservatism). Fix shape for both: one sentence, no engine change |
| `AUDIT_PHASE3_SECTION_D_SWEEP.md` | **THE SECTION D UNDISCLOSED-GAP SWEEP** — the deliverable the rollup below asked for, run against **v5.31** (committed tree `4b8e714`). Method: *enumerate, don't sample* — all **28 user-facing surfaces** captured (26 rendered tabs driven through the DOM harness, plus decoded `DOCS_HTML` and `METHODOLOGY.md`), then three passes: **58 claims** extracted across 18 surfaces, **28 distinct negative modelling claims** inventoried, then **measurement** by driving the engines and perturbing inputs. Result: **no undisclosed gap.** One Low disclosure inaccuracy (**S-1**, IRMAA tab's MAGI enumeration), **D-6 resolved** as disclosed rather than a gap, and two suspected gaps **cleared by measurement** with control arms recorded. §6 states its own limits (one household; pattern-based extraction; arithmetic not re-verified; `validation/` untouched). ⚠ **Its result is anchored to v5.31 and six modelling releases have shipped since (v5.32, v5.34–v5.38)** — see the standing note below | **Section D discharged at v5.31.** **ADDED TO THE POOL 2026-08-18** — it was repo-only and named in no manifest, which is why Section D read as "never run" for eight releases (E-14's failure shape) |
| `AUDIT_PHASE3_ROLLUP.md` | Phase 3 roll-up (Sections D + E). Its §4 asked for Section D to be re-run with the undisclosed-gap sweep as the explicit objective — **that request was fulfilled**; read `AUDIT_PHASE3_SECTION_D_SWEEP.md` alongside it or the rollup reads as though the work is still owed. **ADDED TO THE POOL 2026-08-18** (previously listed here but repo-only) | current, **with the sweep as its successor** |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2.** Governing scope for the three-release `otherAccounts` plan — (a) v5.22, (b) v5.24, (c) v5.26. §1 records three corrections to its own premise; §7 carries Steve's resolved decisions D-1…D-7 | **FULFILLED (all three shipped) — RESTORED to knowledge 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `qa/t19_engineD_exact.mjs` L61 cites it as its governing scope |
| `SCOPE_ENGINE_D_MAGI_v5_24.md` | Release (b). §1 corrects the carried-forward premise (adding `drawFromTaxable` to `magi` would have been a **defect**, not a fix); §8 is the correction owed to `t19`'s B-2 pin. §8 also warns the finding **"is unusually good at being restated wrongly"** and counts three prior wrong statements | **FULFILLED at v5.24 — RESTORED 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `t19` L96 is a **stop-instruction** telling a session to read its §1 before touching `magi` |
| ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ *(retire — spent)* | Build brief for v5.30 — pasted as the first message of the build session. Carries the freshness expectations, the three edits, the per-leg gating rule, and the version-bump tax | current |
| ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ *(retired)* | Scope for **D-1(a)/(b) + E-3** — the false OBBBA disclosure in Field Manual §13 and METHODOLOGY §5, and the false source comment at L829–831. Three edits, no engine change, parity must stay 8/8. §3 records the §B2 lock check (clean) and a second gap it surfaced: nothing asserts Engine B *applies* the bonus | **RETIRED — FULFILLED BY v5.30 (verified 2026-08-13).** All three edits shipped, `t18` gained the three hand-computed OBBBA cases including the 2029 sunset, and E-3 was closed and named in the CHANGELOG. Delete from the pool with its build brief |

---

## Retirement list (delete-first; nothing replaces these)

### At the v5.42 upload — DELETE THESE FIRST

The pool is flat and add-only, so a stale file is byte-indistinguishable from a current one until
hashed. Delete before uploading, not after:

| Delete | Because |
|---|---|
| `DangerClose-v5_40.jsx` | rotated out — the pair is now **v5.42 current / v5.41 prior, exactly two** |
| `dom_entry_v540.jsx` | its source rotated out with it |
| `controls.sh` | superseded by `controls_v542.sh`. Unrunnable since v5.40 (it hardcoded `SRC=v538.jsx`); keeping both invited someone running the dead one. **DONE 2026-08-21 — deleted from the pool and the repo, and its two rows above removed in the same edit.** The v5.40 decision to keep it stale deliberately is hereby superseded: that reasoning held while it was the ONLY control program, and stopped holding the moment a working successor existed |
| `CHANGELOG.md`, `METHODOLOGY.md`, `TESTING.md`, `PROJECT_KNOWLEDGE_INDEX.md` | replaced by this upload |
| `t1_units.mjs`, `t3_roth.mjs`, `t4_dom.mjs`, `t5_storage.mjs`, `t6_single.mjs` | replaced by this upload |
| `t23_roth_ladder_rmd.mjs`, `domdiff_withdrawal.mjs`, `runsuite.sh` | replaced by this upload |

**Add** (new to the pool at v5.42): `DangerClose-v5_42.jsx` · `dom_entry_v542.jsx` ·
`t24_ss86_phasein.mjs` · `hand_86.mjs` (the §86 oracle — repo-only through v5.41, which is why the
v5.42 build brief had to carry its hash separately) · `controls_v542.sh`.



⚠ **This section, the rotation block below, and several table rows above had gone stale by five
releases** — they described the v5.24 refresh while the two tables at the top of this file were
correctly rolled to v5.29. Corrected at the v5.30 refresh. The cause is structural and is recorded
as a finding: OPERATIONS §I's "refresh project knowledge once with the final state, delete-first"
was executed on the top tables and not on the body. **Roll the whole file or none of it.**

**Retired 2026-08-20 (knowledge-hygiene refresh, no release):**

- ~~`README-FIRST.md`~~ — **retired outright, not replaced.** It is a per-delivery upload instruction
  sheet, and the pool copy was the **v5.36 edition** — four releases stale, describing a packaging
  layout that has since changed. The v5.37 retirement list below claims it was *"replaced in place by
  the v5.37 edition"*; it was not, so this is the **§G write-hazard again** (delete-then-upload where
  the delete didn't take), and two prior freshness checks logged the file as *"knowledge-only by
  design"* — true of the name, false of the contents. Retired rather than rolled because the durable
  record it once carried now lives in `docs/` in the repo: the release story is the CHANGELOG entry,
  the per-file story is that release's `STATUS_*.md`. It remains a **delivery-zip** artifact per
  OPERATIONS §L — that convention is unchanged; only the stale pool copy goes.
- **The pool's `README-FIRST.md` and the repo have never been comparable** — it is one of only two
  pool files with no committed counterpart (the other is the retained prior source, which is
  legitimate), so the clone-and-diff could never adjudicate it and reported it as expected noise
  three times running. Retiring it removes that permanent blind spot from the check.

**Retired at the v5.37 refresh:**

- ~~`DangerClose-v5_35.jsx`~~ — rotates out under the two-source rule (v5.36 becomes the prior;
  v5.35 remains recoverable from its shipping commit).
- ~~`DangerClose-v5_36-WIP.jsx`~~ — found still in the pool at this release's freshness check
  despite the v5.36 list below marking it retired; a third `.jsx` violates the rotation. Its hash
  (`c5d9253c…`) stays recorded in `STATUS_v5_36_shipped.md`.
- ~~`domdiff_withdrawal.mjs` (stale pool copy)~~ — the pool held the v533→v534 edition
  (`dc48d0c2…`) while the repo carried the correct v5.36 file (`184b826b…`); found by the
  clone-and-diff at this release's freshness check. The pool takes the v5.37 edition
  (`faaea61b…`).
- ~~`SCOPE_v5_37_ordinary_growth.md`~~ — fulfilled; it ships in `docs/`, outcomes in
  `STATUS_v5_37_shipped.md` and the CHANGELOG.
- ~~`README-FIRST.md`~~ (v5.36 edition) — replaced in place by the v5.37 edition.

**Retired at the v5.36 refresh:**

- ~~`DangerClose-v5_36-WIP.jsx`~~ — superseded by the shipped `DangerClose-v5_36.jsx` (`b7396c1c…`). The
  WIP hash `c5d9253c…` appears in the session-1/2 records; the intermediate hashes between it and the
  ship (`9a97926…` post-copy, `279db93a…` post-E-16-fix, `62a23aa9…`/`06237271…` mid-work) are recorded
  in `STATUS_v5_36_shipped.md`.
- ~~`STATUS_v5_36_partial.md`~~ — superseded by `STATUS_v5_36_shipped.md`.
- ~~`SCOPE_v5_36_drawdown_capital_gains.md`~~ — fulfilled; outcomes in STATUS + CHANGELOG.
- ~~`README-FIRST.md`~~ (the v5.35-WIP edition) — **replaced in place** by the v5.36 edition; it had
  outlived its release, which is the same §I body-vs-tables failure this list already records once.
- ~~`SESSION_BRIEF_v5_36_SESSION2.md`~~ — spent (was an upload, never pooled; listed so nobody re-adds it).

**Retired at the v5.31 refresh:**

- ~~`SCOPE_FIX_docs_disclosure_v5_27.md`~~ — **RETIRED (confirmed absent from the pool 2026-08-13).**
  Fulfilled at v5.27; it outlived its release by three because §I's retirement step was skipped. Its
  outcome is recorded in the v5.27 CHANGELOG entry.
- ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ — **RETIRED at v5.30**, fulfilled by that release: all
  three edits shipped, `t18` gained the three OBBBA cases, and E-3 was closed and named in the
  CHANGELOG.
- ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ — **RETIRED at v5.30.** A build brief is spent once its release
  ships; keeping it invites a future session to build v5.30 again.
- ~~`SCOPE_FIX_obbba_constants_v5_31.md`~~ — **RETIRE at v5.31**, fulfilled: `OBBBA_CONSTS` shipped
  with five Verify rows, the four literals are extinct and extinction-checked, both negative controls
  fired, and E-2 is closed and named in the CHANGELOG. Its Rev B corrections (the suite is `t1` not
  `t10`; the finding's stated cause and urgency framing do not hold) are carried into the E-2 closure
  note so they survive the retirement.
- ~~`SESSION_BRIEF_v5_31_BUILD.md`~~ — **RETIRE with the scope it paired with.**

**Active scopes after this refresh: NONE.** v5.39 shipped on 2026-08-18; `SCOPE_FIX_docs_v5_39.md` is
fulfilled and retires with it (outcomes in `STATUS_v5_39_shipped.md`). The next release needs a scope
written before it is built (project instructions, *Scope before build*). ⚠ This line was found reading
"v5.36 shipped on 2026-08-16" at the v5.39 refresh — **two releases stale**, the same
roll-the-whole-file failure as the build tables. It is a third place a version lives.

**The nearest candidate — identified, not scoped.** The small-screen mechanics release: **F-2** and
**F-8** (wrap the four fixed-pixel grids in the `overflowX:auto` idiom five other tables already use)
and **F-6** (`inputMode="decimal"` on money fields). All are render-code string edits with no engine
change, and v5.39's §13 disclosure means the app currently *documents* these flaws rather than fixing
them. F-8 became cheap when measurement showed it needs the same wrapper as F-2, not a layout rewrite.

**The open work is tracked as findings, not scopes:** `ARCHITECTUREIssues.md` (Section E — six post-audit entries E-15…E-20 were added at v5.36 and **E-16 was closed the same day, in-release**; among the open items **E-6**, **E-14/E-18** (the hash-table principle, now executed at session close and packaging) and **E-15** — the ordinary-growth omission, optimistic, its own release — lead) and
`MissingFeatures.md` (Section D — **D-2**, unrealized capital gains on ordinary drawdown, is the ranked
top item and the one that points the optimistic way). Section D still owes a systematic
undisclosed-gap sweep, which the Phase 3 rollup says Phase 4 should wait for.
**Section F ran anyway, deliberately and with that dependency disclosed** — `UsabilityFlaws.md`
(audited against v5.38) covers the usability ground and closed the `AUDIT_DOCS_HTML_v5_27.md` gap.
**Its documentation half shipped as v5.39**; F-11 (the callout broken by over-escaping, invisible to
`t4` because every docs assertion read text and only the markup was wrong) is fixed and now has an
extinction assertion. Its two-paragraph top-five summary is still **withheld**, because Section D's
sweep and Section C's 2D break-even half remain open. That summary is the work of the session that
closes those two. Still open from Section F: **F-2/F-8/F-6** (mechanical wrapper and input-mode
fixes) and **F-1/F-4**
(the small-screen and contrast questions, which are product-direction decisions for Steve, not fixes).

Releases (a), (b) and (c) of the `otherAccounts` plan
have ALL shipped — (a) v5.22, (b) v5.24 re-scoped as disclosure-only, and **(c) fold-and-classify
shipped at v5.26.** The previous text of this section claimed (c) "remains", which was true when
written and false from v5.26 onward.

✅ **E-10 CLOSED 2026-08-12.** `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` and
`SCOPE_ENGINE_D_MAGI_v5_24.md` had been retired as fulfilled while `qa/t19_engineD_exact.mjs` still
cited both — L61 as its governing scope, L96 as a **stop-instruction**. Steve restored both to
knowledge; `t19`'s references now resolve.

⚠ **THEY ARE FULFILLED SCOPES AND MUST NOT BE RETIRED AGAIN.** OPERATIONS §I says to retire fulfilled
`SCOPE_*.md` at each release, so the default behaviour of the release checklist is to delete these
and re-open E-10. They are **retained deliberately**, on the same footing as
`SCOPE_DEFECTS_v5_10_1.md` ("retained for reference, not retirement"). The durable alternative — and
the better long-term fix — is to re-point `t19`'s two comments at the v5.24 and v5.26 CHANGELOG
entries, which record the same outcomes and are never retired. Until that is done, retiring these two
files breaks `t19`'s guidance.

Every other absent
`SCOPE_*`, `FlawsToFix-*-INTERIM` and retired `DangerClose-v5_*.jsx` / `dom_entry_v5*.jsx` named
above is retired-by-design and recoverable from commit history.

**Retired at the v5.32 ship:** `SCOPE_ACA_FPL_FLOOR_v5_32.md` and
`STATUS_v5_32_ACA_FLOOR_PARTIAL.md`. The status partial was in the pool and had never been listed
here, which is worth naming because an unlisted pool file is invisible to the manifest-based
freshness check by construction — the same failure shape as E-14. Its substance is carried
forward: the §8 sub-floor measurement and its method into the v5.32 CHANGELOG and
`MissingFeatures.md` D-8, the parity finding into `ARCHITECTUREIssues.md` E-15.

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
