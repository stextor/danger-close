// boundaries.mjs — THE BOUNDARY CENSUS (qa/tools; asserts nothing, counted in no total — §B1)
//
// WHAT THIS ANSWERS. At scope time, for a defect about to be written up: **does the household
// exercise the behaviour in question, or is it $0 there?** Point it at the shipped example
// household to learn whether a brief can quote example-data figures at all; point it at a
// PROPOSED FIXTURE to learn whether that fixture actually clears the boundary it was built for.
//
// WHY IT EXISTS. Two releases running, a defect was $0 on the example household and the $0
// property was discovered MID-BUILD, after the brief had been written: v5.45 (benefits far above
// the §86(a)(1) ½-cap band) and v5.46 (spouse B claims in January of the ladder's first year).
// Both briefs carried the line "expected figures NOT derived — the fixture is the work."
//   ⚠ The v5.46 brief claimed FOUR consecutive releases with that property. That is wrong.
//   v5.42 was non-zero on the example household at lower slider positions ($0 only at the
//   $70,000 default) and v5.44 was non-zero outright ($102,205 -> $89,562). Those are a
//   default-VIEW problem and a nobody-looked problem respectively, and this tool does not claim
//   to catch either. The honest streak is two.
//
// THE FIXTURE USE IS THE STRONGER ONE. v5.46's fixture (spouse B delaying to 70) exercised the
// claim gate across seven years and looked complete — but B claimed in JANUARY, so a pro-rata
// gate and a whole-year gate produced identical figures and the release's actual modelling
// decision would have shipped UNVERIFIED. A second fixture with a July claim was needed. This
// census would have flagged `dobB_month` on the proposed fixture before any test code was written.
//
// NO CONSTANT IS HARDCODED HERE. Every numeric threshold is read live from the app through the
// test shim — `TAX_CONSTS()` for the §86 thresholds, `rmdStartAge()` for the SECURE 2.0 split.
// A tool that keeps its own copy of a constant is a second answer that drifts, which is this
// project's recurring failure. What IS written down are the STRUCTURAL relationships (is the DOB
// month January; does B's claim year equal the ladder start) — those have no source of truth to
// read, and they are kept honest by the maintenance rule in OPERATIONS §K1 instead.

// ── the census ───────────────────────────────────────────────────────────────────────────
// Pure function of the shim object `G`, so the suite can drive it directly with no CLI, no
// module resolution and no environment. Returns rows; printing is somebody else's job.
export function census(G) {
  const P = G.PORTFOLIO();
  const tl = G.PLAN_TIMELINE();
  const T = G.TAX_CONSTS();
  const single = !!tl.single;
  const ssA = G.getSSA() * 12, ssB = single ? 0 : G.getSSB() * 12;

  // §86(a)(1)'s ½-benefits cap can only bind while provisional income sits in the MIDDLE tier,
  // and the widest (provisional − base) can get inside that tier is the tier's own width. So the
  // affected band is exactly THR2 − THR1 — DERIVED, not the "$12,000" figure v5.45 quoted.
  const THR1 = single ? T.SS_THR1_SGL : T.SS_THR1_MFJ;
  const THR2 = single ? T.SS_THR2_SGL : T.SS_THR2_MFJ;
  const halfCapBand = THR2 - THR1;

  const rows = [];
  const row = (id, param, value, boundary, onBoundary, note) =>
    rows.push({ id, param, value: String(value), boundary, onBoundary, note });

  row("filing", "filing status", single ? "single" : "married filing jointly",
    "single vs MFJ", true,
    single ? "single — the MFJ path is unexercised by this household"
           : "MFJ — the single path is unexercised by this household");

  for (const [k, dob] of [["A", tl.dobA], ["B", single ? null : tl.dobB]]) {
    if (!dob) { row(`dob${k}_month`, `dob${k} month`, "n/a", "1 = January", false, "single filer — no spouse B"); continue; }
    row(`dob${k}_month`, `dob${k} month`, dob.month, "1 = January", dob.month === 1,
      dob.month === 1 ? "DEGENERATE — every partial-month calculation is a no-op on this household"
                      : "exercises partial-month arithmetic");
    // SECURE 2.0 §107 — read through the app's own helper so a rule change moves this row too.
    const age = G.rmdStartAge(dob.year);
    const other = G.rmdStartAge(dob.year >= 1960 ? 1959 : 1960);
    row(`rmd_age_${k}`, `${k} RMD start age`, `${age} (born ${dob.year})`,
      `${other} vs ${age}`, true, `only the ${age} branch is exercised by this spouse`);
  }

  const start = tl.rothLadderStart;
  for (const [k, d] of [["A", tl.ssA_date], ["B", single ? null : tl.ssB_date]]) {
    if (!d) { row(`ss${k}_claim`, `${k} claim year`, "n/a", `ladder start ${start}`, false, "single filer — no spouse B"); continue; }
    const after = d.year > start;
    row(`ss${k}_claim`, `${k} claim year`, `${d.year}-${String(d.month).padStart(2, "0")}`,
      `ladder start ${start}`, !after,
      after ? "mid-ladder — the claim gate is exercised"
            : `DEGENERATE — claim ${d.year === start ? "equals" : "precedes"} the ladder start, so the gate can never fire`);
  }

  for (const [k, amt] of [["A", ssA], ["B", ssB]]) {
    if (single && k === "B") { row("ssB_band", "B benefits/yr", "n/a", `< $${halfCapBand.toLocaleString()}`, false, "single filer — no spouse B"); continue; }
    const inside = amt > 0 && amt < halfCapBand;
    row(`ss${k}_band`, `${k} benefits/yr`, "$" + amt.toLocaleString(),
      `§86(a)(1) ½-cap band < $${halfCapBand.toLocaleString()}`, !inside,
      inside ? "inside the band — the ½ cap is reachable"
             : "OUTSIDE — the ½ cap is unreachable from this household");
  }

  // ── STATE TAX · three rows, because one row could not tell three behaviours apart ──────────
  // Until 2026-08-28 this was a single `state_tax` row keyed on `P.stateTaxRate`. That row reads
  // ON for the LEGACY FLAT-RATE FALLBACK only. The 51-jurisdiction `STATE_RULES` module is
  // selected by `P.stateCode` and is a different code path — `stateTaxAnnual` branches on
  // `STATE_RULES[code]` before it ever looks at the fallback rate — so a household with a real
  // state code and no legacy rate showed this census a muted state-tax path while exercising the
  // module fully. One row, three behaviours, and the census could not say which was live.
  const rate = Number(P.stateTaxRate || 0);
  const code = P.stateCode || null;
  const RULES = (G.STATE_RULES && G.STATE_RULES()) || {};
  const rule = code ? RULES[code] : null;

  row("state_tax", "legacy flat rate", rate ? rate : "0 / unset", "0 vs non-zero", !rate,
    rate ? "exercises the LEGACY fallback path" : "ZERO — the legacy fallback is muted");

  row("state_code", "state code", code || "unset", "unset vs in STATE_RULES", !rule,
    rule ? `exercises the ${Object.keys(RULES).length}-jurisdiction module (${rule.name})`
         : "UNSET — the state module is unexercised; only the legacy path can run");

  // D-3c: `stateTaxAnnual` subtracts `excl65` unconditionally, but several states cap the
  // exclusion by income and cut it off at a hard cliff. The defect is only REACHABLE from a
  // household whose state has such an exclusion — elsewhere the unconditional subtraction is
  // correct and a fixture there proves nothing.
  //
  // ⚠ The state list is read LIVE from `STATE_RULES` and matched on the rule's own note text.
  // No state code is written down here. §K1: a tool that keeps its own copy of a threshold is a
  // second answer that drifts, and this census exists because the app and the tool disagreeing
  // is the failure mode. If a state's note stops flagging its income limit, this row goes quiet
  // — which is correct, because the note is where that fact lives today.
  const LIMIT_NOTE = /income[- ]limited|income limit/i;
  const limited = Object.entries(RULES)
    .filter(([, r]) => (r.excl65 || 0) > 0 && LIMIT_NOTE.test(r.note || ""))
    .map(([c]) => c);
  const onLimited = !!(code && limited.includes(code));
  row("state_excl_limited", "income-limited 65+ exclusion",
    onLimited ? `${code} (excl65 $${(rule.excl65 || 0).toLocaleString()})` : (code || "unset"),
    `state in {${limited.join(",") || "none found"}}`, !onLimited,
    onLimited ? "exercises the D-3c class — the exclusion is income-limited in law, unconditional in the model"
              : `OUT — D-3c is unreachable; ${limited.length} state(s) in the module carry an income-limited exclusion`);

  const streams = (P.incomeStreams || []).length;
  row("income_streams", "income streams", streams, "0 vs >0", streams === 0,
    streams ? "exercises the income-stream paths" : "NONE — the income-stream paths are unexercised");

  const wA = tl.rothLadderEndA, wB = tl.rothLadderEndB;
  row("ladder_windows", "ladder windows", single ? `A ends ${wA}` : `A ends ${wA}, B ends ${wB}`,
    "identical vs differing", single ? true : wA === wB,
    single ? "single filer — one window only"
           : (wA === wB ? "identical — the per-spouse window split is unexercised"
                        : "differ — the per-spouse window split is exercised"));

  return rows;
}

export const onBoundary = rows => rows.filter(r => r.onBoundary);

// ── printing ─────────────────────────────────────────────────────────────────────────────
export function table(rows) {
  const cols = [
    ["parameter", r => r.param, 22],
    ["value", r => r.value, 24],
    ["boundary it could sit on", r => r.boundary, 40],
    ["verdict", r => (r.onBoundary ? "ON  " : "clear ") + r.note, 78],
  ];
  const out = [cols.map(([h, , w]) => h.padEnd(w)).join("")];
  out.push(cols.map(([, , w]) => "-".repeat(w - 1)).join(" "));
  for (const r of rows) out.push(cols.map(([, f, w]) => String(f(r)).padEnd(w)).join(""));
  const n = onBoundary(rows).length;
  out.push("");
  out.push(`${n} of ${rows.length} parameters sit on a boundary. Rows marked ON are behaviours this ` +
           `household CANNOT demonstrate.`);
  return out.join("\n");
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────────
// Usage:  node boundaries.mjs <ver> [portfolio.json] [--json]
// Resolves the app module the same way t24/t27 resolve the §86 oracle, and SAYS WHICH COPY IT
// USED, because the pool is flat and the repo is not — a stale duplicate must be visible rather
// than silent.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { existsSync, readFileSync } = await import("fs");
  const { join, dirname } = await import("path");
  const { fileURLToPath, pathToFileURL } = await import("url");
  const HERE = dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2).filter(a => a !== "--json");
  const asJson = process.argv.includes("--json");
  const VER = args[0] || "v546";
  const envCands = [join(HERE, "env_dom.mjs"), join(HERE, "..", "env_dom.mjs")];
  const env = envCands.find(existsSync);
  if (env) await import(pathToFileURL(env).href);
  let _s = 42; Math.random = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
  const appCands = [join(HERE, "..", `app_${VER}.mjs`), join(HERE, `app_${VER}.mjs`)];
  const app = appCands.find(existsSync);
  if (!app) {
    console.error(`boundaries: no app_${VER}.mjs found. Looked in:\n` + appCands.map(c => "  " + c).join("\n"));
    process.exit(1);
  }
  const G = (await import(pathToFileURL(app).href)).__g;
  if (args[1]) G.applyLoadedData({ portfolio: JSON.parse(readFileSync(args[1], "utf8")) }); // WRAPPER — §C
  const rows = census(G);
  if (asJson) console.log(JSON.stringify({ version: VER, app, source: args[1] || "example household", rows }, null, 2));
  else {
    console.log(`boundary census — ${VER}`);
    console.log(`     app:       ${app}`);
    console.log(`     household: ${args[1] || "the shipped example household"}\n`);
    console.log(table(rows));
  }
}
