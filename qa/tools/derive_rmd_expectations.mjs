// PRE-BUILD DERIVATION for SCOPE_FIX_roth_tab_rmd_magi.
// Expected figures computed BEFORE any code is written (the v5.37/v5.38 order).
//
// RMD BASIS — Pub. 590-B: the divisor applies to the PRIOR 31 December balance,
// not the current year's grown balance. d3.mjs got this wrong (it divided gA, the
// already-grown figure); corrected here. The error inflates every RMD by (1+g).
import { statute86 } from "./hand_86.mjs";
const ULT={72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,82:18.5};
const rmdAge=by=>by<=1950?72:by<=1959?73:75;
const G=0.045, usd=n=>"$"+Math.round(n).toLocaleString();

// Decisions as resolved: D-1 grow-then-convert · D-2 Option C (per-person, RMD leaves
// the account) · D-3 conv capped at grownTrad - rmd (matches Engine C L4393)
function derive(hh){
  const {dobA,dobB,retire,ssA,ssAage,ssB,ssBage,penMo,tA,tB,rothAmount,sleeve,divPct}=hh;
  const end=Math.max(dobA+rmdAge(dobA)-1, dobB+rmdAge(dobB)-1);
  let a=tA,b=tB; const rows=[];
  for(let y=retire;y<=end;y++){
    const priorA=a, priorB=b;                       // Pub 590-B basis: prior 31 Dec
    const ageA=y-dobA, ageB=y-dobB;
    const rA=ageA>=rmdAge(dobA)?priorA/(ULT[Math.min(ageA,82)]||6.4):0;
    const rB=ageB>=rmdAge(dobB)?priorB/(ULT[Math.min(ageB,82)]||6.4):0;
    const rmd=rA+rB;
    const gA=a*(1+G), gB=b*(1+G), grown=gA+gB;      // D-1: grow, then convert
    const conv=Math.min(rothAmount, Math.max(0,grown-rmd));   // D-3
    const cA=grown>0?conv*(gA/grown):0, cB=conv-cA;
    const ssAy=y>=dobA+ssAage?ssA*12:0, ssBy=y>=dobB+ssBage?ssB*12:0;
    const SS=ssAy+ssBy, pen=penMo*12, div=sleeve*divPct/100;
    const nonSS=pen+conv+rmd+div;                   // RMD in the Sec.86 base too
    const tSS=statute86(SS,nonSS,true);
    const magi=nonSS+tSS;
    const oldMagi=pen+conv+ (function(){const n=pen+conv;const p=n+SS*0.5;
      return p>44000?Math.round(SS*0.85):p>32000?Math.round(Math.min((p-32000)*0.5,SS*0.85)):0;})();
    rows.push({y,rmd,conv,tSS,magi,oldMagi,tradEnd:(gA-cA-rA)+(gB-cB-rB)});
    a=gA-cA-rA; b=gB-cB-rB;
  }
  return rows;
}
const HH1={dobA:1964,dobB:1966,retire:2029,ssA:3300,ssAage:67,ssB:1300,ssBage:63,penMo:400,
  tA:1180000,tB:218600,rothAmount:70000,sleeve:21000,divPct:2.0};
const r=derive(HH1);
console.log("DERIVED EXPECTATIONS — shipped example household, post-fix");
console.log("year   RMD (Pub590-B)   conv       taxSS(Sec.86)   MAGI post-fix   MAGI today    delta");
for(const x of r) console.log(String(x.y).padEnd(6),usd(x.rmd).padEnd(16),usd(x.conv).padEnd(10),
  usd(x.tSS).padEnd(15),usd(x.magi).padEnd(15),usd(x.oldMagi).padEnd(13),
  (x.magi-x.oldMagi>=0?"+":"")+usd(x.magi-x.oldMagi));
console.log("\nTAIL-YEAR INVARIANT TARGETS (the dollar-exact assertions the release ships):");
for(const x of r.filter(v=>v.rmd>0))
  console.log(`  ${x.y}: RMD ${usd(x.rmd)}  MAGI ${usd(x.magi)}  (today ${usd(x.oldMagi)}, +${usd(x.magi-x.oldMagi)})`);
console.log("\nsanity: RMD basis is prior 31 Dec. 2039 divisor = ULT[75] = 24.6 (spouse A turns 75 in 2039).");
