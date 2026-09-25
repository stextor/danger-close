// REPO-ONLY PROBE for SCOPE_SS86_ONE_RULE §1b. Asserts nothing. Feeds the Roth tab's EXACT engine input for the
// example household (rothP_example_v576.json, captured from a rendered v5.76 session) to two builds and compares every
// strategy's totTax and widowTax to the dollar. Run from qa/tools/scope_ss86/:
//     node roth_example_compare.mjs app_v576.mjs app_v577.mjs
// Expected: every strategy "same" — C-4's dropped limb cannot bind for this household (smallest benefit year $15,600).
// HOW THE INPUT WAS CAPTURED (session-only build, never shipped): insert at the top of runRothStrategies' body
//     try { (globalThis.__rothPs = globalThis.__rothPs || []).push(JSON.parse(JSON.stringify(P))); } catch (e) {}
// build its DOM bundle, mount, "use example data", click the "roth" tab, save the last captured P.
// ⚠ Stringify P ALONE — the signature is (P, customStrategies), and passing both makes the second a replacer (2-byte file).
import { readFileSync } from "fs";
const P = JSON.parse(readFileSync(new URL("./rothP_example_v576.json", import.meta.url), "utf8"));
const [a, b] = [await import(`../../${process.argv[2]}`), await import(`../../${process.argv[3]}`)];
const ra = a.__g.runRothStrategies(P), rb = b.__g.runRothStrategies(P);
for (let i = 0; i < ra.length; i++)
  console.log((ra[i].totTax === rb[i].totTax && ra[i].widowTax === rb[i].widowTax ? "  same  " : "  MOVES ") + ra[i].key.padEnd(9),
    `totTax ${ra[i].totTax} | ${rb[i].totTax}   widowTax ${ra[i].widowTax} | ${rb[i].widowTax}`);
