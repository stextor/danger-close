// t62 — THREE DESKTOP-PAGE BEHAVIOURS DISCLOSED; THE GLOSSARY IN ORDER (F-5, F-7, F-9, F-16) · docs/SCOPE_F_DISCLOSURES_V598.md · v5.98
//
// The census of 2026-10-08 found four simplifications the app did not disclose, though UsabilityFlaws.md's v5.40 block said v5.39 had:
// hover-only tooltips (F-5), a Trajectory chart that does not redraw on resize (F-7), the Docs tab's nested scroll (F-9) and one glossary pair out
// of order (F-16). v5.98 discloses the first three in Field Manual §13 and fixes the fourth.
//
// Groups:  A the §13 sentence (v5.98; absent on v5.97), and each clause held to the code fact that makes it true — OPERATIONS §B2: a disclosure
//            assertion becomes a LOCK the moment its disclosure becomes false, so when any of these is fixed this suite goes red and the clause
//            must leave the Field Manual in the same release
//          B EXTINCTION: the glossary's terms in case-insensitive order, the "Authoritative sources" footer last (v5.97 pins the one pair)
// BOTH LEGS. Reads the source by parser (DOCS_HTML is one string literal). Run: node t62_desktop_disclosures.mjs <tag>
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v597", "v598", "v599", "v600"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n}${d !== "" ? " — " + String(d).slice(0, 260) : ""}`); } };
const done = () => { console.log(`\nt62 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t62 — F-5/F-7/F-9 DISCLOSED, F-16 FIXED (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, KNOWN_VERSIONS.join(",")); done(); }
const FIXED = VER !== "v597";
const { readFileSync } = await import("fs");
const { createRequire } = await import("module"), require = createRequire(import.meta.url);
const acorn = require("acorn"), jsx = require("acorn-jsx"), walk = require("acorn-walk");
const src = readFileSync(new URL(`../${VER}.jsx`, import.meta.url), "utf8");
const ast = acorn.Parser.extend(jsx()).parse(src, { ecmaVersion: "latest", sourceType: "module" });
const B = { ...walk.base, JSXElement(n, s, c) { c(n.openingElement, s); n.children.forEach(x => c(x, s)); }, JSXFragment(n, s, c) { n.children.forEach(x => c(x, s)); },
  JSXOpeningElement(n, s, c) { n.attributes.forEach(a => c(a, s)); }, JSXAttribute(n, s, c) { if (n.value) c(n.value, s); }, JSXSpreadAttribute(n, s, c) { c(n.argument, s); },
  JSXExpressionContainer(n, s, c) { if (n.expression.type !== "JSXEmptyExpression") c(n.expression, s); }, JSXText() {}, JSXEmptyExpression() {} };
let DOCS = null; walk.full(ast, n => { if (n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML") DOCS = n.init.value; }, B);
CK("0-1 the Field Manual (DOCS_HTML) was found as one string literal", typeof DOCS === "string" && DOCS.length > 100000, typeof DOCS);
const text = DOCS.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

// ── A · the §13 sentence, each clause with the code fact that keeps it true ──
const SENT = "Three things still behave like a desktop page (v5.98)";
const item = (() => { const i = text.indexOf("Designed for a desktop browser."); return i < 0 ? "" : text.slice(i, text.indexOf("The temporary OBBBA", i)); })();
CK("A-0 §13's \"Designed for a desktop browser\" item was found", item.length > 200, item.length);
if (FIXED) {
  CK("A-1 the item carries the v5.98 sentence", item.includes(SENT), item.slice(-400));
  CK("A-1a …naming tooltips a touch screen never shows", /explain themselves only in a tooltip that appears when the mouse rests on them, which a touch screen never shows/.test(item));
  CK("A-1b …naming the Trajectory chart, resize and rotation, and the way to redraw it", /Trajectory chart measures its width when it draws and does not redraw when the window is resized or a phone is rotated - leave the tab and come back to redraw it/.test(item));
  CK("A-1c …naming the Docs tab's nested scroll", /on the Docs tab this Field Manual scrolls inside its own box, within the page's own scroll/.test(item));
} else CK("A-1 PIN v5.97: the item says nothing of tooltips, resizing or nested scrolling", !item.includes(SENT) && !/tooltip|resiz|rotat|scrolls inside/i.test(item));
// The facts. Each is true on both legs; on v5.98 each is what keeps its clause true.
let titles = 0, iframeH = null, resizeObs = 0, resizeLit = 0;
walk.full(ast, n => {
  if (n.type === "JSXOpeningElement" && n.name.name !== "iframe" && n.attributes.some(a => a.type === "JSXAttribute" && a.name.name === "title")) titles++;
  if (n.type === "JSXOpeningElement" && n.name.name === "iframe") { const st = n.attributes.find(a => a.name && a.name.name === "style");
    const h = st && st.value.expression.properties.find(p => p.key.name === "height"); iframeH = h ? h.value.value : null; }
  if (n.type === "Identifier" && n.name === "ResizeObserver") resizeObs++;
  if (n.type === "Literal" && n.value === "resize") resizeLit++;
}, B);
CK(`A-2 FACT for clause a: ${titles} non-iframe elements still carry a hover-only title (when this reaches 0, drop the clause)`, titles > 0, titles);
let deps = null; const cw = src.indexOf("chartRef.current.clientWidth");
walk.full(ast, n => { if (n.type === "CallExpression" && n.callee.name === "useEffect" && n.arguments[0].start < cw && n.arguments[0].end > cw && n.arguments[1])
  deps = n.arguments[1].elements.map(e => e.name); }, B);
CK(`A-3 FACT for clause b: the chart's draw effect reads clientWidth, re-runs on activeTab (${deps && deps.join(", ")}), and nothing listens for a resize (ResizeObserver ${resizeObs}, "resize" ${resizeLit})`,
   cw > 0 && !!deps && deps.includes("activeTab") && resizeObs === 0 && resizeLit === 0, JSON.stringify({ cw, deps, resizeObs, resizeLit }));
CK(`A-4 FACT for clause c: the Docs tab's iframe is still a ${iframeH} box inside the page`, iframeH === "74vh", iframeH);

// ── B · the glossary in order ──
const terms = [...DOCS.matchAll(/<p class=["']term["']><b>([\s\S]*?)<\/b>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
CK(`B-0 the glossary parsed (${terms.length} entries; a broken parser cannot pass B-2 vacuously)`, terms.length >= 70, terms.length);
CK("B-1 the \"Authoritative sources\" footer is the last entry", terms[terms.length - 1] === "Authoritative sources", terms[terms.length - 1]);
const body = terms.slice(0, -1), out = [];
for (let i = 1; i < body.length; i++) if (body[i - 1].localeCompare(body[i], "en", { sensitivity: "base" }) > 0) out.push(`${body[i - 1]} > ${body[i]}`);
if (FIXED) CK("B-2 EXTINCTION: every glossary term is in case-insensitive alphabetical order", out.length === 0, out.join(" · "));
else CK("B-2 PIN v5.97: exactly one pair out of order — API Key before Agency MBS", out.length === 1 && out[0] === "API Key > Agency MBS", out.join(" · "));
done();
