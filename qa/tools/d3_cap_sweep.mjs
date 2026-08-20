import { statute86 } from "./hand_86.mjs";
const ULT={72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,85:16.0,86:15.2,87:14.4,88:13.7,89:12.9};
const rmdAge=by=>by<=1950?72:by<=1959?73:75;
const G=0.045, usd=n=>"$"+Math.round(n).toLocaleString();
function run(hh,cap){const{dobA,dobB,retire,tA,tB,rothAmount}=hh;
  const end=Math.max(dobA+rmdAge(dobA)-1,dobB+rmdAge(dobB)-1);
  let a=tA,b=tB,tot=0,bindYrs=0;
  for(let y=retire;y<=end;y++){
    const gA=a*(1+G),gB=b*(1+G),grown=gA+gB,ageA=y-dobA,ageB=y-dobB;
    const rA=ageA>=rmdAge(dobA)?gA/(ULT[Math.min(ageA,89)]||6.4):0;
    const rB=ageB>=rmdAge(dobB)?gB/(ULT[Math.min(ageB,89)]||6.4):0;
    const rmd=rA+rB, room=cap?Math.max(0,grown-rmd):grown, conv=Math.min(rothAmount,room);
    if(cap && rmd>0 && rothAmount>grown-rmd && rothAmount<=grown) bindYrs++;
    const cA=grown>0?conv*(gA/grown):0;
    a=gA-cA-rA; b=gB-(conv-cA)-rB; tot+=conv;
  }
  return {tot,bindYrs};
}
// Sweep the slider ($0..$400K step $5K, per L8974) across a range of Traditional balances,
// on the 1959/1962 split-RMD-age household where the tail is longest.
console.log("Where does the RMD cap actually bind? (1959/1962 household, 8-year ladder)");
console.log("tradInit    slider     yrs cap binds   total conv uncapped   total conv capped    diff");
let worst={d:0};
for(const t of [200000,300000,400000,600000,900000,1400000]){
 for(let s=5000;s<=400000;s+=5000){
   const hh={dobA:1959,dobB:1962,retire:2029,tA:t*0.85,tB:t*0.15,rothAmount:s};
   const A=run(hh,false),B=run(hh,true);
   const d=A.tot-B.tot;
   if(B.bindYrs>0 && d>worst.d) worst={d,t,s,A:A.tot,B:B.tot,yrs:B.bindYrs};
 }
}
if(worst.d>0){
  console.log(usd(worst.t).padEnd(11),usd(worst.s).padEnd(10),String(worst.yrs).padEnd(15),
    usd(worst.A).padEnd(21),usd(worst.B).padEnd(20),usd(worst.d));
  console.log(`\nWORST CASE FOUND: cap reduces lifetime conversions by ${usd(worst.d)} (${(worst.d/worst.A*100).toFixed(1)}%)`);
} else console.log("cap never binds anywhere in the swept space");
