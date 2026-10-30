// t95 — QCDs AFTER A DEATH, AND FIVE TABS SAY WHAT THE MODEL DOES (v6.32 — D-61, F-26; docs/SCOPE_F26_D61_V632.md)
// Run: node t95_f26_d61.mjs v632   |   node t95_f26_d61.mjs v631
//
// THE DEFECTS THIS EXISTS FOR.
//  D-61 — through v6.31 the two engines that model a QCD let a survivor give on the DECEASED spouse's age: Engine B (`computeTaxPlan`) tested
//    the older of the two ages in widowed years and counted both spouses in the death year; Engine C (`computeIrmaaPlan`) counted both
//    spouses, each on their own age, for the whole horizon — two caps for one survivor. From v6.32 (DF-7 (a)): from the year of the first
//    death, the survivor alone, on the survivor's own age, one cap. Invisible on the example (QCD $0, survivor 78 at the first death) and to
//    every existing suite (scope §0.6, measured).
//  F-26 — five tabs said things the model does not do. The Stress tab's cards typed "Combined shock … over 4–10 years", "20+ years alone",
//    "Survivor SS benefit = A's FRA + DRCs", printed spouse A's benefit as the survivor's, and named spouse B on single plans (DF-1, DF-2);
//    the Social Security tab's survivor grid showed spouse A's benefit alone (DF-8); the Roth tab's ladder started at the TARGET year
//    whatever year was selected, and Ask AI was told so (DF-3); the Events tab printed Nov 1 – Jan 15 for every year (DF-5); the Backtest
//    called 1966 "generally considered the worst" and its own "worst" kept the earliest depleting start, not the soonest (DF-4); the README
//    carried eleven stale claims (DF-6).
//
// THE ORACLES. Every expectation is computed HERE from the plan's own dates, ages and benefits — the QCD head-count from the dates of birth
// and plan-to ages (never the engine's `widowed` or `_survivorIsA`), the years alone and the charge years from the Monte Carlo's quarter
// calendar re-derived here, the survivor grid from the SSA reduction and credit rates typed here (5/9% and 5/12% a month early, 2/3% a month
// late). Two oracles are weaker and say so: the Roth RMD card is re-derived with the app's own seed helpers at the SELECTED year (what it
// tests is the anchor year, not the helpers), and the Backtest's "soonest" is checked against the tab's own named-year table (its sweep is
// component-inline — OPERATIONS §M — so the suite cannot re-run all 98 starts; the card must be no later than any named start that runs out).
//
// GATED PER LEG (OPERATIONS §B2). The v6.31 leg pins each defect as a dated [KNOWN DEFECT 2026-10-25, D-61] / [..., F-26]. README and
// METHODOLOGY are repo documents, not builds: they are read on the v6.32 leg only. The Stress tab is rendered on the v6.32 leg only (each
// render runs the stress set — the v6.31 leg's copy is pinned by AST instead). Controls: qa/tools/controls_v632_f26_d61.py (repo-only).
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(95); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v632";
const DUMP = process.argv.includes("--roth-dump");
const KNOWN_VERSIONS = ["v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639"].includes(VER);   // an array, so the next registration widens it
const KQ = "[KNOWN DEFECT 2026-10-25, D-61 — flips at v6.32]";
const KF = "[KNOWN DEFECT 2026-10-25, F-26 — flips at v6.32]";
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished && !DUMP) { console.log(`t95 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const require = createRequire(import.meta.url);
const sq = s => String(s || "").replace(/\s+/g, " ");

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const STRINGS = all(AST, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement" || n.type === "JSXText")
  .map(x => sq(x.n.type === "TemplateElement" ? x.n.value.cooked : x.n.value));   // JSX text wraps across lines
const anyStr = s => STRINGS.some(t => t.includes(sq(s)));
const declIn = (fnName, varName) => { const f = topFn(fnName); return f ? all(f, n => n.type === "VariableDeclarator" && n.id && n.id.name === varName).map(x => x.n) : []; };
const srcOf = n => SRC.slice(n.start, n.end);

if (DUMP) {
  // ════ child process: the Roth tab's text at the target year, the example household (§C byte identity) ═══════════════════════════════
  const D = await domHarness();
  await D.seed(); await D.click([...D.body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await D.flush();
  await D.go("roth"); await D.flush(300);
  const card = [...D.body().querySelectorAll("div.card")].find(c => /ROTH CONVERSION STRATEGY/.test(c.textContent || ""));
  console.log("ROTH_DUMP " + JSON.stringify(card ? sq(card.textContent) : null));
  process.exit(0);
}

console.log(`t95 — QCDs AFTER A DEATH; FIVE TABS SAY WHAT THE MODEL DOES (${VER})\n`);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const g = { ...M.__test, ...M.__g }, E = M.__engines;   // __g last: its getters (PORTFOLIO() …) win over __test's plain values
const BASE = clone(g.PORTFOLIO()), EX = clone(g.EXPENSES());
const load = P => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(EX) }); return g.PLAN_TIMELINE(); };
const mk = o => ({ ...clone(BASE), ...o });
const triple = P => { const p = clone(P); p.positions.forEach(q => { for (const f of ["balance", "trad", "roth"]) if (typeof q[f] === "number") q[f] *= 3; });
  (p.otherAccounts || []).forEach(a => a.balance *= 3); p.total401k *= 3; p.household *= 3; return p; };

// ════ §A · D-61 — who may make a QCD after a death (engine level, both legs) ════════════════════════════════════════════════════════
console.log("  A — QCD eligibility after the first death (Engines B and C)");
// The head-count, from the plan's dates alone. `rule`: "new" (v6.32, DF-7 (a)), "oldB" / "oldC" (v6.31's two expressions, for the pins).
const persons = (tl, yr, rule) => {
  const ageA = yr - tl.dobA.year, ageB = yr - tl.dobB.year;
  if (tl.single) return ageA >= 71 ? 1 : 0;
  const dA = tl.dobA.year + tl.lifeExpA, dB = tl.dobB.year + tl.lifeExpB, d1 = Math.min(dA, dB), survA = dA >= dB;   // a tie leaves A
  const both = (ageA >= 71 ? 1 : 0) + (ageB >= 71 ? 1 : 0);
  if (rule === "new") return yr >= d1 ? ((survA ? ageA : ageB) >= 71 ? 1 : 0) : both;
  if (rule === "oldB") return yr > d1 ? (Math.max(ageA, ageB) >= 71 ? 1 : 0) : both;
  return both;   // "oldC"
};
const QH = [   // [label, portfolio, QCD]
  ["the example, QCD $20K", BASE, 20000],
  ["A 1958 dies at 76 (2034), B 1966, QCD $20K", mk({ dobA: "1958-01-01", dobB: "1966-01-01", lifeExpA: 76, lifeExpB: 90 }), 20000],
  ["A 1955 dies at 75 (2030), B 1962, QCD $30K", mk({ dobA: "1955-01-01", dobB: "1962-01-01", lifeExpA: 75, lifeExpB: 92 }), 30000],
  ["A 1955 dies at 72 (2027, before retiring), B 1966, QCD $20K", mk({ dobA: "1955-01-01", dobB: "1966-01-01", lifeExpA: 72, lifeExpB: 90 }), 20000],
  ["B 1954 dies at 74 (2028), A 1964, QCD $25K", mk({ dobA: "1964-01-01", dobB: "1954-01-01", lifeExpA: 92, lifeExpB: 74 }), 25000],
  ["balances ×3, A 1955 dies at 80 (2035), B 1956, QCD $150K — one cap after the death", triple(mk({ dobA: "1955-01-01", dobB: "1956-01-01", lifeExpA: 80, lifeExpB: 95 })), 150000],
  ["a tie: A 1966 and B 1950 both die in 2035 — A survives at 69", mk({ dobA: "1966-01-01", dobB: "1950-01-01", lifeExpA: 69, lifeExpB: 85 }), 20000],
  ["the example made single, QCD $20K", mk({ single: true }), 20000],
  ["the example made single, balances ×3, QCD $150K", triple(mk({ single: true })), 150000],
];
const plan = (P, q, roth = 0) => {
  const tl = load(P); const R = tl.targetRetireYear;
  const A = { retireYear: R, rothAmount: roth, qcdAnnual: q, taxYield: 2 };
  return { tl, R, B: E.computeTaxPlan(A), C: E.computeIrmaaPlan(A) };
};
let REF = null;   // v6.31's module, for "unchanged" on the v6.32 leg
if (POST && existsSync(join(HERE, "app_v631.mjs"))) { const R = await import(pathToFileURL(join(HERE, "app_v631.mjs")).href); REF = { g: { ...R.__test, ...R.__g }, E: R.__engines }; }
const planRef = (P, q, roth = 0) => { REF.g.applyLoadedData({ portfolio: clone(P), expenses: clone(EX) }); const tl = REF.g.PLAN_TIMELINE(); const A = { retireYear: tl.targetRetireYear, rothAmount: roth, qcdAnnual: q, taxYield: 2 };
  return { tl, B: REF.E.computeTaxPlan(A), C: REF.E.computeIrmaaPlan(A) }; };
const capAt = (tl, yr) => g.inflateTaxConst(g.TAX_CONSTS().QCD_LIMIT, yr, tl.asOfYear);
const near = (a, b) => Math.abs(a - b) <= 1e-6;
for (const [lab, P, q] of QH) {
  const p = plan(P, q), tl = p.tl;
  const d1 = tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
  const exp = (yr, rule) => Math.min(q, persons(tl, yr, rule) * capAt(tl, yr));
  const differs = p.B.rows.some(r => !near(exp(r.yr, "new"), exp(r.yr, "oldB"))) || p.C.rows.some(r => !near(exp(r.yr, "new"), exp(r.yr, "oldC")));
  const cByYr = Object.fromEntries(p.C.rows.map(r => [r.yr, r.qcd_y]));
  if (POST) {
    const badB = p.B.rows.filter(r => !near(r.qcd_y, exp(r.yr, "new"))), badC = p.C.rows.filter(r => !near(r.qcd_y, exp(r.yr, "new")));
    T(`A-1 ${lab}: Engine B's QCD every year is min(QCD, survivor-rule persons × the indexed cap) — ${p.B.rows.length} years`, badB.length === 0, badB.slice(0, 3).map(r => `${r.yr}: ${r.qcd_y} vs ${exp(r.yr, "new")}`).join("; "));
    T(`A-2 ${lab}: Engine C's QCD every year, the same rule`, badC.length === 0, badC.slice(0, 3).map(r => `${r.yr}: ${r.qcd_y} vs ${exp(r.yr, "new")}`).join("; "));
    T(`A-3 ${lab}: Engines B and C give the same QCD every year (the extinction invariant)`, p.B.rows.every(r => !(r.yr in cByYr) || near(cByYr[r.yr], r.qcd_y)));
    if (REF) {
      const r = planRef(P, q), pre = rr => rr.filter(x => x.yr < d1);
      const ok = (a, b, ks) => a.length === b.length && a.every((x, i) => ks.every(k => x[k] === b[i][k]));
      T(`A-4 ${lab}: every year before the first death (${tl.single ? "all years — a single plan" : `before ${d1}`}) is v6.31's to the cent — Engines B and C`,
        ok(pre(p.B.rows), pre(r.B.rows), ["qcd_y", "totalTax", "totalTaxToday", "magi_y"]) && ok(pre(p.C.rows), pre(r.C.rows), ["qcd_y", "magi", "surchargeAnnual"]));
    }
  } else {
    const okB = p.B.rows.every(r => near(r.qcd_y, exp(r.yr, "oldB"))), okC = p.C.rows.every(r => near(r.qcd_y, exp(r.yr, "oldC")));
    T(`A-1 ${lab}${differs ? " " + KQ : ""}: Engine B follows v6.31's rule (widowed years test the OLDER age; the death year counts both)`, okB);
    T(`A-2 ${lab}${differs ? " " + KQ : ""}: Engine C follows v6.31's rule (both spouses counted for the whole horizon)`, okC);
  }
  if (lab.startsWith("balances ×3, A 1955")) {
    const bc = p.B.rows.filter(r => r.yr > d1 && (r.yr in cByYr) && !near(cByYr[r.yr], r.qcd_y)).length;
    if (POST) T("A-5 the one-cap household: B and C agree in every widowed year — two caps no longer", bc === 0);
    else T(`A-5 ${KQ}: the one-cap household is where Engines B and C disagree — Engine C gives the survivor two caps in ${bc} widowed years`, bc > 0, `${bc}`);
  }
  if (lab.startsWith("a tie")) {
    // both die in 2035, the horizon's last year, so the death year is the one year the rule decides
    const zB = p.B.rows.filter(r => r.yr === 2035), zC = p.C.rows.filter(r => r.yr === 2035);
    T(`A-6 the tie${POST ? "" : " " + KQ}: A survives (the engines' rule), so 2035 gives ${POST ? "$0 in both engines — A is 69" : "the QCD — v6.31 counts B (85) in the death year"}`,
      zB.length === 1 && zC.length === 1 && [zB[0], zC[0]].every(r => POST ? r.qcd_y === 0 : r.qcd_y === q), `${zB.map(r => r.qcd_y)} / ${zC.map(r => r.qcd_y)}`);
  }
  if (lab.startsWith("A 1958")) {
    const y = yr => (p.B.rows.find(r => r.yr === yr) || {}).qcd_y;
    T(`A-7 the 2034 household, by hand${POST ? "" : " " + KQ}: ${POST ? "$0 in 2034–2036 (spouse B is 68–70), $20,000 from 2037" : "$20,000 in 2034–2036 on the deceased's age"}`,
      POST ? [2034, 2035, 2036].every(yy => y(yy) === 0) && y(2037) === 20000 : [2034, 2035, 2036, 2037].every(yy => y(yy) === 20000), [2034, 2035, 2036, 2037].map(y).join(", "));
  }
}
// The measured figures quoted in the scope (§0.6) and the CHANGELOG — Engine B's lifetime tax in today's dollars at a $70K conversion. A pin
// of the engine's own total (not an independent figure), so a release that moves it says so.
{
  const L = [["A 1958 dies at 76", QH[1][1], 20000, 174260, 182314], ["A 1955 dies at 75", QH[2][1], 30000, 151628, 166734],
             ["A 1955 dies at 72", QH[3][1], 20000, 206430, 231658], ["B 1954 dies at 74", QH[4][1], 25000, 179772, 206024]];
  for (const [lab, P, q, before, after] of L) {
    const t = Math.round(plan(P, q, 70000).B.today.totAll);
    T(`A-8 ${lab}: lifetime tax in today's dollars at a $70K conversion is $${(POST ? after : before).toLocaleString()} (the scope's measured figure)${POST ? "" : " " + KQ}`, t === (POST ? after : before), `$${t}`);
  }
}
// By AST: one eligibility expression per engine, and each reads the survivor's own age.
{
  const b = declIn("computeTaxPlan", "_qcdPersons"), c = declIn("computeIrmaaPlan", "_qcdPersonsI");
  const elsewhere = all(AST, n => n.type === "VariableDeclarator" && n.id && /^_qcdPersons/.test(n.id.name)).length;
  const reads = n => n && /widowed \? \(\(_survivorIsA \? ageA : ageB\) >= 71 \? 1 : 0\)/.test(srcOf(n.init)) && !/Math\.max\(ageA, ageB\)/.test(srcOf(n.init));
  T("A-9 by AST: exactly one `_qcdPersons` in Engine B, one `_qcdPersonsI` in Engine C, and no other declaration of either", b.length === 1 && c.length === 1 && elsewhere === 2, `${b.length}/${c.length}/${elsewhere}`);
  if (POST) T("A-10 by AST: both read the survivor's age from the first death (`widowed ? ((_survivorIsA ? ageA : ageB) >= 71 …`), neither the older age", reads(b[0]) && reads(c[0]));
  else T(`A-10 by AST ${KQ}: neither reads the survivor's age (Engine B tests Math.max(ageA, ageB))`, !reads(b[0]) && !reads(c[0]) && /Math\.max\(ageA, ageB\)/.test(srcOf(b[0].init)));
}

// ════ §S · the Stress tab's facts (`stressPlanFacts`, v6.32) against the Monte Carlo's rules, re-derived here ═════════════════════════
console.log("  S — the Stress tab's computed facts");
// The Monte Carlo's calendar, typed here: quarter q of a run starts at the as-of quarter; a charge falls in June (the April–June quarter) of
// its year, only in retirement (from January of the retirement year), only inside the run, and only while that person is alive.
const aqOf = tl => Math.floor(((tl.asOf.month || 1) - 1) / 3);
const lastYr = (tl, years) => tl.asOf.year + Math.floor((years * 4 - 1 + aqOf(tl)) / 4);   // the year of the run's last quarter
const wholeYr = (tl, years) => { const cq = years * 4 - 1 + aqOf(tl); return tl.asOf.year + Math.floor(cq / 4) - (cq % 4 === 3 ? 0 : 1); };   // its last WHOLE year
const juneQ = (tl, yr) => (yr - tl.asOf.year) * 4 + 1 - aqOf(tl);
const juneIn = (tl, R, yr, years) => { const q = juneQ(tl, yr); return q >= 0 && q < years * 4 && yr >= R; };
const whyOf = (tl, R, yr, dy, years) => juneIn(tl, R, yr, years) && yr < dy ? null : yr >= dy ? "died" : yr < R ? "beforeRetire" : juneQ(tl, yr) >= years * 4 ? "afterRun" : "beforeStart";
const exFacts = (tl, R) => {
  const single = !!tl.single, dyA = tl.dobA.year + tl.lifeExpA, dyB = single ? null : tl.dobB.year + tl.lifeExpB;
  const yA = tl.dobA.year + 78, yB = single ? null : tl.dobB.year + 82;
  const ltc = { A: { yr: yA, inside: juneIn(tl, R, yA, 30) && yA < dyA, why: whyOf(tl, R, yA, dyA, 30) }, B: single ? null : { yr: yB, inside: juneIn(tl, R, yB, 30) && yB < dyB, why: whyOf(tl, R, yB, dyB, 30) } };
  ltc.count = (ltc.A.inside ? 1 : 0) + (ltc.B && ltc.B.inside ? 1 : 0);
  const dA = tl.dobA.year + 70, end = lastYr(tl, 30);
  if (single) return { single, ltc, early: { dA, startsDead: dA <= tl.asOf.year } };
  const first = dA < dyB ? "A" : dyB < dA ? "B" : "both";
  const from = Math.max(Math.min(dA, dyB), tl.asOf.year), to = Math.min(Math.max(dA, dyB), wholeYr(tl, 30) + 1);
  return { single, ltc, early: { dA, dB: dyB, first, from, alone: first === "both" ? 0 : Math.max(0, to - from), survivorIsA: first === "B" } };
};
const SH = [["the example", BASE], ["the example made single", mk({ single: true })],
  ["A past 70 at the as-of date (A 1950)", mk({ dobA: "1950-03-01", lifeExpA: 92 })],
  ["B's plan-to year first (A 1964 to 92, B 1954 to 74)", mk({ dobA: "1964-01-01", dobB: "1954-01-01", lifeExpA: 92, lifeExpB: 74 })],
  ["a tie in the early run (A 1964, B 1960 to 74 — both 2034)", mk({ dobA: "1964-01-01", dobB: "1960-01-01", lifeExpA: 90, lifeExpB: 74 })],
  ["B's charge after the run (B 1990, A 1964)", mk({ dobA: "1964-01-01", dobB: "1990-01-01", lifeExpA: 90, lifeExpB: 95 })],
  ["as-of May 2026, B's charge in June 2056 — one quarter past the run (B 1974)", mk({ asOf: "2026-05-15", dobB: "1974-01-01", lifeExpB: 95 })],
  ["as-of May 2026, B alone to the run's end (A 1964 to 80, B 1974 to 95)", mk({ asOf: "2026-05-15", dobA: "1964-01-01", lifeExpA: 80, dobB: "1974-01-01", lifeExpB: 95 })]];
if (POST) {
  T("S-0 stressPlanFacts is exported (the cards' one source)", typeof g.stressPlanFacts === "function");
  for (const [lab, P] of SH) {
    const tl = load(P), R = tl.targetRetireYear, f = g.stressPlanFacts(tl, R), x = exFacts(tl, R);
    T(`S-1 ${lab}: the LTC charge years and the inside-the-run test (${x.ltc.count} charge(s))`, f.ltc.A.yr === x.ltc.A.yr && f.ltc.A.inside === x.ltc.A.inside && f.ltc.count === x.ltc.count
      && (x.single ? f.ltc.B === null : f.ltc.B.yr === x.ltc.B.yr && f.ltc.B.inside === x.ltc.B.inside), JSON.stringify({ f: f.ltc, x: x.ltc }));
    T(`S-3 ${lab}: the reason a charge is not made is read from the quarter (A ${x.ltc.A.why || "charged"}${x.single ? "" : `, B ${x.ltc.B.why || "charged"}`})`,
      f.ltc.A.why === x.ltc.A.why && (x.single || f.ltc.B.why === x.ltc.B.why), JSON.stringify([f.ltc.A.why, f.ltc.B && f.ltc.B.why]));
    if (x.single) T(`S-2 ${lab}: a single plan — A's death at 70 (${x.early.dA}) ends the run`, f.early.single && f.early.dA === x.early.dA && f.early.startsDead === x.early.startsDead);
    else T(`S-2 ${lab}: the early-death run — ${x.early.first === "both" ? "both die the same year, no years alone" : `${x.early.survivorIsA ? "A" : "B"} is alone ${x.early.alone} years from ${x.early.from}`}`,
      f.early.first === x.early.first && f.early.from === x.early.from && f.early.alone === x.early.alone && f.early.survivorIsA === x.early.survivorIsA, JSON.stringify({ f: f.early, x: x.early }));
  }
} else T(`S-0 ${KF}: no stressPlanFacts on this build — the cards typed their figures`, g.stressPlanFacts === undefined);

// ════ §B (AST half) · the Stress copy's typed claims, extinct (both legs) ═══════════════════════════════════════════════════════════
console.log("  B — the Stress tab's sentences");
const STRESS_OLD = ["Combined shock", "20+ years alone", "FRA + DRCs accrued", "Tech −40%", "6-8% infl", "needs assisted living", "Success (>$1,500K)",
  "one bounded early shock", "The worst timing", "$150-300K × 2", "2y+4y pre-death, 35yr"];
{
  const left = STRESS_OLD.filter(anyStr);
  if (POST) T(`B-1 by AST over every string: none of the ${STRESS_OLD.length} typed Stress claims remains`, left.length === 0, left.join(" | "));
  else T(`B-1 ${KF}: the v6.31 leg carries every one of the ${STRESS_OLD.length} typed Stress claims`, left.length === STRESS_OLD.length, STRESS_OLD.filter(s => !anyStr(s)).join(" | "));
}

// ════ §E · the Events tab's ACA dates (module, fixed clocks, both legs) ═════════════════════════════════════════════════════════════
console.log("  E — ACA open-enrollment dates");
{
  load(mk({ retireYear: 2026 }));   // retired from 2026; the younger spouse is 65 in 2031, so every clock below is a bridge year
  const aca = d => ((g.computePlanEvents(d) || []).find(e => e.key === "aca") || {});
  const C = [["Nov 15 2026", new Date(2026, 10, 15, 12), 2027], ["Jan 10 2027", new Date(2027, 0, 10, 12), 2027], ["Oct 15 2026", new Date(2026, 9, 15, 12), 2027],
             ["Mar 15 2026", new Date(2026, 2, 15, 12), 2027], ["Nov 15 2027", new Date(2027, 10, 15, 12), 2028], ["Oct 15 2027", new Date(2027, 9, 15, 12), 2028],
             ["Mar 15 2027", new Date(2027, 2, 15, 12), 2028]];
  for (const [lab, d, cy] of C) {
    const e = aca(d), w = e.when || "", dated = /Nov 1/.test(w);
    if (cy === 2027) T(`E-1 ${lab} (coverage ${cy}, the year checked): the dates print`, dated && (lab.startsWith("Nov") || lab.startsWith("Jan") ? /Nov 1 – Jan 15 \(coverage for 2027\)/.test(w) : true), w);
    else if (POST) T(`E-2 ${lab} (coverage ${cy}): no date, and HealthCare.gov named`, !dated && !/Jan 15/.test(w) && /2028 coverage/.test(w) && /HealthCare\.gov/.test(w), w);
    else T(`E-2 ${lab} ${KF}: v6.31 prints Nov 1 for ${cy} coverage too`, dated, w);
  }
  T("E-3 the instructions still point to HealthCare.gov and name the coverage year checked", /HealthCare\.gov's open enrollment for 2027 coverage/.test(aca(new Date(2026, 10, 15, 12)).instructions || ""));
}

// ════ §F · the README (a repo document — read on the v6.32 leg) ════════════════════════════════════════════════════════════════════
if (POST) {
  console.log("  F — the README");
  const RP = join(HERE, "..", "README.md");
  if (!existsSync(RP)) { T("F-0 README.md is in the run folder (mk_runfolder.sh copies it)", false, RP); }
  else {
    const RM = readFileSync(RP, "utf8");
    const OLD = ["no data leaves your machine", "flowing through every engine", "Withdrawal sequencing and guardrails", "mainstream retirement calculators", "1926–present",
      "Switch the scenario prior to `BULL-LEANING`", "re-runs every statutory constant", "562 checks", "all 26 tabs", "~11,200 lines", "Runnable verification suite",
      "transmits a structured plan summary and your typed question", "Gompertz survival modeling"];
    const left = OLD.filter(s => RM.includes(s));
    T(`F-1 none of the README's ${OLD.length} stale phrases remains (scope §0.5's eleven claims)`, left.length === 0, left.join(" | "));
    T("F-2 no typed check count (a count goes stale — the README points to TESTING.md)", !/\b\d[\d,]*\s+(app\s+)?checks\b/i.test(RM) && /TESTING\.md/.test(RM));
    T("F-3 the install line is `npm ci` (the lockfile is a build input)", /^npm ci\b/m.test(RM) && !/^npm install\b/m.test(RM));
    T("F-4 the repository table lists qa/ and docs/, and says validation/ is not the release gate", /\| `qa\/` \|/.test(RM) && /\| `docs\/` \|/.test(RM) && /not part of the release gate/.test(RM));
    T("F-5 Ask AI is described as what it sends, and the claude.ai route as keyless", /ground rules/.test(RM) && /On claude\.ai it uses the platform, with no key/.test(RM));
  }
}

// ════ §G (module half) · the copy: Field Manual, METHODOLOGY, the Taxes/IRMAA QCD sentences (AST) ═══════════════════════════════════
console.log("  G — the copy");
{
  const DOCS = g.DOCS_HTML();
  if (POST) {
    T("G-1 Field Manual, Taxes entry: from the first death only the survivor gives, one cap", DOCS.includes("from the first projected death only the survivor gives, from the year the survivor turns 71, with one cap"));
    T("G-2 Field Manual, honest limits: the survivor alone, from the year the survivor turns 71, one cap", DOCS.includes("and from the first projected death the survivor alone, from the year the survivor turns 71, with one cap"));
    T("G-3 Field Manual, Stress: the cards state each run's own years; a single plan's cards charge one person", DOCS.includes("The cards state each run's own years for your plan") && DOCS.includes("For a single plan the care cards charge one person"));
    T("G-4 Field Manual, Stress: the second spouse's care is the one on one check; the figure says 78 / 82, not \"early\"", DOCS.includes("for the second spouse's care, one Social Security check has already stopped") && DOCS.includes(">one bill each, at 78 / 82<") && !DOCS.includes("one bill, early"));
    T("G-5 Field Manual, Backtest: the 1966 chart is one hard start; the header names the plan's own worst", !DOCS.includes("worst-case grind") && DOCS.includes("one hard start, not necessarily this plan's worst"));
    T("G-6 Field Manual, Roth: the ladder runs from the selected retirement year", DOCS.includes("The Roth conversion ladder from the selected retirement year until the year before RMDs begin"));
    T("G-7 Field Manual §13: the v6.32 entry, newest first", DOCS.includes("<strong>QCDs after a death; five tabs say what the model does (v6.32).</strong>")
      && DOCS.indexOf("(v6.32).</strong>") < DOCS.indexOf("(v6.31).</strong>"));
    T("G-8 Taxes tab (AST): the QCD line says only the survivor may give, and the old approximation note is gone",
      anyStr("only the survivor may give, from the year the survivor turns 71, with one person's cap") && !anyStr("survivor years are approximated"));
    T("G-9 IRMAA tab (AST): from the first projected death only the survivor, with one cap", anyStr("from the first projected death only the survivor, from the year the survivor turns 71, with one cap"));
    T("G-10 Taxes tab (AST): the cap note says two caps only while both spouses live", anyStr(" while both spouses live; $111K for the survivor"));
    const MDP = join(HERE, "..", "METHODOLOGY.md");
    const MD = existsSync(MDP) ? readFileSync(MDP, "utf8") : "";
    T("G-11 METHODOLOGY has the section \"QCDs after a death (v6.32)\"", /^## QCDs after a death \(v6\.32\)$/m.test(MD));
    T("G-12 METHODOLOGY: the ladder's taper year is no longer \"the plan's own retirement year (`rothLadderStart`)\"", MD.length > 0 && !MD.includes("the plan's own retirement year (`rothLadderStart`)"));
    T("G-13 Ask AI's context (AST): the conversion years run from the selected year", /Roth conversions \$\{retireYear\}-\$\{_aiTL\.rothLadderEnd\}/.test(SRC) && !/Roth conversions \$\{_aiTL\.rothLadderStart\}/.test(SRC));
  } else {
    T(`G-8 ${KQ}: the Taxes tab discloses the approximation (survivor years test the older age; the IRMAA tab allows both caps)`, anyStr("survivor years are approximated"));
    T(`G-13 ${KF}: Ask AI's context names the target year's window`, /Roth conversions \$\{_aiTL\.rothLadderStart\}/.test(SRC));
  }
}

// ════ the DOM ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const D = await domHarness();
const examplePortfolio = async () => { await D.seed(); await D.click([...D.body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await D.flush(); return clone(D.DG.PORTFOLIO()); };
const EXP = await examplePortfolio();
const EXE = clone(D.DG.EXPENSES());
const seedPlan = async P => { await D.seed(P, EXE); for (let i = 0; i < 3; i++) await D.flush(); return D.DG.PLAN_TIMELINE(); };
const between = (t, a, b) => { const i = t.indexOf(a); if (i < 0) return ""; const j = b ? t.indexOf(b, i + a.length) : -1; return t.slice(i, j < 0 ? i + 1500 : j); };
const money = n => "$" + Math.round(n).toLocaleString();
const mkP = o => ({ ...clone(EXP), ...o });
const swapSS = P => { const p = clone(P); const a = p.incomeSources.ssA, b = p.incomeSources.ssB;
  [a.planned, b.planned] = [b.planned, a.planned]; [a.tableByAge, b.tableByAge] = [b.tableByAge, a.tableByAge]; return p; };

// ── §B (rendered) · the Stress tab on five plans (v6.32 leg) ──────────────────────────────────────────────────────────────────────────
if (POST) {
  const streamsAt = (P, yr, aliveA, aliveB) => (P.incomeStreams || []).reduce((s, x) => { const amt = +x.monthly || 0; if (amt <= 0) return s;
    if (yr < (+x.startYear || 0) || yr > (+x.endYear || 9999)) return s; if (x.owner === "A" && !aliveA) return s; if (x.owner === "B" && (!aliveB || P.single)) return s; return s + amt; }, 0);
  const BP = [["the example", EXP], ["the example made single", mkP({ single: true })], ["the two benefits swapped", swapSS(EXP)],
    ["a tie in the early run (A 1964, B 1960 to 74 — both 2034)", mkP({ dobA: "1964-01-01", dobB: "1960-01-01", lifeExpA: 90, lifeExpB: 74 })],
    ["A past 70 at the as-of date (A 1950)", mkP({ dobA: "1950-03-01", lifeExpA: 92 })],
    ["B's plan-to year first (A 1964 to 92, B 1954 to 74)", mkP({ dobA: "1964-01-01", dobB: "1954-01-01", lifeExpA: 92, lifeExpB: 74 })]];
  for (const [lab, P] of BP) {
    const tl = await seedPlan(P), R = tl.targetRetireYear;
    await D.go("stress"); await D.waitFor(() => /Scenario 3: LTC events/.test(D.txt()) && !/RUNNING STRESS TESTS/.test(D.txt()), 600000);
    const t = D.txt(), x = exFacts(tl, R), nA = tl.nameA || "Spouse A", nB = P.nameB || "Spouse B";
    const s3 = between(t, "Scenario 3: LTC events", "Scenario 4: LTC marathon"), s4 = between(t, "Scenario 4: LTC marathon", "Sequence-of-returns stress test");
    const early = between(t, `${nA} dies at 70 (`, "30-YEAR GUARDRAIL BOUNDARIES");
    T(`B-2 ${lab}: the Stress tab rendered its cards`, s3.length > 0 && s4.length > 0 && early.length > 0);
    // the four headers, from SCENARIOS and the household
    const SC = D.DG.SCENARIOS(), pc = v => `${(v * 100).toFixed(0)}%`;
    const heads = [`US ${pc(SC.crisis.equity)}, intl ${pc(SC.crisis.intl)}, Yr 1`, `${(SC.stagflation.inflation * 100).toFixed(1)}% infl, 3yr`,
      x.ltc.count > 0 ? `$150–300K × ${x.ltc.count}` : "no charge in the run", tl.single ? "2y pre-death, 35yr" : "2y+4y pre-death, 35yr"];
    T(`B-3 ${lab}: the column headers come from SCENARIOS and the household (${heads.join(" · ")})`, heads.every(h => t.includes(h)) && t.includes("Success (>$1.5M)"), heads.filter(h => !t.includes(h)).join(" | "));
    // Scenario 3 — each charge year, or why there is none
    const one = (c, n, age) => c.inside ? `${n} in ${c.yr} (age ${age})` : `${n} at ${age} (${c.yr}) — none`;
    T(`B-4 ${lab}: Scenario 3 names each charge's year and age, or says there is none`, s3.includes(one(x.ltc.A, nA, 78)) && (x.single || s3.includes(one(x.ltc.B, nB, 82))), s3.slice(0, 400));
    T(`B-5 ${lab}: Scenario 3 is one-time charges, not a cost spread over years; ${tl.single ? "one person" : "one per person"}`,
      s3.includes(tl.single ? "One care cost, charged once" : "One care cost per person, each charged once") && s3.includes("in today's dollars and grown with that path's inflation") && !/over \d+[–-]\d+ years/.test(s3));
    if (tl.single) T(`B-6 ${lab}: the single plan's care cards never name spouse B`, !s3.includes("Spouse B") && !s4.includes("Spouse B"), (s3 + s4).slice(0, 300));
    // the early-death half
    if (x.single) {
      T(`B-7 ${lab}: the run ends at A's death, and the success rate is what is left then`, early.includes("For a single plan the run ends at that death") && early.includes(`Left above $500K at ${nA}'s death`) && !/ is alone from /.test(early), early.slice(0, 300));
    } else {
      const e = x.early, sv = e.survivorIsA ? nA : nB, dc = e.survivorIsA ? nB : nA;
      const want = e.first === "both" ? `both die that year: no years alone` : e.first === "B" ? `${nB} dies first and ${nA} is alone from ${e.from} until dying at 70 in ${e.dA}: ${e.alone} years`
        : e.from > e.dA ? `so this run has ${nB} alone from the start until ` : `${nB} is alone from ${e.dA} until `;
      T(`B-7 ${lab}: the years alone are computed — ${e.alone} (min(second death, run end) − max(first death, as-of year))${e.first === "B" ? "; A is the survivor" : ""}`,
        early.includes(want) && (e.first === "both" || new RegExp(`: ${e.alone} years?\\b`).test(early)), early.slice(0, 400));
      if (e.alone > 0) T(`B-8 ${lab}: the survivor keeps the larger claimed benefit, and the run includes the LTC charges`,
        early.includes("The survivor keeps the larger of the two claimed Social Security benefits") && early.includes("the run includes Scenario 3's one-time care charges"));
      else T(`B-8 ${lab}: no years alone, so no survivor sentence — the run still includes the LTC charges`,
        !early.includes("The survivor keeps") && early.includes("The run includes Scenario 3's one-time care charges") && !/income after/.test(early), early.slice(0, 300));
      if (e.alone === 0) continue;
      const ss = Math.max(P.incomeSources.ssA.planned, P.incomeSources.ssB.planned), pen = (P.incomeSources.pension && P.incomeSources.pension.amount) || 0;
      const str = Math.round(streamsAt(P, e.from, e.survivorIsA, !e.survivorIsA)), tot = ss + pen + str;
      const line = between(early, `${sv}'s income after ${dc}'s death`, "The rest of spending");
      T(`B-9 ${lab}: the income line is ${sv}'s — Social Security ${money(ss)} (the larger) + pension ${money(pen)}${str ? ` + other ${money(str)}` : ""} = ~${money(tot)}/mo`,
        line.includes(`Social Security ${money(ss)}/mo`) && line.includes(`~${money(tot)}/mo`) && (pen === 0 || line.includes(`pension ${money(pen)}/mo`)), line);
    }
  }
}

// ── §B2 · the Social Security tab's survivor grid (both legs) ─────────────────────────────────────────────────────────────────────────
console.log("  B2 — the survivor grid");
{
  // SSA's early-claim reduction and delayed credit, typed here: 5/9 of 1% a month for the first 36 months early, 5/12 beyond; 2/3 of 1% a month late.
  const atAge = (fra, age) => { const m = (age - 67) * 12; if (m < 0) { const e = -m; return Math.round(fra * (1 - (Math.min(e, 36) * 5 / 9 + Math.max(0, e - 36) * 5 / 12) / 100)); } return m > 0 ? Math.round(fra * (1 + m * 2 / 3 / 100)) : fra; };
  for (const [lab, P] of [["the example", EXP], ["the two benefits swapped", swapSS(EXP)]]) {
    await seedPlan(P); await D.go("ss"); await D.flush(200);
    const t = D.txt(), fraA = P.incomeSources.ssA.tableByAge[67], bOwn = atAge(P.incomeSources.ssB.tableByAge[67], P.incomeSources.ssB.plannedAge || 67);
    const cells = [62, 67, 70].map(a => { const m = t.match(new RegExp(`CLAIM ${a === 67 ? "FRA \\(67\\)" : a}\\$([\\d,]+)`)); return m ? +m[1].replace(/,/g, "") : null; });
    const wantNew = [62, 67, 70].map(a => Math.max(atAge(fraA, a), bOwn)), wantOld = [62, 67, 70].map(a => atAge(fraA, a));
    const moves = wantNew.some((v, i) => v !== wantOld[i]);
    if (POST) {
      T(`B2-1 ${lab}: each cell is the larger of A's benefit at that claim age and B's own (${wantNew.map(money).join(", ")})`, cells.every((c, i) => c === wantNew[i]), cells.join(", "));
      T(`B2-2 ${lab}: the sentence names what B keeps if A dies first`, t.includes(`if ${P.nameA || "Spouse A"} dies first: ${P.nameB || "Spouse B"} keeps ${money(Math.max(atAge(fraA, 67), bOwn))}/mo`), between(t, "At selected age", "PORTFOLIO DRAW").slice(0, 300));
      if (moves) T(`B2-3 ${lab}: B's own benefit is the larger, so delaying A's claim to 70 changes nothing — and the tab says so`, t.includes("would not change it"));
    } else T(`B2-1 ${lab}${moves ? " " + KF : ""}: each cell is A's benefit alone (${wantOld.map(money).join(", ")})`, cells.every((c, i) => c === wantOld[i]), cells.join(", "));
  }
}

// ── §C · the Roth tab's ladder start (both legs) ──────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the Roth ladder starts at the selected year");
{
  const rothCard = () => { const c = [...D.body().querySelectorAll("div.card")].find(x => /ROTH CONVERSION STRATEGY/.test(x.textContent || "")); return c ? sq(c.textContent) : ""; };
  const pick = async tag => { const b = [...D.body().querySelectorAll("button.rbtn")].find(x => (x.textContent || "").includes(tag)); await D.click(b); await D.flush(200); return !!b; };
  const noConvA = (tl, start, tc) => { const c = tc.carryStartBalances(tc.retireStartBalances(start), tc.planDollarFactor(start, tl.asOfYear)); const age = tc.rmdStartAge(tl.dobA.year), yr = tl.dobA.year + age;
    const G0 = +(SRC.match(/const BASE_GROWTH = ([0-9.]+);/) || [0, NaN])[1]; return Math.round(c.tradInitA * Math.pow(1 + G0, Math.max(0, yr - start)) * (1 - c.annShareA) / tc.rmdDivisor(age)); };
  const tl = await seedPlan(EXP), T0 = tl.targetRetireYear, END = tl.rothLadderEnd, TC = { ...window.__test, ...window.__g };
  for (const [tag, off] of [["+1 YEAR", 1], ["-1 YEAR", -1]]) {
    await D.go("roth"); const picked = await pick(tag); await D.go("roth"); await D.flush(200);
    const card = rothCard(), sel = T0 + off, start = POST ? sel : T0;
    const head = (card.match(/ROTH CONVERSION STRATEGY — (\d{4})–(\d{4})/) || []).slice(1).map(Number);
    const yrs = +((card.match(/Total conversion \((\d+) yr\)/) || [])[1]);
    const nA = (tl.nameA || "A").split(" ")[0], rmd = +(((card.match(new RegExp(`${nA}: \\$([\\d,]+) at \\d+ \\(\\d{4}\\)`)) || [])[1] || "").replace(/,/g, ""));
    T(`C-1 ${tag}${POST ? "" : " " + KF}: the heading and the year count start at ${start}${POST ? " (the selected year)" : ` — the target year, though ${sel} is selected`}`,
      picked && head[0] === start && head[1] === END && yrs === END - start + 1, `${head.join("–")} · ${yrs} yr`);
    T(`C-2 ${tag}${POST ? "" : " " + KF}: the RMD card's no-conversion figure is seeded at ${start}`, rmd === noConvA(tl, start, TC), `${rmd} vs ${noConvA(tl, start, TC)}`);
    if (POST) {
      await D.go("ask AI"); await D.waitFor(() => !!D.pre(), 120000);
      T(`C-3 Ask AI's context names the selected year's conversion window at ${tag}`, (D.pre() || "").includes(`Roth conversions ${sel}-${END} at $70,000/yr`), (D.pre() || "").match(/Roth conversions[^.]*/));
    }
    await D.go("roth"); await pick("PLANNED");
  }
  if (POST) {
    // past the window: a plan retiring in the window's last year, at +1
    const tl2 = await seedPlan(mkP({ retireYear: tl.rothLadderEnd }));
    await D.go("roth"); await pick("+1 YEAR"); await D.go("roth"); await D.flush(200);
    const c2 = rothCard(), nA = (tl2.nameA || "A").split(" ")[0];
    const no = (c2.match(new RegExp(`NO CONVERSION \\(each at their own age\\)${nA}: \\$([\\d,]+)`)) || [])[1], wi = (c2.match(new RegExp(`CONVERSION${nA}: \\$([\\d,]+)`, "g")) || []);
    T(`C-4 a plan retiring in ${tl2.rothLadderEnd} at +1: "no conversion years", 0 years, and the RMD cards unchanged by conversion (reduced by $0)`,
      c2.includes(`no conversion years: the selected retirement year, ${tl2.rothLadderEnd + 1}, is after the last one (${tl2.rothLadderEnd})`) && c2.includes("Total conversion (0 yr)") && c2.includes("Combined RMDs reduced by $0/yr"), c2.slice(0, 300));
    await pick("PLANNED");
    // the review's case: +1 selected after spouse A's own window (A 1958 — RMDs at 73 in 2031; B 1966), retiring 2030. A converts nothing,
    // so A's with-conversion RMD card must equal A's no-conversion card (through the build's first draft it read a balance from 2040).
    const tl3 = await seedPlan(mkP({ dobA: "1958-01-01", retireYear: 2030 }));
    await D.go("roth"); await pick("+1 YEAR"); await D.go("roth"); await D.flush(200);
    const c3 = rothCard(), n3 = (tl3.nameA || "A").split(" ")[0];
    const no3 = (c3.match(new RegExp(`NO CONVERSION \\(each at their own age\\)${n3}: \\$([\\d,]+)`)) || [])[1], wi3 = (c3.match(new RegExp(`/YR CONVERSION${n3}: \\$([\\d,]+)`)) || [])[1];
    T(`C-6 +1 after spouse A's window (2031 > ${tl3.rothLadderEndA}): A's with-conversion RMD equals the no-conversion one ($${no3})`, !!no3 && no3 === wi3, `${no3} vs ${wi3}`);
    await pick("PLANNED");
    // the target year: byte-identical to the v6.31 leg's Roth card. BOTH sides render in a fresh child process from the example's own button:
    // in this process the DOM bundle's module state carries the last seeded plan into the landing screen (a harness artifact — the app's own
    // routes to that screen reset the plan to the defaults first), so a same-process render would compare different plans.
    const dumpOf = v => { const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), v, "--roth-dump"], { cwd: HERE, encoding: "utf8", timeout: 900000, maxBuffer: 1 << 26 });
      const m = (ch.stdout || "").match(/^ROTH_DUMP (.*)$/m); return m ? JSON.parse(m[1]) : null; };
    // v6.33: the comparison needs v6.31's DOM bundle, which only a v6.31 → v6.32 run folder builds. In a later release's run (v6.32 → v6.33,
    // where neither leg is v6.31) it prints a skip — as t93 §D did for its v6.29 reference — rather than reading the absent bundle as a fail.
    if (existsSync(join(HERE, "dom_v631.cjs"))) {
      const mine = dumpOf(VER), theirs = dumpOf("v631");
      T("C-5 at the target year the Roth tab's ladder card is byte-identical to v6.31's (two child processes)", !!mine && !!theirs && theirs === mine && /ROTH CONVERSION STRATEGY — 2029–2040/.test(mine),
        !mine || !theirs ? "a child printed nothing" : `${mine.length} vs ${theirs.length} chars`);
    } else console.log("    (C-5 skipped: this run folder has no dom_v631.cjs — a later release's run)");
  }
}

// ── §D · the Backtest's worst start year (both legs) ──────────────────────────────────────────────────────────────────────────────────
console.log("  D — the Backtest's worst start year");
{
  const scale = (P, k) => { const p = clone(P); p.positions.forEach(q => { for (const f of ["balance", "trad", "roth"]) if (typeof q[f] === "number") q[f] *= k; });
    (p.otherAccounts || []).forEach(a => a.balance *= k); p.total401k *= k; p.household *= k; return p; };
  const read = () => { const t = D.txt(); const m = t.match(/Worst start year(\d{4})(ended \$([\d.]+)M real|depleted (\d{4}))/);
    const named = [...t.matchAll(/(\d{4}) — [^$]*?(YES|NO)\$[\d.]+M\$[\d.]+M(\d{4}|—)/g)].map(x => ({ yr: +x[1], dep: x[3] === "—" ? null : +x[3] }));
    const h = t.match(/this plan's worst — the start that runs out soonest, or if none runs out, the lowest real end balance — is (\d{4})/);
    return { yr: m ? +m[1] : null, dep: m && m[4] ? +m[4] : null, named, head: h ? +h[1] : null, t }; };
  for (const [lab, P] of [["the example", EXP], ["the example made single", mkP({ single: true })], ["balances × 0.3 (several starts run out)", scale(EXP, 0.3)]]) {
    await seedPlan(P); await D.go("backtest"); await D.flush(300);
    const r = read(), depNamed = r.named.filter(n => n.dep !== null), soonest = depNamed.length ? Math.min(...depNamed.map(n => n.dep)) : null;
    T(`D-1 ${lab}: the card and the named-year table rendered (${r.named.length} named years)`, r.yr !== null && r.named.length === 7, r.t.slice(0, 120));
    if (POST) {
      T(`D-2 ${lab}: the header sentence names the card's year (${r.yr})`, r.head === r.yr, `${r.head}`);
      if (soonest !== null) T(`D-3 ${lab}: the card's start runs out no later than any named start that runs out (${r.dep} ≤ ${soonest}), and is the earliest named start among those tied`,
        r.dep !== null && r.dep <= soonest && (r.dep < soonest || r.yr <= Math.min(...depNamed.filter(n => n.dep === soonest).map(n => n.yr))), `${r.yr} → ${r.dep}`);
    } else if (soonest !== null) {
      T(`D-3 ${lab} ${KF}: the card keeps an earlier start that runs out LATER (${r.yr} → ${r.dep}) than a named start (${soonest})`, r.dep !== null && r.dep > soonest, `${r.yr} → ${r.dep}`);
    }
    if (POST) T(`D-4 ${lab}: no "generally considered", "worst US start", "best case" or "(the stress case)" on the tab`, !/generally considered|worst US start|best case|\(the stress case\)/.test(r.t));
  }
}

// ── §G (rendered) · the Taxes tab's QCD line (v6.32 leg) ──────────────────────────────────────────────────────────────────────────────
if (POST) {
  for (const [lab, P] of [["the example", EXP], ["the example made single", mkP({ single: true })]]) {
    const tl = await seedPlan(P); await D.go("taxes"); await D.flush(300);
    const t = D.txt(), d1 = Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
    if (tl.single) T(`G-14 ${lab}: the QCD line names no survivor, and one cap`, !/only the survivor may give/.test(t) && t.includes("per eligible person ($111K here)"));
    else T(`G-14 ${lab}: the QCD line says from ${d1} only the survivor may give, and two caps only while both live`,
      t.includes(`from the year of the first projected death (${d1}) only the survivor may give, from the year the survivor turns 71, with one person's cap`) && t.includes("($222K here while both spouses live; $111K for the survivor)"));
  }
}

// ════ the DOM harness (t94's, without the recording fetch) ══════════════════════════════════════════════════════════════════════════
async function domHarness() {
  const PREFIX = "dc:";
  window.confirm = () => true;
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  const grab = () => "blob:t95"; window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
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
  return { DG, body, txt, btn, go, seed, flush, click, waitFor, pre, unmount, el: () => el, act: () => act };
}

finished = true;
console.log(`\nt95 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
