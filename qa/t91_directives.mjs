// t91_directives.mjs — v6.28 (F-23 + F-24; docs/SCOPE_F23_F24_DIRECTIVES_V628.md): the app reports what the model computes or assumes, not what to do.
//
// WHAT IT PINS. Through v6.27 the app told the household what to do across many tabs — the Exit Plan ("elect the pension's joint-and-survivor
// option", "build 1–2 years of spending into a cash reserve", "don't give notice until…"), the Withdrawal tab's steps and its comparison with a
// "Recommendation", the Guardrails tab's "ACTION:" lines (one of them "boost Roth conversions", which no engine does), the Roth tab's "ideal"
// bracket and "classic guideline", the Survivor tab's case for converting, the Events tab's Roth alarm ("Pay the tax from the taxable account")
// and the Field Manual's "PAY CONVERSION TAX FROM OUTSIDE FUNDS". Several of those sentences were also FALSE about the model (scope §0.3,
// V-1 to V-12): the schedule applies no guardrails and pays no income tax, draws Traditional and Roth in proportion (not Roth last), and the
// SS tab named spouse A the higher earner on every couple. F-24: the Grade tab printed weights as percents of 100 (they are points of 78), so
// every "Lost ~X GPA points" figure was understated, and its LTC test also matched a "Long-term disability" row.
// From v6.28 each directive is recast as what the model computes or assumes (DF-1 to DF-8, all (a)), and the false statements are corrected.
//
// Both legs: node t91_directives.mjs v627 | node t91_directives.mjs v628. The v6.27 leg pins each defect as a dated [KNOWN DEFECT 2026-10-21, F-23/F-24].
// Math.random is seeded BEFORE the bundle loads and re-seeded before each plan (t11's TRAP 1). The Events tab's dated items run in a child
// process (--events) on the app module, so no clock is faked here. Controls: qa/tools/controls_v628_directives.py (repo-only).
//
// §A's lint is a NET, not a proof: a directive can be phrased past any word list. It reads every rendered tab on three plans and the whole
// Field Manual, and each allowed hit is NAMED below with its reason — a new hit fails until someone reads it and either recasts it or names it.
// What no test can show: whether the copy that remains reads as advice to a person — the release had it read by an independent agent.
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v628";
const KNOWN_VERSIONS = ["v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-21, F-23 — flips at v6.28]";
const KD24 = "[KNOWN DEFECT 2026-10-21, F-24 — flips at v6.28]";

// ══ CHILD MODE (--events): the Events tab's items, from the app module, on fixed dates — no DOM, no clock ══
if (process.argv.includes("--events")) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
  const X = M.__test;
  const at = d => (X.computePlanEvents(d) || []).map(e => ({ key: e.key, title: e.title, when: e.when, instructions: e.instructions }));
  console.log("EVENTS:" + JSON.stringify({ inLadder: at(new Date(2030, 10, 15, 12)), before: at(new Date(2026, 10, 15, 12)), tl: X.PLAN_TIMELINE ? { s: X.PLAN_TIMELINE.rothLadderStart, e: X.PLAN_TIMELINE.rothLadderEnd } : null }));
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
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t91 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

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
window.URL.createObjectURL = () => "blob:t91"; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = () => "blob:t91"; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const { JSDOM } = require("jsdom");

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) all(c, pred, out); return out; };
const topDecl = name => AST.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const topFn = name => AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === name);
const DOCS = (() => { const d = topDecl("DOCS_HTML"); return d && d.init.type === "Literal" ? d.init.value : ""; })();
const idents = root => new Set(all(root, n => n.type === "Identifier").map(n => n.name));
const propOf = (obj, name) => obj && obj.type === "ObjectExpression" ? obj.properties.find(p => p.type === "Property" && ((p.key.name || p.key.value) === name)) : null;
// every user-facing string in the source, except the two AI-addressed texts (the demo briefing and the ground rules — scope §4: out of scope,
// the briefing's directive voice is v6.26 DC-3's, overridden by the ground rules), and with DOCS_HTML's release-history entries removed (they quote
// what was removed, by design). Those entries are <li><strong>… (vX.YY).</strong>…</li> in §13.
const SKIP_DECL = new Set(["DEFAULT_MASTER_PROMPT", "AI_GROUND_RULES"]);
const HIST = /<li><strong>[^<]*\(v\d+\.\d+\)\.<\/strong>[\s\S]*?<\/li>/g;
const TEXTS = (() => { const out = []; const vis = n => { if (!n || typeof n.type !== "string") return;
  if (n.type === "VariableDeclarator" && n.id && SKIP_DECL.has(n.id.name)) return;
  if (n.type === "Literal" && typeof n.value === "string") out.push(n.value.startsWith("<!doctype html>") ? n.value.replace(HIST, "") : n.value);
  else if (n.type === "TemplateElement") out.push(n.value.cooked || "");
  else if (n.type === "JSXText") out.push(n.value.replace(/\s+/g, " "));
  for (const c of kids(n)) vis(c); }; vis(AST); return out; })();
const inSrc = p => TEXTS.some(t => t.includes(p));

console.log(`t91 — THE APP REPORTS WHAT THE MODEL COMPUTES, NOT WHAT TO DO (${VER})`);
console.log("  D — the model, by AST (the facts the new copy states)");
T("D-0: SETUP — the Field Manual is read and the source's text pieces are collected", DOCS.length > 100000 && TEXTS.length > 5000, `${DOCS.length} / ${TEXTS.length}`);
// D-1: the guardrails are the Monte Carlo engines' — Engine D reads no GUARDRAILS and has no spending adjustment (both legs: a fact of the model)
const GR = topDecl("GUARDRAILS"), ENG_D = topFn("computeWithdrawalPlan"), MC6 = topFn("runMonteCarlo"), MC30 = topFn("runExtendedMC"), ENG_C = topFn("computeIrmaaPlan");
T("D-1: SETUP — GUARDRAILS, Engine D, both Monte Carlo engines and Engine C are found", !!(GR && ENG_D && MC6 && MC30 && ENG_C));
const GV = k => { const p = GR && propOf(GR.init, k); return p && p.value.type === "Literal" ? p.value.value : NaN; };
const G = { lower: GV("lowerPct"), upper: GV("upperPct"), cut: GV("cutPct"), raise: GV("raisePct") };
T(`D-1b: GUARDRAILS reads 80% / 120% / cut 10% / raise 5% (every guardrail figure the copy states is checked against these, not literals)`,
  G.lower === 0.8 && G.upper === 1.2 && G.cut === 0.1 && G.raise === 0.05, JSON.stringify(G));
T("D-2: both Monte Carlo engines apply the guardrails (each reads GUARDRAILS and carries spendingAdj)",
  [MC6, MC30].every(f => idents(f).has("GUARDRAILS") && idents(f).has("spendingAdj")));
T("D-3: Engine D (the Withdrawal tab's schedule) applies none — it reads no GUARDRAILS and has no spendingAdj",
  ENG_D && !idents(ENG_D).has("GUARDRAILS") && !idents(ENG_D).has("spendingAdj"));
const D_MIN = ENG_D ? all(ENG_D, n => n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object.name === "Math" && n.callee.property.name === "min"
  && n.arguments[0] && n.arguments[0].type === "Identifier" && n.arguments[0].name === "rothAmount") : [];
T("D-4: Engine D converts the slider amount, capped (Math.min(rothAmount, …)) — not a bracket fill", D_MIN.length >= 1, D_MIN.length);
const D_FRAC = ENG_D ? all(ENG_D, n => n.type === "VariableDeclarator" && n.id.name === "tradDraw" && n.init && n.init.type === "BinaryExpression" && n.init.operator === "*") : [];
T("D-5: Engine D draws Traditional in proportion within the buckets (tradDraw = … * tradFrac), not Roth last", D_FRAC.length >= 1 && D_FRAC.some(d => idents(d.init).has("tradFrac")));
const C_MAGI = ENG_C ? all(ENG_C, n => n.type === "VariableDeclarator" && n.id.name === "magi") : [];
T("D-6: Engine C's MAGI includes taxable Social Security (ssTaxable) — the SS tab's IRMAA sentence states this", C_MAGI.some(d => idents(d.init).has("ssTaxable")));
// D-7: one LTC test, shared
const LTC_YES = ["LTC premium", "Long-term care", "Long Term Care insurance", "long-term-care policy", "LTC", "Long–term care"];
const LTC_NO = ["Long-term disability", "Long term disability insurance", "Long-term storage unit", "Health insurance", "Car insurance"];
if (POST) {
  T("D-7: isLTCLabel exists and is exposed to the harness", typeof DG.isLTCLabel === "function");
  T("D-7b: it matches every care label", typeof DG.isLTCLabel === "function" && LTC_YES.every(l => DG.isLTCLabel(l)), LTC_YES.filter(l => !(DG.isLTCLabel && DG.isLTCLabel(l))).join(", "));
  T("D-7c: it does NOT match a long-term row that is not care (disability, storage) or another insurance", typeof DG.isLTCLabel === "function" && LTC_NO.every(l => !DG.isLTCLabel(l)),
    LTC_NO.filter(l => DG.isLTCLabel && DG.isLTCLabel(l)).join(", "));
  const OLD_RE = all(AST, n => n.type === "Literal" && n.regex && n.regex.pattern === "ltc|long.?term");
  T("D-7d: EXTINCTION — the v6.27 pattern /ltc|long.?term/i is gone from the source (both its sites use the shared test)", OLD_RE.length === 0, OLD_RE.length);
} else {
  const OLD_RE = all(AST, n => n.type === "Literal" && n.regex && n.regex.pattern === "ltc|long.?term");
  T(`D-7 ${KD24}: two sites (Grade, Monte Carlo) test /ltc|long.?term/i, which matches "Long-term disability"`, OLD_RE.length === 2 && /long.?term/i.test("Long-term disability"), OLD_RE.length);
}

// ── A · the removed directives and false statements, by exact phrase, across the whole source ─────────────────────────────
console.log("  A — the removed phrases (whole source, the AI-addressed texts and §13's release history excepted)");
const GONE = [
  ["THE #1 OPTIMIZATION LEVER", "SS tab heading"], ["HOUSEHOLD LIFETIME OPTIMIZER", "SS grid heading"], ["SS optimizer", "My Data"], ["Roth optimizer", "My Data / Field Manual"],
  ["claiming optimizer", "Field Manual"], ["Cut next year spending by 10%", "Guardrails ACTION"], ["boost Roth conversions", "Guardrails ACTION — no engine does this (V-2)"],
  ["redirect to Roth conversions", "Guardrails header (V-2)"], ["ACTION:", "Guardrails"], ["Fill 12%/22% brackets opportunistically", "Withdrawal Section B"],
  ["Best inheritance vehicle", "Withdrawal Section B"], ["Reserve for late-life surge spending", "Withdrawal Section B"], ["Tap only when other accounts depleted", "Withdrawal Section B"],
  ["Execute planned Roth conversion", "Withdrawal Step 7 (V-4)"], ["Pay conversion taxes from Taxable account", "Withdrawal Step 7 (V-4)"], ["Withdraw to fill specific tax brackets", "Withdrawal Section C"],
  ["Recommendation:", "Withdrawal Section C"], ["(ideal) or 24% (ceiling)", "Roth tab"], ["The classic guideline says", "Roth tab"], ["is the standard advice", "Roth tab"],
  ["Reserve defense:", "Stress tab"], ["Consider whether an irrevocable trust fits", "Checklist"], ["anchor on the generic 4% rule", "Exit Plan"], ["until it isn't", "Exit Plan"],
  ["Elect the pension", "Exit Plan"], ["Build 1–2 years of spending", "Exit Plan"], ["highest-value move", "Exit Plan"], ["Pay the tax from the taxable account", "Events"],
  ["usually better to take it in", "Events"], ["Argues for front-loading", "Field Manual Survivor"], ["PAY CONVERSION TAX FROM OUTSIDE FUNDS", "Field Manual §Roth"], ["The safe move", "Field Manual §Roth"],
  ["is the higher earner", "SS survivor card (V-12)"],
  // the build review's findings that were in v6.27 too (scope §6)
  ["window open: go", "Events legend"], ["getting close: prepare", "Events legend"], ["timing & optimization", "SS tab heading"], ["convert at low brackets", "Field Manual FIG.5"],
];
// the build review's findings in the first v6.28 draft only (never shipped; checked on the v6.28 leg)
const GONE_DRAFT = [["after retirement and before RMDs", "Exit Plan — false for a couple whose window runs past spouse A's RMD start"],
  ["Guaranteed income floor in the model: Social Security", "Exit Plan — left out income streams"], ["usually set up while both of you can sign", "Checklist — couple wording on every plan"]];
if (POST) {
  const left = GONE.filter(([p]) => inSrc(p));
  T(`A-1: EXTINCTION — none of the ${GONE.length} removed directive phrases remains anywhere in the app's text`, left.length === 0, left.map(([p, w]) => `"${p}" (${w})`).join("; "));
  const leftD = GONE_DRAFT.filter(([p]) => inSrc(p));
  T(`A-1c: EXTINCTION — none of the ${GONE_DRAFT.length} draft sentences the build review found false remains`, leftD.length === 0, leftD.map(([p, w]) => `"${p}" (${w})`).join("; "));
  T("A-1b: §13's v6.28 entry may quote them — the history exception is not hiding a live copy (each quoted phrase appears in the history only)",
    ["ACTION:", "Recommendation"].every(p => !TEXTS.filter(t => !t.startsWith("<!doctype html>")).some(t => t.includes(p))));
} else {
  const there = GONE.filter(([p]) => inSrc(p));
  T(`A-1 ${KD}: every one of the ${GONE.length} phrases is in the v6.27 text (the list is not stale)`, there.length === GONE.length, GONE.filter(([p]) => !inSrc(p)).map(([p]) => p).join("; "));
}

// ── the DOM harness ──────────────────────────────────────────────────────────────────────────────
const body = () => window.document.body;
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
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); reseed();
  if (portfolio !== undefined) put("portfolio", portfolio); if (expenses !== undefined) put("expenses", expenses); await render(); };
const save = async () => { await go("my data"); await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 4; i++) await flush(); await flush(300); };
const gradeCard = () => { const c = [...body().querySelectorAll(".card")].find(x => /PORTFOLIO GRADE/.test(x.textContent || "")); return c ? c.textContent.replace(/\s+/g, " ") : ""; };
// a tab's text as blocks: each non-empty text node, whitespace-folded (the same reading the scope's census used)
const blocks = () => { const out = []; const W = window.document.createTreeWalker(el, 4); let t; while ((t = W.nextNode())) { const s = t.nodeValue.replace(/\s+/g, " ").trim(); if (s && !s.startsWith("@import")) out.push(s); } return out; };
const tabText = async name => { await go(name); await flush(200); if (name === "grade") for (let i = 0; i < 300 && !gradeCard(); i++) await flush(200);
  const b = blocks(); const i = b.indexOf("◑ SHOW FEWER TABS"); const tb = i >= 0 ? b.slice(i + 1) : b;
  return { blocks: tb, text: tb.join(" ").replace(/\s+/g, " ").replace(/DANGER CLOSE v\d\.\d+ │.*$/, ""), card: name === "grade" ? gradeCard() : "" }; };

// fixtures (t89/t90's builders)
const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true, workRowsV623: true });
const filled = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1965-06", dobB: "1967-06", retireYear: 2031, retireYearB: 2031, lifeExpA: 90, lifeExpB: 92,
  stateName: "Ohio", stateCode: "OH", stateTaxRate: 0.03, total401k: 900000, household: 1000000,
  positions: [{ ticker: "VTI", name: "Total Market", balance: 600000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" },
              { ticker: "BND", name: "Total Bond", balance: 300000, bucket: 2, type: "bond", taxType: "trad", owner: "B", planType: "employer" }],
  otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "joint", taxType: "taxable" }],
  incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1600, plannedAge: 67 }, pension: { amount: 900 } },
  incomeStreams: [{ id: "s1", label: "Rental", kind: "rental", owner: "joint", monthly: 1200, startYear: 2026, endYear: 2045, cola: true, tax: "taxable" }] });
const single = () => ({ ...filled(), single: true, nameB: "", dobB: "", incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 900 } } });
const bHigher = () => ({ ...filled(), incomeSources: { ssA: { tableByAge: {}, planned: 1600, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 2800, plannedAge: 67 }, pension: { amount: 900 } } });
const EXP = [{ category: "Living", label: "Household", amount: 6000, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const EXP_LTC = [...EXP, { category: "Insurance", label: "LTC premium", amount: 300, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const EXP_DIS = [...EXP, { category: "Insurance", label: "Long-term disability", amount: 120, startDate: "2026-01", endDate: "2032-12", kind: "monthly" }];
const EXP_HI = [{ category: "Living", label: "Household", amount: 8500, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const example = async () => { await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); for (let i = 0; i < 3; i++) await flush(); };

// ── reading the Grade card (t90's reader, plus the weight's denominator) ─────────────────────────────────────────
const NAMES = ["Monte Carlo Success", "Income Floor", "Sequence Protection", "LTC / Tail Risk", "Tax Efficiency", "Cost Structure", "Guardrail Readiness", "Diversification", "Estate Readiness"];
const FIXED_CATS = ["LTC / Tail Risk", "Tax Efficiency", "Diversification", "Income Floor"];   // v6.29: the three `fixed: true` grades (v6.27, F-22) and Income Floor, whose line (gap months) its grade does not read
const readCard = t => {
  const m = t.match(/Overall grade([A-D][+-]?)GPA: (\d\.\d\d) \/ 4\.00/);
  const a0 = t.indexOf("Category detail"), b0 = t.indexOf("Top grade drags");
  const det = a0 >= 0 ? t.slice(a0, b0 > a0 ? b0 : undefined) : "";
  const cats = {};
  NAMES.forEach((n, i) => {
    const a = det.indexOf(n + "Weight:"); if (a < 0) return;
    const nx = i + 1 < NAMES.length ? det.indexOf(NAMES[i + 1] + "Weight:", a) : -1;
    const seg = det.slice(a, nx > a ? nx : undefined).replace(/[A-D][+-]?$/, "");
    const gp = (seg.match(/GPA: (\d\.\d)/) || [])[1];
    const w = (seg.match(/Weight: (\d+)( of (\d+)|%)/) || []);
    cats[n] = { gpa: gp ? Number(gp) : NaN, w: Number(w[1]), of: w[3] ? Number(w[3]) : null, pct: w[2] === "%", seg };
  });
  const dr = b0 >= 0 ? t.slice(b0) : "";
  const drags = [...dr.matchAll(/#(\d)(.+?)(?: [†‡])?\(([A-D][+-]?)\)Lost ~(\d+\.\d\d) GPA points \(weight (\d+)(?: of (\d+)\)|%\))/g)]
    .map(x => ({ n: Number(x[1]), name: x[2].replace(/[†‡]/g, "").trim(), grade: x[3], lost: Number(x[4]), w: Number(x[5]), of: x[6] ? Number(x[6]) : null }));
  return { grade: m && m[1], gpa: m ? Number(m[2]) : NaN, cats, drags, text: t };
};

// ── render the plans ──────────────────────────────────────────────────────────────────────────────
const LINT_TABS = ["my data", "dashboard", "trajectory", "expenses", "income", "ss", "grade", "ranking", "guardrails", "withdrawal", "roth", "taxes", "irmaa",
  "monte carlo", "backtest", "what breaks", "survivor", "stress", "checklist", "exit plan", "positions", "skins", "verify", "events"];
// "ask AI" is not linted: it shows the demo briefing and the ground rules, both addressed to the AI (scope §4). "docs" is the Field Manual, linted from DOCS_HTML below.
const PLANS = [
  ["example", example, LINT_TABS],
  ["couple", async () => { await seed(filled(), EXP); await save(); }, LINT_TABS],
  ["single", async () => { await seed(single(), EXP); await save(); }, LINT_TABS],
  ["couple+LTC", async () => { await seed(filled(), EXP_LTC); await save(); }, ["grade", "monte carlo"]],
  ["low", async () => { await seed(filled(), EXP_HI); await save(); }, ["grade", "guardrails"]],
  ["couple+disability", async () => { await seed(filled(), EXP_DIS); await save(); }, ["grade", "monte carlo"]],
  ["couple, B higher", async () => { await seed(bHigher(), EXP); await save(); }, ["ss"]],
];
const R = {};
// the schedule renders as rows of blocks: a row opens with its year block; its "From Source(s)" cell is one block such as "Tax $2K, Cash $21K"
const schedRows = () => { const b = blocks(); const a = b.indexOf("EOY Portfolio"), z = b.findIndex((x, i) => i > a && /^Section B/.test(x)); if (a < 0) return [];
  const rows = []; let cur = null;
  for (const x of b.slice(a + 1, z > a ? z : undefined)) {
    if (/^20\d\d$/.test(x)) { cur = { yr: Number(x), src: null }; rows.push(cur); continue; }
    if (cur && cur.src === null && /^((Tax|Cash|Bonds|Equity|Hedge|Other|Roth)[A-Za-z ]* \$[\d.,]+[KM]?(, )?)+$/.test(x)) cur.src = x; }
  return rows; };
let ROWS = [];   // the example's schedule, read while the example is mounted (re-seeding the example later in this process rendered the previous plan's schedule — seen at the build)
for (const [name, build, tabs] of PLANS) { await build(); R[name] = {}; for (const t of tabs) R[name][t] = await tabText(t);
  if (name === "example") { await go("withdrawal"); await flush(200); ROWS = schedRows(); } }
const GR_CARD = {}; for (const k of ["example", "couple", "single", "couple+LTC", "low", "couple+disability"]) GR_CARD[k] = readCard(R[k].grade.card);

// ── A (continued) · the directive lint, rendered ─────────────────────────────────────────────────────────
console.log("  A — the directive lint (24 rendered tabs × 3 plans, and the Field Manual)");
const VERB = /^(convert|pay (the|your|it|conversion)|elect|build|cut|raise|increase|fill|tap|withdraw|draw (from|down)|execute|consider|roll|claim at|delay (claiming|ss|social)|buy|sell|rebalance|harvest|reserve|avoid|start (convert|withdraw|draw|claim)|coordinate|trim|don['’]t|do not|secure(?! 2\.0)|maximi[sz]e|minimi[sz]e|prioriti[sz]e|keep (at least|\d)|lock in|file (for|your ss)|shift|move (money|assets|funds)|front-load|top up|refill)\b/i;
const NORM = /\b(ideal|optimal|optimi[sz]er|optimization lever|recommended|recommendation:|the safe move|standard advice|classic guideline|usually better|argues for|highest-value|ACTION:|you should|should be|must be)\b/i;
const sentences = s => s.split(/(?<=[.!?;:→])\s+|\s+[→•]\s+|\n/).map(x => x.replace(/^[\s\-–—•·▸►✓✗⚠▲▼★☐☑#\d.)(]+/, "").trim()).filter(Boolean);
const lintHits = (where, list) => { const out = []; for (const b of list) for (const s of sentences(b)) if (VERB.test(s) || NORM.test(s)) out.push({ where, s }); return out; };
// Each allowed hit, named. [where-pattern, sentence-pattern, reason]
const ALLOW = [
  [/^my data$/, /^Don't enter income as a negative expense here/, "data entry: where to type a figure"],
  [/^my data$/, /^Below 100% of FPL the model shows \$0/, "describes the model (its placeholder for not-modelled Medicaid)"],
  [/^roth$/, /^(CONVERT|Convert|FILL \d+%( BRACKET)?)$/, "a column header or a strategy's name in the comparator, not an instruction"],
  [/^checklist$/, /^File for your Social Security benefit at your chosen age\.$/, "paperwork at the age the household chose (DF-6)"],
  [/^checklist$/, /^Secure record of accounts, logins/, "estate paperwork (a record for a survivor)"],
  [/^exit plan$/, /^LOCK IN HEALTH COVERAGE$/, "a phase title kept by decision (DF-3): a coverage gap is a landmine, not a financial choice"],
  [/^events$/, /^A conversion counts for the calendar year it is completed in/, "tax law: the conversion deadline is Dec 31"],
  // the Field Manual
  [/^FM:⚠ READ BEFORE USING/, /^Do not rely on this app to make any financial decision\.$/, "the disclaimer"],
  [/^FM:What's new/, /./, "release history"],
  [/^FM:Inflation assumptions/, /^[Ww]here an assumption must be picked, (the app picks|pick) the direction that makes the plan look slightly worse/, "the design rule, stated (v6.29: \"the app picks\")"],
  [/^FM:Taxes strategy/, /^(Convert too little|convert too much)/, "the trade-off, stated both ways, not a choice"],
  [/^FM:08 Entering Your Data/, /^Fill in what applies, then press Save & Apply/, "data entry"],
  [/^FM:09 The Master Prompt/, /^where it asks for a recommendation/, "describes the AI ground rules"],
  [/^FM:How safe is this\?/, /it must be readable/, "privacy: how the key is read"],
  [/^FM:Where your data actually lives/, /^Don't take this manual's word for it\.$/, "privacy: check it yourself"],
  [/^FM:14 Troubleshooting/, /^(Reserve depletion is not bankruptcy|Trim attachments)/, "the SS trust fund's reserve (a noun); an attachment limit"],
];
const allowed = h => ALLOW.some(([w, s]) => w.test(h.where) && s.test(h.s));
let RHITS = [];
for (const k of ["example", "couple", "single"]) for (const t of LINT_TABS) RHITS.push(...lintHits(t, R[k][t].blocks).map(h => ({ ...h, plan: k })));
// the Field Manual, by section (jsdom, not a regex strip)
const FMHITS = (() => { const doc = new JSDOM(DOCS).window.document; doc.querySelectorAll("style,script").forEach(e => e.remove());
  let sect = ""; const W = doc.createTreeWalker(doc.body, 1); let e; const out = [];
  while ((e = W.nextNode())) { if (/^H[1-3]$/.test(e.tagName)) sect = e.textContent.replace(/\s+/g, " ").trim().slice(0, 40);
    if (/^(P|LI|TD|TH|DT|DD|H[1-4])$/.test(e.tagName)) out.push(...lintHits("FM:" + sect, [e.textContent.replace(/\s+/g, " ").trim()])); }
  // a §13 release entry quotes what it removed — the history exception, by structure (an <li> that opens with "<strong>… (vX.YY).")
  // and a sentence that opens "Through v6.2x" is history by construction (what an earlier build did)
  return out.filter(h => !/\(v\d+\.\d+\)\./.test(h.s) && !/^Through v6\.2\d/.test(h.s)); })();
const BAD = [...RHITS, ...FMHITS].filter(h => !allowed(h));
const uniq = xs => [...new Map(xs.map(h => [`${h.where}|${h.s}`, h])).values()];
T("A-2: SETUP — the lint read every tab on the three plans (each tab rendered text), and found the named allowances it expects (the net is live)",
  ["example", "couple", "single"].every(k => LINT_TABS.every(t => R[k][t].text.length > 200)) && [...RHITS, ...FMHITS].some(allowed),
  ["example", "couple", "single"].flatMap(k => LINT_TABS.filter(t => R[k][t].text.length <= 200).map(t => `${k}/${t}`)).join(", "));
if (POST) {
  // the allow-list cannot be widened into a hole: every entry is used, and no entry's sentence pattern would pass a plain directive
  // (outside the Field Manual's release history, which is all quotation)
  const CANARIES = ["Convert $50K this year to fill the 22% bracket.", "Pay the tax from the taxable account.", "Claim at 70.", "CONVERT EVERY YEAR"];
  const unused = ALLOW.filter(a => ![...RHITS, ...FMHITS].some(h => a[0].test(h.where) && a[1].test(h.s)));
  T("A-4: every allow-list entry is used on this leg (none is stale)", unused.length === 0, unused.map(a => a[2]).join("; "));
  const holes = ALLOW.filter(([w, s]) => !/^\^FM:What's new/.test(w.source) && (!w.source.startsWith("^") || CANARIES.some(c => s.test(c))));
  T("A-4b: no allow-list entry is a catch-all: each names its tab or section (anchored) and none passes a plain directive", holes.length === 0, holes.map(a => `${a[0]} ${a[1]} (${a[2]})`).join("; "));
  T("A-3: no rendered sentence on any tab of the three plans, nor in the Field Manual, opens with a financial directive or uses a normative term — except the named allowances",
    BAD.length === 0, uniq(BAD).slice(0, 12).map(h => `[${h.where}${h.plan ? "/" + h.plan : ""}] ${h.s.slice(0, 120)}`).join(" ‖ "));
} else {
  T(`A-3 ${KD}: the lint finds directives the v6.28 copy removed (at least 20 distinct)`, uniq(BAD).length >= 20, uniq(BAD).length);
}

// ── B · F-24, the Grade tab's points ────────────────────────────────────────────────────────────────────
console.log("  B — the Grade tab's weights and lost points (F-24)");
const GK = Object.keys(GR_CARD);
T("B-0: SETUP — every plan rendered a Grade card with all nine categories and their weights", GK.every(k => GR_CARD[k].grade && NAMES.every(n => GR_CARD[k].cats[n] && Number.isFinite(GR_CARD[k].cats[n].w) && Number.isFinite(GR_CARD[k].cats[n].gpa))),
  GK.map(k => `${k}:${Object.keys(GR_CARD[k].cats).length}`).join(" "));
const WSUM = NAMES.reduce((s, n) => s + GR_CARD.example.cats[n].w, 0);
T(`B-0b: SETUP — the nine weights sum to 78`, WSUM === 78, WSUM);
// what the drags SHOULD be, from the rendered GPAs and weights: lost = (4 − gpa) × w / 78; shown = raw (4 − gpa) × w > 5, largest first, at most three
const expectDrags = c => NAMES.map(n => ({ name: n, raw: (4 - c.cats[n].gpa) * c.cats[n].w, lost: (4 - c.cats[n].gpa) * c.cats[n].w / WSUM }))
  .filter(d => d.raw > 5).sort((a, b) => b.raw - a.raw).slice(0, 3);
const EXAMPLE_KEYS_V627 = ["Estate Readiness", "LTC / Tail Risk", "Income Floor"];
if (POST) {
  T("B-1: every category's weight reads 'N of 78', never a percent", GK.every(k => NAMES.every(n => GR_CARD[k].cats[n].of === 78 && !GR_CARD[k].cats[n].pct)));
  T("B-2: on every plan each 'Lost ~X GPA points' is (4 − the category's rendered GPA) × weight / 78, to the cent of a point",
    GK.every(k => GR_CARD[k].drags.length > 0 && GR_CARD[k].drags.every(d => { const c = GR_CARD[k].cats[d.name]; return c && Math.abs((4 - c.gpa) * c.w / 78 - d.lost) <= 0.005 + 1e-9 && d.of === 78; })),
    GK.map(k => `${k}: ${GR_CARD[k].drags.map(d => `${d.name} ${d.lost} (${GR_CARD[k].cats[d.name] ? ((4 - GR_CARD[k].cats[d.name].gpa) * GR_CARD[k].cats[d.name].w / 78).toFixed(3) : "?"})`).join(", ")}`).join(" | "));
  T("B-3: the drags shown are those losing more than 5 raw points (gpa gap × weight), largest first, at most three — the same set v6.27 showed",
    GK.every(k => JSON.stringify(GR_CARD[k].drags.map(d => d.name)) === JSON.stringify(expectDrags(GR_CARD[k]).map(d => d.name))),
    GK.map(k => `${k}: ${GR_CARD[k].drags.map(d => d.name).join("/")} vs ${expectDrags(GR_CARD[k]).map(d => d.name).join("/")}`).join(" | "));
  T("B-3b: the example's drags are v6.27's three, in v6.27's order", JSON.stringify(GR_CARD.example.drags.map(d => d.name)) === JSON.stringify(EXAMPLE_KEYS_V627));
  T("B-3c: the overall GPA is still the weight-averaged category GPA over 78 (the denominator the drags use)",
    GK.every(k => Math.abs(NAMES.reduce((s, n) => s + GR_CARD[k].cats[n].gpa * GR_CARD[k].cats[n].w, 0) / 78 - GR_CARD[k].gpa) < 0.006));
  T("B-4: a category reads STATUS only at GPA 4.0, and DRAG otherwise, on every plan",
    // v6.29 (F-25, DF-11 a): a FIXED category's sentence is one the grade does not read, so it is labelled NOTE, not DRAG
    GK.every(k => NAMES.every(n => { const c = GR_CARD[k].cats[n]; const fx = ["v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636"].includes(VER) && FIXED_CATS.includes(n);
      return (c.gpa === 4.0) === /STATUS:/.test(c.seg) && (c.gpa < 4.0 && !fx) === /DRAG:/.test(c.seg) && (c.gpa < 4.0 && fx) === /NOTE:/.test(c.seg); })),
    GK.flatMap(k => NAMES.filter(n => { const c = GR_CARD[k].cats[n]; return (c.gpa === 4.0) !== /STATUS:/.test(c.seg); }).map(n => `${k}/${n} ${GR_CARD[k].cats[n].gpa}`)).join(", "));
  T("B-5: the Monte Carlo category says, on every plan, that its rate is the 6-year Monte Carlo's and that it carries no long-term-care event",
    GK.every(k => /This rate comes from the 6-year Monte Carlo, which carries no long-term-care event|the 6-year Monte Carlo, which carries no long-term-care event/.test(GR_CARD[k].cats["Monte Carlo Success"].seg)));
  T("B-6: Income Floor names what it counts (Social Security and the pension; income streams not counted), and its drag states months, not a dollar figure",
    GK.every(k => { const s = GR_CARD[k].cats["Income Floor"].seg; const d = (s.split(/DRAG:|NOTE:/)[1] || "");   /* v6.29: Income Floor's line is labelled NOTE */ return /Social Security and the pension/.test(s) && /Income streams are not counted here/.test(s) && !/\$/.test(d); }),
    GR_CARD.example.cats["Income Floor"].seg.slice(0, 300));
  T("B-7: Estate Readiness makes no legal claim (court guardianship, override the will, never locate) and no directive",
    GK.every(k => !/guardianship|override the will|never locate|real risk|Complete these/.test(GR_CARD[k].cats["Estate Readiness"].seg)));
  T("B-8: the disability plan reads 'No LTC / long-term-care line' on the Grade tab, and the example and couple+LTC still read 'An LTC … line is in your expenses'",
    /No LTC \/ long-term-care line is in your expenses/.test(GR_CARD["couple+disability"].cats["LTC / Tail Risk"].seg)
      && ["example", "couple+LTC"].every(k => /An LTC \/ long-term-care line is in your expenses/.test(GR_CARD[k].cats["LTC / Tail Risk"].seg)));
  const prem = k => (R[k]["monte carlo"].text.match(/Premiums: (an LTC|no LTC premium line)/) || [])[1];
  T("B-8b: the Monte Carlo tab's LTC card agrees — no premium line on the disability plan, a premium line on couple+LTC",
    prem("couple+disability") === "no LTC premium line" && prem("couple+LTC") === "an LTC", `${prem("couple+disability")} / ${prem("couple+LTC")}`);
} else {
  T(`B-1 ${KD24}: weights print as percents ('Weight: N%')`, GK.every(k => NAMES.every(n => GR_CARD[k].cats[n].pct)));
  T(`B-2 ${KD24}: each 'Lost ~X' is (4 − gpa) × weight / 100 — understated by 78/100 against the 78-point average`,
    GK.every(k => GR_CARD[k].drags.every(d => { const c = GR_CARD[k].cats[d.name]; return c && Math.abs((4 - c.gpa) * c.w / 100 - d.lost) <= 0.005 + 1e-9; })));
  T(`B-3 ${KD24}: the example's drags are Estate, LTC, Income Floor (the set v6.28 keeps)`, JSON.stringify(GR_CARD.example.drags.map(d => d.name)) === JSON.stringify(EXAMPLE_KEYS_V627));
  T(`B-8 ${KD24}: the disability plan is told an LTC line is in its expenses`, /An LTC \/ long-term-care line is in your expenses/.test(GR_CARD["couple+disability"].cats["LTC / Tail Risk"].seg));
  T(`B-6 ${KD}: Income Floor's drag states a dollar gap figure`, /requires ~\$\d/.test(GR_CARD.example.cats["Income Floor"].seg));
}

// ── C · the rendered tabs ───────────────────────────────────────────────────────────────────────────────
console.log("  C — the rendered tabs");
const pc = x => Math.round(x * 100);
const gx = R.example.guardrails.text, gl = R.low.guardrails.text;
if (POST) {
  T("C-1: Guardrails states the Monte Carlo's rule with GUARDRAILS' own figures, and that no engine changes a conversion",
    gx.includes(`The Monte Carlo's rule: below ${pc(G.lower)} % of plan it cuts monthly spending ${pc(G.cut)} %; above ${pc(G.upper)} % it raises it ${pc(G.raise)} %, each change compounding on the last.`)
      && /No engine changes a Roth conversion here\./.test(gx), gx.slice(0, 400));
  T("C-1b: Guardrails' three bands read MODEL: cuts / unchanged / raises, with GUARDRAILS' figures",
    gx.includes(`MODEL: cuts monthly spending ${pc(G.cut)} %`) && gx.includes("MODEL: spending unchanged (inflation-adjusted)") && gx.includes(`MODEL: raises monthly spending ${pc(G.raise)} %`));
  T("C-1c: no ACTION line and no Roth instruction on the Guardrails tab, on the example or the low plan", [gx, gl].every(t => !/ACTION:|boost Roth|redirect to Roth|Cut next year/.test(t)));
  // the Status column's cells: every all-caps block between the "Status" header and the interpretation card
  const chips = b => { const a = b.indexOf("Status"), z = b.indexOf("Guardrail interpretation"); return a >= 0 ? b.slice(a + 1, z > a ? z : undefined).filter(x => /^(?:[✓⚠▲✗!]\s)?[A-Z][A-Z ]{3,}$/.test(x)) : []; };
  const cx = [...chips(R.example.guardrails.blocks), ...chips(R.low.guardrails.blocks)];
  T("C-1d: every status chip is one of the band readings (no instruction in a chip)", cx.length >= 6 && cx.every(c => /^(✓ WITHIN BANDS|⚠ BELOW LOWER BAND|▲ ABOVE UPPER BAND|ACCUMULATING)$/.test(c)), [...new Set(cx)].join(", "));
} else {
  T(`C-1 ${KD}: Guardrails prints ACTION lines, one of them "boost Roth conversions"`, /ACTION:/.test(gx) && /boost Roth conversions/.test(gx));
}
// Withdrawal: read the schedule table from the DOM — the year the taxable pool is first not enough (a sleeve appears in "From Source(s)")
const firstSleeve = (ROWS.find(r => /Cash|Bonds|Equity|Hedge/.test(r.src || "")) || {}).yr;
const wx = R.example.withdrawal.text, wc = R.couple.withdrawal.text;
T("C-2: SETUP — the example's schedule table is read (years and sources), from its retirement year 2029", ROWS.length >= 20 && ROWS[0].yr === 2029 && Number.isFinite(firstSleeve), `${ROWS.length} rows; first sleeve year ${firstSleeve}`);
if (POST) {
  const drawn = (wx.match(/Drawn first: reaches \$0 in (\d{4})/) || [])[1];
  T(`C-2b: Priority 1's "Drawn first" year (${drawn}) is the schedule's first year a sleeve is drawn (${firstSleeve}) — the pool runs out that year`, Number(drawn) === firstSleeve, `${drawn} vs ${firstSleeve}`);
  T("C-2c: Withdrawal's subtitle and Section C name what the schedule models; no comparison, no Recommendation",
    /The order it draws from │ What the schedule models/.test(wx) && /Section C — what this schedule models/.test(wx) && !/Recommendation:|Recommended|strategy comparison/i.test(wx));
  T("C-2d: the holdings card says Traditional and Roth are drawn in proportion within each sleeve (not Roth last), on the example and the couple",
    [wx, wc].every(t => /Traditional and Roth money is drawn in proportion within each sleeve/.test(t) && !/Roth last|Roth \(last\)/i.test(t)));
  T("C-2e: the steps say the schedule pays no income tax and applies no guardrail, and Step 4's draw order is the engine's",
    /Tax: this schedule pays no income tax/.test(wx) && /Step 4: The shortfall is drawn from the Priority-1 pool, then cash, bonds, equities and hedges — Traditional and Roth in proportion within each\./.test(wx)
      && /Step 7: Guardrails: this schedule applies none; the Monte Carlo cuts or raises spending/.test(wx), (wx.match(/Step 6:.{0,300}/) || [""])[0]);
} else {
  T(`C-2b ${KD}: Withdrawal's Step 7 tells the household to pay conversion tax from the taxable account`, /Pay conversion taxes from Taxable account/.test(wx));
}
// Exit Plan
const ex = R.example["exit plan"].text, es = R.single["exit plan"].text;
if (POST) {
  T("C-3: Exit Plan's phases are the dates and paperwork — titles recast, no directive", /Exit plan — the dates and paperwork/i.test(ex) && /FILE SOCIAL SECURITY/.test(ex) && /WITHDRAWALS BEGIN/.test(ex)
    && !/Don't give notice|Elect the pension|Build 1–2 years|highest-value|anchor on the generic/.test(ex));
  T("C-3b: the pension sentence states the model's assumption (joint-and-survivor) for the example couple", /The model assumes a joint-and-survivor option that continues the pension in full to a survivor\./.test(ex));
  T("C-3c: a single plan is not told about a joint-and-survivor election", !/joint-and-survivor/.test(es), (es.match(/.{60}joint-and-survivor.{40}/) || [""])[0]);
} else {
  T(`C-3 ${KD}: Exit Plan tells the household to elect the pension's option and to build a cash reserve`, /Elect the pension/.test(ex) && /Build 1–2 years/.test(ex));
}
// SS — V-1 (IRMAA/MAGI) and V-12 (the survivor card names the plan's own larger check)
const sx = R.example.ss.text, sb = R["couple, B higher"].ss.text;
if (POST) {
  T("C-4: SS tab: taxable Social Security is part of MAGI (V-1), and the headings carry no optimizer", /IRMAA: taxable Social Security is part of MAGI/.test(sx) && !/OPTIMIZATION LEVER|OPTIMIZER/.test(sx) && /HOUSEHOLD LIFETIME COMPARISON/.test(sx));
  T("C-4b: the survivor card names the larger benefit at FRA — Spouse A on the example (A's FRA $3,300 > B's $1,800)", /Spouse A has the larger benefit at full retirement age/.test(sx), (sx.match(/.{30}has the larger benefit.{60}/) || [""])[0]);
  T("C-4c: …and Bo on a couple whose B has the larger check (V-12: v6.27 named A on every couple)", /Bo has the larger benefit at full retirement age/.test(sb) && !/Ann has the larger benefit/.test(sb), (sb.match(/.{30}has the larger benefit.{60}/) || [""])[0]);
  T("C-4d: no pronoun for a spouse on the card (the plan has no sex field)", !/\b(his|her) (claim|own|claiming)/.test(sx + sb));
} else {
  T(`C-4 ${KD}: the survivor card calls A the higher earner even when B's check is larger`, /Ann is the higher earner/.test(sb) || /is the higher earner/.test(sb));
}
// the rest, one sentence each
const one = (k, tab) => R[k][tab].text;
if (POST) {
  T("C-5: Survivor names the comparator's Single years, not a case for converting", /The Roth tab's comparator includes the survivor's Single years/.test(one("example", "survivor")) && !/argues for|front-load/i.test(one("example", "survivor")));
  T("C-6: IRMAA: the Roth slider sets the conversion amount in each conversion year's MAGI (not every year's)", /The Roth slider sets the conversion amount in the MAGI of each conversion year/.test(one("example", "irmaa")));
  T("C-7: Stress: the cash-and-bond share is a fact, and the Monte Carlo draws at its mix — no 'Reserve defense'", /the Monte Carlo draws from the whole portfolio at its mix/.test(one("example", "stress")) && !/Reserve defense/.test(one("example", "stress")));
  T("C-8: Income: the gap is drawn from the portfolio, and the draw source is each engine's", /the model draws it from the portfolio/.test(one("example", "income"))
    && /in the Withdrawal tab's schedule from Other accounts first, then cash, bonds(,| and) equities( and hedges)?; in the Monte Carlo from the whole portfolio at its mix/.test(one("example", "income")));   // v6.29 (F-25): "and hedges"
  T("C-9: Dashboard: the guardrails are the Monte Carlo's and the schedule applies none", /The Monte Carlo's guardrails cut monthly spending/.test(one("example", "dashboard")) && /the Withdrawal tab's year-by-year schedule applies none/.test(one("example", "dashboard")));
  T("C-10: Roth: the amount and the tax payment are the household's settings, not an ideal", /Conversion amount: the slider, \$/.test(one("example", "roth")) && /Tax payment: set in Step 2 below/.test(one("example", "roth"))
    && !/\(ideal\)|classic guideline|standard advice/.test(one("example", "roth")));
  T("C-11: Checklist: the irrevocable trust is a question for an estate attorney, not a suggestion", /whether one fits is a question for an estate attorney/.test(one("example", "checklist")) && !/Consider whether/.test(one("example", "checklist")));
}
// the build review's findings, rendered (POST only)
if (POST) {
  // the JSX element that holds the "Starting Traditional:" text: what does it print?
  const stEl = all(AST, n => n.type === "JSXElement" && n.children.some(c => c.type === "JSXText" && c.value.includes("Starting Traditional:")));
  const stIds = stEl.length === 1 ? idents(stEl[0]) : new Set();
  T("C-13: the holdings card's Starting Traditional is the holdings' own (_posTradW), not _tradInit, which also counts Other-account money already in Priority 1",
    stEl.length === 1 && stIds.has("_posTradW") && !stIds.has("_tradInit") && /Starting Traditional: \$ ?\d+ ?K ?; Roth:/.test(wx), `${stEl.length} / ${[...stIds].filter(x => /trad/i.test(x)).join(",")}`);
  T("C-13b: Exit Plan's income line counts income streams; its conversion years are not said to end before RMDs", /Guaranteed income in the model: Social Security.{0,60} and any income streams you entered( \(the Backtest and What Breaks count Social Security and the pension only\))?\./.test(ex) && !/before RMDs\./.test(ex));
  const cobra = all(AST, n => n.type === "ConditionalExpression" && n.consequent.type === "Literal" && /cannot span this gap alone/.test(String(n.consequent.value)) && n.alternate.type === "Literal" && /can span this gap/.test(String(n.alternate.value)));
  T("C-13c: the COBRA sentence follows the gap's length (> 18 months: cannot span; otherwise can) — the example's 24-month gap reads 'cannot'",
    cobra.length === 1 && /COBRA lasts at most 18 months, so it cannot span this gap alone/.test(ex), cobra.length);
  const sg = ["events", "withdrawal", "exit plan"].map(t => R.single[t].text).join(" ");
  T("C-13d: a single plan reads no survivor, no 'both of you', no 'each spouse' on Events, Withdrawal or Exit Plan, and no 'both of you' on the Checklist",
    !/survivor|both of you|each spouse/i.test(sg) && !/both of you/i.test(R.single.checklist.text), (sg.match(/.{50}(survivor|both of you|each spouse).{30}/i) || R.single.checklist.text.match(/.{50}both of you.{30}/i) || [""])[0]);
  T("C-13e: the Events legend states the window, not 'go' or 'prepare'", !/window open: go|getting close: prepare/.test(one("example", "events")) && /GREEN — window open/.test(one("example", "events")));
  T("C-13f: only the larger benefit's claim age is said to set the survivor's check (Exit Plan, couple)", /for the spouse with the larger benefit it also gives a smaller survivor check/.test(ex) && !/, and a smaller survivor benefit/.test(ex));
}
// Events — dated items from the app module, in a child process
{
  const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--events"], { cwd: HERE, encoding: "utf8", timeout: 600000, env: { ...process.env } });
  const line = (ch.stdout || "").split("\n").find(l => l.startsWith("EVENTS:")); const E = line ? JSON.parse(line.slice(7)) : null;
  T("C-12: SETUP — the child read the Events items on 2030-11-15 (inside the example's conversion years) and 2026-11-15", !!E && E.inLadder.length > 5 && E.before.length > 5, (ch.stdout || "").slice(-200) + (ch.stderr || "").slice(-300));
  if (E) {
    const roth = E.inLadder.find(e => e.key === "roth") || {}, rmd = E.inLadder.find(e => e.key === "rmd") || {};
    if (POST) {
      T("C-12b: the Roth item is a deadline IF converting, says the choice is the household's, and tells no one how to pay",
        roth.title === "Roth conversion deadline (if converting this year)" && /Whether to convert, and how much, is your choice/.test(roth.instructions || "") && !/Pay the tax from/.test(roth.instructions || ""), JSON.stringify([roth.title, (roth.instructions || "").slice(0, 200)]));
      T("C-12c: its years are the plan's conversion years", !!E.tl && (roth.instructions || "").includes(`${E.tl.s}–${E.tl.e}`), JSON.stringify(E.tl));
      T("C-12d: the RMD item states the fact of deferring the first RMD (two RMDs in one year), not that it is 'usually better'",
        /puts two RMDs in \d{4}'s taxable income/.test(rmd.instructions || "") && !/usually better/.test(rmd.instructions || ""), (rmd.instructions || "").slice(0, 300));
    } else {
      T(`C-12b ${KD}: the Roth item says to pay the tax from the taxable account`, /Pay the tax from the taxable account/.test(roth.instructions || ""));
    }
  }
}

// ── F · the Field Manual and METHODOLOGY ──────────────────────────────────────────────────────────────────
console.log("  F — the Field Manual and METHODOLOGY");
const FMSEC = h => { const a = DOCS.indexOf(h); const b = DOCS.indexOf('<div class="tabentry">', a + 10); return a >= 0 ? new JSDOM(DOCS.slice(a, b > a ? b : a + 6000)).window.document.body.textContent.replace(/\s+/g, " ") : ""; };
const fG = FMSEC("<h3>Guardrails"), fW = FMSEC("<h3>Withdrawal"), fE = FMSEC("<h3>Exit"), fS = FMSEC("<h3>Survivor");
T("F-0: SETUP — the Guardrails, Withdrawal, Exit Plan and Survivor entries are found", [fG, fW, fE, fS].every(s => s.length > 100));
if (POST) {
  T("F-1: the Guardrails entry gives the Monte Carlo's rule with GUARDRAILS' figures and says no engine changes a conversion",
    fG.includes(`below the lower band (${pc(G.lower)}% of the planned path) it cuts monthly spending ${pc(G.cut)}%, above the upper band (${pc(G.upper)}%) it raises it ${pc(G.raise)}%`) && /No engine changes a Roth conversion/.test(fG));
  T("F-2: the Withdrawal entry says Traditional and Roth are drawn in proportion, and the schedule pays no income tax and applies no guardrail",
    /Traditional and Roth drawn in proportion within each sleeve/.test(fW) && /The schedule pays no income tax/.test(fW) && /applies no guardrail \(the Monte Carlo does\)/.test(fW));
  T("F-3: the Exit Plan and Survivor entries describe, not direct", /are yours; each step says what the model assumes/.test(fE) && /comparator includes those Single years/.test(fS) && !/Argues for/.test(fS));
  const i28 = DOCS.search(/<li><strong>[^<]*\(v6\.28\)\.<\/strong>/), i27 = DOCS.search(/<li><strong>[^<]*\(v6\.27\)\.<\/strong>/);
  T("F-4: §13 records the change (v6.28), first in its release list", i28 >= 0 && i27 > i28, `${i28} / ${i27}`);
  const METH = (() => { const p = join(HERE, "..", "METHODOLOGY.md"); return existsSync(p) ? readFileSync(p, "utf8") : ""; })();
  const m9 = (() => { const a = METH.indexOf("## 9. Withdrawal sequencing"); const b = METH.indexOf("\n## ", a + 5); return a >= 0 ? METH.slice(a, b > a ? b : undefined) : ""; })();
  T("F-5: METHODOLOGY §9 says the schedule applies no guardrails and computes no income tax, and the guardrails are the Monte Carlo's",
    /applies \*\*no\s+guardrails\*\*/.test(m9) && /computes \*\*no income tax\*\*/.test(m9) && /The guardrails are the Monte Carlo's/.test(m9) && !/presents cash-first, tax-optimized, and\s+fixed-real strategies/.test(m9), m9.slice(0, 300));
} else {
  T(`F-1 ${KD}: the Field Manual's Roth section heads "PAY CONVERSION TAX FROM OUTSIDE FUNDS"`, DOCS.includes("PAY CONVERSION TAX FROM OUTSIDE FUNDS"));
}

finished = true;
console.log(`t91 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
