import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 100) => { await act(async () => { await sleep(ms); }); };
const errors = [];
console.error = (...a) => { const s = a.join(" "); if (!/Warning:|act\(/.test(s)) errors.push(s.slice(0, 150)); };

(async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  createRoot(container).render(React.createElement(App));
  await flush(300);
  const sampleBtn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  await act(async () => { sampleBtn.click(); });
  await flush(500);

  const clickTab = async (name) => {
    const btn = [...document.querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
    await act(async () => { btn.click(); });
    await flush(300);
  };

  await clickTab("skins");
  const tiles = [...document.querySelectorAll("button")].filter(b => /Field Manual — Red|Reading Paper|E-Ink Gray/.test(b.textContent));
  console.log("new skin tiles found:", tiles.length, "of 3");

  for (const label of ["Field Manual — Red", "Reading Paper", "E-Ink Gray"]) {
    await clickTab("skins");
    const tile = [...document.querySelectorAll("button")].find(b => b.textContent.includes(label));
    await act(async () => { tile.click(); });
    await flush(200);
    // visit a representative spread of tabs in this skin
    for (const t of ["trajectory", "taxes", "monte carlo", "grade", "docs"]) await clickTab(t);
    const ok = document.body.textContent.length > 2000;
    console.log(`skin "${label}": applied + 5 tabs rendered:`, ok, "| errors so far:", errors.length);
  }
  console.log("total runtime errors:", errors.length ? errors.slice(0,3) : "none");
  process.exit(errors.length ? 2 : 0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
