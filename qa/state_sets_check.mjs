// state_sets_check — the shared income-limited state set, its drift guard, and f6_probe's agreement.
// SCOPE_STATE_SET_SELECTOR.md §7.6 / §7.7, STAGE 1 (ops package 2026-09-15).
// Run: node state_sets_check.mjs v571      (both legs — runsuite.sh runs it under TOOLING)
//
// ⚠ TOOLING — COUNTED IN NO APP TOTAL. Every check here is about the suite's own single source of truth
// (`tools/state_sets.cjs`) and a probe (`tools/f6_probe.cjs`), not about the app's arithmetic. It is a
// separate file rather than new checks in t29/t35 for exactly that reason: both of those ARE in the app
// total (t29's header said otherwise until this package — it was wrong), and stage 1 moves no app figure.
//
// WHAT §7.7 ASKS, AND WHERE EACH ITEM LIVES
//   1  the set is asserted FROM the shared list ........ S-1 here; t29 `limited` and t35 `offenders` now
//                                                          call `unconverted()` (their existing checks)
//   2  the unconverted set is EMPTY, gated per leg ..... t29 F-6/F-6a/F-6b and t35 D-7/D-8 — already gated
//                                                          at v569, now fed by the list. Not duplicated here:
//                                                          a second gated copy is a second version-bump cost.
//   3  the drift guard ................................. S-4
//   4  f6_probe agrees with t29 F-6 on the same source .. S-5, S-6
//   5  a negative control per converted site ........... tools/controls_state_sets.py
//   6  the six pins still fire on a reworded note ...... S-8 (structural) + controls_state_sets.py (behaviour)
//
// NO VERSION LADDER, ON PURPOSE. Nothing below differs by leg, so a KNOWN_VERSIONS registry would be pure
// bump cost (vercensus prices a bump at 86 judgement points already). The floor is v5.64, the first build
// with `exclTest`. If a future leg makes any check here leg-dependent, add the ladder in that release.
import "./env_dom.mjs";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";
import { execFileSync } from "child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const VER = process.argv[2] || "";
const _v = Number(VER.replace(/[^0-9]/g, "")) || 0;
if (!/^v\d+$/.test(VER) || _v < 564) {
  console.log(`\n  \u2717 FATAL: "${VER}" is not a suite tag at or above v564 (exclTest does not exist earlier).`);
  console.log("state_sets_check: 0 passed, 1 failed");
  process.exit(1);
}
const pick = (...c) => c.find(existsSync);
const SETS_PATH = pick(join(HERE, "tools", "state_sets.cjs"), join(HERE, "state_sets.cjs"));
const PROBE = pick(join(HERE, "tools", "f6_probe.cjs"), join(HERE, "f6_probe.cjs"));
const SRC = pick(join(HERE, "..", `${VER}.jsx`));
if (!SETS_PATH || !PROBE || !SRC) {
  console.log(`  \u2717 missing input — state_sets.cjs: ${!!SETS_PATH}, f6_probe.cjs: ${!!PROBE}, ../${VER}.jsx: ${!!SRC}`);
  console.log("state_sets_check: 0 passed, 1 failed");
  process.exit(1);
}
const req = createRequire(import.meta.url);
const SETS = req(SETS_PATH);
const R = (await import(pathToFileURL(join(HERE, `app_${VER}.mjs`)).href)).__g.STATE_RULES();

let pass = 0, fail = 0;
const T = (n, ok, d = "") => { if (ok) pass++; else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + d : ""}`); } };
const EQ = (n, got, want) => T(n, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

console.log(`state_sets_check \u2014 SHARED STATE SET (${VER})`);
console.log(`     sets:  ${SETS_PATH}\n     probe: ${PROBE}\n     src:   ${SRC}\n`);

// ── S-1..S-3 · the list itself ────────────────────────────────────────────────────────────────
// Hand-typed from docs/FINDINGS-v5_63-state-statutes.md (§§2–6: NM, CT, NJ, VA, RI). A literal here is
// deliberate: this is the one place a second copy is the assertion, not the defect.
EQ("S-1: the in-law list is exactly the five statutes FINDINGS-v5_63 reads", SETS.IN_LAW.join(","), "CT,NJ,NM,RI,VA");
const absent = SETS.IN_LAW.filter(c => !Object.prototype.hasOwnProperty.call(R, c));
T("S-2: every in-law state is a STATE_RULES key on this leg \u2014 a typo would make it silently unconvertible",
  absent.length === 0, absent.join(","));
T("S-3: `unconverted()` can only name in-law states \u2014 t29's `limited` and t35's `offenders` are derived from the list",
  SETS.unconverted(R).every(c => SETS.IN_LAW.includes(c)), SETS.unconverted(R).join(","));

// ── S-4 · THE DRIFT GUARD (§7.6) ─────────────────────────────────────────────────────────────
// The residual risk of stage 1 is a hand-maintained list. A row OUTSIDE the list that the old prose
// selector would have caught — a non-zero excl65 whose note says income-limited — lands here and fires.
// ⚠ PHRASE-BASED, AND SAYS SO: a note describing an income limit in other words is invisible to it.
const drift = SETS.proseSelected(R);
T("S-4: DRIFT GUARD \u2014 no state outside the in-law list carries excl65 > 0 with a note matching NOTE_MATCHER",
  drift.length === 0, `outside the list: ${drift.join(",")}`);

// ── S-5..S-6 · f6_probe agrees with t29 F-6 ON THE SAME SOURCE (§7.3's regression test) ─────────
// t29's F-6 set IS `unconverted(STATE_RULES())` on the live module. The probe reads the same leg's
// SOURCE by AST. From v5.68 to 2026-09-15 these disagreed (probe: NM, RI, VA; t29: empty) and nothing
// looked. Run as a subprocess: what is tested is the probe as a maintainer runs it.
let out = "";
try { out = execFileSync(process.execPath, [PROBE, SRC], { encoding: "utf8" }); }
catch (e) { out = String(e.stdout || "") + String(e.message || ""); }
const line = (re) => { const m = out.match(re); return m ? m[1].split(",").map(s => s.trim()).filter(Boolean).sort().join(",") : null; };
const probeSet = line(/F-6 guarded set, AS SHIPPED : \d+ -> ([^\n]*)/);
const probeDrift = line(/drift \(outside IN_LAW[^\n]*: \d+ -> ([^\n]*)/);
EQ("S-5: f6_probe's F-6 set on this leg's source equals t29 F-6's set on this leg's module",
  probeSet, SETS.unconverted(R).join(","));
EQ("S-6: and its drift line equals the drift guard's", probeDrift, drift.join(","));

// ── S-7 · the predicate is fixed, not only the membership (§7.2's fourth micro-divergence) ─────
// t29 wrote `!r.exclTest`, t35 wrote `=== undefined`. They split on null/false. One reading now.
const syn = { CT: { excl65: 1, exclTest: null }, NJ: { excl65: 1, exclTest: false }, NM: { excl65: 1, exclTest: () => 0 },
              RI: { excl65: 0 }, VA: { excl65: 1 } };
EQ("S-7: `unconverted()` treats exclTest null/false as UNconditioned, a function as conditioned, and excl65 0 as out",
  SETS.unconverted(syn).join(","), "CT,NJ,VA");

// ── S-8 · the six PINS still execute the ONE matcher, and no site holds its own copy ───────────
// Structural half of §7.7 test 6. The behavioural half (a reworded note turns each pin red) is in
// controls_state_sets.py, because it needs a mutated build. Found by AST, never by grep (§B1a).
let acorn, jsxp, awalk;
try { acorn = req("acorn"); jsxp = req("acorn-jsx"); awalk = req("acorn-walk"); } catch { acorn = null; }
if (!acorn) {
  T("S-8: acorn resolves (the structural checks need it)", false);
} else {
  const P = acorn.Parser.extend(jsxp());
  const base = Object.assign({}, awalk.base, { JSXElement() {}, JSXFragment() {} });
  const files = [];
  for (const d of [HERE, join(HERE, "tools"), join(HERE, "qa-baseline")])
    if (existsSync(d)) for (const f of readdirSync(d)) if (/\.(mjs|cjs)$/.test(f) && !/^(app_|dom_)/.test(f)) files.push(join(d, f));   // skip generated bundles
  const copies = [], pinCalls = {};
  for (const f of files) {
    let ast; const src = readFileSync(f, "utf8");
    try { ast = P.parse(src, { ecmaVersion: "latest", sourceType: "module" }); }
    catch { try { ast = P.parse(src, { ecmaVersion: "latest", sourceType: "script" }); } catch { continue; } }
    const name = f.slice(f.lastIndexOf("/") + 1);
    awalk.simple(ast, {
      Literal(n) { if (n.regex && n.regex.pattern === SETS.NOTE_MATCHER.source) copies.push(name); },
      CallExpression(n) {
        const c = n.callee;
        if (c.type === "MemberExpression" && c.object.type === "Identifier" && c.object.name === "NOTE_MATCHER" &&
            c.property.name === "test") {
          // the pinned state is the `R.XX` the argument reads
          let st = "?"; awalk.simple(n.arguments[0] || {}, { MemberExpression(m) {
            if (m.object.type === "Identifier" && m.object.name === "R" && /^[A-Z]{2}$/.test(m.property.name || "")) st = m.property.name; } }, base);
          (pinCalls[name] = pinCalls[name] || []).push(st);
        }
      },
    }, base);
  }
  EQ("S-8a: the phrase pattern exists as a literal in exactly ONE file, state_sets.cjs \u2014 no site keeps its own copy",
    [...new Set(copies)].sort().join(","), "state_sets.cjs");
  EQ("S-8b: t35's four PINS (D-7a..D-7d) still execute NOTE_MATCHER against NM, NJ, VA and RI notes",
    (pinCalls["t35_state_populate.mjs"] || []).slice().sort().join(","), "NJ,NM,RI,VA");
  EQ("S-8c: t10's two [BY DECISION v5.59] pins still execute it against WI and RI",
    (pinCalls["t10_taxcases.mjs"] || []).slice().sort().join(","), "RI,WI");
}

console.log(`\nstate_sets_check: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
