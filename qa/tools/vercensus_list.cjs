// Companion to vercensus.cjs: same AST walk, but LISTS each site with its source line so the
// judgement can actually be made. vercensus counts; this shows the work. ASSERTS NOTHING.
// usage: node vercensus_list.cjs <tag> [dir ...]
const fs=require("fs"), path=require("path");
const acorn=require("acorn"), jsx=require("acorn-jsx"), walk=require("acorn-walk");
const P=acorn.Parser.extend(jsx());
const B=Object.assign({},walk.base,{
  JSXElement(n,s,c){(n.children||[]).forEach(x=>c(x,s));if(n.openingElement)c(n.openingElement,s);},
  JSXFragment(n,s,c){(n.children||[]).forEach(x=>c(x,s));},
  JSXOpeningElement(n,s,c){(n.attributes||[]).forEach(a=>c(a,s));},
  JSXClosingElement(){},JSXAttribute(n,s,c){if(n.value)c(n.value,s);},
  JSXSpreadAttribute(n,s,c){if(n.argument)c(n.argument,s);},
  JSXExpressionContainer(n,s,c){c(n.expression,s);},
  JSXEmptyExpression(){},JSXText(){},JSXIdentifier(){},JSXMemberExpression(){},JSXNamespacedName(){}});
const CUR=process.argv[2];
if(!CUR||!/^v5\d+$/.test(CUR)){console.error("usage: node vercensus_list.cjs <tag> [dir ...]");process.exit(2);}
const DIRS=process.argv.slice(3).length?process.argv.slice(3):["."];
for(const d of DIRS){
  let entries; try{entries=fs.readdirSync(d);}catch{continue;}
  for(const f of entries.sort()){
    if(!/\.(mjs|cjs)$/.test(f))continue;
    if(/^(app_|dom_|vercensus)/.test(f))continue;
    const p=path.join(d,f); let src,ast;
    try{src=fs.readFileSync(p,"utf8");ast=P.parse(src,{ecmaVersion:"latest",sourceType:"module",locations:true});}catch{continue;}
    const lines=src.split("\n"); const hits=[];
    walk.simple(ast,{Literal(n){
      if(n.value!==CUR)return;
      const L=lines[n.loc.start.line-1]||"";
      const gated=new RegExp('===\\s*"'+CUR+'"').test(L)||new RegExp('"'+CUR+'"\\s*===').test(L);
      hits.push({line:n.loc.start.line,gated,txt:L.trim()});
    }},B);
    if(!hits.length)continue;
    console.log(`\n### ${f}`);
    for(const h of hits.sort((a,b)=>a.line-b.line))
      console.log(`  ${h.gated?"GATE  ":"ladder"} L${String(h.line).padStart(4)}  ${h.txt.slice(0,150)}`);
  }
}
