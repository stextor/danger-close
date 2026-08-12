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
| Version | **v5.29** |
| Source file in knowledge | `DangerClose-v5_29.jsx` |
| Source md5 | `4ef69e9a820fac18b99aa2aa46a8b2a1` |
| Built `index.html` md5 | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Shipped | 2026-08 |

**Any work — edits, verification, scope premises — is done against this file.** Confirm its
md5 matches the value above before starting (see the pre-build freshness check in
OPERATIONS.md §A). A mismatch means knowledge is stale — refresh before working.

## Prior build (the regression comparison baseline)

| Field | Value |
|---|---|
| Version | **v5.28** |
| Source file in knowledge | `DangerClose-v5_28.jsx` |
| Source md5 | `9e06482087f415661196b1c47f7e8be0` |

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
| `t1_units.mjs` | Units & statics (asserts the four in-app version strings — a stale bump fails here) | when tests change |
| `t2_engines.mjs` | Engines + **cross-version MC parity** (`compare` must stay 8/8) | when tests change |
| `t3_roth.mjs` | Roth engine | when tests change |
| `t4_dom.mjs` | 26-tab DOM walk. **+17 at v5.24:** extinction assertions on the corrected Withdrawal Priority 1 copy and the Field Manual. The six manual checks read the iframe `srcdoc` attribute, NOT `textContent` — `DOCS_HTML` reaches the DOM only through `<iframe srcDoc>`, so a textContent read passes vacuously on both builds. Negative-controlled at 15/17 | when tests change |
| `t5_storage.mjs` | Persistence / storage contract (incl. the 13-key Clear-All wipe loop) | when tests change |
| `t6_single.mjs` | Single-filer branch | when tests change |
| `t7_accrual.mjs` | Contribution accrual (v5.10 feature suite) | when tests change |
| `t8_invariant.mjs` | Invariants; reads canonical `DangerClose.jsx` from the run-folder root | when tests change |
| `t9_dom_smoke.mjs` | DOM smoke (fast environment validation — run this first to prove the toolchain) | when tests change |
| `t11_survivor_rmd.mjs` | Survivor RMD / filing-transition suite — **40 checks**. DOM-read at ±$500 (OPERATIONS §M); its header carries the two honesty notes on precision and on the effect size that makes that band adequate | when tests change |
| `t12_engineD_survivor.mjs` | Engine D survivor suite — **23 checks**, module-level and dollar-exact. ⚠ **Release (c) of the `otherAccounts` plan moves Engine D's balances, so this is the suite that must be re-verified case by case there** | when tests change |
| `t13_engineC_irmaa.mjs` | Engine C IRMAA survivor extinction invariant (C-2C-5, v5.13) — 40 checks, three omissions, both directions, plus a person-count isolation case | when tests change |
| `t14_cross_engine_survivor.mjs` | Cross-engine survivor SS invariant (decision D-5) — 24 checks; the only cover for Engine A is structural, and the file says so | when tests change |
| `t16_roth_ladder_filing.mjs` | Roth ladder filing-status extinction invariant (C-2B-3, v5.15) — 21 checks against an independent IRS reference, incl. that the couple's ladder does NOT move | when tests change |
| `t17_engineC_exact.mjs` | Engine C dollar-exact (v5.18) — 63 checks against CMS figures via the module-level `computeIrmaaPlan`; tier borders ±$1, indexation, freeze, lookback, per-person counts, survivor switch, QCD. Negative-controlled at 23/63. Asserts the surcharge constants' ≤$5 **bound**, not CMS-exact amounts | when tests change |
| `t18_engineB_exact.mjs` | Engine B dollar-exact (v5.21) — 47 checks via module-level `computeTaxPlan`; federal brackets, age-65 extra per spouse, SS taxability, **plus the first Engine A vs Engine B agreement invariant** (they agree). Negative-controlled at 24/47. NOT yet covered: LTCG, NIIT, AMT, FICA, state, survivor | when tests change |
| `t19_engineD_exact.mjs` | **NEW at v5.23** — Engine D's first discriminating coverage. 13 checks: five structural (reachability, the 17-key return contract, determinism, parameter purity) and eight fixture/pinned. Three dated `[KNOWN DEFECT]` pins (taxable pot == all of `otherAccounts`; `magi` omits taxable draws; named-IRA money never reaches the RMD balance). Negative-controlled twice — 12/13 and 11/13. Not yet dollar-exact; that is release (b)/(c) work. **AMENDED at v5.24:** the B-2 pin was re-tagged `| rel c` and reworded. It previously read "Engine D magi omits drawFromTaxable" tagged `rel b`, which named something that is CORRECT and instructed the next session to introduce a defect. The assertion itself was right and is unchanged. Repo `qa/` |
| `domdiff_withdrawal.mjs` | Cross-version DOM diff of the Withdrawal tab, **re-pointed at v5.24 to v5.23 → v5.24 and grown 4 → 8 checks**. It now excises the one deliberately reworded panel BY ANCHOR and requires everything else byte-identical, rather than relaxing the comparison — and separately asserts the panel did change and that only the prior build carries the false claim. **It hardcodes its default version pair; re-point it every release.** Originally new at v5.23, v5.22 → v5.23. **This is the proof the hoist changed nothing**, because the pre-existing suite does not discriminate on Engine D (OPERATIONS §B2). 4 checks; cross-version by nature, so NOT counted in the release headline. Repo `qa/` |
| `t21_tools.mjs` | **NEW 2026-08-11** — tests the `qa/tools/` parser toolkit itself against a fixture with hand-counted known answers. 49 checks, negative-controlled six ways. Counted SEPARATELY from the app total: it verifies tooling, not the build. Carries one dated `[KNOWN DEFECT]` pin — `census.cjs` double-reports object shorthand and export specifiers, so its "hits" exceed its site count. Repo `qa/` |
| `tools_fixture.jsx` | **NEW 2026-08-11** — the fixture `t21` reads. **NOT AN APP SOURCE**: never built, never imported, never version-bumped, and it does NOT count toward the "exactly two `.jsx` app sources" rule. Repo `qa/tools/fixture/fixture.jsx`; knowledge is flat so it lives here under this name, and `t21` resolves either. Line numbers are load-bearing — add cases at the END only |
| `t20_other_taxtype.mjs` | **NEW at v5.25** — the Other-accounts `taxType` schema, its migration, and the extinction assertion that no engine reads the field. 61 checks. The extinction check is a **permutation test**: the same household runs twice with every type flipped and all five engines must return byte-identical output — so it fires the moment release (c) starts reading the field. Also carries the required equality that inference over the example household reproduces the $111,000 / $21,000 / $15,000 split v5.24 published. Negative-controlled five ways; two of its own assertions were caught passing vacuously on v5.24 and now assert a precondition first. Repo `qa/` |
| `dom_entry_v529.jsx` | Harness entry for the v5.29 CJS DOM bundle. Repo `qa/qa-baseline/` |
| `dom_entry_v528.jsx` | Harness entry for the v5.28 CJS DOM bundle (prior leg). Repo `qa/qa-baseline/` |
| `VERIFY.sh` | Release verification driver. **Added to knowledge at v5.23** — it was previously repo/local only, so a session working from knowledge alone could not reproduce the release run. Repo root |
| `t15_engineA_death_filing.mjs` | Engine A death-year filing extinction invariant (C-2C-6, v5.14) — 11 checks, **dollar-exact** (module-level engine), incl. the non-conservative high-MAGI corner | when tests change |
| `t10_taxcases.mjs` | Tax-case assertions built by the Phase 2 audit: 76 federal-core (2A) + 35 IRMAA (2B) = **111**, incl. 3 dated `[KNOWN DEFECT]` pins. **ADOPTED into `run_all.sh` at v5.14** (scope D-4); pins flipped, borders re-derived, now 115 checks | when audit phases add cases |
| `smoke_built.mjs` | The **built-artifact** suite — **16 checks** against the published single-file `index.html`, not the source: boots it, dismisses the disclaimer gate, mounts React, loads the example household, and round-trips the `window.storage` shim. Added v5.11 after a build passed every source check while being unable to save a plan | when tests change |
| `qa-baseline-README.md` | How to run the baseline suite (renamed from qa-baseline/README.md for the flat pool) | when it changes |
| **qa-baseline harness files** | `shim.txt`, `mk_testable.sh`, `env_dom.mjs`, `run_all.sh`, `cap_tabs.mjs` — the `dom_entry_*` files are listed individually above, current + prior only | when they change. NOTE (v5.10.2): stale knowledge copies were re-synced from the committed repo at that refresh. The repo is their source of truth. |
| **`qa/tools/` parser toolkit** | `funcmap.cjs` (function boundaries — line numbers move every release), `census.cjs` (identifier/property/string hits with enclosing scope chain), `diverge.cjs` (normalized-fingerprint duplicate detection), `residual.cjs` (narrow: `balance − roth − trad`; ages out after release (c)). All four named explicitly per §G — a folder reference makes them invisible. They live in `qa/tools/`, **not** `qa/`, because they assert nothing and must never be countable as checks. ⚠ **Not themselves tested** — outputs corroborated against hand-read facts, which is not a test; a fixture is outstanding. Census and site-count questions go through these, never greps (OPERATIONS §B1) | when the tools change |
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
| `SCOPE_AUDIT_PHASE2_v5_10_2.md` | Governing scope for Phase 2 / Section C. Decisions D-1…D-5 are **binding** on all 2A–2E work | active — 2D and 2E not yet run |
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

---

## Retirement list (delete-first; nothing replaces these)

**Retired at the v5.24 release — DELETE THESE FOUR:**
- `DangerClose-v5_22.jsx` — rolls OUT of the two-file rotation (md5 `aac6851f91860edc8341dd44a2c35424`,
  on record in the v5.22 CHANGELOG provenance line).
- `dom_entry_v522.jsx` — its source no longer lives in knowledge, so knowledge cannot run that leg.
- `dom_entry_v521.jsx` — **a leftover the v5.23 rotation should have dropped and did not.** Found
  during the v5.24 freshness check. It is not a duplicate name, so it never tripped the two-file
  `.jsx` invariant or the "a name appearing twice" check; nothing in the pool looked wrong. The
  `dom_entry_*` files now get individual manifest rows for exactly this reason — a folded
  "harness files" row hid it for a full release.
- `SCOPE_ENGINE_D_MAGI_v5_24.md` — **FULFILLED** by this release. Its §7 D-2 (blunt copy) and D-3
  (METHODOLOGY note) both shipped; its §8 correction to `t19`'s B-2 pin shipped. Per the standing
  rule that retiring a scope means writing its outcome back, the outcome is recorded in the v5.24
  CHANGELOG and in METHODOLOGY §12, not only here.

**Active scopes after this refresh: `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` (only).**
Release (a) shipped at v5.22, (b) shipped at v5.24 re-scoped as disclosure-only, and **(c) —
fold and classify — remains.** Note that (b)'s original shape did not survive contact with the
source; see the v5.24 CHANGELOG for why adding `drawFromTaxable` to `magi` would have been a defect.

- `FlawsToFix-v5_10_2-Phase2C-INTERIM.md` — superseded by `FlawsToFix-v5_10_2-Phase2C.md`.
  **DONE — confirmed removed from the pool 2026-08-08.**
- `SCOPE_FIX_survivor_rmd.md` — **duplicate.** Byte-identical (`06f77e7f061c992b1e2aee6af081b39b`) to
  `SCOPE_FIX_survivor_rmd_v5_11.md`, which supersedes it under the versioned name required by §G. The
  rename was an upload without a matching delete, so the pool now holds the same document twice.
  **Remove the unversioned copy.**

Retired at the v5.21 release: `DangerClose-v5_19.jsx` rolls OUT of the two-file rotation (md5
`3f152d70aa713fc4cd5891bb777ad742`, on record in the v5.19 CHANGELOG provenance line), and
`dom_entry_v519.jsx` with it. **`SCOPE_FIX_engineB_export_exact_tests_v5_20.md` is FULFILLED — retire it.**
**Active scopes after this refresh: `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` and
`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`.** *(The v5.15 scope was superseded and deleted on
2026-08-10, in the re-verification pass that preceded release (a) — see the standing rule below.)*

Retired at the v5.20 release: `DangerClose-v5_18.jsx` rolls OUT of the two-file rotation (md5
`45376b843608916cea9a8021153e1bca`, on record in the v5.18 CHANGELOG provenance line), and
`dom_entry_v518.jsx` with it. **`SCOPE_FIX_rothLadder_senior_deduction_v5_19.md` is FULFILLED — retire it.**

**STANDING RULE, added v5.20 — knowledge holds EXACTLY the scopes named as active below. Any other
`SCOPE_FIX_*` in the pool is a leftover and should be deleted.** Fulfilled scopes survived four
consecutive refreshes because deletion is the only step in the refresh that removes rather than adds,
and nothing in the pool looked wrong afterwards. This makes a leftover checkable at a glance, the way
the two-file `.jsx` rotation already is — that invariant has never once been missed.
**Active scopes: `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` and
`SCOPE_CONSOLIDATE_taxable_residual_v5_22.md` (both, and only these two).**
*(Updated 2026-08-10: the v5.15 scope was SUPERSEDED by revision 2 and deleted — it is not a leftover
to restore. Two active scopes is correct here because D-7 split the work into three releases.)*

Retired at the v5.19 release: `DangerClose-v5_17.jsx` rolls OUT of the two-file rotation (md5
`b466b02f3a10d1993a6e345f8070d8b3`, on record in the v5.17 CHANGELOG provenance line), and
`dom_entry_v517.jsx` with it. **`SCOPE_FIX_engineB_hoist_v5_17.md` is FULFILLED — retire it.**

Retired at the v5.18 release: `DangerClose-v5_16.jsx` rolls OUT of the two-file rotation (md5
`f78c128b5620f12313057c98e76f253b`, on record in the v5.16 CHANGELOG provenance line), and
`dom_entry_v516.jsx` with it. Also **`SCOPE_FIX_t15_version_tag_v5_17.md`** (fulfilled at v5.18) and
**`SCOPE_FIX_engineC_export_exact_tests_v5_17.md`** (fulfilled at v5.18).
**Still outstanding from an earlier cycle:** `SCOPE_FIX_roth_tab_filing_status_v5_14.md` was listed
for retirement at v5.15 and is still in the pool — delete it.

Retired at the v5.17 release: `DangerClose-v5_15.jsx` rolls OUT of the two-file rotation (md5
`f915dd8c71142bcf16aeb00a6d56c403`, on record in the v5.15 CHANGELOG provenance line), and
`dom_entry_v515.jsx` with it — its source no longer lives in knowledge, so knowledge cannot run
that leg. The file stays in the repo.

Retired at the v5.16 release: `DangerClose-v5_14.jsx` rolls OUT of the two-file rotation (md5
`452626b89c509e44d0a1ccf4ec33cda2`, on record in the v5.14 CHANGELOG provenance line).

Retired at the v5.15 release: `SCOPE_FIX_roth_tab_filing_status_v5_14.md` (fulfilled).
`DangerClose-v5_13.jsx` rolls OUT of the two-file rotation; its md5
`0ed9e140cd9163e4523d8ff71959d56c` is on record in the v5.13 CHANGELOG provenance line.

Retired at the v5.14 release: `SCOPE_FIX_irmaa_indexation_v5_13.md` (fulfilled — F-2B-1 and F-2B-2
both fixed at v5.14). `DangerClose-v5_12.jsx` rolls OUT of the two-file rotation; its md5
`2ebfccb0ea9744c1015693badace4984` is on record in the v5.12 CHANGELOG provenance line.
*(`SCOPE_FIX_engineA_death_year_filing_v5_13.md` was written and fulfilled inside the same release
cycle and was never uploaded, so there is nothing to delete for it.)*

Retired at the v5.13 release: `SCOPE_FIX_survivor_engines_CD.md` and
`SCOPE_ADDENDUM_D6_EngineC_design.md` (both fulfilled — Engine D at v5.12, Engine C at v5.13);
`DangerClose-v5_11.jsx` (rolled out of the two-file rotation); `dom_entry_v511.jsx` (its source no
longer lives in knowledge).

Retired at the v5.12 release: `SCOPE_FIX_survivor_rmd_v5_11.md` (fulfilled at v5.11);
`DangerClose-v5_10_1.jsx` (rolled out of the two-file rotation — recoverable from commit history; pre-v5.12, so no recorded md5);
`dom_entry_v5102.jsx` (its source no longer lives in knowledge; the file remains repo-only,
since knowledge cannot run a leg whose source it does not hold).

---

## Rotation state (update at each release)

- **Last rotation:** v5.23 → v5.24 baseline pair established at the v5.24 ship;
  `DangerClose-v5_22.jsx` rolled OUT of knowledge, along with `dom_entry_v522.jsx` and the
  stale `dom_entry_v521.jsx` the v5.23 rotation missed.
  *(This block had gone stale: through v5.23 it still named v5.19 → v5.20 as the last rotation,
  three releases behind, while the two tables at the top of this file were correct. It is the
  same class of failure as the `dom_entry_v521.jsx` leftover — a section nobody reads because
  the authoritative answer is elsewhere. Roll it or delete it; do not leave it half-true.)*
- **Previous rotation:** v5.19 → v5.20 at the v5.20 ship;
  `DangerClose-v5_18.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.18 → v5.19 at the v5.19 ship;
  `DangerClose-v5_17.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.17 → v5.18 at the v5.18 ship;
  `DangerClose-v5_16.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.16 → v5.17 at the v5.17 ship;
  `DangerClose-v5_15.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.15 → v5.16 at the v5.16 ship;
  `DangerClose-v5_14.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.14 → v5.15 at the v5.15 ship;
  `DangerClose-v5_13.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.13 → v5.14 at the v5.14 ship;
  `DangerClose-v5_12.jsx` rolled OUT of knowledge.
- **Previous rotation:** v5.12 → v5.13 at the v5.13 ship;
  `DangerClose-v5_11.jsx` rolled OUT of knowledge (recoverable from commit history; its md5 is on
  record in this manifest's history and in the v5.12 CHANGELOG provenance line).
- **Next rotation (at the NEXT release):** roll `DangerClose-v5_23.jsx` OUT, add the new current
  source, promote `DangerClose-v5_24.jsx` to prior baseline, update the two tables above, and roll
  the `dom_entry_*` rows and this block with them.

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
