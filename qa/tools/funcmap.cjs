// funcmap.cjs — list functions with line ranges, optionally filtered by name regex or depth
const { Parser } = require('acorn');
const jsx = require('acorn-jsx');
const fs = require('fs');
const file = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
const maxDepth = process.argv[4] ? parseInt(process.argv[4], 10) : 99;

const src = fs.readFileSync(file, 'utf8');
const P = Parser.extend(jsx());
const ast = P.parse(src, { ecmaVersion: 2022, sourceType: 'module', locations: true });

const out = [];
function nameOfFunc(node, parent) {
  if (node.id && node.id.name) return node.id.name;
  if (parent) {
    if (parent.type === 'VariableDeclarator' && parent.id && parent.id.name) return parent.id.name;
    if (parent.type === 'Property' && parent.key) return parent.key.name || parent.key.value;
    if (parent.type === 'AssignmentExpression' && parent.left && parent.left.type === 'Identifier') return parent.left.name;
  }
  return '<anon>';
}
(function collect(node, parent, depth) {
  if (!node || typeof node.type !== 'string') return;
  let d = depth;
  if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(node.type)) {
    d = depth + 1;
    const nm = nameOfFunc(node, parent);
    if (d <= maxDepth && (!filter || filter.test(nm))) {
      out.push({ name: nm, from: node.loc.start.line, to: node.loc.end.line, depth: d,
                 params: (node.params || []).map(p => p.name || p.type).join(','), type: node.type });
    }
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'range' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && collect(c, node, d));
    else if (v && typeof v.type === 'string') collect(v, node, d);
  }
})(ast, null, 0);

out.sort((a, b) => a.from - b.from);
console.log(`# ${out.length} functions in ${file} (depth<=${maxDepth}${filter ? ', name~' + filter : ''})`);
for (const f of out) console.log(`L${String(f.from).padStart(5)}-${String(f.to).padStart(5)} d${f.depth} ${f.name} (${f.params})`);
