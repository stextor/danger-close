// state_sets.cjs — the SUITE-SIDE single source of truth for the income-limited state set.
// SCOPE_STATE_SET_SELECTOR.md §7.6, STAGE 1 (2026-09-15). ASSERTS NOTHING; counted in no total.
//
// WHY THIS EXISTS. Until this file, three places in the suite decided which states are
// "income-limited in law" by executing a regex against each row's user-facing NOTE, and six more
// carried their own verbatim copy of that regex. A correction to one copy left the others wrong —
// which is exactly what happened to `f6_probe.cjs`: `t29` gained `!r.exclTest` at v5.68 and the probe
// did not, so for three releases the probe reported the COMPLEMENT of the gate it probes (§7.3).
//
// ⚠ STAGE 2 (v5.72, SCOPE_IMPORT_HARDENING S-2): membership is now DATA. Each STATE_RULES row that is
//   income-limited in law carries `incomeLimitedInLaw: true`, and `inLaw(RULES)` reads it. The hand list
//   survives ONLY as the fallback for legs built before the field existed (v5.64..v5.71), where it was the
//   truth, and as state_sets_check S-1's literal, where a second copy is the assertion. Maine joined at
//   v5.72 (D-8): income-limited in law from TY2025, not yet conditioned in the model.
//   ⚠ The fallback is chosen by DATA (does any row carry the field?), not by version. A v5.72+ leg that lost
//   every field would silently fall back to the five — state_sets_check S-1b asserts the field is present
//   from v572, which is what makes that loud.
//
// WHAT IT EXPORTS
//   inLaw(RULES)  the in-law states for this leg, sorted: from the field when any row carries it, else
//                 IN_LAW_PRE_V572.
//   hasField(RULES)  whether any row carries `incomeLimitedInLaw` (own property).
//   IN_LAW_PRE_V572  the five states the hand list named through v5.71, from
//                 docs/FINDINGS-v5_63-state-statutes.md. Frozen; never extended — new statutes go in the data.
//   NOTE_MATCHER  the ONE copy of the phrase pattern. The six PINS (t10 [BY DECISION v5.59] x2,
//                 t35 D-7a..D-7d) still EXECUTE it against notes — for them, executing the regex
//                 against prose IS the assertion: a state must not leave the set by REWORDING
//                 (the v5.54 New Jersey defect). Do not convert those sites to inLaw().
//   isConditioned(row)  the ONE predicate for "the model conditions this exclusion": a truthy
//                 `exclTest`. `t29` wrote `!r.exclTest` and `t35` wrote `=== undefined`; they agreed
//                 only because every row carried a function or nothing. `exclTest: null`/`false`
//                 would have split them. This reading is `t29`'s, the one `boundaries.mjs` used.
//   unconverted(RULES)  inLaw(RULES) members that carry a non-zero `excl65` and are NOT conditioned —
//                 "income-limited in law, applied unconditionally in the model". Sorted.
//                 `excl65 > 0` is kept deliberately: it is what both prose selectors required, it is
//                 why CT (excl65 0 before v5.65) was never in the set, and keeping it reproduces the
//                 historic per-leg sets t29 F-6a/b and t35 D-7 gate on (v5.66..v5.68).
//   proseSelected(RULES)  rows OUTSIDE inLaw(RULES) with `excl65 > 0` whose note matches NOTE_MATCHER —
//                 the DRIFT GUARD's population (§7.6). A populate release that adds an
//                 income-limited statute without marking its row lands here and turns red.
//
// ⚠ RESIDUAL RISK, stated plainly: the field is still set BY HAND, in the app, from the statutes — and the
//   drift guard below cannot see a statute whose note avoids the phrase. That is how Maine went unlisted
//   until 2026-09-15. (Stage-1 wording, kept for its record:) IN_LAW was hand-maintained here.
//   The drift guard is PHRASE-BASED, so a note that describes an income limit in other words
//   ("income-based", "phaseout above $X") is invisible to it. Stage 2 (`incomeLimitedInLaw` on the
//   STATE_RULES rows) is what retires this file's list.
//
// CommonJS on purpose, so the .mjs suites (via createRequire) and f6_probe.cjs can both read it.
// Resolve it with pick(join(HERE,"tools","state_sets.cjs"), join(HERE,"state_sets.cjs")).
"use strict";

const IN_LAW_PRE_V572 = Object.freeze(["CT", "NJ", "NM", "RI", "VA"]);
const _own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const hasField = (RULES) => Object.keys(RULES || {}).some((c) => _own(RULES[c], "incomeLimitedInLaw"));
const inLaw = (RULES) => hasField(RULES)
  ? Object.keys(RULES).filter((c) => RULES[c] && RULES[c].incomeLimitedInLaw === true).sort()
  : IN_LAW_PRE_V572.slice();
const NOTE_MATCHER = /income[- ]limited|income limit/i;

const isConditioned = (row) => !!(row && row.exclTest);

const unconverted = (RULES) =>
  inLaw(RULES).filter((c) => RULES && RULES[c] && (RULES[c].excl65 || 0) > 0 && !isConditioned(RULES[c]))
    .slice().sort();

const proseSelected = (RULES) =>
  Object.keys(RULES || {})
    .filter((c) => !inLaw(RULES).includes(c) && (RULES[c].excl65 || 0) > 0 && NOTE_MATCHER.test(RULES[c].note || ""))
    .sort();

module.exports = { IN_LAW_PRE_V572, hasField, inLaw, NOTE_MATCHER, isConditioned, unconverted, proseSelected };
