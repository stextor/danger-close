import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 100) => { await act(async () => { await sleep(ms); }); };
console.error = () => {};

(async () => {
  if (process.env.BANNER_CASE === "amber") {
    const c2 = document.createElement("div");
    document.body.appendChild(c2);
    createRoot(c2).render(React.createElement(App));
    await flush(300);
    const sampleBtn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
    await act(async () => { sampleBtn.click(); });
    await flush(600);
    const b2 = document.body.textContent;
    console.log("example mode → amber banner:", /EXAMPLE DATA MODE/.test(b2), "| red suppressed:", !/USING EXAMPLE NUMBERS, NOT YOUR DATA/.test(b2));
    process.exit(0);
  }
  // Pre-seed storage with a LEGACY-style real plan: positions present, NO incomeSources,
  // NO _incomeFromForm flag, NO saved master prompt. Before the fix, the app silently
  // parsed the built-in demo prompt and installed demo income with no warning.
  const legacyPortfolio = {
    nameA: "Spouse A", nameB: "Spouse B", single: false,
    total401k: 500000, household: 500000,
    bucketActuals: { 1: 0.3, 2: 0.2, 3: 0.45, 4: 0.05 },
    positions: [
      { ticker: "VTI", name: "Total Market", balance: 300000, bucket: 3, type: "equity-lb", taxType: "traditional" },
      { ticker: "CASH", name: "Money Market", balance: 200000, bucket: 1, type: "cash", taxType: "traditional" },
    ],
  };
  await window.storage.set("danger_close:portfolio_v1", JSON.stringify(legacyPortfolio));

  const container = document.createElement("div");
  document.body.appendChild(container);
  createRoot(container).render(React.createElement(App));
  await flush(600);

  const body = document.body.textContent;
  const redBanner = /USING EXAMPLE NUMBERS, NOT YOUR DATA/.test(body);
  const namesFields = /Spouse A Social Security/.test(body) && /Spouse B Social Security/.test(body) && /Pension/.test(body);
  const hasDiagnostics = /diagnostics:/.test(body);
  console.log("legacy plan w/o income → red banner fires:", redBanner);
  console.log("banner names the substituted fields:", namesFields);
  console.log("diagnostics line present:", hasDiagnostics);

  // Control: the example-data path must show the AMBER banner, not the red one.
  await window.storage.delete("danger_close:portfolio_v1");
  const c2 = document.createElement("div");
  document.body.innerHTML = ""; document.body.appendChild(c2);
  createRoot(c2).render(React.createElement(App));
  await flush(300);
  const sampleBtn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  await act(async () => { sampleBtn.click(); });
  await flush(500);
  const b2 = document.body.textContent;
  console.log("example mode → amber banner:", /EXAMPLE DATA MODE/.test(b2), "| red suppressed:", !/USING EXAMPLE NUMBERS, NOT YOUR DATA/.test(b2));
  process.exit(0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
