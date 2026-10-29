// t101 — THE SS TAB'S CLAIM-AGE EXPLORER STARTS AT THE PLAN AND COMPARES AGAINST IT (v6.37, F-29)
//
//  Scope: docs/SCOPE_F29_SS_SLIDER_START.md (DS-1 to DS-6, all (a)). Through v6.36 spouse A's what-if slider opened at a literal 67 for
//  every plan (spouse B's at her plan), and the draw comparison under the sliders had three baselines: the delta card compared the slider
//  with the plan, the yearly table paid the FRA amount from the plan's claim date (a check no one receives), and the "permanent" card
//  compared with FRA. The card also counted months before retirement that the table did not. Spouse B's grid tagged her age in the
//  retirement year "Modeled", a note claimed the Monte Carlo understated her income when that age differed from her plan, the shortfall
//  card subtracted her benefit at that age, and a single household's draw table counted a second check (the placeholder spouse B).
//  Display only: no engine reads the sliders. Every defect is invisible on the example, whose spouse A plans 67 and whose spouse B's
//  claim age equals her age at retirement — boundary census row `ss_claim_a_planned_67` (t29 B-31, C-f29-1).
//
//  §A  the source, by AST: both slider states start from the plan; the removed baseline identifiers are gone (extinction).
//  §B  rendered on eight plans, at the opening position: sliders at the plan's ages, every delta $0, the planned benefits on the cards.
//  §C  moved, with every expected figure computed here from the plan by SSA's rates (5/9 %, 5/12 %, 2/3 % a month) and the tab's draw
//      rule, never read from the app: the reported plan 65 → 67; a July birth month; a claim before retirement; an early claim; a window
//      past retirement + 8; THE EXTINCTION CHECK — on every plan at every slider position 62–70 the table's rows before the later claim
//      sum to the card (one series, so two baselines cannot return); spouse B's grid, note and shortfall card; the single household.
//  §D  engines unmoved: Engines B, C, D, the Monte Carlo's schedule and What Breaks' tax bit-identical to v6.36's module (v6.37 leg, when
//      the run folder holds app_v636.mjs).
//  §E  the Field Manual's slider entry and §13 note.
//  The v6.36 leg pins each defect as a dated [KNOWN DEFECT 2026-10-29, F-29 — flips at v6.37].
//  Both legs: node t101_ss_slider_start.mjs v636 | node t101_ss_slider_start.mjs v637. Controls: qa/tools/controls_v637_ss_slider.py.
//  Exits with process.exit (the rendered app leaves timers running).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(101); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v637";
const KNOWN_VERSIONS = ["v636", "v637"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v637"].includes(VER);   // an array, so the next registration widens it
const D_PRIOR = "v636";                // §D's prior module — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-29, F-29 — flips at v6.37]";
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T101_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t101 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : (v && typeof v === "object") ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
const require = createRequire(import.meta.url);
console.log(`t101 — THE SS TAB'S CLAIM-AGE EXPLORER (${VER})`);

// ── §A · the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source, by AST");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) all(c, pred, out); return out; };
const SRCOF = n => SRC.slice(n.range[0], n.range[1]).replace(/\s+/g, "");
const stateInit = name => { const d = all(AST, n => n.type === "VariableDeclarator" && n.id.type === "ArrayPattern" && n.id.elements[0] && n.id.elements[0].name === name);
  return d.length === 1 && d[0].init && d[0].init.type === "CallExpression" && d[0].init.callee.name === "useState" ? d[0].init.arguments[0] : null; };
const initA = stateInit("spouseAClaimAge"), initB = stateInit("spouseBClaimAge");
const idents = name => all(AST, n => n.type === "Identifier" && n.name === name).length;
const JTXT = all(AST, n => n.type === "JSXText").map(n => n.value.replace(/\s+/g, " ")).join(" ");
const STRS = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement").map(n => n.type === "Literal" ? n.value : n.value.cooked).join(" ¦ ");
T("A-0 SETUP: both slider states found, each one useState call", !!initA && !!initB);
const HELP = AST.body.find(n => n.type === "FunctionDeclaration" && n.id && n.id.name === "ssTabClaimAge");
if (POST) {
  T("A-1 spouse B's slider starts from her plan's claim age through ssTabClaimAge(\"B\")", !!initB && initB.type === "ArrowFunctionExpression" && SRCOF(initB) === '()=>ssTabClaimAge("B")', initB && SRCOF(initB));
  T("A-2 spouse A's slider starts from the plan's claim age, the same way (DS-1 (a))", !!initA && initA.type === "ArrowFunctionExpression" && SRCOF(initA) === '()=>ssTabClaimAge("A")', initA && SRCOF(initA));
  T("A-2b ssTabClaimAge is module-level, reads incomeSources' plannedAge, rounds it, clamps it to 62–70 and falls back as PLAN_TIMELINE does (67 / 63)",
    !!HELP && SRCOF(HELP).includes("Math.round(Number(src&&src.plannedAge))") && SRCOF(HELP).includes("Math.min(70,Math.max(62,") && SRCOF(HELP).includes('(who==="A"?67:63)'));
  T("A-3 EXTINCTION: the identifiers of the old baselines are gone (spouseBActual, spouseBModelDelta, fraClaimMonth, _ssAYrFRA, spouseASSfra, drawFRA)",
    ["spouseBActual", "spouseBModelDelta", "fraClaimMonth", "_ssAYrFRA", "spouseASSfra", "drawFRA"].every(n => idents(n) === 0),
    ["spouseBActual", "spouseBModelDelta", "fraClaimMonth", "_ssAYrFRA", "spouseASSfra", "drawFRA"].map(n => n + ":" + idents(n)).join(" "));
  T("A-4 one series: drawDelta is assigned only inside a loop (+=), and the permanent card reads permanentGainA, not spouseAFRA",
    all(AST, n => n.type === "AssignmentExpression" && n.left.type === "Identifier" && n.left.name === "drawDelta").every(n => n.operator === "+=") && idents("permanentGainA") >= 4
    && !/than FRA forever|Current plan = FRA|Portfolio draw delta vs FRA|vs FRA baseline during delay/.test(JTXT + " ¦ " + STRS));
  T("A-5 the false spouse-B note is gone (\"MC simulation models … Model understates …\")", !/MC simulation models/.test(JTXT) && !/Model understates/.test(JTXT));
} else {
  T("A-1 spouse B's slider starts from her plan's claim age", !!initB && initB.type === "ArrowFunctionExpression" && SRCOF(initB).includes("incomeSources?.ssB?.plannedAge"));
  T(`A-2 ${KD} spouse A's slider starts at the literal 67`, !!initA && initA.type === "Literal" && initA.value === 67);
  T(`A-3 ${KD} the old baselines are present (fraClaimMonth, spouseASSfra, spouseBActual)`, idents("fraClaimMonth") > 0 && idents("spouseASSfra") > 0 && idents("spouseBActual") > 0);
}

// ── the DOM ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.confirm = () => true;
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const body = () => window.document.body;
// Text without cloning: jsdom's cloneNode re-parses every style attribute and throws on some of the tab's colour-mix backgrounds
// (seen at the t101 build, a selected cumulative-grid row), so the text nodes are walked instead, skipping <style> and <script>.
const txt = () => { const w = window.document.createTreeWalker(body(), 4 /* SHOW_TEXT */); let out = "", n;
  while ((n = w.nextNode())) { const p = n.parentNode && n.parentNode.nodeName; if (p !== "STYLE" && p !== "SCRIPT") out += n.nodeValue; } return out.replace(/\s+/g, " "); };
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root = null, act, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
  if (expenses !== undefined) put("expenses", expenses); await render(); };
const between = (t, a, b) => { const i = t.indexOf(a); if (i < 0) return ""; const j = b ? t.indexOf(b, i + a.length) : -1; return t.slice(i, j < 0 ? i + 2500 : j); };
const sliders = () => [...body().querySelectorAll('input[type="range"]')].filter(x => x.min === "62" && x.max === "70");
const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
const drive = async (inp, v) => { await act(async () => { setNative.call(inp, String(v)); inp.dispatchEvent(new window.Event("input", { bubbles: true })); }); await flush(); await flush(); };

await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
const EXP = clone(DG.PORTFOLIO()), EXE = clone(DG.EXPENSES());
T("SETUP: the example loaded (spouse A plans 67, spouse B 63)", EXP.incomeSources?.ssA?.plannedAge === 67 && EXP.incomeSources?.ssB?.plannedAge === 63);

// ── SSA's rates and the tab's draw rule, typed here ─────────────────────────────────────────────────────────────────────────────
const atAge = (fra, age) => { const m = (age - 67) * 12; if (m < 0) { const e = -m; return Math.round(fra * (1 - (Math.min(e, 36) * 5 / 9 + Math.max(0, e - 36) * 5 / 12) / 100)); } return m > 0 ? Math.round(fra * (1 + m * 2 / 3 / 100)) : fra; };
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const ymd = s => { const [y, m] = String(s).split("-").map(Number); return { year: y, month: m || 1 }; };
const tblA = (amt, age) => DG.genSSTable(amt, age);
const withA = (P, amt, age, dob) => { const p = clone(P); p.incomeSources.ssA = { tableByAge: tblA(amt, age), planned: amt, plannedAge: age }; if (dob) p.dobA = dob; return p; };
const withB = (P, amt, age) => { const p = clone(P); p.incomeSources.ssB = { tableByAge: tblA(amt, age), planned: amt, plannedAge: age }; return p; };
const bAt = (P, age) => { const p = clone(P); p.incomeSources.ssB.plannedAge = age; p.incomeSources.ssB.planned = p.incomeSources.ssB.tableByAge[age]; return p; };
const singleMD = P => { const p = clone(P); p.single = true; p.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 }; return p; };

// Everything the expected figures need, read from the plan (and the expense snapshot), never from the tab.
const model = () => { const P = DG.PORTFOLIO(), tl = DG.PLAN_TIMELINE(), single = !!tl.single;
  const fraA = P.incomeSources.ssA.tableByAge[67] || DG.getSSA(), fraB = single ? 0 : (P.incomeSources.ssB.tableByAge[67] || 1944);
  return { P, tl, single, fraA, fraB, planA: Math.min(70, Math.max(62, P.incomeSources.ssA.plannedAge || 67)), planB: Math.min(70, Math.max(62, P.incomeSources.ssB.plannedAge || 67)),
    E: DG.snapshots().early, pen: DG.getPension(), R: tl.targetRetireYear, medB: tl.medicareB.year, dobA: tl.dobA, dobB: tl.dobB, pp: DG.postPayments ? DG.postPayments() : null }; };
const series = (m, selA, selB) => {   // month index = year × 12 + month
  const yrOf = i => Math.floor((i - 1) / 12);
  const aPlanM = (m.dobA.year + m.planA) * 12 + (m.dobA.month || 1), aSelM = (m.dobA.year + selA) * 12 + (m.dobA.month || 1);
  const bM = (m.dobB.year + selB) * 12 + (m.dobB.month || 1);
  const aPlan = atAge(m.fraA, m.planA), aSel = atAge(m.fraA, selA), bBen = m.single ? 0 : atAge(m.fraB, selB);
  const E = i => m.E + (yrOf(i) >= m.medB ? 475 : 0), inc = i => (!m.single && i >= bM ? bBen : 0) + m.pen;
  const draw = (i, a) => Math.max(0, E(i) - (inc(i) + a));
  const retM = m.R * 12 + 1, later = Math.max(aPlanM, aSelM);
  let delta = 0; for (let i = retM; i < later; i++) delta += draw(i, i >= aSelM ? aSel : 0) - draw(i, i >= aPlanM ? aPlan : 0);
  const endYr = Math.max(m.R + 8, yrOf(later)), rows = [];
  for (let y = m.R; y <= endYr; y++) { let dp = 0, ds = 0; for (let mo = 1; mo <= 12; mo++) { const i = y * 12 + mo; dp += draw(i, i >= aPlanM ? aPlan : 0); ds += draw(i, i >= aSelM ? aSel : 0); } rows.push({ y, dp, ds, d: ds - dp }); }
  const ppM = m.pp ? m.pp.from.year * 12 + m.pp.from.month : null;
  const shortfall = m.pp ? Math.max(0, m.pp.monthly - (!m.single && ppM >= bM ? bBen : 0) - m.pen - (ppM >= aSelM ? aSel : 0)) : null;
  return { aPlan, aSel, bBen, delta, rows, later, laterYr: yrOf(later), perm: aSel - aPlan, shortfall, endYr, retM };
};
// ── reading the tab ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const num = s => s == null ? null : Number(String(s).replace(/[,$]/g, ""));
const signed = s => { if (s == null) return null; const neg = /^[−-]/.test(s); return (neg ? -1 : 1) * num(s.replace(/^[+−-]/, "")); };
const read = nameA => { const t = txt(), u = String(nameA).toUpperCase();
  const card = t.match(new RegExp(`${u} SS @ AGE (\\d+)\\$([\\d,]+)/mo`));
  const top = (between(t, POST ? "Portfolio draw delta vs your plan" : "Portfolio draw delta vs FRA", "BENEFIT BY CLAIMING AGE").match(/^Portfolio draw delta vs (?:your plan|FRA)(BASELINE|[+−-]?\$\d+K)/) || [])[1];
  const tab = between(t, "PORTFOLIO DRAW IMPACT", "Total extra draw");
  const rows = [...tab.matchAll(/(\d{4})\$(\d+)K\$(\d+)K(—|[+−-]\$\d+K)/g)].map(r => ({ y: +r[1], dp: +r[2] * 1000, ds: +r[3] * 1000, d: r[4] === "—" ? 0 : signed(r[4].replace("K", "")) * 1000 }));
  const tot = (t.match(/Total extra draw \((?:until [^)]*|window)\)(\$0|[+−-]\$[\d,]+K?)/) || [])[1];
  const perm = (t.match(/Monthly income gain \(permanent\)(\$0|[+−-]?\$[\d,]+\/mo)/) || [])[1];
  const sf = (t.match(/Shortfall after [^$]*?\$([\d,]+)\/mo/) || [])[1];
  const swr = (t.match(/Shortfall after [^$]*?\$[\d,]+\/mo([\d.]+)% SWR/) || [])[1];
  const bGrid = between(t, "BENEFIT BY CLAIMING AGE (EST. FRA", "Assumptions & constraints");
  const modeled = (bGrid.match(/AGE (\d+)\*?\$[\d,]+\w{3} \d{4}(?:◀ SLIDER)?Modeled/) || [])[1];
  const surv = (t.match(/SURVIVOR BENEFIT \([^)]*\)\$([\d,]+)\/mo/) || [])[1];
  return { t, ageA: card && +card[1], benA: card && num(card[2]), top, rows, tot: tot && (tot === "$0" ? 0 : /K$/.test(tot) ? signed(tot.replace("K", "")) * 1000 : signed(tot)),
    perm: perm && (perm === "$0" ? 0 : signed(perm.replace("/mo", ""))), sf: num(sf), swr, modeled: modeled && +modeled, surv: num(surv), sl: sliders().map(x => +x.value), bGrid };
};
const open = async P => { await seed(P, EXE); for (let i = 0; i < 3; i++) await flush(); await go("ss"); await flush(200); return model(); };

// ── §B · at the opening position ────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the opening position");
const PLANS = [
  ["the example (A 67, B 63)", EXP],
  ["A 65 at $3,322 — the reported plan", withA(EXP, 3322, 65)],
  ["A 62 at $2,600 (claims three years before retiring)", withA(EXP, 2600, 62)],
  ["A 70 at $4,600", withA(EXP, 4600, 70)],
  ["A 65 at $3,322, B 67 at $2,028", withB(withA(EXP, 3322, 65), 2028, 67)],
  ["A 65, born in July", withA(EXP, 3322, 65, "1964-07-01")],
  ["A 62, born 1972 (a delay to 70 passes retirement + 8)", withA(EXP, 2600, 62, "1972-01-01")],
  ["single as My Data saves it, A 64 at $2,900", singleMD(withA(EXP, 2900, 64))],
];
for (const [lab, P] of PLANS) {
  const m = await open(P); const r = read(m.P.nameA || "Spouse A"); const s = series(m, m.planA, m.planB);
  if (POST) {
    T(`B-1 ${lab}: the sliders open at the plan's ages (${m.single ? m.planA : m.planA + ", " + m.planB})`, canon(r.sl) === canon(m.single ? [m.planA] : [m.planA, m.planB]), canon(r.sl));
    T(`B-2 ${lab}: spouse A's card shows the planned age and SSA's benefit for it (${money(s.aPlan)})`, r.ageA === m.planA && r.benA === s.aPlan, `${r.ageA} ${r.benA}`);
    T(`B-3 ${lab}: the top card says BASELINE, the slider is the plan, every table delta is —, the delay total and the permanent gain are $0`,
      r.top === "BASELINE" && r.t.includes(`${m.P.nameA || "Spouse A"}'s slider = your plan (age ${m.planA})`) && r.rows.length >= 9 && r.rows.every(x => x.d === 0) && r.tot === 0 && r.perm === 0,
      `${r.top} ${r.rows.length} ${r.tot} ${r.perm}`);
    T(`B-4 ${lab}: the table runs from retirement to ${s.endYr}, and its plan column is the draw computed here`, r.rows.length === s.rows.length && r.rows[0].y === m.R
      && r.rows.every((x, i) => x.dp === Math.round(s.rows[i].dp / 1000) * 1000), r.rows.map(x => x.y + ":" + x.dp).slice(0, 4).join(" ") + " | " + s.rows.map(x => x.y + ":" + Math.round(x.dp)).slice(0, 4).join(" "));
    if (!m.single) T(`B-5 ${lab}: the survivor card is the larger of the two planned benefits (${money(Math.max(s.aPlan, s.bBen))})`, r.surv === Math.max(s.aPlan, s.bBen), String(r.surv));
    if (m.pp) T(`B-6 ${lab}: the shortfall card counts each check once it has started (${money(s.shortfall)}), and its SWR line reads the same figure`,
      r.sf === s.shortfall && r.swr === (s.shortfall * 12 / m.P.household * 100).toFixed(1), `${r.sf} vs ${s.shortfall}; ${r.swr}`);
    const aPlanM = (m.dobA.year + m.planA) * 12 + (m.dobA.month || 1);
    T(`B-7 ${lab}: the delay card's line names its window, or says both of ${m.P.nameA || "Spouse A"}'s claims start by retirement`, aPlanM <= m.R * 12 + 1
      ? r.t.includes(`${m.P.nameA || "Spouse A"}'s planned and slider claims both start by retirement`) : r.t.includes(`vs your plan, ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][0]} ${m.R} to `));
  } else if (m.planA !== 67) {
    T(`B-1 ${lab} ${KD}: spouse A's slider opens at 67, not the plan's ${m.planA}`, r.sl[0] === 67 && r.ageA === 67, canon(r.sl));
  }
}

// B-8 (build review): a backup can carry a claim age that is not a whole number, or a string — the import clamps the range, not the type.
if (POST) for (const [lab, age, want] of [["spouse A's claim age 65.4", 65.4, 65], ["spouse A's claim age \"65\" (a string)", "65", 65]]) {
  const P = withA(EXP, 3322, 65); P.incomeSources.ssA.plannedAge = age;
  const m = await open(P); const r = read(m.P.nameA || "Spouse A");
  T(`B-8 ${lab}: the SS tab renders (no error screen), the slider opens at ${want}, and the cards are at baseline`, /PORTFOLIO DRAW IMPACT/.test(r.t) && r.sl[0] === want && r.top === "BASELINE", `${r.sl} ${r.top} ${/Something went wrong|error/i.test(r.t)}`);
}

// ── §C · moved ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — moved, against figures computed here");
const moveTo = async (ageA, ageB) => { const sl = sliders(); await drive(sl[0], ageA); if (ageB != null && sl[1]) await drive(sliders()[1], ageB); };
const fullDelay = async (P, sel, lab) => { const m = await open(P); if (!POST) return null; await moveTo(sel); const r = read(m.P.nameA || "Spouse A"); const s = series(m, sel, m.planB); return { m, r, s }; };
if (POST) {
  { const { m, r, s } = await fullDelay(PLANS[1][1], 67);
    T("C-1 the reported plan, 65 → 67: the delay total is 24 months × $3,322 = $79,728 (the draws stay positive, so the month rule is exact)", s.delta === 79728 && r.tot === 79728, `${r.tot} / ${s.delta}`);
    T("C-2 … the top card reads +$80K and the permanent card +$511/mo ($3,833 − $3,322)", r.top === "+$80K" && r.perm === 511 && s.perm === 511, `${r.top} ${r.perm}`);
    T("C-3 … the table's rows before 2031 are +$40K, +$40K and every later row is the permanent difference ×12 (−$6K)", r.rows[0].d === 40000 && r.rows[1].d === 40000
      && r.rows.slice(2).every(x => x.d === Math.round(s.perm * -12 / 1000) * 1000), r.rows.map(x => x.d).join(","));
    T("C-4 … the delay total names its window: Jan 2029 to Dec 2030", r.t.includes("vs your plan, Jan 2029 to Dec 2030")); }
  { const { r, s } = await fullDelay(PLANS[5][1], 67);
    T("C-5 born in July: 65 → 67 is Jul 2029 → Jul 2031, still 24 months ($79,728); the rows split +$20K, +$40K, +$17K by month (2031: six months of +$3,322, six of −$511)", r.tot === 79728 && s.delta === 79728
      && r.rows[0].d === 20000 && r.rows[1].d === 40000 && r.rows[2].d === Math.round((6 * 3322 + 6 * -511) / 1000) * 1000, `${r.tot} ${r.rows.slice(0, 3).map(x => x.d)}`); }
  { const { r, s } = await fullDelay(PLANS[2][1], 67);
    T("C-6 a claim before retirement (62, Jan 2026) moved to 67: only the 24 months from retirement count — $62,400, not 60 months", s.delta === 62400 && r.tot === 62400, `${r.tot}`); }
  { const { r, s } = await fullDelay(PLANS[3][1], 67);
    T("C-7 an early claim, 70 → 67: 36 months saved × $3,710 = −$133,560; permanent −$890/mo", s.delta === -133560 && r.tot === -133560 && r.perm === -890 && r.top === "−$134K", `${r.tot} ${r.perm} ${r.top}`); }
  { const { m, r, s } = await fullDelay(PLANS[6][1], 70);
    T(`C-8 born 1972, 62 → 70: the table runs past retirement + 8 to ${s.laterYr} (both claims started), and the total is 96 months × $2,600`,
      r.rows.length === s.rows.length && r.rows[r.rows.length - 1].y === 2042 && s.delta === 96 * 2600 && r.tot === s.delta, `${r.rows.length} ${r.rows.at(-1) && r.rows.at(-1).y} ${r.tot}`); }
  // THE EXTINCTION CHECK: on every plan at every position, the card is the table's rows before the later claim (one series)
  let cells = 0, bad = []; for (const [lab, P] of PLANS) { const m = await open(P);
    for (let a = 62; a <= 70; a++) { await moveTo(a); const r = read(m.P.nameA || "Spouse A"), s = series(m, a, m.planB); cells++;
      const before = r.rows.filter(x => x.y < s.laterYr), want = s.rows.filter(x => x.y < s.laterYr);
      const ok = r.tot === Math.round(s.delta) && Math.abs(before.reduce((x, y) => x + y.d, 0) - want.reduce((x, y) => x + y.d, 0)) <= 500 * (before.length + 1)
        && r.rows.length === s.rows.length && r.rows.every((x, i) => Math.abs(x.d - s.rows[i].d) <= 500 && Math.abs(x.dp - s.rows[i].dp) <= 500 && Math.abs(x.ds - s.rows[i].ds) <= 500)
        && r.perm === s.perm && (m.pp == null || r.sf === s.shortfall);
      if (!ok) bad.push(`${lab} @${a}: tot ${r.tot}/${Math.round(s.delta)} perm ${r.perm}/${s.perm} sf ${r.sf}/${s.shortfall} rows ${r.rows.length}/${s.rows.length}`); } }
  T(`C-9 EXTINCTION: on ${cells} plan × position cells the delay card, every row, the permanent card and the shortfall card are one series (computed here)`, bad.length === 0 && cells === 72, bad.slice(0, 3).join(" | "));
  // spouse B
  { const m = await open(bAt(EXP, 62)); const r = read(m.P.nameA || "Spouse A");
    T("C-10 spouse B planned at 62 (63 at retirement): her grid marks 62 — the age the engines pay from — and the old note is gone", r.bGrid.includes("AGE 62$1,260Jan 2028◀ SLIDER") && !/Modeled/.test(r.bGrid.replace("AGE 62$1,260Jan 2028◀ SLIDER", "")) && !/Model understates/.test(r.t), r.bGrid.slice(0, 160));
    await moveTo(m.planA, 64); const r2 = read(m.P.nameA || "Spouse A");
    T("C-11 … her slider moved to 64: the grid tags 62 Modeled and 64 the slider", r2.modeled === 62 && r2.bGrid.includes("AGE 64$1,440Jan 2030◀ SLIDER"), r2.bGrid.slice(0, 200)); }
  // 64, not 63: spouse B is 63 in the retirement year, so at 63 her slider's check and her retirement-year check coincide and the
  // v6.36 rule cannot be told apart (control K7 found it at the build).
  { const m = await open(PLANS[4][1]); await moveTo(65, 64); const r = read(m.P.nameA || "Spouse A"), s = series(m, 65, 64);
    T(`C-12 the shortfall card follows spouse B's slider (67 → 64: ${money(s.shortfall)}), not her age in the retirement year (63)`, r.sf === s.shortfall && s.bBen === atAge(m.fraB, 64)
      && m.R - m.dobB.year === 63 && atAge(m.fraB, 63) !== s.bBen, `${r.sf} vs ${s.shortfall}`); }
  { const m = await open(PLANS[7][1]); await moveTo(67); const r = read(m.P.nameA || "Spouse A"), s = series(m, 67, 67);
    const y30 = r.rows.find(x => x.y === 2030), y31 = r.rows.find(x => x.y === 2031);
    T("C-13 the single household counts no second check: from 2031 its draw falls by spouse A's $3,625 × 12 alone", s.bBen === 0 && y30 && y31
      && Math.abs((y30.ds - y31.ds) - 3625 * 12) <= 1000 && r.rows.every((x, i) => Math.abs(x.ds - s.rows[i].ds) <= 500), r.rows.slice(0, 4).map(x => x.y + ":" + x.ds).join(" ")); }
} else {
  const m = await open(PLANS[1][1]); const r = read(m.P.nameA || "Spouse A");
  const sum = r.rows.reduce((x, y) => x + y.d, 0);
  T(`C-1 ${KD} the reported plan opens at 67: +$80K beside a table summing to +$92K, and $0 permanent gain`, r.top === "+$80K" && sum === 92000 && r.perm === 0, `${r.top} ${sum} ${r.perm}`);
  const m2 = await open(bAt(EXP, 62)); const r2 = read(m2.P.nameA || "Spouse A");
  T(`C-10 ${KD} spouse B planned at 62: the grid tags 63 (her age at retirement) Modeled and a note says the Monte Carlo understates her income`, r2.modeled === 63 && /Model understates Spouse B's income by \$100\/mo/.test(r2.t), r2.bGrid.slice(0, 200));
  const m3 = await open(singleMD(withA(EXP, 3300, 67))); const r3 = read(m3.P.nameA || "Spouse A");
  const d30 = r3.rows.find(x => x.y === 2030), d31 = r3.rows.find(x => x.y === 2031);
  T(`C-13 ${KD} a single household's table counts a second check from 2031 (its draw falls by more than spouse A's $39,600)`, d30 && d31 && d30.ds - d31.ds >= 60000, d30 && d31 && `${d30.ds} ${d31.ds}`);
}

// ── §D · what does not move ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — the engines do not move");
const PRIOR_PATH = join(HERE, `app_${D_PRIOR}.mjs`);
if (POST && existsSync(PRIOR_PATH)) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href), PM = await import(pathToFileURL(PRIOR_PATH).href);
  let n = 0; const diff = [];
  for (const [lab, P] of PLANS) for (const roth of [0, 70000]) {
    const out = [M, PM].map(X => { const g = X.__g, E = X.__engines; g.applyLoadedData({ portfolio: clone(P), expenses: clone(EXE) }); g.applyScenarioProbs(g.PROB_PRESETS().base.probs);
      const tl = g.PLAN_TIMELINE(), R = tl.targetRetireYear, hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
      const ser = g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "base" });
      const A = { retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, gainByYr: ser.gainByYr, ordDrawByYr: ser.ordDrawByYr };
      return canon({ ser, B: E.computeTaxPlan(A).rows, C: E.computeIrmaaPlan(A).rows, S: g.mcIncomeTaxSchedule(R, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" }),
        W: g.whatBreaksAnnualTax(R, hz, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" }).annual }); });
    n++; if (out[0] !== out[1]) diff.push(`${lab} ${roth}`);
  }
  T(`D-1 Engine D's series, Engines B and C, the Monte Carlo's schedule and What Breaks' tax are bit-identical to v6.36's on ${n} cases`, diff.length === 0 && n === 16, diff.slice(0, 3).join(" | "));
} else console.log(`     (§D: ${POST ? `no app_${D_PRIOR}.mjs in this run folder — skipped` : "the v6.36 leg has no prior to compare with — skipped"})`);

// ── §E · the Field Manual ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the Field Manual");
{ const decl = all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === "DOCS_HTML");
  const FM = decl.length === 1 && decl[0].init.type === "Literal" ? decl[0].init.value : "";
  T("E-0 SETUP: the Field Manual read from its one literal", FM.length > 100000);
  if (POST) {
    T("E-1 the slider entry says each slider opens at the person's claim age from My Data, and what the draw comparison is measured against",
      FM.includes("<strong>SS Claim-Age sliders (SS tab)</strong> — 62–70, one per spouse; each opens at that person’s claim age from My Data")
      && FM.includes("compare the first spouse’s slider with your plan, month by month from retirement, with the second spouse’s check at that spouse’s slider in both; the breakeven section compares the first spouse’s slider with full retirement age (67)"));
    const i13 = FM.indexOf("The SS tab’s claim-age explorer starts at your plan (v6.37).");
    T("E-2 §13 carries the v6.37 note, ahead of v6.36's", i13 > 0 && i13 < FM.indexOf("What Breaks pays the Monte Carlo’s tax (v6.36)."));
  } else T(`E-1 ${KD} the slider entry says nothing about where the sliders start`, FM.includes("<strong>SS Claim-Age slider (SS tab)</strong> — 62–70, drives the claiming-age comparison."));
}

await unmount();
finished = true;
console.log(`\nt101 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
