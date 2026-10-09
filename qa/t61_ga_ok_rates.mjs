// t61 — GEORGIA'S AND OKLAHOMA'S 2026 RATES (D-22, two of 42) · docs/SCOPE_D22_GA_OK_RATES.md · v5.97
//
// THROUGH v5.96 Georgia was modelled at 5.19 % and Oklahoma at 4.75 %. Read at primary sources on 2026-10-08:
//   Georgia 4.99 % for taxable years from 1 January 2026 — O.C.G.A. §48-7-20(a.1) as amended by HB 463 (Ga. L. 2026, p. 397), signed
//     11 May 2026, retroactive; the DOR's 2026 Employer's Tax Guide (June 2026) says the same. Flat, so 4.99 % is exact.
//   Oklahoma top rate 4.5 % from tax year 2026 — HB 2764 (2025), 68 O.S. §2355; OTC Tax Policy Division, 2025 Tax Legislation Summary.
//     The row keeps its top-rate convention (4.75 % was the old top rate), which overstates tax against the bracket schedule by exactly
//     $214.75 single / $429.50 joint a year on a base above the top threshold — disclosed in the note.
// Both rows overstated tax (conservative); the correction lowers it.
//
// Groups:  A the rates and the notes; EXTINCTION: any note stating a rate for a year states the row's own rate (all 51 rows)
//          B hand cases to the cent through the calculator
//          C v5.96 -> v5.97 only (needs app_v596.mjs): the calculator moves only in GA and OK and there by exactly the rate ratio;
//            Engine B on the example household moves only GA/OK rows and only stateTax/totalTax/effRate, never up; Engines C and D
//            byte-identical; Engine A never rises and its estate-best strategy does not change
// BOTH LEGS; the v596 leg PINS the old rates. Run: node t61_ga_ok_rates.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v596", "v597", "v598", "v599"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt61 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t61 — D-22: GEORGIA'S AND OKLAHOMA'S 2026 RATES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const FIXED = VER !== "v596";
console.error = () => {}; console.warn = () => {};
const { existsSync } = await import("fs");
const HERE = new URL(".", import.meta.url);
const m = await import(`./app_${VER}.mjs`), g = m.__g, E = m.__engines, ST = E.stateTaxAnnual || g.stateTaxAnnual, SR = g.STATE_RULES();
const GA = FIXED ? 0.0499 : 0.0519, OK = FIXED ? 0.045 : 0.0475;

// ── A · the rates and the notes ──
CK(`A-1 Georgia's rate is ${(GA * 100).toFixed(2)} % ${FIXED ? "(HB 463, TY2026)" : "(PIN v5.96)"}`, SR.GA.rate === GA, SR.GA.rate);
CK(`A-2 Oklahoma's rate is ${(OK * 100).toFixed(2)} % ${FIXED ? "(HB 2764, TY2026, the top rate)" : "(PIN v5.96)"}`, SR.OK.rate === OK, SR.OK.rate);
const nGA = SR.GA.note, nOK = SR.OK.note;
if (FIXED) {
  CK("A-3 Georgia's note names the rate, the year, the act and the code section, and that 2027's step-down and $70K exclusion are not applied (conservative)",
     /Rate 4\.99% flat for 2026/.test(nGA) && /HB 463, 2026/.test(nGA) && /O\.C\.G\.A\. §48-7-20/.test(nGA) && /step-down from 2027/.test(nGA) &&
     /\$70K exclusion from 2027 are not applied here \(conservative\)/.test(nGA), nGA);
  CK("A-4 Oklahoma's note names the rate, the year, the act and the section, the top-rate overstatement, and claims no law age",
     /Rate 4\.5% from 2026, the top of three brackets/.test(nOK) && /HB 2764, 2025/.test(nOK) && /68 O\.S\. §2355/.test(nOK) &&
     /\$214\.75 single \/ \$429\.50 joint a year \(conservative\)/.test(nOK) && /triggered cuts are not applied/.test(nOK) && !/law/.test(nOK), nOK);
} else {
  CK("A-3 PIN v5.96: Georgia's note states no rate", !/\d%|\d %/.test(nGA.replace(/\$\d+K/g, "")), nGA);
  CK("A-4 PIN v5.96: Oklahoma's note states no rate", !/%/.test(nOK), nOK);
}
// EXTINCTION: a note that states a rate for a year ("3.5% effective 2026", "4.45 % from 2026", "to 3.99% for 2026", "4.99% flat for 2026"; Ohio's too)
// states the row's own rate. The matched set is asserted too, so a reworded note cannot leave the guard vacuous.
const RATE_CLAIM = /(\d+(?:\.\d+)?)\s?%\s*(?:flat\s+)?(?:for|effective|from)\s+(20\d\d)/;
const claims = Object.entries(SR).filter(([, r]) => r.note && RATE_CLAIM.test(r.note)).map(([c, r]) => [c, Number(r.note.match(RATE_CLAIM)[1]), r.rate]);
const bad = claims.filter(([, said, rate]) => Math.abs(said / 100 - rate) > 1e-9);
CK(`A-5 EXTINCTION: every note stating a rate for a year states the row's own rate (${claims.map(x => x[0]).join(", ")})`, bad.length === 0, JSON.stringify(bad));
// v5.99 (D-22 batch 1) records the reading in eleven more notes, so the matched set grows; earlier legs keep theirs.
const WANT = !FIXED ? "KY,NC,OH,UT" : ["v597", "v598"].includes(VER) ? "GA,KY,NC,OH,OK,UT" : "AZ,CO,GA,IA,ID,IL,IN,KY,LA,MA,MI,MS,NC,OH,OK,PA,UT";
CK(`A-6 the rate-claim set is exactly ${WANT} (a reworded note cannot leave A-5 vacuous)`, claims.map(x => x[0]).sort().join(",") === WANT, claims.map(x => x[0]).sort().join(","));
if (FIXED) {
  // Oklahoma's TY2026 schedule (OTC, 2025 Tax Legislation Summary): single 0 % to $3,750, 2.5 % to $4,900, 3.5 % to $7,200, 4.5 % above;
  // joint the same at double the thresholds. The note's overstatement = 4.5 % × the top threshold − the schedule's tax at it.
  const sched = (x, t) => 0.025 * Math.max(0, Math.min(x, t[1]) - t[0]) + 0.035 * Math.max(0, Math.min(x, t[2]) - t[1]) + 0.045 * Math.max(0, x - t[2]);
  const S = [3750, 4900, 7200], J = [7500, 9800, 14400];
  const overS = 0.045 * 7200 - sched(7200, S), overJ = 0.045 * 14400 - sched(14400, J);
  EQ("A-7 the note's single overstatement is 4.5 % × $7,200 − $109.25 = $214.75", overS, 214.75);
  EQ("A-8 the note's joint overstatement is 4.5 % × $14,400 − $218.50 = $429.50", overJ, 429.50);
  // and it is the most: above the top threshold the flat top rate and the schedule differ by exactly that constant
  EQ("A-9 …and constant above the threshold ($250,000 single)", 0.045 * 250000 - sched(250000, S), 214.75, 1e-6);
}

// ── B · hand cases to the cent ──
const call = (code, retIncome, ageA, ageB = null, single = true) =>
  ST({ code, retIncome, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA, ageB, single });
EQ(`B-1 GA single 66, $100,000 of IRA income: ${(GA * 100).toFixed(2)} % × ($100,000 − $65,000) = $${(GA * 35000).toFixed(2)}`, call("GA", 100000, 66), FIXED ? 1746.50 : 1816.50);
EQ(`B-2 GA single 63, $50,000 (no exclusion before 65 here): $${(GA * 50000).toFixed(2)}`, call("GA", 50000, 63), FIXED ? 2495 : 2595);
EQ(`B-3 GA joint 66/66, $200,000: ${(GA * 100).toFixed(2)} % × ($200,000 − $130,000) = $${(GA * 70000).toFixed(2)}`, call("GA", 200000, 66, 66, false), FIXED ? 3493 : 3633);
EQ(`B-4 OK single 66, $50,000: ${(OK * 100).toFixed(2)} % × ($50,000 − $10,000) = $${(OK * 40000).toFixed(2)}`, call("OK", 50000, 66), FIXED ? 1800 : 1900);
EQ(`B-5 OK joint 65/65, $100,000: ${(OK * 100).toFixed(2)} % × ($100,000 − $20,000) = $${(OK * 80000).toFixed(2)}`, call("OK", 100000, 65, 65, false), FIXED ? 3600 : 3800);
EQ(`B-6 OK single 64, $50,000 (no exclusion before 65 here): $${(OK * 50000).toFixed(2)}`, call("OK", 50000, 64), FIXED ? 2250 : 2375);

// ── C · v5.96 -> v5.97: only Georgia and Oklahoma move, by exactly the rate ratio ──
if (VER === "v597") {
  if (!existsSync(new URL("./app_v596.mjs", HERE))) console.log("  – group C not run: app_v596.mjs is not in this run folder");
  else {
    const pm = await import("./app_v596.mjs"), PST = pm.__engines.stateTaxAnnual || pm.__g.stateTaxAnnual;
    const RATIO = { GA: 0.0499 / 0.0519, OK: 0.045 / 0.0475 };
    let n = 0, same = 0, scaled = 0, badC = [];
    for (const code of Object.keys(SR)) for (const single of [true, false]) for (const age of [50, 62, 66, 72]) for (const ret of [0, 30000, 90000, 250000])
      for (const pen of [0, 20000]) for (const ss of [0, 20000]) {
        const a = { code, retIncome: ret, pen, work: 5000, capGains: 3000, ssTaxableFed: ss, ssGrossA: ss ? 24000 : 0, ssGrossB: 0, ageA: age, ageB: single ? null : age, single };
        const x = PST({ ...a }), y = ST({ ...a }); n++;
        if (RATIO[code]) { if (Math.abs(y - x * RATIO[code]) <= 1e-6 * Math.max(1, x)) scaled++; else badC.push(`${code} ${JSON.stringify(a)} ${x}->${y}`); }
        else if (x === y) same++; else badC.push(`${code} moved ${x}->${y}`);
      }
    CK(`C-1 the calculator: ${n} calls across all ${Object.keys(SR).length} rows — identical outside GA/OK (${same}), exactly the rate ratio inside (${scaled})`, badC.length === 0, badC.slice(0, 3).join(" · "));
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
      const withA = ["GA", "OK", "ME", "NY", "MI", null].includes(code);
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
    CK(`C-2 Engine B (example household, every jurisdiction, Roth $0 and $70,000): identical outside GA/OK (${bSame} of 104); inside, only stateTax/totalTax/effRate move`,
       bOther.length === 0 && bSame === 100, bOther.slice(0, 4).join(" · "));
    CK(`C-3 Engine B: no year's state tax rises; ${falls} fall`, rises === 0 && falls > 0, `${rises} rise`);
    EQ(`C-4 Engine B lifetime state tax, Georgia, no conversions: $${lifeState.GAB0?.[0]} -> $${lifeState.GAB0?.[1]} (the scope's measurement)`, lifeState.GAB0?.[1], 19881, 0);
    EQ(`C-5 Engine B lifetime state tax, Oklahoma, no conversions: $${lifeState.OKB0?.[0]} -> $${lifeState.OKB0?.[1]} (the scope's measurement)`, lifeState.OKB0?.[1], 64281, 0);
    CK("C-6 Engines C (IRMAA) and D (Withdrawal) byte-identical in every jurisdiction", cdBad.length === 0, cdBad.slice(0, 4).join(" · "));
    CK(`C-7 Engine A: no strategy's lifetime tax rises; ${aDown} fall (12 expected: six strategies × GA, OK); nothing moves outside GA/OK`,
       aUp === 0 && aDown === 12 && aOther.length === 0, `${aUp} rise, ${aDown} fall, other ${aOther.join(",")}`);
    CK("C-8 Engine A: the estate-best strategy changes in no jurisdiction tested (GA, OK, ME, NY, MI, none)", bestChg.length === 0, bestChg.join(" · "));
  }
}
done();
