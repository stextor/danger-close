# STOP AND REPORT — the Engine B/C jsdom render cannot produce dollar-exact figures

**Build:** v5.10.2 · `DangerClose-v5_10_2.jsx` md5 `7ddda3585abb9dc2c40fa4fbfc46967a`
**Prior:** v5.10.1 · md5 `2ee4d1e5d0f06fa89ee6980fd97984bc`
**Date:** 2026-08-08 · **Task:** stand up the Engine B/C jsdom render (owed from 2A, 2B; blocker for 2C's C-2C-3)
**Trigger for stopping:** ground rule — *"If mid-build evidence contradicts the scope's premise, STOP and
report rather than adapting silently."*

---

## 1. The render is standing up and validated. That part worked.

| Step | Result |
|---|---|
| Freshness check (manifest ↔ md5 ↔ CHANGELOG) | **PASSED**, hashes as above |
| Flat working tree (`DangerClose.jsx`, `v5102.jsx`, `v5101.jsx` + flat `qa/`) | built; root sources hash-verified against manifest |
| `npm i esbuild react react-dom d3 xlsx mammoth jsdom` | installed |
| `mk_testable.sh v5102` / `v5101` → `app_*.mjs` | built |
| `esbuild dom_entry_v5102.jsx → dom_v5102.cjs` | built (4,021,773 bytes; the `eval` warning is the expected shim) |
| **Environment validation: `t9_dom_smoke.mjs v5102`** | **14 passed, 0 failed** |
| Engine B (Taxes tab) renders in jsdom | **yes** — detail panel reachable, per-year selection works |
| Engine C (IRMAA tab) renders in jsdom | **yes** (t9 confirms) |

Both traps were honored: `Math.random` seeded **before** the bundle import, and
`globalThis.URL.createObjectURL` stubbed (not just `window.URL`).

**So the blocker is not the render. It is the precision of what the render emits.**

---

## 2. The contradicted premise

2A and 2B recorded the Engine B / Engine C figures as *"owed via a jsdom render"* — i.e. the premise was
that rendering these engines would let their figures be read **to the dollar**, the Section C standard.

**That premise is false.** Engine B and Engine C never emit dollar-resolution numbers to the DOM. Every
displayed figure is divided by 1000 and rounded, in both the summary grid and the per-year detail panel.

### Source evidence (v5.10.2, read this session)

| Site | Code | Granularity |
|---|---|---|
| Engine B main grid | L8386 `${Math.round(r.grossTaxableAll / 1000)}K` | $1,000 |
| Engine B detail rows (incl. `rmdTax_y`) | L8441 `${Math.round((x.val ?? x.full) / 1000)}K` | $1,000 |
| Engine B detail gross | L8446 `${Math.round(sel.grossTaxableAll / 1000)}K` | $1,000 |
| Engine B selected-year total tax | L8486 `${Math.round(sel.totalTax / 1000)}` | $1,000 |
| Engine C MAGI | L8666+ `${Math.round(r.magi / 1000)}` | $1,000 |
| Engine C headroom | L8666+ `${Math.round(r.headroom / 1000)}` | $1,000 |
| Engine C surcharge | L8666+ `${(r.surchargeAnnual / 1000).toFixed(1)}` | $100 |

`toLocaleString` appears **nowhere** in the Engine B render region (L8262–8500) — there is no exact-value
formatting path in these tabs. Additionally, the main grid has **no RMD column at all**; `rmd_y` /
`rmdTax_y` surface only in the detail panel, at $1K granularity.

### Empirical confirmation (live jsdom render, not inspection)

Rendered detail panel, example household, year 2029:

> DETAIL — 2029 (ages 65/63) · MFJ … → SS taxable portion **$13K** · Pension **$5K** · Spouse B earned
> income **$20K** · Roth conversion **$70K** · Gross taxable **$108K** · Standard deduction **−$34K** ·
> Senior deduction (65+) **−$2K** · Net taxable income **$72K** · Federal income **$8K** · FICA **$2K**

Every value $K-rounded, exactly as the source predicts.

### Why the shim cannot rescue it
`shim.txt` exports **module-level** bindings, and `mk_testable.sh` **appends** it to a test-only copy of the
source. Engines B and C are computed **inside the component body** (Engine B at L8120–8259, its `rows`
array local to that scope), so there is no module-level binding to export. The existing instrumentation
mechanism genuinely cannot reach these rows. There is also no CSV/XLSX export of the tax schedule to read
exact values from (`XLSX.utils` appears only on the import/parse path, L2126).

**Net effect:** as things stand, Engine A (`runRothStrategies`) is dollar-exact testable because it is a
module-level function; Engines B and C are testable only to ±$500 (and Engine C surcharge to ±$50).

---

## 3. Why I did not adapt silently

Three adaptations were available and all were rejected as scope-premise changes that are Steve's call:

1. **Silently redefine "verified" to $1K tolerance** — would let 2A/2B/2C claim Engine B/C "verified"
   at a precision the audit's own standard forbids. Section C says arithmetic to the dollar.
2. **Add a test hook to the shipped source** (`window.__taxRows = rows`) — app source change for test
   purposes; crosses "engines untouched" and "no unreviewed code ships."
3. **Splice a hook into the test-only copy** (extend `mk_testable.sh` to inject an assignment inside the
   component, the way the shim is appended) — technically the strongest route and it never touches shipped
   bytes, but it is a **new harness capability** that changes how the suite instruments the app, and it
   needs a reliable in-component anchor. Not something to invent mid-session unreviewed.

---

## 4. Options (recommendation stated)

**Option 1 — $1K-tolerance DOM verification of Engines B/C.** Accept the DOM's granularity; assert to
±$500. *Pro:* no new machinery; verifies exactly what the user actually sees; would still catch C-2C-3 if
the cross-engine RMD divergence is material (a survivor-year RMD gap would run to thousands). *Con:* not
dollar-exact — every finding must be labelled ±$500, and sub-$500 errors stay invisible.

**Option 2 — extend `mk_testable.sh` to splice a test-only rows hook.** *Pro:* true dollar-exactness for
B/C; shipped source untouched; reusable for 2D/2E and every future audit. *Con:* a real harness change
needing its own scope + an anchor that survives future edits; more session budget.

**Option 3 — independent re-derivation.** Reimplement B/C arithmetic in the test from source and compare
against the $K DOM. *Pro:* no source or harness change. *Con:* weakest — largely tests my reimplementation
against itself, and the $K comparison is still ±$500.

**Recommendation: Option 1 now, Option 2 as its own scoped harness task later.** C-2C-3's open question is
*materiality*, and a ±$500 test answers it: if the engines diverge, a survivor-year RMD gap will be far
larger than $500, and if they agree within $500 the finding is immaterial by construction. That resolves
2C honestly without inventing harness machinery mid-session. Option 2 is worth doing on its own merits —
it would upgrade 2A and 2B's owed items from "±$500" to genuinely dollar-exact — but it deserves a scope
document, not an improvised splice.

Whichever you pick, **2A and 2B must be amended**: their Engine B/C items are not "pending a render," they
are *"verifiable only to ±$500 by DOM"* (Option 1) or *"pending a harness capability"* (Option 2). Leaving
them worded as owed renders would imply a dollar-exact check is merely queued, which is now known to be false.

---

## 5. State left behind

Working tree `/home/claude/dc` is built and validated (t9 14/14). **No source was modified. No shipped
artifact was produced. No test file was changed.** `explore_engineB.mjs` and `dump_detail.mjs` are scratch
(neither-category, per §G) and are not proposed for the repo or knowledge. Nothing here changes the release
posture: Phase 2 documents, it does not fix.
