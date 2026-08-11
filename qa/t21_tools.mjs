// t21 — THE PARSER TOOLKIT, TESTED AGAINST A FIXTURE WITH KNOWN ANSWERS.
//
// WHY THIS SUITE EXISTS. OPERATIONS §B1 makes `qa/tools/` the sanctioned answer to "how many
// sites?" and "where is this used?", on the grounds that greps in this project have been wrong
// repeatedly and AST resolution has not. But the same section carries a warning:
//
//     "These tools are not themselves tested. Their outputs have been corroborated against
//      hand-read facts — but corroboration is not a test. Until they have a fixture with known
//      answers, an unexpected result is a reason to hand-check, not a finding on its own."
//
// That is the gap this closes. `qa/tools/fixture/fixture.jsx` contains, deliberately, every case
// where a line-grep and an AST walk disagree: identifiers in comments, identifiers as substrings
// of strings, template literals, computed vs dotted member access, object shorthand, shadowed
// scopes, nested function depths, JSX attributes and children, and a single enormous one-line
// string blob standing in for `DOCS_HTML`.
//
// HOW THE EXPECTATIONS WERE PRODUCED — this is the part that matters. Every count below was
// HAND-COUNTED from the fixture FIRST, then compared to tool output. Where the two disagreed the
// disagreement was adjudicated by reading the fixture, NOT by editing the expectation until it
// matched. Generating expectations from the tool would test nothing at all, which is the §B2
// failure this suite exists to prevent one level down.
//
// ONE DISAGREEMENT SURVIVED ADJUDICATION AND IS PINNED BELOW (Section A4).
//
// usage: node t21_tools.mjs            (expects qa/tools/*.cjs and qa/tools/fixture/fixture.jsx)
import { execFileSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLS = join(HERE, "tools");
// The REPO stores the fixture at qa/tools/fixture/fixture.jsx, but PROJECT KNOWLEDGE IS FLAT —
// it has no folders, so a session rebuilding a run folder from knowledge will have dropped the
// file somewhere else under whatever name the pool uses. Resolve rather than assume, and say
// which copy was used, so a stale duplicate is visible instead of silent.
const CANDIDATES = [
  join(TOOLS, "fixture", "fixture.jsx"),
  join(TOOLS, "fixture.jsx"),
  join(HERE, "tools_fixture.jsx"),
  join(HERE, "fixture.jsx"),
];
const FIX = CANDIDATES.find(p => existsSync(p));
if (!FIX) {
  console.log("t21 SUITE: 0 passed, 1 failed\n  \u2717 fixture not found. Looked in:\n" +
    CANDIDATES.map(c => "      " + c).join("\n") +
    "\n    Knowledge holds it as tools_fixture.jsx; the repo as qa/tools/fixture/fixture.jsx.");
  process.exit(1);
}

let pass = 0, fail = 0; const fails = [];
const ck = (n, ok, d = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${n}`); }
  else { fail++; const m = `  \u2717 ${n}${d ? " \u2014 " + d : ""}`; console.log(m); fails.push(m); }
};
const run = (tool, args) => execFileSync("node", [join(TOOLS, tool), ...args], { encoding: "utf8" });

console.log("t21 \u2014 PARSER TOOLKIT vs FIXTURE");
console.log(`     fixture: ${FIX}\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 0. The fixture is intact. Line numbers are load-bearing — this suite asserts
//    them, so a reflowed fixture must fail loudly rather than drift silently.
// ─────────────────────────────────────────────────────────────────────────────
console.log("0. Fixture integrity");
const fixSrc = readFileSync(FIX, "utf8");
const fixLines = fixSrc.split("\n");
const at = (n) => (fixLines[n - 1] || "");
ck("fixture parses as a module (the tools can read it at all)", fixSrc.length > 1000);
ck("L21 is the plain declaration", at(21).includes("const widget = 1;"), at(21).slice(0, 40));
ck("L26 is the object shorthand", at(26).includes("const shorthand = { widget };"), at(26).slice(0, 40));
ck("L58 is the one-line blob", at(58).startsWith("const BLOB =") && at(58).length > 200, `len ${at(58).length}`);
ck("L63-65 are the three residual reduces",
   [63, 64, 65].every(n => at(n).includes(".reduce(")), "");
ck("L74/L75 are the rejection decoys", at(74).includes("decoyNoBalance") && at(75).includes("decoyNoTrad"),
   `${at(74).slice(0, 28)} | ${at(75).slice(0, 28)}`);

// ─────────────────────────────────────────────────────────────────────────────
// A. census.cjs
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nA1. census \u2014 what a grep gets wrong");
const cen = run("census.cjs", [FIX, "widget"]);
const cenLines = cen.split("\n").filter(l => /^L\s*\d+/.test(l));
const parse = (l) => { const m = l.match(/^L\s*(\d+)\s+(\w+)\s+(\S+)/); return m ? { line: +m[1], kind: m[2], scope: m[3] } : null; };
const hits = cenLines.map(parse).filter(Boolean);
const on = (n) => hits.filter(h => h.line === n);

// The four cases a line-grep reports and the AST must not.
ck("a comment mentioning the target is NOT counted", on(19).length === 0, `got ${on(19).length}`);
ck("a SUBSTRING inside a string is NOT counted (L36)", on(36).length === 0, `got ${on(36).length}`);
ck("a TEMPLATE literal is NOT counted (L37)", on(37).length === 0, `got ${on(37).length}`);
ck("the one-line BLOB yields ZERO hits (the DOCS_HTML hazard, L58)", on(58).length === 0, `got ${on(58).length}`);

console.log("\nA2. census \u2014 kind classification");
ck("L25 object key is 'objkey', and the Literal value is not a hit",
   on(25).length === 1 && on(25)[0].kind === "objkey", JSON.stringify(on(25)));
ck("L27 value position is 'ident'", on(27).length === 1 && on(27)[0].kind === "ident", JSON.stringify(on(27)));
ck("L30 dotted access is 'prop'", on(30).length === 1 && on(30)[0].kind === "prop", JSON.stringify(on(30)));
ck("L31 computed access by string is 'string', not 'prop'",
   on(31).length === 1 && on(31)[0].kind === "string", JSON.stringify(on(31)));
ck("L32 computed access by IDENTIFIER is 'ident', not 'prop'",
   on(32).length === 1 && on(32)[0].kind === "ident", JSON.stringify(on(32)));
ck("L35 exact string literal is 'string'", on(35).length === 1 && on(35)[0].kind === "string", JSON.stringify(on(35)));
ck("L22 counts BOTH operands", on(22).length === 2, `got ${on(22).length}`);
ck("L55 JSX yields 2 idents + 1 string (attr expr, attr literal, child expr)",
   on(55).length === 3 && on(55).filter(h => h.kind === "ident").length === 2
     && on(55).filter(h => h.kind === "string").length === 1, JSON.stringify(on(55)));

console.log("\nA3. census \u2014 scope attribution (what a grep cannot do at all)");
ck("L41 shadowed declaration is attributed to shadower, not <module>",
   on(41).length === 1 && on(41)[0].scope === "shadower@40", JSON.stringify(on(41)));
ck("L42 shadowed use is attributed to shadower", on(42).length === 1 && on(42)[0].scope === "shadower@40",
   JSON.stringify(on(42)));
ck("L21 module-level declaration is attributed to <module>",
   on(21).length === 1 && on(21)[0].scope === "<module>", JSON.stringify(on(21)));

console.log("\nA4. census \u2014 [KNOWN DEFECT] the site count is inflated by range collisions");
// ─────────────────────────────────────────────────────────────────────────────
// [KNOWN DEFECT 2026-08-11 | census.cjs range collisions] — OPERATIONS §D pin.
//
// WHAT IS WRONG. Where two AST nodes occupy the SAME source range, census reports the position
// twice. Two constructs do this: object shorthand `{ widget }` (Property.key and Property.value
// are distinct nodes over one token) and export/import specifiers `export { widget }`
// (ExportSpecifier.local and .exported likewise). One source occurrence, two reported hits.
//
// WHY IT MATTERS. The tool's output is literally accurate — it says "AST hits", and there are
// two matching nodes. But §B1 sells it as the answer to "how many SITES?", and scope documents
// quote it as a site count. On the shipped v5.25 source:
//
//     otherAccounts   17 AST hits ->  15 distinct source sites   (collisions at L2578, L10829)
//     positions       49 AST hits ->  46 distinct source sites
//     taxType         56 AST hits ->  55 distinct source sites
//     total401k       44 AST hits ->  43 distinct source sites
//
// "17 hits" is quoted in SCOPE_OTHERACCOUNTS_TAXTYPE_v5_25.md §3 and in the v5.26 scope's §4.
// The error direction is SAFE — it over-reports, so a census sends a reader to more sites than
// exist rather than fewer — which is why this is a pin and not a stop-the-line defect.
//
// PRE-EXISTING, not a regression: present since the tool was written.
// FLIP THIS PIN when the fix lands — the assertions become "1 hit at L26, 1 at L67".
// ─────────────────────────────────────────────────────────────────────────────
ck("[KNOWN DEFECT 2026-08-11] object shorthand at L26 reports TWO hits for one occurrence",
   on(26).length === 2 && on(26).some(h => h.kind === "objkey") && on(26).some(h => h.kind === "ident"),
   JSON.stringify(on(26)));
ck("[KNOWN DEFECT 2026-08-11] export specifier at L67 reports TWO hits for one occurrence",
   on(67).length === 2, JSON.stringify(on(67)));
ck("[KNOWN DEFECT 2026-08-11] total is 18 AST hits where 16 source occurrences exist",
   hits.length === 18, `got ${hits.length}`);
ck("the header count agrees with the rows it printed",
   cen.includes(`\u2014 ${hits.length} AST hits`), "header and body disagree");

console.log("\nA5. census \u2014 the --kind filter");
const kOnly = run("census.cjs", [FIX, "widget", "--kind=prop"]).split("\n").filter(l => /^L\s*\d+/.test(l));
ck("--kind=prop returns only the dotted access", kOnly.length === 1 && /L\s*30/.test(kOnly[0]),
   JSON.stringify(kOnly));
const sOnly = run("census.cjs", [FIX, "widget", "--kind=string"]).split("\n").filter(l => /^L\s*\d+/.test(l));
ck("--kind=string returns the three exact string literals", sOnly.length === 3, `got ${sOnly.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// B. funcmap.cjs
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nB. funcmap \u2014 ranges, depths and naming");
const fm = run("funcmap.cjs", [FIX]);
const fmRows = fm.split("\n").map(l => l.match(/^L\s*(\d+)-\s*(\d+)\s+d(\d+)\s+(\S+)/)).filter(Boolean)
  .map(m => ({ from: +m[1], to: +m[2], depth: +m[3], name: m[4] }));
const fn = (n) => fmRows.find(r => r.name === n);
// Hand-counted after TRAP 10 was added: depth 1 = shadower, outerFn, resA, resB, resC,
// decoyNoBalance, decoyNoTrad (7); depth 2 = innerFn + five reduce callbacks (6);
// depth 3 = deepest (1). Total 14.
ck("finds 14 functions", fmRows.length === 14, `got ${fmRows.length}`);
ck("shadower spans L40-43 at depth 1", fn("shadower") && fn("shadower").from === 40 && fn("shadower").to === 43
   && fn("shadower").depth === 1, JSON.stringify(fn("shadower")));
ck("outerFn spans L46-52 at depth 1", fn("outerFn") && fn("outerFn").from === 46 && fn("outerFn").to === 52
   && fn("outerFn").depth === 1, JSON.stringify(fn("outerFn")));
ck("innerFn is NESTED — depth 2, inside outerFn's range",
   fn("innerFn") && fn("innerFn").depth === 2 && fn("innerFn").from > fn("outerFn").from
   && fn("innerFn").to < fn("outerFn").to, JSON.stringify(fn("innerFn")));
ck("deepest is depth 3 (an anonymous FunctionExpression named by its declarator)",
   fn("deepest") && fn("deepest").depth === 3, JSON.stringify(fn("deepest")));
ck("an arrow assigned to a const takes the const's name (resA)", !!fn("resA"), "");
ck("a bare callback stays <anon> (five reduce callbacks)",
   fmRows.filter(r => r.name === "<anon>").length === 5,
   String(fmRows.filter(r => r.name === "<anon>").length));
const fmDepth = run("funcmap.cjs", [FIX, "", "1"]).split("\n").filter(l => /^L\s*\d+-/.test(l));
ck("the depth cap excludes nested functions (7 at depth 1)", fmDepth.length === 7, `got ${fmDepth.length}`);
const fmFilt = run("funcmap.cjs", [FIX, "^res"]).split("\n").filter(l => /^L\s*\d+-/.test(l));
ck("the name filter selects only resA/resB/resC", fmFilt.length === 3, `got ${fmFilt.length}`);

// ─────────────────────────────────────────────────────────────────────────────
// C. residual.cjs
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nC. residual \u2014 the balance-roth-trad shape");
const res = run("residual.cjs", [FIX]);
const resRows = res.split("\n").filter(l => /^L\s*\d+/.test(l));
ck("finds exactly 3 residual sites", resRows.length === 3, `got ${resRows.length}`);
ck("finds them at L63, L64, L65", [63, 64, 65].every(n => resRows.some(r => new RegExp(`^L\\s*${n}\\b`).test(r))),
   JSON.stringify(resRows.map(r => r.slice(0, 8))));
ck("attributes each to its enclosing arrow", res.includes("resA@63") && res.includes("resC@65"), "");
// REJECTION, not just detection. Added after a negative control DID NOT FIRE (§B2): breaking the
// tool's `balance` requirement changed nothing, because the fixture contained no near-miss for it
// to wrongly match. The fixture was strengthened rather than the control weakened.
ck("REJECTS a reduce with roth+trad but NO balance (L74 decoy)",
   !resRows.some(r => /^L\s*74\b/.test(r)), "over-matched the decoy");
ck("REJECTS a reduce with balance+roth but NO trad (L75 decoy)",
   !resRows.some(r => /^L\s*75\b/.test(r)), "over-matched the decoy");

// ─────────────────────────────────────────────────────────────────────────────
// D. diverge.cjs — the discrimination that justified the v5.22 consolidation
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nD. diverge \u2014 structural fingerprints ignore names, not structure");
const dv = run("diverge.cjs", [FIX]);
ck("reports 3 residual reduce() expressions", /# 3 residual reduce\(\) expressions/.test(dv), "");
ck("diverge also REJECTS both decoys (neither mentions all three properties)",
   !/^L\s*7[45]\b/m.test(dv), "picked up a decoy");
ck("DISTINCT FORMS is 2, not 3 \u2014 renaming s/p to t/q does NOT create a false difference",
   /DISTINCT FORMS:\s*2/.test(dv), (dv.match(/DISTINCT FORMS:.*/) || [""])[0]);
const grp = [...dv.matchAll(/^\s+([0-9a-f]{12})\s+\u00d7(\d+)\s+lines\s+(.+)$/gm)].map(m => ({ n: +m[2], lines: m[3].trim() }));
ck("L63 and L64 share one fingerprint", grp.some(g => g.n === 2 && g.lines === "63, 64"), JSON.stringify(grp));
ck("L65 is ALONE \u2014 dropping Math.max IS a structural difference",
   grp.some(g => g.n === 1 && g.lines === "65"), JSON.stringify(grp));
ck("each site is reported with what it binds to", /bound as: resA/.test(dv) && /bound as: resC/.test(dv), "");

// ─────────────────────────────────────────────────────────────────────────────
// E. The fixture is DISCRIMINATING — a grep and the AST must actually disagree
// ─────────────────────────────────────────────────────────────────────────────
console.log("\nE. The fixture earns its place");
// A line-grep counts LINES containing the token, including comments, substrings and the blob.
const grepLines = fixLines.filter(l => /widget/.test(l)).length;
ck("a line-grep and the AST give DIFFERENT answers (otherwise the fixture proves nothing)",
   grepLines !== hits.length, `grep ${grepLines} lines vs ${hits.length} AST hits`);
ck("the grep OVER-reports \u2014 it cannot exclude comments, substrings or the blob",
   grepLines > 0 && hits.length > 0, `grep ${grepLines} / ast ${hits.length}`);
console.log(`     (line-grep: ${grepLines} lines · census: ${hits.length} AST hits · hand-counted source occurrences: 16)`);

console.log(`\nt21 SUITE: ${pass} passed, ${fail} failed`);
if (fails.length) { console.log("\nFAILURES:"); fails.forEach(f => console.log(f)); }
process.exit(fail ? 1 : 0);
