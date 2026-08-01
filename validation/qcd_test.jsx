import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 80) => { await act(async () => { await sleep(ms); }); };
const errors = [];
const origErr = console.error;
console.error = (...a) => { const s = a.join(" "); if (!/Warning:|act\(/.test(s)) errors.push(s.slice(0, 200)); };

const setRange = async (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, String(value));
  await act(async () => { input.dispatchEvent(new window.Event("input", { bubbles: true })); input.dispatchEvent(new window.Event("change", { bubbles: true })); });
  await flush(150);
};

(async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  createRoot(container).render(React.createElement(App));
  await flush(200);
  const sampleBtn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  await act(async () => { sampleBtn.click(); });
  await flush(500);

  const clickTab = async (name) => {
    const btn = [...document.querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
    await act(async () => { btn.click(); });
    await flush(400);
  };

  // ── Taxes tab: baseline ──
  await clickTab("taxes");
  const grab = (re) => (document.body.textContent.match(re) || [])[1];
  const lifetimeBefore = grab(/TOTAL LIFETIME TAX\$?([\d.]+)M/);
  const qcdSlider = [...document.querySelectorAll('input[type="range"]')].find(i => Number(i.max) === 222000);
  console.log("QCD slider present:", !!qcdSlider, "| max:", qcdSlider?.max, "| lifetime tax before:", lifetimeBefore + "M");

  // ── Move QCD to $60K/yr ──
  await setRange(qcdSlider, 60000);
  const lifetimeAfter = grab(/TOTAL LIFETIME TAX\$?([\d.]+)M/);
  const hasLifetimeQcd = /Lifetime QCDs/.test(document.body.textContent);
  console.log("lifetime tax after $60K/yr QCD:", lifetimeAfter + "M", "| decreased:", Number(lifetimeAfter) < Number(lifetimeBefore), "| 'Lifetime QCDs' shown:", hasLifetimeQcd);

  // ── IRMAA tab reflects the shared value ──
  await clickTab("irmaa");
  const irmaaTxt = document.body.textContent;
  const qcdNote = /QCDs from the Taxes-tab modeler/.test(irmaaTxt);
  const irmaaTotal1 = grab(/LIFETIME IRMAA SURCHARGES\$?([\d,K.]+)/);
  console.log("IRMAA tab QCD note shown:", qcdNote, "| lifetime IRMAA w/ QCD:", irmaaTotal1);

  // back to taxes, zero the QCD, recheck IRMAA
  await clickTab("taxes");
  const qcdSlider2 = [...document.querySelectorAll('input[type="range"]')].find(i => Number(i.max) === 222000);
  await setRange(qcdSlider2, 0);
  await clickTab("irmaa");
  const irmaaTotal0 = grab(/LIFETIME IRMAA SURCHARGES\$?([\d,K.]+)/);
  console.log("lifetime IRMAA w/o QCD:", irmaaTotal0, "(QCD run should be ≤ this)");

  // ── Roth tab pointer ──
  await clickTab("roth");
  console.log("Roth-tab QCD pointer shown:", /Looking for QCDs/.test(document.body.textContent.replace(/\s+/g, " ")) || /QCDs.*Taxes.*tab/.test(document.body.textContent));

  console.log("runtime errors:", errors.length ? errors : "none");
  process.exit(0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
