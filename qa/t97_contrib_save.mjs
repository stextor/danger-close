// t97_contrib_save.mjs — v6.34 (D-58; docs/SCOPE_D58_CONTRIB_SAVE_V634.md): My Data shows and keeps spouse A's stored pre-tax contribution.
//
// WHAT IT PINS. Spouse A's pre-tax contribution has no field of its own in My Data: the form derives it from three per-paycheck amounts and a
// pay frequency. Through v6.33 it read NOTHING else, so a plan holding a stored monthly figure with no paycheck breakdown (the example's
// $2,500 a month; a backup written outside My Data) showed $0 for A while every engine accrued the stored figure, and one unedited
// Save & Apply, draft or Export Backup stored the $0 — $90,000 less in A's Traditional balance at retirement on the example. From v6.34 one
// rule (effectivePreTaxA) gives the form's figure: the stored one until the paycheck row (three amounts or the frequency) is edited.
//
// Both legs: node t97_contrib_save.mjs v633 | node t97_contrib_save.mjs v634. The v6.33 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-27, D-58]. Sections:
//   A · the round trip through the real controls — Export Backup, the draft and its restore, Save & Apply (twice) on the example; a
//       hand-made backup with cents; a single plan
//   B · plans WITH a breakdown — consistent (three frequencies, both legs equal), disagreeing, an amount edit, a frequency-only edit
//   C · the extinction invariant — after an unedited save, with the as-of date held, the engines and both seeded Monte Carlo engines are
//       bit-identical to the plan as loaded (the v6.33 leg: A's Traditional at retirement falls by 12 × $2,500 × years, by hand)
//   D · edits and the display sites — a typed 0, blanking after an edit, the readout, Pre-tax monthly, Annual total, Per-paycheck total,
//       WHERE CONTRIBUTIONS LAND, the stored-figure sentence
//   E · the 402(g) line — the "not counted" sentence; the Roth/bonus warning kept in stored mode; nothing added with a breakdown
//   F · one rule — effectivePreTaxA unit cases; by AST its readers; by behaviour every display site and the save agree on four plans
//   G · copy — Field Manual §13 (the v6.34 entry first); METHODOLOGY (current leg: the run folder holds one)
// Controls: qa/tools/controls_v634_contrib.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(87); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v634";
const KNOWN_VERSIONS = ["v633", "v634", "v635", "v636", "v637", "v638"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-27, D-58 — flips at v6.34]";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g } = M;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t97 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : (v && typeof v === "object") ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
const same = (a, b) => canon(a) === canon(b);
console.log(`t97 — MY DATA KEEPS SPOUSE A'S STORED PRE-TAX CONTRIBUTION (${VER})`);

const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const TL0 = g.PLAN_TIMELINE();
const YRS_A = Math.max(0, TL0.targetRetireYear - TL0.asOfYear);                 // the example: 2029 − 2026 = 3
const LIMIT = 24500;                                                            // §402(g)(1)(B), 2026 (IRS Notice 2025-67) — typed, not read

// ── the DOM harness (t84's, with t5's export capture) ─────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const grab = b => { window.__lastBlob = b; return "blob:t97"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const DRAFT = "danger_close:mydata_draft_v1";
const body = () => window.document.body;
const txt = () => body().textContent || "";
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root, act, DangerClose, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const setInput = async (x, v) => { if (!x) return false; try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(x, String(v)); x.dispatchEvent(new window.Event("input", { bubbles: true })); }); } catch (e) {} await flush(); return true; };
const setSelect = async (x, v) => { if (!x) return false; try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(x, String(v)); x.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {} await flush(); return true; };
const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
const unmount = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} if (el) el.remove(); };
const revisit = async (tab = "my data") => { await unmount(); await render(); const t = tabBtn(tab); if (t) { await click(t); await flush(); } };
const go = async name => { await click(tabBtn(name)); await flush(); await flush(); };
const stored = k => JSON.parse(window.localStorage.getItem(PREFIX + K[k]) || "null");
const seed = (P, X) => { window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(P)); window.localStorage.setItem(PREFIX + K.expenses, JSON.stringify(X)); };
const save = async () => { await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush(); };
const KEYS = ["contribPreTaxA", "contribRothA", "contribPreTaxB", "contribRothB", "monthly401k", "spouseBMonthly"];
const pick = c => Object.fromEntries(KEYS.map(k => [k, c ? c[k] : undefined]));
const stC = () => (stored("portfolio") || {}).contributions || {};
const exportC = async () => { window.__lastBlob = null; await click(btn(/EXPORT BACKUP/)); await flush();
  try { return JSON.parse(await window.__lastBlob.text()).portfolio.contributions; } catch (e) { return null; } };
const useExample = async () => { window.localStorage.clear(); await unmount(); await render();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); await go("my data"); };
const inputByPh = ph => [...body().querySelectorAll("input")].find(i => i.getAttribute("placeholder") === ph);
const empIn = () => inputByPh("e.g. 797"), matchIn = () => inputByPh("e.g. 319"), suppIn = () => inputByPh("e.g. 230");
const payVals = () => [empIn(), matchIn(), suppIn()].map(i => i ? i.value : null);
const rothAIn = () => [...body().querySelectorAll("label")].filter(l => /Roth \(401k\/IRA\) \$\/month/.test(l.textContent))[0]?.parentElement?.querySelector("input");
const freqSel = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "semimonthly"));
const num = s => s == null ? null : Number(String(s).replace(/,/g, ""));
const shown = () => { const t = txt(); const ro = t.indexOf("Projected added by retirement:");
  return { preMo: num((t.match(/Pre-tax monthly\$([\d,]+)\/mo/) || [])[1]), annual: num((t.match(/Annual total\$([\d,]+)\/yr/) || [])[1]),
    perPay: (t.match(/Per-paycheck total(—|\$[\d,]+)/) || [])[1], readA: ro < 0 ? null : num((t.slice(ro, ro + 140).match(/\$([\d,]+)K Trad/) || [])[1]),
    based: num((t.match(/Based on \$([\d,]+)\/mo total contributions/) || [])[1]), seg: ro < 0 ? "" : t.slice(ro, ro + 200),
    storedLine: /This plan's stored pre-tax figure is \$[\d,]+\/mo; no paycheck breakdown is entered/.test(t),
    usesLine: (t.match(/This plan uses \$([\d,]+)\/mo for [^.]*pre-tax contributions\. The paycheck figures above add to \$([\d,]+)\/mo/) || []).slice(1).map(num),
    note402: /pre-tax contribution is not counted in the 402\(g\) check — (enter the paycheck breakdown|edit the paycheck amounts above) to include it/.test(t),
    note402edit: /not counted in the 402\(g\) check — edit the paycheck amounts above to include it/.test(t),
    warn402: /exceeds the \$24,500 2026 402\(g\) elective-deferral limit/.test(t) }; };
const withC = (P, c) => { const Q = clone(P); Q.contributions = { ...Q.contributions, ...c }; return Q; };
// a plan that is not the example: $1,000 more in the first holding, its tax split moved with it (a position carries trad/roth beside balance)
const notExample = P => { const Q = clone(P); Q.positions = Q.positions.map((x, i) => { if (i) return x; const y = { ...x, balance: (x.balance || 0) + 1000 };
  if ((y.trad || 0) > 0) y.trad += 1000; else if ((y.roth || 0) > 0) y.roth += 1000; return y; }); return Q; };
// the example from storage: the landing's "Use example data" is reachable only on the first mount — a remount keeps the DOM bundle's
// module-level plan (OPERATIONS §C4), so every later section seeds the example's portfolio and table instead
const seedExample = async () => { window.localStorage.clear(); seed(clone(P0), X0); await revisit("my data"); };
const openPlan = async P => { window.localStorage.clear(); seed(P, X0); await revisit("my data"); };

// ── §A · the round trip ─────────────────────────────────────────────────────────────────────────────
console.log("  A — the round trip (Export Backup, the draft and its restore, Save & Apply)");
const C0 = pick(P0.contributions);
T("A-0: SETUP — the example stores $2,500/mo for A with no paycheck breakdown", C0.contribPreTaxA === 2500 && C0.monthly401k === 2500
  && P0.contributions.employeePer == null && P0.contributions.matchPer == null && P0.contributions.supplementalPer == null, canon(P0.contributions));
await useExample();
T("A-0b: SETUP — My Data rendered the paycheck row", !!empIn() && !!freqSel(), `${!!empIn()} ${!!freqSel()}`);
const CE = await exportC();
await save(); const CS = pick(stC()); const PS_A = stored("portfolio");
await revisit("my data"); await save(); const CS2 = pick(stC());
// the draft: edit something that is not a contribution (an expense label), wait for the debounce; then its restore on the next visit
{ const tr = [...body().querySelectorAll("tbody tr")].find(r => r.querySelector("input") && r.querySelector("input").value === "Cell Phones");
  T("A-0c: SETUP — the expense row to edit was found", !!tr);
  await setInput(tr && tr.querySelector("input"), "Cell Phones (t97)");
  try { await act(async () => { await new Promise(r => setTimeout(r, 2600)); }); } catch (e) {} await flush(); }
let CD = null; try { CD = JSON.parse(window.localStorage.getItem(PREFIX + DRAFT)).portfolio.contributions; } catch (e) {}
await revisit("my data");
T("A-0d: SETUP — the next visit offers the draft", /Unsaved work from a previous session was recovered/.test(txt()));
await click(btn(/RESTORE\s*&\s*APPLY DRAFT/)); for (let i = 0; i < 3; i++) await flush();
const CR = pick(stC());
T("A-0e: SETUP — export, both saves, the draft and its restore all produced contributions", !!CE && CS.contribPreTaxA != null && CS2.contribPreTaxA != null && !!CD
  && CR.contribPreTaxA != null && (stored("expenses") || []).some(e => e.label === "Cell Phones (t97)"));
const ROUND = { "A-1: Export Backup, before any save": CE && pick(CE), "A-2: an unedited Save & Apply": CS, "A-3: a second unedited Save & Apply": CS2,
  "A-4: the draft autosave (written after an edit elsewhere)": CD && pick(CD), "A-5: the draft's RESTORE & APPLY": CR };
for (const [name, c] of Object.entries(ROUND)) {
  if (POST) T(`${name} stores A's contribution exactly as loaded ($2,500; every split field and mirror)`, same(c, C0), canon(c));
  else T(`${name} ${KD}: stores A's pre-tax as $0 (the mirror too); B, the HSA and the Roth fields unchanged`, c && c.contribPreTaxA === 0 && c.monthly401k === 0
    && c.contribPreTaxB === 350 && c.spouseBMonthly === 350 && c.contribRothA === 0, canon(c));
}
// a hand-made backup: a total with cents and no breakdown, holdings not the example's
{ const BK = notExample(withC(P0, { contribPreTaxA: 2500.5, monthly401k: 2500.5 }));
  await openPlan(BK); const s = shown(); const ce = await exportC(); await save(); const cs = pick(stC());
  if (POST) {
    T("A-6: a hand-made backup's $2,500.50 (no breakdown) is shown as stored", s.preMo === 2501 && s.storedLine, canon(s));
    T("A-6b: Export Backup and Save & Apply keep $2,500.50 — cents kept, mirror = split + Roth", ce && ce.contribPreTaxA === 2500.5 && ce.monthly401k === 2500.5
      && cs.contribPreTaxA === 2500.5 && cs.monthly401k === 2500.5 && cs.monthly401k === cs.contribPreTaxA + cs.contribRothA, canon(cs));
  } else T(`A-6 ${KD}: a hand-made backup's $2,500.50 is shown and saved as $0`, s.preMo === 0 && cs.contribPreTaxA === 0 && ce && ce.contribPreTaxA === 0, canon(cs)); }
// a single plan with a total and no breakdown
let SINGLE_SEG = "";
{ const SG = notExample(withC(P0, {})); SG.single = true; SG.nameB = ""; SG.positions = SG.positions.map(x => ({ ...x, owner: "A" }));
  SG.otherAccounts = (SG.otherAccounts || []).map(x => ({ ...x, owner: "A" })); SG.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 };
  await openPlan(SG); const s = shown(); SINGLE_SEG = s.seg; await save(); const cs = pick(stC());
  T("A-7: SETUP — the single plan rendered the readout", s.seg.length > 0, s.seg.slice(0, 80));
  if (POST) T("A-7b: a single plan's unedited save keeps A's $2,500 (B fields zero, as single)", cs.contribPreTaxA === 2500 && cs.monthly401k === 2500 && cs.contribPreTaxB === 0, canon(cs));
  else T(`A-7b ${KD}: a single plan's unedited save stores A's pre-tax as $0`, cs.contribPreTaxA === 0, canon(cs)); }

// ── §B · plans with a breakdown ─────────────────────────────────────────────────────────────────────
console.log("  B — plans with a paycheck breakdown");
const PERIODS = { biweekly: 26, semimonthly: 24, monthly: 12 };
for (const [fq, n] of Object.entries(PERIODS)) {
  const ru = (797 + 319 + 230) * n / 12, want = Math.round(ru);
  const P = notExample(withC(P0, { employeePer: 797, matchPer: 319, supplementalPer: 230, contribFreq: fq, contribPreTaxA: want, monthly401k: want }));
  await openPlan(P); const s = shown(); await save(); const cs = pick(stC());
  T(`B-1 (${fq}): a plan saved in My Data shows its rollup ($${want.toLocaleString()}) and an unedited save stores it again — both legs`,
    s.preMo === want && !s.storedLine && s.usesLine.length === 0 && cs.contribPreTaxA === want && cs.monthly401k === want, `${canon(s)} ${canon(cs)}`);
}
{ const ru = 500 * 26 / 12;   // $1,083.33
  const P = notExample(withC(P0, { employeePer: 500, matchPer: 0, supplementalPer: 0, contribFreq: "biweekly", contribPreTaxA: 2500, monthly401k: 2500 }));
  await openPlan(P); const s = shown(); await save(); const cs = pick(stC());
  if (POST) {
    T("B-2: a stored $2,500 that disagrees with its breakdown ($1,083) shows both figures", s.preMo === 2500 && s.usesLine[0] === 2500 && s.usesLine[1] === 1083, canon(s));
    T("B-2b: and an unedited save keeps the stored $2,500", cs.contribPreTaxA === 2500 && cs.monthly401k === 2500, canon(cs));
  } else T(`B-2 ${KD}: a stored $2,500 with a $1,083 breakdown is shown and saved as the rollup`, s.preMo === Math.round(ru) && cs.contribPreTaxA === Math.round(ru), canon(cs));
  await openPlan(P); await setInput(empIn(), "600"); await save(); const ce = pick(stC());
  T("B-3: editing a paycheck amount stores the rollup ($600 biweekly → $1,300) — both legs", ce.contribPreTaxA === 1300 && ce.monthly401k === 1300, canon(ce));
  await openPlan(P); await setSelect(freqSel(), "monthly"); await save(); const cf = pick(stC());
  T("B-4: changing the pay frequency alone stores the rollup ($500 monthly → $500) — both legs", cf.contribPreTaxA === 500 && cf.monthly401k === 500, canon(cf)); }

// ── §C · the extinction invariant ───────────────────────────────────────────────────────────────────
console.log("  C — an unedited save moves no engine figure (as-of date held)");
const E = M.__engines;
const figs = P => { g.applyLoadedData({ portfolio: clone(P), expenses: clone(X0) }); const R = g.PLAN_TIMELINE().targetRetireYear;
  const rsb = g.retireStartBalances(R); const s = g.withdrawalPlanSeries({ retireYear: R, rothAmount: 70000, scenarioPreset: "bull" });
  const a = { retireYear: R, rothAmount: 70000, qcdAnnual: 0, taxYield: 2, ...s };
  const B = E.computeTaxPlan(a), C = E.computeIrmaaPlan(a); delete B.brackets2026;
  _src = mulberry(7); const mc = g.runMonteCarlo(R, 400, {}); _src = mulberry(11); const ext = g.runExtendedMC(R, 30, 300, { rng: mulberry(11) });
  return { rsb, B: B.rows, C: C.rows, mc: mc.results.map(p => p[p.length - 1]), ext: [ext.success, ext.success800, ext.p50] }; };
const afterSave = async P => { await openPlan(P); await save(); const PS = stored("portfolio"); PS.asOf = P.asOf; return PS; };
{ const F0 = figs(P0), PS = await afterSave(P0), F1 = figs(PS);
  if (POST) T("C-1: the example — retireStartBalances, Engines B and C, both seeded Monte Carlo engines bit-identical after an unedited save", same(F0, F1),
    `tradInitA ${F0.rsb.tradInitA} → ${F1.rsb.tradInitA}`);
  else T(`C-1 ${KD}: the example — A's Traditional at retirement falls by 12 × $2,500 × ${YRS_A} = $${(12 * 2500 * YRS_A).toLocaleString()} (by hand)`,
    F0.rsb.tradInitA - F1.rsb.tradInitA === 12 * 2500 * YRS_A && !same(F0.mc, F1.mc), `${F0.rsb.tradInitA} → ${F1.rsb.tradInitA}`);
  // a backup in the shape My Data saves (so the save's OTHER normalisations — the SS table, the bucket weights, the flags — are already
  // applied), hand-edited to a monthly total with cents and a zero breakdown: only D-58 can move it
  const BK = withC(PS_A, { contribPreTaxA: 2500.5, monthly401k: 2500.5 + (PS_A.contributions.contribRothA || 0), employeePer: 0, matchPer: 0, supplementalPer: 0 });
  const G0 = figs(BK), PB = await afterSave(BK), G1 = figs(PB);
  if (POST) T("C-2: a hand-made backup with no breakdown — bit-identical after an unedited save", same(G0, G1),
    Object.keys(G0).filter(k => !same(G0[k], G1[k])).map(k => k === "rsb" ? `rsb ${canon(Object.fromEntries(Object.keys(G0.rsb).filter(j => !same(G0.rsb[j], G1.rsb[j])).map(j => [j, [G0.rsb[j], G1.rsb[j]]])))}` : k).join(" ; "));
  else T(`C-2 ${KD}: a hand-made backup — A's Traditional at retirement falls by 12 × $2,500.50 × ${YRS_A}`, Math.abs((G0.rsb.tradInitA - G1.rsb.tradInitA) - 12 * 2500.5 * YRS_A) < 1e-6,
    `${G0.rsb.tradInitA} → ${G1.rsb.tradInitA}`);
  g.applyLoadedData({ portfolio: clone(P0), expenses: clone(X0) }); }

// ── §D · edits and the display sites ────────────────────────────────────────────────────────────────
console.log("  D — edits and what My Data shows");
await seedExample();
{ const s = shown(), kA = Math.round(12 * 2500 * YRS_A / 1000), totOthers = 300 + 350;   // HSA + spouse B pre-tax; A's Roth and B's Roth are 0
  T("D-0: SETUP — every display site was read", [s.preMo, s.annual, s.readA, s.based].every(v => v != null) && !!s.perPay, canon(s));
  if (POST) {
    T("D-1: Pre-tax monthly shows the stored $2,500/mo", s.preMo === 2500, s.preMo);
    T("D-2: Annual total shows $30,000/yr", s.annual === 30000, s.annual);
    T("D-3: Per-paycheck total shows — (no breakdown entered)", s.perPay === "—", s.perPay);
    T(`D-4: the readout shows $${kA}K Trad for A (12 × $2,500 × ${YRS_A}, by hand)`, s.readA === kA, s.readA);
    T(`D-5: WHERE CONTRIBUTIONS LAND is based on $${(2500 + totOthers).toLocaleString()}/mo`, s.based === 2500 + totOthers, s.based);
    T("D-6: the stored-figure sentence is shown, and not the both-figures one", s.storedLine && s.usesLine.length === 0, canon(s));
  } else T(`D-1 ${KD}: every display site reads $0 for A (Pre-tax monthly, Annual total, the readout; the total omits A)`,
    s.preMo === 0 && s.annual === 0 && s.readA === 0 && s.based === totOthers && !s.storedLine, canon(s)); }
await setInput(empIn(), "0"); { const s = shown(); await save(); const cs = pick(stC());
  T("D-7: a typed 0 clears it — shown and saved as $0 (both legs)", s.preMo === 0 && cs.contribPreTaxA === 0 && cs.monthly401k === 0, `${s.preMo} ${canon(cs)}`); }
await seedExample(); await setInput(empIn(), "500"); await setInput(empIn(), ""); { const s = shown(); await save(); const cs = pick(stC());
  T("D-8: blanking a paycheck amount after an edit does not bring the stored figure back (both legs)", s.preMo === 0 && cs.contribPreTaxA === 0, `${s.preMo} ${canon(cs)}`); }
// the screen after a save: My Data writes the unused paycheck row as 0, 0, 0 beside the stored figure — reopened, the row must read blank
// (a field already reading 0 takes no typed 0 as an edit), and a typed 0 must still clear the figure
await seedExample(); await save(); await revisit("my data");
{ const s = shown(), pv = payVals();
  if (POST) {
    T("D-9: the example saved and reopened — the paycheck row is blank, $2,500 and the stored-figure sentence are shown", same(pv, ["", "", ""]) && s.preMo === 2500 && s.storedLine,
      `${canon(pv)} ${canon(s)}`);
    await setInput(empIn(), "0"); const s2 = shown(); await save(); const cs = pick(stC());
    T("D-9b: and a typed 0 there clears it — shown and saved as $0", s2.preMo === 0 && cs.contribPreTaxA === 0 && cs.monthly401k === 0, `${s2.preMo} ${canon(cs)}`);
  } else T(`D-9 ${KD}: the example saved and reopened shows the row as 0, 0, 0 and A's pre-tax as $0`, same(pv, ["0", "0", "0"]) && s.preMo === 0, `${canon(pv)} ${canon(s)}`); }
// an edit beside the row (A's Roth) is not an edit of the row
await seedExample(); await setInput(rothAIn(), "100"); { await save(); const cs = pick(stC());
  if (POST) T("D-10: editing A's Roth keeps the stored $2,500 — the mirror moves to $2,600", cs.contribPreTaxA === 2500 && cs.contribRothA === 100 && cs.monthly401k === 2600, canon(cs));
  else T(`D-10 ${KD}: editing A's Roth saves A's pre-tax as $0 — the mirror is the Roth alone`, cs.contribPreTaxA === 0 && cs.contribRothA === 100 && cs.monthly401k === 100, canon(cs)); }

// ── §E · the 402(g) line ────────────────────────────────────────────────────────────────────────────
console.log("  E — the 402(g) line");
await seedExample();
{ const s = shown();
  if (POST) T("E-1: with no breakdown, the readout says A's pre-tax is not counted in the 402(g) check", s.note402 && !s.warn402, canon(s));
  else T(`E-1 ${KD}: with no breakdown, nothing says A's pre-tax is not counted`, !s.note402 && !s.warn402, canon(s)); }
{ const P = notExample(withC(P0, { contribRothA: 2100, monthly401k: 2500 + 2100 }));   // Roth $25,200/yr > $24,500
  await openPlan(P); const s = shown();
  T(`E-2: with no breakdown, A's Roth above the limit ($25,200 > $${LIMIT.toLocaleString()}) still warns (both legs)`, s.warn402, canon(s));
  if (POST) T("E-2b: and the not-counted sentence is shown beside it", s.note402, canon(s)); }
{ const P = notExample(withC(P0, { annualBonus: 100000, bonusDeferralPct: 30, bonusMatchPct: 0 }));   // bonus deferral $30,000 > $24,500
  await openPlan(P); const s = shown();
  T(`E-2c: with no breakdown, a bonus deferral above the limit ($30,000 > $${LIMIT.toLocaleString()}) still warns (both legs)`, s.warn402, canon(s)); }
{ const P = notExample(withC(P0, { employeePer: 1000, matchPer: 0, supplementalPer: 0, contribFreq: "biweekly", contribPreTaxA: 500, monthly401k: 500 }));
  await openPlan(P); const s = shown();
  if (POST) {
    T("E-5: a stored $500 beside an unused $1,000-biweekly breakdown — the unused $26,000 is not counted (no warning), and the sentence says to edit the row",
      !s.warn402 && s.note402edit, canon(s));
    await setInput(empIn(), "1001"); const s2 = shown();
    T("E-5b: once the row is edited its $26,026 of employee deferral is counted (warns), and the not-counted sentence goes", s2.warn402 && !s2.note402, canon(s2));
  } else T("E-5: (v6.33) the breakdown is the plan's figure — its $26,000 warns", s.warn402 && !s.note402, canon(s)); }
{ const P = notExample(withC(P0, { employeePer: 1000, matchPer: 0, supplementalPer: 0, contribFreq: "biweekly", contribPreTaxA: Math.round(1000 * 26 / 12), monthly401k: Math.round(1000 * 26 / 12) }));
  await openPlan(P); const s = shown();
  T("E-3: with a breakdown, $26,000 of employee deferral warns and no not-counted sentence is shown (both legs)", s.warn402 && !s.note402, canon(s)); }
T("E-4: the single plan's readout carries no ' · ' (t6's rule)", SINGLE_SEG.length > 0 && !SINGLE_SEG.includes(" · "), SINGLE_SEG.slice(0, 160));

// ── §F · one rule ───────────────────────────────────────────────────────────────────────────────────
console.log("  F — one rule for A's figure");
const fnNode = name => { let f = null; walk.full(AST, n => { if (!f && n.type === "FunctionDeclaration" && n.id && n.id.name === name) f = n; }, W); return f; };
const editor = fnNode("MyDataEditor");
T("F-0: SETUP — MyDataEditor found by AST", !!editor);
const declInit = (root, name) => { let i = null; walk.full(root, n => { if (!i && n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === name) i = n.init; }, W); return i; };
const srcOf = n => n ? SRC.slice(n.start, n.end) : "";
const propVal = (root, key) => { let v = null; walk.full(root, n => { if (!v && n.type === "Property" && !n.computed && ((n.key.name || n.key.value) === key) && n.value) v = n.value; }, W); return v; };
const bp = editor && declInit(editor, "buildPortfolio");
if (POST) {
  const pre = editor && declInit(editor, "_preTaxA");
  T("F-1: the editor's A figure is one call to effectivePreTaxA(stored, rollup, edited)", !!pre && pre.type === "CallExpression" && pre.callee.name === "effectivePreTaxA"
    && /_c\.contribPreTaxA/.test(srcOf(pre.arguments[0])) && /paycheckEdited/.test(srcOf(pre.arguments[2])), srcOf(pre));
  T("F-2: monthly401k (the readout, Pre-tax monthly and the totals line read it) is _preTaxA.monthly", srcOf(editor && declInit(editor, "monthly401k")) === "_preTaxA.monthly", srcOf(editor && declInit(editor, "monthly401k")));
  T("F-3: buildPortfolio writes contribPreTaxA and the mirror from _preTaxA.save", srcOf(bp && propVal(bp, "contribPreTaxA")) === "_preTaxA.save"
    && srcOf(bp && propVal(bp, "monthly401k")) === "_preTaxA.save + num(rothAMo)", `${srcOf(bp && propVal(bp, "contribPreTaxA"))} | ${srcOf(bp && propVal(bp, "monthly401k"))}`);
  // every setter of the paycheck row marks the edit (the three amounts and the frequency), and nothing else does
  // every call of setPaycheckEdited (anywhere in the editor) must sit in an arrow that sets one of the four row fields; anything else is a stray
  const marks = []; walk.ancestor(editor, { CallExpression(n, _st, anc) { if (n.callee.type !== "Identifier" || n.callee.name !== "setPaycheckEdited") return;
    const fn = [...anc].reverse().find(a => a.type === "ArrowFunctionExpression" || a.type === "FunctionExpression" || a.type === "FunctionDeclaration");
    const m = fn && fn.type === "ArrowFunctionExpression" && srcOf(fn).match(/set(EmpContrib|MatchContrib|SuppContrib|ContribFreq)\(/);
    marks.push(m ? m[1] : `STRAY@${n.start}:${srcOf(fn).slice(0, 60)}`); } }, W);
  T("F-4: the four paycheck controls — and only they — mark the row edited (each once; no other call)", same(marks.slice().sort(), ["ContribFreq", "EmpContrib", "MatchContrib", "SuppContrib"]), marks.join(","));
  const ef = M.__test.effectivePreTaxA;
  T("F-5: SETUP — effectivePreTaxA is exported", typeof ef === "function");
  if (typeof ef === "function") {
    const cases = [
      ["no breakdown → the stored figure, cents kept", ef(2500.5, 0, false), { monthly: 2500.5, save: 2500.5, fromStored: true, rollupDiffers: false }],
      ["consistent breakdown → the rollup (as v6.33)", ef(2917, 2916.6666666666665, false), { monthly: 2916.6666666666665, save: 2917, fromStored: false, rollupDiffers: false }],
      ["disagreeing breakdown → the stored figure, both shown", ef(2500, 1083.3333333333333, false), { monthly: 2500, save: 2500, fromStored: true, rollupDiffers: true }],
      ["edited → the rollup, rounded to save", ef(2500, 1083.3333333333333, true), { monthly: 1083.3333333333333, save: 1083, fromStored: false, rollupDiffers: false }],
      ["edited to 0 → 0", ef(2500, 0, true), { monthly: 0, save: 0, fromStored: false, rollupDiffers: false }],
      ["nothing stored, nothing entered → 0", ef(0, 0, false), { monthly: 0, save: 0, fromStored: false, rollupDiffers: false }],
      ["a missing stored figure reads as 0", ef(undefined, 0, false), { monthly: 0, save: 0, fromStored: false, rollupDiffers: false }],
      ["within $0.50 is consistent", ef(1727, 1726.83, false), { monthly: 1726.83, save: 1727, fromStored: false, rollupDiffers: false }],
    ];
    for (const [n, got, want] of cases) T(`F-6: effectivePreTaxA — ${n}`, same(got, want), `${canon(got)} vs ${canon(want)}`);
  }
} else {
  T(`F-1 ${KD}: buildPortfolio writes contribPreTaxA from the paycheck rollup alone (Math.round(monthly401k))`, srcOf(bp && propVal(bp, "contribPreTaxA")) === "Math.round(monthly401k)", srcOf(bp && propVal(bp, "contribPreTaxA")));
  T(`F-2 ${KD}: the editor's monthly401k is the rollup — it never reads the stored contribPreTaxA`, /perPaycheckTotal \* _periodsPerYear \/ 12/.test(srcOf(editor && declInit(editor, "monthly401k"))), srcOf(editor && declInit(editor, "monthly401k")));
}
// by behaviour: on four plans every display site and the save agree with one another
{ const plans = {
    "no breakdown (the example's shape)": notExample(withC(P0, {})),
    "a consistent breakdown": notExample(withC(P0, { employeePer: 797, matchPer: 319, supplementalPer: 230, contribFreq: "biweekly", contribPreTaxA: 2917, monthly401k: 2917 })),
    "a disagreeing breakdown": notExample(withC(P0, { employeePer: 500, matchPer: 0, supplementalPer: 0, contribFreq: "biweekly", contribPreTaxA: 2500, monthly401k: 2500 })),
    "after an edit": null };
  const bad = [];
  for (const [name, P] of Object.entries(plans)) {
    if (P) await openPlan(P); else { await openPlan(plans["a disagreeing breakdown"]); await setInput(empIn(), "600"); }
    const s = shown(); await save(); const cs = pick(stC());
    // the form shows the unrounded rollup and saves it rounded (as v6.33 does), so each site agrees with the saved figure to its rounding
    const ok = Math.abs(s.preMo - cs.contribPreTaxA) <= 1 && Math.abs(s.annual - cs.contribPreTaxA * 12) <= 6 && Math.abs(s.readA - 12 * cs.contribPreTaxA * YRS_A / 1000) <= 1
      && Math.abs(s.based - (cs.contribPreTaxA + 650)) <= 1;
    if (!ok) bad.push(`${name}: shown ${canon({ preMo: s.preMo, annual: s.annual, readA: s.readA, based: s.based })} saved ${cs.contribPreTaxA}`);
  }
  if (POST) T("F-7: on four plans, Pre-tax monthly, Annual total, the readout, the totals line and the saved figure agree", bad.length === 0, bad.join(" ; "));
  else T(`F-7 ${KD}: on a plan with no breakdown the display sites agree with what the save WRITES ($0), not with what the plan holds`, bad.length === 0, bad.join(" ; ")); }

// ── §G · copy ───────────────────────────────────────────────────────────────────────────────────────
console.log("  G — the Field Manual and METHODOLOGY");
{ const D = SRC.split("\n").find(l => l.length > 140000) || "";
  const i34 = D.indexOf("<li><strong>My Data keeps spouse A's stored pre-tax contribution (v6.34).</strong>"), i33 = D.indexOf("(v6.33).</strong>");
  if (POST) T("G-1: Field Manual §13 carries the v6.34 entry, ahead of v6.33's", i34 > 0 && i33 > i34, `${i34} ${i33}`);
  else T("G-1: the v6.33 Field Manual has no v6.34 entry", i34 < 0);
  if (POST) T("G-1b: the entry names the cause, the example's figure and the fix", i34 > 0 && /showed only what those amounts add to/.test(D.slice(i34, i34 + 1500))
    && /\$90,000 less/.test(D.slice(i34, i34 + 1500)) && /until you edit the paycheck amounts or the pay frequency/.test(D.slice(i34, i34 + 1500)));
  const MP = join(HERE, "..", "METHODOLOGY.md");
  if (POST && existsSync(MP)) { const MT = readFileSync(MP, "utf8").replace(/\s+/g, " ");
    T("G-2: METHODOLOGY has the v6.34 section", MT.includes("## My Data keeps spouse A's stored pre-tax contribution (v6.34)"));
    T("G-3: METHODOLOGY's false sentences are gone (no employer-match field; folded into a pre-tax monthly amount; $0 \"true now\")",
      !MT.includes("There is no employer-match field beyond the existing bonus-deferral machinery") && !MT.includes("can be folded into the pre-tax monthly amount by hand")
      && !MT.includes("true in v5.9.2, true now"));
    T("G-4: METHODOLOGY's v6.24 bullet no longer says D-58 is \"not changed here\"", !MT.includes("Not changed here (MissingFeatures **D-58**)")); }
  else if (POST) T("G-2: SETUP — METHODOLOGY.md at the run-folder root", false, MP); }

await unmount();
finished = true;
console.log(`t97 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
