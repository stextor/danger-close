// sim_ledger.mjs — v5.38 STEP-1 INDEPENDENT DERIVATION LEDGER
//
// An independent re-implementation of Engine A's deterministic path for MFJ, no-death,
// fixed-conversion households — written from the statutes' descriptions and this session's
// source read, with its OWN arithmetic (own bracket walk, own SS worksheet, own AMT and
// gross-up implementations). It shares only the LAW TABLES with the app (Rev. Proc. 2025-32,
// CMS 2026, Rev. Proc. 2025-25 / HHS guidelines, IRS Pub. 590-B) — the same tables t1's
// Verify rows assert against primary sources.
//
// TWO MODES:
//   "v537" — the shipped behavior, including the disclosed asymmetry (ACA sale untaxed).
//            Validated to the dollar against the shipped bundle before anything else is
//            trusted. If this mode does not reproduce the engine EXACTLY, the sim does not
//            understand the machinery and every projection from it is void.
//   "v538" — the scope §3 design: the ACA-premium sale grosses up for its own LTCG,
//            the gain's tax is charged, the contraction estimates the grossed-up sale,
//            and the gain (whole-sale) enters the IRMAA lookback (decision 1).
//
// SCOPE LIMITS (deliberate; the fixtures respect them):
//   MFJ only · deathYr1 = Infinity · no annuity shares · fixed conv policies only
//   (none / current) · stateCode null · ACA_REGIME "current" · SS haircut off.
//   Households violating these are rejected loudly.

// ── LAW TABLES (transcribed; provenance in comments) ──────────────────────────────
const MFJ_BR = [ // Rev. Proc. 2025-32 §2.01, MFJ
  [0.10, 24800], [0.12, 100800], [0.22, 211400], [0.24, 403550],
  [0.32, 512450], [0.35, 768700], [0.37, Infinity]];
const MFJ_LTCG = [[0.0, 98900], [0.15, 613700], [0.20, Infinity]]; // §2.03
const MFJ_STD = 32200, SENIOR_MFJ_EACH = 1650;                     // §2.15
const SS_T1 = 32000, SS_T2 = 44000;      // IRC §86 — statutory, unindexed
const NIIT_THR = 250000, NIIT_RATE = 0.038; // IRC §1411 — statutory, unindexed
const AMT_EX = 140200, AMT_PH = 1000000, AMT_PH_RATE = 0.5, AMT28 = 244500; // OBBBA/RP §2.11
const IDX = 1.02;                        // the app's 2%/yr chained-CPI proxy (METHODOLOGY §6)
const IRMAA_MFJ = [218000, 274000, 342000, 410000, 750000, Infinity]; // CMS 2026
const IRMAA_SUR = [0, 1150, 2880, 4620, 6360, 6940];                  // CMS 2026, per person/yr
const IRMAA_TOP_FROZEN_THROUGH = 2027;   // BBA-2018 §53114
const FPL = { 2025: [15650, 5500], 2026: [15960, 5680] };             // HHS guidelines (guideline yr)
const FPL_PROXY = 0.02;
const ACA_TBL = [ // Rev. Proc. 2025-25 applicable-percentage table (current law, 2026)
  [0, 1.33, 0.021, 0.021], [1.33, 1.5, 0.0314, 0.0419], [1.5, 2.0, 0.0419, 0.066],
  [2.0, 2.5, 0.066, 0.0844], [2.5, 3.0, 0.0844, 0.0996], [3.0, 4.0, 0.0996, 0.0996]];
const ACA_CLIFF = 4.0, ACA_FLOOR = 1.0;
const EXPECTED_INFL = 0.45 * 0.028 + 0.20 * 0.02 + 0.15 * 0.035 + 0.10 * 0.01 + 0.07 * 0.065 + 0.03 * 0.0;
const ACA_TREND = EXPECTED_INFL + 0.02;  // household inflation + 2pt medical trend
const GROWTH = 0.045, HEIR = 0.22;
const SS_WAGE_BASE = 184500;             // SSA 2026
const RMD_DIV = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
  89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8,
  98: 7.3, 99: 6.8, 100: 6.4 };          // IRS Pub. 590-B Uniform Lifetime Table
const WORK_TAPER = [20000, 18000, 15000]; // the app's built-in demo taper (active when no streams)

// ── OWN ARITHMETIC (no code shared with the engine) ───────────────────────────────
const idx = (v, yr, asOf) => v === Infinity ? Infinity : v * Math.pow(IDX, yr - asOf);
const rmdStartAge = (dob) => dob <= 1950 ? 72 : dob <= 1959 ? 73 : 75;
const rmdDiv = (age) => RMD_DIV[age] ?? 6.4;

// Progressive tax via marginal-slice accumulation (deliberately a different loop shape
// than the engine's prev/upper walk).
function progressive(ti, yr, asOf, table) {
  if (ti <= 0) return 0;
  let paid = 0, lower = 0;
  for (const [rate, upRaw] of table) {
    const up = idx(upRaw, yr, asOf);
    if (ti > lower) paid += (Math.min(ti, up) - lower) * rate;
    lower = up;
    if (ti <= up) break;
  }
  return paid;
}
// LTCG stacked on ordinary: tax(ord+g) − tax(ord) over the LTCG schedule.
function ltcgStacked(g, ord, yr, asOf) {
  if (g <= 0) return 0;
  return progressive(ord + g, yr, asOf, MFJ_LTCG) - progressive(ord, yr, asOf, MFJ_LTCG);
}
// IRC §86 worksheet, own formulation.
function taxableSS(ss, other) {
  const prov = other + ss / 2;
  if (prov <= SS_T1) return 0;
  const t1Amt = Math.min((prov - SS_T1) / 2, ss / 2);
  if (prov <= SS_T2) return t1Amt;
  return Math.min(0.85 * ss, 0.85 * (prov - SS_T2) + Math.min((SS_T2 - SS_T1) / 2, ss / 2));
}
function fplFor(coverageYr, size) {
  const gy = coverageYr - 1;
  if (FPL[gy]) return FPL[gy][0] + FPL[gy][1] * (size - 1);
  const lastGy = Math.max(...Object.keys(FPL).map(Number));
  return (FPL[lastGy][0] + FPL[lastGy][1] * (size - 1)) * Math.pow(1 + FPL_PROXY, gy - lastGy);
}
function applicablePct(ratio) { // current regime only
  if (ratio < ACA_FLOOR) return null;
  if (ratio > ACA_CLIFF) return null;
  for (const [lo, hi, p0, p1] of ACA_TBL)
    if (ratio >= lo && (ratio < hi || hi === ACA_CLIFF))
      return p0 + (p1 - p0) * Math.min(1, (ratio - lo) / (hi - lo));
  return null;
}
function subsidy(magi, coverageYr, size, benchAnnual) {
  if (!(benchAnnual > 0)) return 0;
  const pct = applicablePct(magi / fplFor(coverageYr, size));
  if (pct === null) return 0;
  return Math.max(0, benchAnnual - pct * magi);
}
// Pro-rata gain realization (the shared realizeGain rule, own expression).
function sellFromPool(sale, pool, basis) {
  const bf = pool > 0 ? Math.min(1, basis / pool) : 1;
  return { gain: Math.max(0, sale * (1 - bf)), basisAfter: Math.max(0, basis - sale * bf) };
}
function irmaaThreshold(upper, isTop, premiumYr, asOf) {
  if (!Number.isFinite(upper)) return upper;
  const n = isTop ? Math.max(0, premiumYr - IRMAA_TOP_FROZEN_THROUGH) : premiumYr - asOf;
  return upper * Math.pow(IDX, n);
}
function irmaaSurcharge(lookbackMagi, premiumYr, asOf, persons) {
  if (lookbackMagi == null || persons <= 0) return 0;
  let tier = IRMAA_MFJ.length - 1;
  for (let i = 0; i < IRMAA_MFJ.length; i++) {
    if (lookbackMagi <= irmaaThreshold(IRMAA_MFJ[i], i === IRMAA_MFJ.length - 2, premiumYr, asOf)) { tier = i; break; }
  }
  return IRMAA_SUR[Math.min(tier, IRMAA_SUR.length - 1)] * persons;
}

// ── THE LEDGER ────────────────────────────────────────────────────────────────────
// mode: "v537" | "v538".  convAmount: the fixed policy.  baselineSub: acaSubByYr map or null.
export function ledger(P, convAmount, baselineSub, mode) {
  if (P.single || P.deathYr1 !== Infinity || P.stateCode || (P.stateRate || 0) !== 0 ||
      (P.annShareA || 0) !== 0 || (P.annShareB || 0) !== 0)
    throw new Error("fixture outside sim scope");
  let tradA = P.tradInitA, tradB = P.tradInitB, rothA = P.rothInitA, rothB = P.rothInitB;
  let taxBal = P.taxableInit;
  let basis = Math.max(0, taxBal) * (1 - Math.max(0, Math.min(0.95, P.taxableGainFrac || 0)));
  const magiHist = {};
  let totTax = 0, totIrmaa = 0, totNiit = 0, totConv = 0, totAcaLoss = 0;
  const acaSubByYr = {}, acaFloorYrs = {}, wealthByYr = {}, trace = [];
  const startA = rmdStartAge(P.dobAYr), startB = rmdStartAge(P.dobBYr);

  for (let yr = P.retireYr; yr <= P.horizonYr; yr++) {
    const ageA = yr - P.dobAYr, ageB = yr - P.dobBYr;
    // Income legs
    const ssAy = yr > P.ssAYr ? P.ssA * 12 : yr === P.ssAYr ? P.ssA * Math.max(0, 13 - P.ssAMo) : 0;
    const ssBy = yr > P.ssBYr ? P.ssB * 12 : yr === P.ssBYr ? P.ssB * Math.max(0, 13 - P.ssBMo) : 0;
    const ss = ssAy + ssBy;
    const pen = P.pen * 12;
    const k = yr - P.retireYr;
    const work = k >= 0 && k < WORK_TAPER.length ? WORK_TAPER[k] : 0;
    const rmdA = ageA >= startA && tradA > 0 ? tradA / rmdDiv(ageA) : 0;
    const rmdB = ageB >= startB && tradB > 0 ? tradB / rmdDiv(ageB) : 0;
    const rmd = rmdA + rmdB;
    const div_y = Math.round(Math.max(0, taxBal) * (P.taxYieldPct / 100));
    const base = pen + work + rmd;
    const ded = Math.round(idx(MFJ_STD, yr, P.asOfYr))
      + (ageA >= 65 ? Math.round(idx(SENIOR_MFJ_EACH, yr, P.asOfYr)) : 0)
      + (ageB >= 65 ? Math.round(idx(SENIOR_MFJ_EACH, yr, P.asOfYr)) : 0);
    // Fixed conversion inside the per-person windows
    const headA = yr <= P.ladderEnd ? Math.max(0, tradA - rmdA) : 0;
    const headB = yr <= P.ladderEnd ? Math.max(0, tradB - rmdB) : 0;
    let conv = 0, convA = 0, convB = 0;
    if (headA + headB > 0) {
      conv = Math.max(0, Math.round(Math.min(convAmount, headA + headB)));
      if (conv > 0) {
        convA = Math.min(headA, Math.round(conv * (headA / (headA + headB))));
        convB = Math.min(headB, conv - convA);
        convA = Math.min(headA, conv - convB);
        conv = convA + convB;
      }
    }
    // Year tax
    const ord = base + conv;
    const ssT = taxableSS(ss, ord + div_y);
    const grossOrd = ord + ssT;
    const taxableOrd = Math.max(0, grossOrd - ded);
    const fed = progressive(taxableOrd, yr, P.asOfYr, MFJ_BR);
    const qdcgTax = ltcgStacked(div_y, taxableOrd, yr, P.asOfYr);
    const magi = grossOrd + div_y;
    const niit = Math.round(NIIT_RATE * Math.min(div_y, Math.max(0, magi - NIIT_THR)));
    const exEff = Math.max(0, idx(AMT_EX, yr, P.asOfYr) - AMT_PH_RATE * Math.max(0, magi - idx(AMT_PH, yr, P.asOfYr)));
    const amtBase = Math.max(0, grossOrd - exEff), brk = idx(AMT28, yr, P.asOfYr);
    const tmt = Math.min(amtBase, brk) * 0.26 + Math.max(0, amtBase - brk) * 0.28 + ltcgStacked(div_y, amtBase, yr, P.asOfYr);
    const amt = Math.max(0, Math.round(tmt - (fed + qdcgTax)));
    const fica = work > 0 ? Math.min(work, idx(SS_WAGE_BASE, yr, P.asOfYr)) * 0.062 + work * 0.0145 : 0;
    const tax = fed + qdcgTax + niit + amt + 0 /* state */ + fica;
    // IRMAA (both alive, MFJ throughout; persons = spouses 65+ this premium year)
    magiHist[yr] = magi;
    const persons = (ageA >= 65 ? 1 : 0) + (ageB >= 65 ? 1 : 0);
    const irmaa = irmaaSurcharge(magiHist[yr - 2], yr, P.asOfYr, persons);
    totTax += tax; totNiit += niit; totIrmaa += irmaa; totConv += conv;
    // Funding
    let due = tax + irmaa, convToRoth = conv;
    if (P.convTaxFunding === "withhold" && conv > 0 && due > 0) {
      const w = Math.min(conv, due); convToRoth = conv - w; due -= w;
    }
    const gfEff = taxBal > 0 ? Math.max(0, Math.min(1, 1 - basis / taxBal)) : 0;
    let saleGain = 0;
    if (due > 0 && taxBal > 0) {
      if (gfEff > 0) {
        const stack = Math.max(0, taxableOrd) + div_y;
        let sale = due;
        for (let i = 0; i < 4; i++) sale = due + ltcgStacked(sale * gfEff, stack, yr, P.asOfYr);
        sale = Math.min(Math.max(0, taxBal), sale);
        const r = sellFromPool(sale, taxBal, basis);
        basis = r.basisAfter;
        const gTax = ltcgStacked(r.gain, stack, yr, P.asOfYr);
        taxBal -= sale; totTax += gTax;
        magiHist[yr] = magi + r.gain;
        saleGain = r.gain;
        due = Math.max(0, due - (sale - gTax));
      } else {
        const take = Math.min(Math.max(0, taxBal), due);
        basis = sellFromPool(take, taxBal, basis).basisAfter;
        taxBal -= take; due -= take;
      }
    }
    if (due > 0) {
      const rp = rothA + rothB, fr = Math.min(rp, due);
      if (fr > 0) { const fA = rp > 0 ? rothA / rp : 1; rothA -= fr * fA; rothB -= fr * (1 - fA); due -= fr; }
    }
    if (due > 0) {
      const tp = tradA + tradB, fA = tp > 0 ? tradA / tp : 1;
      tradA = Math.max(0, tradA - due * fA); tradB = Math.max(0, tradB - due * (1 - fA)); due = 0;
    }
    // ACA bridge
    const heads = (P.acaPremium > 0 && yr >= P.retireYr) ? (ageA < 65 ? 1 : 0) + (ageB < 65 ? 1 : 0) : 0;
    let acaGain = 0, acaGainTax = 0, acaSale = 0, lost = 0;
    if (heads > 0) {
      const bench = P.acaPremium * 12 * Math.pow(1 + ACA_TREND, yr - P.asOfYr) * heads / 2;
      const magiBase = base + conv + div_y + ss + saleGain;
      let acaMagi = magiBase;
      let subY = subsidy(acaMagi, yr, P.acaSize, bench);
      if (baselineSub) {
        // 3-pass contraction. v537 estimates the gain of a LOST-sized sale;
        // v538 estimates the gain of the GROSSED-UP sale (scope §3 step 4).
        const stack2 = Math.max(0, taxableOrd) + div_y + saleGain;
        for (let p = 0; p < 3; p++) {
          const lostI = Math.max(0, (baselineSub[yr] || 0) - subY);
          let saleI = lostI;
          if (mode === "v538") for (let i = 0; i < 4; i++)
            saleI = lostI + ltcgStacked(sellFromPool(saleI, taxBal, basis).gain, stack2, yr, P.asOfYr);
          acaMagi = magiBase + sellFromPool(saleI, taxBal, basis).gain;
          subY = subsidy(acaMagi, yr, P.acaSize, bench);
        }
      }
      acaSubByYr[yr] = subY;
      if (acaMagi / fplFor(yr, P.acaSize) < ACA_FLOOR) acaFloorYrs[yr] = acaMagi / fplFor(yr, P.acaSize);
      if (baselineSub) {
        lost = (baselineSub[yr] || 0) - subY;
        totAcaLoss += lost;
        if (mode === "v537") {
          // Shipped behavior: sale of exactly `lost`; gain realized, basis leaves, NOT taxed.
          const r = sellFromPool(Math.max(0, lost), taxBal, basis);
          acaGain = r.gain; basis = r.basisAfter;
          taxBal -= lost; acaSale = Math.max(0, lost);
        } else {
          // v5.38: gross the sale up for its own LTCG; charge it; lookback sees the gain.
          const stack2 = Math.max(0, taxableOrd) + div_y + saleGain;
          let sale = Math.max(0, lost);
          for (let i = 0; i < 4; i++)
            sale = Math.max(0, lost) + ltcgStacked(sellFromPool(sale, taxBal, basis).gain, stack2, yr, P.asOfYr);
          sale = Math.min(Math.max(0, taxBal), sale);
          const r = sellFromPool(sale, taxBal, basis);
          acaGain = r.gain; basis = r.basisAfter;
          acaGainTax = ltcgStacked(acaGain, stack2, yr, P.asOfYr);
          totTax += acaGainTax;
          taxBal -= sale; acaSale = sale;
          if (lost < 0) taxBal -= lost; // negative lost still credits the pool as shipped… (see note below)
          magiHist[yr] = magi + saleGain + acaGain; // decision 1
        }
      }
    }
    // Balance updates
    const netFrac = conv > 0 ? convToRoth / conv : 1;
    tradA = Math.max(0, tradA - rmdA - convA) * (1 + GROWTH);
    tradB = Math.max(0, tradB - rmdB - convB) * (1 + GROWTH);
    rothA = (rothA + convA * netFrac) * (1 + GROWTH);
    rothB = (rothB + convB * netFrac) * (1 + GROWTH);
    basis = Math.max(0, Math.min(Math.max(0, taxBal) + rmd, basis + rmd));
    taxBal = (Math.max(0, taxBal) + rmd) * (1 + GROWTH);
    wealthByYr[yr] = Math.round(taxBal + rothA + rothB + tradA + tradB);
    trace.push({ yr, ss, rmd: Math.round(rmd), conv, magi: Math.round(magi), tax: Math.round(tax),
      taxableOrd: Math.round(taxableOrd), div: div_y,
      irmaa, saleGain: Math.round(saleGain), lost: Math.round(lost), acaSale: Math.round(acaSale),
      acaGain: Math.round(acaGain), acaGainTax: Math.round(acaGainTax),
      sub: Math.round(acaSubByYr[yr] ?? -1), lookM: Math.round(magiHist[yr]) });
  }
  return {
    totTax: Math.round(totTax), totIrmaa: Math.round(totIrmaa), totNiit: Math.round(totNiit),
    totConv: Math.round(totConv), totAcaLoss: Math.round(totAcaLoss),
    acaSubByYr, acaFloorYrs, wealthByYr,
    endTrad: Math.round(tradA + tradB), endRoth: Math.round(rothA + rothB), endTaxable: Math.round(taxBal),
    estate: Math.round(taxBal + rothA + rothB + (tradA + tradB) * (1 - HEIR)),
    trace,
  };
}

// Convenience: full two-stage run (baseline, then a strategy) the way the engine wires it.
export function runHousehold(P, convAmount, mode) {
  const baseline = ledger(P, 0, null, mode);
  return { baseline, strat: ledger(P, convAmount, baseline.acaSubByYr, mode) };
}
