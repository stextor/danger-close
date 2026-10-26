// t69 — D-28 WIDENED: A COMMERCIAL (NON-QUALIFIED) ANNUITY AND STATE RETIREMENT RELIEF · docs/SCOPE_D28_ANNUITY_RELIEF_V606.md · v6.06
//
// Through v6.05 the state calculator let the `annuity` category — a non-qualified annuity bought outside an employer plan or IRA — use every
// state's retirement relief. In thirteen states the law gives it none (PA, NY, WI, MD, IA, OK, IL, ME, AR, DE; CO and MI only for a life annuity,
// which the model does not distinguish; MS unclear, taken conservatively — Steve's decisions DD-1/DD-2), and Maryland's pension exclusion reaches no
// IRA money either (DD-3). v6.06 gives those rows `reliefKinds`, the `byPerson` categories their relief reaches; with `byPerson` the exclusion and the
// exemption are netted against that eligible income only. Without `byPerson` nothing changes. Every move is upward (conservative).
//
// Groups:  A hand cases to the cent where no deduction or bracket intervenes (Pennsylvania: flat 3.07 %, no deduction or exemption in law)
//          B v6.05 -> v6.06 (v606 leg, needs app_v605.mjs): every jurisdiction over a household grid — rows without `reliefKinds` byte-identical,
//            none falls, and each affected row equals the v6.05 calculator on the same household with its excluded categories moved to `work`
//            (an independent implementation of the netting: the frozen v6.05 code)
//          C the data: the relief states are classified exactly (a state that gains relief later fails until it decides its annuity treatment),
//            the thirteen carry `reliefKinds` without `annuity` (Maryland without `ira` too), their notes and the Field Manual say so; all three
//            `stateTaxAnnual` call sites pass `byPerson` (AST)
// BOTH LEGS: the v605 leg pins the absence of all of it. Run: node t69_annuity_relief.mjs <tag>
import "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 300) : ""}`); } };
const EQ = (n, got, want, tol = 0.005) => CK(n, typeof got === "number" && Math.abs(got - want) <= tol, `got ${got}, want ${want}`);
const done = () => { console.log(`\nt69 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t69 — D-28: COMMERCIAL ANNUITIES AND STATE RETIREMENT RELIEF (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const ON = VER !== "v605";
console.error = () => {}; console.warn = () => {};
const M = await import(`./app_${VER}.mjs`), G = M.__g, ST = M.__engines.stateTaxAnnual || G.stateTaxAnnual, SR = G.STATE_RULES();
const z = { ira: 0, employer: 0, annuity: 0, pension: 0 }, zd = { ira: 0, employer: 0, annuity: 0 };
const bp = (a, b) => ({ A: { ...z, ...a }, B: { ...z, ...b }, draw: { A: { ...zd }, B: { ...zd } } });
const NOT = ["AR", "CO", "DE", "IA", "IL", "MD", "ME", "MI", "MS", "NY", "OK", "PA", "WI"];   // §0.2 + DD-1/DD-2: the relief does not reach the annuity
const COVERED = ["AL", "CT", "GA", "KY", "LA", "MT", "NJ", "NM", "RI", "SC", "VA", "WV"];      // §0.2 + DD-1: it does (or the relief is against any income)

// ── A · Pennsylvania by hand: 3.07 % flat, no deduction or exemption in law (the row carries none) ──
{
  CK("A-0 Pennsylvania's row: 3.07 % flat, no `deduct`, no brackets — so a hand figure is rate × base", SR.PA.rate === 0.0307 && !SR.PA.deduct && !SR.PA.brackets);
  const H = [
    ["A-1 70/70, A $20,000 annuity, B $10,000 IRA: the IRA is exempt, the annuity taxed", { code: "PA", retIncome: 30000, ageA: 70, ageB: 70, byPerson: bp({ annuity: 20000 }, { ira: 10000 }) }, 614.00, 0],
    ["A-2 70/70, A $20,000 annuity, B $10,000 401(k) and a $12,000 pension: only the annuity taxed", { code: "PA", retIncome: 30000, pen: 12000, ageA: 70, ageB: 70, byPerson: bp({ annuity: 20000 }, { employer: 10000, pension: 12000 }) }, 614.00, 0],
    ["A-3 single 58, $20,000 annuity: taxed on both legs (under 60 it never qualified)", { code: "PA", retIncome: 20000, ageA: 58, ageB: null, single: true, byPerson: bp({ annuity: 20000 }, {}) }, 614.00, 614.00],
    ["A-4 70/70, $15,000 IRA each, no annuity: unchanged, exempt", { code: "PA", retIncome: 30000, ageA: 70, ageB: 70, byPerson: bp({ ira: 15000 }, { ira: 15000 }) }, 0, 0],
    ["A-5 70/70, $20,000 annuity WITHOUT byPerson: the household path, unchanged (no in-app call takes it)", { code: "PA", retIncome: 20000, ageA: 70, ageB: 70 }, 0, 0],
  ];
  for (const [lbl, args, h606, h605] of H) EQ(`${lbl}: hand $${(ON ? h606 : h605).toFixed(2)}${ON ? "" : " (PIN v6.05)"}`, ST(args), ON ? h606 : h605);
}

// ── B · v6.05 -> v6.06 over every jurisdiction ──
if (ON && existsSync(new URL("./app_v605.mjs", import.meta.url))) {
  const O = await import("./app_v605.mjs"), PST = O.__engines.stateTaxAnnual || O.__g.stateTaxAnnual;
  const grid = [];
  for (const ages of [[70, 68], [62, 58], [67, 67], [56, null]]) for (const ann of [0, 7000, 20000, 60000]) for (const ira of [0, 15000]) for (const pen of [0, 25000]) {
    const single = ages[1] === null; grid.push({ ageA: ages[0], ageB: ages[1], single, a: { annuity: ann, ira }, b: single ? {} : { ira: ira / 2 }, pen });
  }
  let calls = 0, same = 0, rose = 0; const fell = [], outside = [], diff = [], moved = new Set();
  for (const code of Object.keys(SR)) for (const h of grid) {
    const byP = bp({ ...h.a, pension: h.pen }, h.b), ret = ["ira", "employer", "annuity"].reduce((t, k) => t + byP.A[k] + byP.B[k], 0);
    const args = { code, retIncome: ret, pen: h.pen, work: 5000, capGains: 0, ssTaxableFed: 12000, ssGrossA: 24000, ssGrossB: h.single ? 0 : 14000,
      ageA: h.ageA, ageB: h.ageB, single: h.single, taxYear: 2027, fedIncomeTax: 4000, fedNiit: 0, byPerson: byP };
    const t = ST(args), p = PST(args); calls++;
    if (Object.is(t, p)) same++; else if (t > p) { rose++; moved.add(code); } else fell.push(`${code} ${JSON.stringify(h)} ${p} -> ${t}`);
    const rk = SR[code].reliefKinds;
    if (!rk) { if (!Object.is(t, p)) outside.push(`${code} ${p} -> ${t}`); continue; }
    let mv = 0; const A2 = { ...byP.A }, B2 = { ...byP.B };
    for (const k of ["ira", "employer", "annuity"]) if (!rk.includes(k)) { mv += A2[k] + B2[k]; A2[k] = 0; B2[k] = 0; }
    const q = PST({ ...args, retIncome: ret - mv, work: 5000 + mv, byPerson: { A: A2, B: B2, draw: byP.draw } });
    if (Math.abs(t - q) > 0.005) diff.push(`${code} ${JSON.stringify(h)}: v6.06 ${t.toFixed(2)} vs v6.05-moved ${q.toFixed(2)}`);
  }
  CK(`B-1 ${calls} calls over ${Object.keys(SR).length} jurisdictions: every row without \`reliefKinds\` byte-identical to v6.05 (${outside.length} moved)`, calls > 3000 && outside.length === 0, outside.slice(0, 3).join(" | "));
  CK(`B-2 the direction: no call pays less than at v6.05; ${rose} pay more`, fell.length === 0 && rose > 0, fell.slice(0, 3).join(" | "));
  CK(`B-3 the rows that move are exactly the thirteen (${[...moved].sort().join(" ")})`, [...moved].sort().join(",") === NOT.join(","), [...moved].sort().join(","));
  CK(`B-4 each affected call equals the v6.05 calculator with its excluded categories moved to \`work\` — to the cent (${diff.length} differ)`, diff.length === 0, diff.slice(0, 3).join(" | "));
} else console.log(ON ? "  – group B not run: app_v605.mjs is not in this run folder (a v605 -> v606 folder runs it)" : "  – group B runs on the v606 leg (it compares against app_v605.mjs)");

// ── C · the data, the notes, the Field Manual, the call sites ──
{
  const relief = Object.keys(SR).filter(k => { const r = SR[k]; return ((r.rate || 0) > 0 || r.brackets) && (r.retExempt || (r.excl65 || 0) > 0 || r.exclTest); }).sort();
  CK(`C-1 the relief states are exactly the ${NOT.length + COVERED.length} classified (${relief.length} found) — a state that gains relief must decide its annuity treatment here`,
    relief.join(",") === [...NOT, ...COVERED].sort().join(","), relief.join(","));
  const withRk = Object.keys(SR).filter(k => SR[k].reliefKinds).sort();
  if (ON) {
    CK(`C-2 \`reliefKinds\` sits on exactly the thirteen (${withRk.join(" ")})`, withRk.join(",") === NOT.join(","));
    const allowed = ["ira", "employer", "annuity", "pension"];
    CK("C-3 each is a list of known categories without `annuity`; employer plans and pensions always in", NOT.every(k => {
      const rk = SR[k].reliefKinds; return Array.isArray(rk) && rk.every(x => allowed.includes(x)) && !rk.includes("annuity") && rk.includes("employer") && rk.includes("pension"); }));
    const _rk = k => SR[k].reliefKinds || [];   // a missing field is C-2's finding, not a crash here
    CK("C-4 Maryland's leaves out IRA money too (Tax-Gen. §10-209); every other affected row keeps it", !!SR.MD.reliefKinds && !_rk("MD").includes("ira") && NOT.filter(k => k !== "MD").every(k => !SR[k].reliefKinds || _rk(k).includes("ira")));
    const noteOk = NOT.filter(k => !/commercial \(non-qualified\) annuity/.test(SR[k].note));
    CK(`C-5 each of the thirteen notes names the commercial (non-qualified) annuity (missing: ${noteOk.join(" ") || "none"})`, noteOk.length === 0);
    CK("C-6 Maryland's note no longer says its IRA rule is not modelled", !/traditional IRA does not qualify — not modelled/.test(SR.MD.note) && /neither IRA money nor a commercial/.test(SR.MD.note));
    CK("C-7 Colorado's and Michigan's notes say a life annuity would qualify; Mississippi's that the law does not say",
      /fully matured/.test(SR.CO.note) && /pays for life to a senior citizen/.test(SR.MI.note) && /the law does not say/.test(SR.MS.note));
    const DOCS = (G.DOCS_HTML ? G.DOCS_HTML() : "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    const sent = (DOCS.match(/From v6\.06 a commercial \(non-qualified\) annuity[^.]*\./) || [""])[0];
    const unnamed = NOT.filter(k => !sent.includes(SR[k].name));
    CK(`C-8 the Field Manual names every affected state, derived from the table (missing: ${unnamed.join(" ") || "none"})`, sent.length > 0 && unnamed.length === 0, sent.slice(0, 200));
  } else {
    CK("C-2 [PIN v6.05] no row carries `reliefKinds` — every state's relief reached the annuity", withRk.length === 0);
    CK("C-6 [PIN v6.05] Maryland's note said its IRA rule was not modelled", /traditional IRA does not qualify — not modelled/.test(SR.MD.note));
  }
  const srcPath = new URL(`../${VER}.jsx`, import.meta.url);
  if (existsSync(srcPath)) {
    const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
    const ast = acorn.Parser.extend(jsx()).parse(readFileSync(srcPath, "utf8"), { ecmaVersion: "latest", sourceType: "module" });
    const sites = [];
    walk.full(ast, n => { if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "stateTaxAnnual") {
      const a = n.arguments[0]; sites.push(!!(a && a.type === "ObjectExpression" && a.properties.some(p => p.key && (p.key.name || p.key.value) === "byPerson"))); } },
      { ...walk.base, JSXElement() {}, JSXFragment() {} });
    CK(`C-9 every \`stateTaxAnnual\` call site passes \`byPerson\` (${sites.filter(Boolean).length} of ${sites.length}) — without it the relief would reach the annuity again`, sites.length >= 3 && sites.every(Boolean));
  } else CK("C-9 the source is in the run folder", false, srcPath.pathname);
}
done();
