// probe_mydata_draft.mjs — runtime reproduction of Phase 1 (v5.69) finding A-3: the My Data draft
// autosave never saves. A PROBE, not a suite: it lives in qa/tools/, asserts nothing that counts
// toward any release total, and exits 0 whatever it observes. Its job is to PRINT what happens.
//
// usage (from a run folder's qa/ directory, after qa/mk_runfolder.sh):
//   node tools/probe_mydata_draft.mjs <tag> contract   # the storage contract main.jsx installs (verbatim t5 shim)
//   node tools/probe_mydata_draft.mjs <tag> traced     # same contract, wrapped in a read-only Proxy that LOGS
//                                                      # every property the app looks up on window.storage
//   node tools/probe_mydata_draft.mjs <tag> control    # POSITIVE CONTROL: a scratch copy of the shim that ALSO
//                                                      # has sync getItem/setItem/removeItem (OPERATIONS §B2)
//
// ⚠ The control shim exists ONLY in this file. Never add getItem/setItem/removeItem to a real suite
//   shim (t5, t6) or to src/main.jsx: doing so makes the suite agree with the defect and masks it.
//
// Flow, identical in every mode: fresh boot → example data → My Data → Save & Apply (so a remount
// reopens the plan rather than the landing screen) → edit one field → wait past the 2 s debounce →
// read storage → leave via DISCARD & LEAVE (the dialog that promises the draft survives) → unmount,
// remount, open My Data → is the recovery banner there? → control only: RESTORE & APPLY DRAFT.
import { window } from "../env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const MODE = process.argv[3];
if (!VER || !["contract", "traced", "control"].includes(MODE)) {
  console.log("usage: node tools/probe_mydata_draft.mjs <tag> contract|traced|control"); process.exit(2);
}

// ── the storage contract, verbatim from qa/qa-baseline/t5_storage.mjs (== src/main.jsx L15-43) ──
const PREFIX = "dc:";
const contract = {
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

const lookups = []; // traced mode: every property name the app reads off window.storage, with a timestamp
const t0 = Date.now();
if (MODE === "contract") {
  window.storage = contract;
} else if (MODE === "traced") {
  window.storage = new Proxy(contract, {
    get(target, prop) {
      if (typeof prop === "string") lookups.push({ prop, ms: Date.now() - t0, present: prop in target });
      return target[prop];
    },
  });
} else {
  // POSITIVE CONTROL — scratch shim only. Sync, null on a missing key: the shape the draft code assumes.
  window.storage = Object.assign({}, contract, {
    getItem(key) { return window.localStorage.getItem(PREFIX + key); },
    setItem(key, value) { window.localStorage.setItem(PREFIX + key, value); },
    removeItem(key) { window.localStorage.removeItem(PREFIX + key); },
  });
}

// Blob capture, as t5 does, so nothing in the export path throws if touched.
const grab = (b) => { window.__lastBlob = b; return "blob:probe"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};

require(`../dom_${VER}.cjs`);
const React = require("react");
const G = window.__g;
const DRAFT = "danger_close:mydata_draft_v1";

const body = () => window.document.body;
const text = () => body().textContent || "";
const mountFresh = () => { const el = window.document.createElement("div"); body().appendChild(el); return { ...window.__mount(el), el }; };
let { root, act, DangerClose } = mountFresh();
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); };
const click = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
const btn = (re) => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
const rawKeys = () => { const ks = []; for (let i = 0; i < window.localStorage.length; i++) ks.push(window.localStorage.key(i)); return ks; };
const draftRaw = () => window.localStorage.getItem(PREFIX + DRAFT);
const out = (label, v) => console.log(`  ${label.padEnd(58)} ${v}`);

console.log(`probe_mydata_draft — build ${VER} — mode ${MODE}`);

// 1 · boot → example → My Data → Save & Apply
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush();
const example = [...body().querySelectorAll("button, div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
if (!example) { console.log("  SETUP FAILED: no 'use example data' control"); process.exit(1); }
await click(example); await flush(); await flush();
await click(tabBtn("my data")); await flush();
await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush();
out("plan persisted (dc:danger_close:portfolio_v1 present)", rawKeys().includes(PREFIX + "danger_close:portfolio_v1"));
const planBefore = JSON.stringify(G.PORTFOLIO());

// 2 · edit one field (t4's GUARD pattern: first non-empty input, value + "1")
const inputs = () => [...body().querySelectorAll("input")];
const idx = inputs().findIndex(i => i.value !== "");
const field = inputs()[idx];
const before = field.value;
await act(async () => {
  const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
  proto.set.call(field, String(field.value) + "1");
  field.dispatchEvent(new window.Event("input", { bubbles: true }));
});
await flush();
out(`edited input #${idx}`, `${JSON.stringify(before)} -> ${JSON.stringify(inputs()[idx].value)}`);
out("dirty chip shown", text().includes("Unsaved changes"));
out("chip promises 'a draft auto-saves every few seconds'", text().includes("a draft auto-saves every few seconds"));

// 3 · wait past the 2 s debounce, then read storage
const lookupsBeforeWait = lookups.length;
await act(async () => { await new Promise(r => setTimeout(r, 2600)); });
await flush();
out("waited (ms, real timers)", 2600);
out(`draft key ${PREFIX}${DRAFT} present after wait`, draftRaw() !== null);
if (draftRaw() !== null) {
  let d = null; try { d = JSON.parse(draftRaw()); } catch {}
  out("  draft parses, carries ts + portfolio + expenses", !!(d && d.ts && d.portfolio && d.expenses));
  out("  draft carries the edited value", JSON.stringify(d && d.portfolio).includes(JSON.stringify(inputs()[idx].value).slice(1, -1)));
}
out("all dc: keys now", rawKeys().filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length).replace("danger_close:", "")).join(", "));
if (MODE === "traced") {
  const during = lookups.slice(lookupsBeforeWait).filter(l => !["get", "set", "delete", "list"].includes(l.prop));
  out("non-contract lookups during the wait", during.map(l => `${l.prop}@${l.ms}ms(present=${l.present})`).join(", ") || "none");
}

// 4 · leave through the dialog that promises the draft survives, and discard
await click(tabBtn("dashboard"));
out("leave dialog shown", text().includes("You have unsaved edits in My Data"));
out("dialog promises 'Discarding keeps the auto-saved draft'", text().includes("Discarding keeps the auto-saved draft"));
const discard = [...body().querySelectorAll("button")].find(b => b.textContent.trim() === "DISCARD & LEAVE");
await click(discard);
out("draft key present after DISCARD & LEAVE", draftRaw() !== null);

// 5 · the next visit: unmount, remount, open My Data
await act(async () => { root.unmount(); });
({ root, act, DangerClose } = mountFresh());
await act(async () => { root.render(React.createElement(DangerClose)); });
await flush(); await flush(); await flush();
const t = tabBtn("my data");
out("remount reopened the plan (tab strip present)", !!t);
if (t) { await click(t); await flush(); }
const banner = text().includes("Unsaved work from a previous session was recovered");
out("RECOVERY BANNER shown on the next visit", banner);
out("edited field on the next visit", JSON.stringify(inputs()[idx] && inputs()[idx].value));

// 6 · control only: restore it
if (banner) {
  await click(btn(/RESTORE\s*&\s*APPLY DRAFT/)); await flush(); await flush();
  const tab2 = tabBtn("my data"); if (tab2) { await click(tab2); await flush(); }
  out("after RESTORE & APPLY DRAFT, edited field reads", JSON.stringify(inputs()[idx] && inputs()[idx].value));
  out("after restore, plan differs from the pre-edit plan", JSON.stringify(G.PORTFOLIO()) !== planBefore);
  out("after restore, draft key removed", draftRaw() === null);
  out("after restore, banner gone", !text().includes("Unsaved work from a previous session was recovered"));
}
if (MODE === "traced") {
  const all = [...new Set(lookups.filter(l => !l.present).map(l => l.prop))];
  out("every property looked up that the contract LACKS", all.join(", ") || "none");
}
process.exit(0);
