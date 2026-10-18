// v617_spending.mjs — v6.17's spending model, written as an expense table (v6.18, D-41; docs/SCOPE_D41_ENGINE_D_SPENDING_V618.md).
//
// WHY THIS EXISTS. v6.18 changed how Engine D reads the expense table (the June 2029 / June 2031 snapshots → each year's own months
// and one-time rows), and that moved every figure computed from Engine D's draws on the example's table — 38 pinned checks across ten
// suites at the probe. A re-pinned figure is only evidence if the move is ATTRIBUTABLE to that change alone. This table makes the claim
// executable: through v6.17 Engine D spent EARLY (the table at "2029-06") in every year before spouse B's Medicare year and FULL (the
// table at "2031-06") from it, ×12, inflated, × the survivor factor; a table holding exactly those two monthly rows, split at January
// of that Medicare year, with no one-time row, makes v6.18's year-by-year read spend the same amounts. So a v6.18 check that feeds
// this table must reproduce the v6.17 figure — and then the v6.18 figure on the real table differs from it by the spending change only.
// (The survivor years agree to the last bits of a double, not bit for bit: v6.17 applied the factor after inflating, v6.18 before —
// t81 D-2b measures 1.5e-11 on a year's spending — so reproduced lifetime totals are compared rounded to the dollar, as pinned.)
//
// Usage: withV617Spending(g, P, () => g.computeWithdrawalPlan({...}))  — loads P with the table, runs fn, then restores P with the
// table that was loaded before (so a suite that never passes `expenses` keeps its example table afterwards).
const clone = o => JSON.parse(JSON.stringify(o));
export const V617_MONTHS = ["2029-06", "2031-06"];   // the two months v6.17 typed in (L91–92, L97–98)
const at = (X, d) => X.reduce((s, e) => s + (e.freq !== "once" && d >= e.start && d <= e.end ? +e.amount : 0), 0);
// X: the real table to snapshot (default: the one loaded). Pass it explicitly when the loaded table may already BE a v6.17 table — the
// split year (spouse B's Medicare year, spouse A's for a single plan) belongs to the plan loaded now, the amounts to the real table.
export function v617Table(G, X = G.EXPENSES()) {
  const MB = G.PLAN_TIMELINE().medicareB.year;
  return [
    { cat: "Housing", name: "v6.17 EARLY snapshot", amount: at(X, V617_MONTHS[0]), freq: "monthly", start: "1900-01", end: `${MB - 1}-12` },
    { cat: "Housing", name: "v6.17 FULL snapshot", amount: at(X, V617_MONTHS[1]), freq: "monthly", start: `${MB}-01`, end: "2199-12" }];
}
export function withV617Spending(G, P, fn) {
  const ex0 = clone(G.EXPENSES());
  G.applyLoadedData({ portfolio: clone(P), expenses: clone(ex0) });
  const tbl = v617Table(G);
  G.applyLoadedData({ portfolio: clone(P), expenses: tbl });
  try { return fn(); } finally { G.applyLoadedData({ portfolio: clone(P), expenses: ex0 }); }
}
