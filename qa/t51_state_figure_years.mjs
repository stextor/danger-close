// t51 — STATE DOLLAR FIGURES CARRY THEIR TAX YEAR; MAINE AND LOUISIANA REFRESHED (D-18) · docs/SCOPE_D18_STATE_FIGURES.md · v5.86
//
// WHAT v5.86 CHANGED. Nothing in `STATE_RULES` dated its dollar figures, and My Data headlined every state "Model (2026 approx)"
// while three notes said 2025. v5.86 records a tax year on every dollar-bearing figure (`years`, keyed by the field that holds
// it), shows those years in My Data instead of the blanket label, refreshes Maine's cap ($48,216 → $49,824, TY2026) and
// Louisiana's exclusion ($6,000 → $12,324, TY2026), and corrects South Carolina's note ($3,000 under 65, not $10,000).
//
// EVERY EXPECTED VALUE IS TYPED HERE FROM A PRIMARY SOURCE, not read from the app (scope §1a, §1b, §3b). The example household
// has no stateCode, so it is $0 here by construction (scope §1.0 / OPERATIONS §K1): the end-to-end cases call `stateTaxAnnual`
// directly on fixture households placed in the state, and each dollar figure is worked by hand in the comment beside it.
//
// Run: node t51_state_figure_years.mjs <tag>        Current leg only (`years` does not exist before v5.86).
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v586", "v587", "v588", "v589", "v590", "v591", "v593"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt51 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t51 \u2014 STATE FIGURES AND THEIR TAX YEARS (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g;
const SR = g.STATE_RULES();
const HERE = dirname(fileURLToPath(import.meta.url));
const SETS = [join(HERE, "tools", "state_sets.cjs"), join(HERE, "state_sets.cjs")].find(existsSync);
const EQ = (n, got, exp) => CK(n, Math.abs(got - exp) <= 0.005, `engine ${Number(got).toFixed(4)}, hand ${Number(exp).toFixed(4)}`);
const tax = o => g.stateTaxAnnual({ retIncome: 0, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: 70, ageB: 70, single: false, ...o });

// ── V · every §1a/§1b figure equals the primary source ─────────────────────────────────────────────────────────────────
const V = [
  ["ME", "excl65", 49824, "MRS 2026 Form 1040ES-ME (rev. July 2026) line 2; 36 M.R.S. §5122(2)(M-2)"],
  ["LA", "excl65", 12324, "LDR NOI LAC 61:I.1311, La. Register 20 Jun 2026, fiscal statement; R.S. 47:44.1"],
  ["MT", "excl65", 5660, "MT DOR TY2025 (TY2026 set by 1 Nov 2026, MCA 15-30-2120(7))"],
  ["MD", "excl65", 40600, "Comptroller of Maryland KB0010012 (8 Apr 2026)"],
  ["KY", "excl65", 31110, "KRS 141.019; 26RS HB 183 died in committee"],
  ["GA", "excl65", 65000, "O.C.G.A. §48-7-27 (to 1 Jan 2027)"],
  ["AL", "excl65", 6000, "Code of Ala. §40-18-19(a)(13)"],
  ["AR", "excl65", 6000, "A.C.A. §26-51-307"],
  ["SC", "excl65", 15000, "SCDOR; SC4972 instructions"],
  ["WV", "excl65", 8000, "W. Va. Code §11-21-12(c)(9)"],
  ["WI", "excl65", 24000, "2025 Wis. Act 15; Tax Bulletin 230"],
  ["OK", "excl65", 10000, "OTC (HB 1927 impact statement)"],
  ["NY", "excl65", 20000, "tax.ny.gov, retired persons"],
  ["DE", "excl65", 12500, "30 Del. C. §1106(b)(3)"],
  ["VA", "excl65", 12000, "Va. Code §58.1-322.03(5)(b)"],
  ["CO", "excl65", 24000, "CO DOR (v5.85 scope §1)"],
  ["RI", "excl65", 50000, "RI ADV 2025-22"],
  ["NM", "excl65", 8000, "NMSA §7-2-5.2; TRD 2025 PIT-ADJ Table 1"],
];
for (const [c, f, v, src] of V) CK(`V-${c} ${c}.${f} = $${v.toLocaleString("en-US")} (${src})`, SR[c] && SR[c][f] === v, String(SR[c] && SR[c][f]));
const ME = SR.ME.exclTest;
CK("V-ME2 Maine's phase-out stays TY2025: $125,000 / $250,000 over $100,000", ME && ME.kind === "phaseout" && ME.threshold.single === 125000 && ME.threshold.joint === 250000 && ME.width === 100000, JSON.stringify(ME));
CK("V-VA2 Virginia's taper thresholds $50,000 / $75,000", SR.VA.exclTest.threshold.single === 50000 && SR.VA.exclTest.threshold.joint === 75000);
CK("V-DE2 Delaware applies from 60, Wisconsin from 67, Kentucky at any age", SR.DE.exclAge === 60 && SR.WI.exclAge === 67 && SR.KY.exclAge === 0);
// NM: TRD 2025 PIT-ADJ Table 1, every band ("but not over" = inclusive)
const nmJ = [[30000, 8000], [33000, 7000], [36000, 6000], [39000, 5000], [42000, 4000], [45000, 3000], [48000, 2000], [51000, 1000], [Infinity, 0]];
const nmS = [[18000, 8000], [19500, 7000], [21000, 6000], [22500, 5000], [24000, 4000], [25500, 3000], [27000, 2000], [28500, 1000], [Infinity, 0]];
const rowsEq = (rows, exp, key) => rows.length === exp.length && rows.every((r, i) => r.upTo === exp[i][0] && r[key] === exp[i][1]);
const NMt = SR.NM.exclTest;
CK("V-NM2 New Mexico's 18 bands equal TRD 2025 PIT-ADJ Table 1, inclusive", NMt.cmp === undefined && rowsEq(NMt.rows.joint, nmJ, "amount") && rowsEq(NMt.rows.single, nmS, "amount"));
// CT: OLR 2025-R-0152 Table 1, every band (exclusive tops)
const ctJ = [[100000, 1], [105000, 0.85], [110000, 0.70], [115000, 0.55], [120000, 0.40], [125000, 0.25], [130000, 0.10], [140000, 0.05], [150000, 0.025], [Infinity, 0]];
const ctS = [[75000, 1], [77500, 0.85], [80000, 0.70], [82500, 0.55], [85000, 0.40], [87500, 0.25], [90000, 0.10], [95000, 0.05], [100000, 0.025], [Infinity, 0]];
const CTt = SR.CT.exclTest;
CK("V-CT Connecticut's 20 bands equal OLR 2025-R-0152 Table 1, exclusive tops", CTt.cmp === "lt" && rowsEq(CTt.rows.joint, ctJ, "pct") && rowsEq(CTt.rows.single, ctS, "pct"));
CK("V-SC2 South Carolina's note gives the under-65 retirement deduction as $3K, and no longer as $10K under 65",
   /\$3K/.test(SR.SC.note) && !/\$10K retirement deduction under 65/.test(SR.SC.note), SR.SC.note);
CK("V-ME3 Maine's note carries $49,824 and not $48,216", SR.ME.note.includes("$49,824") && !SR.ME.note.includes("48,216"), SR.ME.note.slice(0, 90));
CK("V-LA2 Louisiana's note carries $12,324, names IRA distributions, and discloses the household approximation",
   SR.LA.note.includes("$12,324") && /IRA/.test(SR.LA.note) && /household/.test(SR.LA.note), SR.LA.note.slice(0, 90));

// ── X · extinction: no dollar figure without a year ────────────────────────────────────────────────────────────────────
const TAX_YEAR = 2026;   // TAX_CONSTANTS_YEAR at v5.86: no displayed year may run ahead of the model's tax year
const dollarFields = r => ["excl65", "exclTest", "ssRule", "retCap"].filter( /* retCap: v5.90 (D-24), Michigan */f => f === "excl65" ? (r.excl65 || 0) > 0 : r[f] !== undefined);
const bearing = Object.entries(SR).filter(([, r]) => dollarFields(r).length > 0);
const missing = [], badYear = [], stale = [], stray = [];
for (const [c, r] of Object.entries(SR)) {
  const fs = dollarFields(r), y = r.years;
  if (!fs.length) { if (y !== undefined) stray.push(c); continue; }
  for (const f of fs) if (!y || y[f] === undefined) missing.push(`${c}.${f}`);
  for (const [k, v] of Object.entries(y || {})) {
    if (!fs.includes(k)) stale.push(`${c}.${k}`);
    if (!Number.isInteger(v) || v > TAX_YEAR || v < 2024) badYear.push(`${c}.${k}=${v}`);
  }
}
CK("X-1 every dollar figure (excl65 > 0, exclTest, ssRule) in every row has a tax year", missing.length === 0, missing.join(","));
CK(`X-2 every year is an integer from 2024 to ${TAX_YEAR} — none runs ahead of the model`, badYear.length === 0, badYear.join(","));
CK("X-3 no `years` key names a field that is absent or carries no dollars", stale.length === 0, stale.join(","));
CK("X-4 no row without a dollar figure carries `years`", stray.length === 0, stray.join(","));
CK("X-5 no rate carries a year (D18-1)", Object.values(SR).every(r => !r.years || r.years.rate === undefined));
CK("X-6 the census: 24 dollar-bearing rows, 32 dated figures (v5.90: + Michigan's cap, D-24)", bearing.length === 24 && bearing.reduce((a, [, r]) => a + dollarFields(r).length, 0) === 32,
   `${bearing.length} rows`);
// D18-A: exactly these figures stay at their latest published year, TY2025; every other is TY2026
const Y2025 = ["ME.exclTest", "MT.excl65", "RI.excl65", "RI.exclTest", "RI.ssRule", "MI.retCap"];
const yr = bearing.flatMap(([c, r]) => dollarFields(r).map(f => [`${c}.${f}`, r.years && r.years[f]]));
const wrongYr = yr.filter(([k, v]) => v !== (Y2025.includes(k) ? 2025 : 2026)).map(([k, v]) => `${k}=${v}`);
CK("X-7 TY2025 exactly for ME's thresholds, MT, RI and MI's cap (unpublished for 2026; MI added v5.90); TY2026 for the other 26", wrongYr.length === 0, wrongYr.join(","));
const { NOTE_MATCHER } = require(SETS);
CK("X-8 Louisiana's rewritten note does not enter the income-limited set (LA is not income-limited in law)", !NOTE_MATCHER.test(SR.LA.note));

// ── E · Maine and Louisiana end to end, fixture households, dollar-exact by hand ───────────────────────────────────────
// Maine 7.15 %. excl = max(0, $49,824 − that person's gross SS) per person 65+; × (1 − (AGI − $125K|$250K) / $100K); SS untaxed.
EQ("E-ME1 single 70, pension $30,000 < cap → no tax", tax({ code: "ME", single: true, pen: 30000 }), 0);
EQ("E-ME2 single 70, IRA $60,000, SS $20,000 → excl $29,824, tax 7.15 % × $30,176 = $2,157.584",
   tax({ code: "ME", single: true, retIncome: 60000, ssGrossA: 20000 }), 2157.584);
EQ("E-ME3 single 70, IRA $60,000, SS $50,000 ≥ cap → offset exhausts it, 7.15 % × $60,000 = $4,290",
   tax({ code: "ME", single: true, retIncome: 60000, ssGrossA: 50000 }), 4290);
EQ("E-ME4 single 70, IRA $175,000 → halfway through the phase-out, excl $24,912, 7.15 % × $150,088 = $10,731.292",
   tax({ code: "ME", single: true, retIncome: 175000 }), 10731.292);
EQ("E-ME5 single 70, IRA $225,000 → phased out, 7.15 % × $225,000 = $16,087.50", tax({ code: "ME", single: true, retIncome: 225000 }), 16087.5);
EQ("E-ME6 joint 70/70, IRA $100,000, SS $10,000 / $30,000 → excl $39,824 + $19,824, 7.15 % × $40,352 = $2,885.168",
   tax({ code: "ME", retIncome: 100000, ssGrossA: 10000, ssGrossB: 30000 }), 2885.168);
EQ("E-ME7 single 64 → below the model's floor, 7.15 % × $30,000 = $2,145", tax({ code: "ME", single: true, ageA: 64, pen: 30000 }), 2145);
// Louisiana 3 %. excl = $12,324 per person 65+ against household retirement income; SS untaxed.
EQ("E-LA1 single 70, pension $10,000 → fully exempt", tax({ code: "LA", single: true, pen: 10000 }), 0);
EQ("E-LA2 single 70, IRA $12,324 → exactly the cap, no tax", tax({ code: "LA", single: true, retIncome: 12324 }), 0);
EQ("E-LA3 single 70, IRA $20,000 → 3 % × $7,676 = $230.28", tax({ code: "LA", single: true, retIncome: 20000 }), 230.28);
EQ("E-LA4 joint 70/70, IRA $40,000 → 3 % × $15,352 = $460.56", tax({ code: "LA", retIncome: 40000 }), 460.56);
EQ("E-LA5 joint 70/60, IRA $40,000 → one exemption, 3 % × $27,676 = $830.28", tax({ code: "LA", retIncome: 40000, ageB: 60 }), 830.28);
EQ("E-LA6 single 64 → no exemption, 3 % × $20,000 = $600", tax({ code: "LA", single: true, ageA: 64, retIncome: 20000 }), 600);
EQ("E-LA7 single 70, taxable SS $20,000 only → Louisiana taxes none of it", tax({ code: "LA", single: true, ssTaxableFed: 20000, ssGrossA: 25000 }), 0);
// New Jersey 5.5 %, joint 70/70: "$100,000 or less" takes the full exclusion (inclusive, no `cmp`); above, 50 % of the payments.
EQ("E-NJ1 joint, pension $100,000 exactly → full $100,000 exclusion, no tax", tax({ code: "NJ", pen: 100000 }), 0);
EQ("E-NJ2 joint, pension $100,001 → 50 % excluded, 5.5 % × $50,000.50 = $2,750.03", tax({ code: "NJ", pen: 100001 }), 2750.0275);

// ── D · the display: My Data shows each figure's year, never the blanket label ─────────────────────────────────────────
const body = () => window.document.body;
let root, act, DangerClose, el;
const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
const stateSelect = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "ME"));
const pick = async (code) => {
  const s = stateSelect(); if (!s) return false;
  try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(s, code); s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
  await flush(); return true;
};
const modelLine = () => { const n = [...body().querySelectorAll("div")].filter(d => /^Model[ :(]/.test(d.textContent || "") && /effective rate/.test(d.textContent || ""));
  return n.length ? n.sort((a, b) => a.textContent.length - b.textContent.length)[0].textContent : ""; };
{
  window.localStorage.clear();
  el = window.document.createElement("div"); body().appendChild(el);
  ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush();
  await click(tabBtn("my data")); await flush();
  CK("D-0 setup — My Data shows a state selector", !!stateSelect());
  await pick("ME"); const me = modelLine();
  CK("D-1 Maine: the line dates both figures — exclusion 2026, income test 2025", /Dollar figures by tax year: exclusion 2026 · income test 2025\./.test(me), me.slice(0, 200));
  CK("D-2 the blanket \"2026 approx\" label is gone", me.length > 0 && !/2026 approx/i.test(me), me.slice(0, 80));
  CK("D-3 the rate reads as an approximation, with no year beside it", /effective rate \(an approximation\)/.test(me) && !/rate[^·]*20\d\d/.test(me.split("—")[0]), me.slice(0, 80));
  await pick("RI"); const ri = modelLine();
  CK("D-4 Rhode Island: every figure dated 2025, as its note says", /Dollar figures by tax year: exclusion 2025 · income test 2025 · Social Security rule 2025\./.test(ri), ri.slice(-260));
  await pick("TX"); const tx = modelLine();
  CK("D-5 a state with no dollar figure shows no year line", tx.length > 0 && !/Dollar figures by tax year/.test(tx), tx.slice(0, 120));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}
const DOCS = g.DOCS_HTML();
CK("D-6 the Field Manual no longer calls the state module \"2026 approximations\"", !/2026 approximations/.test(DOCS) && /tax year it was checked for/.test(DOCS));
done();
