# STATUS — CAPITAL-GAINS PARTIAL, destined for v5.33 (ordinary drawdown realizes capital gains · addresses D-2)

> **This is NOT the v5.32 release.** v5.32 is the ACA 100% FPL floor, built from shipped v5.31 and
> using nothing in this folder. This document describes the capital-gains work, which was built and
> tagged as v5.32 before decision 1 reordered the releases, and which now renumbers to **v5.33**.
> If you are building the ACA floor, you need §0 of this file and nothing else.

---

## 0. DECISIONS RESOLVED 2026-08-13 — read before anything else

| | Decision | Resolution |
|---|---|---|
| **1** | ACA 100% FPL floor (proposed D-8) | **FIX FIRST** — its own release, ahead of capital gains |
| **2** | Migration notice | **YES** — figures move at the default under Option A; notice ships with the capital-gains release |
| **3** | Release shape | **KEEP WHOLE** — no splitting after Engine D; ship only when A, B, C and D agree |
| **4** | Verify-tab row for the new field | **NO ROW** — count stays 62 |
| **5** | Growth accrues gain at share 0 (§3) | **OPTION A — accept and disclose** |

### ⚠ Consequence: this partial renumbers to v5.33

The ACA floor release takes **v5.32**. This capital-gains work becomes **v5.33**. v5.32 was never
published, so the string is free to reassign — but the partial in this folder carries `v5.32` at
**4 in-app sites and 23 test-chain sites** and must be re-bumped to `v533`. Mechanical and low
risk; §4 below records every site. **Do this re-bump as part of the capital-gains release, not
before** — the ACA floor release should be built from shipped v5.31, not from this partial.

### Order of work

1. **ACA floor → v5.32.** Own scope, own suite, ships from v5.31. Nothing in this folder is used.
2. **Capital gains → v5.33.** Rebase this partial onto shipped v5.32, re-bump the tags, then
   continue at S-5/S-6/S-7 per §6. Add the migration notice (decision 2).

---

**⚠ THIS IS NOT A SHIPPABLE RELEASE. Do not publish, do not package as a release, do not
upload `index.html`.** Engine D realizes gains while Engines A, B and C do not — the exact
cross-surface contradiction D-4 exists to prevent. The state is *green and inert-ish*, not
*complete*. See §6 for what remains.

| Field | Value |
|---|---|
| Built against | v5.31 · `17636ea1b24ea37c806008e7a6b1a32f` (verified, §1) |
| Working source | `DangerClose-v5_32-PARTIAL.jsx` · `229191d697e3a1156128d2277c3d5601` |
| Version strings | **bumped to v5.32** at all four in-app sites (see §4) |
| Suite | **1031 app checks, 0 failed** · parity **8/8 strict** · tooling 50 |
| Sites complete | S-1, S-3, S-4, and the D-4 series hook |
| Sites outstanding | S-2, S-2b, S-5, S-6, S-7, S-8, S-10, S-11 |
| Scope | `SCOPE_FIX_realized_capital_gains_v5_32.md` Rev C — **one premise falsified, §3** |

---

## 1. Freshness check (§A / §A2) — PASSED, with two pool findings

Every hash in the session brief matched exactly: source, prior source, and all ten supporting
documents. `CHANGELOG.md` newest entry is v5.31. Node 22.22.2, matching the recorded toolchain.

**The §A2 clone-and-diff ran first**, against commit `4b8e714 v5.31`. Of 76 pool files, **48 have
repo counterparts and all 48 matched byte-for-byte — zero suite drift.** That reconciles with the
v5.31 note of "47 compared, one divergence": the divergence was the stale committed manifest, now
committed, making 48 comparable and 48 clean. The other 28 are knowledge-only documents.

### Finding P-1 — `dom_entry_v529.jsx` is still in the pool

The brief and the manifest both state the pool holds exactly two `dom_entry_*.jsx`. It holds
three. The manifest's own rotation block (line 266) records that `dom_entry_v529.jsx` was rolled
OUT at the v5.31 ship. **The delete did not take** — the §G write-hazard, second recorded
occurrence. Content is byte-identical to the committed copy, so nothing was at risk; it is a
housekeeping defect. **Add it to this release's delete-first list.**

### Finding P-2 — the manifest rotation block is stale again

Line 263 reads *"Current pair: v5.29 (prior) → v5.30 (current)"* while the top tables and line 266
say v5.31 current / v5.30 prior. Per the brief the top tables win. The block carries a standing
instruction for exactly this recurrence: *"If it goes stale again, delete it rather than repairing
it: the top tables already carry the answer."* It has gone stale again. **Recommendation: delete
the block at this refresh rather than rolling it forward.**

---

## 2. Baseline before any edit — reproduced exactly

Computed from suite output, never restated: current leg **515** (t1 77 · t2 15 · t3 36 · t4 159 ·
t5 44 · t6 21 · t10 163) · parity **8 strict** · feature **487** · **app total 1010** · tooling 50
· prior leg 495 + 8 + 487 = **990**. Zero failures. Matches the brief in every figure.

Premise sites re-verified against source, all at their stated lines: Engine D's draw (L4366), the
`_ordFrac` precedent (L4381–4387), the full-basis inflow (L4391), MAGI with no gain term (L4430),
Engine B's `capGains_y = 0` (L4653), the ACA cliff solver (L3758–3772 plus its 8-pass contraction
at L3819–3822). `DOCS_HTML` re-measured: line 3507, **142,990 characters / 144,111 UTF-8 bytes**,
source 12,195 lines — unchanged from the brief.

---

## 3. ⚠ SCOPE PREMISE FALSIFIED — and the decision taken

### What the scope said

> *"Because the default is 0, this release must move no figure at all. Parity run A (share = 0)
> must be 8/8 strict, and it is the whole verification story."* (§5)
> D-6: *"inherit the default (0); no figures move, no notice needed."*

### What measurement showed

S-3 was built as specified: basis moves proportionally on a draw, **1:1 on the RMD-surplus
inflow**, and **growth adds no basis** — unrealized appreciation is gain by definition. That last
property is economically correct and it falsifies the premise. A pool declared 0% embedded gain
*today* still accrues gain between the retirement date and the sale.

On the example household in the scope's own configuration (`retireYear 2027, rothAmount 0`):

| Share | Engine lifetime gain | Scope §2.1 (declared component) | Growth component |
|---|---|---|---|
| 0% | **$30,821** | $0 | $30,821 |
| 25% | $67,571 | $36,750 | $30,821 |
| 40% | $89,621 | $58,800 | $30,821 |
| 75% | $141,071 | $110,250 | $30,821 |

The growth component is **constant across shares**, so `gain(share) − gain(0) = pool × share` to
the dollar — and those differences reproduce scope §2.1's independently-computed figures exactly.
**The basis tracker is correct; the scope's inertness claim was not.**

**MC parity passed 8/8 strict throughout.** Its fingerprint covers `mc, extMC, stress, roth,
rothCurrentEstate, ssTable, stateTax, inflation` and **does not include Engine D**. Parity could
never have caught this. This is a concrete instance of the brief's own warning that strict parity
is necessary and not sufficient — the mandated efficacy suite is what caught it.

### Decision — **Option A: accept and disclose** (Steve, 2026-08-13)

Growth accruing gain is correct modelling and the direction is conservative (more gain, more tax,
worse plan) except through the §2.3 ACA-floor artifact. Consequences, all of which must land in
the deliverables:

1. **D-6 is wrong as written** and must be rewritten. Figures DO move at the default.
2. **The CHANGELOG must state plainly** that v5.32 moves Withdrawal-tab figures for every
   household, with no user action, and give the magnitude (on the example household: $30,821 of
   lifetime realized gain, 3.09% of $997,685 lifetime Priority-1 draws).
3. **Parity is not the verification story.** Say so; cite `t19` Section D instead.
4. The decision is now **pinned by tests** (`t19` D2, negative-controlled by NC4 below), so a
   future session cannot quietly "fix" share 0 back to inert.

### Reconciled — scope §1.2 is correct, my earlier query was not

I initially could not reproduce §1.2's $997,685 lifetime draws / 85.3% recycled, seeing $297,065
and a pool that drained in year 2. **Cause found: `rothAmount`.** At `rothAmount: 0` the engine
reproduces §1.2 exactly — pool $147,000, lifetime draw **$997,685**, 15 refill years, 85.3%
recycled. `t19`'s standard ARGS convert $70K/yr, which shrinks Traditional enough that RMDs never
overshoot spending and recycling never happens. **No error in the scope.** Both figures are
correct; they are different runs. This is now recorded in `t19` so it is not rediscovered.

---

## 4. What was built

### Source (7 hunks, all enumerated — no phantom edits; `diff` verified against pristine v5.31)

- **S-1** — `taxableGainPct: 0` in `DEFAULT_PORTFOLIO`; a single module-level `taxableGainShare()`
  accessor clamped 0–0.95 that every engine will read (D-1: one field, one reader); an
  `applyLoadedData` schema default mirroring the v5.7 `acaBridge` precedent (D-6).
- **S-3** — `taxBasis`, a fourth tracker on the Priority-1 pool: proportional on a draw, **1:1 on
  the RMD-surplus inflow**, untouched by growth. Mirrors `_ordFrac` as the scope specified.
- **S-4** — `capGain_y` added to Engine D's MAGI. The **gain**, never the raw draw. The prior
  comment (*"Taxable-account draws are not (only gains are, ignored here)"*) was falsified by this
  release and was rewritten rather than left standing (§B2).
- **D-4 hook** — `capGain_y` and `taxBasis` exposed on each schedule row, so A, B and C consume one
  owner's series rather than each modelling a second draw.

### Version bump — all four in-app sites, plus 23 test-chain edits

Sites: DATA LOAD header (L3465), footer (L10828), and **two inside `DOCS_HTML`** (Field Manual
callsign and footer). The in-blob edits used quote-free anchors, uniqueness asserted **file-wide**,
net char/byte delta measured (**0 / 0**, same-length swap), and the full surrounding passage
printed back and read (§C0). Blob unchanged at 142,990 chars / 144,111 bytes; zero v5.31 strings
remain in it. Lines 876 and 1215 mention v5.31 as *historical provenance* for the OBBBA block —
correctly left alone.

Test chains: t1 6 · t3 2 · t4 9 · t5 3 · t6 3 = **23**, applied with per-file abort on any
unexpected match count. Includes the `_vCountV` split and the Verify row count held at **62** by
extending the gate to v532 rather than changing the number, as the brief directed.

### Tests

- **`t19` Section D added — 14 → 35 checks.** Proves declared-share fidelity to the dollar against
  scope §2.1, the Option A pin, the 85.3% recycling case, the Rev A flat-fraction extinction, and
  an **independent per-year replay** that reconstructs every year's gain from the prior row's
  recorded basis and pool without touching the engine's own arithmetic.
- **`t19` B-2 pin REWRITTEN, not flipped** (the trap the brief flagged). It now asserts **both**
  halves: MAGI *excludes* `drawFromTaxable` (return of basis is not income) **and** *includes*
  `capGain_y`. Note the old assertion still passed unchanged after S-4 — a careless session would
  have left it, with reasoning that is now false.

### Negative controls — four, all fire

| Control | Result |
|---|---|
| NC1 remove `capGain_y` from MAGI | fires (B-2b) |
| NC2 inflow adds no basis | fires (D3 only — tracked $909,485 vs $89,621) |
| NC3 flat fraction instead of tracker | fires (10 checks) |
| NC4 growth adds basis (undo Option A) | fires (5 checks) |

**Coverage insight, recorded in the test:** NC2 leaves D1, D2 and D4 all green and fails only D3.
When the pool fully drains, total gain = total draws − total basis ever added, so the *difference*
between two shares is `pool × share` regardless of how inflows are handled. **D3 is the only guard
on the 1:1 inflow rule.** Do not weaken it.

---

## 5. Findings against the harness

### H-1 — `t14`'s Engine D source window was too tight (FIXED)

`t14` failed 32/1. Not an app defect: the S-3 comment block pushed Engine D's survivor rule from
offset 7,412 to **8,499**, past a fixed **8,000-character** slice. This is OPERATIONS §C's "read
windows must clear the prose" failure applied to a *source* window rather than a DOM one.

Fixed by sizing against the real function boundary, not by doubling until green: Engine D's rule
text is **unique file-wide** (verified) and the anchor sits 19,486 chars from `computeTaxPlan`, so
**12,000** cannot escape Engine D. Negative-controlled — the assertion still fires when the rule is
removed.

**⚠ Recorded in the test for the next session: Engine A has only 1,494 characters of headroom left
at its 4,000 span, and S-5/S-6 land inside it.** Its safe ceiling is **29,122** — the offset of the
*next* engine's copy of the shared rule text `const lg = Math.max(ssA_y, ssB_y)`. A window widened
past that fails **open**, matching another engine's copy and passing vacuously.

### H-2 — my own negative-control harness was wrong at first (owned)

My first negative-control run reported NC2 and NC3 as **not firing**, which under §B2 is a finding.
It was my error, not a coverage gap: `mk_testable.sh` builds from `v532.jsx`, and I had corrupted
`DangerClose.jsx` only, so the corruption never reached the runtime bundle. NC1 appeared to fire
solely because that check reads the source file directly. Re-run with both files corrupted, all
controls fire. Recorded because the failure mode is silent and will recur.

---

## 6. What remains — in order

1. **S-5 / S-6 / S-7 — the cross-engine consumption.** Until these land the release is
   self-contradictory and must not ship. **S-6 is still the highest-risk edit in the release.** The
   spending gain must shift the ACA cliff reserve in **both** branches: the plain solve at L3758
   *and* the 8-pass contraction at L3821. Adding it to only one is the silent failure the code's
   own comment warns about. It needs its own hand-computed case; no existing test would catch a
   miss.
2. **S-2 / S-2b / S-8** — the control, the visible prompt, and `rothGainPct` reading the persisted
   field instead of `useState(0)`.
3. **S-10 disclosures.** One is already located: `t4` line ~396 asserts the Taxes-tab footnote
   contains *"Realized capital gains default to $0 unless a sale is modeled"*. That is a §B2
   **disclosure lock** — it goes green *because* the stale copy survived. Invert it **gated per
   leg** in the same release that falsifies it, and sweep all 28 surfaces.
4. **Remaining tests** — `t18` LTCG breakpoints on a purpose-built household (every LTCG figure is
   $0 on the example household), `t17`/`t13` IRMAA two-year lag, `t5` persistence and Clear-All,
   `t4` prompt rendering.
5. **Documents** — CHANGELOG (per §3 above: must **not** claim D-2 closed, and must disclose that
   figures move at the default), METHODOLOGY §5/§12 (mandatory — modelling release),
   `MissingFeatures.md` (D-2 **partially addressed**, not struck; add proposed D-8),
   `ARCHITECTUREIssues.md` (the D-4 structural note), `TESTING.md`, manifest, `VERIFY.sh`
   (roll v531→v532 and the new totals).
6. **Build + smoke** — `vite.config.js` **with the dot**; never reconstruct `src/main.jsx`;
   `node qa/smoke_built.mjs` → 16 checks.
7. **Package** per §L — one zip, cut once, at the end, suite run from the packaged copies first.

### Shim note

When `taxableGainShare` is added to `shim.txt`, it **must** use the guarded `_g("taxableGainShare")`
form. A bare reference throws `ReferenceError` at module load on the v5.31 prior leg's CJS bundle —
and **parity passes 8/8 first**, so it will not warn you (§C).

---

## 7. Suite state — computed from output

| Leg | Total |
|---|---|
| Current leg v532 | **515** (t1 77 · t2 15 · t3 36 · t4 159 · t5 44 · t6 21 · t10 163) |
| Parity v531 → v532 | **8 strict** |
| Feature | **508** (t7 41 · t8 38 · t9 14 · t11 40 · t12 23 · t13 42 · t14 33 · t15 11 · t16 24 · t17 63 · t18 50 · **t19 35** · t20 94) |
| **App total** | **1031** (v5.31 was 1010; **+21**) |
| Tooling `t21` | 50 (never counted in the app total) |
| Prior leg v531 replay | 515 + 8 + 487 = **1010**, still green |

All zero failures. The +21 is entirely `t19` (14 → 35).
