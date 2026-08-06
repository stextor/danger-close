// t8 — v5.10 consumer invariant (§3.4, extinction-test pattern) + Verify constants + engine behavior.
import { readFileSync } from "fs";
import { __test as T } from "./app_testable.mjs";

const SRC = readFileSync(new URL("../DangerClose.jsx", import.meta.url), "utf8");
let pass = 0, fail = 0;
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

console.log("t8 — SOURCE INVARIANT (no consumer derives retirement-start Trad/Roth without the helper)");

// 1) Extinction: the raw reduce patterns that used to derive retirement-start Trad/Roth from
//    positions must exist ONLY inside retireStartBalances (the sanctioned choke point).
const bodyStart = SRC.indexOf("function retireStartBalances");
const bodyEnd = SRC.indexOf("\n}", bodyStart) + 2;
const outside = SRC.slice(0, bodyStart) + SRC.slice(bodyEnd);
const tradReduce = /reduce\(\((?:s, p|t, q)\) => (?:s|t) \+ \((?:p|q)\.trad/g;
const rothReduce = /reduce\(\((?:s, p|t, q)\) => (?:s|t) \+ \((?:p|q)\.roth/g;
ck("no Traditional-from-positions reduce outside retireStartBalances", (outside.match(tradReduce) || []).length === 0, `found ${(outside.match(tradReduce) || []).length}`);
ck("no Roth-from-positions reduce outside retireStartBalances", (outside.match(rothReduce) || []).length === 0, `found ${(outside.match(rothReduce) || []).length}`);
ck("no direct trad-sum via forEach t0 pattern (old STEP-1 form) anywhere", !SRC.includes('t0[q.owner === "B" ? "B" : "A"] += (q.trad || 0)'));

// 2) All nine census consumers call the helper (definition + 9 call sites).
const calls = (SRC.match(/retireStartBalances\(/g) || []).length;
ck("retireStartBalances: 1 definition + 9 consumer call sites", calls === 10, `found ${calls}`);
ck("constructor itself applies contribAccrual", /function retireStartBalances[\s\S]{0,400}contribAccrual\(retireYr\)/.test(SRC));

// 3) The three census-found sites (missing from the scope's enumerated list) are wired.
ck("Roth ladder seeds use the constructor (census find #3)", SRC.includes("const _rsbL = retireStartBalances(_tlRoth.rothLadderStart)"));
ck("Taxes-tab schedule uses the constructor (census find #7)", /Portfolio for RMD calc[\s\S]{0,300}retireStartBalances\(_retireYr\)\.tradInit/.test(SRC));
ck("IRMAA planner uses the constructor (census find #8)", /MAGI per year[\s\S]{0,400}retireStartBalances\(_retireYr\)\.tradInit/.test(SRC));

// 4) Cross-tab agreement (Roth tab): STEP-1 cards and the ladder table share the SAME
//    anchor (rothLadderStart) and the SAME helper, so they cannot quietly disagree.
ck("STEP-1 RMD cards read t0 from the constructor", SRC.includes("const t0 = { A: _rsbC.tradInitA, B: _rsbC.tradInitB }"));
ck("STEP-1 and ladder share the rothLadderStart anchor", SRC.includes("retireStartBalances(tl.rothLadderStart)") && SRC.includes("retireStartBalances(_tlRoth.rothLadderStart)"));

// 5) Explicitly-unchanged consumers still read the SUM mirrors (MC parity by construction).
ck("MC accumulation still reads contributions.monthly401k (unchanged)", SRC.includes("const primaryContrib = PORTFOLIO.contributions.monthly401k + PORTFOLIO.contributions.hsaMonthly;"));
ck("extended MC still reads the mirrors (unchanged)", SRC.includes("const _primaryContrib = (PORTFOLIO.contributions.monthly401k + PORTFOLIO.contributions.hsaMonthly) * contribRate;"));
ck("mirrors maintained in applyLoadedData", SRC.includes("c.monthly401k = c.contribPreTaxA + c.contribRothA;"));
ck("mirrors maintained on Save & Apply", SRC.includes("monthly401k: Math.round(monthly401k) + num(rothAMo),"));

// 6) The form readout is the ONE whitelisted inline accrual computation — it previews UNSAVED
//    form state (PORTFOLIO isn't updated until Save & Apply) so it cannot call the helper;
//    assert it follows the helper's exact convention so the two cannot drift silently.
ck("readout preview follows the helper's formula (12·monthly·years + bonus·years)",
  SRC.includes("const _tA = 12 * monthly401k * _yrsA + _bonusYr * _yrsA;") &&
  SRC.includes("const _rAv = 12 * num(rothAMo) * _yrsA;") &&
  SRC.includes("const _tB = single ? 0 : 12 * num(spouseContribMo) * _yrsB;"));
ck("readout B-years use the same B-stop source as the helper (targetRetireYearB)", SRC.includes("Number(retireYrB) || _tlA.targetRetireYearB || _rA"));

// 7) UI contract items from the scope.
ck("hybrid labels ship (Pre-tax (Traditional 401k/IRA) / Roth (401k/IRA))", SRC.includes("Pre-tax (Traditional 401k/IRA)") && SRC.includes("Roth (401k/IRA) $/month"));
ck("framing line ships verbatim concept", SRC.includes("the model still taxes nothing before retirement"));
ck("migration notice ships with the scope's wording", SRC.includes("carried over as 100% pre-tax — split them if you also make Roth contributions"));
ck("readout ships (Projected added by retirement)", SRC.includes("Projected added by retirement:"));
ck("HSA exclusion stated in UI hint", SRC.includes("HSA dollars are neither Traditional nor Roth"));
ck("402(g) soft warning ships (soft, not enforcement)", SRC.includes("402(g) elective-deferral limit") && SRC.includes("the model doesn't enforce the limit"));

console.log("\nt8 — VERIFY-TAB CONSTANTS (incl. the new 402(g) line)");
const checks = T.buildVerificationChecks();
const failing = checks.filter(c => !c.pass);
ck(`all ${checks.length} Verify-tab checks pass`, failing.length === 0, failing.map(f => f.name).join("; "));
const g = checks.find(c => c.name.includes("402(g)"));
ck("402(g) constant asserted at 24500 with IRS Notice 2025-67 citation", !!g && g.pass && /2025-67/.test(g.source));

console.log("\nt8 — ENGINE BEHAVIORAL (accrual actually flows through runRothStrategies)");
const NOW = new Date().getFullYear();
const mkP = (withContrib) => {
  const tl = T.PLAN_TIMELINE;
  return {
    single: false, asOfYr: tl.asOfYear, retireYr: NOW + 4,
    horizonYr: NOW + 30, ladderEnd: NOW + 12, ladderEndA: NOW + 12, ladderEndB: NOW + 14,
    dobAYr: 1966, dobBYr: 1968, deathYr1: NOW + 24,
    ssA: 3300, ssB: 1300, ssAYr: NOW + 8, ssAMo: 1, ssBYr: NOW + 6, ssBMo: 1,
    pen: 400, stateRate: 0, stateCode: null, survivor: "A",
    ...(withContrib ? T.retireStartBalances(NOW + 4)
      : { tradInit: 1000000, rothInit: 200000, tradInitA: 800000, tradInitB: 200000, rothInitA: 150000, rothInitB: 50000 }),
    taxableInit: 100000, taxYieldPct: 1.5, currentConv: 50000,
  };
};
// Configure a household with the scope's contribution case, then check the engine's
// starting balances (explicit-P path) reflect the accrued figures.
const port = JSON.parse(JSON.stringify(T.PORTFOLIO));
port.asOf = `${NOW}-01-15`; port.single = false;
port.retireYear = NOW + 4; port.retireYearB = NOW + 6;
port._incomeFromForm = true;
port.contributions = { hsaMonthly: 0, allocations: {}, contribPreTaxA: 2000, contribRothA: 500, contribPreTaxB: 1000, contribRothB: 0 };
T.applyLoadedData({ portfolio: port, expenses: [], incomeFromForm: true });
{
  const rsb = T.retireStartBalances(NOW + 4);
  const basePos = (T.PORTFOLIO.positions || []).reduce((x, p) => x + (p.trad || 0), 0);
  ck("constructor pooled tradInit = positions + $168,000 total accrual", Math.abs(rsb.tradInit - (basePos + 96000 + 72000)) < 1e-6, `got ${rsb.tradInit}`);
  const res = T.runRothStrategies(mkP(true));
  ck("engine runs on accrued P and returns strategies", Array.isArray(res) && res.length > 0);
  const cur = res.find(r => r.key === "current");
  ck("engine 'current' strategy computed on accrued balances", !!cur && Number.isFinite(cur.estate));
}

console.log(`\nt8 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
