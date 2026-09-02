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
const noneIrmaa = (P) => g.runRothStrategies(P).find(r=>r.key==="none").totIrmaa;
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

// ═══════════════════════════════════════════════════════════════════════════════════════════
// PHASE 2B — IRMAA + indexation discipline (dollar-exact against Engine A / runRothStrategies).
// Constants verified vs CMS 2026 (published 2025-11-14, eff 2026-01-01): thresholds EXACT;
// per-person combined Part B+D surcharges are the app's disclosed "approximate annual" values
// (CMS-exact differ ≤$5; see FlawsToFix-v5_10_2-Phase2B.md appendix). SUR_R below = the app's
// constants, so these cases assert the ENGINE selects the right tier and multiplies by persons.
//
// HARNESS: IRMAA needs MAGI two years prior in-window, so a 3-year window (retireYr..retireYr+2)
// puts exactly ONE surcharge year at the end (only it has magiHist[yr-2]); totIrmaa == that year.
// At premium year 2028 (window 2026→2028) the inflator exponent (yr-2-asOfYr) is 0, so thresholds
// are the base CMS values — the clean place to test tier selection. Both spouses 65+ via dob 1958.
const pass2A = pass, fail2A = fail;
const SGL_R = [109000,137000,171000,205000,500000,Infinity];
const MFJ_R = [218000,274000,342000,410000,750000,Infinity];
const SUR_R = [0,1150,2880,4620,6360,6940];
const tierR = (magi, ups) => { for (let i=0;i<ups.length;i++) if (magi<=ups[i]) return i; return ups.length-1; };
const irmaaRef = (magi, single, persons) => SUR_R[tierR(magi, single?SGL_R:MFJ_R)] * persons;
// IRMAA isolation builder: 3-year window ending at `premiumYr`, both 65+ that year, MAGI = pen.
const irmaaP = (single, magi, premiumYr=2028, o={}) =>
  (single?baseSingle:baseMFJ)({ retireYr:premiumYr-2, horizonYr:premiumYr, asOfYr:2026,
    dobAYr:premiumYr-70, dobBYr:premiumYr-70, ladderEnd:premiumYr-3, pen:magi/12, ...o });

// ═══ 8. IRMAA tier borders ±$1, both statuses, PREMIUM-YEAR thresholds (premium year 2028) ═══
// REWRITTEN AT v5.14. These 30 cases previously compared MAGI against the BASE 2026 thresholds,
// which was valid only because the pre-fix engine indexed to the MAGI year — at premium year 2028
// that meant 2026, exponent 0. v5.14 indexes to the PREMIUM year (F-2B-1), so exponent 2 applies and
// every boundary moves up ~4%. Ten of these cases correctly failed on the first run after the fix.
//
// The reference below is an INDEPENDENT re-derivation of the CMS rule (premium-year indexing, plus
// the BBA-2018 top-tier freeze), written from the statute — not a copy of the engine's helper. The
// borders are taken at floor(threshold) so the ±$1 cliff test stays exact against a float boundary.
const IDX_R = 1.02, TOP_FROZEN_R = 2027, BASE_YR_R = 2026;
const thrRef = (upper, isTop, premiumYr) => !isFinite(upper) ? upper
  : upper * Math.pow(IDX_R, isTop ? Math.max(0, premiumYr - TOP_FROZEN_R) : premiumYr - BASE_YR_R);
const tierRefY = (magi, ups, premiumYr) => {
  for (let i = 0; i < ups.length; i++) if (magi <= thrRef(ups[i], i === ups.length - 2, premiumYr)) return i;
  return ups.length - 1; };
const irmaaRefY = (magi, single, persons, premiumYr) =>
  SUR_R[tierRefY(magi, single ? SGL_R : MFJ_R, premiumYr)] * persons;
const PY = 2028;
for (const [st, single, ups, persons] of [["SGL",true,SGL_R,1],["MFJ",false,MFJ_R,2]])
  for (let i = 0; i < 5; i++) {
    const edge = Math.floor(thrRef(ups[i], i === ups.length - 2, PY));
    for (const d of [-1,0,1]) { const magi = edge + d;
      const got = noneIrmaa(irmaaP(single, magi, PY));
      const exp = irmaaRefY(magi, single, persons, PY);
      T(`IRMAA ${st} magi=${magi} (border, premiumYr ${PY})`, got, exp);
      out[`IRMAA_${st}_${magi}`]={got,exp}; } }

// ═══ 9. Per-person surcharge: MFJ one spouse <65 (×1), neither 65 (×0) ═══
{ const g1 = noneIrmaa(irmaaP(false, 300000, 2028, { dobBYr:1970 })); // B age 58 in 2028
  T(`IRMAA MFJ one-65 magi=300000 (×1)`, g1, SUR_R[tierR(300000,MFJ_R)]*1); out.IRMAA_MFJ_one65={got:g1,exp:SUR_R[tierR(300000,MFJ_R)]};
  const g0 = noneIrmaa(irmaaP(false, 300000, 2028, { dobAYr:1970, dobBYr:1970 })); // both <65
  T(`IRMAA MFJ neither-65 magi=300000 (×0)`, g0, 0); out.IRMAA_MFJ_none65={got:g0,exp:0}; }

// ═══ 10. [FIXED v5.14] indexation — pins flipped from the defect to the CMS-correct answer ═══
// Both were opened 2026-08-07 as dated [KNOWN DEFECT] pins asserting the wrong-but-real behaviour,
// and both are corrected in v5.14 by a single shared threshold helper. The flip is the fix's own
// verification: these expectations were written from primary source BEFORE the fix existed, so they
// cannot have been reverse-engineered from it.
//
// F-2B-1 — thresholds now index to the PREMIUM year, not the MAGI year. The 2-year lookback shifts
//   the INCOME, not the table. SGL tier-1 at premium year 2046 = 109000·1.02^20 = 161,968 (was
//   109000·1.02^18 = 155,679). A household with 2044 MAGI of 158,000 sits between the two: it owed
//   $1,150 under the defect and owes $0 under the law.
{ const got = noneIrmaa(irmaaP(true, 158000, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=158000 => $0 (premium-year index; was 1150)`, got, 0);
  out.IRMAA_FIX_premise2 = { got, exp:0, preFix:1150 };
  // Still a cliff, just in the right place: one dollar over the CORRECT threshold charges in full.
  const gHi = noneIrmaa(irmaaP(true, 161969, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=161969 (one $ over the correct thr) => 1150`, gHi, 1150);
  const gAt = noneIrmaa(irmaaP(true, 161968, 2046));
  T(`IRMAA [FIXED F-2B-1] SGL premiumYr2046 magi=161968 (AT the correct thr) => 0`, gAt, 0); }
//
// F-2B-2 — the top tier is frozen through 2027 and indexes only from 2028, off the frozen base
//   (BBA-2018 §53114). SGL top at premium year 2046 = 500000·1.02^19 = 728,406 (was 500000·1.02^18
//   = 714,123). A household with 2044 MAGI of 720,000 is tier 4 under the law, not the top tier.
{ const got = noneIrmaa(irmaaP(true, 720000, 2046));
  T(`IRMAA [FIXED F-2B-2] SGL premiumYr2046 magi=720000 => 6360 (tier 4, not top; was 6940)`, got, 6360);
  out.IRMAA_FIX_premise1 = { got, exp:6360, preFix:6940 };
  const gTop = noneIrmaa(irmaaP(true, 728407, 2046));
  T(`IRMAA [FIXED F-2B-2] SGL premiumYr2046 magi=728407 (one $ over the correct top) => 6940`, gTop, 6940); }
//
// The FREEZE ITSELF — the boundary no earlier case covered. The top tier must not move at all before
// 2028, then index off the frozen base. Premium years 2027/2028/2029, one dollar over $500,000:
// frozen years charge the top tier; from 2028 the threshold rises, so the same income falls to tier 4.
{ const at2027 = noneIrmaa(irmaaP(true, 500001, 2027));
  T(`IRMAA [FIXED F-2B-2] top tier FROZEN at premiumYr2027: magi=500001 => 6940`, at2027, 6940);
  const at2029 = noneIrmaa(irmaaP(true, 500001, 2029));
  T(`IRMAA [FIXED F-2B-2] top tier INDEXED by premiumYr2029: magi=500001 => 6360 (thr risen)`, at2029, 6360);
  out.IRMAA_FIX_freeze = { at2027, at2029 }; }


// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 2D — THE ROTH BREAK-EVEN CROSSOVER.  Audit sub-phase 2D owed these and never had them.
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// WHY THESE EXIST. `FlawsToFix-v5_15-Phase2D.md` §6 recorded, across three revisions, that the
// break-even half of 2D "remains a premise reading, not a verification": the code had been read
// and judged plausible, which the project standard explicitly does not accept. It owed three
// things — hand-verify the crossover on a household that runs a real deficit before recovering,
// hand-verify one that is never behind, and verify the discounting-equivalence claim asserted in
// the comment at the wealth line. All three are discharged here.
//
// WHAT THE CROSSOVER IS. `runRothStrategies` records per-year FACE-VALUE wealth
// (taxable + rothA + rothB + tradA + tradB) for every policy. The Roth tab subtracts the
// no-conversion run from the current-conversion run and reports the first year the difference
// turns non-negative — after a deficit if there was one, otherwise the first year ahead.
//
// THE IDENTITY BEING ASSERTED, which is what makes this a verification rather than a re-reading:
//
//     wealth delta in the conversion year  ==  -(incremental federal tax) x (1 + GROWTH)
//
// The deficit IS the conversion tax, compounded once. Nothing else can produce it, because both
// runs grow every balance at the same rate and differ only by the dollars the tax removed.
const pass2C = pass, fail2C = fail;
{
  // t10 runs on a DELIBERATELY EMPTY portfolio, because 2A/2B test tax functions in isolation.
  // The crossover needs balances to convert, so this block installs its own explicit fixture and
  // restores the empty one afterwards. Stated because a hand-built fixture that silently inherits
  // an empty portfolio returns zeros and every assertion below passes vacuously — which is what
  // the first version of this block did.
  const SAVED = JSON.parse(JSON.stringify(g.PORTFOLIO()));
  g.setPortfolio({
    positions: [{ ticker: "T", owner: "A", name: "Trad", balance: 900000, bucket: 3,
                  type: "equity-lb", roth: 0, trad: 900000, er: 0.03 }],
    total401k: 900000, household: 1000000, stateCode: null, asOfYr: 2026,
    otherAccounts: [{ name: "Brokerage", balance: 100000, owner: "JT", taxType: "taxable" }],
    incomeStreams: [], incomeSources: {}, single: false,
    contributions: { monthly401k: 0, hsaMonthly: 0, spouseBMonthly: 0,
                     contribPreTaxA: 0, contribRothA: 0, contribPreTaxB: 0, contribRothB: 0, allocations: {} },
  });
  const rsb = g.retireStartBalances(2027);
  const BASE = {
    single: false, asOfYr: 2026, retireYr: 2027, horizonYr: 2052,
    ladderEnd: 2040, ladderEndA: 2040, ladderEndB: 2040,
    dobAYr: 1970, dobBYr: 1972, deathYr1: 2060, survivor: "B",
    ssA: 0, ssB: 0, ssAYr: 2040, ssAMo: 6, ssBYr: 2042, ssBMo: 6,
    pen: 0, stateRate: 0, stateCode: null, convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 0, currentConv: 0, ...rsb,
    taxableInit: g.taxableInitAll ? g.taxableInitAll() : 0,
  };
  // ── WHAT THESE CASES DO AND DO NOT REACH — established by negative control, not by assumption.
  // The wealth series below is genuine ENGINE output: `runRothStrategies` computes wealthByYr, and
  // corrupting it (crediting Roth above Traditional via the heir rate) fails 7 of these assertions.
  //
  // The SELECTION logic — `beYr = beWasBehind ? firstRecover : firstAhead` — is NOT reached. It
  // lives inline in an anonymous closure three levels inside DangerCloseMain (source ~L8686-8699)
  // and is exported nowhere, so `cross()` below REIMPLEMENTS it. A control that removed the
  // never-behind branch from the shipped source changed nothing here, which is how this was found
  // rather than assumed. What that means precisely:
  //   VERIFIED  — the wealth series, the tax identity, the discounting equivalence, and that
  //               inputs producing each of the three outcomes exist and behave as claimed.
  //   NOT VERIFIED — that the SHIPPED selection expression picks the same year this one does.
  // Closing it needs the expression extracted to a callable function, which is a source change and
  // was out of scope for the audit that produced these cases. Recorded in the 2D deliverable.
  const GROWTH = 1.045;
  const cross = (P, conv) => {
    const menu = [{ key: "none", policy: { kind: "fixed", amount: 0 } },
                  { key: "cur",  policy: { kind: "fixed", amount: conv } }];
    const r = g.runRothStrategies({ ...P, currentConv: conv }, menu);
    const none = r.find(x => x.key === "none"), cur = r.find(x => x.key === "cur");
    const yrs = Object.keys(none.wealthByYr).map(Number).sort((a, b) => a - b);
    let firstAhead = null, firstRecover = null, wasBehind = false, deficitMax = 0;
    const delta = {};
    for (const y of yrs) {
      const d = (cur.wealthByYr[y] || 0) - (none.wealthByYr[y] || 0);
      delta[y] = d;
      if (d < -1) { wasBehind = true; deficitMax = Math.min(deficitMax, d); }
      if (wasBehind && firstRecover === null && d >= 0) firstRecover = y;
      if (firstAhead === null && d > 1) firstAhead = y;
    }
    return { beYr: wasBehind ? firstRecover : firstAhead, wasBehind, deficitMax, delta,
             incTax: cur.totTax - none.totTax, yrs, none, cur };
  };

  // NOT VACUOUS. If the fixture failed to install, every figure below is zero and the assertions
  // pass by accident. Assert the preconditions first.
  T("2D fixture: the pre-tax basis is non-zero", rsb.tradInit > 0 ? 1 : 0, 1);
  T("2D fixture: the taxable basis is non-zero", BASE.taxableInit > 0 ? 1 : 0, 1);

  // ── CASE 1 — a real deficit, then recovery ─────────────────────────────────────────────────
  // THE IDENTITY, asserted rather than a household-specific dollar figure: the year-one wealth
  // deficit IS the incremental federal tax, compounded once at the portfolio growth rate. Both
  // runs grow every balance at the same rate and differ only by the dollars the tax removed, so
  // nothing else can produce it. This is what makes the crossover a cash answer rather than an
  // assumption about opportunity cost.
  const one = cross({ ...BASE, horizonYr: 2027, ladderEnd: 2027, ladderEndA: 2027, ladderEndB: 2027 }, 60000);
  T("2D case 1: a $60K conversion IS taxed", one.incTax > 0 ? 1 : 0, 1);
  T("2D case 1: year-one deficit == incremental tax x GROWTH (within rounding)",
    Math.abs(one.delta[2027] + one.incTax * GROWTH) <= 2 ? 1 : 0, 1);
  T("2D case 1: and the household is behind in year one", one.delta[2027] < 0 ? 1 : 0, 1);

  // $30K/yr over the ladder runs a deficit and recovers at 2048; $60K/yr never recovers inside
  // the horizon and is case 3 below. Both on ONE fixture, so the difference is the conversion
  // size and nothing else — which is the point.
  const full = cross(BASE, 30000);
  T("2D case 1: over the full horizon it runs a real deficit", full.wasBehind ? 1 : 0, 1);
  T("2D case 1: and recovers inside the horizon", full.beYr !== null ? 1 : 0, 1);
  T("2D case 1: the reported year is the RECOVERY year, not the first ahead",
    full.delta[full.beYr] >= 0 && full.delta[full.beYr - 1] < 0 ? 1 : 0, 1);

  // ── CASE 2 — never behind ──────────────────────────────────────────────────────────────────
  // A conversion small enough to sit under the standard deduction costs ZERO incremental tax, so
  // there is no deficit and the reported year is the first year AHEAD. This is the branch
  // `beWasBehind ? firstRecover : firstAhead` exists for, and 2D could not confirm it was
  // reachable. It is.
  const never = cross(BASE, 10000);
  T("2D case 2: a $10K conversion costs ZERO incremental tax", never.incTax <= 0 ? 1 : 0, 1);
  T("2D case 2: no year is ever behind", never.wasBehind ? 1 : 0, 0);
  T("2D case 2: year-one delta is exactly zero", never.delta[2027], 0);
  T("2D case 2: a crossover year is still reported", never.beYr !== null ? 1 : 0, 1);

  // ── CASE 3 — does not break even ───────────────────────────────────────────────────────────
  // v5.7.1 made "does not break even" a possible answer; nothing tested that it can still occur.
  const nope = cross(BASE, 60000);
  T("2D case 3: an over-large conversion reports NO break-even (same fixture, size alone)",
    nope.beYr === null ? 1 : 0, 1);
  T("2D case 3: ...and its lifetime tax is HIGHER, unlike the recovering case",
    nope.incTax > full.incTax ? 1 : 0, 1);
  T("2D case 3: ...and it is behind, not merely flat", nope.wasBehind ? 1 : 0, 1);

  // ── THE DISCOUNTING-EQUIVALENCE CLAIM ──────────────────────────────────────────────────────
  // The source comment asserts "comparing same-year wealth = discounting cash flows at the
  // portfolio's own growth rate". VERIFIED, not read: with conversions confined to one year and
  // zero taxable yield, the two runs differ thereafter ONLY by balances, so the delta must
  // compound at exactly GROWTH. A dollar of difference introduced in year Y therefore appears at
  // year N as (1+GROWTH)^(N-Y) — which is precisely discounting at that rate.
  const iso = cross({ ...BASE, horizonYr: 2038, ladderEnd: 2027, ladderEndA: 2027, ladderEndB: 2027 }, 60000);
  let ratiosOK = 1, worst = 0, checked = 0;
  for (let y = 2029; y <= 2038; y++) {
    if (!iso.delta[y - 1]) continue;
    const r = iso.delta[y] / iso.delta[y - 1];
    checked++; worst = Math.max(worst, Math.abs(r - GROWTH));
    if (Math.abs(r - GROWTH) > 0.002) ratiosOK = 0;
  }
  T("2D equivalence: the isolated delta is non-zero (control)", iso.delta[2027] !== 0 ? 1 : 0, 1);
  T("2D equivalence: enough years were actually compared (control)", checked >= 9 ? 1 : 0, 1);
  T("2D equivalence: an isolated delta compounds at GROWTH every year", ratiosOK, 1);
  T("2D equivalence: worst deviation from 1.045 is rounding-scale", worst < 0.002 ? 1 : 0, 1);

  // ── 2D'S RESIDUAL GAP, CLOSED AT v5.29 ──────────────────────────────────────────────────────
  // The selection expression used to live in an anonymous closure inside DangerCloseMain, so this
  // suite reimplemented it and a control that removed the never-behind branch changed nothing.
  // v5.29 extracted it to `rothCrossover`. These assertions call the SHIPPED function, on the same
  // three outcomes verified above — so the reimplementation and the real thing must now agree.
  if (g.rothCrossover) {
    const RC = g.rothCrossover;
    const shipped = (P, conv) => {
      const menu = [{ key: "none", policy: { kind: "fixed", amount: 0 } },
                    { key: "cur",  policy: { kind: "fixed", amount: conv } }];
      const r = g.runRothStrategies({ ...P, currentConv: conv }, menu);
      return RC(r.find(x => x.key === "none").wealthByYr, r.find(x => x.key === "cur").wealthByYr);
    };
    T("2D SHIPPED: case 1 agrees with the suite's reimplementation", shipped(BASE, 30000).beYr, full.beYr);
    T("2D SHIPPED: case 2 (never behind) agrees", shipped(BASE, 10000).beYr, never.beYr);
    T("2D SHIPPED: case 2 reports NOT behind", shipped(BASE, 10000).beWasBehind ? 1 : 0, 0);
    T("2D SHIPPED: case 3 (never breaks even) returns null",
      shipped(BASE, 60000).beYr === null ? 1 : 0, 1);
    // Direct unit cases on synthetic series — no engine, so the branch logic is isolated.
    T("2D SHIPPED unit: deficit then recovery picks the RECOVERY year",
      RC({ 2027: 100, 2028: 200, 2029: 300 }, { 2027: 90, 2028: 195, 2029: 320 }).beYr, 2029);
    T("2D SHIPPED unit: never behind picks the FIRST AHEAD year",
      RC({ 2027: 100, 2028: 200 }, { 2027: 150, 2028: 260 }).beYr, 2027);
    T("2D SHIPPED unit: never recovering returns null",
      RC({ 2027: 100, 2028: 200 }, { 2027: 50, 2028: 150 }).beYr === null ? 1 : 0, 1);
    T("2D SHIPPED unit: the deepest deficit is reported",
      RC({ 2027: 100, 2028: 200 }, { 2027: 50, 2028: 150 }).beDeficitMax, -50);
  }

  g.setPortfolio(SAVED);   // restore t10's empty portfolio for anything added after this block
}
const pass2D = pass - pass2C, fail2D = fail - fail2C;

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 2E — THE STATE-TAX MODULE.  The last sub-phase of Phase 2 (Section C).
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCOPE, per decision D-5 of SCOPE_AUDIT_PHASE2_v5_10_2.md: verify `stateTaxAnnual` against one
// jurisdiction of each of the five archetypes — no-tax, flat, retExempt, excl65, partial-SS — plus
// the maintainer's own state, which is Florida and is already the no-tax case.
//
// THE SCOPE BOUNDARY MATTERS AND IS NOT A DODGE. 2E asks whether the code implements the
// DOCUMENTED APPROXIMATION correctly. Whether an effective flat rate is a good stand-in for a
// progressive state schedule is a disclosed limitation (Field Manual §13 and the module's own
// header), and is therefore not a defect. A state whose modelled treatment contradicts its own
// `note` string IS one.
//
// Every expected figure below was computed by hand from the rule table first, then compared to
// engine output — not read back from the engine. The arithmetic is written out so it can be
// re-checked without running anything.
const pass2E = pass, fail2E = fail;
{
  const S = g.stateTaxAnnual, R = g.STATE_RULES ? g.STATE_RULES() : null;
  if (S && R) {
    // One income shape for every archetype, so the only variable is the jurisdiction.
    const IN = { fallbackRate: 0.05, retIncome: 40000, pen: 20000, work: 10000,
                 capGains: 5000, ssTaxableFed: 30000 };
    const run = (code, persons65) => S({ code, ...IN, persons65 });

    T("2E: the rule table carries all 51 jurisdictions", Object.keys(R).length, 51);

    // ── ARCHETYPE 1 — no tax. FL is also the maintainer's state, so D-5's two requirements meet.
    // Branch: `if (r.rate === 0) return 0`, taken before any other term is evaluated.
    T("2E no-tax (FL): returns zero", run("FL", 2), 0);

    // ── ARCHETYPE 2 — plain flat rate, no exclusions, no SS. AZ at 2.5%.
    // hand: 0.025 x ((40,000 + 20,000) + 10,000 + 0 + 5,000) = 0.025 x 75,000 = 1,875
    T("2E flat (AZ 2.5%): taxes retirement, work and gains alike", run("AZ", 2), 1875);

    // ── ARCHETYPE 3 — retExempt. MS at 4%: ALL retirement income exempt, everything else taxed.
    // hand: 0.04 x (0 + 10,000 + 0 + 5,000) = 600
    T("2E retExempt (MS 4%): retirement excluded, work and gains still taxed", run("MS", 2), 600);

    // ── ARCHETYPE 4 — per-person 65+ exclusion. AL at 4.5%, $6,000 each.
    // hand MFJ:    0.045 x ((60,000 - 12,000) + 10,000 + 0 + 5,000) = 0.045 x 63,000 = 2,835
    // hand single: 0.045 x ((60,000 -  6,000) + 10,000 + 0 + 5,000) = 0.045 x 69,000 = 3,105
    T("2E excl65 (AL 4.5%, MFJ): exclusion applied per person", run("AL", 2), 2835);
    T("2E excl65 (AL 4.5%, single): exclusion is half the MFJ amount", run("AL", 1), 3105);

    // ── ARCHETYPE 5 — partial-SS. MT at 5.65%: ss factor 0.5 AND a $5,500 65+ subtraction, so it
    // exercises two branches at once.
    // hand MFJ:    0.0565 x ((60,000 - 11,000) + 10,000 + 15,000 + 5,000) = 0.0565 x 79,000 = 4,463.50
    // hand single: 0.0565 x ((60,000 -  5,500) + 10,000 + 15,000 + 5,000) = 0.0565 x 84,500 = 4,774.25
    T("2E partial-SS (MT 5.65%, MFJ): half of federally-taxable SS enters the base", run("MT", 2), 4463.5);
    T("2E partial-SS (MT 5.65%, single)", run("MT", 1), 4774.25);
    // NOT VACUOUS: a state with ss=0 on the same inputs must exclude SS entirely, or the assertion
    // above would pass on any implementation that simply ignored the flag.
    T("2E control: an ss=0 state excludes SS from the base",
      run("AZ", 2), 0.025 * 75000);

    // ── ARCHETYPE 6 — the fallback path for an unknown/absent code.
    // hand: 0.05 x ((40,000 + 20,000 + 10,000) + 5,000) = 0.05 x 75,000 = 3,750
    T("2E fallback (no code): flat rate on ordinary + gains", S({ code: null, ...IN, persons65: 2 }), 3750);
    T("2E fallback: an unrecognised code takes the same path",
      S({ code: "ZZ", ...IN, persons65: 2 }), 3750);

    // ── CLAMPS. Each of these is a place a sign error would silently produce a negative tax, and
    // none of them is exercised by the archetype cases above.
    T("2E clamp: an exclusion larger than retirement income cannot go negative",
      S({ code: "AL", fallbackRate: 0, retIncome: 3000, pen: 0, work: 20000, capGains: 0,
          ssTaxableFed: 0, persons65: 2 }), 900);
    T("2E clamp: a capital LOSS is ignored, not deducted",
      S({ code: "AZ", fallbackRate: 0, retIncome: 50000, pen: 0, work: 0, capGains: -30000,
          ssTaxableFed: 0, persons65: 0 }), 1250);
    T("2E clamp: a negative persons65 cannot create a negative exclusion",
      S({ code: "AL", fallbackRate: 0, retIncome: 60000, pen: 0, work: 0, capGains: 0,
          ssTaxableFed: 0, persons65: -5 }), 2700);
    T("2E clamp: a no-tax state ignores the fallback rate entirely",
      S({ code: "FL", fallbackRate: 0.9, retIncome: 1e6, pen: 1e6, work: 1e6, capGains: 1e6,
          ssTaxableFed: 1e6, persons65: 0 }), 0);
    T("2E: a retExempt state exempts retirement income at ANY size",
      S({ code: "MS", fallbackRate: 0, retIncome: 5e5, pen: 2e5, work: 0, capGains: 0,
          ssTaxableFed: 0, persons65: 0 }), 0);

    // ── THE DEFECT TEST D-5 ACTUALLY NAMES: a state whose behaviour contradicts its own note.
    // Scanned across all 51. Seven candidates surfaced; six were dollar figures in the note that
    // are AGI THRESHOLDS or explicitly unmodelled provisions, not exclusions — correct as written.
    // One is a genuine documentation gap and is pinned below.
    let noTaxOK = 0, exclOK = 0;
    for (const c of Object.keys(R)) {
      const r = R[c], n = (r.note || "").toLowerCase();
      if (/no (state )?income tax/.test(n) && r.rate !== 0) noTaxOK++;
      if (r.excl65 > 0 && !/\$\d/.test(n)) exclOK++;
    }
    T("2E notes: every state claiming no income tax really has rate 0", noTaxOK, 0);
    T("2E notes: every state with a 65+ exclusion names a figure in its note", exclOK, 0);

    // [KNOWN DEFECT 2026-08-12 | MT note omits SS] — OPERATIONS §D pin.
    // Montana carries ss: 0.5, so the model taxes half of federally-taxable Social Security there.
    // Its note reads only "$5,500 65+ subtraction" and never mentions Social Security. Every OTHER
    // partial-SS state (CO, CT, MN, NM, RI, UT, VT) says so in its note. The modelling is right and
    // the disclosure is incomplete — the mild form of the defect D-5 names, which is why it is
    // pinned rather than treated as a stop. FLIP THIS PIN when the note is corrected.
    // [FIXED v5.29, was KNOWN DEFECT 2026-08-12] Montana's note now says so. The generalised form
    // is asserted instead of the single state, because the defect was MT being the odd one out:
    // ALL EIGHT partial-SS states must disclose the treatment, and a ninth added later must too.
    //
    // GATED TO v529+ per OPERATIONS §B2. v5.28 and earlier legitimately carry the old MT note, and
    // asserting the correction against them would break the frozen prior-leg replay — the exact
    // mistake made at v5.27 and the reason that rule exists. History asserts the pin; v5.29 asserts
    // the fix. Caught here by the prior leg failing 1, not by remembering.
    const _v = Number(String(VER).replace(/[^0-9]/g, "")) || 0;   // "v529" -> 529
    // The note-vs-code age matcher (see the §2E extinction invariant below for why the range
    // excludes exactly 65 and why it recognises only two phrasings). Declared HERE rather than
    // at its use site because two sibling version blocks both need it.
    const _AGE_NOTE = /\bfrom age (5\d|6[0-46-9]|7\d)\b|\b(5\d|6[0-46-9]|7\d)\+/;
    if (_v >= 529) {
      T("[FIXED v5.29] every partial-SS state discloses SS treatment in its note",
        Object.keys(R).filter(c => R[c].ss > 0 && !/social security|\bss\b/i.test(R[c].note || "")).length, 0);
    } else {
      T("[KNOWN DEFECT 2026-08-12, pre-v5.29] MT taxes SS and its note does not say so",
        /social security|\bss\b/i.test(R.MT.note || "") ? 1 : 0, 0);
    }
    T("2E control: there really are eight partial-SS states (not vacuous)",
      Object.keys(R).filter(c => R[c].ss > 0).length, 8);
    T("2E: and no state claims SS treatment it does not model",
      Object.keys(R).filter(c => !R[c].ss && /\bss (is )?taxed|taxes social security/i.test(R[c].note || "")).length, 0);

    // ── D-3c DOLLAR-EXACT. Deliberately NOT numbered as an archetype: §2E's header names the five
    // rule-table archetypes D-5 scoped, and this is not a sixth. It is a measurement of how far one
    // of them sits from the statute. An exclusion that is INCOME-LIMITED IN LAW and applied
    // UNCONDITIONALLY by `stateTaxAnnual`. New Jersey. Archetypes 1-6 above ask whether the code
    // implements the documented approximation correctly; this one measures, in dollars, how far the
    // documented approximation is from the statute. It is the INSTRUMENT, NOT THE REPAIR —
    // SCOPE_STATE_FIXTURES §4 is explicit that fixing D-3c is a separate job, and this block does
    // not reopen it.
    //
    // ⚠ NJ IS ONE MECHANISM OF AT LEAST THREE, not "the" D-3c case. The 65+ exclusion class is
    // wrong in at least three distinct ways, and only the first is what this block measures:
    //   1. INCOME-LIMITED IN LAW, APPLIED UNCONDITIONALLY  — NJ. Measured below.
    //   2. REDUCED BY SOCIAL SECURITY RECEIVED             — MD, ME, CO. Nothing in this project
    //      models it; `boundaries.mjs`'s state_excl_limited row cannot see it. Disclosed at v5.54,
    //      not modelled. See docs/AUDIT_STATE_EXCL65_NOTES.md.
    //   3. AGE THRESHOLD BELOW 65                          — KY has NO age test at all, DE is 60,
    //      NJ itself is 62, SC is tiered. `excl65 * persons65` can only express "65 or over", so
    //      every such state is UNDER-applied for ages threshold-to-64. Direction is CONSERVATIVE,
    //      the opposite of (1) and (2). See docs/AUDIT_STATE_EXCL65_ROUND2.md §0.
    //
    // Household: MFJ, both 65+, NJ, RETIREMENT INCOME ONLY — no SS (NJ excludes it from gross
    // income entirely), no wages, no gains. Total income therefore equals retirement income, which
    // is what makes the exclusion band unambiguous.
    //
    // SOURCES — NJ Division of Taxation, not a summary site and not the model's own `note`:
    //   [S1] Retirement Income Exclusions, nj.gov/treasury/taxation/njit7.shtml
    //   [S2] Tax Rate Schedules (Table B, MFJ)
    //   [S3] Personal exemptions: $1,000 each + $1,000 each at 65+ = $4,000 for this household
    //
    // NJ's exclusion is a percentage OF PENSION INCOME (capped at $100,000 MFJ), not a percentage
    // of the cap — the distinction that makes $120,000 exclude $60,000 rather than $50,000:
    //   income <= $100,000  -> 100%      $100,001-125,000 -> 50%
    //   $125,001-150,000    ->  25%      above $150,000   ->  0%
    //
    // | income   | NJ excl  | NJ base  | NJ tax [S2] | after exempt [S3] | model excl | model tax |
    // | $ 90,000 | $ 90,000 | $      0 | $     0.00  | $     0.00        | $ 90,000   | $    0.00 |
    // | $120,000 | $ 60,000 | $ 60,000 | $ 1,050.00  | $   952.00        | $120,000   | $    0.00 |
    // | $140,000 | $ 35,000 | $105,000 | $ 3,026.25  | $ 2,805.25        | $140,000   | $    0.00 |
    // | $200,000 | $      0 | $200,000 | $ 8,697.50  | $ 8,442.70        | $150,000   | $2,750.00 |
    //
    // NJ hand-arithmetic, Table B MFJ, each bracket walked independently of the subtract form:
    //   $ 60,000 base -> 2.45%  band: 0.0245 x  60,000 -   420.00 = $1,050.00
    //   $105,000 base -> 5.525% band: 0.05525 x 105,000 - 2,775.00 = $3,026.25
    //   $200,000 base -> 6.37%  band: 0.0637 x 200,000 - 4,042.50 = $8,697.50
    //
    // MODEL hand-arithmetic: excl = 75,000 x 2 = 150,000, unconditional at every income.
    //   retBase = max(0, income - 150,000);  tax = 0.055 x retBase
    //   $ 90,000 -> max(0, -60,000) = 0        -> $0.00
    //   $120,000 -> max(0, -30,000) = 0        -> $0.00
    //   $140,000 -> max(0, -10,000) = 0        -> $0.00
    //   $200,000 -> max(0,  50,000) = 50,000   -> 0.055 x 50,000 = $2,750.00
    const NJ = inc => S({ code: "NJ", fallbackRate: 0, retIncome: inc, pen: 0, work: 0,
                          capGains: 0, ssTaxableFed: 0, persons65: 2 });

    T("2E D-3c (NJ, MFJ 65+): $90,000 — below the limit, model and statute agree",  NJ(90000),  0);
    T("2E D-3c (NJ, MFJ 65+): $120,000 — model shields everything",                 NJ(120000), 0);
    T("2E D-3c (NJ, MFJ 65+): $140,000 — model still shields everything",           NJ(140000), 0);
    T("2E D-3c (NJ, MFJ 65+): $200,000 — model taxes only income above $150,000",   NJ(200000), 2750);

    // NOT VACUOUS. $90,000 is the AGREEMENT point: below NJ's threshold the statute also shields
    // everything, so this case set cannot be read as "the model is simply always wrong". Without
    // it, an implementation that returned 0 for every NJ input would pass three of the four.
    T("2E D-3c control: the $90,000 agreement point is a real agreement, not a shared zero",
      NJ(90000) === 0 && NJ(200000) > 0 ? 1 : 0, 1);

    // [KNOWN DEFECT 2026-08-29 | NJ exclusion applied unconditionally] — OPERATIONS §D pin.
    // The gap is asserted, not just the model's output, so the pin records WHAT is wrong and BY HOW
    // MUCH. Comparison is against the NO-EXEMPTION column: the model has no personal-exemption
    // concept, so that is the comparable quantity. The after-exemption figures are carried in the
    // table above so the household's actual liability is on the record and this test cannot be
    // accused of picking the flattering comparison.
    // FLIP THESE PINS when D-3c is fixed — at that point NJ(120000) should be 1050, NJ(140000)
    // should be 3026.25, and the gaps go to zero.
    //
    // ⚠ NO VERSION GATE TODAY, AND THAT IS A DECISION, NOT AN OVERSIGHT (OPERATIONS §B2).
    // This block adds no source change, so all four figures are true on BOTH legs of every pair
    // that replays it. THE MOMENT D-3c IS FIXED, THESE PINS NEED A GATE — the frozen prior leg will
    // legitimately carry the unconditional behaviour, and asserting the fix against it is exactly
    // the v5.27 mistake §B2 exists to prevent. §2E already has the `_v` variable for that purpose,
    // used by the Montana pin above. Write the gate in the same release as the fix, not later.
    T("[KNOWN DEFECT 2026-08-29] NJ $120,000: model understates by the full statutory tax",
      Number((1050.00 - NJ(120000)).toFixed(2)), 1050.00);
    T("[KNOWN DEFECT 2026-08-29] NJ $140,000: model understates by the full statutory tax",
      Number((3026.25 - NJ(140000)).toFixed(2)), 3026.25);
    T("[KNOWN DEFECT 2026-08-29] NJ $200,000: model understates by $5,947.50",
      Number((8697.50 - NJ(200000)).toFixed(2)), 5947.50);

    // THE TWO ERRORS HAVE OPPOSITE SIGNS, which is why a single wrong figure cannot be blamed on
    // either alone. Decomposed at $200,000, one term at a time:
    //   model as shipped                                    $ 2,750.00
    //   correct exclusion ($0), model's flat 5.5%            $11,000.00   exclusion: +$8,250.00
    //   + NJ Table B graduated schedule                      $ 8,697.50   rate:      -$2,302.50
    // The exclusion error is OPTIMISTIC and larger; the flat-rate error is CONSERVATIVE and
    // smaller; the net is optimistic, which is the direction this project treats as the wrong way
    // to be wrong.
    T("2E D-3c: the flat-rate term alone would OVERstate, so the net error is not one effect",
      Number((0.055 * 200000 - 8697.50).toFixed(2)), 2302.50);

    // ⚠ GATED TO v555+ per OPERATIONS §B2. v5.54 and earlier legitimately apply a hardcoded 65 at
    // every state, and asserting the fix against them breaks the frozen prior-leg replay — the
    // v5.27 mistake. The else-branch pins the pre-fix behaviour so the flip is self-verifying.
    if (_v >= 555) {
      // ── AGE FLOOR (v5.55). `excl65` used to be gated on a hardcoded 65 at all three call sites.
      // The states do not agree on 65: Kentucky attaches NO age test in law, Delaware's starts at 60.
      // `STATE_RULES.exclAge` carries a state's own floor and is absent for the 47 that use 65.
      // Verified against KY DOR Schedule M and 30 Del. C. §1106 — docs/AUDIT_STATE_EXCL65_ROUND2.md.
      //
      // ⚠ DIRECTION: this makes the estimate LOWER, not higher. The old behaviour withheld a real
      // statutory exclusion and so OVERSTATED state tax — the conservative direction, which is why it
      // survived undisclosed. Correct beat conservative here by decision (scope D-c).
      const AGE = (code, ageA, ageB, over) =>
        S({ code, fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ageA, ageB, single: !!over });

      // hand KY ($31,110 each, NO floor). The EXCLUSION is unchanged by v5.57; only the RATE moves.
      //   base = 100,000 - 62,220 = 37,780
      //   pre-v5.57  0.040 x 37,780 = 1,511.20
      //   v5.57+     0.035 x 37,780 = 1,322.30   (HB 1, 2025 — KRS 141.020, effective TY2026)
      // ⚠ GATED ON THE VERSION TAG, and NOT on a rate read back from STATE_RULES. A pin that
      //   sources its expectation from the app agrees with the app when the app is wrong, which
      //   is exactly the defect this release corrects. (scope D-3)
      const _kyAge = _v >= 557 ? 1322.30 : 1511.20;
      T(`2E age (KY, no statutory age test): a 60-year-old couple gets the full exclusion — $${_kyAge}`,
        AGE("KY", 60, 60), _kyAge);
      T(`2E age (KY): and so does a 45-year-old couple — there is no floor to clear — $${_kyAge}`,
        AGE("KY", 45, 45), _kyAge);
      // hand DE (rate 5.5%, $12,500 each, floor 60):
      //   61/61 -> 0.055 x (100,000 - 25,000) = 4,125.00
      //   59/59 -> 0.055 x  100,000           = 5,500.00
      //   61/59 -> 0.055 x (100,000 - 12,500) = 4,812.50
      T("2E age (DE, floor 60): both spouses over the floor get one exclusion each",
        AGE("DE", 61, 61), 4125.00);
      T("2E age (DE, floor 60): both under the floor get nothing",
        AGE("DE", 59, 59), 5500.00);
      T("2E age (DE, floor 60): one each side of the floor gets exactly one exclusion",
        AGE("DE", 61, 59), 4812.50);

      // NOT VACUOUS, and this is the assertion that would have caught a global floor change:
      // a state with NO exclAge must still use 65. AL's statutory floor IS 65, so it must not move.
      // hand AL (4.5%, $6,000 each): 65/65 -> 0.045 x (100,000 - 12,000) = 3,960.00
      //                              64/64 -> 0.045 x  100,000           = 4,500.00
      T("2E age control: a state with no exclAge still uses 65 (AL, both 65)", AGE("AL", 65, 65), 3960.00);
      T("2E age control: and denies it one year earlier (AL, both 64)",       AGE("AL", 64, 64), 4500.00);
      if (_v >= 560) {
        T("2E age control: exactly four states carry an exclAge",
          Object.keys(R).filter(c => R[c].exclAge !== undefined).length, 4);
        T("2E age control: and they are DE, KY, RI and WI",
          Object.keys(R).filter(c => R[c].exclAge !== undefined).sort().join(",") === "DE,KY,RI,WI" ? 1 : 0, 1);
      } else {
        T("2E age control: exactly two states carry an exclAge",
          Object.keys(R).filter(c => R[c].exclAge !== undefined).length, 2);
        T("2E age control: and they are KY and DE",
          Object.keys(R).filter(c => R[c].exclAge !== undefined).sort().join(",") === "DE,KY" ? 1 : 0, 1);
      }

      // ── EXTINCTION INVARIANTS (OPERATIONS §D). Each pins a defect class shut, not a figure.
      // [1] The two thresholds v5.55 deliberately does NOT model. Decisions D-d and D-e.
      //     NJ's cap is a HOUSEHOLD amount, so applying its 62 floor alone would grant a 62-64 couple
      //     $150,000 against a $100,000 statutory cap — worse, not better. SC's under-65 rule is a
      //     second AMOUNT, not an earlier start, and exclAge cannot express it.
      T("[BY DECISION v5.55] NJ carries no exclAge — its 62 floor is disclosed, not modelled",
        R.NJ.exclAge === undefined ? 1 : 0, 1);
      T("[BY DECISION v5.55] SC carries no exclAge — its under-65 tier is a second amount, not a floor",
        R.SC.exclAge === undefined ? 1 : 0, 1);
      // [2] A state that claims an age in its note must not silently keep the 65 default. This is the
      //     class the whole release exists to close: note said 60, code said 65, nothing compared them.
      //
      //     ⚠ v5.60 WIDENED THE AGE RANGE, and the widening is not "past 64" — that was the obvious
      //     reading and it is wrong. The engine's default floor IS 65, so a note reading "65+" beside
      //     no exclAge is AGREEMENT, not a defect: extending the range to 6\d flags CO, GA, LA, MT,
      //     NM, VA and WV, all of them correct. 65 is the one value that must be EXCLUDED, not the
      //     top of the range — hence 6[0-46-9]. Measured, not reasoned: the naive widening returned
      //     eight states against shipped v5.59 and this one returns exactly WI.
      //
      //     ⚠ AND THE MATCHER RECOGNISES EXACTLY TWO PHRASINGS — "from age NN" and "NN+". Rhode
      //     Island's v5.59 note said "requires full retirement age (67)" and was therefore invisible
      //     to this invariant in ANY widening, which is half of why the v5.60 defect survived v5.55.
      //     RI's note now says "from age 67" so the check can see it. A third state wording an age
      //     some other way would be invisible again; that limitation is recorded in TESTING.md
      //     rather than papered over with a longer phrase list.
      const _ageNoteOffenders = (pat) => Object.keys(R).filter(c => {
        const n = (R[c].note || "").toLowerCase();
        if (R[c].exclAge !== undefined) return false;                 // already modelled
        if (!R[c].excl65) return false;                               // no exclusion to gate
        if (/\bnot modelled\b|\bnot modeled\b|\bdisclosed\b/.test(n)) return false;  // deliberate, stated
        return pat.test(n);
      });
      if (_v >= 560) {
        T("2E notes: no state's note names an age other than 65 while its code still uses 65",
          _ageNoteOffenders(_AGE_NOTE).length, 0);
      } else {
        // The frozen leg carries the defect, so the WIDENED matcher must FIRE here. This is the
        // invariant's own non-vacuity proof, made permanent: if a future edit narrows the pattern
        // back, this pin fails on the prior leg rather than passing silently on both.
        T("[KNOWN DEFECT pre-v5.60] the widened matcher fires on WI, whose note named a 67 floor its code did not apply",
          _ageNoteOffenders(_AGE_NOTE).join(",") === "WI" ? 1 : 0, 1);
        T("[KNOWN DEFECT pre-v5.60] and RI is absent from that set — its wording was invisible to the matcher, not merely out of range",
          _ageNoteOffenders(_AGE_NOTE).includes("RI") ? 1 : 0, 0);
      }
      // [3] The D-3c pins above measure a 65+ household. This release must not move them.
      T("2E age: the D-3c NJ case set is untouched by the age work (65+ household)",
        S({ code: "NJ", fallbackRate: 0, retIncome: 200000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ageA: 65, ageB: 65 }), 2750);
      // [4] The legacy count path must still work for a caller that supplies no ages, or a partial
      //     caller would silently receive NO exclusion instead of the old behaviour.
      T("2E age: a caller supplying persons65 and no ages still gets the old behaviour",
        S({ code: "AL", fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, persons65: 2 }), 3960.00);
    } else {
      // [KNOWN DEFECT pre-v5.55] every state's exclusion was gated on a hardcoded 65, so a state
      // with a lower statutory floor — or none at all — withheld a real exclusion. CONSERVATIVE
      // direction: it overstated state tax. These flip at v5.55.
      T("[KNOWN DEFECT pre-v5.55] KY's exclusion was withheld below 65 despite no statutory age test",
        S({ code: "KY", fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ageA: 60, ageB: 60 }), 0.04 * 100000);
      T("[KNOWN DEFECT pre-v5.55] DE's exclusion was withheld from 60-64 despite a statutory floor of 60",
        S({ code: "DE", fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ageA: 61, ageB: 61 }), 0.055 * 100000);
      T("[KNOWN DEFECT pre-v5.55] no state carried an exclAge field at all",
        Object.keys(R).filter(c => R[c].exclAge !== undefined).length, 0);
    }

    // ── SS OFFSET (v5.56). Maryland and Maine reduce the exclusion DOLLAR-FOR-DOLLAR by the Social
    // Security each taxpayer actually RECEIVED. Sources: Comptroller of MD, Maryland Pension
    // Exclusion KB0010012 / Worksheet 13A; Maine Revenue Services Individual Income Tax FAQ and the
    // 2025 Form 1040ME instructions. Recorded in docs/AUDIT_STATE_EXCL65_NOTES.md §1.
    //
    // ⚠ DIRECTION: this RAISES the estimate. The old treatment granted the full exclusion whatever
    // the household's Social Security, which OVERSTATED it — the optimistic direction, and the only
    // one of the three exclusion mechanisms that erred that way.
    //
    // ⚠ GROSS, NOT `ssTaxableFed`. Both statutes count benefits RECEIVED — Maine's says taxable and
    // nontaxable explicitly. `ssTaxableFed` is at most 85% and often far less, so wiring it in here
    // would under-apply the offset. The gross-vs-taxable case below is what catches that mistake.
    if (_v >= 556) {
      const OFF = (code, retIncome, ssA, ssB, rate) =>
        S({ code, fallbackRate: 0, retIncome, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0,
            ssGrossA: ssA, ssGrossB: ssB, ageA: 65, ageB: 65 });
      // hand MD (cap $40,600 each, 7.5%, retIncome $120,000):
      //   SS 0      -> excl 2 x 40,600 = 81,200 -> 0.075 x  38,800 = 2,910.00
      //   SS 10k ea -> excl 2 x 30,600 = 61,200 -> 0.075 x  58,800 = 4,410.00
      //   SS 40k ea -> excl 2 x    600 =  1,200 -> 0.075 x 118,800 = 8,910.00
      //   SS 50k ea -> excl 0 (floored, NOT -9,400 each) -> 0.075 x 120,000 = 9,000.00
      T("2E ssOffset (MD): zero Social Security leaves the exclusion whole", OFF("MD",120000,0,0),      2910.00);
      T("2E ssOffset (MD): $10,000 each reduces it dollar-for-dollar",      OFF("MD",120000,10000,10000), 4410.00);
      T("2E ssOffset (MD): $40,000 each all but eliminates it",             OFF("MD",120000,40000,40000), 8910.00);
      T("2E ssOffset (MD): above the cap it FLOORS at zero, never negative",OFF("MD",120000,50000,50000), 9000.00);
      // hand ME (cap $48,216 each, 7.15%, retIncome $150,000):
      //   SS 0      -> excl 96,432 -> 0.0715 x  53,568 = 3,830.11 (3,830.112 -> banker-free round)
      //   SS 20k ea -> excl 56,432 -> 0.0715 x  93,568 = 6,690.11
      //   SS 50k ea -> excl 0      -> 0.0715 x 150,000 = 10,725.00
      T("2E ssOffset (ME): zero Social Security leaves the deduction whole", OFF("ME",150000,0,0),         3830.112);
      T("2E ssOffset (ME): $20,000 each reduces it dollar-for-dollar",       OFF("ME",150000,20000,20000), 6690.112);
      T("2E ssOffset (ME): above the cap the deduction is gone entirely",    OFF("ME",150000,50000,50000), 10725.00);

      // THE ASSERTION THAT JUSTIFIES THE REWRITE. Before v5.56 the exclusion was `cap x count`, and
      // a count cannot distinguish these two households — same total SS, same number of qualifying
      // people, DIFFERENT statutory exclusion, because each person's offset floors independently.
      //   10k/50k -> (40,600-10,000) + (40,600-40,600 floored at 0... no: 40,600-50,000 -> 0)
      //           -> 30,600 + 0 = 30,600 -> 0.075 x 89,400 = 6,705.00
      //   30k/30k -> 10,600 + 10,600 = 21,200 -> 0.075 x 98,800 = 7,410.00
      T("2E ssOffset (MD): asymmetric spouses — $10k/$50k", OFF("MD",120000,10000,50000), 6705.00);
      T("2E ssOffset (MD): and the SAME TOTAL split evenly gives a DIFFERENT answer",
        OFF("MD",120000,30000,30000), 7410.00);
      T("2E ssOffset: the two differ — a per-person offset is not expressible as a count",
        OFF("MD",120000,10000,50000) === OFF("MD",120000,30000,30000) ? 0 : 1, 1);

      // GROSS, NOT TAXABLE. ssTaxableFed is deliberately 0 in every case above; if someone rewires
      // the offset to read it, every MD/ME assertion above returns the unoffset figure and this
      // case pins the reason.
      T("2E ssOffset: the offset reads GROSS SS — ssTaxableFed does not drive it",
        S({ code: "MD", fallbackRate: 0, retIncome: 120000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 99999, ssGrossA: 50000, ssGrossB: 50000, ageA: 65, ageB: 65 }), 9000.00);

      // ── EXTINCTION INVARIANTS
      T("[BY DECISION v5.56] exactly two states carry ssOffset",
        Object.keys(R).filter(c => R[c].ssOffset).length, 2);
      T("[BY DECISION v5.56] and they are MD and ME",
        Object.keys(R).filter(c => R[c].ssOffset).sort().join(",") === "MD,ME" ? 1 : 0, 1);
      // CO is deliberately NOT flagged: its $24K is a SHARED CAP covering SS and pension together,
      // not a dollar-for-dollar reduction of one by the other. A third mechanism, out of scope.
      T("[BY DECISION v5.56] CO carries no ssOffset — its shared cap is a different mechanism",
        R.CO.ssOffset === undefined ? 1 : 0, 1);
      // Every ssOffset state must SAY so. This is the class the release closes: the offset was the
      // dominant effect for MD and ME and the notes did not mention it until v5.54.
      T("2E ssOffset: every flagged state's note names the Social Security reduction",
        Object.keys(R).filter(c => R[c].ssOffset &&
          !/reduced dollar-for-dollar by the social security/i.test(R[c].note || "")).length, 0);
      // The statutory amounts were corrected in the same release (decision D-c).
      T("2E ssOffset (MD): the modelled cap is the current statutory figure", R.MD.excl65, 40600);
      T("2E ssOffset (ME): the modelled cap is the current statutory figure", R.ME.excl65, 48216);
      // AND THE OTHER TWO MECHANISMS MUST NOT MOVE.
      T("2E ssOffset: the D-3c NJ pins are untouched (NJ has no ssOffset)",
        S({ code: "NJ", fallbackRate: 0, retIncome: 200000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ssGrossA: 40000, ssGrossB: 40000, ageA: 65, ageB: 65 }), 2750);
      // KY carries no ssOffset, so Social Security must not touch its exclusion on EITHER build.
      // The figure moves at v5.57 for the RATE alone — same gate, same reason.
      T("2E ssOffset: the v5.55 age floors are untouched (KY has no ssOffset)",
        S({ code: "KY", fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ssGrossA: 30000, ssGrossB: 30000, ageA: 60, ageB: 60 }),
        _v >= 557 ? 1322.30 : 1511.20);
      // —— v5.57 EXTINCTION · a rate and the note describing it must not drift apart ——
      // THE CLASS THIS CLOSES. Kentucky carried 4% in code and 3.5% in law for eight months and
      // nothing compared the two. The note is the only place a reader sees which YEAR a rate
      // belongs to, so moving the constant and leaving the note is the same defect in other
      // clothes — the v5.55 finding was its mirror ("the note is right and the code is wrong").
      if (_v >= 557) {
        // ⚠ AS A BOOLEAN, NOT AS A NUMBER. `T` compares with EPS = $0.01, a tolerance sized for
        //   DOLLAR figures. A RATE differs by 0.005 here, so the numeric form passed against a
        //   reverted 4% build and would pass for anything from 2.5% to 4.5% — vacuous coverage of
        //   exactly the constant this release corrects. Found by negative control C1, not by review.
        T("[EXTINCTION v5.57] KY's modelled rate is exactly 3.5%",
          R.KY.rate === 0.035 ? 1 : 0, 1);
        T("[EXTINCTION v5.57] and KY's note states that rate, so moving one without the other fails",
          /\b3\.5\s*%/.test(R.KY.note) ? 1 : 0, 1);
        T("[EXTINCTION v5.57] KY's note names the year the rate takes effect",
          /\b2026\b/.test(R.KY.note) ? 1 : 0, 1);
        T("[EXTINCTION v5.57] and cites the enacting act, not a secondary source",
          /HB\s*1\b/.test(R.KY.note) && /141\.020/.test(R.KY.note) ? 1 : 0, 1);
        // DE was AUDITED and found CORRECT at v5.57 — HB 108 never left committee. Pinned so a
        // future session does not "fix" it toward a bill that is not law.
        T("[BY DECISION v5.57] DE stays $12,500 — HB 108 was introduced, never enacted",
          R.DE.excl65, 12500);
        T("[BY DECISION v5.57] and DE's note discloses that military pensions differ and are unmodelled",
          /military pension/i.test(R.DE.note) ? 1 : 0, 1);
      } else {
        T("[KNOWN DEFECT pre-v5.57] KY carried exactly 4% after the statute moved to 3.5%",
          R.KY.rate === 0.04 ? 1 : 0, 1);   // boolean for the same EPS reason as above
        T("[KNOWN DEFECT pre-v5.57] and its note named no rate year at all",
          /\b2026\b/.test(R.KY.note) ? 1 : 0, 0);
      }

      // ─── v5.59 · Rhode Island and Wisconsin `excl65` carried SUPERSEDED amounts ───
      // SCOPE_EXCL65_STALE_RI_WI.md / AUDIT_STATE_EXCL65_ROUND4.md §2b, §2c. RI carried $20,000 —
      // the TY2023-24 figure; RIGL § 44-30-12(c)(9) as amended by P.L. 2024 ch. 117 art. 6 § 21 is
      // $50,000 per qualifying person for TY2025+. WI carried $5,000 — the older income-tested
      // provision; Wis. Stat. § 71.05(6)(b)54m. (2025 Wis. Act 15) is $24,000 at 67+, no income limit.
      // Before this block NO assertion in the suite named RI or WI (AST walk, 2026-09-02), so a build
      // with either stale figure restored passed every check that existed. Direction of the figure
      // move: CONSERVATIVE-toward-statute for qualifying households. What is NOT modelled and is
      // pinned as disclosed rather than fixed: the 67 floor in both states (model applies from 65),
      // RI's AGI cliff, and RI's IRA-vs-employer-plan distinction.
      //
      // Every expected figure was computed by hand from the rule table BEFORE the engine ran:
      //   RI: both 68, retIncome 80,000, taxable SS 40,800, no pension, rate 0.05, ss 0.5
      //       excl 2 x 50,000 = 100,000 >= 80,000 -> retBase 0; ssBase 0.5 x 40,800 = 20,400
      //       -> 0.05 x 20,400 = 1,020.00      (pre-fix: excl 40,000 -> 0.05 x 60,400 = 3,020.00)
      //   WI: both 68, retIncome 60,000, taxable SS 40,800, rate 0.053, ss 0
      //       excl 2 x 24,000 = 48,000 -> retBase 12,000 -> 0.053 x 12,000 = 636.00
      //                                        (pre-fix: excl 10,000 -> 0.053 x 50,000 = 2,650.00)
      const RIWI = (code, retIncome) =>
        S({ code, fallbackRate: 0, retIncome, pen: 0, work: 0, capGains: 0, ssTaxableFed: 40800,
            ssGrossA: 24000, ssGrossB: 24000, ageA: 68, ageB: 68 });
      if (_v >= 559) {
        // Figures as BOOLEAN IDENTITIES, per the v5.57 EPS lesson — these are dollar constants so the
        // numeric form would also work, but the identity form cannot go vacuous if EPS is ever widened.
        T("[EXTINCTION v5.59] RI's modelled exclusion is exactly $50,000 per person (TY2025+)",
          R.RI.excl65 === 50000 ? 1 : 0, 1);
        T("[EXTINCTION v5.59] and RI's note states that figure, so moving one without the other fails",
          /\$50,000/.test(R.RI.note) ? 1 : 0, 1);
        T("[EXTINCTION v5.59] RI hand case: a qualifying 68/68 couple pays tax on half of SS only",
          RIWI("RI", 80000), 1020.00);
        if (_v >= 560) {
          T("[APPLIED v5.60] RI's note names the full-retirement-age floor AND the model applies it",
            /full retirement age/i.test(R.RI.note) && /\b67\b/.test(R.RI.note) && R.RI.exclAge === 67 ? 1 : 0, 1);
        } else {
          T("[KNOWN DEFECT pre-v5.60] RI's note named the full-retirement-age floor the model did not apply",
            /full retirement age/i.test(R.RI.note) && /\b67\b/.test(R.RI.note) && R.RI.exclAge === undefined ? 1 : 0, 1);
        }
        T("[DISCLOSED v5.59] RI's note names the IRA exclusion and the AGI cliff, dated to TY2025",
          /IRA/.test(R.RI.note) && /cliff/i.test(R.RI.note) && /TY2025: \$133,500/.test(R.RI.note) ? 1 : 0, 1);
        T("[EXTINCTION v5.59] WI's modelled exclusion is exactly $24,000 per person (2025 Wis. Act 15)",
          R.WI.excl65 === 24000 ? 1 : 0, 1);
        T("[EXTINCTION v5.59] and WI's note states that figure",
          /\$24,000/.test(R.WI.note) ? 1 : 0, 1);
        T("[EXTINCTION v5.59] WI hand case: a qualifying 68/68 couple is taxed on income above 2 x $24,000",
          RIWI("WI", 60000), 636.00);
        if (_v >= 560) {
          T("[APPLIED v5.60] WI's note names the 67 floor AND the model applies it",
            /\b67\b/.test(R.WI.note) && R.WI.exclAge === 67 ? 1 : 0, 1);
        } else {
          T("[KNOWN DEFECT pre-v5.60] WI's note named the 67 floor the model did not apply",
            /\b67\b/.test(R.WI.note) && R.WI.exclAge === undefined ? 1 : 0, 1);
        }
        // Decision D-F (ROUND4 §6): WI LEAVES t29's F-6 income-limited guarded set by wording alone —
        // its $24,000 provision has no income test, so "income-limited" would be false. RI STAYS: its
        // AGI cliff IS an income limit. Both pinned here with the SAME regex t29 L212 executes, so the
        // deliberate 5 -> 4 shrink is asserted rather than left to a `length > 0` guard.
        T("[BY DECISION v5.59] WI's note does not match the F-6 income-limited matcher (not income-tested in law)",
          /income[- ]limited|income limit/i.test(R.WI.note) ? 1 : 0, 0);
        T("[BY DECISION v5.59] RI's note still matches it (the AGI cliff is an income limit)",
          /income[- ]limited|income limit/i.test(R.RI.note) ? 1 : 0, 1);
      } else {
        T("[KNOWN DEFECT pre-v5.59] RI carried the TY2023-24 $20,000 after the statute moved to $50,000",
          R.RI.excl65 === 20000 ? 1 : 0, 1);
        T("[KNOWN DEFECT pre-v5.59] RI hand case at the stale figure",
          RIWI("RI", 80000), 3020.00);
        T("[KNOWN DEFECT pre-v5.59] WI carried the superseded income-tested $5,000",
          R.WI.excl65 === 5000 ? 1 : 0, 1);
        T("[KNOWN DEFECT pre-v5.59] WI hand case at the stale figure",
          RIWI("WI", 60000), 2650.00);
      }

      // ─── v5.60 · Rhode Island and Wisconsin gate at 67, not at the model's default 65 ───
      // SCOPE_EXCL_AGE_RI_WI.md / AUDIT_STATE_EXCL65_ROUND4.md §2b, §2c, §6 D-D. Both statutes
      // gate on full retirement age: RIGL § 44-30-12(c)(9) ties the pension/annuity modification to
      // "the age used for calculating full or unreduced Social Security retirement benefits" — 67
      // for anyone born 1960 or later — and Wis. Stat. § 71.05(6)(b)54m. reads "67 or over".
      // The model applied both from 65, so a 65- or 66-year-old received an exclusion the statute
      // denies. v5.59 made that error LARGER by correcting the amounts ($20K->$50K, $5K->$24K).
      // Direction: CONSERVATIVE in every cell — tax rises or stays flat, never falls.
      //
      // Nothing else moves. `exclAge` already existed and is read in exactly ONE place (the `_floor`
      // const in stateTaxAnnual), so this is two properties and no engine code.
      //
      // Every figure below was hand-computed from the rule table BEFORE the engine ran:
      //   RI  rate 0.05, ss 0.5, cap 50,000, retIncome 80,000, taxable SS 40,800 -> ssBase 20,400
      //     66/66  no one qualifies -> excl 0      -> 0.05 x (80,000 + 20,400) = 5,020.00
      //     68/66  one qualifies    -> excl 50,000 -> 0.05 x (30,000 + 20,400) = 2,520.00
      //     68/68  both qualify     -> excl 100,000, retBase floors at 0 -> 0.05 x 20,400 = 1,020.00
      //   WI  rate 0.053, ss 0, cap 24,000, retIncome 60,000 -> ssBase 0
      //     66/66  excl 0      -> 0.053 x 60,000 = 3,180.00
      //     68/66  excl 24,000 -> 0.053 x 36,000 = 1,908.00
      //     68/68  excl 48,000 -> 0.053 x 12,000 =   636.00
      //
      // The MIXED-AGE rows are the load-bearing ones: a household-level implementation of the floor
      // would pass 66/66 and 68/68 and fail 68/66. They are why this block is not just two identities.
      const RIWI_AGE = (code, retIncome, ageA, ageB) =>
        S({ code, fallbackRate: 0, retIncome, pen: 0, work: 0, capGains: 0, ssTaxableFed: 40800,
            ssGrossA: 24000, ssGrossB: 24000, ageA, ageB });
      if (_v >= 560) {
        T("[EXTINCTION v5.60] RI gates its exclusion at 67, the statutory full retirement age",
          R.RI.exclAge === 67 ? 1 : 0, 1);
        T("[EXTINCTION v5.60] WI gates its exclusion at 67 (Wis. Stat. § 71.05(6)(b)54m.)",
          R.WI.exclAge === 67 ? 1 : 0, 1);
        T("[EXTINCTION v5.60] RI denies the exclusion to a 66/66 couple, as the statute does",
          RIWI_AGE("RI", 80000, 66, 66), 5020.00);
        T("[EXTINCTION v5.60] WI denies the exclusion to a 66/66 couple, as the statute does",
          RIWI_AGE("WI", 60000, 66, 66), 3180.00);
        T("[EXTINCTION v5.60] RI grants ONE exclusion at 68/66 — the floor is per person, not per return",
          RIWI_AGE("RI", 80000, 68, 66), 2520.00);
        T("[EXTINCTION v5.60] WI grants ONE exclusion at 68/66 — the floor is per person, not per return",
          RIWI_AGE("WI", 60000, 68, 66), 1908.00);
        T("[EXTINCTION v5.60] and the qualifying 68/68 RI couple is UNCHANGED from v5.59",
          RIWI_AGE("RI", 80000, 68, 68), 1020.00);
        T("[EXTINCTION v5.60] and the qualifying 68/68 WI couple is UNCHANGED from v5.59",
          RIWI_AGE("WI", 60000, 68, 68), 636.00);
        T("[EXTINCTION v5.60] the correction is confined to the window: RI 66/66 now costs exactly 0.05 x 80,000 more",
          Math.round((RIWI_AGE("RI", 80000, 66, 66) - RIWI_AGE("RI", 80000, 68, 68)) * 100) / 100, 4000.00);
        T("[EXTINCTION v5.60] and WI 66/66 exactly 0.053 x 48,000 more",
          Math.round((RIWI_AGE("WI", 60000, 66, 66) - RIWI_AGE("WI", 60000, 68, 68)) * 100) / 100, 2544.00);
        T("[BY DECISION v5.60] NM keeps the implicit 65 default — its pass is separate (ROUND4 D-C)",
          R.NM.exclAge === undefined ? 1 : 0, 1);
        // ⚠ ADDED after the C5/C6 negative controls came back NOT CAUGHT. Without these two, a
        //   note could go false, or go invisible to the invariant guarding it, and the whole
        //   suite stayed green. Neither hole was hypothetical: both controls demonstrated it.
        //
        //   [C6] The L658 invariant can only see "from age NN" and "NN+". If either note is
        //   reworded to phrase the age some other way, the invariant silently stops covering that
        //   state — which is precisely how RI's v5.59 note escaped it. Assert reachability here,
        //   so the coverage is a tested property rather than a happy accident of wording.
        T("[APPLIED v5.60] RI's note stays VISIBLE to the note-vs-code matcher that guards it",
          _AGE_NOTE.test((R.RI.note || "").toLowerCase()) ? 1 : 0, 1);
        T("[APPLIED v5.60] WI's note stays VISIBLE to the note-vs-code matcher that guards it",
          _AGE_NOTE.test((R.WI.note || "").toLowerCase()) ? 1 : 0, 1);
        //   [C5] And neither note may still claim the model starts the exclusion at 65. The
        //   mention-67 checks above pass on the STALE v5.59 wording, because it names 67 twice
        //   while asserting the model ignores it.
        T("[APPLIED v5.60] and neither note still claims the model applies the exclusion from 65",
          /\bfrom 65\b/.test(R.RI.note || "") || /\bfrom 65\b/.test(R.WI.note || "") ? 1 : 0, 0);
      } else {
        // Pre-fix state: the exclusion was granted two years early, understating state tax. This is
        // the only OPTIMISTIC error left in either state, and these pins are what makes it visible.
        T("[KNOWN DEFECT pre-v5.60] RI carried no exclAge, so its exclusion started at 65",
          R.RI.exclAge === undefined ? 1 : 0, 1);
        T("[KNOWN DEFECT pre-v5.60] WI carried no exclAge, so its exclusion started at 65",
          R.WI.exclAge === undefined ? 1 : 0, 1);
        T("[KNOWN DEFECT pre-v5.60] RI granted a 66/66 couple the full $100,000 the statute denies them",
          RIWI_AGE("RI", 80000, 66, 66), 1020.00);
        T("[KNOWN DEFECT pre-v5.60] WI granted a 66/66 couple the full $48,000 the statute denies them",
          RIWI_AGE("WI", 60000, 66, 66), 636.00);
        T("[KNOWN DEFECT pre-v5.60] and the model could not tell 66/66 from 68/68 in either state",
          (RIWI_AGE("RI", 80000, 66, 66) === RIWI_AGE("RI", 80000, 68, 68) &&
           RIWI_AGE("WI", 60000, 66, 66) === RIWI_AGE("WI", 60000, 68, 68)) ? 1 : 0, 1);
      }

      T("2E ssOffset: an unflagged state ignores Social Security entirely (AL)",
        S({ code: "AL", fallbackRate: 0, retIncome: 100000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ssGrossA: 50000, ssGrossB: 50000, ageA: 65, ageB: 65 }), 3960.00);
      // The legacy count path cannot offset — it has no per-person SS — so it returns the UNOFFSET
      // exclusion at the CURRENT cap. Not "pre-v5.56 behaviour": the cap correction applies there too.
      T("2E ssOffset: the count fallback returns the unoffset exclusion at the current cap",
        S({ code: "MD", fallbackRate: 0, retIncome: 120000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, persons65: 2 }), 2910.00);
    } else {
      // [KNOWN DEFECT pre-v5.56] the exclusion ignored Social Security entirely, and both caps were
      // stale. MD granted $72,400 to a couple whose statutory exclusion was near zero.
      T("[KNOWN DEFECT pre-v5.56] MD granted the full exclusion however much SS was received",
        S({ code: "MD", fallbackRate: 0, retIncome: 120000, pen: 0, work: 0, capGains: 0,
            ssTaxableFed: 0, ageA: 65, ageB: 65 }), 0.075 * (120000 - 72400));
      T("[KNOWN DEFECT pre-v5.56] MD's modelled cap trailed the statutory figure", R.MD.excl65, 36200);
      T("[KNOWN DEFECT pre-v5.56] ME's modelled cap trailed the statutory figure", R.ME.excl65, 35000);
      T("[KNOWN DEFECT pre-v5.56] no state carried an ssOffset flag at all",
        Object.keys(R).filter(c => R[c].ssOffset).length, 0);
    }
  }
}
const pass2Ecount = pass - pass2E, fail2Ecount = fail - fail2E;


console.log(`\nt10 2A: ${pass2A} passed, ${fail2A} failed`);
// v5.47 — was `${pass-pass2A}`, evaluated HERE, at the end of the run. `pass` is one running
// counter across every block, so that expression reported 2B+2C+2D+2E (87) under a label saying
// "2B", while the 2D and 2E lines below reported their own blocks again. The four printed labels
// therefore overlapped and did NOT sum to the total line beneath them — 76+87+27+21 = 211 against
// a true 163. A session totalling this suite by adding up its section labels overcounts by 48 per
// leg. Found 2026-08-23 when exactly that happened during the v5.47 packaging run, and the wrong
// figure very nearly reached a CHANGELOG as a claim that the PREVIOUS release had under-reported.
// Fixed by snapshotting at the block boundary, like every other block here.
console.log(`t10 2B+2C: ${pass2C-pass2A} passed, ${fail2C-fail2A} failed  (IRMAA tier selection + 7 indexation assertions, pins FLIPPED at v5.14)`);
console.log(`t10 2D: ${pass2D} passed, ${fail2D} failed  (Roth break-even crossover \u2014 the three cases sub-phase 2D owed)`);
console.log(`t10 2E: ${pass2Ecount} passed, ${fail2Ecount} failed  (state-tax module \u2014 five archetypes, both statuses, clamps, note scan)`);
console.log(`t10 total: ${pass} passed, ${fail} failed`);
if (fails.length) console.log(fails.join("\n"));
console.log("\n--- captured (engine vs independent hand reference) ---");
for (const k of ["S_50400","S_105700","M_100800","DED_S","OBBBA","LTCG_S_30000","LTCG_M_70000",
                 "NIIT_S_220000","NIIT_M_300000","SS_S_18000","SS_S_40000","SS_M_50000"])
  if (out[k]) console.log(`${k}: got=${out[k].got} exp=${out[k].exp}`+(out[k].taxSS!==undefined?` (taxableSS=${out[k].taxSS}, taxableOrd=${out[k].taxableOrd})`:""));
process.exit(fail ? 1 : 0);
