// t67 — D-30 BATCH 2: THE FIFTEEN FLAT-RATE STATES' DEDUCTIONS, EXEMPTIONS AND PERSONAL CREDITS · docs/SCOPE_D30_DEDUCTIONS_V603.md · v6.03
//
// v6.02 took the deductions, exemptions and personal credits of the 27 progressive states and left the fifteen flat-rate states taxed from the
// first dollar of their base (conservative, disclosed). v6.03 takes them for the fourteen whose law has any — Pennsylvania's has none — each figure
// read at its primary source on 2026-10-10 (the scope's §0.2), puts Idaho's zero band and Ohio's 2026 schedule (with its $332 step) on the
// calculator, and corrects My Data's "effective rate (an approximation)", which no row's rate has been since v6.01.
//
// Groups:  A the fourteen rows' components, each equal to §0.2 and dated; Idaho's and Ohio's schedules and Ohio's `notch`; EXTINCTION: exactly
//            forty-one rows carry `deduct`, every new component well formed, Pennsylvania none and its note says why, every note names what is taken
//            and what is not
//          B the edges, through the calculator and its `_onDetail` seam: Colorado's $300,000, Illinois's cliffs, Indiana's $40,000, Ohio's bands,
//            credits and $26,050 step, Idaho's band, Utah's credit, Kentucky's one deduction, the `tiers` `pick`
//          C hand cases to the cent through stateTaxAnnual (Decimal, session working hand603.py, recorded in the scope's §6)
//          D v6.02 -> v6.03 (v603 leg, needs app_v602.mjs): with the fifteen's additions removed the calculator is v6.02's byte for byte; with them
//            the fourteen equal an independent implementation (qa/d30_ref.mjs, D30F) on the calculator's own measures, every other row v6.02's
//          E the display: My Data's model line, the AI context line, the Field Manual's state-tax sentences — each held to its code fact
// BOTH LEGS: the v602 leg pins the absence of all of it. Run: node t67_deductions_flat.mjs <tag>
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { d30Tax, D30_STATES, D30_FLAT_STATES } from "./d30_ref.mjs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v602", "v603", "v604", "v605", "v606", "v607"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 300) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt67 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t67 — STATE DEDUCTIONS, D-30 BATCH 2: THE FLAT-RATE STATES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const B2 = VER !== "v602";   // a version on which batch 2 is present
// v6.04 (D-31, t68): nine rows gain a component (a federal-income-tax deduction or the federal senior deduction), appended last; this suite
// keeps to its own components (`own` drops them) and t68 holds the new ones and the notes' new wording. A version LIST.
const D31L = ["v604", "v605", "v606", "v607"].includes(VER);
const own = l => (l || []).filter(x => !(D31L && (x.of !== undefined || x.years !== undefined)));
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
const g = window.__g, SR = g.STATE_RULES(), ST = g.stateTaxAnnual;
const sj = (a, b) => ({ single: a, joint: b });
const FLAT = ["AZ", "CO", "GA", "IA", "ID", "IL", "IN", "KY", "LA", "MA", "MI", "NC", "OH", "PA", "UT"];

// ── A · the components, transcribed here in the app's shape from §0.2 (group D checks the arithmetic against d30_ref separately) ──
const cp = (what, kind, per, amt, x = {}) => ({ what, kind, per, ...(x.age !== undefined ? { age: x.age } : {}), ...(x.byAge ? { byAge: x.byAge } : { amt }),
  ...(x.add ? { add: { age: x.add[0], amt: x.add[1] } } : {}), ...(x.phase ? { phase: x.phase } : {}) });
const FEDADD = [65, sj(2050, 1650)];
const FED = cp("federal standard deduction", "ded", "return", sj(16100, 32200), { add: FEDADD });
const band = (rows) => ({ on: "base", shape: "table", rows: { single: rows, joint: rows } });
const WANT = {
  AZ: [2025, [cp("standard deduction", "ded", "return", sj(15750, 31500)), cp("exemption for each filer 65 or older", "ded", "age", 2100, { age: 65 })]],
  CO: [2026, [cp("federal standard deduction, the part kept at any income", "ded", "return", sj(12000, 16000)),
              cp("federal standard deduction, the rest (Proposition FF addback from federal AGI $300,000)", "ded", "return", sj(4100, 16200),
                 { add: FEDADD, phase: { on: "agi", shape: "cliff", thr: sj(300000, 300000), cmp: "lt" } })]],
  GA: [2026, [cp("standard deduction", "ded", "return", sj(15000, 30000))]],
  IA: [2026, [FED, cp("exemption credit", "credit", "person", 40, { add: [65, 20] })]],
  ID: [2025, [cp("standard deduction", "ded", "return", sj(15750, 31500), { add: [65, sj(2000, 1600)] }), cp("grocery credit", "credit", "person", 155)]],
  IL: [2026, [cp("exemption", "ded", "person", 2925, { add: [65, 1000], phase: { on: "agi", shape: "cliff", thr: sj(250000, 500000) } })]],
  IN: [2026, [cp("exemption", "ded", "person", 1000, { add: [65, 1000] }),
              cp("additional exemption for each filer 65 or older", "ded", "age", 500, { age: 65, phase: { on: "agi", shape: "cliff", thr: 40000, cmp: "lt" } })]],
  KY: [2026, [cp("standard deduction", "ded", "return", 3360), cp("credit for each filer 65 or older", "credit", "age", 40, { age: 65 })]],
  LA: [2025, [cp("standard deduction", "ded", "return", sj(12500, 25000))]],
  MA: [2026, [cp("personal exemption", "ded", "person", 4400, { add: [65, 700] })]],
  MI: [2026, [cp("personal exemption", "ded", "person", 5900)]],
  NC: [2026, [cp("standard deduction", "ded", "return", sj(12750, 25500))]],
  OH: [2025, [cp("personal exemption (modified AGI $40,000 or less)", "ded", "person", 2400, { phase: band([[40000, 1], [null, 0]]) }),
              cp("personal exemption (modified AGI $40,001 to $80,000)", "ded", "person", 2150, { phase: band([[40000, 0], [80000, 1], [null, 0]]) }),
              cp("personal exemption (modified AGI above $80,000, below $500,000)", "ded", "person", 1900, { phase: band([[80000, 0], [500000, 1, "lt"], [null, 0]]) }),
              cp("exemption credit", "credit", "person", 20, { phase: { on: "base", shape: "cliff", thr: sj(32400, 34800), cmp: "lt" } }),
              cp("senior citizen credit", "credit", "return", null, { byAge: { age: 65, single: [0, 50], joint: [0, 50, 50] }, phase: { on: "base", shape: "cliff", thr: sj(101900, 103800), cmp: "lt" } })]],
  UT: [2025, [cp("taxpayer tax credit", "credit", "return", sj(966, 1932), { add: [65, sj(123, 99)], phase: { on: "base", shape: "tiers", tiers: [[sj(18213, 36426), 0.013, null]] } })]],
};
const withD = Object.keys(SR).filter(c => SR[c].deduct !== undefined).sort();
const flatD = FLAT.filter(c => SR[c].deduct !== undefined);
if (B2) {
  CK(`A-1 EXTINCTION: exactly forty-one rows carry \`deduct\` (${withD.length}) — the 27 of batch 1 and the 14 of batch 2 — and the reference covers the same sets`,
     withD.join(",") === [...D30_STATES, ...Object.keys(WANT)].sort().join(",") && D30_FLAT_STATES.slice().sort().join(",") === Object.keys(WANT).sort().join(","), withD.join(","));
  for (const c of Object.keys(WANT)) {
    const [yr, comps] = WANT[c];
    CK(`A-2 ${c}: the components equal §0.2 (${comps.map(x => x.what).join(" · ")})${D31L && own(SR[c].deduct).length !== SR[c].deduct.length ? " [v6.04: and the senior deduction, held by t68]" : ""}`, JSON.stringify(own(SR[c].deduct)) === JSON.stringify(comps), JSON.stringify(SR[c].deduct).slice(0, 300));
    CK(`A-3 ${c}: dated — years.deduct ${yr}${yr === 2025 ? " (the latest published, held — DD-11)" : ""}`, SR[c].years && SR[c].years.deduct === yr, JSON.stringify(SR[c].years));
  }
  CK("A-4 Idaho's schedule: nothing on the first $4,811 single / $9,622 joint, 5.3 % above (2025, held); `rate` still the top rate",
     JSON.stringify(SR.ID.brackets) === JSON.stringify({ single: [[4811, 0], [null, 0.053]], joint: [[9622, 0], [null, 0.053]] }) && SR.ID.years.brackets === 2025 && SR.ID.rate === 0.053, JSON.stringify(SR.ID.brackets));
  CK("A-5 Ohio's 2026 schedule: nothing on $26,050 or less, 2.75 % above, and the $332 step (`notch`) above $26,050 — R.C. 5747.02(A)(3)",
     JSON.stringify(SR.OH.brackets) === JSON.stringify({ single: [[26050, 0], [null, 0.0275]], joint: [[26050, 0], [null, 0.0275]] }) && JSON.stringify(SR.OH.notch) === JSON.stringify({ over: 26050, add: 332 })
     && SR.OH.years.brackets === 2026 && SR.OH.rate === 0.0275, JSON.stringify([SR.OH.brackets, SR.OH.notch]));
  CK("A-6 EXTINCTION: only Ohio carries `notch` (the calculator reads it only with a schedule)", Object.keys(SR).filter(c => SR[c].notch !== undefined).join(",") === "OH");
  CK("A-7 Pennsylvania carries no `deduct`, and its note says the law has none", SR.PA.deduct === undefined && /Pennsylvania's law has no standard deduction or personal exemption, so none is taken/.test(SR.PA.note));
  // every new component well formed (t66 A-4 holds the 27 with the same rules)
  const SHAPES = ["steps", "linear", "rate", "tiers", "table", "cliff"];
  const nonneg = v => v === undefined || (typeof v === "number" && v >= 0) || (v && typeof v === "object" && v.single >= 0 && v.joint >= 0);
  const bad = [];
  for (const c of flatD) for (const x of SR[c].deduct) {
    const why = [];
    if (!["ded", "credit", "pct"].includes(x.kind)) why.push("kind");
    if (!["return", "person", "age"].includes(x.per)) why.push("per");
    if (x.age !== undefined && x.per !== "age") why.push("age without per age");
    if (x.byAge ? x.amt !== undefined : !nonneg(x.amt) || x.amt === undefined) why.push("amt");
    if (x.add && (!nonneg(x.add.amt) || typeof x.add.age !== "number")) why.push("add");
    const p = x.phase;
    if (p) {
      if (!SHAPES.includes(p.shape)) why.push("shape " + p.shape);
      if (!["base", "agi"].includes(p.on)) why.push("on");
      if (p.shape === "table") for (const k of ["single", "joint"]) { const rows = p.rows[k]; if (!rows || rows[rows.length - 1][0] !== null || rows.some((r, i) => i && r[0] !== null && r[0] <= rows[i - 1][0])) why.push("table " + k); }
      if (p.shape === "tiers" && !p.tiers.every(([f, r]) => nonneg(f) && f !== undefined && typeof r === "number")) why.push("tiers");
    }
    if (why.length) bad.push(`${c} ${x.what}: ${why.join(", ")}`);
  }
  CK(`A-8 EXTINCTION: every one of batch 2's ${flatD.reduce((s, c) => s + SR[c].deduct.length, 0)} components is well formed`, bad.length === 0, bad.join(" · "));
  // the notes (DD-3, DD-4, DD-8, DD-9, DD-11)
  const nb = flatD.filter(c => !/from v6\.03/i.test(SR[c].note) || !/ (are|is) taken\b/.test(SR[c].note));
  CK("A-9 each of the fourteen notes says what is taken from v6.03", nb.length === 0, nb.join(","));
  const NOT = { AZ: /federal senior deduction Arizona subtracts from 2025 \(§43-1022\) and the low-income family and property tax credits are not taken/,
    CO: /federal senior deduction of 2025–2028 is not taken/, IA: /federal senior deduction of 2025–2028 and the low-income exemption are not taken/,
    ID: /federal senior deduction Idaho conforms to from 2025 \(HB 559, 2026\) is not taken/, OH: /retirement income credit \(at most \$200\) and the joint filing credit are not taken/,
    UT: /retirement credit \(filers born in 1952 or earlier\) is not taken/, GA: /low income credit is not taken/, IN: /unified tax credit for the elderly is not taken/,
    KY: /family size tax credit is not taken/, MA: /senior circuit breaker credit .* not taken/, MI: /deduction for filers born before 1946 is not taken/ };
  if (D31L) { delete NOT.CO; delete NOT.ID; NOT.AZ = /low-income family and property tax credits are not taken \(conservative\)/; NOT.IA = /the low-income exemption is not taken \(conservative\)/; }   // v6.04: the senior deduction is taken (t68 A-7)
  for (const [c, re] of Object.entries(NOT)) CK(`A-10 ${c}: the note names what is not taken (${re.source.slice(0, 64)})`, re.test(SR[c].note), SR[c].note.slice(-260));
  CK("A-11 Idaho's note says the grocery credit is taken against tax only though the law refunds it (DD-3)", /takes against tax only though the law refunds it/.test(SR.ID.note));
  CK("A-12 Colorado's note follows the statute's \"equal to or exceeding\" and says the form says \"exceeds\" (DD-7)", /whose “equal to or exceeding” the model follows; the 2025 form says “exceeds”/.test(SR.CO.note));
  CK("A-13 the held rows say so: AZ, ID, LA, UT name their 2025 figures; Ohio names its 2025 amounts held while indexing is suspended",
     ["AZ", "ID", "LA", "UT"].every(c => /2025/.test(SR[c].note) && /latest published|was not final/.test(SR[c].note)) && /the 2025 amounts, held while indexing is suspended/.test(SR.OH.note));
  const ageBad = [];
  for (const c of flatD) {
    const ages = new Set(SR[c].deduct.flatMap(x => [x.per === "age" ? (x.age ?? 65) : null, x.add ? x.add.age : null, x.byAge ? (x.byAge.age ?? 65) : null]).filter(v => v !== null));
    for (const m of SR[c].note.matchAll(/for each filer (\d{2}) or older/g)) if (!ages.has(+m[1])) ageBad.push(`${c} names ${m[1]}`);
    for (const a of ages) if (!new RegExp(`(for each filer|with a filer) ${a} or older`).test(SR[c].note)) ageBad.push(`${c} silent on ${a}`);
    if (/ at 65 or older/.test(SR[c].note)) ageBad.push(`${c} says "at 65"`);
  }
  CK("A-14 each age a note names for a deduction or credit is one a component applies, every component's age is named, and none says \"at 65\" (t52's rule)", ageBad.length === 0, ageBad.join(", "));
  CK("A-15 the evaluator's `tiers` reads `from` / `to` through `pick` (DD-2): Utah's start is an object", typeof SR.UT.deduct[0].phase.tiers[0][0] === "object");
} else {
  CK("A-1 PIN v6.02: no flat-rate row carries `deduct`, Idaho and Ohio no schedule, no row a `notch`",
     flatD.length === 0 && !SR.ID.brackets && !SR.OH.brackets && Object.keys(SR).every(c => SR[c].notch === undefined), flatD.join(","));
  CK("A-2 PIN v6.02: Ohio's note says 2.75 % on all of it overstates by $384.38 above $26,050; Idaho's that its zero band is taxed",
     /overstates tax by \$384\.38/.test(SR.OH.note) && /zero band \(statutory base \$2,500\) is taxed here/.test(SR.ID.note));
}

// ── B · the edges ──
const det = (code, a) => { let d = null; const t = ST({ ...a, code, _onDetail: x => { d = x; } }); return { t, d }; };
const W = (code, work, single, ageA, ageB) => det(code, { work, single, ageA, ageB: single ? null : ageB });
if (B2) {
  { const a = W("CO", 299999, false, 66, 64), b = W("CO", 300000, false, 66, 64);
    CK("B-1 Colorado: at federal AGI $299,999 the whole federal deduction ($32,200 + $1,650 = $33,850); at $300,000 only $16,000 (\"equal to or exceeding\")",
       a.d.ded === 33850 && b.d.ded === 16000, `${a.d.ded} / ${b.d.ded}`); }
  { const s = W("CO", 300000, true, 70), s2 = W("CO", 299999.5, true, 70);
    CK("B-2 Colorado single 70: $18,150 below $300,000, $12,000 from it", s2.d.ded === 18150 && s.d.ded === 12000, `${s2.d.ded} / ${s.d.ded}`); }
  { const a = W("IL", 250000, true, 66), b = W("IL", 250001, true, 66), c = W("IL", 500000, false, 66, 60), e = W("IL", 500001, false, 66, 60);
    CK("B-3 Illinois: the exemption ($2,925 each + $1,000 for each filer 65 or older) at federal AGI $250,000 single / $500,000 joint, nothing one dollar over",
       a.d.ded === 3925 && b.d.ded === 0 && c.d.ded === 6850 && e.d.ded === 0, [a.d.ded, b.d.ded, c.d.ded, e.d.ded].join(" / ")); }
  { const a = W("IN", 39999, false, 66, 66), b = W("IN", 40000, false, 66, 66), c = W("IN", 39999, false, 66, 60);
    CK("B-4 Indiana: $500 more for each filer 65 or older below federal AGI $40,000 ($5,000 → $4,000 at $40,000; with one filer 65 or older, $3,500)",
       a.d.ded === 5000 && b.d.ded === 4000 && c.d.ded === 3500, [a.d.ded, b.d.ded, c.d.ded].join(" / ")); }
  { const r = [40000, 40001, 80000, 80001, 499999, 500000].map(w => W("OH", w, false, 60, 60).d.ded);
    CK("B-5 Ohio's exemption bands (joint, two exemptions): $4,800 at $40,000, $4,300 at $40,001 and $80,000, $3,800 at $80,001 and $499,999, nothing at $500,000",
       r.join(",") === "4800,4300,4300,3800,3800,0", r.join(",")); }
  { const a = W("OH", 32399, true, 50), b = W("OH", 32400, true, 50), c = W("OH", 34799, false, 50, 50), e = W("OH", 34800, false, 50, 50);
    CK("B-6 Ohio's exemption credit: $20 each while modified AGI less exemptions is under $30,000 — single below $32,400, joint below $34,800",
       a.d.credit === 20 && b.d.credit === 0 && c.d.credit === 40 && e.d.credit === 0, [a.d.credit, b.d.credit, c.d.credit, e.d.credit].join(" / ")); }
  { const a = W("OH", 101899, true, 66), b = W("OH", 101900, true, 66), c = W("OH", 103799, false, 66, 60), e = W("OH", 103800, false, 66, 60), f = W("OH", 90000, false, 66, 66);
    CK("B-7 Ohio's senior citizen credit: $50 per return (not per filer) with a filer 65 or older, while modified AGI less exemptions is under $100,000",
       a.d.credit === 50 && b.d.credit === 0 && c.d.credit === 50 && e.d.credit === 0 && f.d.credit === 50, [a.d.credit, b.d.credit, c.d.credit, e.d.credit, f.d.credit].join(" / ")); }
  { const a = W("OH", 28450, true, 50), b = W("OH", 28451, true, 50);
    EQ("B-8 Ohio's step: taxable income $26,050 → no tax ($20 credit unused)", a.t, 0);
    EQ("B-9 …$26,051 → $332 + 2.75 % × $1 − $20 = $312.0275 (the statute's step, not smoothed)", b.t, 312.0275); }
  { const a = W("ID", 15750 + 4811, true, 50), b = W("ID", 15750 + 4811 + 1000, true, 50);
    EQ("B-10 Idaho: taxable income at the band's top → no tax", a.t, 0);
    EQ("B-11 …$1,000 above it → 5.3 % × $1,000 − $155 → $0 (the credit absorbs it; nonrefundable)", b.t, 0);
    EQ("B-12 …$10,000 above it → $530 − $155 = $375", W("ID", 15750 + 4811 + 10000, true, 50).t, 375); }
  { const at = W("UT", 36426, false, 66, 66), mid = W("UT", 100000, false, 66, 66), zero = W("UT", 36426 + Math.ceil((1932 + 198) / 0.013), false, 66, 66);
    EQ("B-13 Utah: at its joint start the credit is whole — 6 % × ($32,200 + 2 × $1,650) = $2,130", at.d.credit, 2130);
    EQ("B-14 …at $100,000: $2,130 − 1.3 % × $63,574 = $1,303.538", mid.d.credit, 2130 - 0.013 * 63574, 1e-6);
    EQ("B-15 …and nothing once 1.3 % of the excess passes it", zero.d.credit, 0); }
  { const s = W("UT", 18213, true, 50); EQ("B-16 Utah single: the start is $18,213 (the `tiers` `pick` reads the single value) — credit $966 whole", s.d.credit, 966); }
  { const j = W("KY", 100000, false, 66, 66), s = W("KY", 100000, true, 66);
    CK("B-17 Kentucky: one $3,360 deduction per return, a joint return included; $40 for each filer 65 or older", j.d.ded === 3360 && s.d.ded === 3360 && j.d.credit === 80 && s.d.credit === 40, `${j.d.ded} ${s.d.ded} ${j.d.credit} ${s.d.credit}`); }
  { const a = W("MN", 300000, false, 66, 66).d.ded, want = (30600 + 3200) - 0.03 * (300000 - 244400);
    EQ("B-18 the `tiers` `pick` leaves numeric tiers unchanged (Minnesota at $300,000)", a, want, 1e-6); }
} else {
  const a = W("GA", 50000, true, 66); CK("B-1 PIN v6.02: Georgia takes nothing — taxable income is the base", a.d.ded === 0 && a.d.ti === a.d.base, JSON.stringify(a.d));
}

// ── C · hand cases (Decimal, hand603.py; base == federal AGI == work) ──
const HAND = [["AZ", 0, 66, 66, 80000, 1107.5], ["AZ", 1, 50, null, 40000, 606.25], ["CO", 0, 66, 64, 299999, 11710.556], ["CO", 0, 66, 64, 300000, 12496], ["CO", 1, 70, null, 50000, 1401.4],
  ["GA", 0, 66, 66, 120000, 4491], ["GA", 1, 60, null, 40000, 1247.5], ["IA", 0, 66, 66, 100000, 2331], ["IA", 1, 50, null, 30000, 488.2], ["ID", 0, 66, 66, 80000, 1580.934],
  ["ID", 1, 50, null, 20000, 0], ["ID", 1, 70, null, 60000, 1829.267], ["IL", 1, 66, null, 250000, 12180.7125], ["IL", 1, 66, null, 250001, 12375.0495], ["IL", 0, 66, 60, 500000, 24410.925],
  ["IN", 0, 66, 66, 39999, 1032.4705], ["IN", 0, 66, 66, 40000, 1062], ["KY", 0, 66, 66, 100000, 3302.4], ["KY", 1, 50, null, 30000, 932.4], ["LA", 0, 66, 66, 80000, 1650],
  ["MA", 0, 66, 66, 80000, 3490], ["MA", 1, 64, null, 50000, 2280], ["MI", 0, 66, 66, 80000, 2898.5], ["NC", 1, 66, null, 50000, 1486.275], ["OH", 1, 66, null, 30000, 304.625],
  ["OH", 0, 66, 66, 80000, 1647.375], ["OH", 0, 60, 60, 80001, 1711.1525], ["OH", 1, 50, null, 28450, 0], ["OH", 1, 50, null, 28451, 312.0275], ["OH", 1, 66, null, 500000, 13365.625],
  ["OH", 1, 66, null, 101899, 2315.5975], ["OH", 1, 66, null, 101900, 2365.625], ["UT", 0, 66, 66, 80000, 1996.462], ["UT", 1, 50, null, 30000, 522.231], ["UT", 1, 50, null, 100000, 4450],
  ["PA", 1, 66, null, 50000, 1535], ["IA", 1, null, 70, 50000, 1150.3], ["KY", 1, null, 70, 50000, 1592.4], ["GA", 1, null, 70, 50000, 1746.5]];
if (B2) {
  const seen = {};
  for (const [c, s, aA, aB, w, want] of HAND) {
    const who = s ? (aA === null ? `survivor ${aB} (spouse B's slot)` : `single ${aA}`) : `joint ${aA}/${aB}`, k = (seen[c] = (seen[c] || 0) + 1);
    EQ(`C-${c}-${k} ${who}, $${w.toLocaleString("en-US")}: $${want.toFixed(4)}`, ST({ code: c, work: w, single: !!s, ageA: aA, ageB: aB }), want);
  }
  EQ("C-GA-FP the parity fingerprint (Georgia, $260,000, two filers 65+ by count): ($260,000 − 2 × $65,000 − $30,000) × 4.99 % = $4,990",
     ST({ code: "GA", fallbackRate: 0.05, retIncome: 260000, pen: 0, persons65: 2 }), 4990);
} else {
  EQ("C-GA-FP PIN v6.02: the parity fingerprint (Georgia, $260,000, two filers 65+) = ($260,000 − $130,000) × 4.99 % = $6,487",
     ST({ code: "GA", fallbackRate: 0.05, retIncome: 260000, pen: 0, persons65: 2 }), 6487);
}

// ── D · v6.02 -> v6.03 ──
if (B2) {
  // v6.06: the skip read "app_v604.mjs is present", true only in a v603 -> v604 or v604 -> v605 folder; a v605 -> v606 folder has neither app_v602 nor
  // app_v604, so D-0 failed there. Group D belongs to a v602 -> v603 folder only: without app_v602 it is skipped on every leg but v603's.
  if (!existsSync(new URL("./app_v602.mjs", import.meta.url)) && VER !== "v603") console.log("  – group D not run: app_v602.mjs is not in this run folder (a v602 -> v603 folder runs it; t68 D owns v6.03 -> v6.04)");
  else if (!existsSync(new URL("./app_v602.mjs", import.meta.url))) CK("D-0 app_v602.mjs is in this run folder (group D needs it)", false, "missing");
  else {
    const pm = await import("./app_v602.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const grid = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const [aA, aB] of [[50, 48], [61, 59], [66, 64], [72, 70], [null, 70]]) for (const ret of [0, 15000, 40000, 96000, 260000, 1500000])
      for (const pen of [0, 20000]) for (const ss of [0, 25000]) for (const cg of [0, 60000]) {
        if (aA === null && !single) continue;
        grid.push({ code, retIncome: ret, pen, work: 5000, capGains: cg, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: ss ? 10000 : 0, ageA: aA, ageB: single && aA !== null ? null : aB, single });
      }
    for (const w of [26000, 28450, 28451, 32399, 34800, 39999, 40000, 80000, 80001, 101899, 101900, 249999, 250001, 299999, 300000, 499999, 500000, 500001])
      for (const code of FLAT) for (const single of [true, false]) grid.push({ code, retIncome: 0, pen: 0, work: w, capGains: 0, ssTaxableFed: 0, ageA: 66, ageB: single ? null : 64, single });
    // (1) with the fifteen's additions removed, v6.03 is v6.02 byte for byte — every row, the 27 batch-1 rows included (the `tiers` `pick`)
    const saved = {}; for (const c of FLAT) { saved[c] = { deduct: SR[c].deduct, brackets: SR[c].brackets, notch: SR[c].notch }; delete SR[c].deduct; delete SR[c].brackets; delete SR[c].notch; }
    let same = 0; const bad1 = [];
    for (const a of grid) { const x = PST({ ...a }), y = ST({ ...a }); if (Object.is(x, y)) same++; else bad1.push(`${a.code} ${x}->${y}`); }
    for (const c of FLAT) for (const k of ["deduct", "brackets", "notch"]) if (saved[c][k] !== undefined) SR[c][k] = saved[c][k];
    CK(`D-1 with the fifteen's additions removed, the calculator is v6.02's byte for byte (${same} of ${grid.length} calls across all ${Object.keys(SR).length} rows)`, same === grid.length, bad1.slice(0, 3).join(" · "));
    // (2) with them: the fourteen equal the independent implementation on the calculator's own measures; every other row is v6.02's
    const utSS = (a) => { const R = SR.UT.ssRule, m = Math.max(0, a.retIncome + a.pen + a.work + a.capGains + a.ssTaxableFed), thr = a.single ? R.threshold.single : R.threshold.joint;
      return Math.max(0, SR.UT.rate * Math.max(0, a.ssTaxableFed) - R.perDollar * Math.max(0, m - thr)); };
    let ind = 0, same2 = 0, moved = 0; const bad2 = [];
    for (const a of grid) {
      let d = null; const y = ST({ ...a, _onDetail: z => { d = z; } }), x = PST({ ...a });
      if (!D30_FLAT_STATES.includes(a.code)) { if (Object.is(x, y)) same2++; else bad2.push(`${a.code} moved ${x}->${y}`); continue; }
      const sA = a.single && a.ageA === null ? a.ageB : a.ageA, sB = a.single && a.ageA === null ? null : a.ageB;
      const w = d30Tax(SR, a.code, { base: d.base, agi: d.agi, single: a.single, ageA: sA, ageB: sB });
      const ref = Math.max(0, w.tax - (a.code === "UT" ? utSS(a) : 0));
      if (Math.abs(y - ref) <= 1e-6 * Math.max(1, ref) && Math.abs(d.ded - w.ded) <= 1e-6 * Math.max(1, w.ded) && Math.abs(d.credit - w.credit) <= 1e-6 * Math.max(1, w.credit)) ind++;
      else bad2.push(`${a.code} ${JSON.stringify(a)} got ${y} (ded ${d.ded}, credit ${d.credit}) want ${ref} (ded ${w.ded}, credit ${w.credit})`);
      if (y < x - 1e-9) moved++;
    }
    CK(`D-2 with them: the fourteen equal the independent implementation (qa/d30_ref.mjs D30F) on the calculator's own measures (${ind}); every other row — the 27, Pennsylvania and the nine without an income tax — byte-identical (${same2})`,
       bad2.length === 0 && ind + same2 === grid.length, bad2.slice(0, 3).join(" · "));
    CK(`D-3 the direction: no call among the fourteen pays more state tax than at v6.02; ${moved} pay less`,
       grid.filter(a => D30_FLAT_STATES.includes(a.code)).every(a => ST({ ...a }) <= PST({ ...a }) + 1e-9) && moved > 0);
  }
} else console.log("  – group D runs on the v603 leg (it compares against app_v602.mjs)");

// ── E · the display and the Field Manual ──
const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
const DOCS = g.DOCS_HTML().replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
const body = () => window.document.body;
{
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
  const lines = {}; for (const c of [...FLAT, "TX"]) { await pickSt(c); lines[c] = modelLine(); }
  if (B2) {
    CK("E-1 My Data (Georgia): \"4.99% flat rate · deductions and exemptions taken\", and the dated figures add \"deductions 2026\"",
       /^Model: 4\.99% flat rate · deductions and exemptions taken/.test(lines.GA) && /deductions 2026\./.test(lines.GA), lines.GA.slice(0, 220));
    CK("E-2 My Data (Pennsylvania): \"3.07% flat rate\" and no deductions clause — its law has none", /^Model: 3\.07% flat rate · /.test(lines.PA) && !/deductions/.test(lines.PA), lines.PA.slice(0, 160));
    CK("E-3 My Data (Idaho, Ohio): their own schedules, from 0.00 %, with deductions taken", /^Model: the state's own brackets, 0\.00% to 5\.30% · deductions and exemptions taken/.test(lines.ID)
       && /^Model: the state's own brackets, 0\.00% to 2\.75% · deductions and exemptions taken/.test(lines.OH), `${lines.ID.slice(0, 120)} | ${lines.OH.slice(0, 120)}`);
    const nonFlat = FLAT.filter(c => !SR[c].brackets && !/^Model: \d+\.\d\d% flat rate/.test(lines[c]));
    CK("E-4 EXTINCTION: every flat row's line names its rate as flat, and no line or source string says \"effective rate (an approximation)\"",
       nonFlat.length === 0 && FLAT.every(c => !/effective rate \(an approximation\)/.test(lines[c])) && !src.includes("effective rate (an approximation)"), nonFlat.join(","));
    CK("E-4c the Taxes tab's footer no longer calls the state module \"effective-rate approximations\"; it names each state's own rate or schedule after its deductions",
       !src.includes("effective-rate approximations") && src.includes("each state's own rate or bracket schedule, after its standard deduction and exemptions — an approximation layer; verify your state"));
    CK("E-4b a row without an income tax (Texas) reads \"no state income tax\", not a 0.00% rate", /^Model: no state income tax · /.test(lines.TX) && SR.TX.rate === 0, lines.TX.slice(0, 120));
  } else {
    CK("E-1 PIN v6.02: My Data (Georgia) reads \"4.99% effective rate (an approximation)\" with no deductions clause", /^Model: 4\.99% effective rate \(an approximation\)/.test(lines.GA) && !/deductions/.test(lines.GA), lines.GA.slice(0, 160));
  }
  try { await act(async () => { root.unmount(); }); } catch (e) {}
  el.remove();
}
if (B2) {
  CK("E-5 the AI context's state line says \"N% flat, after its deductions and exemptions\" for a flat row carrying them (source)",
     src.includes('`${num(stateTax)}% flat${stateCode && STATE_RULES[stateCode] && STATE_RULES[stateCode].deduct ? ", after its deductions and exemptions" : ""}`'));
  const flatTaking = FLAT.filter(c => SR[c].deduct), noneFlat = FLAT.filter(c => !SR[c].deduct);
  CK(`E-6 the Taxes entry: the fourteen flat-rate states with deductions take them, Pennsylvania's law has none, and what is not taken is named — and the code agrees (${flatTaking.length} flat rows carry \`deduct\`, ${noneFlat.join(",")} none)`,
     DOCS.includes(D31L ? "and from v6.03 the fourteen flat-rate states with them do too (Pennsylvania's law has none; Ohio's retirement income and joint filing credits and Utah's retirement credit are not taken);"   // v6.04: the senior deduction is taken (t68 E-4)
       : "and from v6.03 the fourteen flat-rate states with them do too (Pennsylvania's law has none; the federal senior deduction Arizona, Colorado, Idaho and Iowa allow, Ohio's retirement income and joint filing credits and Utah's retirement credit are not taken),")
     && flatTaking.length === 14 && noneFlat.join(",") === "PA");
  CK("E-7 the methodology entry: the flat-rate states take theirs too (Pennsylvania's law has none)", DOCS.includes("from v6.03 the flat-rate states take theirs too (Pennsylvania's law has none), and no state's itemized deductions are modelled (conservative)."));
  CK("E-8 the state-tax sentence names Idaho's zero band and Ohio's own schedule — and only they of the flat-rate states carry a schedule",
     DOCS.includes("the flat-rate states keep their one rate, with Idaho's zero band and Ohio's own schedule from v6.03)") && FLAT.filter(c => SR[c].brackets).join(",") === "ID,OH");
  CK("E-9 the old claims are gone: \"the flat-rate states take none yet\"", !/flat-rate states take none yet/.test(DOCS));
} else CK("E-5 PIN v6.02: the Field Manual says the flat-rate states take none yet", /the flat-rate states take none yet/.test(DOCS));
done();
