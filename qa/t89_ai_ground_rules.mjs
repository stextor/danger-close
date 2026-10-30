// t89_ai_ground_rules.mjs — v6.26 (D-55; docs/SCOPE_D55_AI_GROUND_RULES_V626.md): Ask AI's ground rules reach every plan.
//
// WHAT IT PINS. Through v6.25 the only ground rules Ask AI sent were the demo briefing's Section 1, so the unsaved example had them and every
// plan a user entered — and the example after one Save & Apply — had none. From v6.26 a fixed header, AI_GROUND_RULES, goes first in the system
// text on every route (Anthropic with a key, claude.ai without one, a Local Model), exactly once, and is stored nowhere. The live context's
// header no longer names a "Section 2" most plans lack, and it stopped stating three things the app does not know (an LTC policy, the pension's
// survivor option as fact, a spouse for a single household). The demo briefing is byte-identical (DC-3).
//
// What this suite can and cannot see. It proves the text is SENT, first, once, on every route and every way into a plan. Whether a model OBEYS it
// no test can show; no live model is called (the fetch below records and answers).
//
// Both legs: node t89_ai_ground_rules.mjs v625 | node t89_ai_ground_rules.mjs v626. The v6.25 leg pins the absence as dated
// [KNOWN DEFECT 2026-10-21, D-55]. §C's claude.ai route runs in a child process (`--claude`): without a `location` the bundle takes the claude.ai
// branch, and that is decided once, at load (t36's and t66's harness trap). Controls: qa/tools/controls_v626_ai_rules.py (repo-only).
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { createHash } from "crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v626";
const CLAUDE = process.argv.includes("--claude");
const KNOWN_VERSIONS = ["v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-21, D-55 — flips at v6.26]";
const require = createRequire(import.meta.url);
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
if (!CLAUDE) { dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location; }   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t89 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

// ── the recording fetch (t66's) and storage (t87's) ──────────────────────────────────────────────────────────────────────────────────
const calls = [];
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  let body = null; try { body = JSON.parse((init && init.body) || "null"); } catch (e) {}
  calls.push({ url, body, raw: (init && init.body) || "", headers: (init && init.headers) || {} });
  const json = /chat\/completions/.test(url || "") ? { choices: [{ message: { content: "OK." }, finish_reason: "stop" }] }
                                                    : { content: [{ type: "text", text: "OK." }], stop_reason: "end_turn" };
  return { ok: true, status: 200, statusText: "OK", headers: { get: () => null }, json: async () => json, text: async () => JSON.stringify(json) };
};
window.fetch = recorder; globalThis.fetch = recorder;
window.confirm = () => true;   // LOAD SAMPLE DATA asks first
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const grab = b => { window.__lastBlob = b; return "blob:t89"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const parse = src => Parser.extend(jsx()).parse(src, { ecmaVersion: 2022, sourceType: "module" });
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = parse(SRC);
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const declOf = (root, name) => all(root, n => n.type === "VariableDeclarator" && n.id && n.id.name === name);
const tplText = n => n && n.type === "TemplateLiteral" && n.expressions.length === 0 ? n.quasis[0].value.cooked : n && n.type === "Literal" && typeof n.value === "string" ? n.value : null;
const topDecl = (root, name) => root.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const HDR = (() => { const d = topDecl(AST, "AI_GROUND_RULES"); return d ? tplText(d.init) : null; })();
const DOCS = (() => { const d = topDecl(AST, "DOCS_HTML"); return d ? tplText(d.init) : ""; })();
const DEMO = (() => { const d = topDecl(AST, "DEFAULT_MASTER_PROMPT"); return d ? tplText(d.init) : null; })();
const md5 = s => createHash("md5").update(s || "").digest("hex");
const HEAD = HDR ? HDR.slice(0, 40) : "GROUND RULES — set by Danger Close";
const count = (s, sub) => (s || "").split(sub).length - 1;

// ── the DOM harness ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const body = () => window.document.body;
const txt = () => body().textContent || "";
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
const raw = k => window.localStorage.getItem(PREFIX + K[k]);
const seed = async (portfolio, expenses, prompt, extra) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
  if (expenses !== undefined) put("expenses", expenses); if (prompt !== undefined) put("prompt", prompt); if (extra) extra(); await render(); };
const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(400); } return false; };
const pre = () => { const d = [...body().querySelectorAll("details")].find(x => /EXACTLY WHAT/.test(x.textContent || "")); const p = d && d.querySelector("pre"); return p && /LIVE PORTFOLIO CONTEXT/.test(p.textContent || "") ? p.textContent : null; };
const preview = async () => { await go("ask AI"); await waitFor(() => !!pre(), 120000); return pre() || ""; };
const save = async () => { await go("my data"); await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 4; i++) await flush(); await flush(300); };
const afterRules = t => HDR && t.startsWith(HDR) ? t.slice(HDR.length).replace(/^\n\n/, "") : t;
const importFile = async payload => {
  await go("my data");
  const inp = [...body().querySelectorAll('input[type="file"]')].find(i => /json/.test(i.getAttribute("accept") || ""));
  if (!inp) return false;
  const file = new window.File([payload], "backup.json", { type: "application/json" });
  Object.defineProperty(inp, "files", { value: [file], configurable: true });
  try { await act(async () => { inp.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
  for (let i = 0; i < 8; i++) await flush(); await flush(400);
  return true;
};
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
const sysOf = c => !c || !c.body ? null : typeof c.body.system === "string" ? c.body.system : (c.body.messages && c.body.messages[0] && c.body.messages[0].role === "system") ? c.body.messages[0].content : null;

// fixtures (t85's builders)
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
const EXP = [{ category: "Living", label: "Household", amount: 6000, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const KEY = () => window.localStorage.setItem(PREFIX + "danger_close:api_key_v1", "sk-ant-T89-00000000");
const LOCAL = () => window.localStorage.setItem(PREFIX + "danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "t89" }));

// ════ the claude.ai route, in its own process ════════════════════════════════════════════════════════════════════════════════════
if (CLAUDE) {
  await seed();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  await go("ask AI");
  await waitFor(() => !!pre(), 120000);
  const c = await ask("How does my plan look?");
  const sys = sysOf(c);
  console.log("CLAUDE_RESULT " + JSON.stringify({ url: c && c.url, key: !!(c && c.headers && c.headers["x-api-key"]), sysHead: sys ? sys.slice(0, 120) : null,
    hdrFirst: !!(HDR && sys && sys.startsWith(HDR)), hdrCount: count(sys, HEAD), hasLive: /LIVE PORTFOLIO CONTEXT/.test(sys || "") }));
  finished = true; process.exit(0);
}

console.log(`t89 — ASK AI'S GROUND RULES REACH EVERY PLAN (${VER})`);

// ── §A · the source ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source, by AST");
const AISP = declOf(AST, "aiSystemPrompt")[0];
// the memo's OWN return — not a return inside a callback it calls (the per-year `comp` map returns a template too)
const memoFn = AISP && AISP.n.init && AISP.n.init.arguments && AISP.n.init.arguments[0];
const retTpl = memoFn ? all(memoFn.body, (n, anc) => n.type === "ReturnStatement" && n.argument && n.argument.type === "TemplateLiteral"
  && !anc.some(a => /Function/.test(a.type))).map(x => x.n.argument).pop() : null;
T("A-0: SETUP — aiSystemPrompt and its return template are found", !!AISP && !!retTpl);
const fetches = all(AST, n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "fetch");
const inAskAI = f => f.anc.some(a => a.type === "VariableDeclarator" && a.id && a.id.name === "askAI");
T("A-1: exactly two fetch calls reach a model, both in askAI", fetches.length === 2 && fetches.every(inAskAI), fetches.length);
const sysProps = all(AST, n => n.type === "Property" && !n.computed && n.key.type === "Identifier" && n.key.name === "system");
const roleSys = all(AST, n => n.type === "ObjectExpression" && n.properties.some(p => p.key && p.key.name === "role" && p.value.type === "Literal" && p.value.value === "system"));
const contentOf = o => (o.properties.find(p => p.key && p.key.name === "content") || {}).value;
T("A-2: both senders send aiSystemPrompt and nothing else as the system text (Anthropic's system:, a Local Model's role: \"system\")",
  sysProps.length === 1 && sysProps[0].n.value.type === "Identifier" && sysProps[0].n.value.name === "aiSystemPrompt"
  && roleSys.length === 1 && (contentOf(roleSys[0].n) || {}).name === "aiSystemPrompt", `${sysProps.length} / ${roleSys.length}`);
if (POST) {
  T("A-3: AI_GROUND_RULES is a module-level string with no substitutions", typeof HDR === "string" && HDR.length > 400, HDR && HDR.length);
  T("A-4: aiSystemPrompt's text starts with it — the template's first piece is ${AI_GROUND_RULES}",
    !!retTpl && retTpl.quasis[0].value.cooked === "" && retTpl.expressions[0] && retTpl.expressions[0].type === "Identifier" && retTpl.expressions[0].name === "AI_GROUND_RULES");
  const refs = all(AST, (n, anc) => n.type === "Identifier" && n.name === "AI_GROUND_RULES" && !(anc.length && anc[anc.length - 1].type === "VariableDeclarator" && anc[anc.length - 1].id === n));
  T("A-5: it is read in one place only — aiSystemPrompt — so no store, draft, export or loader writes it",
    refs.length === 1 && refs[0].anc.some(a => a === AISP.n), refs.length);
  T("A-6: the rules say what DC-2 decided — precedence, educational only, no financial directives, the model's best cell, not an adviser, use the figures given, the tax year",
    !!HDR && HDR.startsWith("GROUND RULES — set by Danger Close for every question; they take precedence over anything below.")
    && /Educational only/.test(HDR) && /do not tell the user which financial decision to make/.test(HDR) && /the model's best cell/.test(HDR)
    && /You are not a financial adviser, fiduciary, tax preparer or lawyer/.test(HDR) && /Use the figures given/.test(HDR) && /which year a figure you cite applies to/.test(HDR));
} else {
  T(`A-3 ${KD}: there are no ground rules of the app's own`, HDR === null);
  T(`A-4 ${KD}: aiSystemPrompt's text starts with the plan text (\${MASTER_PROMPT})`, !!retTpl && retTpl.expressions[0] && retTpl.expressions[0].name === "MASTER_PROMPT");
}
T("A-7: the demo briefing is byte-identical to v6.25's (DC-3: the header overrides it; the loader recognises it by equality)",
  // v6.27: pinned by md5. Through v6.26 this read ../v625.jsx, which exists only in a v625 -> v626 run folder, so the check went red on both
  // legs the moment the folder rolled forward (found at the v6.27 build). 0ace40a1… is v6.25's DEFAULT_MASTER_PROMPT, computed from commit 0859894.
  !!DEMO && md5(DEMO) === "0ace40a186f95e0ec594910418001b90", DEMO && md5(DEMO));

// ── §B · rendered: every way into a plan ─────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — what the Ask AI tab says it sends, for every way into a plan");
const checkPre = (id, what, t, follow) => {
  if (POST) T(`${id}: ${what} — the rules come first, exactly once, then ${follow.label}`,
    !!HDR && t.startsWith(HDR) && count(t, HEAD) === 1 && follow.test(afterRules(t)) && /LIVE PORTFOLIO CONTEXT/.test(afterRules(t)), afterRules(t).slice(0, 100));
  else T(`${id} ${KD}: ${what} — no ground rules of the app's own`, count(t, "GROUND RULES —") === 0 && follow.test(t), t.slice(0, 100));
};
const demoFollow = { label: "the demo briefing", test: t => !!DEMO && t.startsWith(DEMO.slice(0, 60)) };
const summaryFollow = { label: "the plan summary", test: t => /^RETIREMENT ANALYSIS CONTEXT — /.test(t) };
const liveFollow = { label: "the live context alone", test: t => /^\n*═+\nLIVE PORTFOLIO CONTEXT/.test(t) };
// the example FIRST (t85's rule: the landing's "Use example data" is reached only on a fresh page)
await seed();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
const tEx = await preview();
T("B-0: SETUP — the example's preview is shown", tEx.length > 10000, tEx.length);
checkPre("B-1", "the example, as loaded", tEx, demoFollow);
if (POST) T("B-1b: the example still carries its own Section 1 after the rules (byte-identical briefing; the rules override it)", /SECTION 1 — SYSTEM ROLE & GROUND RULES/.test(afterRules(tEx)) && /Educational Only/.test(afterRules(tEx)));
await go("my data"); await click(btn(/LOAD SAMPLE DATA/)); for (let i = 0; i < 6; i++) await flush(); await flush(400);
const tReload = await preview();
checkPre("B-2", "the example after LOAD SAMPLE DATA", tReload, demoFollow);
await save();
const tExSaved = await preview();
checkPre("B-3", "the example after one Save & Apply", tExSaved, summaryFollow);
T("B-3b: the stored plan summary carries no rules — they are added at send time", (raw("prompt") || "").length > 0 && count(raw("prompt"), "GROUND RULES —") === 0, (raw("prompt") || "").slice(0, 60));
window.__lastBlob = null; await go("my data"); await click(btn(/EXPORT BACKUP/)); await flush();
let XB = null; try { XB = JSON.parse(await window.__lastBlob.text()); } catch (e) {}
T("B-3c: an exported backup carries no rules", !!XB && typeof XB.masterPrompt === "string" && count(JSON.stringify(XB), "GROUND RULES —") === 0, XB && Object.keys(XB).join(","));
// Start Fresh, before and after a save
await seed();
await click(btn(/start fresh/i)); for (let i = 0; i < 4; i++) await flush();
const tFresh = await preview();
checkPre("B-4", "Start Fresh, before any save", tFresh, liveFollow);
await save();
const tFreshSaved = await preview();
checkPre("B-5", "Start Fresh, after Save & Apply", tFreshSaved, summaryFollow);
// a stored guided-setup plan (it stores no prompt: v6.22), a backup with its own prompt, a backup without one
await seed(filled(), EXP, undefined);
const tWiz = await preview();
checkPre("B-6", "a stored plan with no prompt (as the guided setup leaves one)", tWiz, liveFollow);
const OWN = "RETIREMENT ANALYSIS CONTEXT — Ann & Bo (their own notes)\nWe want plain answers.";
await seed(filled(), EXP, undefined);
await importFile(JSON.stringify({ portfolio: filled(), expenses: EXP, masterPrompt: OWN }));
const tOwn = await preview();
checkPre("B-7", "a backup with its own prompt text", tOwn, { label: "that text", test: t => t.startsWith(OWN) });
await seed(filled(), EXP, undefined);
await importFile(JSON.stringify({ portfolio: { ...filled(), nameA: "Cy" }, expenses: EXP }));
const tNoP = await preview();
checkPre("B-8", "a backup without a prompt", tNoP, liveFollow);
// the v6.22 rule still holds: the demo text stored beside holdings that are not the example's is dropped
await seed(filled(), EXP, DEMO || "x");
const tDemoOther = await preview();
T("B-9: a stored demo briefing beside another plan's holdings is still dropped (v6.22, DC-8) — the preview carries no demo text",
  !!DEMO && /LIVE PORTFOLIO CONTEXT/.test(tDemoOther) && !tDemoOther.includes(DEMO.slice(0, 60)), afterRules(tDemoOther).slice(0, 80));

// ── §C · the request itself ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the request, on every route");
const sizes = {};
{ calls.length = 0;
  await seed(undefined, undefined, undefined, KEY);
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  await go("ask AI"); await waitFor(() => !!pre(), 120000);
  const c1 = await ask("How does my plan look?"); const s1 = sysOf(c1);
  T("C-0: SETUP — with a key, the question goes to api.anthropic.com", !!c1 && /api\.anthropic\.com/.test(c1.url || ""), c1 && c1.url);
  sizes.example = c1 ? c1.raw.length : 0;
  if (POST) T("C-1: Anthropic with a key — body.system starts with the rules, once", !!s1 && s1.startsWith(HDR) && count(s1, HEAD) === 1, s1 && s1.slice(0, 80));
  else T(`C-1 ${KD}: Anthropic with a key — body.system carries no rules of the app's own`, !!s1 && count(s1, "GROUND RULES —") === 0);
  const c2 = await ask("And if I retire a year later?"); const s2 = sysOf(c2);
  if (POST) T("C-2: a follow-up sends the rules once more, in the system text only — the conversation does not repeat them",
    !!s2 && s2.startsWith(HDR) && count(JSON.stringify(c2.body.messages), HEAD) === 0 && c2.body.messages.length >= 3, c2 && c2.body && c2.body.messages.length);
  else T(`C-2 ${KD}: a follow-up — no rules`, !!s2 && count(c2.raw, "GROUND RULES —") === 0);
}
{ calls.length = 0;
  await seed(undefined, undefined, undefined, LOCAL);
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  await go("ask AI"); await waitFor(() => !!pre(), 120000);
  const c = await ask("How does my plan look?"); const s = sysOf(c);
  T("C-3: SETUP — a Local Model receives the question at its /chat/completions", !!c && /localhost:11434\/v1\/chat\/completions/.test(c.url || ""), c && c.url);
  if (POST) T("C-4: a Local Model — messages[0] is role \"system\" and starts with the rules, once", !!c && c.body.messages[0].role === "system" && !!s && s.startsWith(HDR) && count(s, HEAD) === 1);
  else T(`C-4 ${KD}: a Local Model — no rules`, !!s && count(s, "GROUND RULES —") === 0);
}
// the request sizes the Field Manual's cost sentence quotes, for plans a user entered (characters ÷ 4, as t66 E-7 counts)
for (const [name, plan, saved] of [["entered", filled(), true], ["single", single(), true], ["blank", blank(), true], ["unsaved", filled(), false]]) {
  calls.length = 0;
  await seed(plan, EXP, undefined, KEY);
  if (saved) await save();
  await go("ask AI"); await waitFor(() => !!pre(), 120000);
  const c = await ask("How does my plan look?");
  sizes[name] = c ? c.raw.length : 0;
}
{ const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER, "--claude"], { cwd: HERE, encoding: "utf8", timeout: 600000 });
  const line = (r.stdout || "").split("\n").find(l => l.startsWith("CLAUDE_RESULT "));
  let R = null; try { R = JSON.parse(line.slice(14)); } catch (e) {}
  T("C-5: SETUP — the claude.ai route (no key, no location) sent the question to api.anthropic.com, with no key", !!R && /api\.anthropic\.com/.test(R.url || "") && !R.key, line || (r.stderr || "").slice(0, 200));
  if (POST) T("C-6: the claude.ai route — body.system starts with the rules, once", !!R && R.hdrFirst && R.hdrCount === 1 && R.hasLive, JSON.stringify(R));
  else T(`C-6 ${KD}: the claude.ai route — no rules`, !!R && R.hdrCount === 0 && R.hasLive, JSON.stringify(R));
}

// ── §D · the live context's own lines ─────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — the live context's lines");
const liveOf = t => { const i = t.indexOf("LIVE PORTFOLIO CONTEXT"); return i < 0 ? "" : t.slice(i); };
const L0 = liveOf(tWiz), LEx = liveOf(tEx);
await seed(single(), EXP, undefined);
const LS = liveOf(await preview());
if (POST) {
  T("D-1: the live context's header says it supersedes any balances stated above — no \"Section 2\" for a plan that has none",
    /LIVE PORTFOLIO CONTEXT \(as of [^)]*\) — supersedes any balances stated above/.test(L0) && !/Section 2/.test(L0) && !/Section 2 balances/.test(LEx), L0.slice(0, 120));
  T("D-2: no long-term-care policy is stated for any plan (the app has no such field)", !/Hybrid LTC|LTC insurance/.test(L0) && !/Hybrid LTC/.test(LEx) && !/Hybrid LTC/.test(LS));
  T("D-3: the pension is described as the model's assumption, not the plan's election", /pension \$\d[\d,]* \(the model continues it in full to a survivor\)/.test(L0) && !/joint&survivor/.test(L0), (L0.match(/pension[^.]*/) || [""])[0]);
  T("D-4: a single household is named alone — no spouse, no spouse B Social Security, no survivor for its pension", /Investor name: Ann \(single\)\./.test(LS) && !/Spouse B|\(spouse\)/.test(LS) && /Ann \(retiring \d{4}\)\./.test(LS) && /pension \$\d[\d,]* \+ /.test(LS) && !/survivor/.test(LS),
    LS.split("\n").slice(2, 3).join("").slice(0, 160));
  T("D-5: a couple is still named as two", /Investor names: Ann \(primary\) & Bo \(spouse\)\./.test(L0) && /Ann \(retiring \d{4}\) & Bo\./.test(L0));
  T("D-6: each success rate says what it measures — ending above $800K", /Retire \d{4}: success \(ends above \$800K\)=\d/.test(LEx) && !/success=/.test(LEx), (LEx.match(/Retire \d{4}: [^,]*/) || [""])[0]);
  T("D-7: the Roth line names the slider amount the results ran at (the example's $70,000 a year)", /Roth conversions \d{4}-\d{4} at \$70,000\/yr \(the Roth slider these results ran at\)/.test(LEx), (LEx.match(/Roth conversions[^.]*/) || [""])[0]);
} else {
  T(`D-1 ${KD}: the live context's header names Section 2 for every plan`, /supersedes Section 2 balances/.test(L0));
  T(`D-2 ${KD}: every plan is told it holds hybrid LTC insurance`, /Hybrid LTC insurance per master prompt/.test(L0));
  T(`D-3 ${KD}: the pension's survivor option is stated as fact`, /joint&survivor, full to survivor/.test(L0));
  T(`D-4 ${KD}: a single household is sent a spouse`, /& Spouse B|\(spouse\)/.test(LS));
  T(`D-6 ${KD}: the success rate's threshold is not stated`, /Retire \d{4}: success=\d/.test(LEx));
  T(`D-7 ${KD}: the Roth line names no amount`, /Roth conversions \d{4}-\d{4}\. /.test(LEx));
}

// ── §E · the copy ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the copy");
const METH = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : "";
T("E-0: SETUP — the Field Manual and METHODOLOGY are read", DOCS.length > 100000 && METH.length > 10000, `${DOCS.length} / ${METH.length}`);
await go("ask AI");
const tabText = txt();
// v6.31 (AI-6; docs/SCOPE_D51_AI6_V631.md §0.6): Claude Opus 4.8's newer tokenizer — characters ÷ 3.5, × 1.35 (the migration guide's upper
// figure). Through v6.30, characters ÷ 4. An array, so the registrar widens it.
const A631 = ["v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);
const tok = n => Math.round(A631 ? n / 3.5 * 1.35 : n / 4);
console.log(`    request sizes, ${A631 ? "characters ÷ 3.5 × 1.35" : "characters ÷ 4"}: ${Object.entries(sizes).map(([k, v]) => `${k} ≈ ${tok(v).toLocaleString("en-US")}`).join(", ")}`);
if (POST) {
  T("E-1: the Ask AI tab says the ground rules are sent", /the app's fixed ground rules \(the same for everyone: educational only, no financial directives\)/.test(tabText));
  T("E-2: the Field Manual's master-prompt section names the rules and says the example's older briefing is overridden",
    DOCS.includes("Every question starts with the app’s fixed <strong>ground rules</strong> (v6.26)") && DOCS.includes("the ground rules tell the assistant to answer with the trade-offs instead") && DOCS.includes("A model can still ignore an instruction, and can be confidently wrong."));
  T("E-3: §10's table lists the ground rules as sent, carrying nothing about the user and stored nowhere",
    DOCS.includes("<tr><td><strong>The app’s ground rules</strong></td><td>YES</td>") && DOCS.includes("It carries nothing about you and is stored nowhere"));
  T("E-4: §13 records the change", DOCS.includes("<li><strong>Ask AI sends its ground rules with every plan (v6.26).</strong>"));
  T("E-5: METHODOLOGY §11 lists the rules among what is transmitted, so \"nothing else\" stays true", /transmits — from v6\.26, first — the\napp's fixed ground rules \(the same text for every plan: educational only, no financial directives;\nit carries nothing about the user\)/.test(METH) && /the conversation's last 12 messages, and any explicitly attached files — nothing\nelse —/.test(METH));
  T(`E-6: the cost sentence's range for a plan a user entered holds — ${["entered", "single", "blank", "unsaved"].map(k => `${k} ≈ ${tok(sizes[k]).toLocaleString("en-US")}`).join(", ")} tokens — "${A631 ? "roughly 900 to 2,300" : "roughly 600 to 1,500"}"`,
    DOCS.includes(A631 ? "roughly 900 to 2,300 tokens for a plan you entered yourself" : "roughly 600 to 1,500 tokens for a plan you entered yourself")
    && ["entered", "single", "blank", "unsaved"].every(k => A631 ? tok(sizes[k]) >= 900 && tok(sizes[k]) <= 2300 : tok(sizes[k]) >= 600 && tok(sizes[k]) <= 1500), JSON.stringify(sizes));
  T(`E-7: …and its figure for the example — ≈ ${tok(sizes.example).toLocaleString("en-US")} tokens — "${A631 ? "about 7,000" : "about 4,500"}"`, A631 ? DOCS.includes("and about 7,000 for the example’s longer sample briefing") && tok(sizes.example) >= 6000 && tok(sizes.example) <= 8000
    : DOCS.includes("and about 4,500 for the example’s longer sample briefing") && tok(sizes.example) >= 4000 && tok(sizes.example) <= 5000, sizes.example);
} else {
  T(`E-1 ${KD}: the Ask AI tab names only the plan summary and live context`, !/ground rules/.test(tabText) && /your plan summary/.test(tabText));
  T(`E-2 ${KD}: the Field Manual's master-prompt section names two parts and no rules`, DOCS.includes("It has two parts: a <strong>plan summary</strong>") && !DOCS.includes("fixed <strong>ground rules</strong>"));
  // METHODOLOGY at the run folder's root is the current build's only, so the prior leg cannot read its own (t31's limit too).
}

finished = true;
console.log(`t89 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
