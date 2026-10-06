// t55 — "RETIREMENT INCOME EXEMPT" STATES: THE LAW'S AGE GATES, AND MICHIGAN'S CAP (D-24) · docs/SCOPE_D24_RETEXEMPT_AGE.md · v5.90
//
// THROUGH v5.89 `stateTaxAnnual` set `retBase = r.retExempt ? 0 : …`: every exempt row exempted all retirement income at any age, any
// amount. Five of the fourteen exempt rows tax anything (IL, IA, MI, MS, PA). The law, read 2026-10-01/02:
//   IA — 55 or older on 31 Dec (Iowa DOR).                PA — IRAs from 59½; employer plans at the plan's own age/service (rev-636).
//   MS — early distributions do not qualify (DOR Ch. 07). MI — no age test from TY2026; capped at the private-retirement maximum,
//   TY2025 $65,897 / $131,794 (Treasury RAB 2026-1).      IL — early distributions included (IDOR Pub 120): unchanged.
// v5.90: `retExemptAge` (IA 55; PA, MS 60 = 59½ in whole years), joint returns exempt only when BOTH spouses qualify (no per-person
// income: D-12), `retExemptPensionAnyAge` (PA, MS) for pensions in payment, `retCap` (MI, per return).
// Every expected figure below is computed BY HAND from the row's rate (asserted first). Run: node t55_retexempt_age.mjs <tag>
// Current leg. v589 is registered ONLY so the pre-fix failure stays reproducible.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v589", "v590", "v591"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt55 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t55 \u2014 EXEMPT STATES: AGE GATES AND MICHIGAN'S CAP (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const g = window.__g; const SR = g.STATE_RULES();
const EQ = (n, got, exp) => CK(n, Math.abs(got - exp) <= 0.005, `engine ${Number(got).toFixed(4)}, hand ${Number(exp).toFixed(4)}`);
const T = (code, o) => g.stateTaxAnnual({ code, retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageB: null, single: true, ...o });
const J = (code, o) => T(code, { single: false, ...o });

CK("0-1 rates the hand figures assume: IA 3.8 %, PA 3.07 %, MS 4 %, MI 4.25 %, IL 4.95 %", SR.IA.rate === 0.038 && SR.PA.rate === 0.0307 && SR.MS.rate === 0.04 && SR.MI.rate === 0.0425 && SR.IL.rate === 0.0495,
   ["IA", "PA", "MS", "MI", "IL"].map(c => c + " " + SR[c].rate).join(", "));
// ── IA: 55, all retirement income ─────────────────────────────────────────────────────────────────────────────────────────
EQ("IA-1 single 54, $50,000 IRA: under 55 — 0.038 × 50,000 = $1,900.00", T("IA", { retIncome: 50000, ageA: 54 }), 1900);
EQ("IA-2 single 55, $50,000 IRA: exempt — $0", T("IA", { retIncome: 50000, ageA: 55 }), 0);
EQ("IA-3 single 50, $20,000 PENSION: Iowa's 55 gates pensions too — 0.038 × 20,000 = $760.00", T("IA", { pen: 20000, ageA: 50 }), 760);
EQ("IA-4 joint 56/54, $50,000 IRA: both must be 55 — $1,900.00", J("IA", { retIncome: 50000, ageA: 56, ageB: 54 }), 1900);
EQ("IA-5 joint 56/55, $50,000 IRA: both 55+ — $0", J("IA", { retIncome: 50000, ageA: 56, ageB: 55 }), 0);
EQ("IA-6 count-only, two 65+: exempt — $0", g.stateTaxAnnual({ code: "IA", retIncome: 50000, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: null, ageB: null, single: false, persons65: 2 }), 0);
EQ("IA-7 count-only, one 65+ on a joint return: the other's age unknown — not exempt, $1,900.00", g.stateTaxAnnual({ code: "IA", retIncome: 50000, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: null, ageB: null, single: false, persons65: 1 }), 1900);
// ── PA: 60 for withdrawals, pensions any age ──────────────────────────────────────────────────────────────────────────────
EQ("PA-1 single 59, $50,000 IRA — 0.0307 × 50,000 = $1,535.00", T("PA", { retIncome: 50000, ageA: 59 }), 1535);
EQ("PA-2 single 60, $50,000 IRA: exempt — $0", T("PA", { retIncome: 50000, ageA: 60 }), 0);
EQ("PA-3 single 50, $20,000 pension only: pensions in payment exempt at any age — $0", T("PA", { pen: 20000, ageA: 50 }), 0);
EQ("PA-4 single 50, $10,000 IRA + $20,000 pension: only the withdrawal taxed — 0.0307 × 10,000 = $307.00", T("PA", { retIncome: 10000, pen: 20000, ageA: 50 }), 307);
EQ("PA-5 joint 61/59, $40,000 IRA: both must qualify — 0.0307 × 40,000 = $1,228.00", J("PA", { retIncome: 40000, ageA: 61, ageB: 59 }), 1228);
EQ("PA-6 joint 61/60, $40,000 IRA: exempt — $0", J("PA", { retIncome: 40000, ageA: 61, ageB: 60 }), 0);
// ── MS: as PA ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
EQ("MS-1 single 59, $50,000 IRA — 0.04 × 50,000 = $2,000.00", T("MS", { retIncome: 50000, ageA: 59 }), 2000);
EQ("MS-2 single 60, $50,000 IRA: exempt — $0", T("MS", { retIncome: 50000, ageA: 60 }), 0);
EQ("MS-3 single 50, $30,000 pension: exempt at any age — $0", T("MS", { pen: 30000, ageA: 50 }), 0);
// ── MI: no age test, capped per return ────────────────────────────────────────────────────────────────────────────────────
EQ("MI-1 single 50, $50,000 IRA: under the cap, no age test — $0", T("MI", { retIncome: 50000, ageA: 50 }), 0);
EQ("MI-2 single 66, $80,000 IRA: 0.0425 × (80,000 − 65,897) = 0.0425 × 14,103 = $599.3775", T("MI", { retIncome: 80000, ageA: 66 }), 599.3775);
EQ("MI-3 single 66, $50,000 IRA + $30,000 pension: public and private combined under one cap — $599.3775", T("MI", { retIncome: 50000, pen: 30000, ageA: 66 }), 599.3775);
EQ("MI-4 joint 66/66, $150,000 IRA: 0.0425 × (150,000 − 131,794) = 0.0425 × 18,206 = $773.755", J("MI", { retIncome: 150000, ageA: 66, ageB: 66 }), 773.755);
CK("MI-5 Michigan's cap is dated TY2025 and shown as a dated figure", SR.MI.years && SR.MI.years.retCap === 2025 && SR.MI.retCap.single === 65897 && SR.MI.retCap.joint === 131794, JSON.stringify(SR.MI.years));
// ── unchanged rows ────────────────────────────────────────────────────────────────────────────────────────────────────────
EQ("IL-1 single 50, $50,000 IRA: Illinois includes early distributions — $0", T("IL", { retIncome: 50000, ageA: 50 }), 0);
const zero = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"].filter(c => T(c, { retIncome: 50000, pen: 20000, ageA: 50 }) !== 0);
CK("Z-1 the nine no-income-tax rows still tax nothing", zero.length === 0, zero.join(" "));
CK("Z-2 only IA, PA, MS carry an age gate; only PA, MS the pension rule; only MI a cap",
   Object.keys(SR).filter(c => SR[c].retExemptAge).sort().join(",") === "IA,MS,PA" && Object.keys(SR).filter(c => SR[c].retExemptPensionAnyAge).sort().join(",") === "MS,PA" && Object.keys(SR).filter(c => SR[c].retCap).join(",") === "MI");
// ── X · extinction grid: the engine's exemption equals the rule, computed independently ───────────────────────────────────
let n = 0; const bad = [];
for (const c of ["IA", "PA", "MS"]) for (const aA of [50, 54, 55, 59, 60, 66]) for (const aB of [null, 50, 55, 60, 66]) for (const ri of [0, 40000]) for (const pen of [0, 20000]) {
  const single = aB === null, age = SR[c].retExemptAge, ok = a => a >= age;
  const gate = single ? ok(aA) : ok(aA) && ok(aB);
  const exempt = (gate ? ri : 0) + ((gate || SR[c].retExemptPensionAnyAge) ? pen : 0);
  const want = SR[c].rate * (ri + pen - exempt), got = T(c, { retIncome: ri, pen, ageA: aA, ageB: aB, single });
  if (Math.abs(got - want) > 0.005) bad.push(`${c} ${aA}/${aB} ri${ri} pen${pen}: ${got.toFixed(2)} vs ${want.toFixed(2)}`); n++;
}
for (const single of [true, false]) for (const ri of [20000, 70000, 140000]) for (const pen of [0, 30000]) {
  const cap = single ? 65897 : 131794, want = 0.0425 * Math.max(0, ri + pen - cap), got = T("MI", { retIncome: ri, pen, ageA: 66, ageB: single ? null : 66, single });
  if (Math.abs(got - want) > 0.005) bad.push(`MI ${single ? "S" : "J"} ri${ri} pen${pen}: ${got.toFixed(2)} vs ${want.toFixed(2)}`); n++;
}
CK(`X-0 not vacuous: ${n} grid cases (≥ 300)`, n >= 300, n);
CK("X-1 every gated or capped exempt row: the engine equals the rule, every grid case", bad.length === 0, `${bad.length} off: ${bad.slice(0, 3).join(" · ")}`);
done();
