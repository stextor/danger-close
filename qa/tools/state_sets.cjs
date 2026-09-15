// state_sets.cjs — the SUITE-SIDE single source of truth for the income-limited state set.
// SCOPE_STATE_SET_SELECTOR.md §7.6, STAGE 1 (2026-09-15). ASSERTS NOTHING; counted in no total.
//
// WHY THIS EXISTS. Until this file, three places in the suite decided which states are
// "income-limited in law" by executing a regex against each row's user-facing NOTE, and six more
// carried their own verbatim copy of that regex. A correction to one copy left the others wrong —
// which is exactly what happened to `f6_probe.cjs`: `t29` gained `!r.exclTest` at v5.68 and the probe
// did not, so for three releases the probe reported the COMPLEMENT of the gate it probes (§7.3).
//
// WHAT IT EXPORTS
//   IN_LAW        the five states whose 65+/retirement exclusion is income-limited IN LAW.
//                 Hand-maintained, from docs/FINDINGS-v5_63-state-statutes.md. Membership is a
//                 statutory fact and is NO LONGER derived from prose.
//   NOTE_MATCHER  the ONE copy of the phrase pattern. The six PINS (t10 [BY DECISION v5.59] x2,
//                 t35 D-7a..D-7d) still EXECUTE it against notes — for them, executing the regex
//                 against prose IS the assertion: a state must not leave the set by REWORDING
//                 (the v5.54 New Jersey defect). Do not convert those sites to IN_LAW.
//   isConditioned(row)  the ONE predicate for "the model conditions this exclusion": a truthy
//                 `exclTest`. `t29` wrote `!r.exclTest` and `t35` wrote `=== undefined`; they agreed
//                 only because every row carried a function or nothing. `exclTest: null`/`false`
//                 would have split them. This reading is `t29`'s, the one `boundaries.mjs` used.
//   unconverted(RULES)  IN_LAW members that carry a non-zero `excl65` and are NOT conditioned —
//                 "income-limited in law, applied unconditionally in the model". Sorted.
//                 `excl65 > 0` is kept deliberately: it is what both prose selectors required, it is
//                 why CT (excl65 0 before v5.65) was never in the set, and keeping it reproduces the
//                 historic per-leg sets t29 F-6a/b and t35 D-7 gate on (v5.66..v5.68).
//   proseSelected(RULES)  rows OUTSIDE IN_LAW with `excl65 > 0` whose note matches NOTE_MATCHER —
//                 the DRIFT GUARD's population (§7.6). A populate release that adds an
//                 income-limited statute without updating IN_LAW lands here and turns red.
//
// ⚠ RESIDUAL RISK, stated plainly (§7.6): IN_LAW is hand-maintained here, not read from app data.
//   The drift guard is PHRASE-BASED, so a note that describes an income limit in other words
//   ("income-based", "phaseout above $X") is invisible to it. Stage 2 (`incomeLimitedInLaw` on the
//   STATE_RULES rows) is what retires this file's list.
//
// CommonJS on purpose, so the .mjs suites (via createRequire) and f6_probe.cjs can both read it.
// Resolve it with pick(join(HERE,"tools","state_sets.cjs"), join(HERE,"state_sets.cjs")).
"use strict";

const IN_LAW = Object.freeze(["CT", "NJ", "NM", "RI", "VA"]);
const NOTE_MATCHER = /income[- ]limited|income limit/i;

const isConditioned = (row) => !!(row && row.exclTest);

const unconverted = (RULES) =>
  IN_LAW.filter((c) => RULES && RULES[c] && (RULES[c].excl65 || 0) > 0 && !isConditioned(RULES[c]))
    .slice().sort();

const proseSelected = (RULES) =>
  Object.keys(RULES || {})
    .filter((c) => !IN_LAW.includes(c) && (RULES[c].excl65 || 0) > 0 && NOTE_MATCHER.test(RULES[c].note || ""))
    .sort();

module.exports = { IN_LAW, NOTE_MATCHER, isConditioned, unconverted, proseSelected };
