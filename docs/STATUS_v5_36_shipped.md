# STATUS — v5.36 SHIPPED, 2026-08-16 (session 2)

**Release:** v5.36 · source `src/DangerClose.jsx` md5 **`b7396c1c14861dc149b71e8edb1a00d5`** ·
built `index.html` md5 **`c6d7474725d150a616a8ee8d389e8c72`** · prior v5.35 `a28843d3e1f441e90c765419264954ff`
(built `2361b2ac3fe739d50526fd954b80fb63`, reproduced byte-identical this session as the §N scaffold proof).

**Totals, parsed from suite output:** current leg **600** (t1 94 · t2 18 · t3 36 · t4 210 · t5 58 ·
t6 21 · t10 163) · parity **9/9 strict** · feature **651** (t7 41 · t8 38 · t9 14 · t11 40 · t12 23 ·
t13 42 · t14 44 · t15 11 · t16 24 · t17 74 · t18 67 · t19 57 · t20 99 · t22 77) — **APP TOTAL 1260**.
Prior leg replays at **588** (its published figure was 587; t4 gained one PRIOR-LEG assertion at
v5.36 pinning the copy that build is true to). Tooling: t21 50 · DOM diff **26/26** · smoke_built
16/16. **Twelve negative controls, all firing** (C1–C9, C12 in `qa/controls.sh`; C10/C11 at the
DOM-witness layer).

---

## 1 · What happened, in order

1. **STOP at the freshness check.** Six of the seven suite files the session brief said carried
   session-1 edits were byte-identical to repo HEAD; the session-1 versions existed nowhere in the
   pool under any name. Fourth recorded pool-drift block. Recovered by the maintainer from his
   archive; verified by reproducing the documented base **exactly** (1219, per-suite). Full evidence:
   `STOP-REPORT-v5_36-session2-pool-drift.md`. Process fix adopted: **this document's §4 hash table.**
2. **Item 1 — Engine B/C consumption, shape (b).** Both engines take a defaulted `gainByYr`
   (`_gainByYr` / `_gainByYrI`); Engine B's hardcoded zero is gone; Engine C's MAGI carries
   `capGain_y`; both call sites build the map from the SELECTED scenario's Engine D schedule. t19's
   two extinction scans inverted in the same release (+1 C-binding); new hand-exact consumption
   blocks in t18 (+14 then) and t17 (+11).
3. **Item 2 — the §9 copy pass.** Label fixed to "% of brokerage money" (the pool excludes
   ordinary-taxed and HSA balances — engine: `_gainPoolInit = _taxInit − _taxOrdInit − _hsaInit`);
   panel copy inverted to in-use with the share-0 disclosure ("if your numbers moved at v5.36, that
   is why"); Taxes footer re-sourced; three-levers card gained the outside-input line; two DOCS_HTML
   edits under §C0. Every falsified lock inverted, gated per leg. **Wording approved by the
   maintainer 2026-08-16.**
4. **Item 3 — DOM diff re-point AND re-scope, and it inverted the brief's premise.** Measured: the
   Withdrawal tab is BYTE-IDENTICAL across the pair (the tracker is bookkeeping; no displayed dollar
   moves), so that section returned to strict identity. Taxes/IRMAA sections added as the ONLY
   witness of the call-site wiring, anchored to figures-only regions after the naive whole-tab form
   failed its own control (E-20). 26 checks.
5. **E-16 found, pinned, then FIXED IN-RELEASE on the maintainer's decision.** Engine B's provisional
   income omitted realized gains (IRC §86 includes them) — dormant at hardcoded $0, live with the
   wiring. First pinned as a dated disclosed limitation; when the maintainer chose fix-now, `qdcg_y`
   was fed into `taxableSSPortion`, the pin FLIPPED to five exact assertions (the 85% §86(a)(2) cap,
   COLA-robust, from the row's own `ssTotal`; MAGI +gain+Δss exactly), the short-lived omission copy
   was corrected on both surfaces in the same session that wrote it, and control **C12** reverts the
   term and fires t18(3) with a fingerprint moving only the SS-phase-in probe households.
6. **Engine D measured for the same omission: not affected** — flat 85% maximum taxability, the
   conservative simplification; no provisional-income test exists there. The measurement caught a
   stale D comment ("gains are ignored here," one line above the code carrying them — the E-3 class);
   fixed, full suite rerun, and the built artifact is byte-identical because the build strips comments.
7. **Item 4 — docs, build, package.** METHODOLOGY §"Capital gains in the drawdown (v5.36)";
   CHANGELOG entry with per-suite counts and provenance; TESTING rolled; VERIFY.sh rolled to the
   v535→v536 pair (its trailer was found blended across two releases and rewritten); six
   ARCHITECTUREIssues entries **E-15…E-20** (E-16 closed in place); manifest refreshed including the
   dom_entry row that never rolled at v5.35; `controls.sh` + `runsuite.sh` adopted into `qa/`;
   `docs/` created in the repo carrying the previously pool-only record (maintainer's decision 4).

## 2 · Decisions, with who made them

| Decision | Made by | Outcome |
|---|---|---|
| Banked surplus joins the gains-bearing pool at full basis | session 1, **ratified by Steve** 2026-08-16 | in code; disclosed in METHODOLOGY |
| Copy-pass wording | drafted in session; **approved by Steve** | shipped as approved (incl. the E-16-fixed footer clause) |
| Adopt `controls.sh` / `runsuite.sh` into the repo | **Steve** | shipped in `qa/`, self-contained |
| Commit pool-only docs to the repo | **Steve** | `docs/` ships with this release |
| E-16: fix now vs own release | recommended own-release; **Steve chose fix-now** | fixed, pinned, controlled (C12), copy corrected |

## 3 · Carry-forward (unchanged unless noted)

- **E-15** ordinary-growth omission (`taxOrd` never grows; t20's exact-$600,000 invariant pins it) —
  optimistic, its own release.
- **v5.37**: the ACA-premium sale's gain reaches MAGI but is untaxed — Engine A, needs a release
  where parity can witness it (§7.5).
- **S-8** `rothGainPct` initialisation — separate surface.
- **E-14/E-18 follow-through**: packaging now emits `MANIFEST.txt` (every zip file's md5), and this
  document carries the session hash table below. Keep both at every release.
- The dead-suite and homogeneous-fixture lessons are codified in `controls.sh`/`runsuite.sh` and
  recorded as E-19/E-20 — no longer session lore.

## 4 · The hash table (E-18 executed): every file this session changed or created

| File (pool name) | Repo path | md5 |
|---|---|---|
| `DangerClose-v5_36.jsx` | `src/DangerClose.jsx` | `b7396c1c14861dc149b71e8edb1a00d5` |
| — built artifact | `index.html` | `c6d7474725d150a616a8ee8d389e8c72` |
| `t4_dom.mjs` | `qa/qa-baseline/t4_dom.mjs` | `6056840ef19e25d4f29ffe79db009ad8` |
| `t17_engineC_exact.mjs` | `qa/t17_engineC_exact.mjs` | `5eef71d2385058d847cc53018a3fae67` |
| `t18_engineB_exact.mjs` | `qa/t18_engineB_exact.mjs` | `7272f97181e0764204eef087f3810380` |
| `t19_engineD_exact.mjs` | `qa/t19_engineD_exact.mjs` | `d58f232182e52a98e057df0a42819bbb` |
| `domdiff_withdrawal.mjs` | `qa/domdiff_withdrawal.mjs` | `184b826b9a2ce2449299a72fced96a36` |
| `controls.sh` **NEW** | `qa/controls.sh` | `3d3816461cf9436ba3a6ae3c404bc3d9` |
| `runsuite.sh` **NEW** | `qa/runsuite.sh` | `dbb662095d6268e17e86c4ab965646b3` |
| `CHANGELOG.md` | `CHANGELOG.md` | `df95e9162e64d5f57bcb184941a61d1c` |
| `METHODOLOGY.md` | `METHODOLOGY.md` | `886ea749d1883928ba75c1a6a45c7a86` |
| `TESTING.md` | `TESTING.md` | `414d2880458f2ca341488032830a3713` |
| `VERIFY.sh` | `VERIFY.sh` | `44563a9c438f0ab9bc72b00ca68592a3` |
| `ARCHITECTUREIssues.md` | `docs/ARCHITECTUREIssues.md` | `6c8a0754799bc75f578b533e49e31a24` |
| `PROJECT_KNOWLEDGE_INDEX.md` | `PROJECT_KNOWLEDGE_INDEX.md` | (in `MANIFEST.txt` — finalized at packaging) |
| `STATUS_v5_36_shipped.md` (this file) | `docs/STATUS_v5_36_shipped.md` | (in `MANIFEST.txt`) |
| `STOP-REPORT-v5_36-session2-pool-drift.md` | `docs/STOP-REPORT-v5_36-session2-pool-drift.md` | (in `MANIFEST.txt`) |
| `README-FIRST.md` (v5.36 edition) | package root | (in `MANIFEST.txt`) |

Session-1 files verified UNCHANGED by session 2 and shipping at their session-1 hashes: `t1_units.mjs`
`1fb0caf8…` · `t3_roth.mjs` `6fd3d14f…` · `t5_storage.mjs` `29d7f809…` · `t6_single.mjs` `d3b49873…` ·
`t20_other_taxtype.mjs` `bfa3227e…` · `dom_entry_v535.jsx` `74992ed2…` · `dom_entry_v536.jsx` `c387ed8b…`.

Intermediate working-source hashes, for reading the session records: `c5d9253c…` (session-1 WIP, the
session-2 starting point) → `06237271…` (post-wiring) → `9a97926…` (post-copy-pass) → `62a23aa9…` /
`279db93a…` (E-16 fix stages) → **`b7396c1c…` (shipped)**.

## 5 · Honesty notes

Every figure above was parsed from suite output or `md5sum`, never restated from memory. The brief's
premise for item 3 ("this release moves the schedule again") was contradicted by measurement and the
work followed the measurement; the brief's premise for the pool ("everything you need is in project
knowledge — verified") was contradicted by measurement and the session stopped. Three of this
session's own instruments failed before any code did (E-19) and one of its own witness checks was
caught measuring the wrong thing by its own control (E-20); both are recorded because the next
session will build on these tools.
