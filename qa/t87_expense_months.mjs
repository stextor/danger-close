// t87_expense_months.mjs — v6.24 (D-52; docs/SCOPE_D52_EXPENSE_MONTHS_V624.md): My Data keeps each expense row's months.
//
// WHAT IT PINS. Through v6.23 My Data's expense editor read a row's YEAR only (parseInt(start.slice(0, 4))) and buildExpenses wrote it back
// as January–December (a monthly row) or June (a one-time row). Every Save & Apply, draft and backup exported from My Data re-dated the
// table: one unedited save of the example moved 31 of its 35 rows, and 2029 paid for both homes all year. The editor's own "Before
// retirement" default ran through December of the retirement year (the model retires on 1 January), and the guided setup split its two
// living-expense rows at June/July of the retirement year and ended the second in 2079 (D-54).
//
// Both legs: node t87_expense_months.mjs v623 | node t87_expense_months.mjs v624. The v6.23 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-20, D-52]. Sections:
//   A · the round trip through the real controls — Save & Apply on every table (the example, every fixture household, the car rows, a
//       backup, the wizard's table, the edge rows); Export Backup, the draft and its restore on the example; the leave dialog's save on
//       the backup table — A-9, which
//       found D-59: the dialog's SAVE & APPLY, THEN LEAVE saved nothing through v6.23 (pinned on the v6.23 leg with its own date tag)
//   B · nothing moves: the table before and after an unedited save, with the loaded PORTFOLIO held fixed (an unedited save also moves the
//       as-of date and the contribution rollup — scope §0.2 ⚠ — which is out of scope and would otherwise be measured here)
//   C · edits: a year keeps its month, a month keeps its year, the When defaults, the editor's live retirement year, the edge cases
//   D · the guided setup's two rows, driven through the wizard
//   E · rendered and structural (AST), the Field Manual and METHODOLOGY
// Controls: qa/tools/controls_v624_months.py (repo-only). Exits with process.exit (the rendered app leaves timers running).
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
const VER = process.argv[2] || "v624";
const KNOWN_VERSIONS = ["v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-20, D-52 — flips at v6.24]";
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
process.on("exit", () => { if (!finished) { console.log(`t87 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : (v && typeof v === "object") ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
const same = (a, b) => canon(a) === canon(b);
const rowDiffs = (A, B) => { if (!Array.isArray(A) || !Array.isArray(B)) return ["not arrays"]; const out = [];
  if (A.length !== B.length) out.push(`length ${A.length} → ${B.length}`);
  A.forEach((a, i) => { if (!same(a, B[i])) out.push(`${a.label}: ${canon(a)} → ${canon(B[i])}`); }); return out; };
console.log(`t87 — MY DATA KEEPS EACH EXPENSE ROW'S MONTHS (${VER})`);

const P0 = clone(g.PORTFOLIO()), X0 = clone(g.EXPENSES());
const TL0 = g.PLAN_TIMELINE(); const R = TL0.targetRetireYear;                 // the example retires on 1 January 2029
const Y = new Date().getFullYear();                                             // the editor's "this year" (_asOfYrMD)
const H = Math.max(TL0.dobA.year + TL0.lifeExpA, TL0.dobB.year + TL0.lifeExpB);   // the editor's horizon (_horizonEndYr)

// ── the DOM harness (t84's, with t5's export capture) ─────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
const grab = b => { window.__lastBlob = b; return "blob:t87"; };
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
// the expense table's rows (a row has a category select and a label input), and a row by its label
const expRows = () => [...body().querySelectorAll("tbody tr")].filter(tr => tr.querySelector("select") && tr.querySelectorAll("input").length >= 2
  && [...tr.querySelectorAll("select")].some(s => [...s.options].some(o => o.value === "once")));
const rowByLabel = lab => expRows().find(tr => tr.querySelectorAll("input")[0].value === lab);
const addRow = async (label, amount) => { await click(btn(/\+\s*Add expense/i)); const rs = expRows(); const tr = rs[rs.length - 1];
  await setInput(tr.querySelectorAll("input")[0], label); await setInput(expRows()[rs.length - 1].querySelectorAll("input")[1], amount); return () => expRows()[rs.length - 1]; };
const rowSels = tr => [...tr.querySelectorAll("select")];                // [category, frequency, when, (from month, to month)] or [category, frequency, (month)]
const rowNums = tr => [...tr.querySelectorAll("input")].slice(1).filter(i => i.type !== "checkbox");   // [amount, start yr, end yr] or [amount, year]
const byLabel = (X, lab) => (X || []).find(e => e.label === lab);

// ── §A · the round trip ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the round trip (Save & Apply, Export Backup, the draft)");
window.localStorage.clear(); await render();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
await go("my data");
T("A-0: SETUP — My Data rendered the example household's expense table (35 rows)", /RETIREMENT HOLDINGS/.test(txt()) && expRows().length === X0.length, expRows().length);
// Export Backup first, before any save: the file's table
window.__lastBlob = null; await click(btn(/EXPORT BACKUP/)); await flush();
let XE = null; try { XE = JSON.parse(await window.__lastBlob.text()).expenses; } catch (e) {}
T("A-0b: SETUP — Export Backup produced a file with an expense table", Array.isArray(XE) && XE.length === X0.length, XE && XE.length);
await save();
const XS = stored("expenses"), PS = stored("portfolio");
T("A-0c: SETUP — Save & Apply stored a table and a portfolio", Array.isArray(XS) && !!PS);
// the Ask AI context the save stores carries the editor's EXPENSES line (monthlyAt, month-aware from v6.24 at June — the same figures as
// the preview, E-4, and on both legs, because the example's rows all span June of both years). The line must be present: absent fails.
{ const MPS = window.localStorage.getItem(PREFIX + K.prompt) || ""; const line = (MPS.match(/EXPENSES:[^\n"\\]*/) || [""])[0];
  T("A-0d: the Ask AI EXPENSES line reads ~$6,700/mo before retirement and ~$8,020/mo after", /~\$6,700\/mo before retirement, ~\$8,020\/mo after\./.test(line), line || "(no EXPENSES line stored)"); }
if (POST) {
  T("A-1: an unedited Save & Apply stores the example's table exactly as it loaded — every row, every field (months, notes)", same(XS, X0), rowDiffs(X0, XS).slice(0, 4).join(" | "));
  T("A-2: Export Backup's table is the loaded table too", same(XE, X0), rowDiffs(X0, XE).slice(0, 3).join(" | "));
} else {
  const d = rowDiffs(X0, XS);
  T(`A-1 ${KD}: one unedited save re-dates 31 of the example's 35 rows — the current home runs to 2029-12, the next from 2029-01`,
    d.length === 31 && byLabel(XS, "Mortgage (Current Home)").end === "2029-12" && byLabel(XS, "Property Tax (Future Home)").start === "2029-01"
    && byLabel(XS, "Golf Cart").start === "2029-06" && byLabel(XS, "Car Payment").end === "2034-12", d.length);
  T(`A-2 ${KD}: Export Backup re-dates the file's table the same way, with no save`, same(XE, XS), rowDiffs(XS, XE).slice(0, 2).join(" | "));
}
await revisit("my data"); await save();
T("A-3: a second unedited save stores the same table again", same(stored("expenses"), XS), rowDiffs(XS, stored("expenses")).slice(0, 2).join(" | "));
// the draft autosave: edit one label, wait for the debounce, read the draft's table
{ const tr = rowByLabel("Cell Phones"); await setInput(tr && tr.querySelectorAll("input")[0], "Cell Phones (t87)");
  try { await act(async () => { await new Promise(r => setTimeout(r, 2600)); }); } catch (e) {} await flush();
  let XD = null; try { XD = JSON.parse(window.localStorage.getItem(PREFIX + DRAFT)).expenses; } catch (e) {}
  // the TABLE AS LOADED with the one edit (not XS: a builder that re-dated every save would make XS re-dated already — control C1)
  const want = clone(X0); want.find(e => e.label === "Cell Phones").label = "Cell Phones (t87)";
  T("A-4: SETUP — the draft autosave wrote a table after one edit", Array.isArray(XD));
  if (POST) T("A-4b: the draft keeps every other row's months and fields exactly as loaded", same(XD, want), rowDiffs(want, XD).slice(0, 3).join(" | "));
  // the draft's restore (RESTORE & APPLY DRAFT, on the next visit): it commits the draft's table as it stands
  await revisit("my data");
  T("A-4c: SETUP — the next visit offers the draft", /Unsaved work from a previous session was recovered/.test(txt()));
  await click(btn(/RESTORE\s*&\s*APPLY DRAFT/)); for (let i = 0; i < 3; i++) await flush();
  const XR = stored("expenses");
  if (POST) T("A-4d: restoring the draft stores the loaded table with the edit — every month kept", same(XR, want), rowDiffs(want, XR).slice(0, 3).join(" | "));
  else T(`A-4d ${KD}: restoring the draft stores its re-dated rows (the current home runs to 2029-12)`, !!byLabel(XR, "Cell Phones (t87)") && (byLabel(XR, "Mortgage (Current Home)") || {}).end === "2029-12", canon(byLabel(XR, "Mortgage (Current Home)")));
}
// a table with the v6.21 car rows (March), an older plan's
{ const OLD = clone(PS); delete OLD.carRowsV621; delete OLD._carRowsAdded;
  seed(OLD, X0.filter(e => e.label !== "Replacement car")); await revisit("my data"); await save();
  const cars = (stored("expenses") || []).filter(e => /Replacement car \(added by v6\.21/.test(e.label)).map(e => e.start).join();
  if (POST) T("A-5: the cars v6.21 adds to an older plan are stored in March, where it dated them", cars === "2037-03,2045-03,2053-03,2061-03", cars);
  else T(`A-5 ${KD}: the cars v6.21 adds to an older plan are re-dated to June by the save`, cars === "2037-06,2045-06,2053-06,2061-06", cars); }
// a backup-shaped table: cents, notes, an unknown field, a deductible one-time row
const BK = [
  { cat: "Housing", label: "Rent (t87)", amount: 1234.56, freq: "monthly", start: "2026-03", end: "2031-09", deductible: false, phase: "both", note: "lease", custom: { a: 1 } },
  { cat: "Leisure", label: "Trip (t87)", amount: 4999.99, freq: "once", start: "2030-08", end: "2030-08", deductible: true, phase: "post", note: "Japan" },
];
seed(PS, BK); await revisit("my data"); await save();
const XB = stored("expenses");
if (POST) T("A-6: a backup's rows — cents, notes, an unknown field, a deductible one-time row — are stored exactly as loaded", same(XB, BK), rowDiffs(BK, XB).join(" | "));
else T(`A-6 ${KD}: a backup's rows lose their months and their notes`, byLabel(XB, "Rent (t87)").start === "2026-01" && byLabel(XB, "Rent (t87)").end === "2031-12"
  && !("note" in byLabel(XB, "Rent (t87)")) && byLabel(XB, "Trip (t87)").start === "2030-06", canon(XB));
// the normalisations the scope states (§1.1) — on rows the editor cannot otherwise represent
if (POST) {
  const ED = [
    { cat: "Other", label: "", amount: 50, freq: "monthly", start: "2027-02", end: "2030-05", phase: "pre" },
    { cat: "Other", label: "No phase (t87)", amount: 60, freq: "monthly", start: "2027-01", end: "2040-12" },
    { cat: "Other", label: "No dates (t87)", amount: 70, freq: "monthly", phase: "post" },
    { cat: "Other", label: "Early trip (t87)", amount: 900, freq: "once", start: "2027-02", end: "2027-02", phase: "post" },
    { cat: "Other", label: "", amount: 0, freq: "monthly", start: "2027-01", end: "2027-12", phase: "both" },
    { label: "No category (t87)", amount: 10, freq: "monthly", start: "2027-01", end: "2027-12", phase: "both" },
  ];
  seed(PS, ED); await revisit("my data"); await save(); const XN = stored("expenses") || [];
  T("A-7: a row with no amount and no label is dropped; the other five are kept", XN.length === 5, XN.length);
  T("A-7b: a blank label is named \"Expense\", and the row keeps its months", !!XN.find(e => e.label === "Expense" && e.start === "2027-02" && e.end === "2030-05" && e.phase === "pre"));
  T("A-7c: a missing phase is \"both\"", (byLabel(XN, "No phase (t87)") || {}).phase === "both");
  T("A-7d: a missing start and end are filled — January of this year to December of the horizon year", (byLabel(XN, "No dates (t87)") || {}).start === `${Y}-01` && (byLabel(XN, "No dates (t87)") || {}).end === `${H}-12`, canon(byLabel(XN, "No dates (t87)")));
  T("A-7e: a one-time row keeps its month, and its phase follows its date (before the retirement year → pre)", (byLabel(XN, "Early trip (t87)") || {}).start === "2027-02" && (byLabel(XN, "Early trip (t87)") || {}).phase === "pre");
  T("A-7f: a missing category is \"Other\"", (byLabel(XN, "No category (t87)") || {}).cat === "Other");
  // dates the editor shows but cannot have written, and a text amount (v6.24 build review)
  const OD = [
    { cat: "Other", label: "Year only (t87)", amount: 40, freq: "monthly", start: "2029", end: "2034", deductible: false, phase: "post" },
    { cat: "Other", label: "One-digit month (t87)", amount: 41, freq: "monthly", start: "2029-4", end: "2034-4", deductible: false, phase: "post" },
    { cat: "Other", label: "With a day (t87)", amount: 42, freq: "monthly", start: "2026-03-15", end: "2030-09-30", deductible: false, phase: "both" },
    { cat: "Other", label: "Once, year only (t87)", amount: 43, freq: "once", start: "2031", end: "2031", deductible: false, phase: "post" },
    { cat: "Other", label: "No deductible key (t87)", amount: 44, freq: "monthly", start: "2027-02", end: "2027-11", phase: "pre" },
    { cat: "Other", label: "Text amount (t87)", amount: "100", freq: "monthly", start: "2027-01", end: "2027-12", deductible: false, phase: "pre" },
  ];
  seed(PS, OD); await revisit("my data"); await save(); const XO = stored("expenses") || [];
  T("A-7g: an unedited date the editor did not write is stored verbatim — \"2029\", \"2029-4\", \"2026-03-15\", a one-time \"2031\" — and a row with no deductible key gets none",
    same(XO.slice(0, 5), OD.slice(0, 5)), rowDiffs(OD.slice(0, 5), XO.slice(0, 5)).join(" | "));
  T("A-7h: a text amount is stored as the number (\"100\" → 100), its months kept", (byLabel(XO, "Text amount (t87)") || {}).amount === 100 && (byLabel(XO, "Text amount (t87)") || {}).start === "2027-01", canon(byLabel(XO, "Text amount (t87)")));
}
// the guided setup's v6.23 table, saved in My Data
const WIZ = [{ cat: "Other", label: "Living expenses (wizard)", amount: 7000, freq: "monthly", start: "2026-01", end: `${R}-06`, deductible: false, phase: "pre" },
             { cat: "Other", label: "Living expenses (wizard)", amount: 6500, freq: "monthly", start: `${R}-07`, end: "2079-12", deductible: false, phase: "post" }];
seed(PS, WIZ); await revisit("my data"); await save(); const WS = stored("expenses");
if (POST) T("A-8: a wizard table saved in My Data is stored exactly as loaded", same(WS, WIZ), rowDiffs(WIZ, WS).join(" | "));
else T(`A-8 ${KD}: a wizard table saved in My Data runs both rows through the whole retirement year`, WS[0].end === `${R}-12` && WS[1].start === `${R}-01`, canon(WS));
// the leave dialog's SAVE & APPLY, THEN LEAVE (it calls the editor's handleSave through MYDATA_SAVE — the same path, driven here as the user would).
// Writing this check found D-59: through v6.23 the button switched tabs first, the editor unmounted and unregistered MYDATA_SAVE, and nothing was saved.
seed(PS, BK); await revisit("my data");
{ const tr = rowByLabel("Rent (t87)"); await setInput(tr && tr.querySelectorAll("input")[0], "Rent (t87, leave)");
  await click(tabBtn("dashboard"));
  T("A-9a: SETUP — leaving My Data with an edit opens the leave dialog", txt().includes("You have unsaved edits in My Data"));
  await click(btn(/THEN LEAVE/)); for (let i = 0; i < 4; i++) await flush();
  const XL = stored("expenses"), want = clone(BK); want[0].label = "Rent (t87, leave)";
  if (POST) T("A-9: the leave dialog's save stores the backup's rows exactly as loaded, with only the edit", same(XL, want), rowDiffs(want, XL).join(" | "));
  else T(`A-9 [KNOWN DEFECT 2026-10-20, D-59 — flips at v6.24]: the leave dialog's save stores NOTHING — the table is the seeded one, without the edit`,
    same(XL, BK) && !byLabel(XL, "Rent (t87, leave)"), canon(XL).slice(0, 160));
  // the save remounts the app on the remembered tab; the first v6.24 fix saved and then landed back on My Data in Chromium — but not here:
  // act() flushes the effect that records the tab before the remount, so this passes on that fix too. A-9d pins the order (control C17)
  const on = [...body().querySelectorAll("button.tab.on")].map(b => b.textContent.trim());
  T("A-9b: and it leaves — the app lands on the tab the user chose (dashboard)", on.includes("dashboard") && !on.includes("my data"), on.join(",")); }
// every fixture household (qa/tools/fixture/households.mjs): each is the example's portfolio with one override and the example's table,
// so what varies between them is the household (dates of birth, claims, benefits, state) — none of them changes the retirement year
{ const fx = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const bad = [], seen = [];
  for (const name of Object.keys(fx.HOUSEHOLDS)) {
    const P = fx.build({ PORTFOLIO: () => clone(PS) }, name);
    window.localStorage.clear(); seed(P, X0); await revisit("my data");
    if (expRows().length !== X0.length) { bad.push(`${name}: table not shown (${expRows().length} rows)`); continue; }
    await save(); const XF = stored("expenses"); seen.push(name);
    const d = rowDiffs(X0, XF); if (POST ? d.length : !d.length) bad.push(`${name}: ${POST ? d.slice(0, 2).join(" | ") : "nothing re-dated"}`);
  }
  T(`A-10: SETUP — every fixture household reached My Data and saved (${Object.keys(fx.HOUSEHOLDS).length})`, seen.length === Object.keys(fx.HOUSEHOLDS).length, bad.join(" ; "));
  if (POST) T("A-10b: on every fixture household an unedited save stores the example's table exactly as loaded", bad.length === 0, bad.join(" ; "));
  else T(`A-10b ${KD}: on every fixture household an unedited save re-dates the table`, bad.length === 0, bad.join(" ; ")); }

// ── §B · nothing moves (the loaded portfolio held fixed) ────────────────────────────────────────────────────────────────────────────────
console.log("  B — the engines on the table before and after an unedited save (portfolio held fixed)");
const load = (P, X) => g.applyLoadedData({ portfolio: clone(P), expenses: clone(X) });
const figs = (P, X) => { load(P, X); const RY = g.PLAN_TIMELINE().targetRetireYear;
  const years = []; for (let y = 2026; y <= 2075; y++) years.push(g.tableYearExpense(y));
  const wd = g.computeWithdrawalPlan({ retireYear: RY, rothAmount: 70000, scenarioPreset: "base" }).schedule;
  const tax = g.mcIncomeTaxSchedule(RY, {});
  g.applyScenarioProbs(g.PROB_PRESETS().base.probs); _src = mulberry(3); const m6 = g.runMonteCarlo(RY, 200).results;
  const x30 = g.runExtendedMC(RY, 30, 200, { ltcShocks: true, mortality: true, taxSchedule: g.mcResolveTaxSchedule(RY, {}), rng: mulberry(11) }).results;
  const heads = ["2026-06", `${RY}-06`, `${RY + 2}-06`].map(m => g.getMonthlyExpense(m));
  return { years, wd, tax, m6, x30, heads, pp: [g.postPaymentsWhat(), g.postPaymentsEnd()] }; };
for (const [lab, A, B] of [["the example", X0, XS], ["the wizard table", WIZ, WS]]) {
  const a = figs(P0, A), b = figs(P0, B);
  if (POST) {
    T(`B-1: ${lab} — table spending for every year 2026–2075 is the same before and after the save`, same(a.years, b.years));
    T(`B-2: ${lab} — the Withdrawal tab's schedule (Engine D) is bit-identical`, same(a.wd, b.wd));
    T(`B-3: ${lab} — the Monte Carlo's tax schedule is bit-identical`, same(a.tax, b.tax));
    T(`B-4: ${lab} — both seeded Monte Carlo engines are bit-identical`, same(a.m6, b.m6) && same(a.x30, b.x30));
    T(`B-5: ${lab} — the three headline monthly figures and the "after the payments end" figure are the same`, same(a.heads, b.heads) && same(a.pp, b.pp), canon([a.heads, b.heads]));
  } else if (lab === "the example") {
    T(`B-1 ${KD}: the save raises the example's 2028 / 2029 / 2034 spending — $81,300 / $126,280 / $93,040 → $85,800 / $157,720 / $96,240`,
      [a.years[2], a.years[3], a.years[8]].join() === "81300,126280,93040" && [b.years[2], b.years[3], b.years[8]].join() === "85800,157720,96240", canon([a.years.slice(2, 9), b.years.slice(2, 9)]));
    T(`B-5 ${KD}: the post-retirement monthly figure (June 2029) moves from $8,170 to $10,810`, a.heads[1] === 8170 && b.heads[1] === 10810, canon([a.heads, b.heads]));
    T(`B-2 ${KD}: and the Withdrawal tab's schedule moves`, !same(a.wd, b.wd));
  } else {
    T(`B-1 ${KD}: the wizard table's retirement year doubles — $81,000 → $162,000`, a.years[3] === 81000 && b.years[3] === 162000, canon([a.years[3], b.years[3]]));
  }
}
load(P0, X0);

// ── §C · edits ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — edits, the When defaults, the live retirement year");
// the example, seeded from its own stored portfolio and table (the DOM bundle's in-memory plan is A-8's; a fresh landing would not show)
window.localStorage.clear(); seed(PS, X0); await revisit("my data");
T("C-00: SETUP — My Data shows the example's table again", expRows().length === X0.length && !!rowByLabel("Car Payment"), expRows().length);
if (POST) {
  { const tr = rowByLabel("Car Payment"); const nums = rowNums(tr), sels = rowSels(tr);
    T("C-0: SETUP — the Car Payment row shows its months: April 2029 to April 2034", sels.length === 5 && sels[3].value === "4" && sels[4].value === "4" && nums[1].value === "2029" && nums[2].value === "2034",
      `${sels.map(s => s.value)} / ${nums.map(i => i.value)}`);
    await setInput(nums[1], "2030"); await setSelect(rowSels(rowByLabel("Car Payment"))[4], "6"); }
} else {
  const tr = rowByLabel("Car Payment");
  T(`C-0 ${KD}: the Car Payment row shows years only — no month selector`, !!tr && rowSels(tr).length === 3 && !body().querySelector("[data-dc-exp-month]"));
}
const rPre = await addRow("t87 pre", 100); await setSelect(rowSels(rPre())[2], "pre");
const rPost = await addRow("t87 post", 100); await setSelect(rowSels(rPost())[2], "post");
const rBoth = await addRow("t87 both", 100);
const rOnce = await addRow("t87 once", 500); await setSelect(rowSels(rOnce())[1], "once");
const rAnn = await addRow("t87 annual", 1000); await setSelect(rowSels(rAnn())[1], "annual");
await save(); let XC = stored("expenses") || [];
if (POST) {
  T("C-1: changing a row's start year keeps its month (Car Payment from 2030-04)", (byLabel(XC, "Car Payment") || {}).start === "2030-04", canon(byLabel(XC, "Car Payment")));
  T("C-2: changing a row's end month keeps its year (to 2034-06)", (byLabel(XC, "Car Payment") || {}).end === "2034-06");
  T(`C-3: a new row set to Before retirement runs from January ${Y} to December ${R - 1} — the month before the 1 January ${R} retirement`,
    (byLabel(XC, "t87 pre") || {}).start === `${Y}-01` && (byLabel(XC, "t87 pre") || {}).end === `${R - 1}-12`, canon(byLabel(XC, "t87 pre")));
} else {
  T(`C-3 ${KD}: a new row set to Before retirement runs through December ${R}, the first twelve months of retirement`, (byLabel(XC, "t87 pre") || {}).end === `${R}-12`, canon(byLabel(XC, "t87 pre")));
}
T(`C-4: a new row set to After retirement runs from January ${R} to December ${H}`, (byLabel(XC, "t87 post") || {}).start === `${R}-01` && (byLabel(XC, "t87 post") || {}).end === `${H}-12`, canon(byLabel(XC, "t87 post")));
T(`C-5: a new row Throughout runs from January ${Y} to December ${H}`, (byLabel(XC, "t87 both") || {}).start === `${Y}-01` && (byLabel(XC, "t87 both") || {}).end === `${H}-12`, canon(byLabel(XC, "t87 both")));
T(`C-6: a new one-time row is June of the retirement year, post`, (byLabel(XC, "t87 once") || {}).start === `${R}-06` && (byLabel(XC, "t87 once") || {}).phase === "post", canon(byLabel(XC, "t87 once")));
T("C-7: an annual $1,000 is stored as the nearest whole dollar a month ($83), monthly", (byLabel(XC, "t87 annual") || {}).amount === 83 && (byLabel(XC, "t87 annual") || {}).freq === "monthly", canon(byLabel(XC, "t87 annual")));
if (POST) {
  // the editor's own retirement-year field counts in this session
  const ret = [...body().querySelectorAll("label")].filter(l => /retirement year$/i.test((l.textContent || "").trim()))
    .map(l => l.parentElement && l.parentElement.querySelector("input")).find(i => i && i.value === String(R));
  T("C-8: SETUP — My Data shows the retirement-year field at the plan's year", !!ret);
  await setInput(ret, String(R + 2)); const r2 = await addRow("t87 pre after move", 100); await setSelect(rowSels(r2())[2], "pre");
  await save(); XC = stored("expenses") || [];
  T(`C-9: after the retirement year is changed to ${R + 2} in the same session, Before retirement ends December ${R + 1}`, (byLabel(XC, "t87 pre after move") || {}).end === `${R + 1}-12`, canon(byLabel(XC, "t87 pre after move")));
  const ret2 = [...body().querySelectorAll("label")].filter(l => /retirement year$/i.test((l.textContent || "").trim()))
    .map(l => l.parentElement && l.parentElement.querySelector("input")).find(i => i && i.value === String(R + 2));
  await setInput(ret2, String(Y)); const r3 = await addRow("t87 pre already retired", 100); await setSelect(rowSels(r3())[2], "pre");
  await save(); XC = stored("expenses") || [];
  T(`C-10: a plan retiring this year (${Y}) has no time before retirement — Before retirement is the one month before it, December ${Y - 1}`,
    (byLabel(XC, "t87 pre already retired") || {}).start === `${Y - 1}-12` && (byLabel(XC, "t87 pre already retired") || {}).end === `${Y - 1}-12`, canon(byLabel(XC, "t87 pre already retired")));
}
// the live preview reads each row by month at June (monthlyAt): a row from July of the year it shows is not in it
window.localStorage.clear(); seed(PS, X0); await revisit("my data");
{ const post = () => ((txt().match(/Monthly after retirement\$([\d,]+)\/mo/) || [])[1] || "");
  const before = post(); const rJ = await addRow("t87 july", 1000); await setSelect(rowSels(rJ())[2], "post");
  await setInput(rowNums(rJ())[1], String(R + 2)); if (POST) await setSelect(rowSels(rJ())[3], "7");
  const july = post();
  if (POST) { T(`C-11: the preview's after-retirement figure (June ${R + 2}) leaves out a row starting July ${R + 2}`, before === "8,020" && july === "8,020", `${before} → ${july}`);
    await setSelect(rowSels(rJ())[3], "6");
    T(`C-11b: and includes it from June ${R + 2}`, post() === "9,020", post()); }
  else T(`C-11 ${KD}: the preview counts a row from its start YEAR — a July ${R + 2} row is in the June figure`, before === "8,020" && july === "9,020", `${before} → ${july}`); }
if (POST) {
  const ret = [...body().querySelectorAll("label")].filter(l => /retirement year$/i.test((l.textContent || "").trim()))
    .map(l => l.parentElement && l.parentElement.querySelector("input")).find(i => i && i.value === String(R));
  await setInput(ret, "203"); const r4 = await addRow("t87 pre half-typed", 100); await setSelect(rowSels(r4())[2], "pre");
  await save(); const XH = stored("expenses") || [];
  T(`C-12: a half-typed retirement year ("203") is not a year — Before retirement still ends December ${R - 1}`, (byLabel(XH, "t87 pre half-typed") || {}).end === `${R - 1}-12`, canon(byLabel(XH, "t87 pre half-typed")));
}

// ── §D · the guided setup ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — the guided setup's two rows");
const fieldBy = re => { const l = [...body().querySelectorAll("label")].find(x => re.test((x.textContent || "").trim())); return l && l.parentElement ? l.parentElement.querySelector("input") : null; };
const wizard = async ({ single = false, byB, leB, retY } = {}) => {
  window.localStorage.clear(); await unmount(); await render();
  await click(btn(/GUIDED SETUP/));
  if (single) T("D-00: SETUP — the guided setup offers \"just me\"", !![...body().querySelectorAll("button")].find(b => /^just me$/i.test(b.textContent.trim())));
  if (single) await click([...body().querySelectorAll("button")].find(b => /^just me$/i.test(b.textContent.trim())));
  if (byB != null) await setInput(fieldBy(/^Birth year — spouse$/i), byB);
  for (let step = 1; step <= 5; step++) {
    await click(btn(/NEXT ▶/));
    if (retY != null) { const f = fieldBy(/^Target retirement year$/i); if (f) await setInput(f, retY); }
    if (leB != null) { const f = fieldBy(/^Plan-to age — spouse$/i); if (f) await setInput(f, leB); }
    const tot = fieldBy(/^ALL RETIREMENT ACCOUNTS COMBINED/); if (tot && !tot.value) await setInput(tot, "500000");
    const sp = fieldBy(/^SPENDING TODAY/); if (sp && !sp.value) await setInput(sp, "7000");
    const sq = fieldBy(/^EXPECTED SPENDING IN RETIREMENT/); if (sq && !sq.value) await setInput(sq, "6500");
  }
  await click(btn(/BUILD MY PLAN/)); await flush(); await flush(); await flush();
  return (stored("expenses") || []).filter(e => e.label === "Living expenses (wizard)");
};
{ const w = await wizard(); const Rw = Y + 3, Hw = Math.max(Y - 62 + 88, Y - 60 + 90);
  T("D-0: SETUP — the guided setup built a plan with its living-expense rows", w.length >= 1, canon(w));
  if (POST) T(`D-1: the guided setup splits at the 1 January ${Rw} retirement — pre to December ${Rw - 1}, post from January ${Rw} to December ${Hw} (the horizon)`,
    w.length === 2 && w[0].start === `${Y}-01` && w[0].end === `${Rw - 1}-12` && w[0].amount === 7000 && w[1].start === `${Rw}-01` && w[1].end === `${Hw}-12` && w[1].amount === 6500, canon(w));
  else T(`D-1 ${KD}: the guided setup splits at June/July of the retirement year and ends in 2079`, w.length === 2 && w[0].end === `${Rw}-06` && w[1].start === `${Rw}-07` && w[1].end === "2079-12", canon(w)); }
{ const w = await wizard({ byB: 1995, leB: 95 });
  if (POST) T("D-2: a horizon past 2079 (spouse born 1995, planning to 95) runs to December 2090", w.length === 2 && w[1].end === "2090-12", canon(w));
  else T(`D-2 ${KD}: a horizon past 2079 still stops in December 2079 (D-54)`, w.length === 2 && w[1].end === "2079-12", canon(w)); }
{ const w = await wizard({ single: true }); const Hs = Y - 62 + 88;
  if (POST) T(`D-3: a single plan runs to its own horizon, December ${Hs}`, w.length === 2 && w[1].end === `${Hs}-12`, canon(w)); }
{ const w = await wizard({ retY: Y });
  if (POST) T(`D-4: a plan retiring this year (${Y}) has no pre-retirement row — one row from January ${Y}`, w.length === 1 && w[0].start === `${Y}-01` && w[0].phase === "post", canon(w));
  else T(`D-4 ${KD}: a plan retiring this year still gets a pre-retirement row to June ${Y}`, w.length === 2 && w[0].end === `${Y}-06`, canon(w)); }

// ── §E · rendered and structural ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — rendered, structural, the Field Manual, METHODOLOGY");
window.localStorage.clear(); seed(PS, X0); await revisit("my data"); const md = txt();
T("E-0: SETUP — My Data shows the example's table", expRows().length === X0.length, expRows().length);
const note = body().querySelector("[data-dc-exp-redated-note]");
if (POST) {
  T("E-1: the footnote says what When fills in and that a plan saved before v6.24 should check its months", /before retirement runs to December of the year before your retirement year/.test(md)
    && !!note && /A plan saved before v6\.24 stored every row here as January to December and every one-time cost as June/.test(note.textContent) && !/fine-tune the start–end years/.test(md));
  T("E-1b: the same line tells a guided-setup plan built before v6.24 that it splits at June and stops in 2079", !!note && /guided setup built before v6\.24 also splits its living costs at June of the retirement year and stops them in 2079/.test(note.textContent));
  T("E-1c: the footnote says where a one-time cost is charged — the Monte Carlo in its quarter, the year-by-year tabs in its year", /A one-time cost keeps the month you set \(the Monte Carlo charges it in that quarter; the year-by-year tabs in its year\)/.test(md));
  T("E-2: the column header names months", /From – to \(month, year\)/.test(md));
  T(`E-3: every row shows month selectors — two on each of the ${X0.filter(e => e.freq !== "once").length} monthly rows, one on each of the ${X0.filter(e => e.freq === "once").length} one-time rows`, body().querySelectorAll("[data-dc-exp-month]").length === 2 * X0.filter(e => e.freq !== "once").length + X0.filter(e => e.freq === "once").length,
    body().querySelectorAll("[data-dc-exp-month]").length);
} else {
  T(`E-1 ${KD}: the footnote says the editor keeps start–end YEARS`, /fine-tune the start–end years/.test(md) && !note);
}
T("E-4: the live preview reads the example's months — $6,700 today and $8,020 after retirement (unchanged: they fall at June)", /\$6,700/.test(md) && /\$8,020/.test(md));
// structural (AST): buildExpenses builds no date from a -01 / -12 / -06 template, and no editor row reads its year with slice(0, 4)
const fnOf = name => { let f = null; walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id && n.id.name === name) f = n.init; }, W); return f; };
const tmplDates = node => { let c = 0; walk.full(node, n => { if (n.type === "TemplateLiteral" && n.quasis.some(q => /^-(01|06|12)$/.test(q.value.cooked))) c++; }, W); return c; };
const slice04 = () => { let c = 0, ed = null; walk.full(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === "MyDataEditor") ed = n; }, W);
  walk.full(ed, n => { if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name === "slice" && n.arguments.length === 2
    && n.arguments[0].value === 0 && n.arguments[1].value === 4 && n.callee.object.type === "MemberExpression" && ["start", "end"].includes(n.callee.object.property.name)) c++; }, W); return c; };
const be = fnOf("buildExpenses");
if (POST) {
  T("E-5: buildExpenses builds no date from a -01 / -12 / -06 template", be && tmplDates(be) === 0, be && tmplDates(be));
  T("E-6: no editor row reads a stored start or end with slice(0, 4)", slice04() === 0, slice04());
} else {
  T(`E-5 ${KD}: buildExpenses builds its dates from four templates — -01, -12, and -06 for a one-time row's start and end`, be && tmplDates(be) === 4, be && tmplDates(be));
  T(`E-6 ${KD}: the editor reads each row's year with slice(0, 4), three times`, slice04() === 3, slice04());
}
// structural (AST): the leave dialog's save handler (D-59). jsdom cannot see the wrong-tab landing the first fix had — act() flushes the
// passive effect that records the tab before the save's remount, a real browser does not (Chromium showed it) — so the ORDER is pinned
// here: the remembered tab is set, then MYDATA_SAVE is called in the handler itself, not in a timer.
{ const sites = [];
  walk.ancestor(AST, { CallExpression(n, st, anc) { if (n.callee.type === "Identifier" && n.callee.name === "MYDATA_SAVE") sites.push({ n, anc: anc.slice() }); } }, W);
  const leave = sites.map(({ n, anc }) => {
    const deferred = anc.some(a => a.type === "CallExpression" && a.callee.type === "Identifier" && a.callee.name === "setTimeout");
    const ai = anc.findIndex(a => a.type === "JSXAttribute" && a.name && a.name.name === "onClick");   // the button's own handler
    const h = ai < 0 ? null : anc.slice(ai + 1).find(a => a.type === "ArrowFunctionExpression" && a.body && a.body.type === "BlockStatement");
    const stmts = h ? h.body.body : []; const idx = pred => stmts.findIndex(st => { let hit = false; walk.full(st, x => { if (pred(x)) hit = true; }, W); return hit; });
    return { line: n.loc.start.line, deferred, tab: idx(x => x.type === "CallExpression" && x.callee.type === "Identifier" && x.callee.name === "onTabChange"),
             save: idx(x => x === n), sw: idx(x => x.type === "CallExpression" && x.callee.type === "Identifier" && x.callee.name === "setActiveTab") };
  });
  T("A-9c: SETUP — MYDATA_SAVE is called at exactly one site (the leave dialog)", leave.length === 1, canon(leave));
  const L = leave[0] || {};
  if (POST) T("A-9d: the leave dialog sets the remembered tab, then saves in its own handler (not in a timer), then switches", !L.deferred && L.tab >= 0 && L.tab < L.save && L.save < L.sw, canon(L));
  else T("A-9d [KNOWN DEFECT 2026-10-20, D-59 — flips at v6.24]: the leave dialog calls MYDATA_SAVE in a timer, after switching tabs", L.deferred === true && L.sw >= 0, canon(L));
}
// the Field Manual (DOCS_HTML, read raw)
let DOCS = ""; walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id && n.id.name === "DOCS_HTML") DOCS = n.init.type === "Literal" ? n.init.value : ""; }, W);
if (POST) {
  T("E-7: the Field Manual's My Data table says what is kept: the month and year a row starts and ends", /the month and year it starts and ends \(one month for a one-time cost\)/.test(DOCS) && !/start and end dates, deductible flag/.test(DOCS));
  T("E-8: Field Manual §13 records what changed, that a plan saved earlier cannot be put back, and the new defaults", /My Data keeps each expense row’s months \(v6\.24\)/.test(DOCS)
    && /cannot be put back/.test(DOCS) && /ends in December of the year before the retirement year/.test(DOCS) && /it stopped in 2079; a plan it built before v6\.24 keeps its June split and its 2079 end/.test(DOCS));
  T("E-8b: Field Manual §13 records the leave dialog's save (D-59)", /<em>Save &amp; Apply, then leave<\/em> now saves; through v6\.23 it changed tabs and saved nothing/.test(DOCS));
  const MP = join(HERE, "..", "METHODOLOGY.md"); const MD = existsSync(MP) ? readFileSync(MP, "utf8") : "";
  T("E-9: METHODOLOGY records the v6.24 change", /## My Data keeps each expense row's months \(v6\.24\)/.test(MD) && /Saving re-dated rows to whole years \(D-52, closed at v6\.24\)/.test(MD));
} else {
  T(`E-7 ${KD}: the Field Manual promises "start and end dates" the editor did not keep`, /start and end dates, deductible flag/.test(DOCS));
}

await unmount();
finished = true;
console.log(`t87 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
