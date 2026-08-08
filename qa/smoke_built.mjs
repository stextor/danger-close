// Verify the BUILT artifact (dist/index_classicscript_TESTONLY.html), not the source: does the published file
// actually boot, dismiss its gate, load the example household, and carry v5.11?
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

const html = fs.readFileSync("dist/index_classicscript_TESTONLY.html", "utf8");
const vc = new VirtualConsole();
vc.on("jsdomError", e => { if (!/Could not load|css/i.test(String(e.message))) console.log("  [jsdomError]", String(e.message).slice(0, 200)); });

const dom = new JSDOM(html, {
  runScripts: "dangerously", resources: undefined, pretendToBeVisual: true,
  url: "https://localhost/", virtualConsole: vc,
  // The bootstrap wraps window.fetch (`window.fetch.bind(window)`) BEFORE mounting, and this
  // jsdom build ships no fetch — so without a stub installed before the inline scripts parse,
  // the bootstrap throws and the app never mounts. beforeParse is the only hook early enough.
  beforeParse(w) {
    if (!w.fetch) w.fetch = () => Promise.reject(new Error("fetch not available in jsdom"));
  },
});
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {};
window.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {},
  save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, fillText() {}, measureText: () => ({ width: 10 }),
  setLineDash() {}, closePath() {}, rect() {}, clip() {}, createLinearGradient: () => ({ addColorStop() {} }),
});
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";

let pass = 0, fail = 0;
const ck = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const wait = (ms) => new Promise(r => setTimeout(r, ms));

console.log("BUILT ARTIFACT SMOKE — dist/index_classicscript_TESTONLY.html");
await wait(3000);

const txt = () => window.document.body.textContent || "";

// 1) The disclaimer gate is present and functional (it runs independently of React).
const gate = window.document.getElementById("dc-disclaimer-gate");
ck("disclaimer gate rendered on first open", !!gate);
if (gate) {
  const btn = [...gate.querySelectorAll("button")].pop();
  const chk = gate.querySelector("input[type=checkbox]");
  if (chk) { chk.checked = true; chk.dispatchEvent(new window.Event("change", { bubbles: true })); }
  if (btn) { btn.disabled = false; btn.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); }
  await wait(500);
  ck("gate dismisses after acknowledgement", !window.document.getElementById("dc-disclaimer-gate"));
}

// 2) React mounted from the inlined bundle.
await wait(2000);
ck("React app mounted from the inlined bundle", (window.document.getElementById("root")?.children.length || 0) > 0);

// 3) The version the four in-app sites carry.
ck("built app renders v5.11", /v5\.11/.test(txt()), txt().slice(0, 120));
ck("no stale v5.10.x version rendered", !/v5\.10\.\d/.test(txt()));

// 4) Load the example household and reach the Taxes tab.
const findByText = (re, tags = "button, div, span") =>
  [...window.document.body.querySelectorAll(tags)].find(el => re.test((el.textContent || "").trim()) && el.children.length === 0);
const ex = findByText(/use example data/i);
ck("landing screen offers Use Example Data", !!ex);
if (ex) {
  ex.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await wait(4000);
  const taxes = [...window.document.body.querySelectorAll("button, div, span")]
    .find(el => (el.textContent || "").trim().toLowerCase() === "taxes");
  ck("Taxes tab reachable in the built app", !!taxes);
  if (taxes) {
    taxes.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await wait(4000);
    const t = txt();
    ck("Taxes schedule renders an RMD column", /RMD/.test(t));
    ck("v5.11 survivor disclosure text is present in the shipped build",
      /RIB-LIM widow's limit/.test(t) || /larger of the two/.test(t) || /Survivor year/.test(t));
  }
}

// ── Bootstrap contract (added 2026-08-08 after a build shipped WITHOUT it). The app calls
// window.storage.*, which exists in the artifact environment but NOT in a normal browser;
// src/main.jsx installs a localStorage-backed shim before mounting. A build made from a
// wrong/reconstructed entry still renders perfectly and still passes every check above —
// persistence is simply dead. So the shim is now asserted directly, and exercised. ──
ck("window.storage shim installed by the bootstrap", !!window.storage && typeof window.storage.set === "function");
if (window.storage) {
  try {
    await window.storage.set("smoke_probe", "42");
    const got = await window.storage.get("smoke_probe");
    ck("window.storage round-trips a value", got && got.value === "42", JSON.stringify(got));
    ck("window.storage writes through to localStorage under the dc: prefix",
      window.localStorage.getItem("dc:smoke_probe") === "42");
    const listed = await window.storage.list("smoke_");
    ck("window.storage.list finds the key", !!listed && listed.keys.includes("smoke_probe"), JSON.stringify(listed));
    await window.storage.delete("smoke_probe");
    let threw = false;
    try { await window.storage.get("smoke_probe"); } catch { threw = true; }
    ck("window.storage.get throws on a missing key (artifact API contract)", threw);
  } catch (e) { ck("window.storage exercised without throwing", false, String(e).slice(0, 160)); }
}
ck("Anthropic fetch wrapper installed by the bootstrap", /\/anthropic/.test(html));

console.log(`\nBUILT SMOKE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
