// t104 — THE ROTH AND STRESS TABS ON A PHONE (v6.40, F-30 first part)
//
//  Scope: docs/SCOPE_F30_ROTH_STRESS_PHONE_V640.md (DF-1 to DF-7, all (a)). Through v6.39, on a phone, six grids on the Roth and Stress tabs
//  printed their text over itself: v5.79 (F-11) rewrote their `1fr` tracks as `minmax(0, 1fr)`, which stopped the page scrolling sideways
//  but let each column shrink below its text. The same happened in any window that UI SIZE (a CSS zoom) left narrow. Display only; no
//  engine, table, stored field or word changes.
//
//  LAYOUT IS t45's. jsdom does no layout, so this suite holds the STRUCTURE that makes the layout work; t45 §S measures the overlap in
//  Chromium (zero on both tabs at 360, 390, 430, 600 and 640 px, and at UI SIZE 130% at 390, 600 and 800).
//
//  §A  the source, by AST: the one new phone rule is inside `@media (max-width: 599px)` only; each of the six sites carries its class,
//      its own minimum width, or sits as the DIRECT child of a `dc-scrollx` box with the decided `--dc-floor`; EXTINCTION — in the two tab
//      renders no grid with two or more tracks that can shrink to zero stands unprotected (`repeat()` expanded, both branches of a
//      conditional template read), except three named sites, each with its reason. A minimum width counts only if it is at least 200 px
//      (`minWidth: 0` is a common idiom and protects nothing). Scope §1 leaves seven sites alone; the other four need no exemption — one
//      already sits in a dc-scrollx box, and three have no track that can shrink to zero.
//  §B  the rendered text of both tabs, on the example, a single plan and a plan with no ACA bridge, is IDENTICAL to v6.39's (v6.40 leg; the
//      v6.39 leg is dumped in a child process, both seeded alike before the app loads and the tabs visited in the same order). Without the
//      v6.39 bundle in the run folder this FAILS — the release's claim that no word or figure moves rests on it. That holds in the v6.39 → v6.40
//      run only (its newest leg is v640): a later run folder holds no v6.39 bundle by construction, so there §B prints a skip line.
//  §C  the Field Manual: §13's desktop item names only the four tabs left, says the phone layout follows the window and not UI SIZE, and
//      discloses F-31; §13's v6.40 note sits first.
//  The v6.39 leg pins each defect as a dated [KNOWN DEFECT 2026-10-30, F-30 — flips at v6.40].
//  Both legs: node t104_roth_stress_phone.mjs v639 | node t104_roth_stress_phone.mjs v640. Controls: qa/tools/controls_v640_phone.py (repo-only).
//  Exits with process.exit (the rendered app leaves timers running).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync, readdirSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(104); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load; the dump child does the same
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v640";
const DUMP = process.argv.includes("--dump");
const KNOWN_VERSIONS = ["v639", "v640"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v640"].includes(VER);   // an array, so the next registration widens it
const B_PRIOR = "v639";                // §B's comparison leg — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-30, F-30 — flips at v6.40]";
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T104_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished && !DUMP) { console.log(`t104 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const require = createRequire(import.meta.url);
if (!DUMP) console.log(`t104 — THE ROTH AND STRESS TABS ON A PHONE (${VER})`);

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
// Text without cloning (t101's trap: jsdom's cloneNode throws on some colour-mix backgrounds): walk the text nodes, skip <style>/<script>.
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
// The plans §B renders: the example; the example made single (as t6 makes one); the example with no ACA premium (the comparator then has
// one column fewer). Built from the example's own saved shape, so both legs build the same plans.
const single = () => { const P = clone(EXP); P.single = true; P.nameB = ""; P.positions = (P.positions || []).map(p => ({ ...p, owner: "A" }));
  P.otherAccounts = (P.otherAccounts || []).map(a => ({ ...a, owner: "A" })); P.incomeStreams = [];
  P.contributions = { ...P.contributions, spouseBMonthly: 0, contribPreTaxB: 0, contribRothB: 0 };
  if (P.incomeSources && P.incomeSources.ssB) P.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 }; return P; };
const noAca = () => { const P = clone(EXP); P.acaBridge = { ...(P.acaBridge || {}), premium: 0 }; return P; };
const TEXTS = {};
for (const [name, mk] of [["example", null], ["single", single], ["noaca", noAca]]) {
  if (mk) await seed(mk(), clone(EXE));
  for (const tab of ["roth", "stress"]) { await go(tab); TEXTS[`${name}|${tab}`] = pageText(); }
}
if (DUMP) { process.stdout.write("DUMP:" + JSON.stringify(TEXTS) + "\n"); finished = true; process.exit(0); }

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
const PHONE = blockOf(CSS, "@media (max-width: 599px)"), OUTSIDE = CSS.replace(PHONE, "");
T("A-0 SETUP: one stylesheet holds the v5.81 phone block, and the dc-scrollx rules stand outside it (overflow-x auto; the child's minimum is var(--dc-floor, 600px))",
  SHEET.length === 1 && PHONE.length > 50 && /\.dc-scrollx \{ overflow-x: auto; max-width: 100%; \}/.test(OUTSIDE) && /\.dc-scrollx > \* \{ min-width: var\(--dc-floor, 600px\); \}/.test(OUTSIDE), `${SHEET.length} ${PHONE.length}`);
if (POST) {
  T("A-1 the one new phone rule, .dc-cards-phone, is inside the phone block once and nowhere else: as many cards a row as fit at 84 px or more, the minimum width lifted",
    PHONE.split(".dc-cards-phone {").length === 2 && !OUTSIDE.includes(".dc-cards-phone")
    && /\.dc-cards-phone \{ grid-template-columns: repeat\(auto-fill, minmax\(84px, 1fr\)\) !important; min-width: 0 !important; \}/.test(PHONE));
} else T(`A-1 ${KD} no phone rule reaches the Roth or Stress tab`, !CSS.includes("dc-cards-phone"));

// The two tab renders: `activeTab === "roth" && …`, `activeTab === "stress" && …` — one each.
const tabNode = id => all(AST, n => n.type === "LogicalExpression" && n.operator === "&&" && n.left.type === "BinaryExpression" && n.left.left.type === "Identifier"
  && n.left.left.name === "activeTab" && n.left.right.type === "Literal" && n.left.right.value === id);
const ROTH = tabNode("roth"), STRESS = tabNode("stress");
T("A-2 SETUP: one render each for the Roth and Stress tabs", ROTH.length === 1 && STRESS.length === 1, `${ROTH.length} ${STRESS.length}`);
const attr = (op, name) => op.attributes.find(a => a.type === "JSXAttribute" && a.name && a.name.name === name);
const classOf = op => { const a = attr(op, "className"); return a && a.value && a.value.type === "Literal" ? String(a.value.value) : ""; };
const styleObj = op => { const a = attr(op, "style"); return a && a.value && a.value.type === "JSXExpressionContainer" && a.value.expression.type === "ObjectExpression" ? a.value.expression : null; };
const propOf = (obj, key) => obj && obj.properties.find(p => p.type === "Property" && ((p.key.type === "Identifier" && p.key.name === key) || (p.key.type === "Literal" && p.key.value === key)));
const lit = n => n && n.type === "Literal" ? n.value : undefined;
// A grid's templates: a literal, or both branches of a conditional (recursively).
const templates = n => !n ? [] : n.type === "Literal" ? [String(n.value)] : n.type === "ConditionalExpression" ? [...templates(n.consequent), ...templates(n.alternate)] : [null];
const tracks = t => { const out = []; let s = t.trim(); const toks = []; let d = 0, cur = "";
  for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === " " && d === 0) { if (cur) toks.push(cur); cur = ""; } else cur += ch; } if (cur) toks.push(cur);
  for (const tk of toks) { const m = tk.match(/^repeat\((\d+),\s*(.+)\)$/); if (m) { for (let i = 0; i < +m[1]; i++) out.push(...tracks(m[2])); } else out.push(tk); } return out; };
const shrinking = t => tracks(t).filter(x => /^minmax\(0(px)?,/.test(x)).length;
// The JSX element that directly contains an opening element's element (comments and text between them are not elements).
const parentEl = op => { let n = PARENT.get(op); n = PARENT.get(n); return n && n.type === "JSXElement" ? n.openingElement : null; };
const gridsIn = node => all(node, n => n.type === "JSXOpeningElement" && !!propOf(styleObj(n), "gridTemplateColumns")).map(op => {
  const so = styleObj(op), tps = templates(propOf(so, "gridTemplateColumns").value), par = parentEl(op);
  const gap = lit((propOf(so, "gap") || {}).value);
  return { op, line: op.loc.start.line, tps, gap, cls: classOf(op), minW: lit((propOf(so, "minWidth") || {}).value),
    parCls: par ? classOf(par) : "", parFloor: par ? lit((propOf(styleObj(par), "--dc-floor") || {}).value) : undefined,
    shrink: Math.max(...tps.map(t => t === null ? 99 : shrinking(t))) }; });
const G = { roth: gridsIn(ROTH[0] || AST), stress: gridsIn(STRESS[0] || AST) };
const find = (tab, tp, gap) => G[tab].filter(g => g.tps.some(t => t && t.replace(/\s+/g, "") === tp.replace(/\s+/g, "")) && (gap === undefined || g.gap === gap));
const SITES = [
  { k: "a", id: "R1 the IRMAA lookback calendar", tab: "roth", tp: "repeat(9, minmax(0, 1fr))", gap: 4, want: g => g.cls === "dc-cards-phone" && g.minW === 500, how: "class dc-cards-phone and its own minWidth 500" },
  { k: "b", id: "R2 the strategy comparator", tab: "roth", tp: "1.5fr repeat(7, minmax(0, 1fr))", gap: 0, want: g => g.parCls === "dc-scrollx" && g.parFloor === "490px" && g.tps.length === 2, how: "the direct child of a dc-scrollx box, --dc-floor 490px (both templates, with and without the ACA column)" },
  { k: "c", id: "R3 the constraints & rules box", tab: "roth", tp: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, want: g => g.cls === "dc-stack-phone", how: "class dc-stack-phone" },
  { k: "d", id: "S1 the scenario table", tab: "stress", tp: "150px repeat(6, minmax(0, 1fr))", gap: 0, want: g => g.parCls === "dc-scrollx" && g.parFloor === "720px", how: "the direct child of a dc-scrollx box, --dc-floor 720px" },
  { k: "e", id: "S2 the portfolio risk report", tab: "stress", tp: "repeat(4, minmax(0, 1fr))", gap: 14, want: g => g.cls === "dc-two-phone", how: "class dc-two-phone" },
  { k: "f", id: "S3 the guardrail table", tab: "stress", tp: "repeat(5, minmax(0, 1fr))", gap: 0, want: g => g.parCls === "dc-scrollx" && g.parFloor === "290px", how: "the direct child of a dc-scrollx box, --dc-floor 290px (its width at a 390 px window)" },
];
for (const s of SITES) {
  const f = find(s.tab, s.tp, s.gap);
  if (POST) T(`A-3${s.k} ${s.id}: ${s.how}`, f.length === 1 && s.want(f[0]), f.map(g => `L${g.line} cls=${g.cls} minW=${g.minW} par=${g.parCls}/${g.parFloor}`).join("; ") || "not found");
  else T(`A-3${s.k} ${KD} ${s.id}: no class, no minimum width, not in a dc-scrollx box`, f.length === 1 && !f[0].cls && f[0].minW === undefined && f[0].parCls !== "dc-scrollx", f.length);
}
// EXTINCTION. Protected = (i) the direct child of a dc-scrollx box whose --dc-floor, if set, is at least 200 px (unset is the rule's 600 px),
// (ii) its own minWidth of at least 200 px, or (iii) a phone class. An overflowX: auto parent alone is NOT protection — R1 sat in one through
// v6.39 and overprinted, because a box whose child has no minimum width never scrolls; nor is minWidth 0, "auto" or a 0px floor.
// (iii) does nothing in a window that UI SIZE has narrowed above 599 px: that is F-32, filed, and why R3 overlaps at UI SIZE 150% at 600 px.
const PHONE_CLASSES = ["dc-cards-phone", "dc-stack-phone", "dc-two-phone"];
const EXEMPT = [   // measured with no overlap at 360–1440 px on five plans at UI SIZE 100–130% (scope §1); each must still match exactly one grid
  { tab: "roth", tp: "repeat(3, minmax(0, 1fr))", gap: 12, why: "the RMD cards: three cards of short figures (overprint only at UI SIZE 150% on a phone — F-32)" },
  { tab: "stress", tp: "repeat(2, minmax(0, 1fr))", gap: 12, why: "the scenario cards: two columns of prose that wraps" },
  { tab: "stress", tp: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, why: "the sequence-of-returns card: two columns of prose that wraps" },
];
T("A-4 SETUP: each exempt grid is still there, once (a list that has outlived its sites guards nothing)", EXEMPT.every(e => find(e.tab, e.tp, e.gap).length === 1),
  EXEMPT.map(e => find(e.tab, e.tp, e.gap).length).join(","));
const exempt = g => EXEMPT.some(e => find(e.tab, e.tp, e.gap).includes(g));
const pxOf = v => typeof v === "number" ? v : typeof v === "string" && /^\s*\d+(\.\d+)?(px)?\s*$/.test(v) ? parseFloat(v) : NaN;
const scrolls = g => g.parCls.split(" ").includes("dc-scrollx") && (g.parFloor === undefined || pxOf(g.parFloor) >= 200);
const floored = g => pxOf(g.minW) >= 200;
const unprotected = [...G.roth, ...G.stress].filter(g => g.shrink >= 2 && !exempt(g) && !scrolls(g) && !floored(g) && !PHONE_CLASSES.some(c => g.cls.split(" ").includes(c)));
T("A-5 SETUP: the walk sees every grid of the two tabs (8 on Roth, 5 on Stress at v6.39's count) and reads the comparator's two templates",
  G.roth.length === 8 && G.stress.length === 5 && find("roth", "1.5fr repeat(6, minmax(0, 1fr))", 0).length === 1, `${G.roth.length} ${G.stress.length}`);
if (POST) T("A-6 EXTINCTION: no grid on the Roth or Stress tab with two or more tracks that can shrink to zero stands unprotected (a new one fails here)",
  unprotected.length === 0, unprotected.map(g => `L${g.line} ${g.tps.join(" | ")}`).join("; "));
else T(`A-6 ${KD} exactly the six sites stand unprotected`, unprotected.length === 6, unprotected.map(g => `L${g.line}`).join(" "));

// ── §B · the rendered text, identical to v6.39's ─────────────────────────────────────────────────────────────────────────────────
console.log("  B — the rendered text");
T("B-0 SETUP: both tabs rendered on all three plans (the Roth comparator and the Stress scenario table among them)",
  Object.keys(TEXTS).length === 6 && Object.entries(TEXTS).every(([k, t]) => t.length > 3000 && (k.endsWith("roth") ? /Estate after heir income tax/i.test(t) : /Median End/i.test(t))),
  Object.entries(TEXTS).map(([k, t]) => `${k}:${t.length}`).join(" "));
T("B-0b SETUP: the comparator's headings — the example's carry the ACA column, the no-ACA plan's go straight from IRMAA total to Widow-yrs tax",
  /IRMAA total\s*ACA sub lost/i.test(TEXTS["example|roth"]) && /IRMAA total\s*Widow-yrs tax/i.test(TEXTS["noaca|roth"]) && !/IRMAA total\s*ACA sub lost/i.test(TEXTS["noaca|roth"]));
// The run folder's newest leg: §B is required in the v6.39 → v6.40 run, and cannot run in any later one (no v6.39 bundle by construction).
const NEWEST = readdirSync(HERE).map(f => (f.match(/^dom_v(\d+)\.cjs$/) || [])[1]).filter(Boolean).map(Number).sort((a, b) => b - a)[0];
if (POST && NEWEST !== undefined && NEWEST > 640) console.log(`  · §B skipped: it compares with v6.39's text, which only the v6.39 → v6.40 run builds (this run's newest leg is v${NEWEST})`);
else if (POST) {
  const domP = join(HERE, `dom_${B_PRIOR}.cjs`), srcP = join(HERE, "..", `${B_PRIOR}.jsx`);
  const have = existsSync(domP) && existsSync(srcP);
  T(`B-1 SETUP: the run folder holds the ${B_PRIOR} leg (dom_${B_PRIOR}.cjs and ${B_PRIOR}.jsx) — required in the v6.39 → v6.40 run, never skipped there`, have);
  if (have) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), B_PRIOR, "--dump"], { cwd: HERE, encoding: "utf8", timeout: 900000, maxBuffer: 1 << 27 });
    const line = (r.stdout || "").split("\n").find(l => l.startsWith("DUMP:")); const prior = line ? JSON.parse(line.slice(5)) : null;
    T(`B-2 SETUP: the ${B_PRIOR} leg dumped its six texts`, prior !== null && Object.keys(prior).length === 6, prior === null ? (r.stderr || "").slice(-300) : "");
    for (const [ki, k] of Object.keys(TEXTS).entries()) {
      const a = prior && prior[k], b = TEXTS[k]; let at = -1; if (a && a !== b) { at = 0; while (a[at] === b[at]) at++; }
      T(`B-3${"abcdef"[ki]} ${k}: the tab's text is identical to v6.39's — no word or figure moved`, !!a && a === b, at >= 0 ? `first difference at ${at}: «${(a || "").slice(Math.max(0, at - 60), at + 60)}» vs «${b.slice(Math.max(0, at - 60), at + 60)}»` : "no prior text");
    }
  }
}

// ── §C · the Field Manual ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the Field Manual");
{ const D = (all(AST, n => n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML")[0] || {}).init;
  const H = D ? (D.type === "Literal" ? D.value : D.type === "TemplateLiteral" ? D.quasis.map(q => q.value.cooked).join("") : "") : "";
  const N40 = H.indexOf("<li><strong>The Roth and Stress tabs on a phone (v6.40).</strong>"), N39 = H.indexOf("<li><strong>Ask AI is told what accounts you hold (v6.39).</strong>");
  const item = (() => { const i = H.indexOf("Designed for a desktop browser."); return i < 0 ? "" : H.slice(i, H.indexOf("</li>", i)); })();
  T("C-0 SETUP: the Field Manual, its v6.39 note and its desktop item were found", H.length > 100000 && N39 > 0 && item.length > 200, `${H.length} ${N39} ${item.length}`);
  if (POST) {
    const note = N40 > 0 && N39 > N40 ? H.slice(N40, N39) : "";
    T("C-1 §13's v6.40 note is first, ahead of v6.39's, and says what changed: the calendar as many years a row as fit, the tables scroll in their boxes, UI SIZE, the desktop layout and every figure unchanged",
      !!note && /as many years a row as fit/.test(note) && /scroll within their own boxes/.test(note) && /up to about 790 px wide \(about 810 where the browser’s scrollbar takes room\)/.test(note) && /UI SIZE/.test(note) && /Otherwise the desktop layout is unchanged, and so is every figure/.test(note));
    T("C-2 the desktop item names only the four tabs left (no Roth calendar or Stress table as overprinting), the 600 px threshold at UI SIZE 100%, the Expenses label and the calendar's CONVERT labels below 690 px",
      /On a phone some figures still print over their neighbours on parts of the My Data, Social Security, Expenses and Taxes tabs \(v6\.38: the Income tab’s were fixed; v6\.40: the Roth and Stress tabs’\)\./.test(item)
      && /At UI SIZE 100% a screen 600 px wide or more shows them apart, except that a long category name on the Expenses tab can run under its item at any width, and below about 690 px the Roth tab’s IRMAA calendar’s “CONVERT” labels can run past their cards\./.test(item)
      && !/the Roth tab’s IRMAA calendar, the Stress tab’s scenario table/.test(item) && !/scenario table/.test(item) && !/680 px/.test(item));
    T("C-3 …and says the phone layout follows the window, not UI SIZE (F-32), and that the Income tab can scroll sideways at 600–625 px with a long stream label (F-31)",
      /the phone layout follows the window’s width, not UI SIZE/.test(item) && /on a phone at 150% the page can scroll sideways/.test(item)
      && /Between 600 and 625 px the Income tab can scroll sideways when an income stream has a long label\./.test(item));
  } else {
    T(`C-1 ${KD} no v6.40 note; the desktop item names the Roth calendar and the Stress table as overprinting, and does not say the phone layout follows the window`,
      N40 < 0 && /the Roth tab’s IRMAA calendar, the Stress tab’s scenario table/.test(item) && !/follows the window’s width/.test(item));
  }
}

finished = true;
console.log(`\nt104 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
