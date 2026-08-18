# STATUS — v5.38 build, session 2 (2026-08-17): SHIP CANDIDATE — suite green, build verified

**Candidate:** `src/DangerClose.jsx` md5 `b8d12481b55cd2ed05c6c6f14e2f41d9` (unchanged from
session 1 — every session-2 edit was harness/docs) · **built** `index.html` md5
`d547810a4e2c4beb97008481d7bbbfef`, single-file, `smoke_built` 16/16, built from a staging tree
hash-verified against the exported candidate (see §3 for why that check now compares against the
pinned hash, not just internal consistency). **Package:** `danger-close-v5_38-ship.zip`
(`1e09accd…`), repo-update layout.

## 1 · Verification, final (all figures parsed from suite output this session)

Full `runsuite.sh v537 v538` on the restored candidate: **GRAND 1954 / 0** — current leg **600**
(t1 94 · t2 18 · t3 36 · t4 210 · t5 58 · t6 21 · t10 163), prior v5.37 leg replays at its
shipped **600**, **parity 9/9** (`rothAca` moved as declared; `roth`, `rothCurrentEstate`, and
the three MC fingerprints byte-identical), feature **666** (t7 41 · t8 38 · t9 14 · t11 40 ·
t12 23 · t13 42 · t14 44 · t15 11 · t16 24 · t17 74 · t18 67 · t19 65 · t20 100 · **t22 83**),
tooling t21 50 · domdiff 29. **APP TOTAL 1275** (house convention: current + parity + feature).
Derivation gate 31/31 on the restored workspace. Controls: **fifteen firing** (C1–C9, C12–C15).
DOM: all four tax-bearing tabs at strict identity, the Roth tab measured identical on the demo
household modulo unseeded MC noise.

## 2 · What session 2 added

t22 group F re-scoped at the gain-tax boundary (behavioral capability probe, v5.34 idiom) + new
**group I** carrying the derivation pins · controls re-pointed to v5.38 with **C14/C15** added ·
t1/t4/t5/t6 version chains registered (t9 needed none) · `dom_entry_v538.jsx` + both DOM bundles ·
Roth-tab cross-build measurement · METHODOLOGY inversion (+ the NIIT/state finding registered
in it) · CHANGELOG entry drafted in the ratified §8-4 shape (**Steve reviews wording**) ·
TESTING.md v5.38 header + entry · `index.html` built and smoked · this package.

## 3 · Findings this session (three, all instrument-level, all fixed)

1. **The controls file was blind after the re-point.** `mk_testable.sh` lost its execute bit in
   a pool round-trip; `rebuild()`'s `./`-invocation failed silently and every control tested the
   clean bundle — all thirteen priors read NOT CAUGHT. Fixed: `bash`-invocation (immune to
   stripped modes) plus a loud abort when rebuild fails. A stripped mode bit is now a known
   §B2 shape.
2. **Group I's first gate was circular.** Gating the pins on the tested behavior meant a build
   with the tax charge reverted classified itself as "pre-v5.38, skip" — C14 went dark. Re-gated
   on the `_acaGainTax` source marker (adjacent capability, the tracker-probe precedent).
3. **A control payload leaked into the build workspace — and the DOM diff caught it.** A
   compound verification command hit the execution-time kill mid-controls-run, leaving C8's
   payload (`capGains_y = 0`) in `v538.jsx`; the vite build and smoke then ran on the poisoned
   source, masked further by a mixed-React bundle crash. The **Taxes-identity check fired
   (28/1)** on the dead Engine B call site — the exact defect class C10/C11 exist for, verified
   live-fire. Recovery per the workspace-drift rule: restore from the hash-pinned export,
   regenerate every derived artifact, re-run gate (31/31), domdiff (29/0), smoke (16/16), and
   the full suite (1954/0). Lesson codified: **staging hash checks must compare against the
   pinned candidate hash, never just internal consistency** — the "1 unique hash" check passed
   on three identically-poisoned copies.

## 4 · Remaining before publish (Steve + one short session, or Steve alone)

1. **Steve reviews CHANGELOG wording** (`CHANGELOG_v5_38_entry_DRAFT.md`) and prepends it to
   `CHANGELOG.md`; drops the DRAFT header line.
2. **`domdiff_withdrawal.mjs` default pair** still reads v536→v537 — one-line re-point to
   v537→v538 for the repo copy (it was run with explicit args all session).
3. **Commit** the repo-update tree: `index.html`, `src/DangerClose.jsx`, the three docs, the
   suite files (qa-baseline six + t22 + controls + dom_entry_v538), `qa/tools/` (the five
   derivation instruments), `docs/` (scope, derivation, both STATUS files, this one). Manifest
   ships to both destinations (v5.31 rule).
4. **Knowledge refresh, delete-first:** new source/index/CHANGELOG/METHODOLOGY/TESTING into the
   pool; retire the now-committed v5.38-prep files (both scopes' rule) and delete their manifest
   rows in the same edit; `capture_gain_fp.mjs` retirement if taken; optional stale-STATUS
   cleanup; re-roll the manifest table from the shipped files; **closing hash sweep** (the habit
   this project has now earned three times over).
5. Optional but recommended: chmod sanity in the repo (`mk_testable.sh`, `runsuite.sh`,
   `controls.sh`, `VERIFY.sh` executable) so finding §3-1 cannot recur from a fresh clone.

## 5 · Package contents (`danger-close-v5_38-ship.zip`, repo-update layout)

`index.html` · `src/DangerClose.jsx` · `METHODOLOGY.md` · `TESTING.md` ·
`CHANGELOG_v5_38_entry_DRAFT.md` · `docs/{SCOPE_v5_38…, DERIVATION_v5_38_step1,
STATUS_v5_38_build_session1}.md` · `qa/qa-baseline/{t1,t2,t3,t4,t5,t6,dom_entry_v538}` ·
`qa/{t22_aca_floor.mjs, controls.sh}` · `qa/tools/{sim_ledger, validate, case1_detail, project,
gate_v538}.mjs`. This STATUS file rides outside the zip and belongs in `docs/` at commit.
