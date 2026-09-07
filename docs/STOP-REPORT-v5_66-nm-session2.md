# STOP REPORT — New Mexico (v5.66), session 2. Source and suite complete; artifact, docs and packaging owed.

**KIND: STOP mid-build. NOT A RELEASE.** No version was shipped. v5.65 remains current in the repo,
the pool and the served page.

| | |
|---|---|
| Base build | **v5.65** · source `7604fac5dab891bb31905544d11072f8` · artifact `b4ea0bd1d6993aadd0b7fedcfe47e580` · repo `5eb8dae` |
| Work-in-progress source | **`DangerClose-v5_66.jsx`** md5 `31b43e094307ef5f996570c090478e13` |
| Decision consumed | **D-NM-1 (c)** — keep the `income-limited` phrase now; fix the selector in its own scope |
| Why it stopped | Ten feature suites need harness inputs this session did not produce, so **no full-suite green can be claimed** — and §I does not let a release ship on a partial one |

---

## 1 · What is DONE and verified

**The source change is complete and correct.** New Mexico's `STATE_RULES` row now carries the nine
AGI bands of **NMSA 1978 § 7-2-5.2**, transcribed from `FINDINGS-v5_63-state-statutes.md` §2 and
**not re-derived**. `unit: "person"`, `base: "agi"`, no `cmp` key (the statute's *"not over"* is
`lte`, the default), and **no `exclAge`** — the statutory floor IS 65, which is `_floor`'s default.

**Direction: optimistic → conservative.** v5.65 grants a flat $8,000 at every income level; the
statute steps it to **$0 above $51,000 MFJ / $28,500 single AGI**, and has not been indexed since
Laws 1987, ch. 264, § 6. Figures will move DOWN for affected New Mexico households.

**Version bumped at all four in-app sites** — footer, DATA LOAD header, Field Manual callsign, Field
Manual footer. `t1`'s STATIC checks pass on the v566 leg, which is what proves it.

**Eighteen suite files register `v566`.** Applied per site-class, not by blanket pattern — the two
version-string ternaries in `t1` and `t4` got a NEW leading branch rather than a widened test, and
the four registries ending `"v565", "v592"` (the retired leg sorts last) were handled correctly.
⚠ **Verified by an AST sweep afterwards, which is the only evidence this project accepts here:**
18 files parse clean, and **no file registers `v565` without `v566`**.

**Two inversions GATED, not rewritten** (§B2). `t34` A-1/A-3 asserted *exactly Connecticut*; `t35`
D-7 asserted the unconverted set is *NM, NJ, RI, VA*. The pre-v5.66 forms are kept for the frozen
legs, where they remain true.

**New assertions, all negative-controlled:** `t34` A-7 (bands/agi/person/inclusive), A-8 (NM carries
NO `exclAge`, and CT's explicit 0 is the exception), A-9 (**the whole nine-amount sequence**), A-9a
(both tables terminate at `Infinity`), A-10 (band tops match the statute); `t35` **D-7a** — the
extinction invariant: **NM left the guarded set by CONVERTING, not by rewording.**

### Suite state, from suite output — not recalled

| Leg | t34 | t35 | baseline t1–t6, t10 |
|---|---|---|---|
| v5.65 (frozen) | 62 | 92 | green |
| **v5.66** | **67** | **93** | **t1 185 · t2 35 · t3 36 · t4 252 · t5 58 · t6 21 · t10 244, 0 failed** |

Sixteen further feature suites run green on v566 (713 checks). **Ten do not run at all** — see §3.

## 2 · ⚠ A CONTROL CAUGHT MY OWN TEST, and then a workspace drift caught the controls

**Two errors, both found by running things and neither by review.** They are the most useful part of
this report.

**(a) A-9's first draft asserted only the FIRST and LAST band amounts.** Changing the $1,000 band to
$9,999 passed all of `t34` and all of `t35` — the seven middle amounts were asserted by nothing. **A
table test that checks its own endpoints is checking that a table exists, not that it is right.**
Fixed by pinning the whole sequence, and the negative control now fires.

**(b) ⚠ THE WORKSPACE DRIFTED, AND THE NULL CONTROL IS WHAT FOUND IT.** The first control loop died
on a shell error **after** applying its mutation and **before** its restore. The "known good"
snapshot taken next was therefore already corrupt, and every control after it measured against a
poisoned baseline — which is exactly why C1 appeared *not to fire* and why C0 was not silent.

**The fix was to rebuild `v566.jsx` from `v565.jsx` and re-apply the edits deliberately**, per the
project instructions' workspace-drift caution: *quarantine the diff, revert to shipped, re-apply.*
The rebuilt source is the one shipped here, and its md5 is unchanged across the whole control run.

⚠ **A null control is not a formality.** Five mutation controls all "fired" against the poisoned
baseline and would have been reported as sound. **Only C0 was capable of noticing.**

### The controls as they now stand, against a verified-clean baseline

| | Mutation | Result |
|---|---|---|
| C0 | none | **silent** (t34 67/0, t35 93/0) |
| C1 | middle band amount $1,000 → $9,999 | t34 fires |
| C1b | band top $42,000 → $43,000 | t34 fires |
| C2 | `unit: person` → `household` | t34 fires |
| C3 | NM's `exclTest` removed | t34 fires ×5, t35 ×2 |
| C4 | note reworded out of the guarded set | **t35 D-7a fires** |

**C4 is the release's reason for existing** — it is the v5.54 New Jersey defect, pinned.

## 3 · What is NOT done, in the order it must be done

1. ⚠ **Ten feature suites do not run in this workspace** — `t8`, `t9`, `t11`, `t12`, `t13`, `t14`,
   `t16`, `t19`, `t22`, `t33`. They import `./app_testable.mjs`; copying `app_v566.mjs` to that name
   let `t7` run (41/0) but the other ten still report **0 passed, 0 failed**, which is the empty-set
   reading §B2 warns is worse than a failure. **This is a HARNESS setup gap, not evidence of a
   defect — and it must not be assumed to be either.** Diagnose before trusting any total.
2. **No dollar-exact behavioural test for NM.** Every new assertion is STRUCTURAL — it checks the
   table, not the tax. **Hand-verify a New Mexico household to the dollar** against the engine, both
   filing statuses, at least one band boundary and one household above $51,000. `t10` §2E is the
   home. **This is the single most important outstanding item.**
3. **`METHODOLOGY.md`** — mandatory, this is a modelling change. Cite § 7-2-5.2 and the oracle.
4. **Rebuild `index.html`** per §N and run `qa/smoke_built.mjs`.
5. **`CHANGELOG.md`, `TESTING.md`, `MissingFeatures.md` D-11** (NM is named there as *"untouched, own
   pass"*), the manifest, and the I-2 allowlist reason for `SCOPE_INCOME_CONDITIONING.md` — **three
   states left, not four.**
6. ⚠ **Roll `CHANGELOG.md`'s md5 row.** It gained one in the ninth package of 2026-09-07 and changes
   in every package.
7. ⚠ **RUN P1–P28 AGAINST THIS RELEASE'S PACKAGE, BEFORE THE ZIP IS SENT.** This will be the first
   un-uploaded **app-release** package since they were rewritten. Six report NOT CAUGHT against an
   ops package and **whether that is an input artefact or a real defect is UNKNOWN and MUST NOT BE
   ASSUMED** — that assumption is what let the whole K block rot for four days while reporting
   `CAUGHT`.

## 4 · Still owed by D-NM-1 (c), and it is not optional

**(c) was "ship NM on a safe note AND scope the selector fix in the same session, not as an
intention."** The note is safe — the phrase `income-limited` is retained and a comment at the site
says why it is load-bearing. **The selector scope is NOT written.** A test that selects a state set
by executing a regex against user-facing copy will break again the next time the copy improves;
this is the second occurrence. **Write that scope before this release ships, or (c) has silently
become (a).**

## 5 · Every file this session modified or created — §L's stop table

**Destination for all of them: the REPO.** Not the pool — no rotation happens until v5.66 actually
ships, and a `DangerClose-v5_66.jsx` in the pool beside v5.64 and v5.65 would break the two-source
rule and K-6.

| File | md5 | Destination |
|---|---|---|
| `handover/DangerClose-v5_66.jsx` | `31b43e094307ef5f996570c090478e13` | ⚠ **HOLD — do not commit to `src/` and do not put in the pool.** It is an unshipped build. Keep the zip until the release resumes |
| `github/qa/dom_entry_v566.jsx` | `2a10ecb50e47e529f8a1c04968aaaa3d` | `qa/` — **NEW.** H-1 keeps every `dom_entry_*` in the repo |
| `github/qa/t1_units.mjs` | `a707bbc4dd2b3ceca0f58108b0393872` | `qa/qa-baseline/` |
| `github/qa/t3_roth.mjs` | `21d9ea7fc61666cb7412e492b7c67401` | `qa/qa-baseline/` |
| `github/qa/t4_dom.mjs` | `bece31873c5e4f373d03bc3812a5e2eb` | `qa/qa-baseline/` |
| `github/qa/t5_storage.mjs` | `1cc59341c11689d002e37175a46fac4b` | `qa/qa-baseline/` |
| `github/qa/t6_single.mjs` | `5db5350a19818c51bb6906a71df290e5` | `qa/qa-baseline/` |
| `github/qa/t23_roth_ladder_rmd.mjs` | `8fe253c096a816d832ddff810f320435` | `qa/` |
| `github/qa/t24_ss86_phasein.mjs` | `d4b81dafa80d45615d9d1cb9437a9322` | `qa/` |
| `github/qa/t25_engineC_ss86.mjs` | `4508409b5acb9ce1f1042e806be0148f` | `qa/` |
| `github/qa/t26_noconv_span.mjs` | `84b2b29858f03c1e00d7dc9d82c9a943` | `qa/` |
| `github/qa/t27_half_cap.mjs` | `13801b5242c64da4f01a3987f8ee78c2` | `qa/` |
| `github/qa/t28_ssB_claim_gate.mjs` | `c8a77b3b652f5b0a1afced80de71b7fd` | `qa/` |
| `github/qa/t29_boundaries.mjs` | `c27d544230dcaafaf5a5c564d6de36e7` | `qa/` |
| `github/qa/t30_legible.mjs` | `ccd64868f4c8bb70d50d67a6651de1b0` | `qa/` |
| `github/qa/t31_disclosure_parity.mjs` | `a80a7731e5d646603c6e2ae173cdc774` | `qa/` |
| `github/qa/t32_ladder_dividend.mjs` | `72ec6b5f10cf9f71b27d9e32c4254b87` | `qa/` |
| `github/qa/t33_roth_stream_fica.mjs` | `a91e954bc06f7cf533019af2583e2b45` | `qa/` |
| `github/qa/t34_income_conditioning.mjs` | `01ebd656197dcd5377f3d154630b0070` | `qa/` — gating + the six NM assertions |
| `github/qa/t35_state_populate.mjs` | `a0ebdf0097240daf7d3becb8724f970d` | `qa/` — gating + **D-7a** |
| This stop report | — | **`docs/` AND the pool, with a manifest description row.** It hands over live work; that is `STOP-REPORT-v5_63-fica-workbench.md`'s shape. **No md5 row** (D-3 excludes this class). Rotates to repo-only when v5.66 ships |

⚠ **THE SUITE FILES ARE THE POINT OF THIS ZIP.** The v5.63 stop cut a correct handover, committed the
documents, and left the modified code out of both destinations: *"the suite's `v563` version-gate
extensions across sixteen files and the new `dom_entry_v563.jsx` survived nowhere"* — work that had
to be redone from scratch, trap included. **This is the same shape at eighteen files.** Commit them.

⚠ **Committing them is SAFE and was checked, not assumed:** the v566 branches are dormant until a
v566 leg exists, and `t34`/`t35` were run on the **v5.65 leg** after the edits — **62 and 92, both
green.** The registration edits are additive.

## 6 · Where to resume

Read this file, then §3 in order. The premise is verified, the source is written, the suite is
registered and the controls fire. **What remains is a dollar-exact test, the documents, the artifact,
and the packaging — plus the selector scope D-NM-1 (c) still owes.**
