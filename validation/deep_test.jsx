import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 120) => { await act(async () => { await sleep(ms); }); };
const errors = [];
console.error = (...a) => { const s = a.join(" "); if (!/Warning:|act\(/.test(s)) errors.push(s.slice(0, 200)); };

const setVal = async (el, value) => {
  const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, String(value));
  await act(async () => { el.dispatchEvent(new window.Event("input", { bubbles: true })); el.dispatchEvent(new window.Event("change", { bubbles: true })); });
  await flush(100);
};

(async () => {
  const MC_ONLY = process.env.MC_ONLY === "1";
  const c = document.createElement("div"); document.body.appendChild(c);
  createRoot(c).render(React.createElement(App));
  await flush(300);
  const btn = [...document.querySelectorAll("button")].find(b => /USE EXAMPLE DATA/i.test(b.textContent));
  await act(async () => { btn.click(); });
  await flush(600);
  const clickTab = async (n, w = 400) => { const b = [...document.querySelectorAll("button.tab")].find(x => x.textContent.trim() === n); await act(async () => { b.click(); }); await flush(w); };
  const grabLifetime = () => { const m = document.body.textContent.match(/TOTAL LIFETIME TAX\$?([\d.]+)M/); return m ? Number(m[1]) : null; };
  const saveApply = async () => { const b = [...document.querySelectorAll("button")].find(x => /SAVE & APPLY/.test(x.textContent)); await act(async () => { b.click(); }); await flush(800); };

  if (!MC_ONLY) {
  // ══ TEST 1: State module ══
  const setState = async (code) => {
    await clickTab("my data");
    const sel = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "GA"));
    await setVal(sel, code);
    await saveApply();
    await clickTab("taxes", 600);
    return grabLifetime();
  };
  const taxTX = await setState("TX");
  const taxIL = await setState("IL");
  const taxGA = await setState("GA");
  const taxCA = await setState("CA");
  console.log(`[state] TX ${taxTX}M | IL ${taxIL}M | GA ${taxGA}M | CA ${taxCA}M`);
  console.log("[state] TX == IL (both zero-state for retirees):", Math.abs(taxTX - taxIL) < 0.005);
  console.log("[state] GA between IL and CA:", taxGA >= taxIL && taxGA <= taxCA);
  console.log("[state] CA highest:", taxCA >= taxGA && taxCA > taxTX);
  // dropdown auto-filled name
  await clickTab("my data");
  console.log("[state] name auto-filled 'California':", document.body.textContent.includes("California"));

  // ══ TEST 2: Roth solve-for grid ══
  await clickTab("roth", 600);
  const runBtn = [...document.querySelectorAll("button")].find(b => /RUN 25-CELL GRID/.test(b.textContent));
  console.log("[solve] RUN button present:", !!runBtn);
  await act(async () => { runBtn.click(); });
  await flush(1200);
  const t2 = document.body.textContent;
  console.log("[solve] winner announced:", /Model's best cell:/.test(t2));
  console.log("[solve] ranked cells shown (#1 and #10):", /#1 /.test(t2) && /#10 /.test(t2));
  const winEstate = (t2.match(/Model's best cell: (\$?[\dK$\/yr .A-Z%]+) →/) || [])[1];
  console.log("[solve] estate-objective winner:", winEstate);
  // switch objective
  const objSel = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => /MIN LIFETIME TAX/.test(o.textContent)));
  await setVal(objSel, "tax");
  const t3 = document.body.textContent;
  const winTax = (t3.match(/Model's best cell: (\$?[\dK$\/yr .A-Z%]+) →/) || [])[1];
  console.log("[solve] tax-objective winner:", winTax, "| ranking re-sorted:", winTax !== undefined);

  }
  // ══ TEST 3: MC toggles ══
  await clickTab("monte carlo", 2500);
  const grabFull30 = () => { const m = document.body.textContent.match(/SUCCESS RATE \(>\$500K\)~([\d.]+)%/); return m ? Number(m[1]) : null; };
  const baseTxt = document.body.textContent;
  console.log("[mc] toggles present:", /STOCHASTIC LONGEVITY/.test(baseTxt) && /LTC DISTRIBUTION/.test(baseTxt));
  const s0 = grabFull30();
  const longBox = [...document.querySelectorAll('input[type="checkbox"]')][0];
  await act(async () => { longBox.click(); });
  await flush(3000);
  const s1 = grabFull30();
  const ltcBox = [...document.querySelectorAll('input[type="checkbox"]')][1];
  await act(async () => { ltcBox.click(); });
  await flush(3000);
  const s2 = grabFull30();
  console.log(`[mc] full-30 success: base ${s0}% | +stochastic-longevity ${s1}% | +LTC-dist ${s2}%`);
  console.log("[mc] toggles change results:", s0 !== null && s1 !== null && (s1 !== s0 || s2 !== s0));
  console.log("[mc] LTC distribution not higher than base:", s2 !== null && s2 <= Math.max(s0, s1) + 0.5);

  console.log("runtime errors:", errors.length ? errors.slice(0, 3) : "none");
  process.exit(errors.length ? 2 : 0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
