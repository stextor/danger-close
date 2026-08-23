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
    flips: ["ssB_claim"],
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
  // Clears the income-stream row.
  streams: {
    why: "an ordinary income stream — the stream paths become reachable",
    flips: ["income_streams"],
    apply: P => {
      P.incomeStreams = [{ label: "Rental", monthly: 500, startYear: 2029, endYear: 9999, cola: false, tax: "ordinary" }];
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

export function build(G, name) {
  const P = JSON.parse(JSON.stringify(G.PORTFOLIO()));
  HOUSEHOLDS[name].apply(P);
  return P;
}
