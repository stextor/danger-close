// t59 — PER-PERSON, PER-PLAN-TYPE STATE RULES AND THE SURVIVOR SLOT (D-12 Phase 3) · docs/SCOPE_D12_PLAN_TYPE_PER_PERSON.md §10 · v5.95
//
// From v5.95 the state calculator reads `byPerson` (attributeRetIncome's split) in three rules — RI's banded test and WV's 65+ cap per person
// at each person's OWN qualifying income, and IA/PA/MS's exemption per person at each person's own age (PA/MS employer plans at any age) —
// and, after a death, reads the SURVIVOR's slot: Engine B used to pass the decedent's age when spouse B survived.
// Groups: A seven hand cases straight through the calculator · B the survivor slot through Engine B, to the dollar · C without `byPerson`
// every jurisdiction prices exactly as v5.94 (v595 leg, needs app_v594.mjs) · D AST/data guards · E the copy.
// BOTH LEGS; the v594 leg PINS the pre-Phase-3 figures. Run: node t59_per_person_state.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v594", "v595", "v596", "v597", "v598", "v599", "v600"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d !== "" ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt59 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t59 \u2014 D-12 PHASE 3: PER-PERSON STATE RULES AND THE SURVIVOR SLOT (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const P3 = VER !== "v594";
console.error = () => {}; console.warn = () => {};
const m = await import(`./app_${VER}.mjs`), g = m.__g, E = m.__engines, ST = E.stateTaxAnnual || g.stateTaxAnnual, SR = g.STATE_RULES();
// v5.97 (D-22): Georgia is 4.99 % from TY2026 (HB 463); earlier legs keep 5.19 %.
const GA_R = (["v597", "v598", "v599", "v600"].includes(VER) ? 0.0499 : 0.0519);
const z = { ira: 0, employer: 0, annuity: 0, pension: 0 }, zd = { ira: 0, employer: 0, annuity: 0 };
const bp = (a, b) => ({ A: { ...z, ...a }, B: { ...z, ...b }, draw: { A: { ...zd }, B: { ...zd } } });
// ── 0 · the rates and fields the hand figures assume (asserted, then hardcoded) ──
CK("0-1 rates RI 5 % · IA 3.8 % · PA 3.07 % · MS 4 % · WV 4.82 % · GA " + (GA_R * 100).toFixed(2) + " %; RI $50,000 at 67; WV $8,000; IA 55, PA/MS 60",
   SR.RI.rate === 0.05 && SR.IA.rate === 0.038 && SR.PA.rate === 0.0307 && SR.MS.rate === 0.04 && SR.WV.rate === 0.0482 && SR.GA.rate === GA_R &&
   SR.RI.excl65 === 50000 && SR.RI.exclAge === 67 && SR.WV.excl65 === 8000 && SR.IA.retExemptAge === 55 && SR.PA.retExemptAge === 60 && SR.MS.retExemptAge === 60);
// ── A · the seven hand cases [args, hand v5.95, hand v5.94] ──
const A = [
 ["A-1 RI 70/70, A IRA $30k, B 401(k) $10k: only B's 401(k) qualifies", { code: "RI", retIncome: 40000, ageA: 70, ageB: 70, byPerson: bp({ ira: 30000 }, { employer: 10000 }) }, 0.05 * 30000, 0],
 ["A-2 IA 60/50, A IRA $20k, B 401(k) $15k: A's exempt, B under 55", { code: "IA", retIncome: 35000, ageA: 60, ageB: 50, byPerson: bp({ ira: 20000 }, { employer: 15000 }) }, 0.038 * 15000, 0.038 * 35000],
 ["A-3 PA 58/62, A 401(k) $20k + pension $12k, B IRA $10k: all exempt", { code: "PA", retIncome: 30000, pen: 12000, ageA: 58, ageB: 62, byPerson: bp({ employer: 20000, pension: 12000 }, { ira: 10000 }) }, 0, 0.0307 * 30000],
 ["A-4 MS 58/62, A IRA $20k, B IRA $10k: A's taxable (under 60)", { code: "MS", retIncome: 30000, ageA: 58, ageB: 62, byPerson: bp({ ira: 20000 }, { ira: 10000 }) }, ["v600"].includes(VER) ? 0.04 * (20000 - 10000) : 0.04 * 20000, 0.04 * 30000],   // v6.00: MS's first $10,000 untaxed (a version LIST)
 ["A-5 WV 70/70, only A has retirement income ($30k IRA): B's $8,000 capped at $0", { code: "WV", retIncome: 30000, ageA: 70, ageB: 70, byPerson: bp({ ira: 30000 }, {}) }, 0.0482 * 22000, 0.0482 * 14000],
 ["A-6 RI 70 single (survivor slot normalised): an IRA alone gets no RI exclusion", { code: "RI", retIncome: 20000, ageA: null, ageB: 70, single: true, byPerson: bp({}, { ira: 20000 }) }, 0.05 * 20000, null],
 ["A-7 RI 70/70 without byPerson: the household path, unchanged", { code: "RI", retIncome: 40000, ageA: 70, ageB: 70 }, 0, 0],
];
for (const [lbl, args, h95, h94] of A) {
  const got = ST(args), want = P3 ? h95 : h94;
  if (want === null) { CK(`${lbl} [v5.95 only — the swap did not exist]: ran`, typeof got === "number"); continue; }
  CK(`${lbl}: $${got.toFixed(2)} = hand $${want.toFixed(2)}${P3 ? "" : " (PIN v5.94)"}`, Math.abs(got - want) < 0.005, got);
}
// ── B · the survivor slot through Engine B (t41's household shape; the app's own load path rebuilds the timeline) ──
{
  const BASE = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  const ss0 = { tableByAge: { 62: 0, 63: 0, 64: 0, 65: 0, 67: 0, 70: 0 }, planned: 0, plannedAge: 67 };
  const rows = code => { const P = JSON.parse(JSON.stringify(BASE));
    Object.assign(P, { positions: [], otherAccounts: [], _incomeFromForm: true, incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }],
      single: false, dobA: "1955-01-01", dobB: "1966-01-01", lifeExpA: 72, lifeExpB: 95, incomeSources: { ssA: ss0, ssB: ss0, pension: { amount: 50000 / 12 } }, stateCode: code });
    g.applyLoadedData({ portfolio: P }); return E.computeTaxPlan({ retireYear: 2026, rothAmount: 0, qcdAnnual: 0, taxYield: 0 }).rows; };
  const tl = () => g.PLAN_TIMELINE();
  const ga = rows("GA"); CK("B-0 the household loaded: A dies 2027 (72), B born 1966 survives", tl().lifeExpA === 72 && tl().dobB.year === 1966);
  const r = yr => ga.find(x => x.yr === yr);
  // GA, survivor B aged 62–64 in 2028–2030: no 65+ exclusion in law's modelled tier (the 62–64 tier is disclosed as not modelled)
  const gaHand = (x, excl) => GA_R * Math.max(0, x.pen_y + x.rmdTax_y + x.conv_y - excl) + GA_R * (x.work_y + x.otherOrd_y + x.capGains_y + x.div_y);
  for (const yr of [2028, 2029, 2030]) CK(`B-GA ${yr} (B aged ${yr - 1966}): $${r(yr).stateTax.toFixed(2)} = hand with ${P3 ? "NO exclusion (the survivor's own age)" : "$65,000 (the DECEDENT's age — PIN v5.94)"}`,
    Math.abs(r(yr).stateTax - gaHand(r(yr), P3 ? 0 : 65000)) < 0.01, `${r(yr).stateTax} vs ${gaHand(r(yr), P3 ? 0 : 65000)}`);
  CK("B-GA 2031 (B aged 65): $65,000 exclusion on both legs", Math.abs(r(2031).stateTax - gaHand(r(2031), 65000)) < 0.01, r(2031).stateTax);
  const ri = rows("RI"), q = yr => ri.find(x => x.yr === yr);
  const riHand = (x, excl) => 0.05 * (Math.max(0, x.pen_y + x.rmdTax_y + x.conv_y - excl) + x.work_y + x.otherOrd_y + x.capGains_y + x.div_y);
  for (const yr of [2028, 2032]) CK(`B-RI ${yr} (B aged ${yr - 1966}, under 67): $${q(yr).stateTax.toFixed(2)} = hand with ${P3 ? "no exclusion" : "$50,000 (decedent's age — PIN v5.94)"}`,
    Math.abs(q(yr).stateTax - riHand(q(yr), P3 ? 0 : Math.min(50000, q(yr).pen_y))) < 0.01, q(yr).stateTax);
  CK("B-RI 2033 (B aged 67): the pension excluded up to $50,000 on both legs", Math.abs(q(2033).stateTax - riHand(q(2033), Math.min(50000, q(2033).pen_y))) < 0.01, q(2033).stateTax);
}
// ── C · without byPerson, every jurisdiction prices exactly as v5.94 (the household path, P3-7) ──
if (P3) {
  const fs = await import("fs");
  // v5.96: compare against the v5.94 module when present, else the v5.95 one (a v595 -> v596 folder). D-27 changed no line of the
  // calculator, so "prices exactly as v5.94" still holds against v5.95's copy; the label below names which module was used.
  const _ref = ["v594", "v595"].find(t => t !== VER && fs.existsSync(new URL(`./app_${t}.mjs`, import.meta.url)));
  if (!_ref) console.log("  \u2013 group C not run: no prior app module (v594 or v595) in this run folder");
  else {
    const _m4 = await import(`./app_${_ref}.mjs`), ST4 = _m4.__engines.stateTaxAnnual || _m4.__g.stateTaxAnnual;
    let n = 0, bad = [];
    const sets = [{ retIncome: 40000, pen: 20000, ageA: 70, ageB: 66 }, { retIncome: 15000, pen: 0, ageA: 58, ageB: 62, work: 30000 }, { retIncome: 90000, pen: 30000, ageA: 75, ageB: null, single: true, ssTaxableFed: 20000, ssGrossA: 30000 },
                  { retIncome: 60000, pen: 10000, ageA: 67, ageB: 67, ssTaxableFed: 25000, ssGrossA: 20000, ssGrossB: 15000, capGains: 8000 }];
    for (const code of [null, ...Object.keys(SR)]) for (const s of sets) { n++; const a = ST4({ code, fallbackRate: 0.05, ...s }), b = ST({ code, fallbackRate: 0.05, ...s }); if (Math.abs(a - b) > 1e-9) bad.push(`${code} ${a} vs ${b}`); }
    CK(`C-1 without byPerson, ${n} calls across every jurisdiction price exactly as v5.94 (compared with app_${_ref})`, bad.length === 0 && n > 200, bad.slice(0, 3).join(" · "));
  }
}
// ── D · data and AST guards ──
{
  const keysWith = f => Object.keys(SR).filter(c => SR[c][f]).sort().join(",");
  if (P3) {
    CK("D-1 exactly RI and WV cap a person's exclusion at their own income", keysWith("exclPerPerson") === "RI,WV", keysWith("exclPerPerson"));
    CK("D-2 RI counts employer, annuity and pension — NOT IRA (§44-30-12(c)(9)); WV counts all four", SR.RI.exclPerPerson.join() === "employer,annuity,pension" && SR.WV.exclPerPerson.join() === "ira,employer,annuity,pension");
    CK("D-3 exactly PA and MS exempt employer plans at any age", keysWith("retExemptEmployerAnyAge") === "MS,PA", keysWith("retExemptEmployerAnyAge"));
    CK("D-4 the age-gated exemption states (the per-person path's reach) are exactly IA, MS, PA", keysWith("retExemptAge") === "IA,MS,PA", keysWith("retExemptAge"));
  } else CK("D-0 PIN v5.94: no rule carries a per-person field", keysWith("exclPerPerson") === "" && keysWith("retExemptEmployerAnyAge") === "");
  const src = (await import("fs")).readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
  CK("D-5 t57's recorder anchor `void byPerson;` occurs exactly once", src.split("void byPerson;").length === 2);
  // ── E · the copy ──
  // E-1 walks STRING LITERALS, TEMPLATE TEXT and JSX TEXT with the parser — comments legitimately keep the history (OPERATIONS §B1;
  // a first version searched the raw source and failed on v5.93's code comments).
  const { createRequire } = await import("module"), require = createRequire(import.meta.url);
  const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
  const texts = [];
  walk.full(ast, n => { if (n.type === "Literal" && typeof n.value === "string") texts.push(n.value); if (n.type === "TemplateElement") texts.push(n.value.cooked || ""); },
    { ...walk.base, JSXElement(n, s, c) { n.children.forEach(x => c(x, s)); n.openingElement.attributes.forEach(a => a.value && c(a.value, s)); },
      JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); }, JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); },
      JSXText(n) { texts.push(n.value); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); }, JSXSpreadAttribute() {}, JSXEmptyExpression() {} });
  const STALE = /until v5\.95|change no figure yet|changes no figure until/;
  const hits = texts.filter(x => STALE.test(x)).length;
  CK(`E-1 ${P3 ? `no user-facing text still says the fields change no figure (${texts.length} texts walked)` : `PIN v5.94: the collected-not-used text is present (${hits} texts)`}`,
     texts.length > 1000 && (P3 ? hits === 0 : hits > 0), `${hits} hits`);
}
done();
