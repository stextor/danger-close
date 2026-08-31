const fs=require('fs'),path=require('path');
const acorn=require('acorn'),jsx=require('acorn-jsx'),walk=require('acorn-walk');
const P=acorn.Parser.extend(jsx());
const B=Object.assign({},walk.base,{JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},JSXExpressionContainer(n,s,c){c(n.expression,s);},JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}});
// usage: node lits.cjs <n1,n2,...> <dir> [dir2 ...]
// Which suite assertions carry a given numeric literal? A grep on "1511.20" misses `1511.2`,
// `0.04` matches inside `0.045`, and neither can tell an assertion from a comment. This walks
// the AST and reports the enclosing source line for every matching numeric Literal.
const TARGET=new Set(process.argv[2].split(',').map(Number));
for(const d of process.argv.slice(3)){
 for(const f of fs.readdirSync(d)){
  if(!/\.(mjs|cjs|js|jsx)$/.test(f)||/^(DangerClose|app_|dom_|fixture|copylock|notes_probe)/.test(f))continue;
  const p=path.join(d,f);let a;try{a=P.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:'latest',sourceType:'module',locations:true});}catch{continue;}
  const src=fs.readFileSync(p,'utf8').split('\n');
  walk.simple(a,{Literal(n){if(typeof n.value==='number'&&TARGET.has(n.value))
    console.log(`  ${f}:${n.loc.start.line}  ${n.value}   ${src[n.loc.start.line-1].trim().slice(0,110)}`);}},B);
 }}
