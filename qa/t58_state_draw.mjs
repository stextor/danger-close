// t58 — THE SPENDING DRAW REACHES THE STATE CALCULATOR (D-26) · docs/SCOPE_D26_STATE_TAX_DRAW.md · v5.94
//
// THROUGH v5.93 both engines that compute state tax counted Traditional dollars spent on living costs as ordinary income for
// FEDERAL tax and passed none of them to `stateTaxAnnual`: Engine B (computeTaxPlan) since the v5.74 draw bridge, Engine A
// (runRothStrategies) since v5.84's. Its `retIncome` was `rmd + conv`; from v5.94 it is `rmd + conv + draw` at all three call sites.
// OPTIMISTIC while it stood: on the example household in North Carolina, $313,303 of lifetime draw went untaxed by the state.
//
// Groups:  0 the rates the hand figures assume (asserted first, then hardcoded — never read back as the expectation)
//          A Engine A extinction grid: $X drawn costs exactly what $X of pension costs, every jurisdiction, single and joint
//          B Engine B to the dollar: the example household, every non-widowed year, NC / CA / GA / NY
//          C v5.93 -> v5.94 only: nothing but state tax moves (federal, Engines C and D byte-identical; no figure falls)
//          D AST extinction: every state call in both engines names the draw in `retIncome`
//          E the Field Manual's dated line
// BOTH LEGS. The v593 leg PINS the defect (A, B, D, E assert the pre-fix state); group C runs on the v594 leg only, because it
// asserts what THIS release changed relative to its prior. Run: node t58_state_draw.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v593", "v594", "v595", "v596"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d !== "" ? " \u2014 " + String(d).slice(0, 260) : ""}`); } };
const done = () => { console.log(`\nt58 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t58 \u2014 D-26: THE SPENDING DRAW REACHES THE STATE CALCULATOR (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
const FIXED = VER !== "v593";
// v5.95 (D-12 Phase 3): from v5.95 Rhode Island taxes an IRA draw but shelters a pension (\u00a744-30-12(c)(9)); the grid household's draw is
// the default IRA. Hand: its $42,000 pension leaves $8,000 of RI's $50,000 cap, so $10,000 more pension adds $2,000 taxable and $10,000
// of IRA draw adds $10,000 \u2014 the draw costs 5 % \u00d7 $8,000 = $400 more. Every other jurisdiction is unchanged.
const RI_SPLIT = FIXED && VER !== "v594";
console.error = () => {}; console.warn = () => {};
const m = await import(`./app_${VER}.mjs`);
const g = m.__g, E = m.__engines, SR = g.STATE_RULES();
const P0 = JSON.parse(JSON.stringify(g.PORTFOLIO()));

// ── 0 · the rates the hand figures assume ──────────────────────────────────────────────────────────────────────────────────
const RATE = { NC: 0.0399, CA: 0.06, GA: 0.0519, NY: 0.06 }, EXCL = { NC: 0, CA: 0, GA: 65000, NY: 20000 };
CK("0-1 NC 3.99 % / CA 6 % / GA 5.19 % / NY 6 %; exclusions 0 / 0 / $65,000 / $20,000 per person; no SS, exemption, test or age field",
   Object.keys(RATE).every(c => SR[c].rate === RATE[c] && (SR[c].excl65 || 0) === EXCL[c] && !SR[c].ss && !SR[c].retExempt &&
     !SR[c].exclTest && SR[c].exclAge == null && !SR[c].ssRule && !SR[c].ssOffset), Object.keys(RATE).map(c => JSON.stringify(SR[c])).join(" "));

// ── A · Engine A: a draw is taxed by the state exactly as a pension is ─────────────────────────────────────────────────────
// Age 70 clears every jurisdiction's age floor and exemption gate, so in this model a pension and a Traditional distribution
// take identical state treatment; any gap between the two is the D-26 omission. (t49/t10's builder; t10's income neutraliser.)
{
  const P = (o = {}) => ({ single: true, asOfYr: 2026, retireYr: 2026, horizonYr: 2026, ladderEnd: 2026, ladderEndA: 2026, ladderEndB: 2026,
    dobAYr: 1956, dobBYr: 1956, deathYr1: Infinity, survivor: "A", ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 1, ssBYr: 2040, ssBMo: 1,
    pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "withhold", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0,
    tradInit: 0, rothInit: 0, tradInitA: 0, tradInitB: 0, rothInitA: 0, rothInitB: 0, taxableInit: 0, ...o });
  g.setPortfolio({ positions: [], stateCode: null, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });
  const tax = p => g.runRothStrategies(p).find(r => r.key === "none").totTax;
  const X = 10000, PEN = 42000 / 12;
  const cases = [[null, 0.05], ...Object.keys(SR).map(c => [c, 0])];
  let n = 0, taxing = 0, eq = 0, drawLess = 0, other = [], riCases = [];
  for (const single of [true, false]) {
   // the federal-only cost of $X of pension for this filing status (no state): the baseline "taxing" is measured against
   const fed0 = (() => { const mk = o => P({ single, pen: PEN, ...o }); return tax(mk({ pen: PEN + X / 12 })) - tax(mk()); })();
   for (const [code, rate] of cases) {
    const mk = o => P({ single, pen: PEN, stateCode: code, stateRate: rate, ...o });
    const b = tax(mk()), dDraw = tax(mk({ ordDrawByYr: { 2026: X } })) - b, dPen = tax(mk({ pen: PEN + X / 12 })) - b;
    if (RI_SPLIT && code === "RI") { riCases.push(dDraw - dPen); continue; }
    n++; if (dPen > dDraw + 0.5) drawLess++; else if (Math.abs(dDraw - dPen) <= 0.5) eq++; else other.push(`${code}/${single ? "S" : "J"} ${dDraw} vs ${dPen}`);
    if (dPen > fed0 + 0.5) taxing++; // the state taxes the pension
  } }
  if (RI_SPLIT) CK(`A-RI (v5.95): Rhode Island, single and joint \u2014 the IRA draw costs exactly $400 more than the pension (${riCases.map(x => x.toFixed(2)).join(", ")})`, riCases.length === 2 && riCases.every(x => Math.abs(x - 400) < 0.5), riCases.join(","));
  CK(`A-0 not vacuous: ${n} cases (≥ 100), the state taxes the pension in ${taxing} (≥ 60)`, n >= 100 && taxing >= 60, `${n} / ${taxing}`);
  CK("A-1 the draw is never taxed MORE than the pension (no case outside the two expected shapes)", other.length === 0, other.slice(0, 3).join(" · "));
  if (FIXED) CK(`A-2 every case: $10,000 drawn costs exactly what $10,000 of pension costs (${eq} of ${n})`, eq === n && drawLess === 0, `${drawLess} draws taxed less`);
  else CK(`A-2 PIN v5.93: the draw escapes state tax wherever the pension is taxed (${drawLess} cases = ${taxing})`, drawLess === taxing && drawLess > 0, `${drawLess} vs ${taxing}`);
}

// ── B · Engine B to the dollar, the example household ──────────────────────────────────────────────────────────────────────
// hand(row) = rate × ( max(0, R + pen − excl × persons ≥ 65) + work + otherOrd + capGains + div ),  R = rmdTax + conv (+ draw from v5.94).
// Non-widowed years only (a survivor's slot is the engine's business, not this formula's). Every input is a row field.
// B-2 differences a run WITH the plan's draws against one WITHOUT. Removing the draws leaves larger balances, so later RMDs differ
// between the runs (the effect that hid D-26 in lifetime totals) — the draw's own effect is asserted only in ISOLATED years, where
// every other state input agrees between the two runs. (A first version differenced every draw year and failed on 2039; t58's own
// build record, scope §7.)
{
  let years = 0, drawYears = 0, badAbs = [], badD = [];
  const SAME = ["rmdTax_y", "conv_y", "pen_y", "work_y", "otherOrd_y", "capGains_y", "div_y", "ageA", "ageB", "filingSingle", "widowed"];
  for (const code of Object.keys(RATE)) {
    g.setPortfolio({ ...JSON.parse(JSON.stringify(P0)), stateCode: code });
    const ry = g.PLAN_TIMELINE().targetRetireYear, s = g.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
    const v = { retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr };
    const W = E.computeTaxPlan({ ...v, ordDrawByYr: s.ordDrawByYr }).rows, N = E.computeTaxPlan({ ...v, ordDrawByYr: {} }).rows;
    const hand = (r, withDraw) => {
      const n65 = (r.ageA >= 65 ? 1 : 0) + (!r.filingSingle && r.ageB >= 65 ? 1 : 0);
      const R = r.rmdTax_y + r.conv_y + (withDraw ? r.ordDraw_y : 0);
      return RATE[code] * (Math.max(0, R + r.pen_y - EXCL[code] * n65) + r.work_y + r.otherOrd_y + r.capGains_y + r.div_y);
    };
    W.forEach((r, i) => {
      if (r.widowed) return;
      years++;
      if (Math.abs(r.stateTax - hand(r, FIXED)) > 0.01) badAbs.push(`${code} ${r.yr}: engine ${r.stateTax.toFixed(2)} hand ${hand(r, FIXED).toFixed(2)}`);
      if (Math.abs(N[i].stateTax - hand(N[i], FIXED)) > 0.01) badAbs.push(`${code} ${r.yr} (no draw): engine ${N[i].stateTax.toFixed(2)}`);
      if (r.ordDraw_y > 0 && SAME.every(f => r[f] === N[i][f])) {
        drawYears++;
        const want = FIXED ? hand(r, true) - hand(N[i], true) : 0, got = r.stateTax - N[i].stateTax;
        if (Math.abs(got - want) > 0.01) badD.push(`${code} ${r.yr}: Δ ${got.toFixed(2)} want ${want.toFixed(2)}`);
      }
    });
    if (code === "NC") {
      const iso = W.map((r, i) => i).filter(i => W[i].ordDraw_y > 0 && SAME.every(f => W[i][f] === N[i][f]));
      const all = W.reduce((t, r) => t + (r.ordDraw_y || 0), 0), draw = iso.reduce((t, i) => t + W[i].ordDraw_y, 0), dS = iso.reduce((t, i) => t + W[i].stateTax - N[i].stateTax, 0);
      CK(`B-NC: lifetime draw $${Math.round(all).toLocaleString()} (= $313,303); ${iso.length} isolated years carry $${Math.round(draw).toLocaleString()} of it (≥ 99 %), state Δ $${Math.round(dS).toLocaleString()} ${FIXED ? "= 3.99 % of it" : "= $0 (PIN v5.93)"}`,
         Math.round(all) === 313303 && draw >= 0.99 * all && Math.abs(dS - (FIXED ? 0.0399 * draw : 0)) < 0.05, `${all} / ${draw} / ${dS}`);
    }
  }
  CK(`B-0 not vacuous: ${years} non-widowed year-rows (≥ 48), ${drawYears} isolated draw years (≥ 32)`, years >= 48 && drawYears >= 32, `${years}/${drawYears}`);
  CK(`B-1 every year, four states, with and without the draws: Engine B's state tax equals the hand formula ${FIXED ? "WITH" : "WITHOUT (PIN v5.93)"} the draw`, badAbs.length === 0, `${badAbs.length} off: ${badAbs.slice(0, 3).join(" · ")}`);
  CK(`B-2 every draw year: the draw's own state effect, isolated years, is ${FIXED ? "the hand marginal (GA's exclusion absorbs, NY's partly)" : "$0 (PIN v5.93)"}`, badD.length === 0, `${badD.length} off: ${badD.slice(0, 3).join(" · ")}`);
}

// ── C · v5.93 -> v5.94: nothing but state tax moves (this release's own comparison) ───────────────────────────────────────
const _HAVE593 = (await import("fs")).existsSync(new URL("./app_v593.mjs", import.meta.url));
if (VER === "v594" && !_HAVE593) console.log("  \u2013 group C not run: app_v593.mjs is not in this run folder (it runs in a v593 -> v594 folder; v5.94's release ran it, 5 checks)");
if (VER === "v594" && _HAVE593) {
  const pm = await import("./app_v593.mjs");
  const homes = [];
  for (const st of [null, "NC", "VA", "GA", "PA", "MN", "NJ", "RI"]) homes.push([`example/${st}`, p => { p.stateCode = st; }]);
  homes.push(["single/NC", p => { p.stateCode = "NC"; p.single = true; }]);
  homes.push(["employer+penB/WV", p => { p.stateCode = "WV"; p.incomeSources.pension.owner = "B"; p.incomeSources.pension.amount = 2500;
    p.positions.forEach((x, i) => { if (i % 2 === 0 && x.trad > 0) x.planType = "employer"; }); }]);
  const run = (mm, mut) => {
    const G = mm.__g, EE = mm.__engines, P = JSON.parse(JSON.stringify(P0)); mut(P); G.setPortfolio(P);
    const ry = G.PLAN_TIMELINE().targetRetireYear, s = G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" }), o = {};
    o.D = G.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
    o.C = EE.computeIrmaaPlan({ retireYear: ry, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr });
    for (const ra of [0, 70000]) o[`B${ra}`] = EE.computeTaxPlan({ retireYear: ry, rothAmount: ra, qcdAnnual: 0, taxYield: 2.0, gainByYr: s.gainByYr, ordDrawByYr: s.ordDrawByYr }).rows;
    return o;
  };
  const MOVE = new Set(["stateTax", "totalTax", "effRate"]);
  let cdSame = 0, cdDiff = [], otherField = [], nonState = 0, falls = 0, rises = 0;
  for (const [name, mut] of homes) {
    const a = run(pm, mut), b = run(m, mut);
    for (const k of ["C", "D"]) { if (JSON.stringify(a[k]) === JSON.stringify(b[k])) cdSame++; else cdDiff.push(`${name} ${k}`); }
    for (const k of ["B0", "B70000"]) a[k].forEach((r, i) => { const q = b[k][i];
      for (const f of Object.keys(r)) if (!MOVE.has(f) && JSON.stringify(r[f]) !== JSON.stringify(q[f])) otherField.push(`${name} ${k} ${r.yr} ${f}`);
      if (Math.abs((q.totalTax - q.stateTax) - (r.totalTax - r.stateTax)) > 1e-6) nonState++;
      if (q.stateTax < r.stateTax - 1e-9) falls++; if (q.stateTax > r.stateTax + 1e-9) rises++; });
  }
  CK(`C-1 Engines C (IRMAA) and D (Withdrawal) byte-identical to v5.93 (${cdSame} of ${homes.length * 2})`, cdDiff.length === 0, cdDiff.join(" · "));
  CK("C-2 Engine B: no row field moves except stateTax, totalTax, effRate — federal tax included", otherField.length === 0, otherField.slice(0, 4).join(" · "));
  CK("C-3 Engine B: totalTax moves by exactly the state tax's move", nonState === 0, `${nonState} rows`);
  CK(`C-4 Engine B: no year's state tax falls; ${rises} rise (≥ 100)`, falls === 0 && rises >= 100, `${falls} fall, ${rises} rise`);
  // Engine A feeds tax back into balances, so only its lifetime figure is compared (scope §5).
  let up = 0, down = 0;
  { const pa = (mm, code) => { const G = mm.__g, P = JSON.parse(JSON.stringify(P0)); P.stateCode = code; G.setPortfolio(P);
      const tl = G.PLAN_TIMELINE(), ry = tl.targetRetireYear, s = G.withdrawalPlanSeries({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      return G.runRothStrategies({ single: !!tl.single, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
        ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
        deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB), survivor: (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B",
        ssA: G.getSSA(), ssB: G.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
        pen: G.getPension(), penOwner: P.incomeSources.pension.owner, stateRate: 0, stateCode: code, convTaxFunding: "taxable", taxableGainFrac: 0.3,
        acaPremium: 0, acaSize: 0, taxableInit: G.taxableInitAll(), taxYieldPct: 2.0, currentConv: 0, ...G.retireStartBalances(ry), ordDrawByYr: s.ordDrawByYr }); };
    for (const code of ["NC", "VA", "CA", "MN"]) { const a = pa(pm, code), b = pa(m, code);
      a.forEach((x, j) => { if (b[j].totTax > x.totTax + 0.5) up++; else if (b[j].totTax < x.totTax - 0.5) down++; }); } }
  CK(`C-5 Engine A (example, NC/VA/CA/MN): lifetime tax rises in ${up} strategy runs (≥ 8), falls in ${down}`, up >= 8 && down === 0, `${up}/${down}`);
}

// ── D · AST extinction: every state call in both engines names the draw ───────────────────────────────────────────────────
{
  const { readFileSync } = await import("fs"), { createRequire } = await import("module"), require = createRequire(import.meta.url);
  const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
  const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true });
  const B = { ...walk.base, JSXElement(n, s, c) { n.children.forEach(x => c(x, s)); n.openingElement.attributes.forEach(a => a.value && c(a.value, s)); },
    JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); }, JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); },
    JSXText() {}, JSXAttribute() {}, JSXSpreadAttribute() {}, JSXEmptyExpression() {} };
  const fns = {}; for (const st of ast.body) if (st.type === "FunctionDeclaration") fns[st.id.name] = st;
  let calls = 0, named = 0, where = [];
  for (const fn of ["runRothStrategies", "computeTaxPlan"]) walk.full(fns[fn], n => {
    if (n.type !== "CallExpression" || n.callee.name !== "stateTaxAnnual") return;
    calls++; const p = n.arguments[0].properties.find(q => q.key && q.key.name === "retIncome"); const ids = [];
    if (p) walk.full(p.value, x => { if (x.type === "Identifier") ids.push(x.name); }, B);
    if (ids.some(x => /draw/i.test(x))) named++; else where.push(`${fn} L${n.loc.start.line} retIncome: ${ids.join(" + ")}`);
  }, B);
  let total = 0; walk.full(ast, n => { if (n.type === "CallExpression" && n.callee.name === "stateTaxAnnual") total++; }, B);
  CK(`D-0 the census: ${calls} state calls in the two engines, ${total} in the whole file (3 and 3)`, calls === 3 && total === 3, `${calls}/${total}`);
  if (FIXED) CK("D-1 EXTINCTION: every state call's retIncome names the draw", named === calls, where.join(" · "));
  else CK("D-1 PIN v5.93: no state call's retIncome names the draw", named === 0, `${named} name it`);
  // ── E · the Field Manual's dated line (a Literal in DOCS_HTML, found by AST) ──
  const LINE = "As of v5.94 the Traditional dollars the plan draws for spending are counted by the state layer as retirement income";
  let has = false; walk.full(ast, n => { if (n.type === "Literal" && typeof n.value === "string" && n.value.includes(LINE)) has = true; }, B);
  CK(`E-1 the Field Manual's state-layer paragraph ${FIXED ? "dates the fix" : "has no such line (v5.93)"}`, has === FIXED);
}
done();
