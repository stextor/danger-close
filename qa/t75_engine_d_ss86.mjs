// t75 — THE WITHDRAWAL TAB'S BRACKET COLUMN TAXES SOCIAL SECURITY BY THE IRS WORKSHEET, ON THE HOUSEHOLD'S OWN RETURN (v6.12, C-5)
// Run: node t75_engine_d_ss86.mjs v612   |   node t75_engine_d_ss86.mjs v611
//
// WHY THIS EXISTS (docs/SCOPE_C5_ENGINE_D_SS86_V612.md). Engine D — `computeWithdrawalPlan`, the Withdrawal tab — figured its Bracket
// column from a flat 85% of Social Security in every year, on the 2026 JOINT table for every household (a single household, and a
// survivor after the first death, included), never indexed against its nominal income, with no age-65 deduction, capped at 32%, and with
// realized gain inside the rate's input. Measured at the scope on five households: wrong in 73 of 98 years, both directions. Engines A,
// B and C had all called the shared §86 helper since v5.77; nothing in the suite asserted Engine D's column at all.
// From v6.12: the filing status of the year (Pub. 501 — joint through the death year, Single from the next), `taxableSS86`, and the
// year's table, deduction and age-65 extra from `projectBracketsAt`; the rate read on ordinary taxable income (DC-1); no OBBBA bonus (DC-2).
//
// GATED PER LEG (OPERATIONS §B2): the v6.11 leg pins the old column as dated [KNOWN DEFECT 2026-10-14] checks; v6.12 asserts the fix.
// INDEPENDENCE (§B): the ORACLE below carries its own worksheet, its own 2026 tables (Rev. Proc. 2025-32, transcribed — not read from
// TAX_CONSTS), its own 2%/yr indexing and its own filing rule. It takes from the engine only the row's income terms and ages. Each leg
// must be reproduced by its own rule set AND must fail to be reproduced by the other's, so the fixtures exercise the change.
// Sections: A the oracle against the engine, every year, ten households · B hand-verified pins (the scope's §0.3) · C what cannot move,
// v6.11 → v6.12 · D structure, by AST · E the rendered tabs.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v612";
const KNOWN_VERSIONS = ["v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"].includes(VER);   // an array, so the next registration widens it
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
// v6.18 (D-41): Engine D reads the expense table year by year, which moved one §B hand pin (2032's taxable Social Security). PIN18 picks the v6.18 figures (measured at the build);
// the v6.18 leg is ALSO run with DC_V617_SPENDING=1 — each plan loaded with v6.17's spending as a table (qa/tools/v617_spending.mjs, split
// at that plan's own Medicare year) — where every v6.17 figure must still come out exactly: the attribution of each move to the read.
const POST_D41 = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628"].includes(VER);   // an array, so the registrar widens it
const SPEND17 = POST_D41 && process.env.DC_V617_SPENDING === "1";
const PIN18 = POST_D41 && !SPEND17;
const P41 = (v617, v618) => PIN18 ? v618 : v617;
const { v617Table } = await import(pathToFileURL(join(HERE, "tools", "v617_spending.mjs")).href);
if (SPEND17) console.log("  (DC_V617_SPENDING=1 — v6.17's spending, as a table: every v6.17 figure must come out exactly)");
const EX0 = JSON.parse(JSON.stringify(M.__g.EXPENSES()));
const { __g: g, __engines: E } = M;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const EQ = (n, got, want) => T(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const clone = o => JSON.parse(JSON.stringify(o));
const cents = x => Math.round(x * 100) / 100;
const KD = "[KNOWN DEFECT 2026-10-14, C-5 — flips at v6.12]";
console.log(`t75 — ENGINE D'S BRACKET COLUMN: §86, FILING STATUS, INDEXED (${VER})\n`);

// ── the oracle ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 26 U.S.C. §86 as the IRS Social Security Benefits Worksheet writes it (lines 4 and 6 are zero for these households).
const worksheet = (L1, L3, joint) => {
  const L2 = 0.5 * L1, L7 = L2 + L3, L8 = joint ? 32000 : 25000;
  if (!(L8 < L7)) return 0;
  const L9 = L7 - L8, L10 = joint ? 12000 : 9000;
  const L11 = Math.max(0, L9 - L10), L12 = Math.min(L9, L10), L13 = 0.5 * L12, L14 = Math.min(L2, L13);
  return Math.min(L14 + 0.85 * L11, 0.85 * L1);
};
// Rev. Proc. 2025-32, tax year 2026 (transcribed here, not read from the app). The age-65 extra is the app's own figure (scope §0.1).
const BR26 = { mfj: [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]],
               sgl: [[0.10, 12400], [0.12, 50400], [0.22, 105700], [0.24, 201775], [0.32, 256225], [0.35, 640600], [0.37, Infinity]] };
const STD26 = { mfj: 32200, sgl: 16100 }, X65 = { mfj: 1650, sgl: 2050 };
const ordOf = r => r.pen_y + r.work_y + r.rmd_y + r.tradDraw + r.othOrdDraw + r.conv_y;   // the fixtures carry no ordinary income stream (A-0)
// THE FIX (v6.12's rule set). `gainInRate` is DC-1's other option, used only to prove a fixture exercises it.
const oracleFix = (r, tl, gainInRate = false) => {
  const single = !!tl.single, d1 = single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  const survA = single || (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB);
  const fs = single || r.yr > d1;                                         // Pub. 501: joint for the death year, Single from the next
  const ss = r.ssA_y + r.ssB_y, ord = ordOf(r), key = fs ? "sgl" : "mfj", k = Math.pow(1.02, r.yr - tl.asOfYear);
  const ssT = worksheet(ss, ord + r.capGain_y, !fs);
  const n65 = fs ? ((survA ? r.ageA : r.ageB) >= 65 ? 1 : 0) : (r.ageA >= 65 ? 1 : 0) + (r.ageB >= 65 ? 1 : 0);
  const std = Math.round(STD26[key] * k) + n65 * Math.round(X65[key] * k);
  const ti = ssT + ord + (gainInRate ? r.capGain_y : 0) - std;
  const rate = ti <= 0 ? 0 : Math.round(100 * BR26[key].find(([, up]) => ti <= (up === Infinity ? Infinity : Math.round(up * k)))[0]);
  return { ssT, magi: ssT + ord + r.capGain_y, rate, fs, n65 };
};
// THE DEFECT (v6.11's rule set): flat 85%, the 2026 joint table, unindexed, MAGI with gain, capped at 32%.
const oracleOld = r => {
  const ssT = 0.85 * (r.ssA_y + r.ssB_y), magi = ssT + ordOf(r) + r.capGain_y, thr = i => STD26.mfj + BR26.mfj[i][1];
  const rate = magi < STD26.mfj ? 0 : magi < thr(0) ? 10 : magi < thr(1) ? 12 : magi < thr(2) ? 22 : magi < thr(3) ? 24 : 32;
  return { ssT, magi, rate };
};

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const BASE = clone(g.PORTFOLIO());
const consistent = p => { const t = (p.positions || []).reduce((s, r) => s + (r.balance || 0), 0), o = (p.otherAccounts || []).reduce((s, a) => s + (a.balance || 0), 0);
  const bs = { 1: 0, 2: 0, 3: 0, 4: 0 }; (p.positions || []).forEach(r => { if (r.bucket >= 1 && r.bucket <= 4) bs[r.bucket] += r.balance || 0; });
  return { ...p, total401k: t, household: t + o, bucketActuals: t > 0 ? { 1: bs[1] / t, 2: bs[2] / t, 3: bs[3] / t, 4: bs[4] / t } : p.bucketActuals }; };
const scaleAll = f => consistent({ ...BASE,
  positions: BASE.positions.map(p => ({ ...p, balance: p.balance * f, trad: (p.trad || 0) * f, roth: (p.roth || 0) * f })),
  otherAccounts: (BASE.otherAccounts || []).map(a => ({ ...a, balance: a.balance * f })) });
const H = [   // [label, portfolio, conversion slider]
  ["EXAMPLE", BASE, 0],
  ["EXAMPLE@70K (the slider's default)", BASE, 70000],
  ["EXAMPLE made single", { ...BASE, single: true }, 0],
  ["MODEST couple (×0.3)", scaleAll(0.3), 0],
  ["MODEST single (×0.3)", { ...scaleAll(0.3), single: true }, 0],
  ["LARGE single (×2)", { ...scaleAll(2), single: true }, 0],
  ["SURVIVOR A (B dies first)", { ...BASE, lifeExpA: 92, lifeExpB: 78 }, 0],
  ["SURVIVOR UNDER 65 (A dies at 65)", { ...BASE, lifeExpA: 65 }, 0],
  ["BIG GAIN (low-basis brokerage)", consistent({ ...BASE, taxableGainPct: 95, otherAccounts: [{ name: "Brokerage", balance: 900000, owner: "JT", taxType: "taxable" }] }), 0],
  ["VERY LARGE single (×5)", { ...scaleAll(5), single: true }, 0],
];
const plan = (mod, p, amt) => { const G = mod.__g; G.applyLoadedData({ portfolio: clone(p), expenses: clone(EX0) });
  if (SPEND17 && mod === M) G.applyLoadedData({ portfolio: clone(p), expenses: v617Table(G, EX0) }); const tl = G.buildPlanTimeline();
  return { tl, W: G.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: amt, scenarioPreset: "base" }) }; };

// ── A · the oracle against the engine, every year ────────────────────────────────────────────────────────────────────────────
console.log("  A — the oracle against the engine, every year");
const AT = {};   // per household: the plan, for B
let yrs = 0, fixOk = 0, oldOk = 0, magiOk = 0, ssOk = 0, streamBad = 0, fixVsOld = 0;
for (const [label, p, amt] of H) {
  const { tl, W } = plan(M, p, amt); AT[label] = { tl, W };
  let fx = 0, od = 0, mg = 0, st = 0, n = 0, dif = 0;
  for (const r of W.schedule) {
    n++; const f = oracleFix(r, tl), o = oracleOld(r);
    const ssEng = POST ? r.ssTaxable : 0.85 * (r.ssA_y + r.ssB_y);
    if (Math.abs(r.magi - ssEng - r.capGain_y - ordOf(r)) > 1e-6) streamBad++;
    if (r.bracket === f.rate) fx++;
    if (r.bracket === o.rate) od++;
    if (Math.abs(r.magi - (POST ? f.magi : o.magi)) < 0.005) mg++;
    if (POST && Math.abs(r.ssTaxable - f.ssT) < 0.005) st++;
    if (f.rate !== o.rate) dif++;
  }
  yrs += n; fixOk += fx; oldOk += od; magiOk += mg; ssOk += st; fixVsOld += dif;
  if (POST) {
    T(`A ${label}: the bracket equals the oracle's in every year (${n})`, fx === n, `${n - fx} years differ`);
    T(`A ${label}: taxable SS and MAGI equal the oracle's to the cent in every year`, st === n && mg === n, `ssTaxable ${st}/${n}, magi ${mg}/${n}`);
  } else {
    T(`A ${label} ${KD}: the bracket is the flat-85% / joint / unindexed column in every year (${n})`, od === n, `${n - od} years differ`);
    T(`A ${label} ${KD}: MAGI carries 85% of benefits to the cent, every year; no ssTaxable field`, mg === n && W.schedule.every(r => r.ssTaxable === undefined), `${mg}/${n}`);
  }
}
T("A-0 SETUP: no fixture carries an ordinary income stream (MAGI is the row's own terms, to the micro-dollar, every year) — else the oracle is blind", streamBad === 0, `${streamBad} years`);
T(`A-1 the fixtures exercise the change: the two rule sets disagree in ${fixVsOld} of ${yrs} household-years`, fixVsOld >= 80, `${fixVsOld}`);
if (POST) T("A-2 …and the engine follows the NEW rule set, not the old, in each of those years", oldOk === yrs - fixVsOld, `old rule matches ${oldOk} of ${yrs}`);
else T(`A-2 ${KD} …and the engine follows the OLD rule set in each of those years`, fixOk === yrs - fixVsOld, `new rule matches ${fixOk} of ${yrs}`);
{ // the edge cases the fixtures exist for — properties of the fixtures and the oracle, so they hold on both legs
  const rows = l => AT[l].W.schedule.map(r => ({ r, f: oracleFix(r, AT[l].tl) }));
  T("A-3 SETUP: SURVIVOR A — A is the survivor, and some Single year exists", rows("SURVIVOR A (B dies first)").some(({ f }) => f.fs));
  const u65 = rows("SURVIVOR UNDER 65 (A dies at 65)").filter(({ r, f }) => f.fs && r.ageB < 65);
  T("A-4 SETUP: SURVIVOR UNDER 65 — a Single year whose filer (B) is under 65, so no age-65 extra applies", u65.length > 0 && u65.every(({ f }) => f.n65 === 0), `${u65.length} years`);
  const bg = AT["BIG GAIN (low-basis brokerage)"];
  const maxGain = Math.max(...bg.W.schedule.map(r => r.capGain_y));
  const edge = bg.W.schedule.filter(r => oracleFix(r, bg.tl).rate !== oracleFix(r, bg.tl, true).rate);
  T("A-5 SETUP: BIG GAIN — a year in which counting the gain in the rate's input would change the rate (DC-1's edge)", edge.length > 0, `max gain ${Math.round(maxGain)}, ${edge.length} years`);
  if (POST) T("A-6 …and in those years the engine reads the rate on ordinary income only (DC-1 (a))", edge.every(r => r.bracket === oracleFix(r, bg.tl).rate), edge.map(r => r.yr).join(","));
  const vl = rows("VERY LARGE single (×5)");
  T("A-7 SETUP: VERY LARGE single reaches the 35% band (the old column stopped at 32%)", vl.some(({ f }) => f.rate >= 35), `${Math.max(...vl.map(({ f }) => f.rate))}%`);
  if (POST) T("A-8 …and the engine shows it", vl.some(({ r }) => r.bracket >= 35));
  else T(`A-8 ${KD} …and the engine caps at 32%`, vl.every(({ r }) => r.bracket <= 32));
}

// ── B · hand-verified pins (scope §0.3) ──────────────────────────────────────────────────────────────────────────────────────
console.log("  B — hand-verified pins (scope §0.3; base scenario, no conversions)");
{
  const ex = y => AT.EXAMPLE.W.schedule.find(r => r.yr === y), mo = y => AT["MODEST couple (×0.3)"].W.schedule.find(r => r.yr === y);
  // 2032, joint: worksheet lines 7 66,345.16 → 16 24,993.39 (line 14 = 6,000); deduction 36,262 + 2 × 1,858 = 39,978; taxable 21,429.10 ≤ 27,929.
  // v6.18 (D-41), the same year re-derived: the 2029 one-time rows empty the brokerage sooner, so 2032 is drawn from Traditional —
  // line 7 = pension 4,800 + Traditional draw 31,902.18 + ½ × benefits 59,862.90 (29,931.45) = 66,633.63; line 16 = 0.85 × (66,633.63 −
  // 44,000) + 6,000 = 25,238.59 (under the 0.85 × benefits cap); taxable 4,800 + 31,902.18 + 25,238.59 − 39,978 = 21,962.77 ≤ 27,929, so
  // still 10%. (DC_V617_SPENDING=1 reproduces 24,993.39.)
  // 2045, survivor B 79, Single: line 16 63,389.20 > line 17 51,873.68; deduction 23,455 + 2,986 = 26,441; taxable 98,200.17 in (73,423, 153,985].
  if (POST) {
    EQ(`B-1 2032 (joint): taxable SS ${P41("$24,993.39", "$25,238.59 (v6.18, D-41)")} by the worksheet`, cents(ex(2032).ssTaxable), P41(24993.39, 25238.59));
    EQ("B-2 2032: bracket 10%", ex(2032).bracket, 10);
    EQ("B-3 2045 (survivor, Single): taxable SS $51,873.68 — the 85% cap binds", cents(ex(2045).ssTaxable), 51873.68);
    EQ("B-4 2045: bracket 22% (Single filing — the widow's penalty)", ex(2045).bracket, 22);
    EQ("B-5 MODEST couple 2042: bracket 0% (taxable income below the deduction)", mo(2042).bracket, 0);
  } else {
    EQ(`B-1 ${KD} 2032: 85% of benefits, $50,883.47`, cents(0.85 * (ex(2032).ssA_y + ex(2032).ssB_y)), 50883.47);
    EQ(`B-2 ${KD} 2032: bracket 12%`, ex(2032).bracket, 12);
    EQ(`B-3 ${KD} 2045: MAGI $124,641 read against the 2026 joint $133,000`, Math.round(ex(2045).magi), 124641);
    EQ(`B-4 ${KD} 2045: bracket 12%`, ex(2045).bracket, 12);
    EQ(`B-5 ${KD} MODEST couple 2042: bracket 12%`, mo(2042).bracket, 12);
  }
}

// ── C · what cannot move, v6.11 → v6.12 ──────────────────────────────────────────────────────────────────────────────────────
console.log("  C — what cannot move (v6.11 → v6.12)");
const PRIOR_MOD = join(HERE, "app_v611.mjs");
if (POST && existsSync(PRIOR_MOD)) {
  const M0 = await import(pathToFileURL(PRIOR_MOD).href);
  const strip = ({ magi, bracket, ssTaxable, ...k }) => k;
  let sched = 0, series = 0, eng = 0, n = 0, moved = 0;
  for (const [label, p] of H) for (const amt of [0, 70000]) {
    n++;
    const a = plan(M0, p, amt), b = plan(M, p, amt);
    if (JSON.stringify(a.W.schedule.map(strip)) === JSON.stringify(b.W.schedule.map(strip))) sched++;
    if (a.W.schedule.some((r, i) => r.bracket !== b.W.schedule[i].bracket)) moved++;
    const run = (mod, tl) => { const A = { retireYear: tl.targetRetireYear, rothAmount: amt, qcdAnnual: 0, taxYield: 2.0 };
      const S = mod.__g.withdrawalPlanSeries({ ...A, scenarioPreset: "base" });
      return { S, B: mod.__engines.computeTaxPlan({ ...A, ...S }).rows, C: mod.__engines.computeIrmaaPlan({ ...A, ...S }).rows }; };
    M0.__g.applyLoadedData({ portfolio: clone(p) }); const ra = run(M0, M0.__g.buildPlanTimeline());
    g.applyLoadedData({ portfolio: clone(p) }); const rb = run(M, g.buildPlanTimeline());
    if (JSON.stringify(ra.S) === JSON.stringify(rb.S)) series++;
    if (JSON.stringify([ra.B, ra.C]) === JSON.stringify([rb.B, rb.C])) eng++;
  }
  T(`C-1 Engine D: every schedule field but magi, bracket and ssTaxable is bit-identical to v6.11 (${n} household × slider runs)`, sched === n, `${sched}/${n}`);
  T("C-2 the bridge to Engines B and C (withdrawalPlanSeries) is bit-identical", series === n, `${series}/${n}`);
  T("C-3 the Taxes and IRMAA tabs' engines are bit-identical", eng === n, `${eng}/${n}`);
  T("C-4 PRECONDITION: the column itself moved in most runs (C-1 is not vacuous)", moved >= 15, `${moved}/${n}`);
} else console.log(`  (§C skipped on the ${VER} leg${POST ? ": app_v611.mjs not in this run folder" : ""} — the differential needs both builds)`);

// ── D · structure, by AST ────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — structure, by AST");
{
  const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
  const ast = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });
  const base = Object.assign({}, walk.base, {
    JSXElement(n, st, c) { n.openingElement && c(n.openingElement, st); (n.children || []).forEach(ch => c(ch, st)); },
    JSXFragment(n, st, c) { (n.children || []).forEach(ch => c(ch, st)); },
    JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); },
    JSXAttribute(n, st, c) { n.value && c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
    JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {}, JSXClosingElement() {},
    JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });
  const outer = anc => { let name = "<module>"; for (let i = 0; i < anc.length; i++) { const n = anc[i];
    if (n.type === "FunctionDeclaration" && n.id && anc[i - 1] && anc[i - 1].type === "Program") return n.id.name;
    if (n.type === "VariableDeclarator" && anc[i - 2] && anc[i - 2].type === "Program" && n.init && /Function/.test(n.init.type)) return n.id.name; }
    return name; };   // the OUTERMOST named function: a top-level declaration or a top-level `const f = (…) =>`
  const calls = new Set(), reads = [], prod085 = [];
  walk.ancestor(ast, {
    CallExpression(n, _st, anc) { if (n.callee.type === "Identifier" && outer(anc) === "computeWithdrawalPlan") calls.add(n.callee.name); },
    MemberExpression(n, _st, anc) { const k = n.property && n.property.name; if (/^(MFJ|SGL)_(BR|STD)$/.test(k || "") && outer(anc) === "computeWithdrawalPlan") reads.push(k); },
    BinaryExpression(n, _st, anc) { if (n.operator === "*" && [n.left, n.right].some(x => x.type === "Literal" && x.value === 0.85)) prod085.push(`${outer(anc)}@L${n.loc.start.line}`); },
  }, base);
  if (POST) {
    T("D-1 Engine D calls the shared §86 helper (taxableSS86)", calls.has("taxableSS86"), [...calls].join(","));
    T("D-2 Engine D takes its table, deduction and age-65 extra from projectBracketsAt", calls.has("projectBracketsAt"));
    T("D-3 [EXTINCTION] Engine D holds no bracket figure of its own — it reads no MFJ_/SGL_ BR or STD", reads.length === 0, reads.join(","));
    T("D-4 [EXTINCTION] every × 0.85 product in the source is inside taxableSS86 — a private §86 copy fails here", prod085.length > 0 && prod085.every(s => s.startsWith("taxableSS86@")), prod085.join(" "));
  } else {
    T(`D-1 ${KD} Engine D does not call taxableSS86`, !calls.has("taxableSS86"));
    T(`D-2 ${KD} …nor projectBracketsAt`, !calls.has("projectBracketsAt"));
    T(`D-3 ${KD} Engine D reads the joint table directly (MFJ_BR, MFJ_STD)`, reads.includes("MFJ_BR") && reads.includes("MFJ_STD"), reads.join(","));
    T(`D-4 ${KD} exactly one × 0.85 product outside the helper, and it is Engine D's`, prod085.filter(s => !s.startsWith("taxableSS86@")).length === 1 &&
      prod085.some(s => s.startsWith("computeWithdrawalPlan@")), prod085.join(" "));
  }
}

// ── E · the rendered tabs ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the rendered tabs (the example, as a user first sees it)");
{
  require(`./dom_${VER}.cjs`);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(res => setTimeout(res, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const tab = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const text = () => (body().textContent || "").replace(/\s+/g, " ");
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  T("E-0 SETUP: the example household loads", !!ex); if (ex) { await click(ex); await flush(); await flush(); }
  await click(tab("withdrawal")); await flush();
  const HEAD = ["Year", "Age A/B", "Guaranteed", "Work", "Expenses", "Draw Need", "RMD", "From Source(s)", "Conv", "Bracket", "EOY Portfolio"];
  const grid = [...body().querySelectorAll("div")].find(d => d.children.length > 11 && HEAD.every((h, i) => d.children[i] && d.children[i].textContent.trim() === h));
  const cells = grid ? [...grid.children].slice(11).map(c => c.textContent.trim()) : [];
  const rowsDom = []; for (let i = 0; i + 11 <= cells.length; i += 11) rowsDom.push(cells.slice(i, i + 11));
  // The tab renders the app's own state: the slider's default conversion and the default scenario. Which ones is CHECKED, not assumed:
  // the EOY Portfolio column must equal the engine's for the arguments chosen, in every row, before the Bracket column is compared.
  // ⚠ The DOM bundle carries its OWN copy of the app module: read the household it rendered through `window.__g`, never `g` (which
  // still holds the last fixture above — a first draft did, and compared a 25-row table with a 16-row single household).
  const gd = window.__g, tl = gd.buildPlanTimeline();
  const W = gd.computeWithdrawalPlan({ retireYear: tl.targetRetireYear, rothAmount: 70000, scenarioPreset: "bull" }).schedule;
  const eoyOk = rowsDom.length === W.length && rowsDom.every((c, i) => c[0] === String(W[i].yr) && c[10] === `$${(W[i].portfolioTotal / 1e6).toFixed(2)}M`);
  T("E-1 SETUP: the Withdrawal table is found and its Year and EOY Portfolio columns equal the engine's (slider $70,000, bull) in every row", eoyOk, `${rowsDom.length} rows vs ${W.length}`);
  const want = W.map(r => (POST ? oracleFix(r, tl) : oracleOld(r)).rate);
  const shown = rowsDom.map(c => Number(c[9].replace("%", "")));
  T(`E-2 ${POST ? "" : KD + " "}every Bracket cell shows the ${POST ? "worksheet / filing-status / indexed" : "flat-85% / joint"} rate (the oracle's)`, eoyOk && JSON.stringify(shown) === JSON.stringify(want),
    shown.map((s, i) => s === want[i] || !W[i] ? null : `${W[i].yr}: ${s} vs ${want[i]}`).filter(Boolean).slice(0, 6).join("; "));
  T("E-3 PRECONDITION: on this household the two rule sets differ in some row (E-2 is not vacuous)", W.some(r => oracleFix(r, tl).rate !== oracleOld(r).rate));
  const wd = text();
  const DESC = "The Bracket column is the federal marginal rate on the year's ordinary income: Social Security taxed as the IRS worksheet taxes it, joint while both spouses are alive and Single from the year after the first death";
  T(`E-4 ${POST ? "" : KD + " "}the table says what the Bracket column is (DC-3)`, POST ? wd.includes(DESC) : !wd.includes(DESC));
  await click(tab("irmaa")); await flush(); const ir = text();
  await click(tab("taxes")); await flush(); const tx = text();
  await click(tab("roth")); await flush(); const ro = text();
  const OLD = { ir: "the simplified 85%-of-SS assumption", tx: "Federal brackets are MFJ inflated 2%/yr", ro: "SS taxation: 85% taxable when provisional income > $44K (MFJ)" };
  const NEW = { ir: "Social Security taxed by the IRS worksheet, plus every other taxable component the plan generates",
                tx: "Federal brackets follow the filing status (joint, or Single for a single household and from the year after the first death), inflated 2%/yr",
                ro: "SS taxation: up to 85% taxable above $44K of provisional income (MFJ; IRS worksheet, thresholds not indexed)" };
  for (const [k, page, name] of [["ir", ir, "IRMAA footnote"], ["tx", tx, "Taxes footnote"], ["ro", ro, "Roth assumptions"]]) {
    if (POST) T(`E-5 ${name}: states the §86 rule as the engines apply it, and the old sentence is gone (DC-4)`, page.includes(NEW[k]) && !page.includes(OLD[k]),
      `new ${page.includes(NEW[k])}, old ${page.includes(OLD[k])}`);
    else T(`E-5 ${KD} ${name}: carries the old sentence`, page.includes(OLD[k]) && !page.includes(NEW[k]));
  }
  root.unmount();
}

console.log(`\nt75 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
