// census_p1.cjs — Phase 1 (v5.69) widened surface census. A PARSER, not a grep (OPERATIONS §B1).
// usage: node census_p1.cjs <file.jsx> [--docs]
//
// It walks EVERY key of EVERY node recursively (the census.cjs `collect` pattern), so it cannot
// inherit acorn-walk's blind spot: `walk.full` does NOT visit non-computed object keys or member
// properties, which is how `window.storage.setItem` was missed by the census that preceded this one.
// It self-checks against sites known to exist before it prints anything, and exits 1 if they are absent.
// ⚠ CORRECTED 2026-09-11 before shipping: the first version listed `key` among the Web Storage method names and
//   so counted 16 React `.key` reads as storage calls (24 hits, 8 real); and it reported split("\n").length
//   (13,165) where `wc -l` reports 13,164. Both fixed; every count quoted in FlawsToFix-v5_69-Phase1.md is from this version.
const { Parser } = require("acorn");
const jsx = require("acorn-jsx");
const fs = require("fs");

const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");
const lines = src.split("\n");
const ast = Parser.extend(jsx()).parse(src, { ecmaVersion: 2022, sourceType: "module", locations: true });

// ── function ranges, for attribution ──
const funcs = [];
const nameOf = (n, p) => (n.id && n.id.name) || (p && p.type === "VariableDeclarator" && p.id && p.id.name) ||
  (p && p.type === "Property" && p.key && (p.key.name || p.key.value)) ||
  (p && p.type === "AssignmentExpression" && p.left && p.left.type === "Identifier" && p.left.name) || "<anon>";
const nodes = []; // [node, parent]
(function collect(node, parent) {
  if (!node || typeof node.type !== "string") return;
  nodes.push([node, parent]);
  if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type))
    funcs.push({ name: nameOf(node, parent), start: node.start, end: node.end, line: node.loc.start.line });
  for (const k of Object.keys(node)) {
    if (k === "loc" || k === "start" || k === "end" || k === "range") continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === "string" && collect(c, node));
    else if (v && typeof v.type === "string") collect(v, node);
  }
})(ast, null);
funcs.sort((a, b) => (a.end - a.start) - (b.end - b.start));
const scope = (pos) => { const ch = funcs.filter(f => f.start <= pos && pos < f.end).slice(0, 2); return ch.length ? ch.map(f => `${f.name}@${f.line}`).join(" < ") : "<module>"; };
const snip = (n) => { const l = lines[n.loc.start.line - 1] || ""; return l.length > 3000 ? `[${l.length}-char line — DOCS_HTML blob, not shown]` : l.trim().slice(0, 150); };

const propName = (m) => !m.computed ? (m.property.name || null) : (m.property.type === "Literal" ? String(m.property.value) : null);
const exprText = (n) => src.slice(n.start, Math.min(n.end, n.start + 90)).replace(/\s+/g, " ");

// ── the questions ──
const Q = {
  "storage: sync Web Storage method names (property)": { prop: ["getItem", "setItem", "removeItem", "clear"] },
  "storage: window.storage async contract (property on .storage)": { storageProp: ["get", "set", "delete", "list"] },
  "storage: direct browser stores (identifier or property)": { any: ["localStorage", "sessionStorage", "indexedDB", "caches", "cookie"] },
  "network: request primitives": { any: ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "sendBeacon", "importScripts", "Worker", "SharedWorker"] },
  "network: dynamic import() / script or link creation": { importExpr: true, createEl: ["script", "link", "img", "iframe", "a", "form"] },
  "sinks: HTML / code execution": { any: ["innerHTML", "outerHTML", "insertAdjacentHTML", "write", "writeln", "dangerouslySetInnerHTML", "eval", "Function", "execScript"] },
  "sinks: string-argument timers": { strTimer: true },
  "iframe / srcDoc (JSX)": { jsxName: ["iframe", "object", "embed"], jsxAttr: ["srcDoc", "srcdoc", "sandbox"] },
  "download / blob path": { any: ["Blob", "createObjectURL", "revokeObjectURL", "FileReader", "readAsText", "readAsDataURL", "readAsArrayBuffer", "showSaveFilePicker"], jsxAttr: ["download"] },
  "clipboard": { any: ["clipboard", "writeText", "readText", "execCommand"] },
  "URL / navigation surface": { any: ["location", "URLSearchParams", "pushState", "replaceState", "hash", "search", "open", "assign", "postMessage", "opener", "referrer"] },
  "JSX href / target / src attributes": { jsxAttr: ["href", "target", "rel", "src", "action", "formAction"] },
  "JSON.parse": { call: ["JSON.parse"] },
  "console.*": { memberObj: ["console"] },
  "object merge primitives (prototype-pollution lens)": { call: ["Object.assign", "Object.fromEntries", "structuredClone"], spread: true },
};

const hits = {};
const add = (q, n, what) => { (hits[q] = hits[q] || []).push({ line: n.loc.start.line, scope: scope(n.start), what, snip: snip(n) }); };

for (const [n, p] of nodes) {
  for (const [q, spec] of Object.entries(Q)) {
    if (n.type === "MemberExpression") {
      const nm = propName(n);
      if (nm && spec.prop && spec.prop.includes(nm)) add(q, n, `.${nm} on ${exprText(n.object)}`);
      if (nm && spec.storageProp && spec.storageProp.includes(nm) && n.object.type === "MemberExpression" && propName(n.object) === "storage") add(q, n, `.storage.${nm}`);
      if (nm && spec.any && spec.any.includes(nm)) add(q, n, `.${nm} on ${exprText(n.object)}`);
      if (spec.memberObj && n.object.type === "Identifier" && spec.memberObj.includes(n.object.name)) add(q, n, `${n.object.name}.${nm}`);
    }
    if (n.type === "Identifier" && spec.any && spec.any.includes(n.name)) {
      // an identifier that is the non-computed property of a member was already counted above; skip it here
      const isMemberProp = p && p.type === "MemberExpression" && p.property === n && !p.computed;
      const isKey = p && p.type === "Property" && p.key === n && !p.computed && !p.shorthand;
      if (!isMemberProp && !isKey) add(q, n, `identifier ${n.name}`);
      if (isKey) add(q, n, `object key ${n.name}`);
    }
    if (n.type === "Literal" && typeof n.value === "string" && p && p.type === "Property" && p.key === n && spec.any && spec.any.includes(n.value)) add(q, n, `object key "${n.value}"`);
    if (spec.importExpr && n.type === "ImportExpression") add(q, n, "import()");
    if (spec.createEl && n.type === "CallExpression" && n.callee.type === "MemberExpression" && propName(n.callee) === "createElement" && n.arguments[0] && n.arguments[0].type === "Literal" && spec.createEl.includes(String(n.arguments[0].value).toLowerCase())) add(q, n, `createElement("${n.arguments[0].value}")`);
    if (spec.strTimer && n.type === "CallExpression" && ((n.callee.type === "Identifier" && /^set(Timeout|Interval)$/.test(n.callee.name)) || (n.callee.type === "MemberExpression" && /^set(Timeout|Interval)$/.test(propName(n.callee) || ""))) && n.arguments[0] && (n.arguments[0].type === "Literal" || n.arguments[0].type === "TemplateLiteral")) add(q, n, "timer with string body");
    if (spec.jsxName && n.type === "JSXOpeningElement" && n.name.type === "JSXIdentifier" && spec.jsxName.includes(n.name.name)) add(q, n, `<${n.name.name}>`);
    if (spec.jsxAttr && n.type === "JSXAttribute" && n.name && spec.jsxAttr.includes(n.name.name)) {
      const v = n.value; const kind = !v ? "boolean" : v.type === "Literal" ? `literal ${JSON.stringify(v.value).slice(0, 60)}` : `EXPRESSION ${exprText(v.expression || v)}`;
      add(q, n, `${n.name.name}= ${kind}`);
    }
    if (spec.call && n.type === "CallExpression" && n.callee.type === "MemberExpression" && n.callee.object.type === "Identifier") {
      const full = `${n.callee.object.name}.${propName(n.callee)}`;
      if (spec.call.includes(full)) add(q, n, `${full}(${exprText(n.arguments[0] || { start: 0, end: 0 })})`);
    }
    if (spec.spread && (n.type === "SpreadElement") && p && p.type === "ObjectExpression") add(q, n, `{...${exprText(n.argument)}}`);
  }
}

// ── self-check: sites known to exist must be found, or this census is blind and says so ──
const must = file.endsWith("DangerClose.jsx") ? [
  ["storage: sync Web Storage method names (property)", /\.setItem on window\.storage/],
  ["storage: sync Web Storage method names (property)", /\.getItem on window\.storage/],
  ["network: request primitives", /identifier fetch/],
  ["JSON.parse", /JSON\.parse/],
] : [];
let blind = 0;
for (const [q, re] of must) if (!(hits[q] || []).some(h => re.test(h.what))) { console.log(`SELF-CHECK FAILED: ${q} did not find ${re}`); blind++; }
if (blind) process.exit(1);

const lineCount = src.endsWith("\n") ? lines.length - 1 : lines.length; // == `wc -l`
console.log(`# census_p1 — ${file} — ${lineCount} lines, ${nodes.length} AST nodes, self-check ${must.length}/${must.length}`);
const only = process.argv.find(a => a.startsWith("--q="));
for (const q of Object.keys(Q)) {
  if (only && !q.includes(only.slice(4))) continue;
  const hs = hits[q] || [];
  console.log(`\n## ${q} — ${hs.length}`);
  for (const h of hs) console.log(`  L${h.line}  ${h.what.padEnd(46).slice(0, 60)}  ${h.scope.slice(0, 60)}`);
}
