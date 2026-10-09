// t60 — THE ROTH COMPARATOR FILES THE SURVIVOR'S STATE RETURN AS THE FEDERAL ONE IS (D-27) · docs/SCOPE_D27_ENGINE_A_SURVIVOR_STATE.md · v5.96
//
// THROUGH v5.95 both of Engine A's `stateTaxAnnual` calls (`runRothStrategies`: the ACA sale-gain estimate and the year's tax) passed
// `single: !!P.single` and both spouses' ages in every year — while every FEDERAL rule in the same engine used `effSingle` (joint for the
// death year, single after, IRS Pub. 501). So in survivor years the state layer taxed the survivor as a COUPLE: the late spouse's 65+
// exclusion, joint thresholds, bands, cliffs and caps. Optimistic. From v5.96 the state call takes `effSingle`, blanks the decedent's age
// in single survivor years and puts the survivor's benefit in the survivor's slot — as Engine B has since v5.95 (P3-S).
//
// Groups:  0 the rates and figures the hand cases assume (asserted, then hardcoded)
//          A a runtime recorder on the calls Engine A makes: filing status, ages and gross SS, survivor B and survivor A, both years
//          B hand cases to the cent through the calculator with Engine A's own recorded arguments (GA, ME, MI), and through Engine A
//            whole (to the dollar — Engine A rounds its totals)
//          C v5.95 -> v5.96 only: Engines B, C and D byte-identical; no Engine A strategy's tax falls; the death year does not move
//          D AST: both Engine A state calls file by `effSingle`
//          E the Field Manual's dated line
// BOTH LEGS; the v595 leg PINS the defect. Group C runs on the v596 leg only (it needs app_v595.mjs). Run: node t60_engineA_survivor_state.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v595", "v596", "v597", "v598"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const done = () => { console.log(`\nt60 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t60 — D-27: ENGINE A FILES THE SURVIVOR'S STATE RETURN SINGLE (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const FIXED = VER !== "v595";
console.error = () => {}; console.warn = () => {};
const { readFileSync, writeFileSync, unlinkSync, existsSync } = await import("fs");
const HERE = new URL(".", import.meta.url);

// ── the module, with a recorder spliced over `void byPerson;` (t57's technique; it records the arguments AS PASSED, before the swap) ──
const modPath = new URL(`./app_${VER}.mjs`, HERE).pathname, recPath = modPath.replace(/\.mjs$/, "_t60rec.mjs");
const txt = readFileSync(modPath, "utf8");
CK("0-0 the recorder anchor `void byPerson;` occurs exactly once in the test module", txt.split("void byPerson;").length === 2);
writeFileSync(recPath, txt.replace("void byPerson;", "void byPerson; globalThis.__T60 && globalThis.__T60.push({ code, single, ageA, ageB, ssGrossA, ssGrossB, retIncome, pen, work, capGains, ssTaxableFed, byPerson, fallbackRate, A: String(new Error().stack).includes('runRothStrategies') });"));
let m; try { m = await import(recPath); } finally { if (existsSync(recPath)) unlinkSync(recPath); }
const g = m.__g, E = m.__engines, ST = E.stateTaxAnnual || g.stateTaxAnnual, SR = g.STATE_RULES();

// ── 0 · rates and figures ──
// v5.97 (D-22): Georgia is 4.99 % from TY2026 (HB 463); earlier legs keep 5.19 %.
const R = { GA: (["v597", "v598"].includes(VER) ? 0.0499 : 0.0519), ME: 0.0715, MI: 0.0425 };
CK("0-1 GA " + (R.GA * 100).toFixed(2) + " % with $65,000 per person 65+; ME 7.15 % with $49,824 per person, SS-offset; MI 4.25 %, exempt, capped $65,897 single / $131,794 joint",
   SR.GA.rate === R.GA && SR.GA.excl65 === 65000 && SR.ME.rate === R.ME && SR.ME.excl65 === 49824 && !!SR.ME.ssOffset &&
   SR.MI.rate === R.MI && SR.MI.retExempt && SR.MI.retCap.single === 65897 && SR.MI.retCap.joint === 131794);

// ── the hand household: A born 1950, B 1955; A dies 2026 (the death year, filed jointly); B survives 2027 (filed single).
//    Only income: a $100,000 pension owned by the survivor. No SS, no Traditional money, no yield — so a state's tax is rate × (pension − relief).
const P = (o = {}) => ({ single: false, asOfYr: 2026, retireYr: 2026, horizonYr: 2027, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
  dobAYr: 1950, dobBYr: 1955, deathYr1: 2026, survivor: "B", ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
  pen: 100000 / 12, penOwner: "B", stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0,
  currentConv: 0, tradInit: 0, rothInit: 0, tradInitA: 0, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 0, ...o });
g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
const record = p => { globalThis.__T60 = []; const out = g.runRothStrategies(p); const rec = globalThis.__T60.filter(c => c.A); globalThis.__T60 = null; return { out, rec }; };

// ── A · what Engine A passes ──
{
  const B = record(P({ stateCode: "GA" })).rec, Asv = record(P({ stateCode: "GA", survivor: "A", deathYr1: 2026, penOwner: "A" })).rec;
  CK(`A-0 not vacuous: Engine A made state calls for both households (${B.length} / ${Asv.length})`, B.length > 0 && Asv.length > 0);
  // classify by year: the death year 2026 has A at 76; the survivor year 2027 has the survivor at 72 (B) or 77 (A)
  const survB = B.filter(c => c.ageB === 72), deathB = B.filter(c => c.ageB === 71), survA = Asv.filter(c => c.ageA === 77);
  CK(`A-1 the death year (2026) is filed JOINTLY with both ages, on both legs (${deathB.length} calls)`, deathB.length > 0 && deathB.every(c => c.single === false && c.ageA === 76));
  if (FIXED) {
    CK(`A-2 survivor B, 2027: filed SINGLE, the decedent's age blank, B's age 72 (${survB.length} calls)`, survB.length > 0 && survB.every(c => c.single === true && c.ageA === null));
    CK(`A-3 survivor A, 2027: filed SINGLE, the decedent's age blank, A's age 77 (${survA.length} calls)`, survA.length > 0 && survA.every(c => c.single === true && c.ageB === null));
  } else {
    const pinB = B.filter(c => c.ageA === 77);
    CK(`A-2 PIN v5.95: survivor B, 2027: filed JOINTLY with the late spouse's age 77 (${pinB.length} calls)`, pinB.length > 0 && pinB.every(c => c.single === false && c.ageB === 72));
  }
  // gross SS in the survivor's slot: a survivor-B household where only A drew a benefit (so the total starts in A's slot)
  const ssh = record(P({ stateCode: "MD", ssA: 2000, ssAYr: 2016, ssB: 0 })).rec, s27 = ssh.filter(c => FIXED ? c.ageB === 72 : c.ageA === 77);
  // The recorder sees the arguments AS PASSED, before the calculator's P3-S swap moves a surviving B into A's slot. So the benefit must
  // arrive in B's slot here. (t60's first draft asserted the post-swap layout and failed on correct code — the test was fixed, not the code.)
  if (FIXED) CK("A-4 survivor B with A's larger benefit: B's own slot carries the household benefit ($24,000), A's slot $0, A's age blank", s27.length > 0 && s27.every(c => c.ssGrossA === 0 && c.ssGrossB === 24000 && c.ageA === null),
     JSON.stringify(s27.map(c => [c.ssGrossA, c.ssGrossB])));
  else CK("A-4 PIN v5.95: the benefit sits in A's slot with A's age still present", s27.length > 0 && s27.every(c => c.ssGrossA > 0 && c.ageA === 77));
}

// ── B · hand cases ──
{
  for (const code of ["GA", "ME", "MI"]) {
    const relief = FIXED ? { GA: 65000, ME: 49824, MI: 65897 }[code] : { GA: 130000, ME: 99648, MI: 131794 }[code];
    const hand = R[code] * Math.max(0, 100000 - relief);
    const { rec } = record(P({ stateCode: code })), c = rec.filter(x => x.code === code && (FIXED ? x.ageB === 72 : x.ageA === 77));
    const got = c.length ? ST(c[0]) : NaN;
    CK(`B-${code} 2027, to the cent through the calculator with Engine A's own arguments: $${got.toFixed(2)} = ${R[code] * 100}% × ($100,000 − $${relief.toLocaleString()}) = $${hand.toFixed(2)}${FIXED ? "" : " (PIN v5.95: two people's relief)"}`,
       Math.abs(got - hand) < 0.005, `${got} vs ${hand}`);
    const tax = p => g.runRothStrategies(p).find(r => r.key === "none").totTax;
    const st27 = (tax(P({ stateCode: code })) - tax(P())) - (tax(P({ stateCode: code, horizonYr: 2026 })) - tax(P({ horizonYr: 2026 })));
    CK(`B-${code}w the whole engine, 2027's state tax: $${st27} = the hand figure to the dollar (Engine A rounds its totals)`, Math.abs(st27 - hand) <= 1, `${st27} vs ${hand}`);
  }
}

// ── C · v5.95 -> v5.96: nothing but Engine A's survivor-year state tax moves ──
if (VER === "v596") {
  if (!existsSync(new URL("./app_v595.mjs", HERE))) console.log("  – group C not run: app_v595.mjs is not in this run folder");
  else {
    const pm = await import("./app_v595.mjs");
    const BASE = JSON.parse(JSON.stringify(pm.__g.PORTFOLIO()));
    const H = { "example": {}, "H1 early widow": { dobA: "1955-01-01", dobB: "1966-01-01", lifeExpA: 72, lifeExpB: 95 } };
    const engines = (mm, ov, code) => { const G = mm.__g, EE = mm.__engines; G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), ...ov, stateCode: code } });
      const tl = G.PLAN_TIMELINE(), ry = tl.targetRetireYear, s = G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      const dA = tl.dobA.year + tl.lifeExpA, dB = tl.dobB.year + tl.lifeExpB;
      const Aout = G.runRothStrategies({ single: !!tl.single, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: Math.max(dA, dB), ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA,
        ladderEndB: tl.rothLadderEndB, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: Math.min(dA, dB), survivor: dA >= dB ? "A" : "B", ssA: G.getSSA(), ssB: G.getSSB(),
        ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month, pen: G.getPension(), penOwner: G.PORTFOLIO().incomeSources.pension.owner,
        stateRate: 0, stateCode: code, convTaxFunding: "taxable", taxableGainFrac: 0.3, acaPremium: 0, acaSize: 0, taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 0,
        ...G.retireStartBalances(ry), ordDrawByYr: s.ordDrawByYr });
      return { A: Aout, B: EE.computeTaxPlan({ retireYear: ry, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr }).rows,
        C: EE.computeIrmaaPlan({ retireYear: ry, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr }),
        D: G.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" }) }; };
    let bcd = 0, bcdBad = [], up = 0, down = 0, nonWidow = 0;
    for (const [lbl, ov] of Object.entries(H)) for (const code of ["GA", "ME", "MI", "MD", "NY", "RI", "CT", null]) {
      const a = engines(pm, ov, code), b = engines(m, ov, code);
      for (const k of ["B", "C", "D"]) { if (JSON.stringify(a[k]) === JSON.stringify(b[k])) bcd++; else bcdBad.push(`${lbl}/${code}/${k}`); }
      a.A.forEach((x, j) => { const y = b.A[j], d = y.totTax - x.totTax; if (d > 0.5) up++; if (d < -0.5) down++; if (Math.abs(d - (y.widowTax - x.widowTax)) > 1) nonWidow++; });
    }
    CK(`C-1 Engines B (Taxes), C (IRMAA) and D (Withdrawal) byte-identical to v5.95 (${bcd} of 48)`, bcdBad.length === 0, bcdBad.join(" · "));
    CK(`C-2 no Engine A strategy's lifetime tax falls; ${up} rise (≥ 40)`, down === 0 && up >= 40, `${down} fall, ${up} rise`);
    CK("C-3 every Engine A move is a survivor-year move (lifetime Δ = widow-year Δ to the dollar)", nonWidow === 0, `${nonWidow} runs`);
  }
}

// ── D · AST: both Engine A state calls file by effSingle ──
{
  const { createRequire } = await import("module"), require = createRequire(import.meta.url);
  const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const src = readFileSync(new URL(`../${VER}.jsx`, HERE), "utf8");
  const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const B = { ...walk.base, JSXElement(n, s, c) { n.children.forEach(x => c(x, s)); n.openingElement.attributes.forEach(a => a.value && c(a.value, s)); },
    JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); }, JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); },
    JSXText() {}, JSXAttribute() {}, JSXSpreadAttribute() {}, JSXEmptyExpression() {} };
  const fn = ast.body.find(s => s.type === "FunctionDeclaration" && s.id.name === "runRothStrategies");
  const singles = [];
  walk.full(fn, n => { if (n.type === "CallExpression" && n.callee.name === "stateTaxAnnual") {
    const p = n.arguments[0].properties.find(q => q.key && q.key.name === "single"); singles.push(src.slice(p.value.start, p.value.end)); } }, B);
  CK(`D-1 Engine A makes exactly two state calls (${singles.length})`, singles.length === 2);
  if (FIXED) CK(`D-2 EXTINCTION: both file by the engine's own filing status (${singles.join(" · ")})`, singles.length === 2 && singles.every(x => x === "!!effSingle"));
  else CK(`D-2 PIN v5.95: both file by the household flag (${singles.join(" · ")})`, singles.length === 2 && singles.every(x => x === "!!P.single"));
  // ── E · the Field Manual ──
  const LINE = "As of v5.96 the Roth comparator also files a surviving spouse's state return as single from the year after the death";
  let has = false; walk.full(ast, n => { if (n.type === "Literal" && typeof n.value === "string" && n.value.includes(LINE)) has = true; }, B);
  CK(`E-1 the Field Manual's state-layer paragraph ${FIXED ? "dates the fix" : "has no such line (v5.95)"}`, has === FIXED);
}
done();
