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
| Version | **v5.33** |
| Source file in knowledge | `DangerClose-v5_33.jsx` |
| Source md5 | `df10c6226d7c4519919bb55238609a92` |
| Built `index.html` md5 | `c998f5ff760c6c5e04ab6173a68f6421` |
| Shipped | 2026-08 |

**Any work — edits, verification, scope premises — is done against this file.** Confirm its
md5 matches the value above before starting (see the pre-build freshness check in
OPERATIONS.md §A). A mismatch means knowledge is stale — refresh before working.

## Test and harness file hashes (freshness fallback — OPERATIONS §A2)

**Why this table exists.** Until v5.30 the freshness check hashed the `.jsx` sources and nothing else,
so a stale test in this flat pool was invisible by construction. One was: the pool's `t8_invariant.mjs`
was an older 35-check copy with 3 failing assertions while the committed file had 38 and was green,
which halted the v5.30 build and cost most of a session to diagnose. Recorded as **E-14**.

⚠ **Prefer the clone-and-diff in OPERATIONS §A2 over this table.** A recorded table is only as fresh as
the release that wrote it, and this project has had three separate recorded blocks go stale. This is the
offline fallback, accurate **as of v5.33, 2026-08-14** — verified equal to the committed tree on that
date, with the sole exception noted below.

**Two mapping caveats.** The pool flattens repo paths: `tools_fixture.jsx` here is
`qa/tools/fixture/fixture.jsx` in the repo (byte-identical), and the baseline suites live under
`qa/qa-baseline/`. Match by content, not by filename position.

| Pool file | md5 | Repo path |
|---|---|---|
| `cap_tabs.mjs` | `9057b96d48b84f99dc322f7fc983674a` | `qa/qa-baseline/cap_tabs.mjs` |
| `dom_entry_v532.jsx` | `0bbc7aaeabe759cf7e14bb7209f91d6d` | `qa/qa-baseline/dom_entry_v532.jsx` |
| `dom_entry_v533.jsx` | `aa695416ba7bb84eb2468cf2b3c9c84f` | `qa/qa-baseline/dom_entry_v533.jsx` |
| `domdiff_withdrawal.mjs` | `26d0672f1b56116faabfc19566cc2402` | `qa/domdiff_withdrawal.mjs` |
| `env_dom.mjs` | `0ee15a1be6099a50319cfb271b530c4a` | `qa/qa-baseline/env_dom.mjs` |
| `main.jsx` | `d9eca7b469a3fb7ec1c5325fd4bf8145` | `src/main.jsx` |
| `shim.txt` | `aac48afff108aec51b8967dcda06bfb2` | `qa/qa-baseline/shim.txt` |
| `smoke_built.mjs` | `bc839044971ecd992bb9f4f019736d1e` | `qa/smoke_built.mjs` |
| `t10_taxcases.mjs` | `bcd00a8fad74d81c88e05f928aa8b5ec` | `qa/t10_taxcases.mjs` |
| `t11_survivor_rmd.mjs` | `dfa8ce062d9ae3bcca551a561ce717a8` | `qa/t11_survivor_rmd.mjs` |
| `t12_engineD_survivor.mjs` | `70fb865322692e042d364ca85437cc51` | `qa/t12_engineD_survivor.mjs` |
| `t13_engineC_irmaa.mjs` | `0be204b0d180fb40cf9bc7790f1c73ee` | `qa/t13_engineC_irmaa.mjs` |
| `t14_cross_engine_survivor.mjs` | `83ad5441e9574074567f21185ad17074` | `qa/t14_cross_engine_survivor.mjs` |
| `t15_engineA_death_filing.mjs` | `3fb4c83fd888ac6cad0ab0d57b8dba6b` | `qa/t15_engineA_death_filing.mjs` |
| `t16_roth_ladder_filing.mjs` | `829c97c01efeb707da011c1468fefbb5` | `qa/t16_roth_ladder_filing.mjs` |
| `t17_engineC_exact.mjs` | `75d21513fe2e98b4430507bd64e6a6f4` | `qa/t17_engineC_exact.mjs` |
| `t18_engineB_exact.mjs` | `b06e714aa050c11e5ede6e8771d7a243` | `qa/t18_engineB_exact.mjs` |
| `t19_engineD_exact.mjs` | `e86e069a29a13070c216fa9d7d6de34d` | `qa/t19_engineD_exact.mjs` |
| `t1_units.mjs` | `0946651c198b8f1e02db63529f3fad1b` | `qa/qa-baseline/t1_units.mjs` |
| `t20_other_taxtype.mjs` | `c9b127780227868ff05d2cd08b37e0bd` | `qa/t20_other_taxtype.mjs` |
| `t21_tools.mjs` | `c5fb4c712135028f1effa039c84e0b90` | `qa/t21_tools.mjs` |
| `t22_aca_floor.mjs` | `35a9aa86e6699b4ff0b9f7a7817bd08d` | `qa/t22_aca_floor.mjs` |
| `t2_engines.mjs` | `bc7628a4b3e309aadfd14c4d37f06417` | `qa/qa-baseline/t2_engines.mjs` |
| `t3_roth.mjs` | `dc23e0b50b9de0de168bf81f74a7634e` | `qa/qa-baseline/t3_roth.mjs` |
| `t4_dom.mjs` | `80a12cecb54799ddaadcc6c685ab9a16` | `qa/qa-baseline/t4_dom.mjs` |
| `t5_storage.mjs` | `7aa470a13adb33c8a54570a62bf85bc8` | `qa/qa-baseline/t5_storage.mjs` |
| `t6_single.mjs` | `bb9b238177ff290d0ac4a2f3d4a0bec3` | `qa/qa-baseline/t6_single.mjs` |
| `t7_accrual.mjs` | `490b82d3024b179a274b5498936e1a92` | `qa/t7_accrual.mjs` |
| `t8_invariant.mjs` | `a9bd015c8b50b54a98d0ed9a4e2afaaf` | `qa/t8_invariant.mjs` |
| `t9_dom_smoke.mjs` | `080c3edbe5f5479ac488d2f54034de69` | `qa/t9_dom_smoke.mjs` |
| `tools_fixture.jsx` | `3602b615b65f09995a9eb1fa17fe4175` | `qa/tools/fixture/fixture.jsx` |

`probe_classify.mjs` was removed from the pool at v5.30 and now lives only in the repo at
`qa/tools/probe_classify.mjs`.

⚠ **The repo's copy of THIS FILE was one release stale through v5.30** — the committed
`PROJECT_KNOWLEDGE_INDEX.md` still named v5.29 as current and carried no §A2 table at all, because
the v5.30 refresh updated knowledge but never committed the manifest. Found by the v5.31 clone-and-diff
(46 of 47 pool files matched the committed tree; this was the one). The manifest ships to **both**
destinations from v5.31 forward.

## Prior build (the regression comparison baseline)

| Field | Value |
|---|---|
| Version | **v5.32** |
| Source file in knowledge | `DangerClose-v5_32.jsx` |
| Source md5 | `7e7be3f869f298667fe994074cfffb06` |

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
| `t4_dom.mjs` | 26-tab DOM walk. **+17 at v5.24:** extinction assertions on the corrected Withdrawal Priority 1 copy and the Field Manual. The six manual checks read the iframe `srcdoc` attribute, NOT `textContent` — `DOCS_HTML` reaches the DOM only through `<iframe srcDoc>`, so a textContent read passes vacuously on both builds. Negative-controlled at 15/17. **+17 at v5.33:** the embedded-gain panel in My Data — that it renders, its label copy asserted verbatim, that Save & Apply writes through to `PORTFOLIO.taxableGainPct`, and that out-of-range and negative entries are clamped on save. ⚠ The label assertions are **disclosure locks** (OPERATIONS §B2): they check that copy saying the model does not use the field is PRESENT, and will pass at v5.34 whether or not that copy is still true. Re-query the input after every save — React replaces the node and a held reference types into a detached element | when tests change |
| `t5_storage.mjs` | Persistence / storage contract (incl. the 13-key Clear-All wipe loop). **+14 at v5.33 (group E):** `taxableGainPct` persists through Save & Apply, restores as 0 from a simulated pre-v5.33 backup that lacks it, normalises an unparseable value to 0, survives a backup-bytes round trip at a user-set 40, and is clamped by the accessor at an out-of-range 200. The bytes round trip is JSON, not the Export button: `handleExport` serialises `buildPortfolio()` — the FORM state — so driving the real button after mutating the module global exports the old value. `t4` owns the control-driven half | when tests change |
| `t6_single.mjs` | Single-filer branch | when tests change |
| `t7_accrual.mjs` | Contribution accrual (v5.10 feature suite) | when tests change |
| `t8_invariant.mjs` | Invariants; reads canonical `DangerClose.jsx` from the run-folder root | when tests change |
| `t9_dom_smoke.mjs` | DOM smoke (fast environment validation — run this first to prove the toolchain) | when tests change |
| `t11_survivor_rmd.mjs` | Survivor RMD / filing-transition suite — **40 checks**. DOM-read at ±$500 (OPERATIONS §M); its header carries the two honesty notes on precision and on the effect size that makes that band adequate | when tests change |
| `t12_engineD_survivor.mjs` | Engine D survivor suite — **23 checks**, module-level and dollar-exact. ⚠ **Release (c) of the `otherAccounts` plan moves Engine D's balances, so this is the suite that must be re-verified case by case there** | when tests change |
| `t13_engineC_irmaa.mjs` | Engine C IRMAA survivor extinction invariant (C-2C-5, v5.13) — 42 checks, three omissions, both directions, plus a person-count isolation case | when tests change |
| `t14_cross_engine_survivor.mjs` | Cross-engine survivor SS invariant (decision D-5) — **44 checks**; the only cover for Engine A is structural, and the file says so. **D-4 addendum 2026-08-14:** source windows are **bounded** (anchor → start of the next top-level function), not fixed character spans — a span ages as the engine grows around the rule and then fails looking like an app regression. Both bounds asserted unique; a missing end marker fails loudly, never falls back. ⚠ Engine D's death check asserts the **absence of the weakened `>` form**, which is sound only because Engine D has **no filing concept** — if it ever gains one, that assertion must MOVE to `filingEngines`, not be deleted | when tests change |
| `t16_roth_ladder_filing.mjs` | Roth ladder filing-status extinction invariant (C-2B-3, v5.15) — 24 checks against an independent IRS reference, incl. that the couple's ladder does NOT move | when tests change |
| `t17_engineC_exact.mjs` | Engine C dollar-exact (v5.18) — 63 checks against CMS figures via the module-level `computeIrmaaPlan`; tier borders ±$1, indexation, freeze, lookback, per-person counts, survivor switch, QCD. Negative-controlled at 23/63. Asserts the surcharge constants' ≤$5 **bound**, not CMS-exact amounts | when tests change |
| `t18_engineB_exact.mjs` | Engine B dollar-exact (v5.21) — 50 checks via module-level `computeTaxPlan`; federal brackets, age-65 extra per spouse, SS taxability, **plus the first Engine A vs Engine B agreement invariant** (they agree). Negative-controlled at 24/47. NOT yet covered: LTCG, NIIT, AMT, FICA, state, survivor | when tests change |
| `t19_engineD_exact.mjs` | **NEW at v5.23** — Engine D's first discriminating coverage. 14 checks: five structural (reachability, the 17-key return contract, determinism, parameter purity) and eight fixture/pinned. Three dated `[KNOWN DEFECT]` pins (taxable pot == all of `otherAccounts`; `magi` omits taxable draws; named-IRA money never reaches the RMD balance). Negative-controlled twice — 12/13 and 11/13. Not yet dollar-exact; that is release (b)/(c) work. **AMENDED at v5.24:** the B-2 pin was re-tagged `| rel c` and reworded. It previously read "Engine D magi omits drawFromTaxable" tagged `rel b`, which named something that is CORRECT and instructed the next session to introduce a defect. The assertion itself was right and is unchanged. Repo `qa/` |
| `domdiff_withdrawal.mjs` | Cross-version DOM diff of the Withdrawal tab, **re-pointed at v5.24 to v5.23 → v5.24 and grown 4 → 10 checks**. It now excises the one deliberately reworded panel BY ANCHOR and requires everything else byte-identical, rather than relaxing the comparison — and separately asserts the panel did change and that only the prior build carries the false claim. **It hardcodes its default version pair; re-point it every release.** Originally new at v5.23, v5.22 → v5.23. **This is the proof the hoist changed nothing**, because the pre-existing suite does not discriminate on Engine D (OPERATIONS §B2). 4 checks; cross-version by nature, so NOT counted in the release headline. Repo `qa/` |
| `t21_tools.mjs` | **NEW 2026-08-11** — tests the `qa/tools/` parser toolkit itself against a fixture with hand-counted known answers. 50 checks, negative-controlled six ways. Counted SEPARATELY from the app total: it verifies tooling, not the build. Carries one dated `[KNOWN DEFECT]` pin — `census.cjs` double-reports object shorthand and export specifiers, so its "hits" exceed its site count. Repo `qa/` |
| `tools_fixture.jsx` | **NEW 2026-08-11** — the fixture `t21` reads. **NOT AN APP SOURCE**: never built, never imported, never version-bumped, and it does NOT count toward the "exactly two `.jsx` app sources" rule. Repo `qa/tools/fixture/fixture.jsx`; knowledge is flat so it lives here under this name, and `t21` resolves either. Line numbers are load-bearing — add cases at the END only |
| `t22_aca_floor.mjs` | **NEW at v5.32** — the ACA 100%-of-FPL eligibility floor. **64 checks** in seven groups: the floor as an `[EXTINCTION]` set in BOTH regimes; regime symmetry; the boundary hand-computed to the cent from HHS/ASPE and Rev. Proc. 2025-25 typed independently; the drift case; Engine A end-to-end on a household crossing the floor twice at two depths; **group F, the cross-version byte-identity check on `acaSubByYr`/`totAcaLoss`/`estate`**; and five negative controls, all firing. ⚠ **Group F exists because parity is blind here** — `t2`'s fingerprint household is `acaPremium: 0`, so no ACA code runs inside the guardrail at all (E-15). Do not delete it as redundant; the file's header says so too. Group F reads the PRIOR leg's bundle and defaults to **`v532` at v5.33** (rolled forward, like `t2`'s parity pair). ⚠ **Rolling that default is not sufficient on its own.** Group F mixes claims true for ANY pair (byte identity) with one true for a SINGLE transition — *"acaFloorYrs is NEW"*, which is false once the prior build is v5.32. That check is now **gated on the prior tag**, so the suite holds at 64 on either pairing. The rotation forces the roll: v5.31 left knowledge at v5.33, so `app_v531.mjs` can no longer be built from knowledge alone. Repo `qa/` |
| `t20_other_taxtype.mjs` | **NEW at v5.25** — the Other-accounts `taxType` schema, its migration, and the extinction assertion that no engine reads the field. 94 checks. The extinction check is a **permutation test**: the same household runs twice with every type flipped and all five engines must return byte-identical output — so it fires the moment release (c) starts reading the field. Also carries the required equality that inference over the example household reproduces the $111,000 / $21,000 / $15,000 split v5.24 published. Negative-controlled five ways; two of its own assertions were caught passing vacuously on v5.24 and now assert a precondition first. Repo `qa/` |
| `dom_entry_v532.jsx` | Harness entry for the v5.32 CJS DOM bundle (current leg). Repo `qa/qa-baseline/` |
| `dom_entry_v531.jsx` | Harness entry for the v5.31 CJS DOM bundle (prior leg). Repo `qa/qa-baseline/` |
| `VERIFY.sh` | Release verification driver. **Added to knowledge at v5.23** — it was previously repo/local only, so a session working from knowledge alone could not reproduce the release run. Repo root |
| `t15_engineA_death_filing.mjs` | Engine A death-year filing extinction invariant (C-2C-6, v5.14) — 11 checks, **dollar-exact** (module-level engine), incl. the non-conservative high-MAGI corner | when tests change |
| `t10_taxcases.mjs` | Tax-case assertions built by the Phase 2 audit: 76 federal-core (2A) + 35 IRMAA (2B) = **163** at v5.30 (2A 76 · 2B 87 · 2D 27 · 2E 21), incl. 3 dated `[KNOWN DEFECT]` pins. **ADOPTED into `run_all.sh` at v5.14** (scope D-4); pins flipped, borders re-derived, now 115 checks | when audit phases add cases |
| `smoke_built.mjs` | The **built-artifact** suite — **16 checks** against the published single-file `index.html`, not the source: boots it, dismisses the disclaimer gate, mounts React, loads the example household, and round-trips the `window.storage` shim. Added v5.11 after a build passed every source check while being unable to save a plan | when tests change |
| `qa-baseline-README.md` | How to run the baseline suite (renamed from qa-baseline/README.md for the flat pool) | when it changes |
| **qa-baseline harness files** | `shim.txt`, `mk_testable.sh`, `env_dom.mjs`, `run_all.sh`, `cap_tabs.mjs` — the `dom_entry_*` files are listed individually above, current + prior only | when they change. NOTE (v5.10.2): stale knowledge copies were re-synced from the committed repo at that refresh. The repo is their source of truth. |
| **`qa/tools/` parser toolkit** | `funcmap.cjs` (function boundaries — line numbers move every release), `census.cjs` (identifier/property/string hits with enclosing scope chain), `diverge.cjs` (normalized-fingerprint duplicate detection), `residual.cjs` (narrow: `balance − roth − trad`; ages out after release (c)). All four named explicitly per §G — a folder reference makes them invisible. They live in `qa/tools/`, **not** `qa/`, because they assert nothing and must never be countable as checks. **Tested since v5.25 by `t21_tools.mjs` (50 checks) against `tools_fixture.jsx`**, negative-controlled six ways; one pinned defect (AST hits vs source sites) is disclosed by reporting both counts since v5.29. Census and site-count questions go through these, never greps (OPERATIONS §B1) | when the tools change |
| **build scaffold files** | `index.html` (the Vite HTML entry template), `main.jsx` (the browser bootstrap), `vite.config.js`, `package.json` — all four, per OPERATIONS §G. Without all four a session working from knowledge **cannot produce the published `index.html`** (the v5.11 failure). ⚠ **`vite.config.js` is written with a DOT** — the session mount displays it as `vite_config.js`; that is a mount artifact, not the pool name (verified 2026-08-10: same file, md5 `30da5708038a1d7c97a4b06777ea8e8a`). It is the only file in the pool where the mounted name differs from the real one | when the build setup changes |
| `SITE_CENSUS_v5_10.md` | Code census (self-versioned by filename) | new one per feature |
| `SCOPE_STANDING_AUDIT.md` | Reusable audit spec (not version-specific) | rarely |
| `OPERATIONS.md` | **The operational appendix, §A–§N** — freshness check, suite layout, harness traps, defect pins, parity guardrail, ship verification, storage/rotation, release checklist, packaging, instrumentation ceiling, and the `index.html` build. **Read it before any build, fix, scope, or release, starting with §A.** | when mechanics change |
| `PROJECT_KNOWLEDGE_INDEX.md` | This manifest | every refresh |

---

## Audit findings and scopes (self-versioned by filename)

Read these together with the build they are pinned to. Every finding document names its build
version + md5 in its header; a finding pinned to an older build has NOT been re-verified against
the current source unless it says so.

| File | What it is | Status |
|---|---|---|
| `FlawsToFix-v5_10_1-Phase1.md` | Phase 1 audit (Sections A+B) against v5.10.1 | B-2 fixed at v5.10.2; B-1 closed as disclosed limitation; **A-2 open**, LOW, needs its own scope |
| `FlawsToFix-v5_15-Phase2D.md` | Sub-phase 2D findings, **REVISION 3**. Completeness half done to the Section C standard, verified **per engine**; break-even half still a premise reading. Revisions 1 and 2 both stated mechanisms wrongly — §1 records both errors and the single cause | **2D IN PROGRESS** — §6 owes the break-even arithmetic and `t10` cases |
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
| `AUDIT_2D_BREAKEVEN_v5_28.md` | Sub-phase 2D — Roth break-even + account completeness (27 checks) against v5.28 | complete |
| `AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md` | Sub-phase 2E — state-tax module (21 checks) **and the Phase 2 roll-up**. The document a Phase 3+ session must read first: it names what is already verified and therefore not a finding | complete — **authoritative for Phase 2** |
| `AUDIT_DOCS_HTML_v5_27.md` | Audit of the Field Manual against shipped v5.27 behaviour. Records that the **glossary, §10 API-key material and §14 FAQ were NOT audited** — that ground is Section F | complete, with the stated gap |
| `STATUS_release_a.md` | Release-(a) status note (taxable-residual consolidation, v5.22) | historical |
| `STATUS_v5_23_engineD_hoist.md` | Engine D hoist status note (v5.23) | historical |
| ~~`probe_classify.mjs`~~ | **RESOLVED at v5.30 — removed from knowledge, now versioned.** Committed to the repo at `qa/tools/probe_classify.mjs` with a header recording what it was for. It is a v5.25-era probe from the `otherAccounts` scoping work; **its conclusions have since shipped and are asserted by `t20`**, so its "what would move" output now describes a change that already happened. It asserts nothing and **must never be counted in a release total**. Read `t20` instead. | retired from knowledge |
| `MissingFeatures.md` | **Section D** of the standing audit (Phase 3) — missing taxation features, priority-ordered, pinned to v5.29. **Partial:** D-1 verified to source; D-2…D-6 assessed; no systematic undisclosed-gap sweep | Section D **incomplete — re-run before the top-five summary** |
| `ARCHITECTUREIssues.md` | **Section E** of the standing audit (Phase 3) — 13 findings, pinned to v5.29. Highest: jsdom duplicated **9×** (not 8), OBBBA constants outside `TAX_CONSTS` with a 2028 fuse, backup export does not identify the build | Section E **covered** |
| `AUDIT_PHASE3_ROLLUP.md` | Phase 3 roll-up (Sections D + E) | current |
| `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` | **REVISION 2.** Governing scope for the three-release `otherAccounts` plan — (a) v5.22, (b) v5.24, (c) v5.26. §1 records three corrections to its own premise; §7 carries Steve's resolved decisions D-1…D-7 | **FULFILLED (all three shipped) — RESTORED to knowledge 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `qa/t19_engineD_exact.mjs` L61 cites it as its governing scope |
| `SCOPE_ENGINE_D_MAGI_v5_24.md` | Release (b). §1 corrects the carried-forward premise (adding `drawFromTaxable` to `magi` would have been a **defect**, not a fix); §8 is the correction owed to `t19`'s B-2 pin. §8 also warns the finding **"is unusually good at being restated wrongly"** and counts three prior wrong statements | **FULFILLED at v5.24 — RESTORED 2026-08-12 and RETAINED DELIBERATELY.** ⚠ Do **not** retire: `t19` L96 is a **stop-instruction** telling a session to read its §1 before touching `magi` |
| ~~`SESSION_BRIEF_v5_30_BUILD.md`~~ *(retire — spent)* | Build brief for v5.30 — pasted as the first message of the build session. Carries the freshness expectations, the three edits, the per-leg gating rule, and the version-bump tax | current |
| ~~`SCOPE_FIX_obbba_disclosure_v5_30.md`~~ *(retired)* | Scope for **D-1(a)/(b) + E-3** — the false OBBBA disclosure in Field Manual §13 and METHODOLOGY §5, and the false source comment at L829–831. Three edits, no engine change, parity must stay 8/8. §3 records the §B2 lock check (clean) and a second gap it surfaced: nothing asserts Engine B *applies* the bonus | **RETIRED — FULFILLED BY v5.30 (verified 2026-08-13).** All three edits shipped, `t18` gained the three hand-computed OBBBA cases including the 2029 sunset, and E-3 was closed and named in the CHANGELOG. Delete from the pool with its build brief |

---

## Retirement list (delete-first; nothing replaces these)

⚠ **This section, the rotation block below, and several table rows above had gone stale by five
releases** — they described the v5.24 refresh while the two tables at the top of this file were
correctly rolled to v5.29. Corrected at the v5.30 refresh. The cause is structural and is recorded
as a finding: OPERATIONS §I's "refresh project knowledge once with the final state, delete-first"
was executed on the top tables and not on the body. **Roll the whole file or none of it.**

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

**Active scopes after this refresh: NONE.** v5.31 shipped on 2026-08-13, and its scope and build brief
are retired with it. The next release needs a scope
written before it is built (project instructions, *Scope before build*).

**The open work is tracked as findings, not scopes:** `ARCHITECTUREIssues.md` (Section E — **eleven**
open after E-2 closed at v5.31; **E-6** and **E-14** are the two rated High, and **E-9** — two copies of
the 1.02 indexation proxy — is the adjacent one this release deliberately left alone) and
`MissingFeatures.md` (Section D — **D-2**, unrealized capital gains on ordinary drawdown, is the ranked
top item and the one that points the optimistic way). Section D still owes a systematic
undisclosed-gap sweep, which the Phase 3 rollup says Phase 4 should wait for.

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
