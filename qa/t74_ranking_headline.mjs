// t74 — THE RANKING TAB'S HEADLINE IS THE NET-WORTH BAND, AND THE TAB CLAIMS NOTHING IT DOES NOT MEASURE (v6.11, F-19r)
// Run: node t74_ranking_headline.mjs v611   |   node t74_ranking_headline.mjs v610
//
// WHY THIS EXISTS (docs/SCOPE_F19R_RANKING_HEADLINE.md; docs/UsabilityFlaws.md F-19r). Through v6.10 the Ranking tab's headline,
// "Overall tier: TOP N% of Americans age …", and the Bottom Line's "you would rank in the top N by virtually every dimension" were the
// plain average of nine row tiers — five of them fixed strings — so they could only ever read TOP 9% to TOP 18%, whatever was entered.
// A household at the 2nd percentile of net worth read TOP 18% and "an exceptionally strong position". Nothing in the suite asserted the
// headline, the Bottom Line, the praise copy or the fixed rows (t73 asserts the peer table and the two real tiers only).
//
// GATED PER LEG (OPERATIONS §B2): the v6.10 leg pins what v6.10 shows as dated [KNOWN DEFECT 2026-10-13] checks; v6.11 asserts the fix.
// Sections: A the render's structure, by AST · B the headline follows net worth and nothing else (with a SETUP check that the Monte Carlo
// really re-ran, the trap that mis-measured F-19 at filing) · C every net-worth cut-off priced from both sides, and the portfolio floor ·
// D the copy follows the household · E the Field Manual.
//
// ⚠ HARNESS TRAP (OPERATIONS §C, added v6.11): applyLoadedData changes the household but does NOT re-run the Monte Carlo — `simData` is
// rebuilt only on mount and on a scenario-preset or SS-haircut change. A test that loads a new household and reads anything driven by the
// success rate reads the PREVIOUS household's. `rerunMC()` flips the preset away and back; B-1 proves it worked before B counts.
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
const VER = process.argv[2] || "v611";
const KNOWN_VERSIONS = ["v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620"].includes(VER);   // an array, so the next registration widens it
const require = createRequire(import.meta.url);
const { __g: g, __test: X } = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const EQ = (n, got, want) => T(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const clone = o => JSON.parse(JSON.stringify(o));
const KD = "[KNOWN DEFECT 2026-10-13, F-19r — flips at v6.11]";
console.log(`t74 — RANKING HEADLINE AND CLAIMS (${VER})\n`);

const NINE = ["Net Worth", "Portfolio Size", "Retirement Readiness", "Debt Load", "Income Replacement", "Roth Strategy", "Healthcare Planning", "Housing Equity", "Planning Sophistication"];
const SIX = ["Net Worth", "Portfolio Size", "Retirement Readiness", "Debt Load", "Income Replacement", "Housing Equity"];

// ── A · the render's structure, by AST ─────────────────────────────────────────────────────────────────────────────────────
{
  const { Parser } = require("acorn"); const jsx = require("acorn-jsx"); const walk = require("acorn-walk");
  const ast = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true });
  const base = Object.assign({}, walk.base, {
    JSXElement(n, st, c) { n.openingElement && c(n.openingElement, st); (n.children || []).forEach(ch => c(ch, st)); },
    JSXFragment(n, st, c) { (n.children || []).forEach(ch => c(ch, st)); },
    JSXOpeningElement(n, st, c) { (n.attributes || []).forEach(a => c(a, st)); },
    JSXAttribute(n, st, c) { n.value && c(n.value, st); }, JSXSpreadAttribute(n, st, c) { c(n.argument, st); },
    JSXExpressionContainer(n, st, c) { c(n.expression, st); }, JSXEmptyExpression() {}, JSXText() {}, JSXIdentifier() {}, JSXMemberExpression() {}, JSXNamespacedName() {},
  });
  // The Ranking render = the innermost function holding the `peers` declaration (as t73).
  let rank = null;
  walk.fullAncestor(ast, (n, anc) => { if (n.type === "VariableDeclarator" && n.id.name === "peers") rank = [...anc].reverse().find(a => /Function/.test(a.type)) || rank; }, base);
  T("A-0 PRECONDITION — the Ranking tab's render function is found", !!rank);
  if (rank) {
    let dims = null; const tops = []; let reduces = 0;
    walk.fullAncestor(rank, (n, anc) => {
      if (n.type === "VariableDeclarator" && n.id.name === "dims" && n.init && n.init.type === "ArrayExpression") dims = n.init;
      // a tier ASSIGNED (a comparison such as nwColor's `nwTier === "TOP 5%"` reads a tier, it does not set one)
      if (n.type === "Literal" && typeof n.value === "string" && /^TOP \d+%$/.test(n.value) && anc[anc.length - 2].type !== "BinaryExpression") {
        const decl = [...anc].reverse().find(a => a.type === "VariableDeclarator");
        const prop = [...anc].reverse().find(a => a.type === "Property" && a.key && a.key.name === "tier");
        const obj = prop && [...anc].reverse().find(a => a.type === "ObjectExpression" && a.properties.includes(prop));
        const nm = obj && obj.properties.find(q => q.key && q.key.name === "name");
        tops.push(prop && nm ? `${nm.value.value}.tier` : decl ? decl.id.name : "?");
      }
      if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object.type === "Identifier" && n.callee.object.name === "dims" && n.callee.property.name === "reduce") reduces++;
    }, base);
    T("A-0b PRECONDITION — the `dims` row array is found", !!dims);
    const rows = dims ? dims.elements.map(o => { const p = k => o.properties.find(q => q.key && q.key.name === k); return { name: p("name") && p("name").value.value, tier: p("tier") && p("tier").value }; }) : [];
    EQ(POST ? "A-1 six rows: the two ranked ones and four unranked; Roth Strategy, Healthcare Planning and Planning Sophistication are gone"
            : `A-1 ${KD} nine rows`, rows.map(r => r.name), POST ? SIX : NINE);
    if (POST) {
      EQ("A-2 every \"TOP N%\" literal in the render is the net-worth band (`nwTier`) or the Portfolio Size row's tier — no fixed tier string survives",
        [...new Set(tops)].sort(), ["Portfolio Size.tier", "nwTier"]);
      EQ("A-3 the four unranked rows carry the literal \"—\" as their tier", rows.filter(r => !["Net Worth", "Portfolio Size"].includes(r.name)).map(r => r.tier && r.tier.type === "Literal" ? r.tier.value : "(expr)"), ["—", "—", "—", "—"]);
    } else {
      EQ(`A-2 ${KD} five rows carry a fixed "TOP N%" string whatever the household enters`,
        rows.filter(r => r.tier && r.tier.type === "Literal").map(r => `${r.name}=${r.tier.value}`),
        ["Debt Load=TOP 20%", "Roth Strategy=TOP 10%", "Healthcare Planning=TOP 5%", "Housing Equity=TOP 15%", "Planning Sophistication=TOP 5%"]);
    }
    EQ(POST ? "A-4 nothing averages over the rows (no `dims.reduce`)" : `A-4 ${KD} the headline is an average over the rows (one \`dims.reduce\`)`, reduces, POST ? 0 : 1);
  }
}

// ── B, C, D · the rendered tab ──────────────────────────────────────────────────────────────────────────────────────────────
{
  require(`./dom_${VER}.cjs`);
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const React = require("react");
  const flush = async () => { await act(async () => { await new Promise(res => setTimeout(res, 30)); }); };
  const body = () => window.document.body;
  const click = async el => { await act(async () => { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); };
  const tab = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  const btn = label => [...body().querySelectorAll("button")].find(b => b.textContent.trim() === label);
  await act(async () => { root.render(React.createElement(DangerClose)); });
  await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const BASE = clone(window.__g.PORTFOLIO());
  // The preset buttons are disabled while the sims run; wait until BASE is enabled again.
  const idle = async () => { for (let i = 0; i < 600; i++) { await act(async () => { await new Promise(r => setTimeout(r, 250)); }); const b = btn("BASE"); if (b && !b.disabled) return true; } return false; };
  const rerunMC = async () => { await click(tab("monte carlo")); await idle(); await click(btn("BASE")); await idle(); await click(btn("BULL-LEANING")); return idle(); };
  // applyLoadedData takes a WRAPPER and does not re-render, so park off the tab first (OPERATIONS §C).
  const show = async (patch, masterPrompt, mc = false) => {
    await click(tab("dashboard"));
    await act(async () => { window.__test.applyLoadedData({ portfolio: { ...clone(BASE), ...patch }, ...(masterPrompt ? { masterPrompt } : {}) }); });
    await flush(); if (mc) await rerunMC();
    await click(tab("ranking")); await flush(); return (body().textContent || "").replace(/\s+/g, " ");
  };
  const head = t => { const m = POST ? t.match(/Net worth position(TOP \d+%|Below the median)of U\.S\. families age 55–64/) : t.match(/Overall tier(TOP \d+%)of Americans age/); return m ? m[1] : null; };
  const success = t => { const m = t.match(/(\d+\.\d)% (?:Monte Carlo|MC) success rate/); return m ? +m[1] : null; };
  const rowCells = () => { const h = [...body().querySelectorAll("div")].find(d => d.textContent === "Dimension-by-dimension ranking"); const card = h && h.parentElement;
    return card ? [...card.querySelectorAll("div")].filter(d => d.children.length === 5 && [...d.children].every(c => c.tagName === "SPAN")).map(d => [...d.children].map(c => c.textContent.trim())) : []; };
  const rowTier = (t, name) => { const m = t.match(new RegExp(name + "[^%]*?(TOP \\d+%|Below the median|Below the top 10%)")); return m ? m[1] : null; };
  const NOHOME = "t74 test household: no home, no mortgage.";   // the example's prompt states an equity figure, which the tab reads BEFORE the form fields

  // B · the headline follows net worth and nothing else. Two households with the SAME net worth ($2.00M) and opposite Monte Carlo results:
  // A holds it all invested; B holds $20,000 invested and a $1.98M house.
  const tA = await show({ household: 2000000, homeValue: 0, mortgageBal: 0 }, NOHOME, true);
  const tB = await show({ household: 20000, homeValue: 1980000, mortgageBal: 0 }, NOHOME, true);
  const sA = success(tA), sB = success(tB);
  T("B-1 SETUP — the Monte Carlo re-ran for each household (A's rendered success ≥ 90%, B's ≤ 10%); without this every readiness-driven check below would read the previous household's run",
    sA !== null && sB !== null && sA >= 90 && sB <= 10, `A ${sA}%, B ${sB}%`);
  T("B-2 both households' net worth reads $2.00M", tA.includes("$2.00M (portfolio + equity)") && tB.includes("$2.00M (portfolio + equity)"));
  if (POST) {
    EQ("B-3 equal net worth → equal headline, whatever the Monte Carlo says: both TOP 25%", [head(tA), head(tB)], ["TOP 25%", "TOP 25%"]);
    const tC = await show({ household: 2000000, homeValue: 0, mortgageBal: 0, single: true }, NOHOME);
    const tD = await show({ household: 1800000, homeValue: 500000, mortgageBal: 300000 }, "t74 test household: a home and a mortgage.");
    EQ("B-4 a single filer and a mortgaged household at the same $2.00M net worth read the same headline", [head(tC), head(tD)], ["TOP 25%", "TOP 25%"]);
  } else {
    // v6.10's nine-way average, hand-computed: A 25+10+5+20+20+10+5+15+5 = 115/9 = 12.8 → 13; B 25+25+30+20+20+10+5+15+5 = 155/9 = 17.2 → 17.
    EQ(`B-3 ${KD} equal net worth, different headlines — the Monte Carlo moves it`, [head(tA), head(tB)], ["TOP 13%", "TOP 17%"]);
  }

  // C · every net-worth cut-off priced from both sides (§D1 — interior rows, not endpoints). Home zeroed so net worth IS the portfolio.
  const NW = X.PEER_BENCHMARKS().nwCuts;
  const bands = [["p50", "Below the median", "TOP 50%"], ["p75", "TOP 50%", "TOP 25%"], ["p90", "TOP 25%", "TOP 10%"], ["p95", "TOP 10%", "TOP 5%"]];
  for (const [cut, below, above] of bands) {
    const c = NW[cut];
    const t0 = await show({ household: c, homeValue: 0, mortgageBal: 0 }, NOHOME), t1 = await show({ household: c + 1, homeValue: 0, mortgageBal: 0 }, NOHOME);
    if (POST) {
      EQ(`C-1 net worth exactly at the ${cut} cut-off (${c}): headline and row both read ${below}`, [head(t0), rowTier(t0, "Net Worth")], [below, below]);
      EQ(`C-2 net worth $1 above the ${cut} cut-off: headline and row both read ${above}`, [head(t1), rowTier(t1, "Net Worth")], [above, above]);
    } else if (cut === "p50") {
      EQ(`C-1 ${KD} below the median the Net Worth row still reads TOP 50%`, [rowTier(t0, "Net Worth"), rowTier(t1, "Net Worth")], ["TOP 50%", "TOP 50%"]);
    }
  }

  // D · the copy follows the household. L: no home, $20,000 invested — about the 2nd percentile of net worth.
  const tL = await show({ household: 20000, homeValue: 0, mortgageBal: 0 }, NOHOME, true);
  T("D-0 PRECONDITION — the Ranking tab rendered its dimension table, and L's Monte Carlo re-ran (≤ 10%)", /Dimension-by-dimension ranking/.test(tL) && success(tL) !== null && success(tL) <= 10, `success ${success(tL)}`);
  const CLAIMS = ["exceptionally strong", "structural one", "You have all three", "virtually every dimension", "possess", "you'll live near",
    "pointing to the upper end", "hybrid LTC", "cash-purchase plan", "Guardrails + sequencing + Roth plan", "x avg SS", "Peer benchmark (age 62)",
    "Overall tier", "Roth Strategy", "Healthcare Planning", "Planning Sophistication", "Planning advantage"];
  // C-3 · the Portfolio Size row's floor (DF-4): a $20,000 portfolio, far below the 75th percentile of financial assets.
  EQ(POST ? "C-3 a $20,000 portfolio's row reads \"Below the top 10%\" — there is no floor band" : `C-3 ${KD} a $20,000 portfolio's row reads TOP 25%`,
    rowTier(tL, "Portfolio Size"), POST ? "Below the top 10%" : "TOP 25%");
  const found = CLAIMS.filter(c => tL.includes(c));
  if (POST) {
    EQ("D-1 for a household at the 2nd percentile, no verdict or unmeasured claim survives anywhere on the tab", found, []);
    EQ("D-2 its headline says it is below the median", head(tL), "Below the median");
  } else {
    EQ(`D-1 ${KD} the 2nd-percentile household is told all of these`, ["exceptionally strong", "You have all three", "virtually every dimension", "you'll live near", "hybrid LTC", "Overall tier"].filter(c => tL.includes(c)),
      ["exceptionally strong", "You have all three", "virtually every dimension", "you'll live near", "hybrid LTC", "Overall tier"]);
    EQ(`D-2 ${KD} and its headline is TOP 18%`, head(tL), "TOP 18%");
  }
  const tE = await show({}, null, true);   // the example household as shipped (its own prompt and equity)
  const pct = (t, re) => { const m = t.match(re); return m ? m[1] : null; };
  if (POST) {
    for (const [lab, t] of [["L", tL], ["the example", tE]]) {
      const h = head(t), bl = pct(t, /Your net worth puts you (below the median|in the top \d+%) of U\.S\. families/);
      EQ(`D-3 ${lab}: the Bottom Line states the same position as the headline`, bl, h === "Below the median" ? "below the median" : h && `in the ${h.toLowerCase()}`);
      const p1 = pct(t, /sits about the (\d+(?:st|nd|rd|th)) percentile of U\.S\. families/), p2 = pct(t, /Nationally that's about the (\d+(?:st|nd|rd|th)) percentile/), p3 = pct(t, /about the (\d+(?:st|nd|rd|th)) percentile \(Fed SCF/);
      T(`D-4 ${lab}: the header, the affluent card and the Bottom Line give one national percentile (${p1})`, !!p1 && p1 === p2 && p1 === p3, `${p1} / ${p2} / ${p3}`);
    }
    EQ("D-5 the example's affluent card states one verdict and its percentile, nothing more",
      pct(tE, /(You sit [^.]*\. Nationally that's about the \d+\w\w percentile for your age\.)/), "You sit in the lower band of an affluent retirement community. Nationally that's about the 81st percentile for your age.");
    T("D-5b and no longer adds \"you're around the middle\"", !tE.includes("the middle."));
  } else {
    T(`D-5 ${KD} the example's affluent card states two verdicts at once ("lower band" … "around the middle")`, tE.includes("in the lower band of an affluent retirement community") && tE.includes("you're around the middle"));
  }
  const cells = rowCells();
  if (POST) {
    EQ("D-6 the table's header reads \"Survey figure\", and its rows are the six", cells.map(r => r[0].replace(/⚠$/, "")), ["Dimension", ...SIX]);
    EQ("D-7 the four unranked rows show \"—\" for ratio and tier", cells.slice(3).map(r => [r[3], r[4]]), [["—", "—"], ["—", "—"], ["—", "—"], ["—", "—"]]);
    T("D-8 the column header no longer names a single age", cells[0] && cells[0][2] === "Survey figure", cells[0] && cells[0][2]);
  } else {
    EQ(`D-6 ${KD} nine rows under "Peer benchmark (age 62)"`, [cells.length, cells[0] && cells[0][2]], [10, "Peer benchmark (age 62)"]);
  }
  root.unmount();
}

// ── E · the Field Manual ───────────────────────────────────────────────────────────────────────────────────────────────────
{ const FM = g.DOCS_HTML();
  if (POST) {
    T("E-1 the Ranking entry says which two rows are ranked and that the headline is the net-worth band", FM.includes("Two rows are ranked: net worth and portfolio size are placed in Top N% bands of U.S. families age 55–64, and the headline is the net-worth band"));
    T("E-2 it names the four rows that are not ranked", FM.includes("retirement readiness, income replacement, debt and housing equity — show your own figure beside a survey figure"));
    T("E-3 and no longer says the tiers are built from survey data", !FM.includes("tiers built from public survey data"));
  } else {
    T(`E-3 ${KD} the Ranking entry says every tier is built from public survey data`, FM.includes("Approximate \"Top N%\" tiers built from public survey data"));
  }
}

console.log(`\nt74 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
