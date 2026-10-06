// t46 — BULL-LEANING IS THE DEFAULT SCENARIO, AND EACH USER'S CHOICE IS REMEMBERED
// (docs/SCOPE_SCENARIO_DEFAULT.md; added for v5.80). Runs on BOTH legs:
//     node t46_scenario_default.mjs v579   |   node t46_scenario_default.mjs v580
//
// WHAT v5.80 CHANGED. Through v5.79 every visit started on the BASE scenario preset (expected equity return 3.1% nominal /
// 0.4% real) and the choice was never saved. v5.80 starts a first visit on BULL-LEANING (5.2% / 2.6% real — still ~5 pp
// below the app's historical anchor, and with history's frequency of bad years), and remembers whichever preset the user
// picks, per browser, exactly as the Social Security and ACA scenario settings already are (decision D-2: those two are not
// in the backup file, so neither is this).
//
// SESSIONS. Storage lives in jsdom's localStorage, so it survives an unmount + fresh mount — a "new visit". The active
// preset is read two ways: the header chip's text, and the Monte Carlo's actual regime weights (SCENARIOS[*].prob), so a
// label that changed while the model did not would fail here.
//
// GATED PER LEG (OPERATIONS §B2): the v579 leg pins the old behaviour as dated facts — BASE on every visit, nothing stored.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const VER = process.argv[2];
const KNOWN_VERSIONS = ["v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591"];
if (!KNOWN_VERSIONS.includes(VER)) { console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`); process.exit(1); }
const POST = VER === "v580" || VER === "v581" || VER === "v582" || VER === "v583" || VER === "v584" || VER === "v585" || VER === "v586" || VER === "v587" || VER === "v588" || VER === "v589" || VER === "v590" || VER === "v591";

const { window } = await import("./env_dom.mjs");
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const KEY = "danger_close:scenario_v1";
const W = { base: { base: .45, optimistic: .20, pessimistic: .15, recession: .10, stagflation: .07, crisis: .03 },
            bull: { base: .35, optimistic: .40, pessimistic: .10, recession: .08, stagflation: .05, crisis: .02 },
            historical: { base: .15, optimistic: .78, pessimistic: .03, recession: .02, stagflation: .01, crisis: .01 } };

let pass = 0, fail = 0; const fails = [];
const T = (name, cond, detail = "") => { if (cond) pass++; else { fail++; fails.push(`  \u2717 ${name}${detail ? " — " + String(detail).slice(0, 160) : ""}`); } };
console.log(`t46 — BULL-LEANING DEFAULT, REMEMBERED CHOICE (${VER})`);

const body = () => window.document.body;
let mounted = null;
const flush = async (act) => { for (let k = 0; k < 3; k++) { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} } };
const click = async (act, el) => { if (!el) return false; try { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} return true; };
async function visit() {                               // a fresh mount = a new session; storage persists across it
  if (mounted) { try { await mounted.act(async () => { mounted.root.unmount(); }); } catch (e) {} body().innerHTML = ""; }
  const el = window.document.createElement("div"); body().appendChild(el);
  mounted = window.__mount(el);
  try { await mounted.act(async () => { mounted.root.render(React.createElement(mounted.DangerClose)); }); } catch (e) {}
  await flush(mounted.act);
  const ex = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(mounted.act, ex); await flush(mounted.act);
  return mounted;
}
const chip = () => { const t = body().textContent || ""; const m = /Scenario:\s*(BASE|BEAR-LEANING|BULL-LEANING|HISTORICAL)/.exec(t); return m ? m[1] : "(no chip)"; };
const weights = () => { const _s = window.__g && window.__g.SCENARIOS; const S = typeof _s === "function" ? _s() : _s; if (!S) return "(no SCENARIOS)";
  return Object.fromEntries(Object.keys(W.base).map(k => [k, S[k].prob])); };
const same = (a, b) => typeof a === "object" && Object.keys(b).every(k => Math.abs(a[k] - b[k]) < 1e-9);
const stored = () => window.localStorage.getItem(PREFIX + KEY);
const toMC = async () => { await click(mounted.act, [...body().querySelectorAll("button.tab")].find(b => /^monte carlo$/i.test(b.textContent.trim()))); await flush(mounted.act); };
const pick = async (label) => { await toMC(); const btn = [...body().querySelectorAll("button")].find(b => b.textContent.trim() === label); const ok = await click(mounted.act, btn); await flush(mounted.act); return ok; };
const notice = () => /Non-base scenario active|not the default/i.test(body().textContent || "") ? (body().textContent.match(/⚠ (Non-base scenario active[^.]*|[^⚠]{0,40}not the default[^.]*)/) || [""])[0] : "";

// ── 1 · a first visit, nothing stored ──────────────────────────────────────────────────────────────────────────────
window.localStorage.clear();
await visit();
T(`1-1 first visit: the header shows ${POST ? "BULL-LEANING" : "BASE [pre-v5.80]"}`, chip() === (POST ? "BULL-LEANING" : "BASE"), chip());
T(`1-2 first visit: the Monte Carlo actually runs on ${POST ? "Bull-leaning's" : "Base's"} regime weights`, same(weights(), POST ? W.bull : W.base), JSON.stringify(weights()));
T("1-3 a first visit writes nothing until the user chooses", stored() === null, stored());
await toMC();
T(`1-4 no "not the default" warning on the default preset`, notice() === "", notice());

// ── 2 · the user picks a preset ────────────────────────────────────────────────────────────────────────────────────
const target = POST ? "BASE" : "BULL-LEANING";      // the preset that is NOT the leg's default
T(`2-0 the ${target} button exists on the Monte Carlo tab`, await pick(target));
T(`2-1 after choosing ${target}, the header follows`, chip() === target, chip());
T(`2-2 …and so do the regime weights`, same(weights(), POST ? W.base : W.bull), JSON.stringify(weights()));
if (POST) {
  T("2-3 the choice is saved (key danger_close:scenario_v1 = \"base\")", stored() === "base", stored());
  T("2-4 a non-default preset shows the warning, which names the default (BULL-LEANING)", /BULL-LEANING/.test(notice()), notice());
} else {
  T("2-3 [pre-v5.80] the choice is NOT saved", stored() === null, stored());
}

// ── 3 · a new visit ────────────────────────────────────────────────────────────────────────────────────────────────
// The preset restored must be NEITHER the old default (BASE) NOR the new one (BULL-LEANING): restoring BASE would pass on
// v5.79 code with no restore at all, because BASE was its default (measured at the build — a first draft did exactly that).
await pick("HISTORICAL");
if (POST) T("3-0 choosing HISTORICAL is saved", stored() === "historical", stored());
await visit();
if (POST) {
  T("3-1 a new visit restores the saved choice (HISTORICAL — neither the old default nor the new)", chip() === "HISTORICAL", chip());
  T("3-2 …and runs the Monte Carlo on it", same(weights(), W.historical), JSON.stringify(weights()));
} else {
  T("3-1 [pre-v5.80] a new visit forgets the choice: back to BASE", chip() === "BASE", chip());
}

// ── 4 · a stored value that is not a preset ────────────────────────────────────────────────────────────────────────
window.localStorage.setItem(PREFIX + KEY, "no-such-preset");
await visit();
T(`4-1 an unknown stored value falls back to the default (${POST ? "BULL-LEANING" : "BASE"}) and the app still renders`,
  chip() === (POST ? "BULL-LEANING" : "BASE"), chip());
T("4-2 …with the default's regime weights", same(weights(), POST ? W.bull : W.base), JSON.stringify(weights()));

// ── 5 · choosing the default again is saved too (a user can return to it) ─────────────────────────────────────────
if (POST) {
  await pick("BASE"); await pick("BULL-LEANING");
  T("5-1 choosing BULL-LEANING back is saved", stored() === "bull", stored());
  await visit();
  T("5-2 …and restored on the next visit", chip() === "BULL-LEANING", chip());
}
try { await mounted.act(async () => { mounted.root.unmount(); }); } catch (e) {}

console.log(fails.join("\n"));
console.log(`\nt46 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
