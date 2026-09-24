// t42 — A SINGLE HOUSEHOLD IS NOT PAID SPOUSE B'S SOCIAL SECURITY (C-7)
// (SCOPE_SINGLE_HOUSEHOLD_SPOUSE_B_SS; added for v5.76). Runs on BOTH legs:
//     node t42_single_spouse_b_ss.mjs v575   |   node t42_single_spouse_b_ss.mjs v576
//
// THE RULE. Social Security retirement benefits belong to the worker who earned them (42 U.S.C.
// §402(a)). A single household has no spouse B, so there is no spouse-B benefit to pay. v5.75 already
// said so at 12 of 25 `getSSB()` call sites and in both in-app save paths; v5.76 puts the rule in the
// getter itself (D-1), stops the loader inventing a $1,300/mo benefit for a single plan with no spouse-B
// block (D-3), and shows a one-line note when a single plan carries a stored figure it ignores (D-2c).
//
// THE HOUSEHOLD is the shipped example made single (retirement 2029, base preset, no conversions).
// "Correct" is the same household with spouse B's benefit zeroed: a single household's figures must
// not depend on a spouse-B figure at all, so the zeroed case IS the statutory answer, and every
// assertion below compares against it TO THE DOLLAR, not to a tolerance.
//
// HAND CHECKS, worked independently of the engine (2035, single, correct case):
//   Withdrawal plan: draw needed = spending 113,186 − (SS 46,573 + pension 4,800) = 61,813.
//     v5.75 paid the phantom spouse-B benefit that year (18,347), so it drew 61,813 − 18,347 = 43,466.
//   Taxes tab: provisional income 4,800 + 42,146.09 (Traditional draw) + ½ × 39,600 = 66,746.09;
//     taxable SS = 0.85 × (66,746.09 − 34,000) + 4,500 = 32,334.17 (under the 0.85 × 39,600 cap);
//     deduction 16,100 × 1.02^9 = 19,241 + age-65 extra 2,050 × 1.02^9 = 2,450 (bonus expired 2028);
//     taxable income 79,280.26 − 21,691 = 57,589.26, in the 12% band (10% top 12,400 × 1.02^9 = 14,819.15)
//     -> 1,481.92 + 0.12 × 42,770.11 = 6,614.33.
//
// ⚠ MONTE CARLO SEEDING TRAP. The simulation's market noise comes from `d3.randomNormal`, and d3
//   captures its own reference to Math.random WHEN IT LOADS. Replacing Math.random after the import
//   seeds only half the randomness; identical runs then differ by ~$3,000 and a comparison reads noise
//   as signal (a first measurement for this scope was contaminated exactly so). The resettable seeded
//   source below is installed BEFORE the app module is imported, and M-0 asserts the harness itself is
//   deterministic before any Monte Carlo comparison is trusted.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v575", "v576"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v576";

// resettable seeded source, installed BEFORE the import (see the seeding trap above)
const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(1); const _realRandom = Math.random; Math.random = () => _src();
const mod = await import(process.argv[3] || `./app_${VER}.mjs`);
const G = mod.__g, E = mod.__engines;

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp) => { const ok = typeof exp === "number" ? Math.abs(got - exp) < 0.005 : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); } };
console.log(`t42 — SINGLE HOUSEHOLD, SPOUSE-B SOCIAL SECURITY (${VER})`);

const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const RY = G.PLAN_TIMELINE().targetRetireYear;
const A = { retireYear: RY, rothAmount: 0, qcdAnnual: 0, taxYield: 0, scenarioPreset: "base" };
const sum = (r, k) => r.reduce((s, x) => s + (x[k] || 0), 0);
const load = (edit) => { const P = JSON.parse(JSON.stringify(BASE)); edit(P); G.applyLoadedData({ portfolio: P }); };
const STORED = P => { P.single = true; };
const ZEROED = P => { P.single = true; P.incomeSources.ssB.planned = 0; for (const k in P.incomeSources.ssB.tableByAge || {}) P.incomeSources.ssB.tableByAge[k] = 0; };
const NOBLOCK = P => { P.single = true; delete P.incomeSources.ssB; };
const MARRIED = P => {};
const figures = () => {
  const D = G.computeWithdrawalPlan(A).schedule, S = G.withdrawalPlanSeries(A);
  const B = E.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows;
  const C = E.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows || [];
  const pp = G.runMonteCarlo(RY, 50).plannedPath;
  _src = mulberry(2026); const arr = G.runMonteCarlo(RY, 800).results;
  const med = Math.round(arr.map(x => x[x.length - 1]).sort((a, b) => a - b)[arr.length >> 1]);
  const d35 = D.find(x => x.yr === 2035), b35 = B.find(x => x.yr === 2035);
  return { ssB: Math.round(sum(D, "ssB_y")), draws: Math.round(sum(D, "totalDraw")), end: Math.round(D[D.length - 1].portfolioTotal),
           fed: Math.round(sum(B, "fedTax")), irmaa: Math.round(sum(C, "surchargeAnnual")), pp: Math.round(pp[pp.length - 1]), med,
           d35need: Math.round(d35.drawNeeded), d35ssB: Math.round(d35.ssB_y), b35fed: Math.round(b35.fedTax * 100) / 100 };
};

// ── M-0 · the harness is deterministic, or no Monte Carlo line below means anything ──────────────
load(ZEROED); const z1 = figures(), z2 = figures();
T("M-0 the seeded Monte Carlo harness is deterministic (two identical runs agree to the dollar)", z1.med, z2.med);

// ── A · the correct case, and the hand checks ────────────────────────────────────────────────────
const OK = z1;
T("A-1 2035 Withdrawal plan: draw needed = 113,186 - (46,573 + 4,800), no spouse-B income", OK.d35need, 61813);
T("A-2 2035 Taxes tab: federal tax by hand (see header)", OK.b35fed, 6614.33);

// ── B · a single household WITH a stored spouse-B benefit ────────────────────────────────────────
load(STORED); const st = figures();
if (POST) {
  T("B-1 spouse-B SS paid over the plan", st.ssB, 0);
  for (const k of ["draws", "end", "fed", "irmaa", "pp", "med", "d35need"])
    T(`B-2 ${k}: identical to the correct case`, st[k], OK[k]);
  T("B-3 D-2: the stored value is LEFT in the plan (not silently cleared)", G.PORTFOLIO().incomeSources.ssB.planned, 1300);
} else {
  // v5.75, pinned as dated known defects. Every error runs optimistic.
  T("B-1 [KNOWN DEFECT pre-v5.76] Withdrawal plan pays spouse B's SS to a single household", st.ssB, 308076);
  T("B-2 [KNOWN DEFECT pre-v5.76] spending draws understated by 301,146", st.draws, 767892);
  T("B-3 [KNOWN DEFECT pre-v5.76] ending portfolio overstated by 427,269", st.end, 1807137);
  T("B-4 [KNOWN DEFECT pre-v5.76] Taxes tab lifetime federal understated by 38,916 (via v5.74's bridge)", st.fed, 105390);
  T("B-5 [KNOWN DEFECT pre-v5.76] Monte Carlo planned path overstated by 62,007", st.pp, 2128443);
  T("B-6 [KNOWN DEFECT pre-v5.76] Monte Carlo seeded median overstated", st.med, 1948298);
  T("B-7 [KNOWN DEFECT pre-v5.76] 2035: 61,813 - 18,347 of phantom spouse-B SS", st.d35need, 43466);
}

// ── C · a single household's plan with NO spouse-B block (the natural shape) ────────────────────
load(NOBLOCK);
if (POST) {
  T("C-1 D-3: loads with spouse-B benefit 0, not the married placeholder", G.PORTFOLIO().incomeSources.ssB.planned, 0);
  T("C-2 and not flagged as example data (it is the correct value)", !!G.PORTFOLIO().incomeSources.ssB.isDefault, false);
  T("C-3 getSSB() is 0", G.getSSB(), 0);
  const nb = figures(); T("C-4 spouse-B SS paid", nb.ssB, 0); T("C-5 draws identical to the correct case", nb.draws, OK.draws);
} else {
  T("C-1 [KNOWN DEFECT pre-v5.76] the loader INVENTS a $1,300/mo spouse-B benefit", G.PORTFOLIO().incomeSources.ssB.planned, 1300);
  T("C-3 [KNOWN DEFECT pre-v5.76] getSSB() is 1300", G.getSSB(), 1300);
}

// ── D · the married example household is untouched by this release (the control) ───────────────
load(MARRIED); const mar = figures();
T("D-1 married: spouse-B SS still paid", mar.ssB, 284676);
T("D-2 married: draws", mar.draws, 1469176);
T("D-3 married: lifetime federal", mar.fed, 208445);
T("D-4 married: Monte Carlo planned path", mar.pp, 2128443);
T("D-5 married: getSSB() returns the stored benefit", G.getSSB(), 1300);

// ── X · EXTINCTION: no single-household output depends on ANY stored spouse-B figure ──────────
// Defect class: any read of spouse B's benefit, anywhere, that skips the single test. The sweep varies
// the stored benefit AND its table, so a future unguarded read — through getSSB() or straight off the
// data — shows up here even if it is not one of today's 25 call sites.
if (POST) {
  const sweep = [0, 1300, 4000].map(v => { load(P => { P.single = true; P.incomeSources.ssB.planned = v;
    for (const k in P.incomeSources.ssB.tableByAge || {}) P.incomeSources.ssB.tableByAge[k] = v; }); return figures(); });
  for (const k of ["ssB", "draws", "end", "fed", "irmaa", "pp", "med"])
    T(`X-1 sweep ${k}: identical for stored spouse-B benefit 0 / 1,300 / 4,000`, (sweep[0][k] === sweep[1][k] && sweep[1][k] === sweep[2][k]) ? 1 : 0, 1);
  // D-2: switching the plan back to married restores the stored figure — it was never lost
  load(P => { P.single = false; }); T("X-2 D-2: back to married, the stored benefit is paid again", G.getSSB(), 1300);
}
Math.random = _realRandom;

// ── N · the on-screen note (D-2c), rendered ──────────────────────────────────────────────────────
// Mounted exactly as t37 boots (example data -> the main view), then the plan is replaced and the
// view re-rendered by switching tab. The note must appear for a single plan carrying a stored
// spouse-B figure, and must NOT appear for the married example or a single plan without one.
// A mutated module (argv[3]) has no DOM bundle of its own unless the controls pass one in T42_DOM.
if (POST && (!process.argv[3] || process.env.T42_DOM)) {
  const { window } = await import("./env_dom.mjs");
  window.storage = { async get(k) { throw new Error("none"); }, async set(k, v) { return { key: k, value: v }; },
                     async delete(k) { return { key: k, deleted: true }; }, async list() { return { keys: [] }; } };
  console.error = () => {}; console.warn = () => {};
  require(process.env.T42_DOM || `./dom_${VER}.cjs`); const React = require("react"); const W = window.__g;
  const body = () => window.document.body;
  const el = window.document.createElement("div"); body().appendChild(el);
  const { root, act, DangerClose } = window.__mount(el);
  const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} };
  const tabBtn = (n) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === n);
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush(); await flush();
  const NOTE = /is not used in any calculation/;
  // ⚠ The note reads PORTFOLIO (a module global) at render, so the view must genuinely re-render: click
  // a DIFFERENT tab and then another. Clicking the tab already showing changes no state, React skips
  // the render, and the previous note stays on screen — which is how N-4 first failed on a stale DOM.
  const rerender = async () => { await click(tabBtn("taxes")); await flush(); await click(tabBtn("dashboard")); await flush(); };
  const WB = JSON.parse(JSON.stringify(W.PORTFOLIO()));
  T("N-1 married example: no note", NOTE.test(body().textContent || ""), false);
  { const P = JSON.parse(JSON.stringify(WB)); P.single = true; W.applyLoadedData({ portfolio: P }); await rerender(); }
  T("N-2 single plan carrying a stored spouse-B figure: the note is shown", NOTE.test(body().textContent || ""), true);
  T("N-3 and it names the ignored figure", /\$1,300\/mo\) is not used/.test(body().textContent || ""), true);
  { const P = JSON.parse(JSON.stringify(WB)); P.single = true; delete P.incomeSources.ssB; W.applyLoadedData({ portfolio: P }); await rerender(); }
  T("N-4 single plan with no spouse-B block: no note (nothing is being ignored)", NOTE.test(body().textContent || ""), false);
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

console.log(`t42 SUITE (${VER}): ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
process.exit(fail ? 1 : 0);
