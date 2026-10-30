// t102 — THE INCOME TAB ON A PHONE, AND WHAT IT SAYS WHEN INCOME COVERS SPENDING (v6.38, F-20)
//
//  Scope: docs/SCOPE_F20_INCOME_TAB_PHONE_V638.md (DF-1 to DF-6, all (a)). Through v6.37, on a phone (390 px), the Income tab's stream list
//  scrolled the page sideways for any plan with an income stream (F-20), and on every plan its three income cards and each phase card's
//  figure row printed over each other. When a plan's income covered its spending, six places printed spending less income unguarded —
//  "-$-1,302", "$-1,302/mo shortfall × 12" — and the floor assessment said that negative shortfall "comes from portfolio withdrawals". The
//  coverage metric before spouse A's Social Security counted spouse B's check whether or not B had claimed, no income stream, and showed
//  even when there was no gap. Display only; no engine changes.
//
//  LAYOUT IS t45's. jsdom does no layout, so this suite holds the STRUCTURE that makes the phone layout work — the rules exist only inside
//  the v5.81 phone block (so nothing at 600 px and up can move: identical by construction) and sit on the right elements. Whether the page
//  fits and nothing overprints is measured in Chromium by t45.
//
//  §A  the source: the phone rules only inside `@media (max-width: 599px)`; the classes on the right elements; EXTINCTION — no
//      expression subtracts the steady-state income except the two named differences.
//  §B  the example: its Income tab's text equals v6.37's except one restored space (v6.38 leg, the v6.37 leg dumped in a child process
//      when the run folder holds it); and its figures, typed here.
//  §C  plans whose income covers spending — above it (a stream; a pension, no stream) and exactly at it: no negative figure anywhere on the
//      tab, and each of the six sites in its covered form, the surplus computed here from the plan.
//  §D  the coverage metric before spouse A's Social Security: the example; a stream at retirement; spouse B claiming after retirement;
//      no gap. Expected figures computed here.
//  §E  the Field Manual: §13's v6.38 note first, and the desktop item's phone sentence.
//  §F  rendered structure: the stream rows, the three-card grid and the phase rows carry their classes.
//  The v6.37 leg pins each defect as a dated [KNOWN DEFECT 2026-10-29, F-20 — flips at v6.38].
//  Both legs: node t102_income_tab.mjs v637 | node t102_income_tab.mjs v638. Controls: qa/tools/controls_v638_income.py (repo-only).
//  Exits with process.exit (the rendered app leaves timers running).
import { window, dom } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let _src = mulberry(102); Math.random = () => _src();   // installed BEFORE the app loads: d3 captures Math.random at load
globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.FileReader = window.FileReader;   // t38's HARNESS TRAP
console.error = () => {}; console.warn = () => {};

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v638";
const DUMP = process.argv.includes("--dump");
const KNOWN_VERSIONS = ["v637", "v638", "v639"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}
const POST = ["v638", "v639"].includes(VER);   // an array, so the next registration widens it
const B_PRIOR = "v637";                // §B's prior leg — a constant, so the registrar cannot widen it (t76 records why)
const KD = "[KNOWN DEFECT 2026-10-29, F-20 — flips at v6.38]";
dom.reconfigure({ url: "https://stextor.github.io/danger-close/" }); globalThis.location = window.location;

let pass = 0, fail = 0, finished = false;
const T = (n, ok, d = "") => { if (ok) { pass++; if (process.env.T102_VERBOSE) console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d ? " — " + String(d).slice(0, 400) : ""}`); } };
process.on("exit", () => { if (!finished && !DUMP) { console.log(`t102 SUITE (${VER}): ${pass} passed, ${fail + 1} failed (DIED before the end)`); process.exitCode = 1; } });
const clone = o => JSON.parse(JSON.stringify(o));
const require = createRequire(import.meta.url);
if (!DUMP) console.log(`t102 — THE INCOME TAB ON A PHONE, AND WHEN INCOME COVERS SPENDING (${VER})`);

// ── §A · the source ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SRC = readFileSync(join(HERE, "..", `${VER}.jsx`), "utf8");
const { Parser } = require("acorn"); const jsx = require("acorn-jsx");
const AST = Parser.extend(jsx()).parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true, ranges: true });
const kids = n => { const o = []; for (const k of Object.keys(n)) { if (k === "loc" || k === "range") continue; const v = n[k];
  if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && o.push(x)); else if (v && typeof v.type === "string") o.push(v); } return o; };
const all = (root, pred, out = [], parent = null) => { if (pred(root, parent)) out.push(root); for (const c of kids(root)) all(c, pred, out, root); return out; };
const SRCOF = n => SRC.slice(n.range[0], n.range[1]);
// The app's stylesheet is one template literal holding the v5.81 phone block. Its rules are read from the source, never from a render.
const SHEET = all(AST, n => n.type === "TemplateLiteral" && n.quasis.some(q => (q.value.cooked || "").includes("@media (max-width: 599px)")));
const CSS = SHEET.length === 1 ? SHEET[0].quasis.map(q => q.value.cooked).join("") : "";
const blockOf = (css, at) => { const i = css.indexOf(at); if (i < 0) return ""; let d = 0, j = css.indexOf("{", i);
  for (let k = j; k < css.length; k++) { if (css[k] === "{") d++; else if (css[k] === "}" && --d === 0) return css.slice(j + 1, k); } return ""; };
const PHONE = blockOf(CSS, "@media (max-width: 599px)");
const OUTSIDE = CSS.replace(PHONE, "");
const SEL = [".dc-stack-phone", ".dc-two-phone", ".dc-streamrow", ".dc-streamrow > .dc-sr-label", ".dc-streamrow > .dc-sr-desc", ".dc-streamrow > .dc-sr-amt"];
const jsxWithClass = c => all(AST, n => n.type === "JSXOpeningElement" && n.attributes.some(a => a.type === "JSXAttribute" && a.name.name === "className" && a.value && a.value.type === "Literal" && a.value.value === c));
const styleOf = n => { const a = n.attributes.find(a => a.type === "JSXAttribute" && a.name.name === "style"); return a ? SRCOF(a).replace(/\s+/g, "") : ""; };
// Subtractions of the steady-state income: X - _steadyInc. From v6.38 only the two named differences may hold one.
const SUBS = all(AST, (n, p) => n.type === "BinaryExpression" && n.operator === "-" && n.right.type === "Identifier" && n.right.name === "_steadyInc");
const subParent = new Map(); all(AST, (n, p) => { if (n.type === "BinaryExpression" && n.operator === "-" && n.right.type === "Identifier" && n.right.name === "_steadyInc") subParent.set(n, p); return false; });
const declNames = SUBS.map(s => { const p = subParent.get(s); return p && p.type === "VariableDeclarator" ? p.id.name : (p && p.type === "ConditionalExpression" && p.consequent === s ? "cond" : p ? p.type : "?"); });
if (!DUMP) {
  console.log("  A — the source");
  T("A-0 SETUP: one stylesheet template holds the v5.81 phone block", SHEET.length === 1 && PHONE.length > 50, `${SHEET.length} / ${PHONE.length}`);
  if (POST) {
    T("A-1 each of the six phone rules is inside the phone block, once", SEL.every(s => PHONE.split(s + " {").length === 2), SEL.map(s => s + ":" + (PHONE.split(s + " {").length - 1)).join(" "));
    T("A-1b …and none of the five v6.38 classes is styled outside it, so nothing at 600 px and up can move (identical by construction)",
      ["dc-stack-phone", "dc-two-phone", "dc-streamrow", "dc-sr-label", "dc-sr-desc", "dc-sr-amt"].every(c => !OUTSIDE.includes("." + c)));
    T("A-1c the rules say what they do: the cards stack, the phase figures go two to a row, the row wraps, the label shrinks, the description takes 160 px before wrapping, the amount sits right",
      /\.dc-stack-phone \{ grid-template-columns: minmax\(0, 1fr\) !important; \}/.test(PHONE) && /\.dc-two-phone \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important; \}/.test(PHONE)
      && /\.dc-streamrow \{ flex-wrap: wrap;/.test(PHONE) && /\.dc-sr-label \{ min-width: min\(170px, 100%\) !important; flex-shrink: 1 !important;/.test(PHONE)
      && /\.dc-sr-desc \{ flex: 1 1 160px !important; min-width: 0;/.test(PHONE) && /\.dc-sr-amt \{ margin-left: auto; \}/.test(PHONE));
    const g = jsxWithClass("dc-stack-phone"), t2 = jsxWithClass("dc-two-phone"), r = jsxWithClass("dc-streamrow"), l = jsxWithClass("dc-sr-label"), d = jsxWithClass("dc-sr-desc"), a = jsxWithClass("dc-sr-amt");
    T("A-2 one element each: the three-card grid (three columns), the phase figure row (five columns), the stream row and its label, description and amount",
      g.length === 1 && styleOf(g[0]).includes('gridTemplateColumns:"minmax(0,1fr)minmax(0,1fr)minmax(0,1fr)"') && t2.length === 1 && styleOf(t2[0]).includes('gridTemplateColumns:"repeat(5,minmax(0,1fr))"')
      && r.length === 1 && l.length === 1 && d.length === 1 && a.length === 1 && styleOf(l[0]).includes("minWidth:170,flexShrink:0") && styleOf(d[0]).includes("flex:1}"),
      [g, t2, r, l, d, a].map(x => x.length).join(","));
    const PP = all(AST, n => n.type === "BinaryExpression" && n.operator === "-" && n.right.type === "Identifier" && n.right.name === "_ppInc");
    const inRound = n => all(AST, c => c.type === "CallExpression" && c.callee.type === "MemberExpression" && c.callee.object.name === "Math" && c.callee.property.name === "round" && c.arguments[0] === n).length === 1;
    T("A-3 EXTINCTION: spending less income is computed in exactly two places, each rounded and named (_shortSteady, from _steadyInc; _shortPost, from the after-payments income _ppInc) — no template prints it raw",
      SUBS.length === 1 && inRound(SUBS[0]) && PP.length === 1 && inRound(PP[0])
      && all(AST, n => n.type === "VariableDeclarator" && ["_shortSteady", "_shortPost"].includes(n.id.name)).length === 2, `${SUBS.length} / ${PP.length}`);
    const ppd = all(AST, n => n.type === "VariableDeclarator" && n.id.name === "_ppInc");
    T("A-3b the after-payments income counts the streams running on the date the payments end (POST_PAYMENTS.from), not at the last Medicare month",
      ppd.length === 1 && SRCOF(ppd[0].init).replace(/\s+/g, "") === "POST_PAYMENTS?totalIncome+_stAt(POST_PAYMENTS.from.year*12+POST_PAYMENTS.from.month):0", ppd[0] && SRCOF(ppd[0].init));
    const cov = all(AST, n => n.type === "VariableDeclarator" && n.id.name === "_preAInc");
    T("A-4 the coverage metric's income is the gap card's rule: spouse B only from B's claim month, the pension, the streams at retirement",
      cov.length === 1 && SRCOF(cov[0].init).replace(/\s+/g, "") === "(ssBYM<=retireYM?spouseBSS:0)+pension+_stAt(retireYM)", cov[0] && SRCOF(cov[0].init));
  } else {
    T(`A-1 ${KD} no phone rule reaches the Income tab`, !/dc-stack-phone|dc-two-phone|dc-streamrow/.test(CSS));
    T(`A-3 ${KD} six expressions print spending less the steady-state income unguarded`, SUBS.length === 6, `${SUBS.length}`);
  }
}

// ── the DOM ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PREFIX = "dc:";
window.confirm = () => true;
window.storage = {
  async get(key) { const v = window.localStorage.getItem(PREFIX + key); if (v === null) throw new Error("key not found: " + key); return { key, value: v }; },
  async set(key, value) { window.localStorage.setItem(PREFIX + key, value); return { key, value }; },
  async delete(key) { window.localStorage.removeItem(PREFIX + key); return { key, deleted: true }; },
  async list(prefix = "") { const keys = []; for (let i = 0; i < window.localStorage.length; i++) { const k = window.localStorage.key(i); if (k.startsWith(PREFIX) && k.slice(PREFIX.length).startsWith(prefix)) keys.push(k.slice(PREFIX.length)); } return { keys }; },
};
require(`./dom_${VER}.cjs`);
const React = require("react");
const DG = window.__g, K = DG.STORAGE_KEYS();
const body = () => window.document.body;
// Text without cloning (t101's trap: jsdom's cloneNode throws on some colour-mix backgrounds): walk the text nodes, skip <style>/<script>.
const txt = () => { const w = window.document.createTreeWalker(body(), 4); let out = "", n;
  while ((n = w.nextNode())) { const p = n.parentNode && n.parentNode.nodeName; if (p !== "STYLE" && p !== "SCRIPT") out += n.nodeValue; } return out.replace(/\s+/g, " "); };
const btn = re => [...body().querySelectorAll("button")].find(b => re.test(b.textContent || ""));
const tabBtn = name => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
let root = null, act, el;
const flush = async (ms = 40) => { try { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); } catch (e) {} };
const click = async x => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const unmount = async () => { if (root) { try { await act(async () => { root.unmount(); }); } catch (e) {} } if (el) el.remove(); root = null; };
const render = async () => { await unmount(); el = window.document.createElement("div"); body().appendChild(el); let DangerClose; ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {} for (let i = 0; i < 4; i++) await flush(); };
const go = async name => { if (!tabBtn(name) && btn(/SHOW ALL TABS/)) await click(btn(/SHOW ALL TABS/)); await click(tabBtn(name)); await flush(); await flush(); };
const put = (k, v) => window.localStorage.setItem(PREFIX + K[k], typeof v === "string" ? v : JSON.stringify(v));
const seed = async (portfolio, expenses) => { await unmount(); window.localStorage.clear(); if (portfolio !== undefined) put("portfolio", portfolio);
  if (expenses !== undefined) put("expenses", expenses); await render(); };
// The Income tab's own text: from its heading to the footer.
const incomeText = () => { const t = txt(); const i = t.indexOf("INCOME SOURCES & PORTFOLIO DRAW ANALYSIS"); const j = t.indexOf("DANGER CLOSE v6.", i); return i < 0 ? "" : t.slice(i, j < 0 ? undefined : j); };
const money = n => "$" + Math.round(n).toLocaleString("en-US");

await seed(); await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]);
for (let i = 0; i < 3; i++) await flush();
const EXP = clone(DG.PORTFOLIO()), EXE = clone(DG.EXPENSES());
await go("income"); const EX_TXT = incomeText();
if (DUMP) { process.stdout.write("DUMP:" + JSON.stringify(EX_TXT) + "\n"); finished = true; process.exit(0); }
T("SETUP: the example loaded and its Income tab rendered (spouse A plans 67, spouse B 63; no income stream)",
  EXP.incomeSources?.ssA?.plannedAge === 67 && EXP.incomeSources?.ssB?.plannedAge === 63 && !(EXP.incomeStreams || []).length && EX_TXT.length > 2000, EX_TXT.length);

// The plan's figures, read from the plan and the expense snapshots — never from the tab.
const model = () => { const tl = DG.PLAN_TIMELINE(), single = !!tl.single; const ym = d => d.year * 12 + d.month;
  const R = tl.targetRetireYear, retireYM = R * 12 + 1, ssAYM = ym(tl.ssA_date), ssBYM = single ? Infinity : tl.ssB_date.year * 12 + (tl.ssB_date.month || 1);
  const last = single ? ym(tl.medicareA) : ym(tl.medicareB), ph3 = Math.max(retireYM, last);
  const A = DG.getSSA(), B = single ? 0 : DG.getSSB(), pen = DG.getPension(), st = y => Math.round(DG.streamsMonthlyAt(y, 1));
  const steady = A + B + pen + st(Math.floor((ph3 - 1) / 12)); const S = DG.snapshots(), pp = DG.postPayments ? DG.postPayments() : null;
  return { tl, single, R, retireYM, ssAYM, ssBYM, A, B, pen, steady, full: S.full, early: S.early, pp, gap: Math.max(0, ssAYM - retireYM),
    preA: (ssBYM <= retireYM ? B : 0) + pen + st(R) }; };

// ── §B · the example ────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the example");
{ const m = model();
  T("B-1 the example's figures, typed: income $5,000 against $8,020; $3,020 short once all income flows, $2,620 after the car payment",
    m.steady === 5000 && m.full === 8020 && !!m.pp && m.pp.monthly === 7620, `${m.steady} ${m.full} ${m.pp && m.pp.monthly}`);
  T("B-2 the shortfall copy stands on the example, where the shortfall is positive (t84 G-1's wording kept)",
    /Monthly Shortfall \(steady state\)\s*-\$3,020\s*\$36,240\/yr from portfolio/.test(EX_TXT) && /Monthly Shortfall \(after Car Payment ends\)\s*-\$2,620\s*\$31,440\/yr from portfolio, from May 2034/.test(EX_TXT)
    && /Steady-state draw\s*\$36,240\/yr\s*\$3,020\/mo shortfall × 12/.test(EX_TXT) && /Draw after Car Payment ends\s*\$31,440\/yr\s*\$2,620\/mo shortfall × 12, from May 2034/.test(EX_TXT)
    && /The \$3,020\/mo shortfall comes from portfolio withdrawals/.test(EX_TXT), "");
  if (POST) {
    T("B-3 the floor's sentences are spaced: \"of expenses. The\" and \"at its mix. From May 2034\" (through v6.37 the second read \"mix.From\")",
      /of expenses\. The \$3,020\/mo shortfall/.test(EX_TXT) && /at its mix\. From May 2034, after Car Payment ends, the shortfall is \$2,620\/mo/.test(EX_TXT));
    const dom637 = join(HERE, `dom_${B_PRIOR}.cjs`), src637 = join(HERE, "..", `${B_PRIOR}.jsx`);
    if (existsSync(dom637) && existsSync(src637)) {
      const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), B_PRIOR, "--dump"], { cwd: HERE, encoding: "utf8", timeout: 600000, maxBuffer: 1 << 26 });
      const line = (r.stdout || "").split("\n").find(l => l.startsWith("DUMP:")); const prior = line ? JSON.parse(line.slice(5)) : null;
      T("B-4 the example's Income tab text equals v6.37's, but for the space restored after \"at its mix.\" — nothing else on the example moved",
        prior !== null && prior.replace("at its mix.From May", "at its mix. From May") === EX_TXT && prior !== EX_TXT, prior === null ? (r.stderr || "").slice(-300) : "differs");
    } else console.log(`  · B-4 skipped: this run folder holds no ${B_PRIOR} leg (dom_${B_PRIOR}.cjs) — it runs in a ${B_PRIOR} → ${VER} folder`);
  } else {
    T(`B-3 ${KD} the after-payments sentence runs on without a space ("at its mix.From May 2034")`, /at its mix\.From May 2034/.test(EX_TXT));
  }
}

// ── §C · plans whose income covers spending ────────────────────────────────────────────────────────────────────────────────────
console.log("  C — income at or above spending");
const rental = m => [{ label: "Rental", kind: "rental", owner: "joint", monthly: m, startYear: 2026, endYear: 9999, cola: false, tax: "ordinary" }];
const NEG = /-\$-\d|\$-\d/;
// Expected surpluses are typed here from the plan's figures (B-1: $5,000 of income, $8,020 of spending, $7,620 after the car payment), not
// read back from the app: a $9,000 rental gives $14,000 (surplus $5,980; $6,380 after the payment); a $9,000 pension in place of $400 gives
// $13,600 ($5,580; $5,980); a $3,020 rental gives exactly $8,020 ($0; $400).
const covered = async (label, P, sur, surP) => {
  await seed(P, clone(EXE)); await go("income"); const t = incomeText(), m = model();
  T(`C-${label}-0 SETUP: income ${money(m.full + sur)} against ${money(m.full)}; after the payments end ${money(m.pp.monthly)}`, m.steady === m.full + sur && m.full === 8020 && t.length > 2000, `${m.steady} ${m.full}`);
  if (POST) {
    T(`C-${label}-1 no negative figure anywhere on the Income tab`, !NEG.test(t), (t.match(/.{40}(-\$-\d|\$-\d).{20}/) || [""])[0]);
    const say = d => d > 0 ? `income exceeds spending by ${money(d)}/mo` : "income equals spending";
    T(`C-${label}-2 Key income metrics: each shortfall reads $0, with "${say(sur)}" and "${say(surP)}, from May 2034"`,
      new RegExp(`Monthly Shortfall \\(steady state\\)\\s*\\$0\\s*${say(sur).replace(/\$/g, "\\$")}`).test(t)
      && new RegExp(`Monthly Shortfall \\(after Car Payment ends\\)\\s*\\$0\\s*${say(surP).replace(/\$/g, "\\$")}, from May 2034`).test(t), "");
    T(`C-${label}-3 the summary cards: $0/yr each, with the same surplus`,
      new RegExp(`Steady-state draw\\s*\\$0/yr\\s*${say(sur).replace(/\$/g, "\\$")}`).test(t) && new RegExp(`Draw after Car Payment ends\\s*\\$0/yr\\s*${say(surP).replace(/\$/g, "\\$")}, from May 2034`).test(t), "");
    const floorS = sur > 0 ? `On this tab's figures that is ${money(sur)}/mo more than they cost, so at that point there is no shortfall to draw from the portfolio.` : "On this tab's figures that is exactly what they cost, so at that point there is no shortfall to draw from the portfolio.";
    T(`C-${label}-4 the floor assessment says there is no shortfall to draw at that point, and never that one "comes from portfolio withdrawals"`,
      t.includes(floorS) && t.includes(`From May 2034, after Car Payment ends, ${say(surP)}.`) && !/shortfall comes from portfolio withdrawals/.test(t), "");
  } else {
    T(`C-${label}-1 ${KD} the tab prints a negative shortfall and says it comes from the portfolio`, NEG.test(t) || (sur === 0 && /-\$0/.test(t)), "");
  }
  return t;
};
const TA = await covered("a", { ...clone(EXP), incomeStreams: rental(9000) }, 5980, 6380);
{ const P = clone(EXP); P.incomeSources.pension = { ...P.incomeSources.pension, amount: 9000 }; await covered("b", P, 5580, 5980); }
await covered("c", { ...clone(EXP), incomeStreams: rental(3020) }, 0, 400);
// The gap, when income covers it (the $9,000 rental: $1,300 + $400 + $9,000 = $10,700 at retirement against $8,170): nothing is drawn.
if (POST) {
  T("C-a-5 the gap card, the first phase card and the floor say income covers the gap — none says the portfolio draws it",
    /on this tab's figures income covers it, so nothing is drawn/.test(TA) && /Income covers spending in this phase, on this tab's figures\./.test(TA)
    && /24-month income gap, which income covers on this tab's figures\./.test(TA) && !/the model draws it from the portfolio/.test(TA) && !/Maximum vulnerability/.test(TA), "");
} else {
  T(`C-a-5 ${KD} a gap that costs $0 is said to be drawn from the portfolio`, /the model draws it from the portfolio/.test(TA) && /Maximum vulnerability — portfolio covers the shortfall/.test(TA), "");
}
// A stream that ends (the review's case): a $9,000 rental for life and spouse A's $2,500 consulting, 2029–2032. Once all Social Security
// flows (spouse B's Medicare month, 2031) both run: $16,500 against $8,020. When the car payment ends (May 2034) only the rental does:
// $14,000 against $7,620 — a surplus of $6,380, where v6.37 kept the consulting and printed $8,880.
{ const P = { ...clone(EXP), incomeStreams: [...rental(9000), { label: "Consulting", kind: "work", owner: "A", monthly: 2500, startYear: 2029, endYear: 2032, cola: false, tax: "ordinary" }] };
  await seed(P, clone(EXE)); await go("income"); const t = incomeText(), m = model();
  T("C-d-0 SETUP: both streams counted once all Social Security flows ($16,500)", m.steady === 16500, m.steady);
  if (POST) {
    T("C-d-1 after the car payment ends the tab counts the streams running then: income exceeds spending by $6,380/mo (not $8,880)",
      /Monthly Shortfall \(after Car Payment ends\)\s*\$0\s*income exceeds spending by \$6,380\/mo, from May 2034/.test(t) && /after Car Payment ends, income exceeds spending by \$6,380\/mo\./.test(t) && !/8,880/.test(t), "");
    T("C-d-2 the floor names the first counted stream that ends", t.includes("The figures above count Consulting, which ends in 2032; after that this tab's income is lower."), "");
  } else {
    T(`C-d-1 ${KD} the after-payments figure still counts a stream that ended in 2032 ($-8,880)`, /\$-8,880/.test(t), "");
  }
}
// Cents (a CSV import can carry them): a $400.40 pension leaves a $3,019.60 shortfall, printed as a whole dollar.
{ const P = clone(EXP); P.incomeSources.pension = { ...P.incomeSources.pension, amount: 400.4 };
  await seed(P, clone(EXE)); await go("income"); const t = incomeText();
  if (POST) T("C-e-1 a shortfall with cents prints to the dollar everywhere on the tab's draw figures: -$3,020, $36,235/yr, $6,470/mo × 24 = $155,280 in the gap, the phase cards' −$6,470/mo",
    /Monthly Shortfall \(steady state\)\s*-\$3,020(?![\d.])/.test(t) && /\$36,235\/yr/.test(t) && /\$3,020\/mo shortfall × 12/.test(t) && /\$155,280\$6,470\/mo × 24 months/.test(t)
    && /DRAW −\$6,470\/mo/.test(t) && !/[−-]\$[\d,]+\.\d|[\d,]+\.\d\/mo shortfall|[\d,]+\.\d\/mo ×|\$[\d,]+\.\d\/yr from portfolio|155,270/.test(t), (t.match(/.{30}([−-]\$[\d,]+\.\d|[\d,]+\.\d\/mo (shortfall|×)).{10}/) || [""])[0]);   // the plan's own $400.40 pension may print as entered
  else T(`C-e-1 ${KD} a shortfall with cents prints them: -$3,019.6`, /-\$3,019\.6/.test(t), ""); }

// ── §D · the coverage metric before spouse A's Social Security ──────────────────────────────────────────────────────────────────
console.log("  D — coverage before spouse A's Social Security");
const covLine = t => (t.match(/Income Coverage \(pre-Spouse A SS\)\s*(.{0,90})/) || ["", ""])[1];
const pct = (a, b) => `${((a / b) * 100).toFixed(0)}%`;
{ await seed(clone(EXP), clone(EXE)); await go("income"); const m = model(), c = covLine(incomeText());
  T("D-1 the example: B claims at retirement, so both rules give 21%, $1,700 of $8,170/mo (computed: B + pension, no stream)",
    m.gap === 24 && m.preA === 1700 && m.early === 8170 && c.startsWith(`${pct(1700, 8170)}$1,700 of $8,170/mo`), c); }
{ await seed({ ...clone(EXP), incomeStreams: rental(1200) }, clone(EXE)); await go("income"); const m = model(), c = covLine(incomeText());
  if (POST) T("D-2 a $1,200 rental running at retirement counts: $2,900 of $8,170/mo (35%)", m.preA === 2900 && c.startsWith(`${pct(2900, 8170)}$2,900 of $8,170/mo`), c);
  else T(`D-2 ${KD} the rental running at retirement is left out: still $1,700 of $8,170/mo`, c.startsWith("21%$1,700 of $8,170/mo"), c); }
{ const P = clone(EXP); P.incomeSources.ssB = { ...P.incomeSources.ssB, plannedAge: 64, planned: P.incomeSources.ssB.tableByAge[64] };
  await seed(P, clone(EXE)); await go("income"); const m = model(), c = covLine(incomeText());
  const bYM = m.ssBYM, bWhen = `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][(bYM - 1) % 12]} ${Math.floor((bYM - 1) / 12)}`;
  T("D-3 SETUP: spouse B at 64 claims after retirement and before spouse A", m.ssBYM > m.retireYM && m.ssBYM < m.ssAYM && m.B > 0, `${m.ssBYM} ${m.retireYM} ${m.ssAYM}`);
  if (POST) T(`D-3 spouse B claiming after retirement is not counted at retirement: ${money(m.pen)} of $8,170/mo, and the line says when B's check starts`,
    m.preA === m.pen && c.startsWith(`${pct(m.pen, 8170)}${money(m.pen)} of $8,170/mo at retirement; Spouse B's SS from ${bWhen}`), c);
  else T(`D-3 ${KD} spouse B's check is counted before B claims`, c.startsWith(`${pct(m.B + m.pen, m.early)}${money(m.B + m.pen)} of`), c); }
{ const P = clone(EXP); P.incomeSources.ssA = { ...P.incomeSources.ssA, plannedAge: 62, planned: P.incomeSources.ssA.tableByAge[62] ?? DG.genSSTable(3300, 67)[62] };
  await seed(P, clone(EXE)); await go("income"); const m = model(), t = incomeText(), c = covLine(t);
  T("D-4 SETUP: spouse A at 62 claims before retirement — no gap", m.gap === 0 && /NO INCOME GAP/.test(t), m.gap);
  if (POST) T("D-4 with no gap the metric shows no figure and says why", c.startsWith("—no gap: Spouse A's Social Security is flowing at retirement"), c);
  else T(`D-4 ${KD} a percentage is shown though there is no gap`, /^\d+%/.test(c), c); }

// ── §E · the Field Manual ───────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — the Field Manual");
{ const D = (all(AST, n => n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML")[0] || {}).init; const H = D ? (D.type === "Literal" ? D.value : D.type === "TemplateLiteral" ? D.quasis.map(q => q.value.cooked).join("") : "") : "";
  const N38 = H.indexOf("<li><strong>The Income tab on a phone, and when income covers spending (v6.38).</strong>"), N37 = H.indexOf("<li><strong>The SS tab’s claim-age explorer starts at your plan (v6.37).</strong>");
  const item = (() => { const i = H.indexOf("Designed for a desktop browser."); return i < 0 ? "" : H.slice(i, H.indexOf("</li>", i)); })();
  T("E-0 SETUP: the Field Manual and its desktop item were found", H.length > 100000 && item.length > 200, `${H.length} ${item.length}`);
  if (POST) {
    T("E-1 §13's v6.38 note is there, ahead of v6.37's, and names the negative shortfall, the phone and the coverage figure",
      N38 > 0 && N37 > N38 && /“-\$-1,302”/.test(H.slice(N38, N37)) && /On a phone they now stack and wrap; the tablet and desktop layout is unchanged/.test(H.slice(N38, N37)) && /counts the income streams running on that date/.test(H.slice(N38, N37)) && /only once it has started/.test(H.slice(N38, N37)));
    T("E-2 the desktop item says what still overprints on a phone, and where (DF-5 (a))",
      /On a phone some figures still print over their neighbours: the Roth tab’s IRMAA calendar, the Stress tab’s scenario table, and parts of the My Data, Social Security, Expenses and Taxes tabs \(v6\.38: the Income tab’s were fixed\)/.test(item)
      && /A screen 680 px wide or more \(a desktop, or a tablet held sideways\) shows them apart, except that a long category name on the Expenses tab can run under its item at any width/.test(item));
  } else {
    T(`E-1 ${KD} no v6.38 note, and the desktop item says nothing of overprinting`, N38 < 0 && !/print over/.test(item));
  }
}

// ── §F · rendered structure ─────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — rendered structure");
{ await seed({ ...clone(EXP), incomeStreams: [...rental(1200), { label: "Consulting", kind: "work", owner: "A", monthly: 2500, startYear: 2029, endYear: 2032, cola: false, tax: "ordinary", selfEmployed: true }] }, clone(EXE));
  await go("income");
  const rows = [...body().querySelectorAll(".dc-streamrow")], grid = [...body().querySelectorAll(".dc-stack-phone")], ph = [...body().querySelectorAll(".dc-two-phone")];
  if (POST) {
    T("F-1 each stream is one .dc-streamrow whose four parts are the label, the dates, the description and the amount",
      rows.length === 2 && rows.every(r => r.children.length === 4 && r.children[0].className === "dc-sr-label" && !r.children[1].className && r.children[2].className === "dc-sr-desc" && r.children[3].className === "dc-sr-amt")
      && rows[0].children[0].textContent === "Rental" && /\$1,200/.test(rows[0].children[3].textContent), rows.length);
    T("F-2 the three income cards sit in the one .dc-stack-phone grid, and every phase card's five figures in a .dc-two-phone row",
      grid.length === 1 && grid[0].children.length === 3 && /Fixed income sources/.test(grid[0].children[0].textContent) && ph.length >= 2 && ph.length === (txt().match(/PHASE — /g) || []).length && ph.every(x => x.children.length === 5), `${grid.length} ${ph.length}`);
  } else {
    T(`F-1 ${KD} the stream rows and grids carry no phone class`, rows.length === 0 && grid.length === 0 && ph.length === 0);
  }
}

finished = true;
console.log(`\nt102 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
