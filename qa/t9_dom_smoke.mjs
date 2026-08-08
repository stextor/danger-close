// t9 — DOM smoke (jsdom): the app renders end-to-end with the v5.10 form; the accrual
// readout appears on My Data with the demo household's expected figures; the Roth tab renders.
// NOT a substitute for the repo's full t4 (171 DOM checks) — a smoke layer for this session.
import { JSDOM } from "jsdom";
import { createRequire } from "module";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://localhost/", pretendToBeVisual: true,
});
const { window } = dom;
global.window = window; global.document = window.document;
Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
global.HTMLElement = window.HTMLElement; global.Element = window.Element; global.Node = window.Node;
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = clearTimeout;
window.requestAnimationFrame = global.requestAnimationFrame;
window.cancelAnimationFrame = global.cancelAnimationFrame;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.ResizeObserver = window.ResizeObserver;
window.scrollTo = () => {};
window.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {},
  save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, fillText() {}, measureText: () => ({ width: 10 }),
  setLineDash() {}, closePath() {}, rect() {}, clip() {}, createLinearGradient: () => ({ addColorStop() {} }),
});
// No window.storage on purpose: the app should show the landing screen (loadFromStorage → false).

let pass = 0, fail = 0;
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};
process.env.IS_REACT_ACT_ENVIRONMENT = "true";
window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const require = createRequire(import.meta.url);
require("./dom_bundle.cjs");
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const T = window.__test;
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const findByText = (txt) => [...body().querySelectorAll("button, div, span")].find(el => (el.textContent || "").trim().toUpperCase().includes(txt.toUpperCase()) && el.children.length <= 2);

console.log("t9 — DOM SMOKE (jsdom)");
try {
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  ck("app mounts without throwing", true);

  // Landing screen → Use Example Data
  const example = [...body().querySelectorAll("button, [role=button], div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0]
    || [...body().querySelectorAll("*")].find(el => /example data/i.test(el.textContent || "") && el.tagName === "BUTTON");
  ck("landing screen offers Use Example Data", !!example);
  if (example) { await click(example); await flush(); await flush(); }

  const bodyText = body().textContent || "";
  // Smoke-level check: a version badge rendered at all. Pinned to the exact string it is a
  // per-release maintenance burden and duplicates t1/t4, which assert the version exactly;
  // here we only prove the shell mounted and stamped a 5.x version (v5.10.x, v5.11, ...).
  ck("app shell renders after example load (version badge)", /v5\.\d+/.test(bodyText), "version string not found");

  // Open My Data
  const myDataCands = [...body().querySelectorAll("button, div, span")].filter(el => /^my data$/i.test((el.textContent || "").trim()));
  const myData = myDataCands.find(el => el.tagName === "BUTTON") || myDataCands[0];
  ck("MY DATA tab present", !!myData);
  if (myData) { await click(myData); await flush(); }

  const t = body().textContent || "";
  ck("accrual readout renders", t.includes("Projected added by retirement:"));
  // Demo: A pre-tax $2,500/mo, Roth $0; retire 2027 per scope note (~1 yr under demo timeline).
  // Verify readout figures agree with contribAccrual for the demo's target year.
  const tl = T.PLAN_TIMELINE;
  // The readout previews what SAVE would produce from current form state. The demo household
  // stores monthly401k/contribPreTaxA=2500 but no per-paycheck fields, so the A-side rollup
  // (pre-existing v5.9.2 machinery, deliberately unchanged) reads $0 — the readout must say $0K
  // for A. B has a direct monthly field, so B must show 12 * contribPreTaxB * yearsB.
  const asOfYear = new Date().getFullYear();
  const yearsB = Math.max(0, (tl.targetRetireYearB || tl.targetRetireYear) - asOfYear);
  const c = T.PORTFOLIO.contributions;
  const kB = `$${Math.round(12 * (c.contribPreTaxB || 0) * yearsB / 1000).toLocaleString()}K`;
  ck("readout Trad-A previews form state ($0K — demo lacks per-paycheck fields)", /\$0K Trad/.test(t.slice(t.indexOf("Projected added by retirement:"), t.indexOf("Projected added by retirement:") + 120)));
  ck(`readout Trad-B figure matches helper convention (${kB})`, t.includes(`${kB} Trad`), `expected "${kB} Trad" in page`);
  ck("hybrid pre-tax label renders", t.includes("Pre-tax (Traditional 401k/IRA)"));
  ck("Roth monthly inputs render", t.includes("Roth (401k/IRA) $/month"));
  ck("framing line renders", t.includes("the model still taxes nothing before retirement"));

  // Roth tab renders with accrued balances (no crash in ladder/STEP-1 paths)
  const rothTab = [...body().querySelectorAll("button, div, span")].find(el => /^roth$/i.test((el.textContent || "").trim()));
  if (rothTab) { await click(rothTab); await flush(); await flush(); }
  ck("Roth tab renders without throwing", !!rothTab && (body().textContent || "").length > 1000);

  // Withdrawal + Taxes + IRMAA render (the census-found consumers)
  for (const name of ["withdrawal", "taxes", "irmaa"]) {
    const tab = [...body().querySelectorAll("button, div, span")].find(el => (el.textContent || "").trim().toLowerCase() === name);
    if (tab) { await click(tab); await flush(); }
    ck(`${name} tab renders without throwing`, !!tab && (body().textContent || "").length > 500);
  }
} catch (e) {
  fail++; console.log(`  ✗ smoke run threw: ${String(e).slice(0, 300)}`);
}

console.log(`\nt9 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
