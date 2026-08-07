// t10 — SECTION C / PHASE 2A: FEDERAL CORE, dollar-exact against Engine A (runRothStrategies).
// Build under audit: v5.10.2 (md5 7ddda3585abb9dc2c40fa4fbfc46967a).
// Constants verified against IRS Rev. Proc. 2025-32 (IR-2025-103), IRC §1411 (NIIT), IRC §86 (SS).
// The engine accumulates EXACT per-year tax and Math.round()s the reported total once (L3640),
// so expected values are Math.round(exact) — the engine's whole-dollar output must equal the
// hand figure rounded to whole dollars. See FlawsToFix-v5_10_2-Phase2A.md appendix for longhand.
//
// HARNESS (D-1): single-year isolation. retireYr=horizonYr=asOfYr=2026 => one loop pass, so a
// strategy's totTax == that year's total tax. Neutralized so totTax == the federal figure tested:
//   streams: one {monthly:0} stream => spouseBWorkTaper() suppressed AND $0 added
//   state 0, no work (no FICA), income below AMT exemption, no MAGI two years prior (no IRMAA),
//   tradInit 0 => conv 0 for every policy (read strategy "none").
let seed = 1;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const VER = process.argv[2] || "v5102";
const g = (await import(`./app_${VER}.mjs`)).__g;
g.setPortfolio({ positions: [], stateCode: null,
  incomeStreams: [{ monthly: 0, tax: "ordinary", owner: "A", startYear: 2000, endYear: 9999 }] });

let pass = 0, fail = 0; const fails = [];
const EPS = 0.01;
const T = (name, got, exp) => { const ok = Math.abs(got - exp) < EPS;
  if (ok) pass++; else { fail++; fails.push(`  ✗ ${name}: got ${got}  exp ${exp}  Δ ${(got-exp).toFixed(4)}`); } };
const R = Math.round;

// ── IRS-verified 2026 constants (independent copy from primary source, NOT from the app) ──
const STD = { S: 16100, M: 32200 }, SR = { S: 2050, M: 1650 };
const BR = {
  S: [[0.10,12400],[0.12,50400],[0.22,105700],[0.24,201775],[0.32,256225],[0.35,640600],[0.37,Infinity]],
  M: [[0.10,24800],[0.12,100800],[0.22,211400],[0.24,403550],[0.32,512450],[0.35,768700],[0.37,Infinity]] };
const LT = { S:[[0.0,49450],[0.15,545500],[0.20,Infinity]], M:[[0.0,98900],[0.15,613700],[0.20,Infinity]] };
const NIIT = { S: 200000, M: 250000 };
const SS_T1 = { S: 25000, M: 32000 }, SS_T2 = { S: 34000, M: 44000 };
const fedRef = (ti, st) => { if (ti<=0) return 0; let tax=0, prev=0; for (const [r,u] of BR[st]) { const s=Math.min(ti,u)-prev; if (s>0) tax+=s*r; prev=u; if (ti<=u) break; } return tax; };
const ltcgRef = (gg, ord, st) => { if (gg<=0) return 0; let tax=0, stk=ord, rem=gg; for (const [r,u] of LT[st]) { if (stk>=u) continue; const s=Math.min(rem,u-stk); if (s>0){tax+=s*r; rem-=s; stk+=s;} if (rem<=0) break; } return tax; };
const ssRef = (ss, other, st) => { const p=other+0.5*ss, t1=SS_T1[st], t2=SS_T2[st]; if (p<=t1) return 0; if (p<=t2) return Math.min(0.5*(p-t1),0.5*ss); return Math.min(0.85*ss, 0.5*Math.min(p-t1,t2-t1)+0.85*(p-t2)); };

console.log(`t10 — SECTION C 2A federal core (${VER})`);
// Longhand literal anchors: cumulative tax at each bracket top, hand-worked in the appendix.
for (const [ti,lit] of [[12400,1240],[50400,5800],[105700,17966],[201775,41024],[256225,58448],[640600,192979.25]])
  T(`ANCHOR SGL fedRef(${ti})=${lit}`, fedRef(ti,"S"), lit);
for (const [ti,lit] of [[24800,2480],[100800,11600],[211400,35932],[403550,82048],[512450,116896],[768700,206583.5]])
  T(`ANCHOR MFJ fedRef(${ti})=${lit}`, fedRef(ti,"M"), lit);

const baseSingle = (o={}) => ({ single:true, asOfYr:2026, retireYr:2026, horizonYr:2026, ladderEnd:2026, ladderEndA:2026, ladderEndB:2026,
  dobAYr:1966, dobBYr:1966, deathYr1:Infinity, survivor:"A", ssA:0, ssB:0, ssAYr:2040, ssAMo:1, ssBYr:2040, ssBMo:1,
  pen:0, stateRate:0, stateCode:null, convTaxFunding:"withhold", taxableGainFrac:0, acaPremium:0, acaSize:0, taxYieldPct:0, currentConv:0,
  tradInit:0, rothInit:0, tradInitA:0, tradInitB:0, rothInitA:0, rothInitB:0, taxableInit:0, ...o });
const baseMFJ = (o={}) => baseSingle({ single:false, dobBYr:1966, ...o });
const none = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totTax;
const noneNiit = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totNiit;
const penFor = (T_, D) => (T_ + D) / 12;
const out = {};

// ═══ 1–2. Ordinary brackets, both statuses, every boundary ±$1 ═══
for (const [st, base, bounds] of [["S", baseSingle, [12400,50400,105700,201775,256225,640600]],
                                  ["M", baseMFJ,     [24800,100800,211400,403550,512450,768700]]])
  for (const b of bounds) for (const d of [-1,0,1]) { const ti=b+d;
    const got = none(base({ pen: penFor(ti, STD[st]) })); const exp = R(fedRef(ti, st));
    T(`${st} bracket ti=${ti}`, got, exp); out[`${st}_${ti}`]={got,exp}; }

// ═══ 3. Age-65 extra standard deduction ═══
{ const p1 = baseSingle({ dobAYr:1960, pen: penFor(40000, STD.S + SR.S) });
  T(`DED SGL age65 (ti40000)`, none(p1), R(fedRef(40000,"S"))); out.DED_S={got:none(p1),exp:R(fedRef(40000,"S"))};
  const p2 = baseMFJ({ dobAYr:1960, dobBYr:1960, pen: penFor(60000, STD.M + 2*SR.M) });
  T(`DED MFJ both age65 (ti60000)`, none(p2), R(fedRef(60000,"M"))); out.DED_M2={got:none(p2),exp:R(fedRef(60000,"M"))};
  const p3 = baseMFJ({ dobAYr:1960, dobBYr:1966, pen: penFor(60000, STD.M + SR.M) });
  T(`DED MFJ one age65 (ti60000)`, none(p3), R(fedRef(60000,"M"))); out.DED_M1={got:none(p3),exp:R(fedRef(60000,"M"))}; }

// ═══ 4. OBBBA: Engine A deliberately OMITS the $6K bonus (documented; D-3 cross-engine item) ═══
{ const p = baseSingle({ dobAYr:1960, pen: penFor(30000, STD.S + SR.S) }); // 65+, MAGI<75k => bonus would apply if modeled
  T(`OBBBA SGL: Engine A omits bonus (ti30000)`, none(p), R(fedRef(30000,"S"))); out.OBBBA={got:none(p),exp:R(fedRef(30000,"S"))}; }

// ═══ 5. LTCG stacking — 0%/15% straddle & fill, both statuses ═══
{ const mk = (st, base, ti, div) => { const taxableInit=1_000_000; const pct=(div/taxableInit)*100;
    return (st==="S"?baseSingle:baseMFJ)({ pen: penFor(ti, STD[st]), taxYieldPct: pct, taxableInit }); };
  for (const [st,ti,div,tag] of [["S",20000,30000,"0/15 straddle"],["S",20000,29450,"fills 0% exactly"],
                                 ["M",40000,70000,"0/15 straddle"],["M",40000,58900,"fills 0% exactly"]]) {
    const got = none(mk(st,null,ti,div)); const exp = R(fedRef(ti,st) + ltcgRef(div, ti, st));
    T(`LTCG ${st} ${tag}`, got, exp); out[`LTCG_${st}_${div}`]={got,exp}; } }

// ═══ 6. NIIT — MAGI borders + interior, both statuses ═══
{ const mk = (st, magi, div) => { const taxableInit=1_000_000; const pct=(div/taxableInit)*100;
    return (st==="S"?baseSingle:baseMFJ)({ pen: (magi-div)/12, taxYieldPct: pct, taxableInit }); };
  for (const [st,div,pts] of [["S",20000,[199999,200000,200001,200100,220000]],
                              ["M",30000,[249999,250000,250001,250100,300000]]])
    for (const m of pts) { const got = noneNiit(mk(st,m,div));
      const exp = R(0.038 * Math.min(div, Math.max(0, m - NIIT[st])));
      T(`NIIT ${st} magi=${m}`, got, exp); out[`NIIT_${st}_${m}`]={got,exp}; } }

// ═══ 7. SS taxability — tier borders (t1,t2) + interior with nonzero fed flow-through ═══
{ const mk = (st, ss, other) => (st==="S"?baseSingle:baseMFJ)({ ssA: ss/12, ssAYr:2020, ssAMo:1, pen: other/12 });
  const cases = {
    S: [[10000,18000,"tier0 interior fed>0"],[20000,15000,"t1 border"],[10000,25000,"tier1 interior fed>0"],
        [20000,24000,"t2 border"],[30000,40000,"tier2 interior fed>0"]],
    M: [[10000,25000,"tier0 interior fed>0"],[20000,22000,"t1 border"],[10000,32000,"tier1 interior fed>0"],
        [30000,29000,"t2 border"],[40000,50000,"tier2 interior fed>0"]] };
  for (const st of ["S","M"]) for (const [ss,other,tag] of cases[st]) {
    const taxSS = ssRef(ss, other, st); const grossOrd = other + taxSS;
    const taxableOrd = Math.max(0, grossOrd - STD[st]); const exp = R(fedRef(taxableOrd, st));
    const got = none(mk(st, ss, other));
    T(`SS ${st} ${tag} (ss${ss},oth${other})`, got, exp);
    out[`SS_${st}_${other}`]={got,exp,taxSS:+taxSS.toFixed(2),taxableOrd:+taxableOrd.toFixed(2)}; } }

console.log(`\nt10 2A: ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
console.log("\n--- captured (engine vs independent hand reference) ---");
for (const k of ["S_50400","S_105700","M_100800","DED_S","OBBBA","LTCG_S_30000","LTCG_M_70000",
                 "NIIT_S_220000","NIIT_M_300000","SS_S_18000","SS_S_40000","SS_M_50000"])
  if (out[k]) console.log(`${k}: got=${out[k].got} exp=${out[k].exp}`+(out[k].taxSS!==undefined?` (taxableSS=${out[k].taxSS}, taxableOrd=${out[k].taxableOrd})`:""));
process.exit(fail ? 1 : 0);
