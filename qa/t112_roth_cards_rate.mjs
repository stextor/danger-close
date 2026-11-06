// t112 — THE ROTH LADDER'S STARTING-BALANCE CARDS (F-34) AND ITS RATE COLUMN (F-35) (docs/SCOPE_F34_F35_V648.md, DR-1 (a), DR-2 (a)).
// NEW at v6.48. Both legs. Run: node t112_roth_cards_rate.mjs v648   |   node t112_roth_cards_rate.mjs v647
//
// WHAT WAS WRONG. (F-34) The Roth tab's two parameter cards read "Traditional bal (now)" and "Roth bal (now)" and printed
// `retireStartBalances(retireYear)` — today's holdings plus the planned contributions at face, NOT carried to the retirement year. That is
// neither today's balance nor the balance the ladder starts from: on the example, $1,398,600 against today's $1,296,000 and the ladder's
// $1,499,680 (the example as it opens, BULL-LEANING, in 2029's dollars; $1,508,077 under BASE). From v6.48 the cards read "… at retirement (YYYY)" and print the ladder's own carried start.
// (F-35) The ladder's marginal rate started at 0.10 and was set only by a bracket the year's taxable income reached, so a year with $0 of
// taxable income read 10%. From v6.48 it starts at 0.
//
// PRECISION (OPERATIONS §M). The ladder is component-inline: its only output is the rendered DOM. The cards render whole dollars (pinned to
// within $1 — the carry's float order may differ from the app's); the table's TAXABLE renders $K and RATE whole percents.
//
// THE MODEL (§B). Each card's expected figure is computed here: today's holdings carried to the selected year at the plan's inflation, the
// planned-contribution accrual at face — `carryHold` and `factor` from units_v630.mjs, the inflation read from the DOM app's live scenario
// table under its active prior, never from the app's carry helpers. The holdings and the accrual are the constructor's (`retireStartBalances`,
// its tradInit/accTrad fields), and B-1 ties the example's holdings to the plan's own fields.
//
// SECTIONS. §A the source by AST. §B the cards, rendered. §C the RATE column on a plan with no taxable income. §D (v6.48 leg, where the
// v6.47 bundle is in the folder) the Roth tab equal to v6.47's but for the two cards and the RATE cells of $0-taxable years, the v6.47 leg
// dumped in a child process to a file (`--dumpdom`). §E the Field Manual.
// The v6.47 leg pins each defect as `[KNOWN DEFECT 2026-11-06, F-34 — flips at v6.48]` / `[…, F-35 …]`.
//
// HARNESS TRAPS (t109's, kept): `applyLoadedData` does not reset the slider or the selector, so `visit` sets both; nor does it remount, so the
// solve-for grid is recomputed by moving the slider off and back; the page's text is read by a tree walk (jsdom cannot clone a style React
// updated in place); a large dump goes through a file; each plan is built from a fresh copy of the example.
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
import { factor, planInflation, carryHold, chained } from "./units_v630.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(112); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v648";
const DUMP = process.argv[3] === "--dumpdom";
const KNOWN_VERSIONS = ["v647", "v648"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v648"].includes(VER);   // an array, so the next registration widens it
const D_PRIOR = "v647";                // §D's prior bundle — a constant, so the registrar cannot widen it
const KD34 = "[KNOWN DEFECT 2026-11-06, F-34 — flips at v6.48]";
const KD35 = "[KNOWN DEFECT 2026-11-06, F-35 — flips at v6.48]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const num = s => s == null ? null : +String(s).replace(/,/g, "");
const rothPart = t => { const i = t.indexOf("How this tab fits together"); return i < 0 ? "" : t.slice(i); };

// ── plans, each from a fresh copy of the example ───────────────────────────────────────────────────────────────────────────────────────
// no contributions: each card is the holdings carried, nothing at face
const noContrib = P => { const Q = clone(P); Q.contributions = { ...Q.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0,
  contribRothA: 0, contribRothB: 0, hsaMonthly: 0 }; return Q; };
// a later retirement: four more years of carry
const later = P => { const Q = clone(P); Q.retireYear = 2033; return Q; };
// no Roth anywhere (t109's): the Roth card is $0
const noRoth = P => { const Q = clone(P); Q.positions = Q.positions.map(p => ({ ...p, balance: p.trad, roth: 0 })); Q.otherAccounts = Q.otherAccounts.filter(a => a.taxType !== "roth");
  Q.contributions = { ...Q.contributions, contribRothA: 0, contribRothB: 0 }; return Q; };
// no Traditional anywhere (t109's noTradBase): the Traditional card is $0
const noTrad = P => { const Q = clone(P); Q.positions = Q.positions.map(p => ({ ...p, balance: p.roth, trad: 0 })).filter(p => p.balance > 0);
  Q.otherAccounts = Q.otherAccounts.filter(a => !["trad", "annuity"].includes(a.taxType)); Q.total401k = 0;
  Q.contributions = { ...Q.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0, contribRothB: 0 }; return Q; };
// no income at all before RMDs: no Social Security, no pension, and one holding a dollar off the example's so the built-in part-time work
// (the example's alone — t86) does not apply. At a $0 slider every ladder year's taxable income is exactly $0.
const zeroIncome = P => { const Q = clone(P);
  Q.incomeSources = { ...Q.incomeSources, ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 },
    pension: { ...(Q.incomeSources.pension || {}), amount: 0 } };
  Q.positions = Q.positions.map((p, i) => i === 0 ? { ...p, balance: p.balance + 1, trad: (p.trad || 0) + 1 } : p); return Q; };
// a plan already retired: its retirement year (2024) is before its as-of date (2026), so the carry is BELOW 1 — today's holdings deflated
// to 2024's dollars, and the card's note says so (the build review)
const retired = P => { const Q = clone(P); Q.retireYear = 2024; return Q; };
// annuity money (a $100,000 non-qualified annuity for A): inside the Traditional card, as in the TRAD BAL column
const annuity = P => { const Q = clone(P); Q.otherAccounts = [...Q.otherAccounts, { name: "Annuity (A)", balance: 100000, owner: "A", taxType: "annuity" }]; return Q; };
// a single plan (households.mjs's `single`): every row is the one person's
const single = P => { const Q = clone(P); Q.single = true; Q.nameB = ""; Q.positions = Q.positions.map(x => ({ ...x, owner: "A" }));
  Q.otherAccounts = Q.otherAccounts.map(x => ({ ...x, owner: "A" })); Q.incomeSources = { ...Q.incomeSources, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 } }; return Q; };
const B_PLANS = [["example", P => clone(P), {}], ["example -1 YEAR", P => clone(P), { sel: "-1 YEAR" }], ["example +1 YEAR", P => clone(P), { sel: "+1 YEAR" }],
  ["noContrib", noContrib, {}], ["later", later, {}], ["retired", retired, {}], ["annuity", annuity, {}], ["single", single, {}], ["noRoth", noRoth, {}], ["noTrad", noTrad, {}]];

// ── the rendered app (t109's harness) ────────────────────────────────────────────────────────────────────────────────────────────────
const mountApp = async ver => {
  require(`./dom_${ver}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const collapse = s => s.replace(/\s+/g, " ");
  const text = () => { const w = window.document.createTreeWalker(body(), window.NodeFilter.SHOW_TEXT); let out = "";
    while (w.nextNode()) { const p = w.currentNode.parentNode; if (p && (p.nodeName === "STYLE" || p.nodeName === "SCRIPT")) continue; out += w.currentNode.nodeValue; }
    return collapse(out); };
  const el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
  const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const DG = window.__g, DT = window.__test || {};
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const slider = () => [...body().querySelectorAll("input[type=range]")].find(s => s.max === "400000" && s.step === "5000");
  const drive = async v => { const s = slider(); if (!s) return false; await act(async () => { setNative.call(s, String(v)); s.dispatchEvent(new window.Event("input", { bubbles: true })); }); await flush(); await flush(); return true; };
  const pick = async tag => { const b = [...body().querySelectorAll("button.rbtn")].find(x => (x.textContent || "").includes(tag)); await click(b); await flush(100); return !!b; };
  const visit = async (P, { slide = 70000, sel = "PLANNED" } = {}) => {
    await act(async () => { DG.applyLoadedData({ portfolio: clone(P), expenses: clone(DX0) }); }); await flush(); await flush();
    await click(tabBtn("dashboard")); await flush(100); await click(tabBtn("roth")); await flush(100);
    await pick("PLANNED"); if (sel !== "PLANNED") await pick(sel); await click(tabBtn("roth")); await flush(200);
    await drive(0); await drive(70000); if (slide !== 70000) await drive(slide);
    let t0 = text(); for (let i = 0; i < 40; i++) { await flush(150); const t1 = text(); if (t1 === t0) break; t0 = t1; }
    return t0; };
  const reset = async () => { await drive(70000); await pick("PLANNED"); await click(tabBtn("dashboard")); await flush(60); };
  const grab = () => {
    const t = text(), m = re => (t.match(re) || [])[1];
    const hdr = [...body().querySelectorAll("div")].find(d => d.textContent === "ROTH BAL" && d.children.length === 0);
    const cellEls = hdr ? [...hdr.parentElement.children] : [];
    const cells = cellEls.map(c => c.textContent.trim());
    // the exact taxable income: v6.48's RATE cell carries it (data-dc-taxable — the build review: "$0K" covers up to $499); null on v6.47
    const ex = el => { const v = el && el.getAttribute("data-dc-taxable"); return v == null ? null : +v; };
    const rows = []; for (let i = 9; i + 8 < cells.length; i += 9) rows.push({ year: +cells[i], conv: cells[i + 1], taxable: cells[i + 2], rate: cells[i + 3], tax: cells[i + 4],
      magi: cells[i + 5], irmaa: cells[i + 6], trad: cells[i + 7], roth: cells[i + 8], tx: ex(cellEls[i + 3]) });
    const tableText = collapse(cellEls.map(c => c.textContent).join(""));
    const ds = k => { const e = body().querySelector(`[data-dc-ladder-start="${k}"]`); return e ? num(e.textContent.replace(/[$\s]/g, "")) : null; };
    return { text: t, rows, tableText,
      tradCard: ds("trad") ?? num(m(/Traditional bal \(now\)\s*\$([\d,]+)/)), rothCard: ds("roth") ?? num(m(/Roth bal \(now\)\s*\$([\d,]+)/)),
      tradLabelYr: num(m(/Traditional at retirement \((\d{4})\)/)), rothLabelYr: num(m(/Roth at retirement \((\d{4})\)/)),
      nowLabels: (t.match(/(?:Traditional|Roth) bal \(now\)/g) || []).length,
      notes: ["trad", "roth"].map(k => (body().querySelector(`[data-dc-ladder-start-note="${k}"]`) || {}).textContent || null),
      start: num(m(/ROTH CONVERSION STRATEGY — (\d{4})/)) };
  };
  const unmount = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} };
  return { DG, DT, DP0, DX0, visit, reset, grab, unmount };
};

// §D's plans — the same list in both processes
const D_PLANS = async (P0) => {
  const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const out = [["example", clone(P0), {}], ["example -1 YEAR", clone(P0), { sel: "-1 YEAR" }], ["example +1 YEAR", clone(P0), { sel: "+1 YEAR" }],
    ["example $0", clone(P0), { slide: 0 }], ["example $250K", clone(P0), { slide: 250000 }], ["zeroIncome $0", zeroIncome(P0), { slide: 0 }]];
  for (const n of Object.keys(HOUSEHOLDS)) { const P = clone(P0); HOUSEHOLDS[n].apply(P); out.push([`fixture ${n}`, P, {}]); }
  return out;
};
if (DUMP) {
  const app = await mountApp(VER), out = {};
  for (const [nm, P, o] of await D_PLANS(app.DP0)) { _src = mulberry(112); await app.visit(P, o); const g = app.grab(); out[nm] = { text: rothPart(g.text), rows: g.rows, tableText: g.tableText }; await app.reset(); }
  await app.unmount();
  writeFileSync(process.argv[4], JSON.stringify(out));
  process.exit(0);
}

const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T112_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t112 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t112 — THE ROTH LADDER'S STARTING-BALANCE CARDS AND RATE COLUMN (${VER})`);

// ── §A · the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source");
{
  const strs = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "JSXText" || n.type === "TemplateElement")
    .map(({ n }) => n.type === "TemplateElement" ? (n.value.cooked || "") : String(n.value));
  const nowLbl = strs.filter(s => /(?:Traditional|Roth) bal \(now\)/.test(s)).length;
  const decl = name => all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === name);
  const mr = decl("marginalRate");
  const mrInit = mr.length === 1 && mr[0].n.init && mr[0].n.init.type === "Literal" ? mr[0].n.init.value : null;
  // the identifiers the two cards' value expressions read: every JSXExpressionContainer inside the element carrying data-dc-ladder-start,
  // or (v6.47) the div right after the "(now)" label
  // A JSX read is an identifier whose innermost JSXExpressionContainer is a child of an element and has no function between it and the
  // identifier. (The whole ladder is an IIFE inside one big container in the render, so "inside some container" is true of every name in it.)
  const FN = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
  const reads = name => all(AST, n => n.type === "Identifier" && n.name === name).some(({ anc }) => {
    let k = -1; for (let i = anc.length - 1; i >= 0; i--) if (anc[i].type === "JSXExpressionContainer") { k = i; break; }
    return k > 0 && anc[k - 1].type === "JSXElement" && !anc.slice(k + 1).some(a => FN.has(a.type)); });
  if (POST) {
    T("A-1 no \"bal (now)\" label is left in the source", nowLbl === 0, `found ${nowLbl}`);
    const lbl = all(AST, n => n.type === "JSXText" && /^(?:Traditional|Roth) at retirement \($/.test(n.value.trim())).length;
    T(`A-2 two labels read "… at retirement (" followed by the selected year (found ${lbl})`, lbl === 2);
    const ts = decl("_tradStartL"), rs = decl("_rothStartL");
    const tsOk = ts.length === 1 && ts[0].n.init.type === "BinaryExpression" && ts[0].n.init.operator === "+" && ts[0].n.init.left.name === "tradBalA" && ts[0].n.init.right.name === "tradBalB";
    const rsOk = rs.length === 1 && rs[0].n.init.type === "Identifier" && rs[0].n.init.name === "rothBal0";
    T("A-3 the cards' figures are the ladder's carried start: _tradStartL = tradBalA + tradBalB, _rothStartL = rothBal0 (declared once each)", tsOk && rsOk);
    // declared before the loop moves them: each declaration precedes the `rows` array the loop fills
    const rowsDecl = decl("rows").filter(x => x.n.init && x.n.init.type === "ArrayExpression").map(x => x.n.start);
    T("A-4 …and declared before the ladder's loop (ahead of its `rows`), so they hold the start, not a later year", ts.length === 1 && rowsDecl.some(p => ts[0].n.start < p && p - ts[0].n.start < 4000));
    T("A-5 the cards read _tradStartL and _rothStartL in JSX, and nothing reads _tradFromPortfolio or _rothFromPortfolio in JSX",
      reads("_tradStartL") && reads("_rothStartL") && !reads("_tradFromPortfolio") && !reads("_rothFromPortfolio"));
    T(`A-6 the ladder's marginal rate starts at 0 (declared once; init ${mrInit})`, mr.length === 1 && mrInit === 0);
    const attr = all(AST, n => n.type === "JSXAttribute" && n.name && n.name.name === "data-dc-ladder-start").map(({ n }) => n.value && n.value.value).sort();
    T("A-7 two elements carry data-dc-ladder-start, \"roth\" and \"trad\"", JSON.stringify(attr) === '["roth","trad"]', attr.join(","));
  } else {
    T(`A-1 ${KD34}: two "bal (now)" labels`, nowLbl === 2, `found ${nowLbl}`);
    T(`A-5 ${KD34}: the cards read _tradFromPortfolio and _rothFromPortfolio (retireStartBalances, uncarried)`, reads("_tradFromPortfolio") && reads("_rothFromPortfolio"));
    T(`A-6 ${KD35}: the ladder's marginal rate starts at 0.10`, mr.length === 1 && mrInit === 0.1);
  }
}

// ── §B · the cards, rendered ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the cards");
const app = await mountApp(VER);
const P0 = app.DP0;
const RSB = yr => (app.DG.retireStartBalances || app.DT.retireStartBalances)(yr);
const asOfYr = P => +String(P.asOf).slice(0, 4);
// HARNESS TRAP: the DOM bundle's `__g` exports getters — SCENARIOS is a function there (its first draft read it as a table: inflation 0, carry 1)
const SCEN = () => typeof app.DG.SCENARIOS === "function" ? app.DG.SCENARIOS() : app.DG.SCENARIOS;
const expected = (P, yr) => { const s = RSB(yr), RB = factor(planInflation(SCEN()), yr, asOfYr(P));
  return { trad: carryHold(s.tradInitA || 0, s.accTradA || 0, RB) + carryHold(s.tradInitB || 0, s.accTradB || 0, RB),
           roth: carryHold(s.rothInitA || 0, s.accRothA || 0, RB) + carryHold(s.rothInitB || 0, s.accRothB || 0, RB),
           tradRaw: s.tradInit, rothRaw: s.rothInit, accTrad: (s.accTradA || 0) + (s.accTradB || 0), RB }; };
const R = {};
for (const [nm, f, o] of B_PLANS) { _src = mulberry(112); const P = f(P0); await app.visit(P, o); const g = app.grab(); g.exp = expected(P, g.start); g.P = P; R[nm] = g; await app.reset(); }
// B-1 ties the model's input to the plan: the example's Traditional holdings, from its own fields, are the constructor's total less its accrual
{
  const holdT = P0.positions.reduce((s, p) => s + (p.trad || 0), 0) + P0.otherAccounts.filter(a => ["trad", "annuity"].includes(a.taxType)).reduce((s, a) => s + a.balance, 0);
  const holdR = P0.positions.reduce((s, p) => s + (p.roth || 0), 0) + P0.otherAccounts.filter(a => a.taxType === "roth").reduce((s, a) => s + a.balance, 0);
  const e = R.example.exp;
  T(`B-1 SETUP: the example's Traditional holdings from its fields ($${holdT.toLocaleString("en-US")}) are the constructor's start ($${e.tradRaw.toLocaleString("en-US")}) less its accrual ($${e.accTrad.toLocaleString("en-US")}); Roth $${holdR.toLocaleString("en-US")}`,
    holdT === 1296000 && e.tradRaw - e.accTrad === holdT && e.rothRaw === holdR);
  T(`B-2 SETUP: the selected years are 2029 (PLANNED), 2028, 2030, 2033 (later) and 2024 (retired) (got ${["example", "example -1 YEAR", "example +1 YEAR", "later", "retired"].map(k => R[k].start).join(", ")})`,
    R.example.start === 2029 && R["example -1 YEAR"].start === 2028 && R["example +1 YEAR"].start === 2030 && R.later.start === 2033 && R.retired.start === 2024);
}
const near = (a, b) => a != null && Math.abs(a - Math.round(b)) <= 1;
for (const [nm] of B_PLANS) {
  const g = R[nm], e = g.exp;
  if (POST) {
    T(`B-3 ${nm}: the Traditional card is the ladder's carried start, $${Math.round(e.trad).toLocaleString("en-US")} (got $${(g.tradCard ?? NaN).toLocaleString("en-US")})`, near(g.tradCard, e.trad));
    T(`B-4 ${nm}: the Roth card is the carried start, $${Math.round(e.roth).toLocaleString("en-US")} (got $${(g.rothCard ?? NaN).toLocaleString("en-US")})`, near(g.rothCard, e.roth));
    T(`B-5 ${nm}: both labels name the selected year, ${g.start} (got ${g.tradLabelYr}, ${g.rothLabelYr}), and no "(now)" label renders`, g.tradLabelYr === g.start && g.rothLabelYr === g.start && g.nowLabels === 0);
    // the note under each card says what the figure is, with the same year (the build review: its year was unchecked)
    const past = g.start < asOfYr(g.P), want = (past ? `today's holdings in ${g.start}'s dollars (the retirement year is before the plan's as-of date)`
      : `today's holdings carried to ${g.start} at the plan's inflation, plus the planned contributions — in ${g.start}'s dollars`) + (g.rows.length > 0 ? " — the ladder's start" : "");
    T(`B-5b ${nm}: each card's note reads "${want}" (got "${g.notes[0]}")`, g.notes[0] === want && g.notes[1] === want);
  } else {
    T(`B-3 ${KD34} ${nm}: the Traditional card is today's holdings plus the accrual, uncarried — $${e.tradRaw.toLocaleString("en-US")} (got $${(g.tradCard ?? NaN).toLocaleString("en-US")})`, g.tradCard === Math.round(e.tradRaw));
    T(`B-4 ${KD34} ${nm}: the Roth card is uncarried — $${e.rothRaw.toLocaleString("en-US")} (got $${(g.rothCard ?? NaN).toLocaleString("en-US")})`, g.rothCard === Math.round(e.rothRaw));
  }
}
// the three figures differ on the example (the card's figure was neither), the hand pins of the scope's §0.1, and the degenerate shapes
{
  const e = R.example.exp;
  T(`B-6 the example's three Traditional figures differ: today's $1,296,000, the v6.47 card's $${e.tradRaw.toLocaleString("en-US")}, the ladder's start $${Math.round(e.trad).toLocaleString("en-US")} (BULL-LEANING, the page's opening prior; the carry ${e.RB.toFixed(6)})`,
    e.tradRaw === 1398600 && Math.round(e.trad) === 1499680 && Math.round(e.roth) === 339568);
  T(`B-7 noContrib: nothing accrues, so its card is its holdings × the carry exactly (accrual ${R.noContrib.exp.accTrad})`, R.noContrib.exp.accTrad === 0 && Math.abs(R.noContrib.exp.trad - R.noContrib.exp.tradRaw * R.noContrib.exp.RB) < 1e-6);
  T(`B-8 noRoth's Roth card and noTrad's Traditional card read $0 on either leg (got ${R.noRoth.rothCard}, ${R.noTrad.tradCard})`, R.noRoth.rothCard === 0 && R.noTrad.tradCard === 0);
  T(`B-9 the later retirement carries further: its card is above the example's (${R.later.tradCard} > ${R.example.tradCard})`, R.later.tradCard > R.example.tradCard);
  if (POST) {
    T(`B-10 the plan already retired (2024, dated 2026) deflates: its card is below today's holdings plus the accrual (${R.retired.tradCard} < ${R.retired.exp.tradRaw}; the carry ${R.retired.exp.RB.toFixed(6)})`,
      R.retired.exp.RB < 1 && R.retired.tradCard < R.retired.exp.tradRaw);
    T(`B-11 the annuity plan's Traditional card carries the $100,000 annuity with the rest — above the example's by $100,000 × the carry (${R.annuity.tradCard} − ${R.example.tradCard})`,
      Math.abs((R.annuity.tradCard - R.example.tradCard) - 100000 * R.example.exp.RB) <= 2);   // two rounded cards: within $2
  }
}

// ── §C · the RATE column with no taxable income ───────────────────────────────────────────────────────────────────────────────────
console.log("  C — the RATE column");
_src = mulberry(112); await app.visit(zeroIncome(P0), { slide: 0 }); const Z = app.grab(); await app.reset();
_src = mulberry(112); await app.visit(clone(P0)); const E70 = app.grab(); await app.reset();
// The ladder runs to the year before spouse B's RMDs (2040); spouse A's begin in 2039 (born 1964, 75), so its last two rows carry A's RMD.
// Before 2039 the plan has no income at all: taxable income exactly $0.
const Z0 = Z.rows.filter(r => r.year < 2039), Z1 = Z.rows.filter(r => r.year >= 2039);
// v6.48 carries each row's exact taxable income on its RATE cell; v6.47 has none, so its leg reads the rounded cell
const isZero = r => r.tx == null ? r.taxable === "$0K" : r.tx === 0;
T(`C-0 SETUP: the no-income plan at a $0 slider renders a ladder converting nothing, 2029–2038 with $0 of taxable income, 2039–2040 with A's RMD (${Z.rows.length} rows: ${Z.rows.map(r => r.year + " " + (r.tx ?? r.taxable)).join(", ")})`,
  Z.rows.length === 12 && Z.rows.every(r => r.conv === "$0K") && Z0.length === 10 && Z0.every(isZero) && Z1.every(r => !isZero(r)));
if (POST) T("C-0b SETUP: every v6.48 row carries its exact taxable income (data-dc-taxable)", [...Z.rows, ...E70.rows].every(r => typeof r.tx === "number" && Number.isFinite(r.tx)));
if (POST) T(`C-1 every year with no taxable income reads 0% (got ${[...new Set(Z0.map(r => r.rate))].join(" ")})`, Z0.length === 10 && Z0.every(r => r.rate === "0%"));
else T(`C-1 ${KD35}: every year with no taxable income reads 10% (got ${[...new Set(Z0.map(r => r.rate))].join(" ")})`, Z0.length === 10 && Z0.every(r => r.rate === "10%"));
T(`C-1b …and the RMD years read their bracket, not 0% (${Z1.map(r => r.year + " " + r.rate).join(", ")})`, Z1.length === 2 && Z1.every(r => r.rate !== "0%"));
T(`C-2 the example at $70,000 has taxable income every year, so no year reads 0% (rates: ${E70.rows.map(r => r.rate).join(" ")})`, E70.rows.length === 12 && E70.rows.every(r => !isZero(r) && r.rate !== "0%"));
// C-3 · the bracket of every taxed row (the scope's §2 §C): the rate is the bracket holding the row's last taxed dollar, from the 2026 tables
// typed here (Rev. Proc. 2025-32) indexed from 2026 at the plan's inflation less 0.25 point (C-CPI-U, §1(f)(3) — units_v630's `chained`).
// Rows within 0.5% of a bracket top are left out (the app rounds its indexed tops; a hair either side would read the next rate).
if (POST) {
  const TOPS = { joint: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]],
                 single: [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]] };
  const i = planInflation(SCEN());
  const rateOf = (tx, yr, st) => { const k = chained(i, yr, 2026); for (const [r, top] of TOPS[st]) if (tx <= top * k) return { r, near: TOPS[st].some(([, t]) => Math.abs(tx - t * k) < 0.005 * t * k) }; };
  const plans = [["example $70K", E70, "joint"], ["no-income $0 (RMD years)", Z, "joint"], ["single", R.single, "single"]];
  let checked = 0; const bad = [];
  for (const [nm, g, st] of plans) for (const r of g.rows) { if (!(r.tx > 0)) continue; const x = rateOf(r.tx, r.year, st); if (x.near) continue; checked++;
    if (r.rate !== `${Math.round(x.r * 100)}%`) bad.push(`${nm} ${r.year}: taxable ${Math.round(r.tx)} → ${x.r * 100}% expected, ${r.rate} shown`); }
  T(`C-3 every taxed row's rate is the bracket of its taxable income (${checked} rows on three plans, the example's joint and the single plan's own table)`, checked >= 20 && bad.length === 0, bad.slice(0, 3).join(" | "));
}
await app.unmount();

// ── §D · the Roth tab, against v6.47 ──────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — against v6.47");
// T112_CONTROLS_SKIP_D is the negative controls' switch only (qa/tools/controls_v648_roth_cards.py), never set by runsuite.sh: §D takes most of
// a run and no control's planted defect needs it to show.
if (process.env.T112_CONTROLS_SKIP_D === "1") console.log("     (§D skipped: T112_CONTROLS_SKIP_D — the negative controls' switch)");
else if (POST && existsSync(join(HERE, `dom_${D_PRIOR}.cjs`))) {
  const out = join(tmpdir(), `t112_${process.pid}.json`);
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), D_PRIOR, "--dumpdom", out], { cwd: HERE, encoding: "utf8", maxBuffer: 1 << 26, timeout: 1500000 });
  const prior = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null; try { unlinkSync(out); } catch (e) {}
  T("D-0 SETUP: the v6.47 leg dumped every plan", prior && Object.keys(prior).length >= 6, r.stderr && r.stderr.slice(0, 300));
  if (prior) {
    const app2 = await mountApp(VER), cur = {};
    for (const [nm, P, o] of await D_PLANS(app2.DP0)) { _src = mulberry(112); await app2.visit(P, o); const g = app2.grab(); cur[nm] = { text: rothPart(g.text), rows: g.rows, tableText: g.tableText }; await app2.reset(); }
    await app2.unmount();
    const CARDS_OLD = /Traditional bal \(now\)\$[\d,]+Roth bal \(now\)\$[\d,]+/;
    const NOTE = "today's holdings (?:carried to \\d{4} at the plan's inflation, plus the planned contributions — in \\d{4}'s dollars|in \\d{4}'s dollars \\(the retirement year is before the plan's as-of date\\))(?: — the ladder's start)?";
    const CARDS_NEW = new RegExp(`Traditional at retirement \\(\\d{4}\\)\\$[\\d,]+${NOTE}Roth at retirement \\(\\d{4}\\)\\$[\\d,]+${NOTE}`);
    const bad = [], rateMoves = [];
    let masks = 0;
    for (const nm of Object.keys(prior)) {
      const a = prior[nm], b = cur[nm]; if (!b) { bad.push(`${nm}: missing on v6.48`); continue; }
      // the version only (the footer reads "DANGER CLOSE v6.4x"); a figure such as "$6.47M" is not masked
      const nv = t => t.replace(/\s+/g, "").replace(/DANGERCLOSEv6\.4[78]│/g, "DANGERCLOSEv6.4x│");
      const ta = nv(a.text), tb = nv(b.text);
      const ca = (ta.match(new RegExp(CARDS_OLD.source.replace(/ /g, ""), "g")) || []).length, cb = (tb.match(new RegExp(CARDS_NEW.source.replace(/ /g, ""), "g")) || []).length;
      if (ca !== 1 || cb !== 1) { bad.push(`${nm}: the card mask bit ${ca} / ${cb} times`); continue; }
      const tblA = a.tableText.replace(/\s+/g, ""), tblB = b.tableText.replace(/\s+/g, "");
      const strip = (t, cardRe, tbl) => { let x = t.replace(new RegExp(cardRe.source.replace(/ /g, "")), "[CARDS]"); if (tbl) { const i = x.indexOf(tbl); if (i < 0) return null; x = x.slice(0, i) + "[TABLE]" + x.slice(i + tbl.length); } return x; };
      const sa = strip(ta, CARDS_OLD, tblA), sb = strip(tb, CARDS_NEW, tblB);
      if (sa === null || sb === null) { bad.push(`${nm}: the table mask did not bite`); continue; }
      masks++;
      if (sa !== sb) { let i = 0; while (i < sa.length && sa[i] === sb[i]) i++; bad.push(`${nm}: text differs at ${i}: …${sa.slice(Math.max(0, i - 60), i + 60)} | …${sb.slice(Math.max(0, i - 60), i + 60)}`); continue; }
      if (a.rows.length !== b.rows.length) { bad.push(`${nm}: ${a.rows.length} rows vs ${b.rows.length}`); continue; }
      a.rows.forEach((ra, k) => { const rb = b.rows[k];
        for (const c of ["year", "conv", "taxable", "tax", "magi", "irmaa", "trad", "roth"]) if (ra[c] !== rb[c]) bad.push(`${nm} ${ra.year} ${c}: ${ra[c]} vs ${rb[c]}`);
        // a move is allowed only where v6.48's exact taxable income is $0 (the build review: "$0K" covers up to $499)
        if (ra.rate !== rb.rate) { if (rb.tx === 0 && ra.rate === "10%" && rb.rate === "0%") rateMoves.push(`${nm} ${ra.year}`); else bad.push(`${nm} ${ra.year} rate: ${ra.rate} vs ${rb.rate} (taxable ${rb.tx})`); }
        else if (rb.tx === 0 && rb.rate !== "0%") bad.push(`${nm} ${ra.year}: taxable exactly $0 but ${rb.rate}`); });
    }
    T(`D-1 on ${Object.keys(prior).length} plans the Roth tab's text equals v6.47's but for the two cards (each mask bit once a side, ${masks} plans) and the table, compared cell by cell`, bad.length === 0 && masks === Object.keys(prior).length, bad.slice(0, 4).join(" || "));
    T(`D-2 the only cells that move are RATE cells of $0-taxable years, 10% → 0% (${rateMoves.length}: ${rateMoves.slice(0, 6).join(", ")}${rateMoves.length > 6 ? ", …" : ""})`,
      bad.length === 0 && rateMoves.length >= 10 && rateMoves.some(x => x.startsWith("zeroIncome")));
  }
} else console.log(`     (§D: ${POST ? `no dom_${D_PRIOR}.cjs in this folder — a later run folder holds none by construction; skipped` : "the v6.47 leg pins the defects; §D runs on the v6.48 leg"})`);

// ── §E · the Field Manual ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the Field Manual");
{
  const D0 = all(AST, n => n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML");
  const DOCS = D0.length === 1 && D0[0].n.init.type === "Literal" ? D0[0].n.init.value : "";
  T("E-0 SETUP: the Field Manual is read from the source (one DOCS_HTML string)", DOCS.length > 100000);
  const OLD = "and current Traditional/Roth balances (derived from your positions)";
  const NOTE = "The Roth ladder’s starting balances and its rate column (v6.48).";
  if (POST) {
    T("E-1 the Roth entry no longer calls the cards current balances, and says they are the balances the ladder starts from, carried",
      !DOCS.includes(OLD) && DOCS.includes("the Traditional and Roth balances it starts from at the selected retirement year — your holdings carried to that year at the plan’s inflation"));
    T("E-2 §13 carries the v6.48 note first, ahead of v6.47's", DOCS.includes(NOTE) && DOCS.indexOf(NOTE) < DOCS.indexOf("SSA’s spousal benefit (v6.47)."));
    T("E-3 the note names the figures and both fixes, and says no engine figure changed",
      ["$1,398,600 against $1,499,680 on the example as it opens", "labelled with the retirement year", "it now reads 0%", "No figure any engine computes changed"].every(s => DOCS.includes(s)));
  } else {
    T(`E-1 ${KD34}: the Roth entry calls the cards current balances`, DOCS.includes(OLD));
    T("E-2 (v6.47): no v6.48 note", !DOCS.includes(NOTE));
  }
}

console.log(`\nt112 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
