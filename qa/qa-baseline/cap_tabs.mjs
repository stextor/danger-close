// Capture per-tab text signatures — grounding for t4 assertions.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "v592";
require(`./dom_${VER}.cjs`);
const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
const React = require("react");
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
const body = () => window.document.body;
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const example = [...body().querySelectorAll("button, div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
await click(example); await flush(); await flush();
const tabs = [...body().querySelectorAll("button.tab")];
console.log("TAB COUNT:", tabs.length, "| labels:", tabs.map(t => t.textContent.trim()).join("|"));
const out = {};
for (const t of tabs) {
  await click(t); await flush();
  out[t.textContent.trim()] = (body().textContent || "").replace(/\s+/g, " ");
}
const fs = await import("fs");
fs.default.writeFileSync(`/tmp/tabs_${VER}.json`, JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log("──", k, "(", v.length, "chars ):", v.slice(0, 150));
process.exit(0);
