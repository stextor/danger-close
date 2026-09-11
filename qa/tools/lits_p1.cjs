// lits_p1.cjs — Phase 1 (v5.69) literal walk. A PARSER, not a grep (OPERATIONS §B1, §B1a).
// usage: node lits_p1.cjs <DangerClose.jsx> <dir> [<dir> ...]
//
// Answers four questions a grep cannot:
//   1. Does the Field Manual (the one-line DOCS_HTML blob) promise draft recovery? (reads the string VALUE)
//   2. Where does the app's user-facing copy mention the draft?
//   3. Which suite literals / regexes name the draft, and which suite REGEXES MATCH the draft copy when
//      executed (a lock on copy a fix would change — §B2 "a disclosure assertion becomes a LOCK")?
//   4. Does any suite or tool read CHANGELOG.md, PROJECT_KNOWLEDGE_INDEX.md or the Phase 1 files?
// Every file that fails to parse is listed, so a zero is never vacuous. Self-checks against a literal
// known to exist in t4 ("Unsaved changes") and exits 1 if it is not found.
const { Parser } = require("acorn");
const jsx = require("acorn-jsx");
const fs = require("fs");
const path = require("path");
const P = Parser.extend(jsx());

const [appFile, ...dirs] = process.argv.slice(2);
const parse = (src) => {
  for (const sourceType of ["module", "script"]) {
    try { return P.parse(src, { ecmaVersion: "latest", sourceType, locations: true, allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true }); } catch (e) { var err = e; }
  }
  throw err;
};
const walkAll = (node, fn, parent = null) => {
  if (!node || typeof node.type !== "string") return;
  fn(node, parent);
  for (const k of Object.keys(node)) {
    if (k === "loc" || k === "start" || k === "end") continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === "string" && walkAll(c, fn, node));
    else if (v && typeof v.type === "string") walkAll(v, fn, node);
  }
};
const clip = (s, n = 130) => (s.length > n ? s.slice(0, n) + "…" : s).replace(/\s+/g, " ");
const DRAFT = /draft|auto-?sav/i;

// ── 1 + 2 · the app ──
const appSrc = fs.readFileSync(appFile, "utf8");
const app = parse(appSrc);
let docs = null;
const appCopy = [];
walkAll(app, (n, p) => {
  if (n.type === "VariableDeclarator" && n.id.name === "DOCS_HTML" && n.init) {
    docs = n.init.type === "Literal" ? String(n.init.value)
      : n.init.type === "TemplateLiteral" ? n.init.quasis.map(q => q.value.cooked).join("${…}") : null;
    return;
  }
  const text = n.type === "Literal" && typeof n.value === "string" ? n.value
    : n.type === "TemplateElement" ? n.value.cooked : n.type === "JSXText" ? n.value : null;
  if (text && DRAFT.test(text) && text.length < 5000) appCopy.push({ line: n.loc.start.line, kind: n.type, text: clip(text.trim()) });
});
console.log(`# lits_p1 — app ${appFile}`);
console.log(`\n## 1 · DOCS_HTML value: ${docs === null ? "NOT FOUND" : docs.length + " UTF-16 units"}; matches of ${DRAFT}:`);
if (docs) { let m, re = new RegExp(DRAFT.source, "gi"), c = 0; while ((m = re.exec(docs))) { c++; console.log(`  @${m.index}: …${clip(docs.slice(Math.max(0, m.index - 70), m.index + 70), 150)}…`); } if (!c) console.log("  none"); }
console.log(`\n## 2 · app literals / JSX text matching ${DRAFT} (DOCS_HTML excluded): ${appCopy.length}`);
appCopy.forEach(h => console.log(`  L${h.line} ${h.kind.padEnd(15)} ${h.text}`));

// ── 3 + 4 · the suite and tooling ──
const COPY = {
  chip: "● Unsaved changes (a draft auto-saves every few seconds)",
  dialog: "Save them before leaving? (Saving here is identical to the Save & Apply button on the tab. Discarding keeps the auto-saved draft, so you can still restore this work on your next visit.)",
  banner: "💾 Unsaved work from a previous session was recovered — restore it, or discard to keep what's shown now. RESTORE & APPLY DRAFT DISCARD DRAFT",
};
const files = [];
const walkDir = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".git") walkDir(f); } else if (/\.(mjs|cjs|js|jsx)$/.test(e.name)) files.push(f); } };
dirs.forEach(walkDir);
const named = [], draftLits = [], regexHits = [], docRefs = [], failed = [];
let nLits = 0, nRegex = 0, selfCheck = false;
for (const f of files) {
  let ast; try { ast = parse(fs.readFileSync(f, "utf8")); } catch (e) { failed.push(`${f}: ${e.message}`); continue; }
  walkAll(ast, (n) => {
    const rel = path.relative(process.cwd(), f);
    if (n.type === "Literal" && n.regex) {
      nRegex++;
      const { pattern, flags } = n.regex;
      if (DRAFT.test(pattern) || /Unsaved|removeItem|getItem|setItem|MYDATA/i.test(pattern)) named.push(`${rel}:${n.loc.start.line} /${clip(pattern, 90)}/${flags}`);
      if (/[A-Za-z]{4,}/.test(pattern)) {
        let re; try { re = new RegExp(pattern, flags.replace(/[gy]/g, "")); } catch { return; }
        const which = Object.entries(COPY).filter(([, t]) => re.test(t)).map(([k]) => k);
        if (which.length) regexHits.push(`${rel}:${n.loc.start.line} /${clip(pattern, 80)}/${flags} → ${which.join(",")}`);
      }
      return;
    }
    const text = n.type === "Literal" && typeof n.value === "string" ? n.value : n.type === "TemplateElement" ? n.value.cooked : null;
    if (text == null) return;
    nLits++;
    if (text.includes("Unsaved changes") && /t4_dom\.mjs$/.test(f)) selfCheck = true;
    if (DRAFT.test(text) || /MYDATA_DRAFT|removeItem|getItem\(|setItem\(/.test(text)) draftLits.push(`${rel}:${n.loc.start.line} ${JSON.stringify(clip(text, 110))}`);
    if (/CHANGELOG|PROJECT_KNOWLEDGE_INDEX|FlawsToFix|probe_mydata_draft|probe_import_hostile|probe_ai_route|census_p1|lits_p1/.test(text)) docRefs.push(`${rel}:${n.loc.start.line} ${JSON.stringify(clip(text, 110))}`);
  });
}
if (!selfCheck) { console.log("\nSELF-CHECK FAILED: the t4 literal \"Unsaved changes\" was not found — this walk is blind."); process.exit(1); }
console.log(`\n## 3 · suite/tooling: ${files.length} files, ${files.length - failed.length} parsed, ${nLits} string literals, ${nRegex} regex literals; self-check 1/1`);
console.log(`  parse failures: ${failed.length}`); failed.forEach(x => console.log("   ", clip(x, 160)));
console.log(`\n### 3a · string literals naming the draft or the sync storage methods: ${draftLits.length}`); draftLits.forEach(x => console.log("  " + x));
console.log(`\n### 3b · regex literals whose SOURCE names the draft / Unsaved / sync methods: ${named.length}`); named.forEach(x => console.log("  " + x));
console.log(`\n### 3c · regex literals (with a 4+-letter word) that MATCH the draft copy when executed: ${regexHits.length}`); regexHits.forEach(x => console.log("  " + x));
console.log(`\n## 4 · literals naming CHANGELOG / the manifest / Phase 1 files: ${docRefs.length}`); docRefs.forEach(x => console.log("  " + x));
