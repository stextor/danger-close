# STATUS — v5.38 build, session 1 (2026-08-17): engine edited, gate clean, parity witnessed

**Base:** v5.37 `ff4dddcb585e2237e6c6a2643ded2ebb` · **Candidate:** `DangerClose-v5_38-candidate.jsx`
md5 `b8d12481b55cd2ed05c6c6f14e2f41d9` — NOT SHIPPED; suite incomplete. Companion docs:
`SCOPE_v5_38_aca_sale_gain_tax.md` (Rev B), `DERIVATION_v5_38_step1.md`. This session also
performed step 1 (the derivation) and the pool-refresh repairs earlier the same day.

## 1 · What the candidate contains (7 edits, all anchor-verified)

Four version bumps (footer, DATA LOAD header, Field Manual callsign, Field Manual footer —
all now v5.38) plus the three mechanism edits per scope §3 with decisions 1–4 resolved:

- **The ACA block** (Engine A): `_stackAca = max(0, taxableOrd) + qdcg + saleGain`; the
  3-pass contraction estimates the **grossed-up** sale (nested 4-pass); the sale itself
  grosses up fixed-point, clamps to the pool, realizes via the shared rule, and its LTCG is
  charged to `totTax`/`widowTax`; `magiHist[yr] = magi + saleGain + acaSaleGain` (decision
  1); the L4166-era "deliberately still not TAXED" comment rewritten to the new truth.
- **The solver mirror** (`_estSaleGain`): the anticipated premium sale grosses up
  identically (`_stackAcaC = _stackC + _gainC`), so the solver prices the tax-driven slice.
- **The negative-`lost` credit preserved** — see §3, a finding.

## 2 · Verification state (all figures parsed from suite output this session)

| check | result |
|---|---|
| Derivation gate (`gate_v538.mjs`): engine vs `sim_ledger.mjs` v538 + memo pins | **31 / 31 CLEAN** — totTax 314,708 ✓ · totIrmaa 1,150 ✓ · estate 8,908,031 ✓ · Δ +3,802 ✓ · CASE3 byte-identity ✓ · both invariances ✓ |
| t2 parity `compare v537 v538` with `INTENDED_DIFFS["v537→v538"] = ["rothAca"]` | **9 / 9** — `rothAca` changed as intended; `roth`, `rothCurrentEstate`, MC/extMC/stress **byte-identical**. The witness v5.36 decision 5 deferred this fix to obtain. |
| t2 own leg (v538) | 18 / 0 |
| t3 (v538; ladder registered) | 36 / 0 |
| t22 (`v537` prior, current → v538 candidate) | **73 / 4** — all four failures are **group F**, diagnosed below |

## 3 · Findings this session (the gate earned its keep)

**`lost` can be NEGATIVE, and the shipped comment saying otherwise was false.** On the
floor-crossing household (t22's BRIDGE, fixed $60K), the no-conversion baseline sits below
the 100%-FPL floor ($0 subsidy) while the strategy's higher MAGI clears it — the strategy
pays *less* premium than the baseline, and v5.37's `taxBal -= lost` **credits** the pool.
The first candidate edit dropped that credit; the gate's CASE3 identity check caught it
(engine ≠ reference, −$645 totTax, wealth path shifted from 2029 on). Fixed as
`taxBal -= _saleAca + Math.min(0, lost)`, the false "conversions only raise MAGI ⇒ ≥ 0"
comment corrected in the same edit, and the gate re-ran clean. The reference sim had the
credit all along — which is exactly why the reference exists.

**`acaCliff` legitimately moves −$2,547 on CASE1** (fill12/22/24 move +$3.5–4.1K,
conservative): the mirror now anticipates the larger sale, the solver redistributes
conversions, and its protective property — no forfeited bridge year — holds (asserted).
The naïve "every strategy ≥ v537" expectation was wrong for solver strategies and was
corrected in the gate; the ship session may examine the per-year redistribution further.

**t22 group F expires by design.** Its claim — byte-identity vs the prior build — was the
A2-era proof that a display exclusion moved no figure. v5.38 moves figures on purpose:
fill24's contraction (grossed-up estimate) shifts its 2029 subsidy by $5.28, totAcaLoss by
$5, estate and one floor ratio accordingly — the intended mechanism's second-order, on
bracket-fill rows whose gains sit in the 15% band. Group F needs the declared-diff
treatment (t2's idiom) or a re-pin, decided deliberately, not nudged.

## 4 · Remaining worklist (next session, in order)

1. **t22:** re-scope group F for the v537→v538 pair (declared-moving rows/fields; identity
   still asserted for none/current and 0%-band rows); add **group I** from `gate_v538.mjs`
   (CASE1 exact + IRMAA crossing, CASE3 identity, invariances, extinction pair); wire
   controls **C14** (revert the tax charge → pins fire) and **C15** (drop the `magiHist`
   term → IRMAA pin fires alone) into `controls.sh`, run both, watch them fail.
2. **t1:** register `v538` in `KNOWN_VERSIONS`, the `IS511`/`IS514`/`IS536` chains, the
   verify-count gate, and the `verStr` map; run both legs.
3. **DOM leg:** create `dom_entry_v538.jsx` (sync from canonical), build, run t4/t9,
   re-point `domdiff_withdrawal.mjs` v537→v538 and **measure** the Roth tab on the demo
   household (it is on the bridge; movement at $K rounding is possible, not assumed).
4. **Full `runsuite.sh v537 v538` both legs**; totals parsed from output.
5. **Docs:** METHODOLOGY inversion (the "Disclosed, not fixed" paragraph); CHANGELOG in
   the ratified §8-4 shape (conservative direction; NONE unchanged; rankings may reorder;
   0%-bracket households unmoved; IRMAA lookback surcharge possible at 65–66; plus the
   negative-`lost` comment correction and the acaCliff redistribution note); register the
   NIIT/state finding (§7); Steve reviews wording.
6. **Build `index.html`** per §N; `smoke_built`; hash-verify jsx == canonical == build input.
7. **Package** with the knowledge-refresh list: retire the six v5.38-prep pool files to
   repo (`docs/`, `qa/tools/`) with their manifest rows deleted in the same edit;
   `capture_gain_fp.mjs` retirement if taken; the optional stale-STATUS cleanup; manifest
   re-rolled and shipped to both destinations; closing hash sweep.

## 5 · Deliverables in this package

| file | md5 | disposition |
|---|---|---|
| `DangerClose-v5_38-candidate.jsx` | `b8d12481b55cd2ed05c6c6f14e2f41d9` | the candidate — pool now (next session builds from it); NOT the ship |
| `gate_v538.mjs` | `585a90322d5a56ec7bed955eb9b5c67a` | pool now; becomes t22 group I; repo `qa/tools/` at ship |
| `t2_engines_v538.mjs` | `9a9ba167634ee29c645830ccdd7d6ca9` | patched t2 (INTENDED_DIFFS) — pool as the working copy; replaces `qa/qa-baseline/t2_engines.mjs` at ship |
| `t3_roth_v538.mjs` | `94fce21806fe4a1e6dba1a60139b84a7` | patched t3 (ladder) — same treatment |

Upload delete-first where a name collides; add manifest rows (or extend the v5.38-prep
note) so the offline fallback can see them — these, too, are committed nowhere yet.
