// t80 — THE CASH FROM A HOME MOVE IS THE USER'S, NOT A CONSTANT (v6.17 — D-38)
// Run: node t80_home_move_cash.mjs v617   |   node t80_home_move_cash.mjs v616
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D38_HOME_SALE_CASH_V617.md). Through v6.16 `HOME_SALE_PROCEEDS = 130000` added $130,000 to
// EVERY plan's portfolio in the quarter it retired — the example, a blank plan, an imported backup — whether or not anyone was moving,
// and no text said so. It is the net of a home move (sell, pay off, buy the next home in cash), so it can be 0 or negative. From v6.17
// it is a My Data field, `PORTFOLIO.homeMoveCash`, read through one accessor by the two Monte Carlo engines and the Events card; a plan
// saved without it reads 0 with a notice (DC-2 (a)); the example keeps 130,000 (DC-3 (a)).
//
// GATED PER LEG (OPERATIONS §B2). The v6.16 leg pins the constant as dated [KNOWN DEFECT] checks: the field changes nothing there.
// §A builds ORACLE modules at test time — the v6.16 source in this run folder with the constant set to X, compiled the way
// mk_testable.sh compiles a leg — so "the field is a pure replacement for the constant" is checked bit for bit, not argued. §C needs
// both legs' modules (the v6.16 → v6.17 pair only; printed skip on the other leg).
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execFileSync } from "child_process";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(80); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v617";
const KNOWN_VERSIONS = ["v616", "v617"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v617"].includes(VER);   // an array, so the next registration widens it
// The oracle's source and the differential's pair — constants, NOT `VER === "v617"`, so the registrar cannot widen them (t76 records why).
const ORACLE_SRC = "v616", D_PRIOR = "v616", D_CUR = "v617";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g } = M;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const JP = Parser.extend(jsx());
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });
const AST = JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t80 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-16, D-38 — flips at v6.17]";
console.log(`t80 — THE CASH FROM A HOME MOVE (${VER})\n`);

const BASE = clone(g.PORTFOLIO());
g.applyLoadedData({ portfolio: clone(BASE) }); const RY = g.buildPlanTimeline().targetRetireYear;
const XS = [130000, 0, -105000, 250000];
const withCash = (P, x) => ({ ...clone(P), homeMoveCash: x });
// Seeded runs of both Monte Carlo engines plus the mortgage what-if's loan run, as one string. Each engine is reseeded before it runs.
const mcRun = (G, P) => {
  G.applyLoadedData({ portfolio: clone(P) });
  _src = mulberry(2026); const mc = G.runMonteCarlo(RY, 120);
  _src = mulberry(2027); const ext = G.runExtendedMC(RY, 30, 120, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(11) });
  _src = mulberry(2028); const loan = G.runExtendedMC(RY, 30, 120, { ltcShocks: true, autoReplace: true, mortality: true, futureHomeMortgage: 80000, rng: mulberry(12) });
  return JSON.stringify({ mc, ext: { results: ext.results, p50: ext.p50, ruin: ext.ruin }, loan: { results: loan.results, p50: loan.p50 } });
};

// ── §A · the field is a pure replacement for the constant (oracle modules built from the v6.16 source) ─────────────────────────────
console.log("  A — against oracles: the v6.16 source with the constant set to X");
const oracleOf = (() => {
  const src0 = join(HERE, "..", `${ORACLE_SRC}.jsx`), shim = join(HERE, "shim.txt");
  if (!existsSync(src0) || !existsSync(shim)) return null;
  const base = readFileSync(src0, "utf8"), anchor = "const HOME_SALE_PROCEEDS = 130000;";
  if (base.split(anchor).length !== 2) return null;
  const cache = {};
  return async x => {
    if (cache[x]) return cache[x];
    const tag = `_t80_oracle_${x < 0 ? "m" : ""}${Math.abs(x)}`;
    const body = base.replace(anchor, `const HOME_SALE_PROCEEDS = ${x};`).replace("export default function DangerClose()", "function DangerClose()");
    writeFileSync(join(HERE, `${tag}.jsx`), body + readFileSync(shim, "utf8"));
    try {
      execFileSync("npx", ["esbuild", `${tag}.jsx`, "--loader:.jsx=jsx", "--jsx=automatic", "--format=esm", `--outfile=${tag}.mjs`, "--log-level=warning"], { cwd: HERE });
      return (cache[x] = (await import(pathToFileURL(join(HERE, `${tag}.mjs`)).href)).__g);
    } finally {
      // The module is loaded; its files go, so the run folder holds no stray qa/ files (package_check G-2 found them at the v6.17 ship).
      for (const f of [`${tag}.jsx`, `${tag}.mjs`]) { try { unlinkSync(join(HERE, f)); } catch (e) {} }
    }
  };
})();
T("A-0: SETUP — the oracle can be built: the v6.16 source and shim.txt are beside this run, and the constant occurs exactly once", !!oracleOf);
if (oracleOf) {
  const O130 = await oracleOf(130000), ref130 = mcRun(O130, BASE);
  for (const x of XS) {
    const O = await oracleOf(x), want = mcRun(O, BASE), got = mcRun(g, withCash(BASE, x));
    if (POST) T(`A-1 homeMoveCash = ${x.toLocaleString()}: both Monte Carlo engines and the mortgage what-if equal the v6.16 source with the constant at ${x.toLocaleString()}, bit for bit`, got === want);
    else T(`A-1 ${KD} homeMoveCash = ${x.toLocaleString()}: the field changes nothing — every plan runs at the constant's $130,000`, got === ref130);
    if (x !== 130000) T(`A-2 CONTROL homeMoveCash = ${x.toLocaleString()}: the oracle itself moves with X (so A-1 discriminates)`, want !== ref130);
  }
}

// ── §B · one accessor, no constant, no stray 130000 (AST) ───────────────────────────────────────────────────────────────────────────
console.log("  B — one accessor, read where it should be (AST)");
{
  const topFn = anc => { for (let i = 0; i < anc.length; i++) { const a = anc[i];
    if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
    if (a.type === "VariableDeclarator" && a.id && a.id.name && a.init && /Function/.test(a.init.type)) return a.id.name; } return "<module>"; };
  const innerFn = anc => { for (let i = anc.length - 1; i >= 0; i--) { const a = anc[i];
    if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
    if (a.type === "VariableDeclarator" && a.id && a.id.name && a.init && /Function/.test(a.init.type)) return a.id.name; } return "<module>"; };
  const constIds = [], calls = [], lits = [], blanks = [];
  walk.ancestor(AST, {
    Identifier(n, anc) { if (n.name === "HOME_SALE_PROCEEDS") constIds.push(`L${n.loc.start.line}`); },
    CallExpression(n, anc) { if (n.callee.type === "Identifier" && n.callee.name === "homeMoveCash") calls.push({ top: topFn(anc), inner: innerFn(anc), line: n.loc.start.line }); },
    // STATE_RULES carries $130,000 as tax-table figures (MT's 2027 joint threshold, a state band edge) — data, not this cash (measured: 2 sites).
    Literal(n, anc) { if (n.value === 130000 && !anc.some(a => a.type === "VariableDeclarator" && a.id && ["DEFAULT_PORTFOLIO", "STATE_RULES"].includes(a.id.name))) lits.push(`L${n.loc.start.line}`); },
    ObjectExpression(n, anc) { const f = innerFn(anc); if (!["build", "startFresh"].includes(f)) return;
      const k = n.properties.find(p => p.key && (p.key.name === "homeMoveCash" || p.key.value === "homeMoveCash")); if (k && n.properties.some(p => p.key && p.key.name === "_incomeFromForm")) blanks.push(`${f}=${k.value.value}`); } }, W);
  const engineSites = calls.filter(c => ["runMonteCarlo", "runExtendedMC", "computePlanEvents"].includes(c.top));
  const where = c => `${c.top}${c.top !== c.inner ? "/" + c.inner : ""}@L${c.line}`;
  T(POST ? "B-1 [EXTINCTION]: HOME_SALE_PROCEEDS exists nowhere in the source" : `B-1 ${KD}: HOME_SALE_PROCEEDS is a module constant, read at five sites (the declaration is a pattern, not a read)`,
    POST ? constIds.length === 0 : constIds.length === 5, constIds.join(", ") || "none");
  T(POST ? "B-2 [EXTINCTION]: no 130000 literal outside DEFAULT_PORTFOLIO (the example's own figure) and the state tax tables" : `B-2 ${KD}: the constant's 130000 is the one literal outside DEFAULT_PORTFOLIO`,
    POST ? lits.length === 0 : lits.length === 1, lits.join(", ") || "none");
  T(POST ? "B-3: the accessor is read at exactly five model sites — runMonteCarlo twice, runExtendedMC twice, the Events card once"
         : "B-3 (prior leg): there is no accessor",
    POST ? engineSites.length === 5 && engineSites.filter(c => c.top === "runMonteCarlo").length === 2 && engineSites.filter(c => c.top === "runExtendedMC").length === 2 : calls.length === 0,
    engineSites.map(where).join(", "));
  const allowed = ["runMonteCarlo", "runExtendedMC", "computePlanEvents", "applyLoadedDataUnchecked", "DangerCloseMain", "MyDataEditor", "homeMoveCash"];
  const stray = calls.filter(c => !allowed.includes(c.top));
  T("B-4: no other function reads it — not Engines A–D, the bridge series or the Roth ladder (only the model sites, the loader, and the two screens that show it)",
    stray.length === 0, stray.map(where).join(", "));
  T(POST ? "B-5: Start Fresh and the guided wizard build their new plan with homeMoveCash: 0 — a new plan has no move and shows no notice"
         : "B-5 (prior leg): neither blank plan carries the field",
    POST ? blanks.sort().join(",") === "build=0,startFresh=0" : blanks.length === 0, blanks.join(", ") || "none");
  const acc = POST ? g.homeMoveCash : undefined;
  T(POST ? "B-6: the accessor reads the field, clamps it to ±$10,000,000, and reads anything unparseable as 0"
         : "B-6 (prior leg): the shim finds no accessor",
    POST ? typeof acc === "function" && acc({ homeMoveCash: -105000 }) === -105000 && acc({ homeMoveCash: 1e12 }) === 10000000 && acc({ homeMoveCash: -1e12 }) === -10000000
           && acc({ homeMoveCash: "abc" }) === 0 && acc({}) === 0 && acc({ homeMoveCash: NaN }) === 0 && acc({ homeMoveCash: "250000" }) === 250000
         : g.homeMoveCash === undefined);
}

// ── §C · what cannot move, across the pair (needs both modules) ────────────────────────────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
if (VER === D_CUR && existsSync(PRI)) {
  console.log(`  C — ${D_PRIOR} → ${D_CUR}: what cannot move`);
  const M0 = await import(pathToFileURL(PRI).href);
  const strat = (G, p) => { G.applyLoadedData({ portfolio: clone(p) }); const tl = G.buildPlanTimeline(), r = tl.targetRetireYear;
    const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: r, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
      deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), ssA: G.getSSA(), ssB: tl.single ? 0 : G.getSSB(),
      ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month, pen: G.getPension(), penOwner: G.getPensionOwner(),
      stateRate: tl.stateTaxRate || 0, stateCode: G.PORTFOLIO().stateCode || null, convTaxFunding: "taxable", taxableGainFrac: 0,
      acaPremium: (G.PORTFOLIO().acaBridge || {}).premium || 0, acaSize: (G.PORTFOLIO().acaBridge || {}).size || 0, ...G.retireStartBalances(r),
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
      taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000, ordDrawByYr: G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "bull" }).ordDrawByYr };
    return G.runRothStrategies(P); };
  const engines = (mod, p) => { const G = mod.__g, EN = mod.__engines; G.applyLoadedData({ portfolio: clone(p) }); const r = G.buildPlanTimeline().targetRetireYear;
    const S = G.withdrawalPlanSeries({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" });
    const A = { retireYear: r, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr };
    return JSON.stringify({ A: strat(G, p), B: EN.computeTaxPlan(A).rows, C: EN.computeIrmaaPlan(A).rows,
      D: (G.applyLoadedData({ portfolio: clone(p) }), G.computeWithdrawalPlan({ retireYear: r, rothAmount: 70000, scenarioPreset: "base" }).schedule), S }); };
  T("C-1: the example household — Engines A, B, C and D and the bridge series are bit-identical v6.16 → v6.17", engines(M0, BASE) === engines(M, BASE));
  T("C-2: and so is every Monte Carlo figure — the example keeps its $130,000 (DC-3 (a))", mcRun(M0.__g, BASE) === mcRun(g, BASE));
  for (const x of [0, -105000, 250000])
    T(`C-3 homeMoveCash = ${x.toLocaleString()}: Engines A–D and the bridge do not see it — bit-identical to v6.16 on the same household`,
      engines(M0, withCash(BASE, x)) === engines(M, withCash(BASE, x)));
  const noField = clone(BASE); delete noField.homeMoveCash;
  T("C-4: a plan saved without the field — Engines A–D and the bridge are still bit-identical; only the Monte Carlo moves (to $0)",
    engines(M0, noField) === engines(M, noField) && mcRun(g, noField) === mcRun(g, withCash(BASE, 0)) && mcRun(g, noField) !== mcRun(g, BASE));
} else console.log(`  C — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only, with both modules; this leg is ${VER})`);

// ── §D · the hand pin (the planned path is deterministic) ──────────────────────────────────────────────────────────────────────────
// runMonteCarlo's planned path adds the cash in the retirement quarter, before that quarter's growth at BASE_GROWTH / 4 = 4.5% / 4.
// So against the example's +$130,000, a plan at $0 is lower, k quarters into retirement, by 130,000 × 1.01125^k exactly (while neither
// path floors at 0). By hand, k = 1: 130,000 × 1.01125 = 131,462.50 (D-1). Each later quarter multiplies by 1.01125 again (D-2, computed).
console.log("  D — the hand pin");
{
  const plan = P => { g.applyLoadedData({ portfolio: clone(P) }); _src = mulberry(1); return g.runMonteCarlo(RY, 2).plannedPath; };
  const a = plan(BASE), b = plan(withCash(BASE, 0)), d = a.map((v, i) => v - b[i]);
  const k0 = d.findIndex(v => Math.abs(v) > 0.005);
  if (POST) {
    T("D-1: the paths agree until the retirement quarter, and the first difference is 130,000 × 1.01125 = $131,462.50", k0 > 0 && Math.abs(d[k0] - 131462.5) < 0.01, `${k0}: ${d[k0]}`);
    T("D-2: and each later quarter multiplies it by exactly 1.01125 (no other term reads the field)",
      k0 > 0 && d.slice(k0, k0 + 40).every((v, i) => Math.abs(v - 130000 * Math.pow(1.01125, i + 1)) < 0.01), d.slice(k0, k0 + 3).map(v => v.toFixed(2)).join(", "));
  } else T(`D-1 ${KD}: the field moves nothing on the planned path`, k0 === -1);
  // The Events card names the figure, and drops the clause at $0.
  const card = P => { g.applyLoadedData({ portfolio: clone(P) }); return ((g.computePlanEvents(new Date(2027, 0, 15, 12)) || []).find(e => e.key === "retire") || {}).instructions || ""; };
  const c130 = card(BASE), c0 = card(withCash(BASE, 0)), cNeg = card(withCash(BASE, -105000));
  T(POST ? "D-3: the Events retirement card says the plan adds $130K for the example, takes $105K at −$105,000, and drops the clause at $0"
         : `D-3 ${KD}: the Events card says "the plan books $130K" whatever the plan`,
    POST ? /adds \$130K to the portfolio at retirement/.test(c130) && /takes \$105K from the portfolio at retirement/.test(cNeg) && !/home-move|books/.test(c0) && /beneficiary reviews/.test(c0)
         : [c130, c0, cNeg].every(c => c.includes("the plan books $130K at retirement")), `${c130.slice(100, 260)} | ${c0.slice(100, 220)}`);
}

// ── §E · the input, rendered: shown, saved, exported, imported; an old plan reads $0 with a notice ─────────────────────────────────
console.log("  E — the input (My Data, Monte Carlo tab, Save & Apply, Export Backup, Import)");
{
  const PREFIX = "dc:";
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  const grab = b => { window.__lastBlob = b; return "blob:t80"; };
  window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
  globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
  const revisit = async (tab = "my data") => { try { await act(async () => { root.unmount(); }); } catch (e) {} if (el) el.remove(); await render(); const t = tabBtn(tab); if (t) { await click(t); await flush(); } };
  const stored = () => JSON.parse(window.localStorage.getItem(PREFIX + K.portfolio) || "null");
  const save = async () => { await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush(); return stored(); };
  const field = () => body().querySelector('input[aria-label="Cash from your home move at retirement"]');
  const type = async (inp, v) => { try { await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set; setter.call(inp, v);
    inp.dispatchEvent(new window.Event("input", { bubbles: true })); }); } catch (e) {} await flush(); };
  const notice = w => body().querySelector(`[data-dc-home-move-notice="${w}"]`);
  const mcLine = () => { const n = body().querySelector("[data-dc-home-move-mc]"); return n ? n.textContent : ""; };
  const importFile = async payload => {
    const inp = [...body().querySelectorAll('input[type="file"]')].find(i => /json/.test(i.getAttribute("accept") || ""));
    if (!inp) return false;
    const file = new window.File([payload], "backup.json", { type: "application/json" });
    Object.defineProperty(inp, "files", { value: [file], configurable: true });
    try { await act(async () => { inp.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
    for (let i = 0; i < 8; i++) await flush();
    await flush(600); return true;
  };

  window.localStorage.clear(); await render();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  await click(tabBtn("my data")); await flush();
  T("E-0: SETUP — My Data rendered the example household", /RETIREMENT HOLDINGS/.test(body().textContent || ""));
  if (POST) {
    const f0 = field();
    T("E-1: the home row has the field, showing the example's 130000, with its note — and no notice (the example carries the field)",
      !!f0 && f0.value === "130000" && !!body().querySelector("[data-dc-home-move-note]") && !notice("mydata"), f0 ? f0.value : "no field");
    const note = (body().querySelector("[data-dc-home-move-note]") || {}).textContent || "";
    T("E-2: the note shows today's equity from Home value and Mortgage balance as a starting point",
      /Today's equity, from the two fields to the left: \$[\d,]+ — a starting point, not the answer\./.test(note), note.slice(-140));
    await type(field(), "-105,000");
    const S1 = await save();
    T("E-3: a negative figure typed with a comma is kept, and Save & Apply stores homeMoveCash: -105000", !!S1 && S1.homeMoveCash === -105000, S1 && S1.homeMoveCash);
    T("E-4: the applied plan carries it — the accessor reads −105,000", DG.homeMoveCash() === -105000, DG.homeMoveCash());
    await click(tabBtn("monte carlo")); await flush();
    T("E-5: the Monte Carlo tab names the figure and says it is taken from the portfolio in the retirement year",
      /Cash from your home move at retirement: −\$105,000 \(My Data\) — taken from the portfolio in \d{4}\./.test(mcLine()) && !notice("mc"), mcLine());
    await click(tabBtn("my data")); await flush();
    window.__lastBlob = null; await click(btn(/EXPORT BACKUP/)); await flush();
    const bk = window.__lastBlob ? JSON.parse(await window.__lastBlob.text()) : null;
    T("E-6: Export Backup carries homeMoveCash: -105000, and its Ask AI context has the HOME MOVE line",
      !!bk && bk.portfolio && bk.portfolio.homeMoveCash === -105000 && typeof bk.masterPrompt === "string" && bk.masterPrompt.includes("HOME MOVE: cash from a home move at retirement −$105,000 (taken from the portfolio in the retirement year"),
      bk ? `${bk.portfolio && bk.portfolio.homeMoveCash} | ${(bk.masterPrompt || "").split("\n").find(l => l.startsWith("HOME MOVE")) || "no line"}` : "no blob");
    await type(field(), "99999999999");
    const S2 = await save();
    T("E-7: an out-of-range entry is clamped to $10,000,000 on save", !!S2 && S2.homeMoveCash === 10000000, S2 && S2.homeMoveCash);
    await type(field(), "abc");
    const S3 = await save();
    T("E-8: and a non-number saves as 0", !!S3 && S3.homeMoveCash === 0, S3 && S3.homeMoveCash);
    await importFile(JSON.stringify(bk));
    const st = stored();
    T("E-9: importing the backup restores −105,000 — in the applied plan and in storage", DG.homeMoveCash() === -105000 && !!st && st.homeMoveCash === -105000, `${DG.homeMoveCash()} / ${st && st.homeMoveCash}`);
    // A plan saved before v6.17: the stored plan, without the field.
    const OLD = clone(st); delete OLD.homeMoveCash;
    window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(OLD));
    await revisit();
    T("E-10: a plan saved without the field opens at 0, with the notice on My Data", !!field() && field().value === "0" && !!notice("mydata") && DG.homeMoveCash() === 0,
      `${field() && field().value} | notice ${!!notice("mydata")}`);
    T("E-11: the notice says what changed — earlier versions added $130,000 to every plan; this plan assumes $0",
      /Earlier versions added \$130,000 to every plan at retirement; this plan now assumes \$0 until you enter your own figure/.test((notice("mydata") || {}).textContent || ""));
    await click(tabBtn("monte carlo")); await flush();
    T("E-12: the Monte Carlo tab shows the notice too, and its line reads $0 — nothing added",
      !!notice("mc") && /Cash from your home move at retirement: \$0 \(My Data\) — no home move, so nothing is added\./.test(mcLine()), mcLine());
    await click(tabBtn("my data")); await flush();
    const S4 = await save();
    await revisit();
    T("E-13: after Save & Apply the field is stored (0) and the notice is gone from both tabs",
      !!S4 && S4.homeMoveCash === 0 && !notice("mydata") && (await click(tabBtn("monte carlo")), !notice("mc")), `${S4 && S4.homeMoveCash}`);
    // The same old plan arriving as a backup through Import shows the notice as well.
    await click(tabBtn("my data")); await flush();
    await importFile(JSON.stringify({ app: "DangerClose", version: 5, portfolio: OLD, expenses: bk.expenses }));
    await revisit();
    T("E-14: an old backup imported through My Data opens at 0 with the notice (the import does not write the field for it)",
      !!field() && field().value === "0" && !!notice("mydata"), `${field() && field().value} | notice ${!!notice("mydata")}`);
  } else {
    T(`E-1 ${KD}: My Data has no field for it`, !field());
    const S1 = await save();
    T(`E-2 ${KD}: and a saved plan carries no homeMoveCash`, !!S1 && !("homeMoveCash" in S1));
  }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

// ── §F · what the user reads ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the copy");
{
  const texts = []; walk.full(AST, n => { if ((n.type === "Literal" && typeof n.value === "string") || n.type === "JSXText") texts.push(String(n.value));
    else if (n.type === "TemplateElement") texts.push(n.value.cooked || ""); }, W);
  const has = s => texts.some(t => t.includes(s));
  const NOTE = "is what is left after you sell your current home, pay off its mortgage and the selling costs, and pay cash for the next one";
  const NOTE_CC = "If the next home's closing costs are a one-time row in your expenses, they are already counted";
  const NOTE_TAX = "The sale is treated as tax-free (most home-sale gains are excluded up to $250,000, or $500,000 on a joint return).";
  const FM = "Every run adds the cash from your home move at retirement to the portfolio in the quarter you retire";
  const FM_HIST = "Through v6.16 this was a fixed $130,000 added to every plan and shown nowhere";
  const FM_ROW = "and, from v6.17, the cash from a home move at retirement (the Monte Carlo tabs use it";
  T(POST ? "F-1: My Data's note says what the figure is, that closing costs in the expenses are already counted, and that the sale is treated as tax-free"
         : "F-1 (prior leg): not yet", POST ? has(NOTE) && has(NOTE_CC) && has(NOTE_TAX) : !has(NOTE) && !has(NOTE_CC));
  T(POST ? "F-2: the Field Manual's Monte Carlo entry states the rule and the history, and its My Data table names the field"
         : "F-2 (prior leg): not yet", POST ? has(FM) && has(FM_HIST) && has(FM_ROW) : !has(FM) && !has(FM_ROW));
  T(POST ? "F-3 [EXTINCTION]: no text anywhere says the plan books a fixed amount at retirement" : `F-3 ${KD}: the Events card says "the plan books $…K at retirement"`,
    POST ? !has("the plan books") : has("the plan books"));
  const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
  if (POST && MP) {
    const md = readFileSync(MP, "utf8");
    T("F-4: METHODOLOGY has the section, the measurements' baseline ($130,000 → $0) and the §121 simplification",
      /## Cash from a home move/.test(md) && /homeMoveCash/.test(md) && /§121/.test(md) && /D-39/.test(md));
  } else console.log(`  F-4 — skipped by design (${POST ? "METHODOLOGY.md not found beside this run" : "the current leg only: the run folder carries one METHODOLOGY.md"})`);
}

finished = true;
console.log(`\nt80 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
