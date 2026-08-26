# SCOPE_FIX_docs_v5_39.md — documentation-correctness release

| Field | Value |
|---|---|
| Pinned build | **v5.38** · `src/DangerClose.jsx` md5 **`b8d12481b55cd2ed05c6c6f14e2f41d9`** (verified against pool, repo clone, and manifest §A2 this session) |
| Target release | **v5.39** |
| Class | **Presentation-only.** No engine change, no constant change, no modeling change. Parity must stay **8/8**. |
| Source of findings | `UsabilityFlaws.md` (Section F, Phase 4) — F-10…F-19 |
| Date | 2026-08-18 |
| Status | ✅ **RETIRED 2026-08-26 by the scope-retirement sweep.** **BUILT AND SHIPPED AT v5.39** (2026-08-18) — the release titled *"Field Manual correctness: a callout that never rendered, a table that lost a column, and six undocumented skins."* Its premise names the same three items the release fixed. ⚠ Retired late; it read *"Do not build"* about work already shipped. Kept as the record of how the work was scoped and built — **nothing here is outstanding; do not treat it as pending work.** |

---

## 1. Premise — verified this session, not carried over

Every claim below was re-verified against v5.38 by decoding the `DOCS_HTML` literal (L3593) to the
**exact runtime bytes the iframe receives** and querying those bytes, plus reading the app's own
registries. This matters because Section F's findings were themselves partly wrong on first pass (see
that document's §A errata), so nothing here is trusted on the strength of having been written down before.

| # | Claim | Verification |
|---|---|---|
| F-11 | §13's "In plain English" callout is over-escaped one level too deep, so the runtime HTML carries literal backslashes, the class never applies, and the callout renders unstyled | Decoded runtime contains **9** correct `class="plain"` + **9** correct `class="lbl"`, and **exactly 2** attributes carrying literal backslashes (`class=\"plain\"`, `class=\"lbl\"`) — one broken pair, in §13 |
| F-12a | §05 body text reads "Feeling like **25** is a lot?" under the heading "The 26 Tabs" | 1 hit, exact string |
| F-12b | FIG.1 (§02 SVG) labels the tab box "**25** TABS" | 1 hit |
| F-12c | The hero meta-strip correctly reads "TABS · **26**" | 1 hit — so the manual is internally inconsistent, 26 vs 25 vs 25 |
| F-13 | §14's first FAQ row has **2 cells in a 3-column table** | Row `<tr><td>Will Social Security run out?…</td><td>Reserve depletion is not bankruptcy…</td></tr>` — no third cell; every other row has three |
| F-14 | Glossary TCJA entry says provisions "expire after 2025 unless extended" | Exact text confirmed. Superseded by OBBBA, which **this same manual models in §13** |
| F-15 | Glossary Success Rate says "($500K/$800K/$1.5M here)" | Exact text confirmed. Engine uses **five** thresholds (500K/800K/250K/1.25M/1.5M, L2141–45) |
| F-17 | §07 Docs entry claims the manual is "printable to PDF **from the toolbar** above" | Exact text confirmed. No `window.print` exists; the toolbar downloads HTML and its own hint says *"Download the HTML, open it in your browser, then Print → Save as PDF"* — so the toolbar does not print, it tells you to |
| F-18 | §07 presents "ACA Premium Subsidy" as a `tabentry` tagged `v5.7 · strategy` | Confirmed. No ACA tab exists in the 26-tab array (L5955); the feature lives on the **Roth** tab |
| F-10 | §07's Skins entry never mentions the UI SIZE control | Confirmed absent; control is real (100/115/130/150%, root `zoom` L5808, persisted `danger_close:ui_scale_v1`) |
| **F-19** | **NEW — found while verifying F-10.** The skin registry has drifted ahead of *both* descriptions | App ships **13** skins. Field Manual §07 says **"Seven color palettes"** and names 7. The in-app Skins tab description names **11**. |

### F-19 in detail — why it is the most consequential item here

The app's skin registry holds 13 entries. The Field Manual documents 7 of them. The six it omits are
**High Contrast Light, High Contrast Dark, Midnight Blue, Colorblind-Safe Light, Report, Quiet Dark**.

Three of those six — High Contrast Light, High Contrast Dark, Colorblind-Safe Light — are precisely the
**accessibility** palettes. Section F's highest-severity accessibility finding (F-4: `--ink-faint` at
`fontSize` 8–9 computes **3.88:1** against bg, below the 4.5:1 AA threshold, for a stated 55+ audience)
has real in-app mitigations, and **the manual does not tell anyone they exist.** That is a documentation
defect doing accessibility harm, not a cosmetic count error.

Separately, **Report** and **Quiet Dark** are undocumented in *both* the manual and the in-app
description — they are reachable only by noticing the tiles.

---

## 2. Site census — every location an edit touches

**All edits are string edits inside `src/DangerClose.jsx`.** Two regions:

**(a) Inside `DOCS_HTML` (L3593 — the one-line literal).** Per OPERATIONS §B1, exclude this line from
greps and transforms, and edit by **quote-free anchor**. Note L3593 also contains a `\'` escape (valid
JS, invalid JSON) — decode with a JS evaluator, not `JSON.parse`.

| Finding | Anchor (quote-free) |
|---|---|
| F-11 | the §13 `In plain English` callout — the single over-escaped `plain`/`lbl` pair |
| F-12a | `Feeling like 25 is a lot` |
| F-12b | the FIG.1 SVG text node reading `25 TABS` |
| F-13 | the §14 FAQ row beginning `Will Social Security run out` |
| F-14 | the glossary `TCJA` term |
| F-15 | the glossary `Success Rate` term |
| F-17 | the §07 Docs tabentry sentence containing `printable to PDF` |
| F-18 | the §07 `ACA Premium Subsidy` tabentry heading + tag |
| F-10, F-19a | the §07 `Skins` tabentry, `Seven color palettes` onward |

**(b) Outside `DOCS_HTML` (render copy).**

| Finding | Site |
|---|---|
| F-19b | the in-app Skins tab description beginning `Recolors the whole app` — names 11 of 13 |

**(c) Version bump — four in-app sites, per project instructions.** All verified present at v5.38:

| # | Site | Location |
|---|---|---|
| 1 | DATA LOAD header | L3531 `DATA LOAD │ v5.38` |
| 2 | App footer | L11251 `DANGER CLOSE v5.38 │ Not financial advice…` |
| 3 | Field Manual callsign | inside `DOCS_HTML` — `v5.38 · PUBLIC BUILD` |
| 4 | Field Manual footer | inside `DOCS_HTML` — `v5.38 · documentation regenerated…` |

⚠ **Version-bump tax in the test harness.** `t1_units.mjs` carries a `KNOWN_VERSIONS` registry (L17) and
a `verStr` ternary chain (L222). **Both need a `v539` branch** or t1 fails at load — by design, but it
reads like a broken harness if unexpected.

---

## 3. Tests this release ships with

1. **`t4_dom.mjs` — new EXTINCTION assertion for F-11's defect class.** Assert the **decoded**
   `DOCS_HTML` contains **zero** `\"` sequences inside attribute positions. This is the assertion that
   would have caught F-11 at v5.27 and did not. It must be **negative-controlled**: re-introduce the
   escaping, confirm the assertion fires, revert.
   ⚠ t4's manual checks must read the iframe **`srcdoc` attribute**, not `textContent` — a `textContent`
   read passes vacuously (manifest, `t4` row).
2. **`t4` string assertions** for each corrected string (26 not 25; the three-cell FAQ row; the rewritten
   TCJA, Success Rate, Docs-PDF, ACA and Skins entries), each paired with an **extinction** assertion that
   the *old* wording is gone — the project's standing pattern.
3. **`t1` STATIC** version assertions carry the bump automatically once `v539` is registered.
4. **Full suite green**, both legs, per *nothing ships without the full test suite green*. Parity **8/8**.
5. **Prior-leg gating:** the v538 leg keeps asserting the copy v5.38 is true to; only the v539 leg asserts
   the corrected copy. Same per-leg gating pattern as v5.36's t4.

**Proposed for consideration, not decided:** the headless-Chromium harness recorded in
`UsabilityFlaws.md` §G could render the corrected callout and confirm F-11 visually. It is **not**
proposed as a shipped test — committing it needs its own scope (§5).

---

## 4. Explicitly OUT of scope

- **F-2, F-8, F-6, F-5** — the small-screen mechanics (`overflowX:auto` wrappers, `inputMode="decimal"`).
  These touch render structure, need the DOM suites as proof, and belong to their own release.
- **F-1, F-3, F-4, F-7** — responsive layout, tab strip, contrast pass, resize listener. Product-direction
  decisions, not fixes (see D-8).
- **Any engine, constant, or modeling change.** `METHODOLOGY.md` is therefore **not** updated — the
  project rule is that it updates when a release changes modeling, and this one does not.
- **Section C's 2D break-even half and Section D's gap sweep** — still open; this release does not
  advance them and does not unblock the top-five audit summary.
- **A subject-matter pass over the remaining 79 glossary terms** against external references. Section F
  checked internal consistency and app-mismatch only.

---

## 5. Open decisions — Steve resolves before any build starts

| # | Decision | Notes / my recommendation |
|---|---|---|
| **D-1** | **FIG.1 "25 TABS" — deliberate or stale?** | It may be intentional (26 minus My Data, which is input rather than output). If deliberate, it needs a caption saying so; if not, it goes to 26. §05's "Feeling like 25" is the same question. *Recommend: make both 26 and drop the ambiguity — the meta-strip already says 26.* |
| **D-2** | **TCJA glossary entry — how far to rewrite?** | Minimal: strike "unless extended" and note OBBBA superseded it. Fuller: explain what OBBBA made permanent. *Recommend minimal* — the glossary is a reference, and §13 already carries the modeling detail. |
| **D-3** | **Success Rate entry — list five thresholds or generalise?** | Listing five is accurate but clutters a glossary line. *Recommend generalising* ("several thresholds; the tab labels state which") so it cannot drift again. |
| **D-4** | **F-17 PDF claim — reword or remove?** | The capability exists, just not "from the toolbar." *Recommend rewording* to match the toolbar's own hint (download HTML → open → Print → Save as PDF). |
| **D-5** | **F-18 ACA entry — reclassify or relocate?** | It is a real feature described as a tab that does not exist. *Recommend retitling* to name the Roth tab as its home, keeping the content. |
| **D-6** | **F-19 — how much of the skin drift to fix, and where?** | Options: (a) manual only; (b) manual + in-app description; (c) both, and add a one-line policy note that the descriptions are generated-from/checked-against the registry. *Recommend (b) at minimum*, and I would argue for naming the three accessibility palettes explicitly given F-4. **This is the one item where the in-app copy (region b) is touched — confirm you want that in a "docs-only" release, or defer it.** |
| **D-7** | **F-10 — document UI SIZE in §07?** | One sentence in the Skins entry. *Recommend yes*, folded into D-6's edit since it is the same panel. Note the F-2 interaction: `zoom` at 130–150% makes fixed-px grids overflow sooner, so the sentence should not oversell it as a small-screen fix. |
| **D-8** | **Does this release disclose the small-screen limitation?** | Section F's *disclose-or-fix* point: the app degrades on phones and §13 says nothing. A one-paragraph §13 disclosure would be honest and in-scope for a docs release — **or** you defer it to the mechanics release that actually fixes F-2/F-8. *Recommend deferring*, so the disclosure and the fix land together rather than the manual advertising a flaw that is about to go away. |

---

## 6. Stop conditions

Per *if mid-build evidence contradicts the scope's premise, STOP and report*:

- If any anchor in §2 is **not unique** in the decoded runtime bytes, stop — quote-free anchors inside a
  140,985-byte single-line literal are the highest-risk edit surface in this project.
- If the decoded byte count changes by more than the edits account for, stop and diff.
- If the workspace `DangerClose.jsx` differs from `b8d12481…` at session start, **quarantine and revert**
  before doing anything (the workspace-drift caution — two prior incidents).
- If parity moves off 8/8, stop: a presentation-only release cannot legitimately move it.

---

## 7. Ship checklist (OPERATIONS §A–§N governs; this is the release-specific overlay)

1. §A freshness check first.
2. Edits (a) → (b) → version bump ×4.
3. Sync canonical → `app/src/DangerClose.jsx` before rebuilding the DOM bundle (harness trap).
4. Register `v539` in `t1` (registry + `verStr` chain).
5. Full suite, both legs, parity 8/8; totals **parsed from suite output, never restated**.
6. Hash-verify shipped jsx == canonical == build input.
7. `CHANGELOG.md` newest-first: what changed and why, per-suite test breakdown, and the limitations this
   release does **not** address (F-2/F-8 small-screen, F-4 contrast) — disclosed, not implied complete.
   **No reporter names.**
8. Refresh project knowledge: new source + prior-build roll, and update the `UsabilityFlaws.md` manifest
   row to mark F-10…F-19 closed.
