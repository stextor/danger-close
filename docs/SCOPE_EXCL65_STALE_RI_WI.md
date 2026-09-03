# SCOPE — Rhode Island and Wisconsin `excl65` carry superseded amounts (v5.59)

| Field | Value |
|---|---|
| Status | ✅ **SHIPPED at v5.59, 2026-09-02.** Build record in §8. RETIRED as an active scope — kept as the release's build record, per `SCOPE_VA_NOTE_CORRECTION.md`'s pattern. One expectation in §5(d) was impossible by construction and is corrected in §8, not silently |
| Written against | **v5.58** · source `6690b2c78953a7a4a1cee413d3523b59` · tree `3d7c205` |
| Target | **v5.59** · tag `v559` |
| Parent finding | `AUDIT_STATE_EXCL65_ROUND4.md` §2b, §2c, §4, §6 |
| Direction | **CONSERVATIVE**, both figures, for every household that qualifies under the statute. One direction, one CHANGELOG entry — D-3's per-direction rule is honoured, not strained |
| Shape | Two `STATE_RULES` figures move toward the statute; two notes rewritten; suite coverage built from nothing; METHODOLOGY, CHANGELOG, TESTING, MissingFeatures updated; version bump |

---

## 1 · Why

`STATE_RULES.RI.excl65` is **20000** — the TY2023–TY2024 figure. RIGL § 44-30-12(c)(9), as amended by
P.L. 2024 ch. 117 art. 6 § 21, made it **$50,000 per qualifying individual for tax years beginning
on or after 1 January 2025.**

`STATE_RULES.WI.excl65` is **5000** — the older, income-tested provision. Wis. Stat. § 71.05(6)(b)54m.,
created by 2025 Wis. Act 15, gives **$24,000 at 67+** ($48,000 joint where both are 67+) **with no
income limit.**

Both are the same defect: a real provision carried at a superseded amount, with a statutory age floor
of 67 that the model puts at 65. Both errors run conservative for qualifying households — the model
grants less relief than the statute allows. ROUND4 §4 quantifies it: **+$2,020/yr** for a qualifying
RI couple, **+$2,014/yr** for a qualifying WI couple, at the model's own rates.

## 2 · Premise — verified against source, not assumed

Read by AST from the shipped v5.58 `src/DangerClose.jsx` on 2026-09-02:

| | line | `rate` | `ss` | `excl65` | `exclAge` | note |
|---|---|---|---|---|---|---|
| RI | 1068 | 0.05 | 0.5 | 20000 | absent → 65 | `SS + $20K pension/401k exclusions income-limited` |
| WI | 1078 | 0.053 | 0 | 5000 | absent → 65 | `$5K retirement exclusion (income-limited)` |

`stateTaxAnnual` (L1114–1160) applies `excl65` per person at or above `exclAge ?? 65` against
`retIncome + pen`, unconditionally on income. Only DE (60) and KY (0) carry an explicit `exclAge`.

**The premise is falsified if any of these is no longer true at build time**: the two figures, the
absence of `exclAge` for either state, the two note strings, or the L1144–1159 application rule.
**If it is, STOP and report** — do not adapt silently.

## 3 · Site census — what the change touches

**App source (2 figures, 2 notes, 4 version sites).**
- `STATE_RULES.RI.excl65` 20000 → **50000**
- `STATE_RULES.WI.excl65` 5000 → **24000**
- `STATE_RULES.RI.note` → rewritten (§6)
- `STATE_RULES.WI.note` → rewritten (§6)
- Version: footer, DATA LOAD header, Field Manual callsign, Field Manual footer

**Suite — existing sites that constrain the notes** (all executed/read 2026-09-02, none names RI or WI):
- `t29` L212 F-6: `excl65 > 0 && /income[- ]limited|income limit/i` → asserts `length > 0`.
  **Set at v5.58 = 5 (NJ, NM, RI, VA, WI)**, by executing `f6_probe.cjs`.
- `t10` L467: every `excl65 > 0` state's note matches `/\$\d/`.
- `t10` L488: every `ss > 0` state's note matches `/social security|\bss\b/i`. **Live for RI, not WI.**
- `t31` C-0 (L240): every declared key appears in `METHODOLOGY.md` on every leg. **Ungated.**

**Suite — sites that name RI or WI:** **none.** AST walk over every `Literal`, `TemplateElement`,
regex and member access across all 32 `t*.mjs` returned zero on 2026-09-02. Coverage is built from
nothing (§5).

**Fixtures domiciled in RI or WI:** **none** — same walk. This is why MC parity is expected to hold
10/10 despite a figure change; **confirm at build time before trusting a green parity.**

**Documents.**
- `METHODOLOGY.md` — L128 names NM and RI among the eight partial-SS states (unchanged); L152 names
  *(NJ, VA, RI approximated as unconditional …)*; **Wisconsin appears nowhere**. Search by code, not name.
- `CHANGELOG.md`, `TESTING.md`, `MissingFeatures.md`, `PROJECT_KNOWLEDGE_INDEX.md` — §7 of the brief.

**Version-bump cost:** re-derive with `vercensus.cjs v559`. Not run for this scope; at v5.58 it was
15 / 16 / 62 with `t4` holding 21.

## 4 · Explicitly OUT of scope

- **`exclAge` for RI or WI** (67). A gate change alongside a figure change cannot be attributed if
  something moves; and RI's gate interacts with the cliff and the IRA distinction in ways ROUND4 did
  not measure. Recorded as remaining limitation, disclosed in both notes and in CHANGELOG.
- **New Mexico** — any figure, any note. Its own pass (ROUND4 §6 D-C).
- **The `ss: 0.5` blend** — an eight-state modelling question.
- **RI's AGI cliff, the IRA/employer-plan distinction, the TY2027 SS age-threshold removal** — all
  disclosed as unmodelled, none modelled.
- **Any `t29` change to F-6's assertion** (e.g. asserting an exact count). The set shrinks 5→4 by
  note wording alone; the assertion stays `length > 0`.
- **`SCOPE_HOUSEKEEPING_THREE.md`** — except the one stale `package_check.mjs` manifest row, which
  rides along because the manifest is touched anyway.
- Retiring any pool document (decided 2026-09-02).

## 5 · Tests this ships with

**(a) `t10` §2E — two new exact assertions**, one per state, on a hand-built household:
- RI couple, both 68, `retIncome` 80,000, taxable SS 40,800, no pension → assert `stateTaxAnnual`
  base equals `max(0, 80000 − 2×50000) + 0.5×40800 = 20,400` → tax `1,020.00` at `rate` 0.05.
  Hand-verified to the dollar before the assertion is written; the figure must come from
  independent arithmetic, not from running the engine and copying.
- WI couple, both 68, `retIncome` 60,000, taxable SS 40,800 → base `max(0, 60000 − 2×24000) = 12,000`
  → tax `636.00` at 0.053. (`ss` 0.)
- **Each assertion must FAIL with the v5.58 figure restored** — that is the whole point.

**(b) `t31` — two new keys**, `since: "v559"`, no `until`:
- RI: candidate `$50,000` · WI: candidate `$24,000`.
- **Probe each with `f6_probe.cjs`** against (i) figure-only revert, (ii) note-only revert,
  (iii) both. A key is accepted only if (i) fails it. Keying on the subject (`income-limited`,
  `retirement exclusion`) is vacuous — those strings pre-date the fix.
- `ORDER` gains `v559` (appended — it ends in `v558` at L253). Both keys must be in `METHODOLOGY.md`
  verbatim on **both** legs or C-0 fails.

**(c) F-6 re-executed** on the final wording: expect **4** (NJ, NM, RI, VA). WI's note must not
contain `income limit` in any form (§6). Record the deliberate shrink in CHANGELOG.

**(d) `controls_v559.sh`** — §B2 negative controls, each reverting ONE property in a scratch copy:
1. RI figure → 20000 · expect `t10` (a) and `t31` RI key to fail
2. WI figure → 5000 · expect `t10` (a) and `t31` WI key to fail
3. RI note → v5.58 string · expect `t31` RI key to fail (and `t10` L488 if SS wording lost)
4. WI note → v5.58 string · expect `t31` WI key to fail and F-6 to report 5
5. Version string → v5.58 at one site · expect `t1` STATIC to fail

**Read every failure.** A control failing for its own reasons is not coverage.

**(e) MC parity 10/10** and **domdiff** — expected unchanged (§3). If either moves, that is a finding
to explain, not to suppress: check whether a fixture is in RI or WI before doing anything else.

## 6 · The notes — constraints, then wording to test

**RI** must: name a `$` figure (`t10` L467); say what the model does with SS (`t10` L488, `ss: 0.5`);
keep `income-limited` (F-6 — the cliff IS an income limit); disclose the unmodelled conditions.
Candidate: `SS taxed at half; $50K pension/401k exclusion each, applied from 65 without the
statute's income limit, full-retirement-age floor or IRA exclusion`

**WI** must: name a `$` figure; **avoid `income limit`/`income-limited` entirely** (§5c); disclose the
age floor. Candidate: `$24K retirement exclusion each, not income-tested; statute requires 67, model
applies from 65`

Both candidates are starting points. **Execute the three matchers against the final strings; do not
grep for them.**

## 7 · Decisions — resolved 2026-09-02, per ROUND4 §6

| | Decision | Resolution |
|---|---|---|
| D-A | Class membership | Optimistic income-limited class = **NJ + VA**. NM/RI/WI form a new gate-shaped group → **`MissingFeatures.md` D-11**, citing ROUND4 |
| D-B | Wisconsin | **Ships with RI**, same defect class, same direction |
| D-C | New Mexico | **Not in this release.** Own pass, disclosure-first |
| D-D | What moves | **Amounts only.** No `exclAge` |
| D-E | Dollar-exact | RI **$50,000 yes**; AGI threshold **dated to TY2025** ($133,500 / $107,000) — ⚠ **the MFJ figure is wrong; corrected to $133,750 at v5.61** (2026-09-03), see `AUDIT_STATE_INCOME_BASES_ROUND5.md` §2e wherever stated; **no** dollar-exact for the $100,000 couple cap (department-load-bearing) |
| D-F | F-6 set | **WI leaves the set** by note wording (5→4); `t29` assertion untouched; shrink recorded |

## 8 · Build record — filled by the building session

| | |
|---|---|
| Build date | 2026-09-02 |
| Source md5 (v5.59) | `ed89d2f214302942e5bd6355d923c9cf` |
| Built `index.html` md5 | `c6ac96552dbc598e4812f4229ba425ad` (smoke_built 16/16; §N3 1–4 pass) |
| Repo commit | built against tree `2e6336a`; the ship commit is Steve's — record it here after push |
| vercensus (files / ladders / gated) | **15 / 17 / 63** from v558 (80 judgement points; 78 rolled, 2 belong to the v5.58 key) |
| Suite total (per-suite in CHANGELOG) | **2,883 app, 0 failing** · v5.59 leg 1,105 · v5.58 leg 1,098 · run-once 670 · tooling 82 · GRAND 2,965 |
| Parity | 10/10 — expected and blind: zero RI/WI fixtures (AST walk re-run this session) |
| F-6 set after | **4** — NJ, NM, RI, VA (`f6_probe.cjs` executed on the final wording) |
| `t31` keys accepted (and which revert each failed on) | **Not the §5(b) candidates.** `$24,000` is VACUOUS on v5.58 (1 app hit, 5 docs hits); `$50,000` is clean on user surfaces but already in METHODOLOGY (VA). Shipped: `$50,000 pension/401k exclusion` (fails on C3, RI note reverted) and `$24,000 retirement-income exclusion` (fails on C4, WI note reverted). 0 hits on v5.58 across app, docs, METHODOLOGY. ⚠ §5(b)(i) — "accepted only if the FIGURE-only revert fails it" — cannot be satisfied by any prose key; the constant is `t10`'s (identity + hand case). |
| Controls run, each failure read | `qa/controls_v559.sh`: C0 null (fires nothing) · C1 RI 20000: t10 2 · C2 WI 5000: t10 2 · C3 RI note: t10 3 + t31 1 · C4 WI note: t10 3 + t31 1 · C5 RI clause dropped: t10 2 · C6 WI "no income limit": t10 1 · C7 footer: t1 1. ⚠ C4's first edition patched COLORADO (shared `excl65: 24000` anchor) and reported 1 wrong failure — re-anchored on the state entry. §5(d) control 1's expectation that t31 fails on a constant revert was wrong (see row above). |
| Premise re-verified at §A2 (Y/N, any drift) | **Y** — every §2 fact reproduced by AST/read against `2e6336a`; no drift. Freshness: 108/110 pool files byte-identical; `COMMIT_MESSAGE.txt` (v5.49 leftover, on the delete-first list since v5.52) is the one unexpected pool-only file |
| `package_check` H/J post-upload | pending Steve's upload — H and J fail by construction before it; re-run after |

---

**Destination: repo `docs/SCOPE_EXCL65_STALE_RI_WI.md` AND the knowledge pool**, active scope per
`OPERATIONS.md` §G. Add a manifest row. On shipping, status → SHIPPED and §8 filled; it then follows
`SCOPE_VA_NOTE_CORRECTION.md`'s pattern as the release's build record.
