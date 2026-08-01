import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 100) => { await act(async () => { await sleep(ms); }); };
const _origErr = console.error.bind(console);
console.error = (...a) => { const s = a.map(x => (x && x.stack) || String(x)).join(" "); _origErr(s); };
process.on("unhandledRejection", e => { if (process.env.DEBUG_ERR) console.log("UNHANDLED:", e && e.stack || e); });

const mode = process.env.SHARE_MODE; // "success" | "cancel" | "unsupported"

if (mode === "success") {
  window.navigator.canShare = (data) => !!(data && data.files);
  window.navigator.share = async (data) => { window.__shared = data; return undefined; };
} else if (mode === "cancel") {
  window.navigator.canShare = (data) => !!(data && data.files);
  window.navigator.share = async () => { const e = new Error("cancelled"); e.name = "AbortError"; throw e; };
} else {
  // unsupported: no canShare/share at all — mimics desktop/older browsers → must fall through
  delete window.navigator.canShare;
  delete window.navigator.share;
}

(async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  createRoot(container).render(React.createElement(App));
  await flush(300);
  const sampleBtn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  console.log(`[${mode}] sample button found:`, !!sampleBtn);
  await act(async () => { sampleBtn.click(); });
  await flush(600);

  const clickTab = async (name) => {
    const btn = [...document.querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
    if (!btn) { console.log(`[${mode}] tab not found:`, name, "| available:", [...document.querySelectorAll("button.tab")].map(b=>b.textContent.trim()).join(",")); return; }
    await act(async () => { btn.click(); });
    await flush(300);
  };
  await clickTab("my data");

  const exportBtn = [...document.querySelectorAll("button")].find(b => /EXPORT BACKUP/.test(b.textContent));
  console.log(`[${mode}] export button found:`, !!exportBtn);
  if (!exportBtn) { process.exit(0); }
  await act(async () => { exportBtn.click(); });
  await flush(300);

  const body = document.body.textContent;
  console.log(`[${mode}] navigator.share called:`, !!window.__shared);
  console.log(`[${mode}] shared filename ends .json:`, window.__shared ? /\.json$/.test(window.__shared.files[0].name) : "n/a");
  console.log(`[${mode}] 'Share sheet opened' message shown:`, /Share sheet opened/.test(body));
  console.log(`[${mode}] classic 'Downloads folder' message shown:`, /Saved to your browser's/.test(body));
  console.log(`[${mode}] error toast shown:`, /Export failed/.test(body));
  process.exit(0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
