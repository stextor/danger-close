import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import App from "../src/DangerClose.jsx";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const flush = async (ms = 80) => { await act(async () => { await sleep(ms); }); };
console.error = () => {};

const setVal = async (input, value) => {
  const proto = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(input, String(value));
  await act(async () => { input.dispatchEvent(new window.Event("input", { bubbles: true })); input.dispatchEvent(new window.Event("change", { bubbles: true })); });
  await flush(100);
};

// Capture outgoing AI calls instead of hitting the network
const captured = [];
const fetchStub = async (url, init) => {
  captured.push({ url, headers: (init && init.headers) || {} });
  return { ok: true, json: async () => ({ content: [{ type: "text", text: "stub response" }] }) };
};
window.fetch = fetchStub;
globalThis.fetch = fetchStub;

(async () => {
  const mode = process.env.TEST_MODE === "file" ? "selfhosted" : (process.env.TEST_MODE || "selfhosted");
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

  // Run MC first so askAI has simData
  await clickTab("monte carlo");
  await flush(3500);
  await clickTab("ask AI");

  const body = document.body.textContent;
  const panelShown = /LOCAL API KEY/.test(body);
  console.log(`[${mode}] key panel visible:`, panelShown);

  if (mode === "selfhosted") {
    // Save a key
    const keyInput = [...document.querySelectorAll('input[type="password"]')][0];
    console.log("[selfhosted] password input present:", !!keyInput);
    await setVal(keyInput, "sk-ant-test-key-abcd1234");
    const saveBtn = [...document.querySelectorAll("button")].find(b => /SAVE KEY/.test(b.textContent));
    await act(async () => { saveBtn.click(); });
    await flush(200);
    const masked = /sk-ant-••••••••1234/.test(document.body.textContent);
    const forgetShown = [...document.querySelectorAll("button")].some(b => /FORGET KEY/.test(b.textContent));
    console.log("[selfhosted] key saved+masked:", masked, "| forget button:", forgetShown);
    // persisted?
    const stored = await window.storage.get("danger_close:api_key_v1").catch(() => null);
    console.log("[selfhosted] key in storage:", !!(stored && stored.value));
    // Fire an AI query
    const ta = document.querySelector("textarea.ai-in");
    await setVal(ta, "test question");
    const exec = [...document.querySelectorAll("button")].find(b => /EXECUTE/.test(b.textContent));
    await act(async () => { exec.click(); });
    await flush(400);
    const call = captured.find(c => String(c.url).includes("api.anthropic.com"));
    console.log("[selfhosted] AI call captured:", !!call);
    console.log("[selfhosted] x-api-key attached:", call ? call.headers["x-api-key"] === "sk-ant-test-key-abcd1234" : false);
    console.log("[selfhosted] dangerous-direct-browser-access header:", call ? call.headers["anthropic-dangerous-direct-browser-access"] === "true" : false);
    // Export backup must not contain the key: intercept the payload builder via EXPORT button? Simpler textual check:
    // Forget the key
    const forget = [...document.querySelectorAll("button")].find(b => /FORGET KEY/.test(b.textContent));
    await act(async () => { forget.click(); });
    await flush(200);
    const gone = await window.storage.get("danger_close:api_key_v1").then(r => false).catch(() => true);
    console.log("[selfhosted] forget removes from storage:", gone, "| panel back to input:", !!document.querySelector('input[type="password"]'));
  } else {
    // artifact mode: panel must be absent, and a query must carry NO key header
    const ta = document.querySelector("textarea.ai-in");
    await setVal(ta, "test question");
    const exec = [...document.querySelectorAll("button")].find(b => /EXECUTE/.test(b.textContent));
    await act(async () => { exec.click(); });
    await flush(400);
    const call = captured.find(c => String(c.url).includes("api.anthropic.com"));
    console.log("[artifact] AI call captured:", !!call);
    console.log("[artifact] x-api-key ABSENT:", call ? !("x-api-key" in call.headers) : false);
    console.log("[artifact] dangerous header ABSENT:", call ? !("anthropic-dangerous-direct-browser-access" in call.headers) : false);
  }
  process.exit(0);
})().catch(e => { console.log("CRASH:", e && e.stack || e); process.exit(3); });
