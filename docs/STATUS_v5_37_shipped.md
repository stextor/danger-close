# STATUS — v5.37 SHIPPED, 2026-08-16

**Release:** v5.37 · source `src/DangerClose.jsx` md5 **`ff4dddcb585e2237e6c6a2643ded2ebb`** ·
built `index.html` md5 **`50faed9fe934ddeb628b59d00ddb4a3e`** · prior v5.36 `b7396c1c14861dc149b71e8edb1a00d5`
(built `c6d7474725d150a616a8ee8d389e8c72`, reproduced byte-identical this session as the §N scaffold proof).

**Totals, parsed from suite output:** current leg **600** (t1 94 · t2 18 · t3 36 · t4 210 · t5 58 ·
t6 21 · t10 163) · parity **9/9 strict** · feature **660** (t7 41 · t8 38 · t9 14 · t11 40 · t12 23 ·
t13 42 · t14 44 · t15 11 · t16 24 · t17 74 · t18 67 · t19 65 · t20 100 · t22 77) — **APP TOTAL 1269**.
Prior v5.36 leg replays at its shipped **600**. Tooling: t21 50 · DOM diff **29/29** (all three
tax-bearing tabs at strict identity) · smoke_built 16/16. **Thirteen negative controls, all firing**
(C1–C9, C12, and the new C13 in `qa/controls.sh`; C10/C11 re-verified against the identity-form DOM
witnesses — each fails exactly its one intended check).

---

## 1 · What happened, in order

1. **Freshness (§A/§A2), clone-alone.** Base reproduced exactly (1260, per-suite, parity 9/9,
   all ten script controls firing). Two pool-hygiene findings for the refresh: the pool's
   `domdiff_withdrawal.mjs` is the stale v533→v534 edition, and a third source
   (`DangerClose-v5_36-WIP.jsx`) violates the two-source rotation — both deleted at this refresh.
2. **Step 1 — simulator first, and it STOPPED the build.** An independent ledger (own IRS Pub 590-B
   divisors, own SECURE 2.0 start ages) reproduced the shipped v5.36 engine **to the cent in every
   year across nine households**, then projected Option A. Three premise contradictions surfaced,
   the third blocking: the ratified E-17 dob values (1962/1964) put the E2 household outside the
   full-exhaustion regime and **both exact gates fail on the unchanged v5.36 engine** there.
   Reported with measurements (`docs/STOP-REPORT-v5_37-session1-E17-regime.md`); **Steve chose
   option (b)** — the fixture declares the household it runs.
3. **Step 2 — fixtures, with proof.** t20 and t7 dobs → the strings their runs resolve to
   (`"1964-01-01"`/`"1966-01-01"`). Proof harness built FROM t20 verbatim: all 8 households × all
   5 engines **value-identical under canonical JSON** in both dob shapes; the sole raw-byte delta
   anywhere is dob key order inside the `_tlW` debug echo ({month,day,year} from the master-prompt
   parse vs {year,month,day} from `_ymd`) — recorded precisely rather than claimed as byte-identity.
   t7 stdout byte-identical. E-17 closed in `docs/ARCHITECTUREIssues.md`; OPERATIONS §C2 updated
   with the standing regime-bound warning.
4. **Step 3 — the engine edit, gate-verified.** One line after the `taxGainPool` growth:
   `taxOrd = Math.min(taxable - taxGainPool, taxOrd * (1 + growth.tax))`. Four version sites
   bumped. The edited engine matched the pre-edit simulator **to six decimals**: annuity−taxable
   ordinary excess 724,266.004427 (projected 724,266.004427), trad−annuity 0.000000, every gain,
   RMD and draw series unchanged. t20's exact pin moved $600,000 → **$724,266** with a new E-15
   extinction (the excess must EXCEED the opening balance); t19 gained exact pins (mixed-household
   lifetime MAGI **$3,162,820**, was $3,132,746; gain **$89,673** unchanged to the microdollar),
   an in-suite independent ledger that must reproduce the published balances to the cent before
   its report is trusted, and the §8-3 conservation report (one-sided invariant holds all years;
   the cap binds **zero** years).
5. **Step 4 — controls.** `controls.sh` re-pointed to v537; **C13 added** (growth line reverted →
   fingerprint moves, t19(1)+t20(2) fire). All eleven script controls fire; C10/C11 run against
   the new identity-form DOM witnesses each fail exactly one check with the missing gains visible
   in the diff.
6. **Step 5 — DOM diff re-point AND re-scope, and measurement inverted the stop report's own
   prediction.** The report said the Withdrawal tab "can move" (it renders `r.bracket`). Measured:
   lifetime MAGI rises **$3,333.04** on the example household (the wiring is live at the app's
   call path) but never crosses a bracket edge — no rendered cell moves anywhere. All three tabs
   at **strict identity** (29 checks); the divergence witness lives at the engine level per E-20.
   The identity form remains control-compatible (verified, not asserted).
7. **Step 6 — docs.** METHODOLOGY: limitation (b) inverted + a v5.37 ordinary-growth section
   (no locks on the old wording — swept). CHANGELOG entry with per-suite counts, the E-17
   ride-along, and **one correction to the v5.36 entry**: its feature total printed 648 where its
   own per-suite numbers sum to 651 (an arithmetic slip in the document, owned rather than
   silently fixed). TESTING and VERIFY.sh rolled (VERIFY's trailer rewritten for the identity
   form and C13). E-15 closed in ARCHITECTUREIssues with the measured blast radius (smaller than
   the entry predicted — IRMAA/ACA were NOT dragged; recorded). `runsuite.sh` default pair rolled.
   Per the scope's disclosure list, no in-app copy changed — which also keeps the measured DOM
   identity true.
8. **Step 7 — build (§N).** v5.36 rebuilt from its own source **byte-identical**
   (`c6d7474…`, the scaffold proof), then v5.37 built with the identical toolchain
   (`50faed9f…`); smoke_built 16/16.

## 2 · Decisions, with who made them

| Decision | Made by | Outcome |
|---|---|---|
| Option A · fixtures-first · ordered caps · growth.tax (scope §8) | **Steve**, 2026-08-16, pre-build | shipped as ratified |
| E-17 stop: option (b) — the fixture declares the household it runs | **Steve**, 2026-08-16, mid-build | dob strings 1964-01-01/1966-01-01; measured value-identical; regime rationale in the fixture |
| §8-1 Option-B fallback | not triggered | cap binds zero years; simulator/engine agree to six decimals |
| No in-app disclosure copy | per the scope's §5 disclosure list | METHODOLOGY + CHANGELOG carry it; DOM identity stays true |

## 3 · Carry-forward

- **v5.38 candidate (standing):** the ACA-premium sale's gain reaches MAGI but is untaxed —
  Engine A, needs a parity-witnessed release (§7.5).
- **S-8** `rothGainPct` initialisation — separate surface.
- **t20 E2's exacts are REGIME-BOUND** (full pool exhaustion) — documented in the fixture and
  OPERATIONS §C2; re-derive on any dob/balance change, never carry.
- **E-14/E-18:** packaging emits `MANIFEST.txt`; this document carries the hash table below.
- Repo hygiene shipped: the stray duplicate `qa/t4_dom.mjs` is removed (`git rm` — it was
  content-identical to `qa/qa-baseline/t4_dom.mjs`, md5 `6056840ef19e25d4f29ffe79db009ad8`).
  Note: `docs/FIXUP-v5_36-suite-commit.md` lists this same deletion as executed in the fixup
  commit; measured at this release's freshness check, **both paths still exist at HEAD** — the
  documented action never landed. The deletion happens now, and the discrepancy is recorded here
  rather than by editing the fixup record.
- Pool refresh deletions (executed with this refresh): the stale `domdiff_withdrawal.mjs`
  (dc48d0c2…), `DangerClose-v5_36-WIP.jsx` (c5d9253c…), and `DangerClose-v5_35.jsx` (rotates out
  under the two-source rule).
- **Suggested cleanup for Steve, not executed:** superseded STATUS files predating v5.36 still in
  the pool (`STATUS_release_a.md`, `STATUS_v5_23_engineD_hoist.md`,
  `STATUS_CAPGAINS_PARTIAL_for_v5_33.md`, `STATUS_v5_34_ship_candidate.md`,
  `STATUS_v5_36_partial.md`) — durable copies live in the repo's `docs/`. Your call.

## 4 · The hash table (E-18): every file this session changed or created

| File (pool name) | Repo path | md5 |
|---|---|---|
| `DangerClose-v5_37.jsx` | `src/DangerClose.jsx` | `ff4dddcb585e2237e6c6a2643ded2ebb` |
| — built artifact | `index.html` | `50faed9fe934ddeb628b59d00ddb4a3e` |
| `t7_accrual.mjs` | `qa/t7_accrual.mjs` | `fd0ab4282e31d8a7e170606c877c28d0` |
| `t19_engineD_exact.mjs` | `qa/t19_engineD_exact.mjs` | `256ff3681548966735569c5034164dac` |
| `t20_other_taxtype.mjs` | `qa/t20_other_taxtype.mjs` | `9640ce1e4006c7ba6b30a29639ef428b` |
| `domdiff_withdrawal.mjs` | `qa/domdiff_withdrawal.mjs` | `faaea61bea1ec51794dd7a5ebb825d13` |
| `controls.sh` | `qa/controls.sh` | `1f672b64eac7b028d8331a94a80376f6` |
| `runsuite.sh` | `qa/runsuite.sh` | `b4996bf35625ceae916df913a3987856` |
| `t1_units.mjs` | `qa/qa-baseline/t1_units.mjs` | `69e8718765bca64c9d3ce1d62fa3fad2` |
| `t3_roth.mjs` | `qa/qa-baseline/t3_roth.mjs` | `340d8fc45e5b0504cc880d9080e6eff0` |
| `t4_dom.mjs` | `qa/qa-baseline/t4_dom.mjs` | `1af2854a17631f51ef71be43c1bc8c41` |
| `t5_storage.mjs` | `qa/qa-baseline/t5_storage.mjs` | `7f22335253c5bdd8d63a97b5c5081d63` |
| `t6_single.mjs` | `qa/qa-baseline/t6_single.mjs` | `5351b78b65ad279e02464bf2611d9950` |
| `dom_entry_v537.jsx` **NEW** | `qa/qa-baseline/dom_entry_v537.jsx` | `87a1324d67ed44f4215601018cda92eb` |
| `CHANGELOG.md` | `CHANGELOG.md` | `a2ac5bc5024ebe005a0be78b8cb68ced` |
| `METHODOLOGY.md` | `METHODOLOGY.md` | `76f00f6deba290848092f48dd4bb8771` |
| `TESTING.md` | `TESTING.md` | `4ad34a9183dcb2e714ceca2a4aaa26a7` |
| `VERIFY.sh` | `VERIFY.sh` | `6cd8e6a08b00e048f178a14ae703d65c` |
| `ARCHITECTUREIssues.md` | `docs/ARCHITECTUREIssues.md` | `3380f700666e46bd22c3a0cf907c754c` |
| `OPERATIONS.md` | `docs/OPERATIONS.md` | `fd78849f22ead21a68820a9577bbae2f` |
| `SCOPE_v5_37_ordinary_growth.md` | `docs/SCOPE_v5_37_ordinary_growth.md` | `60304fa40e7a344e03ef264e82203f1a` |
| `STOP-REPORT-v5_37-session1-E17-regime.md` | `docs/STOP-REPORT-v5_37-session1-E17-regime.md` | `0c6bcf1293d33078219938c39bcdf769` |
| `PROJECT_KNOWLEDGE_INDEX.md` | `PROJECT_KNOWLEDGE_INDEX.md` | (in `MANIFEST.txt` — finalized at packaging) |
| `STATUS_v5_37_shipped.md` (this file) | `docs/STATUS_v5_37_shipped.md` | (in `MANIFEST.txt`) |
| `README-FIRST.md` (v5.37 edition) | package root | (in `MANIFEST.txt`) |

Session instruments, delivered for the record but NOT shipped in the repo: `sim_v537_probe.mjs`
(the independent simulator, `87f2a8f1…` as delivered with the stop report) and the two
t20-derived proof harnesses (disposable; their method and results are recorded in the fixture
comment and E-17's closure).

Intermediate working-source hashes: `b7396c1c…` (v5.36, the session's starting point and the only
state until step 3) → **`ff4dddcb…` (shipped)** — one edit stage; the engine line and the four
version sites landed together.

## 5 · Honesty notes

Every figure above was parsed from suite, simulator, census, or `md5sum` output. Three scope
premises were falsified by measurement and recorded rather than adapted around: the t19 gains
figures do NOT move (scope §5 said they would — the census showed why), the Taxes/IRMAA tabs do
NOT move through the call sites (same census), and decision 2's literal dob values were
incompatible with gates 2–3 (the mid-build stop; Steve decided). The stop report's own prediction
that the Withdrawal tab "can move" was then itself inverted by the step-5 measurement — no
rendered cell moves on the example household — and that correction is recorded in the DOM diff's
header. One session interruption (a sandbox outage mid-edit) cost nothing but time: the workspace
survived, and the one in-flight edit (t19's `planFor` recipe) was completed and verified after
recovery. **One phantom-edit incident — the third on record** (project cautions list two): at the
manifest step, the working copy of `PROJECT_KNOWLEDGE_INDEX.md` was found to contain a fully
formed "Retired at the v5.37 refresh" block that no recorded action in the session wrote — it
implemented a change that had been *proposed but not applied*, was accurate down to hashes
measured this session, and contained one claim the deliverables do not support. Handled per the
standing protocol: the diff was quarantined, the file reverted to repo HEAD, every intended edit
re-applied deliberately, and the complete resulting diff reviewed line-by-line before acceptance
(the re-application also fixed two mis-targeted rows from this session's own first patch, caught
by the same review). Every OTHER deliverable was then audited against HEAD hunk-by-hunk — the
source diff is exactly the four recorded edits, and all 21 other files trace every added line to
a recorded action. The quarantined diff ships with the session deliverables as evidence. The v5.36 CHANGELOG's feature-total slip (648 vs the correct 651) is corrected by note
in the v5.37 entry, not silently.
