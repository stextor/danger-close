// t66 — D-30 BATCH 1 (THE 27 PROGRESSIVE STATES' DEDUCTIONS, EXEMPTIONS AND PERSONAL CREDITS) AND ASK AI'S CUT-OFF ANSWERS
//       · docs/SCOPE_D30_DEDUCTIONS_V602.md · v6.02
//
// v6.01 taxed every progressive state on its own schedule but took no state's standard deduction, exemption or personal credit (conservative,
// disclosed). v6.02 takes them for the 27 progressive states, each figure read at its primary source on 2026-10-09 (the scope's §0.2), and
// fixes Ask AI's answers being cut off: both routes asked for 1,000 tokens and never read the API's stop reason.
//
// Groups:  A the 27 rows' components, each equal to §0.2 and dated; EXTINCTION: exactly the 27 carry `deduct`, every component well formed,
//            every note names what is taken and what is not
//          B the phase shapes at their edges, through stateDeductions (the evaluator) and the calculator's `_onDetail` seam
//          C hand cases to the cent through stateTaxAnnual (Decimal, session working hand602.py, recorded in the scope's §7)
//          D v6.01 -> v6.02 (v602 leg, needs app_v601.mjs): with `deduct` removed from every row the calculator is byte-identical to v6.01;
//            with it, the 27 equal an independent implementation (qa/d30_ref.mjs) on the calculator's own measures, the other 24 byte-identical
//          E Ask AI: the request's cap on both routes, the cut-off notice, the conversation memory, the timeout, the master prompt, the Field Manual
//          F the display: My Data's model line and dated figures, the AI context line, the Field Manual's state-tax sentences
// BOTH LEGS: the v601 leg pins the absence of `deduct`, the 1,000-token request and the silent cut-off. Run: node t66_deductions_askai.mjs <tag>
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { d30Tax, d30Deductions, D30_STATES } from "./d30_ref.mjs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v601", "v602"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 300) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt66 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t66 — STATE DEDUCTIONS (D-30 BATCH 1) AND ASK AI'S CUT-OFF ANSWERS (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const DD = VER !== "v601";   // a version on which D-30 batch 1 and the Ask AI fix are present
// Self-hosted branch for group E (t36's harness trap: without a `location` the bundle takes the claude.ai branch, which has no key panel).
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" });
globalThis.location = window.location;
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
// The recording fetch: never touches the network. `REPLY` decides the next answer; each request's parsed body is kept.
const calls = []; let REPLY = null;
const recorder = async (input, init) => {
  const url = typeof input === "string" ? input : input && input.url;
  let body = null; try { body = JSON.parse((init && init.body) || "null"); } catch (e) {}
  calls.push({ url, body });
  const r = REPLY ? REPLY(url, body) : { ok: false, status: 405 };
  if (r.throwAbort) { const e = new Error("aborted"); e.name = "AbortError"; throw e; }
  return { ok: r.ok !== false, status: r.status || 200, statusText: r.ok === false ? "Method Not Allowed" : "OK", headers: { get: () => null },
    json: async () => r.json || {}, text: async () => JSON.stringify(r.json || {}) };
};
window.fetch = recorder; globalThis.fetch = recorder;
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g, SR = g.STATE_RULES(), ST = g.stateTaxAnnual, SD = g.stateDeductions;
const pick = (v, single) => (v !== null && typeof v === "object") ? (single ? v.single : v.joint) : v;
const sj = (a, b) => ({ single: a, joint: b });

// ── A · the components, each equal to §0.2 (transcribed here in the app's shape from the sources; t66 D checks the arithmetic separately) ──
const FED = { what: "federal standard deduction", kind: "ded", per: "return", amt: sj(16100, 32200), add: { age: 65, amt: sj(2050, 1650) } };
const P_CA = { on: "agi", shape: "steps", start: sj(252203, 504411), step: 2500, round: "ceil", less: 6, floor: 0 };
const P_RI = { on: "base", shape: "steps", start: 261000, step: 7450, round: "ceil", pct: 0.2 };
const std = (a, b, x = {}) => ({ what: x.what || "standard deduction", kind: "ded", per: "return", amt: b === undefined ? a : sj(a, b), ...(x.add !== undefined ? { add: { age: 65, amt: x.add } } : {}), ...(x.phase ? { phase: x.phase } : {}) });
const cp = (what, kind, per, amt, x = {}) => ({ what, kind, per, ...(x.age !== undefined ? { age: x.age } : {}), amt, ...(x.add ? { add: { age: x.add[0], amt: x.add[1] } } : {}), ...(x.phase ? { phase: x.phase } : {}) });
const CT_E = { single: [[18800, .75], [19300, .7], [19800, .65], [20300, .6], [20800, .55], [21300, .5], [21800, .45], [22300, .4], [25000, .35], [25500, .3], [26000, .25], [26500, .2], [31300, .15], [31800, .14], [32300, .13], [32800, .12], [33300, .11], [60000, .1], [60500, .09], [61000, .08], [61500, .07], [62000, .06], [62500, .05], [63000, .04], [63500, .03], [64000, .02], [64500, .01], [null, 0]],
               joint: [[30000, .75], [30500, .7], [31000, .65], [31500, .6], [32000, .55], [32500, .5], [33000, .45], [33500, .4], [40000, .35], [40500, .3], [41000, .25], [41500, .2], [50000, .15], [50500, .14], [51000, .13], [51500, .12], [52000, .11], [96000, .1], [96500, .09], [97000, .08], [97500, .07], [98000, .06], [98500, .05], [99000, .04], [99500, .03], [100000, .02], [100500, .01], [null, 0]] };
const WANT = {
  AL: [2026, [std(3000, 8500, { phase: { on: "base", shape: "steps", start: 25500, step: 500, round: "floor", less: sj(25, 175), floor: sj(2500, 5000) } }), cp("personal exemption", "ded", "return", sj(1500, 3000))]],
  AR: [2025, [cp("standard deduction", "ded", "person", 2470), cp("personal tax credit", "credit", "person", 29, { add: [65, 29] })]],
  CA: [2025, [std(5706, 11412), cp("personal exemption credit", "credit", "person", 153, { phase: P_CA }), cp("senior exemption credit", "credit", "age", 153, { age: 65, phase: P_CA })]],
  CT: [2026, [cp("personal exemption", "ded", "return", sj(15000, 24000), { phase: { on: "base", shape: "steps", start: sj(30000, 48000), step: 1000, round: "ceil", less: 1000, floor: 0 } }),
              cp("personal tax credit", "pct", "return", 1, { phase: { on: "base", shape: "table", rows: CT_E } })]],
  DC: [2025, [std(15000, 30000, { add: sj(2000, 1600) })]],
  DE: [2026, [std(3250, 6500, { add: 2500 }), cp("personal credit", "credit", "person", 110, { add: [60, 110] })]],
  HI: [2026, [std(8000, 16000), cp("personal exemption", "ded", "person", 1144, { add: [65, 1144] })]],
  KS: [2026, [std(3605, 8240, { add: sj(850, 700) }), cp("exemption", "ded", "return", sj(9160, 18320))]],
  MD: [2025, [std(3350, 6700), cp("personal exemption", "ded", "person", 3200, { phase: { on: "agi", shape: "table", rows: { single: [[100000, 1], [125000, 0.5], [150000, 0.25], [null, 0]], joint: [[150000, 1], [175000, 0.5], [200000, 0.25], [null, 0]] } } }),
              cp("exemption at 65 or older", "ded", "age", 1000, { age: 65 }),
              { what: "senior tax credit", kind: "credit", per: "return", byAge: { age: 65, single: [0, 1000], joint: [0, 1000, 1750] }, phase: { on: "agi", shape: "table", rows: { single: [[50000, 1, "lt"], [100000, 0.5], [null, 0]], joint: [[100000, 1, "lt"], [150000, 0.5], [null, 0]] } } }]],
  ME: [2026, [std(15700, 31400, { add: sj(2050, 1650), phase: { on: "base", shape: "linear", start: sj(102250, 204550), width: sj(75000, 150000), round4: true } }),
              cp("personal exemption", "ded", "person", 5300, { phase: { on: "base", shape: "linear", start: sj(341000, 409150), width: 125000, round4: true } })]],
  MN: [2026, [std(15300, 30600, { add: sj(2000, 1600), phase: { on: "agi", shape: "tiers", tiers: [[244400, 0.03, 337800], [337800, 0.1, null]], cap: 0.8 } })]],
  MO: [2026, [FED]], MT: [2026, [FED]], ND: [2026, [FED]],
  MS: [2026, [std(2300, 4600), cp("exemption", "ded", "return", sj(6000, 12000), { add: [65, 1500] })]],
  NE: [2026, [std(8850, 17700, { add: sj(2050, 1700) }), cp("personal exemption credit", "credit", "person", 176)]],
  NJ: [2026, [cp("personal exemption", "ded", "person", 1000, { add: [65, 1000] })]],
  NM: [2026, [FED, cp("low- and middle-income exemption", "ded", "person", 2500, { phase: { on: "agi", shape: "rate", start: sj(20000, 30000), rate: sj(0.15, 0.1), floor: 0 } })]],
  NY: [2026, [std(8000, 16050)]],
  OK: [2026, [std(6350, 12700), cp("personal exemption", "ded", "person", 1000), cp("additional exemption at 65 or older", "ded", "age", 1000, { age: 65, phase: { on: "agi", shape: "cliff", thr: sj(15000, 25000) } })]],
  OR: [2025, [std(2835, 5670, { add: sj(1200, 1000) }), cp("personal exemption credit", "credit", "person", 256, { phase: { on: "agi", shape: "cliff", thr: sj(100000, 200000) } })]],
  RI: [2026, [std(11200, 22400, { phase: P_RI }), cp("personal exemption", "ded", "person", 5250, { phase: P_RI })]],
  SC: [2026, [std(15000, 30000, { what: "SC Income Adjusted Deduction", phase: { on: "agi", shape: "linear", start: sj(40000, 80000), width: sj(55000, 110000), roundDown: 10 } })]],
  VA: [2026, [std(8750, 17500), cp("personal exemption", "ded", "person", 930, { add: [65, 800] })]],
  VT: [2025, [std(7650, 15300, { add: 1250 }), cp("personal exemption", "ded", "person", 5300)]],
  WI: [2026, [std(13960, 25840, { phase: { on: "base", shape: "rate", start: sj(20120, 29040), rate: sj(0.12, 0.19778), floor: 0 } }), cp("personal exemption", "ded", "person", 700, { add: [65, 250] })]],
  WV: [2026, [cp("personal exemption", "ded", "person", 2000)]],
};
const withD = Object.keys(SR).filter(c => SR[c].deduct !== undefined).sort();
const progressive = Object.keys(SR).filter(c => SR[c].brackets).sort();
if (DD) {
  CK(`A-1 EXTINCTION: exactly the 27 progressive states carry \`deduct\` (${withD.length}), and they are the rows on their own schedules`,
     withD.join(",") === Object.keys(WANT).sort().join(",") && withD.join(",") === progressive.join(",") && D30_STATES.slice().sort().join(",") === withD.join(","), withD.join(","));
  for (const c of Object.keys(WANT)) {
    const [yr, comps] = WANT[c];
    CK(`A-2 ${c}: the components equal §0.2 (${comps.map(x => x.what).join(" · ")})`, JSON.stringify(SR[c].deduct) === JSON.stringify(comps),
       JSON.stringify(SR[c].deduct).slice(0, 260));
    CK(`A-3 ${c}: dated — years.deduct ${yr}${yr === 2025 ? " (2026 unpublished at the build: the latest published, held — DD-8)" : ""}`, SR[c].years && SR[c].years.deduct === yr, JSON.stringify(SR[c].years));
  }
  // EXTINCTION: every component well formed — a known kind, unit and shape; nonnegative amounts; `less` / `rate` only where the unit amount is the whole
  const SHAPES = ["steps", "linear", "rate", "tiers", "table", "cliff"];
  const nonneg = v => v === undefined || (typeof v === "number" && v >= 0) || (v && typeof v === "object" && v.single >= 0 && v.joint >= 0);
  const bad = [];
  for (const c of withD) for (const x of SR[c].deduct) {
    const why = [];
    if (!["ded", "credit", "pct"].includes(x.kind)) why.push("kind");
    if (!["return", "person", "age"].includes(x.per)) why.push("per");
    if (x.age !== undefined && x.per !== "age") why.push("age without per age");
    if (x.byAge ? x.amt !== undefined : !nonneg(x.amt) || x.amt === undefined) why.push("amt");
    if (x.add && (!nonneg(x.add.amt) || typeof x.add.age !== "number")) why.push("add");
    if (typeof x.what !== "string" || !x.what) why.push("what");
    const p = x.phase;
    if (p) {
      if (!SHAPES.includes(p.shape)) why.push("shape " + p.shape);
      if (!["base", "agi"].includes(p.on)) why.push("on");
      if ((p.shape === "rate" || (p.shape === "steps" && p.less !== undefined)) && (x.add || x.byAge)) why.push("per-unit shape on a mixed amount");
      if (p.shape === "steps" && !((p.less !== undefined) !== (p.pct !== undefined))) why.push("steps needs exactly one of less / pct");
      if (p.shape === "table") for (const k of ["single", "joint"]) { const rows = p.rows[k]; if (!rows || rows[rows.length - 1][0] !== null || rows.some((r, i) => i && r[0] !== null && r[0] <= rows[i - 1][0])) why.push("table " + k); }
    }
    if (why.length) bad.push(`${c} ${x.what}: ${why.join(", ")}`);
  }
  CK(`A-4 EXTINCTION: every one of the ${withD.reduce((s, c) => s + SR[c].deduct.length, 0)} components is well formed (kind, unit, shape, nonnegative amounts)`, bad.length === 0, bad.join(" · "));
  // the notes: each says what is taken from v6.02 and names what is not (DD-4, DD-5, DD-6)
  const notTaken = /\b(standard deduction|personal exemptions?|exemptions?|exemption credits?|personal (tax )?credits?)\b[^;.]*\bnot taken\b/i;
  const nb = withD.filter(c => !/from v6\.02/i.test(SR[c].note) || !/ (are|is) taken\b/.test(SR[c].note) || notTaken.test(SR[c].note));
  CK("A-5 EXTINCTION: each of the 27 notes says what is taken from v6.02, and none still says a deduction, exemption or personal credit is not taken", nb.length === 0, nb.join(","));
  const NOT = { AL: /deduction of federal income tax that Alabama allows is not taken/, MO: /deduction of federal income tax that Missouri allows is not taken/,
    OR: /subtraction of federal income tax that Oregon allows is not taken/, MT: /but not the federal senior deduction/, ND: /but not the federal senior deduction/,
    HI: /refundable credits are not/, ME: /refundable credits are not/, OK: /sales tax relief credit is not/, NM: /low-income rebates and credits are not/,
    WV: /family tax credit is not/, NY: /household credit is not/, MD: /reduced schedule/, AR: /additional credit for those 65 or older who take no retirement exclusion is not taken/ };
  for (const [c, re] of Object.entries(NOT)) CK(`A-6 ${c}: the note names what is not taken (${re.source.slice(0, 60)})`, re.test(SR[c].note), SR[c].note.slice(-240));
  CK("A-7 the 2025-figure rows say so: AR, CA, DC, MD, OR, VT name their 2025 amounts", ["AR", "CA", "DC", "MD", "OR", "VT"].every(c => /2025 (amounts|figures)/.test(SR[c].note)));
  CK("A-8 the flat-rate and no-tax rows carry no `deduct` (batch 2 is v6.03)", Object.keys(SR).filter(c => !SR[c].brackets).every(c => SR[c].deduct === undefined));
  CK("A-9 the evaluator is exported and the shim reaches it", typeof SD === "function");
  // each age a note names for a deduction ("for each filer NN or older") is one a component applies, and each component's age is named
  const ageBad = [];
  for (const c of withD) {
    const ages = new Set(SR[c].deduct.flatMap(x => [x.per === "age" ? (x.age ?? 65) : null, x.add ? x.add.age : null, x.byAge ? (x.byAge.age ?? 65) : null]).filter(v => v !== null));
    for (const m of SR[c].note.matchAll(/for each filer (\d{2}) or older/g)) if (!ages.has(+m[1])) ageBad.push(`${c} names ${m[1]}`);
    for (const a of ages) if (!new RegExp(`(for each filer|both) ${a} or older`).test(SR[c].note)) ageBad.push(`${c} silent on ${a}`);
  }
  CK("A-10 each age a note names for a deduction is one a component applies (\"for each filer NN or older\"), and every component's age is named", ageBad.length === 0, ageBad.join(", "));
} else {
  CK("A-1 PIN v6.01: no row carries `deduct`, and there is no evaluator", withD.length === 0 && SD === undefined, withD.join(","));
  CK("A-2 PIN v6.01: the notes say the deductions are not taken (AL, VA, WI as samples)",
     /standard deduction and its personal exemption are not taken/.test(SR.AL.note) && /no standard deduction or exemption is taken/.test(SR.VA.note) && /exemptions are not taken/.test(SR.WI.note));
}

// ── B · the phase shapes at their edges ──
const det = (code, a) => { let d = null; const t = ST({ ...a, code, _onDetail: x => { d = x; } }); return { t, d }; };
const W = (code, work, single, ageA, ageB = null, more = {}) => ({ code, retIncome: 0, pen: 0, work, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA, ageB: single ? null : ageB, single, ...more });
if (DD) {
  const E = (code, opts) => SD(SR[code].deduct, opts);
  // Alabama: full $500 steps from $25,500, floored
  EQ("B-AL-1 Alabama single at $25,999: no full $500 step yet — $3,000 + $1,500", E("AL", { single: true, base: 25999 }).ded, 4500);
  EQ("B-AL-2 …at $26,000: one step — $2,975 + $1,500", E("AL", { single: true, base: 26000 }).ded, 4475);
  EQ("B-AL-3 …far above: floored at $2,500 + $1,500", E("AL", { single: true, base: 1e6 }).ded, 4000);
  EQ("B-AL-4 joint at $26,000: $8,500 − $175 + $3,000", E("AL", { single: false, base: 26000 }).ded, 11325);
  EQ("B-AL-5 joint floor: twenty steps reach $5,000 (base $35,500)", E("AL", { single: false, base: 35500 }).ded, 8000);
  // Connecticut: $1,000 per $1,000 or fraction; Table E
  EQ("B-CT-1 Connecticut single at $30,000: the whole $15,000", E("CT", { single: true, base: 30000 }).ded, 15000);
  EQ("B-CT-2 …at $30,001: a fraction of $1,000 costs a whole $1,000", E("CT", { single: true, base: 30001 }).ded, 14000);
  EQ("B-CT-3 …at $44,001: gone", E("CT", { single: true, base: 44001 }).ded, 0);
  EQ("B-CT-4 Table E single at $18,800: .75 (inclusive)", E("CT", { single: true, base: 18800 }).pct, 0.75);
  EQ("B-CT-5 …at $18,801: .70", E("CT", { single: true, base: 18801 }).pct, 0.70);
  EQ("B-CT-6 …at $64,500: .01; at $64,501: 0", E("CT", { single: true, base: 64500 }).pct + 100 * E("CT", { single: true, base: 64501 }).pct, 0.01);
  EQ("B-CT-7 joint at $100,500: .01; at $100,501: 0", E("CT", { single: false, base: 100500 }).pct + 100 * E("CT", { single: false, base: 100501 }).pct, 0.01);
  // California: $6 per credit per $2,500 or fraction of federal AGI over the threshold
  EQ("B-CA-1 California single 66 at federal AGI $252,203: two credits of $153", E("CA", { single: true, ageA: 66, agi: 252203 }).credit, 306);
  EQ("B-CA-2 …at $252,204: each $147", E("CA", { single: true, ageA: 66, agi: 252204 }).credit, 294);
  EQ("B-CA-3 joint 66/66 at $504,412: four credits of $147", E("CA", { single: false, ageA: 66, ageB: 66, agi: 504412 }).credit, 588);
  EQ("B-CA-4 …26 steps take each to nothing, not below ($252,203 + $65,000)", E("CA", { single: true, ageA: 66, agi: 317203 }).credit, 0);
  // Maine: linear, the ratio to four places, applied to the whole deduction with its 65+ addition
  EQ("B-ME-1 Maine single 66 halfway through the phase-out ($139,750): half of $17,750", E("ME", { single: true, ageA: 66, base: 139750 }).ded, 8875 + 5300);
  EQ("B-ME-2 …one dollar in: the ratio rounds to 0.0000, nothing lost", E("ME", { single: true, ageA: 66, base: 102251 }).ded, 17750 + 5300);
  EQ("B-ME-3 the exemption halfway ($403,500 single): $2,650, the deduction gone", E("ME", { single: true, base: 403500 }).ded, 2650);
  // Minnesota: 3 % then 10 %, at most 80 %
  EQ("B-MN-1 Minnesota joint 66/66 at federal AGI $290,000: $33,800 less 3 % of $45,600", E("MN", { single: false, ageA: 66, ageB: 66, agi: 290000 }).ded, 33800 - 1368);
  EQ("B-MN-2 …at $400,000: less 3 % of $93,400 and 10 % of $62,200", E("MN", { single: false, ageA: 66, ageB: 66, agi: 400000 }).ded, 33800 - 2802 - 6220);
  EQ("B-MN-3 …at $1,000,000: the 80 % cap binds — 20 % remains", E("MN", { single: false, ageA: 66, ageB: 66, agi: 1e6 }).ded, 6760);
  // Maryland: the exemption table and the senior credit's reduced schedule
  EQ("B-MD-1 Maryland single at federal AGI $100,000: exemption $3,200 + std $3,350", E("MD", { single: true, agi: 100000 }).ded, 6550);
  EQ("B-MD-2 …at $100,001: $1,600; $125,001: $800; $150,001: nothing", E("MD", { single: true, agi: 100001 }).ded + E("MD", { single: true, agi: 125001 }).ded + E("MD", { single: true, agi: 150001 }).ded, 3 * 3350 + 1600 + 800);
  EQ("B-MD-3 senior credit single 66: $1,000 below $50,000", E("MD", { single: true, ageA: 66, agi: 49999 }).credit, 1000);
  EQ("B-MD-4 …$500 AT $50,000 (\"at least\")", E("MD", { single: true, ageA: 66, agi: 50000 }).credit, 500);
  EQ("B-MD-5 …$500 at $100,000, nothing at $100,001", E("MD", { single: true, ageA: 66, agi: 100000 }).credit + 10 * E("MD", { single: true, ageA: 66, agi: 100001 }).credit, 500);
  EQ("B-MD-6 joint both 65+: $1,750 below $100,000, $875 at $100,000 and $150,000", E("MD", { single: false, ageA: 66, ageB: 70, agi: 99999 }).credit + E("MD", { single: false, ageA: 66, ageB: 70, agi: 100000 }).credit + E("MD", { single: false, ageA: 66, ageB: 70, agi: 150000 }).credit, 3500);
  EQ("B-MD-7 joint, one 65+: $1,000 / $500; neither: nothing", E("MD", { single: false, ageA: 66, ageB: 60, agi: 80000 }).credit + E("MD", { single: false, ageA: 66, ageB: 60, agi: 120000 }).credit + E("MD", { single: false, ageA: 60, ageB: 60, agi: 80000 }).credit, 1500);
  // Oklahoma's and Oregon's cliffs
  EQ("B-OK-1 Oklahoma single 66 at federal AGI $15,000: the 65+ exemption", E("OK", { single: true, ageA: 66, agi: 15000 }).ded, 6350 + 1000 + 1000);
  EQ("B-OK-2 …at $15,000.01: none", E("OK", { single: true, ageA: 66, agi: 15000.01 }).ded, 6350 + 1000);
  EQ("B-OR-1 Oregon joint at federal AGI $200,000: two credits; at $200,001: none", E("OR", { single: false, agi: 200000 }).credit + 1000 * E("OR", { single: false, agi: 200001 }).credit, 512);
  // Rhode Island: 20 % per $7,450 or fraction above $261,000
  EQ("B-RI-1 Rhode Island single at $261,000: whole", E("RI", { single: true, base: 261000 }).ded, 16450);
  EQ("B-RI-2 …at $261,001: 80 %", E("RI", { single: true, base: 261001 }).ded, 16450 * 0.8);
  EQ("B-RI-3 …at $268,451: 60 %; at $298,250: nothing", E("RI", { single: true, base: 268451 }).ded + E("RI", { single: true, base: 298250 }).ded, 16450 * 0.6);
  // South Carolina: the reduction rounded down to $10
  EQ("B-SC-1 South Carolina joint at federal AGI $115,000: $30,000 − $9,540 (from $9,545.45)", E("SC", { single: false, agi: 115000 }).ded, 20460);
  EQ("B-SC-2 single at $40,001: a 27-cent reduction rounds to nothing", E("SC", { single: true, agi: 40001 }).ded, 15000);
  EQ("B-SC-3 single at $95,000: gone", E("SC", { single: true, agi: 95000 }).ded, 0);
  // Wisconsin's slide and New Mexico's per-exemption rate
  EQ("B-WI-1 Wisconsin single at $30,120: $13,960 − 12 % of $10,000, + $700", E("WI", { single: true, base: 30120 }).ded, 12760 + 700);
  EQ("B-WI-2 …far above: the standard deduction floors at zero", E("WI", { single: true, base: 500000 }).ded, 700);
  EQ("B-NM-1 New Mexico single at federal AGI $30,000: $2,500 − 15 % of $10,000 = $1,000, + the federal $16,100", E("NM", { single: true, agi: 30000 }).ded, 16100 + 1000);
  EQ("B-NM-2 joint at $55,000: each exemption reaches nothing", E("NM", { single: false, agi: 55000 }).ded, 32200);
  // the evaluator's own rules, on synthetic components
  EQ("B-X-1 an unknown shape grants nothing (conservative)", SD([{ what: "x", kind: "ded", per: "return", amt: 1000, phase: { on: "base", shape: "bogus" } }], { single: true, base: 1 }).ded, 0);
  EQ("B-X-2 per \"age\" counts each filer at or above it — a joint 66/59 couple has one at 60 (Delaware's credit)", E("DE", { single: false, ageA: 66, ageB: 59 }).credit, 330);
  EQ("B-X-3 a single return never counts spouse B", SD([{ what: "x", kind: "ded", per: "age", age: 65, amt: 100 }], { single: true, ageA: 70, ageB: 70 }).ded, 100);
  // through the calculator: the measures it hands the evaluator
  { const { d } = det("SC", W("SC", 100000, false, 66, 66, { ssTaxableFed: 20000, ssGrossA: 24000, ssGrossB: 12000 }));
    CK("B-C-1 the calculator measures agi with taxable SS and base without it where the state exempts SS (South Carolina)", d && d.base === 100000 && d.agi === 120000 && d.ded === 19100, JSON.stringify(d)); }
  { const { d } = det("VA", { code: "VA", retIncome: 0, pen: 0, work: 50000, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: null, ageB: 70, single: true });
    CK("B-C-2 the survivor in B's slot files single and is counted 65+ (the calculator's swap reaches the evaluator)", d && d.ded === 8750 + 930 + 800, JSON.stringify(d)); }
  { const { d } = det("AL", { code: "AL", retIncome: 0, pen: 0, work: 30000, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, persons65: 2, single: false });
    CK("B-C-3 a count-only caller (no ages, persons65 2): both counted 65+ for the age-unit components (Delaware-style), as the exclusions are",
       (() => { let x = null; ST({ code: "DE", retIncome: 0, pen: 0, work: 30000, persons65: 2, single: false, _onDetail: y => { x = y; } }); return x && x.ded === 6500 + 5000 && x.credit === 440; })() && d && d.ded === 8500 - 175 * 9 + 3000, JSON.stringify(d)); }
  { const { t, d } = det("VA", W("VA", 5000, true, 50));
    CK("B-C-4 taxable income floors at zero — a deduction larger than the base leaves no tax, never a negative one", d && d.ti === 0 && t === 0, JSON.stringify(d)); }
  { const { t } = det("NE", W("NE", 9000, false, 50, 50));
    CK("B-C-5 credits are nonrefundable — Nebraska's $352 against a smaller tax floors at zero", t === 0, t); }
  { const { t, d } = det("MD", W("MD", 20000, true, 66));   // state tax $538.875 < the $1,000 senior credit: nothing left of it for the county's
    EQ("B-C-7 Maryland's senior credit stops at the state tax — single 66, wages $20,000: only the county's 3.30 % of $12,450 remains, $410.85", t, 0.033 * (20000 - 3350 - 3200 - 1000));
    CK("B-C-7b …and the record shows the credit and the taxable income it ran on", d && d.credit === 1000 && d.ti === 12450, JSON.stringify(d)); }
  { let calls0 = 0; ST({ ...W("GA", 60000, true, 66), code: "GA", _onDetail: () => { calls0++; } }); let d = null; ST({ ...W("GA", 60000, true, 66), code: "GA", _onDetail: x => { d = x; } });
    CK("B-C-6 a row without `deduct` (Georgia) reports nothing taken, and taxable income equals the base", calls0 === 1 && d.ded === 0 && d.credit === 0 && d.pct === 0 && d.ti === d.base, JSON.stringify(d)); }
} else {
  CK("B-0 PIN v6.01: the calculator has no detail seam — `_onDetail` is never called", (() => { let n = 0; ST({ ...W("VA", 50000, true, 66), _onDetail: () => { n++; } }); return n === 0; })());
}

// ── C · hand cases to the cent (hand602.py, Decimal; the scope's §7) ──
// [id, code, single, ageA, ageB, work, taxable SS, v6.02 tax (exact)]; base = work; federal AGI = work + taxable SS. The v6.01 leg pins the
// same calls at v6.01's figure: the same base on the schedule with nothing taken (computed here from the same schedules).
const HAND = [
  ["C-AL-1", "AL", true, 50, null, 40000, 0, 1760.00], ["C-AL-2", "AL", false, 66, 66, 30000, 0, 923.75], ["C-AR-1", "AR", false, 67, 64, 60000, 0, 1583.057],
  ["C-CA-1", "CA", true, 70, null, 80000, 0, 3041.98], ["C-CA-2", "CA", false, 66, 66, 520000, 0, 39731.96], ["C-CT-1", "CT", true, 50, null, 40000, 0, 1192.5],
  ["C-CT-2", "CT", false, 70, 68, 45000, 0, 378.25], ["C-DC-1", "DC", false, 66, 66, 90000, 0, 3292.00], ["C-DE-1", "DE", true, 62, null, 50000, 0, 1988.125],
  ["C-HI-1", "HI", false, 66, 50, 120000, 0, 5425.568], ["C-KS-1", "KS", true, 70, null, 50000, 0, 1942.883], ["C-MD-1", "MD", true, 66, null, 75000, 0, 4877.225],
  ["C-MD-2", "MD", false, 67, 66, 99999, 0, 5031.8695], ["C-ME-1", "ME", false, 66, 66, 250000, 0, 14347.73315], ["C-ME-2", "ME", true, 50, null, 400000, 0, 27880.2144],
  ["C-MN-1", "MN", false, 66, 66, 300000, 0, 18289.948], ["C-MO-1", "MO", true, 66, null, 60000, 0, 1786.318], ["C-MS-1", "MS", false, 66, 66, 80000, 0, 2016.00],
  ["C-MT-1", "MT", false, 66, 66, 150000, 0, 5566.75], ["C-ND-1", "ND", true, 50, null, 120000, 0, 1059.3375], ["C-NE-1", "NE", false, 66, 50, 70000, 0, 1348.563],
  ["C-NJ-1", "NJ", false, 66, 66, 90000, 0, 1976.5], ["C-NM-1", "NM", true, 66, null, 25000, 0, 76.5], ["C-NY-1", "NY", true, 50, null, 120000, 0, 6180.10775],
  ["C-NY-2", "NY", false, 66, 66, 180000, 0, 9673.05], ["C-OK-1", "OK", true, 66, null, 15000, 0, 90.00], ["C-OK-2", "OK", true, 66, null, 15001, 0, 129.545],
  ["C-OR-1", "OR", false, 66, 66, 150000, 0, 11303.875], ["C-RI-1", "RI", true, 50, null, 280000, 0, 13245.378], ["C-SC-1", "SC", false, 66, 66, 115000, 0, 3959.534],
  ["C-VA-1", "VA", true, 66, null, 50000, 0, 2014.9], ["C-VT-1", "VT", false, 66, 66, 150000, 0, 5272.85], ["C-WI-1", "WI", true, 66, null, 40000, 0, 1072.9364],
  ["C-WV-1", "WV", false, 50, 50, 60000, 0, 1781.7], ["C-VA-S", "VA", true, null, 70, 50000, 0, 2014.9], ["C-SC-2", "SC", false, 66, 66, 100000, 20000, 3248.89],
  ["C-MD-3", "MD", false, 66, 66, 90000, 20000, 5101.95],
];
const bsum = (rows, x) => { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
for (const [id, code, single, aA, aB, work, ss, want] of HAND) {
  const a = { code, retIncome: 0, pen: 0, work, capGains: 0, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: ss ? 12000 : 0, ageA: aA, ageB: aB, single };
  const got = ST(a);
  if (DD) EQ(`${id} ${code} ${single ? "single" : "joint"}${aA === null ? " (survivor in B's slot)" : ""} ages ${aA ?? "–"}/${aB ?? "–"}, work $${work.toLocaleString("en-US")}${ss ? ` + taxable SS $${ss.toLocaleString("en-US")}` : ""} → $${want.toFixed(2)}`, got, want);
  else {   // v6.01: the base on the schedule, nothing taken (CT's added amounts, NY's recapture and MD's county tax on the same base)
    const sch = single ? SR[code].brackets.single : SR[code].brackets.joint; let w = bsum(sch, work);
    if (code === "NY" && work > 107650) { const up = single ? 215400 : 161550, fr = single ? 0.059 : 0.054; if (work <= up) w += (fr * work - w) * Math.min(1, Math.round((work - 107650) / 50000 * 1e4) / 1e4); else w = sch.find(([u]) => u === null || work <= u)[1] * work; }
    if (code === "MD") w += 0.033 * work;
    EQ(`${id} PIN v6.01: ${code} — the base on the schedule, no deduction taken → $${w.toFixed(2)}`, got, w);
  }
}
if (DD) {
  const vt = ST({ code: "VT", retIncome: 0, pen: 0, work: 150000, capGains: 0, ssTaxableFed: 0, ageA: 66, ageB: 66, single: false });
  CK("C-VT-M Vermont's note holds: with its deductions taken, the tax at $150,000 still exceeds the 3 % minimum tax (so it cannot bind)", vt > 0.03 * 150000, vt);
}

// ── D · v6.01 -> v6.02 ──
if (VER === "v602") {
  if (!existsSync(new URL("./app_v601.mjs", import.meta.url))) CK("D-0 app_v601.mjs is in this run folder (group D needs it)", false, "missing");
  else {
    const pm = await import("./app_v601.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const grid = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const [aA, aB] of [[50, 48], [61, 59], [66, 64], [72, 70], [null, 70]]) for (const ret of [0, 15000, 40000, 96000, 260000, 1500000])
      for (const pen of [0, 20000]) for (const ss of [0, 25000]) for (const cg of [0, 60000]) {
        if (aA === null && !single) continue;
        grid.push({ code, retIncome: ret, pen, work: 5000, capGains: cg, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: ss ? 10000 : 0, ageA: aA, ageB: single && aA !== null ? null : aB, single });
      }
    // (1) with `deduct` removed from every row, v6.02 is v6.01 byte for byte
    const saved = {}; for (const c of withD) { saved[c] = SR[c].deduct; delete SR[c].deduct; }
    let same = 0; const bad1 = [];
    for (const a of grid) { const x = PST({ ...a }), y = ST({ ...a }); if (Object.is(x, y)) same++; else bad1.push(`${a.code} ${x}->${y}`); }
    for (const c of withD) SR[c].deduct = saved[c];
    CK(`D-1 with \`deduct\` removed from every row, the calculator is v6.01's byte for byte (${same} of ${grid.length} calls across all ${Object.keys(SR).length} rows)`, same === grid.length, bad1.slice(0, 3).join(" · "));
    // (2) with it: the 27 equal the independent implementation on the calculator's own measures; the other 24 are v6.01's
    let ind = 0, same2 = 0, moved = 0; const bad2 = [];
    for (const a of grid) {
      let d = null; const y = ST({ ...a, _onDetail: z => { d = z; } }), x = PST({ ...a });
      if (!withD.includes(a.code)) { if (Object.is(x, y)) same2++; else bad2.push(`${a.code} moved ${x}->${y}`); continue; }
      const sA = a.single && a.ageA === null ? a.ageB : a.ageA, sB = a.single && a.ageA === null ? null : a.ageB;
      const w = d30Tax(SR, a.code, { base: d.base, agi: d.agi, single: a.single, ageA: sA, ageB: sB, capGains: a.capGains });
      const ref = Math.max(0, w.tax);
      if (Math.abs(y - ref) <= 1e-6 * Math.max(1, ref) && Math.abs(d.ded - w.ded) <= 1e-6 * Math.max(1, w.ded)) ind++; else bad2.push(`${a.code} ${JSON.stringify(a)} got ${y} (ded ${d.ded}) want ${ref} (ded ${w.ded})`);
      if (y < x - 1e-9) moved++;
    }
    CK(`D-2 with it: the 27 equal the independent implementation (qa/d30_ref.mjs) on the calculator's own measures (${ind}); the other 24 rows byte-identical (${same2})`,
       bad2.length === 0 && ind + same2 === grid.length, bad2.slice(0, 3).join(" · "));
    CK(`D-3 the direction: no call among the 27 pays more state tax than at v6.01 (deductions and credits only lower it); ${moved} pay less`,
       grid.filter(a => withD.includes(a.code)).every(a => ST({ ...a }) <= PST({ ...a }) + 1e-9) && moved > 0);
  }
} else console.log("  – group D runs on the v602 leg (it compares against app_v601.mjs)");

// ── E · Ask AI ──
const AI = g.AI_CONSTS ? g.AI_CONSTS() : {};
if (DD) CK("E-1 the cap and the timeout are one constant each: 4,096 tokens, 120 seconds", AI.MAX_TOKENS === 4096 && AI.TIMEOUT_MS === 120000 && typeof AI.CUTOFF === "string", JSON.stringify(AI));
else CK("E-1 PIN v6.01: no constants (the literals 1000 and 45000 sat in askAI)", AI.MAX_TOKENS === undefined && AI.TIMEOUT_MS === undefined);
const body = () => window.document.body;
const QUESTION = "How does my plan look?";
async function session(seed, replies) {
  window.localStorage.clear(); seed(); calls.length = 0;
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
  const turns = [];
  for (const [q, reply] of replies) {
    REPLY = reply; const before = calls.length;
    for (let i = 0; i < 20 && calls.length === before; i++) {
      const ta = el.querySelector("textarea.ai-in");
      if (ta && ta.value !== q) await safe(() => act(async () => {
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(ta, q);
        ta.dispatchEvent(new window.Event("input", { bubbles: true }));
      }));
      await wait(60);
      const b = sendBtn(); if (b && !b.disabled) await click(b);
      await wait(400);
    }
    await wait(300);
    turns.push({ call: calls[calls.length - 1] || null, n: calls.length - before, cut: el.querySelectorAll("[data-dc-ai-cutoff]").length, text: el.textContent || "" });
  }
  await safe(() => act(async () => { root.unmount(); }));
  el.remove(); REPLY = null;
  return { panel, turns };
}
const KEY = () => window.localStorage.setItem(PREFIX + "danger_close:api_key_v1", "sk-ant-T66-00000000");
const LOCAL = () => window.localStorage.setItem(PREFIX + "danger_close:local_llm_v1", JSON.stringify({ url: "http://localhost:11434/v1", model: "t66" }));
const ANSWER = "PART ONE of a long answer that the cap cut off mid-sent";
const anth = (stop) => () => ({ json: { content: [{ type: "text", text: ANSWER }], stop_reason: stop } });
const local = (fin) => () => ({ json: { choices: [{ message: { content: ANSWER }, finish_reason: fin } ] } });
{
  const r = await session(KEY, [[QUESTION, anth("max_tokens")], ["continue", anth("end_turn")]]);
  const [t1, t2] = r.turns;
  CK("E-2 setup: the self-hosted branch with a saved key sends to the Anthropic API", r.panel && t1.call && t1.call.url === "https://api.anthropic.com/v1/messages", JSON.stringify(t1.call && t1.call.url));
  if (DD) {
    CK("E-3 the request asks for up to 4,096 tokens (the Anthropic route)", t1.call && t1.call.body && t1.call.body.max_tokens === 4096, JSON.stringify(t1.call && t1.call.body && t1.call.body.max_tokens));
    CK("E-4 a reply that stopped at the cap (stop_reason \"max_tokens\") is shown with the cut-off notice", t1.cut === 1 && t1.text.includes(ANSWER) && t1.text.includes(AI.CUTOFF), `cut ${t1.cut}`);
    CK("E-5 the conversation memory re-sends the answer alone — the notice is not part of it, so the model can carry on", t2 && t2.call && t2.call.body.messages.some(m => m.role === "assistant" && m.content === ANSWER)
       && !JSON.stringify(t2.call.body.messages).includes("length limit"), JSON.stringify(t2 && t2.call && t2.call.body.messages.map(m => m.role)));
    CK("E-6 a finished reply (\"end_turn\") carries no notice — the earlier cut-off keeps its own, and only it", t2.cut === 1, `cut ${t2.cut}`);
  } else {
    CK("E-3 PIN v6.01: the request asks for 1,000 tokens", t1.call && t1.call.body && t1.call.body.max_tokens === 1000, JSON.stringify(t1.call && t1.call.body && t1.call.body.max_tokens));
    CK("E-4 PIN v6.01: a reply cut off at the cap looks finished — no notice of any kind", t1.cut === 0 && t1.text.includes(ANSWER) && !/length limit/.test(t1.text));
  }
  // the size of what one question sends (the Field Manual's cost sentence)
  const sys = t1.call && t1.call.body ? JSON.stringify(t1.call.body).length : 0;
  if (DD) CK(`E-7 the cost sentence's input range holds for the example plan: one question sends ${sys.toLocaleString("en-US")} characters, about ${Math.round(sys / 4).toLocaleString("en-US")} tokens — within "roughly 1,000 to 5,000"`,
             sys / 4 >= 1000 && sys / 4 <= 5000, sys);
}
{
  const r = await session(LOCAL, [[QUESTION, local("length")], ["and then?", local("stop")]]);
  const [t1, t2] = r.turns;
  CK("E-8 setup: a Local Model sends to its /chat/completions", t1.call && t1.call.url === "http://localhost:11434/v1/chat/completions", JSON.stringify(t1.call && t1.call.url));
  if (DD) {
    CK("E-9 the Local Model request asks for up to 4,096 tokens too", t1.call && t1.call.body && t1.call.body.max_tokens === 4096, JSON.stringify(t1.call && t1.call.body && t1.call.body.max_tokens));
    CK("E-10 its cut-off (finish_reason \"length\") is shown with the notice; a finished one (\"stop\") is not", t1.cut === 1 && t2.cut === 1, `${t1.cut} / ${t2.cut}`);
  } else CK("E-9 PIN v6.01: the Local Model request asks for 1,000 tokens", t1.call && t1.call.body && t1.call.body.max_tokens === 1000);
}
{
  const r = await session(KEY, [[QUESTION, () => ({ throwAbort: true })]]);
  const t = r.turns[0].text;
  if (DD) CK("E-11 a timed-out request says 120 seconds — the constant's value, through the message", t.includes(`REQUEST TIMED OUT (${AI.TIMEOUT_MS / 1000}s)`) && !t.includes("(45s)"), t.slice(-200));
  else CK("E-11 PIN v6.01: the timeout message says 45 seconds", t.includes("REQUEST TIMED OUT (45s)"));
}
// the source, by AST: both max_tokens and the timer read the constants; no literal remains
const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
const WB = { ...walk.base, JSXElement(n, s, c) { c(n.openingElement, s); n.children.forEach(x => c(x, s)); }, JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); },
  JSXOpeningElement(n, s, c) { n.attributes.forEach(a => c(a, s)); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); }, JSXSpreadAttribute(n, s, c) { c(n.argument, s); },
  JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); }, JSXText() {}, JSXEmptyExpression() {} };
const mt = [], timers = [], quasis = [];
walk.full(ast, n => {
  if (n.type === "Property" && ((n.key.type === "Identifier" && n.key.name === "max_tokens") || (n.key.type === "Literal" && n.key.value === "max_tokens"))) mt.push(n.value);
  if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "setTimeout" && n.arguments[0] && /controller\.abort\(\)/.test(src.slice(n.arguments[0].start, n.arguments[0].end))) timers.push(n.arguments[1]);
  if (n.type === "TemplateLiteral") quasis.push(n.quasis.map(q => q.value.cooked).join("\u0000"));
}, WB);
if (DD) {
  CK(`E-12 EXTINCTION (AST): every max_tokens in the source reads AI_MAX_TOKENS (${mt.length} sites, both routes)`, mt.length === 2 && mt.every(v => v.type === "Identifier" && v.name === "AI_MAX_TOKENS"), mt.map(v => v.type + ":" + (v.name || v.value)).join(","));
  CK("E-13 the abort timer reads AI_TIMEOUT_MS", timers.length === 1 && timers[0].type === "Identifier" && timers[0].name === "AI_TIMEOUT_MS", timers.map(v => v.type + ":" + (v.name || v.value)).join(","));
} else CK("E-12 PIN v6.01 (AST): two max_tokens literals of 1000 and a 45,000 ms timer", mt.length === 2 && mt.every(v => v.type === "Literal" && v.value === 1000) && timers.length === 1 && timers[0].value === 45000);
const MP = g.MASTER_PROMPT();
if (DD) CK("E-14 the default master prompt's behavior note: answers may run to about 4,000 tokens, most far shorter — not \"~1000 token cap\"",
           /An answer may run to about 4,000 tokens, but most should be far\s+shorter: be concise and numbers-first\./.test(MP) && !/1000 token cap/.test(MP));
else CK("E-14 PIN v6.01: the master prompt promises a ~1000 token cap", /~1000 token cap/.test(MP));
const DOCS = g.DOCS_HTML().replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
const DOCS_C = g.DOCS_HTML().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");   // table cells kept apart
if (DD) {
  const k = AI.MAX_TOKENS.toLocaleString("en-US");
  CK("E-15 the Ask AI entry states the cap (the constant, formatted) and the cut-off notice", DOCS.includes(`An answer can run to about 3,000 words (${k} tokens); one that reaches that limit ends with a notice saying it was cut off — type continue and EXECUTE for the rest.`));
  CK("E-15b …and says a master prompt restored from an older backup keeps its own wording (AI-4) — the request's cap does not depend on it",
     DOCS.includes(`A master prompt restored from an older backup keeps its own wording, which may still mention a 1,000-token cap; the request asks for ${k} either way.`));
  CK("E-16 the error table: the timeout row says (120s) — the constant — and a row explains the length-limit notice",
     DOCS_C.includes(`REQUEST TIMED OUT (${AI.TIMEOUT_MS / 1000}s) The question was very broad`) && !DOCS.includes("REQUEST TIMED OUT (45s)") && DOCS_C.includes(`An answer ends with the length-limit notice The answer reached the ${k}-token limit and was cut off Type continue and EXECUTE`));
  // the cost sentence: its figures, held to arithmetic — 4,096 output tokens at $15 per million is about six cents
  const six = Math.round(AI.MAX_TOKENS * 15 / 1e6 * 100);
  CK(`E-17 the cost sentence: rates and date stated, "up to ${k} tokens", "about six cents" for a full-length answer, and the glossary's Token entry agrees (= ${AI.MAX_TOKENS} × $15 / 1M = ${(AI.MAX_TOKENS * 15 / 1e4).toFixed(2)}¢)`,
     DOCS.includes(`gets back an answer of up to ${k} tokens`) && DOCS.includes("At the Claude Sonnet 4.6 prices Anthropic listed in October 2026 ($3 per million input tokens, $15 per million output tokens)")
     && DOCS.includes("an answer that runs to the full 4,096 tokens adds about six cents") && six === 6 && !/well under a cent/.test(DOCS) && DOCS.includes("A full Ask AI question and answer runs a few thousand tokens — about one to five cents at the October 2026 rates the Ask AI cost note gives."));
  CK("E-18 …and the model id the request names is the one the sentence prices (claude-sonnet-4-6 — AI-6: unchanged)", /model: "claude-sonnet-4-6"/.test(src));
} else CK("E-15 PIN v6.01: the Field Manual says a question costs well under a cent and times out at 45 seconds", /well under a cent/.test(DOCS) && DOCS.includes("REQUEST TIMED OUT (45s)"));

// ── F · the display and the Field Manual's state-tax sentences ──
{
  if (DD) CK("F-1 the AI context's state line adds \" after its deductions and exemptions\" for a row carrying them", quasis.some(q => q === "on the state's own brackets\u0000\u0000, top rate \u0000%") && src.includes('STATE_RULES[stateCode].deduct ? " after its deductions and exemptions" : ""'));
  else CK("F-1 PIN v6.01: the AI context's state line has no deductions clause", !src.includes("after its deductions and exemptions"));
  window.localStorage.clear();
  const el = window.document.createElement("div"); body().appendChild(el);
  const { root, act, DangerClose } = window.__mount(el);
  const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
  const click = async (x) => { if (!x) return; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); };
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); await flush();
  await click([...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === "my data")); await flush();
  const stateSelect = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "ME"));
  const pickSt = async (code) => { const s = stateSelect(); if (!s) return; try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(s, code); s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {} await flush(); };
  const modelLine = () => { const n = [...body().querySelectorAll("div")].filter(d => /^Model: /.test(d.textContent || "")); return n.length ? n.sort((a, b) => a.textContent.length - b.textContent.length)[0].textContent : ""; };
  await pickSt("VA"); const va = modelLine(); await pickSt("CA"); const ca = modelLine(); await pickSt("GA"); const ga = modelLine();
  if (DD) {
    CK("F-2 My Data (Virginia): \"· deductions and exemptions taken\" after the schedule, and the dated figures add \"deductions 2026\"",
       /^Model: the state's own brackets, 2\.00% to 5\.75% · deductions and exemptions taken · /.test(va) && /Dollar figures by tax year: exclusion 2026 · income test 2026 · brackets 2026 · deductions 2026\./.test(va), va.slice(0, 220));
    CK("F-3 My Data (California): \"deductions 2025\" — the held year shows", / · deductions and exemptions taken · /.test(ca) && /brackets 2025 · deductions 2025\./.test(ca), ca.slice(-260));
  } else CK("F-2 PIN v6.01: My Data (Virginia) names no deductions", !/deductions/.test(va) && /^Model: the state's own brackets, 2\.00% to 5\.75% · /.test(va), va.slice(0, 160));
  CK("F-4 a flat-rate state (Georgia) is unchanged: no deductions clause", /^Model: 4\.99% effective rate \(an approximation\)/.test(ga) && !/deductions/.test(ga), ga.slice(0, 160));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
  el.remove();
}
if (DD) {
  CK("F-5 the Taxes entry: the 27 progressive states take their deductions, exemptions and personal credits; what is not taken is named; the flat-rate states take none yet — and the code agrees (27 rows, every one on a schedule, no flat row)",
     DOCS.includes("It is an approximation layer: from v6.02 the twenty-seven progressive states take their standard deductions, personal exemptions and personal credits before their schedules (Alabama's, Missouri's and Oregon's deduction of federal income tax, the federal senior deduction Montana and North Dakota start from, and low-income refundable credits are not taken), while the flat-rate states take none yet (conservative),")
     && withD.length === 27 && withD.every(c => SR[c].brackets) && Object.keys(SR).filter(c => !SR[c].brackets && SR[c].rate > 0).every(c => !SR[c].deduct));
  CK("F-6 the methodology entry says the same, and that itemized deductions are not modelled (no row carries an itemized component)",
     DOCS.includes("From v6.02 the progressive states take their standard deductions, personal exemptions and personal credits; the flat-rate states take none yet, and no state's itemized deductions are modelled (conservative).")
     && withD.every(c => SR[c].deduct.every(x => !/itemiz/i.test(x.what))));
  CK("F-7 the old claim is gone: \"no state's standard deduction or personal exemption is taken\"", !/no state's standard deduction or personal exemption is taken/.test(DOCS));
} else CK("F-5 PIN v6.01: the Field Manual says no state's standard deduction or personal exemption is taken", /no state's standard deduction or personal exemption is taken \(conservative\)/.test(DOCS));
done();
