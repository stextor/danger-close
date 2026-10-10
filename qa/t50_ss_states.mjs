// t50 — THE SEVEN "HALF-RATE" SOCIAL SECURITY STATES FOLLOW THEIR OWN LAW (D-19) · docs/SCOPE_SS_STATES.md · v5.85
//
// WHAT v5.85 CHANGED. `stateTaxAnnual` taxed `ss × federally-taxable SS` with ss = 0.5 for CO, CT, MN, NM, RI, UT and VT — for every
// household whatever its income or age. Each state conditions it on income and/or age, so the error changed sign with the household
// (measured at the scope: Colorado +$20K lifetime on the example household, Vermont −$29K). v5.85 gives each state an `ssRule`
// evaluated every year from the function's own AGI measure, filing status and each spouse's age (L-1), models Colorado's shared
// pension cap and Rhode Island's age test per spouse and Minnesota's simplified method only (L-2), uses the latest published
// thresholds (L-3), and applies Utah's 2026 rate cut to 4.45 % (L-4).
//
// EVERY EXPECTED VALUE IS TYPED HERE FROM THE STATUTE, not read from the app (sources in the scope §1). Cases call
// `stateTaxAnnual` directly with no retirement income unless a case says so, so the tax is rate × (work + the state's taxable SS),
// and the function's AGI measure is work + federally taxable SS. Spouses have equal gross benefits unless a case says so.
//
// Run: node t50_ss_states.mjs <tag>        Current leg only (the rules do not exist on the prior leg).
import { d30Pins } from "./d30_ref.mjs";
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601", "v602"];
let pass = 0, fail = 0; const fails = [];
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; const m = `  \u2717 ${n}${d ? " \u2014 " + d : ""}`; console.log(m); fails.push(m); } };
const done = () => { console.log(`\nt50 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t50 \u2014 SOCIAL SECURITY IN THE SEVEN STATES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
const g = (await import(`./app_${VER}.mjs`)).__g;
// v6.02 (D-30 batch 1 — docs/SCOPE_D30_DEDUCTIONS_V602.md, DD-14): CT, MN, NM, RI and VT take their deductions, exemptions and credits. Each
// pin keeps its BASE and on a D-30 leg expects it after them (qa/d30_ref.mjs, on the calculator's own record of the call; a different base
// fails). A version LIST.
const D30L = ["v602"].includes(VER), D30 = d30Pins(g.stateTaxAnnual, g.STATE_RULES(), D30L);
const tax = o => D30.S({ retIncome: 0, pen: 0, work: 0, capGains: 0, ssGrossA: 0, ssGrossB: 0, ageA: 70, ageB: 70, single: false, ...o });
const EQ = (n, got, exp) => CK(n + D30.tag(), Math.abs(got - exp) <= 0.01, `engine ${got.toFixed(2)}, statute ${exp.toFixed(2)}`);
// a household with AGI m, federally taxable SS s, gross G split equally: work = m − s
const H = (code, m, s, G, extra = {}) => tax({ code, work: m - s, ssTaxableFed: s, ssGrossA: G / 2, ssGrossB: G / 2, ...extra });

// ── R · the rates (L-4) ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const SR = g.STATE_RULES();
CK("R-1 Utah's rate is 4.45 % (S.B. 60, 2026 General Session, retroactive to TY2026)", SR.UT && SR.UT.rate === 0.0445, String(SR.UT && SR.UT.rate));

// ── CO · 65+: all taxable SS subtracted; 55–64: all if AGI ≤ $75K / $95K, else $20K per person; SS consumes the pension cap ─────────
EQ("CO-1 joint, both 70, AGI $80,000, SS $30,000 → none of the SS taxed", H("CO", 80000, 30000, 40000), 0.044 * 50000);
EQ("CO-2 joint, both 60, AGI $95,000 (at the line) → none taxed", H("CO", 95000, 30000, 40000, { ageA: 60, ageB: 60 }), 0.044 * 65000);
EQ("CO-3 joint, both 60, AGI $150,000, SS $50,000 → $20,000 each subtracted, $10,000 taxed",
   H("CO", 150000, 50000, 60000, { ageA: 60, ageB: 60 }), 0.044 * (100000 + 10000));
EQ("CO-4 joint, both 50 → no subtraction under 55, all $30,000 taxed", H("CO", 80000, 30000, 40000, { ageA: 50, ageB: 50 }), 0.044 * 80000);
// shared cap: pension $40,000, SS $30,000 (each spouse $15,000 subtracted) → pension subtraction $24,000 − $15,000 = $9,000 each
EQ("CO-5 joint, both 70, pension $40,000, SS $30,000 → SS consumes the $24,000 cap: $22,000 of pension taxed",
   tax({ code: "CO", pen: 40000, ssTaxableFed: 30000, ssGrossA: 20000, ssGrossB: 20000 }), 0.044 * 22000);

// v6.01 (D-22 batch 2, SCOPE_D22_BRACKETS_V601): Connecticut, New Mexico, Rhode Island and Vermont move to their own schedules. Like Minnesota's
// cells below, these pin the SS rule: each keeps its taxable amount and, on the v6.01 leg, prices it on the state's schedule (Connecticut with its
// phase-out and recapture amounts) — computed here from t65 §A's transcription, not the app's. `B2(code, x)` is rate × x on earlier legs. A LIST.
const BR2 = ["v601", "v602"].includes(VER);
const _bs = (rows, x) => { let t = 0, lo = 0; for (const [u, r] of rows) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
const _S2 = { CT: [0.05, [[10000, .02], [50000, .045], [100000, .055], [200000, .06], [250000, .065], [500000, .069], [null, .0699]], [[20000, .02], [100000, .045], [200000, .055], [400000, .06], [500000, .065], [1000000, .069], [null, .0699]]],
  NM: [0.049, [[5500, .015], [16500, .032], [33500, .043], [66500, .047], [210000, .049], [null, .059]], [[8000, .015], [25000, .032], [50000, .043], [100000, .047], [315000, .049], [null, .059]]],
  RI: [0.05, [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0899]], [[82050, .0375], [186450, .0475], [1000000, .0599], [null, .0899]]],
  VT: [0.066, [[50750, .0335], [122850, .066], [256300, .076], [null, .0875]], [[84700, .0335], [204750, .066], [312050, .076], [null, .0875]]] };
const _CTA = { single: [[56500, 5000, 25, 250], [105000, 5000, 25, 250], [200000, 5000, 90, 2700], [500000, 5000, 50, 450]], joint: [[100500, 5000, 50, 500], [210000, 10000, 50, 500], [400000, 10000, 180, 5400], [1000000, 10000, 100, 900]] };
const EQ2 = (n, got, exp) => EQ(BR2 && !D30L ? `${n} [v6.01: the same base on the state's own brackets -> $${exp.toFixed(2)}]` : n, got, exp);
const B2 = (code, x, single = false) => { if (D30L) return D30.B(code, x); const [r0, sg, jt] = _S2[code]; if (!BR2) return r0 * x; let t = _bs(single ? sg : jt, x);
  if (code === "CT") for (const [over, per, each, mx] of _CTA[single ? "single" : "joint"]) if (x > over) t += Math.min(mx, each * Math.ceil((x - over) / per)); return t; };

// ── CT · none taxed if AGI < $75,000 single / < $100,000 joint; otherwise at most 25 % of total benefits ────────────────────────
EQ2("CT-1 joint AGI $99,999 → none taxed", H("CT", 99999, 30000, 40000), B2("CT", 69999));
EQ2("CT-2 joint AGI $100,000 → min($30,000, 25 % × $40,000) = $10,000 taxed", H("CT", 100000, 30000, 40000), B2("CT", (70000 + 10000)));
EQ2("CT-3 single AGI $74,999 → none taxed", H("CT", 74999, 20000, 30000, { single: true }), B2("CT", 54999, true));
EQ2("CT-4 single AGI $75,000, taxable SS $5,000 < 25 % of $30,000 → all $5,000 taxed", H("CT", 75000, 5000, 30000, { single: true }), B2("CT", 75000, true));

// ── MN · all subtracted if AGI ≤ $110,780 joint / $86,410 single (TY2026); −10 % per $4,000 or fraction above ──────────────────
// v6.00 (D-22 option 3, SCOPE_D22_BRACKETS_V600): Minnesota is taxed on its own TY2026 schedule from v6.00. These cells pin the SS rule, so
// each keeps its taxable amount and, on a bracket leg, prices it on the schedule (computed here from the MN DOR table, not the app's). A LIST.
const MN_BRK = ["v600", "v601", "v602"].includes(VER);
const MNS = { single: [[33310, .0535], [109430, .068], [203150, .0785], [null, .0985]], joint: [[48700, .0535], [193480, .068], [337930, .0785], [null, .0985]] };
const mn = (x, single = false) => { if (D30L) return D30.B("MN", x); if (!MN_BRK) return 0.068 * x; let t = 0, lo = 0;
  for (const [u, r] of MNS[single ? "single" : "joint"]) { const hi = u === null ? Infinity : u; if (x <= lo) break; t += (Math.min(x, hi) - lo) * r; lo = hi; } return t; };
EQ("MN-1 joint AGI $110,780 → none taxed", H("MN", 110780, 30000, 40000), mn(80780));
EQ("MN-2 joint AGI $110,781 → 10 % ($3,000) taxed", H("MN", 110781, 30000, 40000), mn(80781 + 3000));
EQ("MN-3 joint AGI $114,780 (exactly one $4,000 step) → 10 % taxed", H("MN", 114780, 30000, 40000), mn(84780 + 3000));
EQ("MN-4 joint AGI $114,781 → 20 % ($6,000) taxed", H("MN", 114781, 30000, 40000), mn(84781 + 6000));
EQ("MN-5 joint AGI $160,000 → all taxed", H("MN", 160000, 30000, 40000), mn(160000));
EQ("MN-6 single AGI $86,411 → 10 % taxed", H("MN", 86411, 20000, 30000, { single: true }), mn(66411 + 2000, true));

// ── NM · none taxed if AGI ≤ $100,000 single / $150,000 joint; a hard cliff ──────────────────────────────────────────────────────
EQ2("NM-1 joint AGI $150,000 → none taxed", H("NM", 150000, 30000, 40000), B2("NM", 120000));
EQ2("NM-2 joint AGI $150,001 → all taxed", H("NM", 150001, 30000, 40000), B2("NM", 150001));
EQ2("NM-3 single AGI $100,000 → none taxed", H("NM", 100000, 20000, 30000, { single: true }), B2("NM", 80000, true));

// ── RI · none taxed if at full retirement age (67 here) AND AGI < $107,000 single / < $133,750 joint; per spouse ─────────────────
EQ2("RI-1 joint, both 67, AGI $133,749 → none taxed", H("RI", 133749, 30000, 40000, { ageA: 67, ageB: 67 }), B2("RI", 103749));
EQ2("RI-2 joint, both 67, AGI $133,750 → all taxed", H("RI", 133750, 30000, 40000, { ageA: 67, ageB: 67 }), B2("RI", 133750));
EQ2("RI-3 joint, 67 and 65, AGI $100,000 → only the 65-year-old's half ($15,000) taxed",
   H("RI", 100000, 30000, 40000, { ageA: 67, ageB: 65 }), B2("RI", (70000 + 15000)));

// ── UT · credit = rate × taxable SS, reduced $0.025 per dollar of AGI over $54,000 single / $90,000 joint; nonrefundable ─────────
EQ("UT-1 single AGI $50,000 → the credit cancels the SS tax", H("UT", 50000, 20000, 30000, { single: true }), 0.0445 * 30000);
EQ("UT-2 single AGI $60,000 → credit $890 − $150 = $740", H("UT", 60000, 20000, 30000, { single: true }), 0.0445 * 60000 - 740);
EQ("UT-3 joint AGI $200,000 → the credit is gone", H("UT", 200000, 30000, 40000), 0.0445 * 200000);

// ── VT · none taxed if AGI ≤ $55,000 single / $70,000 joint; the taxable share rises over the next $10,000 ─────────────────────
EQ2("VT-1 joint AGI $70,000 → none taxed", H("VT", 70000, 30000, 40000), B2("VT", 40000));
EQ2("VT-2 joint AGI $75,000 → half ($15,000) taxed", H("VT", 75000, 30000, 40000), B2("VT", (45000 + 15000)));
EQ2("VT-3 joint AGI $80,000 → all taxed", H("VT", 80000, 30000, 40000), B2("VT", 80000));
EQ2("VT-4 single AGI $57,500 → a quarter ($5,000) taxed", H("VT", 57500, 20000, 30000, { single: true }), B2("VT", (37500 + 5000), true));

// ── X · structure: no fractional `ss` survives; the seven carry an ssRule; everyone else is untouched ────────────────────────────
const frac = Object.entries(SR).filter(([, r]) => typeof r.ss === "number" && r.ss > 0 && r.ss < 1).map(([k]) => k);
CK("X-1 no state keeps a fractional `ss` factor (each rule is either a statute or 0 / 1)", frac.length === 0, frac.join(","));
const seven = ["CO", "CT", "MN", "NM", "RI", "UT", "VT"];
CK("X-2 each of the seven carries an ssRule", seven.every(k => SR[k] && SR[k].ssRule && SR[k].ssRule.kind), seven.filter(k => !(SR[k] && SR[k].ssRule)).join(","));
CK("X-3 no other state carries an ssRule", Object.keys(SR).filter(k => SR[k].ssRule && !seven.includes(k)).length === 0);
done();
