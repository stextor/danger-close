// t90_grade_findings.mjs — v6.27 (F-22; docs/SCOPE_F22_GRADE_FINDINGS_V627.md): the Grade tab reports the model's grading, not actions.
//
// WHAT IT PINS. Through v6.26 the Grade tab printed "PATH TO {grade} — RECOMMENDED ACTIONS": directives (hybrid LTC insurance "for both
// spouses" on single plans too; a Roth ladder "filling the 22% bracket" on every plan), grade lifts the grading cannot produce (the LTC and
// Tax grades are literals), a misstated estate lift, and a "projected" Monte Carlo success that no simulation computed. Its categories said
// every plan holds hybrid LTC insurance, blamed the 6-year Monte Carlo's failures on an LTC shock that engine does not carry, and showed the
// example household's own choices to everyone. Three grades are literals and one is keyed to two fixed expense labels ("golf", "Amazon"), which caps every
// plan at B+, and the tab said none of it. The Field Manual described a radar chart that does not exist. From v6.27 the panel is gone, the
// sentences are corrected, the fixed grades and the ceiling are labelled, and no grade moves (DG-1 to DG-4, all (a)).
//
// Both legs: node t90_grade_findings.mjs v626 | node t90_grade_findings.mjs v627. The v6.26 leg pins each defect as a dated
// [KNOWN DEFECT 2026-10-21, F-22]. The v6.27 leg spawns the v6.26 leg once with --dump and compares every plan's overall grade, GPA and
// category grades with its own (§B-8: no grade moves). Math.random is seeded BEFORE the bundle loads and re-seeded before each plan (t11's
// TRAP 1), so both processes draw the same paths. Controls: qa/tools/controls_v627_grade.py (repo-only).
// What no test can show: whether the copy that remains reads as advice to a person — the release had it read once by an independent agent.
// Exits with process.exit (the app leaves timers).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v628";
const DUMP = process.argv.includes("--dump");
const KNOWN_VERSIONS = ["v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640"].includes(VER);   // an array, so the next registration widens it
const KD = "[KNOWN DEFECT 2026-10-21, F-22 — flips at v6.27]";

// ── TRAP 1 (t11's; do not "simplify" away): seed Math.random BEFORE the bundle loads — d3-random captures it at module load ──
let _s = 123456789;
Math.random = () => { _s = (1103515245 * _s + 12345) % 2147483648; return _s / 2147483648; };
const reseed = () => { _s = 123456789; };

const require = createRequire(import.meta.url);
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;   // the self-hosted branch

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 300) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t90 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });

const noop = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => "" });
window.fetch = noop; globalThis.fetch = noop;
window.confirm = () => true;
const PREFIX = "dc:";
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
window.URL.createObjectURL = () => "blob:t90"; window.URL.revokeObjectURL = () => {}; globalThis.URL.createObjectURL = () => "blob:t90"; globalThis.URL.revokeObjectURL = () => {};
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();

// ── the source, by AST ─────────────────────────────────────────────────────────────────────────────
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module" });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc") continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = []) => { if (pred(root)) out.push(root); for (const c of kids(root)) all(c, pred, out); return out; };
const topDecl = name => AST.body.flatMap(s => s.type === "VariableDeclaration" ? s.declarations : []).find(d => d.id && d.id.name === name);
const DOCS = (() => { const d = topDecl("DOCS_HTML"); return d && d.init.type === "Literal" ? d.init.value : ""; })();
// the Grade render: the right side of `activeTab === "grade" && current && (…)`
const GRADE = (() => {
  const hits = all(AST, n => n.type === "LogicalExpression" && n.operator === "&&" && n.left.type === "LogicalExpression"
    && n.left.left.type === "BinaryExpression" && n.left.left.right && n.left.left.right.value === "grade" && n.left.left.left.name === "activeTab");
  return hits.length === 1 ? hits[0].right : null;
})();
const strings = root => all(root, n => (n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateElement" || n.type === "JSXText")
  .map(n => n.type === "Literal" ? n.value : n.type === "TemplateElement" ? (n.value.cooked || "") : n.value);
const idents = root => new Set(all(root, n => n.type === "Identifier").map(n => n.name));
const propOf = (obj, name) => obj && obj.type === "ObjectExpression" ? obj.properties.find(p => p.type === "Property" && ((p.key.name || p.key.value) === name)) : null;
const declIn = (root, name) => all(root, n => n.type === "VariableDeclarator" && n.id && n.id.name === name)[0] || null;
const fnIn = (root, name) => all(root, n => n.type === "FunctionDeclaration" && n.id && n.id.name === name)[0] || null;
const leaves = n => !n ? [] : n.type === "ConditionalExpression" ? [...leaves(n.consequent), ...leaves(n.alternate)] : [n];

console.log(`  A — the Grade render, by AST (${VER})`);
T("A-0: SETUP — exactly one Grade render, and the Field Manual is read", !!GRADE && DOCS.length > 100000, `${!!GRADE} / ${DOCS.length}`);
const GSTR = GRADE ? strings(GRADE) : [], GID = GRADE ? idents(GRADE) : new Set();
const has = re => GSTR.some(s => re.test(s));
const PANEL_IDS = ["improvements", "gpaLift", "projectedGPA", "projGrade", "projColor"];
const PANEL_TXT = [/RECOMMENDED ACTIONS/, /Secure hybrid LTC/, /Execute Roth conversion ladder/, /fill 22% bracket each year/, /Projected MC success/, /Remaining risk to A/, /Full A requires/, /MED \(underwriting\)/, /LOW \(calendar\)/, /MED \(attorney\)/];
const FALSE_TXT = [/Hybrid LTC insurance/, /runs through the LTC policy/, /top driver of Monte Carlo failures/, /LTC shock scenarios pull left tail/, /well-designed/, /intentionally reduced/,
  /Realistic cut pool/, /dining frequency/, /advisor-managed/, /share classes/, /Roth conversion plan:/, /the actions above/, /convexity/, /whenever a cut is needed/,
  /Allocation is not graded/];   // the last: v6.27's own first wording, false (Sequence Protection reads the cash-and-bond share) — the build review
if (POST) {
  T("A-1: none of the panel's identifiers remains in the Grade render", PANEL_IDS.every(n => !GID.has(n)), PANEL_IDS.filter(n => GID.has(n)).join(", "));
  T("A-2: none of the panel's strings remains", PANEL_TXT.every(re => !has(re)), PANEL_TXT.filter(has).map(String).join(", "));
  T("A-3: none of the false or example-only sentences remains", FALSE_TXT.every(re => !has(re)), FALSE_TXT.filter(has).map(String).join(", "));
} else {
  T(`A-1 ${KD}: the panel's identifiers are present`, PANEL_IDS.every(n => GID.has(n)));
  T(`A-2 ${KD}: the panel's directives are present`, [/RECOMMENDED ACTIONS/, /Secure hybrid LTC/, /Execute Roth conversion ladder/, /Projected MC success/].every(has));
  T(`A-3 ${KD}: the category text claims an LTC policy and blames LTC for the MC's failures`, [/Hybrid LTC insurance/, /top driver of Monte Carlo failures/, /LTC shock scenarios pull left tail/, /intentionally reduced/].every(has));
}

// the categories, read from the source: name, weight, the object, and its grade/gpa (literal or not)
const CATS = (() => {
  const d = GRADE && declIn(GRADE, "categories");
  if (!d || d.init.type !== "ArrayExpression") return [];
  return d.init.elements.map(el => {
    let obj = el, scope = el;
    if (el.type === "CallExpression") { const body = el.callee.body; const ret = body && body.type === "BlockStatement" ? all(body, n => n.type === "ReturnStatement").find(r => r.argument && r.argument.type === "ObjectExpression") : null; obj = ret ? ret.argument : null; scope = el.callee.body; }
    const name = propOf(obj, "name") && propOf(obj, "name").value.value;
    const weight = propOf(obj, "weight") && propOf(obj, "weight").value.value;
    const g = propOf(obj, "grade"), p = propOf(obj, "gpa");
    const fixed = !!(propOf(obj, "fixed") && propOf(obj, "fixed").value.value === true);
    const labelKeyed = !!(propOf(obj, "labelKeyed") && propOf(obj, "labelKeyed").value.value === true);
    // every gpa this category can take: its own gpa property's leaves, or a spread object's (…scoreMC(), …_sg, …_cg), or an identifier's declaration
    let gpaLeaves = [];
    const collect = node => { for (const l of leaves(node)) {
      if (l.type === "Literal" && typeof l.value === "number") gpaLeaves.push(l.value);
      else if (l.type === "Identifier") { const dd = declIn(scope, l.name) || declIn(GRADE, l.name); if (dd) collect(dd.init); }
      else if (l.type === "ObjectExpression") { const pp = propOf(l, "gpa"); if (pp) collect(pp.value); } } };
    if (p) collect(p.value);
    else for (const sp of obj ? obj.properties.filter(x => x.type === "SpreadElement") : []) {
      const a = sp.argument;
      if (a.type === "CallExpression" && a.callee.type === "Identifier") { const f = fnIn(GRADE, a.callee.name); if (f) for (const r of all(f, n => n.type === "ReturnStatement")) collect(r.argument); }
      else if (a.type === "Identifier") { const dd = declIn(scope, a.name); if (dd) collect(dd.init); }
      else if (a.type === "ObjectExpression") collect(a);   // an inline spread, { grade: "A-", gpa: 3.7, … } — the "was hardcoded A-" shape
    }
    return { name, weight, fixed, labelKeyed, single: new Set(gpaLeaves).size === 1, gradeLit: !!(g && g.value.type === "Literal"), gpaLit: !!(p && p.value.type === "Literal"), maxGpa: gpaLeaves.length ? Math.max(...gpaLeaves.filter(v => v <= 4)) : NaN, gpaLeaves };
  });
})();
const NAMES = CATS.map(c => c.name);
T("A-4: SETUP — the categories read from the source: nine, each with a name, a weight and a resolvable top GPA",
  CATS.length === 9 && CATS.every(c => c.name && Number.isFinite(c.weight) && Number.isFinite(c.maxGpa)), JSON.stringify(CATS.map(c => [c.name, c.weight, c.maxGpa])));
const LIT = CATS.filter(c => c.gradeLit || c.gpaLit);
T("A-5: SETUP — three categories carry a literal grade (LTC / Tail Risk, Tax Efficiency, Diversification)",
  LIT.map(c => c.name).join("|") === "LTC / Tail Risk|Tax Efficiency|Diversification", LIT.map(c => c.name).join("|"));
if (POST) {
  // EXTINCTION: a hardcoded grade cannot come back unlabelled
  T("A-6: EXTINCTION — every category whose grade or gpa is a literal carries fixed: true, and no computed one does", CATS.every(c => (c.gradeLit || c.gpaLit) === c.fixed),
    CATS.filter(c => (c.gradeLit || c.gpaLit) !== c.fixed).map(c => c.name).join(", "));
  // the build review's mutant: a hardcoded grade through a spread ({ ...{ grade: "A-", gpa: 3.7 } }) has no literal grade property, but one GPA
  T("A-6b: EXTINCTION — every category that can take only ONE GPA, however it is written (a property, a spread, a declaration), carries fixed: true",
    CATS.every(c => c.single === c.fixed), CATS.filter(c => c.single !== c.fixed).map(c => `${c.name} [${[...new Set(c.gpaLeaves)]}]`).join(", "));
  T("A-7: Guardrail Readiness, graded from two fixed expense labels, carries labelKeyed: true (and nothing else does)",
    CATS.filter(c => c.labelKeyed).map(c => c.name).join("|") === "Guardrail Readiness");
} else {
  T(`A-6 ${KD}: the literal grades carry no label`, LIT.every(c => !c.fixed));
}
// the ceiling: every category at its top GPA (a literal at its own value), through the overall ladder
const W = CATS.reduce((s, c) => s + c.weight, 0);
const CEIL = CATS.reduce((s, c) => s + c.maxGpa * c.weight, 0) / W;
const ladder = g => g >= 3.7 ? "A-" : g >= 3.3 ? "B+" : g >= 3.0 ? "B" : g >= 2.7 ? "B-" : g >= 2.3 ? "C+" : "C";
if (POST) {
  // the $0 branch of the Roth line, and its years from the SELECTED retirement year (the fixtures' selected year equals the target, so render cannot tell)
  const conv = GRADE ? all(GRADE, n => n.type === "ConditionalExpression" && n.test.type === "BinaryExpression" && n.test.left.name === "rothAmount" && n.test.operator === ">") : [];
  T("A-9: the Roth line's $0 branch says no conversions are modeled", conv.length === 1 && conv[0].alternate.type === "Literal" && conv[0].alternate.value === "Roth slider at $0 — no conversions modeled.",
    conv.map(c => c.alternate.value).join(" | "));
  T("A-10: the Roth line's years start at the selected retirement year (retireYear), not the plan's target (rothLadderStart)",
    conv.length === 1 && conv[0].consequent.type === "TemplateLiteral" && conv[0].consequent.expressions.some(e => e.type === "Identifier" && e.name === "retireYear")
      && !conv[0].consequent.expressions.some(e => e.type === "MemberExpression" && e.property.name === "rothLadderStart"));
}
T(`A-8: SETUP — the scoring's ceiling, derived from the source, is ${CEIL.toFixed(3)} (${ladder(CEIL)}) out of weight ${W}`, Number.isFinite(CEIL) && W === 78, `${CEIL} / ${W}`);

// ── the DOM harness ──────────────────────────────────────────────────────────────────────────────
const body = () => window.document.body;
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root = null, act, DangerClose, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); reseed();
  if (portfolio !== undefined) put("portfolio", portfolio); if (expenses !== undefined) put("expenses", expenses); await render(); };
const save = async () => { await go("my data"); await click(btn(/SAVE\s*&\s*APPLY/)); for (let i = 0; i < 4; i++) await flush(); await flush(300); };
const card = () => { const c = [...body().querySelectorAll(".card")].find(x => /PORTFOLIO GRADE/.test(x.textContent || "")); return c ? c.textContent.replace(/\s+/g, " ") : ""; };
const waitCard = async () => { for (let i = 0; i < 300 && !card(); i++) await flush(200); return card(); };

// fixtures (t89's builders)
const blank = () => ({ asOf: "2026-10-20", single: false, nameA: "", nameB: "", positions: [], otherAccounts: [], total401k: 0, household: 0,
  bucketActuals: { 1: 0, 2: 0, 3: 0, 4: 0 },
  contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  incomeSources: { ssA: { tableByAge: {}, planned: 0, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 0 } },
  _incomeFromForm: true, homeMoveCash: 0, carRowsV621: true, workRowsV623: true });
const filled = () => ({ ...blank(), nameA: "Ann", nameB: "Bo", dobA: "1965-06", dobB: "1967-06", retireYear: 2031, retireYearB: 2031, lifeExpA: 90, lifeExpB: 92,
  stateName: "Ohio", stateCode: "OH", stateTaxRate: 0.03, total401k: 900000, household: 1000000,
  positions: [{ ticker: "VTI", name: "Total Market", balance: 600000, bucket: 3, type: "equity-lb", taxType: "trad", owner: "A", planType: "ira" },
              { ticker: "BND", name: "Total Bond", balance: 300000, bucket: 2, type: "bond", taxType: "trad", owner: "B", planType: "employer" }],
  otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "joint", taxType: "taxable" }],
  incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 1600, plannedAge: 67 }, pension: { amount: 900 } },
  incomeStreams: [{ id: "s1", label: "Rental", kind: "rental", owner: "joint", monthly: 1200, startYear: 2026, endYear: 2045, cola: true, tax: "taxable" }] });
const single = () => ({ ...filled(), single: true, nameB: "", dobB: "", incomeSources: { ssA: { tableByAge: {}, planned: 2800, plannedAge: 67 }, ssB: { tableByAge: {}, planned: 0, plannedAge: 67 }, pension: { amount: 900 } } });
const EXP = [{ category: "Living", label: "Household", amount: 6000, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const EXP_LTC = [...EXP, { category: "Insurance", label: "LTC premium", amount: 300, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];
const EXP_HI = [{ category: "Living", label: "Household", amount: 8500, startDate: "2026-01", endDate: "2060-12", kind: "monthly" }];

// ── reading a rendered card ──────────────────────────────────────────────────────────────────────
const readCard = t => {
  const m = t.match(/Overall grade([A-D][+-]?)GPA: (\d\.\d\d) \/ 4\.00/);
  const det = (() => { const a = t.indexOf("Category detail"), b = t.indexOf("Top grade drags"); return a >= 0 ? t.slice(a, b > a ? b : undefined) : ""; })();
  const cats = {};
  NAMES.forEach((n, i) => {
    const a = det.indexOf(n + "Weight:"); if (a < 0) return;
    const nx = i + 1 < NAMES.length ? det.indexOf(NAMES[i + 1] + "Weight:", a) : -1;
    let seg = det.slice(a, nx > a ? nx : undefined).replace(/[A-D][+-]?$/, "");
    const g = (det.slice(Math.max(0, a - 2), a).match(/([A-D][+-]?)$/) || [])[1];
    const gp = (seg.match(/GPA: (\d\.\d)/) || [])[1];
    cats[n] = { grade: g, gpa: gp ? Number(gp) : NaN, seg };
  });
  return { grade: m && m[1], gpa: m ? Number(m[2]) : NaN, cats, text: t };
};
const PLANS = [
  ["example", async () => { await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); for (let i = 0; i < 3; i++) await flush(); }],
  ["couple", async () => { await seed(filled(), EXP); await save(); }],
  ["single", async () => { await seed(single(), EXP); await save(); }],
  ["couple+LTC", async () => { await seed(filled(), EXP_LTC); await save(); }],
  ["low", async () => { await seed(filled(), EXP_HI); await save(); }],
];
const R = {};
for (const [name, build] of PLANS) { await build(); await go("grade"); await flush(300); R[name] = readCard(await waitCard()); }
const summary = Object.fromEntries(Object.entries(R).map(([k, r]) => [k, { grade: r.grade, gpa: r.gpa, cats: Object.fromEntries(Object.entries(r.cats).map(([n, c]) => [n, c.grade + "/" + c.gpa])) }]));
if (DUMP) { console.log("DUMP:" + JSON.stringify(summary)); finished = true; process.exit(0); }

console.log("  B — rendered, five plans");
T("B-0: SETUP — every plan rendered a Grade card with an overall grade and all nine categories",
  Object.values(R).every(r => r.grade && Number.isFinite(r.gpa) && NAMES.every(n => r.cats[n] && r.cats[n].grade && Number.isFinite(r.cats[n].gpa))),
  JSON.stringify(Object.fromEntries(Object.entries(R).map(([k, r]) => [k, [r.grade, r.gpa, Object.keys(r.cats).length]]))));
const lowRate = Number((R.low.text.match(/(\d+\.\d)% of 10K iterations/) || [])[1]);
T(`B-0b: FIXTURE GATE — the "low" plan's success rate is under 90% (${lowRate}%), so the Monte Carlo drag's below-90% branch renders; without this B-4 is vacuous`, lowRate < 90, lowRate);
const allText = Object.values(R).map(r => r.text);
if (POST) {
  T("B-1: no plan shows the panel — no RECOMMENDED ACTIONS, no Projected figure, no GPA lift, no 'Remaining risk to A'",
    allText.every(t => !/RECOMMENDED ACTIONS|Projected|Gpa lift|Remaining risk to A|Full A requires|Secure hybrid|Execute Roth/i.test(t)));
  T("B-2: the LTC evidence follows the plan's expenses — a row in the example and couple+LTC, none in the couple, the single plan and low",
    /An LTC \/ long-term-care line is in your expenses/.test(R.example.cats["LTC / Tail Risk"].seg) && /An LTC \/ long-term-care line is in your expenses/.test(R["couple+LTC"].cats["LTC / Tail Risk"].seg)
    && ["couple", "single", "low"].every(k => /No LTC \/ long-term-care line is in your expenses/.test(R[k].cats["LTC / Tail Risk"].seg)),
    R.couple.cats["LTC / Tail Risk"].seg.slice(0, 160));
  T("B-2b: no plan is told it holds an LTC policy", allText.every(t => !/Hybrid LTC insurance|LTC policy and cash/.test(t)));
  T("B-3: the single plan reads no spouse — no 'both spouses', no 'each spouse'", !/both spouses|each spouse/.test(R.single.text), (R.single.text.match(/.{40}(both|each) spouse.{20}/) || [""])[0]);
  T("B-3b: a couple's LTC drag names the shock for each spouse", /shock for each spouse/.test(R.couple.cats["LTC / Tail Risk"].seg));
  T("B-4: the below-90% Monte Carlo drag says this engine carries no LTC event, and no drag blames LTC for this rate's failures",
    /carries no long-term-care event/.test(R.low.cats["Monte Carlo Success"].seg) && allText.every(t => !/LTC shock scenarios|top driver of Monte Carlo failures/.test(t)), R.low.cats["Monte Carlo Success"].seg.slice(0, 200));
  T("B-5: the three literal grades carry the fixed label, and Guardrail Readiness the fixed-labels one, on every plan",
    Object.values(R).every(r => ["LTC / Tail Risk", "Tax Efficiency", "Diversification"].every(n => /Fixed in this build — not computed from your plan/.test(r.cats[n].seg))
      && /Graded from two fixed expense labels/.test(r.cats["Guardrail Readiness"].seg)
      && ["Monte Carlo Success", "Income Floor", "Sequence Protection", "Cost Structure", "Estate Readiness"].every(n => !/Fixed in this build|Graded from two fixed/.test(r.cats[n].seg))));
  T(`B-5b: the ceiling is stated under the overall grade and in the footnote, and it is the source's own (${ladder(CEIL)})`,
    Object.values(R).every(r => r.text.includes(`Highest any plan can score here: ${ladder(CEIL)}`) && r.text.includes(`the highest overall grade any plan can reach is ${ladder(CEIL)}`)));
  T("B-5c: the footnote explains both marks", Object.values(R).every(r => /† Fixed in this build — the same grade for every plan/.test(r.text) && (["v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638", "v639", "v640"].includes(VER) ? /‡ Graded from the first expense row labelled “golf” and the first labelled “Amazon” \(any case\)/ : /‡ Graded from expense rows labelled exactly “golf” and “Amazon”/).test(r.text)));
  T("B-9: the equity share stays, as a fact, and says what IS graded (Sequence Protection reads the cash-and-bond share)",
    Object.values(R).every(r => /Current equity share\d+\.\d%Of retirement accounts, as held\. The equity share is not graded on its own; Sequence Protection reads the cash-and-bond share\./.test(r.text)));
  T("B-10: no plan shows the false or example-only sentences", FALSE_TXT.every(re => allText.every(t => !re.test(t))), FALSE_TXT.filter(re => allText.some(t => re.test(t))).map(String).join(", "));
  T("B-11: Tax Efficiency names the plan's own Roth slider ($70K/yr, the default), from the retirement year the tab shows",
    Object.values(R).every(r => { const y = (r.text.match(/PORTFOLIO GRADE — RETIRE (\d{4})/) || [])[1]; return !!y && new RegExp(`Roth slider: \\$70K/yr, ${y}–\\d{4}\\.`).test(r.cats["Tax Efficiency"].seg); }));
  // Top grade drags carries the grade list's marks: a fixed grade's lost points are not the plan's (the build review)
  const drags = r => { const a = r.text.indexOf("Top grade drags"); return a >= 0 ? r.text.slice(a, a + 3000) : ""; };
  T("B-12: SETUP — the example ranks LTC / Tail Risk among its top drags", /LTC \/ Tail Risk/.test(drags(R.example)));
  T("B-12b: in Top grade drags, a fixed grade carries † and the label-keyed one ‡, on every plan",
    Object.values(R).every(r => { const d = drags(r); return !/LTC \/ Tail Risk \(|Tax Efficiency \(|Diversification \(|Guardrail Readiness \(/.test(d); }),
    drags(R.example).slice(0, 200));
  T("B-13: no plan without hedges is told about hedge holdings", Object.values(R).every(r => !/Hedge holdings/.test(r.cats["Sequence Protection"].seg)));
} else {
  T(`B-1 ${KD}: every plan shows the panel and its projected figures`, allText.every(t => /RECOMMENDED ACTIONS/.test(t) && /Projected MC success/.test(t)));
  T(`B-2 ${KD}: every plan is told it holds hybrid LTC insurance`, allText.every(t => /Hybrid LTC insurance active/.test(t)));
  T(`B-3 ${KD}: the single plan is told to insure "both spouses"`, /both spouses/.test(R.single.text));
  T(`B-4 ${KD}: the below-90% drag blames an LTC shock this engine does not carry`, /LTC shock scenarios pull left tail/.test(R.low.cats["Monte Carlo Success"].seg));
  T(`B-5 ${KD}: no grade is labelled fixed, and no ceiling is stated`, allText.every(t => !/Fixed in this build|Highest any plan/.test(t)));
  const pm = R.example.text.match(/Projected MC success~(\d+)–\d+%From (\d+)%/);
  T(`B-6b ${KD}: the example's "projected" success is below its current one`, !!pm && Number(pm[1]) < Number(pm[2]), (R.example.text.match(/Projected MC success.{0,30}/) || [""])[0]);
}
// both legs: the computed parts
T("B-6: Top grade drags is present on every plan", allText.every(t => /Top grade drags — where points are lost/.test(t)));
T("B-7: each plan's overall GPA is the weight-averaged GPA of its nine rendered categories — no hidden lift",
  Object.values(R).every(r => Math.abs(NAMES.reduce((s, n, i) => s + r.cats[n].gpa * CATS[i].weight, 0) / W - r.gpa) < 0.006),
  JSON.stringify(Object.fromEntries(Object.entries(R).map(([k, r]) => [k, [r.gpa, (NAMES.reduce((s, n, i) => s + r.cats[n].gpa * CATS[i].weight, 0) / W).toFixed(3)]]))));
T("B-7b: the three literal grades render at their v6.26 values on every plan (C+ 2.3, B+ 3.3, B+ 3.3)",
  Object.values(R).every(r => r.cats["LTC / Tail Risk"].grade === "C+" && r.cats["LTC / Tail Risk"].gpa === 2.3 && r.cats["Tax Efficiency"].grade === "B+" && r.cats["Tax Efficiency"].gpa === 3.3
    && r.cats["Diversification"].grade === "B+" && r.cats["Diversification"].gpa === 3.3));
T("B-7c: no plan's overall grade exceeds the scoring's ceiling", Object.values(R).every(r => r.gpa <= CEIL + 1e-9));
if (POST) {
  // B-8: no grade moves — the previous registered leg, same seed, same plans, in its own process.
  // v6.28: the prior is the tag before VER in KNOWN_VERSIONS (it was pinned to "v626", so the v6.28 leg would have spawned a v6.26 leg that a
  // v627 → v628 run folder does not hold — the prior-pinned shape t89 A-7 was repaired for at v6.27). Where that leg is absent the check
  // takes a designed, printed skip: a run folder holds two legs, so the older leg's own B-8 cannot run.
  const prior = KNOWN_VERSIONS[KNOWN_VERSIONS.indexOf(VER) - 1];
  if (!prior || !existsSync(join(HERE, `dom_${prior}.cjs`)) || !existsSync(join(HERE, "..", `${prior}.jsx`))) console.log(`  ~ B-8 skipped by design: the ${prior || "previous"} leg is not in this run folder (it runs on the newer leg of a pair)`);
  else {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), prior, "--dump"], { cwd: HERE, encoding: "utf8", maxBuffer: 1 << 24, timeout: 900000 });
    const line = (r.stdout || "").split("\n").find(l => l.startsWith("DUMP:"));
    const prev = line ? JSON.parse(line.slice(5)) : null;
    T(`B-8: SETUP — the ${prior} leg dumped its five plans`, !!prev && Object.keys(prev).length === 5, (r.stdout || "").slice(-300) + (r.stderr || "").slice(-200));
    if (prev) for (const k of Object.keys(summary))
      T(`B-8 (${k}): no grade moves — overall ${summary[k].grade} ${summary[k].gpa} and every category grade equal ${prior}'s`, JSON.stringify(summary[k]) === JSON.stringify(prev[k]),
        `${JSON.stringify(prev[k])} → ${JSON.stringify(summary[k])}`);
  }
}

// ── §C · the Field Manual ──────────────────────────────────────────────────────────────────────────────
console.log("  C — the Field Manual");
const GE = (() => { const a = DOCS.indexOf("<h3>Grade <span"); const b = DOCS.indexOf('<div class="tabentry">', a); return a >= 0 ? DOCS.slice(a, b > a ? b : a + 4000) : ""; })();
T("C-0: SETUP — the Field Manual's Grade entry is found", GE.length > 100, GE.length);
if (POST) {
  T("C-1: the Grade entry describes no radar chart", !/radar/i.test(GE));
  T("C-2: it names every category the source grades", NAMES.every(n => GE.toLowerCase().includes(n.toLowerCase())), NAMES.filter(n => !GE.toLowerCase().includes(n.toLowerCase())).join(", "));
  T("C-3: it names the three fixed grades at their values, the golf/Amazon rule and the ceiling",
    /LTC \/ tail risk \(C\+\)/.test(GE) && /tax efficiency \(B\+\)/.test(GE) && /diversification \(B\+\)/.test(GE) && /labelled exactly “golf” and “Amazon”, so a plan without them grades B-\./.test(GE)
      && !/whenever a cut is needed/.test(GE) && GE.includes(`the highest overall grade any plan can reach is ${ladder(CEIL)}`));
  T("C-4: it says the success rate is the 6-year Monte Carlo's, which carries no long-term-care event", /6-year Monte Carlo/.test(GE) && /no long-term-care event/.test(GE));
  T("C-5: it says the tab is the model's grading, not a plan of action, and that the removed figures came from neither the grading nor a simulation",
    /not a plan of action/.test(GE) && /none of them came from the grading or a simulation/.test(GE));
  T("C-6: §13 records the change (v6.27), first in its release list", /<li><strong>The Grade tab reports the model’s grading, not actions \(v6\.27\)\.<\/strong>/.test(DOCS)
    && DOCS.indexOf("not actions (v6.27)") < DOCS.indexOf("every plan (v6.26)"));
} else {
  T(`C-1 ${KD}: the Grade entry describes a radar chart`, /radar chart/.test(GE));
}

finished = true;
console.log(`t90 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
