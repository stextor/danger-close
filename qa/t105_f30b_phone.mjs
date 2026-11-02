// t105 — MY DATA, SOCIAL SECURITY, EXPENSES AND TAXES ON A PHONE; F-31; THE ROTH CALENDAR'S LABELS (v6.41, F-30 second part)
//
//  Scope: docs/SCOPE_F30B_PHONE_V641.md (DG-1 to DG-9, all (a), taken as recommended under Steve's instruction). Through v6.40, on a phone,
//  the v5.79 grids of these four tabs let their columns shrink below their text (`minmax(0, 1fr)`) and printed it over itself (My Data 8,
//  SS 10, Expenses 4, Taxes 2 pairs at 390 px); the Expenses tab's monthly category column (85 px, since the first commit) ran "Transportation"
//  under its item at every width; the Roth calendar's CONVERT labels ran past their cards below about 690 px; a Withdrawal panel widened a 360 px
//  page and a Monte Carlo panel overprinted there; and the stream plan's Income tab was 626 px wide in a 600 px window (F-31). Display only:
//  no engine, table, stored field or word changes.
//
//  LAYOUT IS t45's. jsdom does no layout, so this suite holds the STRUCTURE; t45 §S-10 measures in Chromium.
//
//  §A  the source, by AST: the three new phone rules sit inside `@media (max-width: 599px)` only; `.dc-cards-sub700` inside `@media
//      (max-width: 699px)` only; `.dc-streamrow { flex-wrap: wrap; }` outside every media block (F-31). Each site carries its class, its
//      floor or its column. EXTINCTION — on the five tabs (My Data, Social Security, Expenses, Taxes, Income) no grid with two or more tracks
//      that can shrink to zero stands unprotected (`repeat()` expanded, both branches of a conditional template read): it must be a DOM child of
//      a `dc-scrollx` box (floor, if set, at least 200 px), carry its own minWidth of at least 200 px, carry a phone class, or be on the named
//      list with its reason. An `overflowX: auto` parent alone is not protection (the SS claiming grid sat in one and overprinted).
//  §B  the rendered text of the five tabs, Withdrawal and Monte Carlo on the example — and of the five on a single plan and a plan with no ACA
//      bridge — is IDENTICAL to v6.40's (a child process dumps the v6.40 leg; both seeded alike before the app loads, tabs visited in the same
//      order). Required in the v6.40 → v6.41 run; any later run folder holds no v6.40 bundle, and there §B prints a skip line.
//  §C  the Field Manual: §13's desktop item says no tab overprints at UI SIZE 100% and keeps the UI SIZE disclosure; the v6.40 note's last
//      sentence; the v6.41 note, first.
//  The v6.40 leg pins each defect as a dated [KNOWN DEFECT 2026-10-31, F-30 — flips at v6.41].
//  Both legs: node t105_f30b_phone.mjs v640 | node t105_f30b_phone.mjs v641. Controls: qa/tools/controls_v641_phone.py (repo-only).
//  Exits with process.exit (the rendered app leaves timers running).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(105); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load; the dump child does the same
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v641";
const DUMP = process.argv.includes("--dump");
const KNOWN_VERSIONS = ["v640", "v641"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v641"].includes(VER);   // an array, so the next registration widens it
const B_PRIOR = "v640";                // §B's comparison leg — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-31, F-30 — flips at v6.41]";
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T105_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished && !DUMP) { console.log(`t105 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const require = createRequire(import.meta.url);
if (!DUMP) console.log(`t105 — MY DATA, SOCIAL SECURITY, EXPENSES AND TAXES ON A PHONE; F-31; THE ROTH CALENDAR'S LABELS (${VER})`);

// ── the DOM first: §B's seeded renders must consume Math.random in the same order on both legs ─────────────────────────────────────
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
// Text without cloning (t101's trap): walk the text nodes, skip <style>/<script>.
const txt = () => { const w = window.document.createTreeWalker(body(), 4); let out = "", n;
  while ((n = w.nextNode())) { const p = n.parentNode && n.parentNode.nodeName; if (p !== "STYLE" && p !== "SCRIPT") out += n.nodeValue; } return out.replace(/\s+/g, " "); };
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root = null, act, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); for (let i = 0; i < 6; i++) await flush(); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
  if (expenses !== undefined) put("expenses", expenses); await render(); };
// A tab's page text, up to the footer (whose version string differs between the legs by design).
const pageText = () => { const t = txt(); const j = t.indexOf("DANGER CLOSE v6."); return j < 0 ? t : t.slice(0, j); };

await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
const EXP = clone(DG.PORTFOLIO()), EXE = clone(DG.EXPENSES());
// The plans §B renders, as t104 builds them: the example; the example made single (as t6 makes one); the example with no ACA premium.
const single = () => { const P = clone(EXP); P.single = true; P.nameB = ""; P.positions = (P.positions || []).map(p => ({ ...p, owner: "A" }));
  P.otherAccounts = (P.otherAccounts || []).map(a => ({ ...a, owner: "A" })); P.incomeStreams = [];
  P.contributions = { ...P.contributions, spouseBMonthly: 0, contribPreTaxB: 0, contribRothB: 0 };
  if (P.incomeSources && P.incomeSources.ssB) P.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 }; return P; };
const noAca = () => { const P = clone(EXP); P.acaBridge = { ...(P.acaBridge || {}), premium: 0 }; return P; };
// Tab buttons carry their labels (TAB_LABELS): "my data", "monte carlo"; the rest their ids.
const F5 = ["my data", "ss", "expenses", "taxes", "income"], ALL7 = [...F5, "withdrawal", "monte carlo"];
const TEXTS = {};
for (const [name, mk, tabs] of [["example", null, ALL7], ["single", single, F5], ["noaca", noAca, F5]]) {
  if (mk) await seed(mk(), clone(EXE));
  for (const tab of tabs) { await go(tab); TEXTS[`${name}|${tab}`] = pageText(); }
}
// The dump goes to a file the parent names: seventeen texts overflow a pipe, and process.exit() does not wait for a pipe to drain (t104's six fit).
if (DUMP) { writeFileSync(process.argv[process.argv.indexOf("--dump") + 1], JSON.stringify(TEXTS)); finished = true; process.exit(0); }

// ── §A · the source ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const PARENT = new Map();
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) { PARENT.set(c, root); all(c, pred, out); } return out; };
all(AST, () => false);   // fill PARENT
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);
const SHEET = all(AST, n => n.type === "TemplateLiteral" && n.quasis.some(q => (q.value.cooked || "").includes("@media (max-width: 599px)")));
const CSS = SHEET.length === 1 ? SHEET[0].quasis.map(q => q.value.cooked).join("") : "";
const blockOf = (css, at) => { const i = css.indexOf(at); if (i < 0) return ""; let d = 0, j = css.indexOf("{", i);
  for (let k = j; k < css.length; k++) { if (css[k] === "{") d++; else if (css[k] === "}" && --d === 0) return css.slice(j + 1, k); } return ""; };
const PHONE = blockOf(CSS, "@media (max-width: 599px)"), SUB700 = blockOf(CSS, "@media (max-width: 699px)");
const OUTSIDE = CSS.replace(PHONE, "").replace(SUB700, "");   // the sheet less both blocks' bodies
T("A-0 SETUP: one stylesheet holds the phone block, and the dc-scrollx rules stand outside it (the child's minimum is var(--dc-floor, 600px))",
  SHEET.length === 1 && PHONE.length > 50 && /\.dc-scrollx > \* \{ min-width: var\(--dc-floor, 600px\); \}/.test(OUTSIDE), `${SHEET.length} ${PHONE.length}`);
const once = (css, sel) => css.split(sel + " {").length === 2;
if (POST) {
  T("A-1 the three new phone rules are inside the phone block, once each, and nowhere else: My Data's flex rows wrap; the export row and its input may shrink",
    once(PHONE, ".dc-wrap-phone") && once(PHONE, ".dc-export-phone") && once(PHONE, ".dc-export-phone > input")
    && /\.dc-wrap-phone \{ flex-wrap: wrap !important; \}/.test(PHONE) && /\.dc-export-phone \{ max-width: 100%; \}/.test(PHONE)
    && /\.dc-export-phone > input \{ min-width: 0; flex-shrink: 1; \}/.test(PHONE)
    && !OUTSIDE.includes(".dc-wrap-phone") && !OUTSIDE.includes(".dc-export-phone") && !SUB700.includes(".dc-wrap-phone") && !SUB700.includes(".dc-export-phone"));
  T("A-1b .dc-cards-sub700 is inside one max-width: 699px block, once, and nowhere else: the phone's card layout (84 px cards, the minimum lifted)",
    CSS.split("@media (max-width: 699px)").length === 2 && once(SUB700, ".dc-cards-sub700") && !PHONE.includes("dc-cards-sub700") && !OUTSIDE.includes("dc-cards-sub700")
    && /\.dc-cards-sub700 \{ grid-template-columns: repeat\(auto-fill, minmax\(84px, 1fr\)\) !important; min-width: 0 !important; \}/.test(SUB700));
  T("A-1c F-31: .dc-streamrow { flex-wrap: wrap; } stands outside every media block, once — an income stream's row wraps at any width (its parts' rules stay phone-only)",
    OUTSIDE.split(".dc-streamrow { flex-wrap: wrap; }").length === 2 && OUTSIDE.split(".dc-streamrow").length === 2 && /\.dc-streamrow \{ flex-wrap: wrap; row-gap: 2px; \}/.test(PHONE));
} else {
  T(`A-1 ${KD} none of the new rules exists, and the stream row wraps only in the phone block`,
    !CSS.includes("dc-wrap-phone") && !CSS.includes("dc-export-phone") && !CSS.includes("dc-cards-sub700") && !OUTSIDE.includes(".dc-streamrow"));
}

// The renders: My Data is a component (MyDataEditor); the others `activeTab === "<id>" && …`, the test read as the chain's LEFT-MOST operand
// (`activeTab === "ss" && !x && (…)` nests the test two deep), and only the outermost chain of each kept. Social Security has two plain
// renders and two such chains.
const leftmost = n => { while (n.type === "LogicalExpression") n = n.left; return n; };
const tabNodes = id => { const ns = all(AST, n => { if (n.type !== "LogicalExpression" || n.operator !== "&&") return false; const l = leftmost(n);
    return l.type === "BinaryExpression" && l.left.type === "Identifier" && l.left.name === "activeTab" && l.right.type === "Literal" && l.right.value === id; });
  return ns.filter(n => !ns.some(o => o !== n && o.range[0] <= n.range[0] && n.range[1] <= o.range[1])); };
const R = { mydata: all(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "MyDataEditor"), ss: tabNodes("ss"), expenses: tabNodes("expenses"),
  taxes: tabNodes("taxes"), income: tabNodes("income"), withdrawal: tabNodes("withdrawal"), montecarlo: tabNodes("montecarlo"), roth: tabNodes("roth") };
T("A-2 SETUP: one render each for My Data, Expenses, Taxes, Income, Withdrawal and Roth; two for Monte Carlo; four for Social Security",
  R.mydata.length === 1 && R.ss.length === 4 && R.montecarlo.length === 2 && ["expenses", "taxes", "income", "withdrawal", "roth"].every(k => R[k].length === 1),
  Object.entries(R).map(([k, v]) => `${k}:${v.length}`).join(" "));
const attr = (op, name) => op.attributes.find(a => a.type === "JSXAttribute" && a.name && a.name.name === name);
const classOf = op => { const a = attr(op, "className"); return a && a.value && a.value.type === "Literal" ? String(a.value.value) : ""; };
const styleObj = op => { const a = attr(op, "style"); return a && a.value && a.value.type === "JSXExpressionContainer" && a.value.expression.type === "ObjectExpression" ? a.value.expression : null; };
const propOf = (obj, key) => obj && obj.properties.find(p => p.type === "Property" && ((p.key.type === "Identifier" && p.key.name === key) || (p.key.type === "Literal" && p.key.value === key)));
const lit = n => n && n.type === "Literal" ? n.value : undefined;
const templates = n => !n ? [] : n.type === "Literal" ? [String(n.value)] : n.type === "ConditionalExpression" ? [...templates(n.consequent), ...templates(n.alternate)] : [null];
const tracks = t => { const out = []; let s = t.trim(); const toks = []; let d = 0, cur = "";
  for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === " " && d === 0) { if (cur) toks.push(cur); cur = ""; } else cur += ch; } if (cur) toks.push(cur);
  for (const tk of toks) { const m = tk.match(/^repeat\((\d+),\s*(.+)\)$/); if (m) { for (let i = 0; i < +m[1]; i++) out.push(...tracks(m[2])); } else out.push(tk); } return out; };
const shrinking = t => tracks(t).filter(x => /^minmax\(0(px)?,/.test(x)).length;
// The nearest enclosing JSX element: the element whose DOM child this one is (through a .map() or a conditional, as `.dc-scrollx > *` sees it).
const parentEl = op => { let n = PARENT.get(PARENT.get(op)); while (n && n.type !== "JSXElement" && n.type !== "JSXFragment") n = PARENT.get(n); return n && n.type === "JSXElement" ? n.openingElement : null; };
const norm = t => (t || "").replace(/\s+/g, "");
const gridsIn = nodes => nodes.flatMap(node => all(node, n => n.type === "JSXOpeningElement" && !!propOf(styleObj(n), "gridTemplateColumns")).map(op => {
  const so = styleObj(op), tps = templates(propOf(so, "gridTemplateColumns").value), par = parentEl(op), el = PARENT.get(op);
  return { op, line: op.loc.start.line, tps, key: tps.map(norm).join("|"), gap: lit((propOf(so, "gap") || {}).value), cls: classOf(op),
    minW: lit((propOf(so, "minWidth") || {}).value), parCls: par ? classOf(par) : "", parFloor: par ? lit((propOf(styleObj(par), "--dc-floor") || {}).value) : undefined,
    text: el ? SRCOF(el) : "", shrink: Math.max(...tps.map(t => t === null ? 99 : shrinking(t))) }; }));
const G = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, gridsIn(v)]));
const M = (...tps) => tps.map(norm).join("|");
const find = (tab, key, f = () => true) => G[tab].filter(g => g.key === key && f(g));
const hasCls = (g, c) => g.cls.split(" ").includes(c);
const FOUR = "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", THREE = "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)", TWO = "minmax(0, 1fr) minmax(0, 1fr)";
const SITES = [
  { k: "a", id: "M1 My Data's household totals", tab: "mydata", key: M("repeat(4,minmax(0, 1fr))"), n: 1, cls: "dc-two-phone" },
  { k: "b", id: "M2 My Data's two asset-class card rows", tab: "mydata", key: M(FOUR), f: g => g.gap === 8, n: 2, cls: "dc-two-phone" },
  { k: "c", id: "M3 My Data's Social Security amount / claim age rows", tab: "mydata", key: M("minmax(0, 1fr) 90px"), n: 2, cls: "dc-stack-phone" },
  { k: "d", id: "M4 My Data's paycheck row", tab: "mydata", key: M("140px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"), n: 1, cls: "dc-two-phone" },
  { k: "e", id: "M6 My Data's birth-date and retirement-year rows", tab: "mydata", key: M(THREE, FOUR), n: 2, cls: "dc-two-phone" },
  { k: "f", id: "M6 My Data's four-column row", tab: "mydata", key: M(FOUR), f: g => g.gap === 12, n: 1, cls: "dc-two-phone" },
  { k: "g", id: "M6 My Data's bonus row", tab: "mydata", key: M("1.2fr minmax(0, 1fr) minmax(0, 1fr) 1.2fr"), n: 1, cls: "dc-two-phone" },
  { k: "h", id: "M6 My Data's spouse B row", tab: "mydata", key: M(TWO, THREE), n: 1, cls: "dc-two-phone" },
  { k: "i", id: "S1 the SS claiming grid (F-8's)", tab: "ss", key: M("repeat(9, minmax(0, 1fr))"), n: 1, cls: "dc-cards-phone" },
  { k: "j", id: "S2 the SS survivor cards", tab: "ss", key: M("repeat(3, minmax(0, 1fr))"), f: g => g.gap === 6, n: 1, cls: "dc-stack-phone" },
  { k: "k", id: "S3 the SS three-column row", tab: "ss", key: M("repeat(3, minmax(0, 1fr))"), f: g => g.gap === 12, n: 1, cls: "dc-stack-phone" },
  { k: "l", id: "E1 the Expenses delta", tab: "expenses", key: M("repeat(4, minmax(0, 1fr))"), n: 1, cls: "dc-stack-phone" },
  { k: "m", id: "T1 the Taxes lifetime tiles", tab: "taxes", key: M("repeat(6, minmax(0, 1fr))"), n: 1, cls: "dc-two-phone" },
  { k: "n", id: "T2 the Taxes income by source", tab: "taxes", key: M("repeat(3, minmax(0, 1fr))"), n: 1, cls: "dc-stack-phone" },
  { k: "o", id: "W1 Withdrawal's Section B cards", tab: "withdrawal", key: M("repeat(3, minmax(0, 1fr))"), f: g => g.text.includes(">Roth conversions and tax<"), n: 1, cls: "dc-stack-phone" },
  { k: "p", id: "C1 Monte Carlo's LTC panel", tab: "montecarlo", key: M("repeat(4, minmax(0, 1fr))"), f: g => g.text.includes(">LTC event cost (median)<"), n: 1, cls: "dc-two-phone" },
];
for (const s of SITES) {
  const f = find(s.tab, s.key, s.f || (() => true));
  if (POST) T(`A-3${s.k} ${s.id}: class ${s.cls}` + (s.n > 1 ? ` (all ${s.n})` : ""), f.length === s.n && f.every(g => hasCls(g, s.cls)), f.map(g => `L${g.line} cls=${g.cls}`).join("; ") || "not found");
  else T(`A-3${s.k} ${KD} ${s.id}: no class`, f.length === s.n && f.every(g => !g.cls), f.map(g => `L${g.line} cls=${g.cls}`).join("; ") || "not found");
}
// E2, E3: the Expenses lists. E2's rows are DOM children of a dc-scrollx box with a 296 px floor (316 with the row's padding); E3's two category columns are 110 px.
{ const e2 = find("expenses", M("110px minmax(0, 1fr) 80px 65px")), e3 = find("expenses", M("110px minmax(0, 1fr) 70px")), e3old = find("expenses", M("85px minmax(0, 1fr) 70px"));
  if (POST) {
    T("A-4a E2 the one-time list: its row is the DOM child of a dc-scrollx box whose --dc-floor is 296px (316 px with the row's padding: its width at a 390 px window)",
      e2.length === 1 && e2[0].parCls.split(" ").includes("dc-scrollx") && e2[0].parFloor === "296px" && /\.erow \{[^}]*padding: 6px 10px;/.test(CSS), e2.map(g => `L${g.line} par=${g.parCls}/${g.parFloor}`).join("; "));
    T("A-4b E3 the two monthly lists' category column is 110 px, as the one-time list's (no 85 px column left)", e3.length === 2 && e3old.length === 0, `${e3.length} ${e3old.length}`);
  } else {
    T(`A-4a ${KD} E2 the one-time list is in no scroll box`, e2.length === 1 && !e2[0].parCls.split(" ").includes("dc-scrollx"), e2.map(g => `L${g.line} par=${g.parCls}`).join("; "));
    T(`A-4b ${KD} E3 the monthly lists' category column is 85 px`, e3old.length === 2 && e3.length === 0, `${e3old.length} ${e3.length}`);
  }
}
// M5: My Data's two flex rows and its export row; R1: the Roth calendar.
{ const withCls = (nodes, c) => nodes.flatMap(nd => all(nd, n => n.type === "JSXOpeningElement" && classOf(n).split(" ").includes(c)));
  const wrap = withCls(R.mydata, "dc-wrap-phone"), exp = withCls(R.mydata, "dc-export-phone"), anyWrap = withCls([AST], "dc-wrap-phone"), anyExp = withCls([AST], "dc-export-phone");
  const r1 = find("roth", M("repeat(9, minmax(0, 1fr))"));
  if (POST) {
    T("A-5a M5 My Data's fee row and paycheck totals row carry dc-wrap-phone, and its export row dc-export-phone (an inline-flex holding an input) — those three only, in the whole app",
      wrap.length === 2 && anyWrap.length === 2 && exp.length === 1 && anyExp.length === 1 && exp[0].name.name === "span" && /<input\b/.test(SRCOF(PARENT.get(exp[0]))), `${wrap.length}/${anyWrap.length} ${exp.length}/${anyExp.length}`);
    T("A-5b R1 the Roth calendar carries dc-cards-phone and dc-cards-sub700, and its own minWidth 600 (DG-6)",
      r1.length === 1 && r1[0].cls === "dc-cards-phone dc-cards-sub700" && r1[0].minW === 600, r1.map(g => `L${g.line} cls=${g.cls} minW=${g.minW}`).join("; "));
  } else {
    T(`A-5a ${KD} M5 no wrap or export class`, anyWrap.length === 0 && anyExp.length === 0);
    T(`A-5b ${KD} R1 the Roth calendar's minWidth is 500 and it has no class for 600–699 px`, r1.length === 1 && r1[0].cls === "dc-cards-phone" && r1[0].minW === 500, r1.map(g => `L${g.line} cls=${g.cls} minW=${g.minW}`).join("; "));
  }
}
// EXTINCTION over the five tabs.
const PHONE_CLASSES = ["dc-cards-phone", "dc-stack-phone", "dc-two-phone"];
const EXEMPT = [   // measured with no overlap at 360–1440 px on five plans at UI SIZE 100–150% (scope §1); each must still match exactly the count
  { tab: "ss", key: M(TWO), n: 4, why: "four two-column grids of short labelled figures (the gap card, the break-even, two summary rows)" },
  { tab: "mydata", key: M("minmax(0, 1fr)", TWO), n: 3, why: "spouse A / spouse B columns, one column for a single plan" },
  { tab: "mydata", key: M(TWO), n: 1, why: "two columns of contribution inputs" },
];
T("A-6 SETUP: each exempt set is still there, at its count (a list that has outlived its sites guards nothing)", EXEMPT.every(e => find(e.tab, e.key).length === e.n),
  EXEMPT.map(e => find(e.tab, e.key).length).join(","));
const exempt = g => EXEMPT.some(e => find(e.tab, e.key).includes(g));
const pxOf = v => typeof v === "number" ? v : typeof v === "string" && /^\s*\d+(\.\d+)?(px)?\s*$/.test(v) ? parseFloat(v) : NaN;
const scrolls = g => g.parCls.split(" ").includes("dc-scrollx") && (g.parFloor === undefined || pxOf(g.parFloor) >= 200);
const floored = g => pxOf(g.minW) >= 200;
const FIVE = ["mydata", "ss", "expenses", "taxes", "income"];
const unprotected = FIVE.flatMap(t => G[t]).filter(g => g.shrink >= 2 && !exempt(g) && !scrolls(g) && !floored(g) && !PHONE_CLASSES.some(c => hasCls(g, c)));
T("A-7 SETUP: the walk sees every grid of the five tabs (v6.40's count: My Data 16, Social Security 10, Expenses 5, Taxes 3, Income 3)",
  G.mydata.length === 16 && G.ss.length === 10 && G.expenses.length === 5 && G.taxes.length === 3 && G.income.length === 3, FIVE.map(t => `${t}:${G[t].length}`).join(" "));
if (POST) T("A-8 EXTINCTION: no grid on the five tabs with two or more tracks that can shrink to zero stands unprotected (a new one fails here)",
  unprotected.length === 0, unprotected.map(g => `L${g.line} ${g.tps.join(" | ")}`).join("; "));
else T(`A-8 ${KD} exactly fifteen grids stand unprotected (M1, M2 ×2, M4, M6 ×5, S1–S3, E1, T1, T2)`, unprotected.length === 15, unprotected.map(g => `L${g.line}`).join(" "));

// ── §B · the rendered text, identical to v6.40's ─────────────────────────────────────────────────────────────────────────────────
console.log("  B — the rendered text");
T("B-0 SETUP: seventeen texts rendered (seven tabs on the example, five on each other plan), each with its tab's own words",
  Object.keys(TEXTS).length === 17 && Object.entries(TEXTS).every(([k, t]) => t.length > 1500)
  && /claim/i.test(TEXTS["example|ss"]) && /One-time/i.test(TEXTS["example|expenses"]) && /LIFETIME TAX/i.test(TEXTS["example|taxes"]) && /LTC event cost/i.test(TEXTS["example|monte carlo"])
  && /Roth conversions and tax/i.test(TEXTS["example|withdrawal"]),
  Object.entries(TEXTS).map(([k, t]) => `${k}:${t.length}`).join(" "));
const NEWEST = readdirSync(HERE).map(f => (f.match(/^dom_v(\d+)\.cjs$/) || [])[1]).filter(Boolean).map(Number).sort((a, b) => b - a)[0];
if (POST && NEWEST !== undefined && NEWEST > 641) console.log(`  · §B skipped: it compares with v6.40's text, which only the v6.40 → v6.41 run builds (this run's newest leg is v${NEWEST})`);
else if (POST) {
  const domP = join(HERE, `dom_${B_PRIOR}.cjs`), srcP = join(HERE, "..", `${B_PRIOR}.jsx`);
  const have = existsSync(domP) && existsSync(srcP);
  T(`B-1 SETUP: the run folder holds the ${B_PRIOR} leg (dom_${B_PRIOR}.cjs and ${B_PRIOR}.jsx) — required in the v6.40 → v6.41 run, never skipped there`, have);
  if (have) {
    const dir = mkdtempSync(join(tmpdir(), "t105-")), out = join(dir, "dump.json");
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), B_PRIOR, "--dump", out], { cwd: HERE, encoding: "utf8", timeout: 900000, maxBuffer: 1 << 27 });
    let prior = null; try { prior = JSON.parse(readFileSync(out, "utf8")); } catch (e) {} try { rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    T(`B-2 SETUP: the ${B_PRIOR} leg dumped its seventeen texts`, prior !== null && Object.keys(prior).length === 17, prior === null ? (r.stderr || "").slice(-300) : "");
    for (const [ki, k] of Object.keys(TEXTS).entries()) {
      const a = prior && prior[k], b = TEXTS[k]; let at = -1; if (a && a !== b) { at = 0; while (a[at] === b[at]) at++; }
      T(`B-3.${ki + 1} ${k}: the tab's text is identical to v6.40's — no word or figure moved`, !!a && a === b, at >= 0 ? `first difference at ${at}: «${(a || "").slice(Math.max(0, at - 60), at + 60)}» vs «${b.slice(Math.max(0, at - 60), at + 60)}»` : "no prior text");
    }
  }
}

// ── §C · the Field Manual ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the Field Manual");
{ const D = (all(AST, n => n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML")[0] || {}).init;
  const H = D ? (D.type === "Literal" ? D.value : D.type === "TemplateLiteral" ? D.quasis.map(q => q.value.cooked).join("") : "") : "";
  const N41 = H.indexOf("<li><strong>My Data, Social Security, Expenses and Taxes on a phone (v6.41).</strong>"), N40 = H.indexOf("<li><strong>The Roth and Stress tabs on a phone (v6.40).</strong>");
  const N39 = H.indexOf("<li><strong>Ask AI is told what accounts you hold (v6.39).</strong>");
  const item = (() => { const i = H.indexOf("Designed for a desktop browser."); return i < 0 ? "" : H.slice(i, H.indexOf("</li>", i)); })();
  T("C-0 SETUP: the Field Manual, its v6.40 and v6.39 notes and its desktop item were found", H.length > 100000 && N40 > 0 && N39 > N40 && item.length > 200, `${H.length} ${N40} ${N39} ${item.length}`);
  if (POST) {
    const note = N41 > 0 && N40 > N41 ? H.slice(N41, N40) : "";
    const notes = [...H.matchAll(/<li><strong>[^<]*\(v(\d)\.(\d\d)\)\.<\/strong>/g)].map(m => ({ at: m.index, v: +m[1] * 100 + +m[2] }));
    T("C-1 §13's v6.41 note sits ahead of v6.40's and says what changed: the four tabs, the claiming grid, the one-time list, Withdrawal and Monte Carlo, the category column, the calendar below 700 px, the stream row, the desktop and every figure unchanged",
      !!note && /On a phone these four tabs printed some figures over each other/.test(note) && /claiming grid shows as many ages a row as fit/.test(note)
      && /one-time list scrolls within its own box below about 390 px/.test(note) && /one Withdrawal panel widened the page and one Monte Carlo panel printed over itself/.test(note)
      && /category column is wider/.test(note) && /Below 700 px the Roth tab’s IRMAA calendar shows as many years a row as fit/.test(note)
      && /wraps at any width when it does not fit/.test(note) && /Otherwise the desktop layout is unchanged, and so is every figure\./.test(note), note.slice(0, 200));
    T("C-1b …and it is the first release note in the Field Manual, and the newest (§13's items and release notes interleave; the notes run newest first)",
      notes.length > 5 && notes[0].at === N41 && notes[0].v === 641 && notes.every(n => n.v <= 641), notes.slice(0, 3).map(n => `${n.v}@${n.at}`).join(" "));
    T("C-2 the desktop item says no tab prints over its neighbours at UI SIZE 100% from 360 px, naming the three releases that fixed them, and what remains below 360 px (F-33)",
      /At UI SIZE 100% no tab prints figures over their neighbours on a screen 360 px wide or more \(v6\.38, v6\.40 and v6\.41 fixed the tabs that did\); on a narrower phone a few figures on the Monte Carlo tab still do, and the Grade and Verify tabs scroll sideways a little\./.test(item));
    T("C-3 …keeps the UI SIZE disclosure (F-32), corrected: above 100% some figures overlap in a narrow window (on a phone, most on Monte Carlo) and some tabs scroll sideways on a phone — not only at 150%",
      /the phone layout follows the window’s width, not UI SIZE: with a UI SIZE above 100% some figures overlap in a narrow window - on a phone, most on the Monte Carlo tab - and on a phone some tabs scroll sideways\./.test(item)
      && !/at 150% the page can scroll sideways/.test(item));
    T("C-4 …and drops what v6.41 fixed: the four tabs, the Expenses label, the calendar's CONVERT labels and F-31",
      !/On a phone some figures still print over/.test(item) && !/category name on the Expenses tab/.test(item) && !/CONVERT/.test(item) && !/Between 600 and 625 px/.test(item));
    T("C-5 the v6.40 note's last sentence says v6.41 fixed the four other tabs", N40 > 0 && /Four other tabs still overprinted on a phone; v6\.41 fixed them\.<\/li>/.test(H.slice(N40, N39)));
  } else {
    T(`C-1 ${KD} no v6.41 note; the desktop item lists the four tabs, the Expenses label, the CONVERT labels and F-31, and says the page scrolls sideways only at 150%`,
      N41 < 0 && /On a phone some figures still print over their neighbours on parts of the My Data, Social Security, Expenses and Taxes tabs/.test(item)
      && /“CONVERT” labels can run past their cards/.test(item) && /Between 600 and 625 px/.test(item) && /on a phone at 150% the page can scroll sideways/.test(item));
  }
}

finished = true;
console.log(`\nt105 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
