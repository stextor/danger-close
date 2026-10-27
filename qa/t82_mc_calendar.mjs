// t82 — THE MONTE CARLO'S QUARTER CALENDAR (v6.19 — D-46)
// Run: node t82_mc_calendar.mjs v619   |   node t82_mc_calendar.mjs v618
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_D46_MC_CALENDAR_V619.md). Through v6.18 both Monte Carlo engines labelled quarter q with the
// date `asOfYear + ⌊(q+1)/4⌋`, month `((q+1) % 4)·3 + 3` — "June of the as-of year" for quarter 0, whatever the as-of month — and read the
// expense table, the ladder's end, the trust-fund year and the streams by that label. runMonteCarlo placed retirement and the claims at
// round(months from the as-of month / 3); runExtendedMC at quarters from JANUARY of the as-of year, ignoring the as-of month. The three
// agreed for every event only with an as-of date in May (in April — the example's month — while no event fell in a quarter's last month).
// The example's shape hid it; no check in the suite varied the as-of date. From v6.19 one calendar (mcQuarterOf / mcQuarterDate):
// quarter 0 is the calendar quarter containing the as-of date, an event falls in the quarter containing its date, the first quarter
// counts only the months from the as-of month (DC-2), a claim pays from its month (DC-3), the stress set's forced years are calendar
// years (DC-4), a plan saved after it retired gets no home-move cash (DC-8), and the year 2026 is no longer typed into the machinery.
//
// GATED PER LEG (OPERATIONS §B2). The v6.18 leg pins the old behaviour as dated [KNOWN DEFECT] checks where it is observable from outside
// (the as-of month ignored, the steps in the retirement balance, the claim month rounded, the cash for a plan already retired). §A's
// ORACLE is written here from dates, not from the app's formula. §C, §D, §H and §J need both legs' modules (the current leg only; printed
// skip otherwise); §D and §J build ORACLE MODULES from the v6.18 source — the t80 §A builder — so "the 30-year engine moved by its four
// event quarters and nothing else" is proved bit for bit, not argued.
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(82); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v619";
const KNOWN_VERSIONS = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633"].includes(VER);   // an array, so the next registration widens it
// The differential's pair — constants, NOT `VER === "v619"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v618", D_CUR = "v619";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = M.__g, E = M.__engines;
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
const AST = JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t82 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-18, D-46 — flips at v6.19]";
console.log(`t82 — THE MONTE CARLO'S QUARTER CALENDAR (${VER})\n`);

const BASE = clone(g.PORTFOLIO()), EX = clone(g.EXPENSES());
const load = (P, X = EX) => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return g.PLAN_TIMELINE(); };
const TL0 = load(BASE);
const RY0 = TL0.targetRetireYear;
const ymd = o => `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day || 1).padStart(2, "0")}`;
const sh = (d, n) => String(d).replace(/^(\d{4})/, y => String(+y + n));
const shifted = n => {
  const p = clone(BASE);
  p.dobA = ymd({ ...TL0.dobA, year: TL0.dobA.year + n }); p.dobB = ymd({ ...TL0.dobB, year: TL0.dobB.year + n });
  p.retireYear = TL0.targetRetireYear + n; p.retireYearB = TL0.targetRetireYearB + n; p.lifeExpA = TL0.lifeExpA; p.lifeExpB = TL0.lifeExpB;
  return { p, ex: EX.map(e => ({ ...e, start: sh(e.start, n), end: String(e.end).startsWith("2070") ? e.end : sh(e.end, n) })) };
};
const withAsOf = (P, asOf) => ({ ...clone(P), asOf });
const BASE_GROWTH = (() => { const m = SRC.match(/const BASE_GROWTH = ([0-9.]+);/); return m ? +m[1] : NaN; })();

// ── the independent calendar oracle (from dates; no app formula) ──────────────────────────────────────────────────────────────────────
const cqOf = (y, m) => y * 4 + Math.floor((m - 1) / 3);                         // absolute calendar-quarter number of a month
const oQuarterOf = (asOf, ev) => cqOf(ev.year, ev.month) - cqOf(asOf.year, asOf.month);
const oDate = (asOf, q) => { const cq = cqOf(asOf.year, asOf.month) + q; return { calYear: Math.floor(cq / 4), calMonth: String((cq % 4) * 3 + 3).padStart(2, "0"), yearStart: cq % 4 === 0 }; };
const oMonths = (asOf, q) => { const cq = cqOf(asOf.year, asOf.month) + q, y = Math.floor(cq / 4), m0 = (cq % 4) * 3 + 1;
  const all = [0, 1, 2].map(k => y * 12 + (m0 + k - 1)); return q === 0 ? all.filter(a => a >= asOf.year * 12 + (asOf.month - 1)) : all; };
const oFrac = (asOf, q) => oMonths(asOf, q).length / 3;
const oShare = (asOf, q, ev) => { const ms = oMonths(asOf, q), e = ev.year * 12 + (ev.month - 1); return ms.length ? ms.filter(a => a >= e).length / ms.length : 0; };

// ── §A · the calendar against the oracle ──────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the calendar against an independent oracle");
if (POST) {
  for (const year of [2026, 2027]) for (let m = 1; m <= 12; m++) {
    let bad = [];
    for (const day of [1, 28]) {
      const tl = { asOf: { year, month: m } };
      for (let q = 0; q < 12; q++) {
        const a = g.mcQuarterDate(tl, q), o = oDate(tl.asOf, q);
        if (a.calYear !== o.calYear || a.calMonth !== o.calMonth || a.yearStart !== o.yearStart) bad.push(`label q${q}`);
        if (Math.abs(g.mcQuarterFrac(tl, q) - oFrac(tl.asOf, q)) > 1e-15) bad.push(`frac q${q}`);
      }
      for (let em = 1; em <= 12; em++) for (const ey of [year, year + 2]) {
        const ev = { year: ey, month: em };
        if (g.mcQuarterOf(tl, ev) !== oQuarterOf(tl.asOf, ev)) bad.push(`event ${ey}-${em}`);
        const q = oQuarterOf(tl.asOf, ev);
        for (const qq of [q - 1, q, q + 1]) if (qq >= 0 && Math.abs(g.mcPaidShare(tl, qq, ev) - oShare(tl.asOf, qq, ev)) > 1e-15) bad.push(`share q${qq} ${ey}-${em}`);
      }
      void day;
    }
    T(`A-1 as of ${year}-${String(m).padStart(2, "0")}: every quarter's label, first-quarter share, event quarter (24 event months) and claim share match the oracle`, bad.length === 0, bad.slice(0, 4).join("; "));
  }
  // through the app: RETIRE_OPTIONS and PLAN_TIMELINE take their quarters from the calendar, for an as-of date in every month
  let badApp = [];
  for (let m = 1; m <= 12; m++) {
    const asOf = `2026-${String(m).padStart(2, "0")}-15`, tl = load(withAsOf(BASE, asOf)), RO = g.RETIRE_OPTIONS();
    for (const y of Object.keys(RO).map(Number)) {
      if (RO[y].retireQuarter !== oQuarterOf(tl.asOf, { year: y, month: 1 })) badApp.push(`${asOf} retire ${y}`);
      if (RO[y].spouseRetireQuarter !== oQuarterOf(tl.asOf, { year: tl.targetRetireYearB, month: 1 })) badApp.push(`${asOf} spouse B ${y}`);
    }
    if (tl.ssAQuarter !== oQuarterOf(tl.asOf, tl.ssA_date) || tl.ssBQuarter !== oQuarterOf(tl.asOf, tl.ssB_date)) badApp.push(`${asOf} claims`);
  }
  load(BASE);
  T("A-2 RETIRE_OPTIONS (all three retirement years, and spouse B's retirement) and the timeline's claim quarters equal the oracle for an as-of date in each month of 2026", badApp.length === 0, badApp.slice(0, 4).join("; "));
  T("A-3 the example: quarter 0 is April–June 2026 (labelled June), retirement January 2029 is quarter 11, spouse A's January 2031 claim quarter 19",
    g.mcQuarterDate(TL0, 0).calMonth === "06" && g.mcQuarterDate(TL0, 0).calYear === 2026 && g.mcQuarterOf(TL0, { year: 2029, month: 1 }) === 11 && g.mcQuarterOf(TL0, TL0.ssA_date) === 19);
} else T("A-0 the v6.18 leg has no calendar function (the checks above are the v6.19 leg's)", typeof g.mcQuarterOf === "undefined");

// ── §B · one rule, everywhere (AST) ──────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — one rule, everywhere (AST)");
const funcs = []; walk.full(AST, n => { if (/Function/.test(n.type)) funcs.push({ s: n.start, e: n.end, name: n.id ? n.id.name : "<anon>" }); }, W);
const fnNode = name => { let f = null; walk.full(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) f = n; }, W); return f; };
const within = (node, pred) => { let k = 0; if (!node) return -1; walk.full(node, n => { if (pred(n)) k++; }, W); return k; };
const isCall = name => n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name;
const srcOf = n => SRC.slice(n.start, n.end);
const labelFormula = n => n.type === "BinaryExpression" && (n.operator === "%" || n.operator === "/") && n.right.type === "Literal" && n.right.value === 4 && /^\(?\s*[qi]\s*\+\s*1\s*\)?$/.test(srcOf(n.left).trim())   // acorn's range excludes the parentheses;
const lit2026 = []; walk.full(AST, n => { if (n.type === "Literal" && n.value === 2026) lit2026.push(n); }, W);
const enclName = pos => (funcs.filter(f => f.s <= pos && pos < f.e).sort((a, b) => (a.e - a.s) - (b.e - b.s))[0] || {}).name || "<module>";
const mcMachinery2026 = lit2026.filter(n => !["<module>", "buildVerificationChecks", "_asOfToYM"].includes(enclName(n.start)));
if (POST) {
  T("B-1 no `(q + 1) % 4` / `(q + 1) / 4` (or `i`) date formula remains anywhere in the source", within(AST, labelFormula) === 0, String(within(AST, labelFormula)));
  T("B-2 no literal 2026 outside the tax-and-rule tables, the verification checks and _asOfToYM's fallback (v6.18 had five in the Monte Carlo machinery)",
    mcMachinery2026.length === 0, mcMachinery2026.map(n => `L${n.loc.start.line} ${enclName(n.start)}`).join(", "));
  for (const f of ["runMonteCarlo", "runExtendedMC"]) {
    const n = fnNode(f);
    T(`B-3 ${f} dates its quarters with mcQuarterDate, scales the first with mcQuarterFrac and pays each claim through mcPaidShare`,
      within(n, isCall("mcQuarterDate")) >= 2 && within(n, isCall("mcQuarterFrac")) >= 2 && within(n, isCall("mcPaidShare")) >= 4);
  }
  T("B-4 runExtendedMC, buildRetireOptions and buildPlanTimeline place events with mcQuarterOf",
    ["runExtendedMC", "buildRetireOptions", "buildPlanTimeline"].every(f => within(fnNode(f), isCall("mcQuarterOf")) >= 2));
  const gone = ["_ymToQuarterFromAsOf", "_ymToCalQuarter", "retireQ_cal", "ssAQuarter_cal", "medicareAQuarter", "medicareBQuarter"];
  const left = gone.filter(nm => within(AST, n => n.type === "Identifier" && n.name === nm) > 0);
  T("B-5 the two old quarter rules and the five unread timeline fields are gone", left.length === 0 && within(fnNode("buildPlanTimeline"), n => n.type === "Identifier" && n.name === "retireQ") === 0, left.join(", "));
  // every first-quarter-scalable flow is multiplied by the quarter's share (the inflation step and the return included)
  const ext = fnNode("runExtendedMC"), mc = fnNode("runMonteCarlo");
  const scaled = (node, re) => within(node, n => n.type === "AssignmentExpression" && re.test(srcOf(n)) && /_fq/.test(srcOf(n)));
  T("B-6 both engines scale the quarter's inflation step and return by its share (planned and simulated paths)",
    scaled(mc, /Infl\s*\*=|inflationCum\s*\*=/) === 2 && scaled(ext, /Infl\s*\*=|inflationCum\s*\*=/) === 2 && scaled(mc, /(planned|portfolio)\s*\*=/) === 2 && scaled(ext, /(_planned|portfolio)\s*\*=/) === 2);
} else {
  T(`B-1 ${KD} the label formula is written out at four engine sites, the chart axis and the Guardrails table`, within(AST, labelFormula) >= 10, String(within(AST, labelFormula)));
  T(`B-2 ${KD} the literal 2026 sits in the Monte Carlo machinery (six literals on five lines)`, mcMachinery2026.length === 6 && new Set(mcMachinery2026.map(n => n.loc.start.line)).size === 5, mcMachinery2026.map(n => `L${n.loc.start.line}`).join(","));
}

// ── §P · what the v6.18 leg pins, and the v6.19 leg must reverse ─────────────────────────────────────────────────────────────────────
console.log("  P — observable from outside on both legs");
{
  const ext = (P, X = EX, seed = 11) => { const t = load(P, X); return JSON.stringify(g.runExtendedMC(t.targetRetireYear, 30, 60, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(seed) }).results); };
  const outs = ["2026-01-15", "2026-04-18", "2026-07-15", "2026-10-18"].map(a => ext(withAsOf(BASE, a)));
  const allSame = outs.every(o => o === outs[0]);
  if (POST) T("P-1 the 30-year engine now depends on the as-of month: January, April, July and October 2026 give four different results", new Set(outs).size === 4);
  else T(`P-1 ${KD} the 30-year engine ignores the as-of month: January, April, July and October 2026 give byte-identical results`, allSame);
  load(BASE);
}

// ── §C · the example's 6-year run does not move ─────────────────────────────────────────────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
const pairHere = VER === D_CUR && existsSync(PRI);
const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
const HH = [["example", { p: clone(BASE), ex: clone(EX) }]];
for (const n of Object.keys(fx.HOUSEHOLDS)) { load(BASE); HH.push([`fixture:${n}`, { p: fx.build(g, n), ex: clone(EX) }]); }
HH.push(["shifted +3", shifted(3)]);
{ const p = clone(BASE); p.single = true; HH.push(["single", { p, ex: clone(EX) }]); }
load(BASE);
const firstMonth = m => m % 3 === 1;
const april = tl => tl.asOf.month === 4;
let G0 = null;
if (pairHere) {
  G0 = (await import(pathToFileURL(PRI).href)).__g;
  console.log(`  C — ${D_PRIOR} → ${D_CUR}: the 6-year run on April households with no event in a quarter's last month`);
  const loadOn = (G, P, X) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); return G.PLAN_TIMELINE(); };
  const mcOf = (G, P, X) => { const t = loadOn(G, P, X); _src = mulberry(2026); return JSON.stringify(G.runMonteCarlo(t.targetRetireYear, 120)); };
  let n = 0;
  for (const [name, { p, ex }] of HH) {
    const t = load(p, ex);
    // only where v6.18 and v6.19 must agree: an April as-of date and every event in a quarter's FIRST month (v6.18's round misplaces
    // last-month events, and pays a middle-month claim the whole quarter where v6.19 pays two months)
    const evMonths = [t.ssA_date.month, t.ssB_date.month, 1];
    if (!april(t) || !evMonths.every(firstMonth)) continue;
    n++;
    T(`C-1 ${name}: runMonteCarlo (every path and the planned path) is bit-identical across the pair`, mcOf(G0, p, ex) === mcOf(g, p, ex));
  }
  T("C-0 SETUP: at least the example and four other households qualified", n >= 5, String(n));
  // the converse, so C-1 discriminates: a March claim moves it (v6.18 rounded it to the next quarter)
  const pm = clone(BASE); pm.dobA = ymd({ ...TL0.dobA, month: 3 });
  T("C-2 CONTROL: with spouse A's claim moved to March, runMonteCarlo is NOT identical (v6.18 rounded the claim a quarter late)", mcOf(G0, pm, EX) !== mcOf(g, pm, EX));
  load(BASE);
} else console.log(`  C — skipped (needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg)`);

// ── §D · the 30-year engine moves by its four event quarters and nothing else (oracle modules from the v6.18 source) ──────────────────────
const oracleOf = (() => {
  const src0 = join(HERE, "..", `${D_PRIOR}.jsx`), shim = join(HERE, "shim.txt");
  if (!pairHere || !existsSync(src0) || !existsSync(shim)) return null;
  const base = readFileSync(src0, "utf8");
  const SWAPS = [
    ["  const retireQ = (retireYear - _tl.asOfYear) * 4;", "  const retireQ = (retireYear - _tl.asOfYear) * 4 - 1;"],
    ["  const spouseASSquarter = Math.floor(((_tl.ssA_date.year - _tl.asOfYear) * 12 + (_tl.ssA_date.month - 1)) / 3);", "  const spouseASSquarter = Math.floor(((_tl.ssA_date.year - _tl.asOfYear) * 12 + (_tl.ssA_date.month - 1)) / 3) - 1;"],
    ["  const spouseBSSquarter = Math.floor(((_tl.ssB_date.year - _tl.asOfYear) * 12 + (_tl.ssB_date.month - 1)) / 3);", "  const spouseBSSquarter = Math.floor(((_tl.ssB_date.year - _tl.asOfYear) * 12 + (_tl.ssB_date.month - 1)) / 3) - 1;"],
    ["  const spouseRetireQ = ((_tl.targetRetireYearB || retireYear) - _tl.asOfYear) * 4;", "  const spouseRetireQ = ((_tl.targetRetireYearB || retireYear) - _tl.asOfYear) * 4 - 1;"],
  ];
  if (SWAPS.some(([a]) => base.split(a).length !== 2)) return null;
  const cache = {};
  return async (year) => {   // `year`: the 2026 in the current-age line is replaced by it (§J); 2026 leaves it as it was
    if (cache[year]) return cache[year];
    const tag = `_t82_oracle_${year}`;
    let body = base; for (const [a, b] of SWAPS) body = body.replace(a, b);
    body = body.replace("const _curAgeA = 2026 - _tl.dobA.year, _curAgeB = 2026 - _tl.dobB.year;", `const _curAgeA = ${year} - _tl.dobA.year, _curAgeB = ${year} - _tl.dobB.year;`);
    body = body.replace("export default function DangerClose()", "function DangerClose()");
    writeFileSync(join(HERE, `${tag}.jsx`), body + readFileSync(shim, "utf8"));
    try {
      execFileSync("npx", ["esbuild", `${tag}.jsx`, "--loader:.jsx=jsx", "--jsx=automatic", "--format=esm", `--outfile=${tag}.mjs`, "--log-level=warning"], { cwd: HERE });
      return (cache[year] = (await import(pathToFileURL(join(HERE, `${tag}.mjs`)).href)).__g);
    } finally { for (const f of [`${tag}.jsx`, `${tag}.mjs`]) { try { unlinkSync(join(HERE, f)); } catch (e) {} } }
  };
})();
const extRuns = (G, P, X) => {
  G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); const RY = G.PLAN_TIMELINE().targetRetireYear;
  const r = (yrs, o, s) => G.runExtendedMC(RY, yrs, 40, { ...o, rng: mulberry(s) });
  return {
    runB: JSON.stringify(r(10, { ltcShocks: false, autoReplace: false, mortality: false }, 1).results),
    runC: JSON.stringify(r(30, { ltcShocks: true, autoReplace: true, mortality: true }, 2).results),
    longevity: JSON.stringify(r(30, { ltcShocks: true, autoReplace: true, mortality: true, stochasticMortality: true }, 3).results),
    sustainedLTC: JSON.stringify(r(35, { sustainedLTC: true, autoReplace: true, mortality: true }, 4).results),
    mortgage: JSON.stringify(r(30, { ltcShocks: true, autoReplace: true, mortality: true, futureHomeMortgage: 80000 }, 5).results),
  };
};
if (pairHere) {
  console.log("  D — the 30-year engine against the v6.18 source with its four event quarters one earlier");
  const O = oracleOf ? await oracleOf(2026) : null;
  T("D-0 SETUP: the oracle module builds (the v6.18 source and shim.txt are beside this run, and each swapped line occurs once)", !!O);
  if (O) {
    for (const [name, { p, ex }] of HH) {
      const t = load(p, ex); if (!april(t) || ![t.ssA_date.month, t.ssB_date.month].every(firstMonth)) continue;   // the oracle pays a claim quarter in full
      const a = extRuns(O, p, ex), b = extRuns(g, p, ex);
      const bad = Object.keys(a).filter(k => a[k] !== b[k]);
      T(`D-1 ${name}: runs B and C, stochastic longevity, sustained LTC and the mortgage what-if are bit-identical to the oracle`, bad.length === 0, bad.join(", "));
    }
    // the oracle discriminates: v6.18 itself differs
    const a = extRuns(G0, BASE, EX), b = extRuns(g, BASE, EX);
    T("D-2 CONTROL: v6.18's own 30-year engine differs from v6.19 on the example (run C)", a.runC !== b.runC);
  }
  load(BASE);
} else console.log(`  D — skipped (needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg)`);

// ── §E · the stress set's forced years ───────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the stress set's forced years are calendar years");
if (POST) {
  const t = load(BASE), RY = t.targetRetireYear, off = RY - t.asOfYear, rq = g.mcQuarterOf(t, { year: RY, month: 1 });
  const forced = [], free = [];
  g.runExtendedMC(RY, 15, 3, { forcedScenarioYears: { [off]: "crisis" }, ltcShocks: false, autoReplace: false, mortality: false, rng: mulberry(5), regimeTrace: forced });
  g.runExtendedMC(RY, 15, 3, { ltcShocks: false, autoReplace: false, mortality: false, rng: mulberry(5), regimeTrace: free });
  const inYear = forced.map((_, q) => oDate(t.asOf, q).calYear === RY);
  T("E-1 SETUP: the regime trace covers every quarter of the 15-year run", forced.length === 60 && free.length === 60, `${forced.length}/${free.length}`);
  const yearQs = inYear.map((v, q) => (v ? q : -1)).filter(q => q >= 0);
  T("E-2 the forced crisis covers exactly the four quarters of the retirement year, starting in the retirement quarter (11 on the example)",
    yearQs.join() === [rq, rq + 1, rq + 2, rq + 3].join() && yearQs.every(q => forced[q] === "crisis") && rq === 11, `${yearQs.join()} / ${yearQs.map(q => forced[q]).join()}`);
  T("E-3 outside the forced year the regimes are the unforced run's, quarter for quarter (the same random numbers are drawn)", forced.every((s, q) => inYear[q] || s === free[q]));
  T("E-4 runStressTests keys its forced years by retirement year − as-of year (a calendar year)", /const retireOffset = retireYear - PLAN_TIMELINE\.asOfYear;/.test(SRC));
} else T("E-0 the v6.18 leg has no regime trace (forced years were keyed by ⌊q / 4⌋ and began at quarter 4 × year)", !/regimeTrace/.test(SRC));

// ── §F · the first quarter (DC-2) ───────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the first quarter counts only the months from the as-of month");
const oOnce = (X, d) => X.reduce((s, e) => s + (e.freq === "once" && String(e.start).slice(0, 7) === d ? +e.amount : 0), 0);
if (POST) {
  const BON = clone(BASE); BON.contributions = { ...BON.contributions, annualBonus: 20000, bonusDeferralPct: 10, bonusMatchPct: 5 };
  for (const [P, asOf, f, tag] of [[BASE, "2026-04-15", 1, "first month"], [BASE, "2026-05-15", 2 / 3, "second month"], [BASE, "2026-06-15", 1 / 3, "third month"],
                                    [BON, "2027-02-10", 2 / 3, "second month of a January–March quarter, with a bonus"]]) {
    const t = load(withAsOf(P, asOf)), RY = t.targetRetireYear;
    _src = mulberry(1); const pp = g.runMonteCarlo(RY, 2).plannedPath;
    const c = P.contributions, C3 = (c.monthly401k + c.hsaMonthly) * 3 + (c.spouseBMonthly || 0) * 3;
    const bonus = (c.annualBonus || 0) * (((c.bonusDeferralPct || 0) + (c.bonusMatchPct || 0)) / 100);
    const b0 = oDate(t.asOf, 0).yearStart ? bonus : 0, b1 = oDate(t.asOf, 1).yearStart ? bonus : 0;
    const p0 = g.PORTFOLIO().household;
    const want1 = (p0 + (C3 + b0) * f - oOnce(EX, `${oDate(t.asOf, 0).calYear}-${oDate(t.asOf, 0).calMonth}`)) * (1 + BASE_GROWTH / 4 * f);
    const want2 = (want1 + C3 + b1 - oOnce(EX, `${oDate(t.asOf, 1).calYear}-${oDate(t.asOf, 1).calMonth}`)) * (1 + BASE_GROWTH / 4);
    T(`F-1 as of ${asOf} (${tag}): the planned path's first two quarters equal the oracle — contributions${b0 ? ", the bonus" : ""} and growth × ${f.toFixed(3)} in the first`,
      Math.abs(pp[1] - want1) < 1e-6 * want1 && Math.abs(pp[2] - want2) < 1e-6 * want2, `${pp[1]} vs ${want1}; ${pp[2]} vs ${want2}`);
  }
  load(BASE);
} else T("F-0 the v6.18 leg counts every first quarter in full (no share)", !/mcQuarterFrac/.test(SRC));

// ── §G · a claim in the middle of a quarter (DC-3) ──────────────────────────────────────────────────────────────────────────────────
console.log("  G — a claim pays from its own month");
{
  // spouse B claims at 63 in the month of her birth: January 2029 on the example (retirement quarter, retired). February and March move
  // the claim inside that quarter. The planned path's difference one quarter later is the benefit not paid, grown one quarter.
  // v6.20 (D-40): the Monte Carlo pays the Taxes tab's tax, and moving spouse B's claim month moves Engine B's Social Security and so the
  // schedule — so "the difference is the benefit not paid" holds only with the tax schedule HELD FIXED (here: none). Through v6.19 there
  // was no schedule to hold. Measured at the v6.20 build without it: G-1 1,419.41 against 1,426.85 (the tax on one month's benefit).
  const _fixTax = g.mcIncomeTaxSchedule ? { taxSchedule: {} } : undefined;
  const ppOf = mon => { const p = clone(BASE); p.dobB = ymd({ ...TL0.dobB, month: mon }); const t = load(p); _src = mulberry(1); return { pp: g.runMonteCarlo(t.targetRetireYear, 2, _fixTax).plannedPath, t }; };
  const j = ppOf(1), fe = ppOf(2), mr = ppOf(3);
  const rq = j.t.ssBQuarter;   // the January claim's quarter (the retirement quarter, 11)
  const infl = Math.pow(1 + g.expectedInflation() / 4, rq + 1);   // plannedInfl after quarter rq (every quarter full: April as-of)
  const miss = k => g.getSSB() * infl * g.ssDepletionFactor(2029) * 3 * k * (1 + BASE_GROWTH / 4);
  const dF = j.pp[rq + 1] - fe.pp[rq + 1], dM = j.pp[rq + 1] - mr.pp[rq + 1];
  T("G-0 SETUP: the example's spouse B claims January 2029, in the retirement quarter (11)", j.t.ssB_date.year === 2029 && j.t.ssB_date.month === 1 && rq === 11, JSON.stringify(j.t.ssB_date));
  if (POST) {
    T("G-1 a February claim pays two of the quarter's three months: the planned path is one month's benefit lower, exactly", Math.abs(dF - miss(1 / 3)) < 1e-6 * miss(1), `${dF} vs ${miss(1 / 3)}`);
    T("G-2 a March claim pays one month: two months' benefit lower, exactly", Math.abs(dM - miss(2 / 3)) < 1e-6 * miss(1), `${dM} vs ${miss(2 / 3)}`);
  } else {
    T(`G-1 ${KD} a February claim is paid the whole quarter (round(34/3) = 11): the planned path does not move`, Math.abs(dF) < 1e-6, String(dF));
    T(`G-2 ${KD} a March claim is paid nothing that quarter (round(35/3) = 12): three months' benefit lower`, Math.abs(dM - miss(1)) < 1e-6 * miss(1), `${dM} vs ${miss(1)}`);
  }
  load(BASE);
}

// ── §H · what must not move: Engines A–D ────────────────────────────────────────────────────────────────────────────────────────────
if (pairHere) {
  console.log(`  H — ${D_PRIOR} → ${D_CUR}: Engines B, C and D do not move`);
  const E0 = (await import(pathToFileURL(PRI).href)).__engines;
  const bcd = (G, EE, P, X) => { G.applyLoadedData({ portfolio: clone(P), expenses: clone(X) }); const RY = G.PLAN_TIMELINE().targetRetireYear;
    const A = { retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, scenarioPreset: "base" };
    const S = G.withdrawalPlanSeries(A); return JSON.stringify({ D: G.computeWithdrawalPlan(A).schedule, B: EE.computeTaxPlan({ ...A, ...S }).rows, C: EE.computeIrmaaPlan({ ...A, ...S }).rows }); };
  let bad = []; for (const [name, { p, ex }] of HH) if (bcd(G0, E0, p, ex) !== bcd(g, E, p, ex)) bad.push(name);
  T(`H-1 the Withdrawal schedule, the Taxes tab's rows and the IRMAA tab's rows are bit-identical on all ${HH.length} households (Engine A: t2's fingerprints)`, bad.length === 0, bad.join(", "));
  load(BASE);
} else console.log(`  H — skipped (needs app_${D_PRIOR}.mjs beside the ${D_CUR} leg)`);

// ── §I · smooth in the as-of date (the extinction) ──────────────────────────────────────────────────────────────────────────────────
console.log("  I — the planned balance at retirement changes smoothly with the as-of date");
{
  // The example (no bonus). The as-of date moves one month at a time with the same balances, so the plan has one month less to save
  // and grow: the planned balance at 1 January 2029 must fall every month, by about one month's contributions and return — never by a
  // quarter's, never by nothing.
  const rows = [];
  for (let y = 2026; y <= 2027; y++) for (let m = 1; m <= 12; m++) {
    const t = load(withAsOf(BASE, `${y}-${String(m).padStart(2, "0")}-01`)), RO = g.RETIRE_OPTIONS ? g.RETIRE_OPTIONS() : null;
    const RY = t.targetRetireYear; _src = mulberry(1);
    const pp = g.runMonteCarlo(RY, 2).plannedPath;
    const rq = RO ? RO[RY].retireQuarter : Math.round(((RY - y) * 12 + (1 - m)) / 3);
    rows.push({ at: `${y}-${m}`, bal: pp[rq] });
  }
  const c = BASE.contributions, Cm = c.monthly401k + c.hsaMonthly + (c.spouseBMonthly || 0);
  const steps = rows.slice(1).map((r, k) => ({ at: r.at, d: rows[k].bal - r.bal, bound: (Cm + rows[k].bal * BASE_GROWTH / 12) * 1.05 }));
  const tooBig = steps.filter(s => s.d > s.bound), none = steps.filter(s => s.d <= 0);
  if (POST) T("I-1 for as-of dates on the 1st of each month, January 2026 – December 2027, the planned balance at retirement falls every month, never by more than one month's contributions and return (+5%)",
    tooBig.length === 0 && none.length === 0, [...tooBig, ...none].slice(0, 3).map(s => `${s.at}: ${Math.round(s.d)} (bound ${Math.round(s.bound)})`).join("; "));
  else T(`I-1 ${KD} the planned balance at retirement moves in steps: a quarter's worth in some months, nothing in others`, tooBig.length > 0 && none.length > 0, `${tooBig.length} big, ${none.length} flat`);
  load(BASE);
}

// ── §J · the year from the plan ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  J — the year comes from the plan");
if (POST) {
  const P27 = withAsOf(BASE, "2027-04-15"), t = load(P27), RY = t.targetRetireYear, rq = g.mcQuarterOf(t, { year: RY, month: 1 });
  const A = g.runExtendedMC(RY, RY - t.asOfYear, 20, { ltcShocks: false, autoReplace: false, mortality: false, totalQuarters: Math.max(1, rq), rng: mulberry(7) });
  T("J-1 run A on a plan as of April 2027 runs to the retirement quarter (7) and records its balance there: snapshots at the start, quarter 3 and quarter 6",
    rq === 7 && A.totalQuarters === 7 && A.results.every(r => r.length === 3), `${rq} ${A.totalQuarters} ${A.results[0].length}`);
  const ann = A.results.map(r => Math.pow(r[2] / r[0], 1 / 1.75) - 1).sort((a, b) => a - b);
  T("J-2 and annualizes its average return over 1.75 years, its real length", Math.abs(A.avgReturn.p50 - ann[Math.floor(ann.length * 0.5)]) < 1e-12);
  if (pairHere && oracleOf) {
    const O27 = await oracleOf(2027);
    const run = G => { G.applyLoadedData({ portfolio: clone(P27), expenses: clone(EX) }); return JSON.stringify(G.runExtendedMC(RY, 30, 40, { ltcShocks: true, autoReplace: true, mortality: true, stochasticMortality: true, rng: mulberry(9) }).results); };
    T("J-3 stochastic longevity on a plan as of April 2027 starts from 2027's ages: bit-identical to the oracle with 2027 in the age line", run(O27) === run(g));
  }
  load(BASE);
} else T(`J-0 ${KD} run A's length is retireYear − 2026 years`, /runExtendedMC\(retireYear, retireYear - 2026, 10000/.test(SRC));

// ── §L · retirement before the as-of quarter (DC-8) ─────────────────────────────────────────────────────────────────────────────────
console.log("  L — a plan saved after it retired gets no home-move cash");
{
  const withCash = (P, x) => ({ ...clone(P), homeMoveCash: x });
  const after = { ...clone(BASE), retireYear: 2026, retireYearB: 2026, asOf: "2026-04-18" };
  const ext = P => { load(P); return JSON.stringify(g.runExtendedMC(2026, 30, 30, { ltcShocks: true, autoReplace: true, mortality: true, rng: mulberry(4) }).results); };
  const mcPP = (P, RY) => { load(P); _src = mulberry(1); return g.runMonteCarlo(RY, 2).plannedPath; };
  if (POST) {
    T("L-1 retired January 2026, saved April 2026: the 30-year engine adds no home-move cash (the balance holds it)", ext(withCash(after, 100000)) === ext(withCash(after, 0)));
    T("L-2 …and neither does the 6-year engine", JSON.stringify(mcPP(withCash(after, 100000), 2026)) === JSON.stringify(mcPP(withCash(after, 0), 2026)));
    const inQ = { ...clone(BASE), retireYear: 2027, retireYearB: 2027, asOf: "2027-01-15" };
    const a = mcPP(withCash(inQ, 100000), 2027), b = mcPP(withCash(inQ, 0), 2027);
    T("L-3 saved in its retirement quarter (retiring 1 January 2027, saved 15 January): the cash arrives in quarter 0 — the planned path one quarter on is $100,000 × 1.01125 higher, exactly",
      Math.abs((a[1] - b[1]) - 100000 * (1 + BASE_GROWTH / 4)) < 1e-6, String(a[1] - b[1]));
  } else T(`L-1 ${KD} retired January 2026, saved April 2026: the 30-year engine adds the cash at quarter 0 again`, ext(withCash(after, 100000)) !== ext(withCash(after, 0)));
  load(BASE);
}

// ── §K · rendered ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  K — rendered: the Monte Carlo tab, Guardrails, Stress, the retirement cards");
{
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const text = () => { const c = body().cloneNode(true); c.querySelectorAll("style,script").forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
    const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
    if (ex) { await click(ex); await flush(); await flush(); } };
  const tab = async name => { await click(tabBtn(name)); await flush(150); return text(); };
  const waitFor = async (re, ms = 240000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (re.test(text())) return true; await flush(500); } return false; };
  await render();
  await tab("monte carlo");
  const ready = await waitFor(/RUN C: FULL 30-YEAR/);
  const mc = text(), calSpan = !!body().querySelector("[data-dc-mc-calendar]");
  T("K-0 SETUP: the Monte Carlo tab renders its extended runs", ready, mc.slice(0, 160));
  const guards = await tab("guardrails");
  const st = await tab("stress"); await waitFor(/30-YEAR GUARDRAIL BOUNDARIES/, 120000); const stx = text();
  if (POST) {
    T("K-1 the tab says how its calendar works, naming the as-of quarter (Q2 2026)", calSpan && /The simulation steps calendar quarters from your as-of date \(Q2 2026\); the first quarter counts only the months left in it/.test(mc), (mc.match(/The simulation steps[^;]*;/) || [""])[0]);
    T("K-2 the run headers and the summary give the spans the runs model: 2026–2036 and 2026–2056 from the as-of date",
      /RUN B: EARLY DECADE\s*2026–2036 \(10 years from your as-of date\)/.test(mc) && /RUN C: FULL 30-YEAR\s*2026–2056 from your as-of date/.test(mc) && /Early Decade \(2026–2036\), Full 30yr \(2026–2056\)/.test(mc));
    T("K-3 run A runs to the retirement quarter: \"Now → Jan 2029 (2 yr 9 mo)\" and a 2 yr 9 mo time horizon", /Now → Jan 2029 \(2 yr 9 mo\)/.test(mc) && /Time Horizon.*2 yr 9 mo/.test(mc));
    T("K-4 run C's trajectory table dates each snapshot: \"Mar 2029 ◀ RETIRE\" (the first taken in retirement)", /Mar 2029 ◀ RETIRE/.test(mc) && !/\b2029 ◀ RETIRE/.test(mc.replace(/Mar 2029 ◀ RETIRE/g, "")));
    T("K-5 the Guardrails table dates its rows with the quarter the engine checks: \"Mar 2027\", not \"2027\" beside December's spending", /Mar 2027/.test(guards) && /Mar 2029/.test(guards));
    // every other snapshot is shown, so on the example the retirement snapshot (yi 3, March 2029) is one of the hidden rows — as it was in v6.18
    T("K-6 the Stress tab's 30-year table dates its snapshots: \"Now\", then \"Mar 2028\", \"Mar 2030\" … (was 2026, 2028, 2030)", /YearLower \(80%\)PlannedUpper \(120%\)MC medianNow\$[\d.]+M/.test(stx) && /Mar 2028\$/.test(stx) && /Mar 2030\$/.test(stx));
  } else {
    T(`K-2 ${KD} the run headers say the runs start at retirement: 2029–2039 and 2029–2059`, /RUN B: EARLY DECADE\s*2029–2039/.test(mc) && /RUN C: FULL 30-YEAR\s*2029–2059/.test(mc));
    T(`K-4 ${KD} run C's table labels snapshot yi as 2026 + yi: "2029 ◀ RETIRE"`, /2029 ◀ RETIRE/.test(mc) && !/Mar 2029 ◀ RETIRE/.test(mc));
  }
  T("K-7 the retirement cards' gap before spouse A's Social Security is 24 months (January 2029 → January 2031) on both legs", /24-month gap before/.test(text()));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}

finished = true;
console.log(`\nt82 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
