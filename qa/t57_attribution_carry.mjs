// t57 — D-12 PHASE 2: PER-PERSON, PER-PLAN-TYPE RETIREMENT INCOME IS CARRIED TO THE STATE CALCULATOR (v5.93)
// docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md §2 (Phase 2) and §8 (build record). CURRENT LEG ONLY (node). There is no v5.92: `v592` is the retired v5.9.2 leg's tag (scope §9, P2-9).
//
// WHAT v5.93 CHANGED. Engines A (runRothStrategies, two state call sites) and B (computeTaxPlan, one) now pass the state
// calculator a `byPerson` split of the household's retirement income — by person and by plan type (IRA / employer /
// annuity), plus the pension by owner and the spending draw separately — built by ONE shared function, attributeRetIncome.
// The calculator ACCEPTS IT AND DOES NOT READ IT (`void byPerson;`) until D-12 Phase 3, so no figure moves. Engines C and D
// compute no state tax and are untouched.
//
// WHAT THIS SUITE PROVES, and why each part exists:
//   A · attributeRetIncome, unit: hand-computed cases (QCD from IRA dollars first, the annuity share, the pension owner), its
//       defaults and clamps, and the sum-back IDENTITY on a seeded grid of 2,000 random inputs.
//   B · retireStartBalances' employer share, hand-computed on a purpose-built household: holdings and Other accounts by
//       planType, the "B or else A" ownership fail-safe, annuity excluded, and the bonus deferral + match (P2-7).
//   C · RUNTIME: every one of the three call sites, on real households, hands the calculator a split that sums back to the
//       household arguments it passes beside it; after a death the decedent is attributed nothing. Observed by a RECORDER
//       spliced over v5.93's `void byPerson;` in a COPY of the test module (deleted after). Equivalence alone could not prove
//       this: an ignored argument cannot move an output, so a wrong split would leave every other suite green.
//   D · SOURCE (AST): one definition; each of the three call sites passes byPerson built by it; the calculator reads byPerson
//       nowhere but `void byPerson;` [PHASE-2 GUARD — Phase 3 replaces this check by design]; every Engine A P-construction
//       site that passes `pen` also passes `penOwner`; Engine B's _postA/_fracA are declared once, above the state call.
//
// ⚠ THE RECORDER ANCHOR IS THIS RELEASE'S OWN `void byPerson;`, asserted to occur EXACTLY ONCE. When Phase 3 makes the
// calculator read byPerson, that statement goes and section C fails loudly here — it cannot pass vacuously.
const VER = process.argv[2];
const MODPATH = process.argv[3] || `./app_${VER}.mjs`;
const KNOWN_VERSIONS = ["v593", "v594", "v595", "v596"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to KNOWN_VERSIONS and decide which leg's figures it owes BEFORE running.");
  process.exit(1);
}
const { readFileSync, writeFileSync, unlinkSync, existsSync } = await import("fs");
const { resolve, dirname } = await import("path");
const { createRequire } = await import("module");
const m = await import(MODPATH);
const g = m.__g, E = m.__engines;
// v5.94 (D-26): the spending draw joins the income split, because every call site now passes it in retIncome. Gated per build
// (OPERATIONS \u00a7B2): the v593 leg still asserts P2-6 (draw kept apart), every later leg asserts the draw inside the split.
const DRAW_IN_SPLIT = VER !== "v593";

let pass = 0, fail = 0;
const ck = (name, cond, detail = "") => {
  if (cond) pass++;
  else { fail++; console.log(`  \u2717 ${name}${detail !== "" ? " \u2014 " + detail : ""}`); }
};
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
console.log(`t57 \u2014 D-12 PHASE 2: PER-PERSON ATTRIBUTION CARRIED (${VER}${process.argv[3] ? " \u00b7 module " + MODPATH : ""})`);

// ── A · attributeRetIncome, unit ─────────────────────────────────────────────────────────────────────────────────────────
console.log("\n  A \u2014 attributeRetIncome (unit)");
const AR = g.attributeRetIncome;
ck("A0: attributeRetIncome is exported and callable", typeof AR === "function");
if (typeof AR === "function") {
  const inc = (o, p) => o[p].ira + o[p].employer + o[p].annuity;
  // A1 · an RMD splits IRA / employer by the person's employer share; no annuity in an RMD. Hand: 10,000 × 0.25 = 2,500.
  let r = AR({ rmdA: 10000, rmdB: 4000, empShareA: 0.25, empShareB: 0 });
  ck("A1: RMD 10,000 at employer share 0.25 \u2192 IRA 7,500, employer 2,500, annuity 0 (A); B all IRA 4,000",
     r.A.ira === 7500 && r.A.employer === 2500 && r.A.annuity === 0 && r.B.ira === 4000 && r.B.employer === 0, JSON.stringify(r));
  // A2 · a QCD comes out of IRA dollars first (P2-4). RMD 10,000, taxable 7,000 → 3,000 off the IRA's 7,500 → 4,500 / 2,500.
  r = AR({ rmdA: 10000, rmdTaxable: 7000, empShareA: 0.25 });
  ck("A2: QCD 3,000 comes out of IRA first \u2192 IRA 4,500, employer 2,500", r.A.ira === 4500 && r.A.employer === 2500, JSON.stringify(r.A));
  // A3 · a QCD larger than the IRA share spills to employer. Share 0.9: IRA 1,000, employer 9,000; QCD 3,000 → IRA 0, employer 7,000.
  r = AR({ rmdA: 10000, rmdTaxable: 7000, empShareA: 0.9 });
  ck("A3: QCD beyond the IRA dollars spills to employer \u2192 IRA 0, employer 7,000", near(r.A.ira, 0) && near(r.A.employer, 7000), JSON.stringify(r.A));
  // A4 · a QCD is shared between people by their RMDs. RMDs 6,000 / 2,000, taxable 4,000 → A loses 3,000, B 1,000 (all IRA).
  r = AR({ rmdA: 6000, rmdB: 2000, rmdTaxable: 4000 });
  ck("A4: QCD shared by RMD \u2192 A 3,000, B 1,000", near(r.A.ira, 3000) && near(r.B.ira, 1000), JSON.stringify(r));
  // A5 · a conversion leaves the whole leg: annuity 10 % → 1,000; the remaining 9,000 at employer share 0.5 → 4,500 / 4,500.
  r = AR({ convA: 10000, annShareA: 0.1, empShareA: 0.5 });
  ck("A5: conversion 10,000, annuity 0.1, employer 0.5 \u2192 annuity 1,000, employer 4,500, IRA 4,500",
     near(r.A.annuity, 1000) && near(r.A.employer, 4500) && near(r.A.ira, 4500), JSON.stringify(r.A));
  // A6 · the pension goes to its owner, whole.
  r = AR({ pen: 30000, penOwner: "B" });
  ck("A6: pension 30,000 owned by B \u2192 B 30,000, A 0", r.B.pension === 30000 && r.A.pension === 0);
  r = AR({ pen: 30000 });
  ck("A6b: penOwner omitted \u2192 A (the v5.91 default)", r.A.pension === 30000 && r.B.pension === 0);
  // A7 · v593: the draw is attributed SEPARATELY and is NOT in the income split (P2-6). v594+: it IS in the split (D-26), and the
  //      `draw` record still carries the same dollars as an of-which breakdown.
  r = AR({ drawA: 8000, drawB: 2000, annShareB: 0.5, empShareA: 1 });
  if (!DRAW_IN_SPLIT) ck("A7: the draw is kept apart from the income split", inc(r, "A") === 0 && inc(r, "B") === 0 &&
     r.draw.A.employer === 8000 && r.draw.B.annuity === 1000 && r.draw.B.ira === 1000, JSON.stringify(r));
  else ck("A7: the draw is IN the income split (D-26) \u2192 A employer 8,000; B annuity 1,000, IRA 1,000; of-which record unchanged",
     r.A.employer === 8000 && r.A.ira === 0 && r.B.annuity === 1000 && r.B.ira === 1000 && inc(r, "A") === 8000 && inc(r, "B") === 2000 &&
     r.draw.A.employer === 8000 && r.draw.B.annuity === 1000 && r.draw.B.ira === 1000, JSON.stringify(r));
  // A8 · defaults and clamps: no argument → all zero; shares outside [0, 1] or NaN are clamped, never propagated.
  r = AR();
  ck("A8: no argument \u2192 every component 0", ["A", "B"].every(p => inc(r, p) === 0 && r[p].pension === 0) && r.draw.A.ira === 0);
  r = AR({ rmdA: 1000, empShareA: 1.7, convB: 1000, annShareB: NaN, empShareB: -2 });
  ck("A8b: shares clamped to [0, 1] (1.7 \u2192 1, NaN \u2192 0, \u22122 \u2192 0)", r.A.employer === 1000 && r.A.ira === 0 && r.B.ira === 1000 && r.B.annuity === 0);
  // A9 · THE IDENTITY, on a seeded grid. Income split sums to (rmdTaxable ?? RMDs) + conversions; pensions to pen; draws to draws;
  //      no component negative. Seeded LCG so a failure reproduces.
  let seed = 57, bad = 0, neg = 0, first = "";
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 2000; i++) {
    const a = { rmdA: rnd() * 1e5, rmdB: rnd() < 0.3 ? 0 : rnd() * 1e5, convA: rnd() < 0.4 ? 0 : rnd() * 2e5, convB: rnd() * 5e4,
                drawA: rnd() * 6e4, drawB: rnd() * 6e4, pen: rnd() < 0.5 ? 0 : rnd() * 5e4, penOwner: rnd() < 0.5 ? "A" : "B",
                annShareA: rnd() < 0.5 ? 0 : rnd(), annShareB: rnd() * 0.3, empShareA: rnd(), empShareB: rnd() < 0.5 ? 0 : rnd() };
    const rm = a.rmdA + a.rmdB;
    if (rnd() < 0.5) a.rmdTaxable = Math.max(0, rm - rnd() * 3e4);
    const o = AR(a), want = (a.rmdTaxable ?? rm) + a.convA + a.convB + (DRAW_IN_SPLIT ? a.drawA + a.drawB : 0);
    const ok = near(inc(o, "A") + inc(o, "B"), want) && near(o.A.pension + o.B.pension, a.pen) &&
      near(o.draw.A.ira + o.draw.A.employer + o.draw.A.annuity + o.draw.B.ira + o.draw.B.employer + o.draw.B.annuity, a.drawA + a.drawB);
    if (!ok) { bad++; if (!first) first = JSON.stringify(a); }
    for (const p of ["A", "B"]) for (const k of ["ira", "employer", "annuity"]) if (o[p][k] < -1e-6 || o.draw[p][k] < -1e-6) neg++;
  }
  ck("A9: identity holds on 2,000 seeded random inputs (income, pension, draw)", bad === 0, `${bad} failed; first ${first}`);
  ck("A9b: and no component is ever negative", neg === 0, `${neg} negative`);
}

// ── B · retireStartBalances' employer share, hand-computed ─────────────────────────────────────────────────────────────────
console.log("\n  B \u2014 the employer share at retirement start (hand-computed)");
const EX = JSON.parse(JSON.stringify(g.PORTFOLIO()));
{
  const P = JSON.parse(JSON.stringify(EX));
  P.positions = [
    { ticker: "T1", name: "T1", owner: "A", balance: 100000, bucket: 3, type: "equity-lb", roth: 0, trad: 100000, er: 0, planType: "employer" },
    { ticker: "T2", name: "T2", owner: "A", balance: 70000, bucket: 3, type: "equity-lb", roth: 20000, trad: 50000, er: 0, planType: "ira" },
    { ticker: "T3", name: "T3", balance: 30000, bucket: 2, type: "bond", roth: 0, trad: 30000, er: 0, planType: "employer" },  // NO owner → A
    { ticker: "T4", name: "T4", owner: "B", balance: 80000, bucket: 3, type: "equity-intl", roth: 0, trad: 80000, er: 0, planType: "employer" },
    { ticker: "T5", name: "T5", owner: "B", balance: 20000, bucket: 1, type: "cash", roth: 0, trad: 20000, er: 0 },             // no planType
  ];
  P.otherAccounts = [
    { name: "O1", owner: "A", taxType: "trad", balance: 40000, planType: "employer" },
    { name: "O2", owner: "B", taxType: "trad", balance: 10000, planType: "ira" },
    { name: "O3", owner: "B", taxType: "annuity", balance: 25000 },                                     // annuity: never employer
    { name: "O4", owner: "JT", taxType: "trad", balance: 5000, planType: "employer" },                  // JT → A ("B or else A")
    { name: "O5", owner: "A", taxType: "taxable", balance: 9000, planType: "employer" },                // not Traditional: ignored
  ];
  P.contributions = { ...(P.contributions || {}), contribPreTaxA: 1000, contribRothA: 0, contribPreTaxB: 500, contribRothB: 0,
                      annualBonus: 20000, bonusDeferralPct: 10, bonusMatchPct: 5 };
  g.setPortfolio(P);
  const tl = g.PLAN_TIMELINE(), asOf = tl.asOfYear, ry = asOf + 2;
  const yA = 2, yB = Math.max(0, (tl.single ? ry : (tl.targetRetireYearB || ry)) - asOf);
  // Hand: accrual A = 12×1,000×2 + 20,000×(10%+5%)×2 = 24,000 + 6,000; the 6,000 is employer (bonus deferral + match, P2-7).
  const accA = 12 * 1000 * yA + 20000 * 0.15 * yA, accEmpA = 20000 * 0.15 * yA, accB = 12 * 500 * yB;
  const rmdA = 100000 + 50000 + 30000 + accA + 40000 + 5000;              // holdings (owner A or missing) + accrual + Other trad (A, JT)
  const empA = 100000 + 30000 + 40000 + 5000 + accEmpA;                   // = 181,000
  const rmdB = 80000 + 20000 + accB + 10000;                              // annuity O3 is NOT in the RMD base
  const empB = 80000;
  const rsb = g.retireStartBalances(ry);
  ck("B1: the hand inputs are what the engine sees (RMD-bearing bases)", near(rsb.rmdInitA, rmdA) && near(rsb.rmdInitB, rmdB),
     `A ${rsb.rmdInitA} vs ${rmdA}; B ${rsb.rmdInitB} vs ${rmdB} (yB ${yB})`);
  ck(`B2: employer share A = ${empA.toLocaleString("en-US")} / ${rmdA.toLocaleString("en-US")} (owner-missing row and JT count as A; bonus + match is employer)`,
     near(rsb.empShareA, empA / rmdA, 1e-12), `${rsb.empShareA} vs ${empA / rmdA}`);
  ck(`B3: employer share B = 80,000 / ${rmdB.toLocaleString("en-US")} (untyped row is IRA; annuity never employer; monthly pre-tax is IRA)`,
     near(rsb.empShareB, empB / rmdB, 1e-12), `${rsb.empShareB} vs ${empB / rmdB}`);
  ck("B4: contribAccrual reports the bonus + match portion separately, and tradA is unchanged by it",
     near(g.contribAccrual(ry).tradEmpA, accEmpA) && near(g.contribAccrual(ry).tradA, accA));
  // B5 · nothing marked employer → share exactly 0; the existing fields are untouched.
  const P2 = JSON.parse(JSON.stringify(P));
  P2.positions.forEach(p => { if (p.planType) p.planType = "ira"; }); P2.otherAccounts.forEach(a => { if (a.planType) a.planType = "ira"; });
  P2.contributions.annualBonus = 0;
  g.setPortfolio(P2);
  const r2 = g.retireStartBalances(ry);
  ck("B5: with no employer dollars both shares are exactly 0", r2.empShareA === 0 && r2.empShareB === 0, `${r2.empShareA} / ${r2.empShareB}`);
  ck("B6: the share sits beside annShare, the field it is the twin of", "annShareA" in rsb && "empShareA" in rsb && "empShareB" in rsb);
  g.setPortfolio(JSON.parse(JSON.stringify(EX)));
}

// ── C · RUNTIME: every call site's split sums back to the household arguments ──────────────────────────────────────────────
console.log("\n  C \u2014 runtime: the split each call site passes sums back to its household arguments");
{
  const ANCHOR = "void byPerson;";
  const absMod = resolve(dirname(new URL(import.meta.url).pathname), MODPATH);
  const txt = readFileSync(absMod, "utf8");
  const n = txt.split(ANCHOR).length - 1;
  ck("C0: the recorder anchor `void byPerson;` occurs exactly once in the test module [Phase 3 removes it by design]", n === 1, `found ${n}`);
  if (n === 1) {
    const recPath = absMod.replace(/\.mjs$/, "_t57rec.mjs");
    writeFileSync(recPath, txt.replace(ANCHOR, "globalThis.__T57 && globalThis.__T57.push({ byPerson, retIncome, pen, single, ageA, ageB, sale: String(new Error().stack).includes('_estSaleGain') });"));
    let R;
    try { R = await import(recPath); } finally { if (existsSync(recPath)) unlinkSync(recPath); }
    const rg = R.__g, RE = R.__engines;
    const households = [
      ["example, NC", p => { p.stateCode = "NC"; }],
      ["employer plans, pension owned by B, NC", p => { p.stateCode = "NC"; p.positions.forEach((x, i) => { if (i % 2 === 0 && x.trad > 0) x.planType = "employer"; });
        (p.otherAccounts || []).forEach(a => { if (a.taxType === "trad") a.planType = "employer"; }); p.incomeSources.pension.owner = "B"; p.incomeSources.pension.amount = 2500; }],
      ["single, PA", p => { p.stateCode = "PA"; p.single = true; }],
    ];
    let calls = 0, nullBP = 0, badInc = 0, badPen = 0, neg = 0, deadGot = 0, deadYears = 0, firstBad = "";
    let sawEmp = 0, sawAnn = 0, sawPenB = 0, sawDraw = 0, callsA = 0, callsB = 0, callsSale = 0;
    let c7b = null; // the same, Engine A (it carries its own copy of the merge)
    let c7 = null; // P2-3: the survivor's employer fraction before vs after the death (Engine B, employer household)
    for (const [name, mut] of households) {
      const P = JSON.parse(JSON.stringify(EX)); mut(P); rg.setPortfolio(P);
      const tl = rg.PLAN_TIMELINE(), ry = tl.targetRetireYear, single = !!tl.single;
      const survivorIsA = single || (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB);
      const deathYr = single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB);
      const s = rg.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      const check = (rec) => {
        for (const c of rec) {
          calls++;
          const b = c.byPerson;
          if (!b) { nullBP++; continue; }
          const sumInc = ["A", "B"].reduce((t, p) => t + b[p].ira + b[p].employer + b[p].annuity, 0);
          if (!near(sumInc, c.retIncome)) { badInc++; if (!firstBad) firstBad = `${name}: split ${sumInc} vs retIncome ${c.retIncome}`; }
          if (!near(b.A.pension + b.B.pension, c.pen)) { badPen++; if (!firstBad) firstBad = `${name}: pension ${b.A.pension + b.B.pension} vs ${c.pen}`; }
          for (const p of ["A", "B"]) for (const k of ["ira", "employer", "annuity"]) if (b[p][k] < -1e-6 || b.draw[p][k] < -1e-6) neg++;
          if (b.A.employer + b.B.employer > 0) sawEmp++;
          if (b.A.annuity + b.B.annuity > 0) sawAnn++;
          if (b.B.pension > 0 && b.A.pension === 0) sawPenB++;
          if (b.draw.A.ira + b.draw.A.employer + b.draw.A.annuity + b.draw.B.ira + b.draw.B.employer + b.draw.B.annuity > 0) sawDraw++;
          if (c.sale) callsSale++;
          // A death is detected by YEAR. NOT by the call's `single` flag: it is joint in the death year itself (Pub. 501), so a flag
          // test misses that year (and through v5.95 Engine A passed the household's flag every year — control K8). v5.95 (Engine B)
          // and v5.96 (Engine A, D-27) blank the decedent's age in single survivor years, so the year is read from whichever age is
          // present (`_yr`); `dobA + ageA` alone misfiled a surviving B's calls as pre-death once ageA went null.
          const _yr = (c.ageA !== null && c.ageA !== undefined) ? tl.dobA.year + c.ageA : tl.dobB.year + c.ageB;
          if (!single && _yr >= deathYr) {
            deadYears++;
            const d = survivorIsA ? "B" : "A";
            const got = b[d].ira + b[d].employer + b[d].annuity + b[d].pension + b.draw[d].ira + b.draw[d].employer + b.draw[d].annuity;
            if (got > 1e-6) deadGot++;
          }
        }
      };
      for (const [ra, q] of [[0, 0], [70000, 0], [70000, 20000]]) {
        globalThis.__T57 = [];
        RE.computeTaxPlan({ retireYear: ry, rothAmount: ra, qcdAnnual: q, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr });
        callsB += globalThis.__T57.length; check(globalThis.__T57);
        if (name.startsWith("employer") && ra > 0 && q === 0 && !single) {
          // Survivor's employer fraction employer / (ira + employer): RMDs and conversions both split by the person's employer
          // share (QCD off here), so this IS the share. Fixed while both live; strictly LOWER after the death, because the
          // decedent's employer dollars arrive as the survivor's IRA dollars (P2-3).
          const deathYr = Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), S = survivorIsA ? "A" : "B";
          const pre = [], post = [];
          for (const c of globalThis.__T57) {
            const q2 = c.byPerson[S].ira + c.byPerson[S].employer; if (!(q2 > 1)) continue;
            // v5.95 (P3-S): Engine B passes a BLANK ageA for a surviving B in single years — date the call from whichever age is present
            const _cy = c.ageA !== null && c.ageA !== undefined ? tl.dobA.year + c.ageA : tl.dobB.year + c.ageB;
            (_cy >= deathYr ? post : pre).push(c.byPerson[S].employer / q2);
          }
          c7 = { pre, post };
        }
      }
      const rsb = rg.retireStartBalances(ry);
      const PO = { single, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
        ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
        deathYr1: single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), survivor: survivorIsA ? "A" : "B",
        ssA: rg.getSSA(), ssB: single ? 0 : rg.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
        pen: rg.getPension(), penOwner: rg.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: P.stateCode || null,
        convTaxFunding: "taxable", taxableGainFrac: 0.3, acaPremium: 0, acaSize: 0, taxableInit: rg.taxableInitAll(), taxYieldPct: 2.0, currentConv: 0,
        ...rsb, ordDrawByYr: s.ordDrawByYr };
      globalThis.__T57 = [];
      rg.runRothStrategies(PO);
      callsA += globalThis.__T57.length; check(globalThis.__T57);
      if (name.startsWith("employer") && !single) {
        // Engine A runs SEVERAL strategies in one call, and each converts before the death in its own proportions, so each merges
        // different balances and lands on its own post-death share (measured: 0.04609 in one, 0.02345 in another — correct). The
        // check is therefore PER STRATEGY RUN: a run starts wherever the year goes backwards.
        const S = survivorIsA ? "A" : "B", runs = []; let lastYr = Infinity;
        for (const c of globalThis.__T57) {
          if (c.sale) continue;
          // v5.96 (D-27): Engine A blanks the decedent's age in single survivor years — date the call from whichever age is present.
          const yr = (c.ageA !== null && c.ageA !== undefined) ? tl.dobA.year + c.ageA : tl.dobB.year + c.ageB; if (yr < lastYr) runs.push({ pre: [], post: [] }); lastYr = yr;
          const q2 = c.byPerson[S].ira + c.byPerson[S].employer; if (!(q2 > 1)) continue;
          (yr >= deathYr ? runs[runs.length - 1].post : runs[runs.length - 1].pre).push(c.byPerson[S].employer / q2);
        }
        c7b = runs;
      }
      // The ACA bridge: Engine A's SALE-GAIN state call (inside _estSaleGain) runs only when someone is retired and under 65 and
      // an ACA premium is set (acaHeads > 0) with a gain-bearing taxable pool. Retire at 60 with t22's ACA inputs to reach it.
      globalThis.__T57 = [];
      rg.runRothStrategies({ ...PO, retireYr: tl.dobA.year + 60, acaPremium: 1600, acaSize: single ? 1 : 2 });
      callsA += globalThis.__T57.length; check(globalThis.__T57);
    }
    delete globalThis.__T57;
    ck(`C8 (non-vacuity): Engine A's sale-gain state call was observed (${callsSale} calls) — without it C2 never sees that site (control K9)`, callsSale > 0);
    ck(`C1: every state call carried a split (${calls} calls: Engine B ${callsB}, Engine A ${callsA})`, nullBP === 0 && callsA > 0 && callsB > 0,
       `${nullBP} without byPerson; A ${callsA}, B ${callsB}`);
    ck("C2: in every call the income split sums to the retIncome passed beside it", badInc === 0, `${badInc} bad; ${firstBad}`);
    ck("C3: in every call the pension split sums to the pen passed beside it", badPen === 0, `${badPen} bad; ${firstBad}`);
    ck("C4: no component of any split is negative", neg === 0, `${neg}`);
    ck(`C5: after a death the decedent is attributed nothing (${deadYears} widowed calls observed)`, deadYears > 0 && deadGot === 0,
       `${deadGot} of ${deadYears} widowed calls attributed something to the decedent`);
    {
      const spread = a => a.length ? Math.max(...a) - Math.min(...a) : NaN;
      const ok = c7 && c7.pre.length > 0 && c7.post.length > 0 && spread(c7.pre) < 1e-9 && spread(c7.post) < 1e-9 && c7.post[0] < c7.pre[0] - 1e-6;
      ck(`C7: the survivor's employer share is fixed while both live, then drops at the death (the decedent's employer dollars arrive as IRA, P2-3)`, ok,
         c7 ? `pre ${c7.pre.length} yrs ${c7.pre[0]?.toFixed(6)} (spread ${spread(c7.pre)}), post ${c7.post.length} yrs ${c7.post[0]?.toFixed(6)} (spread ${spread(c7.post)})` : "not observed");
    }
    {
      const spread = a => a.length ? Math.max(...a) - Math.min(...a) : NaN;
      const used = (c7b || []).filter(r => r.pre.length > 0 && r.post.length > 0);
      const badRuns = used.filter(r => !(spread(r.pre) < 1e-9 && spread(r.post) < 1e-9 && r.post[0] < r.pre[0] - 1e-6));
      ck(`C7b: the same in Engine A, in each of its ${used.length} strategy runs (it carries its own copy of the merge)`, used.length >= 2 && badRuns.length === 0,
         `${badRuns.length} of ${used.length} runs bad` + (badRuns[0] ? `; first: pre ${badRuns[0].pre[0]?.toFixed(6)} spread ${spread(badRuns[0].pre)}, post ${badRuns[0].post[0]?.toFixed(6)} spread ${spread(badRuns[0].post)}` : ""));
    }
    ck(`C6 (non-vacuity): the paths were exercised \u2014 employer ${sawEmp}, annuity ${sawAnn}, pension to B ${sawPenB}, draw ${sawDraw}`,
       sawEmp > 0 && sawAnn > 0 && sawPenB > 0 && sawDraw > 0);
  }
  g.setPortfolio(JSON.parse(JSON.stringify(EX)));
}

// ── D · SOURCE (AST) ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("\n  D \u2014 source shape (AST)");
{
  const ROOT = new URL("..", import.meta.url).pathname, SRC = `${ROOT}${VER}.jsx`;
  const req = createRequire(import.meta.url);
  const acorn = req("acorn"), jsx = req("acorn-jsx"), walk = req("acorn-walk");
  const src = readFileSync(SRC, "utf8"), ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true, ranges: true });
  const wb = { ...walk.base };
  for (const k of ["JSXElement", "JSXFragment", "JSXText", "JSXExpressionContainer", "JSXAttribute", "JSXOpeningElement", "JSXClosingElement",
                   "JSXSpreadAttribute", "JSXEmptyExpression", "JSXIdentifier", "JSXMemberExpression", "JSXNamespacedName"]) wb[k] = (n, st, c) => {
    if (n.type === "JSXExpressionContainer" || n.type === "JSXSpreadAttribute") c(n.expression || n.argument, st);
    else for (const key of ["openingElement", "children", "attributes", "value"]) { const v = n[key]; if (Array.isArray(v)) v.forEach(x => x && c(x, st)); else if (v && typeof v === "object" && v.type) c(v, st); }
  };
  const defs = ast.body.filter(n => n.type === "FunctionDeclaration" && n.id.name === "attributeRetIncome");
  ck("D1: attributeRetIncome is defined exactly once, at module level", defs.length === 1, `${defs.length}`);
  // D2 · each stateTaxAnnual call passes byPerson whose value is a call to attributeRetIncome, or to a local arrow that calls it.
  const calls = []; walk.simple(ast, { CallExpression(n) { if (n.callee.type === "Identifier" && n.callee.name === "stateTaxAnnual") calls.push(n); } }, wb);
  const arrowsCalling = new Set();
  walk.simple(ast, { VariableDeclarator(n) {
    if (n.id.type === "Identifier" && n.init && n.init.type === "ArrowFunctionExpression" && /\battributeRetIncome\s*\(/.test(src.slice(n.init.range[0], n.init.range[1]))) arrowsCalling.add(n.id.name);
  } }, wb);
  const wired = calls.filter(c => {
    const o = c.arguments[0]; if (!o || o.type !== "ObjectExpression") return false;
    const p = o.properties.find(q => q.key && (q.key.name === "byPerson"));
    return p && p.value.type === "CallExpression" && p.value.callee.type === "Identifier" &&
      (p.value.callee.name === "attributeRetIncome" || arrowsCalling.has(p.value.callee.name));
  });
  ck(`D2: all ${calls.length} stateTaxAnnual call sites pass byPerson built by attributeRetIncome`, calls.length === 3 && wired.length === 3,
     `${wired.length} of ${calls.length}`);
  // D3 · [PHASE-2 GUARD] the calculator reads byPerson nowhere but `void byPerson;`. Phase 3 replaces this check by design.
  const sta = ast.body.find(n => n.type === "FunctionDeclaration" && n.id.name === "stateTaxAnnual");
  const uses = []; walk.ancestor(sta.body, { Identifier(n, st, anc) { if (n.name === "byPerson") uses.push(anc[anc.length - 2]); } }, wb);
  // v5.95 (D-12 Phase 3): the guard flips by design — byPerson is now READ by the per-person rules. Gated per build (OPERATIONS §B2).
  if (VER === "v593" || VER === "v594") ck("D3 [PHASE-2 GUARD]: stateTaxAnnual's body reads byPerson only in `void byPerson;` \u2014 so no figure can move this release",
     uses.length === 1 && uses[0].type === "UnaryExpression" && uses[0].operator === "void", `${uses.length} uses: ${uses.map(u => u.type).join(", ")}`);
  else ck(`D3 [PHASE-3]: stateTaxAnnual reads byPerson beyond the recorder anchor (${uses.length} uses)`, uses.length > 1, `${uses.length}`);
  // D4 · every object literal that builds an Engine A P (has pen AND stateCode keys) also passes penOwner.
  const pObjs = []; walk.simple(ast, { ObjectExpression(n) {
    const keys = new Set(n.properties.filter(p => p.key).map(p => p.key.name)); if (keys.has("pen") && keys.has("stateCode")) pObjs.push([n, keys.has("penOwner")]);
  } }, wb);
  ck(`D4: every Engine A P-construction site passing pen also passes penOwner (${pObjs.length} sites)`, pObjs.length >= 4 && pObjs.every(([, h]) => h),
     `${pObjs.filter(([, h]) => !h).length} of ${pObjs.length} missing`);
  // D5 · Engine B's hoist: _postA and _fracA each declared once in computeTaxPlan, before its state call.
  const ctp = ast.body.find(n => n.type === "FunctionDeclaration" && n.id.name === "computeTaxPlan");
  const decl = {}; walk.simple(ctp, { VariableDeclarator(n) { if (n.id.type === "Identifier" && ["_postA", "_fracA"].includes(n.id.name)) (decl[n.id.name] ||= []).push(n.start); } }, wb);
  const stCall = calls.find(c => c.start > ctp.start && c.end < ctp.end);
  ck("D5: Engine B declares _postA and _fracA once each, above its state call (the hoist)",
     decl._postA?.length === 1 && decl._fracA?.length === 1 && stCall && decl._postA[0] < stCall.start && decl._fracA[0] < stCall.start,
     JSON.stringify(decl));
}

console.log(`\nt57 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
