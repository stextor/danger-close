// households.mjs — synthetic portfolios for t29 (qa/tools/fixture)
//
// NOT `fixture.jsx`. That file's LINE NUMBERS ARE LOAD-BEARING (OPERATIONS §B1) because the four
// AST tools assert positions in it; this census operates on PORTFOLIOS, not on source text, so it
// needs its own fixtures and must not touch that one.
//
// Each household below is built to sit on, or clear, ONE named boundary, so that a census row
// which fails to move is unambiguous: the row is broken, not the household. A fixture that
// changes several boundaries at once cannot tell you which one the tool actually saw.
//
// Every override is applied to a DEEP COPY of the shipped example household, so each fixture
// differs from the baseline in exactly the stated way.
//
// §C traps observed: `dobA`/`dobB` must be "YYYY-MM-DD" STRINGS, and Social Security goes in
// through `incomeSources.ss*.planned` as a MONTHLY figure — `.amount` is a silent no-op.

const ssTable = m => ({ tableByAge: { 62: m, 63: m, 64: m, 65: m, 67: m, 70: m }, planned: m, plannedAge: 67 });

export const HOUSEHOLDS = {
  // Clears the two January DOB rows.
  months: {
    why: "mid-year DOBs — partial-month arithmetic becomes reachable",
    flips: ["dobA_month", "dobB_month"],
    apply: P => { P.dobA = "1964-07-01"; P.dobB = "1966-04-01"; },
  },
  // Clears spouse B's claim-year row: B claims well after the ladder starts.
  claim: {
    why: "spouse B delays to 70 — the claim gate becomes reachable",
    flips: ["ssB_claim", "ss_claim_after_gap"],   // v6.29 (F-25): B's claim also moves past the start of A's income gap
    apply: P => { P.incomeSources.ssB = { ...ssTable(2250), plannedAge: 70 }; },
  },
  // Clears both §86 ½-cap band rows: benefits small enough for the cap to bind.
  band: {
    why: "small benefits — §86(a)(1)'s ½ cap becomes reachable",
    flips: ["ssA_band", "ssB_band"],
    apply: P => { P.incomeSources.ssA = ssTable(600); P.incomeSources.ssB = ssTable(500); },
  },
  // Clears the state-tax row.
  state: {
    why: "a non-zero state rate — the state-tax path becomes reachable",
    flips: ["state_tax"],
    apply: P => { P.stateTaxRate = 0.05; P.stateName = "Test State"; P.stateCode = "TS"; },
  },
  // ── STATE MODULE fixtures (added 2026-08-28) ────────────────────────────────────────────
  // ⚠ The `state` fixture above sets `stateCode: "TS"`, which is NOT a key in STATE_RULES. It
  // clears the LEGACY flat-rate row and leaves the 51-jurisdiction module unexercised — which is
  // exactly the confusion the three-way census split exists to end, and is why these two are
  // separate fixtures rather than edits to that one. Leave `state` alone: it is the legacy-path
  // fixture and it is still the only one.
  //
  // Clears the state-module row.
  stateProgressive: {
    why: "New York — a real STATE_RULES key, so the 51-jurisdiction module runs instead of the legacy rate. " +
         "NY is chosen because it is the ONE state already measured against a sourced 2026 schedule " +
         "(docs/AUDIT_D3_STATE_TAX_DIRECTION.md, Form IT-2105-I), so expected figures exist and are " +
         "hand-verified; any other state means sourcing a schedule first.",
    flips: ["state_code"],
    apply: P => {
      P.stateCode = "NY"; P.stateName = "New York";
      // The legacy rate is cleared so the module is the ONLY live path. Leaving it set would make
      // a green result ambiguous about which branch of stateTaxAnnual produced the figure.
      P.stateTaxRate = 0;
    },
  },
  // ── RETIRED at v5.69: `stateExclCliff` (SCOPE_RI_POPULATE D-RI-4). It lit the income-limited-exclusion
  //   census row (the D-3c class) and stood on three states in turn — New Jersey until v5.67, Virginia for
  //   v5.67, Rhode Island for v5.68. Rhode Island was the last: from v5.69 every exclusion known to be
  //   income-limited in law carries `exclTest`, so no household can reach the row. Retired WITH the row
  //   in boundaries.mjs and t29 F-6c/F-7, and with t29 F-6 inverted to assert the set is empty — the
  //   release this comment always said would come. Recover the block from git history, not by rewriting.
  // ⚠ NO `stateEstate` FIXTURE — deliberately, by decision D2. Nothing in the app computes state
  // estate tax, so the fixture could only assert an ABSENCE, and an absence-assertion written
  // before the behaviour exists is the coupling this project keeps paying for. The census row it
  // would have needed (`state_code`) ships here; the fixture waits for the D-7 release, where it
  // has something to measure. Recorded so it is not rediscovered as an omission.

  // Clears the income-stream row.
  streams: {
    why: "an ordinary income stream — the stream paths become reachable",
    flips: ["income_streams", "stream_kinds"],
    apply: P => {
      P.incomeStreams = [{ label: "Rental", monthly: 500, startYear: 2029, endYear: 9999, cola: false, tax: "ordinary" }];
    },
  },
  // Clears `income_streams` and DELIBERATELY LEAVES `stream_kinds` ON. Added at v5.63 with the
  // row itself: without this fixture the new row would be driven in one direction only, and a
  // row that can only ever go one way discriminates nothing — the E2 lesson, which cost a
  // release when the SS-offset row shipped with nothing asserting it. This stream carries an
  // explicit `kind: "work"`, so the count row reads exercised while the FICA split does not.
  streamsWork: {
    why: "a WORK-only stream — streams exist, but the non-work/FICA split stays unexercised",
    flips: ["income_streams"],
    apply: P => {
      P.incomeStreams = [{ label: "Part-time", monthly: 500, startYear: 2029, endYear: 9999, cola: false, tax: "ordinary", kind: "work" }];
    },
  },
  // Moves spouse A onto the OTHER SECURE 2.0 branch. This row can never read "clear" for a single
  // household — a person has one birth year — so the control is that the reported BRANCH changes.
  rmd73: {
    why: "spouse A born before 1960 — the RMD-73 branch instead of 75",
    flips: [],
    apply: P => { P.dobA = "1958-01-01"; },
  },
  // The reverse direction: a row that is CLEAR on the example household and must go ON here.
  // Without this, nothing proves the census can detect the ladder-window case at all.
  sameWindows: {
    why: "both spouses born the same year — the per-spouse ladder-window split disappears",
    flips: ["ladder_windows"],
    apply: P => { P.dobB = "1964-01-01"; },
  },
  // Single filer. Also the household that exercises the single-filer branch of every row.
  single: {
    why: "a single filer — the other side of the filing-status boundary",
    flips: [],
    apply: P => {
      P.single = true; P.nameB = "";
      P.positions = (P.positions || []).map(x => ({ ...x, owner: "A" }));
      P.otherAccounts = (P.otherAccounts || []).map(x => ({ ...x, owner: "A" }));
      P.incomeSources.ssB = { tableByAge: {}, planned: 0, plannedAge: 67 };
    },
  },
};

// v6.08 (D-34): retirement money held mostly as a rollover IRA under Other accounts — holdings at 20 %, a $900,000 IRA for A, still
// standing at RMD age in the Withdrawal tab. `household`, `total401k` and `bucketActuals` are re-derived the way My Data derives them, or
// Engine D would read a pool that does not match the rows (the same in `capBinds` below).
const rederive = P => {
  const t = P.positions.reduce((a, x) => a + (x.balance || 0), 0), bs = { 1: 0, 2: 0, 3: 0, 4: 0 };
  P.positions.forEach(x => { if (bs[x.bucket] !== undefined) bs[x.bucket] += x.balance || 0; });
  P.total401k = t; P.household = t + P.otherAccounts.reduce((a, x) => a + (x.balance || 0), 0);
  P.bucketActuals = { 1: bs[1] / t, 2: bs[2] / t, 3: bs[3] / t, 4: bs[4] / t };
};
HOUSEHOLDS.otherIra = {
  why: "most pre-tax money in a rollover IRA under Other accounts, still standing at RMD age in the Withdrawal tab",
  flips: ["oth_ira_rmd"],
  apply: P => {
    P.positions = (P.positions || []).map(x => ({ ...x, balance: x.balance * 0.2, trad: (x.trad || 0) * 0.2, roth: (x.roth || 0) * 0.2 }));
    P.otherAccounts = [...(P.otherAccounts || []), { name: "Rollover IRA", balance: 900000, owner: "A", taxType: "trad", planType: "ira" }];
    rederive(P);
  },
};
// v6.08 (D-34): too little pre-tax money for the $70,000 slider — holdings at 10 % and no Traditional IRA under Other accounts — so the
// Withdrawal tab's conversion cap binds inside the ladder window on any build.
HOUSEHOLDS.capBinds = {
  why: "too little pre-tax money for the opening slider — the Withdrawal tab's conversion cap binds",
  flips: ["d_conv_cap"],
  apply: P => {
    P.positions = (P.positions || []).map(x => ({ ...x, balance: x.balance * 0.1, trad: (x.trad || 0) * 0.1, roth: (x.roth || 0) * 0.1 }));
    P.otherAccounts = (P.otherAccounts || []).filter(x => x.taxType !== "trad");
    rederive(P);
  },
};

// v6.09 (D-35): the example household plus a $200,000 Roth IRA under Other accounts — clears the one new row and no other.
HOUSEHOLDS.otherRoth = {
  why: "a Roth IRA held under Other accounts — Engine D's Roth handling of the Priority-1 pool reaches it",
  flips: ["oth_roth"],
  apply: P => {
    P.otherAccounts = [...(P.otherAccounts || []), { name: "Roth IRA", balance: 200000, owner: "A", taxType: "roth" }];
    rederive(P);
  },
};

// v6.16 (D-36): one self-employed job row for A, $5,000 a month for the first five plan years — clears the new row (and the count row,
// since a stream now exists); `stream_kinds` stays ON (a work row) and `payroll` stays ON ($60,000, one earner).
HOUSEHOLDS.selfEmployed = {
  why: "a self-employed (1099) job row above the $400 floor — self-employment tax becomes reachable",
  flips: ["income_streams", "self_employed"],
  apply: P => {
    P.incomeStreams = [{ label: "Consulting", monthly: 5000, startYear: 2029, endYear: 2033, cola: false, tax: "ordinary", kind: "work", owner: "A", selfEmployed: true }];
  },
};
// v6.16 (D-36): the same row at $430 a year — net $397.11, under §1402(b)(2)'s $400 floor. NOT a flip fixture (flips: []): t29 drives it
// directly to prove the row reads the floor rather than "any self-employed row".
HOUSEHOLDS.selfEmployedFloor = {
  why: "a self-employed row whose net earnings stay under the $400 floor",
  flips: [],
  apply: P => {
    P.incomeStreams = [{ label: "Side gig", monthly: 430 / 12, startYear: 2029, endYear: 2033, cola: false, tax: "ordinary", kind: "work", owner: "A", selfEmployed: true }];
  },
};

// v6.17 (D-38): a home move whose next home costs more than the old one nets — the field differs from the old $130,000 constant.
HOUSEHOLDS.homeMoveNeg = {
  why: "a home move that takes cash from the portfolio at retirement (the next home costs more)",
  flips: ["home_move"],
  apply: P => { P.homeMoveCash = -105000; },
};
// v6.17 (D-38): no home move at all. NOT a flip fixture of its own (flips: []): t29 drives it directly — $0 must also read clear.
HOUSEHOLDS.homeMoveNone = {
  why: "no home move — nothing added at retirement",
  flips: [],
  apply: P => { P.homeMoveCash = 0; },
};

export function build(G, name) {
  const P = JSON.parse(JSON.stringify(G.PORTFOLIO()));
  HOUSEHOLDS[name].apply(P);
  return P;
}
