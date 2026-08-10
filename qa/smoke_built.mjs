// Verify the BUILT artifact (dist/index.html), not the source: does the published file
// actually boot, dismiss its gate, load the example household, and carry v5.11?
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "fs";

let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };

// ── Input: the REAL built artifact. jsdom cannot execute <script type="module">, so we derive a
//    test-only classic-script copy here rather than expecting one to exist (it is NOT a file that
//    is kept, committed, or carried between sessions — earlier versions of this script read a
//    variant produced by hand, which meant it could not run standalone).
//    The relocation to just before </body> is REQUIRED, not cosmetic: module scripts are deferred,
//    classic ones are not, so running the bundle in place executes before <div id="root"> exists
//    and throws React error #299. Verified safe because the bundle contains no module-only syntax
//    (no import.meta, no export, no dynamic import).
const SRC_HTML = process.argv[2] || "dist/index.html";
const TMP_HTML = SRC_HTML.replace(/\.html$/, "") + ".__smoketest__.html";
const _real = fs.readFileSync(SRC_HTML, "utf8");
{
  const m = _real.match(/<script type="module"[^>]*>/);
  if (!m) { console.log(`  \u2717 no inlined module script found in ${SRC_HTML}`); process.exit(1); }
  const a = _real.indexOf(m[0]);
  const b = _real.indexOf("</script>", a + m[0].length) + "</script>".length;
  const block = _real.slice(a, b).replace(m[0], "<script>");
  // NOTE: the replacement MUST be a function. A string replacement would let $& / $` / $\' inside
  // the minified bundle be interpreted as JS replacement patterns and silently corrupt the script
  // (symptom: "Unexpected end of input" and a gate that will not dismiss).
  fs.writeFileSync(TMP_HTML, (_real.slice(0, a) + _real.slice(b)).replace("</body>", () => block + "\n</body>"));
}
process.on("exit", () => { try { fs.unlinkSync(TMP_HTML); } catch {} });  // never leave it behind
const html = fs.readFileSync(TMP_HTML, "utf8");
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

console.log(`BUILT ARTIFACT SMOKE \u2014 ${SRC_HTML}`);
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
// Version is read FROM the artifact rather than hardcoded, so this check does not need a manual
// bump every release (a hardcoded "v5.11" here failed at v5.12 — the same class of stale-literal
// breakage PROJECT_INSTRUCTIONS §I warns about for the suites).
const _verMatch = html.match(/DANGER CLOSE (v5\.[0-9.]+) \u2502 Not financial advice/);
const _ver = _verMatch ? _verMatch[1] : null;
ck("artifact declares a version in its footer string", !!_ver, "footer version not found");
ck(`built app renders its own declared version (${_ver})`, !!_ver && txt().includes(_ver), txt().slice(0, 120));
// Only the four VERSION SITES must agree. Historical references like "since v5.7" appear
// throughout the Field Manual and are legitimate — an earlier version of this check flagged them
// and was wrong about the build, not the other way round.
const _siteVers = [
  ...html.matchAll(/FIELD MANUAL \u00b7 (v5\.[0-9.]+) \u00b7 PUBLIC BUILD/g),
  ...html.matchAll(/DANGER CLOSE (v5\.[0-9.]+) \u00b7 documentation regenerated/g),
  ...html.matchAll(/DATA LOAD \u2502 (v5\.[0-9.]+)/g),
  ...html.matchAll(/DANGER CLOSE (v5\.[0-9.]+) \u2502 Not financial advice/g),
].map(m => m[1]);
ck("all four in-app version sites agree, each present exactly once",
  _siteVers.length === 4 && _siteVers.every(v => v === _ver),
  `found [${_siteVers.join(", ")}], expected four x ${_ver}`);

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
    ck("survivor disclosure text is present in the shipped build",
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
