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
// ⚠ COUNTED IN THE APP TOTAL. This line read "COUNTED IN NO APP TOTAL — this is tooling (§B1)" until
// 2026-09-15, and it was false: `runsuite.sh` has tallied t29 in the app section, both legs, since v5.49,
// and TESTING.md's per-suite line lists it (60/leg at v5.71). Only `t21` and `domdiff` are tooling.
// A new check added here MOVES the app figure — which is why SCOPE_STATE_SET_SELECTOR's stage-1 checks
// live in qa/state_sets_check.mjs instead.
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";
import "./env_dom.mjs";
let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "v546";
const KNOWN_VERSIONS = ["v546", "v547", "v548", "v549", "v550", "v551", "v552", "v553", "v554", "v555", "v556", "v557", "v558", "v559", "v560", "v561", "v562", "v563", "v564", "v565", "v566", "v567", "v568", "v569", "v570", "v571", "v572", "v573", "v574", "v575", "v576", "v577", "v578", "v579", "v580", "v581", "v582", "v583", "v584", "v585", "v586", "v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595", "v596", "v597", "v598", "v599", "v600", "v601", "v602", "v603", "v604", "v605", "v606", "v607", "v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"];
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
// SCOPE_STATE_SET_SELECTOR §7.6 stage 1: F-6's membership comes from the shared list, not from prose.
const SETS_PATH = pick(join(HERE, "tools", "state_sets.cjs"), join(HERE, "state_sets.cjs"));
if (!TOOL || !FIX || !SETS_PATH) {
  console.log("t29 SUITE: 0 passed, 1 failed\n  \u2717 census tool, fixtures or state_sets.cjs not found");
  process.exit(1);
}
const { census, onBoundary, table } = await import(pathToFileURL(TOOL).href);
const { HOUSEHOLDS, build } = await import(pathToFileURL(FIX).href);
const G = (await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href)).__g;
const SETS = createRequire(import.meta.url)(SETS_PATH);

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
// ⚠ EQ ADDED v5.68 (OPERATIONS §D1/§D2). Until then this suite had ONLY the truthiness helper above,
// and F-6a/F-6b were written `T(label, actual, expected)` as though `T` compared — its third argument
// is a display string, so both passed on any non-empty set. Any assertion with an EXPECTED VALUE uses
// EQ. Strict equality, and the got/want pair is printed on failure.
const EQ = (n, got, want) => T(n, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

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
                  "ladder_windows", "oth_ira_rmd", "d_conv_cap", "oth_roth", "crossover", "payroll", "self_employed", "home_move", "car_rows", "demo_prompt", "example_work", "ltc_row", "cut_rows", "ltc_disability", "ss_claim_after_gap",
                  "clock_coincide", "niit_year", "irmaa_year", "aca_subsidy", "irmaa_in_mc", "qcd_survivor", "survivor_benefit_b", "pre_retire_once", "work_magi", "ss_claim_a_planned_67", "ss_claim_b_at_retire", "income_covers_spend"])
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
// v6.08 (D-34, §K1): the two conditions that hid the Withdrawal tab's IRA defects. Both legs: on a build before v6.08 the IRA row reads
// "n/a" and counts as ON (it cannot be demonstrated); the conversion-cap row reads the same on either.
T("B-7: the example household's Other-account IRAs never reach an RMD in Engine D (D-34's blind spot)", by(example, "oth_ira_rmd").onBoundary,
  by(example, "oth_ira_rmd").value);
T("B-8: the Withdrawal tab's conversion cap never binds at $70,000 on the example household (D-34's other blind spot)",
  by(example, "d_conv_cap").onBoundary, by(example, "d_conv_cap").value);
// v6.09 (D-35, §K1): the condition that hid the Withdrawal tab's double count of a Roth IRA under Other accounts. Structural — both legs.
T("B-9: the example household holds no Roth IRA under Other accounts (D-35's blind spot)", by(example, "oth_roth").onBoundary, by(example, "oth_roth").value);
// v6.13 (C-11, §K1): the condition that hid the break-even card's mislabelled sentence — on the example household the card never shows
// its "recovered after a deficit" outcome. Read through Engine A on both legs (identical engines); t76 E-3 holds the row to the rendered card.
T("B-10: the example household's break-even card does not show the recovered outcome at $70,000 (C-11's blind spot)",
  by(example, "crossover").onBoundary && by(example, "crossover").value === "does not break even", by(example, "crossover").value);
// v6.14 (D-17, C-14, §K1): the condition that hid both payroll defects — no year of the example reaches the Additional Medicare threshold
// or puts two earners over the wage base. Both legs: on v6.13 the constants do not exist and the row reads "n/a" (ON).
T("B-11: the example household's job income never reaches a payroll rule that depends on who earned it (D-17 / C-14's blind spot)",
  by(example, "payroll").onBoundary, by(example, "payroll").value);
// v6.16 (D-36, §K1): the condition that hid the missing self-employment tax — the example household has no self-employed job row. Both legs:
// on v6.15 the floor constant does not exist and the row reads "n/a" (ON).
T("B-12: the example household has no self-employed job row, so self-employment tax is never reached (D-36's blind spot)",
  by(example, "self_employed").onBoundary, by(example, "self_employed").value);
// v6.17 (D-38, §K1): the example keeps the old constant's $130,000 as its own figure, so the field and the constant look the same there.
// Both legs: on v6.16 there is no accessor and the row reads "n/a" (ON).
T("B-13: the example household's home-move cash equals the old fixed $130,000 — the field and the constant cannot be told apart (D-38's blind spot)",
  by(example, "home_move").onBoundary, by(example, "home_move").value);
// v6.21 (D-42, §K1): the example's table carries the old fixed car schedule as rows, so the rows and the old constant look the same there.
// Both legs: on v6.20 there is no CAR_SCHEDULE_V620 and the row reads "n/a" (ON).
T("B-14: the example household's car rows are exactly the old fixed schedule — the rows and the constant cannot be told apart (D-42's blind spot)",
  by(example, "car_rows").onBoundary, by(example, "car_rows").value);
// v6.22 (D-53, §K1): the example holds its own demo prompt, so the example's facts reaching another plan cannot be seen on it. Both legs ON.
T("B-15: the example household holds the example's own demo prompt — its facts reaching another plan cannot be seen here (D-53's blind spot)",
  by(example, "demo_prompt").onBoundary, by(example, "demo_prompt").value);
// v6.23 (D-49, §K1): the example is paid its own built-in spouse-B work, so the wages reaching another plan cannot be seen on it. Both legs ON.
T("B-16: the example household is paid the built-in spouse-B work — the wages reaching another plan cannot be seen here (D-49's blind spot)",
  by(example, "example_work").onBoundary, by(example, "example_work").value);
// v6.27 (F-22, §K1): the example carries an LTC row and an "Amazon" row, so the Grade tab's no-LTC-row directive (through v6.26) and a
// guardrail's $0 cut pool cannot be seen on it (the grade is B- either way there). Both legs ON — the rows read the expense table, not a build feature.
T("B-17: the example household carries an LTC expense row — what the Grade tab says to a plan without one cannot be seen here (F-22's blind spot)",
  by(example, "ltc_row").onBoundary, by(example, "ltc_row").value);
T("B-18: the example household carries a row the guardrail grade counts (Amazon) — the $0 cut pool a plan without one shows cannot be seen here (F-22's blind spot)",
  by(example, "cut_rows").onBoundary, by(example, "cut_rows").value);
// v6.28 (F-24, §K1): the example has no long-term row that is not care, so the v6.27 LTC test's false match on "Long-term disability" cannot
// be seen on it. Both legs ON — the row reads the expense table's labels with both patterns, not a build feature.
T("B-19: the example household has no long-term-disability row — the LTC test's false match cannot be seen here (F-24's blind spot)",
  by(example, "ltc_disability").onBoundary, by(example, "ltc_disability").value);
// v6.29 (F-25, §K1): the example's spouse B claims in the retirement month, at the start of A's income gap, so the Income tab's gap draw
// subtracting B's check for every gap month (right here, wrong for a B who claims later) cannot be seen on it. Both legs ON — a timeline fact.
T("B-20: the example's spouse B claims at the start of A's income gap — the gap draw's handling of a later claim cannot be seen here (F-25's blind spot)",
  by(example, "ss_claim_after_gap").onBoundary, by(example, "ss_claim_after_gap").value);
// v6.30 (D-60, §K1): the units fix shows only where a household reaches it. The example retires three years after its as-of year (the clock
// row is CLEAR — the one D-60 boundary it does reach) and has no NIIT year, no IRMAA year and no ACA subsidy year at the opening slider, so
// those three halves of the fix cannot be evidenced on it (scope §0.8; t93 uses fixtures that reach them). Both legs: Engine A on each.
T("B-21: the example retires after its as-of year — the clock change is reachable (CLEAR)", !by(example, "clock_coincide").onBoundary, by(example, "clock_coincide").value);
T("B-22: the example has no NIIT year at the opening slider (D-60's unindexed-threshold blind spot)", by(example, "niit_year").onBoundary, by(example, "niit_year").value);
T("B-23: the example has no IRMAA year at the opening slider (D-60's CPI-U tier blind spot)", by(example, "irmaa_year").onBoundary, by(example, "irmaa_year").value);
T("B-24: the example has no ACA subsidy year at the opening slider (D-60's poverty-line blind spot)", by(example, "aca_subsidy").onBoundary, by(example, "aca_subsidy").value);
// v6.31 (D-51, §K1): the example at its opening $70K slider has no surcharge in the Monte Carlo's schedule, so the Monte Carlo's IRMAA charge
// moves nothing on it — the reason D-51 was invisible there. ON on both legs (the v6.30 leg reads n/a: its schedule has no IRMAA part).
T("B-25: the example's Monte Carlo schedule carries no IRMAA surcharge at the opening slider (D-51's blind spot)", by(example, "irmaa_in_mc").onBoundary, by(example, "irmaa_in_mc").value);
// v6.32 (D-61, F-26, §K1): the example's first death leaves a survivor already past 71 (B, 78, in 2044) and spouse A has the larger benefit,
// so neither the survivor's own-age QCD rule nor the larger-benefit survivor check can be seen on it. Both legs ON — household facts.
T("B-26: the example's first death leaves a survivor of 71 or more — D-61's age rule cannot be seen here", by(example, "qcd_survivor").onBoundary, by(example, "qcd_survivor").value);
T("B-27: the example's spouse A has the larger benefit — the larger-benefit survivor check reads the same either way here", by(example, "survivor_benefit_b").onBoundary, by(example, "survivor_benefit_b").value);
// v6.33 (D-67, §K1): the example is dated 2026 and reads 2026's federal table, so indexing the tables from its as-of year or from their own
// year gives the same figures — the reason D-67 was invisible there (scope §0.8). ON on both legs (the v6.32 leg has no table year: every
// household is ON there, by construction).
T("B-28: the example is dated in its federal table's year — D-67's base-year change moves nothing here", by(example, "asof_table_year").onBoundary, by(example, "asof_table_year").value);
// v6.35 (D-44, D-65, §K1): the two conditions that hid them. Both legs ON — on v6.34 the one-time row census reads the table directly and the
// working-MAGI row reads "n/a".
T("B-29: the example has no one-time row between its as-of date and its planned retirement year (D-44's blind spot)", by(example, "pre_retire_once").onBoundary, by(example, "pre_retire_once").value);
T("B-30: the example states no last-working-years MAGI (D-65's blind spot)", by(example, "work_magi").onBoundary, by(example, "work_magi").value);
// v6.37 (F-29, §K1): the two conditions that hid it. Both legs ON — the rows read the plan, not a build feature.
T("B-31: the example's spouse A plans to claim at 67 (F-29's blind spot: v6.36's slider and FRA baseline equal the plan)", by(example, "ss_claim_a_planned_67").onBoundary, by(example, "ss_claim_a_planned_67").value);
T("B-32: the example's spouse B claims in the retirement year at her planned age (F-29's spouse-B blind spot)", by(example, "ss_claim_b_at_retire").onBoundary, by(example, "ss_claim_b_at_retire").value);
T("B-33: the example's steady-state income is below its spending (F-20's covered-spending blind spot)", by(example, "income_covers_spend").onBoundary && by(example, "income_covers_spend").value === "$5,000 vs $8,020 /mo", by(example, "income_covers_spend").value);
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
    // v6.08 (D-34): the IRA-RMD row reads Engine D's `rmdSleeve_y`, which builds before v6.08 do not publish — there it reads "n/a" on
    // every household, so the flip cannot happen and that is asserted instead (a gate, not a skip).
    if (id === "oth_ira_rmd" && !["v608", "v609", "v610", "v611", "v612", "v613", "v614", "v615", "v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER)) {
      T(`C-${name}/${id} (pre-v6.08 build): the row reads n/a on both households — the IRA's RMD is not published here`,
        !!after && before.value.startsWith("n/a") && after.value.startsWith("n/a"), after ? after.value : "row missing");
      continue;
    }
    // v6.16 (D-36): the self-employment row reads `SE_MIN_NET`, which builds before v6.16 do not have — "n/a" on every household there.
    if (id === "self_employed" && !["v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER)) {
      T(`C-${name}/${id} (pre-v6.16 build): the row reads n/a on both households — self-employment is not modelled here`,
        !!after && before.value.startsWith("n/a") && after.value.startsWith("n/a"), after ? after.value : "row missing");
      continue;
    }
    // v6.17 (D-38): the home-move row reads the accessor, which builds before v6.17 do not have — "n/a" on every household there.
    if (id === "home_move" && !["v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER)) {
      T(`C-${name}/${id} (pre-v6.17 build): the row reads n/a on both households — the cash is a constant here`,
        !!after && before.value.startsWith("n/a") && after.value.startsWith("n/a"), after ? after.value : "row missing");
      continue;
    }
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

// -- C-se . the v6.16 row reads the §1402(b)(2) floor, not merely "a self-employed row exists": $430 of profit is $397.11 net, under $400.
{
  const fl = by(at("selfEmployedFloor"), "self_employed");
  T(["v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER) ? "C-se-1: a self-employed row under the $400 floor leaves the row ON — the floor is read, not just the flag"
                           : "C-se-1 (pre-v6.16 build): the row reads n/a under the floor too",
    !!fl && fl.onBoundary && (["v616", "v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER) ? /^0 yr/.test(fl.value) : fl.value.startsWith("n/a")), fl ? fl.value : "row missing");
}

// -- C-car . the v6.21 row clears when the table's cars differ from the old schedule: none at all, and one moved by a year.
{
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES()));
  const withTable = X => { G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X)) }); const r = census(G);
    G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)) }); return by(r, "car_rows"); };
  const none = withTable(X0.filter(e => !/\bcars?\b/i.test(String(e.label || "")) || e.freq !== "once"));
  const moved = withTable(X0.map(e => e.freq === "once" && e.start === "2037-03" && /\bcars?\b/i.test(String(e.label || "")) ? { ...e, start: "2038-03", end: "2038-03" } : e));
  const POST621 = ["v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);
  T(POST621 ? "C-car-1: a table with no car reads clear (none is charged), and one with a car a year later reads clear (the household's own)"
            : "C-car-1 (pre-v6.21 build): the row reads n/a whatever the table holds",
    !!none && !!moved && (POST621 ? !none.onBoundary && /^0 one-time car rows/.test(none.value) && !moved.onBoundary
                                  : none.onBoundary && moved.onBoundary && none.value.startsWith("n/a")), `${none && none.value} | ${moved && moved.value}`);
}

// -- C-prompt . the v6.22 row clears for a household loaded WITHOUT a prompt: from v6.22 it holds none; through v6.21 it kept the example's.
{
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(G.EXPENSES())) });   // no prompt passed
  const r = by(census(G), "demo_prompt");
  const POST622 = ["v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
  T(POST622 ? "C-prompt-1: a household loaded without a master prompt holds none — the row reads clear"
            : "C-prompt-1 [KNOWN DEFECT 2026-10-20, D-53 — flips at v6.22]: a household loaded without a prompt keeps the example's — the row stays ON",
    !!r && (POST622 ? !r.onBoundary && r.value === "none" : r.onBoundary), r && r.value);
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(G.EXPENSES())), useDefaults: true });
}

// -- C-work . the v6.23 row clears for a household that is not the example by its holdings (one balance a dollar off): from v6.23 it is
//    paid no built-in work; through v6.22 it was.
{
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES()));
  const P1 = JSON.parse(JSON.stringify(BASE)); P1.positions[0].balance += 1;
  G.applyLoadedData({ portfolio: P1, expenses: JSON.parse(JSON.stringify(X0)) });
  const r = by(census(G), "example_work");
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)), useDefaults: true });
  const POST623 = ["v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
  T(POST623 ? "C-work-1: a household whose holdings are not the example's is paid no built-in work — the row reads clear"
            : "C-work-1 [KNOWN DEFECT 2026-10-20, D-49 — flips at v6.23]: a household whose holdings are not the example's is still paid the built-in work — the row stays ON",
    !!r && (POST623 ? !r.onBoundary && r.value === "none" : r.onBoundary), r && r.value);
}

// -- C-ltc / C-cut . the v6.27 rows clear when the table loses the labels they read: no LTC row; no "golf" or "Amazon" row.
{
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES()));
  const withTable = (X, id) => { G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X)) }); const r = census(G);
    G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)) }); return by(r, id); };
  const noLtc = withTable(X0.filter(e => !/ltc|long.?term/i.test(String(e.label || ""))), "ltc_row");
  const noCut = withTable(X0.filter(e => !/^(golf|amazon)$/i.test(String(e.label || ""))), "cut_rows");
  T("C-ltc-1: a table with no LTC row reads clear", !!noLtc && !noLtc.onBoundary && noLtc.value === "none", noLtc && noLtc.value);
  T("C-cut-1: a table with neither a \"golf\" nor an \"Amazon\" row reads clear", !!noCut && !noCut.onBoundary && noCut.value === "none", noCut && noCut.value);
  // v6.28 (F-24): a table whose only long-term row is disability — the new row clears, and ltc_row follows the leg's own test: v6.28 counts no
  // LTC row there; v6.27's pattern counted the disability row as one (pinned, not hidden).
  const disT = [...X0.filter(e => !/ltc|long.?term/i.test(String(e.label || ""))), { category: "Insurance", label: "Long-term disability", amount: 90, startDate: "2026-01", endDate: "2040-12", kind: "monthly" }];
  const dis = withTable(disT, "ltc_disability"), ltcD = withTable(disT, "ltc_row");
  T("C-dis-1: a table with a \"Long-term disability\" row reads clear on the new row (reachable)", !!dis && !dis.onBoundary && /Long-term disability/.test(dis.value), dis && dis.value);
  const POST628 = ["v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);
  T(POST628 ? "C-dis-2: on that table the LTC row reads none — a disability row is not long-term care"
            : "C-dis-2 [KNOWN DEFECT 2026-10-21, F-24 — flips at v6.28]: on that table the v6.27 test counts the disability row as an LTC row",
    !!ltcD && (POST628 ? !ltcD.onBoundary && ltcD.value === "none" : ltcD.onBoundary && /Long-term disability/.test(ltcD.value)), ltcD && ltcD.value);
}

// -- C-hm . the v6.17 row clears at $0 too: "no move" is a figure of the household's own, not the old constant.
{
  const z = by(at("homeMoveNone"), "home_move");
  T(["v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER) ? "C-hm-1: a plan with no home move ($0) reads clear — it differs from the old constant"
                           : "C-hm-1 (pre-v6.17 build): the row reads n/a at $0 too",
    !!z && (["v617", "v618", "v619", "v620", "v621", "v622", "v623", "v624", "v625", "v626", "v627", "v628", "v629", "v630", "v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER) ? !z.onBoundary && /^\$0 at retirement/.test(z.value) : z.onBoundary && z.value.startsWith("n/a")), z ? z.value : "row missing");
}

// -- C-irmaa . v6.31 (D-51): the example filed single (nothing else changed) puts surcharges in the schedule — the row clears on v6.31; on v6.30 it reads n/a (ON).
{
  const POST631 = ["v631", "v632", "v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
  // built here, not in tools/fixture (every suite that iterates the fixture households would grow by one): the example with single = true
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), single: true } }); const r = by(census(G), "irmaa_in_mc"); reset();
  T(POST631 ? "C-irmaa-1: the example filed single reads clear — nine premium years with a surcharge, from 2031 (reachable)"
            : "C-irmaa-1 [KNOWN DEFECT 2026-10-24, D-51 — flips at v6.31]: the example filed single still reads n/a — the schedule has no IRMAA part",
    !!r && (POST631 ? !r.onBoundary && r.value === "9 premium year(s), from 2031" : r.onBoundary && r.value.startsWith("n/a")), r && r.value);
}

// -- C-d61 . v6.32 (D-61, F-26): two fixtures, each built here from the example (not in tools/fixture — every suite iterating those households
// would grow), each clearing one row: A born 1958 dying at 76 (2034) leaves spouse B at 68; the two benefits swapped gives B the larger.
{
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), dobA: "1958-01-01", lifeExpA: 76 } }); const q = by(census(G), "qcd_survivor"); reset();
  T("C-d61-1: a first death in 2034 leaving spouse B at 68 reads clear — D-61's age rule is reachable", !!q && !q.onBoundary && q.value === "68 (B, in 2034)", q && q.value);
  const sw = JSON.parse(JSON.stringify(BASE)); const a = sw.incomeSources.ssA.planned; sw.incomeSources.ssA.planned = sw.incomeSources.ssB.planned; sw.incomeSources.ssB.planned = a;
  G.applyLoadedData({ portfolio: sw }); const b = by(census(G), "survivor_benefit_b"); reset();
  T("C-d61-2: the two benefits swapped reads clear — spouse B's is the larger", !!b && !b.onBoundary && /^A \$1,300, B \$3,300/.test(b.value), b && b.value);
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), single: true } }); const sq = by(census(G), "qcd_survivor"), sb = by(census(G), "survivor_benefit_b"); reset();
  T("C-d61-3: a single plan reads n/a on both rows", !!sq && !!sb && sq.value === "n/a" && sb.value === "n/a");
}

// -- C-table . v6.33 (D-67): the example dated 2027-01-15 (nothing else changed) reads clear on v6.33 — dated 2027, reading the 2026 table;
// on v6.32 it is ON: that leg indexes from the as-of year, so the census cannot separate the two bases (the defect, seen from the census).
{
  const POST633 = ["v633", "v634", "v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), asOf: "2027-01-15" } }); const r = by(census(G), "asof_table_year"); reset();
  T(POST633 ? "C-table-1: the example dated 2027 reads clear — dated 2027, reading the 2026 table (D-67 reachable)"
            : "C-table-1 [KNOWN DEFECT 2026-10-26, D-67 — flips at v6.33]: the example dated 2027 still reads ON — the leg indexes from the as-of year",
    !!r && (POST633 ? !r.onBoundary && r.value === "2027 vs 2026" : r.onBoundary && r.value === "2027 vs 2027"), r && r.value);
}

// -- C-d44/C-d65 . v6.35 (D-44, D-65): built here from the example (not in tools/fixture, for C-d61's reason; and a fixture carries no table).
// A one-time row in May 2027 clears pre_retire_once on both legs (on v6.34 the row reads the table directly); workMagi set clears work_magi on
// v6.35 only — on v6.34 there is no field (n/a, ON), the defect seen from the census.
{
  const POST635 = ["v635", "v636", "v637", "v638"].includes(VER);   // an array, so the next registration widens it
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES()));
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: [...JSON.parse(JSON.stringify(X0)), { cat: "Retirement Life", name: "t29 row", amount: 30000, freq: "once", start: "2027-05", end: "2027-05" }] });
  const p = by(census(G), "pre_retire_once");
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(BASE)), workMagi: 300000 }, expenses: JSON.parse(JSON.stringify(X0)) });
  const w = by(census(G), "work_magi");
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)) });
  T("C-d44-1: a $30,000 one-time row in May 2027 reads clear — $30,000 before retirement (D-44 reachable)", !!p && !p.onBoundary && p.value.startsWith("$30,000"), p && p.value);
  T(POST635 ? "C-d65-1: a plan stating $300,000 of working-years MAGI reads clear (D-65 reachable)"
            : "C-d65-1 [KNOWN DEFECT 2026-10-28, D-65 — flips at v6.35]: a plan stating working-years MAGI still reads n/a — the leg has no field",
    !!w && (POST635 ? !w.onBoundary && w.value.startsWith("$300,000") : w.onBoundary && w.value.startsWith("n/a")), w && w.value);
}

// -- C-f29 . v6.37 (F-29): built here from the example. Spouse A at 65 clears ss_claim_a_planned_67, spouse B at 62 clears
// ss_claim_b_at_retire; the example made single reads n/a (ON). Both legs: the rows read the plan.
{
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES())), P0 = JSON.parse(JSON.stringify(BASE));
  const pa = JSON.parse(JSON.stringify(P0)); pa.incomeSources.ssA = { ...pa.incomeSources.ssA, plannedAge: 65, planned: pa.incomeSources.ssA.tableByAge[65] };
  G.applyLoadedData({ portfolio: pa, expenses: JSON.parse(JSON.stringify(X0)) }); const a = by(census(G), "ss_claim_a_planned_67");
  const pb = JSON.parse(JSON.stringify(P0)); pb.incomeSources.ssB = { ...pb.incomeSources.ssB, plannedAge: 62, planned: pb.incomeSources.ssB.tableByAge[62] };
  G.applyLoadedData({ portfolio: pb, expenses: JSON.parse(JSON.stringify(X0)) }); const b = by(census(G), "ss_claim_b_at_retire");
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(P0)), single: true }, expenses: JSON.parse(JSON.stringify(X0)) }); const bs = by(census(G), "ss_claim_b_at_retire");
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)) });
  T("C-f29-1: spouse A planning 65 reads clear (F-29 reachable)", !!a && !a.onBoundary && a.value === "age 65", a && a.value);
  T("C-f29-2: spouse B planning 62, 63 at retirement, reads clear; a single plan reads n/a", !!b && !b.onBoundary && b.value === "claims at 62; 63 at retirement" && !!bs && bs.onBoundary && bs.value === "n/a",
    `${b && b.value} | ${bs && bs.value}`);
}

// -- C-f20 . v6.38 (F-20): the example with a $9,000-a-month joint rental from 2026 (no COLA) clears income_covers_spend; a $3,020 rental
// brings income exactly to spending, which also clears it (at or above). Both legs: the row reads the plan.
{
  const X0 = JSON.parse(JSON.stringify(G.EXPENSES())), P0 = JSON.parse(JSON.stringify(BASE));
  const st = m => [{ label: "Rental", kind: "rental", owner: "joint", monthly: m, startYear: 2026, endYear: 9999, cola: false, tax: "ordinary" }];
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(P0)), incomeStreams: st(9000) }, expenses: JSON.parse(JSON.stringify(X0)) }); const c = by(census(G), "income_covers_spend");
  G.applyLoadedData({ portfolio: { ...JSON.parse(JSON.stringify(P0)), incomeStreams: st(3020) }, expenses: JSON.parse(JSON.stringify(X0)) }); const e = by(census(G), "income_covers_spend");
  G.applyLoadedData({ portfolio: JSON.parse(JSON.stringify(BASE)), expenses: JSON.parse(JSON.stringify(X0)) });
  T("C-f20-1: a plan whose income is above its spending reads clear, and one exactly at it too (F-20 reachable)",
    !!c && !c.onBoundary && c.value === "$14,000 vs $8,020 /mo" && !!e && !e.onBoundary && e.value === "$8,020 vs $8,020 /mo", `${c && c.value} | ${e && e.value}`);
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

  // ⚠ THROUGH v5.68 F-6 WAS the empty-set guard (from v569 it is INVERTED — see below), and it was the one that would have failed quietly. If no state
  // in STATE_RULES matches the income-limit pattern, `state_excl_limited` can never read ON and
  // every assertion about it passes vacuously \u2014 green from an empty set (OPERATIONS \u00a7B2).
  // This release found that exact defect twice in its own tooling, so it is pinned here.
  // ⚠ v5.68: the selector carries `!r.exclTest`, MATCHING `boundaries.mjs` (D-VA-3). The row means
  // "income-limited in law, UNCONDITIONAL IN THE MODEL", and `exclTest` is exactly what makes a state
  // conditional. This copy and the census's copy had to agree; F-6c asserted they did until the census row retired at v5.69.
  // ⚠ STAGE 1 OF SCOPE_STATE_SET_SELECTOR (2026-09-15): `limited` is no longer selected by executing a regex
  //   against user-facing notes. Membership is the shared five-state IN_LAW list and the predicate is the
  //   shared `isConditioned` (truthy `exclTest`, this site's own reading) — tools/state_sets.cjs. Verified
  //   against v5.64..v5.71 sources to give the prose selector's set on every leg. f6_probe reads the same
  //   helper; qa/state_sets_check.mjs asserts the two agree and carries the drift guard.
  const limited = SETS.unconverted(RULES);
  // ⚠ v5.69: INVERTED, NOT WEAKENED (SCOPE_RI_POPULATE D-RI-4). Rhode Island was the last state in this set;
  //   with it converted the set is EMPTY by design, so from v569 F-6 asserts emptiness and a state that
  //   re-enters (a new income-limited statute found, or a table dropped) turns it red. Frozen legs keep
  //   the non-empty guard, which was their truth (OPERATIONS §B2, gate the inversion).
  const _v6 = Number(VER.replace(/[^0-9]/g, ""));
  // ⚠ v5.72: RE-INVERTED, NOT WEAKENED (SCOPE_IMPORT_HARDENING D-8). Maine is income-limited in law from
  //   TY2025 and was missing from the list; stage 2 adds it as data, and the model does not condition it yet.
  //   So the set is {ME} by design and F-6 is again the non-empty guard. When Maine is populated it empties
  //   and F-6 inverts again — in that release, with its own gate.
  // ⚠ v5.73: INVERTED AGAIN, as the v5.72 note above said it would be — Maine is conditioned (its phaseout,
  //   SCOPE_ME_PHASEOUT_MT_CORRECTIONS), so all six in-law statutes carry `exclTest` and the set is empty.
  if (_v6 >= 573)
    T("F-6 [v5.73]: NO STATE_RULES entry carries an income-limited 65+ exclusion the model applies unconditionally \u2014 all six known statutes are conditioned, Maine included",
      limited.length === 0, `${limited.length} found: ${limited.join(",")}`);
  else if (_v6 >= 572)
    T("F-6 [v5.72]: at least one STATE_RULES entry carries an income-limited 65+ exclusion the model applies unconditionally — Maine, until it is populated",
      limited.length > 0, `${limited.length} found`);
  else if (_v6 >= 569)
    T("F-6 [v5.69]: NO STATE_RULES entry carries an income-limited 65+ exclusion the model applies unconditionally \u2014 all five known statutes are conditioned",
      limited.length === 0, `${limited.length} found: ${limited.join(",")}`);
  else
    T("F-6: at least one STATE_RULES entry carries an income-limited 65+ exclusion the model applies unconditionally \u2014 otherwise the D-3c row is vacuous",
      limited.length > 0, `${limited.length} found`);

  // \u26a0 F-6a / F-6b \u2014 REPAIRED AT v5.68 (OPERATIONS §D2, flipped). Their v5.67 form was
  // `T(label, limited.length, 1)` and `T(label, limited.join(","), "VA")`: the expected value sat in
  // the display-string slot and was never compared, so both passed on ANY non-empty set. They also
  // measured the wrong thing — the comment here said the set was {VA} when it was {NM, RI, VA}.
  // Both now use EQ, and both are GATED PER LEG (§B2) because the set legitimately differs by build:
  //   v5.68  {RI}       Virginia populated
  //   v5.67  {RI, VA}   New Mexico excluded by `!r.exclTest`, as it should have been since v5.66
  // ⚠ A negative control that changes an INTERIOR member (a set that stays non-empty) must turn
  //   these red while F-6 stays green. That is the whole of §D1's record, and qa/tools/controls_v568_va.py
  //   runs it. When RHODE ISLAND is populated this set EMPTIES: F-6 must then INVERT, deliberately,
  //   with the census row retired in the same release — never weakened to stay green.
  const _exp6 = _v6 >= 573 ? [] : _v6 >= 572 ? ["ME"] : _v6 >= 569 ? [] : _v6 >= 568 ? ["RI"] : ["RI", "VA"];   // v5.69: EMPTY — Rhode Island converted
  EQ(`F-6a: the income-limited-but-unconditional set has exactly ${_exp6.length} member(s) on this leg`,
    limited.length, _exp6.length);
  EQ(`F-6b: and they are exactly ${_exp6.join(", ") || "none (the set is empty)"} \u2014 if this changes, the release that changed it owns F-6`,
    limited.join(","), _exp6.join(","));
  // ── RETIRED at v5.69 (SCOPE_RI_POPULATE D-RI-4): F-6c and F-7. F-6c asserted that boundaries.mjs's
  //   `state_excl_limited` row named the same set as F-6; F-7 asserted that the `stateExclCliff` fixture
  //   turned that row ON. With the set empty the row can never read ON and the fixture has no state to
  //   stand on, so the row, the fixture and both checks retire TOGETHER in the release that emptied the
  //   set — never the fixture alone to keep t29 green. ⚠ Tools and fixtures are shared by both legs, so
  //   these leave the v568 leg as well; that leg's t29 count falls for a TOOLING reason, not a build one.
  //   F-6/F-6a/F-6b above still assert the set per leg, which is the property the pair existed to reach.

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
