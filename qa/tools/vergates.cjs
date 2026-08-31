const fs=require('fs'),path=require('path');
const acorn=require('acorn'),jsx=require('acorn-jsx'),walk=require('acorn-walk');
const P=acorn.Parser.extend(jsx());
const B=Object.assign({},walk.base,{JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},JSXExpressionContainer(n,s,c){c(n.expression,s);},JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}});
let gates=0, regs=0;
const files=[];
for(const d of process.argv.slice(2))for(const f of fs.readdirSync(d)){
  if(!/\.(mjs|cjs|js|jsx)$/.test(f))continue;
  if(/^(DangerClose|app_|dom_|fixture|copylock|notes_probe|lits|vergates)/.test(f))continue;
  files.push(path.join(d,f));}
for(const p of files){
  let a;try{a=P.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:'latest',sourceType:'module',locations:true});}catch{continue;}
  const src=fs.readFileSync(p,'utf8').split('\n');
  walk.simple(a,{
    Literal(n){ if(typeof n.value==='string'&&/^v5\d\d$/.test(n.value)){
      const line=src[n.loc.start.line-1];
      if(/KNOWN_VERSIONS|ORDER|POST|VERSIONS|TAGS/.test(line)){ regs++; }
      else { gates++; }
      console.log(`${path.basename(p)}:${n.loc.start.line}  ${n.value}   ${line.trim().slice(0,100)}`);
    }}
  },B);
}
console.error(`\n# ${gates} tag literals outside registry lines, ${regs} on registry lines, across ${files.length} files`);
