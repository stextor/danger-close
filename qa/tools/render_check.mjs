// SCOPE_ROTH_TAB_MAGI_MEASUREMENT §3 step 3 — the RENDERED figure, not the variable.
// "The rendered figure is the claim" (scope §7). L9017 prints ${(r.magi/1000).toFixed(0)}K.
import { createRequire } from "module";
import "./qa/env_dom.mjs";
// TRAP: seed Math.random BEFORE importing the bundle (OPERATIONS §C).
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;

const require = createRequire(import.meta.url);
require("./qa/dom_v540.cjs");
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click",{bubbles:true,cancelable:true})); }); await flush(); };

await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const ex = [...body().querySelectorAll("button,[role=button],div")]
  .filter(el => /use example data/i.test(el.textContent||"") && el.children.length===0)[0];
console.log("landing offers Use Example Data:", !!ex);
await click(ex); await flush(); await flush();

const tab = [...body().querySelectorAll("button,div,span")]
  .find(el => (el.textContent||"").trim().toLowerCase()==="roth");
console.log("roth tab found:", !!tab);
await click(tab); await flush(); await flush();

const txt = body().textContent || "";
// The compact card prints "MAGI $XXXK"; the table row prints the same value as a bare $XXXK cell.
const cards = [...txt.matchAll(/MAGI \$(-?\d+)K/g)].map(m=>+m[1]);
console.log("\nRENDERED 'MAGI $XXXK' values (compact cards):", cards.join(", "));
const thr = [...txt.matchAll(/Thr \$(-?\d+)K/g)].map(m=>+m[1]);
console.log("RENDERED 'Thr $XXXK' values:", thr.join(", "));
// Pull the ladder table rows: year, conv, taxableIncome, rate, tax, magi
const rowRe = /(20\d\d)\$(-?\d+)K\$(-?\d+)K(\d+)%\$(-?[\d.]+)K\$(-?\d+)K/g;
const rows=[]; let m;
while((m=rowRe.exec(txt))!==null) rows.push({year:+m[1],conv:+m[2],taxable:+m[3],rate:+m[4],tax:+m[5],magi:+m[6]});
console.log("\nLADDER TABLE, as rendered:");
console.log("year   conv   taxable  rate   tax     MAGI(rendered)");
for(const r of rows) console.log(String(r.year).padEnd(6),("$"+r.conv+"K").padEnd(6),("$"+r.taxable+"K").padEnd(8),(r.rate+"%").padEnd(6),("$"+r.tax+"K").padEnd(7),"$"+r.magi+"K");
console.log("\nrows parsed:", rows.length);
