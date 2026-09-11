// probe_ai_route.mjs — Phase 1 (v5.69) T3: where does an Ask AI request go on a SELF-HOSTED origin?
// A PROBE, not a suite: lives in qa/tools/, counted in no release total, exits 0 whatever it observes.
//
// usage (from a run folder's qa/, after qa/mk_runfolder.sh):
//   node tools/probe_ai_route.mjs <tag> nokey   # no saved API key, no local model — the GitHub Pages default
//   node tools/probe_ai_route.mjs <tag> key     # CONTROL: a saved key; the request must reach api.anthropic.com with x-api-key
//
// Two things make this a self-hosted run rather than the claude.ai branch the shared harness takes by default:
//   1. The page URL is reconfigured to https://stextor.github.io/danger-close/ and `location` is exposed to the
//      NODE scope the bundle runs in. Without that, `typeof location === "undefined"` and IS_CLAUDE_ARTIFACT fails
//      CLOSED to true — every DOM suite therefore runs as the claude.ai artifact, never as the live site.
//   2. src/main.jsx's fetch wrapper (L52-69 at v5.69) is TRANSCRIBED VERBATIM below over a recording stub, because the
//      DOM bundle is built from the component, not from main.jsx. The recording stub answers 405, as a static host would.
// Nothing leaves this machine: the stub never performs a network request.
import { window, dom } from "../env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const [VER, MODE] = process.argv.slice(2);
if (!VER || !["nokey", "key"].includes(MODE)) { console.log("usage: <tag> nokey|key"); process.exit(2); }

dom.reconfigure({ url: "https://stextor.github.io/danger-close/" });
globalThis.location = window.location;

const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
if (MODE === "key") window.localStorage.setItem(PREFIX + "danger_close:api_key_v1", "sk-ant-PROBE-00000000");

// ── recording stub (never touches the network) ──
const calls = [];
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  const h = (init && init.headers) || {};
  const b = init && init.body ? String(init.body) : "";
  calls.push({ requested: url, resolved: new URL(url, window.location.href).href, headerNames: Object.keys(h),
    bodyChars: b.length, bodyCarriesHouseholdName: b.includes("Spouse A"), bodyCarriesSystemPrompt: b.includes('"system"') });
  return { ok: false, status: 405, statusText: "Method Not Allowed", headers: { get: () => null }, json: async () => ({ error: { message: "405 Not Allowed" } }), text: async () => "405 Not Allowed" };
};
// ── src/main.jsx L52-69, verbatim (only `window.fetch.bind(window)` replaced by the recorder) ──
const _fetch = recorder;
const wrapped = (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  if (
    url &&
    url.startsWith("https://api.anthropic.com") &&
    location.protocol.startsWith("http")
  ) {
    const headers = (init && init.headers) || {};
    const hasKey = Object.keys(headers).some(
      (h) => h.toLowerCase() === "x-api-key"
    );
    if (!hasKey) {
      return _fetch(url.replace("https://api.anthropic.com", "/anthropic"), init);
    }
  }
  return _fetch(input, init);
};
window.fetch = wrapped; globalThis.fetch = wrapped;

console.error = () => {}; console.warn = () => {};
require(`../dom_${VER}.cjs`);
const React = require("react");
const body = () => window.document.body;
const text = () => body().textContent || "";
const el = window.document.createElement("div"); body().appendChild(el);
const { root, act, DangerClose } = window.__mount(el);
const safe = async (fn) => { try { await fn(); } catch (e) {} };
const wait = async (ms) => safe(() => act(async () => { await new Promise(r => setTimeout(r, ms)); }));
const click = async (x) => { if (!x) return false; await safe(() => act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); })); await wait(40); return true; };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);

console.log(`probe_ai_route — build ${VER} — mode ${MODE} — page ${window.location.href}`);
await safe(() => act(async () => { root.render(React.createElement(DangerClose)); }));
await wait(80);
const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
await click(example); await wait(200);
const aiTab = tabBtn("ask AI");
console.log(`  self-hosted branch taken (key field present on Ask AI): ${await click(aiTab) && /api key/i.test(text())}`);
const snippets = []; { const t = text(); const re = /api key/gi; let m; while ((m = re.exec(t)) && snippets.length < 3) snippets.push(t.slice(Math.max(0, m.index - 90), m.index + 110).replace(/\s+/g, " ")); }
console.log(`  Ask AI copy near "API key": ${JSON.stringify(snippets)}`);
// ⚠ FIXED after the first run: the FIRST button.ai-btn is "📎 ATTACH FILE", not Send — both modes made zero
//   requests and the KEY-mode control did not fire, which is how the selector error was found (§B2).
const aiBtns = [...body().querySelectorAll("button.ai-btn")];
console.log(`  ai-btn buttons: ${JSON.stringify(aiBtns.map(b => b.textContent.trim()))}`);
const sendBtn = aiBtns.find(b => !/attach/i.test(b.textContent || ""));
const fields = [...body().querySelectorAll("textarea, input[type=text], input:not([type])")]
  .filter(x => !/key|sk-ant|http|model|url/i.test(`${x.placeholder || ""} ${x.id || ""}`))
  .filter(x => sendBtn && (x.compareDocumentPosition(sendBtn) & window.Node.DOCUMENT_POSITION_FOLLOWING));
const q = fields.pop() || null;
console.log(`  send button: ${JSON.stringify(sendBtn && sendBtn.textContent.trim())} · query field: ${q ? q.tagName + " placeholder=" + JSON.stringify((q.placeholder || "").slice(0, 60)) : "NOT FOUND"}`);
if (q) await safe(() => act(async () => {
  const proto = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(q), "value");
  proto.set.call(q, "How does my plan look?");
  q.dispatchEvent(new window.Event("input", { bubbles: true }));
}));
let attempts = 0;
// ⚠ FIXED after the second run: typing once, before the tab settled, never reached React state (Send stayed
//   disabled in BOTH modes, so the key-mode control still did not fire). The field and the button are
//   re-found and re-typed on every attempt, in case a re-render replaced them.
for (; attempts < 25 && calls.length === 0; attempts++) {
  const ta = body().querySelector("textarea.ai-in");
  if (ta && !ta.value) await safe(() => act(async () => {
    const d = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
    d.set.call(ta, "How does my plan look?");
    ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  }));
  await wait(60);
  const b = [...body().querySelectorAll("button.ai-btn")].find(x => /EXECUTE/i.test(x.textContent || ""));
  if (b && !b.disabled) await click(b);
  else if (ta && attempts > 2) await safe(() => act(async () => { ta.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); }));
  await wait(1500);
}
{ const ta = body().querySelector("textarea.ai-in"); const b = [...body().querySelectorAll("button.ai-btn")].find(x => /EXECUTE/i.test(x.textContent || "")); console.log(`  at end: textarea value=${JSON.stringify(ta && ta.value)} · EXECUTE disabled=${b ? b.disabled : "n/a"}`); }
console.log(`  send attempts until a request was made: ${attempts}`);
console.log(`  requests made: ${calls.length}`);
calls.forEach((c, i) => console.log(`   #${i + 1} requested=${c.requested}\n       resolved=${c.resolved}\n       headers=${JSON.stringify(c.headerNames)} bodyChars=${c.bodyChars} carriesHouseholdName=${c.bodyCarriesHouseholdName} carriesSystemPrompt=${c.bodyCarriesSystemPrompt}`));
await wait(600);
const errShown = /405|not allowed|error|failed/i.exec(text().slice(-4000));
console.log(`  what the user sees afterwards (tail match): ${JSON.stringify(errShown && text().slice(-4000).slice(Math.max(0, errShown.index - 80), errShown.index + 100).replace(/\s+/g, " "))}`);
process.exit(0);
