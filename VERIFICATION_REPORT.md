# Danger Close v5.7 — Verification Report

**State: 527 automated checks, all green, against the exact source shipped in `repo-update/` (v5.7.2).** (493 at the ACA freeze; +7 box-sizing; +23 for the v5.7.1 break-even rebuild and Phase 0 fixes. Post-release byline edit — "Steve Textor" → "Steve T." in the app footer and Field Manual — re-verified under the full suite; hash updated.)
Suites: t1 units 218 · t2 engines 44 · t3 Roth 45 · t4 DOM (all 26 tabs, JSDOM) 153 · t5 disclaimer gate 24 · t6 spousal-branch 9. The build input (`src/DangerClose.jsx`) is byte-identical to the tested canonical source; `index.html` was built from it via the repo's own Vite config and marker-verified (12 markers including the v5.7 feature strings, the disclaimer gate, and the seam-note highlight).

## In-app Verify tab
53 checks, all green, each citing its primary source. New in v5.7: an 8-check ACA block (FPL vintages, band endpoints, the 133% statutory jump, inclusive-at-400% rule, cliff-edge dollars, ENHANCED-regime cap) sourced to IRS Rev. Proc. 2025-25, HHS/ASPE, and Rev. Proc. 2021-36.

## ACA engine — hand-verified figures (exact assertions in t1/t3)
| Case | Hand-derived | Engine |
|---|---|---|
| FPL, couple, 2026 coverage | $21,150 | ✓ exact |
| FPL, single, 2027 coverage (real 2026 vintage, no proxy) | $15,960 | ✓ exact |
| Applicable % at 175% FPL (interpolated) | 5.395% | ✓ to 1e-12 |
| Statutory jump at exactly 133% FPL | 2.10% → 3.14% | ✓ exact |
| Subsidy, MAGI $30K, $18K benchmark | $16,140.12 | ✓ ±$0.01 |
| Cliff: MAGI $62,600 vs $62,601 | $11,765.04 vs $0 | ✓ exact |
| Loss from $20K conversion (current law) | $3,120 | ✓ exact |
| Cliff jump: conv $32,600 vs $32,601 | loss $4,375 vs $16,140 | ✓ exact |
| STAY UNDER ACA CLIFF solver | converts $32,100 (= 62,600−30,000−500), loss $4,325 | ✓ exact |
| Full-SS add-back: cliff crossed at conv | $8,601 (taxable-side math would say $32,601) | ✓ |
| One spouse on Medicare: half premium | subsidy $7,894 | ✓ exact |
| Premium path | compounds at inflation+2pts exactly | ✓ ±$0.01 |
| ENHANCED regime, $20K conversion | loss $2,743 (interpolated ARPA band 6.487%) | ✓ exact |
| $0 premium | all ACA machinery inert | ✓ |
| Pre-v5.7 backup import | defaults to feature-off, no crash | ✓ |

## Gate record (BUILDSPEC §5)
1. **Backup compatibility** — tested (t3 R7): old backups import cleanly, `acaBridge` defaults `{premium:0,size:0}`.
2. **Primary-source gate (BLOCKING)** — satisfied: the 2026 Applicable Percentage Table was fetched from the IRS's own PDF (irs.gov/pub/irs-drop/rp-25-25.pdf) during the build; FPL from HHS/ASPE (2025 *and* 2026 vintages); ARPA table from Rev. Proc. 2021-36. No remembered constants shipped.
3. **Docs by name** — Field Manual: new "ACA Premium Subsidy" tab entry, v5.7 callsign/heading, 53-check count, corrected slider range ($0–$400,000). METHODOLOGY §7b added. CHANGELOG.md created (v5.7 first entry). README line: see UPDATE_INSTRUCTIONS.
4. **Demo household** — carries a $1,600/mo benchmark so the column, toggle, and solver render for reviewers; full 26-tab DOM sweep green with it live.
5. **Seam note** — ships beside the premium field, amber-bold: "Enter your GROSS premium here; keep your expense rows as what you actually pay." Asserted in t4.

## Incidents this cycle (disclosed)
- **Workspace drift ("phantom code"):** between sessions, the working copy of the source and three test files acquired an unrequested, plausible-but-unreviewed ~268-line ACA implementation not present in the shipped snapshot or the parents. It was quarantined (`QUARANTINE_unexplained_aca_code.diff`), the canonical source was reverted to the verified shipped snapshot, phantom test content was excised, a clean 458-green baseline was re-established, and the feature was then rebuilt deliberately from the spec. A workspace-integrity check against shipped artifacts now runs at the start of every build session.
- **Two builder errors caught by the process itself:** (a) a hand-math error for the ENHANCED case (assumed the flat 8.5% cap at ratio 3.19 where the ARPA band interpolates to 6.487%) — the engine was right, the test expectation was corrected with the derivation recorded; (b) a real NaN bug (`expectedInflation` is a function; adding it as a value silently zeroed every bridge year after the first) — caught by the "premium path compounds exactly" test, which exists precisely for this class of failure.

## Honest scope
The suites verify constants, engine math against hand-derived cases, DOM rendering/persistence across all tabs, backup round-trips, and the disclaimer gate. They do not constitute independent professional review of the tax or ACA modeling, and the app's own limitations sections (Field Manual §13, METHODOLOGY §12, and the in-app ACA notes) list the simplifications that remain by design.


## Box-sizing layout fix (scooter2013 report)

Overlapping My Data inputs on wide displays. Root cause: the app has no global `box-sizing: border-box` rule (the only one in the file belongs to the Field Manual iframe document), so `width:100%` inputs with padding and border rendered wider than their table/grid cells. Fix: `boxSizing: "border-box"` added at all four `width:100%` form-style sites — deliberately NOT a global `*{box-sizing:border-box}`, which would re-size every padded element in an app visually tuned on content-box. Guards: t1 gains a 4-check U-BOX block (both `inp` objects verified, mortgage what-if inputs verified, plus a defect-class-extinction invariant scanning the whole source); t4 gains a 3-check DOM block proving the mounted My Data holdings table computes border-box on every stretched input. Suite: t1 222 · t2 44 · t3 45 · t4 156 · t5 24 · t6 9 = **500 green**.

## Workspace-drift incident #2 (documented for transparency)

Between sessions, the working copy again acquired unreviewed "phantom" edits implementing the box-sizing fix that had been *proposed but not yet applied* — source changes at the four sites plus test blocks in t1 and t4, none written in the conversation. Per the protocol established after incident #1: the full diff and both phantom test blocks were quarantined to `QUARANTINE_drift2_boxsizing.diff`, the canonical source was reverted to the shipped snapshot (hash-verified), and the fix was then re-applied deliberately with independently written tests. The final source coincidentally matches the phantom byte-for-byte (both are the same four minimal property insertions); the test code shipped is original. No unreviewed code ships.


## v5.7.1 — Break-even rebuild (wealth crossover)

**Engine addition (additive only):** `runRothStrategies` now records a per-year face-value wealth series (`wealthByYr`) per strategy. The 89 pre-existing exact-dollar engine assertions in t2/t3 passed unchanged after the edit — the aggregates are byte-identical.

**Two design corrections forced by probing, documented because they'd bite anyone reimplementing this:**
1. *Heir-discounted wealth is the wrong crossover metric.* Under the estate metric (Traditional discounted 22–24% for heirs' taxes), converting $20K reads as ~$4,800 wealthier on day one — the trad→roth move manufactures a paper gain that drowns the conversion tax and reports an instant payoff. The crossover uses face value; the heir advantage remains captured by the comparator's ESTATE ranking. The card states this.
2. *"Never behind" is a distinct outcome, not a degenerate crossover.* Conversions executed before Social Security starts frequently sit under the standard deduction and cost ~$0 tax. The card distinguishes four outcomes rather than forcing everything into "breaks even in year N."

**Pinned engine results (t3 R8, exact):** demo-like couple, $21K taxable, ladder 2027–2038 — $20K/yr: never behind, measurably ahead 2039. $120K/yr: never recovers (worst −$203,227). FILL-24%: never recovers (worst −$513,976; with almost no taxable money, conversion taxes are paid out of the Roth itself). Single filer, no income, $15K/yr under the deduction: NONE pays $5,755 lifetime tax vs $1,078 with conversions, and the strategy pulls ahead exactly at RMD start (2037) — the year the mechanism predicts. Doubling a taxed conversion deepens the shortfall and delays recovery (monotonicity held: −$59,251/2053 → −$117,819/2055).

**Test-harness traps found while pinning (recorded for future engine tests):** omitting `asOfYr` from an engine P NaNs every inflation exponent and the engine *silently charges no tax* (every `due > 0` guard goes false) — strategies then compare identical; and any engine test must neutralize the global income streams (`S.PORTFOLIO` with a far-future stream) or the demo household's part-time work income contaminates the arithmetic. Both now have precedent handling in t3.

**Phase 0 fixes** (pension lump-sum guard ×2 inputs, funding-fallback notice, Mixed relabel, Taxes disclaimer correction) asserted at source level in t1 (8 checks) and in the mounted DOM in t4 (4 checks). One build-process lesson: t4's DOM bundle imports `app/src/DangerClose.jsx`, which must be synced from canonical before rebuilding — a stale sync produced 4 false failures before the root cause was found.


## v5.7.2 — Readability pass

Scripted, reviewable transforms; zero math edits by design. 119 lines raised from 7px, 58 prose lines 8→9px, 118 tracking reductions, holdings table restructured with the OWNER teaser (tfoot colSpan updated 8→9). Two scope findings recorded: (1) the planned de-capitalization pass collapsed to zero edits — a census found only 20 long all-caps strings outside the manual, all section headers the design keeps; the caps complaint traced to tiny tracked labels, fixed by size+tracking instead; (2) the new floor invariant immediately caught four 6px strings the original survey missed (claiming grid, IRMAA rows) — below anything reported, and exactly why the invariant is permanent. Fonts verified loading at 300–700 (no synthetic bold). Suite 527 green; source hash matches shipped deliverables.
