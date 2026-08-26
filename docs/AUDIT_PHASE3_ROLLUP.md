# AUDIT PHASE 3 — Sections D + E, roll-up

| Field | Value |
|---|---|
| Date | 2026-08-12 |
| Build under audit | **v5.29** · `4ef69e9a820fac18b99aa2aa46a8b2a1` · **RE-PINNED to v5.49 on 2026-08-25 — read that box first; §5 is superseded** |
| Built `index.html` | `fe6bf7d4230abdacbf7ce1171798feb3` |
| Prior build | v5.28 · `9e06482087f415661196b1c47f7e8be0` |
| Governing document | `SCOPE_STANDING_AUDIT.md` §§D, E |
| Deliverables | `.planning/ARCHITECTUREIssues.md` (13 findings) · `.planning/MissingFeatures.md` (6 ranked + 6 excluded) |
| Result | **Section E covered. Section D partial and labelled as such.** No fixes made. |

---

> ## ⚠ RE-PINNED TO v5.49 — 2026-08-25 · READ THIS BOX FIRST; §5's PLAN TABLE WAS WRONG ABOUT HALF THE AUDIT
>
> Source `2ccc62b669f6ee52c6a0be1709c967a5`, built `index.html` `a976bf66307ca07464e15ae911468365`,
> repo `fc5f174`. **Twenty releases since this document was written at v5.29.**
>
> **Why this repair happened at all.** This is the document a session reads to find out where the
> audit stands. It was asked that question on 2026-08-25 and **gave a wrong answer about two of the
> four phases** — which is the capstone's item 5 ("the audit's own records go stale silently")
> landing on the audit's own orientation document. It was found by reading it against the documents
> it describes, not by any check designed to find it.
>
> ### The plan table in §5 is superseded
>
> | Phase | §5 said (v5.29) | **Verified at v5.49** |
> |---|---|---|
> | 1 · A+B | ✅ v5.10.1 | ✅ holds — **A-2 still open**, Low, needs its own scope |
> | 2 · C | ✅ complete | ✅ holds — and its findings became `t10`'s **163** tax-case assertions, so Phase 2 left a permanent suite, not just a document |
> | 3 · E | ✅ covered | ✅ holds, with the named remainder in §4 still unreached |
> | 3 · D | ◐ partial | ◐ **much further than this document knows** — swept at v5.31, delta'd to v5.39, re-pinned to v5.48, D-6 closed at v5.49 |
> | **4 · F** | ⬜ **not started** | ❌ **WRONG — done.** `UsabilityFlaws.md` is pinned at v5.38 with F-1…F-16; **F-2, F-6 and F-8 were FIXED at v5.40** |
> | **capstone** | "not written here… comes after Phase 4" | ❌ **WRONG — written**, and re-pinned to v5.48 on 2026-08-25 |
>
> ⚠ **A caveat §5 could not have known.** F-2/F-6/F-8 are pinned by **source-text** invariants in
> `t1`. "Fixed" means the wrapper and the keyboard hint are present in the shipped source — **no
> device or headless-layout verification was ever run**, so nothing has been measured at 380px.
>
> ### Section E findings, re-checked by content at v5.49
>
> Not all thirteen — the ones carrying concrete, checkable code claims. **Line numbers in §2 are
> v5.29 addresses and have moved; these were re-resolved.**
>
> | Finding | v5.29 | **v5.49** |
> |---|---|---|
> | **E-2** · four OBBBA values outside `TAX_CONSTS`, time-fused at 2028 with no alarm | OPEN, ranked top-three | ✅ **CLOSED (v5.31).** A named `OBBBA_CONSTS` block now carries them with the statutory cite (P.L. 119-21 §70103); `SENIOR_BONUS_SUNSET_YEAR: 2028` is an explicit constant whose comment states it is **deliberately** not tied to `TAX_CONSTANTS_YEAR`; and the **Verify tab checks them** (L1273–1274). The fuse is lit, labelled and alarmed |
> | **E-6** · jsdom environment duplicated nine times | 9 | ⚠ **HOLDS, exactly 9.** Nine files still call `new JSDOM` directly; ten import `env_dom`. The split §2 calls the finding is unchanged |
> | **E-4** · version literal ×4, no constant | OPEN | ⚠ **HOLDS.** Zero `VERSION` constants. Confirmed the hard way on 2026-08-25: shipping v5.49 meant hand-editing four literals, two of them inside `DOCS_HTML` |
> | **E-5** · backup does not identify the build | OPEN | ⚠ **HOLDS.** Still `app: "DangerClose", version: 5` — a schema version that reads like a build version |
> | **E-11** · `DOCS_HTML` measured at 144,008 vs recorded ~141–142,000 | "recorded figures disagree" | ⚠ **HOLDS, and the MECHANISM is now known.** One line has **three** truthful lengths: at v5.49, **146,374 code points · 146,377 UTF-16 units · 147,515 bytes**. `awk`/`wc -c` count bytes, Python `len()` counts code points, and JS `.length` counts UTF-16 units — the manual holds three non-BMP emoji (🔑 🖥 🧭), each costing two. **E-11 is a units defect, not a drift defect.** The remedy is to state the unit, never the bare number |
>
> **Not re-verified:** E-1, E-3, E-7, E-8, E-9, E-10, E-12, E-13. **Assume stale until measured.**
> E-13 in particular describes a stale manifest entry, and the manifest has been rewritten repeatedly
> since v5.29.
>
> ### What §4's scope report still gets right
>
> Its judgement that **"Section D should be re-run, with the undisclosed-gap sweep as its explicit
> objective"** was correct and has since been acted on three times over. Its list of what Section E
> did **not** reach — the 12,151-line file's structure, `DOCS_HTML` internals, and the
> `validation/` ↔ `qa/` relationship — **is still accurate and still unaddressed.** That is the
> largest untouched area left in the whole audit.
>
> ### The lesson, since this is the third document to need this repair
>
> `MissingFeatures.md`, `AUDIT_TOP_FIVE_SUMMARY.md` and now this one all went stale the same way:
> **a document that describes the state of other documents has no mechanism telling it when they
> change.** `t31` (v5.49) is the first automated check of that shape anywhere in the project, and it
> covers exactly two keys across one pair of surfaces. Everything else here is still checked by a
> human noticing.

## 1. Freshness check (OPERATIONS §A) — passed clean

| Check | Expected | Found |
|---|---|---|
| Manifest current build | v5.29 / `4ef69e9a…a2a1` | ✅ |
| `md5sum DangerClose-v5_29.jsx` | `4ef69e9a820fac18b99aa2aa46a8b2a1` | ✅ |
| CHANGELOG newest entry | v5.29 | ✅ |
| Prior build | v5.28 / `9e064820…7f8e0` | ✅ |
| `OPERATIONS.md` | `0506ec8936e8608b7849890ea47f12e9` | ✅ |
| `VERIFY.sh` | `e8d2f946301ee369fa262fcd9570bb7f` | ✅ |
| Pool `.jsx` inventory | 2 app + 2 `dom_entry` + `main.jsx` + `tools_fixture.jsx` | ✅ no duplicates |

The v5.29 CHANGELOG provenance line was read and matches the manifest on both hashes.

**Harness stood up and exercised.** Flat working folder per §B, deps installed together per the
`VERIFY.sh` pruning trap, `mk_testable.sh v529` → `app_testable.mjs`. `t19` ran **14/14**, matching
`VERIFY.sh`'s expected count. `t20` ran and `t18` ran. `t12` could not run — it requires
`qa/dom_bundle.cjs`, which was not built this session; that is a gap in my setup, **not a defect**,
and nothing is claimed about `t12`.

The full 976-check suite was **not** run — Phase 3 changes no code, so there was nothing to
re-baseline, and the totals in `VERIFY.sh` are quoted rather than re-derived.

---

## 2. What Section E covered

Thirteen findings. The three that matter most:

- **E-6 · The jsdom environment is duplicated nine times, not eight.** Recounted per §C1's own
  instruction. §C1 omits `domdiff_withdrawal.mjs` — which is the cross-version DOM diff, the artifact
  OPERATIONS §B2 calls "the proof the hoist changed nothing." Every §C trap must hold in nine places;
  which copies carry which fix is still unaudited. `qa/tools/diverge.cjs` makes this a cheap scope.

- **E-2 · Four OBBBA values, including a `yr <= 2028` statutory sunset, sit outside `TAX_CONSTS`.**
  The block declares itself the only place to update when law changes. These four are invisible to
  both staleness mechanisms — the Verify tab (which re-checks `TAX_CONSTS`/`IRMAA_CONSTS` against
  cited sources every load) and the ⌛ STALE DATA strip (which keys off `TAX_CONSTANTS_YEAR`).
  Time-fused, three tax years out, with no alarm attached.

- **E-5 · The exported backup does not identify the build.** `L11176: app: "DangerClose", version: 5`
  is a *schema* version. `SCOPE_STANDING_AUDIT.md`'s standing requirement mandates the build version
  in exported data and says its absence "is itself a finding for `.planning/ARCHITECTUREIssues.md`."
  Worse than a plain omission: a field called `version` holding `5` reads as "5.x" and looks like it
  identifies the build. Four releases since v5.24 changed what `otherAccounts` money costs, so
  "which build made this file" is a live question.

The remaining ten cover the stale `t19` pins (E-1), contradictory OBBBA source comments (E-3), the
version literal ×4 with no constant (E-4), 202 hard-coded version-tag comparisons (E-7), eight
orphaned pin branches (E-8), duplicated indexation proxies (E-9), two governing scope docs referenced
by `t19` but absent from knowledge (E-10), `DOCS_HTML` measured at 144,008 characters against
recorded figures of ~141–142,000 (E-11), three engine calling conventions (E-12), and a stale
manifest entry describing a `t15` defect that no longer exists (E-13).

### The negative control, and why the split is the finding

Per OPERATIONS §B2, one control was run: `+ othOrdDraw` was removed from Engine D's `magi` (L4387),
one site, uniqueness asserted before editing, source restored and hash re-verified afterwards.

| Suite | Fired? |
|---|---|
| `t19_engineD_exact` (14) | **No — 14/14 green** |
| `t20_other_taxtype` (94) | **Yes** — 1 failure |
| `t18_engineB_exact` (47) | No (correct — different engine) |

The control fired, so coverage exists. But it fired in `t20`, **not** in `t19` — the suite carrying
the pin that claims to guard exactly this. §B2 says a suite's name is not a coverage claim; this
extends it: **a pin is not a coverage claim either.** The control was not adjusted to make `t19`
fire; the blindness was investigated and written up as E-1.

---

## 3. What Section D covered, and what it did not

**D-1 is verified to source and is the one confident finding.** The OBBBA senior bonus deduction is
implemented in Engine B (`computeTaxPlan` L4626–4636) with correct statutory parameters, is absent
from Engine A (`runRothStrategies`, which says so at L3677–3679 and gives a defensible circularity
reason), and is declared **not modelled** by both Field Manual §13 and `METHODOLOGY.md` L120 — while
`METHODOLOGY.md` §5 (L120) repeats that claim. AST census confirms the phase-out arithmetic exists at
exactly two sites, both inside Engine B.

> ⚠ **CORRECTED 2026-08-12, same session.** This paragraph first said `METHODOLOGY.md` L151
> contradicts L120. It does not: L151–154 reads *"neither the ladder nor the comparator models…
> The Taxes tab does model it, so the two tabs differ for any ladder year at or before 2028"* —
> **accurate and complete**. I had read a fragment out of the middle of a negation. §7 is right;
> only §5 and Field Manual §13 are false. `MissingFeatures.md` D-1(b) carries the full correction.

The user-facing disclosure additionally states the *direction* of the supposed omission — "makes
near-term tax projections slightly conservative (overstated)" — which is inverted for 2025–2028. For
a tool whose identity is deliberate pessimism, **it claims pessimism the model does not have.**

**D-2 through D-6 are assessed, not measured.** They were derived from METHODOLOGY §5/§12, Field
Manual §13 and the Phase 2 roll-up, then priced against the product boundary test. Their existence as
disclosed limitations is documented; their size and direction are argued.

Two are worth naming here because they cut against the app's stated design default:

- **D-2** — ordinary drawdown never realizes capital gains, so an appreciated brokerage account is
  spent with no capital-gains tax and no MAGI effect anywhere. Disclosed, consistent across Engines B
  and D — and **optimistic**, which is the wrong direction for this tool.
- **D-3** — an effective flat rate stands in for progressive state schedules. Disclosed, and verified
  correct-as-documented by sub-phase 2E. But it is **not uniformly conservative**: it under-taxes
  high incomes in steep states and over-taxes low ones, so unlike almost every other simplification
  here it can flatter a plan.

**What Section D did not do: a systematic sweep for undisclosed gaps.** D-6 (IRMAA SSA-44
life-changing-event relief) is the only candidate surfaced, and it is deliberately left **unranked
and flagged for verification**, because manifest item 7 records this project asserting "undisclosed"
wrongly after checking two places — *"'Undisclosed' requires looking everywhere."* I did not look
everywhere, and the document says so rather than implying coverage it does not have.

**One item was also left explicitly unassessed** rather than dismissed: state estate and inheritance
tax. Thresholds in some states are low enough to reach this audience, and the Roth solve-for grid
already ranks by "after-tax estate," so it is not obviously outside the drawdown frame. It needs
pricing by a later session.

---

## 4. Honest scope report

| Section | Status |
|---|---|
| **E — architectural issues** | **Covered.** Test-suite health, duplication, hard-coded law-dependent constants and sunsets, cross-engine consistency, and the version-identity standing requirement all reached. |
| **E — not reached** | Structural review of the 12,151-line file (component decomposition, state management, render cost); `DOCS_HTML` internals; the `validation/` ↔ `qa/` relationship. |
| **D — missing taxation features** | **Partial.** One item verified to source; five assessed; no systematic undisclosed-gap sweep. |

The Phase 3 brief said it is better to cover one section thoroughly and say so than to skim both.
Section E is the thorough one — partly because the session opened on the `t19` pin question, which is
E-shaped, and the evidence gathered there generalised. **Section D should be re-run**, with the
undisclosed-gap sweep as its explicit objective, before the top-five summary is written.

---

## 5. Where this leaves the plan

⚠ **SUPERSEDED — see the v5.49 re-pin box at the top of this document.** This table was accurate at
v5.29 and is wrong at v5.49 in two rows: Phase 4 is **done**, and the top-five capstone is
**written**. Left as originally recorded rather than edited in place, so that what changed stays
visible.

| Phase | Sections | Status (as recorded at v5.29) |
|---|---|---|
| 1 | A + B — creator exposure, PII | ✅ v5.10.1 |
| 2 | C — numerical validation | ✅ complete (`AUDIT_2E_STATE_AND_PHASE2_ROLLUP.md`) |
| **3** | **D + E** | **E ✅ · D ◐ partial — this document** |
| 4 | F — usability, desktop + small screen | ⬜ not started ← **wrong at v5.49** |

**The two-paragraph top-five summary is not written here.** Per the session brief it comes after
Phase 4 — and on this session's evidence it should also wait for Section D to be completed, since two
of the strongest candidates for that list (D-1's false disclosure and E-2's un-alarmed 2028 fuse) are
two halves of the same OBBBA problem, and D's sweep may surface more of it.

**Correction to carry forward.** The session brief states *"Every pin in the project is currently
flipped. If you find yourself writing a new one, it is genuinely new."* That is **not true** at
v5.29 — `t19` L73 and L100 are unflipped `rel c` pins for a release that shipped as v5.26. The brief
was right that no *new* pin was needed; it was wrong that none was outstanding.

**No fixes were made in this session.** Fixes get scoped and built afterwards, one release at a time,
as Phase 2's did.
