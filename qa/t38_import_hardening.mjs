// t38 — IMPORT HARDENING (SCOPE_IMPORT_HARDENING H-1…H-6, findings A-2 / A-4 / A-5; added for v5.72).
// Runs on BOTH legs:  node t38_import_hardening.mjs v571   |   node t38_import_hardening.mjs v572
//
// WHAT IT PINS. Through v5.71 a malformed backup REPLACED the live plan before anything checked it:
// `applyLoadedData` opened with `PORTFOLIO = portfolio` and threw part-way through its migrations. On
// My Data the throw became an unobserved rejection (the import handler did not await), so the user saw
// nothing while memory held the bad plan; on the landing screen the user saw a raw engine error. A skin
// name such as "constructor" passed three truthy gates and blanked the page. Nothing bounded a list.
//
// ⚠ THE EXTINCTION INVARIANT OF THIS RELEASE IS GROUP M: A REJECTED PLAN CHANGES NOTHING — memory,
//   the derived bindings and storage are all exactly what they were. The UI promises it in words (D-2,
//   "Your saved plan was not changed"); this group is what makes the promise checkable.
//
// ⚠ D-1 HAS TWO HALVES AND EACH HAS ITS OWN WITNESS. M-A* can only be satisfied by validating FIRST
//   (a one-time expense with no start date does not throw inside applyLoadedData at all — it crashes
//   the render later — so only the validator can reject it, and only it sets `planRejected`). M-B* can
//   only be satisfied by the ROLLBACK (a throwing getter passes any shape check). Reverting either half
//   alone turns its own group red; qa/tools/controls_v572_import.py shows both.
//
// ⚠ THE PRIOR LEG IS MEANT TO BE NOISY. On v571 every defect is live; the prior leg's job is to PIN
//   each one ([KNOWN DEFECT pre-v5.72]), not to pass the fix's assertions. Gate per leg; never soften an
//   assertion so both legs go green (OPERATIONS §D).
//
// ⚠ HARNESS TRAP. env_dom.mjs defines no FileReader, and the CJS bundle resolves the app's bare
//   `FileReader` to Node's global — so without the line below a VALID backup "fails" and every
//   rejection assertion passes on a broken importer. Group P (the positive control) is what catches it.
//
// ⚠ D-10 (decided 2026-09-15). The v5.9.1 birth-year clamp read `dobA.year`, but dobA is a STRING, so it
//   never fired. Group Y pins that on the prior leg and asserts the string-aware clamp from v5.72.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v571", "v572", "v573", "v574"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log(`    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST_FIX = VER === "v572" || VER === "v573" || VER === "v574"; // H-1…H-6 land at v5.72 (v5.73 keeps them; it changes only ME/MT state rules)

// ── storage: the real contract (== src/main.jsx). Async; `get` REJECTS on a missing key. ──
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
globalThis.FileReader = window.FileReader; // see the HARNESS TRAP above
const grab = (b) => { window.__lastBlob = b; return "blob:t38"; };
window.URL.createObjectURL = grab; window.URL.revokeObjectURL = () => {};
globalThis.URL.createObjectURL = grab; globalThis.URL.revokeObjectURL = () => {};
let confirmAnswer = true, confirmCalls = 0;
window.confirm = () => { confirmCalls++; return confirmAnswer; };
// ⚠ LIMITATION: jsdom's window.location is unforgeable, so this suite cannot observe the Reload
//   navigation itself. B-6 asserts only what it can see — that pressing Reload changes no data.
// Errors are CAPTURED, not silenced: group B asserts the boundary still reports to the console.
const consoleErrors = [];
console.error = (...a) => { consoleErrors.push(a.map(x => (x && x.message) || String(x)).join(" ")); };
console.warn = () => {};
process.on("unhandledRejection", (r) => { consoleErrors.push("unhandledRejection: " + ((r && r.message) || r)); });
// ⚠ An uncaught exception is RECORDED (React reports render errors this way in jsdom) but it is also
//   COUNTED: if the suite itself dies, the exit hook below prints DIED and exits non-zero. A handler
//   that only records turns a dead suite into a silent 0/0 — §B2, and it happened while writing this.
let finished = false, uncaught = 0;
process.on("uncaughtException", (e) => { uncaught++; consoleErrors.push("uncaughtException: " + ((e && e.message) || e)); if (!domPhase) { console.log(`  \u2717 SUITE CRASHED outside the DOM phase: ${(e && e.stack) || e}`); process.exit(1); } });
let domPhase = false;
process.on("exit", (code) => { if (!finished) { console.log(`t38 SUITE: ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

require(`./dom_${VER}.cjs`);
const React = require("react");
const G = window.__g;
const K = G.STORAGE_KEYS();
const IC = G.IMPORT_CONSTS();

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log(`  \u2717 ${name}${detail ? " \u2014 " + String(detail).slice(0, 240) : ""}`); } };
const PIN = (id, what) => POST_FIX ? `${id}: ${what}` : `${id} [KNOWN DEFECT pre-v5.72]`;
console.log(`t38 \u2014 IMPORT HARDENING (${VER})`);

const clone = (o) => JSON.parse(JSON.stringify(o));
const J = (o) => { try { return JSON.stringify(o); } catch (e) { return "<unserialisable: " + e.message + ">"; } };
const INHERITED = ["constructor", "toString", "valueOf", "hasOwnProperty", "__proto__"];

// ═══ S · SKIN NAMES — own keys only (H-3) ════════════════════════════════════════════════════
{
  const def = G.skinVars("default");
  T("S-0: skinVars('default') returns the default tokens (the comparison below means something)", def && typeof def["--bg"] === "string");
  for (const nm of INHERITED) {
    let out = null, threw = null;
    try { out = G.skinVars(nm); } catch (e) { threw = e.message; }
    if (POST_FIX) T(`S-1 skinVars(${J(nm)}) falls back to the default skin`, !threw && out && out["--bg"] === def["--bg"], threw);
    else T(`S-1 [KNOWN DEFECT pre-v5.72] skinVars(${J(nm)}) throws`, !!threw, out && out["--bg"]);
    if (POST_FIX) T(`S-2 isSkinKey(${J(nm)}) is false`, G.isSkinKey(nm) === false);
  }
  if (POST_FIX) {
    T("S-3: isSkinKey('default') is true", G.isSkinKey("default") === true);
    T("S-4: every real skin passes isSkinKey", Object.keys(G.SKINS()).every(k => G.isSkinKey(k)));
    T("S-5: a non-string skin name is refused", [null, undefined, 1, {}, ["default"]].every(k => G.isSkinKey(k) === false));
  } else {
    T("S-3 [PIN v571]: isSkinKey does not exist yet", G.isSkinKey === undefined);
  }
}

// ═══ M · A REJECTED PLAN CHANGES NOTHING (H-1, the extinction invariant) ═════════════════════
// A known-good live state first, so "unchanged" is measured against something real.
G.applyLoadedData({ portfolio: clone(G.PORTFOLIO()), expenses: clone(G.EXPENSES()) });
const snap = () => ({ P: G.PORTFOLIO(), Pj: J(G.PORTFOLIO()), E: G.EXPENSES(), Ej: J(G.EXPENSES()), TL: G.PLAN_TIMELINE(), MP: G.MASTER_PROMPT() });
const same = (a, b) => a.P === b.P && a.Pj === b.Pj && a.E === b.E && a.Ej === b.Ej && a.TL === b.TL && a.MP === b.MP;
const diff = (a, b) => ["P", "Pj", "E", "Ej", "TL", "MP"].filter(k => a[k] !== b[k]).join(",");
const good = () => { const p = clone(G.PORTFOLIO()); p.nameA = "CANDIDATE"; return p; };

// M-A · shapes the VALIDATOR must reject. Each also must leave everything untouched.
const HOSTILE = {
  "portfolio is a string": () => ({ portfolio: "x" }),
  "portfolio is an array": () => ({ portfolio: [1, 2] }),
  "positions: [null]": () => ({ portfolio: Object.assign(good(), { positions: [null] }) }),
  "positions is an object": () => ({ portfolio: Object.assign(good(), { positions: { a: 1 } }) }),
  "otherAccounts: [null]": () => ({ portfolio: Object.assign(good(), { otherAccounts: [null] }) }),
  "incomeStreams: ['x']": () => ({ portfolio: Object.assign(good(), { incomeStreams: ["x"] }) }),
  "incomeSources.ssA is a string": () => ({ portfolio: Object.assign(good(), { incomeSources: { ssA: "x" } }) }),
  "contributions is a number": () => ({ portfolio: Object.assign(good(), { contributions: 5 }) }),
  "expenses: [null, 'x']": () => ({ portfolio: good(), expenses: [null, "x"] }),
  "expenses is an object": () => ({ portfolio: good(), expenses: { a: 1 } }),
  // Does NOT throw inside applyLoadedData on v571 — it crashes the RENDER later. Only (a) can stop it.
  "one-time expense with no start": () => ({ portfolio: good(), expenses: [{ cat: "x", label: "y", amount: 5, freq: "once" }] }),
};
for (const [name, mk] of Object.entries(HOSTILE)) {
  const before = snap();
  let err = null;
  try { G.applyLoadedData(mk()); } catch (e) { err = e; }
  const after = snap();
  if (POST_FIX) {
    T(`M-A1 ${name}: rejected by validation (planRejected)`, !!(err && err.planRejected), err ? err.message : "did not throw");
    T(`M-A2 ${name}: memory, derived bindings and prompt unchanged`, same(before, after), diff(before, after));
  } else if (name === "one-time expense with no start") {
    T(`M-A1 [KNOWN DEFECT pre-v5.72] ${name}: accepted without a word`, !err, err && err.message);
  } else {
    T(`M-A2 [KNOWN DEFECT pre-v5.72] ${name}: the live plan was replaced or altered`, !same(before, after), err ? err.message : "no throw");
  }
  // restore a clean live state for the next case, whatever happened
  G.applyLoadedData({ portfolio: clone(JSON.parse(before.Pj)), expenses: clone(JSON.parse(before.Ej)) });
}
if (POST_FIX) {
  T("M-A3: validateLoadedPlan accepts the live plan", G.validateLoadedPlan(G.PORTFOLIO(), G.EXPENSES()) === null);
  T("M-A4: validateLoadedPlan accepts a plan with no optional lists", G.validateLoadedPlan({ nameA: "x" }, undefined) === null);
  T("M-A5: validateLoadedPlan accepts the Start Fresh blank shape", G.validateLoadedPlan({ positions: [], otherAccounts: [], bucketActuals: { 1: 0 }, contributions: {}, incomeSources: { ssA: {}, ssB: {}, pension: {} } }, []) === null);
}

// M-B · a throw the validator CANNOT foresee. Only the rollback restores state.
{
  const before = snap();
  const cand = good();
  Object.defineProperty(cand, "lifeExpA", { get() { throw new Error("t38 getter bomb"); }, enumerable: true, configurable: true });
  let err = null;
  try { G.applyLoadedData({ portfolio: cand, expenses: clone(G.EXPENSES()) }); } catch (e) { err = e; }
  const after = snap();
  T("M-B0: the getter case throws on both legs (it is a real mid-body throw)", !!err && /getter bomb/.test(err.message), err && err.message);
  if (POST_FIX) {
    T("M-B1: it passed validation (planRejected is not set)", !!err && !err.planRejected);
    T("M-B2: rollback — memory, derived bindings and prompt unchanged", same(before, after), diff(before, after));
  } else {
    T("M-B2 [KNOWN DEFECT pre-v5.72]: the half-applied candidate is left in memory", after.P === cand);
  }
  G.applyLoadedData({ portfolio: clone(JSON.parse(before.Pj)), expenses: clone(JSON.parse(before.Ej)) });
}
// M-B · the IN-PLACE path: no new plan, so the body migrates the LIVE object before it throws.
{
  const base = clone(G.PORTFOLIO());
  G.applyLoadedData({ portfolio: Object.assign(clone(base), { retireYear: 2040 }) });
  const live = G.PORTFOLIO();
  live.retireYear = 99999; // a value the clamp will rewrite IN PLACE before the throw below
  const beforeJ = J(live), beforeE = G.EXPENSES();
  const row = { label: "bomb", amount: 1, freq: "monthly", start: "2020-01", end: "2090-01" };
  Object.defineProperty(row, "cat", { get() { throw new Error("t38 cat bomb"); }, enumerable: true, configurable: true });
  let err = null;
  try { G.applyLoadedData({ expenses: [row] }); } catch (e) { err = e; }
  T("M-B3: the in-place case throws on both legs", !!err && /cat bomb/.test(err.message), err && err.message);
  if (POST_FIX) {
    T("M-B4: the live object is the same object", G.PORTFOLIO() === live);
    T("M-B5: its contents are restored, including the in-place clamp", J(G.PORTFOLIO()) === beforeJ && G.PORTFOLIO().retireYear === 99999, `retireYear=${G.PORTFOLIO().retireYear}`);
    T("M-B6: EXPENSES restored", G.EXPENSES() === beforeE);
  } else {
    T("M-B5 [KNOWN DEFECT pre-v5.72]: the live plan keeps the half-applied migration", G.PORTFOLIO().retireYear !== 99999, `retireYear=${G.PORTFOLIO().retireYear}`);
  }
  G.applyLoadedData({ portfolio: clone(base), expenses: clone(Array.isArray(beforeE) ? beforeE : []) });
}

// ═══ C · CLAMPS, AND SAYING SO (H-6 / D-5) ═══════════════════════════════════════════════════
{
  const thisYr = new Date().getFullYear();
  const stream = (over) => Object.assign({ label: "S", kind: "rental", owner: "joint", monthly: 100, startYear: 2030, endYear: 2040, cola: true, tax: "ordinary" }, over);
  const apply = (over) => { const p = good(); Object.assign(p, over); G.applyLoadedData({ portfolio: p }); return G.PORTFOLIO(); };
  const cases = [
    // [label, field-path getter, input override, expected-after (undefined = key removed), expect a note]
    ["stream start -1e9", p => p.incomeStreams[0].startYear, { incomeStreams: [stream({ startYear: -1e9 })] }, 1900, true],
    ["stream start 1899", p => p.incomeStreams[0].startYear, { incomeStreams: [stream({ startYear: 1899 })] }, 1900, true],
    ["stream start 1900 (at bound)", p => p.incomeStreams[0].startYear, { incomeStreams: [stream({ startYear: 1900 })] }, 1900, false],
    ["stream end 1e9", p => p.incomeStreams[0].endYear, { incomeStreams: [stream({ endYear: 1e9 })] }, 9999, true],
    ["stream end 10000", p => p.incomeStreams[0].endYear, { incomeStreams: [stream({ endYear: 10000 })] }, 9999, true],
    ["stream end 9999 (the open-ended marker)", p => p.incomeStreams[0].endYear, { incomeStreams: [stream({ endYear: 9999 })] }, 9999, false],
    ["stream start 0 (left alone)", p => p.incomeStreams[0].startYear, { incomeStreams: [stream({ startYear: 0 })] }, 0, false],
    ["stream start 'abc' (removed)", p => p.incomeStreams[0].startYear, { incomeStreams: [stream({ startYear: "abc" })] }, undefined, true],
    ["claim age A 61", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: 61 } } }, 62, true],
    ["claim age A 62 (at bound)", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: 62 } } }, 62, false],
    ["claim age A 70 (at bound)", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: 70 } } }, 70, false],
    ["claim age A 71", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: 71 } } }, 70, true],
    ["claim age B 1e9", p => p.incomeSources.ssB.plannedAge, { _incomeFromForm: true, incomeSources: { ssB: { tableByAge: {}, planned: 1000, plannedAge: 1e9 } } }, 70, true],
    ["claim age A 0 (wizard empty box — left alone)", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: 0 } } }, 0, false],
    ["claim age A 'abc' (removed)", p => p.incomeSources.ssA.plannedAge, { _incomeFromForm: true, incomeSources: { ssA: { tableByAge: {}, planned: 1000, plannedAge: "abc" } } }, undefined, true],
    ["retire year 99999 (v5.9.1 clamp, now reported)", p => p.retireYear, { retireYear: 99999 }, thisYr + 60, true],
  ];
  for (const [label, get, over, want, noted] of cases) {
    const P = apply(clone(over));
    const got = get(P);
    const notes = P._importAdjusted;
    if (POST_FIX) {
      T(`C-1 ${label}: value is ${J(want)}`, got === want, `got ${J(got)}`);
      T(`C-2 ${label}: ${noted ? "reported" : "not reported"} in the notice`, noted ? (Array.isArray(notes) && notes.length === 1) : notes === null, J(notes));
    } else if (/^stream|^claim/.test(label) && want !== got) {
      T(`C-1 [KNOWN DEFECT pre-v5.72] ${label}: not clamped`, got !== want, `got ${J(got)}`);
    } else if (/retire year/.test(label)) {
      T(`C-2 [KNOWN DEFECT pre-v5.72] ${label}: clamped silently`, got === want && notes === undefined, J(notes));
    }
  }
  if (POST_FIX) {
    // Figure-neutrality of the stream clamp: an absurd start and end behave exactly like "always on".
    apply({ incomeStreams: [stream({ startYear: -1e9, endYear: 1e9 })] });
    const yrs = [thisYr, thisYr + 10, thisYr + 40];
    T("C-3: a clamped stream still pays in every year of the plan (no figure moved)", yrs.every(y => G.streamsAnnualAt(y) === 1200 || !G.PLAN_TIMELINE()), J(yrs.map(y => G.streamsAnnualAt(y))));
    const P = apply({ retireYear: 99999, incomeStreams: [stream({ endYear: 1e9 })] });
    T("C-4: two adjustments give two notes, each naming the field", Array.isArray(P._importAdjusted) && P._importAdjusted.length === 2 && /Retirement year/.test(P._importAdjusted[0]) && /end year/.test(P._importAdjusted[1]), J(P._importAdjusted));
    const Q = apply({});
    T("C-5: an in-range plan clears the notice (Save & Apply clears it)", Q._importAdjusted === null, J(Q._importAdjusted));
  }
}

// ═══ Y · BIRTH DATE (D-10, decided 2026-09-15 — (a)) ══════════════════════════════════════════
// dobA/dobB are STRINGS. Through v5.71 the v5.9.1 clamp read `.year` off them and never fired; the prior
// leg pins that. From v5.72 an unreadable date is removed and an out-of-range year is clamped, and both
// are reported.
{
  const thisYr = new Date().getFullYear();
  const run = (v, key = "dobA") => { const p = good(); p[key] = v; G.applyLoadedData({ portfolio: p }); return G.PORTFOLIO(); };
  if (!POST_FIX) {
    run("9999-01-01");
    T("Y-1 [KNOWN DEFECT pre-v5.72]: a birth date of 9999-01-01 reaches the timeline unclamped", G.PLAN_TIMELINE().dobA.year === 9999, J(G.PLAN_TIMELINE().dobA));
    T("Y-2 [PIN v571]: the stored birth date is a STRING, which is why the .year clamp cannot fire", typeof G.PORTFOLIO().dobA === "string");
  } else {
    const cases = [
      // [label, input, key, expected stored value (undefined = removed), expected note regex or null]
      ["9999-01-01 clamps to this year", "9999-01-01", "dobA", `${thisYr}-01-01`, /Birth year \(first person\): 9999 → /],
      ["0001-01-01 clamps to 1900", "0001-01-01", "dobA", "1900-01-01", /Birth year \(first person\): 1 → 1900/],
      ["1899-06 (wizard shape) clamps to 1900-06", "1899-06", "dobA", "1900-06", /1899 → 1900/],
      ["99999-01-01 (the parser reads 9999) clamps", "99999-01-01", "dobA", `${thisYr}-01-01`, /9999 → /],
      ["1900-01-01 (at the bound) is untouched", "1900-01-01", "dobA", "1900-01-01", null],
      [`${thisYr}-12-31 (at the bound) is untouched`, `${thisYr}-12-31`, "dobA", `${thisYr}-12-31`, null],
      ["1963-09-01 is untouched", "1963-09-01", "dobA", "1963-09-01", null],
      ["1963-06 (wizard shape) is untouched", "1963-06", "dobA", "1963-06", null],
      ["'abc' is removed", "abc", "dobA", undefined, /Birth date \(first person\): "abc" could not be read and was removed/],
      ["the old object shape is removed", { year: "abc" }, "dobA", undefined, /Birth date \(first person\).*could not be read/],
      ["second person: 9999-03-01 clamps", "9999-03-01", "dobB", `${thisYr}-03-01`, /Birth year \(second person\)/],
    ];
    for (const [label, input, key, want, note] of cases) {
      const P = run(input, key);
      const got = P[key];
      const notes = P._importAdjusted;
      T(`Y-1 ${label}: stored ${J(want)}`, got === want, `got ${J(got)}`);
      T(`Y-2 ${label}: ${note ? "reported" : "not reported"}`, note ? (Array.isArray(notes) && notes.length === 1 && note.test(notes[0])) : notes === null, J(notes));
    }
    run("9999-01-01");
    T("Y-3: the timeline no longer sees year 9999", G.PLAN_TIMELINE().dobA.year === thisYr, J(G.PLAN_TIMELINE().dobA));
    const bd = run("abc");
    T("Y-4: an unreadable date falls back exactly as v5.71 did (the prompt, or the default)", bd.dobA === undefined && G.PLAN_TIMELINE().dobA && Number.isFinite(G.PLAN_TIMELINE().dobA.year));
  }
}

// ═══ N · BOUNDS (H-5 / D-4), unit level — every list at the cap and one over ═════════════════
if (POST_FIX) {
  const R = IC.MAX_ROWS;
  T("N-0: the caps are the measured ones (500 rows, 5 MB)", R === 500 && IC.MAX_BYTES === 5 * 1024 * 1024, `${R} / ${IC.MAX_BYTES}`);
  const rows = (n) => Array.from({ length: n }, () => ({}));
  for (const [nm, mk] of [
    ["positions", n => ({ portfolio: { positions: rows(n) } })],
    ["otherAccounts", n => ({ portfolio: { otherAccounts: rows(n) } })],
    ["incomeStreams", n => ({ portfolio: { incomeStreams: rows(n) } })],
    ["expenses", n => ({ portfolio: {}, expenses: rows(n) })],
  ]) {
    T(`N-1 ${nm}: ${R} rows is within the cap`, G.checkImportBounds(mk(R)) === false);
    T(`N-2 ${nm}: ${R + 1} rows is over it`, G.checkImportBounds(mk(R + 1)) === true);
  }
} else {
  T("N-0 [PIN v571]: no bound exists", G.checkImportBounds === undefined);
}

// DOM groups are appended below.
domPhase = true;
// T38_SKIP_DOM=1 is for qa/tools/controls_v572_import.py ONLY — module-level controls do not need four
// minutes of DOM. A run with it set says so on its summary line, so it can never pass for the suite.
if (!process.env.T38_SKIP_DOM) await runDom();
finished = true;
console.log(`t38 SUITE: ${pass} passed, ${fail} failed${process.env.T38_SKIP_DOM ? " (DOM SKIPPED — NOT A SUITE RUN)" : ""}`);
process.exit(fail ? 1 : 0);

// ════════════════════════════════════════════════════════════════════════════════════════════
// DOM GROUPS — the real handlers, the real storage contract, the real render.
// ════════════════════════════════════════════════════════════════════════════════════════════
async function runDom() {
  const body = () => window.document.body;
  const text = () => body().textContent || "";
  const btn = (re) => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const tabs = () => body().querySelectorAll("button.tab").length;
  const stored = (k) => window.localStorage.getItem(PREFIX + k);
  const storeRaw = (k, v) => window.localStorage.setItem(PREFIX + k, v);
  const allStored = () => { const o = {}; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); o[k] = window.localStorage.getItem(k); } return J(o); };
  let root, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); };
  const mount = async () => {
    await unmount();
    el = window.document.createElement("div"); body().appendChild(el);
    ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
    for (let i = 0; i < 4; i++) await flush();
    await flush(300);
  };
  const importFile = async (payload, size) => {
    const inp = [...body().querySelectorAll('input[type="file"]')].find(i => /json/.test(i.getAttribute("accept") || ""));
    if (!inp) return false;
    const file = new window.File([payload], "backup.json", { type: "application/json" });
    if (size != null) Object.defineProperty(file, "size", { value: size });
    Object.defineProperty(inp, "files", { value: [file], configurable: true });
    try { await act(async () => { inp.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
    for (let i = 0; i < 8; i++) await flush();
    await flush(600);
    return true;
  };
  const errShown = () => { const n = body().querySelector("[data-dc-import-err]"); return n ? n.textContent : ""; };
  const pageText = () => text();
  const RAW = /Cannot read|undefined|TypeError|Restore failed/;
  // WHICH skin is selected. Since skinVars falls back safely, a leaked inherited name RENDERS — so a
  // render check alone cannot witness a gate. The theme picker marks the selected skin with
  // background var(--ring); after a hostile name exactly ONE option (the default) must be selected.
  // A gate that lets "constructor" through leaves NONE selected. This is what gives each of the three
  // gates its own negative control.
  // The picker lives on the tab labelled "skins" (DangerCloseMain's tab list). Opened by name: an
  // earlier draft searched all 26 tabs on every case and ran the harness out of heap.
  const selectedSkins = async () => {
    if (!(await click(tabBtn("skins")))) return -1;
    if (!text().includes("Skins \u2014 display theme")) return -2;
    return [...body().querySelectorAll("button")].filter(b => b.style && b.style.background === "var(--ring)" && b.style.flexDirection === "column").length;
  };

  // A known plan, stored the way the app stores one.
  const PLAN = clone(G.PORTFOLIO()); PLAN.nameA = "Stored Plan"; PLAN._incomeFromForm = true; delete PLAN._importAdjusted;
  const EXP = clone(G.EXPENSES());
  const seed = () => {
    window.localStorage.clear();
    storeRaw(K.portfolio, J(PLAN)); storeRaw(K.expenses, J(EXP)); storeRaw(K.meta, J({ loadedAt: "t38" }));
  };
  const backup = (o) => J(Object.assign({ app: "DangerClose", version: 5, exportedAt: "t38" }, o));
  const mkP = (over) => Object.assign(clone(PLAN), { nameA: "IMPORTED" }, over);

  // ── L · PAGE LOAD with a stored plan the app cannot use (H-1; the scope's source-traced claim, RUN) ──
  // FIRST, while memory still holds the module defaults.
  {
    const defaultsJ = J(G.PORTFOLIO());
    window.localStorage.clear();
    const corrupt = J(mkP({ positions: [null] }));
    storeRaw(K.portfolio, corrupt); storeRaw(K.expenses, J(EXP));
    const before = allStored();
    await mount();
    T("L-0: the landing screen is shown (a stored plan that cannot be applied is not 'found')", tabs() === 0 && /start fresh/i.test(pageText()), `tabs=${tabs()}`);
    if (POST_FIX) {
      T("L-1: memory is still the defaults, not the rejected plan", J(G.PORTFOLIO()) === defaultsJ, G.PORTFOLIO() && G.PORTFOLIO().nameA);
      T("L-2: the landing screen says why, in plain words", !!body().querySelector("[data-dc-loader-notice]") && pageText().includes(IC.UNREADABLE));
    } else {
      T("L-1 [KNOWN DEFECT pre-v5.72]: memory holds the rejected plan", G.PORTFOLIO() && G.PORTFOLIO().nameA === "IMPORTED", G.PORTFOLIO() && G.PORTFOLIO().nameA);
      T("L-2 [KNOWN DEFECT pre-v5.72]: the landing screen gives no explanation", !/couldn't be loaded/i.test(pageText()));
    }
    T("L-3: nothing in storage was changed by loading", allStored() === before);
    // Start Fresh must ask before it overwrites the stored (unreadable) plan.
    confirmCalls = 0; confirmAnswer = false;
    await click(btn(/start fresh/i));
    if (POST_FIX) T("L-4: Start Fresh asks before overwriting it, and 'No' keeps it", confirmCalls === 1 && stored(K.portfolio) === corrupt, `confirm=${confirmCalls}`);
    else T("L-4 [KNOWN DEFECT pre-v5.72]: Start Fresh overwrites it without asking", confirmCalls === 0 && stored(K.portfolio) !== corrupt, `confirm=${confirmCalls}`);
    confirmAnswer = true;
    // unparseable JSON takes the same route
    window.localStorage.clear(); storeRaw(K.portfolio, "{not json");
    await mount();
    T("L-5: unparseable stored JSON also lands on the landing screen", tabs() === 0);
    if (POST_FIX) T("L-6: …and says why", pageText().includes(IC.UNREADABLE));
  }

  // ── K · PAGE LOAD with a hostile STORED skin name (H-3, the third gate) ──
  for (const nm of ["constructor", "__proto__"]) {
    seed(); storeRaw(K.skin, nm);
    await mount();
    if (POST_FIX) {
      T(`K-1 stored skin ${J(nm)}: the app renders`, tabs() > 0 && !body().querySelector("[data-dc-error-boundary]"), `tabs=${tabs()}`);
      const sel = await selectedSkins();
      T(`K-2 stored skin ${J(nm)}: refused at the page-load gate (exactly one skin selected)`, sel === 1, `selected=${sel}`);
    }
    else if (nm === "constructor") T(`K-1 [KNOWN DEFECT pre-v5.72] stored skin ${J(nm)}: the page is empty`, tabs() === 0 && text().length === 0, `tabs=${tabs()} len=${text().length}`);
  }

  // ── P / I · MY DATA IMPORT (H-1, H-2, H-5) ──
  seed(); await mount();
  await click(tabBtn("my data"));
  T("I-0: My Data is open over the stored plan", tabs() > 0 && G.PORTFOLIO().nameA === "Stored Plan", G.PORTFOLIO().nameA);
  const DRAFT = "danger_close:mydata_draft_v1";
  const REJECT = {
    "portfolio is a string": [backup({ portfolio: "x", expenses: EXP }), IC.FAIL],
    "positions: [null]": [backup({ portfolio: mkP({ positions: [null] }), expenses: EXP }), IC.FAIL],
    "otherAccounts: [null]": [backup({ portfolio: mkP({ otherAccounts: [null] }), expenses: EXP }), IC.FAIL],
    "expenses malformed": [backup({ portfolio: mkP(), expenses: [null, "x", { monthly: "abc" }] }), IC.FAIL],
    "not JSON": ["{nope", IC.NOT_BACKUP],
    "positions one over the cap": [backup({ portfolio: mkP({ positions: Array.from({ length: 501 }, () => clone(PLAN.positions[0] || {})) }), expenses: EXP }), IC.TOO_LARGE],
  };
  for (const [name, [payload, msg]] of Object.entries(REJECT)) {
    storeRaw(DRAFT, J({ savedAt: "t38", marker: name }));
    const before = allStored(), memJ = J(G.PORTFOLIO()), mem = G.PORTFOLIO();
    consoleErrors.length = 0;
    await importFile(payload);
    const shown = errShown() || (text().match(/Couldn't read that file[^.]*/) || [""])[0];
    if (POST_FIX) {
      T(`I-1 ${name}: storage byte-identical`, allStored() === before);
      T(`I-2 ${name}: memory is the prior plan`, G.PORTFOLIO() === mem && J(G.PORTFOLIO()) === memJ, G.PORTFOLIO() && G.PORTFOLIO().nameA);
      T(`I-3 ${name}: the plain message is shown`, shown === "\u26a0 " + msg, shown);
      T(`I-4 ${name}: no raw engine error on the page, no unobserved rejection`, !RAW.test(shown) && !consoleErrors.some(m => /unhandledRejection/.test(m)), consoleErrors.join(" | "));
      T(`I-5 ${name}: an unsaved draft survives a rejected import`, stored(DRAFT) !== null);
    } else if (name === "not JSON") {
      T(`I-3 [PIN v571] ${name}: the old parse message is shown`, /Couldn't read that file/.test(shown), shown);
    } else if (name === "positions one over the cap") {
      T(`I-1 [KNOWN DEFECT pre-v5.72] ${name}: nothing bounds it — the file is imported`, stored(K.portfolio) !== JSON.parse(before)[PREFIX + K.portfolio] && G.PORTFOLIO().nameA === "IMPORTED", G.PORTFOLIO().nameA);
      // put the known plan back for the next case
      seed(); await mount(); await click(tabBtn("my data"));
    } else {
      T(`I-2 [KNOWN DEFECT pre-v5.72] ${name}: memory was replaced`, G.PORTFOLIO() !== mem || J(G.PORTFOLIO()) !== memJ);
      T(`I-3 [KNOWN DEFECT pre-v5.72] ${name}: no message at all`, shown === "", shown);
      T(`I-4 [KNOWN DEFECT pre-v5.72] ${name}: the failure is an unobserved rejection`, consoleErrors.some(m => /unhandledRejection/.test(m)), consoleErrors.join(" | ").slice(0, 200));
      T(`I-5 [KNOWN DEFECT pre-v5.72] ${name}: the unsaved draft was dropped anyway`, stored(DRAFT) === null);
      seed(); await mount(); await click(tabBtn("my data"));
    }
  }
  // file size, refused before it is read
  if (POST_FIX) {
    const before = allStored();
    await importFile(backup({ portfolio: mkP(), expenses: EXP }), IC.MAX_BYTES + 1);
    T("I-6: a file one byte over 5 MB is refused, storage unchanged", errShown() === "\u26a0 " + IC.TOO_LARGE && allStored() === before, errShown());
  }
  // P · the POSITIVE CONTROL — without it every rejection above passes on a broken importer.
  {
    window.localStorage.removeItem(PREFIX + DRAFT);
    storeRaw(DRAFT, J({ savedAt: "t38" }));
    await importFile(backup({ portfolio: mkP(), expenses: EXP }));
    T("P-1: a valid backup imports on My Data (memory)", G.PORTFOLIO().nameA === "IMPORTED", G.PORTFOLIO().nameA);
    T("P-2: …and is stored", JSON.parse(stored(K.portfolio) || "{}").nameA === "IMPORTED");
    T("P-3: …and the app still renders", tabs() > 0);
    T("P-4: …and the draft is dropped (t37 IM-1's contract, kept)", stored(DRAFT) === null);
  }
  // N-3 · exactly AT the cap imports (§B2: only the pin at the boundary discriminates)
  if (POST_FIX) {
    await click(tabBtn("my data"));
    await importFile(backup({ portfolio: mkP({ nameA: "AT CAP", positions: Array.from({ length: IC.MAX_ROWS }, () => clone(PLAN.positions[0] || {})) }), expenses: EXP }));
    T("N-3: a file with exactly 500 holdings imports", G.PORTFOLIO().nameA === "AT CAP" && G.PORTFOLIO().positions.length === IC.MAX_ROWS, G.PORTFOLIO().nameA);
  }
  // A · the adjustment notice is SHOWN (D-5)
  if (POST_FIX) {
    seed(); await mount(); await click(tabBtn("my data"));
    await importFile(backup({ portfolio: mkP({ nameA: "ADJUSTED", retireYear: 99999 }), expenses: EXP }));
    await click(tabBtn("my data"));
    const n = body().querySelector("[data-dc-import-adjusted]");
    T("A-1: after an import that adjusted a value, My Data says so and names it", !!n && /Retirement year/.test(n.textContent), n && n.textContent.slice(0, 120));
  }
  // S-8 · the witness's own positive control: importing a REAL non-default skin selects it (and only it).
  if (POST_FIX) {
    const real = Object.keys(G.SKINS()).find(k => k !== "default");
    seed(); await mount(); await click(tabBtn("my data"));
    await importFile(backup({ portfolio: mkP({ nameA: "REAL SKIN" }), expenses: EXP, skin: real }));
    const sel = await selectedSkins();
    const on = [...body().querySelectorAll("button")].filter(b => b.style && b.style.background === "var(--ring)" && b.style.flexDirection === "column");
    T(`S-8: importing the real skin ${J(real)} selects exactly one option, and not the default`, sel === 1 && on.length === 1 && !/tactical green/i.test(on[0].textContent), `selected=${sel} ${on[0] && on[0].textContent.slice(0, 40)}`);
  }
  // S · every inherited skin name through the My Data gate
  for (const nm of INHERITED) {
    seed(); await mount(); await click(tabBtn("my data"));
    await importFile(backup({ portfolio: mkP({ nameA: "SKIN " + nm }), expenses: EXP, skin: nm }));
    if (POST_FIX) {
      T(`S-6 My Data import with skin ${J(nm)}: the app renders`, tabs() > 0 && G.PORTFOLIO().nameA === "SKIN " + nm && !body().querySelector("[data-dc-error-boundary]"), `tabs=${tabs()}`);
      const sel = await selectedSkins();
      T(`S-7 My Data import with skin ${J(nm)}: refused at the import gate (exactly one skin selected)`, sel === 1, `selected=${sel}`);
    }
    else if (nm !== "__proto__") T(`S-6 [KNOWN DEFECT pre-v5.72] My Data import with skin ${J(nm)}: the page is empty`, tabs() === 0, `tabs=${tabs()}`);
  }

  // ── R · LANDING RESTORE (H-1, H-2, H-5) ──
  const landingErr = () => { const m = text().match(/ERROR: [^⚠]*?(?=Start|START|$)/); return m ? m[0] : ""; };
  for (const [name, [payload, msg]] of Object.entries(REJECT)) {
    if (name === "positions one over the cap" && !POST_FIX) continue; // pinned on My Data; imports here too
    window.localStorage.clear();
    await mount();
    const memJ = J(G.PORTFOLIO());
    await importFile(payload);
    const shown = landingErr();
    if (POST_FIX) {
      T(`R-1 ${name}: nothing stored`, window.localStorage.length === 0, allStored().slice(0, 120));
      T(`R-2 ${name}: memory unchanged`, J(G.PORTFOLIO()) === memJ);
      T(`R-3 ${name}: the same plain message as My Data`, shown.includes(msg) && !RAW.test(shown), shown);
    } else if (name !== "not JSON") {
      T(`R-2 [KNOWN DEFECT pre-v5.72] ${name}: memory was replaced`, J(G.PORTFOLIO()) !== memJ);
      T(`R-3 [KNOWN DEFECT pre-v5.72] ${name}: a raw engine error is shown`, /Restore failed/.test(shown), shown);
    }
  }
  {
    window.localStorage.clear(); await mount();
    await importFile(backup({ portfolio: mkP({ nameA: "LANDED" }), expenses: EXP }));
    T("R-4: POSITIVE CONTROL — a valid backup restores from the landing screen", G.PORTFOLIO().nameA === "LANDED" && tabs() > 0 && JSON.parse(stored(K.portfolio) || "{}").nameA === "LANDED", `tabs=${tabs()}`);
  }
  for (const nm of ["constructor", "toString"]) {
    window.localStorage.clear(); await mount();
    await importFile(backup({ portfolio: mkP({ nameA: "LSKIN" }), expenses: EXP, skin: nm }));
    if (POST_FIX) {
      T(`R-5 landing restore with skin ${J(nm)}: the app renders`, tabs() > 0 && !body().querySelector("[data-dc-error-boundary]"), `tabs=${tabs()}`);
      const sel = await selectedSkins();
      T(`R-7 landing restore with skin ${J(nm)}: refused at the restore gate (exactly one skin selected)`, sel === 1, `selected=${sel}`);
    }
    else T(`R-5 [KNOWN DEFECT pre-v5.72] landing restore with skin ${J(nm)}: the page is empty`, tabs() === 0 && text().length === 0, `tabs=${tabs()}`);
  }
  if (POST_FIX) {
    window.localStorage.clear(); await mount();
    await importFile(backup({ portfolio: mkP() }), IC.MAX_BYTES + 1);
    T("R-6: a file over 5 MB is refused on the landing screen too", landingErr().includes(IC.TOO_LARGE) && window.localStorage.length === 0, landingErr());
  }

  // ── B · THE ERROR BOUNDARY (H-4 / D-3) ──
  {
    seed(); await mount();
    T("B-0: setup — the app is up", tabs() > 0);
    const before = allStored();
    consoleErrors.length = 0;
    // Break the live plan behind the app's back (no validator in the way), then force a re-render.
    G.PORTFOLIO().positions = [null];
    G.PORTFOLIO().otherAccounts = [null];
    await click(tabBtn("my data"));
    await click(tabBtn("dashboard") || [...body().querySelectorAll("button.tab")][0]);
    const fb = body().querySelector("[data-dc-error-boundary]");
    const boomSeen = consoleErrors.some(m => /Cannot read|null/.test(m));
    T("B-1: setup — the forced render error really happened (the harness still sees it)", boomSeen, consoleErrors.slice(0, 2).join(" | "));
    if (POST_FIX) {
      T("B-2: the fallback is shown instead of a blank page", !!fb && text().length > 0);
      T("B-3: it offers Reload", !!fb && [...fb.querySelectorAll("button")].some(b => /^reload$/i.test(b.textContent.trim())));
      T("B-4: it offers nothing that clears, resets or deletes data", !!fb && ![...fb.querySelectorAll("button")].some(b => /clear|delete|reset|erase|start fresh/i.test(b.textContent)));
      T("B-5: storage untouched by the failure", allStored() === before);
      const clicked = fb ? await click([...fb.querySelectorAll("button")].find(b => /reload/i.test(b.textContent))) : false;
      T("B-6: pressing Reload touches no data (the navigation itself is not observable in jsdom)", clicked && allStored() === before);
      T("B-7: a render failure is NOT reported as a working app (no tabs)", tabs() === 0);
    } else {
      T("B-2 [KNOWN DEFECT pre-v5.72]: no fallback — the page is blank", !fb && text().length === 0, `len=${text().length}`);
    }
  }
  await unmount();
}
