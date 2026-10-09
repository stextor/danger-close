// t44 — THE IRMAA TOP TIER STARTS AT ITS THRESHOLD (C-1), ONE TIER RULE FOR EVERY ENGINE
// (docs/SCOPE_IRMAA_TOP_TIER.md; added for v5.78). Runs on BOTH legs:
//     node t44_irmaa_top_tier.mjs v577   |   node t44_irmaa_top_tier.mjs v578   [module path, for the controls]
//
// THE LAW. 42 U.S.C. §1395r(i)(3)(C)(i)(III), read at the source on 2026-09-25: tiers 1–4 are "more than X but NOT MORE
// THAN Y"; the fourth is "more than $160,000 but LESS THAN $500,000"; the top is "AT LEAST $500,000". Clause (ii): joint
// amounts double, except the last row, which is 150% ($750,000). §1395r(i)(5)(C): the $500,000 is frozen through 2027 and
// indexed from 2028. So a MAGI of exactly the top threshold is in the TOP tier. Through v5.77 every engine picked the tier
// with `magi <= threshold` everywhere, so that MAGI was billed in tier 4 (C-1: $580/person/yr under, optimistic).
//
// THE ORACLE (`tierLaw`) is written here from the statute's wording. Its threshold ARITHMETIC is the app's disclosed
// projection (2%/yr proxy for CPI-U, top tier frozen through 2027, unrounded — D-2 declined rounding, recorded as C-13); the
// part under test is the COMPARISON, which is the law's.
//
// ⚠ THE EXACTNESS TRAP. "Exactly at the threshold" means bit-for-bit. Thresholds such as 750,000 × 1.02^4 are not round,
//   and a pension entered monthly may not reproduce them ×12: measured at the build, a naive joint case landed a hair UNDER
//   the 2029 threshold and a hair OVER the 2031 one, so it would have passed on the broken build. `exactMonthly` searches for
//   a monthly figure whose ×12 IS the threshold, and every exact case first ASSERTS the engine's MAGI equals it — a case that
//   cannot be placed fails loudly instead of passing quietly.
//
// ⚠ ENGINE A'S SOLVER LOOP (v5.77 L4451, inside the taxable-sale funding solver) cannot practically be placed on a threshold.
//   It is covered by the helper sweep (A) and by the parser check that it calls the helper and nothing else compares (E).
//
// GATED PER LEG (OPERATIONS §B2): the v577 leg pins C-1 as a dated [KNOWN DEFECT 2026-09-25] — the before/after witness.
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2];
const KNOWN_VERSIONS = ["v577", "v578", "v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = VER === "v578" || VER === "v579" || VER === "v580" || VER === "v581" || VER === "v582" || VER === "v583" || VER === "v584" || VER === "v585" || VER === "v586" || VER === "v587" || VER === "v588" || VER === "v589" || VER === "v590" || VER === "v591" || VER === "v593" || VER === "v594" || VER === "v595" || VER === "v596" || VER === "v597" || VER === "v598";
const MODPATH = process.argv[3] || `./app_${VER}.mjs`;
const mod = await import(MODPATH);
const G = mod.__g, E = mod.__engines;
const EXAMPLE = JSON.parse(JSON.stringify(G.PORTFOLIO()));

let pass = 0, fail = 0; const fails = [];
const T = (name, got, exp) => { const ok = typeof exp === "number" ? Math.abs(got - exp) < 0.005 : got === exp;
  if (ok) pass++; else { fail++; fails.push(`  \u2717 ${name}: got ${got}  exp ${exp}`); } };
const OK = (name, cond, detail = "") => { if (cond) pass++; else { fail++; fails.push(`  \u2717 ${name}${detail ? " — " + detail : ""}`); } };
console.log(`t44 — THE IRMAA TOP TIER STARTS AT ITS THRESHOLD (${VER})`);

const SGL = [109000, 137000, 171000, 205000, 500000, Infinity], MFJ = [218000, 274000, 342000, 410000, 750000, Infinity];
const SUR = [0, 1150, 2880, 4620, 6360, 6940];
const thrOf = (uppers, i, PY) => uppers[i] * Math.pow(1.02, i === 4 ? Math.max(0, PY - 2027) : PY - 2026);
const tierLaw = (magi, uppers, PY) => {                 // "not more than" for tiers 1–4, "at least" for the top
  for (let i = 0; i < 5; i++) { const t = thrOf(uppers, i, PY); if (i === 4 ? magi < t : magi <= t) return i; }
  return 5;
};
const exactMonthly = (THR) => {                         // a monthly figure m with m * 12 === THR, bit for bit
  let m = THR / 12;
  for (let k = 0; k < 400 && m * 12 !== THR; k++) m = m * 12 < THR ? m + Number.EPSILON * m : m - Number.EPSILON * m;
  return m * 12 === THR ? m : null;
};
T("0-1 the constants this suite hand-derives from match the app's", JSON.stringify([G.IRMAA_CONSTS().SGL, G.IRMAA_CONSTS().MFJ, G.IRMAA_CONSTS().SUR]),
  JSON.stringify([SGL, MFJ, SUR]));

// ── A · the shared helper against the statute, at, below and above every threshold ─────────────────────────────────
const H = G.irmaaTierFor;
if (POST) {
  OK("A-0 irmaaTierFor is exported by this build", typeof H === "function");
  if (typeof H === "function") {   // absent → A-0 fails and the sweep is skipped, rather than the suite dying
  let cells = 0, bad = 0, ex = "";
  for (const [lab, ups] of [["SGL", SGL], ["MFJ", MFJ]]) for (const PY of [2026, 2027, 2028, 2029, 2033, 2046])
    for (let i = 0; i < 5; i++) { const t = thrOf(ups, i, PY);
      for (const m of [t - 1, t - 0.01, t, t + 0.01, t + 1]) { cells++;
        const got = H(m, ups, PY, 2026), exp = tierLaw(m, ups, PY);
        if (got !== exp) { bad++; if (!ex) ex = `${lab} PY${PY} tier${i} magi ${m}: ${got} vs ${exp}`; } } }
  T(`A-1 the helper = the statute at ±$1, ±1¢ and EXACTLY at every threshold (${cells} cells, single and joint, frozen and indexed years)`, bad, 0);
  T("A-2 at exactly the frozen top threshold (single, premium year 2027, $500,000): TOP tier", H(500000, SGL, 2027, 2026), 5);
  T("A-3 …and $1 under: tier 4", H(499999, SGL, 2027, 2026), 4);
  T("A-4 at exactly a lower threshold (single tier 1, premium year 2026, $109,000): stays STANDARD", H(109000, SGL, 2026, 2026), 0);
  }
} else {
  OK("A-0 [pre-v5.78] no shared tier-selection helper on this build (three private loops)", typeof H === "undefined");
}

// ── B · every engine at exactly the top threshold ──────────────────────────────────────────────────────────────────
// Engine A: the audit probe's household (MAGI = pension, 2026, billed in premium year 2028: 510,000 / 765,000 — both exact
// in floating point, and their monthly figures 42,500 / 63,750 are exact too).
G.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const baseA = (o) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2028, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1955, dobBYr: 1955, survivor: "A", deathYr1: 2099, ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0,
  currentConv: 0, tradInit: 0, rothInit: 0, tradInitA: 0, rothInitA: 0, tradInitB: 0, rothInitB: 0, taxableInit: 0, ...o });
const irmA = (magi, joint) => G.runRothStrategies(baseA({ single: !joint, pen: magi / 12 })).find(r => r.key === "none").totIrmaa;
T("B-0 the 2028 top thresholds are exact in floating point (500,000 × 1.02, 750,000 × 1.02)", `${thrOf(SGL, 4, 2028)}/${thrOf(MFJ, 4, 2028)}`, "510000/765000");
T(`B-1 Engine A, single, MAGI exactly $510,000${POST ? ": top tier, $6,940" : " [KNOWN DEFECT 2026-09-25, C-1]: tier 4, $6,360"}`, irmA(510000, false), POST ? 6940 : 6360);
T(`B-2 Engine A, joint, MAGI exactly $765,000${POST ? ": top tier, 2 × $6,940" : " [KNOWN DEFECT C-1]: 2 × $6,360"}`, irmA(765000, true), POST ? 13880 : 12720);
T("B-3 control: single $509,999 → tier 4 on every leg", irmA(509999, false), 6360);
T("B-4 control: single $510,001 → top tier on every leg", irmA(510001, false), 6940);
// Engine C: t17's purpose-built household (MAGI = pension; rows from the example's 2029 retirement).
const BASE = JSON.parse(JSON.stringify(EXAMPLE));
const buildC = (monthly, single) => { const P = JSON.parse(JSON.stringify(BASE));
  Object.assign(P, { positions: [], otherAccounts: [], single, lifeExpA: 95, lifeExpB: 95,
    incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const z = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  P.incomeSources = { ssA: { ...z }, ssB: { ...z }, pension: { amount: monthly } };
  G.applyLoadedData({ portfolio: P }); const tl = G.PLAN_TIMELINE();
  return E.computeIrmaaPlan({ retireYear: tl.targetRetireYear, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }); };
const rowC = (THR, single, Y) => { const m = exactMonthly(THR); if (m == null) return null; return buildC(m, single).rows.find(r => r.yr === Y); };
// Not every threshold CAN be reproduced: one step in the monthly figure moves ×12 by more than one step in the product, so
// some values are unreachable (measured at the build: joint top in 2029 and 2031, two of eight lower thresholds in 2031).
// So each case takes the first MAGI year from 2029 whose threshold IS placeable, and asserts that one was found.
const placeC = (ups, i, single, from = 2029) => { for (let Y = from; Y <= 2050; Y++) { const THR = thrOf(ups, i, Y + 2), r = rowC(THR, single, Y);
  if (r && r.magi === THR) return { Y, THR, r }; } return null; };
for (const [lab, ups, single, persons] of [["single", SGL, true, 1], ["joint", MFJ, false, 2]]) for (const from of [2029, 2034]) {
  const c = placeC(ups, 4, single, from);
  OK(`B-5 Engine C ${lab}: a MAGI bit-for-bit equal to the top threshold can be placed (search from ${from})`, !!c);
  if (c) {
    T(`B-6 Engine C ${lab} ${c.Y} at exactly the top threshold ${c.THR}: tier${POST ? "" : " [KNOWN DEFECT C-1]"}`, c.r.tier, POST ? 5 : 4);
    T(`B-7 Engine C ${lab} ${c.Y}: surcharge`, c.r.surchargeAnnual, (POST ? SUR[5] : SUR[4]) * persons);
  }
}

// ── C · nothing else moves ──────────────────────────────────────────────────────────────────────────────────────────
// C-1: every LOWER threshold, exactly, stays in the lower tier on every leg ("not more than") — the fix must not leak down.
{ let placed = 0, stayed = 0;
  for (const [ups, single] of [[SGL, true], [MFJ, false]]) for (let i = 0; i < 4; i++) {
    const c = placeC(ups, i, single);
    if (c) { placed++; if (c.r.tier === i) stayed++; } }
  T("C-1 exactly at each of the eight lower thresholds (single and joint): all placed bit-for-bit, all stay in the lower tier", `${placed}/${stayed}`, "8/8"); }
// C-2: D-1 — headroom. Tiers 1–4 are "not more than", so adding exactly the headroom stays in the tier; from tier 4 the top
// is "at least", so the most a household can add and stay is one dollar less (v5.78). A lower tier is unchanged.
{ const T4 = thrOf(SGL, 4, 2033), r4 = rowC(T4 - 1000, true, 2031);
  T(`C-2 headroom from tier 4, $1,000 under the top threshold: ${POST ? "$999 (D-1)" : "$1,000 [pre-v5.78]"}`, r4.headroom, POST ? 999 : 1000);
  const T2 = thrOf(SGL, 1, 2033), r1 = rowC(T2 - 1000, true, 2031);
  T("C-3 headroom from tier 1, $1,000 under its upper threshold: $1,000 on every leg", r1.headroom, 1000);
  T("C-4 control: that tier-4 row is in tier 4 and that tier-1 row in tier 1", `${r4.tier}/${r1.tier}`, "4/1"); }
// C-5: the example household never nears the top tier, so it cannot move: its largest projected MAGI is far below it.
{ const X = JSON.parse(JSON.stringify(EXAMPLE)); G.applyLoadedData({ portfolio: X });
  const RY = G.PLAN_TIMELINE().targetRetireYear, A = { retireYear: RY, rothAmount: 0, qcdAnnual: 0, taxYield: 0, scenarioPreset: "base" };
  const S = G.withdrawalPlanSeries(A), C = E.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr });
  const mx = Math.max(...C.rows.map(r => r.magi));
  OK("C-5 the example household's largest IRMAA-tab MAGI is under half the joint top threshold (it cannot move)", mx < 375000, `max ${Math.round(mx)}`);
  T("C-6 and its lifetime IRMAA is the same on every leg (measured)", Math.round(C.totalIrmaa), 0); }

// ── D · the label (DOM) ─────────────────────────────────────────────────────────────────────────────────────────────
if (!process.argv[3]) {
  const { window } = await import("./env_dom.mjs");
  window.storage = { async get(k) { throw new Error("none"); }, async set(k, v) { return { key: k, value: v }; },
                     async delete(k) { return { key: k, deleted: true }; }, async list() { return { keys: [] }; } };
  console.error = () => {}; console.warn = () => {};
  require(`./dom_${VER}.cjs`); const React = require("react");
  const body = () => window.document.body; const el = window.document.createElement("div"); body().appendChild(el);
  const { root, act, DangerClose } = window.__mount(el);
  const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} };
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush(); await flush();
  await click([...body().querySelectorAll("button.tab")].find(b => /^irmaa$/i.test(b.textContent.trim()))); await flush(); await flush();
  const txt = body().textContent || "";
  OK("D-0 the IRMAA tab rendered its tier table (MFJ)", /IRMAA TIERS \(MFJ\)/.test(txt));
  if (POST) { OK("D-1 the top row reads ≥ $750K (\"at least\")", txt.includes("≥ $750K")); OK("D-2 and no row reads > $750K", !txt.includes("> $750K")); }
  else OK("D-1 [KNOWN DEFECT C-1] the top row reads > $750K", txt.includes("> $750K"));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

// ── E · structural, by parser: one tier-selection rule ──────────────────────────────────────────────────────────────
// A comparison whose right side is a call to irmaaThresholdFor IS a tier selection. From v5.78 only irmaaTierFor may make one.
{ const { Parser } = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const src = readFileSync(join(HERE, MODPATH.replace(/^\.\//, "").replace(/\.mjs$/, ".jsx")), "utf8");
  const ast = Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true });
  const where = []; const calls = [];
  const fnName = (anc) => { for (let k = anc.length - 1; k >= 0; k--) { const n = anc[k];
      if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && /Function/.test(n.init.type)) return n.id.name;
      if (n.type === "FunctionDeclaration" && n.id) return n.id.name; } return "<module>"; };
  // A threshold may be compared directly, or stored first (`const thr = irmaaThresholdFor(...)`) and compared — v5.78's own
  // helper does the latter, and a first draft of this check saw only the former, so it found NO comparison at all.
  const held = new Set();
  walk.ancestor(ast, { VariableDeclarator(n, _s, anc) { if (n.id.type === "Identifier" && n.init && n.init.type === "CallExpression"
      && n.init.callee.name === "irmaaThresholdFor") held.add(`${fnName(anc)}:${n.id.name}`); } }, { ...walk.base, JSXElement: () => {}, JSXFragment: () => {} });
  walk.ancestor(ast, {
    BinaryExpression(n, _s, anc) { if (!/^[<>]=?$/.test(n.operator)) return; const f = fnName(anc), R = n.right;
      if ((R.type === "CallExpression" && R.callee.name === "irmaaThresholdFor") || (R.type === "Identifier" && held.has(`${f}:${R.name}`)))
        where.push(`${f}@L${n.loc.start.line}`); },
    CallExpression(n, _s, anc) { if (n.callee.name === "irmaaTierFor") calls.push(fnName(anc)); } }, { ...walk.base, JSXElement: () => {}, JSXFragment: () => {} });
  if (POST) {
    OK("E-1 only irmaaTierFor compares a MAGI against an irmaaThresholdFor result (a private tier loop fails here)",
      where.length > 0 && where.every(w => w.startsWith("irmaaTierFor@")), where.join(", "));
    T("E-2 Engine A calls the helper twice (billing and the sale solver)", calls.filter(c => c === "run").length, 2);
    T("E-3 Engine C's tierForMagi calls it", calls.filter(c => c === "tierForMagi").length, 1);
  } else {
    T("E-1 [pre-v5.78] three private tier-selection comparisons", where.length, 3);
  }
  const lbl = /t\.magiUpper === Infinity \? `(≥|>) \$\$\{/.exec(src);
  T("E-4 the tier table's top-row label, in source", lbl ? lbl[1] : "(not found)", POST ? "≥" : ">"); }

console.log(fails.join("\n"));
console.log(`\nt44 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
