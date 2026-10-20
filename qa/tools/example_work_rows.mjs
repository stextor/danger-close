// example_work_rows.mjs — the built-in spouse-B work, written out as job rows (v6.23 — D-49; docs/SCOPE_D49_WORK_TAPER_V623.md §0.6)
//
// Through v6.22 spouseBWorkTaper paid $20,000, $18,000 and $15,000 of spouse-B wages in the retirement year and the two after to EVERY
// plan with no income streams. Several married fixtures ran on those wages without saying so (an empty `incomeStreams`, "to neutralise
// global income streams", turned the taper ON, not off). From v6.23 only the example household by its holdings is paid them, so those
// fixtures would lose the wages their pinned figures were derived on.
//
// Each such fixture now DECLARES the wages it ran on, as these rows — the v6.22 precedent (t20's Social Security, DC-6). Measured at the
// v6.23 build: these rows equal the taper in Engines B and C, the Monte Carlo tax schedule and Engine D's totals; only Engine D's
// `work_y` field differs (the taper's own column), so every pinned figure stays on both legs. On the v6.22 leg the rows switch the taper
// off and replace it with the same amounts; on v6.23 they replace nothing.
//
// A SINGLE fixture must NOT be given these rows: that would re-encode the very wages v6.23 removes (and a single plan drops B-owned rows
// anyway — streamsMonthlyAt). Single fixtures are re-pinned instead, with the attribution in the CHANGELOG.
export const exampleWorkRows = retireYear => [
  { label: "Spouse B part-time work (the pre-v6.23 built-in schedule, stated)", kind: "work", owner: "B", monthly: 20000 / 12, startYear: retireYear, endYear: retireYear, cola: false, tax: "ordinary" },
  { label: "Spouse B part-time work (the pre-v6.23 built-in schedule, stated)", kind: "work", owner: "B", monthly: 1500, startYear: retireYear + 1, endYear: retireYear + 1, cola: false, tax: "ordinary" },
  { label: "Spouse B part-time work (the pre-v6.23 built-in schedule, stated)", kind: "work", owner: "B", monthly: 1250, startYear: retireYear + 2, endYear: retireYear + 2, cola: false, tax: "ordinary" },
];
