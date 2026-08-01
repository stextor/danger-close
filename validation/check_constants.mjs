// Danger Close — statutory-constant validation.
// Parses src/DangerClose.jsx and asserts the tax/IRMAA/QCD/state constants against their
// primary sources. Run: node validation/check_constants.mjs
import { readFileSync } from "fs";
const src = readFileSync(new URL("../src/DangerClose.jsx", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, cond, cite) => { if (cond) { pass++; console.log("OK  ", name); } else { fail++; console.log("FAIL", name, "—", cite); } };
const has = (s) => src.includes(s);

// ── Federal 2026 (Rev. Proc. 2025-32, incl. OBBBA) — web-verified Jul 2026 ──
check("MFJ standard deduction $32,200", has("MFJ_STD: 32200"), "Rev. Proc. 2025-32");
check("Single standard deduction $16,100", has("SGL_STD: 16100"), "Rev. Proc. 2025-32");
// Every ordinary bracket edge, both filing statuses (verified against KPMG's Rev. Proc. 2025-32 summary):
const sglEdges = [[0.10,12400],[0.12,50400],[0.22,105700],[0.24,201775],[0.32,256225],[0.35,640600]];
const mfjEdges = [[0.10,24800],[0.12,100800],[0.22,211400],[0.24,403550],[0.32,512450],[0.35,768700]];
for (const [r,u] of sglEdges) check(`Single ${(r*100).toFixed(0)}% bracket top $${u.toLocaleString()}`, has(`{ rate: ${r.toFixed(2)}, upper: ${u} }`), "Rev. Proc. 2025-32");
for (const [r,u] of mfjEdges) check(`MFJ ${(r*100).toFixed(0)}% bracket top $${u.toLocaleString()}`, new RegExp(`MFJ_BR:[\\s\\S]{0,400}\\{ rate: ${r.toFixed(2)}, upper: ${u} \\}`).test(src), "Rev. Proc. 2025-32");
check("MFJ 0% LTCG bracket top $98,900", has("MFJ_LTCG: [{ rate: 0.0, upper: 98900 }"), "Rev. Proc. 2025-32");
check("Single 0% LTCG bracket top $49,450", has("SGL_LTCG: [{ rate: 0.0, upper: 49450 }"), "Rev. Proc. 2025-32");
check("NIIT thresholds $200K/$250K (statutory, unindexed)", has("SGL_NIIT: 200000, MFJ_NIIT: 250000"), "IRC §1411");
check("Senior extra std deduction $2,050/$1,650", has("SENIOR_EXTRA_SGL: 2050, SENIOR_EXTRA_MFJ: 1650"), "Rev. Proc. 2025-32");
check("SS provisional-income thresholds 25/32/34/44K", has("SS_THR1_SGL: 25000, SS_THR1_MFJ: 32000") && has("SS_THR2_SGL: 34000, SS_THR2_MFJ: 44000"), "IRC §86, unindexed");
check("2026 SS wage base $184,500", has("SS_WAGE_BASE: 184500"), "SSA Oct-2025 announcement; IRS Pub. 926");

// ── IRMAA 2026 (CMS; premiums $202.90 std, surcharges B $81.20–$487 + D $14.50–$91) ──
check("IRMAA first thresholds $109K/$218K", has("SGL: [109000,") && has("MFJ: [218000,"), "CMS 2026 (based on 2024 MAGI)");
check("IRMAA top statutory tier $500K/$750K", has("500000, Infinity]") && has("750000, Infinity]"), "CMS; top tier fixed by law");
// SUR = combined Part B + Part D annual surcharge per person. Derivation from CMS monthlies:
// tier1 (81.20+14.50)*12 = 1,148 ≈ 1150; top (487.00+91.00)*12 = 6,936 ≈ 6940.
check("IRMAA combined B+D annual surcharges [0,1150,2880,4620,6360,6940]", has("SUR: [0, 1150, 2880, 4620, 6360, 6940]"), "derived from CMS 2026 B+D monthlies");

// ── RMDs (IRS Uniform Lifetime Table, post-2022; SECURE 2.0 §107 start ages) ──
const ult = {72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,85:16.0,90:12.2,95:8.9,100:6.4};
for (const [age,div] of Object.entries(ult)) check(`RMD divisor age ${age} = ${div}`, has(`${age}:${div}`), "IRS Pub. 590-B Uniform Lifetime Table");
check("RMD start age 73 (born 1951–59) / 75 (1960+)", /rmdStartAge[\s\S]{0,220}1960/.test(src) && has("73 (born 1951–1959), 75 (born 1960 or later)"), "SECURE 2.0 §107");

// ── QCD (IRS Rev. Proc. 2025-32 / IRC 408(d)(8), SECURE 2.0 indexing) ──
check("QCD 2026 per-person cap $111,000", has("QCD_LIMIT: 111000"), "Rev. Proc. 2025-32; $222K/couple");

// ── State module sanity ──
const ssPartial = [...src.matchAll(/([A-Z]{2}): \{ name: "[^"]+", rate: [\d.]+, ss: 0\.5/g)].map(m => m[1]).sort();
check("Exactly 8 partial-SS states (CO,CT,MN,MT,NM,RI,UT,VT)",
  JSON.stringify(ssPartial) === JSON.stringify(["CO","CT","MN","MT","NM","RI","UT","VT"]),
  "Kiplinger/TaxCompare 2026; WV phase-out complete");
const noTax = [...src.matchAll(/([A-Z]{2}): \{ name: "[^"]+", rate: 0,/g)].map(m => m[1]).sort();
check("Exactly 9 no-income-tax states (AK,FL,NV,NH,SD,TN,TX,WA,WY)",
  JSON.stringify(noTax) === JSON.stringify(["AK","FL","NH","NV","SD","TN","TX","WA","WY"]),
  "state DOR; NH I&D tax repealed 2025");
const stateCount = [...src.matchAll(/[A-Z]{2}: \{ name: "/g)].length;
check("51 jurisdictions in STATE_RULES", stateCount === 51, `found ${stateCount}`);
const badRates = [...src.matchAll(/rate: ([\d.]+), ss:/g)].map(m => Number(m[1])).filter(r => r < 0 || r > 0.14);
check("All state rates within [0, 14%]", badRates.length === 0, String(badRates));
check("IL retirement income exempt", /IL: \{[^}]*retExempt: true/.test(src), "35 ILCS 5/203");
check("PA retirement income exempt", /PA: \{[^}]*retExempt: true/.test(src), "72 P.S. 7303");
check("GA $65K/person 65+ exclusion", /GA: \{[^}]*excl65: 65000/.test(src), "O.C.G.A. 48-7-27");
check("WV no longer taxes SS (2026)", /WV: \{[^}]*ss: 0,/.test(src), "WV phase-out complete 1/1/2026");

// ── Gompertz sampler: median must land on the anchor ──
const b = 9, x = 64, med = 88;
const tMed = med - x, m = x + b * Math.log((Math.exp(tMed / b) - 1) / Math.LN2);
const xs = [];
for (let i = 0; i < 50001; i++) {
  const u = (i + 0.5) / 50001;
  xs.push(Math.min(105, Math.max(x + 1, Math.round(x + b * Math.log(1 - Math.log(u) / Math.exp((x - m) / b))))));
}
xs.sort((a, c) => a - c);
check("Gompertz sampled median == anchored life expectancy (±1)", Math.abs(xs[25000] - med) <= 1, `median ${xs[25000]} vs ${med}`);
check("Gompertz cap at 105 respected", xs[xs.length - 1] <= 105, String(xs[xs.length - 1]));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
