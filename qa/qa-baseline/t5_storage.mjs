// t5 — PERSISTENCE & STORAGE CONTRACT (baseline rebuild, 2026-08).
// Run: node t5_storage.mjs v592 | node t5_storage.mjs v510
// Exercises the full lifecycle against a localStorage-backed window.storage shim
// (the same contract main.jsx installs in the standalone build): fresh boot →
// landing; save → persisted; remount → cached plan reopens without the landing
// screen; backup export NEVER contains the API key; Simple Mode and Offline Mode
// persist; Clear All Data wipes everything including credentials.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2] || "v510";
const IS510 = VER !== "v592"; // v5.10-family features (v510 and v5101)
const IS5101 = VER === "v5101";

// ── window.storage shim: localStorage-backed, artifact API contract ──
const PREFIX = "dc:";
window.storage = {
  async get(key) {
    const v = window.localStorage.getItem(PREFIX + key);
    if (v === null) throw new Error("key not found: " + key);
    return { key, value: v };
  },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length));
    }
    return { keys };
  },
};
const storedKeys = () => {
  const ks = [];
  for (let i = 0; i < window.localStorage.length; i++) ks.push(window.localStorage.key(i));
  return ks.filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length));
};

// ── Blob capture for the backup export ──
// The CJS bundle runs in Node scope, so bare `URL` resolves to Node's global URL —
// stub BOTH, or the export handler throws before the blob is captured.
const grab = (b) => { window.__lastBlob = b; return "blob:t5"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};

require(`./dom_${VER}.cjs`);
const React = require("react");
const K = (s) => `danger_close:${s}`;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + String(detail).slice(0, 160) : ""}`); }
};
const body = () => window.document.body;
const mountFresh = () => {
  const el = window.document.createElement("div");
  body().appendChild(el);
  return { ...window.__mount(el), el };
};
const mk = mountFresh();
let { root, act, DangerClose } = mk;
const flush = async (a = act) => { await a(async () => { await new Promise(r => setTimeout(r, 40)); }); };
const click = async (el, a = act) => { await a(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(a); };
const btn = (re) => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);

console.log(`t5 — PERSISTENCE & STORAGE (${VER})`);

// ═══ Phase A — fresh storage boots to the landing screen ═══
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
{
  const t = body().textContent || "";
  T("A: fresh storage → landing screen", /use example data/i.test(t) && /start fresh/i.test(t));
  T("A: no plan keys in storage yet", !storedKeys().includes(K("portfolio_v1")));
}

// ═══ Phase B — load example, save, persist toggles, export ═══
const example = [...body().querySelectorAll("button, div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
await click(example); await flush(); await flush();
{
  T("B: app shell up after example load", [...body().querySelectorAll("button.tab")].length === 26);
}
// Seed a fake API key the way the BYOK panel would, then prove exports exclude it.
await window.storage.set(K("api_key_v1"), "sk-ant-TESTSECRET-t5-000000000000");
// Save & Apply from My Data → plan lands in storage.
await click(tabBtn("my data")); await flush();
const save = btn(/SAVE\s*&\s*APPLY/);
T("B: Save & Apply button present", !!save);
await click(save); await flush(); await flush();
{
  T("B: portfolio persisted on save", storedKeys().includes(K("portfolio_v1")), storedKeys().join(","));
  T("B: expenses persisted on save", storedKeys().includes(K("expenses_v1")));
  const p = JSON.parse(window.localStorage.getItem(PREFIX + K("portfolio_v1")));
  T("B: persisted portfolio carries positions", Array.isArray(p.positions) && p.positions.length > 0);
  if (IS510) {
    const c = p.contributions || {};
    T("B (V510): persisted plan carries the four split fields", ["contribPreTaxA", "contribRothA", "contribPreTaxB", "contribRothB"].every(k => typeof c[k] === "number"), JSON.stringify(c));
    T("B (V510): mirrors persisted consistent with splits", c.monthly401k === c.contribPreTaxA + c.contribRothA && c.spouseBMonthly === c.contribPreTaxB + c.contribRothB);
  }
}
// Export backup → captured blob must contain the plan and must NOT contain the key.
window.__lastBlob = null;
const exp = btn(/EXPORT BACKUP/);
T("B: Export Backup button present", !!exp);
await click(exp); await flush();
{
  T("B: export produced a file", !!window.__lastBlob);
  if (window.__lastBlob) {
    const txt = await window.__lastBlob.text();
    let parsed = null; try { parsed = JSON.parse(txt); } catch {}
    T("B: backup is valid JSON", !!parsed);
    T("B: backup carries the portfolio", !!(parsed && (parsed.portfolio || parsed.positions)));
    T("B: backup NEVER contains the API key", !txt.includes("sk-ant-TESTSECRET"), "credential leaked into backup!");
    T("B: backup carries no storage key names for credentials", !txt.includes("api_key_v1"));
  }
}
// Simple Mode toggle → persists.
const fewer = btn(/SHOW FEWER TABS/);
await click(fewer); await flush();
T("B: simple-mode flag persisted", storedKeys().includes(K("simple_v1")));
T("B: six core tabs after toggle", [...body().querySelectorAll("button.tab")].length === 6);

// ═══ Phase C — remount: cached plan reopens, simple mode remembered ═══
await act(async () => { root.unmount(); });
({ root, act, DangerClose } = mountFresh());
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(act); await flush(act); await flush(act);
{
  const t = body().textContent || "";
  T("C: remount skips the landing screen (cached plan)", !/start fresh/i.test(t) || [...body().querySelectorAll("button.tab")].length > 0);
  const n = [...body().querySelectorAll("button.tab")].length;
  T("C: simple mode remembered across sessions", n === 6, String(n));
  const all = btn(/SHOW ALL TABS/);
  if (all) await click(all, act);
  T("C: full strip restorable", [...body().querySelectorAll("button.tab")].length === 26);
}

// ═══ Phase D — Clear All Data wipes plan AND credentials, returns to landing ═══
await click(tabBtn("my data"), act); await flush(act);
const clear = btn(/CLEAR ALL DATA/);
T("D: Clear All Data present", !!clear);
await click(clear, act); await flush(act);
{
  const t = body().textContent || "";
  T("D: in-UI confirmation dialog appears", t.includes("DELETE YOUR ENTIRE PLAN?") && t.includes("THIS CANNOT BE UNDONE"));
}
const yes = btn(/Yes, delete everything/);
T("D: explicit confirm button present", !!yes);
await click(yes, act); await flush(act); await flush(act);
{
  const ks0 = storedKeys();
  if (IS5101) {
    // ── FIXED in v5.10.1: performClearAll hands the wipe to a top-level handler that
    // awaits clearStorage() — every plan key AND the API key are DELETED (not blanked),
    // and the app returns to the landing screen, matching Docs §10/§11. Prior legs
    // keep the dated pins below as frozen history (found 2026-08-06; fixed v5.10.1). ──
    T("D: Clear All Data deletes the plan (portfolio key gone)", !ks0.includes(K("portfolio_v1")), ks0.join(","));
    T("D: Clear All Data deletes the expenses key", !ks0.includes(K("expenses_v1")));
  } else {
  // ── ACTUAL contract: Clear All Data OVERWRITES with a blank plan (onApply(blank)),
  // it does not delete storage keys or return to the landing screen. ──
  const p = JSON.parse(window.localStorage.getItem(PREFIX + K("portfolio_v1")) || "{}");
  T("D: plan content blanked (positions emptied)", Array.isArray(p.positions) && p.positions.length === 0, JSON.stringify(p.positions || null).slice(0, 60));
  T("D: household zeroed (name normalizes to placeholder)", (p.household || 0) === 0 && ["", "Spouse A"].includes(p.nameA || ""), `household=${p.household} nameA=${JSON.stringify(p.nameA)}`);
  }
  // ── KNOWN DEFECT PIN #2 (pre-existing; v5.9.2 and v5.10 identically) ──
  // Docs §10 promises: "the app's own Clear All Data all wipe the key (Clear All Data does
  // so deliberately)" and clearStorage() implements exactly that ("credentials never
  // survive a wipe") — but the CLEAR ALL DATA button's handler (performClearAll) never
  // calls clearStorage(); it only overwrites the plan. The API key therefore SURVIVES
  // "delete everything" — on a shared machine, the credential the user believes wiped is
  // still in browser storage. Docs §11's "returns you to the landing screen" is also not
  // what happens (a blank plan remains cached, so remounts skip the landing screen).
  // Found 2026-08-06 by this suite. These pins document today's behavior; flip them when
  // performClearAll is fixed to await clearStorage().
  const ks = storedKeys();
  if (IS5101) {
    T("D: Clear All Data wipes the API key", !ks.includes(K("api_key_v1")), ks.join(","));
    T("D: Clear All Data returns to the landing screen",
      /start fresh/i.test((body().textContent || "")) && [...body().querySelectorAll("button.tab")].length === 0,
      `tabs=${[...body().querySelectorAll("button.tab")].length}`);
  } else {
  T("D [KNOWN DEFECT]: API key SURVIVES Clear All Data (docs promise a wipe — fixed in v5.10.1; pre-fix state pinned here)", ks.includes(K("api_key_v1")), ks.join(","));
  T("D [KNOWN DEFECT]: no return to landing screen (blank plan stays cached — fixed in v5.10.1; pre-fix state pinned here)", !/start fresh/i.test((body().textContent || "")) || [...body().querySelectorAll("button.tab")].length > 0);
  }
}

console.log(`\nt5 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
