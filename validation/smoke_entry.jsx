// Smoke test entry — bundled by esbuild, executed inside jsdom globals.
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 60) => { await act(async () => { await sleep(ms); }); };

const results = [];
const errors = [];
const origError = console.error;
console.error = (...a) => {
  const s = a.map(x => (x && x.stack) || String(x)).join(" ");
  // Ignore React act()/key warnings noise; capture real errors
  if (!/Warning:|act\(/.test(s)) errors.push(s.slice(0, 300));
  // stay quiet
};

(async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => { root.render(React.createElement(App)); });
  await flush(150);

  // ── 1. Landing screen → click "USE EXAMPLE DATA" ──
  const buttons = [...document.querySelectorAll("button")];
  const sampleBtn = buttons.find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  if (!sampleBtn) { console.log("FAIL: no USE EXAMPLE DATA button. Body:", document.body.textContent.slice(0, 400)); process.exit(1); }
  await act(async () => { sampleBtn.click(); });
  await flush(400); // let applyLoadedData + storage + initial sim kick off

  // ── 2. Collect tab buttons ──
  const tabButtons = () => [...document.querySelectorAll("button.tab")];
  let tabs = tabButtons();
  // The example-data flow lands on "mydata"; give the shell a moment
  for (let i = 0; i < 10 && tabs.length === 0; i++) { await flush(200); tabs = tabButtons(); }
  const tabNames = tabs.map(b => b.textContent.trim());
  console.log("TAB COUNT:", tabNames.length);
  console.log("TABS:", tabNames.join(" | "));

  const forbidden = /bucket|glide/i;
  const forbiddenHits = [];

  // ── 3. Click through every tab ──
  for (const name of tabNames) {
    const btn = tabButtons().find(b => b.textContent.trim() === name);
    let ok = true, note = "";
    try {
      await act(async () => { btn.click(); });
      // heavy tabs (monte carlo, stress, backtest) need longer
      await flush(/monte|stress|backtest|compare|what/.test(name) ? 1500 : 400);
      const text = document.body.textContent;
      if (text.length < 500) { ok = false; note = "near-empty render"; }
      // scan rendered text for forbidden bucket/glide UI language (excluding this tab strip itself)
      const m = text.match(/[^.\n]{0,60}(?:[Bb]ucket|B[1-4]\s|[Gg]lide\s?path)[^.\n]{0,60}/g);
      if (m) m.slice(0, 3).forEach(s => forbiddenHits.push(`[${name}] ${s.trim()}`));
    } catch (e) {
      ok = false; note = (e && e.message) || String(e);
    }
    results.push({ tab: name, ok, note });
  }

  // ── 4. Report ──
  console.log("\n── TAB RESULTS ──");
  for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"}  ${r.tab}${r.note ? "  ← " + r.note : ""}`);
  console.log("\n── FORBIDDEN-TERM HITS IN RENDERED UI ──");
  if (forbiddenHits.length === 0) console.log("none");
  else [...new Set(forbiddenHits)].forEach(h => console.log("  •", h));
  console.log("\n── RUNTIME ERRORS CAPTURED ──");
  if (errors.length === 0) console.log("none");
  else [...new Set(errors)].slice(0, 8).forEach(e => console.log("  •", e));

  const failures = results.filter(r => !r.ok).length;
  console.log(`\nSUMMARY: ${results.length - failures}/${results.length} tabs OK, ${errors.length} runtime errors, ${forbiddenHits.length} forbidden-term hits`);
  process.exit(failures > 0 ? 2 : 0);
})().catch(e => { console.log("HARNESS CRASH:", e && e.stack || e); process.exit(3); });
