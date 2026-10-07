// t56 — PLAN TYPE AND PENSION OWNER: COLLECTED, NOT READ (D-12 Phase 1; docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md; added for v5.91).
// Runs on BOTH legs:   node t56_plan_type_collect.mjs v590   |   node t56_plan_type_collect.mjs v591
//
// WHAT IT PINS. v5.91 adds two stored fields and reads neither:
//   · planType ("ira" | "employer") on every row holding TRADITIONAL dollars (a holding with trad > 0; an Other account whose
//     taxType is "trad"). Missing or unrecognised -> "ira" (D12-B, conservative). Absent on every other row.
//   · incomeSources.pension.owner ("A" | "B"). Missing or unrecognised -> "A" (D12-C); a single filer's is always "A".
//
// ⚠ THE EXTINCTION INVARIANT OF THIS RELEASE IS GROUP F: UNTIL v5.93, NO FIGURE DEPENDS ON EITHER FIELD. Every engine output —
//   withdrawal schedule, tax rows (federal AND state), IRMAA rows, a seeded Monte Carlo median — is compared AS A WHOLE (JSON),
//   all-"ira" against all-"employer" against pension owner "B" against the fields stripped, in three states including the two
//   (RI, PA) whose law the fields exist for. F-0 is the positive control: the state really moves the figures, so equality is
//   not vacuous. Group F runs on BOTH legs; on v590 it is also the forward-compatibility check — v5.90 loading a v5.91 backup
//   gives exactly the figures of the same plan without the new fields. When v5.93 starts reading the fields, F's RI/PA rows
//   change BY DESIGN and must be re-gated there, not softened.
//
// ⚠ GROUP R IS THE SAVED-DATA PROMISE (scope §2): a v5.90 plan opened in v5.91 and saved twice is BYTE-IDENTICAL between the two
//   saves. Measured on v5.90 itself before this suite was written: its own load→save cycle is byte-stable from save 1, because
//   the `_`-flags are recomputed on every apply. So the strongest form is asserted, raw, not "equal apart from a timestamp".
//   My Data REBUILDS rows in buildPortfolio, so a field it forgot would be dropped at save. R-5 CANNOT see that for a default:
//   Save & Apply runs the rebuilt object through applyLoadedData's migration IN PLACE before the storage write, which re-adds
//   "ira". Only a USER'S CHOICE is lost, so R-8/R-9 are the witnesses (control C1, v5.91: buildPortfolio's planType removed ->
//   R-8 and R-9 red, R-5 green — measured, not assumed).
//
// ⚠ MONTE CARLO SEEDING TRAP (t42): d3 captures Math.random when it loads, so the seeded source is installed BEFORE the app
//   module is imported, and F-00 asserts the harness is deterministic before any comparison is trusted.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const VER = process.argv[2];
const KNOWN_VERSIONS = ["v590", "v591", "v593", "v594"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.\n    Registered: ${KNOWN_VERSIONS.join(", ")}`);
  process.exit(1);
}
const POST = ["v591", "v593", "v594"].includes(VER); // D-12 Phase 1 shipped at v5.91

const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(1); Math.random = () => _src();
const mod = await import(`./app_${VER}.mjs`);
const G = mod.__g, E = mod.__engines;

let pass = 0, fail = 0, finished = false;
const T = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log(`  \u2717 ${name}${detail ? " \u2014 " + String(detail).slice(0, 260) : ""}`); } };
const PIN = (id, what) => POST ? `${id}: ${what}` : `${id} [ABSENT pre-v5.91]`;
process.on("exit", () => { if (!finished) { console.log(`t56 SUITE: ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t56 \u2014 PLAN TYPE AND PENSION OWNER, COLLECTED NOT READ (${VER})`);

const clone = (x) => JSON.parse(JSON.stringify(x));
const BASE = clone(G.PORTFOLIO());            // the shipped example household, untouched
const strip = (P) => { (P.positions || []).forEach(p => delete p.planType); (P.otherAccounts || []).forEach(a => delete a.planType);
  if (P.incomeSources && P.incomeSources.pension) delete P.incomeSources.pension.owner; return P; };
const OLD = strip(clone(BASE));               // what a v5.90 backup of the same household holds
const load = (P) => { G.applyLoadedData({ portfolio: clone(P) }); return G.PORTFOLIO(); };
const tradPos = (P) => P.positions.filter(p => (Number(p.trad) || 0) > 0);
const tradOth = (P) => P.otherAccounts.filter(a => a.taxType === "trad");

// ═══ M · migration (applyLoadedData, no DOM) ═══
{
  const L = load(OLD);
  T(PIN("M-1", "every holding with Traditional dollars gets planType \"ira\""), POST ? tradPos(L).length === 5 && tradPos(L).every(p => p.planType === "ira") : tradPos(L).every(p => p.planType === undefined),
    tradPos(L).map(p => p.planType).join(","));
  T(PIN("M-2", "every Traditional Other account gets planType \"ira\""), POST ? tradOth(L).length === 3 && tradOth(L).every(a => a.planType === "ira") : tradOth(L).every(a => a.planType === undefined),
    tradOth(L).map(a => a.planType).join(","));
  T("M-3: no non-Traditional Other account carries a plan type (both legs)", L.otherAccounts.filter(a => a.taxType !== "trad").every(a => !("planType" in a)));
  T(PIN("M-4", "the pension's owner defaults to \"A\""), POST ? L.incomeSources.pension.owner === "A" : L.incomeSources.pension.owner === undefined, L.incomeSources.pension.owner);
  const MG = L._planTypeMigrated;
  T(PIN("M-5", "the review notice lists the 8 defaulted rows and the pension"), POST ? !!MG && MG.rows.length === 8 && MG.pension === true : MG === undefined, JSON.stringify(MG));
  T(PIN("M-6", "a NAME is not read: \"Rollover IRA (A)\" and \"Spouse B - State Plan\" both get \"ira\""),
    POST ? L.otherAccounts.find(a => a.name === "Spouse B - State Plan").planType === "ira" : true);
  T("M-7: the loader still leaves names, balances and owners as they were (both legs)",
    JSON.stringify(L.positions.map(p => [p.ticker, p.balance, p.trad, p.roth, p.owner])) === JSON.stringify(BASE.positions.map(p => [p.ticker, p.balance, p.trad, p.roth, p.owner])));
}
{ // the sample household itself carries explicit values and raises no notice
  const L = load(BASE);
  T(PIN("M-8", "the example household needs no back-fill (explicit values, no notice)"), POST ? L._planTypeMigrated === null && tradPos(L).every(p => p.planType === "ira") : true, JSON.stringify(L._planTypeMigrated));
}
{ // malformed values: replaced, never a throw (t38's hardening extended)
  const P = clone(BASE); let threw = null;
  ["x", 42, "401k", null, {}, "IRA"].slice(1).forEach((v, i) => { P.positions[i].planType = v; });
  P.otherAccounts[0].planType = "employer"; P.incomeSources.pension.owner = 7;
  let L; try { L = load(P); } catch (e) { threw = e.message; }
  T("M-9: malformed plan types and owner do not throw (both legs)", threw === null, threw);
  if (L) {
    T(PIN("M-10", "42 / \"401k\" / null / {} / \"IRA\" all become \"ira\""), POST ? L.positions.every(p => p.planType === "ira") : true, L.positions.map(p => JSON.stringify(p.planType)).join(","));
    T(PIN("M-11", "a valid \"employer\" is kept"), POST ? L.otherAccounts[0].planType === "employer" : true, L.otherAccounts[0].planType);
    T(PIN("M-12", "pension owner 7 becomes \"A\""), POST ? L.incomeSources.pension.owner === "A" : true, L.incomeSources.pension.owner);
    T(PIN("M-13", "the notice lists exactly the five replaced holdings, and the pension"), POST ? L._planTypeMigrated && L._planTypeMigrated.rows.length === 5 && L._planTypeMigrated.pension === true : true,
      JSON.stringify(L._planTypeMigrated));
  }
}
{ // stray values on rows with no Traditional dollars are removed, silently
  const P = clone(BASE);
  P.positions.push({ ticker: "RT", name: "Roth only", balance: 1000, bucket: 3, type: "equity-lb", owner: "A", roth: 1000, trad: 0, er: 0.03, planType: "employer" });
  P.otherAccounts.find(a => a.taxType === "taxable").planType = "ira";
  const L = load(P);
  T(PIN("M-14", "a plan type on a Roth-only holding is removed"), POST ? !("planType" in L.positions.find(p => p.ticker === "RT")) : true);
  T(PIN("M-15", "a plan type on a Taxable account is removed"), POST ? L.otherAccounts.filter(a => a.taxType === "taxable").every(a => !("planType" in a)) : true);
  T(PIN("M-16", "removing a stray value raises no notice"), POST ? L._planTypeMigrated === null : true, JSON.stringify(L._planTypeMigrated));
}
{ // pension owner rules
  let P = clone(BASE); P.incomeSources.pension.owner = "B"; let L = load(P);
  T(PIN("M-17", "a couple's pension owner \"B\" is kept"), POST ? L.incomeSources.pension.owner === "B" && L._planTypeMigrated === null : true, L.incomeSources.pension.owner);
  P = clone(BASE); P.single = true; P.incomeSources.pension.owner = "B"; L = load(P);
  T(PIN("M-18", "a single filer's pension owner is always \"A\", without a notice"), POST ? L.incomeSources.pension.owner === "A" && L._planTypeMigrated === null : true, JSON.stringify([L.incomeSources.pension.owner, L._planTypeMigrated]));
  P = clone(OLD); P.incomeSources.pension.amount = 0; P.positions.forEach(p => { p.planType = "ira"; }); tradOthSet(P); L = load(P);
  T(PIN("M-19", "a $0 pension gets owner \"A\" without a notice"), POST ? L.incomeSources.pension.owner === "A" && L._planTypeMigrated === null : true, JSON.stringify(L._planTypeMigrated));
  P = clone(OLD); delete P.incomeSources.pension; let threw = null; try { load(P); } catch (e) { threw = e.message; }
  T("M-20: a plan with no pension block loads without a throw (both legs)", threw === null, threw);
}
function tradOthSet(P) { P.otherAccounts.forEach(a => { if (a.taxType === "trad") a.planType = "ira"; }); }

// ═══ F · collected, not read: NO figure depends on either field (both legs) ═══
{
  const RY = load(BASE) && G.PLAN_TIMELINE().targetRetireYear;
  const A = { retireYear: RY, rothAmount: 70000, qcdAnnual: 0, taxYield: 0, scenarioPreset: "base" };
  const figs = (P) => {
    load(P);
    const D = G.computeWithdrawalPlan(A).schedule, S = G.withdrawalPlanSeries(A);
    const B = E.computeTaxPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows;
    const C = E.computeIrmaaPlan({ ...A, gainByYr: S.gainByYr, ordDrawByYr: S.ordDrawByYr }).rows || [];
    _src = mulberry(2026); const arr = G.runMonteCarlo(RY, 300).results;
    const med = Math.round(arr.map(x => x[x.length - 1]).sort((a, b) => a - b)[arr.length >> 1]);
    return JSON.stringify({ D, B, C, med });
  };
  const inState = (P, code) => { const Q = clone(P); if (code) { Q.stateCode = code; Q._stateFromForm = true; } return Q; };
  const EMP = clone(BASE); tradPos(EMP).forEach(p => { p.planType = "employer"; }); tradOth(EMP).forEach(a => { a.planType = "employer"; });
  const PENB = clone(BASE); PENB.incomeSources.pension.owner = "B";
  const ALLB = clone(EMP); ALLB.incomeSources.pension.owner = "B";
  T("F-00: the harness is deterministic (same plan twice -> same JSON)", figs(BASE) === figs(BASE));
  T("F-0: positive control — Rhode Island's figures differ from Pennsylvania's", figs(inState(BASE, "RI")) !== figs(inState(BASE, "PA")));
  for (const code of [null, "RI", "PA"]) {
    const ref = figs(inState(BASE, code)), tag = code || "plan's own state";
    T(`F-1 ${tag}: all plan types "employer" changes no figure`, figs(inState(EMP, code)) === ref);
    T(`F-2 ${tag}: pension owner "B" changes no figure`, figs(inState(PENB, code)) === ref);
    T(`F-3 ${tag}: both together change no figure`, figs(inState(ALLB, code)) === ref);
    T(`F-4 ${tag}: the fields stripped (a v5.90 backup) changes no figure`, figs(inState(OLD, code)) === ref);
  }
}

// ═══ R · My Data round-trip in the DOM ═══
{
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
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const btn = (re) => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  const text = () => body().textContent || "";
  let root, act, DangerClose, el;
  const mountFresh = () => { el = window.document.createElement("div"); body().appendChild(el); return window.__mount(el); };
  const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const render = async () => { ({ root, act, DangerClose } = mountFresh()); try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush(); };
  const revisit = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} await render(); const t = tabBtn("my data"); if (t) { await click(t); await flush(); } };
  const save = async () => { await click(btn(/SAVE\s*&\s*APPLY/)); await flush(); await flush(); return window.localStorage.getItem(PREFIX + K.portfolio); };
  const NOTICE = "PLAN TYPE AND PENSION OWNER ARE NEW";
  const planSels = () => [...body().querySelectorAll("select")].filter(s => [...s.options].some(o => o.value === "employer"));
  const penSel = () => body().querySelector('select[aria-label="Whose pension"]');

  window.localStorage.clear(); await render();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush(); await click(tabBtn("my data")); await flush();
  T("R-0: harness reached My Data with the example household", /RETIREMENT HOLDINGS/.test(text()));
  T("R-1: the example household shows no plan-type notice (both legs)", !text().includes(NOTICE));
  // 5 holdings (Traditional or Mixed) + 3 Traditional Other accounts
  T(PIN("R-2", "a plan-type selector on each of the 8 rows holding Traditional money, and nowhere else"), POST ? planSels().length === 8 : planSels().length === 0, `found ${planSels().length}`);
  T(PIN("R-2b", "the selector's labels are human, sentence case"), POST ? planSels().every(s => [...s.options].map(o => o.textContent).join("|") === "IRA (incl. rollover, SEP, SIMPLE)|Employer plan (401(k), 403(b), 457, TSP)") : true);
  T(PIN("R-2c", "a couple gets a pension-owner selector"), POST ? !!penSel() : !penSel());
  T(PIN("R-2d", "the collected-not-used disclosure is on the page"), POST ? text().includes("change no figure yet") : true);
  const first = await save();

  // a v5.90 backup of the same household, then two saves
  const OLDstored = strip(JSON.parse(first)); delete OLDstored._planTypeMigrated;
  window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(OLDstored));
  await revisit();
  T(PIN("R-3a", "an old plan opens with the review notice"), POST ? text().includes(NOTICE) : !text().includes(NOTICE));
  const S1 = await save();
  await revisit();
  T("R-3b: the notice is gone after the first Save & Apply (both legs)", !text().includes(NOTICE));
  const S2 = await save();
  const P1 = JSON.parse(S1);
  T("R-4: save 1 and save 2 are BYTE-IDENTICAL (both legs)", S1 === S2, `${S1.length} vs ${S2.length}`);
  T(PIN("R-5", "save 1 writes \"ira\" on every row holding Traditional money"),
    POST ? tradPos(P1).length === 5 && tradPos(P1).every(p => p.planType === "ira") && tradOth(P1).length === 3 && tradOth(P1).every(a => a.planType === "ira") : true);
  T("R-6: save 1 writes no plan type on any other row (both legs)", P1.positions.filter(p => !(p.trad > 0)).concat(P1.otherAccounts.filter(a => a.taxType !== "trad")).every(r => !("planType" in r)));
  T(PIN("R-7", "save 1 writes the pension's owner"), POST ? P1.incomeSources.pension.owner === "A" : true, JSON.stringify(P1.incomeSources.pension));

  // a user choice survives: set one row to employer and the pension to B through the UI, save, reopen
  if (POST) {
    const sel = planSels()[0], ps = penSel();
    const choose = async (s, v) => { try { await act(async () => { s.value = v; s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {} await flush(); };
    await choose(sel, "employer"); await choose(ps, "B");
    const S3 = JSON.parse(await save());
    T("R-8: a choice made in My Data is saved (one holding \"employer\", pension \"B\")",
      S3.positions.filter(p => p.planType === "employer").length === 1 && S3.incomeSources.pension.owner === "B", JSON.stringify(S3.incomeSources.pension));
    await revisit();
    T("R-9: and is shown again on reopening", planSels().filter(s => s.value === "employer").length === 1 && penSel() && penSel().value === "B");
  }

  // single household: no one-item pension dropdown (D-5 pattern)
  const SG = JSON.parse(window.localStorage.getItem(PREFIX + K.portfolio)); SG.single = true; SG.nameB = "";
  window.localStorage.setItem(PREFIX + K.portfolio, JSON.stringify(SG));
  await revisit();
  T("R-10: a single household has no pension-owner selector (both legs)", !penSel());
  T("R-11: and no owner selector anywhere offers B (t6's rule, unchanged)", [...body().querySelectorAll("select")].filter(s => [...s.options].some(o => o.value === "A")).every(s => ![...s.options].some(o => o.value === "B")));
}

finished = true;
console.log(`t56 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
