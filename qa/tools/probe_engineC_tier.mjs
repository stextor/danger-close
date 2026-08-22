// PROBE — can Engine C's flat 85% produce a WRONG IRMAA TIER through the real engine, not
// just in a sweep? Scoping evidence for D-2(b). Drives a survivor household whose benefits
// land in the band the sweep identified (single, benefits >= $59,600).
// TOOLING. Asserts nothing. Counted in NO check total (OPERATIONS §B1).
import { statute86 } from "./hand_86.mjs";
import { __g, __engines } from "../app_v542.mjs";

const usd = n => "$" + Math.round(n).toLocaleString();
const SUR = [0, 1150, 2880, 4620, 6360, 6940];

// Engine C takes destructured params and reads the rest from module globals, so the household
// has to be installed the way the app installs it. Confirm what it currently resolves to first.
const tl = __g.PLAN_TIMELINE();
console.log("resolved timeline: dobA", tl.dobA.year, "dobB", tl.dobB.year,
  "| retire", tl.rothLadderStart, "| ssA", tl.ssA_date.year, "ssB", tl.ssB_date.year);

const p = __engines.computeIrmaaPlan({ retireYear: 2029, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0 });
const rows = Array.isArray(p) ? p : (p.rows || p.years || []);
console.log(`\nEngine C returned ${rows.length} rows. Columns available:`, Object.keys(rows[0] || {}).join(", "));

// What the shipped household does today — is any year single-filing, and what are its MAGI/tier?
console.log("\nyr     single  MAGI          tier  surcharge   persons");
for (const r of rows.slice(0, 14)) {
  console.log(String(r.yr).padEnd(6), String(!!r.filingSingleI).padEnd(7),
    usd(r.magi).padEnd(13), String(r.tier).padEnd(5),
    usd(r.surchargeAnnual).padEnd(11), String(r.personsOnMedicare));
}

// Now the arithmetic question, on Engine C's OWN numbers: for each row, recompute taxable SS
// under the statute and see whether the tier would change. Engine C does not expose ssTot, so
// reconstruct the non-SS part from the row and the flat rule it used.
console.log("\n--- would the statute change this household's tier in any year? ---");
let flips = 0;
for (const r of rows) {
  if (r.ssTot == null) { console.log("  (row does not expose ssTot — see note below)"); break; }
  const flat = r.ssTot * 0.85;
  const other = r.magi - flat;
  const law = statute86(r.ssTot, other, !r.filingSingleI);
  if (Math.round(flat) !== Math.round(law)) {
    flips++;
    console.log(`  ${r.yr}: SS ${usd(r.ssTot)} MAGI ${usd(r.magi)} -> ${usd(other + law)}  (flat ${usd(flat)} vs law ${usd(law)})`);
  }
}
console.log(flips ? `${flips} years differ` : "no year differs on the shipped household");
