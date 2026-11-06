// t106 — THE PHONE LAYOUT FOLLOWS UI SIZE (v6.42, F-32 and F-33)
//
//  Scope: docs/SCOPE_F32_UI_SIZE_V642.md (DH-1 (a) 240 px, DH-2 (a) the tables scroll, DH-3 (a) the 44 px targets stay on the window, DH-4 (a);
//  Steve's, 2026-11-02). UI SIZE is a CSS zoom on the app's root. Through v6.41 the phone layout switched on the WINDOW's width
//  (`@media (max-width: 599px)`, and `(max-width: 699px)` for the Roth calendar), so a zoomed window got the layout for its own width in less
//  room: at 150% a 600 px window overprinted 52 pairs on six tabs, a 390 px phone 163 on eight (Monte Carlo 133), and eight pages scrolled
//  sideways; below 360 px at 100% Monte Carlo overprinted and Grade and Verify scrolled (F-33). From v6.42 a class on the zoomed root, set
//  from the window's width divided by UI SIZE (the layout width), carries every phone rule: `dc-narrow` under 600 px of room, `dc-sub700w`
//  under 700, and `dc-xs` under 360 for the new narrow rules. Display only: no engine, table, stored field or computed figure changes.
//
//  LAYOUT IS t45's. jsdom does no layout, so this suite holds the STRUCTURE and the class logic; t45 §S-11 measures in Chromium.
//
//  §A  the source, by AST: the layout-width function and its hook; the class on the zoomed root (absent, not empty, at desktop widths);
//      EXTINCTION — no `@media (max-width: 599px)` or `(max-width: 699px)` left in the app's stylesheet, and every rule those blocks held at
//      v6.41 stands once under `.dc-narrow` (or `.dc-sub700w`); the narrow rules only under `.dc-xs`; each site carries its class or box.
//  §B  the function itself, run on the source's own text with a stand-in window: the class at each boundary for UI SIZE 100/115/130/150%,
//      and at 100% the same switch as the old media queries at every integer width 200-1500.
//  §C  the rendered app (jsdom): the root carries no class attribute in jsdom's 1024 px window, takes the phone classes when the window
//      narrows and a resize fires, and follows a stored UI SIZE.
//  §D  the Field Manual: the v6.42 note (first), the rewritten desktop item, the four version sites.
//  §E  the text: every tab but the Field Manual's, on the example, IDENTICAL to v6.41's — no word or figure moved (both legs dumped by child
//      processes, Math.random seeded alike before the app loads, tabs visited in the same order). Required in the v6.41 → v6.42 run; any later
//      run folder holds no v6.41 bundle beside its newest leg, and there §E prints a skip line.
//  The v6.41 leg pins each defect as a dated [KNOWN DEFECT 2026-11-02, F-32 — flips at v6.42].
//  Both legs: node t106_ui_size_layout.mjs v641 | node t106_ui_size_layout.mjs v642. Controls: qa/tools/controls_v642_ui_size.py (repo-only).
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
let _rnd = mulberry(106); Math.random = () => _rnd();   // installed BEFORE the app loads (d3 captures Math.random at load): §E's two dumps draw alike
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v642";
const DUMP = process.argv.includes("--dump");
const KNOWN_VERSIONS = ["v641", "v642", "v643", "v644", "v645", "v646", "v647", "v648"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v642", "v643", "v644", "v645", "v646", "v647", "v648"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-11-02, F-32 — flips at v6.42]";
const E_PRIOR = "v641";   // §E's comparison leg — a constant, so the registrar cannot widen it (t76 records why)
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T106_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished && !DUMP) { console.log(`t106 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const require = createRequire(import.meta.url);
if (!DUMP) console.log(`t106 — THE PHONE LAYOUT FOLLOWS UI SIZE (${VER})`);

// ── §E's dump (a child process): every tab's text but the Field Manual's, on the example, then exit ─────────────────────────────────
if (DUMP) {
  const PFX = "dc:";
  window.confirm = () => true;
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PFX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PFX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PFX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PFX) && k.slice(PFX.length).startsWith(prefix)) keys.push(k.slice(PFX.length)); } return { keys }; },
  };
  require(`./dom_${VER}.cjs`);
  const React = require("react"); const bd = () => window.document.body;
  let act; const fl = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const ck = async x => { if (!x) return; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await fl(); };
  const host = window.document.createElement("div"); bd().appendChild(host); window.localStorage.clear();
  const m = window.__mount(host); act = m.act;
  try { await act(async () => { m.root.render(React.createElement(m.DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await fl();
  await ck([...bd().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); for (let i = 0; i < 3; i++) await fl();
  const txt = () => { const w = window.document.createTreeWalker(host, 4); let out = "", n;
    while ((n = w.nextNode())) { const p = n.parentNode && n.parentNode.nodeName; if (p !== "STYLE" && p !== "SCRIPT") out += n.nodeValue; } return out.replace(/\s+/g, " "); };
  const page = () => { const t = txt(); const j = t.indexOf("DANGER CLOSE v6."); return j < 0 ? t : t.slice(0, j); };   // up to the footer (its version differs by design)
  const sab = [...bd().querySelectorAll("button")].find(b => /SHOW ALL TABS/.test(b.textContent || "")); if (sab) await ck(sab);
  const names = [...bd().querySelectorAll("button.tab")].map(b => b.textContent.trim()).filter(n => n !== "docs");
  const TX = {};
  // Settle: the Monte Carlo tab's mortgage what-if renders its results later ("Recalculating both scenarios…"), so read each tab only once nothing is
  // re-running and two reads 40 ms apart agree (the build review saw one read catch it mid-run under load).
  for (const nm of names) { await ck([...bd().querySelectorAll("button.tab")].find(b => b.textContent.trim() === nm)); for (let i = 0; i < 6; i++) await fl();
    let a = page(), b2 = "", k = 0; while (k++ < 400) { await fl(); b2 = page(); if (a === b2 && !/Recalculating|RE-RUNNING/.test(b2)) break; a = b2; } TX[nm] = b2; }
  writeFileSync(process.argv[process.argv.indexOf("--dump") + 1], JSON.stringify(TX)); finished = true; process.exit(0);
}

// ── §A · the source ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
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
// The app's stylesheet: the one template literal holding the dc-scrollx floor rule (present on both legs).
const SHEET = all(AST, n => n.type === "TemplateLiteral" && n.quasis.some(q => (q.value.cooked || "").includes(".dc-scrollx > * { min-width: var(--dc-floor, 600px); }")));
const CSS = SHEET.length === 1 ? SHEET[0].quasis.map(q => q.value.cooked).join("").replace(/\/\*[\s\S]*?\*\//g, "") : "";   // comments are not rules: stripped
T("A-0 SETUP: one stylesheet holds the dc-scrollx floor rule", SHEET.length === 1 && CSS.length > 1000, String(SHEET.length));
// The rules v6.41's two media blocks held (selector -> declarations), read from v6.41's own text: they must survive, each once, under its class.
const V641_PHONE = [
  [".dc-phone-only", "display: block;"], [".dc-tabgrid", "display: none !important;"], [".dc-plansum:not(.open)", "display: none;"],
  [".dc-stack-phone", "grid-template-columns: minmax(0, 1fr) !important;"], [".dc-two-phone", "grid-template-columns: repeat(2, minmax(0, 1fr)) !important;"],
  [".dc-streamrow", "flex-wrap: wrap; row-gap: 2px;"], [".dc-streamrow > .dc-sr-label", "min-width: min(170px, 100%) !important; flex-shrink: 1 !important; overflow-wrap: anywhere;"],
  [".dc-streamrow > .dc-sr-desc", "flex: 1 1 160px !important; min-width: 0; overflow-wrap: anywhere;"], [".dc-streamrow > .dc-sr-amt", "margin-left: auto;"],
  [".dc-cards-phone", "grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important;"],
  [".dc-wrap-phone", "flex-wrap: wrap !important;"], [".dc-export-phone", "max-width: 100%;"], [".dc-export-phone > input", "min-width: 0; flex-shrink: 1;"]];
const V641_SUB700 = [[".dc-cards-sub700", "grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)) !important; min-width: 0 !important;"]];
const rule = (sel, decl) => `${sel} { ${decl} }`;
const count = (s, sub) => s.split(sub).length - 1;
const XS = [["dc-two-xs", "grid-template-columns: repeat(2, minmax(0, 1fr)) !important;"], ["dc-three-xs", "grid-template-columns: repeat(3, minmax(0, 1fr)) !important;"],
  ["dc-stack-xs", "grid-template-columns: minmax(0, 1fr) !important;"], ["dc-scrollx-xs", "overflow-x: auto; max-width: 100%;"],
  ["dc-scrollx-xs > *", "min-width: var(--dc-floor, 600px);"], ["dc-wrap-xs", "flex-wrap: wrap !important;"], ["dc-shrink-xs", "min-width: 0 !important;"],
  ["dc-fill-xs", "width: auto !important; max-width: 100%;"], ["dc-break-xs", "overflow-wrap: anywhere;"],
  ["dc-tight-xs > *", "padding-left: 4px !important; padding-right: 4px !important;"]];
const FN = all(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "layoutWidthClass");
const HOOK = all(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "useLayoutWidthClass");
// The zoomed roots: JSX elements whose style object has a `zoom` property (the app and the data-load wrapper).
const zoomed = all(AST, n => n.type === "JSXOpeningElement" && n.attributes.some(a => a.type === "JSXAttribute" && a.name.name === "style" && a.value
  && a.value.type === "JSXExpressionContainer" && a.value.expression.type === "ObjectExpression"
  && a.value.expression.properties.some(p => p.type === "Property" && (p.key.name || p.key.value) === "zoom")));
const MAIN = all(AST, n => n.type === "FunctionDeclaration" && n.id && n.id.name === "DangerCloseMain")[0];
const inMain = n => { for (let a = n; a; a = PARENT.get(a)) if (a === MAIN) return true; return false; };
const appRoot = zoomed.filter(inMain);
const attr = (n, name) => n.attributes.find(a => a.type === "JSXAttribute" && a.name.name === name);
if (POST) {
  T("A-1 the stylesheet has no `@media (max-width: 599px)` and no `@media (max-width: 699px)` left: the phone layout no longer reads the window's width (EXTINCTION)",
    !CSS.includes("@media (max-width: 599px)") && !CSS.includes("@media (max-width: 699px)") && !/@media[^{]*max-width/.test(CSS));
  const missing = V641_PHONE.filter(([s, d]) => count(CSS, rule(`.dc-narrow ${s}`, d)) !== 1).map(x => x[0]);
  T(`A-2 every rule of v6.41's phone block stands once under .dc-narrow, its declarations unchanged (${V641_PHONE.length} rules)`, missing.length === 0, missing.join(", "));
  const bare = V641_PHONE.filter(([s, d]) => count(CSS, rule(s, d)) !== count(CSS, rule(`.dc-narrow ${s}`, d))).map(x => x[0]);
  T("A-2b none of those rules also stands unscoped (the phone rules reach no layout of 600 px of room or more)", bare.length === 0, bare.join(", "));
  T("A-3 v6.41's 699 px rule stands once under .dc-sub700w, and nowhere unscoped",
    count(CSS, rule(".dc-sub700w .dc-cards-sub700", V641_SUB700[0][1])) === 1 && count(CSS, ".dc-cards-sub700 {") === count(CSS, ".dc-sub700w .dc-cards-sub700 {"));
  const xsMissing = XS.filter(([c, d]) => count(CSS, rule(`.dc-xs .${c}`, d)) !== 1 || count(CSS, `.${c.split(" ")[0]}`) !== count(CSS, `.dc-xs .${c.split(" ")[0]}`)).map(x => x[0]);
  T(`A-4 the ten narrow rules stand once each under .dc-xs, and their classes appear nowhere else in the sheet (${XS.length} rules)`, xsMissing.length === 0, xsMissing.join(", "));
  T("A-4b the narrow rules come after the phone rules (equal specificity: the later wins)", CSS.lastIndexOf(".dc-narrow ") < CSS.indexOf(".dc-xs ") && CSS.indexOf(".dc-xs ") > 0);
  T("A-5 the 44 px targets are not the app's: .dc-tap44 has no rule in the app's stylesheet (DH-3 (a): src/index.html keeps it on the window's width)", !CSS.includes(".dc-tap44 {"));
  T("A-6 one module-level function layoutWidthClass(uiScale) and one hook useLayoutWidthClass(uiScale)",
    FN.length === 1 && HOOK.length === 1 && PARENT.get(FN[0]) === AST && PARENT.get(HOOK[0]) === AST && FN[0].params.length === 1 && HOOK[0].params.length === 1);
  const fsrc = FN.length ? SRCOF(FN[0]) : "", hsrc = HOOK.length ? SRCOF(HOOK[0]) : "";
  T("A-6b the function reads window.innerWidth and divides by UI SIZE (the layout width)", /window\.innerWidth/.test(fsrc) && /\*\s*100\s*\/\s*\(uiScale \|\| 100\)/.test(fsrc), fsrc.slice(0, 300));
  T("A-6c the hook listens for resize, removes the listener on cleanup, and re-runs when UI SIZE changes",
    /addEventListener\("resize", on\)/.test(hsrc) && /removeEventListener\("resize", on\)/.test(hsrc) && /\}, \[uiScale\]\);/.test(hsrc), hsrc.slice(0, 400));
  T("A-7 SETUP: DangerCloseMain renders exactly one zoomed root", appRoot.length === 1, String(appRoot.length));
  const cn = appRoot.length === 1 ? attr(appRoot[0], "className") : null;
  T("A-7b that root's class is the hook's, and absent (undefined, not \"\") when there is none: className={_layoutCls || undefined}",
    !!cn && SRCOF(cn) === "className={_layoutCls || undefined}" && /const _layoutCls = useLayoutWidthClass\(uiScale\);/.test(SRCOF(MAIN)), cn ? SRCOF(cn) : "none");
  T("A-7c the root's zoom is unchanged: zoom: (uiScale || 100) / 100 (t30 D-1 reads it too)", appRoot.length === 1 && /zoom: \(uiScale \|\| 100\) \/ 100/.test(SRCOF(appRoot[0])));
  // Each site, by its class (DH-1 (a)). Counts are of JSX elements whose className literal holds the class.
  const withCls = c => all(AST, n => n.type === "JSXOpeningElement" && n.attributes.some(a => a.type === "JSXAttribute" && a.name.name === "className" && a.value
    && a.value.type === "Literal" && typeof a.value.value === "string" && a.value.value.split(" ").includes(c)));
  // Each site pinned by an anchor inside it (a label, a handler, or its exact opening tag), so a class moved to another element fails (the build
  // review moved dc-two-xs from the Survivor cards to a Taxes grid and a class COUNT stayed green). Every -xs class in the source is one of these.
  const PINS = [
 ["W1a", "dc-break-xs", /this copy<\/em> of the file/], ["W1b", "dc-break-xs", /^<table className="dc-break-xs"[\s\S]*c\.source/],
 ["W1c", "dc-scrollx-xs", /^<div className="dc-scrollx-xs"[^>]*>\{\/\*[^*]*\*\/\}<table/], ["N13", "dc-scrollx-xs", /MAGI Threshold/], ["N1", "dc-scrollx-xs", /10TH/], ["N1b", "dc-tight-xs", /10TH/],
 ["W8", "dc-wrap-xs", /setShowGuardrails/], ["W11", "dc-wrap-xs", /applySsCut/], ["W5a", "dc-wrap-xs", /value=\{spouseAClaimAge\}/], ["W5b", "dc-wrap-xs", /value=\{spouseBClaimAge\}/],
 ["W9", "dc-wrap-xs", /ENHANCED EXTENDED \(8\.5% cap\)/], ["W6a", "dc-wrap-xs", /Total Traditional/], ["W6b", "dc-wrap-xs", /Monthly now \(pre-retirement\)/],
 ["N14", "dc-stack-xs", /^<div className="dc-stack-xs" style=\{\{ display: "grid", gridTemplateColumns: "minmax\(0, 1fr\) minmax\(0, 1fr\)", gap: 14, marginBottom: 14 \}\}>/],
 ["N15", "dc-stack-xs", /Claiming rules applied/], ["N16", "dc-stack-xs", /^<div className="dc-stack-xs" style=\{\{ display: "grid", gridTemplateColumns: "minmax\(0, 1fr\) minmax\(0, 1fr\)", gap: 8, marginBottom: 10 \}\}>/],
 ["G", "dc-stack-xs", /Overall grade/], ["N9", "dc-stack-xs", /Your combined guaranteed income|SAVINGS BENCHMARKS/], ["N7", "dc-stack-xs", /Lower guardrail/],
 ["N5", "dc-stack-xs", /FIRST-YEAR RMDs/], ["N12", "dc-stack-xs", /Lifetime IRMAA surcharges/], ["N4", "dc-stack-xs", /Mortgage principal/], ["N18", "dc-stack-xs", /Cash purchase/],
 ["N11", "dc-stack-xs", /Scenario 1: AI bubble burst/], ["N10", "dc-stack-xs", /Household total/],
 ["N17a", "dc-stack-xs", /^<div className="dc-two-phone dc-stack-xs"[^\n]*\n[\s\S]*Trad/], ["N17b", "dc-stack-xs", /^<div className="dc-two-phone dc-stack-xs"(?![\s\S]*Household total)(?![\s\S]*Trad)/],
 ["N8", "dc-two-xs", /Years modeled/], ["N2", "dc-two-xs", /Median end \(with LTC\)/], ["N6", "dc-two-xs", /Monthly income before/], ["N3", "dc-three-xs", /PROB_PRESETS\[scenarioPreset\]\.probs/],
 ["W7", "dc-shrink-xs", /Net worth position/], ["W3a", "dc-shrink-xs", /WILL MY MONEY LAST\?/], ["W3b", "dc-shrink-xs", /HOW MUCH CAN I SPEND\?/], ["W3c", "dc-shrink-xs", /CAN I SURVIVE A CRASH\?/],
 ["W4a", "dc-shrink-xs", /Survivor-critical/], ["W4b", "dc-shrink-xs", /^<input value=\{st\.contact/], ["W4c", "dc-shrink-xs", /placeholder="Notes \(optional\)/], ["W10", "dc-shrink-xs", /sk-ant-/],
 ["W6c", "dc-fill-xs", /Embedded gain, % of brokerage money/], ["W6d", "dc-fill-xs", /Pension\(s\) \$\/month/], ["W6e", "dc-fill-xs", /Benchmark silver premium/],
];
  const XSEL = all(AST, n => n.type === "JSXElement" && n.openingElement.attributes.some(a => a.type === "JSXAttribute" && a.name.name === "className" && a.value
    && a.value.type === "Literal" && typeof a.value.value === "string" && /-xs\b/.test(a.value.value)))
    .map(n => ({ cls: attr(n.openingElement, "className").value.value.split(" "), head: SRC.slice(n.range[0], Math.min(n.range[1], n.range[0] + 1500)), line: n.loc.start.line }));
  const pinBad = PINS.filter(([id, c, re]) => XSEL.filter(e => e.cls.includes(c) && re.test(e.head)).length !== 1)
    .map(([id, c, re]) => `${id} ${c}: ${XSEL.filter(e => e.cls.includes(c) && re.test(e.head)).map(e => "L" + e.line).join(",") || "none"}`);
  const uses = XSEL.reduce((a, e) => a + e.cls.filter(x => /-xs$/.test(x)).length, 0);
  T(`A-8 each of the ${PINS.length} narrow sites carries its class, found by an anchor inside it, and no other element carries an -xs class (${uses} uses)`,
    pinBad.length === 0 && uses === PINS.length, pinBad.join("; ") + ` uses ${uses}`);
  // The three scroll boxes (DH-2 (a)): each wraps exactly one element (the table or grid), with a 300 px floor.
  const boxes = withCls("dc-scrollx-xs").map(o => PARENT.get(o));
  const desc = b => { const ch = b.children.filter(c => c.type === "JSXElement"); const st = attr(b.openingElement, "style");
    return { n: ch.length, tag: ch[0] && ch[0].openingElement.name.name, floor: st ? SRCOF(st) : "", text: SRCOF(b).slice(0, 4000) }; };
  const D = boxes.map(desc);
  const mc = D.find(d => d.tag === "div" && /"Year"|>Year</.test(d.text) && /10TH/.test(d.text));
  const vt = D.find(d => d.tag === "table");
  const ir = D.find(d => d.tag === "div" && /MAGI Threshold/.test(d.text));
  // The floors (the build review's finding 1): each no wider than its box at 359 px of room (about 285 px), so no box scrolls where its table fits;
  // the percentile table's cells give up 4 px a side (dc-tight-xs) so it fits from 280 px; the Verify tables need no floor (a citation may break).
  T("A-9 the three tables each sit alone in a dc-scrollx-xs box: the Monte Carlo percentile table (280 px floor, tight cells), the IRMAA tiers (240 px), the Verify check tables (0 px, the table's text may break)",
    !!mc && !!vt && !!ir && [mc, vt, ir].every(d => d.n === 1) && /"--dc-floor": "280px"/.test(mc.floor) && /^<div className="dc-scrollx-xs"[^>]*>\{\/\*[^*]*\*\/\}<div className="dc-tight-xs"/.test(mc.text)
    && /"--dc-floor": "240px"/.test(ir.floor) && /"--dc-floor": "0px"/.test(vt.floor) && /<table className="dc-break-xs"/.test(vt.text), JSON.stringify(D.map(d => [d.tag, d.n, d.floor])));
  // No source-level extinction check: which grids overprint below 360 px of room depends on their text (measured, scope §0.4); t45 S-11 holds
  // every tab at the supported rooms in Chromium, which is where the claim lives.
} else {
  T(`A-1 ${KD} the phone layout reads the window's width: the stylesheet holds @media (max-width: 599px) and (max-width: 699px), and no .dc-narrow`,
    CSS.includes("@media (max-width: 599px)") && CSS.includes("@media (max-width: 699px)") && !CSS.includes(".dc-narrow"));
  T(`A-6 ${KD} no layout-width function: UI SIZE does not reach the phone classes`, FN.length === 0 && HOOK.length === 0);
  T(`A-7 ${KD} the zoomed root carries no class`, appRoot.length === 1 && !attr(appRoot[0], "className"));
}

// ── §B · the function, run on the source's own text ──────────────────────────────────────────────────────────────────────────────
console.log("  B — the class at each width");
if (POST) {
  const W = { innerWidth: 1024 };
  const f = FN.length ? new Function("window", SRCOF(FN[0]) + "\nreturn layoutWidthClass;")(W) : null;
  const at = (w, z) => { W.innerWidth = w; return f(z); };
  const XSC = "dc-narrow dc-sub700w dc-xs", NAR = "dc-narrow dc-sub700w", S7 = "dc-sub700w";
  // [UI SIZE, window width, class]: each boundary at room 360 / 600 / 700 (width x UI SIZE / 100), one pixel below and on it.
  const CASES = [[100, 359, XSC], [100, 360, NAR], [100, 599, NAR], [100, 600, S7], [100, 699, S7], [100, 700, ""],
    [115, 413, XSC], [115, 414, NAR], [115, 689, NAR], [115, 690, S7], [115, 804, S7], [115, 805, ""],
    [130, 467, XSC], [130, 468, NAR], [130, 779, NAR], [130, 780, S7], [130, 909, S7], [130, 910, ""],
    [150, 539, XSC], [150, 540, NAR], [150, 899, NAR], [150, 900, S7], [150, 1049, S7], [150, 1050, ""],
    [undefined, 599, NAR], [undefined, 600, S7], [150, 360, XSC], [150, 390, XSC], [130, 390, XSC], [115, 430, NAR]];
  const bad = CASES.filter(([z, w, want]) => at(w, z) !== want).map(([z, w, want]) => `${z}%/${w}: ${JSON.stringify(at(w, z))} (want ${JSON.stringify(want)})`);
  T(`B-1 the class at each boundary for UI SIZE 100/115/130/150% (${CASES.length} cases; an unset UI SIZE reads as 100%)`, !!f && bad.length === 0, bad.join("; "));
  // At 100% the switch is exactly the media queries v6.41 used: dc-narrow iff width <= 599, dc-sub700w iff width <= 699.
  const off = []; for (let w = 200; w <= 1500; w++) { const c = at(w, 100).split(" ");
    if (c.includes("dc-narrow") !== (w <= 599) || c.includes("dc-sub700w") !== (w <= 699)) off.push(w); }
  T("B-2 at UI SIZE 100% the classes switch exactly where v6.41's media queries did, at every integer width 200-1500", !!f && off.length === 0, off.slice(0, 10).join(","));
  // DH-1 (a): every phone 360 px or wider gets dc-xs at 115-150% only where its room is under 360 px; 240 px of room at 360 / 150% is the floor.
  T("B-3 a 360 px phone at 150% has 240 px of room and the narrow classes; at 100% it keeps v6.41's phone layout (no dc-xs); a 350 px phone at 100% has dc-xs (F-33)", at(350, 100) === XSC && at(360, 150) === XSC && at(360, 100) === NAR);
} else {
  T(`B-1 ${KD} there is no layout-width function to run`, FN.length === 0);
}

// ── §C · the rendered app (jsdom) ────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the rendered root");
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
const body = () => window.document.body;
let root = null, act, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const setW = w => Object.defineProperty(window, "innerWidth", { value: w, configurable: true, writable: true });
const resize = async w => { setW(w); try { await act(async () => { window.dispatchEvent(new window.Event("resize")); }); } catch (e) {} await flush(); };
// The app's root: the element holding the footer's version line and the tab strip, whose parent is the mount point's subtree — found as the
// outermost element under the mount carrying the app's skin variables (the data-load wrapper carries them too, but is gone once data loads).
const appRootEl = () => [...el.querySelectorAll("div")].find(d => (d.getAttribute("style") || "").includes("--bg") && d.querySelector("button.tab, select[aria-label='Choose a tab']"));
setW(1024);
await unmount(); window.localStorage.clear(); await render();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
let r0 = appRootEl();
T("C-0 SETUP: the app rendered past the data-load screen, and its root is found", !!r0);
if (POST) {
  T("C-1 in a 1024 px window at UI SIZE 100% the root carries no class attribute at all", !!r0 && !r0.hasAttribute("class"), r0 && r0.outerHTML.slice(0, 120));
  await resize(390); r0 = appRootEl();
  T("C-2 the window narrows to 390 px and a resize fires: the root takes dc-narrow dc-sub700w", !!r0 && r0.getAttribute("class") === "dc-narrow dc-sub700w", r0 && r0.getAttribute("class"));
  await resize(650); r0 = appRootEl();
  T("C-3 at 650 px: dc-sub700w only", !!r0 && r0.getAttribute("class") === "dc-sub700w", r0 && r0.getAttribute("class"));
  await resize(340); r0 = appRootEl();
  T("C-4 at 340 px (F-33): dc-narrow dc-sub700w dc-xs", !!r0 && r0.getAttribute("class") === "dc-narrow dc-sub700w dc-xs", r0 && r0.getAttribute("class"));
  await resize(1024); r0 = appRootEl();
  T("C-5 back at 1024 px: the class attribute is gone again", !!r0 && !r0.hasAttribute("class"), r0 && r0.getAttribute("class"));
  // UI SIZE 150%, set by its own button on the Skins tab: a 1024 px window has 683 px of room (dc-sub700w); a 390 px phone 260 (dc-xs).
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const sizeBtn = v => [...body().querySelectorAll("button")].find(b => (b.textContent || "").trim().replace(" ✓", "") === `${v}%`);
  if (!tabBtn("skins")) await click([...body().querySelectorAll("button")].find(b => /SHOW ALL TABS/.test(b.textContent || "")));
  await click(tabBtn("skins")); for (let i = 0; i < 3; i++) await flush();
  T("C-6 SETUP: the Skins tab's 150% UI SIZE button is found", !!sizeBtn(150));
  await click(sizeBtn(150)); for (let i = 0; i < 3; i++) await flush(); r0 = appRootEl();
  T("C-6 UI SIZE 150% in a 1024 px window: dc-sub700w (683 px of room)", !!r0 && r0.getAttribute("class") === "dc-sub700w", r0 && r0.getAttribute("class"));
  await resize(390); r0 = appRootEl();
  T("C-7 UI SIZE 150% in a 390 px window: dc-narrow dc-sub700w dc-xs (260 px of room)", !!r0 && r0.getAttribute("class") === "dc-narrow dc-sub700w dc-xs", r0 && r0.getAttribute("class"));
  await resize(1024); await click(sizeBtn(100)); for (let i = 0; i < 3; i++) await flush(); r0 = appRootEl();
  T("C-8 UI SIZE back to 100% in a 1024 px window: no class attribute", !!r0 && !r0.hasAttribute("class"), r0 && r0.getAttribute("class"));
} else {
  await resize(390); r0 = appRootEl();
  T(`C-1 ${KD} at 390 px the root takes no class: only the window's media query knows the width`, !!r0 && !r0.hasAttribute("class"));
}
await resize(1024);

// ── §D · the Field Manual and the version sites ─────────────────────────────────────────────────────────────────────────────────
console.log("  D — the Field Manual");
const DOCS = all(AST, n => n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML")[0];
const DH = DOCS ? DOCS.init.value : "";
const notes = [...DH.matchAll(/<li><strong>([^<]*\(v6\.\d+\))\.<\/strong>/g)].map(m => m[1]);
if (POST) {
  // v6.43: restated generically — the notes ahead of v6.42's are later releases', newest first; v6.41's follows it. Through v6.42, notes[0] / notes[1].
  { const vOf = n => +((n.match(/\(v6\.(\d+)\)$/) || [])[1]), i = notes.indexOf("UI SIZE and the phone layout (v6.42)"), ahead = i < 0 ? [] : notes.slice(0, i);
    T("D-1 §13's v6.42 note is the newest but for later releases' (newest first), and comes before v6.41's",
      i >= 0 && notes[i + 1] === "My Data, Social Security, Expenses and Taxes on a phone (v6.41)" && ahead.every((n, j) => vOf(n) > 42 && (j === 0 || vOf(ahead[j - 1]) > vOf(n))),
      notes.slice(0, Math.max(2, i + 2)).join(" | ")); }
  T("D-2 the v6.42 note says the layout follows the room UI SIZE leaves, the narrow rules, and that UI SIZE 100% on a 360 px phone and wider is unchanged",
    /The layout now follows the room UI SIZE leaves, the window’s width divided by UI SIZE: under 600 px of room the app uses its phone layout/.test(DH)
    && /At UI SIZE 100% on a phone 360 px wide or more, and on any wider screen, the layout is unchanged, and so is every figure\./.test(DH));
  T("D-3 the desktop item states the supported range (360 px at any UI SIZE; 320 px up to 130%) and the 240 px floor, and no longer says the layout follows the window",
    /No tab prints figures over their neighbours, and no page scrolls sideways, on a phone 360 px wide or more at any UI SIZE, or 320 px wide or more at UI SIZE up to 130%/.test(DH)
    && /The app is not designed for less than 240 px of room/.test(DH) && !/the phone layout follows the window’s width, not UI SIZE/.test(DH));
  // v6.43: the leg's own version (t1's STATIC checks hold the same four strings); through v6.42 this read a fixed "v6.42"
  { const VD = VER.replace(/^v(\d)(\d\d)$/, "v$1.$2");
    T(`D-4 the four version sites read ${VD}`, [`DATA LOAD │ ${VD}</div>`, `// FIELD MANUAL · ${VD} · PUBLIC BUILD`, `DANGER CLOSE ${VD} · documentation regenerated`, `<span>DANGER CLOSE ${VD} │ Not financial advice`].every(s => SRC.includes(s))); }
} else {
  T(`D-1 ${KD} §13 says the phone layout follows the window's width, not UI SIZE`, /the phone layout follows the window’s width, not UI SIZE/.test(DH));
}

await unmount();

// ── §E · the text ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the text");
const NEWEST = readdirSync(HERE).map(f => (f.match(/^dom_v(\d+)\.cjs$/) || [])[1]).filter(Boolean).map(Number).sort((a, b) => b - a)[0];
if (!POST) console.log(`  · §E runs on the v6.42 leg (it compares that leg with ${E_PRIOR})`);
else if (NEWEST !== undefined && NEWEST > 642) console.log(`  · §E skipped: it compares with v6.41's text, which only the v6.41 → v6.42 run builds (this run's newest leg is v${NEWEST})`);
else {
  const have = existsSync(join(HERE, `dom_${E_PRIOR}.cjs`));
  T(`E-1 SETUP: the run folder holds the ${E_PRIOR} leg (dom_${E_PRIOR}.cjs) — required in the v6.41 → v6.42 run, never skipped there`, have);
  if (have) {
    const dir = mkdtempSync(join(tmpdir(), "t106-")), dump = v => { const out = join(dir, `${v}.json`);
      const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), v, "--dump", out], { cwd: HERE, encoding: "utf8", timeout: 1800000, maxBuffer: 1 << 27 });
      try { return JSON.parse(readFileSync(out, "utf8")); } catch (e) { return { __err: (r.stderr || "").slice(-300) }; } };
    const A = dump(E_PRIOR), B = dump(VER); try { rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    const keys = Object.keys(B).filter(k => k !== "__err");
    T(`E-2 SETUP: both legs dumped every tab but the Field Manual's (25), each with text`, keys.length === 25 && Object.keys(A).length === 25 && keys.every(k => (B[k] || "").length > 300),
      `${Object.keys(A).length} ${keys.length} ${A.__err || B.__err || ""}`);
    const diff = keys.filter(k => A[k] !== B[k]).map(k => { const a = A[k] || "", b = B[k]; let i = 0; while (a[i] === b[i]) i++; return `${k} at ${i}: «${a.slice(Math.max(0, i - 50), i + 50)}» vs «${b.slice(Math.max(0, i - 50), i + 50)}»`; });
    T(`E-3 every tab's text on the example is identical to ${E_PRIOR}'s — no word or figure moved (${keys.length} tabs)`, keys.length === 25 && diff.length === 0, diff.slice(0, 2).join(" | "));
  }
}
finished = true;
console.log(`t106 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
