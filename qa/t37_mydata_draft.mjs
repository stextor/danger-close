// t37 — MY DATA DRAFT AUTOSAVE + IMPORTED MASTER PROMPT (SCOPE_A3_DRAFT_AUTOSAVE, added v5.71).
// Runs on BOTH legs:  node t37_mydata_draft.mjs v570   |   node t37_mydata_draft.mjs v571
//
// WHAT IT PINS. Through v5.70 the My Data draft autosave HAD NEVER SAVED. The draft code called
// getItem/setItem/removeItem — synchronous methods the storage contract does not have; it exposes
// get/set/delete/list, all async, and `get` THROWS on a missing key. Every call raised a TypeError
// into an empty catch, so the feature was dead for five releases while the UI promised it in two
// places: the dirty chip ("a draft auto-saves every few seconds") and — the harmful one — the
// leave dialog, next to DISCARD & LEAVE, at the moment the user decides.
//
// ⚠ THE EXTINCTION INVARIANT OF THIS RELEASE IS GROUP WP, NOT THE WRITE. Fixing the write without
//   the wipe would ship a NEW privacy defect on top of a closed one: `clearStorage` deletes a
//   hand-enumerated list, the draft key was not in it, and a plan the user "permanently deleted"
//   would stay recoverable from the restore banner on a shared machine. That is the exact scenario
//   the v5.9.1 leak review was run to prevent. WP must fail on any build whose wipe path does not
//   cover the draft key. (t5's key-map loop covers the same ground from the storage side; this
//   group covers it from the USER's side — through the real Clear All Data button.)
//
// ⚠ restoreDraft, discardDraft and the recovery banner had NEVER EXECUTED on any build. Groups RS
//   and DS are the first tests these functions have ever had — unexercised code being switched on,
//   not repaired.
//
// ⚠ THE PRIOR LEG IS MEANT TO BE NOISY. On v570 the feature is dead, so the prior leg's job is to
//   PIN THE DEFECT, not to pass the fix's assertions. Gate per leg; never soften an assertion so
//   both legs go green (OPERATIONS §D).
//
// ⚠ NEVER add getItem/setItem/removeItem to this file's shim, to t5/t6, or to src/main.jsx. The
//   storage contract below is the REAL one (== src/main.jsx L19-43, verbatim as t5 and t36 use it).
//   Adding sync aliases would make the suite agree with the defect and mask it — which is how A-3
//   survived five releases. The fix is that the APP speaks the contract, not the reverse.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v570", "v571", "v572", "v573"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log(`    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST_FIX = VER === "v571" || VER === "v572" || VER === "v573"; // A-3 / A-6 fixed at v5.71 (v5.72 keeps both; it only moves the draft drop after a SUCCESSFUL import — t38 I-5)

// ── storage: the real contract (== src/main.jsx L19-43). Async; `get` REJECTS on a missing key. ──
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
// Blob capture, as t5 does, so nothing in the export path throws if it is touched.
const grab = (b) => { window.__lastBlob = b; return "blob:t37"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};

require(`./dom_${VER}.cjs`);
const React = require("react");
const G = window.__g;

const DRAFT = "danger_close:mydata_draft_v1";
const body = () => window.document.body;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log(`  \u2717 ${name}${detail ? " — " + String(detail).slice(0, 220) : ""}`); } };
console.log(`t37 — MY DATA DRAFT AUTOSAVE (${VER})`);

// ── driving helpers (the probe_mydata_draft.mjs flow, which reproduced the finding) ──
const draftRaw = () => window.localStorage.getItem(PREFIX + DRAFT);
const text = () => body().textContent || "";
const inputs = () => [...body().querySelectorAll("input")];
const btn = (re) => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const btnExact = (s) => [...body().querySelectorAll("button")].find(b => b.textContent.trim() === s);
// The dirty chip, read as an ELEMENT. Reading the whole page instead is wrong here: the My Data
// tab legitimately says "Your plan auto-saves privately in this browser" about the SAVED PLAN,
// which has nothing to do with the draft. A page-wide predicate for autosave wording matches that
// sentence and fails for the wrong reason. Innermost match, so the chip is read and not its
// container.
const chipText = () => {
  const hits = [...body().querySelectorAll("span, div")].filter(n => /Unsaved changes/.test(n.textContent || ""));
  if (!hits.length) return "";
  return hits.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length)[0].textContent || "";
};
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);

let root, act, DangerClose, el;
const mountFresh = () => { el = window.document.createElement("div"); body().appendChild(el); return window.__mount(el); };
const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const waitDebounce = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 2600)); }); } catch (e) {} await flush(); };

// Boot a fresh app: example data → My Data tab → Save & Apply (so a remount reopens the plan
// rather than the landing screen, which is the state a returning user is actually in).
async function boot() {
  window.localStorage.clear();
  ({ root, act, DangerClose } = mountFresh());
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush(); await flush();
  await click(tabBtn("my data")); await flush();
  await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush();
}
// Remount without clearing storage — "the next visit".
async function revisit() {
  try { await act(async () => { root.unmount(); }); } catch (e) {}
  ({ root, act, DangerClose } = mountFresh());
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush(); await flush();
  const t = tabBtn("my data"); if (t) { await click(t); await flush(); }
}
// Edit the first non-empty input (t4's GUARD pattern) and return {idx, before, after}.
async function editField() {
  const idx = inputs().findIndex(i => i.value !== "");
  const field = inputs()[idx];
  const before = field.value;
  try {
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(field, String(field.value) + "1");
      field.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
  } catch (e) {}
  await flush();
  return { idx, before, after: inputs()[idx].value };
}
const teardown = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} if (el) el.remove(); };

// ═══ W · THE WRITE — a draft lands after the debounce ═══════════════════════════════════════
{
  await boot();
  const e = await editField();
  T("W: setup — the edit registered and the dirty chip is shown", e.after !== e.before && text().includes("Unsaved changes"), JSON.stringify(e));
  await waitDebounce();
  const raw = draftRaw();
  if (POST_FIX) {
    T("W-1: a draft is written under danger_close:mydata_draft_v1", raw !== null);
    let d = null; try { d = JSON.parse(raw); } catch (err) {}
    T("W-2: the payload parses and carries ts, portfolio and expenses", !!(d && d.ts && d.portfolio && d.expenses), String(raw).slice(0, 120));
    T("W-3: the draft carries the EDITED value, not the saved one", !!d && JSON.stringify(d.portfolio).includes(e.after), e.after);
  } else {
    // [PRE-FIX PIN v570 · 2026-09-12] The defect A-3 fixed: the write calls a method the storage
    // contract does not have, throws into an empty catch, and NOTHING is written. Asserting the
    // old truth on purpose — if this ever passes on v570, the premise did not reproduce.
    T("W-1 [PIN v570]: NO draft is written — the autosave has never saved", raw === null, String(raw).slice(0, 120));
  }
}
// ═══ R · THE READ — a draft present at mount surfaces the recovery banner ════════════════════
{
  await revisit();
  const banner = text().includes("Unsaved work from a previous session was recovered");
  if (POST_FIX) {
    T("R-1: the recovery banner appears on the next visit", banner, text().slice(0, 200));
    T("R-2: the banner carries a timestamp", /\d/.test((text().match(/recovered[^—]*/) || [""])[0]), (text().match(/recovered[^—]*/) || [""])[0]);
    T("R-3: both banner buttons are present", !!btn(/RESTORE\s*&\s*APPLY DRAFT/) && !!btn(/DISCARD DRAFT/));
  } else {
    T("R-1 [PIN v570]: no banner — nothing was ever written to surface", !banner);
  }
}
// ═══ RS · RESTORE — the first test restoreDraft has ever had ═════════════════════════════════
{
  if (POST_FIX) {
    // Fresh cycle so the drafted value is known independently of the group above.
    await teardown(); await boot();
    const e = await editField();
    await waitDebounce();
    T("RS: setup — a draft exists to restore", draftRaw() !== null);
    await revisit();
    T("RS: setup — the banner is on screen", text().includes("Unsaved work from a previous session was recovered"));
    await click(btn(/RESTORE\s*&\s*APPLY DRAFT/)); await flush(); await flush();
    const t = tabBtn("my data"); if (t) { await click(t); await flush(); }
    T("RS-1: RESTORE & APPLY DRAFT commits the drafted value", inputs()[e.idx] && inputs()[e.idx].value === e.after, JSON.stringify(inputs()[e.idx] && inputs()[e.idx].value) + " want " + JSON.stringify(e.after));
    T("RS-2: and DELETES the draft — a restored draft is not offered twice", draftRaw() === null, String(draftRaw()).slice(0, 80));
    T("RS-3: the banner is gone after restoring", !text().includes("Unsaved work from a previous session was recovered"));
  } else {
    T("RS [PIN v570]: restoreDraft is unreachable — the banner never appears", !text().includes("Unsaved work from a previous session was recovered"));
  }
}
// ═══ DS · DISCARD — dismisses without committing ═════════════════════════════════════════════
{
  if (POST_FIX) {
    await teardown(); await boot();
    const e = await editField();
    await waitDebounce();
    T("DS: setup — a draft exists to discard", draftRaw() !== null);
    await revisit();
    await click(btn(/DISCARD DRAFT/)); await flush();
    T("DS-1: DISCARD DRAFT deletes the draft", draftRaw() === null, String(draftRaw()).slice(0, 80));
    T("DS-2: and dismisses the banner", !text().includes("Unsaved work from a previous session was recovered"));
    T("DS-3: without committing the drafted value", inputs()[e.idx] && inputs()[e.idx].value === e.before, JSON.stringify(inputs()[e.idx] && inputs()[e.idx].value) + " want " + JSON.stringify(e.before));
  } else {
    T("DS [PIN v570]: discardDraft is unreachable — the banner never appears", !text().includes("Unsaved work from a previous session was recovered"));
  }
}
// ═══ SV · SAVE CLEARS IT — a saved plan leaves no recoverable copy ═══════════════════════════
{
  await teardown(); await boot();
  await editField();
  await waitDebounce();
  if (POST_FIX) T("SV: setup — a draft exists before saving", draftRaw() !== null);
  await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush();
  T(POST_FIX ? "SV-1: Save & Apply deletes the draft" : "SV-1 [PIN v570]: no draft existed to delete", draftRaw() === null, String(draftRaw()).slice(0, 80));
}
// ═══ WP · THE WIPE — ⚠ THE EXTINCTION INVARIANT OF THIS RELEASE ══════════════════════════════
// After Clear All Data the draft key must be GONE. This must fail on any build whose wipe path
// does not cover the draft key, INCLUDING a future one that adds a key and forgets the delete.
{
  await teardown(); await boot();
  await editField();
  await waitDebounce();
  const had = draftRaw() !== null;
  if (POST_FIX) T("WP: setup — a draft really exists to be wiped (the zero below is not vacuous)", had);
  await click(btn(/CLEAR ALL DATA/)); await flush();
  T("WP: setup — the confirmation dialog appeared", text().includes("DELETE YOUR ENTIRE PLAN?"), text().slice(0, 160));
  // Confirm: the destructive button inside the dialog, not the one that opened it.
  const confirm = btnExact("DELETE EVERYTHING") || [...body().querySelectorAll("button")].filter(b => /DELETE EVERYTHING|YES, DELETE/i.test(b.textContent || ""))[0];
  await click(confirm); await flush(); await flush();
  T("WP-1 ⚠ EXTINCTION: after Clear All Data the draft key is GONE", draftRaw() === null, "draft survived the wipe: " + String(draftRaw()).slice(0, 120));
  const survivors = [];
  for (let i = 0; i < window.localStorage.length; i++) survivors.push(window.localStorage.key(i));
  T("WP-2: no dc: key mentioning 'draft' survives the wipe", !survivors.some(k => /draft/i.test(k)), survivors.join(","));
}
// ═══ IM · IMPORT CLEARS IT — an imported plan supersedes any draft ═══════════════════════════
{
  await teardown(); await boot();
  await editField();
  await waitDebounce();
  if (POST_FIX) T("IM: setup — a draft exists before the import", draftRaw() !== null);
  // Drive handleImportFile through the file input, as a user would.
  const fileInput = [...body().querySelectorAll("input[type=file]")][0];
  T("IM: setup — the import control is present", !!fileInput);
  if (fileInput) {
    const backup = JSON.stringify({ app: "DangerClose", version: 5, portfolio: G.PORTFOLIO(), expenses: G.EXPENSES() });
    const f = { name: "b.json", type: "application/json" };
    Object.defineProperty(fileInput, "files", { configurable: true, value: [f] });
    // ⚠ HARNESS TRAP. The app does `new FileReader()` — a BARE identifier, which the bundle
    // resolves on globalThis, NOT on window. jsdom puts FileReader on `window` only, so
    // globalThis.FileReader is undefined and the import path throws before it reaches the draft
    // delete. Stubbing window.FileReader alone leaves this group VACUOUS on both legs: IM-1 then
    // "passes" on v570 for the wrong reason (no draft existed anyway). Stub globalThis.
    const RealFR = globalThis.FileReader;
    const Stub = function () { this.readAsText = () => { this.result = backup; if (this.onload) this.onload(); }; };
    globalThis.FileReader = Stub; window.FileReader = Stub;
    T("IM: setup — the harness can drive the import path (globalThis.FileReader is stubbed)", typeof globalThis.FileReader === "function");
    try { await act(async () => { fileInput.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
    await flush(); await flush();
    globalThis.FileReader = RealFR;
  }
  T(POST_FIX ? "IM-1: importing a backup deletes the draft" : "IM-1 [PIN v570]: no draft existed to delete", draftRaw() === null, String(draftRaw()).slice(0, 80));
}
// ═══ PR · THE PROMISE MATCHES REALITY ════════════════════════════════════════════════════════
// Whatever the chip and the leave dialog say about a draft is asserted against the state that
// actually determines whether one exists. This is the group that would have caught A-3.
{
  await teardown(); await boot();
  const e = await editField();
  // BEFORE the debounce: no draft has been written yet, so nothing may promise one.
  const chipEarly = chipText();
  T("PR-1: the dirty chip is shown as soon as the form is dirty", chipEarly.includes("Unsaved changes"), String(e.after));
  if (POST_FIX) {
    // ⚠ The predicate is deliberately BROAD. An earlier version matched only the literal phrase
    // "draft saved" — this release's own wording — and therefore passed against v5.70's
    // "a draft auto-saves every few seconds", which is the same false promise in different words.
    // A negative control (controls_v571_draft.sh C3) caught that and the predicate was widened
    // rather than the control adjusted (OPERATIONS §B2). What is being asserted is the PROPERTY —
    // no autosave claim before an observed write — not one sentence.
    T("PR-2: before any write, the chip does NOT claim a draft was saved or is saving",
      !/draft saved|auto-?saves?|autosaved/i.test(chipEarly),
      chipEarly);
    await waitDebounce();
    T("PR-3: after an OBSERVED write, the chip reports the draft with a time", /draft saved \d/i.test(chipText()), chipText());
    T("PR-4: and a draft really is in storage when the chip says so", draftRaw() !== null);
    // The leave dialog, at the moment the user decides.
    await click(tabBtn("dashboard"));
    T("PR-5: the leave dialog appears on leaving with unsaved edits", text().includes("You have unsaved edits in My Data"));
    T("PR-6: with a draft saved, the dialog MAY promise the restore", text().includes("Discarding keeps the auto-saved draft"), (text().match(/Discarding[^)]{0,90}/) || [""])[0]);
  } else {
    // [PRE-FIX PIN v570] Both promises are made unconditionally, and both are false on this build:
    // no draft was written before the chip claimed one, and none exists when the dialog promises a
    // restore. This is the substance of finding A-3 and the reason it was rated undisclosed.
    T("PR-2 [PIN v570]: the chip claims an autosave unconditionally", /auto-?saves?/i.test(chipText()) && chipText().includes("draft"), chipText());
    await waitDebounce();
    T("PR-3 [PIN v570]: and NO draft exists while it says so", draftRaw() === null, String(draftRaw()).slice(0, 80));
    await click(tabBtn("dashboard"));
    T("PR-5 [PIN v570]: the leave dialog appears", text().includes("You have unsaved edits in My Data"));
    T("PR-6 [PIN v570]: and promises a draft that was never written", text().includes("Discarding keeps the auto-saved draft") && draftRaw() === null);
  }
}
await teardown();

// ═══ LD · THE LEAVE DIALOG WITH NO DRAFT YET ════════════════════════════════════════════════
// ⚠ THIS GROUP EXISTS BECAUSE A NEGATIVE CONTROL FOUND ITS ABSENCE. controls_v571_draft.sh C4
// makes the dialog's restore sentence unconditional again — the pre-v5.71 defect — and NOTHING in
// t37 failed, because group PR only ever reached the dialog AFTER the debounce, when a draft
// really did exist and the two wordings are identical. The case D-A3-3 exists for is the OTHER
// one: dirty form, no draft written yet. Leaving here really does lose the edits, and the dialog
// must say so. The control was not adjusted to match the test (OPERATIONS §B2) — the test grew.
{
  await boot();
  await editField();
  // NO waitDebounce — leave inside the 2 s window, before any write could have landed.
  T("LD: setup — the form is dirty and no draft has been written yet", text().includes("Unsaved changes") && draftRaw() === null, String(draftRaw()).slice(0, 60));
  await click(tabBtn("dashboard"));
  T("LD-1: the leave dialog appears", text().includes("You have unsaved edits in My Data"));
  if (POST_FIX) {
    T("LD-2: with NO draft saved, the dialog does NOT promise a recoverable draft",
      !text().includes("Discarding keeps the auto-saved draft"),
      (text().match(/Discarding[^)]{0,90}/) || [""])[0]);
    T("LD-3: it says plainly that discarding loses the edits",
      text().includes("Discarding loses these edits"),
      (text().match(/Discarding[^)]{0,90}/) || [""])[0]);
  } else {
    // [PRE-FIX PIN v570] The dialog promised a recoverable draft unconditionally — and on this
    // build no draft had been written, nor could one ever be. This is the harmful half of A-3:
    // the false promise sits next to DISCARD & LEAVE, at the moment the user decides.
    T("LD-2 [PIN v570]: the dialog promises a draft even though none exists",
      text().includes("Discarding keeps the auto-saved draft") && draftRaw() === null);
  }
}
await teardown();

// ═══ A6 · AN IMPORTED masterPrompt IS STRING-ONLY AND CAPPED ═════════════════════════════════
// applyLoadedData assigned masterPrompt with no type check and no length cap. It is persisted,
// reloaded every visit, and HEADS every Ask AI system prompt, so a shared backup file could steer
// the assistant. ⚠ The 20,000 cap is a JUDGEMENT, not a measurement (scope D-A3-4).
{
  const CAP = 20000;
  const baseline = G.MASTER_PROMPT ? G.MASTER_PROMPT() : undefined;
  T("A6: setup — the harness can read the live master prompt", typeof baseline === "string", typeof baseline);
  const apply = (mp) => { try { G.applyLoadedData({ portfolio: G.PORTFOLIO(), expenses: G.EXPENSES(), masterPrompt: mp }); } catch (e) {} return G.MASTER_PROMPT(); };

  const good = "CUSTOM PROMPT FROM MY OWN BACKUP";
  T("A6-1: a legitimate string prompt is still imported (the guard is not a wall)", apply(good) === good, String(apply(good)).slice(0, 60));

  const long = "L".repeat(CAP + 5000);
  const afterLong = apply(long);
  if (POST_FIX) {
    T(`A6-2: an over-long prompt is TRUNCATED at ${CAP} characters, not rejected`, typeof afterLong === "string" && afterLong.length === CAP, "length " + (afterLong || "").length);
    T("A6-3: the cap constant is exposed and is the value the scope approved", G.MASTER_PROMPT_MAX_CHARS && G.MASTER_PROMPT_MAX_CHARS() === CAP, String(G.MASTER_PROMPT_MAX_CHARS && G.MASTER_PROMPT_MAX_CHARS()));
  } else {
    T("A6-2 [PIN v570]: an over-long prompt is assigned whole — no cap", typeof afterLong === "string" && afterLong.length === CAP + 5000, "length " + (afterLong || "").length);
    T("A6-3 [PIN v570]: no cap constant exists on this build", G.MASTER_PROMPT_MAX_CHARS === undefined || G.MASTER_PROMPT_MAX_CHARS() === undefined);
  }

  // A non-string must never reach MASTER_PROMPT: it is template-interpolated into the system prompt.
  apply("KNOWN GOOD SENTINEL");
  const hostile = { toString: () => "OBJECT INJECTED INTO THE SYSTEM PROMPT" };
  const afterObj = apply(hostile);
  if (POST_FIX) {
    T("A6-4: an OBJECT masterPrompt is REJECTED — the previous value stands", afterObj === "KNOWN GOOD SENTINEL", typeof afterObj + " " + String(afterObj).slice(0, 60));
    T("A6-5: and the live prompt is still a string", typeof afterObj === "string", typeof afterObj);
    apply("KNOWN GOOD SENTINEL");
    const afterArr = apply(["ARRAY", "INJECTED"]);
    T("A6-6: an ARRAY masterPrompt is rejected too", afterArr === "KNOWN GOOD SENTINEL", typeof afterArr + " " + String(afterArr).slice(0, 60));
  } else {
    T("A6-4 [PIN v570]: an OBJECT masterPrompt is assigned AS-IS, unchecked", afterObj === hostile, typeof afterObj);
    T("A6-5 [PIN v570]: the live prompt is no longer a string", typeof afterObj !== "string", typeof afterObj);
  }
  // Restore a sane value so nothing downstream in this process sees the hostile one.
  apply(typeof baseline === "string" ? baseline : "reset");
}

console.log(`t37 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
