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
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598"];
let pass = 0, fail = 0; const fails = [];
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; const m = `  \u2717 ${n}${d ? " \u2014 " + d : ""}`; console.log(m); fails.push(m); } };
const done = () => { console.log(`\nt50 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t50 \u2014 SOCIAL SECURITY IN THE SEVEN STATES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
const g = (await import(`./app_${VER}.mjs`)).__g;
const tax = o => g.stateTaxAnnual({ retIncome: 0, pen: 0, work: 0, capGains: 0, ssGrossA: 0, ssGrossB: 0, ageA: 70, ageB: 70, single: false, ...o });
const EQ = (n, got, exp) => CK(n, Math.abs(got - exp) <= 0.01, `engine ${got.toFixed(2)}, statute ${exp.toFixed(2)}`);
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

// ── CT · none taxed if AGI < $75,000 single / < $100,000 joint; otherwise at most 25 % of total benefits ────────────────────────
EQ("CT-1 joint AGI $99,999 → none taxed", H("CT", 99999, 30000, 40000), 0.05 * 69999);
EQ("CT-2 joint AGI $100,000 → min($30,000, 25 % × $40,000) = $10,000 taxed", H("CT", 100000, 30000, 40000), 0.05 * (70000 + 10000));
EQ("CT-3 single AGI $74,999 → none taxed", H("CT", 74999, 20000, 30000, { single: true }), 0.05 * 54999);
EQ("CT-4 single AGI $75,000, taxable SS $5,000 < 25 % of $30,000 → all $5,000 taxed", H("CT", 75000, 5000, 30000, { single: true }), 0.05 * 75000);

// ── MN · all subtracted if AGI ≤ $110,780 joint / $86,410 single (TY2026); −10 % per $4,000 or fraction above ──────────────────
EQ("MN-1 joint AGI $110,780 → none taxed", H("MN", 110780, 30000, 40000), 0.068 * 80780);
EQ("MN-2 joint AGI $110,781 → 10 % ($3,000) taxed", H("MN", 110781, 30000, 40000), 0.068 * (80781 + 3000));
EQ("MN-3 joint AGI $114,780 (exactly one $4,000 step) → 10 % taxed", H("MN", 114780, 30000, 40000), 0.068 * (84780 + 3000));
EQ("MN-4 joint AGI $114,781 → 20 % ($6,000) taxed", H("MN", 114781, 30000, 40000), 0.068 * (84781 + 6000));
EQ("MN-5 joint AGI $160,000 → all taxed", H("MN", 160000, 30000, 40000), 0.068 * 160000);
EQ("MN-6 single AGI $86,411 → 10 % taxed", H("MN", 86411, 20000, 30000, { single: true }), 0.068 * (66411 + 2000));

// ── NM · none taxed if AGI ≤ $100,000 single / $150,000 joint; a hard cliff ──────────────────────────────────────────────────────
EQ("NM-1 joint AGI $150,000 → none taxed", H("NM", 150000, 30000, 40000), 0.049 * 120000);
EQ("NM-2 joint AGI $150,001 → all taxed", H("NM", 150001, 30000, 40000), 0.049 * 150001);
EQ("NM-3 single AGI $100,000 → none taxed", H("NM", 100000, 20000, 30000, { single: true }), 0.049 * 80000);

// ── RI · none taxed if at full retirement age (67 here) AND AGI < $107,000 single / < $133,750 joint; per spouse ─────────────────
EQ("RI-1 joint, both 67, AGI $133,749 → none taxed", H("RI", 133749, 30000, 40000, { ageA: 67, ageB: 67 }), 0.05 * 103749);
EQ("RI-2 joint, both 67, AGI $133,750 → all taxed", H("RI", 133750, 30000, 40000, { ageA: 67, ageB: 67 }), 0.05 * 133750);
EQ("RI-3 joint, 67 and 65, AGI $100,000 → only the 65-year-old's half ($15,000) taxed",
   H("RI", 100000, 30000, 40000, { ageA: 67, ageB: 65 }), 0.05 * (70000 + 15000));

// ── UT · credit = rate × taxable SS, reduced $0.025 per dollar of AGI over $54,000 single / $90,000 joint; nonrefundable ─────────
EQ("UT-1 single AGI $50,000 → the credit cancels the SS tax", H("UT", 50000, 20000, 30000, { single: true }), 0.0445 * 30000);
EQ("UT-2 single AGI $60,000 → credit $890 − $150 = $740", H("UT", 60000, 20000, 30000, { single: true }), 0.0445 * 60000 - 740);
EQ("UT-3 joint AGI $200,000 → the credit is gone", H("UT", 200000, 30000, 40000), 0.0445 * 200000);

// ── VT · none taxed if AGI ≤ $55,000 single / $70,000 joint; the taxable share rises over the next $10,000 ─────────────────────
EQ("VT-1 joint AGI $70,000 → none taxed", H("VT", 70000, 30000, 40000), 0.066 * 40000);
EQ("VT-2 joint AGI $75,000 → half ($15,000) taxed", H("VT", 75000, 30000, 40000), 0.066 * (45000 + 15000));
EQ("VT-3 joint AGI $80,000 → all taxed", H("VT", 80000, 30000, 40000), 0.066 * 80000);
EQ("VT-4 single AGI $57,500 → a quarter ($5,000) taxed", H("VT", 57500, 20000, 30000, { single: true }), 0.066 * (37500 + 5000));

// ── X · structure: no fractional `ss` survives; the seven carry an ssRule; everyone else is untouched ────────────────────────────
const frac = Object.entries(SR).filter(([, r]) => typeof r.ss === "number" && r.ss > 0 && r.ss < 1).map(([k]) => k);
CK("X-1 no state keeps a fractional `ss` factor (each rule is either a statute or 0 / 1)", frac.length === 0, frac.join(","));
const seven = ["CO", "CT", "MN", "NM", "RI", "UT", "VT"];
CK("X-2 each of the seven carries an ssRule", seven.every(k => SR[k] && SR[k].ssRule && SR[k].ssRule.kind), seven.filter(k => !(SR[k] && SR[k].ssRule)).join(","));
CK("X-3 no other state carries an ssRule", Object.keys(SR).filter(k => SR[k].ssRule && !seven.includes(k)).length === 0);
done();
