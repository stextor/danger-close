// gate_v538.mjs — THE DERIVATION GATE (v5.38 build, session 1; run 2026-08-17: 31/31 CLEAN)
// Asserts the edited engine against sim_ledger.mjs mode "v538" and the DERIVATION memo's pins.
// Usage: node gate_v538.mjs   (expects qa/app_v537.mjs and qa/app_v538.mjs built, sim_ledger.mjs beside it)
// This is the seed of the new t22 group: cases 1/1a (CASE1), case 3 (CASE3/BASE), invariances,
// and the corrected solver assertions. Controls C14/C15 revert the tax charge / the magiHist
// term respectively and expect the pin checks / the IRMAA pin to fire.
import { runHousehold } from "./sim_ledger.mjs";
const g = (await import("./qa/app_v538.mjs")).__g;
const g37 = (await import("./qa/app_v537.mjs")).__g;
let pass = 0, fail = 0;
const CK = (n, ok, d) => { ok ? pass++ : (fail++, console.log(`✗ ${n}${d ? " — " + d : ""}`)); };
const BASE = {
  single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2060, ladderEnd: 2035,
  dobAYr: 1965, dobBYr: 1966, deathYr1: Infinity, survivor: "A",
  ssA: 3000, ssB: 1800, ssAYr: 2032, ssAMo: 6, ssBYr: 2033, ssBMo: 6,
  pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
  acaPremium: 1600, acaSize: 2, taxYieldPct: 1.5, currentConv: 0,
  tradInitA: 600000, tradInitB: 300000, rothInitA: 60000, rothInitB: 40000, taxableInit: 250000,
};
const CASE1 = { ...BASE, taxableGainFrac: 0.6, taxableInit: 400000, tradInitA: 1200000, tradInitB: 600000 };
const menu = (a) => [{ key: "n", policy: { kind: "fixed", amount: 0 } }, { key: "c", policy: { kind: "fixed", amount: a } }];
{ const eng = g.runRothStrategies(CASE1, menu(186000)); const sim = runHousehold(CASE1, 186000, "v538");
  for (const [e, sM] of [[eng[0], sim.baseline], [eng[1], sim.strat]])
    for (const k of ["totTax","totIrmaa","totNiit","totConv","totAcaLoss","endTrad","endRoth","endTaxable","estate"])
      CK(`G1 ${k}`, Math.abs(e[k] - sM[k]) <= 1, `engine ${e[k]} sim ${sM[k]}`);
  const e = eng[1], sM = sim.strat;
  CK("G1 wealth path", Object.keys(e.wealthByYr).every(y => Math.abs(e.wealthByYr[y] - sM.wealthByYr[y]) <= 1));
  CK("G1 subsidies", Object.keys(e.acaSubByYr).every(y => Math.abs(e.acaSubByYr[y] - (sM.acaSubByYr[y] ?? -9)) <= 0.01));
  CK("PIN totTax 314,708", e.totTax === 314708, String(e.totTax));
  CK("PIN totIrmaa 1,150", e.totIrmaa === 1150, String(e.totIrmaa));
  CK("PIN estate 8,908,031", e.estate === 8908031, String(e.estate));
  CK("PIN Δ +3,802", e.totTax - g37.runRothStrategies(CASE1, menu(186000))[1].totTax === 3802); }
{ CK("G2 CASE3 byte-identical v537↔v538", JSON.stringify(g37.runRothStrategies(BASE, menu(60000))) === JSON.stringify(g.runRothStrategies(BASE, menu(60000))));
  const eng = g.runRothStrategies(BASE, menu(60000))[1], sim = runHousehold(BASE, 60000, "v538").strat;
  CK("G2 CASE3 engine==sim", ["totTax","totAcaLoss","endTaxable","estate"].every(k => Math.abs(eng[k]-sim[k])<=1)); }
{ const noAca = { ...CASE1, acaPremium: 0, acaSize: 0 };
  CK("G3 acaPremium:0 identical", JSON.stringify(g37.runRothStrategies(noAca, menu(186000))) === JSON.stringify(g.runRothStrategies(noAca, menu(186000))));
  CK("G3 none-strategy identical", JSON.stringify(g37.runRothStrategies(BASE, menu(0))[0]) === JSON.stringify(g.runRothStrategies(BASE, menu(0))[0])); }
{ const r37 = g37.runRothStrategies(CASE1), r38 = g.runRothStrategies(CASE1);
  CK("G4 fixed/bracket strategies ≥ v537", r37.every((r, i) => ["acaCliff","irmaa1"].includes(r.key) || r38[i].totTax >= r.totTax));
  const none = r38.find(r => r.key === "none"), cliff = r38.find(r => r.key === "acaCliff");
  CK("G4 acaCliff forfeits no bridge year", Object.keys(none.acaSubByYr).filter(y => none.acaSubByYr[y] > 0).every(y => cliff.acaSubByYr[y] > 0));
  CK("G4 7 strategies", r38.length === 7); }
console.log(`\nDERIVATION GATE ${fail === 0 ? "CLEAN" : "FAILED"} — ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
