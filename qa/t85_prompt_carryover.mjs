// t85 — A NEW PLAN KEEPS NO ONE ELSE'S FACTS: THE MASTER PROMPT, THE EXAMPLE'S INCOME AND ITS EXPENSE TABLE (v6.22 — D-53 and siblings)
// Run: node t85_prompt_carryover.mjs v622   |   node t85_prompt_carryover.mjs v621
//
// THE DEFECTS THIS EXISTS FOR (docs/SCOPE_D53_PROMPT_V622.md):
//   D-53 — the loader replaced the master prompt only when handed a non-empty string, and saveToStorage wrote it only when non-empty, so a
//          plan that arrived without one kept the prompt held before it: the example's at the landing screen (Start Fresh, the guided
//          setup), else the previous plan's (the guided setup run from My Data, a backup without one). The example's household facts lived
//          ONLY in that prompt, so the timeline, My Data, the Ranking tab and Ask AI read its dates of birth, plan-to ages, Florida and home
//          into the new plan, and one Save & Apply stored them as the plan's own. From v6.22 the facts are fields on DEFAULT_PORTFOLIO and a
//          load without a prompt holds none (DC-1); My Data shows a placeholder blank with a notice (DC-2); a plan with no state says so
//          (DC-3); the Field Manual says what Ask AI is sent (DC-4); a plan saved earlier with the example's facts is told so (DC-5).
//   DC-6 — a plan with no Social Security / pension figure was paid the example's $3,300 / $1,300 / $400 a month (the loader's inserts and the
//          getters' fallback), and the warning fired only when a prompt was held — which the D-53 fix would have silenced.
//   DC-7 — a backup with no expense table kept the table already held (the example's 35 rows at the landing screen).
//
// GATED PER LEG (OPERATIONS §B2). The v6.21 leg pins what v6.22 changes as dated [KNOWN DEFECT] checks. §C needs both legs' modules (the
// v6.21 → v6.22 pair only; printed skip otherwise). §D–§F mount the DOM bundle.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(85); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v622";
const KNOWN_VERSIONS = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"].includes(VER);   // an array, so the next registration widens it
// The differential's pair — constants, NOT `VER === "v622"`, so the registrar cannot widen them (t76 records why).
const D_PRIOR = "v621", D_CUR = "v622";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g, __test: t } = M;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const JP = Parser.extend(jsx());
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });
const AST = JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t85 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-20, D-53 — flips at v6.22]";
const KD6 = "[KNOWN DEFECT 2026-10-20, D-53 sibling DC-6 — flips at v6.22]";
const KD7 = "[KNOWN DEFECT 2026-10-20, D-53 sibling DC-7 — flips at v6.22]";
console.log(`t85 — A NEW PLAN KEEPS NO ONE ELSE'S FACTS (${VER})\n`);

// ── AST helpers ──
const fnBody = name => { let f = null; walk.full(AST, n => { if (n.type === "FunctionDeclaration" && n.id && n.id.name === name) f = n; }, W); return f; };
const inFn = (name, pred) => { const f = fnBody(name); if (!f) return null; let k = 0; walk.full(f, n => { if (pred(n)) k++; }, W); return k; };
const declInit = name => { let d = null; walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === name) d = n.init; }, W); return d; };
// THE demo prompt's text, read from the source (a template literal with no substitutions)
const DEMO = (() => { const n = declInit("DEFAULT_MASTER_PROMPT"); return n && n.type === "TemplateLiteral" && n.expressions.length === 0 ? n.quasis[0].value.cooked : null; })();
// The parsers themselves, evaluated from the source — so B-3 compares the fields to what the APP reads, not to a copy of its regexes.
const fnOf = name => { const f = fnBody(name); return f ? new Function(`${SRC.slice(f.start, f.end)}; return ${name};`)() : null; };
const P_DOB = fnOf("_parseDOB"), P_RET = fnOf("_parseTargetRetireYear"), P_LIFE = fnOf("_parseLifeExpectancy"),
      P_RATE = fnOf("_parseStateTaxRate"), P_NAME = fnOf("_parseStateName");
const homeRe = name => { const n = declInit(name); return n && n.type === "CallExpression" && n.arguments[0] && n.arguments[0].regex
  ? new RegExp(n.arguments[0].regex.pattern, n.arguments[0].regex.flags) : null; };

// ── the start state: the example, as the module loads it ──
const BASE = clone(g.PORTFOLIO()), XB = clone(g.EXPENSES());
const EX0 = { tl: clone(g.PLAN_TIMELINE()), ss: [g.getSSA(), g.getSSB(), g.getPension()], demo: g.MASTER_PROMPT() === DEMO };
const FACTS = ["dobA", "dobB", "retireYear", "lifeExpA", "lifeExpB", "stateName", "stateTaxRate", "homeValue", "mortgageBal", "mortgageRate"];
const isDemo = () => g.MASTER_PROMPT() === DEMO;
// The example's DISTINGUISHING facts in a timeline (2029 and 0% are excluded: the placeholders share them).
const exFacts = tl => [tl.dobA.year === 1964 && tl.dobA.month === 1 && "dobA", tl.dobB.year === 1966 && tl.dobB.month === 1 && "dobB",
  tl.lifeExpA === 80 && "lifeExpA", tl.lifeExpB === 87 && "lifeExpB", tl.stateName === "Florida" && "Florida"].filter(Boolean);
// Start Fresh's blank plan, verbatim (L4612-4626 at v6.21), and a guided-setup plan with the state step skipped.
const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true });
const wizard = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1970-06", dobB: "1972-06", retireYear: 2035, retireYearB: 2035,
  lifeExpA: 88, lifeExpB: 90, stateName: "", stateTaxRate: 0, stateCode: null });
const OWN = `RETIREMENT ANALYSIS CONTEXT — Ann & Bo\nTarget Retirement: June 1, 2031\n- Ann: DOB 03/15/1968 (age 58). Life expectancy age 92.\n`
  + `- Bo: DOB 07/01/1970. Life expectancy age 95.\n- Filing: MFJ. State: Oregon, state income tax 8.75%.\nhome: $610,000 value, $240,000 mortgage at 3.10%`;
const load = a => t.applyLoadedData(a);

// ── §A · the loader (engine level) ──────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — a load without a prompt holds none; the example's own path holds the demo");
{
  T("A-0: SETUP — the module starts holding the demo prompt, read from the source", !!DEMO && DEMO.length > 10000 && EX0.demo);
  load({ portfolio: blank(), expenses: [], masterPrompt: "", incomeFromForm: true });   // Start Fresh's call, verbatim
  let tl = g.PLAN_TIMELINE();
  if (POST) T("A-1: Start Fresh's call holds no prompt and none of the example's facts; dates and retirement year are marked placeholders (1963-09, 1966-03, 2029, 90, no state)",
    g.MASTER_PROMPT() === "" && exFacts(tl).length === 0 && tl._placeholder && tl._placeholder.dobA && tl._placeholder.dobB && tl._placeholder.retireYear
    && tl.dobA.year === 1963 && tl.dobA.month === 9 && tl.dobB.year === 1966 && tl.dobB.month === 3 && tl.targetRetireYear === 2029
    && tl.lifeExpA === 90 && tl.lifeExpB === 90 && tl.stateName === "", JSON.stringify({ p: g.MASTER_PROMPT().slice(0, 30), f: exFacts(tl), ph: tl._placeholder }));
  else T(`A-1 ${KD}: Start Fresh's plan keeps the example's prompt and reads all five of its facts`, isDemo() && exFacts(tl).length === 5, exFacts(tl).join(","));

  load({ useDefaults: true });   // back to the landing screen's state (the example)
  load({ portfolio: wizard(), expenses: [], incomeFromForm: true });   // the landing guided setup's call, verbatim (no prompt)
  tl = g.PLAN_TIMELINE();
  if (POST) T("A-2: the landing guided setup's call holds no prompt; its state (skipped) is none, not Florida; its own dates stand",
    g.MASTER_PROMPT() === "" && tl.stateName === "" && tl.dobA.year === 1970 && tl.lifeExpA === 88 && !tl._placeholder.dobA, `${tl.stateName} ${tl.dobA.year}`);
  else T(`A-2 ${KD}: the guided setup with its state skipped reads the example's Florida`, isDemo() && tl.stateName === "Florida", tl.stateName);

  load({ portfolio: { ...blank(), nameA: "Ann", nameB: "Bo" }, expenses: [], masterPrompt: OWN, incomeFromForm: true });
  tl = g.PLAN_TIMELINE();
  T("A-3a: SETUP — a plan with its own prompt reads its own facts from it (Oregon, born 1968, retiring 2031, to 92)",
    g.MASTER_PROMPT() === OWN && tl.stateName === "Oregon" && tl.dobA.year === 1968 && tl.targetRetireYear === 2031 && tl.lifeExpA === 92, JSON.stringify([tl.stateName, tl.dobA.year]));
  load({ portfolio: wizard(), expenses: [], incomeFromForm: true });   // the My Data guided setup → handleApplyData(p, x) — masterPrompt undefined
  tl = g.PLAN_TIMELINE();
  if (POST) T("A-3: the guided setup run from My Data builds a plan with none of the old plan's prompt — no Oregon, no $610,000 home",
    g.MASTER_PROMPT() === "" && tl.stateName === "", tl.stateName);
  else T(`A-3 ${KD}: the guided setup run from My Data keeps the old plan's prompt and its Oregon`, g.MASTER_PROMPT() === OWN && tl.stateName === "Oregon", tl.stateName);

  load({ portfolio: { ...blank(), nameA: "Ann", nameB: "Bo" }, expenses: [], masterPrompt: OWN, incomeFromForm: true });
  load({ portfolio: { ...blank(), nameA: "Cy", nameB: "Di" }, expenses: [], masterPrompt: undefined, incomeFromForm: true });   // Restore / Import, a backup without one
  if (POST) T("A-4: Restore or Import of a backup without masterPrompt holds none", g.MASTER_PROMPT() === "" && g.PLAN_TIMELINE().stateName === "");
  else T(`A-4 ${KD}: a backup without masterPrompt keeps the previous plan's`, g.MASTER_PROMPT() === OWN);

  const long = "RETIREMENT ANALYSIS CONTEXT — Long\n" + "x".repeat(30000);
  load({ portfolio: blank(), expenses: [], masterPrompt: long, incomeFromForm: true });
  T("A-5: a load with a prompt keeps it, cut at MASTER_PROMPT_MAX_CHARS (unchanged)",
    g.MASTER_PROMPT().length === g.MASTER_PROMPT_MAX_CHARS() && long.startsWith(g.MASTER_PROMPT()), `${g.MASTER_PROMPT().length} / ${g.MASTER_PROMPT_MAX_CHARS()}`);

  load({ portfolio: { ...blank(), nameA: "Ann", nameB: "Bo" }, expenses: [], masterPrompt: OWN, incomeFromForm: true });
  load({ useDefaults: true });   // the landing "Use example data" (applyAndContinue(true)) — it sets no prompt itself
  if (POST) T("A-6: the example's path (useDefaults) holds the demo prompt itself, whatever was held before", isDemo());
  else T(`A-6 ${KD}: the landing "Use example data" holds whatever was held (here another plan's prompt)`, g.MASTER_PROMPT() === OWN);

  load({ portfolio: { ...blank(), nameA: "Ann", nameB: "Bo" }, expenses: [], masterPrompt: OWN, incomeFromForm: true });
  load({ portfolio: blank(), expenses: [], masterPrompt: { steer: "the assistant" }, incomeFromForm: true });
  if (POST) T("A-10: a non-string prompt is still rejected, and the plan then holds none (t37 A6-4 / A6-6 moved with this)", g.MASTER_PROMPT() === "");
  else T("A-10 (v6.21 behaviour, A-6 of v5.71): a non-string prompt is rejected and the previous one stands", g.MASTER_PROMPT() === OWN);

  // DC-8 (Steve, 2026-10-20): the example's own TEXT arriving with holdings that are not the example's (a key v6.21 left in storage beside
  // another plan — "Load sample data", then the guided setup or an import without a prompt) is not that plan's prompt.
  const ownHold = { ...wizard(), positions: [{ ticker: "VTI", name: "Total Market", balance: 400000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" }],
    household: 400000, total401k: 400000 };
  load({ portfolio: ownHold, expenses: [], masterPrompt: DEMO, incomeFromForm: true });
  tl = g.PLAN_TIMELINE();
  if (POST) T("A-11: the demo text with a plan's own holdings is dropped — no prompt, no Florida", g.MASTER_PROMPT() === "" && tl.stateName === "", tl.stateName);
  else T(`A-11 ${KD}: the demo text beside a plan's own holdings is held, and its Florida read`, isDemo() && tl.stateName === "Florida", tl.stateName);
  load({ portfolio: clone(BASE), expenses: clone(XB), masterPrompt: DEMO, incomeFromForm: true });
  T("A-11b: the demo text with the example's own holdings is kept (an example backup, a stored example)", isDemo() && exFacts(g.PLAN_TIMELINE()).length === 5);
}

// ── §B · the rules, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the loader, storage, the example's fields and the fallbacks (AST)");
{
  const assigns = []; const lf = fnBody("applyLoadedDataUnchecked");
  walk.full(lf, n => { if (n.type === "AssignmentExpression" && n.left.type === "Identifier" && n.left.name === "MASTER_PROMPT") assigns.push(n.right); }, W);
  const toDemo = assigns.some(r => r.type === "Identifier" && r.name === "DEFAULT_MASTER_PROMPT");
  const toEmpty = assigns.some(r => r.type === "Literal" && r.value === "");
  if (POST) T("B-1 [EXTINCTION]: the loader writes the prompt on every path — DEFAULT_MASTER_PROMPT for useDefaults, \"\" for no usable string", toDemo && toEmpty, assigns.length);
  else T(`B-1 ${KD}: the loader writes the prompt only when handed a string`, !toDemo && !toEmpty, assigns.length);

  const del = inFn("saveToStorage", n => n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.property.name === "delete"
    && n.arguments[0] && n.arguments[0].type === "MemberExpression" && n.arguments[0].property.name === "prompt");
  const calls = []; walk.full(AST, n => { if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "saveToStorage") calls.push(n.arguments[0]); }, W);
  const objCalls = calls.filter(a => a && a.type === "ObjectExpression");
  const passLoader = objCalls.filter(a => a.properties.some(p => p.key && p.key.name === "masterPrompt" && p.value.type === "Identifier" && p.value.name === "MASTER_PROMPT")).length;
  if (POST) T("B-2 [EXTINCTION]: saveToStorage deletes the prompt key for \"\", and every caller that loads a plan passes the loader's prompt (MASTER_PROMPT) — 6 of 6",
    del === 1 && objCalls.length === 6 && passLoader === 6 && calls.length === 7, `${del} / ${passLoader} of ${objCalls.length} / ${calls.length}`);
  else T(`B-2 ${KD}: saveToStorage never deletes the prompt key; one caller passes MASTER_PROMPT`, del === 0 && passLoader === 1, `${del} / ${passLoader}`);

  const dA = P_DOB(DEMO, "Spouse A"), dB = P_DOB(DEMO, "Spouse B");
  const ymd = o => o ? `${o.year}-${String(o.month).padStart(2, "0")}-${String(o.day).padStart(2, "0")}` : null;
  const hv = DEMO.match(homeRe("_pHome")), mb = DEMO.match(homeRe("_pMort")), mr = DEMO.match(homeRe("_pRate"));
  const parsed = { dobA: ymd(dA), dobB: ymd(dB), retireYear: P_RET(DEMO), lifeExpA: P_LIFE(DEMO, "Spouse A"), lifeExpB: P_LIFE(DEMO, "Spouse B"),
    stateName: P_NAME(DEMO), stateTaxRate: P_RATE(DEMO), homeValue: hv ? +hv[1].replace(/,/g, "") : null,
    mortgageBal: mb ? +mb[1].replace(/,/g, "") : null, mortgageRate: mr ? +mr[1] : null };
  T("B-3a: SETUP — every parser and home regex MATCHES on the demo prompt (no default stands in)",
    FACTS.every(k => parsed[k] !== null && parsed[k] !== undefined && parsed[k] !== "") && /no\s+(?:state\s+)?income\s+tax/i.test(DEMO), JSON.stringify(parsed));
  if (POST) {
    T("B-3 [EXTINCTION]: DEFAULT_PORTFOLIO carries the example's ten facts, each equal to what the app's own parsers read from the demo prompt",
      FACTS.every(k => BASE[k] === parsed[k]), JSON.stringify(FACTS.filter(k => BASE[k] !== parsed[k]).map(k => [k, BASE[k], parsed[k]])));
    T("B-3b: _parseTargetRetireYear and _parseLifeExpectancy say \"not found\" (null) rather than 2029 / 90", P_RET("") === null && P_RET("nothing here") === null
      && P_LIFE("", "X") === null && P_LIFE("X: nothing", "X") === null);
  } else T(`B-3 ${KD}: DEFAULT_PORTFOLIO carries none of the ten facts — they live only in the demo prompt`, FACTS.every(k => !(k in BASE)));

  const getDef = ["getSSA", "getSSB", "getPension"].map(f => inFn(f, n => n.type === "Identifier" && n.name === "DEFAULT_PORTFOLIO"));
  const lits = inFn("applyLoadedDataUnchecked", n => n.type === "Literal" && [3300, 1300, 400].includes(n.value));
  if (POST) T("B-4 [EXTINCTION]: no income getter reads DEFAULT_PORTFOLIO, and the loader inserts no $3,300 / $1,300 / $400", getDef.every(k => k === 0) && lits === 0, `${getDef} / ${lits}`);
  else T(`B-4 ${KD6}: the getters fall back to DEFAULT_PORTFOLIO and the loader inserts the example's amounts`, getDef.every(k => k === 1) && lits === 3, `${getDef} / ${lits}`);
}

// ── §C · the example unmoved (the v6.21 → v6.22 pair) ───────────────────────────────────────────────────────────────────────────────
console.log("  C — the example, unmoved");
{
  const otherTag = VER === D_CUR ? D_PRIOR : null;
  if (otherTag && existsSync(join(HERE, `app_${otherTag}.mjs`))) {
    const O = (await import(pathToFileURL(join(HERE, `app_${otherTag}.mjs`)).href)).__g;
    const norm = o => { if (Array.isArray(o)) return o.map(norm); if (o && typeof o === "object") { const r = {}; Object.keys(o).sort().filter(k => k !== "_placeholder").forEach(k => { r[k] = norm(o[k]); }); return r; } return o; };
    const a = JSON.stringify(norm(EX0.tl)), b = JSON.stringify(norm(O.PLAN_TIMELINE()));
    T(`C-1: the example's timeline has the same values at ${D_PRIOR} and ${D_CUR} (key order and the new placeholder record aside)`, a === b, a === b ? "" : `${a.slice(0, 140)} | ${b.slice(0, 140)}`);
    T(`C-2: the example's Social Security and pension are the same at both (3300 / 1300 / 400)`, JSON.stringify(EX0.ss) === JSON.stringify([O.getSSA(), O.getSSB(), O.getPension()]) && EX0.ss.join() === "3300,1300,400", EX0.ss.join());
    T("C-3: the example holds the demo prompt at both", EX0.demo && O.MASTER_PROMPT() === DEMO);
  } else console.log(`    (C-1..C-3 skipped on ${VER}: the pair runs on the ${D_CUR} leg)`);
}

// ── §E · income a plan never entered (engine level) ────────────────────────────────────────────────────────────────────────────────
console.log("  E — income a plan never entered is not paid, and is named");
{
  const ss = () => [g.getSSA(), g.getSSB(), g.getPension()].join(",");
  load({ portfolio: { ...blank(), nameA: "Hal", nameB: "Ida", incomeSources: { ssA: {}, ssB: {}, pension: {} } }, expenses: [], incomeFromForm: true });
  if (POST) T("E-1: blocks present but no amounts → 0 / 0 / 0", ss() === "0,0,0", ss());
  else T(`E-1 ${KD6}: blocks without amounts are paid the example's`, ss() === "3300,1300,400", ss());

  load({ portfolio: { ...blank(), nameA: "Hal", nameB: "Ida", _incomeFromForm: false, incomeSources: {} }, expenses: [], incomeFromForm: false });
  const fb = () => (g.PORTFOLIO()._incomeFellBack || []).length;
  if (POST) T("E-2: blocks absent, not from the form, no prompt → 0 / 0 / 0, all three named for the banner", ss() === "0,0,0" && fb() === 3, `${ss()} / ${fb()}`);
  else T(`E-2 ${KD6}: blocks absent → the example's amounts`, ss() === "3300,1300,400", `${ss()} / ${fb()}`);

  const P3 = { ...blank(), nameA: "Hal", nameB: "Ida" }; delete P3.incomeSources;
  load({ portfolio: P3, expenses: [], incomeFromForm: true });
  if (POST) T("E-3: no income blocks and from the form → 0 / 0 / 0, still named (the flag, not a prompt, decides)", ss() === "0,0,0" && fb() === 3, `${ss()} / ${fb()}`);
  else T(`E-3 ${KD6}: no blocks, from the form → the example's amounts and no banner at all`, ss() === "3300,1300,400" && fb() === 0, `${ss()} / ${fb()}`);

  load({ portfolio: { ...blank(), nameA: "Hal", nameB: "Ida", incomeSources: { ssA: { tableByAge: {}, planned: 3300, plannedAge: 67, isDefault: true },
    ssB: { tableByAge: {}, planned: 1300, plannedAge: 63, isDefault: true }, pension: { amount: 400, isDefault: true } } }, expenses: [], incomeFromForm: true });
  if (POST) T("E-3b: blocks a past load inserted (and a save stored) with the flag are zeroed and named", ss() === "0,0,0" && fb() === 3, `${ss()} / ${fb()}`);
  else T(`E-3b ${KD6}: a stored flagged block keeps the example's amounts`, ss() === "3300,1300,400", ss());

  load({ portfolio: clone(BASE), expenses: clone(XB), useDefaults: true });
  T("E-4: the example is still paid 3300 / 1300 / 400, with nothing named", ss() === "3300,1300,400" && fb() === 0, `${ss()} / ${fb()}`);
}

// ── §D · rendered: Start Fresh, My Data, the Taxes / Roth / Ask AI tabs, storage across a reload ─────────────────────────────────────
console.log("  D — rendered (Start Fresh, My Data, Taxes, Roth, Ask AI, Ranking; storage across a reload; backups)");
{
  const PREFIX = "dc:";
  window.storage = {
    async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
    async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
    async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
    async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
  };
  window.confirm = () => true;
  window.URL.createObjectURL = () => "blob:t85"; window.URL.revokeObjectURL = () => {};
  globalThis.URL.createObjectURL = () => "blob:t85"; globalThis.URL.revokeObjectURL = () => {};
  require(`./dom_${VER}.cjs`);
  const React = require("react");
  const DG = window.__g, K = DG.STORAGE_KEYS();
  const body = () => window.document.body;
  const txt = () => body().textContent || "";
  const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
  let root = null, act, DangerClose, el;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
  const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
    try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
  const go = async name => { await click(tabBtn(name)); await flush(); await flush(); };
  const raw = k => window.localStorage.getItem(PREFIX + K[k]);
  const stored = k => JSON.parse(raw(k) || "null");
  const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
  const seed = async (portfolio, expenses, prompt) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
    if (expenses !== undefined) put("expenses", expenses); if (prompt !== undefined) put("prompt", prompt); await render(); };
  const q = sel => body().querySelector(sel);
  const dates = () => [...body().querySelectorAll('input[type="date"]')].map(i => i.value);
  const inputs = () => [...body().querySelectorAll("input")].map(i => i.value);
  const waitFor = async (pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (pred()) return true; await flush(400); } return false; };
  const importFile = async payload => {
    const inp = [...body().querySelectorAll('input[type="file"]')].find(i => /json/.test(i.getAttribute("accept") || ""));
    if (!inp) return false;
    const file = new window.File([payload], "backup.json", { type: "application/json" });
    Object.defineProperty(inp, "files", { value: [file], configurable: true });
    try { await act(async () => { inp.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
    for (let i = 0; i < 8; i++) await flush(); await flush(400);
    return true;
  };
  const errShown = () => { const n = q("[data-dc-import-err]"); return n ? n.textContent : ""; };
  const NOSTATE = "No state chosen — the model charges no state income tax";
  const demoHead = (DEMO || "").slice(0, 60);


  // D-3d / C-4 / C-5 — the example, FIRST: in the app the landing's "Use example data" is only ever reached on a fresh page (a first visit,
  // after Clear all data, or with an unreadable stored plan — each holds DEFAULT_PORTFOLIO), and this harness keeps one module across renders.
  await seed();
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  await go("taxes");
  if (POST) T("D-3d: the example's footnote names Florida and points at My Data, not a master prompt",
    /Florida has no state income tax, so the State column is \$0 by design — choose a different state in My Data/.test(txt()) && !/master prompt/i.test(txt()));
  else T(`D-3d ${KD}: the example's footnote says to change the master prompt's state line`, /change the master prompt's state line/.test(txt()));
  await go("my data");
  const exIn = inputs();
  T("C-4: the example's My Data starts from its own facts — 1964-01-01, 1966-01-01, 80, 87, 2029, $450,000 / $120,000 / 4.25%",
    ["1964-01-01", "1966-01-01", "80", "87", "2029", "450000", "120000", "4.25"].every(v => exIn.includes(v)) && !q("[data-dc-placeholder-notice]") && !q("[data-dc-example-facts-notice]"),
    ["1964-01-01", "1966-01-01", "80", "87", "2029", "450000", "120000", "4.25"].filter(v => !exIn.includes(v)).join(","));
  await go("ranking");
  T("C-5: the example's Ranking tab reads its home: net worth $1.98M (portfolio + equity)", /Net Worth\s*\$1\.98M \(portfolio \+ equity\)/.test(txt()), (txt().match(/Net Worth.{0,40}/) || [""])[0]);

  // A-7 — a Start Fresh plan stored by v6.21 (no prompt key), reloaded
  await seed(blank(), [], undefined);
  let tl = DG.PLAN_TIMELINE();   // after the example: the v6.21 leg then holds the demo, as the app does on every fresh visit
  if (POST) T("A-7: a stored Start Fresh plan with no prompt key reloads with none — its facts are the placeholders (1963-09 / 1966-03, 90 / 90, no state)",
    DG.MASTER_PROMPT() === "" && tl.dobA.year === 1963 && tl.dobB.year === 1966 && tl.lifeExpA === 90 && tl.lifeExpB === 90 && tl.stateName === "", JSON.stringify([tl.dobA, tl.lifeExpA, tl.stateName]));
  else T(`A-7 ${KD}: a stored Start Fresh plan reloads with the demo prompt and the example's facts`, exFacts(tl).length === 5, exFacts(tl).join(","));

  // D-1 / D-2 / D-3 — a first visit, Start Fresh, My Data, Save & Apply, a reload
  await seed();
  T("D-0: SETUP — a first visit shows the landing screen", !!btn(/start fresh/i));
  await click(btn(/start fresh/i)); for (let i = 0; i < 4; i++) await flush();
  // D-7 — Ask AI's preview for that plan, before any save
  await go("ask AI");
  const pre = () => [...body().querySelectorAll("pre")].find(p => /LIVE PORTFOLIO CONTEXT/.test(p.textContent || ""));
  const gotPre = await waitFor(() => !!pre(), 90000);
  T("D-7a: SETUP — Ask AI shows what it sends", gotPre);
  if (gotPre) {
    // v6.26 (D-55): the app's ground rules now come first, so startsWith(demoHead) alone would always pass; compare what follows them.
    const _afterRules = t => t.replace(/^GROUND RULES — [^]*?\n\n/, "");
    if (POST) T("D-7: a plan begun with Start Fresh sends no demo briefing — the preview is its live context only", !_afterRules(pre().textContent).startsWith(demoHead) && !/Spouse A & Spouse B  \[DEMO/.test(pre().textContent) && /^\n*═+\nLIVE PORTFOLIO CONTEXT/.test(_afterRules(pre().textContent)), _afterRules(pre().textContent).slice(0, 80));
    else T(`D-7 ${KD}: until its first save a Start Fresh plan sends the example's briefing`, pre().textContent.startsWith(demoHead), pre().textContent.slice(0, 80));
  }
  await go("my data");
  const d1 = dates(), in1 = inputs();
  if (POST) T("D-1: after Start Fresh, My Data shows no date of birth and no retirement year, none of the example's home, and the placeholder notice",
    d1.length === 2 && d1.every(v => v === "") && !in1.includes("450000") && !in1.includes("1964-01-01") && !!q("[data-dc-placeholder-notice]")
    && /September 1963/.test(q("[data-dc-placeholder-notice]").textContent), JSON.stringify(d1));
  else T(`D-1 ${KD}: after Start Fresh, My Data shows the example's dates of birth and home as if entered`,
    d1.join() === "1964-01-01,1966-01-01" && in1.includes("450000"), JSON.stringify(d1));
  await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 3; i++) await flush();
  const P2 = stored("portfolio") || {};
  if (POST) T("D-2: Save & Apply stores none of the example's distinguishing facts (no dates, no Florida, no $450,000 home, no 80 / 87)",
    !P2.dobA && !P2.dobB && !P2.retireYear && P2.stateName !== "Florida" && Number(P2.homeValue) !== 450000 && P2.lifeExpA !== 80 && P2.lifeExpB !== 87,
    JSON.stringify(FACTS.map(k => P2[k])));
  else T(`D-2 ${KD}: Save & Apply stores the example's facts as the plan's own`, P2.dobA === "1964-01-01" && P2.stateName === "Florida" && Number(P2.homeValue) === 450000,
    JSON.stringify(FACTS.map(k => P2[k])));
  await render(); await go("my data");
  if (POST) T("D-2b: after a reload the dates are still blank and the notice still shows", dates().every(v => v === "") && !!q("[data-dc-placeholder-notice]"), JSON.stringify(dates()));
  else T(`D-2b ${KD}: after a reload the example's dates are the plan's`, dates().join() === "1964-01-01,1966-01-01", JSON.stringify(dates()));
  if (POST) T("D-3a: My Data's state control says no state is chosen", !!q("[data-dc-no-state]") && /Choose your state from this list/.test(q("[data-dc-no-state]").textContent));
  await go("taxes");
  const tx = txt(), fn = q("[data-dc-state-footnote]");
  if (POST) T("D-3b: the Taxes tab says no state is chosen — no \"your state has no…\", no \"STATE (your)\", no master prompt",
    !!fn && fn.textContent.includes(NOSTATE) && !/your state has no|STATE \(your\)|State \(your state\)|master prompt/i.test(tx), fn ? fn.textContent : "no footnote");
  else T(`D-3b ${KD}: the Taxes tab names the example's Florida and points at a master prompt`, /Florida has no state income tax/.test(tx) && /master prompt's state line/.test(tx));
  await go("roth");
  if (POST) T("D-3c: the Roth tab's rules box says the same", txt().includes(NOSTATE));
  else T(`D-3c ${KD}: the Roth tab's rules box says Florida`, /Florida — no state income tax/.test(txt()));



  // D-3e — a manual non-zero rate with no state name is not "no state"
  await seed({ ...wizard(), nameA: "Jo", nameB: "Kim", stateTaxRate: 0.05 }, [], undefined);
  await go("roth");
  if (POST) T("D-3e: a manual 5% rate with no state name reads as a flat 5% state tax, never \"charges no state income tax\"",
    /A flat 5\.00% state tax/.test(txt()) && !txt().includes(NOSTATE), (txt().match(/.{0,30}flat 5\.00%.{0,20}/) || [""])[0]);
  else T(`D-3e ${KD}: a manual 5% rate with no name is named the example's Florida`, /Florida — a flat 5\.00% state tax/.test(txt()));
  await go("my data");
  T("D-3f: …and My Data shows no no-state line for it", !q("[data-dc-no-state]"));


  // A-8 — an example stored before v6.22 (its portfolio has no fact fields; its demo prompt is stored): no migration needed
  const ex621 = clone(BASE); FACTS.forEach(k => { delete ex621[k]; });
  await seed(ex621, clone(XB), DEMO);
  tl = DG.PLAN_TIMELINE();
  await go("my data");
  T("A-8: an example stored before v6.22 still has every one of its facts (from its stored prompt) — no migration",
    exFacts(tl).length === 5 && tl.targetRetireYear === 2029 && ["450000", "120000", "4.25"].every(v => inputs().includes(v)), exFacts(tl).join(","));

  // A-12 — DC-8, rendered: a v6.21 plan with its own holdings stored beside the example's prompt key
  await seed({ ...wizard(), nameA: "Ray", nameB: "Sal", positions: [{ ticker: "VTI", name: "Total Market", balance: 400000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" }],
    household: 400000, total401k: 400000 }, [], DEMO);
  tl = DG.PLAN_TIMELINE();
  if (POST) T("A-12: a stored plan with its own holdings beside the example's prompt key loads with no prompt, no Florida, and the key is dropped",
    DG.MASTER_PROMPT() === "" && tl.stateName === "" && raw("prompt") === null, `${tl.stateName} / ${String(raw("prompt")).slice(0, 30)}`);
  else T(`A-12 ${KD}: such a plan reads the example's Florida from the stored key`, tl.stateName === "Florida" && raw("prompt") === DEMO, tl.stateName);

  // D-4 / D-6 — an unreadable stored plan whose prompt key holds a prompt
  const corrupt = JSON.stringify({ ...blank(), positions: [null] });
  await seed(corrupt, [], OWN);
  T("D-4a: SETUP — an unreadable stored plan shows the landing screen", !!btn(/start fresh/i));
  await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
  for (let i = 0; i < 3; i++) await flush();
  T("D-6: over an unreadable stored plan, the landing \"Use example data\" leaves its prompt key alone (it stores nothing)", raw("prompt") === OWN, String(raw("prompt")).slice(0, 40));
  await seed(corrupt, [], OWN);
  await click(btn(/start fresh/i)); for (let i = 0; i < 3; i++) await flush();
  if (POST) T("D-4: Start Fresh over an unreadable stored plan leaves no prompt key behind (the old plan's would come back on the next visit)", raw("prompt") === null, String(raw("prompt")).slice(0, 40));
  else T(`D-4 ${KD}: Start Fresh's "erases your currently saved plan" leaves the old prompt key`, raw("prompt") === OWN);

  // D-5 — a plan saved through v6.21 with the example's facts (its own holdings)
  const baked = { ...blank(), nameA: "Fay", nameB: "Gus", positions: [{ ticker: "VTI", name: "Total Market", balance: 500000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" }],
    household: 500000, total401k: 500000, dobA: "1964-01-01", dobB: "1966-01-01", lifeExpA: 80, lifeExpB: 87, retireYear: 2030,
    stateName: "Florida", stateTaxRate: 0, stateCode: null, homeValue: 450000, mortgageBal: 120000, mortgageRate: 4.25 };
  await seed(baked, [], "RETIREMENT ANALYSIS CONTEXT — Fay & Gus");
  const before = raw("portfolio");
  await go("my data");
  const nt = q("[data-dc-example-facts-notice]");
  if (POST) T("D-5: a plan with its own holdings and the example's facts is told so in My Data, naming all three groups",
    !!nt && /dates of birth/.test(nt.textContent) && /\$450,000/.test(nt.textContent) && /Florida, with no state chosen/.test(nt.textContent), nt ? nt.textContent.slice(0, 200) : "no notice");
  else T(`D-5 ${KD}: such a plan carries the example's facts with nothing said`, !nt);
  T("D-5b: the notice changes nothing stored", raw("portfolio") === before);
  await seed({ ...baked, dobA: "1970-02-02", dobB: "1971-03-03", lifeExpA: 91, lifeExpB: 93, stateName: "Ohio", stateCode: "OH", stateTaxRate: 0.03, homeValue: 300000, mortgageBal: 0, mortgageRate: 0 }, [], undefined);
  await go("my data");
  T("D-5c: a plan with its own facts shows no such notice", !q("[data-dc-example-facts-notice]"));

  // E-2 (rendered) — the banner for a plan with no income blocks
  await seed({ ...blank(), nameA: "Hal", nameB: "Ida", _incomeFromForm: false, incomeSources: {} }, [], undefined);
  if (POST) T("E-2r: the banner says the plan has no income figures and pays none, naming them",
    /NO INCOME FIGURES IN THIS PLAN, SO NONE IS PAID/.test(txt()) && /Hal Social Security/.test(txt()) && !/USING EXAMPLE NUMBERS/.test(txt()));
  else T(`E-2r ${KD6}: the banner says the example's numbers were filled in`, /USING EXAMPLE NUMBERS, NOT YOUR DATA/.test(txt()));

  // A-9 / F — backups through My Data's import
  const own = { ...wizard(), nameA: "Lu", nameB: "Max" };
  const backup = o => JSON.stringify(o);
  await seed(own, [], "RETIREMENT ANALYSIS CONTEXT — Lu & Max");
  await go("my data");
  await importFile(backup({ portfolio: { ...own, nameA: "Nia" }, expenses: [], masterPrompt: { steer: "the assistant" } }));
  if (POST) T("A-9a: a backup whose prompt is not a string stores no prompt key (memory holds none, so storage holds none)", raw("prompt") === null, String(raw("prompt")).slice(0, 40));
  else T(`A-9a ${KD}: the raw object is handed to storage`, raw("prompt") !== null && raw("prompt") !== "RETIREMENT ANALYSIS CONTEXT — Lu & Max", String(raw("prompt")).slice(0, 40));
  await go("my data");
  await importFile(backup({ portfolio: { ...own, nameA: "Ola" }, expenses: [], masterPrompt: "RETIREMENT ANALYSIS CONTEXT — Ola\n" + "y".repeat(30000) }));
  if (POST) T("A-9b: an over-long prompt is stored as the loader cut it", (raw("prompt") || "").length === DG.MASTER_PROMPT_MAX_CHARS(), (raw("prompt") || "").length);
  else T(`A-9b ${KD}: the over-long prompt is stored as given`, (raw("prompt") || "").length > DG.MASTER_PROMPT_MAX_CHARS(), (raw("prompt") || "").length);
  await go("my data");
  const pBefore = raw("portfolio");
  await importFile(backup({ portfolio: { ...own, nameA: "Pip" }, masterPrompt: "RETIREMENT ANALYSIS CONTEXT — Pip" }));
  if (POST) T("F-1: a backup with no expense table is refused with the plain message, and nothing is loaded or stored",
    /no expense table/.test(errShown()) && raw("portfolio") === pBefore, errShown().slice(0, 120));
  else T(`F-1 ${KD7}: a backup with no expense table is loaded, keeping the table already held`, !/no expense table/.test(errShown()) && raw("portfolio") !== pBefore);
  await go("my data");
  await importFile(backup({ portfolio: { ...own, nameA: "Quin" }, expenses: [], masterPrompt: "RETIREMENT ANALYSIS CONTEXT — Quin" }));
  T("F-2: a backup with an empty expense table is accepted", (stored("portfolio") || {}).nameA === "Quin", (stored("portfolio") || {}).nameA);
  await unmount();
}

finished = true;
console.log(`\nt85 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
