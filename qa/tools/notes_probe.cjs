const fs=require('fs'),path=require('path');
const acorn=require('acorn'),jsx=require('acorn-jsx'),walk=require('acorn-walk');
const P=acorn.Parser.extend(jsx());
const jsxBase=Object.assign({},walk.base,{
  JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},
  JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},
  JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},
  JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},
  JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},
  JSXExpressionContainer(n,s,c){c(n.expression,s);},
  JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}});
// pull the MD and ME note strings out of STATE_RULES on each build, by AST
function notes(f){
  const ast=P.parse(fs.readFileSync(f,'utf8'),{ecmaVersion:'latest',sourceType:'module'});
  const out={};
  walk.simple(ast,{Property(n){
    const k=n.key&&(n.key.name||n.key.value);
    if((k==='KY'||k==='DE')&&n.value&&n.value.type==='ObjectExpression'){
      for(const p of n.value.properties) if((p.key.name||p.key.value)==='note') out[k]=p.value.value;
    }}},jsxBase);
  return out;
}
const O=notes(process.argv[2]),N=notes(process.argv[3]);
const dirs=process.argv.slice(4);
const files=[];
for(const d of dirs)for(const f of fs.readdirSync(d)){
  if(!/\.(mjs|cjs|js|jsx)$/.test(f))continue;
  if(/^(DangerClose|app_|dom_|fixture|copylock)/.test(f))continue;
  files.push(path.join(d,f));}
const rx=[];
for(const f of files){let a;try{a=P.parse(fs.readFileSync(f,'utf8'),{ecmaVersion:'latest',sourceType:'module',locations:true});}catch{continue;}
  walk.simple(a,{Literal(n){if(n.regex)rx.push({f:path.basename(f),l:n.loc.start.line,raw:n.raw,r:n.regex});}},jsxBase);}
console.log(`# ${rx.length} regex literals · executed against the KY and DE notes on BOTH builds\n`);
for(const st of ['KY','DE']){
  console.log(`== ${st} ==\n  OLD: ${O[st]}\n  NEW: ${N[st]}\n`);
  for(const x of rx){
    let re;try{re=new RegExp(x.r.pattern,x.r.flags.replace('g',''));}catch{continue;}
    const a=re.test(O[st]),b=re.test(N[st]);
    if(a!==b)console.log(`  ${a?'LOST ':'GAINED'}  ${x.f}:${x.l}  ${x.raw}`);
  }
  console.log('');
}
