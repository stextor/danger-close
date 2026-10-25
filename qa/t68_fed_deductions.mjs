// t68 — D-31 (DEDUCTIONS A STATE TAKES FROM THE FEDERAL RETURN) AND D-29 (MISSOURI'S CAPITAL-GAINS SUBTRACTION) · docs/SCOPE_D31_D29_V604.md · v6.04
//
// Through v6.03 the state calculator was given no model year and no federal tax, so Alabama's, Missouri's and Oregon's deduction of federal income
// tax and the federal senior deduction (2025-2028) six states carry could not be taken, and Missouri's 100 % capital-gains subtraction (from 2025) was
// not modelled — each conservative, disclosed. v6.04 passes four arguments from the three call sites (`taxYear`, `fedIncomeTax`, `fedNiit`, `gains`)
// and gives the evaluator three fields (`of: "fedtax"`, `cap`, `years`) and Missouri's row `gainsExempt`.
//
// Groups:  A the nine rows' new components equal the scope's §0.2; the senior component reads OBBBA_CONSTS; EXTINCTION: only AL, MO, OR carry a
//            federal-tax component, only the six a senior one, only Missouri `gainsExempt`; notes name what is taken
//          B the edges through the calculator: Missouri's bands and caps, Oregon's bands, the senior window and phase-out, Alabama's NIIT,
//            Missouri's gains (dividends stay taxed), and a call without the new arguments is v6.03's
//          C hand cases to the cent (Decimal, session working hand604.py, recorded in the scope's §6)
//          D v6.03 -> v6.04 (v604 leg, needs app_v603.mjs): without the new arguments byte-identical; with them, the nine equal qa/d30_ref.mjs on
//            the calculator's own measures, every other row byte-identical
//          E the engines: Engine B passes the year, its federal tax and NIIT and its realized gains (its state tax equals the calculator on its own
//            row's arguments), and its state senior deduction equals the federal bonus on the same MAGI; the three call sites by AST; the Field Manual
// BOTH LEGS: the v603 leg pins the absence of all of it. Run: node t68_fed_deductions.mjs <tag>
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { d30Tax } from "./d30_ref.mjs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v603", "v604", "v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 300) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt68 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t68 — STATE DEDUCTIONS FROM THE FEDERAL RETURN (D-31) AND MISSOURI'S CAPITAL GAINS (D-29) (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const ON = VER !== "v603";
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const g = window.__g, SR = g.STATE_RULES(), ST = g.stateTaxAnnual, OB = g.OBBBA_CONSTS();
const sj = (a, b) => ({ single: a, joint: b });
const NINE = ["AL", "MO", "OR", "MT", "ND", "CO", "IA", "ID", "AZ"], SIX = ["MT", "ND", "CO", "IA", "ID", "AZ"], FT3 = ["AL", "MO", "OR"];

// ── A · the components ──
const SENIOR = { what: "federal senior deduction (2025–2028)", kind: "ded", per: "age", age: 65, amt: 6000, years: [2025, 2028],
  phase: { on: "agi", shape: "rate", start: sj(75000, 150000), rate: 0.06, floor: 0 } };
const MO_T = [[25000, 0.35], [50000, 0.25], [100000, 0.15], [125000, 0.05], [null, 0]];
const FT = {
  AL: { what: "federal income tax", kind: "ded", per: "return", of: "fedtax", niit: true, amt: 1 },
  MO: { what: "federal income tax", kind: "ded", per: "return", of: "fedtax", amt: 1, phase: { on: "base", shape: "table", rows: { single: MO_T, joint: MO_T } }, cap: sj(5000, 10000) },
  OR: { what: "federal income tax", kind: "ded", per: "return", of: "fedtax", amt: 1, cap: { on: "agi", rows: {
    single: [[125000, 8500, "lt"], [130000, 6800, "lt"], [135000, 5100, "lt"], [140000, 3400, "lt"], [145000, 1700, "lt"], [null, 0]],
    joint: [[250000, 8500, "lt"], [260000, 6800, "lt"], [270000, 5100, "lt"], [280000, 3400, "lt"], [290000, 1700, "lt"], [null, 0]] } } },
};
const lastOf = c => (SR[c].deduct || [])[SR[c].deduct.length - 1];
const fedRows = Object.keys(SR).filter(c => (SR[c].deduct || []).some(x => x.of !== undefined)).sort();
const senRows = Object.keys(SR).filter(c => (SR[c].deduct || []).some(x => x.years !== undefined)).sort();
if (ON) {
  for (const c of FT3) CK(`A-1 ${c}: the federal-income-tax component equals §0.2, last in the row's list`, JSON.stringify(lastOf(c)) === JSON.stringify(FT[c]), JSON.stringify(lastOf(c)));
  for (const c of SIX) CK(`A-2 ${c}: the senior-deduction component equals §0.2 (IRC §151(d)(5)(C))`, JSON.stringify(lastOf(c)) === JSON.stringify(SENIOR), JSON.stringify(lastOf(c)));
  CK("A-3 the senior component's figures ARE the federal block's — $6,000, $75,000 / $150,000, 6 %, through 2028 (OBBBA_CONSTS)",
     OB.SENIOR_BONUS_PER_PERSON === 6000 && OB.SENIOR_BONUS_THR_SGL === 75000 && OB.SENIOR_BONUS_THR_MFJ === 150000 && OB.SENIOR_BONUS_PHASE_RATE === 0.06 && OB.SENIOR_BONUS_SUNSET_YEAR === 2028);
  CK("A-4 EXTINCTION: only Alabama, Missouri and Oregon carry a federal-income-tax component", fedRows.join(",") === "AL,MO,OR", fedRows.join(","));
  CK("A-5 EXTINCTION: only the six whose returns carry the federal senior deduction carry a dated (`years`) component — not DC, not South Carolina", senRows.join(",") === SIX.slice().sort().join(","), senRows.join(","));
  CK("A-6 EXTINCTION: only Missouri subtracts capital gains (`gainsExempt`)", Object.keys(SR).filter(c => SR[c].gainsExempt !== undefined).join(",") === "MO" && SR.MO.gainsExempt === true);
  const ok = c => /from v6\.04/.test(SR[c].note) && !/(federal income tax|senior deduction)[^;]*not taken/.test(SR[c].note);
  CK("A-7 each of the nine notes says what v6.04 takes, and none still says its federal-income-tax or senior deduction is not taken", NINE.every(ok), NINE.filter(c => !ok(c)).join(","));
  CK("A-8 Missouri's note: the capital-gains subtraction is taken, qualified dividends stay taxed; the federal-tax percentage on Missouri AGI where the statute says gross income",
     /100% subtraction of capital gains from 2025 is taken/.test(SR.MO.note) && /qualified dividends stay taxed/.test(SR.MO.note) && /where the statute says Missouri gross income/.test(SR.MO.note));
  CK("A-9 Oregon's note holds its 2025 cap ($8,500, conservative); Colorado's says the senior deduction is outside the Proposition FF addback",
     /at most \$8,500 \(the 2025 cap, held: conservative\)/.test(SR.OR.note) && /not part of the Proposition FF addback/.test(SR.CO.note));
} else {
  CK("A-1 PIN v6.03: no federal-tax or dated component, no `gainsExempt`; the notes say these are not taken",
     fedRows.length === 0 && senRows.length === 0 && SR.MO.gainsExempt === undefined && /deduction of federal income tax that Alabama allows is not taken/.test(SR.AL.note) && /subtraction of capital gains from 2025 \(HB 594\) is not modelled/.test(SR.MO.note));
}

// ── B · the edges ──
const det = (code, a) => { let d = null; const t = ST({ code, retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ...a, _onDetail: x => { d = x; } }); return { t, d }; };
const W = (code, work, single, ageA, ageB, x = {}) => det(code, { work, single, ageA, ageB: single ? null : ageB, ...x });
if (ON) {
  { const r = [25000, 25001, 50000, 50001, 100000, 100001, 125000, 125001].map(w => W("MO", w, true, 50, null, { taxYear: 2026, fedIncomeTax: 1000 }).d.ded - 16100);
    CK("B-1 Missouri's percentage by Missouri AGI: 35 % to $25,000, 25 % to $50,000, 15 % to $100,000, 5 % to $125,000, none above (of $1,000 of federal tax)",
       r.map(x => Math.round(x)).join(",") === "350,250,250,150,150,50,50,0", r.join(",")); }
  { const s = W("MO", 20000, true, 50, null, { taxYear: 2026, fedIncomeTax: 40000 }).d.ded - 16100, j = W("MO", 20000, false, 50, 50, { taxYear: 2026, fedIncomeTax: 40000 }).d.ded - 32200;
    CK("B-2 Missouri's caps: $5,000 single, $10,000 joint (35 % of $40,000 = $14,000)", s === 5000 && j === 10000, `${s} / ${j}`); }
  { const s = [124999, 125000, 129999, 130000, 144999, 145000].map(w => W("OR", w, true, 50, null, { fedIncomeTax: 20000 }).d.ded - 2835);
    const j = [249999, 250000, 289999, 290000].map(w => W("OR", w, false, 50, 50, { fedIncomeTax: 20000 }).d.ded - 5670);
    CK("B-3 Oregon's cap by federal AGI: $8,500 under $125,000 single, $6,800 from it … $1,700, nothing from $145,000; joint at double the AGI, the same dollars",
       s.join(",") === "8500,6800,6800,5100,1700,0" && j.join(",") === "8500,6800,1700,0", `${s} | ${j}`); }
  { const r = [2024, 2025, 2028, 2029].map(y => W("MT", 100000, false, 66, 66, { taxYear: y }).d.ded - (32200 + 3300));
    CK("B-4 the senior deduction exists in 2025-2028 only ($12,000 for two filers 65 or older), not in 2024 or 2029", r.join(",") === "0,12000,12000,0", r.join(",")); }
  { const a = W("MT", 160000, false, 66, 66, { taxYear: 2027 }).d.ded - 35500, b = W("MT", 160000, false, 66, 60, { taxYear: 2027 }).d.ded - (32200 + 1650),
        c = W("MT", 250000, false, 66, 66, { taxYear: 2027 }).d.ded - 35500, s = W("MT", 85000, true, 70, null, { taxYear: 2027 }).d.ded - 18150;
    CK("B-5 the phase-out: 6 % of federal AGI above $150,000 joint per filer ($5,400 each at $160,000), one filer 65+ gets one, nothing at $250,000; single above $75,000",
       Math.abs(a - 10800) < 1e-6 && Math.abs(b - 5400) < 1e-6 && c === 0 && Math.abs(s - 5400) < 1e-6, `${a} ${b} ${c} ${s}`); }
  { const w = W("AL", 60000, true, 50, null, { fedIncomeTax: 5000, fedNiit: 400 }).d, wo = W("AL", 60000, true, 50, null, { fedIncomeTax: 5000 }).d,
        m = W("MO", 60000, true, 50, null, { fedIncomeTax: 5000, fedNiit: 400, taxYear: 2026 }).d, mo = W("MO", 60000, true, 50, null, { fedIncomeTax: 5000, taxYear: 2026 }).d;
    CK("B-6 Alabama counts the net investment income tax with the federal tax; Missouri does not", w.ded - wo.ded === 400 && m.ded === mo.ded, `${w.ded - wo.ded} / ${m.ded - mo.ded}`); }
  { const a = det("MO", { capGains: 30000, gains: 20000, single: true, ageA: 50, ageB: null }).d, b = det("MO", { capGains: 30000, single: true, ageA: 50, ageB: null }).d,
        c = det("MO", { capGains: 5000, gains: 20000, single: true, ageA: 50, ageB: null }).d, v = det("VA", { capGains: 30000, gains: 20000, single: true, ageA: 50, ageB: null }).d;
    CK("B-7 Missouri subtracts the realized gains ($20,000 of $30,000 — the qualified dividends stay), never more than `capGains`; its federal-AGI measure keeps them; no other row does",
       a.base === 10000 && a.gains === 20000 && b.base === 30000 && c.base === 0 && a.agi === 30000 && v.base === 30000 && v.gains === 0, JSON.stringify([a.base, b.base, c.base, a.agi, v.base])); }
  { let same = 0, n = 0; for (const c of Object.keys(SR)) for (const w of [0, 30000, 160000]) for (const single of [true, false]) {
      n++; const a = { code: c, retIncome: w, pen: 10000, work: 5000, capGains: 8000, ssTaxableFed: 6000, ssGrossA: 9000, ssGrossB: 4000, ageA: 67, ageB: single ? null : 66, single };
      if (Object.is(ST(a), ST({ ...a, taxYear: null, fedIncomeTax: 0, fedNiit: 0, gains: 0 }))) same++; }
    CK(`B-8 omitting the new arguments is the same as passing nothing (${same} of ${n} calls)`, same === n); }
} else {
  const a = W("MO", 60000, true, 50, null, { taxYear: 2026, fedIncomeTax: 5000, gains: 1000 }), b = W("MO", 60000, true, 50, null);
  CK("B-1 PIN v6.03: the calculator ignores a year, federal tax and gains", a.t === b.t && a.d.ded === b.d.ded);
}

// ── C · hand cases (hand604.py, Decimal) ──
const HAND = [["AL", 1, 50, null, 40000, 3000, 0, 2026, 1610], ["AL", 0, 66, 66, 100000, 8000, 500, 2026, 4095], ["MO", 1, 66, null, 24000, 1000, 0, 2026, 104.88],
  ["MO", 0, 66, 66, 60000, 4000, 0, 2027, 942.668], ["MO", 0, 66, 66, 300000, 90000, 0, 2027, 12250.868], ["OR", 1, 66, null, 124999, 20000, 0, 2026, 9521.6],
  ["OR", 1, 66, null, 125000, 20000, 0, 2026, 9670.4375], ["OR", 0, 66, 66, 285000, 40000, 0, 2026, 23774.37], ["MT", 0, 66, 66, 100000, 0, 0, 2027, 2467.5],
  ["MT", 0, 66, 66, 100000, 0, 0, 2029, 3031.5], ["ND", 1, 70, null, 90000, 0, 0, 2028, 334.9125], ["CO", 0, 66, 60, 160000, 0, 0, 2026, 5313],
  ["IA", 0, 66, 66, 120000, 0, 0, 2026, 2635], ["AZ", 1, 66, null, 70000, 0, 0, 2028, 1153.75], ["AZ", 1, 66, null, 70000, 0, 0, 2024, 1303.75]];
if (ON) { const seen = {}; for (const [c, s, aA, aB, w, ft, fn, yr, want] of HAND) { const k = (seen[c] = (seen[c] || 0) + 1);
  EQ(`C-${c}-${k} ${s ? `single ${aA}` : `joint ${aA}/${aB}`}, $${w.toLocaleString("en-US")}, ${yr}, federal tax $${ft.toLocaleString("en-US")}${fn ? ` + NIIT $${fn}` : ""}: $${want.toFixed(4)}`,
     ST({ code: c, work: w, single: !!s, ageA: aA, ageB: aB, taxYear: yr, fedIncomeTax: ft, fedNiit: fn }), want); } }

// ── D · v6.03 -> v6.04 ──
if (ON) {
  if (!existsSync(new URL("./app_v603.mjs", import.meta.url))) console.log("  – group D not run: app_v603.mjs is not in this run folder (a v603 -> v604 folder runs it)");
  else {
    const pm = await import("./app_v603.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const grid = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const [aA, aB] of [[50, 48], [66, 64], [72, 70], [null, 70]]) for (const ret of [0, 40000, 96000, 260000])
      for (const cg of [0, 60000]) for (const yr of [2026, 2028, 2029]) for (const ft of [0, 9000, 60000]) {
        if (aA === null && !single) continue;
        grid.push({ code, retIncome: ret, pen: 20000, work: 5000, capGains: cg, gains: cg / 2, ssTaxableFed: 15000, ssGrossA: 20000, ssGrossB: 8000, ageA: aA, ageB: single && aA !== null ? null : aB, single,
                    taxYear: yr, fedIncomeTax: ft, fedNiit: ft / 20 });
      }
    // Band sweep (added at the build: the controls showed the household grid never put Missouri's base inside its 25 % band or Oregon's AGI inside
    // its first step, so a moved band passed D-2): wages alone, so base = AGI = the wage, across every band edge of Missouri, Oregon and Alabama.
    for (const code of ["MO", "OR", "AL"]) for (const single of [true, false]) for (const w of [10000, 24000, 30000, 45000, 70000, 110000, 124000, 125500, 127000, 132000, 137000, 142000, 147000, 251000, 255000, 265000, 275000, 285000, 295000])
      grid.push({ code, retIncome: 0, pen: 0, work: w, capGains: 0, gains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: 50, ageB: single ? null : 48, single, taxYear: 2026, fedIncomeTax: 9000, fedNiit: 450 });
    const strip = a => { const { taxYear, fedIncomeTax, fedNiit, gains, ...r } = a; return r; };
    let same = 0; const bad1 = [];
    for (const a of grid) { const x = PST(strip(a)), y = ST(strip(a)); if (Object.is(x, y)) same++; else bad1.push(`${a.code} ${x}->${y}`); }
    CK(`D-1 without the new arguments the calculator is v6.03's byte for byte (${same} of ${grid.length} calls, all ${Object.keys(SR).length} rows)`, same === grid.length, bad1.slice(0, 3).join(" · "));
    const utSS = (a) => { const R = SR.UT.ssRule, m = Math.max(0, a.retIncome + a.pen + a.work + a.capGains + a.ssTaxableFed), thr = a.single ? R.threshold.single : R.threshold.joint;
      return Math.max(0, SR.UT.rate * Math.max(0, a.ssTaxableFed) - R.perDollar * Math.max(0, m - thr)); };
    let ind = 0, same2 = 0, moved = 0; const bad2 = [];
    for (const a of grid) {
      let d = null; const y = ST({ ...a, _onDetail: z => { d = z; } }), x = PST(strip(a));
      if (!NINE.includes(a.code)) { if (Object.is(x, y)) same2++; else bad2.push(`${a.code} moved ${x}->${y}`); continue; }
      const sA = a.single && a.ageA === null ? a.ageB : a.ageA, sB = a.single && a.ageA === null ? null : a.ageB;
      const w = d30Tax(SR, a.code, { base: d.base, agi: d.agi, single: a.single, ageA: sA, ageB: sB, capGains: a.capGains, fedTax: a.fedIncomeTax, fedNiit: a.fedNiit, yr: a.taxYear });
      if (Math.abs(y - w.tax) <= 1e-6 * Math.max(1, w.tax) && Math.abs(d.ded - w.ded) <= 1e-6 * Math.max(1, w.ded)) ind++; else bad2.push(`${a.code} ${JSON.stringify(a)} got ${y} (ded ${d.ded}) want ${w.tax} (ded ${w.ded})`);
      if (y < x - 1e-9) moved++;
    }
    CK(`D-2 with them: the nine equal the independent implementation (qa/d30_ref.mjs) on the calculator's own measures (${ind}); every other row byte-identical (${same2})`,
       bad2.length === 0 && ind + same2 === grid.length, bad2.slice(0, 3).join(" · "));
    CK(`D-3 the direction: no call among the nine pays more than at v6.03; ${moved} pay less`, grid.filter(a => NINE.includes(a.code)).every(a => ST(a) <= PST(strip(a)) + 1e-9) && moved > 0);
    CK("D-4 Missouri's base moved only by the gains: its records with and without `gains` differ by exactly the subtracted amount", grid.filter(a => a.code === "MO").every(a => {
      let d1 = null, d0 = null; ST({ ...a, _onDetail: z => { d1 = z; } }); ST({ ...a, gains: 0, _onDetail: z => { d0 = z; } }); return Math.abs((d0.base - d1.base) - Math.min(a.capGains, a.gains)) < 1e-9; }));
  }
} else console.log("  – group D runs on the v604 leg (it compares against app_v603.mjs)");

// ── E · the engines and the Field Manual ──
const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
{
  const M = await import(`./app_${VER}.mjs`), E = M.__g, Eng = M.__engines;   // one module instance: the loader and the engine must share PORTFOLIO
  const BASE = JSON.parse(JSON.stringify(E.PORTFOLIO()));
  const ss0 = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  const runB = (code, pension) => { const P = JSON.parse(JSON.stringify(BASE));
    Object.assign(P, { positions: [], otherAccounts: [], _incomeFromForm: true, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }],
      single: false, dobA: "1958-01-01", dobB: "1959-01-01", lifeExpA: 95, lifeExpB: 95, incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: pension / 12 } }, stateCode: code });
    E.applyLoadedData({ portfolio: P }); return Eng.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows; };
  const callOf = (code, r, withNew) => { let d = null; const t = E.stateTaxAnnual({ code, retIncome: r.rmdTax_y + r.conv_y + r.ordDraw_y, pen: r.pen_y, work: r.work_y + r.otherOrd_y, capGains: r.capGains_y + r.div_y,
      ssTaxableFed: r.ssTaxable, ssGrossA: r.ssA_y, ssGrossB: r.ssB_y, ageA: r.ageA, ageB: r.ageB, single: !!r.filingSingle,
      ...(withNew ? { taxYear: r.yr, fedIncomeTax: r.fedTax + r.capGainsTax + r.amt_y, fedNiit: r.niit_y, gains: r.capGains_y } : {}), _onDetail: x => { d = x; } }); return { t, d }; };
  const bad = [], senBad = []; let years = 0, senYears = 0;
  for (const pension of [60000, 170000]) for (const code of NINE) {
    const rows = runB(code, pension);
    for (const r of rows) { if (r.widowed) continue; years++;
      const c = callOf(code, r, ON);
      if (Math.abs(c.t - r.stateTax) > 0.01) bad.push(`${code} ${pension} ${r.yr}: engine ${r.stateTax} vs call ${c.t}`);
      if (ON && SIX.includes(code) && r.yr <= 2028) { senYears++;
        const without = callOf(code, { ...r, yr: 2099 }, true).d.ded, stateSen = c.d.ded - without;
        const n65 = (r.ageA >= 65 ? 1 : 0) + (!r.filingSingle && r.ageB >= 65 ? 1 : 0);
        const fedBonus = Math.round(n65 * Math.max(0, 6000 - 0.06 * Math.max(0, r.magi_y - (r.filingSingle ? 75000 : 150000))));
        if (Math.abs(stateSen - fedBonus) > 1 || Math.abs(c.d.agi - r.magi_y) > 0.5) senBad.push(`${code} ${pension} ${r.yr}: state ${stateSen} fed ${fedBonus} (agi ${c.d.agi} magi ${r.magi_y})`); } }
  }
  CK(`E-1 Engine B's state tax equals the calculator on its own row's arguments ${ON ? "WITH the year, its federal tax and NIIT and its realized gains" : "(PIN v6.03: without them)"} — ${years} year-rows, nine states, two households`, bad.length === 0 && years > 100, bad.slice(0, 3).join(" · "));
  if (ON) CK(`E-2 in 2026-2028 the six states' senior deduction equals the federal bonus on the same MAGI, to the dollar (${senYears} year-rows; the calculator's AGI measure is Engine B's MAGI)`, senBad.length === 0 && senYears >= 30, senBad.slice(0, 3).join(" · "));
  const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const WB = { ...walk.base, JSXElement(n, s, c) { c(n.openingElement, s); n.children.forEach(x => c(x, s)); }, JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); },
    JSXOpeningElement(n, s, c) { n.attributes.forEach(a => c(a, s)); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); }, JSXSpreadAttribute(n, s, c) { c(n.argument, s); },
    JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); }, JSXText() {}, JSXEmptyExpression() {} };
  const sites = []; walk.full(ast, n => { if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "stateTaxAnnual" && n.arguments[0] && n.arguments[0].type === "ObjectExpression")
    sites.push(Object.fromEntries(n.arguments[0].properties.filter(p => p.key).map(p => [p.key.name, src.slice(p.value.start, p.value.end)]))); }, WB);
  if (ON) {
    const want = [{ taxYear: "yr", fedIncomeTax: "fedC + qdcgTaxC + amtC", fedNiit: "niitC" }, { taxYear: "yr", fedIncomeTax: "fed + qdcgTax + amt", fedNiit: "niit" },
                  { taxYear: "yr", fedIncomeTax: "fedTax + capGainsTax + amt_y", fedNiit: "niit_y", gains: "capGains_y" }];
    CK("E-3 (AST) all three call sites pass the year and the federal income tax as ordinary + capital-gains-rate + AMT, and NIIT apart; only Engine B (which realizes gains) passes `gains`",
       sites.length === 3 && want.every((w, i) => Object.entries(w).every(([k, v]) => sites[i][k] === v)) && sites[0].gains === undefined && sites[1].gains === undefined, JSON.stringify(sites.map(s => [s.taxYear, s.fedIncomeTax, s.fedNiit, s.gains])));
  } else CK("E-3 PIN v6.03 (AST): three call sites, none passing a year or federal tax", sites.length === 3 && sites.every(s => s.taxYear === undefined && s.fedIncomeTax === undefined));
}
const DOCS = g.DOCS_HTML().replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
if (ON) {
  CK("E-4 the Taxes entry: from v6.04 AL, MO and OR deduct federal income tax, the six take the senior deduction, Missouri subtracts gains — and the code agrees",
     DOCS.includes("from v6.04 Alabama, Missouri and Oregon deduct the year's federal income tax as their laws allow, the six states whose returns carry the federal senior deduction of 2025–2028 (Arizona, Colorado, Idaho, Iowa, Montana, North Dakota) take it, and Missouri subtracts realized capital gains,")
     && fedRows.join(",") === "AL,MO,OR" && senRows.join(",") === "AZ,CO,IA,ID,MT,ND");
  CK("E-5 the methodology entry says the same", DOCS.includes("From v6.04 the deductions some states take from the federal return are taken too — Alabama's, Missouri's and Oregon's deduction of federal income tax, and the federal senior deduction (2025–2028) in the six states whose returns carry it — and so is Missouri's subtraction of capital gains."));
  CK("E-6 the old claims are gone: the federal-income-tax and senior deductions are no longer named as not taken", !/Missouri's and Oregon's deduction of federal income tax, the federal senior deduction Montana and North Dakota start from, and low-income refundable credits are not taken/.test(DOCS) && !/the federal senior deduction Arizona, Colorado, Idaho and Iowa allow/.test(DOCS));
} else CK("E-4 PIN v6.03: the Field Manual says these are not taken", /deduction of federal income tax, the federal senior deduction Montana and North Dakota start from, and low-income refundable credits are not taken/.test(DOCS));
done();
