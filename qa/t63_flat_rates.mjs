// t63 — D-22 BATCH 1: THE THIRTEEN FLAT-RATE STATES, READ FOR TY2026 · docs/SCOPE_D22_FLAT_RATES_V599.md · v5.99
//
// Each of these states taxes at one rate (Mississippi and Ohio above a zero band), so the model's one rate can be checked against the law exactly.
// Read at primary sources on 2026-10-09: ten matched; three were stale and move —
//   Idaho 5.695 % -> 5.3 % (Idaho Code §63-3024(2)(a), am. 2025 ch. 13, HB 40)
//   Indiana 3.0 % -> 2.95 % (IC 6-3-2-1; Indiana DOR: "for 2026 is 2.95% and will adjust in 2027 to 2.90%")
//   Ohio 3.1 % -> 2.75 % (R.C. 5747.02(A)(3)(c), HB 96: "$332.00 plus 2.75% of the amount in excess of $26,050"); the row keeps the top-rate
//     convention, which overstates the law by 0.0275 × $26,050 − $332 = $384.38 a year above $26,050 — disclosed in the note.
// All three lowered modelled tax (the stale rates were conservative).
//
// Groups:  A the thirteen rates per leg; on v5.99 each note states its rate for its year (t61's guard checks the value; this checks presence)
//          B hand cases to the cent (ID, IN, OH) and Ohio's overstatement from the statute's own formula
//          C v5.98 -> v5.99 only (needs app_v598.mjs): the calculator moves only in ID, IN and OH, by exactly the rate ratio; Engine B moves only
//            those rows' state-tax fields, never up; Engines C and D byte-identical; Engine A never rises; its estate-best cell does not change
// BOTH LEGS; the v598 leg pins the old rates. Run: node t63_flat_rates.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v598", "v599", "v600", "v601", "v602"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt63 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t63 — D-22 BATCH 1: FLAT-RATE STATES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const FIXED = VER !== "v598";
console.error = () => {}; console.warn = () => {};
const { existsSync } = await import("fs");
const HERE = new URL(".", import.meta.url);
const m = await import(`./app_${VER}.mjs`), g = m.__g, E = m.__engines, ST = E.stateTaxAnnual || g.stateTaxAnnual, SR = g.STATE_RULES();

// ── A · the thirteen rates ──
const NEW = { AZ: 0.025, CO: 0.044, ID: 0.053, IL: 0.0495, IN: 0.0295, IA: 0.038, LA: 0.03, MA: 0.05, MI: 0.0425, MS: 0.04, NC: 0.0399, OH: 0.0275, PA: 0.0307 };
const OLD = { ...NEW, ID: 0.05695, IN: 0.03, OH: 0.031 };
const WANT = FIXED ? NEW : OLD;
const bad = Object.keys(WANT).filter(c => SR[c].rate !== WANT[c]);
CK(`A-1 the thirteen rates are ${FIXED ? "the TY2026 law's" : "v5.98's (PIN)"} — ID ${(WANT.ID * 100).toFixed(3)} %, IN ${(WANT.IN * 100).toFixed(2)} %, OH ${(WANT.OH * 100).toFixed(2)} %`, bad.length === 0, bad.map(c => `${c} ${SR[c].rate}`).join(", "));
const RATE_CLAIM = /(\d+(?:\.\d+)?)\s?%\s*(?:flat\s+)?(?:for|effective|from)\s+(20\d\d)/;
if (FIXED) {
  const silent = Object.keys(NEW).filter(c => !RATE_CLAIM.test(SR[c].note || ""));
  CK("A-2 every one of the thirteen notes states its rate and the year it was read for", silent.length === 0, silent.join(","));
  CK("A-3 Ohio's note gives the statute's form ($332 plus 2.75 % above $26,050) and the overstatement ($384.38, conservative)",
     /\$332 plus 2\.75% of the excess above it/.test(SR.OH.note) && /\$26,050/.test(SR.OH.note) && /\$384\.38 a year above that line \(conservative\)/.test(SR.OH.note), SR.OH.note);
  // v6.00 (D-22 option 3): Mississippi's band is modelled from v6.00 (t64 A-7 owns that note); this leg asserts the old disclosure is gone. A LIST.
  if (["v600", "v601", "v602"].includes(VER)) CK("A-4 Mississippi's note no longer says its first $10,000 is taxed here — the band is modelled (v6.00)", !/taxed here, overstating tax by up to \$400/.test(SR.MS.note) && /first \$10,000 of taxable income is untaxed/.test(SR.MS.note), SR.MS.note);
  else CK("A-4 Mississippi's note discloses its untaxed first $10,000 as taxed here (conservative)", /first \$10,000 of taxable income is untaxed in law and taxed here, overstating tax by up to \$400 a year \(conservative\)/.test(SR.MS.note), SR.MS.note);
  CK("A-5 the scheduled 2027 cuts (IN, MS, NC) are named as not applied", ["IN", "MS", "NC"].every(c => /2027, not applied here \(conservative\)|from 2027, not applied here \(conservative\)/.test(SR[c].note)), ["IN", "MS", "NC"].map(c => SR[c].note.slice(-90)).join(" | "));
} else CK("A-2 PIN v5.98: Ohio's note still says ~3.1 %", /~3\.1%/.test(SR.OH.note), SR.OH.note);

// ── B · hand cases to the cent ──
const call = (code, retIncome, ageA, ageB = null, single = true) =>
  ST({ code, retIncome, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA, ageB, single });
EQ(`B-1 ID single 66, $60,000: ${(WANT.ID * 100).toFixed(3)} % × $60,000`, call("ID", 60000, 66), FIXED ? 3180 : 3417);
EQ(`B-2 IN single 66, $60,000: ${(WANT.IN * 100).toFixed(2)} % × $60,000`, call("IN", 60000, 66), FIXED ? 1770 : 1800);
EQ(`B-3 OH joint 70/70, $80,000: ${(WANT.OH * 100).toFixed(2)} % × $80,000`, call("OH", 80000, 70, 70, false), FIXED ? 2200 : 2480);
// Ohio's law for the same $80,000 of Ohio taxable income: $332 + 2.75 % × ($80,000 − $26,050) = $1,815.63; the model's $2,200.00 is $384.38 above.
const ohLaw = x => x <= 26050 ? 0 : 332 + 0.0275 * (x - 26050);
EQ("B-4 Ohio: the flat top rate overstates the statute's formula by exactly $384.38 above $26,050 (checked at $80,000 and $250,000)",
   Math.max(Math.abs((0.0275 * 80000 - ohLaw(80000)) - 384.375), Math.abs((0.0275 * 250000 - ohLaw(250000)) - 384.375)), 0, 1e-9);

// ── C · v5.98 -> v5.99: only Idaho, Indiana and Ohio move, by exactly the rate ratio ──
if (VER === "v599") {   // single-build by design: it needs app_v598.mjs
  if (!existsSync(new URL("./app_v598.mjs", HERE))) console.log("  – group C not run: app_v598.mjs is not in this run folder");
  else {
    const pm = await import("./app_v598.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const RATIO = { ID: 0.053 / 0.05695, IN: 0.0295 / 0.03, OH: 0.0275 / 0.031 };
    let n = 0, same = 0, scaled = 0, badC = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const age of [50, 62, 66, 72]) for (const ret of [0, 30000, 90000, 250000])
      for (const pen of [0, 20000]) for (const ss of [0, 20000]) {
        const a = { code, retIncome: ret, pen, work: 5000, capGains: 3000, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: 0, ageA: age, ageB: single ? null : age, single };
        const x = PST({ ...a }), y = ST({ ...a }); n++;
        if (RATIO[code]) { if (Math.abs(y - x * RATIO[code]) <= 1e-6 * Math.max(1, x)) scaled++; else badC.push(`${code} ${JSON.stringify(a)} ${x}->${y}`); }
        else if (x === y) same++; else badC.push(`${code} moved ${x}->${y}`);
      }
    CK(`C-1 the calculator: ${n} calls across all ${Object.keys(SR).length} rows — identical outside ID/IN/OH (${same}), exactly the rate ratio inside (${scaled})`, badC.length === 0, badC.slice(0, 3).join(" · "));
    const BASE = JSON.parse(JSON.stringify(pm.__g.PORTFOLIO()));
    const engines = (mm, code, withA) => { const G = mm.__g, EE = mm.__engines; G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), stateCode: code } });
      const tl = G.PLAN_TIMELINE(), ry = tl.targetRetireYear, s = G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      const dA = tl.dobA.year + tl.lifeExpA, dB = tl.dobB.year + tl.lifeExpB, o = {};
      for (const ra of [0, 70000]) o[`B${ra}`] = EE.computeTaxPlan({ retireYear: ry, rothAmount: ra, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr }).rows;
      o.C = EE.computeIrmaaPlan({ retireYear: ry, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr });
      o.D = G.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      if (withA) o.A = G.runRothStrategies({ single: !!tl.single, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: Math.max(dA, dB), ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA,
        ladderEndB: tl.rothLadderEndB, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: Math.min(dA, dB), survivor: dA >= dB ? "A" : "B", ssA: G.getSSA(), ssB: G.getSSB(),
        ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month, pen: G.getPension(), penOwner: G.PORTFOLIO().incomeSources.pension.owner,
        stateRate: 0, stateCode: code, convTaxFunding: "taxable", taxableGainFrac: 0.3, acaPremium: 0, acaSize: 0, taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 0,
        ...G.retireStartBalances(ry), ordDrawByYr: s.ordDrawByYr });
      return o; };
    const MOVE = new Set(["stateTax", "totalTax", "effRate"]);
    let bSame = 0, bOther = [], rises = 0, falls = 0, cdBad = [], aUp = 0, aDown = 0, bestChg = [], aOther = [];
    const lifeState = {};
    for (const code of [null, ...Object.keys(SR)]) {
      const withA = ["ID", "IN", "OH", "GA", "NY", null].includes(code);
      const a = engines(pm, code, withA), b = engines(m, code, withA);
      for (const k of ["C", "D"]) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) cdBad.push(`${code}/${k}`);
      for (const k of ["B0", "B70000"]) {
        if (JSON.stringify(a[k]) === JSON.stringify(b[k])) { bSame++; continue; }
        if (!RATIO[code]) { bOther.push(`${code}/${k}`); continue; }
        a[k].forEach((r, i) => { const q = b[k][i];
          for (const f of Object.keys(r)) if (!MOVE.has(f) && JSON.stringify(r[f]) !== JSON.stringify(q[f])) bOther.push(`${code}/${k}/${r.yr}/${f}`);
          if (q.stateTax > r.stateTax + 1e-9) rises++; if (q.stateTax < r.stateTax - 1e-9) falls++; });
        lifeState[`${code}${k}`] = [a[k], b[k]].map(rows => Math.round(rows.reduce((s, r) => s + (r.stateTax || 0), 0)));
      }
      if (withA) {
        a.A.forEach((x, j) => { const d = b.A[j].totTax - x.totTax; if (d > 0.5) aUp++; if (d < -0.5) aDown++; if (!RATIO[code] && Math.abs(d) > 0) aOther.push(`${code}/${x.key}`); });
        const best = arr => [...arr].sort((p, q) => q.estate - p.estate)[0].key;
        if (best(a.A) !== best(b.A)) bestChg.push(`${code}: ${best(a.A)} -> ${best(b.A)}`);
      }
    }
    CK(`C-2 Engine B (example household, every jurisdiction, Roth $0 and $70,000): identical outside ID/IN/OH (${bSame} of 104; 98 expected); inside, only stateTax/totalTax/effRate move`,
       bOther.length === 0 && bSame === 98, bOther.slice(0, 4).join(" · "));
    CK(`C-3 Engine B: no year's state tax rises; ${falls} fall`, rises === 0 && falls > 0, `${rises} rise`);
    for (const c of ["ID", "IN", "OH"])
      EQ(`C-4${c} Engine B lifetime state tax, ${c}, no conversions: $${lifeState[c + "B0"]?.[0]} -> $${lifeState[c + "B0"]?.[1]} (exactly the rate ratio, rounded)`, lifeState[c + "B0"]?.[1], Math.round(lifeState[c + "B0"]?.[0] * RATIO[c]), 1);
    CK("C-6 Engines C (IRMAA) and D (Withdrawal) byte-identical in every jurisdiction", cdBad.length === 0, cdBad.slice(0, 4).join(" · "));
    CK(`C-7 Engine A: no strategy's lifetime tax rises; ${aDown} fall (≥ 12: six strategies × ID, IN, OH where they pay tax); nothing moves outside ID/IN/OH`,
       aUp === 0 && aDown >= 12 && aOther.length === 0, `${aUp} rise, ${aDown} fall, other ${aOther.join(",")}`);
    CK("C-8 Engine A: the estate-best strategy changes in no jurisdiction tested (ID, IN, OH, GA, NY, none)", bestChg.length === 0, bestChg.join(" · "));
  }
}
done();
