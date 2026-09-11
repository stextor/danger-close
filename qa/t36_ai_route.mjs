// t36 — ASK AI ROUTES (SCOPE_B3_KEYLESS_AI_ROUTE, added v5.70). Runs on BOTH legs.
//   node t36_ai_route.mjs v570              self-hosted cases, then spawns the claude.ai-branch case as a child
//   node t36_ai_route.mjs v570 --artifact   (the child) the claude.ai branch only; prints ONE JSON line, no tally
//
// WHAT IT PINS. Through v5.69, on a self-hosted copy (the live site) with neither a saved API key nor a Local Model, Ask AI
// sent the full plan context as a KEYLESS request to api.anthropic.com, which src/main.jsx then rewrote to the page's own
// host. v5.70 refuses before anything is built or sent. This suite tests the APP's side (no main.jsx here);
// qa/smoke_built.mjs checks the built artifact, where the real bootstrap is present.
//
// ⚠ HARNESS TRAP, and why the self-hosted guard below exists. The shared jsdom environment exposes no `location` to the
//   Node scope the bundle runs in, so IS_CLAUDE_ARTIFACT fails CLOSED to true and every other DOM suite runs the claude.ai
//   branch. Without the reconfigure + global below, R-1 would pass VACUOUSLY on the wrong branch. Each self-hosted case
//   therefore asserts the LOCAL API KEY panel is on screen, and the child asserts it is not.
//
// Every request is answered by a recording stub. Nothing touches the network.
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const ARTIFACT = process.argv.includes("--artifact");
const KNOWN_VERSIONS = ["v569", "v570"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log(`    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST_FIX = VER === "v570"; // B-3 fixed at v5.70

if (!ARTIFACT) {
  dom.reconfigure({ url: "https://stextor.github.io/danger-close/" });
  globalThis.location = window.location;
}

// ── storage: the real contract (== src/main.jsx L15-43) ──
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};

// ── recording fetch: never touches the network ──
const calls = [];
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  const headers = Object.keys((init && init.headers) || {}).map(h => h.toLowerCase());
  calls.push({ url, headers });
  return { ok: false, status: 405, statusText: "Method Not Allowed", headers: { get: () => null }, json: async () => ({}), text: async () => "stub" };
};
window.fetch = recorder; globalThis.fetch = recorder;
console.error = () => {}; console.warn = () => {};

require(`./dom_${VER}.cjs`);
const React = require("react");
const G = window.__g;
const body = () => window.document.body;
const text = () => body().textContent || "";
const QUESTION = "How does my plan look?";
const NOTICE = "Nothing was sent — add your API key above, or set up a Local Model.";
const KEY_LABEL = "🔑 Add your API key to use Ask AI";

async function runCase(seed) {
  window.localStorage.clear();
  seed();
  calls.length = 0;
  const el = window.document.createElement("div"); body().appendChild(el);
  const { root, act, DangerClose } = window.__mount(el);
  const safe = async (fn) => { try { await fn(); } catch (e) {} };
  const wait = async (ms) => safe(() => act(async () => { await new Promise(r => setTimeout(r, ms)); }));
  const click = async (x) => { if (x) { await safe(() => act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); })); await wait(40); } };
  await safe(() => act(async () => { root.render(React.createElement(DangerClose)); }));
  await wait(80);
  await click([...el.querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  await wait(200);
  await click([...el.querySelectorAll("button.tab")].find(b => b.textContent.trim() === "ask AI"));
  const sendBtn = () => [...el.querySelectorAll("button.ai-btn")].find(b => !/attach/i.test(b.textContent || "") && !/clear/i.test(b.textContent || ""));
  const panel = /LOCAL API KEY/.test(el.textContent || "");
  const labelBefore = sendBtn() ? sendBtn().textContent.trim() : null;
  let attempts = 0, notice = false, offline = false;
  for (; attempts < 20 && calls.length === 0 && !notice && !offline; attempts++) {
    const ta = el.querySelector("textarea.ai-in");
    if (ta && !ta.value) await safe(() => act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(ta, QUESTION);
      ta.dispatchEvent(new window.Event("input", { bubbles: true }));
    }));
    await wait(60);
    const b = sendBtn();
    if (b && !b.disabled) await click(b);
    else if (ta) await safe(() => act(async () => { ta.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); }));
    await wait(1200);
    notice = (el.textContent || "").includes(NOTICE);
    offline = /OFFLINE MODE is ON — Ask AI is disabled/.test(el.textContent || "");
  }
  const b = sendBtn();
  const ta = el.querySelector("textarea.ai-in");
  const r = { panel, labelBefore, label: b ? b.textContent.trim() : null, disabled: b ? b.disabled : null, notice, offline,
    question: ta ? ta.value : null, attempts, calls: calls.map(c => ({ url: c.url, key: c.headers.includes("x-api-key") })) };
  await safe(() => act(async () => { root.unmount(); }));
  el.remove();
  return r;
}

// ── the child: claude.ai branch only ──
if (ARTIFACT) {
  const r = await runCase(() => {});
  console.log("T36CHILD " + JSON.stringify(r));
  process.exit(0);
}

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log(`  \u2717 ${name}${detail ? " — " + String(detail).slice(0, 220) : ""}`); } };
console.log(`t36 — ASK AI ROUTES (${VER})`);
const ANTHROPIC = "https://api.anthropic.com/v1/messages";

// R-1 · self-hosted, no key, no Local Model
{
  const r = await runCase(() => {});
  T("R-1: the self-hosted branch is really taken (LOCAL API KEY panel on screen)", r.panel, JSON.stringify(r));
  if (POST_FIX) {
    T("R-1: EXTINCT — no key and no Local Model: ZERO requests", r.calls.length === 0, JSON.stringify(r.calls));
    T("R-1: the refusal notice is shown (proves askAI ran — the zero is not vacuous)", r.notice, JSON.stringify(r));
    T("R-1: the typed question stays in the box", r.question === QUESTION, JSON.stringify(r.question));
    T("R-1: EXECUTE is disabled", r.disabled === true, JSON.stringify(r));
    T("R-1: and relabelled", r.label === KEY_LABEL, JSON.stringify(r.label));
  } else {
    // [PRE-FIX PIN v569 · 2026-09-11] The defect B-3 fixed: exactly one KEYLESS request to the Anthropic URL, which the
    // live site's bootstrap rewrote to its own host. This leg asserts the old truth on purpose (OPERATIONS §D).
    T("R-1 [PIN v569]: exactly one request", r.calls.length === 1, JSON.stringify(r.calls));
    T("R-1 [PIN v569]: to the Anthropic URL", r.calls[0] && r.calls[0].url === ANTHROPIC, JSON.stringify(r.calls));
    T("R-1 [PIN v569]: with NO key header", r.calls[0] && r.calls[0].key === false, JSON.stringify(r.calls));
    T("R-1 [PIN v569]: from an enabled EXECUTE", r.label === "▶ EXECUTE" && r.disabled === false, JSON.stringify(r));
  }
}
// R-2 · CONTROL: a saved key
{
  const r = await runCase(() => window.localStorage.setItem(PREFIX + "danger_close:api_key_v1", "sk-ant-T36-00000000"));
  T("R-2: the self-hosted branch is really taken", r.panel);
  T("R-2: a saved key → exactly one request", r.calls.length === 1, JSON.stringify(r.calls));
  T("R-2: to api.anthropic.com", r.calls[0] && r.calls[0].url === ANTHROPIC, JSON.stringify(r.calls));
  T("R-2: carrying x-api-key", r.calls[0] && r.calls[0].key === true, JSON.stringify(r.calls));
  T("R-2: from ▶ EXECUTE", r.labelBefore === "▶ EXECUTE", JSON.stringify(r.labelBefore));
}
// R-3 · CONTROL: a Local Model and no key
{
  const r = await runCase(() => window.localStorage.setItem(PREFIX + "danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "t36" })));
  T("R-3: the self-hosted branch is really taken", r.panel);
  T("R-3: a Local Model → exactly one request", r.calls.length === 1, JSON.stringify(r.calls));
  T("R-3: to the Local Model's /chat/completions", r.calls[0] && r.calls[0].url === "http://localhost:11434/v1/chat/completions", JSON.stringify(r.calls));
  T("R-3: with no key header", r.calls[0] && r.calls[0].key === false, JSON.stringify(r.calls));
}
// R-5 · offline mode (no key) — existing behaviour, pinned because it shares the refusal's shape
{
  const r = await runCase(() => window.localStorage.setItem(PREFIX + "danger_close:offline_v1", "1"));
  T("R-5: offline → ZERO requests", r.calls.length === 0, JSON.stringify(r.calls));
  T("R-5: the offline notice is shown (not vacuous)", r.offline, JSON.stringify(r));
  T("R-5: the button reads ✈ OFFLINE MODE ON", r.label === "✈ OFFLINE MODE ON", JSON.stringify(r.label));
}
// R-4 · CONTROL: the claude.ai branch, in a child with no `location`
{
  const here = fileURLToPath(import.meta.url);
  const out = spawnSync(process.execPath, [here, VER, "--artifact"], { cwd: new URL(".", import.meta.url).pathname, encoding: "utf8", timeout: 300000 });
  const line = (out.stdout || "").split("\n").find(l => l.startsWith("T36CHILD "));
  let r = null; try { r = JSON.parse(line.slice(9)); } catch {}
  T("R-4: the claude.ai-branch child ran and reported", !!r, (out.stderr || "").slice(-200));
  if (r) {
    T("R-4: the claude.ai branch shows NO key panel", r.panel === false, JSON.stringify(r));
    T("R-4: exactly one request", r.calls.length === 1, JSON.stringify(r.calls));
    T("R-4: to api.anthropic.com, without a key header (the platform signs it)", r.calls[0] && r.calls[0].url === ANTHROPIC && r.calls[0].key === false, JSON.stringify(r.calls));
    T("R-4: from ▶ EXECUTE — the key label never shows inside claude.ai", r.labelBefore === "▶ EXECUTE", JSON.stringify(r.labelBefore));
  }
}
// Field Manual §10 — the disclosure sentence (D-B3-3)
{
  const docs = G.DOCS_HTML();
  const has = docs.includes("With neither a key nor a Local Model set, Ask AI sends nothing.");
  // A disclosure assertion becomes a LOCK the day a release makes it false (OPERATIONS §B2): if a future release lets
  // Ask AI send without a key, this must be inverted, not left green.
  if (POST_FIX) T("FM: §10 states that with neither a key nor a Local Model, Ask AI sends nothing", has);
  else T("FM [PIN v569]: the sentence is absent", !has);
}

console.log(`t36 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
