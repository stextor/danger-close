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
// ⚠ COUNT CODE, NOT COMMENTS. This was a bare text match over the whole source, so any COMMENT
// naming `retireStartBalances(` inflated the count and turned the check red with no code change.
// It did exactly that at v5.41, and again at v5.44 when a comment explaining where `t0` comes
// from added an eleventh "call site". A census check that a comment can break is a census check
// nobody trusts, and the standing advice had become "if t8 goes red, look for a comment first" —
// which is a workaround, not a fix. Strip line and block comments before counting.
// Deliberately NOT a full parser: this is a census, and a regex that removes // and /* */ is
// sufficient and auditable. String literals containing "//" would be over-stripped, so the
// comparison is on the CALL COUNT only, never on offsets into the stripped text.
const SRC_NOCOMMENT = SRC
  .replace(/\/\*[\s\S]*?\*\//g, "")          // block comments
  .replace(/^[ \t]*\/\/.*$/gm, "")            // whole-line comments
  .replace(/([^:])\/\/[^\n"'`]*$/gm, "$1");   // trailing comments (not URLs, which carry ://)
const calls = (SRC_NOCOMMENT.match(/retireStartBalances\(/g) || []).length;
const callsRaw = (SRC.match(/retireStartBalances\(/g) || []).length;
ck("retireStartBalances: 1 definition + 9 consumer call sites (comments excluded)", calls === 10,
   `found ${calls} in code (${callsRaw} including comments)`);
ck("constructor itself applies contribAccrual", /function retireStartBalances[\s\S]{0,400}contribAccrual\(retireYr\)/.test(SRC));

// 3) The three census-found sites (missing from the scope's enumerated list) are wired.
ck("Roth ladder seeds use the constructor (census find #3)", SRC.includes("const _rsbL = retireStartBalances(_tlRoth.rothLadderStart)"));
// v5.11: Engines B and C still seed from the constructor, but now take the PER-PERSON
// fields (tradInitA/tradInitB) instead of the pooled .tradInit, so RMDs can run on each
// spouse's own age with a spousal rollover at first death (finding C-2C-3). The invariant
// is unchanged in intent — seed from the constructor, never a local positions reduce —
// and is strengthened: the per-person split is now asserted explicitly.
ck("Taxes-tab schedule uses the constructor (census find #7)", /Portfolio for RMD calc[\s\S]{0,600}retireStartBalances\(_retireYr\)/.test(SRC));
ck("IRMAA planner uses the constructor (census find #8)", /MAGI per year[\s\S]{0,600}retireStartBalances\(_retireYr\)/.test(SRC));
ck("Taxes-tab schedule seeds PER-PERSON trad balances (v5.11, C-2C-3)",
  /const _rsbB = retireStartBalances\(_retireYr\);[\s\S]{0,200}_rsbB\.tradInitA[\s\S]{0,80}_rsbB\.tradInitB/.test(SRC));
ck("IRMAA planner seeds PER-PERSON trad balances (v5.11, C-2C-3)",
  /const _rsbC = retireStartBalances\(_retireYr\);[\s\S]{0,200}_rsbC\.tradInitA[\s\S]{0,80}_rsbC\.tradInitB/.test(SRC));

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
  // v5.26: plus the ordinary-income Other accounts. Asserted as a decomposition so the invariant
  // still means "nothing appeared from nowhere" rather than being re-pinned to a new constant.
  const othOrd = rsb.othOrdA + rsb.othOrdB;
  ck("constructor pooled tradInit = positions + $168,000 total accrual + ordinary Other accounts",
     Math.abs(rsb.tradInit - (basePos + 96000 + 72000 + othOrd)) < 1e-6, `got ${rsb.tradInit}, othOrd ${othOrd}`);
  ck("CONSERVATION: the two bases differ by exactly the annuity money",
     Math.abs((rsb.tradInit - rsb.rmdInit) - (othOrd - (rsb.othRmdA + rsb.othRmdB))) < 1e-6,
     `tax ${rsb.tradInit} rmd ${rsb.rmdInit}`);
  const res = T.runRothStrategies(mkP(true));
  ck("engine runs on accrued P and returns strategies", Array.isArray(res) && res.length > 0);
  const cur = res.find(r => r.key === "current");
  ck("engine 'current' strategy computed on accrued balances", !!cur && Number.isFinite(cur.estate));
}

// ═══ v5.22 — TAXABLE-RESIDUAL CONSOLIDATION (finding D-2D-2) ═══
// Same extinction shape as the retireStartBalances invariant above. Before v5.22 the positions
// taxable residual was copied verbatim at SEVEN sites (Engines B and C internally, four Engine-A
// P-constructions, and the Roth tab's tax-funding gate), all verified structurally identical by
// AST fingerprint. These assert it now exists once and is reached everywhere.
{
  const hdr = "function taxableInitFromPositions";
  const defStart = SRC.indexOf(hdr);
  ck("helper taxableInitFromPositions exists", defStart >= 0);
  const defEnd = SRC.indexOf("\n}", defStart) + 2;
  const outsideHelper = SRC.slice(0, defStart) + SRC.slice(defEnd);

  // 1) EXTINCTION — the raw residual reduce must exist ONLY inside the helper.
  const residual = /reduce\(\((?:s, p|t, q)\) => (?:s|t) \+ Math\.max\(0, \((?:p|q)\.balance/g;
  const strays = (outsideHelper.match(residual) || []).length;
  ck("no taxable-residual reduce outside taxableInitFromPositions", strays === 0, `found ${strays}`);

  // 2) COUNT — v5.26 moved the consumers UP one level. `taxableInitFromPositions` is now reached
  //    through exactly ONE door, `taxableInitAll`, which adds the after-tax Other accounts; the
  //    seven consumers call that instead. This is a STRONGER invariant than the v5.22 one it
  //    replaces: it says the positions residual can no longer be consumed on its own by accident,
  //    which is what would silently drop the $36,000 of taxable/HSA Other-account money.
  const uses = (SRC.match(/taxableInitFromPositions\(/g) || []).length;
  ck("taxableInitFromPositions: 1 definition + exactly 1 caller (taxableInitAll)", uses === 2, `found ${uses}`);
  const usesAll = (SRC.match(/taxableInitAll\(/g) || []).length;
  ck("taxableInitAll: 1 definition + 8 call sites", usesAll === 9, `found ${usesAll}`);
  // v5.53 (D-10 modelling half) added the eighth call: the Roth ladder's `_divLadder` reads the
  // same taxable base Engine C does, which is the point of the release. This census pin CAUGHT
  // that addition and went red — working as intended. ⚠ t8 takes no version tag; it reads the
  // root DangerClose.jsx alias, so it always describes the CURRENT build and is not gated.

  // 3) K2 — the Roth tax-funding gate. Through v5.25 it summed EVERY Other account's balance,
  //    counting a named IRA as money available to pay conversion tax. It never was: spending that
  //    money is itself a taxable event, so the gate was telling users they had outside funds when
  //    they had none. v5.26 routes it through taxableInitAll, which counts only genuinely
  //    after-tax money. EXTINCTION: the raw balance sum must never come back.
  ck("Roth funding gate no longer counts EVERY Other account as spendable",
     !SRC.includes('(PORTFOLIO.otherAccounts || []).reduce((t, a) => t + (a.balance || 0), 0)'));
  ck("Roth funding gate measures after-tax money only", SRC.includes('rothTaxFunding === "taxable" && taxableInitAll() < 1000'));

  // 4) K1 — the helper must NOT be inside retireStartBalances: that constructor applies contribAccrual
  //    and no accrual flows to taxable. Asserted positionally, and the stale comment is gone.
  const rsbStart = SRC.indexOf("function retireStartBalances");
  const rsbEnd = SRC.indexOf("\n}", rsbStart) + 2;
  ck("helper is OUTSIDE retireStartBalances (no accrual leaks into taxable)",
     defStart > rsbEnd || defStart < rsbStart, `helper@${defStart} rsb@${rsbStart}-${rsbEnd}`);
  ck("stale 'reduces stay inline' comment retired", !SRC.includes("those reduces stay inline at their sites"));
}

console.log(`\nt8 SUITE: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
