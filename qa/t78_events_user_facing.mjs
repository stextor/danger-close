// t78 — THE EVENTS TAB SPEAKS TO USERS ONLY: NO GOOGLE DRIVE, NO MAINTAINER CHORES, AND THE STRIP NEVER HIDES THE USER'S OWN ITEMS
// Run: node t78_events_user_facing.mjs v615   |   node t78_events_user_facing.mjs v614
//
// THE DEFECT THIS EXISTS FOR (docs/SCOPE_EVENTS_USER_FACING_V615.md). Through v6.14 the Events tab carried three of the MAINTAINER's
// chores — paste new tax constants into the source (saved to a Google Drive folder), append last year's returns, refresh the survey
// tables — and the backup card told every user to drop their export in that Drive folder. The app-wide strip above every tab names only
// the most urgent tier, so in January the maintainer's red "Annual tax-data refresh" HID the user's own open items (the plan review, the
// quarterly backup, the SSA record check). And four sites promised the plan "survives the swap" to a fresh copy, which is false between
// the website and a saved file (localStorage is per origin; src/main.jsx).
// v6.15: the tax card is a NOTICE (`notice: true`; never green or yellow) that the strip ignores (`alertStripEvents`); `hist` and `peer`
// are gone; the backup card is neutral; the swap claims say "export first, Import Backup if your plan doesn't appear".
//
// GATED PER LEG (OPERATIONS §B2). The v6.14 leg pins the defects as dated [KNOWN DEFECT] checks. §A and §C-3 compare the two legs, so they
// run on the v6.15 leg with the prior module in the run folder (a designed skip otherwise, printed). §C-4 renders the shell in a CHILD
// process whose clock is set to 2027-01-05 BEFORE the DOM bundle loads (DATA_STALE_YEARS is a module-level constant read at load).
// EVERY DATE IS PASSED IN — nothing here depends on the day the suite runs, except C-4's own fixed clock.
import { createRequire } from "module";
import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v615";
const KNOWN_VERSIONS = ["v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  ✗ FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}

// ══ CHILD MODE (§C-4): set the clock, then load the DOM bundle and read the two strips above the tabs ══
if (process.env.T78_CHILD) {
  const FIX = new Date(2027, 0, 5, 12, 0, 0).getTime(), RealDate = Date;
  class FixedDate extends RealDate { constructor(...a) { if (a.length === 0) super(FIX); else super(...a); } static now() { return FIX; } }
  globalThis.Date = FixedDate;
  await import("./env_dom.mjs");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; window.IS_REACT_ACT_ENVIRONMENT = true;
  if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:stub";
  console.error = () => {}; console.warn = () => {};
  const req = createRequire(import.meta.url);
  req(`./dom_${VER}.cjs`);
  const React = req("react");
  const { root, act, DangerClose } = window.__mount(window.document.getElementById("root"));
  const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); };
  const body = () => window.document.body;
  await act(async () => { root.render(React.createElement(DangerClose)); }); await flush(); await flush();
  const ex = [...body().querySelectorAll("button,[role=button],div")].filter(el => /use example data/i.test(el.textContent || "") && el.children.length === 0)[0];
  if (ex) { await act(async () => { ex.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); await flush(); await flush(); }
  const byTitle = t => [...body().querySelectorAll("div[title]")].filter(d => d.getAttribute("title") === t).map(d => d.textContent || "");
  const out = { now: new Date().toISOString().slice(0, 10), clicked: !!ex,
    strip: byTitle("Open the EVENTS tab"), stale: byTitle("Open the EVENTS tab for the refresh instructions") };
  process.stdout.write("T78JSON " + JSON.stringify(out) + "\n");
  await act(async () => { root.unmount(); });
  process.exit(0);
}

await import("./env_dom.mjs");
console.error = () => {}; console.warn = () => {};
const POST = ["v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"].includes(VER);   // an array, so the next registration widens it
// §A / §C-3's pair. Two constants, NOT `VER === "v615"`: the registrar widens equality tests and arrays, and this comparison is true of
// exactly one pair of builds (t76 records why).
const D_PRIOR = "v614", D_CUR = "v615";
const require = createRequire(import.meta.url);
const M = await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href);
const X = M.__test, g = M.__g;
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
// Every piece of user-facing text: string literals, template quasis, JSX text — in source order (the Field Manual is one string).
const TEXTS = []; walk.full(JP.parse(SRC, { ecmaVersion: 2022, sourceType: "module", locations: true }), n => {
  if (n.type === "Literal" && typeof n.value === "string") TEXTS.push({ kind: "str", v: n.value, line: n.loc.start.line });
  else if (n.type === "TemplateElement") TEXTS.push({ kind: "tpl", v: n.value.cooked || "", line: n.loc.start.line });
  else if (n.type === "JSXText") TEXTS.push({ kind: "jsx", v: n.value, line: n.loc.start.line });
}, W);
const DOCS = (TEXTS.find(t => t.kind === "str" && t.v.startsWith("<!doctype html>") && t.v.includes("FIELD MANUAL")) || { v: "" }).v;
const jsxRun = TEXTS.filter(t => t.kind === "jsx").map(t => t.v.replace(/\s+/g, " ")).join("");   // adjacent JSX text, whitespace-folded

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  ✗ ${n}${d ? " — " + d : ""}`); } };
const EQ = (n, a, b) => T(n, a === b, `got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const KD = "[KNOWN DEFECT 2026-10-16 — flips at v6.15]";
console.log(`t78 — THE EVENTS TAB SPEAKS TO USERS ONLY (${VER})\n`);

// 72 dates: the 1st and 15th of every month, 2026–2028 — before, inside and after the October–December window, and the stale years
const DATES = []; for (let y = 2026; y <= 2028; y++) for (let m = 0; m < 12; m++) for (const d of [1, 15]) DATES.push(new Date(y, m, d, 12));
const ds = d => d.toISOString().slice(0, 10);
const ev = (d, mod = X) => mod.computePlanEvents(d) || [];
const byKey = (d, k, mod = X) => ev(d, mod).find(e => e.key === k);
const inlineStrip = evs => { const tier = ["red", "green", "yellow"].find(t => evs.some(e => e.state === t)) || null;   // v6.14's JSX rule, verbatim
  return { tier, hits: tier ? evs.filter(e => e.state === tier) : [] }; };
const SOURCE_NAMES = /src\/DangerClose\.jsx|TAX_CONSTS|IRMAA_CONSTS|HISTORICAL_RETURNS|PEER_DATA_SCF_YEAR|TAX_CONSTANTS_YEAR/;
// v6.33 (D-67, DT-8 (a)): TAX_CONSTANTS_YEAR is no longer a typed literal — it is the newest federal table's year, read from the table — so
// the leg's value is read from the module where the shim exports it (v6.33 on), and from the typed literal before that.
const TCY = typeof g.TAX_CONSTANTS_YEAR === "function" && g.TAX_CONSTANTS_YEAR() !== undefined ? g.TAX_CONSTANTS_YEAR()
  : Number((SRC.match(/const TAX_CONSTANTS_YEAR = (\d{4})/) || [])[1]);
T("0-1 SETUP — the leg's TAX_CONSTANTS_YEAR is 2026 (every dated expectation below assumes it)", TCY === 2026, String(TCY));
T("0-2 SETUP — the example household carries no expense-horizon alarm on these dates (the counts below are its fixed set)",
  DATES.every(d => !byKey(d, "exphorizon")));

// ── A · the event list, across the pair ───────────────────────────────────────────────────────────────────────────────────────────
const PRI = join(HERE, `app_${D_PRIOR}.mjs`);
let M0 = null;
if (VER === D_CUR && existsSync(PRI)) {
  console.log(`  A — ${D_PRIOR} → ${D_CUR}: what moved and what did not`);
  M0 = (await import(pathToFileURL(PRI).href)).__test;
  T("A-0 SETUP — both legs read the same plan timeline (the example household)", JSON.stringify(M0.PLAN_TIMELINE) === JSON.stringify(X.PLAN_TIMELINE));
  const GONE = new Set(["hist", "peer"]);
  T("A-1 on all 72 dates v6.15's keys are v6.14's minus hist and peer, in the same order",
    DATES.every(d => JSON.stringify(ev(d).map(e => e.key)) === JSON.stringify(ev(d, M0).map(e => e.key).filter(k => !GONE.has(k)))),
    ds(DATES.find(d => JSON.stringify(ev(d).map(e => e.key)) !== JSON.stringify(ev(d, M0).map(e => e.key).filter(k => !GONE.has(k)))) || DATES[0]));
  const F = e => e && JSON.stringify([e.title, e.state, e.when, e.countdown, e.instructions]);
  const other = ev(DATES[0]).map(e => e.key).filter(k => !["tax", "backup", "review"].includes(k));
  const bad = []; for (const d of DATES) for (const k of other) if (F(byKey(d, k)) !== F(byKey(d, k, M0))) bad.push(`${ds(d)} ${k}`);
  T(`A-2 nothing else moved: the other ${other.length} events are field-for-field identical (title, state, when, countdown, instructions) on all 72 dates`,
    other.length === 13 && bad.length === 0, `${other.length} keys; ${bad.slice(0, 4).join(", ")}`);
  const G = e => e && JSON.stringify([e.title, e.state, e.when, e.countdown]);
  const bad3 = []; for (const d of DATES) for (const k of ["backup", "review"]) if (G(byKey(d, k)) !== G(byKey(d, k, M0))) bad3.push(`${ds(d)} ${k}`);
  T("A-3 backup and review keep their title, state, when and countdown on all 72 dates — only their instructions changed", bad3.length === 0, bad3.slice(0, 4).join(", "));
  T("A-3b and their instructions DID change (the A-3 identity is not vacuous)",
    byKey(DATES[0], "backup").instructions !== byKey(DATES[0], "backup", M0).instructions && byKey(DATES[0], "review").instructions !== byKey(DATES[0], "review", M0).instructions);
} else console.log(`  A — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only, with both modules; this leg is ${VER})`);

// ── B · the tax card ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  B — the tax card");
{
  const at = (y, m, d) => byKey(new Date(y, m, d, 12), "tax") || {};
  if (POST) {
    const mar = at(2026, 2, 1), oct = at(2026, 9, 16), nov = at(2026, 10, 20), dec = at(2026, 11, 31), jan = at(2027, 0, 5);
    T("B-1a 2026-03-01: TRACKING, \"current for 2026\", no countdown", mar.state === "future" && mar.when === "current for 2026" && mar.countdown === "", JSON.stringify([mar.state, mar.when, mar.countdown]));
    const WIN = "2027 figures publish Oct–Nov; an updated version follows by January";
    T("B-1b 2026-10-16: TRACKING, the publish/January text, a countdown to January (3 months)", oct.state === "future" && oct.when === WIN && oct.countdown === "in 3 mo", JSON.stringify([oct.state, oct.when, oct.countdown]));
    T("B-1c 2026-11-20: TRACKING, the same text, 2 months", nov.state === "future" && nov.when === WIN && nov.countdown === "in 2 mo", JSON.stringify([nov.state, nov.when, nov.countdown]));
    T("B-1d 2026-12-31: TRACKING, the same text, 1 month", dec.state === "future" && dec.when === WIN && dec.countdown === "in 1 mo", JSON.stringify([dec.state, dec.when, dec.countdown]));
    T("B-1e 2027-01-05: RED, out of date — \"these are 2026 figures and it is now 2027\"", jan.state === "red" && jan.when === "out of date: these are 2026 figures and it is now 2027", JSON.stringify([jan.state, jan.when]));
    T("B-1f the title names the figures' year", oct.title === "Tax figures in this copy (2026)", oct.title);
    T("B-2 the notice is never green or yellow on any of the 72 dates (nothing for a user to prepare)", DATES.every(d => !["green", "yellow"].includes(byKey(d, "tax").state)));
    T("B-3 it carries notice: true, and no other event does, on any of the 72 dates",
      DATES.every(d => ev(d).filter(e => e.notice).map(e => e.key).join() === "tax"));
    const ins = oct.instructions || "";
    T("B-4a the instructions point the user at stextor.github.io/danger-close, Export a backup and Import Backup",
      ins.includes("stextor.github.io/danger-close") && ins.includes("Export a backup") && ins.includes("Import Backup"));
    T("B-4b and carry no maintainer workflow: no src/, TAX_CONSTS, IRMAA_CONSTS, HISTORICAL_RETURNS, paste, or Drive",
      !/src\/|TAX_CONSTS|IRMAA_CONSTS|HISTORICAL_RETURNS|paste|Drive/i.test(ins), ins.slice(0, 80));
    T("B-4c the instructions name the figures' year and the January update", ins.startsWith("This copy's federal tax and Medicare (IRMAA) figures are for 2026.") && ins.includes("by January"));
  } else {
    const oct = at(2026, 9, 16), nov = at(2026, 10, 20), jan = at(2027, 0, 5);
    EQ(`B-1 ${KD}: October tells every user a maintainer chore is "getting close"`, oct.state, "yellow");
    EQ(`B-1 ${KD}: November opens an "action window" on it`, nov.state, "green");
    EQ(`B-1 ${KD}: January makes it ACTION REQUIRED`, jan.state, "red");
    T(`B-4 ${KD}: its instructions are the maintainer's paste-into-the-source workflow, via Google Drive`,
      /Google Drive/.test(oct.instructions || "") && /src\/DangerClose\.jsx/.test(oct.instructions || ""));
  }
}

// ── C · the alert strip ───────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  C — the strip");
{
  const jan5 = new Date(2027, 0, 5, 12);
  if (POST) {
    T("C-0 SETUP — alertStripEvents is exported on this leg", typeof X.alertStripEvents === "function");
    const r = X.alertStripEvents(ev(jan5));
    T("C-1 2027-01-05: the strip is the user's own — ACTION WINDOW OPEN (green): Annual plan review, the tax notice nowhere",
      r.tier === "green" && r.hits.map(h => h.key).join() === "review", JSON.stringify([r.tier, r.hits.map(h => h.key)]));
    T("C-2 on all 72 dates alertStripEvents never returns the notice", DATES.every(d => !X.alertStripEvents(ev(d)).hits.some(h => h.notice || h.key === "tax")));
    T("C-2b and with no events it is empty, not a crash", JSON.stringify(X.alertStripEvents([])) === '{"tier":null,"hits":[]}' && X.alertStripEvents(undefined).tier === null);
    if (M0) {
      const bad = DATES.filter(d => { const a = X.alertStripEvents(ev(d)), b = inlineStrip(ev(d, M0).filter(e => !["tax", "hist", "peer"].includes(e.key)));
        return a.tier !== b.tier || a.hits.map(h => h.key).join() !== b.hits.map(h => h.key).join(); });
      T("C-3 on all 72 dates the strip is exactly v6.14's rule over v6.14's events minus tax, hist and peer (nothing else about it moved)", bad.length === 0, bad.slice(0, 4).map(ds).join(", "));
    } else console.log(`  C-3 — skipped by design (the ${D_PRIOR} → ${D_CUR} pair only)`);
  } else {
    T("C-0 [pre-v6.15] there is no alertStripEvents on this leg (the rule was inline JSX)", X.alertStripEvents === undefined);
    const r = inlineStrip(ev(jan5));
    T(`C-1 ${KD}: 2027-01-05 — the maintainer's red alarm wins the strip and HIDES the user's green plan review and yellow backup and SSA check`,
      r.tier === "red" && r.hits.map(h => h.key).join() === "tax" && ["review", "backup", "ssacheck"].every(k => ["green", "yellow"].includes(byKey(jan5, k).state)),
      JSON.stringify([r.tier, r.hits.map(h => h.key)]));
  }
  // C-4 — rendered, with the clock at 2027-01-05 (the January the figures go stale)
  const ch = spawnSync(process.execPath, [fileURLToPath(import.meta.url), VER], { cwd: HERE, env: { ...process.env, T78_CHILD: "1" }, encoding: "utf8", timeout: 600000 });
  const line = (ch.stdout || "").split("\n").find(l => l.startsWith("T78JSON "));
  const R = line ? JSON.parse(line.slice(8)) : null;
  T("C-4a SETUP — the child rendered the example household with its clock at 2027-01-05", !!R && R.now === "2027-01-05" && R.clicked, R ? JSON.stringify([R.now, R.clicked]) : (ch.stderr || "").slice(-300));
  if (R) {
    const strip = R.strip.join(" | "), stale = R.stale.join(" | ");
    T("C-4b the ⌛ STALE DATA strip renders once (the figures are a year old)", R.stale.length === 1 && stale.includes("STALE DATA"), `${R.stale.length}`);
    if (POST) {
      T("C-4c the rendered action strip reads ▶ ACTION WINDOW OPEN: Annual plan review — not the tax card",
        R.strip.length === 1 && /▶ ACTION WINDOW OPEN:\s*Annual plan review\s+—\s+open the EVENTS tab/.test(strip) && !/Tax figures|tax-data/i.test(strip), strip.slice(0, 140));
      T("C-4d the STALE strip says export first and Import Backup, and carries no maintainer workflow or swap promise",
        stale.includes("Export Backup first: your plan is saved in this browser, and the new copy may not see it — Import Backup on the My Data tab brings it across.")
        && !/Maintaining the file|tax-refresh alarm|nothing is lost/.test(stale), stale.slice(-200));
    } else {
      T(`C-4c ${KD}: the rendered strip is ⚠ ACTION REQUIRED: Annual tax-data refresh, and the plan review is not on it`,
        /⚠ ACTION REQUIRED:\s*Annual tax-data refresh/.test(strip) && !/Annual plan review/.test(strip), strip.slice(0, 140));
      T(`C-4d ${KD}: the STALE strip promises "nothing is lost" and sends the user to a maintainer workflow`,
        /nothing is lost/.test(stale) && /Maintaining the file yourself/.test(stale));
    }
  }
}

// ── D · extinction ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  D — extinction");
{
  const drive = TEXTS.filter(t => /google drive/i.test(t.v));
  const evIns = DATES.flatMap(d => ev(d).map(e => e.instructions || ""));
  const SWAP = /survives the swap|lives in (?:your|this|the) browser, not the file|no automatic persistence|swapping the file loses nothing/i;
  const swap = TEXTS.filter(t => SWAP.test(t.v));
  if (POST) {
    T("D-1 no string, template or JSX text anywhere in the source — the Field Manual included — says Google Drive (any case)", drive.length === 0, drive.map(t => "L" + t.line).join(","));
    const page = join(HERE, "..", "index.html");
    const html = existsSync(page) ? readFileSync(page, "utf8") : "";
    // v6.16: this read "it names v6.15" — a version string typed into a SETUP check, which the registrar cannot see (it is not a tag) and
    // which went red on BOTH legs of the v6.15 → v6.16 run. The run folder holds one built page, the CURRENT build's, so the version it
    // must name is derived from the newest source in the folder — never typed (owned in v6.16's CHANGELOG).
    const _newest = readdirSync(join(HERE, "..")).filter(f => /^v\d{3}\.jsx$/.test(f)).sort().pop() || "";
    const _verStr = _newest ? `v${_newest[1]}.${_newest.slice(2, 4)}` : "(no source in the run folder)";
    T(`D-2a SETUP — the run folder's built index.html is the run's current build (it names ${_verStr}, the newest source beside it)`, !!_newest && html.includes(`DANGER CLOSE ${_verStr}`));
    T("D-2b the built index.html says Google Drive nowhere", html.length > 0 && !/google drive/i.test(html));
    T("D-3 on all 72 dates no event's instructions name the source file or a source constant", !evIns.some(s => SOURCE_NAMES.test(s)));
    T("D-4 no app text promises the plan survives a swap, or says the browser keeps nothing", swap.length === 0, swap.map(t => "L" + t.line).join(","));
  } else {
    T(`D-1 ${KD}: Google Drive appears in exactly two event instructions (the tax card and the backup card)`, drive.length === 2 && drive.every(t => t.kind === "tpl"), drive.map(t => "L" + t.line).join(","));
    T(`D-3 ${KD}: event instructions name the source file and source constants`, evIns.some(s => SOURCE_NAMES.test(s)));
    T(`D-4 ${KD}: three texts carry the swap / persistence claims — the STALE strip, the Field Manual (three sentences) and the backup card`, swap.length === 3, swap.map(t => t.kind + " L" + t.line).join(","));
  }
}

// ── E · wording agreement ─────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  E — wording");
{
  const PH = "your Documents folder, a personal cloud drive, or a USB stick";
  const b = (byKey(new Date(2026, 9, 1, 12), "backup") || {}).instructions || "";
  T("E-0 SETUP — the export dialog carries the neutral advice (the wording the backup card is held to)", jsxRun.includes(PH));
  if (POST) T("E-1 the backup card gives the same advice, in the same words", b.includes(PH) && b.includes("Export one each quarter"), b.slice(0, 120));
  else T(`E-1 ${KD}: the backup card sends the user to a Google Drive folder instead`, !b.includes(PH) && /Google Drive/.test(b));
}

// ── F · the Field Manual ──────────────────────────────────────────────────────────────────────────────────────────────────────────
console.log("  F — the Field Manual");
{
  const WORDS = { fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
  const m = DOCS.match(/derived from your timeline and the shared constants \((\w+) for a two-person household/);
  const n = ev(new Date(2026, 9, 16, 12)).length;
  T("F-0 SETUP — the Field Manual is found and its Events entry states a count", DOCS.length > 100000 && !!m, m ? m[1] : "no count");
  T(`F-1 the Events entry's count (${m ? m[1] : "?"}) equals the events the example two-person household actually has (${n})`, !!m && WORDS[m[1]] === n, `${m ? m[1] : "?"} vs ${n}`);
  // v6.29 (F-25, DF-6 a): spouse B gets an RMD event of their own ("rmdB"), so the example couple has seventeen
  EQ(`F-1b ${POST ? "" : "[v6.14] "}that number`, n, POST ? (["v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637"].includes(VER) ? 17 : 16) : 18);
  if (POST) {
    T("F-2 the Ranking entry no longer says the Events tab flags the benchmarks; a later version carries the 2028 survey",
      !DOCS.includes("when the Events tab flags these benchmarks") && DOCS.includes("the 2028 survey publishes ~fall 2029, and a later version of the app will carry it."));
    T("F-3 the three-layer paragraph names the notice and no paste-in instructions",
      DOCS.includes("carries a notice of which year's tax figures this copy uses and when the next update is due;") && !DOCS.includes("paste-in instructions"));
    T("F-4 the maintainer sentence is gone, and no tax-refresh alarm is described anywhere", !DOCS.includes("If you maintain it yourself") && !/tax-refresh alarm/.test(DOCS));
    T("F-5 the Events entry states the one exception to the strip", DOCS.includes("The tax-figures notice is the one exception: it never raises that strip"));
    T("F-6 the Events entry no longer lists the backtest append or the peer-benchmark refresh",
      !DOCS.includes("the backtest-data append") && !DOCS.includes("the peer-benchmark refresh behind the Ranking tab"));
  } else {
    T(`F-3 ${KD}: the Field Manual promises paste-in instructions on the Events tab`, DOCS.includes("paste-in instructions"));
  }
}

console.log(`\nt78 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
