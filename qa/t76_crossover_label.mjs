// t76 — THE BREAK-EVEN CARD SAYS WHAT IT MEASURES (C-11) · C-9 STAYS EXTINCT · v6.13 MOVED TEXT ONLY
// Run: node t76_crossover_label.mjs v613   |   node t76_crossover_label.mjs v612
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_C11_CROSSOVER_LABEL_V613.md). The Roth tab's break-even card compares the slider strategy with
// NO CONVERSIONS on `wealthByYr` — taxable + Roth + Traditional at FACE VALUE (runRothStrategies; Traditional dollars counted before the
// tax still owed on them), deliberately so (AUDIT_2D, v5.28). Through v6.12 the card's "recovered" sentence, the Field Manual's Roth entry
// and METHODOLOGY's crossover section all called that sum "after-tax wealth" (C-11, open since the v5.73 audit). The example household
// never shows the recovered outcome (§K1 row `crossover`, t29 B-10), so the sentence was invisible there.
// Also here: C-9 — the annuity share fixed at retirement start, so RMDs crept up as the pool drained — was FIXED at v6.07 by D-33, which
// did not cite it. §C is its extinction check: with no draws, an annuity changes no RMD, in any year, in any engine.
//
// GATED PER LEG (OPERATIONS §B2). The v6.12 leg pins C-11's text as dated [KNOWN DEFECT] checks; §C holds on both legs (fixed since v6.07).
// §B reads the run folder's one METHODOLOGY.md, so it runs on the post-fix leg only; §D needs both sources and runs for the v6.12 → v6.13
// pair only (a designed skip on every other leg, printed).
// PRECISION: §C is to the cent (Engines B/C) and within $1 (Engine A's rounded end balance). §E reads the rendered card through
// `window.__g` — the DOM bundle carries its OWN copy of the app module (OPERATIONS §C) — behind setup checks that the household rendered
// is the one compared.
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v613";
const KNOWN_VERSIONS = ["v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"].includes(VER);   // an array, so the next registration widens it
// v6.18 (D-41): Engine A taxes the spending draw it gets from the bridge, and that draw moved with Engine D's year-by-year spending read —
// so the recovered crossover in §E moved a year (2062 → 2061). PIN18 picks the v6.18 figure; the v6.18 leg is ALSO run with
// DC_V617_SPENDING=1, where §E's households load v6.17's spending as a table (qa/tools/v617_spending.mjs) and the v6.17 figure must
// come out exactly.
const POST_D41 = ["v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635"].includes(VER);   // an array, so the registrar widens it
const SPEND17 = POST_D41 && process.env.DC_V617_SPENDING === "1";
const PIN18 = POST_D41 && !SPEND17;
const { v617Table } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "tools", "v617_spending.mjs")).href);
if (SPEND17) console.log("  (DC_V617_SPENDING=1 — §E on v6.17's spending, as a table: the v6.17 figure must come out exactly)");
// §D's pair. Written as two constants, NOT as `VER === "v613"`: the version registrar widens equality tests and arrays, and this
// comparison is true of exactly one pair of builds — widening it would compare v6.14 against v6.12 and call the difference a defect.
const D_PRIOR = "v612", D_CUR = "v613";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const { __g: g, __engines: E } = M;
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
const JP = Parser.extend(jsx());
const parse = src => JP.parse(src, { ecmaVersion: 2022, sourceType: "module", locations: true });
const W = Object.assign({}, walk.base, {
  JSXElement(n, st, c) { c(n.openingElement, st); (n.children || []).forEach(x => c(x, st)); },
  JSXFragment(n, st, c) { (n.children || []).forEach(x => c(x, st)); },
  JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); }, JSXClosingElement() {},
  JSXAttribute(n, st, c) { if (n.value) c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
  JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {},
  JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} });
// Every piece of user-facing text: string literals, template quasis, JSX text — in source order.
const textsOf = ast => { const out = [];
  walk.full(ast, n => {
    if (n.type === "Literal" && typeof n.value === "string") out.push({ kind: "str", v: n.value, line: n.loc.start.line });
    else if (n.type === "TemplateElement") out.push({ kind: "tpl", v: n.value.cooked || "", line: n.loc.start.line });
    else if (n.type === "JSXText") out.push({ kind: "jsx", v: n.value, line: n.loc.start.line });
  }, W);
  return out; };
const AST = parse(SRC), TEXTS = textsOf(AST);
const DOCS = TEXTS.filter(t => t.kind === "str" && t.v.startsWith("<!doctype html>") && t.v.includes("FIELD MANUAL"));

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const clone = o => JSON.parse(JSON.stringify(o));
const usd = n => "$" + Math.round(n).toLocaleString();
const KD = "[KNOWN DEFECT 2026-10-15, C-11 — flips at v6.13]";
const BASE_HH = g.PORTFOLIO().household;   // the shipped example, read before any section loads another household
console.log(`t76 — THE BREAK-EVEN CARD SAYS WHAT IT MEASURES · C-9 EXTINCT (${VER})\n`);

// the sentences, as the scope (§1) fixed them
const CARD_NEW = "First year your strategy's account total — every balance at face value, so Traditional dollars count before the tax still owed on them — catches the NO CONVERSIONS path (deepest earlier shortfall";
const CARD_OLD = "First year your strategy's after-tax wealth catches the NO CONVERSIONS path (deepest earlier shortfall";
const FM_NEW = "the card reports the first year your account total catches up — every balance at face value, so Traditional dollars count before the tax still owed on them, which makes the answer arrive no earlier than an after-tax count would. Discounting and the opportunity cost";
const FM_OLD = "the card reports the first year your after-tax wealth catches up — so discounting and the opportunity cost";
const FM_BLIND = "<li><strong>The additional standard deduction for a blind filer is not modelled.</strong>";

// ── §A · the copy, by AST over this leg's own source ─────────────────────────────────────────────────────────────────────
console.log("  A — the copy (AST)");
{
  const hits = TEXTS.filter(t => /after-tax wealth/i.test(t.v));
  T(POST ? "A-1 [EXTINCTION C-11]: no string, template or JSX text in the app says \"after-tax wealth\""
         : `A-1 ${KD}: "after-tax wealth" appears in exactly two texts — the card and the Field Manual`,
    POST ? hits.length === 0 : hits.length === 2 && hits.some(t => t.kind === "jsx") && hits.some(t => DOCS.includes(t)),
    hits.map(t => `${t.kind}@L${t.line}`).join(", ") || "none");
  const card = TEXTS.filter(t => t.kind === "jsx" && t.v.includes("catches the NO CONVERSIONS path"));
  T(POST ? "A-2: the card's recovered outcome names the measure — account total, at face value, Traditional before the tax owed on it"
         : `A-2 ${KD}: the card's recovered outcome says "after-tax wealth"`,
    card.length === 1 && card[0].v.includes(POST ? CARD_NEW : CARD_OLD), card.map(t => t.v.slice(0, 90)).join(" | "));
  T("A-3a: SETUP — exactly one Field Manual (DOCS_HTML) literal is found", DOCS.length === 1, String(DOCS.length));
  const fm = DOCS[0] ? DOCS[0].v : "";
  T(POST ? "A-3b: the Field Manual's Roth entry names the measure and its direction (DC-3)"
         : `A-3b ${KD}: the Field Manual's Roth entry says "after-tax wealth"`, fm.includes(POST ? FM_NEW : FM_OLD));
  T(POST ? "A-3c: the Field Manual's simplifications list discloses the §63(f) blind amount (DC-5)"
         : "A-3c (prior leg): the blind amount is not yet disclosed", POST ? fm.includes(FM_BLIND) : !fm.includes(FM_BLIND));
  // t31's B-2 control needs "Roth break-even" in the raw manual and NOT on the rendered app — stated here, where an edit could break it.
  const other = TEXTS.filter(t => !DOCS.includes(t) && /roth break-even/i.test(t.v));
  T("A-4: GUARD for t31's control — \"Roth break-even\" stays in the Field Manual and in no other app text",
    /roth break-even/i.test(fm) && other.length === 0, other.map(t => `${t.kind}@L${t.line}`).join(", "));
}

// ── §B · METHODOLOGY (post-fix legs: the run folder holds one METHODOLOGY.md, the current one) ─────────────────────────────
if (POST) {
  console.log("  B — METHODOLOGY");
  const MP = [join(HERE, "..", "METHODOLOGY.md"), join(HERE, "METHODOLOGY.md")].find(existsSync);
  const meth = MP ? readFileSync(MP, "utf8") : "";
  const i = meth.indexOf("## Roth break-even: the wealth-crossover method"), j = i < 0 ? -1 : meth.indexOf("\n## ", i + 5);
  const sec = i < 0 ? "" : meth.slice(i, j < 0 ? undefined : j).replace(/\s+/g, " ");
  T("B-0: SETUP — METHODOLOGY.md found and its crossover section read (heading keeps \"Roth break-even\", which t31 B-0 needs)",
    sec.length > 1500, `${MP || "not found"} · ${sec.length} chars`);
  T("B-1: the section says what the crossover reports — the account total at face value — and no longer \"the strategy's after-tax wealth\"",
    sec.includes("reports the first year the strategy's account total — every balance at face value, Traditional dollars before the tax still owed on them — catches the baseline")
      && !sec.includes("the strategy's after-tax wealth catches the baseline"));
  T("B-2: the direction paragraph is present (face value arrives no earlier than any after-tax count; the 36 cells; C-11 named)",
    sec.includes("**Direction (v6.13).** Face value makes the crossover arrive no earlier than any after-tax count") && sec.includes("all 36 cells") && sec.includes("(C-11)"));
  const flat = meth.replace(/\s+/g, " ");
  T("B-3: the §63(f) blind amount is disclosed beside the age-65 deduction (DC-5)",
    flat.includes("**The §63(f) amount for a blind filer is not modelled (disclosed v6.13).**"));
} else console.log("  B — skipped by design on the prior leg (the run folder's METHODOLOGY.md is the current build's)");

// ── §C · C-9 EXTINCTION: an annuity changes no RMD when nothing draws on the pool (both legs; fixed since v6.07) ───────────
console.log("  C — C-9: the annuity is carried, not a fixed share");
{
  const BASE = clone(g.PORTFOLIO());
  const WITH = { ...BASE, otherAccounts: [...(BASE.otherAccounts || []), { name: "t76 NQ annuity A", balance: 100000, owner: "A", taxType: "annuity" }] };
  const load = p => { g.applyLoadedData({ portfolio: clone(p) }); return g.buildPlanTimeline(); };
  const BC = (p, conv) => { const tl = load(p), ry = tl.targetRetireYear;
    const A = { retireYear: ry, rothAmount: conv, qcdAnnual: 0, taxYield: 0, gainByYr: {}, ordDrawByYr: {} };   // no draws, no gains (C-9's own setup)
    return { rs: g.retireStartBalances(ry), B: E.computeTaxPlan(A).rows, C: E.computeIrmaaPlan(A).rows }; };
  const a0 = BC(BASE, 0), b0 = BC(WITH, 0);
  T("C-0a: PRECONDITION — the annuity sits outside A's RMD base on day one: Traditional +$100,000, RMD base unchanged",
    Math.round(b0.rs.tradInitA - a0.rs.tradInitA) === 100000 && Math.round(b0.rs.rmdInitA) === Math.round(a0.rs.rmdInitA) && a0.rs.rmdInitA > 0,
    `${usd(a0.rs.tradInitA)} → ${usd(b0.rs.tradInitA)}; RMD base ${usd(a0.rs.rmdInitA)} / ${usd(b0.rs.rmdInitA)}`);
  const nRmd = a0.B.filter(r => (r.rmd_y || 0) > 0).length;
  T("C-0b: PRECONDITION — the no-annuity run has at least ten RMD years (the comparison is not vacuous)", nRmd >= 10, String(nRmd));
  let k = 1;
  for (const conv of [0, 70000]) {
    const a = conv ? BC(BASE, conv) : a0, b = conv ? BC(WITH, conv) : b0;
    for (const eng of ["B", "C"]) {
      const bad = a[eng].map((r, i) => [r, b[eng][i]]).filter(([r, s]) => !s || r.yr !== s.yr || Math.abs((s.rmd_y || 0) - (r.rmd_y || 0)) >= 0.005);
      T(`C-${k++} [EXTINCTION C-9]: Engine ${eng} (${eng === "B" ? "Taxes" : "IRMAA"} tab), conversions ${usd(conv)}: the RMD with a $100,000 annuity equals the RMD without, to the cent, in all ${a[eng].length} years`,
        a[eng].length === b[eng].length && bad.length === 0,
        bad.slice(0, 3).map(([r, s]) => `${r.yr}: ${(s ? s.rmd_y : NaN) - r.rmd_y}`).join(", "));
    }
  }
  // Engine A (the strategy comparison): NO CONVERSIONS, no draws, no yield. The annuity is never distributed, so it must ride to the horizon
  // untouched — compounded at Engine A's own growth rate, READ from this leg's source by AST (never typed) — and add no tax at all.
  let GROWTH = null;
  walk.full(AST, n => { if (n.type === "VariableDeclarator" && n.id.name === "BASE_GROWTH" && n.init && n.init.type === "Literal") GROWTH = n.init.value; }, W);
  const runA = p => { const tl = load(p), ry = tl.targetRetireYear;
    const P = { single: !!tl.single, asOfYr: tl.asOfYear, retireYr: ry, horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ladderEnd: tl.rothLadderEnd, dobAYr: tl.dobA.year, dobBYr: tl.dobB.year, deathYr1: Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
      ssA: g.getSSA(), ssB: g.getSSB(), ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month, ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
      pen: g.getPension(), penOwner: g.getPensionOwner(), stateRate: tl.stateTaxRate || 0, stateCode: g.PORTFOLIO().stateCode || null,
      convTaxFunding: "taxable", taxableGainFrac: 0, acaPremium: 0, acaSize: 0, ...g.retireStartBalances(ry),
      ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB, survivor: (tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B",
      taxableInit: g.taxableInitAll(), taxYieldPct: 0, currentConv: 0, ordDrawByYr: {} };
    return { P, r: g.runRothStrategies(P, [{ key: "none", label: "NO CONVERSIONS", policy: { kind: "fixed", amount: 0 } }])[0] }; };
  const ra = runA(BASE), rb = runA(WITH), n = rb.P.horizonYr - rb.P.retireYr + 1;
  // v6.30 (D-60; docs/SCOPE_D60_DOLLAR_UNITS_V630.md): Engine A carries today's balances to the retirement year at the plan's inflation, so the
  // annuity enters retirement as $100,000 × (1+i)^(retire − as-of) — i the module's plan inflation, Σ prob × inflation over its SCENARIOS
  // table — and then compounds untouched. 1 on every earlier leg. An array, so register_tag2 widens it.
  const RB76 = ["v630", "v631", "v632", "v633", "v634", "v635"].includes(VER) ? Math.pow(1 + Object.values(g.SCENARIOS()).reduce((t, sc) => t + sc.prob * sc.inflation, 0), rb.P.retireYr - rb.P.asOfYr) : 1;
  const want = GROWTH === null ? NaN : 100000 * RB76 * Math.pow(1 + GROWTH, n);
  T(`C-${k++} [EXTINCTION C-9]: Engine A — the annuity rides to ${rb.P.horizonYr} untouched: end Traditional exceeds the no-annuity run's by $100,000${RB76 !== 1 ? " × " + RB76.toFixed(5) + " (carried to retirement)" : ""} × (1 + ${GROWTH})^${n}, within $1`,
    GROWTH !== null && Math.abs((rb.r.endTrad - ra.r.endTrad) - want) <= 1, `${usd(rb.r.endTrad - ra.r.endTrad)} vs ${usd(want)}`);
  T(`C-${k++} [EXTINCTION C-9]: Engine A — and adds no tax: lifetime tax identical with and without it`, rb.r.totTax === ra.r.totTax, `${usd(ra.r.totTax)} / ${usd(rb.r.totTax)}`);
  g.applyLoadedData({ portfolio: clone(BASE) });
}

// ── §D · v6.13 moved TEXT ONLY (the v6.12 → v6.13 pair; needs both sources) ──────────────────────────────────────────────
const DP = join(HERE, "..", `${D_PRIOR}.jsx`);
if (VER === D_CUR && existsSync(DP)) {
  console.log("  D — v6.12 → v6.13 changed text only (AST)");
  const PRI = parse(readFileSync(DP, "utf8"));
  const shape = ast => JSON.stringify(ast, (k, v) => {
    if (k === "start" || k === "end" || k === "loc" || k === "raw") return undefined;
    if (v && typeof v === "object" && v.type === "Literal" && typeof v.value === "string") return { type: "Literal", value: "<text>" };
    if (v && typeof v === "object" && v.type === "TemplateElement") return { type: "TemplateElement", tail: v.tail };
    if (v && typeof v === "object" && v.type === "JSXText") return { type: "JSXText" };
    return v; });
  T("D-1: with every string, template quasi, JSX text and comment set aside, the v6.13 AST equals v6.12's — no operator, name, number or structure moved",
    shape(AST) === shape(PRI));
  const tp = textsOf(PRI), tc = TEXTS;
  const diffs = tc.length === tp.length ? tc.map((t, i) => [tp[i], t]).filter(([a, b]) => a.v !== b.v) : null;
  const label = ([, b]) => DOCS.includes(b) ? "Field Manual" : b.v.includes("DATA LOAD") ? "DATA LOAD" : b.v.includes("Not financial advice") ? "footer"
    : b.v.includes("catches the NO CONVERSIONS path") ? "card" : `other@L${b.line}`;
  const got = diffs ? diffs.map(label).sort().join(", ") : `text count ${tp.length} → ${tc.length}`;
  T("D-2: CONTROL — without the mask the builds DO differ, in exactly the four texts the scope names (card, DATA LOAD, footer, Field Manual)",
    got === "DATA LOAD, Field Manual, card, footer", got);
} else console.log(`  D — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only; this leg is ${VER})`);

// ── §E · rendered: the card as the user sees it ─────────────────────────────────────────────────────────────────────────
console.log("  E — the rendered card");
{
  require(`./dom_${VER}.cjs`);
  const { census } = await import(pathToFileURL([join(HERE, "tools", "boundaries.mjs"), join(HERE, "boundaries.mjs")].find(existsSync)).href);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const tabBtn = name => [...body().querySelectorAll("button,div,span")].find(el => (el.textContent || "").trim().toLowerCase() === name);
  await act(async () => { root.render(React.createElement(DangerClose)); }); await flush(); await flush();
  await click([...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0]);
  await flush(); await click(tabBtn("roth")); await flush(); await flush();
  const gd = window.__g;   // the DOM bundle's own module copy — the household the page rendered (OPERATIONS §C)
  const slider = () => [...body().querySelectorAll("input[type=range]")].find(s => s.max === "400000" && s.step === "5000");
  const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const drive = async v => { const s = slider(); await act(async () => { setNative.call(s, String(v)); s.dispatchEvent(new window.Event("input", { bubbles: true })); }); await flush(); await flush(); };
  const card = () => { const h = [...body().querySelectorAll("div")].find(d => d.children.length === 0 && /^BREAK-EVEN — WEALTH CROSSOVER vs NO CONVERSIONS$/.test((d.textContent || "").trim()));
    return h ? h.parentElement.textContent : null; };
  const outcome = t => !t ? "no card" : t.includes("catches the NO CONVERSIONS path") ? "recovered" : t.includes("never fall behind") ? "never behind"
    : t.includes("Does not break even within the plan") ? "does not break even" : t.includes("No measurable wealth difference") ? "no measurable difference" : "?";
  const EX0 = clone(gd.EXPENSES());
  const loadDom = async p => { await act(async () => { gd.applyLoadedData({ portfolio: clone(p), expenses: clone(EX0) });
    if (SPEND17) gd.applyLoadedData({ portfolio: clone(p), expenses: v617Table(gd, EX0) }); }); await flush();
    await click(tabBtn("taxes")); await click(tabBtn("roth")); await flush(); };
  const EX = clone(gd.PORTFOLIO());
  T("E-0a: SETUP — the example household is the one rendered, and the conversion slider sits at its $70,000 opening value",
    !!slider() && slider().value === "70000" && !!card() && EX.household === BASE_HH, `${slider() ? slider().value : "no slider"} · household ${EX.household} vs ${BASE_HH}`);
  const c70 = card();
  T("E-1: on the example household at $70,000 the card shows \"Does not break even within the plan\" (the census's ON row, t29 B-10)",
    outcome(c70) === "does not break even", outcome(c70));
  const rowEx = census(gd).find(r => r.id === "crossover");
  T("E-3a: the census row agrees with the rendered card on the example household (its second copy of the card's inputs is honest)",
    !!rowEx && rowEx.value.startsWith(outcome(c70)), rowEx ? rowEx.value : "no row");
  // Survivor A (B dies at 78): measured at the scope — with the card's inputs Engine A says "does not break even" at $70,000, but with
  // the household's ACA premium left out it says "recovered (2056)". So this household is the one that catches the census copy drifting.
  await loadDom({ ...EX, lifeExpA: 92, lifeExpB: 78 });
  const tlS = gd.buildPlanTimeline();
  T("E-0b: SETUP — survivor A (A to 92, B to 78) is the household now rendered, slider still $70,000",
    tlS.lifeExpA === 92 && tlS.lifeExpB === 78 && slider() && slider().value === "70000", `${tlS.lifeExpA}/${tlS.lifeExpB}`);
  const cS = card(), rowS = census(gd).find(r => r.id === "crossover");
  T("E-3b: the census row agrees with the rendered card on survivor A", !!rowS && !!cS && rowS.value.startsWith(outcome(cS)), `${rowS ? rowS.value : "no row"} vs ${outcome(cS)}`);
  // Both spouses to 100, $5,000: the recovered outcome renders (measured at the scope: 2062 — age 98 / 96).
  await loadDom({ ...EX, lifeExpA: 100, lifeExpB: 100 });
  // v6.30 (D-60): at $5,000 the v6.17-table leg no longer recovers inside the plan (measured: it does from $10,000 on both legs), so the
  // v6.30 leg drives $10,000. The year is MEASURED at the build on the main leg (2059 — age 95 / 93; 2060 — age 96 / 94 before the build review's accrual fix) and only the outcome is asserted on the
  // v6.17-table leg (the census row is fixed at $70,000, so it cannot second-check a $10,000 card). An array, so register_tag2 widens it.
  const U76 = ["v630", "v631", "v632", "v633", "v634", "v635"].includes(VER), AMT76 = U76 ? 10000 : 5000;
  await drive(AMT76);
  const tlL = gd.buildPlanTimeline(), cL = card() || "";
  T(`E-0c: SETUP — both spouses to 100 are rendered and the slider moved to $${AMT76.toLocaleString()} (the native-setter route, t24)`,
    tlL.lifeExpA === 100 && tlL.lifeExpB === 100 && slider().value === String(AMT76), `${tlL.lifeExpA}/${tlL.lifeExpB} @ ${slider().value}`);
  if (U76) { const yr = (cL.match(/20\d\d — age \d+ \/ \d+/) || [""])[0];
    T(`E-2a (v6.30): the card shows the RECOVERED outcome there — ${yr || "no year"}${SPEND17 ? "" : " (measured at the build on the example's table: 2059 — age 95 / 93)"} (so the corrected sentence is reachable on the page)`,
      outcome(cL) === "recovered" && !!yr && (SPEND17 || yr === "2059 — age 95 / 93"), cL.slice(0, 120)); }
  else {
  const _x = PIN18 ? "2061 — age 97 / 95" : "2062 — age 98 / 96";
  T(`E-2a: the card shows the RECOVERED outcome there — ${_x}${PIN18 ? " (v6.18, D-41: 2062 through v6.17)" : ""} (so the corrected sentence is reachable on the page)`,
    outcome(cL) === "recovered" && cL.includes(_x), cL.slice(0, 120));
  }
  T(POST ? "E-2b: and it renders the corrected sentence, with no \"after-tax wealth\" anywhere on the card"
         : `E-2b ${KD}: and it renders "after-tax wealth"`,
    POST ? cL.includes(CARD_NEW) && !/after-tax wealth/i.test(cL) : cL.includes(CARD_OLD), cL.slice(0, 200));
  T("E-2c: the METHOD line still states the measure — FACE VALUE, the cash question (unchanged on both legs)",
    cL.includes("wealth compared year-by-year at FACE VALUE") && cL.includes("this card answers the cash question"));
  await act(async () => { gd.applyLoadedData({ portfolio: clone(EX) }); }); await act(async () => { root.unmount(); });
}

console.log(`\nt76 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
