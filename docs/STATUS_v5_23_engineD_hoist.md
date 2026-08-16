# STATUS — release v5.23 (Engine D hoist)

**BUILT · PROVEN · PINNED — NOT PACKAGED, NOT SHIPPED. No open decisions remain.**

| Field | Value |
|---|---|
| Date | 2026-08-11 |
| Built from | v5.22 · `aac6851f91860edc8341dd44a2c35424` |
| Prior (comparison baseline) | v5.21 · `0c3cf58994326a5eda39f7ec46957f51` |
| Candidate source | `v523.jsx` · **`bce4bd537a498df5b489ea5702e3eb44`** |
| Repo HEAD at time of build | `197dcd3` (v5.22 shipped and verified) |
| Governing scope | `SCOPE_HOIST_engineD_v5_23.md` — **its §4 is wrong; see §3 below** |
| Freshness check | PASSED against the refreshed pool |

Nothing has been pushed. `src/DangerClose.jsx` in the repo is still v5.22.

---

## 1. What this release does

Engine D — the Withdrawal tab's projection — was an arrow IIFE embedded in JSX at L7502–7970 of v5.22,
inside the component body. It was therefore observable only through the rendered DOM, which prints every
figure $K-rounded: the ±$500 ceiling recorded in `STOP-REPORT-EngineBC-render-precision.md`. It was the
last engine behind that ceiling.

It is now a module-level function, **`computeWithdrawalPlan({ retireYear, rothAmount, scenarioPreset })`**
at **L3964–4192**, sited immediately before `computeTaxPlan`, following the pattern OPERATIONS §M
records: hoist with no behaviour change, prove every figure identical, test in the release that follows.

**226 lines moved out of the IIFE verbatim; 238 inserted at module level** (the extra being the header
comment and the return statement). The JSX return half is untouched.

This release fixes nothing. Engine D's known defects — `otherAccounts` treated wholly as taxable, draws
absent from MAGI, named IRA money producing no RMD — are **pinned here, not fixed**, and belong to
releases (b) and (c).

## 2. Verification of the hoist

| Check | Result |
|---|---|
| Source parses (acorn + JSX) | OK |
| `computeWithdrawalPlan` is depth-1 (module level) | confirmed by AST |
| Component-scope reads inside it | **0** — was 3 (`retireYear`, `rothAmount`, `scenarioPreset`), now parameters |
| Module-scope reads | 19, unchanged |
| Return shape | 17 keys, exactly what the JSX destructures |
| Reachable from the harness | `typeof === "function"`, returns all 17 |
| Scope §6 risk — is `scenarioPreset` written inside? | **cleared** — no writes or shadowing of any of the three |
| Version sites bumped | **4**, each exactly once; the two historical `v5.22` code comments correctly left alone |

## 3. ⚠ FINDING — the existing suite does not witness Engine D

The scope claimed `t4` (90 checks) and `t12` (23 checks) would witness the hoist. **Both claims are
false.** A negative control perturbed inflation by +10% inside the hoisted function — verified live in
both the ESM and CJS bundles:

```
_wInfl       clean 0.0274      perturbed 0.030140
totalDrawn   clean $1,631,277  perturbed $1,681,598      delta $50,320
```

**`t4` passed 90/90 and `t12` passed 23/23 anyway.** A $50K swing in Engine D passed the entire
757-check suite. Engine D has never had discriminating coverage, and nothing in the suite's output said
so. This is now recorded as **`OPERATIONS.md` §B2**.

Consequence: "every figure identical" could not be proven for Engine D by the existing suite, and
Engine D was not observable at module level *before* the hoist, so no engine-to-engine comparison exists
across the boundary either.

### What was proven instead

`qa/domdiff_withdrawal.mjs` (new) renders the Withdrawal tab on **both** builds and diffs the text:

```
✓ v522: schedule table rendered
✓ v523: schedule table rendered
✓ schedule text identical across the two builds (version strings normalized)
✓ entire tab text identical once version strings are normalized
DOM DIFF: 4 passed, 0 failed
```

Before normalizing, the **only** divergence in the entire tab was at char 6043 — the footer's `v5.22` →
`v5.23`. Every schedule row byte-identical. **This is the proof that the hoist changed nothing
observable**, and it should be cited as such in the CHANGELOG.

## 4. `t19` — Engine D's first real coverage, with three defect pins

`qa/t19_engineD_exact.mjs`, **13 checks green**: five structural (reachability, the 17-key contract,
determinism, parameter purity) and eight pin/fixture.

### One pin claim was wrong as specified, and was corrected

The carry-forward asked for *"the $90K named IRA produces no RMD anywhere."* **That is false.** Adding
$100K to the named Rollover IRA:

| | |
|---|---|
| `_tradInit` (the balance RMDs are computed on) | **unchanged** — $1,227,600 |
| `_taxInit` (the taxable pot) | **+$100,000 exactly** |
| lifetime RMD | **$151,662 → $218,941 — it MOVED** |

RMDs move *indirectly*: a larger taxable pot means less traditional drawdown, so more traditional
balance survives to RMD age. The defect is that `_tradInit` never sees the money — not that RMDs are
unaffected. Pinned as corrected. The original phrasing would have failed on its first run.

### The three pins, each verified at the source line

| Pin | Basis in source | Flipped by |
|---|---|---|
| **B-1** · taxable pot == `otherAccounts` total to the dollar — $147,000, incl. $90K named traditional IRA and a $15K HSA | `_taxInit = Math.max(0, PORTFOLIO.household − PORTFOLIO.total401k)` | release (c) |
| **B-2** · `magi` omits `drawFromTaxable` | the magi expression names its components explicitly; `drawFromTaxable` is absent | release (b) |
| **B-3** · named IRA money leaves `_tradInit` untouched and lands wholly in the taxable pot | `_tradInit = _rsbW.tradInit`, which never sees `otherAccounts` | release (c) |

### Negative-controlled twice — the pins genuinely flip

- **Simulated release (b) fix** (add `drawFromTaxable` to `magi`) → B-2 fails. **12/13.**
- **Simulated release (c) fix** (remove named IRA money from the taxable pot) → B-1 and B-3's second
  half fail. **11/13.**

*(The rel-c control did not flip B-3's `_tradInit` half — correctly: the simulation only removed money
from the taxable pot without adding it to the traditional balance. The real release (c) does both.)*

## 5. A harness defect found and fixed during the build

The first `shim.txt` edit exported `computeWithdrawalPlan,` as a bare shorthand. `mk_testable.sh`
splices the shim into **every** version, so the prior-version leg threw
`ReferenceError: computeWithdrawalPlan is not defined` and `dom_v522.cjs` would not load at all.

Corrected to `computeWithdrawalPlan: _g("computeWithdrawalPlan")` — the guarded pattern the shim already
uses for `contribAccrual` and `retireStartBalances`. All bundles rebuilt and the full suite re-run
afterwards; every figure below is from the corrected build.

**Note what did not catch it: parity passed 8/8 first**, because `t2` uses the ESM bundle and only the
CJS bundle threw. Now recorded in `OPERATIONS.md` §C.

## 6. Suites — 770 green

Parsed from suite output, not hand-totalled:

```
baseline 382 (t1 64 · t2 15 · t3 36 · t4 90 · t5 44 · t6 18 · t10 115)
parity     8   (v5.22 -> v5.23, STRICT, no INTENDED_DIFFS)
feature  380 (t7 37 · t8 35 · t9 14 · t11 40 · t12 23 · t13 40 · t14 33
              t15 11 · t16 24 · t17 63 · t18 47 · t19 13)
TOTAL    770   = 757 pre-existing returning IDENTICAL figures + 13 new t19
plus       4   qa/domdiff_withdrawal.mjs (cross-version; not in the release headline)
```

The prior leg (v5.22) re-runs at 382 as frozen history. Five version-keyed suites learned the `v523`
tag — the `KNOWN_VERSIONS` registry plus every enumerated ladder and version-string map, per §I.

## 7. Files in this drop

Verify each against `MANIFEST.txt` before use.

| File | What it is |
|---|---|
| `v523.jsx` | candidate source — the hoist + 4 version sites |
| `qa/shim.txt` | `computeWithdrawalPlan` exported, **guarded** (§5) |
| `qa/t1_units.mjs` `t3_roth` `t4_dom` `t5_storage` `t6_single` | `v523` registered + every ladder rolled forward |
| `qa/dom_entry_v523.jsx` | harness entry, generated by the verified tag rule |
| `qa/t19_engineD_exact.mjs` | **new** — Engine D coverage + the three pins |
| `qa/domdiff_withdrawal.mjs` | **new** — the cross-version proof (§3) |

Unchanged files (t2, t7–t18, harness) come from the repo at HEAD `197dcd3`.

## 8. What remains — all mechanical, no decisions

- **CHANGELOG** entry + provenance line
- **TESTING** roll-forward: 757 → 770, new `t19` rows, **and the §3 disclosure** — the page currently
  implies Engine D coverage that did not exist
- **Build `index.html`** per §N3a and run `qa/smoke_built.mjs` — **expect 16/16**. Not yet run against
  this build; this is the one genuinely unexercised step
- **Manifest rows** for `t19_engineD_exact.mjs`, `domdiff_withdrawal.mjs`, `dom_entry_v523.jsx`; rotate
  sources to v5.23 current / v5.22 prior
- **`VERIFY.sh`** rolled forward
- **Full suite from a clean tree built out of the packaged copies**, then **one zip** per §L
- **METHODOLOGY**: correctly untouched — no modeling change

## 9. Parked, recorded, not at risk

Both are now in `OPERATIONS.md` (md5 `0787c22210aaef852b021ba71c4134fe`), so neither depends on session
memory: the `qa/tools/` fixture (§B1 — the tools are not themselves tested), and the §C1 jsdom audit
(eight copies of the environment; which carry which trap fix has never been checked).

After v5.23 ships, **release (b)** — Engine D's MAGI fix — is next, and `t19`'s B-2 pin flips to verify
it.
