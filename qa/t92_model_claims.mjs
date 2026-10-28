// t92_model_claims.mjs — v6.29 (F-25; docs/SCOPE_F25_MODEL_CLAIMS_V629.md): what the app says about its own model.
//
// WHAT IT PINS. Through v6.28 many sentences the app writes about its own model were false or imprecise against the code (the scope's ledger,
// docs/F25_LEDGER_V628.tsv, 326 rows). Several were verdicts typed once and printed for every plan — the Stress tab's "recovers to pre-crash
// levels by Year 4–5", the Backtest's "almost no historical sequence breaks the plan", What Breaks' "demands far worse than the worst of
// history" with history figures that the app's own 1928–2025 data contradicts. Others named the wrong default preset, the wrong headline test
// ("your savings lasted"), the wrong list of what Ask AI sends, or claimed the Verify tab checks "every statutory constant" while six AMT figures
// went unchecked. Four figures were computed wrongly for display: the Income tab's gap draw (spouse B's Social Security subtracted for every
// gap month), the mortgage what-if (Bull's return for every preset, a negative number before "pts lower"), Field Manual Example 2, and the
// Stress recovery. From v6.29 each is reworded to what the code does, or computed for the plan (DF-1 to DF-11, all as recommended).
//
// Both legs: node t92_model_claims.mjs v628 | node t92_model_claims.mjs v629. The v6.28 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-22, F-25]. Module-level checks run in a child process (--module) on the app module; the rendered checks mount the
// DOM bundle, with Math.random seeded before the bundle loads and re-seeded before each plan (t11's TRAP 1).
// §A's extinction list is exact phrases, read by AST from every string in the source (the two AI-addressed texts and §13's release entries
// excepted, as t91 does). It shows the sentences are gone; it cannot show the replacements read well — the release had them drafted against
// the code by agents that had not written the scope, and reviewed one by one.
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v629";
const KNOWN_VERSIONS = ["v628", "v629", "v630", "v631", "v632", "v633", "v634"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v629", "v630", "v631", "v632", "v633", "v634"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-22, F-25 — flips at v6.29]";

// ══ CHILD MODE (--module): the module-level facts — events, Verify, the history and preset helpers, the Stress recovery ══
if (process.argv.includes("--module")) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
  const G = M.__g, X = M.__test;
  const { build } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
  const reset = () => G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)) });
  const out = {};
  const evs = d => (X.computePlanEvents(d) || []).map(e => ({ key: e.key, title: e.title, when: e.when, instructions: e.instructions }));
  out.evExample = evs(new Date(2027, 0, 5, 12));
  out.tlExample = (() => { const t = G.PLAN_TIMELINE(); return { dobA: t.dobA.year, dobB: t.dobB.year, nameA: G.PORTFOLIO().nameA, nameB: G.PORTFOLIO().nameB,
    rmdAgeA: t.rmdAgeA, rmdAgeB: t.rmdAgeB, retire: t.targetRetireYear }; })();
  G.applyLoadedData({ portfolio: build(G, "single") }); out.evSingle = evs(new Date(2027, 0, 5, 12)); reset();
  // Verify: the count, and AMT coverage BY MUTATION — each TAX_CONSTS key naming AMT, doubled, must turn some check red
  const checks = G.buildVerificationChecks();
  out.verifyN = checks.length; out.verifyFail = checks.filter(c => !c.pass).map(c => c.name);
  const TC = G.TAX_CONSTS();
  out.amtKeys = Object.keys(TC).filter(k => /AMT/.test(k));
  out.amtCovered = out.amtKeys.map(k => { const v = TC[k]; TC[k] = v * 2; const red = G.buildVerificationChecks().filter(c => !c.pass).length; TC[k] = v; return { k, red }; });
  out.verifyAfter = G.buildVerificationChecks().filter(c => !c.pass).length;
  // the helpers (v6.29 only)
  out.has = { stressRecovery: typeof X.stressRecovery === "function", hist: typeof X.historicalWorstRealWindow === "function",
    preset: typeof X.presetExpectedRealEquity === "function", port: typeof X.presetExpectedPortfolioReturn === "function" };
  out.H = G.HISTORICAL_RETURNS();
  if (out.has.hist) { out.w10 = X.historicalWorstRealWindow(10); out.w20 = X.historicalWorstRealWindow(20); out.w30 = X.historicalWorstRealWindow(30); out.c2932 = X.historicalCumReturn(1929, 1932); }
  out.PP = G.PROB_PRESETS(); out.SC = G.SCENARIOS(); out.DEF = X.DEFAULT_SCENARIO_PRESET;
  if (out.has.preset) out.realEq = Object.fromEntries(Object.keys(out.PP).map(k => [k, X.presetExpectedRealEquity(k)]));
  if (out.has.port) { out.ba = G.PORTFOLIO().bucketActuals; out.portRet = Object.fromEntries(Object.keys(out.PP).map(k => [k, X.presetExpectedPortfolioReturn(k, out.ba)])); }
  // the Stress recovery: each run's own median series, and the helper's verdict on it, for the example under two presets and for plans
  // retiring 10 and 16 years out (a short post-crash window, and no crash inside the 15-year run)
  out.stress = [];
  if (out.has.stressRecovery) {
    const snapYears = (n, tl) => Array.from({ length: n }, (_, y) => y === 0 ? tl.asOf.year : G.mcQuarterDate(tl, 4 * y - 1).calYear);
    for (const [label, preset, shift] of [["example/bull", "bull", 0], ["example/historical", "historical", 0], ["late10/bull", "bull", 10], ["late16/bull", "bull", 16]]) {
      if (shift) { const P = JSON.parse(JSON.stringify(BASE)); P.retireYear = G.PLAN_TIMELINE().targetRetireYear + shift; if (P.retireYearB) P.retireYearB = P.retireYear;
        P.lifeExpA = (P.lifeExpA || 90) + shift; P.lifeExpB = (P.lifeExpB || 90) + shift; G.applyLoadedData({ portfolio: P }); }
      G.applyScenarioProbs(out.PP[preset].probs);
      const tl = G.PLAN_TIMELINE(), ry = tl.targetRetireYear;
      const run = G.runStressTests(ry).aiBubble;
      out.stress.push({ label, ry, p50: run.pctByYear.p50, years: snapYears(run.pctByYear.p50.length, tl), rec: X.stressRecovery(run, ry) });
      G.applyScenarioProbs(out.PP[out.DEF || "bull"].probs);
      if (shift) reset();
    }
  }
  console.log("MODULE:" + JSON.stringify(out));
  process.exit(0);
}

// ── TRAP 1 (t11's; do not "simplify" away): seed Math.random BEFORE the bundle loads — d3-random captures it at module load ──
let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };
const reseed = () => { _s = 123456789; };

const require = createRequire(import.meta.url);
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 500) : ""}`); } };
const EQ = (n, got, want) => T(n, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
process.on("exit", () => { if (!finished) { console.log(`t92 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

const noop = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => "" });
window.fetch = noop; globalThis.fetch = noop;
window.confirm = () => true;
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
window.URL.createObjectURL = () => "blob:t92"; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = () => "blob:t92"; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};

// ── the module child first (no DOM state shared) ───────────────────────────────────────────────────────────────
const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--module"], { cwd: HERE, encoding: "utf8", timeout: 900000, env: { ...process.env }, maxBuffer: 64 * 1024 * 1024 });
const mLine = (ch.stdout || "").split("\n").find(l => l.startsWith("MODULE:"));
const MD = mLine ? JSON.parse(mLine.slice(7)) : null;

require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const { JSDOM } = require("jsdom");

// ── the source, by AST (t91's reader) ───────────────────────────────────────────────────────────────────────
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) all(c, pred, out); return out; };
const topDecl = name => AST.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const DOCS = (() => { const d = topDecl("DOCS_HTML"); return d && d.init.type === "Literal" ? d.init.value : ""; })();
const srcOf = n => n ? SRC.slice(n.start, n.end) : "";
const SKIP_DECL = new Set(["DEFAULT_MASTER_PROMPT", "AI_GROUND_RULES"]);
const HIST = /<li><strong>[^<]*\(v\d+\.\d+\)\.<\/strong>[\s\S]*?<\/li>/g;
// every user-facing text piece: string literals, template pieces and JSX text — DOCS_HTML with its release entries removed
const TEXTS = (() => { const out = []; const vis = (n, inPP) => { if (!n || typeof n.type !== "string") return;
  if (n.type === "VariableDeclarator" && n.id && SKIP_DECL.has(n.id.name)) return;
  if (n.type === "Literal" && typeof n.value === "string") out.push({ v: n.value.startsWith("<!doctype html>") ? n.value.replace(HIST, "") : n.value, fm: n.value.startsWith("<!doctype html>"), pp: inPP });
  else if (n.type === "TemplateElement") out.push({ v: n.value.cooked || "", fm: false, pp: inPP });
  else if (n.type === "JSXText") out.push({ v: n.value.replace(/\s+/g, " "), fm: false, pp: inPP });
  const pp = inPP || (n.type === "VariableDeclarator" && n.id && n.id.name === "PROB_PRESETS");
  for (const c of kids(n)) vis(c, pp); }; vis(AST, false); return out; })();
const NS = s => String(s).replace(/\s+/g, " ");
const inSrc = p => TEXTS.some(t => NS(t.v).includes(NS(p)));
const METH = (() => { const p = join(HERE, "..", "METHODOLOGY.md"); return existsSync(p) ? readFileSync(p, "utf8") : ""; })();
const fmText = new JSDOM(DOCS).window.document.body.textContent.replace(/\s+/g, " ");

console.log(`t92 — WHAT THE APP SAYS ABOUT ITS OWN MODEL (${VER})`);
T("0-1: SETUP — the module child ran and reported", !!MD, (ch.stderr || "").slice(-400) || (ch.stdout || "").slice(-200));
T("0-2: SETUP — the Field Manual, METHODOLOGY and the source's text pieces are read", DOCS.length > 100000 && METH.length > 100000 && TEXTS.length > 5000, `${DOCS.length} / ${METH.length} / ${TEXTS.length}`);

// ══ A · extinction by AST, the preset names, and the Verify tab's AMT coverage ═══════════════════════════════════════════════
console.log("  A — the replaced sentences, the preset names, the Verify tab");
// [exact phrase in v6.28, what it claimed]
const GONE = [
  ["Median portfolio recovers to pre-crash levels by Year 4–5", "Stress: a fixed recovery verdict (1159) — on the example the median never recovers within the run"],
  ["almost no historical sequence breaks the plan", "Backtest: printed for every plan (1076)"],
  ["was about −3.4%/yr real", "What Breaks: the worst decade (2000–09) — the app's own data has 1999–2008 at −3.8% (1099)"],
  ["in 150+ years of data", "What Breaks: the app holds 98 years (1099)"],
  ["so expect these edges to be far away", "What Breaks: an inference printed for every rate (1106)"],
  ["your conservative BASE scenario at work", "Backtest: names BASE, not the default (1071)"],
  ["Remember: the BASE prior is deliberately conservative", "Dashboard: names BASE (A)"],
  ["Switch the scenario prior to BULL-LEANING for history-like assumptions", "FAQ: points a default user at the preset already selected (1794)"],
  ["For history-like output, use BULL-LEANING", "Modeling approach: HISTORICAL is the history preset (1527)"],
  ["where another tool might show 95%", "MC tab: a claim about other tools (989)"],
  ["Boldin/ProjectionLab/Pralana", "Field Manual: a claim about named tools (1527)"],
  ["lower than most mainstream retirement calculators", "MC tab: a claim about other tools (987)"],
  ["your savings lasted in about 9,000 of them", "Field Manual: success is ending above $800K, not lasting (1479)"],
  ["Every statutory constant the math depends on is asserted against its primary source", "Verify: six AMT figures were unchecked (252)"],
  ["re-sample on every visit", "Verify: the longevity check is fixed-seed (252)"],
  ["defaults to <strong>Traditional</strong>, which over-taxes", "§13: an unclassified name defaults to Taxable (1746)"],
  ["One smaller term is still missing", "§13: the ladder's MAGI misses two terms (1749)"],
  ["an example value was substituted", "FAQ: a missing figure is paid $0 (1790)"],
  ["Roth conversions have no withholding", "Events: withholding is elective (W-4R) (88)"],
  ["CONFIRM THE MONEY WORKS", "Exit Plan: a verdict the model does not give (DF-11)"],
  ["nothing leaves this browser", "privacy: the fonts request; Ask AI sends a summary (161, C)"],
  ["Variance comes mostly from regime-switching", "MC description: the noise supplies more of a balanced mix's variance (1523)"],
  ["picking a year-type each turn captures that far better", "MC description: each year is drawn independently (1524)"],
  ["slow bracket growth overstates taxes, the conservative direction", "Taxes tab: the dollar basis runs both ways (DF-7)"],
  ["the model's conservative ~4.5% return", "mortgage what-if: Bull's figure for every preset (1011)"],
  ["the legal default", "SS tab: no statute sets the post-depletion level (390)"],
  ["$810-per-$1,000", "SS tab: unsourceable (390)"],
  ["never appear on your tax return", "QCDs are reported on line 4a (1582)"],
  ["≈1.5% for stock index funds", "the index yield is about 1% (1582)"],
  ["the first $5 also raises your rate limit", "rate limits rise with usage history (1646)"],
  ["roughly ¾ of a word", "a token is about 3½ characters (1650)"],
  ["SAME-ISH TOTAL COST", "FIG.6: the marathon is the larger total"],
  ["All Americans — average (SCF)", "Ranking: the SCF savings figures cover families with retirement accounts"],
  ["carries no dividend or interest income", "NJ note: the base carries the taxable yield"],
  ["but NOT dividends or interest", "CT note: the base carries the taxable yield"],
  ["estimated quarterly taxes during conversion years", "Events: dated in every retirement year (DF-10)"],
  ["sixteen for a two-person household", "Events: seventeen with spouse B's RMD (DF-6)"],
  ["points at the authoritative source (irs.gov", "Events: three events point at a source (1624)"],
  ["Treasury-level credit quality", "glossary: only Ginnie Mae is U.S.-guaranteed (1809)"],
  ["across most US periods", "glossary: Bengen found every period tested lasted 30 years (1807)"],
  ["a third of today's 65-year-olds will never need long-term-care support", "LTC: ASPE 2022 gives 44% (1537)"],
  ["standardized on a <strong>3-year benefit period", "LTC: unsourceable (1537)"],
  ["Typical LTC events run $300–600K", "What Breaks: $300K is about the mean for users of paid care (1094)"],
  ["1929–32 was ≈−80%", "What Breaks: the app's annual data gives about −65%"],
  ["Tech/AI crashes 40–50% in Year 1", "Stress: the model forces a crisis year, then a recession year"],
  ["Inflation 6–8% for 3 consecutive years", "Stress: the stagflation regime is 6.5%"],
  ["Income drops faster than spending — the survivor's portfolio draw rises", "Survivor: keyed to percentages, not the draw"],
  ["the post-2017 exemption keeps standard-deduction retirees out of AMT", "Taxes: large gains can still trigger AMT (869)"],
  ["often more than IRMAA", "Roth: unsourceable frequency (793)"],
  ["often $10,000–$25,000/yr", "ACA: unsourceable range (1589)"],
  ["yr after you retire — the model draws the gap", "Exit Plan: the gap counted in calendar years (DF-10)"],
  ["Riskalyze-style", "Stress tab: another product's name (build review)"],
  ["My success rate is far below other tools", "FAQ: a comparison with other tools (build review)"],
];
for (const [p, why] of GONE) {
  if (POST) T(`A-1: EXTINCTION — "${p.slice(0, 70)}" is gone (${why})`, !inSrc(p));
  else T(`A-1 ${KD}: "${p.slice(0, 70)}" is present (${why})`, inSrc(p));
}
// in-app sentences naming a preset: outside the Field Manual and the PROB_PRESETS table, no string types a preset's name as the default
const PRESET_RE = /BULL-LEANING|BASE prior|BASE scenario/;
const typed = TEXTS.filter(t => !t.fm && !t.pp && PRESET_RE.test(t.v)).map(t => t.v.replace(/\s+/g, " ").slice(0, 90));
if (POST) T("A-2: no in-app sentence types a preset's name (each reads PROB_PRESETS / DEFAULT_SCENARIO_PRESET)", typed.length === 0, typed.join(" | "));
else T(`A-2 ${KD}: in-app sentences type preset names (the Dashboard's "BASE prior", the MC notice's "BULL-LEANING", the Backtest's "BASE scenario")`, typed.length >= 3, typed.length);
// DF-9: the Field Manual cannot read the constant, so its typed mentions are pinned to it — changing the default fails here until rewritten
if (POST) {
  EQ("A-3: DF-9 — DEFAULT_SCENARIO_PRESET is \"bull\", the preset the Field Manual's typed mentions name", MD && MD.DEF, "bull");
  T("A-3b: the Field Manual names BULL-LEANING as the default and HISTORICAL as the history preset (its typed mentions, pinned by A-3)",
    /default BULL-LEANING prior/.test(fmText) && /The default prior, BULL-LEANING/.test(fmText) && /Switch the scenario prior to HISTORICAL/.test(fmText) && /use HISTORICAL\./.test(fmText));
} else T(`A-3 ${KD}: the FAQ says the low default comes from "The BASE prior"`, DOCS.includes("The BASE prior is deliberately conservative (see"));
// the Verify tab: 72 → 78, all green, and every TAX_CONSTS key naming AMT turns some check red when it moves
if (MD) {
  EQ("A-4: the Verify tab's check count", MD.verifyN, POST ? 78 : 72);
  T("A-4b: every check passes on the shipped constants", MD.verifyFail.length === 0, MD.verifyFail.join(", "));
  EQ("A-5: SETUP — TAX_CONSTS carries six AMT keys", MD.amtKeys.length, 6);
  const unc = MD.amtCovered.filter(x => x.red === 0).map(x => x.k);
  if (POST) T("A-5b: each AMT key is checked — doubling it turns a Verify check red", unc.length === 0, unc.join(", "));
  else T(`A-5b ${KD}: no AMT key is checked — doubling any of them leaves the tab green`, unc.length === 6, unc.join(", "));
  EQ("A-5c: the mutation is undone (the tab is green again)", MD.verifyAfter, 0);
}

// ══ B · the computed sentences — module facts, then rendered ═══════════════════════════════════════════════════════════
console.log("  B — the computed sentences");
const H = MD ? MD.H : [];
const realStk = r => (1 + r[1]) / (1 + r[4]) - 1, realBnd = r => (1 + r[2]) / (1 + r[4]) - 1;
const worst = (n, f) => { let w = null; for (let i = 0; i + n <= H.length; i++) { let g = 1; for (let j = i; j < i + n; j++) g *= 1 + f(H[j]); const c = Math.pow(g, 1 / n) - 1; if (!w || c < w.c) w = { s: H[i][0], e: H[i + n - 1][0], c }; } return w; };
const W10 = worst(10, realStk), W20 = worst(20, realStk), W30 = worst(30, realStk);
const bond = (() => { const i = H.findIndex(r => r[0] === 1941), k = H.findIndex(r => r[0] === 1981); let g = 1; for (let j = i; j <= k; j++) g *= 1 + realBnd(H[j]); return { cum: g - 1, ann: Math.pow(g, 1 / (k - i + 1)) - 1 }; })();
const c2932 = H.filter(r => r[0] >= 1929 && r[0] <= 1932).reduce((g, r) => g * (1 + r[1]), 1) - 1;
T("B-0: SETUP — the history table is 1928–2025, 98 years (independent windows computed here from it)", H.length === 98 && H[0][0] === 1928 && H[97][0] === 2025, H.length);
if (POST && MD) {
  T("B-1: historicalWorstRealWindow(10/20/30) equals the windows computed here", !!MD.w10 && MD.w10.start === W10.s && MD.w10.end === W10.e && Math.abs(MD.w10.cagr - W10.c) < 1e-12
    && MD.w20.start === W20.s && Math.abs(MD.w20.cagr - W20.c) < 1e-12 && MD.w30.start === W30.s && Math.abs(MD.w30.cagr - W30.c) < 1e-12, JSON.stringify([MD.w10, W10]));
  T("B-1b: historicalCumReturn(1929, 1932) equals the product computed here", Math.abs(MD.c2932 - c2932) < 1e-12, `${MD.c2932} vs ${c2932}`);
  // the Field Manual's typed history figures are the table's, at their rounding
  const fmHist = `the worst rolling <em>decade</em> for US stocks — ${W10.s}–${W10.e}`;
  T("B-2: the Field Manual's What Breaks note quotes the table's own windows (worst decade, 20- and 30-year windows, 98 years, bonds 1941–1981)",
    DOCS.includes(fmHist) && DOCS.includes(`about −${Math.abs(W10.c * 100).toFixed(1)}%/yr real`) && DOCS.includes(`the weakest, ${W20.s}–${W20.e}, earned about +${(W20.c * 100).toFixed(1)}%/yr`)
    && DOCS.includes(`the worst 30-year window, ${W30.s}–${W30.e}, about +${(W30.c * 100).toFixed(1)}%/yr`) && DOCS.includes("(1928–2025, 98 years of annual total returns")
    && DOCS.includes(`(about −${Math.abs(bond.ann * 100).toFixed(1)}%/yr real)`) && Math.abs(bond.cum + 0.5) < 0.05, `${W10.s}-${W10.e} ${W10.c} / ${W20.c} / ${W30.c} / ${bond.ann}`);
  // presets: the expected real equity return, Σ p·(equity − inflation), computed here from the tables
  const re = k => Object.entries(MD.PP[k].probs).reduce((s, [r, p]) => s + p * (MD.SC[r].equity - MD.SC[r].inflation), 0);
  T("B-3: presetExpectedRealEquity equals Σ p·(equity − inflation) for every preset", MD.has.preset && Object.keys(MD.PP).every(k => Math.abs(MD.realEq[k] - re(k)) < 1e-12));
  T("B-3b: the Field Manual's typed figures are BULL-LEANING's and HISTORICAL's (2.6% / 6.9%)", (re("bull") * 100).toFixed(1) === "2.6" && (re("historical") * 100).toFixed(1) === "6.9"
    && DOCS.includes("about 2.6% expected real equity return a year, against about 6.9% for the HISTORICAL preset"));
  const pr = k => Object.entries(MD.PP[k].probs).reduce((s, [r, p]) => { const S = MD.SC[r], w = MD.ba; return s + p * (w[1] * S.cash + w[2] * (S.bond + S.tips) / 2 + w[3] * S.equity + w[4] * S.hedge); }, 0);
  T("B-3c: presetExpectedPortfolioReturn equals the mix-weighted Σ computed here, for every preset", MD.has.port && Object.keys(MD.PP).every(k => Math.abs(MD.portRet[k] - pr(k)) < 1e-12));
  // the Stress recovery, against an independent reading of the same median series
  // the definition, stated independently: pre-crash = the last snapshot dated before the crash year; trough = the lowest snapshot dated in
  // the two forced years or the year after; recovery = the first later snapshot back at the pre-crash level
  const indep = s => { const n = s.p50.length, ry = s.ry; if (ry > s.years[n - 1] || ry < s.years[0]) return null;
    const before = s.years.map((yr, i) => [yr, i]).filter(([yr]) => yr < ry); const pk = before.length ? before[before.length - 1][1] : 0;
    const win = s.years.map((yr, i) => [yr, i]).filter(([yr, i]) => i > pk && yr >= ry && yr <= ry + 2).map(x => x[1]);
    if (!win.length) return null; const tr = win.reduce((a, i) => s.p50[i] < s.p50[a] ? i : a, win[0]);
    if (s.p50[tr] >= s.p50[pk]) return { noDrop: true, preVal: s.p50[pk] };
    for (let y = tr + 1; y < n; y++) if (s.p50[y] >= s.p50[pk]) return { recovered: true, recYear: s.years[y], preVal: s.p50[pk], preYear: s.years[pk], troughYear: s.years[tr] };
    return { recovered: false, preVal: s.p50[pk], preYear: s.years[pk], troughYear: s.years[tr], shortfallPct: (1 - s.p50[n - 1] / s.p50[pk]) * 100 }; };
  T("B-4: SETUP — four Stress runs were read (example under BULL and HISTORICAL; retiring 10 and 16 years later)", MD.stress.length === 4, MD.stress.length);
  for (const s of MD.stress) {
    const a = s.rec, b = indep(s);
    T(`B-4 ${s.label}: stressRecovery agrees with the independent reading of the run's median (trough, the peak before it, the first snapshot back at it)`,
      (a === null && b === null) || (a && b && (b.noDrop ? a.noDrop : (!a.noDrop && a.recovered === b.recovered && Math.abs(a.preVal - b.preVal) < 1e-6
        && (b.recovered ? a.recYear === b.recYear : Math.abs(a.shortfallPct - b.shortfallPct) < 1e-9)))), `${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  }
  T("B-4e: semantics — every pre-crash snapshot is dated before the crash year, and every trough inside the forced years or the year after",
    MD.stress.filter(s => s.rec).every(s => s.rec.preYear < s.ry && s.rec.troughYear >= s.ry && s.rec.troughYear <= s.ry + 2), MD.stress.map(s => s.rec && `${s.label}:${s.rec.preYear}/${s.rec.troughYear}`).join(" "));
  const sx = MD.stress.find(s => s.label === "example/bull"), sh = MD.stress.find(s => s.label === "example/historical"), s16 = MD.stress.find(s => s.label === "late16/bull");
  T("B-4b: on the example under the default prior the median does NOT regain its pre-crash peak within the run (the v6.28 sentence said Year 4–5)", !!sx && sx.rec && sx.rec.recovered === false, sx && JSON.stringify(sx.rec));
  T("B-4c: under HISTORICAL it does, and later than Year 5 counted from the crash", !!sh && sh.rec && sh.rec.recovered === true && sh.rec.years > 5, sh && JSON.stringify(sh.rec));
  T("B-4d: a plan retiring 16 years later has no crash inside the 15-year run — no sentence (null)", !!s16 && s16.rec === null, s16 && JSON.stringify(s16.rec));
} else if (MD) {
  T(`B-1 ${KD}: the helpers do not exist (the history figures and the recovery were typed)`, !MD.has.hist && !MD.has.stressRecovery && !MD.has.preset && !MD.has.port);
  T(`B-2 ${KD}: the typed history figures disagree with the app's own table (−3.4% for 2000–09 against ${W10.s}–${W10.e} at ${(W10.c * 100).toFixed(2)}%; "+2%" against ${(W20.c * 100).toFixed(2)}% from ${W20.s})`,
    DOCS.includes("2000–2009, the dot-com bust followed by the financial crisis — ran about −3.4%/yr real") && W10.s === 1999 && W20.c < 0.01);
}

// ── rendered ────────────────────────────────────────────────────────────────────────────────────────────────
let root = null, act, DangerClose, el;
const body = () => window.document.body;
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button")].find(b => (b.textContent || "").trim().toLowerCase() === name);
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); reseed();
  if (portfolio !== undefined) put("portfolio", portfolio); if (expenses !== undefined) put("expenses", expenses); await render(); };
const save = async () => { await go("my data"); await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 4; i++) await flush(); await flush(300); };
const blocks = () => { const out = []; const W = window.document.createTreeWalker(el, 4); let t; while ((t = W.nextNode())) { const s = t.nodeValue.replace(/\s+/g, " ").trim(); if (s && !s.startsWith("@import")) out.push(s); } return out; };
// a tab's text; waits (bounded) for a phrase the tab shows once its runs finish
// rendered text is read as text nodes joined by spaces, so a sentence built from JSX pieces gains spaces between them: compare without whitespace
const NW = s => String(s).replace(/\s+/g, "");
const has = (txt, p) => NW(txt).includes(NW(p));
const tabText = async (name, ready = null) => { await go(name); await flush(200);
  if (ready) for (let i = 0; i < 400 && !ready.test(blocks().join(" ")); i++) await flush(250);
  const b = blocks(); const i = b.indexOf("◑ SHOW FEWER TABS"); const tb = i >= 0 ? b.slice(i + 1) : b;
  return tb.join(" ").replace(/\s+/g, " ").replace(/DANGER CLOSE v\d\.\d+ │.*$/, ""); };

const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true, workRowsV623: true });
// t91's couple, with A born a year later (A's 65th birthday falls in June of the retirement year) and B retiring a year after A
const late = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1966-06", dobB: "1967-06", retireYear: 2031, retireYearB: 2032, lifeExpA: 90, lifeExpB: 92,
  stateName: "Ohio", stateCode: "OH", stateTaxRate: 0.03, total401k: 900000, household: 1000000,
  positions: [{ ticker: "VTI", name: "Total Market", balance: 600000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" },
              { ticker: "BND", name: "Total Bond", balance: 300000, bucket: 2, type: "bond", taxType: "trad", owner: "B", planType: "employer" }],
  otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "joint", taxType: "taxable" }],
  incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1600, plannedAge: 67 }, pension: { amount: 900 } },
  incomeStreams: [{ id: "s1", label: "Rental", kind: "rental", owner: "joint", monthly: 1200, startYear: 2026, endYear: 2045, cola: true, tax: "ordinary" }] });
// v6.30 (harness fix, found while re-gating D-60): through v6.29 these two rows were written as { category, startDate, endDate, kind } —
// field names the app does not read (its rows are { cat, start, end, freq, phase }). The Income tab's monthly figure took them by its defaults,
// but Engine D's year read skips a row with no `start`, so the tabs saw different spending on one plan. Written in the app's own schema
// now, and the rental stream's tax as "ordinary", one of the app's two values: "taxable" matched neither ("ordinary" | "taxfree"), so the
// engines that filter on it counted the rent as income but never taxed it. Measured: every t92 check holds on both legs either way, so no
// figure here was riding on either defect.
const EXP = [{ cat: "Living", label: "Household", amount: 6000, start: "2026-01", end: "2060-12", freq: "monthly", phase: "both", deductible: false }];
const EXP_BROKE = [{ cat: "Living", label: "Household", amount: 14000, start: "2026-01", end: "2060-12", freq: "monthly", phase: "both", deductible: false }];
const example = async () => { await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); for (let i = 0; i < 3; i++) await flush(); };

const R = {};
await example();
R.ex = { stress: await tabText("stress", /Recovery:|Scenario 1/), backtest: await tabText("backtest"), wb: await tabText("what breaks"), income: await tabText("income"),
  mc: await tabText("monte carlo", /FINANCING vs CASH[\s\S]*pts|Slide the principal/), dash: await tabText("dashboard"), verify: await tabText("verify"), exit: await tabText("exit plan") };
await seed(late(), EXP); await save();
R.late = { income: await tabText("income"), exit: await tabText("exit plan") };
// the same couple with B claiming at 65 (Jun 2032), inside A's gap; and the same household as a single plan
await seed({ ...late(), incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1600, plannedAge: 65 }, pension: { amount: 900 } } }, EXP); await save();
R.split = { income: await tabText("income") };
await seed({ ...late(), single: true, nameB: "", dobB: "", retireYearB: 2031, incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 900 } } }, EXP); await save();
R.single = { income: await tabText("income") };
await seed(late(), EXP_BROKE); await save();
R.broke = { backtest: await tabText("backtest"), wb: await tabText("what breaks") };
T("B-5: SETUP — every tab rendered text on the three plans", Object.values(R).every(p => Object.values(p).every(t => t.length > 200)),
  Object.entries(R).map(([k, p]) => k + ":" + Object.entries(p).map(([t, v]) => t + "=" + v.length).join(",")).join(" "));

if (POST) {
  // Stress: the computed sentence (its figures are the helper's, checked at B-4); the old verdict is gone (A-1)
  T("B-6: the Stress tab prints the computed recovery sentence (falls to …, still N% below / back at its pre-crash peak)",
    /Recovery: The median balance across the simulations (falls from \$[\d.,]+[KM]? \([A-Z][a-z]{2} \d{4}, its last pre-crash level, nominal\) to \$[\d.,]+[KM]? \([A-Z][a-z]{2} \d{4}\) and (is still \d+% below that level|is back at that level)|does not fall below its last pre-crash level)/.test(R.ex.stress), (R.ex.stress.match(/Recovery:.{0,240}/) || [""])[0]);
  T("B-6b: the Stress scenario cards state the forced regimes from SCENARIOS (crisis −35%, stagflation 6.5%)",
    has(R.ex.stress, "US stocks -35%") && has(R.ex.stress, "inflation 6.5%, US stocks -5%"), (R.ex.stress.match(/A forced crisis year.{0,160}/) || [""])[0]);
  // Backtest: the block shows above the threshold and not below it; the comparison names the 30-year run and the active preset
  const surv = t => { const m = NW(t).match(/Survivalrate\(yourassetmix\)(\d+)%/); return m ? Number(m[1]) : NaN; };
  T("B-7: SETUP — the example's backtest survival is high (≥ 90%) and the broke plan's low (< 90%)", surv(R.ex.backtest) >= 90 && surv(R.broke.backtest) < 90, `${surv(R.ex.backtest)} / ${surv(R.broke.backtest)}`);
  T("B-7b: above the threshold the survival note shows, naming what it leaves out (other income streams, income tax)",
    has(R.ex.backtest, "Why the survival rate is high:") && has(R.ex.backtest, "counts only Social Security and the pension as income (not your other income streams) and charges no income tax"));
  T("B-7c: below it the note is absent", !has(R.broke.backtest, "Why the survival rate is"));
  T("B-7d: the comparison names the Monte Carlo tab's 30-year run (above $500K), the header's 6-year run (above $800K) and the active preset",
    has(R.ex.backtest, "30-year runs count a path a success when it ends above $500K") && has(R.ex.backtest, "the 6-year simulation, ending above $800K") && has(R.ex.backtest, "the BULL-LEANING scenario weights"));
  // What Breaks: the history sentence carries the table's figures on the example, and is absent where the plan fails at its baseline
  const pm = (v, d = 1) => `${v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(d)}`;
  const wbHist = `For context, in the app's US stock data (1928–2025, 98 years of real total returns), the weakest 20-year window, ${W20.s}–${W20.e}, earned ${pm(W20.c)}%/yr and the worst decade, ${W10.s}–${W10.e}, ${pm(W10.c)}%/yr.`;
  T("B-8: What Breaks' history sentence on the example carries the table's own windows", has(R.ex.wb, wbHist), (R.ex.wb.match(/For context.{0,260}/) || ["(absent)"])[0]);
  T("B-8b: on a plan that fails at its own scenario return, no cushion and no history sentence", has(R.broke.wb, "Fails at the scenario's own return") && has(R.broke.wb, "there is no cushion to measure") && !has(R.broke.wb, "For context, in the app's US stock data"));
  T("B-8e: …and none of the other three items prints a headroom verdict (spending, shock, crash years)", !has(R.broke.wb, "would not break the plan") && !has(R.broke.wb, "still leaves the plan intact")
    && !has(R.broke.wb, "% more — before depletion") && has(R.broke.wb, "Fails at current spending") && (NW(R.broke.wb).split(NW("None — fails without one")).length - 1) === 2);
  T("B-8c: the 1929–32 figure is the table's (cumulative nominal total return)", has(R.ex.wb, `1929–32 was ≈${pm(c2932, 0)}% in the app's annual total-return data`), (c2932 * 100).toFixed(1));
  T("B-8d: the withdrawal-rate line names what it is (last plan year, before tax, today's dollars) and draws no inference", /Thelastplanyear'sdraw—spendinglessSocialSecurityandpension,beforetax,intoday'sdollars—is[\d.]+%oftoday'sportfolio\./.test(NW(R.ex.wb)));
  // presets, rendered
  const bullRe = (MD.realEq.bull * 100).toFixed(1), histRe = (MD.realEq.historical * 100).toFixed(1);
  T("B-9: the MC tab's conservative-model note quotes the active preset's and HISTORICAL's expected real returns (computed)",
    has(R.ex.mc, `The active BULL-LEANING scenario expects about ${bullRe}% a year real from US stocks; the Historical preset, built to match the long-run US average, expects about ${histRe}%.`));
  T("B-9b: the Dashboard's line does the same", has(R.ex.dash, `The BULL-LEANING scenario expects about ${bullRe}% real from US stocks a year, below the ${histRe}% of the Historical preset`));
  // Verify, rendered
  T("B-10: the Verify tab reads 78 of 78 and lists the AMT checks and the unchecked rates", has(R.ex.verify, "78 of 78 checks passed") && has(R.ex.verify, "ALTERNATIVE MINIMUM TAX")
    && has(R.ex.verify, "Not checked, among others: the AMT rates (26% and 28%), the NIIT rate (3.8%) and the Social Security taxation factors (50% and 85%)") && has(R.ex.verify, "re-run rather than re-sample"));
} else {
  T(`B-6 ${KD}: the Stress tab prints "recovers to pre-crash levels by Year 4–5" on the example`, has(R.ex.stress, "recovers to pre-crash levels by Year 4–5"));
  T(`B-7 ${KD}: the Backtest's "so high" note prints on a plan whose survival is low`, has(R.broke.backtest, "Why the survival rate is so high"));
  T(`B-8 ${KD}: What Breaks says "survives even if" on a plan that fails at its baseline, and prints the typed history`, has(R.broke.wb, "Your plan survives even if real returns run") && has(R.broke.wb, "150+ years of data"));
  T(`B-10 ${KD}: the Verify tab reads 72 of 72`, has(R.ex.verify, "72 of 72 checks passed"));
}

// ══ C · the figures ═══════════════════════════════════════════════════════════════════════════════════════════
console.log("  C — the figures");
const num = s => Number(String(s).replace(/[$,]/g, ""));
const gapOf = t => { const m = NW(t).match(/Portfoliodrawduringgap\$([\d,]+)/); return m ? num(m[1]) : NaN; };
// the late couple: retires Jan 2031; A claims at 67 → Jun 2033 (29 gap months); B claims Jun 2034, after the gap. Monthly spending $6,000, the
// pension $900, the rental stream $1,200 at retirement, B's check $1,600. Computed here by month, independently of the app.
const lateGap = (() => { let s = 0; const ret = 2031 * 12 + 1, aYM = 2033 * 12 + 6, bYM = 2034 * 12 + 6; for (let m = ret; m < aYM; m++) s += Math.max(0, 6000 - 900 - 1200 - (m >= bYM ? 1600 : 0)); return s; })();
const lateGapOld = 29 * Math.max(0, 6000 - 1600 - 900 - 1200);
if (POST) {
  EQ("C-1: the Income tab's gap draw on a couple whose B claims after A's gap (a month loop computed here)", gapOf(R.late.income), lateGap);
  T("C-1b: its description says B's check is not in it", has(R.late.income, "$3,900/mo × 29 months, before Bo's Social Security starts"), (R.late.income.match(/Portfolio draw during gap.{0,140}/) || [""])[0]);
  const splitGap = (() => { let s = 0; const ret = 2031 * 12 + 1, aYM = 2033 * 12 + 6, bYM = 2032 * 12 + 6; for (let m = ret; m < aYM; m++) s += Math.max(0, 6000 - 900 - 1200 - (m >= bYM ? 1600 : 0)); return s; })();
  EQ("C-1d: …and where B claims inside A's gap (Jun 2032), B's check from that month (a month loop computed here)", gapOf(R.split.income), splitGap);
  T("C-1e: …described as the two rates and their months", has(R.split.income, "$3,900/mo × 17 months, then $2,300/mo × 12 months from Bo's claim"), (R.split.income.match(/Portfolio draw during gap.{0,160}/) || [""])[0]);
  EQ("C-1f: on a single plan the gap is the one rate × the months", gapOf(R.single.income), lateGap);
  T("C-1g: …and names no spouse B", (() => { const g = (R.single.income.match(/Portfolio draw during gap.{0,90}/) || [""])[0]; return has(g, "$3,900/mo × 29 months") && !/Social Security starts|Spouse B|Bo/.test(g); })() && !/Spouse B|Bo's/.test(R.single.income), (R.single.income.match(/Portfolio draw during gap.{0,160}/) || [""])[0]);
  T("C-1h: the Income tab's phase table counts B's check only from B's claim month (the late couple's first phase: $3,900 short a month)", has(R.late.income, "Shortfall −$3,900/mo"), (R.late.income.match(/PHASE — NO ANN SS.{0,200}/) || [""])[0]);
  const exM = NW(R.ex.income).match(/Portfoliodrawduringgap\$([\d,]+)\$([\d,]+)\/mo×(\d+)months/);
  T("C-1c: on the example (B claims at the gap's start) the figure is one rate × the gap's months, as through v6.28", !!exM && num(exM[1]) === num(exM[2]) * Number(exM[3]), exM && exM[0]);
} else {
  EQ(`C-1 ${KD}: the gap draw subtracts B's check for every gap month (B claims after the gap)`, gapOf(R.late.income), lateGapOld);
}
// the mortgage what-if: the active preset's return, and the success sentence keyed to the sign of the change
const mcS = (() => { const i = R.ex.mc.indexOf("the loan costs"); return i >= 0 ? NW(R.ex.mc.slice(i, i + 900)) : ""; })();
const card = NW(R.ex.mc).match(/FINANCINGvsCASH\+?([−-]?[\d.]+)pts/);
if (POST) {
  const ret = (MD.portRet.bull * 100).toFixed(1);
  T("C-2: the mortgage what-if quotes the active preset's expected return on today's mix (computed here)", mcS.includes(NW(`the BULL-LEANING scenario expects about ${ret}% a year (nominal) from today's mix`)), mcS.slice(0, 400));
  T("C-2b: SETUP — the FINANCING vs CASH card was read", !!card, R.ex.mc.slice(R.ex.mc.indexOf("FINANCING"), R.ex.mc.indexOf("FINANCING") + 80));
  if (card) { const d = Number(card[1].replace("−", "-"));
    T("C-2c: the sentence's direction matches the card's sign, with no negative number before \"pts\"", !/[−-]\d+(\.\d+)?pts(lower|higher)/.test(mcS)
      && (Math.abs(d) < 0.05 ? /thesamesuccessrate/.test(mcS) : d < 0 ? /ptslowersuccess/.test(mcS) : /ptshighersuccess/.test(mcS)), `${card[1]} | ${mcS.slice(0, 300)}`); }
  T("C-2d: the sign is built from Math.abs and the sign of dSucc in the source (a plan where the loan helps reads \"higher\")",
    SRC.includes('Math.abs(dSucc) < 0.05 ? "the same success rate" : `${Math.abs(dSucc).toFixed(1)} pts ${dSucc < 0 ? "lower" : "higher"} success`'));
} else {
  T(`C-2 ${KD}: the what-if quotes "~4.5%" and prints dSucc as is before "pts lower"`, SRC.includes("{dSucc.toFixed(1)} pts lower success — the interest outweighs keeping the cash invested at the model's conservative ~4.5% return."));
}
// Example 2 by hand, on Example 1's stated method: 20 years at 4.5%, the taxable account taxed at 15% on its gain
{
  const g = Math.pow(1.045, 20), taxed = p => p * g - 0.15 * (p * g - p);
  const ex1 = 100000 * g - (76000 * g + taxed(24000)), ex2 = 100000 * g - (76000 * g + taxed(21600));
  T("C-3: SETUP — Example 1's own figures reproduce on this method ($241,171; about $5,100 less)", Math.round(100000 * g) === 241171 && Math.round(ex1 / 100) * 100 === 5100, `${100000 * g} / ${ex1}`);
  if (POST) T("C-3b: Example 2's figure is the same method's ($10,400 per $100K) and states it", Math.round(ex2 / 100) * 100 === 10400 && DOCS.includes("roughly <strong>$10,400 less per $100K converted</strong>")
    && DOCS.includes("On Example 1's method (20 years at 4.5%, then 15% capital-gains tax on the gain)"), ex2);
  else T(`C-3b ${KD}: Example 2 says $10,900 (the penalty grown pre-tax, a different method from Example 1's)`, DOCS.includes("roughly <strong>$10,900 per $100K converted</strong>"));
}

// ══ D · Events and the Exit Plan ════════════════════════════════════════════════════════════════════════════════
console.log("  D — Events and the Exit Plan");
if (MD) {
  const ex = MD.evExample, sg = MD.evSingle, t = MD.tlExample;
  const A = ex.find(e => e.key === "rmd"), B = ex.find(e => e.key === "rmdB");
  T("D-1: A's RMD event is unchanged in key and title", !!A && A.title === `Required Minimum Distributions (${t.nameA})`, A && A.title);
  if (POST) {
    T("D-2: a couple has spouse B's RMD event, keyed \"rmdB\", from B's own start age", !!B && B.title === `Required Minimum Distributions (${t.nameB})` && B.when.includes(`first RMD year: ${t.dobB + t.rmdAgeB} (${t.nameB} age ${t.rmdAgeB})`), B && B.when);
    T("D-2b: a single plan has none", !sg.some(e => e.key === "rmdB"));
    EQ("D-3: the event count the Field Manual states — seventeen for the couple", ex.length, 17);
    EQ("D-3b: …and thirteen for one person", sg.length, 13);
    T("D-3c: the Field Manual states those counts", DOCS.includes("seventeen for a two-person household, thirteen for one person"));
    const est = ex.find(e => e.key === "esttax");
    T("D-4: estimated-tax dates run from the retirement year, not only conversion years", !!est && /retirement years/.test(est.title) && /W-4R/.test(est.instructions) && /7%, 10%, 12% or 22%/.test(est.instructions), est && est.title);
  } else {
    T(`D-2 ${KD}: no event for spouse B's RMDs`, !B);
    EQ(`D-3 ${KD}: sixteen events for the couple`, ex.length, 16);
  }
}
if (POST) {
  T("D-5: the Exit Plan measures B's coverage gap from B's own retirement, in months", has(R.late.exit, "Bo: not 65 until Jun 2032 — needs coverage from retirement (Jan 2032) to Medicare, 5 months."), (R.late.exit.match(/Bo: not 65.{0,120}/) || ["(absent)"])[0]);
  T("D-5b: …and A's, whose 65th birthday falls after retirement in the same year, is not \"Medicare-eligible at retirement\"",
    has(R.late.exit, "Ann: not 65 until Jun 2031 — needs coverage from retirement (Jan 2031) to Medicare, 5 months."), (R.late.exit.match(/Ann: .{0,120}/) || ["(absent)"])[0]);
  T("D-6: the Social Security gap is counted in months from the retirement month", has(R.late.exit, "That's 29 months after retirement (Jan 2031) — the model draws the gap from the portfolio."));
  T("D-7: the phase is named for what it holds, and the RMD line names each person", has(R.late.exit, "CHECK THE NUMBERS THIS PLAN RESTS ON") && has(R.late.exit, "RMDs are required from each person's Traditional balances from their own start age — Ann at"));
  T("D-7b: the example's Exit Plan carries the new title too (both plan kinds)", has(R.ex.exit, "CHECK THE NUMBERS THIS PLAN RESTS ON"));
} else {
  T(`D-5 ${KD}: A, 65 in June of the retirement year, reads "Medicare-eligible at retirement"`, has(R.late.exit, "Ann: 65 in Jun 2031 — Medicare-eligible at retirement"));
  T(`D-6 ${KD}: the SS gap is counted in calendar years`, has(R.late.exit, "That's 2 yr after you retire"));
}

// ══ E · privacy parity — the parts the Ask AI request carries, against the three lists ═══════════════════════════════════
console.log("  E — privacy parity");
{
  // the request's parts, from the source: the system context (ground rules + the plan description MASTER_PROMPT + the live context), the last
  // 12 messages, the question and the attachments
  const askFn = all(AST, n => (n.type === "VariableDeclarator" && n.id && n.id.name === "askAI") || (n.type === "FunctionDeclaration" && n.id && n.id.name === "askAI"))[0];
  const sysMemo = all(AST, n => n.type === "VariableDeclarator" && n.id && n.id.name === "aiSystemPrompt")[0];
  const gen = all(AST, n => n.type === "VariableDeclarator" && n.id && n.id.name === "genAIContext")[0];
  const askS = srcOf(askFn), sysS = srcOf(sysMemo), genS = srcOf(gen);
  T("E-0: SETUP — askAI, aiSystemPrompt and genAIContext are found", askS.length > 500 && sysS.length > 500 && genS.length > 500, `${askS.length} / ${sysS.length} / ${genS.length}`);
  T("E-0b: the request carries the plan description (MASTER_PROMPT), the live context, the last 12 messages and attachments",
    /MASTER_PROMPT/.test(sysS) && /LIVE PORTFOLIO CONTEXT/.test(sysS) && /slice\(-12\)/.test(askS) && /attach/i.test(askS), "");
  // what the plan description writes, from genAIContext's own source
  const genFacts = [["born", "birth dates"], ["plan to age", "plan-to ages"], ["State:", "state"], ["HOME:", "home value and mortgage"], ["HOME MOVE", "home-move cash"],
    ["Weighted expense ratio", "fund costs"], ["OTHER INCOME STREAMS", "other income streams"]];
  T("E-0c: genAIContext writes each fact the lists must name", genFacts.every(([k]) => genS.includes(k)), genFacts.filter(([k]) => !genS.includes(k)).map(x => x[0]).join(", "));
  const landing = (() => { const t = TEXTS.find(x => !x.fm && x.v.includes("The only time your data leaves this device is when you press ASK")); return t ? t.v : ""; })();
  const mydata = (() => { const i = SRC.indexOf("The only time your data leaves this device is when you press ASK on the"); return i >= 0 ? SRC.slice(i, SRC.indexOf("</div>", i + 600)) : ""; })();
  const fmRow = (() => { const i = DOCS.indexOf("<strong>Your structured plan summary</strong>"); return i >= 0 ? DOCS.slice(i, DOCS.indexOf("</table>", i)) : ""; })();
  T("E-1: SETUP — the landing, My Data and Field Manual lists are found", landing.length > 200 && mydata.length > 200 && fmRow.length > 200, `${landing.length} / ${mydata.length} / ${fmRow.length}`);
  const need = [["summary of your plan|plan summary|structured plan summary", "the live summary"], ["plan description", "the plan description"], ["birth dates", "birth dates"],
    ["plan-to ages", "plan-to ages"], ["\\bstate\\b", "state"], ["home value", "home value"], ["mortgage", "mortgage"], ["home-move cash", "home-move cash"],
    ["12 earlier messages|last 12 messages", "the conversation"], ["question", "the question"], ["attach", "attachments"]];
  const miss = (txt) => need.filter(([re]) => !new RegExp(re, "i").test(txt)).map(x => x[1]);
  if (POST) for (const [name, txt] of [["landing", landing], ["My Data", mydata], ["Field Manual", fmRow]])
    T(`E-2: the ${name} list names every part the request carries`, miss(txt).length === 0, miss(txt).join(", "));
  else T(`E-2 ${KD}: the landing list omits birth dates, home value, mortgage, home-move cash and the conversation`, ["birth dates", "home value", "home-move cash", "the conversation"].every(x => miss(landing).includes(x)), miss(landing).join(", "));
  // and every item the lists name is sent (each is in the live context or the plan description)
  const liveFacts = ["retiring", "Portfolio $", "Pre-retire $", "401(k) contribs", "SS $", "pension $", "Roth conversions", "Guardrails:", "MC results"];
  T("E-3: every item the lists name is in the request (the live context's own fields)", liveFacts.every(k => sysS.includes(k)), liveFacts.filter(k => !sysS.includes(k)).join(", "));
}

// ══ F · the Field Manual and METHODOLOGY ════════════════════════════════════════════════════════════════════════
console.log("  F — the Field Manual and METHODOLOGY");
if (POST) {
  const FM_HAS = [
    ["your portfolio ended above the success threshold — $800,000 for the headline rate", "the opening defines success (1479)"],
    ["an account name the app cannot classify defaults to <strong>Taxable</strong>, which under-taxes", "§13 (5): the Taxable default, optimistic (1746)"],
    ["<strong>Two terms are still missing</strong>", "§13: the ladder's MAGI (1749)"],
    ["An income figure is missing, so the model pays $0 for it", "FAQ (1790)"],
    ["each year's roll is independent of the last", "the regime draw (1524)"],
    ["(4% standard deviation, 10% in a crisis year)", "the noise term (1523)"],
    ["the Taxes tab's rows run <em>low</em> (about $40,700 over the plan on the built-in example at the $70K slider, $70,800 at $0", "the units, both directions (DF-7)"],
    ["its success rates are very slightly pessimistic (0.6–0.8 points on the example's 30-year run)", "the units, the Monte Carlo (DF-7)"],
    ["the Social Security, Medicare and ACA events point at ssa.gov, medicare.gov or HealthCare.gov", "Events sources (1624)"],
    ["What the app says about its own model, checked (v6.29).", "§13 records the release"],
  ];
  // v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): the two DF-7 sentences described the mixed dollar units, which v6.30 removes; their
  // measured figures counted only Social Security and were too small. On that leg the Field Manual must no longer carry them, and must say so
  // in the v6.29 entry's place. An array, so register_tag2 widens it each release.
  const U630 = ["v630", "v631", "v632", "v633", "v634"].includes(VER), DF7 = [FM_HAS[6][0], FM_HAS[7][0]];
  for (const [p, why] of FM_HAS) {
    if (U630 && DF7.includes(p)) T(`F-1 (v6.30): the Field Manual no longer says: ${why} — the units it described are fixed`, !DOCS.includes(p), p.slice(0, 80));
    else T(`F-1: the Field Manual says: ${why}`, DOCS.includes(p), p.slice(0, 80)); }
  if (U630) T("F-1d (v6.30): …and §13 says why — the v6.30 entry, and the v6.29 description's figures withdrawn",
    DOCS.includes("<strong>One dollar unit and one inflation clock for the tax engines (v6.30).</strong>")
    && DOCS.includes("v6.29's description of this finding measured only Social Security, so the figures it quoted were too small; they are gone."));
  if (MD) { const inf = k => Object.entries(MD.PP[k].probs).reduce((s, [r, p]) => s + p * MD.SC[r].inflation, 0);
    T("F-1b: the Field Manual's expected inflation figures are the presets' own (computed here from PROB_PRESETS and SCENARIOS)",
      DOCS.includes(`probability-weighted ≈${(inf("bull") * 100).toFixed(1)}% under the default BULL-LEANING prior and ≈${(inf("base") * 100).toFixed(1)}% under BASE`), `${inf("bull")} / ${inf("base")}`);
    T("F-1c: the Field Manual's noise figures are the engines' (vol = 0.04 + 0.06 in a crisis, read from both Monte Carlo engines)",
      SRC.split("const vol = 0.04 + (scenario === SCENARIOS.crisis ? 0.06 : 0);").length === 3 && DOCS.includes("(4% standard deviation, 10% in a crisis year)")); }
  const i29 = DOCS.search(/<li><strong>[^<]*\(v6\.29\)\.<\/strong>/), i28 = DOCS.search(/<li><strong>[^<]*\(v6\.28\)\.<\/strong>/);
  T("F-2: §13's v6.29 entry comes first in its release list", i29 >= 0 && i28 > i29, `${i29} / ${i28}`);
  // v6.30 (D-60): ONE METHODOLOGY.md sits in a run folder, read by both legs — so the v6.30 leg requires v6.30's text and the v6.29 leg
  // accepts whichever the folder ships (v6.29's, or v6.30's with the same checks the v6.30 leg makes). v6.29's measurement counted only
  // Social Security (scope §0.6); v6.30 withdraws its figures and states the full construction's.
  const M30 = METH.includes("## One dollar unit and one inflation clock for the tax engines (v6.30)"),
    m30ok = M30 && METH.includes("**The dollar basis (v6.20–v6.29) — superseded at v6.30.**") && !METH.includes("**The dollar basis — measured, both readings")
      && !METH.includes("the shipped rows run **low**, by $70,823 and $40,664") && METH.includes("ran low by $97,925 at a $0 slider and $72,837 at $70,000")
      && METH.includes("high by\n$16,878 and $891") && !METH.includes("as everywhere else in the app (§6).");
  if (U630 || M30)
    T("F-3 (v6.30): METHODOLOGY describes one unit and one clock, and replaces v6.29's both-readings figures with the full construction's", m30ok, `v6.30 section ${M30}`);
  else
  T("F-3: METHODOLOGY states the dollar basis both ways, with the measurement", METH.includes("**The dollar basis — measured, both readings (v6.29, F-25).**")
    && METH.includes("the shipped rows run **low**, by $70,823 and $40,664") && METH.includes("from 94.83% to 95.67% at $0 and from 95.15% to 95.73% at\n$70,000")
    && !METH.includes("as everywhere else in the app (§6).") , "");
  // the measurement's arithmetic, re-done (v6.30: the full construction — scope §0.6, V1 schedule $310,477 / $286,507, today's $195,674 / $212,779)
  if (U630 || M30) T("F-3b (v6.30): its arithmetic holds ($310,477 − $212,552, $286,507 − $213,670, $212,552 − $195,674, $213,670 − $212,779)",
    310477 - 212552 === 97925 && 286507 - 213670 === 72837 && 212552 - 195674 === 16878 && 213670 - 212779 === 891);
  else
  T("F-3b: its arithmetic holds ($283,375 − $212,552 and $254,334 − $213,670)", 283375 - 212552 === 70823 && 254334 - 213670 === 40664);
  if (["v630", "v631", "v632", "v633", "v634"].includes(VER))
    T("F-4 (v6.30): the in-app units sentences describe one unit — each year's own dollars — and the two-directions sentences are gone",
      SRC.includes("Every figure is in that year's own dollars") && !SRC.includes("so read as each year's own dollars these rows run <strong>low</strong>")
      && !SRC.includes("so read as future dollars their totals run <em>low</em>, and the Monte Carlo, which grows them with inflation again, runs slightly <em>high</em>"));
  else
  T("F-4: the in-app units sentences (Taxes tab, Roth rules box) state both directions", SRC.includes("so read as each year's own dollars these rows run <strong>low</strong>")
    && SRC.includes("so read as future dollars their totals run <em>low</em>, and the Monte Carlo, which grows them with inflation again, runs slightly <em>high</em>"));
} else {
  T(`F-1 ${KD}: the Field Manual says an unclassified account "defaults to Traditional"`, DOCS.includes("defaults to <strong>Traditional</strong>, which over-taxes a brokerage account nobody renamed"));
}

finished = true;
console.log(`t92 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
