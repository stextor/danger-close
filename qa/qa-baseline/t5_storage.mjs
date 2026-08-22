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

// ─── v5.22: VERSION-TAG REGISTRY GUARD ───
// An UNREGISTERED tag used to evaluate every ladder below as false and fall off the end of every
// ternary chain, silently running the OLDEST branch: pre-v5.11 expectations and v5.10 version
// strings. That is fail-OPEN — a new build got a WEAKER test, not a stronger one — and it could
// change the CHECK COUNT: with an unregistered tag t3 ran 35 checks instead of 36, and the count is
// the number that goes in the release headline. Registering a new version in the ladders below is
// now mandatory, and an unregistered tag stops the run instead of quietly testing the wrong thing.
const KNOWN_VERSIONS = ["v510", "v5101", "v5102", "v511", "v512", "v513", "v514", "v515", "v516", "v517", "v518", "v519", "v520", "v521", "v522", "v523", "v524", "v525", "v526", "v527", "v528", "v529", "v530", "v531", "v532", "v533", "v534", "v535", "v536", "v537", "v538", "v539", "v540", "v541", "v542", "v543", "v544", "v545", "v592"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log("\n  \u2717 FATAL: version tag \"" + VER + "\" is not registered in this suite.");
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to the version ladders in this file BEFORE running.");
  process.exit(1);
}

const IS510 = VER !== "v592"; // v5.10-family features (v510 and later)
const IS5101 = VER === "v5101" || VER === "v5102" || VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545")); // v5.10.1 fixes present (v5101 and later)
const IS5102 = VER === "v5102" || VER === "v511" || VER === "v512" || VER === "v513" || VER === "v514" || VER === "v515" || VER === "v516" || VER === "v517" || VER === "v518" || VER === "v519" || VER === "v520" || VER === "v521" || VER === "v522" || VER === "v523" || VER === "v524" || VER === "v525" || VER === "v526" || VER === "v527" || VER === "v528" || VER === "v529" || VER === "v530" || VER === "v531" || VER === "v532" || VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545")); // v5.10.2 B-2 fix present (full 13-key wipe)

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
    // v5.25: a schema change reaches the STORAGE CONTRACT, and parity cannot see it — a migration
    // that works forward but corrupts an old backup shows up here or nowhere.
    if (VER === "v525" && parsed) {
      const oa = (parsed.portfolio && parsed.portfolio.otherAccounts) || parsed.otherAccounts || [];
      T("B (V525): backup carries Other accounts", Array.isArray(oa) && oa.length > 0, `len=${oa.length}`);
      T("B (V525): every exported Other account carries a taxType",
        oa.every(a => ["taxable", "trad", "roth", "hsa"].includes(a.taxType)),
        JSON.stringify(oa.map(a => `${a.name}=${a.taxType}`)));
      T("B (V525): the exported split still matches what v5.24 disclosed ($111k trad)",
        oa.filter(a => a.taxType === "trad").reduce((t, a) => t + (a.balance || 0), 0) === 111000,
        String(oa.filter(a => a.taxType === "trad").reduce((t, a) => t + (a.balance || 0), 0)));
      T("B (V525): no exported trad/roth account is jointly owned",
        oa.every(a => !((a.taxType === "trad" || a.taxType === "roth") && a.owner === "JT")),
        JSON.stringify(oa.map(a => `${a.name}:${a.taxType}/${a.owner}`)));
      T("B (V525): the transient migration flag is NOT persisted as a stale true",
        !(parsed.portfolio && parsed.portfolio._otherTypeMigrated),
        JSON.stringify(parsed.portfolio && parsed.portfolio._otherTypeMigrated));
    }
  }
}
// ── v5.33 · GROUP E — the embedded-gain field is a STORAGE contract before it is anything else.
// Nothing reads the field at v5.33, so "it persists, clamps, and survives a restore" IS the
// release. Every expectation below is hand-computed: v/100 clamped into [0, 0.95], non-finite
// to 0. The non-zero round trip is the path the My Data control creates and the one v5.34
// depends on — a user who sets 40% at v5.33 must still read 40% after v5.34 lands.
// v5.34: still exact-true. The field's storage contract is unchanged by the engine release —
// a user who set 40% at v5.33 must still read 40% after v5.34 lands, which is the whole point.
if (VER === "v533" || VER === "v534" || VER === "v535" || VER === "v536" || VER === "v537" || (VER === "v538" || (VER === "v539" || VER === "v540" || VER === "v541" || VER === "v541" || VER === "v542" || VER === "v543" || VER === "v544" || VER === "v545"))) {
  const G = window.__g;
  const basePlan = JSON.parse(JSON.stringify(G.PORTFOLIO()));

  // 1 — the shipped default persists through Save & Apply
  const persisted = JSON.parse(window.localStorage.getItem(PREFIX + K("portfolio_v1")) || "{}");
  T("E: Save & Apply persists taxableGainPct", Object.prototype.hasOwnProperty.call(persisted, "taxableGainPct"), JSON.stringify(persisted.taxableGainPct));
  T("E: and it persists as the shipped default 0", persisted.taxableGainPct === 0, String(persisted.taxableGainPct));

  // 2 — a PRE-v5.33 backup has no such field at all. Restoring it must yield 0, not undefined,
  //     and must not NaN anything downstream.
  const oldBackup = JSON.parse(JSON.stringify(basePlan));
  delete oldBackup.taxableGainPct;
  T("E: the simulated pre-v5.33 backup genuinely lacks the field", !("taxableGainPct" in oldBackup));
  G.applyLoadedData({ portfolio: oldBackup });
  T("E: restoring a pre-v5.33 backup defaults the field to 0", G.PORTFOLIO().taxableGainPct === 0, String(G.PORTFOLIO().taxableGainPct));
  T("E: and the accessor reads 0 from it", G.taxableGainShare() === 0, String(G.taxableGainShare()));

  // 3 — an unparseable value in a hand-edited backup falls to 0 the same way
  const junk = JSON.parse(JSON.stringify(basePlan)); junk.taxableGainPct = "abc";
  G.applyLoadedData({ portfolio: junk });
  T("E: an unparseable taxableGainPct is normalised to 0 on restore", G.PORTFOLIO().taxableGainPct === 0, String(G.PORTFOLIO().taxableGainPct));

  // 4 — a USER-SET non-zero value survives restore untouched (the v5.34 dependency)
  const set40 = JSON.parse(JSON.stringify(basePlan)); set40.taxableGainPct = 40;
  G.applyLoadedData({ portfolio: set40 });
  T("E: a user-set 40 survives restore", G.PORTFOLIO().taxableGainPct === 40, String(G.PORTFOLIO().taxableGainPct));
  T("E: and the accessor converts it to 0.40", G.taxableGainShare() === 0.40, String(G.taxableGainShare()));

  // 5 — the non-zero value round-trips through the BACKUP BYTES. Note what this does and does
  //     not prove: Export Backup serialises buildPortfolio(), the FORM state, so exercising the
  //     real export button here would capture the form's 0 rather than the value applyLoadedData
  //     just wrote to the module global (the documented no-re-render trap, OPERATIONS C). The
  //     control -> Save & Apply -> export path is covered in t4, where the control can be typed
  //     into. What is proved here is the half t5 owns: the field survives JSON serialisation and
  //     restore exactly, which is what a backup file physically is.
  const bytes = JSON.stringify({ app: "DangerClose", version: 5, portfolio: G.PORTFOLIO() });
  const reparsed = JSON.parse(bytes).portfolio;
  T("E: the backup bytes carry the user-set 40", reparsed.taxableGainPct === 40, String(reparsed.taxableGainPct));
  G.applyLoadedData({ portfolio: reparsed });
  T("E: restoring from those bytes still reads 40", G.PORTFOLIO().taxableGainPct === 40, String(G.PORTFOLIO().taxableGainPct));
  T("E: and the accessor still converts it to 0.40", G.taxableGainShare() === 0.40, String(G.taxableGainShare()));
  // 6 — a hand-edited OUT-OF-RANGE backup gets past the save-time clamp (nothing clamped it
  //     on the way in), so the accessor is the second line of defence and must hold the band.
  const wild = JSON.parse(JSON.stringify(basePlan)); wild.taxableGainPct = 200;
  G.applyLoadedData({ portfolio: wild });
  T("E: an out-of-range 200 is stored as-is by the schema default", G.PORTFOLIO().taxableGainPct === 200, String(G.PORTFOLIO().taxableGainPct));
  T("E: but the accessor clamps it to 0.95", G.taxableGainShare() === 0.95, String(G.taxableGainShare()));

  // restore the household so the later groups run against the plan they expect
  G.applyLoadedData({ portfolio: basePlan });
  T("E: household restored for the remaining groups", G.PORTFOLIO().taxableGainPct === 0, String(G.PORTFOLIO().taxableGainPct));
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
// ── v5.10.2 (audit Finding B-2): seed EVERY key in STORAGE_KEYS before the wipe, so
// Clear All Data is tested against a fully-populated store — previously only the plan
// keys and the API key were present, which is exactly how three keys (checklist, simple,
// ssCut) escaped the wipe list unnoticed. The checklist seed carries a recognizable
// third-party contact (the PII this defect leaked) so its erasure is provable. ──
const KEYMAP = (window.__g && window.__g.STORAGE_KEYS && window.__g.STORAGE_KEYS()) || null;
if (IS5102) T("D: shim exposes the STORAGE_KEYS map (required for the wipe invariant)", !!KEYMAP);
const SEED_FIXTURES = {
  checklist: JSON.stringify({ estateAttorney: { done: true, notes: "executor is our daughter", contact: "Jane Q. Attorney / 555-0100" } }),
  simple: "1",
  ssCut: JSON.stringify({ on: true, year: 2033, pct: 78 }),
  skin: "tactical", uiScale: "115", offline: "0",
  localLLM: JSON.stringify({ url: "http://localhost:11434/v1", model: "llama3.1" }),
  acaRegime: "current", prompt: "seeded master prompt",
};
if (KEYMAP) {
  const present = storedKeys();
  for (const [name, key] of Object.entries(KEYMAP)) {
    if (!present.includes(key)) await window.storage.set(key, SEED_FIXTURES[name] ?? "seed");
  }
  T("D: every STORAGE_KEYS key present before the wipe", Object.values(KEYMAP).every(k => storedKeys().includes(k)));
}
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
  // ── EXTINCTION INVARIANT (v5.10.2, audit Finding B-2) vs KNOWN DEFECT PIN (prior legs) ──
  // The defect class: clearStorage()'s hand-enumerated delete list drifts out of sync with
  // STORAGE_KEYS (it produced D1 at v5.10.1 and B-2 here). The invariant below loops the
  // key map itself, so ANY key added in a future release is covered automatically — if the
  // wipe list isn't extended to match, this fails loudly.
  if (IS5102) {
    if (KEYMAP) {
      T("D: STORAGE_KEYS defines at least the 13 known keys", Object.keys(KEYMAP).length >= 13, String(Object.keys(KEYMAP).length));
      for (const [name, key] of Object.entries(KEYMAP)) {
        T(`D: Clear All Data deletes STORAGE_KEYS.${name}`, !ks.includes(key), ks.join(","));
      }
      // checklist named explicitly: it holds THIRD-PARTY PII — the estate attorney's / CPA's /
      // insurance contact's names and phone numbers, plus free-text notes that may name
      // executors and family. Its survival after "delete everything" was the substance of
      // Finding B-2; prove the CONTENT is gone from storage, not merely the key.
      const survivors = ks.map(k => window.localStorage.getItem(PREFIX + k) || "").join("\n");
      T("D: seeded third-party contact PII is gone from ALL surviving storage", !survivors.includes("555-0100"), "attorney contact survived the wipe");
    }
  } else {
    // ── KNOWN DEFECT PIN (pre-existing in every release through v5.10.1; found 2026-08-07
    // by the Phase 1 standing audit, Finding B-2; FIXED in v5.10.2 — this pin documents the
    // pre-fix state on frozen legs). clearStorage() deleted only 10 of the 13 STORAGE_KEYS:
    // checklist (third-party contact PII + notes), simple, and ssCut survived "delete
    // everything" — on v5.10.1 because they were missing from the wipe list, and on earlier
    // legs because clearStorage() was never called at all. Flip nothing here: frozen legs
    // keep their history; the fixed behavior is asserted by the IS5102 loop above. ──
    T("D [KNOWN DEFECT]: checklist (third-party contacts) SURVIVES Clear All Data (fixed in v5.10.2; pre-fix state pinned here)", ks.includes(K("checklist_v1")), ks.join(","));
    T("D [KNOWN DEFECT]: simple-mode flag SURVIVES Clear All Data (fixed in v5.10.2; pre-fix state pinned here)", ks.includes(K("simple_v1")));
    T("D [KNOWN DEFECT]: ssCut scenario SURVIVES Clear All Data (fixed in v5.10.2; pre-fix state pinned here)", ks.includes(K("ss_cut_v1")));
  }
}

console.log(`\nt5 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
