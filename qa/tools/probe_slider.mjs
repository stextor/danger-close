// PROBE — can the Roth conversion slider be driven in the jsdom harness, and does the
// ladder re-render? Prints the rendered MAGI column at each position.
// TOOLING. Asserts nothing. Counted in NO check total (OPERATIONS §B1).
import { createRequire } from "module";
import "../env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const VER = process.argv[2] || "v542";
const require = createRequire(import.meta.url);
require(`../dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async el => {
  await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); });
  await flush();
};

await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const ex = [...body().querySelectorAll("button,[role=button],div")]
  .filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
await click(ex); await flush(); await flush();
const tab = [...body().querySelectorAll("button,div,span")]
  .find(el => (el.textContent || "").trim().toLowerCase() === "roth");
await click(tab); await flush(); await flush();

const sliders = [...body().querySelectorAll('input[type=range]')];
console.log("range inputs on the Roth tab:", sliders.length);
sliders.forEach((s, i) => console.log(`  [${i}] min=${s.min} max=${s.max} step=${s.step} value=${s.value}`));
const slider = sliders.find(s => s.max === "400000" && s.step === "5000");
console.log("conversion slider found:", !!slider, slider && slider.value);

const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
const rowRe = /(20\d\d)\$(-?\d+)K\$(-?\d+)K(\d+)%\$(-?[\d.]+)K\$(-?\d+)K/g;
const readRows = () => {
  const txt = body().textContent || ""; const out = []; let m; rowRe.lastIndex = 0;
  while ((m = rowRe.exec(txt)) !== null) out.push({ year: +m[1], magi: +m[6] });
  return out;
};
console.log("\nDEFAULT:", JSON.stringify(readRows().map(r => `${r.year}:${r.magi}K`)));

for (const pos of ["15000", "20000", "30000", "50000", "70000"]) {
  await act(async () => {
    setNative.call(slider, pos);
    slider.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  await flush(); await flush();
  console.log(`\n$${pos}:`, JSON.stringify(readRows().map(r => `${r.year}:${r.magi}K`)));
}
process.exit(0);
