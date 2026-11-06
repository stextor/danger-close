// t111 — SSA'S SPOUSAL BENEFIT, PAID BY EVERY PROJECTION (D-77; docs/SCOPE_D77_SPOUSAL_BENEFIT_V647.md, DL-1 to DL-7 (a)). NEW at v6.47.
// Both legs.  Run: node t111_spousal.mjs v647   |   node t111_spousal.mjs v646
//
// WHAT WAS WRONG. A spouse whose own benefit at 67 is less than half the other's receives the difference from SSA once both have filed,
// reduced for claiming before 67 (POMS RS 00615.250 / .201). Through v6.46 no projection paid it, and the Social Security tab only warned
// that it was not modeled — for spouse B only (F-36). From v6.47 one module-level rule, `spousalTopUpFor` (and `spousalTopUp(who)`, the
// plan's), and every money path adds it to the spouse's own Social Security by that path's own month rule; the tab shows it on each card.
//
// SECTIONS. §A the source by AST: the helpers; the EXTINCTION census of every getSSA()/getSSB() read and of the spousal additions per money
// path (a new site that pays Social Security without the top-up, or a path whose addition is removed, turns it red); the warning gone.
// §B the helper against `tools/spousal_oracle.mjs` — written here from SSA's rules, exact in integers — on about 420,000 cases.
// §C THE TWIN-PLAN INVARIANT: a spouse with no benefit and a top-up of X, against the same plan with an own benefit of X from the same
// month and no top-up — every projection bit-identical (twin 1: unreduced, from the worker's month; twin 2: reduced, the spouse claiming
// first). §D nothing moves where nothing is owed: the example and every fixture bit-identical to v6.46 in the engines, and their rendered
// tabs identical to v6.46's text except the Social Security tab's three copy changes (masked, one hit a side) and the version.
// §E hand pins. §F the Social Security tab. §G the other figures that sum Social Security. §H the copy.
// The v6.46 leg pins each absence as `[KNOWN DEFECT 2026-11-05, D-77 — flips at v6.47]`.
//
// HARNESS TRAPS (t110's): each plan is stored and the app mounted afresh (the tab's sliders take their ages at mount); text is read by a
// walk with a space between nodes; the prior leg's dump goes through a file from a child process. Engine A's P carries `asOfYr` (its NaN
// trap) and, on this leg, `...spousalTopUpFields()` as its three builders do (§A checks the builders). Exits with process.exit.
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
import { spousalOracle, ym as ymAbs, fraMonth, dobOf } from "./tools/spousal_oracle.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(111); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v647";
const DUMP = process.argv[3] === "--dumpdom";
const KNOWN_VERSIONS = ["v646", "v647", "v648"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v647", "v648"].includes(VER);   // an array, so the next registration widens it
const C_PRIOR = "v646";                // §D's prior leg — a constant, so the registrar cannot widen it
const KD = "[KNOWN DEFECT 2026-11-05, D-77 — flips at v6.47]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const md5 = o => createHash("md5").update(JSON.stringify(o)).digest("hex");
const normVer = t => t.replace(/v6\.4[67]\b/g, "v6.4x").replace(/\bv64[67]\b/g, "v64x");
const SSA = { 62: 0.70, 63: 0.75, 64: 0.80, 65: 0.8667, 66: 0.9333, 67: 1.0, 68: 1.08, 69: 1.16, 70: 1.24 };
const table = pia => Object.fromEntries(Object.entries(SSA).map(([a, f]) => [a, Math.round(pia * f)]));
const ben = (fra, age) => { const m = (age - 67) * 12; if (m < 0) { const me = -m; const red = me <= 36 ? me * (5 / 9) / 100 : 36 * (5 / 9) / 100 + (me - 36) * (5 / 12) / 100;
  return Math.round(fra * (1 - red)); } return m > 0 ? Math.round(fra * (1 + m * (2 / 3) / 100)) : fra; };

// ── the plans ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const withSS = (k, b) => P => { const Q = clone(P); Q.incomeSources = { ...Q.incomeSources, [k]: b }; return Q; };
const both = (a, b, extra = {}) => P => { const Q = { ...clone(P), ...extra }; Q.incomeSources = { ...Q.incomeSources, ssA: a, ssB: b }; return Q; };
const SHAPES = {   // §0.4's (the scope's hand pins), plus F-36's neighbours
  noSSB: withSS("ssB", { tableByAge: {}, planned: 0, plannedAge: 63 }),
  noSSB_claim67: withSS("ssB", { tableByAge: {}, planned: 0, plannedAge: 67 }),
  smallB: withSS("ssB", { tableByAge: { 62: 700, 63: 750, 64: 800, 65: 867, 67: 1000, 70: 1240 }, planned: 750, plannedAge: 63 }),
  smallB_70: withSS("ssB", { tableByAge: { 62: 700, 63: 750, 64: 800, 65: 867, 67: 1000, 70: 1240 }, planned: 1240, plannedAge: 70 }),
  noSSA: withSS("ssA", { tableByAge: {}, planned: 0, plannedAge: 67 }),
  bothZero: both({ tableByAge: {}, planned: 0, plannedAge: 67 }, { tableByAge: {}, planned: 0, plannedAge: 63 }),
  missingB: P => { const Q = clone(P); delete Q.incomeSources.ssB; return Q; },   // the loader's placeholder: no top-up (DL-7 (a))
};
// §C's twins: [name, plan 1 (no benefit, a top-up), plan 2 (an own benefit of that amount from that month, none)]
const A3300 = age => ({ tableByAge: table(3300), planned: table(3300)[age], plannedAge: age });
const TWINS = [
  ["1a", "twin 1 — the example's dates (A 69, B 67: Jan 2033)", both(A3300(69), { tableByAge: {}, planned: 0, plannedAge: 67 }), both(A3300(69), { tableByAge: { 67: 1650 }, planned: 1650, plannedAge: 67 }), 1650],
  ["1b", "twin 1 — A younger (A born 1968 at 65, B at 67: Jan 2033)", both(A3300(65), { tableByAge: {}, planned: 0, plannedAge: 67 }, { dobA: "1968-01-01" }),
    both(A3300(65), { tableByAge: { 67: 1650 }, planned: 1650, plannedAge: 67 }, { dobA: "1968-01-01" }), 1650],
  ["1c", "twin 1 — July birthdays (A 69, B 67: Jul 2033)", both(A3300(69), { tableByAge: {}, planned: 0, plannedAge: 67 }, { dobA: "1964-07-15", dobB: "1966-07-15" }),
    both(A3300(69), { tableByAge: { 67: 1650 }, planned: 1650, plannedAge: 67 }, { dobA: "1964-07-15", dobB: "1966-07-15" }), 1650],
  ["1d", "twin 1 — the mirror (A with none at 67, B at 65: Jan 2031)", both({ tableByAge: {}, planned: 0, plannedAge: 67 }, { tableByAge: table(1800), planned: table(1800)[65], plannedAge: 65 }),
    both({ tableByAge: { 67: 900 }, planned: 900, plannedAge: 67 }, { tableByAge: table(1800), planned: table(1800)[65], plannedAge: 65 }), 900],
  // B (born 1 Jan 1966) reaches 67 in December 2032; the top-up starts in A's month, January 2031: 23 months early, 1,650 × 121/144 = $1,386.46
  ["2a", "twin 2 — B claims first (B 63, A 67: from Jan 2031, reduced)", both(A3300(67), { tableByAge: {}, planned: 0, plannedAge: 63 }),
    both(A3300(67), { tableByAge: { 67: 1650 }, planned: 1386, plannedAge: 65 }), 1386],
  // July: B (born 15 Jul 1966) reaches 67 on 14 July 2033; from A's month, July 2031: 24 months, 1,650 × 120/144 = $1,375
  // A (born 1 Jan 1968) files for nothing at 62 in January 2030; B files at 65 in January 2031, so A's top-up starts then — 47 months before A's
  // December 2034: 900 × (180 − 11)/240 = 633.75 → $634. The review: no twin had spouse A's top-up reduced or starting after A's own filing.
  ["2c", "twin 2 — the mirror, A files first (A 62, B 65: from Jan 2031, reduced)", both({ tableByAge: {}, planned: 0, plannedAge: 62 }, { tableByAge: table(1800), planned: table(1800)[65], plannedAge: 65 }, { dobA: "1968-01-01" }),
    both({ tableByAge: { 67: 900 }, planned: 634, plannedAge: 63 }, { tableByAge: table(1800), planned: table(1800)[65], plannedAge: 65 }, { dobA: "1968-01-01" }), 634],
  ["2b", "twin 2 — July birthdays (B 63, A 67: from Jul 2031)", both(A3300(67), { tableByAge: {}, planned: 0, plannedAge: 63 }, { dobA: "1964-07-15", dobB: "1966-07-15" }),
    both(A3300(67), { tableByAge: { 67: 1650 }, planned: 1375, plannedAge: 65 }, { dobA: "1964-07-15", dobB: "1966-07-15" }), 1375],
];
const DOM_TABS = ["income", "ss", "grade", "ranking", "dashboard", "survivor", "taxes", "exit plan", "my data", "what breaks", "backtest", "roth", "withdrawal", "irmaa", "ask ai"];
const TWIN_TABS = ["roth", "backtest", "what breaks"];

// ── the rendered app (t110's mount: every plan stored, then a fresh mount) ────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.confirm = () => true;
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i);
    if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const mountApp = async ver => {
  require(`./dom_${ver}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  let root = null, act, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const textOf = node => { const w = window.document.createTreeWalker(node, window.NodeFilter.SHOW_TEXT); let out = "";
    while (w.nextNode()) { const p = w.currentNode.parentNode; if (p && (p.nodeName === "STYLE" || p.nodeName === "SCRIPT")) continue; out += " " + w.currentNode.nodeValue; }
    return out.replace(/\s+/g, " "); };
  const text = () => textOf(body());
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], JSON.stringify(v));
  const settle = async () => { let t0 = text(); for (let i = 0; i < 20; i++) { await flush(100); const t1 = text(); if (t1 === t0) break; t0 = t1; } return t0; };
  window.localStorage.clear(); await render();
  await click([...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  // the tab's content: the page's `.card` elements (the header's retirement selector and its Monte Carlo medians are outside them)
  const cards = () => [...body().querySelectorAll(".card")].map(textOf).join(" | ");
  const visit = async (P, tabs) => { await unmount(); window.localStorage.clear(); put("portfolio", P); put("expenses", DX0); _src = mulberry(111); await render();
    if (btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/));
    const out = {}; for (const t of tabs) { _src = mulberry(111); const b = tabBtn(t); if (!b) { out[t] = "(no tab)"; continue; } await click(b); await flush(150); await settle(); out[t] = cards(); }
    return out; };
  return { DG, DP0, DX0, visit, unmount };
};
const masks646 = [   // §D: the Social Security tab's three copy changes (scope §1.4), each bound to one hit a side
  [/Spouse B ?'s spousal benefit \(50% of Spouse A ?'s FRA = \$ ?[\d,]+ ?\) is at or below Spouse B ?'s own FRA amount \(\$ ?[\d,]+ ?\) — own benefit applies ?\./g, "«SPOUSAL-LINE»"],
  [/Undiscounted, today's-dollar arithmetic on your entered life expectancies; spousal top-up benefits \(up to 50% of the other's FRA amount\) are not modeled and can favor earlier claiming for a much-lower earner\. The 81-cell grid below scores every combination jointly; SSA\.gov is the authority\. Descriptive math, not advice\./g, "«BREAKEVEN-NOTE»"],
  [/spousal top-up benefits \(up to 50% of the other's FRA amount\) are not modeled ?, which understates some claim-early-for-the-lower-earner strategies;/g, "«GRID-LIMIT»"],
];
const masks647 = [
  [/SSA ?'s spousal benefit: none — each of you has an own benefit at 67 of at least half the other's\./g, "«SPOUSAL-LINE»"],
  [/Undiscounted, today's-dollar arithmetic on your entered life expectancies, on Spouse B ?'s own record only: SSA's spousal benefit, which the cards above show where SSA pays one, is not part of this comparison\. The 81-cell grid below scores every combination jointly, spousal benefits included; SSA\.gov is the authority\. Descriptive math, not advice\./g, "«BREAKEVEN-NOTE»"],
  [/SSA's spousal benefit is counted at each cell's ages while both of you are alive, from the year of the later filing \(it earns no delayed credits\);/g, "«GRID-LIMIT»"],
];
const mask = (t, ms) => { const hits = ms.map(([re]) => (t.match(re) || []).length); let o = t; for (const [re, r] of ms) o = o.replace(re, r); return { t: o, hits }; };

const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const D_PLANS = ["example", ...Object.keys(HOUSEHOLDS).map(n => `fixture ${n}`)];
const dPlan = (nm, P0) => nm === "example" ? clone(P0) : (() => { const Q = clone(P0); HOUSEHOLDS[nm.slice(8)].apply(Q); return Q; })();

if (DUMP) {
  const app = await mountApp(VER), out = {};
  for (const nm of D_PLANS) out[nm] = await app.visit(dPlan(nm, app.DP0), DOM_TABS);
  await app.unmount();
  writeFileSync(process.argv[4], JSON.stringify(out));
  process.exit(0);
}

const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines, TT = M.__test;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);
// a site's key: its top-level function, and inside the component the tab (`activeTab === "x" &&`) it renders under
const keyOf = anc => { let top = "<top>", tab = "";
  for (const a of anc) {
    if (top === "<top>") { if (a.type === "FunctionDeclaration" && a.id) top = a.id.name; else if (a.type === "VariableDeclaration" && a.declarations[0] && a.declarations[0].id.type === "Identifier") top = a.declarations[0].id.name; }
    if (a.type === "LogicalExpression" && a.operator === "&&") { const m = /activeTab === "([a-z]+)"/.exec(SRCOF(a.left)); if (m) tab = m[1]; }
  } return tab ? `${top} › ${tab}` : top; };
const tally = list => list.reduce((o, r) => { const k = keyOf(r.anc); o[k] = (o[k] || 0) + 1; return o; }, {});
const eqMap = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

// The negative controls' switches (qa/tools/controls_v647_spousal.py), never the suite's: T111_SECTIONS=A,C runs only the sections named, and
// T111_CONTROLS_SKIP_DDOM skips §D's rendered comparison (about two thirds of the run). runsuite.sh sets neither.
const ON = x => !process.env.T111_SECTIONS || process.env.T111_SECTIONS.split(",").includes(x);
const SKIP = x => console.log(`     (§${x}: skipped by T111_SECTIONS — the controls' switch)`);
let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T111_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 1500) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t111 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t111 — SSA'S SPOUSAL BENEFIT, PAID BY EVERY PROJECTION (${VER})`);

// ── §A · the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source");
if (!ON("A")) SKIP("A"); else {
  const decl = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
  const callsIn = (fn, name) => fn ? all(fn, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name).length : 0;
  if (POST) {
    const F = decl("spousalTopUpFor"), U = decl("spousalTopUp"), AA = decl("spousalTopUpAtAges"), OFF = decl("_spousalOff");
    T("A-1 the rule is module-level: spousalTopUpFor (pure), and spousalTopUp and spousalTopUpAtAges each through it and the one guard, _spousalOff",
      !!F && !!U && !!AA && !!OFF && callsIn(U, "spousalTopUpFor") === 1 && callsIn(AA, "spousalTopUpFor") === 1 && callsIn(U, "_spousalOff") === 1 && callsIn(AA, "_spousalOff") === 1);
    T("A-1b the guard: a single plan, and the loader's placeholder block (`isDefault`, DL-7 (a))", !!OFF && /\.single/.test(SRCOF(OFF)) && /isDefault/.test(SRCOF(OFF)));
  } else T(`A-1 ${KD}: there is no spousal rule in the source`, !decl("spousalTopUpFor") && !/spousalTopUp/.test(SRC));
  // EXTINCTION (1): every read of a spouse's own benefit — getSSA() / getSSB() — by site. A new site is not in the table and turns this red.
  const reads = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && ["getSSA", "getSSB"].includes(n.callee.name) && n.arguments.length === 0);
  const R646 = { runMonteCarlo: 4, runExtendedMC: 4, computeIrmaaPlan: 2, computeWithdrawalPlan: 2, computeTaxPlan: 2, DangerCloseMain: 4,
    "DangerCloseMain › income": 3, "DangerCloseMain › ss": 3, "DangerCloseMain › grade": 2, "DangerCloseMain › ranking": 2, "DangerCloseMain › roth": 6,
    "DangerCloseMain › dashboard": 4, "DangerCloseMain › backtest": 2, "DangerCloseMain › whatbreaks": 2, "DangerCloseMain › survivor": 2, "DangerCloseMain › stress": 2 };
  // v6.47 adds three readers, each a spousal one: the plan's helper (own, for the delayed-credit offset), the tab's note, and My Data's line
  const R647 = { ...R646, "DangerCloseMain › ss": 5, spousalTopUp: 2, MyDataEditor: 2 };
  const got = tally(reads);
  T(`A-2 EXTINCTION: the census of getSSA()/getSSB() reads, by site, is ${POST ? "v6.47's" : "v6.46's"} — a new reader of a spouse's benefit is a new site to decide (${reads.length})`,
    eqMap(got, POST ? R647 : R646), JSON.stringify(got));
  // EXTINCTION (2): the spousal additions per money path — each path adds the top-up where it pays the own benefit, counted by call.
  const HELP = /^(spousalTopUp|spousalTopUpFor|spousalTopUpAtAges|spousalTopUpsAt|spousalTopUpsSteady|spousalTopUpFields|spousalTopUpYear|spousalEligible|_topMq|_topXq|_topAY|_topIY)$/;
  const adds = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && HELP.test(n.callee.name));
  const A647 = {
    runMonteCarlo: 6, runExtendedMC: 6, runRothStrategies: 2, computeIrmaaPlan: 4, computeWithdrawalPlan: 4, computeTaxPlan: 4,
    DangerCloseMain: 3, "DangerCloseMain › exitplan": 1,   // rothSolve's P (1) and Ask AI (2); the Exit Plan (1)
    "DangerCloseMain › roth": 6, "DangerCloseMain › backtest": 3, "DangerCloseMain › whatbreaks": 4,
    "DangerCloseMain › income": 3, "DangerCloseMain › ss": 9, "DangerCloseMain › grade": 1, "DangerCloseMain › ranking": 1,
    "DangerCloseMain › dashboard": 2, "DangerCloseMain › survivor": 1, "DangerCloseMain › taxes": 2,
    spousalTopUp: 1, spousalTopUpAtAges: 1, spousalTopUpsAt: 1, spousalTopUpsSteady: 2, spousalTopUpFields: 2, MyDataEditor: 1,
  };
  if (POST) T(`A-3 EXTINCTION: the spousal additions, counted per money path and display — a path whose addition is removed, or a new one, turns this red`,
    eqMap(tally(adds), A647), JSON.stringify(tally(adds)));
  else T(`A-3 ${KD}: no path adds a spousal top-up`, adds.length === 0);
  // Engine A: its P builders — every object literal carrying ssAYr — spread the plan's fields; its own sums read them.
  const builders = all(AST, n => n.type === "ObjectExpression" && n.properties.some(p => p.key && p.key.name === "ssAYr"));
  const spread = builders.filter(b => b.n.properties.some(p => p.type === "SpreadElement" && /spousalTopUpFields\(/.test(SRCOF(p))));
  const RRS = decl("runRothStrategies"), rrsSrc = RRS ? SRCOF(RRS) : "";
  if (POST) T(`A-4 Engine A's three P builders spread spousalTopUpFields (${spread.length} of ${builders.length}), and its annualSSA/annualSSB read P.topA / P.topB`,
    builders.length === 3 && spread.length === 3 && /annualSSA = yr => \(\(.*_topAY\(P\.topA, yr\)/.test(rrsSrc) && /annualSSB = yr => \(\(.*_topAY\(P\.topB, yr\)/.test(rrsSrc));
  else T(`A-4 ${KD}: Engine A's builders carry no top-up (${builders.length} builders)`, builders.length === 3 && spread.length === 0);
  // no "half the worker's benefit" arithmetic outside the rule: `0.5 *` a figure, or a figure `/ 2`, on a spouse's benefit at 67
  const halves = all(AST, n => n.type === "BinaryExpression" && ((n.operator === "*" && [n.left, n.right].some(x => x.type === "Literal" && x.value === 0.5)) || (n.operator === "/" && n.right.type === "Literal" && n.right.value === 2))
    && /ssFraOf|FRA|piaW|piaS|fra[AB]\b/.test(SRCOF(n)));
  const hWhere = halves.map(h => { const f = [...h.anc].reverse().find(a => a.type === "FunctionDeclaration"); return f ? f.id.name : keyOf(h.anc); });
  if (POST) T(`A-5 half a benefit is taken only in the rule (spousalTopUpFor, spousalEligible) and the tab — its note, which prints it, and its "none is owed" test (${hWhere.join(", ")})`,
    hWhere.length === 5 && hWhere.filter(w => w === "spousalTopUpFor").length === 1 && hWhere.filter(w => w === "spousalEligible").length === 1 && hWhere.filter(w => w === "DangerCloseMain").length === 3);
  else T(`A-5 ${KD}: the tab takes half of A's benefit for the warning (${hWhere.join(", ")})`, hWhere.includes("DangerCloseMain"));
  const W = /SPOUSAL BENEFIT NOT MODELED/.test(SRC), C1 = /spousal top-up benefits[^.]{0,80}not modeled/.test(SRC);
  if (POST) T("A-6 the warning and every \"spousal top-up … not modeled\" line are gone from the source, the Field Manual included", !W && !C1);
  else T(`A-6 ${KD}: the warning says the spousal benefit is not modeled`, W && C1);
}

// ── §B · the rule against the oracle ─────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the rule against SSA's");
if (!ON("B")) SKIP("B"); else if (POST) {
  const F = g.spousalTopUpFor;
  const DOBS = [{ year: 1964, month: 1, day: 1 }, { year: 1964, month: 1, day: 15 }, { year: 1964, month: 7, day: 1 }, { year: 1964, month: 7, day: 15 }];
  const PIAS = Array.from({ length: 17 }, (_, i) => i * 250);
  const offs = [...[62, 63, 64, 65, 66, 67, 68, 69, 70].map(a => a * 12), 64 * 12 + 5, 67 * 12 + 7];   // whole ages and two odd months
  let n = 0; const bad = [];
  for (const dob of DOBS) { const b0 = ymAbs(dob.year, dob.month), fra = fraMonth(dob);
    for (const piaW of PIAS) for (const piaS of PIAS) for (const oS of offs) for (const oW of offs) {
      const ymS = b0 + oS, ymW = b0 + oW;
      const natural = piaS > 0 ? Math.round(piaS * (ymS < fra ? 1 - (Math.min(fra - ymS, 36) * 5 / 900 + Math.max(0, fra - ymS - 36) * 5 / 1200) : 1 + (ymS - fra) * 2 / 300)) : 0;
      for (const ownS of [natural, piaS, Math.round(piaS * 1.24)]) {
        n++; const a = F({ piaW, piaS, ownS, dobS: dob, ymS, ymW }), o = spousalOracle({ piaW, piaS, ownS, dobS: dob, ymS, ymW });
        if (a.monthly !== o.monthly || (a.monthly > 0 && a.ym !== o.start)) { if (bad.length < 5) bad.push(JSON.stringify({ piaW, piaS, ownS, dob, ymS, ymW, app: a, oracle: o })); }
      } } }
  T(`B-1 the rule equals SSA's on PIA pairs $0–$4,000 by $250 × 11 claim months each side × 4 dates of birth (the 1st and the 15th, January and July) × 3 own benefits (${n.toLocaleString()} cases)`, bad.length === 0, bad.join(" | "));
  let n2 = 0; const bad2 = []; const dob = { year: 1966, month: 1, day: 1 }, b0 = ymAbs(1966, 1);
  for (const [piaW, piaS] of [[3300, 0], [3300, 1000], [2001, 500], [1999, 999]]) for (let oS = 62 * 12; oS <= 70 * 12; oS++) for (const oW of [62 * 12, 66 * 12 + 11, 67 * 12, 69 * 12 + 3]) {
    n2++; const a = F({ piaW, piaS, ownS: piaS, dobS: dob, ymS: b0 + oS, ymW: b0 + oW }), o = spousalOracle({ piaW, piaS, ownS: piaS, dobS: dob, ymS: b0 + oS, ymW: b0 + oW });
    if (a.monthly !== o.monthly) bad2.push(`${piaW}/${piaS} S+${oS} W+${oW}: ${a.monthly} vs ${o.monthly}`); }
  T(`B-2 every month from 62 to 70, odd PIAs included ($2,001, $1,999: the half-dollar rounds up) (${n2} cases)`, bad2.length === 0, bad2.slice(0, 4).join(" | "));
  const ex = F({ piaW: 2000, piaS: 400, ownS: 400, dobS: dob, ymS: ymAbs(2033, 1), ymW: ymAbs(2033, 1) });
  T(`B-3 POMS RS 00615.250's example: an unreduced spouse's benefit of $1,000 and an own PIA of $400 → $600 (got ${ex.monthly})`, ex.monthly === 600);
  // born 2 January 1966: 62 throughout January 2028, the first month of entitlement (POMS RS 00201.001), and 67 on 1 January 2033 (20 CFR
  // 404.102) — 60 months. (The build's first rewrite used 1 January and December 2027: SSA pays someone born on the 1st from the birth month.)
  const s62 = F({ piaW: 2000, piaS: 0, ownS: 0, dobS: { year: 1966, month: 1, day: 2 }, ymS: ymAbs(2028, 1), ymW: ymAbs(2028, 1) });
  T(`B-4 at 62 with no own benefit: 32.5% of the worker's PIA (ssa.gov/oact/quickcalc/spouse.html) — $650 on $2,000 (got ${s62.monthly})`, s62.monthly === 650);
  const m = y => F({ piaW: 2000, piaS: 0, ownS: 0, dobS: dob, ymS: y, ymW: y }).monthly;
  T(`B-5 20 CFR 404.102: born 1 January 1966, 67 is reached in December 2032 — unreduced from then, one month short in November (got Nov ${m(ymAbs(2032, 11))}, Dec ${m(ymAbs(2032, 12))})`,
    m(ymAbs(2032, 12)) === 1000 && m(ymAbs(2032, 11)) === Math.round(1000 * 143 / 144));
  const late = F({ piaW: 2000, piaS: 0, ownS: 0, dobS: dob, ymS: ymAbs(2034, 1), ymW: ymAbs(2034, 1) });
  T(`B-6 no delayed credits on the spousal benefit: claimed at 68, still $1,000 (got ${late.monthly})`, late.monthly === 1000);
  const drc = F({ piaW: 3000, piaS: 1000, ownS: 1240, dobS: dob, ymS: ymAbs(2036, 1), ymW: ymAbs(2031, 1) });
  T(`B-7 delayed credits on the own benefit offset it (RS 00615.694): $500 excess less $240 of credits → $260 (got ${drc.monthly})`, drc.monthly === 260);
  const w0 = F({ piaW: 3000, piaS: 0, ownS: 0, dobS: dob, ymS: ymAbs(2029, 1), ymW: ymAbs(2033, 6) });
  T(`B-8 deemed filing: from the worker's month when the spouse filed first (got ${w0.ym === ymAbs(2033, 6) ? "June 2033" : w0.ym})`, w0.ym === ymAbs(2033, 6) && w0.monthly === 1500);
} else T(`B-1 ${KD}: there is no rule to test`, typeof g.spousalTopUpFor !== "function");

// ── the engines, on the loaded plan (t108's runAll, Engine A's P as its builders make it) ─────────────────────────────────────────────
const runAll = (G, Eng, roth, pre, R) => {
  const tl = G.PLAN_TIMELINE(), Pl = G.PORTFOLIO(), rsb = G.retireStartBalances(R);
  const ser = G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  const B = Eng.computeTaxPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
  const C = Eng.computeIrmaaPlan({ retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows;
  const w = G.computeWithdrawalPlan({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  const PO = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R,
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.single ? 0 : tl.dobB.year + tl.lifeExpB), ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB ? tl.dobB.year : tl.dobA.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(), ...(G.spousalTopUpFields ? G.spousalTopUpFields() : {}),
    ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: G.getPension(), penOwner: G.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: Pl.stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: (Pl.acaBridge || {}).premium || 0, acaSize: (Pl.acaBridge || {}).size || 0,
    ...rsb, laterB: G.laterBContribSeries ? G.laterBContribSeries(R) : undefined, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: G.taxableInitAll(), workMagi: G.workMagi(), taxYieldPct: 2.0, currentConv: 0, ordDrawByYr: ser.ordDrawByYr };
  const A = G.runRothStrategies(PO, [{ key: "f", label: "x", policy: { kind: "fixed", amount: roth } }, { key: "b", label: "x", policy: { kind: "fillBracket", rate: 22 } }]);
  const hz = PO.horizonYr;
  _src = mulberry(7); const mc6 = G.runMonteCarlo(R, 300, {});
  const mc30 = G.runExtendedMC(R, 30, 300, { rng: mulberry(7) });
  return { A: md5(A), B: md5(B), C: md5(C), D: md5(w.schedule), S: md5(G.mcIncomeTaxSchedule(R, { rothAmount: roth, scenarioPreset: pre })),
    WB: md5(G.whatBreaksAnnualTax(R, hz, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: pre })), MC6: md5(mc6), MC30: md5(mc30) };
};
const loadIn = (G, P, X) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); G.applyScenarioProbs(G.PROB_PRESETS().base.probs); return G.PLAN_TIMELINE(); };
const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());

// ── §C · the twin-plan invariant ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the twin plans");
const twinDiff = [];
if (!ON("C")) SKIP("C"); else for (const [id, nm, f1, f2, X] of TWINS) {
  const r = {}, tops = [];
  for (const [k, f] of [["p1", f1], ["p2", f2]]) { const tl = loadIn(g, f(P0), X0); tops.push(POST ? g.spousalTopUp("A").monthly + g.spousalTopUp("B").monthly : 0);
    r[k] = {}; for (const roth of [0, 70000]) r[k][roth] = runAll(g, { ...E, ...TT }, roth, "base", tl.targetRetireYear); }
  const diff = [0, 70000].flatMap(roth => Object.keys(r.p1[roth]).filter(e => r.p1[roth][e] !== r.p2[roth][e]).map(e => `${e}@${roth}`));
  twinDiff.push([nm, diff]);
  if (POST) T(`C-${id} ${nm}: plan 1's top-up is $${X.toLocaleString()} and plan 2's none (${tops.join(", ")}); Engines A, B, C, D, the Monte Carlo's tax schedule, What Breaks' tax and both Monte Carlo engines are bit-identical at $0 and $70,000`,
    tops[0] === X && tops[1] === 0 && diff.length === 0, diff.join(", "));
}
// rendered: the Roth tab (its strategies, solve-for grid and ladder — Engine A through its builders), Backtest and What Breaks
let app = null;
if (POST && ON("C")) {
  app = await mountApp(VER);
  for (const [id, nm, f1, f2] of TWINS) { const a = await app.visit(f1(app.DP0), TWIN_TABS), b = await app.visit(f2(app.DP0), TWIN_TABS);
    const d = TWIN_TABS.filter(t => a[t] !== b[t] || a[t].length < 500);
    T(`C-${id}r ${nm}: the Roth, Backtest and What Breaks tabs render the same text on both plans`, d.length === 0,
      d.map(t => { let i = 0; while (i < a[t].length && a[t][i] === b[t][i]) i++; return `${t} @${i}: …${a[t].slice(Math.max(0, i - 60), i + 60)}… vs …${b[t].slice(Math.max(0, i - 60), i + 60)}…`; }).join(" ‖ ")); }
}
if (!POST && ON("C")) T(`C-1 ${KD}: every twin differs — the plan with no benefit is paid nothing (${twinDiff.filter(([, d]) => d.length > 0).length} of ${TWINS.length})`, twinDiff.every(([, d]) => d.length > 0));

// ── §D · nothing moves where nothing is owed (engines against v6.46) ─────────────────────────────────────────────────────────────────
console.log("  D — v6.46 where nothing is owed");
if (!ON("D")) SKIP("D"); else if (POST && existsSync(join(HERE, `app_${C_PRIOR}.mjs`))) {
  const PM = await import(pathToFileURL(join(HERE, `app_${C_PRIOR}.mjs`)).href);
  const pg = PM.__g, pE = { ...PM.__engines, ...PM.__test };
  const plans = [["example", clone(P0)], ...Object.keys(HOUSEHOLDS).map(n => { loadIn(g, P0, X0); return [`fixture ${n}`, (() => { const Q = clone(P0); HOUSEHOLDS[n].apply(Q); return Q; })()]; })];
  const moved = [], owed = [];
  for (const [nm, P] of plans) {
    const tl = loadIn(g, P, X0); loadIn(pg, P, X0);
    if (g.spousalTopUp("A").monthly + g.spousalTopUp("B").monthly > 0) owed.push(nm);
    for (const roth of [0, 70000]) { const a = runAll(g, { ...E, ...TT }, roth, "base", tl.targetRetireYear), b = runAll(pg, pE, roth, "base", tl.targetRetireYear);
      for (const e of Object.keys(a)) if (a[e] !== b[e]) moved.push(`${nm} ${e}@${roth}`); }
  }
  T(`D-1 no top-up on the example or any fixture household (${plans.length} plans) — the boundary this release crosses (§0.3)`, owed.length === 0, owed.join(", "));
  T(`D-2 the engines of §C are bit-identical to v6.46 on all ${plans.length} plans, at $0 and $70,000`, moved.length === 0, moved.slice(0, 6).join(" | "));
} else console.log(`     (§D engines: ${POST ? `no app_${C_PRIOR}.mjs in this run folder — skipped` : "the v6.46 leg has nothing to compare with — skipped"})`);
// rendered: the changed tabs, against v6.46's text
if (!ON("D")) {} else if (POST && process.env.T111_CONTROLS_SKIP_DDOM) console.log("     (§D rendered: skipped by T111_CONTROLS_SKIP_DDOM — the negative controls' switch, never the suite's)");
else if (POST && existsSync(join(HERE, `dom_${C_PRIOR}.cjs`))) {
  const dumpFile = join(tmpdir(), `t111_dump_${process.pid}.json`);
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), C_PRIOR, "--dumpdom", dumpFile], { cwd: HERE, encoding: "utf8", timeout: 3000000, maxBuffer: 1 << 26 });
  let prior = null; try { prior = JSON.parse(readFileSync(dumpFile, "utf8")); unlinkSync(dumpFile); } catch (e) {}
  if (!app) app = await mountApp(VER);
  const bad = [], hitsBad = [];
  for (const nm of D_PLANS) { const cur = await app.visit(dPlan(nm, app.DP0), DOM_TABS);
    for (const t of DOM_TABS) { const p = prior && prior[nm] ? prior[nm][t] : null; if (p == null) { bad.push(`${nm}/${t}: no prior`); continue; }
      let a = normVer(cur[t]), b = normVer(p);
      if (t === "ss") { const ma = mask(a, masks647), mb = mask(b, masks646); a = ma.t; b = mb.t;
        if (JSON.stringify(ma.hits) !== JSON.stringify(mb.hits) || ma.hits.some(h => h > 1)) hitsBad.push(`${nm}: ${ma.hits}/${mb.hits}`); }
      if (a !== b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; bad.push(`${nm}/${t} @${i}: …${a.slice(Math.max(0, i - 80), i + 80)}… vs …${b.slice(Math.max(0, i - 80), i + 80)}…`); } } }
  T(`D-3 ${DOM_TABS.length} tabs on ${D_PLANS.length} plans render v6.46's text, but for the Social Security tab's three copy changes (${prior ? "prior dumped" : "NO PRIOR"})`, !!prior && bad.length === 0, bad.slice(0, 2).join(" ‖ ") || (r.stderr || "").slice(-300));
  T(`D-4 each of the three masks is bound to one hit a side, the same on both legs, on every plan that shows it`, hitsBad.length === 0, hitsBad.slice(0, 4).join(" | "));
} else console.log(`     (§D rendered: ${POST ? `no dom_${C_PRIOR}.cjs in this run folder — skipped` : "the v6.46 leg has nothing to compare with — skipped"})`);

// ── §E · hand pins ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — hand pins");
if (!ON("E")) SKIP("E"); else if (POST) {
  // The example's dates: A born 1 Jan 1964 claims at 67 (Jan 2031); B born 1 Jan 1966 reaches 67 in Dec 2032 (20 CFR 404.102).
  const PINS = [["noSSB", "B", 1386, 2031, 1, "½ × 3,300 = 1,650 × (144 − 23)/144 = 1,386.46: B at 63 files first, so from A's January 2031, 23 months early"],
    ["noSSB_claim67", "B", 1650, 2033, 1, "B files at 67 in January 2033 — after her December 2032: unreduced"],
    ["smallB", "B", 546, 2031, 1, "(1,650 − 1,000) × 121/144 = 546.18"],
    ["smallB_70", "B", 410, 2036, 1, "650 unreduced, less her delayed credits 1,240 − 1,000 = 240"],
    ["noSSA", "A", 900, 2031, 1, "½ × 1,800; A files at 67 in January 2031, after his December 2030"]];
  for (const [nm, who, amt, y, mo, why] of PINS) { loadIn(g, SHAPES[nm](P0), X0); const t = g.spousalTopUp(who), o = g.spousalTopUp(who === "A" ? "B" : "A");
    T(`E-${nm}: ${who === "A" ? "A" : "B"} $${amt.toLocaleString()} from ${["", "Jan"][mo]} ${y} — ${why} (got ${t.monthly} from ${t.date ? `${t.date.month}/${t.date.year}` : "—"})`,
      t.monthly === amt && t.date && t.date.year === y && t.date.month === mo && o.monthly === 0); }
  const tl = loadIn(g, SHAPES.noSSB(P0), X0), R = tl.targetRetireYear, ser = g.withdrawalPlanSeries({ retireYear: R, rothAmount: 70000, scenarioPreset: "base" });
  const B = E.computeTaxPlan({ retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, ...ser }).rows, b31 = B.find(r => r.yr === 2031), b30 = B.find(r => r.yr === 2030);
  T(`E-6 Engine B, noSSB: 2031's ssB_y is 1,386 × 12 × the year's dollar factor (${b31 && Math.round(b31.ssB_y)} vs ${b31 && Math.round(1386 * 12 * b31.dollarFactor)}), 2030's none`,
    !!b31 && Math.abs(b31.ssB_y - 1386 * 12 * b31.dollarFactor) < 0.01 && b30 && b30.ssB_y === 0);
  const D = g.computeWithdrawalPlan({ retireYear: R, rothAmount: 70000, scenarioPreset: "base" }).schedule, d31 = D.find(r => r.yr === 2031), d30 = D.find(r => r.yr === 2030);
  T(`E-7 Engine D, noSSB: 2031's ssB_y is Engine B's — 1,386 × 12 in the year's dollars — and 2030's none (got ${d31 && d31.ssB_y}, ${d30 && d30.ssB_y})`, !!d31 && !!b31 && Math.abs(d31.ssB_y - b31.ssB_y) < 0.01 && d30.ssB_y === 0);
  loadIn(g, SHAPES.missingB(P0), X0);
  T("E-8 DL-7 (a): the loader's placeholder spouse-B block pays no top-up", g.spousalTopUp("B").monthly === 0 && g.PORTFOLIO().incomeSources.ssB.isDefault === true);
  // a date of birth with no day (the guided setup saves "YYYY-06"): the born-on-the-1st month is not granted — 24 months, 1,650 × 120/144 = $1,375
  loadIn(g, { ...SHAPES.noSSB(P0), dobB: "1966-01" }, X0);
  T(`E-10 a date of birth held without its day reads no born-on-the-1st month (the review): $1,375, not $1,386 (got ${g.spousalTopUp("B").monthly})`, g.spousalTopUp("B").monthly === 1375);
  loadIn(g, { ...SHAPES.noSSB(P0), single: true }, X0);
  T("E-9 a single plan pays none", g.spousalTopUp("A").monthly === 0 && g.spousalTopUp("B").monthly === 0);
}

// ── §F, §G · rendered ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the Social Security tab;  G — the other figures");
if (!ON("F")) SKIP("F/G"); else if (POST) {
  if (!app) app = await mountApp(VER);
  const V = {}; for (const nm of ["noSSB", "noSSA", "smallB", "smallB_70", "bothZero", "missingB"]) V[nm] = await app.visit(SHAPES[nm](app.DP0), ["ss", "income", "grade", "ranking", "dashboard", "survivor", "exit plan", "my data", "ask ai", "taxes"]);
  const ss = V.noSSB.ss;
  T("F-1 noSSB: B's card carries the line \"+ $1,386/mo spousal benefit on Spouse A's record from Jan 2031 (when Spouse A files) │ total $1,386/mo\"",
    /SPOUSE B SS @ AGE 63 \$ ?0 ?\/mo[^|]*?\+ \$ ?1,386 ?\/mo spousal benefit on Spouse A ?'s record from Jan 2031 \(when Spouse A files\) │ total \$ ?1,386 ?\/mo/.test(ss));
  T("F-2 noSSB: combined income $5,086 (3,300 + 1,386 + the $400 pension) and the shortfall $2,534 (7,620 − 400 − 3,300 − 1,386)",
    /Combined income \(all SS\) \$ ?5,086 ?\/mo/.test(ss) && /Shortfall after [^$]*?\$ ?2,534 ?\/mo/.test(ss));
  T("F-3 noSSB: the modelled note replaces the warning, says why it is paid (\"entered as $0/mo (claim age 63)\") and what the plan pays",
    /SSA ?'s spousal benefit, modelled: Spouse B ?'s own benefit at 67 \(\$ ?0 ?\/mo\) is less than half of Spouse A ?'s \(\$ ?1,650 ?\/mo\)/.test(ss)
    && /entered as \$ ?0 ?\/mo \(claim age 63 ?\)/.test(ss) && /\+\$1,386\/mo from Jan 2031\)/.test(ss) && !/NOT MODELED/.test(ss));
  T("F-4 noSSB: the no-benefit sentence says the spousal benefit is shown; the grid's best, A at 69, ties for B at 62–67 (her top-up starts at his filing, January 2033, whenever she files by then) — it names B at 67, the latest, and says six cells tie",
    /This plan holds no Social Security of Spouse B ?'s own/.test(ss) && /The model's best cell under those assumptions: Spouse A at 69 \/ Spouse B at 67 → \$\d+K — 6 cells tie on that score/.test(ss));
  const sA = V.noSSA.ss;
  T("F-5 noSSA (the mirror, F-36): A's card \"+ $900/mo spousal benefit on Spouse B's record from Jan 2031\", the note for A, combined $2,650 (900 + 1,350 + 400)",
    /SPOUSE A SS @ AGE 67 \$ ?0 ?\/mo[^|]*?\+ \$ ?900 ?\/mo spousal benefit on Spouse B ?'s record from Jan 2031 │/.test(sA) && /modelled: Spouse A ?'s own benefit at 67/.test(sA)
    && /Combined income \(all SS\) \$ ?2,650 ?\/mo/.test(sA));
  T("F-6 smallB: B's card $750 and \"+ $546/mo … from Jan 2031 (when Spouse A files)\"; smallB_70: \"+ $410/mo … from Jan 2036\", her own filing (no \"when\")",
    /SPOUSE B SS @ AGE 63 \$ ?750 ?\/mo[^|]*?\+ \$ ?546 ?\/mo spousal benefit on Spouse A ?'s record from Jan 2031 \(when Spouse A files\)/.test(V.smallB.ss)
    && /SPOUSE B SS @ AGE 70 \$ ?1,240 ?\/mo[^|]*?\+ \$ ?410 ?\/mo spousal benefit on Spouse A ?'s record from Jan 2036 │/.test(V.smallB_70.ss));
  T("F-7 F-36's survivor neighbour: with neither spouse holding a benefit, no survivor sentence naming the larger check, no note, no NaN",
    !/When either of you dies, the survivor keeps the/.test(V.bothZero.ss) && !/modelled:/.test(V.bothZero.ss) && !/NaN/.test(V.bothZero.ss));
  T("F-8 the placeholder (missingB): no top-up line, no note, no \"none is owed\" line (the review: it read so beside a $0 spouse B); v6.46's no-benefit sentence", !/spousal benefit on/.test(V.missingB.ss) && !/modelled:/.test(V.missingB.ss)
    && !/SSA ?'s spousal benefit: none/.test(V.missingB.ss) && !/SSA ?'s spousal benefit: none/.test(V.bothZero.ss)
    && /This plan holds no Social Security benefit for Spouse B ?, so every projection pays Spouse B ?no Social Security\./.test(V.missingB.ss));
  // a grid cell by the grid's own arithmetic, from the plan's fields (whole years from the claim year; the survivor keeps the larger own check)
  { const tl = loadIn(g, SHAPES.noSSB(P0), X0); const fA = 3300, cA = 67, cB = 63, dA = dobOf(P0.dobA), dB = dobOf(P0.dobB);
    const yA = ymAbs(dA.year + cA, dA.month), yB = ymAbs(dB.year + cB, dB.month);
    const t = spousalOracle({ piaW: fA, piaS: 0, ownS: 0, dobS: dB, ymS: yB, ymW: yA }), tY = Math.floor(t.start / 12);
    const dyA = tl.dobA.year + tl.lifeExpA, dyB = tl.dobB.year + tl.lifeExpB; let tot = 0;
    for (let y = tl.asOfYear; y <= Math.max(dyA, dyB); y++) { const aA = y < dyA, aB = y < dyB; if (!aA && !aB) break; const ageA = y - tl.dobA.year, ageB = y - tl.dobB.year;
      if (aA && aB) tot += ((ageA >= cA ? fA : 0) + (y >= tY ? t.monthly : 0)) * 12; else tot += Math.max(ageA >= cA ? fA : 0, aA ? 0 : fA) * 12 * ((aA && ageA >= 60) || (aB && ageB >= 60) ? 1 : 0); }
    const cell = `$${(tot / 1000).toFixed(0)}K`;
    T(`F-9 the claiming grid's cell for the plan (A 67 / B 63) is ${cell} — the top-up from ${tY} while both are alive (\"Your current plan … scores ${cell}\")`, ss.includes(`( Spouse A 67 / Spouse B 63 ) scores ${cell}`), (ss.match(/Your current plan[^.]*/) || [""])[0]); }
  // §G — the other figures that sum Social Security, noSSB: 3,300 + 1,386 + 400 = $5,086
  const G_ = V.noSSB;
  T("G-1 the Income tab: TOTAL (all flowing) $5,086, a spousal-benefit row of $1,386 from Jan 2031, and the event \"Spouse B's spousal benefit begins\"",
    /TOTAL \(all flowing\) \$ ?5,086 ?\/mo/.test(G_.income) && /Spouse B's spousal benefit \(on Spouse A's record\) Jan 2031 \$ ?1,386 ?\/mo/.test(G_.income) && /Spouse B's spousal benefit begins/.test(G_.income));
  T("G-2 the Grade tab's Income Floor: \"Social Security and the pension: $5,086/mo\"", /Social Security and the pension: \$5,086\/mo/.test(G_.grade));
  T("G-3 the Dashboard's floor and Ask AI's context count it (\"… + Spouse B's spousal benefit on Spouse A's record $1,386 (Jan 2031) = $5,086/mo\")",
    /guaranteed income covers \$ ?5,086 ?\/mo/.test(G_.dashboard) && /\+ Spouse B's spousal benefit on Spouse A's record \$1,386 \(Jan 2031\) = \$5,086\/mo/.test(G_["ask ai"]), `${(G_.dashboard.match(/guaranteed income.{0,60}/) || ["(no floor sentence)"])[0]} | ${(G_["ask ai"].match(/spousal benefit on.{0,60}/) || ["(none)"])[0]}`);
  T("G-4 the Exit Plan's line for B and My Data's (DL-7 (a): \"paid because Spouse B's own benefit is entered as $0/mo at age 63\")",
    /SSA's spousal benefit on Spouse A's record \(the model's \$1,386\/mo\) starts Jan 2031/.test(G_["exit plan"]) && /It is paid because Spouse B ?'s own benefit is entered as \$ ?0 ?\/mo at age 63/.test(G_["my data"]));
  const ex = await app.visit(clone(app.DP0), ["income", "my data", "exit plan", "ask ai"]);
  T("G-5 the example: none of it — no spousal row, event, line or context", !/spousal benefit/.test(ex.income + ex["my data"] + ex["exit plan"] + ex["ask ai"]));
}
if (app) await app.unmount();

// ── §H · the copy ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  H — the copy");
if (!ON("H")) SKIP("H"); else {
  const DOCS = String((typeof g.DOCS_HTML === "function" ? g.DOCS_HTML() : g.DOCS_HTML) || "");
  const NOTE = "SSA’s spousal benefit (v6.47).";
  if (POST) {
    T("H-1 the Field Manual's §13 carries the v6.47 note, ahead of v6.46's, with its figures ($1,386; $1,480,888 → $2,012,969; 77% → 85%; $900; 36% → 56%)",
      DOCS.includes(NOTE) && DOCS.indexOf(NOTE) < DOCS.indexOf("Social Security for a spouse with no benefit of their own (v6.46).")
      && ["$1,386 a month from January 2031", "$1,480,888 to $2,012,969", "from 77% to 85%", "$900 a month", "from 36% to 56%"].every(x => DOCS.includes(x)));
    T("H-2 the Social Security entry states the rule and what is not modeled (the earnings test among it); the claiming grid's limits no longer say it is not modeled",
      DOCS.includes("SSA’s spousal benefit (from v6.47).") && DOCS.includes("the retirement earnings test") && DOCS.includes("(no discounting; SSA’s spousal benefit counted from the year of the later filing)"));
    const meth = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : null;
    if (meth !== null) T("H-3 METHODOLOGY carries \"## SSA's spousal benefit (v6.47)\", and its claiming-grid paragraph no longer says the top-ups are not modeled",
      meth.includes("## SSA's spousal benefit (v6.47)") && !/spousal top-ups? (?:benefits )?(?:are )?not modell?ed/i.test(meth.slice(0, meth.indexOf("## SSA's spousal benefit (v6.47)"))));
    else console.log("     (H-3: no METHODOLOGY.md in the run folder's root — skipped)");
  } else T("H-1 (v6.46): no v6.47 note", !DOCS.includes(NOTE));
}

console.log(`\nt111 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
