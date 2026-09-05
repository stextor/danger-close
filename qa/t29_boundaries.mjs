// t29 — THE BOUNDARY CENSUS is itself tested (v5.46 tooling)
// Run: node t29_boundaries.mjs v546
//
// WHY THIS EXISTS. OPERATIONS §B1 established the standard for `qa/tools/`: an unexpected result
// from a tool is a finding ON ITS OWN — but only while the tool's own suite is green. A census
// nobody has tested is a census whose silence means nothing, and this one's whole purpose is to
// be trusted at scope time, before any fixture exists to cross-check it against.
//
// THE FAILURE MODE THIS GUARDS. A census row that reports "clear" for a household built to sit
// exactly ON that boundary is worse than no census at all: it actively certifies coverage that
// does not exist. So every row is driven in BOTH directions where a household can express both,
// and each fixture in `tools/fixture/households.mjs` moves ONE boundary, so a row that fails to
// move is unambiguous.
//
// TWO ROWS CANNOT FLIP WITHIN ONE HOUSEHOLD, and that is a property of the world, not a gap:
// a household has one filing status and a person has one birth year. For those the control is
// that the reported BRANCH changes across fixtures — §D and §E.
//
// SEPARATE FROM t21. `t21` covers the four AST tools against `fixture.jsx`, whose line numbers
// are load-bearing. This census operates on portfolios, not source text; sharing a suite would
// mean sharing a fixture, and that fixture must not be touched.
//
// COUNTED IN NO APP TOTAL — this is tooling (§B1).
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v546";
const KNOWN_VERSIONS = ["v546", "v547", "v548", "v549", "v550", "v551", "v552", "v553", "v554", "v555", "v556", "v557", "v558", "v559", "v560", "v561", "v562", "v563", "v564", "v565"];
if (!KNOWN_VERSIONS.includes(VER)) {
  console.log(`\n  \u2717 FATAL: version tag "${VER}" is not registered in this suite.`);
  console.log("    Registered: " + KNOWN_VERSIONS.join(", "));
  process.exit(1);
}

// Resolve tool and fixtures the way t24/t27 resolve the §86 oracle — the pool is FLAT and the
// repo is not — and say which copy was used, so a stale duplicate is visible instead of silent.
const pick = (...cands) => cands.find(existsSync);
const TOOL = pick(join(HERE, "tools", "boundaries.mjs"), join(HERE, "boundaries.mjs"));
const FIX = pick(join(HERE, "tools", "fixture", "households.mjs"), join(HERE, "households.mjs"));
if (!TOOL || !FIX) {
  console.log("t29 SUITE: 0 passed, 1 failed\n  \u2717 census tool or fixtures not found");
  process.exit(1);
}
const { census, onBoundary, table } = await import(pathToFileURL(TOOL).href);
const { HOUSEHOLDS, build } = await import(pathToFileURL(FIX).href);
const G = (await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href)).__g;

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };

console.log(`t29 \u2014 BOUNDARY CENSUS (${VER})`);
console.log(`     tool:     ${TOOL}`);
console.log(`     fixtures: ${FIX}\n`);

const BASE = JSON.parse(JSON.stringify(G.PORTFOLIO()));
const reset = () => G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)) });  // WRAPPER — §C
const at = name => { G.applyLoadedData({ portfolio: build(G, name) }); const r = census(G); reset(); return r; };
const by = (rows, id) => rows.find(r => r.id === id);

// ── §A · the census runs and its shape is stable ─────────────────────────────────────────
const example = census(G);
T("A-1: the census returns rows for the example household", example.length > 0, `${example.length}`);
const ids = example.map(r => r.id);
T("A-2: row ids are unique \u2014 a duplicate id would make every lookup below ambiguous",
  new Set(ids).size === ids.length);
for (const id of ["filing", "dobA_month", "dobB_month", "rmd_age_A", "rmd_age_B", "ssA_claim",
                  "ssB_claim", "ssA_band", "ssB_band", "state_tax", "income_streams", "stream_kinds",
                  "ladder_windows"])
  T(`A-3: row '${id}' is present`, ids.includes(id));
T("A-4: every row carries a verdict and a note", example.every(r => typeof r.onBoundary === "boolean" && r.note));

// ── §B · the example household's known position, pinned ──────────────────────────────────
// These are the two rows that actually hid a shipped defect: v5.45 (benefits above the ½-cap
// band) and v5.46 (spouse B claims in January of the ladder's first year). If either ever reads
// "clear" without the example data changing, the census has broken.
T("B-1: spouse B's claim year sits ON the boundary (v5.46's blind spot)", by(example, "ssB_claim").onBoundary);
T("B-2: both benefits sit OUTSIDE the \u00a786(a)(1) \u00bd-cap band (v5.45's blind spot)",
  by(example, "ssA_band").onBoundary && by(example, "ssB_band").onBoundary);
T("B-3: both DOB months are January \u2014 partial-month arithmetic is a no-op",
  by(example, "dobA_month").onBoundary && by(example, "dobB_month").onBoundary);
T("B-4: spouse A's claim year is CLEAR \u2014 so the census is not simply reporting ON for everything",
  !by(example, "ssA_claim").onBoundary);
T("B-5: the ladder windows are CLEAR, for the same reason", !by(example, "ladder_windows").onBoundary);
T("B-6: the example household sits on more boundaries than it clears", onBoundary(example).length > example.length / 2,
  `${onBoundary(example).length} of ${example.length}`);

// ── §C · NEGATIVE CONTROLS \u2014 each must FIRE ────────────────────────────────────────────
// A control that does not fire is the finding (OPERATIONS §B2), so each is asserted as a CHANGE
// from the example household's verdict, never as an absolute.
for (const [name, spec] of Object.entries(HOUSEHOLDS)) {
  if (!spec.flips.length) continue;
  const rows = at(name);
  for (const id of spec.flips) {
    const before = by(example, id), after = by(rows, id);
    T(`C-${name}/${id}: the verdict MOVES when the household moves (${spec.why})`,
      !!after && before.onBoundary !== after.onBoundary,
      after ? `was ${before.onBoundary ? "ON" : "clear"}, still ${after.onBoundary ? "ON" : "clear"}` : "row missing");
  }
}
// …and the reverse direction, which the flips above do not cover on their own: a row that is
// CLEAR on the example household must be able to go ON. Without this the census could be a
// function that only ever reports ON.
T("C-reverse: 'ladder_windows' goes from clear to ON when both spouses share a birth year",
  !by(example, "ladder_windows").onBoundary && by(at("sameWindows"), "ladder_windows").onBoundary);

// -- C-kinds . the v5.63 row, driven in BOTH directions (§K1 maintenance rule; the E2 lesson).
// `income_streams` counts streams and `stream_kinds` asks whether any of them is NON-work. The
// two must be able to disagree, or the new row is a duplicate of the old one wearing a new id --
// which is exactly the "row nobody drives" failure E2 records. A WORK-only stream is the case
// that separates them: streams exist, so the count row clears, while the FICA split stays
// unexercised and the kinds row stays ON. This is the boundary that hid the v5.63 defect.
{
  const w = at("streamsWork");
  T("C-kinds-1: a work-only stream CLEARS the count row -- streams do exist",
    !by(w, "income_streams").onBoundary, by(w, "income_streams").value);
  T("C-kinds-2: ...and LEAVES the non-work row ON -- the FICA split is still unexercised",
    by(w, "stream_kinds").onBoundary, by(w, "stream_kinds").value);
  T("C-kinds-3: the two rows therefore DISAGREE on this household -- the new row is not a "
    + "restatement of the old one",
    by(w, "income_streams").onBoundary !== by(w, "stream_kinds").onBoundary);
  T("C-kinds-4: an untyped stream counts as NON-work, matching the app's own "
    + "`(s.kind || \"other\")` default -- a fix special-casing \"rental\" would not move this",
    !by(at("streams"), "stream_kinds").onBoundary, by(at("streams"), "stream_kinds").value);
}

// ── §D · the branch-report rows, which cannot flip within one household ──────────────────
{
  const r73 = by(at("rmd73"), "rmd_age_A"), r75 = by(example, "rmd_age_A");
  T("D-1: spouse A's RMD row reports 75 on the example household", /75/.test(r75.value), r75.value);
  T("D-2: and reports 73 for a spouse born before 1960 \u2014 the branch moves even though the verdict cannot",
    /73/.test(r73.value), r73.value);
  T("D-3: the SECURE 2.0 split is read through the app's own helper, not restated here",
    G.rmdStartAge(1959) === 73 && G.rmdStartAge(1960) === 75);
}

// ── §E · the single filer ────────────────────────────────────────────────────────────────
{
  const rows = at("single");
  T("E-1: the filing row reports single", /single/i.test(by(rows, "filing").value));
  T("E-2: and reports MFJ on the example household", /married/i.test(by(example, "filing").value));
  T("E-3: spouse-B rows degrade to n/a rather than reporting a phantom spouse",
    by(rows, "dobB_month").value === "n/a" && by(rows, "ssB_claim").value === "n/a" && by(rows, "ssB_band").value === "n/a");
  T("E-4: and those n/a rows are not counted as boundaries",
    !by(rows, "dobB_month").onBoundary && !by(rows, "ssB_claim").onBoundary && !by(rows, "ssB_band").onBoundary);
}

// -- E2 . the SS-offset row (v5.56) ------------------------------------------------------
// The row shipped with the v5.56 offset and NOTHING ASSERTED IT. A negative control that deleted
// `ssOffset` from MD and ME failed zero t29 checks: the row existed, reported, and discriminated
// nothing. A census row nobody drives is exactly the row this suite's header calls worse than no
// row at all. Driven in BOTH directions, and keyed on the app's own flag so deleting the flag
// flips it -- the row must not become a second, drifting list of states.
{
  const atState = code => {
    const p = build(G, "state"); p.stateCode = code;
    G.applyLoadedData({ portfolio: p }); const r = census(G); reset(); return r;
  };
  const md = by(atState("MD"), "state_ss_offset"), al = by(atState("AL"), "state_ss_offset");
  // GATED. These were written ungated and failed the frozen v5.55 leg three times -- no state
  // carries `ssOffset` on that build, so the row correctly reports the class unexercised there.
  // That is the v5.27 mistake OPERATIONS §B2 exists to prevent, and v5.55 made it too. Each leg
  // asserts what was true of ITS OWN build.
  const _v = Number(VER.replace(/[^0-9]/g, ""));
  T("E2-2: a non-offset state leaves the class unexercised -- the row IS on a boundary for AL",
    !!al && al.onBoundary === true, al ? al.value : "row missing");
  if (_v >= 556) {
    T("E2-1: an offset state is EXERCISED -- the row is not on a boundary for MD",
      !!md && md.onBoundary === false, md ? md.value : "row missing");
    T("E2-3: the row names the state and its cap, read from the app rather than restated here",
      !!md && md.value.includes("MD") &&
        md.value.includes(G.STATE_RULES().MD.excl65.toLocaleString()),
      md ? md.value : "row missing");
    T("E2-4: the boundary column is DERIVED from the ssOffset flag, so deleting the flag moves it",
      !!md && md.boundary.includes("MD") && md.boundary.includes("ME"),
      md ? md.boundary : "row missing");
  } else {
    T("E2-1 [KNOWN DEFECT pre-v5.56]: no state carries ssOffset, so even MD reads unexercised",
      !!md && md.onBoundary === true, md ? md.value : "row missing");
    T("E2-4 [KNOWN DEFECT pre-v5.56]: the boundary column finds no offset states at all",
      !!md && /none found/.test(md.boundary), md ? md.boundary : "row missing");
  }
}

// ── §F · NO CONSTANT IS HARDCODED \u2014 the census must move if the app's do ───────────────
// This is the property that stops the tool becoming a second, drifting answer. The \u00bd-cap band is
// derived as THR2 \u2212 THR1 from the app's own constants; v5.45 quoted "$12,000" in prose, and this
// asserts the tool DERIVES that rather than repeating it.
{
  const Tx = G.TAX_CONSTS();
  const band = Tx.SS_THR2_MFJ - Tx.SS_THR1_MFJ;
  T("F-1: the \u00bd-cap band the census reports equals THR2 \u2212 THR1 from TAX_CONSTS",
    by(example, "ssA_band").boundary.includes(band.toLocaleString()),
    `${by(example, "ssA_band").boundary} vs derived $${band.toLocaleString()}`);
  T("F-2: which is $12,000 joint on today's constants \u2014 the figure v5.45 stated in prose",
    band === 12000, `$${band}`);
  T("F-3: and $9,000 single, derived the same way", Tx.SS_THR2_SGL - Tx.SS_THR1_SGL === 9000);
  // F-1 compares the census against the app's constants, so it catches a WRONG band — but it
  // would not catch a band hardcoded to the currently-correct 12000. This does: the tool's source
  // must contain no §86 threshold literal at all. Small file, no DOCS_HTML blob, safe to read.
  const toolSrc = (await import("fs")).readFileSync(TOOL, "utf8");
  const literals = ["32000", "44000", "25000", "34000", "12000", "9000"].filter(n => toolSrc.includes(n));
  T("F-4: the census source hardcodes NO \u00a786 threshold \u2014 a second copy is a second answer that drifts",
    literals.length === 0, literals.join(", "));
}

// ── F (cont.) · the STATE rows, added 2026-08-28 with the three-way census split ─────────────
// The state census was ONE row keyed on the legacy flat rate until this release. That row read ON
// for the fallback path only, so a household using the 51-jurisdiction STATE_RULES module showed
// the census a muted state-tax path while exercising the module fully. The `state` fixture proves
// it: it sets stateCode "TS", which is not a STATE_RULES key, and it clears `state_tax` while
// leaving `state_code` OFF.
{
  const toolSrc = (await import("fs")).readFileSync(TOOL, "utf8");
  const RULES = G.STATE_RULES();

  // F-5 is F-4's exact analogue for the state list. F-1-style comparisons catch a WRONG list;
  // only this catches a list that is currently right and written down. Match quoted two-letter
  // uppercase tokens against real STATE_RULES keys, so the check cannot be fooled by prose.
  const quoted = [...toolSrc.matchAll(/["'`]([A-Z]{2})["'`]/g)].map(m => m[1]);
  const hardcoded = [...new Set(quoted.filter(c => Object.prototype.hasOwnProperty.call(RULES, c)))];
  T("F-5: the census source hardcodes NO state code \u2014 the list is read live from STATE_RULES",
    hardcoded.length === 0, hardcoded.join(", "));

  // ⚠ F-6 is the empty-set guard, and it is the one that would have failed quietly. If no state
  // in STATE_RULES matches the income-limit pattern, `state_excl_limited` can never read ON and
  // every assertion about it passes vacuously \u2014 green from an empty set (OPERATIONS \u00a7B2).
  // This release found that exact defect twice in its own tooling, so it is pinned here.
  const limited = Object.entries(RULES)
    .filter(([, r]) => (r.excl65 || 0) > 0 && /income[- ]limited|income limit/i.test(r.note || ""));
  T("F-6: at least one STATE_RULES entry carries an income-limited 65+ exclusion \u2014 otherwise the D-3c row is vacuous",
    limited.length > 0, `${limited.length} found`);

  // F-7: and the row must actually be reachable from a shipped fixture, not merely definable.
  // A boundary nothing can cross is a boundary the census cannot help with.
  T("F-7: a fixture exists that turns the D-3c row ON",
    by(at("stateExclCliff"), "state_excl_limited").onBoundary === false,
    "stateExclCliff should read ON");

  // F-8: the module row and the legacy row are genuinely independent \u2014 the whole reason for
  // splitting them. The legacy fixture must NOT light the module row.
  T("F-8: the legacy `state` fixture clears state_tax WITHOUT lighting state_code \u2014 the split is load-bearing",
    by(at("state"), "state_tax").onBoundary === false && by(at("state"), "state_code").onBoundary === true);
}

// ── §G · the printer does not lie about the count ────────────────────────────────────────
{
  const txt = table(example);
  T("G-1: the table renders one line per row", example.every(r => txt.includes(r.param)));
  T("G-2: its summary count matches the rows it marked",
    txt.includes(`${onBoundary(example).length} of ${example.length}`));
}

console.log(`\nt29 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
