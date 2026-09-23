// t40_cross_tab_agreement.mjs — C-8 / E-21 / E-25 · the cross-tab agreement suite (added v5.74)
//
// WHAT THIS IS. E-25's first missing class: a test that drives two tabs' engines on the SAME household and
// asserts they describe the same retirement. Its absence is what let C-8 live — through v5.73 the Taxes and
// IRMAA tabs projected a household that never spent any pre-tax money, while the Withdrawal plan beside
// them drew $352,485 of it. Every engine suite was green because every engine suite tested ONE engine.
//
// USAGE:   node t40_cross_tab_agreement.mjs <VER> [moduleOverride]
//   VER governs the per-leg gating. `moduleOverride` exists for the NEGATIVE CONTROLS only
//   (qa/tools/controls_v574_c8.py): it loads a mutated build while gating as VER.
//
// ── PER LEG (OPERATIONS §B2) ─────────────────────────────────────────────────────────────────────────
// The v573 leg asserts the PRE-FIX figures as a dated [KNOWN DEFECT] — the before/after witness. Those are
// the correct assertions FOR THAT BUILD; they are not a lower bar.
//
// ── ⚠ DEPARTURE FROM SCOPE §8, ITEMS 1–2, FLAGGED FOR STEVE ──────────────────────────────────────────────
// §8 was written before D-3 was narrowed and before D-9 was raised. As written it asks for (1) ordinary
// income to agree "to the dollar" between Engines B and D, and (2) lifetime RMDs to agree "live". Under the
// RESOLVED decisions neither can hold for a correct build: D-3 deflates only B's draw term, and D-9 keeps
// B on BASE_GROWTH 4.500% against D's 3.518%. Measured: B's lifetime RMD is $1,321,030, D's is $1,021,349.
// A test written to §8's literal text would fail against the build D-9 requires.
// So, instead:
//   item 1 → the DRAW agrees exactly: what Engine B carries, restated in D's units, is Engine D's draw to
//            the cent, every year. That is the thing C-8 was about — the Taxes tab seeing the drawdown.
//   item 2 → a PINNED KNOWN DIVERGENCE carrying today's figures — the scope's own prescription, in §8 item
//            2's parenthetical, for engines that do not agree live: "so the gap stayed a checked fact."
// If D-9 is ever reversed, item 2 becomes live agreement and this block is where that change lands.
//
// ── HAND-VERIFIED (§A, "computed independently to the dollar") ───────────────────────────────────────
// Section A4's oracle takes brackets, deductions and the age-65 extra from IRS Rev. Proc. 2025-32 (the same
// typed constants as t18 — provenance there), applies §86 with its STATUTORY, UNINDEXED $32,000/$44,000
// thresholds, and takes the draw from ENGINE D, deflated by this file's own arithmetic. Nothing on the
// checking side reads Engine B's import. It agrees with Engine B to $0.00 in all seven gap years.
//
// ── HARNESS TRAPS MET BUILDING THIS (all cost a wrong figure first) ─────────────────────────────────────
//  · A "no-portfolio" fixture that strips `positions`, `contributions` and `otherAccounts` is NOT empty to
//    Engine D: its taxable sleeve is PORTFOLIO.household − PORTFOLIO.total401k (L5029), aggregate fields
//    the strip does not zero. It still realizes $4,414.03 of gains through the bridge. Section C pins that
//    residue so it stays a checked fact rather than a surprise.
//  · Engine B's lifetime federal differs by BASIS: $208,416 with no gains passed (the scope's §3.5 / probe
//    basis) and $208,445 with gains passed. Pre-fix both read $244,040 — the gains only reach Social
//    Security taxability once the draws lift gap-year income. Both are pinned below, each named.
//    ⚠ CORRECTED 2026-09-21: this note first called $208,445 "what the Taxes tab actually renders". It is
//    not — it holds every input at zero, the taxable yield included, and the tab opens with $70,000/yr of
//    conversions and a 2.0% yield. The views a user actually meets are pinned in section E, and E0 ties
//    them to the source's own useState defaults so that label cannot go stale silently again.

const VER = process.argv[2];
const MODPATH = process.argv[3] || `./app_${VER}.mjs`;
const KNOWN_VERSIONS = ["v573", "v574", "v575"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  console.log("    Add it to KNOWN_VERSIONS and decide which leg's figures it owes BEFORE running.");
  process.exit(1);
}
const POST = (VER === "v574" || VER === "v575");

const m = await import(MODPATH);
const g = m.__g, E = m.__engines;

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) pass++;
  else { fail++; console.log(`  \u2717 ${name}${detail !== "" ? " \u2014 " + detail : ""}`); }
};
const $ = v => "$" + Math.round(v).toLocaleString("en-US");
console.log(`t40 \u2014 CROSS-TAB AGREEMENT (${VER}${process.argv[3] ? " \u00b7 module " + MODPATH : ""})`);

// ── independent statute reference (Rev. Proc. 2025-32; t18's constants, typed here, NOT read from the app)
const STD_M = 32200, SR_M = 1650;
const BR_M = [[0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550], [0.32, 512450], [0.35, 768700], [0.37, Infinity]];
const IDX = yr => Math.pow(1.02, yr - 2026);
const fedRef = (taxable, yr) => {
  const i = IDX(yr); let t = 0, p = 0;
  for (const [r, u] of BR_M) { const c = u === Infinity ? Infinity : u * i; if (taxable <= p) break; t += (Math.min(taxable, c) - p) * r; p = c; }
  return t;
};
const dedRef = (yr, n65) => Math.round(STD_M * IDX(yr)) + n65 * Math.round(SR_M * IDX(yr));
const ss86 = (ss, other) => {           // MFJ, 26 U.S.C. §86 — thresholds are statutory and NOT indexed
  const prov = other + 0.5 * ss;
  if (prov <= 32000) return 0;
  if (prov <= 44000) return Math.min(0.5 * ss, 0.5 * (prov - 32000));
  return Math.min(0.85 * ss, 0.85 * (prov - 44000) + Math.min(0.5 * ss, 6000));
};

// ════ A · THE EXAMPLE HOUSEHOLD, EXACTLY AS SHIPPED ════════════════════════════════════════════════════
console.log("\n  A \u2014 the example household (joint, retire 2029, base scenario)");
const tl = g.PLAN_TIMELINE(), retire = tl.targetRetireYear;
T("SETUP: the example household retires in 2029", retire === 2029, retire);
const base = { retireYear: retire, rothAmount: 0, qcdAnnual: 0, taxYield: 0 };
const D = g.computeWithdrawalPlan({ retireYear: retire, rothAmount: 0, scenarioPreset: "base" }).schedule;
const infl = g.expectedInflation();
const inflator = yr => Math.pow(1 + infl, Math.max(0, yr - retire));
// Engine D's taxableSS is a flat 85% (L5360), so this residual of its own `magi` identity is EXACT where
// streamsOrd_y is 0 — which it is on this household. It is how the v573 leg sees a draw it never published.
const residual = d => Math.max(0, d.magi - (0.85 * (d.ssA_y + d.ssB_y) + d.pen_y + d.work_y + d.rmd_y + d.conv_y + d.capGain_y));
const lifeDraw = D.reduce((s, d) => s + residual(d), 0);
T("A1: Engine D draws $352,485 of ordinary income over the plan (scope §3.1)", Math.round(lifeDraw) === 352485, $(lifeDraw));
const lifeRmdD = D.reduce((s, d) => s + d.rmd_y, 0);

// The series each leg's Taxes tab actually hands to Engine B.
let series;
if (POST) {
  T("A1: the drawdown bridge `withdrawalPlanSeries` is exported and callable", typeof g.withdrawalPlanSeries === "function");
  series = g.withdrawalPlanSeries({ retireYear: retire, rothAmount: 0, scenarioPreset: "base" });
} else {
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: there is no drawdown bridge on this build", g.withdrawalPlanSeries === undefined);
  const gb = {}; for (const r of D) gb[r.yr] = r.capGain_y || 0;          // v5.73's call site walked gains only
  series = { gainByYr: gb, ordDrawByYr: {} };
}
const Bp = E.computeTaxPlan({ ...base, ordDrawByYr: series.ordDrawByYr });                          // probe basis
const Bc = E.computeTaxPlan({ ...base, gainByYr: series.gainByYr, ordDrawByYr: series.ordDrawByYr }); // call-site basis
const lifeRmdB = Bc.rows.reduce((s, r) => s + r.rmd_y, 0);
const common = Bc.rows.filter(r => D.some(d => d.yr === r.yr));
T("A2: Engines B and D share every plan year (25)", common.length === 25 && D.length === 25, `${common.length} common of ${D.length}`);

if (POST) {
  // A1 — the publish (step 1 of the build): the two magi terms, on the row, and their sum.
  let pubBad = [];
  for (const d of D) {
    if (typeof d.tradDraw !== "number" || typeof d.othOrdDraw !== "number" || typeof d.ordDraw_y !== "number") pubBad.push(d.yr + ":missing");
    else if (Math.abs(d.ordDraw_y - (d.tradDraw + d.othOrdDraw)) > 1e-9) pubBad.push(d.yr + ":sum");
    else if (Math.abs(d.ordDraw_y - residual(d)) > 0.005) pubBad.push(d.yr + `:residual ${d.ordDraw_y} vs ${residual(d)}`);
  }
  T("A1: Engine D publishes tradDraw, othOrdDraw and ordDraw_y on every row, and they ARE its magi terms", pubBad.length === 0, pubBad.slice(0, 4).join(", "));

  // A2 — DRAW AGREEMENT (restated §8 item 1; see header). Two links: the bridge restates D's draw exactly,
  // and Engine B carries exactly what the bridge produced. Either link broken breaks the Taxes tab.
  let w1 = 0, w1y = 0, w2 = 0, w2y = 0;
  for (const r of common) {
    const d = D.find(x => x.yr === r.yr);
    const e1 = Math.abs((series.ordDrawByYr[r.yr] || 0) * inflator(r.yr) - (d.tradDraw + d.othOrdDraw));
    const e2 = Math.abs((r.ordDraw_y || 0) - (series.ordDrawByYr[r.yr] || 0));
    if (e1 > w1) { w1 = e1; w1y = r.yr; }
    if (e2 > w2) { w2 = e2; w2y = r.yr; }
  }
  T("A2: the bridge's draw, restated in Engine D's units, IS Engine D's draw \u2014 to the cent, every year", w1 <= 0.01, `worst $${w1.toFixed(2)} (${w1y})`);
  T("A2: Engine B carries exactly the bridge's draw \u2014 to the cent, every year", w2 <= 0.01, `worst $${w2.toFixed(2)} (${w2y})`);
  T("A2: the draw reaches Engine B at all (lifetime, today's dollars, > $250K)",
    Bc.rows.reduce((s, r) => s + (r.ordDraw_y || 0), 0) > 250000, $(Bc.rows.reduce((s, r) => s + (r.ordDraw_y || 0), 0)));

  // A3 — PINNED KNOWN DIVERGENCE (restated §8 item 2; see header). The gap is D-9's growth choice.
  T("A3 [PINNED DIVERGENCE, D-9]: Engine B lifetime RMD is $1,321,030 \u2014 its OWN 4.5% path minus D's draws",
    Math.round(lifeRmdB) === 1321030, $(lifeRmdB));
  T("A3 [PINNED DIVERGENCE, D-9]: Engine D lifetime RMD is $1,021,349 \u2014 unmoved by this release",
    Math.round(lifeRmdD) === 1021349, $(lifeRmdD));

  // A4 — the seven gap years, hand-verified against the independent statute oracle.
  let worstO = 0, worstOy = 0, zeroYrs = [];
  for (let yr = 2032; yr <= 2038; yr++) {
    const r = Bp.rows.find(x => x.yr === yr), d = D.find(x => x.yr === yr);
    const n65 = (r.ageA >= 65 ? 1 : 0) + (r.ageB >= 65 ? 1 : 0);
    const other = r.pen_y + r.work_y + (d.tradDraw + d.othOrdDraw) / inflator(yr);
    const ref = fedRef(Math.max(0, other + ss86(r.ssA_y + r.ssB_y, other) - dedRef(yr, n65)), yr);
    if (!(r.fedTax > 0)) zeroYrs.push(yr);
    if (Math.abs(ref - r.fedTax) > worstO) { worstO = Math.abs(ref - r.fedTax); worstOy = yr; }
  }
  T("A4: the seven gap years 2032\u20132038 are no longer $0 federal tax", zeroYrs.length === 0, zeroYrs.join(","));
  T("A4 [HAND-VERIFIED]: each gap year's federal tax equals the independent Rev. Proc. 2025-32 / \u00a786 oracle to the cent",
    worstO <= 0.01, `worst $${worstO.toFixed(2)} (${worstOy})`);

  // A5 — the headline, on both bases, each named.
  T("A5: lifetime federal on the probe basis (no gains) is $208,416 \u2014 the scope's acceptance figure (\u2212$35,624)",
    Math.round(Bp.totFed) === 208416, $(Bp.totFed));
  T("A5: lifetime federal on the call-site basis, every input at zero (the yield too), is $208,445 (\u2212$35,595) \u2014 not a view the tab opens with; see E",
    Math.round(Bc.totFed) === 208445, $(Bc.totFed));
} else {
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: Engine D never published its draw terms",
    D.every(d => d.tradDraw === undefined && d.othOrdDraw === undefined && d.ordDraw_y === undefined));
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: Engine B carries no draw term on any row",
    Bc.rows.every(r => !r.ordDraw_y));
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: Engine B lifetime RMD $1,625,926 \u2014 a balance nothing was ever drawn from",
    Math.round(lifeRmdB) === 1625926, $(lifeRmdB));
  T("PRE-FIX: Engine D lifetime RMD $1,021,349", Math.round(lifeRmdD) === 1021349, $(lifeRmdD));
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: every gap year 2032\u20132038 reads $0 federal tax",
    [2032, 2033, 2034, 2035, 2036, 2037, 2038].every(yr => Bc.rows.find(r => r.yr === yr).fedTax === 0));
  T("PRE-FIX: lifetime federal $244,040 on the probe basis", Math.round(Bp.totFed) === 244040, $(Bp.totFed));
  T("PRE-FIX: lifetime federal $244,040 on the call-site basis too \u2014 gains alone never reach SS taxability here",
    Math.round(Bc.totFed) === 244040, $(Bc.totFed));
}

// ════ B · ENGINE C (IRMAA) CARRIES THE SAME DRAWS (D-6) ════════════════════════════════════════════════
console.log("\n  B \u2014 Engine C reads the same household as Engine B");
const Cc = E.computeIrmaaPlan({ ...base, gainByYr: series.gainByYr, ordDrawByYr: series.ordDrawByYr });
const lifeRmdC = Cc.rows.reduce((s, r) => s + r.rmd_y, 0);
if (POST) {
  const Cg = E.computeIrmaaPlan({ ...base, gainByYr: series.gainByYr });   // the same engine, draws withheld
  let wd = 0, wdy = 0, wr = 0, wry = 0, moved = 0;
  for (const rc of Cc.rows) {
    const rb = Bc.rows.find(x => x.yr === rc.yr); if (!rb) continue;
    const e1 = Math.abs((rc.ordDraw_y || 0) - (rb.ordDraw_y || 0)), e2 = Math.abs(rc.rmd_y - rb.rmd_y);
    if (e1 > wd) { wd = e1; wdy = rc.yr; }
    if (e2 > wr) { wr = e2; wry = rc.yr; }
  }
  for (let i = 0; i < Cc.rows.length; i++) if (Math.abs(Cc.rows[i].magi - Cg.rows[i].magi) > 0.5) moved++;
  T("B1: Engine C carries the same draw as Engine B \u2014 to the cent, every year", wd <= 0.01, `worst $${wd.toFixed(2)} (${wdy})`);
  T("B2: Engine C's RMD equals Engine B's \u2014 to the cent, every year (LIVE: same loop, same 4.5%)", wr <= 0.01, `worst $${wr.toFixed(2)} (${wry})`);
  T("B3: Engine C lifetime RMD $1,321,030", Math.round(lifeRmdC) === 1321030, $(lifeRmdC));
  // Non-vacuity. On this household no IRMAA tier is crossed either way, so the surcharge alone cannot
  // show the change; MAGI can, and does, in every year.
  T("B4: the draws move Engine C's MAGI in all 25 years (not vacuous \u2014 no tier is crossed here)",
    moved === 25, `${moved} of ${Cc.rows.length}`);
} else {
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: Engine C carries no draw term on any row", Cc.rows.every(r => !r.ordDraw_y));
  // Engine C did not PUBLISH its RMD before v5.74 — the field was added so B1–B3 could compare engines at
  // all. This leg therefore cannot read C's pre-fix RMD, and says so rather than asserting a figure it
  // cannot observe. (A first draft asserted $1,625,926 here — a number measured on the v5.74 module with
  // the draws withheld, not on this build. It summed an absent field to NaN, and failed, correctly.)
  T("PRE-FIX: Engine C does not publish rmd_y on this build (added v5.74 for B1–B3)",
    Cc.rows.every(r => r.rmd_y === undefined), Cc.rows.filter(r => r.rmd_y !== undefined).length + " rows publish it");
}

// ════ D · THE TAXES DETAIL PANEL ITEMIZES EVERY TERM OF "GROSS TAXABLE" ═══════════════════════════════════
// Found at the v5.74 build (2026-09-21): the list under "Gross taxable income by source" carried six of the
// nine terms of `grossTaxableAll`. Through v5.73 it omitted dividends/interest and other ordinary income; the
// first v5.74 candidate added the spending draw to the total and not to the list — the 2029 sources summed to
// $108K under a $152K total. Both halves are DERIVED, not hand-listed:
//   D1 (structural) — the panel's list is read by AST (every `val: sel.X` entry not marked `dim`), and
//      `grossTaxableAll` is expanded through Engine B's own pure sums until each branch reaches a listed field
//      or a term that is not listed. Any unlisted term fails, whatever its value on this household.
//   D2 (numeric) — on the two views of section E, the listed fields sum to grossTaxableAll to the cent.
// ⚠ Sections D and E run BEFORE C, because C replaces the loaded household.
console.log("\n  D \u2014 the Taxes detail panel itemizes every term of Gross taxable");
const _req = (await import("module")).createRequire(import.meta.url);
const acorn = _req("acorn"), acornJsx = _req("acorn-jsx");
const _tag = (MODPATH.match(/app_(\w+)\.mjs$/) || [])[1] || VER;       // a control's mutant, or the leg itself
const srcText = (await import("fs")).readFileSync(new URL(`../${_tag}.jsx`, import.meta.url), "utf-8");
const AST = acorn.Parser.extend(acornJsx()).parse(srcText, { ecmaVersion: "latest", sourceType: "module" });
const visit = (n, fn) => {                                    // generic walk: acorn-walk has no JSX visitors
  if (!n || typeof n.type !== "string") return; fn(n);
  for (const k in n) { const v = n[k];
    if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === "string") visit(c, fn); }
    else if (v && typeof v.type === "string" && k !== "loc") visit(v, fn); }
};
const prop = (o, name) => o.properties.find(p => p.type === "Property" && !p.computed && (p.key.name === name || p.key.value === name));
const panels = [];
visit(AST, n => { if (n.type === "ArrayExpression" && n.elements.some(e => e && e.type === "ObjectExpression" &&
  (p => p && p.value.type === "Literal" && p.value.value === "\u2192 SS taxable portion")(prop(e, "label")))) panels.push(n); });
T("D1 SETUP: exactly one list carries the '\u2192 SS taxable portion' line (the detail panel)", panels.length === 1, `${panels.length} found`);
const listed = new Set();
for (const e of (panels[0] || { elements: [] }).elements) {
  if (!e || e.type !== "ObjectExpression") continue;
  const v = prop(e, "val"), d = prop(e, "dim");
  if (!v || (d && d.value.type === "Literal" && d.value.value === true)) continue;   // dim = reference only
  if (v.value.type === "MemberExpression" && v.value.object.name === "sel" && !v.value.computed) listed.add(v.value.property.name);
}
let fnB = null; visit(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === "computeTaxPlan") fnB = n; });
const inits = {}; if (fnB) visit(fnB, n => { if (n.type === "VariableDeclarator" && n.id.type === "Identifier") (inits[n.id.name] ||= []).push(n.init); });
const leavesOf = e => e && e.type === "BinaryExpression" && e.operator === "+" ? [...leavesOf(e.left), ...leavesOf(e.right)] : [e];
const reached = new Set(), unlisted = new Set();
const expand = name => {
  if (listed.has(name)) { reached.add(name); return; }
  const one = (inits[name] || []).length === 1 ? inits[name][0] : null;
  const parts = one && one.type === "BinaryExpression" && one.operator === "+" ? leavesOf(one) : null;
  if (parts && parts.every(x => x.type === "Identifier")) parts.forEach(x => expand(x.name)); else unlisted.add(name);
};
expand("grossTaxableAll");
T("D1 SETUP: grossTaxableAll expands to at least eight terms (the walk found the engine)", reached.size + unlisted.size >= 8,
  `${reached.size} listed + ${unlisted.size} unlisted`);
const rowSum = r => [...listed].reduce((a, k) => a + (r[k] || 0), 0);
const seriesOf = roth => {                                   // each leg's OWN call path, as in section A
  if (POST) return g.withdrawalPlanSeries({ retireYear: retire, rothAmount: roth, scenarioPreset: "base" });
  const gb = {}; for (const r of g.computeWithdrawalPlan({ retireYear: retire, rothAmount: roth, scenarioPreset: "base" }).schedule) gb[r.yr] = r.capGain_y || 0;
  return { gainByYr: gb, ordDrawByYr: {} };
};
const sOpen = seriesOf(70000);
const viewAsIs = { retireYear: retire, rothAmount: 0, qcdAnnual: 0, taxYield: 2.0, gainByYr: series.gainByYr, ordDrawByYr: series.ordDrawByYr };
const viewOpen = { retireYear: retire, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0, gainByYr: sOpen.gainByYr, ordDrawByYr: sOpen.ordDrawByYr };
const Tc = E.computeTaxPlan(viewAsIs), Td = E.computeTaxPlan(viewOpen);
if (POST) {
  T("D1: the panel lists EVERY term of Gross taxable \u2014 no term of the total is left unitemized",
    unlisted.size === 0, [...unlisted].join(", "));
  T("D1: every line the panel sums is a term of Gross taxable (nothing listed that the total does not contain)",
    [...listed].every(k => reached.has(k)), [...listed].filter(k => !reached.has(k)).join(", "));
  let worst = 0, wy = "";
  for (const [lbl, T_] of [["as-is", Tc], ["first open", Td]]) for (const r of T_.rows) {
    const e = Math.abs(rowSum(r) - r.grossTaxableAll); if (e > worst) { worst = e; wy = `${lbl} ${r.yr}`; } }
  T("D2: the listed sources add up to Gross taxable to the cent \u2014 every year, both views", worst <= 0.005, `worst $${worst.toFixed(2)} (${wy})`);
} else {
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: the panel leaves exactly dividends/interest and other ordinary income unlisted",
    [...unlisted].sort().join(",") === "div_y,otherOrd_y", [...unlisted].sort().join(","));
  T("PRE-FIX [KNOWN DEFECT, fixed v5.74]: its sources fall short of Gross taxable by exactly the $420/yr of dividends, every year",
    Td.rows.every(r => Math.abs(r.grossTaxableAll - rowSum(r) - r.div_y) <= 0.005 && r.div_y === 420),
    Td.rows.filter(r => !(Math.abs(r.grossTaxableAll - rowSum(r) - r.div_y) <= 0.005 && r.div_y === 420)).map(r => r.yr).join(","));
}

// ════ E · THE HEADLINE ON THE INPUTS A USER ACTUALLY MEETS (decided 2026-09-21) ══════════════════════════
// The release headlines the tab's own as-is reading — no conversions, no QCD, the yield at its 2% default —
// which is the reading the Field Manual's "about 15%" describes, and states the first-open view beside it.
// E0 ties "first open" to the SOURCE's useState defaults, so a changed default fails here instead of leaving a
// pinned view that no user sees (the mislabel this section exists to correct).
console.log("\n  E \u2014 the headline on the inputs a user actually meets");
const dflt = {};
visit(AST, n => { if (n.type === "VariableDeclarator" && n.id.type === "ArrayPattern" && n.id.elements[0] && n.init &&
  n.init.type === "CallExpression" && n.init.callee.name === "useState" && ["rothAmount", "taxYield", "qcdAnnual"].includes(n.id.elements[0].name)) {
  const a = n.init.arguments[0]; (dflt[n.id.elements[0].name] ||= []).push(a && a.type === "Literal" ? a.value : null); } });
T("E0: 'first open' IS the source's defaults \u2014 rothAmount 70000, taxYield 2.0, qcdAnnual 0, each declared once",
  JSON.stringify(dflt.rothAmount) === "[70000]" && JSON.stringify(dflt.taxYield) === "[2]" && JSON.stringify(dflt.qcdAnnual) === "[0]", JSON.stringify(dflt));
const Ic = E.computeIrmaaPlan(viewAsIs), Id = E.computeIrmaaPlan(viewOpen);
const gapC = Tc.rows.filter(r => r.yr >= 2032 && r.yr <= 2038).reduce((a, r) => a + r.fedTax, 0);
const pkC = Math.max(...Ic.rows.map(r => r.magi)), pkD = Math.max(...Id.rows.map(r => r.magi));
const W = POST ? { c: 208730, d: 211591, gap: 9575, pkC: 149657, pkD: 161948 } : { c: 244040, d: 210051, gap: 0, pkC: 175224, pkD: 165803 };
T(`E1${POST ? "" : " PRE-FIX"}: lifetime federal on the tab's as-is reading (no conversions, no QCD, 2% yield) is ${$(W.c)}${POST ? " \u2014 the headline, \u2212$35,309 (\u221214.5%)" : ""}`,
  Math.round(Tc.totFed) === W.c, $(Tc.totFed));
T(`E2${POST ? "" : " PRE-FIX"}: lifetime federal as the tab first opens ($70,000/yr conversions, 2% yield) is ${$(W.d)}${POST ? " \u2014 +$1,540: the correction RAISES it here" : ""}`,
  Math.round(Td.totFed) === W.d, $(Td.totFed));
T(`E3${POST ? "" : " PRE-FIX"}: federal tax in the seven gap years 2032\u20132038 on the as-is reading is ${$(W.gap)}`, Math.round(gapC) === W.gap, $(gapC));
T(`E4${POST ? "" : " PRE-FIX"}: IRMAA peak MAGI ${$(W.pkC)} as-is and ${$(W.pkD)} at first open; no surcharge on either view`,
  Math.round(pkC) === W.pkC && Math.round(pkD) === W.pkD && Ic.totalIrmaa === 0 && Id.totalIrmaa === 0,
  `${$(pkC)} / ${$(pkD)} / surcharge ${Ic.totalIrmaa} + ${Id.totalIrmaa}`);

// ════ C · A NO-PORTFOLIO HOUSEHOLD: THE BRIDGE CONTRIBUTES $0 ══════════════════════════════════════════
// Why t17/t18 are LEGITIMATELY unmoved: they drive Engine B with no draw series. On a household with no
// pre-tax money, the app's real call site produces a zero series too, so the app's figure IS theirs.
console.log("\n  C \u2014 a no-portfolio household");
{
  const P = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  P.positions = []; P.contributions = {}; P.otherAccounts = [];   // contributions too: the contribAccrual trap
  g.applyLoadedData({ portfolio: P });
  const tl2 = g.PLAN_TIMELINE(), r2 = tl2.targetRetireYear;
  const b2 = { retireYear: r2, rothAmount: 0, qcdAnnual: 0, taxYield: 0 };
  const D2 = g.computeWithdrawalPlan({ retireYear: r2, rothAmount: 0, scenarioPreset: "base" }).schedule;
  T("C0 FIXTURE: Engine D draws $0 of ordinary income in every year (else this is not the case it claims)",
    D2.every(d => residual(d) < 0.005), $(D2.reduce((s, d) => s + residual(d), 0)));
  let s2;
  if (POST) s2 = g.withdrawalPlanSeries({ retireYear: r2, rothAmount: 0, scenarioPreset: "base" });
  else { const gb = {}; for (const r of D2) gb[r.yr] = r.capGain_y || 0; s2 = { gainByYr: gb, ordDrawByYr: {} }; }
  const gainSum = Object.values(s2.gainByYr).reduce((a, b) => a + b, 0);
  T("C0 FIXTURE [KNOWN RESIDUE]: stripping positions does NOT empty Engine D's taxable sleeve \u2014 $4,414.03 of gains remain",
    Math.abs(gainSum - 4414.03) < 0.005, gainSum.toFixed(2));
  const B2 = E.computeTaxPlan({ ...b2, gainByYr: s2.gainByYr, ordDrawByYr: s2.ordDrawByYr });
  const chk = B2.rows.reduce((s, r) => s + Object.entries(r).filter(([k, v]) => typeof v === "number" && k !== "ordDraw_y").reduce((a, [, v]) => a + v, 0), 0);
  // The SAME three pins on both legs: that is the "byte-identical to the pre-fix build" claim, made without
  // importing the prior build by name (a hardcoded prior tag is how the six probes went stale).
  T("C1: lifetime federal $0.00 \u2014 identical on the v5.73 and v5.74 legs", Math.abs(B2.totFed) < 0.005, B2.totFed.toFixed(2));
  T("C1: lifetime total tax $4,054.50 \u2014 identical on both legs", Math.abs(B2.totAll - 4054.50) < 0.005, B2.totAll.toFixed(2));
  T("C1: every numeric field of every row sums to 5,198,499.9987 \u2014 identical on both legs",
    Math.abs(chk - 5198499.9987) < 0.001, chk.toFixed(4));
  if (POST) {
    const Bg = E.computeTaxPlan({ ...b2, gainByYr: s2.gainByYr });   // v5.73's input: gains only
    let diffs = 0;
    for (let i = 0; i < Bg.rows.length; i++) for (const k of Object.keys(Bg.rows[i])) {
      const x = Bg.rows[i][k], y = B2.rows[i][k];
      if (typeof x === "number" && !(Math.abs(x - y) <= 1e-9)) diffs++;
    }
    T("C2: within this build, adding the draw series changes NO field of any row", diffs === 0, `${diffs} fields differ`);
  }
}

console.log(`\nt40 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
