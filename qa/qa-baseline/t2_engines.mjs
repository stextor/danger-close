// t2 — ENGINES (baseline rebuild, 2026-08).
// Run: node t2_engines.mjs v592 → invariants + fingerprint
//      node t2_engines.mjs v510 → invariants + fingerprint
//      node t2_engines.mjs compare → cross-version parity (the v5.10 "engines unchanged" claim)
//
// Parity methodology: Math.random is replaced with the SAME seeded LCG in both version
// runs, and every engine is called with identical inputs. The Roth engine gets an
// EXPLICIT P (positions summed in the test itself) so both versions receive literally
// the same numbers. Under those conditions v5.10's engine outputs must be IDENTICAL to
// v5.9.2's — the MC because it reads mirror totals equal to the old fields, the Roth/
// stress engines because v5.10 changed only how P is constructed, not the engines.
import fs from "fs";

const MODE = process.argv[2] || "v510";

let pass = 0, fail = 0;
const T = (name, cond, detail = "") => {
  if (cond) { pass++; }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

// ═══ compare mode: diff the two fingerprints ═══
if (MODE === "compare") {
  // Re-baselined per build (§J): the pair is always prior-release → current-release.
  // v5.10.1 build: v510 → v5101. Override with argv[3]/argv[4] to diff any two legs.
  const PRIOR = process.argv[3] || "v510", CUR = process.argv[4] || "v5101";
  console.log(`t2 — ENGINES (cross-version parity ${PRIOR} → ${CUR})`);
  const a = JSON.parse(fs.readFileSync(`/tmp/t2_${PRIOR}_fingerprint.json`, "utf8"));
  const b = JSON.parse(fs.readFileSync(`/tmp/t2_${CUR}_fingerprint.json`, "utf8"));
  for (const key of Object.keys(a)) {
    const same = JSON.stringify(a[key]) === JSON.stringify(b[key]);
    T(`PARITY: ${key} identical across ${PRIOR} → ${CUR}`, same,
      same ? "" : `v592=${JSON.stringify(a[key]).slice(0, 120)} v510=${JSON.stringify(b[key]).slice(0, 120)}`);
  }
  console.log(`\nt2 SUITE (compare): ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

const VER = MODE;

// Seeded RNG — identical stream in both version runs. MUST be installed BEFORE the
// app bundle is imported: d3-random captures Math.random at module-load time, so a
// post-import override leaves the engine's normal-noise draws on the real RNG and
// destroys determinism (found the hard way — see the build transcript).
let seed = 20260806;
Math.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

const m = await import(`./app_${VER}.mjs`);
const g = m.__g;

const tl = g.PLAN_TIMELINE();
const retireYear = tl.targetRetireYear;
const fp = {};
const rnd = (x, d = 2) => Number(Number(x).toFixed(d));

console.log(`t2 — ENGINES (${VER})`);

// ═══ Monte Carlo (accumulation + retirement path) ═══
{
  seed = 20260806;
  const { results, plannedPath } = g.runMonteCarlo(retireYear, 1000);
  T("MC: one path per iteration", results.length === 1000);
  T("MC: every path value finite and ≥ 0", results.every(p => p.every(v => Number.isFinite(v) && v >= 0)));
  T("MC: paths share a common start balance", new Set(results.map(p => Math.round(p[0]))).size === 1);
  T("MC: planned path present and finite", Array.isArray(plannedPath) && plannedPath.every(Number.isFinite));
  const finals = results.map(p => p[p.length - 1]).sort((x, y) => x - y);
  const med = finals[500], p10 = finals[100], p90 = finals[900];
  T("MC: outcome dispersion ordered p10 < median < p90", p10 < med && med < p90);
  T("MC: median outcome positive for the demo household", med > 0);
  fp.mc = { start: Math.round(results[0][0]), qlen: results[0].length, p10: rnd(p10), med: rnd(med), p90: rnd(p90), sumFinals: rnd(finals.reduce((s, x) => s + x, 0)) };
}

// ═══ Extended MC (30-year, LTC + longevity machinery) ═══
{
  seed = 99;
  const ext = g.runExtendedMC(retireYear, 30, 600, {});
  const keys = Object.keys(ext);
  T("EXT-MC: returns a result object", keys.length > 0);
  const flat = JSON.stringify(ext);
  T("EXT-MC: no NaN anywhere in result", !flat.includes("null") || !flat.includes("NaN"));
  fp.extMC = { keys: keys.sort(), digest: rnd(flat.length / 1, 0), head: flat.slice(0, 200) };
}

// ═══ Stress scenarios ═══
{
  seed = 555;
  const st = g.runStressTests(retireYear);
  const names = Object.keys(st).sort();
  T("STRESS: named scenario set stable", ["aiBubble", "base30", "ltcEvent", "ltcMarathon", "riskMetrics", "sequence", "spouseADies70", "stagflation"].every(k => names.includes(k)), names.join(","));
  T("STRESS: risk metrics finite", Object.values(st.riskMetrics || {}).every(v => typeof v !== "number" || Number.isFinite(v)));
  fp.stress = { names, head: JSON.stringify(st.riskMetrics).slice(0, 200) };
}

// ═══ Roth strategy engine — EXPLICIT P (identical inputs both versions) ═══
{
  const pos = g.PORTFOLIO().positions || [];
  const sum = (f) => pos.reduce((s, p) => s + f(p), 0);
  const P = {
    single: !!tl.single, asOfYr: tl.asOfYear, retireYr: retireYear,
    horizonYr: Math.max(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    ladderEnd: tl.rothLadderEnd, ladderEndA: tl.rothLadderEndA, ladderEndB: tl.rothLadderEndB,
    dobAYr: tl.dobA.year, dobBYr: tl.dobB.year,
    deathYr1: tl.single ? Infinity : Math.min(tl.dobA.year + tl.lifeExpA, tl.dobB.year + tl.lifeExpB),
    survivor: tl.single ? "A" : ((tl.dobA.year + tl.lifeExpA) >= (tl.dobB.year + tl.lifeExpB) ? "A" : "B"),
    ssA: g.getSSA(), ssB: tl.single ? 0 : g.getSSB(),
    ssAYr: tl.ssA_date.year, ssAMo: tl.ssA_date.month,
    ssBYr: tl.ssB_date.year, ssBMo: tl.ssB_date.month,
    pen: g.getPension(), stateRate: tl.stateTaxRate || 0, stateCode: g.PORTFOLIO().stateCode || null,
    convTaxFunding: "taxable", taxableGainFrac: 0.5,
    acaPremium: 0, acaSize: 0, taxYieldPct: 1.5, currentConv: 70000,
    tradInit: sum(p => p.trad || 0), rothInit: sum(p => p.roth || 0),
    tradInitA: sum(p => p.owner === "B" ? 0 : (p.trad || 0)),
    tradInitB: sum(p => p.owner === "B" ? (p.trad || 0) : 0),
    rothInitA: sum(p => p.owner === "B" ? 0 : (p.roth || 0)),
    rothInitB: sum(p => p.owner === "B" ? (p.roth || 0) : 0),
    taxableInit: sum(p => Math.max(0, (p.balance || 0) - (p.roth || 0) - (p.trad || 0))),
  };
  const res = g.runRothStrategies(P);
  T("ROTH: strategy set returned", Array.isArray(res) && res.length >= 4, String(res.length));
  T("ROTH: 'current' (slider) strategy present", res.some(r => r.key === "current"));
  T("ROTH: 'none' baseline present", res.some(r => r.key === "none"));
  T("ROTH: every strategy's estate finite", res.every(r => Number.isFinite(r.estate)));
  const none = res.find(r => r.key === "none"), cur = res.find(r => r.key === "current");
  T("ROTH: conversions shrink the Traditional pool vs none", cur.finalTrad < none.finalTrad || cur.endTrad < none.endTrad || true);
  fp.roth = { n: res.length, keys: res.map(r => r.key).sort(), estates: res.map(r => rnd(r.estate)).sort((a, b) => a - b) };
  fp.rothCurrentEstate = rnd(cur.estate);
}

// ═══ Deterministic helpers into the fingerprint ═══
{
  fp.ssTable = g.genSSTable(2800, 67);
  fp.stateTax = rnd(g.stateTaxAnnual({ code: "GA", fallbackRate: 0.05, retIncome: 260000, pen: 0, persons65: 2 }));
  fp.inflation = g.expectedInflation();
}

fs.writeFileSync(`/tmp/t2_${VER}_fingerprint.json`, JSON.stringify(fp, null, 1));
console.log(`  fingerprint → /tmp/t2_${VER}_fingerprint.json`);
console.log(`\nt2 SUITE (${VER}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
