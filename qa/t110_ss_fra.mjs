// t110 — THE SOCIAL SECURITY TAB'S READING OF EACH SPOUSE'S BENEFIT AT 67 (D-56's $1,944; docs/SCOPE_D56_SS_FRA_ESTIMATE_V646.md, DK-1 (a),
// DK-2 (a)). NEW at v6.46. Both legs.  Run: node t110_ss_fra.mjs v646   |   node t110_ss_fra.mjs v645
//
// WHAT WAS WRONG. The tab read a spouse's benefit at 67 seven times with four fallbacks for a plan whose table has no age-67 figure; spouse B's
// main one was a typed $1,944. A married plan whose spouse B has no benefit of her own reached it, and the tab built her card ($1,458 at 63),
// the combined income, the shortfall card, the draw table and the survivor figures from it while every engine paid her $0 — and hid the
// spousal-benefit warning on exactly that plan. From v6.46 one helper, `ssFraOf`: the table's figure, else the planned amount carried back to
// 67 from the tab's own claim age (`ssTabClaimAge`), else 0; a spouse with none shows $0, a sentence and the warning; three divisions guarded.
//
// SECTIONS. §A the source by AST. §B the helper, by checks that do not share its formula (genSSTable's age-67 cell over 6,000 amounts × nine
// ages; the round trip through the tab's SSA formula; claim-age and string shapes). §C rendered shapes against oracles written here from the
// plan's fields and SSA's rules — never by calling the app's helpers, though `fraOf` below states the same rule as `ssFraOf` (§C checks the
// tab is wired to the rule; the rule itself is pinned independently by §B and §E's hand figures). §D the tab's text identical to v6.45's where both tables hold 67 (the prior leg dumped
// in a child process, to a file). §E hand pins. §F the copy. The v6.45 leg pins each defect as `[KNOWN DEFECT 2026-11-05, D-56 — flips at v6.46]`.
//
// HARNESS TRAPS (t109's, the scope's review and the build review): `applyLoadedData` does not remount, and the tab's claim-age sliders take
// their ages only when it mounts — so each plan is stored and the app mounted afresh (t101's storage shim), and every oracle still reads the
// slider ages off the cards; the page is read by a text walk, not a clone (jsdom cannot re-parse a style React updated in place), with a space
// between text nodes; the prior leg's dump goes through a file. §D starts at the tab's first heading, after the retirement selector,
// whose Monte Carlo medians depend on the random stream's position.
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(110); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v646";
const DUMP = process.argv[3] === "--dumpdom";
const KNOWN_VERSIONS = ["v645", "v646"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v646"].includes(VER);   // an array, so the next registration widens it
const C_PRIOR = "v645";                // §D's prior module — a constant, so the registrar cannot widen it
const KD = "[KNOWN DEFECT 2026-11-05, D-56 — flips at v6.46]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const normVer = t => t.replace(/v6\.4[56]\b/g, "v6.4x").replace(/\bv64[56]\b/g, "v64x");
const ssPart = t => { const i = t.indexOf("TRUST-FUND DEPLETION SCENARIO"); return i < 0 ? "" : t.slice(i); };

// ── the oracle, from the plan's fields and SSA's rules (never the app's helpers) ────────────────────────────────────────────────────────
// SSA's factors for a full retirement age of 67 (POMS RS 00615.101 / .680): 5/9 % a month for the first 36 months early, 5/12 % beyond;
// 2/3 % a month of delayed credits to 70. As whole-age factors: 62 0.70, 63 0.75, 64 0.80, 65 0.8667, 66 0.9333, 67 1, 68 1.08, 69 1.16, 70 1.24.
const SSA = { 62: 0.70, 63: 0.75, 64: 0.80, 65: 0.8667, 66: 0.9333, 67: 1.0, 68: 1.08, 69: 1.16, 70: 1.24 };
const ben = (fra, age) => { const m = (age - 67) * 12; if (m < 0) { const me = -m; const red = me <= 36 ? me * (5 / 9) / 100 : 36 * (5 / 9) / 100 + (me - 36) * (5 / 12) / 100;
  return Math.round(fra * (1 - red)); } return m > 0 ? Math.round(fra * (1 + m * (2 / 3) / 100)) : fra; };
const claimAge = (b, who) => { const n = Math.round(Number(b && b.plannedAge)); return Math.min(70, Math.max(62, Number.isFinite(n) && n > 0 ? n : (who === "A" ? 67 : 63))); };
const fraOf = (P, who) => { if (who === "B" && P.single) return 0; const b = (P.incomeSources || {})[who === "B" ? "ssB" : "ssA"] || {};
  const t = Number(b.tableByAge && b.tableByAge[67]) || 0; if (t > 0) return t; const pl = Number(b.planned) || 0;
  return pl > 0 ? Math.round(pl / SSA[claimAge(b, who)]) : 0; };

// ── the plan shapes (each from a fresh copy of the example; the scope's §0.3 and the review's) ─────────────────────────────────────────
const withSS = (k, b) => P => { const Q = clone(P); Q.incomeSources = { ...Q.incomeSources, [k]: b }; return Q; };
const zeros = { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 };
const SHAPES = {
  example: P => clone(P),
  noSSB: withSS("ssB", { tableByAge: {}, planned: 0, plannedAge: 63 }),                      // My Data or a backup with B's block empty
  zeroTable: withSS("ssB", { tableByAge: { ...zeros }, planned: 0, plannedAge: 63 }),           // the guided setup / My Data with B at $0
  missingB: P => { const Q = clone(P); delete Q.incomeSources.ssB; return Q; },                 // a backup with no spouse-B block
  no67: withSS("ssB", { tableByAge: { 62: 1200, 63: 1300, 64: 1400, 65: 1550, 70: 2250 }, planned: 1300, plannedAge: 63 }),   // a statement without 67
  bigB: withSS("ssB", { tableByAge: { 62: 2100, 63: 2250, 64: 2400, 65: 2600, 67: 3000, 70: 3720 }, planned: 2250, plannedAge: 63 }),
  noSSA: withSS("ssA", { tableByAge: { ...zeros }, planned: 0, plannedAge: 67 }),
  smallA_noSSB: P => { const Q = withSS("ssA", { tableByAge: { 62: 700, 63: 750, 64: 800, 65: 867, 67: 1000, 70: 1240 }, planned: 1000, plannedAge: 67 })(P);
    Q.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 63 }; return Q; },
  aNoTable: withSS("ssA", { tableByAge: {}, planned: 3000, plannedAge: 67 }),                  // A holds a benefit but no table, planned at 67
  aNoTable65: withSS("ssA", { tableByAge: {}, planned: 3000, plannedAge: 65 }),                // the scope's §0.5 shape: planned at 65, so carried back to 67
  single: P => ({ ...clone(P), single: true, nameB: "" }),
};

// ── the rendered app — every plan loaded from storage into a fresh mount, as a reload does (the build review: the tab's claim-age sliders
//    take their ages only when it mounts, so a plan applied in place would be read at the plan before's ages) ─────────────────────────────
const PREFIX = "dc:";
window.confirm = () => true;
window.storage = {   // t101's in-memory storage, over jsdom's localStorage
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
  const text = () => { const w = window.document.createTreeWalker(body(), window.NodeFilter.SHOW_TEXT); let out = "";
    while (w.nextNode()) { const p = w.currentNode.parentNode; if (p && (p.nodeName === "STYLE" || p.nodeName === "SCRIPT")) continue; out += " " + w.currentNode.nodeValue; }   // a space between text nodes, so a figure and its label never run together
    return out.replace(/\s+/g, " "); };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], JSON.stringify(v));
  window.localStorage.clear(); await render();
  await click([...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const visit = async P => { await unmount(); window.localStorage.clear(); put("portfolio", P); put("expenses", DX0); await render();
    if (!tabBtn("ss") && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/));
    await click(tabBtn("ss")); await flush(200);
    let t0 = text(); for (let i = 0; i < 20; i++) { await flush(100); const t1 = text(); if (t1 === t0) break; t0 = t1; } return t0; };
  return { DG, DP0, visit, unmount };
};
const num = x => x == null ? null : Number(String(x).replace(/[$,\s]/g, ""));
const grab = t => { const m = re => (t.match(re) || [])[1];
  return { estFra: num(m(/BENEFIT BY CLAIMING AGE \(EST\. FRA: \$ ?([\d,]+) ?\/mo\)/)),
    ageA: num(m(/SPOUSE A SS @ AGE (\d+)/)), cardA: num(m(/SPOUSE A SS @ AGE \d+ ?\$ ?([\d,]+) ?\/mo/)),
    ageB: num(m(/SPOUSE B SS @ AGE (\d+)/)), cardB: num(m(/SPOUSE B SS @ AGE \d+ ?\$ ?([\d,]+) ?\/mo/)),
    comb: num(m(/Combined income \(all SS\) ?\$ ?([\d,]+) ?\/mo/)), short: num(m(/Shortfall after [^$]*?\$ ?([\d,]+) ?\/mo/)),
    survOwn: num(m(/Max of Spouse B ?'s own \(\$ ?([\d,]+) ?\)/)),
    grid: [...t.matchAll(/CLAIM (?:62|FRA \(67\)|70) ?\$ ?([\d,]+) ?Spouse B keeps/g)].map(x => num(x[1])),
    warn: /SPOUSAL BENEFIT NOT MODELED/.test(t), gap: num(m(/roughly \$ ?([\d,]+) ?\/mo/)), gapYr: num(m(/roughly \$ ?[\d,]+ ?\/mo \(\$ ?([\d,]+) ?\/yr\)/)),
    none: /This plan holds no Social Security benefit for Spouse B ?, so every projection pays Spouse B ?no Social Security\./.test(t),
    nan: /NaN|Infinity/.test(t) }; };
if (DUMP) {
  const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const app = await mountApp(VER), out = {};
  const plans = [["example", SHAPES.example], ["bigB", SHAPES.bigB], ["single", SHAPES.single],
    ...Object.keys(HOUSEHOLDS).map(n => [`fixture ${n}`, P => { const Q = clone(P); HOUSEHOLDS[n].apply(Q); return Q; }])];
  for (const [nm, f] of plans) { _src = mulberry(110); out[nm] = ssPart(await app.visit(f(app.DP0))); }
  await app.unmount();
  writeFileSync(process.argv[4], JSON.stringify(out));   // a file, not stdout (t109's truncated pipe)
  process.exit(0);
}

const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const topOf = anc => { for (const a of anc) { if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
  if (a.type === "VariableDeclaration" && a.declarations[0] && a.declarations[0].id.type === "Identifier") return a.declarations[0].id.name;
  if (a.type === "ExportDefaultDeclaration" && a.declaration && a.declaration.id) return a.declaration.id.name; } return "<top>"; };
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T110_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t110 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t110 — THE SOCIAL SECURITY TAB'S READING OF EACH SPOUSE'S BENEFIT AT 67 (${VER})`);

// ── §A · the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source");
{
  const helper = AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === "ssFraOf");
  // every read of a spouse's age-67 table figure: a computed member [67] whose object is a .tableByAge member
  // (the build review: any computed [67] or ["67"] member, on any object — a table read through an alias counts too)
  const reads67 = all(AST, n => n.type === "MemberExpression" && n.computed && n.property.type === "Literal" && (n.property.value === 67 || n.property.value === "67"));
  const where = reads67.map(r => topOf(r.anc));
  const inTab = where.filter(w => w === "DangerCloseMain").length;
  if (POST) {
    T("A-1 `ssFraOf` is a module-level function that reads `ssTabClaimAge` and `SS_FACTORS`", !!helper && /ssTabClaimAge\(who\)/.test(SRCOF(helper)) && /SS_FACTORS\[/.test(SRCOF(helper)));
    // the statement parser reads its own freshly parsed table's 67 (a local \`tableByAge\`) to choose the planned age — a writer, not the tab
    T(`A-2 EXTINCTION: every [67] read in the source is in \`ssFraOf\` or the statement parser (got: ${where.join(", ")})`,
      where.length > 0 && where.every(w => w === "ssFraOf" || w === "extractIncomeSourcesFromDocx") && where.filter(w => w === "ssFraOf").length === 1);
    const calls = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "ssFraOf").map(r => topOf(r.anc));
    T(`A-3 the Social Security tab calls \`ssFraOf\` at the seven reads (${calls.length})`, calls.length === 7 && calls.every(w => w === "DangerCloseMain"));
  } else T(`A-2 ${KD}: the Social Security tab reads the age-67 figure itself at seven sites, each with its own fallback (got ${inTab})`, inTab === 7 && !helper);
  // no literal of 1,000 or more as a fallback on a read of the benefit table
  const fb = all(AST, n => n.type === "LogicalExpression" && (n.operator === "||" || n.operator === "??") && n.right.type === "Literal"
    && typeof n.right.value === "number" && n.right.value >= 1000 && /tableByAge/.test(SRCOF(n.left)));
  if (POST) T(`A-4 no numeric literal of 1,000 or more stands as the fallback for a benefit-table read (got ${fb.map(r => r.n.right.value).join(", ") || "none"})`, fb.length === 0);
  else T(`A-4 ${KD}: spouse B's read falls back to a typed $1,944`, fb.length === 1 && fb[0].n.right.value === 1944);
  // the three divisions by a spouse's figure, each inside a conditional that tests it > 0
  const divs = all(AST, n => n.type === "BinaryExpression" && n.operator === "/" && n.right.type === "Identifier" && ["spouseAFRA", "spouseBFRAest"].includes(n.right.name));
  // the division must sit in the branch the test guards (the build review: a `> 0` test above it is not enough)
  const inside = (outer, inner) => outer && inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1];
  const guarded = d => d.anc.some(a => (a.type === "ConditionalExpression" && new RegExp(`${d.n.right.name} > 0`).test(SRCOF(a.test)) && inside(a.consequent, d.n))
    || (a.type === "LogicalExpression" && a.operator === "&&" && new RegExp(`${d.n.right.name} > 0`).test(SRCOF(a.left)) && inside(a.right, d.n)));
  const ung = divs.filter(d => !guarded(d));
  if (POST) T(`A-5 every division by a spouse's figure is guarded by a test that it is above 0 (${divs.length} divisions, ${ung.length} unguarded)`, divs.length >= 3 && ung.length === 0,
    ung.map(d => `L${d.n.loc.start.line}`).join(", "));
  else T(`A-5 ${KD}: three divisions by a spouse's figure are unguarded (A's % of FRA, B's % of est. FRA, the early-reduction note)`, ung.length === 3, ung.map(d => `L${d.n.loc.start.line}`).join(", "));
}

// ── §B · the helper, by checks that do not share its formula ──────────────────────────────────────────────────────────────────────
console.log("  B — the helper");
if (POST) {
  const P = g.PORTFOLIO(); const keepA = clone(P.incomeSources.ssA), keepB = clone(P.incomeSources.ssB), keepS = P.single;
  let bad = [], rt = [], n = 0;
  for (const age of [62, 63, 64, 65, 66, 67, 68, 69, 70]) for (let amt = 1; amt <= 6000; amt++) {
    P.incomeSources.ssA = { tableByAge: {}, planned: amt, plannedAge: age }; n++;
    const f = g.ssFraOf("A");
    if (f !== g.genSSTable(amt, age)[67]) bad.push(`${amt}@${age}: ${f} vs ${g.genSSTable(amt, age)[67]}`);
    if (Math.abs(ben(f, age) - amt) > 1 + 0.0001 * amt) rt.push(`${amt}@${age}: ${ben(f, age)}`);
  }
  T(`B-1 with no table, the helper equals genSSTable's age-67 cell — the table My Data would write — for every whole amount $1–$6,000 at all nine claim ages (${n} cases)`, bad.length === 0, bad.slice(0, 4).join(" | "));
  T(`B-2 the round trip: the tab's SSA formula applied to the helper returns the planned amount at the claim age, within $1 (and 0.01% above $10,000) (${n} cases)`, rt.length === 0, rt.slice(0, 4).join(" | "));
  P.incomeSources.ssA = { tableByAge: { 62: 2000, 67: 2900 }, planned: 9999, plannedAge: 62 };
  T("B-3 a table's age-67 figure wins over the planned amount", g.ssFraOf("A") === 2900);
  P.incomeSources.ssA = { tableByAge: { 67: "1800" }, planned: 0, plannedAge: 67 };
  T("B-4 a string table value reads as a number (a backup storing \"1800\")", g.ssFraOf("A") === 1800);
  const shapes = [[undefined, 1300, "B", 1733], [0, 1300, "B", 1733], ["65", 1300, "B", 1500], [65.4, 1300, "B", 1500], [71, 1240, "A", 1000], [undefined, 1300, "A", 1300], [null, 0, "A", 0]];
  const got = shapes.map(([age, pl, who]) => { P.incomeSources[who === "A" ? "ssA" : "ssB"] = { tableByAge: {}, planned: pl, plannedAge: age }; return g.ssFraOf(who); });
  T(`B-5 claim ages read as the tab's explorer reads them (missing or 0 → 63 for B, 67 for A; "65" and 65.4 → 65; 71 → 70): ${got.join(", ")}`,
    shapes.every(([age, pl, who, want], i) => got[i] === want && got[i] === fraOf({ incomeSources: { [who === "A" ? "ssA" : "ssB"]: { tableByAge: {}, planned: pl, plannedAge: age } } }, who)), JSON.stringify(got));
  P.incomeSources.ssB = { tableByAge: { 70: 2250 }, planned: 0, plannedAge: 63 };
  T("B-6 a table without 67 and no planned amount reads 0 — no figure is invented", g.ssFraOf("B") === 0);
  P.incomeSources.ssB = clone(keepB); P.single = true;
  T("B-7 a single plan's spouse B reads 0, as getSSB() does, whatever is stored", g.ssFraOf("B") === 0 && g.getSSB() === 0);
  P.single = keepS; P.incomeSources.ssA = keepA; P.incomeSources.ssB = keepB;
  T("B-8 the example reads its tables: A $3,300, B $1,800", g.ssFraOf("A") === 3300 && g.ssFraOf("B") === 1800);
} else T(`B-1 (v6.45) there is no helper`, typeof g.ssFraOf !== "function");

// ── §C · rendered ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — rendered");
const app = await mountApp(VER);
const P0 = app.DP0, R = {}, PL = {};
for (const [nm, f] of Object.entries(SHAPES)) { _src = mulberry(110); PL[nm] = f(P0); R[nm] = grab(await app.visit(PL[nm])); R[nm].pp = (app.DG.postPayments() || {}).monthly; }
const pen = P => Number((P.incomeSources.pension || {}).amount) || 0;
// the oracle for one shape at the sliders' ages, from the plan's fields
const expect = nm => { const P = PL[nm], r = R[nm], fA = fraOf(P, "A"), fB = fraOf(P, "B"), a = ben(fA, r.ageA), b = P.single ? 0 : ben(fB, r.ageB);
  const half = Math.round(fA * 0.5);
  return { fA, fB, a, b, comb: a + b + pen(P), short: Math.max(0, r.pp - b - pen(P) - a), warn: !P.single && half > fB, gap: Math.max(0, half - fB),
    grid: [Math.max(ben(fA, 62), b), Math.max(fA, b), Math.max(ben(fA, 70), b)] }; };
if (POST) {
  for (const nm of ["example", "noSSB", "zeroTable", "missingB", "no67", "bigB", "noSSA", "smallA_noSSB", "aNoTable", "aNoTable65"]) {
    const r = R[nm], e = expect(nm);
    T(`C-${nm}: EST. FRA, both cards, combined income, shortfall, survivor card and grid, and the warning, from the plan's own figures at the sliders' ages (A ${r.ageA}, B ${r.ageB})`,
      r.estFra === e.fB && r.cardA === e.a && r.cardB === e.b && r.comb === e.comb && r.short === e.short && r.survOwn === e.b
      && JSON.stringify(r.grid) === JSON.stringify(e.grid) && r.warn === e.warn && (!e.warn || r.gap === e.gap) && !r.nan,
      JSON.stringify({ got: { fra: r.estFra, a: r.cardA, b: r.cardB, comb: r.comb, short: r.short, surv: r.survOwn, grid: r.grid, warn: r.warn, gap: r.gap, nan: r.nan },
        want: { fra: e.fB, a: e.a, b: e.b, comb: e.comb, short: e.short, grid: e.grid, warn: e.warn, gap: e.gap } }));
  }
  T(`C-none: the sentence for a spouse with no benefit shows on noSSB, zeroTable, missingB and smallA_noSSB, and nowhere else`,
    Object.entries(R).every(([k, r]) => r.none === ["noSSB", "zeroTable", "missingB", "smallA_noSSB"].includes(k)), Object.entries(R).map(([k, r]) => `${k}:${r.none}`).join(" "));
  T("C-single: a single plan shows no spouse-B estimate and no NaN", R.single.estFra === null && !R.single.nan);
} else {
  T(`C-noSSB ${KD}: a spouse with no benefit is estimated at $1,944, her card $1,458 at 63, the combined income $5,158, the shortfall $2,462, and no warning (got ${R.noSSB.estFra}, ${R.noSSB.cardB}, ${R.noSSB.comb}, ${R.noSSB.short}, ${R.noSSB.warn})`,
    R.noSSB.estFra === 1944 && R.noSSB.cardB === 1458 && R.noSSB.comb === 5158 && R.noSSB.short === 2462 && !R.noSSB.warn);
  T(`C-noSSA ${KD}: spouse A with no benefit prints NaN`, R.noSSA.nan);
  T(`C-smallA ${KD}: with A's benefit the smaller, every survivor cell says B keeps the invented $1,458 (got ${R.smallA_noSSB.grid.join(", ")})`, R.smallA_noSSB.grid.every(v => v === 1458));
  T(`C-no67 ${KD}: a statement without an age-67 row is estimated at $1,944 and her card $1,458 at 63, not her own $1,300 (got ${R.no67.estFra}, ${R.no67.cardB})`,
    R.no67.estFra === 1944 && R.no67.cardB === 1458);
  T(`C-aNoTable65 ${KD}: A's $3,000 planned at 65 is read as her benefit at 67 — the survivor grid's FRA cell $3,000, not $3,461 (got ${R.aNoTable65.grid.join(", ")})`,
    R.aNoTable65.grid[1] === 3000);
}

// ── §D · the tab's text identical to v6.45's where both tables hold 67 ─────────────────────────────────────────────────────────────
console.log("  D — v6.45's tab where nothing should move");
if (POST && existsSync(join(HERE, `dom_${C_PRIOR}.cjs`))) {
  const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const dumpFile = join(tmpdir(), `t110_dump_${process.pid}.json`);
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), C_PRIOR, "--dumpdom", dumpFile], { cwd: HERE, encoding: "utf8", timeout: 1500000, maxBuffer: 1 << 26 });
  let prior = null; try { prior = JSON.parse(readFileSync(dumpFile, "utf8")); unlinkSync(dumpFile); } catch (e) {}
  const plans = [["example", SHAPES.example], ["bigB", SHAPES.bigB], ["single", SHAPES.single],
    ...Object.keys(HOUSEHOLDS).map(n => [`fixture ${n}`, P => { const Q = clone(P); HOUSEHOLDS[n].apply(Q); return Q; }])];
  const cur = {}; for (const [nm, f] of plans) { _src = mulberry(110); cur[nm] = ssPart(await app.visit(f(P0))); }
  const dk = prior ? Object.keys(cur).filter(k => normVer(cur[k]) !== normVer(prior[k] || "")) : ["(no dump)"];
  const firstDiff = k => { const a = normVer(cur[k]), b = normVer(prior[k] || ""); let i = 0; while (i < a.length && a[i] === b[i]) i++; return `${k} @${i}: …${a.slice(Math.max(0, i - 60), i + 80)}… vs …${b.slice(Math.max(0, i - 60), i + 80)}…`; };
  T(`D-1 the Social Security tab (from its first heading to the page's end) is v6.45's text on ${plans.length} plans whose tables hold 67 — the example, bigB, a single plan and every fixture household (${prior ? Object.keys(prior).length : 0} prior)`,
    !!prior && Object.keys(cur).length === plans.length && Object.keys(cur).every(k => cur[k].length > 2000) && dk.length === 0,
    prior ? dk.slice(0, 2).map(firstDiff).join(" | ") : (r.stderr || r.stdout || "").slice(-300));
} else console.log(`     (§D: ${POST ? `no dom_${C_PRIOR}.cjs in this run folder — skipped` : "the v6.45 leg has nothing to compare with — skipped"})`);
await app.unmount();

// ── §E · hand pins ───────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — hand pins");
{
  // The example: A $3,300 at 67, B $1,800 at 67 claiming at 63 — 48 months early: 36 × 5/9 % + 12 × 5/12 % = 25%, $1,350; pension $400.
  T(`E-1 the example, both legs: EST. FRA $1,800, B's card $1,350, combined $5,050 (= 3,300 + 1,350 + 400), no warning ($1,650 ≤ $1,800) (got ${R.example.estFra}, ${R.example.cardB}, ${R.example.comb}, ${R.example.warn})`,
    R.example.estFra === 1800 && R.example.cardB === 1350 && R.example.comb === 5050 && !R.example.warn);
  if (POST) {
    // noSSB: B $0; the post-payment spending $7,620 − $0 − the $400 pension − A's $3,300 = $3,920; the warning's gap ½ × 3,300 − 0 = $1,650.
    T(`E-2 noSSB: combined $3,700, shortfall $3,920, the warning with a $1,650/mo ($19,800/yr) gap (got ${R.noSSB.comb}, ${R.noSSB.short}, ${R.noSSB.gap}, ${R.noSSB.gapYr})`,
      R.noSSB.comb === 3700 && R.noSSB.short === 3920 && R.noSSB.warn && R.noSSB.gap === 1650 && R.noSSB.gapYr === 19800 && R.noSSB.pp === 7620);
    // no67: her $1,300 at 63 ÷ 0.75 = $1,733.33 → $1,733; at 63 the card is 1,733 × 0.75 = 1,299.75 → $1,300, her plan's own figure.
    T(`E-3 no67: EST. FRA $1,733 and her card $1,300 — her own (got ${R.no67.estFra}, ${R.no67.cardB})`, R.no67.estFra === 1733 && R.no67.cardB === 1300);
    // aNoTable: A $3,000 planned at 67 with no table → $3,000 at 67 (planned age 67); the card at the slider's 67 is $3,000.
    T(`E-4 aNoTable: A's card at 67 is her planned $3,000 (got ${R.aNoTable.cardA} at ${R.aNoTable.ageA})`, R.aNoTable.ageA === 67 && R.aNoTable.cardA === 3000);
    // aNoTable65: $3,000 at 65 ÷ 0.8667 = $3,461.40 → $3,461 at 67; at 65 the card is 3,461 × (1 − 24 × 5/9 %) = 2,999.53 → $3,000, her plan's own.
    const a65 = R.aNoTable65;
    T(`E-5 aNoTable65: A's benefit at 67 reads $3,461, and her card at 65 is her own $3,000 (got ${a65.cardA} at ${a65.ageA}, grid ${a65.grid.join(", ")})`,
      a65.grid[1] === 3461 && a65.ageA === 65 && a65.cardA === 3000);
  }
}

// ── §F · the copy ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the copy");
{
  const DOCS = String((typeof app.DG.DOCS_HTML === "function" ? app.DG.DOCS_HTML() : app.DG.DOCS_HTML) || "");
  const NOTE = "Social Security for a spouse with no benefit of their own (v6.46).";
  if (POST) {
    T("F-1 the Field Manual's §13 carries the v6.46 note, ahead of v6.45's", DOCS.includes(NOTE) && DOCS.indexOf(NOTE) < DOCS.indexOf("The Roth conversion ladder’s starting balances (v6.45)."));
    T("F-2 the note names the $1,944, the shortfall card and that no projection changes", DOCS.includes("$1,944 a month at 67, a figure typed into the app") && DOCS.includes("the shortfall card read $2,462")
      && DOCS.includes("No projection changes"));
    const meth = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : null;
    if (meth !== null) T("F-3 METHODOLOGY carries the section on the tab's one reading (v6.46)", meth.includes("## The Social Security tab's reading of each spouse's benefit at 67 (v6.46)"));
    else console.log("     (F-3: no METHODOLOGY.md in the run folder's root — skipped)");
  } else T("F-1 (v6.45): no v6.46 note", !DOCS.includes(NOTE));
}

console.log(`\nt110 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
