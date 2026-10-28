// t94 — THE MONTE CARLO PAYS IRMAA, AND ASK AI ASKS CLAUDE OPUS 4.8 AT MEDIUM EFFORT (v6.31 — D-51, AI-6; docs/SCOPE_D51_AI6_V631.md)
// Run: node t94_mc_irmaa_ai.mjs v631   |   node t94_mc_irmaa_ai.mjs v630
//
// THE DEFECTS THIS EXISTS FOR. Through v6.30 the Monte Carlo's yearly schedule was the Taxes tab's income tax alone: the Medicare surcharges
// (IRMAA) the IRMAA tab projects were charged by no simulation, and What Breaks' tax estimate (Engine A's `totTaxToday`) left out Engine A's
// own `totIrmaaToday` — on the example at a $250K slider about $24,000 in today's dollars, and the Field Manual said so (D-51). Ask AI asked
// Claude Sonnet 4.6 (AI-6, Steve's decision: Claude Opus 4.8 at medium effort). From v6.31: mcIncomeTaxSchedule adds Engine C's
// `surchargeToday`, each in its PREMIUM year (`irmaaYr`, two years after the MAGI year), to the Taxes tab's row (DS-1, DS-2 (a)); What Breaks
// adds Engine A's `totIrmaaToday` (DS-3 (a)); the Anthropic request names claude-opus-4-8 with output_config.effort "medium" and no thinking
// field, reads text from blocks whose type is "text", and says so when the model refuses (AI-1, AI-4); the timeout is 180 s (AI-3).
//
// WHAT IT CANNOT SEE. No live model is called: the fetch below records and answers. Whether Opus 4.8 at medium effort answers well, how long
// it takes, and what it costs are not measured here (scope §0.6: computed, not measured).
//
// D-65 (a known limitation, filed at this build): Engine C — like Engine A — starts at the retirement year, so the first two PREMIUM years
// after retirement (set by working-year income) carry no surcharge in any engine. §A pins it on every household, both legs.
//
// GATED PER LEG (OPERATIONS §B2). The v6.30 leg pins each defect as a dated [KNOWN DEFECT 2026-10-24, D-51] / [..., AI-6]. Module facts and
// the DOM run in this process (the module first, Math.random seeded before either loads — t83's trap); the claude.ai route runs in a child
// process (`--claude`: without a `location` the bundle takes the claude.ai branch, decided once at load — t36's, t66's and t89's trap).
// Controls: qa/tools/controls_v631_mc_irmaa_ai.py (repo-only). Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(94); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v631";
const CLAUDE = process.argv.includes("--claude");
const KNOWN_VERSIONS = ["v630", "v631", "v632", "v633", "v634"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v631", "v632", "v633", "v634"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-24, D-51 — flips at v6.31]";
const KA = "[KNOWN DEFECT 2026-10-24, AI-6 — flips at v6.31]";
// Typed here from Anthropic's pricing page (platform.claude.com, read 2026-10-24), NOT read from the app: Claude Opus 4.8, $ per million tokens.
const PRICE_IN = 5, PRICE_OUT = 25;
const REFUSAL = "The model declined to answer this question. Rephrasing it as a question about your plan's figures may help.";   // AI-4 (a), Steve's wording
if (!CLAUDE) { dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location; }   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t94 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const require = createRequire(import.meta.url);

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const topDecl = name => AST.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const litVal = n => n && n.type === "Literal" ? n.value : n && n.type === "TemplateLiteral" && !n.expressions.length ? n.quasis[0].value.cooked : undefined;
const constVal = n => n && n.type === "Identifier" ? litVal((topDecl(n.name) || {}).init) : litVal(n);
const STRINGS = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement" || n.type === "JSXText")
  .map(x => (x.n.type === "TemplateElement" ? x.n.value.cooked : x.n.value).replace(/\s+/g, " "));   // JSX text wraps across lines
const anyStr = s => STRINGS.some(t => t.includes(s.replace(/\s+/g, " ")));
const BASE_GROWTH = (() => { const m = SRC.match(/const BASE_GROWTH = ([0-9.]+);/); return m ? +m[1] : NaN; })();

if (CLAUDE) {
  // ════ the claude.ai route, in its own process ════════════════════════════════════════════════════════════════════════════════════
  const calls = [];
  const rec = async (input, init) => { const url = typeof input === "string" ? input : input && input.url; let body = null; try { body = JSON.parse((init && init.body) || "null"); } catch (e) {}
    calls.push({ url, body, headers: (init && init.headers) || {} }); const json = { content: [{ type: "text", text: "OK." }], stop_reason: "end_turn" };
    return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => json, text: async () => JSON.stringify(json) }; };
  window.fetch = rec; globalThis.fetch = rec;
  const D = await domHarness(calls);
  await D.seed(); await D.click([...D.body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await D.flush();
  await D.go("ask AI"); await D.waitFor(() => !!D.pre(), 120000);
  const c = await D.ask("How does my plan look?");
  const b = c && c.body;
  console.log("CLAUDE_RESULT " + JSON.stringify({ url: c && c.url, key: !!(c && c.headers && c.headers["x-api-key"]), model: b && b.model, effort: b && b.output_config && b.output_config.effort,
    thinking: !!(b && "thinking" in b), maxTokens: b && b.max_tokens }));
  finished = true; process.exit(0);
}

console.log(`t94 — THE MONTE CARLO PAYS IRMAA; ASK AI ASKS CLAUDE OPUS 4.8 AT MEDIUM EFFORT (${VER})\n`);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines;
const BASE = clone(g.PORTFOLIO()), EX = clone(g.EXPENSES());
const load = P => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(EX) }); return g.PLAN_TIMELINE(); };
const preset = k => g.applyScenarioProbs(g.PROB_PRESETS()[k].probs);
// t93's New York ×3 household: every balance tripled, New York. It has a surcharge in its horizon year (2053) and premium years dated after it.
const NY3 = (() => { const p = clone(BASE); p.positions.forEach(q => { for (const f of ["balance", "trad", "roth"]) if (typeof q[f] === "number") q[f] *= 3; });
  (p.otherAccounts || []).forEach(a => a.balance *= 3); p.total401k *= 3; p.household *= 3; p.stateCode = "NY"; p.stateName = "New York"; return p; })();
const SINGLE = { ...clone(BASE), single: true };
const HH = [["the example, $70K, BASE", BASE, 70000, "base"], ["the example, $250K, BASE", BASE, 250000, "base"], ["the example made single, $70K, BASE", SINGLE, 70000, "base"],
  ["New York ×3, $70K, BASE", NY3, 70000, "base"], ["the example, $0, BULL", BASE, 0, "bull"]];
// The independent expectation: Engine B's rows and Engine C's rows, read here and combined here — never the schedule's own parts.
const facts = (P, roth, pre) => {
  const tl = load(P); preset(pre); const R = tl.targetRetireYear;
  const ser = g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre });
  const A = { retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, gainByYr: ser.gainByYr, ordDrawByYr: ser.ordDrawByYr };
  const B = E.computeTaxPlan(A).rows, C = E.computeIrmaaPlan(A);
  const S = g.mcIncomeTaxSchedule(R, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: pre });
  const tax = {}; for (const r of B) tax[r.yr] = r.totalTaxToday;
  const irm = {}; for (const r of C.rows) if (r.surchargeToday > 0 && r.irmaaYr in tax) irm[r.irmaaYr] = (irm[r.irmaaYr] || 0) + r.surchargeToday;
  const before = C.rows.filter(r => r.surchargeToday > 0 && r.irmaaYr < R).length, after = C.rows.filter(r => r.surchargeToday > 0 && r.irmaaYr > B[B.length - 1].yr);
  return { R, tl, tax, irm, S, C, before, after, lastYr: B[B.length - 1].yr };
};
const same = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a));

// ── §A · the schedule's parts, exactly ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the schedule is the Taxes tab's row plus Engine C's surcharge in its premium year");
const F = HH.map(([lab, P, roth, pre]) => ({ lab, ...facts(P, roth, pre) }));
for (const f of F) {
  const ys = Object.keys(f.tax).map(Number), irmYs = Object.keys(f.irm).map(Number);
  T(`A-0 SETUP ${f.lab}: Engine C starts at retirement (${f.R}) — so its first premium year is ${f.R + 2} (D-65, a known limitation)`, f.C.rows[0].yr === f.R && f.C.rows[0].irmaaYr === f.R + 2, `${f.C.rows[0].yr}`);
  if (POST) {
    T(`A-1 ${f.lab}: taxByYr is Engine B's totalTaxToday, row for row, exactly`, !!f.S.taxByYr && ys.length === Object.keys(f.S.taxByYr).length && ys.every(y => f.S.taxByYr[y] === f.tax[y]));
    T(`A-2 ${f.lab}: irmaaByYr is Engine C's surchargeToday moved to its premium year, exactly (${irmYs.length} premium years)`,
      !!f.S.irmaaByYr && irmYs.length === Object.keys(f.S.irmaaByYr).length && irmYs.every(y => f.S.irmaaByYr[y] === f.irm[y]), JSON.stringify(f.S.irmaaByYr));
    T(`A-3 ${f.lab}: each year's total is the two parts' sum, and the schedule has exactly the Taxes tab's years`,
      ys.length === Object.keys(f.S.byYr).length && ys.every(y => f.S.byYr[y] === f.tax[y] + (f.irm[y] || 0)) && f.S.firstYr === ys[0] && f.S.lastYr === f.lastYr);
    T(`A-4 ${f.lab}: no premium year before retirement, none after the horizon (${f.after.length} surcharge row(s) dated after ${f.lastYr} left out), none in ${f.R}–${f.R + 1} (D-65)`,
      irmYs.every(y => y >= f.R + 2 && y <= f.lastYr) && Object.keys(f.S.irmaaByYr).every(y => +y >= f.R + 2 && +y <= f.lastYr) && f.before === 0);
    T(`A-5 ${f.lab}: the tail is the last year's total — tax plus that year's surcharge ($${(f.irm[f.lastYr] || 0).toFixed(2)})`,
      f.S.last === f.tax[f.lastYr] + (f.irm[f.lastYr] || 0) && g.mcTaxForYear(f.S, f.lastYr + 5) === f.S.last);
  } else {
    const hasIrm = irmYs.length > 0;
    T(`A-1 ${f.lab}: the schedule is Engine B's totalTaxToday alone${hasIrm ? ` ${KD} — the ${irmYs.length} surcharge year(s) are not in it` : ""}`,
      ys.every(y => f.S.byYr[y] === f.tax[y]) && f.S.taxByYr === undefined && f.S.irmaaByYr === undefined);
  }
}
const ny = F[3], ex250 = F[1], sgl = F[2];
T("A-6 SETUP: the New York ×3 household has a surcharge in its horizon year (2053) and premium years after it — the tail control's household",
  (ny.irm[2053] || 0) > 0 && ny.after.length >= 1, `${ny.irm[2053]} / ${ny.after.length}`);
T("A-7 SETUP: the example at $250K, the single example and New York ×3 have surcharges in the schedule's years; the example at $70K and at $0 have none",
  Object.keys(ex250.irm).length > 0 && Object.keys(sgl.irm).length > 0 && Object.keys(ny.irm).length > 0 && !Object.keys(F[0].irm).length && !Object.keys(F[4].irm).length);
if (POST) {
  T("A-8 the example's $250K schedule: $5,760 in 2031–2033 (tier 2 × 2 people) and $2,300 in 2034–2036 (tier 1 × 2), the 2026 table in today's dollars",
    [2031, 2032, 2033].every(y => same(ex250.S.irmaaByYr[y], 2880 * 2)) && [2034, 2035, 2036].every(y => same(ex250.S.irmaaByYr[y], 1150 * 2)) && Object.keys(ex250.S.irmaaByYr).length === 6,
    JSON.stringify(ex250.S.irmaaByYr));
}

// ── §B · the paths pay it ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// t83's quarter oracle, from dates (no app formula): quarter 0 contains the as-of date; in quarter 0 only the months from the as-of month count.
const oQ = (asOf, q) => { const aq = Math.floor((asOf.month - 1) / 3), cq = q + aq, yr = asOf.year + Math.floor(cq / 4), firstM = (cq % 4) * 3 + 1;
  const fromM = q === 0 ? asOf.month : firstM; return { yr, firstM, fromM, fq: (firstM + 3 - fromM) / 3 }; };
const oRetireQ = (asOf, RY) => (RY - asOf.year) * 4 - Math.floor((asOf.month - 1) / 3);
const oInfl = (asOf, n, ei) => { const a = []; let x = 1; for (let q = 0; q < n; q++) { x *= 1 + ei / 4 * oQ(asOf, q).fq; a.push(x); } return a; };
const oYr = (byYr, yr) => { const ys = Object.keys(byYr).map(Number); if (yr in byYr) return byYr[yr]; return ys.length && yr > Math.max(...ys) ? byYr[Math.max(...ys)] : 0; };
const compounded = (asOf, n, charge) => { const d = [0]; let x = 0; for (let q = 0; q < n; q++) { x = (x + charge(q)) * (1 + BASE_GROWTH / 4 * oQ(asOf, q).fq); d.push(x); } return d; };
const maxRel = (a, b, want) => { let m = 0, at = -1; for (let i = 0; i < want.length; i++) { const e = Math.abs((a[i] - b[i]) - want[i]) / Math.max(1, Math.abs(want[i])); if (e > m) { m = e; at = i; } } return { m, at }; };
console.log("  B — the planned paths move by the compounded surcharges, exactly");
if (POST) {
  for (const f of [ex250, ny]) {
    const P = f === ex250 ? BASE : NY3, roth = 70000 + (f === ex250 ? 180000 : 0);
    const t = load(P); preset("base"); const RY = t.targetRetireYear, rq = oRetireQ(t.asOf, RY), ei = g.expectedInflation();
    const S = g.mcIncomeTaxSchedule(RY, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" }), ST = g.mcTaxScheduleOf(S.taxByYr);
    const irmFull = {}; for (const y of Object.keys(S.byYr)) irmFull[y] = S.irmaaByYr[y] || 0;
    const run30 = sch => g.runExtendedMC(RY, 30, 1, { taxSchedule: sch, rng: mulberry(1) }).plannedPath;
    const run6 = sch => { _src = mulberry(1); return g.runMonteCarlo(RY, 2, { taxSchedule: sch }).plannedPath; };
    for (const [lab, run, n] of [["runMonteCarlo (6 years)", run6, g.RETIRE_OPTIONS()[RY].totalQuarters], ["runExtendedMC (30 years)", run30, 120]]) {
      const a = run(ST), b = run(S), inf = oInfl(t.asOf, n, ei);
      const want = compounded(t.asOf, n, q => (q >= rq ? oYr(irmFull, oQ(t.asOf, q).yr) / 4 * inf[q] * oQ(t.asOf, q).fq : 0));
      const { m, at } = maxRel(a, b, want);
      T(`B-1 ${f.lab}, ${lab}: with and without the surcharges the planned paths differ at every quarter by the compounded surcharge series (1e-6), and neither floors`,
        a.length === n + 1 && !a.some(v => v <= 0) && !b.some(v => v <= 0) && m < 1e-6 && (f === ny && n < 100 ? true : want[n] > 0), `max rel ${m} at ${at}`);
      const q0 = rq + 8;   // 1 January of the second year after retirement: the first premium year Engine C can charge (D-65)
      T(`B-2 ${f.lab}, ${lab}: nothing is charged before ${RY + 2} — the paths agree through quarter ${q0}`, a.slice(0, Math.min(q0, n) + 1).every((v, i) => v === b[i]));
    }
    if (f === ex250) {
      // HAND PIN, exact decimal arithmetic at the build (python Decimal, 40 digits), independent of the engine: 2031 is the first premium year;
      // its surcharge is the 2026 tier-2 combined Part B + D figure, $2,880 a person (IRMAA_CONSTS.SUR[2]), × 2 people = $5,760 in today's
      // dollars. A quarter is $1,440, grown by BASE's 2.74% a year — 1.00685 a quarter — over the twenty quarters to 2031 Q1, and by
      // 1 + 4.5% / 4 = 1.01125 over the quarter:  1,440 × 1.00685^20 × 1.01125 = 1,669.23128…;  Q2: (1,669.23128… + 1,440 × 1.00685^21) × 1.01125 = 3,368.67565….
      const a = run6(ST), b = run6(S);
      T("B-3 SETUP: the 2026 tier-2 surcharge is $2,880 a person and BASE's expected inflation 2.74% (the hand pin's inputs)", g.IRMAA_CONSTS().SUR[2] === 2880 && Math.abs(ei - 0.0274) < 1e-12, `${g.IRMAA_CONSTS().SUR[2]} / ${ei}`);
      T("B-4 HAND PIN: after 2031 Q1 the planned path is $1,669.23 lower — $5,760 / 4 × 1.00685^20 × 1.01125", Math.abs((a[rq + 9] - b[rq + 9]) - 1669.23) < 0.005, (a[rq + 9] - b[rq + 9]).toFixed(4));
      T("B-5 HAND PIN: after 2031 Q2, $3,368.68 lower — ($1,669.23 + $5,760 / 4 × 1.00685^21) × 1.01125", Math.abs((a[rq + 10] - b[rq + 10]) - 3368.68) < 0.005, (a[rq + 10] - b[rq + 10]).toFixed(4));
    }
  }
} else {
  const t = load(BASE); preset("base"); const RY = t.targetRetireYear;
  const S = g.mcIncomeTaxSchedule(RY, { rothAmount: 250000, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "base" });
  _src = mulberry(1); const a = g.runMonteCarlo(RY, 2, { taxSchedule: S }).plannedPath;
  _src = mulberry(1); const b = g.runMonteCarlo(RY, 2, { taxSchedule: g.mcTaxScheduleOf(Object.fromEntries(Object.entries(ex250.tax))) }).plannedPath;
  T(`B-1 ${KD}: at $250K the planned path is the same as with the income tax alone — the surcharges are paid by no path`, a.every((v, i) => v === b[i]));
}

// ── §C · the extinction invariant ────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — with the surcharge table at zero the schedule is the income tax alone; restored, it differs exactly where surcharges fall");
{
  const SUR = g.IRMAA_CONSTS().SUR, saved = SUR.slice();
  for (let i = 0; i < SUR.length; i++) SUR[i] = 0;
  const Z = HH.map(([lab, P, roth, pre]) => ({ lab, ...facts(P, roth, pre) }));
  for (let i = 0; i < saved.length; i++) SUR[i] = saved[i];
  T("C-0 SETUP: the table is restored (the seam leaves nothing behind)", SUR.every((v, i) => v === saved[i]) && SUR[1] === 1150);
  for (let k = 0; k < HH.length; k++) {
    const z = Z[k], f = F[k], ys = Object.keys(f.tax).map(Number);
    T(`C-1 ${z.lab}: with no surcharge the schedule is the Taxes tab's tax alone, to the cent — v6.30's schedule`, ys.every(y => z.S.byYr[y] === z.tax[y]) && Object.keys(z.irm).length === 0);
    const moved = ys.filter(y => f.S.byYr[y] !== z.S.byYr[y]);
    if (POST) T(`C-2 ${f.lab}: restored, the schedule differs in exactly the premium years that carry a surcharge (${Object.keys(f.irm).length})`,
      moved.length === Object.keys(f.irm).length && moved.every(y => (f.irm[y] || 0) > 0 && same(f.S.byYr[y] - z.S.byYr[y], f.irm[y])), `${moved.join(",")} vs ${Object.keys(f.irm).join(",")}`);
    else T(`C-2 ${f.lab}: the schedule does not move with the surcharge table${Object.keys(f.irm).length ? ` ${KD}` : ""}`, moved.length === 0);
  }
}

// ── §D · What Breaks (the module half): Engine A's IRMAA beside Engine C's ─────────────────────────────────────────────────────────────
console.log("  D — What Breaks adds Engine A's IRMAA; Engine A beside Engine C");
const engineA = (roth, pre) => { const tl = g.PLAN_TIMELINE(), P = g.PORTFOLIO(); const R = tl.targetRetireYear;
  const hz = Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);   // What Breaks' own horizon (L12406 shape)
  const pT = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: R, horizonYr: hz, ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month || 1, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month || 1,
    pen: g.getPension(), penOwner: g.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: P.stateCode || null, ...g.retireStartBalances(R),
    ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    taxableInit: g.taxableInitAll(), taxYieldPct: 2.0, currentConv: roth,
    ordDrawByYr: g.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: pre }).ordDrawByYr };
  const c = g.runRothStrategies(pT).find(r => r.key === "current"); return { planYears: hz - R + 1, tax: c.totTaxToday, irmaa: c.totIrmaaToday }; };
const AvsC = HH.map(([lab, P, roth, pre], k) => { load(P); preset(pre); const a = engineA(roth, pre); const f = F[k];
  const cIn = Object.values(f.irm).reduce((s, v) => s + v, 0); return { lab, a: a.irmaa, cAll: f.C.totalIrmaaToday, cIn }; });
for (const r of [AvsC[0], AvsC[1]])
  T(`D-1 ${r.lab}: Engine A's lifetime IRMAA in today's dollars equals Engine C's ($${r.a.toFixed(2)})`, Math.abs(r.a - r.cAll) < 0.005 && Math.abs(r.cAll - r.cIn) < 0.005, `${r.a} / ${r.cAll} / ${r.cIn}`);
// DISCLOSED (CHANGELOG v6.31, METHODOLOGY, scope §7): on the other three households the two engines project different incomes, so What Breaks
// (Engine A's IRMAA) and the Monte Carlo (Engine C's, inside the horizon) carry different surcharges — on the example at $0 under BULL, Engine
// A charges a surcharge Engine C never reaches. Pinned to the dollar so a change in either engine is seen; MEASURED at the build (engine output),
// not hand-derived — the claim pinned is the disagreement, which DS-3 (a) accepted by reading What Breaks from Engine A.
const DISC = [[2, 10930, 12080, 12080], [3, 50270, 41580, 32340], [4, 8050, 0, 0]];
for (const [k, a, cAll, cIn] of DISC) { const r = AvsC[k];
  console.log(`     ${r.lab}: Engine A $${r.a.toFixed(2)} · Engine C $${r.cAll.toFixed(2)} in all, $${r.cIn.toFixed(2)} inside the horizon`);
  T(`D-2 DISCLOSED ${r.lab}: Engine A's lifetime IRMAA ($${a.toLocaleString()}) is not Engine C's ($${cIn.toLocaleString()} inside the horizon, $${cAll.toLocaleString()} in all) — measured`,
    Math.abs(r.a - a) < 0.5 && Math.abs(r.cAll - cAll) < 0.5 && Math.abs(r.cIn - cIn) < 0.5, `${r.a} / ${r.cAll} / ${r.cIn}`); }
load(BASE); preset("base");

// ── §E · the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the source, by AST");
{
  const fn = topFn("mcIncomeTaxSchedule");
  const callsTo = name => fn ? all(fn.body, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name).length : -1;
  const nums = fn ? all(fn.body, n => n.type === "Literal" && typeof n.value === "number").map(x => x.n.value) : [];
  if (POST) T("E-1 mcIncomeTaxSchedule calls Engine C once and Engine B once, and types no figure (its only number literal is 0)", callsTo("computeIrmaaPlan") === 1 && callsTo("computeTaxPlan") === 1 && nums.every(v => v === 0), `${callsTo("computeIrmaaPlan")} / ${nums}`);
  else T(`E-1 ${KD}: mcIncomeTaxSchedule never calls Engine C`, callsTo("computeIrmaaPlan") === 0 && callsTo("computeTaxPlan") === 1);
  // the Anthropic request: the object whose `system` property carries the prompt
  const reqs = all(AST, n => n.type === "ObjectExpression" && n.properties.some(p => p.key && p.key.name === "system") && n.properties.some(p => p.key && p.key.name === "model"));
  const req = reqs.length === 1 ? reqs[0].n : null;
  const prop = k => req && req.properties.find(p => p.key && (p.key.name === k || p.key.value === k));
  const modelLits = STRINGS.filter(s => /^claude-[a-z]+-\d/.test(s));
  T("E-2 SETUP: exactly one request object carries both `model` and `system` (the Anthropic route)", !!req, String(reqs.length));
  if (POST) {
    const oc = prop("output_config"), eff = oc && oc.value.type === "ObjectExpression" && oc.value.properties.find(p => p.key && p.key.name === "effort");
    T("E-3 the Anthropic request names claude-opus-4-8 (one constant, AI_MODEL)", !!prop("model") && constVal(prop("model").value) === "claude-opus-4-8", constVal(prop("model") && prop("model").value));
    T("E-4 …sets output_config.effort to \"medium\" (Opus 4.8's default is high, so it must be sent)", !!eff && constVal(eff.value) === "medium");
    T("E-5 …and sends no thinking, temperature, top_p or top_k (Opus 4.8 rejects the sampling three; thinking is off unless asked for)", ["thinking", "temperature", "top_p", "top_k"].every(k => !prop(k)));
    T("E-6 one Anthropic model id in the whole source", modelLits.length === 1 && modelLits[0] === "claude-opus-4-8", modelLits.join(","));
    T("E-7 the limit stays 4,096 tokens and the timeout is 180 seconds, one constant each (AI-3)", constVal({ type: "Identifier", name: "AI_MAX_TOKENS" }) === 4096 && constVal({ type: "Identifier", name: "AI_TIMEOUT_MS" }) === 180000);
    T("E-8 the refusal notice is Steve's wording, one constant", constVal({ type: "Identifier", name: "AI_REFUSAL_NOTICE" }) === REFUSAL);
  } else {
    T(`E-3 ${KA}: the Anthropic request names claude-sonnet-4-6, with no effort`, litVal(prop("model") && prop("model").value) === "claude-sonnet-4-6" && !prop("output_config"));
    T(`E-7 ${KA}: the timeout is 120 seconds`, constVal({ type: "Identifier", name: "AI_TIMEOUT_MS" }) === 120000);
  }
  // no prefill: the request's messages end with the user's turn
  const msgs = prop("messages"), lastMsg = msgs && msgs.value.type === "ArrayExpression" ? msgs.value.elements[msgs.value.elements.length - 1] : null;
  T("E-9 no prefill: the request's messages end with the user's turn (Opus 4.8 rejects an assistant prefill)", !!lastMsg && lastMsg.type === "ObjectExpression"
    && lastMsg.properties.some(p => p.key && p.key.name === "role" && p.value.value === "user"));
  const mt = all(AST, n => n.type === "Property" && n.key && n.key.name === "max_tokens").map(x => x.n.value);
  T(`E-10 every max_tokens reads AI_MAX_TOKENS (${mt.length} sites, both routes)`, mt.length === 2 && mt.every(v => v.type === "Identifier" && v.name === "AI_MAX_TOKENS"));
}

// ── the DOM harness (t89's) ────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function domHarness(calls) {
  const PREFIX = "dc:";
  window.confirm = () => true;
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  const grab = b => "blob:t94"; window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const txt = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root = null, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
  const seed = async (portfolio, expenses, extra) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
    if (expenses !== undefined) put("expenses", expenses); if (extra) extra(); await render(); };
  const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(400); } return false; };
  const pre = () => { const d = [...body().querySelectorAll("details")].find(x => /EXACTLY WHAT/.test(x.textContent || "")); const p = d && d.querySelector("pre"); return p && /LIVE PORTFOLIO CONTEXT/.test(p.textContent || "") ? p.textContent : null; };
  const ask = async (q) => {
    const before = calls.length;
    for (let i = 0; i < 20 && calls.length === before; i++) {
      const ta = el.querySelector("textarea.ai-in");
      if (ta && ta.value !== q) { try { await act(async () => {
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(ta, q);
        ta.dispatchEvent(new window.Event("input", { bubbles: true })); }); } catch (e) {} }
      await flush(60);
      const b = [...el.querySelectorAll("button.ai-btn")].find(x => !/attach/i.test(x.textContent || "") && !/clear/i.test(x.textContent || ""));
      if (b && !b.disabled) await click(b);
      await flush(400);
    }
    await flush(300);
    return calls.length > before ? calls[calls.length - 1] : null;
  };
  return { DG, body, txt, btn, go, seed, flush, click, waitFor, pre, ask, unmount, el: () => el, act: () => act };
}

// ── §F · the request, through a recording fetch ──────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the request and the replies (recording fetch; no live model)");
const calls = [];
let REPLY = "ok";
const reply = url => {
  if (/chat\/completions/.test(url || "")) return { choices: [{ message: { content: "OK." }, finish_reason: "stop" }] };
  switch (REPLY) {
    case "thinking": return { content: [{ type: "thinking", thinking: "T94-SECRET-THOUGHT", signature: "sig" }, { type: "text", text: "T94-VISIBLE-ANSWER" }], stop_reason: "end_turn" };
    case "cut": return { content: [{ type: "text", text: "T94-CUT-ANSWER" }], stop_reason: "max_tokens" };
    case "refusal-empty": return { content: [], stop_reason: "refusal", stop_details: { type: "refusal" } };
    case "refusal-text": return { content: [{ type: "text", text: "T94-PARTIAL-REFUSAL-TEXT" }], stop_reason: "refusal", stop_details: { type: "refusal" } };
    default: return { content: [{ type: "text", text: "OK." }], stop_reason: "end_turn" };
  }
};
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  let body = null; try { body = JSON.parse((init && init.body) || "null"); } catch (e) {}
  calls.push({ url, body, headers: (init && init.headers) || {} });
  if (REPLY === "abort") { const e = new Error("The operation was aborted."); e.name = "AbortError"; throw e; }
  const json = reply(url);
  return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => json, text: async () => JSON.stringify(json) };
};
window.fetch = recorder; globalThis.fetch = recorder;
const D = await domHarness(calls);
const DG = D.DG;
const KEY = () => window.localStorage.setItem("dc:danger_close:api_key_v1", "sk-ant-T94-00000000");
const LOCAL = () => window.localStorage.setItem("dc:danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "t94-local" }));
const EXPL = [{ category: "Living", label: "Household", amount: 6000, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const thread = () => [...D.el().querySelectorAll("div")].filter(d => /^(▸ YOU|⚠ SYSTEM|◉ AI)$/.test((d.firstElementChild && d.firstElementChild.textContent || "").trim())).map(d => d.textContent);
{
  await D.seed(clone(BASE), EXPL, KEY); await D.go("ask AI"); await D.waitFor(() => !!D.pre(), 120000);
  REPLY = "ok"; const c1 = await D.ask("T94 first question");
  const b = c1 && c1.body;
  T("F-0 SETUP: the self-hosted route with a key sent the question to api.anthropic.com with the key", !!c1 && /api\.anthropic\.com/.test(c1.url) && !!c1.headers["x-api-key"], c1 && c1.url);
  if (POST) T("F-1 the self-hosted request: model claude-opus-4-8, output_config.effort \"medium\", max_tokens 4,096, no thinking field",
    !!b && b.model === "claude-opus-4-8" && b.output_config && b.output_config.effort === "medium" && b.max_tokens === 4096 && !("thinking" in b), JSON.stringify(b && { m: b.model, o: b.output_config, t: b.max_tokens }));
  else T(`F-1 ${KA}: the self-hosted request names claude-sonnet-4-6 and no effort`, !!b && b.model === "claude-sonnet-4-6" && !("output_config" in b));
  REPLY = "thinking"; await D.ask("T94 thinking"); let th = thread().join("\n");
  T("F-2 a reply with a thinking block (non-empty thinking text) shows only the text block", th.includes("T94-VISIBLE-ANSWER") && !th.includes("T94-SECRET-THOUGHT"));
  REPLY = "cut"; await D.ask("T94 cut"); const cutN = D.el().querySelectorAll("[data-dc-ai-cutoff]").length;
  T("F-3 stop_reason \"max_tokens\" with text shows the answer and the cut-off notice", cutN === 1 && thread().join("\n").includes("T94-CUT-ANSWER"), String(cutN));
  REPLY = "refusal-empty"; await D.ask("T94 refuse empty"); th = thread().join("\n");
  if (POST) T("F-4 stop_reason \"refusal\" with no text shows the refusal notice — not \"No response received\"", th.includes(REFUSAL) && !/No response received/.test(th), th.slice(-300));
  else T(`F-4 ${KA}: a refusal with no text reads as "No response received"`, /No response received/.test(th) && !th.includes(REFUSAL));
  REPLY = "refusal-text"; await D.ask("T94 refuse with text"); th = thread().join("\n");
  const refN = D.el().querySelectorAll("[data-dc-ai-refusal]").length;
  if (POST) T("F-5 a refusal that carries text shows the text and the notice", th.includes("T94-PARTIAL-REFUSAL-TEXT") && refN === 1, String(refN));
  else T(`F-5 ${KA}: a refusal with text shows the text with no notice`, th.includes("T94-PARTIAL-REFUSAL-TEXT") && refN === 0);
  REPLY = "ok"; const c2 = await D.ask("T94 after the refusals");
  const hist = (c2 && c2.body && c2.body.messages) || [];
  const hs = JSON.stringify(hist);
  // Anthropic's refusal guidance: the turn that triggered a refusal must be removed or rephrased, or the model keeps refusing — so a declined
  // exchange (the question and any text) is left out of the memory, and so is the notice; answers that were not refused stay in it.
  if (POST) T("F-6 the next request's history leaves out both declined exchanges (questions, text and notice) and keeps the answered ones (the thinking reply, the cut answer)",
    hist.length > 0 && !hs.includes(REFUSAL) && !hs.includes("declined to answer") && !hs.includes("T94-PARTIAL-REFUSAL-TEXT") && !hs.includes("T94 refuse empty") && !hs.includes("T94 refuse with text")
    && hist.some(m => m.role === "assistant" && m.content === "T94-CUT-ANSWER") && hist.some(m => m.role === "assistant" && m.content === "T94-VISIBLE-ANSWER")
    && hist.some(m => m.role === "user" && m.content === "T94 cut") && !hs.includes("length limit"), hs.slice(0, 300));
  else T(`F-6 ${KA}: the next request's history re-sends the refused questions and the refused text`, hs.includes("T94 refuse with text") && hs.includes("T94-PARTIAL-REFUSAL-TEXT"), hs.slice(0, 300));
  REPLY = "abort"; await D.ask("T94 abort"); th = thread().join("\n");
  T(`F-7 a timed-out request says ${POST ? 180 : 120} seconds — the constant, through the message`, th.includes(`REQUEST TIMED OUT (${POST ? 180 : 120}s)`), th.slice(-200));
  REPLY = "ok";
  // the Local Model: its own model name, the same limit, no effort
  await D.seed(clone(BASE), EXPL, LOCAL); await D.go("ask AI"); await D.waitFor(() => !!D.pre(), 120000);
  const c3 = await D.ask("T94 local"); const lb = c3 && c3.body;
  T("F-8 the Local Model request asks its own model, for 4,096 tokens, and sends no effort or thinking", !!lb && /chat\/completions/.test(c3.url) && lb.model === "t94-local" && lb.max_tokens === 4096
    && !("output_config" in lb) && !("thinking" in lb), JSON.stringify(lb && { m: lb.model, t: lb.max_tokens }));
}
// the claude.ai route, in its own process
{ const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--claude"], { cwd: HERE, encoding: "utf8", timeout: 600000 });
  const line = (r.stdout || "").split("\n").find(l => l.startsWith("CLAUDE_RESULT "));
  let R = null; try { R = JSON.parse(line.slice(14)); } catch (e) {}
  T("F-9 SETUP: the claude.ai route (no key, no location) sent the question to api.anthropic.com, with no key", !!R && /api\.anthropic\.com/.test(R.url || "") && !R.key, line || (r.stderr || "").slice(0, 200));
  if (POST) T("F-10 the claude.ai route: model claude-opus-4-8, effort \"medium\", 4,096 tokens, no thinking — the same request as self-hosted (AI-1 (a))",
    !!R && R.model === "claude-opus-4-8" && R.effort === "medium" && R.maxTokens === 4096 && !R.thinking, JSON.stringify(R));
  else T(`F-10 ${KA}: the claude.ai route names claude-sonnet-4-6`, !!R && R.model === "claude-sonnet-4-6" && !R.effort, JSON.stringify(R));
}

// ── §D (rendered) · What Breaks, the Income card and the Monte Carlo tab on the single example (a household with surcharges) ────────────
console.log("  D/G — rendered: What Breaks, the Income card, the Monte Carlo tab");
{
  await D.seed({ ...clone(BASE), single: true }, clone(EX));   // the module's example and ITS expenses (§F left its own table loaded)
  const RY = DG.PLAN_TIMELINE().targetRetireYear;
  await D.go("what breaks"); for (let k = 0; k < 40 && !/estimated taxes/.test(D.txt()); k++) await D.flush(250);
  const wb = D.txt();
  const shown = (wb.match(/estimated taxes \(~\$(\d+)K\/yr average/) || [])[1];
  // Engine A, in this window, on the inputs What Breaks passes (t93 §W's builder; the DOM opens on BULL-LEANING)
  const gA = window.__g; const tlA = gA.PLAN_TIMELINE(), PA = gA.PORTFOLIO(); const hzA = Math.max(tlA.dobA.year + tlA.lifeExpA, tlA.dobB.year + tlA.lifeExpB), pyA = hzA - RY + 1;
  const pT = { single: !!tlA.single, asOfYr: tlA.asOfYear, retireYr: RY, horizonYr: hzA, ladderEnd: tlA.rothLadderEnd, dobAYr: tlA.dobA.year, dobBYr: tlA.dobB.year,
    deathYr1: tlA.single ? Infinity : Math.min(tlA.dobA.year + tlA.lifeExpA, tlA.dobB.year + tlA.lifeExpB),
    ssA: gA.getSSA(), ssB: tlA.single ? 0 : gA.getSSB(), ssAYr: tlA.ssA_date.year, ssAMo: tlA.ssA_date.month || 1, ssBYr: tlA.ssB_date.year, ssBMo: tlA.ssB_date.month || 1,
    pen: gA.getPension(), penOwner: gA.getPensionOwner(), stateRate: tlA.stateTaxRate || 0, stateCode: PA.stateCode || null, ...gA.retireStartBalances(RY),
    ladderEndA: tlA.rothLadderEndA, ladderEndB: tlA.rothLadderEndB, survivor: tlA.single ? "A" : ((tlA.dobA.year + tlA.lifeExpA) >= (tlA.dobB.year + tlA.lifeExpB) ? "A" : "B"),
    taxableInit: gA.taxableInitAll(), taxYieldPct: 2.0, currentConv: 70000,
    ordDrawByYr: gA.withdrawalPlanSeries({ retireYear: RY, rothAmount: 70000, scenarioPreset: "bull" }).ordDrawByYr };
  const cA = gA.runRothStrategies(pT).find(r => r.key === "current");
  const kWith = Math.round((cA.totTaxToday + cA.totIrmaaToday) / pyA / 1000), kWithout = Math.round(cA.totTaxToday / pyA / 1000);
  T(`D-3 SETUP: the single example's What Breaks estimate renders, and with and without Engine A's IRMAA ($${Math.round(cA.totIrmaaToday).toLocaleString()}) it reads differently ($${kWith}K vs $${kWithout}K)`,
    shown !== undefined && kWith !== kWithout, `${shown} / ${kWith} / ${kWithout}`);
  if (POST) T(`D-4 What Breaks' estimate is (Engine A's totTaxToday + totIrmaaToday) ÷ the plan's years: ~$${kWith}K/yr`, +shown === kWith, `shown ${shown}`);
  if (POST) T("D-5 What Breaks says its IRMAA is the Roth tab's engine's, which can differ from the IRMAA tab's (D-66, disclosed in-app)",
    /that engine projects its own income, so on some plans its IRMAA differs from the IRMAA tab's\)/.test(wb));
  else T(`D-4 ${KD}: What Breaks' estimate leaves out Engine A's IRMAA (~$${kWithout}K/yr)`, +shown === kWithout, `shown ${shown}`);
  // the Income card (DS-4 (a))
  await D.go("income");
  const card = () => D.body().querySelector("[data-dc-mc-tax-card]"), icard = () => D.body().querySelector("[data-dc-mc-irmaa-card]");
  const ready = await D.waitFor(() => card() && /^\$[\d,]+\/yr$/.test(card().textContent.trim()), 180000);
  const sch = DG.mcIncomeTaxSchedule(RY, { rothAmount: 70000, qcdAnnual: 0, taxYield: 2, scenarioPreset: "bull" });
  T("G-0 SETUP: the Income tab's tax card fills in (the 6-year runs finished)", ready, card() && card().textContent);
  if (POST) {
    const iy = Object.keys(sch.irmaaByYr).map(Number).sort((a, b) => a - b);
    const want = `plus IRMAA from ${iy[0]}: $${Math.round(sch.irmaaByYr[iy[0]]).toLocaleString()} in its first year (today's dollars), ${iy.length} year${iy.length === 1 ? "" : "s"} within the plan — the IRMAA tab's surcharges, charged when Medicare bills them`;
    T(`G-1 the Income card keeps the first year's income tax ($${Math.round(sch.taxByYr[RY]).toLocaleString()}) and adds the IRMAA line: "${want.slice(0, 70)}…"`,
      !!card() && card().textContent.trim() === `$${Math.round(sch.taxByYr[RY]).toLocaleString()}/yr` && !!icard() && icard().textContent === want && iy[0] === RY + 2, icard() && icard().textContent);
  } else T(`G-1 ${KD}: the Income card has no IRMAA line`, !!card() && !icard());
  const mc = (await D.go("monte carlo"), D.body().querySelector("[data-dc-mc-tax]"));
  if (POST) T("G-2 the Monte Carlo tab says every run pays the IRMAA tab's surcharges when Medicare bills them, and that the first two years' premiums are not charged",
    !!mc && /and the IRMAA tab's Medicare surcharges in the years Medicare bills them \(the first two years' premiums, which working-year income sets, are not charged\)/.test(mc.textContent.replace(/\s+/g, " "))
    && /before v6\.31 it charged no IRMAA\./.test(mc.textContent), mc && mc.textContent.slice(0, 300));
  else T(`G-2 ${KD}: the Monte Carlo tab's tax sentence names no IRMAA`, !!mc && !/IRMAA/.test(mc.textContent));
  await D.go("irmaa"); const ir = D.txt();
  if (POST) T("G-3 the IRMAA tab says the first two years carry no surcharge here, in the Monte Carlo or in What Breaks, and reads low for them — the false \"err high\" sentence is gone (D-65)",
    /so those two years carry no surcharge here, in the Monte Carlo or in What Breaks — if your working income was above a tier, the model reads low for them\./.test(ir)
    && !/so these years err high/.test(ir) && /Form SSA-44/.test(ir));
  else T(`G-3 ${KD}: the IRMAA tab says the first years err high`, /The model charges every surcharge in full, so these years err high\./.test(ir));
  await D.unmount();
}

// ── §G · copy: the replaced sentences, by AST over every string; the cost arithmetic from typed prices; METHODOLOGY ─────────────────────
console.log("  G — copy");
{
  const OLD = [
    "Not in it: IRMAA (a Medicare premium, on its own tab)", "the Monte Carlo tab covers market sequence, though not IRMAA", "recurring long-term care, IRMAA surcharges, income streams",
    "as does the income tax each Monte Carlo path is charged", "these first years are priced off your working income", "so these years err high",
    "At the Claude Sonnet 4.6 prices", "about one to five cents", "a fraction of a cent per question", "REQUEST TIMED OUT (120s)", "a bit over half a word", "adds about six cents",
    "one hundred to several hundred questions", "An answer can run to about 3,000 words", "so each turn costs slightly more", "claude-sonnet-4-6",
    "and they also charge long-term care and the Taxes tab's income tax, which this backtest omits",
  ];
  const left = OLD.filter(anyStr);
  if (POST) T(`G-4 EXTINCTION (AST, every string literal, template element and JSX text): none of the ${OLD.length} replaced phrases survives`, left.length === 0, left.join(" | "));
  else T(`G-4 ${KD}/${KA}: the v6.30 leg carries every one of the ${OLD.length} phrases v6.31 replaces`, left.length === OLD.length, OLD.filter(s => !anyStr(s)).join(" | "));
  const DOCS = String(g.DOCS_HTML());
  if (POST) {
    // the cost note's figures, from the typed prices and the note's own token counts
    const c = (inTok, outTok) => (inTok * PRICE_IN + outTok * PRICE_OUT) / 1e6 * 100;   // cents
    const lo = c(900, 1000), hi = c(7000, 2500), fLo = c(900, 4096), fHi = c(7000, 4096);
    T(`G-5 the cost note's first question, from the typed prices: ${lo.toFixed(2)}¢ to ${hi.toFixed(2)}¢ — "about 3 to 10 cents"`, Math.round(lo) === 3 && Math.round(hi) === 10 && DOCS.includes("a first question costs <strong>about 3 to 10 cents</strong> when the answer runs 1,000 to 2,500 tokens"));
    T(`G-6 …a full-length answer, ${fLo.toFixed(2)}¢ to ${fHi.toFixed(2)}¢ — "about 11 to 14 cents"`, Math.round(fLo) === 11 && Math.round(fHi) === 14 && DOCS.includes("and about 11 to 14 cents when it runs to the full 4,096"));
    T(`G-7 …$5 of credit: ${Math.floor(500 / hi)} to ${Math.floor(500 / lo)} first questions — "roughly fifty to one hundred seventy"`, Math.floor(500 / hi) === 51 && Math.floor(500 / lo) === 169
      && DOCS.includes("$5 of credit covers roughly fifty to one hundred seventy first questions, fewer in long conversations"));
    T("G-8 …the prices and the model are named, and the conversation's growth is stated", DOCS.includes("At the Claude Opus 4.8 prices Anthropic listed in October 2026 ($5 per million input tokens, $25 per million output tokens)")
      && DOCS.includes("Later questions cost more, because the last 12 messages — your six earlier questions and the six answers — ride along"));
    const grow = 6 * 4096 * PRICE_IN / 1e6 * 100;   // six full-length answers re-sent as input, cents
    T(`G-13 …the conversation's growth: six full-length answers re-sent at the input price, ${grow.toFixed(2)}¢ — "about 12 cents a question at most"`,
      Math.round(grow) === 12 && DOCS.includes("six full-length answers re-sent as input add about 12 cents a question at most") && !DOCS.includes("15 to 25 cents"));
    T("G-14 the Field Manual says a declined question is left out of the memory, and that an IRMAA expense row would be charged twice",
      DOCS.includes("that question and any answer to it are left out of the conversation memory, so a rephrased question starts clean")
      && DOCS.includes("the same is true of an expense row for the IRMAA part of your Medicare premiums"));
    T("G-9 the troubleshooting row says (180s) and the glossary's Token entry gives the new rate", DOCS.includes("<code>REQUEST TIMED OUT (180s)</code>") && DOCS.includes("about 3 to 10 cents at the October 2026 rates the Ask AI cost note gives"));
    T("G-10 Field Manual, Monte Carlo entry: IRMAA paid in the year Medicare bills it, and the first two years' premiums not charged anywhere (D-65)",
      DOCS.includes("From v6.31 each run also pays the IRMAA tab’s Medicare surcharges (IRMAA), each in the year Medicare bills it")
      && DOCS.includes("so they are not charged here, on the IRMAA tab or in What Breaks; if your working income was above a tier, the model reads low for those two years"));
    T("G-11 Field Manual, What Breaks entry and §13: IRMAA in the estimate; the v6.31 entry names both changes",
      DOCS.includes("including Roth-conversion taxes and, from v6.31, IRMAA surcharges") && DOCS.includes("The Monte Carlo and What Breaks pay IRMAA; Ask AI asks Claude Opus 4.8 (v6.31)."));
    const MP = join(HERE, "..", "METHODOLOGY.md"), MD = existsSync(MP) ? readFileSync(MP, "utf8") : "";
    T("G-12 METHODOLOGY has the section \"The Monte Carlo pays IRMAA (v6.31)\", naming D-65", /^## The Monte Carlo pays IRMAA \(v6\.31\)$/m.test(MD) && /D-65/.test((MD.split(/^## The Monte Carlo pays IRMAA \(v6\.31\)$/m)[1] || "").split(/^## /m)[0]), MP);
  } else console.log("  G-5..G-12 — skipped by design on the v6.30 leg (the new copy does not exist; G-4 pins the old)");
}

finished = true;
console.log(`\nt94 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
