// t88_holdings_columns.mjs — v6.25 (F-21; docs/SCOPE_F21_HOLDINGS_PLAN_TYPE_V625.md): My Data's holdings table, one control per cell.
//
// WHAT IT PINS. Through v6.24 the Retirement holdings table's Tax type cell held two dropdowns stacked — the tax type and, for any row with
// Traditional dollars, the plan type — with no column header for the second and no divider between rows, so the lower dropdown read as the
// next ticker's. And the footer's "Total annual fees →" spanned nine columns where eight stand before $/yr fee, so the fee total sat under
// Contrib split % and the contribution total under the delete column. From v6.25 plan type has its own headed column (a dash for a Roth
// row), every row has a divider, and the footer's label spans exactly the columns before $/yr fee.
//
// What this suite can and cannot see. jsdom does no layout, so it asserts STRUCTURE — cells per row against the header, controls per cell,
// which column the plan-type dropdown and each total sit in. That a row then renders one line high is a layout fact; it was measured in
// Chromium on the built page at the build (scope §6) and t45/t48 run on the same page.
//
// Both legs: node t88_holdings_columns.mjs v624 | node t88_holdings_columns.mjs v625. The v6.24 leg pins both defects as dated
// [KNOWN DEFECT 2026-10-21, F-21]. Controls: qa/tools/controls_v625_columns.py (repo-only). Exits with process.exit (the app leaves timers).
import { createRequire } from "module";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import "./env_dom.mjs";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v625";
const KNOWN_VERSIONS = ["v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-21, F-21 — flips at v6.25]";
const require = createRequire(import.meta.url);

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t88 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t88 — MY DATA'S HOLDINGS TABLE, ONE CONTROL PER CELL (${VER})`);

// ── the DOM harness (t87's) ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const body = () => window.document.body;
const txt = () => body().textContent || "";
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root, act, DangerClose, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const setSelect = async (x, v) => { if (!x) return false; try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(x, String(v)); x.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {} await flush(); return true; };
const render = async () => { el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
const go = async name => { await click(tabBtn(name)); await flush(); await flush(); };
const stored = k => JSON.parse(window.localStorage.getItem(PREFIX + K[k]) || "null");

// the Retirement holdings table and its parts
const table = () => { const card = [...body().querySelectorAll(".card")].find(c => /RETIREMENT HOLDINGS/.test(c.textContent || "")); return card ? card.querySelector("table") : null; };
const heads = () => [...(table()?.querySelectorAll("thead th") || [])].map(h => (h.textContent || "").trim());
const rows = () => [...(table()?.querySelectorAll("tbody tr") || [])];
const ctrls = td => td.querySelectorAll("select, input").length;
const PLAN_LABEL = "Plan type of the Traditional dollars";
const planCol = tr => [...tr.children].findIndex(td => !!td.querySelector(`select[aria-label="${PLAN_LABEL}"]`));
// column index of each footer cell, counting colSpans
const footCols = () => { const out = []; let c = 0; for (const td of table()?.querySelectorAll("tfoot td") || []) { out.push({ col: c, span: td.colSpan || 1, text: (td.textContent || "").trim() }); c += td.colSpan || 1; } return out; };
const taxSelect = tr => [...tr.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "mixed"));

// ── §A · the table as the example renders it ─────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — structure on the example household");
window.localStorage.clear(); await render();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
await go("my data");
const H = heads(), R0 = rows();
T("A-0: SETUP — My Data shows the Retirement holdings table with the example's five rows", !!table() && R0.length === 5, `${!!table()} / ${R0.length}`);
const iTax = H.indexOf("Tax type"), iPlan = H.indexOf("Plan type"), iFee = H.indexOf("$/yr fee"), iCon = H.findIndex(h => /^Contrib split/.test(h));
T("A-00: SETUP — the header names Tax type, $/yr fee and Contrib split %", iTax >= 0 && iFee >= 0 && iCon >= 0, H.join(" | "));
if (POST) {
  T("A-1: a column headed Plan type follows Tax type", iPlan === iTax + 1, H.join(" | "));
  T("A-2: every row has as many cells as the header has columns", R0.every(tr => tr.children.length === H.length), R0.map(tr => tr.children.length).join(","));
  T("A-3: no cell holds more than one control", R0.every(tr => [...tr.children].every(td => ctrls(td) <= 1)), R0.map(tr => [...tr.children].map(ctrls).join("")).join(" / "));
  T("A-4: on every row with Traditional dollars the plan-type dropdown sits in the Plan type column", R0.length > 0 && R0.every(tr => planCol(tr) === iPlan), R0.map(planCol).join(","));
  T("A-5: each row carries a divider", R0.every(tr => /1px solid/.test(tr.getAttribute("style") || "")), R0[0] && R0[0].getAttribute("style"));
  const F = footCols(); const lab = F.find(f => /Total annual fees/i.test(f.text)); const fee = F.find(f => /^\$[\d,]+$/.test(f.text)); const con = F.find(f => /%/.test(f.text));
  T("A-6: the footer's label spans exactly the columns before $/yr fee, and the fee total sits under $/yr fee", !!lab && lab.col === 0 && lab.span === iFee && !!fee && fee.col === iFee, JSON.stringify(F));
  T("A-7: the contribution total sits under Contrib split %, and the footer has as many columns as the header", !!con && con.col === iCon && F.reduce((s, f) => s + f.span, 0) === H.length, JSON.stringify(F));
} else {
  T(`A-1 ${KD}: there is no Plan type column`, iPlan === -1, H.join(" | "));
  T(`A-3 ${KD}: the Tax type cell holds two dropdowns on every row with Traditional dollars`, R0.length > 0 && R0.every(tr => ctrls(tr.children[iTax]) === 2), R0.map(tr => ctrls(tr.children[iTax])).join(","));
  const F = footCols(); const fee = F.find(f => /^\$[\d,]+$/.test(f.text));
  T(`A-6 ${KD}: the fee total sits one column right, under Contrib split %`, !!fee && fee.col === iCon, JSON.stringify(F));
  T(`A-7 ${KD}: the footer has one column more than the header`, F.reduce((s, f) => s + f.span, 0) === H.length + 1, JSON.stringify(F));
}

// ── §B · a Roth row, and the dropdown still saves ────────────────────────────────────────────────────────────────────────────────────
console.log("  B — a Roth row; choosing a plan type still saves");
// The round trip (added at the build's review): give the first row a plan type other than its own, make it Roth, make it Traditional again —
// the dropdown must come back in its column holding the plan type it had (updateRow writes only the field changed).
let tripFrom = null, tripTo = null;
{ const ps0 = rows()[0].querySelector(`select[aria-label="${PLAN_LABEL}"]`);
  tripFrom = ps0 && ps0.value; tripTo = ps0 && ([...ps0.options].map(o => o.value).find(v => v !== tripFrom) || null);
  await setSelect(ps0, tripTo);
  const now = rows()[0].querySelector(`select[aria-label="${PLAN_LABEL}"]`);
  T("B-00: SETUP — the first row's plan type is set to one other than its own", !!tripTo && !!now && now.value === tripTo, `${tripFrom} → ${now && now.value}`); }
{ const tr = rows()[0]; await setSelect(taxSelect(tr), "roth");
  const tr2 = rows()[0];
  T("B-0: SETUP — the first row's tax type is now Roth", taxSelect(tr2) && taxSelect(tr2).value === "roth");
  T("B-1: a Roth row holds no plan-type dropdown", planCol(tr2) === -1 && !tr2.querySelector(`select[aria-label="${PLAN_LABEL}"]`));
  if (POST) {
    const cell = tr2.children[iPlan];
    T("B-2: its Plan type cell shows a dash, and the row still has a cell for every column", !!cell && (cell.textContent || "").trim() === "—" && tr2.children.length === H.length, cell && cell.textContent);
  }
  await setSelect(taxSelect(rows()[0]), "trad");
  const tr3 = rows()[0], ps3 = tr3.querySelector(`select[aria-label="${PLAN_LABEL}"]`);
  T("B-2b: made Traditional again, the row's plan-type dropdown is back in its column with the plan type it had", !!ps3 && planCol(tr3) === (POST ? iPlan : iTax) && ps3.value === tripTo,
    `${planCol(tr3)} / ${ps3 && ps3.value} (want ${tripTo})`); }
{ const tr = rows()[1]; const ps = tr.querySelector(`select[aria-label="${PLAN_LABEL}"]`);
  T("B-3: SETUP — the second row has a plan-type dropdown offering employer", !!ps && [...ps.options].some(o => o.value === "employer"));
  await setSelect(ps, "employer");
  await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush();
  const P = stored("portfolio"); const pos = P && P.positions && P.positions[1];
  T("B-4: the plan type chosen there is stored by Save & Apply (the handler moved with the cell)", !!pos && pos.planType === "employer", pos && JSON.stringify(pos).slice(0, 200));
  await go("my data");
  const back = rows()[1] && rows()[1].querySelector(`select[aria-label="${PLAN_LABEL}"]`);
  T("B-5: and My Data shows it on return", !!back && back.value === "employer", back && back.value); }

// ── §E · the Field Manual ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the Field Manual");
{ const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
  const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
  const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
  let DOCS = ""; walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id && n.id.name === "DOCS_HTML" && n.init && n.init.type === "Literal") DOCS = n.init.value; },
    Object.assign({}, walk.base, { JSXElement() {}, JSXFragment() {} }));
  T("E-0: SETUP — the Field Manual is read", DOCS.length > 100000, DOCS.length);
  if (POST) T("E-1: Field Manual §13 records the column and the totals", /My Data’s holdings table gives plan type its own column \(v6\.25\)/.test(DOCS) && /the table’s totals sit under their own columns/.test(DOCS));
  else T(`E-1 ${KD}: Field Manual §13 does not mention it`, !/gives plan type its own column/.test(DOCS)); }

finished = true;
console.log(`t88 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
