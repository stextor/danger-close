// t19 — ENGINE D (Withdrawal projection), module-level.
//
// WHY THIS SUITE EXISTS. Engine D was hoisted to module level at v5.23. Before that it computed
// inside the component body and was observable only through the rendered DOM, which prints every
// figure $K-rounded — the ±$500 ceiling in STOP-REPORT-EngineBC-render-precision.md.
//
// It also exists because of a finding made DURING the v5.23 build: the existing suite does not
// witness Engine D at all. A +10% inflation perturbation inside the engine moves totalDrawn by
// $50,320 and BOTH t4 (90 checks) and t12 (23 checks) still pass. Engine D has therefore never had
// discriminating coverage. This suite is the first.
//
// SECTION B carries three dated [KNOWN DEFECT] pins (OPERATIONS §D): they assert TODAY'S WRONG
// behaviour, so they pass now and FAIL the moment releases (b)/(c) fix it. That flip is the fix's
// own verification.
//
// usage: node t19_engineD_exact.mjs
import { readFileSync } from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const { __g: g } = await import("./app_testable.mjs");

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const $ = (n) => "$" + Math.round(n).toLocaleString();

console.log("t19 \u2014 ENGINE D (module-level)\n");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — the hoist itself: reachable, and shaped as the render expects
// ─────────────────────────────────────────────────────────────────────────────
console.log("A. Hoist \u2014 reachability and contract");

ck("computeWithdrawalPlan is exported at module level",
   typeof g.computeWithdrawalPlan === "function", typeof g.computeWithdrawalPlan);

const ARGS = { retireYear: 2027, rothAmount: 70000, scenarioPreset: "base" };
const r = g.computeWithdrawalPlan(ARGS);

// The 17 names the Withdrawal tab's JSX destructures. If this set changes, the render breaks —
// so this is the contract between the engine and its only consumer.
const CONTRACT = ["_dobAYr","_horizonYr","_ladderEnd","_rmdAgeA_w","_rmdAgeB_w","_rmdStartYr",
  "_rothInit","_taxInit","_tlW","_tradInit","_wInfl","avgWR","growth","phaseColor","schedule",
  "totalConverted","totalDrawn"];
const keys = Object.keys(r).sort();
ck(`returns exactly the ${CONTRACT.length} keys the JSX consumes`,
   keys.length === CONTRACT.length && CONTRACT.every(k => k in r),
   `got ${keys.length}: ${keys.join(", ")}`);

ck("schedule is a non-trivial year array", Array.isArray(r.schedule) && r.schedule.length > 10,
   `${r.schedule && r.schedule.length} rows`);
ck("engine is deterministic \u2014 two calls return identical totals",
   Math.round(g.computeWithdrawalPlan(ARGS).totalDrawn) === Math.round(r.totalDrawn));
ck("engine is pure w.r.t. its parameters \u2014 a different rothAmount moves totalConverted",
   Math.round(g.computeWithdrawalPlan({ ...ARGS, rothAmount: 0 }).totalConverted)
     !== Math.round(r.totalConverted));

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — [KNOWN DEFECT] pins, dated 2026-08-11
// Governing scope: SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md (releases b and c)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nB. [KNOWN DEFECT] pins \u2014 dated 2026-08-11, flipped by releases (b) and (c)");

const P0 = JSON.parse(JSON.stringify(g.PORTFOLIO()));
const oaTotal = (P0.otherAccounts || []).reduce((t, a) => t + (a.balance || 0), 0);

// ── B-1 · every dollar of otherAccounts is treated as taxable, to the dollar.
// On the example household that is $147,000, of which $90,000 is NAMED traditional IRA
// (Rollover IRA (A) $70K + Traditional IRA (A) $20K) and $15,000 is an HSA.
// Source: _taxInit = Math.max(0, PORTFOLIO.household - PORTFOLIO.total401k).
// RELEASE (c) FIXES THIS \u2014 this assertion must then FAIL and be replaced.
ck("[KNOWN DEFECT 2026-08-11 | rel c] Engine D taxable pot == otherAccounts total, to the dollar",
   Math.round(r._taxInit) === Math.round(oaTotal),
   `_taxInit ${$(r._taxInit)} vs otherAccounts ${$(oaTotal)}`);

// ── B-2 · misclassified money never enters MAGI as tradDraw.
//
// ⚠ REWORDED 2026-08-11 (v5.24). This pin previously read "Engine D magi omits
// drawFromTaxable" and was tagged `rel b`, instructing the next session to ADD
// drawFromTaxable to magi. That would introduce a defect, not fix one:
//   * drawFromTaxable is a withdrawal from a TAXABLE BROKERAGE account. It is mostly
//     return of basis; only realized gain is income, and at preferential rates. Adding
//     the whole draw to MAGI would tax returned principal as ordinary income.
//   * The source already says so at the line (v5.24 L4161-4162), and Engine B agrees:
//     computeTaxPlan sets capGains_y = 0, "conservatively 0 unless a sale is modeled."
//     Neither engine models realized gains. That is a disclosed, consistent simplification.
// So the magi expression is CORRECT and must stay as it is. What is wrong is the
// CLASSIFICATION feeding it: _taxInit swallows every otherAccounts dollar (pin B-1), so
// money that ought to be traditional is spent as brokerage and therefore never enters MAGI
// as tradDraw. Fixing the classification is release (c); the magi expression needs no edit.
//
// The assertion below is unchanged and still passes — only its label and reasoning were wrong.
// This finding has now been stated wrongly four times across three documents; if you are
// about to "fix" magi, read SCOPE_ENGINE_D_MAGI_v5_24.md §1 before touching anything.
// RELEASE (c) CHANGES THIS \u2014 when the pot is classified, re-point this pin at tradDraw.
const SRC = readFileSync("../DangerClose.jsx", "utf8");
const magiLine = SRC.split("\n").find(l => /const magi\s*=/.test(l) && /streamsOrd_y/.test(l));
ck("source: the Engine D magi expression was located", !!magiLine);
ck("[KNOWN DEFECT 2026-08-11 | rel c] misclassified pot never reaches MAGI (magi correctly excludes brokerage draws)",
   !!magiLine && !/drawFromTaxable/.test(magiLine),
   magiLine && magiLine.trim().slice(0, 110));
ck("...and it does name the components it DOES count (guards against a renamed variable)",
   !!magiLine && /rmd_y/.test(magiLine) && /conv_y/.test(magiLine) && /pen_y/.test(magiLine));

// ── B-3 · named traditional IRA money inside otherAccounts never reaches the balance
// RMDs are computed on. Perturb the named IRA and watch where the money lands.
//
// NOTE, and it matters: lifetime RMD *does* move under this perturbation \u2014 but only
// INDIRECTLY, because a larger taxable pot means less traditional drawdown, leaving a
// larger traditional balance at RMD age. The defect is that _tradInit itself is
// untouched. An earlier statement of this pin ("the $90K IRA produces no RMD anywhere")
// was wrong as an assertion and would have failed; corrected 2026-08-11.
// RELEASE (c) FIXES THIS \u2014 this assertion must then FAIL and be replaced.
const P1 = JSON.parse(JSON.stringify(P0));
const namedIRA = (P1.otherAccounts || []).find(a => /Rollover IRA/i.test(a.label || a.name || ""));
ck("fixture: the example household has a NAMED traditional IRA inside otherAccounts",
   !!namedIRA, "not found");
if (namedIRA) {
  const BUMP = 100000;
  namedIRA.balance += BUMP;
  P1.household = (P1.household || 0) + BUMP;
  g.setPortfolio(P1);
  const after = g.computeWithdrawalPlan(ARGS);
  // PIN FLIPPED AT v5.26 — this is the fix's own verification. The two assertions below are the
  // EXACT INVERSE of what stood here through v5.25, when adding $100K to a named IRA left the
  // pre-tax basis untouched and the money was spent as already-taxed cash.
  ck("[FIXED v5.26, was KNOWN DEFECT] +$100K of NAMED IRA now RAISES _tradInit by exactly $100K",
     Math.round(after._tradInit - r._tradInit) === BUMP,
     `${$(r._tradInit)} -> ${$(after._tradInit)}`);
  ck("[FIXED v5.26] ...and the Priority-1 pool still grows by it, because the DRAW ORDER is unchanged",
     Math.round(after._taxInit - r._taxInit) === BUMP,
     `delta ${$(after._taxInit - r._taxInit)}, expected ${$(BUMP)}`);
  // The distinction that makes the two compatible: the money is still SPENT first, but it is no
  // longer spent TAX-FREE. Releases (a)-(c) never moved this money; they changed what it costs.
  ck("[FIXED v5.26] the extra IRA also raises the RMD basis by $100K (it is Traditional)",
     Math.round(after._tradInit - r._tradInit) === BUMP);
  g.setPortfolio(P0);
  const restored = g.computeWithdrawalPlan(ARGS);
  ck("fixture restored \u2014 figures return to baseline",
     Math.round(restored._taxInit) === Math.round(r._taxInit) &&
     Math.round(restored.totalDrawn) === Math.round(r.totalDrawn));
}

console.log(`\nt19 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
