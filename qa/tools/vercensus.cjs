// qa/tools/vercensus.cjs — what does a version bump actually cost in this suite?
//
// WHY THIS EXISTS. A version bump is priced in this project as "four in-app sites" (footer, DATA
// LOAD header, Field Manual callsign, Field Manual footer). That is the SOURCE cost. The SUITE cost
// is an order of magnitude larger, and until 2026-09-01 no document recorded it — which is how two
// consecutive scopes under-priced the same release by the same factor:
//
//   • v5.54's scope. Halted mid-build on session budget; STOP-REPORT §3 measured 62 gated
//     expressions and 14 registries and called the scope "wrong by roughly a factor of sixty."
//   • SCOPE_VA_NOTE_CORRECTION.md, written 2026-09-01, priced §3C as "four in-app sites" —
//     the identical error, made while the stop-report naming it sat in the same repo.
//
// The stop-report's own closing finding was that NO DOCUMENT RECORDS THE COST. This tool is the
// answer to that: a number that is re-derived on demand cannot go stale, which a figure written
// into prose demonstrably does (OPERATIONS §A0).
//
// It ASSERTS NOTHING and is counted in NO check total (§B1).
//
// usage:  node qa/tools/vercensus.cjs <current-tag> [dir ...]     e.g. vercensus.cjs v557 qa qa/tools
const fs = require("fs"), path = require("path");
const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
const P = acorn.Parser.extend(jsx());
const B = Object.assign({}, walk.base, {
  JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s)); if(n.openingElement)c(n.openingElement,s);},
  JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},
  JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},
  JSXClosingElement(){}, JSXAttribute(n,s,c){if(n.value)c(n.value,s);},
  JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},
  JSXExpressionContainer(n,s,c){c(n.expression,s);},
  JSXEmptyExpression(){}, JSXText(){}, JSXIdentifier(){}, JSXMemberExpression(){}, JSXNamespacedName(){}
});

const CUR = process.argv[2];
if (!CUR || !/^v5\d+$/.test(CUR)) {
  console.error("usage: node vercensus.cjs <current-tag> [dir ...]   e.g. v557");
  process.exit(2);
}
const DIRS = process.argv.slice(3).length ? process.argv.slice(3) : ["."];

// A grep cannot tell a ladder entry from a gated expression, and cannot see a tag inside a
// template literal. Both distinctions are the whole point here, so this walks the AST (§B1a).
const files = {};
for (const d of DIRS) {
  let entries; try { entries = fs.readdirSync(d); } catch { continue; }
  for (const f of entries) {
    if (!/\.(mjs|cjs)$/.test(f)) continue;
    if (/^(app_|dom_|vercensus)/.test(f)) continue;          // build artifacts and this file
    const p = path.join(d, f);
    let src, ast;
    try { src = fs.readFileSync(p, "utf8"); ast = P.parse(src, {ecmaVersion:"latest", sourceType:"module", locations:true}); }
    catch { continue; }
    let ladder = 0, gated = 0;
    const lines = src.split("\n");
    walk.simple(ast, { Literal(n) {
      if (n.value !== CUR) return;
      // A gated expression compares the tag; a ladder entry merely lists it. The line is a safe
      // discriminator here because both forms are written on one line throughout this suite.
      const L = lines[n.loc.start.line - 1] || "";
      if (new RegExp('===\\s*"' + CUR + '"').test(L) || new RegExp('"' + CUR + '"\\s*===').test(L)) gated++;
      else ladder++;
    }}, B);
    if (ladder || gated) files[path.join(d, f)] = { ladder, gated };
  }
}

const names = Object.keys(files).sort();
let L = 0, G = 0;
console.log(`\nVERSION-BUMP COST from ${CUR} — every site a successor tag must be judged against\n`);
for (const n of names) {
  const { ladder, gated } = files[n];
  L += ladder; G += gated;
  console.log(`  ${path.basename(n).padEnd(28)} ladder:${String(ladder).padStart(3)}   gated:${String(gated).padStart(3)}`);
}
console.log(`\n  FILES to register the new tag in : ${names.length}`);
console.log(`  ladder entries (mechanical)      : ${L}`);
console.log(`  GATED expressions (a judgement)  : ${G}`);
console.log(`  total judgement points           : ${L + G}\n`);
console.log("  ⚠ The gated ones are NOT a script. Each asks whether the new build makes that");
console.log("    assertion false; extending them blindly is the v5.27 defect §B2 exists to prevent,");
console.log("    applied once per gate. The registries are fail-closed and print FATAL if missed.\n");
