// t73 — THE RANKING TAB'S PEER BENCHMARKS: ONE TABLE, THE 2025 SCF, EVERY CUT-OFF PRICED (v6.10)
// Run: node t73_peer_benchmarks.mjs v610   |   node t73_peer_benchmarks.mjs v609
//
// WHY THIS EXISTS (docs/SCOPE_PEER_DATA_SCF2025_V610.md). Through v6.09 NOTHING in the suite asserted a Ranking-tab figure, a cut-off, a tier
// or the peer-refresh alarm — t4 only checked that the words "SCF" and "Empower" appear on the tab. v6.10 replaces the 2022 survey with the
// 2025 one and, in the same edit, gathers every peer figure into ONE module-level table (`PEER_BENCHMARKS`). Before then the net-worth
// cut-offs were typed at three sites, the Empower 60s figure and two percentages were repeated inline in prose, and the survey year was
// typed as text at three sites.
//
// GATED PER LEG (OPERATIONS §B2): the v6.09 leg pins what v6.09 shows (2022 survey, cut-offs as literals, "at 62" label); v6.10 asserts the
// refresh. Sections: A the table's values · B one table, by AST · C every cut-off priced from both sides (§D1 — not just the endpoints)
// · D the copy (vintage, Empower date, the Social Security relabel, the Field Manual) · E the refresh alarm.
//
// INDEPENDENCE. A's SCF figures are typed from qa/tools/peer_scf.py's printed output for the 2025 extract (docs/PEER_SCF2025_figures.txt),
// which checks itself against the Fed's published medians and means before it prints. The Empower and SSA figures are typed from those
// publications. Nothing in A is read from the app and then compared with itself.
import { createRequire } from "module";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
if (!window.URL.createObjectURL) window.URL.createObjectURL = () => "blob:stub";
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v610";
const KNOWN_VERSIONS = ["v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v610", "v611", "v612", "v613", "v614", "v615", "v616"].includes(VER);   // an array, so register_tag2 widens it each release
// v6.11 (F-19r DF-4): the Portfolio Size row has no floor band any more — at or below the 90th percentile it reads "Below the top 10%",
// where v6.10 read "TOP 25%". Gated per leg (§B2), an array so the next registration widens it.
const NOFLOOR = ["v611", "v612", "v613", "v614", "v615", "v616"].includes(VER);
// v6.15 (docs/SCOPE_EVENTS_USER_FACING_V615.md): the Events tab no longer carries the peer-benchmark refresh alarm — a maintainer's
// chore shown to every user. §E asserts its absence on those legs. An array, so the next registration widens it.
const NOPEER = ["v615", "v616"].includes(VER);
const require = createRequire(import.meta.url);
const { __g: g, __test: X } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const EQ = (n, got, want) => T(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const clone = o => JSON.parse(JSON.stringify(o));
console.log(`t73 — RANKING TAB PEER BENCHMARKS (${VER})\n`);

// ── the expected values ───────────────────────────────────────────────────────────────────────────────────────────────────────
// SCF 2025: typed from qa/tools/peer_scf.py's output for scfp2025 (docs/PEER_SCF2025_figures.txt). Filled at the build, from that output.
// Printed by peer_scf.py for scfp2025excel.zip (md5 c938318c529a0b200734f35c431f5911), rounded to whole dollars and whole percent:
//   median 411,340.00 · mean 1,871,018.92 · p75 1,416,200 · p87.5 2,925,250 · p90 3,457,640 · p95 7,545,000 · FIN p90 1,950,000 · p95 4,928,350
//   retirement accounts (holders) median 239,000 · mean 670,247.65 · debt (holders) median 101,000 · mean 197,305.40 · <$100K 60.50% (60.504…, so 61) · 60+ mortgage 33.30%
const SCF2025 = { medianNetWorth: 411340, meanNetWorth: 1871019,
  nwCuts: { p50: 411340, p75: 1416200, p875: 2925250, p90: 3457640, p95: 7545000 }, finCuts: { p90: 1950000, p95: 4928350 },
  medianRetSavings: 239000, meanRetSavings: 670248, medianHHDebt: 101000, meanHHDebt: 197305, pctLessThan100K: 61, pctMortgage60plus: 33 };
// Empower: "Average retirement savings by age", data "as of September 2026" (empower.com/the-currency/money/average-retirement-savings-by-age).
const EMPOWER = { engagedAsOf: "Sep 2026", engagedAvgSavings: 1080916, engagedMedSavings: 463328, engagedAvgSavings60s: 1247718 };
// SSA Annual Statistical Supplement 2025, Table 6.B3: average monthly retired-worker award in 2024, all claiming ages, $2,036.02.
const SSA = { avgSSAward: 2036, avgSSAwardYear: 2024 };
// v6.09's literals, which the prior leg must still show (read from the v6.09 source, recorded at the v6.10 build).
const V609 = { year: 2022, nw: { p50: 364500, p75: 780000, p875: 1550000, p90: 1900000, p95: 3200000 }, fin: { p90: 800000, p95: 1500000 } };
const YEAR = POST ? 2025 : 2022;

// ── A · the table ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
EQ("A-1 PEER_DATA_SCF_YEAR names the survey the tab is built on", X.PEER_DATA_SCF_YEAR(), YEAR);
const PB = X.PEER_BENCHMARKS();
if (!POST) {
  T("A-0 [pre-v6.10] no module-level peer table (the figures sit in the Ranking tab's render, cut-offs as literals)", PB === undefined);
} else {
  T("A-0 PEER_BENCHMARKS is exported by this build", PB && typeof PB === "object");
  T("A-2 the SCF 2025 expectations are filled in (they are typed from peer_scf.py's output at the build)", SCF2025 !== null);
  if (PB && SCF2025) for (const [k, v] of Object.entries(SCF2025)) EQ(`A-3 ${k} = the computed 2025 figure`, PB[k], v);
  if (PB) {
    for (const [k, v] of Object.entries(EMPOWER)) EQ(`A-4 ${k} = Empower's September 2026 figure`, PB[k], v);
    for (const [k, v] of Object.entries(SSA)) EQ(`A-5 ${k} = SSA's 2024 average award`, PB[k], v);
    EQ("A-6 the table's median IS its 50th-percentile cut (one number, not two)", PB.nwCuts && PB.nwCuts.p50, PB.medianNetWorth);
    const c = PB.nwCuts || {}, f = PB.finCuts || {};
    T("A-7 the net-worth cuts rise strictly: p50 < p75 < p87.5 < p90 < p95", c.p50 < c.p75 && c.p75 < c.p875 && c.p875 < c.p90 && c.p90 < c.p95, JSON.stringify(c));
    T("A-8 the financial-asset cuts rise strictly: p90 < p95", f.p90 < f.p95, JSON.stringify(f));
    EQ("A-9 the carried, unverified figures are unchanged from v6.09", [PB.pctOnTrack, PB.pctWithRothPlan, PB.pctWithLTC, PB.pctNothing], [47, 10, 7, 25]);
  }
}

// ── B · one table, by AST ─────────────────────────────────────────────────────────────────────────────────────────────────────
{ const { Parser } = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
  const ast = Parser.extend(jsx()).parse(SRC, { ecmaVersion: "latest", sourceType: "module", locations: true, ranges: true });
  const base = { ...walk.base,
    JSXElement(n, s, c) { (n.children || []).forEach(x => c(x, s)); c(n.openingElement, s); }, JSXFragment(n, s, c) { (n.children || []).forEach(x => c(x, s)); },
    JSXOpeningElement(n, s, c) { (n.attributes || []).forEach(a => c(a, s)); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); },
    JSXSpreadAttribute(n, s, c) { c(n.argument, s); }, JSXExpressionContainer(n, s, c) { c(n.expression, s); },
    JSXEmptyExpression() {}, JSXText() {}, JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {} };
  // The Ranking tab's render = the innermost function holding the `peers` declaration.
  let rank = null, table = null;
  walk.ancestor(ast, { VariableDeclarator(n, _s, anc) {
    if (n.id.type === "Identifier" && n.id.name === "peers") { for (let i = anc.length - 1; i >= 0; i--) if (/Function/.test(anc[i].type)) { rank = anc[i]; break; } }
    if (n.id.type === "Identifier" && n.id.name === "PEER_BENCHMARKS") table = n; } }, base);
  T("B-0 PRECONDITION — the Ranking tab's render function is found", !!rank);
  const inside = (node, outer) => outer && node.start >= outer.start && node.end <= outer.end;
  const nums = [], texts = [];
  walk.full(ast, n => {
    if (n.type === "Literal" && typeof n.value === "number") nums.push(n);
    const t = n.type === "Literal" && typeof n.value === "string" ? n.value : n.type === "TemplateElement" ? n.value.cooked : n.type === "JSXText" ? n.value : null;
    if (t !== null) texts.push([n, t]); }, base);
  const bigInRank = [...new Set(nums.filter(n => inside(n, rank) && n.value >= 100000).map(n => n.value))].sort((a, b) => a - b);
  // 500000 and 150000 are the home-value and mortgage FALLBACKS (used when nothing was entered or parsed), and 1000000 is the $M display
  // divisor (`/ 1000000`, `/ 1e6`) — none of them peer data.
  EQ(POST ? "B-1 the Ranking render holds no peer figure as a literal — its only six-figure literals are the home fallbacks and the $M divisor"
          : "B-1 [pre-v6.10] the Ranking render holds the peer figures and cut-offs as literals",
    bigInRank, POST ? [150000, 500000, 1000000] : [145740, 150000, 185000, 364500, 460363, 500000, 537000, 780000, 800000, 1000000, 1050481, 1228196, 1500000, 1550000, 1566900, 1900000, 3200000]);
  if (POST) {
    const dollars = new Set(); const collect = o => Object.entries(o).forEach(([k, v]) => typeof v === "number" ? (v >= 1000 && !/Year$/.test(k) && dollars.add(v)) : (v && typeof v === "object" && collect(v)));   // dollar figures; a year is not one
    if (PB) collect(PB);
    const stray = nums.filter(n => dollars.has(n.value) && !inside(n, table)).map(n => `${n.value}@L${n.loc.start.line}`);
    EQ("B-2 no dollar figure of the table is typed anywhere else in the source", stray, []);
  }
  const yearText = texts.filter(([n, t]) => inside(n, rank) && /SCF \d{4}|Finances \d{4}/.test(t)).length;
  EQ(POST ? "B-3 the Ranking render types no survey year as text (all three sites read PEER_DATA_SCF_YEAR)"
          : "B-3 [pre-v6.10] the survey year is typed as text at three sites", yearText, POST ? 0 : 3);
}

// ── C, D · the rendered tab ───────────────────────────────────────────────────────────────────────────────────────────────────
{
  require(`./dom_${VER}.cjs`);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(res => setTimeout(res, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const tab = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const BASE = clone(window.__g.PORTFOLIO());
  // applyLoadedData takes a WRAPPER and does not re-render, so park off the tab first (OPERATIONS §C).
  const show = async (patch, masterPrompt) => { await click(tab("dashboard")); await act(async () => { window.__test.applyLoadedData({ portfolio: { ...clone(BASE), ...patch }, ...(masterPrompt ? { masterPrompt } : {}) }); });
    await flush(); await click(tab("ranking")); await flush(); return (body().textContent || "").replace(/\s+/g, " "); };
  const rowTier = (txt, name) => { const m = txt.match(new RegExp(name + "[^%]*?(TOP \\d+%|Below the median|Below the top 10%)")); return m ? m[1] : null; };   // v6.11: the two below-band labels

  // D · the copy, on the example household
  const t0 = await show({});
  T("D-0 PRECONDITION — the Ranking tab rendered its dimension table", /Dimension-by-dimension ranking/.test(t0));
  T(`D-1 the header names the survey: "Sources: Fed SCF ${YEAR}"`, t0.includes(`Sources: Fed SCF ${YEAR}, EBRI RRI, SSA`));
  T(`D-2 the affluent proxy names the survey: "(Fed SCF ${YEAR})"`, t0.includes(`(Fed SCF ${YEAR})`));
  T(`D-3 the source note names the survey: "Survey of Consumer Finances ${YEAR}"`, t0.includes(`Survey of Consumer Finances ${YEAR},`));
  T(POST ? "D-4 no other survey year appears on the tab" : "D-4 (prior leg) no 2025 survey is named", POST ? !/SCF 2022|Finances 2022/.test(t0) : !/SCF 2025|Finances 2025/.test(t0));
  T(POST ? "D-5 the Empower note is dated Sep 2026" : "D-5 (prior leg) the Empower note is dated Mar 2026", t0.includes(POST ? "Dashboard (Sep 2026," : "Dashboard (Mar 2026,"));
  if (POST) {
    T("D-6 the Social Security row says what the figure is — SSA's average retired-worker award, 2024 — at $2,036",
      t0.includes("Avg Social Security award (SSA, 2024)~$2,036/mo"));
    T("D-7 and nothing still calls it a figure at 62, or an SS-only retiree", !t0.includes("Social Security at 62") && !t0.includes("SS-only retiree"));
  } else {
    T("D-6 [pre-v6.10] the row reads \"Avg Social Security at 62\" at $2,000", t0.includes("Avg Social Security at 62~$2,000/mo"));
    T("D-7 [pre-v6.10] and the cards compare against an \"SS-only retiree\"", t0.includes("SS-only retiree"));
  }
  const FM = g.DOCS_HTML();
  if (POST) {
    T("D-8 the Field Manual says the backbone is the 2025 survey", FM.includes("(SCF, currently the 2025 survey)"));
    T("D-9 it names the next survey and its release, in the Ranking entry AND the vintage table", (FM.match(/the 2028 survey publishes ~fall 2029/g) || []).length === 2);
    T("D-10 and no longer calls the figures hand-entered approximations (the SCF ones are now computed)", !FM.includes("hand-entered approximations"));
  } else {
    T("D-8 [pre-v6.10] the Field Manual says \"currently the 2022 survey\"", FM.includes("(SCF, currently the 2022 survey)"));
  }

  // C · every cut-off priced from both sides. Home value and mortgage are zeroed so net worth IS the portfolio — and the master prompt is
  // replaced, because the example's prompt states "~$330,000 equity" and the tab reads equity from the prompt BEFORE the form fields.
  const NW = POST ? (PB ? PB.nwCuts : {}) : V609.nw, FIN = POST ? (PB ? PB.finCuts : {}) : V609.fin;
  const fmtM = n => `$${(n / 1e6).toFixed(2)}M`;
  const zero = { homeValue: 0, mortgageBal: 0 };
  const NOHOME = "t73 test household: no home, no mortgage.";
  const tc = await show({ ...zero, household: 1234567 }, NOHOME);
  T("C-0 PRECONDITION — with no home, net worth equals the portfolio (both rows read $1.23M)", tc.includes(`${fmtM(1234567)} (portfolio + equity)`) && tc.includes(`${fmtM(1234567)} investable`));
  for (const [cut, below, above] of [["p75", "TOP 50%", "TOP 25%"], ["p90", "TOP 25%", "TOP 10%"], ["p95", "TOP 10%", "TOP 5%"]]) {
    const c = NW[cut];
    EQ(`C-1 net worth exactly at the ${cut} cut-off (${c}) stays in ${below}`, rowTier(await show({ ...zero, household: c }, NOHOME), "Net Worth"), below);
    EQ(`C-2 net worth $1 above the ${cut} cut-off moves to ${above}`, rowTier(await show({ ...zero, household: c + 1 }, NOHOME), "Net Worth"), above);
  }
  for (const [cut, below, above] of [["p90", NOFLOOR ? "Below the top 10%" : "TOP 25%", "TOP 10%"], ["p95", "TOP 10%", "TOP 5%"]]) {
    const c = FIN[cut];
    EQ(`C-3 a portfolio exactly at the ${cut} cut-off (${c}) stays in ${below}`, rowTier(await show({ ...zero, household: c }, NOHOME), "Portfolio Size"), below);
    EQ(`C-4 a portfolio $1 above the ${cut} cut-off moves to ${above}`, rowTier(await show({ ...zero, household: c + 1 }, NOHOME), "Portfolio Size"), above);
  }
  const fc = v => v >= 1e6 ? `$${+(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1000)}K`;
  const tb = await show({});
  for (const [cut, lab] of [["p75", "Top 25% entry"], ["p875", "Typical affluent"], ["p90", "Top 10%"], ["p95", "Top 5%"]])
    T(`C-5 the affluent band labels ${lab} at the ${cut} cut-off, ${fc(NW[cut])}`, tb.includes(`${fc(NW[cut])}${lab}`));
  root.unmount();
}

// ── E · the refresh alarm ─────────────────────────────────────────────────────────────────────────────────────────────────────
{ const peer = d => (X.computePlanEvents(d) || []).find(e => e.key === "peer") || {};
  const oct26 = peer(new Date(2026, 9, 15)), jan27 = peer(new Date(2027, 0, 15));
  if (NOPEER) {
    const any = [2026, 2027, 2028, 2029, 2030].some(y => [0, 3, 6, 9, 10, 11].some(m => (X.computePlanEvents(new Date(y, m, 15)) || []).some(e => e.key === "peer")));
    T("E-0 [v6.15] the peer-benchmark alarm is gone from the Events tab on every probed month, 2026–2030 (the reminder is the maintainer's, outside the app)", !any && oct26.key === undefined && jan27.key === undefined);
  } else if (POST) {
    EQ("E-1 October 2026: the alarm is no longer due — the 2025 survey is in", oct26.state, "future");
    T("E-2 and it points at the next survey: 2028, publishing ~Oct 2029", /next refresh: 2028 SCF, publishes ~Oct 2029/.test(oct26.when || ""), oct26.when);
    EQ("E-3 January 2027: still not due", jan27.state, "future");
  } else {
    EQ("E-1 [pre-v6.10] October 2026: the alarm is open — \"refresh now\"", oct26.state, "green");
    EQ("E-3 [pre-v6.10] January 2027: overdue", jan27.state, "red");
  }
}

console.log(`\nt73 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
