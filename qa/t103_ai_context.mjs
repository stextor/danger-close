// t103_ai_context.mjs — v6.39 (D-69; docs/SCOPE_D69_AI_CONTEXT_V639.md): Ask AI is told what accounts the plan holds and what it contributes.
//
// WHAT IT PINS. Through v6.38 the request described the plan's accounts as three totals ("in retirement accounts", "other", "401(k) contribs")
// and nothing more, so a plan holding an HSA was told it had none; and the ground rules' "if something you need is missing, say so" turned the
// gap into a false statement about the plan. From v6.39 one module-level helper, aiPlanFacts(P), builds an Accounts block and a Contributions
// line from the SAVED plan on every question — every account type totalled by owner, never by name — and the rules tell the model to say a
// fact was not sent, and ask, rather than conclude the plan lacks it. The four lists of what is sent say so.
//
// §B is the extinction check for the class: every key My Data's buildPortfolio saves (enumerated by AST, so a key added later is seen) is
// either reached in the text the request carries — proved on a fixture whose every value is distinct, so a figure can only appear if its own
// field put it there — or on EXCLUDED below, each with its reason. A key with neither fails.
//
// Both legs: node t103_ai_context.mjs v638 | node t103_ai_context.mjs v639. The v6.38 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-30, D-69 — flips at v6.39]. §F (the engines do not move) runs in a child process (`--engines`) on the v6.39 leg when
// the run folder holds app_v638.mjs. Text is read from the Ask AI tab's EXACTLY WHAT'S SENT panel and from a recording fetch; no live model is
// called. What a model does with the text no test can show. Controls: qa/tools/controls_v639_ai_context.py (repo-only).
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v639";
const ENGINES = process.argv.includes("--engines");
const KNOWN_VERSIONS = ["v638", "v639", "v640"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v639", "v640"].includes(VER);   // an array, so the next registration widens it
const PRIOR_OF = { v639: "v638", v640: "v639" };     // §F's comparison module, by tag (a map: give the next tag its own arm)
const KD = "[KNOWN DEFECT 2026-10-30, D-69 — flips at v6.39]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => JSON.stringify(v, (k, x) => (typeof x === "number" && !Number.isFinite(x)) ? String(x) : x);

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t103 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

// ════ §F, in its own process: Engines B, C and D, the Monte Carlo's schedule and the opening balances, against v6.38's module ════════════
if (ENGINES) {
  const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
  const PM = await import(pathToFileURL(join(HERE, `app_${PRIOR_OF[VER]}.mjs`)).href);
  const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const g = M.__g, pg = PM.__g;
  const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
  const HH = [["example", clone(P0)]];
  for (const n of Object.keys(fx.HOUSEHOLDS).slice(0, 4)) { g.applyLoadedData({ portfolio: clone(P0), expenses: clone(X0) }); HH.push([`fixture:${n}`, fx.build(g, n)]); }
  let n = 0; const diff = [];
  for (const [lab, P] of HH) for (const roth of [0, 70000]) {
    const out = [];
    for (const [G, Mod] of [[g, M], [pg, PM]]) {
      G.applyLoadedData({ portfolio: clone(P), expenses: clone(X0) }); G.applyScenarioProbs(G.PROB_PRESETS().bull.probs);
      const R = G.PLAN_TIMELINE().targetRetireYear;
      const ser = G.withdrawalPlanSeries({ retireYear: R, rothAmount: roth, scenarioPreset: "bull" });
      const A = { retireYear: R, rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, gainByYr: ser.gainByYr, ordDrawByYr: ser.ordDrawByYr };
      out.push(canon({ rsb: G.retireStartBalances(R), ser, B: Mod.__engines.computeTaxPlan(A).rows, C: Mod.__engines.computeIrmaaPlan(A).rows,
        S: G.mcIncomeTaxSchedule(R, { rothAmount: roth, qcdAnnual: 0, taxYield: 2.0, scenarioPreset: "bull" }) }));
    }
    n++; if (out[0] !== out[1]) diff.push(`${lab} ${roth}`);
  }
  console.log("ENGINES_RESULT " + JSON.stringify({ n, diff }));
  finished = true; process.exit(0);
}

// ════ the DOM harness (t89's) ═══════════════════════════════════════════════════════════════════════════════════════
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;   // the self-hosted branch
const calls = [];
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  let body = null; try { body = JSON.parse((init && init.body) || "null"); } catch (e) {}
  calls.push({ url, body, raw: (init && init.body) || "" });
  const json = /chat\/completions/.test(url || "") ? { choices: [{ message: { content: "OK." }, finish_reason: "stop" }] }
                                                    : { content: [{ type: "text", text: "OK." }], stop_reason: "end_turn" };
  return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => json, text: async () => JSON.stringify(json) };
};
window.fetch = recorder; globalThis.fetch = recorder;
window.confirm = () => true;
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const grab = b => { window.__lastBlob = b; return "blob:t103"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const srcOf = n => n ? SRC.slice(n.start, n.end) : "";
const topDecl = name => AST.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const tplText = n => n && n.type === "TemplateLiteral" && n.expressions.length === 0 ? n.quasis[0].value.cooked : n && n.type === "Literal" && typeof n.value === "string" ? n.value : null;
const HDR = (() => { const d = topDecl("AI_GROUND_RULES"); return d ? tplText(d.init) : ""; })();
const DOCS = (() => { const d = topDecl("DOCS_HTML"); return d ? tplText(d.init) : ""; })();
const METH = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : "";

// ── the DOM helpers (t89's) ──────────────────────────────────────────────────────────────────────────────────
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
const seed = async (portfolio, expenses, extra) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
  if (expenses !== undefined) put("expenses", expenses); if (extra) extra(); await render(); };
const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(400); } return false; };
const pre = () => { const d = [...body().querySelectorAll("details")].find(x => /EXACTLY WHAT/.test(x.textContent || "")); const p = d && d.querySelector("pre"); return p && /LIVE PORTFOLIO CONTEXT/.test(p.textContent || "") ? p.textContent : null; };
const preview = async () => { await go("ask AI"); await waitFor(() => !!pre(), 120000); return pre() || ""; };
const save = async () => { await go("my data"); await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 4; i++) await flush(); await flush(300); };
const ask = async q => {
  const before = calls.length;
  for (let i = 0; i < 20 && calls.length === before; i++) {
    const ta = el.querySelector("textarea.ai-in");
    if (ta && ta.value !== q) { try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(ta, q); ta.dispatchEvent(new window.Event("input", { bubbles: true })); }); } catch (e) {} }
    await flush(60);
    const b = [...el.querySelectorAll("button.ai-btn")].find(x => !/attach/i.test(x.textContent || "") && !/clear/i.test(x.textContent || ""));
    if (b && !b.disabled) await click(b);
    await flush(400);
  }
  await flush(300);
  return calls.length > before ? calls[calls.length - 1] : null;
};
const sysOf = c => !c || !c.body ? null : typeof c.body.system === "string" ? c.body.system : (c.body.messages && c.body.messages[0] && c.body.messages[0].role === "system") ? c.body.messages[0].content : null;
const KEY = () => window.localStorage.setItem(PREFIX + "danger_close:api_key_v1", "sk-ant-T103-00000000");
const LOCAL = () => window.localStorage.setItem(PREFIX + "danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "t103" }));
const count = (s, sub) => (s || "").split(sub).length - 1;
const $ = n => "$" + Math.round(n).toLocaleString("en-US");

// ── the fixtures — every value distinct, typed here ──────────────────────────────────────────────────────────────
const EXP = [{ category: "Living", label: "Household", amount: 6000, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true, workRowsV623: true });
const HOLD = [  // owner, ticker, balance, trad, roth, plan type, bucket
  ["A", "VTI", 699996, 612345, 87651, "ira", 3], ["B", "BND", 301234, 301234, 0, "employer", 2], ["B", "VXUS", 45678, 0, 45678, undefined, 3]];
const OTH = [  // name, balance, owner, tax type, plan type
  ["Joint brokerage", 100123, "JT", "taxable"], ["Ann HSA", 40123, "A", "hsa"], ["Bo rollover", 23456, "B", "trad", "ira"],
  ["Ann old 401k", 34567, "A", "trad", "employer"], ["Ann Roth IRA", 11234, "A", "roth"], ["Bo annuity", 7341, "B", "annuity"]];
const T401 = HOLD.reduce((s, h) => s + h[2], 0), OTOT = OTH.reduce((s, o) => s + o[1], 0);
const full = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1965-06", dobB: "1967-06", retireYear: 2031, retireYearB: 2032, lifeExpA: 90, lifeExpB: 92,
  stateName: "Ohio", stateCode: "OH", stateTaxRate: 0.035, total401k: T401, household: T401 + OTOT,
  positions: HOLD.map(([owner, ticker, balance, trad, roth, planType, bucket]) => ({ ticker, name: ticker, balance, trad, roth, owner, bucket, type: bucket === 2 ? "bond" : "equity-lb", er: 0.03, ...(planType ? { planType } : {}) })),
  otherAccounts: OTH.map(([name, balance, owner, taxType, planType]) => ({ name, balance, owner, taxType, ...(planType ? { planType } : {}) })),
  bucketActuals: { 1: 0, 2: 301234 / T401, 3: (699996 + 45678) / T401, 4: 0 },
  contributions: { monthly401k: 1748, hsaMonthly: 653, spouseBMonthly: 530, contribPreTaxA: 1537, contribRothA: 211, contribPreTaxB: 433, contribRothB: 97,
    annualBonus: 12345, bonusDeferralPct: 7, bonusMatchPct: 3, allocations: {} },
  salaryA: 98765, salaryB: 54321, workMagi: 211111, homeValue: 412345, mortgageBal: 123456, mortgageRate: 4.25, homeMoveCash: 33333,
  acaBridge: { premium: 1234, size: 3 }, taxableGainPct: 37,
  incomeSources: { ssA: { tableByAge: {}, planned: 2811, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1611, plannedAge: 66 }, pension: { amount: 911, owner: "B" } },
  incomeStreams: [{ id: "s1", label: "Rental", kind: "rental", owner: "joint", monthly: 1212, startYear: 2026, endYear: 2045, cola: true, tax: "taxfree" },
                  { id: "s2", label: "Consulting", kind: "work", selfEmployed: true, owner: "A", monthly: 1313, startYear: 2026, endYear: 2030, cola: false, tax: "ordinary" }] });
// the reported plan (D-69 as found): a $40,000 HSA, $650 a month
const reported = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1965-06", dobB: "1967-06", retireYear: 2031, lifeExpA: 90, lifeExpB: 92, stateName: "Ohio", stateCode: "OH",
  positions: [{ ticker: "VTI", name: "VTI", balance: 600000, trad: 600000, roth: 0, owner: "A", bucket: 3, type: "equity-lb", planType: "ira" },
              { ticker: "BND", name: "BND", balance: 300000, trad: 300000, roth: 0, owner: "B", bucket: 2, type: "bond", planType: "ira" }],
  otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "JT", taxType: "taxable" }, { name: "My HSA", balance: 40000, owner: "A", taxType: "hsa" }],
  total401k: 900000, household: 1040000, bucketActuals: { 1: 0, 2: 1 / 3, 3: 2 / 3, 4: 0 },
  contributions: { ...blank().contributions, monthly401k: 1500, contribPreTaxA: 1500, hsaMonthly: 650 },
  incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1600, plannedAge: 67 }, pension: { amount: 900 } } });

// ══ §A · the source ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log(`t103 — what Ask AI is told about the plan's accounts (${VER})`);
console.log("  A — the source");
const fnDecl = AST.body.find(s => s.type === "FunctionDeclaration" && s.id && s.id.name === "aiPlanFacts");
const AISP = all(AST, n => n.type === "VariableDeclarator" && n.id && n.id.name === "aiSystemPrompt")[0];
const aispS = srcOf(AISP && AISP.n);
const calls_ = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "aiPlanFacts");
if (POST) {
  T("A-1: aiPlanFacts is a module-level function", !!fnDecl);
  const ids = fnDecl ? all(fnDecl.body, (n, anc) => n.type === "Identifier" && !(anc.length && ((anc[anc.length - 1].type === "MemberExpression" && !anc[anc.length - 1].computed && anc[anc.length - 1].property === n) || (anc[anc.length - 1].type === "Property" && anc[anc.length - 1].key === n && !anc[anc.length - 1].computed)))).map(x => x.n.name) : [];
  T("A-2: it reads its parameters only — no PORTFOLIO, PLAN_TIMELINE or EXPENSES global, no My Data form state", fnDecl && fnDecl.params.length === 4
    && !ids.some(x => ["PORTFOLIO", "PLAN_TIMELINE", "EXPENSES", "MASTER_PROMPT", "others", "rows", "hsaMonthly"].includes(x)), [...new Set(ids)].filter(x => /^[A-Z_]+$/.test(x)).join(","));
  T("A-3: it is called once, from aiSystemPrompt, on the saved plan (PORTFOLIO) with the component's names and the single flag",
    calls_.length === 1 && calls_[0].anc.includes(AISP.n) && calls_[0].n.arguments.map(a => a.name).join(",") === "PORTFOLIO,nA,nB,_aiSingle", calls_.length);
  T("A-4: the live context no longer prints \"401(k) contribs\" (spouse A's pre-tax and Roth under a 401(k) label), nor calls the retirement total a \"401k subtotal\" or its mix \"401k-relative\"",
    !aispS.includes("401(k) contribs") && !aispS.includes("401k subtotal") && !aispS.includes("401k-relative") && aispS.includes("Retirement holdings $") && aispS.length > 1000);
  T("A-5: the ground rules: when something needed was not sent, say so and ask — do not conclude the plan lacks it; \"Use the figures given\" kept",
    HDR.includes("If something you need is not in what you\n  were sent, say that it was not sent and ask for it; do not conclude that the plan lacks it.") && HDR.includes("Use the figures given")
    && !HDR.includes("if something you need is missing, say so"));
} else {
  T(`A-1 ${KD}: no aiPlanFacts; the live context prints "401(k) contribs" and nothing else about contributions or account types`, !fnDecl && calls_.length === 0 && aispS.includes("401(k) contribs"));
  T(`A-5 ${KD}: the rules say "if something you need is missing, say so" — the sentence that turned the gap into "your plan has no HSA"`, HDR.includes("if something you need is missing, say so"));
}

// ══ §C · rendered (and §B's fixture) ════════════════════════════════════════════════════════════════════════════════════════
console.log("  B/C — what is sent, plan by plan");
const accountsLine = t => (t.match(/Accounts: [^\n]*/) || [""])[0];
const contribLine = t => (t.match(/Contributions per month until each retires: [^\n]*/) || [""])[0];
// C-3 FIRST: the landing's "Use example data" is reached only on a fresh page (t85's rule, as t89 runs it)
// C-3 the example, as loaded and after one Save & Apply
await seed();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
const tEx = await preview();
await save();
const tExS = await preview();
T("C-3: SETUP — the example loads (its sample briefing, then the plan summary after a save)", tEx.length > 10000 && tExS.length > 1500 && /RETIREMENT ANALYSIS CONTEXT/.test(tExS), `${tEx.length} / ${tExS.length}`);
const EXACC = "Accounts: Retirement holdings $1,500,000 — Spouse A: Traditional $1,000,000 (IRA), Roth $200,000; Spouse B: Traditional $185,000 (IRA), Roth $115,000. Other accounts $147,000 — Taxable $21,000 (joint); Traditional IRA $90,000 (Spouse A); Traditional IRA $14,000 (Spouse B); HSA $15,000 (joint); Annuity (non-qualified) $7,000 (Spouse B).";
if (POST) {
  T("C-3b: the example as loaded — its accounts, typed from DEFAULT_PORTFOLIO", accountsLine(tEx).startsWith(EXACC), accountsLine(tEx));
  T("C-3c: the example after one Save & Apply still sends its HSA and its Roth balances (through v6.38 the save lost them)", accountsLine(tExS).startsWith(EXACC)
    && contribLine(tExS).includes("Spouse A pre-tax $2,500, Roth $0; Spouse B pre-tax $350, Roth $0; HSA $300 (until Spouse A retires)"), accountsLine(tExS) + " | " + contribLine(tExS));
} else T(`C-3 ${KD}: the example after one Save & Apply sends no "HSA" (as loaded, its sample briefing names it)`, /\bHSA\b/.test(tEx) && !/\bHSA\b/.test(tExS));

// C-1 the reported plan
await seed(reported(), EXP); await save();
const tRep = await preview();
T("C-0: SETUP — the reported plan's EXACTLY WHAT'S SENT panel is read", tRep.length > 1500, tRep.length);
if (POST) {
  T("C-1: the reported plan — the HSA is named, with its balance and its owner", accountsLine(tRep).includes("HSA $40,000 (Ann)"), accountsLine(tRep));
  T("C-1b: … and its contribution, until spouse A retires (the Monte Carlo adds it to A's contributions)", contribLine(tRep).includes("HSA $650 (until Ann retires)"), contribLine(tRep));
  T("C-1c: … each spouse's Traditional and Roth, and the taxable account as joint", accountsLine(tRep).includes("Ann: Traditional $600,000 (IRA), Roth $0; Bo: Traditional $300,000 (IRA), Roth $0")
    && accountsLine(tRep).includes("Taxable $100,000 (joint)"), accountsLine(tRep));
  T("C-1d: the block is sent once, inside the live context", count(tRep, "Accounts: ") === 1 && tRep.indexOf("Accounts: ") > tRep.indexOf("LIVE PORTFOLIO CONTEXT"));
} else T(`C-1 ${KD}: the reported plan — "HSA" is not in what is sent; the HSA is inside "$140,000 other"`, !/\bHSA\b/.test(tRep) && /\$140,000 other/.test(tRep));

// the §B fixture
await seed(full(), EXP); await save();
const tFull = await preview();
const PS = DG.PORTFOLIO();
T("B-0: SETUP — the fixture saved through My Data keeps its distinct values (HSA $40,123, Bo's Roth $45,678, pre-tax $1,537)",
  PS.otherAccounts.some(a => a.taxType === "hsa" && a.balance === 40123) && PS.positions.some(p => p.roth === 45678) && PS.contributions.contribPreTaxA === 1537 && PS.contributions.hsaMonthly === 653,
  JSON.stringify({ oth: PS.otherAccounts.map(a => a.balance), c: PS.contributions }).slice(0, 300));

// ══ §B · completeness — every key My Data saves is sent or excluded with a reason ═════════════════════════════════════════════════
const BP = all(AST, n => n.type === "VariableDeclarator" && n.id && n.id.name === "buildPortfolio")[0];
const RET = BP ? all(BP.n.init, n => n.type === "ReturnStatement" && n.argument && n.argument.type === "ObjectExpression" && n.argument.properties.length > 20)[0] : null;
const KEYS = [];
const walkKeys = (obj, pre) => { for (const p of obj.properties) { if (p.type === "SpreadElement") continue; const k = p.key.name || p.key.value;
  if (p.value.type === "ObjectExpression") walkKeys(p.value, pre + k + "."); else KEYS.push(pre + k); } };
if (RET) walkKeys(RET.n.argument, "");
// v6.39 build review (S-6): an account row's own fields are keys too — D-69's class was row-level. Each array's .map callback's returned
// object, by AST, a spread of a conditional object included; the array's own key gives way to its row keys.
const objKeys = o => o.properties.flatMap(p => p.type !== "SpreadElement" ? [p.key.name || p.key.value]
  : p.argument.type === "ConditionalExpression" ? [p.argument.consequent, p.argument.alternate].filter(x => x.type === "ObjectExpression").flatMap(objKeys)
  : p.argument.type === "ObjectExpression" ? objKeys(p.argument) : []);
const rowObj = fn => { if (!fn) return null; if (fn.body.type === "ObjectExpression") return fn.body;
  const rs = all(fn.body, n => n.type === "ReturnStatement" && n.argument && n.argument.type === "ObjectExpression"); return rs.length ? rs[rs.length - 1].n.argument : null; };
const mapFnOf = init => { const c = init ? all(init, n => n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name === "map")[0] : null; return c ? c.n.arguments[0] : null; };
const ROWSRC = {
  positions: BP ? (all(BP.n.init, n => n.type === "VariableDeclarator" && n.id.name === "positions")[0] || {}).n : null,
  otherAccounts: BP ? (all(BP.n.init, n => n.type === "VariableDeclarator" && n.id.name === "otherAccounts")[0] || {}).n : null,
  incomeStreams: RET ? RET.n.argument.properties.find(p => p.key && p.key.name === "incomeStreams") : null };
for (const [arr, holder] of Object.entries(ROWSRC)) {
  const obj = rowObj(mapFnOf(holder && (holder.init || holder.value)));
  if (obj) { const i = KEYS.indexOf(arr); if (i >= 0) KEYS.splice(i, 1); for (const k of objKeys(obj)) KEYS.push(`${arr}[].${k}`); }
}
T("B-1: SETUP — buildPortfolio's saved keys are enumerated from the source, each account row's fields included", KEYS.length >= 60 && KEYS.includes("otherAccounts[].taxType") && KEYS.includes("positions[].roth")
  && KEYS.includes("positions[].planType") && KEYS.includes("incomeStreams[].selfEmployed") && KEYS.includes("contributions.hsaMonthly") && !KEYS.includes("otherAccounts"), KEYS.length);
// Not sent, each for a stated reason (scope §0.4). A key belongs here only with a reason that holds.
const EXCLUDED = {
  _stateFromForm: "an internal flag (the state was set in the form)", _incomeFromForm: "an internal flag", carRowsV621: "an internal migration flag (v6.21)",
  workRowsV623: "an internal migration flag (v6.23)",
  "contributions.monthly401k": "the legacy mirror of contribPreTaxA + contribRothA, both sent",
  "contributions.spouseBMonthly": "the legacy mirror of contribPreTaxB + contribRothB, both sent",
  "contributions.employeePer": "a paycheck input; its result, contribPreTaxA, is sent", "contributions.matchPer": "a paycheck input; its result, contribPreTaxA, is sent",
  "contributions.supplementalPer": "a paycheck input; its result, contribPreTaxA, is sent", "contributions.contribFreq": "the paycheck's frequency; its result is sent",
  "contributions.allocations": "fund-level (DA-2 (a): no fund names); the mix is sent",
  "incomeSources.ssA.tableByAge": "derived from the planned benefit and age, both sent", "incomeSources.pension.note": "a text label; the model's survivor assumption is stated",
  "positions[].ticker": "a fund's name (DA-2 (a): never sent)", "positions[].name": "a fund's name (DA-2 (a): never sent)",
  "positions[].bucket": "reaches the text as the asset mix (bucketActuals)", "positions[].type": "an asset-class detail; the mix is sent",
  "otherAccounts[].name": "an account's name (DA-2 (a): never sent)",
};
// Reached: each key's own value on the fixture, typed here (the fixture's values are distinct)
const MIX = `cash 0% / bonds ${Math.round(301234 / T401 * 100)}% / equity ${Math.round((699996 + 45678) / T401 * 100)}% / hedge 0%`;
const REACH = {
  asOf: t => t.includes(`as of ${PS.asOf}`), single: t => t.includes("Married filing jointly"), nameA: t => t.includes("Investor names: Ann (primary)"),
  nameB: t => t.includes("& Bo (spouse)"), dobA: t => t.includes("born 1965-06"), dobB: t => t.includes("born 1967-06"),
  retireYear: t => t.includes("Target retirement year: 2031"), retireYearB: t => t.includes("2032 (Bo)"),
  lifeExpA: t => t.includes("plan to age 90"), lifeExpB: t => t.includes("plan to age 92"),
  stateName: t => t.includes("State: Ohio"), stateCode: t => t.includes("State: Ohio (income tax on the state's own brackets"),
  stateTaxRate: t => t.includes(`top rate ${Math.round(PS.stateTaxRate * 10000) / 100}%`),
  homeValue: t => t.includes("$412,345 value"), mortgageBal: t => t.includes("$123,456 mortgage"), mortgageRate: t => t.includes("at 4.25%"),
  homeMoveCash: t => t.includes("$33,333"), workMagi: t => t.includes("$211,111"),
  salaryA: t => t.includes("Annual salaries: Ann $98,765"), salaryB: t => t.includes("Bo $54,321"),
  "contributions.contribPreTaxA": t => contribLine(t).includes("Ann pre-tax $1,537"), "contributions.contribRothA": t => contribLine(t).includes("Ann pre-tax $1,537, Roth $211"),
  "contributions.contribPreTaxB": t => contribLine(t).includes("Bo pre-tax $433"), "contributions.contribRothB": t => contribLine(t).includes("Bo pre-tax $433, Roth $97"),
  "contributions.hsaMonthly": t => contribLine(t).includes("HSA $653 (until Ann retires)"), "contributions.annualBonus": t => contribLine(t).includes("annual bonus $12,345"),
  "contributions.bonusDeferralPct": t => contribLine(t).includes("7% deferred pre-tax"), "contributions.bonusMatchPct": t => contribLine(t).includes("employer match 3%"),
  _positions: t => accountsLine(t).includes(`Retirement holdings ${$(T401)} — Ann: Traditional $612,345 (IRA), Roth $87,651; Bo: Traditional $301,234 (employer plan $301,234), Roth $45,678.`),
  _otherAccounts: t => accountsLine(t).includes(`Other accounts ${$(OTOT)} — Taxable $100,123 (joint); Traditional IRA $23,456 (Bo); Traditional employer plan $34,567 (Ann); Roth $11,234 (Ann); HSA $40,123 (Ann); Annuity (non-qualified) $7,341 (Bo).`),
  total401k: t => t.includes(`${$(T401)} in retirement accounts`), household: t => t.includes(`${$(T401 + OTOT)} total`), bucketActuals: t => t.includes(MIX),
  _rental: t => t.includes("Rental $1,212/mo (rental, joint, 2026–2045, COLA, tax-free)"),
  _consult: t => t.includes("Consulting $1,313/mo (self-employed work, Ann, 2026–2030, no COLA, taxable)"),
  "incomeSources.ssA.planned": t => t.includes("Ann Social Security $2,811/mo"), "incomeSources.ssA.plannedAge": t => t.includes("$2,811/mo at age 67"),
  "incomeSources.ssB": t => t.includes("Bo Social Security $1,611/mo at age 66"), "incomeSources.pension.amount": t => t.includes("Pension $911/mo"),
  "incomeSources.pension.owner": t => t.includes("The pension is Bo's."),
  "acaBridge.premium": t => t.includes("benchmark premium $1,234/mo"), "acaBridge.size": t => t.includes("household of 3"),
  taxableGainPct: t => t.includes("the model takes 37% to be unrealized gain"),
};
// the row fields reach the text through their array's line — each row key checked by it
for (const k of ["balance", "owner", "roth", "trad", "planType"]) REACH[`positions[].${k}`] = REACH._positions;
REACH["positions[].er"] = t => t.includes("Weighted expense ratio 0.03%");
for (const k of ["balance", "owner", "taxType", "planType"]) REACH[`otherAccounts[].${k}`] = REACH._otherAccounts;
for (const k of ["label", "kind", "owner", "monthly", "startYear", "endYear", "cola", "tax"]) REACH[`incomeStreams[].${k}`] = t => REACH._rental(t) && REACH._consult(t);
REACH["incomeStreams[].selfEmployed"] = REACH._consult;
for (const k of Object.keys(REACH)) if (k.startsWith("_")) Object.defineProperty(REACH, k, { enumerable: false });
const unknown = KEYS.filter(k => !(k in REACH) && !(k in EXCLUDED));
T(`B-2 EXTINCTION: every key My Data saves is either checked as sent or excluded with a reason — none unaccounted for (${KEYS.length} keys)`, unknown.length === 0, unknown.join(", "));
T("B-3: no key is both checked and excluded, and every excluded key exists", KEYS.filter(k => k in REACH && k in EXCLUDED).length === 0 && Object.keys(EXCLUDED).every(k => KEYS.includes(k)),
  Object.keys(EXCLUDED).filter(k => !KEYS.includes(k)).join(", "));
const unreached = KEYS.filter(k => k in REACH && !REACH[k](tFull));
if (POST) T(`B-4: every checked key reaches the text sent, on the fixture (${KEYS.filter(k => k in REACH && !k.startsWith("_")).length} keys)`, unreached.length === 0,
  unreached.join(", ") + " | " + accountsLine(tFull).slice(0, 200) + " | " + contribLine(tFull));
else {
  const PIN = ["salaryA", "salaryB", "contributions.contribPreTaxA", "contributions.contribRothA", "contributions.contribPreTaxB", "contributions.contribRothB", "contributions.hsaMonthly",
    "contributions.annualBonus", "contributions.bonusDeferralPct", "contributions.bonusMatchPct", "positions[].balance", "positions[].owner", "positions[].roth", "positions[].trad", "positions[].planType", "otherAccounts[].balance", "otherAccounts[].owner", "otherAccounts[].taxType", "otherAccounts[].planType", "incomeSources.pension.owner", "acaBridge.premium", "acaBridge.size", "taxableGainPct"];
  T(`B-4 ${KD}: exactly these saved fields never reach the text sent — ${PIN.length} of them, the HSA's among them`, canon([...unreached].sort()) === canon([...PIN].sort()), unreached.join(", "));
}

// C-2 a single plan
const single = () => ({ ...full(), single: true, nameB: "", dobB: "", retireYearB: undefined, lifeExpB: undefined, salaryB: undefined,
  positions: full().positions.map(p => ({ ...p, owner: "A" })), otherAccounts: full().otherAccounts.map(a => ({ ...a, owner: a.taxType === "taxable" ? "JT" : "A" })),
  contributions: { ...full().contributions, contribPreTaxB: 0, contribRothB: 0, spouseBMonthly: 0 },
  incomeSources: { ssA: { tableByAge: {}, planned: 2811, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 911 } } });
await seed(single(), EXP); await save();
const tS = await preview();
if (POST) {
  const A = accountsLine(tS), Cn = contribLine(tS);
  T("C-2: a single plan — one person: no spouse B, no \"joint\", no pension owner sentence", /Ann: Traditional \$/.test(A) && !/Spouse B|Bo\b|joint/.test(A) && !/Spouse B|Bo\b/.test(Cn) && !/The pension is/.test(tS), A + " | " + Cn);
  T("C-2b: … its holdings summed for the one person ($612,345 + $301,234 Traditional; $87,651 + $45,678 Roth)", A.includes(`Ann: Traditional ${$(612345 + 301234)} (IRA $612,345, employer plan $301,234), Roth ${$(87651 + 45678)}`), A);
} else T(`C-2 ${KD}: a single plan — no account type is sent`, !/\bHSA\b/.test(tS) && !/Traditional \$/.test(tS));

// C-4 a blank plan; C-5 module edges (v6.39 only)
await seed(blank(), EXP); await save();
const tB = await preview();
if (POST) {
  T("C-4: a blank plan — the sections say none, rather than vanishing", accountsLine(tB).includes("Retirement holdings: none.") && accountsLine(tB).includes("Other accounts: none.")
    && contribLine(tB).includes("pre-tax $0, Roth $0") && contribLine(tB).includes("HSA $0 (until "), accountsLine(tB) + " | " + contribLine(tB));
  const f = DG.aiPlanFacts;
  T("C-5: SETUP — aiPlanFacts is exported to the harness", typeof f === "function");
  if (typeof f === "function") {
    const r1 = f({ positions: [{ balance: 1000, trad: 1000, roth: 0 }], otherAccounts: [{ balance: 500, taxType: "trad" }, { balance: 300, taxType: "taxable", owner: "JT" }, { balance: 200, taxType: "hsa" }] }, "Ann", "Bo", false);
    T("C-5b: a row with no owner is spouse A's (retireStartBalances' B-or-else-A); no plan type is an IRA; a taxable or HSA row with no owner is joint",
      r1.includes("Ann: Traditional $1,000 (IRA), Roth $0; Bo: Traditional $0, Roth $0") && r1.includes("Traditional IRA $500 (Ann)") && r1.includes("Taxable $300 (joint)") && r1.includes("HSA $200 (joint)"), r1);
    const r2 = f({ positions: [{ balance: 1000, trad: 600, roth: 100, owner: "B" }], otherAccounts: [{ balance: 50, taxType: "trad", owner: "JT", planType: "employer" }] }, "A|x", "B|y", false);
    T("C-5c: a holding with no Traditional/Roth split is the taxable money the engines take it to be (taxableInitFromPositions), and the gain share then prints; a Traditional row held jointly is spouse A's; a name containing \"|\" survives",
      r2.includes("B|y: Traditional $600 (IRA), Roth $100, with no Traditional/Roth split $300 (the model treats it as taxable money)") && r2.includes("the model takes 0% to be unrealized gain")
      && r2.includes("Traditional employer plan $50 (A|x)"), r2);
    const r3 = f({ positions: [{ balance: 10, trad: 10, roth: 0, owner: "B" }], otherAccounts: [], contributions: { contribPreTaxB: 99 }, salaryB: 5, incomeSources: { pension: { amount: 9, owner: "B" } } }, "Solo", "", true);
    T("C-5d: a single plan names one person, even for a row or field stored under spouse B", r3.includes("Solo: Traditional $10") && !/Spouse B/.test(r3) && !/\$99|\$5\b|pension is/.test(r3), r3);
    T("C-5e: an empty plan does not throw", typeof f(undefined, "", "", false) === "string" && f({}, "", "", true).includes("Other accounts: none."));
    // C-5f (build review B-1): household size 0 means automatic — the ACA engine takes 1 for a single plan and 2 for a couple (computeRothStrategies' acaSize)
    const c2 = f({ acaBridge: { premium: 1600, size: 0 } }, "Ann", "Bo", false), c1 = f({ acaBridge: { premium: 900 } }, "Ann", "", true), c3 = f({ acaBridge: { premium: 900, size: 4 } }, "Ann", "Bo", false);
    T("C-5f: an ACA household size left at 0 is the model's own — 2 for a couple, 1 for a single plan — and says it was set automatically; an entered size prints as entered",
      c2.includes("benchmark premium $1,600/mo for a household of 2 (set automatically)") && c1.includes("household of 1 (set automatically)") && c3.includes("household of 4.") && !/household of 0/.test(c2 + c1), `${c2.slice(-90)} | ${c1.slice(-60)} | ${c3.slice(-50)}`);
  }
} else T(`C-4 ${KD}: a blank plan — no Accounts block exists`, !/Accounts: /.test(tB));

// ══ §D · the request carries it ═════════════════════════════════════════════════════════════════════════════════════════════
console.log("  D — the request");
for (const [route, extra] of [["Anthropic, with a key", KEY], ["a Local Model", LOCAL]]) {
  calls.length = 0;
  await seed(reported(), EXP, extra); await save();
  await go("ask AI"); await waitFor(() => !!pre(), 120000);
  const c = await ask("Should I contribute to my HSA up to the last year of my retirement?");
  const s = sysOf(c);
  T(`D-0 (${route}): SETUP — a request was sent and its system text read`, !!s && s.length > 1500, c ? c.url : "no request");
  if (POST) T(`D-1 (${route}): the system text carries the block once, with the HSA and its contribution`, count(s, "Accounts: ") === 1 && (s || "").includes("HSA $40,000 (Ann)") && (s || "").includes("HSA $650 (until Ann retires)"));
  else T(`D-1 ${KD} (${route}): the system text never names the HSA`, !!s && !/\bHSA\b/.test(s));
}

// ══ §E · the copy ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log("  E — the copy");
const JTXT = all(AST, n => n.type === "JSXText").map(x => x.n.value.replace(/\s+/g, " ")).join(" ");
const landing = (() => { const i = SRC.indexOf("The only time your data leaves this device is when you press ASK on the Ask AI tab"); return i >= 0 ? SRC.slice(i, i + 900) : ""; })();
const mydata = (() => { const i = SRC.indexOf("The only time your data leaves this device is when you press ASK on the <span"); return i >= 0 ? SRC.slice(i, SRC.indexOf("</div>", i + 600)).replace(/\s+/g, " ") : ""; })();
const fmRow = (() => { const i = DOCS.indexOf("<strong>Your structured plan summary</strong>"); return i >= 0 ? DOCS.slice(i, DOCS.indexOf("</tr>", i)) : ""; })();
T("E-0: SETUP — the landing, My Data, Field Manual and METHODOLOGY texts are found", landing.length > 300 && mydata.length > 300 && fmRow.length > 300 && METH.length > 10000, `${landing.length}/${mydata.length}/${fmRow.length}/${METH.length}`);
if (POST) {
  T("E-1: the landing list names the account totals by tax type, plan type and owner (never names), contributions, the bonus and salaries", landing.includes("account totals by tax type, plan type and owner but never account names, contributions and the bonus, salaries"));
  T("E-2: My Data's list names each account type, each contribution and salary, the gain share, the ACA bridge and the pension's owner — and still \"Nothing else\"",
    mydata.includes("your accounts totalled by tax type and owner (Traditional by plan type, Roth, HSA, taxable, annuity — never an account's or fund's name)") && mydata.includes("each contribution, the bonus and its deferral and match, each salary, the taxable gain share, the ACA bridge premium and household size")
    && mydata.includes("and the pension's owner)") && mydata.includes("Nothing else from your plan is transmitted"), mydata.slice(0, 300));
  T("E-3: the Field Manual's §10 row says the live context carries the accounts by tax type and owner (v6.39)", fmRow.includes("the accounts totalled by tax type, plan type and owner — never by name, from v6.39 — each contribution, the bonus and its deferral and match, each salary, the taxable gain share, the ACA bridge premium and household size"), fmRow.slice(0, 200));
  T("E-3b: the Field Manual's §09 table (what the AI sees) names the account types and the contributions", DOCS.includes("from v6.39 each account type (Traditional by plan type, Roth, HSA, taxable, annuity) totalled by owner, never by name")
    && DOCS.includes("Contributions until retirement (each person’s pre-tax and Roth, the HSA, the bonus), salaries, the pension’s owner, the ACA bridge and the taxable gain share"));
  T("E-4: Field Manual §13 records the change, first", DOCS.includes("<li><strong>Ask AI is told what accounts you hold (v6.39).</strong>")
    && DOCS.indexOf("Ask AI is told what accounts you hold (v6.39)") < DOCS.indexOf("The Income tab on a phone, and when income covers spending (v6.38)"));
  T("E-5: METHODOLOGY §11 names the accounts and contributions among what the live context carries, and keeps \"nothing else\"",
    /the live context with headline results \(from v6\.39\nalso the plan's accounts totalled by tax type and owner — never by name — its contributions,\nsalaries, pension owner, ACA bridge and taxable gain share\)/.test(METH) && /attached files — nothing\nelse —/.test(METH));
} else T(`E-1 ${KD}: the lists name no account types`, !landing.includes("tax type and owner") && !mydata.includes("tax type and owner"));

// ══ §F · nothing the app computes moves ═════════════════════════════════════════════════════════════════════════════════════
console.log("  F — the engines do not move");
const PRIOR = PRIOR_OF[VER];
if (POST && PRIOR && existsSync(join(HERE, `app_${PRIOR}.mjs`)) && existsSync(join(HERE, `app_${VER}.mjs`))) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--engines"], { cwd: HERE, encoding: "utf8", timeout: 900000 });
  const line = (r.stdout || "").split("\n").find(l => l.startsWith("ENGINES_RESULT "));
  let RS = null; try { RS = JSON.parse(line.slice(15)); } catch (e) {}
  T(`F-1: Engines B and C, Engine D's series, the Monte Carlo's schedule and the opening balances are bit-identical to ${PRIOR}'s module (${RS ? RS.n : 0} cases)`,
    !!RS && RS.n >= 8 && RS.diff.length === 0, line || (r.stderr || "").slice(0, 300));
} else console.log(`     (§F: ${POST ? `no app_${PRIOR}.mjs in this run folder — skipped` : "the v6.38 leg has no prior to compare with — skipped"})`);

console.log(`\nt103 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
