// t109 — THE ROTH LADDER'S SEEDS (D-76, docs/SCOPE_D76_LADDER_SEED_V645.md, DJ-1 (b), DJ-2 (a)). NEW at v6.45. Both legs.
// Run: node t109_ladder_seed.mjs v645   |   node t109_ladder_seed.mjs v644
//
// WHAT WAS WRONG. The Roth tab's conversion ladder seeds its balances from `retireStartBalances` at the selected year. Since the repo's first
// commit two exceptions sat in the seed: a plan whose start Roth was 0 had its ROTH BAL column started from the example's $356,813 (× the
// carry), and a plan whose start Traditional was 0 converted from the example's $1,340,645 — conversions, tax, MAGI, the IRMAA calendar,
// the headroom, the totals and the with-conversion RMD card all followed from money the plan does not hold. From v6.45 the seeds are the
// plan's own, always, and a ladder in which nothing converts (slider above $0) says so in one line above the table — keyed to the
// ladder's RESULT, not the start balance (the scope's review, finding 1: B's later contributions convert from a $0 start; an annuity-only
// plan converts nothing from a non-zero one).
//
// PRECISION (OPERATIONS §M). The ladder is computed inside the component, so its only output is the rendered DOM. The balance columns render
// `$(x/1e6).toFixed(2)M` — ±$5,000; the effects here are $400,000+ and $1.4M, two orders above that ceiling, so these checks are not
// vacuous. The RMD cards render whole dollars and are pinned exactly (§D).
//
// SECTIONS. §A the source by AST: the seeds' initialisers (followed through `rothBal0` / `tradBal0`) carry no literal but 0; EVERY numeric
// literal ≥ 1,000 in a fallback position anywhere in the source (`||`, `??`, a ternary's alternate, a default value) is on a named
// allowlist, each with its reason — the test is named for what it proves: no UNLISTED literal fallback; the note's condition reads the
// ladder's rows. §B the rendered shapes. §C the Roth tab's page text identical to v6.44's where the plan holds both kinds of money (the
// prior leg dumped in a child process, `--dumpdom`). §D dollar-exact pins on the RMD cards. §E the copy.
// The v6.44 leg pins each defect as `[KNOWN DEFECT 2026-11-04, D-76 — flips at v6.45]`.
//
// HARNESS TRAPS (the scope's review, §3.1, and this suite's first runs): `applyLoadedData` does not reset the React `retireYear` or slider
// state, so `visit` puts the slider back to $70,000 and the selector back to PLANNED itself; nor does it remount, so the solve-for grid (a
// useMemo with no plan in its keys — the app remounts on every load) is recomputed by moving the slider off and back; a large dump goes
// through a file, not a pipe; the page's text is read by a tree walk, not a clone (jsdom cannot re-parse a style React updated in place); fixture households are applied to a fresh copy of the example each time
// (`households.mjs`'s `build` copies the CURRENT portfolio and compounds in a loop).
import { createRequire } from "module";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(109); Math.random = () => _src();
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v645";
const DUMP = process.argv[3] === "--dumpdom";
const KNOWN_VERSIONS = ["v644", "v645", "v646"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v645", "v646"].includes(VER);   // an array, so the next registration widens it
const C_PRIOR = "v644";                // §C's prior module — a constant, so the registrar cannot widen it
const KD = "[KNOWN DEFECT 2026-11-04, D-76 — flips at v6.45]";
const require = createRequire(import.meta.url);
const clone = o => JSON.parse(JSON.stringify(o));
const md5 = s => createHash("md5").update(s).digest("hex");
const normVer = t => t.replace(/v6\.4[45]\b/g, "v6.4x").replace(/\bv64[45]\b/g, "v64x");   // the version only — a figure such as "$6.45M" is not masked (the build review)
// §C compares the Roth tab itself: from its "How this tab fits together" panel to the end of the page. Above it sits the retirement selector,
// whose Monte Carlo medians depend on the random stream's position — which differs between the dump process and this one (§B runs first here).
const rothPart = t => { const i = t.indexOf("How this tab fits together"); return i < 0 ? "" : t.slice(i); };

// ── the plan shapes (the scope's §0.3, and the review's two) — each from a fresh copy of the example ─────────────────────────────────────
const noRoth = P => { const Q = clone(P); Q.positions = Q.positions.map(p => ({ ...p, balance: p.trad, roth: 0 })); Q.otherAccounts = Q.otherAccounts.filter(a => a.taxType !== "roth");
  Q.contributions = { ...Q.contributions, contribRothA: 0, contribRothB: 0 }; return Q; };
const roth1 = P => { const Q = noRoth(P); Q.positions[0] = { ...Q.positions[0], roth: 1, balance: Q.positions[0].trad + 1 }; return Q; };
const noTradBase = P => { const Q = clone(P); Q.positions = Q.positions.map(p => ({ ...p, balance: p.roth, trad: 0 })).filter(p => p.balance > 0);
  Q.otherAccounts = Q.otherAccounts.filter(a => !["trad", "annuity"].includes(a.taxType)); Q.total401k = 0;
  Q.contributions = { ...Q.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0, contribRothB: 0 }; return Q; };
const noTrad = P => { const Q = noTradBase(P); Q.contributions = { ...Q.contributions, contribRothA: 1000 }; return Q; };
const noIra = P => { const Q = clone(P); Q.positions = []; Q.otherAccounts = [{ name: "Brokerage", balance: 900000, owner: "JT", taxType: "taxable" }]; Q.total401k = 0;
  Q.contributions = { ...Q.contributions, monthly401k: 0, spouseBMonthly: 0, contribPreTaxA: 0, contribPreTaxB: 0, contribRothA: 0, contribRothB: 0 }; return Q; };
// Traditional only as a $250,000 non-qualified annuity (cannot be converted): the start Traditional is NOT 0, and nothing converts.
const annOnly = P => { const Q = noTradBase(P); Q.contributions = { ...Q.contributions, contribRothA: 0 };
  Q.otherAccounts = [...Q.otherAccounts, { name: "Annuity (A)", balance: 250000, owner: "A", taxType: "annuity" }]; return Q; };
// No Traditional at the start (as of 2029, A and B's holdings Roth only), but spouse B works to 2033 putting $2,000 a month pre-tax away.
const noTradLaterB2 = P => { const Q = noTradBase(P); Q.asOf = "2029-01-15"; Q.retireYear = 2029; Q.retireYearB = 2033;
  Q.contributions = { ...Q.contributions, contribRothA: 0, contribPreTaxB: 2000, spouseBMonthly: 2000 }; return Q; };
// The census's two (t29 C-d76): balances unchanged, so the example's built-in work stays on (`holdsExampleHoldings` reads ticker + balance).
const rothToTrad = P => { const Q = clone(P); Q.positions = Q.positions.map(p => ({ ...p, trad: p.trad + p.roth, roth: 0 }));
  Q.otherAccounts = Q.otherAccounts.map(a => a.taxType === "roth" ? { ...a, taxType: "trad", planType: "ira" } : a);
  const c = Q.contributions; Q.contributions = { ...c, contribPreTaxA: (c.contribPreTaxA || 0) + (c.contribRothA || 0), contribRothA: 0,
    contribPreTaxB: (c.contribPreTaxB || 0) + (c.contribRothB || 0), contribRothB: 0 }; return Q; };
// The build review's two: spouse A born 1952 (RMDs from 73, so A's conversion window closed in 2024) holds every account — B's window keeps
// the ladder's rows, B holds no Traditional, so nothing converts though the plan holds $1.3M of it; and both spouses born 1950/1951, whose
// windows both closed before the 2029 start — an empty ladder.
const toA = Q => { Q.positions = Q.positions.map(p => ({ ...p, owner: "A" })); Q.otherAccounts = Q.otherAccounts.map(a => a.owner === "B" ? { ...a, owner: "A" } : a);
  Q.contributions = { ...Q.contributions, contribPreTaxA: (Q.contributions.contribPreTaxA || 0) + (Q.contributions.contribPreTaxB || 0), contribPreTaxB: 0, contribRothB: 0, spouseBMonthly: 0 }; return Q; };
const pastA = P => { const Q = toA(clone(P)); Q.dobA = "1952-01-01"; return Q; };
const bothPast = P => { const Q = clone(P); Q.dobA = "1950-01-01"; Q.dobB = "1951-01-01"; return Q; };
const SHAPES = { noRoth, roth1, noTrad, noIra, annOnly, noTradLaterB2, rothToTrad, pastA, bothPast };
const NOTE_TEXT = "Nothing converts in this ladder, so the slider has no effect here";

// ── the rendered app ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const mountApp = async ver => {
  require(`./dom_${ver}.cjs`);
  const React = require("react");
  const body = () => window.document.body;
  let root, act, DangerClose;
  const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
  const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
  const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim().toLowerCase() === name);
  // HARNESS TRAP: not body().cloneNode(true). Once the slider has moved, React updates `background` in place, jsdom writes the expanded
  // longhands back into the style attribute and then cannot parse them when the node is cloned (TypeError in shorthand-properties.js, on
  // v6.44 and v6.45 alike). A text walk gives textContent less <style>/<script> without cloning anything.
  const text = () => { const w = window.document.createTreeWalker(body(), window.NodeFilter.SHOW_TEXT); let out = "";
    while (w.nextNode()) { const p = w.currentNode.parentNode; if (p && (p.nodeName === "STYLE" || p.nodeName === "SCRIPT")) continue; out += w.currentNode.nodeValue; }
    return out.replace(/\s+/g, " "); };
  const el = window.document.createElement("div"); body().appendChild(el); ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} await flush(); await flush();
  const ex = [...body().querySelectorAll("button, [role=button], div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(ex); await flush(); await flush();
  const DG = window.__g;
  const DP0 = clone(DG.PORTFOLIO()), DX0 = clone(DG.EXPENSES());
  const setNative = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const slider = () => [...body().querySelectorAll("input[type=range]")].find(s => s.max === "400000" && s.step === "5000");
  const drive = async v => { const s = slider(); if (!s) return false; await act(async () => { setNative.call(s, String(v)); s.dispatchEvent(new window.Event("input", { bubbles: true })); }); await flush(); await flush(); return true; };
  const pick = async tag => { const b = [...body().querySelectorAll("button.rbtn")].find(x => (x.textContent || "").includes(tag)); await click(b); await flush(100); return !!b; };
  // load a plan, open the Roth tab at the planned year and the $70,000 slider, then move them as asked
  const visit = async (P, { slide = 70000, sel = "PLANNED" } = {}) => {
    await act(async () => { DG.applyLoadedData({ portfolio: clone(P), expenses: clone(DX0) }); }); await flush(); await flush();
    await click(tabBtn("dashboard")); await flush(100); await click(tabBtn("roth")); await flush(100);
    await pick("PLANNED"); if (sel !== "PLANNED") await pick(sel); await click(tabBtn("roth")); await flush(200);
    // HARNESS TRAP: the solve-for grid is a useMemo keyed on the slider, the selector and the tax inputs — not on the plan, because the app
    // remounts on every load (`setRemountKey`). `applyLoadedData` called here does not remount, so the grid would still rank the plan last
    // seen with a different input. Moving the slider off and back recomputes it for the plan now loaded.
    await drive(0); await drive(70000); if (slide !== 70000) await drive(slide);   // via $0: at $75,000 jsdom crashed cloning a style it cannot parse
    // the solve-for grid re-ranks on a timer ("LIVE · AUTO-UPDATES"): wait until the page stops changing, or a page is read mid-computation
    let t0 = text(); for (let i = 0; i < 40; i++) { await flush(150); const t1 = text(); if (t1 === t0) break; t0 = t1; }
    return t0; };
  const reset = async () => { await drive(70000); await pick("PLANNED"); await click(tabBtn("dashboard")); await flush(60); };
  // the ladder table: the grid whose header cell reads ROTH BAL — nine cells a row
  const grab = () => {
    const t = text(), m = re => (t.match(re) || [])[1];
    const hdr = [...body().querySelectorAll("div")].find(d => d.textContent === "ROTH BAL" && d.children.length === 0);
    const cells = hdr ? [...hdr.parentElement.children].map(c => c.textContent.trim()) : [];
    const rows = []; for (let i = 9; i + 8 < cells.length; i += 9) rows.push({ year: +cells[i], conv: cells[i + 1], tax: cells[i + 4], magi: cells[i + 5], trad: cells[i + 7], roth: cells[i + 8] });
    // the cards list A then B, each "<first name>: $N at <age> (<year>)" — read by position (the example names both spouses "Spouse …")
    const card = (lab, i) => { const seg = m(new RegExp(`${lab}(.*?)(?:Forced taxable|Combined RMDs)`)) || ""; const r = [...seg.matchAll(/: \$([\d,]+) at \d+ \(\d{4}\)/g)][i]; return r ? +r[1].replace(/,/g, "") : null; };
    return { text: t, rows, tradNow: m(/Traditional bal \(now\)\s*\$([\d,]+)/), rothNow: m(/Roth bal \(now\)\s*\$([\d,]+)/),
      totConv: m(/Total conversion \(\d+ yr\)\s*(\$[\d.]+M)/), totTax: m(/Total tax cost\s*\$([\d,]+)/),
      noConvA: card("NO CONVERSION \\(each at their own age\\)", 0), noConvB: card("NO CONVERSION \\(each at their own age\\)", 1),
      withConvA: card("K/YR CONVERSION", 0), withConvB: card("K/YR CONVERSION", 1), red: m(/Combined RMDs reduced by \$(-?[\d,]+)\/yr/),
      note: !!body().querySelector('[data-dc-ladder-note="nothing-converts"]'), noteText: (body().querySelector('[data-dc-ladder-note="nothing-converts"]') || {}).textContent || "", head: m(/ROTH CONVERSION STRATEGY — ([^│]*?)(?:Tax brackets|$)/) };
  };
  const unmount = async () => { try { await act(async () => { root.unmount(); }); } catch (e) {} };
  return { DG, DP0, DX0, visit, reset, grab, unmount };
};

// §C's plans: both kinds of money at the selected year. The same list in both processes.
const C_PLANS = async (P0) => {
  const { HOUSEHOLDS } = await import(pathToFileURL(join(HERE, "tools", "fixture", "households.mjs")).href);
  const out = [["example", clone(P0), {}], ["example -1 YEAR", clone(P0), { sel: "-1 YEAR" }], ["example +1 YEAR", clone(P0), { sel: "+1 YEAR" }],
    ["example $0", clone(P0), { slide: 0 }], ["example $250K", clone(P0), { slide: 250000 }], ["roth1", roth1(P0), {}]];
  for (const n of Object.keys(HOUSEHOLDS)) { const P = clone(P0); HOUSEHOLDS[n].apply(P); out.push([`fixture ${n}`, P, {}]); }
  return out;
};
if (DUMP) {
  const app = await mountApp(VER), out = {};
  for (const [nm, P, o] of await C_PLANS(app.DP0)) { _src = mulberry(109); out[nm] = await app.visit(P, o); await app.reset(); }
  await app.unmount();
  // to a file, not stdout: 23 pages through a pipe followed by process.exit() arrived truncated (the first run of this suite)
  writeFileSync(process.argv[4], JSON.stringify(out));
  process.exit(0);
}

const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], anc = []) => { if (pred(root, anc)) out.push({ n: root, anc: [...anc] }); anc.push(root); for (const c of kids(root)) all(c, pred, out, anc); anc.pop(); return out; };
const topOf = anc => { for (const a of anc) { if (a.type === "FunctionDeclaration" && a.id) return a.id.name;
  if (a.type === "VariableDeclaration" && a.declarations[0] && a.declarations[0].id.type === "Identifier") return a.declarations[0].id.name;
  if (a.type === "ExportDefaultDeclaration" && a.declaration && a.declaration.id) return a.declaration.id.name; } return "<top>"; };

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T109_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished) { console.log(`t109 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
console.log(`t109 — THE ROTH LADDER'S SEEDS (${VER})`);

// ── §A · the source, by AST ──────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  A — the source");
{
  const decl = name => all(AST, n => n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.id.name === name);
  const SEEDS = ["rothBal", "tradBalA", "tradBalB", "annBalA", "annBalB"];
  const found = Object.fromEntries([...SEEDS, "rothBal0", "tradBal0"].map(nm => [nm, decl(nm)]));
  T("A-1 each ladder seed is declared exactly once (rothBal, tradBalA, tradBalB, annBalA, annBalB; rothBal0, tradBal0)",
    Object.values(found).every(x => x.length === 1), Object.entries(found).map(([k, v]) => `${k}:${v.length}`).join(" "));
  // the literals and names an initialiser reads, following rothBal0 / tradBal0 to their own declarations
  const ALLOWED = new Set(["_cL", "_rsbL", "_perSeed", "_tradFromPortfolio", "_rothFromPortfolio", "rothBal0", "tradBal0",
    "tradInitA", "tradInitB", "rothInitA", "rothInitB", "annShareA", "annShareB", "tradInit", "rothInit"]);
  const lits = new Set(), names = new Set();
  const scan = (init, seen = new Set()) => { all(init, n => n.type === "Literal" && typeof n.value === "number").forEach(({ n }) => lits.add(n.value));
    all(init, n => n.type === "Identifier").forEach(({ n }) => { names.add(n.name);
      if (["rothBal0", "tradBal0"].includes(n.name) && !seen.has(n.name) && found[n.name][0]) { seen.add(n.name); scan(found[n.name][0].n.init, seen); } }); };
  for (const nm of SEEDS) if (found[nm][0]) scan(found[nm][0].n.init);
  const litList = [...lits].sort((a, b) => a - b), badNames = [...names].filter(x => !ALLOWED.has(x));
  if (POST) T(`A-2 the seeds' initialisers, followed through rothBal0 and tradBal0, carry no numeric literal but 0, and read only the plan's start balances (literals: ${litList.join(", ") || "none"})`,
    litList.every(v => v === 0) && badNames.length === 0, `names outside the start balances: ${badNames.join(", ")}`);
  else T(`A-2 ${KD}: the seeds carry the example's $356,813 Roth and $1,340,645 Traditional (literals: ${litList.join(", ")})`,
    lits.has(356813) && lits.has(1340645));

  // A-3 · the class, as far as a walk can see it: every numeric literal ≥ 1,000 in a fallback position, keyed function|operator|value.
  const litOf = e => { if (!e) return null; if (e.type === "Literal" && typeof e.value === "number") return e.value;
    if (e.type === "UnaryExpression" && e.operator === "-" && e.argument.type === "Literal" && typeof e.argument.value === "number") return -e.argument.value;
    if (e.type === "BinaryExpression" && e.operator === "*") { const a = litOf(e.left), b = litOf(e.right); if (typeof a === "number") return a; if (typeof b === "number") return b; } return null; };
  const hits = [];
  all(AST, n => { if (n.type === "LogicalExpression" && (n.operator === "||" || n.operator === "??")) { const v = litOf(n.right); return v !== null && Math.abs(v) >= 1000; }
    if (n.type === "ConditionalExpression") { const v = litOf(n.alternate); return v !== null && Math.abs(v) >= 1000; }
    if (n.type === "AssignmentPattern") { const v = litOf(n.right); return v !== null && Math.abs(v) >= 1000; } return false; })
    .forEach(({ n, anc }) => { const v = litOf(n.type === "LogicalExpression" ? n.right : n.type === "ConditionalExpression" ? n.alternate : n.right);
      const op = n.type === "LogicalExpression" ? n.operator : n.type === "ConditionalExpression" ? "?:" : "default";
      hits.push(`${topOf(anc)} ${op} ${v}`); });
  // Each entry: key → [count, reason]. A new fallback, or one that leaves, turns this red; add or remove its entry with its reason.
  const ALLOW = {
    "mcIncomeTaxSchedule default 70000": [1, "the slider's opening position; every caller passes its own"],
    "streamsMonthlyAt || 9999": [1, "a stream with no end year runs for ever (a sentinel, not a balance)"],
    "DangerCloseMain || 9999": [1, "the same sentinel, the Income tab's stream count"],
    "MyDataEditor || 9999": [1, "the same sentinel, My Data's stream editor"],
    "_asOfToYM || 2026": [1, "the as-of year placeholder — MissingFeatures D-56"],
    "buildPlanTimeline || 2029": [1, "the retirement-year placeholder — D-56 (disclosed by My Data, v6.22)"],
    "_parseSpreadsheet || 2029": [1, "the same placeholder, read by the spreadsheet import — D-56"],
    "runMonteCarlo default 10000": [1, "the iteration count"],
    "runExtendedMC default 10000": [1, "the iteration count"],
    "layoutWidthClass || 1024": [1, "the window width with no window (a test environment)"],
    "DangerCloseMain || 2033": [2, "the Social Security haircut's year when its field is blank — a setting's default, shown in the field"],
    // v6.46 (D-56, docs/SCOPE_D56_SS_FRA_ESTIMATE_V646.md): the $1,944 is gone from v6.46 — expected on the v6.44 and v6.45 legs only. The list is
    // literal (not widened by the registrar): it names the builds that still carry the fallback.
    "DangerCloseMain || 1944": [["v644", "v645"].includes(VER) ? 1 : 0, "spouse B's FRA estimate with no age-67 figure — removed at v6.46 (D-56; the SS tab's one reading, ssFraOf)"],
    "DangerCloseMain ?: 9999": [1, "the break-even 'never' sentinel"],
    "DangerCloseMain ?: 500000": [1, "home value — disclosed in-app (`_fb`, 'Showing baked-in defaults', ⚠ rows)"],
    "DangerCloseMain ?: 150000": [1, "mortgage balance — disclosed in-app (`_fb`)"],
    "DangerCloseMain || 1963": [1, "spouse A's birth year in the RMD line — dead: the timeline always sets it"],
  };
  const exp = { ...Object.fromEntries(Object.entries(ALLOW).map(([k, [c]]) => [k, c])) };
  if (!POST) { exp["DangerCloseMain ?: 1340645"] = 1; exp["DangerCloseMain ?: 356813"] = 1; }
  const got = {}; hits.forEach(k => { got[k] = (got[k] || 0) + 1; });
  const diff = [...new Set([...Object.keys(exp), ...Object.keys(got)])].filter(k => (exp[k] || 0) !== (got[k] || 0)).map(k => `${k} expected ${exp[k] || 0}, found ${got[k] || 0}`);
  T(`A-3 ${POST ? "" : KD + " "}every numeric literal ≥ 1,000 in a fallback position (||, ??, a ternary's alternate, a default value) is on the named allowlist — ${hits.length} found${POST ? "" : ", the two ladder seeds among them"} (no UNLISTED literal fallback; not "the class is gone")`,
    diff.length === 0, diff.join(" | "));
  if (POST) {
    const nc = decl("_nothingConverts");
    const ncNames = nc.length === 1 ? new Set(all(nc[0].n.init, n => n.type === "Identifier").map(({ n }) => n.name)) : new Set();
    T("A-4 the note's condition is declared once and reads the ladder's rows and the slider — not the start Traditional (the review's finding 1)",
      nc.length === 1 && ["rothAmount", "rows", "conversion"].every(x => ncNames.has(x)) && !["_tradFromPortfolio", "tradBal0", "_rsbL", "_perSeed"].some(x => ncNames.has(x)), [...ncNames].join(","));
    const attr = all(AST, n => n.type === "JSXAttribute" && n.name && n.name.name === "data-dc-ladder-note");
    T("A-5 one element carries data-dc-ladder-note=\"nothing-converts\"", attr.length === 1 && attr[0].n.value && attr[0].n.value.value === "nothing-converts");
  }
}

// ── §B · rendered ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — rendered");
const app = await mountApp(VER);
const P0 = app.DP0;
const R = {};
for (const [nm, f] of Object.entries(SHAPES)) { _src = mulberry(109); await app.visit(f(P0)); R[nm] = app.grab(); await app.reset(); }
_src = mulberry(109); await app.visit(clone(P0)); R.example = app.grab(); await app.reset();
_src = mulberry(109); await app.visit(noTrad(P0), { slide: 0 }); R.noTrad0 = app.grab(); await app.reset();
const col = (r, k) => r.rows.map(x => x[k]);
T(`B-0 SETUP: every shape renders a twelve-row ladder 2029–2040 but bothPast, which renders none (${Object.entries(R).map(([k, r]) => `${k}:${r.rows.length}`).join(" ")})`,
  Object.entries(R).every(([k, r]) => k === "bothPast" ? r.rows.length === 0 : (r.rows.length === 12 && r.rows[0].year === 2029 && r.rows[11].year === 2040)));
T(`B-1 SETUP: the start balances the parameter cards print — noRoth Roth $0, roth1 $1, noTrad and noIra Traditional $0, annOnly Traditional $250,000, noTradLaterB2 $0, rothToTrad Roth $0 (got ${["noRoth", "roth1", "noTrad", "noIra", "annOnly", "noTradLaterB2", "rothToTrad"].map(k => `${k} ${R[k].tradNow}/${R[k].rothNow}`).join("; ")})`,
  R.noRoth.rothNow === "0" && R.roth1.rothNow === "1" && R.noTrad.tradNow === "0" && R.noIra.tradNow === "0" && R.noIra.rothNow === "0"
  && R.annOnly.tradNow === "250,000" && R.noTradLaterB2.tradNow === "0" && R.rothToTrad.rothNow === "0");
if (POST) {
  T(`B-2 the cliff is gone: noRoth's ROTH BAL column equals roth1's, row by row (${col(R.noRoth, "roth").join(" ")})`, col(R.noRoth, "roth").join() === col(R.roth1, "roth").join());
  // the oracle: no Roth, $70,000 converted at the end of 2029's growth — (0 + 70,000) × 1.045 = $73,150 → $0.07M
  T(`B-3 noRoth's 2029 ROTH BAL is the conversion grown one year, $73,150 → $0.07M (got ${R.noRoth.rows[0].roth})`, R.noRoth.rows[0].roth === "$0.07M");
  T(`B-4 rothToTrad (the Roth moved into Traditional, balances unchanged): its ROTH BAL column is noRoth's — the conversions, grown — and its CONVERT column the example's (${col(R.rothToTrad, "roth").join(" ")})`,
    col(R.rothToTrad, "roth").join() === col(R.noRoth, "roth").join() && col(R.rothToTrad, "conv").join() === col(R.example, "conv").join());
  for (const k of ["noTrad", "noIra"]) {
    const r = R[k];
    T(`B-5 ${k}: nothing to convert — every CONVERT $0K, every TRAD BAL $0.00M, total conversion $0.00M, total tax $0, both RMD cards $0 for both spouses, reduced by $0/yr`,
      r.rows.every(x => x.conv === "$0K" && x.trad === "$0.00M") && r.totConv === "$0.00M" && r.totTax === "0"
      && [r.noConvA, r.noConvB, r.withConvA, r.withConvB].every(v => v === 0) && r.red === "0", JSON.stringify({ c: col(r, "conv").join(" "), t: col(r, "trad").join(" "), tot: r.totConv, tax: r.totTax, red: r.red }));
  }
  T(`B-6 noIra's ROTH BAL is $0.00M every year — no Roth and nothing converted (${col(R.noIra, "roth").join(" ")})`, R.noIra.rows.every(x => x.roth === "$0.00M"));
  // noTradLaterB2: B's $24,000 a year for 2029–2032 arrives at the end of each year and converts the next, so 2030–2033 convert about $25K
  const lbConv = col(R.noTradLaterB2, "conv");
  T(`B-7 noTradLaterB2: conversions only in the years B's later contributions are there to convert — 2029 $0K, 2030–2033 non-zero, 2034–2040 $0K (got ${lbConv.join(" ")})`,
    lbConv[0] === "$0K" && lbConv.slice(1, 5).every(x => x !== "$0K") && lbConv.slice(5).every(x => x === "$0K"));
}
else {
  T(`B-2 ${KD}: noRoth's ROTH BAL starts at $0.48M though the plan holds no Roth, and roth1's ($1 of Roth) at $0.07M — the cliff (got ${R.noRoth.rows[0].roth} / ${R.roth1.rows[0].roth})`,
    R.noRoth.rows[0].roth === "$0.48M" && R.noRoth.rows[11].roth === "$1.78M" && R.roth1.rows[0].roth === "$0.07M");
  T(`B-5 ${KD}: noTrad converts $70K a year from $1.44M it does not hold, charges $108,237 of tax, and prints "reduced by $-56,268/yr" (got ${R.noTrad.rows[0].conv} ${R.noTrad.rows[0].trad} $${R.noTrad.totTax} ${R.noTrad.red})`,
    R.noTrad.rows[0].conv === "$70K" && R.noTrad.rows[0].trad === "$1.44M" && R.noTrad.totTax === "108,237" && R.noTrad.red === "-56,268");
}
// the note: keyed to the ladder's result
const NOTE_ON = POST ? ["noTrad", "noIra", "annOnly", "pastA"] : [];
const noteState = Object.fromEntries(Object.entries(R).map(([k, r]) => [k, r.note]));
T(`B-8 ${POST ? "the note shows on noTrad, noIra, annOnly and pastA at $70K (nothing converts), and nowhere else — not on the example, noRoth, roth1, rothToTrad, noTradLaterB2 (B's contributions convert), noTrad at a $0 slider, or bothPast (an empty ladder)" : "(v6.44: there is no note on any shape)"} (${Object.entries(noteState).map(([k, v]) => `${k}:${v ? "on" : "off"}`).join(" ")})`,
  Object.entries(noteState).every(([k, v]) => v === NOTE_ON.includes(k)));
if (POST) T(`B-10 the note's words, wherever it shows, name the three causes — no Traditional, annuity money, a spouse past their window (${R.pastA.noteText.slice(0, 80)}…)`,
  NOTE_ON.every(k => R[k].noteText.includes(NOTE_TEXT) && R[k].noteText.includes("annuity money") && R[k].noteText.includes("past their own conversion window")));
if (POST) T(`B-11 pastA: the plan holds $${R.pastA.tradNow} of Traditional, all spouse A's, whose window closed in 2024 — nothing converts (${col(R.pastA, "conv").join(" ")})`,
  R.pastA.tradNow !== "0" && R.pastA.rows.every(x => x.conv === "$0K"));
if (POST) T(`B-9 annOnly converts nothing though its start Traditional is $250,000 — every CONVERT $0K (${col(R.annOnly, "conv").join(" ")})`, R.annOnly.rows.every(x => x.conv === "$0K"));

// ── §C · page text identical to v6.44 where the plan holds both kinds of money ──────────────────────────────────────────────────────
console.log("  C — v6.44's page where nothing should move");
if (POST && existsSync(join(HERE, `dom_${C_PRIOR}.cjs`))) {
  const dumpFile = join(tmpdir(), `t109_dump_${process.pid}.json`);
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), C_PRIOR, "--dumpdom", dumpFile], { cwd: HERE, encoding: "utf8", timeout: 1500000, maxBuffer: 1 << 26 });
  let prior = null; try { prior = JSON.parse(readFileSync(dumpFile, "utf8")); unlinkSync(dumpFile); } catch (e) {}
  const plans = await C_PLANS(P0), cur = {};
  for (const [nm, P, o] of plans) { _src = mulberry(109); cur[nm] = await app.visit(P, o); await app.reset(); }
  const dk = prior ? Object.keys(cur).filter(k => normVer(rothPart(cur[k])) !== normVer(rothPart(prior[k] || ""))) : ["(no dump)"];
  const firstDiff = k => { const a = normVer(rothPart(cur[k])), b = normVer(rothPart(prior[k] || "")); let i = 0; while (i < a.length && a[i] === b[i]) i++; return `${k} @${i}: …${a.slice(Math.max(0, i - 60), i + 80)}… vs …${b.slice(Math.max(0, i - 60), i + 80)}…`; };
  T(`C-1 the Roth tab (from its opening panel to the page's end) is v6.44's text, save the version string, on ${plans.length} plans holding both kinds of money: the example at PLANNED, −1 and +1 YEAR and at $0 / $70K / $250K, roth1, and every fixture household as it stands (${Object.keys(cur).length} pages, ${prior ? Object.keys(prior).length : 0} prior)`,
    !!prior && Object.keys(cur).length === plans.length && Object.keys(cur).every(k => rothPart(cur[k]).length > 2000 && /ROTH BAL/.test(rothPart(cur[k]))) && dk.length === 0,
    prior ? dk.slice(0, 2).map(firstDiff).join(" | ") : (r.stderr || r.stdout || "").slice(-300));
  T(`C-2 the −1 and +1 YEAR pages are other ladders — the selector moved (${[cur["example -1 YEAR"], cur.example, cur["example +1 YEAR"]].map(t => (t.match(/ROTH CONVERSION STRATEGY — (\d{4})/) || [])[1]).join(", ")})`,
    (cur["example -1 YEAR"].match(/ROTH CONVERSION STRATEGY — (\d{4})/) || [])[1] === "2028" && (cur["example +1 YEAR"].match(/ROTH CONVERSION STRATEGY — (\d{4})/) || [])[1] === "2030");
} else console.log(`     (§C: ${POST ? `no dom_${C_PRIOR}.cjs in this run folder — skipped` : "the v6.44 leg has nothing to compare with — skipped"})`);

// ── §D · hand pins, dollar-exact (the RMD cards) ───────────────────────────────────────────────────────────────────────────────
console.log("  D — hand pins");
{
  // The example, both legs: first-year RMD cards, no conversion and with $70K a year (t23's household; unchanged by this release). The
  // no-conversion figures, by hand from the example's own fields (the build review's working): spouse A holds $1,090,000 of Traditional today
  // ($1,000,000 in holdings, $90,000 in two IRAs), carried to 2029 at 1.02535³, plus $90,000 of planned contributions at face ($2,500 × 36);
  // grown 4.5% for the ten years to 31 December 2038 and ÷ 24.6 (age 75). Spouse B holds $206,000 ($185,000, a $14,000 state plan and a
  // $7,000 annuity), carried, plus $12,600 at face; less the annuity's carried share; grown twelve years to 31 December 2040, ÷ 24.6.
  { const k = Math.pow(1.02535, 3), a0 = 1090000 * k + 90000, b0 = 206000 * k + 12600, ann = 7000 * k;
    const hA = Math.round(a0 * Math.pow(1.045, 10) / 24.6), hB = Math.round((b0 - ann) * Math.pow(1.045, 12) / 24.6);
    T(`D-0 the example's no-conversion cards by hand: A $${hA.toLocaleString("en-US")}, B $${hB.toLocaleString("en-US")}`, hA === 79859 && hB === 15657); }
  T(`D-1 the example's first-year RMD cards, both legs: $79,859 / $15,657 with no conversion, $50,215 / $4,026 with $70K a year, reduced by $41,275/yr (got ${R.example.noConvA} / ${R.example.noConvB}, ${R.example.withConvA} / ${R.example.withConvB}, ${R.example.red})`,
    R.example.noConvA === 79859 && R.example.noConvB === 15657 && R.example.withConvA === 50215 && R.example.withConvB === 4026 && R.example.red === "41,275");
  // noTrad's with-conversion card. By hand (the scope's review, recomputed here): the plan's inflation in this render is 2.535%/yr, so the
  // carry 2026 → 2029 is 1.02535³; v6.44 seeded A's Traditional at 1,340,645 × that, then each ladder year 2029–2038 grew it 4.5% and took
  // the $70,000 conversion (no RMD before 75); A's first RMD (2039, age 75) divides the 31 December 2038 balance by 24.6 (Pub. 590-B
  // Table III). From v6.45 the plan holds no Traditional, so the card is $0.
  let bal = 1340645 * Math.pow(1.02535, 3); for (let y = 2029; y <= 2038; y++) bal = bal * 1.045 - 70000;
  const hand = Math.round(bal / 24.6);
  if (!POST) T(`D-2 the hand computation of v6.44's phantom card: $${Math.round(bal).toLocaleString("en-US")} ÷ 24.6 = $56,268 (got $${hand.toLocaleString("en-US")})`, hand === 56268);
  if (POST) T(`D-3 noTrad's with-conversion card is $0 — the plan holds no Traditional (got ${R.noTrad.withConvA})`, R.noTrad.withConvA === 0);
  else T(`D-3 ${KD}: noTrad's with-conversion card is the hand-computed $56,268 from money the plan does not hold (got ${R.noTrad.withConvA})`, R.noTrad.withConvA === hand);
  // noTradLaterB2: B (born 1966, first RMD at 75 in 2041) contributes $24,000 a year for 2029–2032; with no conversion each grows 4.5% a year to
  // 31 December 2040, and the sum ÷ 24.6 is her first RMD. With $70K a year every one is converted the year after it arrives, so 0.
  let lbSum = 0; for (let y = 2029; y <= 2032; y++) lbSum += 24000 * Math.pow(1.045, 2040 - y);
  const lbNo = Math.round(lbSum / 24.6);
  T(`D-4 noTradLaterB2's spouse-B no-conversion card is her later contributions grown to 2040 ÷ 24.6: $${Math.round(lbSum).toLocaleString("en-US")} → $${lbNo.toLocaleString("en-US")} (got ${R.noTradLaterB2.noConvB})`,
    lbNo === 5936 && R.noTradLaterB2.noConvB === lbNo);
  if (POST) T(`D-5 noTradLaterB2: with conversions B's card is $0 and the reduction is $5,936/yr (got ${R.noTradLaterB2.withConvB}, ${R.noTradLaterB2.red})`, R.noTradLaterB2.withConvB === 0 && R.noTradLaterB2.red === "5,936");
}
await app.unmount();

// ── §E · the copy ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the copy");
{
  const DOCS = String((typeof app.DG.DOCS_HTML === "function" ? app.DG.DOCS_HTML() : app.DG.DOCS_HTML) || "");   // the shim exports getters
  const NOTE = "The Roth conversion ladder’s starting balances (v6.45).";
  if (POST) {
    T("E-1 the Field Manual's §13 carries the v6.45 note, ahead of v6.44's", DOCS.includes(NOTE) && DOCS.indexOf(NOTE) < DOCS.indexOf("A spouse who retires later, and a single plan’s spouse-B data (v6.44)."));
    T("E-2 the note names both fallbacks and says what did not move", DOCS.includes("a fixed $356,813 left over from the example household") && DOCS.includes("a fixed $1,340,645 the plan does not hold")
      && DOCS.includes("Nothing outside the ladder read either figure"));
    const meth = existsSync(join(HERE, "..", "METHODOLOGY.md")) ? readFileSync(join(HERE, "..", "METHODOLOGY.md"), "utf8") : null;
    if (meth !== null) T("E-3 METHODOLOGY carries the section 'The Roth ladder starts from the plan's own balances (v6.45)'", meth.includes("## The Roth ladder starts from the plan's own balances (v6.45)"));
    else console.log("     (E-3: no METHODOLOGY.md in the run folder's root — skipped)");
  } else T("E-1 (v6.44): no v6.45 note", !DOCS.includes(NOTE));
}

console.log(`\nt109 SUITE (${VER}): ${pass} passed, ${fail} failed`);
finished = true;
process.exit(fail ? 1 : 0);
